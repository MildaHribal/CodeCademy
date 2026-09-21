
import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { percent } from '../text.js';

/**
 * Pruh složený z dílků — jeden dílek za modul, vyplněný podle splnění.
 * Položka je buď číslo (0–1), nebo `{ fraction, type }`; podle typu se dílek obarví,
 * takže z pruhu je vidět nejen kolik je hotovo, ale i z čeho sekce je
 * (kolik čtení, kolik workshopů, kolik samostatné práce).
 */
export function segmentedProgress(items, { label }) {
  const parts = items.map((item) => (typeof item === 'number' ? { fraction: item, type: null } : item));
  const average = parts.length ? parts.reduce((sum, p) => sum + p.fraction, 0) / parts.length : 0;
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
    parts.map(({ fraction, type }) =>
      h(
        'span',
        { class: 'segments__item', dataset: { done: String(fraction >= 1), type: type ?? '' } },
        h('span', { class: 'segments__fill', style: { width: `${Math.round(fraction * 100)}%` } }),
      ),
    ),
  );
}

export function statusBadge(status, { detail = null } = {}) {
  if (status.done) {
    return h('span', { class: 'badge badge--done' }, svg(icons.check, { size: 14 }), 'Splněno');
  }
  if (status.started) {
    return h('span', { class: 'badge badge--started' }, svg(icons.half, { size: 14 }), detail ?? 'Rozpracováno');
  }
  return h('span', { class: 'badge badge--idle' }, svg(icons.circle, { size: 14 }), 'Nezačato');
}

export function errorNotice({ title, message, actions = [] }) {
  return h(
    'div',
    { class: 'notice notice--error', role: 'alert' },
    h('h2', { class: 'notice__title' }, title),
    message ? h('p', { class: 'notice__message' }, message) : null,
    actions.length ? h('div', { class: 'notice__actions' }, actions) : null,
  );
}

export function loadingNotice(text = 'Načítám…') {
  return h('p', { class: 'loading', role: 'status' }, text);
}
