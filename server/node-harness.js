import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import util from 'node:util';
import { describeAssertion } from '../shared/runner-assertion.js';
import { normalize, stripComments } from './text-helpers.js';

const MAX_LOG_ENTRIES = 1000;
const MAX_OUTPUT = 1024 * 1024;

const AsyncFunction = (async () => {}).constructor;

let finished = false;
const startedChildren = new Set();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function childEnv(extra = {}) {
  const env = { ...process.env, ...extra };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_OPTIONS;
  return env;
}

function descendantsOf(pid) {
  let entries;
  try {
    entries = fs.readdirSync('/proc').filter((name) => /^\d+$/.test(name));
  } catch {
    return [];
  }
  const childrenByParent = new Map();
  for (const name of entries) {
    try {
      const stat = fs.readFileSync(`/proc/${name}/stat`, 'utf8');
      const ppid = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]);
      if (!childrenByParent.has(ppid)) childrenByParent.set(ppid, []);
      childrenByParent.get(ppid).push(Number(name));
    } catch {
    }
  }
  const out = [];
  const stack = [pid];
  while (stack.length) {
    for (const child of childrenByParent.get(stack.pop()) ?? []) {
      out.push(child);
      stack.push(child);
    }
  }
  return out;
}

function killTree(pid, signal = 'SIGKILL') {
  for (const target of [...descendantsOf(pid), pid]) {
    try {
      process.kill(target, signal);
    } catch {
    }
  }
}

function lineCollector(logs, level) {
  let pending = '';
  const push = (text) => {
    if (logs.length < MAX_LOG_ENTRIES) logs.push({ level, text });
  };
  return {
    write(chunk) {
      pending += chunk;
      const lines = pending.split('\n');
      pending = lines.pop();
      lines.forEach((line) => push(line.replace(/\r$/, '')));
    },
    flush() {
      if (pending) push(pending);
      pending = '';
    },
  };
}

