// Výpočty bloků lekce a druhů kroků bez prohlížeče: markdown (rámečky, ==mark==, pojmy),
// ovládací prvky, :::compare, :::memory, Seřaď řádky, míra změny u opravy chyby, popisky sekce.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { markdownToHtml } from '../client/src/markdown.js';
import {
  composeVariant,
  consoleOutputText,
  controlCssValue,
  controlledDeclarations,
  cssVariablesPrelude,
  defaultControlValues,
  resolveVariables,
  splitCompareVariants,
  withVariablesPrelude,
} from '../client/src/lesson/blocks/live-logic.js';
import { changedInStep, splitObjectText } from '../client/src/lesson/blocks/memory-logic.js';
import {
  assembleFiles,
  createItems,
  indentMismatches,
  initialPool,
  lineSegments,
  moveInList,
  renderLine,
  restoreState,
} from '../client/src/extensions/step-kinds/parsons-logic.js';
import { changeWarning, debugChangeRatio } from '../client/src/extensions/step-kinds/change-ratio.js';
import { planNoteText } from '../client/src/extensions/step-kinds/plan.js';
import { outcomeLinkLabel } from '../client/src/extensions/sections/labels.js';

describe('markdown: zvýraznění ve výkladu (kontrakt kap. 5.11)', () => {
  test('rámeček [!PITFALL] má nadpis, třídu typu a obsah včetně kódu', () => {
    const html = markdownToHtml('> [!PITFALL]\n> `sort()` řadí **text**:\n>\n> ```js\n> [10, 9, 1].sort()\n> ```');
    assert.match(html, /<aside class="callout callout--pitfall" data-callout="pitfall">/);
    assert.match(html, /<span>Pozor, past<\/span>/);
    assert.match(html, /<code>sort\(\)<\/code> řadí <strong>text<\/strong>/);
    assert.match(html, /<pre><code class="language-js">\[10, 9, 1\]\.sort\(\)/);
  });

  test('všechny čtyři typy a vlastní nadpis', () => {
    for (const [type, title] of [['REMEMBER', 'Zapamatuj si'], ['PITFALL', 'Pozor, past'], ['TIP', 'Tip'], ['NOTE', 'Poznámka']]) {
      assert.match(markdownToHtml(`> [!${type}]\n> Text.`), new RegExp(`callout--${type.toLowerCase()}.*<span>${title}</span>`, 's'));
    }
    assert.match(markdownToHtml('> [!TIP] DevTools a *osy*\n> Text.'), /<span>DevTools a <em>osy<\/em><\/span>/);
  });

  test('neznámý typ a obyčejná citace zůstanou citací; v bloku kódu se nic nehledá', () => {
    assert.match(markdownToHtml('> [!WARNING]\n> Text.'), /^<blockquote>/);
    assert.doesNotMatch(markdownToHtml('> Jen citace.'), /callout/);
    const inCode = markdownToHtml('```md\n> [!NOTE]\n> ==ne== [[ne]]\n```');
    assert.doesNotMatch(inCode, /callout|<mark|class="term"/);
  });

  test('==zvýraznění== jen mimo inline kód a ne u operátorů', () => {
    assert.match(markdownToHtml('Tady ==hlavní osa== se mění.'), /<mark class="mark">hlavní osa<\/mark>/);
    assert.doesNotMatch(markdownToHtml('Porovnej `a == b` a a === b.'), /<mark/);
    assert.doesNotMatch(markdownToHtml('Porovnání a == b == c.'), /<mark/);
  });

  test('[[pojem|text]] a [[pojem]]: klíč vyhledání přes termLookupKey, zobrazený text', () => {
    const html = markdownToHtml('Na [[Hlavní  osa|hlavní ose]] a [[flex kontejner]].');
    assert.match(html, /<span class="term" data-term="hlavní osa">hlavní ose<\/span>/);
    assert.match(html, /<span class="term" data-term="flex kontejner">flex kontejner<\/span>/);
    assert.doesNotMatch(markdownToHtml('Kód `[[x]]`.'), /class="term"/);
  });

  test('odkaz see: projde markdownem beze změny (adresu přepíše UI)', () => {
    assert.match(markdownToHtml('[kopie](see:js-pole/co-je-pole#kopie-pole)'), /href="see:js-pole\/co-je-pole#kopie-pole"/);
  });
});

