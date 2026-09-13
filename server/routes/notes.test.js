import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../app.js';
import { routeModules } from './index.js';
import { listenInRange } from '../../tools/lib/listen.js';
import { formatNoteEntry, appendEntry, validateAppendBody } from './notes.js';
import { InputError } from '../errors.js';

const contentDir = path.join(import.meta.dirname, '..', 'test-fixtures', 'content');
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('poznámky — formát záznamu', () => {
  test('záznam s citací přesně podle kontraktu kap. 12.5', () => {
    const entry = formatNoteEntry(
      { kind: 'quote', source: 'js-pole/co-je-pole#kopie-pole', title: 'Nerozumím: Kopie pole', text: 'Proč se změnilo i a?', quote: 'První řádek\nDruhý řádek' },
      '2026-09-13T10:00:00.000Z',
    );
    assert.equal(
      entry,
      '\n## Nerozumím: Kopie pole\n\n<!-- zdroj: js-pole/co-je-pole#kopie-pole · 2026-09-13T10:00:00.000Z · quote -->\n\n> První řádek\n> Druhý řádek\n\nProč se změnilo i a?\n',
    );
  });

  test('bez citace chybí řádek s citací, bez textu záznam končí citací', () => {
    const plain = formatNoteEntry({ kind: 'note', source: 'a/b', title: 'T', text: 'Text', quote: '' }, 'CAS');
    assert.equal(plain, '\n## T\n\n<!-- zdroj: a/b · CAS · note -->\n\nText\n');
    const quoteOnly = formatNoteEntry({ kind: 'quote', source: 'a/b', title: 'T', text: '', quote: 'Q' }, 'CAS');
    assert.equal(quoteOnly, '\n## T\n\n<!-- zdroj: a/b · CAS · quote -->\n\n> Q\n');
  });

  test('připojení k souboru bez koncového nového řádku', () => {
    assert.equal(appendEntry('# Moje', '\n## X\n'), '# Moje\n\n## X\n');
    assert.equal(appendEntry('', '\n## X\n'), '\n## X\n');
  });

  test('validace těla: druh, zdroj, nadpis na jednom řádku, prázdná poznámka', () => {
    const ok = validateAppendBody({ kind: 'note', source: 'ukazka/workshop/002', title: 'Víc\nřádků ', text: 'a\r\nb' }, InputError);
    assert.deepEqual(ok, { kind: 'note', source: 'ukazka/workshop/002', title: 'Víc řádků', text: 'a\nb', quote: '' });
    assert.throws(() => validateAppendBody({ kind: 'jiny', source: 'a/b', title: 'T', text: 'x' }, InputError), /kind/);
    assert.throws(() => validateAppendBody({ kind: 'note', source: '#/modul/a/b', title: 'T', text: 'x' }, InputError), /source/);
    assert.throws(() => validateAppendBody({ kind: 'note', source: 'a/b', title: ' ', text: 'x' }, InputError), /title/);
    assert.throws(() => validateAppendBody({ kind: 'note', source: 'a/b', title: 'T', text: '  ' }, InputError), /prázdná/);
    assert.throws(() => validateAppendBody({ kind: 'quote', source: 'a/b', title: 'T', text: 'x' }, InputError), /quote/);
  });
});

