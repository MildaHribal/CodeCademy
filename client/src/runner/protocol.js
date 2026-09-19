
export const CHANNEL = 'akademie-runner';

export function createRunId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

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
  frame.contentWindow?.postMessage({ channel: CHANNEL, runId, type, ...payload }, '*');
}
