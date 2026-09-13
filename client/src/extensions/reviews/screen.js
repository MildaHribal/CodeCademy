// Obrazovka #/opakovani: dnešní položky po jedné (kontrakt kap. 12.3).
//
// Server vybere, co je dnes na řadě (Leitner, denní strop, proložení po sekcích). Obrazovka
// jen ukáže položku, pošle výsledek (POST /api/reviews/answer) a nabídne další. „Už to umím"
// položku z opakování odebere (POST /api/reviews/remove).

import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { href } from '../../router.js';
import { withLoading, showLoadError } from '../../screens/load.js';
import { renderMarkdown } from '../../markdown.js';
import { reviewsApi } from './api.js';
import { renderReviewItem } from './items.js';
import { createReviewSession, itemKindLabel, limitNote } from './logic.js';
import { refreshReviewCount } from './count.js';

export async function renderReviews(ctx) {
  ctx.setTitle('Opakování');
  ctx.setCrumbs([{ label: 'Přehled', href: '#/' }, { label: 'Opakování' }]);

  let queue;
  try {
    queue = await withLoading(ctx, reviewsApi.due({ signal: ctx.signal }), 'Chystám dnešní opakování…');
    if (!queue) return;
  } catch (error) {
    showLoadError(ctx, error, { title: 'Opakování se nepodařilo načíst' });
    return;
  }

  const page = h('div', { class: 'page reviews' });
  ctx.root.append(page);
  page.append(
    h(
      'header',
      { class: 'module-head' },
      h('p', { class: 'module-head__meta' }, `Opakování s odstupem · ${formatDate(queue.date)}`),
      h('h1', { class: 'module-head__title' }, 'Opakování'),
      h(
        'p',
        { class: 'module-head__lead' },
        queue.items.length
          ? `Dnes ${plural(queue.items.length)}, asi ${Math.max(1, queue.estimateMinutes)} min. Odpovídej zpaměti — co nevíš, vrátí se zítra, co víš, přijde až za delší dobu.`
          : 'Na dnešek nemáš nic k opakování.',
      ),
    ),
  );

  if (!queue.items.length) {
    page.append(emptyState(queue));
    return;
  }

  const session = createReviewSession(queue.items);
  const meter = h('div', { class: 'quiz__meter reviews__meter', 'aria-hidden': 'true' }, queue.items.map(() => h('span', {})));
  const position = h('p', { class: 'reviews__position' });
  const stage = h('div', { class: 'reviews__stage' });
  page.append(meter, position, stage);

  let mounted = null;
  const unmount = () => {
    try {
      mounted?.destroy?.();
    } catch (error) {
      console.error('Úklid položky opakování selhal', error);
    }
    mounted = null;
  };
  ctx.onCleanup(unmount);

  function showCurrent() {
    unmount();
    if (session.isFinished()) {
      showDone();
      return;
    }
    const item = session.current();
    const index = session.position();
    position.textContent = `Položka ${index + 1} z ${session.total}`;
    [...meter.children].forEach((dot, i) => {
      dot.dataset.state = i === index ? 'current' : i < index ? 'answered' : 'open';
    });

    const saveStatus = h('p', { class: 'reviews__save', role: 'status' });
    const nextButton = h(
      'button',
      { type: 'button', class: 'btn btn--primary', hidden: true, onclick: () => goNext() },
      index + 1 < session.total ? 'Další položka' : 'Dokončit',
      svg(icons.arrowRight),
    );
    const removeButton = h('button', { type: 'button', class: 'btn btn--quiet btn--small reviews__remove', onclick: () => removeItem() }, 'Už to umím, nezobrazovat');

    const rendered = renderReviewItem(item, {
      number: index + 1,
      total: session.total,
      onAnswer: (ok, confidence = null) => answer(ok, confidence),
    });
    mounted = rendered;

    const card = h(
      'article',
      { class: 'reviews-item', dataset: { type: item.type, id: item.id } },
      h(
        'header',
        { class: 'reviews-item__head' },
        h('span', { class: 'reviews-item__kind' }, itemKindLabel(item)),
        sourceLink(item),
        h('span', { class: 'reviews-item__box', title: 'Krabička určuje, za jak dlouho se položka vrátí' }, `Krabička ${item.box}`),
      ),
      rendered.element,
      h('footer', { class: 'reviews-item__foot' }, saveStatus, h('div', { class: 'actions' }, nextButton, removeButton)),
    );
    stage.replaceChildren(card);
    rendered.mount?.();

    async function answer(ok, confidence) {
      if (!session.record(item.id, ok)) return;
      removeButton.hidden = true;
      nextButton.hidden = false;
      nextButton.focus({ preventScroll: true });
      saveStatus.textContent = ok ? 'Příště se položka vrátí za delší dobu.' : 'Položka se vrátí zítra.';
      try {
        await reviewsApi.answer({ id: item.id, ok, confidence: confidence ?? null });
        refreshReviewCount({ force: true });
      } catch (error) {
        if (!ctx.signal.aborted) saveStatus.textContent = `Výsledek se nepodařilo uložit: ${error.message}`;
      }
    }

    async function removeItem() {
      removeButton.disabled = true;
      try {
        await reviewsApi.remove(item.id);
        session.remove(item.id);
        refreshReviewCount({ force: true });
        goNext();
      } catch (error) {
        removeButton.disabled = false;
        if (!ctx.signal.aborted) saveStatus.textContent = `Položku se nepodařilo odebrat: ${error.message}`;
      }
    }
  }

  function goNext() {
    session.next();
    showCurrent();
    window.scrollTo({ top: 0 });
  }

  function showDone() {
    const { answered, correct, removed } = session.results();
    meter.remove();
    position.remove();
    const note = limitNote({ total: queue.total, answeredToday: queue.answeredToday, limit: queue.limit, offered: queue.items.length });
    stage.replaceChildren(
      h(
        'div',
        { class: 'quiz-summary quiz-summary--pass reviews__done', role: 'status', tabindex: '-1' },
        h('p', { class: 'quiz-summary__score' }, `${correct} z ${answered}`),
        h(
          'div',
          { class: 'quiz-summary__text' },
          h('p', { class: 'result__title' }, 'Na dnešek hotovo.'),
          h(
            'p',
            {},
            correct === answered
              ? 'Všechno sedělo. Položky se vrátí za delší dobu.'
              : `Co nesedělo (${answered - correct}), přijde znovu zítra.`,
            removed ? ` Odebral jsi ${removed} z opakování.` : '',
          ),
          note ? h('p', {}, note) : null,
        ),
        h('div', { class: 'actions' }, h('a', { class: 'btn btn--primary', href: '#/' }, 'Zpět na přehled')),
      ),
    );
    stage.firstElementChild.focus();
  }

  showCurrent();
}

