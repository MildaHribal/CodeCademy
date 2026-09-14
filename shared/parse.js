// Parser obsahových souborů Akademie: kroky (workshop/lab/projekt), kvízy, lekce, karty a pojmy.
// Formát je popsaný v docs/kontrakt.md (kap. 2–5). Parser nesahá na disk — dostane text, vrátí data.
//
// Stavba souboru:
//   1. společné nástroje (frontmatter, řádky mimo/uvnitř bloků kódu, sekce `# --jméno--`)
//   2. otázky (kap. 4) — jeden formát pro kvíz, lekci, :::check, karty i předpověď
//   3. seznamy bodů (checklist `--explain--`, rubrika `--review--`)
//   4. krok workshopu, lab a projekt (kap. 3)
//   5. kvíz (kap. 4.3)
//   6. lekce a její bloky (kap. 5)
//   7. karty a pojmy sekce (kap. 2.5, 2.6)
import { createKeyAllocator } from './answers.js';
import { collectHeadings, extractHeadings, headingAnchor } from './anchors.js';
import { parseRef } from './refs.js';

export class ParseError extends Error {
  constructor(message, { id, line } = {}) {
    super(`${id ?? '?'}${line ? `:${line}` : ''} — ${message}`);
    this.name = 'ParseError';
    this.id = id;
    this.line = line;
  }
}

export const RUNTIMES = ['dom', 'js', 'vue', 'react', 'node'];
/**
 * Knihovny prohlížečových runtime (frontmatter a module.json `libs`, `:::live … libs=`; kap. 6.10).
 * Stejný seznam jako LIB_NAMES v client/src/runner/vendor-libs.js (hlídá tools/runner-unit.test.js).
 */
export const LIBS = ['tailwind', 'gsap', 'motion', 'lenis', 'three'];
/** Runtime, ve kterých jde `libs` použít. */
export const LIB_RUNTIMES = ['dom', 'vue', 'react'];

/**
 * `libs` z frontmatteru (`tailwind, gsap`), z module.json (pole nebo text) nebo z `libs=` u :::live.
 * @returns {string[]} známá jména bez duplicit v pořadí zápisu; neznámé jméno = ParseError
 */
