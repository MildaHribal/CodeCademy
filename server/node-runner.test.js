import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { InputError } from './errors.js';
import { runNodeFile, runNodeTests } from './node-runner.js';

const HTTP_SERVER = `
import http from 'node:http';
http.createServer((req, res) => res.end('pong ' + req.url)).listen(process.env.PORT);
console.log('server běží');
`;

/** Vrátí true, když na portu něco přijímá spojení. */
function isListening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
  });
}

function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

describe('runNodeTests', () => {
  let scratch;

  beforeEach(() => {
    scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-runner-test-'));
  });

  afterEach(() => {
    fs.rmSync(scratch, { recursive: true, force: true });
  });

  test('test projde a selže s hláškou z assertu', async () => {
    const result = await runNodeTests({
      files: [{ name: 'math.js', content: 'export const add = (a, b) => a + b;' }],
      hints: [
        { text: 'sčítá', test: "const { add } = await helpers.importFile('math.js'); assert.equal(add(1, 2), 3);" },
        { text: 'špatně', test: "const { add } = await helpers.importFile('math.js'); assert.equal(add(1, 2), 4);" },
        { text: 'vlastní', test: "assert.fail('Chybí funkce multiply');" },
      ],
    });
    assert.equal(result.ok, false);
    assert.deepEqual(result.results[0], { index: 0, pass: true });
    assert.deepEqual(result.results[1], {
      index: 1,
      pass: false,
      error: 'Očekávám 4, ale kód vrátil 3',
      errorName: 'AssertionError',
      operator: 'strictEqual',
      actual: '3',
      expected: '4',
      generatedMessage: true,
    });
    assert.deepEqual(result.results[2], { index: 2, pass: false, error: 'Chybí funkce multiply', errorName: 'AssertionError' });
    assert.deepEqual(result.errors, []);
    assert.equal(result.syntaxError, null);
  });

  test('actual a expected i s vlastní zprávou, diff u deepEqual, errorName u jiných chyb', async () => {
    const result = await runNodeTests({
      files: [{ name: 'cart.js', content: 'export const cart = () => ({ items: [{ price: 5 }], total: 5 });' }],
      hints: [
        { text: 'zpráva', test: "assert.equal(2, 3, 'sum([1, 2]) má vrátit 3');" },
        { text: 'deep', test: "const { cart } = await helpers.importFile('cart.js'); assert.deepEqual(cart(), { items: [{ price: 6 }], total: 5 }, 'košík');" },
        { text: 'ok', test: 'assert.ok(0);' },
        { text: 'typeerror', test: 'null.x;' },
      ],
    });
    assert.deepEqual(result.results[0], { index: 0, pass: false, error: 'sum([1, 2]) má vrátit 3', errorName: 'AssertionError', operator: 'strictEqual', actual: '2', expected: '3', generatedMessage: false });
    assert.deepEqual(result.results[1].diff, [{ path: 'items[0].price', actual: '5', expected: '6' }]);
    assert.equal(result.results[1].error, 'košík');
    assert.deepEqual([result.results[2].error, result.results[2].actual, result.results[2].expected], ['Očekávám pravdivou hodnotu, ale kód vrátil 0', '0', 'true']);
    assert.equal(result.results[3].errorName, 'TypeError');
    assert.equal(result.results[3].actual, undefined);
  });

  test('kód, který nejde naparsovat, se nespustí (syntaxError); projekt s cwd se nekontroluje', async () => {
    const started = Date.now();
    const result = await runNodeTests({
      files: [{ name: 'index.js', content: 'ok();' }, { name: 'server.js', content: "import http from 'node:http';\n\nhttp.createServer((req, res) => {\n  res.end('x';\n});" }],
      hints: [{ text: 'a', test: 'assert.ok(true);' }, { text: 'b', test: 'assert.ok(true);' }],
    });
    assert.deepEqual(result, {
      ok: false,
      results: [
        { index: 0, pass: false, skipped: true, error: 'Neověřeno — kód nejde spustit' },
        { index: 1, pass: false, skipped: true, error: 'Neověřeno — kód nejde spustit' },
      ],
      logs: [],
      errors: ["SyntaxError: Unexpected token ';' (server.js:4)"],
      syntaxError: { file: 'server.js', line: 4, column: 14, message: "Unexpected token ';'" },
    });
    assert.ok(Date.now() - started < 500, 'žádný proces se nemá spouštět');

    const project = path.join(scratch, 'projekt-rozbity');
    fs.mkdirSync(project);
    fs.writeFileSync(path.join(project, 'broken.js'), 'const = 1;');
    const inProject = await runNodeTests({ cwd: project, hints: [{ text: 'a', test: 'assert.ok(true);' }] });
    assert.equal(inProject.ok, true);
    assert.equal(inProject.syntaxError, null);
  });

  test('všechny testy prošly → ok, globály files a helpers fungují', async () => {
    const result = await runNodeTests({
      files: [
        { name: 'index.js', content: '// komentář\nconst x = 1; /* další */' },
        { name: 'lib/util.js', content: "export { value } from './value.js';" },
        { name: 'lib/value.js', content: 'export const value = 42;' },
      ],
      hints: [
        { text: 'files', test: "assert.equal(files['index.js'].startsWith('// komentář'), true);" },
        { text: 'strip', test: "assert.equal(helpers.normalize(helpers.stripComments(files['index.js'], 'js')), 'const x = 1;');" },
        { text: 'import', test: "const m = await helpers.importFile('lib/util.js'); assert.equal(m.value, 42);" },
        { text: 'dir', test: "const fs = await import('node:fs'); assert.equal(fs.existsSync(helpers.dir + '/index.js'), true); assert.equal(process.cwd(), helpers.dir);" },
        { text: 'waitFor', test: 'let n = 0; const v = await helpers.waitFor(() => ++n >= 3 && n); assert.equal(v, 3); await helpers.wait(1);' },
        { text: 'fetch', test: "assert.equal(typeof fetch, 'function');" },
      ],
    });
    assert.deepEqual(result.results.filter((r) => !r.pass), []);
    assert.equal(result.ok, true);
  });

  test('každý test běží v čerstvém procesu', async () => {
    const result = await runNodeTests({
      files: [],
      hints: [
        { text: 'a', test: 'globalThis.leak = 1;' },
        { text: 'b', test: "assert.equal(typeof globalThis.leak, 'undefined');" },
      ],
    });
    assert.equal(result.ok, true);
  });

  test('nekonečná smyčka skončí po limitu', async () => {
    const started = Date.now();
    const result = await runNodeTests({
      files: [],
      hints: [{ text: 'smyčka', test: 'while (true) {}' }],
      timeoutMs: 500,
    });
    const elapsed = Date.now() - started;
    assert.equal(result.results[0].pass, false);
    assert.match(result.results[0].error, /nedoběhl včas/);
    assert.ok(elapsed >= 500 && elapsed < 3000, `trvalo ${elapsed} ms`);
  });

  test('syntaktická chyba v testu a process.exit v testu jsou selhání', async () => {
    const result = await runNodeTests({
      files: [],
      hints: [
        { text: 'syntax', test: 'assert.equal(1, ' },
        { text: 'exit', test: 'process.exit(3);' },
        { text: 'async throw', test: "setTimeout(() => { throw new Error('bum'); }, 10); await helpers.wait(500);" },
      ],
    });
    assert.match(result.results[0].error, /Test nejde spustit/);
    assert.match(result.results[1].error, /skončil předčasně \(kód 3\)/);
    assert.equal(result.results[2].error, 'bum');
  });

  test('helpers.run vrátí výstup a naplní logs', async () => {
    const result = await runNodeTests({
      files: [{ name: 'hello.js', content: "console.log('Ahoj'); console.error('pozor'); process.exitCode = 2;" }],
      hints: [
        {
          text: 'run',
          test: `
            const r = await helpers.run('node hello.js');
            assert.deepEqual(r, { code: 2, stdout: 'Ahoj\\n', stderr: 'pozor\\n' });
            assert.deepEqual(logs, [{ level: 'log', text: 'Ahoj' }, { level: 'error', text: 'pozor' }]);
            const echo = await helpers.run('cat', { input: 'vstup' });
            assert.equal(echo.stdout, 'vstup');
          `,
        },
        {
          text: 'timeout příkazu',
          test: `
            const r = await helpers.run('sleep 20', { timeoutMs: 300 });
            assert.equal(r.code, null);
            assert.equal(r.timedOut, true);
          `,
        },
      ],
    });
    assert.deepEqual(result.results.filter((r) => !r.pass), []);
    assert.deepEqual(result.logs, [
      { level: 'log', text: 'Ahoj' },
      { level: 'error', text: 'pozor' },
      { level: 'log', text: 'vstup' },
    ]);
  });

  test('helpers.startServer + fetch, server se po testu zastaví sám', async () => {
    const portFile = path.join(scratch, 'port.txt');
    const result = await runNodeTests({
      files: [{ name: 'server.js', content: HTTP_SERVER }],
      hints: [{
        text: 'server',
        test: `
          const server = await helpers.startServer('server.js');
          (await import('node:fs')).writeFileSync(${JSON.stringify(portFile)}, String(server.port));
          const res = await fetch(server.url + '/ping');
          assert.equal(await res.text(), 'pong /ping');
          await helpers.waitFor(() => server.output().includes('server běží'));
        `,
      }],
    });
    assert.deepEqual(result.results, [{ index: 0, pass: true }]);
    assert.deepEqual(result.logs, [{ level: 'log', text: 'server běží' }]);
    const port = Number(fs.readFileSync(portFile, 'utf8'));
    assert.equal(await isListening(port), false);
  });

  test('startServer.stop() a chyba, když server nenaběhne', async () => {
    const result = await runNodeTests({
      files: [
        { name: 'server.js', content: HTTP_SERVER },
        { name: 'broken.js', content: "throw new Error('rozbitý server');" },
      ],
      hints: [
        { text: 'stop', test: "const s = await helpers.startServer('server.js'); await s.stop(); await assert.rejects(fetch(s.url));" },
        { text: 'broken', test: "await assert.rejects(helpers.startServer('broken.js'), /skončil dřív.*rozbitý server/s);" },
      ],
    });
    assert.deepEqual(result.results.filter((r) => !r.pass), []);
  });

  test('timeout zabije celou skupinu procesů včetně serverů a příkazů na pozadí', async () => {
    const infoFile = path.join(scratch, 'info.json');
    const result = await runNodeTests({
      files: [{ name: 'server.js', content: HTTP_SERVER }],
      hints: [{
        text: 'zasekne se',
        test: `
          const server = await helpers.startServer('server.js');
          const bg = await helpers.run('sleep 30 & echo $!');
          (await import('node:fs')).writeFileSync(${JSON.stringify(infoFile)},
            JSON.stringify({ port: server.port, sleepPid: Number(bg.stdout.trim()) }));
          while (true) {}
        `,
      }],
      timeoutMs: 2000,
    });
    assert.match(result.results[0].error, /nedoběhl včas/);
    const { port, sleepPid } = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
    assert.equal(await isListening(port), false);
    assert.equal(processAlive(sleepPid), false);
  });

  test('dočasný adresář se po běhu smaže', async () => {
    const dirFile = path.join(scratch, 'dir.txt');
    await runNodeTests({
      files: [{ name: 'a.txt', content: 'x' }],
      hints: [{ text: 'dir', test: `(await import('node:fs')).writeFileSync(${JSON.stringify(dirFile)}, helpers.dir);` }],
    });
    const dir = fs.readFileSync(dirFile, 'utf8');
    assert.ok(dir.startsWith(fs.realpathSync(os.tmpdir())));
    assert.equal(fs.existsSync(dir), false);
  });

  test('režim cwd čte soubory z disku a nic nesmaže ani nepřepíše', async () => {
    const project = path.join(scratch, 'projekt');
    fs.mkdirSync(path.join(project, 'src'), { recursive: true });
    fs.writeFileSync(path.join(project, 'src', 'main.js'), 'export default 7;');
    fs.writeFileSync(path.join(project, 'README.md'), 'moje poznámky');

    const result = await runNodeTests({
      cwd: project,
      files: [{ name: 'README.md', content: 'PŘEPSÁNO' }, { name: 'novy.js', content: '' }],
      hints: [
        { text: 'disk', test: "assert.equal(files['README.md'], 'moje poznámky'); assert.equal(files['novy.js'], undefined);" },
        { text: 'import', test: "const m = await helpers.importFile('src/main.js'); assert.equal(m.default, 7);" },
        { text: 'run', test: "const r = await helpers.run('ls'); assert.match(r.stdout, /README.md/);" },
      ],
    });
    assert.deepEqual(result.results.filter((r) => !r.pass), []);
    assert.deepEqual(fs.readdirSync(project).sort(), ['README.md', 'src']);
    assert.equal(fs.readFileSync(path.join(project, 'README.md'), 'utf8'), 'moje poznámky');
    assert.equal(fs.readFileSync(path.join(project, 'src', 'main.js'), 'utf8'), 'export default 7;');
  });

  test('jméno souboru mimo adresář je odmítnuté', async () => {
    await assert.rejects(runNodeTests({ files: [{ name: '../ven.js', content: '' }], hints: [] }), InputError);
    await assert.rejects(runNodeTests({ files: [{ name: '/etc/x.js', content: '' }], hints: [] }), InputError);
    await assert.rejects(runNodeTests({ files: [], hints: [{ text: 'bez testu' }] }), InputError);
    // Kolize jmen (soubor i adresář stejného jména) je chyba vstupu (400), ne chyba serveru.
    await assert.rejects(
      runNodeTests({ files: [{ name: 'a', content: '' }, { name: 'a/b.js', content: '' }], hints: [] }),
      InputError,
    );
  });
});

