// Co verify kontroluje u jednotlivých modulů (kontrakt kap. 10.2–10.5).
//
// planModule(module, context) vrátí seznam běhů runneru (RunRequest) a funkci evaluate,
// která z jejich výsledků sestaví chyby, varování, doporučení a poznámky. Každá zpráva
// začíná kódem pravidla (`[K1] krok 002: …`), aby autor věděl, kterou část příručky číst.
// Samotné spouštění řeší verify.js; kontroly napříč kurzem (odkazy, pojmy) dodá context.
import { normalizeAnswer } from '../../shared/answers.js';
import { applyControlDefaults, assembleParsons } from '../../shared/parse.js';
import { parseRef } from '../../shared/refs.js';
import { headingAnchor } from '../../shared/anchors.js';
import { plural } from './czech.js';
import {
  addedSolutionLines, assertionsWithoutMessage, codeBlocks, duplicateKeys, findCallouts, hasSolutionLikeCodeBlock,
  leakedSolutionLines, lessonParts, moduleKeyGroups, moduleMarkdown, proseWordCount, shorten,
} from './verify-rules.js';

export const MIN_QUIZ_QUESTIONS = 5;
const MDN_ANCHOR = 'kde-to-najdes-v-mdn';

const TYPE_NAMES = { lesson: 'lekce', workshop: 'workshop', lab: 'lab', quiz: 'kvíz', project: 'projekt', section: 'sekce' };

export function typeName(type) {
  return TYPE_NAMES[type] ?? type;
}

const toRunFiles = (files) => files.map((file) => ({ name: file.name, content: file.content }));
const normalizeWhitespace = (text) => String(text).replace(/\s+/g, ' ').trim();
const describeFailure = (error) => shorten(error ?? 'neznámá chyba', 240);
const consoleOutput = (result) => (result.logs ?? []).map((log) => log.text).join('\n');

/**
 * Výsledek jednoho modulu nebo sekce: { errors, warnings, advice, notes } a `report` pro zápis
 * zpráv s kódem pravidla.
 */
export function createOutcome() {
  const outcome = { errors: [], warnings: [], advice: [], notes: [] };
  const add = (list) => (code, text) => list.push(`[${code}] ${text}`);
  const report = {
    error: add(outcome.errors),
    warning: add(outcome.warnings),
    advice: add(outcome.advice),
    note: (text) => outcome.notes.push(text),
  };
  return { outcome, report };
}

/**
 * Plán kontrol, které potřebují běh v runneru, a kontroly bez něj.
 * @param {object} module  výstup loadModule(…, { includeSolutions: true })
 * @param {{ checkModuleLinks?: (module, report) => void, changeRatio?: Function,
 *   earlierSectionInPart?: (fromSectionId, toSectionId) => boolean, sectionHasEarlierInPart?: (sectionId) => boolean }} context
 *   checkModuleLinks: odkazy a pojmy napříč kurzem (S4–S6), changeRatio: ze shared/diff.js (D1)
 * @returns {{ jobs: object[], evaluate(results: object[]): { errors, warnings, advice, notes } }}
 */
export function planModule(module, context = {}) {
  const jobs = [];
  const checks = []; // (results, report) => void
  const addJob = (request) => jobs.push(request) - 1;
  const later = (check) => checks.push(check);

  switch (module.type) {
    case 'workshop':
      planWorkshop(module, { addJob, later, context });
      break;
    case 'lab':
      planStepLike(module, module.lab, 'lab', { addJob, later, context });
      break;
    case 'project':
      planStepLike(module, module.project, 'projekt', { addJob, later, context });
      break;
    case 'lesson':
      planLesson(module, { addJob, later });
      break;
    case 'quiz':
      planQuiz(module, { later, context });
      break;
  }

  // Společné pro všechny moduly: duplicitní klíče (S7), rámečky (M1), odkazy a pojmy (S4–S6).
  later((_, report) => {
    for (const group of moduleKeyGroups(module)) {
      for (const item of duplicateKeys(group.keys)) {
        report.warning('S7', `${group.file}: duplicitní text „${shorten(item.text)}" (klíč ${item.key})`);
      }
    }
    const texts = moduleMarkdown(module);
    for (const { where, text } of texts) {
      for (const callout of findCallouts(text)) {
        if (!callout.known) report.warning('M1', `${where}: neznámý rámeček > [!${callout.type}] (povolené: REMEMBER, PITFALL, TIP, NOTE)`);
      }
    }
    context.checkModuleLinks?.(module, report);
  });

  return {
    jobs,
    evaluate(results) {
      const { outcome, report } = createOutcome();
      for (const check of checks) check(results, report);
      return outcome;
    },
  };
}