describe('poznámky — HTTP API', () => {
  let root;
  let server;
  let baseUrl;

  before(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-notes-test-'));
    server = createApp({
      contentDir,
      dataDir: path.join(root, 'data'),
      projectsDir: path.join(root, 'moje-projekty'),
      distDir: path.join(root, 'dist'),
      // Jen jádro a poznámky: test nezávisí na rozpracovaných routách jiných nástrojů.
      routes: routeModules.filter((m) => ['curriculum.js', 'progress.js', 'notes.js'].includes(m.name)),
    });
    // Porty balíku poznámek a nastavení: 4500–4519 (docs/platforma.md, kap. 7.1).
    baseUrl = `http://127.0.0.1:${await listenInRange(server, { from: 4500, to: 4519 })}`;
  });

  after(async () => {
    await server.akademie.ctx.progress.flush();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });

  async function call(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  const notesFile = (section) => path.join(root, 'data', 'poznamky', `${section}.md`);

  test('prázdný stav: seznam bez souborů, sekce s prázdným obsahem', async () => {
    assert.deepEqual((await call('GET', '/api/notes')).data, { notes: [] });
    assert.deepEqual((await call('GET', '/api/notes/ukazka')).data, { section: 'ukazka', content: '', updated: null });
  });

  test('neznámá, plánovaná nebo neplatná sekce = 400; obecne je povolené', async () => {
    assert.equal((await call('GET', '/api/notes/neexistuje')).status, 400);
    assert.equal((await call('GET', '/api/notes/planovana')).status, 400);
    assert.equal((await call('GET', '/api/notes/Spatne_Jmeno')).status, 400);
    assert.equal((await call('GET', `/api/notes/${encodeURIComponent('../progress')}`)).status, 400);
    assert.equal((await call('GET', '/api/notes/obecne')).status, 200);
  });

  test('append zapíše přesný formát do data/poznamky/<sekce>.md a vrátí updated', async () => {
    const first = await call('POST', '/api/notes/ukazka/append', {
      kind: 'quote',
      source: 'ukazka/lekce#prvni-cast',
      title: 'Nerozumím: První část',
      text: 'Co je tady myšleno?',
      quote: 'Citovaný odstavec.',
    });
    assert.equal(first.status, 200);
    assert.equal(first.data.ok, true);
    assert.match(first.data.updated, ISO);

    const second = await call('POST', '/api/notes/ukazka/append', {
      kind: 'explain', source: 'ukazka/workshop/002', title: 'Vysvětli vlastními slovy', text: 'Protože…',
    });
    assert.equal(second.status, 200);

    const content = fs.readFileSync(notesFile('ukazka'), 'utf8');
    const match = content.match(
      /^\n## Nerozumím: První část\n\n<!-- zdroj: ukazka\/lekce#prvni-cast · (\S+) · quote -->\n\n> Citovaný odstavec\.\n\nCo je tady myšleno\?\n\n## Vysvětli vlastními slovy\n\n<!-- zdroj: ukazka\/workshop\/002 · (\S+) · explain -->\n\nProtože…\n$/,
    );
    assert.ok(match, `neočekávaný obsah:\n${content}`);
    assert.match(match[1], ISO);
    assert.ok(content.endsWith('\n'));
    assert.equal(fs.existsSync(`${notesFile('ukazka')}.tmp`), false, 'dočasný soubor po zápisu nezůstal');

    const read = await call('GET', '/api/notes/ukazka');
    assert.equal(read.data.content, content);
    assert.equal(read.data.updated, second.data.updated);
  });

  test('append s neplatným tělem = 400, tělo nad 100 kB = 413', async () => {
    assert.equal((await call('POST', '/api/notes/ukazka/append', { kind: 'note', source: 'x', title: 'T', text: 'a' })).status, 400);
    assert.equal((await call('POST', '/api/notes/ukazka/append', 'není json')).status, 400);
    const big = await call('POST', '/api/notes/obecne/append', {
      kind: 'note', source: 'ukazka/lekce', title: 'Velká', text: 'x'.repeat(101 * 1024),
    });
    assert.equal(big.status, 413);
    assert.equal(fs.existsSync(notesFile('obecne')), false);
  });

  test('PUT přepíše soubor; se starým baseUpdated vrátí 409 a nic nezmění', async () => {
    const { data: before } = await call('GET', '/api/notes/ukazka');
    const saved = await call('PUT', '/api/notes/ukazka', { content: '# Moje poznámky\n\nUpraveno ručně.', baseUpdated: before.updated });
    assert.equal(saved.status, 200);
    assert.match(saved.data.updated, ISO);
    assert.equal(fs.readFileSync(notesFile('ukazka'), 'utf8'), '# Moje poznámky\n\nUpraveno ručně.\n');

    // Soubor se mezitím změnil (jiné okno): klient posílá původní baseUpdated.
    await new Promise((resolve) => setTimeout(resolve, 15));
    const conflict = await call('PUT', '/api/notes/ukazka', { content: 'přepsáno', baseUpdated: before.updated });
    assert.equal(conflict.status, 409);
    assert.match(conflict.data.error, /změnily/);
    assert.equal(fs.readFileSync(notesFile('ukazka'), 'utf8'), '# Moje poznámky\n\nUpraveno ručně.\n');

    // baseUpdated null = „soubor ještě neexistuje" — u existujícího je to konflikt.
    assert.equal((await call('PUT', '/api/notes/ukazka', { content: 'x', baseUpdated: null })).status, 409);
    assert.equal((await call('PUT', '/api/notes/obecne', { content: 'Nový soubor', baseUpdated: null })).status, 200);
    // Bez baseUpdated se přepisuje bez kontroly.
    assert.equal((await call('PUT', '/api/notes/obecne', { content: 'Znovu' })).status, 200);
    assert.equal((await call('PUT', '/api/notes/obecne', { content: 5 })).status, 400);
  });

  test('seznam: jen existující soubory, obecne první, pak pořadí osnovy', async () => {
    const { data } = await call('GET', '/api/notes');
    const sectionTitle = JSON.parse(fs.readFileSync(path.join(contentDir, 'ukazka', 'section.json'), 'utf8')).title;
    assert.deepEqual(data.notes.map((n) => [n.section, n.title]), [
      ['obecne', 'Obecné poznámky'],
      ['ukazka', sectionTitle],
    ]);
    assert.equal(data.notes[0].title, 'Obecné poznámky');
    assert.equal(data.notes[1].section, 'ukazka');
    assert.equal(data.notes[1].size, fs.statSync(notesFile('ukazka')).size);
    assert.match(data.notes[1].updated, ISO);
  });

  test('reset postupu poznámky nesmaže', async () => {
    assert.equal((await call('POST', '/api/progress/reset', { id: 'ukazka' })).status, 200);
    assert.ok(fs.existsSync(notesFile('ukazka')));
  });
});