export function parseLibs(value, { id, line, where = 'libs' } = {}) {
  if (value === undefined || value === null || value === '') return [];
  // Frontmatter bere i zápis se závorkami: `libs: [tailwind, gsap]`.
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.replace(/^\s*\[(.*)\]\s*$/, '$1').split(',') : null;
  if (!items || !items.every((item) => typeof item === 'string')) {
    throw new ParseError(`${where} musí být jména knihoven oddělená čárkou (${LIBS.join(', ')})`, { id, line });
  }
  const libs = [];
  for (const raw of items) {
    const name = raw.trim().toLowerCase();
    if (!name) continue;
    if (!LIBS.includes(name)) throw new ParseError(`neznámá knihovna "${raw.trim()}" v ${where} (povolené: ${LIBS.join(', ')})`, { id, line });
    if (!libs.includes(name)) libs.push(name);
  }
  return libs;
}
/** Druhy kroku (frontmatter `kind`, kap. 3.1). */
export const STEP_KINDS = ['step', 'debug', 'parsons', 'recall', 'choose'];

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})\s*([^`\s]*)?.*$/;
const EDIT_MARKER = '--edit--';

// ===========================================================================
// 1. Společné nástroje
// ===========================================================================

/** Rozdělí text na řádky a odloupne frontmatter (jednoduché `klíč: hodnota`). */
function splitFrontmatter(src, id) {
  const lines = String(src ?? '').replace(/\r\n?/g, '\n').split('\n');
  const meta = {};
  if (lines[0]?.trim() !== '---') return { meta, lines, offset: 0 };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) throw new ParseError('neuzavřený frontmatter (chybí druhé ---)', { id, line: 1 });
  for (let i = 1; i < end; i++) {
    const raw = lines[i];
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const m = raw.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!m) throw new ParseError(`neplatný řádek frontmatteru: "${raw}"`, { id, line: i + 1 });
    let value = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value);
    else if (value === 'true' || value === 'false') value = value === 'true';
    meta[m[1]] = value;
  }
  return { meta, lines: lines.slice(end + 1), offset: end + 1 };
}

/**
 * Projde řádky a vrátí je obohacené o informaci, jestli leží uvnitř bloku kódu:
 * kind = 'text' | 'fence-open' (s `lang`) | 'code' | 'fence-close'.
 * Nadpisy a značky se hledají jen v řádcích 'text'.
 */
function annotate(lines, offset) {
  const out = [];
  let fence = null;
  lines.forEach((text, i) => {
    const line = offset + i + 1;
    if (fence) {
      const close = text.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) {
        out.push({ text, line, kind: 'fence-close' });
        fence = null;
      } else {
        out.push({ text, line, kind: 'code' });
      }
      return;
    }
    const open = text.match(FENCE_OPEN);
    if (open) {
      fence = open[1];
      out.push({ text, line, kind: 'fence-open', lang: (open[2] ?? '').toLowerCase() });
      return;
    }
    out.push({ text, line, kind: 'text' });
  });
  if (fence) out.unclosedFence = true;
  return out;
}

/** Řádky souboru bez frontmatteru, anotované; neuzavřený blok kódu = ParseError. */
function readRows(src, id) {
  const { meta, lines, offset } = splitFrontmatter(src, id);
  const rows = annotate(lines, offset);
  if (rows.unclosedFence) throw new ParseError('neuzavřený blok kódu', { id });
  return { meta, rows };
}

/** Rozseká anotované řádky podle nadpisů `#… --jmeno-- [argument]` dané úrovně. */
function splitSections(rows, level) {
  const re = new RegExp(`^#{${level}} --([a-z-]+)--(?:\\s+(.+?))?\\s*$`);
  const preamble = [];
  const sections = [];
  for (const row of rows) {
    const m = row.kind === 'text' ? row.text.match(re) : null;
    if (m) sections.push({ name: m[1], arg: m[2] ?? null, line: row.line, rows: [] });
    else (sections.at(-1)?.rows ?? preamble).push(row);
  }
  return { preamble, sections };
}

function joinText(rows) {
  return rows.map((r) => r.text).join('\n').trim();
}

/** Řádek prvního neprázdného řádku (pro čísla řádků v chybách). */
function firstTextLine(rows) {
  return rows.find((r) => r.text.trim())?.line;
}

/** Vytáhne všechny bloky kódu z řádků: [{ lang, content, line }]. */
function fences(rows) {
  const out = [];
  let cur = null;
  for (const row of rows) {
    if (row.kind === 'fence-open') cur = { lang: row.lang, line: row.line, body: [] };
    else if (row.kind === 'code' && cur) cur.body.push(row.text);
    else if (row.kind === 'fence-close' && cur) {
      out.push({ lang: cur.lang, line: cur.line, content: cur.body.join('\n') });
      cur = null;
    }
  }
  return out;
}

/** Řádky 'text' mimo bloky kódu, které nejsou prázdné. */
function proseRows(rows) {
  return rows.filter((r) => r.kind === 'text' && r.text.trim());
}

/** Každá sekce nejvýš jednou a jen z povolených jmen → { jméno: sekce }. */
function indexSections(sections, allowed, id, where) {
  const byName = {};
  for (const s of sections) {
    if (!allowed.includes(s.name)) throw new ParseError(`neznámá sekce --${s.name}--${where ? ` v ${where}` : ''}`, { id, line: s.line });
    if (byName[s.name]) throw new ParseError(`sekce --${s.name}-- je tam dvakrát`, { id, line: s.line });
    byName[s.name] = s;
  }
  return byName;
}

export function langOf(name) {
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  return { mjs: 'js', cjs: 'js', htm: 'html', yml: 'yaml' }[ext] ?? ext;
}

/** Odstraní značky --edit-- a vrátí obsah + editovatelnou oblast (řádky 1-based, včetně). */
export function extractRegion(content, { id, name } = {}) {
  const lines = content.split('\n');
  const marks = [];
  lines.forEach((l, i) => { if (l.trim() === EDIT_MARKER) marks.push(i); });
  if (marks.length === 0) return { content, region: null };
  if (marks.length !== 2) {
    throw new ParseError(`soubor ${name} má ${marks.length}× značku ${EDIT_MARKER}, musí být 0 nebo 2`, { id });
  }
  const [a, b] = marks;
  const kept = lines.filter((_, i) => i !== a && i !== b);
  // Po odstranění první značky začíná oblast na řádku a (0-based) → a + 1 (1-based).
  const start = a + 1;
  const end = start + (b - a - 1) - 1;
  return { content: kept.join('\n'), region: { start, end } };
}

/**
 * Soubory `#… --file-- jméno` (každý s jedním blokem kódu) v sekci.
 * @param {number} level  úroveň nadpisů souborů (2 v `--seed--`, 3 v `--approach--`)
 */
function parseFiles(rows, { id, level, where, line, allowRegion }) {
  const { preamble, sections } = splitSections(rows, level);
  if (joinText(preamble)) {
    throw new ParseError(`v ${where} je text mimo "${'#'.repeat(level)} --file-- jméno"`, { id, line: firstTextLine(preamble) ?? line });
  }
  return sections.map((s) => {
    if (s.name !== 'file') {
      throw new ParseError(`očekával jsem "${'#'.repeat(level)} --file-- jméno", našel "--${s.name}--"`, { id, line: s.line });
    }
    return parseFileSection(s, { id, allowRegion });
  });
}

/** Jedna sekce `--file-- jméno` s právě jedním blokem kódu → { name, lang, content[, region] }. */
function parseFileSection(section, { id, allowRegion }) {
  if (!section.arg) throw new ParseError('--file-- potřebuje jméno souboru', { id, line: section.line });
  const blocks = fences(section.rows);
  if (blocks.length !== 1) {
    throw new ParseError(`soubor ${section.arg} musí mít přesně jeden blok kódu (má ${blocks.length})`, { id, line: section.line });
  }
  const name = section.arg.trim();
  const base = { name, lang: langOf(name) };
  if (!allowRegion) return { ...base, content: blocks[0].content };
  const { content, region } = extractRegion(blocks[0].content, { id, name });
  return { ...base, content, region };
}

/** Sloučí seed a řešení: řešení přepisuje soubory se stejným jménem, zbytek zůstává ze seedu. */
export function mergeFiles(seed, solution) {
  const byName = new Map(seed.map((f) => [f.name, { name: f.name, lang: f.lang, content: f.content }]));
  for (const f of solution) byName.set(f.name, { name: f.name, lang: f.lang, content: f.content });
  return [...byName.values()];
}

/** Seznam referencí (kap. 2.9); neplatná reference = ParseError. */
function parseRefList(values, { id, line, where }) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((ref) => {
      if (!parseRef(ref)) throw new ParseError(`neplatná reference "${ref}" v ${where} (čekám sekce/modul[/krok][#kotva])`, { id, line });
      return ref;
    });
}

// ===========================================================================
// 2. Otázky (kap. 4)
// ===========================================================================

/**
 * Obsah `--expected--` (a `--output--`): přesně jeden blok kódu, nebo prostý text.
 */
function expectedContent(rows, { id, line, where }) {
  const blocks = fences(rows);
  const prose = proseRows(rows);
  if (blocks.length > 1) throw new ParseError(`${where} smí mít nejvýš jeden blok kódu`, { id, line });
  if (blocks.length === 1 && prose.length) throw new ParseError(`${where} má blok kódu i text zároveň`, { id, line });
  const value = blocks.length === 1 ? blocks[0].content : joinText(rows);
  if (!value.trim()) throw new ParseError(`${where} je prázdné`, { id, line });
  return value;
}

/** Obsah `--accept--`: bloky kódu (každý jeden tvar), nebo řádky (každý neprázdný řádek jeden tvar). */
function acceptContent(rows, { id, line, where }) {
  const blocks = fences(rows);
  if (blocks.length) {
    if (proseRows(rows).length) throw new ParseError(`${where}: text mimo bloky kódu (s bloky je každý blok jeden tvar)`, { id, line });
    return blocks.map((b) => b.content);
  }
  return rows.map((r) => r.text.trim()).filter(Boolean);
}

function parseIgnoreCase(arg, { id, line }) {
  if (arg === null) return false;
  if (arg.trim() === 'ignore-case') return true;
  throw new ParseError(`neznámý argument "--expected-- ${arg}" (povolený je jen ignore-case)`, { id, line });
}

/**
 * Jedna otázka ze sekcí úrovně 3 (kap. 4.1, 4.2). `rows` = obsah otázky bez řádku `## --question--`.
 * Vrací otázku bez `key` — klíč přidělí volající přes přidělovač celého souboru.
 */
function parseQuestionRows(rows, { id, line }) {
  const { preamble, sections } = splitSections(rows, 3);
  const text = joinText(preamble);
  if (!text) throw new ParseError('otázka nemá text', { id, line });

  const answers = [];
  const single = {};
  for (const s of sections) {
    if (s.name === 'answer' || s.name === 'correct') {
      const parts = splitSections(s.rows, 4);
      const bad = parts.sections.find((p) => p.name !== 'why');
      if (bad) throw new ParseError(`neznámá sekce --${bad.name}-- v odpovědi (povolená je jen #### --why--)`, { id, line: bad.line });
      if (parts.sections.length > 1) throw new ParseError('odpověď má #### --why-- dvakrát', { id, line: parts.sections[1].line });
      const answerText = joinText(parts.preamble);
      if (!answerText) throw new ParseError('prázdná odpověď', { id, line: s.line });
      answers.push({ text: answerText, correct: s.name === 'correct', why: parts.sections[0] ? joinText(parts.sections[0].rows) : '' });
      continue;
    }
    if (!['expected', 'accept', 'why', 'see'].includes(s.name)) {
      throw new ParseError(`neznámá sekce --${s.name}-- v otázce`, { id, line: s.line });
    }
    if (single[s.name]) throw new ParseError(`sekce --${s.name}-- je v otázce dvakrát`, { id, line: s.line });
    single[s.name] = s;
  }

  const see = single.see ? parseRefList(single.see.rows.filter((r) => r.kind === 'text').map((r) => r.text), { id, line: single.see.line, where: '--see--' }) : [];

  if (answers.length) {
    if (single.expected || single.accept) throw new ParseError('otázka kombinuje odpovědi (--answer--/--correct--) a psanou odpověď (--expected--)', { id, line });
    if (single.why) throw new ParseError('### --why-- u otázky s výběrem nepatří — vysvětlení patří k odpovědi (#### --why--)', { id, line: single.why.line });
    if (answers.length < 2) throw new ParseError('otázka potřebuje aspoň 2 odpovědi', { id, line });
    if (!answers.some((a) => a.correct)) throw new ParseError('otázka nemá žádnou --correct-- odpověď', { id, line });
    return { type: 'choice', text, multiple: answers.filter((a) => a.correct).length > 1, answers, see };
  }

  if (!single.expected) {
    throw new ParseError('otázka nemá odpovědi (--answer--/--correct--) ani psanou odpověď (--expected--)', { id, line });
  }
  return {
    type: 'text',
    text,
    expected: expectedContent(single.expected.rows, { id, line: single.expected.line, where: '--expected--' }),
    accept: single.accept ? acceptContent(single.accept.rows, { id, line: single.accept.line, where: '--accept--' }) : [],
    ignoreCase: parseIgnoreCase(single.expected.arg, { id, line: single.expected.line }),
    why: single.why ? joinText(single.why.rows) : '',
    see,
  };
}

/** Otázka s klíčem na začátku objektu (tvar z kontraktu kap. 4.4). */
function withKey(question, nextKey) {
  return { key: nextKey(question.text), ...question };
}

/** Řada `## --question--` (kvíz, `# --questions--` lekce). */
function parseQuestionList(rows, { id, nextKey }) {
  const { preamble, sections } = splitSections(rows, 2);
  if (joinText(preamble)) throw new ParseError('text mimo "## --question--"', { id, line: firstTextLine(preamble) });
  return sections.map((q) => {
    if (q.name !== 'question') throw new ParseError(`očekával jsem --question--, našel --${q.name}--`, { id, line: q.line });
    return withKey(parseQuestionRows(q.rows, { id, line: q.line }), nextKey);
  });
}

// ===========================================================================
// 3. Seznamy bodů (checklist, rubrika)
// ===========================================================================

const LIST_ITEM = /^ {0,3}(?:[-*]|\d+[.)])\s+(.*)$/;

/**
 * Markdown seznam, každá položka = jeden bod. Víceřádková položka pokračuje odsazenými řádky.
 * Text mimo položky = ParseError.
 */
