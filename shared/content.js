// Načítání osnovy a modulů z disku (jen Node). Formát je v docs/kontrakt.md.
import fs from 'node:fs';
import path from 'node:path';
import { parseStep, parseQuiz, parseLesson, parseCards, parseTerms, ParseError, langOf, RUNTIMES } from './parse.js';
import { createKeyAllocator } from './answers.js';
import { parseItemId } from './refs.js';

export const MODULE_TYPES = ['lesson', 'workshop', 'lab', 'quiz', 'project'];
/** Úroveň sekce v osnově: jádro kurzu, nebo nepovinné rozšíření. */
export const SECTION_LEVELS = ['jadro', 'rozsireni'];
/** Volitelné soubory sekce, které se načítají jako surový text (parsují je nástroje). */
export const SECTION_EXTRAS = { cards: 'cards.md', pojmy: 'pojmy.md', tahak: 'tahak.md' };
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

function sectionLevel(value, sectionId) {
  if (value === undefined || value === null) return null;
  if (!SECTION_LEVELS.includes(value)) {
    throw new ParseError(`neznámá úroveň "${value}" (povolené: ${SECTION_LEVELS.join(', ')})`, { id: sectionId });
  }
  return value;
}

/**
 * Celá osnova pro přehled. Sekce, které v osnova.json jsou, ale na disku ještě ne,
 * mají available: false a prázdné moduly.
 *
 * Navíc propouští (kontrakt vlny 2):
 * - `section.uroven` — 'jadro' | 'rozsireni' z položky osnova.json (slug = 'jadro'), jiná hodnota = ParseError
 * - `section.outcomes` — pole „Po sekci umíš" ze section.json tak, jak je (bez klíčů), výchozí []
 * - `curriculum.doporucenaTrasa` — pole id sekcí z osnova.json, [] když chybí (kontrakt kap. 2.1)
 */
