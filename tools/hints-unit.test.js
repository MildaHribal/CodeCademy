// Rozhodování nápověd bez prohlížeče (client/src/extensions/hints/logic.js, kontrakt kap. 3.3).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  failedHintIndexes, firstFailedIndex, focusTipIndex, helpButtonState, nextFailStreak, restoredOpenedCount, shouldHighlight,
} from '../client/src/extensions/hints/logic.js';

describe('nápovědy — logika', () => {
  const run = {
    results: [
      { index: 0, pass: true },
      { index: 1, pass: false, skipped: true },
      { index: 2, pass: false },
      { index: 3, pass: false },
    ],
  };

  test('selhané požadavky bez přeskočených', () => {
    assert.deepEqual(failedHintIndexes(run), [2, 3]);
    assert.equal(firstFailedIndex(run), 2);
    assert.equal(firstFailedIndex({ results: [{ index: 0, pass: true }] }), null);
    assert.deepEqual(failedHintIndexes(undefined), []);
  });

  test('zvýraznění po 2 neúspěšných kontrolách v řadě, úspěch počítadlo vynuluje', () => {
    let streak = 0;
    streak = nextFailStreak(streak, false);
    assert.equal(shouldHighlight(streak), false);
    streak = nextFailStreak(streak, false);
    assert.equal(shouldHighlight(streak), true);
    streak = nextFailStreak(streak, true);
    assert.equal(streak, 0);
    assert.equal(shouldHighlight(streak), false);
  });

  test('tlačítko: k ze n, po posledním tipu porovnání, bez tipů panel', () => {
    assert.deepEqual(helpButtonState(3, 0), { label: 'Potřebuju nápovědu (1 ze 3)', action: 'tip' });
    assert.deepEqual(helpButtonState(3, 2), { label: 'Potřebuju nápovědu (3 ze 3)', action: 'tip' });
    assert.deepEqual(helpButtonState(3, 3), { label: 'Porovnat s řešením', action: 'compare' });
    assert.deepEqual(helpButtonState(0, 0), { label: 'Potřebuju nápovědu', action: 'panel' });
  });

  describe('který tip zvýraznit', () => {
    const help = [
      { text: 'koncept', hintIndex: null },
      { text: 'k požadavku 2 (a)', hintIndex: 1 },
      { text: 'obecný vzor', hintIndex: null },
      { text: 'k požadavku 2 (b)', hintIndex: 1 },
    ];

    test('tip s hintIndex selhaného požadavku, nejdřív neotevřený', () => {
      assert.equal(focusTipIndex(help, 0, 1), 1);
      assert.equal(focusTipIndex(help, 2, 1), 3);
      assert.equal(focusTipIndex(help, 4, 1), 3, 'všechny otevřené → poslední k požadavku');
    });

    test('bez tipu k požadavku: další neotevřený tip bez hintIndex', () => {
      assert.equal(focusTipIndex(help, 0, 0), 0);
      assert.equal(focusTipIndex(help, 1, 0), 2);
      assert.equal(focusTipIndex(help, 3, null), null, 'obecné tipy došly');
      assert.equal(focusTipIndex([], 0, 0), null);
    });
  });

  test('obnovení otevřených tipů ze serveru drží rozsah', () => {
    assert.equal(restoredOpenedCount(2, 3), 2);
    assert.equal(restoredOpenedCount(7, 3), 3);
    assert.equal(restoredOpenedCount(undefined, 3), 0);
    assert.equal(restoredOpenedCount(-1, 3), 0);
  });
});
