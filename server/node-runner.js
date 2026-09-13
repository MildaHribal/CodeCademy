// Běh testů a souborů v runtime node (kontrakt kap. 6.6–6.8).
//
// Každý test běží ve vlastním procesu `node node-harness.js`. Proces se spouští
// „detached", takže je vedoucím nové skupiny procesů — do ní patří i všechno, co test
// spustí (helpers.run, helpers.startServer). Po skončení testu nebo po timeoutu se
// zabije celá skupina najednou přes process.kill(-pid).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { readTextTree } from '../shared/content.js';
import { findSyntaxError, syntaxErrorResult } from '../shared/syntax-check.js';
import { InputError } from './errors.js';

const HARNESS = path.join(import.meta.dirname, 'node-harness.js');
// Rezerva na start procesu; test samotný má limit timeoutMs od chvíle, kdy začne běžet.
const STARTUP_GRACE_MS = 5000;
const MAX_OUTPUT = 1024 * 1024;
const CANCELLED_MESSAGE = 'Neověřeno — kontrola byla zrušena.';

// Skupiny procesů, které právě běží. Když server skončí, nesmí po něm nic zůstat.
const activeGroups = new Set();
process.on('exit', () => {
  for (const pgid of activeGroups) killGroup(pgid);
});

function killGroup(pgid, signal = 'SIGKILL') {
  try {
    process.kill(-pgid, signal);
  } catch {
    // Skupina už neexistuje.
  }
}

/** Počká, až ze skupiny procesů nezbude nikdo (nejdéle maxMs), ať po testu nic neběží. */
async function waitForGroupExit(pgid, maxMs = 2000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      process.kill(-pgid, 0);
    } catch {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function childEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_OPTIONS;
  return env;
}

/** Ověří, že jméno souboru je relativní cesta, která nevede ven z adresáře. */
function resolveInside(dir, name) {
  if (typeof name !== 'string' || !name || name.includes('\0') || path.isAbsolute(name)) {
    throw new InputError(`Neplatné jméno souboru "${name}"`);
  }
  const target = path.resolve(dir, name);
  if (!target.startsWith(dir + path.sep)) {
    throw new InputError(`Soubor "${name}" by ležel mimo pracovní adresář`);
  }
  return target;
}

function checkFiles(files) {
  if (!Array.isArray(files) || !files.every((f) => f && typeof f.name === 'string' && typeof f.content === 'string')) {
    throw new InputError('Pole "files" musí obsahovat objekty { name, content } s textem');
  }
}

/**
 * Připraví pracovní adresář. Bez `cwd` vytvoří dočasný a zapíše do něj soubory;
 * s `cwd` (projekt uživatele) použije ten adresář a na nic v něm nesahá.
 */
