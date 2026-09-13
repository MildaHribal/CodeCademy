// Textová pravidla verify, která nepotřebují prohlížeč (kontrakt kap. 10):
// přidané řádky řešení a jejich prozrazení v tipu (T1, W3), aserce bez zprávy (A1),
// bloky kódu v popisu (W2), rámečky (M1, M2), slova výkladu a části lekce (E6),
// sběr markdownu, referencí a klíčů z modulu (S4, S5, S7).
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { normalizeWhitespace } from '../../shared/answers.js';
import { findSeeLinks } from '../../shared/refs.js';

// ---------------------------------------------------------------------------
// Řádky markdownu mimo bloky kódu
// ---------------------------------------------------------------------------

/**
 * Rozdělí markdown na řádky a u každého řekne, jestli je v bloku kódu.
 * @returns {{ text: string, inCode: boolean, fence: boolean, lang: string|null, line: number }[]}
 *   fence = řádek s ``` (otevírací i zavírací), lang = jazyk bloku (u otevíracího a obsahu)
 */
export function markdownLines(markdown) {
  const out = [];
  let fence = null;
  let lang = null;
  String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n').forEach((text, index) => {
    const marker = text.match(/^ {0,3}(`{3,}|~{3,})\s*([^`\s]*)/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && text.trim() === marker[1]) {
        out.push({ text, inCode: false, fence: true, lang, line: index + 1 });
        fence = null;
        lang = null;
      } else {
        out.push({ text, inCode: true, fence: false, lang, line: index + 1 });
      }
      return;
    }
    if (marker) {
      fence = marker[1];
      lang = (marker[2] ?? '').toLowerCase() || null;
      out.push({ text, inCode: false, fence: true, lang, line: index + 1 });
      return;
    }
    out.push({ text, inCode: false, fence: false, lang: null, line: index + 1 });
  });
  return out;
}

