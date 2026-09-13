// Blok `check`: kontrolní otázka uprostřed výkladu a otázka předem (kontrakt kap. 5.4).
//
// :::check          — hodnotí se: pokusy, opakování (id q:<modul>#<klíč>) a podmínka splnění lekce
// :::check pretest  — nehodnotí se: po odpovědi „Uvidíme za chvíli" a odpověď bez ✗, nikam se neposílá
import { h } from '../../dom.js';
import { createQuestion } from '../../components/question.js';

/** Id otázky pro pokusy a opakování (kontrakt kap. 2.10); bez klíče od parseru null. */
export function lessonQuestionId(moduleId, question) {
  return moduleId && question?.key ? `q:${moduleId}#${question.key}` : null;
}

/**
 * Otázka s vlastním tlačítkem Zkontrolovat. Když registrovaný typ otázky starší rozhraní
 * (jen reveal()) tlačítko neumí, přidá ho tahle funkce.
 * @returns {{ question: object, element: HTMLElement, isSolved(): boolean }}
 */
export function createStandaloneQuestion(question, options) {
  let legacySolved = false;
  const instance = createQuestion(question, { ...options, checkButton: true });
  if (typeof instance.evaluate !== 'function') {
    const button = h('button', { type: 'button', class: 'btn btn--primary btn--small' }, 'Zkontrolovat');
    button.addEventListener('click', () => {
      if (!instance.isAnswered()) return instance.focus();
      const correct = instance.reveal();
      legacySolved = true;
      button.remove();
      options.onEvaluated?.({ correct, solved: true, confidence: null, showAnswer: true, failures: correct ? 0 : 1 });
    });
    instance.element.append(h('div', { class: 'actions' }, button));
  }
  return {
    question: instance,
    element: instance.element,
    isSolved: () => (typeof instance.isSolved === 'function' ? instance.isSolved() : legacySolved),
  };
}

// Pořadí hodnocených otázek v jedné lekci (pretest se nepočítá) — pro popisek „kontrolní otázka 2".
const gradedCounters = new WeakMap();

export const checkBlock = {
  kind: 'check',
  render(block, env) {
    const { lesson } = env;
    const pretest = Boolean(block.pretest);
    const title = pretest ? 'Co myslíš?' : 'Kontrolní otázka';
    const hint = pretest ? 'Tipni si předem, nehodnotí se.' : 'Ověř si, že ti právě vysvětlená věc sedí.';

    const element = h(
      'section',
      { class: `lesson-check${pretest ? ' lesson-check--pretest' : ''}`, 'aria-label': title, dataset: { block: 'check' } },
      h('header', { class: 'block-bar' }, h('span', { class: 'block-bar__title' }, title), h('span', { class: 'block-bar__hint' }, hint)),
    );

    let standalone;
    try {
      standalone = createStandaloneQuestion(block.question, {
        key: `${lesson.id}#check-${env.index}`,
        number: env.number,
        itemId: pretest ? null : lessonQuestionId(lesson.id, block.question),
        pretest,
      });
    } catch (error) {
      element.append(h('p', { class: 'notice notice--warning' }, `Tuhle otázku zatím aplikace neumí zobrazit (${error.message}).`));
      return element;
    }
    standalone.element.classList.add('lesson-check__question');
    element.append(standalone.element);

    if (!pretest) {
      const number = (gradedCounters.get(lesson) ?? 0) + 1;
      gradedCounters.set(lesson, number);
      lesson.addRequirement({
        id: `check-${env.index}`,
        label: `kontrolní otázka ${number}`,
        element,
        isMet: () => standalone.isSolved(),
      });
    }
    return element;
  },
};
