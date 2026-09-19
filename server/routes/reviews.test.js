import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, describe, test } from 'node:test';
import { createApp } from '../app.js';
import { routeModules } from './index.js';
import { register as registerReviews } from './reviews.js';
import { register as registerConfidence } from './confidence.js';
import { DAILY_LIMIT, addDays, localDate } from './_reviews-store.js';

const contentDir = path.join(import.meta.dirname, '..', 'test-fixtures', 'reviews', 'content');

const choiceQuestion = (key, text = 'Co vypíše `typeof 1`?') => ({
  key, type: 'choice', text, multiple: false,
  answers: [{ text: '`string`', correct: false, why: 'Myslíš si…' }, { text: '`number`', correct: true, why: '' }],
  see: [],
});

const cards = {
  alfa: [
    { key: 'aaaa0001', type: 'output', text: 'Co vypíše `[] + []`?', expected: "''", accept: [], ignoreCase: false, why: '', see: ['alfa/lekce#hlavni-myslenka'] },
    { key: 'aaaa0002', type: 'free', text: 'Proč je `const` pole měnitelné?', back: 'Protože…', see: [] },
    { key: 'aaaa0003', type: 'css', text: 'Zalom položky.', expected: 'flex-wrap: wrap;', accept: [], ignoreCase: false, why: '', see: ['alfa/workshop/001'] },
  ],
};

let existing;
let brokenIds;

function fakeResolve(ctx) {
  return (id) => {
    if (brokenIds.has(id)) throw Object.assign(new Error('rozbitý obsah'), { name: 'ParseError' });
    if (id.startsWith('step:')) return ctx.resolveItem(id);
    if (!existing.has(id)) return null;
    const [type, rest] = id.split(':');
    const [target, key] = rest.split('#');
    const sectionId = target.split('/')[0];
    if (type === 'q') {
      return { id, type: 'question', source: { sectionId, moduleId: target, title: `Kvíz ${sectionId}`, see: [] }, content: choiceQuestion(key) };
    }
    if (type === 'card') {
      const card = cards[sectionId]?.find((c) => c.key === key);
      return card ? { id, type: 'card', source: { sectionId, moduleId: null, title: sectionId, see: card.see }, content: card } : null;
    }
    if (type === 'explain') {
      return { id, type: 'explain', source: { sectionId, moduleId: target, title: 'Lekce', see: [] }, content: { prompt: 'Vysvětli…', point: { key, text: 'Bod' }, model: 'Model' } };
    }
    return null;
  };
}