describe('živá ukázka: ovládací prvky (kontrakt kap. 5.2)', () => {
  const controls = [
    { name: '--justify', type: 'select', label: 'Zarovnání', options: ['flex-start', 'center', 'space-between'], default: 'flex-start' },
    { name: '--gap', type: 'range', label: 'Mezera', min: 0, max: 3, step: 0.5, unit: 'rem', default: 1 },
    { name: '--wrap', type: 'toggle', label: 'Zalomení', options: ['nowrap', 'wrap'], default: 'nowrap' },
  ];

  test('hodnoty: range s jednotkou, select a toggle jako možnost', () => {
    assert.equal(controlCssValue(controls[1], '2.5'), '2.5rem');
    assert.equal(controlCssValue(controls[0], 'center'), 'center');
    assert.deepEqual(defaultControlValues(controls), { '--justify': 'flex-start', '--gap': '1rem', '--wrap': 'nowrap' });
  });

  test('předřazení :root do styles.css (soubor vznikne, když chybí)', () => {
    const values = { '--gap': '1rem' };
    assert.equal(cssVariablesPrelude(values), ':root { --gap: 1rem; }\n');
    const files = [{ name: 'index.html', lang: 'html', content: '<p>x</p>' }, { name: 'styles.css', lang: 'css', content: '.row { gap: var(--gap); }' }];
    assert.equal(withVariablesPrelude(files, values)[1].content, ':root { --gap: 1rem; }\n.row { gap: var(--gap); }');
    assert.equal(files[1].content, '.row { gap: var(--gap); }', 'původní soubory se nemění');
    assert.deepEqual(withVariablesPrelude([files[0]], values).map((f) => f.name), ['index.html', 'styles.css']);
  });

  test('deklarace s dosazenou hodnotou, i uvnitř @media a s fallbackem', () => {
    const css = `/* var(--gap) v komentáři */
.row { display: flex; justify-content: var(--justify); gap: var(--gap, 2px); }
@media (min-width: 40em) {
  .row { flex-wrap: var(--wrap); }
}
.other { color: red; }`;
    const values = { '--justify': 'center', '--gap': '1.5rem', '--wrap': 'wrap' };
    assert.deepEqual(
      controlledDeclarations(css, values).map((d) => `${d.selector} ${d.property}: ${d.resolved}`),
      ['.row justify-content: center', '.row gap: 1.5rem', '.row flex-wrap: wrap'],
    );
    assert.equal(resolveVariables('calc(var(--gap) * 2) var(--jina)', values), 'calc(1.5rem * 2) var(--jina)');
    assert.deepEqual(controlledDeclarations('.a { margin: var(--gapx); }', { '--gap': '1px' }), [], '--gapx není --gap');
  });
});

describe(':::compare — společný kód a varianty (kontrakt kap. 5.7)', () => {
  const variants = [
    {
      label: 'Normální tok',
      files: [
        { name: 'index.html', lang: 'html', content: '<div class="wrap"></div>' },
        { name: 'styles.css', lang: 'css', content: '.wrap { width: 300px; }\n.box { width: 2000px; }\n.wrap { display: block; }' },
      ],
    },
    {
      label: 'Flexbox',
      files: [
        { name: 'index.html', lang: 'html', content: '<div class="wrap"></div>' },
        { name: 'styles.css', lang: 'css', content: '.wrap { width: 300px; }\n.box { width: 2000px; }\n.wrap { display: flex; }' },
        { name: 'script.js', lang: 'js', content: 'console.log(1);' },
      ],
    },
  ];

  test('rozdělí sloučené soubory a složí je zpátky beze změny', () => {
    const { common, extras } = splitCompareVariants(variants);
    assert.deepEqual(common.map((f) => [f.name, f.content]), [
      ['index.html', '<div class="wrap"></div>'],
      ['styles.css', '.wrap { width: 300px; }\n.box { width: 2000px; }'],
    ]);
    assert.deepEqual(extras[0].map((f) => [f.name, f.content]), [['styles.css', '.wrap { display: block; }']]);
    assert.deepEqual(extras[1].map((f) => [f.name, f.content]), [['styles.css', '.wrap { display: flex; }'], ['script.js', 'console.log(1);']]);
    variants.forEach((variant, index) => {
      const composed = composeVariant(common, extras[index]);
      for (const file of variant.files) assert.equal(composed.find((f) => f.name === file.name)?.content, file.content);
    });
  });

  test('úprava společné části se promítne do obou variant', () => {
    const { common, extras } = splitCompareVariants(variants);
    const edited = common.map((f) => (f.name === 'styles.css' ? { ...f, content: '.wrap { width: 200px; }' } : f));
    assert.equal(composeVariant(edited, extras[1]).find((f) => f.name === 'styles.css').content, '.wrap { width: 200px; }\n.wrap { display: flex; }');
  });

  test('výstup předpovědi js = texty konzole po řádcích', () => {
    assert.equal(consoleOutputText([{ level: 'clear', text: '' }, { level: 'log', text: '4' }, { level: 'warn', text: 'x' }]), '4\nx');
  });
});

