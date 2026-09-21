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
| `schema.sql` | **tvoje práce** — tabulka `categories` je hotová jako vzor, zbylé čtyři dopiš |
| `seed.sql` | testovací data; **neměň ho**, testy se o něj opírají |
| `db.js` | **tvoje práce** — otevře databázi a pustí schéma a seed |
| `queries.js` | **tvoje práce** — dotazy, tady žije SQL |
| `server.js` | **tvoje práce** — HTTP, kontrola vstupů a chyby; rozcestník máš hotový |
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

## Kontrola

V Akademii u projektu klikni na **Zkontrolovat**. Testy spustí `server.js`
na volném portu, projdou uživatelské příběhy a část z nich se podívá i rovnou
do databáze přes `openDb()` z `db.js`.
