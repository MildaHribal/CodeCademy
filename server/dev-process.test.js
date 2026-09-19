import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import {
  checkEnv, createDevProcessManager, createOutputBuffer, describeRequestError, encodeBody, pickMain,
} from './dev-process.js';
import { HttpError, InputError } from './errors.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitFor(fn, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await fn();
    if (value) return value;
    if (Date.now() > deadline) throw new Error('Podmínka se nesplnila včas');
    await sleep(25);
  }
}

const SERVER = `
import { createServer } from 'node:http';
const port = Number(process.env.PORT);
const server = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf8');
  if (req.url === '/echo') {
    res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8', 'X-Method': req.method });
    res.end(JSON.stringify({ method: req.method, body, type: req.headers['content-type'] ?? null, host: req.headers.host, length: req.headers['content-length'] ?? null }));
  } else if (req.url === '/png') {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xff, 0x00]));
  } else if (req.url === '/raw-text') {
    res.end('prostý text bez hlavičky');
  } else if (req.url === '/raw-binary') {
    res.end(Buffer.from([0xff, 0xfe, 0x00, 0xc3]));
  } else if (req.url === '/big') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('x'.repeat(5000));
  } else if (req.url === '/cookies') {
    res.setHeader('Set-Cookie', ['a=1', 'b=2']);
    res.setHeader('X-List', ['jedna', 'dva']);
    res.end('ok');
  } else if (req.url === '/hang') {
    // schválně nikdy neodpoví
  } else if (req.url === '/env') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ PORT: process.env.PORT, NODE_ENV: process.env.NODE_ENV, API_KEY: process.env.API_KEY ?? null, cwd: process.cwd() }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, path: req.url }));
  }
});
server.listen(port, () => console.log('Server běží na portu ' + port));
`;

const managers = [];
function manager(options = {}) {
  const created = createDevProcessManager({ tempPrefix: 'akademie-dev-test-', ...options });
  managers.push(created);
  return created;
}

after(() => {
  for (const m of managers) m.close();
});

describe('pomocné funkce', () => {
  test('pickMain: zadaný main, index.js, první .js', () => {
    assert.equal(pickMain(['a.js', 'index.js'], 'server.js'), 'server.js');
    assert.equal(pickMain(['a.js', 'index.js'], './b.js'), 'b.js');
    assert.equal(pickMain(['data.json', 'app.js', 'index.js']), 'index.js');
    assert.equal(pickMain(['data.json', 'server.mjs', 'app.js']), 'server.mjs');
    assert.throws(() => pickMain(['data.json']), InputError);
    assert.throws(() => pickMain(['a.js'], 42), InputError);
  });

  test('checkEnv: jména velkými písmeny, hodnoty text', () => {
    assert.deepEqual(checkEnv(undefined), {});
    assert.deepEqual(checkEnv({ API_KEY: 'x', _X1: '' }), { API_KEY: 'x', _X1: '' });
    assert.throws(() => checkEnv({ apiKey: 'x' }), /neplatné jméno/);
    assert.throws(() => checkEnv({ '1X': 'x' }), InputError);
    assert.throws(() => checkEnv({ PORT: 3000 }), /musí být text/);
    assert.throws(() => checkEnv(['A']), InputError);
  });

  test('výstup: since, next a truncated při zahození nejstarších záznamů', () => {
    const buffer = createOutputBuffer({ maxChunks: 3, maxBytes: 1000 });
    assert.deepEqual(buffer.since(0), { next: 0, truncated: false, chunks: [] });
    for (const text of ['a', 'b', 'c', 'd', 'e']) buffer.push('stdout', text);
    const all = buffer.since(0);
    assert.equal(all.next, 5);
    assert.equal(all.truncated, true);
    assert.deepEqual(all.chunks.map((c) => [c.seq, c.text]), [[2, 'c'], [3, 'd'], [4, 'e']]);
    assert.equal(buffer.since(2).truncated, false);
    assert.deepEqual(buffer.since(4).chunks.map((c) => c.text), ['e']);
    assert.deepEqual(buffer.since(5).chunks, []);
    assert.match(all.chunks[0].at, /^\d{4}-\d\d-\d\dT/);

    const bytes = createOutputBuffer({ maxChunks: 100, maxBytes: 10 });
    bytes.push('stdout', 'čččč');
    bytes.push('stderr', 'xyz');
    assert.deepEqual(bytes.since(0).chunks.map((c) => c.text), ['xyz']);
    assert.equal(bytes.since(0).truncated, true);

    buffer.clear();
    assert.deepEqual(buffer.since(0), { next: 0, truncated: false, chunks: [] });
  });

  test('tělo odpovědi: utf8 pro textové typy a platné UTF-8 bez typu, jinak base64', () => {
    assert.deepEqual(encodeBody(Buffer.from('{"a":1}'), 'application/json; charset=utf-8'), { body: '{"a":1}', bodyEncoding: 'utf8' });
    assert.equal(encodeBody(Buffer.from('<p>'), 'text/html').bodyEncoding, 'utf8');
    assert.equal(encodeBody(Buffer.from('a=1'), 'application/x-www-form-urlencoded').bodyEncoding, 'utf8');
    assert.equal(encodeBody(Buffer.from('<a/>'), 'application/xml').bodyEncoding, 'utf8');
    assert.equal(encodeBody(Buffer.from('x'), 'text/javascript').bodyEncoding, 'utf8');
    assert.deepEqual(encodeBody(Buffer.from('čau'), undefined), { body: 'čau', bodyEncoding: 'utf8' });
    assert.deepEqual(encodeBody(Buffer.from([0xff, 0x00]), undefined), { body: '/wA=', bodyEncoding: 'base64' });
    assert.equal(encodeBody(Buffer.from('abc'), 'image/png').bodyEncoding, 'base64');
  });

  test('české chyby požadavků', () => {
    assert.equal(describeRequestError({ code: 'ECONNREFUSED' }, { port: 41234 }), 'Spojení odmítnuto — server na portu 41234 neposlouchá.');
    assert.match(describeRequestError({ code: 'ETIMEDOUT' }, { timeoutMs: 200 }), /200 ms/);
    assert.match(describeRequestError({ code: 'HPE_INVALID_CONSTANT' }, {}), /neplatnou HTTP odpověď/);
  });
});

