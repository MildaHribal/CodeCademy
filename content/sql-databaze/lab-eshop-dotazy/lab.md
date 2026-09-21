---
title: Dotazy pro e-shop
runtime: node
timeoutMs: 20000
see: sql-databaze/navrh-schematu#vztah-1-n-cizi-klic, sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default, sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback, sql-databaze/okenni-funkce#kde-okno-pouzit-nejde
---

# --description--

Malý e-shop s čajem a kávou **Zrnko** prodává přes formulář a objednávky si majitelka
přepisuje do sešitu. Teď chce administraci: přehled zboží, tržby po měsících, žebříček
nejprodávanějších položek a zákazníků. Databáze zatím neexistuje — postavíš ji ty
a napíšeš nad ní dotazy, ze kterých bude administrace žít.

Projekt má šest souborů:

- `schema.sql` — **tvoje práce.** Tabulka `customers` je hotová jako vzor, zbývající tři dopíšeš.
- `seed.sql` — testovací data. Nesahej do něj; jeho příkazy `INSERT` zároveň určují,
  jak se sloupce jmenují a v jakém jsou pořadí.
- `db.js` — `openDb()` založí databázi v paměti, pustí `schema.sql` a pak `seed.sql`.
- `queries.js` — **tvoje práce.** Prázdné kostry deseti funkcí.
- `index.js` — tlačítko **Spustit** zavolá každou hotovou funkci a vypíše výsledek.
- `package.json`

Ceny jsou všude v **haléřích** jako celá čísla, `12490` je 124,90 Kč. Datum je text
ve tvaru `RRRR-MM-DD`.

## Jak má schéma vypadat

| tabulka | sloupce |
|---|---|
| `customers` | `id`, `email`, `name`, `city` |
| `products` | `id`, `name`, `category`, `price_halere`, `stock` |
| `orders` | `id`, `customer_id`, `created_at`, `status` |
| `order_items` | `id`, `order_id`, `product_id`, `pieces`, `unit_price_halere` |

Pravidla, která má hlídat **databáze**, ne aplikace:

- Žádný text ani číslo ve schématu nesmí chybět; e-mail zákazníka se nesmí opakovat.
- Cena zboží i cena položky objednávky je větší než nula, počet kusů taky, sklad nesmí
  klesnout pod nulu.
- `status` objednávky je jedna ze čtyř hodnot: `nova`, `zaplacena`, `odeslana`, `zrusena`.
- Objednávka patří zákazníkovi a položka objednávce i zboží. Smazaný zákazník odnese
  svoje objednávky a objednávka svoje položky; zboží, které je v nějaké objednávce,
  smazat nejde.
- Tentýž produkt nesmí být v jedné objednávce dvakrát.
- Všechny tabulky jsou `STRICT`.

## Co má umět `queries.js`

Každá funkce dostane jako první argument otevřenou databázi.

- **Výpis zboží** `listProducts(db)` vrátí všechno zboží s klíči `id`, `name`, `category`,
  `price_halere` a `stock`, od nejdražšího.
- **Zboží skladem** `productsInStock(db, minStock)` vrátí `id`, `name` a `stock` jen
  toho zboží, kterého je skladem aspoň `minStock`, seřazené podle `id`.
- **Hledání** `searchProducts(db, text)` vrátí `id` a `name` zboží, jehož název obsahuje
  hledaný text kdekoli uvnitř, seřazené podle `id`.
- **Cena objednávky** `orderTotal(db, orderId)` vrátí číslo: součet `pieces × unit_price_halere`
  přes položky té objednávky. Pro objednávku, která neexistuje, vrátí `0`, ne `null`.
- **Položky objednávky** `orderItems(db, orderId)` vrátí za každou položku `name` zboží,
  `pieces`, `unit_price_halere` a dopočítané `total_halere`, v pořadí, v jakém byly položky založené.
- **Souhrn zákazníků** `customerSummary(db)` vrátí za **každého** zákazníka `email`,
  `orders_count` a `spent_halere`. Počítají se jen objednávky se stavem `zaplacena`
  nebo `odeslana`; zákazník bez objednávky má nuly. Řazení podle útraty sestupně, při
  shodě podle e-mailu.
- **Nejprodávanější zboží** `topProducts(db, limit)` vrátí `name` a `pieces` (součet
  prodaných kusů) pro nejvýš `limit` položek, od nejprodávanější. Opět jen ze stavů
  `zaplacena` a `odeslana`.
- **Tržby po měsících** `revenueByMonth(db)` vrátí `month` ve tvaru `2026-01` a
  `revenue_halere`, od nejstaršího měsíce. Zase jen platné objednávky.
- **Nejlepší zákazník v každém městě** `bestCustomerPerCity(db)` vrátí za každé město
  `city`, `email` a `spent_halere` toho zákazníka, který v něm utratil nejvíc. Města
  seřaď abecedně.
- **Nová objednávka** `placeOrder(db, customerId, items)` dostane pole
  `[{ productId, pieces }]`, založí objednávku ve stavu `nova` s dnešním datem, přidá
  položky za **aktuální cenu zboží** a o prodané kusy sníží sklad. Vrátí `id` nové
  objednávky. Když kterákoli položka neprojde (třeba není dost skladem), nesmí v databázi
  zůstat **nic** — ani objednávka, ani odečtený sklad.

> [!TIP]
> Začni schématem a pusť kontrolu. Dokud schéma nesedí, `seed.sql` neprojde a spadnou
> i dotazy — první čtyři požadavky jsou proto dobrá mapa postupu.

Téma, styl dotazů i to, kolik práce necháš databázi a kolik JavaScriptu, jsou tvoje volba.
Testy se dívají jen na to, co funkce vrátí.

# --hints--

