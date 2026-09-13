// Sloupce se změnitelnou šířkou. Mezi každými dvěma panely je táhlo (separator),
// které jde tahat myší i posouvat šipkami z klávesnice. Poměry se pamatují v localStorage.

import { h } from '../dom.js';

const KEY_STEP = 0.02;

/**
 * @param {{ element: HTMLElement, min: number, share: number, label: string }[]} panes
 *   min = nejmenší šířka v px, share = výchozí podíl (součty se normalizují)
 * @param {string} storageKey
 */
export function createColumns(panes, storageKey) {
  const total = panes.reduce((sum, p) => sum + p.share, 0);
  let shares = readStored(storageKey, panes.length) ?? panes.map((p) => p.share / total);

  const container = h('div', { class: 'columns' });
  const gutters = [];

  panes.forEach((pane, i) => {
    pane.element.classList.add('columns__pane');
    container.append(pane.element);
    if (i < panes.length - 1) {
      const gutter = h('div', {
        class: 'columns__gutter',
        role: 'separator',
        tabindex: '0',
        'aria-orientation': 'vertical',
        'aria-label': `Šířka panelů ${pane.label} a ${panes[i + 1].label}`,
        'aria-valuemin': '0',
        'aria-valuemax': '100',
      });
      gutter.addEventListener('pointerdown', (event) => startDrag(event, i));
      gutter.addEventListener('keydown', (event) => onKey(event, i));
      gutter.addEventListener('dblclick', () => {
        shares = panes.map((p) => p.share / total);
        apply(true);
      });
      gutters.push(gutter);
      container.append(gutter);
    }
  });

  function apply(save = false) {
    const template = shares
      .map((share, i) => `minmax(${panes[i].min}px, ${share.toFixed(4)}fr)`)
      .join(' var(--gutter-size) ');
    container.style.setProperty('--columns', template);
    gutters.forEach((gutter, i) => gutter.setAttribute('aria-valuenow', String(Math.round(shares[i] * 100))));
    if (save) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(shares));
      } catch {
        // Úložiště nemusí být dostupné (anonymní okno) — šířky se pak jen nezapamatují.
      }
    }
  }

  /** Posune hranici mezi panelem i a i+1 tak, aby panel i měl šířku leftWidth (px). */
  function resizePair(i, leftWidth) {
    const left = panes[i].element.getBoundingClientRect().width;
    const right = panes[i + 1].element.getBoundingClientRect().width;
    const pairWidth = left + right;
    const clamped = Math.min(Math.max(leftWidth, panes[i].min), pairWidth - panes[i + 1].min);
    const pairShare = shares[i] + shares[i + 1];
    shares[i] = (pairShare * clamped) / pairWidth;
    shares[i + 1] = pairShare - shares[i];
    apply();
  }

  function startDrag(event, i) {
    event.preventDefault();
    const gutter = gutters[i];
    gutter.setPointerCapture(event.pointerId);
    container.classList.add('is-resizing');
    const onMove = (e) => resizePair(i, e.clientX - panes[i].element.getBoundingClientRect().left);
    const onUp = () => {
      gutter.removeEventListener('pointermove', onMove);
      gutter.removeEventListener('pointerup', onUp);
      gutter.removeEventListener('pointercancel', onUp);
      container.classList.remove('is-resizing');
      apply(true);
    };
    gutter.addEventListener('pointermove', onMove);
    gutter.addEventListener('pointerup', onUp);
    gutter.addEventListener('pointercancel', onUp);
  }

  function onKey(event, i) {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    const containerWidth = container.getBoundingClientRect().width;
    const left = panes[i].element.getBoundingClientRect().width;
    resizePair(i, left + direction * KEY_STEP * containerWidth);
    apply(true);
  }

  apply();
  return container;
}

function readStored(key, count) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(value) && value.length === count && value.every((n) => typeof n === 'number' && n > 0)) {
      return value;
    }
  } catch {
    // Neplatná nebo nedostupná hodnota — použijeme výchozí poměry.
  }
  return null;
}
