---
title: API receptů
main: server.js
see: node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string
---

# --description--

Kuchařský web chce k receptům jednoduché API. Frontend si píše sám a od tebe potřebuje
server, který recepty vypíše, umí je filtrovat, ukáže jeden recept, seznam štítků
a přijme „like". Data jsou v souboru `recipes.json`; recept vypadá takhle:

```json
{ "id": 3, "title": "Čočkový salát", "minutes": 20, "tags": ["salát", "veganské"], "likes": 7 }
```

Tohle je lab: žádné kroky, jen zadání. Všechno potřebné jsi psal ve workshopu
[Postav HTTP server knihovny](see:node-zaklady/workshop-http-server/001). Server spouštěj
tlačítkem **Spustit** a zkoušej v panelu HTTP klienta.

## Uživatelské příběhy

- Když frontend pošle `GET /api/recipes`, dostane všechny recepty.
- Když k adrese přidá `?maxMinutes=30`, dostane jen recepty, které trvají nejvýš
  30 minut. Když přidá `?tag=veganské`, dostane jen recepty s tímhle štítkem. Oba
  parametry jde kombinovat. Když nic nesedí, dostane prázdné pole.
- Když pošle `maxMinutes`, které není kladné celé číslo, dostane `400` s vysvětlením.
- Když pošle `GET /api/recipes/3`, dostane jeden recept, nebo `404`, když takový není.
- Když pošle `GET /api/tags`, dostane všechny štítky, každý jednou, podle abecedy.
- Když pošle `POST /api/recipes/3/like`, recept dostane o jeden like víc, změna se
  uloží do souboru a v odpovědi přijde `{ "id": 3, "likes": 8 }`. Neexistující recept
  dostane `404`.
- Když použije metodu, kterou adresa neumí, dostane `405` a hlavičku `Allow`. Na
  neznámou adresu dostane `404`.
- Každá odpověď je JSON s hlavičkou `Content-Type: application/json; charset=utf-8`,
  chyby mají tvar `{ "error": "česká zpráva" }` a žádný požadavek server neshodí.

# --hints--

`GET /api/recipes` vrátí stav `200`, hlavičku `application/json; charset=utf-8` a všechny recepty.

```js
const server = await helpers.startServer('server.js');

const res = await fetch(new URL('/api/recipes', server.url));
assert.equal(res.status, 200, 'GET /api/recipes má vrátit stav 200');
const type = res.headers.get('content-type') ?? '';
assert.match(type, /^application\/json/i, `GET /api/recipes má mít Content-Type application/json, přišlo: ${type}`);
assert.match(type, /charset=utf-8/i, `Content-Type u GET /api/recipes má obsahovat charset=utf-8, přišlo: ${type}`);
assert.deepEqual(await res.json(), JSON.parse(files['recipes.json']), 'GET /api/recipes má vrátit všechny recepty z recipes.json');
```

`?maxMinutes=N` vrátí jen recepty, které trvají nejvýš `N` minut.

```js
const server = await helpers.startServer('server.js');
const ids = async (path) => {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 200, `GET ${path} má vrátit stav 200, přišlo ${res.status}`);
  return (await res.json()).map((recipe) => recipe.id);
};
assert.deepEqual(await ids('/api/recipes?maxMinutes=30'), [1, 3, 6], 'GET /api/recipes?maxMinutes=30 má vrátit recepty 1, 3 a 6 (včetně receptu na přesně 30 minut)');
assert.deepEqual(await ids('/api/recipes?maxMinutes=20'), [3], 'GET /api/recipes?maxMinutes=20 má vrátit jen recept 3');
```

`?tag=štítek` vrátí jen recepty s tímhle štítkem.

```js
const server = await helpers.startServer('server.js');
const ids = async (path) => {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 200, `GET ${path} má vrátit stav 200, přišlo ${res.status}`);
  return (await res.json()).map((recipe) => recipe.id);
};
assert.deepEqual(await ids('/api/recipes?tag=vegetari%C3%A1nsk%C3%A9'), [1, 4, 6], 'GET /api/recipes?tag=vegetariánské má vrátit recepty 1, 4 a 6');
assert.deepEqual(await ids('/api/recipes?tag=maso'), [2, 5], 'GET /api/recipes?tag=maso má vrátit recepty 2 a 5');
```

