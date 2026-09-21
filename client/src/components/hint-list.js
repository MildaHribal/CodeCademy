
import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { renderMarkdown } from '../markdown.js';
import { renderHintFailure } from './test-result.js';
import { expand, popIn, sequenceDelay, settleIn } from '../motion.js';

const STATUS = {
  idle: { icon: icons.circle, label: 'Neověřeno' },
  running: { icon: icons.pending, label: 'Ověřuje se' },
  pass: { icon: icons.check, label: 'Splněno' },
  fail: { icon: icons.cross, label: 'Nesplněno' },
};

export function createHintList(hints, { ordered = false, item: owner = null } = {}) {
  const items = hints.map((hint) => {
    const status = h('span', { class: 'hint__status' });
    const detail = h('div', { class: 'hint__detail' });
    const li = h('li', { class: 'hint' }, status, h('div', { class: 'hint__body' }, renderMarkdown(hint.text), detail));
    return { li, status, detail };
  });

  const list = h(ordered ? 'ol' : 'ul', { class: 'hints' }, items.map((item) => item.li));

  function setStatus(item, key, { note = null, result = null, index = 0, run = null, animate = false } = {}) {
    const { icon, label } = STATUS[key];
    item.li.dataset.status = key;
    const mark = svg(icon, { size: 18, label });
    item.status.replaceChildren(mark);
    item.detail.replaceChildren();
    if (key === 'idle' && note) {
      item.detail.append(h('p', { class: 'hint__note' }, note));
    } else if (key === 'fail') {
      const detail = renderHintFailure({ result, hint: hints[index], index, run, item: owner });
      if (detail) item.detail.append(detail);
    }
    if (!animate) return;
    // Výsledky „sjedou" seznamem shora dolů, jako by testy běžely před očima. Stav v DOM
    // je správně hned, zpožděný je jen vzhled. Splněno doskočí; nesplněno jen přijde —
    // u neúspěchu se nic neposmívá.
    const delay = sequenceDelay(index);
    if (key === 'pass') popIn(mark, { delay });
    else if (key === 'fail') {
      settleIn(mark, { delay });
      if (item.detail.firstElementChild) expand(item.detail);
    }
  }

  const api = {
    element: list,
    reset: () => items.forEach((item) => setStatus(item, 'idle')),
    running: () => items.forEach((item) => setStatus(item, 'running')),
    setResults(results, run = null) {
      items.forEach((item, index) => {
        const result = results.find((r) => r.index === index);
        if (!result) setStatus(item, 'idle');
        else if (result.skipped) setStatus(item, 'idle', { note: result.note ?? 'Neověřeno — kontrola se zastavila na předchozí chybě.' });
        else setStatus(item, result.pass ? 'pass' : 'fail', { result, index, run, animate: true });
      });
    },
    itemElement: (index) => items[index]?.li ?? null,
    status: (index) => items[index]?.li.dataset.status ?? null,
  };
  api.reset();
  return api;
}
