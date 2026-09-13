# Kontrakt Akademie

Zdroj pravdy pro všechny, kdo na Akademii pracují. Když se kód a tento dokument
rozcházejí, platí dokument — a rozpor se nahlásí, ne tiše obejde.

Akademie je lokální interaktivní kurz webového vývoje ve stylu freeCodeCamp:
osnova → sekce → moduly (lekce, workshop, lab, kvíz, projekt). Uživatel píše kód
v editoru v prohlížeči, testy běží hned. Velké projekty dělá ve VS Code na disku.

---

## 1. Adresáře a vlastnictví

```
akademie/
├── package.json            ← jen koordinátor (závislosti jsou předinstalované)
├── vite.config.js          ← koordinátor
├── start.sh                ← koordinátor
├── shared/                 ← koordinátor: parse.js, content.js (+ testy)
├── server/                 ← SERVER: HTTP API, postup, node-runner, projekty
├── client/                 ← UI: aplikace (Vite, vanilla JS, CodeMirror 6)
│   └── src/runner/         ← RUNNER: prohlížečový běh testů a náhled
│   └── runner.html         ← RUNNER: stránka pro Playwright (verify)
├── tools/                  ← RUNNER: verify.js (npm run overit)
├── content/
│   ├── osnova.json         ← OSNOVA
│   └── <sekce>/            ← autor dané sekce, nikdo jiný
├── docs/
│   ├── kontrakt.md         ← koordinátor
│   ├── styl-obsahu.md      ← koordinátor
│   └── osnova.md           ← OSNOVA
├── data/progress.json      ← vytváří server za běhu (v .gitignore)
└── moje-projekty/          ← projekty uživatele (v .gitignore)
```

Kód píšeme anglicky (identifikátory), komentáře a texty v UI česky.
Soubory `.js` jsou ES moduly. Žádný TypeScript v platformě.

---

## 2. Struktura obsahu

### 2.1 `content/osnova.json`

```json
{
  "parts": [
    {
      "id": "web-a-css",
      "title": "Web a CSS",
      "summary": "Krátký popis části.",
      "sections": [
        "css-flexbox",
        { "id": "css-grid", "title": "CSS Grid", "summary": "Plánovaná sekce, ještě bez obsahu." }
      ]
    }
  ]
}
```

Položka sekce je buď slug (sekce existuje na disku), nebo objekt s `id`, `title`
a `summary` (sekce je plánovaná). Sekce, která na disku není, se v přehledu ukáže
jako „připravuje se" (`available: false`). Existuje-li na disku, `title` a `intro`
se berou ze `section.json`.

### 2.2 `content/<sekce>/section.json`

```json
{
  "title": "CSS Flexbox",
  "intro": "Markdown: co se v sekci naučíš a proč.",
  "modules": ["uvod-do-flexboxu", "workshop-navigace", "lab-galerie", "kviz"]
}
```

### 2.3 `content/<sekce>/<modul>/module.json`

```json
{ "type": "workshop", "title": "Postav navigaci", "summary": "Jedna věta.", "minutes": 40, "runtime": "dom" }
```

`type` je jedno z `lesson | workshop | lab | quiz | project`.
`runtime` je výchozí prostředí testů pro kroky modulu (`dom | js | vue | node`,
výchozí `dom`). Slugy jsou `a-z0-9` s pomlčkami.

| typ | soubory v adresáři modulu |
|---|---|
| `lesson` | `lesson.md` |
| `workshop` | `steps/001.md`, `steps/002.md`, … (tři číslice, pořadí podle jména) |
| `lab` | `lab.md` |
| `quiz` | `quiz.md` |
| `project` | `project.md`, `starter/` (výchozí soubory), `solution/` (referenční řešení) |

### 2.4 Identifikátory

- modul: `<sekce>/<modul>` — např. `css-flexbox/workshop-navigace`
- krok workshopu: `<sekce>/<modul>/<NNN>` — např. `css-flexbox/workshop-navigace/003`
- lab, kvíz, lekce a projekt mají id modulu

---

