// Seznam nápověd (požadavků) se stavem: neověřeno / ověřuje se / prošlo / selhalo.
// Chybová zpráva testu se dá rozbalit — pomáhá pochopit, co přesně nesedí.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { renderMarkdown } from '../markdown.js';

const STATUS = {
  idle: { icon: icons.circle, label: 'Neověřeno' },
  running: { icon: icons.pending, label: 'Ověřuje se' },
  pass: { icon: icons.check, label: 'Splněno' },
  fail: { icon: icons.cross, label: 'Nesplněno' },
};

export function createHintList(hints, { ordered = false } = {}) {
  const items = hints.map((hint) => {
    const status = h('span', { class: 'hint__status' });
    const detail = h('div', { class: 'hint__detail' });
    const li = h('li', { class: 'hint' }, status, h('div', { class: 'hint__body' }, renderMarkdown(hint.text), detail));
    return { li, status, detail };
  });

  const list = h(ordered ? 'ol' : 'ul', { class: 'hints' }, items.map((item) => item.li));

  function setStatus(item, key, error) {
    const { icon, label } = STATUS[key];
    item.li.dataset.status = key;
    item.status.replaceChildren(svg(icon, { size: 18, label }));
    item.detail.replaceChildren();
    if (key === 'idle' && error) {
      // Test se nespustil (runner ho přeskočil) — vysvětlení bez rozbalování.
      item.detail.append(h('p', { class: 'hint__note' }, error));
    } else if (key === 'fail' && error) {
      item.detail.append(
        h(
          'details',
          { class: 'hint__error' },
          h('summary', {}, 'Proč to neprošlo'),
          h('pre', {}, error), // text chyby vkládáme jako text, ne jako HTML
        ),
      );
    }
  }

  const api = {
    element: list,
    reset: () => items.forEach((item) => setStatus(item, 'idle')),
    running: () => items.forEach((item) => setStatus(item, 'running')),
    /** results: [{ index, pass, error?, skipped? }] z RunResult */
    setResults(results) {
      items.forEach((item, index) => {
        const result = results.find((r) => r.index === index);
        if (!result) setStatus(item, 'idle');
        else if (result.skipped) setStatus(item, 'idle', 'Neověřeno — kontrola se zastavila na předchozí chybě.');
        else setStatus(item, result.pass ? 'pass' : 'fail', result.error);
      });
    },
  };
  api.reset();
  return api;
}
