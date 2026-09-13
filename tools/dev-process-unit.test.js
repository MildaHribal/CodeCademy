// Logika klienta nástroje dev-process bez DOM: relace procesu a výpočty HTTP klienta.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  bodyBytes, buildRequest, describeBody, formatBytes, headerEntries, parseHeaderLines, statusGroup,
} from '../client/src/extensions/dev-process/http-format.js';
import { chunksToEntries, createDevProcessSession } from '../client/src/extensions/dev-process/session.js';

/** Ruční časovače: poll se spustí až na tick(). */
function manualTimers() {
  let next = 1;
  const pending = new Map();
  return {
    set(fn, ms) {
      const id = next++;
      pending.set(id, { fn, ms });
      return id;
    },
    clear(id) {
      pending.delete(id);
    },
    count: () => pending.size,
    delays: () => [...pending.values()].map((t) => t.ms),
    async tick() {
      const due = [...pending.entries()];
      pending.clear();
      for (const [, { fn }] of due) await fn();
    },
  };
}

const proc = (overrides = {}) => ({
  id: 'p-1', status: 'running', listening: true, port: 41234, url: 'http://127.0.0.1:41234',
  main: 'server.js', startedAt: '2026-09-13T10:00:00.000Z', exitCode: null, signal: null, ...overrides,
});

/** Falešné API: výstupy se vrací postupně z fronty. */
function fakeApi({ outputs = [], startProcess = proc() } = {}) {
  const calls = [];
  const api = {
    calls,
    outputs,
    start: async (body) => {
      calls.push(['start', body]);
      return { ok: true, process: startProcess };
    },
    stop: async (options) => {
      calls.push(['stop', options]);
      return { ok: true, stopped: true };
    },
    output: async (since) => {
      calls.push(['output', since]);
      const next = outputs.shift();
      if (next instanceof Error) throw next;
      return next ?? { process: startProcess, next: since, truncated: false, chunks: [] };
    },
    get: async () => ({ process: startProcess }),
    request: async (body) => {
      calls.push(['request', body]);
      return { ok: true, status: 200 };
    },
  };
  return api;
}

describe('dev-process: výstup do konzole', () => {
  test('sousední záznamy stejného proudu se spojí, koncový nový řádek pryč', () => {
    const entries = chunksToEntries([
      { seq: 0, stream: 'stdout', text: 'Ahoj ' },
      { seq: 1, stream: 'stdout', text: 'světe\n' },
      { seq: 2, stream: 'stderr', text: 'chyba\r\n' },
      { seq: 3, stream: 'system', text: 'Server poslouchá na http://127.0.0.1:1' },
      { seq: 4, stream: 'stdout', text: '\n' },
      { seq: 5, stream: 'stdout', text: 'a\nb\n\n' },
    ]);
    assert.deepEqual(entries, [
      { level: 'log', text: 'Ahoj světe' },
      { level: 'error', text: 'chyba' },
      { level: 'system', text: 'Server poslouchá na http://127.0.0.1:1' },
      { level: 'log', text: '\na\nb\n' },
    ]);
  });
});