describe('opakování /api/reviews', () => {
  let root;
  let server;
  let baseUrl;
  let ctx;
  let clock;
  const answered = [];

  const setNow = (text) => {
    const [date, time = '10:00'] = text.split(' ');
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    clock = new Date(y, m - 1, d, hh, mm);
  };
  const today = () => localDate(clock);

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-reviews-test-'));
    setNow('2026-09-13');
    const testRoutes = {
      name: 'reviews.js',
      register(router, routeCtx) {
        ctx = routeCtx;
        registerReviews(router, routeCtx, {
          now: () => clock,
          resolveItem: fakeResolve(routeCtx),
          listCards: () => Object.entries(cards).map(([sectionId, list]) => ({ sectionId, cards: list })),
        });
        routeCtx.on('reviews:answered', (payload) => answered.push(payload));
      },
    };
    const routes = [
      ...routeModules.filter((m) => !['reviews.js', 'confidence.js', 'attempts.js'].includes(m.name)),
      testRoutes,
      { name: 'confidence.js', register: registerConfidence },
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

  beforeEach(async () => {
    setNow('2026-09-13');
    existing = new Set();
    brokenIds = new Set();
    answered.length = 0;
    ctx.createJsonStore('opakovani.json').set({ version: 1, items: {}, removed: {} });
    await call('POST', '/api/progress/reset', { id: 'alfa' });
    await call('POST', '/api/progress/reset', { id: 'beta' });
  });

  async function call(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, data: await res.json() };
  }

  const items = () => ctx.createJsonStore('opakovani.json').get().items;
  const removed = () => ctx.createJsonStore('opakovani.json').get().removed;

  const recordAttempt = (id, body, extra = {}) => ctx.emit('attempts:recorded', { id, body: { id, ...body }, attempt: {}, previous: null, firstOk: false, ...extra });

  describe('založení z první odpovědi', () => {
    test('správně a jistě → krabička 2 za 3 dny; tip nebo bez jistoty → 1 zítra; špatně → 1 zítra', async () => {
      for (const id of ['q:alfa/kviz#00000001', 'q:alfa/kviz#00000002', 'q:alfa/kviz#00000003', 'q:alfa/kviz#00000004']) existing.add(id);
      await recordAttempt('q:alfa/kviz#00000001', { ok: true, confidence: 'sure' });
      await recordAttempt('q:alfa/kviz#00000002', { ok: true, confidence: 'guess' });
      await recordAttempt('q:alfa/kviz#00000003', { ok: true });
      await recordAttempt('q:alfa/kviz#00000004', { ok: false, confidence: 'sure' });

      const data = items();
      assert.deepEqual([data['q:alfa/kviz#00000001'].box, data['q:alfa/kviz#00000001'].due], [2, '2026-09-16']);
      assert.deepEqual([data['q:alfa/kviz#00000002'].box, data['q:alfa/kviz#00000002'].due], [1, '2026-09-14']);
      assert.deepEqual([data['q:alfa/kviz#00000003'].box, data['q:alfa/kviz#00000003'].due], [1, '2026-09-14']);
      assert.deepEqual([data['q:alfa/kviz#00000004'].box, data['q:alfa/kviz#00000004'].due], [1, '2026-09-14']);
      assert.equal(data['q:alfa/kviz#00000001'].reason, 'first-answer');
      assert.equal(data['q:alfa/kviz#00000001'].lastAnswered, null);
      assert.deepEqual(data['q:alfa/kviz#00000004'].history.map((h) => [h.ok, h.confidence]), [[false, 'sure']]);
    });

    test('další odpověď existující položku nemění; bez ok ani s neplatným id nic nezaloží', async () => {
      await recordAttempt('q:alfa/kviz#00000001', { ok: false });
      await recordAttempt('q:alfa/kviz#00000001', { ok: true, confidence: 'sure' });
      assert.equal(items()['q:alfa/kviz#00000001'].box, 1);
      await recordAttempt('q:alfa/kviz#00000009', { tipsOpened: 1 });
      await recordAttempt('q:neplatne', { ok: true });
      assert.deepEqual(Object.keys(items()), ['q:alfa/kviz#00000001']);
    });

    test('krok splněný s řešením nebo po 3 neúspěších se vrátí od seedu', async () => {
      await recordAttempt('alfa/workshop/001', { ok: true }, { firstOk: true, attempt: { assisted: true, fails: 0 } });
      await recordAttempt('alfa/workshop/002', { ok: true }, { firstOk: true, attempt: { assisted: false, fails: 3 } });
      await recordAttempt('alfa/workshop/002', { ok: true }, { firstOk: false, attempt: { assisted: true, fails: 9 } });
      await recordAttempt('alfa/workshop/999', { ok: true }, { firstOk: true, attempt: { assisted: true } });
      await recordAttempt('alfa/kviz', { ok: true }, { firstOk: true, attempt: { assisted: true } });
      const data = items();
      assert.deepEqual(Object.keys(data).sort(), ['step:alfa/workshop/001', 'step:alfa/workshop/002']);
      assert.equal(data['step:alfa/workshop/001'].reason, 'assisted');
      assert.equal(data['step:alfa/workshop/002'].reason, 'fails');
      assert.equal(data['step:alfa/workshop/001'].due, '2026-09-14');
    });
  });

  describe('POST /api/reviews/answer', () => {
    test('správně → o krabičku výš; s „Tipuju" krabička zůstává; špatně → 1 zítra', async () => {
      const id = 'q:alfa/kviz#00000001';
      existing.add(id);
      await recordAttempt(id, { ok: true, confidence: 'sure' });

      let res = await call('POST', '/api/reviews/answer', { id, ok: true, confidence: 'sure' });
      assert.deepEqual(res, { status: 200, data: { ok: true, item: { id, box: 3, due: addDays(today(), 7) } } });

      res = await call('POST', '/api/reviews/answer', { id, ok: true });
      assert.deepEqual(res.data.item, { id, box: 4, due: addDays(today(), 16) });

      res = await call('POST', '/api/reviews/answer', { id, ok: true, confidence: 'guess' });
      assert.deepEqual(res.data.item, { id, box: 4, due: addDays(today(), 16) }, '„Tipuju" nepovyšuje');

      res = await call('POST', '/api/reviews/answer', { id, ok: false, confidence: 'sure' });
      assert.deepEqual(res.data.item, { id, box: 1, due: addDays(today(), 1) });

      assert.deepEqual(answered.map((a) => [a.ok, a.confidence, a.sectionId]), [[true, 'sure', 'alfa'], [true, null, 'alfa'], [true, 'guess', 'alfa'], [false, 'sure', 'alfa']]);
      assert.equal(items()[id].lastAnswered, clock.toISOString());
    });

    test('krabička nejvýš 6 s intervalem 90 dní, historie nejvýš 20 záznamů', async () => {
      const id = 'q:alfa/kviz#00000002';
      existing.add(id);
      await recordAttempt(id, { ok: true, confidence: 'sure' });
      let last;
      for (let i = 0; i < 25; i++) last = await call('POST', '/api/reviews/answer', { id, ok: true, confidence: 'sure' });
      assert.deepEqual(last.data.item, { id, box: 6, due: addDays(today(), 90) });
      assert.equal(items()[id].history.length, 20);
    });

    test('neznámé id = 404, neplatné tělo = 400', async () => {
      assert.equal((await call('POST', '/api/reviews/answer', { id: 'q:alfa/kviz#0000dead', ok: true })).status, 404);
      assert.equal((await call('POST', '/api/reviews/answer', { id: 'q:alfa/kviz#00000001' })).status, 400);
      assert.equal((await call('POST', '/api/reviews/answer', { id: 'nesmysl', ok: true })).status, 400);
      assert.equal((await call('POST', '/api/reviews/answer', { id: 'q:alfa/kviz#00000001', ok: true, confidence: 'asi' })).status, 400);
    });

    test('jistota z opakování se přičte do /api/confidence', async () => {
      const id = 'q:beta/kviz#00000001';
      existing.add(id);
      await recordAttempt(id, { ok: false });
      const before = (await call('GET', '/api/confidence/beta')).data;
      await call('POST', '/api/reviews/answer', { id, ok: true, confidence: 'sure' });
      await call('POST', '/api/reviews/answer', { id, ok: false, confidence: 'guess' });
      const afterData = (await call('GET', '/api/confidence/beta')).data;
      assert.equal(afterData.sure.total - before.sure.total, 1);
      assert.equal(afterData.sure.correct - before.sure.correct, 1);
      assert.equal(afterData.guess.total - before.guess.total, 1);
      assert.equal(afterData.guess.correct - before.guess.correct, 0);
    });
  });

  describe('GET /api/reviews/due a summary', () => {
    test('splatné seřazené podle due a krabičky, proložené po sekcích, s obsahem a odhadem času', async () => {
      const store = ctx.createJsonStore('opakovani.json');
      const item = (box, due) => ({ box, due, added: '2026-09-01T10:00:00.000Z', reason: 'first-answer', lastAnswered: null, history: [] });
      const data = {
        version: 1,
        items: {
          'q:alfa/kviz#00000001': item(1, '2026-09-10'),
          'q:alfa/kviz#00000002': item(2, '2026-09-11'),
          'q:alfa/kviz#00000003': item(1, '2026-09-12'),
          'q:beta/kviz#00000001': item(3, '2026-09-12'),
          'explain:alfa/lekce#00000005': item(1, '2026-09-13'),
          'q:alfa/kviz#00000009': item(1, '2026-09-14'),
        },
        removed: {},
      };
      for (const id of Object.keys(data.items)) existing.add(id);
      store.set(data);

      const due = (await call('GET', '/api/reviews/due')).data;
      assert.equal(due.date, '2026-09-13');
      assert.equal(due.total, 5);
      assert.equal(due.answeredToday, 0);
      assert.equal(due.limit, DAILY_LIMIT);
      assert.deepEqual(due.items.map((i) => i.id), [
        'q:alfa/kviz#00000001', 'q:beta/kviz#00000001', 'q:alfa/kviz#00000002', 'q:alfa/kviz#00000003', 'explain:alfa/lekce#00000005',
      ]);
      const first = due.items[0];
      assert.deepEqual({ type: first.type, box: first.box, due: first.due, source: first.source }, {
        type: 'question', box: 1, due: '2026-09-10', source: { sectionId: 'alfa', moduleId: 'alfa/kviz', title: 'Kvíz alfa', see: [] },
      });
      assert.equal(first.content.key, '00000001');
      assert.equal(due.estimateMinutes, 3);

      assert.deepEqual((await call('GET', '/api/reviews/summary')).data, { date: '2026-09-13', due: 5, estimateMinutes: 3 });
    });

    test('denní strop: nabídne se nejvýš limit − dnes zodpovězené', async () => {
      const store = ctx.createJsonStore('opakovani.json');
      const data = { version: 1, items: {}, removed: {} };
      for (let i = 0; i < 30; i++) {
        const id = `q:alfa/kviz#${String(i).padStart(8, '0')}`;
        existing.add(id);
        data.items[id] = { box: 1, due: '2026-09-13', added: 'x', reason: 'first-answer', lastAnswered: null, history: [] };
      }
      store.set(data);

      let due = (await call('GET', '/api/reviews/due')).data;
      assert.equal(due.total, 30);
      assert.equal(due.items.length, 20);

      for (const reviewItem of due.items.slice(0, 8)) await call('POST', '/api/reviews/answer', { id: reviewItem.id, ok: true });
      due = (await call('GET', '/api/reviews/due')).data;
      assert.equal(due.answeredToday, 8);
      assert.equal(due.total, 22);
      assert.equal(due.items.length, 12);
      assert.equal((await call('GET', '/api/reviews/summary')).data.due, 12);

      setNow('2026-09-14');
      due = (await call('GET', '/api/reviews/due')).data;
      assert.equal(due.answeredToday, 0);
      assert.equal(due.items.length, 20);
    });

    test('karty se aktivují po splnění modulu z první reference see, karta bez see po polovině modulů sekce', async () => {
      for (const card of cards.alfa) existing.add(`card:alfa#${card.key}`);
      assert.equal((await call('GET', '/api/reviews/due')).data.total, 0, 'bez splněných modulů nic');

      await call('POST', '/api/progress/complete', { id: 'alfa/lekce' });
      let due = (await call('GET', '/api/reviews/due')).data;
      assert.deepEqual(due.items.map((i) => i.id), ['card:alfa#aaaa0001']);
      assert.deepEqual({ type: due.items[0].type, due: due.items[0].due, box: due.items[0].box }, { type: 'card', due: '2026-09-13', box: 1 });
      assert.equal(items()['card:alfa#aaaa0001'].reason, 'card');

      await call('POST', '/api/progress/complete', { id: 'alfa/workshop/001' });
      assert.equal((await call('GET', '/api/reviews/due')).data.total, 1);
      await call('POST', '/api/progress/complete', { id: 'alfa/workshop/002' });
      due = (await call('GET', '/api/reviews/due')).data;
      assert.deepEqual(due.items.map((i) => i.id).sort(), ['card:alfa#aaaa0001', 'card:alfa#aaaa0002', 'card:alfa#aaaa0003']);
      assert.equal(due.estimateMinutes, 3);
    });

    test('osiřelé položky i záznamy „Už to umím" se smažou; rozbitý obsah položku nesmaže', async () => {
      const store = ctx.createJsonStore('opakovani.json');
      const item = { box: 1, due: '2026-09-13', added: 'x', reason: 'first-answer', lastAnswered: null, history: [] };
      store.set({
        version: 1,
        items: { 'q:alfa/kviz#00000001': item, 'q:alfa/kviz#0000dead': item, 'q:beta/kviz#00000007': item },
        removed: { 'card:alfa#0000dead': 'x', 'card:alfa#aaaa0002': 'x' },
      });
      existing.add('q:alfa/kviz#00000001');
      existing.add('card:alfa#aaaa0002');
      brokenIds.add('q:beta/kviz#00000007');

      const due = (await call('GET', '/api/reviews/due')).data;
      assert.deepEqual(due.items.map((i) => i.id), ['q:alfa/kviz#00000001']);
      assert.deepEqual(Object.keys(items()).sort(), ['q:alfa/kviz#00000001', 'q:beta/kviz#00000007']);
      assert.deepEqual(Object.keys(removed()), ['card:alfa#aaaa0002']);
    });
  });

  describe('add a remove', () => {
    test('add založí krabičku 1 na zítra, existující vrátí do krabičky 1 a smaže „Už to umím"', async () => {
      let res = await call('POST', '/api/reviews/add', { id: 'step:alfa/workshop/001', reason: 'self' });
      assert.equal(res.status, 200);
      assert.equal(res.data.created, true);
      assert.deepEqual([res.data.item.id, res.data.item.box, res.data.item.due, res.data.item.reason], ['step:alfa/workshop/001', 1, '2026-09-14', 'self']);

      existing.add('q:alfa/kviz#00000001');
      await recordAttempt('q:alfa/kviz#00000001', { ok: true, confidence: 'sure' });
      await call('POST', '/api/reviews/remove', { id: 'q:alfa/kviz#00000001' });
      res = await call('POST', '/api/reviews/add', { id: 'q:alfa/kviz#00000001', reason: 'self' });
      assert.equal(res.data.created, true);
      assert.equal(Object.hasOwn(removed(), 'q:alfa/kviz#00000001'), false);

      await call('POST', '/api/reviews/answer', { id: 'q:alfa/kviz#00000001', ok: true, confidence: 'sure' });
      res = await call('POST', '/api/reviews/add', { id: 'q:alfa/kviz#00000001', reason: 'explain' });
      assert.equal(res.data.created, false);
      assert.deepEqual([res.data.item.box, res.data.item.due], [1, '2026-09-14']);
    });

    test('add: neexistující obsah a neplatný důvod = 400', async () => {
      assert.equal((await call('POST', '/api/reviews/add', { id: 'step:alfa/workshop/999', reason: 'self' })).status, 400);
      assert.equal((await call('POST', '/api/reviews/add', { id: 'explain:alfa/lekce#0000beef', reason: 'explain' })).status, 400);
      assert.equal((await call('POST', '/api/reviews/add', { id: 'step:alfa/workshop/001', reason: 'first-answer' })).status, 400);
      assert.equal((await call('POST', '/api/reviews/add', { id: 42, reason: 'self' })).status, 400);
    });

    test('remove: položka zmizí a první odpověď ani aktivace karty ji znovu nezaloží', async () => {
      existing.add('q:alfa/kviz#00000001');
      existing.add('card:alfa#aaaa0001');
      await recordAttempt('q:alfa/kviz#00000001', { ok: false });
      assert.deepEqual((await call('POST', '/api/reviews/remove', { id: 'q:alfa/kviz#00000001' })).data, { ok: true, removed: true });
      assert.deepEqual((await call('POST', '/api/reviews/remove', { id: 'card:alfa#aaaa0001' })).data, { ok: true, removed: false });

      await recordAttempt('q:alfa/kviz#00000001', { ok: false });
      await call('POST', '/api/progress/complete', { id: 'alfa/lekce' });
      assert.equal((await call('GET', '/api/reviews/due')).data.total, 0);
      assert.deepEqual(items(), {});
      assert.deepEqual(Object.keys(removed()).sort(), ['card:alfa#aaaa0001', 'q:alfa/kviz#00000001']);
      assert.equal((await call('POST', '/api/reviews/remove', { id: 'x' })).status, 400);
    });
  });

  test('reset postupu maže položky i „Už to umím" podle cíle položky', async () => {
    for (const id of ['q:alfa/kviz#00000001', 'q:beta/kviz#00000001', 'card:alfa#aaaa0002', 'explain:alfa/lekce#00000005']) existing.add(id);
    await recordAttempt('q:alfa/kviz#00000001', { ok: true });
    await recordAttempt('q:beta/kviz#00000001', { ok: true });
    await call('POST', '/api/reviews/add', { id: 'step:alfa/workshop/001', reason: 'self' });
    await call('POST', '/api/reviews/add', { id: 'explain:alfa/lekce#00000005', reason: 'explain' });
    await call('POST', '/api/reviews/remove', { id: 'card:alfa#aaaa0002' });

    await call('POST', '/api/progress/reset', { id: 'alfa/workshop' });
    assert.deepEqual(Object.keys(items()).sort(), ['explain:alfa/lekce#00000005', 'q:alfa/kviz#00000001', 'q:beta/kviz#00000001']);

    await call('POST', '/api/progress/reset', { id: 'alfa' });
    assert.deepEqual(Object.keys(items()), ['q:beta/kviz#00000001']);
    assert.deepEqual(removed(), {});
  });

  test('zápis na disk: data/opakovani.json ve tvaru kontraktu', async () => {
    existing.add('q:alfa/kviz#00000001');
    await recordAttempt('q:alfa/kviz#00000001', { ok: true, confidence: 'sure' });
    const store = ctx.createJsonStore('opakovani.json');
    await store.flush();
    const saved = JSON.parse(fs.readFileSync(path.join(root, 'data', 'opakovani.json'), 'utf8'));
    assert.equal(saved.version, 1);
    assert.deepEqual(Object.keys(saved.items['q:alfa/kviz#00000001']).sort(), ['added', 'box', 'due', 'history', 'lastAnswered', 'reason']);
    assert.deepEqual(saved.removed, {});
  });
});