// ---------------------------------------------------------------------------
// Krok, lab, projekt (kap. 10.2)
// ---------------------------------------------------------------------------

function timeoutOf(step) {
  // Stejný limit jako v aplikaci: krok ho smí zvýšit ve frontmatteru (`timeoutMs`).
  return typeof step.meta?.timeoutMs === 'number' ? { timeoutMs: step.meta.timeoutMs } : {};
}

/** Chyby řešení (kterýkoli běh, který má projít všemi testy). */
function reportSolutionRun(result, step, label, report, code = 'K1') {
  for (const item of result.results) {
    // Přeskočené testy (stránka se zasekla při načítání) nahlásí už test, který selhal první.
    if (item.pass || item.skipped) continue;
    const hint = shorten(step.hints[item.index]?.text ?? '');
    report.error(code, `${label} neprojde testem ${item.index + 1} („${hint}"): ${describeFailure(item.error)}`);
  }
  if (result.syntaxError) {
    const { file, line, message } = result.syntaxError;
    report.error(code, `${label} nejde spustit: ${message} (${file}:${line})`);
  } else if (result.results.length && result.results.every((item) => item.skipped)) {
    report.error(code, `${label}: žádný test se nespustil (${describeFailure(result.results[0]?.error)})`);
  }
  if (result.errors?.length) {
    report.error(code, `${label} hlásí chyby: ${result.errors.map((error) => shorten(error, 160)).join(' | ')}`);
  }
}

