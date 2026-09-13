import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTextAnswer, createKeyAllocator, hashKey, normalizeAnswer, normalizeCss, normalizeWhitespace } from './answers.js';

test('normalizeWhitespace', () => {
  assert.equal(normalizeWhitespace('  a \n\t b  '), 'a b');
  assert.equal(normalizeWhitespace(12), '12');
});

test('normalizeAnswer: příklady z kontraktu kap. 4.2', () => {
  assert.equal(normalizeAnswer('[1, 2]'), normalizeAnswer('[ 1,2 ]'));
  assert.equal(normalizeAnswer('"a"'), normalizeAnswer("'a'"));
  assert.equal(normalizeAnswer('x = 1;'), normalizeAnswer('x=1'));
  assert.notEqual(normalizeAnswer('hello world'), normalizeAnswer('helloworld'));
  assert.equal(normalizeAnswer('a;;\r\n\r\n  b  '), 'a\nb', 'řádky zůstávají řádky, prázdné zmizí');
  assert.equal(normalizeAnswer('Pole', { ignoreCase: true }), 'pole');
  assert.equal(normalizeAnswer(null), '');
});

test('normalizeCss: pořadí deklarací nerozhoduje, obsah uvozovek zachová velikost písmen', () => {
  assert.equal(normalizeCss('gap: 1REM; Display : flex;'), 'display:flex;gap:1rem');
  assert.equal(normalizeCss('flex-wrap: wrap'), normalizeCss('flex-wrap:wrap;'));
  assert.equal(normalizeCss('content: "Ahoj"'), "content:'Ahoj'");
  assert.equal(normalizeCss('font-family: "Open Sans", Serif'), "font-family:'Open Sans',serif");
});

test('checkTextAnswer: expected, accept, ignoreCase a karta css', () => {
  const question = { type: 'text', expected: '-1', accept: ['minus jedna'], ignoreCase: false };
  assert.equal(checkTextAnswer(question, ' -1; '), true);
  assert.equal(checkTextAnswer(question, 'minus  jedna'), true);
  assert.equal(checkTextAnswer(question, '1'), false);
  assert.equal(checkTextAnswer({ type: 'text', expected: 'Pole', accept: [], ignoreCase: true }, 'pole'), true);
  assert.equal(checkTextAnswer({ type: 'text', expected: 'Pole', accept: [], ignoreCase: false }, 'pole'), false);
  const card = { type: 'css', expected: 'flex-wrap: wrap;', accept: ['flex-flow: row wrap;'] };
  assert.equal(checkTextAnswer(card, 'FLEX-FLOW:row   wrap'), true);
  assert.equal(checkTextAnswer({ type: 'css', expected: 'display: flex; gap: 1rem', accept: [] }, 'gap:1rem;display:flex'), true);
});

test('hashKey: FNV-1a nad UTF-8 po normalizaci bílých znaků', () => {
  assert.equal(hashKey(''), '811c9dc5');
  assert.equal(hashKey('a'), 'e40c292c');
  assert.equal(hashKey('  Otázka\n s   mezerami '), hashKey('Otázka s mezerami'));
  assert.match(hashKey('Příliš žluťoučký kůň'), /^[0-9a-f]{8}$/);
});

test('createKeyAllocator: stejný text v souboru dostane -2, -3', () => {
  const nextKey = createKeyAllocator();
  const base = hashKey('A');
  assert.deepEqual([nextKey('A'), nextKey('B'), nextKey(' A '), nextKey('A')], [base, hashKey('B'), `${base}-2`, `${base}-3`]);
});
