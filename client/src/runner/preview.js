// Živý náhled pro editor (kontrakt kap. 6.7).
//
//   const preview = mountPreview(container, { runtime: 'dom', files, viewport: null });
//   preview.update({ files })                     znovu složí stránku (se zpožděním při psaní)
//   preview.onConsole((entry) => …)               výpisy konzole a nezachycené chyby
//   preview.setViewport({ width: 375, height: 667 })   náhled v šířce telefonu, zmenšený do panelu
//   preview.setCssVariables({ '--gap': '2rem' })  custom properties na :root bez znovunačtení
//   preview.openInNewTab()                        stránka v nové kartě pro skutečné DevTools
import { composePage } from './compose.js';
import { createConsolePanel } from './console-panel.js';
import { createRunId, listenToFrame, sendToFrame } from './protocol.js';
import { createHiddenFrame, createPreviewFrame } from './sandbox-frame.js';
import { fitViewport } from './viewport.js';

// V náhledu smí jedna smyčka běžet nejvýš 1 s — pak se ohlásí jako nekonečná.
const PREVIEW_LOOP_LIMIT_MS = 1000;
// Při psaní se náhled nepřekresluje po každém znaku.
const UPDATE_DEBOUNCE_MS = 300;
// Jak dlouho zůstane platná adresa stránky otevřené v nové kartě (karta si ji mezitím načte).
const NEW_TAB_URL_LIFETIME_MS = 60_000;

/**
 * @param {HTMLElement} container
 * @param {{ runtime?: 'dom'|'js'|'vue'|'react'|'node', files?: Array<{ name: string, content: string }>, libs?: string[],
 *   viewport?: { width: number, height: number } | null }} initial
 * @returns {Preview}
 *
 * onConsole dostává výpisy konzole i nezachycené chyby
 * (`{ level: 'error', text, uncaught: true, file?, line?, column? }`).
 * Před každým novým spuštěním přijde `{ level: 'clear' }`.
 */
export function mountPreview(container, { runtime = 'dom', files = [], libs = [], viewport = null } = {}) {
  const listeners = new Set();
  const root = document.createElement('div');
  root.className = 'akademie-preview';
  Object.assign(root.style, { width: '100%', height: '100%', position: 'relative' });
  container.append(root);

  let current = { runtime, files, libs };
  let currentViewport = normalizeViewport(viewport);
  const cssVariables = {};
  let session = null;
  let panel = null;
  let debounceTimer = null;
  let destroyed = false;

  // Zmenšení náhledu se přepočítá, kdykoli se změní velikost panelu.
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => applyViewport()) : null;
  resizeObserver?.observe(root);

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
    session.stage?.remove();
    session = null;
  }

  function composeFor(runId) {
    return composePage({
      runtime: current.runtime,
      files: current.files,
      libs: current.libs,
      loopLimitMs: PREVIEW_LOOP_LIMIT_MS,
      origin: location.origin,
      frame: { runId, mode: 'preview', cssVariables: { ...cssVariables } },
    });
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
    let stage = null;
    if (isJs) {
      panel = createConsolePanel();
      root.append(panel.element);
    } else {
      // Krabička s rozměry zmenšeného iframu — podle ní se v panelu posouvá.
      stage = document.createElement('div');
      stage.className = 'akademie-preview__stage';
      stage.append(frame);
      root.append(stage);
    }

    const stopListening = listenToFrame(frame, runId, (message) => {
      if (message.type === 'console') {
        emit({ level: message.level, text: message.text });
      } else if (message.type === 'error') {
        emit({ level: 'error', text: message.text, uncaught: true, ...locationOf(message) });
      } else if (message.type === 'ready') {
        // Proměnné nastavené mezi složením stránky a jejím startem by se jinak ztratily.
        sendToFrame(frame, runId, 'set-vars', { vars: { ...cssVariables } });
      }
    });

    frame.srcdoc = composeFor(runId);
    if (isJs) document.body.append(frame);
    session = { frame, stage, runId, stopListening };
    applyViewport();
  }

  function applyViewport() {
    if (!session?.stage) return;
    const layout = fitViewport(currentViewport, { width: root.clientWidth, height: root.clientHeight });
    Object.assign(session.stage.style, {
      width: layout.stageWidth,
      height: layout.stageHeight,
      margin: layout.centered ? '0 auto' : '0',
      overflow: 'hidden',
    });
    Object.assign(session.frame.style, {
      width: layout.frameWidth,
      height: layout.frameHeight,
      transform: layout.scale === 1 ? '' : `scale(${layout.scale})`,
      transformOrigin: '0 0',
    });
    root.style.overflow = currentViewport ? 'auto' : '';
    root.dataset.viewport = currentViewport ? `${currentViewport.width}x${currentViewport.height}` : 'panel';
  }

  render();

  return {
    update(next = {}) {
      if (destroyed) return;
      current = { runtime: next.runtime ?? current.runtime, files: next.files ?? current.files, libs: next.libs ?? current.libs };
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, UPDATE_DEBOUNCE_MS);
    },

    destroy() {
      destroyed = true;
      clearTimeout(debounceTimer);
      resizeObserver?.disconnect();
      stopSession();
      root.remove();
      listeners.clear();
    },

    onConsole(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /** `{ width, height }` = iframe v této velikosti zmenšený do šířky panelu; `null` = vyplní panel. */
    setViewport(nextViewport) {
      if (destroyed) return;
      currentViewport = normalizeViewport(nextViewport);
      applyViewport();
    },

    /** Nastaví custom properties na :root stránky náhledu. Hodnota null proměnnou odebere. */
    setCssVariables(vars = {}) {
      if (destroyed) return;
      for (const [name, value] of Object.entries(vars ?? {})) {
        if (!/^--[\w-]+$/.test(name)) continue;
        if (value === null || value === undefined) delete cssVariables[name];
        else cssVariables[name] = String(value);
      }
      if (session) sendToFrame(session.frame, session.runId, 'set-vars', { vars: { ...vars } });
    },

    /**
     * Otevře stránku v nové kartě (Blob URL) se stejným skládáním a ochranou smyček.
     * @returns {boolean} false, když prohlížeč okno zablokoval nebo runtime nemá stránku (node)
     */
    openInNewTab() {
      if (destroyed || current.runtime === 'node') return false;
      const html = composeFor(createRunId());
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      const tab = window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), NEW_TAB_URL_LIFETIME_MS);
      if (!tab) return false;
      // Stránka uživatele nemá mít přístup k oknu aplikace.
      tab.opener = null;
      return true;
    },

    /** Aktuální velikost náhledu (null = panel). */
    viewport: () => (currentViewport ? { ...currentViewport } : null),
  };
}

function normalizeViewport(viewport) {
  if (!viewport) return null;
  const width = Math.round(Number(viewport.width));
  const height = Math.round(Number(viewport.height));
  if (!(width > 0) || !(height > 0)) throw new TypeError(`Neplatná velikost náhledu ${viewport.width}×${viewport.height}`);
  return { width, height };
}

function locationOf(message) {
  const out = {};
  if (typeof message.file === 'string' && message.file) out.file = message.file;
  if (Number.isInteger(message.line) && message.line > 0) out.line = message.line;
  if (Number.isInteger(message.column) && message.column > 0) out.column = message.column;
  return out;
}
