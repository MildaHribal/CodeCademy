# Akademie — vlna 1: platforma a pilotní sekce

> **For agentic workers:** Tento plán se vykonává paralelními agenty přes Workflow.
> Každý agent dostane jeden úkol a výhradní adresáře. Kroky používají checkboxy (`- [ ]`).

**Goal:** Funkční lokální aplikace Akademie se třemi pilotními sekcemi, které projdou `npm run overit`.

**Architecture:** Obsah v Markdownu (`content/`) → `shared/` parser → Node server (API, postup, node-runner) + Vite klient (CodeMirror, prohlížečový runner). Verify v Playwrightu ověřuje obsah obousměrně.

**Tech Stack:** Node 26, Vite 8, CodeMirror 6, marked 18, Vue 3.5 (vendor), Playwright 1.63.

**Spec:** `docs/superpowers/specs/2026-09-13-akademie-design.md` · **Kontrakt:** `docs/kontrakt.md` · **Styl obsahu:** `docs/styl-obsahu.md`

## Global Constraints

- Node ≥ 22, ES moduly, žádný TypeScript v platformě, žádné nové závislosti.
- Server poslouchá na `127.0.0.1`, výchozí port 4300; Vite dev 5300.
- UI texty česky, identifikátory anglicky.
- Nikde žádná zmínka o AI/Claude/asistentovi.
- Agenti: jen vlastní adresáře, žádné `pkill node`, žádné commity, porty z přiděleného rozsahu.

## Hotovo předem (koordinátor)

- [x] `package.json`, závislosti, `vite.config.js`, `start.sh`, `.gitignore`
- [x] `shared/parse.js` + `shared/content.js` + `shared/parse.test.js` (8 testů prochází)
- [x] `docs/kontrakt.md`, `docs/styl-obsahu.md`, výchozí `content/osnova.json`

---

### Task 1: Server (`server/`) — porty 4310–4319

**Interfaces:**
- Consumes: `loadCurriculum`, `loadModule`, `readTextTree` ze `shared/content.js`
- Produces: `createApp(opts) → http.Server` (`server/app.js`), `server/index.js` (main),
  `runNodeTests`, `runNodeFile` (`server/node-runner.js`), HTTP API dle kontraktu kap. 7–9

- [ ] `server/progress.js` — načtení/uložení `progress.json` (atomický zápis, poškozený soubor → `.broken-<čas>`), operace complete/reset/code; unit testy `server/progress.test.js`
- [ ] `server/node-runner.js` — dočasný adresář, proces na test, globály dle kap. 6.6, timeout se zabitím celé skupiny procesů, úklid; unit testy (projde, selže, timeout, `helpers.run`, `startServer` + `fetch`, `importFile`)
- [ ] `server/app.js` — routy kap. 7, statika `dist/` + SPA fallback, `/vendor/vue.esm-browser.js`, JSON chyby; testy přes `createApp` na volném portu nad fixture obsahem v `server/test-fixtures/`
- [ ] `server/index.js` — `PORT`, `127.0.0.1`, cesty k `content/`, `data/`, `moje-projekty/`, `dist/`
- [ ] Ověření: `node --test "server/**/*.test.js"` projde

### Task 2: Runner a verify (`client/src/runner/`, `client/runner.html`, `tools/`) — porty 4320–4339

**Interfaces:**
- Consumes: `POST /api/run-node` (Task 1), `createApp` (Task 1) pro verify, `listModules`/`loadModule`
- Produces: `runTests(request) → RunResult`, `mountPreview(container, {runtime, files})`, `window.akademieRunner`, `tools/verify.js`

- [ ] Skládání stránky pro `dom`/`vue`/`js` (kap. 6.3–6.5), zachycení konzole a chyb
- [ ] Běh jednoho testu v čerstvém iframu s timeoutem, `assert` shim, `helpers` (kap. 6.2–6.3)
- [ ] `mountPreview` pro živý náhled s debounce aktualizací a konzolí
- [ ] `client/runner.html` vystaví `window.akademieRunner`
- [ ] Testovací sada runneru v Playwrightu `tools/runner.test.js` (každý helper, timeout nekonečné smyčky, chyba v uživatelově kódu, media query přes `resize`)
- [ ] `tools/verify.js` dle kap. 10 (soběstačný: build klienta + `createApp` na volném portu + Playwright)
- [ ] Ověření: `node --test "tools/**/*.test.js"` projde; `npm run overit` nad fixture obsahem

