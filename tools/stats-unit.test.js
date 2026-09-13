// Texty statistik a měření aktivního času bez prohlížeče
// (client/src/extensions/stats/format.js, client/src/extensions/attempts/active-time.js).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { formatDuration, itemHref, stepNumber, timesText } from '../client/src/extensions/stats/format.js';
import { createActiveTimer, IDLE_AFTER_MS, MAX_ACTIVE_MS } from '../client/src/extensions/attempts/active-time.js';

describe('statistiky — texty', () => {
  test('formatDuration', () => {
    assert.equal(formatDuration(0), 'méně než minuta');
    assert.equal(formatDuration(29_000), 'méně než minuta');
    assert.equal(formatDuration(45 * 60_000), '45 min');
    assert.equal(formatDuration(120 * 60_000), '2 h');
    assert.equal(formatDuration(65 * 60_000 + 10_000), '1 h 5 min');
    assert.equal(formatDuration(undefined), 'méně než minuta');
  });

  test('odkazy a čísla kroků', () => {
    assert.equal(itemHref('js-pole/workshop/017'), '#/modul/js-pole/workshop/017');
    assert.equal(stepNumber('js-pole/workshop/017'), 17);
    assert.equal(stepNumber('js-pole/lab'), null);
    assert.equal(timesText(3, 'neprošlo'), '3× neprošlo');
  });
});

describe('aktivní čas', () => {
  function fakeClock() {
    let time = 1_000_000;
    return { now: () => time, advance: (ms) => (time += ms) };
  }

  test('počítá čas mezi aktivitami, dlouhou pauzu ne', () => {
    const clock = fakeClock();
    const timer = createActiveTimer({ now: clock.now });
    timer.activity();
    clock.advance(10_000);
    timer.activity();
    clock.advance(20_000);
    timer.activity();
    clock.advance(IDLE_AFTER_MS + 1); // odešel od počítače
    timer.activity();
    clock.advance(5_000);
    assert.equal(timer.take(), 35_000, 'take započte i čas od poslední aktivity');
    assert.equal(timer.take(), 0);
  });

  test('pause (skrytá karta) měření zastaví, další aktivita ho zase spustí', () => {
    const clock = fakeClock();
    const timer = createActiveTimer({ now: clock.now });
    timer.activity();
    clock.advance(4_000);
    timer.pause();
    clock.advance(30_000);
    assert.equal(timer.take(), 4_000);
    timer.activity();
    clock.advance(1_000);
    assert.equal(timer.take(), 1_000);
  });

  test('odeslat jde nejvýš hodinu, zbytek počká', () => {
    const clock = fakeClock();
    const timer = createActiveTimer({ now: clock.now, idleAfterMs: Infinity });
    timer.activity();
    clock.advance(MAX_ACTIVE_MS + 5_000);
    assert.equal(timer.take(), MAX_ACTIVE_MS);
    timer.pause();
    assert.equal(timer.take(), 5_000);
  });
});
