
import { h } from '../dom.js';
import { mountPreview } from '../run.js';
import { createConsolePanel } from '../components/console-panel.js';

/**
 * @param {{ runtime, libs?: string[], slots }} options — slots: 'output-tools', 'output-after'
 *   libs = knihovny kroku (kontrakt kap. 6.10) — náhled je musí dostat stejně jako testy
 * @returns {{ element, consolePanel, previewHost, mount(files) → preview }}
 */
export function createBrowserOutput({ runtime, libs = [], slots }) {
  const consolePanel = createConsolePanel();
  const previewHost = h('div', { class: 'output__frame' });
  const showPreview = runtime !== 'js';

  const clearButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Clear / Vyčistit', onclick: () => consolePanel.clear() },
    'Clear',
  );

  const element = h(
    'section',
    { class: `pane pane--output${showPreview ? '' : ' output--console-only'}`, 'aria-label': 'Preview and console / Náhled a konzole' },
    showPreview ? h('div', { class: 'pane__head' }, h('h2', {}, 'Preview'), slots.element('output-tools')) : null,
    h('div', { class: 'output__preview', hidden: !showPreview }, previewHost),
    h(
      'div',
      { class: 'pane__head' },
      h('h2', {}, 'Console'),
      h('div', { class: 'pane__tools' }, showPreview ? null : slots.element('output-tools'), clearButton),
    ),
    consolePanel.element,
    slots.element('output-after'),
  );

  return {
    element,
    consolePanel,
    previewHost,
    mount(files) {
      const preview = mountPreview(previewHost, { runtime, libs, files });
      preview.onConsole?.((entry) => consolePanel.receive(entry));
      return preview;
    },
  };
}
