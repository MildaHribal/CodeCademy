---
pass: 0.8
---

# --questions--

## --question--

Proč se jako primární klíč obvykle nepoužívá e-mail, i když je jedinečný?

### --answer--

Protože text je jako klíč pomalý.

#### --why--

Rychlost je vedlejší. Hlavní problém je v něčem jiném.

### --correct--

Protože se e-mail může změnit — a s ním by se musely měnit všechny cizí klíče, které na řádek odkazují.

#### --why--

Klíč má být neměnný. Na e-mail se dá `UNIQUE`, identita se řeší umělým klíčem.

### --answer--

Protože e-mail může chybět.

#### --why--

Když je povinný, chybět nemůže. Problém je v jeho proměnlivosti.

### --see--

sql-databaze/relacni-databaze#primarni-klic

## --question--

Napiš podmínku, která najde řádky, kde sloupec `city` nemá vyplněnou hodnotu.

### --expected--

city IS NULL

### --accept--

WHERE city IS NULL

### --why--

`= NULL` nikdy neplatí: porovnání s neznámou hodnotou vrací zase `NULL`, a řádek podmínkou neprojde.

### --see--

sql-databaze/relacni-databaze#null-hodnota-chybi

## --question--

Kterým omezením zapíšeš pravidlo „cena musí být větší než nula"?

### --expected--

CHECK

### --accept--

CHECK (price > 0)
check

### --why--

`CHECK` platí pro každý zápis, i pro ten z konzole. Kontrola v aplikaci platí jen pro tu jednu aplikaci.

### --see--

sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default

## --question--

Jak se v relační databázi zapíše vztah M:N, třeba články a štítky?

### --answer--

Sloupcem se seznamem id oddělených čárkou.

#### --why--

Databáze by v něm neuměla hledat ani hlídat, že odkazovaný řádek existuje.

### --correct--

Spojovací tabulkou se dvěma cizími klíči a `UNIQUE` nad jejich dvojicí.

#### --why--

Každá dvojice je jeden řádek, takže jdou přidávat, mazat i doplnit o vlastní sloupce.

### --answer--

Cizím klíčem na obou stranách.

#### --why--

To by šlo jen u 1:1. Jeden sloupec neunese víc hodnot.

### --see--

sql-databaze/navrh-schematu#vztah-m-n-spojovaci-tabulka

## --question--

U kterého cizího klíče je `ON DELETE CASCADE` **špatný** nápad?

### --answer--

U položek objednávky odkazujících na objednávku.

#### --why--

Položka bez objednávky nedává smysl, kaskáda je tu správně.

### --correct--

U položek objednávky odkazujících na zboží.

#### --why--

Smazáním zboží by zmizely historické položky, a s nimi i tržby. Tady má databáze mazání rovnou odmítnout.

### --answer--

U komentářů odkazujících na příspěvek.

#### --why--

Komentář bez příspěvku nemá kde být, kaskáda je v pořádku.

### --see--

sql-databaze/navrh-schematu#on-delete-co-se-stane-s-knihami

## --question--

Spojíš objednávky s jejich položkami a napíšeš `COUNT(orders.id)`. Co dostaneš?

### --answer--

Správný počet objednávek.

#### --why--

Po spojení s tabulkou ve vztahu 1:N se řádky znásobí.

### --correct--

Počet položek, ne objednávek — objednávka se třemi položkami se započítá třikrát.

#### --why--

Pomůže `COUNT(DISTINCT orders.id)`, nebo agregovat v poddotazu dřív, než se tabulky spojí.

### --answer--

Chybu, protože `orders.id` není v `GROUP BY`.

#### --why--

Agregační funkce sloupec v `GROUP BY` mít nemusí.

## --question--

Chceš výpis **všech** zákazníků včetně těch bez objednávky. Jaké spojení použiješ?

### --expected--

LEFT JOIN

### --accept--

left join
LEFT OUTER JOIN

### --why--

Vnitřní `JOIN` zákazníka bez protějšku zahodí. U `LEFT JOIN` nezapomeň na `COALESCE(…, 0)` u sečtených sloupců.

## --question--

