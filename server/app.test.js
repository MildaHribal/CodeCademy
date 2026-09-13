import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { createApp } from './app.js';

const contentDir = path.join(import.meta.dirname, 'test-fixtures', 'content');

describe('HTTP API', () => {
  let root;
  let server;
  let baseUrl;
  let projectsDir;
  let dataDir;

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-app-test-'));
    dataDir = path.join(root, 'data');
    projectsDir = path.join(root, 'moje-projekty');
    const distDir = path.join(root, 'dist');
    fs.mkdirSync(path.join(distDir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(distDir, 'index.html'), '<!doctype html><title>Akademie</title>');
    fs.writeFileSync(path.join(distDir, 'assets', 'app.js'), 'console.log(1);');
    fs.writeFileSync(path.join(distDir, 'assets', 'app.css'), 'body {}');

    server = createApp({ contentDir, dataDir, projectsDir, distDir });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });

  async function api(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
    });
    const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
    return { status: res.status, data, headers: res.headers };
  }

  /** Požadavek přes http.request — kvůli syrové cestě a vlastním hlavičkám Host/Origin. */
  function rawRequest({ method = 'GET', path: requestPath, headers = {} }) {
    return new Promise((resolve, reject) => {
      const req = http.request(`${baseUrl}${requestPath}`, { method, headers }, (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { text += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, text, headers: res.headers }));
      });
      req.on('error', reject);
      req.end();
    });
  }

  test('GET /api/curriculum vrátí osnovu i s plánovanou sekcí', async () => {
    const { status, data } = await api('GET', '/api/curriculum');
    assert.equal(status, 200);
    const [section, planned] = data.parts[0].sections;
    assert.equal(section.available, true);
    assert.deepEqual(section.modules.map((m) => m.type), ['lesson', 'workshop', 'lab', 'quiz', 'project', 'project']);
    assert.equal(section.modules[1].stepCount, 2);
    assert.deepEqual(planned, { id: 'planovana', title: 'Plánovaná sekce', intro: 'Ještě bez obsahu.', available: false, modules: [] });
  });

  test('GET /api/module bez řešení a s řešením', async () => {
    const plain = await api('GET', '/api/module/ukazka/workshop');
    assert.equal(plain.status, 200);
    assert.equal(plain.data.steps.length, 2);
    assert.equal('solution' in plain.data.steps[0], false);
    assert.deepEqual(plain.data.steps[0].seed[0].region, { start: 1, end: 1 });

    const withSolution = await api('GET', '/api/module/ukazka/workshop?solution=1');
    assert.match(withSolution.data.steps[0].solution[0].content, /function add/);

    const project = await api('GET', '/api/module/ukazka/projekt');
    assert.equal('solution' in project.data.project, false);
    assert.equal(project.data.project.seed[0].name, 'server.js');

    const lesson = await api('GET', '/api/module/ukazka/lekce');
    assert.equal(lesson.data.lesson.blocks[1].kind, 'live');
    const quiz = await api('GET', '/api/module/ukazka/kviz');
    assert.equal(quiz.data.quiz.pass, 0.5);
  });

  test('neexistující, rozbitý a neplatný modul', async () => {
    const missing = await api('GET', '/api/module/ukazka/neni');
    assert.equal(missing.status, 404);
    assert.match(missing.data.error, /neexistuje/);

    const broken = await api('GET', '/api/module/ukazka/rozbity');
    assert.equal(broken.status, 500);
    assert.match(broken.data.error, /ukazka\/rozbity — prázdná lekce/);

    for (const bad of ['/api/module/Ukazka/lekce', '/api/module/..%2F..%2Fserver/app', '/api/module/ukazka/%E0%A4%A']) {
      const res = await rawRequest({ path: bad });
      assert.equal(res.status, 400, bad);
      assert.ok(JSON.parse(res.text).error);
    }
    // %2e%2e je pro URL totéž co „..", takže se cesta zkrátí a nenajde se žádná routa.
    assert.equal((await rawRequest({ path: '/api/module/%2e%2e/ukazka' })).status, 404);
  });

  test('postup: kód, splnění, skóre a reset', async () => {
    assert.deepEqual((await api('GET', '/api/progress')).data, {
      version: 1, completed: {}, scores: {}, code: {}, lastVisited: null,
    });

    const saved = await api('PUT', '/api/progress/code', {
      id: 'ukazka/workshop/002', files: [{ name: 'script.js', content: 'add(1, 2)' }],
    });
    assert.deepEqual(saved.data, { ok: true });

    await api('POST', '/api/progress/complete', { id: 'ukazka/workshop/001' });
    await api('POST', '/api/progress/complete', { id: 'ukazka/kviz', score: 1 });
    const completed = await api('POST', '/api/progress/complete', { id: 'ukazka/kviz', score: 0.5 });
    assert.equal(completed.data.ok, true);
    assert.equal(completed.data.progress.scores['ukazka/kviz'], 1);
    assert.equal(completed.data.progress.lastVisited, 'ukazka/kviz');

    const progress = (await api('GET', '/api/progress')).data;
    assert.deepEqual(Object.keys(progress.completed).sort(), ['ukazka/kviz', 'ukazka/workshop/001']);
    assert.equal(progress.code['ukazka/workshop/002'].files[0].content, 'add(1, 2)');
    assert.ok(fs.existsSync(path.join(dataDir, 'progress.json')));

    const reset = await api('POST', '/api/progress/reset', { id: 'ukazka/workshop' });
    assert.deepEqual(Object.keys(reset.data.progress.completed), ['ukazka/kviz']);
    assert.deepEqual(reset.data.progress.code, {});
  });

  test('postup: špatné vstupy', async () => {
    assert.equal((await api('POST', '/api/progress/complete', { id: '../x' })).status, 400);
    assert.equal((await api('PUT', '/api/progress/code', { id: 'a/b', files: 'nic' })).status, 400);
    const invalidJson = await api('POST', '/api/progress/complete', '{ nedokončené');
    assert.equal(invalidJson.status, 400);
    assert.match(invalidJson.data.error, /Neplatný JSON/);

    const huge = await api('PUT', '/api/progress/code', {
      id: 'a/b', files: [{ name: 'big.js', content: 'x'.repeat(6 * 1024 * 1024) }],
    }).catch((err) => ({ status: 'spojení zavřeno', err }));
    // Server odpoví 413 a zavře spojení; podle načasování to klient vidí jako 413 nebo jako zavřené spojení.
    assert.ok(huge.status === 413 || huge.status === 'spojení zavřeno', String(huge.status));
    assert.equal((await api('GET', '/api/progress')).data.code['a/b'], undefined);
  });

  test('POST /api/run-node a /api/run-node-file', async () => {
    const run = await api('POST', '/api/run-node', {
      runtime: 'node',
      files: [{ name: 'index.js', content: "console.log('Ahoj');" }],
      hints: [
        { text: 'vypíše', test: "const r = await helpers.run('node index.js'); assert.equal(r.stdout.trim(), 'Ahoj');" },
        { text: 'selže', test: "assert.equal(files['index.js'], '');" },
      ],
    });
    assert.equal(run.status, 200);
    assert.equal(run.data.ok, false);
    assert.deepEqual(run.data.results[0], { index: 0, pass: true });
    assert.equal(run.data.results[1].pass, false);
    assert.deepEqual(run.data.logs, [{ level: 'log', text: 'Ahoj' }]);
    assert.deepEqual(run.data.errors, []);

    const file = await api('POST', '/api/run-node-file', {
      files: [{ name: 'main.js', content: "console.log(2 + 3);" }], main: 'main.js',
    });
    assert.deepEqual(file.data, { code: 0, stdout: '5\n', stderr: '', timedOut: false });

    assert.equal((await api('POST', '/api/run-node', { runtime: 'dom', files: [], hints: [] })).status, 400);
    const traversal = await api('POST', '/api/run-node', { files: [{ name: '../ven.js', content: '' }], hints: [] });
    assert.equal(traversal.status, 400);
    assert.equal((await api('POST', '/api/run-node-file', { files: [], main: 'chybi.js' })).status, 400);
    assert.equal((await api('GET', '/api/run-node')).status, 405);
  });

  test('klient zavře spojení → server zaseknutý test ukončí a další testy nespustí', async () => {
    const pidFile = path.join(root, 'zruseni-pid.txt');
    const controller = new AbortController();
    const request = fetch(`${baseUrl}/api/run-node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        files: [],
        timeoutMs: 60000,
        hints: [
          { text: 'smyčka', test: `(await import('node:fs')).writeFileSync(${JSON.stringify(pidFile)}, String(process.pid)); while (true) {}` },
          { text: 'nemá se spustit', test: `(await import('node:fs')).writeFileSync(${JSON.stringify(pidFile)}, 'druhý test');` },
        ],
      }),
    });
    request.catch(() => {});

    const deadline = Date.now() + 10000;
    while (!fs.existsSync(pidFile) && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 20));
    const harness = Number(fs.readFileSync(pidFile, 'utf8'));
    controller.abort();

    const alive = () => {
      try {
        process.kill(harness, 0);
        return true;
      } catch {
        return false;
      }
    };
    const stopDeadline = Date.now() + 3000;
    while (alive() && Date.now() < stopDeadline) await new Promise((resolve) => setTimeout(resolve, 20));
    if (alive()) process.kill(harness, 'SIGKILL');
    assert.equal(alive(), false, 'test běžel dál i po zavření spojení');
    await new Promise((resolve) => setTimeout(resolve, 300));
    assert.equal(fs.readFileSync(pidFile, 'utf8'), String(harness), 'druhý test se už nespustil');
  });

  test('projekt: files, start, check se starterem i s řešením', async () => {
    const dir = path.join(projectsDir, 'ukazka--projekt');

    const before = await api('GET', '/api/project/ukazka/projekt/files');
    assert.deepEqual(before.data, { dir, exists: false, files: [] });

    const early = await api('POST', '/api/project/ukazka/projekt/check');
    assert.equal(early.status, 409);

    const started = await api('POST', '/api/project/ukazka/projekt/start');
    assert.deepEqual(started.data, { dir, created: true });
    const files = await api('GET', '/api/project/ukazka/projekt/files');
    assert.equal(files.data.exists, true);
    assert.deepEqual(files.data.files.map((f) => [f.name, f.lang]), [['server.js', 'js']]);
    assert.match(files.data.files[0].content, /TODO/);

    // Uživatelovy změny druhý start nepřepíše.
    fs.writeFileSync(path.join(dir, 'poznamky.md'), 'moje');
    const again = await api('POST', '/api/project/ukazka/projekt/start');
    assert.deepEqual(again.data, { dir, created: false });
    assert.ok(fs.existsSync(path.join(dir, 'poznamky.md')));

    const failing = await api('POST', '/api/project/ukazka/projekt/check');
    assert.equal(failing.status, 200);
    assert.equal(failing.data.ok, false);
    assert.deepEqual(failing.data.results[0], { index: 0, pass: true });
    assert.equal(failing.data.results[1].pass, false);

    fs.cpSync(path.join(contentDir, 'ukazka', 'projekt', 'solution'), dir, { recursive: true });
    const passing = await api('POST', '/api/project/ukazka/projekt/check');
    assert.equal(passing.data.ok, true, JSON.stringify(passing.data));
    assert.deepEqual(fs.readdirSync(dir).sort(), ['poznamky.md', 'server.js']);
  });

  test('projekt: dom se kontroluje v prohlížeči, jiné moduly nejsou projekty', async () => {
    await api('POST', '/api/project/ukazka/projekt-web/start');
    const check = await api('POST', '/api/project/ukazka/projekt-web/check');
    assert.equal(check.status, 400);
    assert.match(check.data.error, /prohlížeči/);

    assert.equal((await api('POST', '/api/project/ukazka/lekce/start')).status, 400);
    assert.equal((await api('POST', '/api/project/ukazka/neni/start')).status, 404);
    assert.equal((await rawRequest({ method: 'POST', path: '/api/project/..%2F..%2Fx/y/start' })).status, 400);
    assert.deepEqual(fs.readdirSync(projectsDir).sort(), ['ukazka--projekt', 'ukazka--projekt-web']);
  });

  test('statické soubory, SPA fallback a ochrana cest', async () => {
    const index = await rawRequest({ path: '/' });
    assert.equal(index.status, 200);
    assert.equal(index.headers['content-type'], 'text/html; charset=utf-8');

    const js = await rawRequest({ path: '/assets/app.js' });
    assert.equal(js.headers['content-type'], 'text/javascript; charset=utf-8');
    assert.equal(js.text, 'console.log(1);');
    assert.equal((await rawRequest({ path: '/assets/app.css' })).headers['content-type'], 'text/css; charset=utf-8');

    const spa = await rawRequest({ path: '/sekce/ukazka' });
    assert.equal(spa.status, 200);
    assert.match(spa.text, /<title>Akademie/);

    assert.equal((await rawRequest({ path: '/assets/chybi.js' })).status, 404);
    const traversal = await rawRequest({ path: '/..%2F..%2F..%2Fpackage.json' });
    assert.equal(traversal.status, 404);
    assert.doesNotMatch(traversal.text, /"name"/);

    const unknownApi = await api('GET', '/api/neco');
    assert.equal(unknownApi.status, 404);
    assert.ok(unknownApi.data.error);
  });

  test('nečitelný statický soubor vrátí chybu a server běží dál', { skip: process.getuid?.() === 0 && 'root přečte i soubor bez práv' }, async () => {
    // Dřív chyba čtení vyletěla z fs.createReadStream jako nezachycená a shodila celý server.
    const locked = path.join(root, 'dist', 'assets', 'zamceny.js');
    fs.writeFileSync(locked, 'tajné');
    fs.chmodSync(locked, 0o000);
    try {
      const res = await rawRequest({ path: '/assets/zamceny.js' });
      assert.equal(res.status, 500);
      assert.match(JSON.parse(res.text).error, /EACCES/);
      assert.equal((await rawRequest({ path: '/assets/app.js' })).status, 200);
    } finally {
      fs.rmSync(locked, { force: true });
    }
  });

  test('/vendor/vue.esm-browser.js s CORS hlavičkou', async () => {
    const res = await rawRequest({ path: '/vendor/vue.esm-browser.js', method: 'HEAD' });
    assert.equal(res.status, 200);
    assert.equal(res.headers['access-control-allow-origin'], '*');
    assert.equal(res.headers['content-type'], 'text/javascript; charset=utf-8');
    assert.ok(Number(res.headers['content-length']) > 100000);

    const missing = await rawRequest({ path: '/vendor/../package.json' });
    assert.equal(missing.status, 404);
  });

  test('požadavky z cizích stránek a na cizí Host jsou odmítnuté', async () => {
    const csrf = await rawRequest({ method: 'POST', path: '/api/progress/reset', headers: { Origin: 'https://zla-stranka.example' } });
    assert.equal(csrf.status, 403);
    const rebinding = await rawRequest({ path: '/api/progress', headers: { Host: 'zla-stranka.example' } });
    assert.equal(rebinding.status, 403);

    // Kód uživatele v sandboxovaném iframu (neprůhledný origin posílá `Origin: null`) nesmí spouštět node.
    const sandboxed = await rawRequest({ method: 'POST', path: '/api/run-node', headers: { Origin: 'null' } });
    assert.equal(sandboxed.status, 403);

    const local = await rawRequest({ method: 'POST', path: '/api/progress/reset', headers: { Origin: 'http://localhost:5300' } });
    assert.equal(local.status, 400); // prošlo ochranou, jen chybí id
  });
});
