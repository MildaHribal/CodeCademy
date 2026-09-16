# Bazárek

Sousedský bazar v Next.js 16: seznam inzerátů, detail, přidání inzerátu formulářem
se serverovou akcí, přihlášení e-mailem a role `admin`. Data leží v SQLite, o schéma
se stará Drizzle.

## Jak to spustit

```sh
npm install
cp .env.example .env.local        # a doplň vlastní BETTER_AUTH_SECRET
npm run db:generate && npm run db:migrate
npm run dev                       # http://localhost:3000
```

Kontrola před odevzdáním:

```sh
npm run lint
npm run typecheck
npm test                          # Vitest nad logikou v lib/
npm run build
npm run test:e2e                  # Playwright proti produkčnímu buildu
```

## Co kde je

| složka | co v ní je |
|---|---|
| `app/` | stránky, layout, stavy načítání a chyb, route handler přihlášení |
| `lib/pravidla.ts`, `lib/schemata.ts` | čistá logika bez Next.js — kdo co smí a co je platný vstup |
| `lib/data.ts` | čtení z databáze, uložené v cache pod značkou `inzeraty` |
| `lib/akce.ts` | serverové akce: validace, autorizace, zápis, revalidace |
| `proxy.ts` | rychlé přesměrování nepřihlášeného z `/moje` a `/inzeraty/novy` |

## Rozhodnutí

**Serverové akce místo vlastního API.** Formuláře v aplikaci volá jen tahle
aplikace, takže by `route.ts` navíc znamenal adresu, `fetch`, `JSON.stringify`
a ztrátu chování bez JavaScriptu. Route handler zůstal jediný — pro přihlášení,
které skutečné adresy HTTP potřebuje.

**Pravidla v čisté funkci.** `smiUpravit` a `smiSmazat` nevědí nic o databázi ani
o Next.js, takže se dají otestovat Vitestem za milisekundy a pravidlo je na jednom
místě. Stránka podle nich jen skrývá tlačítko; akce je volá znovu, protože skryté
tlačítko není ochrana.

**SQLite a Drizzle.** Aplikace běží na jednom stroji a data se vejdou do souboru.
Drizzle drží schéma v TypeScriptu, takže typ záznamu vzniká ze schématu a nemůže
se s ním rozejít. Kdyby přibyl druhý server, mění se jen `lib/db.ts`.

**Cache jen na veřejné čtení.** `vsechnyInzeraty` a `najdiInzerat` mají `'use cache'`
se značkou `inzeraty`; `inzeratyUzivatele` ne, protože to jsou osobní data. Každá
akce končí `updateTag('inzeraty')`, aby autor viděl svoji změnu hned.

## Nasazení

Produkční build běží v kontejneru podle `Dockerfile` (režim `output: 'standalone'`),
databáze je připojený svazek s `data/bazarek.db`. CI v `.github/workflows/ci.yml`
pouští lint, kontrolu typů, testy a build nad každým pushem.

Proměnné prostředí: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
a veřejná `NEXT_PUBLIC_URL`. Tajemství nejsou v repozitáři, vzor je v `.env.example`.

## Co bych udělal jinak

Stav `uzamceno` dnes nastavuje jen admin ručně. Příště bych rezervaci udělal jako
vlastní tabulku s platností — takhle se do jednoho sloupce postupně schovává
příliš mnoho významů.
