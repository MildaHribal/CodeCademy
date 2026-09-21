---
title: API úkolů
runtime: node
timeoutMs: 20000
see: api-http-rest/navrh-rest#zdroje-a-adresy, api-http-rest/navrh-rest#jednotny-tvar-chyb-problem-json, api-http-rest/validace-a-chyby-api#schema-v-zodu-na-serveru, api-http-rest/cors-a-cache#stejny-puvod-a-cors-ze-strany-serveru
---

# --description--

Spolubydlící chtějí přestat řešit úklid po nástěnce na ledničce a chtějí na to appku.
Ty jim napíšeš **API**, ze kterého bude appka žít — dneska jen s daty v paměti, ale
se vším, co od API čeká ten, kdo ho bude volat: filtrováním, stránkováním, validací
a chybami, které se dají zpracovat.

Frontend poběží na jiné adrese než API, takže bez CORS hlaviček by ho prohlížeč
nepustil k odpovědi.

## Co má API umět

| metoda a adresa | co dělá |
|---|---|
| `GET /ukoly` | vrátí seznam úkolů |
| `GET /ukoly?hotovo=true` | vrátí jen hotové (nebo `false` jen nehotové) |
| `GET /ukoly?limit=2&offset=1` | vrátí výřez seznamu |
| `GET /ukoly/:id` | vrátí jeden úkol, nebo `404` |
| `POST /ukoly` | založí úkol a vrátí `201` s ním |

## Pravidla

- **Chyby mají jednotný tvar.** Každá chybová odpověď je JSON s klíči `title`, `status`
  a `detail` — ať jde o `404`, `400`, nebo neexistující cestu. U chyby validace navíc
  pole `errors` se seznamem polí, která neprošla, ať s tím formulář na druhé straně
  umí pracovat.
- **Tělo `POST` se validuje Zodem.** `nazev` je povinný neprázdný text do 120 znaků,
  `hotovo` je nepovinný boolean s výchozí hodnotou `false`. Cokoli navíc se zahodí.
- **Nové `id` je vždy o jedna větší než dosud největší.** Klient ho neposílá, a když
  pošle, nebereš ho.
- **CORS hlavičky jsou u každé odpovědi**, včetně odpovědi na `OPTIONS` (preflight).

Data ať zůstanou v poli v paměti — databáze přijde v další sekci.

> [!TIP]
> Jednotný tvar chyby napiš jako jednu funkci a volej ji ze všech míst. Když ho budeš
> psát pokaždé znovu, do třetice se od sebe budou odpovědi lišit a klient to pozná.

# --hints--

`GET /ukoly` vrátí stav `200`, JSON a všechny tři úkoly.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/ukoly', server.url));
assert.equal(res.status, 200, `GET /ukoly má vrátit 200, přišlo ${res.status}`);
assert.match(res.headers.get('content-type') ?? '', /^application\/json/i, `GET /ukoly má mít Content-Type application/json, přišlo: ${res.headers.get('content-type')}`);
const data = await res.json();
assert.ok(Array.isArray(data), 'GET /ukoly má vrátit pole úkolů');
assert.equal(data.length, 3, `GET /ukoly má vrátit tři úkoly, vrátilo ${data.length}`);
assert.deepEqual(data.map((u) => u.id), [1, 2, 3], 'Úkoly mají přijít v pořadí podle id');
```

`?hotovo=true` a `?hotovo=false` filtrují podle stavu.

```js
const server = await helpers.startServer('server.js');
const nazvy = async (path) => {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 200, `GET ${path} má vrátit 200, přišlo ${res.status}`);
  return (await res.json()).map((u) => u.nazev);
};
assert.deepEqual(await nazvy('/ukoly?hotovo=true'), ['Vynést tříděný odpad'], 'GET /ukoly?hotovo=true má vrátit jen hotové úkoly');
assert.deepEqual(await nazvy('/ukoly?hotovo=false'), ['Umýt nádobí', 'Koupit toaleťák'], 'GET /ukoly?hotovo=false má vrátit jen nehotové úkoly');
assert.equal((await nazvy('/ukoly')).length, 3, 'GET /ukoly bez parametru má vrátit všechny');
```

`limit` a `offset` vracejí výřez seznamu a jdou zkombinovat s filtrem.

```js
const server = await helpers.startServer('server.js');
const ids = async (path) => {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 200, `GET ${path} má vrátit 200, přišlo ${res.status}`);
  return (await res.json()).map((u) => u.id);
};
assert.deepEqual(await ids('/ukoly?limit=2'), [1, 2], 'limit=2 má vrátit první dva úkoly');
assert.deepEqual(await ids('/ukoly?offset=1'), [2, 3], 'offset=1 má první úkol přeskočit');
assert.deepEqual(await ids('/ukoly?limit=1&offset=1'), [2], 'limit=1&offset=1 má vrátit druhý úkol');
assert.deepEqual(await ids('/ukoly?hotovo=false&limit=1'), [1], 'Filtr a stránkování jdou dohromady — nejdřív se filtruje, pak stránkuje');
```

`GET /ukoly/:id` vrátí jeden úkol.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/ukoly/2', server.url));
assert.equal(res.status, 200, `GET /ukoly/2 má vrátit 200, přišlo ${res.status}`);
const ukol = await res.json();
assert.equal(ukol.id, 2, 'Má přijít úkol s id 2');
assert.equal(ukol.nazev, 'Vynést tříděný odpad', `Přišel úkol „${ukol.nazev}"`);
assert.ok(!Array.isArray(ukol), 'Detail má vrátit objekt, ne pole s jedním prvkem');
```

Neexistující úkol vrátí `404` v jednotném tvaru chyby.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/ukoly/999', server.url));
assert.equal(res.status, 404, `GET /ukoly/999 má vrátit 404, přišlo ${res.status}`);
assert.match(res.headers.get('content-type') ?? '', /json/i, 'I chyba má být JSON');
const chyba = await res.json();
for (const klic of ['title', 'status', 'detail']) {
  assert.ok(klic in chyba, `V chybové odpovědi chybí klíč ${klic}, přišlo: ${JSON.stringify(chyba)}`);
}
assert.equal(chyba.status, 404, '`status` v těle má odpovídat stavovému kódu');
assert.ok(String(chyba.detail).length > 5, '`detail` má říct, co se stalo');
```

