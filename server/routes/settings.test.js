import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../app.js';
import { routeModules } from './index.js';
import { listenInRange } from '../../tools/lib/listen.js';
import { normalizeSettings } from './settings.js';

const contentDir = path.join(import.meta.dirname, '..', 'test-fixtures', 'content');

describe('nastavení', () => {
  let root;
  let server;
  let baseUrl;

  const dataDir = () => path.join(root, 'data');

  async function start() {
    server = createApp({
      contentDir,
      dataDir: dataDir(),
      projectsDir: path.join(root, 'moje-projekty'),
      distDir: path.join(root, 'dist'),
      routes: routeModules.filter((m) => m.name === 'settings.js'),
    });
    baseUrl = `http://127.0.0.1:${await listenInRange(server, { from: 4500, to: 4519 })}`;
  }

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-settings-test-'));
    await start();
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });

  async function call(method, body) {
    const res = await fetch(`${baseUrl}/api/settings`, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  test('výchozí hodnoty bez version', async () => {
    assert.deepEqual(await call('GET'), { status: 200, data: { theme: 'system', previewWidth: 'tests' } });
  });

  test('PUT s částí klíčů sloučí a vrátí celé nastavení; soubor má version 1', async () => {
    assert.deepEqual((await call('PUT', { theme: 'dark' })).data, { theme: 'dark', previewWidth: 'tests' });
    assert.deepEqual((await call('PUT', { previewWidth: '375' })).data, { theme: 'dark', previewWidth: '375' });
    assert.deepEqual((await call('PUT', {})).data, { theme: 'dark', previewWidth: '375' });
    await server.akademie.ctx.createJsonStore('nastaveni.json').flush();
    const file = JSON.parse(fs.readFileSync(path.join(dataDir(), 'nastaveni.json'), 'utf8'));
    assert.deepEqual(file, { version: 1, theme: 'dark', previewWidth: '375' });
  });

  test('neznámý klíč nebo hodnota = 400 a nic se nezmění', async () => {
    const unknownKey = await call('PUT', { fontSize: 20 });
    assert.equal(unknownKey.status, 400);
    assert.match(unknownKey.data.error, /fontSize/);
    assert.equal((await call('PUT', { theme: 'sepia' })).status, 400);
    assert.equal((await call('PUT', { previewWidth: 768 })).status, 400, 'šířka je text "768", ne číslo');
    assert.equal((await call('PUT', { theme: 'light', previewWidth: 'obri' })).status, 400);
    assert.deepEqual((await call('GET')).data, { theme: 'dark', previewWidth: '375' });
  });

  test('ručně rozbité hodnoty v souboru se nahradí výchozími', () => {
    assert.deepEqual(normalizeSettings({ version: 1, theme: 'sepia', previewWidth: '768', navic: true }), {
      version: 1, theme: 'system', previewWidth: '768',
    });
    assert.equal(normalizeSettings([]), null);
  });
});
