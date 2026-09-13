// Kvíz: otázky po jedné nebo všechny najednou, vyhodnocení a souhrn.
// Splněný je, když podíl správných odpovědí dosáhne hranice `pass`.
//
// Otázky neprozradí odpověď (kontrakt kap. 4.5): po prvním vyhodnocení špatná otázka ukáže
// jen ✗ a vysvětlení zvolené odpovědi. Souhrn nabídne „Projít jen chybné" — při druhém
// neúspěchu už otázka ukáže správnou odpověď. Každá otázka jde odhalit i tlačítkem.
//
// Otázky sady `# --code--` jdou za sebou a vedle nich je kód jen ke čtení.
// Skóre každého průchodu se posílá do pokusů (první průchod si server pamatuje zvlášť).

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';
import { apiRequest } from '../api-request.js';
import { loadCurriculum, allModules } from '../content.js';
import { minutes, percent, questions as questionsText } from '../text.js';
import { createQuestion, questionItemId } from '../components/question.js';
import { createCodeSetPanel } from '../components/quiz-code-set.js';
import { appEvents } from '../core/events.js';
import { createExtensionPoint } from '../core/registry.js';
import { createSlots } from '../core/slots.js';
import { nextModuleLink, backLink } from './nav.js';
import { groupByCodeSet, isPassing, quizScore, refModuleId, seeHref } from './quiz-helpers.js';

/**
 * Rozšíření obrazovky kvízu:
 *   quizExtensions.register({ id, order, setup(quiz) { quiz.addToSlot('end', el); } })
 * API: module, id, quiz (data kvízu), signal, onCleanup, page, addToSlot(name, el, { order })
 * sloty: 'head' (pod hlavičkou), 'end' (konec stránky)
 * událost: appEvents 'quiz:evaluated' ({ id, score, passed, results: [{ index, correct, question }] })
 *   results obsahují všechny otázky kvízu s posledním vyhodnocením (i po „Projít jen chybné").
 */
export const quizExtensions = createExtensionPoint('kvízu');

const MODE_KEY = 'akademie.quizMode';

