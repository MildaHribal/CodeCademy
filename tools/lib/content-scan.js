// Výběr a načtení obsahu pro verify (kontrakt kap. 10.1 — struktura).
//
// scanContent načte VŽDY celý kurz (odkazy a pojmy se ověřují proti všemu obsahu),
// ale do `modules` a `sections` dá jen to, co odpovídá prefixům z příkazové řádky.
import fs from 'node:fs';
import path from 'node:path';
import { loadCurriculum, loadModule, SECTION_EXTRAS, sectionOutcomes } from '../../shared/content.js';
import { parseCards, parseLesson, parseTerms } from '../../shared/parse.js';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Převede argumenty z příkazové řádky (`content/css-flexbox`, `content/css-flexbox/kviz`)
 * na id prefixy (`css-flexbox`, `css-flexbox/kviz`).
 */
export function toIdPrefixes(args, contentDir, cwd = process.cwd()) {
  return args.map((arg) => {
    const relative = path.relative(contentDir, path.resolve(cwd, arg)).split(path.sep).join('/');
    const id = relative.startsWith('..') || path.isAbsolute(relative) ? arg.replace(/^\.?\/?(content\/)?/, '') : relative;
    return id.replace(/\/+$/, '');
  });
}

export function matchesPrefixes(id, prefixes) {
  if (prefixes.length === 0) return true;
  return prefixes.some((prefix) => prefix === '' || id === prefix || id.startsWith(`${prefix}/`) || prefix.startsWith(`${id}/`));
}

