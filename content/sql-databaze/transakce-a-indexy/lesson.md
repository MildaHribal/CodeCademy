# Transakce, indexy a N+1

:::check pretest
E-shop s deskovými hrami přijme objednávku dvěma příkazy: nejdřív zapíše řádek do `orders`, pak sníží `stock` u hry. Druhý příkaz spadne, protože skladem zbývají dva kusy a zákazník chce pět. Co bude v databázi?

### --answer--
Nic. Když jeden příkaz selže, databáze druhý vrátí zpátky.

#### --why--
Databáze sama nemá jak poznat, že ty dva příkazy patří k sobě. Každý z nich vyhodnotila zvlášť a o tom druhém neví.

### --correct--
Objednávka tam bude, ale sklad zůstane nesnížený.

### --answer--
Objednávka se zapíše a sklad spadne do mínusu.

#### --why--
Sklad má `CHECK (stock >= 0)`, takže do mínusu ho databáze nepustí — právě proto ten druhý příkaz selhal.
:::

Databázi už umíš navrhnout i se z ní ptát. Teď přijdou tři věci, které oddělují dotazy,
co fungují na dvaceti řádcích, od dotazů, co fungují na dvou milionech: **transakce**
(aby se změny staly buď všechny, nebo žádná), **indexy** (aby hledání netrvalo vteřiny)
a **N+1** (nejčastější důvod, proč je jinak hezky napsané API pomalé).

> [!REMEMBER]
> **Transakce dělá z několika příkazů jednu nedělitelnou změnu, index mění hledání na
> nalistování a N+1 je cyklus, který se ptá databáze tolikrát, kolikrát mohl jednou.**

## Problém: dvě změny, které musí projít obě

E-shop s deskovými hrami má dvě tabulky: `games` se skladem a `orders` s objednávkami.
Přijmout objednávku znamená dvě změny — zapsat objednávku a odečíst kusy ze skladu.
Jsou to dva příkazy, a mezi nimi může cokoli selhat.

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE games (id INTEGER PRIMARY KEY, title TEXT NOT NULL, stock INTEGER NOT NULL CHECK (stock >= 0)) STRICT;
  CREATE TABLE orders (id INTEGER PRIMARY KEY, game_id INTEGER NOT NULL, pieces INTEGER NOT NULL) STRICT;
  INSERT INTO games (title, stock) VALUES ('Osadníci z Katanu', 2);
`);

try {
  db.prepare('INSERT INTO orders (game_id, pieces) VALUES (?, ?)').run(1, 5);
  db.prepare('UPDATE games SET stock = stock - ? WHERE id = ?').run(5, 1);
} catch (error) {
  console.log('Zápis selhal:', error.message);
}

console.log('objednávek:', db.prepare('SELECT COUNT(*) AS pocet FROM orders').get().pocet);
console.log('skladem:', db.prepare('SELECT stock FROM games WHERE id = 1').get().stock);
```
--question-- Co vypíše program?
--output--
```text
Zápis selhal: CHECK constraint failed: stock >= 0
objednávek: 1
skladem: 2
```
--why-- První příkaz proběhl a databáze ho ihned uložila. Druhý narazil na `CHECK`, takže se neprovedl — ale ten první tím nezmizel. V e-shopu tak zůstala objednávka na pět kusů, které nikdo neodečetl ze skladu. Tomuhle stavu se říká **částečný zápis** a je horší než žádný zápis: nikde se nehlásí a najde se až podle reklamací.
:::

Nejde o chybu SQLite. Databáze každý příkaz uzavře hned, jak doběhne, protože netuší,
že ty dva patří k sobě. **Musíš jí to říct.**

:::check
Kolik řádků má tabulka `orders` po tom, co ukázka skončila?

### --expected--
1

### --why--
`INSERT` proběhl a nic ho nevrátilo zpátky. Selhal až `UPDATE`, který se do tabulky
`orders` vůbec nepodíval.
:::

## Transakce: BEGIN, COMMIT a ROLLBACK