Kam patří podmínka, která filtruje výsledek agregace — například „jen zákazníci
s víc než třemi objednávkami"?

### --expected--

HAVING

### --accept--

do HAVING
having

### --why--

`WHERE` filtruje řádky před seskupením, `HAVING` až spočítané skupiny.

## --question--

Co zaručuje transakce?

### --answer--

Že dotaz proběhne rychleji.

#### --why--

Rychlost transakce neřeší, někdy je naopak pomalejší.

### --correct--

Že skupina změn proběhne celá, nebo vůbec — a že ostatní mezitím nevidí polorozdělaný stav.

#### --why--

Proto se odečtení skladu a založení objednávky dělá v jedné transakci.

### --answer--

Že se data uloží na disk.

#### --why--

Uložení na disk je důsledek potvrzení, ne to, co transakce řeší.

### --see--

sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback

## --question--

Jakým příkazem vezmeš rozdělanou transakci zpět?

### --expected--

ROLLBACK

### --accept--

rollback
db.exec('ROLLBACK')

### --why--

`COMMIT` změny potvrdí, `ROLLBACK` je zahodí a databáze se vrátí do stavu před `BEGIN`.

## --question--

Co index **zpomalí**?

### --answer--

Hledání podle indexovaného sloupce.

#### --why--

To naopak zrychlí, o to jde.

### --correct--

Zápis — každý `INSERT`, `UPDATE` i `DELETE` musí index udržet, a index zabírá místo.

#### --why--

Proto se indexy přidávají cíleně podle dotazů, které aplikace opravdu posílá, ne na všechno.

### --answer--

Řazení podle indexovaného sloupce.

#### --why--

Setříděný index řazení naopak ušetří.

### --see--

sql-databaze/transakce-a-indexy#index-co-umi-a-co-stoji

## --question--

V logu vidíš stokrát za sebou stejný `SELECT` lišící se jen v `id`. Jak se ten problém
jmenuje?

### --expected-- ignore-case

N+1

### --accept--

problém N+1
n plus 1
N+1 problém

### --why--

Jeden dotaz vytáhne N řádků a pro každý se pošle další. Řeší se jedním `JOIN`, nebo jedním dotazem s `WHERE id IN (…)`.

### --see--

sql-databaze/transakce-a-indexy#problem-n-1

## --question--

Čím se okenní funkce liší od `GROUP BY`?

### --answer--

Okenní funkce umí víc agregací najednou.

#### --why--

Víc agregací zvládne i `GROUP BY`.

### --correct--

Okenní funkce řádky nesloučí — ke každému přidá spočítanou hodnotu, takže je vidět detail i souhrn.

#### --why--

Proto se hodí na pořadí v žebříčku, podíl na celku nebo rozdíl proti minulému měsíci.

### --answer--

Okenní funkce se počítá před `WHERE`.

#### --why--

Naopak: okna se počítají až nad řádky, které `WHERE` propustil.

### --see--

sql-databaze/okenni-funkce#over-agregace-ktera-nesbali-radky

## --question--

Chceš z každého města právě jednoho zákazníka s nejvyšší útratou. Kterou funkci
použiješ a kam dáš filtr?

### --answer--

`RANK()` a filtr rovnou do `WHERE`.

#### --why--

`RANK` při shodě vrátí víc řádků s jedničkou a filtr ve `WHERE` na okenní funkci nejde.

### --correct--

`ROW_NUMBER() OVER (PARTITION BY city ORDER BY …)` v poddotazu a filtr `WHERE poradi = 1` až nad ním.

#### --why--

`ROW_NUMBER` se nikdy neopakuje a filtrovat okno jde teprve o úroveň výš.

### --answer--

`MAX(spent)` s `GROUP BY city`.

#### --why--

To dá nejvyšší útratu, ale ne e-mail toho zákazníka — ten se musí připojit zpátky.

### --see--

sql-databaze/okenni-funkce#kde-okno-pouzit-nejde

## --question--

Napiš, co se v SQLite musí zapnout na každém připojení, aby databáze hlídala cizí klíče.

### --expected--

PRAGMA foreign_keys = ON

### --accept--

foreign_keys
PRAGMA foreign_keys=ON
pragma foreign_keys = on

