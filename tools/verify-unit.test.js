// Verify bez prohlížeče: výběr obsahu a všechna pravidla z kontraktu kap. 10 nad fixture
// obsahem (tools/fixtures/verify-content). Běhy runneru se simulují funkcí fakeRun.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { changeRatio } from '../shared/diff.js';
import { parseStep } from '../shared/parse.js';
import { compareFiles, debugChangeRatio, planModule } from './lib/content-checks.js';
import { matchesPrefixes, scanContent, sectionSelected, toIdPrefixes } from './lib/content-scan.js';
import { createCourseChecks } from './lib/verify-course.js';
import { formatEntry, formatSummary } from './lib/report.js';
import {
  addedSolutionLines, assertionsWithoutMessage, findCallouts, hasSolutionLikeCodeBlock, leakedSolutionLines, lessonParts, proseWordCount,
} from './lib/verify-rules.js';

const FIXTURES = fileURLToPath(new URL('./fixtures/content', import.meta.url));
const VERIFY_FIXTURES = fileURLToPath(new URL('./fixtures/verify-content', import.meta.url));

/**
 * Simulovaný runner: test projde, když soubory deklarují všechny `hodnotaN` z testu
 * (a nikde není `verify-fail`); konzole = řádky `// log: …`; `verify: errors` = nezachycená chyba.
 */
function fakeRun(request) {
  const source = request.files.map((file) => file.content).join('\n');
  const results = request.hints.map((hint, index) => {
    const missing = [...hint.test.matchAll(/hodnota\d+/g)].map((m) => m[0]).find((name) => !new RegExp(`(?:const|let)\\s+${name}\\s*=`).test(source));
    if (missing) return { index, pass: false, error: `ReferenceError: ${missing} is not defined`, errorName: 'ReferenceError' };
    if (source.includes('verify-fail')) return { index, pass: false, error: 'hodnota neprojde', errorName: 'AssertionError' };
    return { index, pass: true };
  });
  return {
    ok: results.every((result) => result.pass),
    results,
    logs: [...source.matchAll(/\/\/ log: (.*)/g)].map((m) => ({ level: 'log', text: m[1] })),
    errors: source.includes('verify: errors') ? ['ReferenceError: chyba is not defined (script.js:1)'] : [],
    syntaxError: null,
  };
}

/** Celý průchod verify nad fixture bez prohlížeče: { id → výsledek }. */
function verifyWithoutBrowser(contentDir, prefixes = []) {
  const { modules, sections, course, problems } = scanContent(contentDir, prefixes);
  const checks = createCourseChecks(course);
  const context = { ...checks, changeRatio };
  const byId = {};
  for (const problem of problems) byId[problem.id] = problem;
  byId['osnova.json'] = checks.checkOsnova();
  for (const id of sections) {
    const plan = checks.planSection(id);
    byId[id] = plan.evaluate(plan.jobs.map(fakeRun));
  }
  for (const item of modules) {
    if (item.error) {
      byId[item.id] = { errors: [item.error] };
      continue;
    }
    const plan = planModule(item.module, context);
    byId[item.id] = plan.evaluate(plan.jobs.map(fakeRun));
  }
  return byId;
}

/** Kódy pravidel ve zprávách jedné úrovně (seřazené, bez duplicit). */
const codes = (messages = []) => [...new Set(messages.map((message) => message.match(/^\[(\w+)\]/)?.[1]))].sort();

