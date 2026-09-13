// Unit testy částí runneru, které nepotřebují prohlížeč (běží přímo v Node).
import { test, describe } from 'node:test';
import nodeAssert from 'node:assert/strict';
import vm from 'node:vm';
import { transformJs } from '../client/src/runner/js-transform.js';
import { composePage } from '../client/src/runner/compose.js';
import { resolveFileReference, resolveModuleSpecifier } from '../client/src/runner/file-names.js';
import { scanHtml } from '../client/src/runner/html-tags.js';
import { createAssert } from '../client/src/runner/frame/assert.js';
import { formatValue } from '../client/src/runner/frame/format-value.js';
import { stripComments } from '../client/src/runner/frame/strip-comments.js';
import { createLoopGuard } from '../client/src/runner/frame/loop-guard-runtime.js';
import { fitViewport } from '../client/src/runner/viewport.js';
import { describeAssertion } from '../shared/runner-assertion.js';

/** Spustí upravený kód ve vm s ochranou smyček; vrátí výsledek posledního výrazu. */
function runGuarded(code, { limitMs = 100, sourceType = 'script' } = {}) {
  const trips = [];
  const guard = createLoopGuard({ limitMs, onTrip: (message) => trips.push(message) });
  const context = vm.createContext({ __akademieGuard: guard, queueMicrotask, Date });
  const value = vm.runInContext(transformJs(code, { sourceType }), context);
  return { value, trips };
}

describe('ochrana smyček (loop-guard)', () => {
  test('nekonečná smyčka vyhodí chybu s číslem řádku', () => {
    nodeAssert.throws(() => runGuarded('let a = 1;\n\nwhile (true) {}'), /Smyčka běží příliš dlouho — nekonečná smyčka\? \(řádek 3\)/);
  });

  test('všechny druhy smyček, tělo bez závorek, návěští a continue fungují dál', () => {
    const code = `
      let out = [];
      for (let i = 0; i < 3; i++) out.push(i);
      for (const x of [3, 4]) out.push(x);
      for (const k in { a: 1 }) out.push(k);
      let n = 0;
      while (n < 2) n++;
      do n++; while (n < 4)
      outer: for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) { if (j === 1) continue outer; if (i === 2) break outer; out.push(i + '' + j); } }
      if (n) for (;;) break; else out.push('nikdy');
      out.push(n);
      out.join(',');
    `;
    nodeAssert.equal(runGuarded(code).value, '0,1,2,3,4,a,00,10,4');
  });

  test('vnořené smyčky bez závorek hlídá obě', () => {
    nodeAssert.throws(() => runGuarded('for (;;)\n  for (let i = 0; i < 10; i++) i;'), /řádek 1/);
  });

  test('přepis nemění počet řádků a nerozparsovatelný kód nechá být', () => {
    const code = 'const a = 1;\nwhile (a < 0) {\n  console.log(a);\n}\n';
    nodeAssert.equal(transformJs(code).split('\n').length, code.split('\n').length);
    nodeAssert.equal(transformJs('while (true {'), 'while (true {');
  });

  test('lineOffset posune číslo řádku v hlášce', () => {
    const code = transformJs('while (true) {}', { lineOffset: 9 });
    nodeAssert.match(code, /check\(__akLoop1,10\)\)throw __akademieGuard\.error\(10\)/);
  });

  test('smyčka s await se měří jen po dobu souvislého běhu', async () => {
    const guard = createLoopGuard({ limitMs: 30, onTrip: () => {} });
    const context = vm.createContext({ __akademieGuard: guard, queueMicrotask, setTimeout, Date });
    const code = 'let i = 0; (async () => { while (i < 6) { await new Promise((r) => setTimeout(r, 15)); i++; } return i; })()';
    nodeAssert.equal(await vm.runInContext(transformJs(code), context), 6);
  });

  test('importy mezi soubory kroku se přepíšou na @akademie/files', () => {
    const files = new Map([['lib/math.js', ''], ['app.js', '']]);
    const code = "import { add } from './lib/math.js';\nexport * from './app.js';\nconst m = import('./lib/math.js');\nimport vue from 'vue';";
    const out = transformJs(code, { sourceType: 'module', resolveSpecifier: (s) => resolveModuleSpecifier('index.js', s, files) });
    nodeAssert.match(out, /from "@akademie\/files\/lib\/math.js"/);
    nodeAssert.match(out, /from "@akademie\/files\/app.js"/);
    nodeAssert.match(out, /import\("@akademie\/files\/lib\/math.js"\)/);
    nodeAssert.match(out, /from 'vue'/);
  });
});

