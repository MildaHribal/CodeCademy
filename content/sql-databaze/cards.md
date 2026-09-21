## --card-- free

Co v tabulce dělá primární klíč a proč se nepoužívá e-mail?

### --back--

Primární klíč jednoznačně identifikuje řádek a nesmí být prázdný ani duplicitní. E-mail
tyhle podmínky sice splňuje, ale **mění se** — a s ním by se musely měnit všechny cizí
klíče, které na řádek odkazují. Proto se používá umělý klíč (`INTEGER PRIMARY KEY`,
UUID), který nemá žádný význam kromě identity, a na e-mail se dá `UNIQUE`.

### --see--

sql-databaze/relacni-databaze#primarni-klic

## --card-- free

Vyjmenuj čtyři omezení, kterými databáze hlídá data, a co každé z nich zaručí.

### --back--

- `NOT NULL` — hodnota musí být vyplněná.
- `UNIQUE` — hodnota (nebo dvojice sloupců) se nesmí opakovat.
- `CHECK` — hodnota musí splnit podmínku (`CHECK (price > 0)`).
- `DEFAULT` — co se doplní, když hodnotu nepošleš.

Klíčové je, že **platí pro každý zápis**, i pro ten z konzole nebo z migračního skriptu.
Kontrola v aplikaci platí jen pro tu jednu aplikaci.

### --see--

sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default

## --card-- free

Proč `WHERE city = NULL` nikdy nic nenajde?

### --back--

`NULL` neznamená „prázdná hodnota", ale **„nevím"**. Porovnání s neznámou hodnotou
nemůže vyjít ani pravdivě, ani nepravdivě — výsledkem je zase `NULL`, a řádek se do
výsledku nedostane. Na chybějící hodnotu se proto ptá `IS NULL` a `IS NOT NULL`.
Stejná past je v agregacích: `COUNT(city)` nepočítá řádky s `NULL`, `COUNT(*)` ano.

### --see--

sql-databaze/relacni-databaze#null-hodnota-chybi

## --card-- free

Jak se v databázi zapisuje vztah 1:N a jak M:N?

### --back--

**1:N** (zákazník má víc objednávek): cizí klíč na straně „mnoho" — `orders.customer_id`
odkazuje na `customers.id`. Nikdy ne seznam v jednom sloupci.

**M:N** (článek má víc štítků, štítek patří víc článkům): **spojovací tabulka** se dvěma
cizími klíči — `article_tags(article_id, tag_id)` s `UNIQUE` nad tou dvojicí. Často má
i vlastní sloupce (kdy se štítek přidal, kdo ho přidal).

### --see--

sql-databaze/navrh-schematu#vztah-1-n-cizi-klic

## --card-- free

Co udělá `ON DELETE CASCADE` a kdy ho naopak nechceš?

### --back--

Smaže i řádky, které na smazaný řádek odkazují. Chceš ho tam, kde podřízený řádek bez
rodiče nedává smysl — položky objednávky bez objednávky, komentáře ke smazanému
příspěvku.

**Nechceš ho** tam, kde by tiše zmizela data, která se ještě hodí: smazáním zboží by
zmizely historické položky objednávek, a s nimi tržby. Tam se hodí výchozí chování
(databáze mazání odmítne) nebo `ON DELETE SET NULL`.

### --see--

sql-databaze/navrh-schematu#on-delete-co-se-stane-s-knihami

## --card-- free

Co je soft delete a co s ním musíš pohlídat?

### --back--

Řádek se nemaže, jen se označí (`deleted_at`, `is_deleted`). Data zůstanou pro
vyúčtování i pro obnovu. Daň za to: **každý** dotaz teď musí smazané řádky vyfiltrovat,
jinak se objeví tam, kde nemají. Proto se obvykle přidá pohled nebo se filtr zabalí do
jedné vrstvy, ne se opisuje do padesáti dotazů.

### --see--

sql-databaze/navrh-schematu#soft-delete-smazat-ale-nechat

## --card-- output

Co vypíše tenhle kód?

