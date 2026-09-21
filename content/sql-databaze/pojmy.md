## --term-- relační databáze

en: relational database
lekce: sql-databaze/relacni-databaze

Databáze, která ukládá data do tabulek s pevně danými sloupci a typy.

## --term-- primární klíč

en: primary key
lekce: sql-databaze/relacni-databaze

Sloupec, jehož hodnota jednoznačně identifikuje každý řádek v tabulce.

## --term-- integritní omezení

en: constraint
lekce: sql-databaze/relacni-databaze
aliases: omezení

Pravidlo na sloupci tabulky (např. NOT NULL, UNIQUE), které databáze hlídá při každém zápisu.

## --term-- NULL

en: NULL
lekce: sql-databaze/relacni-databaze

Speciální hodnota v databázi, která znamená "chybí" nebo "nevím".

## --term-- vázaný parametr

en: bound parameter
lekce: sql-databaze/relacni-databaze
aliases: vázanými parametry, vázaným parametrem

Hodnota předaná databázi odděleně od textu SQL dotazu, chrání před SQL injection.

## --term-- vztah 1:N

en: one-to-many relationship
lekce: sql-databaze/navrh-schematu
aliases: vztahu 1:N

Vztah, kdy jeden záznam (např. autor) může mít více podřízených záznamů (např. knih), ale každý podřízený patří jen k jednomu nadřízenému.

## --term-- cizí klíč

en: foreign key
lekce: sql-databaze/navrh-schematu
aliases: cizím klíčem

Sloupec, který obsahuje primární klíč z jiné tabulky a tím vytváří vztah mezi řádky.

## --term-- vztah M:N

en: many-to-many relationship
lekce: sql-databaze/navrh-schematu

Vztah, kdy záznam může patřit více záznamům na druhé straně a naopak (např. filmy a herci).

## --term-- spojovací tabulka

en: junction table
lekce: sql-databaze/navrh-schematu
aliases: spojovací tabulku, spojovací tabulce

Tabulka vytvořená pro realizaci vztahu M:N, obsahuje cizí klíče do obou propojovaných tabulek.

## --term-- normalizace schématu

en: database normalization
lekce: sql-databaze/navrh-schematu
aliases: normalizací schématu, normalizaci schématu

Proces návrhu tabulek, který odstraňuje duplicity a závislosti tak, aby se každá informace ukládala jen jednou.

## --term-- soft delete

en: soft delete
lekce: sql-databaze/navrh-schematu

Technika, kdy se řádek z databáze nesmaže pomocí DELETE, ale jen se označí jako smazaný ve speciálním sloupci.

## --term-- migrace

en: database migration
lekce: sql-databaze/navrh-schematu
aliases: migraci

Skript nebo postup, kterým se řízeně mění struktura databáze (např. přidání sloupce) bez ztráty stávajících dat.

## --term-- alias tabulky

en: table alias
lekce: sql-databaze/workshop-join-agregace
aliases: aliasu tabulky, aliasem tabulky

Dočasné, kratší jméno pro tabulku v SQL dotazu (např. `movies m`).

## --term-- agregační funkce

en: aggregate function
lekce: sql-databaze/workshop-join-agregace
aliases: agregační funkcí, agregačních funkcí, agregační funkci

Funkce (např. COUNT, SUM, AVG), která spočítá výsledek z více řádků do jedné hodnoty.

## --term-- poddotaz

en: subquery
lekce: sql-databaze/workshop-join-agregace
aliases: poddotazu, poddotazem

Vnořený SQL dotaz použitý uvnitř jiného dotazu.

## --term-- upsert

en: upsert
lekce: sql-databaze/workshop-join-agregace

Operace, která řádek buď vloží, nebo ho zaktualizuje, pokud už v databázi existuje.

## --term-- transakce

en: transaction
aliases: transakci, transakcí, transakcemi, transakcích
lekce: sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback

