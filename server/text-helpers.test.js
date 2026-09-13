import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalize, stripComments } from './text-helpers.js';

test('normalize sloučí bílé znaky', () => {
  assert.equal(normalize('  a \n\t b  '), 'a b');
  assert.equal(normalize(undefined), '');
});

test('stripComments v JS nechá řetězce, šablony a regulární výrazy', () => {
  const src = [
    "const url = 'http://example.com'; // adresa",
    'const re = /\\/\\/not-comment/g; /* blok */',
    'const t = `a ${ { b: "//x" }.b } // uvnitř šablony`;',
    'const d = 10 / 2 / 5;',
  ].join('\n');
  assert.equal(stripComments(src, 'js'), [
    "const url = 'http://example.com'; ",
    'const re = /\\/\\/not-comment/g; ',
    'const t = `a ${ { b: "//x" }.b } // uvnitř šablony`;',
    'const d = 10 / 2 / 5;',
  ].join('\n'));
});

test('stripComments v CSS a HTML', () => {
  assert.equal(stripComments('a { /* x */ content: "/* ne */"; }', 'css'), 'a {  content: "/* ne */"; }');
  assert.equal(stripComments('<p><!-- pryč -->text</p>', 'html'), '<p>text</p>');
});
