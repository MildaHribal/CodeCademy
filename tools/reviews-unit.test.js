// Opakování, jistota a otázky bez prohlížeče: plánování (Leitner), výběr na dnešek,
// průběh otázky (neprozradí odpověď), výpočty kvízu a texty obrazovky opakování.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  DAILY_LIMIT, INTERVALS, addDays, answeredToday, applyAnswer, belongsToTarget, estimateMinutes, estimateSeconds,
  interleaveBySection, isCardActive, itemFromFirstAnswer, localDate, migrateReviews, newItem, parseReviewId, sortDue,
} from '../server/routes/_reviews-store.js';
import { createQuestionFlow } from '../client/src/components/questions/flow.js';
import { groupByCodeSet, isPassing, quizScore, refModuleId, seeHref } from '../client/src/screens/quiz-helpers.js';
import { calibrationSentence, createReviewSession, itemKindLabel, limitNote, summaryLine } from '../client/src/extensions/reviews/logic.js';

const NOW = '2026-09-13T08:00:00.000Z';

describe('opakování — plánování (Leitner)', () => {
  test('intervaly krabiček a denní strop podle kontraktu', () => {
    assert.deepEqual(INTERVALS, { 1: 1, 2: 3, 3: 7, 4: 16, 5: 35, 6: 90 });
    assert.equal(DAILY_LIMIT, 20);
  });

  test('datum: přičítání dnů přes konec měsíce, roku a změnu času', () => {
    assert.equal(addDays('2026-09-13', 3), '2026-09-16');
    assert.equal(addDays('2026-09-29', 3), '2026-10-02');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2026-10-24', 1), '2026-10-25'); // noc změny letního času
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
    assert.equal(localDate(new Date(2026, 8, 3, 23, 59)), '2026-09-03');
  });

  test('první odpověď: jistě správně → 2 za 3 dny, jinak 1 zítra', () => {
    const today = '2026-09-13';
    const make = (ok, confidence) => itemFromFirstAnswer({ ok, confidence, today, now: NOW });
    assert.deepEqual([make(true, 'sure').box, make(true, 'sure').due], [2, '2026-09-16']);
    assert.deepEqual([make(true, 'guess').box, make(true, 'guess').due], [1, '2026-09-14']);
    assert.deepEqual([make(true, null).box, make(true, null).due], [1, '2026-09-14']);
    assert.deepEqual([make(false, 'sure').box, make(false, 'sure').due], [1, '2026-09-14']);
    assert.deepEqual(make(false, 'sure').history, [{ at: NOW, ok: false, confidence: 'sure' }]);
    assert.equal(make(true, 'sure').reason, 'first-answer');
  });

  test('odpověď v opakování: povýšení, „Tipuju" nepovyšuje, chyba vrací na začátek', () => {
    const today = '2026-09-13';
    const item = newItem({ reason: 'self', today, now: NOW });
    assert.deepEqual([item.box, item.due], [1, '2026-09-14']);

    applyAnswer(item, { ok: true, confidence: 'sure', today, now: NOW });
    assert.deepEqual([item.box, item.due], [2, '2026-09-16']);
    applyAnswer(item, { ok: true, confidence: null, today, now: NOW });
    assert.deepEqual([item.box, item.due], [3, '2026-09-20']);
    applyAnswer(item, { ok: true, confidence: 'guess', today, now: NOW });
    assert.deepEqual([item.box, item.due], [3, '2026-09-20']);
    applyAnswer(item, { ok: false, confidence: 'guess', today, now: NOW });
    assert.deepEqual([item.box, item.due], [1, '2026-09-14']);
    assert.equal(item.lastAnswered, NOW);

    for (let i = 0; i < 30; i++) applyAnswer(item, { ok: true, today, now: NOW });
    assert.deepEqual([item.box, item.due], [6, addDays(today, 90)]);
    assert.equal(item.history.length, 20);
  });

  test('id položek a příslušnost k resetu', () => {
    assert.deepEqual(parseReviewId('q:js-pole/kviz#1b4f0e98'), { type: 'q', target: 'js-pole/kviz', key: '1b4f0e98' });
    assert.deepEqual(parseReviewId('step:js-pole/workshop/017'), { type: 'step', target: 'js-pole/workshop/017', key: null });
    assert.equal(parseReviewId('q:js-pole#1b4f0e98'), null);
    assert.equal(parseReviewId('step:js-pole/lab#1b4f0e98'), null);
    assert.equal(parseReviewId('js-pole/kviz'), null);

    assert.equal(belongsToTarget('q:js-pole/kviz#1b4f0e98', 'js-pole'), true);
    assert.equal(belongsToTarget('q:js-pole/kviz#1b4f0e98', 'js-pole/kviz'), true);
    assert.equal(belongsToTarget('q:js-pole/kviz#1b4f0e98', 'js-pole/kv'), false);
    assert.equal(belongsToTarget('card:js-pole#1b4f0e98', 'js-pole/kviz'), false);
    assert.equal(belongsToTarget('step:js-pole/workshop/017', 'js-pole/workshop'), true);
    assert.equal(belongsToTarget('explain:js-pole/lekce#00000001-2', 'js-pole/lekce'), true);
  });

  test('poškozený soubor: bez items = null, chybějící removed se doplní', () => {
    assert.equal(migrateReviews({ version: 1 }), null);
    assert.equal(migrateReviews(null), null);
    assert.deepEqual(migrateReviews({ version: 1, items: {} }), { version: 1, items: {}, removed: {} });
  });
});

