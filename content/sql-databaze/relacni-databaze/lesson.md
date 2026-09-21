# Relační databáze

:::check pretest
V projektu z `node-zaklady` ukládáš poznámky do souboru `notes.json`. Dva klienti pošlou `POST` ve stejnou chvíli: oba soubor přečtou, oba přidají svou poznámku a oba ho zapíšou. Kolik poznámek v souboru nakonec přibude?

### --answer--
Dvě, zápisy se postaví do fronty.

#### --why--
Soubor žádnou frontu nemá. Každý požadavek si přečetl starý obsah a zapsal svou verzi celého pole — pozdější zápis tu dřívější přepíše.

### --correct--
Jedna, druhý zápis přepíše první.

### --answer--
Žádná, soubor se poškodí a server spadne.

#### --why--
Oba zápisy jsou platný JSON, nic se nerozbije viditelně. Právě proto je ta chyba zákeřná: data tiše zmizí.
:::

Každý e-shop, rezervační systém nebo sociální síť drží data v databázi. JSON soubor
z `node-zaklady` stačí pro pár poznámek, ale rozpadne se hned, jak přijde víc věcí
najednou: dva zápisy ve stejnou chvíli, hledání v tisících záznamů, objednávka, která
odkazuje na zákazníka, nebo cena, která omylem přijde jako text `"zdarma"`.

Soubor nic nehlídá. Zapíše cokoli a nikomu neřekne, že data nedávají smysl.

> [!REMEMBER]
> **Relační databáze drží data v tabulkách s pevnými sloupci a sama odmítne zápis, který poruší pravidla — kód aplikace se na to nemusí spoléhat.**

## Tabulka, řádek, sloupec

[[relační databáze|Relační databáze]] (*relational database*) ukládá data do tabulek.
Tabulka je jako list v Excelu s přísnými pravidly: má pojmenované sloupce, každý
sloupec má typ a každý řádek je jeden záznam.

| id | title | year | rating |
|---|---|---|---|
| 1 | Pelíšky | 1999 | 8.4 |
| 2 | Kolja | 1996 | 8.3 |
| 3 | Vlny | 2024 | NULL |

S databází mluvíš jazykem **SQL** (*Structured Query Language*). Tabulku založí příkaz
`CREATE TABLE`:

```sql
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating REAL
);
```

Klíčová slova SQL se píšou velkými písmeny jen ze zvyku, aby se v kódu odlišila od
jmen tabulek a sloupců. Databáze velikost písmen u klíčových slov nerozlišuje. Jména
tabulek a sloupců piš malými písmeny s podtržítkem (`created_at`) — v PostgreSQL
se velká písmena ve jménech mění na malá a nadělají zmatek.

Oproti poli objektů v JSON jsou tu dvě zásadní změny. Všechny řádky mají **stejné
sloupce**, takže se nestane, že jeden film má `rating` a druhý `hodnoceni`. A tabulka
může žít v souboru o gigabajtech, protože databáze nečte při každém dotazu celý obsah
do paměti.

:::check
Máš tabulku `movies` z ukázky. Kolik sloupců má každý její řádek, když film ještě nemá hodnocení?

### --expected--
4

### --why--
Sloupce jsou dané tabulkou, ne řádkem. Film bez hodnocení má ve sloupci `rating`
hodnotu `NULL`, ale sloupec pořád existuje.
:::

## Datové typy

Každý sloupec má typ. V SQLite jich je pět a v praxi vystačíš se čtyřmi:

| typ v SQLite | co v něm je | v JavaScriptu přijde jako | v PostgreSQL |
|---|---|---|---|
| `INTEGER` | celé číslo | `number` | `integer`, `bigint` |
| `REAL` | desetinné číslo | `number` | `double precision`, přesně `numeric` |
| `TEXT` | text | `string` | `text`, `varchar(n)` |
| `BLOB` | bajty (obrázek, soubor) | `Uint8Array` | `bytea` |

Pravdivostní hodnota a datum v SQLite vlastní typ nemají. `true` se ukládá jako `1`,
datum jako text ve formátu ISO 8601 (`2026-09-16T10:00:00Z`), který jde řadit jako
text. PostgreSQL má `boolean`, `date` a `timestamptz`.

