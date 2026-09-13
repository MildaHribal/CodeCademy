// Klávesové zkratky aplikace (B12):
//   Alt+← / Alt+→   předchozí / další krok workshopu, jinde předchozí / další modul osnovy
//   ?               přehled zkratek
//   N               poznámka k tomuhle místu (panel poznámek, extensions/notes)
// Ctrl+Enter (Zkontrolovat / Další krok) obsluhuje pracovní plocha sama.
//
// Zkratky bez Alt nefungují při psaní (editor, pole formuláře) — tam písmena patří textu.
import './shortcuts.css';
import { h, svg } from '../dom.js';
import { href } from '../router.js';
import { icons } from '../icons.js';
import { appEvents } from '../core/events.js';
import { allModules, loadCurriculum } from '../content.js';
import { workspaceExtensions } from '../workspace/extensions.js';

export const SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], text: 'Zkontrolovat kód; po splnění další krok' },
  { keys: ['Alt', '←'], text: 'Předchozí krok workshopu nebo předchozí modul' },
  { keys: ['Alt', '→'], text: 'Další krok workshopu nebo další modul' },
  { keys: ['N'], text: 'Poznámka k tomuhle místu' },
  { keys: ['?'], text: 'Tenhle přehled zkratek' },
  { keys: ['Esc'], text: 'Zavřít panel nebo přehled' },
];

// ——— Kam vedou Alt+← a Alt+→ na aktuální obrazovce ———

let targets = { prev: null, next: null };
let routeToken = 0;
let stepMode = false; // krok workshopu: šipky vedou mezi kroky, ne mezi moduly

appEvents.on('route:change', ({ route }) => {
  const token = ++routeToken;
  targets = { prev: null, next: null };
  stepMode = false;
  if (route.name !== 'module') return;
  const moduleId = `${route.sectionId}/${route.moduleId}`;
  loadCurriculum()
    .then((curriculum) => {
      if (token !== routeToken || stepMode) return;
      const entries = allModules(curriculum);
      const index = entries.findIndex((entry) => entry.module.id === moduleId);
      if (index === -1) return;
      targets = {
        prev: entries[index - 1] ? href.module(entries[index - 1].module.id) : null,
        next: entries[index + 1] ? href.module(entries[index + 1].module.id) : null,
      };
    })
    .catch(() => {});
});

workspaceExtensions.register({
  id: 'shortcuts',
  order: 100,
  setup(ws) {
    if (!ws.isWorkshop) return;
    stepMode = true;
    const prev = ws.steps[ws.stepIndex - 1];
    const next = ws.steps[ws.stepIndex + 1];
    targets = { prev: prev ? href.step(prev.id) : null, next: next ? href.step(next.id) : null };
  },
});

// ——— Klávesnice ———

function isTyping(target) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], .cm-editor'));
}

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.isComposing) return;

  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    // V editoru Alt+šipky patří kurzoru (CodeMirror je obslouží a událost dál nepustí).
    if (isTyping(event.target)) return;
    const target = event.key === 'ArrowLeft' ? targets.prev : targets.next;
    if (!target) return; // bez cíle nechá prohlížeči jeho výchozí Zpět/Vpřed
    event.preventDefault();
    location.hash = target;
    return;
  }

  if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;
  if (event.key === '?') {
    event.preventDefault();
    toggleHelp();
  } else if (event.key === 'n' || event.key === 'N') {
    if (document.querySelector('dialog[open]')) return;
    event.preventDefault();
    appEvents.emit('notes:open', {});
  }
});

// ——— Přehled zkratek ———

let dialog = null;

function toggleHelp() {
  dialog ??= createHelpDialog();
  if (dialog.open) dialog.close();
  else dialog.showModal();
}

function createHelpDialog() {
  const element = h(
    'dialog',
    { class: 'shortcuts', 'aria-labelledby': 'shortcuts-title' },
    h(
      'div',
      { class: 'shortcuts__head' },
      h('h2', { class: 'shortcuts__title', id: 'shortcuts-title' }, 'Klávesové zkratky'),
      h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Zavřít', onclick: () => element.close() }, svg(icons.close)),
    ),
    h(
      'dl',
      { class: 'shortcuts__list' },
      SHORTCUTS.map((shortcut) => [
        h('dt', { class: 'shortcuts__keys' }, shortcut.keys.map((key, index) => [index ? h('span', { class: 'shortcuts__plus' }, '+') : null, h('kbd', {}, key)])),
        h('dd', { class: 'shortcuts__text' }, shortcut.text),
      ]),
    ),
    h('p', { class: 'shortcuts__note' }, 'Písmenové zkratky nefungují, když píšeš do editoru nebo do pole.'),
  );
  // Klik na ztmavené pozadí dialog zavře.
  element.addEventListener('click', (event) => {
    if (event.target === element) element.close();
  });
  document.body.append(element);
  return element;
}