describe('opakování — výběr na dnešek', () => {
  const entry = (id, due, box = 1) => ({ id, item: { due, box } });

  test('jen splatné, seřazené podle due, krabičky a id', () => {
    const sorted = sortDue([
      entry('q:b/k#00000002', '2026-09-12', 2),
      entry('q:a/k#00000003', '2026-09-14'),
      entry('q:a/k#00000002', '2026-09-12', 1),
      entry('q:a/k#00000001', '2026-09-12', 1),
      entry('q:a/k#00000009', '2026-09-10', 5),
    ], '2026-09-13');
    assert.deepEqual(sorted.map((e) => e.id), ['q:a/k#00000009', 'q:a/k#00000001', 'q:a/k#00000002', 'q:b/k#00000002']);
  });

  test('proložení po sekcích v pořadí prvního výskytu', () => {
    const ids = ['q:a/k#00000001', 'q:a/k#00000002', 'q:a/k#00000003', 'card:b#00000001', 'q:c/k#00000001', 'card:b#00000002'];
    const out = interleaveBySection(ids.map((id) => ({ id })));
    assert.deepEqual(out.map((e) => e.id), ['q:a/k#00000001', 'card:b#00000001', 'q:c/k#00000001', 'q:a/k#00000002', 'card:b#00000002', 'q:a/k#00000003']);
    assert.deepEqual(interleaveBySection([]), []);
  });

  test('dnes zodpovězené podle místního data', () => {
    const at = (h) => new Date(2026, 8, 13, h, 0).toISOString();
    const items = {
      a: { lastAnswered: at(0) },
      b: { lastAnswered: at(23) },
      c: { lastAnswered: new Date(2026, 8, 12, 23, 59).toISOString() },
      d: { lastAnswered: null },
    };
    assert.equal(answeredToday(items, '2026-09-13'), 2);
  });

  test('odhad času podle typu', () => {
    assert.equal(estimateSeconds({ type: 'question' }), 30);
    assert.equal(estimateSeconds({ type: 'card', content: { type: 'output' } }), 45);
    assert.equal(estimateSeconds({ type: 'card', content: { type: 'css' } }), 45);
    assert.equal(estimateSeconds({ type: 'card', content: { type: 'free' } }), 60);
    assert.equal(estimateSeconds({ type: 'card', content: { type: 'code' } }), 180);
    assert.equal(estimateSeconds({ type: 'explain' }), 45);
    assert.equal(estimateSeconds({ type: 'step' }), 480);
    assert.equal(estimateMinutes(0), 0);
    assert.equal(estimateMinutes(61), 2);
  });

  test('aktivace karty: první see, jinak polovina modulů sekce', () => {
    const done = new Set(['s/lekce', 's/workshop']);
    const isModuleDone = (id) => done.has(id);
    const sectionModules = ['s/lekce', 's/workshop', 's/lab', 's/kviz'];
    assert.equal(isCardActive({ see: ['s/lekce#nadpis', 's/kviz'] }, { sectionModules, isModuleDone }), true);
    assert.equal(isCardActive({ see: ['s/kviz', 's/lekce'] }, { sectionModules, isModuleDone }), false);
    assert.equal(isCardActive({ see: ['s/workshop/003'] }, { sectionModules, isModuleDone }), true);
    assert.equal(isCardActive({ see: [] }, { sectionModules, isModuleDone }), true, '2 ze 4 = polovina');
    assert.equal(isCardActive({ see: [] }, { sectionModules: [...sectionModules, 's/projekt'], isModuleDone }), false, '2 z 5');
    assert.equal(isCardActive({}, { sectionModules: [], isModuleDone }), false);
  });
});