## 3. Formát kroku (`steps/NNN.md`, `lab.md`, `project.md`)

````md
---
title: Flex kontejner
runtime: dom
---

# --description--

Markdown. Co přesně má uživatel udělat, proč, a příklad na JINÝCH datech.

# --hints--

Text první nápovědy (markdown). Uvidí ho uživatel u testu.

```js
assert.equal(getComputedStyle(document.querySelector('nav')).display, 'flex');
```

Text druhé nápovědy.

```js
assert.match(files['styles.css'], /nav\s*\{/);
```

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head><link rel="stylesheet" href="styles.css"></head>
  <body><nav>…</nav></body>
</html>
```

## --file-- styles.css

```css
body { margin: 0; }
--edit--

--edit--
```

# --solution--

## --file-- styles.css

```css
body { margin: 0; }
nav { display: flex; }
```
````

Pravidla:

- Frontmatter je nepovinný (`title`, `runtime`). Jen `klíč: hodnota`.
- Sekce `# --description--`, `# --hints--`, `# --seed--`, `# --solution--`, každá jednou.
  `lab.md` a `project.md` smí seed/solution vynechat (projekt je bere ze složek).
- **Nápověda = text a hned po něm jeden blok ` ```js `** (test). Text nápovědy proto
  nesmí obsahovat bloky ` ```js ` — příklady v textu nápovědy piš inline kódem nebo
  jiným jazykem bloku.
- Blok kódu smí mít víc backticků (` ```` `), když obsah sám obsahuje ` ``` `.
- **`--edit--`**: řádek s touto značkou vymezuje zvýrazněnou oblast, kam má uživatel
  psát. V souboru 0× nebo 2×. Značky se ze souboru odstraní; editor oblast zvýrazní
  a postaví do ní kurzor. Editovat se dá celý soubor.
- `--solution--` obsahuje jen změněné soubory, vždy **celé**. Nezměněné se převezmou
  ze seedu.
- **Návaznost workshopu**: seed kroku N má být řešení kroku N−1 (verify to hlídá
  jako varování). Uživatelův kód z předchozího kroku se nepřenáší — každý krok
  začíná čistým seedem, aby jedna chyba nerozbila zbytek workshopu.

### 3.1 Výstup parseru (`shared/parse.js`)

```js
// parseStep(markdown, { id, defaultRuntime, defaultTitle, requireSeed }) →
{
  id: 'css-flexbox/workshop-navigace/003',
  title: 'Flex kontejner',
  runtime: 'dom',                              // dom | js | vue | node
  description: '…markdown…',
  hints: [{ text: '…markdown…', test: '…js kód…' }],
  seed: [{ name: 'styles.css', lang: 'css', content: '…', region: { start: 2, end: 2 } | null }],
  solution: [{ name, lang, content }],          // kompletní sada souborů (seed + změny)
  meta: { …frontmatter… }
}
```

`region.start`/`end` jsou 1-based čísla řádků ve výsledném obsahu, včetně.
Prázdná oblast má `end === start - 1` (kurzor jde na řádek `start`).

`lang` je přípona souboru (`html`, `css`, `js`, `json`, `vue`, `sql`, `sh`, `ts`, `md`…).

---

## 4. Kvíz (`quiz.md`) a otázky v lekci

```md
---
pass: 0.8
---

## --question--

Text otázky, klidně s kódem.

### --answer--

Špatná odpověď.

#### --why--

Proč je špatná (nepovinné, ukáže se po vyhodnocení).

### --correct--

Správná odpověď.

#### --why--