describe('verify — výběr obsahu', () => {
  test('prefixy z příkazové řádky a výběr sekcí', () => {
    assert.deepEqual(toIdPrefixes(['content/css-flexbox/', 'content/js-pole/kviz'], '/p/content', '/p'), ['css-flexbox', 'js-pole/kviz']);
    assert.ok(matchesPrefixes('css-flexbox/kviz', ['css-flexbox']));
    assert.ok(!matchesPrefixes('css-flexbox-2/kviz', ['css-flexbox']));
    assert.ok(sectionSelected('css-flexbox', []));
    assert.ok(sectionSelected('css-flexbox', ['css-flexbox']));
    assert.ok(!sectionSelected('css-flexbox', ['css-flexbox/kviz']), 'prefix na modul neověřuje soubory sekce');
  });

  test('scanContent najde moduly a sekce fixture obsahu a filtruje podle prefixu', () => {
    const all = scanContent(FIXTURES);
    assert.deepEqual(all.problems, []);
    assert.equal(all.modules.length, 7);
    assert.deepEqual(all.sections, ['dobra', 'spatna']);
    const good = scanContent(FIXTURES, ['dobra/kviz']);
    assert.deepEqual(good.modules.map((m) => m.id), ['dobra/kviz']);
    assert.deepEqual(good.sections, []);
    assert.ok(good.course.modules.has('spatna/lekce-odkazy'), 'model kurzu je vždy celý (kvůli odkazům)');
    const none = scanContent(FIXTURES, ['neexistuje']);
    assert.match(none.problems[0].errors[0], /žádný modul neodpovídá/);
  });

  test('kontrola kroku: seed, který projde, je chyba; rozdílná návaznost je varování', () => {
    const { modules } = scanContent(FIXTURES, ['spatna/workshop-rozbity']);
    const plan = planModule(modules[0].module);
    const pass = (count) => ({ ok: true, results: Array.from({ length: count }, (_, index) => ({ index, pass: true })), logs: [], errors: [] });
    const fail = { ok: false, results: [{ index: 0, pass: false, error: 'x' }], logs: [], errors: [] };
    const outcome = plan.evaluate([fail, pass(1), pass(1), pass(1)]);
    assert.deepEqual(outcome.errors, ['[K1] krok 002: výchozí kód (seed) projde všemi testy — aspoň jeden test musí selhat']);
    assert.ok(outcome.warnings.includes('[K3] krok 002: seed se liší od řešení kroku 001 (styles.css)'));
    assert.deepEqual(compareFiles([{ name: 'a', content: 'x  y' }], [{ name: 'a', content: 'x y\n' }]), []);
    // Nový soubor v seedu návaznost neporušuje, chybějící nebo změněný ano.
    const previous = [{ name: 'a.js', content: 'x' }, { name: 'b.js', content: 'y' }];
    assert.deepEqual(compareFiles(previous, [{ name: 'a.js', content: 'x' }, { name: 'b.js', content: 'y' }, { name: 'index.html', content: '<p>' }], { allowNewFiles: true }), []);
    assert.deepEqual(compareFiles(previous, [{ name: 'a.js', content: 'z' }], { allowNewFiles: true }), ['a.js', 'b.js']);
    assert.deepEqual(compareFiles(previous, [...previous, { name: 'c.js', content: '' }]), ['c.js']);
  });

  test('lab bez řešení je chyba K4 a nemá žádný běh', () => {
    const lab = { type: 'lab', lab: { id: 's/lab', runtime: 'js', kind: 'step', hints: [{ text: 't', test: '' }], help: [], seed: [], solution: [], see: [], approaches: [] } };
    const plan = planModule(lab);
    assert.equal(plan.jobs.length, 0);
    assert.deepEqual(plan.evaluate([]).errors, ['[K4] lab nemá sekci --solution--, bez řešení ho nejde ověřit']);
  });
});

