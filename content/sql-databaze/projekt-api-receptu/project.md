---
title: API receptů
runtime: node
main: server.js
timeoutMs: 30000
see: sql-databaze/navrh-schematu#vztah-m-n-spojovaci-tabulka, sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default, sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback, sql-databaze/okenni-funkce#poradi-rownumber-rank-a-denserank
---

# --description--

## Zadání

Parta kamarádů si roky posílá recepty ve skupinovém chatu a pokaždé je musí znovu
lovit v historii. Jeden z nich píše mobilní aplikaci **Vařečka** a chce od tebe backend:
JSON API, které recepty vydá, přijme nové a nechá je hodnotit. Frontend si napíše sám,
od tebe chce API, které se chová pořád stejně a které se nedá rozbít blbým požadavkem.

Databáze zatím neexistuje. Postavíš ji ty — a **integritu bude hlídat databáze,
ne dobrá vůle aplikace**. Recept bez názvu, hodnocení se sedmi hvězdičkami ani
ingredience „−200 g" se do ní nesmí dostat ani tehdy, když se někdo připojí mimo
tvůj server.

Tohle je samostatný projekt bez kroků. Stojí na celé sekci: na
[schématu s vazbou M:N](see:sql-databaze/navrh-schematu#vztah-m-n-spojovaci-tabulka),
[omezeních](see:sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default),
[transakcích](see:sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback)
a [okenních funkcích](see:sql-databaze/okenni-funkce#poradi-rownumber-rank-a-denserank).
Nejbližší vzory jsou [lab s dotazy pro e-shop](see:sql-databaze/lab-eshop-dotazy)
a [workshop s JOINy a agregacemi](see:sql-databaze/workshop-join-agregace/001);
HTTP část máš z projektu [REST API pro poznámky](see:node-zaklady/projekt-api-poznamek).

## Jak začít

1. Klikni na **Začít projekt** a otevři složku projektu ve VS Code.
2. V terminálu ve složce spusť `npm run dev`. Server se po každém uložení sám restartuje.
3. Piš do `schema.sql`, `db.js`, `queries.js` a `server.js`. Do `seed.sql` nesahej —
   testy se o jeho data opírají a jeho příkazy `INSERT` zároveň určují, jak se sloupce
   jmenují a v jakém jsou pořadí.
4. API zkoušej přes `curl` (příklady jsou v `README.md`) nebo v prohlížeči na
   <http://localhost:3000/api/recipes>.
5. Když máš hotový příběh, klikni na **Zkontrolovat**.

Projekt nemá žádné závislosti a nic se neinstaluje. SQLite je vestavěná v Node
jako [`node:sqlite`](see:sql-databaze/relacni-databaze#node-sqlite-databaze-v-node),
HTTP obstará `node:http`.

## Databáze

Databáze žije v paměti: při startu serveru se založí ze `schema.sql` a naplní
ze `seed.sql`. Po restartu je zase jako nová.

| tabulka | sloupce |
|---|---|
| `categories` | `id`, `slug`, `name` |
| `recipes` | `id`, `category_id`, `slug`, `title`, `minutes`, `servings`, `difficulty`, `instructions`, `created_at` |
| `ingredients` | `id`, `name` |
| `recipe_ingredients` | `recipe_id`, `ingredient_id`, `amount`, `unit` |
| `ratings` | `id`, `recipe_id`, `author`, `stars`, `comment`, `created_at` |

Tabulka `categories` je ve `schema.sql` hotová jako vzor. Pravidla, která má hlídat
**databáze**:

- Žádná hodnota ve schématu nesmí chybět. Jedinečné jsou `categories.slug`,
  `recipes.slug` i `ingredients.name`.
- Tentýž autor smí hodnotit jeden recept jen jednou a tatáž ingredience smí být
  v jednom receptu jen jednou.
- `minutes`, `servings` i `amount` jsou větší než nula, `stars` je celé číslo od 1 do 5.
- `difficulty` je jedna ze tří hodnot: `snadne`, `stredni`, `narocne`.
- `comment` u hodnocení je nepovinný: když ho požadavek nepošle, uloží se prázdný text
  a postará se o to výchozí hodnota ve schématu.
- Recept patří kategorii, ingredience receptu a hodnocení taky. Smazaný recept odnese
  svoje ingredience i hodnocení; kategorii, ve které nějaký recept je, a ingredienci,
  která je v nějakém receptu, smazat nejde.
- Všechny tabulky jsou `STRICT` a nad cizími klíči `recipes.category_id`
  a `ratings.recipe_id` je index.

## Tvar odpovědí

Recept ve výpisu:

```json
{ "id": 6, "slug": "palacinky", "title": "Palačinky", "minutes": 35, "servings": 4,
  "difficulty": "snadne", "category": { "slug": "moucniky", "name": "Moučníky" },
  "rating_avg": 4.5, "rating_count": 4 }
```

Detail má navíc `instructions`, `created_at`, pole `ingredients`
(`{ name, amount, unit }`, seřazené podle názvu tak, jak řadí `ORDER BY` v databázi —
českou abecedu neřeš) a pole `ratings` (`{ id, author, stars, comment, created_at }`,
od nejnovějšího).

`rating_avg` je průměr hvězdiček zaokrouhlený na jedno desetinné místo, u receptu
bez hodnocení je `null` a `rating_count` je `0`.

Každá chyba má tělo `{ "error": { "code": "…", "message": "…" } }` s českou zprávou.

## Uživatelské příběhy

- Když aplikace pošle `GET /api/recipes`, dostane stav `200` a první stránku receptů
  od nejnovějšího: `{ page, per_page, total, total_pages, items }`. Bez parametrů je
  `page` 1 a `per_page` 5.
- Když aplikace pošle `GET /api/recipes?category=polevky`, dostane jen recepty
  z té kategorie a `total` počítá recepty **po filtrování**, ne všechny. Neznámá
  kategorie není chyba, jen prázdný výsledek.
- Filtr `max_minutes=35` vrátí recepty do 35 minut včetně a filtr `q=pala` recepty,
  jejichž název hledaný text obsahuje kdekoli uvnitř, bez ohledu na velikost písmen.
  Filtry jdou kombinovat.
- Parametry `page` a `per_page` listují výpisem; `per_page` je nejvýš 50.
  Když je kterýkoli z parametrů `page`, `per_page` nebo `max_minutes` nečíslo, nula
  nebo záporné číslo, dostane aplikace `400` s kódem `INVALID_QUERY` a databáze se
  vůbec neptá.
- Text z parametru `q` se do dotazu dostane jen jako vázaná hodnota. Hledání textu
  `' OR 1=1 --` proto vrátí `200` a prázdný výsledek, ne celou databázi a ne pád.
- Na neznámou adresu dostane aplikace `404` s kódem `NOT_FOUND`, na metodu, kterou
  adresa neumí (třeba `PUT /api/recipes`), `405` s kódem `METHOD_NOT_ALLOWED`
  a hlavičkou `Allow`.
- Když aplikace pošle `GET /api/recipes/svickova`, dostane `200` a detail receptu
  i se seznamem ingrediencí (název, množství, jednotka) a hodnocení. Recept, který
  neexistuje, vrátí `404` s kódem `RECIPE_NOT_FOUND`.
- Když aplikace pošle `POST /api/recipes` s tělem
  `{ slug, title, category, minutes, servings, difficulty, instructions, ingredients }`,
  server recept založí a odpoví `201`, hlavičkou `Location` s adresou detailu
  a celým detailem nového receptu. `created_at` je dnešní datum ve tvaru `RRRR-MM-DD`.
- Ingredience v požadavku jsou `{ name, amount, unit }`. Ingredienci, kterou databáze
  už zná, server použije; neznámou založí. Jména se ukládají oříznutá o mezery
  na krajích a jeden název se v receptu nesmí opakovat — jinak `400` s kódem
  `DUPLICATE_INGREDIENT`.
- Recept a jeho ingredience vzniknou **v jedné transakci**: buď se uloží všechno,
  nebo nic. Po odmítnutém požadavku nesmí v databázi zůstat ani recept, ani nově
  založená ingredience.
- Když je tělo `POST /api/recipes` rozbité (není JSON, chybí pole, `title` je kratší
  než tři znaky, `minutes` není celé kladné číslo, `difficulty` je mimo tři povolené
  hodnoty, `ingredients` je prázdné nebo má položku s nekladným množstvím), dostane
  aplikace `400` s kódem `INVALID_BODY`. Neznámá kategorie vrátí `400` s kódem
  `UNKNOWN_CATEGORY`, obsazený slug `409` s kódem `SLUG_TAKEN`.
- Když aplikace pošle `POST /api/recipes/palacinky/ratings` s tělem
  `{ author, stars, comment }`, server hodnocení uloží a odpoví `201` a objektem
  `{ rating, rating_avg, rating_count }`, kde `rating` je uložené hodnocení
  s přiděleným `id` a dnešním datem a zbytek je **přepočítaný** souhrn receptu.
- `stars` mimo rozsah 1–5 nebo desetinné číslo vrátí `400` s kódem `INVALID_BODY`,
  hodnocení neexistujícího receptu `404` s kódem `RECIPE_NOT_FOUND` a druhé hodnocení
  od stejného autora u téhož receptu `409` s kódem `ALREADY_RATED`.
- Když aplikace pošle `GET /api/ingredients`, dostane `{ items }` se všemi
  ingrediencemi a s `recipes_count` — v kolika receptech ingredience je.
  Od nejpoužívanější, při shodě podle názvu.
- Když aplikace pošle `GET /api/rankings`, dostane `{ items }` se **dvěma nejlépe
  hodnocenými recepty v každé kategorii**: `{ category, rank, slug, title, rating_avg,
  rating_count }`. `rank` je pořadí uvnitř kategorie (1 a 2) a počítá ho okenní funkce.
  Recepty bez hodnocení se do žebříčku nepočítají, kategorie bez hodnocených receptů
  v odpovědi není. Při shodě průměru rozhoduje vyšší počet hodnocení, pak nižší `id`.
  Řazeno podle názvu kategorie a pořadí.
- Když aplikace pošle `GET /api/stats`, dostane `{ items }` za **každou** kategorii,
  i za tu bez receptů: `{ slug, name, recipes_count, avg_minutes, rating_avg }`,
  seřazené podle názvu kategorie. `avg_minutes` je průměrná doba přípravy receptů
  v kategorii na jedno desetinné místo, `rating_avg` průměr všech hvězdiček v kategorii;
  u prázdné kategorie jsou oba `null`.

## Technické požadavky

- Server poslouchá na portu z proměnné `PORT`, bez ní na `3000`.
- Připojení musí mít zapnuté hlídání cizích klíčů. SQLite je totiž bez jednoho
  pragmatu jen zapíše do schématu a nehlídá je — kaskáda by tiše nefungovala.
- Žádná hodnota z požadavku se nelepí do textu dotazu. Všechno jde přes vázané
  parametry `?`.
- SQL patří do `queries.js`, HTTP a kontrola vstupů do `server.js`. Testy volají
  `openDb()` z `db.js` i přímo, takže tahle funkce musí umět založit hotovou databázi sama.
- Odpověď s tělem je JSON s hlavičkou `Content-Type: application/json; charset=utf-8`.
- Chybová odpověď má vždycky tvar `{ error: { code, message } }` — i ta poslední
  záchranná s kódem `500`. Server nesmí spadnout kvůli požadavku.

> [!TIP]
> Začni schématem a pusť kontrolu. Dokud schéma nesedí, `seed.sql` neprojde a spadne
> úplně všechno — první čtyři požadavky jsou proto dobrá mapa postupu. Teprve pak
> se pusť do dotazů a nakonec do HTTP.

Zbytek je tvoje volba: jak si rozdělíš kód, jak pojmenuješ pomocné funkce a jestli
si k API napíšeš i vlastní testy.

# --hints--

`schema.sql` zakládá pět tabulek se správnými sloupci, všechny jsou `STRICT`, nad cizími klíči jsou indexy a `seed.sql` se do nich vejde.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
const tabulky = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((radek) => radek.name);
assert.deepEqual(tabulky, ['categories', 'ingredients', 'ratings', 'recipe_ingredients', 'recipes'], `V databázi má být pět tabulek, jsou: ${tabulky.join(', ') || '(žádná)'}`);
const sloupce = (tabulka) => db.prepare(`PRAGMA table_info(${tabulka})`).all().map((radek) => radek.name);
assert.deepEqual(sloupce('recipes'), ['id', 'category_id', 'slug', 'title', 'minutes', 'servings', 'difficulty', 'instructions', 'created_at'], `recipes má mít sloupce v pořadí ze seed.sql — má: ${sloupce('recipes').join(', ')}`);
assert.deepEqual(sloupce('ingredients'), ['id', 'name'], `ingredients má mít sloupce id, name — má: ${sloupce('ingredients').join(', ')}`);
assert.deepEqual(sloupce('recipe_ingredients'), ['recipe_id', 'ingredient_id', 'amount', 'unit'], `recipe_ingredients má mít sloupce recipe_id, ingredient_id, amount, unit — má: ${sloupce('recipe_ingredients').join(', ')}`);
assert.deepEqual(sloupce('ratings'), ['id', 'recipe_id', 'author', 'stars', 'comment', 'created_at'], `ratings má mít sloupce id, recipe_id, author, stars, comment, created_at — má: ${sloupce('ratings').join(', ')}`);
for (const tabulka of tabulky) {
  const { sql } = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(tabulka);
  assert.match(sql, /\)\s*STRICT\s*$/i, `Tabulka ${tabulka} má být STRICT — jinak si do sloupce INTEGER uložíš text`);
}
const indexy = db.prepare("SELECT tbl_name, sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL").all();
const maIndex = (tabulka, sloupec) => indexy.some((index) => index.tbl_name === tabulka && new RegExp(`\\(\\s*${sloupec}\\b`, 'i').test(index.sql));
assert.ok(maIndex('recipes', 'category_id'), 'Nad cizím klíčem recipes.category_id má být index — přes něj se spojuje v každém výpisu');
assert.ok(maIndex('ratings', 'recipe_id'), 'Nad cizím klíčem ratings.recipe_id má být index');
const pocty = { ...db.prepare('SELECT (SELECT COUNT(*) FROM recipes) AS receptu, (SELECT COUNT(*) FROM ingredients) AS ingredienci, (SELECT COUNT(*) FROM recipe_ingredients) AS dvojic, (SELECT COUNT(*) FROM ratings) AS hodnoceni').get() };
assert.deepEqual(pocty, { receptu: 8, ingredienci: 18, dvojic: 37, hodnoceni: 21 }, 'Ze seed.sql má vzniknout 8 receptů, 18 ingrediencí, 37 dvojic recept–ingredience a 21 hodnocení');
```

Databáze odmítne chybějící povinnou hodnotu, druhý stejný slug, druhou stejnou ingredienci i druhé hodnocení od téhož autora — a chybějící komentář doplní prázdným textem.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
const vlozRecept = (...hodnoty) => db.prepare('INSERT INTO recipes (category_id, slug, title, minutes, servings, difficulty, instructions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(...hodnoty);
assert.throws(
  () => vlozRecept(1, 'novinka', null, 20, 2, 'snadne', 'Postup.', '2026-05-01'),
  'Recept bez názvu se nemá dát uložit — chybí NOT NULL u recipes.title?',
);
assert.throws(
  () => vlozRecept(1, 'palacinky', 'Jiné palačinky', 20, 2, 'snadne', 'Postup.', '2026-05-01'),
  'Druhý recept se slugem „palacinky" se nemá dát uložit — chybí UNIQUE u recipes.slug?',
);
assert.throws(
  () => db.prepare('INSERT INTO ingredients (name) VALUES (?)').run('brambory'),
  'Druhá ingredience jménem „brambory" se nemá dát uložit — chybí UNIQUE u ingredients.name?',
);
assert.throws(
  () => db.prepare('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES (?, ?, ?, ?)').run(1, 1, 500, 'g'),
  'Tatáž ingredience se nemá dát přidat k jednomu receptu dvakrát — chybí PRIMARY KEY (recipe_id, ingredient_id)?',
);
assert.throws(
  () => db.prepare('INSERT INTO ratings (recipe_id, author, stars, comment, created_at) VALUES (?, ?, ?, ?, ?)').run(1, 'hana', 4, '', '2026-05-01'),
  'Autor „hana" už recept 1 hodnotil, druhé hodnocení se nemá dát uložit — chybí UNIQUE (recipe_id, author)?',
);
db.prepare('INSERT INTO ratings (recipe_id, author, stars, created_at) VALUES (?, ?, ?, ?)').run(2, 'karel', 4, '2026-05-01');
const bezKomentare = db.prepare("SELECT comment FROM ratings WHERE recipe_id = 2 AND author = 'karel'").get();
assert.equal(bezKomentare.comment, '', 'Hodnocení vložené bez komentáře má mít prázdný komentář — chybí DEFAULT \'\' u ratings.comment?');
```

Databáze odmítne nekladný čas i porci, nekladné množství, neznámou obtížnost, hvězdičky mimo rozsah 1–5 i text ve sloupci pro číslo.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
const vlozRecept = (...hodnoty) => db.prepare('INSERT INTO recipes (category_id, slug, title, minutes, servings, difficulty, instructions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(...hodnoty);
const platny = vlozRecept(1, 'prvni-pokus', 'První pokus', 20, 2, 'snadne', 'Postup.', '2026-05-01');
assert.equal(platny.changes, 1, 'Recept, který všechna pravidla splňuje, se uložit musí — nejsou omezení naopak moc přísná?');
assert.throws(
  () => vlozRecept(1, 'okamzita-polevka', 'Okamžitá polévka', 0, 2, 'snadne', 'Postup.', '2026-05-01'),
  'Recept s přípravou 0 minut se nemá dát uložit — chybí CHECK (minutes > 0)?',
);
assert.throws(
  () => vlozRecept(1, 'polevka-pro-nikoho', 'Polévka pro nikoho', 20, 0, 'snadne', 'Postup.', '2026-05-01'),
  'Recept pro 0 porcí se nemá dát uložit — chybí CHECK (servings > 0)?',
);
assert.throws(
  () => vlozRecept(1, 'nemozna-polevka', 'Nemožná polévka', 20, 2, 'nemozne', 'Postup.', '2026-05-01'),
  'Obtížnost „nemozne" se nemá dát uložit — chybí CHECK na tři povolené hodnoty difficulty?',
);
assert.throws(
  () => vlozRecept(1, 'textova-polevka', 'Textová polévka', 'dvacet', 2, 'snadne', 'Postup.', '2026-05-01'),
  'Text „dvacet" se nemá dát uložit do sloupce minutes — je tabulka recipes opravdu STRICT?',
);
assert.throws(
  () => db.prepare('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES (?, ?, ?, ?)').run(1, 7, 0, 'ks'),
  'Ingredience s množstvím 0 se nemá dát uložit — chybí CHECK (amount > 0)?',
);
for (const hvezdicky of [0, 6]) {
  assert.throws(
    () => db.prepare('INSERT INTO ratings (recipe_id, author, stars, comment, created_at) VALUES (?, ?, ?, ?, ?)').run(2, `karel-${hvezdicky}`, hvezdicky, '', '2026-05-01'),
    `Hodnocení s ${hvezdicky} hvězdičkami se nemá dát uložit — chybí CHECK na rozsah 1 až 5?`,
  );
}
```

Připojení hlídá cizí klíče: neznámý recept ani kategorii nevloží, smazaný recept odnese svoje ingredience a hodnocení a obsazenou kategorii ani použitou ingredienci smazat nejde.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
const pragma = db.prepare('PRAGMA foreign_keys').get();
assert.equal(Number(pragma.foreign_keys), 1, 'Připojení má mít zapnuté hlídání cizích klíčů — bez toho je SQLite jen zapíše a kaskáda tiše nefunguje');
assert.throws(
  () => db.prepare('INSERT INTO ratings (recipe_id, author, stars, comment, created_at) VALUES (?, ?, ?, ?, ?)').run(999, 'karel', 4, '', '2026-05-01'),
  'Hodnocení receptu 999, který neexistuje, se nemá dát uložit — chybí cizí klíč ratings.recipe_id?',
);
assert.throws(
  () => db.prepare('INSERT INTO recipes (category_id, slug, title, minutes, servings, difficulty, instructions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(99, 'bez-kategorie', 'Bez kategorie', 20, 2, 'snadne', 'Postup.', '2026-05-01'),
  'Recept v kategorii 99, která neexistuje, se nemá dát uložit — chybí cizí klíč recipes.category_id?',
);
const pocet = (dotaz, ...parametry) => db.prepare(dotaz).get(...parametry).pocet;
assert.equal(pocet('SELECT COUNT(*) AS pocet FROM recipe_ingredients WHERE recipe_id = 1'), 6, 'Bramboračka (recept 1) má mít v seedu 6 ingrediencí');
db.prepare('DELETE FROM recipes WHERE id = 1').run();
assert.equal(pocet('SELECT COUNT(*) AS pocet FROM recipe_ingredients WHERE recipe_id = 1'), 0, 'Se smazaným receptem mají zmizet i jeho ingredience — chybí ON DELETE CASCADE?');
assert.equal(pocet('SELECT COUNT(*) AS pocet FROM ratings WHERE recipe_id = 1'), 0, 'Se smazaným receptem mají zmizet i jeho hodnocení — chybí ON DELETE CASCADE?');
assert.throws(
  () => db.prepare("DELETE FROM categories WHERE slug = 'polevky'").run(),
  'Kategorie „polevky" má pořád recept Česnečka, a tak nemá jít smazat — chybí ON DELETE RESTRICT u recipes.category_id?',
);
assert.throws(
  () => db.prepare("DELETE FROM ingredients WHERE name = 'brambory'").run(),
  'Brambory jsou pořád v Česnečce, a tak nemají jít smazat — chybí ON DELETE RESTRICT u recipe_ingredients.ingredient_id?',
);
const volna = db.prepare("DELETE FROM categories WHERE slug = 'salaty'").run();
assert.equal(volna.changes, 1, 'Kategorie „salaty" žádný recept nemá, a tak smazat jít musí — není ON DELETE moc přísné?');
```

`GET /api/recipes` vrátí stav `200`, JSON s hlavičkou `charset=utf-8` a první stránku pěti nejnovějších receptů i s průměrem hodnocení.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(new URL('/api/recipes', server.url));
assert.equal(res.status, 200, 'GET /api/recipes má vrátit 200');
const typ = res.headers.get('content-type') ?? '';
assert.match(typ, /^application\/json/i, `Content-Type má být application/json, přišlo: ${typ}`);
assert.match(typ, /charset=utf-8/i, `Content-Type má uvádět charset=utf-8, přišlo: ${typ}`);
const data = await res.json();
assert.equal(data.page, 1, 'Bez parametrů má být page 1');
assert.equal(data.per_page, 5, 'Bez parametrů má být per_page 5');
assert.equal(data.total, 8, 'V seedu je 8 receptů, total je má počítat všechny');
assert.equal(data.total_pages, 2, 'Při 8 receptech a 5 na stránku jsou 2 stránky');
const slugy = data.items.map((polozka) => polozka.slug);
assert.deepEqual(slugy, ['hovezi-gulas', 'jablecny-zavin', 'palacinky', 'spagety-aglio-e-olio', 'kureci-rizek'], 'První stránka má být pět nejnovějších receptů podle created_at sestupně');
assert.deepEqual(data.items[2], { id: 6, slug: 'palacinky', title: 'Palačinky', minutes: 35, servings: 4, difficulty: 'snadne', category: { slug: 'moucniky', name: 'Moučníky' }, rating_avg: 4.5, rating_count: 4 }, 'Položka výpisu má mít přesně klíče ze zadání — Palačinky mají 4 hodnocení s průměrem 4.5');
const gulas = data.items[0];
assert.equal(gulas.rating_avg, null, 'Hovězí guláš zatím nikdo nehodnotil, rating_avg má být null (ne 0) — chce to LEFT JOIN');
assert.equal(gulas.rating_count, 0, 'Hovězí guláš zatím nikdo nehodnotil, rating_count má být 0');
```

Filtry `category`, `max_minutes` a `q` zužují výpis i `total` a hledaný text jde do dotazu jako vázaný parametr.

```js
const server = await helpers.startServer('server.js');
const ziskej = async (cesta) => {
  const res = await fetch(new URL(cesta, server.url));
  return { status: res.status, data: await res.json() };
};
const polevky = await ziskej('/api/recipes?category=polevky');
assert.equal(polevky.data.total, 2, 'V kategorii polevky jsou 2 recepty — total má počítat až po filtrování');
assert.deepEqual(polevky.data.items.map((polozka) => polozka.slug), ['cesnecka', 'bramboracka'], 'Kategorie polevky má vrátit Česnečku a Bramboračku, od novější');
const rychle = await ziskej('/api/recipes?max_minutes=35');
assert.deepEqual(rychle.data.items.map((polozka) => polozka.slug), ['palacinky', 'spagety-aglio-e-olio', 'cesnecka'], 'Do 35 minut se vejdou Palačinky (35), Špagety (20) a Česnečka (30) — hranice je včetně');
const hledani = await ziskej('/api/recipes?q=PALA');
assert.equal(hledani.data.total, 1, 'Hledání „PALA" má najít jeden recept — v názvu kdekoli a bez ohledu na velikost písmen');
assert.equal(hledani.data.items[0].slug, 'palacinky', 'Hledání „PALA" má najít Palačinky');
const kombinace = await ziskej('/api/recipes?category=hlavni-jidla&max_minutes=60');
assert.deepEqual(kombinace.data.items.map((polozka) => polozka.slug), ['spagety-aglio-e-olio', 'kureci-rizek'], 'Filtry se mají sčítat: hlavní jídla do 60 minut jsou Špagety a Kuřecí řízek');
const prazdna = await ziskej('/api/recipes?category=neexistuje');
assert.equal(prazdna.status, 200, 'Neznámá kategorie není chyba, jen prázdný výsledek');
assert.deepEqual(prazdna.data.items, [], 'Neznámá kategorie má vrátit prázdné items');
assert.equal(prazdna.data.total, 0, 'Neznámá kategorie má mít total 0');
const utok = await ziskej(`/api/recipes?q=${encodeURIComponent("' OR 1=1 --")}`);
assert.equal(utok.status, 200, 'Hledání textu „\' OR 1=1 --" má vrátit 200, ne pád serveru — hodnota patří do vázaného parametru');
assert.equal(utok.data.total, 0, 'Text „\' OR 1=1 --" není v žádném názvu, výsledek má být prázdný — lepíš hodnotu do textu dotazu?');
```

Stránkování listuje výpisem a nesmyslný parametr, neznámá adresa i nepovolená metoda skončí chybou ve správném tvaru.

```js
const server = await helpers.startServer('server.js');
const ziskej = async (cesta, init) => {
  const res = await fetch(new URL(cesta, server.url), init);
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: res.status, headers: res.headers, data, text };
};
const druha = await ziskej('/api/recipes?category=hlavni-jidla&page=2&per_page=2');
assert.equal(druha.data.total, 4, 'V kategorii hlavni-jidla jsou 4 recepty');
assert.equal(druha.data.total_pages, 2, 'Při 4 receptech a 2 na stránku jsou 2 stránky');
assert.deepEqual(druha.data.items.map((polozka) => polozka.slug), ['kureci-rizek', 'svickova'], 'Druhá stránka hlavních jídel po dvou má být Kuřecí řízek a Svíčková');
for (const dotaz of ['page=0', 'page=abc', 'per_page=999', 'max_minutes=-5']) {
  const spatny = await ziskej(`/api/recipes?${dotaz}`);
  assert.equal(spatny.status, 400, `Parametr „${dotaz}" má skončit stavem 400`);
  assert.equal(spatny.data?.error?.code, 'INVALID_QUERY', `Chyba u „${dotaz}" má mít kód INVALID_QUERY v tvaru { error: { code, message } }`);
  assert.ok(typeof spatny.data?.error?.message === 'string' && spatny.data.error.message.trim() !== '', `Chyba u „${dotaz}" má mít i srozumitelnou zprávu`);
}
const nikde = await ziskej('/api/neexistuje');
assert.equal(nikde.status, 404, 'Neznámá adresa má vrátit 404');
assert.equal(nikde.data?.error?.code, 'NOT_FOUND', 'Neznámá adresa má vrátit kód NOT_FOUND');
const metoda = await ziskej('/api/recipes', { method: 'PUT' });
assert.equal(metoda.status, 405, 'PUT /api/recipes má vrátit 405');
assert.equal(metoda.data?.error?.code, 'METHOD_NOT_ALLOWED', 'PUT /api/recipes má vrátit kód METHOD_NOT_ALLOWED');
const allow = metoda.headers.get('allow') ?? '';
assert.match(allow, /GET/i, `Odpověď 405 má mít hlavičku Allow s metodou GET, přišlo: „${allow}"`);
assert.match(allow, /POST/i, `Odpověď 405 má mít hlavičku Allow i s metodou POST, přišlo: „${allow}"`);
```

`GET /api/recipes/:slug` vrátí detail i s ingrediencemi a hodnoceními, u nehodnoceného receptu prázdný souhrn a u neznámého `404`.

```js
const server = await helpers.startServer('server.js');
const ziskej = async (cesta) => {
  const res = await fetch(new URL(cesta, server.url));
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: res.status, data };
};
const detail = await ziskej('/api/recipes/svickova');
assert.equal(detail.status, 200, 'GET /api/recipes/svickova má vrátit 200');
assert.equal(detail.data.id, 3, 'Svíčková má v seedu id 3');
assert.equal(detail.data.title, 'Svíčková na smetaně', 'Detail má vracet název receptu');
assert.equal(detail.data.minutes, 180, 'Svíčková se dělá 180 minut');
assert.deepEqual(detail.data.category, { slug: 'hlavni-jidla', name: 'Hlavní jídla' }, 'Detail má mít kategorii jako objekt { slug, name }');
assert.equal(detail.data.created_at, '2026-02-02', 'Detail má vracet i created_at ze seedu');
assert.ok(typeof detail.data.instructions === 'string' && detail.data.instructions.length > 10, 'Detail má vracet i postup v instructions');
assert.deepEqual(detail.data.ingredients, [
  { name: 'cibule', amount: 2, unit: 'ks' },
  { name: 'hladká mouka', amount: 40, unit: 'g' },
  { name: 'hovězí zadní', amount: 1000, unit: 'g' },
  { name: 'mrkev', amount: 300, unit: 'g' },
  { name: 'máslo', amount: 60, unit: 'g' },
  { name: 'smetana ke šlehání', amount: 250, unit: 'ml' },
], 'Svíčková má mít šest ingrediencí s množstvím a jednotkou, seřazené podle názvu přes ORDER BY v databázi');
assert.equal(detail.data.rating_count, 5, 'Svíčková má v seedu 5 hodnocení');
assert.equal(detail.data.rating_avg, 4.8, 'Svíčková má hvězdičky 5, 5, 4, 5, 5 — průměr zaokrouhlený na jedno místo je 4.8');
assert.deepEqual(detail.data.ratings.map((hodnoceni) => hodnoceni.author), ['tereza', 'jan', 'lucie', 'petr', 'hana'], 'Hodnocení v detailu mají být od nejnovějšího');
assert.equal(detail.data.ratings[0].stars, 5, 'Nejnovější hodnocení Svíčkové je od terezy za 5 hvězdiček');
const bezHodnoceni = await ziskej('/api/recipes/hovezi-gulas');
assert.equal(bezHodnoceni.data.rating_avg, null, 'Nehodnocený recept má mít rating_avg null');
assert.equal(bezHodnoceni.data.rating_count, 0, 'Nehodnocený recept má mít rating_count 0');
assert.deepEqual(bezHodnoceni.data.ratings, [], 'Nehodnocený recept má mít prázdné pole ratings');
const nikde = await ziskej('/api/recipes/neexistujici-recept');
assert.equal(nikde.status, 404, 'Neznámý slug má vrátit 404');
assert.equal(nikde.data?.error?.code, 'RECIPE_NOT_FOUND', 'Neznámý slug má vrátit kód RECIPE_NOT_FOUND');
```

`POST /api/recipes` založí recept i s ingrediencemi, odpoví `201`, hlavičkou `Location` a detailem — a nový recept je hned vidět ve výpisu i v přehledu ingrediencí.

```js
const server = await helpers.startServer('server.js');
const ziskej = async (cesta, init) => {
  const res = await fetch(new URL(cesta, server.url), init);
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: res.status, headers: res.headers, data };
};
const posli = (cesta, telo) => ziskej(cesta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(telo) });
const novy = {
  slug: 'bramborovy-salat',
  title: 'Bramborový salát',
  category: 'salaty',
  minutes: 60,
  servings: 6,
  difficulty: 'stredni',
  instructions: 'Brambory uvař ve slupce, nakrájej na kostičky a smíchej s majonézou.',
  ingredients: [
    { name: 'brambory', amount: 1000, unit: 'g' },
    { name: 'majonéza', amount: 200, unit: 'g' },
    { name: ' mrkev ', amount: 150, unit: 'g' },
  ],
};
const vytvoreno = await posli('/api/recipes', novy);
assert.equal(vytvoreno.status, 201, `POST /api/recipes s platným receptem má vrátit 201, přišlo ${vytvoreno.status}: ${JSON.stringify(vytvoreno.data)}`);
assert.equal(vytvoreno.headers.get('location'), '/api/recipes/bramborovy-salat', 'Odpověď 201 má mít hlavičku Location s adresou detailu nového receptu');
assert.ok(Number.isInteger(vytvoreno.data.id), 'Nový recept má dostat celočíselné id z databáze');
assert.deepEqual(vytvoreno.data.category, { slug: 'salaty', name: 'Saláty' }, 'Nový recept má být v kategorii Saláty');
assert.match(vytvoreno.data.created_at, /^\d{4}-\d{2}-\d{2}$/, `created_at má být dnešní datum ve tvaru RRRR-MM-DD, přišlo „${vytvoreno.data.created_at}"`);
assert.deepEqual(vytvoreno.data.ingredients, [
  { name: 'brambory', amount: 1000, unit: 'g' },
  { name: 'majonéza', amount: 200, unit: 'g' },
  { name: 'mrkev', amount: 150, unit: 'g' },
], 'Detail nového receptu má mít všechny tři ingredience s oříznutými mezerami v názvu');
assert.equal(vytvoreno.data.rating_avg, null, 'Nový recept ještě nikdo nehodnotil, rating_avg má být null');
const detail = await ziskej('/api/recipes/bramborovy-salat');
assert.equal(detail.status, 200, 'Nový recept má jít hned načíst přes GET /api/recipes/bramborovy-salat');
assert.equal(detail.data.id, vytvoreno.data.id, 'Detail nového receptu má mít stejné id, jaké vrátil POST');
const vypis = await ziskej('/api/recipes?category=salaty');
assert.equal(vypis.data.total, 1, 'Nový recept má být hned vidět ve výpisu kategorie salaty');
const ingredience = await ziskej('/api/ingredients');
assert.equal(ingredience.data.items.length, 19, 'Z 18 ingrediencí se má stát 19 — „majonéza" je nová, „brambory" a „mrkev" databáze už zná');
const brambory = ingredience.data.items.find((polozka) => polozka.name === 'brambory');
assert.equal(brambory.recipes_count, 3, 'Brambory byly ve 2 receptech, s novým salátem jsou ve 3 — známá ingredience se nemá zakládat znovu');
```

Rozbitý `POST /api/recipes` skončí správným kódem a **v databázi po něm nezůstane nic** — recept i ingredience vznikají v jedné transakci.

```js
const server = await helpers.startServer('server.js');
const ziskej = async (cesta, init) => {
  const res = await fetch(new URL(cesta, server.url), init);
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: res.status, data };
};
const posli = (cesta, telo) => ziskej(cesta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(telo) });
const zaklad = {
  slug: 'kapary-na-pepri',
  title: 'Kapary na pepři',
  category: 'salaty',
  minutes: 15,
  servings: 2,
  difficulty: 'snadne',
  instructions: 'Kapary smíchej s pepřem a olejem a nech chvíli odležet.',
  ingredients: [{ name: 'kapary', amount: 50, unit: 'g' }, { name: 'brambory', amount: 100, unit: 'g' }],
};
const recept = (prepis) => ({ ...zaklad, ...prepis });
const neznamaKategorie = await posli('/api/recipes', recept({ category: 'neexistuje' }));
assert.equal(neznamaKategorie.status, 400, 'Recept v neexistující kategorii má vrátit 400');
assert.equal(neznamaKategorie.data?.error?.code, 'UNKNOWN_CATEGORY', 'Recept v neexistující kategorii má vrátit kód UNKNOWN_CATEGORY');
const obsazenySlug = await posli('/api/recipes', recept({ slug: 'palacinky' }));
assert.equal(obsazenySlug.status, 409, 'Recept s už obsazeným slugem má vrátit 409');
assert.equal(obsazenySlug.data?.error?.code, 'SLUG_TAKEN', 'Recept s už obsazeným slugem má vrátit kód SLUG_TAKEN');
const dvakratTataz = await posli('/api/recipes', recept({ ingredients: [
  { name: 'kapary', amount: 50, unit: 'g' },
  { name: 'brambory', amount: 100, unit: 'g' },
  { name: ' kapary ', amount: 10, unit: 'g' },
] }));
assert.equal(dvakratTataz.status, 400, 'Tatáž ingredience dvakrát v jednom receptu má vrátit 400 (po oříznutí mezer jde o stejný název)');
assert.equal(dvakratTataz.data?.error?.code, 'DUPLICATE_INGREDIENT', 'Tatáž ingredience dvakrát má vrátit kód DUPLICATE_INGREDIENT');
for (const [popis, prepis] of [
  ['title kratší než tři znaky', { title: 'Ka' }],
  ['minutes jako text', { minutes: 'patnáct' }],
  ['neznámá obtížnost', { difficulty: 'extremni' }],
  ['prázdný seznam ingrediencí', { ingredients: [] }],
  ['nekladné množství u druhé ingredience', { ingredients: [{ name: 'kapary', amount: 50, unit: 'g' }, { name: 'brambory', amount: 0, unit: 'g' }] }],
]) {
  const odpoved = await posli('/api/recipes', recept(prepis));
  assert.equal(odpoved.status, 400, `Recept, kde je ${popis}, má vrátit 400`);
  assert.equal(odpoved.data?.error?.code, 'INVALID_BODY', `Recept, kde je ${popis}, má vrátit kód INVALID_BODY`);
}
const rozbityJson = await ziskej('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{takhle ne' });
assert.equal(rozbityJson.status, 400, 'Tělo, které není platný JSON, má vrátit 400, ne pád serveru');
assert.ok(typeof rozbityJson.data?.error?.code === 'string', 'I chyba u rozbitého JSON má mít tvar { error: { code, message } }');
const detail = await ziskej('/api/recipes/kapary-na-pepri');
assert.equal(detail.status, 404, 'Po všech odmítnutých pokusech nesmí recept „kapary-na-pepri" v databázi existovat');
const ingredience = await ziskej('/api/ingredients');
assert.equal(ingredience.data.items.length, 18, 'Po odmítnutých pokusech má zůstat 18 ingrediencí — nová „kapary" nesmí přežít pokus, který neprošel');
const vypis = await ziskej('/api/recipes');
assert.equal(vypis.data.total, 8, 'Po odmítnutých pokusech má v databázi zůstat 8 receptů ze seedu');
const zdroj = Object.entries(files).filter(([jmeno]) => jmeno.endsWith('.js')).map(([, obsah]) => helpers.stripComments(obsah)).join('\n');
assert.match(zdroj, /\bBEGIN\b/i, 'Zakládání receptu má běžet v transakci — v kódu není ani jedno BEGIN, takže rozepsaný recept nemá co vrátit zpátky');
```

`POST /api/recipes/:slug/ratings` uloží hodnocení, vrátí přepočítaný průměr a odmítne nesmyslné hvězdičky, druhé hodnocení téhož autora i neznámý recept.

```js
const server = await helpers.startServer('server.js');
const ziskej = async (cesta, init) => {
  const res = await fetch(new URL(cesta, server.url), init);
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: res.status, data };
};
const posli = (cesta, telo) => ziskej(cesta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(telo) });
const prvni = await posli('/api/recipes/hovezi-gulas/ratings', { author: 'karel', stars: 5, comment: 'Maso se rozpadalo.' });
assert.equal(prvni.status, 201, `Hodnocení má vrátit 201, přišlo ${prvni.status}: ${JSON.stringify(prvni.data)}`);
assert.ok(Number.isInteger(prvni.data?.rating?.id), 'Nové hodnocení má dostat celočíselné id z databáze');
assert.equal(prvni.data.rating.author, 'karel', 'Odpověď má vracet uložené hodnocení i s autorem');
assert.equal(prvni.data.rating.stars, 5, 'Odpověď má vracet uložený počet hvězdiček');
assert.match(prvni.data.rating.created_at, /^\d{4}-\d{2}-\d{2}$/, `created_at hodnocení má být dnešní datum ve tvaru RRRR-MM-DD, přišlo „${prvni.data.rating.created_at}"`);
assert.equal(prvni.data.rating_avg, 5, 'Hovězí guláš neměl žádné hodnocení, po pěti hvězdičkách je průměr 5');
assert.equal(prvni.data.rating_count, 1, 'Hovězí guláš má po prvním hodnocení rating_count 1');
const detail = await ziskej('/api/recipes/hovezi-gulas');
assert.equal(detail.data.rating_count, 1, 'Nové hodnocení má být vidět i v detailu receptu');
assert.equal(detail.data.ratings[0].comment, 'Maso se rozpadalo.', 'Detail má vracet i komentář nového hodnocení');
const bezKomentare = await posli('/api/recipes/hovezi-gulas/ratings', { author: 'jana', stars: 4 });
assert.equal(bezKomentare.status, 201, 'Komentář je nepovinný, hodnocení bez něj má projít');
assert.equal(bezKomentare.data.rating.comment, '', 'Chybějící komentář se má uložit jako prázdný text');
assert.equal(bezKomentare.data.rating_avg, 4.5, 'Po hvězdičkách 5 a 4 je průměr Hovězího guláše 4.5');
const podruhe = await posli('/api/recipes/hovezi-gulas/ratings', { author: 'karel', stars: 3 });
assert.equal(podruhe.status, 409, 'Druhé hodnocení od stejného autora u téhož receptu má vrátit 409');
assert.equal(podruhe.data?.error?.code, 'ALREADY_RATED', 'Druhé hodnocení od stejného autora má vrátit kód ALREADY_RATED');
const bramboracka = await posli('/api/recipes/bramboracka/ratings', { author: 'karel', stars: 4 });
assert.equal(bramboracka.data.rating_count, 5, 'Bramboračka měla 4 hodnocení, po pátém je jich 5');
assert.equal(bramboracka.data.rating_avg, 4.4, 'Bramboračka měla hvězdičky 5, 4, 5, 4; s novými čtyřmi je průměr 22 / 5 = 4.4');
for (const [popis, telo] of [
  ['šest hvězdiček', { author: 'petra', stars: 6 }],
  ['nula hvězdiček', { author: 'petra', stars: 0 }],
  ['desetinné hvězdičky', { author: 'petra', stars: 4.5 }],
  ['chybějící autor', { stars: 4 }],
]) {
  const odpoved = await posli('/api/recipes/cesnecka/ratings', telo);
  assert.equal(odpoved.status, 400, `Hodnocení, kde jsou ${popis}, má vrátit 400`);
  assert.equal(odpoved.data?.error?.code, 'INVALID_BODY', `Hodnocení, kde jsou ${popis}, má vrátit kód INVALID_BODY`);
}
const nikde = await posli('/api/recipes/neexistujici-recept/ratings', { author: 'petra', stars: 4 });
assert.equal(nikde.status, 404, 'Hodnocení neexistujícího receptu má vrátit 404');
assert.equal(nikde.data?.error?.code, 'RECIPE_NOT_FOUND', 'Hodnocení neexistujícího receptu má vrátit kód RECIPE_NOT_FOUND');
```

Přehledy sedí: `GET /api/ingredients` počítá výskyty, `GET /api/rankings` řadí recepty uvnitř kategorií okenní funkcí a `GET /api/stats` vrátí i kategorii bez receptů.

```js
const server = await helpers.startServer('server.js');
const ziskej = async (cesta) => {
  const res = await fetch(new URL(cesta, server.url));
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: res.status, data };
};
const ingredience = await ziskej('/api/ingredients');
assert.equal(ingredience.status, 200, 'GET /api/ingredients má vrátit 200');
assert.equal(ingredience.data.items.length, 18, 'V seedu je 18 ingrediencí a všechny mají být ve výpisu');
assert.deepEqual(ingredience.data.items.slice(0, 2).map((polozka) => [polozka.name, polozka.recipes_count]), [['hladká mouka', 5], ['česnek', 4]], 'Nejpoužívanější je hladká mouka v 5 receptech, druhý česnek ve 4');
const mleko = ingredience.data.items.find((polozka) => polozka.name === 'mléko');
assert.equal(mleko.recipes_count, 1, 'Mléko je jen v Palačinkách, recipes_count má být 1');
const zebricek = await ziskej('/api/rankings');
assert.equal(zebricek.status, 200, 'GET /api/rankings má vrátit 200');
assert.deepEqual(zebricek.data.items.map((polozka) => [polozka.category.slug, polozka.rank, polozka.slug, polozka.rating_avg, polozka.rating_count]), [
  ['hlavni-jidla', 1, 'svickova', 4.8, 5],
  ['hlavni-jidla', 2, 'spagety-aglio-e-olio', 4.5, 2],
  ['moucniky', 1, 'palacinky', 4.5, 4],
  ['moucniky', 2, 'jablecny-zavin', 3.5, 2],
  ['polevky', 1, 'bramboracka', 4.5, 4],
  ['polevky', 2, 'cesnecka', 3.5, 2],
], 'Žebříček má mít dva nejlepší recepty z každé hodnocené kategorie, seřazené podle názvu kategorie a pořadí; Kuřecí řízek je v kategorii třetí, a tak v žebříčku není, a nehodnocený Hovězí guláš taky ne');
const statistiky = await ziskej('/api/stats');
assert.deepEqual(statistiky.data.items, [
  { slug: 'hlavni-jidla', name: 'Hlavní jídla', recipes_count: 4, avg_minutes: 90, rating_avg: 4.4 },
  { slug: 'moucniky', name: 'Moučníky', recipes_count: 2, avg_minutes: 62.5, rating_avg: 4.2 },
  { slug: 'polevky', name: 'Polévky', recipes_count: 2, avg_minutes: 45, rating_avg: 4.2 },
  { slug: 'salaty', name: 'Saláty', recipes_count: 0, avg_minutes: null, rating_avg: null },
], 'Statistiky mají mít i prázdnou kategorii Saláty. Průměrná doba se počítá z receptů (hlavní jídla: 180, 40, 20 a 120 minut je 90), takže ji spojení s hodnoceními nesmí znásobit');
const zdroj = Object.entries(files).filter(([jmeno]) => jmeno.endsWith('.js')).map(([, obsah]) => helpers.stripComments(obsah)).join('\n');
assert.match(zdroj, /\bOVER\s*\(/i, 'Pořadí v žebříčku má spočítat okenní funkce — v SQL není ani jedno OVER (…)');
```

# --help--

## --tip-- 10

Transakce není nic víc než dvojice příkazů kolem celého zakládání: jedním ji otevřeš
a druhým potvrdíš, a když cokoli mezi tím vyhodí výjimku, vrátíš databázi do stavu
před ní. Hodí se na to `try`/`catch` kolem celého bloku, který s databází pracuje —
a pozor, když nezavoláš ani potvrzení, ani návrat, zůstane transakce otevřená a další
požadavek se do ní přilepí. Vzor a tři příkazy, o které jde, jsou v lekci
[Transakce, indexy a N+1](see:sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback).

## --tip-- 12

Žebříček potřebuje dvě věci naráz: průměr hvězdiček za recept (to je agregace přes
`GROUP BY`) a pořadí uvnitř kategorie (to je okno). Jde to v jednom dotazu, protože
okno se počítá až nad výsledkem agregace — ale filtrovat podle pořadí v tomtéž
`SELECT` nejde, protože `WHERE` běží dřív, než okno vznikne. Obvyklé řešení je
poskládat to ze dvou kroků přes `WITH` a filtrovat až v tom druhém. Co dělá
`PARTITION BY` a proč tady chceš pořadí bez děr, je v lekci
[Okenní funkce](see:sql-databaze/okenni-funkce#poradi-rownumber-rank-a-denserank),
omezení oken pak v části [Kde okno použít nejde](see:sql-databaze/okenni-funkce#kde-okno-pouzit-nejde).

# --review--

Testy kontrolují, že API dělá, co má. Jestli je za tím kód, který by prošel code review,
zkontroluj sám — tohle se ptá kolega, kterému projekt ukážeš.

## --rubric--

- Schéma je čitelné: sloupce pod sebou, omezení u sloupce, kterého se týkají, a u každého `ON DELETE` se dá vysvětlit, proč je zrovna takové.
- Databáze hlídá integritu sama. Kdybys smazal kontroly v serveru, do tabulek se pořád nedostane nesmysl.
- Všechno SQL je v `queries.js`, server se stará o HTTP a vstupy. Žádný dotaz není poskládaný z řetězců s hodnotami od uživatele.
- Zakládání receptu je jedna transakce a ani jedna cesta z ní nevede ven bez potvrzení nebo návratu zpět.
- Žádný dotaz se neptá v cyklu na to, co jde vytáhnout jedním dotazem (problém N+1).
- Chybové odpovědi mají jednotný tvar a kód, který frontendu řekne, co má uživateli napsat; zpráva nikdy neprozradí kus SQL.
- `README.md` popisuje, jak projekt spustit, a aspoň jedno rozhodnutí, které jsi udělal (třeba proč zrovna tohle `ON DELETE`).
- Víš, co bys příště udělal jinak.

## --extensions--

**Rozšíření bez testů**

- `PATCH /api/recipes/:slug` — změna receptu i jeho ingrediencí, zase v transakci
  a se stejnou kontrolou vstupů.
- `DELETE /api/recipes/:slug` a k němu ruční zkouška, že kaskáda opravdu uklidila
  hodnocení a dvojice recept–ingredience.
- Filtr „co můžu uvařit z toho, co mám doma": `GET /api/recipes?has=brambory,vejce`
  vrátí recepty, ve kterých jsou všechny vyjmenované ingredience.
- `EXPLAIN QUERY PLAN` nad výpisem s filtrem a hledáním. Podívej se, kde se skenuje
  celá tabulka, přidej index a porovnej plán znovu.
- Vlastní testy přes `node:test`, které si server spustí samy a projdou uživatelské
  příběhy — máš je popsané dost přesně na to, aby šly rovnou přepsat do testů.

**Rozšíření do portfolia**

- Přepiš dotazy do [Drizzle](see:sql-databaze/orm-drizzle#schema-jako-kod) a schéma
  popiš jako kód. Porovnej vygenerované SQL s tím, co jsi psal ručně, a v README napiš,
  kde ti ORM pomohlo a kde jsi sáhl zpátky po SQL.
- Přesuň databázi ze SQLite do [PostgreSQL v Dockeru](see:sql-databaze/postgres-v-dockeru#postgres-v-dockeru-compose-yaml)
  a nech připojení na `DATABASE_URL`. V README popiš, co se v SQL muselo změnit.
- Malý frontend nad API (výpis, filtr, detail, formulář na hodnocení) ve stejném
  repozitáři a snímek obrazovky v README.
