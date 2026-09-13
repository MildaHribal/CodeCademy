---
title: REST API pro poznámky
---

# --description--

## Zadání

Kamarádka dělá mobilní aplikaci na poznámky a potřebuje k ní backend. Nechce
žádnou databázi ani hosting navíc — stačí jí malý server, který poznámky drží
v souboru a mluví JSON. Frontend si píše sama, od tebe chce jen API, na které se
může spolehnout: aby odpovídalo vždycky stejně, vracelo srozumitelné chyby a nikdy
nespadlo kvůli špatnému požadavku.

Tohle je samostatný projekt: žádné kroky, jen zadání. Všechno, co potřebuješ, jsi
psal ve workshopu **Postav HTTP server knihovny**. Když se zasekneš, vrať se k němu.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku projektu ve VS Code.
2. V terminálu ve složce projektu spusť `npm run dev`. Server se po každém uložení
   sám restartuje.
3. Piš do `index.js`. API zkoušej přes `curl` (příklady jsou v `README.md`) nebo
   v prohlížeči na <http://localhost:3000/api/notes>.
4. Když máš hotový příběh, klikni na **Zkontrolovat**.

Projekt nemá žádné závislosti a nic neinstaluješ. Používej jen vestavěné moduly
Node (`node:http`, `node:fs/promises`, `node:crypto`…).

## Poznámka

Každá poznámka je objekt se čtyřmi klíči:

| klíč | typ | popis |
|---|---|---|
| `id` | řetězec | jedinečný identifikátor, přidělí ho server |
| `title` | řetězec | název, 1–100 znaků |
| `text` | řetězec | obsah poznámky, smí být prázdný |
| `createdAt` | řetězec | datum a čas vytvoření ve formátu ISO 8601, např. `2026-09-13T10:00:00.000Z` |

## Uživatelské příběhy

1. Když klient pošle `GET /api/notes`, dostane stav `200` a pole všech poznámek ze
   souboru s daty. Prázdný soubor (`[]`) znamená prázdné pole, ne chybu.
2. Když klient pošle `GET /api/notes/:id`, dostane stav `200` a poznámku s tím id.
   Když taková poznámka není, dostane `404`.
3. Když klient pošle `POST /api/notes` s tělem `{ "title": "…", "text": "…" }`,
   server poznámku vytvoří, uloží do souboru a odpoví `201` a celou vytvořenou
   poznámkou:
   - `id` přidělí server a nesmí se opakovat — ani po smazání poznámky,
   - `title` uloží bez mezer na začátku a na konci,
   - když `text` v těle chybí, uloží prázdný řetězec,
   - `createdAt` je okamžik vytvoření.
4. Když tělo `POST` není platný JSON, není to objekt, `title` chybí, není řetězec,
   je prázdné (nebo jen z mezer) či má po oříznutí víc než 100 znaků, nebo `text`
   není řetězec, dostane klient `400` a nic se neuloží.
5. Když klient pošle `DELETE /api/notes/:id`, server poznámku smaže ze souboru
   a odpoví `204` s prázdným tělem. Když poznámka s tím id není, odpoví `404`.
6. Poznámky přežijí restart serveru.
7. Na adresu, kterou API nezná, dostane klient `404`. Na metodu, kterou adresa
   neumí (třeba `PUT /api/notes`), dostane `405` a hlavičku `Allow` s metodami,
   které adresa umí.
8. Když se soubor s daty nedá přečíst (je poškozený), dostane klient `500` a server
   **běží dál**.

## Technické požadavky

- Server poslouchá na portu z proměnné `PORT` (výchozí `3000`).
- Poznámky čte a zapisuje do souboru z konstanty `notesFile` — ta je ve startovním
  `index.js` připravená a bere cestu z proměnné `NOTES_FILE`. Kontrola tak pracuje
  s dočasným souborem a tvoje data nechá být.
- Každá odpověď s tělem je JSON s hlavičkou `Content-Type: application/json; charset=utf-8`.
- Každá chybová odpověď má tělo `{ "error": "zpráva" }` se srozumitelnou českou zprávou.
- Soubor s daty čti při každém požadavku znovu, nedrž si ho jen v paměti.

## Tipy