`POST /ukoly` s platným tělem založí úkol a vrátí `201` i s ním.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/ukoly', server.url), {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ nazev: 'Zalít kytky' }),
});
assert.equal(res.status, 201, `Platný POST má vrátit 201 Created, přišlo ${res.status}`);
const ukol = await res.json();
assert.equal(ukol.nazev, 'Zalít kytky', 'Odpověď má obsahovat založený úkol');
assert.equal(ukol.hotovo, false, 'Nevyplněné `hotovo` má být false');
assert.equal(ukol.id, 4, `Nové id má být 4 (o jedna větší než největší dosavadní), přišlo ${ukol.id}`);
const seznam = await (await fetch(new URL('/ukoly', server.url))).json();
assert.equal(seznam.length, 4, 'Po založení má seznam obsahovat čtyři úkoly');
```

`POST /ukoly` bere `hotovo` z těla a ignoruje `id` i cizí klíče.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/ukoly', server.url), {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ id: 999, nazev: 'Vyluxovat', hotovo: true, admin: true }),
});
assert.equal(res.status, 201, `Platný POST má vrátit 201, přišlo ${res.status}`);
const ukol = await res.json();
assert.equal(ukol.hotovo, true, '`hotovo: true` z těla se má použít');
assert.equal(ukol.id, 4, `id z těla se nemá brát — nové id má být 4, přišlo ${ukol.id}`);
assert.ok(!('admin' in ukol), 'Klíče, které nejsou ve schématu, se mají zahodit');
```

Neplatné tělo vrátí `400` se seznamem polí, která neprošla.

```js
const server = await helpers.startServer('server.js');
const posli = (body) => fetch(new URL('/ukoly', server.url), {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});
for (const [body, popis] of [[{ nazev: '' }, 'prázdný název'], [{}, 'chybějící název'], [{ nazev: 'x'.repeat(200) }, 'příliš dlouhý název'], [{ nazev: 'Uklidit', hotovo: 'ano' }, '`hotovo` není boolean']]) {
  const res = await posli(body);
  assert.equal(res.status, 400, `POST s ${popis} má vrátit 400, přišlo ${res.status}`);
  const chyba = await res.json();
  assert.equal(chyba.status, 400, `U chyby (${popis}) má být status 400 i v těle`);
  assert.ok(Array.isArray(chyba.errors) && chyba.errors.length > 0, `U chyby validace (${popis}) chybí pole errors se seznamem vadných polí, přišlo: ${JSON.stringify(chyba)}`);
}
const seznam = await (await fetch(new URL('/ukoly', server.url))).json();
assert.equal(seznam.length, 3, 'Neplatný POST nesmí nic založit');
```