[[transakce|Transakce]] (*transaction*) je skupina příkazů, se kterou databáze zachází
jako s jedním. Otevře ji `BEGIN`, potvrdí `COMMIT` a zruší `ROLLBACK`:

```sql
BEGIN;
INSERT INTO orders (game_id, pieces) VALUES (1, 5);
UPDATE games SET stock = stock - 5 WHERE id = 1;
COMMIT;
```

Když mezi `BEGIN` a `COMMIT` cokoli selže, pošleš `ROLLBACK` a databáze se vrátí přesně
do stavu před `BEGIN`. V Node to vypadá takhle — tři pojmenované kroky, ze kterých je
vidět postup:

```js
export function placeOrder(db, gameId, pieces) {
  // 1. Otevři transakci — odsud dál nic neplatí, dokud to nepotvrdíš.
  db.exec('BEGIN');
  try {
    // 2. Proveď všechny změny, které patří k sobě.
    db.prepare('INSERT INTO orders (game_id, pieces) VALUES (?, ?)').run(gameId, pieces);
    db.prepare('UPDATE games SET stock = stock - ? WHERE id = ?').run(pieces, gameId);
    // 3. Potvrď je najednou.
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
```

Se stejnými daty jako v předchozí ukázce teď `placeOrder(db, 1, 5)` vyhodí chybu
a v `orders` **nezůstane nic**. Objednávka na dva kusy projde celá.

> [!TIP]
> `try`/`catch` kolem transakce piš vždycky. Transakce, kterou nikdo nepotvrdil ani
> nezrušil, drží zámek nad databází, dokud spojení nezanikne — a další zápisy mezitím
> čekají nebo selžou na `database is locked`.

:::check
Program pošle `BEGIN`, provede tři `UPDATE` a pak spadne na výjimce ještě před `COMMIT`. Spojení se korektně uzavře. Kolik z těch tří změn zůstane v databázi?

### --expected--
0

### --why--
Nepotvrzená transakce se při zavření spojení zruší. `COMMIT` je jediný okamžik, kdy se
změny stanou trvalými — do té chvíle jsou vidět jen uvnitř té transakce.
:::

## Co transakce zaručuje

Vlastnosti transakce se zkracují na **ACID**. Ve zkratce a bez latiny:

| vlastnost | co to znamená v praxi |
|---|---|
| atomicita | Všechny příkazy transakce platí, nebo žádný. Žádné „půlka objednávky". |
| konzistence | Po `COMMIT` platí všechna omezení schématu — cizí klíče, `CHECK`, `UNIQUE`. |
| izolace | Než potvrdíš, ostatní tvoje rozdělané změny nevidí. |
| trvanlivost | Po `COMMIT` data přežijí i vypnutí proudu. |

[[atomicita|Atomicitu]] potřebuješ vždycky, když jedna činnost uživatele znamená víc
zápisů: objednávka a sklad, převod peněz mezi dvěma účty, smazání diskuze i s příspěvky,
import tisíce řádků z CSV.

Transakce má ještě druhý, méně nápadný užitek: **je rychlá**. Každý samostatný `INSERT`
si vynutí zápis na disk. Když jich pět tisíc zabalíš do jedné transakce, zapíše se na
disk jednou na konci — rozdíl bývá v řádu desítek násobků.

> [!PITFALL]
> V SQLite smí v jednu chvíli zapisovat jen jeden. Transakce, která nejdřív čte a pak
> podle přečteného zapisuje, může skončit na `database is locked`, protože si zámek
> vyžádala pozdě. Otevři ji rovnou jako `BEGIN IMMEDIATE`. PostgreSQL tenhle problém
> nemá, zvládá víc zapisujících najednou.

:::check
Import z CSV vloží 5 000 řádků 5 000 samostatnými příkazy `INSERT`. Která vlastnost transakce zařídí, že po zabalení do jednoho `BEGIN`/`COMMIT` bude import rychlejší? Napiš ji jedním slovem.

### --expected-- ignore-case
trvanlivost