export function loadCurriculum(contentDir) {
  const osnova = readJson(path.join(contentDir, 'osnova.json'), 'osnova.json');
  if (!Array.isArray(osnova.parts)) throw new ParseError('osnova.json potřebuje pole "parts"', { id: 'osnova.json' });
  const parts = osnova.parts.map((part) => ({
    id: part.id,
    title: part.title,
    summary: part.summary ?? '',
    sections: (part.sections ?? []).map((entry) => {
      const sectionId = typeof entry === 'string' ? entry : entry?.id;
      if (typeof sectionId !== 'string' || !SLUG.test(sectionId)) {
        throw new ParseError(`neplatný slug sekce "${sectionId}"`, { id: 'osnova.json' });
      }
      const planned = typeof entry === 'string' ? {} : entry;
      const s = readSection(contentDir, sectionId);
      const uroven = sectionLevel(planned.uroven, sectionId) ?? 'jadro';
      if (!s) {
        return {
          id: sectionId, title: planned.title ?? sectionId, intro: planned.summary ?? '', available: false, modules: [],
          uroven, outcomes: [],
        };
      }
      return {
        id: sectionId,
        title: s.title,
        intro: s.intro ?? '',
        available: true,
        uroven,
        outcomes: Array.isArray(s.outcomes) ? s.outcomes : [],
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
  }));

  let doporucenaTrasa = [];
  if (osnova.doporucenaTrasa !== undefined) {
    if (!Array.isArray(osnova.doporucenaTrasa) || !osnova.doporucenaTrasa.every((id) => typeof id === 'string')) {
      throw new ParseError('"doporucenaTrasa" musí být pole id sekcí', { id: 'osnova.json' });
    }
    doporucenaTrasa = [...osnova.doporucenaTrasa];
  }
  return { parts, doporucenaTrasa };
}

/**
 * Volitelné soubory sekce jako surový text: { cards, pojmy, tahak } (string, nebo null když soubor chybí).
 * Formát (kontrakt kap. 2) parsují nástroje, které soubory používají.
 */
export function loadSectionExtras(contentDir, sectionId) {
  if (typeof sectionId !== 'string' || !SLUG.test(sectionId)) {
    throw new ParseError(`neplatný slug sekce "${sectionId}"`, { id: String(sectionId) });
  }
  const out = {};
  for (const [key, fileName] of Object.entries(SECTION_EXTRAS)) {
    try {
      out[key] = fs.readFileSync(path.join(contentDir, sectionId, fileName), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      out[key] = null;
    }
  }
  return out;
}

/**
 * Stránka sekce: výstupy s klíči, tahák, pojmy a karty (kontrakt kap. 2.7).
 * @returns {null | { id, title, intro, outcomes: { key, text, links }[], cheatsheet: string|null, terms: Term[], cards: Card[] }}
 *   null = sekce na disku není (routa vrátí 404). Rozbitý soubor sekce vyhodí ParseError.
 */
export function loadSection(contentDir, sectionId) {
  const extras = loadSectionExtras(contentDir, sectionId);
  const section = readSection(contentDir, sectionId);
  if (!section) return null;
  return {
    id: sectionId,
    title: section.title,
    intro: section.intro ?? '',
    outcomes: sectionOutcomes(section, sectionId),
    cheatsheet: extras.tahak,
    terms: extras.pojmy === null ? [] : parseTerms(extras.pojmy, { id: sectionId }).terms,
    cards: extras.cards === null ? [] : parseCards(extras.cards, { id: sectionId }).cards,
  };
}

/**
 * Výstupy „Po sekci umíš" ze section.json s klíči `hashKey(text)` (kontrakt kap. 2.2).
 * @param {object} section  obsah section.json
 */
export function sectionOutcomes(section, sectionId) {
  if (section.outcomes === undefined) return [];
  if (!Array.isArray(section.outcomes)) throw new ParseError('"outcomes" v section.json musí být pole', { id: sectionId });
  const nextKey = createKeyAllocator();
  return section.outcomes.map((outcome, index) => {
    if (typeof outcome?.text !== 'string' || !outcome.text.trim()) {
      throw new ParseError(`výstup ${index + 1} v section.json potřebuje "text"`, { id: sectionId });
    }
    const links = outcome.links ?? [];
    if (!Array.isArray(links) || !links.every((link) => typeof link === 'string')) {
      throw new ParseError(`výstup ${index + 1} v section.json: "links" musí být pole referencí`, { id: sectionId });
    }
    return { key: nextKey(outcome.text), text: outcome.text, links: [...links] };
  });
}

/** Pojmy všech dostupných sekcí v pořadí osnovy (kontrakt kap. 2.7): { terms: Term[] }. */
export function loadTerms(contentDir) {
  const terms = [];
  for (const part of loadCurriculum(contentDir).parts) {
    for (const section of part.sections) {
      if (!section.available) continue;
      const { pojmy } = loadSectionExtras(contentDir, section.id);
      if (pojmy !== null) terms.push(...parseTerms(pojmy, { id: section.id }).terms);
    }
  }
  return { terms };
}

/** Všechny existující moduly: [{ sectionId, moduleId }] v pořadí osnovy. */
export function listModules(contentDir) {
  return loadCurriculum(contentDir).parts.flatMap((p) =>
    p.sections.flatMap((s) => s.modules.map((m) => {
      const [sectionId, moduleId] = m.id.split('/');
      return { sectionId, moduleId };
    })));
}

/** Krok, lab nebo projekt bez řešení a jiných přístupů (API je bez `?solution=1` neposílá). */
function stripSolution(item) {
  if (!item) return item;
  const { solution, approaches, ...rest } = item;
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
        id: `${id}/${f.slice(0, 3)}`, defaultRuntime: base.runtime, defaultTitle: `Krok ${i + 1}`, fileKind: 'step',
      })));
      return { ...base, steps };
    }
    case 'lab': {
      // Lab smí seed i řešení vynechat (kontrakt kap. 3) — uživatel pak začíná s prázdnými soubory.
      const lab = parseStep(read('lab.md'), { id, defaultRuntime: base.runtime, defaultTitle: m.title, fileKind: 'lab' });
      // Bez řešení zůstane aspoň počet přístupů, aby UI vědělo, jestli nabídnout „Jiné přístupy" (kap. 3.8).
      return { ...base, lab: includeSolutions ? lab : { ...stripSolution(lab), approachesCount: lab.approaches.length } };
    }
    case 'quiz':
      return { ...base, quiz: parseQuiz(read('quiz.md'), { id }) };
    case 'lesson':
      return { ...base, lesson: parseLesson(read('lesson.md'), { id }) };
    case 'project': {
      const p = parseStep(read('project.md'), { id, defaultRuntime: base.runtime, defaultTitle: m.title, fileKind: 'project' });
      const seed = readTextTree(path.join(dir, 'starter')).map((f) => ({ ...f, region: null }));
      const solution = readTextTree(path.join(dir, 'solution'));
      if (solution.length === 0) throw new ParseError('projekt nemá složku solution/', { id });
      return { ...base, project: keep({ ...p, seed, solution }) };
    }
  }
}

