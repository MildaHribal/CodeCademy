// Rubrika `# --review--` u projektu a labu (kontrakt kap. 3.9): body, které testy nekontrolují,
// a rozšíření bez testů. Vždy dostupná, po projití všech testů se zvýrazní. Zaškrtání se neukládá.
import { h } from '../../dom.js';
import { renderMarkdown } from '../../markdown.js';

let reviewCounter = 0;

/** @returns {{ element: HTMLElement, highlight(passed: boolean): void }} */
export function createReviewPanel(review, { isProject = false } = {}) {
  const uid = `review-${++reviewCounter}`;
  const done = h('p', { class: 'review__passed', hidden: true }, 'Testy prošly. Teď projdi body, které testy nekontrolují.');
  const element = h(
    'section',
    { class: 'review', 'aria-labelledby': `${uid}-title` },
    h('h2', { class: 'review__title', id: `${uid}-title` }, isProject ? 'Než projekt uzavřeš' : 'Než lab uzavřeš'),
    done,
    review.intro ? renderMarkdown(review.intro, { className: 'prose review__intro' }) : null,
    h(
      'ul',
      { class: 'review__rubric' },
      review.rubric.map((point, index) =>
        h(
          'li',
          {},
          h(
            'label',
            { class: 'review__point' },
            h('input', { type: 'checkbox', class: 'review__check', id: `${uid}-${index}` }),
            renderMarkdown(point.text, { tag: 'span', className: 'prose', inline: true }),
          ),
        ),
      ),
    ),
    review.extensions
      ? h(
          'div',
          { class: 'review__extensions' },
          h('h3', { class: 'review__subtitle' }, isProject ? 'Rozšíření bez testů a do portfolia' : 'Rozšíření bez testů'),
          renderMarkdown(review.extensions, { className: 'prose' }),
        )
      : null,
  );
  return {
    element,
    highlight(passed) {
      element.classList.toggle('is-highlighted', passed);
      done.hidden = !passed;
    },
  };
}
