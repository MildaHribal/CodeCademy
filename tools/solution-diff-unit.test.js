// Příprava porovnání s řešením bez prohlížeče (client/src/extensions/solution-diff/hunks.js).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { collapseUnchanged, compareFiles, differsFromAuthor, plainFiles } from '../client/src/extensions/solution-diff/hunks.js';

describe('porovnání s řešením — soubory', () => {
  const mine = [
    { name: 'index.html', content: '<h1>Ahoj</h1>' },
    { name: 'script.js', content: 'const total = 0;\nconsole.log(total)' },
    { name: 'poznamky.txt', content: 'moje' },
  ];
  const author = [
    { name: 'index.html', content: '<h1>Ahoj</h1>' },
    { name: 'script.js', content: 'const total = 0;\nconsole.log(total);' },
    { name: 'styles.css', content: 'h1 { color: red; }' },
  ];

  test('stav souborů a počty řádků; pořadí autor, pak jen uživatelovy', () => {
    const files = compareFiles(mine, author);
    assert.deepEqual(files.map(({ name, status, added, removed }) => [name, status, added, removed]), [
      ['index.html', 'same', 0, 0],
      ['script.js', 'changed', 1, 1],
      ['styles.css', 'added', 1, 0],
      ['poznamky.txt', 'removed', 0, 1],
    ]);
  });

  test('ignorovat bílé znaky', () => {
    const files = compareFiles([{ name: 'a.js', content: 'if (x) {\nreturn 1;\n}' }], [{ name: 'a.js', content: 'if (x) {\n  return 1;\n}' }], { ignoreWhitespace: true });
    assert.equal(files[0].status, 'same');
  });

  test('differsFromAuthor porovnává jen společné soubory a bez bílých znaků', () => {
    assert.equal(differsFromAuthor([{ name: 'a.js', content: 'x  = 1' }], [{ name: 'a.js', content: 'x = 1' }]), false);
    assert.equal(differsFromAuthor([{ name: 'a.js', content: 'x = 2' }], [{ name: 'a.js', content: 'x = 1' }]), true);
    assert.equal(differsFromAuthor([{ name: 'jiny.js', content: 'x = 2' }], [{ name: 'a.js', content: 'x = 1' }]), false);
  });

  test('plainFiles vyhodí prázdná jména a doplní obsah', () => {
    assert.deepEqual(plainFiles([{ name: 'a.js', content: 'x', lang: 'js', region: null }, { name: '' }, null, { name: 'b.css' }]), [
      { name: 'a.js', content: 'x' },
      { name: 'b.css', content: '' },
    ]);
  });
});

describe('porovnání s řešením — sbalení stejných řádků', () => {
  const lines = (count, prefix = 'r') => Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`).join('\n');

  test('kolem změny zůstane 3 řádky kontextu, zbytek je skip', () => {
    const before = lines(20);
    const after = before.replace('r10', 'ZMĚNA');
    const [file] = compareFiles([{ name: 'a', content: before }], [{ name: 'a', content: after }]);
    const parts = collapseUnchanged(file.diff);
    assert.deepEqual(parts.map((part) => [part.type, part.lines.length]), [
      ['skip', 6], // r1–r6
      ['lines', 8], // r7–r9, −r10, +ZMĚNA, r11–r13
      ['skip', 7], // r14–r20
    ]);
  });

  test('krátký úsek stejných řádků (méně než 3) se nesbalí', () => {
    const before = lines(10);
    const after = before.replace('r2', 'A').replace('r10', 'B');
    const [file] = compareFiles([{ name: 'a', content: before }], [{ name: 'a', content: after }]);
    const parts = collapseUnchanged(file.diff, 3);
    assert.deepEqual(parts.map((part) => part.type), ['lines']);
    assert.equal(parts[0].lines.length, 12);
  });

  test('bez změn = jeden skip, prázdný diff = nic', () => {
    const [file] = compareFiles([{ name: 'a', content: lines(5) }], [{ name: 'a', content: lines(5) }]);
    assert.deepEqual(collapseUnchanged(file.diff).map((part) => part.type), ['skip']);
    assert.deepEqual(collapseUnchanged([]), []);
  });
});
