
import { api } from './api.js';

let curriculumPromise = null;
const modulePromises = new Map();

export function loadCurriculum({ fresh = false } = {}) {
  if (fresh || !curriculumPromise) {
    curriculumPromise = api.curriculum();
    curriculumPromise.catch(() => (curriculumPromise = null));
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

export function findSection(curriculum, sectionId) {
  for (const part of curriculum.parts) {
    const index = part.sections.findIndex((s) => s.id === sectionId);
    if (index !== -1) return { part, section: part.sections[index] };
  }
  return null;
}

export function allModules(curriculum) {
  return curriculum.parts.flatMap((part) =>
    part.sections.flatMap((section) => section.modules.map((module) => ({ part, section, module }))),
  );
}
