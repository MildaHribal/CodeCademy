# Okenní funkce

:::check pretest
Knihkupectví má tabulku `sales` s tržbou každé pobočky za každý měsíc (12 řádků: tři pobočky × čtyři měsíce). Co vrátí `SELECT shop, SUM(amount_kc) FROM sales GROUP BY shop`?

### --answer--
Dvanáct řádků, u každého tržba jeho pobočky za všechny měsíce.

#### --why--
`GROUP BY` jednotlivé řádky sbalí. Z každé skupiny zbude přesně jeden — proto po něm nejde sáhnout na `month` jednoho měsíce.

### --correct--
Tři řádky, u každého součet za jednu pobočku.

### --answer--
Jeden řádek se součtem přes celou tabulku.

#### --why--
Bez `GROUP BY` by to byl jeden řádek. Tady je `GROUP BY shop`, takže vznikne jedna skupina na pobočku.
:::

Vedoucí knihkupectví chce sestavu, ve které je **vedle každého měsíce** i součet za
celou pobočku, podíl toho měsíce na součtu, pořadí pobočky v tom měsíci a změna proti
měsíci minulému. Každou z těch čtyř věcí bys uměl spočítat zvlášť — ale všechny najednou
a vedle původních řádků `GROUP BY` neumí, protože řádky sbaluje.

Na to jsou [[okenní funkce]] (*window functions*).

> [!REMEMBER]
> **Okenní funkce počítá z okolních řádků, ale řádek nechá být.** `GROUP BY` z deseti
> řádků udělá jeden, `OVER (…)` k deseti řádkům přidá sloupec.

## Problém: součet vedle řádku

Data jsou jednoduchá: `sales(id, shop, month, amount_kc)`, tržba v korunách za pobočku
a měsíc.

| shop | month | amount_kc |
|---|---|---|
| Brno | 2026-01 | 182 000 |
| Brno | 2026-02 | 164 000 |
| Ostrava | 2026-01 | 121 000 |
| Praha | 2026-01 | 264 000 |

Porovnej, co ze stejné tabulky udělá `GROUP BY` a co `OVER (PARTITION BY …)`:

:::compare
```html
<div class="karta">
  <h2 id="nadpis"></h2>
  <pre id="dotaz"></pre>
  <table><thead id="hlavicka"></thead><tbody id="telo"></tbody></table>
  <p id="pozn"></p>
</div>
```
```css
body { margin: 0; font: 15px/1.5 system-ui, sans-serif; color: #1f2430; background: #f6f7fb; }
.karta { padding: 1rem 1.1rem; }
h2 { margin: 0 0 .5rem; font-size: 1rem; }
pre { margin: 0 0 .75rem; padding: .6rem .7rem; border-radius: .5rem; background: #fff; border: 1px solid #dfe3ec; font: 13px/1.5 ui-monospace, monospace; white-space: pre-wrap; }
table { border-collapse: collapse; width: 100%; background: #fff; border: 1px solid #dfe3ec; border-radius: .5rem; overflow: hidden; font-size: 13px; }
th, td { padding: .35rem .55rem; text-align: left; border-bottom: 1px solid #eef0f6; }
th { background: #eef2ff; font-weight: 600; }
td.cislo { text-align: right; font-variant-numeric: tabular-nums; }
p { margin: .7rem 0 0; font-weight: 600; }
```
```js
function ukaz({ nadpis, dotaz, sloupce, radky, pozn }) {
  document.getElementById('nadpis').textContent = nadpis;
  document.getElementById('dotaz').textContent = dotaz;
  document.getElementById('hlavicka').innerHTML =
    '<tr>' + sloupce.map((s) => '<th>' + s + '</th>').join('') + '</tr>';
  document.getElementById('telo').innerHTML = radky
    .map((radek) => '<tr>' + radek
      .map((bunka) => '<td class="' + (typeof bunka === 'number' ? 'cislo' : '') + '">' +
        (typeof bunka === 'number' ? bunka.toLocaleString('cs-CZ') : bunka) + '</td>')
      .join('') + '</tr>')
    .join('');
  document.getElementById('pozn').textContent = pozn;
}
```
--variant-- GROUP BY sbalí řádky
```js
ukaz({
  nadpis: 'Z dvanácti řádků zbudou tři',
  dotaz: 'SELECT shop, SUM(amount_kc) AS celkem\n  FROM sales\n GROUP BY shop;',
  sloupce: ['shop', 'celkem'],
  radky: [['Brno', 749000], ['Ostrava', 517000], ['Praha', 1106000]],
  pozn: '3 řádky — měsíce jsou pryč.',
});
```
--variant-- OVER řádky nechá
```js
ukaz({
  nadpis: 'Dvanáct řádků zůstane, přibude sloupec',
  dotaz: 'SELECT shop, month, amount_kc,\n       SUM(amount_kc) OVER (PARTITION BY shop) AS celkem\n  FROM sales;',
  sloupce: ['shop', 'month', 'amount_kc', 'celkem'],
  radky: [
    ['Brno', '2026-01', 182000, 749000],
    ['Brno', '2026-02', 164000, 749000],
    ['Brno', '2026-03', 205000, 749000],
    ['Brno', '2026-04', 198000, 749000],
    ['Ostrava', '2026-01', 121000, 517000],
    ['Praha', '2026-01', 264000, 1106000],
  ],
  pozn: '12 řádků — součet je u každého z nich.',
});
```
:::