Oba filtry jde použít najednou.

```js
const server = await helpers.startServer('server.js');
const ids = async (path) => {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 200, `GET ${path} má vrátit stav 200, přišlo ${res.status}`);
  return (await res.json()).map((recipe) => recipe.id);
};
assert.deepEqual(await ids('/api/recipes?tag=vegetari%C3%A1nsk%C3%A9&maxMinutes=30'), [1, 6], 'GET /api/recipes?tag=vegetariánské&maxMinutes=30 má vrátit recepty 1 a 6');
assert.deepEqual(await ids('/api/recipes?maxMinutes=150&tag=maso'), [5], 'GET /api/recipes?maxMinutes=150&tag=maso má vrátit jen recept 5');
```

Když filtru nic neodpovídá, přijde stav `200` a prázdné pole.

```js
const server = await helpers.startServer('server.js');
const ids = async (path) => {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 200, `GET ${path} má vrátit stav 200, přišlo ${res.status}`);
  return (await res.json()).map((recipe) => recipe.id);
};
assert.deepEqual(await ids('/api/recipes?tag=ryba'), [], 'GET /api/recipes?tag=ryba má vrátit prázdné pole');
assert.deepEqual(await ids('/api/recipes?maxMinutes=5'), [], 'GET /api/recipes?maxMinutes=5 má vrátit prázdné pole');
assert.deepEqual(await ids('/api/recipes?tag=vegan'), [], 'GET /api/recipes?tag=vegan má vrátit prázdné pole — štítek se má shodovat celý, „vegan" není „veganské"');
```

Neplatné `maxMinutes` (`abc`, `0`, `-5`, `12.5`, prázdné) vrátí stav `400` s klíčem `error`.

```js
const server = await helpers.startServer('server.js');

for (const value of ['abc', '0', '-5', '12.5', '']) {
  const res = await fetch(new URL(`/api/recipes?maxMinutes=${value}`, server.url));
  assert.equal(res.status, 400, `GET /api/recipes?maxMinutes=${value} má vrátit stav 400, přišlo ${res.status}`);
  const body = await res.json();
  assert.equal(typeof body.error, 'string', `Odpověď na maxMinutes=${value} má mít klíč error s textem`);
}
```

`GET /api/recipes/:id` vrátí stav `200` a jeden recept.

```js
const server = await helpers.startServer('server.js');

const recipes = JSON.parse(files['recipes.json']);
for (const id of [3, 6]) {
  const res = await fetch(new URL(`/api/recipes/${id}`, server.url));
  assert.equal(res.status, 200, `GET /api/recipes/${id} má vrátit stav 200`);
  assert.deepEqual(await res.json(), recipes.find((recipe) => recipe.id === id), `GET /api/recipes/${id} má vrátit recept s id ${id}`);
}
```

Neexistující recept (`/api/recipes/99`, `/api/recipes/abc`) vrátí stav `404` s klíčem `error`.

```js
const server = await helpers.startServer('server.js');

for (const path of ['/api/recipes/99', '/api/recipes/abc']) {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 404, `GET ${path} má vrátit stav 404`);
  assert.equal(typeof (await res.json()).error, 'string', `Odpověď na GET ${path} má mít klíč error`);
}
```

`GET /api/tags` vrátí všechny štítky, každý jednou, seřazené podle abecedy.

```js
const server = await helpers.startServer('server.js');

const res = await fetch(new URL('/api/tags', server.url));
assert.equal(res.status, 200, 'GET /api/tags má vrátit stav 200');
assert.deepEqual(await res.json(), ['maso', 'omáčka', 'polévka', 'salát', 'sladké', 'veganské', 'vegetariánské'], 'GET /api/tags má vrátit sedm štítků z receptů, bez opakování a podle abecedy');
```

`POST /api/recipes/:id/like` přidá receptu jeden like, uloží ho do souboru a vrátí `{ id, likes }`.

