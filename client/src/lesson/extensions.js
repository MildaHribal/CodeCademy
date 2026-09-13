// Rozšíření obrazovky lekce (poznámky, obsah lekce, „Nerozumím"…).
//
//   lessonExtensions.register({
//     id: 'notes',
//     order: 10,
//     setup(lesson) {
//       lesson.addToSlot('head', h('button', …));
//       return () => { … úklid … };
//     },
//   });
//
// API lekce (`lesson`):
//   module, id, nav           — data modulu a navigace (nav.nextModule, nav.sectionHref)
//   article                   — <article> s výkladem (po vykreslení všech bloků)
//   signal, onCleanup(fn)     — zrušení při odchodu z obrazovky
//   headings()                — [{ anchor, text, level, element }] nadpisy s kotvami (úroveň 2 a 3)
//   addToSlot(name, el, { order })  — sloty: 'head' (pod hlavičkou), 'before-finish' (za výkladem),
//                               'end' (úplně na konci), 'aside' (postranní panel; rozložení si řeší rozšíření)
//   addRequirement({ id, isMet: () => boolean, label })
//                             — podmínka splnění lekce navíc (např. otázky :::check ve výkladu);
//                               volat při vykreslení bloků, ne později
//   events: appEvents 'lesson:mount', 'lesson:questions-checked', 'lesson:complete' (core/events.js)
import { createExtensionPoint } from '../core/registry.js';

export const lessonExtensions = createExtensionPoint('lekce');