```js
const objednavky = [
  { id: 1, stav: 'zaplacena', castka: 1200 },
  { id: 2, stav: 'zrusena', castka: 900 },
  { id: 3, stav: 'zaplacena', castka: 400 },
];
const trzby = objednavky
  .filter((o) => o.stav === 'zaplacena')
  .reduce((soucet, o) => soucet + o.castka, 0);
console.log(trzby);
```

### --expected--

1600

### --why--

Tenhle výpočet v JavaScriptu odpovídá `SELECT SUM(castka) FROM objednavky WHERE stav = 'zaplacena'`.
Rozdíl je v tom, že databáze nemusí poslat po síti všechny řádky — filtruje a sčítá
u sebe.

### --see--

sql-databaze/relacni-databaze#tabulka-radek-sloupec

## --card-- free

Kdy `JOIN` znásobí řádky a jak se to pozná?

### --back--

Vždycky, když se přidává tabulka ve vztahu 1:N. Objednávka se třemi položkami je po
spojení s `order_items` **třikrát**. Na součtu cen to nevadí, ale `COUNT(orders.id)`
napočítá tři objednávky místo jedné a `SUM` na sloupci z objednávky sečte tutéž částku
třikrát.

Poznáš to tak, že čísla vyjdou **vyšší**, než dávají smysl. Řešení: `COUNT(DISTINCT …)`,
nebo agregovat v poddotazu dřív, než se tabulky spojí.

### --see--

sql-databaze/navrh-schematu#vztah-1-n-cizi-klic

## --card-- free

Kdy `LEFT JOIN` a kdy obyčejný `JOIN`?

### --back--

`JOIN` (vnitřní) vrátí jen řádky, které mají protějšek. `LEFT JOIN` vrátí i ty bez
protějšku a doplní `NULL`.

Pravidlo: když se ptáš „za **každého** zákazníka, i když nic nekoupil", musí to být
`LEFT JOIN` — a sloupce z pravé tabulky pak obalit `COALESCE(…, 0)`. Častá past:
podmínka na pravou tabulku napsaná ve `WHERE` z `LEFT JOIN` udělá zase vnitřní, protože
`NULL` podmínkou neprojde. Patří do `ON`.

### --see--

sql-databaze/navrh-schematu#vztah-1-n-cizi-klic

## --card-- free

K čemu je `GROUP BY` a co smí být ve `SELECT` vedle agregace?

### --back--

`GROUP BY` sloučí řádky se stejnou hodnotou do jednoho a agregační funkce (`COUNT`,
`SUM`, `AVG`, `MIN`, `MAX`) pak počítají uvnitř skupiny. Ve `SELECT` smí být jen sloupce,
podle kterých se seskupuje, a agregace — u ostatních by nebylo jasné, který z řádků
skupiny vybrat.

Filtr **před** seskupením je `WHERE`, filtr **nad výsledkem** agregace je `HAVING`.

### --see--

sql-databaze/okenni-funkce#over-agregace-ktera-nesbali-radky

## --card-- free

Co je transakce a co zaručuje?

### --back--

Skupina příkazů, která proběhne **celá, nebo vůbec**: `BEGIN`, pak změny, a nakonec
`COMMIT` (potvrdit), nebo `ROLLBACK` (vzít zpět). Typický případ: odečíst zboží ze
skladu a založit objednávku — když druhý krok spadne, nesmí zůstat odečtený sklad.

Kromě atomicity zaručuje i to, že ostatní připojení mezitím nevidí polorozdělanou
změnu.

### --see--

sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback

## --card-- code js

Doplň funkci tak, aby převod peněz mezi účty proběhl celý, nebo vůbec. Databáze je
připravená v proměnné `db` a má `db.exec` i `db.prepare`.

### --seed--

```js
function prevod(db, zUctu, naUcet, castka) {
  db.prepare('UPDATE ucty SET zustatek = zustatek - ? WHERE id = ?').run(castka, zUctu);
  db.prepare('UPDATE ucty SET zustatek = zustatek + ? WHERE id = ?').run(castka, naUcet);
}
```

### --test--

