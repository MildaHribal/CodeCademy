// HTTP server Akademie bez frameworku (kontrakt kap. 7–9).
//
// createApp() vrací http.Server, který ještě neposlouchá — spouští ho server/index.js,
// testy i verify, každý na svém portu.
//
// Routy API nejsou tady: každý nástroj má svůj soubor server/routes/<nástroj>.js
// s funkcí register(router, ctx) a server/routes/index.js je načte automaticky.
// Tady zůstává jen jádro: ochrana požadavků, /vendor, statické soubory a chyby.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pipeline } from 'node:stream';
import { createContext } from './context.js';
import { HttpError } from './errors.js';
import { checkLocalRequest, describeError, sendJson } from './http.js';
import { createRequestContext, createRouter } from './router.js';
import { registerRouteModules, routeModules } from './routes/index.js';

const VUE_DIST = path.join(import.meta.dirname, '..', 'node_modules', 'vue', 'dist');
// Jediné soubory, které /vendor vydá.
const VENDOR_FILES = {
  'vue.esm-browser.js': path.join(VUE_DIST, 'vue.esm-browser.js'),
  'vue.esm-browser.prod.js': path.join(VUE_DIST, 'vue.esm-browser.prod.js'),
};

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

/**
 * @param {{ contentDir: string, dataDir: string, projectsDir: string, distDir: string,
 *   routes?: { name: string, register: Function }[] }} options
 *   routes — moduly rout (výchozí: všechny ze server/routes/); testy si můžou přidat vlastní
 * @returns {http.Server} server, který ještě neposlouchá
 */
export function createApp({ contentDir, dataDir, projectsDir, distDir, routes = routeModules }) {
  const ctx = createContext({ contentDir, dataDir, projectsDir, distDir });
  const router = createRouter();
  registerRouteModules(router, routes, ctx);

  async function handleApi(req, res, url) {
    checkLocalRequest(req);
    const { handler, params } = router.match(req.method, url.pathname);
    const data = await handler(createRequestContext(req, res, url, params));
    if (res.headersSent || res.writableEnded) return; // obsluha odpověděla sama
    sendJson(res, 200, data === undefined ? { ok: true } : data);
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

  const server = http.createServer((req, res) => {
    handle(req, res);
  });
  server.on('close', () => {
    ctx.runClosers();
    ctx.progress.flush();
  });
  // Pro testy a nástroje: seznam rout a kontext (úložiště, flush).
  server.akademie = { ctx, routes: router.list() };
  return server;
}
