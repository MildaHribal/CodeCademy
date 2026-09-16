// Lint v editoru (B4): podtržení chyb přímo v kódu, česky.
//
// - JavaScript (.js, inline <script> v .html): syntaktická chyba přes acorn (shared/syntax-check.js).
// - JSON: neplatný soubor.
// - CSS neplatné: deklarace, kterou prohlížeč nepřijme (CSS.supports), s návrhem opravy.
// - CSS neaktivní (jen pracovní plocha dom/vue): platná deklarace, která na svých prvcích
//   nic nedělá — ověří se na stránce složené v neviditelném iframu (runner/inspect-css.js).
// - Chyby za běhu: nezachycená chyba z náhledu se označí na svém řádku.
import './lint.css';
import { StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { forceLinting, lintGutter, linter } from '@codemirror/lint';
import { registerEditorExtension } from '../../components/code-editor.js';
import { workspaceExtensions } from '../../workspace/extensions.js';
import { inspectCss } from '../../runner/index.js';
import { COMMON_PROPERTIES } from './css-check.js';
import {
  cssDiagnostics, inactiveDiagnostics, inspectableDeclarations, jsonDiagnostics, runtimeDiagnostic, syntaxDiagnostics,
} from './diagnostics.js';
import { renderDiagnosticMessage } from './render.js';

const LINT_DELAY_MS = 500;
const LINTED_FILE = /\.(m?js|cjs|html?|css|json)$/i;

// Pracovní plochy podle položky kroku: editor rozšíření dostane jen `item`, ne plochu.
const workspaces = new WeakMap();

// „Přelintuj teď" — pošle se do editoru, když z náhledu přijde chyba za běhu.
const refreshLint = StateEffect.define();

workspaceExtensions.register({
  id: 'lint',
  order: 20,
  setup(ws) {
    const entry = { ws, runtimeErrors: new Map() };
    workspaces.set(ws.item, entry);

    const refresh = () => {
      const view = ws.editor?.view;
      if (!view) return;
      view.dispatch({ effects: refreshLint.of(null) });
      forceLinting(view);
    };

    const off = ws.preview?.onConsole?.((message) => {
      if (message.level === 'clear') {
        if (entry.runtimeErrors.size) {
          entry.runtimeErrors.clear();
          refresh();
        }
        return;
      }
      if (!message.uncaught || !message.file || !message.line) return;
      const list = entry.runtimeErrors.get(message.file) ?? [];
      if (list.length >= 20) return;
      list.push({ line: message.line, column: message.column ?? 1, message: message.text });
      entry.runtimeErrors.set(message.file, list);
      refresh();
    });

    return () => {
      off?.();
      workspaces.delete(ws.item);
    };
  },
});

registerEditorExtension({
  id: 'lint',
  order: 10,
  extension: (file) => (LINTED_FILE.test(file.name) ? lintExtension(file) : null),
});

function lintExtension({ name, runtime, context, compact, item }) {
  let inspection = null; // běžící ověření neaktivního CSS (zruší se novým během)

  async function source(view) {
    const text = view.state.doc.toString();
    const found = [
      ...syntaxDiagnostics(name, text),
      ...jsonDiagnostics(name, text),
      ...cssDiagnostics(name, text, { supports: cssSupports, knownProperties: knownCssProperties() }),
    ];

    const entry = item ? workspaces.get(item) : null;
    const hasSyntaxError = found.some((diagnostic) => diagnostic.source === 'Syntaxe');
    for (const error of entry?.runtimeErrors.get(name) ?? []) {
      // Syntaktickou chybu už hlásí kontrola syntaxe, podruhé z náhledu ji neukazujeme.
      if (hasSyntaxError && /^SyntaxError\b/.test(error.message)) continue;
      if (error.line <= view.state.doc.lines) found.push(runtimeDiagnostic(text, error));
    }

    const canInspect = entry && context === 'workspace' && /\.css$/i.test(name) && ['dom', 'vue'].includes(runtime);
    if (canInspect) found.push(...(await inactiveCss(entry.ws, text)));

    return found.map((diagnostic) => ({
      from: Math.min(diagnostic.from, text.length),
      to: Math.min(Math.max(diagnostic.to, diagnostic.from), text.length),
      severity: diagnostic.severity,
      source: diagnostic.source,
      message: plainMessage(diagnostic),
      renderMessage: () => renderDiagnosticMessage(diagnostic),
    }));
  }

  async function inactiveCss(ws, text) {
    inspection?.abort();
    const controller = new AbortController();
    inspection = controller;
    const declarations = inspectableDeclarations(text);
    if (!declarations.length) return [];
    const files = ws.getFiles().map((file) => (file.name === name ? { name, content: text } : { name: file.name, content: file.content }));
    try {
      // Knihovny kroku (kap. 6.10): bez nich by Tailwind nevygeneroval styly a lint by hlásil falešné nálezy.
      const libs = Array.isArray(item?.libs) ? item.libs : [];
      const items = await inspectCss({ runtime, libs, files, declarations, signal: controller.signal });
      return controller.signal.aborted ? [] : inactiveDiagnostics(declarations, items);
    } catch {
      return [];
    }
  }

  return [
    linter(source, {
      delay: LINT_DELAY_MS,
      needsRefresh: (update) => update.transactions.some((tr) => tr.effects.some((effect) => effect.is(refreshLint))),
    }),
    compact ? [] : lintGutter(),
    lintTheme,
  ];
}

function plainMessage(diagnostic) {
  return [diagnostic.message, diagnostic.hint, diagnostic.original].filter(Boolean).join(' ').replace(/`/g, '');
}

function cssSupports(property, value) {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports(property, value);
}

let cachedProperties = null;

/** Vlastnosti, které prohlížeč zná (pro „myslel jsi…?"): longhandy z getComputedStyle + časté zkratky. */
function knownCssProperties() {
  if (cachedProperties) return cachedProperties;
  const fromBrowser = typeof getComputedStyle === 'function' ? Array.from(getComputedStyle(document.documentElement)) : [];
  cachedProperties = [...new Set([...COMMON_PROPERTIES, ...fromBrowser.filter((property) => !property.startsWith('-'))])];
  return cachedProperties;
}

// Barvy podtržení a značek jen přes tokeny (výchozí téma lintu má barvy natvrdo).
const lintTheme = EditorView.theme({
  '.cm-lintRange': { backgroundImage: 'none', paddingBottom: '0' },
  '.cm-lintRange-error': { textDecoration: 'underline wavy var(--tok-invalid)', textUnderlineOffset: '3px', textDecorationSkipInk: 'none' },
  '.cm-lintRange-warning': { textDecoration: 'underline wavy var(--console-warn)', textUnderlineOffset: '3px', textDecorationSkipInk: 'none' },
  '.cm-lintRange-info': { textDecoration: 'underline dotted var(--console-info)', textUnderlineOffset: '3px' },
  '.cm-lintPoint-error:after': { borderBottomColor: 'var(--tok-invalid)' },
  '.cm-lintPoint-warning:after': { borderBottomColor: 'var(--console-warn)' },
  '.cm-lintPoint-info:after': { borderBottomColor: 'var(--console-info)' },
  '.cm-lint-marker': { content: 'none', width: '0.6em', height: '0.6em', margin: '0.35em 0.2em', borderRadius: '50%' },
  '.cm-lint-marker-error': { content: 'none', backgroundColor: 'var(--tok-invalid)' },
  '.cm-lint-marker-warning': { content: 'none', backgroundColor: 'var(--console-warn)' },
  '.cm-lint-marker-info': { content: 'none', backgroundColor: 'var(--console-info)' },
  '.cm-tooltip.cm-tooltip-lint': { backgroundColor: 'var(--code-bg-deep)', color: 'var(--code-ink)', border: '1px solid var(--console-rule)' },
  '.cm-diagnostic': { padding: '6px 10px', maxWidth: '420px' },
  '.cm-diagnostic-error': { borderLeft: '4px solid var(--tok-invalid)' },
  '.cm-diagnostic-warning': { borderLeft: '4px solid var(--console-warn)' },
  '.cm-diagnostic-info': { borderLeft: '4px solid var(--console-info)' },
  '.cm-diagnosticSource': { color: 'var(--console-muted)', opacity: '1' },
});
