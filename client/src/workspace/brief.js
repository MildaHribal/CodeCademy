
import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';
import { renderMarkdown } from '../markdown.js';

export function createBriefPane({ item, module, isWorkshop, hintList, slots, onCheck, onReset }) {
  const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite' });

  const checkButton = h(
    'button',
    { type: 'button', class: 'btn btn--primary', 'aria-label': 'Check / Zkontrolovat', title: 'Check (Ctrl+Enter)', onclick: () => onCheck() },
    h('span', { class: 'btn__label' }, 'Check'),
    h('kbd', { class: 'btn__kbd' }, 'Ctrl+Enter'),
  );
  const resetButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet', 'aria-label': isWorkshop ? 'Reset step / Obnovit krok' : 'Reset task / Obnovit zadání', onclick: onReset },
    svg(icons.reset),
    isWorkshop ? 'Reset step' : 'Reset task',
  );

  const alreadyDone = progress.isCompleted(item.id);
  const element = h(
    'section',
    { class: 'pane pane--brief', 'aria-labelledby': 'brief-title' },
    h(
      'div',
      { class: 'pane__scroll brief' },
      h(
        'p',
        { class: 'brief__position' },
        isWorkshop ? module.title : 'Lab',
        alreadyDone ? h('span', { class: 'badge badge--done' }, svg(icons.check, { size: 14 }), 'Splněno dřív') : null,
      ),
      h('h1', { class: 'brief__title', id: 'brief-title' }, item.title),
      slots.element('brief-head'),
      renderMarkdown(item.description, { className: 'prose brief__description' }),
      slots.element('brief-after-description'),
      h('h2', { class: 'brief__subtitle' }, 'Požadavky'),
      hintList.element,
      slots.element('brief-after-hints'),
    ),
    h('div', { class: 'pane__footer' }, result, h('div', { class: 'actions' }, checkButton, resetButton, slots.element('actions'))),
  );

  return {
    element,
    result,
    checkButton,
    resetButton,
    setChecking(checking) {
      checkButton.disabled = checking;
      checkButton.dataset.busy = String(checking);
      checkButton.querySelector('.btn__label').textContent = checking ? 'Checking…' : 'Check';
    },
    setPassed(passed) {
      checkButton.hidden = passed;
    },
  };
}