Proč je správná.
```

- Aspoň 2 odpovědi, aspoň jedna `--correct--`. Víc správných = otázka s více volbami.
- `pass` = podíl správně zodpovězených otázek nutný ke splnění (výchozí 0.8).
- UI odpovědi zamíchá.

```js
// parseQuiz(md, { id }) →
{ id, pass: 0.8, questions: [{ text, multiple: false, answers: [{ text, correct, why }] }] }
```

---

## 5. Lekce (`lesson.md`)

Obyčejný markdown plus živé ukázky a nepovinné kontrolní otázky na konci:

````md
# Flexbox: hlavní a vedlejší osa

Výklad…

:::live
```html
<div class="row"><div>1</div><div>2</div></div>
```
```css
.row { display: flex; gap: 1rem; }
```
:::

Další výklad…

# --questions--

## --question--
…stejný formát jako kvíz…
````

- `:::live` (výchozí runtime `dom`) nebo `:::live js` pro čistý JS s konzolí.
  Uvnitř bloky `html`, `css`, `js` — každý jazyk nejvýš jednou; mapují se na
  `index.html`, `styles.css`, `script.js`. `index.html` u živé ukázky je jen tělo
  stránky, CSS i JS se připojí automaticky.
- Uživatel si ukázku může upravit a vidí výsledek hned. Tlačítko „Obnovit" vrátí originál.
- Lekce je splněná, když ji uživatel dočte a správně odpoví na všechny otázky
  (bez otázek stačí tlačítko „Mám přečteno").

```js
// parseLesson(md, { id }) →
{ id, blocks: [{ kind: 'md', text } | { kind: 'live', runtime, files: [{ name, lang, content }] }], questions: [...] }
```

---

## 6. Běh testů

### 6.1 Společný požadavek a výsledek

```js
// RunRequest
{
  runtime: 'dom' | 'js' | 'vue' | 'node',
  files: [{ name: 'index.html', content: '…' }],
  hints: [{ text, test }],
  timeoutMs: 5000          // na jeden test; výchozí dom/js/vue 5000, node 10000
}

