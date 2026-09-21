// Vzdálený přístup (telefon): server umí spouštět kód, takže mimo localhost pustí jen
// zařízení, které se prokáže párovacím tokenem. Token se předá jednou v adrese
// (?token=…, typicky z QR kódu), server ho uloží do HttpOnly cookie a adresu vyčistí.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isLoopbackHost } from './http.js';

const COOKIE = 'akademie_token';
const YEAR = 60 * 60 * 24 * 365;

export function loadRemoteToken(dataDir) {
  const file = path.join(dataDir, 'remote-token.txt');
  try {
    const saved = fs.readFileSync(file, 'utf8').trim();
    if (/^[0-9a-f]{32,}$/.test(saved)) return saved;
  } catch {}
  const token = crypto.randomBytes(24).toString('hex');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, `${token}\n`, { mode: 0o600 });
  return token;
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function cookieToken(req) {
  for (const part of String(req.headers.cookie ?? '').split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) return rest.join('=');
  }
  return null;
}

const DENIED_PAGE = `<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Spáruj zařízení</title><body style="font-family:system-ui;background:#090b10;color:#f2f0ea;display:grid;place-items:center;min-height:100dvh;margin:0;padding:24px;text-align:center">
<div><h1 style="font-size:22px">Tohle zařízení není spárované</h1>
<p style="color:#a9aebb;max-width:32ch">Na počítači otevři aplikaci, klikni v Kovárně na „Phone" a naskenuj QR kód.</p></div></body></html>`;

/**
 * Vrací true, když je požadavek vyřízený (odmítnutý nebo přesměrovaný) a dál se nemá zpracovat.
 * Požadavky na localhost projdou beze změny.
 */
export function guardRemote(req, res, url, remote) {
  if (isLoopbackHost(req.headers.host)) return false;
  if (!remote?.token) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Vzdálený přístup není zapnutý.');
    return true;
  }
  const fromQuery = url.searchParams.get('token');
  if (fromQuery && safeEqual(fromQuery, remote.token)) {
    url.searchParams.delete('token');
    const clean = url.pathname + (url.searchParams.size ? `?${url.searchParams}` : '');
    res.writeHead(302, {
      Location: clean || '/',
      'Set-Cookie': `${COOKIE}=${remote.token}; Path=/; Max-Age=${YEAR}; HttpOnly; SameSite=Lax`,
      'Cache-Control': 'no-store',
    });
    res.end();
    return true;
  }
  if (safeEqual(cookieToken(req), remote.token)) return false;
  res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(DENIED_PAGE);
  return true;
}
