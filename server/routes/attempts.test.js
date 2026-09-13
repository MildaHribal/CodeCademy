import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, describe, test } from 'node:test';
import { createApp } from '../app.js';
import { routeModules } from './index.js';
import { register as registerAttempts } from './attempts.js';
import { applyAttempt, attemptTarget, buildStats, emptyAttempt, validateAttemptBody } from './_attempts-store.js';

const contentDir = path.join(import.meta.dirname, '..', 'test-fixtures', 'content');

// Otázky potřebují klíče z parseru (kontrakt kap. 4.4). Test je nezávislý na parseru:
// jednu otázku kvízu podstrčí přes ctx.resolveItem, ostatní id jdou na skutečný obsah.
const QUESTION_ID = 'q:ukazka/kviz#1b4f0e98';
const QUESTION = {
  id: QUESTION_ID,
  type: 'question',
  source: { sectionId: 'ukazka', moduleId: 'ukazka/kviz', title: 'Kvíz', see: ['ukazka/lekce'] },
  content: { key: '1b4f0e98', type: 'text', text: 'Co vypíše `add(1, 2)`?', expected: '3', accept: [], ignoreCase: false, why: '', see: ['ukazka/lekce'] },
};

const attemptsWithQuestion = {
  name: 'attempts.js',
  register(router, ctx) {
    const testCtx = Object.create(ctx);
    testCtx.resolveItem = (id) => (id === QUESTION_ID ? structuredClone(QUESTION) : ctx.resolveItem(id));
    registerAttempts(router, testCtx);
  },
};