describe('skládání stránky', () => {
  const frame = { runId: 'x', mode: 'test', test: '', timeoutMs: 1000 };

  test('odkazy na soubory kroku nahradí vloženým stylem a data: skriptem', () => {
    const html = composePage({
      runtime: 'dom',
      loopLimitMs: 1000,
      frame,
      files: [
        { name: 'index.html', content: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="./styles.css" media="screen"><script src="https://cdn.example/x.js"></script></head><body><script src="app.js" type="module"></script></body></html>' },
        { name: 'styles.css', content: 'nav { color: red }' },
        { name: 'app.js', content: 'console.log(1)' },
      ],
    });
    nodeAssert.match(html, /^<!DOCTYPE html><script>/);
    nodeAssert.match(html, /<style media="screen">nav \{ color: red \}<\/style>/);
    nodeAssert.match(html, /<script src="https:\/\/cdn\.example\/x\.js"><\/script>/);
    nodeAssert.match(html, /<script type="module" src="data:text\/javascript;akademie-source=\d+;charset=utf-8,/);
    nodeAssert.match(html, /<script type="importmap">\{"imports":\{"@akademie\/files\/app.js":"data:/);
  });

  test('kus HTML bez <html> (živá ukázka) dostane celou stránku, CSS i JS', () => {
    const html = composePage({
      runtime: 'dom',
      loopLimitMs: 1000,
      frame,
      files: [
        { name: 'index.html', content: '<p>Ahoj</p>' },
        { name: 'styles.css', content: 'p { color: red }' },
        { name: 'script.js', content: 'console.log(1)' },
      ],
    });
    nodeAssert.match(html, /<style>p \{ color: red \}<\/style><\/head><body>\n<p>Ahoj<\/p>\n<script src="data:text\/javascript/);
  });

  test('skripty mají sourceURL a inline skript sedí na řádky a sloupce index.html', () => {
    const html = composePage({
      runtime: 'dom',
      loopLimitMs: 1000,
      frame: { ...frame, cssVariables: { '--gap': '2rem' } },
      files: [
        { name: 'index.html', content: '<!DOCTYPE html>\n<html>\n<body>\n  <script>let a = 1; // konec</script>\n<script src="script.js"></script>\n</body>\n</html>' },
        { name: 'script.js', content: 'console.log(1) // bez nového řádku' },
      ],
    });
    const scripts = [...html.matchAll(/src="data:text\/javascript;akademie-source=\d+;charset=utf-8,([^"]*)"/g)].map((m) => decodeURIComponent(m[1]));
    nodeAssert.equal(scripts[0], '\n\n\n          let a = 1; // konec\n//# sourceURL=akademie/index.html');
    nodeAssert.equal(scripts[1], 'console.log(1) // bez nového řádku\n//# sourceURL=akademie/script.js');
    nodeAssert.match(html, /"cssVariables":\{"--gap":"2rem"\}/);
  });

  test('runtime vue přidá do import map vue z /vendor', () => {
    const html = composePage({ runtime: 'vue', loopLimitMs: 1000, frame, origin: 'http://127.0.0.1:1', files: [{ name: 'index.html', content: '<div id="app"></div>' }] });
    nodeAssert.match(html, /"vue":"http:\/\/127\.0\.0\.1:1\/vendor\/vue\.esm-browser\.js"/);
  });

  test('skener HTML přeskočí komentáře a obsah <script>', () => {
    const tokens = scanHtml('<!-- <link rel="stylesheet" href="a.css"> --><script>const s = "<link href=b.css>";</script><link rel=stylesheet href=c.css>');
    nodeAssert.deepEqual(tokens.map((t) => t.kind + (t.name ? `:${t.name}` : '')), ['comment', 'element:script', 'element:link']);
  });

  test('resolveFileReference rozliší relativní cesty a cizí adresy', () => {
    const names = new Set(['css/a.css', 'b.js']);
    nodeAssert.equal(resolveFileReference('index.html', './css/a.css?v=1', names), 'css/a.css');
    nodeAssert.equal(resolveFileReference('css/x.html', '../b.js', names), 'b.js');
    nodeAssert.equal(resolveFileReference('index.html', '/b.js', names), 'b.js');
    nodeAssert.equal(resolveFileReference('index.html', 'https://x/b.js', names), null);
    nodeAssert.equal(resolveFileReference('index.html', 'c.js', names), null);
  });
});

describe('assert shim se chová jako node:assert/strict', () => {
  const shim = createAssert(formatValue);
  const cases = [
    ['ok', [1]], ['ok', [0]], ['ok', ['']],
    ['equal', [1, 1]], ['equal', [1, '1']], ['equal', [NaN, NaN]], ['equal', [0, -0]],
    ['notEqual', [1, 2]], ['notEqual', [1, 1]],
    ['deepEqual', [{ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }]], ['deepEqual', [{ a: 1 }, { a: '1' }]],
    ['deepEqual', [[1, 2], [1, 2, 3]]], ['deepEqual', [new Map([[1, { x: 1 }]]), new Map([[1, { x: 1 }]])]],
    ['deepEqual', [new Set([1, 2]), new Set([2, 1])]], ['deepEqual', [new Date(1), new Date(2)]],
    ['deepEqual', [Object.create(null), {}]],
    ['notDeepEqual', [{ a: 1 }, { a: 2 }]], ['notDeepEqual', [{ a: 1 }, { a: 1 }]],
    ['match', ['abc', /b/]], ['match', ['abc', /x/]], ['match', [5, /5/]],
    ['doesNotMatch', ['abc', /x/]], ['doesNotMatch', ['abc', /b/]],
    ['throws', [() => { throw new TypeError('x'); }, TypeError]],
    ['throws', [() => { throw new TypeError('x'); }, RangeError]],
    ['throws', [() => { throw new Error('ahoj'); }, /ahoj/]],
    ['throws', [() => { throw new Error('ahoj'); }, { message: 'ahoj' }]],
    ['throws', [() => {}]],
    ['doesNotThrow', [() => {}]], ['doesNotThrow', [() => { throw new Error('x'); }]],
  ];

  for (const [method, args] of cases) {
    test(`${method}(${args.map((a) => formatValue(a)).join(', ')})`, () => {
      let nodeThrew = false;
      let shimThrew = false;
      try { nodeAssert[method](...args); } catch { nodeThrew = true; }
      try { shim[method](...args); } catch { shimThrew = true; }
      nodeAssert.equal(shimThrew, nodeThrew);
    });
  }

  test('rejects a vlastní zpráva', async () => {
    await shim.rejects(Promise.reject(new Error('x')), /x/);
    await nodeAssert.rejects(shim.rejects(Promise.resolve(1)), /Očekávám, že Promise skončí chybou, ale splnila se/);
    nodeAssert.throws(() => shim.equal(1, 2, 'moje zpráva'), { name: 'AssertionError', message: 'moje zpráva', actual: 1, expected: 2, generatedMessage: false });
    nodeAssert.throws(() => shim(false), { name: 'AssertionError' });
  });

  test('vygenerované hlášky jsou česky', () => {
    const messageOf = (fn) => {
      try {
        fn();
      } catch (error) {
        return error.message;
      }
      return null;
    };
    nodeAssert.equal(messageOf(() => shim.equal(4, 3)), 'Očekávám 3, ale kód vrátil 4');
    nodeAssert.equal(messageOf(() => shim.equal('a', 'b')), "Očekávám 'b', ale kód vrátil 'a'");
    nodeAssert.equal(messageOf(() => shim.deepEqual([1], [2])), 'Očekávám [ 2 ], ale kód vrátil [ 1 ]');
    nodeAssert.equal(messageOf(() => shim.ok(0)), 'Očekávám pravdivou hodnotu, ale kód vrátil 0');
    nodeAssert.equal(messageOf(() => shim.match('abc', /x/)), "Text 'abc' neodpovídá regulárnímu výrazu /x/");
    nodeAssert.equal(messageOf(() => shim.throws(() => {})), 'Očekávám, že kód vyhodí výjimku, ale žádnou nevyhodil');
    nodeAssert.equal(messageOf(() => shim.notEqual(1, 1)), 'Hodnota se nemá rovnat 1, ale kód vrátil právě ji');
    nodeAssert.equal(messageOf(() => shim.fail()), 'Test selhal');
  });
});

describe('describeAssertion — podrobnosti selhaného testu', () => {
  const shim = createAssert(formatValue);
  const detailsOf = (fn) => {
    try {
      fn();
    } catch (error) {
      return describeAssertion(error, formatValue);
    }
    return null;
  };

  test('equal s vlastní zprávou má actual i expected', () => {
    nodeAssert.deepEqual(detailsOf(() => shim.equal(4, 3, 'sum([1, 2]) má vrátit 3')), {
      errorName: 'AssertionError', operator: 'strictEqual', actual: '4', expected: '3', generatedMessage: false,
    });
  });

  test('ok má expected true, match výraz; fail a throws bez porovnání', () => {
    nodeAssert.deepEqual(detailsOf(() => shim(null, 'má existovat')), { errorName: 'AssertionError', operator: '==', actual: 'null', expected: 'true', generatedMessage: false });
    nodeAssert.equal(detailsOf(() => shim.match('abc', /x/)).expected, '/x/');
    nodeAssert.deepEqual(detailsOf(() => shim.fail('ne')), { errorName: 'AssertionError' });
    nodeAssert.deepEqual(detailsOf(() => shim.throws(() => {})), { errorName: 'AssertionError' });
    nodeAssert.deepEqual(detailsOf(() => { throw new TypeError('x'); }), { errorName: 'TypeError' });
  });

  test('deepEqual má diff s cestami k lišícím se listům a (chybí)', () => {
    const actual = { items: [{ price: 5 }, { price: 6 }], total: 11, extra: true };
    const expected = { items: [{ price: 5 }, { price: 7 }, { price: 1 }], total: 13, 'dva slova': 1 };
    const details = detailsOf(() => shim.deepEqual(actual, expected));
    nodeAssert.deepEqual(details.diff, [
      { path: 'items[1].price', actual: '6', expected: '7' },
      { path: 'items[2]', actual: '(chybí)', expected: '{ price: 1 }' },
      { path: 'total', actual: '11', expected: '13' },
      { path: 'extra', actual: 'true', expected: '(chybí)' },
      { path: '["dva slova"]', actual: '(chybí)', expected: '1' },
    ]);
  });

  test('diff má nejvýš 10 položek a dlouhé hodnoty se zkrátí', () => {
    const details = detailsOf(() => shim.deepEqual(Array.from({ length: 20 }, (_, i) => i), Array.from({ length: 20 }, (_, i) => -i - 1)));
    nodeAssert.equal(details.diff.length, 10);
    const long = detailsOf(() => shim.equal('x'.repeat(5000), 'y'));
    nodeAssert.ok(long.actual.length < 2100 && long.actual.endsWith('… (zkráceno)'));
  });

  test('stejné pro node:assert/strict (runtime node)', () => {
    try {
      nodeAssert.deepEqual({ a: [1, 2] }, { a: [1, 3] }, 'moje');
    } catch (error) {
      const details = describeAssertion(error, (value) => JSON.stringify(value));
      nodeAssert.deepEqual(details, { errorName: 'AssertionError', operator: 'deepStrictEqual', actual: '{"a":[1,2]}', expected: '{"a":[1,3]}', generatedMessage: false, diff: [{ path: 'a[1]', actual: '2', expected: '3' }] });
    }
  });
});

describe('velikost náhledu (fitViewport)', () => {
  test('null vyplní panel', () => {
    nodeAssert.deepEqual(fitViewport(null, { width: 300, height: 200 }), { scale: 1, frameWidth: '100%', frameHeight: '100%', stageWidth: '100%', stageHeight: '100%', centered: false });
  });

  test('široká stránka se zmenší na šířku panelu, úzká zůstane 1:1 uprostřed', () => {
    nodeAssert.deepEqual(fitViewport({ width: 1024, height: 768 }, { width: 512, height: 300 }), { scale: 0.5, frameWidth: '1024px', frameHeight: '768px', stageWidth: '512px', stageHeight: '384px', centered: false });
    nodeAssert.deepEqual(fitViewport({ width: 375, height: 667 }, { width: 500, height: 300 }), { scale: 1, frameWidth: '375px', frameHeight: '667px', stageWidth: '375px', stageHeight: '667px', centered: true });
  });
});

describe('formatValue a stripComments', () => {
  test('formát jako util.inspect pro běžné hodnoty', () => {
    nodeAssert.equal(formatValue([1, 2, 3]), '[ 1, 2, 3 ]');
    nodeAssert.equal(formatValue({ a: 1, b: 'x' }), "{ a: 1, b: 'x' }");
    nodeAssert.equal(formatValue([]), '[]');
    nodeAssert.equal(formatValue(new Map([['a', 1]])), "Map(1) { 'a' => 1 }");
    nodeAssert.equal(formatValue('ahoj', { rawStrings: true }), 'ahoj');
    const cyclic = { name: 'x' };
    cyclic.self = cyclic;
    nodeAssert.equal(formatValue(cyclic), "{ name: 'x', self: [Circular *] }");
  });

  test('stripComments pro js zachová řetězce, šablony a regexy', () => {
    const js = "const a = '// ne'; // pryč\nconst b = `/* ${x /* pryč */} */`;\nconst re = /\\/\\*x/g; /* pryč */\nconst c = 4 / 2; // pryč";
    nodeAssert.equal(stripComments(js, 'js'), "const a = '// ne'; \nconst b = `/* ${x } */`;\nconst re = /\\/\\*x/g; \nconst c = 4 / 2; ");
  });

  test('stripComments pro css a html', () => {
    nodeAssert.equal(stripComments('a { content: "/* ne */"; } /* pryč */', 'css'), 'a { content: "/* ne */"; } ');
    nodeAssert.equal(stripComments('<p>1</p><!-- pryč --><p>2</p>', 'html'), '<p>1</p><p>2</p>');
    nodeAssert.throws(() => stripComments('x', 'python'), /neznámý jazyk/);
  });
});
