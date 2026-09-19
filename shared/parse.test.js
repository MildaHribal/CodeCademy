import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { hashKey } from './answers.js';
import {
  applyControlDefaults, assembleParsons, extractRegion, ParseError, parseCards, parseLesson, parseQuiz, parseStep, parseTerms,
} from './parse.js';

const FENCE = '```';
const code = (lang, body) => `${FENCE}${lang}\n${body}\n${FENCE}`;

function throwsParse(fn, pattern) {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof ParseError, `čekám ParseError, přišlo ${error?.name}: ${error?.message}`);
    assert.match(error.message, pattern);
    return true;
  });
}

const STEP = `---
title: Flex kontejner
runtime: dom
see: css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky
---

# --description--

Markdown. Co přesně má uživatel udělat.

# --hints--

Text první nápovědy (markdown).

${code('js', "assert.equal(getComputedStyle(document.querySelector('nav')).display, 'flex', 'nav má mít display: flex');")}

Text druhé nápovědy.

${code('js', "assert.match(files['styles.css'], /nav\\s*\\{/, 'styles.css má obsahovat pravidlo pro nav');")}

# --help--

## --tip--

Jde o flex kontejner — přečti si [Flex kontejner a flex položky](see:css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky).

## --tip-- 2

Vlastnost \`display\` patří do pravidla pro prvek, který obaluje odkazy.

# --seed--

## --file-- index.html

${code('html', '<nav>…</nav>')}

## --file-- styles.css

${code('css', 'body { margin: 0; }\n--edit--\n\n--edit--')}

# --solution--

## --file-- styles.css

${code('css', 'body { margin: 0; }\nnav { display: flex; }')}
`;

function step({ front = '', description = 'Popis.', extra = '', seed = code('js', '--edit--\n--edit--'), solution = code('js', 'const a = 1;'), hints } = {}) {
  const parts = [];
  if (front) parts.push(`---\n${front}\n---\n`);
  parts.push(`# --description--\n\n${description}\n`);
  parts.push(`# --hints--\n\n${hints ?? `Požadavek.\n\n${code('js', "assert.ok(true, 'ok');")}`}\n`);
  if (seed !== null) parts.push(`# --seed--\n\n## --file-- script.js\n\n${seed}\n`);
  if (solution !== null) parts.push(`# --solution--\n\n## --file-- script.js\n\n${solution}\n`);
  if (extra) parts.push(extra);
  return parts.join('\n');
}

describe('parseStep: krok workshopu', () => {
  test('příklad z kontraktu kap. 3.1 → přesný výstup', () => {
    const s = parseStep(STEP, { id: 'css-flexbox/workshop-navigace/003' });
    assert.deepEqual(s, {
      id: 'css-flexbox/workshop-navigace/003',
      title: 'Flex kontejner',
      runtime: 'dom',
      kind: 'step',
      description: 'Markdown. Co přesně má uživatel udělat.',
      hints: [
        { text: 'Text první nápovědy (markdown).', test: "assert.equal(getComputedStyle(document.querySelector('nav')).display, 'flex', 'nav má mít display: flex');" },
        { text: 'Text druhé nápovědy.', test: "assert.match(files['styles.css'], /nav\\s*\\{/, 'styles.css má obsahovat pravidlo pro nav');" },
      ],
      help: [
        { text: 'Jde o flex kontejner — přečti si [Flex kontejner a flex položky](see:css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky).', hintIndex: null },
        { text: 'Vlastnost `display` patří do pravidla pro prvek, který obaluje odkazy.', hintIndex: 1 },
      ],
      seed: [
        { name: 'index.html', lang: 'html', content: '<nav>…</nav>', region: null },
        { name: 'styles.css', lang: 'css', content: 'body { margin: 0; }\n', region: { start: 2, end: 2 } },
      ],
      solution: [
        { name: 'index.html', lang: 'html', content: '<nav>…</nav>' },
        { name: 'styles.css', lang: 'css', content: 'body { margin: 0; }\nnav { display: flex; }' },
      ],
      explain: null,
      parsons: null,
      approaches: [],
      review: null,
      see: ['css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky'],
      meta: { title: 'Flex kontejner', runtime: 'dom', see: 'css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky' },
    });
  });

  test('see: víc referencí čárkou, neplatná reference = ParseError', () => {
    assert.deepEqual(parseStep(step({ front: 'see: a/b#c, a/b/002' }), { id: 'x' }).see, ['a/b#c', 'a/b/002']);
    throwsParse(() => parseStep(step({ front: 'see: jen-sekce' }), { id: 'x' }), /neplatná reference "jen-sekce"/);
  });

  test('neznámá nebo dvakrát uvedená sekce = ParseError', () => {
    throwsParse(() => parseStep(step({ extra: '# --nesmysl--\n\nx\n' }), { id: 'x' }), /neznámá sekce --nesmysl--/);
    throwsParse(() => parseStep(step({ extra: '# --description--\n\nznovu\n' }), { id: 'x' }), /sekce --description-- je tam dvakrát/);
  });

  test('sekce v nepovoleném typu souboru = ParseError', () => {
    throwsParse(() => parseStep(step({ extra: '# --approaches--\n\n' }), { id: 'x' }), /--approaches-- nepatří do kroku workshopu/);
    throwsParse(() => parseStep(step({ extra: '# --review--\n\n## --rubric--\n\n- a\n' }), { id: 'x' }), /--review-- nepatří do kroku/);
    throwsParse(() => parseStep(step({ extra: '# --explain--\n\nx\n', seed: null, solution: null }), { id: 'x', fileKind: 'project' }), /--explain-- nepatří do projektu/);
    throwsParse(() => parseStep(step(), { id: 'x', fileKind: 'project' }), /--seed-- nepatří do projektu \(projekt bere soubory ze složky starter\/\)/);
  });

  test('chybějící povinné sekce kroku, test u nápovědy a --edit-- 0× nebo 2×', () => {
    throwsParse(() => parseStep(step({ solution: null }), { id: 'x' }), /chybí sekce --solution--/);
    throwsParse(() => parseStep(step({ seed: null }), { id: 'x' }), /chybí sekce --seed--/);
    throwsParse(() => parseStep(step({ hints: 'Požadavek bez testu.' }), { id: 'x' }), /poslední nápověda nemá test/);
    throwsParse(() => parseStep(step({ seed: code('js', '--edit--\na') }), { id: 'x' }), /1× značku --edit--/);
    assert.deepEqual(extractRegion('a\n--edit--\n--edit--\nb'), { content: 'a\nb', region: { start: 2, end: 1 } });
    assert.deepEqual(extractRegion('a\n--edit--\nx\ny\n--edit--'), { content: 'a\nx\ny', region: { start: 2, end: 3 } });
  });

  test('nadpis uvnitř bloku kódu se nepočítá jako sekce', () => {
    const s = parseStep(step({ seed: code('js', '# --hints--\n## --tip--') }), { id: 'x' });
    assert.equal(s.seed[0].content, '# --hints--\n## --tip--');
  });

  test('neznámý kind = ParseError, recall a choose jsou jen štítky', () => {
    assert.equal(parseStep(step({ front: 'kind: recall' }), { id: 'x' }).kind, 'recall');
    assert.equal(parseStep(step({ front: 'kind: choose' }), { id: 'x' }).kind, 'choose');
    throwsParse(() => parseStep(step({ front: 'kind: kviz' }), { id: 'x' }), /neznámý kind "kviz"/);
  });
});

