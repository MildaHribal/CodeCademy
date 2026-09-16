# Akademie: předávací prompt pro dokončení kurzu

> Tenhle dokument je zadání pro agenta (nebo tým agentů), který dokončí projekt Akademie.
> Přečti ho celý, než začneš cokoli měnit. Všechno, co tu stojí, platí; když se něco
> rozchází s kódem, platí dokumenty v `docs/` a rozpor nahlas uživateli.

---

## 0. AKTUÁLNÍ ZADÁNÍ (platí přednostně, 16. 9. 2026)

**Tvoje sekce — a jen tyhle.** Do ostatních adresářů v `content/` NESAHEJ, souběžně na nich
pracuje druhý nástroj a přepsali byste si práci. Piš je v tomhle pořadí:

1. `html-zaklady` — HTML a jak funguje web
2. `start-nastroje` — VS Code, terminál, první repozitář a nasazení (+ lekce `jak-se-ucit-v-akademii`)
3. `html-formulare` — formuláře
4. `html-pristupnost` — přístupnost
5. `nastroje-git-terminal` — Git a terminál pokročile
6. `nastroje-moduly-vite` — npm, moduly, Vite, lint a formát
7. `nastroje-devtools-vykon` — DevTools a výkon webu
8. `nastroje-testovani` — testování (Vitest, Playwright, MSW)
9. `nastroje-cizi-kod` — orientace v cizím kódu, PR a code review
10. `prace-s-ai` — jak používat AI a nespolehnout se na ni
11. `js-algoritmy` — řešení problémů, Big O, pohovorové úlohy
12. `kariera-pohovor` — portfolio, CV, pohovor

**Sekce, které dělá druhý nástroj a jsou zakázané:** `nastroje-typescript`, `react-zaklady`,
`react-hloubka`, `react-ui-knihovny`, `react-aplikace`, `next-fullstack`, a dále všechny
`css-*`, `js-*` (kromě `js-algoritmy`) a `node-zaklady` — ty už jsou hotové a zrecenzované,
ber je jako vzor a odkazuj na ně.

**Pořadí modelů:** začni na Gemini 3.8 Flash. Když sekce neprojde kontrolou kvality (níž)
ani po druhém pokusu, přepni na Gemini 3.1 Pro. Když neprojde ani tam, nech ji rozpracovanou
a napiš, že potřebuje Claude Opus.

**Kontrola kvality — povinná po KAŽDÉ sekci, bez výjimky:**

```sh
cd /home/karel/akademie
npm run overit -- --concurrency 2 content/<sekce>
```

Musí vyjít **0 chyb a 0 varování**. Teprve pak je sekce hotová. Do zprávy uživateli vždy
vypiš přesný výstup téhle kontroly.

**Co se minule nepovedlo a nesmí se opakovat** (skutečné nálezy z předchozího běhu):

- Workshopy vygenerované skriptem se zástupným textem (popis „Text", test `a === 2`,
  řešení `let a = 2`, tipy „Nějaký tip"). **Nikdy negeneruj kroky skriptem.** Každý krok
  se píše ručně a učí jednu konkrétní věc.
- Testy v cizím formátu (`describe`, `it`, `import './main.js'`, `assert.isNotNull`).
  Testy jsou tělo async funkce s `assert` podle kap. 6 kontraktu — jiný formát runner nespustí.
- Prázdný seed a řešení (`// kód...`).
- České identifikátory v kódu (`teplotaFahrenheit`). Kód anglicky, texty česky.
- Pomocné skripty zapomenuté v `content/` (`generate_workshops.js`, `fix_all.js`…).
- Smazaná cizí práce. Když něco vypadá jako omyl, napiš to, nemaž to.
- **Rozepsaná sekce shodí aplikaci**, pokud má `section.json` se seznamem modulů, které ještě
  nemají `module.json`. Dokud sekci nedokončíš, drž soubor pojmenovaný `section.json.wip`
  a přejmenuj ho na `section.json` až na konci.
- Řádek konzole nikdy neporovnávej přes `===` se syrovým textem. Neviditelný rozdíl
  (rozložené `č`, pevná mezera) pak odmítne správné řešení. Použij:
  `const sameLine = (a) => a.normalize('NFC').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();`

**Postup u jedné sekce** je v kapitole 5: nejdřív autor, pak druhý průchod jako nezávislý
recenzent (jiný agent, který zkusí 2–3 jiná správná a 2–3 typicky chybná řešení přes runner).
Teprve pak commit.

**Hlas průběžně,** která sekce je hotová a jaký měla výsledek kontroly. Práci po tobě kontroluje
druhá strana a nekvalitní sekce se přepisují od nuly, takže se vyplatí psát pomaleji a pořádně.

---

## 1. O co jde

**Akademie** je lokální interaktivní kurz webového vývoje ve stylu freeCodeCamp — **ne hra**.
Běží na počítači uživatele, výklad je **česky**, identifikátory v kódu **anglicky**.

**Student (jediný uživatel):** junior, dosud stavěl weby s pomocí AI a neumí vysvětlit, proč
fungují. Chce se naučit **doopravdy**, **co nejrychleji** a **aby ho to bavilo**. Hlavně
JavaScript a CSS do hloubky. Cíl: dělat vlastní projekty s dokonalým designem, animacemi
a efekty a sehnat práci jako frontend/fullstack vývojář. Práci bude hledat až po kurzu.

**Stav:** platforma je hotová a otestovaná (525+ testů). Hotové a zrecenzované jsou jen
**3 pilotní sekce** z ~48. Tvým hlavním úkolem je **dopsat všechny ostatní sekce** ve stejné
kvalitě jako piloty, pak zlepšit navigaci, design a udělat průřezovou kontrolu.

### Rozhodnutí uživatele (závazná)

| téma | rozhodnutí |
|---|---|
| forma | interaktivní kurz, ne hra — žádné XP, body, příběh, povyšování |
| zamykání | **nic se nezamyká**, student smí otevřít cokoli |
| editor | lekce, workshopy, laby a kvízy v prohlížeči; velké projekty ve VS Code na disku |
| framework | **React + Next.js** hlavní; Vue/Nuxt jen volitelné rozšíření |
| AI | kurz smí AI učit jako **téma** jen v sekcích `prace-s-ai` a `start-nastroje`; jinde v obsahu, kódu, komentářích ani commitech **žádné zmínky o AI** |
| AI v aplikaci | **žádné** tlačítko „vysvětli chybu přes AI"; pomáhají deterministické tipy, české chyby a porovnání s řešením |
| výklad | **střídmě barevný**: rámečky Zapamatuj si / Pozor, past / Tip / Poznámka, tučné v akcentu, podbarvený inline kód — ale ne přeplácaný |
| design | chce „dokonalý web s animacemi a cool efekty" — kurz musí učit Tailwind, GSAP, Motion, Lenis, View Transitions, Three.js, shadcn/ui |
| běh | jen lokálně na PC |
| **pořadí práce** | **1) dopsat všechny sekce — nejdřív celý JavaScript**, 2) každá sekce a lekce jde samostatně otevřít (i nenapsaná), 3) až potom redesign a zbytek |