async function prepareWorkspace(files, cwd) {
  if (cwd) {
    const dir = await fsp.realpath(path.resolve(cwd));
    return { dir, cleanup: async () => {} };
  }
  checkFiles(files);
  const dir = await fsp.realpath(await fsp.mkdtemp(path.join(os.tmpdir(), 'akademie-node-')));
  const cleanup = () => fsp.rm(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  try {
    for (const file of files) {
      const target = resolveInside(dir, file.name);
      try {
        await fsp.mkdir(path.dirname(target), { recursive: true });
        await fsp.writeFile(target, file.content);
      } catch (err) {
        // Jména se navzájem vylučují (soubor `a` i `a/b.js`, nebo `a/` jako adresář) — chyba vstupu.
        if (['EEXIST', 'ENOTDIR', 'EISDIR'].includes(err.code)) {
          throw new InputError(`Soubor "${file.name}" nejde zapsat — koliduje s jiným souborem nebo adresářem`);
        }
        throw err;
      }
    }
  } catch (err) {
    await cleanup();
    throw err;
  }
  return { dir, cleanup };
}

function tail(text, max = 2000) {
  return text.length > max ? `…${text.slice(-max)}` : text;
}

const DETAIL_FIELDS = ['errorName', 'operator', 'actual', 'expected', 'generatedMessage', 'diff'];

/** Podrobnosti selhaného testu z harnessu (kontrakt kap. 6.1), jen známá pole. */
function pickDetails(message) {
  const details = {};
  for (const field of DETAIL_FIELDS) {
    if (message[field] === undefined) continue;
    if (field === 'generatedMessage') details.generatedMessage = Boolean(message.generatedMessage);
    else if (field === 'diff') {
      if (Array.isArray(message.diff)) {
        details.diff = message.diff.slice(0, 10).map((entry) => ({ path: String(entry?.path ?? ''), actual: String(entry?.actual ?? ''), expected: String(entry?.expected ?? '') }));
      }
    } else details[field] = String(message[field]);
  }
  return details;
}

/** Spustí jeden test v novém procesu. → { pass, error?, details?, logs } */
function runSingleTest({ dir, test, files, timeoutMs, signal }) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [HARNESS], {
      cwd: dir,
      env: childEnv(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });
    if (child.pid) activeGroups.add(child.pid);

    // Výstup harnessu (např. console.log z importovaného souboru) musíme číst,
    // jinak by se zaplnila roura a proces by se zasekl. Konec se hodí do chybové hlášky.
    let stderr = '';
    child.stdout.resume();
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => { stderr = tail(stderr + chunk, 4000); });

    let settled = false;
    let testTimer = null;
    let startupTimer = null;
    const onAbort = () => settle({ pass: false, error: CANCELLED_MESSAGE });
    signal?.addEventListener('abort', onAbort);

    const settle = (outcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(testTimer);
      clearTimeout(startupTimer);
      signal?.removeEventListener('abort', onAbort);
      if (!child.pid) {
        resolve({ logs: [], ...outcome });
        return;
      }
      killGroup(child.pid);
      waitForGroupExit(child.pid).then(() => {
        activeGroups.delete(child.pid);
        resolve({ logs: [], ...outcome });
      });
    };
    const timeoutFailure = () => settle({
      pass: false,
      error: `Test nedoběhl včas — nekonečná smyčka? (limit ${timeoutMs} ms)`,
    });

    startupTimer = setTimeout(timeoutFailure, timeoutMs + STARTUP_GRACE_MS);

    child.on('message', (message) => {
      if (message?.type === 'started') {
        testTimer = setTimeout(timeoutFailure, timeoutMs);
      } else if (message?.type === 'result') {
        settle({
          pass: Boolean(message.pass),
          ...(message.pass ? {} : { error: String(message.error ?? 'Test selhal'), details: pickDetails(message) }),
          logs: Array.isArray(message.logs) ? message.logs : [],
        });
      }
    });
    child.on('error', (err) => settle({ pass: false, error: `Test nejde spustit: ${err.message}` }));
    child.on('exit', (code, signal) => {
      // Výsledek mohl přijít těsně před koncem procesu — dáme IPC chvilku.
      setTimeout(() => {
        const detail = tail(stderr.trim());
        settle({
          pass: false,
          error: `Test skončil předčasně (${signal ? `signál ${signal}` : `kód ${code}`})${detail ? `: ${detail}` : ''}`,
        });
      }, 50);
    });

    child.send({ type: 'run', test, files, dir }, (err) => {
      if (err) settle({ pass: false, error: `Test nejde spustit: ${err.message}` });
    });
  });
}

/**
 * Spustí testy (nápovědy) nad soubory v runtime node.
 *
 * Nepovinný `signal` (AbortSignal) běh zruší: právě běžící test se zabije i se vším, co
 * spustil, a zbylé testy se přeskočí. Server ho předává, když klient spojení zavře
 * (uživatel odešel z obrazovky) — jinak by opuštěná kontrola dál zabírala místo ve frontě.
 * Bez `cwd` se nejdřív zkontroluje syntaxe JS souborů (kontrakt kap. 6.1): kód, který nejde
 * naparsovat, se nespouští a všechny požadavky jsou neověřené. Projekt (`cwd`) se předem
 * nekontroluje — může mít vlastní sestavení a soubory, které se nespouštějí.
 * @returns {Promise<{ ok: boolean, results: {index, pass, error?, skipped?}[], logs: {level,text}[], errors: string[], syntaxError }>}
 */