`schema.sql` zakládá čtyři tabulky se správnými sloupci ve správném pořadí.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
const tabulky = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map((radek) => radek.name);
assert.deepEqual(tabulky, ['customers', 'order_items', 'orders', 'products'], `V databázi mají být čtyři tabulky, jsou: ${tabulky.join(', ') || '(žádná)'}`);
const sloupce = (tabulka) => db.prepare(`PRAGMA table_info(${tabulka})`).all().map((radek) => radek.name);
assert.deepEqual(sloupce('customers'), ['id', 'email', 'name', 'city'], `customers má mít sloupce id, email, name, city — má: ${sloupce('customers').join(', ')}`);
assert.deepEqual(sloupce('products'), ['id', 'name', 'category', 'price_halere', 'stock'], `products má mít sloupce id, name, category, price_halere, stock — má: ${sloupce('products').join(', ')}`);
assert.deepEqual(sloupce('orders'), ['id', 'customer_id', 'created_at', 'status'], `orders má mít sloupce id, customer_id, created_at, status — má: ${sloupce('orders').join(', ')}`);
assert.deepEqual(sloupce('order_items'), ['id', 'order_id', 'product_id', 'pieces', 'unit_price_halere'], `order_items má mít sloupce id, order_id, product_id, pieces, unit_price_halere — má: ${sloupce('order_items').join(', ')}`);
```

Databáze odmítne chybějící povinnou hodnotu, druhý stejný e-mail i tentýž produkt dvakrát v jedné objednávce.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
assert.throws(
  () => db.prepare('INSERT INTO products (name, category, price_halere, stock) VALUES (?, ?, ?, ?)').run(null, 'čaj', 10000, 1),
  'Zboží bez názvu se nemá dát uložit — chybí NOT NULL u products.name?',
);
assert.throws(
  () => db.prepare('INSERT INTO customers (email, name, city) VALUES (?, ?, ?)').run('hana.novotna@example.cz', 'Dvojnice', 'Zlín'),
  'Druhý zákazník se stejným e-mailem se nemá dát uložit — chybí UNIQUE u customers.email?',
);
assert.throws(
  () => db.prepare('INSERT INTO order_items (order_id, product_id, pieces, unit_price_halere) VALUES (?, ?, ?, ?)').run(1, 4, 1, 32900),
  'Tentýž produkt se nemá dát vložit do jedné objednávky dvakrát — chybí UNIQUE (order_id, product_id)?',
);
```

