import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anchoredHeadings, collectHeadings, createSlugger, extractHeadings, headingAnchor, slugify } from './anchors.js';

test('headingAnchor: příklady z kontraktu kap. 2.8', () => {
  assert.equal(headingAnchor('Hlavní a vedlejší osa'), 'hlavni-a-vedlejsi-osa');
  assert.equal(headingAnchor('`justify-content`: volné místo na hlavní ose'), 'justify-content-volne-misto-na-hlavni-ose');
  assert.equal(headingAnchor('Proč se položka nezmenší: `min-width: auto`'), 'proc-se-polozka-nezmensi-min-width-auto');
  assert.equal(headingAnchor('Kopie pole: `slice` vs. `[...a]`'), 'kopie-pole-slice-vs-a');
  assert.equal(headingAnchor('Typické chyby a pasti'), 'typicke-chyby-a-pasti');
});

test('headingAnchor: odkazy, pojmy, * a _, prázdný výsledek', () => {
  assert.equal(headingAnchor('[Kopie](see:js-pole/co-je-pole#kopie) a **tučně**'), 'kopie-a-tucne');
  assert.equal(headingAnchor('[[hlavní osa|Hlavní ose]] a [[flex kontejner]]'), 'hlavni-ose-a-flex-kontejner');
  assert.equal(headingAnchor('snake_case'), 'snakecase');
  assert.equal(headingAnchor('`[]` === `{}`'), 'oddil');
  assert.equal(slugify('Příliš žluťoučký kůň'), 'prilis-zlutoucky-kun');
});

test('createSlugger: kotva, která už je, dostane první volnou příponu', () => {
  const slug = createSlugger();
  assert.deepEqual(['Pasti', 'Pasti', 'Pasti 2', '???', '!!!'].map(slug), ['pasti', 'pasti-2', 'pasti-2-2', 'oddil', 'oddil-2']);
});

test('extractHeadings: surový text nadpisu, i v citaci a setext, ne v bloku kódu', () => {
  const md = ['# Titulek', '', '```md', '## není nadpis', '```', '', '## **Pasti** a `kód`', '', '> ### V citaci', '', 'Setext', '------'].join('\n');
  assert.deepEqual(extractHeadings(md), [
    { level: 1, text: 'Titulek' },
    { level: 2, text: '**Pasti** a `kód`' },
    { level: 3, text: 'V citaci' },
    { level: 2, text: 'Setext' },
  ]);
});

test('collectHeadings: jen úrovně 2 a 3, unikátní přes všechny bloky', () => {
  assert.deepEqual(collectHeadings(['# Titulek\n\n## Příklad\n\n#### Hluboko', '### Příklad']), [
    { level: 2, text: 'Příklad', anchor: 'priklad' },
    { level: 3, text: 'Příklad', anchor: 'priklad-2' },
  ]);
  const slug = createSlugger();
  assert.deepEqual(anchoredHeadings('## A', slug).map((h) => h.anchor), ['a']);
  assert.deepEqual(anchoredHeadings('## A', slug).map((h) => h.anchor), ['a-2']);
});