/** Kontroly jednoho kroku, labu nebo projektu (seed, řešení, tipy, aserce, druhy kroků). */
function planStepLike(module, step, label, { addJob, later, context }) {
  const isLab = module.type === 'lab';
  const timeout = timeoutOf(step);
  const run = (files) => addJob({ runtime: step.runtime, files: toRunFiles(files), hints: step.hints, ...timeout });

  if (isLab && step.solution.length === 0) {
    // Lab smí seed i řešení vynechat, verify ale bez řešení nemá co ověřit.
    later((_, report) => report.error('K4', 'lab nemá sekci --solution--, bez řešení ho nejde ověřit'));
  } else {
    const seedJob = run(step.seed);
    const solutionJob = run(step.solution);
    later((results, report) => {
      const seed = results[seedJob];
      const solution = results[solutionJob];
      const runnerError = seed.runnerError ?? solution.runnerError;
      if (runnerError) return report.error('K1', `${label}: ${runnerError}`);
      if (seed.results.every((item) => item.pass)) {
        report.error('K1', `${label}: výchozí kód (seed) projde všemi testy — aspoň jeden test musí selhat`);
      }
      reportSolutionRun(solution, step, `${label}: řešení`, report);
      if (seed.syntaxError) {
        report.warning('K2', `${label}: výchozí kód (seed) nejde spustit: ${seed.syntaxError.message} (${seed.syntaxError.file}:${seed.syntaxError.line})`);
      }
      if (isLab && step.runtime === 'js' && seed.results.length) {
        const missing = seed.results.filter((item) => /ReferenceError/.test(`${item.errorName ?? ''} ${item.error ?? ''}`) && /is not defined/.test(item.error ?? ''));
        if (missing.length > seed.results.length / 2) {
          report.advice('L1', `lab: nad seedem hlásí ${missing.length} z ${seed.results.length} testů „… is not defined" — dej do seedu prázdné kostry funkcí s JSDoc`);
        }
      }
    });

    // P1: každý další přijatelný tvar mezery musí projít stejnými testy.
    if (step.kind === 'parsons' && step.parsons) {
      const target = step.seed.find((file) => file.name === step.parsons.file);
      for (const blank of step.parsons.blanks) {
        for (const form of blank.accept.slice(1)) {
          const content = assembleParsons(target, step.parsons.lines, { ...step.parsons, forms: { [blank.number]: form } });
          const job = run(step.solution.map((file) => (file.name === target.name ? { ...file, content } : file)));
          later((results, report) => reportSolutionRun(results[job], step, `${label}: řešení s tvarem mezery __${blank.number}__ „${form}"`, report, 'P1'));
        }
      }
    }

    // X1: každý přístup z # --approaches-- musí projít testy labu.
    for (const approach of step.approaches ?? []) {
      const job = run(approach.files);
      later((results, report) => reportSolutionRun(results[job], step, `${label}: přístup „${approach.title}"`, report, 'X1'));
    }
  }

  later((_, report) => {
    // T1: tip nesmí obsahovat přidaný řádek řešení.
    const added = addedSolutionLines(step.seed, step.solution);
    step.help.forEach((tip, index) => {
      for (const line of leakedSolutionLines(tip.text, added)) {
        report.error('T1', `${label}: tip ${index + 1} prozrazuje řádek řešení „${shorten(line, 80)}"`);
      }
    });
    // T3: počet tipů.
    const maxTips = isLab ? 2 : 3;
    if (module.type !== 'project' && step.help.length > maxTips) {
      report.warning('T3', `${label}: ${plural(step.help.length, 'tip', 'tipy', 'tipů')} (nejvýš ${maxTips})`);
    }
    // A1: aserce bez zprávy — jedno varování na krok.
    const missing = [];
    step.hints.forEach((hint, index) => {
      for (const found of assertionsWithoutMessage(hint.test) ?? []) missing.push(`test ${index + 1} ř. ${found.line}`);
    });
    if (missing.length) {
      report.warning('A1', `${label}: ${plural(missing.length, 'aserce', 'aserce', 'asercí')} bez české zprávy (${missing.join(', ')})`);
    }
    // D1, D2: oprava chyby.
    if (step.kind === 'debug') {
      const maxChange = typeof step.meta?.maxChange === 'number' ? step.meta.maxChange : 0.5;
      const ratio = debugChangeRatio(step, context.changeRatio);
      if (ratio === null && !context.changeRatio) report.note('D1 přeskočeno (chybí shared/diff.js)');
      if (ratio !== null && ratio > maxChange) {
        report.warning('D1', `${label}: řešení mění ${Math.round(ratio * 100)} % posuzovaných řádků (maxChange ${maxChange})`);
      }
      if (!step.see.length) report.advice('D2', `${label}: krok kind: debug nemá see na past, ze které chyba pochází`);
    }
    // P2: parsons bez distraktorů.
    if (step.kind === 'parsons' && step.parsons && !step.parsons.distractors.length) {
      report.advice('P2', `${label}: parsons nemá ## --distractors--`);
    }
    // X2: checklist a přístupy.
    if (step.explain && (step.explain.checklist.length < 2 || step.explain.checklist.length > 6)) {
      report.advice('X2', `${label}: checklist --explain-- má ${plural(step.explain.checklist.length, 'bod', 'body', 'bodů')} (doporučeno 2–6)`);
    }
    if (isLab) {
      const count = step.approaches?.length ?? 0;
      if (count < 2 || count > 4) report.advice('X2', `lab: ${plural(count, 'přístup', 'přístupy', 'přístupů')} v # --approaches-- (doporučeno 2–4)`);
      if (step.hints.length < 8 || step.hints.length > 20) {
        report.advice('L2', `lab: ${plural(step.hints.length, 'požadavek', 'požadavky', 'požadavků')} (doporučeno 8–20)`);
      }
    }
  });
}

/**
 * Míra změny řešení kroku debug (kap. 3.4): posuzované řádky = neprázdné řádky oblasti --edit--,
 * když ji soubor má, jinak celé soubory, které se v řešení liší od seedu. Null, když není co posoudit.
 */