describe('dev-process: relace', () => {
  test('start → výstup od since=0 → další poll od next → konec procesu zastaví stahování', async () => {
    const timers = manualTimers();
    const api = fakeApi({
      outputs: [
        { process: proc(), next: 2, truncated: false, chunks: [{ seq: 0, stream: 'system', text: 'Server poslouchá' }, { seq: 1, stream: 'stdout', text: 'běžím\n' }] },
        { process: proc({ status: 'exited', listening: false, exitCode: 1 }), next: 3, truncated: false, chunks: [{ seq: 2, stream: 'system', text: 'Proces skončil s kódem 1.' }] },
      ],
    });
    const session = createDevProcessSession({ api, timers, pollMs: 300 });
    const output = [];
    const states = [];
    session.on('output', (entries) => output.push(...entries));
    session.on('change', (state) => states.push(state));

    const started = await session.start({ files: [{ name: 'server.js', content: '' }], main: 'server.js' });
    assert.equal(started.id, 'p-1');
    assert.deepEqual(api.calls.slice(0, 2), [['start', { files: [{ name: 'server.js', content: '' }], main: 'server.js' }], ['output', 0]]);
    assert.deepEqual(output, [{ level: 'system', text: 'Server poslouchá' }, { level: 'log', text: 'běžím' }]);
    assert.equal(session.state().running, true);
    assert.equal(states[0].starting, true);
    assert.deepEqual(timers.delays(), [300]);

    await timers.tick();
    assert.deepEqual(api.calls.at(-1), ['output', 2]);
    assert.equal(output.at(-1).text, 'Proces skončil s kódem 1.');
    assert.equal(session.state().running, false);
    assert.equal(session.state().process.exitCode, 1);
    assert.equal(timers.count(), 0, 'po skončení se už nestahuje');
  });

  test('skript, který doběhne už při startu: jediný poll', async () => {
    const timers = manualTimers();
    const exited = proc({ status: 'exited', listening: false, exitCode: 0 });
    const api = fakeApi({
      startProcess: exited,
      outputs: [{ process: exited, next: 2, truncated: false, chunks: [{ seq: 0, stream: 'stdout', text: 'ahoj\n' }, { seq: 1, stream: 'system', text: 'Proces skončil s kódem 0.' }] }],
    });
    const session = createDevProcessSession({ api, timers });
    const output = [];
    session.on('output', (entries) => output.push(...entries));
    await session.start({ files: [] });
    assert.deepEqual(output.map((e) => e.text), ['ahoj', 'Proces skončil s kódem 0.']);
    assert.equal(timers.count(), 0);
  });

  test('truncated přidá upozornění, chyba spojení zkusí znovu později', async () => {
    const timers = manualTimers();
    const api = fakeApi({
      outputs: [
        { process: proc(), next: 10, truncated: true, chunks: [{ seq: 9, stream: 'stdout', text: 'x' }] },
        new Error('Server Akademie neodpovídá.'),
        { process: proc(), next: 10, truncated: false, chunks: [] },
      ],
    });
    const session = createDevProcessSession({ api, timers, pollMs: 300, retryMs: 1500 });
    const output = [];
    session.on('output', (entries) => output.push(...entries));
    await session.start({ files: [] });
    assert.match(output[0].text, /nevešel/);
    await timers.tick();
    assert.equal(session.state().error, 'Server Akademie neodpovídá.');
    assert.deepEqual(timers.delays(), [1500]);
    await timers.tick();
    assert.equal(session.state().error, null);
    assert.deepEqual(api.calls.filter(([name]) => name === 'output').map(([, since]) => since), [0, 10, 10]);
  });

  test('proces převzala jiná karta: relace ho přestane hlídat a nezastaví ho', async () => {
    const timers = manualTimers();
    const api = fakeApi({ outputs: [{ process: proc({ id: 'p-2' }), next: 0, truncated: false, chunks: [] }] });
    const session = createDevProcessSession({ api, timers });
    await session.start({ files: [] });
    assert.equal(session.state().own, false);
    assert.equal(session.state().running, false);
    assert.equal(await session.stop(), false);
    session.dispose();
    assert.equal(api.calls.some(([name]) => name === 'stop'), false);
  });

  test('stop vlastního procesu a dispose s keepalive', async () => {
    const timers = manualTimers();
    const api = fakeApi();
    const session = createDevProcessSession({ api, timers });
    await session.start({ files: [] });
    api.outputs.push({ process: proc({ status: 'exited', signal: 'SIGTERM' }), next: 1, truncated: false, chunks: [{ seq: 0, stream: 'system', text: 'Proces zastaven.' }] });
    assert.equal(await session.stop(), true);
    assert.deepEqual(api.calls.find(([name]) => name === 'stop'), ['stop', { keepalive: false }]);
    assert.equal(session.state().running, false);
    assert.equal(session.state().stopping, false);

    // Nový běh a odchod z obrazovky: stop s keepalive, žádné další stahování.
    await session.start({ files: [] });
    session.dispose();
    assert.deepEqual(api.calls.at(-1), ['stop', { keepalive: true }]);
    assert.equal(timers.count(), 0);
    session.dispose();
    assert.equal(api.calls.filter(([name]) => name === 'stop').length, 2, 'dispose jen jednou');
  });

  test('dispose bez běžícího procesu nic nezastavuje; markChanged jen u běžícího', async () => {
    const timers = manualTimers();
    const exited = proc({ status: 'exited', exitCode: 0 });
    const api = fakeApi({ startProcess: exited, outputs: [{ process: exited, next: 0, truncated: false, chunks: [] }] });
    const session = createDevProcessSession({ api, timers });
    session.markChanged();
    assert.equal(session.state().stale, false);
    await session.start({ files: [] });
    session.markChanged();
    assert.equal(session.state().stale, false);
    session.dispose();
    assert.equal(api.calls.some(([name]) => name === 'stop'), false);

    const running = createDevProcessSession({ api: fakeApi(), timers: manualTimers() });
    await running.start({ files: [] });
    running.markChanged();
    assert.equal(running.state().stale, true);
    await running.start({ files: [] });
    assert.equal(running.state().stale, false, 'nový start stav „kód se změnil" smaže');
  });
});

