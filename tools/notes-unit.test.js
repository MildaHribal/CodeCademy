// Poznámky v prohlížeči bez DOM: nadpisy, citace a řádek se zdrojem (client/src/extensions/notes/format.js).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { cleanQuote, countEntries, entrySource, entryTitle, withVisibleSources } from '../client/src/extensions/notes/format.js';

describe('poznámky — formát v UI', () => {
  test('nadpis a zdroj záznamu', () => {
    assert.equal(entryTitle('quote', { heading: 'Kopie pole', title: 'Co je pole' }), 'Nerozumím: Kopie pole');
    assert.equal(entryTitle('note', { title: 'Co je pole' }), 'Poznámka: Co je pole');
    assert.equal(entrySource('js-pole/co-je-pole', 'kopie-pole'), 'js-pole/co-je-pole#kopie-pole');
    assert.equal(entrySource('js-pole/workshop/003'), 'js-pole/workshop/003');
  });

  test('citace: sloučené mezery, bez prázdných řádků navíc, dlouhá zkrácená', () => {
    assert.equal(cleanQuote('  Pole   je\n\n\n\n  odkaz  '), 'Pole je\n\nodkaz');
    const long = cleanQuote('x'.repeat(2000));
    assert.ok(long.length <= 1501 && long.endsWith('…'));
  });

  test('komentář se zdrojem se ukáže jako řádek s odkazem; cizí komentáře zůstanou', () => {
    const md = '\n## Nerozumím: Kopie\n\n<!-- zdroj: js-pole/co-je-pole#kopie-pole · 2026-09-13T10:00:00.000Z · quote -->\n\n> text\n\n<!-- můj komentář -->\n';
    const html = withVisibleSources(md);
    assert.match(html, /<p class="notes-meta"><span class="notes-meta__kind">nerozumím<\/span> <a href="#\/modul\/js-pole\/co-je-pole\?kotva=kopie-pole">js-pole\/co-je-pole#kopie-pole<\/a> <time datetime="2026-09-13T10:00:00.000Z">/);
    assert.match(html, /<!-- můj komentář -->/);
    // Komentář s nečekaným obsahem se nepřevede (do HTML se nedostane nic neověřeného).
    assert.equal(withVisibleSources('<!-- zdroj: <script> · x · note -->'), '<!-- zdroj: <script> · x · note -->');
  });

  test('počet záznamů nepočítá ## uvnitř bloků kódu', () => {
    assert.equal(countEntries('\n## A\n\n```md\n## ne\n```\n\n## B\n'), 2);
  });
});