> [!TIP]
> Peníze nikdy neukládej do `REAL`. Desetinná čísla mají stejné zaokrouhlovací chyby jako
> v JavaScriptu (`0.1 + 0.2`). Ukládej haléře jako `INTEGER` (`19900` = 199 Kč), stejně
> jako v lekci o [počítání v haléřích](see:js-retezce-cisla/cisla#pocitani-v-halerich).

Pozor, SQLite je k typům shovívavé. Typ sloupce je jen doporučení, jak hodnotu
převést. Když převést nejde, uloží ji tak, jak přišla.

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE products (name TEXT NOT NULL, price INTEGER NOT NULL)');
db.prepare('INSERT INTO products (name, price) VALUES (?, ?)').run('Hrnek', 'zdarma');
const row = db.prepare('SELECT price FROM products').get();
console.log(row.price, typeof row.price);
```
--question-- Co vypíše `console.log`? Nebo zápis selže?
--output--
```text
zdarma string
```
--why-- SQLite text `'zdarma'` na číslo převést nemůže, a tak ho uloží jako text — i do sloupce `INTEGER`. PostgreSQL by zápis odmítl s chybou `invalid input syntax for type integer: "zdarma"`. SQLite se stejně přísným naučíš slovem `STRICT` za závorkou tabulky.
:::

Tabulka označená `STRICT` typy hlídá. Pro nové projekty v SQLite je to rozumná výchozí
volba:

```sql
CREATE TABLE products (
  name TEXT NOT NULL,
  price INTEGER NOT NULL
) STRICT;
```

Stejný zápis pak skončí chybou `cannot store TEXT value in INTEGER column products.price`.

:::check
Do tabulky bez `STRICT` se sloupcem `year INTEGER` zapíšeš hodnotu `'1999'` (text s číslicemi). Jaký typ bude mít `year` v JavaScriptu po přečtení?

### --expected--
number

### --why--
Tentokrát převod jde: text `'1999'` vypadá jako celé číslo, a tak ho SQLite uloží jako
`INTEGER`. Uloží ho jako text jen tehdy, když převést nejde.
:::

## Primární klíč

Každý řádek potřebuje něco, podle čeho ho najdeš a na co můžou odkazovat jiné tabulky.
To je [[primární klíč]] (*primary key*): sloupec, jehož hodnota je v tabulce jedinečná
a nikdy není prázdná.

```sql
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);
```

V SQLite je `INTEGER PRIMARY KEY` zvláštní případ: když `id` při zápisu vynecháš,
databáze přidělí další volné číslo sama. V PostgreSQL se totéž píše
`id integer GENERATED ALWAYS AS IDENTITY`.

Proč ne název filmu? Protože klíč se nemá měnit a nemá nést význam. Filmů „Babička" je
víc, název se může opravit a e-mail uživatele se změní. Číslo `id` zůstane.

:::check
Proč je `title` špatný primární klíč tabulky filmů? Vyber nejpřesnější důvod.

### --answer--
Text je v databázi pomalejší než číslo.

#### --why--
Rychlost tu nerozhoduje, textový klíč funguje. Problém je v tom, co se s hodnotou děje v čase a jestli je opravdu jedinečná.

### --correct--
Název se může změnit a dva různé filmy se můžou jmenovat stejně.

### --answer--
Primární klíč musí být vždycky typu `INTEGER`.

#### --why--
Primární klíč smí být jakéhokoli typu, třeba text s UUID. Jde o to, jestli hodnota zůstane jedinečná a neměnná.
:::

## Omezení: `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`

[[integritní omezení|Integritní omezení]] (*constraint*) je pravidlo, které databáze
kontroluje při každém zápisu. Porušení skončí chybou a řádek se neuloží.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 15),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;
```

| omezení | co hlídá | chyba v SQLite |
|---|---|---|
| `NOT NULL` | hodnota nesmí chybět | `NOT NULL constraint failed: users.name` |
| `UNIQUE` | hodnota se v tabulce neopakuje | `UNIQUE constraint failed: users.email` |
| `CHECK (…)` | podmínka musí platit | `CHECK constraint failed: age >= 15` |
| `DEFAULT …` | hodnota, když ji zápis vynechá | — |

