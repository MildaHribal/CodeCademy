// Načítání osnovy a modulů ze serveru s jednoduchou mezipamětí.
// Obsah se během používání nemění, takže přechod mezi kroky workshopu nemusí
// modul stahovat znovu. Osnova se obnoví při každém návratu na přehled.

import { api } from './api.js';

let curriculumPromise = null;
const modulePromises = new Map();

export function loadCurriculum({ fresh = false } = {}) {
  if (fresh || !curriculumPromise) {
    curriculumPromise = api.curriculum();
    curriculumPromise.catch(() => (curriculumPromise = null)); // chybu si nepamatovat
  }
  return curriculumPromise;
}

export function loadModule(sectionId, moduleId) {
  const id = `${sectionId}/${moduleId}`;
  if (!modulePromises.has(id)) {
    const promise = api.module(sectionId, moduleId);
    promise.catch(() => modulePromises.delete(id));
    modulePromises.set(id, promise);
  }
  return modulePromises.get(id);
}

/** Najde sekci podle id a vrátí ji i s částí, do které patří. */
export function findSection(curriculum, sectionId) {
  for (const part of curriculum.parts) {
    const index = part.sections.findIndex((s) => s.id === sectionId);
    if (index !== -1) return { part, section: part.sections[index] };
  }
  return null;
}

/** Všechny moduly osnovy v pořadí, každý s odkazem na svou sekci. */
export function allModules(curriculum) {
  return curriculum.parts.flatMap((part) =>
    part.sections.flatMap((section) => section.modules.map((module) => ({ part, section, module }))),
  );
}
