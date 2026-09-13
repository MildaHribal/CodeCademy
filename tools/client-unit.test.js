// Jednotkové testy logiky klienta, která nepotřebuje prohlížeč (router, ukládání postupu).
import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// progress.js při načtení registruje `pagehide` na window a mluví se serverem přes fetch.
// V Node obojí podstrčíme: fetch obsluhuje malý falešný server v paměti.
globalThis.window ??= { addEventListener() {} };

/** Falešné API postupu. PUT se dá pozdržet, ať jde nasimulovat pomalé uložení. */
function createFakeServer() {
  const server = {
    progress: { version: 1, completed: {}, scores: {}, code: {}, lastVisited: null },
    log: [],
    holdPuts: false,
    heldPuts: [],
    releasePuts() {
      server.holdPuts = false;
      for (const release of server.heldPuts.splice(0)) release();
    },
  };
  const json = (data) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });

  globalThis.fetch = async (url, { method = 'GET', body } = {}) => {
    const data = body ? JSON.parse(body) : null;
    if (method === 'GET' && url === '/api/progress') {
      server.log.push('GET progress');
      return json(structuredClone(server.progress));
    }
    if (method === 'PUT' && url === '/api/progress/code') {
      if (server.holdPuts) await new Promise((resolve) => server.heldPuts.push(resolve));
      server.progress.code[data.id] = { files: data.files, updated: 'teď' };
      server.log.push(`PUT ${data.id}`);
      return json({ ok: true });
    }
    if (method === 'POST' && url === '/api/progress/complete') {
      server.progress.completed[data.id] = 'teď';
      server.log.push(`POST complete ${data.id}`);
      return json({ ok: true, progress: structuredClone(server.progress) });
    }
    throw new Error(`neočekávaný požadavek ${method} ${url}`);
  };
  return server;
}

describe('router', () => {
  let parseHash;
  before(async () => {
    ({ parseHash } = await import('../client/src/router.js'));
  });

  test('rozpozná obrazovky podle adresy', () => {
    assert.deepEqual(parseHash('#/'), { name: 'overview' });
    assert.deepEqual(parseHash('#/sekce/css-flexbox'), { name: 'section', sectionId: 'css-flexbox' });
    assert.deepEqual(parseHash('#/modul/a/b/003'), { name: 'module', sectionId: 'a', moduleId: 'b', stepKey: '003' });
  });

  test('rozbité %-kódování v adrese je „nenalezeno", ne výjimka', () => {
    // Dřív decodeURIComponent vyhodil URIError, obrazovka se nepřekreslila a zůstala stará.
    assert.deepEqual(parseHash('#/sekce/%E0%A4%A'), { name: 'not-found' });
  });

  test('krok je nepovinný parametr modulu, nadbytečné části adresy jsou „nenalezeno"', () => {
    assert.deepEqual(parseHash('#/modul/a/b'), { name: 'module', sectionId: 'a', moduleId: 'b', stepKey: null });
    assert.deepEqual(parseHash('#/modul/a/b/003/navic'), { name: 'not-found' });
    assert.deepEqual(parseHash('#/sekce'), { name: 'not-found' });
  });

  test('cesty nástrojů: defineRoute s nepovinným parametrem a dotazem za ?', async () => {
    const { defineRoute } = await import('../client/src/router.js');
    defineRoute('test-notes', '/test-poznamky/:sectionId?');
    assert.deepEqual(parseHash('#/test-poznamky'), { name: 'test-notes', sectionId: null });
    assert.deepEqual(parseHash('#/test-poznamky/css-flexbox?q=flex%20box&strana=2'), {
      name: 'test-notes', sectionId: 'css-flexbox', query: { q: 'flex box', strana: '2' },
    });
    assert.throws(() => defineRoute('test-notes', '/jinde'), /dvakrát/);
  });
});

