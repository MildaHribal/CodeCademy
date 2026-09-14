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

/**
 * Každý test běží v novém iframu, testy jdou po sobě. `logs` a `errors` jsou z prvního běhu.
 *
 * Nepovinné `request.signal` (AbortSignal) kontrolu zruší: běžící iframe se hned odstraní
 * a zbylé testy se nespustí. Aplikace ho předává při odchodu z obrazovky — zaseknutý test
 * by jinak dál blokoval proces, který sandboxované iframy sdílejí, a kontroly na další
 * obrazovce by falešně končily „Test nedoběhl včas".
 * Bez testů (`hints: []`) se stránka jen načte — hodí se pro kontrolu živých ukázek.
 *
 * Když se stránka zasekne už při načítání (nekonečná smyčka v kódu, který běží hned),
 * zasekla by se stejně u každého dalšího testu a kontrola by trvala počet testů × timeoutMs.
 * Zbylé testy se proto nespustí a mají `{ pass: false, skipped: true }`.
 *
 * Kód, který nejde naparsovat (`syntaxError`), se nespouští vůbec: jinak by každý test
 * hlásil falešné „categories is not defined" místo skutečné chyby.
 */
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

  // Runtime js žádné HTML neskládá, inline skripty v něm se nespustí. React překládá JSX.
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

/** { localStorage: { klíč: hodnota } } → jen texty; cokoli jiného → null. */
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
