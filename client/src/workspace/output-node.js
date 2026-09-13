// Pravý panel pro runtime node: tlačítko Spustit a výstup programu.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { api } from '../api.js';
import { createConsolePanel } from '../components/console-panel.js';
import { findMainFile } from './files.js';

/**
 * @param {{ item, slots, signal: AbortSignal, getFiles: () => object[] }} options
 * @returns {{ element, consolePanel, runButton }}
 */
export function createNodeOutput({ item, slots, signal, getFiles }) {
  const consolePanel = createConsolePanel({ emptyText: 'Tlačítkem Spustit pustíš program a jeho výstup se ukáže tady.' });

  const clearButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet btn--small', onclick: () => consolePanel.clear() },
    'Vyčistit',
  );
  const runButton = h('button', { type: 'button', class: 'btn btn--small', onclick: runProgram }, svg(icons.play), 'Spustit');

  const element = h(
    'section',
    { class: 'pane pane--output output--node', 'aria-label': 'Výstup programu' },
    h(
      'div',
      { class: 'pane__head' },
      h('h2', {}, 'Výstup'),
      h('div', { class: 'pane__tools' }, slots.element('output-tools'), clearButton, runButton),
    ),
    consolePanel.element,
    slots.element('output-after'),
  );

  async function runProgram() {
    const files = getFiles();
    const main = findMainFile(files, item.meta);
    consolePanel.clear();
    if (!main) {
      consolePanel.error('Krok nemá žádný .js soubor, který by šel spustit.');
      return;
    }
    runButton.disabled = true;
    consolePanel.system(`$ node ${main.name}`);
    try {
      const output = await api.runNodeFile(
        files.map(({ name, content }) => ({ name, content })),
        main.name,
      );
      if (signal.aborted) return;
      if (output.stdout) consolePanel.log(output.stdout.replace(/\n$/, ''));
      if (output.stderr) consolePanel.error(output.stderr.replace(/\n$/, ''));
      consolePanel.system(
        output.timedOut ? 'Program běžel příliš dlouho, a tak byl ukončen.' : `Program skončil s kódem ${output.code}.`,
      );
    } catch (error) {
      if (!signal.aborted) consolePanel.error(error.message);
    } finally {
      runButton.disabled = false;
    }
  }

  return { element, consolePanel, runButton };
}
