import { createRegistry } from '../core/registry.js';

const blocks = createRegistry('Blok lekce');

export function registerLessonBlock(entry) {
  if (typeof entry?.kind !== 'string' || typeof entry.render !== 'function') {
    throw new Error('Blok lekce potřebuje kind a render(block, env)');
  }
  return blocks.add({ id: entry.kind, ...entry });
}

export function lessonBlockRenderer(kind) {
  return blocks.get(kind);
}
