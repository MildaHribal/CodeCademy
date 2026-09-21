import http from 'node:http';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createApp } from './app.js';
import { loadRemoteToken } from './remote.js';

const root = path.join(import.meta.dirname, '..');
const port = Number(process.env.PORT ?? 4300);
const host = '127.0.0.1';

// Vzdálený přístup pro telefon: AKADEMIE_REMOTE=tailscale (adresa z `tailscale ip`),
// nebo AKADEMIE_REMOTE=<IP adresa>. Bez proměnné server poslouchá jen na localhostu.
/** Druhý HTTP server se stejnou obsluhou požadavků jako hlavní. */
function createServerAlias(main) {
  const alias = http.createServer();
  for (const listener of main.listeners('request')) alias.on('request', listener);
  return alias;
}

function remoteAddress() {
  const wanted = process.env.AKADEMIE_REMOTE;
  if (!wanted) return null;
  if (wanted !== 'tailscale') return wanted;
  try {
    return execFileSync('tailscale', ['ip', '-4'], { encoding: 'utf8' }).split('\n')[0].trim() || null;
  } catch {
    console.error('AKADEMIE_REMOTE=tailscale, ale `tailscale ip -4` selhalo — vzdálený přístup je vypnutý.');
    return null;
  }
}

const dataDir = path.join(root, 'data');
const remoteHost = remoteAddress();
const remote = remoteHost ? { hosts: [remoteHost], token: loadRemoteToken(dataDir), port } : null;

const server = createApp({
  remote,
  contentDir: path.join(root, 'content'),
  dataDir,
  projectsDir: path.join(root, 'moje-projekty'),
  distDir: path.join(root, 'dist'),
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} je obsazený — běží už Akademie jinde? Zkus jiný: PORT=4301 node server/index.js`);
  } else {
    console.error('Server nejde spustit:', err.message);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Server Akademie poslouchá na http://${host}:${server.address().port}`);
});

// Druhé ucho jen na adrese pro telefon (ne na 0.0.0.0 — z veřejné Wi-Fi na něj nikdo nedosáhne).
if (remote) {
  const remoteServer = createServerAlias(server);
  remoteServer.on('error', (err) => console.error(`Vzdálený přístup na ${remoteHost}:${port} nejde zapnout: ${err.message}`));
  remoteServer.listen(port, remoteHost, () => {
    console.log(`Telefon: http://${remoteHost}:${port}/?token=${remote.token}`);
  });
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    server.close();
    process.exit(0);
  });
}