Databáze odmítne nekladnou cenu, nekladný počet kusů, záporný sklad i neznámý stav objednávky.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
assert.throws(
  () => db.prepare('INSERT INTO products (name, category, price_halere, stock) VALUES (?, ?, ?, ?)').run('Zdarma', 'čaj', 0, 5),
  'Zboží s cenou 0 se nemá dát uložit — chybí CHECK (price_halere > 0)?',
);
assert.throws(
  () => db.prepare('UPDATE products SET stock = stock - 100 WHERE id = 5').run(),
  'Sklad se nemá dát srazit pod nulu — chybí CHECK (stock >= 0)?',
);
assert.throws(
  () => db.prepare('INSERT INTO order_items (order_id, product_id, pieces, unit_price_halere) VALUES (?, ?, ?, ?)').run(2, 3, 0, 16900),
  'Položka s nulovým počtem kusů se nemá dát uložit — chybí CHECK (pieces > 0)?',
);
assert.throws(
  () => db.prepare('INSERT INTO orders (customer_id, created_at, status) VALUES (?, ?, ?)').run(1, '2026-05-01', 'hotova'),
  'Stav „hotova" mezi povolené nepatří — chybí CHECK se čtyřmi stavy?',
);
```

Cizí klíče drží: neznámý zákazník neprojde, smazaný zákazník odnese objednávky i jejich položky a prodané zboží smazat nejde.

```js
const { openDb } = await helpers.importFile('db.js');
const db = openDb();
assert.throws(
  () => db.prepare('INSERT INTO orders (customer_id, created_at, status) VALUES (?, ?, ?)').run(999, '2026-05-01', 'nova'),
  'Objednávka neexistujícího zákazníka se nemá dát uložit — chybí REFERENCES customers(id)?',
);
db.prepare('DELETE FROM customers WHERE id = 4').run();
const zbyleObjednavky = db.prepare('SELECT id FROM orders ORDER BY id').all().map((radek) => radek.id);
assert.deepEqual(zbyleObjednavky, [1, 2, 3, 4, 6, 7], `Smazání zákazníka 4 má odnést jeho objednávku 5 — v tabulce zůstaly: ${zbyleObjednavky.join(', ')}`);
const zbylePolozky = db.prepare('SELECT COUNT(*) AS pocet FROM order_items WHERE order_id = 5').get().pocet;
assert.equal(zbylePolozky, 0, `Po smazání objednávky 5 nemá zbýt žádná její položka, zbylo jich ${zbylePolozky} — chybí ON DELETE CASCADE u order_items.order_id?`);
assert.throws(
  () => db.prepare('DELETE FROM products WHERE id = 4').run(),
  'Zboží, které je v objednávce, se nemá dát smazat — u order_items.product_id kaskáda být nemá.',
);
```

`listProducts` vrátí všechno zboží od nejdražšího, i s kategorií a skladem.

```js
const { openDb } = await helpers.importFile('db.js');
const { listProducts } = await helpers.importFile('queries.js');
const radky = listProducts(openDb());
assert.ok(Array.isArray(radky), 'listProducts má vrátit pole');
assert.equal(radky.length, 8, `listProducts má vrátit všech 8 položek zboží, vrátila jich ${radky.length}`);
assert.deepEqual(radky.map((radek) => radek.id), [6, 1, 8, 4, 5, 2, 3, 7], 'listProducts má řadit od nejdražšího zboží k nejlevnějšímu');
assert.deepEqual({ ...radky[0] }, { id: 6, name: 'Mlýnek na kávu Comandante', category: 'nádobí', price_halere: 124900, stock: 5 }, `První řádek má mít klíče id, name, category, price_halere a stock — přišlo: ${JSON.stringify(radky[0])}`);
```

`productsInStock` vrátí jen zboží, kterého je skladem dost, seřazené podle `id`.

```js
const { openDb } = await helpers.importFile('db.js');
const { productsInStock } = await helpers.importFile('queries.js');
const db = openDb();
const deset = productsInStock(db, 10);
assert.deepEqual(deset.map((radek) => radek.id), [1, 2, 4, 7], 'productsInStock(db, 10) má vrátit zboží s id 1, 2, 4 a 7 v tomto pořadí');
assert.deepEqual({ ...deset[0] }, { id: 1, name: 'Konvice na čaj 0,8 l', stock: 12 }, `Řádek má mít jen klíče id, name a stock — přišlo: ${JSON.stringify(deset[0])}`);
assert.deepEqual(productsInStock(db, 5).map((radek) => radek.id), [1, 2, 4, 5, 6, 7], 'productsInStock(db, 5) má vrátit i zboží, kterého je skladem přesně 5 kusů');
assert.deepEqual(productsInStock(db, 1000), [], 'productsInStock(db, 1000) má vrátit prázdné pole');
```

`searchProducts` najde text uvnitř názvu, ne jen na jeho začátku.

```js
const { openDb } = await helpers.importFile('db.js');
const { searchProducts } = await helpers.importFile('queries.js');
const db = openDb();
assert.deepEqual(searchProducts(db, 'káva').map((radek) => radek.id), [4, 5], 'searchProducts(db, "káva") má najít obě zrnkové kávy (id 4 a 5)');
assert.deepEqual(searchProducts(db, 'čaj').map((radek) => radek.id), [1, 2, 3], 'searchProducts(db, "čaj") má najít i konvici na čaj — hledá se kdekoli uvnitř názvu');
assert.deepEqual({ ...searchProducts(db, 'Dóza')[0] }, { id: 8, name: 'Dóza na kávu 500 g' }, 'Řádek má mít jen klíče id a name');
assert.deepEqual(searchProducts(db, 'traktor'), [], 'searchProducts(db, "traktor") má vrátit prázdné pole');
```

`orderTotal` sečte položky objednávky a u neexistující objednávky vrátí nulu.

```js
const { openDb } = await helpers.importFile('db.js');
const { orderTotal } = await helpers.importFile('queries.js');
const db = openDb();
assert.equal(orderTotal(db, 1), 70700, 'orderTotal(db, 1) má vrátit 70700 (2 × 18900 + 1 × 32900)');
assert.equal(orderTotal(db, 5), 116600, 'orderTotal(db, 5) má vrátit 116600');
assert.equal(orderTotal(db, 999), 0, 'orderTotal(db, 999) má vrátit 0 — SUM nad prázdnou množinou vrací NULL, ne nulu');
```

`orderItems` doplní k položkám název zboží a cenu za položku.

```js
const { openDb } = await helpers.importFile('db.js');
const { orderItems } = await helpers.importFile('queries.js');
const db = openDb();
const polozky = orderItems(db, 4).map((radek) => ({ ...radek }));
assert.deepEqual(polozky, [
  { name: 'Zrnková káva Etiopie 250 g', pieces: 3, unit_price_halere: 32900, total_halere: 98700 },
  { name: 'Papírové filtry V60, 100 ks', pieces: 2, unit_price_halere: 14900, total_halere: 29800 },
], `orderItems(db, 4) má vrátit dvě položky s názvem zboží a dopočítaným total_halere — přišlo: ${JSON.stringify(polozky)}`);
assert.deepEqual(orderItems(db, 999), [], 'orderItems(db, 999) má vrátit prázdné pole');
```

`customerSummary` započítá jen zaplacené a odeslané objednávky a nevynechá zákazníky bez objednávky.

```js
const { openDb } = await helpers.importFile('db.js');
const { customerSummary } = await helpers.importFile('queries.js');
const souhrn = customerSummary(openDb()).map((radek) => ({ ...radek }));
assert.equal(souhrn.length, 6, `customerSummary má vrátit řádek za každého ze šesti zákazníků, vrátila jich ${souhrn.length}`);
assert.deepEqual(souhrn, [
  { email: 'petr.sedlacek@example.cz', orders_count: 2, spent_halere: 250600 },
  { email: 'lucie.mala@example.cz', orders_count: 1, spent_halere: 128500 },
  { email: 'jan.urban@example.cz', orders_count: 1, spent_halere: 116600 },
  { email: 'hana.novotna@example.cz', orders_count: 1, spent_halere: 70700 },
  { email: 'eva.kralova@example.cz', orders_count: 0, spent_halere: 0 },
  { email: 'marek.blaha@example.cz', orders_count: 0, spent_halere: 0 },
], `Souhrn nesedí. Zrušená a nová objednávka se nepočítají, zákazník bez objednávky má nuly a počet objednávek se nesmí zvýšit počtem položek. Přišlo: ${JSON.stringify(souhrn)}`);
```

`topProducts` seřadí zboží podle prodaných kusů a respektuje `limit`.

```js
const { openDb } = await helpers.importFile('db.js');
const { topProducts } = await helpers.importFile('queries.js');
const db = openDb();
const tri = topProducts(db, 3).map((radek) => ({ ...radek }));
assert.deepEqual(tri, [
  { name: 'Zrnková káva Etiopie 250 g', pieces: 6 },
  { name: 'Sypaný čaj Sencha 100 g', pieces: 3 },
  { name: 'Papírové filtry V60, 100 ks', pieces: 2 },
], `topProducts(db, 3) nesedí — počítá se jen ze zaplacených a odeslaných objednávek. Přišlo: ${JSON.stringify(tri)}`);
assert.equal(topProducts(db, 1).length, 1, 'topProducts(db, 1) má vrátit jediný řádek');
assert.ok(topProducts(db, 100).every((radek) => radek.pieces > 0), 'Ve výsledku nemá být zboží, které se nikdy neprodalo');
```

`revenueByMonth` sečte tržby po měsících od nejstaršího.

```js
const { openDb } = await helpers.importFile('db.js');
const { revenueByMonth } = await helpers.importFile('queries.js');
const mesice = revenueByMonth(openDb()).map((radek) => ({ ...radek }));
assert.deepEqual(mesice, [
  { month: '2026-01', revenue_halere: 195600 },
  { month: '2026-02', revenue_halere: 128500 },
  { month: '2026-03', revenue_halere: 242300 },
], `revenueByMonth má vrátit tři měsíce ve tvaru 2026-01 od nejstaršího — přišlo: ${JSON.stringify(mesice)}`);
```

`bestCustomerPerCity` vybere z každého města jediného zákazníka s nejvyšší útratou.

```js
const { openDb } = await helpers.importFile('db.js');
const { bestCustomerPerCity } = await helpers.importFile('queries.js');
const mesta = bestCustomerPerCity(openDb()).map((radek) => ({ ...radek }));
assert.deepEqual(mesta, [
  { city: 'Brno', email: 'lucie.mala@example.cz', spent_halere: 128500 },
  { city: 'Ostrava', email: 'jan.urban@example.cz', spent_halere: 116600 },
  { city: 'Praha', email: 'petr.sedlacek@example.cz', spent_halere: 250600 },
], `Za každé město má přijít právě jeden řádek, seřazeno podle města — přišlo: ${JSON.stringify(mesta)}`);
```

`placeOrder` založí objednávku s aktuálními cenami, sníží sklad a při chybě nenechá v databázi nic.

```js
const { openDb } = await helpers.importFile('db.js');
const { placeOrder, orderItems } = await helpers.importFile('queries.js');
const db = openDb();
const sklad = (id) => db.prepare('SELECT stock FROM products WHERE id = ?').get(id).stock;
const pocetObjednavek = () => db.prepare('SELECT COUNT(*) AS pocet FROM orders').get().pocet;
const pred = pocetObjednavek();
const orderId = placeOrder(db, 6, [{ productId: 2, pieces: 3 }, { productId: 7, pieces: 1 }]);
assert.equal(typeof orderId, 'number', `placeOrder má vrátit id nové objednávky jako číslo, vrátila ${JSON.stringify(orderId)}`);
assert.equal(pocetObjednavek(), pred + 1, 'Po úspěšném placeOrder má přibýt právě jedna objednávka');
const hlavicka = db.prepare('SELECT customer_id, status, created_at FROM orders WHERE id = ?').get(orderId);
assert.equal(hlavicka.customer_id, 6, 'Objednávka má patřit zákazníkovi, kterého jsi poslal');
assert.equal(hlavicka.status, 'nova', `Nová objednávka má mít stav „nova", má ${hlavicka.status}`);
assert.match(String(hlavicka.created_at), /^\d{4}-\d{2}-\d{2}/, `created_at má být datum ve tvaru RRRR-MM-DD, je ${hlavicka.created_at}`);
assert.deepEqual(orderItems(db, orderId).map((radek) => ({ ...radek })), [
  { name: 'Sypaný čaj Sencha 100 g', pieces: 3, unit_price_halere: 18900, total_halere: 56700 },
  { name: 'Papírové filtry V60, 100 ks', pieces: 1, unit_price_halere: 14900, total_halere: 14900 },
], 'Položky se mají uložit za aktuální cenu zboží z tabulky products');
assert.equal(sklad(2), 37, `Sklad zboží 2 měl klesnout ze 40 na 37, je ${sklad(2)}`);
assert.equal(sklad(7), 59, `Sklad zboží 7 měl klesnout ze 60 na 59, je ${sklad(7)}`);
const pocetPredChybou = pocetObjednavek();
assert.throws(
  () => placeOrder(db, 6, [{ productId: 5, pieces: 2 }, { productId: 3, pieces: 1 }]),
  'Objednávka na zboží, které není skladem, má skončit chybou',
);
assert.equal(pocetObjednavek(), pocetPredChybou, 'Po neúspěšném placeOrder nesmí zůstat rozdělaná objednávka — chybí ROLLBACK?');
assert.equal(sklad(5), 8, `Po neúspěšném placeOrder se nesmí změnit ani sklad, u zboží 5 je ${sklad(5)} místo 8`);
```

# --help--

## --tip--

Rozděl si práci na dvě poloviny. Nejdřív schéma: projdi řádek po řádku pravidla ze
zadání a ke každému si řekni, kterým omezením se zapisuje — povinnost, jedinečnost,
rozsah hodnot, vazba. Vzor máš v tabulce `customers` a v lekci
[Omezení](see:sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default)
i v části o [chování při mazání](see:sql-databaze/navrh-schematu#on-delete-co-se-stane-s-knihami).
Teprve potom piš dotazy — bez schématu ti stejně nepoběží.

## --tip-- 10

Když objednávek vyjde víc, než jich zákazník má, počítáš řádky po spojení s položkami,
ne objednávky. Objednávka se třemi položkami je ve spojení třikrát. Zkus si ten dotaz
nejdřív bez agregace a podívej se, kolik řádků vrátí — a pak hledej, jak `COUNT` donutit
počítat různé hodnoty, ne řádky.

# --seed--

## --file-- schema.sql

```sql
-- Schéma e-shopu Zrnko. Ceny jsou v haléřích jako celá čísla.
-- Tabulka customers je hotová jako vzor, zbylé tři dopiš.