// RunResult
{
  ok: true,                                 // všechny testy prošly
  results: [{ index: 0, pass: true }, { index: 1, pass: false, error: 'Expected values to be strictly equal…' }],
  logs: [{ level: 'log' | 'info' | 'warn' | 'error', text: 'Ahoj' }],   // konzole uživatelova kódu
  errors: ['ReferenceError: x is not defined (script.js:3)']            // nezachycené chyby uživatelova kódu
}
```

Test je **tělo async funkce**: smí používat `await`, projde, když nevyhodí výjimku,
selže výjimkou nebo po překročení `timeoutMs`. Každý test běží v **čerstvém
prostředí** (nový iframe / nový proces), aby se testy neovlivňovaly. `logs` a `errors`
se berou z prvního spuštění.

### 6.2 Globály dostupné v každém testu

| jméno | co to je |
|---|---|
| `assert` | podmnožina `node:assert/strict`: `assert(v, msg)`, `ok`, `equal`, `notEqual`, `deepEqual`, `notDeepEqual`, `match`, `doesNotMatch`, `throws`, `doesNotThrow`, `rejects`, `fail`. `equal` je striktní (`===`, resp. `Object.is`). |
| `files` | `{ 'index.html': '…', 'styles.css': '…' }` — aktuální obsah souborů uživatele |
| `logs` | pole `{ level, text }` — co uživatelův kód vypsal do konzole (v tomto běhu) |
| `errors` | pole textů nezachycených chyb uživatelova kódu |
| `helpers.stripComments(src, lang)` | odstraní komentáře (`css`, `js`, `html`) |
| `helpers.normalize(src)` | sloučí bílé znaky do jedné mezery, ořízne |
| `helpers.wait(ms)` | Promise |
| `helpers.waitFor(fn, timeoutMs = 2000)` | čeká, dokud `fn()` (i async) nevrátí pravdivou hodnotu; vrátí ji; jinak vyhodí |

### 6.3 Runtime `dom`

Stránka poskládaná z `index.html`. Odkazy `<link rel="stylesheet" href="X">`
a `<script src="X">` na soubory kroku se nahradí vloženým `<style>`/`<script>`
se stejnými atributy (`type="module"` zůstává). Když `index.html` chybí,
vytvoří se prázdná stránka, do které se připojí všechny `.css` a `.js` soubory.

Test běží **uvnitř iframe náhledu**, takže `document`, `window`,
`getComputedStyle` jsou dokumenty uživatelovy stránky. Test se spustí po události
`load` a po dokončení synchronních skriptů uživatele. Iframe má výchozí velikost
**1024×768**.

Navíc:

| jméno | co to je |
|---|---|
| `helpers.cssRules(selector)` | pole `CSSStyleRule` z uživatelových stylů, jejichž `selectorText` po normalizaci (bílé znaky, pořadí ne) přesně odpovídá; hledá i uvnitř `@media`, `@supports`, `@layer`, `@container` a vnořených pravidel. Každé má navíc `.conditions` = pole textů podmínek, např. `['(max-width: 600px)']`. |
| `helpers.cssRule(selector)` | poslední pravidlo z `cssRules(selector)` bez podmínek, nebo `null`; vrací jeho `style` (`CSSStyleDeclaration`) |
| `helpers.click(el)` | vyvolá `pointerdown/mousedown/pointerup/mouseup/click`, vrátí Promise (tick) |
| `helpers.type(el, text)` | nastaví `value` znak po znaku s `input` událostmi, pak `change` |
| `helpers.press(el, key)` | `keydown` + `keyup` s daným `key` |
| `helpers.submit(form)` | `form.requestSubmit()` |
| `await helpers.resize(width, height?)` | změní velikost iframu a počká na přepočet layoutu (pro media queries) |
| `await helpers.importFile(name)` | naimportuje soubor kroku jako ES modul (relativní importy mezi soubory kroku fungují), vrátí namespace |

### 6.4 Runtime `js`

Čistý JavaScript bez vlastního HTML: prázdná stránka, první `.js` soubor
(přednostně `script.js`) se spustí jako **klasický skript**, takže jeho top-level
`function`, `let`, `const` a `class` jsou z testu dostupné přímo jménem.
Test běží ve stejném realmu po doběhnutí skriptu. Dostupné je vše z 6.2
a `helpers.importFile(name)` z 6.3. Náhled v UI ukazuje jen konzoli.

### 6.5 Runtime `vue`

Jako `dom`, jen se do stránky automaticky vloží import map
`{"imports":{"vue":"/vendor/vue.esm-browser.js"}}`. Uživatel píše
`<script type="module">import { createApp } from 'vue'`. Soubory `.vue` (SFC)
se v prohlížeči nepodporují — ty patří do projektů s Vite.

### 6.6 Runtime `node`

Běží na serveru. Soubory se zapíšou do nového dočasného adresáře
(u projektu se použije adresář projektu uživatele, nic se nekopíruje ani nemaže).
Každý test běží v novém procesu `node` s cwd = ten adresář.

| jméno | co to je |
|---|---|
| `assert` | `node:assert/strict` |
| `files`, `helpers.stripComments`, `helpers.normalize`, `helpers.wait`, `helpers.waitFor` | jako 6.2 |
| `helpers.dir` | absolutní cesta pracovního adresáře |
| `await helpers.importFile(name)` | dynamický import souboru z adresáře (bez cache) |
| `await helpers.run(cmd, { timeoutMs = 10000, input })` | spustí příkaz v shellu (`bash -c`) v adresáři → `{ code, stdout, stderr }` |
| `await helpers.startServer(file, { port, env, timeoutMs = 5000 })` | spustí `node file` s `PORT` (volný port, když nezadáš) a počká, až port přijímá spojení → `{ url, port, output(), stop() }`. Po testu se zastaví sám. |
| `fetch` | globální `fetch` Node |

`logs` = stdout/stderr uživatelova hlavního souboru, jen když ho test spustil
přes `helpers.run`/`startServer` (jinak prázdné). `errors` = prázdné.

### 6.7 Rozhraní modulů runneru

```js
// client/src/runner/index.js  (prohlížeč)
export async function runTests(request /* RunRequest */) /* → RunResult */
//   dom/js/vue běží lokálně v iframech; node → POST /api/run-node
export function mountPreview(container /* HTMLElement */, { runtime, files }) /* → { update({ runtime, files }), destroy(), onConsole(cb) } */
//   živý náhled: iframe (dom/vue) nebo panel konzole (js); node → jen tlačítko „Spustit" v UI

