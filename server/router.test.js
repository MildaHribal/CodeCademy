import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { createApp } from './app.js';
import { HttpError } from './errors.js';
import { compilePath, createRouter } from './router.js';
import { loadRouteModules, routeFileNames, routeModules } from './routes/index.js';

const contentDir = path.join(import.meta.dirname, 'test-fixtures', 'content');

describe('router', () => {
  test('parametry v cestě, 404 a 405', () => {
    const router = createRouter();
    router.get('/api/module/:section/:module', () => 'modul');
    router.post('/api/module/:section/:module', () => 'post');

    const { handler, params } = router.match('GET', '/api/module/css-flexbox/kviz');
    assert.equal(handler(), 'modul');
    assert.deepEqual(params, { section: 'css-flexbox', module: 'kviz' });

    assert.throws(() => router.match('GET', '/api/nic'), (error) => error instanceof HttpError && error.status === 404);
    assert.throws(() => router.match('DELETE', '/api/module/a/b'), (error) => error.status === 405 && /GET, POST/.test(error.message));
    assert.throws(() => router.match('GET', '/api/module/%E0%A4%A/b'), (error) => error.status === 400);
  });

  test('tečky a jiné znaky v cestě se berou doslova', () => {
    const { pattern } = compilePath('/api/soubor.json');
    assert.equal(pattern.test('/api/soubor.json'), true);
    assert.equal(pattern.test('/api/souborXjson'), false);
  });

  test('duplicitní routa selže s oběma zdroji v hlášce', () => {
    const router = createRouter();
    router.forSource('reviews.js').get('/api/reviews/due', () => 1);
    assert.throws(() => router.forSource('stats.js').get('/api/reviews/due', () => 2), /registrovaná dvakrát \(reviews\.js a stats\.js\)/);
  });
});

describe('automatické načtení rout ze server/routes/', () => {
  let dir;

  before(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-routes-test-'));
    fs.writeFileSync(path.join(dir, 'b-nastroj.js'), "export function register(router) { router.get('/api/b', () => 'b'); }\n");
    fs.writeFileSync(path.join(dir, 'a-nastroj.js'), "export function register(router) { router.get('/api/a', () => 'a'); }\n");
    fs.writeFileSync(path.join(dir, '_pomocnik.js'), 'export const x = 1;\n');
    fs.writeFileSync(path.join(dir, 'a-nastroj.test.js'), 'throw new Error("test se nenačítá");\n');
    fs.writeFileSync(path.join(dir, 'index.js'), 'throw new Error("index se nenačítá");\n');
  });

  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  test('načte soubory abecedně, přeskočí index, testy a _pomocníky', async () => {
    assert.deepEqual(routeFileNames(dir), ['a-nastroj.js', 'b-nastroj.js']);
    const modules = await loadRouteModules(dir);
    assert.deepEqual(modules.map((m) => m.name), ['a-nastroj.js', 'b-nastroj.js']);
  });

  test('soubor bez register má srozumitelnou chybu', async () => {
    const broken = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-routes-broken-'));
    try {
      fs.writeFileSync(path.join(broken, 'spatny.js'), 'export const nic = 1;\n');
      await assert.rejects(loadRouteModules(broken), /server\/routes\/spatny\.js neexportuje funkci register/);
    } finally {
      fs.rmSync(broken, { recursive: true, force: true });
    }
  });

  test('skutečné routy platformy jsou v server/routes/', () => {
    const names = routeModules.map((m) => m.name);
    for (const core of ['curriculum.js', 'progress.js', 'projects.js', 'run-node.js']) assert.ok(names.includes(core), core);
  });
});

