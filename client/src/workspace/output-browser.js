// Pravý panel pro runtime dom/vue/js: živý náhled a konzole.

import { h } from '../dom.js';
import { mountPreview } from '../run.js';
import { createConsolePanel } from '../components/console-panel.js';

/**
 * @param {{ runtime, slots }} options — slots: 'output-tools', 'output-after'
 * @returns {{ element, consolePanel, previewHost, mount(files) → preview }}
 */
export function createBrowserOutput({ runtime, slots }) {
  const consolePanel = createConsolePanel();
  const previewHost = h('div', { class: 'output__frame' });
  const showPreview = runtime !== 'js';

  const clearButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet btn--small', onclick: () => consolePanel.clear() },
    'Vyčistit',
  );

  const element = h(
    'section',
    { class: `pane pane--output${showPreview ? '' : ' output--console-only'}`, 'aria-label': 'Náhled a konzole' },
    showPreview ? h('div', { class: 'pane__head' }, h('h2', {}, 'Náhled'), slots.element('output-tools')) : null,
    h('div', { class: 'output__preview', hidden: !showPreview }, previewHost),
    h(
      'div',
      { class: 'pane__head' },
      h('h2', {}, 'Konzole'),
      h('div', { class: 'pane__tools' }, showPreview ? null : slots.element('output-tools'), clearButton),
    ),
    consolePanel.element,
    slots.element('output-after'),
  );

  return {
    element,
    consolePanel,
    previewHost,
    /** Připojí náhled (až je panel v dokumentu — iframe potřebuje být ve stránce). */
    mount(files) {
      const preview = mountPreview(previewHost, { runtime, files });
      preview.onConsole?.((entry) => consolePanel.receive(entry));
      return preview;
    },
  };
}