### --why--
Trvanlivost znamená, že po `COMMIT` data přežijí i vypnutí proudu — a právě kvůli ní
si každý samostatný příkaz vynutí zápis na disk. Uvnitř jedné transakce se na disk
zapisuje jednou na konci.
:::

:::explain
Objednávka v e-shopu je jeden `INSERT` a jeden `UPDATE`. Proč nestačí zabalit ty dva příkazy do jedné funkce v JavaScriptu a chybu ošetřit `try`/`catch` bez transakce?

## --model--
Funkce v JavaScriptu umí zachytit výjimku, ale neumí vzít zpátky příkaz, který už
databáze provedla. `INSERT` je po doběhnutí uložený a `catch` s ním nic neudělá. Aby
šlo změnu vrátit, musí o té dvojici vědět databáze — tedy `BEGIN` na začátku a `COMMIT`
až na konci. Navíc mezi ty dva příkazy může vstoupit jiný požadavek a vidět stav, který
nikdy neměl existovat; izolace transakce tomu brání.

## --checklist--
- Provedený `INSERT` už `catch` v JavaScriptu nevrátí zpátky.
- Vrátit změnu umí jen databáze, a to jen když ví, že příkazy patří k sobě.
- Mezi oběma příkazy může jiný požadavek vidět rozdělaný stav.
:::

## Proč je dotaz pomalý: plán dotazu

Tabulka `orders` e-shopu má 200 000 řádků. Dotaz na objednávky jednoho zákazníka
vypadá nevinně:

```sql
SELECT id, created_at, total_halere FROM orders WHERE email = ?;
```

Databáze ale neví, kde ten e-mail je, takže projde **všech 200 000 řádků** a u každého
porovná sloupec. Zeptat se, jak to hodlá udělat, jde předem — slovem `EXPLAIN QUERY PLAN`
před dotazem (v PostgreSQL samotné `EXPLAIN`). Odpověď je krátká a stojí za přečtení:

:::compare
```html
<div class="karta">
  <h2 id="nadpis"></h2>
  <pre id="dotaz"></pre>
  <h3>Plán dotazu</h3>
  <pre id="plan"></pre>
  <p id="cas"></p>
</div>
```
```css
body { margin: 0; font: 15px/1.5 system-ui, sans-serif; color: #1f2430; background: #f6f7fb; }
.karta { padding: 1rem 1.25rem; }
h2 { margin: 0 0 .5rem; font-size: 1.05rem; }
h3 { margin: 1rem 0 .35rem; font-size: .8rem; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; }
pre { margin: 0; padding: .6rem .7rem; border-radius: .5rem; background: #fff; border: 1px solid #dfe3ec; font: 13px/1.5 ui-monospace, monospace; white-space: pre-wrap; }
#plan { background: #eef2ff; border-color: #c7d2fe; }
p { margin: .75rem 0 0; font-weight: 600; }
```
```js
function ukaz({ nadpis, dotaz, plan, cas }) {
  document.getElementById('nadpis').textContent = nadpis;
  document.getElementById('dotaz').textContent = dotaz;
  document.getElementById('plan').textContent = plan;
  document.getElementById('cas').textContent = cas;
}
```
--variant-- Bez indexu
```js
ukaz({
  nadpis: 'orders, 200 000 řádků, žádný index',
  dotaz: "SELECT id, created_at, total_halere\n  FROM orders\n WHERE email = 'zakaznik42@example.cz';",
  plan: 'SCAN orders',
  cas: 'Jeden dotaz: 4,9 ms',
});
```
--variant-- S indexem na e-mailu
```js
ukaz({
  nadpis: 'táž tabulka po CREATE INDEX idx_orders_email ON orders(email)',
  dotaz: "SELECT id, created_at, total_halere\n  FROM orders\n WHERE email = 'zakaznik42@example.cz';",
  plan: 'SEARCH orders USING INDEX idx_orders_email (email=?)',
  cas: 'Jeden dotaz: 0,008 ms',
});
```
:::

Stejný dotaz, stejná data, šestisetnásobný rozdíl. Celé je to v jednom slově plánu:

