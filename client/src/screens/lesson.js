// Lekce: výklad v markdownu, bloky (živé ukázky…) a kontrolní otázky na konci.
// Splněná je, když uživatel správně odpoví na všechny otázky
// (bez otázek stačí tlačítko Mám přečteno) a splní podmínky přidané bloky (addRequirement).
//
// Bloky vykresluje registr (lesson/blocks.js), rozšíření obrazovky se připojují přes
// lessonExtensions (lesson/extensions.js). Tento soubor by nástroje neměly potřebovat měnit.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';
import { minutes } from '../text.js';
import { appEvents } from '../core/events.js';
import { createSlots } from '../core/slots.js';
import { createQuestion } from '../components/question.js';
import { lessonBlockRenderer } from '../lesson/blocks.js';
import '../lesson/blocks/index.js';
import { lessonExtensions } from '../lesson/extensions.js';
import { createSlugger } from '../../../shared/anchors.js';
import { nextModuleLink } from './nav.js';

export function renderLesson(ctx, { module, nav }) {
  const { blocks, questions } = module.lesson;
  const startsWithHeading = blocks[0]?.kind === 'md' && /^#\s/.test(blocks[0].text);

  const article = h('article', { class: 'page lesson' });
  ctx.root.append(article);

  const slots = createSlots(['head', 'before-finish', 'end', 'aside']);
  const requirements = [];

  const lesson = {
    module,
    id: module.id,
    nav,
    article,
    signal: ctx.signal,
    onCleanup: ctx.onCleanup,
    addToSlot: slots.addToSlot,
    addRequirement(requirement) {
      requirements.push(requirement);
    },
    unmetRequirements: () => requirements.filter((r) => !r.isMet()),
    headings: () =>
      [...article.querySelectorAll('[data-anchor]')].map((element) => ({
        anchor: element.dataset.anchor,
        text: element.textContent,
        level: Number(element.tagName.slice(1)),
        element,
      })),
  };

  article.append(
    h(
      'header',
      { class: 'module-head' },
      h(
        'p',
        { class: 'module-head__meta' },
        ['Lekce', minutes(module.minutes) ? `${minutes(module.minutes)} čtení` : null].filter(Boolean).join(', '),
        progress.isCompleted(module.id) ? h('span', { class: 'badge badge--done' }, svg(icons.check, { size: 14 }), 'Splněno') : null,
      ),
      startsWithHeading ? null : h('h1', { class: 'module-head__title' }, module.title),
    ),
    slots.element('head'),
  );

  // Výklad a bloky. Bloky, které potřebují být ve stránce (iframe náhledu), dostanou mount().
  const slugger = createSlugger();
  const counters = new Map();
  blocks.forEach((block, index) => {
    const number = (counters.get(block.kind) ?? 0) + 1;
    counters.set(block.kind, number);
    const renderer = lessonBlockRenderer(block.kind);
    if (!renderer) {
      console.warn(`Neznámý blok lekce „${block.kind}"`);
      article.append(h('p', { class: 'notice notice--warning' }, `Tenhle blok („${block.kind}“) zatím aplikace neumí zobrazit.`));
      return;
    }
    const rendered = renderer.render(block, { lesson, index, number, slugger });
    const element = rendered instanceof Node ? rendered : rendered?.element;
    if (element) article.append(element);
    if (!(rendered instanceof Node) && rendered) {
      rendered.mount?.();
      if (rendered.destroy) ctx.onCleanup(() => rendered.destroy());
    }
  });

  article.append(slots.element('before-finish'));
  const finish = h('section', { class: 'lesson__finish', 'aria-labelledby': 'lesson-finish-title' });
  article.append(finish, slots.element('end'), slots.element('aside'));

  const env = { ctx, module, nav, lesson };
  if (questions.length) renderQuestions(finish, { ...env, questions });
  else renderReadButton(finish, env);

  ctx.onCleanup(lessonExtensions.mount(lesson));
  appEvents.emit('lesson:mount', { lesson });
}

/** Zpráva, když lekce ještě nesplňuje podmínky přidané bloky; jinak null. */
function unmetMessage(lesson) {
  const unmet = lesson.unmetRequirements();
  if (!unmet.length) return null;
  const labels = unmet.map((r) => r.label).filter(Boolean);
  return h('p', {}, labels.length ? `Ještě chybí: ${labels.join(', ')}.` : `Ještě splň úkoly ve výkladu (chybí ${unmet.length}).`);
}