```js
const fs = await import('node:fs/promises');
const recipesPath = `${helpers.dir}/recipes.json`;
const server = await helpers.startServer('server.js');
try {
  const first = await fetch(new URL('/api/recipes/4/like', server.url), { method: 'POST' });
  assert.equal(first.status, 200, 'POST /api/recipes/4/like má vrátit stav 200');
  assert.deepEqual(await first.json(), { id: 4, likes: 26 }, 'První POST /api/recipes/4/like má vrátit { id: 4, likes: 26 }');
  const second = await fetch(new URL('/api/recipes/4/like', server.url), { method: 'POST' });
  assert.deepEqual(await second.json(), { id: 4, likes: 27 }, 'Druhý POST /api/recipes/4/like má vrátit { id: 4, likes: 27 } — ukládáš like do souboru?');
  const saved = JSON.parse(await fs.readFile(recipesPath, 'utf8'));
  assert.equal(saved.find((recipe) => recipe.id === 4).likes, 27, 'Po dvou lajcích má mít recept 4 v recipes.json likes 27');
  assert.equal(saved.find((recipe) => recipe.id === 1).likes, 12, 'Like receptu 4 nemá změnit ostatní recepty');
} finally {
  await fs.writeFile(recipesPath, files['recipes.json']);
}
```

Like neexistujícího receptu vrátí stav `404` s klíčem `error` a soubor nezmění.

```js
const fs = await import('node:fs/promises');
const recipesPath = `${helpers.dir}/recipes.json`;
const server = await helpers.startServer('server.js');
try {
  const res = await fetch(new URL('/api/recipes/99/like', server.url), { method: 'POST' });
  assert.equal(res.status, 404, 'POST /api/recipes/99/like má vrátit stav 404');
  assert.equal(typeof (await res.json()).error, 'string', 'Odpověď na POST /api/recipes/99/like má mít klíč error');
  assert.deepEqual(JSON.parse(await fs.readFile(recipesPath, 'utf8')), JSON.parse(files['recipes.json']), 'POST /api/recipes/99/like nemá recipes.json změnit');
} finally {
  await fs.writeFile(recipesPath, files['recipes.json']);
}
```

Metoda, kterou adresa neumí, vrátí stav `405` a hlavičku `Allow` s metodou, která funguje.

```js
const fs = await import('node:fs/promises');
const recipesPath = `${helpers.dir}/recipes.json`;
const server = await helpers.startServer('server.js');
try {
  const cases = [
    ['DELETE', '/api/recipes', 'GET'],
    ['PUT', '/api/recipes/1', 'GET'],
    ['GET', '/api/recipes/1/like', 'POST'],
  ];
  for (const [method, path, allowed] of cases) {
    const res = await fetch(new URL(path, server.url), { method });
    assert.equal(res.status, 405, `${method} ${path} má vrátit stav 405, přišlo ${res.status}`);
    const allow = res.headers.get('allow') ?? '';
    assert.ok(allow.split(',').map((item) => item.trim()).includes(allowed), `Hlavička Allow u ${method} ${path} má obsahovat ${allowed}, přišlo: ${allow}`);
  }
  assert.deepEqual(JSON.parse(await fs.readFile(recipesPath, 'utf8')), JSON.parse(files['recipes.json']), 'Odpovědi 405 nemají recipes.json změnit');
} finally {
  await fs.writeFile(recipesPath, files['recipes.json']);
}
```

Neznámá adresa (`/`, `/api/nic`, `/api/recipes/1/nic`) vrátí stav `404` s klíčem `error`.

```js
const server = await helpers.startServer('server.js');

for (const path of ['/', '/api/nic', '/api/recipes/1/nic']) {
  const res = await fetch(new URL(path, server.url));
  assert.equal(res.status, 404, `GET ${path} má vrátit stav 404, přišlo ${res.status}`);
  assert.equal(typeof (await res.json()).error, 'string', `Odpověď na GET ${path} má mít klíč error`);
}
```

Po sérii vadných požadavků server běží dál.