Neznámá cesta vrátí `404` ve stejném tvaru jako ostatní chyby.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/neexistuje', server.url));
assert.equal(res.status, 404, `Neznámá cesta má vrátit 404, přišlo ${res.status}`);
assert.match(res.headers.get('content-type') ?? '', /json/i, 'I u neznámé cesty má přijít JSON, ne HTML stránka Expressu');
const chyba = await res.json();
for (const klic of ['title', 'status', 'detail']) {
  assert.ok(klic in chyba, `V odpovědi chybí klíč ${klic}, přišlo: ${JSON.stringify(chyba)}`);
}
```

Odpovědi mají CORS hlavičku, takže se API dá volat z jiné adresy.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/ukoly', server.url), { headers: { origin: 'http://localhost:5173' } });
const allow = res.headers.get('access-control-allow-origin');
assert.ok(allow, 'Odpovědi chybí hlavička Access-Control-Allow-Origin — prohlížeč by odpověď cizí stránce nepustil');
assert.ok(allow === '*' || allow === 'http://localhost:5173', `Access-Control-Allow-Origin je „${allow}" — má být * nebo původ, který se ptá`);
```

Preflight `OPTIONS` projde a řekne, co je povolené.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/ukoly', server.url), {
  method: 'OPTIONS',
  headers: {
    origin: 'http://localhost:5173',
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'content-type',
  },
});
assert.ok(res.status === 200 || res.status === 204, `Preflight má vrátit 200 nebo 204, přišlo ${res.status}`);
assert.ok(res.headers.get('access-control-allow-origin'), 'Preflight odpovědi chybí Access-Control-Allow-Origin');
assert.match(res.headers.get('access-control-allow-methods') ?? '', /POST/i, `Access-Control-Allow-Methods je „${res.headers.get('access-control-allow-methods')}" — má obsahovat POST`);
assert.match(res.headers.get('access-control-allow-headers') ?? '', /content-type/i, `Access-Control-Allow-Headers je „${res.headers.get('access-control-allow-headers')}" — má obsahovat Content-Type`);
```

# --help--

## --tip--

Jak má vypadat adresa zdroje a kam patří filtry a stránkování, je v částech
[Zdroje a adresy](see:api-http-rest/navrh-rest#zdroje-a-adresy) a
[Filtry a řazení v query](see:api-http-rest/navrh-rest#filtry-a-razeni-v-query).
Jednotný tvar chyby má [vlastní část](see:api-http-rest/navrh-rest#jednotny-tvar-chyb-problem-json).

## --tip--

Query parametry přicházejí **vždycky jako text** — `req.query.hotovo` je `'true'`, ne
`true`, a `req.query.limit` je `'2'`. Než je použiješ, převeď je. Schéma pro tělo
najdeš v části [Schéma v Zodu na serveru](see:api-http-rest/validace-a-chyby-api#schema-v-zodu-na-serveru).

# --seed--

## --file-- package.json

```json
{
  "name": "api-ukolu",
  "private": true,
  "type": "module",
  "dependencies": {
    "express": "^5.2.1",
    "zod": "^4.6.4"
  }
}
```

## --file-- server.js

```js
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Data zůstávají v paměti. Po restartu serveru se vrátí do tohohle stavu.
const ukoly = [
  { id: 1, nazev: 'Umýt nádobí', hotovo: false },
  { id: 2, nazev: 'Vynést tříděný odpad', hotovo: true },
  { id: 3, nazev: 'Koupit toaleťák', hotovo: false },
];

// --- Sem napiš CORS hlavičky, schéma, routy a jednotný tvar chyb. ---

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API úkolů běží na http://localhost:${port}`));
```

# --solution--

## --file-- server.js

```js
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Data zůstávají v paměti. Po restartu serveru se vrátí do tohohle stavu.
const ukoly = [
  { id: 1, nazev: 'Umýt nádobí', hotovo: false },
  { id: 2, nazev: 'Vynést tříděný odpad', hotovo: true },
  { id: 3, nazev: 'Koupit toaleťák', hotovo: false },
];

// CORS: hlavičky patří ke každé odpovědi, preflight se odbaví hned.
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Jeden tvar chyby na jednom místě — všechny routy ho volají.
function chyba(res, status, title, detail, errors) {
  const telo = { title, status, detail };
  if (errors) telo.errors = errors;
  return res.status(status).json(telo);
}

const schemaUkolu = z.object({
  nazev: z.string().trim().min(1, 'Název nesmí být prázdný').max(120, 'Název může mít nejvýš 120 znaků'),
  hotovo: z.boolean().default(false),
});

