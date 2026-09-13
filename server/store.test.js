import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { createJsonStore } from './store.js';

describe('createJsonStore', () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-store-test-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const defaults = () => ({ version: 1, items: {} });
  const migrate = (data) => (data && typeof data.items === 'object' && !Array.isArray(data.items) ? data : null);

  test('bez souboru vrací výchozí data a nic nezapíše', () => {
    const store = createJsonStore(path.join(dir, 'a.json'), { defaults });
    assert.deepEqual(store.get(), defaults());
    assert.equal(fs.existsSync(store.file), false);
  });

  test('update zapíše atomicky, vytvoří adresář a get vrací kopii', async () => {
    const store = createJsonStore(path.join(dir, 'vnoreny', 'b.json'), { defaults });
    const returned = store.update((draft) => {
      draft.items.x = 1;
      return 'hotovo';
    });
    assert.equal(returned, 'hotovo');
    store.get().items.x = 999;
    assert.equal(store.get().items.x, 1);

    await store.flush();
    assert.deepEqual(fs.readdirSync(path.join(dir, 'vnoreny')), ['b.json']);
    assert.deepEqual(JSON.parse(fs.readFileSync(store.file, 'utf8')), { version: 1, items: { x: 1 } });
  });

  test('výjimka v update nic nezmění', async () => {
    const store = createJsonStore(path.join(dir, 'c.json'), { defaults });
    store.update((draft) => {
      draft.items.a = 1;
    });
    assert.throws(() => store.update((draft) => {
      draft.items.b = 2;
      throw new Error('špatný vstup');
    }), /špatný vstup/);
    assert.deepEqual(store.get().items, { a: 1 });
    await store.flush();
  });

  test('fronta zápisů: rychlé změny se sloučí a na disku skončí poslední stav', async () => {
    const store = createJsonStore(path.join(dir, 'd.json'), { defaults });
    const writes = [];
    const original = fs.promises.rename;
    fs.promises.rename = async (...args) => {
      writes.push(args[1]);
      return original(...args);
    };
    try {
      for (let i = 0; i < 50; i++) store.update((draft) => { draft.items[`k${i}`] = i; });
      await store.flush();
    } finally {
      fs.promises.rename = original;
    }
    assert.ok(writes.length >= 1 && writes.length <= 2, `čekal jsem 1–2 zápisy, bylo jich ${writes.length}`);
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(store.file, 'utf8')).items).length, 50);
  });

  test('poškozený soubor → .broken-<čas> a výchozí data', async (t) => {
    t.mock.method(console, 'warn', () => {});
    const file = path.join(dir, 'e.json');
    fs.writeFileSync(file, '{ "items": [] }');
    const store = createJsonStore(file, { defaults, migrate, now: () => new Date('2026-09-14T08:00:00.000Z') });
    assert.deepEqual(store.get(), defaults());
    assert.deepEqual(fs.readdirSync(dir), ['e.json.broken-2026-09-14T08-00-00-000Z']);

    const other = path.join(dir, 'f.json');
    fs.writeFileSync(other, 'není json');
    assert.deepEqual(createJsonStore(other, { defaults }).get(), defaults());
    assert.ok(fs.readdirSync(dir).some((name) => name.startsWith('f.json.broken-')));
  });

  test('migrate převede starý tvar dat', () => {
    const file = path.join(dir, 'g.json');
    fs.writeFileSync(file, JSON.stringify({ list: ['a'] }));
    const store = createJsonStore(file, {
      defaults,
      migrate: (data) => (Array.isArray(data.list) ? { version: 1, items: Object.fromEntries(data.list.map((k) => [k, true])) } : data),
    });
    assert.deepEqual(store.get(), { version: 1, items: { a: true } });
  });

  test('dvě instance nad stejným souborem sdílí stav i nezapsané změny', async () => {
    const file = path.join(dir, 'h.json');
    const first = createJsonStore(file, { defaults });
    first.update((draft) => { draft.items.a = 1; });
    const second = createJsonStore(file, { defaults });
    assert.deepEqual(second.get().items, { a: 1 });
    second.update((draft) => { draft.items.b = 2; });
    assert.deepEqual(first.get().items, { a: 1, b: 2 });
    await first.flush();
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).items, { a: 1, b: 2 });
  });

  test('set a clear', async () => {
    const store = createJsonStore(path.join(dir, 'i.json'), { defaults });
    store.set({ version: 1, items: { z: true } });
    assert.deepEqual(store.get().items, { z: true });
    store.clear();
    assert.deepEqual(store.get(), defaults());
    await store.flush();
    assert.deepEqual(JSON.parse(fs.readFileSync(store.file, 'utf8')), defaults());
  });
});

describe('createJsonStore při ukončení procesu', () => {
  test('nezapsané změny se dopíšou synchronně při exit', async () => {
    const { spawnSync } = await import('node:child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-store-exit-'));
    try {
      const file = path.join(dir, 'exit.json');
      const script = `
        import { createJsonStore } from ${JSON.stringify(new URL('./store.js', import.meta.url).href)};
        const store = createJsonStore(${JSON.stringify(file)}, { defaults: () => ({ items: {} }) });
        store.update((d) => { d.items.a = 1; });
        process.exit(0);   // asynchronní zápis nestihne doběhnout
      `;
      const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { items: { a: 1 } });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
