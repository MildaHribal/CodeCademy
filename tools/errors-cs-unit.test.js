// Výpočty českého zobrazení výsledků testů (client/src/extensions/errors-cs/format.js) bez DOM.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  comparesEquality, explainResult, firstFailedIndex, highlightDifference, inlineCodeSegments, locationInMessage, valueLabels,
} from '../client/src/extensions/errors-cs/format.js';

describe('highlightDifference', () => {
  test('zvýrazní jen lišící se prostředek', () => {
    assert.deepEqual(highlightDifference('[ 1, 2, 3 ]', '[ 1, 5, 3 ]'), {
      expected: [{ text: '[ 1, ', changed: false }, { text: '2', changed: true }, { text: ', 3 ]', changed: false }],
      actual: [{ text: '[ 1, ', changed: false }, { text: '5', changed: true }, { text: ', 3 ]', changed: false }],
    });
  });

  test('chybějící část na jedné straně je prázdná změna', () => {
    assert.deepEqual(highlightDifference("'Ahoj Evo'", "'Ahoj'"), {
      expected: [{ text: "'Ahoj", changed: false }, { text: ' Evo', changed: true }, { text: "'", changed: false }],
      actual: [{ text: "'Ahoj", changed: false }, { text: '', changed: true }, { text: "'", changed: false }],
    });
  });

  test('stejné texty nic nezvýrazní; úplně jiné zvýrazní celé', () => {
    assert.deepEqual(highlightDifference('3', '3'), { expected: [{ text: '3', changed: false }], actual: [{ text: '3', changed: false }] });
    assert.deepEqual(highlightDifference('3', 'undefined'), { expected: [{ text: '3', changed: true }], actual: [{ text: 'undefined', changed: true }] });
  });
});

describe('popisky a výběr', () => {
  test('valueLabels podle operátoru', () => {
    assert.deepEqual(valueLabels('strictEqual'), { expected: 'Očekávám', actual: 'Tvůj kód vrátil' });
    assert.equal(valueLabels('notDeepStrictEqual').expected, 'Nemá být');
    assert.equal(valueLabels('match').expected, 'Má odpovídat výrazu');
    assert.equal(valueLabels('==').expected, 'Očekávám pravdivou hodnotu');
    assert.equal(comparesEquality('deepStrictEqual'), true);
    assert.equal(comparesEquality('match'), false);
  });

  test('firstFailedIndex přeskočí prošlé a neověřené', () => {
    const run = { results: [{ index: 0, pass: true }, { index: 1, pass: false, skipped: true }, { index: 3, pass: false }, { index: 2, pass: false }] };
    assert.equal(firstFailedIndex(run), 2);
    assert.equal(firstFailedIndex({ results: [{ index: 0, pass: true }] }), -1);
  });

  test('explainResult vysvětlí chyby kódu, aserce ne', () => {
    assert.equal(explainResult({ error: "TypeError: Cannot read properties of undefined (reading 'x')", errorName: 'TypeError' }).id, 'cannot-read-undefined');
    assert.equal(explainResult({ error: "Cannot read properties of undefined (reading 'x')", errorName: 'TypeError' }).id, 'cannot-read-undefined');
    assert.equal(explainResult({ error: 'Test nedoběhl včas — nekonečná smyčka?' }).id, 'test-timeout');
    assert.equal(explainResult({ error: 'sum([1, 2]) má vrátit 3', errorName: 'AssertionError' }), null);
    assert.equal(explainResult({ error: '' }), null);
  });

  test('locationInMessage a inlineCodeSegments', () => {
    assert.deepEqual(locationInMessage('ReferenceError: x is not defined (script.js:12)'), { file: 'script.js', line: 12 });
    assert.deepEqual(locationInMessage('ReferenceError: x (js/app.js:3)'), { file: 'js/app.js', line: 3 });
    assert.equal(locationInMessage('Error: bez místa'), null);
    assert.deepEqual(inlineCodeSegments('Použij `let` místo `const`.'), [
      { text: 'Použij ', code: false }, { text: 'let', code: true }, { text: ' místo ', code: false }, { text: 'const', code: true }, { text: '.', code: false },
    ]);
  });
});
