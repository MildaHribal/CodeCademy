# Návrh schématu

:::check pretest
Knihkupectví má jedinou tabulku `books` se sloupci `title`, `author_name` a `author_email`. Autorka má v obchodě dvanáct knih a změní si e-mail. Kolik řádků musíš upravit?

### --answer--
Jeden, e-mail autorky je uložený jednou.

#### --why--
V téhle tabulce je e-mail autorky v každém řádku její knihy. Jedno místo by to bylo, jen kdyby autoři měli vlastní tabulku.

### --correct--
Dvanáct, e-mail je opsaný u každé její knihy.

### --answer--
Žádný, databáze e-mail změní ve všech řádcích sama.

#### --why--
Databáze neví, že dvanáct stejných textů je jedna a táž autorka. Pro ni jsou to nezávislé hodnoty.
:::

Každá aplikace, která víc než jen vypisuje seznam, má data, která na sebe odkazují:
objednávka patří zákazníkovi, kniha autorovi, recenze filmu. Jak tabulky rozdělíš, rozhodne,
jestli ti data za rok zůstanou v pořádku, nebo se v nich začnou objevovat dva různé e-maily
pro jednoho člověka.

Tabulka z pretestu vypadá pohodlně: všechno je v jednom řádku. Jenže když úprava
e-mailu doběhne jen u jedenácti knih, máš autorku se dvěma e-maily a nikdo nepozná, který
platí.

> [!REMEMBER]
> **Každá věc má vlastní tabulku a vztah mezi věcmi se zapisuje přes `id`, ne kopírováním dat.**

## Vztah 1:N: cizí klíč

Jedna autorka napsala víc knih, každá kniha má jednu autorku. To je vztah
[[vztah 1:N|1:N]] (*one-to-many*). Zapíše se tak, že tabulka na straně „N" (knihy) dostane
sloupec s `id` řádku na straně „1" (autorky):

```sql
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors (id)
) STRICT;
```

`author_id` je [[cizí klíč]] (*foreign key*). `REFERENCES authors (id)` k němu přidá
omezení: hodnota musí existovat jako `id` v tabulce `authors`. E-mail autorky je teď na
jediném místě a knihy na ni jen ukazují.

Jméno sloupce se píše `<jednotné číslo tabulky>_id` (`author_id`, `customer_id`), aby
bylo z názvu vidět, kam ukazuje.

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
  CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER REFERENCES authors (id));
  INSERT INTO authors (name) VALUES ('Alena Mornštajnová');
`);
db.prepare('INSERT INTO books (title, author_id) VALUES (?, ?)').run('Hana', 1);
db.prepare('INSERT INTO books (title, author_id) VALUES (?, ?)').run('Listopád', 7);
console.log(db.prepare('SELECT COUNT(*) AS count FROM books').get().count);
```
--question-- Autorka s `id` 7 neexistuje. Co program vypíše? Když spadne, napiš jen řádek s hláškou.
--output--
```text
Error: FOREIGN KEY constraint failed
```
--why-- Cizí klíč hlídá, že kniha ukazuje na existující autorku. Druhý zápis databáze odmítne a program na výjimce skončí dřív, než se dostane k `console.log`.
:::

> [!PITFALL]
> V `node:sqlite` jsou cizí klíče zapnuté od začátku. V příkazové řádce `sqlite3` a v řadě
> jiných knihoven pro SQLite ale **vypnuté** a `REFERENCES` se tiše ignoruje. Tam na začátku
> každého spojení spusť `PRAGMA foreign_keys = ON;`. PostgreSQL cizí klíče hlídá vždycky.

:::check
Máš tabulky `customers` a `orders`. Zákazník může mít mnoho objednávek. Do které tabulky přidáš sloupec s cizím klíčem a jak se bude jmenovat?

### --answer--
Do `customers`, sloupec `order_id`.

#### --why--
Jeden sloupec v řádku zákazníka pojme jen jedno číslo, ale zákazník má objednávek víc. Cizí klíč patří na stranu, které je „mnoho".

### --correct--
Do `orders`, sloupec `customer_id`.

### --answer--
Do obou, aby šlo hledat z obou stran.

#### --why--
Dvě kopie téhož vztahu se můžou rozejít. Z jednoho cizího klíče najdeš objednávky zákazníka i zákazníka objednávky.
:::

## Vztah M:N: spojovací tabulka