---

## 2. Projekt

- **Cesta:** `/home/karel/akademie` (git repozitář, větev `main`)
- **Spuštění pro studenta:** `./start.sh` → http://localhost:4300
- **Vývoj:** `npm run dev` (Vite na 5300, proxy na server 4300 — server spusť zvlášť `PORT=4300 node server/index.js`)
- **Node:** 26, ES moduly, žádný TypeScript v platformě

### Adresáře

```
akademie/
├── content/                 ← OBSAH KURZU (tady je většina tvé práce)
│   ├── osnova.json          ← části, sekce, úrovně, doporučená trasa
│   └── <sekce>/             ← section.json, cards.md, pojmy.md, tahak.md, moduly
│       └── <modul>/         ← module.json + lesson.md | steps/NNN.md | lab.md | quiz.md | project.md+starter/+solution/
├── shared/                  ← parser obsahu (parse.js), načítání (content.js), kotvy, odpovědi, diff
├── server/                  ← Node HTTP server bez frameworku, routy v server/routes/*.js (načítají se samy)
├── client/                  ← Vite + vanilla JS + CodeMirror 6
│   └── src/runner/          ← běh testů v sandboxovaném iframu, ochrana smyček
├── tools/                   ← verify.js (npm run overit), e2e.js, testy
├── docs/                    ← ZDROJE PRAVDY (viz níže)
├── data/                    ← postup studenta (gitignore) — NEMAZAT
└── moje-projekty/           ← projekty studenta (gitignore) — NEMAZAT
```

### Zdroje pravdy — přečti před prací

| soubor | co v něm je | kdy číst |
|---|---|---|
| `docs/kontrakt.md` | přesné formáty obsahu, výstupy parseru, test API runneru, HTTP API, datové soubory, kódy kontrol verify (kap. 10), pravidla (kap. 11) | vždy |
| `docs/styl-obsahu.md` | **jak psát obsah**: povinná a doporučená pravidla, počty, kap. 16 kontrolní seznam, kap. 17 poučení z pilotů, kap. 18 aby to bavilo | vždy při psaní obsahu — CELÉ |
| `docs/osnova.md` | kompletní osnova: každá sekce má cíl „Po sekci umíš", předpoklady, hodiny a moduly v pořadí s tím, co přesně učí | vždy při psaní sekce |
| `docs/platforma.md` | rozšiřovací body klienta a serveru (registry, sloty, události), vlastnictví souborů | při práci na platformě |
| `docs/superpowers/specs/2026-09-14-akademie-vylepseni-navrh.md` | schválený návrh vylepšení (proč jsou formáty takové) | kontext |
| `docs/superpowers/specs/2026-09-15-navrhy-ui-zabava.md` | návrhy UI z výzkumu motivace | úkol F |
| `ZACNI-TADY.md` | návod pro studenta | úkol G |

### Vzor kvality — hotové pilotní sekce

Tyhle tři sekce prošly autorem, integrací a dvěma recenzemi. **Každá nová sekce má mít
stejnou hloubku a všechny prvky.** Než napíšeš první řádek, projdi si je:

- `content/js-pole/` — nejlepší vzor: lekce `co-je-pole`, workshop `workshop-nakupni-seznam` (33 kroků s recall/choose/debug/parsons), `metody-pole-do-hloubky`, dva laby, kvíz, `cards.md`, `pojmy.md`, `tahak.md`, `section.json` s `outcomes`
- `content/css-flexbox/` — CSS: `controls` (posuvníky), `:::compare`, předpovědi rozměrů v px, layout testy, `helpers.resize`
- `content/node-zaklady/` — runtime `node`: lekce s `:::live node predict`, workshop HTTP serveru, projekt ve VS Code

