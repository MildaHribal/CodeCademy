// Stránka sekce navíc (kontrakt kap. 2.2, 2.6, 2.7): „Po sekci umíš" (outcomes), tahák
import './sections.css';
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { apiRequest } from '../../api-request.js';
import { renderMarkdown } from '../../markdown.js';
import { loadModule } from '../../content.js';
import { sectionExtensions } from '../../screens/section.js';
import { parseRef, refHref } from '../../../../shared/refs.js';
import { outcomeLinkLabel } from './labels.js';

const PRINT_ICON = '<path d="M4.5 6V2.5h7V6M4.5 11.5h-2v-5h11v5h-2M4.5 9.5h7v4h-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>';

sectionExtensions.register({
  id: 'sections',
  order: 30,
  setup(page) {
    const { section, signal } = page;
    apiRequest('GET', `/api/section/${encodeURIComponent(section.id)}`, undefined, { signal })
      .then((data) => {
        if (signal.aborted) return;
        if (data.outcomes?.length) page.addToSlot('after-progress', outcomesBlock(data.outcomes, section), { order: 20 });
        if (data.cheatsheet) page.addToSlot('end', cheatsheetBlock(data.cheatsheet, section), { order: 20 });
        if (data.terms?.length) page.addToSlot('end', termsBlock(data.terms), { order: 30 });
      })
      .catch((error) => {
        if (!signal.aborted && error.status !== 404) console.warn(`Doplňky sekce se nepodařilo načíst: ${error.message}`);
      });
  },
});

function outcomesBlock(outcomes, section) {
  return h(
    'section',
    { class: 'section-outcomes', 'aria-labelledby': 'section-outcomes-title' },
    h('h2', { class: 'section-outcomes__title', id: 'section-outcomes-title' }, 'Po sekci umíš'),
    h(
      'ul',
      { class: 'section-outcomes__list' },
      outcomes.map((outcome) =>
        h(
          'li',
          { class: 'section-outcomes__item' },
          renderMarkdown(outcome.text, { tag: 'p', className: 'prose section-outcomes__text', inline: true }),
          outcome.links?.length
            ? h(
                'p',
                { class: 'section-outcomes__links' },
                h('span', { class: 'section-outcomes__where' }, 'Kde se to učíš:'),
                outcome.links
                  .filter((ref) => parseRef(ref))
                  .map((ref) => outcomeLink(ref, section)),
              )
            : null,
        ),
      ),
    ),
  );
}

function outcomeLink(ref, section) {
  const link = h('a', { href: refHref(ref), class: 'section-outcomes__link' }, outcomeLinkLabel(ref, section));
  const parsed = parseRef(ref);
  if (parsed.anchor && section.modules?.some((module) => module.id === parsed.moduleId)) {
    const [sectionId, moduleSlug] = parsed.moduleId.split('/');
    loadModule(sectionId, moduleSlug)
      .then((detail) => {
        link.textContent = outcomeLinkLabel(ref, section, detail.lesson?.headings ?? []);
      })
      .catch(() => {});
  }
  return link;
}

function cheatsheetBlock(markdown, section) {
  const details = h('details', { class: 'cheatsheet' });
  const printButton = h('button', { type: 'button', class: 'btn btn--small', onclick: print }, svg(PRINT_ICON), 'Vytisknout tahák');
  details.append(
    h(
      'summary',
      { class: 'cheatsheet__summary' },
      h('span', { class: 'cheatsheet__title' }, 'Tahák'),
      h('span', { class: 'cheatsheet__lead' }, 'Nejdůležitější vzory a pasti sekce na jedné stránce.'),
    ),
    h(
      'div',
      { class: 'cheatsheet__body' },
      h('div', { class: 'cheatsheet__actions' }, printButton),
      h('h2', { class: 'cheatsheet__print-title' }, `Tahák: ${section.title}`),
      renderMarkdown(markdown, { className: 'prose cheatsheet__content' }),
    ),
  );

  function print() {
    details.open = true;
    document.body.dataset.print = 'cheatsheet';
    const done = () => delete document.body.dataset.print;
    window.addEventListener('afterprint', done, { once: true });
    window.print();
  }
  return details;
}

function termsBlock(terms) {
  return h(
    'details',
    { class: 'section-terms' },
    h(
      'summary',
      { class: 'section-terms__summary' },
      h('span', { class: 'section-terms__title' }, 'Pojmy sekce'),
      h('span', { class: 'section-terms__count' }, `${terms.length} ${termsWord(terms.length)}`),
    ),
    h(
      'dl',
      { class: 'section-terms__list' },
      terms.map((term) => [
        h('dt', { class: 'section-terms__term', id: `pojem-${term.id}` }, term.term, term.en && term.en.toLowerCase() !== term.term.toLowerCase() ? h('span', { class: 'section-terms__en' }, term.en) : null),
        h(
          'dd',
          { class: 'section-terms__definition' },
          renderMarkdown(term.definition, { className: 'prose' }),
          h(
            'p',
            { class: 'section-terms__links' },
            term.lesson && parseRef(term.lesson) ? h('a', { href: refHref(term.lesson) }, 'Vysvětlení v lekci') : null,
            term.mdn ? h('a', { href: term.mdn, target: '_blank', rel: 'noopener noreferrer' }, 'MDN (anglicky)') : null,
          ),
        ),
      ]),
    ),
  );
}

function termsWord(count) {
  if (count === 1) return 'pojem';
  return count >= 2 && count <= 4 ? 'pojmy' : 'pojmů';
}
