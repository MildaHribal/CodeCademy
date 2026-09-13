// HTTP server Akademie bez frameworku (kontrakt kap. 7–9).
//
// createApp() vrací http.Server, který ještě neposlouchá — spouští ho server/index.js,
// testy i verify, každý na svém portu.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream';
import { loadCurriculum, loadModule, readTextTree } from '../shared/content.js';
import { ParseError } from '../shared/parse.js';
import { InputError } from './errors.js';
import { runNodeFile, runNodeTests } from './node-runner.js';
import { createProgressStore } from './progress.js';

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VUE_DIST = path.join(import.meta.dirname, '..', 'node_modules', 'vue', 'dist');
// Jediné soubory, které /vendor vydá.
const VENDOR_FILES = {
  'vue.esm-browser.js': path.join(VUE_DIST, 'vue.esm-browser.js'),
  'vue.esm-browser.prod.js': path.join(VUE_DIST, 'vue.esm-browser.prod.js'),
};
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
};

/** Chyba s HTTP stavem; zpráva jde uživateli, proto česky. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Odpovědi a čtení požadavku
// ---------------------------------------------------------------------------

function sendJson(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function readJsonBody(req) {
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
function checkLocalRequest(req) {
  const host = req.headers.host;
  if (host && !LOOPBACK_HOSTS.has(hostnameOf(host))) {
    throw new HttpError(403, 'Server přijímá jen požadavky na localhost');
  }
  const origin = req.headers.origin;
  if (req.method !== 'GET' && req.method !== 'HEAD' && origin && !LOOPBACK_HOSTS.has(hostnameOf(origin))) {
    throw new HttpError(403, 'Požadavek z cizí stránky je zakázaný');
  }
}

// ---------------------------------------------------------------------------
// Pomocné funkce pro routy
// ---------------------------------------------------------------------------

function checkSlugs(section, module) {
  if (!SLUG.test(section) || !SLUG.test(module)) {
    throw new HttpError(400, 'Neplatná sekce nebo modul (povolená jsou malá písmena, číslice a pomlčky)');
  }
}

/** Omezí počet současně běžících node úloh, ať pár požadavků nezahltí počítač. */
function createLimiter(limit) {
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
 * (uživatel mezitím odešel z obrazovky). Testy pro něj pak nemá smysl dál pouštět.
 */
function abortOnDisconnect(res) {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });
  return controller.signal;
}

function clampTimeout(value, fallback, max) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new HttpError(400, '"timeoutMs" musí být kladné číslo');
  }
  return Math.min(Math.max(Math.round(value), 100), max);
}

// ---------------------------------------------------------------------------
// Aplikace
// ---------------------------------------------------------------------------

/**
 * @param {{ contentDir: string, dataDir: string, projectsDir: string, distDir: string }} options
 * @returns {http.Server} server, který ještě neposlouchá
 */