```js
const log = [];
const db = {
  exec: (sql) => log.push(sql),
  prepare: () => ({ run: (castka) => { if (castka > 1000) throw new Error('nedostatek'); log.push('UPDATE'); } }),
};

prevod(db, 1, 2, 500);
assert.deepEqual(log, ['BEGIN', 'UPDATE', 'UPDATE', 'COMMIT'], 'Úspěšný převod má proběhnout v transakci a skončit COMMITem');

log.length = 0;
assert.throws(() => prevod(db, 1, 2, 5000), 'Chyba se má vyhodit dál, ne spolknout');
assert.deepEqual(log, ['BEGIN', 'ROLLBACK'], 'Po chybě má přijít ROLLBACK, ne COMMIT');
```

### --solution--

```js
function prevod(db, zUctu, naUcet, castka) {
  db.exec('BEGIN');
  try {
    db.prepare('UPDATE ucty SET zustatek = zustatek - ? WHERE id = ?').run(castka, zUctu);
    db.prepare('UPDATE ucty SET zustatek = zustatek + ? WHERE id = ?').run(castka, naUcet);
    db.exec('COMMIT');
  } catch (chyba) {
    db.exec('ROLLBACK');
    throw chyba;
  }
}
```

### --see--

sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback

## --card-- free

Co index zrychlí, co zpomalí a kdy se nepoužije vůbec?

### --back--

**Zrychlí** hledání, řazení a spojování podle sloupců, které obsahuje — místo průchodu
celou tabulkou se jde stromem. **Zpomalí** zápis: každý `INSERT`, `UPDATE` a `DELETE`
musí index udržet, a index zabírá místo.

**Nepoužije se**, když na indexovaný sloupec sáhne funkce (`WHERE lower(email) = …`),
když se hledá `LIKE '%text'` (bez pevného začátku), nebo když by průchod tabulkou byl
stejně rychlejší, protože vyhovuje většina řádků.

### --see--

sql-databaze/transakce-a-indexy#index-co-umi-a-co-stoji

## --card-- free

Co je problém N+1 a jak se pozná?

### --back--

Jeden dotaz vytáhne N řádků a pak se pro každý z nich pošle další dotaz — celkem N+1
dotazů místo jednoho. Typicky: načtu sto článků a pro každý zvlášť jeho autora.

Pozná se v logu dotazů (stejný `SELECT` stokrát za sebou, jen s jiným `id`) nebo podle
toho, že stránka zpomaluje úměrně počtu položek. Řešení: jeden dotaz s `JOIN`, nebo
jeden dotaz s `WHERE id IN (…)` a spárování v aplikaci.

### --see--

sql-databaze/transakce-a-indexy#problem-n-1

## --card-- css

Jak se zeptáš databáze, jak provede dotaz, místo abys ho spouštěl? Napiš začátek příkazu.

### --expected--

EXPLAIN QUERY PLAN

### --accept--

explain query plan
EXPLAIN

### --why--

Plán ukáže, jestli se jde indexem (`SEARCH … USING INDEX`), nebo se čte celá tabulka
(`SCAN`). V PostgreSQL je to `EXPLAIN ANALYZE`, které dotaz i skutečně změří.

### --see--

sql-databaze/transakce-a-indexy#proc-je-dotaz-pomaly-plan-dotazu

## --card-- free

Čím se okenní funkce liší od `GROUP BY`?

### --back--

`GROUP BY` řádky **sloučí** — ze sta objednávek zbude pět skupin. Okenní funkce
(`SUM(...) OVER (...)`) počítá to samé, ale **řádky nechá být**: ke každé objednávce
přidá sloupec s celkovým součtem, pořadím nebo hodnotou ze sousedního řádku.

Použiješ ji, kdykoli potřebuješ detail **i** souhrn v jednom výsledku: pořadí v žebříčku,
podíl na celku, rozdíl proti minulému měsíci.

### --see--

sql-databaze/okenni-funkce#over-agregace-ktera-nesbali-radky

## --card-- free

Jaký je rozdíl mezi `ROW_NUMBER`, `RANK` a `DENSE_RANK`?

