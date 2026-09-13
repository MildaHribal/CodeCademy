// Lekce: výklad v markdownu, živé ukázky a kontrolní otázky na konci.
// Splněná je, když uživatel správně odpoví na všechny otázky
// (bez otázek stačí tlačítko Mám přečteno).

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';
import { renderMarkdown } from '../markdown.js';
import { minutes } from '../text.js';
import { createLiveExample } from '../components/live-example.js';
import { createQuestion } from '../components/question.js';
import { nextModuleLink } from './nav.js';

export function renderLesson(ctx, { module, nav }) {
  const { blocks, questions } = module.lesson;
  const startsWithHeading = blocks[0]?.kind === 'md' && /^#\s/.test(blocks[0].text);

  const article = h('article', { class: 'page lesson' });
  ctx.root.append(article);

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
  );

  // Výklad a živé ukázky. Ukázky se připojují až do prvků, které už jsou ve stránce.
  let liveNumber = 0;
  for (const block of blocks) {
    if (block.kind === 'md') {
      article.append(renderMarkdown(block.text, { className: 'prose lesson__text' }));
    } else {
      const host = h('div', { class: 'lesson__live' });
      article.append(host);
      const example = createLiveExample(host, block, { number: ++liveNumber });
      ctx.onCleanup(() => example.destroy());
    }
  }

  const finish = h('section', { class: 'lesson__finish', 'aria-labelledby': 'lesson-finish-title' });
  article.append(finish);

  if (questions.length) renderQuestions(finish, { ctx, module, nav, questions });
  else renderReadButton(finish, { ctx, module, nav });
}

function renderReadButton(container, { ctx, module, nav }) {
  const status = h('div', { class: 'lesson__status', role: 'status' });
  const button = h('button', { type: 'button', class: 'btn btn--primary' }, 'Mám přečteno');

  container.append(h('h2', { id: 'lesson-finish-title', class: 'lesson__finish-title' }, 'Hotovo?'), status);

  if (progress.isCompleted(module.id)) {
    showDone(status, nav);
    return;
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await progress.complete(module.id);
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

function renderQuestions(container, { ctx, module, nav, questions }) {
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

    const correct = items.map((q) => q.reveal()).filter(Boolean).length;
    actions.replaceChildren();

    if (correct < items.length) {
      status.replaceChildren(
        h('p', { class: 'result__title' }, `Správně ${correct} z ${items.length}.`),
        h('p', {}, 'Přečti si vysvětlení u odpovědí a zkus to znovu.'),
      );
      actions.append(
        h(
          'button',
          { type: 'button', class: 'btn', onclick: () => renderQuestions(container, { ctx, module, nav, questions }) },
          svg(icons.reset),
          'Zkusit znovu',
        ),
      );
      return;
    }

    try {
      await progress.complete(module.id);
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