describe('otázka neprozradí odpověď (průběh)', () => {
  test('první neúspěch odpověď neukáže, druhý ano; vyřešená = správně nebo odhalená', () => {
    const flow = createQuestionFlow();
    assert.deepEqual(flow.record(false), { correct: false, showAnswer: false, failures: 1, evaluations: 1 });
    assert.equal(flow.state().solved, false);
    flow.retry();
    assert.deepEqual(flow.record(false), { correct: false, showAnswer: true, failures: 2, evaluations: 2 });
    assert.equal(flow.state().solved, true);
  });

  test('správná odpověď hned vyřeší; „Ukaž odpověď" vyřeší bez správné odpovědi', () => {
    const correct = createQuestionFlow();
    assert.equal(correct.record(true).showAnswer, true);
    assert.equal(correct.state().solved, true);

    const revealed = createQuestionFlow();
    revealed.record(false);
    revealed.revealAnswer();
    assert.deepEqual([revealed.state().solved, revealed.state().correct], [true, false]);
  });

  test('po zobrazení odpovědi další pokus zamíchá volby jinak', () => {
    const flow = createQuestionFlow();
    flow.record(false);
    assert.deepEqual(flow.retry(), { reshuffle: false, round: 0 });
    flow.record(false); // ukáže odpověď
    assert.deepEqual(flow.retry(), { reshuffle: true, round: 1 });
    flow.revealAnswer();
    assert.deepEqual(flow.retry(), { reshuffle: true, round: 2 });
    assert.equal(flow.state().solved, true, 'vyřešená zůstává vyřešená');
  });
});

describe('kvíz — výpočty', () => {
  test('skóre z posledního vyhodnocení každé otázky a hranice splnění', () => {
    const results = new Map([[0, true], [1, false], [2, true], [4, true]]);
    assert.equal(quizScore(results, 5), 0.6);
    assert.equal(quizScore(new Map(), 0), 0);
    assert.equal(isPassing(0.8, 0.8), true);
    assert.equal(isPassing(4 / 5, 0.8), true);
    assert.equal(isPassing(0.79, 0.8), false);
  });

  test('otázky sady # --code-- tvoří souvislé skupiny', () => {
    const q = (code) => ({ question: { code } });
    const groups = groupByCodeSet([q(null), q(undefined), q(0), q(0), q(1), q(null)]);
    assert.deepEqual(groups.map((g) => [g.code, g.entries.length]), [[null, 2], [0, 2], [1, 1], [null, 1]]);
  });

  test('odkazy see na výklad', () => {
    assert.equal(seeHref('js-pole/co-je-pole#kopie-pole'), '#/modul/js-pole/co-je-pole?kotva=kopie-pole');
    assert.equal(seeHref('css-flexbox/workshop-navigace/016'), '#/modul/css-flexbox/workshop-navigace/016');
    assert.equal(seeHref('neplatne'), null);
    assert.equal(refModuleId('js-pole/co-je-pole#kopie-pole'), 'js-pole/co-je-pole');
  });
});

describe('obrazovka opakování — texty a sezení', () => {
  test('řádek na přehledu a věta kalibrace', () => {
    assert.equal(summaryLine({ due: 12, estimateMinutes: 8 }), 'K opakování: 12 (asi 8 min)');
    assert.equal(summaryLine({ due: 1, estimateMinutes: 0 }), 'K opakování: 1 (asi 1 min)');
    assert.equal(calibrationSentence({ sure: { total: 4, correct: 4 } }), null);
    assert.equal(calibrationSentence({ sure: { total: 14, correct: 10 }, guess: { total: 6, correct: 3 } }), 'Když jsi byl jistý, měl jsi pravdu v 71 %.');
    assert.equal(calibrationSentence(), null);
  });

  test('popisky druhů položek a strop', () => {
    assert.equal(itemKindLabel({ type: 'question', content: {} }), 'Otázka');
    assert.equal(itemKindLabel({ type: 'question', content: { codeSet: { title: 'x' } } }), 'Otázka nad kódem');
    assert.equal(itemKindLabel({ type: 'card', content: { type: 'free' } }), 'Karta: pohovorová otázka');
    assert.equal(itemKindLabel({ type: 'step', content: {} }), 'Krok znovu od začátku');
    assert.equal(limitNote({ total: 12, answeredToday: 0, limit: 20, offered: 12 }), null);
    assert.equal(limitNote({ total: 25, answeredToday: 0, limit: 20, offered: 20 }), 'Dnes se nabízí nejvýš 20 položek. 5 dalších položek počká na zítra.');
    assert.equal(limitNote({ total: 3, answeredToday: 20, limit: 20, offered: 0 }), 'Denní strop 20 položek je vyčerpaný. 3 další položky počkají na zítra.');
  });

  test('sezení: každá položka se hodnotí jednou, „Už to umím" se nepočítá', () => {
    const session = createReviewSession([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    assert.equal(session.current().id, 'a');
    assert.equal(session.record('a', true), true);
    assert.equal(session.record('a', false), false);
    session.next();
    session.remove('b');
    session.next();
    session.record('c', false);
    assert.equal(session.isFinished(), false);
    session.next();
    assert.equal(session.isFinished(), true);
    assert.deepEqual(session.results(), { answered: 2, correct: 1, removed: 1 });
  });
});