app.get('/ukoly', (req, res) => {
  let vysledek = ukoly;

  if (req.query.hotovo !== undefined) {
    const chce = req.query.hotovo === 'true';
    vysledek = vysledek.filter((ukol) => ukol.hotovo === chce);
  }

  const offset = Number(req.query.offset ?? 0);
  const limit = Number(req.query.limit ?? vysledek.length);
  res.json(vysledek.slice(offset, offset + limit));
});

app.get('/ukoly/:id', (req, res) => {
  const ukol = ukoly.find((u) => u.id === Number(req.params.id));
  if (!ukol) return chyba(res, 404, 'Not Found', `Úkol s id ${req.params.id} neexistuje.`);
  res.json(ukol);
});

app.post('/ukoly', (req, res) => {
  const vysledek = schemaUkolu.safeParse(req.body);
  if (!vysledek.success) {
    const errors = vysledek.error.issues.map((problem) => ({
      pole: problem.path.join('.') || '(tělo)',
      zprava: problem.message,
    }));
    return chyba(res, 400, 'Bad Request', 'Tělo požadavku neprošlo validací.', errors);
  }

  const novy = {
    id: ukoly.length ? Math.max(...ukoly.map((u) => u.id)) + 1 : 1,
    nazev: vysledek.data.nazev,
    hotovo: vysledek.data.hotovo,
  };
  ukoly.push(novy);
  res.status(201).json(novy);
});

// Cokoli, co se netrefilo do routy výš, dostane stejný tvar chyby jako zbytek API.
app.use((req, res) => chyba(res, 404, 'Not Found', `Cesta ${req.method} ${req.path} na tomhle API není.`));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API úkolů běží na http://localhost:${port}`));
```

# --approaches--

## --approach-- Routy v Routeru a chyby přes next()

Místo volání `chyba(res, …)` se chyba vyhodí a odchytí ji **jeden** chybový middleware
na konci. Ve větší aplikaci je to obvyklejší: routy se nestarají o tvar odpovědi vůbec
a když se tvar chyby změní, mění se na jediném místě. Za to platíš tím, že se musí
hlídat, aby chyba z asynchronní funkce doopravdy doputovala do `next()`.

### --file-- server.js

```js
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

const ukoly = [
  { id: 1, nazev: 'Umýt nádobí', hotovo: false },
  { id: 2, nazev: 'Vynést tříděný odpad', hotovo: true },
  { id: 3, nazev: 'Koupit toaleťák', hotovo: false },
];

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Vlastní typ chyby, kterému chybový middleware rozumí.
class ChybaApi extends Error {
  constructor(status, title, detail, errors) {
    super(detail);
    Object.assign(this, { status, title, detail, errors });
  }
}

const schemaUkolu = z.object({
  nazev: z.string().trim().min(1, 'Název nesmí být prázdný').max(120, 'Název může mít nejvýš 120 znaků'),
  hotovo: z.boolean().default(false),
});

const router = express.Router();

router.get('/', (req, res) => {
  let vysledek = ukoly;
  if (req.query.hotovo !== undefined) {
    const chce = req.query.hotovo === 'true';
    vysledek = vysledek.filter((ukol) => ukol.hotovo === chce);
  }
  const offset = Number(req.query.offset ?? 0);
  const limit = Number(req.query.limit ?? vysledek.length);
  res.json(vysledek.slice(offset, offset + limit));
});

router.get('/:id', (req, res, next) => {
  const ukol = ukoly.find((u) => u.id === Number(req.params.id));
  if (!ukol) return next(new ChybaApi(404, 'Not Found', `Úkol s id ${req.params.id} neexistuje.`));
  res.json(ukol);
});

router.post('/', (req, res, next) => {
  const vysledek = schemaUkolu.safeParse(req.body);
  if (!vysledek.success) {
    const errors = vysledek.error.issues.map((problem) => ({
      pole: problem.path.join('.') || '(tělo)',
      zprava: problem.message,
    }));
    return next(new ChybaApi(400, 'Bad Request', 'Tělo požadavku neprošlo validací.', errors));
  }
  const novy = {
    id: ukoly.length ? Math.max(...ukoly.map((u) => u.id)) + 1 : 1,
    ...vysledek.data,
  };
  ukoly.push(novy);
  res.status(201).json(novy);
});

app.use('/ukoly', router);

app.use((req, res, next) => next(new ChybaApi(404, 'Not Found', `Cesta ${req.method} ${req.path} na tomhle API není.`)));

