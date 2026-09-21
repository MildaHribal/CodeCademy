# ORM: Drizzle

:::check pretest
V datové vrstvě přejmenuješ sloupec `published_at` na `published`. Dotazy jsou psané jako řetězce: `db.prepare('SELECT title, published_at FROM articles').all()`. Kdy se o chybě dozvíš?

### --answer--
Hned při uložení souboru — editor podtrhne neexistující sloupec.

#### --why--
Editor vidí jen řetězec. Co je v něm napsané, pro něj nemá význam: nezná tabulky ani sloupce tvojí databáze.

### --correct--
Až za běhu, když ten konkrétní dotaz někdo vyvolá.

### --answer--
Nikdy, SQLite chybějící sloupec ve výsledku doplní jako `NULL`.

#### --why--
Neexistující sloupec je chyba dotazu: `no such column: published_at`. `NULL` se doplňuje jen tam, kde sloupec existuje a hodnotu nemá.
:::

Dotazy jako řetězce fungují, ale neodpustí nic. Překlep v názvu sloupce, přejmenování
tabulky nebo změna typu se projeví až za běhu, a to jen na těch místech, kam se
uživatel proklikne. Výsledek dotazu je navíc pro editor `any` — nenašeptá ti nic
a nezkontroluje nic.

[[ORM]] tenhle problém řeší tím, že o tabulkách ví. V této lekci použiješ
**Drizzle**, protože zůstává blízko SQL a jeho dotazy jde přečíst jako SQL.

> [!REMEMBER]
> **Drizzle není náhrada SQL, ale jeho zápis v JavaScriptu.** Každému dotazu se dá
> nechat vypsat SQL, který z něj vznikne — a když se ti nelíbí, napíšeš si ho ručně.

## Problém: SQL jako text

Takhle vypadá datová vrstva psaná ručně a takhle táž vrstva v Drizzle:

:::compare
```html
<div class="karta">
  <h2 id="nadpis"></h2>
  <pre id="kod"></pre>
  <ul id="body"></ul>
</div>
```
```css
body { margin: 0; font: 15px/1.5 system-ui, sans-serif; color: #1f2430; background: #f6f7fb; }
.karta { padding: 1rem 1.1rem; }
h2 { margin: 0 0 .6rem; font-size: 1rem; }
pre { margin: 0; padding: .7rem .8rem; border-radius: .5rem; background: #0f172a; color: #e2e8f0; font: 12.5px/1.6 ui-monospace, monospace; white-space: pre-wrap; }
ul { margin: .8rem 0 0; padding-left: 1.1rem; }
li { margin: .2rem 0; font-size: 13.5px; }
```
```js
function ukaz({ nadpis, kod, body }) {
  document.getElementById('nadpis').textContent = nadpis;
  document.getElementById('kod').textContent = kod;
  document.getElementById('body').innerHTML = body.map((text) => '<li>' + text + '</li>').join('');
}
```
--variant-- Ručně psané SQL
```js
ukaz({
  nadpis: 'node:sqlite a řetězec',
  kod: "const rows = db.prepare(`\n  SELECT id, title, published_at\n    FROM articles\n   WHERE author_id = ?\n   ORDER BY published_at DESC\n`).all(authorId);",
  body: [
    'Překlep ve jménu sloupce se pozná až za běhu.',
    '<code>rows</code> je pro editor <code>any</code> — žádné našeptávání.',
    'Skládání podmínek podle filtrů končí lepením řetězců.',
    'Zato je hned vidět, jaký dotaz poletí do databáze.',
  ],
});
```
--variant-- Drizzle
```js
ukaz({
  nadpis: 'Týž dotaz přes schéma',
  kod: "const rows = await db\n  .select()\n  .from(articles)\n  .where(eq(articles.authorId, authorId))\n  .orderBy(desc(articles.publishedAt));",
  body: [
    'Neexistující sloupec editor podtrhne rovnou.',
    '<code>rows</code> má typ odvozený ze schématu.',
    'Podmínky se skládají jako hodnoty, ne jako text.',
    'Výsledné SQL vidíš přes <code>.toSQL()</code>.',
  ],
});
```
:::

:::check
Proč editor u ručně psaného dotazu nepozná překlep ve jménu sloupce? Odpověz jednou krátkou větou.

### --expected-- ignore-case
je to řetězec

### --accept--
protože je to jen řetězec
dotaz je obyčejný text
editor vidí jen text

### --why--
Uvnitř uvozovek je pro editor obyčejný text. Význam mu dá až databáze, a ta ho uvidí
za běhu.
:::

