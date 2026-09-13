// Otázka s volbami (--answer-- / --correct--, kontrakt kap. 4.1). Odpovědi se míchají
// deterministicky podle klíče, takže při překreslení zůstanou na místě. Když uživatel už
// viděl správnou odpověď, další pokus je zamíchá jinak (kolo míchání v klíči).
//
// Tenhle soubor jen kreslí volby a označuje je. Kdy se správná odpověď smí ukázat,
// rozhoduje question.js (pravidla v questions/flow.js).

import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { renderMarkdown } from '../../markdown.js';
import { shuffleBy } from '../../shuffle.js';
import { nextQuestionUid } from './uid.js';

/**
 * @param {{ text, multiple, answers: {text, correct, why}[] }} question
 * @param {{ key: string, number: number, total?: number, onChange?: () => void, recallFirst?: boolean }} options
 *   recallFirst — volby se ukážou až po kliknutí „Ukaž volby" (opakování: nejdřív odpověz v hlavě)
 */
export function createChoiceQuestion(question, { key, number, total, onChange, recallFirst = false }) {
  const groupName = `q-${nextQuestionUid()}`;
  const promptId = `${groupName}-prompt`;
  const numbered = question.answers.map((answer, originalIndex) => ({ ...answer, originalIndex }));

  const heading = h(
    'p',
    { class: 'question__number' },
    total ? `Otázka ${number} z ${total}` : `Otázka ${number}`,
    question.multiple ? h('span', { class: 'question__multiple' }, 'Vyber všechny správné odpovědi') : null,
  );
  const prompt = renderMarkdown(question.text, { className: 'prose question__prompt' });
  prompt.id = promptId;

  const options = numbered.map((answer) => {
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

  const list = h('ul', { class: 'answers' });
  const arrange = (round) => {
    const shuffleKey = round ? `${key}#kolo-${round}` : key;
    const order = shuffleBy(shuffleKey, options);
    list.replaceChildren(...order.map((o) => o.wrapper));
  };
  arrange(0);

  // V opakování se volby nejdřív schovají: uživatel si odpověď vybaví sám, pak si je ukáže.
  let choicesVisible = !recallFirst;
  const recallBox = recallFirst
    ? h(
        'div',
        { class: 'answers-recall' },
        h('p', {}, 'Odpověz nejdřív v hlavě. Až budeš mít odpověď, ukaž si volby.'),
        h('button', { type: 'button', class: 'btn btn--small', onclick: () => showChoices({ focus: true }) }, 'Ukaž volby'),
      )
    : null;
  if (recallFirst) list.hidden = true;

  function showChoices({ focus = false } = {}) {
    if (choicesVisible) return;
    choicesVisible = true;
    list.hidden = false;
    recallBox?.remove();
    if (focus) firstInput()?.focus();
  }

  const firstInput = () => list.querySelector('.answer__input');

  const element = h(
    'fieldset',
    { class: 'question question--choice', 'aria-describedby': promptId },
    h('legend', { class: 'visually-hidden' }, total ? `Otázka ${number} z ${total}` : `Otázka ${number}`),
    heading,
    prompt,
    recallBox,
    list,
  );

  function setDisabled(disabled) {
    for (const o of options) o.input.disabled = disabled;
  }

  function markCorrectAnswer(o) {
    o.label.dataset.state = 'correct';
    o.mark.replaceChildren(svg(icons.check, { size: 18, label: 'Správná odpověď' }));
    if (o.answer.why) o.why.replaceChildren(renderMarkdown(o.answer.why, { className: 'prose answer__why-text' }));
  }

  return {
    element,
    isAnswered: () => choicesVisible && options.some((o) => o.input.checked),
    focus: () => (choicesVisible ? firstInput()?.focus() : recallBox?.querySelector('button')?.focus()),

    /** Je aktuální volba správná? UI nemění. */
    grade: () => options.every((o) => o.input.checked === o.answer.correct),

    /** Odpověď uživatele pro záznam: texty zvolených odpovědí. */
    answer: () => options.filter((o) => o.input.checked).map((o) => o.answer.text),

    /**
     * Označí volby po vyhodnocení.
     *   correct     — odpověď je správná
     *   showAnswer  — ukázat správné odpovědi (správně, druhý neúspěch, „Ukaž odpověď")
     *   pretest     — otázka předem: ukáže správnou odpověď bez ✗ u zvolené
     *   locked      — volby zamknout (jinak jde hned vybrat jinou a zkusit znovu)
     */
    showResult({ correct, showAnswer, pretest = false, locked = true }) {
      showChoices();
      setDisabled(locked);
      for (const o of options) {
        const chosen = o.input.checked;
        o.why.replaceChildren();
        o.mark.replaceChildren();
        delete o.label.dataset.state;

        if (showAnswer || pretest) {
          if (o.answer.correct) markCorrectAnswer(o);
          else if (chosen && !pretest) {
            o.label.dataset.state = 'wrong';
            o.mark.replaceChildren(svg(icons.cross, { size: 18, label: 'Špatná odpověď' }));
            if (o.answer.why) o.why.replaceChildren(renderMarkdown(o.answer.why, { className: 'prose answer__why-text' }));
          } else if (locked) {
            o.label.dataset.state = 'neutral';
          }
          continue;
        }

        // První neúspěch: ✗ a vysvětlení jen u zvolených špatných odpovědí, správnou neprozradit.
        if (chosen && !o.answer.correct && !correct) {
          o.label.dataset.state = 'wrong';
          o.mark.replaceChildren(svg(icons.cross, { size: 18, label: 'Špatná odpověď' }));
          if (o.answer.why) o.why.replaceChildren(renderMarkdown(o.answer.why, { className: 'prose answer__why-text' }));
        }
      }
    },

    /** Smaže označení (uživatel mění odpověď po neúspěchu). Zvolené odpovědi nechá. */
    clearResult() {
      for (const o of options) {
        delete o.label.dataset.state;
        o.mark.replaceChildren();
        o.why.replaceChildren();
      }
      setDisabled(false);
    },

    /** Nový pokus: odznačí volby a případně je zamíchá jinak (round > 0). */
    reset({ reshuffle = false, round = 0 } = {}) {
      this.clearResult();
      for (const o of options) o.input.checked = false;
      if (reshuffle) arrange(round);
    },

    /** Starší rozhraní: vyhodnotí a ukáže správné odpovědi. Nové volání jde přes question.js. */
    reveal() {
      const correct = this.grade();
      this.showResult({ correct, showAnswer: true });
      return correct;
    },
  };
}