### --back--

Při shodě hodnot:

- `ROW_NUMBER` — 1, 2, 3, 4 (nikdy se neopakuje, shodu rozhodne řazení).
- `RANK` — 1, 2, 2, 4 (shoda dostane stejné číslo, další se přeskočí).
- `DENSE_RANK` — 1, 2, 2, 3 (shoda stejné číslo, nic se nepřeskakuje).

Na „vyber z každé skupiny jeden nejlepší řádek" se hodí `ROW_NUMBER` s `PARTITION BY`
a pak `WHERE poradi = 1`.

### --see--

sql-databaze/okenni-funkce#poradi-rownumber-rank-a-denserank

## --card-- free

Proč nejde napsat `WHERE ROW_NUMBER() OVER (...) = 1`?

### --back--

Protože `WHERE` se vyhodnocuje **dřív**, než se okenní funkce počítají — v tu chvíli
ještě žádné pořadí neexistuje. Okna se počítají až nad řádky, které `WHERE` a `GROUP BY`
propustily.

Řešení je obalit dotaz: okenní funkci spočítat v poddotazu nebo v `WITH` a filtrovat
až nad ním.

### --see--

sql-databaze/okenni-funkce#kde-okno-pouzit-nejde

## --card-- free

Co dělá vázaný parametr `?` a proč je to víc než pohodlí?

### --back--

Hodnota se do dotazu **nevkládá jako text** — databáze dostane zvlášť dotaz a zvlášť
hodnoty, takže s nimi nikdy nezachází jako s kódem. Tím padá celá třída zranitelností
SQL injection.

Druhý důvod je výkon: stejný dotaz s různými hodnotami se připraví jednou a pak už se
jen vykonává. Skládání řetězcem tuhle možnost zahazuje.

### --see--

sql-databaze/relacni-databaze#node-sqlite-databaze-v-node

## --card-- free

Co ORM umí a co od něj nečekat?

### --back--

**Umí:** typované schéma na jednom místě, generované migrace, dotazy s našeptáváním
a bez překlepů ve jménech sloupců, pohodlné mapování na objekty.

**Nečekej:** že tě zbaví znalosti SQL. Složité agregace, okenní funkce a ladění
pomalých dotazů se dělají v SQL tak jako tak, a bez porozumění vygenerovanému dotazu
snadno spadneš do N+1. ORM je pohodlí nad SQL, ne náhrada za něj.

### --see--

sql-databaze/orm-drizzle#co-orm-je-a-co-neni

## --card-- free

Co je potřeba změnit, když aplikace přechází ze SQLite na PostgreSQL?

### --back--

- **Typy:** SQLite je volnější, Postgres trvá na svém (`INTEGER` vs. `BIGINT`, `TEXT`,
  `TIMESTAMPTZ`, `BOOLEAN` místo 0/1).
- **Automatický klíč:** `INTEGER PRIMARY KEY` → `GENERATED ALWAYS AS IDENTITY`.
- **Připojení:** místo souboru connection string, `.env` a fond spojení.
- **Parametry:** `?` → `$1`, `$2`.
- **Funkce:** `substr`, práce s datem a `||` se místy liší.

A hlavně: databáze teď běží jako **služba**, takže přibývá provoz — zálohy, přístupy,
migrace při nasazení.

### --see--

sql-databaze/postgres-v-dockeru#co-se-v-sql-zmeni

## --card-- free

Proč se cizí klíče v SQLite musí zapnout a co se stane, když na to zapomeneš?

### --back--

Kvůli zpětné kompatibilitě je `PRAGMA foreign_keys` **vypnuté** a nastavuje se pro
každé připojení zvlášť. Bez něj SQLite cizí klíče uloží do schématu, ale nehlídá je:
objednávka neexistujícího zákazníka projde a `ON DELETE CASCADE` neudělá nic.

Je to zákeřné v tom, že se nic neohlásí — nekonzistence se objeví až později v datech.

### --see--

sql-databaze/relacni-databaze#node-sqlite-databaze-v-node