function parseListItems(rows, { id, line, where, nextKey }) {
  const items = [];
  for (const row of rows) {
    if (row.kind === 'text') {
      if (!row.text.trim()) continue;
      const item = row.text.match(LIST_ITEM);
      if (item) {
        items.push([item[1]]);
        continue;
      }
      if (/^\s+\S/.test(row.text) && items.length) {
        items.at(-1).push(row.text.trim());
        continue;
      }
      throw new ParseError(`v ${where} je text mimo položky seznamu: "${row.text.trim()}"`, { id, line: row.line });
    }
    // Blok kódu smí být jen součástí položky (odsazený pod ní).
    if (!items.length) throw new ParseError(`v ${where} je blok kódu mimo položky seznamu`, { id, line: row.line });
    items.at(-1).push(row.text.replace(/^ {1,4}/, ''));
  }
  if (!items.length) throw new ParseError(`${where} nemá žádnou položku`, { id, line });
  return items.map((lines) => {
    const text = lines.join('\n').trim();
    return { key: nextKey(text), text };
  });
}

/**
 * Vysvětli vlastními slovy (kap. 3.7, 5.5): zadání, `## --model--`, `## --checklist--`.
 * @returns {{ prompt, model, checklist: { key, text }[] }}
 */
function parseExplainRows(rows, { id, line, nextKey }) {
  const { preamble, sections } = splitSections(rows, 2);
  const byName = indexSections(sections, ['model', 'checklist'], id, 'bloku vysvětlení');
  const prompt = joinText(preamble);
  if (!prompt) throw new ParseError('vysvětlení nemá zadání (text před ## --model--)', { id, line });
  if (!byName.model) throw new ParseError('vysvětlení nemá ## --model--', { id, line });
  if (!byName.checklist) throw new ParseError('vysvětlení nemá ## --checklist--', { id, line });
  const model = joinText(byName.model.rows);
  if (!model) throw new ParseError('## --model-- je prázdný', { id, line: byName.model.line });
  const checklist = parseListItems(byName.checklist.rows, { id, line: byName.checklist.line, where: '## --checklist--', nextKey });
  return { prompt, model, checklist };
}

// ===========================================================================
// 4. Krok workshopu, lab a projekt (kap. 3)
// ===========================================================================

/** Povolené sekce podle typu souboru (tabulka kap. 3.1). */
const STEP_SECTIONS = {
  step: ['description', 'hints', 'help', 'seed', 'solution', 'explain', 'parsons'],
  lab: ['description', 'hints', 'help', 'seed', 'solution', 'explain', 'approaches', 'review'],
  // Projekt bere výchozí soubory ze starter/ a řešení ze solution/ — sekce seed a solution nemá.
  project: ['description', 'hints', 'help', 'review'],
};
const ALL_STEP_SECTIONS = [...new Set(Object.values(STEP_SECTIONS).flat())];
const FILE_KIND_NAMES = { step: 'kroku workshopu', lab: 'labu', project: 'projektu' };

function parseHints(section, id) {
  const hints = [];
  let text = [];
  let pendingTest = null;
  let inTest = false;
  for (const row of section.rows) {
    if (row.kind === 'fence-open' && (row.lang === 'js' || row.lang === 'javascript') && !inTest) {
      if (!joinText(text)) throw new ParseError('test nemá před sebou text nápovědy', { id, line: row.line });
      inTest = true;
      pendingTest = { line: row.line, body: [] };
      continue;
    }
    if (inTest) {
      if (row.kind === 'fence-close') {
        hints.push({ text: joinText(text), test: pendingTest.body.join('\n') });
        text = [];
        inTest = false;
      } else {
        pendingTest.body.push(row.text);
      }
      continue;
    }
    text.push(row);
  }
  if (joinText(text)) {
    throw new ParseError('poslední nápověda nemá test (blok ```js)', { id, line: section.line });
  }
  return hints;
}

/** Odstupňované nápovědy `# --help--` (kap. 3.3). */
function parseHelp(section, { id, hintCount }) {
  const { preamble, sections } = splitSections(section.rows, 2);
  if (joinText(preamble)) throw new ParseError('v # --help-- je text mimo "## --tip--"', { id, line: firstTextLine(preamble) });
  return sections.map((tip) => {
    if (tip.name !== 'tip') throw new ParseError(`v # --help-- smí být jen ## --tip--, našel --${tip.name}--`, { id, line: tip.line });
    let hintIndex = null;
    if (tip.arg !== null) {
      if (!/^\d+$/.test(tip.arg.trim())) throw new ParseError(`"## --tip-- ${tip.arg}": číslo požadavku musí být celé číslo`, { id, line: tip.line });
      const number = Number(tip.arg.trim());
      if (number < 1 || number > hintCount) {
        throw new ParseError(`"## --tip-- ${number}": krok má požadavky 1–${hintCount}`, { id, line: tip.line });
      }
      hintIndex = number - 1;
    }
    const text = joinText(tip.rows);
    if (!text) throw new ParseError('prázdný tip', { id, line: tip.line });
    return { text, hintIndex };
  });
}

/** Seřaď řádky `# --parsons--` (kap. 3.5) bez souboru a řešení — ty doplní parseStep. */
function parseParsonsSection(section, { id }) {
  const { preamble, sections } = splitSections(section.rows, 2);
  const byName = indexSections(sections, ['distractors', 'blanks'], id, '# --parsons--');

  const blocks = fences(preamble);
  if (blocks.length !== 1 || proseRows(preamble).length) {
    throw new ParseError('# --parsons-- musí před podsekcemi obsahovat přesně jeden blok kódu a nic jiného', { id, line: section.line });
  }
  const raw = blocks[0].content.split('\n').filter((l) => l.trim());
  if (raw.length === 0) throw new ParseError('# --parsons-- nemá žádný řádek', { id, line: section.line });
  const indents = raw.map((l) => {
    const lead = l.match(/^[ \t]*/)[0];
    if (lead.includes('\t')) throw new ParseError(`řádek "${l.trim()}" má v odsazení tabulátor — použij mezery`, { id, line: blocks[0].line });
    return lead.length;
  });
  const positive = indents.filter((n) => n > 0);
  const indentUnit = positive.length ? Math.min(...positive) : 2;
  const lines = raw.map((l, i) => {
    if (indents[i] % indentUnit !== 0) {
      throw new ParseError(`řádek "${l.trim()}" má odsazení ${indents[i]} mezer, které není násobkem ${indentUnit}`, { id, line: blocks[0].line });
    }
    return { text: l.trim(), indent: indents[i] / indentUnit };
  });

  let distractors = [];
  if (byName.distractors) {
    const dBlocks = fences(byName.distractors.rows);
    if (dBlocks.length !== 1 || proseRows(byName.distractors.rows).length) {
      throw new ParseError('## --distractors-- musí obsahovat přesně jeden blok kódu', { id, line: byName.distractors.line });
    }
    distractors = dBlocks[0].content.split('\n').map((l) => l.trim()).filter(Boolean);
    const solutionTexts = new Set(lines.map((l) => l.text));
    const same = distractors.find((d) => solutionTexts.has(d));
    if (same) throw new ParseError(`distraktor "${same}" je stejný jako řádek řešení`, { id, line: byName.distractors.line });
  }

  const markers = new Set();
  for (const l of lines) for (const m of l.text.matchAll(/__(\d+)__/g)) markers.add(Number(m[1]));
  const accepted = new Map();
  if (byName.blanks) {
    const bBlocks = fences(byName.blanks.rows);
    if (bBlocks.length !== 1 || bBlocks[0].lang !== 'text' || proseRows(byName.blanks.rows).length) {
      throw new ParseError('## --blanks-- musí obsahovat přesně jeden blok ```text', { id, line: byName.blanks.line });
    }
    for (const l of bBlocks[0].content.split('\n')) {
      if (!l.trim()) continue;
      const m = l.match(/^\s*(\d+)\s*:\s?(.*)$/);
      if (!m || !m[2].trim()) throw new ParseError(`řádek "${l}" v ## --blanks-- musí mít tvar "N: odpověď"`, { id, line: byName.blanks.line });
      const number = Number(m[1]);
      if (!accepted.has(number)) accepted.set(number, []);
      accepted.get(number).push(m[2].trim());
    }
  }
  if (markers.size && !byName.blanks) throw new ParseError('řádky mají mezery __N__, ale chybí ## --blanks--', { id, line: section.line });
  for (const n of markers) {
    if (!accepted.has(n)) throw new ParseError(`mezera __${n}__ nemá odpověď v ## --blanks--`, { id, line: section.line });
  }
  for (const n of accepted.keys()) {
    if (!markers.has(n)) throw new ParseError(`odpověď ${n} v ## --blanks-- nemá v řádcích značku __${n}__`, { id, line: byName.blanks.line });
  }
  const numbers = [...markers].sort((a, b) => a - b);
  numbers.forEach((n, i) => {
    if (n !== i + 1) throw new ParseError(`mezery musí být číslované souvisle od 1 (chybí __${i + 1}__)`, { id, line: section.line });
  });

  return {
    indentUnit,
    lines,
    distractors,
    blanks: numbers.map((number) => ({ number, accept: accepted.get(number) })),
  };
}

