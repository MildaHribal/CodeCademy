import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../app.js';
import { registerDevProcess } from './dev-process.js';
import { routeModules } from './index.js';

const contentDir = path.join(import.meta.dirname, '..', 'test-fixtures', 'content');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

describe('routy /api/dev-process', () => {
  let root;
  let server;
  let baseUrl;
  let manager;

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-dev-process-routes-'));
    const devRoutes = {
      name: 'dev-process.js',
      register(router, ctx) {
        manager = registerDevProcess(router, ctx, { idleMs: 1500, startWaitMs: 3000, tempPrefix: 'akademie-dev-routes-' });
      },
    };
    server = createApp({
      contentDir,
      dataDir: path.join(root, 'data'),
      projectsDir: path.join(root, 'moje-projekty'),
      distDir: path.join(root, 'dist'),
      routes: [...routeModules.filter((m) => m.name !== 'dev-process.js'), devRoutes],
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    if (server.listening) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(root, { recursive: true, force: true });
  });

  async function call(method, url, body, headers = {}) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  const serverFiles = [
    {
      name: 'server.js',
      content: `import { createServer } from 'node:http';
createServer((req, res) => {
  res.writeHead(req.method === 'POST' ? 201 : 200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ method: req.method, url: req.url }));
}).listen(Number(process.env.PORT), () => console.log('poslouchám'));`,
    },
    { name: 'package.json', content: '{ "type": "module" }' },
  ];

  test('bez procesu: GET vrací null, request 409, stop nic nezastaví', async () => {
    assert.deepEqual(await call('GET', '/api/dev-process'), { status: 200, data: { process: null } });
    assert.deepEqual(await call('GET', '/api/dev-process/output'), {
      status: 200, data: { process: null, next: 0, truncated: false, chunks: [] },
    });
    const request = await call('POST', '/api/dev-process/request', { method: 'GET', path: '/' });
    assert.equal(request.status, 409);
    assert.match(request.data.error, /neběží/);
    assert.deepEqual(await call('POST', '/api/dev-process/stop', {}), { status: 200, data: { ok: true, stopped: false } });
  });

  test('start se files → výstup se since → request → stop', async () => {
    const started = await call('POST', '/api/dev-process/start', { files: serverFiles, main: 'server.js', env: { API_KEY: 'x' } });
    assert.equal(started.status, 200);
    assert.equal(started.data.ok, true);
    const proc = started.data.process;
    assert.deepEqual(Object.keys(proc).sort(), ['exitCode', 'id', 'listening', 'main', 'port', 'signal', 'startedAt', 'status', 'url'].sort());
    assert.equal(proc.status, 'running');
    assert.equal(proc.listening, true);

    assert.deepEqual((await call('GET', '/api/dev-process')).data.process, proc);

    let output;
    for (let i = 0; i < 50; i++) {
      output = (await call('GET', '/api/dev-process/output?since=0')).data;
      if (output.chunks.some((c) => c.stream === 'stdout')) break;
      await sleep(30);
    }
    assert.ok(output.chunks.some((c) => c.stream === 'stdout' && c.text.includes('poslouchám')));
    assert.ok(output.chunks.every((c) => typeof c.seq === 'number' && typeof c.at === 'string'));
    const rest = (await call('GET', `/api/dev-process/output?since=${output.next}`)).data;
    assert.deepEqual(rest.chunks, []);
    assert.equal(rest.next, output.next);

    const post = await call('POST', '/api/dev-process/request', {
      method: 'POST', path: '/notes?limit=5', headers: { 'content-type': 'application/json' }, body: '{"text":"Ahoj"}', timeoutMs: 10000,
    });
    assert.equal(post.status, 200);
    assert.equal(post.data.ok, true);
    assert.equal(post.data.status, 201);
    assert.equal(post.data.statusText, 'Created');
    assert.equal(post.data.bodyEncoding, 'utf8');
    assert.deepEqual(JSON.parse(post.data.body), { method: 'POST', url: '/notes?limit=5' });

    const stopped = await call('POST', '/api/dev-process/stop', {});
    assert.deepEqual(stopped.data, { ok: true, stopped: true });
    const after = (await call('GET', '/api/dev-process')).data.process;
    assert.equal(after.status, 'exited');
    assert.equal(after.id, proc.id);
    assert.equal((await call('POST', '/api/dev-process/request', { path: '/' })).status, 409);
  });

  test('neplatné vstupy = 400', async () => {
    const bad = [
      ['POST', '/api/dev-process/start', {}],
      ['POST', '/api/dev-process/start', { files: serverFiles, project: { section: 'ukazka', module: 'projekt' } }],
      ['POST', '/api/dev-process/start', { files: 'x' }],
      ['POST', '/api/dev-process/start', { files: serverFiles, env: { 'bad-name': 'x' } }],
      ['POST', '/api/dev-process/start', { files: serverFiles, main: 'chybi.js' }],
      ['POST', '/api/dev-process/start', { project: { section: '../x', module: 'projekt' } }],
      ['POST', '/api/dev-process/start', { project: { section: 'ukazka', module: 'lekce' } }],
      ['POST', '/api/dev-process/start', { project: 'ukazka/projekt' }],
    ];
    for (const [method, url, body] of bad) {
      const res = await call(method, url, body);
      assert.equal(res.status, 400, `${url} ${JSON.stringify(body)} → ${JSON.stringify(res.data)}`);
      assert.equal(typeof res.data.error, 'string');
    }
    assert.equal((await call('GET', '/api/dev-process/output?since=-1')).status, 400);
    assert.equal((await call('GET', '/api/dev-process/output?since=abc')).status, 400);
    assert.equal((await call('POST', '/api/dev-process/start', { project: { section: 'ukazka', module: 'neni' } })).status, 404);
  });

  test('požadavek na neposlouchající proces: 200 s ok false', async () => {
    const files = [{ name: 'index.js', content: 'setInterval(() => {}, 1000);' }];
    const started = await call('POST', '/api/dev-process/start', { files });
    assert.equal(started.data.process.listening, false);
    const res = await call('POST', '/api/dev-process/request', { method: 'GET', path: '/' });
    assert.equal(res.status, 200);
    assert.equal(res.data.ok, false);
    assert.equal(res.data.code, 'ECONNREFUSED');
    assert.equal(typeof res.data.durationMs, 'number');
    await call('POST', '/api/dev-process/stop', {});
  });

  test('projekt: 409 před Začít projekt, pak běží v adresáři projektu', async () => {
    const before = await call('POST', '/api/dev-process/start', { project: { section: 'ukazka', module: 'projekt' } });
    assert.equal(before.status, 409);
    assert.match(before.data.error, /nezačal/);

    assert.equal((await call('POST', '/api/project/ukazka/projekt/start')).status, 200);
    const dir = fs.realpathSync(path.join(root, 'moje-projekty', 'ukazka--projekt'));
    fs.writeFileSync(path.join(dir, 'server.js'), `import http from 'node:http';
http.createServer((req, res) => res.end('Ahoj z projektu')).listen(process.env.PORT);`);
    fs.writeFileSync(path.join(dir, 'package.json'), '{ "type": "module" }');

    const started = await call('POST', '/api/dev-process/start', { project: { section: 'ukazka', module: 'projekt' } });
    assert.equal(started.status, 200);
    assert.equal(started.data.process.main, 'server.js');
    assert.equal(started.data.process.listening, true);
    const res = await call('POST', '/api/dev-process/request', { path: '/' });
    assert.equal(res.data.body, 'Ahoj z projektu');
    assert.equal(fs.readlinkSync(`/proc/${manager.pid()}/cwd`), dir);
    await call('POST', '/api/dev-process/stop', {});
    assert.ok(fs.existsSync(path.join(dir, 'server.js')), 'soubory projektu zůstávají');
  });

  test('nečinnost s krátkým limitem: output ji neprodlouží', async () => {
    const started = await call('POST', '/api/dev-process/start', { files: serverFiles, main: 'server.js' });
    const pid = manager.pid();
    assert.equal(started.data.process.status, 'running');
    for (let i = 0; i < 10; i++) {
      await call('GET', '/api/dev-process/output?since=0');
      await sleep(250);
    }
    const proc = (await call('GET', '/api/dev-process')).data.process;
    assert.equal(proc.status, 'exited');
    assert.equal(isAlive(pid), false);
    const { chunks } = (await call('GET', '/api/dev-process/output')).data;
    assert.match(chunks.at(-1).text, /^Zastaveno po 2 s nečinnosti\.$/);
  });

  test('cizí Origin je zakázaný (proces spouští kód)', async () => {
    const res = await call('POST', '/api/dev-process/start', { files: serverFiles }, { Origin: 'http://evil.example' });
    assert.equal(res.status, 403);
  });

  test('po server.close() nezůstane žádný proces', async () => {
    await call('POST', '/api/dev-process/start', { files: serverFiles, main: 'server.js' });
    const pid = manager.pid();
    assert.equal(isAlive(pid), true);
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    for (let i = 0; i < 40 && isAlive(pid); i++) await sleep(25);
    assert.equal(isAlive(pid), false);
    let found = '';
    try {
      found = execFileSync('pgrep', ['-f', 'akademie-dev-routes-'], { encoding: 'utf8' });
    } catch {
    }
    assert.equal(found.trim(), '');
  });
});