// ---------------------------------------------------------------------------
// Převod id položky opakování a pokusů na obsah (kontrakt kap. 2.10, 12.3)
// ---------------------------------------------------------------------------

/** Načte modul, nebo vrátí null, když na disku není. Rozbitý obsah vyhodí ParseError. */
function moduleOrNull(contentDir, target) {
  const [sectionId, moduleId] = target.split('/');
  if (!moduleId || !fs.existsSync(path.join(contentDir, sectionId, moduleId, 'module.json'))) return null;
  return loadModule(contentDir, sectionId, moduleId, { includeSolutions: false });
}

/** Krok workshopu (`s/m/NNN`) nebo lab (`s/m`) jako { module, item }, jinak null. */
function stepOrLab(contentDir, target) {
  const module = moduleOrNull(contentDir, target.split('/').slice(0, 2).join('/'));
  if (!module) return null;
  const isStep = target.split('/').length === 3;
  if (isStep && module.type === 'workshop') {
    const item = module.steps.find((step) => step.id === target);
    return item ? { module, item } : null;
  }
  if (!isStep && module.type === 'lab') return { module, item: module.lab };
  return null;
}

/** Otázky lekce, které se hodnotí (`:::check` bez pretestu a `# --questions--`), v pořadí souboru. */
function lessonQuestions(lesson) {
  const checks = (lesson.blocks ?? []).filter((block) => block.kind === 'check' && !block.pretest).map((block) => block.question);
  return [...checks, ...(lesson.questions ?? [])];
}

/**
 * Obsah položky podle id z kontraktu kap. 2.10 — společný podklad pro opakování (ReviewItem bez `box`
 * a `due`, kap. 12.3), pokusy (ověření id `q:`) a statistiky.
 *
 * @returns {null | {
 *   id: string,
 *   type: 'question' | 'card' | 'step' | 'explain',
 *   source: { sectionId: string, moduleId: string | null, title: string, see: string[] },
 *   content: object,   // question: Question (+ codeSet u sady # --code--); card: Card;
 *                      // step: { stepId, runtime, title, hints, seed, meta }; explain: { prompt, point, model }
 * }}
 * null = id je neplatné, nebo položka v obsahu není (osiřelá). Rozbitý soubor obsahu vyhodí ParseError,
 * aby volající položku omylem nesmazal. `outcome:` je plánované (vlna 3) → null.
 */
