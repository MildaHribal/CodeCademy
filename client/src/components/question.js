// Jedna otázka s odpověďmi — používá ji kvíz i kontrolní otázky na konci lekce.
// Odpovědi se míchají deterministicky podle klíče, takže při překreslení zůstanou na místě.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { renderMarkdown } from '../markdown.js';
import { shuffleBy } from '../shuffle.js';

let uid = 0;

/**
 * @param {{ text, multiple, answers: {text, correct, why}[] }} question
 * @param {{ key: string, number: number, total?: number, onChange?: () => void }} options
 */
export function createQuestion(question, { key, number, total, onChange }) {
  const groupName = `q-${++uid}`;
  const promptId = `${groupName}-prompt`;
  const answers = shuffleBy(key, question.answers.map((answer, originalIndex) => ({ ...answer, originalIndex })));

  const heading = h(
    'p',
    { class: 'question__number' },
    total ? `Otázka ${number} z ${total}` : `Otázka ${number}`,
    question.multiple ? h('span', { class: 'question__multiple' }, 'Vyber všechny správné odpovědi') : null,
  );
  const prompt = renderMarkdown(question.text, { className: 'prose question__prompt' });
  prompt.id = promptId;

  const options = answers.map((answer) => {
    const input = h('input', {
      type: question.multiple ? 'checkbox' : 'radio',
      name: groupName,
      class: 'answer__input',
      onchange: () => onChange?.(),
    });
    const mark = h('span', { class: 'answer__mark' });
    const why = h('div', { class: 'answer__why' });
    const label = h(
      'label',
      { class: 'answer' },
      input,
      renderMarkdown(answer.text, { className: 'prose answer__text' }),
      mark,
    );
    return { answer, input, label, mark, why, wrapper: h('li', { class: 'answer-item' }, label, why) };
  });

  const verdict = h('p', { class: 'question__verdict', role: 'status' });
  const element = h(
    'fieldset',
    { class: 'question', 'aria-describedby': promptId },
    h('legend', { class: 'visually-hidden' }, total ? `Otázka ${number} z ${total}` : `Otázka ${number}`),
    heading,
    prompt,
    h('ul', { class: 'answers' }, options.map((o) => o.wrapper)),
    verdict,
  );

  return {
    element,
    isAnswered: () => options.some((o) => o.input.checked),
    focus: () => options[0]?.input.focus(),

    /** Vyhodnotí otázku, ukáže správné odpovědi a vysvětlení. Vrátí true, když je odpověď správná. */
    reveal() {
      const correct = options.every((o) => o.input.checked === o.answer.correct);
      element.dataset.result = correct ? 'correct' : 'wrong';
      for (const o of options) {
        o.input.disabled = true;
        const chosen = o.input.checked;
        o.label.dataset.state = o.answer.correct ? 'correct' : chosen ? 'wrong' : 'neutral';
        if (o.answer.correct) o.mark.replaceChildren(svg(icons.check, { size: 18, label: 'Správná odpověď' }));
        else if (chosen) o.mark.replaceChildren(svg(icons.cross, { size: 18, label: 'Špatná odpověď' }));
        // Vysvětlení ukážeme u toho, co uživatel vybral, a u správných odpovědí.
        if (o.answer.why && (chosen || o.answer.correct)) {
          o.why.replaceChildren(renderMarkdown(o.answer.why, { className: 'prose answer__why-text' }));
        }
      }
      verdict.textContent = correct ? 'Správně.' : question.multiple ? 'Nesedí to — zkontroluj označené odpovědi.' : 'Špatně.';
      return correct;
    },
  };
}