## Co ORM je a co není

Zkratka **ORM** znamená *object–relational mapping*: převod mezi řádky tabulky a objekty
v jazyce. Nástroje se liší v tom, jak daleko od SQL tě odvedou:

| přístup | příklad | co z toho plyne |
|---|---|---|
| ruční SQL | `node:sqlite`, `pg` | plná moc, žádná kontrola |
| [[dotazovací builder]] | **Drizzle**, Kysely | zápis blízký SQL, typy ze schématu |
| plné ORM | Prisma, TypeORM | vlastní jazyk dotazů, dál od SQL |

Drizzle je uprostřed a to je pro učení dobře: kdo umí SQL, píše v Drizzle hned, a kdo
se SQL teprve učí, vidí u každého dotazu, co z něj vzniklo.

> [!NOTE]
> Drizzle je tu jako zástupce celé skupiny. Prisma i Kysely dělají totéž jinými slovy;
> to, co se naučíš — schéma jako kód, skládání podmínek, generované migrace — platí
> ve všech.

:::check
Který z těch tří přístupů tě nechá napsat `WHERE published_at IS NULL` doslova tak, jak to zná SQL?

### --expected-- ignore-case
ruční SQL

### --accept--
ručně psané SQL
ruční sql

### --why--
Builder i ORM mají pro `IS NULL` vlastní zápis (v Drizzle `isNull(articles.publishedAt)`).
Doslovný SQL text napíšeš jen tam, kde dotaz skládáš sám.
:::

## Schéma jako kód

Schéma se v Drizzle popíše jednou a slouží dvěma věcem najednou: vyrobí z něj migrace
a odvodí typy dotazů.

```js
// 1. Popiš tabulky tak, jak vypadají v databázi.
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const authors = sqliteTable('authors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id').notNull().references(() => authors.id),
  title: text('title').notNull(),
  publishedAt: text('published_at'),
  views: integer('views').notNull().default(0),
});
```

Dvě jména u každého sloupce nejsou omyl. Vlevo je jméno v JavaScriptu (`publishedAt`),
v závorce jméno v databázi (`published_at`) — každý svět si nechá svůj zvyk a Drizzle
mezi nimi překládá. `references(() => authors.id)` je [[cizí klíč]]; funkce je tam kvůli
tabulkám, které na sebe odkazují navzájem.

```js
// 2. Připoj se k databázi. Tady přes vestavěné node:sqlite.
import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/sqlite-proxy';

const sqlite = new DatabaseSync('data/blog.db');
export const db = drizzle(async (query, params, method) => {
  const stmt = sqlite.prepare(query);
  if (method === 'run') { stmt.run(...params); return { rows: [] }; }
  const rows = stmt.all(...params).map((row) => Object.values(row));
  return { rows: method === 'get' ? rows[0] : rows };
});
```

:::check
Sloupec je zapsaný jako `publishedAt: text('published_at')`. Jaké jméno použiješ v dotazu v JavaScriptu?

### --expected--
publishedAt

### --why--
V JavaScriptu platí jméno vlevo, v databázi to v závorce. Druhý tvar uvidíš jen ve
vygenerovaném SQL.
:::

## Dotazy: select, insert, update, delete

Dotaz se skládá metodami v pořadí, v jakém bys psal SQL:

```js
import { eq, and, gte, desc } from 'drizzle-orm';

// SELECT s podmínkou
const moje = await db.select().from(articles)
  .where(and(eq(articles.authorId, 1), gte(articles.views, 1000)));

// Jen některé sloupce a stránkování
const strana = await db.select({ id: articles.id, title: articles.title })
  .from(articles).orderBy(desc(articles.views)).limit(10).offset(20);

// INSERT, UPDATE, DELETE
await db.insert(articles).values({ authorId: 2, title: 'Zimní údržba' });
await db.update(articles).set({ views: 100 }).where(eq(articles.id, 3));
await db.delete(articles).where(eq(articles.id, 3));
```

Porovnávací funkce (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `like`, `inArray`, `isNull`)
se importují z `drizzle-orm` a spojují přes `and` a `or`. Protože jsou to obyčejné
hodnoty, jde podmínky **skládat podle filtrů**, aniž bys lepil text:

```js
const podminky = [];
if (filtr.autor) podminky.push(eq(articles.authorId, filtr.autor));
if (filtr.odHodnoceni) podminky.push(gte(articles.views, filtr.odHodnoceni));
const rows = await db.select().from(articles).where(and(...podminky));
```

