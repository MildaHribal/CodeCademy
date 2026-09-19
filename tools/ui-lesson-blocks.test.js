// Testy rozhraní bloků lekce a druhů kroků v prohlížeči: sestavená aplikace + skutečný server
// nad malým obsahem z tools/fixtures/lesson-blocks-content. Data modulů, pojmů a sekce posílá
// test sám (page.route) přesně ve tvaru z kontraktu — UI se tak testuje nezávisle na parseru.
// Požadavky na nástroje jiných balíků (pokusy, poznámky, opakování) test zachytí a ověří jejich tělo.
//
// Snímky obrazovky: LESSON_BLOCKS_SHOTS=/cesta/k/adresari node --test tools/ui-lesson-blocks.test.js
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server/app.js';
import { buildClient } from './lib/build-runner.js';
import { closeServer, listenInRange } from './lib/listen.js';
import { BROWSER_ARGS } from './lib/runner-pool.js';

const CONTENT_DIR = path.join(import.meta.dirname, 'fixtures', 'lesson-blocks-content');
const PORTS = { from: 4470, to: 4479 };
const SHOTS_DIR = process.env.LESSON_BLOCKS_SHOTS ?? null;

// ——— Data ve tvaru kontraktu (kap. 2.6, 2.7, 3.2, 5.9) ———

const LESSON_MD = `Když zkopíruješ pole do druhé proměnné, **změna jedné se projeví i v druhé**. Proč?

> [!REMEMBER]
> **Proměnná neobsahuje pole, ale odkaz na něj.** Dvě proměnné můžou ukazovat na totéž pole.

Pole je [[pole|polem]] hodnot a \`const\` hlídá jen ==proměnnou==, ne obsah. Víc v části [Kopie pole](see:bloky/lekce#kopie-pole).

> [!TIP]
> V DevTools si pole rozbalíš šipkou a uvidíš indexy.`;