export function debugChangeRatio(step, changeRatio) {
  if (typeof changeRatio !== 'function') return null;
  let total = 0;
  let missing = 0;
  for (const seed of step.seed) {
    const solution = step.solution.find((file) => file.name === seed.name);
    if (!solution) continue;
    const lines = seed.content.split('\n');
    const assessed = seed.region
      ? lines.slice(seed.region.start - 1, seed.region.end)
      : solution.content !== seed.content ? lines : [];
    const nonEmpty = assessed.filter((line) => line.trim() !== '');
    if (!nonEmpty.length) continue;
    total += nonEmpty.length;
    missing += changeRatio(nonEmpty, solution.content) * nonEmpty.length;
  }
  return total ? missing / total : null;
}

// ---------------------------------------------------------------------------
// Workshop jako celek (kap. 10.3)
// ---------------------------------------------------------------------------

function planWorkshop(module, { addJob, later, context }) {
  const { steps } = module;
  const n = steps.length;
  const third = (index) => Math.floor((index * 3) / n);

  steps.forEach((step, index) => {
    const label = `krok ${step.id.split('/').pop()}`;
    planStepLike(module, step, label, { addJob, later, context });
    if (index > 0) {
      const previous = steps[index - 1];
      // Soubor, který v kroku N nově přibyl (např. index.html při přechodu z js na dom),
      // návaznost neporušuje — uživatelův dosavadní kód zůstává stejný.
      const differences = compareFiles(previous.solution, step.seed, { allowNewFiles: true });
      if (differences.length) {
        later((_, report) => report.warning('K3', `${label}: seed se liší od řešení kroku ${previous.id.split('/').pop()} (${differences.join(', ')})`));
      }
    }
  });

  later((_, report) => {
    report.note(plural(n, 'krok', 'kroky', 'kroků'));
    const count = (kind) => steps.filter((step) => step.kind === kind).length;

    steps.forEach((step, index) => {
      const label = `krok ${step.id.split('/').pop()}`;
      // T2: tipy mimo první třetinu.
      if (third(index) > 0 && step.kind !== 'parsons' && step.help.length === 0) {
        report.warning('T2', `${label}: krok mimo první třetinu nemá # --help--`);
      }
      // W3: popis ve druhé a třetí třetině prozrazuje řádek řešení.
      if (third(index) > 0) {
        const added = addedSolutionLines(step.seed, step.solution);
        for (const line of leakedSolutionLines(step.description, added)) {
          report.warning('W3', `${label}: popis (${third(index) + 1}. třetina) obsahuje řádek řešení „${shorten(line, 80)}"`);
        }
      }
    });

    // W1: aspoň jeden debug krok na ≥ 10 kroků.
    if (n >= 10 && count('debug') === 0) report.warning('W1', `workshop s ${plural(n, 'krokem', 'kroky', 'kroky')} nemá žádný krok kind: debug`);

    // W2: zeslabování v poslední třetině.
    const lastThird = steps.filter((step, index) => third(index) === 2 && step.kind !== 'debug' && step.kind !== 'parsons');
    const withCode = lastThird.filter((step) => hasSolutionLikeCodeBlock(step.description));
    if (lastThird.length && withCode.length / lastThird.length > 0.5) {
      report.warning('W2', `poslední třetina: ${withCode.length} z ${lastThird.length} kroků má v popisu blok kódu (${withCode.map((s) => s.id.split('/').pop()).join(', ')}) — zeslab návod`);
    }

    // W4: doporučené počty.
    if (count('debug') < Math.floor(n / 10)) report.advice('W4', `kroků kind: debug je ${count('debug')}, doporučeno aspoň ${Math.floor(n / 10)}`);
    const explains = steps.filter((step) => step.explain).length;
    if (explains < Math.floor(n / 5)) report.advice('W4', `kroků s # --explain-- je ${explains}, doporučeno aspoň ${Math.floor(n / 5)}`);
    if (n >= 10 && count('parsons') === 0) report.advice('W4', 'workshop s 10+ kroky nemá krok kind: parsons');
    if (n >= 10 && count('choose') === 0) report.advice('W4', 'workshop s 10+ kroky nemá krok kind: choose');
    if (n >= 8 && count('recall') === 0) report.advice('W4', 'workshop s 8+ kroky nemá krok kind: recall');
    if (n < 15 || n > 60) report.advice('W4', `workshop má ${plural(n, 'krok', 'kroky', 'kroků')} (doporučeno 15–60)`);
  });
}

