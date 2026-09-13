// Lišta workshopu: pozice a navigace mezi kroky (čísla 1…N se stavem splnění).

import { h, svg } from '../dom.js';
import { href } from '../router.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';

/** Lišta nad sloupci. `slot` = prvek slotu 'bar' (na konci lišty). */
export function createStepperBar({ steps, stepIndex, slot }) {
  return h(
    'div',
    { class: 'workspace__bar' },
    h('p', { class: 'workspace__position' }, `Krok ${stepIndex + 1} z ${steps.length}`),
    stepper(steps, stepIndex),
    slot,
  );
}

/** Po splnění kroku označí aktuální číslo v liště jako hotové. */
export function markStepperDone(root, { stepIndex, title }) {
  const current = root.querySelector('.stepper__item[aria-current="step"]');
  if (current) {
    current.dataset.done = 'true';
    current.setAttribute('aria-label', `Krok ${stepIndex + 1}: ${title} (splněno)`);
  }
}

function stepper(steps, currentIndex) {
  const prev = steps[currentIndex - 1];
  const next = steps[currentIndex + 1];
  const arrow = (step, icon, label) =>
    step
      ? h('a', { class: 'stepper__arrow', href: href.step(step.id), 'aria-label': label }, svg(icon))
      : h('span', { class: 'stepper__arrow', 'aria-hidden': 'true' }, svg(icon));

  return h(
    'nav',
    { class: 'stepper', 'aria-label': 'Kroky workshopu' },
    arrow(prev, icons.arrowLeft, 'Předchozí krok'),
    h(
      'ol',
      { class: 'stepper__list' },
      steps.map((step, index) => {
        const done = progress.isCompleted(step.id);
        const current = index === currentIndex;
        return h(
          'li',
          {},
          h(
            'a',
            {
              class: 'stepper__item',
              href: href.step(step.id),
              'aria-current': current ? 'step' : null,
              'aria-label': `Krok ${index + 1}: ${step.title}${done ? ' (splněno)' : ''}`,
              title: step.title,
              dataset: { done: String(done) },
            },
            String(index + 1),
          ),
        );
      }),
    ),
    arrow(next, icons.arrowRight, 'Další krok'),
  );
}
