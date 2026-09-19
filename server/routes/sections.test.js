import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { hashKey } from '../../shared/answers.js';
import { createApp } from '../app.js';
import { register } from './sections.js';

const TERMS = `## --term-- hlavní osa

en: main axis
aliases: hlavní ose, hlavní osy
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Main_Axis
lekce: flex/uvod#hlavni-osa

Směr, ve kterém flex kontejner řadí položky.
`;

const CARDS = `## --card-- free

Proč flexbox?

### --back--

Protože rozvrhne prvky v jedné ose.
`;

function writeTree(root, tree) {
  for (const [name, content] of Object.entries(tree)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content);
  }
}

describe('routy sekce a pojmů', () => {
  let root;
  let server;
  let baseUrl;

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-sections-test-'));
    writeTree(path.join(root, 'content'), {
      'osnova.json': JSON.stringify({
        parts: [{ id: 'p', title: 'P', sections: ['flex', 'pole', 'rozbita', { id: 'planovana', title: 'Plán', summary: 'Později.' }] }],
      }),
      'flex/section.json': JSON.stringify({
        title: 'Flexbox', intro: 'Úvod.', modules: [],
        outcomes: [{ text: 'Rozvrhneš lištu.', links: ['flex/uvod#hlavni-osa'] }, { text: 'Rozvrhneš lištu.' }],
      }),
      'flex/pojmy.md': TERMS,
      'flex/cards.md': CARDS,
      'flex/tahak.md': '# Tahák\n\n| a | b |\n',
      'pole/section.json': JSON.stringify({ title: 'Pole', modules: [] }),
      'rozbita/section.json': JSON.stringify({ title: 'Rozbitá', modules: [] }),
      'rozbita/cards.md': '## --card-- nesmysl\n\nText\n',
    });
    server = createApp({
      contentDir: path.join(root, 'content'),
      dataDir: path.join(root, 'data'),
      projectsDir: path.join(root, 'moje-projekty'),
      distDir: path.join(root, 'dist'),
      routes: [{ name: 'sections.js', register }],
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });

  async function get(url) {
    const response = await fetch(baseUrl + url);
    return { status: response.status, data: await response.json() };
  }

  test('GET /api/section/:section vrátí výstupy s klíči, tahák, pojmy a karty', async () => {
    const { status, data } = await get('/api/section/flex');
    assert.equal(status, 200);
    const key = hashKey('Rozvrhneš lištu.');
    assert.deepEqual(data.outcomes, [
      { key, text: 'Rozvrhneš lištu.', links: ['flex/uvod#hlavni-osa'] },
      { key: `${key}-2`, text: 'Rozvrhneš lištu.', links: [] },
    ]);
    assert.equal(data.id, 'flex');
    assert.equal(data.title, 'Flexbox');
    assert.equal(data.intro, 'Úvod.');
    assert.equal(data.cheatsheet, '# Tahák\n\n| a | b |\n');
    assert.deepEqual(data.terms.map((t) => [t.id, t.term, t.sectionId]), [['hlavni-osa', 'hlavní osa', 'flex']]);
    assert.deepEqual(data.cards.map((c) => [c.type, c.key]), [['free', hashKey('Proč flexbox?')]]);
  });

  test('sekce bez volitelných souborů má prázdné pole a null', async () => {
    const { data } = await get('/api/section/pole');
    assert.deepEqual(data, { id: 'pole', title: 'Pole', intro: '', outcomes: [], cheatsheet: null, terms: [], cards: [] });
  });

  test('404 pro sekci mimo disk, 400 pro neplatný slug, 500 pro rozbitý soubor', async () => {
    assert.equal((await get('/api/section/planovana')).status, 404);
    assert.equal((await get('/api/section/Neplatna_sekce')).status, 400);
    const originalError = console.error;
    console.error = () => {};
    const broken = await get('/api/section/rozbita').finally(() => {
      console.error = originalError;
    });
    assert.equal(broken.status, 500);
    assert.match(broken.data.error, /neznámý typ karty/);
  });

  test('GET /api/terms vrátí pojmy dostupných sekcí v pořadí osnovy', async () => {
    const { status, data } = await get('/api/terms');
    assert.equal(status, 200);
    assert.deepEqual(data.terms.map((t) => t.term), ['hlavní osa']);
    assert.deepEqual(data.terms[0].aliases, ['hlavní ose', 'hlavní osy']);
  });
});