CREATE TABLE customers (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL,
  city  TEXT NOT NULL
) STRICT;

-- CREATE TABLE products (...)    id, name, category, price_halere, stock
-- CREATE TABLE orders (...)      id, customer_id, created_at, status
-- CREATE TABLE order_items (...) id, order_id, product_id, pieces, unit_price_halere
```

## --file-- seed.sql

```sql
-- Testovací data e-shopu Zrnko. Tenhle soubor neměň.

INSERT INTO customers (id, email, name, city) VALUES
  (1, 'hana.novotna@example.cz',   'Hana Novotná',   'Praha'),
  (2, 'petr.sedlacek@example.cz',  'Petr Sedláček',  'Praha'),
  (3, 'lucie.mala@example.cz',     'Lucie Malá',     'Brno'),
  (4, 'jan.urban@example.cz',      'Jan Urban',      'Ostrava'),
  (5, 'eva.kralova@example.cz',    'Eva Králová',    'Brno'),
  (6, 'marek.blaha@example.cz',    'Marek Bláha',    'Ostrava');

INSERT INTO products (id, name, category, price_halere, stock) VALUES
  (1, 'Konvice na čaj 0,8 l',        'nádobí',        68900, 12),
  (2, 'Sypaný čaj Sencha 100 g',     'čaj',           18900, 40),
  (3, 'Bylinný čaj Meduňka 50 g',    'čaj',           16900,  0),
  (4, 'Zrnková káva Etiopie 250 g',  'káva',          32900, 10),
  (5, 'Mletá káva Brazílie 250 g',   'káva',          24100,  8),
  (6, 'Mlýnek na kávu Comandante',   'nádobí',       124900,  5),
  (7, 'Papírové filtry V60, 100 ks', 'příslušenství', 14900, 60),
  (8, 'Dóza na kávu 500 g',          'nádobí',        47700,  4);

INSERT INTO orders (id, customer_id, created_at, status) VALUES
  (1, 1, '2026-01-12', 'zaplacena'),
  (2, 2, '2026-01-25', 'odeslana'),
  (3, 2, '2026-03-08', 'zaplacena'),
  (4, 3, '2026-02-14', 'odeslana'),
  (5, 4, '2026-03-21', 'zaplacena'),
  (6, 5, '2026-03-30', 'nova'),
  (7, 6, '2026-02-02', 'zrusena');

