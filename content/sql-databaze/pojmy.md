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
