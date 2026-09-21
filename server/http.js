import { ParseError } from '../shared/parse.js';
import { HttpError, InputError } from './errors.js';

export const MAX_BODY_BYTES = 5 * 1024 * 1024;
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function sendJson(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        reject(new HttpError(413, 'Tělo požadavku je příliš velké (limit 5 MB)'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      if (tooLarge) return;
      const text = Buffer.concat(chunks).toString('utf8').trim();
      if (!text) {
        resolve({});
        return;
      }
      try {
        const data = JSON.parse(text);
        if (data === null || typeof data !== 'object' || Array.isArray(data)) {
          reject(new HttpError(400, 'Tělo požadavku musí být JSON objekt'));
        } else {
          resolve(data);
        }
      } catch {
        reject(new HttpError(400, 'Neplatný JSON v těle požadavku'));
      }
    });
  });
}

function hostnameOf(value) {
  try {
    return new URL(value.includes('://') ? value : `http://${value}`).hostname;
  } catch {
    return null;
  }
}

export function checkLocalRequest(req, { remoteHosts = null } = {}) {
  const allowed = (name) => LOOPBACK_HOSTS.has(name) || Boolean(remoteHosts?.has(name));
  const host = req.headers.host;
  if (host && !allowed(hostnameOf(host))) {
    throw new HttpError(403, 'Server přijímá jen požadavky na localhost');
  }
  const origin = req.headers.origin;
  if (req.method !== 'GET' && req.method !== 'HEAD' && origin && !allowed(hostnameOf(origin))) {
    throw new HttpError(403, 'Požadavek z cizí stránky je zakázaný');
  }
}

export const isLoopbackHost = (hostHeader) => !hostHeader || LOOPBACK_HOSTS.has(hostnameOf(hostHeader));

export function createLimiter(limit) {
  let running = 0;
  const queue = [];
  const next = () => {
    if (running >= limit || queue.length === 0) return;
    running++;
    const { task, resolve, reject } = queue.shift();
    task().then(resolve, reject).finally(() => {
      running--;
      next();
    });
  };
  return (task) => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    next();
  });
}

export function abortOnDisconnect(res) {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });
  return controller.signal;
}

export function clampTimeout(value, fallback, max) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new HttpError(400, '"timeoutMs" musí být kladné číslo');
  }
  return Math.min(Math.max(Math.round(value), 100), max);
}

export function describeError(err) {
  if (err instanceof HttpError) return { status: err.status, message: err.message };
  if (err instanceof InputError) return { status: 400, message: err.message };
  if (err instanceof ParseError) return { status: 500, message: `Chyba v obsahu kurzu: ${err.message}` };
  return { status: 500, message: `Chyba serveru: ${err?.message ?? err}` };
}