INSERT INTO order_items (id, order_id, product_id, pieces, unit_price_halere) VALUES
  (1, 1, 2, 2,  18900),
  (2, 1, 4, 1,  32900),
  (3, 2, 6, 1, 124900),
  (4, 3, 4, 2,  32900),
  (5, 3, 2, 1,  18900),
  (6, 3, 3, 1,  16900),
  (7, 3, 5, 1,  24100),
  (8, 4, 4, 3,  32900),
  (9, 4, 7, 2,  14900),
  (10, 5, 1, 1, 68900),
  (11, 5, 8, 1, 47700),
  (12, 6, 2, 1, 18900),
  (13, 7, 4, 1, 32900);
```

## --file-- db.js

```js
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const read = (jmeno) => readFileSync(new URL(jmeno, import.meta.url), 'utf8');

/** Založí databázi v paměti, pustí schema.sql a pak seed.sql. */
export function openDb() {
  const db = new DatabaseSync(':memory:');
  // Bez tohohle pragmatu SQLite cizí klíče jen zapíše a nehlídá je.
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(read('./schema.sql'));
  db.exec(read('./seed.sql'));
  return db;
}
```

## --file-- queries.js

```js
// Dotazy pro administraci e-shopu Zrnko.
// Každá funkce dostane jako první argument otevřenou databázi.

/** Všechno zboží od nejdražšího: id, name, category, price_halere, stock. */
export function listProducts(db) {

}

/** Zboží, kterého je skladem aspoň minStock: id, name, stock. Podle id. */
export function productsInStock(db, minStock) {

}

/** Zboží, jehož název obsahuje text kdekoli uvnitř: id, name. Podle id. */
export function searchProducts(db, text) {

}

/** Součet pieces × unit_price_halere přes položky objednávky. Neexistující = 0. */
export function orderTotal(db, orderId) {

}

/** Položky objednávky: name, pieces, unit_price_halere, total_halere. */
export function orderItems(db, orderId) {

}

/** Za každého zákazníka email, orders_count a spent_halere (jen zaplacena/odeslana). */
export function customerSummary(db) {

}

/** Nejvýš limit položek zboží podle prodaných kusů: name, pieces. */
export function topProducts(db, limit) {

}

/** Tržby po měsících: month ve tvaru 2026-01 a revenue_halere, od nejstaršího. */
export function revenueByMonth(db) {

}

/** Za každé město zákazník s nejvyšší útratou: city, email, spent_halere. */
export function bestCustomerPerCity(db) {

}

/** Založí objednávku z [{ productId, pieces }], sníží sklad a vrátí její id. */
export function placeOrder(db, customerId, items) {

}
```

## --file-- index.js

```js
import { openDb } from './db.js';
import * as dotazy from './queries.js';

// Tlačítko Spustit: zavolá každou funkci, kterou už máš napsanou, a vypíše výsledek.
const db = openDb();

const ukazky = [
  ['listProducts', () => dotazy.listProducts(db)],
  ['productsInStock(10)', () => dotazy.productsInStock(db, 10)],
  ['searchProducts("káva")', () => dotazy.searchProducts(db, 'káva')],
  ['orderTotal(1)', () => dotazy.orderTotal(db, 1)],
  ['orderItems(4)', () => dotazy.orderItems(db, 4)],
  ['customerSummary', () => dotazy.customerSummary(db)],
  ['topProducts(3)', () => dotazy.topProducts(db, 3)],
  ['revenueByMonth', () => dotazy.revenueByMonth(db)],
  ['bestCustomerPerCity', () => dotazy.bestCustomerPerCity(db)],
];

for (const [jmeno, zavolej] of ukazky) {
  try {
    const vysledek = zavolej();
    const prazdne = vysledek === undefined || (Array.isArray(vysledek) && vysledek.length === 0);
    console.log(`\n— ${jmeno} ${prazdne ? '(zatím nic)' : ''}`);
    if (!prazdne) console.log(vysledek);
  } catch (chyba) {
    console.log(`\n— ${jmeno} spadlo: ${chyba.message}`);
  }
}
```

## --file-- package.json

```json
{
  "name": "zrnko-administrace",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node index.js"
  }
}
```

# --solution--

## --file-- schema.sql

```sql
-- Schéma e-shopu Zrnko. Ceny jsou v haléřích jako celá čísla.

CREATE TABLE customers (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL,
  city  TEXT NOT NULL
) STRICT;

CREATE TABLE products (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  price_halere INTEGER NOT NULL CHECK (price_halere > 0),
  stock        INTEGER NOT NULL CHECK (stock >= 0)
) STRICT;

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  -- Smazaný zákazník odnese svoje objednávky.
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('nova', 'zaplacena', 'odeslana', 'zrusena'))
) STRICT;

CREATE TABLE order_items (
  id                INTEGER PRIMARY KEY,
  -- Položky jdou s objednávkou; zboží naopak smazat nejde, dokud je v objednávce.
  order_id          INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        INTEGER NOT NULL REFERENCES products(id),
  pieces            INTEGER NOT NULL CHECK (pieces > 0),
  unit_price_halere INTEGER NOT NULL CHECK (unit_price_halere > 0),
  UNIQUE (order_id, product_id)
) STRICT;
```

## --file-- queries.js

```js
// Dotazy pro administraci e-shopu Zrnko.
// Každá funkce dostane jako první argument otevřenou databázi.

// Objednávka se počítá do tržeb, jen když je zaplacená nebo odeslaná.
const PLATNE_STAVY = "('zaplacena', 'odeslana')";

export function listProducts(db) {
  return db
    .prepare('SELECT id, name, category, price_halere, stock FROM products ORDER BY price_halere DESC')
    .all();
}

export function productsInStock(db, minStock) {
  return db
    .prepare('SELECT id, name, stock FROM products WHERE stock >= ? ORDER BY id')
    .all(minStock);
}

export function searchProducts(db, text) {
  // Procenta kolem hledaného textu se skládají až v SQL, aby zůstal parametrem.
  return db
    .prepare("SELECT id, name FROM products WHERE name LIKE '%' || ? || '%' ORDER BY id")
    .all(text);
}

export function orderTotal(db, orderId) {
  // SUM nad prázdnou množinou vrací NULL, proto COALESCE.
  const radek = db
    .prepare('SELECT COALESCE(SUM(pieces * unit_price_halere), 0) AS total FROM order_items WHERE order_id = ?')
    .get(orderId);
  return radek.total;
}

