// Plocha kroku `kind: parsons` místo editoru kódu (kontrakt kap. 3.5).
//
// Vlevo nabídka řádků (i řádky navíc), vpravo řešení mezi kódem, který už v souboru je.
// Ovládání:
//   myš       — přetažení řádku, dvojklik přesune mezi nabídkou a řešením, tlačítka ‹ › mění odsazení
//   klávesnice — Enter přesune řádek mezi nabídkou a řešením, ↑/↓ posune řádek,
//               Shift+↑/↓ přejde na sousední řádek, Tab / Shift+Tab změní odsazení (v řešení)
//
// Kontrola i ukládání běží beze změny nad soubory z getFiles(): řádky se vloží do oblasti
// --edit-- seedu (parsons-logic.js).
import { h, svg } from '../../dom.js';
import { appEvents } from '../../core/events.js';
import { highlightLines } from '../../markdown.js';
import {
  assembleFiles,
  createItems,
  indentMismatches,
  initialPool,
  lineSegments,
  moveInList,
  restoreState,
  targetSeedFile,
} from './parsons-logic.js';

const INDENT_LEFT = '<path d="M9.5 4L5.5 8l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
const INDENT_RIGHT = '<path d="M6.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';

export function createParsonsEditor(host, { files, onChange, item }) {
  const parsons = item.parsons;
  const seed = item.seed;
  const items = createItems(parsons);
  const byId = new Map(items.map((entry) => [entry.id, entry]));
  const poolOrder = initialPool(items, item.id);
  const maxIndent = Math.max(0, ...items.map((entry) => entry.indent)) + 2;
  const target = targetSeedFile(seed, parsons);
  const lang = target?.lang ?? 'js';

  let state = fresh();
  let wrongIndent = new Set(); // označí se až po kontrole
  restore(files);

  const poolList = h('ul', { class: 'parsons__list', 'aria-label': 'Nabídka řádků' });
  const solutionList = h('ul', { class: 'parsons__list parsons__list--solution', 'aria-label': 'Tvoje řešení' });
  const emptySolution = h('li', { class: 'parsons__empty' }, 'Sem přetáhni řádky ve správném pořadí (nebo na řádku stiskni Enter).');

  const seedLines = target ? target.content.split('\n') : [];
  const contextBefore = target ? seedLines.slice(0, target.region.start - 1) : [];
  const contextAfter = target ? seedLines.slice(target.region.end) : [];

  const element = h(
    'div',
    { class: 'parsons' },
    h(
      'div',
      { class: 'pane__head parsons__head' },
      h('h2', {}, 'Seřaď řádky'),
      h('p', { class: 'parsons__keys' }, 'Enter přesune řádek, šipky ↑↓ mění pořadí, Tab odsazení.'),
    ),
    h(
      'div',
      { class: 'parsons__columns' },
      h('section', { class: 'parsons__column', 'aria-labelledby': `${item.id}-pool` }, h('h3', { id: `${item.id}-pool`, class: 'parsons__title' }, 'Nabídka'), poolList),
      h(
        'section',
        { class: 'parsons__column parsons__column--solution', 'aria-labelledby': `${item.id}-solution` },
        h('h3', { id: `${item.id}-solution`, class: 'parsons__title' }, target ? `Tvoje řešení v ${target.name}` : 'Tvoje řešení'),
        contextBefore.length ? contextCode(contextBefore, 'před') : null,
        solutionList,
        contextAfter.length ? contextCode(contextAfter, 'za') : null,
      ),
    ),
  );
  host.append(element);

  for (const list of [poolList, solutionList]) {
    list.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    });
    list.addEventListener('drop', (event) => {
      event.preventDefault();
      const id = event.dataTransfer.getData('text/plain');
      if (!byId.has(id)) return;
      const toSolution = list === solutionList;
      const over = event.target.closest?.('.parsons__line');
      let index = (toSolution ? state.placed.length : state.pool.length);
      if (over && over.dataset.id !== id) {
        const rect = over.getBoundingClientRect();
        const overIndex = indexIn(over.dataset.id, toSolution);
        index = event.clientY > rect.top + rect.height / 2 ? overIndex + 1 : overIndex;
      }
      moveTo(id, toSolution, index);
    });
  }

  const stopListening = appEvents.on('workspace:check-result', ({ id }) => {
    if (id !== item.id) return;
    wrongIndent = indentMismatches(items, state.placed);
    render();
  });

  render();

  function fresh() {
    return { pool: [...poolOrder], placed: [], blanks: {} };
  }

  function restore(nextFiles) {
    state = restoreState({ seed, parsons, items, files: nextFiles, poolOrder }) ?? fresh();
  }

  function indexIn(id, inSolution) {
    return inSolution ? state.placed.findIndex((entry) => entry.id === id) : state.pool.indexOf(id);
  }

  function isPlaced(id) {
    return state.placed.some((entry) => entry.id === id);
  }

  function changed({ focusId = null } = {}) {
    render(focusId);
    onChange?.(getFiles());
  }

  /** Přesune řádek do nabídky nebo řešení na daný index. */
  function moveTo(id, toSolution, index) {
    const from = state.placed.find((entry) => entry.id === id);
    const pool = state.pool.filter((poolId) => poolId !== id);
    const placed = state.placed.filter((entry) => entry.id !== id);
    if (toSolution) {
      const fromIndex = from ? state.placed.indexOf(from) : -1;
      const insertAt = fromIndex !== -1 && fromIndex < index ? index - 1 : index;
      placed.splice(Math.min(insertAt, placed.length), 0, { id, indent: from?.indent ?? 0 });
    } else {
      const fromIndex = state.pool.indexOf(id);
      const insertAt = fromIndex !== -1 && fromIndex < index ? index - 1 : index;
      pool.splice(Math.min(insertAt, pool.length), 0, id);
    }
    state = { ...state, pool, placed };
    wrongIndent.delete(id);
    changed({ focusId: id });
  }

  function toggle(id) {
    if (isPlaced(id)) moveTo(id, false, state.pool.length);
    else moveTo(id, true, state.placed.length);
  }

  function shift(id, delta) {
    if (isPlaced(id)) {
      const index = indexIn(id, true);
      const next = moveInList(state.placed, index, index + delta);
      if (next === state.placed) return;
      state = { ...state, placed: next };
    } else {
      const index = indexIn(id, false);
      const next = moveInList(state.pool, index, index + delta);
      if (next === state.pool) return;
      state = { ...state, pool: next };
    }
    changed({ focusId: id });
  }

  function indent(id, delta) {
    const entry = state.placed.find((e) => e.id === id);
    if (!entry) return false;
    const value = Math.min(maxIndent, Math.max(0, entry.indent + delta));
    if (value === entry.indent) return false;
    state = { ...state, placed: state.placed.map((e) => (e.id === id ? { ...e, indent: value } : e)) };
    wrongIndent.delete(id);
    changed({ focusId: id });
    return true;
  }

  function render(focusId = document.activeElement?.closest?.('.parsons__line')?.dataset.id ?? null) {
    poolList.replaceChildren(...state.pool.map((id) => lineElement(id, null)));
    solutionList.replaceChildren(...(state.placed.length ? state.placed.map((entry) => lineElement(entry.id, entry.indent)) : [emptySolution]));
    if (focusId) element.querySelector(`.parsons__line[data-id="${focusId}"]`)?.focus();
  }

  function lineElement(id, indentLevel) {
    const entry = byId.get(id);
    const inSolution = indentLevel !== null;
    const values = state.blanks[id] ?? {};
    const code = h(
      'code',
      { class: 'parsons__code' },
      lineSegments(entry.text).map((part) => {
        if ('text' in part) return highlightLines(part.text, lang)[0];
        const input = h('input', {
          type: 'text',
          class: 'parsons__blank',
          value: values[part.blank] ?? '',
          size: String(Math.max(3, (values[part.blank] ?? '').length + 1)),
          'aria-label': `Doplň mezeru ${part.blank}`,
          autocomplete: 'off',
          spellcheck: 'false',
        });
        input.addEventListener('keydown', (event) => event.stopPropagation());
        input.addEventListener('input', () => {
          input.size = Math.max(3, input.value.length + 1);
          state = { ...state, blanks: { ...state.blanks, [id]: { ...(state.blanks[id] ?? {}), [part.blank]: input.value } } };
          onChange?.(getFiles());
        });
        return input;
      }),
    );

    const li = h(
      'li',
      {
        class: `parsons__line${wrongIndent.has(id) ? ' is-indent-wrong' : ''}`,
        tabindex: '0',
        draggable: 'true',
        dataset: { id },
        'aria-label': `${entry.text.trim()}${inSolution ? `, odsazení ${indentLevel}` : ''}`,
        title: wrongIndent.has(id) ? 'Odsazení tohohle řádku nesedí.' : null,
      },
      h('span', { class: 'parsons__grip', 'aria-hidden': 'true' }),
      code,
      inSolution
        ? h(
            'span',
            { class: 'parsons__indent' },
            h('button', { type: 'button', class: 'parsons__indent-btn', tabindex: '-1', 'aria-label': 'Menší odsazení', onclick: () => indent(id, -1) }, svg(INDENT_LEFT, { size: 14 })),
            h('button', { type: 'button', class: 'parsons__indent-btn', tabindex: '-1', 'aria-label': 'Větší odsazení', onclick: () => indent(id, 1) }, svg(INDENT_RIGHT, { size: 14 })),
          )
        : null,
    );
    li.style.setProperty('--indent', String(indentLevel ?? 0));
    li.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', id);
      event.dataTransfer.effectAllowed = 'move';
      li.classList.add('is-dragging');
    });
    li.addEventListener('dragend', () => li.classList.remove('is-dragging'));
    li.addEventListener('dblclick', (event) => {
      if (event.target.closest('input, button')) return;
      toggle(id);
    });
    li.addEventListener('keydown', (event) => {
      if (event.target !== li) return;
      if (event.key === 'Enter' || event.key === ' ') toggle(id);
      else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && event.shiftKey) {
        const sibling = event.key === 'ArrowUp' ? li.previousElementSibling : li.nextElementSibling;
        sibling?.matches('.parsons__line') && sibling.focus();
      } else if (event.key === 'ArrowUp') shift(id, -1);
      else if (event.key === 'ArrowDown') shift(id, 1);
      else if (event.key === 'Tab' && inSolution) {
        // Na krajních hodnotách Tab normálně přesune fokus dál, ať z řešení jde odejít.
        if (!indent(id, event.shiftKey ? -1 : 1)) return;
      } else return;
      event.preventDefault();
    });
    return li;
  }

  function getFiles() {
    return assembleFiles({ seed, parsons, items, placed: state.placed, blanks: state.blanks });
  }

  return {
    element,
    getFiles,
    setFiles(nextFiles) {
      restore(nextFiles);
      wrongIndent = new Set();
      render();
    },
    focus() {
      element.querySelector('.parsons__list--solution .parsons__line, .parsons__line')?.focus();
    },
    activeFile: () => target?.name ?? null,
    selectFile: () => {},
    revealLine: () => false,
    destroy() {
      stopListening();
      element.remove();
    },
  };
}

function contextCode(lines, where) {
  return h(
    'pre',
    { class: 'parsons__context', 'aria-label': `Kód ${where} tvým řešením` },
    h('code', {}, lines.join('\n')),
  );
}
