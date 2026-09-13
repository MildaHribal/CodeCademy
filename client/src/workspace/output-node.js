// Pravý panel pro runtime node: Spustit, Zastavit, stav procesu a jeho výstup.
//
// Program běží přes /api/dev-process (kontrakt kap. 12.7) jako skutečný proces: skript
// doběhne a ukáže výstup, server běží dál a jde na něj posílat požadavky (HTTP klient
// v rozšíření dev-process, slot output-after). Při odchodu z obrazovky se proces zastaví.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { createConsolePanel } from '../components/console-panel.js';
import { attachSession, createDevProcessSession } from '../extensions/dev-process/session.js';
import { connectConsole, createRunStatus } from '../extensions/dev-process/run-view.js';
import { findMainFile } from './files.js';
import '../extensions/dev-process/dev-process.css';

const STOP_ICON = '<rect x="4" y="4" width="8" height="8" rx="1.2" fill="currentColor"/>';

/**
 * @param {{ item, slots, signal: AbortSignal, getFiles: () => object[] }} options
 * @returns {{ element, consolePanel, runButton, stopButton, session }}
 */
export function createNodeOutput({ item, slots, signal, getFiles }) {
  const consolePanel = createConsolePanel({
    emptyText: 'Tlačítkem Spustit pustíš program. Jeho výstup se ukáže tady, server poběží, dokud ho nezastavíš.',
  });
  const session = createDevProcessSession();
  const status = createRunStatus(session);

  const clearButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet btn--small', onclick: () => consolePanel.clear() },
    'Vyčistit',
  );
  const stopButton = h(
    'button',
    { type: 'button', class: 'btn btn--small', hidden: true, onclick: () => stopProgram() },
    svg(STOP_ICON),
    'Zastavit',
  );
  const runLabel = h('span', {}, 'Spustit');
  const runButton = h('button', { type: 'button', class: 'btn btn--small', onclick: () => runProgram() }, svg(icons.play), runLabel);

  const element = h(
    'section',
    { class: 'pane pane--output output--node', 'aria-label': 'Výstup programu' },
    h(
      'div',
      { class: 'pane__head' },
      h('h2', {}, 'Výstup'),
      h('div', { class: 'pane__tools' }, slots.element('output-tools'), clearButton, stopButton, runButton),
    ),
    status.element,
    consolePanel.element,
    slots.element('output-after'),
  );
  attachSession(element, session);

  const offConsole = connectConsole(session, consolePanel);
  const offButtons = session.on('change', syncButtons);
  syncButtons(session.state());

  // Odchod z obrazovky nebo zavření karty: vlastní běžící proces zastavit.
  const onPageHide = () => session.dispose();
  window.addEventListener('pagehide', onPageHide);
  signal.addEventListener(
    'abort',
    () => {
      window.removeEventListener('pagehide', onPageHide);
      offConsole();
      offButtons();
      status.destroy();
      session.dispose();
    },
    { once: true },
  );

  function syncButtons({ running, starting, stopping }) {
    runButton.disabled = starting || stopping;
    stopButton.hidden = !running;
    stopButton.disabled = stopping;
    runLabel.textContent = running ? 'Spustit znovu' : 'Spustit';
  }

  async function runProgram() {
    const files = getFiles();
    const main = findMainFile(files, item.meta);
    consolePanel.clear();
    if (!main) {
      consolePanel.error('Krok nemá žádný .js soubor, který by šel spustit.');
      return;
    }
    consolePanel.system(`$ node ${main.name}`);
    try {
      await session.start({ files: files.map(({ name, content }) => ({ name, content })), main: main.name });
    } catch (error) {
      if (!signal.aborted) consolePanel.error(error.message ?? String(error));
    }
  }

  async function stopProgram() {
    try {
      await session.stop();
    } catch (error) {
      if (!signal.aborted) consolePanel.error(error.message ?? String(error));
    }
  }

  return { element, consolePanel, runButton, stopButton, session };
}