---

## 3. Aktuální stav (commit `b1912bb`)

### Hotové a zrecenzované (neměnit, jen při průřezové kontrole)
`css-flexbox`, `js-pole`, `node-zaklady`

### Rozpracované z přerušených běhů — NEZRECENZOVANÉ
Poslední commit `b1912bb` je **WIP**. Tyto adresáře vznikly v přerušených bězích a můžou být
neúplné, nekonzistentní nebo nesplňovat pravidla. **Zkontroluj je a buď dokonči, nebo přepiš.**
Nic z nich neber jako hotové.

| sekce | co je na disku |
|---|---|
| `js-objekty` | section.json, pojmy.md, 7 modulů (lekce, 3 workshopy, lab, kvíz) — nejdál |
| `js-funkce-hloubka` | section.json, adresáře 8 modulů, obsah jen částečný |
| `js-dom` | section.json, pojmy.md, lekce `strom-dom` |
| `js-async` | section.json, lekce `event-loop` |
| `js-funkce`, `js-retezce-cisla`, `js-chyby-ladeni` | jen pár souborů |
| `css-box-model` | section.json, pojmy.md, 9 modulů, obsah částečný |
| `css-zaklady` | section.json, adresáře 12 modulů, obsah minimální |
| `html-pristupnost` | section.json, jedna lekce |
| `prohlizec-navic`, `api-soubory-realtime` | section.json / adresáře modulů, obsah minimální |
| `css-responzivita`, `css-design`, `css-animace`, `vue-nuxt-druhy-framework` | jen prázdné nebo jednosouborové začátky |

Pozor: sekce se `section.json` se v aplikaci ukazuje jako dostupná. Když nějakou rozpracovanou
nestihneš dokončit, dočasně z ní `section.json` přesuň (např. `section.json.wip`), ať student
neotvírá rozbitou sekci.

### Rozpracovaný runtime knihoven a Reactu — NEDOKONČENÝ
V commitu `b1912bb` jsou rozdělané změny runneru (`client/src/runner/vendor-libs.js`,
`jsx-transform.js`, `server/routes/vendor.js`, `tools/build-vendor.js`, úpravy `compose.js`,
`preview.js`, `run-tests.js`, `node-runner.js`, `shared/parse.js`, `start.sh`, testy
v `tools/runner.test.js`). `npm test` s nimi prochází (548 testů), ale funkce nejsou
dokončené ani zdokumentované. Viz úkol C.

### Rozpracovaná osnova
`docs/osnova.md` už obsahuje část popisu 4 nových sekcí (css-tailwind, css-efekty-animace,
web-3d-efekty, react-ui-knihovny), ale **`content/osnova.json` je ještě nemá**. Viz úkol C.

### Nainstalované balíčky (nic dalšího neinstaluj bez důvodu)
Platforma: vite, codemirror (+lang-html/css/javascript, lint, view, state, theme-one-dark),
marked, acorn, acorn-walk, @lezer/highlight, vue, playwright (Chromium headless shell).
Pro obsah: @tailwindcss/browser, gsap, motion, lenis, three, react, react-dom, sucrase,
react-router, @tanstack/react-query, radix-ui, clsx, class-variance-authority, tailwind-merge,
typescript, vitest, express, zod, eslint, @eslint/js, prettier, drizzle-orm, jsdom,
@testing-library/react, @testing-library/dom.

---

## 4. Úkoly v pořadí priority

### Úkol A — JavaScript (PRVNÍ, uživatel to výslovně chce)

Dopiš a zrecenzuj těchto 9 sekcí (pořadí podle trasy). Postup pro každou je v kap. 5.

1. `js-zaklady` — Základy JavaScriptu
2. `js-retezce-cisla` — Řetězce, čísla, data a regulární výrazy
3. `js-funkce` — Funkce a rozsah platnosti
4. `js-objekty` — Objekty, reference a kopie *(rozpracovaná nejvíc)*
5. `js-funkce-hloubka` — Closures, `this` a funkcionální styl
6. `js-tridy-kolekce` — Třídy, prototypy, Map, Set a iterátory
7. `js-chyby-ladeni` — Chyby a ladění
8. `js-dom` — DOM, události a prohlížeč
9. `js-async` — Asynchronní JavaScript a fetch

Hned za ně navrhni uživateli i `js-algoritmy` (je v části Nástroje, ale je čistě JS).

### Úkol B — zbylé sekce bez nových závislostí

Po JavaScriptu, v pořadí trasy (`content/osnova.json` → `doporucenaTrasa`):

`html-zaklady`, `start-nastroje`, `css-zaklady`, `html-formulare`, `html-pristupnost`,
`css-kaskada`, `css-box-model`, `css-grid`, `css-pozicovani`, `css-responzivita`,
`css-design`, `css-animace`, `nastroje-git-terminal`, `nastroje-devtools-vykon`,
`nastroje-cizi-kod`, `prace-s-ai`, `js-algoritmy`, `api-soubory-realtime` *(rozšíření)*,
`prohlizec-navic` *(rozšíření)*, `vue-nuxt-druhy-framework` *(rozšíření)*, `kariera-pohovor`.

