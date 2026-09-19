// Typy otázek jsou v registru: `choice` (volby) a `text` (psaná odpověď, kontrakt kap. 4).
//   isSolved()     — zodpovězená správně, nebo si odpověď nechal ukázat (kontrakt kap. 4.5)
// ——— Pravidla (kontrakt kap. 4.5) ———
import './questions/questions.css';
import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { apiRequest } from '../api-request.js';
import { createRegistry } from '../core/registry.js';
import { createChoiceQuestion } from './questions/choice.js';
import { createTextQuestion } from './questions/text.js';
import { createConfidencePicker } from './questions/confidence.js';
import { createQuestionFlow } from './questions/flow.js';

const questionTypes = createRegistry('Typ otázky');

export { nextQuestionUid } from './questions/uid.js';

export function registerQuestionType(entry) {
  if (typeof entry?.match !== 'function' || typeof entry?.create !== 'function') {
    throw new Error(`Typ otázky „${entry?.id}" potřebuje match() a create()`);
  }
  return questionTypes.add(entry);
}

registerQuestionType({ id: 'choice', order: 1000, match: (question) => Array.isArray(question.answers), create: createChoiceQuestion });
registerQuestionType({
  id: 'text',
  order: 10,
  match: (question) => question.type === 'text' || (!Array.isArray(question.answers) && typeof question.expected === 'string'),
  create: createTextQuestion,
});

/** Id otázky pro opakování a pokusy (kontrakt kap. 2.10), nebo null, když parser klíč nedal. */
export function questionItemId(moduleId, question) {
  return moduleId && question?.key ? `q:${moduleId}#${question.key}` : null;
}

function recordAttempt(id, body) {
  apiRequest('POST', '/api/attempts', { id, ...body }).catch((error) => {
    console.warn(`Pokus u otázky ${id} se nepodařilo uložit: ${error.message}`);
  });
}