describe('runNodeFile', () => {
  test('vrátí výstup a kód', async () => {
    const result = await runNodeFile({
      files: [
        { name: 'main.js', content: "import { name } from './name.js'; console.log('Ahoj ' + name); console.error('chyba'); process.exitCode = 1;" },
        { name: 'name.js', content: "export const name = 'Karle';" },
      ],
      main: 'main.js',
    });
    assert.deepEqual(result, { code: 1, stdout: 'Ahoj Karle\n', stderr: 'chyba\n', timedOut: false });
  });

  test('nekonečná smyčka skončí s timedOut', async () => {
    const started = Date.now();
    const result = await runNodeFile({ files: [{ name: 'loop.js', content: 'while (true) {}' }], main: 'loop.js', timeoutMs: 400 });
    assert.equal(result.timedOut, true);
    assert.equal(result.code, null);
    assert.ok(Date.now() - started < 2500);
  });

  test('chybějící nebo neplatný hlavní soubor', async () => {
    await assert.rejects(runNodeFile({ files: [{ name: 'a.js', content: '' }], main: 'b.js' }), InputError);
    await assert.rejects(runNodeFile({ files: [{ name: 'a.js', content: '' }], main: '../a.js' }), InputError);
  });
});

describe('úklid, když server skončí uprostřed testu', () => {
  let scratch;

  beforeEach(() => {
    scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-orphan-test-'));
  });

  afterEach(() => {
    fs.rmSync(scratch, { recursive: true, force: true });
  });

  /** Počká, až soubor existuje a má obsah; vrátí ho. */
  async function waitForFile(file, timeoutMs = 10000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (fs.existsSync(file) && fs.readFileSync(file, 'utf8')) return fs.readFileSync(file, 'utf8');
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`soubor ${file} nevznikl`);
  }

  async function waitForExit(pids, timeoutMs = 5000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && pids.some(processAlive)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return pids.filter(processAlive);
  }

  test('SIGKILL serveru: test čekající na svůj server skončí i s ním', async (t) => {
    const infoFile = path.join(scratch, 'info.json');
    const script = `
      import { runNodeTests } from ${JSON.stringify(path.join(import.meta.dirname, 'node-runner.js'))};
      await runNodeTests({
        files: [{ name: 'server.js', content: ${JSON.stringify(HTTP_SERVER)} }],
        hints: [{ text: 'čeká', test: ${JSON.stringify(`
          const server = await helpers.startServer('server.js');
          const bg = await helpers.run('sleep 30 & echo $!');
          (await import('node:fs')).writeFileSync(${JSON.stringify(infoFile)},
            JSON.stringify({ harness: process.pid, port: server.port, sleepPid: Number(bg.stdout.trim()) }));
          await helpers.wait(60000);
        `)} }],
        timeoutMs: 60000,
      });
    `;
    const parent = spawn(process.execPath, ['--input-type=module', '-e', script], { stdio: 'ignore' });
    t.after(() => parent.kill('SIGKILL'));

    const { harness, port, sleepPid } = JSON.parse(await waitForFile(infoFile));
    t.after(() => {
      try { process.kill(-harness, 'SIGKILL'); } catch { /* skupina už neběží — tak to má být */ }
    });
    parent.kill('SIGKILL');

    assert.deepEqual(await waitForExit([harness]), [], 'harness po smrti rodiče skončil');
    assert.equal(await isListening(port), false, 'server spuštěný testem skončil');
    assert.deepEqual(await waitForExit([sleepPid]), [], 'příkaz na pozadí ze skupiny testu skončil');
  });

  test('SIGHUP serveru (zavřený terminál) zabije i test se zaseknutou smyčkou', async (t) => {
    const pidFile = path.join(scratch, 'pid.txt');
    const server = spawn(process.execPath, [path.join(import.meta.dirname, 'index.js')], {
      env: { ...process.env, PORT: '0' },
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    t.after(() => server.kill('SIGKILL'));
    const port = await new Promise((resolve, reject) => {
      let output = '';
      server.stdout.setEncoding('utf8');
      server.stdout.on('data', (chunk) => {
        output += chunk;
        const match = output.match(/127\.0\.0\.1:(\d+)/);
        if (match) resolve(Number(match[1]));
      });
      server.once('exit', () => reject(new Error(`server skončil: ${output}`)));
    });

    fetch(`http://127.0.0.1:${port}/api/run-node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [],
        hints: [{ text: 'smyčka', test: `(await import('node:fs')).writeFileSync(${JSON.stringify(pidFile)}, String(process.pid)); while (true) {}` }],
        timeoutMs: 60000,
      }),
    }).catch(() => {}); // odpověď nepřijde, server skončí

    const harness = Number(await waitForFile(pidFile));
    server.kill('SIGHUP');
    const survivors = await waitForExit([harness]);
    for (const pid of survivors) process.kill(pid, 'SIGKILL');
    assert.deepEqual(survivors, [], 'test se smyčkou po SIGHUP serveru neběží');
  });
});