V těchto sekcích **nepoužívej** plánované bloky z kontraktu kap. 13 (`:::trace`,
`:::specificita`, `:::regex`, `:::eventloop`, `target: layout`) — neexistují. Nahraď je
předpovědí (`:::live … predict`), `:::memory`, `controls` a `:::check`.

### Úkol C — runtime knihoven, Reactu a balíčků + nové sekce do osnovy

Prerekvizita pro úkol D. Dokonči rozpracované změny z kap. 3.

**C1. Nové sekce v osnově.** Dokonči popis v `docs/osnova.md` a přidej je do
`content/osnova.json` (do částí i do `doporucenaTrasa`, s dodržením předpokladů).
Popisy ostatních sekcí neměň.

- **`css-tailwind`** — Tailwind CSS v4 (jádro; v části `web-a-css` po `css-design`): utility-first myšlení, `@theme` a design tokeny, responzivita a stavy (hover, focus, dark, group, peer), vlastní utility a `@apply` s rozmyslem, komponenty bez duplicit, Tailwind vs. čisté CSS. Workshop landing sekce, lab přestavba stránky podle návrhu.
- **`css-efekty-animace`** — animace a efekty pro „wow" web (jádro; po `css-animace`): GSAP (timeline, easing, ScrollTrigger, SplitText, Flip), Motion (`animate`, `scroll`, `inView`), Lenis plynulé scrollování, View Transitions API, scroll-driven animace v CSS, parallax, magnetická tlačítka, reveal textu, mikrointerakce, `prefers-reduced-motion` a výkon (transform/opacity, `will-change`, 60 fps). Workshop animovaná hero sekce, lab scroll příběh.
- **`web-3d-efekty`** — 3D a vizuální efekty (rozšíření; po `css-efekty-animace`): Three.js základy (scéna, kamera, mesh, světla, render loop, resize), interakce s myší, částice, jednoduché shadery (uniformy, gradienty, noise), výkon. Workshop 3D pozadí hero sekce.
- **`react-ui-knihovny`** — UI knihovny a animace v Reactu (jádro; v části `react` po `react-hloubka`): Tailwind v Reactu, shadcn/ui (kopírované komponenty, Radix primitives, cva, tailwind-merge, clsx), přístupné dialogy/menu/tabs, Motion for React (`motion` komponenty, `AnimatePresence`, layout animace, gesta), design systém projektu. Workshop dashboard s animacemi, lab formulář s komponentami.

Do souvisejících sekcí doplň jen odkazy: css-design → css-tailwind, css-animace → css-efekty-animace, react-aplikace → react-ui-knihovny.

**C2. Plánované moduly v osnově** (potřebuje úkol E). U každé sekce v `content/osnova.json`,
která ještě nemá adresář na disku, doplň
`"modules": [{ "id": "<slug>", "type": "lesson|workshop|lab|quiz|project", "title": "…", "summary": "jedna věta, co se naučíš", "minutes": N }]`
přesně podle `docs/osnova.md`. Popiš pole v kontraktu kap. 2.1.

**C3. Knihovny v runtime `dom`.** Pole `libs` ve frontmatteru kroku/labu a v `module.json`
(např. `libs: tailwind, gsap`) a v hlavičce živé ukázky (např. `:::live dom libs=tailwind,gsap`,
i u `predict`). Syntaxi dokonči, zapiš do kontraktu a do parseru.
- Tailwind = `@tailwindcss/browser` jako skript (třídy fungují hned, `<style type="text/tailwindcss">` pro `@theme`).
- gsap (+ pluginy ScrollTrigger, SplitText, Flip…), motion, lenis, three jako ES moduly v import map (`import gsap from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`, `import { animate } from 'motion'`, `import Lenis from 'lenis'`, `import * as THREE from 'three'`).
- Servíruj ze serveru (`/vendor/...`, hlavička `Access-Control-Allow-Origin: *` — iframe má neprůhledný origin), předsestavené ESM bundly skriptem `tools/build-vendor.js`, který spustí `start.sh` i verify, když chybí nebo jsou starší než `node_modules`. **Offline, žádné CDN.**
- `requestAnimationFrame` a scroll musí v iframu fungovat.

**C4. Runtime `react`** (dopsat jako skutečnou kapitolu 6.x kontraktu):
- `.jsx`/`.tsx`/`.js` s JSX přes Sucrase (transformy jsx + typescript, ESM zůstává).
- Import map: react, react-dom/client, react/jsx-runtime, react-router, @tanstack/react-query, radix-ui, clsx, class-variance-authority, tailwind-merge, motion/react.
- Když chybí `index.html`, výchozí `<div id="root">` + vstup `main.jsx`.
- `helpers.flush()` počká na commit Reactu a mikroúlohy.
- React + `libs=tailwind` musí fungovat. Chyba JSX = `syntaxError` se správným řádkem. Ochrana smyček a čísla řádků sedí.
- Editor: zvýraznění jsx/tsx (`client/src/components/code-editor.js`).

**C5. Runtime `node` s balíčky.** Kód v dočasném adresáři musí umět `import express/zod/drizzle-orm`
a `helpers.run('npx tsc --noEmit' | 'npx vitest run' | 'npx eslint .')` z `node_modules`
Akademie (např. symlink `node_modules` do dočasného adresáře; u adresáře projektu studenta
nic neměň). Rozumné timeouty (`timeoutMs` z frontmatteru).

