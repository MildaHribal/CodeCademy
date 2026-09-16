# Osnova Akademie

Detailní plán celého kurzu: **6 částí, 48 sekcí** (44 jádro, 4 rozšíření).
U každé sekce je úroveň, odhad hodin, předpoklady, cíl „Po sekci umíš" a moduly
v pořadí. Strojová podoba (části, sekce, úroveň, doporučená trasa a plánované
moduly sekcí, které ještě nejsou na disku) je v `content/osnova.json`. Když se
tyto dva soubory rozcházejí ve slugách sekcí nebo modulů, v úrovni nebo
v pořadí trasy, platí `osnova.json` a rozpor se opraví.

Formát modulů a pravidla psaní jsou v `docs/kontrakt.md` a `docs/styl-obsahu.md`.
Tahle osnova říká **co** se učí, **v jakém pořadí** a **kde použít který typ
cvičení**. Návrh, ze kterého osnova vychází, je
`docs/superpowers/specs/2026-09-14-akademie-vylepseni-navrh.md` (kap. C a D)
s rozhodnutími uživatele E1–E4:

- **E1:** hlavní framework je React + Next.js. Vue a Nuxt jsou jen rozšíření
  `vue-nuxt-druhy-framework`. Sekce `vue-zaklady`, `vue-aplikace`
  a `nuxt-fullstack` jsou zrušené (obsah neexistoval).
- **E2:** kurz smí učit práci s AI jako téma (sekce `prace-s-ai`, lekce
  `uceni-s-ai` ve `start-nastroje`). V kódu platformy, komentářích a commitech
  platí zákaz zmínek dál.
- **E3:** žádné vysvětlování chyb přes AI v aplikaci.
- **E4:** práci uživatel hledá až po kurzu, proto `js-algoritmy`
  a `kariera-pohovor` jsou na konci trasy.
- **Nic se nezamyká.** Předpoklady jsou doporučení, ne zámek. Uživatel smí
  kdykoli skočit na libovolnou sekci i modul.

---

## Doporučená trasa

Části jsou tematické, trasa je pořadí, ve kterém se sekce nejlépe učí. V první
polovině prokládá CSS a JavaScript (jeden den layout, druhý den jazyk), aby se
nic neučilo příliš dlouho v kuse a obojí se opakovalo s odstupem. Rozšíření
(R) jsou zařazená tam, kde na ně téma přirozeně navazuje; kdo je přeskočí,
pokračuje další sekcí jádra.

Sloupec „Σ jádro" je kumulativní odhad hodin jádra.

| # | sekce | část | úroveň | h | Σ jádro |
|---|---|---|---|---|---|
| 1 | `html-zaklady` | Web a CSS | jádro | 9 | 9 |
| 2 | `start-nastroje` | Web a CSS | jádro | 6 | 15 |
| 3 | `css-zaklady` | Web a CSS | jádro | 9 | 24 |
| 4 | `js-zaklady` | JavaScript | jádro | 11 | 35 |
| 5 | `html-formulare` | Web a CSS | jádro | 7 | 42 |
| 6 | `js-retezce-cisla` | JavaScript | jádro | 9 | 51 |
| 7 | `html-pristupnost` | Web a CSS | jádro | 10 | 61 |
| 8 | `css-kaskada` | Web a CSS | jádro | 8 | 69 |
| 9 | `js-funkce` | JavaScript | jádro | 8 | 77 |
| 10 | `css-box-model` | Web a CSS | jádro | 6 | 83 |
| 11 | `js-objekty` | JavaScript | jádro | 8 | 91 |
| 12 | `css-flexbox` | Web a CSS | jádro | 6 | 97 |
| 13 | `js-pole` | JavaScript | jádro | 8 | 105 |
| 14 | `css-grid` | Web a CSS | jádro | 7 | 112 |
| 15 | `js-funkce-hloubka` | JavaScript | jádro | 9 | 121 |
| 16 | `css-pozicovani` | Web a CSS | jádro | 7 | 128 |
| 17 | `js-tridy-kolekce` | JavaScript | jádro | 8 (+1 R) | 136 |
| 18 | `css-responzivita` | Web a CSS | jádro | 7 | 143 |
| 19 | `js-chyby-ladeni` | JavaScript | jádro | 6 | 149 |
| 20 | `css-design` | Web a CSS | jádro | 9 | 158 |
| 21 | `js-dom` | JavaScript | jádro | 16 | 174 |
| 22 | `css-animace` | Web a CSS | jádro | 14 | 188 |
| 23 | `js-async` | JavaScript | jádro | 17 | 205 |
| 24 | `css-tailwind` | Web a CSS | jádro | 10 | 215 |
| 25 | `nastroje-git-terminal` | Nástroje a řemeslo | jádro | 6 | 221 |
| 26 | `css-efekty-animace` | Web a CSS | jádro | 14 | 235 |
| 27 | `web-3d-efekty` | Web a CSS | **rozšíření** | 9 | — |
| 28 | `nastroje-moduly-vite` | Nástroje a řemeslo | jádro | 7 | 242 |
| 29 | `nastroje-devtools-vykon` | Nástroje a řemeslo | jádro | 6 | 248 |
| 30 | `nastroje-typescript` | Nástroje a řemeslo | jádro | 10 | 258 |
| 31 | `nastroje-testovani` | Nástroje a řemeslo | jádro | 11 | 269 |
| 32 | `react-zaklady` | React | jádro | 12 | 281 |
| 33 | `react-hloubka` | React | jádro | 14 | 295 |
| 34 | `node-zaklady` | Backend a fullstack | jádro | 7 | 302 |
| 35 | `react-ui-knihovny` | React | jádro | 12 | 314 |
| 36 | `api-http-rest` | Backend a fullstack | jádro | 10 | 324 |
| 37 | `react-aplikace` | React | jádro | 26 | 350 |
| 38 | `sql-databaze` | Backend a fullstack | jádro | 11 (+1 R) | 361 |
| 39 | `auth-bezpecnost` | Backend a fullstack | jádro | 11 | 372 |
| 40 | `nasazeni-provoz` | Backend a fullstack | jádro | 9 (+2 R) | 381 |
| 41 | `next-fullstack` | Backend a fullstack | jádro | 27 | 408 |
| 42 | `vue-nuxt-druhy-framework` | React | **rozšíření** | 12 | — |
| 43 | `api-soubory-realtime` | Backend a fullstack | **rozšíření** | 10 | — |
| 44 | `prohlizec-navic` | Backend a fullstack | **rozšíření** | 10 | — |
| 45 | `nastroje-cizi-kod` | Nástroje a řemeslo | jádro | 10 | 418 |
| 46 | `prace-s-ai` | Nástroje a řemeslo | jádro | 7 | 425 |
| 47 | `js-algoritmy` | Nástroje a řemeslo | jádro | 15 | 440 |
| 48 | `kariera-pohovor` | Kariéra | jádro | 15 | 455 |

**Proč právě takhle:**

- `start-nastroje` hned za první HTML: od druhé sekce uživatel ukládá práci
  do Gitu, zná pravidla učení v Akademii (předpověď, nápovědy, opakování)
  a ví, jak se učit s AI bez zkratek.
- `html-pristupnost` přichází po prvních sekcích CSS i JS, protože její projekt
  (portfolio) se nasazuje na URL a smí používat základní styly.
- Nástroje (Git do hloubky, Vite, TypeScript, testy) přijdou až po celém
  JavaScriptu. Do té doby stačí minimum ze `start-nastroje`.
- `css-tailwind` až po vlajkovém projektu 1: uživatel nejdřív postaví landing
  page v čistém CSS a rozumí kaskádě, vrstvám a tokenům. Tailwind pak čte jako
  zkratku za věci, které zná, ne jako magii. Prokládá se s JavaScriptem
  a nástroji, aby CSS neběželo několik sekcí v kuse.
- `css-efekty-animace` přichází po `js-async`: GSAP, Motion a Lenis se ovládají
  z JavaScriptu (posluchače, `requestAnimationFrame`, `await animation.finished`)
  a výkon animací staví na pipeline z `css-animace`. Rozšíření `web-3d-efekty`
  stojí hned za ním, dokud je téma čerstvé.
- `react-ui-knihovny` je mezi `react-hloubka` a `react-aplikace`: vlajkový
  projekt 2 už může stavět na vlastní sadě komponent, Tailwindu a Motion.
- Backend se prokládá s Reactem: `node-zaklady` a `api-http-rest` jsou před
  `react-aplikace`, takže vlajkový projekt 2 volá API, kterému uživatel rozumí
  zevnitř.
- `nasazeni-provoz` je před `next-fullstack`, protože závěrečný vlajkový
  projekt 3 v Next.js vyžaduje přihlášení, databázi, Docker nebo nasazení a CI.
- Podle E4 jsou na konci řemeslo pro první práci (`nastroje-cizi-kod`,
  `prace-s-ai`), algoritmy na pohovor a kariéra.

---

## Souhrn rozsahu

| část | sekcí jádra | rozšíření | hodin jádra | hodin rozšíření |
|---|---|---|---|---|
| 1. Web a CSS | 15 | 1 | 129 | 9 |
| 2. JavaScript | 10 | 0 | 100 | 1 (modul) |
| 3. Nástroje a řemeslo | 8 | 0 | 72 | 0 |
| 4. Frontend framework — React | 4 | 1 | 64 | 12 |
| 5. Backend a fullstack | 6 | 2 | 75 | 23 (2 sekce + 2 moduly) |
| 6. Kariéra | 1 | 0 | 15 | 0 |
| **celkem** | **44** | **4** | **~455 h** | **~45 h** |

Celkem ~500 h. Při 10 h týdně je jádro zhruba na 11 měsíců.

**Kontrolní laby na konci částí** (samostatné zadání přes celou část, zadání
neříká, ze které sekce co použít):

| lab | v sekci | ověřuje |
|---|---|---|
| `lab-kontrolni-bod-1` | `css-animace` | část 1: přístupná stránka akce s formulářem, gridem, flexem a animací |
| `lab-kontrolni-bod-2` | `js-async` | část 2: data z fetch, řazení, validace a vykreslení do DOM |
| `lab-kontrolni-bod-3` | `nastroje-testovani` | nástroje: otypovaný modul, test, který zachytí nahlášenou chybu, commity |
| `lab-kontrolni-bod-4` | `react-aplikace` | React: malá aplikace se stavem, formulářem, načítáním a chybami |
| `lab-kontrolni-bod-5` | `nasazeni-provoz` | backend: API s validací, autorizací, transakcí a provozními požadavky |

Kariéra kontrolní lab nemá, jeho roli plní `kariera-pohovor/lab-domaci-ukol`.