### Task 3: UI (`client/` kromě `src/runner/` a `runner.html`) — porty 4340–4359, Vite 5340–5359

**Interfaces:**
- Consumes: HTTP API (Task 1), `runTests`, `mountPreview` (Task 2)
- Produces: `client/index.html`, SPA s hash routerem

- [ ] Router (`#/`, `#/sekce/:s`, `#/modul/:s/:m`, `#/modul/:s/:m/:krok`), API klient, stav postupu
- [ ] Přehled osnovy (části → sekce, postup, „Pokračovat"), detail sekce (moduly s typem, minutami, stavem)
- [ ] Obrazovka kroku: zadání + nápovědy se stavem | CodeMirror se záložkami souborů a zvýrazněnou oblastí `--edit--` | náhled + konzole; Zkontrolovat (Ctrl+Enter), Obnovit krok, další krok; ukládání rozpracovaného kódu
- [ ] Lab (stejná obrazovka, nápovědy jako seznam požadavků), lekce (markdown + editovatelné živé ukázky + otázky), kvíz (zamíchané odpovědi, vyhodnocení s `why`), projekt (start, cesta, `code <cesta>`, kontrola)
- [ ] Vizuální styl: čitelný, klidný, tmavý editor; responzivní od 1024 px (mobil mimo rozsah, ale nesmí se rozpadnout)
- [ ] Ověření: `npx vite build` projde bez chyb

### Task 4: Osnova (`docs/osnova.md`, `content/osnova.json`)

- [ ] Detailní osnova 4 částí: sekce v pořadí, u každé cíle („po sekci umíš…"), seznam modulů (typ, slug, název, co učí), předpoklady; projekty na konci celků
- [ ] Vytěžit `~/arkada/docs/*.md` a `~/arkada/tikety/*/` (jen číst)
- [ ] `content/osnova.json`: všechny sekce, pilotní (`css-flexbox`, `js-pole`, `node-zaklady`) jako slugy na svém místě, ostatní jako objekty `{id,title,summary}`
- [ ] Ověření: `node -e` s `loadCurriculum('content')` projde

### Task 5–7: Pilotní sekce (`content/css-flexbox/`, `content/js-pole/`, `content/node-zaklady/`)

- [ ] Task 5 `css-flexbox` (runtime `dom`): lekce, workshop 20–30 kroků, lab, kvíz 10+ otázek
- [ ] Task 6 `js-pole` (runtime `js` + jeden `dom` krok s DOM výpisem): lekce, workshop 20–30 kroků, lab, kvíz
- [ ] Task 7 `node-zaklady` (runtime `node`): lekce, workshop 8–12 kroků (moduly, `fs`, jednoduchý HTTP server), projekt ve VS Code (`starter/`, `solution/`, testy přes `startServer`), kvíz
- [ ] Ověření: `loadModule` projde pro každý modul; po integraci `npm run overit -- content/<sekce>` bez chyb

### Task 8: Integrace (po 1–7)

- [ ] `npm test`, `npx vite build`, `npm run overit` — opravit chyby platformy; chyby obsahu vrátit autorům sekcí
- [ ] E2E v Playwrightu nad `./start.sh`: lekce (upravit ukázku, otázky), krok workshopu (špatně → testy červené, správně → zelené, další krok), lab, kvíz, projekt (start, kontrola s řešením zkopírovaným do adresáře projektu), postup přežije restart
- [ ] `ZACNI-TADY.md`

### Task 9: Review

- [ ] Nezávislé review platformy (bugy, bezpečnost node-runneru, robustnost) a didaktické review pilotních sekcí proti `docs/styl-obsahu.md`; opravy