**C6. Testy a dokumentace.** V `tools/runner.test.js`: tailwind třída → computed style, `gsap.to`
změní transform (`helpers.waitFor`), motion `animate`, three vykreslí canvas, React komponenta
s `useState` + klik + `flush`, react-router `MemoryRouter`, React + Tailwind, JSX syntax error
s řádkem, node `import express` + `helpers.run('npx tsc --noEmit')`. Do kontraktu kapitolu
**„Příklady pro autory: knihovny, React, balíčky v node"** s **ověřenými** ukázkami kroků.
Ověř fixture sekcí přes `node tools/verify.js --content-dir <fixture>` a v UI (Playwright).

### Úkol D — sekce s knihovnami, Reactem a balíčky (po úkolu C)

`css-tailwind`, `css-efekty-animace`, `nastroje-moduly-vite`, `nastroje-typescript`,
`nastroje-testovani`, `react-zaklady`, `react-hloubka`, `react-ui-knihovny`, `api-http-rest`,
`react-aplikace`, `sql-databaze`, `auth-bezpecnost`, `nasazeni-provoz`, `next-fullstack`,
`web-3d-efekty` *(rozšíření)*.

Navíc k postupu z kap. 5:
- Způsob použití knihoven a Reactu ber z kontraktu (kap. 6 a „Příklady pro autory").
- U efektů a animací má výsledek vypadat opravdu „wow" a zároveň respektovat `prefers-reduced-motion`. Testy ověřují chování a stav (třídy, computed style, transform po `waitFor`, DOM), **ne pixely**.
- Next.js a věci, které v prohlížeči ani v dočasném adresáři nepoběží, dělej jako **projekt ve VS Code** (`starter/` + `solution/`, testy přes `helpers.run` s vyšším `timeoutMs`) nebo jako lekci s předpověďmi.
- Aktuální API ověř (září 2026): React 19, Next.js App Router (v osnově je zmíněná verze 16 s `proxy.ts` a Cache Components — ověř v dokumentaci), Vite 8, TypeScript, Zod 4, Better Auth (Auth.js je v údržbě), Drizzle, Express 5, React Router 7, TanStack Query 5.

### Úkol E — otevřít cokoli (po obsahu, nebo souběžně jiným agentem)

Uživatel doslova: *„chci mít možnost otevřít jakoukoliv lekci, ne jen kapitolu — např. u Reactu nemám jak kapitolu otevřít"*.

- **Každá sekce jde otevřít**, i nenapsaná: stránka sekce ukáže popis a seznam modulů. Plánované moduly z `content/osnova.json` → `modules` (úkol C2); `loadCurriculum` je propustí jako moduly s `planned: true` a id `"<sekce>/<modul>"`. Když sekce na disku existuje, platí `section.json`.
- **Plánovaný modul jde otevřít:** stránka s názvem, typem, co se naučíš, odhadem času a tlačítkem **„Napsat přednostně"** (`POST /api/priorities { sectionId }` → `data/priority.json` s pořadím a časem; `GET /api/priorities`; tlačítko se přepne na „Zařazeno k napsání"). Zdokumentuj v `docs/platforma.md`.
- **Přehled osnovy jako strom:** část → sekce → moduly se stavem; každou sekci jde rozbalit přímo na přehledu a každý modul otevřít jedním kliknutím. Stav rozbalení v `localStorage`.
- **Vyhledávání Ctrl+K** napojené na index modulů a nadpisů lekcí (`buildContentIndex` v `shared/content.js`) — student najde lekci podle slova.
- Vlastnictví: `client/src/**` kromě `runner/`, `shared/content.js` (jen `loadCurriculum`/index), nový `server/routes/priorities.js` + test, `tools/ui*.test.js`, `tools/e2e.js`.

### Úkol F — redesign a zábava (až po A–E)

- Nejdřív si prohlédni současné snímky obrazovky: `.e2e/finale/*.png` (světlý i tmavý režim).
- Výraznější, modernější a příjemnější vzhled výukové aplikace: typografie, paleta a akcent, rozestupy, karty, stavy pokroku, jemné mikroanimace (hover, dokončení kroku, přechody obrazovek) s `prefers-reduced-motion`, ikonky typů modulů, přehled jako motivující „mapa kurzu".
- **Zachovej:** design tokeny (`client/src/styles/tokens.css`), promyšlený **tmavý režim** (uživatel pracuje v tmavém prostředí), přístupnost (kontrast ≥ 4.5:1, focus), všechny existující sloty a rozšíření (`docs/platforma.md` — jiné nástroje na nich stojí), čitelnost výkladu a pracovní plochu editoru.
- Implementuj nejpřínosnější návrhy z `docs/superpowers/specs/2026-09-15-navrhy-ui-zabava.md` (žádné XP ani hra).
- Snímky 1440×900 a 1280×720, světlý i tmavý režim, do `.e2e/redesign/` — prohlédni a dolaď.

### Úkol G — průřezová kontrola celého kurzu a finále (úplně nakonec)