Kniha může mít víc žánrů a žánr víc knih. To je vztah [[vztah M:N|M:N]]
(*many-to-many*). Cizí klíč v jedné z tabulek nestačí, jeden sloupec pojme jen jedno `id`.
Vztah proto dostane vlastní [[spojovací tabulka|spojovací tabulku]] (*junction table*),
kde každý řádek je jedna dvojice „tahle kniha má tenhle žánr":

```sql
CREATE TABLE genres (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE book_genres (
  book_id INTEGER NOT NULL REFERENCES books (id),
  genre_id INTEGER NOT NULL REFERENCES genres (id),
  PRIMARY KEY (book_id, genre_id)
) STRICT;
```

Primární klíč ze dvou sloupců zajistí, že stejnou dvojici nezapíšeš dvakrát. Kniha _Hana_
s žánry „historický" a „psychologický" jsou v `book_genres` dva řádky.

Lákavá zkratka je sloupec `genres TEXT` s hodnotou `'historický,psychologický'`. Funguje
do první otázky: „kolik knih je v každém žánru?" nebo „přejmenuj žánr". Hledání přes
`LIKE '%román%'` pak najde i „romány pro děti" a přejmenování znamená prohledat text
v každém řádku.

:::check
Uživatelé si ukládají oblíbené restaurace. Jeden uživatel má víc oblíbených, jednu restauraci má v oblíbených víc lidí. Jaké sloupce bude mít spojovací tabulka `favorites` (bez případného data přidání)? Napiš jména oddělená čárkou.

### --expected--
user_id, restaurant_id

### --accept--
restaurant_id, user_id

### --why--
Každý řádek je jedna dvojice „tenhle uživatel má v oblíbených tuhle restauraci", takže
tabulka potřebuje dva cizí klíče. Primárním klíčem je jejich dvojice.
:::

## Normalizace srozumitelně

[[normalizace schématu|Normalizace]] (*normalization*) jsou pravidla, jak data rozdělit do
tabulek, aby se nemohla rozejít. Učebnice mají normální formy s čísly, v praxi stačí tři
otázky:

1. **Je v jedné buňce jedna hodnota?** Žádné seznamy oddělené čárkou. Seznam je spojovací
   tabulka.
2. **Je každá informace uložená jen na jednom místě?** E-mail autorky patří k autorce,
   ne ke každé knize.
3. **Neukládám něco, co jde spočítat?** Počet knih autorky zjistíš dotazem. Uložený počet
   by se musel hlídat při každém přidání a smazání.

Pravidla mají jednu důležitou výjimku: **údaj, který platil v určitou chvíli**. Objednávka
si ukládá cenu knihy v okamžiku nákupu, ne jen `book_id`. Když knihkupectví za měsíc
zdraží, stará faktura se měnit nesmí. Není to kopie, je to jiná informace — historická cena.

```sql
CREATE TABLE order_items (
  order_id INTEGER NOT NULL REFERENCES orders (id),
  book_id INTEGER NOT NULL REFERENCES books (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL,
  PRIMARY KEY (order_id, book_id)
) STRICT;
```

:::explain
Kolega tvrdí, že `unit_price` v `order_items` porušuje normalizaci, protože cena už je v tabulce `books`. Vysvětli, proč tam patří.

## --model--
Cena v `books` je aktuální cena, která se může změnit. `unit_price` je cena, za kterou zákazník
v okamžiku objednávky opravdu nakoupil. Faktury a součty starých objednávek se nesmí změnit
jen proto, že obchod zdražil. Jde tedy o jinou informaci, ne o kopii téže hodnoty.

## --checklist--
- Cena v tabulce knih je aktuální a může se změnit.
- `unit_price` zachycuje cenu v okamžiku nákupu.
- Stará objednávka se nesmí změnit se zdražením.
- Historický údaj není duplicita téže informace.
:::

:::check
V tabulce `authors` je sloupec `books_count`, který aplikace zvyšuje při přidání knihy. Které pravidlo normalizace porušuje a jak se to projeví?

### --answer--
Pravidlo „jedna hodnota v buňce", protože číslo shrnuje víc knih.

#### --why--
Číslo je jedna hodnota. Problém je v tom, odkud se bere.

### --correct--
Ukládá údaj, který jde spočítat. Když někdo smaže knihu mimo aplikaci, počet přestane sedět.

### --answer--
Žádné, uložený počet je rychlejší, a proto správně.

