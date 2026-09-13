// Lint v editoru bez prohlížeče: průchod CSS, neplatné deklarace a nálezy (client/src/extensions/lint).
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { positionAt, scanCss } from '../client/src/extensions/lint/css-scan.js';
import { checkDeclaration, closest, editDistance, findInvalidDeclarations } from '../client/src/extensions/lint/css-check.js';
import {
  cssDiagnostics, inactiveDiagnostics, inspectableDeclarations, jsonDiagnostics, offsetAt, runtimeDiagnostic, syntaxDiagnostics,
} from '../client/src/extensions/lint/diagnostics.js';

// Náhrada CSS.supports: pár vlastností a hodnot, jak by je posoudil prohlížeč.
const VALID = {
  display: (v) => ['block', 'flex', 'grid', 'inline', 'none', 'inherit'].includes(v),
  gap: (v) => v === 'inherit' || v === '0' || /^\d+(\.\d+)?(px|rem|em|%)( \d+(\.\d+)?(px|rem|em|%))?$/.test(v),
  'justify-content': (v) => ['center', 'flex-start', 'space-between', 'inherit'].includes(v),
  color: (v) => ['red', 'blue', 'inherit'].includes(v) || /^#[0-9a-f]{3,6}$/i.test(v),
  'z-index': (v) => v === 'inherit' || /^-?\d+$/.test(v),
  'font-family': () => true,
  width: (v) => v === 'inherit' || /^\d+(px|rem|%)$/.test(v),
};
const supports = (property, value) => Boolean(VALID[property]?.(value));

describe('scanCss', () => {
  test('najde deklarace s pozicemi, selektorem, @pravidly a vnořením', () => {
    const css = '/* nav */\nnav { display: flex; gap: 1rem }\n@media (max-width: 600px) {\n  nav > a { color: red; }\n}\n.card { a { color: blue; } }';
    const found = scanCss(css);
    assert.deepEqual(found.map((d) => [d.property, d.value, d.selector, d.atRules, d.nested]), [
      ['display', 'flex', 'nav', [], false],
      ['gap', '1rem', 'nav', [], false],
      ['color', 'red', 'nav > a', ['@media (max-width: 600px)'], false],
      ['color', 'blue', 'a', [], true],
    ]);
    const [display] = found;
    assert.equal(css.slice(display.from, display.to), 'display: flex');
    assert.equal(css.slice(display.valueFrom, display.to), 'flex');
    assert.deepEqual(positionAt(css, display.from), { line: 2, column: 7 });
  });

  test('středník v url() a v řetězci deklaraci nerozdělí; chybějící středník spojí řádky', () => {
    const found = scanCss('a { background: url(data:image/png;base64,xx); content: "a;b"; color: red\n  width: 10px; }');
    assert.deepEqual(found.map((d) => [d.property, d.value]), [
      ['background', 'url(data:image/png;base64,xx)'],
      ['content', '"a;b"'],
      ['color', 'red\n  width: 10px'],
    ]);
  });
});

describe('neplatné CSS', () => {
  test('chybějící jednotka, překlep v klíčovém slově a ve vlastnosti', () => {
    assert.deepEqual(checkDeclaration({ property: 'gap', value: '24' }, { supports }), {
      message: 'Hodnotu `24` prohlížeč u `gap` nepřijme — deklarace se ignoruje.',
      hint: 'Chybí jednotka? Třeba `24px` nebo `24rem`.',
    });
    assert.equal(checkDeclaration({ property: 'justify-content', value: 'centre' }, { supports }).hint, 'Myslel jsi `center`?');
    assert.deepEqual(checkDeclaration({ property: 'colr', value: 'red' }, { supports }), {
      message: 'Vlastnost `colr` prohlížeč nezná — deklarace se ignoruje.',
      hint: 'Myslel jsi `color`?',
    });
  });

  test('mezera před jednotkou, jednotka navíc, uvozovky a chybějící středník', () => {
    assert.equal(checkDeclaration({ property: 'gap', value: '24 px' }, { supports }).hint, 'Mezi číslem a jednotkou nesmí být mezera: `24px`.');
    assert.equal(checkDeclaration({ property: 'z-index', value: '2px' }, { supports }).hint, 'Tahle vlastnost se píše bez jednotky: `2`.');
    assert.equal(checkDeclaration({ property: 'display', value: '"flex"' }, { supports }).hint, 'Hodnota se píše bez uvozovek: `flex`.');
    assert.equal(checkDeclaration({ property: 'color', value: 'red\n  width: 10px' }, { supports }).hint, 'Chybí středník `;` na konci řádku?');
  });

  test('platné, proměnné, !important, prefixy a @font-face se nehlásí', () => {
    assert.equal(checkDeclaration({ property: 'display', value: 'flex !important' }, { supports }), null);
    assert.equal(checkDeclaration({ property: 'gap', value: 'var(--gap)' }, { supports }), null);
    assert.equal(checkDeclaration({ property: '--mezera', value: 'cokoli' }, { supports }), null);
    assert.equal(checkDeclaration({ property: '-webkit-box-orient', value: 'vertical' }, { supports }), null);
    assert.deepEqual(findInvalidDeclarations('@font-face { src: url(a.woff2); font-display: swap; }\nnav { display: flex; gap: 8 }', { supports }).map((p) => p.message), [
      'Hodnotu `8` prohlížeč u `gap` nepřijme — deklarace se ignoruje.',
    ]);
  });

  test('prázdná hodnota a neznámá hodnota bez návrhu', () => {
    assert.deepEqual(checkDeclaration({ property: 'color', value: '' }, { supports }), { message: 'Vlastnost `color` nemá hodnotu.', hint: null });
    assert.equal(checkDeclaration({ property: 'color', value: 'rgb(1 2)' }, { supports }).hint, null);
  });

  test('editDistance a closest', () => {
    assert.equal(editDistance('centre', 'center'), 2);
    assert.equal(closest('flex-strat', ['flex-start', 'flex-end']), 'flex-start');
    assert.equal(closest('xyz', ['center']), null);
    assert.equal(closest('center', ['center']), null);
  });
});

