
import { h } from '../dom.js';
import { riseIn } from '../motion.js';

const LEVEL_LABELS = { log: 'log', info: 'info', warn: 'varování', error: 'chyba', system: 'info' };
const MAX_ENTRIES = 500;

export function createConsolePanel({ emptyText = 'Konzole je prázdná. Co vypíše console.log(), uvidíš tady.' } = {}) {
  const list = h('ol', { class: 'console__list', role: 'log', 'aria-label': 'Výstup konzole' });
  const empty = h('p', { class: 'console__empty' }, emptyText);
  const element = h('div', { class: 'console' }, empty, list);

  // Animuje se jen prvních pár řádků v jednom snímku: výpis z cyklu o tisíci řádcích
  // má prostě naskočit, ne spustit tisíc animací.
  const ANIMATED_PER_FRAME = 6;
  let animatedThisFrame = 0;

  function add(level, text) {
    empty.hidden = true;
    const safeLevel = LEVEL_LABELS[level] ? level : 'log';
    const entry = h(
      'li',
      { class: `console__entry console__entry--${safeLevel}` },
      h('span', { class: 'visually-hidden' }, `${LEVEL_LABELS[safeLevel]}: `),
      h('pre', {}, text),
    );
    list.append(entry);
    if (animatedThisFrame < ANIMATED_PER_FRAME) {
      if (animatedThisFrame === 0) requestAnimationFrame(() => (animatedThisFrame = 0));
      riseIn(entry, { delay: animatedThisFrame * 0.03, distance: 3 });
      animatedThisFrame++;
    }
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