/**
 * Jména souborů, ve kterých se dvě sady liší (po sloučení bílých znaků).
 * allowNewFiles: soubory, které jsou jen v `actualFiles`, se za rozdíl nepočítají.
 */
export function compareFiles(expectedFiles, actualFiles, { allowNewFiles = false } = {}) {
  const expected = new Map(expectedFiles.map((file) => [file.name, normalizeWhitespace(file.content)]));
  const actual = new Map(actualFiles.map((file) => [file.name, normalizeWhitespace(file.content)]));
  const names = [...new Set([...expected.keys(), ...actual.keys()])];
  return names
    .filter((name) => !(allowNewFiles && !expected.has(name)))
    .filter((name) => expected.get(name) !== actual.get(name));
}

// ---------------------------------------------------------------------------
// Lekce (kap. 10.4)
// ---------------------------------------------------------------------------

function planLesson(module, { addJob, later }) {
  const { blocks, questions } = module.lesson;
  const runChecked = (files, runtime, label, { predict = null } = {}) => {
    const job = addJob({ runtime, files: toRunFiles(files), hints: [] });
    later((results, report) => {
      const result = results[job];
      if (result.runnerError) return report.error('E1', `${label}: ${result.runnerError}`);
      if (result.errors?.length) report.error('E1', `${label} hlásí chyby: ${result.errors.map((e) => shorten(e, 160)).join(' | ')}`);
      if (predict?.type === 'text') {
        const actual = consoleOutput(result);
        if (normalizeAnswer(actual) !== normalizeAnswer(predict.expected, { ignoreCase: predict.ignoreCase })) {
          report.error('E2', `${label}: předpověď čeká „${shorten(predict.expected, 80)}", ukázka vypíše „${shorten(actual, 80)}"`);
        }
      }
    });
  };

  let liveNumber = 0;
  let compareNumber = 0;
  for (const block of blocks) {
    if (block.kind === 'live') {
      liveNumber++;
      if (block.runtime === 'node') continue; // předpověď node se nespouští
      const label = `živá ukázka ${liveNumber}`;
      runChecked(applyControlDefaults(block.files, block.controls), block.runtime, label, { predict: block.predict });
      const css = block.files.filter((file) => file.lang === 'css').map((file) => file.content).join('\n');
      const unused = block.controls.filter((control) => !css.includes(`var(${control.name}`));
      if (unused.length) later((_, report) => report.warning('E5', `${label}: ovládací prvek ${unused.map((c) => c.name).join(', ')} se v CSS nepoužívá (var(--…))`));
    }
    if (block.kind === 'compare') {
      compareNumber++;
      const label = `:::compare ${compareNumber}`;
      block.variants.forEach((variant) => runChecked(variant.files, 'dom', `${label}, varianta „${variant.label}"`));
      if (compareFiles(block.variants[0].files, block.variants[1].files).length === 0) {
        later((_, report) => report.error('E3', `${label}: obě varianty mají stejné soubory`));
      }
    }
  }

  later((_, report) => {
    const checks = blocks.filter((block) => block.kind === 'check');
    const graded = checks.filter((block) => !block.pretest);
    const pretests = checks.filter((block) => block.pretest);
    report.note(`${plural(liveNumber, 'živá ukázka', 'živé ukázky', 'živých ukázek')}, ${plural(graded.length + questions.length, 'otázka', 'otázky', 'otázek')}`);

    if (graded.length === 0) report.warning('E4', 'lekce nemá žádný :::check (bez pretest)');

    const firstHeading = blocks.findIndex((block) => block.kind === 'md' && lessonParts([block]).length > 1);
    if (firstHeading !== -1) {
      const late = blocks.filter((block, index) => block.kind === 'check' && block.pretest && index > firstHeading);
      if (late.length) report.warning('E5', `:::check pretest za prvním nadpisem ## (${late.length}×) — otázky předem patří na začátek lekce`);
    }

    // E6: doporučení ke stavbě lekce.
    const parts = lessonParts(blocks).filter((part) => part.heading !== null);
    for (const part of parts) {
      if (headingAnchor(part.heading) === MDN_ANCHOR) continue;
      if (!part.blocks.some((block) => block.kind === 'check')) report.advice('E6', `část „${shorten(part.heading)}" nemá :::check`);
    }
    blocks.forEach((block, index) => {
      if (block.kind !== 'md') return;
      const words = proseWordCount(block.text);
      if (words > 400) report.advice('E6', `výklad v bloku ${index + 1} má ${words} slov bez interaktivního bloku (doporučeno nejvýš 400)`);
    });
    if (!blocks.some((block) => block.kind === 'live' && block.predict)) report.advice('E6', 'lekce nemá předpověď (:::live … predict)');
    if (!pretests.length) report.advice('E6', 'lekce nemá :::check pretest');
    if (questions.length && questions.filter((q) => q.type === 'text').length < questions.length / 2) {
      report.advice('E6', `v # --questions-- je psaných ${questions.filter((q) => q.type === 'text').length} z ${questions.length} (doporučeno aspoň polovina)`);
    }
    if (!module.lesson.headings.some((heading) => heading.level === 2 && headingAnchor(heading.text) === MDN_ANCHOR)) {
      report.advice('E6', 'lekce nemá nadpis „## Kde to najdeš v MDN"');
    }

    // M2: mentální model a pasti v rámečcích.
    const lessonText = blocks.filter((block) => block.kind === 'md').map((block) => block.text).join('\n');
    const callouts = findCallouts(lessonText).map((callout) => callout.type.toUpperCase());
    if (!callouts.includes('REMEMBER')) report.advice('M2', 'lekce nemá rámeček > [!REMEMBER] s mentálním modelem');
    for (const part of parts) {
      if (!/past/.test(headingAnchor(part.heading))) continue;
      if (!findCallouts(part.markdown).some((callout) => callout.type.toUpperCase() === 'PITFALL')) {
        report.advice('M2', `část „${shorten(part.heading)}" nemá rámeček > [!PITFALL]`);
      }
    }

    // Q2 a X2 platí i pro otázky a :::explain lekce.
    reportWrongAnswersWithoutWhy([...checks.map((block) => block.question), ...questions], report);
    blocks.filter((block) => block.kind === 'explain').forEach((block, index) => {
      if (block.checklist.length < 2 || block.checklist.length > 6) {
        report.advice('X2', `:::explain ${index + 1}: checklist má ${plural(block.checklist.length, 'bod', 'body', 'bodů')} (doporučeno 2–6)`);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Kvíz (kap. 10.5)
// ---------------------------------------------------------------------------

/** Q2: špatné odpovědi bez #### --why-- (jedno varování s čísly otázek). */
function reportWrongAnswersWithoutWhy(questions, report) {
  const numbers = [];
  let count = 0;
  questions.forEach((question, index) => {
    const missing = (question.answers ?? []).filter((answer) => !answer.correct && !answer.why).length;
    if (missing) {
      count += missing;
      numbers.push(index + 1);
    }
  });
  if (count) report.warning('Q2', `${plural(count, 'špatná odpověď nemá', 'špatné odpovědi nemají', 'špatných odpovědí nemá')} #### --why-- (otázky ${numbers.join(', ')})`);
}

function planQuiz(module, { later, context }) {
  const { questions, codeSets } = module.quiz;
  later((_, report) => {
    const count = questions.length;
    report.note(plural(count, 'otázka', 'otázky', 'otázek'));
    if (count < MIN_QUIZ_QUESTIONS) report.warning('Q1', `kvíz má jen ${plural(count, 'otázku', 'otázky', 'otázek')} (doporučeno aspoň ${MIN_QUIZ_QUESTIONS})`);
    reportWrongAnswersWithoutWhy(questions, report);

    for (const set of codeSets) {
      for (const file of set.files) {
        const lines = file.content.split('\n').length;
        if (lines < 40 || lines > 120) report.warning('Q3', `sada „${set.title}": soubor ${file.name} má ${plural(lines, 'řádek', 'řádky', 'řádků')} (doporučeno 40–120)`);
      }
    }

    if (count < 10 || count > 20) report.advice('Q4', `kvíz má ${plural(count, 'otázku', 'otázky', 'otázek')} (doporučeno 10–20)`);
    const written = questions.filter((q) => q.type === 'text');
    const withoutWhy = written.filter((q) => !q.why).length;
    if (withoutWhy) report.advice('Q4', `${plural(withoutWhy, 'psaná otázka nemá', 'psané otázky nemají', 'psaných otázek nemá')} --why--`);
    const withoutSee = questions.filter((q) => !q.see.length).length;
    if (withoutSee) report.advice('Q4', `${plural(withoutSee, 'otázka nemá', 'otázky nemají', 'otázek nemá')} --see--`);
    if (!codeSets.length) report.advice('Q4', 'kvíz nemá sadu # --code-- nad delším kódem');
    if (written.length < count / 2) report.advice('Q4', `psaných otázek je ${written.length} z ${count} (doporučeno aspoň polovina)`);
    if (context.sectionHasEarlierInPart?.(module.sectionId)) {
      const earlier = questions.filter((q) => q.see.some((ref) => {
        const target = parseRef(ref)?.sectionId;
        return target && context.earlierSectionInPart(module.sectionId, target);
      })).length;
      if (earlier < count * 0.2) report.advice('Q4', `jen ${earlier} z ${count} otázek má --see-- do dřívější sekce téže části (doporučeno aspoň 20 %)`);
    }
  });
}

// ---------------------------------------------------------------------------
// Karty sekce (kap. 10.5, C1–C3)
// ---------------------------------------------------------------------------

/**
 * Běhy a kontroly karet jedné sekce: karta `code` (C1), karta `output` s jedním blokem js (C2, C3).
 * @returns {{ jobs: object[], evaluate(results, report): void }}  report = createOutcome().report
 */
export function planCards(cards) {
  const jobs = [];
  const checks = [];
  cards.forEach((card, index) => {
    const label = `karta ${index + 1} (${card.type}, „${shorten(card.text.split('\n')[0], 40)}")`;
    if (card.type === 'code') {
      const seedJob = jobs.push({ runtime: 'js', files: toRunFiles(card.seed), hints: card.hints }) - 1;
      const solutionJob = jobs.push({ runtime: 'js', files: toRunFiles(card.solution), hints: card.hints }) - 1;
      checks.push((results, report) => {
        const seed = results[seedJob];
        const solution = results[solutionJob];
        const runnerError = seed.runnerError ?? solution.runnerError;
        if (runnerError) return report.error('C1', `${label}: ${runnerError}`);
        if (seed.results.every((item) => item.pass)) report.error('C1', `${label}: test nad --seed-- neselže`);
        if (!solution.results.every((item) => item.pass) || solution.errors?.length || solution.syntaxError) {
          const failed = solution.results.find((item) => !item.pass);
          report.error('C1', `${label}: test nad --solution-- neprojde: ${describeFailure(failed?.error ?? solution.syntaxError?.message ?? solution.errors?.[0])}`);
        }
      });
    }
    if (card.type === 'output') {
      const js = codeBlocks(card.text).filter((block) => block.lang === 'js' || block.lang === 'javascript');
      if (js.length !== 1) return;
      const job = jobs.push({ runtime: 'js', files: [{ name: 'script.js', content: js[0].content }], hints: [] }) - 1;
      checks.push((results, report) => {
        const result = results[job];
        if (result.runnerError) return report.error('C2', `${label}: ${result.runnerError}`);
        const actual = consoleOutput(result);
        if (!actual.trim()) report.warning('C3', `${label}: kód nic nevypíše`);
        if (normalizeAnswer(actual, { ignoreCase: card.ignoreCase }) !== normalizeAnswer(card.expected, { ignoreCase: card.ignoreCase })) {
          report.error('C2', `${label}: --expected-- „${shorten(card.expected, 60)}", kód vypíše „${shorten(actual, 60)}"`);
        }
      });
    }
  });
  return {
    jobs,
    evaluate(results, report) {
      for (const check of checks) check(results, report);
    },
  };
}
