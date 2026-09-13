import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { changeRatio, diffLines } from './diff.js';

/** Zkrácený zápis výsledku: ' a', '-b', '+c'. */
const compact = (diff) => diff.map((d) => `${{ same: ' ', add: '+', del: '-' }[d.type]}${d.text}`);

describe('diffLines', () => {
  test('stejné texty = jen same s čísly řádků', () => {
    assert.deepEqual(diffLines('a\nb', 'a\nb'), [
      { type: 'same', text: 'a', beforeLine: 1, afterLine: 1 },
      { type: 'same', text: 'b', beforeLine: 2, afterLine: 2 },
    ]);
  });

  test('změněný řádek je odebrání a pak přidání', () => {
    assert.deepEqual(diffLines('a\nb\nc', 'a\nB\nc'), [
      { type: 'same', text: 'a', beforeLine: 1, afterLine: 1 },
      { type: 'del', text: 'b', beforeLine: 2, afterLine: null },
      { type: 'add', text: 'B', beforeLine: null, afterLine: 2 },
      { type: 'same', text: 'c', beforeLine: 3, afterLine: 3 },
    ]);
  });

  test('přidané a odebrané řádky uprostřed, na začátku i na konci', () => {
    assert.deepEqual(compact(diffLines('x\na\nb\nc', 'a\nnew\nb\nc\nend')), [
      '-x', ' a', '+new', ' b', ' c', '+end',
    ]);
    assert.deepEqual(compact(diffLines('', 'a\nb')), ['+a', '+b']);
    assert.deepEqual(compact(diffLines('a\nb', '')), ['-a', '-b']);
    assert.deepEqual(diffLines('', ''), []);
  });

  test('blok změněných řádků: nejdřív všechna odebrání, pak přidání', () => {
    assert.deepEqual(compact(diffLines('start\none\ntwo\nend', 'start\njedna\ndva\nend')), [
      ' start', '-one', '-two', '+jedna', '+dva', ' end',
    ]);
  });

  test('najde nejdelší společnou podposloupnost, ne jen společný začátek', () => {
    const before = ['function sum(items) {', '  let total = 0;', '  for (const x of items) total += x;', '  return total;', '}'].join('\n');
    const after = ['function sum(items) {', '  return items.reduce((a, b) => a + b, 0);', '}'].join('\n');
    const diff = diffLines(before, after);
    assert.deepEqual(compact(diff), [
      ' function sum(items) {',
      '-  let total = 0;',
      '-  for (const x of items) total += x;',
      '-  return total;',
      '+  return items.reduce((a, b) => a + b, 0);',
      ' }',
    ]);
    assert.deepEqual(diff.at(-1), { type: 'same', text: '}', beforeLine: 5, afterLine: 3 });
  });

  test('\\r\\n je totéž co \\n', () => {
    assert.deepEqual(compact(diffLines('a\r\nb\r\n', 'a\nb\n')), [' a', ' b', ' ']);
  });

  test('ignoreWhitespace: odsazení a mezery nedělají rozdíl, text same je z after', () => {
    assert.deepEqual(compact(diffLines('if (x) {\nreturn  1;\n}', 'if (x) {\n  return 1;\n}')), [
      ' if (x) {', '-return  1;', '+  return 1;', ' }',
    ]);
    const ignored = diffLines('if (x) {\nreturn  1;\n}', 'if (x) {\n  return 1;\n}', { ignoreWhitespace: true });
    assert.deepEqual(compact(ignored), [' if (x) {', '   return 1;', ' }']);
    assert.deepEqual(ignored[1], { type: 'same', text: '  return 1;', beforeLine: 2, afterLine: 2 });
    // Prázdný řádek navíc je pořád rozdíl.
    assert.deepEqual(compact(diffLines('a\nb', 'a\n\nb', { ignoreWhitespace: true })), [' a', '+', ' b']);
  });

  test('čísla řádků sedí s původními texty', () => {
    const before = 'a\nb\nc\nd\ne';
    const after = 'a\nc\nX\nd\ne\nf';
    const diff = diffLines(before, after);
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    for (const d of diff) {
      if (d.beforeLine !== null) assert.equal(beforeLines[d.beforeLine - 1], d.text);
      if (d.afterLine !== null) assert.equal(afterLines[d.afterLine - 1], d.text);
    }
    assert.equal(diff.filter((d) => d.type !== 'add').length, beforeLines.length);
    assert.equal(diff.filter((d) => d.type !== 'del').length, afterLines.length);
  });

  test('stovky řádků zvládne rychle', () => {
    const before = Array.from({ length: 800 }, (_, i) => `line ${i}`).join('\n');
    const after = Array.from({ length: 800 }, (_, i) => (i % 7 === 0 ? `changed ${i}` : `line ${i}`)).join('\n');
    const started = Date.now();
    const diff = diffLines(before, after);
    assert.ok(Date.now() - started < 1000);
    assert.equal(diff.filter((d) => d.type === 'add').length, 115);
    assert.equal(diff.filter((d) => d.type === 'del').length, 115);
  });
});

describe('changeRatio', () => {
  const seed = ['function markAllBought(items) {', '  return items.map((item) => {', '    item.bought = true;', '    return item;', '  });', '}'];

  test('beze změny 0, malá oprava malý podíl', () => {
    assert.equal(changeRatio(seed, seed.join('\n')), 0);
    const fixed = ['function markAllBought(items) {', '  return items.map((item) => {', '    return { ...item, bought: true };', '  });', '}'].join('\n');
    // Chybí 2 ze 6 řádků seedu (item.bought = true; a return item;).
    assert.equal(changeRatio(seed, fixed), 2 / 6);
  });

  test('odsazení a prázdné řádky nerozhodují (trim, prázdné se nepočítají)', () => {
    const reindented = seed.map((line) => `\t${line.trim()}  `).join('\n\n');
    assert.equal(changeRatio(['', ...seed, '   '], reindented), 0);
  });

  test('přepsané všechno = 1, prázdný seed = 0', () => {
    assert.equal(changeRatio(seed, 'const markAllBought = (items) => structuredClone(items);'), 1);
    assert.equal(changeRatio(seed, ''), 1);
    assert.equal(changeRatio([], 'cokoli'), 0);
    assert.equal(changeRatio(['', '  '], 'cokoli'), 0);
  });

  test('pořadí řádků hraje roli (LCS)', () => {
    assert.equal(changeRatio(['a', 'b', 'c', 'd'], 'd\nc\nb\na'), 3 / 4);
  });

  test('řádky navíc v uživatelově verzi míru nezvyšují', () => {
    const extended = [seed[0], '  // kontrola vstupu', '  if (!Array.isArray(items)) return [];', ...seed.slice(1)].join('\n');
    assert.equal(changeRatio(seed, extended), 0);
  });
});