Proč to dávat do databáze, když data kontroluje už server? Protože do databáze nezapisuje
jen jedna routa. Zapíše do ní import z CSV, skript kolegy, druhá aplikace i ty v konzoli.
Kontrola v kódu je pro hezkou chybovou hlášku, omezení v databázi je poslední pojistka.

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE)');
const insert = db.prepare('INSERT INTO users (email) VALUES (?)');
console.log(insert.run('eva@example.cz').lastInsertRowid);
console.log(insert.run('Eva@example.cz').lastInsertRowid);
insert.run('eva@example.cz');
```
--question-- Co vypíše program, než skončí (nebo spadne)?
--output--
```text
1
2
Error: UNIQUE constraint failed: users.email
```
--why-- `UNIQUE` porovnává text přesně, takže `Eva@example.cz` je pro databázi jiný e-mail a projde. Třetí zápis je shodný s prvním a databáze ho odmítne výjimkou. Když mají být e-maily jedinečné bez ohledu na velikost písmen, ukládej je převedené na malá písmena.
:::

:::check
Tabulka má sloupec `stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)`. Zapíšeš řádek a `stock` vynecháš. Jakou hodnotu bude mít?

### --expected--
0

### --why--
Vynechaný sloupec dostane hodnotu z `DEFAULT`. `NOT NULL` by selhalo jen tehdy, kdybys
`NULL` zapsal výslovně, nebo kdyby `DEFAULT` chyběl.
:::

## `NULL`: hodnota chybí

[[NULL]] neznamená nulu ani prázdný text. Znamená „nevím" — film ještě nikdo nehodnotil,
zákazník nevyplnil telefon. S tím souvisí pravidlo, na kterém se chybuje nejčastěji:
**jakékoli porovnání s `NULL` není pravda ani nepravda, ale zase `NULL`**. Je `8.4 = NULL`?
Nevíme. Je `NULL = NULL`? Taky nevíme.

`WHERE` propustí jen řádky, kde je podmínka pravdivá. Proto se na chybějící hodnotu ptáš
zvláštním operátorem `IS NULL` (a opačně `IS NOT NULL`).

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE movies (title TEXT NOT NULL, rating REAL);
  INSERT INTO movies (title, rating) VALUES ('Pelíšky', 8.4), ('Vlny', NULL);
`);
console.log(db.prepare('SELECT title FROM movies WHERE rating = NULL').all().length);
console.log(db.prepare('SELECT title FROM movies WHERE rating IS NULL').all().length);
```
--question-- Kolik řádků najdou oba dotazy? Napiš dva řádky výstupu.
--output--
```text
0
1
```
--why-- `rating = NULL` je pro každý řádek `NULL`, tedy „nevím", a `WHERE` takový řádek nepropustí. Databáze nehlásí chybu, jen tiše vrátí prázdný výsledek. `IS NULL` se ptá přímo na to, jestli hodnota chybí.
:::

Tahle past má dvojče: `rating != 8.4` nevrátí filmy bez hodnocení, protože i `NULL != 8.4`
je „nevím".

:::check
Tabulka `customers` má sloupec `phone TEXT`. Napiš podmínku za `WHERE`, která najde zákazníky, kteří telefon **vyplnili**.

### --expected--
phone IS NOT NULL

### --accept--
NOT phone IS NULL
phone NOTNULL

### --why--
`phone != NULL` by nevrátilo nic, protože porovnání s `NULL` nikdy není pravda.
Na přítomnost hodnoty se ptáš `IS NOT NULL`.
:::

## SQLite a PostgreSQL

V sekci budeš pracovat se dvěma databázemi. Jazyk SQL mají společný, liší se tím, jak
běží.

| | SQLite | PostgreSQL |
|---|---|---|
| kde běží | knihovna uvnitř tvého procesu, data v jednom souboru | samostatný server, aplikace se připojuje po síti |
| instalace | nic, v Node je `node:sqlite` | server (v sekci přes Docker) |
| souběžné zápisy | jeden zápis v jednu chvíli | mnoho zápisů najednou |
| typy | shovívavé, přísné s `STRICT` | přísné vždycky |
| kdy ho zvolit | lokální aplikace, testy, menší weby, prototypy | web s více servery, víc uživatelů zapisujících naráz |

SQLite není hračka: běží v každém telefonu i prohlížeči a zvládne weby se statisíci
návštěv. Na PostgreSQL přejdeš, když potřebuješ víc aplikačních serverů nad jednou
databází nebo hodně souběžných zápisů.

:::check
Aplikace poběží na třech serverech za load balancerem a všechny budou zapisovat objednávky do stejné databáze. Kterou z těch dvou zvolíš?

### --expected-- ignore-case
PostgreSQL

### --accept--
Postgres
postgre

### --why--
SQLite je soubor na disku jednoho počítače. Tři servery k němu přístup sdílet nemůžou,
k PostgreSQL se připojí všechny po síti.
:::

## `node:sqlite`: databáze v Node

Node má SQLite vestavěné v modulu `node:sqlite`. Nic neinstaluješ.

```js
import { DatabaseSync } from 'node:sqlite';

