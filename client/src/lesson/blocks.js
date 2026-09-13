// Registr bloků lekce: parser (shared/parse.js) vrací `lesson.blocks` s polem `kind`
// a každý kind vykreslí jeden renderer. Nový blok (:::check, :::memory, :::explain…) =
// nový soubor v client/src/lesson/blocks/ a registrace (v něm nebo v rozšíření nástroje):
//
//   registerLessonBlock({
//     kind: 'memory',
//     render(block, env) {
//       const element = h('figure', { class: 'memory' }, …);
//       return element;                                    // prvek, nebo:
//       return { element, mount() { … }, destroy() { … } }; // mount až je prvek ve stránce
//     },
//   });
//
// env (jeden na blok):
//   env.lesson    — API lekce (lesson/extensions.js): module, id, article, signal, onCleanup, addRequirement…
//   env.index     — pořadí bloku v lekci (0…)
//   env.number    — pořadové číslo bloku daného kind (1…), např. „Živá ukázka 2"
//   env.slugger   — generátor kotev nadpisů lekce (renderMarkdown(text, { slugger }))
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