> [!PITFALL]
> **`where` se dá zavolat jen jednou.** Druhé volání to první přepíše, nespojí.
> Podmínky proto sbírej do pole a spoj je `and(...)` — přesně jako v ukázce.

:::check
Napiš podmínku, která v Drizzle odpovídá SQL `WHERE views >= 500`. Sloupec je `articles.views`. Stačí samotné volání funkce.

### --expected--
gte(articles.views, 500)

### --why--
`gte` je *greater than or equal*. Menší nebo rovno je `lte`, ostré porovnání `gt` a `lt`.

### --see--
sql-databaze/orm-drizzle#dotazy-select-insert-update-delete
:::

## JOIN, agregace a vygenerované SQL

`JOIN` i `GROUP BY` mají svoje metody a výsledný tvar si vybereš objektem v `select`:

```js
import { count, eq } from 'drizzle-orm';

const prehled = await db
  .select({ jmeno: authors.name, pocet: count(articles.id) })
  .from(authors)
  .leftJoin(articles, eq(articles.authorId, authors.id))
  .groupBy(authors.id);
// → [{ jmeno: 'Petra Nováková', pocet: 2 }, { jmeno: 'Tomáš Dvořák', pocet: 1 }]
```

Nejužitečnější metoda celého Drizzle se ale jmenuje `toSQL()`. Nespustí nic, jen ukáže
dotaz a parametry — a je to první místo, kam se podívat, když výsledek nesedí:

:::live node predict
```js
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { eq } from 'drizzle-orm';

const db = drizzle(async () => ({ rows: [] }));
const articles = sqliteTable('articles', {
  id: integer('id').primaryKey(),
  authorId: integer('author_id').notNull(),
  title: text('title').notNull(),
  publishedAt: text('published_at'),
  views: integer('views').notNull().default(0),
});

const { sql, params } = db.select().from(articles).where(eq(articles.authorId, 7)).toSQL();
console.log(sql);
console.log(params);
```
--question-- Co vypíše `console.log(params)` — a bude v prvním řádku číslo 7?
--output--
```text
select "id", "author_id", "title", "published_at", "views" from "articles" where "articles"."author_id" = ?
[ 7 ]
```
--why-- Sedmička v SQL není. Drizzle skládá dotaz s otazníkem a hodnotu předává odděleně jako vázaný parametr — stejně, jako bys to psal ručně. Ochranu před SQL injection tedy dostaneš i tady, a to i když hodnota přijde z adresy nebo z formuláře.
:::

:::check
Co udělá `toSQL()` s databází?

### --answer--
Spustí dotaz a vrátí text SQL i výsledek.

#### --why--
Kdyby dotaz spouštěl, nešel by použít k nahlédnutí před spuštěním — a přesně na to je.

### --correct--
Nic. Jen vrátí text dotazu a pole parametrů.

### --answer--
Uloží dotaz do souboru migrace.

#### --why--
Migrace vyrábí samostatný nástroj drizzle-kit ze schématu, ne z jednotlivých dotazů.
:::

## Migrace generované ze schématu

Schéma je zdroj pravdy, takže [[migrace]] se z něj dají vygenerovat. Slouží k tomu
nástroj `drizzle-kit` a konfigurace v kořeni projektu:

```js
// drizzle.config.js
export default {
  schema: './src/schema.js',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: 'data/blog.db' },
};
```

Postup má dva kroky a mezi nimi jeden důležitý zvyk:

```bash
npx drizzle-kit generate   # porovná schéma s předchozím stavem a vyrobí SQL soubor
npx drizzle-kit migrate    # pustí nepoužité soubory na databázi
```

Mezi těmi dvěma příkazy si **vygenerované SQL přečti**. Generátor neví, co s daty
zamýšlíš: přejmenování sloupce často vyrobí jako „zahoď starý, přidej nový", což je
`DROP COLUMN` a ztráta dat. Soubor je obyčejné SQL a jde upravit.

> [!TIP]
> Vygenerované migrace patří do gitu a nikdy se nemění zpětně. Jakmile migrace jednou
> proběhla na jiném stroji, oprava se dělá **další** migrací.

:::check
Migrace už proběhla na produkčním serveru a zjistíš v ní chybu. Upravíš ten soubor, nebo přidáš nový?

### --expected-- ignore-case
přidám nový

### --accept--
nový
přidám další migraci
novou migraci

### --why--
Databáze si pamatuje, které migrace už proběhly, a znovu je nepustí. Změna starého
souboru by se na produkci nikdy neprojevila a vývoj by se s ní rozešel.
:::

## Kdy psát SQL ručně