// Soubor vznikne, když neexistuje. ':memory:' = databáze jen v paměti.
const db = new DatabaseSync('shop.db');

// exec: spustí jeden nebo víc příkazů, nic nevrací
db.exec(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL
) STRICT`);

// prepare: připraví dotaz, ? jsou místa pro hodnoty
const insert = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
const result = insert.run('Hrnek s logem', 24900);
console.log(result.lastInsertRowid);

const cheap = db.prepare('SELECT name, price FROM products WHERE price < ?').all(30000);
const one = db.prepare('SELECT name FROM products WHERE id = ?').get(1);
```

| metoda připraveného dotazu | vrací | kdy |
|---|---|---|
| `.all(...hodnoty)` | pole řádků (objekty) | `SELECT` s víc výsledky |
| `.get(...hodnoty)` | první řádek, nebo `undefined` | `SELECT` jednoho záznamu |
| `.run(...hodnoty)` | `{ changes, lastInsertRowid }` | `INSERT`, `UPDATE`, `DELETE` |

Otazníky jsou [[vázaný parametr|vázané parametry]] (*bound parameters*). Hodnota nikdy
nevstoupí do textu SQL, databáze ji dostane zvlášť. Proč na tom tolik záleží, uvidíš
hned v prvním workshopu.

`DatabaseSync` je synchronní: `.all()` blokuje, dokud dotaz neskončí. U SQLite je to
v pořádku, dotaz nad souborem trvá mikrosekundy. U PostgreSQL, kde dotaz jde po síti,
se používají asynchronní klienti s `await`.

:::check
Chceš zjistit, kolik řádků smazal `DELETE FROM products WHERE price = 0`. Kterou metodu na připraveném dotazu zavoláš a kterou vlastnost výsledku přečteš? Napiš ve tvaru `metoda vlastnost`.

### --expected--
run changes

### --accept--
run().changes
.run().changes
run, changes
.run changes

### --why--
`DELETE` žádné řádky nevrací, proto `.run()`. Výsledek má `changes` = počet změněných
nebo smazaných řádků.
:::

:::explain
Vysvětli vlastními slovy, proč se pravidlo „cena musí být větší než nula" vyplatí
napsat do databáze, i když ho hlídá i aplikace.

## --model--
Kontrola v aplikaci platí jen pro tu jednu cestu, kterou data přicházejí. Do databáze
ale sahá víc věcí: druhá služba, migrační skript, import z tabulky, kolega z konzole,
budoucí verze aplikace, kterou napíše někdo jiný. Omezení v databázi platí pro
**každý** zápis bez výjimky a nedá se obejít ani omylem. Navíc je to dokumentace: kdo
otevře schéma, hned vidí, co je povinné, co jedinečné a jaké hodnoty dávají smysl —
nemusí to hledat rozházené po kódu. Kontrola v aplikaci zůstává kvůli srozumitelné
hlášce pro uživatele, ne kvůli správnosti dat.

## --checklist--
- Kontrola v aplikaci platí jen pro jednu cestu k datům.
- Do databáze sahají i skripty, jiné služby a lidé.
- Omezení v databázi platí pro každý zápis.
- Zároveň slouží jako dokumentace pravidel.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Porovnání s `NULL` přes `=`.** `WHERE rating = NULL` vrátí prázdný výsledek bez chyby.
> Oprava: `WHERE rating IS NULL`.

> [!PITFALL]
> **Text v číselném sloupci.** Bez `STRICT` uloží SQLite do `INTEGER` i `'zdarma'` a chyba
> vyleze až v JavaScriptu (`NaN` v součtu). Oprava: `STRICT` za definicí tabulky a kontrola
> vstupu na serveru.

