// Testy prohlížečového runneru v Playwrightu: sestavená stránka runner.html + statický server.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { BROWSER_ARGS } from './lib/runner-pool.js';
import { sendJson } from './lib/static-app.js';
import { startRunnerServer } from './lib/test-setup.js';

let server;
let browser;
let page;
const nodeRequests = [];

/** Spustí runTests ve stránce runneru. */
function run(request) {
  return page.evaluate((req) => window.akademieRunner.runTests(req), request);
}

const html = (body, head = '<link rel="stylesheet" href="styles.css">') =>
  `<!DOCTYPE html>\n<html lang="cs">\n<head>\n<meta charset="utf-8">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>`;

before(async () => {
  server = await startRunnerServer({
    // Náhrada POST /api/run-node: vrátí výsledek podle počtu testů a zapamatuje si požadavek.
    api(req, res, body, url) {
      if (req.method !== 'POST' || url.pathname !== '/api/run-node') return false;
      nodeRequests.push(body);
      sendJson(res, 200, { ok: true, results: body.hints.map((_, index) => ({ index, pass: true })), logs: [{ level: 'log', text: 'ze serveru' }], errors: [] });
      return true;
    },
  });
  browser = await chromium.launch({ args: BROWSER_ARGS });
  page = await browser.newPage();
  await page.goto(`${server.baseUrl}/runner.html`);
  await page.waitForFunction(() => window.akademieRunnerReady === true);
});

after(async () => {
  await browser?.close();
  await server?.close();
});