describe('dev-process: HTTP klient', () => {
  test('hlavičky z řádků', () => {
    assert.deepEqual(parseHeaderLines('Accept: application/json\n\n X-Token :  abc:def \n'), {
      headers: { Accept: 'application/json', 'X-Token': 'abc:def' },
      errors: [],
    });
    const bad = parseHeaderLines('Accept application/json\nMoje hlavička: x');
    assert.equal(bad.errors.length, 2);
    assert.match(bad.errors[0], /řádku 1/);
    assert.match(bad.errors[1], /řádku 2/);
  });

  test('buildRequest: cesta, metoda, doplnění Content-Type, GET bez těla', () => {
    assert.deepEqual(buildRequest({ method: 'get', path: '' }).request, { method: 'GET', path: '/', headers: {} });

    const json = buildRequest({ method: 'POST', path: ' /api/books ', bodyText: '{"title":"Babička"}' });
    assert.deepEqual(json.request, {
      method: 'POST', path: '/api/books', headers: { 'Content-Type': 'application/json' }, body: '{"title":"Babička"}',
    });
    assert.equal(json.addedContentType, 'application/json');

    const text = buildRequest({ method: 'PUT', path: '/x', bodyText: 'ahoj' });
    assert.equal(text.request.headers['Content-Type'], 'text/plain; charset=utf-8');

    const own = buildRequest({ method: 'POST', path: '/x', headersText: 'content-type: application/json', bodyText: '{rozbité' });
    assert.deepEqual(own.request.headers, { 'content-type': 'application/json' });
    assert.equal(own.addedContentType, null);
    assert.match(own.warnings[0], /není platný JSON/);

    const get = buildRequest({ method: 'GET', path: '/x', bodyText: '{"a":1}' });
    assert.equal('body' in get.request, false);
    assert.deepEqual(get.request.headers, {});

    const full = buildRequest({ path: 'http://localhost:3000/api/books?limit=2' });
    assert.equal(full.request.path, '/api/books?limit=2');
    assert.match(full.warnings[0], /jen cesta/);

    assert.equal(buildRequest({ path: 'api/books' }).request, null);
    assert.match(buildRequest({ path: 'api/books' }).errors[0], /lomítkem/);
    assert.match(buildRequest({ path: '/a b' }).errors[0], /mezery/);
    assert.equal(buildRequest({ method: 'TRACE', path: '/' }).request, null);
    assert.equal(buildRequest({ path: '/', headersText: 'špatně' }).request, null);
  });

  test('popis odpovědi: skupina stavu, velikost, tělo', () => {
    assert.deepEqual(statusGroup(201), { tone: 'ok', label: 'úspěch' });
    assert.equal(statusGroup(304).tone, 'redirect');
    assert.equal(statusGroup(404).label, 'chyba v požadavku');
    assert.equal(statusGroup(500).tone, 'server');
    assert.equal(statusGroup(101).tone, 'info');

    assert.equal(formatBytes(0), '0 B');
    assert.equal(formatBytes(999), '999 B');
    assert.equal(formatBytes(1234), '1,2 kB');
    assert.equal(formatBytes(3_400_000), '3,4 MB');
    assert.equal(bodyBytes({ body: 'čau', bodyEncoding: 'utf8' }), 4);
    assert.equal(bodyBytes({ body: '/wA=', bodyEncoding: 'base64' }), 2);
    assert.equal(bodyBytes({ body: '' }), 0);

    assert.deepEqual(describeBody({ body: '{"a":[1]}', bodyEncoding: 'utf8', headers: { 'content-type': 'application/json' } }), {
      kind: 'json', text: '{\n  "a": [\n    1\n  ]\n}',
    });
    assert.equal(describeBody({ body: '{"a":', bodyEncoding: 'utf8', headers: { 'content-type': 'application/json' } }).kind, 'text');
    assert.equal(describeBody({ body: '[1]', bodyEncoding: 'utf8', headers: {} }).kind, 'json');
    assert.equal(describeBody({ body: 'Ahoj', bodyEncoding: 'utf8', headers: { 'content-type': 'text/plain' } }).kind, 'text');
    assert.equal(describeBody({ body: '', bodyEncoding: 'utf8', headers: {} }).kind, 'empty');
    const binary = describeBody({ body: 'iVBORw==', bodyEncoding: 'base64', headers: { 'content-type': 'image/png' } });
    assert.equal(binary.kind, 'binary');
    assert.match(binary.text, /Binární data \(4 B, image\/png\)/);

    assert.deepEqual(headerEntries({ 'x-b': '2', 'content-type': 'a' }), [['content-type', 'a'], ['x-b', '2']]);
  });
});