> [!PITFALL]
> **Řádky nejsou obyčejné objekty.** `node:sqlite` vrací objekty bez prototypu, v konzoli
> jako `[Object: null prototype] { title: 'Pelíšky' }`. `assert.deepStrictEqual` s obyčejným
> objektem pak selže, i když hodnoty sedí. Oprava: v testu porovnávej `{ ...row }`, nebo jen
> vybrané hodnoty.

> [!PITFALL]
> **`CREATE TABLE` podruhé.** Druhé spuštění skriptu spadne na `table products already exists`.
> Oprava: `CREATE TABLE IF NOT EXISTS` pro jednoduché skripty. Jak schéma měnit v aplikaci,
> která už běží, řeší migrace v lekci [Návrh schématu](see:sql-databaze/navrh-schematu#migrace-zmena-schematu-bez-ztraty-dat).

> [!PITFALL]
> **Chybějící hodnota parametru.** `db.prepare('SELECT * FROM movies WHERE id = ?').all()`
> bez argumentu nehlásí chybu, parametr dostane `NULL` a dotaz vrátí prázdné pole.
> Když dotaz nic nenajde, zkontroluj nejdřív, co jsi mu poslal.

## Kde to najdeš v MDN

MDN popisuje prohlížeč a SQL v něm nenajdeš. Pro databáze máš tyhle zdroje:

- [MDN Glossary: SQL](https://developer.mozilla.org/en-US/docs/Glossary/SQL) — co SQL je, jednou stránkou.
- [Node.js: SQLite](https://nodejs.org/api/sqlite.html) — `DatabaseSync`, `prepare`, `all`, `get`, `run` a jejich volby.
- [SQLite: STRICT Tables](https://www.sqlite.org/stricttables.html) a [Datatypes](https://www.sqlite.org/datatype3.html) — proč SQLite ukládá text do čísla.
- [PostgreSQL: Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) — `NOT NULL`, `UNIQUE`, `CHECK` a klíče do hloubky.

# --questions--

## --question--

Tabulka `orders` má sloupec `note TEXT`. Kolik řádků vrátí `SELECT * FROM orders WHERE note != 'Doručit ráno'`, když má tabulka tři řádky s poznámkami `'Doručit ráno'`, `'Zazvonit dvakrát'` a `NULL`?

### --expected--
1

### --why--
Řádek s `'Doručit ráno'` podmínku nesplní. Řádek s `NULL` taky ne: `NULL != 'Doručit ráno'`
je „nevím", ne pravda. Projde jen `'Zazvonit dvakrát'`.

### --see--
sql-databaze/relacni-databaze#null-hodnota-chybi

## --question--

Kolega tvrdí: „Omezení `UNIQUE` v databázi nepotřebujeme, server přece před zápisem zkontroluje, že takový e-mail ještě není." Co mu odpovíš?

### --answer--
Má pravdu, dvojí kontrola je zbytečná a zpomaluje zápis.

#### --why--
Kontrola v kódu a zápis jsou dva kroky. Mezi nimi může jiný požadavek zapsat stejný e-mail a kód si toho nevšimne.

### --correct--
Dva požadavky můžou kontrolou projít současně a oba zapíšou. `UNIQUE` hlídá každý zápis, ať přijde odkudkoli.

#### --why--
Přesně tak. Kontrola v kódu dává hezkou chybovou hlášku, omezení v databázi je pojistka proti souběhu, importům i ručním zásahům.

### --answer--
`UNIQUE` je potřeba jen v PostgreSQL, SQLite ho ignoruje.

#### --why--
SQLite `UNIQUE` hlídá stejně přísně. Shovívavé je jen k typům sloupců.

### --see--
sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default

## --question--

Ceny v e-shopu chceš ukládat přesně. Jaký typ sloupce v SQLite zvolíš a v jaké jednotce bude cena 1 299,90 Kč? Napiš typ a číslo, např. `TEXT 42`.

### --expected--
INTEGER 129990

### --accept--
integer 129990
INTEGER, 129990

### --why--
Desetinné číslo v `REAL` má zaokrouhlovací chyby. Cena v haléřích jako celé číslo je
přesná a na koruny ji převedeš až při zobrazení.

### --see--
sql-databaze/relacni-databaze#datove-typy