#### --why--
Rychlost je důvod, proč se takový sloupec někdy přidá vědomě, ale pravidlo porušuje: musíš ho hlídat při každé změně knih, jinak se rozejde se skutečností.
:::

## `ON DELETE`: co se stane s knihami

Když smažeš autorku, co s jejími knihami? Cizí klíč to umí rozhodnout za tebe. Za
`REFERENCES` připíšeš `ON DELETE` s jednou z voleb:

| volba | co se stane při smazání autorky | kdy ji použít |
|---|---|---|
| bez `ON DELETE` (`NO ACTION`) nebo `RESTRICT` | smazání selže `FOREIGN KEY constraint failed`, dokud má knihy | výchozí a nejbezpečnější: zákazník s objednávkami |
| `CASCADE` | smažou se i všechny její knihy | části, které bez rodiče nedávají smysl: položky objednávky, odpovědi v diskuzi |
| `SET NULL` | knihy zůstanou, `author_id` bude `NULL` | vztah je nepovinný: článek smazaného redaktora zůstane bez autora |

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
  CREATE TABLE books (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES authors (id) ON DELETE CASCADE
  );
  INSERT INTO authors (name) VALUES ('Alena Mornštajnová'), ('Patrik Hartl');
  INSERT INTO books (title, author_id) VALUES ('Hana', 1), ('Tiché roky', 1), ('Prvok, Šampón, Tečka a Karel', 2);
`);
db.prepare('DELETE FROM authors WHERE id = ?').run(1);
console.log(db.prepare('SELECT COUNT(*) AS count FROM books').get().count);
```
--question-- Kolik knih v tabulce zůstane?
--output--
```text
1
```
--why-- `ON DELETE CASCADE` smaže spolu s autorkou i obě její knihy. Zůstane jen kniha Patrika Hartla. Bez `CASCADE` by `DELETE` skončil chybou `FOREIGN KEY constraint failed`.
:::

`CASCADE` je pohodlné a nebezpečné zároveň: jedno smazání zákazníka může tiše odnést
objednávky, faktury a recenze. Používej ho jen tam, kde by dítě bez rodiče opravdu nemělo
smysl.

:::check
Tabulka `order_items` odkazuje na `orders`. Jakou volbu `ON DELETE` dáš cizímu klíči `order_id`? Napiš jen volbu.

### --expected-- ignore-case
CASCADE

### --why--
Položka objednávky bez objednávky nemá žádný význam. Smazání objednávky ji má odnést
s sebou.
:::

## Čas a datum

SQLite nemá typ pro datum. Čas se ukládá jako text ve formátu ISO 8601 **v UTC**
(`2026-03-01T08:30:00.000Z`). Takový text jde řadit a porovnávat jako řetězec a JavaScript
ho přečte přes `new Date(text)` bez dohadů o časovém pásmu.

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;
```

Pozor na funkci `datetime('now')`, kterou najdeš v každém návodu. Vrací čas v UTC, ale ve
tvaru `2026-03-01 08:30:00` bez písmene `Z`. JavaScript takový text přečte jako **místní** čas.

:::live node predict
```js
const createdAt = '2026-03-01 09:30:00';
console.log(new Date(createdAt).toISOString());
```
--question-- Program běží v Praze (v březnu UTC+1). Co vypíše?
--output--
```text
2026-03-01T08:30:00.000Z
```
--why-- Text bez `Z` a bez posunu bere JavaScript jako místní čas. 9:30 v Praze je 8:30 UTC. Kdyby text přišel z `datetime('now')`, znamenal 9:30 UTC, a čas objednávky by se tiše posunul o hodinu (v létě o dvě).
:::

PostgreSQL má typ `timestamptz`, který čas ukládá v UTC sám a převádí ho podle nastavení
spojení. Do sloupců, které popisují okamžik (vytvoření, zaplacení), ho používej vždycky.

:::check
Proč je `created_at` jako text `2026-03-01T08:30:00.000Z` bezpečné řadit přes `ORDER BY created_at`, i když je to jen text?

### --answer--
SQLite pozná, že jde o datum, a řadí ho jako datum.

#### --why--
SQLite typ pro datum nemá a data nerozpoznává. Řadí opravdu text, znak po znaku.

### --correct--
Části jdou od největší (rok) po nejmenší a mají pevnou délku, takže abecední pořadí je i časové.

### --answer--
Nebezpečné to je, text se vždycky řadí jinak než datum.

#### --why--
Záleží na formátu. U `1. 3. 2026` by to platilo, u ISO 8601 ne.
:::

## Soft delete: smazat, ale nechat

Někdy se řádek smazat nemá, jen schovat: uživatel chce vrátit smazaný článek, účetní
potřebuje zrušenou objednávku. Místo `DELETE` pak zapíšeš čas smazání do sloupce
`deleted_at` a řádek s vyplněným `deleted_at` bereš jako smazaný. Tomu se říká
[[soft delete]].

```sql
ALTER TABLE articles ADD COLUMN deleted_at TEXT;