export function resolveContentItem(contentDir, id) {
  const parsed = parseItemId(id);
  if (!parsed) return null;
  const { type, target, key } = parsed;
  const sectionId = target.split('/')[0];
  const depth = target.split('/').length;

  if (type === 'q' && key && depth === 2) {
    const module = moduleOrNull(contentDir, target);
    if (!module) return null;
    let question = null;
    let codeSet = null;
    if (module.type === 'quiz') {
      question = module.quiz.questions.find((q) => q.key === key) ?? null;
      if (question && Number.isInteger(question.code)) codeSet = module.quiz.codeSets?.[question.code] ?? null;
    } else if (module.type === 'lesson') {
      question = lessonQuestions(module.lesson).find((q) => q.key === key) ?? null;
    }
    if (!question) return null;
    return {
      id, type: 'question',
      source: { sectionId, moduleId: module.id, title: module.title, see: question.see ?? [] },
      content: codeSet ? { ...question, codeSet } : question,
    };
  }

  if (type === 'card' && key && depth === 1) {
    const section = readSection(contentDir, sectionId);
    const file = path.join(contentDir, sectionId, SECTION_EXTRAS.cards);
    if (!section || !fs.existsSync(file)) return null;
    const card = parseCards(fs.readFileSync(file, 'utf8'), { id: sectionId }).cards.find((c) => c.key === key);
    if (!card) return null;
    return { id, type: 'card', source: { sectionId, moduleId: null, title: section.title, see: card.see ?? [] }, content: card };
  }

  if (type === 'step' && !key && depth >= 2) {
    const found = stepOrLab(contentDir, target);
    if (!found) return null;
    const { module, item } = found;
    return {
      id, type: 'step',
      source: { sectionId, moduleId: module.id, title: item.title, see: item.see ?? [] },
      content: { stepId: target, runtime: item.runtime, title: item.title, hints: item.hints, seed: item.seed, meta: item.meta },
    };
  }

  if (type === 'explain' && key && depth >= 2) {
    const hasPoint = (block) => Array.isArray(block?.checklist) && block.checklist.some((p) => p.key === key);
    let explain = null;
    let title = '';
    let moduleId = null;
    let see = [];
    const lesson = depth === 2 ? moduleOrNull(contentDir, target) : null;
    if (lesson?.type === 'lesson') {
      explain = lesson.lesson.blocks.find((b) => b.kind === 'explain' && hasPoint(b)) ?? null;
      title = lesson.title;
      moduleId = lesson.id;
    } else {
      const found = stepOrLab(contentDir, target);
      if (found && hasPoint(found.item.explain)) {
        explain = found.item.explain;
        title = found.item.title;
        moduleId = found.module.id;
        see = found.item.see ?? [];
      }
    }
    if (!explain) return null;
    const point = explain.checklist.find((p) => p.key === key);
    return {
      id, type: 'explain',
      source: { sectionId, moduleId, title, see },
      content: { prompt: explain.prompt, point: { key: point.key, text: point.text }, model: explain.model },
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Index obsahu (hledání, kotvy, přehledy nástrojů) s mezipamětí podle mtime
// ---------------------------------------------------------------------------

/** Mezipaměť pro každý adresář obsahu: rozparsované soubory podle cesty, mtime a velikosti. */
const indexCaches = new Map();

function cacheFor(contentDir) {
  const key = path.resolve(contentDir);
  let cache = indexCaches.get(key);
  if (!cache) {
    cache = { files: new Map(), signature: null, index: null };
    indexCaches.set(key, cache);
  }
  return cache;
}

/**
 * Přečte a zpracuje soubor jen tehdy, když se od posledního čtení změnil (mtime, velikost).
 * Vrací { value } nebo { missing: true }; chybu `parse` vrací jako { error }.
 */
function readCached(cache, file, parse, signature) {
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    signature.push(`${file}:-`);
    cache.files.delete(file);
    return { missing: true };
  }
  const stamp = `${stat.mtimeMs}:${stat.size}`;
  signature.push(`${file}:${stamp}`);
  const cached = cache.files.get(file);
  if (cached && cached.stamp === stamp) return cached.result;
  let result;
  try {
    result = { value: parse(fs.readFileSync(file, 'utf8')) };
  } catch (error) {
    result = { error };
  }
  cache.files.set(file, { stamp, result });
  return result;
}

function parseJsonText(text, id) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ParseError(`neplatný JSON: ${error.message}`, { id });
  }
}

/**
 * Lehký index celého obsahu: sekce, moduly, kroky a nadpisy lekcí s kotvami.
 * Soubory se parsují jen při změně (mtime/velikost); když se nezměnilo nic,
 * vrátí se stejný objekt jako minule. Rozbitý modul index neshodí — skončí v `errors`.
 *
 * @returns {{
 *   sections: { id, partId, title, available, uroven, modules: string[], extras: { cards: boolean, pojmy: boolean, tahak: boolean } }[],
 *   modules: { id, sectionId, moduleId, type, title, summary, minutes, runtime, steps: string[] }[],
 *   steps: { id, moduleId, number, title }[],
 *   headings: { moduleId, level, text, anchor }[],   // kotvy nadpisů lekcí (úroveň 2 a 3, kontrakt kap. 2.8)
 *   errors: { id, message }[],
 * }}
 */