- **`SCAN`** = přečti celou tabulku řádek po řádku. Čas roste s počtem řádků.
- **`SEARCH … USING INDEX`** = nalistuj rovnou. Čas roste jen nepatrně, i kdyby řádků
  přibyl milion.

Číst [[dotazovací plán|plán dotazu]] se vyplatí dřív než hádat. Na dvaceti testovacích
řádcích je každý dotaz rychlý; `SCAN` v plánu je vidět hned.

:::check
Jaké slovo v plánu dotazu znamená, že databáze čte tabulku celou? Napiš ho tak, jak ho vypíše `EXPLAIN QUERY PLAN`.

### --expected-- ignore-case
SCAN

### --why--
`SCAN` je průchod celou tabulkou. Protipól je `SEARCH … USING INDEX`, tedy nalistování
přes index.
:::

## Index: co umí a co stojí

[[databázový index|Index]] je pomocná struktura seřazená podle hodnot sloupce — jako
rejstřík na konci knihy. Zakládá se jedním příkazem:

```sql
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_email_created ON orders(email, created_at);
```

Druhý řádek je **složený index** a pořadí sloupců v něm rozhoduje. Index `(email, created_at)`
pomůže dotazu na `email`, dotazu na `email` i `created_at` a řazení podle `created_at`
uvnitř jednoho e-mailu. Dotazu jen na `created_at` nepomůže — v rejstříku podle příjmení
taky nenajdeš člověka podle křestního jména.

Co dostaneš zadarmo:

- **Primární klíč index má.** `id INTEGER PRIMARY KEY` je v SQLite přímo klíč tabulky.
- **`UNIQUE` index má taky** — jinak by neměl jak jedinečnost hlídat.
- Cizí klíč ho ale **nemá**. `orders.customer_id` si index musíš založit sám, jinak je
  každý `JOIN` a každé mazání zákazníka `SCAN`.

Co index stojí:

- **Zápisy.** Každý `INSERT`, `UPDATE` a `DELETE` musí opravit i všechny indexy tabulky.
- **Místo.** Index na textovém sloupci bývá velký jako sloupec sám.
- **Zbytečné indexy.** Index, který žádný dotaz nepoužije, jen zdržuje zápisy.

> [!PITFALL]
> **Funkce kolem sloupce index vypne.** `WHERE lower(email) = ?` skončí zase na `SCAN`,
> protože index zná hodnoty sloupce, ne výsledky funkce. Buď ukládej e-mail rovnou malými
> písmeny, nebo si v PostgreSQL založ index nad tím výrazem.

:::check
Tabulka `reviews` má cizí klíč `place_id` a stránka podniku se ptá `WHERE place_id = ?`. Dotaz je pomalý. Jaký příkaz to nejrychleji spraví? Napiš celý SQL příkaz a index pojmenuj `idx_reviews_place`.

### --expected--
CREATE INDEX idx_reviews_place ON reviews(place_id);

### --accept--
CREATE INDEX idx_reviews_place ON reviews (place_id);

### --why--
Cizí klíč index automaticky nedostane, i když na něj vazba ukazuje. Dokud ho nezaložíš,
hledá databáze recenze podniku průchodem celé tabulky.
:::

## Problém N+1

Poslední past nemá s SQL nic společného — vzniká v kódu kolem něj. Výpis objednávek
s jménem zákazníka se dá napsat takhle:

```js
// POZOR: 1 dotaz na seznam + 1 dotaz na každý řádek.
const orders = db.prepare('SELECT id, customer_id, total_halere FROM orders LIMIT 500').all();
for (const order of orders) {
  const customer = db.prepare('SELECT name FROM customers WHERE id = ?').get(order.customer_id);
  order.name = customer.name;
}
```

Pět set objednávek znamená **501 dotazů**. Tomu se říká [[problém N+1|N+1]]: jeden dotaz
na seznam a N dotazů na podrobnosti. Nad SQLite v paměti si toho nevšimneš (2,5 ms proti
0,8 ms), ale nad databází na jiném stroji má každý dotaz svoji cestu tam a zpět — při
jedné milisekundě na dotaz je to půl vteřiny proti jedné milisekundě.

