// Otázka s psanou odpovědí (--expected--, kontrakt kap. 4.2). Stejná komponenta slouží
// pro otázky kvízu a lekce, :::check i pro karty opakování typu `output` a `css`.
//
// Porovnání odpovědi dělá výhradně shared/answers.js (checkTextAnswer) — stejná normalizace
// jako ve verify: mezery, " = ', koncový středník; u karty `css` pořadí deklarací.

import { h, replace } from '../../dom.js';
import { renderMarkdown } from '../../markdown.js';
import { checkTextAnswer } from '../../../../shared/answers.js';
import { nextQuestionUid } from './uid.js';

/**
 * @param {{ type, text, expected, accept?: string[], ignoreCase?: boolean, why?: string }} question
 * @param {{ number: number, total?: number, onChange?: () => void, onSubmit?: () => void, label?: string }} options
 *   onSubmit — Enter v jednořádkovém poli (Ctrl+Enter ve víceřádkovém)
 */
export function createTextQuestion(question, { number, total, onChange, onSubmit, label = 'Tvoje odpověď' }) {
  const uid = nextQuestionUid();
  const promptId = `text-q-${uid}-prompt`;
  const inputId = `text-q-${uid}-input`;
  const multiline = String(question.expected ?? '').includes('\n');

  const prompt = renderMarkdown(question.text, { className: 'prose question__prompt' });
  prompt.id = promptId;

  const input = h(multiline ? 'textarea' : 'input', {
    id: inputId,
    class: 'text-answer__input',
    ...(multiline ? { rows: String(Math.min(8, String(question.expected).split('\n').length + 1)) } : { type: 'text' }),
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    'aria-describedby': promptId,
    oninput: () => onChange?.(),
    onkeydown: (event) => {
      if (event.key !== 'Enter' || !onSubmit) return;
      if (multiline && !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      onSubmit();
    },
  });

  const solution = h('div', { class: 'text-answer__solution' });
  const box = h(
    'div',
    { class: 'text-answer' },
    h('label', { class: 'text-answer__label', for: inputId }, multiline ? `${label} (víc řádků)` : label),
    input,
    solution,
  );

  const element = h(
    'fieldset',
    { class: 'question question--text', 'aria-describedby': promptId },
    h('legend', { class: 'visually-hidden' }, total ? `Otázka ${number} z ${total}` : `Otázka ${number}`),
    h('p', { class: 'question__number' }, total ? `Otázka ${number} z ${total}` : `Otázka ${number}`),
    prompt,
    box,
  );

  function renderSolution() {
    const accept = (question.accept ?? []).filter(Boolean);
    // replace() z dom.js přeskočí null (replaceChildren by ho vypsal jako text „null").
    replace(
      solution,
      h('p', { class: 'text-answer__solution-title' }, 'Správná odpověď'),
      h('pre', { class: 'text-answer__expected' }, question.expected),
      accept.length
        ? h('p', { class: 'text-answer__accept' }, `Platí i: ${accept.map((a) => a.replace(/\n/g, ' ⏎ ')).join(' · ')}`)
        : null,
      question.why ? renderMarkdown(question.why, { className: 'prose text-answer__why' }) : null,
    );
  }

  return {
    element,
    isAnswered: () => input.value.trim() !== '',
    focus: () => input.focus(),
    grade: () => checkTextAnswer(question, input.value),
    answer: () => input.value,

    /** Po vyhodnocení: barva pole a (když se smí) správná odpověď s vysvětlením. */
    showResult({ correct, showAnswer, pretest = false, locked = true }) {
      input.disabled = locked;
      box.dataset.state = pretest ? 'pretest' : correct ? 'correct' : 'wrong';
      if (showAnswer || pretest) renderSolution();
      else solution.replaceChildren();
    },

    clearResult() {
      delete box.dataset.state;
      solution.replaceChildren();
      input.disabled = false;
    },

    reset() {
      this.clearResult();
      input.value = '';
    },

    reveal() {
      const correct = this.grade();
      this.showResult({ correct, showAnswer: true });
      return correct;
    },
  };
}