Skupina SQL příkazů, kterou databáze provede buď celou, nebo vůbec. Otevře ji `BEGIN`, potvrdí `COMMIT` a zruší `ROLLBACK`.

## --term-- atomicita

en: atomicity
aliases: atomicitu, atomicity
lekce: sql-databaze/transakce-a-indexy#co-transakce-zarucuje

Vlastnost transakce, díky které platí buď všechny její změny, nebo žádná. Částečný zápis tak nemůže vzniknout.

## --term-- dotazovací plán

en: query plan
aliases: plán dotazu, plánu dotazu, plánem dotazu
lekce: sql-databaze/transakce-a-indexy#proc-je-dotaz-pomaly-plan-dotazu

Postup, kterým se databáze rozhodla dotaz vykonat. Vypíše ho `EXPLAIN QUERY PLAN` a prozradí, jestli tabulku čte celou (`SCAN`), nebo listuje přes index (`SEARCH`).

## --term-- databázový index

en: database index
aliases: databázového indexu, databázovém indexu, databázové indexy, databázových indexů
lekce: sql-databaze/transakce-a-indexy#index-co-umi-a-co-stoji

Pomocná struktura seřazená podle hodnot jednoho nebo více sloupců. Zrychluje hledání a řazení, ale zdržuje zápisy.

## --term-- problém N+1

en: N+1 query problem
aliases: N+1, problému N+1, problémem N+1
lekce: sql-databaze/transakce-a-indexy#problem-n-1

Chyba, kdy kód pošle jeden dotaz na seznam a pak další dotaz na podrobnosti každého řádku. Řeší se `JOIN` nebo jediným dotazem s `WHERE id IN (…)`.

## --term-- okenní funkce

en: window function
aliases: okenní funkci, okenních funkcí, okenními funkcemi, okenní funkce se
lekce: sql-databaze/okenni-funkce#over-agregace-ktera-nesbali-radky

Funkce se zápisem `OVER (…)`, která počítá z okolních řádků, ale řádky nesbalí. Na rozdíl od `GROUP BY` zůstane výsledků tolik, kolik bylo vstupních řádků.

## --term-- rámec okna

en: window frame
aliases: rámec, rámce okna, rámcem okna
lekce: sql-databaze/okenni-funkce#ramec-okna-soucet-od-zacatku-a-klouzavy-prumer

Část zápisu `OVER (…)` za slovem `ROWS`, která určuje, které řádky skupiny se do výpočtu započítají — například `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`.

## --term-- ORM

en: object-relational mapping
aliases: ORM nástroj, ORM nástroje, ORM nástrojem
lekce: sql-databaze/orm-drizzle#co-orm-je-a-co-neni

Knihovna, která převádí řádky tabulek na objekty jazyka a zpátky. Podle toho, jak daleko od SQL odvede, sahá od dotazovacího builderu (Drizzle) po plné ORM (Prisma).

## --term-- dotazovací builder

en: query builder
aliases: dotazovacího builderu, dotazovacím builderem, builder dotazů
lekce: sql-databaze/orm-drizzle#co-orm-je-a-co-neni

Knihovna, ve které se dotaz skládá voláním metod (`select`, `from`, `where`) místo psaní textu SQL. Výsledkem je pořád SQL, jen vzniká z kódu.

## --term-- connection string

en: connection string
aliases: připojovací řetězec, připojovacího řetězce, connection stringu
lekce: sql-databaze/postgres-v-dockeru#pripojeni-a-soubor-env

Jednořádková adresa databáze ve tvaru `postgres://uživatel:heslo@host:port/databáze`. Aplikace ji obvykle dostane v proměnné prostředí `DATABASE_URL`.

## --term-- fond spojení

en: connection pool
aliases: fondu spojení, fondem spojení, pool spojení
lekce: sql-databaze/postgres-v-dockeru#pripojeni-a-soubor-env

Sada předem otevřených spojení k databázovému serveru, které si aplikace půjčuje a vrací. Každý dotaz tak nemusí navazovat spojení znovu.
