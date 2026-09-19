// Vykreslení jedné položky opakování podle typu (kontrakt kap. 12.3, ReviewItem).

import { h } from '../../dom.js';
import { renderMarkdown } from '../../markdown.js';
import { href } from '../../router.js';
import { createQuestion } from '../../components/question.js';
import { createCodeSetPanel } from '../../components/quiz-code-set.js';
import { createPractice } from './practice.js';

export function renderReviewItem(item, options) {
  switch (item.type) {
    case 'question':
      return questionItem(item.content, item, options);
    case 'card':
      if (item.content.type === 'free') return freeCard(item.content, options);
      if (item.content.type === 'code') return codeCard(item.content, options);
      return questionItem(item.content, item, options);
    case 'step':
      return stepItem(item.content, options);
    case 'explain':
      return explainItem(item.content, options);
    default:
      return { element: h('p', { class: 'notice notice--warning' }, `Tenhle druh položky („${item.type}“) zatím opakování neumí zobrazit.`) };
  }
}

function questionItem(question, item, { number, total, onAnswer }) {
  let reported = false;
  const report = (ok, confidence) => {
    if (reported) return;
    reported = true;
    onAnswer(ok, confidence);
  };
  const instance = createQuestion(question, {
    key: `${item.id}#opakovani`,
    number,
    total,
    itemId: null,
    askConfidence: true,
    checkButton: true,
    recallFirst: Array.isArray(question.answers),
    label: item.content?.type === 'css' ? 'Deklarace CSS' : 'Tvoje odpověď',
    onEvaluated: ({ correct, confidence }) => report(correct, confidence),
    onReveal: () => report(false, null),
  });
  const codeSet = question.codeSet ? createCodeSetPanel(question.codeSet) : null;
  return {
    element: h('div', { class: 'reviews-item__question' }, codeSet, instance.element),
    mount: () => instance.focus(),
  };
}

function freeCard(card, { onAnswer }) {
  const back = h('div', { class: 'reviews-free__back', hidden: true });
  const verdictButtons = h('div', { class: 'actions reviews-free__verdict', hidden: true });
  const show = h('button', { type: 'button', class: 'btn btn--primary btn--small', 'aria-label': 'Show answer / Ukaž odpověď' }, 'Show answer');

  show.addEventListener('click', () => {
    show.hidden = true;
    back.hidden = false;
    back.replaceChildren(h('p', { class: 'reviews-item__label' }, 'Modelová odpověď'), renderMarkdown(card.back, { className: 'prose' }));
    verdictButtons.hidden = false;
    verdictButtons.querySelector('button')?.focus();
  });

  const decide = (ok) => {
    for (const button of verdictButtons.querySelectorAll('button')) button.disabled = true;
    verdictButtons.dataset.chosen = ok ? 'knew' : 'did-not-know';
    onAnswer(ok, null);
  };
  verdictButtons.append(
    h('button', { type: 'button', class: 'btn', 'aria-label': 'I knew this / Věděl jsem', onclick: () => decide(true) }, 'I knew this'),
    h('button', { type: 'button', class: 'btn', 'aria-label': "I didn't know / Nevěděl jsem", onclick: () => decide(false) }, "I didn't know"),
  );

  return {
    element: h(
      'div',
      { class: 'reviews-free' },
      renderMarkdown(card.text, { className: 'prose question__prompt' }),
      h('p', { class: 'reviews-item__hint' }, 'Odpověz nahlas nebo v hlavě, jako bys byl u pohovoru. Pak si porovnej odpověď.'),
      h('div', { class: 'actions' }, show),
      back,
      verdictButtons,
    ),
    mount: () => show.focus(),
  };
}

function codeCard(card, { onAnswer }) {
  const practice = createPractice(
    { runtime: card.runtime ?? 'js', seed: card.seed, hints: card.hints, title: 'Karta s kódem', item: card },
    { onPass: () => onAnswer(true, null), onGiveUp: () => onAnswer(false, null), solution: card.solution ?? null },
  );
  return {
    element: h('div', { class: 'reviews-code' }, practice.element),
    mount: () => practice.mount(),
    destroy: () => practice.destroy(),
  };
}

function stepItem(step, { onAnswer }) {
  const practice = createPractice(
    { runtime: step.runtime, seed: step.seed, hints: step.hints, meta: step.meta, title: step.title, item: step },
    { onPass: () => onAnswer(true, null), onGiveUp: () => onAnswer(false, null) },
  );
  return {
    element: h(
      'div',
      { class: 'reviews-step' },
      h(
        'p',
        { class: 'reviews-item__hint' },
        'Postav to znovu bez zadání, jen podle požadavků. Když si nevíš rady, ',
        h('a', { href: href.step(step.stepId), target: '_blank', rel: 'noopener' }, 'otevři původní krok'),
        '.',
      ),
      practice.element,
    ),
    mount: () => practice.mount(),
    destroy: () => practice.destroy(),
  };
}

function explainItem(explain, { onAnswer }) {
  const textarea = h('textarea', { class: 'text-answer__input reviews-explain__input', rows: '4', 'aria-label': 'Tvoje vysvětlení' });
  const reveal = h('div', { class: 'reviews-explain__reveal', hidden: true });
  const verdictButtons = h('div', { class: 'actions', hidden: true });
  const show = h('button', { type: 'button', class: 'btn btn--primary btn--small', 'aria-label': 'Compare with model / Porovnat se vzorem' }, 'Compare with model');

  show.addEventListener('click', () => {
    show.hidden = true;
    textarea.readOnly = true;
    reveal.hidden = false;
    reveal.replaceChildren(
      h('p', { class: 'reviews-item__label' }, 'Tohle ti minule ve vysvětlení chybělo'),
      renderMarkdown(explain.point.text, { className: 'prose reviews-explain__point' }),
      h('p', { class: 'reviews-item__label' }, 'Vzorové vysvětlení'),
      renderMarkdown(explain.model, { className: 'prose' }),
    );
    verdictButtons.hidden = false;
    verdictButtons.querySelector('button')?.focus();
  });

  const decide = (ok) => {
    for (const button of verdictButtons.querySelectorAll('button')) button.disabled = true;
    onAnswer(ok, null);
  };
  verdictButtons.append(
    h('button', { type: 'button', class: 'btn', 'aria-label': 'Included this time / Tentokrát to v mém vysvětlení je', onclick: () => decide(true) }, 'Included this time'),
    h('button', { type: 'button', class: 'btn', 'aria-label': 'Still missing / Pořád mi to chybí', onclick: () => decide(false) }, 'Still missing'),
  );

  return {
    element: h(
      'div',
      { class: 'reviews-explain' },
      renderMarkdown(explain.prompt, { className: 'prose question__prompt' }),
      h('label', { class: 'text-answer__label' }, 'Napiš vysvětlení vlastními slovy (nikam se neukládá)', textarea),
      h('div', { class: 'actions' }, show),
      reveal,
      verdictButtons,
    ),
    mount: () => textarea.focus(),
  };
}