describe('nálezy lintu', () => {
  test('syntaktická chyba JS: česká věta, rozsah tokenu, anglický originál', () => {
    const text = 'const a = 1;\nconsole.log(a));';
    const [diagnostic] = syntaxDiagnostics('script.js', text);
    assert.equal(text.slice(diagnostic.from, diagnostic.to), ')');
    assert.equal(diagnostic.severity, 'error');
    assert.equal(diagnostic.message, 'Na tomhle místě kódu je znak, který tam nedává smysl.');
    assert.equal(diagnostic.original, "SyntaxError: Unexpected token ')'");
    assert.equal(diagnostics('index.css'), 0);

    function diagnostics(name) {
      return syntaxDiagnostics(name, text).length;
    }
  });

  test('syntaktická chyba v inline skriptu HTML a v JSON', () => {
    const html = '<p>x</p>\n<script>\n  const = 1;\n</script>';
    const [diagnostic] = syntaxDiagnostics('index.html', html);
    assert.equal(html.slice(diagnostic.from, diagnostic.to), '=');
    const [json] = jsonDiagnostics('data.json', '{ "a": 1, }');
    assert.equal(json.message, 'Soubor není platný JSON.');
    assert.deepEqual(jsonDiagnostics('data.json', '{ "a": 1 }'), []);
  });

  test('CSS nálezy nesou návrh opravy', () => {
    const text = 'nav {\n  gap: 24;\n}';
    const [diagnostic] = cssDiagnostics('styles.css', text, { supports });
    assert.equal(text.slice(diagnostic.from, diagnostic.to), 'gap: 24');
    assert.equal(diagnostic.hint, 'Chybí jednotka? Třeba `24px` nebo `24rem`.');
    assert.deepEqual(cssDiagnostics('script.js', text, { supports }), []);
  });

  test('neaktivní CSS: jen pravidla nejvyšší úrovně a zprávy podle důvodu', () => {
    const text = '.row { justify-content: center; }\n@media (min-width: 1px) { .row { gap: 1px; } }\n.item { flex-grow: 1; }';
    const declarations = inspectableDeclarations(text);
    assert.deepEqual(declarations.map((d) => [d.id, d.property, d.selector]), [[0, 'justify-content', '.row'], [1, 'flex-grow', '.item']]);
    const found = inactiveDiagnostics(declarations, [{ id: 0, reason: 'container' }, { id: 1, reason: 'flex-parent' }, { id: 9, reason: 'static' }]);
    assert.deepEqual(found.map((d) => [text.slice(d.from, d.to), d.severity, d.message]), [
      ['justify-content: center', 'info', '`justify-content` tu nic nedělá: prvek nemá `display: flex` ani `display: grid`.'],
      ['flex-grow: 1', 'info', '`flex-grow` tu nic nedělá: rodič prvku není flex kontejner.'],
    ]);
    assert.match(found[0].hint, /display: flex/);
  });

  test('chyba za běhu se označí od sloupce (nebo od odsazení) do konce řádku', () => {
    const text = 'const a = 1;\n  nope();\n';
    const diagnostic = runtimeDiagnostic(text, { line: 2, column: 1, message: 'ReferenceError: nope is not defined (script.js:2)' });
    assert.equal(text.slice(diagnostic.from, diagnostic.to), 'nope();');
    assert.equal(diagnostic.message, 'Používáš jméno „nope“, které v tomhle místě neexistuje.');
    assert.equal(offsetAt(text, 99, 99), text.length);
  });
});
