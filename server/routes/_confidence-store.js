import { itemTarget } from '../../shared/refs.js';

export const FILE_NAME = 'jistota.json';
export const CONFIDENCE_VALUES = ['sure', 'guess'];

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function emptyConfidence() {
  return { version: 1, sections: {} };
}

export function migrateConfidence(data) {
  if (!isPlainObject(data) || !isPlainObject(data.sections)) return null;
  return { version: 1, sections: data.sections };
}

export function sectionOfItem(id) {
  return itemTarget(id)?.split('/')[0] ?? null;
}

const emptyCounts = () => ({ total: 0, correct: 0 });

export function sectionConfidence(data, sectionId) {
  const stored = Object.hasOwn(data.sections ?? {}, sectionId) ? data.sections[sectionId] : {};
  const counts = (value) => ({ total: Number(value?.total) || 0, correct: Number(value?.correct) || 0 });
  return { sectionId, sure: counts(stored.sure), guess: counts(stored.guess) };
}

export function addAnswer(data, { sectionId, ok, confidence }) {
  if (!sectionId || !CONFIDENCE_VALUES.includes(confidence) || typeof ok !== 'boolean') return false;
  if (!Object.hasOwn(data.sections, sectionId)) data.sections[sectionId] = { sure: emptyCounts(), guess: emptyCounts() };
  const section = data.sections[sectionId];
  if (!Object.hasOwn(section, confidence)) section[confidence] = emptyCounts();
  const bucket = section[confidence];
  bucket.total += 1;
  if (ok) bucket.correct += 1;
  return true;
}