describe('pokusy — HTTP API (kontrakt kap. 12.2)', () => {
  let root;
  let server;
  let baseUrl;
  let events;

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-attempts-test-'));
    server = createApp({
      contentDir,
      dataDir: path.join(root, 'data'),
      projectsDir: path.join(root, 'moje-projekty'),
      distDir: path.join(root, 'dist'),
      routes: [...routeModules.filter((m) => m.name !== 'attempts.js'), attemptsWithQuestion],
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    server.akademie.ctx.on('attempts:recorded', (payload) => events.push(structuredClone(payload)));
  });

  after(async () => {
    // Nejdřív dopsat rozpracované zápisy, ať po smazání adresáře nehlásí chybu.
    await server.akademie.ctx.createJsonStore('pokusy.json').flush();
    await server.akademie.ctx.progress.flush();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });

  beforeEach(() => {
    events = [];
    server.akademie.ctx.createJsonStore('pokusy.json').set({ version: 1, items: {} });
  });

  async function call(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  const post = (body) => call('POST', '/api/attempts', body);

  test('neúspěšné kontroly, pak první ok: počty, failsSinceOk, failedHints, firstOkAt a událost', async () => {
    const id = 'ukazka/workshop/001';
    const first = await post({ id, ok: false, failed: [0] });
    assert.equal(first.status, 200);
    assert.equal(first.data.ok, true);
    assert.deepEqual({ ...first.data.attempt, lastAt: null }, {
      ...emptyAttempt(), checks: 1, fails: 1, failsSinceOk: 1, failedHints: { 0: 1 },
    });
    assert.match(first.data.attempt.lastAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    await post({ id, ok: false, failed: [0, 0] });
    const passed = await post({ id, ok: true, activeMs: 1500 });
    const { attempt } = passed.data;
    assert.equal(attempt.checks, 3);
    assert.equal(attempt.fails, 2);
    assert.equal(attempt.failsSinceOk, 0);
    assert.deepEqual(attempt.failedHints, { 0: 2 });
    assert.equal(attempt.activeMs, 1500);
    assert.equal(attempt.firstOkAt, attempt.lastAt);

    assert.equal(events.length, 3);
    assert.deepEqual(events[0].previous, null);
    assert.equal(events[0].firstOk, false);
    assert.deepEqual(events[0].body, { id, ok: false, failed: [0] });
    assert.deepEqual(events[1].body.failed, [0], 'duplicitní indexy se sloučí');
    assert.equal(events[2].firstOk, true);
    assert.equal(events[2].previous.failsSinceOk, 2);
    assert.deepEqual(events[2].attempt, attempt);

    // Další ok už firstOk není a firstOkAt se nemění.
    const again = await post({ id, ok: true });
    assert.equal(again.data.attempt.firstOkAt, attempt.firstOkAt);
    assert.equal(events[3].firstOk, false);

    // Neúspěch po úspěchu začne failsSinceOk znovu od 1.
    assert.equal((await post({ id, ok: false, failed: [0] })).data.attempt.failsSinceOk, 1);
  });

  test('tipsOpened drží maximum, solutionViewed před prvním ok nastaví assisted', async () => {
    const id = 'ukazka/workshop/002';
    await post({ id, tipsOpened: 2 });
    const lower = await post({ id, tipsOpened: 1 });
    assert.equal(lower.data.attempt.tipsOpened, 2);
    assert.equal(lower.data.attempt.checks, 0, 'bez ok se kontrola nepočítá');

    const viewed = await post({ id, solutionViewed: true });
    assert.equal(viewed.data.attempt.solutionViewed, true);
    assert.equal(viewed.data.attempt.assisted, true);
    const ok = await post({ id, ok: true, solutionViewed: false });
    assert.equal(ok.data.attempt.assisted, true, 'assisted zůstává');
    assert.equal(ok.data.attempt.solutionViewed, true, 'false nic nemaže');

    // Řešení zobrazené až po splnění (Jak to napsal autor) assisted nenastaví.
    const lab = 'ukazka/lab';
    await post({ id: lab, ok: true });
    const afterPass = await post({ id: lab, solutionViewed: true });
    assert.equal(afterPass.data.attempt.solutionViewed, true);
    assert.equal(afterPass.data.attempt.assisted, false);

    // V jednom požadavku: řešení i první ok = s pomocí.
    const project = 'ukazka/projekt-web';
    assert.equal((await post({ id: project, ok: true, solutionViewed: true })).data.attempt.assisted, true);
  });

  test('score: firstScore je první odeslané, lastScore poslední', async () => {
    const id = 'ukazka/kviz';
    await post({ id, score: 0.4 });
    const second = await post({ id, score: 0.9, activeMs: 1000 });
    assert.equal(second.data.attempt.firstScore, 0.4);
    assert.equal(second.data.attempt.lastScore, 0.9);
    const third = await post({ id, score: 0.6, activeMs: 2000.4 });
    assert.equal(third.data.attempt.firstScore, 0.4);
    assert.equal(third.data.attempt.lastScore, 0.6);
    assert.equal(third.data.attempt.activeMs, 3000);
  });

  test('otázka q: s jistotou; neznámá otázka = 400', async () => {
    const answered = await post({ id: QUESTION_ID, ok: false, confidence: 'sure' });
    assert.equal(answered.status, 200);
    assert.equal(answered.data.attempt.fails, 1);
    assert.deepEqual(events[0].body, { id: QUESTION_ID, ok: false, confidence: 'sure' });

    const unknown = await post({ id: 'q:ukazka/kviz#00000000', ok: true });
    assert.equal(unknown.status, 400);
    assert.match(unknown.data.error, /q:ukazka\/kviz#00000000 v obsahu neexistuje/);
    assert.equal((await post({ id: 'q:ukazka/neni#1b4f0e98', ok: true })).status, 400);
    assert.equal(events.length, 1, 'odmítnutý požadavek událost nevyvolá');
  });

  test('neplatná těla = 400 s českou zprávou, nic se neuloží', async () => {
    const cases = [
      [{}, /Chybí "id"/],
      [{ id: 'ukazka/workshop/999', ok: true }, /v obsahu neexistuje/],
      [{ id: 'ukazka/neexistuje', ok: true }, /v obsahu neexistuje/],
      [{ id: '../ven', ok: true }, /Neplatné id/],
      [{ id: 'card:ukazka#1b4f0e98', ok: true }, /Neplatné id/],
      [{ id: 'q:ukazka/kviz', ok: true }, /Neplatné id otázky/],
      [{ id: 'ukazka/workshop/001', ok: 'ano' }, /"ok" musí být/],
      [{ id: 'ukazka/workshop/001', failed: [1] }, /"failed" jde poslat jen spolu s "ok"/],
      [{ id: 'ukazka/workshop/001', ok: false, failed: [-1] }, /"failed" musí být pole/],
      [{ id: 'ukazka/workshop/001', ok: false, failed: '1' }, /"failed" musí být pole/],
      [{ id: 'ukazka/workshop/001', tipsOpened: 1.5 }, /"tipsOpened"/],
      [{ id: 'ukazka/workshop/001', solutionViewed: 'true' }, /"solutionViewed"/],
      [{ id: 'ukazka/workshop/001', activeMs: 3_600_001 }, /"activeMs" musí být číslo od 0 do 3600000/],
      [{ id: 'ukazka/workshop/001', activeMs: -1 }, /"activeMs"/],
      [{ id: 'ukazka/kviz', score: 1.2 }, /"score"/],
      [{ id: 'ukazka/workshop/001', ok: true, confidence: 'sure' }, /"confidence" patří jen k otázce/],
      [{ id: QUESTION_ID, ok: true, confidence: 'maybe' }, /"confidence" musí být/],
      [{ id: QUESTION_ID, confidence: 'sure' }, /"confidence" jde poslat jen spolu s "ok"/],
      [{ id: 'ukazka/workshop/001', ok: true, solved: true }, /Neznámé pole "solved"/],
    ];
    for (const [body, message] of cases) {
      const { status, data } = await post(body);
      assert.equal(status, 400, JSON.stringify(body));
      assert.match(data.error, message, JSON.stringify(body));
    }
    assert.deepEqual((await call('GET', '/api/attempts')).data, { version: 1, items: {} });
    assert.equal(events.length, 0);
  });

  test('GET /api/attempts celý soubor i s prefixem (otázky podle modulu)', async () => {
    await post({ id: 'ukazka/workshop/001', ok: false, failed: [0] });
    await post({ id: 'ukazka/lab', ok: true });
    await post({ id: QUESTION_ID, ok: true });

    const all = await call('GET', '/api/attempts');
    assert.equal(all.data.version, 1);
    assert.deepEqual(Object.keys(all.data.items).sort(), [QUESTION_ID, 'ukazka/lab', 'ukazka/workshop/001']);

    const workshop = await call('GET', '/api/attempts?prefix=ukazka/workshop');
    assert.deepEqual(Object.keys(workshop.data.items), ['ukazka/workshop/001']);
    const quiz = await call('GET', '/api/attempts?prefix=ukazka/kviz');
    assert.deepEqual(Object.keys(quiz.data.items), [QUESTION_ID]);
    const section = await call('GET', '/api/attempts?prefix=ukazka');
    assert.equal(Object.keys(section.data.items).length, 3);
    // „ukazka/lab" nesmí chytit „ukazka/lab-dalsi" ani naopak.
    assert.deepEqual(Object.keys((await call('GET', '/api/attempts?prefix=ukazka/la')).data.items), []);
    assert.equal((await call('GET', '/api/attempts?prefix=../x')).status, 400);
  });

  test('reset postupu smaže pokusy, které k id patří (kontrakt kap. 8)', async () => {
    await post({ id: 'ukazka/workshop/001', ok: false });
    await post({ id: 'ukazka/workshop/002', ok: true });
    await post({ id: 'ukazka/lab', ok: true });
    await post({ id: QUESTION_ID, ok: true });

    assert.equal((await call('POST', '/api/progress/reset', { id: 'ukazka/workshop' })).status, 200);
    assert.deepEqual(Object.keys((await call('GET', '/api/attempts')).data.items).sort(), [QUESTION_ID, 'ukazka/lab']);

    await call('POST', '/api/progress/reset', { id: 'ukazka/kviz' });
    assert.deepEqual(Object.keys((await call('GET', '/api/attempts')).data.items), ['ukazka/lab']);

    await call('POST', '/api/progress/reset', { id: 'ukazka' });
    assert.deepEqual((await call('GET', '/api/attempts')).data.items, {});
  });

  test('zápis na disk: data/pokusy.json s version 1', async () => {
    await post({ id: 'ukazka/lekce', activeMs: 60000 });
    await server.akademie.ctx.createJsonStore('pokusy.json').flush();
    const saved = JSON.parse(fs.readFileSync(path.join(root, 'data', 'pokusy.json'), 'utf8'));
    assert.equal(saved.version, 1);
    assert.equal(saved.items['ukazka/lekce'].activeMs, 60000);
  });

  test('GET /api/stats: nejčastěji selhané požadavky, chybné otázky, řešení a čas po sekcích', async () => {
    for (let i = 0; i < 3; i++) await post({ id: 'ukazka/workshop/001', ok: false, failed: [0], activeMs: 1000 });
    await post({ id: 'ukazka/workshop/002', ok: false, failed: [0] });
    await post({ id: 'ukazka/workshop/002', solutionViewed: true, activeMs: 500 });
    await post({ id: 'ukazka/projekt-web', ok: false, failed: [0, 5] }); // požadavek 5 neexistuje
    await post({ id: 'ukazka/lab', ok: true });
    await post({ id: 'ukazka/lab', solutionViewed: true });
    await post({ id: QUESTION_ID, ok: false, activeMs: 2000 });
    await post({ id: QUESTION_ID, ok: false });
    // Položky, které v obsahu nejsou (smazaný krok), se ve statistikách vynechají.
    server.akademie.ctx.createJsonStore('pokusy.json').update((data) => {
      data.items['ukazka/workshop/077'] = { ...emptyAttempt(), fails: 9, failedHints: { 0: 9 }, activeMs: 99999, solutionViewed: true };
      data.items['q:ukazka/kviz#deadbeef'] = { ...emptyAttempt(), fails: 4 };
    });

    const { status, data } = await call('GET', '/api/stats');
    assert.equal(status, 200);
    assert.deepEqual(data.topFailedHints, [
      { id: 'ukazka/workshop/001', title: 'Funkce add', hintIndex: 0, hintText: 'Funkce `add` existuje.', fails: 3 },
      { id: 'ukazka/workshop/002', title: 'Krok 2', hintIndex: 0, hintText: 'Vypiš výsledek.', fails: 1 },
      { id: 'ukazka/projekt-web', title: 'Stránka', hintIndex: 0, hintText: 'Stránka má `h1`.', fails: 1 },
    ]);
    assert.deepEqual(data.wrongQuestions, [
      { id: QUESTION_ID, moduleId: 'ukazka/kviz', text: 'Co vypíše `add(1, 2)`?', wrong: 2, see: ['ukazka/lekce'] },
    ]);
    assert.deepEqual(data.solutionViewed, [
      { id: 'ukazka/workshop/002', title: 'Krok 2', assisted: true },
      { id: 'ukazka/lab', title: 'Pozdrav', assisted: false },
    ]);
    assert.deepEqual(data.timeBySection, [{ sectionId: 'ukazka', title: 'Ukázková sekce', activeMs: 5500 }]);
  });

  test('GET /api/stats bez pokusů vrací prázdné seznamy', async () => {
    assert.deepEqual((await call('GET', '/api/stats')).data, {
      topFailedHints: [], wrongQuestions: [], solutionViewed: [], timeBySection: [],
    });
  });
});

describe('pokusy — logika bez HTTP', () => {
  const fail = (message) => {
    throw new Error(message);
  };

  test('validateAttemptBody vrací jen pole, která přišla; confidence null se vynechá', () => {
    assert.deepEqual(validateAttemptBody({ id: 'a/b' }, { fail }), { id: 'a/b' });
    assert.deepEqual(
      validateAttemptBody({ id: 'q:a/b#0123abcd-2', ok: true, confidence: null, failed: [3, 1, 3] }, { fail }),
      { id: 'q:a/b#0123abcd-2', ok: true, failed: [1, 3] },
    );
    assert.throws(() => validateAttemptBody(null, { fail }), /objekt/);
    assert.throws(() => validateAttemptBody([], { fail }), /objekt/);
  });

  test('applyAttempt nemění předchozí záznam', () => {
    const previous = { ...emptyAttempt(), fails: 1, failsSinceOk: 1, failedHints: { 2: 1 } };
    const snapshot = structuredClone(previous);
    const { attempt, firstOk } = applyAttempt(previous, { id: 'x', ok: false, failed: [2] }, '2026-09-13T10:00:00.000Z');
    assert.deepEqual(previous, snapshot);
    assert.equal(firstOk, false);
    assert.deepEqual(attempt.failedHints, { 2: 2 });
    assert.equal(attempt.lastAt, '2026-09-13T10:00:00.000Z');
  });

  test('applyAttempt doplní chybějící pole ve starším záznamu', () => {
    const { attempt } = applyAttempt({ checks: 2, fails: 2 }, { id: 'x', ok: true }, 'T');
    assert.equal(attempt.checks, 3);
    assert.equal(attempt.failsSinceOk, 0);
    assert.equal(attempt.firstOkAt, 'T');
    assert.deepEqual(attempt.failedHints, {});
  });

  test('attemptTarget: otázka patří modulu, ostatní id sama sobě', () => {
    assert.equal(attemptTarget('q:js-pole/kviz#1b4f0e98'), 'js-pole/kviz');
    assert.equal(attemptTarget('js-pole/workshop/017'), 'js-pole/workshop/017');
  });

  test('buildStats omezí délku seznamů a řadí podle počtu a pořadí v osnově', () => {
    const items = {};
    for (let i = 0; i < 12; i++) items[`s/w/${String(i).padStart(3, '0')}`] = { ...emptyAttempt(), failedHints: { 0: i % 3 + 1 } };
    const stats = buildStats({ items }, {
      order: (id) => Number(id.split('/')[2]),
      item: (id) => ({ title: id, hints: [{ text: 'h' }] }),
      module: () => null,
      question: () => null,
      sections: [],
    });
    assert.equal(stats.topFailedHints.length, 10);
    assert.deepEqual(stats.topFailedHints.slice(0, 4).map((h) => [h.id, h.fails]), [
      ['s/w/002', 3], ['s/w/005', 3], ['s/w/008', 3], ['s/w/011', 3],
    ]);
  });
});