describe('dev-process: relace při rychlém opětovném spuštění', () => {
  test('nový start během rozběhnutého pollu starého běhu: výstup nového běhu se stáhne', async () => {
    const timers = manualTimers();
    let releaseOld;
    const api = fakeApi({ startProcess: proc({ id: 'p-1' }) });
    const session = createDevProcessSession({ api, timers });
    await session.start({ files: [] }); // p-1 běží, poll naplánovaný

    // Poll starého běhu visí na síti.
    api.output = (since) => {
      api.calls.push(['output', since]);
      return new Promise((resolve) => { releaseOld = () => resolve({ process: proc({ id: 'p-2' }), next: 5, truncated: false, chunks: [{ seq: 4, stream: 'stdout', text: 'staré' }] }); });
    };
    const pending = timers.tick();

    const output = [];
    session.on('output', (entries) => output.push(...entries));
    api.start = async () => ({ ok: true, process: proc({ id: 'p-2' }) });
    const started = session.start({ files: [] });
    await started;
    api.output = async (since) => {
      api.calls.push(['output', since]);
      return { process: proc({ id: 'p-2' }), next: 1, truncated: false, chunks: [{ seq: 0, stream: 'stdout', text: 'nové' }] };
    };
    releaseOld();
    await pending;
    await timers.tick(); // dohnaný poll nového běhu
    assert.deepEqual(output.map((e) => e.text), ['nové']);
    assert.equal(session.state().own, true);
    assert.deepEqual(api.calls.at(-1), ['output', 0]);
    session.dispose();
  });
});
