
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/prose.css';
import './styles/overview.css';
import './styles/workspace.css';
import './styles/lesson.css';
import './styles/quiz.css';
import './styles/project.css';
import './styles/motion.css';

import { startRouter } from './router.js';
import { progress } from './progress.js';
import { h, replace } from './dom.js';
import { appEvents } from './core/events.js';
import { mountHeaderMenu, setHeaderRoute } from './core/header.js';
import { registerScreen, screenFor } from './core/screens.js';
import { renderOverview } from './screens/overview.js';
import { renderSection } from './screens/section.js';
import { renderModule } from './screens/module.js';
import { renderNotFound } from './screens/not-found.js';
import './extensions/index.js';

registerScreen({ name: 'overview', render: renderOverview });
registerScreen({ name: 'section', render: renderSection });
registerScreen({ name: 'module', render: renderModule });
registerScreen({ name: 'not-found', render: renderNotFound });

const main = document.querySelector('#main');
const crumbs = document.querySelector('.app-bar__crumbs');
const saveStatus = document.querySelector('.app-bar__status');
mountHeaderMenu(document.querySelector('.app-bar__menu'));

let current = null;
let currentRoute = null;

/**
 * Posun mezi kroky téhož workshopu překresluje celé pracoviště. Obsah má v té chvíli
 * načtený, takže se překreslení vejde do view transition a číslo aktivního kroku
 * přejede na nové místo místo přeskočení. Jinde se přechod nespouští — na obrazovce,
 * která si teprve tahá data, by uživatel koukal na zamrzlý snímek.
 */
function isStepMove(from, to) {
  return (
    from?.name === 'module' &&
    to?.name === 'module' &&
    from.sectionId === to.sectionId &&
    from.moduleId === to.moduleId &&
    from.stepKey !== to.stepKey
  );
}

async function show(route) {
  const previous = currentRoute;
  currentRoute = route;
  if (
    isStepMove(previous, route) &&
    typeof document.startViewTransition === 'function' &&
    matchMedia('(prefers-reduced-motion: no-preference)').matches
  ) {
    await document.startViewTransition(() => renderRoute(route)).updateCallbackDone;
    return;
  }
  await renderRoute(route);
}

async function renderRoute(route) {
  if (current) {
    current.controller.abort();
    for (const cleanup of current.cleanups.reverse()) {
      try {
        cleanup();
      } catch (error) {
        console.error('Úklid obrazovky selhal', error);
      }
    }
    progress.flushAll();
  }

  const controller = new AbortController();
  const cleanups = [];
  current = { controller, cleanups };

  const ctx = {
    root: main,
    signal: controller.signal,
    onCleanup: (fn) => cleanups.push(fn),
    setCrumbs: (items) => renderCrumbs(items),
    setLayout: (layout) => (document.body.dataset.layout = layout),
    setTitle: (title) => (document.title = title ? `${title} – Akademie` : 'Akademie'),
  };

  ctx.setLayout('page');
  ctx.setCrumbs([]);
  ctx.setTitle('');
  main.replaceChildren();
  window.scrollTo(0, 0);
  setHeaderRoute(route);
  appEvents.emit('route:change', { route });

  try {
    await screenFor(route.name)(ctx, route);
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error(error);
    replace(
      main,
      h(
        'div',
        { class: 'page' },
        h(
          'div',
          { class: 'notice notice--error', role: 'alert' },
          h('h2', { class: 'notice__title' }, 'Tuhle stránku se nepodařilo zobrazit'),
          h('p', { class: 'notice__message' }, String(error.message ?? error)),
          h('div', { class: 'notice__actions' }, h('a', { class: 'btn', href: '#/' }, 'Zpět na přehled')),
        ),
      ),
    );
  }
}

function renderCrumbs(items) {
  if (!items.length) {
    crumbs.replaceChildren();
    return;
  }
  const list = h(
    'ol',
    {},
    items.map((item, index) => {
      const last = index === items.length - 1;
      return h(
        'li',
        {},
        last || !item.href ? h('span', { 'aria-current': last ? 'page' : null }, item.label) : h('a', { href: item.href }, item.label),
      );
    }),
  );
  crumbs.replaceChildren(list);
}

let hideTimer;
progress.onSaveState((state) => {
  clearTimeout(hideTimer);
  saveStatus.dataset.state = state;
  saveStatus.textContent = { pending: 'Ukládám…', saved: 'Uloženo', error: 'Kód se nepodařilo uložit' }[state];
  if (state === 'saved') hideTimer = setTimeout(() => (saveStatus.textContent = ''), 2000);
});

startRouter(show);