describe('createApp s routou nástroje', () => {
  let root;
  let server;
  let baseUrl;
  const resets = [];

  const toolRoutes = {
    name: 'nastroj.js',
    register(router, ctx) {
      const store = ctx.createJsonStore('nastroj.json', { defaults: () => ({ items: {} }) });
      ctx.onReset((id) => {
        resets.push(id);
        store.update((data) => {
          for (const key of Object.keys(data.items)) if (key === id || key.startsWith(`${id}/`)) delete data.items[key];
        });
      });
      router.post('/api/nastroj/:id', async ({ params, readBody }) => {
        const body = await readBody();
        ctx.checkId(body.id);
        store.update((data) => { data.items[body.id] = params.id; });
        return store.get();
      });
      router.get('/api/nastroj', ({ query }) => ({ items: store.get().items, q: query.get('q') }));
      router.get('/api/nastroj/vlastni', ({ res }) => {
        res.writeHead(418, { 'Content-Type': 'text/plain' });
        res.end('čajník');
      });
      router.delete('/api/nastroj', () => undefined);
      router.get('/api/nastroj/chyba', () => {
        throw new ctx.HttpError(409, 'Konflikt nástroje');
      });
    },
  };

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-app-routes-test-'));
    server = createApp({
      contentDir,
      dataDir: path.join(root, 'data'),
      projectsDir: path.join(root, 'moje-projekty'),
      distDir: path.join(root, 'dist'),
      routes: [...routeModules, toolRoutes],
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });

  async function call(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const type = res.headers.get('content-type') ?? '';
    return { status: res.status, data: type.includes('json') ? await res.json() : await res.text() };
  }

  test('routa nástroje funguje vedle rout platformy a ukládá do data/', async () => {
    assert.equal((await call('GET', '/api/curriculum')).status, 200);
    const saved = await call('POST', '/api/nastroj/x1', { id: 'ukazka/workshop/001' });
    assert.deepEqual(saved.data, { items: { 'ukazka/workshop/001': 'x1' } });
    assert.deepEqual((await call('GET', '/api/nastroj?q=hledat')).data, { items: { 'ukazka/workshop/001': 'x1' }, q: 'hledat' });
    assert.equal((await call('POST', '/api/nastroj/x1', { id: '../ven' })).status, 400);
    assert.deepEqual(await call('DELETE', '/api/nastroj'), { status: 200, data: { ok: true } });
    assert.deepEqual(await call('GET', '/api/nastroj/vlastni'), { status: 418, data: 'čajník' });
    assert.deepEqual(await call('GET', '/api/nastroj/chyba'), { status: 409, data: { error: 'Konflikt nástroje' } });

    await server.akademie.ctx.createJsonStore('nastroj.json').flush();
    assert.ok(fs.existsSync(path.join(root, 'data', 'nastroj.json')));
    assert.ok(server.akademie.routes.some((r) => r.path === '/api/nastroj/:id' && r.source === 'nastroj.js'));
  });

  test('reset postupu zavolá registrované resettery nástrojů', async () => {
    await call('POST', '/api/nastroj/x2', { id: 'ukazka/workshop/002' });
    await call('POST', '/api/nastroj/x3', { id: 'ukazka/kviz' });
    const reset = await call('POST', '/api/progress/reset', { id: 'ukazka/workshop' });
    assert.equal(reset.status, 200);
    assert.equal(reset.data.ok, true);
    assert.deepEqual(resets, ['ukazka/workshop']);
    assert.deepEqual(Object.keys((await call('GET', '/api/nastroj')).data.items), ['ukazka/kviz']);

    assert.equal((await call('POST', '/api/progress/reset', { id: '../x' })).status, 400);
    assert.deepEqual(resets, ['ukazka/workshop']);
  });

  test('ctx.on/emit: posluchači postupně, chyba jednoho nezastaví ostatní, odhlášení', async () => {
    const { ctx } = server.akademie;
    const seen = [];
    const off = ctx.on('test:udalost', async (payload) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      seen.push(['a', payload.n]);
    });
    ctx.on('test:udalost', () => {
      throw new Error('schválně');
    });
    ctx.on('test:udalost', (payload) => seen.push(['c', payload.n]));
    const originalError = console.error;
    console.error = () => {};
    try {
      await ctx.emit('test:udalost', { n: 1 });
      off();
      await ctx.emit('test:udalost', { n: 2 });
      await ctx.emit('test:nikdo', {});
    } finally {
      console.error = originalError;
    }
    assert.deepEqual(seen, [['a', 1], ['c', 1], ['c', 2]]);
  });

  test('ctx.resolveItem převede id kroku na obsah', () => {
    const item = server.akademie.ctx.resolveItem('step:ukazka/workshop/002');
    assert.equal(item.type, 'step');
    assert.equal(item.source.moduleId, 'ukazka/workshop');
    assert.equal(server.akademie.ctx.resolveItem('step:ukazka/workshop/999'), null);
  });

  test('ctx.dataPath nepustí soubor mimo data/', () => {
    assert.throws(() => server.akademie.ctx.createJsonStore('../ven.json'), /data\//);
  });
});
