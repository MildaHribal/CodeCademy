# Akademie — design

**Datum:** 2026-09-13 · **Nahrazuje:** výukovou hru `~/arkada` (zůstává jako záloha a zdroj látky)

## Cíl

Interaktivní kurz webového vývoje ve stylu freeCodeCamp, ne hra. Uživatel se
dostane od úplných základů k tomu, že zvládne vlastní projekty. Jádro kurzu a
největší hloubka jsou JavaScript a CSS. Pokrývá i HTML a přístupnost, prohlížeč
a asynchronní JS, nástroje (Git, npm, Vite, DevTools, TypeScript, testy) a nakonec
framework a backend (Vue, Nuxt, Node, REST, SQL, autentizace, nasazení).

## Rozhodnutí (schválená uživatelem)

| otázka | rozhodnutí |
|---|---|
| kde se píše kód | editor v prohlížeči pro lekce, workshopy a laby; VS Code a disk pro projekty |
| rozsah | HTML+a11y, CSS, JS, DOM/async/fetch, nástroje, framework+backend |
| stará Arkáda | nový adresář `~/akademie`, `~/arkada` se nemění |
| běh | jen lokálně na PC |
| jazyk | výklad česky, identifikátory v kódu anglicky |
| herní prvky | žádné (bez XP, příběhu, povyšování); jen postup a splněné sekce |
| postup práce | platforma + pilotní sekce → kontrolní bod s uživatelem → obsah ve vlnách |

## Architektura

- **Obsah** je oddělený od platformy: `content/<sekce>/<modul>/` s Markdown soubory
  ve formátu podobném freeCodeCampu (popis, nápovědy s testy, seed, řešení).
  Parser a načítání jsou ve `shared/`.
- **Klient**: Vite + vanilla JS + CodeMirror 6. Obrazovky: přehled osnovy, sekce,
  lekce, krok workshopu (zadání | editor | náhled a konzole), lab, kvíz, projekt.
- **Runner v prohlížeči** spouští testy pro runtime `dom`, `js`, `vue` v iframech.
- **Server**: Node bez frameworku. API pro osnovu, postup (JSON soubor),
  spouštění `node` testů v dočasném adresáři a kontrolu projektů na disku.
- **Verify** (`npm run overit`): pro každý krok, lab a projekt ověří v Playwrightu,
  že výchozí kód testy neprojde a referenční řešení projde. Brána kvality obsahu.

Podrobné formáty, rozhraní a API jsou v `docs/kontrakt.md`, pravidla psaní
obsahu v `docs/styl-obsahu.md`.

## Osnova (hrubě)

1. **Web a CSS:** jak funguje web, HTML, sémantika a formuláře, přístupnost,
   základy CSS, flexbox, grid, pozicování, responzivita, moderní CSS, animace.
2. **JavaScript:** základy, pole a objekty, funkce do hloubky, funkcionální styl
   a datové struktury, třídy a prototypy, chyby a regex, DOM a události, async
   a fetch, prohlížečová API.
3. **Nástroje:** terminál a Git, npm, moduly a Vite, DevTools, TypeScript, testování.
4. **Framework a backend:** Vue 3, Nuxt, Node a HTTP, REST API, SQL, autentizace
   a bezpečnost, nasazení.

Detailní osnova vzniká v první vlně jako `docs/osnova.md`.

## Chybové stavy

- Neplatný obsah: verify selže s cestou a řádkem; API vrátí 500 s českou zprávou
  a UI ukáže, který modul je rozbitý, zbytek osnovy funguje.
- Uživatelův kód spadne: chyba se ukáže v konzoli náhledu, testy selžou s textem,
  aplikace běží dál. Nekonečná smyčka: timeout testu (iframe se zahodí, proces se zabije).
- Poškozený `progress.json`: server ho přejmenuje na `.broken-<čas>` a začne s prázdným.

## Testování

- `npm test`: unit testy parseru, načítání obsahu, serveru a node-runneru.
- `npm run overit`: obousměrné ověření veškerého obsahu.
- E2E průchod UI v Playwrightu po integraci (lekce, krok, lab, kvíz, projekt).

## Mimo rozsah (YAGNI)

Uživatelské účty, nasazení na web, mobilní verze, AI code review, certifikáty,
žebříčky, synchronizace mezi zařízeními.