const LESSON = {
  id: 'bloky/lekce',
  sectionId: 'bloky',
  moduleId: 'lekce',
  type: 'lesson',
  title: 'Pole a odkazy',
  summary: '',
  minutes: 10,
  runtime: 'dom',
  lesson: {
    id: 'bloky/lekce',
    title: 'Pole a odkazy',
    headings: [
      { level: 2, text: 'Kopie pole', anchor: 'kopie-pole' },
      { level: 2, text: 'Pasti', anchor: 'pasti' },
    ],
    blocks: [
      { kind: 'md', text: '# Pole a odkazy' },
      {
        kind: 'check',
        pretest: true,
        question: {
          key: 'aaaa0001',
          type: 'choice',
          text: 'Co udělá `b.push(4)`, když `const b = a`?',
          multiple: false,
          answers: [
            { text: 'Změní jen `b`.', correct: false, why: '' },
            { text: 'Změní `a` i `b`.', correct: true, why: '' },
          ],
          see: [],
        },
      },
      { kind: 'md', text: LESSON_MD },
      {
        kind: 'live',
        runtime: 'dom',
        files: [
          { name: 'index.html', lang: 'html', content: '<div class="row"><p>1</p><p>2</p></div>' },
          { name: 'styles.css', lang: 'css', content: '.row { display: flex; justify-content: var(--justify); gap: var(--gap); }' },
        ],
        controls: [
          { name: '--justify', type: 'select', label: 'Zarovnání', options: ['flex-start', 'center', 'space-between'], default: 'flex-start' },
          { name: '--gap', type: 'range', label: 'Mezera', min: 0, max: 3, step: 0.5, unit: 'rem', default: 1 },
        ],
        predict: null,
        output: null,
      },
      { kind: 'md', text: '## Kopie pole\n\nKopii vyrobí `[...a]` nebo `a.slice()`.' },
      {
        kind: 'live',
        runtime: 'js',
        files: [{ name: 'script.js', lang: 'js', content: 'const a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);' }],
        controls: [],
        predict: { key: 'aaaa0002', type: 'text', text: 'Co vypíše `console.log`?', expected: '4', accept: [], ignoreCase: false, why: '`b` není kopie.', see: [] },
        output: null,
      },
      {
        kind: 'check',
        pretest: false,
        question: {
          key: 'aaaa0003',
          type: 'choice',
          text: 'Která zápis vyrobí kopii pole?',
          multiple: false,
          answers: [
            { text: '`const b = a`', correct: false, why: 'Myslíš si, že přiřazení kopíruje? Kopíruje jen odkaz.' },
            { text: '`const b = [...a]`', correct: true, why: 'Spread vyrobí nové pole.' },
          ],
          see: [],
        },
      },
      {
        kind: 'memory',
        code: { lang: 'js', content: 'const a = [1, 2];\nconst b = a;\nb.push(3);' },
        steps: [
          { line: 1, label: '', bindings: [{ name: 'a', value: null, ref: 'arr' }], objects: [{ id: 'arr', text: '[1, 2]', refs: [] }] },
          {
            line: 2,
            label: 'b = a nezkopíruje pole',
            bindings: [
              { name: 'a', value: null, ref: 'arr' },
              { name: 'b', value: null, ref: 'arr' },
            ],
            objects: [{ id: 'arr', text: '[1, 2]', refs: [] }],
          },
          {
            line: 3,
            label: '',
            bindings: [
              { name: 'a', value: null, ref: 'arr' },
              { name: 'b', value: null, ref: 'arr' },
            ],
            objects: [{ id: 'arr', text: '[1, 2, 3]', refs: [] }],
          },
        ],
      },
      {
        kind: 'compare',
        runtime: 'dom',
        variants: [
          {
            label: 'Normální tok',
            files: [
              { name: 'index.html', lang: 'html', content: '<div class="wrap"><div class="box">Široký box</div><div class="box">Druhý</div></div>' },
              { name: 'styles.css', lang: 'css', content: '.wrap { width: 300px; outline: 1px solid; }\n.box { width: 2000px; }\n.wrap { display: block; }' },
            ],
          },
          {
            label: 'Flexbox',
            files: [
              { name: 'index.html', lang: 'html', content: '<div class="wrap"><div class="box">Široký box</div><div class="box">Druhý</div></div>' },
              { name: 'styles.css', lang: 'css', content: '.wrap { width: 300px; outline: 1px solid; }\n.box { width: 2000px; }\n.wrap { display: flex; }' },
            ],
          },
        ],
      },
      {
        kind: 'explain',
        prompt: 'Vysvětli, proč `const` pole nezabrání `push`.',
        model: '`const` hlídá proměnnou, ne hodnotu.',
        checklist: [
          { key: 'bbbb0001', text: '`const` zakazuje nové přiřazení do proměnné.' },
          { key: 'bbbb0002', text: 'Obsah pole jde měnit dál.' },
        ],
      },
      {
        kind: 'md',
        text: '## Pasti\n\n> [!PITFALL]\n> `sort()` bez porovnávací funkce řadí čísla jako text: `[10, 9, 1].sort()` → `[1, 10, 9]`.\n\n> [!NOTE]\n> K `this` se dostaneme později.',
      },
    ],
    questions: [
      { key: 'aaaa0004', type: 'text', text: 'Kolik prvků má `[1, 2, 3]`?', expected: '3', accept: [], ignoreCase: false, why: 'Tři.', see: [] },
    ],
  },
};

const TERMS = {
  terms: [
    {
      id: 'pole',
      term: 'pole',
      en: 'array',
      aliases: ['polem', 'pole hodnot'],
      mdn: 'https://developer.mozilla.org/en-US/docs/Glossary/Array',
      lesson: 'bloky/lekce#kopie-pole',
      definition: 'Uspořádaný seznam hodnot. Proměnná drží **odkaz** na pole.',
      sectionId: 'bloky',
    },
  ],
};

const SECTION = {
  id: 'bloky',
  title: 'Bloky a druhy kroků',
  intro: '',
  outcomes: [{ key: 'cccc0001', text: 'Vysvětlíš, proč `b = a` **nezkopíruje** pole.', links: ['bloky/lekce#kopie-pole', 'bloky/workshop/002'] }],
  cheatsheet: '| metoda | mění pole |\n|---|---|\n| `push` | ano |\n| `slice` | ne |\n\n> [!PITFALL]\n> `sort()` řadí na místě.',
  terms: TERMS.terms,
  cards: [],
};

