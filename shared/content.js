// Načítání osnovy a modulů z disku (jen Node). Formát je v docs/kontrakt.md.
import fs from 'node:fs';
import path from 'node:path';
import { parseStep, parseQuiz, parseLesson, ParseError, langOf, RUNTIMES } from './parse.js';

export const MODULE_TYPES = ['lesson', 'workshop', 'lab', 'quiz', 'project'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.nuxt', '.output', '.vite', 'coverage']);
const MAX_FILE = 1024 * 1024;

function readJson(file, id) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); }
  catch { throw new ParseError(`chybí soubor ${path.basename(file)}`, { id }); }
  try { return JSON.parse(text); }
  catch (e) { throw new ParseError(`neplatný JSON v ${path.basename(file)}: ${e.message}`, { id }); }
}

/** Rekurzivně načte textové soubory adresáře: [{ name (relativní, s /), lang, content }]. */
export function readTextTree(dir) {
  const out = [];
  const walk = (abs, rel) => {
    for (const entry of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const absChild = path.join(abs, entry.name);
      const relChild = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(absChild, relChild);
      else if (entry.isFile()) {
        if (fs.statSync(absChild).size > MAX_FILE) continue;
        const buf = fs.readFileSync(absChild);
        if (buf.includes(0)) continue;
        out.push({ name: relChild, lang: langOf(entry.name), content: buf.toString('utf8') });
      }
    }
  };
  if (fs.existsSync(dir)) walk(dir, '');
  return out;
}

function readSection(contentDir, sectionId) {
  const dir = path.join(contentDir, sectionId);
  if (!fs.existsSync(path.join(dir, 'section.json'))) return null;
  const s = readJson(path.join(dir, 'section.json'), sectionId);
  if (!s.title || !Array.isArray(s.modules)) {
    throw new ParseError('section.json potřebuje "title" a pole "modules"', { id: sectionId });
  }
  return s;
}

function readModuleMeta(contentDir, sectionId, moduleId) {
  const id = `${sectionId}/${moduleId}`;
  if (!SLUG.test(moduleId)) throw new ParseError(`neplatný slug modulu "${moduleId}"`, { id });
  const m = readJson(path.join(contentDir, sectionId, moduleId, 'module.json'), id);
  if (!MODULE_TYPES.includes(m.type)) throw new ParseError(`neznámý typ modulu "${m.type}"`, { id });
  if (!m.title) throw new ParseError('module.json potřebuje "title"', { id });
  if (m.runtime && !RUNTIMES.includes(m.runtime)) throw new ParseError(`neznámý runtime "${m.runtime}"`, { id });
  return m;
}

function stepFiles(contentDir, sectionId, moduleId) {
  const dir = path.join(contentDir, sectionId, moduleId, 'steps');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /^\d{3}\.md$/.test(f)).sort();
}

/**
 * Celá osnova pro přehled. Sekce, které v osnova.json jsou, ale na disku ještě ne,
 * mají available: false a prázdné moduly.
 */
export function loadCurriculum(contentDir) {
  const osnova = readJson(path.join(contentDir, 'osnova.json'), 'osnova.json');
  if (!Array.isArray(osnova.parts)) throw new ParseError('osnova.json potřebuje pole "parts"', { id: 'osnova.json' });
  return {
    parts: osnova.parts.map((part) => ({
      id: part.id,
      title: part.title,
      summary: part.summary ?? '',
      sections: (part.sections ?? []).map((entry) => {
        const sectionId = typeof entry === 'string' ? entry : entry.id;
        if (typeof sectionId !== 'string' || !SLUG.test(sectionId)) {
          throw new ParseError(`neplatný slug sekce "${sectionId}"`, { id: 'osnova.json' });
        }
        const planned = typeof entry === 'string' ? {} : entry;
        const s = readSection(contentDir, sectionId);
        if (!s) {
          return { id: sectionId, title: planned.title ?? sectionId, intro: planned.summary ?? '', available: false, modules: [] };
        }
        return {
          id: sectionId,
          title: s.title,
          intro: s.intro ?? '',
          available: true,
          modules: s.modules.map((moduleId) => {
            const m = readModuleMeta(contentDir, sectionId, moduleId);
            return {
              id: `${sectionId}/${moduleId}`,
              type: m.type,
              title: m.title,
              summary: m.summary ?? '',
              minutes: m.minutes ?? null,
              stepCount: m.type === 'workshop' ? stepFiles(contentDir, sectionId, moduleId).length : 1,
            };
          }),
        };
      }),
    })),
  };
}

/** Všechny existující moduly: [{ sectionId, moduleId }] v pořadí osnovy. */
export function listModules(contentDir) {
  return loadCurriculum(contentDir).parts.flatMap((p) =>
    p.sections.flatMap((s) => s.modules.map((m) => {
      const [sectionId, moduleId] = m.id.split('/');
      return { sectionId, moduleId };
    })));
}

function stripSolution(item) {
  if (!item) return item;
  const { solution, ...rest } = item;
  return rest;
}

/**
 * Detail modulu včetně obsahu.
 * @param {{ includeSolutions?: boolean }} opts — API je posílá jen na požádání, verify vždy.
 */
export function loadModule(contentDir, sectionId, moduleId, { includeSolutions = true } = {}) {
  if (!SLUG.test(sectionId)) throw new ParseError(`neplatný slug sekce "${sectionId}"`, { id: `${sectionId}/${moduleId}` });
  const m = readModuleMeta(contentDir, sectionId, moduleId);
  const id = `${sectionId}/${moduleId}`;
  const dir = path.join(contentDir, sectionId, moduleId);
  const read = (name) => {
    try { return fs.readFileSync(path.join(dir, name), 'utf8'); }
    catch { throw new ParseError(`chybí ${name}`, { id }); }
  };
  const base = {
    id, sectionId, moduleId,
    type: m.type, title: m.title, summary: m.summary ?? '', minutes: m.minutes ?? null,
    runtime: m.runtime ?? 'dom',
  };
  const keep = includeSolutions ? (x) => x : stripSolution;

  switch (m.type) {
    case 'workshop': {
      const files = stepFiles(contentDir, sectionId, moduleId);
      if (files.length === 0) throw new ParseError('workshop nemá žádné kroky v steps/NNN.md', { id });
      const steps = files.map((f, i) => keep(parseStep(read(`steps/${f}`), {
        id: `${id}/${f.slice(0, 3)}`, defaultRuntime: base.runtime, defaultTitle: `Krok ${i + 1}`,
      })));
      return { ...base, steps };
    }
    case 'lab':
      // Lab smí seed i řešení vynechat (kontrakt kap. 3) — uživatel pak začíná s prázdnými soubory.
      return { ...base, lab: keep(parseStep(read('lab.md'), { id, defaultRuntime: base.runtime, defaultTitle: m.title, requireSeed: false })) };
    case 'quiz':
      return { ...base, quiz: parseQuiz(read('quiz.md'), { id }) };
    case 'lesson':
      return { ...base, lesson: parseLesson(read('lesson.md'), { id }) };
    case 'project': {
      const p = parseStep(read('project.md'), { id, defaultRuntime: base.runtime, defaultTitle: m.title, requireSeed: false });
      const seed = readTextTree(path.join(dir, 'starter')).map((f) => ({ ...f, region: null }));
      const solution = readTextTree(path.join(dir, 'solution'));
      if (solution.length === 0) throw new ParseError('projekt nemá složku solution/', { id });
      return { ...base, project: keep({ ...p, seed, solution }) };
    }
  }
}