async function completeLesson({ ctx, module, lesson }) {
  await progress.complete(module.id);
  if (!ctx.signal.aborted) appEvents.emit('lesson:complete', { lesson, id: module.id });
}

function renderReadButton(container, env) {
  const { ctx, module, nav, lesson } = env;
  const status = h('div', { class: 'lesson__status', role: 'status' });
  const button = h('button', { type: 'button', class: 'btn btn--primary' }, 'Mám přečteno');

  container.append(h('h2', { id: 'lesson-finish-title', class: 'lesson__finish-title' }, 'Hotovo?'), status);

  if (progress.isCompleted(module.id)) {
    showDone(status, nav);
    return;
  }

  button.addEventListener('click', async () => {
    const unmet = unmetMessage(lesson);
    if (unmet) {
      status.replaceChildren(unmet);
      return;
    }
    button.disabled = true;
    try {
      await completeLesson(env);
      if (ctx.signal.aborted) return;
      button.remove();
      showDone(status, nav);
    } catch (error) {
      button.disabled = false;
      status.replaceChildren(h('p', { class: 'result__warning' }, `Splnění se nepodařilo uložit: ${error.message}`));
    }
  });
  container.append(h('div', { class: 'actions' }, button));
}

function renderQuestions(container, env) {
  const { ctx, module, nav, questions, lesson } = env;
  container.replaceChildren(
    h('h2', { id: 'lesson-finish-title', class: 'lesson__finish-title' }, 'Kontrolní otázky'),
    h('p', { class: 'lesson__finish-lead' }, 'Když na všechny odpovíš správně, lekce se označí jako splněná.'),
  );

  const status = h('div', { class: 'lesson__status', role: 'status' });
  const items = questions.map((question, index) =>
    createQuestion(question, {
      key: `${module.id}#${index}`,
      number: index + 1,
      total: questions.length,
      onChange: () => (status.textContent = ''),
    }),
  );
  const checkButton = h('button', { type: 'button', class: 'btn btn--primary' }, 'Zkontrolovat odpovědi');
  const actions = h('div', { class: 'actions' }, checkButton);

  container.append(h('div', { class: 'questions' }, items.map((q) => q.element)), status, actions);

  checkButton.addEventListener('click', async () => {
    const unanswered = items.filter((q) => !q.isAnswered()).length;
    if (unanswered) {
      status.replaceChildren(h('p', {}, `Ještě odpověz na všechny otázky (chybí ${unanswered}).`));
      items.find((q) => !q.isAnswered())?.focus();
      return;
    }

    const results = items.map((q, index) => ({ index, correct: q.reveal(), question: questions[index] }));
    const correct = results.filter((r) => r.correct).length;
    appEvents.emit('lesson:questions-checked', { lesson, id: module.id, results });
    actions.replaceChildren();

    if (correct < items.length) {
      status.replaceChildren(
        h('p', { class: 'result__title' }, `Správně ${correct} z ${items.length}.`),
        h('p', {}, 'Přečti si vysvětlení u odpovědí a zkus to znovu.'),
      );
      actions.append(
        h(
          'button',
          { type: 'button', class: 'btn', onclick: () => renderQuestions(container, env) },
          svg(icons.reset),
          'Zkusit znovu',
        ),
      );
      return;
    }

    const unmet = unmetMessage(lesson);
    if (unmet) {
      status.replaceChildren(h('p', { class: 'result__title' }, 'Odpovědi jsou správně.'), unmet);
      actions.append(h('button', { type: 'button', class: 'btn', onclick: () => renderQuestions(container, env) }, svg(icons.reset), 'Zkusit znovu'));
      return;
    }

    try {
      await completeLesson(env);
      if (ctx.signal.aborted) return;
      showDone(status, nav);
    } catch (error) {
      status.replaceChildren(h('p', { class: 'result__warning' }, `Odpovědi jsou správně, ale splnění se nepodařilo uložit: ${error.message}`));
    }
  });

  if (progress.isCompleted(module.id)) {
    container.append(h('p', { class: 'lesson__note' }, 'Lekci už máš splněnou. Otázky si můžeš projít znovu.'), h('div', { class: 'actions' }, nextModuleLink(nav, { primary: false })));
  }
}

function showDone(status, nav) {
  status.dataset.kind = 'pass';
  status.replaceChildren(
    h('p', { class: 'result__title' }, svg(icons.check, { size: 18 }), 'Lekce je splněná.'),
    h('div', { class: 'actions' }, nextModuleLink(nav)),
  );
}
