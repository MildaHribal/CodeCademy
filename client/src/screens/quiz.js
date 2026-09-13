// Kvíz: otázky po jedné nebo všechny najednou, vyhodnocení s vysvětlením a skóre.
// Splněný je, když podíl správných odpovědí dosáhne hranice `pass`.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';
import { minutes, percent, questions as questionsText } from '../text.js';
import { createQuestion } from '../components/question.js';
import { nextModuleLink, backLink } from './nav.js';

const MODE_KEY = 'akademie.quizMode';

export function renderQuiz(ctx, { module, nav }) {
  const quiz = module.quiz;
  const page = h('div', { class: 'page quiz' });
  ctx.root.append(page);

  const best = progress.score(module.id);
  page.append(
    h(
      'header',
      { class: 'module-head' },
      h(
        'p',
        { class: 'module-head__meta' },
        ['Kvíz', questionsText(quiz.questions.length), minutes(module.minutes)].filter(Boolean).join(', '),
        progress.isCompleted(module.id) ? h('span', { class: 'badge badge--done' }, svg(icons.check, { size: 14 }), 'Splněno') : null,
      ),
      h('h1', { class: 'module-head__title' }, module.title),
      h(
        'p',
        { class: 'module-head__lead' },
        `Ke splnění potřebuješ správně aspoň ${percent(quiz.pass)} otázek.`,
        best != null ? ` Tvůj nejlepší výsledek je ${percent(best)}.` : '',
      ),
    ),
  );

  const body = h('div', { class: 'quiz__body' });
  let round = null;
  page.append(
    modeSwitch(readMode(), {
      onChange: (mode) => start(mode),
      // Potvrzení chceme jen tehdy, když by přepnutí zahodilo rozpracované odpovědi.
      shouldConfirm: () => Boolean(round && !round.evaluated && round.items.some((q) => q.isAnswered())),
    }),
    body,
  );

  function start(mode) {
    saveMode(mode);
    body.replaceChildren();
    round = createRound(quiz, module.id, (score, items) => evaluate(score, items));
    if (mode === 'all') showAll(body, round);
    else showOneByOne(body, round);
  }

  async function evaluate(score, items) {
    const passed = score >= quiz.pass - 1e-9;
    const correct = Math.round(score * items.length);

    // Po vyhodnocení ukážeme všechny otázky pod sebou i s vysvětlením.
    const summary = h('div', { class: `quiz-summary quiz-summary--${passed ? 'pass' : 'fail'}`, role: 'status', tabindex: '-1' });
    const review = h('div', { class: 'questions' }, items.map((q) => q.element));
    body.replaceChildren(summary, review);

    summary.append(
      h('p', { class: 'quiz-summary__score' }, `${correct} z ${items.length}`),
      h(
        'div',
        { class: 'quiz-summary__text' },
        h(
          'p',
          { class: 'result__title' },
          passed ? 'Kvíz je splněný.' : `Tentokrát ${percent(score)}. Ke splnění potřebuješ ${percent(quiz.pass)}.`,
        ),
        h('p', {}, passed ? 'Níž si můžeš projít vysvětlení ke všem odpovědím.' : 'Projdi si vysvětlení u odpovědí a zkus to znovu.'),
      ),
    );
    const actions = h(
      'div',
      { class: 'actions' },
      passed ? nextModuleLink(nav) : null,
      h('button', { type: 'button', class: passed ? 'btn' : 'btn btn--primary', onclick: () => start(readMode()) }, svg(icons.reset), 'Zkusit znovu'),
      passed ? null : backLink(nav),
    );
    summary.append(actions);
    summary.focus();

    if (passed) {
      try {
        await progress.complete(module.id, score);
      } catch (error) {
        if (!ctx.signal.aborted) {
          summary.append(h('p', { class: 'result__warning' }, `Výsledek se nepodařilo uložit: ${error.message}`));
        }
      }
    }
  }

  start(readMode());
}

