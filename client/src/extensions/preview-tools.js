// Nástroje náhledu na pracovní ploše (B11): přepínač šířky a „Otevřít v nové kartě".
//
// Šířka náhledu (kontrakt kap. 6.7): „Jako testy" = stránka 1024 px zmenšená do panelu, tedy
// přesně to, co vidí testy. Media dotazy reagují na šířku stránky v náhledu, ne na šířku okna,
// takže responzivní rozvržení jde vyzkoušet bez dočasného max-width v kódu.
// Volba se ukládá do nastavení (previewWidth) a platí pro všechny kroky.
//
// Nová karta otevře stejnou stránku mimo aplikaci — tam fungují skutečné DevTools a breakpointy.
import './preview-tools.css';
import { h } from '../dom.js';
import { workspaceExtensions } from '../workspace/extensions.js';
import { settings } from './settings/client.js';
import { PREVIEW_WIDTHS, PREVIEW_WIDTH_LABELS, previewViewport } from './settings/logic.js';

const NEW_TAB_ICON =
  '<path d="M9.5 2.5h4v4M13.5 2.5 8 8M12 9.5v4H2.5V4H6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';

function icon(paths) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('viewBox', '0 0 16 16');
  el.setAttribute('width', '14');
  el.setAttribute('height', '14');
  el.setAttribute('class', 'icon');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = paths;
  return el;
}

workspaceExtensions.register({
  id: 'preview-tools',
  order: 10,
  setup(ws) {
    if (ws.isNode) return;
    const preview = ws.preview;
    if (!preview) return;

    // Runtime js nemá stránku, jen konzoli — šířka nedává smysl, nová karta ano (DevTools, breakpointy).
    if (ws.runtime !== 'js') ws.addToSlot('output-tools', widthSwitch(ws, preview), { order: 10 });
    ws.addToSlot('output-tools', newTabButton(preview), { order: 20 });
  },
});

function widthSwitch(ws, preview) {
  const host = ws.elements.previewHost?.parentElement ?? null; // .output__preview
  const canResize = typeof preview.setViewport === 'function';

  const buttons = PREVIEW_WIDTHS.map((width) =>
    h(
      'button',
      {
        type: 'button',
        class: 'preview-width__option',
        title: canResize ? PREVIEW_WIDTH_LABELS[width].title : 'Tahle verze náhledu šířku přepnout neumí',
        disabled: !canResize,
        dataset: { width },
        onclick: () => choose(width),
      },
      PREVIEW_WIDTH_LABELS[width].label,
    ),
  );
  const group = h('div', { class: 'preview-width', role: 'group', 'aria-label': 'Šířka náhledu' }, buttons);

  function show(width) {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.width === width));
    if (host) host.dataset.width = width;
    preview.setViewport?.(previewViewport(width));
  }

  function choose(width) {
    show(width);
    settings.update({ previewWidth: width });
  }

  show(settings.get().previewWidth);
  settings.load().then((value) => {
    if (!ws.signal.aborted) show(value.previewWidth);
  });
  const off = settings.onChange((value) => show(value.previewWidth));
  ws.onCleanup(off);

  return group;
}

function newTabButton(preview) {
  const canOpen = typeof preview.openInNewTab === 'function';
  const status = h('span', { class: 'visually-hidden', role: 'status' });
  const button = h(
    'button',
    {
      type: 'button',
      class: 'btn btn--quiet btn--small preview-new-tab',
      title: canOpen ? 'Otevřít stránku v nové kartě — tam fungují DevTools a breakpointy' : 'Tahle verze náhledu novou kartu neumí',
      disabled: !canOpen,
      onclick: () => {
        const opened = preview.openInNewTab();
        status.textContent = opened === false ? 'Prohlížeč novou kartu zablokoval.' : '';
      },
    },
    icon(NEW_TAB_ICON),
    h('span', { class: 'preview-new-tab__label' }, 'Nová karta'),
  );
  return h('span', { class: 'preview-new-tab__wrap' }, button, status);
}