Builder pokrývá běžné dotazy. Jakmile jdeš dál, sáhneš po šabloně `sql` — a to není
prohra, je to plánovaná cesta ven:

```js
import { sql } from 'drizzle-orm';

const zebricek = await db
  .select({
    title: articles.title,
    poradi: sql`RANK() OVER (PARTITION BY ${articles.authorId} ORDER BY ${articles.views} DESC)`.as('poradi'),
  })
  .from(articles);
```

Hodnoty vložené do šablony přes `${}` se pořád posílají jako vázané parametry a jména
sloupců se doplní správně i s uvozovkami. Ručně napsaný dotaz se vyplatí u
[[okenní funkce|okenních funkcí]], složitých sestav, hromadných `UPDATE` a všude, kde
ti plán dotazu ukázal něco, co builder neumí obejít.

> [!PITFALL]
> **`avg()` a `sum()` vracejí v Drizzle řetězec, ne číslo.** Je to obrana proti velkým
> číslům, ale `prumer.toFixed(1)` na tom spadne. Oprava: `Number(row.prumer)`, nebo
> počítej průměr až v aplikaci.

:::check
Řádek z dotazu s `avg(articles.views)` má v poli `prumer` hodnotu `'920'`. Proč na něm spadne `prumer.toFixed(1)`?

### --expected-- ignore-case
je to řetězec

### --accept--
protože je to řetězec
vrací se jako text
je to text, ne číslo

### --why--
Drizzle vrací `avg()` i `sum()` jako řetězec, aby se u velkých čísel nic neztratilo.
Před počítáním ho převeď přes `Number(...)`.
:::

:::explain
Kdy se ti Drizzle vrátí a kdy tě naopak začne brzdit? Odpověz na obojí.

## --model--
Vrátí se všude, kde je dotazů hodně a jsou si podobné: našeptávání a typy ze schématu
zachytí překlep i důsledek přejmenování ještě před spuštěním, podmínky se dají skládat
podle filtrů bez lepení textu a migrace vzniknou ze schématu samy. Brzdit začne, jakmile
dotaz přeroste běžný tvar — okenní funkce, poddotazy, sestavy, hromadné změny. Tam se
zápis v builderu čte hůř než SQL a hledá se dlouho, jak se to v něm vlastně píše.
Praktický postup je psát běžné dotazy v builderu, zbytek v šabloně `sql` a u každého
pomalého dotazu se podívat přes `toSQL()`, co se opravdu posílá.

## --checklist--
- Typy a našeptávání ze schématu odhalí chyby dřív než běh programu.
- Podmínky se skládají jako hodnoty, takže filtry nevedou na lepení řetězců.
- U složitých dotazů je builder nečitelnější než SQL — na to je šablona `sql`.
- `toSQL()` ukáže, co se do databáze doopravdy posílá.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Zapomenuté `await`.** Dotaz Drizzle je „thenable": bez `await` dostaneš objekt
> dotazu, ne řádky. Příznak je `rows.map is not a function`, nebo `undefined` ve výpisu.

> [!PITFALL]
> **`update` a `delete` bez `where`.** Zapomenutá podmínka změní nebo smaže **celou
> tabulku** a Drizzle tě nezastaví. Než takový příkaz pustíš, ověř si ho přes `toSQL()`.

> [!PITFALL]
> **Schéma se rozešlo s databází.** Drizzle věří tomu, co je v kódu. Když jsi sloupec
> přidal jen do schématu a migraci nepustil, dotaz spadne na `no such column`. Oprava:
> `npx drizzle-kit migrate` — a ve vývoji ji pouštěj při každém startu.

> [!PITFALL]
> **N+1 schovaný za hezký zápis.** Cyklus, který pro každý článek volá `db.select()`
> na autora, pošle tolik dotazů, kolik je článků. Oprava je stejná jako u ručního SQL:
> jeden `leftJoin`, nebo jeden dotaz s `inArray(authors.id, ids)`.

:::check
Kód volá `db.update(articles).set({ views: 0 })` bez `where`. Kolik řádků se změní, když má tabulka 4 000 článků?

### --expected--
4000

### --why--
`UPDATE` bez `WHERE` platí pro všechny řádky. Drizzle ani SQL na to neupozorní — proto
se hodí zvyk pustit si nejdřív `toSQL()`.
:::

## Kde to najdeš v MDN

MDN o databázích nepíše; tohle téma má vlastní dokumentaci:

- [Drizzle ORM: Overview](https://orm.drizzle.team/docs/overview) — schéma, dotazy, dialekty.
- [Drizzle: Select](https://orm.drizzle.team/docs/select) a [Operators](https://orm.drizzle.team/docs/operators) — všechny metody a porovnávací funkce.
- [Drizzle Kit: generate a migrate](https://orm.drizzle.team/docs/drizzle-kit-generate) — generované migrace krok za krokem.
- [Node.js: SQLite](https://nodejs.org/api/sqlite.html) — vestavěný ovladač, přes který Drizzle v téhle lekci mluví s databází.

# --questions--

## --question--

Sloupec je ve schématu zapsaný jako `createdAt: text('created_at')`. Jaké jméno se objeví ve vygenerovaném SQL?

### --expected--
created_at

### --why--
Jméno v závorce je jméno v databázi. To vlevo platí jen v JavaScriptu.

### --see--
sql-databaze/orm-drizzle#schema-jako-kod

## --question--

Funkce dostane nepovinný filtr autora a nepovinnou minimální návštěvnost. Jak podmínky poskládáš?

### --answer--
Zavolám `.where()` dvakrát za sebou, pokaždé s jednou podmínkou.

#### --why--
Druhé volání `where` to první přepíše. Z dotazu by zbyla jen poslední podmínka.

### --correct--
Podmínky nasbírám do pole a předám je jako `.where(and(...podminky))`.

#### --why--
Podmínky jsou obyčejné hodnoty, takže se dají skládat do pole a spojit `and` až nakonec.

### --answer--
Poskládám text `WHERE` podle filtrů a vložím ho do `sql.raw(...)`.

#### --why--
Tím se vracíš k lepení řetězců včetně rizika SQL injection — a právě proto porovnávací funkce existují.

### --see--
sql-databaze/orm-drizzle#dotazy-select-insert-update-delete

## --question--

Kterou metodou si necháš vypsat SQL, který z dotazu vznikne, aniž bys dotaz spustil?

### --expected--
toSQL()

### --accept--
toSQL
.toSQL()

### --why--
`toSQL()` vrátí objekt `{ sql, params }`. Je to nejrychlejší způsob, jak zjistit, jestli
se do databáze posílá to, co sis myslel.

### --see--
sql-databaze/orm-drizzle#join-agregace-a-vygenerovane-sql

## --question--

Proč ani v Drizzle nehrozí SQL injection, i když hodnota přijde z adresy?

### --answer--
Protože Drizzle hodnoty před vložením do dotazu escapuje uvozovkami.

#### --why--
Escapování je slabší obrana a Drizzle ho nepoužívá. Hodnota se do textu dotazu vůbec nedostane.

### --correct--
Protože do textu dotazu jde otazník a hodnota se posílá odděleně jako vázaný parametr.

#### --why--
Databáze dostane dotaz a hodnoty zvlášť, takže hodnotu nikdy nevyhodnotí jako SQL.

### --answer--
Protože se dotazy Drizzle spouštějí jen pro čtení.

#### --why--
Drizzle běžně zapisuje — `insert`, `update` i `delete`.

### --see--
sql-databaze/orm-drizzle#join-agregace-a-vygenerovane-sql

## --question--

**Opakování z dřívějška.** Server dostane z formuláře tělo požadavku a chce z něj vyrobit řádek do databáze. Proč nestačí, že máš na ten tvar napsaný typ v TypeScriptu?

### --answer--
Stačí. Typ popisuje tvar dat a TypeScript ho ohlídá.

#### --why--
TypeScript kontroluje jen při překladu. Tělo požadavku přijde za běhu a o typech nic neví.

### --correct--
Typy zmizí při překladu, takže data z požadavku musí zkontrolovat schéma za běhu — třeba Zod.

#### --why--
Přesně tak. Typ je slib o kódu, validace je kontrola dat na hranici aplikace.

### --answer--
Protože databáze si data zkontroluje sama přes `NOT NULL` a `CHECK`.

#### --why--
Omezení schématu jsou poslední pojistka, ale chybovou hlášku z nich uživateli neukážeš — a spadne až zápis.

### --see--
nastroje-typescript/validace-na-hranici#proc-typescript-nestaci

## --question--

**Opakování z dřívějška.** Endpoint vrací seznam článků a klient chce jen dvacet z nich. Které dva parametry v query stringu na to REST API obvykle nabízí?

### --expected-- ignore-case
limit a offset

### --accept--
limit, offset
offset a limit

### --why--
`limit` říká kolik, `offset` odkud. V Drizzle jsou to metody `.limit(20).offset(40)`,
ve výsledném SQL `LIMIT ? OFFSET ?` — pořád totéž stránkování.

### --see--
api-http-rest/navrh-rest#strankovani-offset-a-kurzor