describe('parseStep: # --help-- (kap. 3.3)', () => {
  const withHelp = (help) => step({ extra: `# --help--\n\n${help}\n` });

  test('tipy s požadavkem i bez, pořadí jako v souboru', () => {
    const s = parseStep(withHelp('## --tip--\n\nPrvní.\n\n## --tip-- 1\n\nK požadavku.'), { id: 'x' });
    assert.deepEqual(s.help, [{ text: 'První.', hintIndex: null }, { text: 'K požadavku.', hintIndex: 0 }]);
  });

  test('text mimo tipy, jiná podsekce, N mimo rozsah a prázdný tip = ParseError', () => {
    throwsParse(() => parseStep(withHelp('Volný text.\n\n## --tip--\n\nA'), { id: 'x' }), /text mimo "## --tip--"/);
    throwsParse(() => parseStep(withHelp('## --hint--\n\nA'), { id: 'x' }), /smí být jen ## --tip--/);
    throwsParse(() => parseStep(withHelp('## --tip-- 2\n\nA'), { id: 'x' }), /krok má požadavky 1–1/);
    throwsParse(() => parseStep(withHelp('## --tip-- dva\n\nA'), { id: 'x' }), /celé číslo/);
    throwsParse(() => parseStep(withHelp('## --tip--\n\n'), { id: 'x' }), /prázdný tip/);
  });
});

describe('parseStep: kind debug (kap. 3.4)', () => {
  test('popis s ## Hlášení a ## Úkol projde', () => {
    const s = parseStep(step({ front: 'kind: debug', description: '## Hlášení\n\nPadá to.\n\n## Úkol\n\nOprav to.' }), { id: 'x' });
    assert.equal(s.kind, 'debug');
  });

  test('chybějící nebo přehozené nadpisy = ParseError (i když jsou jen v bloku kódu)', () => {
    throwsParse(() => parseStep(step({ front: 'kind: debug', description: '## Úkol\n\nOprav.' }), { id: 'x' }), /## Hlášení.*## Úkol/);
    throwsParse(() => parseStep(step({ front: 'kind: debug', description: '## Úkol\n\nx\n\n## Hlášení\n\ny' }), { id: 'x' }), /v tomto pořadí/);
    throwsParse(() => parseStep(step({ front: 'kind: debug', description: code('md', '## Hlášení\n## Úkol') }), { id: 'x' }), /## Hlášení/);
  });
});

describe('parseStep: kind parsons (kap. 3.5)', () => {
  const PARSONS = `---
title: Seřaď počítání podle kategorie
kind: parsons
runtime: js
---

# --description--

Seřaď řádky.

# --hints--

\`countByCategory\` vrátí počty podle kategorie.

${code('js', "assert.deepEqual(countByCategory([{ category: 'ovoce' }]), { ovoce: 1 }, 'počty');")}

# --seed--

## --file-- script.js

${code('js', "--edit--\n--edit--\n\nconsole.log(countByCategory([{ category: 'ovoce' }]));")}

# --parsons--

${code('js', 'function countByCategory(items) {\n  return items.reduce((counts, item) => {\n    counts[item.category] = (counts[item.category] ?? 0) + 1;\n    return counts;\n  }, __1__);\n}')}

## --distractors--

${code('js', 'return counts + 1;\ncounts.push(item.category);')}

## --blanks--

${code('text', '1: {}\n1: Object.create(null)')}
`;

  test('příklad z kontraktu → řádky, distraktory, mezery a vygenerované řešení', () => {
    const s = parseStep(PARSONS, { id: 'js-pole/w/020' });
    assert.deepEqual(s.parsons, {
      file: 'script.js',
      indentUnit: 2,
      lines: [
        { text: 'function countByCategory(items) {', indent: 0 },
        { text: 'return items.reduce((counts, item) => {', indent: 1 },
        { text: 'counts[item.category] = (counts[item.category] ?? 0) + 1;', indent: 2 },
        { text: 'return counts;', indent: 2 },
        { text: '}, __1__);', indent: 1 },
        { text: '}', indent: 0 },
      ],
      distractors: ['return counts + 1;', 'counts.push(item.category);'],
      blanks: [{ number: 1, accept: ['{}', 'Object.create(null)'] }],
    });
    assert.deepEqual(s.solution, [{
      name: 'script.js',
      lang: 'js',
      content: "function countByCategory(items) {\n  return items.reduce((counts, item) => {\n    counts[item.category] = (counts[item.category] ?? 0) + 1;\n    return counts;\n  }, {});\n}\n\nconsole.log(countByCategory([{ category: 'ovoce' }]));",
    }]);
    const other = assembleParsons(s.seed[0], s.parsons.lines, { ...s.parsons, forms: { 1: 'Object.create(null)' } });
    assert.match(other, /\}, Object\.create\(null\)\);/);
  });

  test('bez odsazení je indentUnit 2', () => {
    const src = PARSONS.replace(/# --parsons--[\s\S]*$/, `# --parsons--\n\n${code('js', 'const a = 1;\nconsole.log(a);')}\n`);
    const s = parseStep(src, { id: 'x' });
    assert.equal(s.parsons.indentUnit, 2);
    assert.deepEqual(s.parsons.blanks, []);
    assert.deepEqual(s.parsons.distractors, []);
  });

  test('každá ParseError z kap. 3.5', () => {
    const replaceParsons = (body) => PARSONS.replace(/# --parsons--[\s\S]*$/, `# --parsons--\n\n${body}\n`);
    throwsParse(() => parseStep(replaceParsons(`Text.\n\n${code('js', 'a();')}`), { id: 'x' }), /přesně jeden blok kódu/);
    throwsParse(() => parseStep(replaceParsons(`${code('js', 'a();')}\n\n${code('js', 'b();')}`), { id: 'x' }), /přesně jeden blok kódu/);
    throwsParse(() => parseStep(replaceParsons(code('js', 'if (a) {\n\tb();\n}')), { id: 'x' }), /tabulátor/);
    throwsParse(() => parseStep(replaceParsons(code('js', 'if (a) {\n  b();\n   c();\n}')), { id: 'x' }), /není násobkem 2/);
    throwsParse(() => parseStep(replaceParsons(`${code('js', 'a();')}\n\n## --distractors--\n\n${code('js', 'a();')}`), { id: 'x' }), /distraktor "a\(\);" je stejný/);
    throwsParse(() => parseStep(replaceParsons(code('js', 'f(__1__);')), { id: 'x' }), /chybí ## --blanks--/);
    throwsParse(() => parseStep(replaceParsons(`${code('js', 'f(__1__, __2__);')}\n\n## --blanks--\n\n${code('text', '1: a')}`), { id: 'x' }), /__2__ nemá odpověď/);
    throwsParse(() => parseStep(replaceParsons(`${code('js', 'f(__1__);')}\n\n## --blanks--\n\n${code('text', '1: a\n2: b')}`), { id: 'x' }), /odpověď 2 .* nemá v řádcích značku/);
    throwsParse(() => parseStep(replaceParsons(`${code('js', 'f(__2__);')}\n\n## --blanks--\n\n${code('text', '2: a')}`), { id: 'x' }), /souvisle od 1/);
    throwsParse(() => parseStep(PARSONS.replace('--edit--\n--edit--', '--edit--\nx\n--edit--'), { id: 'x' }), /musí být u parsons prázdná/);
    throwsParse(() => parseStep(PARSONS.replace('--edit--\n--edit--\n', ''), { id: 'x' }), /právě jeden soubor s oblastí --edit-- \(má 0\)/);
    throwsParse(() => parseStep(`${PARSONS}\n# --solution--\n\n## --file-- script.js\n\n${code('js', 'x')}\n`, { id: 'x' }), /nesmí mít # --solution--/);
    throwsParse(() => parseStep(step({ extra: `# --parsons--\n\n${code('js', 'a();')}\n` }), { id: 'x' }), /patří jen do kroku s kind: parsons/);
    throwsParse(() => parseStep(PARSONS.replace(/# --parsons--[\s\S]*$/, ''), { id: 'x' }), /chybí sekce --parsons--/);
  });
});

describe('parseStep: # --explain-- (kap. 3.7)', () => {
  const EXPLAIN = `# --explain--

Vysvětli vlastními slovy, proč \`b.push(4)\` změnilo i pole \`a\`.

## --model--

Proměnná neobsahuje pole, ale odkaz na něj.

## --checklist--

- Proměnná drží odkaz, ne celé pole.
* Přiřazení zkopíruje odkaz,
  ne pole.
1. Kopii vyrobí \`[...a]\` nebo \`a.slice()\`.
`;

  test('zadání, model a body s klíči (víceřádková položka pokračuje odsazením)', () => {
    const s = parseStep(step({ extra: EXPLAIN }), { id: 'x' });
    assert.deepEqual(s.explain, {
      prompt: 'Vysvětli vlastními slovy, proč `b.push(4)` změnilo i pole `a`.',
      model: 'Proměnná neobsahuje pole, ale odkaz na něj.',
      checklist: [
        { key: hashKey('Proměnná drží odkaz, ne celé pole.'), text: 'Proměnná drží odkaz, ne celé pole.' },
        { key: hashKey('Přiřazení zkopíruje odkaz,\nne pole.'), text: 'Přiřazení zkopíruje odkaz,\nne pole.' },
        { key: hashKey('Kopii vyrobí `[...a]` nebo `a.slice()`.'), text: 'Kopii vyrobí `[...a]` nebo `a.slice()`.' },
      ],
    });
  });

  test('text mimo položky seznamu a chybějící části = ParseError', () => {
    throwsParse(() => parseStep(step({ extra: `${EXPLAIN}\nVolný text.\n` }), { id: 'x' }), /text mimo položky seznamu/);
    throwsParse(() => parseStep(step({ extra: '# --explain--\n\n## --model--\n\nM\n\n## --checklist--\n\n- a\n' }), { id: 'x' }), /nemá zadání/);
    throwsParse(() => parseStep(step({ extra: '# --explain--\n\nZadání\n\n## --checklist--\n\n- a\n' }), { id: 'x' }), /nemá ## --model--/);
    throwsParse(() => parseStep(step({ extra: '# --explain--\n\nZadání\n\n## --model--\n\nM\n' }), { id: 'x' }), /nemá ## --checklist--/);
  });
});

describe('parseStep: lab a projekt (kap. 3.8, 3.9)', () => {
  const APPROACHES = `# --approaches--

## --approach-- Cyklus for…of

Nejčitelnější.

### --file-- script.js

${code('js', 'for (const x of []) {}')}

## --approach-- Math.min se spreadem

### --file-- script.js

${code('js', 'Math.min(...[]);')}
`;
  const REVIEW = `# --review--

Testy kontrolují chování.

## --rubric--

- Jména říkají, co dělají.
- README popisuje spuštění.

## --extensions--

Rozšíření bez testů.
`;

  test('lab: přístupy sloučené se seedem, rubrika, kind debug povolený', () => {
    const lab = parseStep(step({ extra: `${APPROACHES}\n${REVIEW}`, seed: code('js', '// seed'), front: 'kind: debug', description: '## Hlášení\n\nx\n\n## Úkol\n\ny' }), { id: 's/lab', fileKind: 'lab' });
    assert.deepEqual(lab.approaches, [
      { title: 'Cyklus for…of', description: 'Nejčitelnější.', files: [{ name: 'script.js', lang: 'js', content: 'for (const x of []) {}' }] },
      { title: 'Math.min se spreadem', description: '', files: [{ name: 'script.js', lang: 'js', content: 'Math.min(...[]);' }] },
    ]);
    assert.deepEqual(lab.review, {
      intro: 'Testy kontrolují chování.',
      rubric: [
        { key: hashKey('Jména říkají, co dělají.'), text: 'Jména říkají, co dělají.' },
        { key: hashKey('README popisuje spuštění.'), text: 'README popisuje spuštění.' },
      ],
      extensions: 'Rozšíření bez testů.',
    });
  });

  test('lab bez seedu a řešení: prázdné soubory a řešení', () => {
    const lab = parseStep(step({ seed: null, solution: null }), { id: 's/lab', fileKind: 'lab', defaultRuntime: 'js' });
    assert.equal(lab.runtime, 'js');
    assert.deepEqual([lab.seed, lab.solution], [[], []]);
  });

  test('ParseError: kind v labu a projektu, přístup bez názvu nebo souboru, rubrika chybí', () => {
    throwsParse(() => parseStep(step({ front: 'kind: parsons' }), { id: 'x', fileKind: 'lab' }), /lab smí mít jen kind step nebo debug/);
    throwsParse(() => parseStep(step({ front: 'kind: debug', seed: null, solution: null }), { id: 'x', fileKind: 'project' }), /projekt nemá kind/);
    throwsParse(() => parseStep(step({ extra: `# --approaches--\n\n## --approach--\n\n### --file-- a.js\n\n${code('js', 'x')}\n` }), { id: 'x', fileKind: 'lab' }), /potřebuje název/);
    throwsParse(() => parseStep(step({ extra: '# --approaches--\n\n## --approach-- Bez souboru\n\nPopis.\n' }), { id: 'x', fileKind: 'lab' }), /nemá žádný ### --file--/);
    throwsParse(() => parseStep(step({ extra: '# --approaches--\n\nÚvod.\n' }), { id: 'x', fileKind: 'lab' }), /text mimo "## --approach-- název"/);
    throwsParse(() => parseStep(step({ extra: '# --review--\n\nJen úvod.\n', seed: null, solution: null }), { id: 'x', fileKind: 'project' }), /nemá ## --rubric--/);
  });
});

describe('parseQuiz: otázky s výběrem a psané (kap. 4.1–4.4)', () => {
  const CHOICE = `## --question--

Text otázky, klidně s kódem.

### --answer--

Špatná odpověď.

#### --why--

Proč je špatná.

### --correct--

Správná odpověď.

#### --why--

Proč je správná.

### --see--

css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky
`;
  const TEXT = `## --question--

Co vypíše poslední řádek?

${code('js', "console.log(['a'].indexOf('b'));")}

### --expected--

-1

### --why--

\`indexOf\` vrací \`-1\`.

### --see--

js-pole/co-je-pole#hledani-v-poli
`;

  test('příklady z kontraktu → přesný výstup', () => {
    const quiz = parseQuiz(`---\npass: 0.8\n---\n\n${CHOICE}\n${TEXT}`, { id: 'q' });
    const choiceText = 'Text otázky, klidně s kódem.';
    const writtenText = `Co vypíše poslední řádek?\n\n${code('js', "console.log(['a'].indexOf('b'));")}`;
    assert.deepEqual(quiz, {
      id: 'q',
      pass: 0.8,
      questions: [
        {
          key: hashKey(choiceText), type: 'choice', text: choiceText, multiple: false,
          answers: [{ text: 'Špatná odpověď.', correct: false, why: 'Proč je špatná.' }, { text: 'Správná odpověď.', correct: true, why: 'Proč je správná.' }],
          see: ['css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky'],
          code: null,
        },
        {
          key: hashKey(writtenText), type: 'text', text: writtenText, expected: '-1', accept: [], ignoreCase: false,
          why: '`indexOf` vrací `-1`.', see: ['js-pole/co-je-pole#hledani-v-poli'], code: null,
        },
      ],
      codeSets: [],
    });
  });

  test('stejný text dostane příponu -2, víc správných = multiple', () => {
    const q = `## --question--\n\nStejná?\n\n### --correct--\n\nA\n\n### --correct--\n\nB\n\n### --answer--\n\nC\n`;
    const quiz = parseQuiz(`${q}\n${q}`, { id: 'q' });
    assert.deepEqual(quiz.questions.map((x) => x.key), [hashKey('Stejná?'), `${hashKey('Stejná?')}-2`]);
    assert.equal(quiz.questions[0].multiple, true);
  });

  test('--expected-- jako blok kódu, ignore-case, --accept-- bloky i řádky', () => {
    const block = parseQuiz(`## --question--\n\nKód?\n\n### --expected--\n\n${code('js', 'a\nb')}\n\n### --accept--\n\n${code('js', 'x')}\n\n${code('js', 'y')}\n`, { id: 'q' }).questions[0];
    assert.equal(block.expected, 'a\nb');
    assert.deepEqual(block.accept, ['x', 'y']);
    const lines = parseQuiz('## --question--\n\nSlovo?\n\n### --expected-- ignore-case\n\nPole\n\n### --accept--\n\n- pole\narray\n', { id: 'q' }).questions[0];
    assert.equal(lines.ignoreCase, true);
    assert.deepEqual(lines.accept, ['- pole', 'array']);
  });

  test('každá ParseError z kap. 4.1 a 4.2', () => {
    const q = (body) => parseQuiz(`## --question--\n\nOtázka?\n\n${body}\n`, { id: 'q' });
    throwsParse(() => q('### --correct--\n\nA'), /aspoň 2 odpovědi/);
    throwsParse(() => q('### --answer--\n\nA\n\n### --answer--\n\nB'), /žádnou --correct--/);
    throwsParse(() => q('### --correct--\n\nA\n\n#### --proc--\n\nx\n\n### --answer--\n\nB'), /neznámá sekce --proc-- v odpovědi/);
    throwsParse(() => q('### --correct--\n\nA\n\n### --answer--\n\nB\n\n### --why--\n\nx'), /--why-- u otázky s výběrem nepatří/);
    throwsParse(() => q('### --correct--\n\nA\n\n### --answer--\n\nB\n\n### --expected--\n\nC'), /kombinuje odpovědi/);
    throwsParse(() => q('### --why--\n\nNic.'), /nemá odpovědi .* ani psanou odpověď/);
    throwsParse(() => q(`### --expected--\n\nText\n\n${code('js', 'x')}`), /blok kódu i text zároveň/);
    throwsParse(() => q('### --expected-- case\n\nA'), /povolený je jen ignore-case/);
    throwsParse(() => q(`### --expected--\n\nA\n\n### --accept--\n\nText\n\n${code('js', 'x')}`), /text mimo bloky kódu/);
    throwsParse(() => q('### --expected--\n\nA\n\n### --see--\n\nneplatna'), /neplatná reference "neplatna"/);
  });
});

describe('parseQuiz: sady # --code-- (kap. 4.3)', () => {
  const file = (name) => `## --file-- ${name}\n\n${code('js', `// ${name}`)}\n`;
  const question = (text) => `## --question--\n\n${text}\n\n### --expected--\n\n0\n`;

  test('obecné otázky a sada s kódem: code = index do codeSets', () => {
    const quiz = parseQuiz(`---\npass: 0.8\n---\n\n# --questions--\n\n${question('Obecná?')}\n# --code-- Košík v e-shopu\n\n${file('cart.js')}\n${file('format.js')}\n${question('Co vrátí cartTotal?')}\n${question('A prázdný?')}`, { id: 'q' });
    assert.deepEqual(quiz.questions.map((q) => [q.text, q.code]), [['Obecná?', null], ['Co vrátí cartTotal?', 0], ['A prázdný?', 0]]);
    assert.deepEqual(quiz.codeSets, [{
      title: 'Košík v e-shopu',
      files: [{ name: 'cart.js', lang: 'js', content: '// cart.js' }, { name: 'format.js', lang: 'js', content: '// format.js' }],
    }]);
  });

  test('každá ParseError z kap. 4.3', () => {
    throwsParse(() => parseQuiz(`Úvod.\n\n# --questions--\n\n${question('A?')}`, { id: 'q' }), /text před první sekcí/);
    throwsParse(() => parseQuiz(`# --otazky--\n\n${question('A?')}`, { id: 'q' }), /jen # --questions-- a # --code--/);
    throwsParse(() => parseQuiz(`# --code--\n\n${file('a.js')}\n${question('A?')}`, { id: 'q' }), /# --code-- potřebuje titulek/);
    throwsParse(() => parseQuiz(`# --code-- Sada\n\n${file('a.js')}\n${question('A?')}\n${file('b.js')}`, { id: 'q' }), /musí být před první otázkou/);
    throwsParse(() => parseQuiz(`# --code-- Sada\n\n${question('A?')}`, { id: 'q' }), /nemá před otázkami žádný ## --file--/);
    throwsParse(() => parseQuiz(`# --code-- Sada\n\n${file('a.js')}${file('b.js')}${file('c.js')}${file('d.js')}\n${question('A?')}`, { id: 'q' }), /má 4 souborů \(nejvýš 3\)/);
    throwsParse(() => parseQuiz(`# --code-- Sada\n\n${file('a.js')}`, { id: 'q' }), /nemá žádnou otázku/);
    throwsParse(() => parseQuiz(`# --code-- Sada\n\nText.\n\n${file('a.js')}\n${question('A?')}`, { id: 'q' }), /text mimo ## --file--/);
    throwsParse(() => parseQuiz('', { id: 'q' }), /kvíz nemá žádnou otázku/);
    throwsParse(() => parseQuiz(`---\npass: 2\n---\n\n${question('A?')}`, { id: 'q' }), /pass musí být číslo/);
  });
});

describe('parseLesson: stavba, titulek, nadpisy, klíče (kap. 5.1, 5.9)', () => {
  const LESSON = `# Flexbox: hlavní a vedlejší osa

:::check pretest
Co udělá \`display: flex\` s odstavci uvnitř kontejneru?

### --answer--
Nic, flex funguje jen na \`<div>\`.

### --correct--
Postaví je vedle sebe do řádku.
:::

## Problém: prvky vedle sebe

Výklad… **Mentální model v jedné tučné větě.**

> [!REMEMBER]
> Rámeček zůstává textem md bloku.

:::live
${code('html', '<div class="row"><div>1</div><div>2</div></div>')}
${code('css', '.row { display: flex; gap: 1rem; }')}
:::

:::check
Která vlastnost určuje směr hlavní osy?

### --expected--
flex-direction
:::

## Kde to najdeš v MDN

### Pasti

# --questions--

## --question--

Která vlastnost určuje směr hlavní osy?

### --expected--

flex-direction
`;

  test('příklad z kontraktu → bloky, nadpisy s kotvami a klíče přes celý soubor', () => {
    const lesson = parseLesson(LESSON, { id: 'css-flexbox/uvod' });
    assert.equal(lesson.title, 'Flexbox: hlavní a vedlejší osa');
    assert.deepEqual(lesson.headings, [
      { level: 2, text: 'Problém: prvky vedle sebe', anchor: 'problem-prvky-vedle-sebe' },
      { level: 2, text: 'Kde to najdeš v MDN', anchor: 'kde-to-najdes-v-mdn' },
      { level: 3, text: 'Pasti', anchor: 'pasti' },
    ]);
    assert.deepEqual(lesson.blocks.map((b) => b.kind), ['md', 'check', 'md', 'live', 'check', 'md']);
    assert.match(lesson.blocks[2].text, /> \[!REMEMBER\]\n> Rámeček zůstává textem md bloku\./);
    const pretestText = 'Co udělá `display: flex` s odstavci uvnitř kontejneru?';
    assert.deepEqual(lesson.blocks[1], {
      kind: 'check',
      pretest: true,
      question: {
        key: hashKey(pretestText), type: 'choice', text: pretestText, multiple: false,
        answers: [{ text: 'Nic, flex funguje jen na `<div>`.', correct: false, why: '' }, { text: 'Postaví je vedle sebe do řádku.', correct: true, why: '' }],
        see: [],
      },
    });
    assert.deepEqual(lesson.blocks[3], {
      kind: 'live', runtime: 'dom', controls: [], predict: null, output: null,
      files: [
        { name: 'index.html', lang: 'html', content: '<div class="row"><div>1</div><div>2</div></div>' },
        { name: 'styles.css', lang: 'css', content: '.row { display: flex; gap: 1rem; }' },
      ],
    });
    const key = hashKey('Která vlastnost určuje směr hlavní osy?');
    assert.equal(lesson.blocks[4].question.key, key);
    assert.equal(lesson.questions[0].key, `${key}-2`, ':::check a # --questions-- sdílí řadu klíčů');
  });

  test('ParseError: vnořený, neuzavřený, neznámý a plánovaný blok, zbloudilé :::, prázdná lekce', () => {
    throwsParse(() => parseLesson(':::check\nA?\n:::live\n:::\n', { id: 'l' }), /vnořený blok :::live/);
    throwsParse(() => parseLesson('# L\n\n:::live\n```js\nx\n```\n', { id: 'l' }), /neuzavřený blok :::live/);
    throwsParse(() => parseLesson('# L\n\n:::nesmysl\n:::\n', { id: 'l' }), /neznámý blok :::nesmysl/);
    for (const planned of ['trace js', 'specificita', 'regex', 'eventloop']) {
      throwsParse(() => parseLesson(`# L\n\n:::${planned}\n:::\n`, { id: 'l' }), /neznámý blok/);
    }
    throwsParse(() => parseLesson('# L\n\n:::\n', { id: 'l' }), /zavírací ::: bez otevíracího/);
    throwsParse(() => parseLesson('# L\n\n# --cards--\n', { id: 'l' }), /neznámá sekce # --cards--/);
    throwsParse(() => parseLesson('', { id: 'l' }), /prázdná lekce/);
  });

  test('značky uvnitř bloku kódu se ignorují', () => {
    const lesson = parseLesson(`# L\n\n${code('md', ':::live\n# --questions--\n:::')}\n`, { id: 'l' });
    assert.deepEqual(lesson.blocks.map((b) => b.kind), ['md']);
    assert.deepEqual(lesson.questions, []);
  });
});

describe('parseLesson: :::live a controls (kap. 5.2)', () => {
  const live = (head, body) => parseLesson(`# L\n\n:::live${head}\n${body}\n:::\n`, { id: 'l' }).blocks[1];

  test('ovládací prvky z kontraktu → přesný výstup a výchozí :root pro verify', () => {
    const block = live('', `${code('css', '.row { justify-content: var(--justify); gap: var(--gap); }')}\n${code('controls', '--justify: select(flex-start, center, space-between) = flex-start | Zarovnání\n--gap: range(0, 3, 0.5, rem) = 1 | Mezera\n--wrap: toggle(nowrap, wrap) | Zalomení\n--cols: select("repeat(3, 1fr)", "1fr 1fr")')}`);
    assert.deepEqual(block.controls, [
      { name: '--justify', type: 'select', label: 'Zarovnání', options: ['flex-start', 'center', 'space-between'], default: 'flex-start' },
      { name: '--gap', type: 'range', label: 'Mezera', min: 0, max: 3, step: 0.5, unit: 'rem', default: 1 },
      { name: '--wrap', type: 'toggle', label: 'Zalomení', options: ['nowrap', 'wrap'], default: 'nowrap' },
      { name: '--cols', type: 'select', label: 'cols', options: ['repeat(3, 1fr)', '1fr 1fr'], default: 'repeat(3, 1fr)' },
    ]);
    assert.deepEqual(applyControlDefaults(block.files, block.controls), [{
      name: 'styles.css', lang: 'css',
      content: ':root { --justify: flex-start; --gap: 1rem; --wrap: nowrap; --cols: repeat(3, 1fr); }\n.row { justify-content: var(--justify); gap: var(--gap); }',
    }]);
    assert.deepEqual(applyControlDefaults([{ name: 'index.html', lang: 'html', content: '<p>' }], [block.controls[1]]).map((f) => f.name), ['index.html', 'styles.css']);
  });

  test('runtime js, vue a jazyky souborů', () => {
    assert.equal(live(' js', code('js', 'console.log(1)')).runtime, 'js');
    assert.deepEqual(live(' vue', code('html', '<div id="app"></div>')).files.map((f) => f.name), ['index.html']);
  });

  test('každá ParseError z kap. 5.2', () => {
    throwsParse(() => live('', `Text.\n${code('css', 'a{}')}`), /text mimo bloky kódu/);
    throwsParse(() => live('', code('css', 'a{}') + '\n' + code('css', 'b{}')), /dva bloky stejného jazyka/);
    throwsParse(() => live('', code('ts', 'x')), /umí jen bloky html, css a js/);
    throwsParse(() => live('', ''), /:::live bez kódu/);
    throwsParse(() => live(' node', code('js', 'x')), /node je povolené jen s predict/);
    throwsParse(() => live(' js', `${code('js', 'x')}\n${code('controls', '--a: toggle(a, b)')}`), /controls umí jen runtime dom a vue/);
    const control = (line) => live('', `${code('css', 'a{}')}\n${code('controls', line)}`);
    throwsParse(() => control('--a: select(jen)'), /select potřebuje aspoň 2/);
    throwsParse(() => control('--a: toggle(a, b, c)'), /toggle potřebuje přesně 2/);
    throwsParse(() => control('--a: range(3, 1, 1)'), /min musí být menší než max/);
    throwsParse(() => control('--a: range(0, 3, 0)'), /krok musí být kladný/);
    throwsParse(() => control('--a: range(0, 3, 1) = 5'), /mimo rozsah/);
    throwsParse(() => control('--a: select(x, y) = z'), /není mezi hodnotami/);
    throwsParse(() => control('--A: select(x, y)'), /nemá tvar/);
    throwsParse(() => control('--a: toggle(a, b)\n--a: toggle(a, b)'), /je v bloku dvakrát/);
    throwsParse(() => live('', `${code('css', 'a{}')}\n${code('controls', '--a: toggle(a, b)')}\n${code('controls', '--b: toggle(a, b)')}`), /nejvýš jeden blok controls/);
  });
});

describe('parseLesson: předpověď (kap. 5.3)', () => {
  const lesson = (src) => parseLesson(`# L\n\n${src}\n`, { id: 'l' }).blocks[1];

  test('js s psanou odpovědí, dom s výběrem, node s výstupem → přesný výstup', () => {
    const js = lesson(`:::live js predict\n${code('js', 'const a = [1, 2, 3];\nconsole.log(a.length);')}\n--question-- Co vypíše \`console.log\`?\n--expected-- 3\n--why-- \`length\` je počet prvků.\n:::`);
    assert.deepEqual(js, {
      kind: 'live', runtime: 'js', controls: [], output: null,
      files: [{ name: 'script.js', lang: 'js', content: 'const a = [1, 2, 3];\nconsole.log(a.length);' }],
      predict: { key: hashKey('Co vypíše `console.log`?'), type: 'text', text: 'Co vypíše `console.log`?', expected: '3', accept: [], ignoreCase: false, why: '`length` je počet prvků.', see: [] },
    });

    const dom = lesson(`:::live predict\n${code('html', '<p>x</p>')}\n--question-- Co se stane s obrázkem?\n--option-- Text se zalomí.\n--option*-- Obrázek se zmenší.\n--why-- Flex položky se zmenšují.\n--see-- css-flexbox/flex-do-hloubky#flex-shrink\n:::`);
    assert.deepEqual(dom.predict, {
      key: hashKey('Co se stane s obrázkem?'), type: 'choice', text: 'Co se stane s obrázkem?', multiple: false,
      answers: [{ text: 'Text se zalomí.', correct: false, why: '' }, { text: 'Obrázek se zmenší.', correct: true, why: '' }],
      why: 'Flex položky se zmenšují.', see: ['css-flexbox/flex-do-hloubky#flex-shrink'],
    });

    const node = lesson(`:::live node predict\n${code('js', "console.log('A');")}\n--question-- V jakém pořadí?\n--output--\n${code('text', 'A\nC\nB')}\n:::`);
    assert.deepEqual(node.files, [{ name: 'index.js', lang: 'js', content: "console.log('A');" }]);
    assert.equal(node.output, 'A\nC\nB');
    assert.equal(node.predict.expected, 'A\nC\nB', 'expected je u node výchozí --output--');
  });

  test('víceřádková značka a blok kódu v otázce', () => {
    const block = lesson(`:::live js predict\n${code('js', 'console.log(1)')}\n--question--\nCo vypíše tohle?\n${code('js', 'x')}\n--expected--\n${code('text', '1')}\n--accept-- jedna\n:::`);
    assert.equal(block.predict.text, `Co vypíše tohle?\n${code('js', 'x')}`);
    assert.equal(block.predict.expected, '1');
    assert.deepEqual(block.predict.accept, ['jedna']);
  });

  test('každá ParseError z kap. 5.3', () => {
    const js = code('js', 'console.log(1)');
    throwsParse(() => lesson(`:::live js predict\n${js}\nVolný text\n--question-- A?\n--expected-- 1\n:::`), /text před první značkou/);
    throwsParse(() => lesson(`:::live js predict\n${js}\n--question-- A?\n--expected--\n${js}\n:::`), /blok souboru \(js\) za první značkou/);
    throwsParse(() => lesson(`:::live predict\n${code('css', 'a{}')}\n${code('controls', '--a: toggle(a, b)')}\n--question-- A?\n--option*-- a\n--option-- b\n:::`), /controls nejdou kombinovat s predict/);
    throwsParse(() => lesson(`:::live js predict\n${js}\n--expected-- 1\n:::`), /nemá --question--/);
    throwsParse(() => lesson(`:::live js predict\n${js}\n--question-- A?\n--question-- B?\n--expected-- 1\n:::`), /--question-- je v předpovědi dvakrát/);
    throwsParse(() => lesson(`:::live predict\n${code('html', '<p>')}\n--question-- A?\n--expected-- 1\n:::`), /dom umí jen otázku s výběrem/);
    throwsParse(() => lesson(`:::live node predict\n${js}\n--question-- A?\n--expected-- 1\n:::`), /potřebuje --output--/);
    throwsParse(() => lesson(`:::live js predict\n${js}\n--question-- A?\n--output-- 1\n:::`), /--output-- patří jen do :::live node/);
    throwsParse(() => lesson(`:::live js predict\n${js}\n--question-- A?\n--option-- a\n--expected-- 1\n:::`), /kombinuje --option-- a --expected--/);
    throwsParse(() => lesson(`:::live js predict\n${js}\n--question-- A?\n--option-- a\n--option-- b\n:::`), /nemá správnou možnost/);
    throwsParse(() => lesson(`:::live node predict\n${code('html', '<p>')}\n--question-- A?\n--output-- 1\n:::`), /přesně jeden blok js/);
    throwsParse(() => lesson(`:::live js nesmysl\n${js}\n:::`), /neznámý argument "nesmysl"/);
  });
});

describe('parseLesson: :::check, :::explain, :::memory, :::compare (kap. 5.4–5.7)', () => {
  const block = (src) => parseLesson(`# L\n\n${src}\n`, { id: 'l' }).blocks[1];

  test(':::check s psanou odpovědí a ParseError pro jiný argument', () => {
    assert.deepEqual(block(':::check pretest\nCo myslíš, co vypíše `[1, 2] === [1, 2]`?\n\n### --expected--\nfalse\n:::').question.expected, 'false');
    throwsParse(() => block(':::check predem\nA?\n### --expected--\n1\n:::'), /povolený je jen pretest/);
  });

  test(':::explain → prompt, model a checklist s klíči', () => {
    const explain = block(':::explain\nVysvětli, proč `const` pole nezabrání `push`.\n\n## --model--\n`const` hlídá proměnnou, ne hodnotu.\n\n## --checklist--\n- `const` zakazuje nové přiřazení do proměnné.\n- Obsah pole jde měnit dál.\n:::');
    assert.deepEqual(explain, {
      kind: 'explain',
      prompt: 'Vysvětli, proč `const` pole nezabrání `push`.',
      model: '`const` hlídá proměnnou, ne hodnotu.',
      checklist: [
        { key: hashKey('`const` zakazuje nové přiřazení do proměnné.'), text: '`const` zakazuje nové přiřazení do proměnné.' },
        { key: hashKey('Obsah pole jde měnit dál.'), text: 'Obsah pole jde měnit dál.' },
      ],
    });
    throwsParse(() => block(':::explain navic\nA\n:::'), /:::explain nemá argumenty/);
  });

  test(':::memory z kontraktu → přesný výstup', () => {
    const memory = block(`:::memory\n${code('js', 'const a = [1, 2];\nconst b = a;\nb.push(3);')}\n--step-- 1\na -> @arr\n@arr: [1, 2]\n--step-- 2 | b = a nezkopíruje pole\na -> @arr\nb -> @arr\ncount = 3\n@arr: [1, 2]\n--step-- 3\n@user: { name: 'Ema', tags: @tags }\n@tags: ['a']\n:::`);
    assert.deepEqual(memory, {
      kind: 'memory',
      code: { lang: 'js', content: 'const a = [1, 2];\nconst b = a;\nb.push(3);' },
      steps: [
        { line: 1, label: '', bindings: [{ name: 'a', value: null, ref: 'arr' }], objects: [{ id: 'arr', text: '[1, 2]', refs: [] }] },
        {
          line: 2, label: 'b = a nezkopíruje pole',
          bindings: [{ name: 'a', value: null, ref: 'arr' }, { name: 'b', value: null, ref: 'arr' }, { name: 'count', value: '3', ref: null }],
          objects: [{ id: 'arr', text: '[1, 2]', refs: [] }],
        },
        { line: 3, label: '', bindings: [], objects: [{ id: 'user', text: "{ name: 'Ema', tags: @tags }", refs: ['tags'] }, { id: 'tags', text: "['a']", refs: [] }] },
      ],
    });
  });

  test('každá ParseError z kap. 5.6', () => {
    const js = code('js', 'const a = 1;');
    throwsParse(() => block(`:::memory\nText.\n${js}\n--step-- 1\na = 1\n:::`), /začínat přesně jedním blokem kódu/);
    throwsParse(() => block(`:::memory\n--step-- 1\na = 1\n:::`), /začínat přesně jedním blokem kódu/);
    throwsParse(() => block(`:::memory\n${js}\n:::`), /nemá žádný --step--/);
    throwsParse(() => block(`:::memory\n${js}\n--step-- 2\na = 1\n:::`), /kód má řádky 1–1/);
    throwsParse(() => block(`:::memory\n${js}\n--step-- 1\na -> @neni\n:::`), /odkazuje na @neni/);
    throwsParse(() => block(`:::memory\n${js}\n--step-- 1\n@o: { x: @jiny }\n:::`), /odkazuje na @jiny/);
    throwsParse(() => block(`:::memory\n${js}\nnapřed\n--step-- 1\na = 1\n:::`), /text před prvním --step--/);
    throwsParse(() => block(`:::memory\n${js}\n--step-- 1\nnesmysl\n:::`), /není "jméno = hodnota"/);
    throwsParse(() => block(`:::memory\n${js}\n--step-- 1\na = 1\n${js}\n:::`), /jen jeden blok kódu/);
  });

  test(':::compare z kontraktu → sloučené soubory variant', () => {
    const compare = block(`:::compare\n${code('html', '<div class="wrap"></div>')}\n${code('css', '.wrap { width: 300px; }')}\n--variant-- Normální tok\n${code('css', '.wrap { display: block; }')}\n--variant-- Flexbox\n${code('css', '.wrap { display: flex; }')}\n${code('js', 'console.log(1)')}\n:::`);
    assert.deepEqual(compare, {
      kind: 'compare', runtime: 'dom',
      variants: [
        { label: 'Normální tok', files: [{ name: 'index.html', lang: 'html', content: '<div class="wrap"></div>' }, { name: 'styles.css', lang: 'css', content: '.wrap { width: 300px; }\n.wrap { display: block; }' }] },
        { label: 'Flexbox', files: [{ name: 'index.html', lang: 'html', content: '<div class="wrap"></div>' }, { name: 'styles.css', lang: 'css', content: '.wrap { width: 300px; }\n.wrap { display: flex; }' }, { name: 'script.js', lang: 'js', content: 'console.log(1)' }] },
      ],
    });
  });

  test('každá ParseError z kap. 5.7', () => {
    const css = code('css', 'a{}');
    throwsParse(() => block(`:::compare\n${css}\n--variant-- Jen jedna\n${css}\n:::`), /přesně dvě --variant-- \(má 1\)/);
    throwsParse(() => block(`:::compare\n--variant--\n${css}\n--variant-- B\n${css}\n:::`), /--variant-- potřebuje popisek/);
    throwsParse(() => block(`:::compare\n--variant-- A\n--variant-- B\n${css}\n:::`), /varianta "A" nemá žádný blok/);
    throwsParse(() => block(`:::compare\nText\n--variant-- A\n${css}\n--variant-- B\n${css}\n:::`), /text mimo bloky kódu/);
  });
});

describe('parseCards (kap. 2.5)', () => {
  const CARDS = `## --card-- output

Co vypíše tenhle kód?

${code('js', 'const a = [3, 1, 2];\nconst b = a.sort();\nconsole.log(a === b);')}

### --expected--

true

### --why--

Řadí pole na místě.

### --see--

js-pole/metody-pole-do-hloubky#metody-ktere-meni-pole

## --card-- code js

Napiš funkci \`last(items)\`.

### --seed--

${code('js', 'function last(items) {\n}')}

### --test--

${code('js', "assert.equal(last([1, 2, 3]), 3, 'last([1, 2, 3]) má vrátit 3');")}

### --solution--

${code('js', 'function last(items) {\n  return items.at(-1);\n}')}

## --card-- css

Napiš deklaraci, která flex položky zalomí.

### --expected--

${code('css', 'flex-wrap: wrap;')}

### --accept--

${code('css', 'flex-flow: row wrap;')}

## --card-- free

Jaký je rozdíl mezi \`map\` a \`forEach\`?

### --back--

\`map\` vrací nové pole.
`;

  test('příklad z kontraktu → přesný výstup', () => {
    const outputText = `Co vypíše tenhle kód?\n\n${code('js', 'const a = [3, 1, 2];\nconst b = a.sort();\nconsole.log(a === b);')}`;
    assert.deepEqual(parseCards(CARDS, { id: 'js-pole' }), {
      id: 'js-pole',
      cards: [
        { key: hashKey(outputText), type: 'output', text: outputText, expected: 'true', accept: [], ignoreCase: false, why: 'Řadí pole na místě.', see: ['js-pole/metody-pole-do-hloubky#metody-ktere-meni-pole'] },
        {
          key: hashKey('Napiš funkci `last(items)`.'), type: 'code', runtime: 'js', text: 'Napiš funkci `last(items)`.',
          seed: [{ name: 'script.js', lang: 'js', content: 'function last(items) {\n}', region: null }],
          hints: [{ text: 'Napiš funkci `last(items)`.', test: "assert.equal(last([1, 2, 3]), 3, 'last([1, 2, 3]) má vrátit 3');" }],
          solution: [{ name: 'script.js', lang: 'js', content: 'function last(items) {\n  return items.at(-1);\n}' }],
          why: '', see: [],
        },
        { key: hashKey('Napiš deklaraci, která flex položky zalomí.'), type: 'css', text: 'Napiš deklaraci, která flex položky zalomí.', expected: 'flex-wrap: wrap;', accept: ['flex-flow: row wrap;'], ignoreCase: false, why: '', see: [] },
        { key: hashKey('Jaký je rozdíl mezi `map` a `forEach`?'), type: 'free', text: 'Jaký je rozdíl mezi `map` a `forEach`?', back: '`map` vrací nové pole.', see: [] },
      ],
    });
  });

  test('každá ParseError z kap. 2.5', () => {
    throwsParse(() => parseCards('## --card-- kviz\n\nText\n', { id: 's' }), /neznámý typ karty "kviz"/);
    throwsParse(() => parseCards('## --card-- code dom\n\nText\n', { id: 's' }), /code umí jen runtime js/);
    throwsParse(() => parseCards('## --card-- code\n\nText\n', { id: 's' }), /code umí jen runtime js/);
    throwsParse(() => parseCards('## --card-- output\n\nText\n', { id: 's' }), /nemá ### --expected--/);
    throwsParse(() => parseCards('## --card-- free\n\nText\n\n### --back--\n\nB\n\n### --expected--\n\nx\n', { id: 's' }), /neznámá sekce --expected-- v kartě free/);
    throwsParse(() => parseCards(`## --card-- code js\n\nT\n\n### --seed--\n\n${code('js', 'a')}\n${code('js', 'b')}\n\n### --test--\n\n${code('js', 'x')}\n\n### --solution--\n\n${code('js', 'y')}\n`, { id: 's' }), /--seed-- musí obsahovat přesně jeden blok/);
    throwsParse(() => parseCards('## --card-- free\n\n### --back--\n\nB\n', { id: 's' }), /karta nemá text/);
    throwsParse(() => parseCards('Úvod\n\n## --card-- free\n\nT\n\n### --back--\n\nB\n', { id: 's' }), /text mimo "## --card-- typ"/);
  });
});

describe('parseTerms (kap. 2.6)', () => {
  const TERMS = `## --term-- hlavní osa

en: main axis
aliases: hlavní ose, hlavní osy, hlavní osou
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Main_Axis
lekce: css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

Směr, ve kterém flex kontejner řadí položky. Určuje ho \`flex-direction\`.

## --term-- flex kontejner

lekce: css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky
Prvek s \`display: flex\`.
`;

  test('příklad z kontraktu → přesný výstup (chybějící en/mdn = null, aliases = [])', () => {
    assert.deepEqual(parseTerms(TERMS, { id: 'css-flexbox' }), {
      id: 'css-flexbox',
      terms: [
        {
          id: 'hlavni-osa', term: 'hlavní osa', en: 'main axis', aliases: ['hlavní ose', 'hlavní osy', 'hlavní osou'],
          mdn: 'https://developer.mozilla.org/en-US/docs/Glossary/Main_Axis', lesson: 'css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa',
          definition: 'Směr, ve kterém flex kontejner řadí položky. Určuje ho `flex-direction`.', sectionId: 'css-flexbox',
        },
        {
          id: 'flex-kontejner', term: 'flex kontejner', en: null, aliases: [], mdn: null,
          lesson: 'css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky', definition: 'Prvek s `display: flex`.', sectionId: 'css-flexbox',
        },
      ],
    });
  });

  test('každá ParseError z kap. 2.6', () => {
    throwsParse(() => parseTerms('## --term--\n\nlekce: a/b\n\nDef.\n', { id: 's' }), /potřebuje pojem/);
    throwsParse(() => parseTerms('## --term-- x\n\nen: y\n\nDef.\n', { id: 's' }), /nemá lekce:/);
    throwsParse(() => parseTerms('## --term-- x\n\nlekce: a/b\n', { id: 's' }), /nemá definici/);
    throwsParse(() => parseTerms('## --term-- x\n\nlekce: a/b\nautor: já\n\nDef.\n', { id: 's' }), /neznámý klíč "autor"/);
    throwsParse(() => parseTerms('## --term-- x\n\nlekce: neplatna\n\nDef.\n', { id: 's' }), /neplatná reference lekce/);
    throwsParse(() => parseTerms('## --term-- x\n\nlekce: a/b\nmdn: https://example.com\n\nDef.\n', { id: 's' }), /mdn musí vést na https:\/\/developer\.mozilla\.org/);
  });
});
