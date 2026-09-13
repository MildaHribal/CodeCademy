// Živá ukázka v lekci: malý editor, náhled (nebo konzole u `:::live js`) a tlačítko Obnovit.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { mountPreview } from '../run.js';
import { createCodeEditor } from './code-editor.js';
import { createConsolePanel } from './console-panel.js';

/** host = prvek, který už je v dokumentu (iframe náhledu potřebuje být ve stránce). */
export function createLiveExample(host, block, { number }) {
  const isJs = block.runtime === 'js';
  const original = block.files.map((f) => ({ ...f, region: null }));

  const editorHost = h('div', { class: 'live__editor' });
  const previewHost = h('div', { class: 'live__preview', hidden: isJs });
  const consolePanel = createConsolePanel({
    emptyText: isJs ? 'Zatím nic nevypsáno.' : 'Konzole je prázdná.',
  });
  consolePanel.element.classList.add('live__console');
  if (!isJs) consolePanel.element.hidden = true;

  const resetButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet btn--small', onclick: reset },
    svg(icons.reset),
    'Obnovit',
  );

  const element = h(
    'figure',
    { class: `live${isJs ? ' live--js' : ''}` },
    h(
      'figcaption',
      { class: 'live__bar' },
      h('span', { class: 'live__title' }, `Živá ukázka ${number}`),
      h('span', { class: 'live__hint' }, 'Uprav kód, výsledek se ukáže hned.'),
      resetButton,
    ),
    h('div', { class: 'live__body' }, editorHost, h('div', { class: 'live__output' }, previewHost, consolePanel.element)),
  );
  host.append(element);

  const editor = createCodeEditor(editorHost, {
    files: original,
    compact: true,
    label: `Kód živé ukázky ${number}`,
    onChange: (files) => preview.update({ runtime: block.runtime, files }),
  });

  const preview = mountPreview(previewHost, { runtime: block.runtime, files: original });
  preview.onConsole?.((entry) => {
    // U HTML/CSS ukázky se konzole ukáže, až když kód něco vypíše; nové spuštění ji zase schová.
    if (!isJs) consolePanel.element.hidden = entry.level === 'clear';
    consolePanel.receive(entry);
  });

  function reset() {
    editor.setFiles(original);
    consolePanel.clear();
    preview.update({ runtime: block.runtime, files: original });
  }

  return {
    destroy() {
      preview.destroy();
      editor.destroy();
    },
  };
}
