import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { InputError } from './errors.js';
import { createProgressStore, emptyProgress } from './progress.js';

describe('progress', () => {
  let dataDir;

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-progress-test-'));
  });

  afterEach(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  test('bez souboru začíná prázdným postupem a nic nezapíše', () => {
    const store = createProgressStore(dataDir);
    assert.deepEqual(store.get(), emptyProgress());
    assert.equal(fs.existsSync(store.file), false);
  });

  test('saveCode uloží kód, nastaví lastVisited a přežije restart', () => {
    const store = createProgressStore(dataDir, { now: () => new Date('2026-09-13T10:00:00.000Z') });
    store.saveCode('css-flexbox/workshop/002', [{ name: 'styles.css', content: 'nav {}', extra: 'pryč' }]);

    const reloaded = createProgressStore(dataDir).get();
    assert.deepEqual(reloaded.code['css-flexbox/workshop/002'], {
      files: [{ name: 'styles.css', content: 'nav {}' }],
      updated: '2026-09-13T10:00:00.000Z',
    });
    assert.equal(reloaded.lastVisited, 'css-flexbox/workshop/002');
  });

  test('complete si pamatuje první datum a nejlepší skóre', () => {
    let clock = new Date('2026-09-13T10:00:00.000Z');
    const store = createProgressStore(dataDir, { now: () => clock });

    store.complete('css-flexbox/kviz', 0.6);
    clock = new Date('2026-09-14T10:00:00.000Z');
    store.complete('css-flexbox/kviz', 0.9);
    const progress = store.complete('css-flexbox/kviz', 0.7);

    assert.equal(progress.completed['css-flexbox/kviz'], '2026-09-13T10:00:00.000Z');
    assert.equal(progress.scores['css-flexbox/kviz'], 0.9);
    assert.equal(progress.lastVisited, 'css-flexbox/kviz');

    const withoutScore = store.complete('css-flexbox/lekce');
    assert.equal('css-flexbox/lekce' in withoutScore.scores, false);
  });

  test('reset smaže id i všechno pod ním, ale ne podobně pojmenované sousedy', () => {
    const store = createProgressStore(dataDir);
    store.complete('s/workshop/001');
    store.complete('s/workshop/002');
    store.saveCode('s/workshop/002', [{ name: 'a.js', content: '' }]);
    store.complete('s/workshop-2/001');
    store.complete('s/kviz', 1);

    store.reset('s/kviz');
    const progress = store.reset('s/workshop');

    assert.deepEqual(Object.keys(progress.completed), ['s/workshop-2/001']);
    assert.deepEqual(progress.scores, {});
    assert.deepEqual(progress.code, {});
    assert.deepEqual(createProgressStore(dataDir).get().completed, progress.completed);
  });

  test('zápis je atomický — nezůstane po něm .tmp a soubor je platný JSON', () => {
    const store = createProgressStore(dataDir);
    store.complete('a/b');
    assert.deepEqual(fs.readdirSync(dataDir), ['progress.json']);
    assert.equal(JSON.parse(fs.readFileSync(store.file, 'utf8')).version, 1);
  });

  test('poškozený soubor přejmenuje na .broken-<čas> a začne znovu', (t) => {
    t.mock.method(console, 'warn', () => {});
    fs.writeFileSync(path.join(dataDir, 'progress.json'), '{ "completed": ');
    const store = createProgressStore(dataDir, { now: () => new Date('2026-09-13T10:00:00.000Z') });

    assert.deepEqual(store.get(), emptyProgress());
    const broken = 'progress.json.broken-2026-09-13T10-00-00-000Z';
    assert.deepEqual(fs.readdirSync(dataDir), [broken]);
    assert.equal(fs.readFileSync(path.join(dataDir, broken), 'utf8'), '{ "completed": ');

    store.complete('a/b');
    assert.deepEqual(fs.readdirSync(dataDir).sort(), ['progress.json', broken]);
  });

  test('JSON se špatným tvarem se také bere jako poškozený', (t) => {
    t.mock.method(console, 'warn', () => {});
    fs.writeFileSync(path.join(dataDir, 'progress.json'), '{ "completed": [] }');
    const store = createProgressStore(dataDir);
    assert.deepEqual(store.get(), emptyProgress());
    assert.equal(fs.readdirSync(dataDir).some((f) => f.startsWith('progress.json.broken-')), true);
  });

  test('neplatné vstupy vyhodí InputError', () => {
    const store = createProgressStore(dataDir);
    assert.throws(() => store.complete('../ven'), InputError);
    assert.throws(() => store.complete(''), InputError);
    assert.throws(() => store.complete('a/b', 'hodně'), InputError);
    assert.throws(() => store.saveCode('a/b', 'není pole'), InputError);
    assert.throws(() => store.saveCode('a/b', [{ name: 'x.js' }]), InputError);
    assert.throws(() => store.reset(42), InputError);
  });

  test('id se jménem vlastnosti z Object.prototype se uloží jako každé jiné', () => {
    const store = createProgressStore(dataDir);
    store.complete('constructor', 0.5);
    assert.equal(typeof store.get().completed.constructor, 'string');
    assert.equal(store.get().scores.constructor, 0.5);
  });

  test('get vrací kopii', () => {
    const store = createProgressStore(dataDir);
    store.get().completed['a/b'] = 'podvod';
    assert.deepEqual(store.get().completed, {});
  });
});
