// Malý statický server pro testy runneru: servíruje sestavený klient a /vendor.
// Rozhraním odpovídá createApp ze server/app.js (vrací http.Server, neposlouchá),
// takže ho testy verify můžou použít místo skutečného serveru.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { PROJECT_ROOT } from './build-runner.js';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const VUE_FILE = path.join(PROJECT_ROOT, 'node_modules', 'vue', 'dist', 'vue.esm-browser.js');

/**
 * @param {{ distDir: string, api?: (req, res, body: any, url: URL) => boolean|Promise<boolean> }} options
 *   api: obsluha /api/* (body = naparsovaný JSON nebo null) — vrátí true, když požadavek vyřídila
 */
export function createStaticApp({ distDir, api = null }) {
  const root = path.resolve(distDir);

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname.startsWith('/api/')) {
      const body = await readJson(req);
      if (api && (await api(req, res, body, url))) return;
      return sendJson(res, 404, { error: 'Neznámá cesta API' });
    }

    if (url.pathname === '/vendor/vue.esm-browser.js') {
      res.writeHead(200, { 'content-type': TYPES['.js'], 'access-control-allow-origin': '*' });
      return fs.createReadStream(VUE_FILE).pipe(res);
    }

    const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return sendJson(res, 404, { error: 'Soubor neexistuje' });
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

export function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': TYPES['.json'] });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}
