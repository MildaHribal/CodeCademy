import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { HttpError, InputError } from './errors.js';

export const DEV_PROCESS_DEFAULTS = {
  idleMs: 10 * 60 * 1000,
  startWaitMs: 5000,
  killGraceMs: 2000,
  maxChunks: 5000,
  maxOutputBytes: 1024 * 1024,
  maxBodyBytes: 1024 * 1024,
  requestTimeoutMs: 10000,
  maxRequestTimeoutMs: 30000,
  tempPrefix: 'akademie-dev-',
};

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const ENV_NAME = /^[A-Z_][A-Z0-9_]*$/;
const JS_FILE = /\.(m?js|cjs)$/;
const TEXT_TYPE = /^text\/|json|javascript|xml|x-www-form-urlencoded/i;
const POLL_MS = 50;

const liveGroups = new Set();
process.on('exit', () => {
  for (const pgid of liveGroups) signalGroup(pgid, 'SIGKILL');
});

function signalGroup(pgid, signal) {
  try {
    process.kill(-pgid, signal);
    return true;
  } catch {
    return false;
  }
}

function groupAlive(pgid) {
  try {
    process.kill(-pgid, 0);
    return true;
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function canConnect(host, port, timeoutMs = 300) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

function baseEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_OPTIONS;
  return env;
}

function resolveInside(dir, name) {
  if (typeof name !== 'string' || !name || name.includes('\0') || path.isAbsolute(name)) {
    throw new InputError(`Neplatné jméno souboru "${name}"`);
  }
  const target = path.resolve(dir, name);
  if (!target.startsWith(dir + path.sep)) throw new InputError(`Soubor "${name}" by ležel mimo pracovní adresář`);
  return target;
}

export function pickMain(names, main) {
  if (main !== undefined && main !== null) {
    if (typeof main !== 'string' || !main) throw new InputError('"main" musí být jméno souboru');
    return main.replace(/^\.\//, '');
  }
  if (names.includes('index.js')) return 'index.js';
  const first = names.find((name) => JS_FILE.test(name));
  if (!first) throw new InputError('Není co spustit — chybí soubor .js');
  return first;
}

export function checkEnv(env) {
  if (env === undefined || env === null) return {};
  if (typeof env !== 'object' || Array.isArray(env)) throw new InputError('"env" musí být objekt { JMENO: "hodnota" }');
  for (const [key, value] of Object.entries(env)) {
    if (!ENV_NAME.test(key)) throw new InputError(`Proměnná prostředí "${key}" má neplatné jméno (povolená jsou velká písmena, číslice a _)`);
    if (typeof value !== 'string') throw new InputError(`Hodnota proměnné "${key}" musí být text`);
  }
  return { ...env };
}

function checkFiles(files) {
  if (!Array.isArray(files) || files.length === 0 || !files.every((f) => f && typeof f.name === 'string' && typeof f.content === 'string')) {
    throw new InputError('Pole "files" musí obsahovat aspoň jeden objekt { name, content } s textem');
  }
}

async function writeTempFiles(files, prefix) {
  const dir = await fsp.realpath(await fsp.mkdtemp(path.join(os.tmpdir(), prefix)));
  try {
    for (const file of files) {
      const target = resolveInside(dir, file.name);
      try {
        await fsp.mkdir(path.dirname(target), { recursive: true });
        await fsp.writeFile(target, file.content);
      } catch (error) {
        if (['EEXIST', 'ENOTDIR', 'EISDIR'].includes(error.code)) {
          throw new InputError(`Soubor "${file.name}" nejde zapsat — koliduje s jiným souborem nebo adresářem`);
        }
        throw error;
      }
    }
  } catch (error) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw error;
  }
  return dir;
}

function rootJsFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function idleText(ms) {
  if (ms >= 60000 && ms % 60000 === 0) {
    const minutes = ms / 60000;
    return minutes === 1 ? 'po 1 minutě' : `po ${minutes} minutách`;
  }
  return `po ${Math.max(1, Math.round(ms / 1000))} s`;
}

const byteLength = (text) => Buffer.byteLength(text, 'utf8');

export function createOutputBuffer({ maxChunks, maxBytes }) {
  let chunks = [];
  let bytes = 0;
  let nextSeq = 0;

  return {
    push(stream, text) {
      if (!text) return;
      let value = text;
      if (byteLength(value) > maxBytes) value = `…${value.slice(-Math.floor(maxBytes / 4))}`;
      const chunk = { seq: nextSeq++, stream, text: value, at: new Date().toISOString() };
      chunks.push(chunk);
      bytes += byteLength(value);
      while (chunks.length > maxChunks || (bytes > maxBytes && chunks.length > 1)) {
        bytes -= byteLength(chunks.shift().text);
      }
    },
    since(since) {
      const oldest = chunks.length ? chunks[0].seq : nextSeq;
      return {
        next: nextSeq,
        truncated: since < oldest,
        chunks: chunks.filter((chunk) => chunk.seq >= since),
      };
    },
    clear() {
      chunks = [];
      bytes = 0;
      nextSeq = 0;
    },
  };
}

export function describeRequestError(error, { port, timeoutMs }) {
  switch (error.code) {
    case 'ECONNREFUSED':
      return `Spojení odmítnuto — server na portu ${port} neposlouchá.`;
    case 'ECONNRESET':
      return 'Server spojení ukončil dřív, než poslal odpověď (spadl, nebo nezavolal res.end?).';
    case 'ETIMEDOUT':
      return `Server neodpověděl do ${timeoutMs} ms — nezapomněl jsi zavolat res.end()?`;
    case 'ERR_INVALID_HTTP_TOKEN':
    case 'ERR_INVALID_CHAR':
      return `Neplatná hlavička požadavku: ${error.message}`;
    default:
      if (String(error.code ?? '').startsWith('HPE_')) return `Server poslal neplatnou HTTP odpověď (${error.code}).`;
      return `Požadavek selhal: ${error.message}`;
  }
}

export function encodeBody(buffer, contentType) {
  if (TEXT_TYPE.test(contentType ?? '')) return { body: buffer.toString('utf8'), bodyEncoding: 'utf8' };
  if (!contentType) {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      return { body: text, bodyEncoding: 'utf8' };
    } catch {
    }
  }
  return { body: buffer.toString('base64'), bodyEncoding: 'base64' };
}