export function renderQuiz(ctx, { module, nav }) {
  const quiz = module.quiz;
  const codeSets = quiz.codeSets ?? [];
  const total = quiz.questions.length;
  const page = h('div', { class: `page quiz${codeSets.length ? ' page--wide quiz--code' : ''}` });
  ctx.root.append(page);

  const best = progress.score(module.id);
  page.append(
    h(
      'header',
      { class: 'module-head' },
      h(
        'p',
        { class: 'module-head__meta' },
        ['Kvíz', questionsText(total), minutes(module.minutes)].filter(Boolean).join(', '),
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
  const slots = createSlots(['head', 'end']);
  let session = null;
  let mode = readMode();
  page.append(
    slots.element('head'),
    modeSwitch(mode, {
      onChange: (mode) => start(mode),
      // Potvrzení chceme jen tehdy, když by přepnutí zahodilo rozpracované odpovědi.
      shouldConfirm: () => Boolean(session?.hasUnsavedAnswers()),
    }),
    body,
    slots.element('end'),
  );
  ctx.onCleanup(
    quizExtensions.mount({ module, id: module.id, quiz, signal: ctx.signal, onCleanup: ctx.onCleanup, page, addToSlot: slots.addToSlot }),
  );

  /** Nový kvíz od začátku (i po přepnutí zobrazení): nové otázky, první průchod. */
  function start(newMode) {
    mode = newMode;
    saveMode(mode);
    session = createSession(quiz, module.id);
    showRound(session.entries);
  }

  /** Jeden průchod nad vybranými otázkami (všechny, nebo jen chybné). */
  function showRound(entries) {
    body.replaceChildren();
    session.beginRound(entries);
    const onDone = () => evaluate(entries);
    if (mode === 'all') showAll(body, entries, codeSets, onDone);
    else showOneByOne(body, entries, codeSets, onDone);
  }

  async function evaluate(entries) {
    session.evaluateRound(entries);
    const score = session.score();
    const passed = isPassing(score, quiz.pass);
    const allResults = session.entries.map((entry) => ({ index: entry.index, correct: session.correctByIndex.get(entry.index) === true, question: entry.question }));
    appEvents.emit('quiz:evaluated', { id: module.id, score, passed, results: allResults });

    // Skóre průchodu do pokusů: server si první odeslané pamatuje jako firstScore (kontrakt kap. 12.2).
    apiRequest('POST', '/api/attempts', { id: module.id, score }).catch((error) => {
      console.warn(`Skóre kvízu se nepodařilo uložit do pokusů: ${error.message}`);
    });

    const correctCount = Math.round(score * total);
    const wrong = session.entries.filter((entry) => session.correctByIndex.get(entry.index) !== true);
    const summary = h('div', { class: `quiz-summary quiz-summary--${passed ? 'pass' : 'fail'}`, role: 'status', tabindex: '-1' });
    const reviewTitle = h('h2', { class: 'quiz__review-title' }, entries.length === total ? 'Tvoje odpovědi' : 'Otázky z tohohle průchodu');
    body.replaceChildren(summary, reviewTitle, questionList(entries, codeSets));

    summary.append(
      h('p', { class: 'quiz-summary__score' }, `${correctCount} z ${total}`),
      h(
        'div',
        { class: 'quiz-summary__text' },
        h(
          'p',
          { class: 'result__title' },
          passed ? 'Kvíz je splněný.' : `Zatím ${percent(score)}. Ke splnění potřebuješ ${percent(quiz.pass)}.`,
        ),
        h(
          'p',
          {},
          wrong.length === 0
            ? 'Všechny odpovědi jsou správně.'
            : 'U chybných otázek vidíš jen vysvětlení toho, co jsi zvolil. Zkus je projít znovu — napodruhé se ukáže správná odpověď.',
        ),
      ),
    );
    if (wrong.length) summary.append(wrongList(wrong));

    const actions = h(
      'div',
      { class: 'actions' },
      wrong.length
        ? h('button', { type: 'button', class: 'btn btn--primary', onclick: () => retry(wrong) }, svg(icons.reset), `Projít jen chybné (${wrong.length})`)
        : null,
      passed ? nextModuleLink(nav, { primary: wrong.length === 0 }) : null,
      h('button', { type: 'button', class: 'btn', onclick: () => retry(session.entries) }, 'Zkusit celý kvíz znovu'),
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

  function retry(entries) {
    for (const entry of entries) entry.item.retry();
    showRound(entries);
    body.querySelector('.quiz__meter, .questions')?.scrollIntoView({ block: 'nearest' });
  }

  start(mode);
}

/**
 * Stav kvízu: otázky (instance se drží po celou dobu, aby si pamatovaly pokusy)
 * a poslední výsledek každé otázky.
 */
function createSession(quiz, quizId) {
  const total = quiz.questions.length;
  const entries = quiz.questions.map((question, index) => ({
    index,
    question,
    item: createQuestion(question, {
      key: `${quizId}#${index}`,
      number: index + 1,
      total,
      itemId: questionItemId(quizId, question),
    }),
  }));
  const correctByIndex = new Map();
  let round = [];
  let evaluated = true;

  return {
    entries,
    correctByIndex,
    beginRound(roundEntries) {
      round = roundEntries;
      evaluated = false;
    },
    hasUnsavedAnswers: () => !evaluated && round.some((entry) => entry.item.isAnswered()),
    evaluateRound(roundEntries) {
      evaluated = true;
      return roundEntries.map((entry) => {
        const { correct } = entry.item.evaluate();
        correctByIndex.set(entry.index, correct);
        return { index: entry.index, correct };
      });
    },
    score: () => quizScore(correctByIndex, total),
  };
}

/** Otázky pod sebou; otázky jedné sady # --code-- ve skupině s panelem kódu. */
function questionList(entries, codeSets) {
  return h(
    'div',
    { class: 'questions' },
    groupByCodeSet(entries).map((group) => {
      const elements = group.entries.map((entry) => entry.item.element);
      const codeSet = group.code === null ? null : codeSets[group.code];
      if (!codeSet) return elements;
      return h('div', { class: 'quiz-code-group' }, createCodeSetPanel(codeSet), h('div', { class: 'quiz-code-group__questions' }, elements));
    }),
  );
}

/** Seznam chybných otázek s odkazy „kde si to zopakovat" (--see--). */
function wrongList(wrong) {
  const list = h('ul', { class: 'quiz-wrong' });
  const titles = new Map();
  const items = wrong.map((entry) => {
    const links = h('span', { class: 'quiz-wrong__links' });
    const refs = (entry.question.see ?? []).filter((ref) => seeHref(ref));
    for (const ref of refs) {
      links.append(h('a', { href: seeHref(ref), dataset: { ref } }, ref));
    }
    return h(
      'li',
      {},
      h('span', { class: 'quiz-wrong__number' }, `Otázka ${entry.index + 1}`),
      refs.length ? h('span', { class: 'quiz-wrong__see' }, 'Zopakuj si: ', links) : null,
    );
  });
  list.append(...items);

  // Názvy modulů místo holých referencí, když se osnova načte.
  loadCurriculum()
    .then((curriculum) => {
      for (const { module } of allModules(curriculum)) titles.set(module.id, module.title);
      for (const link of list.querySelectorAll('a[data-ref]')) {
        const ref = link.dataset.ref;
        const title = titles.get(refModuleId(ref));
        if (title) link.textContent = ref.includes('#') ? `${title} (${ref.split('#')[1].replace(/-/g, ' ')})` : title;
      }
    })
    .catch(() => {});

  return h('div', { class: 'quiz-summary__wrong' }, h('p', { class: 'quiz-summary__wrong-title' }, 'Chybné otázky'), list);
}

function showAll(container, entries, codeSets, onDone) {
  const status = h('p', { class: 'quiz__status', role: 'status' });
  const submit = h('button', { type: 'button', class: 'btn btn--primary' }, 'Vyhodnotit');
  submit.addEventListener('click', () => {
    const missing = entries.filter((entry) => !entry.item.isAnswered());
    if (missing.length) {
      status.textContent = `Ještě odpověz na všechny otázky (chybí ${missing.length}).`;
      missing[0].item.focus();
      return;
    }
    onDone();
  });
  container.append(questionList(entries, codeSets), status, h('div', { class: 'actions' }, submit));
}

function showOneByOne(container, entries, codeSets, onDone) {
  let position = 0;
  const slot = h('div', { class: 'quiz__slot' });
  const status = h('p', { class: 'quiz__status', role: 'status' });
  const prev = h('button', { type: 'button', class: 'btn' }, svg(icons.arrowLeft), 'Předchozí');
  const next = h('button', { type: 'button', class: 'btn btn--primary' });
  const meter = h('div', { class: 'quiz__meter', 'aria-hidden': 'true' }, entries.map(() => h('span', {})));
  const panels = new Map(); // index sady kódu → panel (ať se při přepínání otázek nepřekresluje)

  prev.addEventListener('click', () => show(position - 1));
  next.addEventListener('click', () => {
    const current = entries[position].item;
    if (!current.isAnswered()) {
      status.textContent = 'Nejdřív odpověz.';
      current.focus();
      return;
    }
    if (position === entries.length - 1) onDone();
    else show(position + 1);
  });

  function show(newPosition, { moveFocus = true } = {}) {
    position = newPosition;
    status.textContent = '';
    const entry = entries[position];
    const code = Number.isInteger(entry.question.code) ? entry.question.code : null;
    if (code !== null && codeSets[code]) {
      if (!panels.has(code)) panels.set(code, createCodeSetPanel(codeSets[code]));
      slot.replaceChildren(h('div', { class: 'quiz-code-group' }, panels.get(code), h('div', { class: 'quiz-code-group__questions' }, entry.item.element)));
    } else {
      slot.replaceChildren(entry.item.element);
    }
    prev.disabled = position === 0;
    const last = position === entries.length - 1;
    next.replaceChildren(last ? 'Vyhodnotit' : 'Další otázka', last ? '' : svg(icons.arrowRight));
    [...meter.children].forEach((dot, i) => {
      dot.dataset.state = i === position ? 'current' : entries[i].item.isAnswered() ? 'answered' : 'open';
    });
    if (moveFocus) entry.item.focus();
  }

  container.append(meter, slot, status, h('div', { class: 'actions quiz__nav' }, prev, next));
  show(0, { moveFocus: false });
}

function modeSwitch(initial, { onChange, shouldConfirm }) {
  let current = initial;
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
            event.target.closest('fieldset').querySelector(`input[value="${current}"]`).checked = true;
            return;
          }
          current = value;
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
