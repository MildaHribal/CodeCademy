import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectHeadings as anchorsCollect, headingAnchor as anchorsHeading } from './anchors.js';
import {
  collectHeadings, findSeeLinks, findTermRefs, headingAnchor, itemTarget, parseItemId, parseRef, refHref, termLookupKey,
} from './refs.js';

test('refs.js re-exportuje kotvy z anchors.js (jediná implementace)', () => {
  assert.equal(headingAnchor, anchorsHeading);
  assert.equal(collectHeadings, anchorsCollect);
});

test('parseRef: příklady z kontraktu kap. 2.9 a neplatné zápisy', () => {
  assert.deepEqual(parseRef('js-pole/co-je-pole#kopie-pole'), { sectionId: 'js-pole', moduleId: 'js-pole/co-je-pole', stepId: null, anchor: 'kopie-pole' });
  assert.deepEqual(parseRef('css-flexbox/workshop-navigace/016'), {
    sectionId: 'css-flexbox', moduleId: 'css-flexbox/workshop-navigace', stepId: 'css-flexbox/workshop-navigace/016', anchor: null,
  });
  assert.deepEqual(parseRef(' node-zaklady/kviz '), { sectionId: 'node-zaklady', moduleId: 'node-zaklady/kviz', stepId: null, anchor: null });
  for (const bad of ['js-pole', 'js-pole/', 'Js-pole/x', 'a/b/16', 'a/b#Kotva', 'a/b#', 'a/b/c/d', '#/modul/a/b', 42, null]) {
    assert.equal(parseRef(bad), null, String(bad));
  }
});

test('refHref: adresa v UI s ?kotva=', () => {
  assert.equal(refHref('js-pole/co-je-pole#kopie-pole'), '#/modul/js-pole/co-je-pole?kotva=kopie-pole');
  assert.equal(refHref('css-flexbox/workshop-navigace/016'), '#/modul/css-flexbox/workshop-navigace/016');
  assert.equal(refHref(parseRef('a/b')), '#/modul/a/b');
  assert.equal(refHref('neplatna'), null);
});

test('termLookupKey: NFC, malá písmena, bílé znaky', () => {
  assert.equal(termLookupKey('  Hlavní\n  Osa '), 'hlavní osa');
  assert.equal(termLookupKey('Hlavní'.normalize('NFD')), termLookupKey('Hlavní'));
});

test('findTermRefs: pojmy mimo bloky kódu a inline kód', () => {
  const md = 'Viz [[hlavní osa|hlavní ose]] a [[flex kontejner]].\n\n`[[ne]]` v kódu\n\n```md\n[[taky ne]]\n```\nKonec [[ Pole ]].';
  assert.deepEqual(findTermRefs(md).map(({ term, text, raw, line }) => ({ term, text, raw, line })), [
    { term: 'hlavní osa', text: 'hlavní ose', raw: '[[hlavní osa|hlavní ose]]', line: 1 },
    { term: 'flex kontejner', text: 'flex kontejner', raw: '[[flex kontejner]]', line: 1 },
    { term: 'Pole', text: 'Pole', raw: '[[ Pole ]]', line: 8 },
  ]);
  const [first] = findTermRefs(md);
  assert.equal(md.slice(first.index, first.index + first.raw.length), first.raw);
});

test('findSeeLinks: odkazy [text](see:ref) mimo kód', () => {
  const md = 'Přečti [kopie pole](see:js-pole/co-je-pole#kopie-pole).\n```\n[x](see:a/b)\n```\n`[y](see:c/d)` a [z](https://x) a [w](see:e/f)';
  assert.deepEqual(findSeeLinks(md).map(({ ref, text, line }) => [ref, text, line]), [
    ['js-pole/co-je-pole#kopie-pole', 'kopie pole', 1],
    ['e/f', 'w', 5],
  ]);
});

test('parseItemId a itemTarget: tvary z kontraktu kap. 2.10', () => {
  assert.deepEqual(parseItemId('q:js-pole/kviz#1b4f0e98'), { type: 'q', target: 'js-pole/kviz', key: '1b4f0e98' });
  assert.deepEqual(parseItemId('card:js-pole#77aa01bc-2'), { type: 'card', target: 'js-pole', key: '77aa01bc-2' });
  assert.deepEqual(parseItemId('step:js-pole/workshop-nakupni-seznam/017'), { type: 'step', target: 'js-pole/workshop-nakupni-seznam/017', key: null });
  assert.deepEqual(parseItemId('step:js-pole/lab-statistika'), { type: 'step', target: 'js-pole/lab-statistika', key: null });
  assert.deepEqual(parseItemId('explain:js-pole/co-je-pole#0000abcd'), { type: 'explain', target: 'js-pole/co-je-pole', key: '0000abcd' });
  assert.deepEqual(parseItemId('explain:a/b/003#0000abcd'), { type: 'explain', target: 'a/b/003', key: '0000abcd' });
  assert.deepEqual(parseItemId('outcome:js-pole#0000abcd'), { type: 'outcome', target: 'js-pole', key: '0000abcd' });
  for (const bad of ['q:js-pole/kviz', 'q:js-pole#1b4f0e98', 'card:a/b#1b4f0e98', 'step:a', 'step:a/b#1b4f0e98', 'step:a/001', 'x:a/b', 'q:a/b#XYZ', 'q:../a#1b4f0e98', '', null]) {
    assert.equal(parseItemId(bad), null, String(bad));
  }
  assert.equal(itemTarget('q:js-pole/kviz#1b4f0e98'), 'js-pole/kviz');
  assert.equal(itemTarget('nesmysl'), null);
});
