---
title: "Kontrolní bod: rezervační API"
runtime: node
see: nasazeni-provoz/produkcni-rezim
---

# --description--

Tohle je kontrolní bod. Není tu nový výklad — postavíš celou službu sám z toho, co už
umíš: HTTP a REST, validace vstupu, hesla a role, provozní požadavky.

**Zadání:** firma Pod Lipou má pět zasedacích místností a rezervuje je tabulkou
v cloudu, ve které si lidé přepisují řádky. Postav místo toho JSON API.

Pracuješ v `src/server.js`. Kostra serveru, data místností a `package.json` už tam
jsou; všechno ostatní je na tobě. Stav si drž v paměti (`Map`), databáze tu není
potřeba.

Předinstalovaný máš `express` i `zod` — použij je, nebo si vystač s `node:http`
a vlastní validací. Testy kontrolují chování, ne nástroj.

## Co má platit

**Účty a přihlášení**

1. `POST /api/register` s `{ email, password }` vytvoří účet a vrátí `201`
   a `{ id, email, role }`. Role nového účtu je vždy `user` — i když si ji klient
   pošle v těle.
2. Heslo se **nikdy neukládá v otevřené podobě** a nikdy se nevrací v odpovědi.
   Použij `scrypt` z `node:crypto` se solí.
3. Heslo kratší než 8 znaků nebo chybějící e-mail → `400` a `code: 'INVALID_INPUT'`.
4. Už existující e-mail → `409` a `code: 'EMAIL_TAKEN'`.
5. `POST /api/login` vrátí `200` a `{ token }`. Špatné heslo i neexistující e-mail
   vracejí **stejnou** odpověď: `401` a `code: 'INVALID_CREDENTIALS'`.
6. V paměti je od startu připravený správce `sprava@podlipou.cz` s heslem
   `zasedacky2026` a rolí `admin`.

**Rezervace**

7. `GET /api/rooms` je veřejné a vrátí místnosti z `data/rooms.json`.
8. Všechno pod `/api/reservations` vyžaduje hlavičku `Authorization: Bearer <token>`.
   Bez ní nebo s neplatným tokenem `401` a `code: 'UNAUTHORIZED'`.
9. `POST /api/reservations` s `{ roomId, date, startHour, hours }` vytvoří rezervaci
   a vrátí `201`. Validace: známá místnost, `date` ve tvaru `RRRR-MM-DD`, `startHour`
   celé číslo 7–20, `hours` celé číslo 1–4, konec nejpozději ve 21. Cokoli jiného
   → `400` a `code: 'INVALID_INPUT'`.
10. Rezervace, která se **časově překrývá** s jinou v téže místnosti a dni, skončí
    `409` a `code: 'ROOM_TAKEN'`. Navazující rezervace (konec jedné = začátek druhé)
    projde.
11. `GET /api/reservations?page=1&perPage=10` vrátí
    `{ items, page, perPage, total }`, seřazené podle `date` a `startHour`.
    Výchozí `page` je 1 a `perPage` 10, maximum `perPage` je 50.
12. Běžný uživatel vidí a maže jen svoje rezervace. Admin vidí všechny a smí smazat
    cizí. `DELETE /api/reservations/:id` vrací `204`, cizí rezervace běžnému uživateli
    `403` a `code: 'FORBIDDEN'`, neexistující `404` a `code: 'NOT_FOUND'`.

**Provoz**

13. `GET /health` je veřejné a vrací `200` a `{ status: 'ok' }`.
14. Každá chyba má stejný tvar těla: `{ "error": { "code": "...", "message": "..." } }`.
    Neznámá cesta → `404` a `code: 'NOT_FOUND'`.
15. Chyby se logují na `stderr` jako jeden řádek JSON s klíči `level` a `code`.
    **Do logu se nesmí dostat heslo ani token.**
16. Server poslouchá na portu z `process.env.PORT` (výchozí `3000`) a neošetřená
    výjimka v obsluze ho nesmí shodit — vrátí `500` a `code: 'INTERNAL_ERROR'`.

> [!TIP]
> Postupuj po vrstvách, ne po requirementech: nejdřív odpovídání a jednotný tvar chyb,
> pak účty, pak rezervace, nakonec stránkování a role. Po každé vrstvě si pusť
> **Zkontrolovat** — uvidíš, kolik testů přibylo zelených.