/** Kontroly souborů sekce (karty, pojmy) patří k sekci jen tehdy, když prefix nemíří na jeden modul. */
export function sectionSelected(sectionId, prefixes) {
  return prefixes.length === 0 || prefixes.some((prefix) => prefix === '' || prefix === sectionId);
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

/** Textový soubor sekce rozparsovaný parserem: { text, value, error } (text null = soubor chybí). */
function parseExtra(text, parse) {
  if (text === null) return { text: null, value: null, error: null };
  try {
    return { text, value: parse(text), error: null };
  } catch (error) {
    return { text, value: null, error: error.message };
  }
}

/**
 * Model kurzu pro kontroly napříč obsahem.
 * @returns {{
 *   osnova: object|null, osnovaError: string|null,
 *   sections: Map<string, { id, partId, partIndex, order, uroven, planned, available, json, error,
 *     moduleIds: string[], cards, pojmy, tahak: string|null, outcomes, outcomesError }>,
 *   modules: Map<string, { id, sectionId, moduleId, type: string|null, module: object|null, error: string|null,
 *     steps: string[], headings: object[]|null }>,
 *   parts: { id, sectionIds: string[] }[],
 * }}
 */
export function loadCourse(contentDir, extraSectionIds = []) {
  const course = { contentDir, osnova: null, osnovaError: null, sections: new Map(), modules: new Map(), parts: [] };
  try {
    course.osnova = JSON.parse(fs.readFileSync(path.join(contentDir, 'osnova.json'), 'utf8'));
    if (!Array.isArray(course.osnova.parts)) throw new Error('potřebuje pole "parts"');
  } catch (error) {
    course.osnovaError = `osnova.json nejde přečíst: ${error.message}`;
    course.osnova = null;
  }

  const entries = [];
  (course.osnova?.parts ?? []).forEach((part, partIndex) => {
    const sectionIds = [];
    for (const entry of part.sections ?? []) {
      const id = typeof entry === 'string' ? entry : entry?.id;
      if (typeof id !== 'string' || !SLUG.test(id)) continue;
      sectionIds.push(id);
      entries.push({ id, partId: part.id, partIndex, planned: typeof entry === 'string' ? null : entry });
    }
    course.parts.push({ id: part.id, sectionIds });
  });
  for (const id of extraSectionIds) {
    if (!entries.some((entry) => entry.id === id)) entries.push({ id, partId: null, partIndex: -1, planned: null });
  }

  entries.forEach((entry, order) => {
    if (course.sections.has(entry.id)) return;
    const dir = path.join(contentDir, entry.id);
    const section = {
      ...entry, order, uroven: entry.planned?.uroven ?? 'jadro', available: false, json: null, error: null, moduleIds: [],
      cards: parseExtra(null), pojmy: parseExtra(null), tahak: null, outcomes: [], outcomesError: null,
    };
    course.sections.set(entry.id, section);
    const jsonText = readText(path.join(dir, 'section.json'));
    if (jsonText === null) return;
    try {
      section.json = JSON.parse(jsonText);
      if (!section.json.title || !Array.isArray(section.json.modules)) throw new Error('potřebuje "title" a pole "modules"');
    } catch (error) {
      section.error = `section.json: ${error.message}`;
      return;
    }
    section.available = true;
    section.moduleIds = section.json.modules.filter((m) => typeof m === 'string');
    section.cards = parseExtra(readText(path.join(dir, SECTION_EXTRAS.cards)), (text) => parseCards(text, { id: entry.id }).cards);
    section.pojmy = parseExtra(readText(path.join(dir, SECTION_EXTRAS.pojmy)), (text) => parseTerms(text, { id: entry.id }).terms);
    section.tahak = readText(path.join(dir, SECTION_EXTRAS.tahak));
    try {
      section.outcomes = sectionOutcomes(section.json, entry.id);
    } catch (error) {
      section.outcomesError = error.message;
    }

    for (const moduleId of section.moduleIds) {
      const id = `${entry.id}/${moduleId}`;
      const record = { id, sectionId: entry.id, moduleId, type: null, module: null, error: null, steps: [], headings: null };
      course.modules.set(id, record);
      const moduleDir = path.join(dir, moduleId);
      try {
        record.type = JSON.parse(fs.readFileSync(path.join(moduleDir, 'module.json'), 'utf8')).type ?? null;
      } catch {
        record.type = null;
      }
      if (record.type === 'workshop' && fs.existsSync(path.join(moduleDir, 'steps'))) {
        record.steps = fs.readdirSync(path.join(moduleDir, 'steps')).filter((f) => /^\d{3}\.md$/.test(f)).sort().map((f) => `${id}/${f.slice(0, 3)}`);
      }
      try {
        record.module = loadModule(contentDir, entry.id, moduleId, { includeSolutions: true });
        if (record.module.type === 'lesson') record.headings = record.module.lesson.headings;
      } catch (error) {
        record.error = error.message;
        if (record.type === 'lesson') {
          // Rozbitá lekce: kotvy aspoň z toho, co jde naparsovat, jinak neznámé (odkazy se pak neověřují).
          try {
            record.headings = parseLesson(fs.readFileSync(path.join(moduleDir, 'lesson.md'), 'utf8'), { id }).headings;
          } catch {
            record.headings = null;
          }
        }
      }
    }
  });
  return course;
}

/**
 * @returns {{ problems: Array<{ id, type, errors: string[], warnings: string[], advice: string[], notes: string[] }>,
 *   modules: Array<{ id: string, module?: object, error?: string }>,
 *   sections: string[],   // id sekcí, jejichž soubory (karty, pojmy, tahák) se ověřují
 *   course: object }}
 *   problems = chyby mimo konkrétní modul (osnova, sekce mimo osnovu, section.json)
 */
export function scanContent(contentDir, prefixes = []) {
  const problems = [];
  const problem = (id, { error, warning }) => {
    let entry = problems.find((p) => p.id === id);
    if (!entry) problems.push((entry = { id, type: null, errors: [], warnings: [], advice: [], notes: [] }));
    if (error) entry.errors.push(error);
    if (warning) entry.warnings.push(warning);
  };

  // Sekce vyžádaná prefixem, která v osnově (zatím) není, se ověří taky — s varováním.
  const osnovaIds = new Set();
  try {
    const osnova = JSON.parse(fs.readFileSync(path.join(contentDir, 'osnova.json'), 'utf8'));
    for (const part of osnova.parts ?? []) for (const entry of part.sections ?? []) osnovaIds.add(typeof entry === 'string' ? entry : entry?.id);
  } catch {
    // chybu osnovy nahlásí loadCourse
  }
  const extra = [];
  for (const prefix of prefixes) {
    const sectionId = prefix.split('/')[0];
    if (sectionId && !osnovaIds.has(sectionId) && fs.existsSync(path.join(contentDir, sectionId, 'section.json'))) {
      extra.push(sectionId);
      problem(sectionId, { warning: '[S2] sekce není v osnova.json' });
    }
  }

  const course = loadCourse(contentDir, extra);
  if (course.osnovaError) problem('osnova.json', { error: `[S1] ${course.osnovaError}` });

  const modules = [];
  const sections = [];
  for (const section of course.sections.values()) {
    if (!matchesPrefixes(section.id, prefixes)) continue;
    if (section.error) problem(section.id, { error: `[S1] ${section.error}` });
    if (section.available && sectionSelected(section.id, prefixes)) sections.push(section.id);
    for (const moduleId of section.moduleIds) {
      const record = course.modules.get(`${section.id}/${moduleId}`);
      if (!matchesPrefixes(record.id, prefixes)) continue;
      modules.push(record.module ? { id: record.id, module: record.module } : { id: record.id, error: record.error });
    }
  }

  // Celá osnova přes loadCurriculum (to samé čte API). Její chybu hlásíme, jen když
  // ji nevysvětluje chyba modulu výš a týká se ověřované části.
  try {
    loadCurriculum(contentDir);
  } catch (error) {
    const explained = modules.some((m) => m.error === error.message) || problems.some((p) => p.errors.length);
    const relevant = !error.id || error.id === 'osnova.json' || matchesPrefixes(String(error.id), prefixes);
    if (!explained && relevant) problem('osnova.json', { error: `[S1] ${error.message}` });
  }

  if (prefixes.length && modules.length === 0 && sections.length === 0 && problems.every((p) => p.errors.length === 0)) {
    problem('verify', { error: `žádný modul neodpovídá: ${prefixes.join(', ')}` });
  }
  return { problems, modules, sections, course };
}