describe('verify — textová pravidla', () => {
  test('T1: přidané řádky řešení a kandidáti z tipu (řádky, inline kód, bloky kódu)', () => {
    const added = addedSolutionLines(
      [{ name: 'a.css', content: 'body { margin: 0; }' }],
      [{ name: 'a.css', content: 'body { margin: 0; }\nnav { display: flex; }\n}\nx' }],
    );
    assert.deepEqual([...added], ['nav { display: flex; }']);
    assert.deepEqual(leakedSolutionLines('Napiš `nav {  display: flex; }`.', added), ['nav { display: flex; }']);
    assert.deepEqual(leakedSolutionLines('- nav { display: flex; }', added), ['nav { display: flex; }']);
    assert.deepEqual(leakedSolutionLines('```css\nnav { display: flex; }\n```', added), ['nav { display: flex; }']);
    assert.deepEqual(leakedSolutionLines('Použij `display: flex`.', added), []);
  });

  test('A1: aserce s méně argumenty, než je potřeba', () => {
    const test = "assert(x);\nassert.ok(y, 'zpráva');\nassert.equal(a, 1);\nassert.deepEqual(b, [], 'zpráva');\nawait assert.rejects(p);\nassert.match(s, /x/);";
    assert.deepEqual(assertionsWithoutMessage(test), [{ line: 1, call: 'assert' }, { line: 3, call: 'assert.equal' }, { line: 6, call: 'assert.match' }]);
    assert.equal(assertionsWithoutMessage('assert.equal('), null, 'nejde naparsovat → null');
  });

  test('W2, M1, E6: bloky kódu, rámečky, slova a části lekce', () => {
    assert.equal(hasSolutionLikeCodeBlock('```css\na {}\n```'), true);
    assert.equal(hasSolutionLikeCodeBlock('```text\na\n```\n```js\n\n```'), false);
    assert.deepEqual(findCallouts('> [!TIP]\n> x\n\n```md\n> [!NOPE]\n```\n> [!note] Nadpis\n> [!DANGER]').map((c) => [c.type, c.known]), [['TIP', true], ['note', true], ['DANGER', false]]);
    assert.equal(proseWordCount('Jedna dvě tři.\n```js\nconst a = b;\n```\n- čtyři'), 4);
    const parts = lessonParts([{ kind: 'md', text: '# T\n\nÚvod\n\n## A\n\ntext' }, { kind: 'check' }, { kind: 'md', text: '```md\n## ne\n```\n## B' }]);
    assert.deepEqual(parts.map((p) => [p.heading, p.blocks.length]), [[null, 0], ['A', 1], ['B', 0]]);
  });

  test('D1: míra změny řešení kroku debug (oblast --edit-- nebo změněné soubory)', () => {
    const step = { seed: [{ name: 'a.js', content: 'a\nb\nc\nd', region: null }, { name: 'b.js', content: 'x', region: null }], solution: [{ name: 'a.js', content: 'a\nB\nc\nd' }, { name: 'b.js', content: 'x' }] };
    assert.equal(debugChangeRatio(step, changeRatio), 0.25);
    const region = { seed: [{ name: 'a.js', content: 'a\nb\nc', region: { start: 2, end: 2 } }], solution: [{ name: 'a.js', content: 'a\nB\nc' }] };
    assert.equal(debugChangeRatio(region, changeRatio), 1);
    assert.equal(debugChangeRatio(step, null), null);
  });

  test('K2: seed, který nejde spustit, je varování', () => {
    const step = parseStep('# --description--\n\nx\n\n# --hints--\n\nT\n\n```js\nassert.ok(false, "x");\n```\n\n# --seed--\n\n## --file-- script.js\n\n```js\nconst = ;\n```\n\n# --solution--\n\n## --file-- script.js\n\n```js\nconst a = 1;\n```\n', { id: 's/w/001', defaultRuntime: 'js' });
    const plan = planModule({ type: 'workshop', sectionId: 's', steps: [step] });
    const syntaxError = { file: 'script.js', line: 1, column: 7, message: "Unexpected token '='" };
    const seed = { ok: false, results: [{ index: 0, pass: false, skipped: true, error: 'Neověřeno — kód nejde spustit' }], logs: [], errors: [], syntaxError };
    const outcome = plan.evaluate([seed, { ok: true, results: [{ index: 0, pass: true }], logs: [], errors: [], syntaxError: null }]);
    assert.deepEqual(outcome.warnings.filter((w) => w.startsWith('[K2]')), ["[K2] krok 001: výchozí kód (seed) nejde spustit: Unexpected token '=' (script.js:1)"]);
  });
});