# --hints--

Zdravotní sonda a jednotný tvar chyb.

```js
const server = await helpers.startServer('src/server.js');
const health = await fetch(`${server.url}/health`);
assert.equal(health.status, 200, `GET /health má vrátit 200. Výstup serveru:\n${server.output()}`);
assert.deepEqual(await health.json(), { status: 'ok' }, 'GET /health má vrátit { status: "ok" }');

const nikde = await fetch(`${server.url}/api/neexistuje`);
assert.equal(nikde.status, 404, 'Neznámá cesta má vrátit 404');
const telo = await nikde.json();
assert.equal(telo.error?.code, 'NOT_FOUND', 'Chyba má mít tvar { error: { code, message } } s kódem NOT_FOUND');
assert.equal(typeof telo.error?.message, 'string', 'Chyba má mít i lidskou zprávu v message');
```

Registrace vytvoří účet, nevrací heslo a roli si klient nevybere.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body, token) => fetch(`${server.url}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});

const res = await post('/api/register', { email: 'eva@podlipou.cz', password: 'silneheslo1', role: 'admin' });
assert.equal(res.status, 201, `Registrace má vrátit 201. Výstup serveru:\n${server.output()}`);
const ucet = await res.json();
assert.equal(ucet.email, 'eva@podlipou.cz', 'Odpověď má obsahovat e-mail');
assert.equal(ucet.role, 'user', 'Role nového účtu je vždy user, i když si klient pošle admin');
assert.ok(ucet.id, 'Odpověď má obsahovat id účtu');
const jakoText = JSON.stringify(ucet);
assert.doesNotMatch(jakoText, /silneheslo1/, 'Heslo se nikdy nevrací v odpovědi');
assert.doesNotMatch(jakoText, /"(password|hash|salt)"/, 'V odpovědi nemá co dělat heslo, hash ani sůl');
```

Krátké heslo a zabraný e-mail mají svoje kódy chyb.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body) => fetch(`${server.url}${path}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

const kratke = await post('/api/register', { email: 'petr@podlipou.cz', password: 'krat' });
assert.equal(kratke.status, 400, 'Heslo kratší než 8 znaků má vrátit 400');
assert.equal((await kratke.json()).error?.code, 'INVALID_INPUT', 'Krátké heslo má mít kód INVALID_INPUT');

const bezMailu = await post('/api/register', { password: 'silneheslo1' });
assert.equal(bezMailu.status, 400, 'Chybějící e-mail má vrátit 400');

await post('/api/register', { email: 'petr@podlipou.cz', password: 'silneheslo1' });
const znovu = await post('/api/register', { email: 'petr@podlipou.cz', password: 'jineheslo9' });
assert.equal(znovu.status, 409, 'Druhá registrace na stejný e-mail má vrátit 409');
assert.equal((await znovu.json()).error?.code, 'EMAIL_TAKEN', 'Zabraný e-mail má mít kód EMAIL_TAKEN');
```

Přihlášení vrací token a chybné údaje se od sebe nedají odlišit.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body) => fetch(`${server.url}${path}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

await post('/api/register', { email: 'eva@podlipou.cz', password: 'silneheslo1' });
const ok = await post('/api/login', { email: 'eva@podlipou.cz', password: 'silneheslo1' });
assert.equal(ok.status, 200, `Přihlášení správnými údaji má vrátit 200. Výstup serveru:\n${server.output()}`);
assert.equal(typeof (await ok.json()).token, 'string', 'Přihlášení má vrátit { token }');

const spatneHeslo = await post('/api/login', { email: 'eva@podlipou.cz', password: 'uplnejine1' });
const neznamyMail = await post('/api/login', { email: 'nikdo@podlipou.cz', password: 'silneheslo1' });
assert.equal(spatneHeslo.status, 401, 'Špatné heslo má vrátit 401');
assert.equal(neznamyMail.status, 401, 'Neexistující e-mail má vrátit 401');
const teloSpatne = await spatneHeslo.json();
assert.deepEqual(teloSpatne, await neznamyMail.json(), 'Obě odpovědi musí být stejné, jinak útočník pozná existující e-maily');
assert.equal(teloSpatne.error?.code, 'INVALID_CREDENTIALS', 'Chybné přihlášení má mít kód INVALID_CREDENTIALS');

const sprava = await post('/api/login', { email: 'sprava@podlipou.cz', password: 'zasedacky2026' });
assert.equal(sprava.status, 200, 'Správcovský účet sprava@podlipou.cz má být připravený od startu');
```

Místnosti jsou veřejné, rezervace ne.

```js
const server = await helpers.startServer('src/server.js');
const rooms = await fetch(`${server.url}/api/rooms`);
assert.equal(rooms.status, 200, 'GET /api/rooms je veřejné');
const seznam = await rooms.json();
assert.ok(Array.isArray(seznam) && seznam.length >= 3, 'GET /api/rooms má vrátit pole místností z data/rooms.json');

const bezTokenu = await fetch(`${server.url}/api/reservations`);
assert.equal(bezTokenu.status, 401, 'Bez tokenu má /api/reservations vrátit 401');
assert.equal((await bezTokenu.json()).error?.code, 'UNAUTHORIZED', 'Chybějící token má mít kód UNAUTHORIZED');

const spatnyToken = await fetch(`${server.url}/api/reservations`, { headers: { Authorization: 'Bearer vymysleny' } });
assert.equal(spatnyToken.status, 401, 'Neplatný token má vrátit 401');
```

Vytvoření rezervace a validace vstupu.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body, token) => fetch(`${server.url}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});
await post('/api/register', { email: 'eva@podlipou.cz', password: 'silneheslo1' });
const { token } = await (await post('/api/login', { email: 'eva@podlipou.cz', password: 'silneheslo1' })).json();
const roomId = (await (await fetch(`${server.url}/api/rooms`)).json())[0].id;

const vytvorena = await post('/api/reservations', { roomId, date: '2026-10-05', startHour: 9, hours: 2 }, token);
assert.equal(vytvorena.status, 201, `Platná rezervace má vrátit 201. Výstup serveru:\n${server.output()}`);
const rezervace = await vytvorena.json();
assert.ok(rezervace.id, 'Vytvořená rezervace má mít id');

const spatne = [
  { roomId: 'neexistuje', date: '2026-10-05', startHour: 9, hours: 1 },
  { roomId, date: '5. 10. 2026', startHour: 9, hours: 1 },
  { roomId, date: '2026-10-05', startHour: 6, hours: 1 },
  { roomId, date: '2026-10-05', startHour: 9.5, hours: 1 },
  { roomId, date: '2026-10-05', startHour: 9, hours: 0 },
  { roomId, date: '2026-10-05', startHour: 9, hours: 5 },
  { roomId, date: '2026-10-05', startHour: 20, hours: 3 },
];
for (const telo of spatne) {
  const res = await post('/api/reservations', telo, token);
  assert.equal(res.status, 400, `Vstup ${JSON.stringify(telo)} má skončit stavem 400`);
  assert.equal((await res.json()).error?.code, 'INVALID_INPUT', `Vstup ${JSON.stringify(telo)} má mít kód INVALID_INPUT`);
}
```

Dvě rezervace se nepřekrývají — a když se překrývají, druhá neprojde.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body, token) => fetch(`${server.url}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});
await post('/api/register', { email: 'eva@podlipou.cz', password: 'silneheslo1' });
const { token } = await (await post('/api/login', { email: 'eva@podlipou.cz', password: 'silneheslo1' })).json();
const rooms = await (await fetch(`${server.url}/api/rooms`)).json();
const [prvni, druha] = rooms;

await post('/api/reservations', { roomId: prvni.id, date: '2026-10-05', startHour: 9, hours: 2 }, token);

const prekryv = await post('/api/reservations', { roomId: prvni.id, date: '2026-10-05', startHour: 10, hours: 1 }, token);
assert.equal(prekryv.status, 409, 'Překrývající se rezervace má vrátit 409');
assert.equal((await prekryv.json()).error?.code, 'ROOM_TAKEN', 'Obsazený termín má mít kód ROOM_TAKEN');

const navazuje = await post('/api/reservations', { roomId: prvni.id, date: '2026-10-05', startHour: 11, hours: 1 }, token);
assert.equal(navazuje.status, 201, 'Navazující rezervace (od 11 h) se překrývat nemá');
const jinyDen = await post('/api/reservations', { roomId: prvni.id, date: '2026-10-06', startHour: 9, hours: 2 }, token);
assert.equal(jinyDen.status, 201, 'Stejný čas v jiném dni je volný');
const jinaMistnost = await post('/api/reservations', { roomId: druha.id, date: '2026-10-05', startHour: 9, hours: 2 }, token);
assert.equal(jinaMistnost.status, 201, 'Stejný čas v jiné místnosti je volný');
```

Výpis je stránkovaný, seřazený a uživatel vidí jen svoje.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body, token) => fetch(`${server.url}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});
const prihlas = async (email) => {
  await post('/api/register', { email, password: 'silneheslo1' });
  return (await (await post('/api/login', { email, password: 'silneheslo1' })).json()).token;
};
const eva = await prihlas('eva@podlipou.cz');
const petr = await prihlas('petr@podlipou.cz');
const roomId = (await (await fetch(`${server.url}/api/rooms`)).json())[0].id;

for (const [date, startHour] of [['2026-10-07', 13], ['2026-10-05', 9], ['2026-10-05', 15], ['2026-10-06', 8]]) {
  await post('/api/reservations', { roomId, date, startHour, hours: 1 }, eva);
}
await post('/api/reservations', { roomId, date: '2026-10-05', startHour: 11, hours: 1 }, petr);

const vypis = await (await fetch(`${server.url}/api/reservations`, { headers: { Authorization: `Bearer ${eva}` } })).json();
assert.equal(vypis.total, 4, `Eva má čtyři rezervace, ne ${vypis.total} — cizí do výpisu nepatří`);
assert.equal(vypis.page, 1, 'Výchozí page je 1');
assert.equal(vypis.perPage, 10, 'Výchozí perPage je 10');
assert.deepEqual(
  vypis.items.map((r) => `${r.date} ${r.startHour}`),
  ['2026-10-05 9', '2026-10-05 15', '2026-10-06 8', '2026-10-07 13'],
  'Výpis má být seřazený podle date a startHour',
);

const strana = await (await fetch(`${server.url}/api/reservations?page=2&perPage=2`, { headers: { Authorization: `Bearer ${eva}` } })).json();
assert.equal(strana.items.length, 2, 'Druhá strana po dvou má dvě položky');
assert.equal(strana.items[0].date, '2026-10-06', 'Druhá strana začíná pátou… tedy třetí rezervací v pořadí');
const velka = await (await fetch(`${server.url}/api/reservations?perPage=500`, { headers: { Authorization: `Bearer ${eva}` } })).json();
assert.ok(velka.perPage <= 50, `perPage má být omezené na 50, je ${velka.perPage}`);
```

Role rozhodují o tom, kdo vidí a maže cizí rezervace.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body, token) => fetch(`${server.url}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});
const prihlas = async (email) => {
  await post('/api/register', { email, password: 'silneheslo1' });
  return (await (await post('/api/login', { email, password: 'silneheslo1' })).json()).token;
};
const eva = await prihlas('eva@podlipou.cz');
const petr = await prihlas('petr@podlipou.cz');
const admin = (await (await post('/api/login', { email: 'sprava@podlipou.cz', password: 'zasedacky2026' })).json()).token;
const roomId = (await (await fetch(`${server.url}/api/rooms`)).json())[0].id;

const evina = await (await post('/api/reservations', { roomId, date: '2026-10-05', startHour: 9, hours: 1 }, eva)).json();
await post('/api/reservations', { roomId, date: '2026-10-05', startHour: 12, hours: 1 }, petr);

const adminVypis = await (await fetch(`${server.url}/api/reservations`, { headers: { Authorization: `Bearer ${admin}` } })).json();
assert.equal(adminVypis.total, 2, 'Admin vidí všechny rezervace');

const smazat = (id, token) => fetch(`${server.url}/api/reservations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
const cizi = await smazat(evina.id, petr);
assert.equal(cizi.status, 403, 'Běžný uživatel nesmí smazat cizí rezervaci');
assert.equal((await cizi.json()).error?.code, 'FORBIDDEN', 'Zamítnuté mazání má mít kód FORBIDDEN');
assert.equal((await smazat('neexistujici-id', admin)).status, 404, 'Mazání neexistující rezervace končí 404');
assert.equal((await smazat(evina.id, admin)).status, 204, 'Admin smí smazat cizí rezervaci, odpověď je 204 bez těla');

const poSmazani = await (await fetch(`${server.url}/api/reservations`, { headers: { Authorization: `Bearer ${eva}` } })).json();
assert.equal(poSmazani.total, 0, 'Po smazání Eva žádnou rezervaci nemá');
```

Do logu se nedostane heslo ani token a neošetřená chyba server neshodí.

```js
const server = await helpers.startServer('src/server.js');
const post = (path, body) => fetch(`${server.url}${path}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
await post('/api/register', { email: 'eva@podlipou.cz', password: 'tajneheslo42' });
await post('/api/login', { email: 'eva@podlipou.cz', password: 'uplneSpatne99' });
await fetch(`${server.url}/api/neexistuje`);
await fetch(`${server.url}/api/reservations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'tohle není json' });

