import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStep, parseQuiz, parseLesson, extractRegion, ParseError } from './parse.js';

const STEP = `---
title: Flex kontejner
---

# --description--

Nastav \`nav\` na \`display: flex\`.

# --hints--

Prvek \`nav\` má mít \`display: flex\`.

\`\`\`js
assert.equal(getComputedStyle(document.querySelector('nav')).display, 'flex');
\`\`\`

Pravidlo píšeš do \`styles.css\`.

\`\`\`js
assert.match(files['styles.css'], /nav\\s*\\{/);
\`\`\`

# --seed--

## --file-- index.html

\`\`\`html
<link rel="stylesheet" href="styles.css">
<nav><a>Domů</a></nav>
\`\`\`

## --file-- styles.css

\`\`\`css
body { margin: 0; }
--edit--

--edit--
\`\`\`

# --solution--

## --file-- styles.css

\`\`\`css
body { margin: 0; }
nav { display: flex; }
\`\`\`
`;

test('parseStep: celý krok', () => {
  const s = parseStep(STEP, { id: 'a/b/001' });
  assert.equal(s.title, 'Flex kontejner');
  assert.equal(s.runtime, 'dom');
  assert.equal(s.hints.length, 2);
  assert.match(s.hints[0].test, /getComputedStyle/);
  assert.equal(s.seed.length, 2);
  assert.equal(s.seed[1].content, 'body { margin: 0; }\n');
  assert.deepEqual(s.seed[1].region, { start: 2, end: 2 });
  assert.equal(s.seed[0].region, null);
  assert.equal(s.solution.length, 2);
  assert.equal(s.solution.find((f) => f.name === 'index.html').content, s.seed[0].content);
  assert.match(s.solution.find((f) => f.name === 'styles.css').content, /display: flex/);
});

test('parseStep: chybějící test u nápovědy', () => {
  const bad = STEP.replace("```js\nassert.match(files['styles.css'], /nav\\s*\\{/);\n```", '');
  assert.throws(() => parseStep(bad, { id: 'x' }), ParseError);
});

test('parseStep: nadpis uvnitř bloku kódu se nepočítá jako sekce', () => {
  const src = STEP.replace('body { margin: 0; }\n--edit--', '# --hints--\n--edit--');
  const s = parseStep(src, { id: 'x' });
  assert.equal(s.seed[1].content.startsWith('# --hints--'), true);
});

test('parseStep: lab bez seedu, výchozí runtime', () => {
  const src = '# --description--\nUdělej to.\n\n# --hints--\nTest\n```js\nassert.ok(true)\n```\n';
  const s = parseStep(src, { id: 'lab', requireSeed: false, defaultRuntime: 'js' });
  assert.equal(s.runtime, 'js');
  assert.deepEqual(s.seed, []);
});

test('extractRegion: prázdná a neprázdná oblast', () => {
  assert.deepEqual(extractRegion('a\n--edit--\n--edit--\nb'), { content: 'a\nb', region: { start: 2, end: 1 } });
  assert.deepEqual(extractRegion('a\n--edit--\nx\ny\n--edit--'), { content: 'a\nx\ny', region: { start: 2, end: 3 } });
  assert.throws(() => extractRegion('--edit--'), ParseError);
});

const QUIZ = `---
pass: 0.5
---

## --question--

Co dělá \`justify-content\`?

### --answer--

Zarovnává na vedlejší ose.

#### --why--

To dělá \`align-items\`.

### --correct--

Zarovnává na hlavní ose.

## --question--

Které jsou flex vlastnosti?

### --correct--

\`gap\`

### --correct--

\`flex-wrap\`

### --answer--

\`float\`
`;

test('parseQuiz', () => {
  const q = parseQuiz(QUIZ, { id: 'q' });
  assert.equal(q.pass, 0.5);
  assert.equal(q.questions.length, 2);
  assert.equal(q.questions[0].answers[0].why, 'To dělá `align-items`.');
  assert.equal(q.questions[0].multiple, false);
  assert.equal(q.questions[1].multiple, true);
});

test('parseQuiz: otázka bez správné odpovědi', () => {
  assert.throws(() => parseQuiz('## --question--\nX\n### --answer--\na\n### --answer--\nb\n', { id: 'q' }), ParseError);
});

test('parseLesson: markdown, živé ukázky a otázky', () => {
  const src = `# Flexbox

Úvod.

:::live
\`\`\`html
<div class="box"></div>
\`\`\`
\`\`\`css
.box { display: flex; }
\`\`\`
:::

Pokračování.

# --questions--

## --question--
Otázka?
### --correct--
Ano
### --answer--
Ne
`;
  const l = parseLesson(src, { id: 'l' });
  assert.equal(l.blocks.length, 3);
  assert.equal(l.blocks[1].kind, 'live');
  assert.deepEqual(l.blocks[1].files.map((f) => f.name), ['index.html', 'styles.css']);
  assert.equal(l.questions.length, 1);
});
