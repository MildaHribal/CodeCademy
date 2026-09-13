// Drobné stavové prvky: ukazatel postupu po modulech, štítek stavu, zpráva o chybě.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { percent } from '../text.js';

/**
 * Pruh složený z dílků — jeden dílek za modul, vyplněný podle splnění.
 * Na první pohled je vidět, kolik modulů sekce má a které jsou hotové.
 */
export function segmentedProgress(fractions, { label }) {
  const average = fractions.length ? fractions.reduce((a, b) => a + b, 0) / fractions.length : 0;
  return h(
    'div',
    {
      class: 'segments',
      role: 'progressbar',
      'aria-label': label,
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': String(Math.round(average * 100)),
      'aria-valuetext': percent(average),
    },
    fractions.map((fraction) =>
      h(
        'span',
        { class: 'segments__item', dataset: { done: String(fraction >= 1) } },
        h('span', { class: 'segments__fill', style: { width: `${Math.round(fraction * 100)}%` } }),
      ),
    ),
  );
}

/** Štítek stavu modulu: Splněno / Rozpracováno / Nezačato. */
export function statusBadge(status, { detail = null } = {}) {
  if (status.done) {
    return h('span', { class: 'badge badge--done' }, svg(icons.check, { size: 14 }), 'Splněno');
  }
  if (status.started) {
    return h('span', { class: 'badge badge--started' }, svg(icons.half, { size: 14 }), detail ?? 'Rozpracováno');
  }
  return h('span', { class: 'badge badge--idle' }, svg(icons.circle, { size: 14 }), 'Nezačato');
}

/** Blok s chybovou hláškou a volitelnými akcemi (Zkusit znovu, Zpět…). */
export function errorNotice({ title, message, actions = [] }) {
  return h(
    'div',
    { class: 'notice notice--error', role: 'alert' },
    h('h2', { class: 'notice__title' }, title),
    message ? h('p', { class: 'notice__message' }, message) : null,
    actions.length ? h('div', { class: 'notice__actions' }, actions) : null,
  );
}

/** Načítací stav — ukáže se až po chvilce, ať rychlé načtení neblikne. */
export function loadingNotice(text = 'Načítám…') {
  return h('p', { class: 'loading', role: 'status' }, text);
}