export async function runNodeTests({ files = [], hints = [], timeoutMs = 10000, cwd = null, signal = null } = {}) {
  if (!Array.isArray(hints) || !hints.every((h) => h && typeof h.test === 'string')) {
    throw new InputError('Pole "hints" musí obsahovat objekty s textem testu v "test"');
  }
  if (!cwd) {
    checkFiles(files);
    // Node HTML soubory nespouští, jejich inline skripty se proto nekontrolují.
    const syntaxError = findSyntaxError(files, { includeHtml: false });
    if (syntaxError) return syntaxErrorResult(hints, syntaxError);
  }
  const workspace = await prepareWorkspace(files, cwd);
  try {
    // U projektu se soubory berou z disku, jinak z požadavku.
    const fileList = cwd ? readTextTree(workspace.dir) : files;
    const fileMap = Object.fromEntries(fileList.map((f) => [f.name, f.content]));

    const results = [];
    let logs = [];
    for (const [index, hint] of hints.entries()) {
      if (signal?.aborted) {
        results.push({ index, pass: false, skipped: true, error: CANCELLED_MESSAGE });
        continue;
      }
      const outcome = await runSingleTest({ dir: workspace.dir, test: hint.test, files: fileMap, timeoutMs, signal });
      results.push(outcome.pass ? { index, pass: true } : { index, pass: false, error: outcome.error, ...outcome.details });
      // Logy bereme z prvního testu, který uživatelův kód opravdu spustil (jinak by se opakovaly).
      if (logs.length === 0 && outcome.logs.length > 0) logs = outcome.logs;
    }
    return { ok: results.every((r) => r.pass), results, logs, errors: [], syntaxError: null };
  } finally {
    await workspace.cleanup();
  }
}

/**
 * Spustí `node <main>` nad soubory a vrátí jeho výstup.
 * @returns {Promise<{ code: number|null, stdout: string, stderr: string, timedOut: boolean }>}
 */
export async function runNodeFile({ files = [], main, timeoutMs = 5000, cwd = null } = {}) {
  const workspace = await prepareWorkspace(files, cwd);
  try {
    const mainPath = resolveInside(workspace.dir, main);
    if (!fs.existsSync(mainPath)) throw new InputError(`Soubor "${main}" neexistuje`);

    return await new Promise((resolve) => {
      const child = spawn(process.execPath, [mainPath], {
        cwd: workspace.dir,
        env: childEnv(),
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      if (child.pid) activeGroups.add(child.pid);

      const output = { stdout: '', stderr: '' };
      const truncated = { stdout: false, stderr: false };
      for (const stream of ['stdout', 'stderr']) {
        child[stream].setEncoding('utf8');
        child[stream].on('data', (chunk) => {
          if (output[stream].length < MAX_OUTPUT) output[stream] += chunk;
          else truncated[stream] = true;
        });
      }

      let timedOut = false;
      let settled = false;
      const timer = setTimeout(() => {
        timedOut = true;
        if (child.pid) killGroup(child.pid);
      }, timeoutMs);

      const settle = (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        for (const stream of ['stdout', 'stderr']) {
          if (truncated[stream]) output[stream] += '\n…(výstup zkrácen)';
        }
        if (timedOut) {
          output.stderr += `${output.stderr ? '\n' : ''}Program nedoběhl do ${timeoutMs} ms — nekonečná smyčka?`;
        }
        const result = { code: timedOut ? null : code, stdout: output.stdout, stderr: output.stderr, timedOut };
        if (!child.pid) {
          resolve(result);
          return;
        }
        killGroup(child.pid);
        waitForGroupExit(child.pid).then(() => {
          activeGroups.delete(child.pid);
          resolve(result);
        });
      };

      child.on('error', (err) => {
        output.stderr += err.message;
        settle(null);
      });
      child.on('close', (code) => settle(code));
      // Proces na pozadí může držet výstup otevřený — pak stačí konec hlavního procesu.
      child.on('exit', (code) => setTimeout(() => settle(code), 100));
    });
  } finally {
    await workspace.cleanup();
  }
}