function emptyState(queue) {
  const note = limitNote({ total: queue.total, answeredToday: queue.answeredToday, limit: queue.limit, offered: 0 });
  return h(
    'div',
    { class: 'notice reviews__empty' },
    h('h2', { class: 'notice__title' }, note ? 'Dnešní strop je splněný' : 'Hotovo'),
    note ? h('p', { class: 'notice__message' }, note) : null,
    renderMarkdown(
      [
        'Do opakování se položky dostávají samy:',
        '',
        '- otázky z lekcí a kvízů po první odpovědi (špatně zodpovězené hned zítra),',
        '- karty sekce, jakmile splníš modul, ke kterému patří,',
        '- kroky, které jsi splnil s řešením nebo po několika neúspěších, a ty, u kterých klikneš „Nezvládl bych to znovu".',
      ].join('\n'),
      { className: 'prose notice__message' },
    ),
    h('div', { class: 'notice__actions' }, h('a', { class: 'btn', href: '#/' }, 'Zpět na přehled')),
  );
}

function sourceLink(item) {
  const { source } = item;
  if (!source) return null;
  const target = item.type === 'step' ? href.step(item.content.stepId) : source.moduleId ? href.module(source.moduleId) : href.section(source.sectionId);
  return h('a', { class: 'reviews-item__source', href: target }, source.title);
}

function plural(count) {
  const form = count === 1 ? 'jedna položka' : count >= 2 && count <= 4 ? `${count} položky` : `${count} položek`;
  return form;
}

function formatDate(isoDate) {
  const [year, month, day] = String(isoDate).split('-').map(Number);
  if (!year) return isoDate;
  return `${day}. ${month}. ${year}`;
}
