// Štítek druhu kroku pod nadpisem kroku (kontrakt kap. 3.4–3.6) a čtyři kroky ladění u `kind: debug`.
import { h, svg } from '../../dom.js';

const icon = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;

export const KIND_LABELS = {
  debug: {
    title: 'Oprava chyby',
    text: 'Kód napsal někdo jiný a má v sobě chybu. Najdi ji a oprav co nejmenší změnou.',
    icon: icon('M5.5 5.5a2.5 2.5 0 0 1 5 0v4a2.5 2.5 0 0 1-5 0zM8 7v5M3 6.5h2.5M10.5 6.5H13M3 10h2.5M10.5 10H13M6 3.5 4.8 2.3M10 3.5l1.2-1.2'),
  },
  parsons: {
    title: 'Seřaď řádky',
    text: 'Poskládej hotové řádky do správného pořadí a odsazení. Některé řádky jsou navíc.',
    icon: icon('M3 4h10M5 8h8M5 12h6'),
  },
  recall: {
    title: 'Opakování bez návodu',
    text: 'Tohle už jsi dělal dřív. Zkus si vybavit, jak na to, než otevřeš nápovědu.',
    icon: icon('M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8'),
  },
  choose: {
    title: 'Vyber nástroj sám',
    text: 'Zadání schválně nejmenuje metodu ani vlastnost. Projde každé rozumné řešení.',
    icon: icon('M2.5 8h4M9.5 4.5 13 8l-3.5 3.5M6.5 8l3-3.5M6.5 8l3 3.5'),
  },
};

export const DEBUG_STEPS = [
  'Zopakuj chybu: spusť kód a přečti hlášku nebo výstup.',
  'Najdi místo, kde se skutečnost rozchází s očekáváním.',
  'Oprav jednu věc.',
  'Ověř, že oprava funguje a nic dalšího se nerozbilo.',
];

export function kindLabel(kind) {
  const label = KIND_LABELS[kind];
  if (!label) return null;
  return h(
    'div',
    { class: `kind-label kind-label--${kind}`, dataset: { kind } },
    h('p', { class: 'kind-label__title' }, svg(label.icon, { size: 16 }), label.title),
    h('p', { class: 'kind-label__text' }, label.text),
  );
}

/** Čtyři kroky ladění (nepíše je autor, kontrakt kap. 3.4). */
export function debugSteps({ open = true } = {}) {
  return h(
    'details',
    { class: 'debug-steps', open },
    h('summary', { class: 'debug-steps__summary' }, 'Jak ladit: čtyři kroky'),
    h('ol', { class: 'debug-steps__list' }, DEBUG_STEPS.map((step) => h('li', {}, step))),
  );
}