describe('verify — pravidla nad fixture obsahem (tools/fixtures/verify-content)', () => {
  const byId = verifyWithoutBrowser(VERIFY_FIXTURES);

  test('sekce se soubory: S1, S4, S5, S7, S8, S9, M1, C1–C3', () => {
    const zaklad = byId.zaklad;
    assert.deepEqual(codes(zaklad.errors), ['C1', 'C2', 'S1', 'S4', 'S5']);
    assert.deepEqual(zaklad.errors.filter((e) => e.startsWith('[S1]')), ['[S1] tahak.md:8: značka „:::check" do taháku nepatří (jen obyčejný markdown)', '[S1] tahak.md:10: značka „:::" do taháku nepatří (jen obyčejný markdown)']);
    assert.deepEqual(codes(zaklad.warnings), ['C3', 'M1', 'S7']);
    assert.deepEqual(codes(zaklad.advice), ['S9']);
    assert.ok(zaklad.errors.includes('[S4] výstup 1: reference „zaklad/neni": modul zaklad/neni v sekci není'));
    assert.ok(zaklad.errors.includes('[S4] karta 5: --see--: reference „zaklad/lekce#neni-kotva": lekce nemá nadpis s kotvou #neni-kotva'));
    assert.ok(zaklad.errors.includes('[S5] tahak.md: pojem [[neexistuje]] neexistuje'));
    assert.ok(zaklad.errors.includes('[S5] pojem „pole" (tvar „pole") koliduje s pojmem „seznam" v sekci pokrocile'));
    assert.ok(zaklad.errors.includes('[C2] karta 3 (output, „Co vypíše kód?"): --expected-- „2", kód vypíše „1"'));
    assert.ok(zaklad.warnings.includes('[C3] karta 4 (output, „Co vypíše tichý kód?"): kód nic nevypíše'));

    const pokrocile = byId.pokrocile;
    assert.deepEqual(codes(pokrocile.warnings), ['S8']);
    assert.ok(pokrocile.advice.includes('[S9] pojem „nepoužitý" se nikde v kurzu nepoužívá ([[nepoužitý]])'));
    assert.ok(!pokrocile.advice.some((a) => a.includes('pojmy.md')));
  });

  test('C1: karta code, jejíž seed projde, je chyba', () => {
    // Karta 5 ve fixture má seed stejný jako řešení → test nad seedem neselže.
    const { course } = scanContent(VERIFY_FIXTURES);
    const plan = createCourseChecks(course).planSection('zaklad');
    const results = plan.jobs.map(fakeRun);
    assert.ok(plan.evaluate(results).errors.includes('[C1] karta 5 (code, „Napiš hodnotu."): test nad --seed-- neselže'));
  });

  test('lekce: E1–E6, M1, M2, Q2, S4, S6, S7, X2', () => {
    const lesson = byId['zaklad/lekce'];
    assert.deepEqual(codes(lesson.errors), ['E1', 'E2', 'E3', 'S4']);
    assert.deepEqual(codes(lesson.warnings), ['E4', 'E5', 'M1', 'Q2', 'S6', 'S7']);
    assert.deepEqual(codes(lesson.advice), ['E6', 'M2', 'X2']);
    assert.ok(lesson.errors.includes('[E2] živá ukázka 2: předpověď čeká „3", ukázka vypíše „2"'));
    assert.ok(lesson.errors.includes('[E3] :::compare 1: obě varianty mají stejné soubory'));
    assert.ok(lesson.errors.includes('[S4] výklad: odkaz „odkaz": reference „zaklad/lekce#neni": lekce nemá nadpis s kotvou #neni'));
    assert.ok(lesson.warnings.includes('[S6] výklad: pojem [[objekt]] se vysvětluje až v sekci pokrocile'));
    assert.ok(lesson.warnings.includes('[E5] živá ukázka 1: ovládací prvek --nepouzita se v CSS nepoužívá (var(--…))'));

    const clean = byId['pokrocile/lekce-dalsi'];
    assert.deepEqual([clean.errors, clean.warnings, clean.advice], [[], [], ['[E6] lekce nemá předpověď (:::live … predict)']]);
  });

  test('workshop: A1, K1, K3, T1, T2, T3, W1, W2, W3, W4', () => {
    const workshop = byId['zaklad/workshop-dlouhy'];
    assert.deepEqual(workshop.errors, ['[T1] krok 002: tip 1 prozrazuje řádek řešení „const hodnota2 = 2;"']);
    assert.deepEqual(codes(workshop.warnings), ['A1', 'K3', 'T2', 'T3', 'W1', 'W2', 'W3']);
    assert.ok(workshop.warnings.includes('[T2] krok 007: krok mimo první třetinu nemá # --help--'));
    assert.ok(workshop.warnings.includes('[W3] krok 005: popis (2. třetina) obsahuje řádek řešení „const hodnota5 = 5;"'));
    assert.ok(workshop.warnings.includes('[W2] poslední třetina: 3 z 3 kroků má v popisu blok kódu (008, 009, 010) — zeslab návod'));
    assert.deepEqual(codes(workshop.advice), ['W4']);
  });

  test('debug a parsons: D1, D2, P1, P2', () => {
    const workshop = byId['zaklad/workshop-kratky'];
    assert.deepEqual(workshop.errors, ['[P1] krok 002: řešení s tvarem mezery __1__ „\'verify-fail\'" neprojde testem 1 („hodnota2 je 2."): hodnota neprojde']);
    assert.ok(workshop.warnings.includes('[D1] krok 001: řešení mění 100 % posuzovaných řádků (maxChange 0.5)'));
    assert.ok(workshop.advice.includes('[D2] krok 001: krok kind: debug nemá see na past, ze které chyba pochází'));
    assert.ok(workshop.advice.includes('[P2] krok 002: parsons nemá ## --distractors--'));
  });

  test('lab: K4, L1, L2, T3, X1, X2', () => {
    const lab = byId['zaklad/lab'];
    assert.deepEqual(lab.errors, ['[X1] lab: přístup „Neúplný" neprojde testem 2 („Požadavek 2."): ReferenceError: hodnota2 is not defined', '[X1] lab: přístup „Neúplný" neprojde testem 3 („Požadavek 3."): ReferenceError: hodnota3 is not defined']);
    assert.deepEqual(lab.warnings, ['[T3] lab: 3 tipy (nejvýš 2)']);
    assert.deepEqual(codes(lab.advice), ['L1', 'L2', 'X2']);
    assert.deepEqual(byId['zaklad/lab-bez-reseni'].errors, ['[K4] lab nemá sekci --solution--, bez řešení ho nejde ověřit']);
  });

  test('kvíz: Q1, Q2, Q3, Q4; rozbitý modul: chyba parseru', () => {
    const quiz = byId['zaklad/kviz'];
    assert.deepEqual(codes(quiz.warnings), ['Q1', 'Q2', 'Q3']);
    assert.ok(quiz.warnings.includes('[Q3] sada „Krátký kód": soubor kratky.js má 1 řádek (doporučeno 40–120)'));
    assert.deepEqual(codes(quiz.advice), ['Q4']);
    assert.match(byId['zaklad/rozbity'].errors[0], /neznámý blok :::nesmysl/);
  });
});