describe('rozšiřovací body (core/registry.js)', () => {
  let createRegistry;
  let createEmitter;
  let createExtensionPoint;
  before(async () => {
    ({ createRegistry, createEmitter, createExtensionPoint } = await import('../client/src/core/registry.js'));
  });

  test('registr řadí podle order a pak podle pořadí registrace, duplicitní id je chyba', () => {
    const registry = createRegistry('Položka');
    registry.add({ id: 'b', order: 20 });
    registry.add({ id: 'a' });
    registry.add({ id: 'c', order: 20 });
    const remove = registry.add({ id: 'd', order: 1 });
    assert.deepEqual(registry.list().map((entry) => entry.id), ['d', 'b', 'c', 'a']);
    assert.throws(() => registry.add({ id: 'a' }), /dvakrát/);
    remove();
    assert.equal(registry.has('d'), false);
  });

  test('události: chyba posluchače nezastaví ostatní, odhlášení funguje', (t) => {
    t.mock.method(console, 'error', () => {});
    const events = createEmitter();
    const seen = [];
    events.on('x', () => {
      throw new Error('rozbitý posluchač');
    });
    const off = events.on('x', (payload) => seen.push(payload));
    events.emit('x', 1);
    off();
    events.emit('x', 2);
    assert.deepEqual(seen, [1]);
  });

  test('extension point: setup podle order, rozbité rozšíření neshodí ostatní, úklid v opačném pořadí', (t) => {
    t.mock.method(console, 'error', () => {});
    const point = createExtensionPoint('testu');
    const log = [];
    point.register({ id: 'druhe', order: 20, setup: (api) => { log.push(`setup druhe ${api.name}`); return () => log.push('uklid druhe'); } });
    point.register({ id: 'rozbite', order: 15, setup: () => { throw new Error('chyba'); } });
    point.register({ id: 'prvni', order: 10, setup: () => { log.push('setup prvni'); return () => log.push('uklid prvni'); } });
    const cleanup = point.mount({ name: 'plocha' });
    cleanup();
    assert.deepEqual(log, ['setup prvni', 'setup druhe plocha', 'uklid druhe', 'uklid prvni']);
    assert.throws(() => point.register({ id: 'bez-setup' }), /setup/);
  });
});

describe('ukládání rozpracovaného kódu', () => {
  let progress;
  let server;
  const files = (content) => [{ name: 'script.js', content }];

  before(async () => {
    server = createFakeServer();
    ({ progress } = await import('../client/src/progress.js'));
  });

  beforeEach(async () => {
    await progress.flushAll();
    server.releasePuts();
    server.progress = { version: 1, completed: {}, scores: {}, code: {}, lastVisited: null };
    server.log = [];
  });

  test('load() počká, až server zpracuje uložení — návrat na krok ukáže nový kód', async () => {
    server.holdPuts = true;
    progress.saveCode('s/w/001', files('nový kód'));

    // Uživatel přejde jinam: obrazovka pošle čekající uložení a nová si načte postup.
    progress.flushAll();
    const loading = progress.load();
    setTimeout(() => server.releasePuts(), 30);
    await loading;

    assert.deepEqual(server.log, ['PUT s/w/001', 'GET progress'], 'postup se načetl až po uložení');
    assert.deepEqual(progress.savedFiles('s/w/001'), files('nový kód'));
  });

  test('complete() nepřepíše kód, který server ještě nemá', async () => {
    progress.saveCode('s/w/002', files('rozepsáno'));
    await progress.complete('s/w/002');

    // Odpověď na complete přišla dřív, než se kód uložil; lokálně ale zůstat musí.
    assert.equal(server.progress.code['s/w/002'], undefined);
    assert.deepEqual(progress.savedFiles('s/w/002'), files('rozepsáno'));
    assert.ok(progress.isCompleted('s/w/002'));

    await progress.flushAll();
    assert.deepEqual(server.progress.code['s/w/002'].files, files('rozepsáno'));
  });

  test('když server neběží, kód se neztratí a odešle se při dalším pokusu', async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };
    progress.saveCode('s/w/003', files('offline'));
    await progress.flushAll();
    globalThis.fetch = realFetch;

    await progress.load();
    assert.deepEqual(server.progress.code['s/w/003'].files, files('offline'));
    assert.deepEqual(progress.savedFiles('s/w/003'), files('offline'));
  });
});