export function createApp({ contentDir, dataDir, projectsDir, distDir }) {
  const progress = createProgressStore(dataDir);
  const limitRuns = createLimiter(Math.max(2, Math.floor(os.availableParallelism() / 2)));
  const projectsRoot = path.resolve(projectsDir);

  function moduleExists(section, module) {
    return fs.existsSync(path.join(contentDir, section, module, 'module.json'));
  }

  /** Načte modul typu projekt, jinak vyhodí 404/400. */
  function loadProject(section, module) {
    checkSlugs(section, module);
    if (!moduleExists(section, module)) throw new HttpError(404, `Modul ${section}/${module} neexistuje`);
    const data = loadModule(contentDir, section, module, { includeSolutions: false });
    if (data.type !== 'project') throw new HttpError(400, `Modul ${section}/${module} není projekt`);
    return data;
  }

  function projectDir(section, module) {
    const dir = path.resolve(projectsRoot, `${section}--${module}`);
    // Slugy cestu ven z adresáře nepustí, ale kontrola navíc nic nestojí.
    if (path.dirname(dir) !== projectsRoot) throw new HttpError(400, 'Neplatná cesta projektu');
    return dir;
  }

  // Tabulka rout: [metoda, vzor cesty, obsluha(požadavek, parametry z cesty, url, odpověď)].
  const routes = [
    ['GET', /^\/api\/curriculum$/, () => loadCurriculum(contentDir)],

    ['GET', /^\/api\/module\/([^/]+)\/([^/]+)$/, (req, [section, module], url) => {
      checkSlugs(section, module);
      if (!moduleExists(section, module)) throw new HttpError(404, `Modul ${section}/${module} neexistuje`);
      const includeSolutions = url.searchParams.get('solution') === '1';
      return loadModule(contentDir, section, module, { includeSolutions });
    }],

    ['GET', /^\/api\/progress$/, () => progress.get()],

    ['PUT', /^\/api\/progress\/code$/, async (req) => {
      const { id, files } = await readJsonBody(req);
      progress.saveCode(id, files);
      return { ok: true };
    }],

    ['POST', /^\/api\/progress\/complete$/, async (req) => {
      const { id, score } = await readJsonBody(req);
      return { ok: true, progress: progress.complete(id, score) };
    }],

    ['POST', /^\/api\/progress\/reset$/, async (req) => {
      const { id } = await readJsonBody(req);
      return { ok: true, progress: progress.reset(id) };
    }],

    ['POST', /^\/api\/run-node$/, async (req, params, url, res) => {
      const body = await readJsonBody(req);
      if (body.runtime !== undefined && body.runtime !== 'node') {
        throw new HttpError(400, `Server spouští jen runtime node, ne "${body.runtime}"`);
      }
      const timeoutMs = clampTimeout(body.timeoutMs, 10000, 60000);
      // `cwd` z požadavku se schválně nepoužívá — z API se běží jen v dočasném adresáři.
      const signal = abortOnDisconnect(res);
      return limitRuns(() => runNodeTests({ files: body.files, hints: body.hints, timeoutMs, signal }));
    }],

    ['POST', /^\/api\/run-node-file$/, async (req) => {
      const body = await readJsonBody(req);
      const timeoutMs = clampTimeout(body.timeoutMs, 5000, 30000);
      return limitRuns(() => runNodeFile({ files: body.files, main: body.main, timeoutMs }));
    }],

    ['POST', /^\/api\/project\/([^/]+)\/([^/]+)\/start$/, async (req, [section, module]) => {
      loadProject(section, module);
      const dir = projectDir(section, module);
      const isEmpty = !fs.existsSync(dir) || fs.readdirSync(dir).length === 0;
      if (!isEmpty) return { dir, created: false };
      const starter = path.join(contentDir, section, module, 'starter');
      await fsp.mkdir(dir, { recursive: true });
      if (fs.existsSync(starter)) await fsp.cp(starter, dir, { recursive: true, force: false, errorOnExist: false });
      return { dir, created: true };
    }],

    ['GET', /^\/api\/project\/([^/]+)\/([^/]+)\/files$/, (req, [section, module]) => {
      loadProject(section, module);
      const dir = projectDir(section, module);
      const exists = fs.existsSync(dir);
      return { dir, exists, files: exists ? readTextTree(dir) : [] };
    }],

    ['POST', /^\/api\/project\/([^/]+)\/([^/]+)\/check$/, async (req, [section, module], url, res) => {
      const { project } = loadProject(section, module);
      if (project.runtime !== 'node') {
        throw new HttpError(400, `Projekt s runtime ${project.runtime} se kontroluje v prohlížeči nad soubory z …/files`);
      }
      const dir = projectDir(section, module);
      if (!fs.existsSync(dir)) throw new HttpError(409, 'Projekt ještě nezačal — nejdřív klikni na „Začít projekt"');
      const timeoutMs = typeof project.meta?.timeoutMs === 'number' ? project.meta.timeoutMs : 10000;
      const signal = abortOnDisconnect(res);
      return limitRuns(() => runNodeTests({ hints: project.hints, timeoutMs, cwd: dir, signal }));
    }],
  ];

  async function handleApi(req, res, url) {
    checkLocalRequest(req);
    const matching = routes
      .map(([method, pattern, handler]) => ({ method, handler, match: url.pathname.match(pattern) }))
      .filter((route) => route.match);
    if (matching.length === 0) throw new HttpError(404, `Neznámá adresa API: ${url.pathname}`);
    const route = matching.find((r) => r.method === req.method);
    if (!route) {
      throw new HttpError(405, `Metoda ${req.method} tu není povolená (povolené: ${matching.map((r) => r.method).join(', ')})`);
    }
    let params;
    try {
      params = route.match.slice(1).map((part) => decodeURIComponent(part));
    } catch {
      throw new HttpError(400, 'Neplatná adresa');
    }
    const data = await route.handler(req, params, url, res);
    sendJson(res, 200, data);
  }

  function serveVendor(req, res, url) {
    const cors = { 'Access-Control-Allow-Origin': '*' };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { ...cors, 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS' });
      res.end();
      return;
    }
    const file = VENDOR_FILES[url.pathname.slice('/vendor/'.length)];
    if (!file || !fs.existsSync(file)) {
      sendJson(res, 404, { error: 'Soubor ve /vendor neexistuje' }, cors);
      return;
    }
    sendFile(req, res, file, cors);
  }

  function sendFile(req, res, file, headers = {}) {
    // Soubor otevřeme hned a synchronně. Když mezitím zmizel (třeba zrovna běží
    // `vite build`) nebo nejde číst, skončí to chybovou odpovědí, ne pádem serveru
    // na nezachycené chybě proudu.
    let fd;
    try {
      fd = fs.openSync(file, 'r');
    } catch (err) {
      if (err.code === 'ENOENT') throw new HttpError(404, 'Soubor neexistuje');
      throw err;
    }
    let size;
    try {
      size = fs.fstatSync(fd).size;
    } catch (err) {
      fs.closeSync(fd);
      throw err;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': size,
      'Cache-Control': 'no-cache',
      ...headers,
    });
    if (req.method === 'HEAD') {
      fs.closeSync(fd);
      res.end();
      return;
    }
    // pipeline (na rozdíl od .pipe) chyby čtení zachytí; hlavička už odešla, zbývá zavřít spojení.
    pipeline(fs.createReadStream(null, { fd }), res, (err) => {
      if (err) res.destroy();
    });
  }

  function serveStatic(req, res, url) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      throw new HttpError(405, 'Statické soubory jdou jen číst (GET)');
    }
    const root = path.resolve(distDir);
    let relative;
    try {
      relative = decodeURIComponent(url.pathname);
    } catch {
      throw new HttpError(400, 'Neplatná adresa');
    }
    const target = path.resolve(root, `.${relative}`);
    const inside = target === root || target.startsWith(root + path.sep);
    if (inside && relative.includes('\0') === false && fs.existsSync(target) && fs.statSync(target).isFile()) {
      sendFile(req, res, target);
      return;
    }
    // SPA: cesty bez přípony dostanou index.html, o zbytek se postará router klienta.
    const indexFile = path.join(root, 'index.html');
    if (path.extname(relative) === '' && fs.existsSync(indexFile)) {
      sendFile(req, res, indexFile);
      return;
    }
    if (!fs.existsSync(indexFile)) {
      throw new HttpError(404, 'Klient není sestavený — spusť ./start.sh nebo npx vite build');
    }
    throw new HttpError(404, `Soubor ${relative} neexistuje`);
  }

  async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) await handleApi(req, res, url);
      else if (url.pathname.startsWith('/vendor/')) serveVendor(req, res, url);
      else serveStatic(req, res, url);
    } catch (err) {
      if (res.headersSent) {
        res.destroy(err);
        return;
      }
      const { status, message } = describeError(err);
      if (status >= 500) console.error(err);
      // U příliš velkého těla nečteme zbytek a spojení zavřeme.
      const headers = status === 413 ? { Connection: 'close' } : {};
      sendJson(res, status, { error: message }, headers);
    }
  }

  return http.createServer((req, res) => {
    handle(req, res);
  });
}

function describeError(err) {
  if (err instanceof HttpError) return { status: err.status, message: err.message };
  if (err instanceof InputError) return { status: 400, message: err.message };
  if (err instanceof ParseError) return { status: 500, message: `Chyba v obsahu kurzu: ${err.message}` };
  return { status: 500, message: `Chyba serveru: ${err?.message ?? err}` };
}