export function orderItems(db, orderId) {
  return db
    .prepare(`
      SELECT p.name AS name,
             i.pieces AS pieces,
             i.unit_price_halere AS unit_price_halere,
             i.pieces * i.unit_price_halere AS total_halere
      FROM order_items i
      JOIN products p ON p.id = i.product_id
      WHERE i.order_id = ?
      ORDER BY i.id
    `)
    .all(orderId);
}

export function customerSummary(db) {
  // LEFT JOIN, aby nevypadl zákazník bez objednávky.
  // COUNT(DISTINCT o.id), protože spojení s položkami každou objednávku znásobí.
  return db
    .prepare(`
      SELECT c.email AS email,
             COUNT(DISTINCT o.id) AS orders_count,
             COALESCE(SUM(i.pieces * i.unit_price_halere), 0) AS spent_halere
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id AND o.status IN ('zaplacena', 'odeslana')
      LEFT JOIN order_items i ON i.order_id = o.id
      GROUP BY c.id
      ORDER BY spent_halere DESC, email
    `)
    .all();
}

export function topProducts(db, limit) {
  return db
    .prepare(`
      SELECT p.name AS name, SUM(i.pieces) AS pieces
      FROM order_items i
      JOIN orders o ON o.id = i.order_id
      JOIN products p ON p.id = i.product_id
      WHERE o.status IN ('zaplacena', 'odeslana')
      GROUP BY p.id
      ORDER BY pieces DESC, p.name
      LIMIT ?
    `)
    .all(limit);
}

export function revenueByMonth(db) {
  return db
    .prepare(`
      SELECT substr(o.created_at, 1, 7) AS month,
             SUM(i.pieces * i.unit_price_halere) AS revenue_halere
      FROM orders o
      JOIN order_items i ON i.order_id = o.id
      WHERE o.status IN ('zaplacena', 'odeslana')
      GROUP BY month
      ORDER BY month
    `)
    .all();
}

export function bestCustomerPerCity(db) {
  // Nejdřív útrata každého zákazníka, pak okno: v každém městě pořadí podle útraty.
  return db
    .prepare(`
      WITH utraty AS (
        SELECT c.city AS city,
               c.email AS email,
               COALESCE(SUM(i.pieces * i.unit_price_halere), 0) AS spent_halere
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id AND o.status IN ('zaplacena', 'odeslana')
        LEFT JOIN order_items i ON i.order_id = o.id
        GROUP BY c.id
      ),
      zebricek AS (
        SELECT city, email, spent_halere,
               ROW_NUMBER() OVER (PARTITION BY city ORDER BY spent_halere DESC, email) AS poradi
        FROM utraty
      )
      SELECT city, email, spent_halere FROM zebricek WHERE poradi = 1 ORDER BY city
    `)
    .all();
}

export function placeOrder(db, customerId, items) {
  const dnes = new Date().toISOString().slice(0, 10);

  // Transakce: buď vznikne celá objednávka i s odečteným skladem, nebo nic.
  db.exec('BEGIN');
  try {
    const hlavicka = db
      .prepare("INSERT INTO orders (customer_id, created_at, status) VALUES (?, ?, 'nova')")
      .run(customerId, dnes);
    const orderId = Number(hlavicka.lastInsertRowid);

    const cena = db.prepare('SELECT price_halere FROM products WHERE id = ?');
    const vlozit = db.prepare(
      'INSERT INTO order_items (order_id, product_id, pieces, unit_price_halere) VALUES (?, ?, ?, ?)',
    );
    const odecist = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const { productId, pieces } of items) {
      const produkt = cena.get(productId);
      if (!produkt) throw new Error(`Zboží ${productId} v katalogu není.`);
      vlozit.run(orderId, productId, pieces, produkt.price_halere);
      odecist.run(pieces, productId);
    }

    db.exec('COMMIT');
    return orderId;
  } catch (chyba) {
    db.exec('ROLLBACK');
    throw chyba;
  }
}
```

# --approaches--

## --approach-- Souhrn zákazníků přes poddotazy

Místo dvou `LEFT JOIN` a `COUNT(DISTINCT …)` si každý sloupec spočítá vlastní poddotaz.
Je to delší a databáze projde objednávky dvakrát, zato je na první pohled vidět, co se
počítá — a nehrozí, že spojení s položkami znásobí počet objednávek.

### --file-- schema.sql

```sql
-- Schéma e-shopu Zrnko. Ceny jsou v haléřích jako celá čísla.

CREATE TABLE customers (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL,
  city  TEXT NOT NULL
) STRICT;

CREATE TABLE products (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  price_halere INTEGER NOT NULL CHECK (price_halere > 0),
  stock        INTEGER NOT NULL CHECK (stock >= 0)
) STRICT;

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  -- Smazaný zákazník odnese svoje objednávky.
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('nova', 'zaplacena', 'odeslana', 'zrusena'))
) STRICT;

CREATE TABLE order_items (
  id                INTEGER PRIMARY KEY,
  -- Položky jdou s objednávkou; zboží naopak smazat nejde, dokud je v objednávce.
  order_id          INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        INTEGER NOT NULL REFERENCES products(id),
  pieces            INTEGER NOT NULL CHECK (pieces > 0),
  unit_price_halere INTEGER NOT NULL CHECK (unit_price_halere > 0),
  UNIQUE (order_id, product_id)
) STRICT;
```

### --file-- queries.js

```js
// Dotazy pro administraci e-shopu Zrnko.
// Každá funkce dostane jako první argument otevřenou databázi.

// Objednávka se počítá do tržeb, jen když je zaplacená nebo odeslaná.
const PLATNE_STAVY = "('zaplacena', 'odeslana')";

export function listProducts(db) {
  return db
    .prepare('SELECT id, name, category, price_halere, stock FROM products ORDER BY price_halere DESC')
    .all();
}

export function productsInStock(db, minStock) {
  return db
    .prepare('SELECT id, name, stock FROM products WHERE stock >= ? ORDER BY id')
    .all(minStock);
}

export function searchProducts(db, text) {
  // Procenta kolem hledaného textu se skládají až v SQL, aby zůstal parametrem.
  return db
    .prepare("SELECT id, name FROM products WHERE name LIKE '%' || ? || '%' ORDER BY id")
    .all(text);
}