```js
const fs = await import('node:fs/promises');
const recipesPath = `${helpers.dir}/recipes.json`;
const server = await helpers.startServer('server.js');
try {
  const bad = [
    ['GET', '/api/recipes?maxMinutes=abc'],
    ['POST', '/api/recipes/abc/like'],
    ['PATCH', '/api/tags'],
    ['GET', '/api/recipes/1/like/navic'],
  ];
  for (const [method, path] of bad) {
    await fetch(new URL(path, server.url), { method }).then((res) => res.text()).catch(() => {});
  }
  await helpers.wait(200);
  const res = await fetch(new URL('/api/recipes/1', server.url)).catch((error) =>
    assert.fail(`Po vadných požadavcích server přestal odpovídat (spadl?): ${error.message}\n${server.output()}`));
  assert.equal(res.status, 200, 'Po vadných požadavcích má GET /api/recipes/1 dál vracet stav 200');
} finally {
  await fs.writeFile(recipesPath, files['recipes.json']);
}
```

# --help--

## --tip-- 6

Pozor na převod textu na číslo: `Number('')` je `0`, `Number('12.5')` je `12.5`
a `Number('abc')` je `NaN`. Kladné celé číslo ověříš dvěma podmínkami — jestli je
výsledek celé číslo a jestli je větší než nula.

## --tip-- 10

Adresa `/api/recipes/4/like` má za prefixem dvě části. Buď zbytek cesty rozděl
přes `split('/')` a podívej se na obě části, nebo cestu porovnej s regulárním výrazem
se skupinou pro id. Recept pak změň v načteném poli a celé pole ulož zpátky.

# --seed--

## --file-- package.json

```json
{
  "name": "api-receptu",
  "type": "module"
}
```

## --file-- recipes.json

```json
[
  { "id": 1, "title": "Rajská polévka", "minutes": 30, "tags": ["polévka", "vegetariánské"], "likes": 12 },
  { "id": 2, "title": "Svíčková na smetaně", "minutes": 180, "tags": ["maso", "omáčka"], "likes": 40 },
  { "id": 3, "title": "Čočkový salát", "minutes": 20, "tags": ["salát", "veganské"], "likes": 7 },
  { "id": 4, "title": "Bramborák", "minutes": 45, "tags": ["vegetariánské"], "likes": 25 },
  { "id": 5, "title": "Guláš", "minutes": 120, "tags": ["maso"], "likes": 18 },
  { "id": 6, "title": "Palačinky", "minutes": 25, "tags": ["sladké", "vegetariánské"], "likes": 31 }
]
```

## --file-- server.js

```js
// API receptů — REST API v čistém Node, data v souboru recipes.json.
import { createServer } from 'node:http';

// Port z prostředí, bez něj 3000.
export const port = Number(process.env.PORT ?? 3000);

// recipes.json leží vedle tohoto souboru.
const recipesFile = new URL('./recipes.json', import.meta.url);

const server = createServer(async (req, res) => {
  // Tady začni. Zatím server na všechno odpoví 501 Not Implemented.
  res.writeHead(501, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Zatím není hotové.' }));
});

server.listen(port, () => {
  console.log(`API receptů běží na http://localhost:${port}`);
});
```

# --solution--

## --file-- server.js

```js
// API receptů — REST API v čistém Node, data v souboru recipes.json.
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

// Port z prostředí, bez něj 3000.
export const port = Number(process.env.PORT ?? 3000);

// recipes.json leží vedle tohoto souboru.
const recipesFile = new URL('./recipes.json', import.meta.url);

async function loadRecipes() {
  return JSON.parse(await readFile(recipesFile, 'utf8'));
}

async function saveRecipes(recipes) {
  await writeFile(recipesFile, JSON.stringify(recipes, null, 2));
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed);
  return sendJson(res, 405, { error: `Tahle adresa umí jen ${allowed}.` });
}

// Z query stringu vybere recepty. Vrátí { recipes } nebo { error }, když je parametr neplatný.
function filterRecipes(recipes, searchParams) {
  let result = recipes;

  const maxMinutes = searchParams.get('maxMinutes');
  if (maxMinutes !== null) {
    const limit = Number(maxMinutes);
    if (!Number.isInteger(limit) || limit <= 0) {
      return { error: 'Parametr maxMinutes musí být kladné celé číslo.' };
    }
    result = result.filter((recipe) => recipe.minutes <= limit);
  }

  const tag = searchParams.get('tag');
  if (tag !== null) {
    result = result.filter((recipe) => recipe.tags.includes(tag));
  }

  return { recipes: result };
}

