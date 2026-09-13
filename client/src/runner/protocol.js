// Komunikace rodič ↔ iframe přes postMessage.
//
// Zprávy z iframu: { channel, runId, type, ... }
//   console  { level, text }       výpis uživatelova kódu
//   error    { text }              nezachycená chyba uživatelova kódu
//   resize   { requestId, width, height }   test chce jinou velikost iframu
//   test-start                     stránka načtená, test začíná
//   result   { pass, error? }      výsledek testu
//   done                           (režim page) stránka načtená a výpisy posbírané
// Zprávy rodiče: resized { requestId }

export const CHANNEL = 'akademie-runner';

export function createRunId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Poslouchá zprávy jen z daného iframu a jen s daným id běhu — jiné iframy ani
 * staré běhy nemůžou výsledek podvrhnout nebo zamíchat.
 * @returns {() => void} odhlášení
 */
export function listenToFrame(frame, runId, onMessage) {
  function handle(event) {
    if (event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.runId !== runId) return;
    onMessage(data);
  }
  window.addEventListener('message', handle);
  return () => window.removeEventListener('message', handle);
}

export function sendToFrame(frame, runId, type, payload = {}) {
  // Iframe má neprůhledný origin, cílový origin proto nejde zúžit — ověřuje příjemce.
  frame.contentWindow?.postMessage({ channel: CHANNEL, runId, type, ...payload }, '*');
}