export function orderTotal(db, orderId) {
  // SUM nad prázdnou množinou vrací NULL, proto COALESCE.
  const radek = db
    .prepare('SELECT COALESCE(SUM(pieces * unit_price_halere), 0) AS total FROM order_items WHERE order_id = ?')
    .get(orderId);
  return radek.total;
}

export function orderItems(db, orderId) {
  return db
    .prepare(`
      SELECT p.name AS name,
             i.pieces AS pieces,
             i.unit_price_halere AS unit_price_halere,
             i.pieces * i.unit_price_halere AS total_halere
      FROM order_items i
      JOIN products p ON p.id = i.product_id
      WHERE i.order_id = ?
      ORDER BY i.id
    `)
    .all(orderId);
}

export function customerSummary(db) {
  // Každý sloupec si spočítá vlastní poddotaz, takže se nic neznásobuje
  // a není potřeba DISTINCT. Zato databáze čte objednávky dvakrát.
  return db
    .prepare(`
      SELECT c.email AS email,
             (SELECT COUNT(*) FROM orders o
               WHERE o.customer_id = c.id AND o.status IN ('zaplacena', 'odeslana')) AS orders_count,
             (SELECT COALESCE(SUM(i.pieces * i.unit_price_halere), 0)
                FROM orders o
                JOIN order_items i ON i.order_id = o.id
               WHERE o.customer_id = c.id AND o.status IN ('zaplacena', 'odeslana')) AS spent_halere
      FROM customers c
      ORDER BY spent_halere DESC, email
    `)
    .all();
}

export function topProducts(db, limit) {
  return db
    .prepare(`
      SELECT p.name AS name, SUM(i.pieces) AS pieces
      FROM order_items i
      JOIN orders o ON o.id = i.order_id
      JOIN products p ON p.id = i.product_id
      WHERE o.status IN ('zaplacena', 'odeslana')
      GROUP BY p.id
      ORDER BY pieces DESC, p.name
      LIMIT ?
    `)
    .all(limit);
}

export function revenueByMonth(db) {
  return db
    .prepare(`
      SELECT substr(o.created_at, 1, 7) AS month,
             SUM(i.pieces * i.unit_price_halere) AS revenue_halere
      FROM orders o
      JOIN order_items i ON i.order_id = o.id
      WHERE o.status IN ('zaplacena', 'odeslana')
      GROUP BY month
      ORDER BY month
    `)
    .all();
}

export function bestCustomerPerCity(db) {
  // Nejdřív útrata každého zákazníka, pak okno: v každém městě pořadí podle útraty.
  return db
    .prepare(`
      WITH utraty AS (
        SELECT c.city AS city,
               c.email AS email,
               COALESCE(SUM(i.pieces * i.unit_price_halere), 0) AS spent_halere
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id AND o.status IN ('zaplacena', 'odeslana')
        LEFT JOIN order_items i ON i.order_id = o.id
        GROUP BY c.id
      ),
      zebricek AS (
        SELECT city, email, spent_halere,
               ROW_NUMBER() OVER (PARTITION BY city ORDER BY spent_halere DESC, email) AS poradi
        FROM utraty
      )
      SELECT city, email, spent_halere FROM zebricek WHERE poradi = 1 ORDER BY city
    `)
    .all();
}

export function placeOrder(db, customerId, items) {
  const dnes = new Date().toISOString().slice(0, 10);

  // Transakce: buď vznikne celá objednávka i s odečteným skladem, nebo nic.
  db.exec('BEGIN');
  try {
    const hlavicka = db
      .prepare("INSERT INTO orders (customer_id, created_at, status) VALUES (?, ?, 'nova')")
      .run(customerId, dnes);
    const orderId = Number(hlavicka.lastInsertRowid);

    const cena = db.prepare('SELECT price_halere FROM products WHERE id = ?');
    const vlozit = db.prepare(
      'INSERT INTO order_items (order_id, product_id, pieces, unit_price_halere) VALUES (?, ?, ?, ?)',
    );
    const odecist = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const { productId, pieces } of items) {
      const produkt = cena.get(productId);
      if (!produkt) throw new Error(`Zboží ${productId} v katalogu není.`);
      vlozit.run(orderId, productId, pieces, produkt.price_halere);
      odecist.run(pieces, productId);
    }

    db.exec('COMMIT');
    return orderId;
  } catch (chyba) {
    db.exec('ROLLBACK');
    throw chyba;
  }
}
```

## --approach-- Nejlepší zákazník bez okenní funkce

`ROW_NUMBER() OVER (PARTITION BY …)` je nejkratší cesta, ale stejná úloha jde vyřešit
i klasicky: spočítat maximum v každém městě a k němu se zpátky připojit. Hodí se vědět
jak — na starších databázích (a v pohovorové otázce) okenní funkce mít nemusíš.

### --file-- schema.sql

```sql
-- Schéma e-shopu Zrnko. Ceny jsou v haléřích jako celá čísla.

CREATE TABLE customers (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL,
  city  TEXT NOT NULL
) STRICT;

CREATE TABLE products (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  price_halere INTEGER NOT NULL CHECK (price_halere > 0),
  stock        INTEGER NOT NULL CHECK (stock >= 0)
) STRICT;

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  -- Smazaný zákazník odnese svoje objednávky.
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('nova', 'zaplacena', 'odeslana', 'zrusena'))
) STRICT;

CREATE TABLE order_items (
  id                INTEGER PRIMARY KEY,
  -- Položky jdou s objednávkou; zboží naopak smazat nejde, dokud je v objednávce.
  order_id          INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        INTEGER NOT NULL REFERENCES products(id),
  pieces            INTEGER NOT NULL CHECK (pieces > 0),
  unit_price_halere INTEGER NOT NULL CHECK (unit_price_halere > 0),
  UNIQUE (order_id, product_id)
) STRICT;
```

### --file-- queries.js

```js
// Dotazy pro administraci e-shopu Zrnko.
// Každá funkce dostane jako první argument otevřenou databázi.

// Objednávka se počítá do tržeb, jen když je zaplacená nebo odeslaná.
const PLATNE_STAVY = "('zaplacena', 'odeslana')";

export function listProducts(db) {
  return db
    .prepare('SELECT id, name, category, price_halere, stock FROM products ORDER BY price_halere DESC')
    .all();
}