// client/runner.html — stránka bez UI, vystaví: window.akademieRunner = { runTests }

// server/node-runner.js  (Node)
export async function runNodeTests({ files, hints, timeoutMs = 10000, cwd = null }) /* → RunResult */
export async function runNodeFile({ files, main, timeoutMs = 5000, cwd = null }) /* → { code, stdout, stderr, timedOut } */
```

### 6.8 Izolace a nekonečné smyčky (povinné)

Uživatel píše kód živě — `while (true)` napůl dopsaný v editoru nesmí zamrazit aplikaci.

- Uživatelův kód **i test** běží uvnitř iframu `sandbox="allow-scripts allow-modals allow-forms"`
  **bez `allow-same-origin`** (neprůhledný origin, v Chromu mimo hlavní vlákno aplikace).
  Test se do stránky vloží jako skript a s rodičem komunikuje jen přes `postMessage`
  (výsledek, konzole, chyby, požadavek na `resize`). Rodič drží watchdog: po `timeoutMs`
  iframe odstraní a test označí jako selhaný („Test nedoběhl včas — nekonečná smyčka?").
- **Ochrana smyček**: každý uživatelův JS (inline skripty v HTML, `.js` soubory, moduly)
  se před spuštěním přepíše přes `acorn` + `acorn-walk`: do těla každého `for`, `for…in`,
  `for…of`, `while`, `do…while` se vloží kontrola, která vyhodí
  `Error('Smyčka běží příliš dlouho — nekonečná smyčka? (řádek N)')`, když jedna smyčka
  běží déle než 1000 ms (v náhledu) nebo `timeoutMs` (v testu). Tělo bez složených
  závorek se obalí. Když kód nejde naparsovat, spustí se beze změny (prohlížeč sám ohlásí
  syntaktickou chybu). Čísla řádků v chybách mají odpovídat původnímu kódu.
- Náhled vue (`/vendor/vue.esm-browser.js`) se z neprůhledného originu načítá přes CORS:
  server na `/vendor/*` posílá `Access-Control-Allow-Origin: *`. Absolutní URL předává
  rodič (`location.origin`).
- Ve verify i v UI se používá **stejný** runner — to, co projde ve verify, projde uživateli.

---

## 7. HTTP API serveru

Server: `node server/index.js`, port z `PORT` (výchozí **4300**). Exportuje
`createApp({ contentDir, dataDir, projectsDir, distDir }) → http.Server` (neposlouchá),
aby ho šlo spustit z testů a z verify.

Ve vývoji běží Vite (`npm run dev`, port **5300**) a proxuje `/api` a `/vendor` na 4300.
V produkci (`./start.sh`) server servíruje `dist/` a pro neznámé cesty vrací
`dist/index.html` (SPA).

Všechna těla jsou JSON. Chyby: `{ error: 'česká zpráva' }` se stavem 4xx/5xx.

| metoda a cesta | tělo | odpověď |
|---|---|---|
| `GET /api/curriculum` | — | výstup `loadCurriculum` (viz `shared/content.js`) |
| `GET /api/module/:section/:module` | — | výstup `loadModule(…, { includeSolutions: false })` |
| `GET /api/module/:section/:module?solution=1` | — | totéž i s řešeními |
| `GET /api/progress` | — | `Progress` (viz 8) |
| `PUT /api/progress/code` | `{ id, files: [{ name, content }] }` | `{ ok: true }` — rozpracovaný kód |
| `POST /api/progress/complete` | `{ id, score? }` | `{ ok: true, progress }` |
| `POST /api/progress/reset` | `{ id }` | smaže splnění, kód i výsledky pro `id` a všechna id začínající `id + '/'` → `{ ok: true, progress }` |
| `POST /api/run-node` | `RunRequest` (runtime node, bez `cwd`) | `RunResult` |
| `POST /api/run-node-file` | `{ files, main }` | `{ code, stdout, stderr, timedOut }` |
| `POST /api/project/:section/:module/start` | — | zkopíruje `starter/` do `moje-projekty/<section>--<module>/`, pokud tam ještě nic není → `{ dir, created }` |
| `GET /api/project/:section/:module/files` | — | `{ dir, exists, files: [{ name, lang, content }] }` |
| `POST /api/project/:section/:module/check` | — | jen `runtime: node`: `runNodeTests` s `cwd` projektu → `RunResult`. U `dom` vrací 400 a klient testuje sám nad `files`. |
| `GET /vendor/vue.esm-browser.js` | — | `node_modules/vue/dist/vue.esm-browser.js`, s hlavičkou `Access-Control-Allow-Origin: *` |

Server nikdy nespouští kód mimo `/api/run-node*` a `/api/project/*/check`.
Poslouchá jen na `127.0.0.1`.

---

## 8. Postup (`data/progress.json`)

```json
{
  "version": 1,
  "completed": { "css-flexbox/workshop-navigace/001": "2026-09-13T10:00:00.000Z" },
  "scores": { "css-flexbox/kviz": 0.9 },
  "code": { "css-flexbox/workshop-navigace/002": { "files": [{ "name": "styles.css", "content": "…" }], "updated": "…" } },
  "lastVisited": "css-flexbox/workshop-navigace/002"
}
```

- Workshop je splněný, když jsou splněné všechny jeho kroky. Ostatní moduly mají
  záznam přímo pod id modulu. Sekce je splněná, když jsou splněné všechny moduly.
- `complete` se `score` uloží nejlepší skóre (kvíz).
- `lastVisited` nastavuje `PUT /api/progress/code` i `complete` (pro „Pokračovat").
- Zápis je atomický (zapsat do `.tmp`, pak `rename`).

---

## 9. Projekty (VS Code)

- `project.md` má `# --description--` (zadání, uživatelské příběhy) a `# --hints--`
  (testy = uživatelské příběhy). Seed a řešení jsou složky `starter/` a `solution/`.