### --why--

Bez něj se cizí klíče uloží do schématu, ale nehlídají — a `ON DELETE CASCADE` neudělá nic. Nic se přitom neohlásí.

### --see--

sql-databaze/relacni-databaze#node-sqlite-databaze-v-node

## --question--

Proč je vázaný parametr `?` víc než pohodlí?

### --answer--

Protože zkrátí dotaz.

#### --why--

Délka dotazu s tím nesouvisí.

### --correct--

Protože se hodnota nevkládá do dotazu jako text, takže s ní databáze nikdy nezachází jako s kódem.

#### --why--

Tím padá celá třída zranitelností SQL injection. Navíc se připravený dotaz dá použít opakovaně.

### --see--

sql-databaze/relacni-databaze#node-sqlite-databaze-v-node

## --question--

**Opakování z dřívějška.** Tvoje API posílá do databáze hodnotu, kterou dostalo
z těla požadavku. Kde musí proběhnout validace, aby to bylo bezpečné?

### --answer--

V prohlížeči, dřív než se požadavek odešle.

#### --why--

Klientskou validaci jde obejít tím, že se klient úplně vynechá.

### --correct--

Na serveru — a databáze si totéž hlídá vlastními omezeními jako poslední pojistku.

#### --why--

Server je jediné místo, které má nad daty kontrolu; omezení v databázi platí i pro zápis z konzole.

### --see--

api-http-rest/validace-a-chyby-api

## --question--

**Opakování z dřívějška.** Databáze v Dockeru potřebuje, aby data přežila smazání
kontejneru. Co musí `compose.yaml` obsahovat?

### --expected-- ignore-case

volume

### --accept--

svazek
volumes
pojmenovaný svazek
named volume

### --why--

Bez připojeného svazku žijí data uvnitř kontejneru a s ním i zmizí.

### --see--

nasazeni-provoz/kontejnery-a-servery

# --code-- Cizí schéma: rezervace v kadeřnictví

## --file-- schema.sql

```sql
-- Schéma po předchozím vývojáři. Databáze je SQLite.

CREATE TABLE salons (
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  city    TEXT
);

CREATE TABLE staff (
  id       INTEGER PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  email    TEXT
);

CREATE TABLE services (
  id       INTEGER PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  minutes  INTEGER,
  price    REAL
);

CREATE TABLE bookings (
  id         INTEGER PRIMARY KEY,
  staff_id   INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  customer   TEXT,
  phone      TEXT,
  starts_at  TEXT,
  status     TEXT,
  note       TEXT
);

CREATE TABLE reviews (
  id         INTEGER PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  stars      INTEGER,
  text       TEXT,
  created_at TEXT
);

CREATE TABLE opening_hours (
  id        INTEGER PRIMARY KEY,
  salon_id  INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  weekday   INTEGER,
  opens_at  TEXT,
  closes_at TEXT
);

CREATE INDEX idx_bookings_customer ON bookings(customer);
```

## --file-- queries.sql

```sql
-- Tržby jednotlivých kadeřnic za březen.
SELECT st.name,
       COUNT(b.id) AS pocet,
       SUM(sv.price) AS trzba
FROM staff st
JOIN bookings b ON b.staff_id = st.id
JOIN services sv ON sv.id = b.service_id
WHERE b.starts_at LIKE '2026-03%'
GROUP BY st.id
ORDER BY trzba DESC;

-- Obsazenost salonu v jeden den.
SELECT s.name, COUNT(*) AS rezervaci
FROM salons s
JOIN staff st ON st.salon_id = s.id
JOIN bookings b ON b.staff_id = st.id
WHERE date(b.starts_at) = '2026-03-14'
GROUP BY s.id;

-- Průměrné hodnocení kadeřnic.
SELECT st.name, AVG(r.stars) AS hvezdicky, COUNT(r.id) AS hodnoceni
FROM staff st
JOIN bookings b ON b.staff_id = st.id
JOIN reviews r ON r.booking_id = b.id
GROUP BY st.id
ORDER BY hvezdicky DESC;

-- Nejžádanější služby v každém salonu.
SELECT s.name AS salon, sv.name AS sluzba, COUNT(*) AS pocet
FROM bookings b
JOIN services sv ON sv.id = b.service_id
JOIN salons s ON s.id = sv.salon_id
GROUP BY s.id, sv.id
ORDER BY s.name, pocet DESC;

-- Zákazníci, kteří přišli víc než třikrát.
SELECT customer, COUNT(*) AS navstev
FROM bookings
WHERE status = 'dokoncena'
GROUP BY customer
HAVING COUNT(*) > 3
ORDER BY navstev DESC;

-- Volné termíny se hledají takhle (zjednodušeně).
SELECT st.name, b.starts_at
FROM staff st
LEFT JOIN bookings b ON b.staff_id = st.id AND date(b.starts_at) = '2026-03-14'
WHERE st.salon_id = 1
ORDER BY st.name, b.starts_at;
```