function responseHeaders(res) {
  const headers = {};
  for (const [name, value] of Object.entries(res.headers)) {
    headers[name] = Array.isArray(value) ? value.join(name === 'set-cookie' ? '\n' : ', ') : String(value);
  }
  return headers;
}

export function createDevProcessManager(options = {}) {
  const config = { ...DEV_PROCESS_DEFAULTS, ...options };
  const output = createOutputBuffer({ maxChunks: config.maxChunks, maxBytes: config.maxOutputBytes });

  let counter = 0;
  let current = null;
  let idleTimer = null;
  let lastActivity = Date.now();
  let queue = Promise.resolve();
  let closed = false;

  function serialize(task) {
    const run = queue.then(task);
    queue = run.catch(() => {});
    return run;
  }

  function publicProcess(proc = current) {
    if (!proc) return null;
    return {
      id: proc.id,
      status: proc.status,
      listening: proc.listening,
      port: proc.port,
      url: proc.url,
      main: proc.main,
      startedAt: proc.startedAt,
      exitCode: proc.exitCode,
      signal: proc.signal,
    };
  }

  function touch() {
    lastActivity = Date.now();
    clearTimeout(idleTimer);
    idleTimer = null;
    if (!closed && current?.status === 'running') armIdle(config.idleMs);
  }

  function armIdle(delay) {
    idleTimer = setTimeout(onIdle, delay);
    idleTimer.unref?.();
  }

  function onIdle() {
    idleTimer = null;
    const proc = current;
    if (closed || proc?.status !== 'running') return;
    const remaining = config.idleMs - (Date.now() - lastActivity);
    if (remaining > 0) {
      armIdle(remaining);
      return;
    }
    serialize(() => {
      if (current !== proc || Date.now() - lastActivity < config.idleMs) return false;
      return stopProcess(proc, `Zastaveno ${idleText(config.idleMs)} nečinnosti.`);
    });
  }

  async function watchListening(proc) {
    while (proc.status === 'running' && !proc.listening) {
      for (const host of ['127.0.0.1', '::1']) {
        if (proc.status !== 'running' || proc.listening) break;
        if (await canConnect(host, proc.port)) {
          if (proc.status !== 'running') break;
          proc.listening = true;
          proc.host = host;
          proc.url = host === '::1' ? `http://[::1]:${proc.port}` : `http://127.0.0.1:${proc.port}`;
          output.push('system', `Server poslouchá na ${proc.url}`);
          proc.notify();
        }
      }
      if (!proc.listening) await sleep(POLL_MS * 2);
    }
  }

  async function start(body = {}) {
    const hasFiles = body.files !== undefined;
    const hasProject = body.project !== undefined;
    if (hasFiles === hasProject) throw new InputError('Pošli buď "files", nebo "project" (přesně jedno)');
    const env = checkEnv(body.env);
    let projectDir = null;
    if (hasFiles) checkFiles(body.files);
    else {
      if (typeof config.projectDir !== 'function') throw new InputError('Spouštění projektů tu není dostupné');
      projectDir = config.projectDir(body.project);
    }

    return serialize(async () => {
      if (closed) throw new HttpError(409, 'Server Akademie se zrovna vypíná');
      if (current?.status === 'running') await stopProcess(current, null);

      const cleanupDir = hasFiles ? await writeTempFiles(body.files, config.tempPrefix) : null;
      const dir = cleanupDir ?? projectDir;
      let main;
      let mainPath;
      try {
        main = pickMain(hasFiles ? body.files.map((f) => f.name) : rootJsFiles(dir), body.main);
        mainPath = resolveInside(dir, main);
        if (!fs.existsSync(mainPath) || !fs.statSync(mainPath).isFile()) throw new InputError(`Soubor "${main}" neexistuje`);
      } catch (error) {
        if (cleanupDir) fs.rmSync(cleanupDir, { recursive: true, force: true });
        throw error;
      }
      const port = await findFreePort();

      output.clear();
      const proc = {
        id: `p-${++counter}`,
        status: 'running',
        listening: false,
        port,
        host: '127.0.0.1',
        url: `http://127.0.0.1:${port}`,
        main,
        startedAt: new Date().toISOString(),
        exitCode: null,
        signal: null,
        pid: null,
        cleanupDir,
        stopReason: null,
        waiters: new Set(),
        exited: null,
        notify() {
          for (const resolve of proc.waiters) resolve();
          proc.waiters.clear();
        },
      };
      current = proc;

      const child = spawn(process.execPath, [mainPath], {
        cwd: dir,
        env: { ...baseEnv(), NODE_ENV: 'development', ...env, PORT: String(port) },
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      proc.pid = child.pid ?? null;
      if (proc.pid) liveGroups.add(proc.pid);

      for (const stream of ['stdout', 'stderr']) {
        child[stream].setEncoding('utf8');
        child[stream].on('data', (text) => {
          if (current === proc) output.push(stream, text);
        });
      }

      proc.exited = new Promise((resolve) => {
        let finished = false;
        const finish = (code, signal) => {
          if (finished) return;
          finished = true;
          proc.status = 'exited';
          proc.listening = false;
          proc.exitCode = code;
          proc.signal = signal;
          if (current === proc) {
            if (proc.stopReason) output.push('system', proc.stopReason);
            else if (signal) output.push('system', `Proces ukončil signál ${signal}.`);
            else output.push('system', `Proces skončil s kódem ${code}.`);
          }
          if (proc.pid) {
            signalGroup(proc.pid, 'SIGKILL');
            liveGroups.delete(proc.pid);
          }
          if (proc.cleanupDir) fs.rm(proc.cleanupDir, { recursive: true, force: true, maxRetries: 3 }, () => {});
          if (current === proc) {
            clearTimeout(idleTimer);
            idleTimer = null;
          }
          proc.notify();
          resolve();
        };
        child.on('error', (error) => {
          if (current === proc) output.push('stderr', `Proces nejde spustit: ${error.message}`);
          finish(null, null);
        });
        child.on('close', (code, signal) => finish(code, signal));
        child.on('exit', (code, signal) => setTimeout(() => finish(code, signal), 200));
      });

      touch();
      watchListening(proc);

      const deadline = Date.now() + config.startWaitMs;
      while (proc.status === 'running' && !proc.listening && Date.now() < deadline) {
        await Promise.race([
          new Promise((resolve) => proc.waiters.add(resolve)),
          sleep(Math.min(POLL_MS, Math.max(0, deadline - Date.now()))),
        ]);
      }
      if (proc.status === 'exited') await proc.exited;
      touch();
      return publicProcess(proc);
    });
  }

  async function stopProcess(proc, reason) {
    if (!proc || proc.status !== 'running') return false;
    proc.stopReason = reason ?? 'Proces zastaven.';
    if (!proc.pid) {
      await proc.exited;
      return true;
    }
    signalGroup(proc.pid, 'SIGTERM');
    const deadline = Date.now() + config.killGraceMs;
    while (Date.now() < deadline && groupAlive(proc.pid)) await sleep(POLL_MS);
    if (groupAlive(proc.pid)) signalGroup(proc.pid, 'SIGKILL');
    const killDeadline = Date.now() + 2000;
    while (Date.now() < killDeadline && groupAlive(proc.pid)) await sleep(10);
    await proc.exited;
    return true;
  }

  function stop() {
    return serialize(async () => {
      const stopped = await stopProcess(current, null);
      touch();
      return stopped;
    });
  }

  async function request(body = {}) {
    const method = typeof body.method === 'string' ? body.method.toUpperCase() : body.method === undefined ? 'GET' : null;
    if (!HTTP_METHODS.includes(method)) throw new InputError(`"method" musí být jedno z: ${HTTP_METHODS.join(', ')}`);
    const requestPath = body.path === undefined ? '/' : body.path;
    if (typeof requestPath !== 'string' || !requestPath.startsWith('/') || requestPath.startsWith('//') || /[\s\0]/.test(requestPath)) {
      throw new InputError('"path" musí začínat lomítkem, bez mezer (např. /api/notes?limit=5), ne celá adresa');
    }
    const headers = body.headers ?? {};
    if (typeof headers !== 'object' || Array.isArray(headers) || !Object.values(headers).every((v) => typeof v === 'string')) {
      throw new InputError('"headers" musí být objekt { "jméno": "hodnota" } s textovými hodnotami');
    }
    if (body.body !== undefined && body.body !== null && typeof body.body !== 'string') {
      throw new InputError('"body" musí být text (JSON pošli jako řetězec)');
    }
    const timeoutMs = clampRequestTimeout(body.timeoutMs);

    const proc = current;
    if (proc?.status !== 'running') throw new HttpError(409, 'Proces neběží — nejdřív ho spusť tlačítkem Spustit.');
    touch();

    const payload = body.body ? Buffer.from(body.body, 'utf8') : null;
    const outgoing = {};
    for (const [name, value] of Object.entries(headers)) {
      const lower = name.toLowerCase();
      if (lower === 'host' || lower === 'content-length') continue;
      outgoing[name] = value;
    }
    outgoing.host = `${proc.host === '::1' ? '[::1]' : '127.0.0.1'}:${proc.port}`;
    if (payload) outgoing['content-length'] = String(payload.length);

    const started = performance.now();
    const elapsed = () => Math.round(performance.now() - started);

    return new Promise((resolve) => {
      let settled = false;
      let timer = null;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      };
      const fail = (error) =>
        finish({ ok: false, error: describeRequestError(error, { port: proc.port, timeoutMs }), code: error.code ?? 'ERROR', durationMs: elapsed() });

      let req;
      try {
        req = http.request({ host: proc.host, port: proc.port, method, path: requestPath, headers: outgoing });
      } catch (error) {
        finish({ ok: false, error: describeRequestError(error, { port: proc.port, timeoutMs }), code: error.code ?? 'ERROR', durationMs: elapsed() });
        return;
      }
      timer = setTimeout(() => {
        const error = Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' });
        fail(error);
        req.destroy();
      }, timeoutMs);

      req.on('error', fail);
      req.on('response', (res) => {
        const parts = [];
        let size = 0;
        let bodyTruncated = false;
        const done = () => {
          let buffer = Buffer.concat(parts);
          if (buffer.length > config.maxBodyBytes) {
            buffer = buffer.subarray(0, config.maxBodyBytes);
            bodyTruncated = true;
          }
          const headersOut = responseHeaders(res);
          finish({
            ok: true,
            status: res.statusCode,
            statusText: res.statusMessage || http.STATUS_CODES[res.statusCode] || '',
            headers: headersOut,
            ...encodeBody(buffer, headersOut['content-type']),
            bodyTruncated,
            durationMs: elapsed(),
          });
        };
        res.on('data', (part) => {
          if (bodyTruncated) return;
          parts.push(part);
          size += part.length;
          if (size > config.maxBodyBytes) {
            bodyTruncated = true;
            done();
            res.destroy();
          }
        });
        res.on('end', done);
        res.on('aborted', done);
        res.on('error', () => done());
      });
      req.end(payload ?? undefined);
    });
  }

  function clampRequestTimeout(value) {
    if (value === undefined || value === null) return config.requestTimeoutMs;
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw new InputError('"timeoutMs" musí být kladné číslo');
    return Math.min(Math.max(Math.round(value), 100), config.maxRequestTimeoutMs);
  }

  function getOutput(since = 0) {
    return { process: publicProcess(), ...output.since(since) };
  }

  function close() {
    closed = true;
    clearTimeout(idleTimer);
    idleTimer = null;
    const proc = current;
    if (proc?.status === 'running') {
      proc.stopReason = 'Server Akademie skončil, proces je zastavený.';
      if (proc.pid) {
        signalGroup(proc.pid, 'SIGKILL');
        liveGroups.delete(proc.pid);
      }
    }
    if (proc?.cleanupDir) fs.rmSync(proc.cleanupDir, { recursive: true, force: true });
  }

  return {
    start,
    stop,
    request,
    output: getOutput,
    process: () => publicProcess(),
    close,
    pid: () => current?.pid ?? null,
  };
}