describe('správce procesu', () => {
  test('start se files: server poslouchá, výstup, požadavek a stop', async () => {
    const dev = manager();
    assert.equal(dev.process(), null);
    const proc = await dev.start({ files: [{ name: 'server.js', content: SERVER }, { name: 'package.json', content: '{"type":"module"}' }], main: 'server.js' });
    assert.equal(proc.id, 'p-1');
    assert.equal(proc.status, 'running');
    assert.equal(proc.listening, true);
    assert.equal(proc.url, `http://127.0.0.1:${proc.port}`);
    assert.equal(proc.main, 'server.js');
    assert.equal(proc.exitCode, null);
    assert.equal(proc.signal, null);
    assert.ok(Number.isInteger(proc.port) && proc.port > 0);
    assert.ok(!Number.isNaN(Date.parse(proc.startedAt)));

    const output = await waitFor(() => {
      const out = dev.output(0);
      return out.chunks.some((c) => c.stream === 'stdout') ? out : null;
    });
    assert.ok(output.chunks.some((c) => c.stream === 'system' && c.text === `Server poslouchá na ${proc.url}`));
    assert.ok(output.chunks.some((c) => c.stream === 'stdout' && c.text.includes(`Server běží na portu ${proc.port}`)));
    assert.equal(output.truncated, false);
    assert.equal(output.process.id, 'p-1');
    const later = dev.output(output.next);
    assert.deepEqual(later.chunks, []);
    assert.equal(later.next, output.next);

    const response = await dev.request({ method: 'GET', path: '/knihy?limit=5' });
    assert.equal(response.ok, true);
    assert.equal(response.status, 200);
    assert.equal(response.statusText, 'OK');
    assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
    assert.equal(response.bodyEncoding, 'utf8');
    assert.equal(response.bodyTruncated, false);
    assert.deepEqual(JSON.parse(response.body), { ok: true, path: '/knihy?limit=5' });
    assert.ok(Number.isInteger(response.durationMs) && response.durationMs >= 0);

    const pid = dev.pid();
    const dir = fs.readlinkSync(`/proc/${pid}/cwd`);
    assert.ok(path.basename(dir).startsWith('akademie-dev-test-'));
    assert.equal(await dev.stop(), true);
    const stopped = dev.process();
    assert.equal(stopped.status, 'exited');
    assert.equal(stopped.listening, false);
    assert.equal(stopped.signal, 'SIGTERM');
    assert.equal(isAlive(pid), false);
    assert.ok(dev.output(0).chunks.some((c) => c.stream === 'system' && c.text === 'Proces zastaven.'));
    await waitFor(() => !fs.existsSync(dir));
    assert.equal(await dev.stop(), false);
    await assert.rejects(dev.request({ path: '/' }), (error) => error instanceof HttpError && error.status === 409);
  });

  test('skript, který doběhne: exited s kódem, výstup i chyba', async () => {
    const dev = manager();
    const ok = await dev.start({ files: [{ name: 'a.js', content: 'console.log("ahoj"); console.error("pozor");' }] });
    assert.equal(ok.status, 'exited');
    assert.equal(ok.exitCode, 0);
    assert.equal(ok.listening, false);
    const texts = dev.output(0).chunks.map((c) => [c.stream, c.text]);
    assert.deepEqual(texts.find(([s]) => s === 'stdout'), ['stdout', 'ahoj\n']);
    assert.deepEqual(texts.find(([s]) => s === 'stderr'), ['stderr', 'pozor\n']);
    assert.deepEqual(texts.at(-1), ['system', 'Proces skončil s kódem 0.']);

    const failed = await dev.start({ files: [{ name: 'index.js', content: 'throw new Error("rozbito")' }, { name: 'b.js', content: '' }] });
    assert.equal(failed.id, 'p-2');
    assert.equal(failed.main, 'index.js');
    assert.equal(failed.exitCode, 1);
    const out = dev.output(0);
    assert.equal(out.chunks[0].seq, 0, 'nový proces začíná výstup od 0');
    assert.ok(out.chunks.some((c) => c.stream === 'stderr' && c.text.includes('rozbito')));
    assert.equal(out.chunks.at(-1).text, 'Proces skončil s kódem 1.');
  });

  test('neplatný start: files i project, chybějící main, soubor mimo adresář', async () => {
    const dev = manager();
    await assert.rejects(dev.start({}), InputError);
    await assert.rejects(dev.start({ files: [], project: { section: 'a', module: 'b' } }), InputError);
    await assert.rejects(dev.start({ files: [] }), InputError);
    await assert.rejects(dev.start({ files: [{ name: 'a.js', content: '' }], main: 'nic.js' }), /neexistuje/);
    await assert.rejects(dev.start({ files: [{ name: '../ven.js', content: '' }] }), /mimo pracovní adresář/);
    await assert.rejects(dev.start({ files: [{ name: 'data.json', content: '{}' }] }), /chybí soubor \.js/);
    await assert.rejects(dev.start({ files: [{ name: 'a.js', content: '' }], env: { port: '1' } }), InputError);
    await assert.rejects(dev.start({ project: { section: 'a', module: 'b' } }), /není dostupné/);
    assert.equal(dev.process(), null);
  });

  test('env, PORT přebije env, NODE_ENV a cwd projektu', async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-dev-test-project-'));
    try {
      fs.writeFileSync(path.join(projectDir, 'package.json'), '{"type":"module"}');
      fs.writeFileSync(path.join(projectDir, 'b-server.js'), SERVER);
      fs.writeFileSync(path.join(projectDir, 'z.js'), 'process.exit(3)');
      const seen = [];
      const dev = manager({ projectDir: (project) => { seen.push(project); return fs.realpathSync(projectDir); } });
      const proc = await dev.start({ project: { section: 's', module: 'm' }, env: { API_KEY: 'tajne', PORT: '1' } });
      assert.deepEqual(seen, [{ section: 's', module: 'm' }]);
      assert.equal(proc.main, 'b-server.js', 'bez index.js první .js v kořeni abecedně');
      assert.equal(proc.listening, true);
      const env = JSON.parse((await dev.request({ path: '/env' })).body);
      assert.deepEqual(env, { PORT: String(proc.port), NODE_ENV: 'development', API_KEY: 'tajne', cwd: fs.realpathSync(projectDir) });
      await dev.stop();
      assert.ok(fs.existsSync(path.join(projectDir, 'b-server.js')), 'adresář projektu se nemaže');
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  test('požadavky: tělo a hlavičky, 201, base64, zkrácení, set-cookie, timeout, ECONNREFUSED, validace', async () => {
    const dev = manager({ maxBodyBytes: 1000 });
    const proc = await dev.start({ files: [{ name: 'server.mjs', content: SERVER }] });
    assert.equal(proc.listening, true);

    const echo = await dev.request({
      method: 'post',
      path: '/echo',
      headers: { 'Content-Type': 'application/json', Host: 'evil.example', 'Content-Length': '999' },
      body: '{"text":"Ahoj"}',
    });
    assert.equal(echo.status, 201);
    assert.equal(echo.statusText, 'Created');
    assert.equal(echo.headers['x-method'], 'POST');
    assert.deepEqual(JSON.parse(echo.body), {
      method: 'POST', body: '{"text":"Ahoj"}', type: 'application/json', host: `127.0.0.1:${proc.port}`, length: '15',
    });

    const png = await dev.request({ path: '/png' });
    assert.equal(png.bodyEncoding, 'base64');
    assert.deepEqual([...Buffer.from(png.body, 'base64')], [0x89, 0x50, 0x4e, 0x47, 0xff, 0x00]);
    assert.equal((await dev.request({ path: '/raw-text' })).bodyEncoding, 'utf8');
    assert.equal((await dev.request({ path: '/raw-binary' })).bodyEncoding, 'base64');

    const big = await dev.request({ path: '/big' });
    assert.equal(big.bodyTruncated, true);
    assert.equal(big.body.length, 1000);

    const cookies = await dev.request({ path: '/cookies' });
    assert.equal(cookies.headers['set-cookie'], 'a=1\nb=2');
    assert.equal(cookies.headers['x-list'], 'jedna, dva');

    const head = await dev.request({ method: 'HEAD', path: '/' });
    assert.equal(head.status, 200);
    assert.equal(head.body, '');

    const hang = await dev.request({ path: '/hang', timeoutMs: 200 });
    assert.equal(hang.ok, false);
    assert.equal(hang.code, 'ETIMEDOUT');
    assert.match(hang.error, /neodpověděl do 200 ms/);
    assert.ok(hang.durationMs >= 150);

    await assert.rejects(dev.request({ method: 'TRACE', path: '/' }), InputError);
    await assert.rejects(dev.request({ path: 'http://127.0.0.1/' }), InputError);
    await assert.rejects(dev.request({ path: '//evil.example/' }), InputError);
    await assert.rejects(dev.request({ path: '/a b' }), InputError);
    await assert.rejects(dev.request({ path: '/', headers: { x: 1 } }), InputError);
    await assert.rejects(dev.request({ path: '/', body: { a: 1 } }), InputError);
    await assert.rejects(dev.request({ path: '/', timeoutMs: -1 }), InputError);
    const badHeader = await dev.request({ path: '/', headers: { 'bad header': 'x' } });
    assert.equal(badHeader.ok, false);
    await dev.stop();
  });

  test('požadavek na proces, který běží, ale neposlouchá: ok false, ECONNREFUSED', async () => {
    const dev = manager({ startWaitMs: 300 });
    const started = Date.now();
    const proc = await dev.start({ files: [{ name: 'index.js', content: 'setInterval(() => {}, 1000); console.log("čekám")' }] });
    assert.ok(Date.now() - started >= 250, 'start počká na limit');
    assert.equal(proc.status, 'running');
    assert.equal(proc.listening, false);
    const result = await dev.request({ path: '/' });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'ECONNREFUSED');
    assert.equal(result.error, `Spojení odmítnuto — server na portu ${proc.port} neposlouchá.`);
    await dev.stop();
  });

  test('server, který začne poslouchat později: listening se doplní', async () => {
    const dev = manager({ startWaitMs: 100 });
    const late = `import { createServer } from 'node:http';
setTimeout(() => createServer((q, s) => s.end('pozdě')).listen(Number(process.env.PORT)), 400);`;
    const proc = await dev.start({ files: [{ name: 'index.mjs', content: late }] });
    assert.equal(proc.listening, false);
    await waitFor(() => dev.process().listening);
    assert.equal((await dev.request({ path: '/' })).body, 'pozdě');
    await dev.stop();
  });

  test('stop: SIGTERM celé skupině, po limitu SIGKILL (i procesy, které SIGTERM ignorují)', async () => {
    const dev = manager({ killGraceMs: 400, startWaitMs: 200 });
    const stubborn = `
import { spawn } from 'node:child_process';
process.on('SIGTERM', () => console.log('SIGTERM ignoruju'));
const child = spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => {}); setInterval(() => {}, 1000)'], { stdio: 'ignore' });
console.log('child ' + child.pid);
setInterval(() => {}, 1000);
`;
    await dev.start({ files: [{ name: 'index.mjs', content: stubborn }] });
    const text = await waitFor(() => dev.output(0).chunks.map((c) => c.text).join('').match(/child (\d+)/));
    const childPid = Number(text[1]);
    const pid = dev.pid();
    await sleep(100);
    assert.equal(isAlive(pid), true);
    assert.equal(isAlive(childPid), true);

    const started = Date.now();
    assert.equal(await dev.stop(), true);
    assert.ok(Date.now() - started >= 350, 'SIGKILL až po limitu');
    assert.equal(isAlive(pid), false);
    assert.equal(isAlive(childPid), false);
    assert.equal(dev.process().signal, 'SIGKILL');
    assert.ok(dev.output(0).chunks.some((c) => c.text.includes('SIGTERM ignoruju')));
  });

  test('po skončení hlavního procesu nezůstanou jeho potomci', async () => {
    const dev = manager();
    const script = `
import { spawn } from 'node:child_process';
const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
child.unref();
console.log('child ' + child.pid);
`;
    const proc = await dev.start({ files: [{ name: 'index.mjs', content: script }] });
    assert.equal(proc.status, 'exited');
    const childPid = Number(dev.output(0).chunks.map((c) => c.text).join('').match(/child (\d+)/)[1]);
    await waitFor(() => !isAlive(childPid), 2000);
  });

  test('nový start zastaví předchozí proces', async () => {
    const dev = manager();
    const first = await dev.start({ files: [{ name: 'index.mjs', content: SERVER }] });
    const firstPid = dev.pid();
    const second = await dev.start({ files: [{ name: 'index.mjs', content: SERVER }] });
    assert.notEqual(second.id, first.id);
    assert.equal(isAlive(firstPid), false);
    assert.equal(second.listening, true);
    assert.ok(dev.output(0).chunks.every((c) => c.text !== 'Proces zastaven.'), 'výstup patří jen novému procesu');
    await dev.stop();
  });

  test('souběžné starty spustí nakonec jediný proces', async () => {
    const dev = manager();
    const files = [{ name: 'index.mjs', content: SERVER }];
    const results = await Promise.all([dev.start({ files }), dev.start({ files }), dev.start({ files })]);
    assert.deepEqual(results.map((r) => r.id), ['p-1', 'p-2', 'p-3']);
    assert.equal(dev.process().id, 'p-3');
    assert.equal(dev.process().status, 'running');
    await dev.stop();
  });

  test('nečinnost: zastaví po limitu, request ji prodlouží, output ne', async () => {
    const dev = manager({ idleMs: 500 });
    await dev.start({ files: [{ name: 'index.mjs', content: SERVER }] });
    await sleep(300);
    await dev.request({ path: '/' });
    await sleep(300);
    assert.equal(dev.process().status, 'running', 'request nečinnost prodloužil');
    dev.output(0);
    await waitFor(() => dev.process().status === 'exited', 2000);
    assert.ok(dev.output(0).chunks.some((c) => c.stream === 'system' && /^Zastaveno po 1 s nečinnosti\.$/.test(c.text)));
  });

  test('close zabije proces hned a smaže dočasný adresář', async () => {
    const dev = manager();
    await dev.start({ files: [{ name: 'index.mjs', content: SERVER }] });
    const pid = dev.pid();
    const dir = fs.readlinkSync(`/proc/${pid}/cwd`);
    dev.close();
    await waitFor(() => !isAlive(pid), 1000);
    assert.equal(fs.existsSync(dir), false);
    await assert.rejects(dev.start({ files: [{ name: 'index.mjs', content: SERVER }] }), (error) => error.status === 409);
  });

  test('server na ::1: url i požadavek jdou na IPv6', async (t) => {
    const probe = http.createServer();
    const ipv6 = await new Promise((resolve) => {
      probe.once('error', () => resolve(false));
      probe.listen(0, '::1', () => probe.close(() => resolve(true)));
    });
    if (!ipv6) {
      t.skip('IPv6 loopback není k dispozici');
      return;
    }
    const dev = manager();
    const script = `import { createServer } from 'node:http';
createServer((q, s) => s.end('šest')).listen(Number(process.env.PORT), '::1');`;
    const proc = await dev.start({ files: [{ name: 'index.mjs', content: script }] });
    assert.equal(proc.listening, true);
    assert.equal(proc.url, `http://[::1]:${proc.port}`);
    assert.equal((await dev.request({ path: '/' })).body, 'šest');
    await dev.stop();
  });
});