export function buildContentIndex(contentDir) {
  const cache = cacheFor(contentDir);
  const signature = [];
  const errors = [];
  const fail = (id, error) => errors.push({ id, message: error?.message ?? String(error) });

  const osnovaFile = path.join(contentDir, 'osnova.json');
  const osnova = readCached(cache, osnovaFile, (text) => parseJsonText(text, 'osnova.json'), signature);
  if (osnova.missing) throw new ParseError('chybí soubor osnova.json', { id: 'osnova.json' });
  if (osnova.error) throw osnova.error;
  if (!Array.isArray(osnova.value.parts)) throw new ParseError('osnova.json potřebuje pole "parts"', { id: 'osnova.json' });

  const sectionEntries = [];
  for (const part of osnova.value.parts) {
    for (const entry of part.sections ?? []) {
      const id = typeof entry === 'string' ? entry : entry?.id;
      if (typeof id !== 'string' || !SLUG.test(id)) {
        fail('osnova.json', new ParseError(`neplatný slug sekce "${id}"`));
        continue;
      }
      sectionEntries.push({ id, partId: part.id, planned: typeof entry === 'string' ? {} : entry });
    }
  }

  // Seznam souborů (a tím podpis) závisí i na adresářích kroků — ty se čtou pokaždé.
  const collected = { sections: [], modules: [], steps: [], headings: [] };
  for (const { id: sectionId, partId, planned } of sectionEntries) {
    const dir = path.join(contentDir, sectionId);
    const section = readCached(cache, path.join(dir, 'section.json'), (text) => parseJsonText(text, sectionId), signature);
    const extras = {};
    for (const [key, fileName] of Object.entries(SECTION_EXTRAS)) {
      extras[key] = fs.existsSync(path.join(dir, fileName));
      signature.push(`${sectionId}/${fileName}:${extras[key]}`);
    }
    if (section.error) fail(sectionId, section.error);
    const data = section.value;
    const available = Boolean(data && data.title && Array.isArray(data.modules));
    if (data && !available) fail(sectionId, new ParseError('section.json potřebuje "title" a pole "modules"'));
    const uroven = SECTION_LEVELS.includes(planned.uroven) ? planned.uroven : 'jadro';
    const moduleIds = available ? data.modules.filter((m) => typeof m === 'string' && SLUG.test(m)) : [];
    collected.sections.push({
      id: sectionId,
      partId,
      title: available ? data.title : planned.title ?? sectionId,
      available,
      uroven,
      modules: moduleIds.map((m) => `${sectionId}/${m}`),
      extras,
    });

    for (const moduleId of moduleIds) indexModule(cache, contentDir, sectionId, moduleId, collected, signature, fail);
  }

  const key = signature.join('\n');
  if (cache.signature === key && cache.index) return cache.index;
  cache.signature = key;
  cache.index = { ...collected, errors };
  return cache.index;
}

function indexModule(cache, contentDir, sectionId, moduleId, collected, signature, fail) {
  const id = `${sectionId}/${moduleId}`;
  const dir = path.join(contentDir, sectionId, moduleId);
  const meta = readCached(cache, path.join(dir, 'module.json'), (text) => parseJsonText(text, id), signature);
  if (meta.missing) return fail(id, new ParseError('chybí soubor module.json'));
  if (meta.error) return fail(id, meta.error);
  const m = meta.value;
  if (!MODULE_TYPES.includes(m?.type) || !m.title) return fail(id, new ParseError('module.json potřebuje platný "type" a "title"'));

  const runtime = m.runtime ?? 'dom';
  const entry = {
    id, sectionId, moduleId,
    type: m.type, title: m.title, summary: m.summary ?? '', minutes: m.minutes ?? null, runtime,
    steps: [],
  };
  collected.modules.push(entry);

  if (m.type === 'workshop') {
    const names = stepFiles(contentDir, sectionId, moduleId);
    signature.push(`${id}/steps:${names.join(',')}`);
    names.forEach((name, index) => {
      const stepId = `${id}/${name.slice(0, 3)}`;
      const defaultTitle = `Krok ${index + 1}`;
      const step = readCached(cache, path.join(dir, 'steps', name),
        (text) => parseStep(text, { id: stepId, defaultRuntime: runtime, defaultTitle }).title, signature);
      if (step.error) fail(stepId, step.error);
      entry.steps.push(stepId);
      collected.steps.push({ id: stepId, moduleId: id, number: index + 1, title: step.value ?? defaultTitle });
    });
  }

  if (m.type === 'lesson') {
    const lesson = readCached(cache, path.join(dir, 'lesson.md'), (text) => parseLesson(text, { id }).headings, signature);
    if (lesson.missing) fail(id, new ParseError('chybí lesson.md'));
    else if (lesson.error) fail(id, lesson.error);
    for (const heading of lesson.value ?? []) collected.headings.push({ moduleId: id, ...heading });
  }
}
