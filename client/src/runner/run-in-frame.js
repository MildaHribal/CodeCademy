// Jeden běh v čerstvém iframu: načte stránku, spustí (nejvýš jeden) test a uklidí.
import { composePage } from './compose.js';
import { createRunId, listenToFrame, sendToFrame } from './protocol.js';
import { createHiddenFrame, resizeFrame } from './sandbox-frame.js';
import { startWatchdog } from './watchdog.js';

// Čas navíc pro načtení stránky (parsování, Vue z /vendor…), než začne běžet limit testu.
const LOAD_GRACE_MS = 2000;
// Rezerva po startu testu: vlastní časovač iframu (timeoutMs) i ochrana smyček mají doběhnout dřív.
const TEST_GRACE_MS = 1000;

export const FRAME_TIMEOUT_MESSAGE = 'Test nedoběhl včas — nekonečná smyčka?';
export const FRAME_CANCELLED_MESSAGE = 'Kontrola byla zrušena.';

/**
 * @param {{ runtime: 'dom'|'js'|'vue', files: Array<{name: string, content: string}>,
 *   test: string|null, timeoutMs: number, signal?: AbortSignal|null }} options
 *   test = null → jen načíst stránku; signal → zrušení (iframe se hned odstraní)
 * @returns {Promise<{ pass: boolean, error?: string, phase?: 'load'|'test', logs: Array<{level, text}>, errors: string[] }>}
 *   phase (jen u selhání): 'load' = stránka se zasekla ještě před spuštěním testu
 */
export function runInFrame({ runtime, files, test, timeoutMs, signal = null }) {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve({ pass: false, error: FRAME_CANCELLED_MESSAGE, phase: 'test', logs: [], errors: [] });
      return;
    }
    const runId = createRunId();
    const logs = [];
    const errors = [];
    const frame = createHiddenFrame();
    let done = false;

    const html = composePage({
      runtime,
      files,
      loopLimitMs: timeoutMs,
      origin: location.origin,
      frame: { runId, mode: test === null ? 'page' : 'test', test, timeoutMs },
    });

    let testStarted = false;
    const watchdog = startWatchdog(timeoutMs + LOAD_GRACE_MS, () => {
      finish({
        pass: false,
        error: test === null ? 'Stránka se nenačetla včas — nekonečná smyčka?' : FRAME_TIMEOUT_MESSAGE,
        phase: testStarted ? 'test' : 'load',
      });
    });

    const stopListening = listenToFrame(frame, runId, (message) => {
      switch (message.type) {
        case 'console':
          logs.push({ level: message.level, text: message.text });
          break;
        case 'error':
          errors.push(message.text);
          break;
        case 'resize':
          resizeFrame(frame, message.width, message.height);
          sendToFrame(frame, runId, 'resized', { requestId: message.requestId });
          break;
        case 'test-start':
          testStarted = true;
          watchdog.restart(timeoutMs + TEST_GRACE_MS);
          break;
        case 'result':
          finish(message.pass ? { pass: true } : { pass: false, error: String(message.error), phase: message.phase === 'load' ? 'load' : 'test' });
          break;
        case 'done':
          finish({ pass: true });
          break;
      }
    });

    const onAbort = () => finish({ pass: false, error: FRAME_CANCELLED_MESSAGE, phase: 'test' });
    signal?.addEventListener('abort', onAbort);

    function finish(outcome) {
      if (done) return;
      done = true;
      watchdog.cancel();
      stopListening();
      signal?.removeEventListener('abort', onAbort);
      frame.remove(); // odstraněním iframu Chrome ukončí i zaseknutý kód uvnitř
      resolve({ ...outcome, logs, errors });
    }

    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
