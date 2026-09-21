Rychlý přehled SQL a návrhu schématu.

## Kostra dotazu a pořadí vyhodnocení

```sql
SELECT   sloupce, agregace          -- 5. co se vrátí
FROM     tabulka                    -- 1. odkud
JOIN     druha ON podminka          -- 2. spojení
WHERE    podminka                   -- 3. filtr řádků
GROUP BY sloupec                    -- 4. seskupení
HAVING   podminka nad agregací      -- 6. filtr skupin
ORDER BY sloupec DESC               -- 7. řazení
LIMIT    10 OFFSET 20;              -- 8. stránkování
```

**Pořadí rozhoduje.** `WHERE` filtruje před seskupením, `HAVING` až skupiny. Alias ze
`SELECT` se dá použít v `ORDER BY`, ale ne ve `WHERE`. Okenní funkce se počítají až
nakonec, takže se na ně ve `WHERE` odkázat nedá.

## Typy a omezení

```sql
CREATE TABLE products (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  price_halere INTEGER NOT NULL CHECK (price_halere > 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category     TEXT NOT NULL CHECK (category IN ('čaj', 'káva', 'nádobí')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (name, category)
) STRICT;
```

| omezení | co zaručí |
|---|---|
| `NOT NULL` | hodnota musí být vyplněná |
| `UNIQUE` | hodnota (nebo dvojice) se neopakuje |
| `CHECK` | hodnota splňuje podmínku |
| `DEFAULT` | co se doplní, když hodnotu nepošleš |
| `REFERENCES` | hodnota existuje v jiné tabulce |

**Peníze jako celá čísla v haléřích**, nikdy `REAL`. Datum a čas jako text
`RRRR-MM-DD` / ISO 8601, nebo `TIMESTAMPTZ` v Postgresu.

## Vztahy

```sql
-- 1:N — cizí klíč na straně „mnoho"
orders.customer_id  REFERENCES customers(id) ON DELETE CASCADE

-- M:N — spojovací tabulka
CREATE TABLE article_tags (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
) STRICT;
```

| `ON DELETE` | kdy |
|---|---|
| `CASCADE` | podřízený řádek bez rodiče nedává smysl (položky objednávky) |
| *(výchozí)* | mazání se má odmítnout (zboží, které je v objednávce) |
| `SET NULL` | vazba smí zmizet, řádek zůstat (autor u článku) |

## Spojování a agregace

```sql
JOIN        -- jen řádky, které mají protějšek
LEFT JOIN   -- i řádky bez protějšku, chybějící sloupce jsou NULL
```

- Podmínka na pravou tabulku patří do `ON`, ne do `WHERE` — ve `WHERE` z `LEFT JOIN` udělá zase vnitřní.
- Spojení s tabulkou 1:N **znásobí řádky** → `COUNT(DISTINCT o.id)`, ne `COUNT(o.id)`.
- `SUM`, `AVG`, `MIN` a `MAX` ignorují `NULL`; `COUNT(*)` počítá řádky, `COUNT(sloupec)` jen neprázdné.
- `COALESCE(SUM(...), 0)` — součet nad prázdnou množinou je `NULL`, ne nula.

## NULL

```sql
WHERE city IS NULL          -- správně
WHERE city = NULL           -- nikdy nic nenajde
COALESCE(city, 'neuvedeno') -- náhrada za chybějící hodnotu
```

`NULL` znamená „nevím". Jakékoli porovnání s ním vrací zase `NULL`, a řádek podmínkou
neprojde.

## Transakce

```js
db.exec('BEGIN');
try {
  // … změny, které musí projít všechny …
  db.exec('COMMIT');
} catch (chyba) {
  db.exec('ROLLBACK');
  throw chyba;
}
```

Buď celá, nebo vůbec. Typicky: odečíst sklad + založit objednávku, převod mezi účty,
import dávky dat.

## Indexy a výkon

```sql
CREATE INDEX idx_orders_customer ON orders(customer_id, status);
EXPLAIN QUERY PLAN SELECT …;     -- SQLite
EXPLAIN ANALYZE SELECT …;        -- PostgreSQL
```

- **Zrychlí** hledání, řazení a spojování podle sloupců v indexu.
- **Zpomalí** každý zápis a zabírá místo.
- **Nepoužije se**, když je sloupec obalený funkcí (`date(starts_at) = …`) nebo se hledá `LIKE '%text'`.
  Přepiš na rozsah: `starts_at >= '2026-03-14' AND starts_at < '2026-03-15'`.
- **Problém N+1:** stejný `SELECT` stokrát jen s jiným `id`. Řeš jedním `JOIN` nebo `WHERE id IN (…)`.

## Okenní funkce

```sql
SELECT mesto, email, spent,
       ROW_NUMBER() OVER (PARTITION BY mesto ORDER BY spent DESC) AS poradi,
       SUM(spent)   OVER (PARTITION BY mesto)                     AS mesto_celkem,
       LAG(spent)   OVER (ORDER BY mesic)                         AS minule
FROM utraty;
```

- `GROUP BY` řádky **sloučí**, okno je **nechá** a přidá sloupec.
- `ROW_NUMBER` 1,2,3,4 · `RANK` 1,2,2,4 · `DENSE_RANK` 1,2,2,3.
- Filtrovat okno ve `WHERE` nejde — obal dotaz do `WITH` nebo poddotazu a filtruj nad ním.

## Node a SQLite

```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON');        // bez tohohle se cizí klíče nehlídají!
db.prepare('SELECT * FROM products WHERE category = ?').all('čaj');
db.prepare('SELECT … WHERE id = ?').get(1);
const { lastInsertRowid, changes } = db.prepare('INSERT …').run(a, b);
```

**Hodnoty vždycky parametrem `?`**, nikdy skládáním řetězce — jinak SQL injection.

## SQLite → PostgreSQL

| SQLite | PostgreSQL |
|---|---|
| `INTEGER PRIMARY KEY` | `GENERATED ALWAYS AS IDENTITY` |
| `?` | `$1`, `$2`, … |
| soubor nebo `:memory:` | connection string a fond spojení |
| volné typy | typy se dodržují, `BOOLEAN`, `TIMESTAMPTZ`, `NUMERIC` |
| `substr`, `datetime('now')` | `substring`, `now()` |

## Pasti a časté chyby

- **`REAL` na peníze** — po stovkách součtů sedí výsledek o haléře jinak.
- **Vypnuté cizí klíče v SQLite** — nic se neohlásí, nekonzistence se najde až v datech.
- **Aktuální cena místo historické** — po zdražení se přepíšou i loňské tržby. Ukládej `unit_price` k položce.
- **`COUNT` po spojení 1:N** — počítá řádky, ne objednávky.
- **Podmínka na `LEFT JOIN` ve `WHERE`** — potichu z něj udělá vnitřní spojení.
- **Soft delete bez filtru** — smazané řádky se objeví tam, kde nemají.
- **Index na všechno** — zápis zpomalí a většina indexů se stejně nepoužije.