- UI ukáže zadání, tlačítko **Začít projekt** (→ `start`), cestu k adresáři a příkaz
  `code <cesta>`, a tlačítko **Zkontrolovat**:
  - `runtime: dom` — klient si načte `files` a spustí `runTests` v prohlížeči;
  - `runtime: node` — `POST …/check`. Test si smí sám zavolat `helpers.run('npm test')`,
    `helpers.run('npm run build')` apod. (projekt si závislosti instaluje uživatel,
    zadání mu to řekne).
- Náhled `dom` projektu: iframe se stejným skládáním jako runtime `dom`.

---

## 10. Ověření obsahu (`npm run overit`)

```
npm run overit                      # celý obsah
npm run overit -- content/css-flexbox   # jen prefix
npm run overit -- --json            # strojový výstup
```

`tools/verify.js` je soběstačný: sám si spustí, co potřebuje (server na volném
portu, Vite build nebo dev server, Playwright), a po sobě uklidí. Kontroluje:

1. **Struktura** — `osnova.json`, `section.json`, `module.json`, všechny `.md`
   jdou naparsovat (`loadModule`). Chyba = selhání.
2. **Krok / lab / projekt** — testy nad **seedem**: aspoň jeden musí selhat.
   Testy nad **řešením**: všechny musí projít. Jinak selhání (s výpisem, který test).
   Nad řešením také nesmí být `errors`.
3. **Návaznost workshopu** — seed kroku N ≠ řešení kroku N−1 (po normalizaci bílých
   znaků) → varování.
4. **Lekce** — každá živá ukázka se spustí bez `errors`. Otázky jsou validní.
5. **Kvíz** — validní (parser), aspoň 5 otázek → jinak varování.

Výstup: souhrn po modulech, na konci počet chyb a varování. Exit kód 1 při chybě.

---

## 11. Pravidla pro agenty

- Pracuj **jen ve svých adresářích** (kap. 1). Potřebuješ změnu jinde (kontrakt,
  `shared/`, `package.json`, cizí modul)? Napiš ji do závěrečné zprávy.
