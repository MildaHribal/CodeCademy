// Editor kódu nad CodeMirror 6: záložky souborů, zvýrazněná oblast `--edit--`
// (docs/kontrakt.md, kap. 3) a klávesová zkratka Ctrl+Enter pro kontrolu.
//
// Každý soubor má vlastní EditorState (vlastní historii Ctrl+Z, kurzor, scroll),
// jeden EditorView mezi nimi přepíná podle vybrané záložky.

import { EditorView, basicSetup } from 'codemirror';
import { EditorState, StateField, StateEffect, Prec } from '@codemirror/state';
import { Decoration, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { h } from '../dom.js';

function languageFor(lang) {
  switch (lang) {
    case 'html':
    case 'vue':
      return html();
    case 'css':
      return css();
    case 'js':
    case 'mjs':
    case 'cjs':
    case 'json':
      return javascript();
    case 'ts':
      return javascript({ typescript: true });
    default:
      return [];
  }
}

// ——— Zvýrazněná oblast ———
// Pamatujeme si ji jako rozsah znaků { from, to }. Při každé úpravě dokumentu se
// rozsah posune (mapPos), takže oblast "roste" s tím, co do ní uživatel napíše.

const setRegion = StateEffect.define();

const regionField = StateField.define({
  create: () => null,
  update(region, tr) {
    for (const effect of tr.effects) if (effect.is(setRegion)) return effect.value;
    if (!region || !tr.docChanged) return region;
    const from = tr.changes.mapPos(region.from, -1);
    const to = tr.changes.mapPos(region.to, 1);
    return { from, to, empty: region.empty && from === to };
  },
});

const regionLine = Decoration.line({ class: 'cm-edit-region' });

const regionDecorations = EditorView.decorations.compute([regionField, 'doc'], (state) => {
  const region = state.field(regionField);
  if (!region || region.empty) return Decoration.none;
  const first = state.doc.lineAt(region.from).number;
  const last = state.doc.lineAt(region.to).number;
  const ranges = [];
  for (let n = first; n <= last; n++) ranges.push(regionLine.range(state.doc.line(n).from));
  return Decoration.set(ranges);
});

/** Převede oblast z parseru (1-based řádky, včetně) na rozsah znaků v dokumentu. */
function regionToRange(doc, region) {
  if (!region) return null;
  const clampLine = (n) => doc.line(Math.min(Math.max(n, 1), doc.lines));
  if (region.end < region.start) {
    // Prázdná oblast: kurzor na začátek řádku `start` (nebo konec souboru).
    const pos = region.start > doc.lines ? doc.length : doc.line(region.start).from;
    return { from: pos, to: pos, empty: true };
  }
  return { from: clampLine(region.start).from, to: clampLine(region.end).to, empty: false };
}

const editorTheme = EditorView.theme(
  {
    '&': { height: '100%', fontSize: 'var(--code-size, 14px)' },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
    '.cm-content': { paddingBlock: '12px' },
    '.cm-edit-region': {
      backgroundColor: 'rgba(122, 162, 255, 0.10)',
      boxShadow: 'inset 3px 0 0 #7aa2ff',
    },
    '&.cm-focused': { outline: 'none' },
  },
  { dark: true },
);

/**
 * @param {HTMLElement} parent
 * @param {{ files: {name, lang, content, region?}[], onChange?: (files) => void, onSubmit?: () => void, label?: string, compact?: boolean }} options
 */
let editorCount = 0;

export function createCodeEditor(parent, { files, onChange, onSubmit, label = 'Editor kódu', compact = false }) {
  const idPrefix = `editor${++editorCount}`; // víc editorů na stránce nesmí mít stejná id záložek
  const states = new Map();
  let activeName = null;
  let currentFiles = files;

  const tabList = h('div', { class: 'editor__tabs', role: 'tablist', 'aria-label': 'Soubory' });
  const surface = h('div', { class: 'editor__surface', role: 'tabpanel' });
  const root = h('div', { class: `editor${compact ? ' editor--compact' : ''}` }, tabList, surface);
  parent.append(root);

  const extensions = [
    basicSetup,
    Prec.highest(
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            onSubmit?.();
            return Boolean(onSubmit);
          },
        },
      ]),
    ),
    keymap.of([indentWithTab]),
    oneDark,
    editorTheme,
    regionField,
    regionDecorations,
    EditorView.contentAttributes.of({ 'aria-label': label }),
    // V malém editoru živé ukázky zalamujeme dlouhé řádky, ať není nutné posouvat do stran.
    compact ? EditorView.lineWrapping : [],
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onChange?.(getFiles());
    }),
  ];

  const view = new EditorView({ parent: surface });

  function buildState(file) {
    const state = EditorState.create({ doc: file.content, extensions: [...extensions, languageFor(file.lang)] });
    const range = regionToRange(state.doc, file.region);
    if (!range) return state;
    // Kurzor na konec prvního řádku oblasti — tam uživatel obvykle začne psát.
    const cursor = range.empty ? range.from : state.doc.lineAt(range.from).to;
    return state.update({ effects: setRegion.of(range), selection: { anchor: cursor } }).state;
  }

  function tabId(name) {
    return `${idPrefix}-tab-${cssSafe(name)}`;
  }

  function renderTabs() {
    tabList.replaceChildren(
      ...currentFiles.map((file) =>
        h(
          'button',
          {
            type: 'button',
            role: 'tab',
            class: 'editor__tab',
            id: tabId(file.name),
            'aria-selected': String(file.name === activeName),
            tabindex: file.name === activeName ? '0' : '-1',
            onclick: () => select(file.name),
            onkeydown: onTabKey,
          },
          file.name,
        ),
      ),
    );
  }

  function onTabKey(event) {
    const names = currentFiles.map((f) => f.name);
    const index = names.indexOf(activeName);
    const moves = { ArrowRight: 1, ArrowLeft: -1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = names[(index + moves[event.key] + names.length) % names.length];
    select(next);
    tabList.querySelector(`[aria-selected="true"]`)?.focus();
  }

  function select(name, { scrollToRegion = false } = {}) {
    if (activeName && activeName !== name) states.set(activeName, view.state);
    activeName = name;
    view.setState(states.get(name));
    surface.setAttribute('aria-labelledby', tabId(name));
    renderTabs();
    const region = view.state.field(regionField);
    if (scrollToRegion && region) {
      view.dispatch({ effects: EditorView.scrollIntoView(region.from, { y: 'center' }) });
    }
  }

  function load(nextFiles) {
    currentFiles = nextFiles;
    states.clear();
    for (const file of nextFiles) states.set(file.name, buildState(file));
    // Začneme souborem, kde má uživatel psát; jinak prvním.
    const start = nextFiles.find((f) => f.region) ?? nextFiles[0];
    activeName = null;
    if (start) select(start.name, { scrollToRegion: true });
  }

  function getFiles() {
    if (activeName) states.set(activeName, view.state);
    return currentFiles.map((file) => ({
      name: file.name,
      lang: file.lang,
      content: states.get(file.name).doc.toString(),
    }));
  }

  load(files);

  return {
    element: root,
    getFiles,
    /** Nahradí obsah všech souborů (např. Obnovit krok). Nevolá onChange. */
    setFiles: load,
    focus: () => view.focus(),
    destroy: () => {
      view.destroy();
      root.remove();
    },
  };
}

function cssSafe(name) {
  return name.replace(/[^a-z0-9_-]/gi, '_');
}
