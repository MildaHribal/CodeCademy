# Vařečka — API receptů

JSON API pro sdílení receptů: výpis s filtry a stránkováním, detail receptu
i s ingrediencemi, zakládání receptů, hodnocení a žebříčky. Data drží SQLite
přes vestavěný modul `node:sqlite`, projekt nemá žádné závislosti.

Celé zadání s uživatelskými příběhy najdeš v Akademii u projektu.

## Spuštění

```sh
npm start        # jednou
npm run dev      # s restartem po každém uložení
```

Nic se neinstaluje. Server poslouchá na portu z proměnné `PORT`, bez ní na `3000`.

Databáze je **v paměti**: při startu se založí ze `schema.sql` a naplní ze `seed.sql`.
Po restartu je zase jako nová — díky tomu se dá bez obav zkoušet i mazání a zakládání.

## Soubory

| soubor | co v něm je |
|---|---|
| `schema.sql` | tabulky, omezení, cizí klíče a indexy |
| `seed.sql` | testovací data |
| `db.js` | otevře databázi, zapne cizí klíče a pustí schéma a seed |
| `queries.js` | dotazy — tady žije všechno SQL |
| `server.js` | HTTP: rozcestník, kontrola vstupů a překlad chyb na stavové kódy |
| `package.json` | skripty `start` a `dev` |

## Endpointy

| požadavek | odpověď |
|---|---|
| `GET /api/recipes` | stránka výpisu: `{ page, per_page, total, total_pages, items }` |
| `GET /api/recipes/:slug` | detail receptu s ingrediencemi a hodnoceními |
| `POST /api/recipes` | `201` a detail nového receptu, hlavička `Location` |
| `POST /api/recipes/:slug/ratings` | `201`, nové hodnocení a přepočítaný průměr |
| `GET /api/ingredients` | ingredience a v kolika receptech jsou |
| `GET /api/rankings` | dva nejlépe hodnocené recepty v každé kategorii |
| `GET /api/stats` | souhrn za každou kategorii |

Filtry výpisu: `category` (slug kategorie), `max_minutes`, `q` (kus názvu),
`page` a `per_page`. Přesné tvary odpovědí a chybové kódy jsou v zadání.

Každá chyba má tělo `{ "error": { "code": "…", "message": "…" } }`.

## Jak API zkoušet

```sh
curl -s localhost:3000/api/recipes | head -c 400
curl -s "localhost:3000/api/recipes?category=polevky&per_page=2"
curl -s localhost:3000/api/recipes/svickova

curl -s -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"slug":"bramborovy-salat","title":"Bramborový salát","category":"salaty",
       "minutes":60,"servings":6,"difficulty":"stredni",
       "instructions":"Brambory uvař ve slupce a smíchej s majonézou.",
       "ingredients":[{"name":"brambory","amount":1000,"unit":"g"}]}'

curl -s -X POST localhost:3000/api/recipes/svickova/ratings \
  -H 'Content-Type: application/json' \
  -d '{"author":"karel","stars":5,"comment":"Nedělní klasika."}'
```

Do databáze se dá koukat i přímo z terminálu:

```sh
node --input-type=module -e "
  const { openDb } = await import('./db.js');
  console.log(openDb().prepare('SELECT slug, title FROM recipes').all());
"
```

## Rozhodnutí

**Integritu hlídá databáze, ne jen server.** Povinné hodnoty, jedinečný slug,
rozsah hvězdiček i rozsah množství jsou v `schema.sql` jako `NOT NULL`, `UNIQUE`
a `CHECK` a tabulky jsou `STRICT`. Server tytéž věci kontroluje taky, ale jen proto,
aby uživateli odpověděl srozumitelnou hláškou místo `500`. Kdyby se někdo do databáze
dostal jinudy (skriptem, ručně, druhou aplikací), pravidla platí dál.

**`ON DELETE` podle toho, co dává smysl v kuchyni.** Smazaný recept odnese svoje
ingredience i hodnocení (`CASCADE`), protože samy o sobě nic neznamenají. Kategorii
s recepty a ingredienci, která je v nějakém receptu, smazat nejde (`RESTRICT`) —
tichá ztráta receptů by byla horší než chybová hláška.

**Data v paměti.** Databáze se při startu založí ze `schema.sql` a `seed.sql`.
Pro kurzovní projekt je to výhoda: každý restart je čistý stůl. Skutečná aplikace
by místo `':memory:'` dostala cestu k souboru a `seed.sql` by se pouštěl jen jednou.