// Jediné místo, kde se skládá tvar chybové odpovědi.
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  const telo = { title: err.title ?? 'Internal Server Error', status, detail: err.detail ?? 'Něco se pokazilo.' };
  if (err.errors) telo.errors = err.errors;
  res.status(status).json(telo);
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API úkolů běží na http://localhost:${port}`));
```

## --approach-- Query parametry taky přes Zod

Tělo se validuje Zodem, tak proč ne query? `z.coerce` převede text z adresy na číslo
nebo boolean a rovnou ověří rozsah — takže `?limit=abc` nebo `?limit=-5` neprojde
místo toho, aby tiše vrátilo nesmysl. Za to připlatíš pár řádky navíc; na větším API
se to vrátí, protože stejné schéma pak jde použít i k dokumentaci.

### --file-- server.js

```js
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

const ukoly = [
  { id: 1, nazev: 'Umýt nádobí', hotovo: false },
  { id: 2, nazev: 'Vynést tříděný odpad', hotovo: true },
  { id: 3, nazev: 'Koupit toaleťák', hotovo: false },
];

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function chyba(res, status, title, detail, errors) {
  const telo = { title, status, detail };
  if (errors) telo.errors = errors;
  return res.status(status).json(telo);
}

const schemaUkolu = z.object({
  nazev: z.string().trim().min(1, 'Název nesmí být prázdný').max(120, 'Název může mít nejvýš 120 znaků'),
  hotovo: z.boolean().default(false),
});

// Query je vždycky text, proto coerce. Rozsah se ověří rovnou tady.
const schemaFiltru = z.object({
  hotovo: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).default(0),
});

app.get('/ukoly', (req, res) => {
  const filtr = schemaFiltru.safeParse(req.query);
  if (!filtr.success) {
    const errors = filtr.error.issues.map((problem) => ({ pole: problem.path.join('.'), zprava: problem.message }));
    return chyba(res, 400, 'Bad Request', 'Parametry v adrese neprošly validací.', errors);
  }
  const { hotovo, limit, offset } = filtr.data;

  let vysledek = ukoly;
  if (hotovo !== undefined) vysledek = vysledek.filter((ukol) => ukol.hotovo === (hotovo === 'true'));
  res.json(vysledek.slice(offset, offset + (limit ?? vysledek.length)));
});

app.get('/ukoly/:id', (req, res) => {
  const ukol = ukoly.find((u) => u.id === Number(req.params.id));
  if (!ukol) return chyba(res, 404, 'Not Found', `Úkol s id ${req.params.id} neexistuje.`);
  res.json(ukol);
});

app.post('/ukoly', (req, res) => {
  const vysledek = schemaUkolu.safeParse(req.body);
  if (!vysledek.success) {
    const errors = vysledek.error.issues.map((problem) => ({
      pole: problem.path.join('.') || '(tělo)',
      zprava: problem.message,
    }));
    return chyba(res, 400, 'Bad Request', 'Tělo požadavku neprošlo validací.', errors);
  }
  const novy = { id: ukoly.length ? Math.max(...ukoly.map((u) => u.id)) + 1 : 1, ...vysledek.data };
  ukoly.push(novy);
  res.status(201).json(novy);
});

app.use((req, res) => chyba(res, 404, 'Not Found', `Cesta ${req.method} ${req.path} na tomhle API není.`));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API úkolů běží na http://localhost:${port}`));
```

# --review--

Testy kontrolují chování. Tohle si projdi sám, než API odevzdáš.

## --rubric--

- Tvar chyby skládám na jednom místě, ne v každé routě zvlášť.
- Zkusil jsem poslat `POST` s tělem, které není platný JSON — odpověď je JSON, ne HTML
  stránka Expressu s výpisem zásobníku.
- Zkusil jsem `GET /ukoly?limit=abc` a rozmyslel jsem si, co má API v takovém případě
  dělat (a dělá to).
- V odpovědi na chybu nikde neuniká cesta k souboru ani výpis zásobníku.
- Názvy v JSON jsou v celém API psané stejným způsobem (`nazev`, `hotovo` — ne jednou
  česky a jednou anglicky).
- Vyzkoušel jsem API `curl`em, ne jen testy — a přečetl jsem si celé odpovědi
  i s hlavičkami (`curl -i`).

## --extensions--

- Přidej `PATCH /ukoly/:id`, který mění jen `hotovo`, a rozmysli si, proč je to `PATCH`
  a ne `PUT`.
- Přidej `DELETE /ukoly/:id` s odpovědí `204 No Content` a ověř, že druhé smazání vrátí
  `404` (a že je to tak v pořádku).
- Doplň do odpovědi na `GET /ukoly` hlavičku s celkovým počtem záznamů, ať klient ví,
  kolik stránek ho čeká.
- Omez `Access-Control-Allow-Origin` na jednu konkrétní adresu z proměnné prostředí
  místo hvězdičky a zkus, co to udělá s voláním z jiného původu.
