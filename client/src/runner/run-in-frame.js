import { composePage } from './compose.js';
import { createRunId, listenToFrame, sendToFrame } from './protocol.js';
import { createHiddenFrame, resizeFrame } from './sandbox-frame.js';
import { startWatchdog } from './watchdog.js';

const LOAD_GRACE_MS = 2000;
const TEST_GRACE_MS = 1000;

export const FRAME_TIMEOUT_MESSAGE = 'Test nedoběhl včas — nekonečná smyčka?';
export const FRAME_CANCELLED_MESSAGE = 'Kontrola byla zrušena.';

export function runInFrame({ runtime, files, libs = [], test, timeoutMs, signal = null, inspect = null, storage = null }) {
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
      libs,
      loopLimitMs: timeoutMs,
      origin: location.origin,
      frame: { runId, mode: inspect ? 'inspect' : test === null ? 'page' : 'test', test, timeoutMs, inspect, storage },
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
          finish(message.pass ? { pass: true } : { pass: false, error: String(message.error), phase: message.phase === 'load' ? 'load' : 'test', details: pickDetails(message) });
          break;
        case 'done':
          finish({ pass: true });
          break;
        case 'inspect-result':
          finish({ pass: true, inspect: Array.isArray(message.items) ? message.items : [] });
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
      frame.remove();
      resolve({ ...outcome, logs, errors });
    }

    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}

const DETAIL_FIELDS = ['errorName', 'operator', 'actual', 'expected', 'generatedMessage', 'diff'];

function pickDetails(message) {
  const details = {};
  for (const field of DETAIL_FIELDS) {
    if (message[field] === undefined) continue;
    if (field === 'generatedMessage') details[field] = Boolean(message[field]);
    else if (field === 'diff') details[field] = Array.isArray(message.diff) ? message.diff.slice(0, 10).map(pickDiffEntry) : undefined;
    else details[field] = String(message[field]);
  }
  return details;
}

function pickDiffEntry(entry) {
  return { path: String(entry?.path ?? ''), actual: String(entry?.actual ?? ''), expected: String(entry?.expected ?? '') };
}