/** Text řádku parsons s doplněnými mezerami (`forms` = { číslo: tvar }, jinak kanonická odpověď). */
export function fillParsonsLine(text, blanks, forms = {}) {
  return text.replace(/__(\d+)__/g, (marker, n) => forms[n] ?? blanks.find((b) => b.number === Number(n))?.accept[0] ?? marker);
}

/**
 * Soubor seedu s řádky parsons vloženými do (prázdné) oblasti `--edit--`.
 * Stejně skládá řešení parser, verify (přijatelné tvary mezer) i UI (uživatelovo pořadí).
 * @param {{ content, region }} seedFile
 * @param {{ text, indent }[]} lines
 */
export function assembleParsons(seedFile, lines, { indentUnit, blanks = [], forms = {} }) {
  const contentLines = seedFile.content.split('\n');
  const inserted = lines.map((l) => ' '.repeat(l.indent * indentUnit) + fillParsonsLine(l.text, blanks, forms));
  const at = seedFile.region.start - 1;
  return [...contentLines.slice(0, at), ...inserted, ...contentLines.slice(at)].join('\n');
}

/** Jiné přístupy `# --approaches--` (kap. 3.8). */
function parseApproaches(section, { id, seed }) {
  const { preamble, sections } = splitSections(section.rows, 2);
  if (joinText(preamble)) throw new ParseError('v # --approaches-- je text mimo "## --approach-- název"', { id, line: firstTextLine(preamble) });
  return sections.map((s) => {
    if (s.name !== 'approach') throw new ParseError(`v # --approaches-- smí být jen ## --approach--, našel --${s.name}--`, { id, line: s.line });
    if (!s.arg) throw new ParseError('## --approach-- potřebuje název', { id, line: s.line });
    const firstFile = s.rows.findIndex((r) => r.kind === 'text' && /^### --[a-z-]+--/.test(r.text));
    const descriptionRows = firstFile === -1 ? s.rows : s.rows.slice(0, firstFile);
    const fileRows = firstFile === -1 ? [] : s.rows.slice(firstFile);
    const files = parseFiles(fileRows, { id, level: 3, where: `přístupu "${s.arg}"`, line: s.line, allowRegion: false });
    if (files.length === 0) throw new ParseError(`přístup "${s.arg}" nemá žádný ### --file--`, { id, line: s.line });
    return { title: s.arg.trim(), description: joinText(descriptionRows), files: mergeFiles(seed, files) };
  });
}

/** Rubrika `# --review--` (kap. 3.9). */
function parseReview(section, { id, nextKey }) {
  const { preamble, sections } = splitSections(section.rows, 2);
  const byName = indexSections(sections, ['rubric', 'extensions'], id, '# --review--');
  if (!byName.rubric) throw new ParseError('# --review-- nemá ## --rubric--', { id, line: section.line });
  return {
    intro: joinText(preamble),
    rubric: parseListItems(byName.rubric.rows, { id, line: byName.rubric.line, where: '## --rubric--', nextKey }),
    extensions: byName.extensions ? joinText(byName.extensions.rows) : '',
  };
}

/** Popis `kind: debug` musí mít `## Hlášení` a `## Úkol` (mimo bloky kódu) v tomto pořadí. */
function checkDebugDescription(rows, id) {
  const headings = rows.filter((r) => r.kind === 'text').map((r) => r.text.trim());
  const report = headings.indexOf('## Hlášení');
  const task = headings.indexOf('## Úkol');
  if (report === -1 || task === -1 || task < report) {
    throw new ParseError('popis kroku kind: debug musí obsahovat nadpisy "## Hlášení" a "## Úkol" v tomto pořadí', { id });
  }
}

/**
 * Krok workshopu, lab nebo projekt.
 * @param {{ id, defaultRuntime?, defaultTitle?, defaultLibs?: string[], requireSeed?, fileKind?: 'step'|'lab'|'project' }} options
 *   requireSeed: seed a řešení jsou povinné (výchozí jen u kroku workshopu)
 *   defaultLibs: `libs` z module.json — sečtou se s `libs` z frontmatteru (kap. 6.10)
 * @returns tvar z kontraktu kap. 3.2
 */
export function parseStep(src, { id, defaultRuntime = 'dom', defaultTitle = '', defaultLibs = [], fileKind = 'step', requireSeed = fileKind === 'step' } = {}) {
  if (!STEP_SECTIONS[fileKind]) throw new ParseError(`neznámý typ souboru "${fileKind}"`, { id });
  const { meta, rows } = readRows(src, id);
  const { preamble, sections } = splitSections(rows, 1);
  if (joinText(preamble)) throw new ParseError('text před první sekcí "# --description--"', { id, line: firstTextLine(preamble) });

  const byName = {};
  for (const s of sections) {
    if (!ALL_STEP_SECTIONS.includes(s.name)) throw new ParseError(`neznámá sekce --${s.name}--`, { id, line: s.line });
    if (!STEP_SECTIONS[fileKind].includes(s.name)) {
      const projectHint = fileKind === 'project' && (s.name === 'seed' || s.name === 'solution')
        ? ` (projekt bere soubory ze složky ${s.name === 'seed' ? 'starter/' : 'solution/'})`
        : '';
      throw new ParseError(`sekce --${s.name}-- nepatří do ${FILE_KIND_NAMES[fileKind]}${projectHint}`, { id, line: s.line });
    }
    if (byName[s.name]) throw new ParseError(`sekce --${s.name}-- je tam dvakrát`, { id, line: s.line });
    byName[s.name] = s;
  }

  const kind = meta.kind ?? 'step';
  if (!STEP_KINDS.includes(kind)) throw new ParseError(`neznámý kind "${kind}" (povolené: ${STEP_KINDS.join(', ')})`, { id });
  if (fileKind === 'lab' && !['step', 'debug'].includes(kind)) throw new ParseError(`lab smí mít jen kind step nebo debug, ne "${kind}"`, { id });
  if (fileKind === 'project' && kind !== 'step') throw new ParseError(`projekt nemá kind (našel "${kind}")`, { id });

  const required = ['description', 'hints'];
  if (requireSeed) required.push('seed');
  if (requireSeed && kind !== 'parsons') required.push('solution');
  if (kind === 'parsons') required.push('parsons');
  for (const need of required) {
    if (!byName[need]) throw new ParseError(`chybí sekce --${need}--`, { id });
  }
  if (kind === 'parsons' && byName.solution) throw new ParseError('krok kind: parsons nesmí mít # --solution-- (řešení poskládá parser z # --parsons--)', { id, line: byName.solution.line });
  if (kind !== 'parsons' && byName.parsons) throw new ParseError('# --parsons-- patří jen do kroku s kind: parsons', { id, line: byName.parsons.line });

  const runtime = meta.runtime ?? defaultRuntime;
  if (!RUNTIMES.includes(runtime)) throw new ParseError(`neznámý runtime "${runtime}"`, { id });
  const ownLibs = parseLibs(meta.libs, { id, line: 1, where: 'frontmatteru libs' });
  if (ownLibs.length && !LIB_RUNTIMES.includes(runtime)) {
    throw new ParseError(`libs umí jen runtime ${LIB_RUNTIMES.join(', ')}, ne ${runtime}`, { id, line: 1 });
  }
  // Knihovny modulu platí jen pro kroky, jejichž runtime je umí (krok js v modulu dom je nedostane).
  const moduleLibs = LIB_RUNTIMES.includes(runtime) ? parseLibs(defaultLibs, { id, where: 'module.json libs' }) : [];
  const libs = [...new Set([...moduleLibs, ...ownLibs])];

  const description = joinText(byName.description.rows);
  if (!description) throw new ParseError('prázdný popis', { id });
  if (kind === 'debug') checkDebugDescription(byName.description.rows, id);

  const hints = parseHints(byName.hints, id);
  if (hints.length === 0) throw new ParseError('krok nemá žádný test', { id });
  const help = byName.help ? parseHelp(byName.help, { id, hintCount: hints.length }) : [];

  const seed = byName.seed ? parseFiles(byName.seed.rows, { id, level: 2, where: 'sekci --seed--', line: byName.seed.line, allowRegion: true }) : [];
  if (requireSeed && seed.length === 0) throw new ParseError('seed nemá žádný soubor', { id });

  const nextKey = createKeyAllocator();
  const explain = byName.explain ? parseExplainRows(byName.explain.rows, { id, line: byName.explain.line, nextKey }) : null;
  const review = byName.review ? parseReview(byName.review, { id, nextKey }) : null;

  let parsons = null;
  let solution = [];
  if (kind === 'parsons') {
    const withRegion = seed.filter((f) => f.region);
    if (withRegion.length !== 1) {
      throw new ParseError(`seed kroku parsons musí mít právě jeden soubor s oblastí --edit-- (má ${withRegion.length})`, { id });
    }
    const [target] = withRegion;
    if (target.region.end !== target.region.start - 1) {
      throw new ParseError(`oblast --edit-- v souboru ${target.name} musí být u parsons prázdná`, { id });
    }
    parsons = { file: target.name, ...parseParsonsSection(byName.parsons, { id }) };
    const content = assembleParsons(target, parsons.lines, parsons);
    solution = mergeFiles(seed, [{ name: target.name, lang: target.lang, content }]);
  } else if (byName.solution) {
    const changed = parseFiles(byName.solution.rows, { id, level: 2, where: 'sekci --solution--', line: byName.solution.line, allowRegion: false });
    solution = mergeFiles(seed, changed);
  }

  const approaches = byName.approaches ? parseApproaches(byName.approaches, { id, seed }) : [];
  if (meta.see !== undefined && typeof meta.see !== 'string') throw new ParseError('frontmatter see musí být text s referencemi', { id });
  const see = meta.see ? parseRefList(meta.see.split(','), { id, line: 1, where: 'frontmatteru see' }) : [];

  return {
    id,
    title: meta.title ?? defaultTitle,
    runtime,
    kind,
    description,
    hints,
    help,
    seed,
    solution,
    explain,
    parsons,
    approaches,
    review,
    see,
    // Jen když krok nějaké knihovny má — výstup kroků bez knihoven se nemění.
    ...(libs.length ? { libs } : {}),
    meta,
  };
}

// ===========================================================================
// 5. Kvíz (kap. 4.3)
// ===========================================================================

/** @returns {{ id, pass: number, questions: (Question & { code: number|null })[], codeSets: { title, files }[] }} */
export function parseQuiz(src, { id } = {}) {
  const { meta, rows } = readRows(src, id);
  const nextKey = createKeyAllocator();
  const { preamble, sections } = splitSections(rows, 1);
  const questions = [];
  const codeSets = [];

  if (sections.length === 0) {
    // Starý formát: celý soubor je řada otázek.
    for (const q of parseQuestionList(rows, { id, nextKey })) questions.push({ ...q, code: null });
  } else {
    if (joinText(preamble)) throw new ParseError('text před první sekcí "# --questions--" nebo "# --code--"', { id, line: firstTextLine(preamble) });
    for (const s of sections) {
      if (s.name === 'questions') {
        if (s.arg) throw new ParseError('# --questions-- nemá argument', { id, line: s.line });
        for (const q of parseQuestionList(s.rows, { id, nextKey })) questions.push({ ...q, code: null });
      } else if (s.name === 'code') {
        if (!s.arg) throw new ParseError('# --code-- potřebuje titulek', { id, line: s.line });
        const parts = splitSections(s.rows, 2);
        if (joinText(parts.preamble)) throw new ParseError(`v # --code-- ${s.arg} je text mimo ## --file-- a ## --question--`, { id, line: firstTextLine(parts.preamble) });
        const files = [];
        let setQuestions = 0;
        for (const part of parts.sections) {
          if (part.name === 'file') {
            if (setQuestions) throw new ParseError('## --file-- v sadě # --code-- musí být před první otázkou', { id, line: part.line });
            files.push(parseFileSection(part, { id, allowRegion: false }));
          } else if (part.name === 'question') {
            if (!files.length) throw new ParseError(`sada # --code-- ${s.arg} nemá před otázkami žádný ## --file--`, { id, line: part.line });
            questions.push({ ...withKey(parseQuestionRows(part.rows, { id, line: part.line }), nextKey), code: codeSets.length });
            setQuestions++;
          } else {
            throw new ParseError(`v # --code-- smí být jen ## --file-- a ## --question--, našel --${part.name}--`, { id, line: part.line });
          }
        }
        if (!files.length) throw new ParseError(`sada # --code-- ${s.arg} nemá žádný soubor`, { id, line: s.line });
        if (files.length > 3) throw new ParseError(`sada # --code-- ${s.arg} má ${files.length} souborů (nejvýš 3)`, { id, line: s.line });
        if (!setQuestions) throw new ParseError(`sada # --code-- ${s.arg} nemá žádnou otázku`, { id, line: s.line });
        codeSets.push({ title: s.arg.trim(), files });
      } else {
        throw new ParseError(`v kvízu smí být jen # --questions-- a # --code--, našel --${s.name}--`, { id, line: s.line });
      }
    }
  }

  if (questions.length === 0) throw new ParseError('kvíz nemá žádnou otázku', { id });
  const pass = meta.pass ?? 0.8;
  if (typeof pass !== 'number' || pass <= 0 || pass > 1) throw new ParseError('pass musí být číslo v (0, 1]', { id });
  return { id, pass, questions, codeSets };
}

// ===========================================================================
// 6. Lekce (kap. 5)
// ===========================================================================

const LIVE_NAMES = { html: 'index.html', css: 'styles.css', js: 'script.js', javascript: 'script.js' };
/** :::live react: komponenta s výchozím exportem se vykreslí do #root sama (kap. 6.11). */
const REACT_LIVE_NAMES = { jsx: 'App.jsx', tsx: 'App.tsx', css: 'styles.css' };
const LESSON_BLOCKS = ['live', 'check', 'explain', 'memory', 'compare'];

/** Bloky kódu html/css/js (u react jsx/tsx/css) jako soubory (každý jazyk nejvýš jednou). */
function liveFiles(blocks, { id, line, where, runtime = 'dom' }) {
  const files = [];
  const names = runtime === 'react' ? REACT_LIVE_NAMES : LIVE_NAMES;
  for (const b of blocks) {
    const name = names[b.lang];
    if (!name) throw new ParseError(`${where} umí jen bloky ${runtime === 'react' ? 'jsx (nebo tsx) a css' : 'html, css a js'}, ne "${b.lang || 'bez jazyka'}"`, { id, line: b.line });
    if (runtime === 'react' && /\.[jt]sx$/.test(name) && files.some((f) => /\.[jt]sx$/.test(f.name))) {
      throw new ParseError(`${where} má dva bloky komponenty (jsx a tsx) — patří tam jen jeden`, { id, line: b.line });
    }
    if (files.some((f) => f.name === name)) throw new ParseError(`${where} má dva bloky stejného jazyka (${b.lang})`, { id, line: b.line });
    files.push({ name, lang: langOf(name), content: b.content });
  }
  return files;
}

/** Hodnoty v závorkách ovládacího prvku: holé nebo v uvozovkách, oddělené čárkou. */
function splitControlValues(text, fail) {
  const values = [];
  let rest = text.trim();
  if (!rest) return values;
  while (true) {
    let m = rest.match(/^"([^"]*)"\s*/);
    if (!m) m = rest.match(/^([^,()"]+?)\s*(?=,|$)/);
    if (!m) fail(`neplatná hodnota v "${text}"`);
    values.push(m[1].trim());
    rest = rest.slice(m[0].length);
    if (!rest) break;
    if (!rest.startsWith(',')) fail(`čekám čárku mezi hodnotami v "${text}"`);
    rest = rest.slice(1).trim();
  }
  return values;
}

/** Jeden řádek bloku ```controls (kap. 5.2). */
function parseControlLine(raw, fail) {
  const head = raw.match(/^(--[a-z][a-z0-9-]*)\s*:\s*(select|range|toggle)\s*\(/);
  if (!head) fail(`řádek "${raw}" nemá tvar "--jméno: select(…)|range(…)|toggle(…)"`);
  const [, name, type] = head;
  // Najdi zavírací závorku mimo uvozovky.
  let i = head[0].length;
  let quoted = false;
  for (; i < raw.length; i++) {
    if (raw[i] === '"') quoted = !quoted;
    else if (raw[i] === ')' && !quoted) break;
  }
  if (i >= raw.length) fail(`řádek "${raw}": chybí zavírací závorka`);
  const values = splitControlValues(raw.slice(head[0].length, i), fail);
  const tail = raw.slice(i + 1).match(/^\s*(?:=\s*("[^"]*"|[^|]*?))?\s*(?:\|\s*(.*?))?\s*$/);
  if (!tail) fail(`řádek "${raw}": za závorkou čekám "= výchozí" nebo "| Popisek"`);
  const rawDefault = tail[1] === undefined || tail[1] === '' ? null : tail[1].replace(/^"(.*)"$/, '$1');
  const label = tail[2] ? tail[2] : name.slice(2);

  if (type === 'range') {
    if (values.length < 3 || values.length > 4) fail(`${name}: range(min, max, krok[, jednotka]) potřebuje 3 nebo 4 hodnoty`);
    const [min, max, step] = values.slice(0, 3).map((v) => {
      if (!/^-?\d+(\.\d+)?$/.test(v)) fail(`${name}: "${v}" není číslo`);
      return Number(v);
    });
    const unit = values[3] ?? '';
    if (unit && !/^[a-z%]+$/i.test(unit)) fail(`${name}: neplatná jednotka "${unit}"`);
    if (!(min < max)) fail(`${name}: min musí být menší než max`);
    if (!(step > 0)) fail(`${name}: krok musí být kladný`);
    let value = min;
    if (rawDefault !== null) {
      if (!/^-?\d+(\.\d+)?$/.test(rawDefault.trim())) fail(`${name}: výchozí hodnota "${rawDefault}" není číslo`);
      value = Number(rawDefault.trim());
      if (value < min || value > max) fail(`${name}: výchozí hodnota ${value} je mimo rozsah ${min}–${max}`);
    }
    return { name, type, label, min, max, step, unit, default: value };
  }

  if (type === 'select' && values.length < 2) fail(`${name}: select potřebuje aspoň 2 hodnoty`);
  if (type === 'toggle' && values.length !== 2) fail(`${name}: toggle potřebuje přesně 2 hodnoty`);
  const value = rawDefault === null ? values[0] : rawDefault.trim();
  if (!values.includes(value)) fail(`${name}: výchozí hodnota "${value}" není mezi hodnotami`);
  return { name, type, label, options: values, default: value };
}

function parseControls(content, { id, line }) {
  const fail = (message) => { throw new ParseError(`controls: ${message}`, { id, line }); };
  const controls = [];
  for (const raw of content.split('\n')) {
    if (!raw.trim()) continue;
    const control = parseControlLine(raw.trim(), fail);
    if (controls.some((c) => c.name === control.name)) fail(`${control.name} je v bloku dvakrát`);
    controls.push(control);
  }
  if (!controls.length) fail('prázdný blok');
  return controls;
}

/** Hodnota ovládacího prvku jako text do CSS: range → `${n}${unit}`, jinak zvolená možnost. */
export function controlValue(control, value = control.default) {
  return control.type === 'range' ? `${value}${control.unit ?? ''}` : String(value);
}

/**
 * Soubory ukázky s výchozími hodnotami ovládacích prvků: na začátek `styles.css` se předřadí
 * `:root { --jméno: výchozí; … }` (soubor vznikne, když chybí). Pro verify a první vykreslení.
 */
export function applyControlDefaults(files, controls) {
  if (!controls?.length) return files;
  const root = `:root { ${controls.map((c) => `${c.name}: ${controlValue(c)};`).join(' ')} }`;
  const css = files.find((f) => f.name === 'styles.css');
  if (!css) return [...files, { name: 'styles.css', lang: 'css', content: root }];
  return files.map((f) => (f === css ? { ...f, content: `${root}\n${f.content}` } : f));
}

/** Značky předpovědi `--x-- obsah` (kap. 5.3): řádky před první značkou jsou bloky souborů. */
function splitPredictMarkers(rows) {
  const markers = [];
  const fileRows = [];
  for (const row of rows) {
    const m = row.kind === 'text' ? row.text.match(/^--(question|expected|accept|why|option\*?|output|see)--(?:\s(.*))?$/) : null;
    if (m) {
      markers.push({ name: m[1], line: row.line, rows: m[2]?.trim() ? [{ kind: 'text', text: m[2], line: row.line }] : [] });
      continue;
    }
    if (markers.length) markers.at(-1).rows.push(row);
    else fileRows.push(row);
  }
  return { fileRows, markers };
}

function parsePredict(markers, { id, line, runtime, nextKey }) {
  const single = {};
  const options = [];
  for (const m of markers) {
    if (m.name === 'option' || m.name === 'option*') {
      const text = joinText(m.rows);
      if (!text) throw new ParseError('prázdná --option--', { id, line: m.line });
      options.push({ text, correct: m.name === 'option*', why: '' });
      continue;
    }
    if (single[m.name]) throw new ParseError(`značka --${m.name}-- je v předpovědi dvakrát`, { id, line: m.line });
    single[m.name] = m;
    // Blok souboru (html/css/js/controls) za první značkou nepatří do obsahu hodnot.
    if (['expected', 'accept', 'output', 'see'].includes(m.name)) {
      const fileBlock = fences(m.rows).find((b) => LIVE_NAMES[b.lang] || REACT_LIVE_NAMES[b.lang] || b.lang === 'controls');
      if (fileBlock) throw new ParseError(`blok souboru (${fileBlock.lang}) za první značkou předpovědi — soubory patří před --question--`, { id, line: fileBlock.line });
    }
  }
  if (!single.question) throw new ParseError('předpověď nemá --question--', { id, line });
  const text = joinText(single.question.rows);
  if (!text) throw new ParseError('--question-- je prázdná', { id, line: single.question.line });
  const why = single.why ? joinText(single.why.rows) : '';
  const see = single.see ? parseRefList(single.see.rows.filter((r) => r.kind === 'text').map((r) => r.text), { id, line: single.see.line, where: '--see--' }) : [];

  let output = null;
  if (single.output) {
    if (runtime !== 'node') throw new ParseError('--output-- patří jen do :::live node predict', { id, line: single.output.line });
    output = expectedContent(single.output.rows, { id, line: single.output.line, where: '--output--' });
  } else if (runtime === 'node') {
    throw new ParseError(':::live node predict potřebuje --output-- (skutečný výstup)', { id, line });
  }

  let question;
  if (options.length) {
    if (single.expected || single.accept) throw new ParseError('předpověď kombinuje --option-- a --expected--', { id, line });
    if (options.length < 2) throw new ParseError('předpověď s výběrem potřebuje aspoň 2 --option--', { id, line });
    if (!options.some((o) => o.correct)) throw new ParseError('předpověď nemá správnou možnost (--option*--)', { id, line });
    // `why` předpovědi s výběrem vysvětluje celou otázku, ne jednu možnost.
    question = { type: 'choice', text, multiple: options.filter((o) => o.correct).length > 1, answers: options, why, see };
  } else {
    if (runtime === 'dom' || runtime === 'vue' || runtime === 'react') {
      throw new ParseError(`předpověď ${runtime} umí jen otázku s výběrem (--option--), ne --expected--`, { id, line });
    }
    if (!single.expected && !output) throw new ParseError('předpověď nemá --expected-- ani --option--', { id, line });
    const expected = single.expected ? expectedContent(single.expected.rows, { id, line: single.expected.line, where: '--expected--' }) : output;
    const accept = single.accept ? acceptContent(single.accept.rows, { id, line: single.accept.line, where: '--accept--' }) : [];
    question = { type: 'text', text, expected, accept, ignoreCase: false, why, see };
  }
  return { question: withKey(question, nextKey), output };
}

function parseLiveBlock(block, { id, nextKey }) {
  const tokens = (block.arg ?? '').split(/\s+/).filter(Boolean);
  let runtime = 'dom';
  let predict = false;
  let libs = [];
  let libsSeen = false;
  tokens.forEach((token, i) => {
    if (token === 'predict' && i === tokens.length - 1) predict = true;
    else if (RUNTIMES.includes(token) && i === 0) runtime = token;
    else if (/^libs=/.test(token) && !libsSeen) {
      libsSeen = true;
      libs = parseLibs(token.slice('libs='.length), { id, line: block.line, where: ':::live libs=' });
      if (libs.length === 0) throw new ParseError(':::live libs= bez knihoven', { id, line: block.line });
    } else throw new ParseError(`neznámý argument "${token}" u :::live (čekám :::live [dom|js|vue|react|node] [libs=tailwind,gsap] [predict])`, { id, line: block.line });
  });
  if (runtime === 'node' && !predict) throw new ParseError(':::live node je povolené jen s predict', { id, line: block.line });
  if (libs.length && !LIB_RUNTIMES.includes(runtime)) {
    throw new ParseError(`libs umí jen runtime ${LIB_RUNTIMES.join(', ')}, ne ${runtime}`, { id, line: block.line });
  }

  const { fileRows, markers } = predict ? splitPredictMarkers(block.rows) : { fileRows: block.rows, markers: [] };
  const stray = proseRows(fileRows)[0];
  if (stray) {
    throw new ParseError(predict
      ? `text před první značkou předpovědi: "${stray.text.trim()}"`
      : `v :::live je text mimo bloky kódu: "${stray.text.trim()}"`, { id, line: stray.line });
  }
  const blocks = fences(fileRows);
  const controlBlocks = blocks.filter((b) => b.lang === 'controls');
  if (controlBlocks.length > 1) throw new ParseError(':::live smí mít nejvýš jeden blok controls', { id, line: controlBlocks[1].line });
  let controls = [];
  if (controlBlocks.length) {
    if (predict) throw new ParseError('controls nejdou kombinovat s predict', { id, line: controlBlocks[0].line });
    if (runtime !== 'dom' && runtime !== 'vue') throw new ParseError(`controls umí jen runtime dom a vue, ne ${runtime}`, { id, line: controlBlocks[0].line });
    controls = parseControls(controlBlocks[0].content, { id, line: controlBlocks[0].line });
  }
  const fileBlocks = blocks.filter((b) => b.lang !== 'controls');
  let files;
  if (runtime === 'node') {
    if (fileBlocks.length !== 1 || !['js', 'javascript'].includes(fileBlocks[0].lang)) {
      throw new ParseError(':::live node predict má přesně jeden blok js', { id, line: block.line });
    }
    files = [{ name: 'index.js', lang: 'js', content: fileBlocks[0].content }];
  } else {
    files = liveFiles(fileBlocks, { id, line: block.line, where: ':::live', runtime });
  }
  if (files.length === 0) throw new ParseError(':::live bez kódu', { id, line: block.line });
  // Jen když ukázka nějaké knihovny má — výstup ostatních ukázek se nemění.
  const withLibs = libs.length ? { libs } : {};

  if (!predict) return { kind: 'live', runtime, files, controls, predict: null, output: null, ...withLibs };
  const { question, output } = parsePredict(markers, { id, line: block.line, runtime, nextKey });
  return { kind: 'live', runtime, files, controls, predict: question, output, ...withLibs };
}

function parseMemoryBlock(block, { id }) {
  if (block.arg) throw new ParseError(':::memory nemá argumenty', { id, line: block.line });
  const firstFence = block.rows.findIndex((r) => r.kind === 'fence-open');
  const before = firstFence === -1 ? block.rows : block.rows.slice(0, firstFence);
  if (firstFence === -1 || proseRows(before).length) throw new ParseError(':::memory musí začínat přesně jedním blokem kódu', { id, line: block.line });
  const closeIndex = block.rows.findIndex((r, i) => i > firstFence && r.kind === 'fence-close');
  const [code] = fences(block.rows.slice(firstFence, closeIndex + 1));
  const codeLines = code.content.split('\n').length;

  const steps = [];
  for (const row of block.rows.slice(closeIndex + 1)) {
    if (row.kind !== 'text') throw new ParseError(':::memory smí mít jen jeden blok kódu', { id, line: row.line });
    const text = row.text.trim();
    if (!text) continue;
    const stepHead = text.match(/^--step--\s+(\S+)(?:\s*\|\s*(.*))?$/);
    if (stepHead) {
      if (!/^\d+$/.test(stepHead[1])) throw new ParseError(`--step-- ${stepHead[1]}: číslo řádku musí být celé číslo`, { id, line: row.line });
      const lineNumber = Number(stepHead[1]);
      if (lineNumber < 1 || lineNumber > codeLines) throw new ParseError(`--step-- ${lineNumber}: kód má řádky 1–${codeLines}`, { id, line: row.line });
      steps.push({ line: lineNumber, label: stepHead[2]?.trim() ?? '', bindings: [], objects: [], sourceLine: row.line });
      continue;
    }
    const step = steps.at(-1);
    if (!step) throw new ParseError(`v :::memory je text před prvním --step--: "${text}"`, { id, line: row.line });
    let m = text.match(/^([A-Za-z_$][\w$]*)\s*->\s*@([a-z0-9-]+)$/);
    if (m) {
      step.bindings.push({ name: m[1], value: null, ref: m[2] });
      continue;
    }
    m = text.match(/^@([a-z0-9-]+)\s*:\s*(.*)$/);
    if (m) {
      if (step.objects.some((o) => o.id === m[1])) throw new ParseError(`objekt @${m[1]} je v kroku dvakrát`, { id, line: row.line });
      step.objects.push({ id: m[1], text: m[2].trim(), refs: [...new Set([...m[2].matchAll(/@([a-z0-9-]+)/g)].map((r) => r[1]))] });
      continue;
    }
    m = text.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+)$/);
    if (m) {
      step.bindings.push({ name: m[1], value: m[2].trim(), ref: null });
      continue;
    }
    throw new ParseError(`řádek "${text}" v :::memory není "jméno = hodnota", "jméno -> @id" ani "@id: text"`, { id, line: row.line });
  }
  if (!steps.length) throw new ParseError(':::memory nemá žádný --step--', { id, line: block.line });
  for (const step of steps) {
    const defined = new Set(step.objects.map((o) => o.id));
    const missing = [...step.bindings.map((b) => b.ref).filter(Boolean), ...step.objects.flatMap((o) => o.refs)].find((ref) => !defined.has(ref));
    if (missing) throw new ParseError(`krok --step-- ${step.line} odkazuje na @${missing}, který v kroku není definovaný`, { id, line: step.sourceLine });
    delete step.sourceLine;
  }
  return { kind: 'memory', code: { lang: code.lang, content: code.content }, steps };
}

function parseCompareBlock(block, { id }) {
  if (block.arg) throw new ParseError(':::compare nemá argumenty', { id, line: block.line });
  const groups = [{ label: null, rows: [], line: block.line }];
  for (const row of block.rows) {
    const m = row.kind === 'text' ? row.text.match(/^--variant--(?:\s+(.*))?$/) : null;
    if (m) {
      if (!m[1]?.trim()) throw new ParseError('--variant-- potřebuje popisek', { id, line: row.line });
      groups.push({ label: m[1].trim(), rows: [], line: row.line });
    } else {
      groups.at(-1).rows.push(row);
    }
  }
  for (const group of groups) {
    const stray = proseRows(group.rows)[0];
    if (stray) throw new ParseError(`v :::compare je text mimo bloky kódu: "${stray.text.trim()}"`, { id, line: stray.line });
  }
  const [common, ...variantGroups] = groups;
  if (variantGroups.length !== 2) throw new ParseError(`:::compare potřebuje přesně dvě --variant-- (má ${variantGroups.length})`, { id, line: block.line });
  const commonFiles = liveFiles(fences(common.rows), { id, line: block.line, where: ':::compare' });
  const variants = variantGroups.map((group) => {
    const own = liveFiles(fences(group.rows), { id, line: group.line, where: `varianta "${group.label}"` });
    if (!own.length) throw new ParseError(`varianta "${group.label}" nemá žádný blok html/css/js`, { id, line: group.line });
    const files = commonFiles.map((f) => ({ ...f }));
    for (const file of own) {
      const shared = files.find((f) => f.name === file.name);
      if (shared) shared.content = `${shared.content}\n${file.content}`;
      else files.push({ ...file });
    }
    return { label: group.label, files };
  });
  return { kind: 'compare', runtime: 'dom', variants };
}

/** @returns tvar z kontraktu kap. 5.9 */
export function parseLesson(src, { id } = {}) {
  const { rows } = readRows(src, id);
  // Klíče otázek (:::check a # --questions--) jsou jedna řada, body checklistu druhá
  // (id `explain:` je jiný jmenný prostor než `q:`), předpovědi třetí (nejdou do opakování).
  const keys = { question: createKeyAllocator(), explain: createKeyAllocator(), predict: createKeyAllocator() };

  const qIndex = rows.findIndex((r) => r.kind === 'text' && /^# --questions--\s*$/.test(r.text));
  const body = qIndex === -1 ? rows : rows.slice(0, qIndex);

  const blocks = [];
  let md = [];
  let open = null;
  const flushMd = () => {
    const text = joinText(md);
    if (text) blocks.push({ kind: 'md', text });
    md = [];
  };
  for (const row of body) {
    if (row.kind === 'text') {
      const opening = row.text.match(/^:::([a-z]+)(?:\s+(.*?))?\s*$/);
      if (opening) {
        if (open) throw new ParseError(`vnořený blok :::${opening[1]} uvnitř :::${open.name}`, { id, line: row.line });
        if (!LESSON_BLOCKS.includes(opening[1])) throw new ParseError(`neznámý blok :::${opening[1]}`, { id, line: row.line });
        flushMd();
        open = { name: opening[1], arg: opening[2] ?? null, line: row.line, rows: [] };
        continue;
      }
      if (row.text.trim() === ':::') {
        if (!open) throw new ParseError('zavírací ::: bez otevíracího bloku', { id, line: row.line });
        blocks.push(parseLessonBlock(open, { id, keys }));
        open = null;
        continue;
      }
      if (!open && /^# --[a-z-]+--/.test(row.text)) {
        throw new ParseError(`neznámá sekce ${row.text.trim()} (v lekci je povolená jen # --questions-- na konci)`, { id, line: row.line });
      }
    }
    (open ? open.rows : md).push(row);
  }
  if (open) throw new ParseError(`neuzavřený blok :::${open.name}`, { id, line: open.line });
  flushMd();
  if (blocks.length === 0) throw new ParseError('prázdná lekce', { id });

  const questions = qIndex === -1 ? [] : parseQuestionList(rows.slice(qIndex + 1), { id, nextKey: keys.question });
  const mdTexts = blocks.filter((b) => b.kind === 'md').map((b) => b.text);
  const title = mdTexts.flatMap((text) => extractHeadings(text)).find((heading) => heading.level === 1)?.text ?? '';
  return {
    id,
    title,
    headings: collectHeadings(mdTexts),
    blocks,
    questions,
  };
}

function parseLessonBlock(block, { id, keys }) {
  switch (block.name) {
    case 'live':
      return parseLiveBlock(block, { id, nextKey: keys.predict });
    case 'check': {
      if (block.arg !== null && block.arg !== 'pretest') {
        throw new ParseError(`neznámý argument "${block.arg}" u :::check (povolený je jen pretest)`, { id, line: block.line });
      }
      const question = parseQuestionRows(block.rows, { id, line: block.line });
      return { kind: 'check', pretest: block.arg === 'pretest', question: withKey(question, keys.question) };
    }
    case 'explain':
      if (block.arg) throw new ParseError(':::explain nemá argumenty', { id, line: block.line });
      return { kind: 'explain', ...parseExplainRows(block.rows, { id, line: block.line, nextKey: keys.explain }) };
    case 'memory':
      return parseMemoryBlock(block, { id });
    case 'compare':
      return parseCompareBlock(block, { id });
  }
  throw new ParseError(`neznámý blok :::${block.name}`, { id, line: block.line });
}

// ===========================================================================
// 7. Karty a pojmy sekce (kap. 2.5, 2.6)
// ===========================================================================

const CARD_SECTIONS = {
  output: { required: ['expected'], optional: ['accept', 'why', 'see'] },
  code: { required: ['seed', 'test', 'solution'], optional: ['why', 'see'] },
  css: { required: ['expected'], optional: ['accept', 'why', 'see'] },
  free: { required: ['back'], optional: ['see'] },
};

function singleJsBlock(section, { id, where }) {
  const blocks = fences(section.rows);
  if (blocks.length !== 1 || !['js', 'javascript'].includes(blocks[0].lang) || proseRows(section.rows).length) {
    throw new ParseError(`${where} musí obsahovat přesně jeden blok \`\`\`js`, { id, line: section.line });
  }
  return blocks[0].content;
}

/** @returns {{ id, cards: Card[] }} tvar z kontraktu kap. 2.5 */
export function parseCards(src, { id } = {}) {
  const { rows } = readRows(src, id);
  const nextKey = createKeyAllocator();
  const { preamble, sections } = splitSections(rows, 2);
  if (joinText(preamble)) throw new ParseError('text mimo "## --card-- typ"', { id, line: firstTextLine(preamble) });

  const cards = sections.map((s) => {
    if (s.name !== 'card') throw new ParseError(`očekával jsem ## --card--, našel --${s.name}--`, { id, line: s.line });
    const [type, runtime, ...extra] = (s.arg ?? '').split(/\s+/).filter(Boolean);
    const rule = CARD_SECTIONS[type];
    if (!rule) throw new ParseError(`neznámý typ karty "${s.arg ?? ''}" (povolené: output, code js, css, free)`, { id, line: s.line });
    if (type === 'code' && runtime !== 'js') throw new ParseError(`karta code umí jen runtime js ("## --card-- code js"), ne "${runtime ?? ''}"`, { id, line: s.line });
    if ((type !== 'code' && runtime) || extra.length) throw new ParseError(`nadbytečný argument u "## --card-- ${s.arg}"`, { id, line: s.line });

    const inner = splitSections(s.rows, 3);
    const text = joinText(inner.preamble);
    if (!text) throw new ParseError('karta nemá text', { id, line: s.line });
    const byName = indexSections(inner.sections, [...rule.required, ...rule.optional], id, `kartě ${type}`);
    for (const need of rule.required) {
      if (!byName[need]) throw new ParseError(`karta ${type} nemá ### --${need}--`, { id, line: s.line });
    }
    const why = byName.why ? joinText(byName.why.rows) : '';
    const see = byName.see ? parseRefList(byName.see.rows.filter((r) => r.kind === 'text').map((r) => r.text), { id, line: byName.see.line, where: '--see--' }) : [];
    const key = nextKey(text);

    if (type === 'code') {
      const seedSource = singleJsBlock(byName.seed, { id, where: '### --seed--' });
      const { content, region } = extractRegion(seedSource, { id, name: 'script.js' });
      return {
        key, type, runtime: 'js', text,
        seed: [{ name: 'script.js', lang: 'js', content, region }],
        hints: [{ text, test: singleJsBlock(byName.test, { id, where: '### --test--' }) }],
        solution: [{ name: 'script.js', lang: 'js', content: singleJsBlock(byName.solution, { id, where: '### --solution--' }) }],
        why, see,
      };
    }
    if (type === 'free') {
      const back = joinText(byName.back.rows);
      if (!back) throw new ParseError('### --back-- je prázdné', { id, line: byName.back.line });
      return { key, type, text, back, see };
    }
    return {
      key, type, text,
      expected: expectedContent(byName.expected.rows, { id, line: byName.expected.line, where: '--expected--' }),
      accept: byName.accept ? acceptContent(byName.accept.rows, { id, line: byName.accept.line, where: '--accept--' }) : [],
      ignoreCase: parseIgnoreCase(byName.expected.arg, { id, line: byName.expected.line }),
      why, see,
    };
  });
  if (!cards.length) throw new ParseError('soubor karet nemá žádnou kartu', { id });
  return { id, cards };
}

const TERM_KEYS = ['en', 'aliases', 'mdn', 'lekce'];

/** @returns {{ id, terms: Term[] }} tvar z kontraktu kap. 2.6 */
export function parseTerms(src, { id } = {}) {
  const { rows } = readRows(src, id);
  const { preamble, sections } = splitSections(rows, 2);
  if (joinText(preamble)) throw new ParseError('text mimo "## --term-- pojem"', { id, line: firstTextLine(preamble) });

  const terms = sections.map((s) => {
    if (s.name !== 'term') throw new ParseError(`očekával jsem ## --term--, našel --${s.name}--`, { id, line: s.line });
    const term = s.arg?.trim();
    if (!term) throw new ParseError('## --term-- potřebuje pojem', { id, line: s.line });

    const values = {};
    let index = 0;
    while (index < s.rows.length && s.rows[index].kind === 'text' && !s.rows[index].text.trim()) index++;
    for (; index < s.rows.length; index++) {
      const row = s.rows[index];
      const m = row.kind === 'text' ? row.text.match(/^([a-z]+):\s+(.*)$/) : null;
      if (!m) break;
      if (!TERM_KEYS.includes(m[1])) throw new ParseError(`neznámý klíč "${m[1]}" u pojmu "${term}" (povolené: ${TERM_KEYS.join(', ')})`, { id, line: row.line });
      if (values[m[1]] !== undefined) throw new ParseError(`klíč "${m[1]}" je u pojmu "${term}" dvakrát`, { id, line: row.line });
      values[m[1]] = m[2].trim();
    }
    const definition = joinText(s.rows.slice(index));
    if (!values.lekce) throw new ParseError(`pojem "${term}" nemá lekce:`, { id, line: s.line });
    if (!parseRef(values.lekce)) throw new ParseError(`pojem "${term}": neplatná reference lekce "${values.lekce}"`, { id, line: s.line });
    if (values.mdn !== undefined && !values.mdn.startsWith('https://developer.mozilla.org/')) {
      throw new ParseError(`pojem "${term}": mdn musí vést na https://developer.mozilla.org/`, { id, line: s.line });
    }
    if (!definition) throw new ParseError(`pojem "${term}" nemá definici`, { id, line: s.line });
    return {
      id: headingAnchor(term),
      term,
      en: values.en ?? null,
      aliases: values.aliases ? values.aliases.split(',').map((a) => a.trim()).filter(Boolean) : [],
      mdn: values.mdn ?? null,
      lesson: values.lekce,
      definition,
      sectionId: id,
    };
  });
  if (!terms.length) throw new ParseError('soubor pojmů nemá žádný pojem', { id });
  return { id, terms };
}