- **Neinstaluj balíčky** a neměň `package.json`. K dispozici: `vite`, `codemirror`,
  `@codemirror/lang-html`, `@codemirror/lang-css`, `@codemirror/lang-javascript`,
  `@codemirror/theme-one-dark`, `marked`, `vue`, `acorn`, `acorn-walk`, `playwright` (Chromium headless shell).
- **Nikdy `pkill node` / `killall node`** — zabiješ cizí procesy. Zabíjej jen PID,
  které jsi sám spustil. Používej porty ze svého přiděleného rozsahu.
- Žádné commity — commituje koordinátor.
- Nikde (kód, komentáře, texty, commity) nezmiňuj AI, Clauda ani asistenta.

---

## 12. Upřesnění z vlny 1 (platí přednostně před kap. 6–10)

**Frontmatter kroku / labu / projektu**
- `timeoutMs: N` — limit jednoho testu (respektuje UI, server i verify). Projekty, které volají
  `helpers.run('npm test')` apod., si ho musí zvýšit.
- `main: soubor.js` — co spouští tlačítko **Spustit** u runtime node (jinak první `index.js`/`.js`).

**RunResult (6.1)**
- `results[i]` může mít `skipped: true` — když se uživatelova stránka zasekne už při načítání,
  runner po prvním selhání zbylé testy nespouští (jinak by kontrola trvala `timeoutMs × počet testů`).
- `runnerError` — selhal runner sám (nedostupné API, spadlá stránka), ne test.
- U runtime node se `logs` berou z prvního testu, který nějaké logy má (stdout → `log`, stderr → `error`).

**Runtime node (6.6)**
- `helpers.run` při timeoutu vrací `{ code: null, timedOut: true, … }`.
- `startServer` vrací `url` `http://127.0.0.1:PORT` (nebo `[::1]`, když server poslouchá jen na IPv6).
- `helpers.waitFor` bere výjimku z `fn` jako „zatím ne"; po vypršení uvede poslední hlášku.

**Runner v prohlížeči (6.3, 6.7, 6.8)**
- `mountPreview(...).onConsole(cb)` → cb dostává `{ level: 'log'|'info'|'warn'|'error'|'clear', text, uncaught? }`,
  vrací funkci pro odhlášení. `window.akademieRunner` má i `mountPreview`.
- Testovací iframy jsou **průhledné v rohu okna** (ne mimo obrazovku — Chrome by přestal vykreslovat)
  a test čeká, až layout převezme velikost iframu.
- `index.html` bez doctype a `<html>/<head>/<body>` se bere jako tělo stránky; nepřipojené CSS/JS se
  připojí samo (JS s `import`/`export` jako modul).
- `alert/confirm/prompt` v testu jdou do `logs` (`confirm` → false, `prompt` → null).
- Watchdog přidává rezervu +2000 ms na načtení a +1000 ms od startu testu, aby dřív zasáhl časovač
  testu nebo ochrana smyček s konkrétní hláškou.
- **Headless Chromium (verify, E2E) se musí spouštět s `--site-per-process`**, jinak sandboxované
  iframy nejsou v odděleném procesu a nekonečná smyčka zamrazí stránku. Běžný Chrome izoluje sám.
- Sandboxované iframy sdílejí jeden proces: zaseknutý test na chvíli zdrží i živý náhled. Při odchodu
  z obrazovky se kontrola ruší (`AbortSignal`).

**Server (7)**
- Požadavky s `Host` mimo localhost/127.0.0.1/::1 → 403; POST/PUT s `Origin` mimo loopback → 403
  (ochrana proti DNS rebindingu a CSRF — server spouští kód).
- Stavové kódy: 400 neplatný vstup/slug, 404 neexistující modul, 405 metoda, 409 `check` před `start`,
  413 tělo nad 5 MB, 500 rozbitý obsah (`ParseError`).

**Verify (10)**
- Návaznost workshopu: soubory, které v kroku N nově přibyly, varování nevyvolají.

**Nástroje**
- `node tools/e2e.js [--port N]` — kouřový průchod UI v Playwrightu (vlastní dočasná data, snímky do `.e2e/`).
