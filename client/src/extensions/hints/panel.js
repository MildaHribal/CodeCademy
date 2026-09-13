// Odstupňované nápovědy u kroku, labu a projektu (kontrakt kap. 3.3, B1).
//
// Skládá se ze dvou prvků, které si obrazovka umístí sama:
// - `button`  „Potřebuju nápovědu (k ze n)" → další tip; po posledním tipu „Porovnat s řešením",
// - `panel`   otevřené tipy, po posledním tipu (nebo u kroku bez tipů) odkazy na výklad a porovnání.
// Po 2 neúspěšných kontrolách v řadě se tlačítko zvýrazní a zvýrazní se požadavek i tip,
// který k němu patří. Rozhodování je v logic.js.
import { h, replace } from '../../dom.js';
import { renderMarkdown } from '../../markdown.js';
import { attemptsApi, recordQuietly } from '../attempts/api.js';
import {
  firstFailedIndex, focusTipIndex, helpButtonState, nextFailStreak, restoredOpenedCount, shouldHighlight,
} from './logic.js';
import { renderSeeLinks } from './see-links.js';

let panelCounter = 0;

/**
 * @param {{
 *   id: string,                 // id kroku, labu nebo projektu (pro pokusy)
 *   item: { help?: { text: string, hintIndex: number | null }[], see?: string[] },
 *   hintList: { itemElement(index: number): HTMLElement | null },
 *   onCompare: () => void,      // otevře porovnání s řešením (s potvrzením řeší volající)
 *   signal: AbortSignal,
 * }} options
 * @returns {{ button: HTMLButtonElement, panel: HTMLElement, checked(result: { passed: boolean, run: object }): void }}
 */
export function createHintsUi({ id, item, hintList, onCompare, signal }) {
  const help = Array.isArray(item.help) ? item.help : [];
  const see = Array.isArray(item.see) ? item.see : [];
  const titleId = `hint-tips-title-${++panelCounter}`;

  let opened = 0; // otevřené tipy (vždy prvních N)
  let failStreak = 0; // neúspěšné kontroly v řadě (failsSinceOk)
  let lastFailed = null; // první selhaný požadavek poslední kontroly
  let passed = false;
  let panelRequested = false; // krok bez tipů: uživatel si panel otevřel
  let checkedLocally = false; // kontrola proběhla dřív, než se načetl stav ze serveru
  let focusedRequirement = null; // <li> požadavku se zvýrazněním hint--focus

  const button = h('button', { type: 'button', class: 'btn hint-tips__button' });
  const status = h('p', { class: 'visually-hidden', role: 'status' });
  const list = h('ol', { class: 'hint-tips__list' });
  const last = h('div', { class: 'hint-tips__last' });
  const panel = h(
    'section',
    { class: 'hint-tips', 'aria-labelledby': titleId, hidden: true, tabindex: '-1' },
    h('h2', { class: 'hint-tips__title', id: titleId }, 'Nápověda'),
    list,
    last,
    status,
  );

  button.addEventListener('click', () => {
    const { action } = helpButtonState(help.length, opened);
    if (action === 'tip') openNextTip();
    else if (action === 'compare') onCompare();
    else {
      panelRequested = true;
      render();
      panel.focus();
    }
  });

  render();
  loadSavedState();

  function openNextTip() {
    opened = Math.min(opened + 1, help.length);
    render();
    recordQuietly({ id, tipsOpened: opened });
    const newest = list.lastElementChild;
    newest?.focus();
    newest?.scrollIntoView({ block: 'nearest' });
  }

  async function loadSavedState() {
    try {
      const { items } = await attemptsApi.list(id, { signal });
      if (signal.aborted) return;
      const saved = items?.[id];
      if (!saved) return;
      opened = Math.max(opened, restoredOpenedCount(saved.tipsOpened, help.length));
      if (!checkedLocally) failStreak = Number(saved.failsSinceOk) || 0;
      render();
    } catch {
      // Bez uloženého stavu nápovědy fungují dál, jen začínají od nuly.
    }
  }

  function render() {
    const state = helpButtonState(help.length, opened);
    button.textContent = state.label;
    button.dataset.action = state.action;

    replace(list, help.slice(0, opened).map((tip, index) => renderTip(tip, index)));
    const showLast = help.length === 0 ? panelRequested : opened === help.length;
    last.hidden = !showLast;
    if (showLast) replace(last, renderLastStage());
    panel.hidden = opened === 0 && !showLast;
    updateHighlight();
  }

  function renderTip(tip, index) {
    const label = [`Tip ${index + 1} z ${help.length}`];
    if (Number.isInteger(tip.hintIndex)) label.push(`k požadavku ${tip.hintIndex + 1}`);
    return h(
      'li',
      { class: 'hint-tips__tip', tabindex: '-1', dataset: { tip: String(index) } },
      h('p', { class: 'hint-tips__label' }, label.join(' · ')),
      renderMarkdown(tip.text, { className: 'prose hint-tips__text' }),
    );
  }

  function renderLastStage() {
    const seeLinks = renderSeeLinks(see, { signal });
    return [
      h(
        'p',
        { class: 'hint-tips__last-text' },
        help.length === 0 ? 'K tomuhle kroku tipy nejsou.' : 'Tipy došly.',
        ' ',
        seeLinks ? 'Vrať se k výkladu, nebo porovnej svůj kód s autorovým řešením.' : 'Můžeš porovnat svůj kód s autorovým řešením.',
      ),
      seeLinks,
      h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn hint-tips__compare', onclick: () => onCompare() }, 'Porovnat s řešením')),
    ];
  }

  function updateHighlight() {
    const highlight = !passed && shouldHighlight(failStreak);
    const wasHighlighted = button.classList.contains('hint-tips__button--highlight');
    button.classList.toggle('hint-tips__button--highlight', highlight);
    for (const element of list.querySelectorAll('.hint-tips__tip--focus')) element.classList.remove('hint-tips__tip--focus');
    focusedRequirement?.classList.remove('hint--focus');
    focusedRequirement = null;
    if (!highlight) return;

    if (lastFailed !== null) {
      focusedRequirement = hintList.itemElement(lastFailed);
      focusedRequirement?.classList.add('hint--focus');
    }
    // Tip k selhanému požadavku zvýrazníme, když už je otevřený; jinak k němu vede zvýrazněné tlačítko.
    const tipIndex = focusTipIndex(help, opened, lastFailed);
    if (tipIndex !== null && tipIndex < opened) list.children[tipIndex]?.classList.add('hint-tips__tip--focus');
    if (!wasHighlighted) status.textContent = 'Dvakrát v řadě to neprošlo. Nápověda je připravená.';
  }

  return {
    button,
    panel,
    /** Výsledek kontroly: počítá neúspěchy v řadě a zvýraznění. */
    checked({ passed: nowPassed, run }) {
      checkedLocally = true;
      passed = Boolean(nowPassed);
      failStreak = nextFailStreak(failStreak, passed);
      lastFailed = passed ? null : firstFailedIndex(run);
      updateHighlight();
    },
  };
}
