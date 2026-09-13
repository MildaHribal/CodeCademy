// Globální události aplikace. Posluchač se přihlásí kdekoli (typicky v client/src/extensions/<nástroj>.js):
//
//   import { appEvents } from '../core/events.js';
//   appEvents.on('workspace:check-result', ({ id, result, files }) => { … });
//
// Události, které vyvolává jádro (payload v závorce):
//   route:change              ({ route })
//   progress:complete         ({ id, score })
//   progress:reset            ({ id })
//   workspace:mount           ({ ws })                          — pracovní plocha je v DOM
//   workspace:files-change    ({ ws, id, files })               — uživatel upravil kód
//   workspace:check-start     ({ ws, id, files })
//   workspace:check-result    ({ ws, id, result, files, passed }) — result = RunResult (i po transformacích)
//   workspace:check-error     ({ ws, id, error })               — kontrolu nešlo spustit
//   workspace:step-complete   ({ ws, id })                      — splnění uloženo
//   workspace:reset           ({ ws, id })                      — Obnovit krok
//   lesson:mount              ({ lesson })
//   lesson:questions-checked  ({ lesson, id, results: [{ index, correct, question }] })
//   lesson:complete           ({ lesson, id })
//   quiz:evaluated            ({ id, score, passed, results: [{ index, correct, question }] })
//   project:check-result      ({ id, result, passed })
import { createEmitter } from './registry.js';

export const appEvents = createEmitter();