UPDATE articles SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?;

SELECT id, title FROM articles WHERE deleted_at IS NULL ORDER BY title;
```

Cena za to: **každý** dotaz na „živé" řádky musí mít `deleted_at IS NULL`. Jeden
zapomenutý dotaz a smazaný článek se objeví ve vyhledávání. A `UNIQUE (email)` odmítne
registraci člověka, jehož „smazaný" účet v tabulce pořád je.

Soft delete nepoužívej na osobní údaje, o jejichž smazání člověk požádal. Tam zákon (GDPR)
chce skutečné smazání.

:::check
Blog používá soft delete. Kolega napsal dotaz na počet článků autora `SELECT COUNT(*) FROM articles WHERE author_id = ?`. Co je na něm špatně?

### --answer--
`COUNT(*)` započítá i sloupce s `NULL`, správně je `COUNT(deleted_at)`.

#### --why--
`COUNT(deleted_at)` by počítal právě smazané články. Problém není ve funkci, ale v tom, které řádky dotaz vybere.

### --correct--
Započítá i smazané články, chybí podmínka `deleted_at IS NULL`.

### --answer--
Nic, smazané řádky databáze při soft delete sama skryje.

#### --why--
Pro databázi je „smazaný" řádek obyčejný řádek s vyplněným sloupcem. Skrývat ho musí každý dotaz sám.
:::

## Migrace: změna schématu bez ztráty dat

Aplikace běží a v databázi jsou objednávky. Teď potřebuješ ke knihám přidat počet stran.
Smazat databázi a založit ji znovu nejde. Schéma se proto mění
[[migrace|migracemi]] (*migrations*): očíslovanými soubory se SQL, které se spustí každý
právě jednou a v daném pořadí.

```text
migrations/
  001-create-books.sql      CREATE TABLE books (…)
  002-add-pages.sql         ALTER TABLE books ADD COLUMN pages INTEGER;
  003-add-isbn.sql          ALTER TABLE books ADD COLUMN isbn TEXT NOT NULL DEFAULT '';
```

Databáze si pamatuje, kolik migrací už má za sebou. V SQLite na to stačí číslo
`PRAGMA user_version`, jinde tabulka `schema_migrations`. Spouštěč je pár řádků:

```js
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('shop.db');
const dir = new URL('./migrations/', import.meta.url);
const files = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();

// user_version = kolik migrací už databáze má za sebou
const { user_version: done } = db.prepare('PRAGMA user_version').get();