:::check
Tabulka `sales` má 12 řádků. Kolik řádků vrátí `SELECT shop, month, SUM(amount_kc) OVER (PARTITION BY shop) FROM sales`?

### --expected--
12

### --why--
Okenní funkce nemění počet řádků. Jen ke každému dopočítá hodnotu z jeho okna.
:::

## OVER: agregace, která nesbalí řádky

Zápis je krátký: za obyčejnou agregační funkci přidáš `OVER (…)`.

```sql
SELECT shop, month, amount_kc,
       SUM(amount_kc) OVER () AS celkem_vse
  FROM sales;
```

Prázdné `OVER ()` znamená „oknem je celá tabulka": ke každému z dvanácti řádků se
připíše součet 2 372 000. Uvnitř závorky se okno zužuje třemi věcmi, vždy v tomhle pořadí:

```sql
OVER (PARTITION BY … ORDER BY … ROWS BETWEEN … AND …)
--        kdo je ve skupině   v jakém pořadí   které řádky z ní se počítají
```

Okenní funkce se vyhodnocují **až po `WHERE` a `GROUP BY`**, těsně před `ORDER BY` celého
dotazu. To vysvětluje většinu překvapení, na která u nich narazíš.

:::check
Co vrátí `SUM(amount_kc) OVER ()` u každého řádku tabulky `sales`? Odpověz jednou větou bez čísel.

### --expected-- ignore-case
součet celé tabulky

### --accept--
součet všech řádků
součet přes celou tabulku
součet tržeb celé tabulky

### --why--
Prázdné `OVER ()` nijak nezužuje okno, takže do součtu jdou všechny řádky, které prošly
`WHERE`.
:::

## PARTITION BY: počítej po skupinách

`PARTITION BY` rozdělí řádky do skupin — stejně jako `GROUP BY`, jen bez sbalení.
Typické použití je podíl řádku na skupině:

```sql
SELECT shop, month, amount_kc,
       ROUND(100.0 * amount_kc / SUM(amount_kc) OVER (PARTITION BY shop), 1) AS podil_pct
  FROM sales
 WHERE shop = 'Brno'
 ORDER BY month;
```

| month | amount_kc | podil_pct |
|---|---|---|
| 2026-01 | 182 000 | 24.3 |
| 2026-02 | 164 000 | 21.9 |
| 2026-03 | 205 000 | 27.4 |
| 2026-04 | 198 000 | 26.4 |

Všimni si `100.0` místo `100`. Kdyby tam bylo celé číslo, dělilo by se celočíselně a
z každého podílu by vyšla nula.

