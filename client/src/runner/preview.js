// Živý náhled pro editor (kontrakt kap. 6.7).
import { composePage } from './compose.js';
import { createConsolePanel } from './console-panel.js';
import { createRunId, listenToFrame } from './protocol.js';
import { createHiddenFrame, createPreviewFrame } from './sandbox-frame.js';

// V náhledu smí jedna smyčka běžet nejvýš 1 s — pak se ohlásí jako nekonečná.
const PREVIEW_LOOP_LIMIT_MS = 1000;
// Při psaní se náhled nepřekresluje po každém znaku.
const UPDATE_DEBOUNCE_MS = 300;

/**
 * @param {HTMLElement} container
 * @param {{ runtime: 'dom'|'js'|'vue'|'node', files: Array<{ name: string, content: string }> }} initial
 * @returns {{ update(next: { runtime?, files? }): void, destroy(): void,
 *   onConsole(cb: (entry: { level: 'log'|'info'|'warn'|'error'|'clear', text: string, uncaught?: boolean }) => void): () => void }}
 *
 * onConsole dostává výpisy konzole i nezachycené chyby (`level: 'error', uncaught: true`).
 * Před každým novým spuštěním přijde `{ level: 'clear' }`.
 */
export function mountPreview(container, { runtime = 'dom', files = [] } = {}) {
  const listeners = new Set();
  const root = document.createElement('div');
  root.className = 'akademie-preview';
  Object.assign(root.style, { width: '100%', height: '100%' });
  container.append(root);

  let current = { runtime, files };
  let session = null;
  let panel = null;
  let debounceTimer = null;
  let destroyed = false;

  function emit(entry) {
    panel?.append(entry);
    for (const listener of listeners) {
      try {
        listener(entry);
      } catch (error) {
        console.error(error);
      }
    }
  }

  function stopSession() {
    if (!session) return;
    session.stopListening();
    session.frame.remove();
    session = null;
  }

  function render() {
    stopSession();
    root.replaceChildren();
    panel = null;
    emit({ level: 'clear', text: '' });

    if (current.runtime === 'node') {
      const note = document.createElement('p');
      note.className = 'akademie-preview__note';
      note.textContent = 'Tenhle kód běží na serveru — spusť ho tlačítkem „Spustit".';
      root.append(note);
      return;
    }

    const isJs = current.runtime === 'js';
    const runId = createRunId();
    // U js je náhled jen konzole; iframe s kódem je neviditelný a visí přímo v <body>,
    // aby běžel, i když aplikace kontejner náhledu skryje.
    const frame = isJs ? createHiddenFrame() : createPreviewFrame();
    if (isJs) {
      panel = createConsolePanel();
      root.append(panel.element);
    }

    const stopListening = listenToFrame(frame, runId, (message) => {
      if (message.type === 'console') emit({ level: message.level, text: message.text });
      else if (message.type === 'error') emit({ level: 'error', text: message.text, uncaught: true });
    });

    frame.srcdoc = composePage({
      runtime: current.runtime,
      files: current.files,
      loopLimitMs: PREVIEW_LOOP_LIMIT_MS,
      origin: location.origin,
      frame: { runId, mode: 'preview' },
    });
    (isJs ? document.body : root).append(frame);
    session = { frame, stopListening };
  }

  render();

  return {
    update(next = {}) {
      if (destroyed) return;
      current = { runtime: next.runtime ?? current.runtime, files: next.files ?? current.files };
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, UPDATE_DEBOUNCE_MS);
    },
    destroy() {
      destroyed = true;
      clearTimeout(debounceTimer);
      stopSession();
      root.remove();
      listeners.clear();
    },
    onConsole(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