- Rozděl si kód na malé funkce: čtení a zápis dat, `sendJson`, `readBody`,
  validace, jedna funkce na každou routu. Handler serveru pak jen rozhoduje, kterou
  zavolat.
- Jedinečné id bez počítání vyrobí `randomUUID()` z modulu `node:crypto`.
- Příběh 8 vyřešíš jedním `try`/`catch` kolem celého zpracování požadavku.
  V `catch` chybu vypiš přes `console.error`, ať ji v terminálu vidíš, a klientovi
  pošli `500` s obecnou zprávou — podrobnosti chyby ven neposílej.
- Pozor na odpověď `204`: nemá tělo, takže ani `Content-Type`. Pošli jen
  `res.writeHead(204)` a `res.end()`.

# --hints--

`GET /api/notes` vrátí stav `200`, hlavičku `application/json; charset=utf-8` a všechny poznámky ze souboru v `NOTES_FILE`.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
const notes = [
  { id: 'test-1', title: 'První testovací', text: 'obsah jedna', createdAt: '2026-01-01T10:00:00.000Z' },
  { id: 'test-2', title: 'Druhá testovací', text: '', createdAt: '2026-01-02T10:00:00.000Z' },
];
await fs.writeFile(notesFile, JSON.stringify(notes));
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const res = await fetch(new URL('/api/notes', server.url));
  assert.equal(res.status, 200, 'GET /api/notes má vrátit 200');
  const type = res.headers.get('content-type') ?? '';
  assert.match(type, /^application\/json/i, `Content-Type má být application/json, přišlo: ${type}`);
  assert.match(type, /charset=utf-8/i, `Content-Type má uvádět charset=utf-8, přišlo: ${type}`);
  assert.deepEqual(await res.json(), notes, 'Má přijít přesně obsah souboru z NOTES_FILE — čteš poznámky z notesFile?');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

Prázdný soubor s daty (`[]`) znamená odpověď `200` a prázdné pole.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, '[]');
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const res = await fetch(new URL('/api/notes', server.url));
  assert.equal(res.status, 200, 'GET /api/notes nad prázdným souborem má vrátit 200');
  assert.deepEqual(await res.json(), [], 'Prázdný soubor znamená prázdné pole');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

`GET /api/notes/:id` vrátí stav `200` a poznámku; neznámé id vrátí `404` s JSON klíčem `error`.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
const notes = [
  { id: 'test-1', title: 'První testovací', text: 'obsah jedna', createdAt: '2026-01-01T10:00:00.000Z' },
  { id: 'test-2', title: 'Druhá testovací', text: 'obsah dva', createdAt: '2026-01-02T10:00:00.000Z' },
];
await fs.writeFile(notesFile, JSON.stringify(notes));
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const found = await fetch(new URL('/api/notes/test-2', server.url));
  assert.equal(found.status, 200, 'GET /api/notes/test-2 má vrátit 200');
  assert.deepEqual(await found.json(), notes[1]);

  const missing = await fetch(new URL('/api/notes/neexistuje', server.url));
  assert.equal(missing.status, 404, 'Neznámé id má vrátit 404');
  assert.equal(typeof (await missing.json()).error, 'string', 'Tělo 404 má mít klíč error');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

`POST /api/notes` vrátí stav `201` a vytvořenou poznámku s `id`, `title`, `text` a `createdAt`.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, '[]');
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const before = Date.now();
  const res = await fetch(new URL('/api/notes', server.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Zavolat mámě', text: 'v neděli odpoledne' }),
  });
  assert.equal(res.status, 201, 'POST /api/notes má vrátit 201');
  const note = await res.json();
  assert.equal(typeof note.id, 'string', 'id má být řetězec');
  assert.ok(note.id.length > 0, 'id nemá být prázdné');
  assert.equal(note.title, 'Zavolat mámě');
  assert.equal(note.text, 'v neděli odpoledne');
  assert.equal(typeof note.createdAt, 'string', 'createdAt má být řetězec');
  const created = Date.parse(note.createdAt);
  assert.ok(!Number.isNaN(created) && new Date(created).toISOString() === note.createdAt, `createdAt má být ve formátu ISO (toISOString), přišlo: ${note.createdAt}`);
  assert.ok(created >= before - 60000 && created <= Date.now() + 60000, 'createdAt má být okamžik vytvoření');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

`POST` uloží `title` bez okrajových mezer a chybějící `text` jako prázdný řetězec; id klienta ignoruje.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, JSON.stringify([
  { id: 'test-1', title: 'Existující', text: '', createdAt: '2026-01-01T10:00:00.000Z' },
]));
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const res = await fetch(new URL('/api/notes', server.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'test-1', title: '   Koupit dárek  ' }),
  });
  assert.equal(res.status, 201, 'POST s title a bez text má vrátit 201');
  const note = await res.json();
  assert.equal(note.title, 'Koupit dárek', 'title má být uložený bez mezer na začátku a konci');
  assert.equal(note.text, '', 'Chybějící text má být prázdný řetězec');
  assert.notEqual(note.id, 'test-1', 'id přiděluje server, ne klient');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

Neplatný `POST` (rozbitý JSON, tělo `null`, chybějící, prázdný nebo příliš dlouhý `title`, `text` jiný než řetězec) vrátí `400` s klíčem `error` a nic neuloží.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
const original = JSON.stringify([{ id: 'test-1', title: 'Existující', text: '', createdAt: '2026-01-01T10:00:00.000Z' }]);
await fs.writeFile(notesFile, original);
const invalidBodies = [
  '{"title": ',
  'null',
  JSON.stringify({ text: 'bez názvu' }),
  JSON.stringify({ title: '    ' }),
  JSON.stringify({ title: 42 }),
  JSON.stringify({ title: 'a'.repeat(101) }),
  JSON.stringify({ title: 'Název', text: 123 }),
];
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  for (const body of invalidBodies) {
    const res = await fetch(new URL('/api/notes', server.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).catch((error) => assert.fail(`Na tělo ${body.slice(0, 40)} server neodpověděl (spadl?): ${error.message}`));
    assert.equal(res.status, 400, `Tělo ${body.slice(0, 40)} má vrátit 400, přišlo ${res.status}`);
    assert.equal(typeof (await res.json()).error, 'string', `Odpověď na ${body.slice(0, 40)} má mít klíč error`);
  }
  assert.deepEqual(JSON.parse(await fs.readFile(notesFile, 'utf8')), JSON.parse(original), 'Neplatný požadavek nesmí nic uložit');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

`title` se 100 znaky po oříznutí mezer ještě projde se stavem `201`.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, '[]');
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const res = await fetch(new URL('/api/notes', server.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: `  ${'a'.repeat(100)}  ` }),
  });
  assert.equal(res.status, 201, 'Název se 100 znaky (po oříznutí mezer) je ještě platný');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

Vytvořená poznámka je v souboru s daty a vrátí ji `GET /api/notes` i po restartu serveru.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, '[]');
try {
  const first = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const created = await (await fetch(new URL('/api/notes', first.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Přežij restart', text: 'prosím' }),
  })).json();
  const saved = JSON.parse(await fs.readFile(notesFile, 'utf8'));
  assert.ok(Array.isArray(saved) && saved.some((note) => note.id === created.id), 'Nová poznámka má být uložená v souboru z NOTES_FILE');
  await first.stop();

  const second = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const list = await (await fetch(new URL('/api/notes', second.url))).json();
  assert.ok(list.some((note) => note.id === created.id && note.title === 'Přežij restart'), 'Po restartu serveru má poznámka pořád být v GET /api/notes');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

`DELETE /api/notes/:id` vrátí `204` s prázdným tělem a poznámka zmizí ze seznamu i ze souboru.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
const notes = [
  { id: 'test-1', title: 'Zůstane', text: '', createdAt: '2026-01-01T10:00:00.000Z' },
  { id: 'test-2', title: 'Smaže se', text: '', createdAt: '2026-01-02T10:00:00.000Z' },
];
await fs.writeFile(notesFile, JSON.stringify(notes));
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const res = await fetch(new URL('/api/notes/test-2', server.url), { method: 'DELETE' });
  assert.equal(res.status, 204, 'DELETE existující poznámky má vrátit 204');
  assert.equal(await res.text(), '', 'Odpověď 204 má mít prázdné tělo');

  const detail = await fetch(new URL('/api/notes/test-2', server.url));
  assert.equal(detail.status, 404, 'Smazaná poznámka už nemá jít načíst');
  const list = await (await fetch(new URL('/api/notes', server.url))).json();
  assert.deepEqual(list, [notes[0]], 'V seznamu má zůstat jen nesmazaná poznámka');
  assert.deepEqual(JSON.parse(await fs.readFile(notesFile, 'utf8')), [notes[0]], 'Smazání se má projevit v souboru');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

`DELETE` neexistující poznámky vrátí `404` s klíčem `error`.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
const original = [{ id: 'test-1', title: 'Zůstane', text: '', createdAt: '2026-01-01T10:00:00.000Z' }];
await fs.writeFile(notesFile, JSON.stringify(original));
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const res = await fetch(new URL('/api/notes/neexistuje', server.url), { method: 'DELETE' });
  assert.equal(res.status, 404, 'DELETE neznámého id má vrátit 404');
  assert.equal(typeof (await res.json()).error, 'string', 'Tělo 404 má mít klíč error');
  assert.deepEqual(JSON.parse(await fs.readFile(notesFile, 'utf8')), original, 'Soubor se nemá změnit');
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

Id se neopakuje ani po smazání poznámky.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, '[]');
const post = (server, title) => fetch(new URL('/api/notes', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title }),
}).then((res) => res.json());
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  const a = await post(server, 'První');
  const b = await post(server, 'Druhá');
  assert.notEqual(a.id, b.id, 'Dvě poznámky nesmí mít stejné id');
  await fetch(new URL(`/api/notes/${b.id}`, server.url), { method: 'DELETE' });
  const c = await post(server, 'Třetí');
  assert.ok(![a.id, b.id].includes(c.id), `Nová poznámka po smazání dostala už použité id ${c.id}`);
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

Neznámá adresa vrátí `404`; nepodporovaná metoda vrátí `405` s hlavičkou `Allow`.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, JSON.stringify([{ id: 'test-1', title: 'Poznámka', text: '', createdAt: '2026-01-01T10:00:00.000Z' }]));
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  for (const url of ['/', '/api/nic', '/api/notesx']) {
    const res = await fetch(new URL(url, server.url));
    assert.equal(res.status, 404, `GET ${url} má vrátit 404`);
    assert.equal(typeof (await res.json()).error, 'string', `Odpověď na ${url} má mít klíč error`);
  }

  const put = await fetch(new URL('/api/notes', server.url), { method: 'PUT' });
  assert.equal(put.status, 405, 'PUT /api/notes má vrátit 405');
  const allowList = put.headers.get('allow') ?? '';
  assert.match(allowList, /\bGET\b/, `Allow u /api/notes má obsahovat GET, přišlo: ${allowList}`);
  assert.match(allowList, /\bPOST\b/, `Allow u /api/notes má obsahovat POST, přišlo: ${allowList}`);

  const patch = await fetch(new URL('/api/notes/test-1', server.url), { method: 'PATCH' });
  assert.equal(patch.status, 405, 'PATCH /api/notes/:id má vrátit 405');
  const allowDetail = patch.headers.get('allow') ?? '';
  assert.match(allowDetail, /\bGET\b/, `Allow u /api/notes/:id má obsahovat GET, přišlo: ${allowDetail}`);
  assert.match(allowDetail, /\bDELETE\b/, `Allow u /api/notes/:id má obsahovat DELETE, přišlo: ${allowDetail}`);
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```

Když je soubor s daty poškozený, server odpoví `500` s klíčem `error` a běží dál.

```js
const fs = await import('node:fs/promises');
const path = await import('node:path');
const os = await import('node:os');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'akademie-notes-'));
const notesFile = path.join(tmp, 'notes.json');
await fs.writeFile(notesFile, 'tohle není JSON');
try {
  const server = await helpers.startServer('index.js', { env: { NOTES_FILE: notesFile } });
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(new URL('/api/notes', server.url))
      .catch((error) => assert.fail(`Pokus ${attempt}: server neodpověděl (spadl?): ${error.message}`));
    assert.equal(res.status, 500, `Pokus ${attempt}: poškozená data mají vrátit 500, přišlo ${res.status}`);
    assert.equal(typeof (await res.json()).error, 'string', 'Tělo 500 má mít klíč error');
  }
} finally {
  await fs.rm(tmp, { recursive: true, force: true });
}
```