const server = createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/recipes') {
    if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
    const { recipes, error } = filterRecipes(await loadRecipes(), searchParams);
    if (error) return sendJson(res, 400, { error });
    return sendJson(res, 200, recipes);
  }

  if (pathname === '/api/tags') {
    if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
    const tags = new Set((await loadRecipes()).flatMap((recipe) => recipe.tags));
    return sendJson(res, 200, [...tags].sort((a, b) => a.localeCompare(b, 'cs')));
  }

  if (pathname.startsWith('/api/recipes/')) {
    const [idText, action, ...rest] = pathname.slice('/api/recipes/'.length).split('/');
    const id = Number(idText);
    const recipes = await loadRecipes();
    const recipe = recipes.find((item) => item.id === id);

    if (action === undefined) {
      if (!recipe) return sendJson(res, 404, { error: 'Recept nenalezen.' });
      if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
      return sendJson(res, 200, recipe);
    }

    if (action === 'like' && rest.length === 0) {
      if (!recipe) return sendJson(res, 404, { error: 'Recept nenalezen.' });
      if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
      recipe.likes += 1;
      await saveRecipes(recipes);
      return sendJson(res, 200, { id: recipe.id, likes: recipe.likes });
    }
  }

  sendJson(res, 404, { error: 'Tahle adresa neexistuje.' });
});

server.listen(port, () => {
  console.log(`API receptů běží na http://localhost:${port}`);
});
```

# --approaches--

## --approach-- Řada podmínek

Stejný styl jako ve workshopu: jeden handler, `if` pro každou adresu, uvnitř rozhodnutí
podle metody. Filtrování je v samostatné funkci, která vrátí buď recepty, nebo chybu.
Čte se shora dolů a hodí se, dokud je adres pár.

### --file-- server.js

```js
// API receptů — REST API v čistém Node, data v souboru recipes.json.
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

// Port z prostředí, bez něj 3000.
export const port = Number(process.env.PORT ?? 3000);

// recipes.json leží vedle tohoto souboru.
const recipesFile = new URL('./recipes.json', import.meta.url);

async function loadRecipes() {
  return JSON.parse(await readFile(recipesFile, 'utf8'));
}

async function saveRecipes(recipes) {
  await writeFile(recipesFile, JSON.stringify(recipes, null, 2));
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed);
  return sendJson(res, 405, { error: `Tahle adresa umí jen ${allowed}.` });
}

// Z query stringu vybere recepty. Vrátí { recipes } nebo { error }, když je parametr neplatný.
function filterRecipes(recipes, searchParams) {
  let result = recipes;

  const maxMinutes = searchParams.get('maxMinutes');
  if (maxMinutes !== null) {
    const limit = Number(maxMinutes);
    if (!Number.isInteger(limit) || limit <= 0) {
      return { error: 'Parametr maxMinutes musí být kladné celé číslo.' };
    }
    result = result.filter((recipe) => recipe.minutes <= limit);
  }

  const tag = searchParams.get('tag');
  if (tag !== null) {
    result = result.filter((recipe) => recipe.tags.includes(tag));
  }

  return { recipes: result };
}

const server = createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/recipes') {
    if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
    const { recipes, error } = filterRecipes(await loadRecipes(), searchParams);
    if (error) return sendJson(res, 400, { error });
    return sendJson(res, 200, recipes);
  }

  if (pathname === '/api/tags') {
    if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
    const tags = new Set((await loadRecipes()).flatMap((recipe) => recipe.tags));
    return sendJson(res, 200, [...tags].sort((a, b) => a.localeCompare(b, 'cs')));
  }

  if (pathname.startsWith('/api/recipes/')) {
    const [idText, action, ...rest] = pathname.slice('/api/recipes/'.length).split('/');
    const id = Number(idText);
    const recipes = await loadRecipes();
    const recipe = recipes.find((item) => item.id === id);

    if (action === undefined) {
      if (!recipe) return sendJson(res, 404, { error: 'Recept nenalezen.' });
      if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
      return sendJson(res, 200, recipe);
    }

    if (action === 'like' && rest.length === 0) {
      if (!recipe) return sendJson(res, 404, { error: 'Recept nenalezen.' });
      if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
      recipe.likes += 1;
      await saveRecipes(recipes);
      return sendJson(res, 200, { id: recipe.id, likes: recipe.likes });
    }
  }

  sendJson(res, 404, { error: 'Tahle adresa neexistuje.' });
});

