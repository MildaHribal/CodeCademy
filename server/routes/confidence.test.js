// Jistota odpovědí (kontrakt kap. 12.4).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../app.js';
import { routeModules } from './index.js';
import { register as registerConfidence } from './confidence.js';
import { addAnswer, emptyConfidence, migrateConfidence, sectionConfidence, sectionOfItem } from './_confidence-store.js';

const contentDir = path.join(import.meta.dirname, '..', 'test-fixtures', 'reviews', 'content');

describe('výpočty jistoty', () => {
  test('sekce z id položky', () => {
    assert.equal(sectionOfItem('q:js-pole/kviz#1b4f0e98'), 'js-pole');
    assert.equal(sectionOfItem('card:css-flexbox#77aa01bc'), 'css-flexbox');
    assert.equal(sectionOfItem('step:node-zaklady/workshop/003'), 'node-zaklady');
    assert.equal(sectionOfItem('js-pole/kviz'), null);
    assert.equal(sectionOfItem(null), null);
  });

  test('přičítá jen platnou jistotu a správnost', () => {
    const data = emptyConfidence();
    assert.equal(addAnswer(data, { sectionId: 'a', ok: true, confidence: 'sure' }), true);
    addAnswer(data, { sectionId: 'a', ok: false, confidence: 'sure' });
    addAnswer(data, { sectionId: 'a', ok: true, confidence: 'guess' });
    assert.equal(addAnswer(data, { sectionId: 'a', ok: true, confidence: null }), false);
    assert.equal(addAnswer(data, { sectionId: 'a', ok: 'ano', confidence: 'sure' }), false);
    assert.deepEqual(sectionConfidence(data, 'a'), { sectionId: 'a', sure: { total: 2, correct: 1 }, guess: { total: 1, correct: 1 } });
    assert.deepEqual(sectionConfidence(data, 'b'), { sectionId: 'b', sure: { total: 0, correct: 0 }, guess: { total: 0, correct: 0 } });
  });

  test('poškozená data', () => {
    assert.equal(migrateConfidence({ version: 1 }), null);
    assert.equal(migrateConfidence([]), null);
    assert.deepEqual(migrateConfidence({ version: 1, sections: {} }), { version: 1, sections: {} });
  });
});

describe('/api/confidence', () => {
  let root;
  let server;
  let baseUrl;
  let ctx;

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-confidence-test-'));
    const routes = [
      ...routeModules.filter((m) => !['confidence.js', 'reviews.js', 'attempts.js'].includes(m.name)),
      { name: 'confidence.js', register: (router, routeCtx) => { ctx = routeCtx; registerConfidence(router, routeCtx); } },
    ];
    server = createApp({
      contentDir,
      dataDir: path.join(root, 'data'),
      projectsDir: path.join(root, 'moje-projekty'),
      distDir: path.join(root, 'dist'),
      routes,
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });

  const call = async (method, url, body) => {
    const res = await fetch(baseUrl + url, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, data: await res.json() };
  };

  test('odpovědi s jistotou z pokusů a z opakování; reset postupu jistotu nemaže', async () => {
    const attempt = (id, body) => ctx.emit('attempts:recorded', { id, body: { id, ...body }, attempt: {}, previous: null, firstOk: false });
    await attempt('q:alfa/kviz#00000001', { ok: true, confidence: 'sure' });
    await attempt('q:alfa/kviz#00000002', { ok: false, confidence: 'sure' });
    await attempt('q:alfa/kviz#00000003', { ok: true, confidence: 'guess' });
    await attempt('q:alfa/kviz#00000004', { ok: true }); // bez jistoty se nepočítá
    await attempt('alfa/workshop/001', { ok: true, confidence: 'sure' }); // jen otázky
    await ctx.emit('reviews:answered', { id: 'card:beta#aaaa0001', ok: true, confidence: 'sure', sectionId: 'beta' });
    await ctx.emit('reviews:answered', { id: 'card:beta#aaaa0001', ok: true, confidence: null, sectionId: 'beta' });

    assert.deepEqual((await call('GET', '/api/confidence/alfa')).data, {
      sectionId: 'alfa', sure: { total: 2, correct: 1 }, guess: { total: 1, correct: 1 },
    });
    assert.deepEqual((await call('GET', '/api/confidence')).data, {
      version: 1,
      sections: {
        alfa: { sure: { total: 2, correct: 1 }, guess: { total: 1, correct: 1 } },
        beta: { sure: { total: 1, correct: 1 }, guess: { total: 0, correct: 0 } },
      },
    });

    await call('POST', '/api/progress/reset', { id: 'alfa' });
    assert.equal((await call('GET', '/api/confidence/alfa')).data.sure.total, 2);

    await ctx.createJsonStore('jistota.json').flush();
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'data', 'jistota.json'), 'utf8')).version, 1);
  });

  test('sekce bez odpovědí vrací nuly, neplatný slug 400', async () => {
    assert.deepEqual((await call('GET', '/api/confidence/nic-tu-neni')).data, {
      sectionId: 'nic-tu-neni', sure: { total: 0, correct: 0 }, guess: { total: 0, correct: 0 },
    });
    assert.equal((await call('GET', '/api/confidence/Neplatna_Sekce')).status, 400);
  });
});