describe('runtime dom', () => {
  const files = [
    { name: 'index.html', content: html('<nav><a href="#">Domů</a></nav>') },
    { name: 'styles.css', content: 'nav { display: flex; }' },
  ];

  test('test projde i selže podle stránky', async () => {
    const result = await run({
      runtime: 'dom',
      files,
      hints: [
        { text: 'flex', test: "assert.equal(getComputedStyle(document.querySelector('nav')).display, 'flex');" },
        { text: 'grid', test: "assert.equal(getComputedStyle(document.querySelector('nav')).display, 'grid');" },
        { text: 'files', test: "assert.match(files['styles.css'], /nav\\s*\\{/);" },
        { text: 'výchozí velikost', test: 'assert.equal(innerWidth, 1024); assert.equal(innerHeight, 768);' },
      ],
    });
    assert.equal(result.ok, false);
    assert.deepEqual(result.results.map((r) => r.pass), [true, false, true, true]);
    assert.match(result.results[1].error, /Expected values to be strictly equal:\n\n'flex' !== 'grid'/);
  });

  test('helpers.cssRule vrací styl pravidla bez podmínek', async () => {
    const result = await run({
      runtime: 'dom',
      files: [
        { name: 'index.html', content: html('<nav></nav>') },
        { name: 'styles.css', content: 'nav>a , .x { color: red; }\nnav { gap: 1rem; }\n@media (max-width: 600px) { nav { gap: 2rem; } }\nnav { gap: 3rem; }' },
      ],
      hints: [
        { text: 'poslední bez podmínek', test: "assert.equal(helpers.cssRule('nav').gap, '3rem');" },
        { text: 'normalizace bílých znaků', test: "assert.equal(helpers.cssRule('nav > a,.x').color, 'red');" },
        { text: 'neexistující', test: "assert.equal(helpers.cssRule('main'), null);" },
      ],
    });
    assert.deepEqual(result.results, [{ index: 0, pass: true }, { index: 1, pass: true }, { index: 2, pass: true }]);
  });

  test('helpers.cssRules najde pravidla v @media, @supports, @layer, @container i vnořená', async () => {
    const css = `
      .card { color: black; }
      @media (max-width: 600px) { .card { color: red; } }
      @supports (display: grid) { @media (min-width: 900px) { .card { color: blue; } } }
      @layer base { .card { color: green; } }
      @container side (min-width: 400px) { .card { color: gray; } }
      nav { a { color: navy; } & > .item { color: teal; } }
    `;
    const result = await run({
      runtime: 'dom',
      files: [{ name: 'index.html', content: html('<div class="card"></div>') }, { name: 'styles.css', content: css }],
      hints: [
        {
          text: 'podmínky',
          test: `
            const rules = helpers.cssRules('.card');
            assert.deepEqual(rules.map((r) => r.style.color), ['black', 'red', 'blue', 'green', 'gray']);
            assert.deepEqual(rules.map((r) => r.conditions), [[], ['(max-width: 600px)'], ['(display: grid)', '(min-width: 900px)'], [], ['side (min-width: 400px)']]);
            assert.equal(helpers.cssRule('.card').color, 'green');
          `,
        },
        {
          text: 'vnořená pravidla',
          test: `
            assert.equal(helpers.cssRule('nav a').color, 'navy');
            assert.equal(helpers.cssRule('nav>.item').color, 'teal');
            assert.equal(helpers.cssRules('& > .item').length, 1);
          `,
        },
      ],
    });
    assert.deepEqual(result.results, [{ index: 0, pass: true }, { index: 1, pass: true }]);
  });

  test('helpers.click, type, press a submit', async () => {
    const body = `
      <button id="plus">+</button><output id="count">0</output>
      <form id="form"><input id="name" required><input type="checkbox" id="agree"></form>
      <p id="log"></p>
      <script src="script.js"></script>`;
    const script = `
      let count = 0;
      document.querySelector('#plus').addEventListener('click', () => { count++; document.querySelector('#count').textContent = count; });
      const events = [];
      const input = document.querySelector('#name');
      input.addEventListener('input', () => events.push('input:' + input.value));
      input.addEventListener('change', () => events.push('change'));
      input.addEventListener('keydown', (e) => events.push('keydown:' + e.key));
      document.querySelector('#form').addEventListener('submit', (e) => { e.preventDefault(); events.push('submit'); });
      window.events = events;`;
    const result = await run({
      runtime: 'dom',
      files: [{ name: 'index.html', content: html(body, '') }, { name: 'script.js', content: script }],
      hints: [
        {
          text: 'interakce',
          test: `
            await helpers.click(document.querySelector('#plus'));
            await helpers.click(document.querySelector('#plus'));
            assert.equal(document.querySelector('#count').textContent, '2');
            await helpers.click(document.querySelector('#agree'));
            assert.equal(document.querySelector('#agree').checked, true);
            await helpers.submit(document.querySelector('#form'));
            assert.deepEqual(events, [], 'prázdné povinné pole formulář neodešle');
            await helpers.type(document.querySelector('#name'), 'Eva');
            await helpers.press(document.querySelector('#name'), 'Enter');
            await helpers.submit(document.querySelector('#form'));
            assert.deepEqual(events, ['input:E', 'input:Ev', 'input:Eva', 'change', 'keydown:Enter', 'submit']);
          `,
        },
        { text: 'špatný prvek', test: "await helpers.click(document.querySelector('#nic'));" },
      ],
    });
    assert.equal(result.results[0].pass, true, result.results[0].error);
    assert.match(result.results[1].error, /helpers\.click: čekal jsem prvek stránky, dostal jsem null/);
  });

  test('test startuje až s hotovým rozvržením (i při souběžných bězích)', async () => {
    // Iframe v odděleném procesu se nejdřív rozvrhne s nulovou šířkou; test to nesmí vidět.
    const request = {
      runtime: 'dom',
      files: [
        { name: 'index.html', content: html('<ul class="row"><li>A</li><li>B</li></ul>') },
        { name: 'styles.css', content: 'body { margin: 0; } .row { display: flex; margin: 0; padding: 0; } .row li { flex: 1; list-style: none; }' },
      ],
      hints: [{
        text: 'šířky',
        test: `
          assert.equal(document.body.getBoundingClientRect().width, document.documentElement.clientWidth);
          const [a, b] = [...document.querySelectorAll('li')].map((li) => li.getBoundingClientRect().width);
          assert.ok(a > 400 && a === b, 'položky mají šířky ' + a + ' a ' + b);
          await helpers.resize(600);
          assert.equal(document.querySelector('li').getBoundingClientRect().width, document.documentElement.clientWidth / 2);
        `,
      }],
    };
    const context = await browser.newContext();
    try {
      const pages = await Promise.all(Array.from({ length: 4 }, async () => {
        const extra = await context.newPage();
        await extra.goto(`${server.baseUrl}/runner.html`);
        await extra.waitForFunction(() => window.akademieRunnerReady === true);
        return extra;
      }));
      const results = await Promise.all(pages.flatMap((p) =>
        Array.from({ length: 6 }, () => p.evaluate((req) => window.akademieRunner.runTests(req), request))));
      for (const result of results) assert.equal(result.results[0].pass, true, result.results[0].error);
    } finally {
      await context.close();
    }
  });

  test('helpers.resize změní výsledek media query', async () => {
    const result = await run({
      runtime: 'dom',
      files: [
        { name: 'index.html', content: html('<main></main>') },
        { name: 'styles.css', content: 'main { display: grid; }\n@media (max-width: 600px) { main { display: block; } }' },
      ],
      hints: [
        {
          text: 'resize',
          test: `
            const main = document.querySelector('main');
            assert.equal(getComputedStyle(main).display, 'grid');
            await helpers.resize(500);
            assert.equal(innerWidth, 500);
            assert.equal(innerHeight, 768);
            assert.equal(getComputedStyle(main).display, 'block');
            assert.equal(matchMedia('(max-width: 600px)').matches, true);
            await helpers.resize(800, 400);
            assert.equal(innerHeight, 400);
            assert.equal(getComputedStyle(main).display, 'grid');
          `,
        },
      ],
    });
    assert.equal(result.results[0].pass, true, result.results[0].error);
  });

  test('helpers.importFile s relativním importem a sdílenou instancí se stránkou', async () => {
    const result = await run({
      runtime: 'dom',
      files: [
        { name: 'index.html', content: html('<p id="out"></p><script type="module" src="./js/app.js"></script>', '') },
        { name: 'js/app.js', content: "import { add } from './math.js';\nimport data from '../data.json' with { type: 'json' };\nexport const state = { sum: add(2, 3), name: data.name };\ndocument.querySelector('#out').textContent = state.sum;" },
        { name: 'js/math.js', content: 'export function add(a, b) { return a + b; }' },
        { name: 'data.json', content: '{ "name": "Akademie" }' },
      ],
      hints: [
        {
          text: 'import',
          test: `
            const math = await helpers.importFile('js/math.js');
            assert.equal(math.add(1, 2), 3);
            const app = await helpers.importFile('./js/app.js');
            assert.equal(document.querySelector('#out').textContent, '5');
            assert.deepEqual(app.state, { sum: 5, name: 'Akademie' });
            app.state.sum = 99;
            assert.equal((await helpers.importFile('js/app.js')).state.sum, 99);
          `,
        },
        { text: 'neexistující soubor', test: "await helpers.importFile('nic.js');" },
      ],
    });
    assert.equal(result.results[0].pass, true, result.results[0].error);
    assert.match(result.results[1].error, /soubor „nic\.js" v kroku není/);
    assert.deepEqual(result.errors, []);
  });

  test('bez index.html se připojí všechny CSS a JS; helpers.normalize, stripComments, waitFor', async () => {
    const result = await run({
      runtime: 'dom',
      files: [
        { name: 'styles.css', content: 'body { margin: 3px; } /* komentář */' },
        { name: 'script.js', content: "setTimeout(() => { document.body.dataset.ready = 'ano'; }, 100);" },
        { name: 'modul.js', content: "export const hodnota = 7;\ndocument.body.dataset.modul = 'ano';" },
      ],
      hints: [
        {
          text: 'pomocníci',
          test: `
            assert.equal(getComputedStyle(document.body).marginTop, '3px');
            assert.equal(document.body.dataset.modul, 'ano');
            assert.deepEqual(errors, []);
            assert.equal(helpers.normalize('  a \\n  b '), 'a b');
            assert.equal(helpers.stripComments(files['styles.css'], 'css').trim(), 'body { margin: 3px; }');
            assert.equal(await helpers.waitFor(() => document.body.dataset.ready), 'ano');
            await assert.rejects(helpers.waitFor(() => false, 50), /podmínka se nesplnila do 50 ms/);
          `,
        },
      ],
    });
    assert.equal(result.results[0].pass, true, result.results[0].error);
  });

  test('chyby uživatelova kódu mají soubor a řádek, logs se zachytí', async () => {
    const result = await run({
      runtime: 'dom',
      files: [
        { name: 'index.html', content: html('<script>\nconsole.warn("inline");\nundefinedInline();\n</script>\n<script src="script.js"></script>', '') },
        { name: 'script.js', content: "console.log('ahoj', { a: [1, 2] });\nconsole.error('pozor %d', 5);\n\nnope();" },
      ],
      hints: [{ text: 'logs v testu', test: "assert.equal(logs.length, 3); assert.equal(errors.length, 2);" }],
    });
    assert.equal(result.results[0].pass, true, result.results[0].error);
    assert.deepEqual(result.logs, [
      { level: 'warn', text: 'inline' },
      { level: 'log', text: 'ahoj { a: [ 1, 2 ] }' },
      { level: 'error', text: 'pozor 5' },
    ]);
    assert.deepEqual(result.errors, [
      'ReferenceError: undefinedInline is not defined (index.html:10)',
      'ReferenceError: nope is not defined (script.js:4)',
    ]);
  });

  test('syntaktická chyba v testu test shodí s hláškou', async () => {
    const result = await run({ runtime: 'dom', files, hints: [{ text: 'rozbitý', test: 'assert.equal(1, ' }] });
    assert.match(result.results[0].error, /Test nejde spustit: SyntaxError/);
  });

  test('bez testů se stránka jen načte a vrátí výpisy (živá ukázka)', async () => {
    const result = await run({ runtime: 'dom', files: [{ name: 'index.html', content: '<p>Ahoj</p>' }, { name: 'script.js', content: "console.log(document.querySelector('p').textContent); x.y;" }], hints: [] });
    assert.equal(result.ok, true);
    assert.deepEqual(result.logs, [{ level: 'log', text: 'Ahoj' }]);
    assert.deepEqual(result.errors, ['ReferenceError: x is not defined (script.js:1)']);
  });
});

describe('runtime js', () => {
  test('test vidí top-level let, const, function a class skriptu', async () => {
    const result = await run({
      runtime: 'js',
      files: [
        { name: 'helper.js', content: 'export const unused = 1;' },
        { name: 'script.js', content: "let counter = 1;\nconst name = 'Eva';\nfunction greet(who) { return 'Ahoj ' + who; }\nclass Box { constructor(v) { this.v = v; } }\nconsole.log(greet(name));\nconsole.info([1, 2, 3]);" },
      ],
      hints: [
        { text: 'globály', test: "assert.equal(counter, 1); assert.equal(greet(name), 'Ahoj Eva'); assert.equal(new Box(2).v, 2);" },
        { text: 'logs', test: "assert.deepEqual(logs.map((l) => l.text), ['Ahoj Eva', '[ 1, 2, 3 ]']);" },
        { text: 'importFile', test: "assert.equal((await helpers.importFile('helper.js')).unused, 1);" },
        { text: 'selže', test: 'assert.equal(counter, 2);' },
      ],
    });
    assert.deepEqual(result.results.map((r) => r.pass), [true, true, true, false]);
    assert.deepEqual(result.logs, [{ level: 'log', text: 'Ahoj Eva' }, { level: 'info', text: '[ 1, 2, 3 ]' }]);
    assert.deepEqual(result.errors, []);
  });

  test('chyba skriptu je v errors s řádkem', async () => {
    const result = await run({ runtime: 'js', files: [{ name: 'script.js', content: 'const a = 1;\na = 2;' }], hints: [{ text: 'x', test: 'assert.equal(a, 1);' }] });
    assert.deepEqual(result.errors, ['TypeError: Assignment to constant variable. (script.js:2)']);
    assert.equal(result.results[0].pass, true);
  });
});

describe('nekonečné smyčky', () => {
  test('while(true) v uživatelově kódu: test selže s hláškou o smyčce a stránka dál odpovídá', async () => {
    const started = Date.now();
    const result = await run({
      runtime: 'js',
      timeoutMs: 800,
      files: [{ name: 'script.js', content: 'let i = 0;\n\nwhile (true) {\n  i++;\n}' }],
      hints: [{ text: 'x', test: 'assert.ok(true);' }],
    });
    assert.equal(result.results[0].pass, false);
    assert.match(result.results[0].error, /Smyčka běží příliš dlouho — nekonečná smyčka\? \(řádek 3\)/);
    assert.deepEqual(result.errors, ['Error: Smyčka běží příliš dlouho — nekonečná smyčka? (řádek 3) (script.js:3)']);
    assert.ok(Date.now() - started < 5000);
    assert.equal(await page.evaluate(() => 1 + 1), 2);
  });

  test('stránka zaseknutá už při načítání: zbylé testy se přeskočí, nečeká se na každý zvlášť', async () => {
    const started = Date.now();
    const result = await run({
      runtime: 'js',
      timeoutMs: 800,
      files: [{ name: 'script.js', content: 'function average() {\n  while (true) {}\n}\naverage();' }],
      hints: [
        { text: 'a', test: 'assert.ok(true);' },
        { text: 'b', test: 'assert.ok(true);' },
        { text: 'c', test: 'assert.ok(true);' },
      ],
    });
    assert.equal(result.ok, false);
    assert.match(result.results[0].error, /nekonečná smyčka\? \(řádek 2\)/);
    assert.equal(result.results[0].skipped, undefined);
    assert.deepEqual(result.results.slice(1).map((r) => [r.index, r.pass, r.skipped]), [[1, false, true], [2, false, true]]);
    assert.match(result.results[1].error, /^Neověřeno/);
    assert.ok(Date.now() - started < 2500, `přeskočené testy se nemají spouštět (${Date.now() - started} ms)`);
  });

  test('smyčka až v testu: další testy běží normálně', async () => {
    const result = await run({
      runtime: 'js',
      timeoutMs: 500,
      files: [{ name: 'script.js', content: 'function spin() {\n  while (true) {}\n}\nfunction ok() { return 1; }' }],
      hints: [
        { text: 'smyčka', test: 'spin();' },
        { text: 'bez smyčky', test: 'assert.equal(ok(), 1);' },
      ],
    });
    assert.match(result.results[0].error, /nekonečná smyčka\? \(řádek 2\)/);
    assert.deepEqual(result.results[1], { index: 1, pass: true });
  });

  test('smyčka spuštěná až testem (klik) je taky zachycená', async () => {
    const result = await run({
      runtime: 'dom',
      timeoutMs: 800,
      files: [
        { name: 'index.html', content: html('<button>Klik</button><script src="script.js"></script>', '') },
        { name: 'script.js', content: "document.querySelector('button').onclick = () => { for (;;) {} };" },
      ],
      hints: [{ text: 'klik', test: "await helpers.click(document.querySelector('button'));" }],
    });
    assert.match(result.results[0].error, /nekonečná smyčka\? \(řádek 1\)/);
  });

  test('nekonečná smyčka v samotném testu: watchdog iframe zahodí a další běh funguje', async () => {
    const ticks = await page.evaluate(async () => {
      let count = 0;
      const timer = setInterval(() => count++, 50);
      const result = await window.akademieRunner.runTests({
        runtime: 'dom',
        timeoutMs: 500,
        files: [{ name: 'index.html', content: '<p>x</p>' }],
        hints: [{ text: 'smyčka', test: 'while (true) {}' }],
      });
      clearInterval(timer);
      return { result, count };
    });
    assert.equal(ticks.result.results[0].pass, false);
    assert.equal(ticks.result.results[0].error, 'Test nedoběhl včas — nekonečná smyčka?');
    assert.ok(ticks.count > 10, `stránka runneru měla běžet dál (tiků: ${ticks.count})`);

    const next = await run({ runtime: 'dom', files: [{ name: 'index.html', content: '<p>x</p>' }], hints: [{ text: 'ok', test: "assert.equal(document.querySelector('p').textContent, 'x');" }] });
    assert.deepEqual(next.results, [{ index: 0, pass: true }]);
  });

  test('zrušení signálem hned odstraní zaseknutý iframe, souběžná kontrola doběhne', async () => {
    // Sandboxované iframy sdílejí proces: zaseknutý test by jinak zdržel i jinou kontrolu
    // a ta by falešně skončila „Test nedoběhl včas" (třeba po přechodu na další krok).
    const outcome = await page.evaluate(async () => {
      const files = [{ name: 'index.html', content: '<h1>x</h1>' }];
      const controller = new AbortController();
      const stuck = window.akademieRunner.runTests({
        runtime: 'dom',
        files,
        signal: controller.signal,
        hints: [{ text: 'smyčka', test: 'while (true) {}' }, { text: 'další', test: '' }],
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      controller.abort();
      const started = performance.now();
      const other = await window.akademieRunner.runTests({
        runtime: 'dom',
        files,
        hints: [{ text: 'ok', test: "assert.equal(document.querySelector('h1').textContent, 'x');" }],
      });
      return { stuck: await stuck, other, ms: performance.now() - started, frames: document.querySelectorAll('iframe').length };
    });
    assert.equal(outcome.stuck.ok, false);
    assert.deepEqual(outcome.stuck.results.map((r) => r.pass), [false, false]);
    assert.equal(outcome.stuck.results[1].skipped, true);
    assert.deepEqual(outcome.other.results, [{ index: 0, pass: true }]);
    assert.ok(outcome.ms < 3000, `souběžná kontrola trvala ${Math.round(outcome.ms)} ms`);
    assert.equal(outcome.frames, 0, 'po zrušení nezůstal žádný iframe');
  });

  test('test, který čeká donekonečna, skončí po timeoutMs', async () => {
    const result = await run({ runtime: 'dom', timeoutMs: 300, files: [], hints: [{ text: 'čeká', test: 'await new Promise(() => {});' }] });
    assert.equal(result.results[0].error, 'Test nedoběhl včas (limit 300 ms).');
  });
});

describe('runtime vue a node', () => {
  test('vue: import map, createApp a reakce na klik', async () => {
    const body = `<div id="app"><button @click="count++">Počet: {{ count }}</button></div>
<script type="module">
import { createApp, ref } from 'vue';
createApp({ setup() { return { count: ref(0) }; } }).mount('#app');
</script>`;
    const result = await run({
      runtime: 'vue',
      files: [{ name: 'index.html', content: html(body, '') }],
      hints: [
        {
          text: 'vue',
          test: `
            const button = await helpers.waitFor(() => document.querySelector('#app button'));
            assert.equal(button.textContent, 'Počet: 0');
            await helpers.click(button);
            assert.equal(button.textContent, 'Počet: 1');
          `,
        },
      ],
    });
    assert.equal(result.results[0].pass, true, result.results[0].error);
    assert.deepEqual(result.errors, []);
  });

  test('node: testy jdou přes POST /api/run-node', async () => {
    nodeRequests.length = 0;
    const result = await run({ runtime: 'node', files: [{ name: 'index.js', content: 'console.log(1)' }], hints: [{ text: 'a', test: 'x' }] });
    assert.deepEqual(result, { ok: true, results: [{ index: 0, pass: true }], logs: [{ level: 'log', text: 'ze serveru' }], errors: [] });
    assert.deepEqual(nodeRequests, [{ runtime: 'node', files: [{ name: 'index.js', content: 'console.log(1)' }], hints: [{ text: 'a', test: 'x' }], timeoutMs: 10000 }]);
  });
});

describe('mountPreview', () => {
  test('dom náhled ukáže stránku a posílá konzoli; update a destroy', async () => {
    const outcome = await page.evaluate(async () => {
      const container = document.createElement('div');
      container.style.cssText = 'width: 400px; height: 300px';
      document.body.append(container);
      const entries = [];
      const preview = window.akademieRunner.mountPreview(container, {
        runtime: 'dom',
        files: [{ name: 'index.html', content: '<p>Ahoj</p>' }, { name: 'script.js', content: "console.log('první'); while (true) {}" }],
      });
      preview.onConsole((entry) => entries.push(entry));
      const waitFor = async (fn) => { for (let i = 0; i < 200 && !fn(); i++) await new Promise((r) => setTimeout(r, 20)); };
      await waitFor(() => entries.some((e) => e.uncaught));
      const frames = container.querySelectorAll('iframe').length;
      preview.update({ files: [{ name: 'index.html', content: '<p>Nazdar</p>' }, { name: 'script.js', content: "console.log('druhý')" }] });
      await waitFor(() => entries.some((e) => e.text === 'druhý'));
      preview.destroy();
      return { entries, frames, left: container.querySelectorAll('iframe').length };
    });
    assert.equal(outcome.frames, 1);
    assert.equal(outcome.left, 0);
    assert.deepEqual(outcome.entries.map((e) => e.level === 'clear' ? 'clear' : e.text), [
      'první',
      'Error: Smyčka běží příliš dlouho — nekonečná smyčka? (řádek 1) (script.js:1)',
      'clear',
      'druhý',
    ]);
  });

  test('js náhled vypisuje do panelu konzole', async () => {
    const text = await page.evaluate(async () => {
      const container = document.createElement('div');
      document.body.append(container);
      const preview = window.akademieRunner.mountPreview(container, { runtime: 'js', files: [{ name: 'script.js', content: "console.log('z konzole', 42)" }] });
      for (let i = 0; i < 100 && !container.textContent; i++) await new Promise((r) => setTimeout(r, 20));
      const result = container.querySelector('.akademie-console').textContent;
      preview.destroy();
      return result;
    });
    assert.equal(text, 'z konzole 42');
  });
});