server.listen(port, () => {
  console.log(`API receptů běží na http://localhost:${port}`);
});
```

## --approach-- Tabulka rout

Routy jsou data: metoda, regulární výraz cesty a funkce. Handler jen najde odpovídající
řádek tabulky. Hlavička `Allow` se sestaví sama ze všech metod, které cesta umí, takže
nová routa je jeden řádek. Takhle uvnitř fungují routery ve frameworcích.

### --file-- server.js

```js
// API receptů — REST API v čistém Node, data v souboru recipes.json.
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

// Port z prostředí, bez něj 3000.
export const port = Number(process.env.PORT ?? 3000);

// recipes.json leží vedle tohoto souboru.
const recipesFile = new URL('./recipes.json', import.meta.url);

async function loadRecipes() {
  return JSON.parse(await readFile(recipesFile, 'utf8'));
}

async function saveRecipes(recipes) {
  await writeFile(recipesFile, JSON.stringify(recipes, null, 2));
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(data));
}

async function listRecipes({ res, url }) {
  let recipes = await loadRecipes();
  const maxMinutes = url.searchParams.get('maxMinutes');
  if (maxMinutes !== null) {
    if (!/^[1-9]\d*$/.test(maxMinutes)) {
      return sendJson(res, 400, { error: 'maxMinutes musí být kladné celé číslo.' });
    }
    recipes = recipes.filter((recipe) => recipe.minutes <= Number(maxMinutes));
  }
  const tag = url.searchParams.get('tag');
  if (tag !== null) {
    recipes = recipes.filter((recipe) => recipe.tags.includes(tag));
  }
  sendJson(res, 200, recipes);
}

async function listTags({ res }) {
  const tags = [];
  for (const recipe of await loadRecipes()) {
    for (const tag of recipe.tags) {
      if (!tags.includes(tag)) tags.push(tag);
    }
  }
  sendJson(res, 200, tags.toSorted(new Intl.Collator('cs').compare));
}

async function showRecipe({ res, params }) {
  const recipe = (await loadRecipes()).find((item) => item.id === Number(params[0]));
  if (!recipe) return sendJson(res, 404, { error: 'Recept nenalezen.' });
  sendJson(res, 200, recipe);
}

async function likeRecipe({ res, params }) {
  const recipes = await loadRecipes();
  const recipe = recipes.find((item) => item.id === Number(params[0]));
  if (!recipe) return sendJson(res, 404, { error: 'Recept nenalezen.' });
  recipe.likes += 1;
  await saveRecipes(recipes);
  sendJson(res, 200, { id: recipe.id, likes: recipe.likes });
}

// Každá routa = metoda, vzor cesty a funkce. Skupiny ve vzoru jsou parametry cesty.
const routes = [
  { method: 'GET', pattern: /^\/api\/recipes$/, handle: listRecipes },
  { method: 'GET', pattern: /^\/api\/tags$/, handle: listTags },
  { method: 'GET', pattern: /^\/api\/recipes\/([^/]+)$/, handle: showRecipe },
  { method: 'POST', pattern: /^\/api\/recipes\/([^/]+)\/like$/, handle: likeRecipe },
];

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const matching = routes.filter((route) => route.pattern.test(url.pathname));

  if (matching.length === 0) {
    return sendJson(res, 404, { error: 'Tahle adresa neexistuje.' });
  }

  const route = matching.find((item) => item.method === req.method);
  if (!route) {
    // Hlavičku Allow sestaví tabulka sama ze všech metod, které cesta umí.
    const allow = matching.map((item) => item.method).join(', ');
    return sendJson(res, 405, { error: 'Tahle metoda tu není povolená.' }, { Allow: allow });
  }

  const params = url.pathname.match(route.pattern).slice(1);
  await route.handle({ req, res, url, params });
});