export function createQuestion(question, options = {}) {
  const type = questionTypes.list().find((entry) => entry.match(question));
  if (!type) throw new Error('Neznámý typ otázky (žádný registrovaný typ ji neumí zobrazit)');

  const {
    itemId = null,
    pretest = false,
    checkButton = false,
    askConfidence = Boolean(itemId) && !pretest,
    onEvaluated,
    onReveal,
    onChange,
  } = options;

  const flow = createQuestionFlow();
  let evaluatedAnswerVisible = false;

  const body = type.create(question, {
    ...options,
    onChange: () => {
      if (evaluatedAnswerVisible && !locked) clearFeedback();
      else if (!evaluatedAnswerVisible) feedback.textContent = '';
      onChange?.();
    },
    onSubmit: checkButton ? () => evaluateFromButton() : undefined,
  });
  const legacy = typeof body.grade !== 'function';
  const element = body.element;

  const confidence = askConfidence ? createConfidencePicker() : null;
  const verdict = h('p', { class: 'question__verdict', role: 'status' });
  const feedback = h('p', { class: 'question__feedback' });
  const actions = h('div', { class: 'question__actions' });
  const footer = h('div', { class: 'question__footer' }, confidence?.element, verdict, feedback, actions);
  element.append(footer);

  let locked = false;

  const checkBtn = checkButton
    ? h('button', { type: 'button', class: 'btn btn--primary btn--small', 'aria-label': 'Check / Zkontrolovat', onclick: () => evaluateFromButton() }, 'Check')
    : null;
  const showAnswerBtn = h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Show answer / Ukaž odpověď', onclick: () => api.showAnswer() }, svg(icons.eye), 'Show answer');
  const retryBtn = h('button', { type: 'button', class: 'btn btn--small', 'aria-label': 'Try again / Zkusit znovu', onclick: () => api.retry({ focus: true }) }, svg(icons.reset), 'Try again');
  renderActions();

  function renderActions() {
    const { answerShown, evaluations, correct } = flow.state();
    const buttons = [];
    if (checkBtn && !locked) buttons.push(checkBtn);
    if (!pretest && evaluations > 0 && correct === false && !answerShown) buttons.push(showAnswerBtn);
    if (checkButton && locked && !pretest) buttons.push(retryBtn);
    actions.replaceChildren(...buttons);
  }

  function clearFeedback() {
    evaluatedAnswerVisible = false;
    delete element.dataset.result;
    verdict.textContent = '';
    feedback.textContent = '';
    feedback.className = 'question__feedback';
    body.clearResult?.();
  }

  function setLocked(value) {
    locked = value;
    confidence?.setDisabled(value);
    if (confidence) confidence.element.hidden = value;
  }

  function evaluateFromButton() {
    if (!body.isAnswered()) {
      verdict.textContent = '';
      feedback.textContent = 'Nejdřív odpověz.';
      body.focus();
      return;
    }
    api.evaluate();
  }

  const answerPlace = question.type === 'text' ? 'pod polem' : 'označená';

  const api = {
    element,
    isAnswered: () => body.isAnswered(),
    isSolved: () => flow.state().solved,
    isCorrect: () => flow.state().correct === true,
    focus: () => body.focus(),
    answer: () => body.answer?.() ?? null,
    state: () => flow.state(),

    evaluate() {
      const chosenConfidence = confidence?.value() ?? null;

      if (legacy) {
        const correct = body.reveal();
        const result = flow.record(correct);
        flow.revealAnswer();
        setLocked(true);
        finish({ correct, showAnswer: true, failures: result.failures }, chosenConfidence);
        return { correct, solved: true, confidence: chosenConfidence, showAnswer: true, failures: result.failures };
      }

      const correct = body.grade();

      if (pretest) {
        flow.record(true);
        setLocked(true);
        body.showResult({ correct, showAnswer: true, pretest: true, locked: true });
        element.dataset.result = 'pretest';
        verdict.textContent = 'Uvidíme za chvíli.';
        feedback.textContent = 'Odpověď najdeš ve výkladu níž.';
        evaluatedAnswerVisible = true;
        renderActions();
        const outcome = { correct, solved: true, confidence: null, showAnswer: true, failures: 0 };
        onEvaluated?.(outcome);
        return outcome;
      }

      const { showAnswer, failures } = flow.record(correct);
      const lock = correct || showAnswer || !checkButton;
      setLocked(lock);
      body.showResult({ correct, showAnswer, locked: lock });
      finish({ correct, showAnswer, failures }, chosenConfidence);

      if (itemId) {
        recordAttempt(itemId, chosenConfidence ? { ok: correct, confidence: chosenConfidence } : { ok: correct });
      }
      const outcome = { correct, solved: flow.state().solved, confidence: chosenConfidence, showAnswer, failures };
      onEvaluated?.(outcome);
      return outcome;
    },

    reveal() {
      return api.evaluate().correct;
    },

    showAnswer() {
      const neverEvaluated = flow.state().evaluations === 0;
      flow.revealAnswer();
      setLocked(true);
      const correct = flow.state().correct === true;
      if (legacy) body.reveal();
      else body.showResult({ correct, showAnswer: true, pretest: neverEvaluated, locked: true });
      if (neverEvaluated && !legacy) {
        element.dataset.result = 'revealed';
        verdict.textContent = question.type === 'text' ? '' : 'Správná odpověď je označená.';
        feedback.textContent = '';
        evaluatedAnswerVisible = true;
        renderActions();
        onReveal?.();
        return;
      }
      element.dataset.result = correct ? 'correct' : 'wrong';
      verdict.textContent = correct ? 'Správně.' : `Správná odpověď je ${answerPlace}.`;
      evaluatedAnswerVisible = true;
      renderActions();
      onReveal?.();
    },

    retry({ focus = false } = {}) {
      const { reshuffle, round } = flow.retry();
      clearFeedback();
      body.reset?.({ reshuffle, round });
      confidence?.reset();
      setLocked(false);
      renderActions();
      if (focus) body.focus();
    },
  };

  function finish({ correct, showAnswer, failures }, chosenConfidence) {
    evaluatedAnswerVisible = true;
    element.dataset.result = correct ? 'correct' : 'wrong';
    feedback.className = 'question__feedback';
    feedback.textContent = '';

    if (correct) {
      verdict.textContent = 'Správně.';
    } else if (showAnswer) {
      verdict.textContent = failures >= 2 ? `Ani napodruhé to nesedí — správná odpověď je ${answerPlace}.` : `Špatně — správná odpověď je ${answerPlace}.`;
    } else if (question.multiple) {
      verdict.textContent = 'Nesedí to. Zkus to znovu.';
    } else {
      verdict.textContent = 'Špatně. Zkus to znovu.';
    }

    if (!correct && chosenConfidence === 'sure') {
      feedback.className = 'question__feedback question__feedback--sure-wrong';
      feedback.textContent = 'Tady ses mýlil s jistotou — zopakuješ si to zítra.';
    }
    renderActions();
  }

  return api;
}
