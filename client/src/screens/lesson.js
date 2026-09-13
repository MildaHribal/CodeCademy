// Lekce: výklad v markdownu, interaktivní bloky a kontrolní otázky na konci (kontrakt kap. 5).
//
// Splněná je (kap. 5.8), když uživatel vyřeší všechny `:::check` bez pretestu a všechny
// otázky z `# --questions--` a klikne „Mám přečteno". Vyřešená = zodpovězená správně,
// nebo si odpověď nechal ukázat. Předpovědi, pretest, :::explain a :::memory splnění nepodmiňují.
//
// Bloky vykresluje registr (lesson/blocks.js), rozšíření obrazovky se připojují přes
// lessonExtensions (lesson/extensions.js). Tento soubor by nástroje neměly potřebovat měnit.
//
// Adresa `#/modul/sekce/lekce?kotva=nadpis` po vykreslení odscrolluje na nadpis s touto kotvou
// (kontrakt kap. 2.9).

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';
import { parseHash } from '../router.js';
import { minutes } from '../text.js';
import { appEvents } from '../core/events.js';
import { createSlots } from '../core/slots.js';
import { lessonBlockRenderer } from '../lesson/blocks.js';
import '../lesson/blocks/index.js';
import { createStandaloneQuestion, lessonQuestionId } from '../lesson/blocks/check.js';
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
    /** { id, label, isMet: () => boolean, element? } — element = kam skočit, když podmínka chybí */
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
    let rendered;
    try {
      rendered = renderer.render(block, { lesson, index, number, slugger });
    } catch (error) {
      // Jeden rozbitý blok nesmí schovat zbytek výkladu.
      console.error(`Blok lekce „${block.kind}" se nepodařilo vykreslit`, error);
      article.append(h('p', { class: 'notice notice--warning' }, `Tenhle blok („${block.kind}“) se nepodařilo zobrazit: ${error.message}`));
      return;
    }
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

  renderFinish(finish, { ctx, module, nav, lesson, questions });

  ctx.onCleanup(lessonExtensions.mount(lesson));
  appEvents.emit('lesson:mount', { lesson });
  scrollToAnchor(lesson, ctx);
}

/** Skok na nadpis z adresy `?kotva=` (router ji dává do route.query). */
function scrollToAnchor(lesson, ctx) {
  const anchor = parseHash().query?.kotva;
  if (!anchor) return;
  const target = lesson.headings().find((heading) => heading.anchor === anchor)?.element;
  if (!target) return;
  // Až po rozvržení stránky (main.js před vykreslením odscrolluje nahoru).
  requestAnimationFrame(() => {
    if (ctx.signal.aborted) return;
    target.scrollIntoView({ block: 'start' });
    target.classList.add('is-target');
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    const timer = setTimeout(() => target.classList.remove('is-target'), 2400);
    ctx.onCleanup(() => clearTimeout(timer));
  });
}

async function completeLesson({ ctx, module, lesson }) {
  await progress.complete(module.id);
  if (!ctx.signal.aborted) appEvents.emit('lesson:complete', { lesson, id: module.id });
}

/** Otázky z `# --questions--` (každá s vlastním Zkontrolovat) a tlačítko Mám přečteno. */
function renderFinish(container, env) {
  const { ctx, module, nav, lesson, questions } = env;

  if (questions.length) {
    const evaluated = new Map(); // index → { correct }
    const items = questions.map((question, index) => {
      const item = createStandaloneQuestion(question, {
        key: `${module.id}#${index}`,
        number: index + 1,
        total: questions.length,
        itemId: lessonQuestionId(module.id, question),
        onEvaluated: ({ correct }) => {
          evaluated.set(index, { correct });
          const results = [...evaluated].map(([i, result]) => ({ index: i, correct: result.correct, question: questions[i] }));
          appEvents.emit('lesson:questions-checked', { lesson, id: module.id, results });
        },
      });
      lesson.addRequirement({ id: `question-${index}`, label: `otázka ${index + 1} na konci`, element: item.element, isMet: () => item.isSolved() });
      return item;
    });
    container.append(
      h('h2', { id: 'lesson-finish-title', class: 'lesson__finish-title' }, 'Kontrolní otázky'),
      h('p', { class: 'lesson__finish-lead' }, 'Odpověz a zkontroluj každou otázku. Když ti nějaká nesedí, zkus to znovu nebo si nech ukázat odpověď.'),
      h('div', { class: 'questions' }, items.map((item) => item.element)),
    );
  }

  const status = h('div', { class: 'lesson__status', role: 'status' });
  container.append(
    h(
      questions.length ? 'h3' : 'h2',
      { id: questions.length ? 'lesson-done-title' : 'lesson-finish-title', class: questions.length ? 'lesson__done-title' : 'lesson__finish-title' },
      'Hotovo?',
    ),
    status,
  );

  if (progress.isCompleted(module.id)) {
    showDone(status, nav, { again: true });
    return;
  }

  const button = h('button', { type: 'button', class: 'btn btn--primary' }, svg(icons.check), 'Mám přečteno');
  const actions = h('div', { class: 'actions' }, button);
  container.append(actions);

  button.addEventListener('click', async () => {
    const unmet = lesson.unmetRequirements();
    if (unmet.length) {
      status.dataset.kind = 'unmet';
      status.replaceChildren(unmetMessage(unmet));
      return;
    }
    button.disabled = true;
    try {
      await completeLesson({ ctx, module, lesson });
      if (ctx.signal.aborted) return;
      actions.remove();
      showDone(status, nav);
    } catch (error) {
      button.disabled = false;
      status.replaceChildren(h('p', { class: 'result__warning' }, `Splnění se nepodařilo uložit: ${error.message}`));
    }
  });
}

/** Co ještě chybí, s tlačítky, která na chybějící otázku skočí. */
function unmetMessage(unmet) {
  const jumps = unmet.map((requirement) =>
    requirement.element
      ? h(
          'button',
          {
            type: 'button',
            class: 'lesson__jump',
            onclick: () => {
              requirement.element.scrollIntoView({ block: 'center' });
              requirement.element.querySelector('input, textarea, button')?.focus({ preventScroll: true });
            },
          },
          requirement.label,
        )
      : h('span', {}, requirement.label),
  );
  return h(
    'div',
    { class: 'lesson__unmet' },
    h('p', {}, unmet.length === 1 ? 'Ještě vyřeš tuhle otázku:' : `Ještě vyřeš tyhle otázky (${unmet.length}):`),
    h('p', { class: 'lesson__jumps' }, jumps),
    h('p', { class: 'lesson__note' }, 'Stačí odpovědět správně, nebo si nechat ukázat odpověď.'),
  );
}

function showDone(status, nav, { again = false } = {}) {
  status.dataset.kind = 'pass';
  status.replaceChildren(
    h('p', { class: 'result__title' }, svg(icons.check, { size: 18 }), again ? 'Lekci už máš splněnou.' : 'Lekce je splněná.'),
    again ? h('p', {}, 'Otázky si můžeš projít znovu, nic se tím nezmění.') : null,
    h('div', { class: 'actions' }, nextModuleLink(nav, { primary: !again })),
  );
}