export function productsInStock(db, minStock) {
  return db
    .prepare('SELECT id, name, stock FROM products WHERE stock >= ? ORDER BY id')
    .all(minStock);
}

export function searchProducts(db, text) {
  // Procenta kolem hledaného textu se skládají až v SQL, aby zůstal parametrem.
  return db
    .prepare("SELECT id, name FROM products WHERE name LIKE '%' || ? || '%' ORDER BY id")
    .all(text);
}

export function orderTotal(db, orderId) {
  // SUM nad prázdnou množinou vrací NULL, proto COALESCE.
  const radek = db
    .prepare('SELECT COALESCE(SUM(pieces * unit_price_halere), 0) AS total FROM order_items WHERE order_id = ?')
    .get(orderId);
  return radek.total;
}

export function orderItems(db, orderId) {
  return db
    .prepare(`
      SELECT p.name AS name,
             i.pieces AS pieces,
             i.unit_price_halere AS unit_price_halere,
             i.pieces * i.unit_price_halere AS total_halere
      FROM order_items i
      JOIN products p ON p.id = i.product_id
      WHERE i.order_id = ?
      ORDER BY i.id
    `)
    .all(orderId);
}

export function customerSummary(db) {
  // LEFT JOIN, aby nevypadl zákazník bez objednávky.
  // COUNT(DISTINCT o.id), protože spojení s položkami každou objednávku znásobí.
  return db
    .prepare(`
      SELECT c.email AS email,
             COUNT(DISTINCT o.id) AS orders_count,
             COALESCE(SUM(i.pieces * i.unit_price_halere), 0) AS spent_halere
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id AND o.status IN ('zaplacena', 'odeslana')
      LEFT JOIN order_items i ON i.order_id = o.id
      GROUP BY c.id
      ORDER BY spent_halere DESC, email
    `)
    .all();
}

export function topProducts(db, limit) {
  return db
    .prepare(`
      SELECT p.name AS name, SUM(i.pieces) AS pieces
      FROM order_items i
      JOIN orders o ON o.id = i.order_id
      JOIN products p ON p.id = i.product_id
      WHERE o.status IN ('zaplacena', 'odeslana')
      GROUP BY p.id
      ORDER BY pieces DESC, p.name
      LIMIT ?
    `)
    .all(limit);
}

export function revenueByMonth(db) {
  return db
    .prepare(`
      SELECT substr(o.created_at, 1, 7) AS month,
             SUM(i.pieces * i.unit_price_halere) AS revenue_halere
      FROM orders o
      JOIN order_items i ON i.order_id = o.id
      WHERE o.status IN ('zaplacena', 'odeslana')
      GROUP BY month
      ORDER BY month
    `)
    .all();
}

export function bestCustomerPerCity(db) {
  // Bez okenní funkce: nejdřív maximum útraty v každém městě, pak se k němu
  // zpátky připojí zákazník, který na něj sedí. Při shodě vybere abecedně nižší e-mail.
  return db
    .prepare(`
      WITH utraty AS (
        SELECT c.city AS city,
               c.email AS email,
               COALESCE(SUM(i.pieces * i.unit_price_halere), 0) AS spent_halere
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id AND o.status IN ('zaplacena', 'odeslana')
        LEFT JOIN order_items i ON i.order_id = o.id
        GROUP BY c.id
      ),
      maxima AS (
        SELECT city, MAX(spent_halere) AS spent_halere FROM utraty GROUP BY city
      )
      SELECT m.city AS city, MIN(u.email) AS email, m.spent_halere AS spent_halere
      FROM maxima m
      JOIN utraty u ON u.city = m.city AND u.spent_halere = m.spent_halere
      GROUP BY m.city
      ORDER BY m.city
    `)
    .all();
}

export function placeOrder(db, customerId, items) {
  const dnes = new Date().toISOString().slice(0, 10);

  // Transakce: buď vznikne celá objednávka i s odečteným skladem, nebo nic.
  db.exec('BEGIN');
  try {
    const hlavicka = db
      .prepare("INSERT INTO orders (customer_id, created_at, status) VALUES (?, ?, 'nova')")
      .run(customerId, dnes);
    const orderId = Number(hlavicka.lastInsertRowid);

    const cena = db.prepare('SELECT price_halere FROM products WHERE id = ?');
    const vlozit = db.prepare(
      'INSERT INTO order_items (order_id, product_id, pieces, unit_price_halere) VALUES (?, ?, ?, ?)',
    );
    const odecist = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const { productId, pieces } of items) {
      const produkt = cena.get(productId);
      if (!produkt) throw new Error(`Zboží ${productId} v katalogu není.`);
      vlozit.run(orderId, productId, pieces, produkt.price_halere);
      odecist.run(pieces, productId);
    }

    db.exec('COMMIT');
    return orderId;
  } catch (chyba) {
    db.exec('ROLLBACK');
    throw chyba;
  }
}
```

# --review--

Testy zkontrolovaly, co funkce vrací. Tohle si projdi sám — tady se pozná rozdíl mezi
„dotaz vrací správná čísla" a „schéma udrží data v pořádku".

## --rubric--

- Každé pravidlo ze zadání hlídá databáze, ne JavaScript kolem ní.
- Víš u každého cizího klíče, proč má (nebo nemá) kaskádu při mazání.
- Žádný dotaz neskládá hodnoty do SQL řetězcem — všechny jdou parametrem.
- Agregace, kde se spojují dvě tabulky, nepočítá řádky po spojení místo objednávek.
- U `placeOrder` víš, co přesně se stane při chybě v poslední položce.
- Umíš u každého dotazu říct, které sloupce by se hodilo zaindexovat a proč.

## --extensions--

- **Indexy.** Přidej index na `order_items(order_id)` a `orders(customer_id, status)`
  a porovnej `EXPLAIN QUERY PLAN` před a po.
- **Historie cen.** Co by se muselo změnit, aby šlo zjistit, za kolik se zboží prodávalo
  loni? (Nápověda: `unit_price_halere` už polovinu práce dělá.)
- **Stornování.** Napiš `cancelOrder(db, orderId)`, která objednávku převede do stavu
  `zrusena` a vrátí kusy na sklad — zase celé, nebo vůbec.
- **Pohled.** Vytvoř `CREATE VIEW` pro platné objednávky a přepiš nad ním dotazy.
  Zkrátí se, nebo se to jen schová?
