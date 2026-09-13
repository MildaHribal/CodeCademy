// runTests(request) → RunResult (kontrakt kap. 6.1).
import { runNodeTestsRemote } from './node-client.js';
import { runInFrame } from './run-in-frame.js';

export const RUNTIMES = ['dom', 'js', 'vue', 'node'];
const DEFAULT_TIMEOUT_MS = { dom: 5000, js: 5000, vue: 5000, node: 10000 };

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
 */
export async function runTests(request) {
  const runtime = request?.runtime ?? 'dom';
  if (!RUNTIMES.includes(runtime)) throw new Error(`Neznámý runtime "${runtime}"`);
  const files = (request.files ?? []).map((file) => ({ name: String(file.name), content: String(file.content ?? '') }));
  const hints = request.hints ?? [];
  const timeoutMs = Number(request.timeoutMs) > 0 ? Number(request.timeoutMs) : DEFAULT_TIMEOUT_MS[runtime];
  const signal = request.signal ?? null;

  if (runtime === 'node') return runNodeTestsRemote({ files, hints, timeoutMs, signal });

  if (hints.length === 0) {
    const page = await runInFrame({ runtime, files, test: null, timeoutMs, signal });
    return { ok: page.pass, results: [], logs: page.logs, errors: page.pass ? page.errors : [...page.errors, page.error] };
  }

  const results = [];
  let first = null;
  let pageStuck = false;
  for (const [index, hint] of hints.entries()) {
    if (pageStuck || signal?.aborted) {
      results.push({ index, pass: false, skipped: true, error: pageStuck ? SKIPPED_MESSAGE : CANCELLED_MESSAGE });
      continue;
    }
    const outcome = await runInFrame({ runtime, files, test: String(hint.test ?? ''), timeoutMs, signal });
    first ??= outcome;
    results.push(outcome.pass ? { index, pass: true } : { index, pass: false, error: outcome.error });
    pageStuck = !outcome.pass && outcome.phase === 'load';
  }
  return { ok: results.every((result) => result.pass), results, logs: first?.logs ?? [], errors: first?.errors ?? [] };
}
