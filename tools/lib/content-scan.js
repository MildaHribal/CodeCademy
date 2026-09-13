// Výběr a načtení modulů pro verify (kontrakt kap. 10, bod 1 — struktura).
import fs from 'node:fs';
import path from 'node:path';
import { loadCurriculum, loadModule } from '../../shared/content.js';

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

/**
 * @returns {{ problems: Array<{ id: string, errors: string[], warnings: string[] }>,
 *   modules: Array<{ id: string, module?: object, error?: string }> }}
 *   problems = chyby mimo konkrétní modul (osnova, sekce)
 */
export function scanContent(contentDir, prefixes = []) {
  const problems = [];
  const modules = [];
  const problem = (id, { error, warning }) => {
    let entry = problems.find((p) => p.id === id);
    if (!entry) problems.push((entry = { id, errors: [], warnings: [] }));
    if (error) entry.errors.push(error);
    if (warning) entry.warnings.push(warning);
  };

  // Seznam sekcí z osnovy (plánované sekce bez adresáře se přeskočí).
  let sectionIds = [];
  const osnovaPath = path.join(contentDir, 'osnova.json');
  try {
    const osnova = JSON.parse(fs.readFileSync(osnovaPath, 'utf8'));
    sectionIds = (osnova.parts ?? []).flatMap((part) => (part.sections ?? []).map((entry) => (typeof entry === 'string' ? entry : entry?.id)));
  } catch (error) {
    problem('osnova.json', { error: `osnova.json nejde přečíst: ${error.message}` });
  }

  // Sekce vyžádaná prefixem, která v osnově (zatím) není, se ověří taky — s varováním.
  for (const prefix of prefixes) {
    const sectionId = prefix.split('/')[0];
    if (sectionId && !sectionIds.includes(sectionId) && fs.existsSync(path.join(contentDir, sectionId, 'section.json'))) {
      sectionIds.push(sectionId);
      problem(sectionId, { warning: 'sekce není v osnova.json' });
    }
  }

  for (const sectionId of sectionIds) {
    if (typeof sectionId !== 'string' || !matchesPrefixes(sectionId, prefixes)) continue;
    const sectionFile = path.join(contentDir, sectionId, 'section.json');
    if (!fs.existsSync(sectionFile)) continue; // plánovaná sekce
    let section;
    try {
      section = JSON.parse(fs.readFileSync(sectionFile, 'utf8'));
      if (!section.title || !Array.isArray(section.modules)) throw new Error('potřebuje "title" a pole "modules"');
    } catch (error) {
      problem(sectionId, { error: `section.json: ${error.message}` });
      continue;
    }
    for (const moduleId of section.modules) {
      const id = `${sectionId}/${moduleId}`;
      if (!matchesPrefixes(id, prefixes)) continue;
      try {
        modules.push({ id, module: loadModule(contentDir, sectionId, moduleId, { includeSolutions: true }) });
      } catch (error) {
        modules.push({ id, error: error.message });
      }
    }
  }

  // Celá osnova přes loadCurriculum (to samé čte API). Její chybu hlásíme, jen když
  // ji nevysvětluje chyba modulu výš a týká se ověřované části.
  try {
    loadCurriculum(contentDir);
  } catch (error) {
    const explained = modules.some((m) => m.error === error.message) || problems.some((p) => p.errors.length);
    const relevant = !error.id || error.id === 'osnova.json' || matchesPrefixes(String(error.id), prefixes);
    if (!explained && relevant) problem('osnova.json', { error: error.message });
  }

  if (prefixes.length && modules.length === 0 && problems.every((p) => p.errors.length === 0)) {
    problem('verify', { error: `žádný modul neodpovídá: ${prefixes.join(', ')}` });
  }
  return { problems, modules };
}