/** Bloky kódu v markdownu: [{ lang, content }]. */
export function codeBlocks(markdown) {
  const blocks = [];
  let current = null;
  for (const line of markdownLines(markdown)) {
    if (line.fence && !current) current = { lang: line.lang, lines: [] };
    else if (line.fence && current) {
      blocks.push({ lang: current.lang, content: current.lines.join('\n') });
      current = null;
    } else if (line.inCode && current) current.lines.push(line.text);
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// T1, W3: tip nebo popis prozrazuje řádek řešení
// ---------------------------------------------------------------------------

/**
 * Přidané řádky: řádky souborů řešení (po normalizeWhitespace), které v seedu téhož
 * souboru nejsou, mají aspoň 8 znaků a obsahují písmeno nebo číslici.
 * @returns {Set<string>}
 */
export function addedSolutionLines(seedFiles, solutionFiles) {
  const added = new Set();
  for (const file of solutionFiles) {
    const seed = seedFiles.find((candidate) => candidate.name === file.name);
    const seedLines = new Set(String(seed?.content ?? '').split('\n').map(normalizeWhitespace));
    for (const raw of String(file.content).split('\n')) {
      const line = normalizeWhitespace(raw);
      if (line.length >= 8 && /[\p{L}\p{N}]/u.test(line) && !seedLines.has(line)) added.add(line);
    }
  }
  return added;
}

/** Kandidáti z textu: každý řádek (bez odrážky), obsah inline kódu a řádky bloků kódu. */
export function textCandidates(markdown) {
  const candidates = new Set();
  for (const line of markdownLines(markdown)) {
    if (line.fence) continue;
    if (line.inCode) {
      candidates.add(normalizeWhitespace(line.text));
      continue;
    }
    candidates.add(normalizeWhitespace(line.text.replace(/^\s*(?:[-*]|\d+\.)\s+/, '')));
    for (const code of line.text.matchAll(/(`+)([\s\S]*?)\1/g)) candidates.add(normalizeWhitespace(code[2]));
  }
  candidates.delete('');
  return candidates;
}

/** Přidané řádky řešení, které se v textu objevují (seřazené podle výskytu v textu). */
export function leakedSolutionLines(markdown, addedLines) {
  return [...textCandidates(markdown)].filter((candidate) => addedLines.has(candidate));
}

// ---------------------------------------------------------------------------
// A1: aserce bez zprávy
// ---------------------------------------------------------------------------

const TWO_ARGUMENT_ASSERTS = new Set(['ok']);
const THREE_ARGUMENT_ASSERTS = new Set([
  'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual',
  'deepStrictEqual', 'notDeepStrictEqual', 'match', 'doesNotMatch',
]);

/**
 * Volání `assert(x)`/`assert.ok(x)` s méně než 2 argumenty a `assert.equal…` s méně než 3.
 * Test se naparsuje obalený do `async function`. Nejde-li naparsovat, vrátí null.
 * @returns {null | { line: number, call: string }[]}  line = řádek v testu (1-based)
 */
export function assertionsWithoutMessage(testCode) {
  const wrapped = `async function __akademieTest() {\n${testCode}\n}`;
  let ast;
  try {
    ast = acorn.parse(wrapped, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  } catch {
    return null;
  }
  const found = [];
  walk.simple(ast, {
    CallExpression(node) {
      const { callee } = node;
      let name = null;
      let minimum = 0;
      if (callee.type === 'Identifier' && callee.name === 'assert') {
        name = 'assert';
        minimum = 2;
      } else if (callee.type === 'MemberExpression' && !callee.computed && callee.object.type === 'Identifier'
        && callee.object.name === 'assert' && callee.property.type === 'Identifier') {
        const method = callee.property.name;
        if (TWO_ARGUMENT_ASSERTS.has(method)) minimum = 2;
        else if (THREE_ARGUMENT_ASSERTS.has(method)) minimum = 3;
        name = `assert.${method}`;
      }
      if (name && minimum && node.arguments.length < minimum) found.push({ line: node.loc.start.line - 1, call: name });
    },
  });
  return found.sort((a, b) => a.line - b.line);
}

// ---------------------------------------------------------------------------
// W2: blok kódu v popisu
// ---------------------------------------------------------------------------

export const CODE_BLOCK_LANGS = ['html', 'css', 'js', 'javascript', 'vue', 'jsx', 'ts', 'tsx'];

/** Má markdown blok kódu jazyka z CODE_BLOCK_LANGS s neprázdným obsahem? */
export function hasSolutionLikeCodeBlock(markdown) {
  return codeBlocks(markdown).some((block) => CODE_BLOCK_LANGS.includes(block.lang) && block.content.trim() !== '');
}

// ---------------------------------------------------------------------------
// M1, M2: rámečky
// ---------------------------------------------------------------------------

export const CALLOUT_TYPES = ['REMEMBER', 'PITFALL', 'TIP', 'NOTE'];

/** Rámečky `> [!TYP]` mimo bloky kódu: [{ type, line, known }]. */
export function findCallouts(markdown) {
  const found = [];
  for (const line of markdownLines(markdown)) {
    if (line.inCode || line.fence) continue;
    const match = line.text.match(/^ {0,3}>\s*\[!([^\]\s]*)\]/);
    if (match) found.push({ type: match[1], line: line.line, known: CALLOUT_TYPES.includes(match[1].toUpperCase()) });
  }
  return found;
}

// ---------------------------------------------------------------------------
// E6: slova výkladu a části lekce
// ---------------------------------------------------------------------------

/** Počet slov mimo bloky kódu. */
export function proseWordCount(markdown) {
  return markdownLines(markdown)
    .filter((line) => !line.inCode && !line.fence)
    .reduce((sum, line) => sum + line.text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length, 0);
}

/**
 * Rozdělí lekci na části podle nadpisů `##` (mimo bloky kódu).
 * @returns {{ heading: string|null, markdown: string, blocks: object[] }[]}
 *   první část (heading null) je úvod před prvním `##`; blocks = interaktivní bloky části
 */
export function lessonParts(blocks) {
  const parts = [{ heading: null, markdown: '', blocks: [] }];
  for (const block of blocks) {
    if (block.kind !== 'md') {
      parts.at(-1).blocks.push(block);
      continue;
    }
    for (const line of markdownLines(block.text)) {
      const heading = !line.inCode && !line.fence ? line.text.match(/^ {0,3}##\s+(.+?)\s*#*\s*$/) : null;
      if (heading) parts.push({ heading: heading[1], markdown: '', blocks: [] });
      parts.at(-1).markdown += `${line.text}\n`;
    }
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Sběr markdownu, referencí a klíčů z modulu
// ---------------------------------------------------------------------------

function questionTexts(question, where) {
  const texts = [{ where, text: question.text }];
  if (question.why) texts.push({ where: `${where} (--why--)`, text: question.why });
  for (const answer of question.answers ?? []) {
    texts.push({ where, text: answer.text });
    if (answer.why) texts.push({ where: `${where} (--why--)`, text: answer.why });
  }
  return texts;
}

function explainTexts(explain, where) {
  if (!explain) return [];
  return [
    { where, text: explain.prompt },
    { where: `${where} (--model--)`, text: explain.model },
    ...explain.checklist.map((point) => ({ where: `${where} (--checklist--)`, text: point.text })),
  ];
}

function stepTexts(step, label) {
  return [
    { where: `${label}: popis`, text: step.description },
    ...step.hints.map((hint, index) => ({ where: `${label}: požadavek ${index + 1}`, text: hint.text })),
    ...(step.help ?? []).map((tip, index) => ({ where: `${label}: tip ${index + 1}`, text: tip.text })),
    ...explainTexts(step.explain, `${label}: --explain--`),
    ...(step.approaches ?? []).map((approach) => ({ where: `${label}: přístup „${approach.title}"`, text: approach.description })),
    ...(step.review ? [
      { where: `${label}: --review--`, text: step.review.intro },
      ...step.review.rubric.map((point) => ({ where: `${label}: --rubric--`, text: point.text })),
      { where: `${label}: --extensions--`, text: step.review.extensions },
    ] : []),
  ];
}

/** Popisek kroku, labu nebo projektu ve zprávách verify. */
export function stepLabel(module, step) {
  if (module.type === 'workshop') return `krok ${step.id.split('/').pop()}`;
  return module.type === 'lab' ? 'lab' : 'projekt';
}

/** Kroky modulu, které mají tvar parseStep: [{ step, label }]. */
export function stepItems(module) {
  if (module.type === 'workshop') return module.steps.map((step) => ({ step, label: stepLabel(module, step) }));
  if (module.type === 'lab') return [{ step: module.lab, label: 'lab' }];
  if (module.type === 'project') return [{ step: module.project, label: 'projekt' }];
  return [];
}

/**
 * Všechen markdown modulu, který UI vykresluje: [{ where, text }].
 * Z něj se hledají pojmy `[[…]]`, odkazy `](see:…)` a rámečky.
 */
export function moduleMarkdown(module) {
  const texts = stepItems(module).flatMap(({ step, label }) => stepTexts(step, label));
  if (module.type === 'quiz') {
    module.quiz.questions.forEach((question, index) => texts.push(...questionTexts(question, `otázka ${index + 1}`)));
  }
  if (module.type === 'lesson') {
    let checkNumber = 0;
    let liveNumber = 0;
    let explainNumber = 0;
    for (const block of module.lesson.blocks) {
      if (block.kind === 'md') texts.push({ where: 'výklad', text: block.text });
      if (block.kind === 'check') texts.push(...questionTexts(block.question, `:::check ${++checkNumber}`));
      if (block.kind === 'live') {
        liveNumber++;
        if (block.predict) texts.push(...questionTexts(block.predict, `předpověď v ukázce ${liveNumber}`));
      }
      if (block.kind === 'explain') texts.push(...explainTexts(block, `:::explain ${++explainNumber}`));
    }
    module.lesson.questions.forEach((question, index) => texts.push(...questionTexts(question, `otázka ${index + 1}`)));
  }
  return texts.filter((entry) => typeof entry.text === 'string' && entry.text.trim() !== '');
}

/** Reference modulu: see ve frontmatteru, --see-- otázek a předpovědí a odkazy `](see:…)`. */
export function moduleRefs(module) {
  const refs = [];
  for (const { step, label } of stepItems(module)) {
    for (const ref of step.see ?? []) refs.push({ ref, where: `${label}: see` });
  }
  const questions = [];
  if (module.type === 'quiz') module.quiz.questions.forEach((q, i) => questions.push([q, `otázka ${i + 1}`]));
  if (module.type === 'lesson') {
    module.lesson.blocks.forEach((block, index) => {
      if (block.kind === 'check') questions.push([block.question, `:::check (blok ${index + 1})`]);
      if (block.kind === 'live' && block.predict) questions.push([block.predict, `předpověď (blok ${index + 1})`]);
    });
    module.lesson.questions.forEach((q, i) => questions.push([q, `otázka ${i + 1}`]));
  }
  for (const [question, where] of questions) {
    for (const ref of question.see ?? []) refs.push({ ref, where: `${where}: --see--` });
  }
  for (const { where, text } of moduleMarkdown(module)) {
    for (const link of findSeeLinks(text)) refs.push({ ref: link.ref, where: `${where}: odkaz „${link.text}"` });
  }
  return refs;
}

/** Klíče položek modulu (otázky, body checklistu a rubriky) po souborech: [{ file, keys: [{ key, text }] }]. */
export function moduleKeyGroups(module) {
  const groups = [];
  for (const { step, label } of stepItems(module)) {
    const keys = [...(step.explain?.checklist ?? []), ...(step.review?.rubric ?? [])];
    if (keys.length) groups.push({ file: label, keys });
  }
  if (module.type === 'quiz') groups.push({ file: 'quiz.md', keys: module.quiz.questions });
  if (module.type === 'lesson') {
    const { blocks, questions } = module.lesson;
    groups.push({ file: 'lesson.md (otázky)', keys: [...blocks.filter((b) => b.kind === 'check').map((b) => b.question), ...questions] });
    groups.push({ file: 'lesson.md (checklist)', keys: blocks.filter((b) => b.kind === 'explain').flatMap((b) => b.checklist) });
  }
  return groups;
}

/** Položky s duplicitním klíčem (přípona -2, -3… z parseru). */
export function duplicateKeys(keys) {
  return keys.filter((item) => /-\d+$/.test(item.key ?? ''));
}

/** Zkrácený text do zprávy (bez markdownu). */
export function shorten(text, max = 60) {
  const flat = normalizeWhitespace(text ?? '').replace(/[`*_]/g, '');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}