/** Jedno kolo kvízu: sada otázek a funkce, která je vyhodnotí. */
function createRound(quiz, quizId, onEvaluate) {
  const items = quiz.questions.map((question, index) =>
    createQuestion(question, { key: `${quizId}#${index}`, number: index + 1, total: quiz.questions.length }),
  );
  return {
    items,
    evaluated: false,
    evaluate() {
      this.evaluated = true;
      const correct = items.map((q) => q.reveal()).filter(Boolean).length;
      onEvaluate(correct / items.length, items);
    },
  };
}

function showAll(container, round) {
  const status = h('p', { class: 'quiz__status', role: 'status' });
  const submit = h('button', { type: 'button', class: 'btn btn--primary' }, 'Vyhodnotit');
  submit.addEventListener('click', () => {
    const missing = round.items.filter((q) => !q.isAnswered());
    if (missing.length) {
      status.textContent = `Ještě odpověz na všechny otázky (chybí ${missing.length}).`;
      missing[0].focus();
      return;
    }
    round.evaluate();
  });
  container.append(h('div', { class: 'questions' }, round.items.map((q) => q.element)), status, h('div', { class: 'actions' }, submit));
}

function showOneByOne(container, round) {
  let index = 0;
  const slot = h('div', { class: 'quiz__slot' });
  const status = h('p', { class: 'quiz__status', role: 'status' });
  const prev = h('button', { type: 'button', class: 'btn' }, svg(icons.arrowLeft), 'Předchozí');
  const next = h('button', { type: 'button', class: 'btn btn--primary' });
  const meter = h('div', { class: 'quiz__meter', 'aria-hidden': 'true' }, round.items.map(() => h('span', {})));

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => {
    if (!round.items[index].isAnswered()) {
      status.textContent = 'Nejdřív vyber odpověď.';
      round.items[index].focus();
      return;
    }
    if (index === round.items.length - 1) round.evaluate();
    else show(index + 1);
  });

  function show(newIndex, { moveFocus = true } = {}) {
    index = newIndex;
    status.textContent = '';
    slot.replaceChildren(round.items[index].element);
    prev.disabled = index === 0;
    next.replaceChildren(index === round.items.length - 1 ? 'Vyhodnotit' : 'Další otázka', index === round.items.length - 1 ? '' : svg(icons.arrowRight));
    [...meter.children].forEach((dot, i) => {
      dot.dataset.state = i === index ? 'current' : round.items[i].isAnswered() ? 'answered' : 'open';
    });
    if (moveFocus) round.items[index].focus();
  }

  container.append(meter, slot, status, h('div', { class: 'actions quiz__nav' }, prev, next));
  show(0, { moveFocus: false });
}

function modeSwitch(initial, { onChange, shouldConfirm }) {
  const option = (value, label) =>
    h(
      'label',
      { class: 'segmented__option' },
      h('input', {
        type: 'radio',
        name: 'quiz-mode',
        value,
        checked: value === initial,
        onchange: (event) => {
          if (!event.target.checked) return;
          if (shouldConfirm() && !window.confirm('Přepnutím začneš kvíz znovu a odpovědi se smažou. Pokračovat?')) {
            // Uživatel si to rozmyslel — vrátíme původní volbu.
            event.target.closest('fieldset').querySelector(`input[value="${readMode()}"]`).checked = true;
            return;
          }
          onChange(value);
        },
      }),
      h('span', {}, label),
    );
  return h(
    'fieldset',
    { class: 'segmented' },
    h('legend', { class: 'segmented__legend' }, 'Zobrazení otázek'),
    option('one', 'Po jedné'),
    option('all', 'Všechny najednou'),
  );
}

function readMode() {
  try {
    return localStorage.getItem(MODE_KEY) === 'all' ? 'all' : 'one';
  } catch {
    return 'one';
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Bez úložiště se volba jen nezapamatuje.
  }
}