> [!TIP]
> `PARTITION BY` a `GROUP BY` se nevylučují. Dotaz může nejdřív sbalit prodeje do měsíců
> přes `GROUP BY` a **až nad výsledkem** spočítat okenní funkci — okno pak pracuje
> s řádky po sbalení.

:::check
Dotaz má `SUM(amount_kc) OVER (PARTITION BY shop)`. Pobočky jsou tři. Kolik různých hodnot se v tom sloupci objeví?

### --expected--
3

### --why--
Jedna hodnota na skupinu. Řádků zůstane dvanáct, ale součet je u každé pobočky stejný.
:::

## Pořadí: ROW_NUMBER, RANK a DENSE_RANK

Tři funkce, které vypadají stejně, ale liší se ve shodách:

```sql
SELECT month, shop, amount_kc,
       RANK() OVER (PARTITION BY month ORDER BY amount_kc DESC) AS poradi
  FROM sales
 WHERE month = '2026-03';
```

| shop | amount_kc | poradi |
|---|---|---|
| Praha | 289 000 | 1 |
| Brno | 205 000 | 2 |
| Ostrava | 118 000 | 3 |

Dokud jsou hodnoty různé, chovají se všechny tři stejně. Rozdíl je vidět na shodě:

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE score (jmeno TEXT NOT NULL, body INTEGER NOT NULL) STRICT;
  INSERT INTO score VALUES ('Adam', 30), ('Bára', 25), ('Cyril', 25), ('Dana', 20);
`);

const rows = db.prepare(`
  SELECT jmeno,
         ROW_NUMBER() OVER (ORDER BY body DESC) AS cislo,
         RANK()       OVER (ORDER BY body DESC) AS poradi,
         DENSE_RANK() OVER (ORDER BY body DESC) AS husta
    FROM score
   ORDER BY body DESC, jmeno
`).all();

for (const row of rows) console.log(`${row.jmeno}: ${row.cislo} ${row.poradi} ${row.husta}`);
```
--question-- Bára i Cyril mají 25 bodů. Co vypíše program?
--output--
```text
Adam: 1 1 1
Bára: 2 2 2
Cyril: 3 2 2
Dana: 4 4 3
```
--why-- `ROW_NUMBER` čísluje řádky bez ohledu na hodnoty, takže Cyril dostane 3, i když má stejně bodů jako Bára — a to které z nich připadne dvojka, může být pokaždé jiné. `RANK` dá shodným řádkům stejné číslo a další pořadí přeskočí (po dvou druhých místech následuje čtvrté). `DENSE_RANK` shodným řádkům taky dá stejné číslo, ale nepřeskakuje.
:::

Jak si vybrat: **`ROW_NUMBER`** pro stránkování a „vyber z každé skupiny jeden řádek",
**`RANK`** pro žebříčky s medailemi, **`DENSE_RANK`** pro číslování úrovní (počet
různých hodnot).

:::check
Pět hráčů má body 10, 8, 8, 8 a 5 (seřazeno sestupně). Jaké číslo dá poslednímu hráči `RANK()`?

### --expected--
5

### --why--
První je 1, tři osmičky jsou všechny na místě 2 a `RANK` pak přeskočí místa 3 a 4.
`DENSE_RANK` by dal 3.
:::

## LAG a LEAD: soused v řádku vedle

`LAG` sáhne na předchozí řádek okna, `LEAD` na následující. Meziměsíční změna je pak
jedno odečtení:

```sql
SELECT shop, month, amount_kc,
       LAG(amount_kc) OVER (PARTITION BY shop ORDER BY month) AS minuly,
       amount_kc - LAG(amount_kc) OVER (PARTITION BY shop ORDER BY month) AS zmena
  FROM sales
 WHERE shop = 'Ostrava'
 ORDER BY month;
```

| month | amount_kc | minuly | zmena |
|---|---|---|---|
| 2026-01 | 121 000 | NULL | NULL |
| 2026-02 | 133 000 | 121 000 | 12 000 |
| 2026-03 | 118 000 | 133 000 | −15 000 |
| 2026-04 | 145 000 | 118 000 | 27 000 |