describe('verify — osnova a doporučená trasa (S2, S3)', () => {
  test('neznámý slug, duplicita, neplatná úroveň, plánovaná bez title, jádro mimo trasu', (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-verify-osnova-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.writeFileSync(path.join(dir, 'osnova.json'), JSON.stringify({
      doporucenaTrasa: ['a', 'a', 'neznama'],
      parts: [{ id: 'p', title: 'P', sections: ['a', { id: 'b', title: 'B' }, { id: 'c', title: 'C', summary: 'S', uroven: 'bonus' }, { id: 'd', title: 'D', summary: 'S', uroven: 'rozsireni' }] }],
    }));
    const { course } = scanContent(dir);
    const outcome = createCourseChecks(course).checkOsnova();
    assert.deepEqual(outcome.errors, [
      '[S2] plánovaná sekce b potřebuje title a summary',
      '[S2] sekce c: neplatná uroven „bonus" (jadro nebo rozsireni)',
      '[S2] doporucenaTrasa: sekce „a" je v trase dvakrát',
      '[S2] doporucenaTrasa: sekce „neznama" není v žádné části',
    ]);
    // c má neplatnou úroveň (S2), d je rozšíření — S3 hlásí jen b.
    assert.deepEqual(outcome.warnings, ['[S3] sekce jádra b chybí v doporucenaTrasa']);
  });
});

describe('verify — výpis', () => {
  test('doporučení jen jako počet, s --doporuceni celá', () => {
    const entry = { id: 'a/b', type: 'lesson', errors: [], warnings: ['[E4] x'], advice: ['[E6] y', '[M2] z'], notes: ['1 otázka'] };
    const short = formatEntry(entry);
    assert.match(short, /a\/b \(lekce\) — 1 otázka · 2 doporučení/);
    assert.doesNotMatch(short, /\[E6\]/);
    assert.match(formatEntry(entry, { showAdvice: true }), /doporučení: \[E6\] y\n.*doporučení: \[M2\] z/);
    assert.match(formatSummary({ modules: 1, errors: 0, warnings: 1, advice: 2 }), /Souhrn: 1 modul, 0 chyb, 1 varování, 2 doporučení/);
  });
});