server.listen(port, () => {
  console.log(`API receptů běží na http://localhost:${port}`);
});
```

## --approach-- Rozdělení cesty na části

Cesta se rozdělí na části a `switch` rozhoduje podle jejich počtu a jména. Nepotřebuje
regulární výrazy, ale s každou další úrovní adresy je `switch` méně čitelný — a čte
soubor i u požadavků, které data nepotřebují.

### --file-- server.js

```js
// API receptů — REST API v čistém Node, data v souboru recipes.json.
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

// Port z prostředí, bez něj 3000.
export const port = Number(process.env.PORT ?? 3000);

// recipes.json leží vedle tohoto souboru.
const recipesFile = new URL('./recipes.json', import.meta.url);

function reply(res, status, body, allow) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (allow) headers.Allow = allow;
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function parseLimit(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  // '/api/recipes/3/like' → ['api', 'recipes', '3', 'like']
  const parts = url.pathname.split('/').filter((part) => part !== '');
  const recipes = JSON.parse(await readFile(recipesFile, 'utf8'));

  if (parts[0] !== 'api') {
    return reply(res, 404, { error: 'Tahle adresa neexistuje.' });
  }

  switch (parts.length === 2 ? parts[1] : `${parts[1]}/${parts.length}`) {
    case 'recipes': {
      if (req.method !== 'GET') return reply(res, 405, { error: 'Jen GET.' }, 'GET');
      let found = recipes;
      if (url.searchParams.has('maxMinutes')) {
        const limit = parseLimit(url.searchParams.get('maxMinutes'));
        if (limit === null) return reply(res, 400, { error: 'maxMinutes musí být kladné celé číslo.' });
        found = found.filter((recipe) => recipe.minutes <= limit);
      }
      if (url.searchParams.has('tag')) {
        found = found.filter((recipe) => recipe.tags.includes(url.searchParams.get('tag')));
      }
      return reply(res, 200, found);
    }
    case 'tags': {
      if (req.method !== 'GET') return reply(res, 405, { error: 'Jen GET.' }, 'GET');
      const tags = [...new Set(recipes.flatMap((recipe) => recipe.tags))];
      return reply(res, 200, tags.sort());
    }
    case 'recipes/3':
    case 'recipes/4': {
      const recipe = recipes.find((item) => String(item.id) === parts[2]);
      const isLike = parts.length === 4;
      if (isLike && parts[3] !== 'like') break;
      if (!recipe) return reply(res, 404, { error: 'Recept nenalezen.' });
      if (!isLike) {
        if (req.method !== 'GET') return reply(res, 405, { error: 'Jen GET.' }, 'GET');
        return reply(res, 200, recipe);
      }
      if (req.method !== 'POST') return reply(res, 405, { error: 'Jen POST.' }, 'POST');
      recipe.likes++;
      await writeFile(recipesFile, JSON.stringify(recipes, null, 2));
      return reply(res, 200, { id: recipe.id, likes: recipe.likes });
    }
  }

  reply(res, 404, { error: 'Tahle adresa neexistuje.' });
});

server.listen(port, () => {
  console.log(`API receptů běží na http://localhost:${port}`);
});
```

# --review--

Testy kontrolují chování API. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každá routa nebo akce má vlastní pojmenovanou funkci, handler jen rozhoduje, kterou zavolat.
- Odpovědi `404` a `405` se neskládají na pěti místech stejně — mají pomocnou funkci.
- Kontrola `maxMinutes` je na jednom místě a její chybová zpráva řekne, jaká hodnota je správná.
- Soubor se čte jen tam, kde jsou data potřeba, a zapisuje se až po úspěšné změně.
- Umíš říct, který z přístupů bys zvolil pro API s třiceti adresami a proč.

## --extensions--

Rozšíření bez testů:

- stránkování `?limit=10&offset=20` s kontrolou obou parametrů,
- řazení `?sort=likes` a `?sort=-minutes` (minus = sestupně),
- `DELETE /api/recipes/:id/like`, které like ubere, ale nikdy nepůjde pod nulu,
- dva současné požadavky na like můžou jeden like „ztratit" (oba přečtou 25 a oba
  zapíšou 26) — zkus to vyvolat dvěma `curl` najednou a vymysli, jak tomu zabránit.
