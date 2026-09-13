import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { checkJsSyntax, extractInlineScripts, findSyntaxError } from './syntax-check.js';

describe('checkJsSyntax', () => {
  test('platný skript i modul projde', () => {
    assert.equal(checkJsSyntax('const a = 1;\nfunction f() { return a; }'), null);
    assert.equal(checkJsSyntax("import { x } from './x.js';\nexport const y = await x;"), null);
    assert.equal(checkJsSyntax('#!/usr/bin/env node\nconsole.log(1)'), null);
    assert.equal(checkJsSyntax(''), null);
  });

  test('neuzavřená závorka → Unexpected token s tokenem, řádek a sloupec 1-based', () => {
    assert.deepEqual(checkJsSyntax('const a = 1;\nconsole.log(a));'), { line: 2, column: 15, message: "Unexpected token ')'" });
  });

  test('chybějící konec → Unexpected end of input', () => {
    assert.deepEqual(checkJsSyntax('function f() {\n  return 1;\n'), { line: 3, column: 1, message: 'Unexpected end of input' });
  });

  test('neočekávané slovo, číslo a řetězec', () => {
    assert.equal(checkJsSyntax('const a = 1 b').message, "Unexpected token 'b'");
    assert.equal(checkJsSyntax('const a = 1 2').message, 'Unexpected number');
    assert.equal(checkJsSyntax("const a = 1 'x'").message, 'Unexpected string');
    assert.equal(checkJsSyntax('const a = => 1').message, "Unexpected token '=>'");
  });

  test('jiné hlášky acornu zůstanou bez pozice v závorce', () => {
    assert.deepEqual(checkJsSyntax("const s = 'ahoj;"), { line: 1, column: 11, message: 'Unterminated string constant' });
    assert.match(checkJsSyntax('let a = 1;\nlet a = 2;').message, /Identifier 'a' has already been declared/);
  });

  test('u souboru s importem se hlásí chyba z pokusu o modul (dostal se dál)', () => {
    const error = checkJsSyntax("import { x } from './x.js';\n\nconst y = ;");
    assert.equal(error.line, 3);
    assert.equal(error.message, "Unexpected token ';'");
  });
});

describe('extractInlineScripts', () => {
  test('najde spustitelné inline skripty s pozicí obsahu', () => {
    const html = '<!DOCTYPE html>\n<!-- <script>nic</script> -->\n<script src="a.js"></script>\n  <script type="module">import x from "y";</script>\n<script type="importmap">{}</script>\n<script data-x=">">\nlet a = 1;\n</script>';
    assert.deepEqual(extractInlineScripts(html), [
      { content: 'import x from "y";', line: 4, column: 25 },
      { content: '\nlet a = 1;\n', line: 6, column: 20 },
    ]);
  });
});

describe('findSyntaxError', () => {
  test('první chyba v pořadí souborů, JSON a CSS se nekontrolují', () => {
    const files = [
      { name: 'data.json', content: '{ nejde' },
      { name: 'styles.css', content: 'a {' },
      { name: 'ok.js', content: 'const a = 1;' },
      { name: 'app.mjs', content: 'export const = 1;' },
      { name: 'later.cjs', content: 'nope(' },
    ];
    assert.deepEqual(findSyntaxError(files), { file: 'app.mjs', line: 1, column: 14, message: "Unexpected token '='" });
  });

  test('chyba v inline skriptu má řádek a sloupec v HTML souboru', () => {
    const html = '<!DOCTYPE html>\n<html>\n<body>\n<script>\nconst a = 1;\nconsole.log(a));\n</script>\n</body>\n</html>';
    assert.deepEqual(findSyntaxError([{ name: 'index.html', content: html }]), { file: 'index.html', line: 6, column: 15, message: "Unexpected token ')'" });
    assert.deepEqual(findSyntaxError([{ name: 'index.html', content: '<p></p><script>let x = ;</script>' }]), { file: 'index.html', line: 1, column: 24, message: "Unexpected token ';'" });
  });

  test('includeHtml: false HTML přeskočí (runtime node)', () => {
    assert.equal(findSyntaxError([{ name: 'public/index.html', content: '<script>(</script>' }], { includeHtml: false }), null);
  });

  test('bez chyby vrátí null', () => {
    assert.equal(findSyntaxError([{ name: 'index.html', content: '<script>let x = 1;</script>' }, { name: 'script.js', content: 'x;' }]), null);
    assert.equal(findSyntaxError([]), null);
  });
});