for (const [index, name] of files.entries()) {
  if (index < done) continue;
  db.exec('BEGIN');
  try {
    db.exec(readFileSync(new URL(name, dir), 'utf8'));
    db.exec(`PRAGMA user_version = ${index + 1}`);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
```

`BEGIN`, `COMMIT` a `ROLLBACK` zajistí, že migrace proběhne celá, nebo vůbec. Co přesně
dělají, vysvětlí jedna z pozdějších lekcí.
S ORM ti migrace vygeneruje nástroj, princip zůstává stejný.

> [!PITFALL]
> **Přidání povinného sloupce.** `ALTER TABLE books ADD COLUMN isbn TEXT NOT NULL` skončí
> chybou `Cannot add a NOT NULL column with default value NULL`. Existující knihy by měly
> v povinném sloupci prázdno. Oprava: přidej `DEFAULT ''` (nebo sloupec nejdřív nepovinný,
> doplň data a pak ho zpřísni).

:::check
Migrace `002-add-pages.sql` už proběhla na produkci. Zjistíš, že sloupec měl mít `CHECK (pages > 0)`. Co uděláš?

### --answer--
Opravím soubor `002-add-pages.sql` a spustím migrace znovu.

#### --why--
Na produkci je migrace 002 zapsaná jako hotová a znovu se nespustí. Změněný soubor by jen způsobil, že tvoje lokální databáze a produkce mají jiné schéma.

### --correct--
Napíšu novou migraci `003-…`, která změnu provede.

### --answer--
Změnu udělám ručně v produkční databázi, migrace na to nejsou potřeba.

#### --why--
Ruční změnu nezná žádné jiné prostředí: kolegova databáze, testy ani nový server. Schéma se rozejde.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Seznam v jedné buňce.** `tags TEXT` s hodnotou `'akce,novinka'` nejde spojit s jinou
> tabulkou a `LIKE '%akce%'` najde i „transakce". Oprava: spojovací tabulka.

> [!PITFALL]
> **Vypnuté cizí klíče.** Mimo `node:sqlite` projde v SQLite zápis `author_id = 99`
> k neexistující autorce bez chyby. Oprava: `PRAGMA foreign_keys = ON;` po každém
> připojení.

> [!PITFALL]
> **`ON DELETE CASCADE` všude.** Smazání testovacího zákazníka odnese objednávky, které
> účetní potřebuje. Oprava: `CASCADE` jen pro části, které bez rodiče nedávají smysl, jinak
> výchozí chování a smazání odmítnout.

> [!PITFALL]
> **Čas bez časového pásma.** Text `2026-03-01 09:30:00` přečte JavaScript jako místní čas.
> Oprava: ukládat `…T…Z` (`toISOString()` v JS, `strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`
> v SQLite), v PostgreSQL `timestamptz`.

> [!PITFALL]
> **Úprava migrace, která už proběhla.** Produkce ji znovu nespustí a schémata se rozejdou.
> Oprava: vždycky nová migrace.

## Kde to najdeš v MDN

MDN databáze nepopisuje. Dobré zdroje v angličtině:

- [SQLite: Foreign Key Support](https://www.sqlite.org/foreignkeys.html) — `REFERENCES`, `ON DELETE` a proč je potřeba `PRAGMA foreign_keys`.
- [SQLite: ALTER TABLE](https://www.sqlite.org/lang_altertable.html) — co jde změnit na existující tabulce a co ne.
- [PostgreSQL: Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK) — totéž v PostgreSQL včetně `ON DELETE SET NULL`.
- [MDN: Date.prototype.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) — formát času, který ukládej.

# --questions--

## --question--

Škola eviduje studenty a kroužky. Student chodí do víc kroužků, kroužek má víc studentů. Kolik tabulek schéma potřebuje, aby šlo zapsat, kdo chodí kam?

### --expected--
3

### --why--
Tabulka `students`, tabulka `clubs` a spojovací tabulka (třeba `club_members`) s dvojicemi
`student_id` a `club_id`. Vztah M:N se do dvou tabulek nevejde.

### --see--
sql-databaze/navrh-schematu#vztah-m-n-spojovaci-tabulka

## --question--

Diskuzní fórum má tabulky `threads` a `posts`, příspěvek patří do vlákna. Moderátor smaže vlákno. Co se má stát s jeho příspěvky a jak to zapíšeš u `posts.thread_id`? Napiš volbu za `ON DELETE`.

### --expected-- ignore-case
CASCADE

### --why--
Příspěvek bez vlákna nemá kde se zobrazit. Smazání vlákna má odnést i příspěvky, a proto
`ON DELETE CASCADE`.

### --see--
sql-databaze/navrh-schematu#on-delete-co-se-stane-s-knihami

## --question--

E-shop přidává ke zboží povinný sloupec `weight_grams INTEGER NOT NULL`, v tabulce už je 3 000 výrobků. Která migrace projde?

### --answer--
`ALTER TABLE products ADD COLUMN weight_grams INTEGER NOT NULL;`

#### --why--
Existující výrobky by měly v povinném sloupci prázdnou hodnotu. SQLite takový sloupec bez výchozí hodnoty přidat odmítne.

### --correct--
`ALTER TABLE products ADD COLUMN weight_grams INTEGER NOT NULL DEFAULT 0;`

### --answer--
Žádná, v SQLite nejde přidat sloupec do tabulky s daty.

#### --why--
`ADD COLUMN` na tabulce s daty funguje. Omezené jsou jiné změny, třeba změna typu existujícího sloupce.

### --see--
sql-databaze/navrh-schematu#migrace-zmena-schematu-bez-ztraty-dat
