// Parser obsahových souborů Akademie: kroky (workshop/lab/projekt), kvízy a lekce.
// Formát je popsaný v docs/kontrakt.md. Parser nesahá na disk — dostane text, vrátí data.

export class ParseError extends Error {
  constructor(message, { id, line } = {}) {
    super(`${id ?? '?'}${line ? `:${line}` : ''} — ${message}`);
    this.name = 'ParseError';
    this.id = id;
    this.line = line;
  }
}

export const RUNTIMES = ['dom', 'js', 'vue', 'node'];

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})\s*([^`\s]*)?.*$/;
const EDIT_MARKER = '--edit--';

/** Rozdělí text na řádky a odloupne frontmatter (jednoduché `klíč: hodnota`). */
function splitFrontmatter(src, id) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
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
 * Projde řádky a vrátí je obohacené o informaci, jestli leží uvnitř bloku kódu.
 * Nadpisy a značky se hledají jen mimo bloky kódu.
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

/** Rozseká anotované řádky podle nadpisů `#… --jmeno-- [argument]` dané úrovně. */
function splitSections(rows, level, id) {
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

function parseFiles(section, id, { allowRegion }) {
  const { preamble, sections } = splitSections(section.rows, 2, id);
  if (joinText(preamble)) {
    throw new ParseError(`v sekci --${section.name}-- je text mimo "## --file-- jméno"`, { id, line: section.line });
  }
  return sections.map((s) => {
    if (s.name !== 'file' || !s.arg) {
      throw new ParseError(`očekával jsem "## --file-- jméno", našel "--${s.name}--"`, { id, line: s.line });
    }
    const blocks = fences(s.rows);
    if (blocks.length !== 1) {
      throw new ParseError(`soubor ${s.arg} musí mít přesně jeden blok kódu (má ${blocks.length})`, { id, line: s.line });
    }
    const name = s.arg.trim();
    const base = { name, lang: langOf(name) };
    if (!allowRegion) return { ...base, content: blocks[0].content };
    const { content, region } = extractRegion(blocks[0].content, { id, name });
    return { ...base, content, region };
  });
}

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

/** Sloučí seed a řešení: řešení přepisuje soubory se stejným jménem, zbytek zůstává ze seedu. */
export function mergeFiles(seed, solution) {
  const byName = new Map(seed.map((f) => [f.name, { name: f.name, lang: f.lang, content: f.content }]));
  for (const f of solution) byName.set(f.name, { name: f.name, lang: f.lang, content: f.content });
  return [...byName.values()];
}

/**
 * Krok workshopu, lab nebo projekt.
 * @returns {{ id, title, runtime, description, hints: {text,test}[], seed: File[], solution: File[] }}
 */
export function parseStep(src, { id, defaultRuntime = 'dom', defaultTitle = '', requireSeed = true } = {}) {
  const { meta, lines, offset } = splitFrontmatter(src, id);
  const rows = annotate(lines, offset);
  if (rows.unclosedFence) throw new ParseError('neuzavřený blok kódu', { id });
  const { preamble, sections } = splitSections(rows, 1, id);
  if (joinText(preamble)) throw new ParseError('text před první sekcí "# --description--"', { id, line: preamble.find((r) => r.text.trim())?.line });

  const known = ['description', 'hints', 'seed', 'solution'];
  const byName = {};
  for (const s of sections) {
    if (!known.includes(s.name)) throw new ParseError(`neznámá sekce --${s.name}--`, { id, line: s.line });
    if (byName[s.name]) throw new ParseError(`sekce --${s.name}-- je tam dvakrát`, { id, line: s.line });
    byName[s.name] = s;
  }
  for (const need of requireSeed ? known : ['description', 'hints']) {
    if (!byName[need]) throw new ParseError(`chybí sekce --${need}--`, { id });
  }

  const runtime = meta.runtime ?? defaultRuntime;
  if (!RUNTIMES.includes(runtime)) throw new ParseError(`neznámý runtime "${runtime}"`, { id });

  const description = joinText(byName.description.rows);
  if (!description) throw new ParseError('prázdný popis', { id });
  const hints = parseHints(byName.hints, id);
  if (hints.length === 0) throw new ParseError('krok nemá žádný test', { id });

  const seed = byName.seed ? parseFiles(byName.seed, id, { allowRegion: true }) : [];
  const solutionOnly = byName.solution ? parseFiles(byName.solution, id, { allowRegion: false }) : [];
  if (requireSeed && seed.length === 0) throw new ParseError('seed nemá žádný soubor', { id });

  return {
    id,
    title: meta.title ?? defaultTitle,
    runtime,
    description,
    hints,
    seed,
    solution: mergeFiles(seed, solutionOnly),
    meta,
  };
}

function parseQuestions(rows, id) {
  const { preamble, sections } = splitSections(rows, 2, id);
  if (joinText(preamble)) throw new ParseError('text mimo "## --question--"', { id, line: preamble.find((r) => r.text.trim())?.line });
  return sections.map((q) => {
    if (q.name !== 'question') throw new ParseError(`očekával jsem --question--, našel --${q.name}--`, { id, line: q.line });
    const inner = splitSections(q.rows, 3, id);
    const text = joinText(inner.preamble);
    if (!text) throw new ParseError('otázka nemá text', { id, line: q.line });
    const answers = inner.sections.map((a) => {
      if (a.name !== 'answer' && a.name !== 'correct') {
        throw new ParseError(`očekával jsem --answer-- nebo --correct--, našel --${a.name}--`, { id, line: a.line });
      }
      const parts = splitSections(a.rows, 4, id);
      const why = parts.sections.find((s) => s.name === 'why');
      const bad = parts.sections.find((s) => s.name !== 'why');
      if (bad) throw new ParseError(`neznámá sekce --${bad.name}-- v odpovědi`, { id, line: bad.line });
      const answerText = joinText(parts.preamble);
      if (!answerText) throw new ParseError('prázdná odpověď', { id, line: a.line });
      return { text: answerText, correct: a.name === 'correct', why: why ? joinText(why.rows) : '' };
    });
    if (answers.length < 2) throw new ParseError('otázka potřebuje aspoň 2 odpovědi', { id, line: q.line });
    if (!answers.some((a) => a.correct)) throw new ParseError('otázka nemá žádnou --correct-- odpověď', { id, line: q.line });
    return { text, multiple: answers.filter((a) => a.correct).length > 1, answers };
  });
}

/** @returns {{ id, pass: number, questions: Question[] }} */
export function parseQuiz(src, { id } = {}) {
  const { meta, lines, offset } = splitFrontmatter(src, id);
  const rows = annotate(lines, offset);
  if (rows.unclosedFence) throw new ParseError('neuzavřený blok kódu', { id });
  const questions = parseQuestions(rows, id);
  if (questions.length === 0) throw new ParseError('kvíz nemá žádnou otázku', { id });
  const pass = meta.pass ?? 0.8;
  if (typeof pass !== 'number' || pass <= 0 || pass > 1) throw new ParseError('pass musí být číslo v (0, 1]', { id });
  return { id, pass, questions };
}

const LIVE_NAMES = { html: 'index.html', css: 'styles.css', js: 'script.js', javascript: 'script.js' };

/** @returns {{ id, blocks: ({kind:'md',text}|{kind:'live',runtime,files})[], questions: Question[] }} */
export function parseLesson(src, { id } = {}) {
  const { lines, offset } = splitFrontmatter(src, id);
  const rows = annotate(lines, offset);
  if (rows.unclosedFence) throw new ParseError('neuzavřený blok kódu', { id });

  const qIndex = rows.findIndex((r) => r.kind === 'text' && /^# --questions--\s*$/.test(r.text));
  const body = qIndex === -1 ? rows : rows.slice(0, qIndex);
  const questions = qIndex === -1 ? [] : parseQuestions(rows.slice(qIndex + 1), id);

  const blocks = [];
  let md = [];
  let live = null;
  const flushMd = () => {
    const text = joinText(md);
    if (text) blocks.push({ kind: 'md', text });
    md = [];
  };
  for (const row of body) {
    const open = row.kind === 'text' && row.text.match(/^:::live(?:\s+([a-z]+))?\s*$/);
    if (open) {
      if (live) throw new ParseError('vnořený :::live', { id, line: row.line });
      flushMd();
      live = { line: row.line, runtime: open[1] ?? 'dom', rows: [] };
      if (!RUNTIMES.includes(live.runtime) || live.runtime === 'node') {
        throw new ParseError(`:::live nepodporuje runtime "${live.runtime}"`, { id, line: row.line });
      }
      continue;
    }
    if (live && row.kind === 'text' && row.text.trim() === ':::') {
      const files = fences(live.rows).map((f) => {
        const name = LIVE_NAMES[f.lang];
        if (!name) throw new ParseError(`:::live umí jen html/css/js, ne "${f.lang}"`, { id, line: f.line });
        return { name, lang: langOf(name), content: f.content };
      });
      if (files.length === 0) throw new ParseError(':::live bez kódu', { id, line: live.line });
      if (new Set(files.map((f) => f.name)).size !== files.length) {
        throw new ParseError(':::live má dva bloky stejného jazyka', { id, line: live.line });
      }
      blocks.push({ kind: 'live', runtime: live.runtime, files });
      live = null;
      continue;
    }
    (live ? live.rows : md).push(row);
  }
  if (live) throw new ParseError('neuzavřený :::live', { id, line: live.line });
  flushMd();
  if (blocks.length === 0) throw new ParseError('prázdná lekce', { id });
  return { id, blocks, questions };
}