function outputBuffer() {
  let text = '';
  let truncated = false;
  return {
    append(chunk) {
      if (text.length >= MAX_OUTPUT) {
        truncated = true;
        return;
      }
      text += chunk;
    },
    toString() {
      return truncated ? `${text}\n…(výstup zkrácen)` : text;
    },
  };
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function canConnect(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(300, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

function createHelpers({ dir, logs, testTimeoutMs = null }) {
  const defaultRunTimeoutMs = Math.max(10000, Number(testTimeoutMs) || 0);

  let importCounter = 0;

  async function waitFor(fn, timeoutMs = 2000) {
    const deadline = Date.now() + timeoutMs;
    let lastError = null;
    for (;;) {
      try {
        const value = await fn();
        if (value) return value;
      } catch (err) {
        lastError = err;
      }
      if (Date.now() >= deadline) {
        const reason = lastError ? `: ${lastError.message}` : '';
        throw new Error(`Podmínka se nesplnila do ${timeoutMs} ms${reason}`);
      }
      await wait(50);
    }
  }

  async function importFile(name) {
    const file = path.resolve(dir, name);
    importCounter++;
    return import(`${pathToFileURL(file).href}?import=${Date.now()}-${importCounter}`);
  }

  function run(cmd, { timeoutMs = defaultRunTimeoutMs, input } = {}) {
    return new Promise((resolve) => {
      const stdout = outputBuffer();
      const stderr = outputBuffer();
      const outLines = lineCollector(logs, 'log');
      const errLines = lineCollector(logs, 'error');
      let timedOut = false;
      let settled = false;

      const child = spawn('bash', ['-c', String(cmd)], { cwd: dir, env: childEnv(), stdio: ['pipe', 'pipe', 'pipe'] });
      startedChildren.add(child);
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => { stdout.append(chunk); outLines.write(chunk); });
      child.stderr.on('data', (chunk) => { stderr.append(chunk); errLines.write(chunk); });
      child.stdin.on('error', () => {});
      child.stdin.end(input === undefined || input === null ? undefined : String(input));

      const timer = setTimeout(() => {
        timedOut = true;
        killTree(child.pid);
      }, timeoutMs);

      const finish = (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        outLines.flush();
        errLines.flush();
        startedChildren.delete(child);
        const result = { code, stdout: stdout.toString(), stderr: stderr.toString() };
        if (timedOut) {
          result.stderr += `${result.stderr ? '\n' : ''}Příkaz nedoběhl do ${timeoutMs} ms a byl ukončen.`;
          result.timedOut = true;
        }
        resolve(result);
      };

      child.on('error', (err) => {
        stderr.append(err.message);
        finish(127);
      });
      child.on('close', (code) => finish(timedOut ? null : code));
      child.on('exit', (code) => setTimeout(() => finish(timedOut ? null : code), 100));
    });
  }

  async function startServer(file, { port, env = {}, timeoutMs = 5000 } = {}) {
    const serverPort = port ?? await freePort();
    let output = '';
    const outLines = lineCollector(logs, 'log');
    const errLines = lineCollector(logs, 'error');
    const child = spawn(process.execPath, [String(file)], {
      cwd: dir,
      env: childEnv({ ...env, PORT: String(serverPort) }),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    startedChildren.add(child);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { if (output.length < MAX_OUTPUT) output += chunk; outLines.write(chunk); });
    child.stderr.on('data', (chunk) => { if (output.length < MAX_OUTPUT) output += chunk; errLines.write(chunk); });

    let exitCode;
    const exited = new Promise((resolve) => {
      child.on('exit', (code, signal) => {
        exitCode = code ?? signal;
        outLines.flush();
        errLines.flush();
        startedChildren.delete(child);
        resolve();
      });
      child.on('error', (err) => {
        output += err.message;
        exitCode = 'error';
        resolve();
      });
    });

    const stop = async () => {
      if (exitCode !== undefined) return;
      killTree(child.pid, 'SIGTERM');
      const gone = await Promise.race([exited.then(() => true), wait(1000).then(() => false)]);
      if (!gone) {
        killTree(child.pid, 'SIGKILL');
        await exited;
      }
    };

    const deadline = Date.now() + timeoutMs;
    for (;;) {
      if (exitCode !== undefined) {
        throw new Error(`Server ${file} skončil dřív, než začal poslouchat (kód ${exitCode}).\n${output}`.trim());
      }
      if (await canConnect('127.0.0.1', serverPort)) {
        return { url: `http://127.0.0.1:${serverPort}`, port: serverPort, output: () => output, stop };
      }
      if (await canConnect('::1', serverPort)) {
        return { url: `http://[::1]:${serverPort}`, port: serverPort, output: () => output, stop };
      }
      if (Date.now() >= deadline) {
        await stop();
        throw new Error(`Server ${file} nezačal do ${timeoutMs} ms poslouchat na portu ${serverPort}.\n${output}`.trim());
      }
      await wait(50);
    }
  }

  return {
    dir,
    importFile,
    run,
    startServer,
    wait,
    waitFor,
    stripComments,
    normalize,
  };
}

const MESSAGE_ARGUMENT = {
  ok: 1, equal: 2, notEqual: 2, strictEqual: 2, notStrictEqual: 2, deepEqual: 2, notDeepEqual: 2,
  deepStrictEqual: 2, notDeepStrictEqual: 2, match: 2, doesNotMatch: 2,
};

function createTestAssert(base) {
  const keepAuthorMessage = (error, message) => {
    if (error?.code === 'ERR_ASSERTION' && typeof message === 'string' && !error.generatedMessage) error.message = message;
    return error;
  };
  const wrap = (name, messageIndex) => (...args) => {
    try {
      return base[name](...args);
    } catch (error) {
      throw keepAuthorMessage(error, args[messageIndex]);
    }
  };
  const testAssert = wrap('ok', 1);
  for (const name of Object.keys(base)) testAssert[name] = base[name];
  for (const [name, index] of Object.entries(MESSAGE_ARGUMENT)) testAssert[name] = wrap(name, index);
  testAssert.strict = testAssert;
  testAssert.AssertionError = base.AssertionError;
  return testAssert;
}

const testAssert = createTestAssert(assert);

function formatValue(value) {
  return util.inspect(value, { depth: 2, breakLength: 72, maxArrayLength: 100 });
}

function describeError(err) {
  if (!(err instanceof Error)) return String(err);
  if (err.name !== 'AssertionError' || !err.generatedMessage) return err.message || err.name;
  return czechAssertionMessage(err) ?? err.message;
}

function czechAssertionMessage(err) {
  const actual = () => formatValue(err.actual);
  const expected = () => formatValue(err.expected);
  const errorText = (value) => (value instanceof Error ? value.message : String(value));
  switch (err.operator) {
    case 'strictEqual':
    case 'deepStrictEqual':
      return `Očekávám ${expected()}, ale kód vrátil ${actual()}`;
    case 'notStrictEqual':
      return `Hodnota se nemá rovnat ${expected()}, ale kód vrátil právě ji`;
    case 'notDeepStrictEqual':
      return `Hodnota se nemá rovnat ${expected()}, ale kód vrátil právě takovou`;
    case '==':
    case 'ok':
      return `Očekávám pravdivou hodnotu, ale kód vrátil ${actual()}`;
    case 'match':
      return typeof err.actual === 'string'
        ? `Text ${actual()} neodpovídá regulárnímu výrazu ${err.expected}`
        : `Očekávám text, ale kód vrátil ${typeof err.actual} ${actual()}`;
    case 'doesNotMatch':
      return typeof err.actual === 'string'
        ? `Text ${actual()} nemá odpovídat regulárnímu výrazu ${err.expected}`
        : `Očekávám text, ale kód vrátil ${typeof err.actual} ${actual()}`;
    case 'throws':
      return err.actual === undefined ? 'Očekávám, že kód vyhodí výjimku, ale žádnou nevyhodil' : null;
    case 'rejects':
      return err.actual === undefined ? 'Očekávám, že Promise skončí chybou, ale splnila se' : null;
    case 'doesNotThrow':
    case 'doesNotReject':
      return `Kód neměl vyhodit výjimku, ale vyhodil: ${errorText(err.actual)}`;
    case 'fail':
      return 'Test selhal';
    default:
      return null;
  }
}

function finish(pass, error, logs) {
  if (finished) return;
  finished = true;
  for (const child of startedChildren) {
    if (child.pid) killTree(child.pid);
  }
  const message = { type: 'result', pass, logs };
  if (!pass) Object.assign(message, { error: describeError(error) }, describeAssertion(error, formatValue));
  process.send(message, () => process.exit(0));
}

process.once('message', async ({ test, files, dir, timeoutMs }) => {
  const logs = [];
  const errors = [];
  process.on('uncaughtException', (err) => finish(false, err, logs));
  process.on('unhandledRejection', (err) => finish(false, err, logs));

  let body;
  try {
    body = new AsyncFunction('assert', 'files', 'logs', 'errors', 'helpers', test);
  } catch (err) {
    finish(false, new Error(`Test nejde spustit: ${describeError(err)}`), logs);
    return;
  }

  const helpers = createHelpers({ dir, logs, testTimeoutMs: timeoutMs });
  await new Promise((resolve) => process.send({ type: 'started' }, resolve));
  try {
    await body(testAssert, files, logs, errors, helpers);
    finish(true, null, logs);
  } catch (err) {
    finish(false, err, logs);
  }
});

process.on('disconnect', () => {
  try {
    process.kill(-process.pid, 'SIGKILL');
  } catch {
    process.exit(1);
  }
});