1. **Návaznost napříč trasou:** `[[pojmy]]` použité před sekcí, kde se vysvětlují; `see` odkazy; duplicitní karty a otázky mezi sekcemi; kvízy s 20–30 % otázek ze starších sekcí téže části (kontrola Q4); jednotná terminologie a styl; realistické odhady minut; kontrolní laby na konci částí podle osnovy.
2. `docs/osnova.md` sjednoť se skutečným obsahem; z `content/osnova.json` odstraň plánované `modules` u sekcí, které už existují.
3. Poučení autorů (`STYL:`) zapracuj do `docs/styl-obsahu.md` bez duplicit.
4. `npm test`, `npx vite build`, `npm run overit` (celý kurz **0 chyb**), `npm run e2e` — musí projít.
5. Projdi aplikaci jako student (Playwright, snímky do `.e2e/kompletni/`): přehled → strom → otevřít lekce z různých částí, krok s GSAP/Tailwind, React krok, node krok s balíčky, opakování, vyhledávání, tmavý režim.
6. Aktualizuj `ZACNI-TADY.md`: kurz je kompletní, jak začít, trasa, knihovny a efekty, jak se učit nejefektivněji (každý den nejdřív opakování; nejdřív tipni, pak spusť; 10–15 min vlastní snahy před nápovědou; po zobrazení řešení krok zopakovat naslepo; vysvětluj vlastními slovy do poznámek; vlastní projekt souběžně; AI jako učitel, ne jako autor kódu).

---

## 5. Postup pro jednu sekci (úkoly A, B, D)

Každou sekci dělej ve **dvou oddělených průchodech**: autor → nezávislý recenzent
(v Antigravity ideálně dva různí agenti). Recenze v pilotech pokaždé našla testy, které
propouštěly špatné řešení nebo odmítaly dobré, a nepřesná tvrzení.

### 5.1 Autor