Opravy jsou dvě a obě už umíš:

```sql
-- 1. JOIN: seznam i jména jedním dotazem.
SELECT o.id, o.total_halere, c.name
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
 LIMIT 500;
```

```js
// 2. Když JOIN nejde: jeden dotaz na všechna id najednou.
const ids = [...new Set(orders.map((order) => order.customer_id))];
const otazniky = ids.map(() => '?').join(', ');
const customers = db.prepare(`SELECT id, name FROM customers WHERE id IN (${otazniky})`).all(...ids);
```

Druhý zápis vypadá nebezpečně, ale bezpečný je: do SQL jde jen správný počet otazníků,
hodnoty se pořád předávají jako [[vázaný parametr|vázané parametry]].

:::check
API vypíše dvacet podniků a ke každému samostatným dotazem dotáhne jeho recenze. Kolik dotazů API pošle databázi?

### --expected--
21

### --why--
Jeden dotaz na seznam podniků a dvacet na recenze. Přesně tenhle poměr dal N+1 jméno.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Transakce bez `ROLLBACK`.** Když `catch` chybu jen zaloguje a transakci nezruší,
> zůstane otevřená a další zápisy skončí na `database is locked`. Oprava: `ROLLBACK`
> v `catch` a chybu poslat dál.

> [!PITFALL]
> **`await` uvnitř otevřené transakce.** Volání cizího API mezi `BEGIN` a `COMMIT` drží
> zámek po celou dobu čekání. Oprava: data si obstarej předem a transakci otevři až nad
> hotovými hodnotami.

> [!PITFALL]
> **Index „pro jistotu" na každém sloupci.** Deset indexů znamená deset struktur, které
> se musí opravit při každém zápisu. Oprava: zakládej index podle skutečných dotazů —
> tedy podle sloupců za `WHERE`, `JOIN … ON` a `ORDER BY`.

> [!PITFALL]
> **Měření na prázdné tabulce.** Nad padesáti řádky je `SCAN` rychlejší než index a
> plán nic neprozradí. Oprava: nacpi do tabulky sto tisíc řádků a teprve pak měř, nebo
> čti plán, který `SCAN` přizná i nad malými daty.

> [!PITFALL]
> **N+1 schovaný v ORM.** Zápis `order.customer.name` v cyklu vypadá jako práce
> s objektem, ale každý průchod pošle dotaz. Oprava: zapni si ve vývoji výpis dotazů
> a podívej se, kolik jich jedna stránka pošle.

:::check
Server zaloguje chybu z transakce a pokračuje dál, `ROLLBACK` ale nepošle. Další zápis do téže databáze skončí chybou. Jak zní její hláška v SQLite?

### --expected-- ignore-case
database is locked

### --why--
Nepotvrzená transakce drží zámek nad databází. Dokud nepřijde `COMMIT` nebo `ROLLBACK`,
nikdo jiný zapisovat nesmí.
:::

## Kde to najdeš v MDN

SQL v MDN nenajdeš, dokumentace k tomuhle tématu je u databází:

