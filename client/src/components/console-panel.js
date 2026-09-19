
import { h } from '../dom.js';

const LEVEL_LABELS = { log: 'log', info: 'info', warn: 'varování', error: 'chyba', system: 'info' };
const MAX_ENTRIES = 500;

export function createConsolePanel({ emptyText = 'Konzole je prázdná. Co vypíše console.log(), uvidíš tady.' } = {}) {
  const list = h('ol', { class: 'console__list', role: 'log', 'aria-label': 'Výstup konzole' });
  const empty = h('p', { class: 'console__empty' }, emptyText);
  const element = h('div', { class: 'console' }, empty, list);

  function add(level, text) {
    empty.hidden = true;
    const safeLevel = LEVEL_LABELS[level] ? level : 'log';
    list.append(
      h(
        'li',
        { class: `console__entry console__entry--${safeLevel}` },
        h('span', { class: 'visually-hidden' }, `${LEVEL_LABELS[safeLevel]}: `),
        h('pre', {}, text),
      ),
    );
    while (list.children.length > MAX_ENTRIES) list.firstElementChild.remove();
    element.scrollTop = element.scrollHeight;
  }

  function clear() {
    list.replaceChildren();
    empty.hidden = false;
  }

  function receive(entry) {
    if (Array.isArray(entry)) return entry.forEach(receive);
    if (!entry) return;
    if (entry.type === 'clear' || entry.level === 'clear') return clear();
    add(entry.level ?? 'log', String(entry.text ?? ''));
  }

  return {
    element,
    receive,
    clear,
    log: (text) => add('log', text),
    error: (text) => add('error', text),
    system: (text) => add('system', text),
  };
}
