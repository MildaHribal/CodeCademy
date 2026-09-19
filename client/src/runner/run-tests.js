// runTests(request) → RunResult (kontrakt kap. 6.1).
import { findSyntaxError, syntaxErrorResult } from '../../../shared/syntax-check.js';
import { findReactSyntaxError } from './jsx-transform.js';
import { runNodeTestsRemote } from './node-client.js';
import { runInFrame } from './run-in-frame.js';
import { normalizeLibs } from './vendor-libs.js';

export const RUNTIMES = ['dom', 'js', 'vue', 'react', 'node'];
const DEFAULT_TIMEOUT_MS = { dom: 5000, js: 5000, vue: 5000, react: 5000, node: 10000 };

export const SKIPPED_MESSAGE = 'Neověřeno — stránka se už při načítání zasekla (nekonečná smyčka?), další testy se proto nespouštěly.';
export const CANCELLED_MESSAGE = 'Neověřeno — kontrola byla zrušena.';

export async function runTests(request) {
  const runtime = request?.runtime ?? 'dom';
  if (!RUNTIMES.includes(runtime)) throw new Error(`Neznámý runtime "${runtime}"`);
  const files = (request.files ?? []).map((file) => ({ name: String(file.name), content: String(file.content ?? '') }));
  const hints = request.hints ?? [];
  const timeoutMs = Number(request.timeoutMs) > 0 ? Number(request.timeoutMs) : DEFAULT_TIMEOUT_MS[runtime];
  const signal = request.signal ?? null;
  // Nepovinné: počáteční obsah localStorage/sessionStorage v sandboxu (kontrakt kap. 13, návrh).
  const storage = normalizeStorage(request.storage);
  // Nepovinné: knihovny stránky (kontrakt kap. 6.10), např. ['tailwind', 'gsap'].
  const libs = normalizeLibs(request.libs);

  if (runtime === 'node') return runNodeTestsRemote({ files, hints, timeoutMs, signal });

  const syntaxError = runtime === 'react' ? findReactSyntaxError(files) : findSyntaxError(files, { includeHtml: runtime !== 'js' });

  if (hints.length === 0) {
    const page = await runInFrame({ runtime, files, libs, test: null, timeoutMs, signal, storage });
    return { ok: page.pass, results: [], logs: page.logs, errors: page.pass ? page.errors : [...page.errors, page.error], syntaxError };
  }

  if (syntaxError) return syntaxErrorResult(hints, syntaxError);

  const results = [];
  let first = null;
  let pageStuck = false;
  for (const [index, hint] of hints.entries()) {
    if (pageStuck || signal?.aborted) {
      results.push({ index, pass: false, skipped: true, error: pageStuck ? SKIPPED_MESSAGE : CANCELLED_MESSAGE });
      continue;
    }
    const outcome = await runInFrame({ runtime, files, libs, test: String(hint.test ?? ''), timeoutMs, signal, storage });
    first ??= outcome;
    results.push(outcome.pass ? { index, pass: true } : { index, pass: false, error: outcome.error, ...outcome.details });
    pageStuck = !outcome.pass && outcome.phase === 'load';
  }
  return { ok: results.every((result) => result.pass), results, logs: first?.logs ?? [], errors: first?.errors ?? [], syntaxError: null };
}

function normalizeStorage(storage) {
  if (!storage || typeof storage !== 'object') return null;
  const out = {};
  for (const name of ['localStorage', 'sessionStorage']) {
    const entries = storage[name];
    if (entries && typeof entries === 'object') {
      out[name] = Object.fromEntries(Object.entries(entries).map(([key, value]) => [String(key), String(value)]));
    }
  }
  return Object.keys(out).length ? out : null;
}
