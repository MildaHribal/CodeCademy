import fs from 'node:fs';
import path from 'node:path';
import { ensureVendor, isVendorFresh, NODE_MODULES, VENDOR_DIR } from '../../tools/build-vendor.js';
import { RAW_ROOTS, VENDOR_PATH } from '../../client/src/runner/vendor-libs.js';

const TYPES = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
};
const MAX_DEPTH = 10;
export const VENDOR_HEADERS = { 'Access-Control-Allow-Origin': '*', 'Cross-Origin-Resource-Policy': 'cross-origin' };

function inside(root, target) {
  return target === root || target.startsWith(root + path.sep);
}

function existingFile(file) {
  try {
    return fs.statSync(file).isFile() ? file : null;
  } catch {
    return null;
  }
}

export async function resolveVendorFile(relative) {
  let decoded;
  try {
    decoded = decodeURIComponent(String(relative));
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;
  const [kind, ...rest] = decoded.split('/');
  if (rest.some((segment) => segment === '..' || segment === '')) return null;

  if (kind === 'bundle' && rest.length === 1 && TYPES[path.extname(rest[0])]) {
    if (!isVendorFresh()) await ensureVendor();
    const root = path.join(VENDOR_DIR, 'bundle');
    const file = path.resolve(root, rest[0]);
    return inside(root, file) ? existingFile(file) : null;
  }
  if (kind === 'raw' && rest.length >= 2 && Object.hasOwn(RAW_ROOTS, rest[0])) {
    const root = path.join(NODE_MODULES, RAW_ROOTS[rest[0]]);
    const file = path.resolve(root, rest.slice(1).join('/'));
    if (!inside(root, file) || !TYPES[path.extname(file)]) return null;
    return existingFile(file);
  }
  return null;
}

export function sendVendorFile(req, res, file) {
  const stat = fs.statSync(file);
  const etag = `"${stat.size.toString(36)}-${Math.floor(stat.mtimeMs).toString(36)}"`;
  const headers = {
    ...VENDOR_HEADERS,
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
    ETag: etag,
  };
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  res.writeHead(200, { ...headers, 'Content-Length': stat.size });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = fs.createReadStream(file);
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}

export async function handleVendorRequest(req, res, url) {
  const prefix = `${VENDOR_PATH}/`;
  if (!url.pathname.startsWith(prefix)) return false;
  const file = await resolveVendorFile(url.pathname.slice(prefix.length));
  if (!file) {
    const body = JSON.stringify({ error: 'Knihovna ve /api/vendor neexistuje' });
    res.writeHead(404, { ...VENDOR_HEADERS, 'Content-Type': TYPES['.json'], 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
    return true;
  }
  sendVendorFile(req, res, file);
  return true;
}

export function register(router) {
  const handler = async ({ req, res, url }) => {
    await handleVendorRequest(req, res, url);
  };
  for (let depth = 1; depth <= MAX_DEPTH; depth++) {
    const params = Array.from({ length: depth }, (_, index) => `:p${index}`).join('/');
    router.get(`${VENDOR_PATH}/${params}`, handler);
  }
}