const PARSONS_STEP = {
  id: 'bloky/workshop/001',
  title: 'Seřaď součet',
  runtime: 'js',
  kind: 'parsons',
  description: 'Seřaď řádky tak, aby `sum(items)` vrátila součet.',
  hints: [{ text: '`sum([1, 2, 3])` vrátí 6.', test: "assert.equal(sum([1, 2, 3]), 6, 'sum([1, 2, 3]) má vrátit 6');" }],
  help: [],
  seed: [{ name: 'script.js', lang: 'js', content: '// součet\n\nconsole.log(sum([1, 2]));', region: { start: 2, end: 1 } }],
  explain: null,
  parsons: {
    file: 'script.js',
    indentUnit: 2,
    lines: [
      { text: 'function sum(items) {', indent: 0 },
      { text: 'return items.reduce((total, n) => total + n, __1__);', indent: 1 },
      { text: '}', indent: 0 },
    ],
    distractors: ['return total;'],
    blanks: [{ number: 1, accept: ['0'] }],
  },
  approaches: [],
  review: null,
  see: [],
  meta: { kind: 'parsons' },
};

const DEBUG_STEP = {
  id: 'bloky/workshop/002',
  title: 'Kolegův double',
  runtime: 'js',
  kind: 'debug',
  description: '## Hlášení\n\n`double([1, 2])` vrací `[1, 2]`.\n\n## Úkol\n\nOprav `double`.',
  hints: [
    { text: '`double([1, 2])` vrátí `[2, 4]`.', test: "assert.deepEqual(double([1, 2]), [2, 4], 'double([1, 2]) má vrátit [2, 4]');" },
  ],
  help: [],
  seed: [
    {
      name: 'script.js',
      lang: 'js',
      content: 'function double(items) {\n  const out = [];\n  for (const n of items) {\n    out.push(n);\n  }\n  return out;\n}',
      region: null,
    },
  ],
  explain: {
    prompt: 'Vysvětli, co bylo špatně.',
    model: 'Do pole se přidávalo `n` místo `n * 2`.',
    checklist: [{ key: 'dddd0001', text: 'Chyběl násobek.' }],
  },
  parsons: null,
  approaches: [],
  review: null,
  see: ['bloky/lekce#pasti'],
  meta: { kind: 'debug' },
};

const DEBUG_SOLUTION = [{ name: 'script.js', lang: 'js', content: DEBUG_STEP.seed[0].content.replace('out.push(n)', 'out.push(n * 2)') }];

const RECALL_STEP = {
  ...DEBUG_STEP,
  id: 'bloky/workshop/003',
  title: 'Sčítání zpaměti',
  kind: 'recall',
  description: 'Napiš `add(a, b)`.',
  hints: [{ text: '`add(1, 2)` vrátí 3.', test: "assert.equal(add(1, 2), 3, 'add(1, 2) má vrátit 3');" }],
  seed: [{ name: 'script.js', lang: 'js', content: '', region: null }],
  explain: null,
  meta: { kind: 'recall' },
};

const WORKSHOP = {
  id: 'bloky/workshop',
  sectionId: 'bloky',
  moduleId: 'workshop',
  type: 'workshop',
  title: 'Druhy kroků',
  summary: '',
  minutes: 10,
  runtime: 'js',
  steps: [PARSONS_STEP, DEBUG_STEP, RECALL_STEP],
};

const LAB = {
  id: 'bloky/lab',
  sectionId: 'bloky',
  moduleId: 'lab',
  type: 'lab',
  title: 'Průměr známek',
  summary: '',
  minutes: 20,
  runtime: 'js',
  lab: {
    ...RECALL_STEP,
    id: 'bloky/lab',
    title: 'Průměr známek',
    kind: 'step',
    description: 'Napiš `average(grades)`.',
    hints: [{ text: '`average([1, 3])` vrátí 2.', test: "assert.equal(average([1, 3]), 2, 'average([1, 3]) má vrátit 2');" }],
    seed: [{ name: 'script.js', lang: 'js', content: '/** @param {number[]} grades */\nfunction average(grades) {}\n', region: null }],
    review: { intro: 'Testy kontrolují chování.', rubric: [{ key: 'eeee0001', text: 'Jména říkají, co dělají.' }], extensions: 'Zaokrouhli průměr na jedno desetinné místo.' },
    meta: {},
  },
};

const LAB_APPROACHES = [
  { title: 'Cyklus for…of', description: 'Nejčitelnější.', files: [{ name: 'script.js', lang: 'js', content: 'function average(grades) {\n  let sum = 0;\n  for (const g of grades) sum += g;\n  return sum / grades.length;\n}' }] },
  { title: 'reduce', description: 'Kratší.', files: [{ name: 'script.js', lang: 'js', content: 'const average = (g) => g.reduce((a, b) => a + b, 0) / g.length;' }] },
];

describe('rozhraní bloků lekce a druhů kroků', () => {
  let workDir;
  let server;
  let browser;
  let baseUrl;

  before(async () => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-lesson-blocks-'));
    const distDir = path.join(workDir, 'dist');
    await buildClient(distDir);
    server = createApp({
      contentDir: CONTENT_DIR,
      dataDir: path.join(workDir, 'data'),
      projectsDir: path.join(workDir, 'moje-projekty'),
      distDir,
    });
    baseUrl = `http://127.0.0.1:${await listenInRange(server, PORTS)}`;
    browser = await chromium.launch({ args: BROWSER_ARGS });
    if (SHOTS_DIR) fs.mkdirSync(SHOTS_DIR, { recursive: true });
  });

  after(async () => {
    await browser?.close();
    if (server) await closeServer(server);
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  /** Otevře stránku s podvrženými daty modulů; `sent` sbírá těla požadavků na cizí nástroje. */
  async function openPage(hash, { colorScheme = 'light', viewport = { width: 1400, height: 900 } } = {}) {
    const page = await browser.newPage({ viewport, colorScheme });
    const sent = [];
    const json = (route, body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    await page.route(/\/api\/module\/bloky\/(lekce|workshop|lab)(\?.*)?$/, (route) => {
      const url = new URL(route.request().url());
      const name = url.pathname.split('/').pop();
      const withSolutions = url.searchParams.get('solution') === '1';
      if (name === 'lekce') return json(route, LESSON);
      if (name === 'workshop') {
        const steps = withSolutions ? WORKSHOP.steps.map((s) => (s.id === DEBUG_STEP.id ? { ...s, solution: DEBUG_SOLUTION } : s)) : WORKSHOP.steps;
        return json(route, { ...WORKSHOP, steps });
      }
      return json(route, withSolutions ? { ...LAB, lab: { ...LAB.lab, approaches: LAB_APPROACHES } } : LAB);
    });
    await page.route('**/api/terms', (route) => json(route, TERMS));
    await page.route('**/api/section/bloky', (route) => json(route, SECTION));
    await page.route(/\/api\/(attempts|reviews\/add|notes\/bloky\/append)$/, (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      sent.push({ path: new URL(route.request().url()).pathname, body: route.request().postDataJSON() });
      return json(route, { ok: true });
    });
    await page.goto(`${baseUrl}/${hash}`);
    return { page, sent };
  }

  async function shot(page, name, locator = null) {
    if (!SHOTS_DIR) return;
    const file = path.join(SHOTS_DIR, `${name}.png`);
    if (locator) await locator.screenshot({ path: file });
    else await page.screenshot({ path: file, fullPage: true });
  }

  test('výklad: rámečky, tučné, ==mark==, pojem s bublinou a odkaz see:', async () => {
    const { page } = await openPage('#/modul/bloky/lekce');
    try {
      const callouts = page.locator('.lesson__text .callout');
      await callouts.first().waitFor();
      assert.deepEqual(await callouts.evaluateAll((els) => els.map((el) => el.dataset.callout)), ['remember', 'tip', 'pitfall', 'note']);
      assert.equal(await page.locator('.callout--pitfall .callout__title').innerText(), 'Pozor, past');

      // Barvy jdou z tokenů: tučné v textu má barvu --text-strong-accent.
      const colors = await page.evaluate(() => {
        const root = getComputedStyle(document.documentElement);
        const probe = document.createElement('span');
        probe.style.color = root.getPropertyValue('--text-strong-accent');
        document.body.append(probe);
        const expected = getComputedStyle(probe).color;
        probe.remove();
        return { expected, actual: getComputedStyle(document.querySelector('.lesson__text > p strong')).color };
      });
      assert.equal(colors.actual, colors.expected);
      assert.equal(await page.locator('.lesson__text mark.mark').innerText(), 'proměnnou');

      const seeLink = page.locator('.lesson__text a.see-link');
      assert.equal(await seeLink.getAttribute('href'), '#/modul/bloky/lekce?kotva=kopie-pole');

      const term = page.locator('button.term', { hasText: 'polem' });
      await term.click();
      const popover = page.locator('.term-popover');
      await popover.waitFor();
      assert.match(await popover.innerText(), /pole[\s\S]*anglicky array[\s\S]*Uspořádaný seznam hodnot/);
      assert.equal(await popover.locator('a', { hasText: 'Vysvětlení v lekci' }).getAttribute('href'), '#/modul/bloky/lekce?kotva=kopie-pole');
      await shot(page, 'pojem-bublina', page.locator('.lesson__text').first());
      await page.keyboard.press('Escape');
      await popover.waitFor({ state: 'detached' });
      assert.equal(await term.evaluate((el) => document.activeElement === el), true, 'fokus se vrátí na pojem');
    } finally {
      await page.close();
    }
  });

  test('lekce ze skutečného parseru: všechny bloky se vykreslí bez upozornění', async () => {
    const { page } = await openPage('#/modul/bloky/lekce-parser');
    try {
      await page.locator('.memory__position').waitFor();
      const kinds = await page.evaluate(() => [...document.querySelectorAll('[data-block]')].map((el) => el.dataset.block));
      assert.deepEqual(kinds, ['check', 'live', 'live', 'memory', 'compare', 'explain']);
      assert.equal(await page.locator('.notice').count(), 0, 'žádný blok nehlásí, že ho aplikace neumí');
      assert.equal(await page.locator('.callout--pitfall').count(), 1);
      assert.equal(await page.locator('h1').count(), 1, 'titulek lekce jen jednou');
      assert.equal(await page.locator('.live--controls .live-controls__css').innerText(), '.a { gap: 1rem; }');
    } finally {
      await page.close();
    }
  });

  test('?kotva= odscrolluje na nadpis', async () => {
    const { page } = await openPage('#/modul/bloky/lekce?kotva=pasti', { viewport: { width: 1200, height: 700 } });
    try {
      const heading = page.locator('h2[data-anchor="pasti"]');
      await heading.waitFor();
      await page.waitForFunction(() => {
        const top = document.querySelector('h2[data-anchor="pasti"]').getBoundingClientRect().top;
        return top >= -2 && top < 200;
      });
      assert.equal(await heading.getAttribute('id'), 'pasti');
    } finally {
      await page.close();
    }
  });

  test('pretest se nehodnotí, :::check a otázky na konci podmiňují splnění lekce', async () => {
    const { page, sent } = await openPage('#/modul/bloky/lekce');
    try {
      const pretest = page.locator('.lesson-check--pretest');
      await pretest.locator('.answer', { hasText: 'Změní jen' }).click();
      await pretest.getByRole('button', { name: /Check|Zkontrolovat/ }).click();
      await pretest.locator('.question__verdict', { hasText: 'Uvidíme za chvíli' }).waitFor();

      // Mám přečteno bez vyřešených otázek řekne, co chybí.
      await page.getByRole('button', { name: /Mark as read|Mám přečteno/ }).click();
      const unmet = page.locator('.lesson__unmet');
      await unmet.waitFor();
      assert.match(await unmet.innerText(), /kontrolní otázka 1[\s\S]*otázka 1 na konci/);

      const check = page.locator('.lesson-check:not(.lesson-check--pretest)');
      await check.locator('.answer', { hasText: '[...a]' }).click();
      await check.getByRole('button', { name: /Check|Zkontrolovat/ }).click();
      await check.locator('.question__verdict', { hasText: 'Správně' }).waitFor();

      const last = page.locator('.lesson__finish .question');
      await last.locator('input, textarea').first().fill('3');
      await last.getByRole('button', { name: /Check|Zkontrolovat/ }).click();
      await last.locator('.question__verdict', { hasText: 'Správně' }).waitFor();

      await page.getByRole('button', { name: /Mark as read|Mám přečteno/ }).click();
      await page.locator('.lesson__status[data-kind="pass"]', { hasText: 'Lekce je splněná' }).waitFor();

      const attemptIds = sent.filter((r) => r.path === '/api/attempts').map((r) => r.body.id);
      assert.ok(attemptIds.includes('q:bloky/lekce#aaaa0003'), `pokus :::check: ${attemptIds}`);
      assert.ok(attemptIds.includes('q:bloky/lekce#aaaa0004'), `pokus otázky na konci: ${attemptIds}`);
      assert.ok(!attemptIds.includes('q:bloky/lekce#aaaa0001'), 'pretest se neposílá');
    } finally {
      await page.close();
    }
  });

  test('předpověď: výsledek je skrytý do tipu, pak tip vedle skutečné konzole', async () => {
    const { page, sent } = await openPage('#/modul/bloky/lekce');
    try {
      const predict = page.locator('.live--predict');
      await predict.waitFor();
      assert.equal(await predict.locator('.live__console').count(), 0, 'konzole před tipem není');
      assert.equal(await predict.locator('.live__placeholder').isVisible(), true);

      await predict.locator('.live__question input, .live__question textarea').first().fill('4');
      await predict.getByRole('button', { name: /Check|Zkontrolovat/ }).click();
      await predict.locator('.live__tip-text', { hasText: '4' }).waitFor();
      await predict.locator('.live__console .console__entry', { hasText: '4' }).waitFor({ timeout: 10000 });
      assert.equal(await predict.getAttribute('data-revealed'), 'true');
      assert.equal(sent.filter((r) => r.path === '/api/attempts').length, 0, 'předpověď se nikam neposílá');
    } finally {
      await page.close();
    }
  });

  test('ovládací prvky: změna hodnoty přepíše CSS s dosazenou hodnotou i náhled', async () => {
    const { page } = await openPage('#/modul/bloky/lekce');
    try {
      const live = page.locator('.live--controls');
      await live.waitFor();
      const css = live.locator('.live-controls__css');
      assert.match(await css.innerText(), /justify-content: flex-start;[\s\S]*gap: 1rem;/);
      await live.getByLabel('Zarovnání').selectOption('center');
      await css.locator('.live-controls__resolved', { hasText: 'center' }).waitFor();
      // Náhled: hodnota custom property v iframu (setCssVariables nebo nové spuštění s :root).
      const frameHandle = await live.locator('iframe').elementHandle();
      const frame = await frameHandle.contentFrame();
      await frame.waitForFunction(() => getComputedStyle(document.querySelector('.row')).justifyContent === 'center', null, { timeout: 5000 });
    } finally {
      await page.close();
    }
  });

  test('stavy paměti krokují šipkami, porovnání má dva náhledy, vysvětli uloží poznámku a opakování', async () => {
    const { page, sent } = await openPage('#/modul/bloky/lekce');
    try {
      const memory = page.locator('.memory');
      await memory.locator('.memory__position', { hasText: 'Krok 1 z 3' }).waitFor();
      await memory.focus();
      await page.keyboard.press('ArrowRight');
      await memory.locator('.memory__position', { hasText: 'Krok 2 z 3' }).waitFor();
      assert.equal(await memory.locator('.memory__line.is-current').getAttribute('data-line'), '2');
      assert.equal(await memory.locator('.memory__arrows path[marker-end]').count(), 2);
      assert.equal(await memory.locator('.memory__binding.is-changed').getAttribute('data-name'), 'b');

      const compare = page.locator('.compare');
      assert.equal(await compare.locator('iframe').count(), 2);
      const labels = await compare.locator('.compare__label').allInnerTexts();
      assert.match(labels[0], /Normální tok/);
      assert.match(labels[1], /Flexbox/);
      assert.match(await compare.locator('.compare__own').first().innerText(), /display: block/);

      const explain = page.locator('.lesson-explain');
      await explain.locator('textarea').fill('const hlídá jen proměnnou.');
      await explain.getByRole('button', { name: /Compare with model|Porovnat se vzorem/ }).click();
      await explain.locator('.explain__model').waitFor();
      await explain.locator('.explain__point', { hasText: 'nové přiřazení' }).locator('input').check();
      await explain.getByRole('button', { name: /Save|Uložit/ }).click();
      await explain.locator('.explain__status', { hasText: 'Jeden bod se ti vrátí' }).waitFor();

      const note = sent.find((r) => r.path === '/api/notes/bloky/append');
      assert.deepEqual({ ...note.body, title: undefined }, { kind: 'explain', source: 'bloky/lekce', title: undefined, text: 'const hlídá jen proměnnou.' });
      assert.deepEqual(sent.filter((r) => r.path === '/api/reviews/add').map((r) => r.body), [{ id: 'explain:bloky/lekce#bbbb0002', reason: 'explain' }]);
    } finally {
      await page.close();
    }
  });

  test('Seřaď řádky: klávesnicí poskládané řešení projde kontrolou', async () => {
    const { page } = await openPage('#/modul/bloky/workshop/001');
    try {
      await page.locator('.kind-label--parsons').waitFor();
      const pool = page.locator('.parsons__column:not(.parsons__column--solution) .parsons__line');
      for (const [text, indent] of [['function sum', 0], ['return items.reduce', 1], ['}', 0]]) {
        const line = pool.filter({ hasText: text }).filter({ hasNotText: text === '}' ? 'function' : '@@' }).first();
        await line.focus();
        await page.keyboard.press('Enter');
        for (let i = 0; i < indent; i++) await page.keyboard.press('Tab');
      }
      const solution = page.locator('.parsons__list--solution .parsons__line');
      assert.equal(await solution.count(), 3);
      await solution.nth(1).locator('.parsons__blank').fill('0');
      await page.locator('.pane--brief').getByRole('button', { name: /Check|Zkontrolovat/ }).click();
      await page.locator('.pane--brief .result[data-kind="pass"]').waitFor({ timeout: 15000 });

      // Posun řádku šipkou a špatné odsazení se jen označí.
      await solution.nth(2).focus();
      await page.keyboard.press('Tab');
      await page.locator('.pane--brief').getByRole('button', { name: /Check|Zkontrolovat/ }).click();
      await page.locator('.parsons__line.is-indent-wrong').waitFor({ timeout: 15000 });

      // Rozpracované pořadí se uloží a po znovuotevření kroku se obnoví.
      await page.locator('.app-bar__status[data-state="saved"]').waitFor({ timeout: 5000 });
      await page.reload();
      await page.locator('.parsons__list--solution .parsons__line').first().waitFor();
      assert.equal(await page.locator('.parsons__list--solution .parsons__line').count(), 3);
      assert.equal(await page.locator('.parsons__list--solution .parsons__blank').inputValue(), '0');
    } finally {
      await page.close();
    }
  });

  test('oprava chyby: štítek, čtyři kroky ladění a varování při přepsání většiny kódu', async () => {
    const { page } = await openPage('#/modul/bloky/workshop/002');
    try {
      await page.locator('.kind-label--debug', { hasText: 'Oprava chyby' }).waitFor();
      assert.equal(await page.locator('.debug-steps li').count(), 4);
      await page.locator('.pane--editor .cm-content').click();
      await page.keyboard.press('Control+A');
      await page.keyboard.insertText('const double = (items) => items.map((n) => n * 2);');
      await page.keyboard.press('Control+Enter');
      await page.locator('.pane--brief .result[data-kind="pass"]').waitFor({ timeout: 15000 });
      await page.locator('.debug-change', { hasText: 'Přepsal jsi víc než polovinu kódu' }).waitFor();
      // Po splnění se nabídne vysvětlení vlastními slovy.
      await page.locator('.step-explain textarea').waitFor();
    } finally {
      await page.close();
    }
  });

  test('lab: Než začneš uloží plán, jiné přístupy před splněním jen s potvrzením, rubrika', async () => {
    const { page, sent } = await openPage('#/modul/bloky/lab');
    try {
      const plan = page.locator('.plan');
      await plan.waitFor();
      await plan.locator('.plan__summary').click();
      await plan.getByLabel('Zadání vlastními slovy').fill('Spočítat průměr.');
      await plan.getByRole('button', { name: /Save plan to notes|Uložit plán do poznámek/ }).click();
      await plan.locator('.plan__status', { hasText: 'Plán je v poznámkách' }).waitFor();
      const planNote = sent.find((r) => r.path === '/api/notes/bloky/append');
      assert.equal(planNote.body.kind, 'plan');
      assert.equal(planNote.body.source, 'bloky/lab');

      assert.equal(await page.locator('.review .review__point').count(), 1);
      const open = page.getByRole('button', { name: /Show other approaches \(2\)|Ukázat jiné přístupy \(2\)/ });
      await open.waitFor();
      const dialogs = [];
      page.once('dialog', (dialog) => {
        dialogs.push(dialog.message());
        dialog.accept();
      });
      await open.click();
      await page.locator('.approach__title', { hasText: 'reduce' }).waitFor();
      assert.match(dialogs[0] ?? '', /Lab ještě nemáš splněný/);
      assert.ok(sent.some((r) => r.path === '/api/attempts' && r.body.id === 'bloky/lab' && r.body.solutionViewed === true));
    } finally {
      await page.close();
    }
  });

  test('stránka sekce: Po sekci umíš, tahák a pojmy', async () => {
    const { page } = await openPage('#/sekce/bloky');
    try {
      const outcomes = page.locator('.section-outcomes');
      await outcomes.waitFor();
      // Odkaz s kotvou dostane po načtení lekce i text nadpisu (dva odkazy do jedné lekce se tak liší).
      await outcomes.locator('.section-outcomes__links a', { hasText: '›' }).waitFor();
      assert.deepEqual(await outcomes.locator('.section-outcomes__links a').evaluateAll((els) => els.map((a) => [a.textContent, a.getAttribute('href')])), [
        ['Pole a odkazy › Kopie pole', '#/modul/bloky/lekce?kotva=kopie-pole'],
        ['Druhy kroků, krok 2', '#/modul/bloky/workshop/002'],
      ]);
      await page.locator('.cheatsheet summary').click();
      await page.locator('.cheatsheet__content table').waitFor();
      await page.locator('.section-terms summary').click();
      assert.match(await page.locator('.section-terms__term').innerText(), /pole\s*array/);
    } finally {
      await page.close();
    }
  });

  test('snímky lekce ve světlém a tmavém motivu', { skip: !SHOTS_DIR }, async () => {
    for (const colorScheme of ['light', 'dark']) {
      const { page } = await openPage('#/modul/bloky/lekce', { colorScheme, viewport: { width: 1280, height: 900 } });
      try {
        await page.locator('.memory__arrows path[marker-end]').first().waitFor();
        await page.locator('button.term').first().waitFor();
        await page.waitForTimeout(800);
        await shot(page, `lekce-${colorScheme}`);
        await shot(page, `vyklad-${colorScheme}`, page.locator('.lesson__text').first());
        await shot(page, `pasti-${colorScheme}`, page.locator('.lesson__text').last());
        await shot(page, `pamet-${colorScheme}`, page.locator('.memory'));
        await page.locator('.memory').focus();
        await page.keyboard.press('ArrowRight');
        await shot(page, `pamet-krok2-${colorScheme}`, page.locator('.memory'));
        await shot(page, `ovladani-${colorScheme}`, page.locator('.live--controls'));
        await shot(page, `porovnani-${colorScheme}`, page.locator('.compare'));
        const predict = page.locator('.live--predict');
        await predict.locator('.live__question input').fill('3');
        await predict.getByRole('button', { name: /Check|Zkontrolovat/ }).click();
        await predict.locator('.live__console .console__entry').first().waitFor();
        await shot(page, `predpoved-${colorScheme}`, predict);
        await page.locator('.lesson-check--pretest').scrollIntoViewIfNeeded();
        await shot(page, `pretest-${colorScheme}`, page.locator('.lesson-check--pretest'));
      } finally {
        await page.close();
      }
    }
    for (const colorScheme of ['light', 'dark']) {
      const { page } = await openPage('#/modul/bloky/workshop/001', { colorScheme, viewport: { width: 1400, height: 800 } });
      try {
        await page.locator('.parsons__line').first().waitFor();
        await shot(page, `parsons-${colorScheme}`);
      } finally {
        await page.close();
      }
    }
    for (const colorScheme of ['light', 'dark']) {
      const { page } = await openPage('#/sekce/bloky', { colorScheme, viewport: { width: 1280, height: 900 } });
      try {
        await page.locator('.section-outcomes').waitFor();
        await page.locator('.cheatsheet summary').click();
        await page.locator('.section-terms summary').click();
        await shot(page, `sekce-${colorScheme}`);
      } finally {
        await page.close();
      }
      const lab = await openPage('#/modul/bloky/lab', { colorScheme, viewport: { width: 1400, height: 1100 } });
      try {
        await lab.page.locator('.plan').waitFor();
        await lab.page.locator('.review').waitFor();
        await shot(lab.page, `lab-${colorScheme}`, lab.page.locator('.pane--brief'));
      } finally {
        await lab.page.close();
      }
    }
  });
});