**Vlajkové projekty** (do portfolia, s rubrikou `# --review--` a oddílem
„Rozšíření do portfolia"):

1. `css-animace/projekt-landing-page` — landing page produktu, nasazená, se
   zapracovaným portfoliem z `html-pristupnost`.
2. `react-aplikace/projekt-react-spa` — plánovač jídel a nákupů ve Vite +
   React + TypeScript nad API.
3. `next-fullstack/projekt-zaverecny` — fullstack aplikace v Next.js
   s databází, přihlášením, testy a nasazením; tři zadání nebo vlastní téma se
   stejným checklistem.

**Cvičné projekty** (menší, ve VS Code): `start-nastroje/projekt-profil-na-githubu`,
`html-pristupnost/projekt-portfolio-html`, `js-dom/projekt-kanban`,
`js-async/projekt-filmova-databaze`, `nastroje-testovani/projekt-rozpoctovac`,
`node-zaklady/projekt-api-poznamek`, `sql-databaze/projekt-api-receptu`,
`next-fullstack/projekt-next-zaklad`, `prohlizec-navic/projekt-offline-poznamky` (R).
Každý má oddíl „Rozšíření do portfolia" (skutečné API, nasazení, README).

---

## Jak osnovu číst

- **Sekce** má slug (= adresář v `content/`), název, **úroveň** (`jádro` nebo
  `rozšíření`, v JSON `jadro` / `rozsireni`), odhad hodin, **předpoklady**
  (slugy sekcí, které je dobré mít za sebou; vždy jsou v trase dřív)
  a volitelně **doporučeno předem** (pomůže, ale není nutné). **Navazuje**
  a **Související** jen odkazují na sekci, která téma rozvíjí dál; na
  předpoklady ani trasu nemají vliv.
- **Po sekci umíš** jsou 3–6 odrážek. Autor sekce z nich udělá `outcomes`
  v `section.json` (A13) a obrazovku „Umím / Nejistý / Neumím" (B16).
- **Moduly** jsou v pořadí průchodu. U každého je typ, slug, název, výchozí
  runtime v hranatých závorkách a co přesně učí. U workshopu co se staví
  a přibližný počet kroků.
- Modul označený **(rozšíření)** uvnitř sekce jádra je nepovinný.
- Laby a kvíz jsou na konci sekce, kontrolní laby a projekty úplně na konci.

### Soubory, které má každá sekce (A5, A13)

Neopakuje se to u každé sekce, platí to vždy:

- `cards.md` — 15–30 karet pro opakování, z toho 5–10 pohovorových (`free`).
  Každá karta = jedna past nebo jeden vzor ze sekce.
- `pojmy.md` — pojmy sekce s anglickým termínem a odkazem na MDN.
- `tahak.md` — tabulky, 5–10 vzorů a pasti, žádná nová látka.
- `outcomes` v `section.json` z odrážek „Po sekci umíš".
- JS a CSS sekce navíc 8–15 (JS) nebo 5–8 (CSS) cvičných úloh do
  `content/cviceni/` (B19), píšou se se sekcí.

### Značky typů cvičení

V popisech modulů je u každého místa, kde se použije nový typ cvičení, uvedená
značka. Pravidla četnosti z příručky (A14) platí vždy; tady jsou jen konkrétní
místa, která autor nemá vynechat.

| značka | co to je | kontrakt |
|---|---|---|
| `pretest` | 1–2 otázky „Co myslíš?" na začátku lekce, špatná odpověď se nehodnotí | A2 |
| `check` | `:::check` po části lekce (po každém `##` jeden — platí vždy, uvádí se jen zvláštní) | A2 |
| `predict` | `:::live … predict`: napiš výstup, pak se ukáže skutečnost | A3 |
| `explain` | `# --explain--` v kroku, `:::explain` v lekci, s modelem a checklistem | A8 |
| `memory` | `:::memory`: ručně popsané stavy paměti (proměnné, objekty, šipky) | A9 |
| `trace` | `:::trace js`: automatické krokování zásobníku a haldy | B17 |
| `controls` | ovládací prvky v živé ukázce (select, range, toggle) | A10 |
| `compare` | `:::compare`: dva náhledy lišící se jednou věcí | A10 |
| `debug` | krok `kind: debug`: seed s chybou, Hlášení / Úkol / 4 kroky ladění | A6 |
| `parsons` | krok `kind: parsons`: seřaď řádky, doplň mezery | A7 |
| `vyber-sam` | krok, který nejmenuje metodu ani vlastnost a regex ji nevynucuje | A14.3 |
| `help` | odstupňované nápovědy `# --help--` | A4 |
| `code` | kvízová sada nad delším „cizím" kódem `# --code--` | A15 |
| `approaches` | `# --approaches--` v labu: 2–4 jiná správná řešení po splnění | A12 |
| `review` | `# --review--` v projektu: rubrika kvality mimo testy | A12 |
| `pred-startem` | blok „Než začneš" v labu a projektu | A12 |
| `layout` | `target: layout` v CSS labu: vizuální cíl, porovnání geometrie | B18 |
| `specificita` | `:::specificita` s kalkulačkou | B20 |
| `regex` | `:::regex` tester | B24 |
| `eventloop` | `:::eventloop` přehrávač s předpovědí pořadí | B21 |

### Runtime podle obsahu

- `dom` — HTML, CSS, DOM a události (iframe 1024×768, přepínač šířky náhledu B11,
  `helpers.resize` pro media queries). Pozor: iframe je sandbox bez
  `allow-same-origin`, takže `localStorage`, `sessionStorage`, IndexedDB,
  cookies a service worker v něm nefungují bez podpory runneru (viz Otevřené
  body na konci).
- `dom` s knihovnami — **rozšíření runtime `dom`** (staví se, popis dodá
  kontrakt kap. 6): stejný iframe, navíc import map na předsestavené vendor
  soubory GSAP s pluginy (`gsap/ScrollTrigger`, `gsap/SplitText`, `gsap/Flip`),
  Motion (`motion`), Lenis a Three.js (včetně `three/addons/…`). Uživatel píše
  `import { gsap } from 'gsap'` jako v projektu, bez CDN. Knihovny, které mění
  stránku samy od sebe, se zapínají polem `libs` v modulu nebo kroku:
  `tailwind` (prohlížečová verze Tailwindu generuje CSS z tříd; zapne se
  i sama, když CSS obsahuje `@import "tailwindcss"`) a `lenis` (styly Lenis;
  zapnou se i samy při importu `lenis`). GSAP, Motion a Three.js jsou jen
  ES moduly a načtou se až importem. Značka `[dom + tailwind]` v popisu modulu
  = runtime `dom` s `libs: ["tailwind"]`. Používají ho `css-tailwind`,
  `css-efekty-animace` a `web-3d-efekty`.
- `js` — čistý JavaScript bez stránky (konzole, REPL B15).
- `react` — **nový runtime (B22)**: React 19 přes import map z předsestavených
  vendor souborů, JSX a TSX přes Sucrase, `helpers.flush()` po změně stavu.
  Knihovny, které React sekce potřebují v prohlížeči (React Router, TanStack
  Query), musí být ve vendoru také; bez nich se daný workshop píše jako projekt.
  Ve vendoru se staví i `radix-ui`, `clsx`, `class-variance-authority`,
  `tailwind-merge` a `motion/react` pro `react-ui-knihovny`. Tailwind se
  v runtime `react` zapíná stejně jako v `dom` (značka `[react + tailwind]`).
- `vue` — jen rozšíření `vue-nuxt-druhy-framework` (Vue 3 přes import map, bez SFC).
- `node` — Node na serveru: `fs`, `http`, `node:sqlite`, `node:test`, Git přes
  `helpers.run`, TypeScript přes vestavěné odstraňování typů (jen „erasable"
  syntaxe). Balíčky mimo Node (Express, Zod, Drizzle, TypeScript kompilátor)
  jsou v krocích k dispozici, jen když je koordinátor předinstaluje a node
  runtime je zpřístupní — viz „Balíčky pro kroky" na konci.
- **Projekty ve VS Code** si závislosti instalují samy (`npm install`): Vite,
  Vitest, Playwright, MSW, React Router, TanStack Query, Tailwind, GSAP,
  Motion, Lenis, Three.js, shadcn/ui, Next.js, Drizzle, Better Auth.

### Stav technologií (září 2026)

Ověřeno k 13. 9. 2026; autor sekce ověří znovu v době psaní.

- **React 19** (aktuálně 19.3; od 19.2 `<Activity>` a `useEffectEvent`),
  React Compiler 1.0 je stabilní — `useMemo`/`useCallback` se učí jako
  „rozumět, ne psát všude".
- **Next.js 16** (aktuálně 16.3) s App Routerem, Turbopack jako výchozí
  bundler, `proxy.ts` místo `middleware.ts`, Cache Components (`"use cache"`).
  Pages Router se nezmiňuje jinak než jako „starý kód, který potkáš".
- **Vite 8** (Rolldown a Oxc místo esbuild a Rollupu).
- **TypeScript 7** (nativní kompilátor v Go, vydán 3. 8. 2026). Node 24 LTS
  spouští `.ts` s „erasable" syntaxí bez kompilace (`erasableSyntaxOnly`).
- **React Router v7** (režim knihovny pro SPA; framework režim = bývalý Remix),
  TanStack Router jako typově bezpečná alternativa.
- **TanStack Query v5** pro serverová data v klientovi.
- **Zod 4** pro validaci na hranici (schéma = kontrola + typ).
- **Better Auth** jako doporučená knihovna pro nové projekty; Auth.js je
  v režimu údržby (převzal ho tým Better Auth) a zmíní se jako „potkáš v cizím kódu".
- **Drizzle ORM** nad SQLite a PostgreSQL, migrace přes `drizzle-kit`.
- **Express 5** jako ukázka frameworku nad `node:http`.
- **Tailwind CSS v4** (v Akademii 4.3): konfigurace v CSS (`@import "tailwindcss"`,
  `@theme`, `@utility`, `@custom-variant`, `@source`), bez `tailwind.config.js`;
  v projektech přes `@tailwindcss/vite`, v krocích prohlížečová verze
  `@tailwindcss/browser` (jen pro výuku a prototypy, ne do produkce).
- **GSAP 3.15** — od roku 2025 zdarma včetně dřívějších placených pluginů
  (SplitText, MorphSVG); ScrollTrigger, Flip a SplitText se učí jako standard.
- **Motion 13** (dříve Framer Motion): `motion` pro čistý JS (`animate`,
  `scroll`, `inView`), `motion/react` pro React. **Lenis 1.3** pro plynulé scrollování.
- **Three.js r186** s `WebGLRenderer`; `WebGPURenderer` a TSL se zmíní jako směr,
  do kterého knihovna jde.
- **shadcn/ui** (CLI `shadcn`, Tailwind v4, jednotný balíček `radix-ui`),
  `class-variance-authority`, `tailwind-merge` 3, `clsx`.
- **View Transitions API** v rámci jednoho dokumentu je Baseline; přechody mezi
  dokumenty a CSS animace řízené scrollem (`animation-timeline`) nemají
  podporu ve všech prohlížečích — autor ověří stav a vždy učí jako progresivní
  vylepšení.
- **ESLint flat config**, Vitest, Playwright, MSW.
- **Node 24 LTS** jako cílová verze v zadáních (Akademie sama běží na novějším).

---

# Část 1 — Web a CSS

Od prázdného souboru k responzivní, přístupné, dobře navržené a animované
stránce. CSS má největší hloubku: uživatel musí umět vysvětlit, **proč** se
prvek chová, jak se chová, ne jen zkoušet vlastnosti, dokud to nevypadá dobře.
Na čisté CSS navazuje Tailwind a efekty řízené JavaScriptem (GSAP, Motion,
Lenis); 3D přes Three.js je rozšíření.

## 1.1 `html-zaklady` — HTML a jak funguje web

**Úroveň:** jádro
**Odhad:** ~9 h
**Předpoklady:** žádné

**Po sekci umíš:**
- vysvětlit, co se stane mezi napsáním adresy a vykreslením stránky (URL, DNS, HTTP, DOM),
- napsat validní HTML dokument se sémantickou strukturou a landmarky,
- správně použít nadpisy, odkazy, obrázky, seznamy a tabulky,
- najít odpověď na MDN a přečíst tabulku podpory,
- prohlédnout si stránku v DevTools (Elements, Network).

**Moduly:**
- **lesson** `jak-funguje-web` — *Jak funguje web* — klient a server, URL
  (schéma, doména, cesta, query, fragment), DNS jednou větou, HTTP požadavek
  a odpověď (metoda, stavový kód, hlavičky, tělo), co prohlížeč udělá s HTML
  (parsování → DOM → CSSOM → vykreslení). DevTools: Elements a Network.
  Cvičení: `pretest` („co uvidíš, když stránka neexistuje?").
- **lesson** `anatomie-dokumentu` — *Anatomie HTML dokumentu* — `<!DOCTYPE html>`,
  `html lang`, `head` vs. `body`, `meta charset` a `viewport`, `title`,
  prvek/tag/atribut, vnořování, prázdné prvky, bílé znaky, entity, komentáře.
  Prohlížeč chyby tiše opravuje — proč je to past. Cvičení: `predict`
  (dom volby: jak prohlížeč „opraví" neuzavřený `<p>` uvnitř `<ul>`).
- **lesson** `mdn-a-dokumentace` — *Jak číst MDN* — struktura stránky prvku
  a vlastnosti, Baseline a tabulka kompatibility, jak hledat, kdy věřit
  Stack Overflow. Cvičení: `check` s úkolem „najdi v anglické dokumentaci".
- **workshop** `workshop-recept` [dom] — *Stránka s receptem* — staví: recept
  s nadpisem, úvodem, obrázkem, seznamem surovin (`ul`), postupem (`ol`),
  tabulkou nutričních hodnot a odkazy. Učí: `h1`–`h6` a hierarchie, `p`,
  `strong` vs. `b`, `em` vs. `i`, `a href` (absolutní, relativní, `#kotva`,
  `mailto:`), `img` s `alt`, `width`/`height` proti poskakování, `figure`.
  ~20 kroků. Cvičení: `debug` (obrázek se nenačte kvůli relativní cestě
  `../img` — Hlášení „na stránce je rozbitý obrázek"), `parsons` (řádky
  tabulky `thead`/`tbody`/`tr`), `explain` (proč `alt` a kdy prázdný).
- **lesson** `semanticka-struktura` — *Sémantická struktura stránky* — `header`,
  `nav`, `main`, `article`, `section`, `aside`, `footer`; kdy `div` a `span`;
  `time datetime`, `address`, `blockquote`/`cite`; outline nadpisů; co mění
  sémantika pro čtečku, vyhledávač a režim čtení. Cvičení: `explain`
  (`article` vs. `section`).
- **workshop** `workshop-blog` [dom] — *Článek na blogu* — staví: stránka blogu
  s hlavičkou, navigací, článkem, bočním panelem a patičkou. Učí: landmarky,
  tabulka s `caption` a `th scope`, `picture` a `srcset`/`sizes`,
  `loading="lazy"`, `details`/`summary`. ~22 kroků. Cvičení: `debug`
  (dva `main` a nadpisy přeskakující úroveň), `vyber-sam` (vhodný prvek pro
  datum a autora bez jmenování).
- **lab** `lab-profil` [dom] — *Profilová stránka* — samostatně: osobní stránka
  se sémantickou kostrou, obrázkem, seznamy, tabulkou a odkazy. Cvičení:
  `pred-startem`.
- **quiz** `kviz` — *Kvíz: HTML a web* — URL a HTTP, struktura dokumentu, výběr
  sémantického prvku, `alt` texty, chyby, které prohlížeč „opraví". Cvičení:
  `code` (stránka o ~80 řádcích s chybami v sémantice).

## 1.2 `start-nastroje` — Start: nástroje a jak se učit

**Úroveň:** jádro *(nová)*
**Odhad:** ~6 h
**Předpoklady:** `html-zaklady`

**Po sekci umíš:**
- učit se v Akademii účinně: předpovídat před spuštěním, brát nápovědy po stupních, opakovat s odstupem, psát si poznámky a ptát se s minimálním příkladem,
- používat AI k učení tak, aby vysvětlovala, a ne psala řešení za tebe,
- pracovat s projektem ve VS Code (složka, integrovaný terminál, formátování, hledání),
- v terminálu se pohybovat po složkách a spustit program,
- založit Git repozitář, commitovat po malých krocích a pushnout na GitHub,
- zveřejnit statický web přes GitHub Pages.

**Moduly:**
- **lesson** `jak-se-ucit-v-akademii` — *Jak se učit v Akademii* — proč
  vybavování z paměti a opakování s odstupem (fronta Opakování, Leitner),
  předpověď před spuštěním, nápovědy po stupních a co znamená otevřít řešení
  (stav `assisted`, opakování naslepo), poznámky a „Nerozumím", jistota
  odpovědi a kalibrace, „Postavit znovu naslepo", cvičné úlohy; jak se ptát
  (co jsem čekal, co se stalo, co jsem zkusil, minimální příklad). Cvičení:
  `pretest` („pomůže víc třikrát přečíst, nebo jednou si vybavit?"), `predict`
  (ukázka režimu na jednoduchém HTML), `explain` (proč opakovat s odstupem).
- **lesson** `uceni-s-ai` — *Učení s AI bez zkratek* — kdy AI učení pomáhá
  a kdy ho krade: nejdřív vlastní pokus a hypotéza, AI jako tutor (ať vysvětlí
  pojem nebo chybovou hlášku, ne ať napíše řešení), sokratovské zadání („ptej
  se mě, dokud na to nepřijdu"), ověřování tvrzení v MDN, sebejistý omyl na
  ukázce, nikdy nekopírovat kód, kterému nerozumíš, kdy AI vypnout (první
  pokus, kvízy, laby, opakování). Odkaz na hloubku v `prace-s-ai`.
  Cvičení: `check` (které zadání podporuje učení).
- **lesson** `vs-code` — *VS Code a projekt na disku* — otevření složky,
  `code .`, průzkumník, integrovaný terminál, Ctrl+P a hledání v projektu,
  více kurzorů, Emmet, formátování při uložení, pár rozšíření (a proč ne
  desítky), náhled statické stránky.
- **lesson** `terminal-minimum` — *Terminál: minimum na začátek* — prompt,
  `pwd`, `ls`, `cd`, relativní a absolutní cesty, `~` a `..`, `mkdir`,
  `node soubor.js`, Tab doplnění, šipka nahoru, Ctrl+C. Víc v
  `nastroje-git-terminal`. Cvičení: `predict` (kde jsem po `cd ../obrazky`).
- **workshop** `workshop-prvni-repozitar` [node] — *První repozitář* — staví:
  Git repozitář malé stránky. Učí: `git config`, `init`, `status`, `add`,
  `commit`, `log --oneline`, `.gitignore`, druhý commit, `diff`, remote na
  lokální „GitHub" (bare repozitář ve složce, bez sítě) a `push`. Testy přes
  `helpers.run('git …')`. ~12 kroků. Cvičení: `debug` (commit „neobsahuje"
  změnu, protože soubor nebyl v staging area), `explain` (co je commit a proč
  malý).
- **lesson** `github-a-pages` — *GitHub a GitHub Pages* — účet, přihlášení
  (`gh auth login` nebo SSH klíč), nový repozitář, `push`, README, zapnutí
  Pages, výsledná URL, co je statický hosting; Netlify a Cloudflare Pages
  jednou větou. Postup se sítí je checklist bez testů.
- **quiz** `kviz` — *Kvíz: nástroje a učení* — co udělá příkaz, stav repozitáře
  po sérii příkazů, kam vede cesta, kdy otevřít nápovědu a kdy řešení, které
  použití AI učení pomáhá.
- **project** `projekt-profil-na-githubu` [node] — *Profil na GitHubu* — zadání:
  profilovou stránku z `html-zaklady/lab-profil` dát do repozitáře po aspoň
  třech commitech s rozumnými zprávami, `.gitignore`, README s odkazem na
  GitHub Pages. Testy: repozitář existuje, ≥ 3 commity, pracovní adresář čistý,
  README obsahuje URL tvaru `https://….github.io/…`. Cvičení: `review`.

## 1.3 `css-zaklady` — Základy CSS

**Úroveň:** jádro
**Odhad:** ~9 h
**Předpoklady:** `html-zaklady`

**Po sekci umíš:**
- připojit a napsat styly a vybrat prvky základními selektory,
- pracovat s barvami, jednotkami a typografií,
- zavést vlastní vlastnosti pro barvy a rozestupy (design tokeny),
- najít v DevTools, které pravidlo prvek stylují, co je přeškrtnuté a jaká je spočtená hodnota.

**Moduly:**
- **lesson** `jak-css-funguje` — *Jak CSS funguje* — pravidlo, selektor,
  deklarace; `link` vs. `style` vs. atribut `style`; výchozí styly prohlížeče;
  neplatná deklarace se tiše zahodí. Cvičení: `pretest`, `predict` (dom volby:
  co udělá `color: #ff00` s neplatnou hodnotou).
- **lesson** `devtools-pro-css` — *DevTools pro CSS* *(nová)* — Elements,
  panel Styles (přeškrtnuté a neaktivní deklarace s vysvětlivkou), Computed
  a „odkud hodnota přišla", úprava hodnot šipkami, přepnutí stavu `:hover`,
  odznak `flex`/`grid` u prvku, box model v Layout, jak najít kód náhledu
  z Akademie v DevTools (B11). Cvičení: `check` s úkoly „najdi v DevTools".
- **lesson** `selektory-zaklad` — *Selektory* — typ, třída, id, atributové
  selektory, kombinátory, skupina, `:hover`, `:focus-visible`, `:first-child`,
  `:nth-child()`, `::before`/`::after`; pojmenování tříd (BEM zmínkou).
  Cvičení: `predict` (které prvky se obarví).
- **workshop** `workshop-vizitka` [dom] — *Digitální vizitka* — staví: vizitka
  se jménem, fotkou, kontakty a tlačítkem. Učí: barvy (`#hex`, `rgb()`, `hsl()`,
  `oklch()` zmínkou), `background`, `border`, `border-radius`, systémový stack
  písma, `font-size`, `font-weight`, `line-height`, `text-align`, stavy odkazů.
  ~22 kroků. Cvičení: `debug` (styl se neprojeví kvůli překlepu v názvu třídy —
  najít v DevTools), `vyber-sam` (zvýrazni tlačítko při najetí).
- **lesson** `jednotky-a-hodnoty` — *Jednotky a hodnoty* — `px`, `em` vs. `rem`
  (proč `em` násobí), `%` (vůči čemu), `vw`/`vh`/`dvh`/`svh`, `ch`, `calc()`,
  `min()`/`max()`/`clamp()`. Cvičení: `controls` (range pro `font-size` rodiče,
  vedle prvky v `em` a `rem`), `predict` ×2 (kolik px je `1.5em` ve vnořeném prvku).
- **lesson** `vlastni-vlastnosti` — *Vlastní vlastnosti (CSS proměnné)* —
  `--token`, `var(--token, fallback)`, definice na `:root`, přepsání
  v komponentě, dědičnost, neplatná hodnota za běhu, `color-mix()`, design tokeny.
  Cvičení: `predict` (proč se nevrátí fallback), `explain` (token vs. natvrdo).
- **workshop** `workshop-typografie` [dom] — *Typografie článku* — staví:
  čitelná stránka článku (navazuje na blog z `html-zaklady`). Učí: stupnice
  písma v `rem`, šířka řádku v `ch`, vertikální rytmus, `text-wrap: balance`
  a `pretty`, `hyphens` s `lang`, tokeny barev a rozestupů. ~20 kroků.
  Cvičení: `debug` (token přepsaný na špatném místě), `parsons` (blok tokenů na `:root`).
- **lab** `lab-karta-produktu` [dom] — *Karta produktu* — samostatně: karta
  s cenou, štítkem a tlačítkem, barvy a rozestupy přes tokeny. Cvičení:
  `pred-startem`, `approaches` (tokeny na `:root` vs. na komponentě).
- **quiz** `kviz` — *Kvíz: základy CSS* — co vybere selektor, `em` vs. `rem`,
  výsledek `calc()`, vlastní vlastnosti a fallback, co ukazuje Computed.

## 1.4 `html-formulare` — Formuláře

**Úroveň:** jádro
**Odhad:** ~7 h
**Předpoklady:** `html-zaklady`

**Po sekci umíš:**
- postavit formulář, který funguje bez JavaScriptu,
- dát každému poli přístupný popisek a seskupit související pole,
- validovat vstup v prohlížeči a vysvětlit, proč to nenahrazuje kontrolu na serveru,
- říct, co a pod jakým jménem se odešle metodou GET a POST.

**Moduly:**
- **lesson** `jak-funguje-formular` — *Jak funguje formulář* — `form action`
  a `method` (GET do URL vs. POST do těla), `name` jako klíč, `button type`
  (výchozí `submit` — častá past), odeslání Enterem, co uvidíš v Network.
  Cvičení: `pretest`, `predict` (jak bude vypadat URL po odeslání GET).
- **workshop** `workshop-registrace` [dom] — *Registrační formulář* — staví:
  registrace na akci. Učí: `label for`/`id` a obalení, typy `input`, `select`
  a `optgroup`, `textarea`, `fieldset`/`legend`, `autocomplete`, `placeholder`
  není label. ~22 kroků. Cvičení: `debug` (tlačítko „Zpět" odesílá formulář),
  `parsons` (`fieldset` s radio skupinou), `explain` (proč label, ne placeholder).
- **lesson** `validace-v-prohlizeci` — *Validace v prohlížeči* — `required`,
  `minlength`/`maxlength`, `min`/`max`/`step`, `pattern`, `type` jako validace,
  `novalidate`, `:valid`/`:invalid`/`:user-invalid`, limity hlášek.
  Cvičení: `predict` (projde `step="0.01"` s hodnotou 1.005?).
- **workshop** `workshop-objednavka` [dom] — *Objednávkový formulář* — staví:
  objednávka s doručením a platbou. Učí: skupiny radio, `output`, `range`,
  `datalist`, chyby přes `aria-describedby`, `inputmode`, nápověda k formátu.
  ~18 kroků. Cvičení: `debug` (radio tlačítka nemají stejné `name`, dají se
  vybrat obě), `vyber-sam` (vhodný typ pole pro PSČ).
- **lab** `lab-kontaktni-formular` [dom] — *Kontaktní formulář* — samostatně:
  formulář s validací, skupinami a srozumitelnými popisky. Cvičení: `pred-startem`.
- **quiz** `kviz` — *Kvíz: formuláře* — GET vs. POST, co se odešle a pod jakým
  jménem, label a přístupné jméno, validace. 20–30 % otázek z `html-zaklady`.

## 1.5 `html-pristupnost` — Přístupnost

**Úroveň:** jádro
**Odhad:** ~10 h
**Předpoklady:** `html-formulare`, `start-nastroje`
**Doporučeno předem:** `css-zaklady`

**Po sekci umíš:**
- projít stránku klávesnicí a čtečkou a popsat, co uživatel slyší,
- najít a opravit nejčastější chyby přístupnosti,
- rozhodnout, kdy ARIA pomáhá a kdy škodí,
- ověřit kontrast, roli a přístupné jméno v DevTools,
- zveřejnit web po malých commitech na vlastní URL.

**Moduly:**
- **lesson** `proc-pristupnost` — *Kdo používá web jinak* — čtečky, klávesnice,
  zvětšení, snížený kontrast, kognitivní zátěž; WCAG 2.2 A/AA ve zkratce;
  European Accessibility Act jednou větou.
- **lesson** `strom-pristupnosti` — *Strom přístupnosti* — role, přístupné jméno
  a stav; výpočet jména; panel Accessibility v DevTools; první pravidlo ARIA.
  Cvičení: `predict` ×3 (co přečte čtečka u daného kódu), `explain` (přístupné jméno).
- **lesson** `klavesnice-a-fokus` — *Klávesnice a fokus* — pořadí fokusu =
  pořadí v DOM, `tabindex` 0 vs. −1, „Přeskočit na obsah", `button` vs. `a`
  vs. klikací `div`, viditelný fokus.
- **workshop** `workshop-oprava-pristupnosti` [dom] — *Oprava nepřístupné
  stránky* — staví: z rozbité stránky obchodu přístupnou. Učí: klikací `div`
  → tlačítko, `alt` (i prázdný), labely, landmarky, hierarchie nadpisů,
  `aria-live`, `aria-expanded`, jazyk dokumentu, texty odkazů. ~22 kroků.
  Cvičení: kroky jsou z povahy věci opravy — každý desátý jako `debug`
  s hlášením uživatele čtečky („slyším jen ‚obrázek, obrázek, odkaz‘").
- **lesson** `aria-vzory` — *ARIA: kdy a jak* — `aria-hidden`, `aria-current`,
  `aria-describedby`, `role="alert"` vs. `status`, vzory z APG, skrytí pro oči
  vs. pro čtečku (`.visually-hidden`, `hidden`, `inert`).
  Cvičení: `predict` (co udělá `aria-hidden` na prvku s fokusem).
- **lab** `lab-audit` [dom] — *Audit přístupnosti* — samostatně: opravit stránku
  s deseti skrytými problémy, každý test = jeden problém.
- **quiz** `kviz` — *Kvíz: přístupnost* — přístupné jméno, role, pořadí fokusu,
  špatné použití ARIA. Cvičení: `code` (formulář a menu o ~100 řádcích).
- **project** `projekt-portfolio-html` [dom] — *Osobní portfolio* — zadání:
  vícestránkový web (úvod, projekty, kontakt s formulářem), plně sémantický
  a přístupný, se základními styly z `css-zaklady` (bez layoutu). **Nově:**
  v Gitu po malých commitech a nasazený na URL. Testy: struktura, landmarky,
  hierarchie nadpisů, labely, alt texty, odkazy mezi stránkami. Git historii
  a nasazení kontroluje rubrika `review` (runtime `dom` nevidí do Gitu).
  Portfolio se vylepšuje dál v `css-animace/projekt-landing-page`.

## 1.6 `css-kaskada` — Selektory a kaskáda do hloubky

**Úroveň:** jádro
**Odhad:** ~8 h
**Předpoklady:** `css-zaklady`

**Po sekci umíš:**
- u libovolného pravidla předem říct, zda vyhraje, a proč,
- spočítat specificitu selektoru a porovnat dva selektory,
- vysvětlit dědičnost a klíčová slova `inherit`, `initial`, `unset`, `revert`,
- uspořádat styly do vrstev `@layer` místo přebíjení přes `!important`,
- psát moderní selektory (`:is()`, `:where()`, `:has()`) a vnořené CSS.

**Moduly:**
- **lesson** `kaskada` — *Kaskáda: kdo vyhraje* — původ a důležitost, vrstvy
  `@layer`, specificita, pořadí ve zdroji, inline styly, `!important` obrací
  pořadí vrstev. Cvičení: `pretest`, `predict` ×3 (dom volby: jakou barvu má
  text), `explain` (pořadí kaskády vlastními slovy).
- **lesson** `specificita` — *Specificita* — trojice (A, B, C), porovnání
  zleva, `*` a kombinátory, `:is()`/`:not()`/`:has()` přebírají nejvyšší
  argument, `:where()` nulu; jak z války specificity ven. Cvičení: `specificita`
  (kalkulačka u každého příkladu), `predict` ×2.
- **lesson** `dedicnost` — *Dědičnost a výchozí hodnoty* — které vlastnosti
  dědí, `inherit`, `initial`, `unset`, `revert`, `revert-layer`, `all`;
  spočtená vs. použitá hodnota; formulářové prvky nedědí písmo.
  Cvičení: `compare` (tlačítko s `font: inherit` a bez).
- **workshop** `workshop-uklid-stylu` [dom] — *Úklid přebíjejících se stylů* —
  staví: čitelný styl z rozbité šablony (`!important`, id selektory, dlouhé
  řetězce). Učí: `@layer reset, base, components, utilities`, snížení
  specificity, `:where()` v resetu, import do vrstvy, ladění přes Computed.
  ~20 kroků. Cvičení: `debug` ×2 (pravidlo ve vrstvě `utilities` prohrává
  s nevrstveným stylem; `!important` ve vrstvě `reset` vyhrává), `specificita`.
- **lesson** `moderni-selektory` — *Moderní selektory a nesting* — `:is()`,
  `:where()`, `:not()` se seznamem, `:has()` (formulář s chybou, kvantitní
  dotazy), `:focus-within`, `:user-invalid`; nesting a jeho specificita; `@scope`.
  Cvičení: `predict` (specificita vnořeného pravidla).
- **workshop** `workshop-odznaky` [dom] — *Systém štítků a stavů* — staví: sadu
  štítků a tlačítek se stavy. Učí: varianty přes `[data-variant]`, `:has()` pro
  kartu podle obsahu, nesting, stavy tlačítek, tokeny pro varianty. ~18 kroků.
  Cvičení: `parsons` (vnořené pravidlo se stavy), `vyber-sam` (karta s obrázkem
  vypadá jinak — bez jmenování `:has()`).
- **lab** `lab-motiv-formulare` [dom] — *Styly formuláře* — samostatně: formulář
  ve vrstvách, chyby přes `:user-invalid` a `:has()`, bez `!important`.
  Cvičení: `approaches` (`:has()` na formuláři vs. třída na poli).
- **quiz** `kviz` — *Kvíz: kaskáda* — které pravidlo vyhraje, výpočet
  specificity, dědičnost, `@layer` a `!important`, `:where()` vs. `:is()`.
  Cvičení: `code` (stylopis o ~100 řádcích se třemi vrstvami).

## 1.7 `css-box-model` — Box model a tok dokumentu

**Úroveň:** jádro
**Odhad:** ~6 h
**Předpoklady:** `css-kaskada`

**Po sekci umíš:**
- spočítat šířku a výšku boxu pro `content-box` i `border-box`,
- vysvětlit, proč se margin slil nebo „utekl" z rodiče,
- říct, co je blokový formátovací kontext a jak ho založit,
- popsat, jak se block a inline prvky skládají v normálním toku,
- ošetřit přetečení dlouhého textu a obrázků.

**Moduly:**
- **lesson** `box-model` — *Box model* — content, padding, border, margin;
  `box-sizing`; `min-*`/`max-*`; `auto` šířka; logické vlastnosti.
  Cvičení: `controls` (padding, border, toggle `box-sizing`, vedle vypsaná
  výsledná šířka), `predict` ×2 (šířka v px).
- **lesson** `normalni-tok` — *Normální tok, block a inline* — blokové a řádkové
  boxy, `display`, proč inline prvku nejde nastavit výška, mezera pod obrázkem,
  `display: none` vs. `visibility: hidden`. Cvičení: `compare` (`span` s `height`
  jako inline a inline-block).
- **lesson** `margin-collapse-a-bfc` — *Margin collapse a BFC* — kdy se marginy
  slévají a kdy ne, co zakládá BFC, `gap` jako lepší náhrada.
  Cvičení: `predict` (jak velká je mezera mezi dvěma bloky), `explain` (BFC).
- **workshop** `workshop-rozestupy` [dom] — *Rozestupová stupnice* — staví:
  stránka s kartami a sekcemi, kde se opraví náhodné marginy. Učí: `border-box`
  reset, stupnice rozestupů, `margin-inline: auto`, `max-inline-size`,
  `flow-root`, „stack" vzor, `gap`. ~18 kroků. Cvičení: `debug` (nadpis
  v kartě posune celou kartu dolů — margin collapse).
- **lesson** `preteceni` — *Přetečení a velikost obsahu* — `overflow` a jeho
  vedlejší efekty, `overflow-wrap: anywhere`, `text-overflow: ellipsis`,
  `min-content`/`max-content`/`fit-content`, `aspect-ratio`, `object-fit`,
  `float` jen na obtékání. Cvičení: `predict` (proč se text neořízne třemi tečkami).
- **lab** `lab-clanek-s-obrazky` [dom] — *Článek s obtékanými obrázky* —
  samostatně: článek s obtékaným obrázkem, citací, dlouhými URL a kartou.
  Cvičení: `layout`.
- **quiz** `kviz` — *Kvíz: box model* — šířka boxu, kde se margin slije, co
  založí BFC, inline a `height`. 20–30 % otázek z `css-kaskada`.

## 1.8 `css-flexbox` — CSS Flexbox *(pilotní sekce)*

**Úroveň:** jádro
**Odhad:** ~6 h
**Předpoklady:** `css-box-model`

**Po sekci umíš:**
- rozvrhnout prvky v jedné ose flexboxem a u každého zarovnání říct, na které ose pracuje,
- vysvětlit, jak `flex-grow`, `flex-shrink` a `flex-basis` dělí volné místo, a spočítat šířku položky,
- opravit položku, která se nechce zmenšit (`min-width: auto`),
- zalomit položky do více řádků bez media dotazu,
- rozhodnout, kdy stačí flexbox a kdy sáhnout po gridu.

Stav na disku (`content/css-flexbox/section.json`) a plánované úpravy D4, D5:

- **lesson** `uvod-do-flexboxu` — *Úvod do flexboxu* (15 min) — problém prvků
  vedle sebe, flex kontejner a položky, hlavní a vedlejší osa,
  `justify-content`, `align-items`, `gap`, typické chyby. Dnes 7 živých ukázek
  a 4 otázky na konci.
  **Úpravy (D5):** `controls` u os (select `flex-direction`, `justify-content`,
  `align-items`, vedle živý řádek CSS), `check` po každé části `##`, `pretest`
  („stačí `display: flex` na položce?").
- **workshop** `workshop-navigace` [dom] — *Postav hlavičku a karty* (60 min) —
  staví: hlavička s logem, navigací a tlačítkem, karty s cenou u dna a patička.
  Dnes 22 kroků:
  001 flex kontejner · 002 zarovnání na vedlejší ose · 003 mezera · 004 flex
  uvnitř flexu · 005 rozdělení volného místa · 006 automatický margin ·
  007 položka, která se nesmí zmenšit · 008 zalomení · 009 položka přes celý
  řádek · 010 pořadí a přístupnost · 011 karty v řadě (zopakuj sám) ·
  012 karty se zalamují · 013 výchozí šířka karty · 014 karty rostou ·
  015 zkratka `flex` · 016 past s `min-width` · 017 karta jako sloupec ·
  018 `align-self` · 019 patička karty u dna · 020 cena a tlačítko (zopakuj
  sám) · 021 centrování v obou osách · 022 patička stránky a shrnutí.
  **Úpravy (D4):**
  - kroky 005, 013, 014, 018 a 019 přepsat na „cíl + kandidáti" (zeslabení
    ve druhé a třetí třetině),
  - nový krok **`debug`** mezi 016 a 017: `.card { flex: 1 }` — karty
    ignorují výchozí šířku 15rem (Hlášení: „na širokém monitoru jsou karty
    různě široké podle textu"); workshop tím má 23 kroků,
  - `explain` k `min-width: 0` za krokem 016,
  - `predict` v kroku 017 („co udělá `stretch` se štítkem?"),
  - z kroku 021 přesunout prozrazenou odpověď do `explain`,
  - kroky 007–010 přepsat na přepínač šířky náhledu (B11) místo rady
    s dočasným `max-width` a tažením předělu,
  - `help` (2–3 tipy) u kroků 008 a dál.
- **lesson** `flex-do-hloubky` — *Flex do hloubky* (20 min) — tři čísla
  basis/grow/shrink, růst a zmenšování v číslech, zkratka `flex` a výchozí
  hodnoty, `min-width: auto`, flexbox nebo grid, pasti. Dnes 5 živých ukázek
  a 4 otázky.
  **Úpravy (D5):** `controls` s posuvníky `flex-grow` A/B a šířkou kontejneru,
  `compare` pro `width: 2000px` ve flow vs. ve flexu, 3× `predict` „jak široká
  bude položka (px)", `explain` k `min-width: auto`, `check` po částech.
- **lab** `lab-cenik` [dom] — *Ceník tarifů* (40 min) — samostatně: tři tarify
  vedle sebe, stejně široké a vysoké, tlačítka u dna, zvýrazněný Plus, pod
  sebou na 480 px bez media dotazu, bez vodorovného posuvu. Dnes 11 požadavků.
  **Úpravy (D5):** `pred-startem`, `approaches` (wrap + basis vs. media dotaz
  vs. grid `auto-fit`), `layout`, nejvýš 2 tipy `help`.
- **quiz** `kviz` — *Kvíz: CSS Flexbox* (15 min) — 13 otázek na čtení kódu
  (proč položky pod sebou, `align-items` bez výšky, zdeformovaný obrázek,
  výpočty šířek, `nowrap` a ellipsis, `margin-inline-start: auto`
  s `justify-content`, `order` a přístupnost, poslední řádek zalomených karet,
  patičky karet, flex vs. grid).
  **Úpravy:** D5 kvíz nemění. Pravidla A14.4 (psané odpovědi, 20–30 % otázek
  z `css-box-model` a `css-kaskada`, sada `code`) doplnit, až ty sekce vzniknou.
- **Soubory sekce (D5):** `tahak.md` s tabulkou justify-content / align-items /
  align-content (osa, na co působí, kdy nemá efekt), `cards.md` (~20 karet:
  `flex: 1` vs. `flex: auto`, `min-width: 0`, `align-content` bez wrap…),
  `pojmy.md`, `outcomes`.

## 1.9 `css-grid` — CSS Grid

**Úroveň:** jádro
**Odhad:** ~7 h
**Předpoklady:** `css-flexbox`

**Po sekci umíš:**
- postavit dvourozměrný layout stránky s pojmenovanými oblastmi,
- udělat mřížku karet, která se přizpůsobí šířce bez media dotazů,
- zarovnat obsah napříč kartami přes subgrid,
- vysvětlit, proč se sloupec `1fr` nechce zmenšit, a opravit to,
- rozhodnout pro konkrétní rozvržení mezi gridem a flexboxem.

**Moduly:**
- **lesson** `uvod-do-gridu` — *Úvod do gridu* — `grid-template-columns`/`rows`,
  `fr`, `repeat()`, `gap`, explicitní vs. implicitní mřížka, čísla čar, `span`,
  Grid inspector. Cvičení: `controls` (select šablony sloupců, range `gap`),
  `predict` (kam spadne sedmá položka).
- **workshop** `workshop-kostra-stranky` [dom] — *Kostra aplikace* — staví:
  layout s hlavičkou, bočním panelem, obsahem a patičkou. Učí:
  `grid-template-areas`, pojmenované čáry, `minmax(0, 1fr)`, přeskládání
  v media query, `place-items`, `min-block-size: 100dvh`. ~20 kroků.
  Cvičení: `debug` (dlouhá URL roztáhne hlavní sloupec — `1fr` vs.
  `minmax(0, 1fr)`), `explain` (proč `minmax(0, 1fr)`).
- **lesson** `mrizka-bez-media-queries` — *Mřížka, která se přizpůsobí sama* —
  `auto-fill` vs. `auto-fit`, `min()` v `minmax`, `dense` a pořadí.
  Cvičení: `compare` (auto-fill vs. auto-fit se dvěma položkami).
- **workshop** `workshop-galerie` [dom] — *Galerie a obchod* — staví: mřížka
  karet s velkou doporučenou kartou. Učí: auto-fill, položka přes dva sloupce,
  `aspect-ratio`, subgrid, grid uvnitř karty. ~18 kroků. Cvičení: `parsons`
  (subgrid na kartě), `vyber-sam` (ceny karet na jedné výšce — bez jmenování subgridu).
- **lesson** `grid-nebo-flex` — *Grid, nebo flexbox?* — layout zvenku vs. obsah
  zevnitř, typické vzory (sidebar, stack, cluster, pancake).
- **lab** `lab-dashboard` [dom] — *Dashboard* — samostatně: dlaždice různých
  velikostí, boční panel, přizpůsobivá mřížka. Cvičení: `layout`, `approaches`
  (areas vs. čísla čar).
- **quiz** `kviz` — *Kvíz: grid* — `fr` a `minmax`, auto-fill vs. auto-fit, kam
  spadne položka, grid vs. flex. 20–30 % otázek z `css-flexbox`.

## 1.10 `css-pozicovani` — Pozicování a vrstvení

**Úroveň:** jádro
**Odhad:** ~7 h
**Předpoklady:** `css-grid`

**Po sekci umíš:**
- zvolit hodnotu `position` a najít containing block,
- vysvětlit, proč `z-index: 9999` nepomáhá (stacking context), a opravit to,
- rozchodit `sticky` a poznat, co ho rozbilo,
- postavit rozbalovací nabídku a tooltip nativně přes `popover` a anchor positioning.

**Moduly:**
- **lesson** `position` — *Pět hodnot `position`* — `static` až `sticky`,
  containing block (i `transform` u `fixed`), `inset`, podmínky `sticky`.
  Cvičení: `controls` (select `position`, range `top`), `predict` (vůči čemu
  se umístí `absolute`).
- **lesson** `stacking-context` — *Stacking context a `z-index`* — pořadí
  vykreslení, co zakládá kontext, proč se prvek nedostane nad sourozence rodiče,
  škála `z-index` v tokenech. Cvičení: `predict` ×2, `explain` (stacking context).
- **workshop** `workshop-lepici-lista` [dom] — *Přilepená lišta a boční panel* —
  staví: přilepená hlavička, sticky panel, štítek na kartě, tlačítko „nahoru".
  Učí: `sticky` s `top`, oprava přes `overflow` předka, `absolute` v `relative`,
  `isolation: isolate`, `scroll-margin-top`. ~18 kroků. Cvičení: `debug`
  (sticky panel se nelepí kvůli `overflow: hidden` na obalu), `debug` (menu
  pod kartou kvůli `transform` na kartě).
- **lesson** `top-layer-a-kotveni` — *Top layer a anchor positioning*
  *(sloučené lekce)* — atribut `popover` (`auto` vs. `manual`),
  `popovertarget`, `<dialog>` zmínkou (JS v `js-dom`), `::backdrop`, light
  dismiss, fokus; `anchor-name`, `position-anchor`, `position-area`,
  `anchor()`, `position-try-fallbacks`, progresivní vylepšení.
  Cvičení: `controls` (select `position-area`).
- **workshop** `workshop-rozbalovacka` [dom] — *Nabídka u avataru a tooltip* —
  staví: nabídka a tooltipy bez JavaScriptu. Učí: `popover`, ukotvení,
  záložní polohy u okraje, `:popover-open`, přístupné jméno. ~10 kroků.
  Cvičení: `vyber-sam` (nabídka nesmí vyjet mimo okno).
- **lab** `lab-modalni-okno` [dom] — *Galerie s náhledem* — samostatně: mřížka
  obrázků, štítky přes `absolute`, přilepený filtr a náhled přes popover.
- **quiz** `kviz` — *Kvíz: pozicování* — containing block, co založí stacking
  context, proč nefunguje `sticky`, `popover` vs. `dialog`. Cvičení: `code`.

## 1.11 `css-responzivita` — Responzivní design a témata

**Úroveň:** jádro
**Odhad:** ~7 h
**Předpoklady:** `css-grid`

**Po sekci umíš:**
- postavit stránku mobile-first, která funguje od 320 px po široký monitor,
- zvolit media query nebo container query podle toho, na co se komponenta ptá,
- nastavit plynulou typografii a rozestupy přes `clamp()`,
- udělat světlý a tmavý motiv podle systému a respektovat preference uživatele.

**Moduly:**
- **lesson** `mobile-first` — *Mobile-first* — `meta viewport`, breakpointy
  podle obsahu, syntaxe rozsahů `(width >= 48rem)`, responzivní režim DevTools
  a přepínač šířky náhledu. Cvičení: `predict` (které pravidlo platí na 700 px).
- **workshop** `workshop-landing-mobil` [dom] — *Responzivní úvodní stránka* —
  staví: landing page služby z jednoho sloupce do více. Učí: mobile-first,
  breakpointy, responzivní navigace, `clamp()`, `srcset`, dotykové cíle 44 px.
  ~22 kroků. Cvičení: `debug` (desktopová pravidla přebíjejí mobilní kvůli
  pořadí v souboru), `vyber-sam` (písmo nadpisu roste plynule).
- **lesson** `container-queries` — *Container queries* — `container-type`,
  pojmenované kontejnery, `@container`, `cqi`, style queries zmínkou.
  Cvičení: `compare` (karta v úzkém panelu a v obsahu), `controls` (šířka kontejneru).
- **workshop** `workshop-karta-kontejner` [dom] — *Karta, která se hodí všude* —
  staví: karta článku svislá v panelu, vodorovná v obsahu. ~14 kroků.
  Cvičení: `explain` (media vs. container query).
- **lesson** `preference-uzivatele` — *Preference uživatele a motivy* —
  `prefers-color-scheme`, `color-scheme`, `light-dark()`, dvě sady tokenů,
  `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, `hover`
  a `pointer`, tisk. Cvičení: `controls` (toggle světlý/tmavý).
- **lab** `lab-tmavy-rezim` [dom] — *Blog ve světlém i tmavém režimu* —
  samostatně: responzivní blog s container query kartami a motivem.
  Cvičení: `approaches` (`light-dark()` vs. media dotaz na tokeny).
- **quiz** `kviz` — *Kvíz: responzivita* — media vs. container query, výsledek
  `clamp()`, pořadí pravidel, `light-dark()`. 20–30 % z `css-grid` a `css-pozicovani`.

## 1.12 `css-design` — Design pro vývojáře

**Úroveň:** jádro *(nová)*
**Odhad:** ~9 h
**Předpoklady:** `css-responzivita`
**Navazuje:** `css-tailwind` (tokeny a stupnice z této sekce v `@theme`)

**Po sekci umíš:**
- vytvořit vizuální hierarchii (velikost, váha, barva, rozestupy) a zdůvodnit ji,
- navrhnout paletu v `oklch()` s dostatečným kontrastem pro světlý i tmavý motiv,
- nastavit typografickou stupnici a rytmus rozestupů v tokenech,
- přečíst návrh ve Figmě (auto layout, proměnné, Dev Mode) a převést ho na CSS se spočtenými hodnotami,
- použít SVG a ikony správně (inline vs. soubor, `currentColor`, přístupný popis).

**Moduly:**
- **lesson** `hierarchie-a-rozestupy` — *Hierarchie a rozestupy* — blízkost
  a seskupení, stupnice rozestupů (4/8), velikost vs. váha vs. barva,
  zarovnání, bílé místo, „méně rámečků, víc rozestupů". Cvičení: `compare`
  (karta s rámečky vs. s rozestupy), `controls` (mezera uvnitř vs. mezi skupinami).
- **lesson** `barvy-a-typografie` — *Barvy v oklch a typografie* — `oklch()`
  (světlost, chroma, odstín) a proč místo `hsl()`, stupnice odstínů přes
  relativní barvy `oklch(from var(--brand) …)`, `color-mix()`, kontrast WCAG
  (4.5:1 a 3:1), sémantické vs. primitivní tokeny, modulární stupnice písma,
  variabilní fonty, `@font-face` s `font-display`. Cvičení: `controls`
  (posuvníky L/C/H s živým kontrastním poměrem), `predict` (má hsl žlutá
  a modrá se stejnou světlostí stejný kontrast?).
- **lesson** `cteni-navrhu` — *Čtení návrhu z Figmy* — rámce a auto layout
  (= flex, gap, padding; hug/fill = `fit-content`/`flex: 1`), constraints,
  komponenty a varianty, proměnné jako tokeny, Dev Mode (inspect, export SVG),
  co z návrhu nepřebírat doslova (absolutní pozice, px písma), na co se
  designéra doptat (stavy, prázdný stav, chyby, úzká obrazovka). Ukázky jako
  snímky obrazovky uložené v sekci. Cvičení: `explain` (jak přeložit auto layout).
- **workshop** `workshop-podle-navrhu` [dom] — *Stránka podle návrhu* — staví:
  stránku akce podle přiloženého návrhu (obrázek + specifikace rozměrů
  a tokenů). Testy ověřují spočtené hodnoty: rozestupy, velikosti písma, barvy
  s tolerancí, kontrast. ~20 kroků. Cvičení: `debug` (text v tmavém motivu
  neprojde kontrastem), `vyber-sam` (přelož auto layout skupiny do CSS),
  `parsons` (tokeny palety přes relativní barvy).
- **lesson** `svg-a-ikony` — *SVG a ikony* — `viewBox`, inline SVG vs. `<img>`
  vs. sprite s `<use>`, `currentColor`, velikost v `em`, přístupnost
  (`aria-hidden` u dekorace, `role="img"` s popiskem), SVGO, ikonové sady
  a licence, `mask` pro barvení. Cvičení: `predict` (proč se ikona v `<img>`
  nepřebarví s textem).
- **lab** `lab-komponenta-z-navrhu` [dom] — *Karta z návrhu* — samostatně:
  komponenta podle specifikace ve světlém i tmavém motivu. Cvičení: `layout`,
  `pred-startem`.
- **quiz** `kviz` — *Kvíz: design* — kontrast, `oklch()`, převod auto layoutu,
  přístupnost SVG, hierarchie. Cvičení: `code` (stylopis komponenty s chybami v tokenech).

## 1.13 `css-tailwind` — Tailwind CSS v4

**Úroveň:** jádro *(nová)*
**Odhad:** ~10 h
**Předpoklady:** `css-design`
**Doporučeno předem:** `css-animace` (vlajkový projekt 1 napřed v čistém CSS)

Tailwind se učí jako zkratka za CSS, které uživatel už zná: u každé utility
má umět říct, jakou deklaraci vytvoří. Kroky běží v runtime `dom`
s `libs: ["tailwind"]` (prohlížečová verze generuje CSS z tříd v náhledu
a z `<style type="text/tailwindcss">`). Testy ověřují hlavně spočtené styly
(`getComputedStyle`) v několika šířkách a motivech, ne názvy tříd; regex na
třídu jen tam, kde krok učí konkrétní variantu. Projekty používají
`@tailwindcss/vite`.

**Po sekci umíš:**
- vysvětlit, jak z třídy `px-4` vznikne CSS, a číst dlouhý atribut `class` jako zkratky za vlastnosti, které znáš,
- přenést design tokeny (paleta v `oklch()`, písmo, rozestupy, stíny) do `@theme` a používat je v utilitách i v čistém CSS,
- postavit responzivní stránku s variantami `md:`, `@container`, `hover:`, `focus-visible:`, `dark:`, `group-*` a `peer-*`,
- zvolit mezi smyčkou v šabloně, `@utility`, `@apply` a opakovanou třídou tak, aby markup nebyl kopírovaný,
- rozhodnout pro konkrétní projekt mezi Tailwindem a čistým CSS a zdůvodnit to.

**Moduly:**
- **lesson** `utility-first` — *Utility-first myšlení* — problém: vymýšlení
  jmen tříd, mrtvé CSS a stylopis, který roste s každou stránkou; utilita =
  jedna deklarace nad tokenem (`p-4` = `padding: calc(var(--spacing) * 4)`);
  Tailwind najde třídy ve zdrojích a vygeneruje jen použité (proto se
  nevygeneruje složená `` `bg-${barva}-500` ``); `@import "tailwindcss"`
  a vrstvy `theme, base, components, utilities` (navazuje na `@layer`
  z `css-kaskada`), preflight místo resetu; čtení dlouhého `class` po skupinách
  (layout → box → typografie → barvy → stavy); libovolné hodnoty `w-[37rem]`
  a vlastnosti `[mask-type:luminance]` jako únikový ventil; Tailwind v projektu
  vs. v náhledu. Cvičení: `pretest` („zvětší se stylopis s každou novou
  stránkou?"), `predict` (jaké CSS vznikne z `px-6 py-2 rounded-lg`),
  `compare` (stejná karta v čistém CSS a v utilitách), `explain` (proč
  dynamicky složená třída nefunguje).
- **workshop** `workshop-karta-v-utilitach` [dom + tailwind] — *Vstupenka na
  koncert v utilitách* — staví: kartu koncertu s fotkou, datem, cenou, štítkem
  „Poslední místa" a tlačítkem. Učí: rozestupy a velikosti na stupnici, flex
  a grid utility, typografie (`text-*`, `font-*`, `leading-*`, `tracking-*`),
  barvy s průhledností (`bg-sky-500/20`), `rounded-*`, `shadow-*`, `ring-*`,
  `aspect-*` a `object-cover`, libovolná hodnota, `hover:` a `focus-visible:`
  s `transition`. ~16 kroků. Cvičení: `debug` (štítek bez barvy — třída
  složená v šabloně z proměnné se nevygenerovala), `vyber-sam` (cena
  a tlačítko u dna karty bez jmenování utilit), `explain` (proč `/20` místo
  nové barvy).
- **lesson** `theme-a-tokeny` — *`@theme` a design tokeny* — `@theme` vytvoří
  zároveň CSS proměnnou i utility; jmenné prostory (`--color-*`, `--font-*`,
  `--text-*`, `--spacing`, `--radius-*`, `--shadow-*`, `--breakpoint-*`,
  `--ease-*`, `--animate-*`); přepsání a vypnutí výchozí palety
  (`--color-*: initial`); `@theme inline` pro token odkazující na jinou
  proměnnou; sémantické tokeny (`--color-surface`, `--color-primary`) nad
  primitivními; `var(--color-primary)` v čistém CSS i v libovolné hodnotě;
  paleta v `oklch()` z `css-design`; tmavý motiv přepnutím sémantických tokenů
  místo `dark:` u každého prvku. Cvičení: `predict` (vznikne utilita
  z proměnné na `:root` mimo `@theme`?), `controls` (posuvník odstínu značky
  přebarví celou ukázku), `explain` (primitivní vs. sémantický token).
- **workshop** `workshop-motiv-znacky` [dom + tailwind] — *Motiv pražírny kávy* —
  staví: vzhled ceníku a objednávky pražírny z tokenů značky. Učí: paleta
  v `@theme`, vlastní písmo a stupnice `--text-*`, zaoblení a stíny, sémantické
  tokeny, tmavý motiv přepnutím tokenů, token v čistém CSS pro SVG ilustraci.
  ~15 kroků. Cvičení: `debug` (třída `bg-crema` nic nedělá — token je na
  `:root`, ne v `@theme`), `parsons` (blok `@theme` s primitivními
  a sémantickými tokeny).
- **lesson** `responzivita-a-stavy` — *Responzivita a stavy* — varianta =
  podmínka před utilitou; breakpointy jsou `min-width`, proto třída bez
  prefixu platí na mobilu (past: `sm:` neznamená „na malé obrazovce");
  `max-md:` a rozsah `md:max-lg:`; container queries `@container` a `@md:`;
  stavy `hover:` (ve v4 jen na zařízeních s myší), `focus-visible:`,
  `active:`, `disabled:`, `aria-expanded:`, `data-[state=open]:`, `open:`;
  `dark:` a `@custom-variant dark` pro ruční přepínač motivu; `group`
  a `group-hover:`, `peer` a `peer-invalid:` (ovlivněný prvek musí být v DOM
  **za** peerem), `has-[:checked]:`, `motion-safe:` a `motion-reduce:`;
  skládání více variant. Cvičení: `pretest`, `predict` ×2 (která třída platí
  na 375 px; proč nereaguje `peer-invalid:` na hlášce nad polem), `compare`
  (media vs. container varianta u karty v úzkém panelu).
- **workshop** `workshop-landing-sekce` [dom + tailwind] — *Landing sekce
  herního serveru* — staví: úvodní stránku herního serveru s hero sekcí
  (stav serveru a počet hráčů), mřížkou funkcí, ceníkem VIP balíčků, FAQ
  a přihláškou do novinek. Učí: mobile-first rozvržení s `md:` a `lg:`,
  responzivní navigace, karty s `@container`, `group-hover:` na kartě,
  zvýrazněný tarif, `dark:` s přepínačem přes `@custom-variant`, formulář
  s `peer-invalid:` a `has-[:user-invalid]:`, vlastní `--animate-*` v `@theme`
  s `motion-safe:`, viditelný fokus. ~22 kroků, mezistav po kroku 11 (hotové
  hero a navigace). Cvičení: `debug` (menu zmizí na desktopu místo na mobilu —
  `sm:hidden` pochopené jako „skryj na malé obrazovce"), `debug` (tmavý motiv
  reaguje jen na systém, ne na přepínač — chybí `@custom-variant`), `vyber-sam`
  (tarify se na úzké obrazovce skládají pod sebe), `explain` (proč třída bez
  prefixu = mobil).
- **lesson** `komponenty-bez-duplicit` — *Komponenty bez duplicit a Tailwind
  vs. čisté CSS* — opakované třídy jsou problém údržby, ne vzhledu; pořadí
  řešení: smyčka a šablona (`template` z `js-dom`, později komponenta
  v Reactu) → víc kurzorů v editoru → `@utility` pro malý opakovaný vzor →
  `@apply` jen pro markup, který nevlastníš (obsah z CMS, Markdown) →
  `@layer components`; proč `@apply` všude vrací problémy čistého CSS; dvě
  utility pro tutéž vlastnost v jednom `class` (rozhoduje pořadí ve
  vygenerovaném CSS, ne v atributu — příprava na `tailwind-merge`);
  `@reference` ve stylech komponent; řazení tříd přes
  `prettier-plugin-tailwindcss`; **Tailwind vs. čisté CSS**: tabulka kdy co
  (tým a rychlá iterace, knihovna komponent, složité `@keyframes` a efekty,
  obsah z CMS, velikost CSS) a kombinace obojího v jednom projektu. Cvičení:
  `predict` (dvě utility pro `padding` v jednom atributu), `explain` (kdy
  `@apply` ano a kdy ne), `check` (vyber řešení duplicity pro čtyři situace).
- **lab** `lab-prestavba-podle-navrhu` [dom + tailwind] — *Přestavba stránky
  podle návrhu* — samostatně: stránku akce napsanou v čistém CSS (seed)
  přestavět do Tailwindu podle přiloženého návrhu a specifikace tokenů; tokeny
  v `@theme`, světlý i tmavý motiv, šířky 1024, 768 a 375 px, žádné kopírované
  bloky tříd u opakovaných karet. Texty jsou volba uživatele. Cvičení:
  `pred-startem`, `layout`, `approaches` (`md:` vs. `@container` u karet;
  `@utility` vs. smyčka v šabloně).
- **quiz** `kviz` — *Kvíz: Tailwind* — co vygeneruje třída, mobile-first
  varianty, `group` a `peer`, jmenné prostory `@theme`, dynamicky složené
  třídy, `@apply` vs. komponenta, Tailwind vs. čisté CSS. 20–30 %
  z `css-design` a `css-responzivita`. Cvičení: `code` (šablona stránky
  ~100 řádků s chybami ve variantách a tokenech).
- **Soubory sekce:** `tahak.md` s tabulkou „utilita → deklarace" pro nejčastější
  skupiny a tabulkou variant (breakpointy, stavy, `group`/`peer`, `dark`).

## 1.14 `css-animace` — Přechody, transformace a animace

**Úroveň:** jádro
**Odhad:** ~14 h (z toho vlajkový projekt ~6 h, kontrolní bod ~2 h)
**Předpoklady:** `css-pozicovani`, `css-design`, `html-pristupnost`
**Navazuje:** `css-efekty-animace` (GSAP, Motion, Lenis a efekty řízené z JavaScriptu)

**Po sekci umíš:**
- animovat rozhraní přechody, transformacemi a klíčovými snímky,
- říct, které vlastnosti jsou levné a které spouštějí layout, a ověřit to v Performance,
- použít view transitions a animace řízené scrollem jako progresivní vylepšení,
- respektovat `prefers-reduced-motion`,
- samostatně postavit a nasadit celou přístupnou a responzivní stránku.

**Moduly:**
- **lesson** `transition-transform` — *Přechody, transformace a výkon*
  *(sloučeno s bývalou `vykon-animaci`)* — `transition`, `transition-behavior:
  allow-discrete` a `@starting-style`, `transform` i samostatné `translate`,
  `scale`, `rotate`, `transform-origin`; pipeline styl → layout → paint →
  composite, co jde jen do compositoru, `will-change` s rozvahou, Performance
  a paint flashing. Cvičení: `controls` (časovací funkce, délka), `predict`
  (která animace spustí layout), `explain` (proč `transform` místo `left`).
- **workshop** `workshop-interakce` [dom] — *Mikrointerakce* — staví: tlačítka,
  karty a akordeon s jemnými přechody. Učí: hover a fokus s přechodem,
  zvednutí karty, `interpolate-size` u `details`, `@starting-style` u popoveru,
  reduced motion. ~18 kroků. Cvičení: `debug` (popover se objeví bez animace —
  chybí `allow-discrete`).
- **lesson** `keyframes` — *Klíčové snímky* — `@keyframes`, `animation-*`,
  `steps()`, `cubic-bezier()`, `linear()`, `@property`, gradienty.
  Cvičení: `controls` (fill-mode, direction), `predict` (kde skončí prvek bez `forwards`).
- **lesson** `view-transitions-scroll` — *View transitions a animace řízené
  scrollem* — `document.startViewTransition()` (jeden řádek JS),
  `@view-transition { navigation: auto }`, `view-transition-name`,
  `animation-timeline: scroll()` a `view()`, `animation-range`.
  (Workshop `workshop-scroll-pribeh` je zrušený; ukázky stačí v lekci.)
- **lab** `lab-loader-a-toast` [dom] — *Načítání a oznámení* — samostatně:
  spinner, skeleton a vyjíždějící oznámení s ohledem na omezení pohybu.
- **quiz** `kviz` — *Kvíz: animace* — co je levné animovat, `transition`
  vs. `animation`, `fill-mode`, reduced motion. 20–30 % z celé části 1.
- **lab** `lab-kontrolni-bod-1` [dom] — *Kontrolní bod: stránka akce* —
  samostatně, bez uvedení sekcí: přístupná stránka kulturní akce s programem
  v mřížce, kartami, přihláškou (formulář s validací), přilepenou navigací,
  motivem a jemnou animací respektující reduced motion. Testy v 1024, 768
  a 375 px. Cvičení: `pred-startem`, `layout`, bez tipů `help` (jen odkazy `see`).
- **project** `projekt-landing-page` [dom] — *Landing page produktu*
  — **vlajkový projekt 1** — zadání jako od klienta: úvodní stránka aplikace
  (hero, funkce, recenze, ceník, FAQ, patička) podle textové předlohy a návrhu.
  Požadavky: mobile-first, grid i flexbox, container query karty, `@layer`,
  tokeny v `oklch()`, světlý i tmavý motiv, popover s nabídkou, přístupnost,
  reduced motion. Testy: chování a spočtené hodnoty v několika šířkách.
  Cvičení: `review` (hierarchie, kontrast, pojmenování, README, commity),
  „Rozšíření do portfolia": zapracovat styly do portfolia
  z `html-pristupnost`, nasadit obojí na GitHub Pages, view transitions mezi
  stránkami portfolia. (Projekt `projekt-portfolio-css` je zrušený a nahrazuje
  ho toto rozšíření.)

## 1.15 `css-efekty-animace` — Animace a efekty pro „wow" web

**Úroveň:** jádro *(nová)*
**Odhad:** ~14 h
**Předpoklady:** `css-animace`, `js-async`
**Doporučeno předem:** `css-tailwind`
**Navazuje:** `web-3d-efekty` (3D pozadí a shadery), `react-ui-knihovny` (Motion for React)

Efekty, kvůli kterým si lidé web pamatují: odhalení nadpisu, pinovaná sekce,
parallax, plynulé scrollování, přeskupení karet, magnetické tlačítko. Sekce
navazuje na výkon a `prefers-reduced-motion` z `css-animace` a každý efekt
učí i s tím, jak ho vypnout a jak neshodit 60 fps. Kroky běží v runtime `dom`
s knihovnami: `import { gsap } from 'gsap'`, `gsap/ScrollTrigger`,
`gsap/SplitText`, `gsap/Flip`, `motion` a `lenis` (`libs: ["lenis"]`).
Testy neměří čas: přeskočí timeline na konec (`progress(1)`) a čtou spočtené
styly, kontrolují nastavení ScrollTriggerů (`ScrollTrigger.getAll()`), stav
po scrollu v iframu a variantu s omezeným pohybem (viz Otevřené body na konci).
GSAP je od roku 2025 zdarma včetně SplitText a Flip, takže se učí bez výhrad
k licenci.

**Po sekci umíš:**
- vybrat pro efekt nástroj (CSS, Web Animations API, GSAP, Motion, View Transitions API) a zdůvodnit to,
- složit animaci do timeline s easingem, přesahy a štítky a ovládat ji (pauza, návrat, `scrub`),
- postavit efekty řízené scrollem: ScrollTrigger s pinem, parallax, CSS `animation-timeline` jako progresivní vylepšení a plynulé scrollování přes Lenis,
- animovat text a změny layoutu (SplitText, Flip, `document.startViewTransition`),
- udělat mikrointerakce a magnetické tlačítko, které fungují myší, dotykem i klávesnicí,
- udržet animace na 60 fps (jen `transform` a `opacity`, `will-change` s rozvahou, Performance) a respektovat `prefers-reduced-motion`.

**Moduly:**
- **lesson** `gsap-zaklady` — *Kdy knihovna a základy GSAP* — co CSS
  animace neumí (sekvence závislé na sobě, přerušení a návrat z libovolného
  místa, animace hodnoty mimo CSS, scroll s pinem); Web Animations API
  (`element.animate`, `await animation.finished`) jako most mezi CSS
  a knihovnou; tabulka CSS × WAAPI × GSAP × Motion (velikost, API, React,
  scroll); `gsap.to`, `from`, `fromTo`, `set`; zkratky `x`, `y`, `scale`,
  `rotation`, `autoAlpha` (proč ne `left` a `top`); `duration` a `ease`
  (`power2.out`, `back`, `expo`, `elastic`, CustomEase zmínkou); `stagger`
  jako objekt (`each`, `from: 'center'`); `gsap.timeline` s `defaults`,
  pozice `'<'`, `'>'`, `'-=0.2'` a štítky; ovládání (`play`, `pause`,
  `reverse`, `progress`, `timeScale`); `gsap.context()` a `revert()` pro úklid;
  délky: UI 150–400 ms, úvodní animace do ~1,2 s. Cvičení: `pretest`
  („proč by animace přes `left` měla být horší než přes `transform`?"),
  `predict` (kdy začne třetí tween s pozicí `'<0.1'`), `controls` (easing
  a délka nad stejným pohybem), `compare` (vyjíždějící panel přerušený
  v půlce: CSS `@keyframes` × `gsap.to`), `explain` (proč sekvence patří do
  timeline, ne do řetězu `delay`).
- **workshop** `workshop-animovana-hero` [dom] — *Hero sekce hudebního
  festivalu* — staví: úvodní obrazovku festivalu s navigací, nadpisem, který se
  odhalí po řádcích, datem a místem, tlačítkem na vstupenky, fotkami
  interpretů a plovoucími tvary v pozadí. Učí: úvodní timeline s `defaults`
  a pozicemi, `stagger` na položkách menu, reveal textu přes SplitText
  (`type: 'lines, words'`, `mask: 'lines'`, `autoSplit` s `onSplit` po změně
  šířky), `autoAlpha` a CSS proti probliknutí obsahu před animací, jemná
  nekonečná animace tvarů (`repeat: -1`, `yoyo`, `sine.inOut`), hover efekt
  fotek, magnetické tlačítko (`pointermove`, `gsap.quickTo`, návrat
  v `pointerleave`, jen pro `(hover: hover)`), `gsap.matchMedia()`
  s `prefers-reduced-motion` (místo pohybu jen prolnutí), úklid přes
  `revert()`. ~24 kroků, mezistav po kroku 12 (hotová úvodní timeline).
  Cvičení: `debug` (nadpis na zlomek sekundy blikne před animací — obsah není
  skrytý do startu timeline), `debug` (magnetické tlačítko po odjetí myši
  zůstane posunuté — chybí návrat v `pointerleave`), `parsons` (timeline
  s pozicemi `'<'` a `'-=0.3'`), `vyber-sam` (pořadí vstupu prvků podle
  vlastního návrhu; test ověří jen konečný stav a viditelný obsah), `explain`
  (proč `quickTo` místo nového tweenu na každý `pointermove`).
- **lesson** `scroll-efekty` — *Animace řízené scrollem a Lenis* — tři cesty
  podle potřeby: jednorázové odhalení přes Motion `inView` (nebo
  `IntersectionObserver` z `js-dom`), CSS `animation-timeline: view()`
  a `scroll()` s `animation-range` jako progresivní vylepšení (`@supports`),
  GSAP ScrollTrigger (`trigger`, `start` a `end` jako „horní okraj prvku ×
  místo v okně", `toggleActions`, `scrub` jako `true` i číslo, `pin`
  a `pinSpacing`, `snap`, `markers` pro ladění, `refresh()` po načtení
  obrázků, `invalidateOnRefresh`); Motion `scroll()` s průběhem 0–1; parallax
  jako rozdílná rychlost vrstev (`yPercent` se `scrub`) a proč ne posluchač
  `scroll` bez `requestAnimationFrame`; Lenis: co dělá (interpoluje scroll,
  nativní posuvník a kotvy zůstávají), `autoRaf`, napojení na ScrollTrigger
  (`lenis.on('scroll', ScrollTrigger.update)` a `gsap.ticker`),
  `data-lenis-prevent`, `lenis.scrollTo`; kdy scroll efekt škodí
  (scrolljacking, obsah skrytý bez JavaScriptu, dlouhé texty). Cvičení:
  `pretest`, `predict` (kdy se spustí animace se `start: 'top 80%'`),
  `controls` (`scrub`: `true`, 0,5 a 2 nad stejnou animací), `compare`
  (odhalení karet v CSS `view()` × ScrollTrigger), `explain` (co udělá `pin`
  se zbytkem stránky a proč).
- **workshop** `workshop-produktova-stranka` [dom] — *Prezentace
  bezdrátových sluchátek* — staví: produktovou stránku sluchátek s plynulým
  scrollováním, pinovanou sekcí, kde se při scrollu střídají funkce
  a natáčí fotka, parallaxem fotek, počítadly parametrů (výdrž baterie,
  hmotnost, cena v Kč), vodorovným pásem barevných variant a ukazatelem
  průběhu čtení. Učí: Lenis a jeho napojení na ScrollTrigger, navigace
  kotvami přes `lenis.scrollTo`, ScrollTrigger se `scrub` a `pin`, timeline
  navázaná na scroll se štítky a `snap`, vodorovný pás v pinované sekci
  (posun spočtený funkcí a `invalidateOnRefresh`), počítadlo přes tween
  objektu s `onUpdate` a `Intl.NumberFormat`, odhalení karet přes Motion
  `inView` se zpožděním, ukazatel průběhu v CSS `animation-timeline: scroll()`
  s JS záložní variantou, `gsap.matchMedia()` (na úzké obrazovce bez pinu,
  s omezeným pohybem bez parallaxu a bez Lenis). ~26 kroků, mezistav po kroku
  13 (Lenis a pinovaná sekce hotové). Cvičení: `debug` (vodorovný pás po
  změně šířky okna přejede konec — posun spočtený jednou číslem), `debug`
  (s Lenis se pinovaná sekce trhá a zpožďuje — ScrollTrigger neví o scrollu
  Lenis), `vyber-sam` (ukazatel průběhu čtení — CSS, nebo JS), `explain`
  (proč `pin` přidá pod sekci místo a jak to souvisí se `scrub`).
- **lesson** `layout-a-view-transitions` — *Flip, View Transitions a Motion* —
  animace změny layoutu: technika FLIP (First, Last, Invert, Play) ručně na
  jednom prvku, GSAP Flip (`Flip.getState` → změna DOM → `Flip.from`
  s `absolute`, `onEnter`, `onLeave`); View Transitions API v jednom dokumentu
  (`document.startViewTransition` s funkcí, která mění DOM,
  `view-transition-name`, `::view-transition-old()` a `::view-transition-new()`
  s vlastní animací, `view-transition-class`, `await transition.finished`,
  detekce podpory a varianta bez ní), přechody mezi dokumenty zmínkou jako
  progresivní vylepšení; Motion pro čistý JavaScript (`animate` s pružinou,
  sekvence, `stagger`, gesta `hover` a `press`) jako lehčí alternativa; kdy
  co. Cvičení: `predict` (co se stane, když dva prvky mají stejné
  `view-transition-name` — přechod se přeskočí a v konzoli je chyba),
  `compare` (filtr karet bez animace × s Flip), `controls` (pružina:
  `stiffness`, `damping`).
- **workshop** `workshop-galerie-flip` [dom] — *Portfolio fotografky* —
  staví: galerii zakázek s filtrem kategorií, kde se fotky plynule přeskupí,
  detail, který se z miniatury roztáhne přes celou obrazovku, tlačítko „Líbí
  se mi" se srdíčkem, vlastní kurzor nad galerií a kopírování odkazu
  s potvrzením. Učí: `Flip.getState`/`Flip.from` při filtru s `onEnter`
  a `onLeave`, `startViewTransition` pro otevření a zavření detailu se
  sdíleným `view-transition-name` a varianta bez podpory, Motion `animate`
  s pružinou pro srdíčko, gesta `hover` a `press`, vlastní kurzor přes
  `gsap.quickTo` (skrytý na dotykových zařízeních a pro čtečky),
  mikrointerakce s potvrzením v `aria-live`, omezený pohyb (Flip
  s `duration: 0`, přechod jen prolnutím). ~22 kroků, mezistav po kroku 11
  (hotový filtr). Cvičení: `debug` (filtr skočí bez animace — `Flip.getState`
  zavolaný až po změně DOM), `debug` (detail se otevře bez přechodu a konzole
  hlásí duplicitní `view-transition-name`), `parsons` (stav → změna →
  `Flip.from`), `vyber-sam` (zavření detailu stejným přechodem zpět).
- **lesson** `vykon-a-pristupnost-animaci` — *Výkon a přístupnost animací* —
  rozpočet 16,7 ms na snímek, co animovat (`transform`, `opacity`, `filter`
  s rozvahou), `will-change` jen po dobu animace a cena vrstev v paměti
  mobilu, čtení `getBoundingClientRect` v animační smyčce (layout thrashing),
  `requestAnimationFrame` místo `setInterval`, panel Performance se
  zpomaleným CPU (dlouhé snímky, layout v každém snímku), pauza animací mimo
  obrazovku a na skryté kartě; `prefers-reduced-motion`: co zachovat
  (prolnutí, změna barvy) a co vypnout (parallax, pin, pohyb přes obrazovku,
  nekonečné smyčky), přepínač „Omezit pohyb" na stránce, WCAG 2.2.2
  (pohyb delší než 5 s jde zastavit) a 2.3.3; obsah dostupný bez JavaScriptu
  a před animací (skrytí jen třídou přidanou skriptem), čtečka a SplitText
  (`aria-label` na původním textu). Cvičení: `pretest`, `predict` (která ze
  tří animací spouští layout v každém snímku), `check` (co vypnout při
  omezeném pohybu — pět efektů), `explain` (proč `will-change` na všech
  prvcích škodí).
- **lab** `lab-scroll-pribeh` [dom] — *Scroll příběh* — samostatně: stránka,
  která vypráví příběh po kapitolách (seed nabízí historii stavby Karlova
  mostu; téma, texty a vzhled jsou volba uživatele): úvodní odhalení nadpisu,
  kapitoly odhalené při scrollu, aspoň jedna pinovaná sekce s timeline na
  `scrub`, parallax vrstev, ukazatel průběhu, plynulé scrollování a navigace
  kotvami, s omezeným pohybem bez pinu a parallaxu a se vším obsahem viditelným,
  ovládání klávesnicí, na 375 px bez vodorovného přetečení. Cvičení:
  `pred-startem`, `approaches` (odhalení kapitol ScrollTriggerem × CSS
  `animation-timeline`; Lenis × nativní `scroll-behavior: smooth`).
- **quiz** `kviz` — *Kvíz: efekty a animace* — pozice v timeline, `start`
  a `end` ScrollTriggeru, co udělá `pin`, pořadí kroků Flip,
  `view-transition-name`, co je levné animovat, co vypnout při omezeném
  pohybu. 20–30 % z `css-animace` a `css-tailwind`. Cvičení: `code` (skript
  stránky ~100 řádků se třemi problémy: čtení layoutu v posluchači `scroll`,
  chybějící úklid timeline, animace bez varianty pro omezený pohyb).
- **Soubory sekce:** `tahak.md` s tabulkou „kdy CSS, WAAPI, GSAP, Motion,
  View Transitions", pozicemi v timeline, zápisem `start`/`end`
  ScrollTriggeru a tabulkou easingů. „Rozšíření do portfolia" v labu:
  přidat úvodní animaci a odhalení sekcí do landing page z vlajkového
  projektu 1.

## 1.16 `web-3d-efekty` — 3D a vizuální efekty

**Úroveň:** rozšíření *(nová)*
**Odhad:** ~9 h
**Předpoklady:** `css-efekty-animace`

3D pozadí, interaktivní náhled produktu a animované gradienty přes Three.js
(r186, `WebGLRenderer`). Kroky běží v runtime `dom` s importem `three`
a `three/addons/…`. Testy nesrovnávají pixely: čtou graf scény
(`scene.children`, materiály, světla), nastavení kamery a rendereru po změně
velikosti, počet vykreslení (`renderer.info`), hodnoty uniform a úklid
(`dispose`). Headless prohlížeč musí mít WebGL (viz Otevřené body na konci).
Modely a textury nejsou potřeba: geometrie se skládají z primitiv
a textury vznikají v kódu. `WebGPURenderer` a TSL se zmíní jako směr, kam
knihovna jde.

**Po sekci umíš:**
- postavit Three.js scénu s kamerou, objekty, materiály, světly a render loopem, která se přizpůsobí velikosti okna,
- reagovat na myš a scroll (natočení scény, `Raycaster` pro najetí a klik na objekt),
- vytvořit a animovat částice z `BufferGeometry` a vykreslit stovky objektů přes `InstancedMesh`,
- napsat jednoduchý shader (`ShaderMaterial`, uniformy, gradient a noise) a řídit ho z JavaScriptu,
- udržet 3D efekt plynulý i na mobilu (pixel ratio, draw calls, pauza mimo obrazovku, úklid) a mít variantu bez WebGL a s omezeným pohybem.

**Moduly:**
- **lesson** `threejs-zaklady` — *Scéna, kamera a render loop* — kdy 3D na
  webu dává smysl a kdy stačí CSS 3D (`perspective`, `rotateY`) nebo video;
  souřadnice (x doprava, y nahoru, z k divákovi); `Scene`,
  `PerspectiveCamera` (`fov`, `aspect`, `near`, `far`), `WebGLRenderer`
  (`antialias`, `alpha` pro průhledné pozadí,
  `setPixelRatio(Math.min(devicePixelRatio, 2))`), `Mesh` = geometrie
  + materiál, `MeshBasicMaterial` × `MeshStandardMaterial` (potřebuje světlo:
  `AmbientLight`, `DirectionalLight`), `renderer.setAnimationLoop` a `Timer`
  pro rychlost nezávislou na fps, změna velikosti (`camera.aspect`,
  `updateProjectionMatrix`, `setSize`), `OrbitControls` z `three/addons`,
  canvas jako pozadí za textem (`position: fixed`, `pointer-events`).
  Cvičení: `pretest`, `predict` (proč je kostka s `MeshStandardMaterial`
  černá), `controls` (`fov` a vzdálenost kamery), `explain` (proč pohyb
  násobit časem snímku).
- **workshop** `workshop-konfigurator-lampy` [dom] — *Konfigurátor designové
  lampy* — staví: 3D náhled stolní lampy v e-shopu složený z primitiv (podstava,
  rameno, stínidlo), otáčení myší, výběr barvy stínidla a materiálu, zapnutí
  světla a kliknutí na část lampy s popiskem. Učí: skupiny `Group`
  a hierarchie transformací, `CylinderGeometry` a `SphereGeometry`, materiál
  s `roughness` a `metalness`, `PointLight` a stíny zmínkou, `OrbitControls`
  s omezením úhlů, změna barvy z tlačítek mimo canvas, `Raycaster` pro klik
  na část, resize a pixel ratio. ~16 kroků. Cvičení: `debug` (po změně šířky
  okna je lampa zdeformovaná — chybí `updateProjectionMatrix`), `vyber-sam`
  (zvýraznění části lampy při najetí myší), `explain` (proč se rameno otáčí
  i se stínidlem).
- **lesson** `interakce-a-castice` — *Interakce, částice a výkon* — pozice
  myši převedená na −1 až 1, plynulé natočení scény (lineární interpolace
  v každém snímku), `Raycaster` pro najetí a klik, napojení kamery na scroll
  přes ScrollTrigger z `css-efekty-animace`; `BufferGeometry` s atributem
  pozic z `Float32Array`, `Points` a `PointsMaterial` (`size`,
  `sizeAttenuation`, `AdditiveBlending`), animace částic přes atribut × rotace
  celé skupiny; `InstancedMesh` pro stovky stejných objektů; výkon: draw calls
  a `renderer.info`, pixel ratio, pauza přes `IntersectionObserver`
  a `visibilitychange`, `dispose()` geometrií a materiálů, detekce WebGL
  a záložní obrázek, omezený pohyb (statický snímek); `GLTFLoader` a modely
  zmínkou. Cvičení: `predict` (souřadnice myši v pravém horním rohu),
  `compare` (1000 × `Mesh` × jeden `InstancedMesh` — počet draw calls),
  `controls` (počet a velikost částic).
- **workshop** `workshop-3d-pozadi` [dom] — *3D pozadí hero sekce
  planetária* — staví: úvodní sekci planetária, kde za nadpisem a tlačítkem
  rotuje planeta s prstencem, kolem je hvězdné pole z tisíců částic, scéna se
  jemně natáčí za myší a při scrollu kamera odjíždí. Učí: canvas jako pozadí
  s průhledným rendererem, planeta s texturou vytvořenou v `CanvasTexture`,
  prstenec z `RingGeometry`, hvězdné pole z `BufferGeometry` a `Points`,
  natočení za myší s interpolací, kamera na scroll přes ScrollTrigger,
  pauza mimo obrazovku, `dispose` při odchodu, varianta bez WebGL
  a s omezeným pohybem, pixel ratio na mobilu. ~22 kroků, mezistav po kroku 11
  (planeta a hvězdy hotové). Cvičení: `debug` (planeta se na 144Hz monitoru
  točí dvakrát rychleji — rotace bez času snímku), `debug` (po návratu na
  kartu scéna poskočí — chybí pauza a omezení kroku času), `parsons` (smyčka
  s časem, interpolací a vykreslením), `vyber-sam` (hvězdy blíž kameře se
  pohybují rychleji).
- **lesson** `shadery` — *Shadery: uniformy, gradienty a noise* — co je
  vertex a fragment shader (běží na GPU pro každý vrchol a každý pixel
  zvlášť), `ShaderMaterial`, GLSL minimum (`float`, `vec2`, `vec3`, `vec4`,
  desetinná tečka `1.0` povinná), `varying vUv`, uniformy (`uTime`, `uMouse`,
  `uColorA`) a jejich změna z JavaScriptu v každém snímku, gradient přes `mix`
  a `smoothstep`, vlnění vrcholů přes `sin`, noise jako hotová funkce
  a vrstvení (fBm), celoobrazovková plocha pro pozadí, čtení chyby kompilace
  shaderu v konzoli, výkon (fragment shader na 4K = miliony pixelů za snímek).
  Cvičení: `predict` (`float x = 1;` — chyba kompilace a její hláška),
  `controls` (barvy a rychlost přes uniformy), `explain` (proč shader nevidí
  sousední pixely).
- **lab** `lab-shader-pozadi` [dom] — *Animované gradientní pozadí* —
  samostatně: celoobrazovkové pozadí stránky ve vlastním shaderu s plynoucím
  gradientem z noise, barvy převzaté z CSS proměnných, reakce na pozici myši,
  zastavený čas při omezeném pohybu, pauza mimo obrazovku, záložní CSS
  gradient bez WebGL a úklid při odchodu. Téma a barvy jsou volba uživatele.
  Cvičení: `pred-startem`, `approaches` (gradient ve fragment shaderu ×
  deformace vrcholů).
- **quiz** `kviz` — *Kvíz: 3D a shadery* — souřadnice a kamera po změně
  velikosti, proč je objekt černý, `Points` × `InstancedMesh`, uniforma ×
  varying, co zpomalí scénu. 20–30 % z `css-efekty-animace`. Cvičení: `code`
  (scéna ~100 řádků se třemi problémy: chybějící resize, rotace bez času,
  únik geometrií).

---

# Část 2 — JavaScript

Jazyk od první proměnné po event loop. Až do `js-dom` běží skoro všechno
v runtime `js` (čistý jazyk s konzolí), aby se jazyk nemíchal s prohlížečem.
Ladění se učí hned na začátku (`js-zaklady`), ne až po deseti sekcích.
Krokování `:::trace` (B17) musí být hotové před `js-objekty`, `:::eventloop`
(B21) před `js-async`.

## 2.1 `js-zaklady` — Základy JavaScriptu

**Úroveň:** jádro
**Odhad:** ~11 h
**Předpoklady:** `html-zaklady`, `start-nastroje`

**Po sekci umíš:**
- napsat krátký program s proměnnými, podmínkami a cykly,
- vysvětlit datové typy a rozdíl mezi `==` a `===`, truthy a falsy,
- přečíst chybovou hlášku a stack, zastavit program na `debugger;` a krokovat ho,
- postupovat při řešení úlohy: přeformulovat, vymyslet příklady, rozložit na kroky,
- najít a opravit chybu v krátkém cizím programu.

**Moduly:**
- **lesson** `prvni-program` — *První program* — kde JavaScript běží, konzole
  a `console.log`, příkazy a ASI, komentáře, `<script>` zmínkou.
- **lesson** `cteni-chyb-a-debugger` — *Čtení chyb a debugger* *(nová)* —
  `SyntaxError` vs. `ReferenceError` vs. `TypeError`, jak číst hlášku a řádek,
  stack trace, `debugger;`, Step over / into / out, panel Scope a Watch,
  otevření náhledu v nové kartě pro skutečné DevTools (B11). Cvičení:
  `predict` ×3 (jaký typ chyby vznikne), `check` s úkolem „zastav program
  a zjisti hodnotu proměnné".
- **lesson** `promenne-a-typy` — *Proměnné a typy* — `const` vs. `let`
  (a proč ne `var`), pojmenování, primitivní typy vs. objekty, `typeof` a jeho
  výjimky, `undefined` vs. `null`. Cvičení: `predict` (`typeof null`).
- **workshop** `workshop-kalkulacka-spropitneho` [js] — *Kalkulačka spropitného* —
  staví: výpočet účtu, spropitného a dělení. Učí: aritmetické operátory, `%`,
  `**`, priorita, `+=`, přetypování (`Number()`, unární `+`), template literaly.
  ~18 kroků. Cvičení: `debug` (`'120' + 30` dá `'12030'` — Hlášení „účet
  vyšel 12 030 Kč"), `explain` (implicitní převod typů).
- **lesson** `porovnani-a-logika` — *Porovnání a logika* — `===` vs. `==`,
  truthy a falsy, `&&` a `||` vracejí operand, `??` vs. `||`, `?.`, `if`,
  ternární operátor, `switch` a propadání. Cvičení: `pretest`, `predict` ×4
  (`0 || 5`, `0 ?? 5`, `'' == 0`, propadání `switch`).
- **workshop** `workshop-hodnoceni` [js] — *Hodnocení studentů* — staví:
  z bodů známku, slovní hodnocení a upozornění. Učí: `if`/`else if`, ternární
  operátor, `switch`, `??`, guard clause, okrajové případy. ~18 kroků.
  Cvičení: `parsons` (řetěz `else if` od nejvyšší hranice), `debug` (`>` místo
  `>=` na hranici — student s 90 body dostal dvojku).
- **lesson** `cykly` — *Cykly* — `for`, `while`, `do…while`, `for…of` na
  řetězci, `break`/`continue`, nekonečná smyčka, off-by-one. Cvičení: `trace`
  (průběh `for` s počítadlem; bez B17 zatím `memory`), `predict` (kolikrát proběhne).
- **lesson** `reseni-problemu` — *Jak řešit úlohu* *(nová, krátká)* —
  přeformuluj zadání, příklady vstupů a výstupů včetně okrajových, rozklad na
  kroky, pseudokód v komentářích jako podcíle, ruční průchod, teprve pak kód.
  Cvičení: `explain` (postup na úloze „součet sudých čísel").
- **lab** `lab-fizzbuzz-a-spol` [js] — *Malé algoritmy* — samostatně: FizzBuzz,
  součet číslic, převod teploty, prvočísla. Cvičení: `pred-startem`,
  `approaches` (`for` vs. `while` u součtu číslic).
- **lab** `lab-oprav-3-chyby` [js] — *Oprav 3 chyby* *(nový)* — program
  s třemi chybami (`=` v podmínce, off-by-one, porovnání řetězce s číslem),
  každý test = jedna chyba, popis ve formátu Hlášení.
- **quiz** `kviz` — *Kvíz: základy* — co vypíše kód, truthy/falsy, `==` vs.
  `===`, `??` vs. `||`, typ chyby podle hlášky, chyby v cyklech. Cvičení:
  polovina otázek s psanou odpovědí.

## 2.2 `js-retezce-cisla` — Řetězce, čísla, data a regulární výrazy

**Úroveň:** jádro
**Odhad:** ~9 h
**Předpoklady:** `js-zaklady`

**Po sekci umíš:**
- zpracovat a formátovat text v češtině včetně diakritiky a emoji,
- vysvětlit, proč `0.1 + 0.2 !== 0.3`, a počítat s penězi bezpečně,
- formátovat čísla, ceny, množné číslo a data přes `Intl`,
- vyhnout se pastem `Date` a vědět, co přináší `Temporal`,
- napsat a přečíst běžný regulární výraz.

**Moduly:**
- **lesson** `retezce` — *Řetězce* — neměnnost, `at(-1)`, `slice`, `includes`,
  `split`/`join`, `trim`, `padStart`, `replaceAll`, `localeCompare`, Unicode
  a emoji, `normalize`. Cvičení: `predict` (`'👍🏽'.length`).
- **workshop** `workshop-textove-utility` [js] — *Textové utility* — staví:
  zkrácení popisu, slug bez diakritiky, iniciály, formát telefonu, maskování
  e-mailu. ~18 kroků. Cvičení: `debug` (slug „Žluťoučký" obsahuje rozbité
  znaky — chybí `normalize('NFD')`), `vyber-sam` (iniciály z víceslovného jména).
- **lesson** `cisla` — *Čísla a počítání* — plovoucí čárka, počítání
  v haléřích, zaokrouhlení záporných čísel, `toFixed` vrací řetězec,
  `Number.isNaN`, `parseInt` vs. `Number`, `BigInt`, `Math.random`.
  Cvičení: `predict` ×3 (`0.1 + 0.2`, `(1.005).toFixed(2)`, `parseInt('08px')`).
- **lesson** `intl-a-datum` — *Formátování a datum* — `Intl.NumberFormat`,
  `DateTimeFormat`, `RelativeTimeFormat`, `PluralRules`; pasti `Date`;
  `Temporal` (`PlainDate`, `ZonedDateTime`, `Duration`).
  Cvičení: `predict` (`new Date(2026, 1, 30)`).
- **workshop** `workshop-kosik-ceny` [js] — *Ceny v košíku* — staví: košík
  s DPH, slevou a dopravou. Učí: haléře, zaokrouhlení, `Intl.NumberFormat`,
  `PluralRules`, datum doručení. ~18 kroků. Cvičení: `debug` (součet
  `19.99 * 3` nesedí o haléř), `explain` (proč haléře).
- **lesson** `regularni-vyrazy` — *Regulární výrazy* — třídy znaků,
  kvantifikátory (hladové vs. líné), kotvy, pojmenované skupiny, příznaky,
  `test`, `matchAll`, `replace` s funkcí, `RegExp.escape`; kdy regex nepoužít.
  Cvičení: `regex` u každého příkladu, `predict` (co zachytí `.*` vs. `.*?`).
- **lab** `lab-validace-vstupu` [js] — *Kontrola a úprava vstupu* — samostatně:
  PSČ, rodné číslo bez kontroly data, heslo, hashtagy, formát ceny.
  Cvičení: `approaches` (regex vs. ruční kontrola u PSČ).
- **quiz** `kviz` — *Kvíz: text a čísla* — zaokrouhlení, `length` s emoji, co
  vrátí regex, pasti `Date`. 20–30 % z `js-zaklady`.

## 2.3 `js-funkce` — Funkce a rozsah platnosti

**Úroveň:** jádro
**Odhad:** ~8 h
**Předpoklady:** `js-retezce-cisla`

**Po sekci umíš:**
- rozdělit program do malých funkcí s jasným vstupem a výstupem,
- vysvětlit rozsah platnosti, stínění, hoisting a TDZ,
- předávat funkce jako hodnoty (callback),
- najít chybu breakpointem a panelem Scope místo `console.log` všude.

**Moduly:**
- **lesson** `funkce` — *Funkce* — deklarace, výraz, šipková funkce, parametry
  vs. argumenty, `return` a `undefined`, výchozí a rest parametry, čistá funkce.
  Cvičení: `predict` (funkce bez `return`).
- **lesson** `scope-a-hoisting` — *Rozsah platnosti, hoisting a TDZ* — globální,
  funkční a blokový scope, stínění, hoisting, TDZ, `var` ve smyčce, lexikální
  scope. Cvičení: `trace` (zásobník a rozsahy při volání), `predict` ×3
  (TDZ, stínění), `explain` (lexikální scope).
- **workshop** `workshop-prevodnik-jednotek` [js] — *Převodník jednotek* —
  staví: převodník délek, hmotností a teplot. Učí: rozklad na funkce, výchozí
  parametry, guard clauses. ~18 kroků. Cvičení: jeden krok **vyžaduje
  breakpoint** (zastav se ve funkci a zapiš mezivýsledek, který se nevypisuje),
  `debug` (chybějící `return` v pomocné funkci — výsledek `NaN`),
  `parsons` (funkce s guard clause).
- **lesson** `funkce-jako-hodnoty` — *Funkce jako hodnoty* — funkce v proměnné,
  callback, `setTimeout` jako první příklad, vyšší řád jednou větou.
  Cvičení: `predict` (`fn` vs. `fn()` jako argument), `explain` (callback).
- **lab** `lab-generator-hesel` [js] — *Generátor a kontrola hesel* — samostatně:
  generování hesla podle pravidel a hodnocení síly. Cvičení: `pred-startem`.
- **quiz** `kviz` — *Kvíz: funkce* — stínění a hoisting, TDZ, návratové hodnoty,
  deklarace vs. šipka. Cvičení: `code` (modul ~60 řádků se čtyřmi funkcemi).

(Bývalá lekce `ladeni-zaklad` se rozdělila: základ je v `js-zaklady/cteni-chyb-a-debugger`,
pokročilé nástroje v `js-chyby-ladeni/ladeni-systematicky`.)

## 2.4 `js-objekty` — Objekty, reference a kopie

**Úroveň:** jádro
**Odhad:** ~8 h
**Předpoklady:** `js-funkce`

**Po sekci umíš:**
- modelovat data objekty a procházet je (`Object.entries` a spol.),
- vysvětlit, proč změna objektu uvnitř funkce změnila data i venku, a nakreslit to,
- vybrat správnou kopii (mělká, `structuredClone`, JSON) a říct, co která ztratí,
- upravit zanořená data bez mutace pomocí destrukturalizace a spreadu.

**Moduly:**
- **lesson** `objekty` — *Objekty* — literál, tečka vs. závorky, vypočítané
  klíče, metody, `in` a `Object.hasOwn`, `?.`, `Object.keys/values/entries/fromEntries`.
  Cvičení: `pretest`, `predict` (`obj[key]` vs. `obj.key`).
- **lesson** `reference-a-mutace` — *Hodnota vs. reference* — primitiva se
  kopírují, objekty sdílejí referenci, `const` nezamrazí obsah, `===` porovnává
  identitu, mutace argumentu, `Object.freeze`. Cvičení: **silné použití
  `trace`** (každá ukázka krokovatelná, halda se šipkami), `predict` ×4,
  `explain` (reference vlastními slovy — pohovorová otázka).
- **workshop** `workshop-profil-uzivatele` [js] — *Profil uživatele* — staví:
  funkce nad profilem. Učí: destrukturalizace s přejmenováním a výchozí
  hodnotou, v parametrech, spread, úprava bez mutace, rest. ~18 kroků.
  Cvičení: `debug` (funkce `updateSettings` mění vstupní objekt — Hlášení
  „po náhledu změn se změnilo i uložené nastavení"), `parsons` (destrukturalizace
  v parametru s výchozími hodnotami), `trace` u zanořené úpravy.
- **lesson** `kopie-a-json` — *Mělká a hluboká kopie, JSON* — spread
  a `Object.assign` jsou mělké, `structuredClone`, `JSON.stringify`/`parse`
  a ztráty, `replacer`, bezpečné parsování. Cvičení: `trace` (mělká kopie
  sdílí vnořený objekt), `predict` (co zbude z `Date` po JSON).
- **workshop** `workshop-nastaveni-aplikace` [js] — *Nastavení aplikace* —
  staví: sloučení výchozího a uživatelského nastavení, uložení do JSON a zpět.
  ~14 kroků. Cvičení: `vyber-sam` (hluboká kopie s datem), `explain`.
- **lab** `lab-adresar` [js] — *Adresář kontaktů* — samostatně: přidání, úprava
  a hledání kontaktu bez mutace vstupu. Cvičení: `approaches`.
- **quiz** `kviz` — *Kvíz: objekty* — reference, mělká vs. hluboká kopie, co
  přežije JSON, destrukturalizace. 20–30 % z `js-funkce`.

## 2.5 `js-pole` — Pole v JavaScriptu *(pilotní sekce)*

**Úroveň:** jádro
**Odhad:** ~8 h
**Předpoklady:** `js-objekty`

**Po sekci umíš:**
- napsat funkci nad polem objektů bez nápovědy,
- říct u každé běžné metody, jestli mění původní pole, nebo vrací nové,
- zvolit mezi `map`, `filter`, `find`, `some`/`every`, `reduce` a `for…of`,
- seřadit pole čísel i českých textů bez mutace vstupu,
- přečíst cizí řetězení metod bez spuštění a najít v něm chybu.

Stav na disku (`content/js-pole/section.json`) a plánované úpravy D1–D3:

- **lesson** `co-je-pole` — *Co je pole* (15 min, runtime js) — očíslovaný
  seznam hodnot, proměnná obsahuje odkaz, proč jde měnit pole v `const`,
  metody mutující vs. vracející nové, pasti. Dnes 9 živých ukázek a 4 otázky.
  **Úpravy (D1):** ukázky `b = a` + `push`, `[1,2] === [1,2]`, mělká kopie
  a `slice` vs. `splice` převést na `predict` a hodnoty z komentářů smazat;
  za „Proměnná neobsahuje pole, ale odkaz" vložit `memory` se 3 stavy
  (po `trace` z B17 převést na `trace`); `pretest` `shopping[5]`; `check` po
  každé části; psaná otázka na past `indexOf` v podmínce; `explain` k referencím.
- **workshop** `workshop-nakupni-seznam` [js, poslední kroky dom] — *Nákupní
  seznam* (120 min) — staví: sadu funkcí nad polem položek a výpis do stránky.
  Dnes 27 kroků:
  001 pole kategorií · 002 první položka · 003 poslední položka · 004 přidání
  bez mutace · 005 odebrání podle indexu · 006 `for…of` · 007 názvy přes `map` ·
  008 `map` vracející objekty · 009 opakování: popisky · 010 `filter` ·
  011 odebrání podle id · 012 `find` · 013 `findIndex` · 014 `some` ·
  015 `every` · 016 `includes` · 017 opakování: co zbývá koupit · 018 součet
  přes `reduce` · 019 počty podle kategorie přes `reduce` · 020 `toSorted`
  podle ceny · 021 řazení podle názvu česky · 022 destrukturalizace
  v parametru · 023 změna položky přes spread · 024 `Object.groupBy` ·
  025 opakování: odškrtnutí · 026 výpis do stránky · 027 souhrn nákupu.
  **Úpravy (D2):**
  - doplnit ~50 českých zpráv k asercím (se vstupem, A14.6),
  - za krok 023 vložit **`debug`** „kolegův `markAllBought`" (mutace uvnitř `map`),
  - krok 017 nahradit krokem **`vyber-sam`** (vhodné jsou `some`, `find`,
    `reduce` nebo `toSorted`; metody nejmenovat, regex nevynucovat),
  - `explain` u 009 (callback u `map` vs. `filter`),
  - `memory` nebo `trace` u `reduce` v 018,
  - **`parsons`** u prvního `reduce` do objektu (019),
  - `help` u kroků se složitějším vzorem (018–024),
  - zeslabit poslední třetinu (019–027): cíl a kandidáti, pak jen chování.
- **lesson** `metody-pole-do-hloubky` — *Metody pole do hloubky* (15 min) —
  callback, co která metoda vrací, jak pracuje `reduce`, řetězení, kdy
  metody a kdy `for…of`, časté chyby. Dnes 8 živých ukázek a 4 otázky.
  **Úpravy (A14):** `predict` u pastí (`map(parseInt)`, `sort()` bez
  comparatoru), `trace` u `reduce`, `check` po částech.
- **lab** `lab-statistika-znamek` [js] — *Statistika známek* (60 min) —
  samostatně: `average`, `studentAverages`, `bestStudent`, `failingNames`,
  `honorRoll`, `namesByClass`, `gradeCounts`, `ranking`, `classAverages` bez
  mutace vstupu. Dnes 9 požadavků a 18 testů.
  **Úpravy (D3):** kostry funkcí s JSDoc v seedu (A11), `pred-startem`,
  `approaches` (`for…of` vs. `reduce` vs. `Math.max(...)`), požadavky
  nečíslovat dvakrát (nadpis i text).
- **lab** `lab-oprav-3-chyby` [js] — *Oprav 3 chyby* *(nový, C18)* — kód
  kolegy se třemi chybami z pastí sekce: `sort()` bez comparatoru na číslech,
  `reduce` bez počáteční hodnoty na prázdném poli, mutace přes `splice`
  místo `toSpliced`. Každý test = jedna chyba, popis ve formátu Hlášení.
- **quiz** `kviz` — *Kvíz: pole* (15 min) — dnes 15 otázek „co vypíše tento kód".
  **Úpravy (D3):** polovina otázek s psanou odpovědí (`--expected--`), jedna
  sada `code`, 20–30 % otázek z `js-objekty`.
- **Soubory sekce (D3):** `cards.md` (~20 karet: `at(-1)`, `sort()` bez
  comparatoru, `toSorted`, `reduce` bez počáteční hodnoty, `map(parseInt)`,
  `indexOf` v podmínce…), `pojmy.md`, `tahak.md` (tabulka metod: vrací /
  mutuje / kdy použít), `outcomes`.

## 2.6 `js-funkce-hloubka` — Closures, `this` a funkcionální styl

**Úroveň:** jádro
**Odhad:** ~9 h
**Předpoklady:** `js-pole`

**Po sekci umíš:**
- vysvětlit closure a použít ji pro továrny, memoizaci a soukromý stav,
- u každého volání říct, co je `this`, a opravit ztracené `this`,
- skládat malé čisté funkce do větších a napsat rekurzi nad stromem,
- napsat `debounce` a `throttle` bez nápovědy.

**Moduly:**
- **lesson** `closures` — *Closures* — funkce si pamatuje prostředí, ne
  hodnotu; počítadlo a továrna; past s `var` v cyklu; closure a paměť.
  Cvičení: `trace` (prostředí zůstává na haldě), `predict` ×2 (`var` vs. `let`
  v cyklu s `setTimeout`), `explain` (closure — pohovorová otázka).
- **workshop** `workshop-tovarny-funkci` [js] — *Továrny, memoizace, debounce* —
  staví: knihovnička utilit. Učí: `createCounter`, částečná aplikace, `once`,
  `memoize` s `Map`, `debounce` a `throttle`. ~18 kroků. Cvičení: `debug`
  (dvě instance debounce sdílejí jeden časovač v modulové proměnné),
  `parsons` (kostra `debounce`), `explain` (co drží closure).
- **lesson** `this` — *`this`* — čtyři pravidla vazby, šipková funkce, ztráta
  `this` u callbacku, strict mode. Cvičení: `predict` ×4.
- **lesson** `funkcionalni-styl` — *Funkcionální styl* — čisté funkce, kompozice
  (`pipe`), deklarativní vs. imperativní, rekurze a limit zásobníku.
  Cvičení: `trace` (rekurze na malém stromu).
- **workshop** `workshop-strom-komentaru` [js] — *Strom komentářů* — staví:
  strom z ploché tabulky, počty odpovědí, odsazený výpis. ~14 kroků.
  Cvičení: `parsons` (rekurzivní funkce se základním případem), `debug`
  (chybějící základní případ — „Maximum call stack size exceeded").
- **lab** `lab-pipeline-dat` [js] — *Zpracování objednávek* — samostatně:
  pipeline funkcí a memoizovaný výpočet. Cvičení: `approaches` (řetězení vs. `pipe`).
- **quiz** `kviz` — *Kvíz: closures a `this`* — closures v cyklu, `this`, `bind`,
  rekurze. Cvičení: `code`.

## 2.7 `js-tridy-kolekce` — Třídy, prototypy, Map, Set a iterátory

**Úroveň:** jádro
**Odhad:** ~8 h (+1 h rozšíření)
**Předpoklady:** `js-funkce-hloubka`

**Po sekci umíš:**
- vysvětlit řetěz prototypů a odkud mají pole a řetězce své metody,
- napsat třídu se soukromými poli, gettery, statickými členy a dědičností,
- zvolit mezi objektem, `Map` a `Set` a použít nové metody `Set`,
- udělat objekt iterovatelným a napsat jednoduchý generátor.

**Moduly:**
- **lesson** `prototypy` — *Prototypy* — řetěz prototypů, `Object.create`,
  odkud jsou metody, proč nerozšiřovat vestavěné prototypy.
  Cvičení: `trace` (hledání vlastnosti po řetězu).
- **lesson** `tridy` — *Třídy* — `class` nad prototypy, `constructor`, gettery
  a settery, `static`, `#` pole, `extends` a `super`, kompozice vs. dědičnost.
  Cvičení: `predict` (metoda předaná jako callback ztratí `this`).
- **workshop** `workshop-bankovni-ucet` [js] — *Bankovní účet* — staví: účet
  s historií a spořicí účet. Učí: soukromý stav, validace, getter zůstatku,
  `static` továrna, dědičnost, vyhození chyby. ~15 kroků *(zkráceno)*.
  Cvičení: `debug` (`this` ztracené v `forEach` s obyčejnou funkcí),
  `explain` (proč soukromé pole).
- **lesson** `map-a-set` — *Map, Set, WeakMap* — `Map` vs. objekt, `Set`
  a duplicity, `union`, `intersection`, `difference`, `isSubsetOf`, `WeakMap`.
  Cvičení: `predict` (klíč objekt v obyčejném objektu).
- **lesson** `iteratory-generatory` — *Iterátory a generátory* *(zkrácená)* —
  iterační protokol a `Symbol.iterator`, co je iterovatelné, `function*`
  a `yield`, líná sekvence. Cvičení: `predict` (co vrátí `next()`).
- **lesson** `iterator-helpers` — *Iterator helpers* **(rozšíření)** — `map`,
  `filter`, `take`, `drop`, `toArray` na iterátoru, `Iterator.from`.
- **lab** `lab-inventar` [js] — *Inventář skladu* — samostatně: třídy pro sklad
  a položky, `Map` podle kódu, porovnání skladů metodami `Set`.
  (Workshop `workshop-knihovna-her` je zrušený, jeho témata pokryje lab.)
- **quiz** `kviz` — *Kvíz: třídy a kolekce* — prototypy, soukromá pole, `Map`
  vs. objekt, iterovatelnost. 20–30 % z `js-objekty` a `js-pole`.

## 2.8 `js-chyby-ladeni` — Chyby a systematické ladění

**Úroveň:** jádro
**Odhad:** ~6 h
**Předpoklady:** `js-tridy-kolekce`

**Po sekci umíš:**
- rozlišit očekávanou chybu (vstup) od chyby programátora,
- vyhodit, zachytit a obalit chybu přes `cause`, aby šla dohledat,
- napsat vlastní třídy chyb a rozhodnout mezi výjimkou a návratovou hodnotou,
- najít chybu v cizím kódu systematicky: reprodukce, hypotéza, zúžení.

**Moduly:**
- **lesson** `vyjimky` — *Výjimky* — `throw`, `try`/`catch`/`finally`, co
  vyhodit, `error.cause`, `AggregateError`, kde chytat, polykání chyb.
  Cvičení: `predict` ×2 (`return` ve `finally`).
- **lesson** `vlastni-chyby` — *Vlastní chyby a návratové hodnoty* —
  `class ValidationError extends Error`, `instanceof` v `catch`,
  `{ ok, value, error }`, validace na hranici.
- **workshop** `workshop-validace-dat` [js] — *Validace dat objednávky* —
  staví: validátor se srozumitelnými chybami pro každé pole. ~14 kroků.
  Cvičení: `debug` (`catch {}` polyká chybu programu — objednávka „projde"
  s `undefined` cenou), `explain` (chyba uživatele vs. chyba programu).
- **lesson** `ladeni-systematicky` — *Ladění systematicky* — reprodukce,
  hypotéza, bisekce kódu, stack přes více souborů, breakpoint na výjimce,
  podmíněný breakpoint a logpoint, `console.table`/`group`/`trace`,
  `console.assert`, rubber duck, jak se ptát. (Základ debuggeru je
  v `js-zaklady`.) Cvičení: `check` s úkoly nad přiloženým kódem.
- **lab** `lab-oprav-chyby` [js] — *Oprav pět chyb* — kód s pěti skrytými
  chybami (mutace, `this`, off-by-one, `==`, zaokrouhlení), každý test = jedna
  chyba, bez tipů.
- **quiz** `kviz` — *Kvíz: chyby* — `finally`, kde chytat, stack trace, typ
  chyby podle hlášky. Cvičení: `code`.

## 2.9 `js-dom` — DOM, události a prohlížeč

**Úroveň:** jádro
**Odhad:** ~16 h (z toho projekt ~5 h)
**Předpoklady:** `js-chyby-ladeni`, `css-zaklady`

**Po sekci umíš:**
- najít, vytvořit a měnit prvky stránky bez XSS,
- obsloužit události včetně delegace a ovládání klávesnicí,
- zpracovat formulář v JavaScriptu s přístupným zobrazením chyb,
- ukládat stav do `localStorage` a do URL,
- postavit interaktivní aplikaci bez frameworku, kde data jsou zdroj pravdy a DOM se z nich vykresluje.

**Moduly:**
- **lesson** `strom-dom` — *Strom DOM* — uzly, `querySelector(All)`, `closest`,
  `textContent` vs. `innerHTML`, atributy vs. vlastnosti, `dataset`,
  `classList`, kdy skript běží. Cvičení: `predict` (NodeList je statický).
- **workshop** `workshop-seznam-ukolu` [dom] — *Seznam úkolů* — staví: todo
  aplikace. Učí: `createElement`, `append`, `template`, `textContent`, render
  z pole dat. ~22 kroků. Cvičení: `debug` (název úkolu `<img onerror>` se
  vykoná — XSS přes `innerHTML`), `explain` (data → DOM), `parsons` (funkce `render`).
- **lesson** `udalosti` — *Události* — `addEventListener` a volby, fáze,
  `target` vs. `currentTarget`, `preventDefault` vs. `stopPropagation`,
  delegace, klávesnice, `pointer*`, `CustomEvent`. Cvičení: `predict` (pořadí
  výpisů při probublávání).
- **workshop** `workshop-zalozky-a-dialog` [dom] — *Záložky a modální okno* —
  staví: přístupné záložky podle APG a dialog. ~18 kroků. Cvičení: `debug`
  (delegace reaguje na klik do ikony uvnitř tlačítka — `target` místo `closest`).
- **lesson** `formulare-v-js` — *Formuláře v JavaScriptu* — `submit`
  a `preventDefault`, `FormData`, `input` vs. `change`, Constraint Validation API.
- **lesson** `prohlizecova-api` — *Stav a API prohlížeče* — `localStorage`
  (jen řetězce, výjimky), `URL` a `URLSearchParams`, History API, událost
  `storage`, `IntersectionObserver`, `ResizeObserver`, layout thrashing
  a `requestAnimationFrame`, Clipboard API.
- **workshop** `workshop-filtr-produktu` [dom] — *Filtr produktů* — staví:
  katalog s hledáním, filtry a řazením, stav v URL a v `localStorage`. ~22 kroků.
  Cvičení: `vyber-sam` (zachovat filtr po obnovení), `debug` (po překreslení
  se ztratí fokus v poli hledání).
- **lab** `lab-kviz-aplikace` [dom] — *Kvízová aplikace* — samostatně: otázky
  z dat, výběr, skóre, klávesnice. Cvičení: `pred-startem`.
- **quiz** `kviz` — *Kvíz: DOM a události* — probublávání, `target`, XSS,
  `localStorage`. Cvičení: `code` (widget ~100 řádků).
- **project** `projekt-kanban` [dom] — *Kanban tabule* — cvičný projekt:
  sloupce, přidávání, přesun (tlačítka i drag and drop), filtr v URL, uložení.
  Testy: příběhy přes kliknutí a klávesnici, přežití obnovení, přístupnost.
  Cvičení: `review`, „Rozšíření do portfolia".

## 2.10 `js-async` — Asynchronní JavaScript a fetch

**Úroveň:** jádro
**Odhad:** ~17 h (z toho projekt ~5 h, kontrolní bod ~2 h)
**Předpoklady:** `js-dom`

**Po sekci umíš:**
- vysvětlit event loop a předpovědět pořadí výpisu s `setTimeout`, Promise a `await`,
- pracovat s Promise a `async`/`await` včetně souběhu, timeoutu a zrušení,
- načítat data přes `fetch` se stavy načítání, chyby a prázdna,
- ošetřit souběh odpovědí (starší odpověď nepřepíše novější),
- samostatně spojit fetch, zpracování dat a DOM do fungující aplikace.

**Moduly:**
- **lesson** `event-loop` — *Event loop* — zásobník, Web API, makroúlohy
  vs. mikroúlohy, vykreslování mezi úlohami, dlouhý výpočet zamrazí stránku.
  Cvičení: **`eventloop`** u všech ukázek, `predict` ×4 (pořadí výpisu),
  `explain` (event loop — pohovorová otázka).
- **lesson** `promise` — *Promise* — stavy, kdy psát `new Promise`,
  řetězení, `all`, `allSettled`, `race`, `any`, `withResolvers`, neobsloužené
  zamítnutí. Cvičení: `predict` (co vrátí `then` bez `return`).
- **lesson** `async-await` — *`async`/`await`* — vždy Promise, `try`/`catch`,
  sekvenční vs. paralelní, `for await…of`, top-level `await`, zapomenuté `await`.
  Cvičení: `eventloop` (kde se funkce „přeruší").
- **workshop** `workshop-casovace` [js] — *Časovače a souběh* — staví: simulace
  načítání několika zdrojů. Učí: `sleep`, `all` vs. `allSettled`, timeout,
  retry s exponenciálním čekáním, `AbortController`. ~18 kroků.
  Cvičení: `debug` (zapomenuté `await` — funkce vrací `[object Promise]`),
  `parsons` (retry smyčka), `vyber-sam` (načti tři zdroje co nejrychleji).
- **lesson** `fetch` — *fetch a HTTP z prohlížeče* — `Response`, 404 nevyhodí
  chybu, `json()`, hlavičky a tělo, CORS z pohledu prohlížeče, zrušení,
  souběh odpovědí. Cvičení: `predict` (co udělá `catch` u odpovědi 500).
- **workshop** `workshop-pocasi` [dom] — *Aplikace na počasí* — staví:
  vyhledávání a předpověď z mock API v seedu. Učí: stavy, zrušení předchozího
  požadavku, debounce, `aria-live`. ~22 kroků. Cvičení: `debug` (pomalá
  odpověď na „Pra" přepíše výsledek „Praha"), `explain` (proč rušit požadavky).
- **lab** `lab-galerie-api` [dom] — *Galerie s nekonečným scrollováním* —
  samostatně: stránkování z mock API, `IntersectionObserver`, chyba a opakování.
- **lab** `lab-oprav-3-chyby` [js] — *Oprav 3 chyby* *(nový)* — async chyby:
  `forEach` s `async` callbackem, chybějící `response.ok`, sekvenční `await`
  v cyklu tam, kde má být paralelní (mock v seedu počítá souběžně běžící požadavky, test neměří čas).
- **quiz** `kviz` — *Kvíz: async* — pořadí výpisu, `fetch` a 404, paralelní vs.
  sekvenční, zamítnutí. 20–30 % z celé části 2.
- **lab** `lab-kontrolni-bod-2` [dom] — *Kontrolní bod: katalog knihovny* —
  samostatně, bez uvedení sekcí: načtení dat z mock API, validace záznamů
  (vadné vynechat a nahlásit), řazení podle české abecedy a data, filtr
  z formuláře, vykreslení do DOM bez XSS, stav načítání a chyby.
  Cvičení: `pred-startem`, bez tipů `help`.
- **project** `projekt-filmova-databaze` [dom] — *Filmová databáze* — cvičný
  projekt: seznam, hledání, detail, oblíbené, stránkování, historie v URL nad
  přiloženým mock API. Cvičení: `review`, „Rozšíření do portfolia" (skutečné
  veřejné API s vlastním klíčem, nasazení).

---

# Část 3 — Nástroje a řemeslo

Všechno kolem kódu, bez čeho se nedá pracovat v týmu: Git do hloubky, moduly
a build, DevTools a výkon, TypeScript, testy — a řemeslo první práce: cizí
kód, práce s AI a algoritmy na pohovor. Od téhle části dělá uživatel projekty
ve VS Code s vlastním `npm install`. Sekce `nastroje-cizi-kod`, `prace-s-ai`
a `js-algoritmy` jsou v trase až po backendu (E4).

## 3.1 `nastroje-git-terminal` — Git a terminál do hloubky

**Úroveň:** jádro *(přejmenováno z `nastroje-terminal-git`, zúženo)*
**Odhad:** ~6 h
**Předpoklady:** `start-nastroje`
**Doporučeno předem:** `js-async`

Základy (init, add, commit, push, Pages, `cd`/`ls`) jsou ve `start-nastroje`.
Pull request a code review se přesunuly do `nastroje-cizi-kod`.

**Po sekci umíš:**
- skládat příkazy v terminálu rourami a přesměrováním a najít text i soubory,
- rozumět `PATH`, proměnným prostředí, návratovému kódu a procesům na portech,
- pracovat s větvemi, vyřešit konflikt a zvolit mezi `merge` a `rebase`,
- vrátit se z průšvihu přes `reset`, `revert`, `reflog` a najít commit s chybou přes `bisect`,
- přihlásit se k serveru přes SSH klíč.

**Moduly:**
- **lesson** `terminal-do-hloubky` — *Terminál do hloubky* — roury
  a přesměrování (`|`, `>`, `>>`, `2>&1`), `grep`/`rg`, `find`, `less`,
  proměnné prostředí a `PATH`, návratový kód a `&&`, procesy a porty
  (`lsof -i`, `ss`), `kill PID` (nikdy plošně), `ssh-keygen` a `ssh`,
  jednoduchý shell skript. Cvičení: `predict` (co skončí v souboru po `2>&1`).
- **workshop** `workshop-terminal` [node] — *Úklid projektu v terminálu* —
  staví: sérii příkazů, které přesunou soubory, vyhledají text a zapíšou výsledek.
  ~12 kroků. Cvičení: `debug` (skript pokračuje po chybě — chybí `&&`).
- **lesson** `git-model` — *Jak Git myslí* — commit jako snímek s rodičem,
  graf commitů, `HEAD`, větev jako ukazatel, detached HEAD, `log --graph`.
  Cvičení: `memory` (graf commitů a ukazatelů po každém příkazu), `predict`.
- **workshop** `workshop-vetve-a-konflikty` [node] — *Větve a konflikty* —
  staví: repozitář s paralelní prací. Učí: `switch -c`, fast-forward vs. merge
  commit, konflikt a jeho vyřešení, `rebase` (neinteraktivní), `stash`,
  `restore`, tagy. ~15 kroků. Cvičení: `debug` (v souboru zůstaly značky
  `<<<<<<<` a build padá), `explain` (merge vs. rebase).
- **lesson** `git-zachrana` — *Záchrana z průšvihů* — `reset --soft/--mixed/--hard`,
  `revert`, `reflog`, `commit --amend`, `cherry-pick`, `bisect`, zlaté pravidlo
  nepřepisovat sdílenou historii, omylem commitnuté tajemství (rotovat klíč).
  Cvičení: `predict` (stav po `reset --soft HEAD~1`).
- **lab** `lab-git-zachrana` [node] — *Záchrana repozitáře* — samostatně: commit
  na špatné větvi, smazaný soubor, konflikt, commitnutý `.env`, chyba k nalezení `bisect`.
- **quiz** `kviz` — *Kvíz: terminál a Git* — stav po sérii příkazů, `merge` vs.
  `rebase`, `reset` vs. `revert`, roury.

## 3.2 `nastroje-moduly-vite` — Moduly, npm, Vite a lint

**Úroveň:** jádro
**Odhad:** ~7 h
**Předpoklady:** `js-async`, `start-nastroje`

**Po sekci umíš:**
- rozdělit kód do ES modulů s rozumným veřejným rozhraním,
- spravovat závislosti přes npm nebo pnpm (verze, lockfile, skripty, bezpečnost),
- založit a sestavit projekt ve Vite a vysvětlit, co bundler dělá,
- nastavit ESLint (flat config) a formátovač a spouštět je před commitem.

**Moduly:**
- **lesson** `es-moduly` — *ES moduly* — pojmenovaný a výchozí export, živé
  vazby, vlastní scope, dynamický `import()`, top-level `await`, cyklické
  importy, `import.meta`, CommonJS jen v cizím kódu. Cvičení: `predict` (živá vazba).
- **workshop** `workshop-moduly` [node] — *Rozdělení aplikace do modulů* —
  staví: strukturu modulů s `index.js`. ~14 kroků. Cvičení: `debug`
  (`ERR_MODULE_NOT_FOUND` kvůli chybějící příponě), `vyber-sam` (co bude veřejné).
- **lesson** `npm-a-pnpm` — *npm, pnpm a package.json* — `dependencies` vs.
  `devDependencies`, semver `^`/`~`, lockfile a `npm ci`, `scripts`, `npx`,
  `"type": "module"`, `exports`, pnpm a proč je rychlejší a přísnější,
  bezpečnost (`npm audit`, typosquatting, cena závislosti).
  Cvičení: `predict` (které verze povolí `^1.2.3`).
- **lesson** `vite` — *Vite a bundlery* — proč bundler, Vite 8 (Rolldown), dev
  server a HMR, `index.html` jako vstup, import CSS a obrázků, `public/`,
  `import.meta.env` a `VITE_`, `build` a `preview`, co je v `dist/`.
- **lesson** `lint-a-format` — *Lint a formátování* *(nová)* — co najde linter
  a co formátovač, ESLint flat config (`eslint.config.js`), doporučená pravidla,
  Prettier nebo Biome, EditorConfig, formátování při uložení, lint-staged
  a git hook před commitem. **Od této sekce každý projekt kontroluje
  `npm run lint`.** Cvičení: `predict` (co ohlásí `no-unused-vars`).
- **workshop** `workshop-vite-projekt` [node] — *Projekt ve Vite* — staví:
  převod aplikace z `js-dom` do Vite projektu se skripty a lintem; testy
  spouštějí `node --run build` a kontrolují `dist/`. ~14 kroků. Vyžaduje
  předinstalovaný `vite` a `eslint` dostupný z node runtime (viz Balíčky pro
  kroky), jinak jako projekt.
- **lab** `lab-knihovna-utilit` [node] — *Balíček s utilitami* — samostatně:
  malý balíček s `exports`, skripty, lintem a README.
- **quiz** `kviz` — *Kvíz: moduly a npm* — exporty, `^1.2.3`, lockfile, build,
  `VITE_` proměnné, lint vs. formát.

## 3.3 `nastroje-devtools-vykon` — DevTools a výkon webu

**Úroveň:** jádro
**Odhad:** ~6 h
**Předpoklady:** `nastroje-moduly-vite`, `css-animace`

**Po sekci umíš:**
- najít příčinu problému přes Elements, Console, Sources, Network, Performance, Memory a Application,
- změřit Core Web Vitals (LCP, INP, CLS) a vysvětlit, co je ovlivňuje,
- zrychlit načtení stránky (obrázky, písma, blokující skripty, cache),
- rozdělit dlouhou úlohu a najít únik paměti.

**Moduly:**
- **lesson** `devtools-mapa` — *DevTools do hloubky* *(sloučeno s bývalou
  `pamet`)* — Elements (breakpoint na změnu DOM), Console (`$0`, živé výrazy),
  Sources (breakpoint na události a fetch, local overrides, source mapy),
  Network (vodopád, throttling, blokování, cURL), Application; úniky paměti
  (posluchači, časovače, odpojené uzly), heap snapshot a porovnání.
  Cvičení: `check` s úkoly „najdi v DevTools".
- **lesson** `core-web-vitals` — *Core Web Vitals* — LCP, INP, CLS,
  laboratorní vs. terénní data, Lighthouse a limity, panel Performance.
  Cvičení: `predict` (co zhorší CLS).
- **lesson** `nacitani-stranky` — *Rychlé načtení* — kritická cesta, `defer`
  a `async`, obrázky (AVIF/WebP, `fetchpriority`, lazy), písma, `preload`,
  cache a hash v názvech, code splitting.
- **workshop** `workshop-zrychleni` [dom] — *Zrychlení pomalé stránky* —
  staví: opravuje posunující se layout, blokující skript, obří obrázky a dlouhé
  úlohy. Učí: rozměry proti CLS, `scheduler.yield`, delegace,
  `content-visibility`, debounce. ~18 kroků. Cvičení: `debug` ×2 (každá
  výkonová chyba jako Hlášení uživatele), `explain` (proč dlouhá úloha zhorší INP).
- **lab** `lab-audit-vykonu` [dom] — *Audit výkonu* — samostatně: osm výkonových
  problémů, každý test ověří jeden.
- **quiz** `kviz` — *Kvíz: DevTools a výkon* — metriky, výběr panelu, co blokuje
  vykreslení, příčina CLS.

## 3.4 `nastroje-typescript` — TypeScript

**Úroveň:** jádro
**Odhad:** ~10 h
**Předpoklady:** `nastroje-moduly-vite`

**Po sekci umíš:**
- otypovat funkce, objekty a stavy a nechat zbytek na odvození,
- přečíst dlouhou typovou chybu a opravit ji bez `any` a bez `as`,
- zúžit typ z neznámých dat a modelovat stav rozlišeným sjednocením,
- přečíst typy knihovny (`.d.ts`) a použít generika,
- validovat data na hranici aplikace přes Zod a odvodit z schématu typ,
- nastavit `tsconfig` pro Vite i Node projekt.

**Moduly:**
- **lesson** `proc-typescript` — *Proč TypeScript* — statická kontrola vs. běh,
  typy se mažou (Node 24 spustí `.ts` s „erasable" syntaxí, Vite také),
  `tsc --noEmit` jako kontrola, TypeScript 7 s nativním kompilátorem, odvození.
  Cvičení: `predict` (projde kontrolou?).
- **lesson** `zakladni-typy` — *Základní typy* — pole a n-tice, `type` vs.
  `interface`, volitelné a `readonly`, sjednocení a literály, `unknown`/`any`/
  `never`, typy funkcí, `strict`.
- **workshop** `workshop-typy-kosiku` [node] — *Otypovaný košík* — staví: přepis
  modulu košíku do TS. Učí: typy produktů, literálové stavy, `satisfies`,
  `as const`, oprava chyb odhalených typy. ~18 kroků. Cvičení: `debug`
  (typová chyba odhalí `undefined` cenu), `parsons` (rozlišené sjednocení).
  Testy kontroly typů potřebují `typescript` v node runtime (viz Balíčky).
- **lesson** `zuzovani-a-genericita` — *Zúžení typů a generika* — guardy,
  rozlišené sjednocení a vyčerpávající `switch` s `never`, vlastní type guard,
  generika, `keyof`, utility typy, proč `as` lže. Cvičení: `predict` ×2, `explain`.
- **lesson** `typy-knihoven` — *Typy knihoven a dlouhé hlášky* *(nová)* —
  `@types/*` vs. vestavěné typy, čtení `.d.ts`, Go to Definition, generika
  v API knihoven, hláška odspodu nahoru, `ReturnType`/`Parameters`.
  Cvičení: `check` nad úryvky skutečných `.d.ts`.
- **lesson** `validace-na-hranici` — *Validace na hranici* *(nová, přesunuto
  z `api-http-rest`)* — proč typy nechrání před daty zvenku, Zod 4 (schéma,
  `z.infer`, `safeParse`, chyby jako data, `transform`), Valibot a Standard
  Schema zmínkou, jedno schéma pro klient i server. Cvičení: `predict`
  (co vrátí `safeParse` u chybějícího pole).
- **workshop** `workshop-api-klient` [node] — *Typově bezpečný API klient* —
  staví: klient nad JSON API s validací odpovědí. Učí: `unknown` z `JSON.parse`,
  ruční type guard, pak totéž přes Zod, generický `fetchJson`, stav načítání
  jako sjednocení. ~15 kroků. Vyžaduje `zod` v node runtime. Cvičení:
  `vyber-sam` (jak zajistit, že `price` je kladné číslo).
- **lab** `lab-typy-udalosti` [node] — *Systém událostí* — samostatně: otypovaný
  emitter s mapou názvů na typy dat. Cvičení: `approaches`.
- **quiz** `kviz` — *Kvíz: TypeScript* — co projde, `unknown` vs. `any`, zúžení,
  generika, co zbude po odstranění typů. Cvičení: `code` (dlouhá typová hláška).

## 3.5 `nastroje-testovani` — Testování

**Úroveň:** jádro
**Odhad:** ~11 h (z toho projekt ~6 h *(zmenšeno)*, kontrolní bod ~2 h)
**Předpoklady:** `nastroje-typescript`, `nastroje-git-terminal`

**Po sekci umíš:**
- rozhodnout, co a na jaké úrovni testovat,
- napsat unit testy v `node:test` a ve Vitestu včetně okrajových případů,
- mockovat čas a síť (falešné časovače, MSW) a vědět, kdy mock škodí,
- napsat e2e test v Playwrightu s lokátory podle role a kontrolou přístupnosti (axe-core),
- refaktorovat pod ochranou testů a napsat test, který zachytí nahlášenou chybu.

**Moduly:**
- **lesson** `proc-testovat` — *Co testovat a proč* — pyramida a trofej, unit
  vs. integrační vs. e2e, chování ne implementace, AAA, křehký test.
  Cvičení: `explain` (dobrý vs. křehký test).
- **workshop** `workshop-unit-testy` [node] — *Unit testy utilit* — staví: testy
  utilit v `node:test`. Učí: okrajové případy, `assert.throws` a `rejects`,
  parametrizované testy, test, který nejdřív selže. ~18 kroků. Cvičení:
  `debug` (test „prochází", protože chybí `await` u `rejects`).
- **lesson** `mocky-cas-sit` — *Čas, síť a závislosti* — mock funkce a špehy,
  falešné časovače, MSW (handlery, `setupServer`, jeden popis API pro testy
  i vývoj), vkládání závislostí, kdy mock škodí, Testing Library princip.
  Cvičení: `predict` (co otestuje mock, který vrací vždy úspěch).
- **lesson** `playwright` — *End-to-end v Playwrightu* — lokátory
  `getByRole`/`getByLabel`, automatické čekání, proč ne `waitForTimeout`,
  izolace dat, trace viewer, `@axe-core/playwright` pro přístupnost.
- **workshop** `workshop-refaktoring` [node] — *Refaktoring pod testy* — staví:
  charakterizační testy přerostlé funkce a její rozdělení. ~14 kroků.
  Cvičení: `vyber-sam` (další bezpečný krok refaktoringu).
- **lab** `lab-testy-validatoru` [node] — *Testy pro cizí kód* — samostatně:
  sada testů, která odhalí tři chyby ve validátoru.
- **quiz** `kviz` — *Kvíz: testování* — co testovat, křehký test, mock vs.
  skutečná závislost, lokátory. 20–30 % z `nastroje-typescript`.
- **lab** `lab-kontrolni-bod-3` [node] — *Kontrolní bod: nahlášená chyba* —
  samostatně, bez uvedení sekcí: v repozitáři s TS modulem rezervací
  (`ISSUE.md` popisuje chybu) napsat test, který chybu zachytí, opravit ji,
  doplnit chybějící funkci s testy a vše commitnout po krocích. Testy: `node
  --test` projde, skrytý test chyby projde, přibyly testy, ≥ 2 nové commity,
  čistý pracovní adresář. Bez tipů `help`.
- **project** `projekt-rozpoctovac` [node] — *Rozpočet ve Vite a TypeScriptu* —
  cvičný projekt (~6 h): příjmy, výdaje, kategorie, měsíční přehled,
  `localStorage`. Kontrola: `npm run lint`, `npm run typecheck`, `npm test`
  (Vitest), jeden e2e test, `npm run build`. Cvičení: `review`.

## 3.6 `nastroje-cizi-kod` — Práce v cizím kódu

**Úroveň:** jádro *(nová)*
**Odhad:** ~10 h
**Předpoklady:** `nastroje-testovani`, `api-http-rest`

**Po sekci umíš:**
- zorientovat se v neznámém repozitáři: README, skripty, vstupní body, testy, historie,
- projít cestu od issue k pull requestu: reprodukce, větev, malé commity, test, popis,
- dávat code review věcně a srozumitelně a přijímat ho bez ega,
- odhadnout úkol, včas se ozvat se zaseknutím a komunikovat stav,
- změnit cizí kód bezpečně: charakterizační test, minimální změna, dodržení konvencí.

**Moduly:**
- **lesson** `orientace-v-cizim-kodu` — *Orientace v cizím kódu* — mapa
  repozitáře, sledování jednoho požadavku skrz kód, hledání (`rg`, Go to
  Definition, Find References), `git log -p`, `blame`, `log -S`, spustit testy
  jako první krok, poznámka „mapa projektu". Cvičení: `check` nad fixture
  („kde se počítá cena?").
- **workshop** `workshop-feature-v-cizim-projektu` [node] — *Feature v cizím
  projektu* — staví: ve fixture ~30 souborů (API rezervací v Node + TS,
  frontend moduly, testy v `node:test`, konvence v `CONTRIBUTING.md`) přidá
  slevový kód podle issue: najde místo, napíše test, implementuje podle
  existujících vzorů, nerozbije ostatní testy. ~15 kroků. Cvičení:
  `vyber-sam` (kam změnu umístit), `debug` (chyba objevená při čtení kódu),
  `explain` (proč právě tady).
- **lesson** `od-issue-k-pr` — *Od issue k pull requestu* — reprodukce, větev,
  malé commity, rebase na aktuální `main`, popis PR (co, proč, jak otestovat,
  snímky), draft PR, CI kontroly, fork a CONTRIBUTING, konvenční commity zmínkou.
- **lesson** `code-review` — *Code review* — co hlídat (správnost, testy,
  čitelnost, bezpečnost; ne styl, ten hlídá linter), jak psát komentář
  (otázka, návrh, `nit:`), velikost PR, jak přijímat review.
  Cvičení: `check` (který komentář je nejužitečnější).
- **lesson** `odhad-a-komunikace` — *Odhad a komunikace* — rozpad úkolu, odhad
  v rozsahu, timebox a kdy se ozvat, standup, psaná asynchronní komunikace,
  jak se ptát seniora, definition of done.
- **lab** `lab-code-review` [node] — *Code review s testy* — samostatně: PR
  (diff ve fixture) se šesti problémy; uživatel je opraví tak, aby prošly
  testy, a do `REVIEW.md` napíše komentáře. Testy = problémy, komentáře
  hodnotí rubrika `review`.
- **quiz** `kviz` — *Kvíz: cizí kód* — Git archeologie, výběr komentáře, velikost
  PR. Cvičení: `code` (diff PR o ~100 řádcích).

## 3.7 `prace-s-ai` — Práce s AI při vývoji

**Úroveň:** jádro *(nová, schváleno E2)*
**Odhad:** ~7 h
**Předpoklady:** `nastroje-cizi-kod`

**Po sekci umíš:**
- vysvětlit, jak jazykový model generuje kód a proč selhává (vymyšlené API, zastaralé verze, sebejistý omyl, chybějící kontext),
- používat AI jako tutora, který vysvětluje, a ne jako náhradu vlastního učení,
- zadat úkol agentovi: kontext, omezení, kritéria přijetí jako testy, malé kroky,
- zrevidovat kód z AI stejně přísně jako cizí pull request a doplnit testy,
- poznat bezpečnostní a licenční rizika (tajemství v zadání, neexistující balíčky).

**Moduly:**
- **lesson** `jak-llm-selhava` — *Jak jazykový model selhává* — predikce dalšího
  tokenu jednou větou, kontextové okno, typické chyby: vymyšlené funkce
  a balíčky (a útoky na ně), zastaralé vzory (třídní komponenty, Pages Router),
  řešení jiné úlohy, vynechané okrajové případy, testy testující implementaci.
  Cvičení: `predict` ×3 („co je na tomhle vygenerovaném kódu špatně?").
- **lesson** `ai-jako-tutor` — *AI jako tutor* — navazuje na
  `start-nastroje/uceni-s-ai`: sokratovský režim, vysvětlení chyby bez řešení,
  nechat se kvízovat, ověřit v dokumentaci, kdy AI vypnout (první pokus,
  pohovor, cvičné úlohy).
- **lesson** `zadavani-agentovi` — *Zadávání úkolu agentovi* — specifikace před
  kódem, kontext (soubory, konvence, instrukce projektu), omezení, kritéria
  přijetí jako testy, malé kroky s commitem po každém, čtení diffu, co agentovi
  nesvěřit (tajemství, produkce, nevratné operace).
  Cvičení: `explain` (dobré zadání vs. „udělej to").
- **lesson** `review-kodu-z-ai` — *Review kódu z AI* — checklist: spustit,
  testy, okrajové případy, existují závislosti, bezpečnost (SQL injection, XSS,
  tajemství), zbytečná složitost, licence; diff řádek po řádku.
- **workshop** `workshop-oprav-skryte-chyby` [node] — *Oprav kód se 7 skrytými
  chybami* — staví: z „vygenerovaného" modulu (fixture) spolehlivý kód. Sedm
  chyb: neexistující metoda, off-by-one, časové pásmo, skládání SQL z řetězců,
  chybějící `await`, mutace vstupu, test, který nic neověřuje. Každá chyba =
  napiš test, který ji zachytí, pak oprav. ~14 kroků. Cvičení: `debug` u všech
  sedmi chyb, `explain` (jak jsem chybu našel).
- **quiz** `kviz` — *Kvíz: práce s AI* — typy selhání, dobré zadání, co zkontrolovat
  v review. Cvičení: `code` (vygenerovaný modul s chybami).

## 3.8 `js-algoritmy` — Algoritmy a úlohy na pohovor

**Úroveň:** jádro *(nová, E4: na konci trasy)*
**Odhad:** ~15 h
**Předpoklady:** `js-tridy-kolekce`, `js-async`
**Doporučeno předem:** `nastroje-testovani`

**Po sekci umíš:**
- postupovat při neznámé úloze: pochopit, příklady, hrubá síla, zlepšení, ověření, a mluvit přitom nahlas,
- odhadnout časovou a paměťovou složitost kódu v Big O,
- zvolit datovou strukturu (pole, `Map`, `Set`, zásobník, fronta, strom, graf) podle operací,
- poznat vzory úloh (hash mapa, dva ukazatele, klouzavé okno, binární vyhledávání, BFS/DFS, memoizace),
- napsat bez nápovědy pohovorové utility: `debounce`, `throttle`, `deepClone`, `Promise.all`, LRU cache.

**Moduly:**
- **lesson** `postup-reseni` — *Postup řešení úlohy* — rozšiřuje
  `js-zaklady/reseni-problemu` na pohovor: doptat se, příklady, hrubá síla
  nahlas, zlepšení, ruční test, okrajové případy.
- **lesson** `big-o` — *Big O* — O(1) až O(n²) a O(2ⁿ), cena metod pole
  (`includes` v cyklu = n², `shift` je O(n)), paměť, amortizace zmínkou.
  Cvičení: `predict` ×4 (složitost úryvku), `trace` (počet kroků dvou vnořených cyklů).
- **lesson** `datove-struktury` — *Datové struktury* — zásobník, fronta,
  hash (`Map`/`Set`), strom, graf jako seznam sousedů, halda zmínkou.
  Cvičení: `memory` (fronta při BFS).
- **workshop** `workshop-vzory-uloh` [js] — *Vzory úloh* — staví: sadu řešení:
  dvojice se součtem (`Map`), anagramy, palindrom dvěma ukazateli, nejdelší
  podřetězec klouzavým oknem, binární vyhledávání, BFS v mřížce, DFS stromu
  kategorií, memoizovaný počet cest. ~18 kroků. Cvičení: `parsons` (BFS),
  `debug` (binární vyhledávání se zacyklí na dvou prvcích), `explain` (proč
  `Map` zlepší složitost).
- **lesson** `razeni-a-rekurze` — *Řazení a rekurze* — jak funguje merge sort,
  stabilita `sort`, rekurze vs. iterace, memoizace, přetečení zásobníku.
- **workshop** `workshop-pohovorove-utility` [js] — *Pohovorové utility* —
  staví: `debounce`, `throttle`, `deepClone` (cykly, `Date`, `Map`),
  `Promise.all`, LRU cache nad `Map`, `EventEmitter`, `curry`. ~15 kroků.
  Cvičení: `debug` (`debounce` ztrácí `this` a argumenty), `explain` (LRU).
- **lab** `lab-10-uloh` [js] — *Deset úloh* — samostatně: deset úloh
  s testy včetně velkého vstupu (100 000 prvků), na kterém řešení O(n²) nedoběhne v limitu testu.
  Cvičení: `approaches` u každé úlohy, navazuje na cvičné úlohy `#/cviceni`.
- **quiz** `kviz` — *Kvíz: algoritmy* — složitost kódu, výběr struktury, vzor
  úlohy. Cvičení: `code`.

---

# Část 4 — Frontend framework — React

Hlavní framework kurzu (E1). React 19 v prohlížečovém runtime `react` (B22)
pro lekce, workshopy a laby; Vite + TypeScript, React Router, TanStack Query,
testy a styly v projektech. Mezi `react-hloubka` a `react-aplikace` stojí
`react-ui-knihovny`: Tailwind, shadcn/ui s Radix primitivy a Motion for React.
Vue a Nuxt jsou jen rozšíření na konci části. Runtime `react` musí být hotový
před `react-zaklady`.

## 4.1 `react-zaklady` — React: základy

**Úroveň:** jádro *(nová)*
**Odhad:** ~12 h
**Předpoklady:** `js-dom`, `nastroje-moduly-vite`

**Po sekci umíš:**
- vysvětlit deklarativní UI (stav → vzhled) a porovnat ho s ruční prací s DOM,
- psát komponenty v JSX s props a children a skládat je do stromu,
- vykreslovat seznamy se stabilním `key` a podmínky bez pastí (`0 &&`),
- spravovat stav přes `useState` a vysvětlit, proč je stav snímek a aktualizace se dávkují,
- ovládat formulářová pole a zvednout stav do společného rodiče.

**Moduly:**
- **lesson** `proc-react` — *Proč React* — deklarativní UI, komponenta jako
  funkce vracející JSX, render, React 19 a Vite, React vs. Vue a Svelte bez
  fanatismu, React Compiler zmínkou. Cvičení: `compare` (render seznamu
  ručně v DOM vs. v Reactu), `pretest`.
- **lesson** `jsx` — *JSX* — JSX jako volání funkce, výrazy v `{}`,
  `className`, `htmlFor`, `style` objekt, fragmenty, escapování (JSX je proti
  XSS bezpečné), `dangerouslySetInnerHTML`. Cvičení: `predict` ×2
  (`{count && <p/>}` při nule vykreslí `0`; co vypíše `{['a','b']}`).
- **lesson** `komponenty-a-props` — *Komponenty a props* — props jako
  parametry, destrukturalizace s výchozími hodnotami, `children`, props se
  nemění, kompozice, seznamy přes `map` a `key` (proč ne index), podmíněné
  vykreslení. Cvičení: `predict` (co se stane se vstupem v řádku po smazání
  prvního, když `key` je index), `explain` (`key`).
- **workshop** `workshop-karta-produktu` [react] — *Katalog produktů* — staví:
  `ProductCard`, `Price`, `Badge`, `ProductList` z pole dat, stav „vyprodáno",
  `children` pro rozvržení. ~16 kroků. Cvičení: `parsons` (komponenta
  s destrukturalizací props), `debug` (prázdný košík ukazuje „0" —
  `items.length && …`), `vyber-sam` (zobraz štítek jen u slevy).
- **lesson** `stav-jako-snimek` — *Stav jako snímek* — `useState`, render jako
  snímek, `setCount(count + 1)` třikrát, funkce aktualizace, dávkování, objekty
  a pole ve stavu bez mutace, odvozená hodnota místo stavu. Cvičení: `predict`
  ×3, `memory` (hodnota stavu v každém renderu), `explain` (snímek — pohovorová otázka).
- **lesson** `udalosti-a-formulare` — *Události a formuláře* — předání funkce
  vs. volání, řízené pole (`value` + `onChange`), `select` a `checkbox`,
  `onSubmit` a `preventDefault`, `<form action>` s funkcí a `useActionState`
  zmínkou (hloubka v `react-aplikace` a `next-fullstack`), zvednutí stavu,
  jeden zdroj pravdy. Cvičení: `predict` (`onClick={handle()}`).
- **workshop** `workshop-pocitadlo-kalorii` [react] — *Počítadlo kalorií* —
  staví: denní přehled jídel: formulář, seznam, mazání, součty, filtr, cíl
  a ukazatel. ~20 kroků. Cvičení: `debug` (`items.push` ve stavu — nic se
  nepřekreslí), `explain` (proč součet není ve stavu), `vyber-sam` (filtr podle
  typu jídla).
- **lab** `lab-kviz-v-reactu` [react] — *Kvíz v Reactu* — samostatně: kvízová
  aplikace z `js-dom` znovu v Reactu. Cvičení: `pred-startem`, `approaches`
  (jeden stav s indexem vs. stav s odpověďmi).
- **quiz** `kviz` — *Kvíz: React základy* — co se vykreslí, kolikrát render,
  `key`, řízené pole, snímek stavu. 20–30 % z `js-dom`. Cvičení: `code`.

## 4.2 `react-hloubka` — React do hloubky

**Úroveň:** jádro *(nová)*
**Odhad:** ~14 h
**Předpoklady:** `react-zaklady`, `js-async`

**Po sekci umíš:**
- popsat, kdy React komponentu vykreslí znovu a kdy to (ne)vadí,
- poznat, kdy `useEffect` nepotřebuješ, a když ano, napsat ho s úplnými závislostmi a úklidem,
- použít `useRef` pro DOM i pro hodnotu mimo render,
- vytáhnout logiku do vlastního hooku,
- spravovat složitější stav přes `useReducer` a sdílet ho kontextem,
- ošetřit chyby a načítání přes error boundary a Suspense a vykreslit modal přes portál.

**Moduly:**
- **lesson** `render-a-rerender` — *Render a rerender* — trigger → render →
  commit, rerender potomků, identita objektů a funkcí v props, `memo`,
  `useMemo`, `useCallback` a proč s React Compilerem většinou ne,
  StrictMode a dvojí render, Profiler v React DevTools. Cvičení: `predict` ×2
  (kolikrát se vypíše log).
- **lesson** `useeffect-spravne` — *useEffect správně* — efekt = synchronizace
  s vnějším systémem; kdy efekt nepotřebuješ (odvozený stav, reset přes
  `key`, akce do handleru), závislosti, úklid, souběh při načítání (příznak
  nebo `AbortController`), `useEffectEvent` (React 19.2), StrictMode
  mount → unmount → mount. Cvičení: `debug` v ukázkách, `predict` (pořadí
  efektu a úklidu), `explain` (kdy efekt ano a kdy ne).
- **lesson** `useref-a-dom` — *useRef a DOM* — ref na prvek (fokus, scroll,
  měření), ref jako schránka mimo render, `ref` jako prop v React 19 (bez
  `forwardRef`), proč ref nečíst v renderu.
- **workshop** `workshop-modal-a-toasty` [react] — *Modal a oznámení* — staví:
  modal přes `createPortal` s fokusem a návratem fokusu, Escape, oznámení
  s časovačem, vlastní hook `useToasts`. ~18 kroků. Cvičení: `debug` (interval
  bez úklidu — ve StrictMode dvojitá oznámení), `parsons` (efekt s posluchačem
  a úklidem), `explain` (proč úklid).
- **lesson** `vlastni-hooky` — *Vlastní hooky* — pravidla hooků, hook sdílí
  logiku, ne stav, `useLocalStorage`, `useDebouncedValue`, `useMediaQuery`
  přes `useSyncExternalStore`. Cvičení: `predict` (dvě komponenty se stejným
  hookem sdílejí stav?).
- **lesson** `reducer-a-context` — *Reducer a kontext* — `useReducer` (akce
  jako rozlišené sjednocení, čistý reducer), kontext (`<Context>` jako
  provider v React 19), kontext + reducer, kdy kontext překreslí vše, kdy
  knihovna (Zustand zmínkou). Cvičení: `trace` (průchod akcí reducerem).
- **lesson** `chyby-suspense-portaly` — *Chyby, Suspense a portály* — error
  boundary, Suspense a `use()` s promise, `lazy`, `useTransition`,
  `useDeferredValue`, `<Activity>` zmínkou, portály a události skrz portál.
  Cvičení: `predict` (kam doputuje klik z portálu).
- **lab** `lab-tabulka-dat` [react] — *Tabulka dat* — samostatně: řazení, filtr,
  stránkování, výběr řádků, stav přes reducer. Cvičení: `approaches`
  (reducer vs. několik `useState`).
- **quiz** `kviz` — *Kvíz: React do hloubky* — rerender, závislosti efektu,
  úklid, kontext, Suspense. Cvičení: `code` (komponenta ~100 řádků se třemi
  problémy v efektech).

## 4.3 `react-ui-knihovny` — UI knihovny a animace v Reactu

**Úroveň:** jádro *(nová)*
**Odhad:** ~12 h
**Předpoklady:** `react-hloubka`, `css-tailwind`
**Doporučeno předem:** `css-efekty-animace`
**Navazuje:** `react-aplikace` (styly a komponenty ve vlajkovém projektu 2)

Jak se v React projektech dnes skutečně staví rozhraní: Tailwind v komponentách,
vlastní sada komponent ve stylu shadcn/ui nad přístupnými primitivy Radix
a animace přes Motion for React. Knihovny se neučí jako černá skříňka: u každé
komponenty uživatel ví, co by musel napsat sám (fokus, Escape, ARIA, portál)
a proč to přenechá primitivu. Kroky běží v runtime `react` s `libs:
["tailwind"]` a importy `radix-ui`, `clsx`, `class-variance-authority`,
`tailwind-merge` a `motion/react` z vendoru. Testy hledají prvky podle role
a názvu, ovládají je myší i klávesnicí (`Tab`, šipky, `Escape`), čtou
atributy `data-state` a `aria-*`, spočtené styly a návrat fokusu; animace
Motion v testech přeskakují na konečný stav (`MotionGlobalConfig.skipAnimations`)
a u `AnimatePresence` se čeká na odstranění prvku (viz Otevřené body na konci).
CLI `shadcn` se v krocích nespouští: komponenty jsou v seedu jako soubory
`components/ui/*.tsx`, stejně jako by je CLI zkopírovalo; instalace přes CLI je
v lekci ukázaná a zkouší se v projektu.

**Po sekci umíš:**
- stylovat React komponenty Tailwindem a skládat třídy podle props přes `clsx` a `tailwind-merge` (`cn()`) bez konfliktů,
- navrhnout API komponenty s variantami přes `class-variance-authority` a přijmout `className` a `ref` zvenku,
- vysvětlit, co shadcn/ui je a není (kód v repozitáři, ne závislost), přidat komponentu a upravit ji pro projekt,
- postavit přístupný dialog, rozbalovací menu, záložky a výběr nad Radix primitivy a ověřit je klávesnicí,
- animovat vstup, odchod, změnu layoutu a gesta přes Motion for React s ohledem na `prefers-reduced-motion`,
- založit malý design systém projektu: tokeny, primitivy, komponenty a pravidla, kdy přidat variantu a kdy novou komponentu.

**Moduly:**
- **lesson** `tailwind-v-reactu` — *Tailwind v komponentách* — `className`
  místo `class`, proč komponenta nahrazuje `@apply` a opakované bloky tříd
  (navazuje na `css-tailwind/komponenty-bez-duplicit`); podmíněné třídy přes
  `clsx` (objekt, pole, `false` a `undefined` se zahodí); konflikt dvou utilit
  pro stejnou vlastnost při přepsání zvenku (`px-4` z komponenty
  a `px-8` z props — rozhoduje pořadí ve vygenerovaném CSS, ne v atributu)
  a jeho řešení přes `tailwind-merge`; helper `cn(...inputs)`
  = `twMerge(clsx(inputs))`; celé názvy tříd v mapě variant místo skládání
  řetězce (`` `bg-${tone}-500` `` se nevygeneruje); stav jako `data-*`
  atribut a varianta `data-[active=true]:`; `style` jen pro hodnoty spočtené
  za běhu (šířka ukazatele průběhu) přes CSS proměnnou. Cvičení: `pretest`
  („proč nestačí `className={base + ' ' + className}`?"), `predict` (která
  z tříd `px-4 px-8` vyhraje bez a s `twMerge`), `compare` (tlačítko
  s podmínkami v šablonovém řetězci × `cn()`), `explain` (co dělá `clsx` a co
  `tailwind-merge`).
- **workshop** `workshop-sada-komponent` [react + tailwind] — *Komponenty
  rezervačního systému kadeřnictví* — staví: sadu `Button`, `Badge`, `Card`,
  `Input` a `Avatar` a z nich stránku výběru kadeřnice s volnými termíny,
  cenou v Kč a tlačítkem „Rezervovat". Učí: `cn()` v každé komponentě,
  `cva` s `variants` (`variant`, `size`), `defaultVariants`
  a `compoundVariants`, typ props přes `VariantProps` a `ComponentProps<'button'>`,
  `className` a zbytek props (`...props`) předané dál, `ref` jako prop
  (React 19), `asChild` přes `Slot` z `radix-ui` (tlačítko, které je odkazem),
  stav `disabled` a `aria-invalid` stylovaný variantami `disabled:`
  a `aria-invalid:`, viditelný fokus. ~18 kroků, mezistav po kroku 9 (hotové
  `Button` a `Badge`). Cvičení: `parsons` (komponenta s `cva` a `cn`),
  `debug` (`className="w-full"` z rodiče tlačítko neroztáhne — komponenta
  props `className` nepředává), `debug` (varianta `destructive` je modrá —
  výchozí `bg-*` přebije přepsání, protože chybí `twMerge`), `vyber-sam`
  (štítek „Obsazeno" jako nová varianta, nebo nová komponenta), `explain`
  (proč `asChild` místo `<a>` uvnitř `<button>`).
- **lesson** `shadcn-a-radix` — *shadcn/ui a Radix primitivy* — co musí
  umět přístupný dialog, menu a záložky (fokus uvnitř, návrat fokusu,
  `Escape`, šipky, `role`, `aria-expanded`, `aria-controls`, portál, zamčený
  scroll) a proč to nepsat pokaždé znovu (navazuje na
  `react-hloubka/workshop-modal-a-toasty`); headless primitivy Radix
  (jednotný balíček `radix-ui`, `import { Dialog } from 'radix-ui'`, části
  `Root`, `Trigger`, `Portal`, `Overlay`, `Content`, `Title`, `Description`,
  `Close`); řízený a neřízený režim (`open` a `onOpenChange` × `defaultOpen`);
  styl podle stavu přes `data-state` a `data-side` (`data-[state=open]:`);
  shadcn/ui jako **kód ve tvém repozitáři, ne závislost**: `npx shadcn@latest
  init` a `add`, `components.json`, složka `components/ui`, `lib/utils.ts`
  s `cn`, tokeny `--background`, `--primary`, `--ring` v `@theme inline`
  a tmavý motiv; úprava zkopírované komponenty a cena za to (aktualizace
  ručně); Base UI a React Aria zmínkou jako alternativy. Cvičení: `pretest`,
  `predict` (kam se vrátí fokus po zavření dialogu otevřeného z menu),
  `check` (co ze seznamu řeší primitivum a co zůstává na tobě — texty,
  vzhled, `Title`), `explain` (proč shadcn/ui kopíruje kód místo balíčku).
- **workshop** `workshop-pristupne-komponenty` [react + tailwind] —
  *Nastavení účtu hudební streamovací služby* — staví: stránku nastavení se
  záložkami Profil, Předplatné a Zařízení, menu u každého zařízení
  (přejmenovat, odhlásit), dialog pro zrušení předplatného s potvrzením,
  výběr jazyka a přepínač explicitního obsahu. Učí: `Tabs` (šipky mezi
  záložkami, `value` v URL zmínkou), `DropdownMenu` s položkami, oddělovačem
  a `onSelect`, `Dialog` řízený stavem s `Title` a `Description`, `AlertDialog`
  pro nevratnou akci, `Select`, `Switch` s `Label`, `Tooltip` u ikonového
  tlačítka, styly stavů přes `data-[state=…]:`, vstupní animace obsahu
  přes `data-[state=open]:animate-*` z `@theme`, ověření klávesnicí.
  ~20 kroků, mezistav po kroku 10 (hotové záložky a menu). Cvičení: `debug`
  (čtečka ohlásí dialog bez názvu a konzole varuje — chybí `Dialog.Title`),
  `debug` (po smazání zařízení z menu zůstane fokus na `body` — dialog se
  otevírá z odmontované položky místo řízeného stavu mimo menu), `parsons`
  (skladba `Dialog.Root` → `Portal` → `Overlay` → `Content`), `vyber-sam`
  (potvrzení odhlášení všech zařízení — `Dialog`, nebo `AlertDialog`),
  `explain` (proč `AlertDialog` nezavře klik mimo).
- **lesson** `motion-for-react` — *Motion for React* — kdy animovat
  v Reactu přes Motion a kdy stačí CSS `transition` nebo `data-state`
  s `@keyframes`; `motion.div` a props `initial`, `animate`, `transition`
  (pružina × `tween`, `duration`, `ease`); animace mimo render (Motion mění
  styly přímo, komponenta se nepřekresluje v každém snímku); `variants`
  s `staggerChildren` a `delayChildren`; `AnimatePresence` a `exit` (proč
  potřebuje stabilní `key` a přímého potomka, `mode="wait"`
  a `"popLayout"`, `onExitComplete`); `layout` a `layoutId` pro plynulou změnu
  layoutu a sdílený prvek (ukazatel aktivní záložky), `LayoutGroup`; gesta
  `whileHover`, `whileTap`, `whileFocus`, `drag` s `dragConstraints`;
  `useScroll`, `useTransform` a `useSpring` pro efekt řízený scrollem;
  `MotionConfig reducedMotion="user"` a `useReducedMotion`; velikost
  balíčku (`LazyMotion` a `m` zmínkou); vazba na GSAP a Motion z
  `css-efekty-animace`. Cvičení: `pretest`, `predict` (odchodová animace se
  nespustí, když podmínka stojí mimo `AnimatePresence`), `controls`
  (`stiffness`, `damping` a `mass` pružiny), `compare` (přeskupení seznamu
  bez a s `layout`), `explain` (proč `exit` potřebuje `AnimatePresence`).
- **workshop** `workshop-dashboard-s-animacemi` [react + tailwind] —
  *Dashboard půjčovny elektrokol* — staví: přehled půjčovny s bočním menu,
  kartami statistik (vypůjčená kola, tržba dne v Kč, stav baterií), seznamem
  výpůjček s filtrem, panelem detailu kola a oznámeními. Učí: vstup karet
  přes `variants` se `staggerChildren`, počítadlo tržby přes `animate`
  a `useMotionValue` s `Intl.NumberFormat`, ukazatel aktivní položky menu
  a filtru přes `layoutId`, přidání a odebrání výpůjčky v `AnimatePresence`
  s `layout` u zbylých řádků (`mode="popLayout"`), panel detailu jako Radix
  `Dialog` s animací vstupu a odchodu (`forceMount` s `AnimatePresence`),
  oznámení, která jdou odtáhnout (`drag="x"`, zavření podle posunu), gesta
  `whileHover` a `whileTap` na kartách, `MotionConfig reducedMotion="user"`,
  komponenty z `workshop-sada-komponent` v nové doméně. ~24 kroků, mezistav
  po kroku 12 (hotové karty a menu). Cvičení: `debug` (smazaný řádek zmizí
  bez animace — `key` je index pole, takže odchází poslední řádek), `debug`
  (panel detailu se zavře bez odchodové animace — Radix odmontuje obsah
  dřív, než Motion doanimuje), `parsons` (`AnimatePresence` s podmínkou
  a `exit`), `vyber-sam` (zvýraznění kola s vybitou baterií — CSS animace,
  nebo Motion), `explain` (co dělá `layoutId`).
- **lesson** `design-system-projektu` — *Design systém projektu
  a formulářové komponenty* — vrstvy: tokeny v `@theme` (primitivní
  a sémantické z `css-tailwind`) → primitivy (Radix) → komponenty
  (`components/ui`) → vzory (formulářové pole, prázdný stav, karta
  s akcemi); pojmenování variant (`variant`, `size`, `tone`) napříč sadou;
  kdy přidat variantu, kdy novou komponentu a kdy skládání přes `children`
  (složené komponenty `Card`, `CardHeader`, `CardContent` místo desíti
  boolean props); formulářové pole jako vzor: `Label`, `Input`, popis a chyba
  propojené přes `useId`, `aria-describedby` a `aria-invalid`, zobrazení chyby
  s `AnimatePresence`; `Checkbox`, `RadioGroup` a `Select` z Radix proti
  nativním prvkům (kdy nativní stačí); stránka s ukázkami komponent místo
  dokumentace (Storybook zmínkou); jednotné stavy `hover`, `focus-visible`,
  `disabled` a tmavý motiv; údržba zkopírovaných komponent. Cvičení:
  `predict` (ohlásí čtečka chybu pole, když `aria-describedby` odkazuje na
  neexistující `id`?), `check` (varianta × nová komponenta × `children` pro
  čtyři situace), `explain` (proč složené komponenty místo boolean props).
- **lab** `lab-formular-s-komponentami` [react + tailwind] — *Přihláška
  s komponentami* — samostatně: vícekrokový přihlašovací formulář (seed nabízí
  přihlášku na letní kurz lezení; téma, texty a vzhled jsou volba uživatele)
  poskládaný z vlastních komponent: pole s popisem a chybou, výběr termínu,
  volba varianty kurzu, souhlas, přechod mezi kroky s animací a návratem
  fokusu na nadpis kroku, souhrn před odesláním v dialogu, oznámení po
  odeslání, s omezeným pohybem bez posunu, ovladatelné klávesnicí. Testy
  ověřují role, názvy, chování a přístupnost, ne třídy ani texty. Cvičení:
  `pred-startem`, `approaches` (Radix `Select` × nativní `select`; varianty
  přes `cva` × podmínky v `cn()`).
- **quiz** `kviz` — *Kvíz: UI knihovny v Reactu* — `clsx` × `tailwind-merge`,
  varianty `cva`, co řeší primitivum Radix, řízený dialog, `data-state`,
  shadcn/ui jako kód v repozitáři, `AnimatePresence` a `key`, `layoutId`,
  omezený pohyb. 20–30 % z `react-hloubka` a `css-tailwind`. Cvičení: `code`
  (komponenta dialogu a seznamu ~100 řádků se třemi problémy: chybějící
  `Title`, `key` z indexu v `AnimatePresence`, `className` bez `cn()`).
- **Soubory sekce:** `tahak.md` s kostrou `cn()` a `cva`, skladbou Radix
  `Dialog`, `DropdownMenu` a `Tabs`, tabulkou props Motion (`initial`,
  `animate`, `exit`, `layout`, `layoutId`, `while*`) a pastmi
  `AnimatePresence`.

## 4.4 `react-aplikace` — React aplikace

**Úroveň:** jádro *(nová)*
**Odhad:** ~26 h (z toho vlajkový projekt ~12 h, kontrolní bod ~2 h)
**Předpoklady:** `react-hloubka`, `nastroje-typescript`, `nastroje-testovani`
**Doporučeno předem:** `api-http-rest`
**Související:** `react-ui-knihovny` (Tailwind, shadcn/ui a Motion v Reactu do hloubky)

**Po sekci umíš:**
- založit React projekt ve Vite s TypeScriptem, lintem a rozumnou strukturou,
- nastavit routování (React Router v7) s parametry, layouty, stavem v URL a lazy načítáním,
- rozlišit druhy stavu (UI, formulář, serverová data, URL, globální) a pro každý zvolit nástroj,
- načítat a měnit serverová data přes TanStack Query včetně invalidace a optimistické úpravy,
- postavit validovaný formulář se Zod schématem a nastylovat komponenty (CSS Modules nebo Tailwind),
- přihlásit uživatele proti API s cookie a otestovat komponenty (Vitest, Testing Library, MSW).

**Moduly:**
- **lesson** `vite-react-ts` — *Vite, React a TypeScript* — `npm create vite`
  se šablonou `react-ts`, struktura podle funkcí, typy props
  (`ComponentProps`, `children`), události v TS, ESLint pravidla hooků,
  React Compiler ve Vite zmínkou, proměnné prostředí.
- **lesson** `routovani` — *Routování* — React Router v7 v režimu knihovny
  (`createBrowserRouter`, `Outlet`, parametry, `NavLink`, 404, lazy trasy,
  loader zmínkou), `useSearchParams` pro filtr v URL, framework režim
  a TanStack Router jako alternativy. Cvičení: `predict` (co se vykreslí na
  `/produkty/42/recenze`).
- **workshop** `workshop-routovani` [react] — *Vícestránkový katalog* — staví:
  seznam, detail, vnořený layout, filtr v URL, 404. ~12 kroků. Vyžaduje React
  Router ve vendoru runtime `react`, jinak jako řízený projekt. Cvičení:
  `debug` (filtr se ztratí při návratu — stav v `useState` místo v URL).
- **lesson** `druhy-stavu` — *Druhy stavu* — UI stav, formulář, serverová cache,
  URL, globální klientský stav; rozhodovací tabulka; URL jako výchozí místo pro
  filtry; kdy Zustand. Cvičení: `check` (kam patří daný stav), `explain`.
- **lesson** `tanstack-query` — *Serverová data: TanStack Query* — proč ne
  vlastní fetch v efektu, `QueryClient`, `useQuery` (`queryKey`, `queryFn`,
  `status` vs. `isFetching`), `staleTime` vs. `gcTime`, `useMutation`,
  invalidace, optimistická úprava s návratem, `useSuspenseQuery`.
  Cvičení: `predict` (načte se znovu po návratu na stránku?).
- **workshop** `workshop-data-z-api` [react] — *Úkoly nad API* — staví: seznam
  úkolů nad mock API v seedu: načtení, stavy, přidání, invalidace, optimistické
  odškrtnutí, chyba a opakování. ~18 kroků. Vyžaduje TanStack Query ve vendoru.
  Cvičení: `debug` (`queryKey` bez filtru — stará data po změně filtru),
  `explain` (stale vs. fresh), `parsons` (optimistická mutace s `onError`).
- **lesson** `formulare-a-validace` — *Formuláře a validace* — React Hook Form
  (`register`, `handleSubmit`, chyby) se Zod schématem, sdílené schéma
  s backendem, přístupné chyby, `useActionState` a `useFormStatus` jako cesta
  bez knihovny.
- **lesson** `styly-v-reactu` — *Styly v Reactu* — CSS Modules, Tailwind CSS
  v4 (utility, `@theme` a tokeny z části 1, kdy ano a kdy ne), `clsx`,
  přístupné primitivy (Radix, shadcn/ui) zmínkou. Cvičení: `compare`
  (stejná karta v CSS Modules a v Tailwindu).
- **lesson** `auth-z-klienta` — *Přihlášení z klienta* — cookie `HttpOnly`
  a `credentials: 'include'`, chráněná trasa, uživatel jako query, odhlášení
  a vyčištění cache, proč token ne do `localStorage` (hloubka
  v `auth-bezpecnost`), CORS s cookies.
- **lesson** `testy-komponent` — *Testy komponent* — Vitest + React Testing
  Library (`render`, `screen.getByRole`, `userEvent`), MSW handlery pro API,
  `findBy` vs. `getBy`, co nechat na Playwright. Cvičení: `predict` (proč test
  s `getBy` selže u načítaných dat).
- **lab** `lab-kontrolni-bod-4` [react] — *Kontrolní bod: rezervace stolů* —
  samostatně, bez uvedení sekcí: seznam volných stolů z mock API, detail,
  formulář rezervace s validací, stav načítání a chyby, výběr data, složitější
  stav. Bez tipů `help`. Cvičení: `pred-startem`.
- **quiz** `kviz` — *Kvíz: React aplikace* — druhy stavu, `queryKey`
  a invalidace, trasy, testy. 20–30 % z `react-zaklady` a `react-hloubka`.
- **project** `projekt-react-spa` [node] — *Plánovač jídel a nákupů* —
  **vlajkový projekt 2** — SPA ve Vite + React + TS nad přiloženým API
  (Node server ve starteru, cookie přihlášení): recepty s filtry v URL,
  detail, oblíbené s optimistickou úpravou, týdenní plán, nákupní seznam
  odvozený z plánu, přihlášení. Kontrola: `npm run lint`, `typecheck`,
  `test` (Vitest + MSW), `build`, e2e scénáře v Playwrightu proti `vite
  preview`. Cvičení: `review` (struktura, druhy stavu, přístupnost, README
  s rozhodnutími), „Rozšíření do portfolia" (nasazení frontendu, vlastní
  backend z části 5).

## 4.5 `vue-nuxt-druhy-framework` — Vue a Nuxt jako druhý framework

**Úroveň:** rozšíření *(nová)*
**Odhad:** ~12 h
**Předpoklady:** `react-aplikace`, `next-fullstack`

**Po sekci umíš:**
- převést komponentu z Reactu do Vue podle převodní tabulky,
- vysvětlit reaktivitu Vue (`ref`, `reactive`, `computed`, `watch` nad Proxy) a v čem se liší od rerenderu v Reactu,
- psát SFC s `<script setup lang="ts">` a sdílet stav přes Pinia,
- zorientovat se v Nuxt projektu díky znalosti Next.js.

**Moduly:**
- **lesson** `prevodni-tabulka` — *Z Reactu do Vue* — `useState` → `ref`,
  `useMemo` → `computed`, `useEffect` → `watch`/`onMounted`, props a `emit`,
  `children` → sloty, kontext → `provide`/`inject`, JSX → šablona
  s `v-if`/`v-for`/`:key`, `v-model`.
- **lesson** `reaktivita-vue` — *Reaktivita ve Vue* — Proxy, `ref` a `.value`,
  ztráta reaktivity při destrukturalizaci, `computed` s cache, `watch`,
  `nextTick`. Cvičení: `predict` ×2, `compare` (stejné počítadlo v Reactu a ve Vue).
- **workshop** `workshop-prepis-do-vue` [vue] — *Počítadlo kalorií ve Vue* —
  staví: přepis workshopu z `react-zaklady` do Vue 3 v prohlížeči. ~14 kroků.
  Cvičení: `debug` (destrukturalizovaný `reactive` přestal reagovat).
- **lesson** `sfc-a-pinia` — *SFC, Pinia a Vue Router* — `.vue` soubory,
  `<style scoped>`, `npm create vue`, Pinia store, Vue Router.
- **lesson** `nuxt-v-kostce` — *Nuxt v kostce* — Nuxt 4 (`app/`, souborové
  routování, `useFetch`/`useAsyncData`, `server/api` nad h3) v tabulce proti
  Next.js App Routeru.
- **lab** `lab-kosik-ve-vue` [vue] — *Košík ve Vue* — samostatně: katalog
  a košík se sdíleným stavem.
- **quiz** `kviz` — *Kvíz: Vue a Nuxt* — reaktivita, převod z Reactu,
  `useFetch` vs. `$fetch`.

---

# Část 5 — Backend a fullstack

Z frontendu na celou aplikaci. Nejdřív backend bez frameworku (Node, HTTP,
SQL), aby bylo vidět, co frameworky dělají pod kapotou; pak bezpečnost
a provoz a nakonec Next.js jako fullstack framework s vlajkovým projektem 3.
Dvě rozšíření (soubory a realtime, prohlížečová API navíc) jsou na konci.

## 5.1 `node-zaklady` — Node.js základy *(pilotní sekce)*

**Úroveň:** jádro
**Odhad:** ~7 h (z toho projekt ~3 h)
**Předpoklady:** `nastroje-moduly-vite`, `js-async`

**Po sekci umíš:**
- vysvětlit, co je Node a čím se liší od prohlížeče,
- spustit soubor v Node a používat vestavěné moduly přes `node:` (`fs`, `http`, `process`),
- napsat HTTP server bez frameworku: routování podle adresy a metody, stavové kódy, JSON, tělo požadavku,
- postavit malé REST API, které si data ukládá do souboru a nespadne na špatném požadavku,
- rozpoznat typické chyby (`EADDRINUSE`, „Cannot set headers after they are sent") a opravit je.

Stav na disku (`content/node-zaklady/section.json`) a plánované úpravy D6:

- **lesson** `co-je-node` — *Co je Node.js* (15 min) — co Node je, stejný
  jazyk v jiném prostředí, moduly v Node, `process`, soubory přes
  `node:fs/promises`, skript vs. server, pasti. Bez živých ukázek (node
  runtime je nemá), 4 otázky.
  **Úpravy (A3, A14):** `predict` s autorem napsaným `--output--` u `process.argv`
  a u pořadí výpisů při čtení souboru, `check` po částech.
- **workshop** `workshop-http-server` [node] — *Postav HTTP server knihovny*
  (90 min) — staví: server bez frameworku, který čte knihy ze souboru,
  odpovídá v JSON a přijímá nové knihy. Dnes 14 kroků:
  001 načti data ze souboru · 002 port z proměnné prostředí · 003 první
  server · 004 stavový kód a hlavičky · 005 odpověď v JSON · 006 routování
  podle adresy · 007 detail jedné knihy · 008 samostatně: seznam autorů ·
  009 routování podle metody · 010 zápis do souboru · 011 tělo POST
  požadavku · 012 uložení nové knihy · 013 neplatný JSON v těle · 014 ověření vstupu.
  **Úpravy (D6):**
  - `help` u kroků se serverem (003–014),
  - krok 013 přepsat na **`debug`** („server spadne na neplatném JSON" —
    Hlášení s výpisem `SyntaxError` z terminálu),
  - `explain` ke stavovým kódům u kroku 004,
  - od kroku 005 ověřit, že jde použít HTTP klient a běžící server (B10).
- **project** `projekt-api-poznamek` [node] — *REST API pro poznámky*
  (150 min) — samostatně ve VS Code: `GET/POST/DELETE /api/notes`, validace
  s 400, 404 a 405, přežití restartu, 500 při poškozeném souboru, bez
  závislostí. Dnes 13 testů.
  **Úpravy (D6, A12):** `# --review--` (jména, duplicita, README, „co příště
  jinak"), oddíl „Rozšíření bez testů" (PATCH, stránkování, `Location`),
  `pred-startem`.
- **quiz** `kviz` — *Kvíz: Node.js základy* (15 min) — dnes 12 otázek: Node vs.
  prohlížeč, moduly, stavové kódy, čtení těla.
  **Úpravy (A14):** polovina psaných odpovědí, 20–30 % z `js-async`
  a `nastroje-moduly-vite`.
- **Soubory sekce (D6):** `cards.md` s typickými chybami (`EADDRINUSE`,
  `Cannot set headers after they are sent`, `ERR_MODULE_NOT_FOUND`, zapomenuté
  `res.end()`) navázanými na `shared/errors-cs.js`, `pojmy.md`, `tahak.md`
  (stavové kódy, kostra serveru), `outcomes`.

## 5.2 `api-http-rest` — HTTP a návrh REST API

**Úroveň:** jádro
**Odhad:** ~10 h
**Předpoklady:** `node-zaklady`, `nastroje-typescript`

**Po sekci umíš:**
- navrhnout REST API: zdroje, metody, stavové kódy, tvar chyb, stránkování,
- validovat vstup na serveru schématem a vracet konzistentní chyby,
- vysvětlit a nastavit CORS a cache hlavičky,
- otestovat API přes `curl`, HTTP klient a automatické testy,
- přepsat API do frameworku (Express 5) a říct, co framework nahrazuje.

**Moduly:**
- **lesson** `http-do-hloubky` — *HTTP do hloubky* — sémantika metod
  (bezpečné, idempotentní), stavové kódy po skupinách, hlavičky, HTTP/2 a 3
  jednou větou, `curl -i -X -d`. Cvičení: `predict` (který kód vrátit), `check`.
- **lesson** `navrh-rest` — *Návrh REST API* — zdroje a URL, filtry a řazení
  v query, stránkování (offset vs. kurzor), `application/problem+json`,
  verzování, PATCH vs. PUT, idempotence. Cvičení: `explain` (PUT vs. PATCH).
- **workshop** `workshop-api-knihovny` [node] — *API knihovny* — staví: API knih
  a výpůjček nad daty v paměti. Učí: router s parametry, `searchParams`,
  whitelist řazení, stránkování s metadaty, 201 s `Location`, 204, 409.
  ~18 kroků. Cvičení: `debug` (řazení podle libovolného pole z query shodí
  server), `vyber-sam` (stavový kód pro výpůjčku už vypůjčené knihy).
- **lesson** `validace-a-chyby-api` — *Validace a chyby na serveru* — nikdy
  nevěř klientovi, Zod schéma z `nastroje-typescript` na serveru, 400 vs. 422,
  centrální zpracování chyb, co nesmí uniknout (stack, SQL), limit těla.
- **lesson** `cors-a-cache` — *CORS a cache* — same-origin, preflight,
  `Access-Control-Allow-*`, CORS nechrání server, `Cache-Control`, `ETag` a 304.
  Cvičení: `predict` (nastane preflight?).
- **workshop** `workshop-api-ve-frameworku` [node] — *API ve frameworku*
  *(nový)* — staví: přepis API knihovny do Express 5. Učí: router, middleware,
  `express.json()`, async handlery a chyby (Express 5 je zachytí sám), error
  middleware, tabulka „co framework nahrazuje z `node-zaklady`", Hono
  a Fastify zmínkou. ~12 kroků. Vyžaduje `express` v node runtime.
  Cvičení: `debug` (middleware bez `next()` — požadavek visí), `explain`.
- **lab** `lab-api-ukolu` [node] — *API úkolů* — samostatně: validace,
  stránkování, filtr, konzistentní chyby, CORS. Cvičení: `pred-startem`,
  `approaches` (čistý Node vs. Express).
- **quiz** `kviz` — *Kvíz: HTTP a REST* — stavové kódy, idempotence, návrh URL,
  preflight, `ETag`. Cvičení: `code` (router ~100 řádků).

## 5.3 `sql-databaze` — SQL a databáze

**Úroveň:** jádro
**Odhad:** ~11 h (+1 h rozšíření; z toho projekt ~4 h)
**Předpoklady:** `api-http-rest`

**Po sekci umíš:**
- navrhnout schéma s klíči, vazbami a omezeními,
- psát dotazy s `JOIN`, agregací a stránkováním a používat vázané parametry,
- pracovat v transakcích, najít pomalý dotaz a problém N+1 a přidat index,
- používat Drizzle ORM (schéma v TS, dotazy, migrace) a vědět, kdy psát SQL ručně,
- spustit PostgreSQL v Dockeru a přenést aplikaci ze SQLite.

**Moduly:**
- **lesson** `relacni-databaze` — *Relační databáze* — tabulky, typy, klíče,
  `NOT NULL`, `UNIQUE`, `CHECK`, SQLite vs. PostgreSQL, `node:sqlite`.
- **workshop** `workshop-prvni-dotazy` [node] — *Katalog v SQL* — staví: dotazy
  nad databází filmů: `SELECT`, `WHERE`, `LIKE`, `IN`, `IS NULL`, `ORDER BY`,
  `LIMIT`/`OFFSET`, `INSERT`, `UPDATE`, `DELETE`, vázané parametry. ~18 kroků.
  Cvičení: `debug` (`WHERE rating = NULL` nevrací nic), `predict`.
- **lesson** `navrh-schematu` — *Návrh schématu* — 1:N a M:N, normalizace
  srozumitelně, `ON DELETE`, čas, soft delete, migrace. Cvičení: `explain`.
- **workshop** `workshop-join-agregace` [node] — *Recenze a hodnocení* —
  staví: schéma a dotazy. Učí: cizí klíče, `JOIN` vs. `LEFT JOIN`, agregace,
  `GROUP BY` a `HAVING`, poddotaz, upsert. ~20 kroků. Cvičení: `parsons`
  (dotaz s `LEFT JOIN` a `GROUP BY`), `debug` (`JOIN` vynechá filmy bez recenzí).
- **lesson** `transakce-a-indexy` — *Transakce, indexy a N+1* — `BEGIN`/`COMMIT`/
  `ROLLBACK`, atomicita, index, `EXPLAIN QUERY PLAN`, N+1. Cvičení: `predict`
  (počet dotazů seznamu s autory).
- **lesson** `okenni-funkce` — *Okenní funkce* **(rozšíření)** — `ROW_NUMBER`,
  `RANK`, klouzavý průměr, `PARTITION BY`.
- **lesson** `orm-drizzle` — *ORM: Drizzle* *(nová)* — schéma v TypeScriptu,
  dotazy a relace, typy výsledků, migrace přes `drizzle-kit` (generate,
  migrate), co ORM přidá a vezme, jak poznat N+1 i v ORM, kdy psát SQL ručně
  (`sql` tag). Cvičení: `compare` (stejný dotaz v SQL a v Drizzle).
- **lesson** `postgres-v-dockeru` — *PostgreSQL v Dockeru* *(nová)* —
  `docker run` / `compose` s Postgresem, `psql`, `DATABASE_URL`, rozdíly
  proti SQLite (typy, identity, `RETURNING`, JSONB, pool spojení), převod
  aplikace; postup se sítí je checklist bez testů.
- **lab** `lab-eshop-dotazy` [node] — *Dotazy pro e-shop* — samostatně: schéma
  objednávek a deset dotazů. Cvičení: `approaches` (poddotaz vs. `JOIN`).
- **quiz** `kviz` — *Kvíz: SQL* — výsledek dotazu, `JOIN` vs. `LEFT JOIN`,
  `WHERE` vs. `HAVING`, index, ORM. Cvičení: `code`.
- **project** `projekt-api-receptu` [node] — *API receptů s databází* — cvičný
  projekt: REST API receptů se surovinami a hodnocením nad SQLite, schéma
  s migrací, transakce, stránkování, bez N+1; Drizzle volitelně. Cvičení: `review`.

## 5.4 `auth-bezpecnost` — Autentizace a bezpečnost

**Úroveň:** jádro
**Odhad:** ~11 h
**Předpoklady:** `sql-databaze`

**Po sekci umíš:**
- bezpečně uložit heslo a implementovat přihlášení přes session a cookie,
- oddělit autentizaci od autorizace a kontrolovat oprávnění na každé routě,
- poznat a opravit SQL injection, XSS, CSRF a IDOR,
- omezit zneužití API (rate limit, velikost vstupů, bezpečnostní hlavičky),
- vysvětlit OAuth/OIDC s PKCE a passkeys a použít knihovnu (Better Auth) místo vlastního řešení.

**Moduly:**
- **lesson** `hesla` — *Hesla* — proč ne šifrování ani rychlý hash, sůl,
  `scrypt`/Argon2, `timingSafeEqual`, pravidla NIST.
- **lesson** `session-a-cookies` — *Session, cookies a JWT* — atributy cookie,
  session v databázi, odhlášení, JWT a jeho skutečné výhody a nevýhody, kde
  nesmí být token. Cvičení: `predict` (pošle prohlížeč cookie se `SameSite=Lax`?),
  `explain` (session vs. JWT — pohovorová otázka).
- **workshop** `workshop-prihlaseni` [node] — *Registrace a přihlášení* —
  staví: registrace, přihlášení, odhlášení a chráněná routa nad SQLite
  v čistém Node. ~22 kroků. Cvičení: `debug` (různá odpověď pro špatný
  e-mail a špatné heslo prozradí účty), `parsons` (middleware načítající uživatele).
- **lesson** `owasp-zranitelnosti` — *Nejčastější zranitelnosti* — SQL
  injection, XSS a CSP, CSRF, IDOR, otevřené přesměrování, únik tajemství,
  zranitelné závislosti. Cvičení: `predict` (co provede daný vstup).
- **workshop** `workshop-oprav-zranitelnosti` [node] — *Oprava děravého API* —
  staví: opraví SQL injection, IDOR, XSS, chybějící rate limit a únik stack
  trace. ~18 kroků. Cvičení: každá zranitelnost jako `debug` s hlášením útoku.
- **lesson** `auth-v-praxi` — *Přihlášení v praxi* *(nová)* — OAuth 2.x / OIDC
  (authorization code s PKCE) krok po kroku, přihlášení přes Google a GitHub,
  knihovny: Better Auth (doporučená pro nové projekty), Auth.js (údržba,
  potkáš v cizím kódu), spravované služby (Clerk) a jejich kompromisy,
  passkeys a WebAuthn, reset hesla a ověření e-mailu jednorázovým tokenem,
  2FA (TOTP) zmínkou. Cvičení: `memory` (sekvence přesměrování OAuth), `explain` (PKCE).
- **lab** `lab-role-a-opravneni` [node] — *Role a oprávnění* — samostatně: role
  uživatel, redaktor a správce, kontrola na každé routě, audit log.
- **quiz** `kviz` — *Kvíz: bezpečnost* — najdi zranitelnost, cookie, 401 vs. 403,
  session vs. JWT, OAuth. Cvičení: `code`.

## 5.5 `nasazeni-provoz` — Nasazení a provoz

**Úroveň:** jádro
**Odhad:** ~9 h (+2 h rozšíření; z toho kontrolní bod ~2 h)
**Předpoklady:** `auth-bezpecnost`, `nastroje-testovani`

**Po sekci umíš:**
- připravit aplikaci na produkci: konfigurace, tajemství, logování, health check, graceful shutdown,
- sestavit a spustit aplikaci v kontejneru s databází přes `docker compose`,
- nastavit CI, které před nasazením pustí lint, typy, testy a build,
- nasadit aplikaci s HTTPS a vrátit se k předchozí verzi,
- samostatně postavit API, které splňuje bezpečnostní i provozní požadavky.

**Moduly:**
- **lesson** `produkcni-rezim` — *Z vývoje do produkce* — dev vs. prod,
  proměnné prostředí a `.env`, tajemství, `NODE_ENV`, health check, `SIGTERM`.
- **lesson** `logovani-a-chyby` — *Logování a monitoring* — strukturované logy,
  request id, co nelogovat, sledování chyb, metriky a uptime.
  Cvičení: `check` (co je na řádku logu špatně).
- **workshop** `workshop-pripraveny-server` [node] — *Server připravený na
  provoz* — staví: produkčně připravená služba z API ze `sql-databaze`.
  ~14 kroků. Cvičení: `debug` (server při `SIGTERM` utne rozpracované
  požadavky), `explain` (graceful shutdown).
- **lesson** `kontejnery-a-servery` — *Kontejnery, servery a HTTPS* —
  `Dockerfile` pro Node (vícefázový build, ne root, `.dockerignore`),
  `compose.yaml` s databází, reverse proxy (Caddy) a HTTPS, VPS vs. platforma
  (Vercel, Netlify, Fly, Railway), zálohy.
- **lesson** `ci-cd` — *CI/CD* — GitHub Actions (lint, typy, testy, build),
  cache, tajemství, nasazení po merge, náhledová prostředí, rollback,
  dvoufázová změna schématu.
- **lesson** `linux-server` — *Vlastní Linux server* **(rozšíření)** — SSH
  a uživatelé, firewall, systemd služba, Caddy, automatické aktualizace, zálohy.
- **lab** `lab-dockerfile-a-ci` [node] — *Dockerfile a workflow* — samostatně:
  `Dockerfile`, `compose.yaml` a workflow pro přiložený projekt (testy
  kontrolují obsah a to, co jde ověřit bez sítě a bez Dockeru).
- **quiz** `kviz` — *Kvíz: provoz* — `.env`, logování, pořadí kroků v CI,
  vícefázový build. 20–30 % z `auth-bezpecnost` a `sql-databaze`.
- **lab** `lab-kontrolni-bod-5` [node] — *Kontrolní bod: rezervační API* —
  samostatně, bez uvedení sekcí: API rezervací sálů v Node nad SQLite
  s registrací a přihlášením, rolemi, validací, transakcí proti dvojí
  rezervaci, stránkováním, konzistentními chybami, health checkem
  a konfigurací z prostředí. Testy přes `startServer` a `fetch`. Bez tipů
  `help`. Cvičení: `pred-startem`.

## 5.6 `next-fullstack` — Next.js: fullstack aplikace

**Úroveň:** jádro *(nová, nahrazuje zrušenou `nuxt-fullstack`)*
**Odhad:** ~27 h (z toho řízený projekt ~6 h, vlajkový projekt ~15 h)
**Předpoklady:** `react-aplikace`, `auth-bezpecnost`, `nasazeni-provoz`

Next.js nejde spustit v prohlížečovém runtime, proto sekce kombinuje lekce
s `predict` otázkami, řízený projekt po etapách a vlajkový projekt ve VS Code.
Testy projektů spouštějí `npm run build` a `next start` přes `helpers.run`
a ověřují HTML a chování přes `fetch`.

**Po sekci umíš:**
- vysvětlit CSR, SSR, SSG a streamování a pro každou stránku zvolit strategii,
- strukturovat App Router: layouty, stránky, `loading` a `error`, dynamické segmenty, route handlers,
- rozdělit UI na serverové a klientské komponenty a hlídat hranici (`"use client"`, tajemství, serializace),
- načítat data na serveru přímo z databáze a měnit je server actions s validací, autorizací a revalidací,
- nastavit metadata, SEO, obrázky a písma,
- postavit, otestovat a nasadit fullstack aplikaci s přihlášením a databází.

**Moduly:**
- **lesson** `ssr-csr-ssg` — *CSR, SSR, SSG a streamování* — co posílá server,
  hydratace a chyby nesouladu, streamování se Suspense, statické vs.
  dynamické vykreslení, revalidace, kdy Next.js a kdy stačí Vite SPA.
  Cvičení: `pretest`, `predict` ×2 (proč `Date.now()` v renderu způsobí
  hydration mismatch), `explain` (SSR vs. CSR — pohovorová otázka).
- **lesson** `app-router` — *App Router* — Next.js 16, `app/`: `layout.tsx`,
  `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, dynamické
  `[slug]` a `params` jako Promise, route groups, `Link` a prefetch,
  `proxy.ts` (dříve `middleware.ts`), Turbopack. Cvičení: `predict` (který
  layout obalí `/admin/uzivatele/5`).
- **lesson** `server-a-client-komponenty` — *Serverové a klientské komponenty* —
  výchozí serverové komponenty, hranice `"use client"`, co smí přes props,
  serverová komponenta jako `children` klientské, `server-only`, tajemství
  a `NEXT_PUBLIC_`. Cvičení: `predict` ×3 (kde se vypíše `console.log` —
  terminál, nebo prohlížeč?), `explain`.
- **project** `projekt-next-zaklad` [node] — *Řízený projekt: katalog v Next.js* —
  cvičný projekt po etapách (každá etapa = skupina příběhů s testy): založení
  projektu, layout a navigace, seznam ze souborových dat vykreslený na
  serveru (HTML obsahuje data bez JS), dynamický detail a 404, `loading`
  a `error`, klientský filtr. Kontrola: `npm run build`, HTML přes `fetch`
  proti `next start`. Cvičení: `pred-startem`, `help` u každé etapy.
- **lesson** `data-a-server-actions` — *Data a server actions* — async serverové
  komponenty a dotaz do databáze (Drizzle), `fetch` a cache, Cache Components
  (`"use cache"`, `cacheLife`, `cacheTag`), server actions (`"use server"`),
  `useActionState` a `useFormStatus`, validace Zod na serveru,
  `revalidatePath`/`revalidateTag`, route handlers (`route.ts`) pro cizí
  klienty; **server action je veřejný endpoint** → autorizace v každé akci.
  Cvičení: `predict` (uvidí uživatel po akci nová data bez revalidace?),
  `debug` v ukázce (akce bez kontroly vlastníka).
- **lesson** `auth-v-nextu` — *Přihlášení v Next.js* — Better Auth: route
  handler, session v serverové komponentě a v akci, ochrana stránek (kontrola
  v datech a akcích, ne jen v `proxy.ts`), role.
- **lesson** `seo-a-metadata` — *SEO, metadata, obrázky a písma* — `metadata`
  a `generateMetadata`, OG obrázky, `sitemap.ts`, `robots.ts`, `next/image`,
  `next/font`, Core Web Vitals v Next.js.
- **lesson** `testy-a-nasazeni-nextu` — *Testy a nasazení Next.js* — Vitest pro
  logiku, Playwright proti `next build && next start`, nasazení na Vercel vs.
  vlastní server (`output: 'standalone'` v Dockeru), proměnné prostředí,
  migrace při nasazení.
- **quiz** `kviz` — *Kvíz: Next.js* — kde co běží, hranice klient/server,
  cache a revalidace, bezpečnost server actions. 20–30 % z `react-aplikace`
  a `auth-bezpecnost`. Cvičení: `code` (stránka a akce ~120 řádků).
- **project** `projekt-zaverecny` [node] — *Závěrečný fullstack projekt* —
  **vlajkový projekt 3** — jedno ze tří zadání (rezervační systém, bazar
  s inzeráty, sdílený rozpočet domácnosti) nebo **vlastní téma se stejným
  checklistem**: Next.js 16 + TypeScript, Drizzle nad SQLite nebo
  PostgreSQL, Better Auth s rolemi, validace Zod, server actions s autorizací,
  testy (unit a e2e), lint, Dockerfile nebo nasazení na platformu, CI
  workflow, README s rozhodnutími a postupem nasazení. Kontrola: `lint`,
  `typecheck`, `test`, `build`, sada příběhů proti `next start` (u vlastního
  tématu obecné příběhy: registrace, přihlášení, CRUD s oprávněním, 404).
  Cvičení: `pred-startem`, `review` (architektura, bezpečnost, přístupnost,
  commity, README), „Rozšíření do portfolia". Tohle je projekt na pohovor.

## 5.7 `api-soubory-realtime` — Soubory, realtime a úlohy na pozadí

**Úroveň:** rozšíření *(nová)*
**Odhad:** ~10 h
**Předpoklady:** `auth-bezpecnost`
**Doporučeno předem:** `next-fullstack`

**Po sekci umíš:**
- bezpečně přijmout nahraný soubor (limity, typ, uložení mimo web, presigned URL),
- zvolit mezi pollingem, SSE a WebSocketem podle situace,
- napsat SSE server v čistém Node a klienta přes `EventSource`,
- postavit jednoduchý WebSocket kanál s ověřením uživatele,
- posílat e-maily a zpracovávat úlohy na pozadí s opakováním a idempotencí.

**Moduly:**
- **lesson** `nahravani-souboru` — *Nahrávání souborů* — `multipart/form-data`,
  `FormData` z klienta, limity velikosti a typu, kontrola podle obsahu, ne podle
  přípony, ukládání mimo webroot, objektové úložiště (S3, R2) a presigned URL.
  Cvičení: `predict` (co se stane s `profil.jpg.html`).
- **lesson** `realtime-prehled` — *Polling, SSE a WebSocket* — srovnání, kdy co,
  proxy a timeouty. Cvičení: `explain` (výběr pro notifikace a pro chat).
- **workshop** `workshop-sse` [node] — *Živé notifikace přes SSE* — staví: SSE
  server v čistém Node: `text/event-stream`, `data:`, `id`, `retry`, heartbeat,
  odpojení klienta, rozesílání více klientům. ~12 kroků. Cvičení: `debug`
  (klient po odpojení zůstane v seznamu — únik).
- **lesson** `websockety` — *WebSockety* — WebSocket API v prohlížeči, server
  (knihovna `ws`), formát zpráv, reconnect, ověření při handshaku, škálování
  přes pub/sub.
- **lesson** `emaily-a-ulohy-na-pozadi` — *E-maily a úlohy na pozadí* —
  transakční e-maily přes poskytovatele, SPF a DKIM zmínkou, fronta úloh,
  opakování, idempotence, plánované úlohy.
- **lab** `lab-notifikace` [node] — *Notifikace pro přihlášené* — samostatně:
  SSE kanál s ověřením uživatele a filtrem podle role.
- **quiz** `kviz` — *Kvíz: soubory a realtime* — bezpečné nahrávání, SSE vs.
  WebSocket, idempotence.

## 5.8 `prohlizec-navic` — Prohlížečová API navíc

**Úroveň:** rozšíření *(nová)*
**Odhad:** ~10 h
**Předpoklady:** `js-async`, `nastroje-moduly-vite`
**Doporučeno předem:** `nasazeni-provoz`

**Po sekci umíš:**
- napsat web component (custom element, shadow DOM, sloty) a říct, kdy dává smysl,
- zaregistrovat service worker, zvolit cache strategii a udělat z webu instalovatelnou PWA,
- přesunout drahý výpočet do Web Workeru,
- ukládat větší data offline v IndexedDB.

Sandboxovaný iframe runtime `dom` nemá service worker ani IndexedDB, proto jsou
praktické části jako projekt ve VS Code s Playwright testy ve starteru.

**Moduly:**
- **lesson** `web-components` — *Web components* — custom elements a životní
  cyklus, shadow DOM a stylování (`:host`, `::part`), sloty, kdy web
  components a kdy framework. Cvičení: `predict` (pronikne globální CSS do
  shadow DOM?).
- **workshop** `workshop-web-component` [dom] — *Hodnocení hvězdičkami jako
  web component* — staví: přístupný `<star-rating>` s atributy, událostí
  a sloty. ~12 kroků. Cvičení: `debug` (atribut se nepromítne — chybí
  `observedAttributes`).
- **lesson** `service-worker-a-pwa` — *Service worker a PWA* — životní cyklus,
  cache strategie (cache first, network first, stale-while-revalidate),
  offline stránka, manifest a instalace, HTTPS, past s aktualizací service workeru.
  Cvičení: `memory` (stav install → waiting → active).
- **lesson** `web-workers` — *Web Workers* — výpočet mimo hlavní vlákno,
  `postMessage`, přenositelné objekty, kdy se to vyplatí.
  Cvičení: `eventloop` (hlavní vlákno s workerem a bez).
- **lesson** `indexeddb` — *IndexedDB a úložiště* — databáze, object stores,
  transakce, indexy, obal `idb` zmínkou, kvóty a `navigator.storage.persist()`.
- **project** `projekt-offline-poznamky` [node] — *Offline poznámky* — cvičný
  projekt: poznámky v IndexedDB, service worker s offline režimem, manifest,
  synchronizace po připojení. Kontrola: `npm run build` a Playwright testy
  ze starteru (offline režim prohlížeče). Cvičení: `review`.
- **quiz** `kviz` — *Kvíz: prohlížeč navíc* — shadow DOM, cache strategie,
  worker, IndexedDB transakce.

---

# Část 6 — Kariéra

Přístupná kdykoli (nic se nezamyká), v doporučené trase podle E4 na konci.
Uživatel ji otevře, až bude mít hotové vlajkové projekty a bude chtít hledat práci.

## 6.1 `kariera-pohovor` — Portfolio, CV a pohovor

**Úroveň:** jádro *(nová)*
**Odhad:** ~15 h
**Předpoklady:** `react-aplikace`, `nastroje-cizi-kod`
**Doporučeno předem:** `next-fullstack`, `js-algoritmy`

**Po sekci umíš:**
- připravit portfolio ze tří vlajkových projektů s README, které vysvětluje rozhodnutí a kompromisy,
- napsat CV na jednu stranu a vyladit LinkedIn a GitHub profil,
- vypracovat domácí úkol v rozumném rozsahu s testy, README a čistou historií,
- projít technický pohovor: vyprávění o projektu, live coding nahlas a frontend system design ve čtyřech krocích,
- odpovídat na behaviorální otázky metodou STAR, i anglicky,
- zvládnout první měsíce v práci: ptát se, zapracovat se, dostávat review.

**Moduly:**
- **lesson** `trh-a-role` — *Trh práce a role* — junior frontend a fullstack
  v Česku, co firmy čekají, kde hledat (jobs.cz, junior.guru, LinkedIn,
  StartupJobs), jak číst inzerát (nutné vs. výhodou), zdroje o mzdách,
  inzerát bez „junior" není zakázaný.
- **lesson** `portfolio` — *Portfolio* — tři vlajkové projekty, README
  s rozhodnutími, živé URL, snímky, čitelná historie commitů, co do portfolia
  nedávat (klony tutoriálů), připnuté repozitáře, obrazovka „Po sekci umíš"
  (B16) jako podklad pro seznam dovedností. Cvičení: `check` nad ukázkovými README.
- **lesson** `cv-linkedin-github` — *CV, LinkedIn a GitHub* — CV na jednu
  stranu, projekty s dopadem místo výčtu technologií, žádné hvězdičky
  u dovedností, česká a anglická verze, LinkedIn titulek a „O mně", profilové
  README na GitHubu. Cvičení: `explain` (napiš popis projektu do CV, model
  a checklist).
- **lesson** `domaci-ukol` — *Domácí úkol* — jak zadání číst a na co se
  doptat, časový limit, rozsah (raději menší a dotažené), README (spuštění,
  rozhodnutí, co bych dodělal), testy, commity, co hodnotitel skutečně čte.
- **lab** `lab-domaci-ukol` [react] — *Typický domácí úkol* — samostatně: seznam
  s vyhledáváním z mock API, stránkování, detail, stavy načítání a chyby,
  přístupnost. Testy chování + rubrika `review` jako od hodnotitele.
  Cvičení: `pred-startem`, časový rámec 4 h doporučený, ne vynucený.
- **lesson** `technicky-pohovor` — *Technický pohovor* — vyprávění o projektu
  (problém, rozhodnutí, kompromis, co bych udělal jinak), live coding (mluvit
  nahlas, postup z `js-algoritmy`, co dělat při zaseknutí), klasické otázky na
  JS, CSS a React (odkazy na `explain` a karty ze sekcí), frontend system design
  ve 4 krocích (požadavky → komponenty a data → API a stav → výkon,
  přístupnost a chyby), otázky na firmu.
- **lesson** `behavioralni-a-anglictina` — *Behaviorální pohovor a angličtina* —
  otázky na konflikt, chybu, učení a zpětnou vazbu, metoda STAR, anglické fráze
  na pohovor, jak říct „nevím, ale postupoval bych takto", nabídka a vyjednávání.
- **lesson** `prvni-mesice` — *První měsíce v práci* — onboarding, první úkoly,
  jak a kdy se ptát, poznámky o projektu, code review z přijímající strany,
  plán 30-60-90 dní, syndrom podvodníka, jak růst dál.
- **quiz** `kviz-mock-pohovor` — *Mock pohovor* — otázky s psanou odpovědí
  a modelovou odpovědí (JS, CSS, React, HTTP, databáze, bezpečnost, chování);
  po vyhodnocení jdou do fronty opakování. Cvičení: `code` (otázka „co je na
  tomhle kódu špatně").
- **Soubory sekce:** `cards.md` je tu výjimečně jen `free` karty (pohovorové
  otázky s modelovou odpovědí), 30–50 karet sesbíraných napříč kurzem.

---

## Zrušené, přesunuté a přejmenované

| co | stav | kam |
|---|---|---|
| `vue-zaklady`, `vue-aplikace`, `nuxt-fullstack` | zrušené (E1), obsah neexistoval | `react-*`, `next-fullstack`, rozšíření `vue-nuxt-druhy-framework` |
| `projekt-vue-dashboard`, `projekt-nuxt-blog` | zrušené | `projekt-react-spa`, `projekt-zaverecny` |
| `nastroje-terminal-git` | přejmenováno | `nastroje-git-terminal` (jen pokročilé věci) |
| základy terminálu a Gitu | přesunuto | `start-nastroje` |
| pull request a code review | přesunuto | `nastroje-cizi-kod` |
| `js-funkce/ladeni-zaklad` | rozděleno | `js-zaklady/cteni-chyb-a-debugger`, `js-chyby-ladeni/ladeni-systematicky` |
| `css-animace/vykon-animaci` | sloučeno | `css-animace/transition-transform` |
| `css-animace/workshop-scroll-pribeh` | zrušené | ukázky v lekci `view-transitions-scroll` |
| `css-animace/projekt-portfolio-css` | zrušené | „Rozšíření do portfolia" v `projekt-landing-page` |
| `css-pozicovani/top-layer` + `anchor-positioning` | sloučeno | `css-pozicovani/top-layer-a-kotveni` |
| `nastroje-devtools-vykon/pamet` | sloučeno | `nastroje-devtools-vykon/devtools-mapa` |
| `js-tridy-kolekce/workshop-knihovna-her` | zrušené | `lab-inventar` |
| Zod z `api-http-rest` | přesunuto | `nastroje-typescript/validace-na-hranici` |
| okenní funkce ve `workshop-join-agregace` | vyčleněno | `sql-databaze/okenni-funkce` (rozšíření) |
| `projekt-zaverecny` z `nasazeni-provoz` | přesunuto | `next-fullstack` (vlajkový projekt 3) |
| OAuth a passkeys zmínkou v `session-a-cookies` | rozšířeno | `auth-bezpecnost/auth-v-praxi` |

---

## Balíčky pro kroky

Kroky, laby a workshopy běží bez `npm install`. Tyto moduly potřebují balíčky,
které dnes v Akademii nejsou; koordinátor je buď předinstaluje a zpřístupní
runtime, nebo se modul napíše jako projekt ve VS Code.

| balíček | runtime | moduly |
|---|---|---|
| `react`, `react-dom` (vendor, B22), `sucrase` | `react` | všechny `[react]` moduly v `react-*`, `kariera-pohovor/lab-domaci-ukol` |
| `react-router` (vendor) | `react` | `react-aplikace/workshop-routovani` |
| `@tanstack/react-query` (vendor) | `react` | `react-aplikace/workshop-data-z-api` |
| `@tailwindcss/browser` (vendor, `libs: ["tailwind"]`) | `dom`, `react` | `[dom + tailwind]` moduly v `css-tailwind`, `[react + tailwind]` moduly v `react-ui-knihovny` |
| `gsap` s pluginy ScrollTrigger, SplitText a Flip, `motion`, `lenis` (vendor) | `dom` | `[dom]` moduly v `css-efekty-animace`, `interakce-a-castice` a `workshop-3d-pozadi` ve `web-3d-efekty` (ScrollTrigger) |
| `three` včetně `three/addons` (vendor) | `dom` | `[dom]` moduly ve `web-3d-efekty` |
| `radix-ui`, `clsx`, `class-variance-authority`, `tailwind-merge`, `motion/react` (vendor) | `react` | `[react + tailwind]` moduly v `react-ui-knihovny` |
| `vite`, `eslint` (dostupné z dočasného adresáře node runtime) | `node` | `nastroje-moduly-vite/workshop-vite-projekt`, `lab-knihovna-utilit` |
| `typescript` (kontrola typů `tsc --noEmit`) | `node` | `nastroje-typescript/workshop-typy-kosiku`, `lab-typy-udalosti` |
| `zod` | `node` | `nastroje-typescript/workshop-api-klient`, `api-http-rest` (validace) |
| `express` | `node` | `api-http-rest/workshop-api-ve-frameworku` |
| `ws` | `node` | ukázky v `api-soubory-realtime/websockety` (jen lekce, bez testů je to v pořádku) |

Drizzle, Better Auth, Next.js, Vitest, MSW, Playwright, `@tailwindcss/vite`
a CLI `shadcn` jsou jen v projektech, kde si je uživatel instaluje sám.

---

## Otevřené body pro platformu

- **Úložiště v sandboxu.** Iframe runtime `dom` je bez `allow-same-origin`,
  takže `localStorage`, `sessionStorage`, IndexedDB a cookies v něm vyhodí
  `SecurityError`. `js-dom/prohlizecova-api`, `workshop-filtr-produktu`,
  `projekt-kanban`, `nastroje-testovani/projekt-rozpoctovac` a React hooky
  typu `useLocalStorage` s tím počítají. Runner potřebuje in-memory náhradu
  `localStorage`/`sessionStorage` (a v testech možnost ji naplnit), jinak se
  tyto moduly musí přepsat.
- **Úroveň a trasa v API.** `loadCurriculum` dnes pole `uroven`
  a `doporucenaTrasa` ignoruje. UI potřebuje odznak „rozšíření", odkaz „Další
  na trase" na konci sekce (u rozšíření nabídnout i další sekci jádra)
  a seřazení přehledu podle trasy jako volitelný pohled.
- **Plánované moduly v API.** Sekce, které ještě nejsou na disku, mají
  v `content/osnova.json` pole `modules` (kontrakt kap. 2.1) s tím, co se v nich
  bude učit. `loadCurriculum` je zatím nevrací (u nedostupné sekce posílá
  `modules: []`), takže přehled u „připravuje se" neukáže nic. Až je API pošle,
  UI je vykreslí bez odkazů (nejde je otevřít) a s rozpočtem minut sekce.
- **Kontrakt kap. 11** zakazuje zmínky o AI i v textech lekcí. Podle E2 je
  potřeba ho upravit: zákaz platí pro kód platformy, komentáře, commity
  a atribuci, ne pro obsah `prace-s-ai` a `start-nastroje/uceni-s-ai`.
- **Runtime `react` (B22)** musí být hotový před vlnou React sekcí, včetně
  rozhodnutí o vendoru pro React Router a TanStack Query.
- **Projekty s `helpers.run('npm …')`** v Next.js a Vite potřebují vyšší
  `timeoutMs` (build Next.js běžně trvá desítky sekund).
- **Runtime s knihovnami** (`dom` s `libs`, vendor pro `react-ui-knihovny`)
  staví jiný agent; popis patří do kontraktu kap. 6. Pro autory sekcí
  `css-tailwind`, `css-efekty-animace`, `web-3d-efekty` a `react-ui-knihovny`
  je potřeba potvrdit:
  - **Tailwind v testech:** prohlížečová verze generuje CSS asynchronně po
    změně DOM. Testy musí mít způsob, jak počkat na vygenerované styly (např.
    `await helpers.flush()` nebo `helpers.waitForStyles()`), jinak
    `getComputedStyle` čte stav před vygenerováním.
  - **Scroll v iframu:** testy ScrollTriggeru, Motion `scroll`/`inView`
    a Lenis potřebují náhled s obsahem vyšším než okno, programový scroll
    (`scrollTo` a počkání na snímek) a `ScrollTrigger.refresh()` po změně
    šířky přes `helpers.resize`.
  - **Čas animací:** testy nesmí čekat na reálný čas; GSAP přes
    `progress(1)` nebo `gsap.globalTimeline.timeScale`, Motion přes
    `MotionGlobalConfig.skipAnimations`, CSS přes `helpers` s vypnutými
    přechody. Runner by měl umět zapnout `prefers-reduced-motion: reduce`
    v náhledu i v testech (varianta s omezeným pohybem se testuje v každé
    sekci s efekty).
  - **WebGL v headless Chromiu:** `web-3d-efekty` potřebuje WebGL
    v prohlížeči verify (SwiftShader nebo `--use-angle=swiftshader`). Bez něj
    se testy scény omezí na graf scény bez vykreslení a sekce to uvede.
  - **Radix a portály:** dialogy a menu se vykreslují do `document.body`
    mimo kořen aplikace; testovací pomocníci runtime `react` je musí najít
    (dotazy nad celým dokumentem, ne jen nad kontejnerem komponenty).
