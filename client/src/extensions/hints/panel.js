// Odstupňované nápovědy u kroku, labu a projektu (kontrakt kap. 3.3, B1).
import { h, replace } from '../../dom.js';
import { renderMarkdown } from '../../markdown.js';
import { attemptsApi, recordQuietly } from '../attempts/api.js';
import {
  firstFailedIndex, focusTipIndex, helpButtonState, nextFailStreak, restoredOpenedCount, shouldHighlight,
} from './logic.js';
import { renderSeeLinks } from './see-links.js';
import { expand } from '../../motion.js';

let panelCounter = 0;

export function createHintsUi({ id, item, hintList, onCompare, signal }) {
  const help = Array.isArray(item.help) ? item.help : [];
  const see = Array.isArray(item.see) ? item.see : [];
  const titleId = `hint-tips-title-${++panelCounter}`;

  let opened = 0;
  let failStreak = 0;
  let lastFailed = null;
  let passed = false;
  let panelRequested = false;
  let checkedLocally = false;
  let focusedRequirement = null;

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
    expand(newest);
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
      h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn hint-tips__compare', 'aria-label': 'Compare with solution / Porovnat s řešením', onclick: () => onCompare() }, 'Compare with solution')),
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
    const tipIndex = focusTipIndex(help, opened, lastFailed);
    if (tipIndex !== null && tipIndex < opened) list.children[tipIndex]?.classList.add('hint-tips__tip--focus');
    if (!wasHighlighted) status.textContent = 'Dvakrát v řadě to neprošlo. Nápověda je připravená.';
  }

  return {
    button,
    panel,
    checked({ passed: nowPassed, run }) {
      checkedLocally = true;
      passed = Boolean(nowPassed);
      failStreak = nextFailStreak(failStreak, passed);
      lastFailed = passed ? null : firstFailedIndex(run);
      updateHighlight();
    },
  };
}
