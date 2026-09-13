// Pomocné funkce pro HTTP: JSON odpovědi a těla, ochrana lokálních požadavků, limity.
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

/** Přečte tělo požadavku jako JSON objekt (prázdné tělo = {}). Chyby jsou HttpError 400/413. */
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

/** Hostitel bez portu z hlavičky Host nebo z URL v Origin. */
function hostnameOf(value) {
  try {
    return new URL(value.includes('://') ? value : `http://${value}`).hostname;
  } catch {
    return null;
  }
}

/**
 * Ochrana API proti cizím stránkám otevřeným v prohlížeči: server umí spouštět kód,
 * takže přijímá jen požadavky na lokální adresu (proti DNS rebindingu) a měnící
 * požadavky jen z lokálních stránek (proti CSRF).
 */
export function checkLocalRequest(req) {
  const host = req.headers.host;
  if (host && !LOOPBACK_HOSTS.has(hostnameOf(host))) {
    throw new HttpError(403, 'Server přijímá jen požadavky na localhost');
  }
  const origin = req.headers.origin;
  if (req.method !== 'GET' && req.method !== 'HEAD' && origin && !LOOPBACK_HOSTS.has(hostnameOf(origin))) {
    throw new HttpError(403, 'Požadavek z cizí stránky je zakázaný');
  }
}

/** Omezí počet současně běžících úloh, ať pár požadavků nezahltí počítač. */
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

/**
 * AbortSignal, který se zruší, když klient zavře spojení dřív, než dostal odpověď
 * (uživatel mezitím odešel z obrazovky). Běžící práci pak nemá smysl dál dělat.
 */
export function abortOnDisconnect(res) {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });
  return controller.signal;
}

/** Ověří `timeoutMs` z požadavku a omezí ho na rozsah 100…max. */
export function clampTimeout(value, fallback, max) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new HttpError(400, '"timeoutMs" musí být kladné číslo');
  }
  return Math.min(Math.max(Math.round(value), 100), max);
}

/** Převede výjimku na HTTP stav a českou zprávu. */
export function describeError(err) {
  if (err instanceof HttpError) return { status: err.status, message: err.message };
  if (err instanceof InputError) return { status: 400, message: err.message };
  if (err instanceof ParseError) return { status: 500, message: `Chyba v obsahu kurzu: ${err.message}` };
  return { status: 500, message: `Chyba serveru: ${err?.message ?? err}` };
}