První řádek žádného předchůdce nemá, a tak dostane `NULL` — a `NULL` v odčítání udělá
zase `NULL`. Když chceš místo toho nulu, dej `LAG` druhý a třetí argument:
`LAG(amount_kc, 1, 0)`.

:::check
Dotaz počítá `LEAD(amount_kc) OVER (PARTITION BY shop ORDER BY month)`. Jakou hodnotu dostane **poslední** měsíc každé pobočky?

### --expected-- ignore-case
NULL

### --why--
Za posledním řádkem okna už žádný není. `LEAD` i `LAG` na kraji vracejí `NULL`, pokud
jim nedáš náhradní hodnotu třetím argumentem.
:::

## Rámec okna: součet od začátku a klouzavý průměr

Třetí část `OVER (…)` je [[rámec okna|rámec]]: které řádky uvnitř skupiny se do výpočtu
počítají. Zapisuje se `ROWS BETWEEN <začátek> AND <konec>`:

```sql
-- 1. Součet od začátku roku: všechny řádky až po ten aktuální.
SELECT month, amount_kc,
       SUM(amount_kc) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS od_zacatku
  FROM sales WHERE shop = 'Praha' ORDER BY month;

-- 2. Klouzavý průměr za tři měsíce: tenhle řádek a dva před ním.
SELECT month, amount_kc,
       ROUND(AVG(amount_kc) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS klouzavy
  FROM sales WHERE shop = 'Brno' ORDER BY month;
```

| month | amount_kc | od_zacatku (Praha) | klouzavy (Brno) |
|---|---|---|---|
| 2026-01 | — | 264 000 | 182 000 |
| 2026-02 | — | 515 000 | 173 000 |
| 2026-03 | — | 804 000 | 183 667 |
| 2026-04 | — | 1 106 000 | 189 000 |

> [!PITFALL]
> **`ORDER BY` uvnitř `OVER` mění výchozí rámec.** Jakmile v okně je `ORDER BY` a rámec
> nenapíšeš, počítá se od začátku skupiny po aktuální řádek — takže `SUM(…) OVER (PARTITION BY shop ORDER BY month)`
> **není** součet pobočky, ale součet od ledna do toho měsíce. Bez `ORDER BY` je rámcem
> celá skupina. Když chceš součet za skupinu a zároveň řadit, `ORDER BY` do okna nedávej.

:::check
Chceš u každého měsíce průměr za ten měsíc a dva předchozí. Jak zapíšeš rámec okna? Napiš jen tu část od slova `ROWS`.

### --expected-- ignore-case
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW

### --why--
`2 PRECEDING` jsou dva řádky před aktuálním, `CURRENT ROW` je ten aktuální. Dohromady
tři řádky, o které jde.
:::

## Kde okno použít nejde

Okenní funkce se počítá až po `WHERE`, takže ve `WHERE` na ni sáhnout nemůžeš.
Tenhle dotaz skončí chybou `misuse of window function RANK()`:

```sql
-- CHYBA: RANK() ve WHERE neexistuje, v té chvíli ještě není spočítaný.
SELECT shop, month FROM sales WHERE RANK() OVER (ORDER BY amount_kc DESC) <= 2;
```

Řešení je spočítat okno v poddotazu nebo v `WITH` a filtrovat až nad ním:

```sql
WITH zebricek AS (
  SELECT shop, month, amount_kc,
         RANK() OVER (PARTITION BY month ORDER BY amount_kc DESC) AS poradi
    FROM sales
)
SELECT * FROM zebricek WHERE poradi <= 2 AND month = '2026-04' ORDER BY poradi;
```

| shop | month | amount_kc | poradi |
|---|---|---|---|
| Praha | 2026-04 | 302 000 | 1 |
| Brno | 2026-04 | 198 000 | 2 |

`WITH jmeno AS (…)` je pojmenovaný poddotaz. Dotaz je s ním čitelnější než se
zanořenými závorkami a na jeho jméno se dá odkazovat víckrát.