1. **Najdi sekci v `docs/osnova.md`** (cíl „Po sekci umíš", předpoklady, moduly v pořadí, co přesně učí, počty kroků, kde použít jaký typ cvičení). Drobné odchylky smíš, když to učení prospěje — zapiš proč.
2. **Projdi vzorové piloty** (kap. 2) a **celý** `docs/styl-obsahu.md`.
3. **Zkontroluj rozpracovaný stav** adresáře (kap. 3) — naváž, nebo přepiš.
4. **Napiš všechny soubory sekce:**
   - `section.json` (title, intro s předpoklady, modules, **outcomes** s odkazy)
   - **lekce** (`lesson.md`): pretest `:::check pretest`, problém, mentální model v `> [!REMEMBER]`, části `##` a po každé `:::check`, živé ukázky `:::live` s větou „zkus změnit X a sleduj Y", předpovědi `:::live … predict` u pastí, `:::memory` / `controls` / `:::compare`, kde pomáhají, `:::explain` u pohovorových konceptů, „Typické chyby a pasti" v `> [!PITFALL]`, `## Kde to najdeš v MDN`, `# --questions--` (aspoň polovina psaných odpovědí)
   - **workshop(y)** (`steps/NNN.md`, 15–60 kroků): jeden krok = jedna nová věc; `kind: recall` na začátku; zeslabování ve třetinách (přesný zápis → cíl a kandidáti → jen chování); `kind: debug` (~1 na 10 kroků) s `## Hlášení` a `## Úkol`; `kind: parsons` u prvního složitějšího vzoru; `kind: choose` (vyber nástroj sám); `# --explain--` (~1 na 5 kroků); tipy `# --help--` (koncept + odkaz → kde → vzor na jiných datech, nikdy řešení); seed kroku N = řešení kroku N−1; na konci `## Udělej po svém`
   - **lab(y)** (`lab.md`): uživatelské příběhy nečíslované, 8–20 požadavků, `# --approaches--`, `# --review--`, aspoň jeden lab s volným tématem
   - **kvíz** (`quiz.md`, 10–20 otázek): hodně „co vypíše / proč se to tak zobrazí", polovina psaných, sada `# --code--` nad delším cizím kódem, `--why--` pojmenuje mylnou představu, `--see--` odkazy
   - `cards.md` (15–30 karet, 5–10 pohovorových), `pojmy.md` (+ `[[pojem|text]]` v textu), `tahak.md` (bez vlastního nadpisu `#`)
5. **Aktuálnost:** moderní API platné v září 2026. Cokoli nejistého ověř v MDN nebo oficiální dokumentaci.
6. **Každý test vyzkoušej přes skutečný runner** na 2–3 jiných správných a 2–3 typicky chybných řešeních (skript mimo repo; `tools/lib/runner-pool.js` pro dom/js, `runNodeTests` z `server/node-runner.js` pro node). **Každou past a každý výstup ověř spuštěním.**
7. **Ověření:** `npm run overit -- --concurrency 2 content/<sekce>` = 0 chyb a 0 varování (zbylé zdůvodni), pak `npm run overit -- --concurrency 2 --doporuceni content/<sekce>` proti kontrolnímu seznamu `styl-obsahu.md` kap. 16.

### 5.2 Recenzent

Čti jako student. Posuď a **rovnou oprav**:
- správnost faktů a výstupů (ověř spuštěním), aktuálnost API
- testy: pro každý krok a lab 2–3 jiná správná a 2–3 typicky chybná řešení přes runner — žádné falešné propuštění ani odmítnutí
- didaktiku podle `styl-obsahu.md` (povinné body, kap. 17 a 18): návaznost bez nevysvětlených pojmů, velikost kroků, zeslabování, tipy neprozrazují řešení, karty a kvíz nekopírují lekci, barevný výklad střídmě
- úplnost vůči `docs/osnova.md` (každý cíl „Po sekci umíš" má pokrytí)
- zábavu: je výsledek workshopů pěkný a smysluplný? Je text živý a konkrétní?
- znovu `npm run overit -- --concurrency 2 content/<sekce>` = 0 chyb a 0 varování

### 5.3 Commit

Po dokončené recenzi **commitni sekci samostatně**, ať se student může učit průběžně:
```sh
git add content/<sekce> && git commit -m "Sekce <sekce>: <stručně co obsahuje>"
```
**Bez jakékoli zmínky o AI a bez `Co-Authored-By`** v commit zprávě (výslovné přání uživatele).

---

## 6. Formát obsahu — rychlý tahák

Úplná specifikace je v `docs/kontrakt.md`. Tohle je jen orientace — přesnou syntaxi vždy ověř
tam a v pilotech. Značky (`# --x--`, `:::x`) se hledají jen **mimo** bloky kódu.

**`module.json`**
```json
{ "type": "workshop", "title": "Nákupní seznam", "summary": "Co postavíš, slovesem.", "minutes": 150, "runtime": "js" }
```
`type`: `lesson | workshop | lab | quiz | project`, `runtime`: `dom | js | vue | node` (po úkolu C i `react`).

**Krok workshopu** (`steps/022.md`)
````md
---
title: "Oprava: kolegovy ceny od nejnižší"
kind: debug
see: js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce
---

# --description--

## Hlášení
Co se děje a na jakých datech…

## Úkol
Oprav `pricesAscending`… Změň co nejmenší kus kódu.

# --hints--

`pricesAscending` seřadí ceny jako čísla od nejnižší.

```js
assert.deepEqual(pricesAscending(items), [9, 25, 100], 'pricesAscending pro ceny 9, 100 a 25 má vrátit [9, 25, 100]');
```

# --help--

## --tip--
Chyba odpovídá pasti [`sort` bez porovnávací funkce](see:js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce).

## --tip--
Na jiných datech: věky seřadí `ages.toSorted((a, b) => a - b)`.

# --seed--

## --file-- script.js

```js
…kód…
--edit--

--edit--
```

# --solution--

## --file-- script.js

```js
…celý opravený soubor…
```
````
- Nápověda = text a hned po něm **jeden** blok ` ```js ` (test). Test je tělo async funkce; globály `assert` (podmnožina `node:assert/strict`), `files`, `logs`, `errors`, `helpers` (kontrakt kap. 6).
- Každá aserce má **českou zprávu se vstupem**.
- `--edit--` 0× nebo 2× — zvýrazněná oblast pro psaní.
- `kind`: `step` (výchozí) | `recall` | `choose` | `debug` | `parsons` (`# --parsons--`, `## --distractors--`, mezery `__1__`).

**Lekce** (`lesson.md`) — ukázka z `content/js-pole/co-je-pole/lesson.md`:
````md
# Co je pole

:::check pretest
Co vypíše poslední řádek?

```js
console.log(['a', 'b'][5]);
```

### --expected--

undefined

### --why--

Index 5 neexistuje; čtení mimo pole nespadne, vrátí `undefined`.
:::

> [!REMEMBER]
> **Pole je jedna hodnota s očíslovaným seznamem položek — a proměnná na ni jen ukazuje.**

## Pole je očíslovaný seznam hodnot

…výklad s [[index]]…

:::live js
```js
const shopping = ['chleba', 'mléko'];
console.log(shopping.length);
```
:::

Zkus změnit … a sleduj …

> [!PITFALL]
> **Čtení mimo pole nespadne, vrátí `undefined`.** … přesná hláška … Oprava: …
````
- CSS ovládací prvky v živé ukázce: blok ` ```controls ` s řádky jako `--justify: select(flex-start, center, space-between) = space-between | justify-content`.
- Otázky: `### --answer--` / `### --correct--` s `#### --why--`, nebo psaná odpověď `### --expected--` (+ `### --accept--`), `### --see--`.

**Karta** (`cards.md`)
````md
## --card-- output

Co vypíše tenhle kód?

```js
console.log([5, 40, 300].sort());
```

### --expected--

[300, 40, 5]

### --why--

Bez porovnávací funkce `sort` řadí jako text…

### --see--

js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce
````
Typy karet: `output`, `code js` (seed/test/solution), `css`, `free` (pohovorová s `--back--`).

**Pojem** (`pojmy.md`)
```md
## --term-- index

en: index
aliases: indexu, indexem, indexy
mdn: https://developer.mozilla.org/…
lekce: js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot

Pořadové číslo položky v poli. Počítá se od nuly…
```

**Kotvy** pro `see:` = nadpis `##`/`###` převedený na malá písmena bez diakritiky s pomlčkami
(`## Mělká kopie` → `#melka-kopie`). Nadpis, na který vede `see`, neměň — rozbiješ odkaz.

---

## 7. Ověřovací příkazy

```sh
cd /home/karel/akademie
npm test                                             # unit a UI testy platformy
npx vite build                                       # build klienta
npm run overit -- --concurrency 2 content/<sekce>    # kontrola jedné sekce (seed selže, řešení projde, pravidla)
npm run overit -- --concurrency 2 --doporuceni content/<sekce>
npm run overit                                       # celý kurz
npm run e2e                                          # průchod aplikací v Playwrightu (snímky do .e2e/)
node tools/verify.js --content-dir <adresář>         # verify nad testovacím obsahem
```

---

## 8. Pravidla a pasti (ověřené v praxi)

**Souběžná práce více agentů**
- Každý agent obsahu vlastní **jen svůj adresář `content/<sekce>/`**. Na `content/osnova.json`, `docs/` a platformu nesahá — potřebu zapíše do zprávy.
- Platformu (úkoly C, E, F) dělá vždy **jeden** agent na oblast; `docs/kontrakt.md` upravuj jen cílenými úpravami vlastní kapitoly a před úpravou soubor znovu načti.
- Verify pouštěj **s `--concurrency 2` a jen nad svou sekcí**. Když selže build nebo runner kvůli cizímu rozpracovanému kódu nebo timeoutu pod zátěží, chvíli počkej a zkus znovu; teprve pak hlas problém platformy.
- Platformu, kterou právě používají jiní agenti, měň zpětně kompatibilně a po ucelených kouscích.

**Procesy a porty**
- **Nikdy `pkill node` / `killall node`** — zabiješ uživatelovu běžící Akademii a cizí procesy. Zabíjej jen PID, které jsi sám spustil.
- **Pozor na `pkill -f <vzor>` / `pgrep -f <vzor>` v shellu:** vzor se najde i v příkazové řádce vlastního shellu a zabije ho (exit 144). Použij trik se závorkou: `pgrep -f 'chrome-headless-shell-linu[x]64'`.
- Po práci s Playwrightem ukliď headless prohlížeče, které jsi spustil.
- Každý agent má vlastní rozsah portů (např. 5000+10·n); nic neposlouchej mimo něj. Port 4300 patří uživatelově aplikaci.

**Runner a testy**
- Headless Chromium **vždy s `--site-per-process`**, jinak sandboxované iframy nejsou v odděleném procesu a nekonečná smyčka zamrazí stránku.
- Testovací iframe má 1024×768; media queries reagují na šířku **okna náhledu**, ne na `max-width` kontejneru. Na změnu šířky `await helpers.resize(w)`.
- **Layout test na zarovnání** vyzkoušej i s řešením **bez** té vlastnosti — stejně vysoké položky mají při `stretch` stejný střed jako při `center`. Střed textu měř přes `Range`.
- **Data testu musí rozlišit správnou a typicky špatnou logiku** (české řazení: Č × C/D/Z, Ch za H; handler bez `return` projde jen s jedním požadavkem — pošli jich víc).
- Testy nesmí záviset na čase, pořadí ani síti. Žádné `fetch` na internet.
- Regex na zdroják jen tam, kde krok učí konkrétní syntaxi, a benevolentně k legitimním variantám (destrukturalizace, šipková funkce).
- Tolerance v layout testech pár px — jinak odmítneš správné alternativní řešení.

**Obsah**
- Výklad česky, tykání, věcně, bez „super" a vykřičníků. Kód anglicky, texty ve stránkách česky.
- Příklad v popisu kroku nikdy není řešení k opsání — stejný vzor, jiná data.
- Karty a kvíz nekopírují text `:::check`, otázek lekce ani kód předpovědí.
- Otázka ani `--why--` nestaví na pojmu, který výklad neuvedl.
- Každou „past" ověř spuštěním a hlídej zobecnění („`reduce` bez `return` spadne, jen když s akumulátorem pracuješ").
- Tučně nejvýš 1× na odstavec; `==zvýraznění==` jen pro kontrastní dvojice, nejvýš 2× na lekci; ~1 rámeček na obrazovku textu.
- Workshopy staví něco, co by si student rád ukázal: česká reálná data, pěkný vzhled, první viditelný výsledek do 5 minut, žádné foo/lorem ipsum, dva workshopy v sekci nemají stejnou doménu.
- Žádné závislosti z internetu (CDN, Google Fonts) — systémové fonty, knihovny z `/vendor`.

**Git**
- Commity bez zmínky o AI a bez `Co-Authored-By`.
- `data/` a `moje-projekty/` jsou data studenta — nikdy je nemaž ani nepřepisuj.

---

## 9. Hotovo znamená

**Pro každou sekci:** všechny moduly z osnovy existují; autor i recenzent prošli; `npm run overit -- content/<sekce>` = 0 chyb a 0 varování; každý test vyzkoušený na jiných správných a chybných řešeních; commit.

**Pro celý kurz:** všechny sekce z `content/osnova.json` existují a jdou otevřít; `npm test`, `npx vite build`, `npm run overit` (0 chyb) a `npm run e2e` projdou; každou lekci jde otevřít přímo z přehledu; knihovny a React fungují v editoru; redesign ve světlém i tmavém režimu; `ZACNI-TADY.md` aktuální.

**Doporučené rozdělení v Antigravity:**
- 1 agent na úkol C (runtime + osnova), hned na začátku — nic neblokuje úkol A.
- Agenti obsahu po jedné sekci (autor), po dokončení nový agent jako recenzent téže sekce. Začni 9 sekcemi JavaScriptu.
- Úkol E jeden agent, jakmile je hotové C2.
- Úkoly F a G až nakonec, každý jeden agent.
- Průběžně hlas uživateli, které sekce jsou commitnuté, ať se z nich může učit.