describe(':::memory (kontrakt kap. 5.6)', () => {
  test('zápis objektu s odkazy', () => {
    assert.deepEqual(splitObjectText("{ name: 'Ema', tags: @tags }"), [{ text: "{ name: 'Ema', tags: " }, { ref: 'tags' }, { text: ' }' }]);
  });

  test('změny mezi kroky', () => {
    const one = { bindings: [{ name: 'a', value: null, ref: 'arr' }], objects: [{ id: 'arr', text: '[1, 2]', refs: [] }] };
    const two = { bindings: [{ name: 'a', value: null, ref: 'arr' }, { name: 'b', value: null, ref: 'arr' }], objects: [{ id: 'arr', text: '[1, 2]', refs: [] }] };
    const three = { bindings: two.bindings, objects: [{ id: 'arr', text: '[1, 2, 3]', refs: [] }] };
    assert.deepEqual([...changedInStep(undefined, one).bindings], ['a']);
    assert.deepEqual([...changedInStep(one, two).bindings], ['b']);
    assert.deepEqual([...changedInStep(one, two).objects], []);
    assert.deepEqual([...changedInStep(two, three).objects], ['arr']);
  });
});

describe('Seřaď řádky (kontrakt kap. 3.5)', () => {
  const parsons = {
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
    distractors: ['return counts + 1;'],
    blanks: [{ number: 1, accept: ['{}', 'Object.create(null)'] }],
  };
  const seed = [
    { name: 'index.html', lang: 'html', content: '<p></p>', region: null },
    { name: 'script.js', lang: 'js', content: '// data\n\nconsole.log(countByCategory([]));', region: { start: 2, end: 1 } },
  ];
  const items = createItems(parsons);

  test('položky, zamíchání podle klíče a mezery v řádku', () => {
    assert.equal(items.length, 7);
    assert.equal(items[6].distractor, true);
    assert.deepEqual(initialPool(items, 'krok/001'), initialPool(items, 'krok/001'));
    assert.deepEqual([...initialPool(items, 'krok/001')].sort(), items.map((i) => i.id).sort());
    assert.deepEqual(lineSegments('}, __1__);'), [{ text: '}, ' }, { blank: 1 }, { text: ');' }]);
    assert.equal(renderLine(items[4], 1, 2, { 1: '{}' }), '  }, {});');
  });

  test('poskládaný soubor = kontext seedu + řádky s odsazením; jiné soubory beze změny', () => {
    const placed = parsons.lines.map((line, index) => ({ id: `line-${index}`, indent: line.indent }));
    const files = assembleFiles({ seed, parsons, items, placed, blanks: { 'line-4': { 1: '{}' } } });
    assert.equal(files[0].content, '<p></p>');
    assert.equal(
      files[1].content,
      '// data\nfunction countByCategory(items) {\n  return items.reduce((counts, item) => {\n    counts[item.category] = (counts[item.category] ?? 0) + 1;\n    return counts;\n  }, {});\n}\n\nconsole.log(countByCategory([]));',
    );
  });

  test('obnovení z uloženého souboru i s mezerou; změněný kontext = null', () => {
    const placed = [{ id: 'line-0', indent: 0 }, { id: 'extra-0', indent: 3 }, { id: 'line-4', indent: 1 }];
    const files = assembleFiles({ seed, parsons, items, placed, blanks: { 'line-4': { 1: 'Object.create(null)' } } });
    const restored = restoreState({ seed, parsons, items, files, poolOrder: items.map((i) => i.id) });
    assert.deepEqual(restored.placed, placed);
    assert.deepEqual(restored.blanks, { 'line-4': { 1: 'Object.create(null)' } });
    assert.equal(restored.pool.length, 4);
    const broken = [{ ...files[1], content: files[1].content.replace('// data', '// jiné') }];
    assert.equal(restoreState({ seed, parsons, items, files: broken }), null);
    assert.equal(restoreState({ seed, parsons, items, files: seed }), null, 'nezměněný seed = začátek od nabídky');
  });

  test('špatné odsazení se jen označí (distraktory ne); posun v seznamu', () => {
    const wrong = indentMismatches(items, [{ id: 'line-0', indent: 1 }, { id: 'line-1', indent: 1 }, { id: 'extra-0', indent: 4 }]);
    assert.deepEqual([...wrong], ['line-0']);
    assert.deepEqual(moveInList(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c']);
    const list = ['a'];
    assert.equal(moveInList(list, 0, -1), list);
  });
});

describe('oprava chyby: míra změny (kontrakt kap. 3.4)', () => {
  test('oblast --edit--: posuzují se jen její neprázdné řádky', () => {
    const seed = [{ name: 'script.js', lang: 'js', content: 'const a = 1;\nfunction f(x) {\n  return x.push(1);\n}\n', region: { start: 2, end: 4 } }];
    const small = debugChangeRatio({ seed, userFiles: [{ name: 'script.js', content: 'const a = 1;\nfunction f(x) {\n  return [...x, 1];\n}\n' }] });
    assert.equal(small.assessed, 3);
    assert.ok(Math.abs(small.ratio - 1 / 3) < 1e-9);
    assert.equal(changeWarning(small.ratio), null);
    const big = debugChangeRatio({ seed, userFiles: [{ name: 'script.js', content: 'const a = 1;\nconst f = (x) => [...x, 1];\n' }] });
    assert.equal(big.ratio, 1);
    assert.equal(changeWarning(big.ratio), 'Přepsal jsi víc než polovinu kódu — u opravy chyby jde o nejmenší změnu.');
    assert.match(changeWarning(0.4, 0.3), /víc než 30 %/);
  });

  test('bez oblasti: soubory, které se v řešení liší od seedu', () => {
    const seed = [
      { name: 'a.js', lang: 'js', content: 'x\ny', region: null },
      { name: 'b.js', lang: 'js', content: 'p\nq', region: null },
    ];
    const solution = [{ name: 'a.js', content: 'x\nY' }, { name: 'b.js', content: 'p\nq' }];
    const result = debugChangeRatio({ seed, solution, userFiles: [{ name: 'a.js', content: 'x\nY' }, { name: 'b.js', content: 'zcela jinak' }] });
    assert.deepEqual(result, { ratio: 0.5, assessed: 2 });
  });
});

describe('Než začneš a stránka sekce', () => {
  test('poznámka z plánu obsahuje jen vyplněné odpovědi', () => {
    assert.equal(planNoteText({ restate: '  Spočítat průměr. ', steps: '', verify: 'Spustím testy.' }), '**Zadání vlastními slovy:**\n\nSpočítat průměr.\n\n**Jak ověříš první požadavek:**\n\nSpustím testy.');
    assert.equal(planNoteText({}), '');
  });

  test('popisky odkazů výstupů sekce', () => {
    const section = { modules: [{ id: 'js-pole/co-je-pole', title: 'Co je pole' }, { id: 'js-pole/workshop', title: 'Nákupní seznam' }] };
    assert.equal(outcomeLinkLabel('js-pole/co-je-pole#kopie-pole', section), 'Co je pole');
    assert.equal(outcomeLinkLabel('js-pole/workshop/016', section), 'Nákupní seznam, krok 16');
    assert.equal(outcomeLinkLabel('jina/sekce', section), 'jina/sekce');
  });
});