:::check
Jaké klíčové slovo uvede pojmenovaný poddotaz, nad kterým se dá filtrovat podle okenní funkce?

### --expected-- ignore-case
WITH

### --why--
`WITH jmeno AS (…)` spočítá okno a výsledek pojmenuje. V dotazu nad ním je z okenní
funkce obyčejný sloupec, takže `WHERE` na něj sáhnout může.
:::

:::explain
Proč skončí chybou dotaz, který má okenní funkci ve `WHERE`, a proč stejná funkce v `SELECT` téhož dotazu projde?

## --model--
Části dotazu se vyhodnocují v pořadí `FROM` → `WHERE` → `GROUP BY` → okenní funkce →
`ORDER BY`. Ve chvíli, kdy běží `WHERE`, se teprve rozhoduje, které řádky vůbec do okna
půjdou — pořadí tedy ještě nemůže existovat. V `SELECT` už jsou řádky vybrané, takže
okno má z čeho počítat. Filtrovat podle okenní funkce proto jde až nad hotovým
výsledkem: v poddotazu nebo v `WITH`, kde se stane obyčejným sloupcem.

## --checklist--
- `WHERE` běží dřív, než se okenní funkce počítá.
- Okno by muselo znát řádky, o kterých `WHERE` teprve rozhoduje.
- Filtrovat podle okna jde až nad jeho výsledkem — v poddotazu nebo ve `WITH`.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`ORDER BY` v okně místo v dotazu.** `ORDER BY` uvnitř `OVER (…)` určuje pořadí pro
> výpočet, ne pořadí výsledku. Když chceš seřadit výstup, napiš `ORDER BY` ještě jednou
> na konci dotazu.

> [!PITFALL]
> **Celočíselné dělení v podílu.** `100 * amount_kc / SUM(amount_kc) OVER ()` vrátí nulu,
> protože se dělí celá čísla. Oprava: `100.0`.

> [!PITFALL]
> **`ROW_NUMBER` u shodných hodnot.** Při shodě rozhoduje pořadí, které databáze zrovna
> zvolí, takže se výsledek může mezi běhy lišit. Oprava: do `ORDER BY` okna přidej druhý
> sloupec, který shodu rozhodne jednoznačně (třeba `id`).

> [!PITFALL]
> **Okno nad příliš mnoha řádky.** `SUM(…) OVER ()` nad milionem řádků musí projít
> milion řádků, i když tě zajímá deset. Oprava: nejdřív data zúžit `WHERE` a oknu dát
> jen to, co potřebuje.

:::check
Dotaz vrací podíly a všechny vycházejí `0`. Které jediné znaménko nebo číslo v něm opravíš?

### --expected-- ignore-case
100 na 100.0

### --accept--
100.0
napíšu 100.0 místo 100
změním 100 na 100.0

### --why--
Dvě celá čísla se v SQL dělí celočíselně. Stačí, aby byl jeden z operandů desetinný.
:::

## Kde to najdeš v MDN

MDN o SQL nemluví, tohle téma najdeš přímo v dokumentaci databází:

- [SQLite: Window Functions](https://www.sqlite.org/windowfunctions.html) — `OVER`, `PARTITION BY`, rámce i seznam funkcí.
- [PostgreSQL: Window Functions Tutorial](https://www.postgresql.org/docs/current/tutorial-window.html) — tytéž funkce vysvětlené s obrázky.
- [PostgreSQL: WITH Queries (CTE)](https://www.postgresql.org/docs/current/queries-with.html) — pojmenované poddotazy do hloubky.

# --questions--

## --question--

Tabulka `bookings` má 40 řádků. Kolik řádků vrátí `SELECT court_id, COUNT(*) OVER (PARTITION BY court_id) FROM bookings`?

### --expected--
40

### --why--
Okenní funkce počet řádků nemění. Kdyby tam bylo `GROUP BY court_id`, vrátil by dotaz
tolik řádků, kolik je kurtů.

### --see--
sql-databaze/okenni-funkce#over-agregace-ktera-nesbali-radky

## --question--

Chceš z každé kategorie e-shopu vypsat **jeden** nejdražší produkt. Kterou funkci použiješ a jak dotaz dokončíš?

### --answer--
`RANK() OVER (PARTITION BY category ORDER BY price DESC)` a pak `WHERE rank = 1` přímo v tomtéž dotazu.

#### --why--
Podmínka nad okenní funkcí ve `WHERE` téhož dotazu skončí chybou — okno se počítá až po `WHERE`. A `RANK` navíc při shodné ceně vrátí dva první.

### --correct--
`ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC)` v poddotazu nebo ve `WITH` a nad ním `WHERE poradi = 1`.

#### --why--
`ROW_NUMBER` vrátí při shodě jen jeden řádek a filtrovat se dá až nad hotovým sloupcem.

### --answer--
`MAX(price) GROUP BY category` — okenní funkce tu nepotřebuješ.

#### --why--
`MAX` vrátí cenu, ale ne zbytek řádku (název, id). Právě proto tady okno je.

### --see--
sql-databaze/okenni-funkce#kde-okno-pouzit-nejde

## --question--

Napiš okenní funkci, která u každého měsíce vrátí tržbu předchozího měsíce téže pobočky. Sloupce jsou `shop`, `month`, `amount_kc`. Stačí samotný výraz i s `OVER`.

### --expected--
LAG(amount_kc) OVER (PARTITION BY shop ORDER BY month)

### --accept--
LAG(amount_kc, 1) OVER (PARTITION BY shop ORDER BY month)

### --why--
`PARTITION BY shop` zajistí, že se nesáhne do cizí pobočky, `ORDER BY month` určí, co
znamená „předchozí". Bez `PARTITION BY` by lednu jedné pobočky předcházel prosinec jiné.

### --see--
sql-databaze/okenni-funkce#lag-a-lead-soused-v-radku-vedle

## --question--

Dotaz má `SUM(amount_kc) OVER (PARTITION BY shop ORDER BY month)` a autor čeká součet za pobočku. Co dostane doopravdy?

### --answer--
Součet za pobočku, `ORDER BY` uvnitř okna jen určuje pořadí výstupu.

#### --why--
Pořadí výstupu určuje `ORDER BY` na konci dotazu. To uvnitř `OVER` mění rámec.

### --correct--
Součet od prvního měsíce pobočky po ten aktuální, tedy narůstající součet.

#### --why--
S `ORDER BY` a bez zapsaného rámce je výchozí rámec „od začátku skupiny po aktuální řádek".

### --answer--
Chybu, `ORDER BY` se do `OVER` psát nesmí.

#### --why--
Psát se tam smí a u `LAG`, `RANK` a klouzavých průměrů je nutné.

### --see--
sql-databaze/okenni-funkce#ramec-okna-soucet-od-zacatku-a-klouzavy-prumer

## --question--

**Opakování z dřívějška.** V tabulce recenzí chceš průměr hodnocení jen u podniků, které mají aspoň pět recenzí. Do které klauzule patří podmínka `COUNT(*) >= 5` — `WHERE`, nebo `HAVING`?

### --expected-- ignore-case
HAVING

### --why--
`WHERE` filtruje jednotlivé řádky ještě před sbalením, `HAVING` až hotové skupiny.
Podmínka nad `COUNT(*)` se tedy dá vyhodnotit jen v `HAVING`. Je to stejná logika jako
u okenních funkcí: co ještě není spočítané, na to se filtrovat nedá.

### --see--
sql-databaze/workshop-join-agregace/013

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
const trzby = [182000, 164000, 205000];
const prumer = trzby.reduce((soucet, castka) => soucet + castka) / trzby.length;
console.log(Math.round(prumer));
```

### --expected--
183667

### --why--
`reduce` bez počáteční hodnoty vezme jako akumulátor první prvek. Tady to projde,
protože pole není prázdné a prvky jsou čísla — nad prázdným polem by stejný zápis spadl.
Mimochodem, je to přesně ten klouzavý průměr za tři měsíce z lekce, jen spočítaný v JS.

### --see--
js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty
