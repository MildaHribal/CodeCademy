// Lišta workshopu: pozice, seznam kroků s názvy a navigace mezi kroky (čísla 1…N se stavem splnění).
//
// „Krok 3 z 24" je tlačítko, které rozbalí seznam všech kroků s názvy a ✓ u splněných —
// čísla v liště jsou rychlá navigace, seznam říká, co v kterém kroku je.

import { h, svg } from '../dom.js';
import { href } from '../router.js';
import { icons } from '../icons.js';
import { progress } from '../progress.js';

/** Lišta nad sloupci. `slot` = prvek slotu 'bar' (na konci lišty). */
export function createStepperBar({ steps, stepIndex, slot }) {
  return h('div', { class: 'workspace__bar' }, stepMenu(steps, stepIndex), stepper(steps, stepIndex), slot);
}

/** Po splnění kroku označí aktuální krok v liště i v seznamu jako hotový. */
export function markStepperDone(root, { stepIndex, title }) {
  const label = `Krok ${stepIndex + 1}: ${title} (splněno)`;
  const current = root.querySelector('.stepper__item[aria-current="step"]');
  if (current) {
    current.dataset.done = 'true';
    current.setAttribute('aria-label', label);
  }
  const entry = root.querySelector('.step-menu__link[aria-current="step"]');
  if (entry) {
    entry.dataset.done = 'true';
    entry.querySelector('.step-menu__status')?.replaceChildren(svg(icons.check, { size: 14, label: 'splněno' }));
  }
}

// ——— Seznam kroků s názvy ———

function stepMenu(steps, currentIndex) {
  const current = steps[currentIndex];
  const list = h(
    'ol',
    { class: 'step-menu__list' },
    steps.map((step, index) => {
      const done = progress.isCompleted(step.id);
      const isCurrent = index === currentIndex;
      return h(
        'li',
        {},
        h(
          'a',
          {
            class: 'step-menu__link',
            href: href.step(step.id),
            'aria-current': isCurrent ? 'step' : null,
            dataset: { done: String(done) },
          },
          h('span', { class: 'step-menu__number' }, String(index + 1)),
          h('span', { class: 'step-menu__name' }, step.title),
          h('span', { class: 'step-menu__status' }, done ? svg(icons.check, { size: 14, label: 'splněno' }) : null),
        ),
      );
    }),
  );

  const menu = h(
    'details',
    { class: 'step-menu' },
    h(
      'summary',
      { class: 'step-menu__summary', title: 'Seznam kroků' },
      h('span', { class: 'workspace__position' }, `Krok ${currentIndex + 1} z ${steps.length}`),
      h('span', { class: 'step-menu__current' }, current.title),
      svg(icons.chevronDown, { size: 14 }),
    ),
    h('div', { class: 'step-menu__panel' }, list),
  );

  // Rozbalený seznam: aktuální krok na očích, Escape a klik mimo ho zavřou.
  menu.addEventListener('toggle', () => {
    if (!menu.open) return;
    list.querySelector('[aria-current]')?.scrollIntoView({ block: 'center' });
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && menu.contains(event.target)) return;
      menu.open = false;
      if (event.type === 'keydown') menu.querySelector('summary').focus();
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    menu.addEventListener(
      'toggle',
      () => {
        document.removeEventListener('pointerdown', close);
        document.removeEventListener('keydown', close);
      },
      { once: true },
    );
  });
  return menu;
}

// ——— Čísla kroků ———

function stepper(steps, currentIndex) {
  const prev = steps[currentIndex - 1];
  const next = steps[currentIndex + 1];
  const arrow = (step, icon, label, shortcut) =>
    step
      ? h('a', { class: 'stepper__arrow', href: href.step(step.id), 'aria-label': label, title: `${label} (${shortcut})` }, svg(icon))
      : h('span', { class: 'stepper__arrow', 'aria-hidden': 'true' }, svg(icon));

  return h(
    'nav',
    { class: 'stepper', 'aria-label': 'Kroky workshopu' },
    arrow(prev, icons.arrowLeft, 'Předchozí krok', 'Alt+←'),
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
    arrow(next, icons.arrowRight, 'Další krok', 'Alt+→'),
  );
}