## --question--

Ceny jsou ve schématu uložené jako `REAL`. Proč je to problém?

### --answer--

Protože `REAL` se v SQLite nedá sčítat.

#### --why--

Sčítat jde, jen výsledek nemusí sedět.

### --correct--

Protože desetinná čísla se ukládají nepřesně a po sečtení stovek položek vyjde tržba o haléře jinak.

#### --why--

Peníze patří do celého čísla v nejmenší jednotce (haléře), nebo do typu `NUMERIC` tam, kde ho databáze má.

### --see--

sql-databaze/relacni-databaze#datove-typy

## --question--

Které omezení ve schématu chybí nejvíc a co se kvůli tomu může stát?

### --answer--

Chybí primární klíče.

#### --why--

Primární klíče tam jsou, všechny tabulky mají `id INTEGER PRIMARY KEY`.

### --correct--

Chybí `NOT NULL` skoro všude a `CHECK` na `status` — takže projde rezervace bez zákazníka, bez času i se stavem `hotovo?`.

#### --why--

Databáze má pravidla hlídat sama. Tady se spoléhá na to, že aplikace nic nepokazí.

### --answer--

Chybí `UNIQUE` na `salons.name`.

#### --why--

Dva salony stejného jména v různých městech jsou legitimní.

### --see--

sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default

## --question--

První dotaz počítá tržby přes `SUM(sv.price)`. Co na něm v review vytkneš kromě typu
ceny?

### --answer--

Že chybí `LEFT JOIN`, takže vypadnou kadeřnice bez rezervací.

#### --why--

To je pravda a je to platná připomínka — ale u dotazu na tržby za měsíc to může být záměr.

### --correct--

Že bere **aktuální** cenu služby, ne cenu v době rezervace — po zdražení se přepíšou i tržby za březen.

#### --why--

Historická cena se musí uložit k rezervaci, stejně jako `unit_price` u položky objednávky.

### --answer--

Že `GROUP BY st.id` nesmí být, když je ve `SELECT` `st.name`.

#### --why--

Seskupení podle primárního klíče je v pořádku, jméno je na něm závislé.

## --question--

Index `idx_bookings_customer` je jediný ve schématu. Který by pomohl oběma dotazům víc?

### --expected--

bookings(staff_id)

### --accept--

staff_id
index na staff_id
bookings(staff_id, starts_at)

### --why--

Obě agregace spojují rezervace přes `staff_id`; index na jméno zákazníka nepoužijí vůbec. Hodil by se i `bookings(starts_at)` kvůli filtru na měsíc.

### --see--

sql-databaze/transakce-a-indexy#index-co-umi-a-co-stoji

## --question--

Druhý dotaz filtruje `WHERE date(b.starts_at) = '2026-03-14'`. Proč by index na
`starts_at` stejně nepomohl?

### --answer--

Protože `starts_at` je text.

#### --why--

Text se indexovat dá, u tvaru `RRRR-MM-DD` řazení i porovnání funguje.

### --correct--

Protože je sloupec obalený funkcí — databáze pak index použít neumí a projde celou tabulku.

#### --why--

Přepsat se to dá na rozsah: `starts_at >= '2026-03-14' AND starts_at < '2026-03-15'`.

### --see--

sql-databaze/transakce-a-indexy#proc-je-dotaz-pomaly-plan-dotazu