const zdravi = await fetch(`${server.url}/health`);
assert.equal(zdravi.status, 200, 'Po sérii chybných požadavků musí server pořád běžet');

const log = server.output();
assert.doesNotMatch(log, /tajneheslo42|uplneSpatne99/, 'Do logu se nesmí dostat heslo');
const radky = log.split('\n').filter((radek) => radek.trim().startsWith('{'));
assert.ok(radky.length >= 1, `Chyby se mají logovat jako JSON řádky, v logu ale žádný není:\n${log}`);
const zaznam = JSON.parse(radky.at(-1));
assert.equal(zaznam.level, 'error', 'Záznam o chybě má mít level: "error"');
assert.equal(typeof zaznam.code, 'string', 'Záznam o chybě má mít code');
```

Zdrojový kód: heslo je hashované a port se bere z prostředí.

```js
const zdroj = helpers.stripComments(files['src/server.js'], 'js');
assert.match(zdroj, /scrypt/i, 'Heslo hashuj pomocí scrypt z node:crypto');
assert.match(zdroj, /process\.env\.PORT/, 'Port ber z process.env.PORT (výchozí 3000)');
assert.doesNotMatch(zdroj, /password\s*[,}]\s*\/\/\s*ulož/i, 'Heslo v otevřené podobě se neukládá');
```

# --help--

## --tip--

Nezačínej rezervacemi. Nejdřív si udělej dvě věci, o které se opře všechno ostatní:
jednu funkci na odeslání JSON odpovědi a jednu třídu chyby, která nese stav i kód.
Pak je každá další část jen `throw new AppError(409, 'ROOM_TAKEN', '…')`.

## --tip--

Překryv dvou intervalů se testuje jednou podmínkou: začátek prvního je dřív než konec
druhého **a zároveň** začátek druhého je dřív než konec prvního. Nezapomeň, že se
porovnávají jen rezervace ve stejné místnosti a stejný den.

# --seed--

## --file-- README.md

````md
# Rezervace zasedaček Pod Lipou

JSON API pro rezervaci pěti zasedacích místností.

## Spuštění

```sh
npm start          # server na http://localhost:3000
PORT=4000 npm start
```

## Endpointy

| Metoda | Cesta | Přístup |
|---|---|---|
| GET | `/health` | veřejné |
| GET | `/api/rooms` | veřejné |
| POST | `/api/register` | veřejné |
| POST | `/api/login` | veřejné |
| GET | `/api/reservations` | přihlášený |
| POST | `/api/reservations` | přihlášený |
| DELETE | `/api/reservations/:id` | vlastník nebo admin |

Stav se drží v paměti — po restartu je prázdný. Správcovský účet
`sprava@podlipou.cz` je připravený od startu.
````

## --file-- data/rooms.json

```json
[
  { "id": "lipa", "name": "Lípa", "seats": 12, "floor": 1 },
  { "id": "dub", "name": "Dub", "seats": 8, "floor": 1 },
  { "id": "buk", "name": "Buk", "seats": 4, "floor": 2 },
  { "id": "javor", "name": "Javor", "seats": 20, "floor": 2 },
  { "id": "briza", "name": "Bříza", "seats": 6, "floor": 3 }
]
```

## --file-- package.json

```json
{
  "name": "zasedacky-pod-lipou",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  }
}
```

## --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const rooms = JSON.parse(readFileSync(new URL('../data/rooms.json', import.meta.url), 'utf8'));

// Stav aplikace. Po restartu je prázdný — databáze tu není potřeba.
const users = new Map(); // email -> { id, email, role, salt, hash }
const tokens = new Map(); // token -> id uživatele
const reservations = new Map(); // id -> { id, userId, roomId, date, startHour, hours }

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, { status: 'ok' });
  }

  // TODO: veřejné /api/rooms, registrace, přihlášení
  // TODO: rezervace za tokenem, stránkování, role
  // TODO: jednotný tvar chyb a logování

  return json(res, 404, { error: { code: 'NOT_FOUND', message: 'Taková cesta tu není.' } });
});

server.listen(Number(process.env.PORT ?? 3000));
```

# --solution--

## --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const rooms = JSON.parse(readFileSync(new URL('../data/rooms.json', import.meta.url), 'utf8'));

const users = new Map(); // email -> { id, email, role, salt, hash }
const tokens = new Map(); // token -> id uživatele
const reservations = new Map(); // id -> { id, userId, roomId, date, startHour, hours }

const MAX_PER_PAGE = 50;
const OPEN_HOUR = 7;
const LAST_START = 20;
const CLOSE_HOUR = 21;

class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

// --- hesla -----------------------------------------------------------------

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
}

function passwordMatches(password, salt, hash) {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function createUser(email, password, role) {
  const { salt, hash } = hashPassword(password);
  const user = { id: randomUUID(), email, role, salt, hash };
  users.set(email, user);
  return user;
}

createUser('sprava@podlipou.cz', 'zasedacky2026', 'admin');

const publicUser = (user) => ({ id: user.id, email: user.email, role: user.role });

// --- odpovědi a logování ---------------------------------------------------

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function logError(error) {
  // Do logu jde jen kód a zpráva. Heslo ani token tu nemají co dělat.
  console.error(JSON.stringify({
    level: 'error',
    code: error.code ?? 'INTERNAL_ERROR',
    message: error.message,
  }));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AppError(400, 'INVALID_INPUT', 'Tělo požadavku musí být platný JSON.');
  }
}

// --- přihlášení ------------------------------------------------------------

function requireUser(req) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  const userId = tokens.get(token);
  const user = userId && [...users.values()].find((item) => item.id === userId);
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Přihlas se.');
  return user;
}

// --- validace --------------------------------------------------------------

function invalid(message) {
  throw new AppError(400, 'INVALID_INPUT', message);
}

function parseCredentials(body) {
  const { email, password } = body ?? {};
  if (typeof email !== 'string' || !email.includes('@')) invalid('E-mail není platný.');
  if (typeof password !== 'string' || password.length < 8) invalid('Heslo musí mít aspoň 8 znaků.');
  return { email: email.trim().toLowerCase(), password };
}

function parseReservation(body) {
  const { roomId, date, startHour, hours } = body ?? {};
  if (typeof roomId !== 'string' || !rooms.some((room) => room.id === roomId)) invalid('Takovou místnost neznáme.');
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) invalid('Datum musí být ve tvaru RRRR-MM-DD.');
  if (!Number.isInteger(startHour) || startHour < OPEN_HOUR || startHour > LAST_START) {
    invalid(`Začátek musí být celá hodina mezi ${OPEN_HOUR} a ${LAST_START}.`);
  }
  if (!Number.isInteger(hours) || hours < 1 || hours > 4) invalid('Rezervovat jde 1 až 4 hodiny.');
  if (startHour + hours > CLOSE_HOUR) invalid(`Budova se zavírá ve ${CLOSE_HOUR} hodin.`);
  return { roomId, date, startHour, hours };
}

function overlaps(a, b) {
  if (a.roomId !== b.roomId || a.date !== b.date) return false;
  return a.startHour < b.startHour + b.hours && b.startHour < a.startHour + a.hours;
}

// --- routy -----------------------------------------------------------------

async function handle(req, res, url) {
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/health') return json(res, 200, { status: 'ok' });
  if (req.method === 'GET' && pathname === '/api/rooms') return json(res, 200, rooms);

  if (req.method === 'POST' && pathname === '/api/register') {
    const { email, password } = parseCredentials(await readJson(req));
    if (users.has(email)) throw new AppError(409, 'EMAIL_TAKEN', 'Tenhle e-mail už je registrovaný.');
    // Roli si klient nevybírá, jinak by si ji každý poslal v těle.
    return json(res, 201, publicUser(createUser(email, password, 'user')));
  }

  if (req.method === 'POST' && pathname === '/api/login') {
    const { email, password } = parseCredentials(await readJson(req));
    const user = users.get(email);
    // Stejná odpověď pro špatné heslo i neznámý e-mail: jinak jde zjistit, kdo je registrovaný.
    if (!user || !passwordMatches(password, user.salt, user.hash)) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail nebo heslo nesedí.');
    }
    const token = randomBytes(24).toString('hex');
    tokens.set(token, user.id);
    return json(res, 200, { token });
  }

  if (pathname === '/api/reservations' && (req.method === 'GET' || req.method === 'POST')) {
    const user = requireUser(req);

    if (req.method === 'POST') {
      const input = parseReservation(await readJson(req));
      const obsazeno = [...reservations.values()].some((item) => overlaps(item, input));
      if (obsazeno) throw new AppError(409, 'ROOM_TAKEN', 'Místnost je v tu dobu obsazená.');
      const reservation = { id: randomUUID(), userId: user.id, ...input };
      reservations.set(reservation.id, reservation);
      return json(res, 201, reservation);
    }

    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Number(url.searchParams.get('perPage') ?? 10) || 10));
    const vlastni = [...reservations.values()]
      .filter((item) => user.role === 'admin' || item.userId === user.id)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);
    const od = (page - 1) * perPage;
    return json(res, 200, { items: vlastni.slice(od, od + perPage), page, perPage, total: vlastni.length });
  }

  const smazat = req.method === 'DELETE' && /^\/api\/reservations\/[^/]+$/.test(pathname);
  if (smazat) {
    const user = requireUser(req);
    const id = pathname.split('/').at(-1);
    const reservation = reservations.get(id);
    if (!reservation) throw new AppError(404, 'NOT_FOUND', 'Taková rezervace neexistuje.');
    if (reservation.userId !== user.id && user.role !== 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'Cizí rezervaci smazat nemůžeš.');
    }
    reservations.delete(id);
    return json(res, 204, undefined);
  }

  throw new AppError(404, 'NOT_FOUND', 'Taková cesta tu není.');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    await handle(req, res, url);
  } catch (error) {
    // Jediné místo, kde se chyby převádějí na odpověď — jinak by se tvar rozešel.
    const known = error instanceof AppError;
    logError(error);
    json(res, known ? error.status : 500, {
      error: {
        code: known ? error.code : 'INTERNAL_ERROR',
        message: known ? error.message : 'Něco se pokazilo na naší straně.',
      },
    });
  }
});

server.listen(Number(process.env.PORT ?? 3000));
```

# --review--

Testy zkontrolovaly chování. Tohle si projdi sám, než kontrolní bod uzavřeš.

## --rubric--

- Chyby vznikají na jednom místě a na odpověď se převádějí taky na jednom místě.
- Validace vstupu je oddělená od logiky rezervací — dá se číst zvlášť.
- V kódu není dvakrát napsané to samé (hlavně kolem přihlášení a rolí).
- Názvy funkcí říkají, co dělají, bez komentáře.
- Kdyby se zítra přidala šestá místnost nebo třetí role, víš přesně, kam sáhneš.
- Kdybys to měl nasadit, víš, co je potřeba doplnit (trvalé úložiště, expirace tokenů, limity požadavků).

## --extensions--

- **Expirace tokenu.** Ulož si ke každému tokenu čas vydání a po hodině ho odmítej.
- **Omezení počtu pokusů o přihlášení** z jedné IP — pět za minutu.
- **Trvalé úložiště** místo `Map`: soubor JSON, nebo `node:sqlite`.
- **Kontejner a CI**, jak jsi je psal v labu s Dockerfilem: obraz, který tohle API
  spustí, a workflow, které pustí testy.
