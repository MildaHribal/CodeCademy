import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildContentIndex, loadCurriculum, loadModule, loadSectionExtras, resolveContentItem } from './content.js';
import { ParseError } from './parse.js';

/** Vytvoří dočasný adresář s obsahem podle mapy { 'cesta/soubor': 'obsah' }. */
function makeContent(tree) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-content-test-'));
  for (const [name, content] of Object.entries(tree)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

const LAB_WITHOUT_SEED = '# --description--\nNapiš funkci.\n\n# --hints--\nFunkce existuje.\n```js\nassert.ok(true)\n```\n';

test('loadModule: lab bez seedu a řešení jde načíst (kontrakt kap. 3)', (t) => {
  const dir = makeContent({
    'osnova.json': JSON.stringify({ parts: [{ id: 'p', title: 'P', sections: ['sekce'] }] }),
    'sekce/section.json': JSON.stringify({ title: 'Sekce', modules: ['lab'] }),
    'sekce/lab/module.json': JSON.stringify({ type: 'lab', title: 'Lab', runtime: 'js' }),
    'sekce/lab/lab.md': LAB_WITHOUT_SEED,
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const module = loadModule(dir, 'sekce', 'lab');
  assert.equal(module.lab.runtime, 'js');
  assert.deepEqual(module.lab.seed, []);
  assert.deepEqual(module.lab.solution, []);
});

test('loadCurriculum a loadModule odmítnou id sekce, které není slug', (t) => {
  const dir = makeContent({
    'osnova.json': JSON.stringify({ parts: [{ id: 'p', title: 'P', sections: ['../mimo'] }] }),
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.throws(() => loadCurriculum(dir), ParseError);
  assert.throws(() => loadModule(dir, '..', 'x'), ParseError);
});

const STEP = (title) => `---\ntitle: ${title}\n---\n\n# --description--\nPopis.\n\n# --hints--\nTest.\n\`\`\`js\nassert.ok(true)\n\`\`\`\n\n# --seed--\n\n## --file-- script.js\n\n\`\`\`js\n\n\`\`\`\n\n# --solution--\n\n## --file-- script.js\n\n\`\`\`js\nconst a = 1;\n\`\`\`\n`;

function indexFixture() {
  return makeContent({
    'osnova.json': JSON.stringify({
      doporucenaTrasa: ['sekce', 'dalsi'],
      parts: [{ id: 'p', title: 'P', sections: [{ id: 'sekce', uroven: 'jadro' }, { id: 'dalsi', title: 'Další', summary: 'Plán', uroven: 'rozsireni' }] }],
    }),
    'sekce/section.json': JSON.stringify({
      title: 'Sekce', modules: ['lekce', 'workshop', 'rozbity'], outcomes: [{ text: 'Umím pole', links: ['sekce/lekce#pasti'] }],
    }),
    'sekce/cards.md': '## --card--\n',
    'sekce/tahak.md': '# Tahák\n',
    'sekce/lekce/module.json': JSON.stringify({ type: 'lesson', title: 'Lekce' }),
    'sekce/lekce/lesson.md': '# Úvod do polí\n\nText.\n\n:::live js\n```js\nconsole.log(1)\n```\n:::\n\n## Pasti\n\n## Pasti\n\n# --questions--\n\n## --question--\n\nOtázka s `# nadpisem` v kódu?\n\n### --answer--\n\nNe\n\n### --correct--\n\nAno\n',
    'sekce/workshop/module.json': JSON.stringify({ type: 'workshop', title: 'Workshop', runtime: 'js' }),
    'sekce/workshop/steps/001.md': STEP('První krok'),
    'sekce/workshop/steps/002.md': STEP('Druhý krok'),
    'sekce/rozbity/module.json': JSON.stringify({ type: 'lesson', title: 'Rozbitá' }),
    'sekce/rozbity/lesson.md': '',
  });
}

test('loadCurriculum propouští uroven, outcomes a doporucenaTrasa', (t) => {
  const dir = indexFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.rmSync(path.join(dir, 'sekce', 'rozbity'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'sekce', 'section.json'), JSON.stringify({ title: 'Sekce', modules: ['lekce'], outcomes: [{ text: 'Umím pole', links: [] }] }));
  const curriculum = loadCurriculum(dir);
  assert.deepEqual(curriculum.doporucenaTrasa, ['sekce', 'dalsi']);
  const [section, planned] = curriculum.parts[0].sections;
  assert.equal(section.uroven, 'jadro');
  assert.deepEqual(section.outcomes, [{ text: 'Umím pole', links: [] }]);
  assert.equal(planned.uroven, 'rozsireni');
  assert.equal(planned.available, false);
});

test('loadCurriculum: bez doporucenaTrasa je trasa prázdná, neznámá úroveň je chyba', (t) => {
  const dir = makeContent({
    'osnova.json': JSON.stringify({ parts: [{ id: 'p', title: 'P', sections: [{ id: 'b', title: 'B' }, { id: 'a', title: 'A' }] }] }),
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.deepEqual(loadCurriculum(dir).doporucenaTrasa, []);
  fs.writeFileSync(path.join(dir, 'osnova.json'), JSON.stringify({ parts: [{ id: 'p', title: 'P', sections: [{ id: 'a', uroven: 'bonus' }] }] }));
  assert.throws(() => loadCurriculum(dir), /neznámá úroveň "bonus"/);
});

test('loadSectionExtras vrací surový text nebo null', (t) => {
  const dir = indexFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.deepEqual(loadSectionExtras(dir, 'sekce'), { cards: '## --card--\n', pojmy: null, tahak: '# Tahák\n' });
  assert.throws(() => loadSectionExtras(dir, '../x'), ParseError);
});

test('buildContentIndex: sekce, moduly, kroky, nadpisy s kotvami a chyby bez pádu', (t) => {
  const dir = indexFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const index = buildContentIndex(dir);

  assert.deepEqual(index.sections.map((s) => [s.id, s.available, s.uroven]), [['sekce', true, 'jadro'], ['dalsi', false, 'rozsireni']]);
  assert.deepEqual(index.sections[0].extras, { cards: true, pojmy: false, tahak: true });
  assert.deepEqual(index.sections[0].modules, ['sekce/lekce', 'sekce/workshop', 'sekce/rozbity']);
  assert.deepEqual(index.modules.map((m) => m.id), ['sekce/lekce', 'sekce/workshop', 'sekce/rozbity']);
  assert.deepEqual(index.modules[1].steps, ['sekce/workshop/001', 'sekce/workshop/002']);
  assert.deepEqual(index.steps.map((s) => [s.id, s.number, s.title]), [['sekce/workshop/001', 1, 'První krok'], ['sekce/workshop/002', 2, 'Druhý krok']]);
  assert.deepEqual(index.headings, [
    { moduleId: 'sekce/lekce', level: 2, text: 'Pasti', anchor: 'pasti' },
    { moduleId: 'sekce/lekce', level: 2, text: 'Pasti', anchor: 'pasti-2' },
  ]);
  assert.equal(index.errors.length, 1);
  assert.equal(index.errors[0].id, 'sekce/rozbity');
});

test('buildContentIndex: bez změny vrátí stejný objekt, po změně souboru nový', (t) => {
  const dir = indexFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const first = buildContentIndex(dir);
  assert.equal(buildContentIndex(dir), first, 'nic se nezměnilo → z mezipaměti');

  const stepFile = path.join(dir, 'sekce', 'workshop', 'steps', '002.md');
  fs.writeFileSync(stepFile, STEP('Přejmenovaný krok'));
  const future = new Date(Date.now() + 5000);
  fs.utimesSync(stepFile, future, future);
  const second = buildContentIndex(dir);
  assert.notEqual(second, first);
  assert.equal(second.steps[1].title, 'Přejmenovaný krok');

  fs.writeFileSync(path.join(dir, 'sekce', 'workshop', 'steps', '003.md'), STEP('Nový krok'));
  assert.equal(buildContentIndex(dir).steps.length, 3, 'nový soubor kroku se projeví');
});

test('resolveContentItem: krok a lab podle id, neplatné nebo chybějící id → null, rozbitý obsah vyhodí', (t) => {
  const dir = indexFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'sekce', 'lab'));
  fs.writeFileSync(path.join(dir, 'sekce', 'lab', 'module.json'), JSON.stringify({ type: 'lab', title: 'Lab', runtime: 'js' }));
  fs.writeFileSync(path.join(dir, 'sekce', 'lab', 'lab.md'), LAB_WITHOUT_SEED);

  const step = resolveContentItem(dir, 'step:sekce/workshop/002');
  assert.equal(step.type, 'step');
  assert.deepEqual(step.source, { sectionId: 'sekce', moduleId: 'sekce/workshop', title: 'Druhý krok', see: [] });
  assert.equal(step.content.stepId, 'sekce/workshop/002');
  assert.equal(step.content.runtime, 'js');
  assert.equal(step.content.hints.length, 1);
  assert.equal('description' in step.content, false, 'opakování kroku je bez popisu');
  assert.equal('solution' in step.content, false, 'a bez řešení');

  assert.equal(resolveContentItem(dir, 'step:sekce/lab').content.title, 'Lab');
  assert.equal(resolveContentItem(dir, 'step:sekce/workshop/009'), null);
  assert.equal(resolveContentItem(dir, 'step:sekce/workshop'), null, 'workshop jako celek není položka');
  assert.equal(resolveContentItem(dir, 'step:sekce/neni/001'), null);
  assert.equal(resolveContentItem(dir, 'q:sekce/lekce'), null, 'q: potřebuje klíč');
  assert.equal(resolveContentItem(dir, 'q:sekce/neni#1b4f0e98'), null);
  assert.equal(resolveContentItem(dir, 'nesmysl'), null);
  assert.equal(resolveContentItem(dir, 'step:../mimo'), null);
  assert.equal(resolveContentItem(dir, 'outcome:sekce#1b4f0e98'), null);
  assert.throws(() => resolveContentItem(dir, 'q:sekce/rozbity#1b4f0e98'), ParseError, 'rozbitý modul není osiřelá položka');
});