- [SQLite: Transaction](https://www.sqlite.org/lang_transaction.html) — `BEGIN`, `BEGIN IMMEDIATE`, `COMMIT`, `ROLLBACK`.
- [SQLite: Query Planning](https://www.sqlite.org/queryplanner.html) a [EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html) — jak plán číst.
- [SQLite: CREATE INDEX](https://www.sqlite.org/lang_createindex.html) — složené indexy, částečné indexy, `UNIQUE`.
- [PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) — tentýž plán, podrobnější a s odhadem ceny.

# --questions--

## --question--

Program pošle `BEGIN`, provede `INSERT`, pak `UPDATE`, který selže, a v `catch` zavolá `ROLLBACK`. Kolik řádků přibude v tabulce, do které šel ten `INSERT`?

### --expected--
0

### --why--
`ROLLBACK` vrátí databázi do stavu před `BEGIN`, takže zmizí i `INSERT`, který sám o sobě
prošel. Právě proto se transakce používají.

### --see--
sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback

## --question--

Tabulka `bookings` má 300 000 řádků a index `(court_id, starts_at)`. Který z dotazů index **nepoužije**?

### --answer--
`SELECT * FROM bookings WHERE court_id = 3;`

#### --why--
`court_id` je první sloupec indexu, takže tenhle dotaz index použije i bez druhého sloupce.

### --correct--
`SELECT * FROM bookings WHERE starts_at = '2026-05-01';`

#### --why--
`starts_at` je až druhý sloupec. Složený index se dá použít jen zleva — podle druhého
sloupce samotného se v něm listovat nedá.

### --answer--
`SELECT * FROM bookings WHERE court_id = 3 AND starts_at = '2026-05-01';`

#### --why--
Oba sloupce zleva, to je pro složený index ideální případ.

### --see--
sql-databaze/transakce-a-indexy#index-co-umi-a-co-stoji

## --question--

Stránka blogu vypíše 50 článků a ke každému zvlášť dotáhne jméno autora. Kolik dotazů dohromady pošle a jak se té chybě říká? Napiš číslo a název, například `12 něco`.

### --expected-- ignore-case
51 N+1

### --accept--
51 n+1
51, N+1

### --why--
Jeden dotaz na seznam článků plus padesát na autory. Oprava je `JOIN`, nebo jediný dotaz
s `WHERE id IN (…)` nad všemi id autorů.

### --see--
sql-databaze/transakce-a-indexy#problem-n-1

## --question--

Kdy se vyplatí obalit tisíc příkazů `INSERT` jednou transakcí, i když ti nevadí, že by se část z nich neprovedla?

### --answer--
Nikdy, transakce slouží jen k vracení změn.

#### --why--
Atomicita je hlavní důvod, ale ne jediný. Transakce mění i to, jak často se sahá na disk.

### --correct--
Vždycky — jedna transakce zapíše na disk jednou místo tisíckrát, takže je import výrazně rychlejší.

#### --why--
Přesně tak. Každý samostatný příkaz si vynutí vlastní zápis na disk; dávka v transakci
jeden na konci.

### --answer--
Jen v PostgreSQL, SQLite transakce ignoruje.

#### --why--
SQLite transakce plně podporuje a rozdíl v rychlosti je na ní vidět nejvíc.

### --see--
sql-databaze/transakce-a-indexy#co-transakce-zarucuje

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
const puvodni = { nazev: 'Osadníci', sklad: 2 };
const kopie = puvodni;
kopie.sklad = 0;
console.log(puvodni.sklad);
```

### --expected--
0

### --why--
`kopie` není kopie, ale druhé jméno pro tentýž objekt. Stejná past čeká v datové vrstvě:
řádek vrácený z databáze si někam uložíš, jinde ho změníš a divíš se, že se změnil i tam.

### --see--
js-objekty/reference-a-mutace#objekty-se-sdileji-pres-odkaz

## --question--

**Opakování z dřívějška.** Funkce načítá objednávky a pro každou volá `await nactiZakaznika(id)` uvnitř `for…of`. Kolegyně tvrdí, že by to šlo zrychlit. Co má na mysli?

### --answer--
Nahradit `for…of` cyklem `forEach`, ten je rychlejší.

#### --why--
`forEach` na `await` vůbec nečeká, takže by funkce skončila dřív, než by data dorazila. Rychlejší by to nebylo, jen rozbité.

### --correct--
Buď si data dotáhnout jedním dotazem, nebo požadavky poslat souběžně přes `Promise.all` — `for…of` s `await` je čeká jeden po druhém.

#### --why--
Přesně tohle je N+1 v asynchronní podobě: `for…of` čeká na každé kolo zvlášť. Nejlepší
je jeden dotaz navíc, druhá nejlepší souběžnost.

### --answer--
Přidat index na tabulku zákazníků; víc se udělat nedá.

#### --why--
Index zrychlí jeden dotaz, ale pořád jich pošleš N. Problém je v počtu dotazů, ne v jejich rychlosti.

### --see--
js-async/async-await#cykly-for-of-ceka-foreach-ne
