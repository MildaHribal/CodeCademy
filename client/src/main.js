// Vstupní bod aplikace: styly, registr obrazovek, rozšíření a přepínání obrazovek.
//
// Každá obrazovka je funkce render(ctx, route). Kontext jí dává:
//   ctx.root        — prvek <main>, kam kreslí
//   ctx.signal      — AbortSignal; zruší se, když uživatel mezitím odejde jinam
//   ctx.onCleanup   — registrace úklidu (zničit editor, náhled, posluchače…)
//   ctx.setCrumbs   — drobečková navigace v horní liště
//   ctx.setLayout   — 'page' (čtení, úzký sloupec) nebo 'workspace' (celá plocha)
//   ctx.setTitle    — titulek karty prohlížeče
//
// Obrazovky nástrojů se neregistrují tady, ale v client/src/extensions/<nástroj>.js
// (načítají se automaticky) — viz docs/platforma.md.

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/prose.css';
import './styles/overview.css';
import './styles/workspace.css';
import './styles/lesson.css';
import './styles/quiz.css';
import './styles/project.css';

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

let current = null; // { controller, cleanups }

async function show(route) {
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

// Stav ukládání rozpracovaného kódu v horní liště.
let hideTimer;
progress.onSaveState((state) => {
  clearTimeout(hideTimer);
  saveStatus.dataset.state = state;
  saveStatus.textContent = { pending: 'Ukládám…', saved: 'Uloženo', error: 'Kód se nepodařilo uložit' }[state];
  if (state === 'saved') hideTimer = setTimeout(() => (saveStatus.textContent = ''), 2000);
});

startRouter(show);
