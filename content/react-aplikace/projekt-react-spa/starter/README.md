# Plánovač jídel a nákupů

SPA ve Vite + React + TypeScript nad přiloženým API. Vybíráš recepty, skládáš
z nich týdenní plán a aplikace ti z plánu odvodí nákupní seznam.

## Jak to spustit

Potřebuješ **dva terminály**:

```sh
npm install
npm run api     # API na http://localhost:3001 (první terminál)
npm run dev     # aplikace na http://localhost:5173 (druhý terminál)
```

Dev server posílá všechno z `/api` na port 3001 (nastavené v `vite.config.ts`),
takže se aplikace i API tváří jako stejný původ a cookie s přihlášením funguje
bez CORS.

Zkušební účet: **eva@example.com** / **kvasnice**

## Příkazy

| příkaz | co dělá |
|---|---|
| `npm run dev` | vývojový server |
| `npm run api` | API (data drží v paměti, restartem se vrátí na začátek) |
| `npm test` | testy ve Vitestu |
| `npm run typecheck` | kontrola typů datové vrstvy (`src/lib`) |
| `npm run build` | produkční build do `dist/` |
| `npm run preview` | náhled produkčního buildu |

## Co je hotové a co ne

Hotové (needituj, jen používej):

- `server/` — celé API. Endpointy jsou v `server/index.js`.
- `src/lib/types.ts` — typy, které drží celý projekt pohromadě.
- `src/api/endpoints.ts` — mapa API; každá funkce volá `apiFetch`.
- `src/hooks/useCurrentUser.ts` — vzorový hook „kdo jsem". Ostatní hooky piš podle něj.
- `src/components/Layout.tsx`, `src/routes/NotFound.tsx`, `src/styles.css`.

Tvoje práce:

- `src/lib/recipes.ts`, `src/lib/plan.ts`, `src/lib/shopping.ts` — čistá logika bez Reactu.
- `src/api/client.ts` — `apiFetch`.
- `src/hooks/useFavourites.ts`, `src/hooks/usePlan.ts`.
- `src/components/` — `RecipeCard`, `FavouriteButton`, `RequireAuth`.
- `src/routes/` — `RecipeList`, `RecipeDetail`, `PlanPage`, `ShoppingPage`, `LoginPage`.
- vlastní testy (aspoň dva soubory).

## API

| metoda a adresa | co vrací | potřebuje přihlášení |
|---|---|---|
| `GET /api/recipes` | pole receptů | ne |
| `GET /api/recipes/:id` | jeden recept, jinak `404` | ne |
| `POST /api/login` | uživatele a nastaví cookie `session` | ne |
| `POST /api/logout` | `204` a zruší cookie | ne |
| `GET /api/me` | přihlášeného uživatele, jinak `401` | ano |
| `GET /api/favourites` | pole id oblíbených receptů | ano |
| `PUT /api/favourites/:id` | nové pole id | ano |
| `DELETE /api/favourites/:id` | nové pole id | ano |
| `GET /api/plan` | plán jako `{ den: [id receptů] }` | ano |
| `PUT /api/plan` | uložený plán | ano |

Chybová odpověď má vždycky tvar `{ "error": "česká věta" }`.

## Poznámka k Vite a Reactu

Vite umí JSX i TypeScript sám, proto tu není žádný plugin. Rychlé obnovení bez
ztráty stavu (*Fast Refresh*) přidává oficiální `@vitejs/plugin-react` — až si
projekt vezmeš do portfolia, doinstaluj ho a zapiš do `vite.config.ts`.
Kontrola typů (`npm run typecheck`) běží nad `src/lib`, tedy nad logikou bez
Reactu; komponenty hlídá editor.
