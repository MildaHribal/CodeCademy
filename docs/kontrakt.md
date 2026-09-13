# Kontrakt Akademie

Zdroj pravdy pro všechny, kdo na Akademii pracují. Když se kód a tento dokument
rozcházejí, platí dokument — a rozpor se nahlásí, ne tiše obejde.

Akademie je lokální interaktivní kurz webového vývoje ve stylu freeCodeCamp:
osnova → sekce → moduly (lekce, workshop, lab, kvíz, projekt). Uživatel píše kód
v editoru v prohlížeči, testy běží hned. Velké projekty dělá ve VS Code na disku.

Jak psát obsah (počty, pořadí, tón) je v `docs/styl-obsahu.md`. Vnitřní stavba
platformy (úložiště, registrace rout, index obsahu) je v `docs/platforma.md`.
Tento dokument určuje **formáty a rozhraní**: co autor píše, co z toho parser
vyrobí, co vrací API a co hlídá verify.

**Zásady, které platí všude:**

- **Nic se nezamyká.** Každá sekce, modul i krok jde otevřít kdykoli. Žádné časové
  zámky. Nápovědy jsou vidět vždy, řešení jde zobrazit vždy (před splněním jen
  s potvrzením). Splnění ničeho není podmínkou otevření něčeho jiného. „Doporučená
  trasa" jen radí.
- **Jeden formát pro jednu věc.** Otázka s psanou odpovědí je všude stejná
  (kvíz, `:::check`, předpověď, karty), nápověda je všude `# --help--`.
- Značky obsahu (`# --x--`, `:::x`, `--x--`) se hledají **jen mimo bloky kódu**
  (fence-aware). Uvnitř ` ``` ` je všechno obyčejný text.

---

## 1. Adresáře a vlastnictví

```
akademie/
├── package.json            ← jen koordinátor (závislosti jsou předinstalované)
├── vite.config.js          ← koordinátor
├── start.sh                ← koordinátor
├── shared/                 ← sdílený kód prohlížeče i Node (kap. 1.1)
├── server/                 ← SERVER: HTTP API, postup, node-runner, projekty, nástroje (kap. 12)
├── client/                 ← UI: aplikace (Vite, vanilla JS, CodeMirror 6)
│   ├── src/runner/         ← RUNNER: prohlížečový běh testů a náhled
│   └── runner.html         ← RUNNER: stránka pro Playwright (verify)
├── tools/                  ← RUNNER/VERIFY: verify.js (npm run overit), e2e.js
├── content/
│   ├── osnova.json         ← OSNOVA
│   └── <sekce>/            ← autor dané sekce, nikdo jiný
│       ├── section.json
│       ├── cards.md        ← karty pro opakování (kap. 2.5)
│       ├── pojmy.md        ← pojmy sekce (kap. 2.6)
│       ├── tahak.md        ← tahák sekce (kap. 2.7)
│       └── <modul>/
├── docs/
│   ├── kontrakt.md         ← koordinátor
│   ├── styl-obsahu.md      ← koordinátor
│   ├── platforma.md        ← PLATFORMA (vnitřní stavba serveru a klienta)
│   └── osnova.md           ← OSNOVA
├── data/                   ← vytváří server za běhu (v .gitignore), kap. 8 a 12
│   ├── progress.json
│   ├── pokusy.json
│   ├── opakovani.json
│   ├── jistota.json
│   ├── nastaveni.json
│   └── poznamky/<sekce>.md
└── moje-projekty/          ← projekty uživatele (v .gitignore)
```

Když zadání agenta přidělí soubory jinak, platí zadání. Bez zadání platí tabulka.
Kód píšeme anglicky (identifikátory), komentáře a texty v UI česky.
Soubory `.js` jsou ES moduly. Žádný TypeScript v platformě.

### 1.1 Sdílené moduly (`shared/`)

Parser, UI i verify musí používat **tytéž** funkce, aby se nerozcházely.

| soubor | exporty |
|---|---|
| `parse.js` | `ParseError`, `RUNTIMES`, `STEP_KINDS`, `langOf`, `extractRegion`, `mergeFiles`, `parseStep`, `parseQuiz`, `parseLesson`, `parseCards`, `parseTerms`; skládání parsons `assembleParsons`, `fillParsonsLine` (parser, verify P1 i UI); ovládací prvky `applyControlDefaults`, `controlValue` (kap. 5.2) |
| `content.js` | `MODULE_TYPES`, `SECTION_LEVELS`, `SECTION_EXTRAS`, `readTextTree`, `loadCurriculum`, `listModules`, `loadModule`, `loadSection`, `loadTerms`, `loadSectionExtras`, `sectionOutcomes`, `buildContentIndex`, `resolveContentItem` (kap. 2.1, 2.7, 12.8) |
| `anchors.js` | `headingAnchor`, `createSlugger`, `collectHeadings`, `anchoredHeadings` — **jediná implementace** kotev (kap. 2.8) |
| `answers.js` | `normalizeWhitespace`, `normalizeAnswer`, `normalizeCss`, `checkTextAnswer`, `hashKey`, `createKeyAllocator` (klíče s příponou `-2` v jednom souboru) (kap. 4.2, 2.8) |
| `refs.js` | `headingAnchor`, `collectHeadings` (re-export z `anchors.js`), `parseRef`, `refHref`, `termLookupKey`, `findTermRefs`, `parseItemId`, `itemTarget`, `findSeeLinks` (odkazy `](see:…)` mimo kód) (kap. 2.8–2.10) |
| `diff.js` | `diffLines`, `changeRatio` — řádkový LCS diff (porovnání s řešením B2, míra změny kap. 3.4) |
| `errors-cs.js` | `explainError`, `ERROR_PATTERNS` (vzory s `see` pro verify S4), `groupUndefinedNames` (kap. 6.9) |
| `syntax-check.js` | `findSyntaxError(files, { includeHtml = true })` — kontrola „kód nejde spustit" pro prohlížeč i node (node volá s `includeHtml: false`), `checkJsSyntax`, `extractInlineScripts`, `syntaxErrorResult`, `SYNTAX_SKIPPED_MESSAGE` (kap. 6.1) |
| `runner-assertion.js` | `describeAssertion(error, format)` — `operator`/`actual`/`expected`/`diff` a česká vygenerovaná zpráva, společné pro prohlížeč i Node (kap. 6.1) |

Kdo který soubor ve vlně 2b píše, určuje `docs/platforma.md`, kap. 7. Rozhraní `diff.js`
a `syntax-check.js` je tamtéž.

---

## 2. Struktura obsahu

### 2.1 `content/osnova.json`

```json
{
  "doporucenaTrasa": ["html-zaklady", "start-nastroje", "css-zaklady", "js-zaklady", "css-flexbox"],
  "parts": [
    {
      "id": "web-a-css",
      "title": "Web a CSS",
      "summary": "Krátký popis části.",
      "sections": [
        "css-flexbox",
        { "id": "css-grid", "title": "CSS Grid", "summary": "Plánovaná sekce, ještě bez obsahu." },
        { "id": "prohlizec-navic", "title": "Prohlížeč navíc", "summary": "…", "uroven": "rozsireni" }
      ]
    }
  ]
}
```

- Položka sekce je buď **slug** (sekce existuje na disku, `uroven` je `jadro`), nebo
  **objekt** s `id` a nepovinnými `title`, `summary`, `uroven`.
- Sekce, která na disku není, se v přehledu ukáže jako „připravuje se"
  (`available: false`); `title` a `summary` z objektu jsou pak povinné (verify: chyba).
  Existuje-li sekce na disku, `title` a `intro` se berou ze `section.json`.
- `uroven`: `"jadro"` (výchozí) nebo `"rozsireni"` (nepovinné rozšíření). Jiná hodnota = chyba.
- `doporucenaTrasa` (nepovinné): pole slugů sekcí v doporučeném pořadí průchodu;
  prokládá části (CSS a JS). Části zůstávají tematické. Nic se podle trasy nezamyká,
  UI z ní jen počítá odkaz „Další na trase" na konci sekce.
  - slug, který není v žádné části = **chyba**; slug dvakrát = **chyba**;
  - sekce `jadro`, která v trase chybí = **varování** (jen když trasa existuje).

`loadCurriculum(contentDir)` →

```js
{
  doporucenaTrasa: ['html-zaklady', …],          // [] když v osnově není
  parts: [{
    id, title, summary,
    sections: [{ id, title, intro, uroven: 'jadro' | 'rozsireni', available,
      outcomes: [{ text, links }],               // ze section.json tak, jak jsou (bez key); [] když chybí nebo sekce není na disku
      modules: [
        { id: 'css-flexbox/kviz', type, title, summary, minutes, stepCount }
      ] }]
  }]
}
```

Jména `uroven` a `doporucenaTrasa` se ve výstupu nepřekládají (stejná jako v osnově).
`outcomes` jsou v osnově surově kvůli přehledu sekcí; s klíči (`key`) je vrací
`loadSection` (kap. 2.7) — nástroje, které potřebují klíč, berou `loadSection`.

### 2.2 `content/<sekce>/section.json`

```json
{
  "title": "Pole v JavaScriptu",
  "intro": "Markdown: co se v sekci naučíš a proč.",
  "modules": ["co-je-pole", "workshop-nakupni-seznam", "lab-statistika-znamek", "kviz"],
  "outcomes": [
    {
      "text": "Napíšeš funkci nad polem objektů bez nápovědy.",
      "links": ["js-pole/workshop-nakupni-seznam", "js-pole/co-je-pole#pole-objektu"]
    },
    {
      "text": "Víš, které metody mění původní pole a které vracejí nové.",
      "links": ["js-pole/metody-pole-do-hloubky#metody-ktere-meni-pole"]
    }
  ]
}
```

- `outcomes` (nepovinné, doporučené): „Po sekci umíš" jako seznam kontrolovatelných
  schopností. `text` = jedna věta (markdown inline), `links` = pole referencí (kap. 2.9),
  kde se schopnost učí. Neplatná reference = **chyba**; chybějící `outcomes` = doporučení.
- Klíč výstupu = `hashKey(text)` (kap. 2.8). Id pro opakování `outcome:<sekce>#<klíč>`
  (plánované, vlna 3).

### 2.3 `content/<sekce>/<modul>/module.json`

```json
{ "type": "workshop", "title": "Postav navigaci", "summary": "Jedna věta.", "minutes": 40, "runtime": "dom" }
```

`type` je jedno z `lesson | workshop | lab | quiz | project`.
`runtime` je výchozí prostředí testů pro kroky modulu (`dom | js | vue | node`,
výchozí `dom`; `react` je plánovaný, kap. 13). Slugy jsou `a-z0-9` s pomlčkami.

| typ | soubory v adresáři modulu |
|---|---|
| `lesson` | `lesson.md` |
| `workshop` | `steps/001.md`, `steps/002.md`, … (tři číslice, pořadí podle jména) |
| `lab` | `lab.md` |
| `quiz` | `quiz.md` |
| `project` | `project.md`, `starter/` (výchozí soubory), `solution/` (referenční řešení) |

### 2.4 Identifikátory

- sekce: `<sekce>` — např. `css-flexbox`
- modul: `<sekce>/<modul>` — např. `css-flexbox/workshop-navigace`
- krok workshopu: `<sekce>/<modul>/<NNN>` — např. `css-flexbox/workshop-navigace/003`
- lab, kvíz, lekce a projekt mají id modulu
- položky opakování a pokusů: kap. 2.10

### 2.5 Karty pro opakování (`content/<sekce>/cards.md`)

Jeden soubor na sekci. Každá karta je `## --card-- <typ>`. Typy:

| typ | co student dělá | povinné části | nepovinné |
|---|---|---|---|
| `output` | napíše, co kód vypíše | text, `### --expected--` | `### --accept--`, `### --why--`, `### --see--` |
| `code js` | napíše kód, spustí se testy | text, `### --seed--`, `### --test--`, `### --solution--` | `### --why--`, `### --see--` |
| `css` | napíše deklaraci CSS | text, `### --expected--` | `### --accept--`, `### --why--`, `### --see--` |
| `free` | odpoví v hlavě (pohovorová otázka), porovná s modelovou odpovědí a sám se ohodnotí | text, `### --back--` | `### --see--` |

`````md
## --card-- output

Co vypíše tenhle kód?

```js
const a = [3, 1, 2];
const b = a.sort();
console.log(a === b);
```

### --expected--

true

### --why--

Myslíš si, že `sort` vrací seřazenou kopii? Řadí pole na místě a vrací totéž pole.

### --see--

js-pole/metody-pole-do-hloubky#metody-ktere-meni-pole

## --card-- code js

Napiš funkci `last(items)`, která vrátí poslední položku pole (u prázdného `undefined`).

### --seed--

```js
function last(items) {
}
```

### --test--

```js
assert.equal(last([1, 2, 3]), 3, 'last([1, 2, 3]) má vrátit 3');
assert.equal(last([]), undefined, 'last([]) má vrátit undefined');
```

### --solution--

```js
function last(items) {
  return items.at(-1);
}
```

## --card-- css

Napiš deklaraci, která flex položky zalomí na další řádek, když se nevejdou.

### --expected--

```css
flex-wrap: wrap;
```

### --accept--

```css
flex-flow: row wrap;
```

## --card-- free

Jaký je rozdíl mezi `map` a `forEach`? Kdy použiješ který?

### --back--

`map` vrací nové pole stejné délky z návratových hodnot callbacku, `forEach` vrací
`undefined` a slouží jen k vedlejším efektům…
`````

Pravidla:

- Text karty (preambule pod `## --card--`) je povinný markdown, může obsahovat bloky kódu.
- `### --expected--` a `### --accept--` mají stejný význam a normalizaci jako u otázky
  s psanou odpovědí (kap. 4.2). U `css` se porovnává přes `normalizeCss`.
- `code js`: `--seed--`, `--test--`, `--solution--` mají každý **přesně jeden** blok
  ` ```js `. Soubor se jmenuje `script.js`, runtime `js`. Jiný runtime než `js` = chyba
  (`code dom` je rezervované na později).
- Neznámý typ, chybějící povinná část, cizí `###` sekce = **ParseError**.

Výstup parseru:

```js
// parseCards(markdown, { id: 'js-pole' }) →
{
  id: 'js-pole',
  cards: [
    { key: '1a2b3c4d', type: 'output', text, expected: 'true', accept: [], ignoreCase: false, why: '…', see: ['js-pole/metody-pole-do-hloubky#metody-ktere-meni-pole'] },
    { key, type: 'code', runtime: 'js', text,
      seed: [{ name: 'script.js', lang: 'js', content, region: null }],
      hints: [{ text, test }],                  // jediná nápověda: text = text karty, test = obsah --test--
      solution: [{ name: 'script.js', lang: 'js', content }],
      why: '', see: [] },
    { key, type: 'css', text, expected: 'flex-wrap: wrap;', accept: ['flex-flow: row wrap;'], ignoreCase: false, why: '', see: [] },
    { key, type: 'free', text, back: '…markdown…', see: [] },
  ]
}
```

`key = hashKey(text)` (kap. 2.8). Id karty pro opakování: `card:<sekce>#<key>`.

### 2.6 Pojmy (`content/<sekce>/pojmy.md`)

`````md
## --term-- hlavní osa

en: main axis
aliases: hlavní ose, hlavní osy, hlavní osou
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Main_Axis
lekce: css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

Směr, ve kterém flex kontejner řadí položky. Určuje ho `flex-direction`.

## --term-- flex kontejner

en: flex container
lekce: css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky

Prvek s `display: flex`. Jeho přímí potomci jsou flex položky.
`````

- Za nadpisem `## --term-- <pojem>` následují řádky `klíč: hodnota` (prázdné řádky
  před nimi se přeskočí). Klíče: `en`, `aliases` (čárkami oddělené tvary), `mdn`
  (URL na `https://developer.mozilla.org/`), `lekce` (reference, kap. 2.9).
  Blok klíčů končí prvním řádkem, který není `klíč: hodnota`. Zbytek je **definice**
  (markdown, 1–3 věty).
- Povinné: pojem, `lekce`, definice. Neznámý klíč = ParseError.
- Pojem i všechny aliasy musí být **v celém kurzu jedinečné** podle `termLookupKey`
  (kap. 2.8). Kolize = **chyba** ve verify.

**Použití v textu:** `[[pojem]]` nebo `[[pojem|zobrazený text]]` v jakémkoli markdownu
obsahu (lekce, popis kroku, tipy, otázky, karty, tahák). Uvnitř bloků kódu a inline
kódu se nevyhodnocuje. Cíl se hledá mezi pojmy i aliasy přes `termLookupKey`.
Parser text nemění — `[[…]]` zůstává v markdownu a vykreslí ho UI (odkaz s definicí
v `title`, ve vlně 3 popover). Když cíl neexistuje, UI ukáže jen zobrazený text.

```js
// parseTerms(markdown, { id: 'css-flexbox' }) →
{ id: 'css-flexbox', terms: [
  { id: 'hlavni-osa', term: 'hlavní osa', en: 'main axis', aliases: ['hlavní ose', 'hlavní osy', 'hlavní osou'],
    mdn: 'https://…', lesson: 'css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa', definition: '…markdown…', sectionId: 'css-flexbox' }
] }
// id = headingAnchor(term); en/mdn chybějící = null, aliases chybějící = []
```

Verify: `[[x]]` s neexistujícím pojmem = **chyba**. Pojem použitý v sekci, která je
v doporučené trase (nebo bez trasy v pořadí osnovy) **před** sekcí jeho `lekce` =
**varování**. Pojem, který se nikde nepoužije = doporučení.

### 2.7 Tahák (`content/<sekce>/tahak.md`)

Obyčejný markdown (tabulky, 5–10 vzorů kódu, pasti), smí obsahovat `[[pojmy]]`.
Žádné značky `--x--` ani `:::` bloky. Nepřináší novou látku. UI ho ukáže na stránce
sekce a v tiskovém stylu. Chybějící soubor = doporučení.

`loadSection(contentDir, sectionId)` →

```js
{
  id: 'js-pole', title, intro,
  outcomes: [{ key, text, links: ['js-pole/co-je-pole#pole-objektu'] }],   // [] když chybí
  cheatsheet: '…markdown…' | null,
  terms: Term[],          // [] když pojmy.md chybí
  cards: Card[],          // [] když cards.md chybí
}
```

Když sekce na disku není (není `section.json`), `loadSection` vrátí `null` (routa z toho dělá 404).

`loadTerms(contentDir)` → `{ terms: Term[] }` ze všech dostupných sekcí v pořadí osnovy.

### 2.8 Klíče, normalizace a kotvy

**`normalizeWhitespace(text)`** = `String(text).replace(/\s+/g, ' ').trim()`.

**`hashKey(text)`** — stabilní klíč položky (otázky, karty, bodu checklistu, výstupu):
FNV-1a 32 bit nad UTF-8 bajty `normalizeWhitespace(text)`, zapsaný jako 8 malých
hexa číslic.

```js
let h = 0x811c9dc5;
for (const byte of new TextEncoder().encode(normalizeWhitespace(text))) {
  h ^= byte;
  h = Math.imul(h, 0x01000193) >>> 0;
}
return h.toString(16).padStart(8, '0');
```

Když mají dvě položky v **jednom souboru** stejný klíč, druhá dostane `-2`, třetí
`-3` (v pořadí souboru). Verify u toho dá varování (duplicitní text). Změna textu =
nový klíč; stará položka v opakování se smaže jako osiřelá (kap. 12.3).

**`termLookupKey(s)`** = `s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()`.

**`headingAnchor(text)`** — kotva nadpisu:

1. Z textu nadpisu odstraň markdown: inline kód `` `x` `` → `x`, odkaz `[t](url)` → `t`,
   pojem `[[p|t]]` → `t` a `[[p]]` → `p`, znaky `*` a `_` smaž.
2. `normalize('NFD')` a smaž diakritiku (`/[̀-ͯ]/g`).
3. Převeď na malá písmena.
4. Každý úsek znaků mimo `[a-z0-9]` nahraď jednou `-`.
5. Odstraň `-` na začátku a konci. Prázdný výsledek → `oddil`.

| nadpis | kotva |
|---|---|
| `## Hlavní a vedlejší osa` | `hlavni-a-vedlejsi-osa` |
| ``## `justify-content`: volné místo na hlavní ose`` | `justify-content-volne-misto-na-hlavni-ose` |
| ``## Proč se položka nezmenší: `min-width: auto` `` | `proc-se-polozka-nezmensi-min-width-auto` |
| ``## Kopie pole: `slice` vs. `[...a]` `` | `kopie-pole-slice-vs-a` |
| `## Typické chyby a pasti` | `typicke-chyby-a-pasti` |

**`collectHeadings(markdownTexts)`** — kotvy dostávají nadpisy úrovně **2 a 3**
(`##`, `###`) v `md` blocích lekce, mimo bloky kódu a mimo `:::` bloky, v pořadí
dokumentu. Když kotva už v lekci je, další dostane první volnou příponu `-2`, `-3`…
(`Pasti`, `Pasti`, `Pasti` → `pasti`, `pasti-2`, `pasti-3`). Nadpis `#` (titulek)
kotvu nemá. Parser, index obsahu i UI volají tutéž funkci ze `shared/anchors.js`
(`refs.js` ji jen re-exportuje), UI dá prvku nadpisu `id` = kotva.

### 2.9 Reference (`see`, `lekce`, `links`)

```
ref    = sekce "/" modul [ "/" krok ] [ "#" kotva ]
sekce, modul = slug     krok = tři číslice     kotva = [a-z0-9]+(-[a-z0-9]+)*
```

Příklady: `js-pole/co-je-pole#kopie-pole`, `css-flexbox/workshop-navigace/016`, `node-zaklady/kviz`.

- Kotva je povolená jen u lekce. Reference na neexistující sekci, modul, krok nebo
  kotvu = **chyba** ve verify.
- Víc referencí na jednom místě: ve frontmatteru oddělené čárkou
  (`see: js-pole/co-je-pole#kopie-pole, js-pole/kviz`), v sekci `--see--` jedna na řádek.
- `parseRef(ref)` → `{ sectionId, moduleId: 'sekce/modul', stepId: 'sekce/modul/NNN' | null, anchor: string | null }`
  nebo `null` pro neplatný zápis (parser pak hází ParseError).
- **Odkaz v markdownu** na výklad se píše `[text](see:<ref>)`, např.
  `[kopie pole](see:js-pole/co-je-pole#kopie-pole)`. UI adresu přepíše přes `refHref`,
  verify ji ověří jako ostatní reference. Ruční odkazy `#/modul/…` obsah nepoužívá.
- `refHref(ref)` → adresa v UI: `#/modul/<sekce>/<modul>[/<krok>]` a s kotvou
  `?kotva=<kotva>` (např. `#/modul/js-pole/co-je-pole?kotva=kopie-pole`). Router
  query část od cesty odloupne a obrazovka lekce po vykreslení odscrolluje na `id`.

### 2.10 Id položek opakování a pokusů

| tvar | co to je | cíl (`itemTarget`) |
|---|---|---|
| `q:<modul>#<klíč>` | otázka z `# --questions--` nebo `:::check` lekce, otázka kvízu | `<modul>` |
| `card:<sekce>#<klíč>` | karta z `cards.md` | `<sekce>` |
| `step:<krok nebo modul>` | krok workshopu nebo lab znovu od seedu | `<krok nebo modul>` |
| `explain:<krok nebo modul>#<klíč>` | bod checklistu z `# --explain--` kroku/labu nebo `:::explain` lekce | `<krok nebo modul>` |
| `outcome:<sekce>#<klíč>` | nejistý výstup sekce (plánované, vlna 3) | `<sekce>` |

`klíč` = `[0-9a-f]{8}(-[0-9]+)?`. `parseItemId(id)` → `{ type: 'q'|'card'|'step'|'explain'|'outcome', target, key: string|null }`
nebo `null`. Položka **patří** k id `X`, když `target === X` nebo `target` začíná `X + '/'`
(používá reset, kap. 8).

---

## 3. Krok workshopu, lab a projekt (`steps/NNN.md`, `lab.md`, `project.md`)

### 3.1 Základní formát

````md
---
title: Flex kontejner
runtime: dom
see: css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky
---

# --description--

Markdown. Co přesně má uživatel udělat, proč, a příklad na JINÝCH datech.

# --hints--

Text první nápovědy (markdown). Uvidí ho uživatel u testu.

```js
assert.equal(getComputedStyle(document.querySelector('nav')).display, 'flex', 'nav má mít display: flex');
```

Text druhé nápovědy.

```js
assert.match(files['styles.css'], /nav\s*\{/, 'styles.css má obsahovat pravidlo pro nav');
```

# --help--

## --tip--

Jde o flex kontejner — přečti si [Flex kontejner a flex položky](see:css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky).

## --tip--

Vlastnost `display` patří do pravidla pro prvek, který obaluje odkazy.

## --tip--

Stejně by vypadalo `footer { display: grid; }` — jiný prvek, jiná hodnota.

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

**Frontmatter** je nepovinný, jen `klíč: hodnota` (čísla a `true/false` se převedou).

| klíč | platí pro | význam |
|---|---|---|
| `title` | vše | titulek (jinak `Krok N` / titulek modulu) |
| `runtime` | vše | `dom \| js \| vue \| node`, jinak z `module.json` |
| `timeoutMs` | vše | limit jednoho testu v ms (respektuje UI, server i verify). Projekty, které volají `helpers.run('npm test')` apod., si ho musí zvýšit. |
| `main` | runtime node | co spouští tlačítko **Spustit** (jinak `index.js`, jinak první `.js` v pořadí souborů) |
| `kind` | krok workshopu, lab | `step` (výchozí) \| `debug` \| `parsons` \| `recall` \| `choose` (kap. 3.4–3.6). V labu jen `step` nebo `debug`. |
| `see` | vše | reference na výklad (kap. 2.9), čárkami oddělené |
| `maxChange` | `kind: debug` | podíl změněných řádků, nad kterým UI varuje (výchozí `0.5`) |

**Sekce** (`# --jméno--`, každá nejvýš jednou; neznámá nebo dvakrát = ParseError):

| sekce | krok workshopu | lab | projekt |
|---|---|---|---|
| `# --description--` | povinná | povinná | povinná |
| `# --hints--` | povinná | povinná | povinná |
| `# --help--` | nepovinná (kap. 3.3) | nepovinná | nepovinná |
| `# --seed--` | povinná | nepovinná | nepatří sem (ParseError; bere `starter/`) |
| `# --solution--` | povinná; u `kind: parsons` **zakázaná** | nepovinná (verify bez ní hlásí chybu) | nepatří sem (ParseError; bere `solution/`) |
| `# --explain--` | nepovinná (kap. 3.7) | nepovinná | — |
| `# --parsons--` | jen a povinně u `kind: parsons` | — | — |
| `# --approaches--` | — | nepovinná (kap. 3.8) | — |
| `# --review--` | — | nepovinná (kap. 3.9) | nepovinná |

Sekce v nepovoleném typu souboru = ParseError.

Pravidla:

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
  jako varování; soubory, které v kroku N nově přibyly, varování nevyvolají).
  Uživatelův kód z předchozího kroku se nepřenáší — každý krok začíná čistým seedem,
  aby jedna chyba nerozbila zbytek workshopu.
- **Seed labu s runtime js** obsahuje prázdné kostry požadovaných funkcí s JSDoc,
  aby nenapsané funkce nehlásily sérii `ReferenceError`.

### 3.2 Výstup parseru (`shared/parse.js`)

```js
// parseStep(markdown, { id, defaultRuntime, defaultTitle, requireSeed, fileKind }) →
//   fileKind: 'step' | 'lab' | 'project' (určuje povolené sekce z tabulky 3.1; výchozí 'step')
{
  id: 'css-flexbox/workshop-navigace/003',
  title: 'Flex kontejner',
  runtime: 'dom',                              // dom | js | vue | node
  kind: 'step',                                // step | debug | parsons | recall | choose
  description: '…markdown…',
  hints: [{ text: '…markdown…', test: '…js kód…' }],
  help: [{ text: '…markdown…', hintIndex: null }],        // kap. 3.3; [] když chybí
  seed: [{ name: 'styles.css', lang: 'css', content: '…', region: { start: 2, end: 2 } | null }],
  solution: [{ name, lang, content }],          // kompletní sada souborů (seed + změny)
  explain: null | { prompt, model, checklist: [{ key, text }] },         // kap. 3.7
  parsons: null | Parsons,                      // kap. 3.5
  approaches: [{ title, description, files: [{ name, lang, content }] }],  // kap. 3.8; [] když chybí
  review: null | { intro, rubric: [{ key, text }], extensions: '…markdown…' },   // kap. 3.9
  see: ['css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky'],     // [] když chybí
  meta: { …frontmatter… }                       // timeoutMs, main, maxChange se čtou odsud
}
```

`region.start`/`end` jsou 1-based čísla řádků ve výsledném obsahu, včetně.
Prázdná oblast má `end === start - 1` (kurzor jde na řádek `start`).

`lang` je přípona souboru (`html`, `css`, `js`, `json`, `vue`, `sql`, `sh`, `ts`, `md`…).

`loadModule(…, { includeSolutions: false })` z kroku, labu i projektu odstraní
`solution` a `approaches`. Všechno ostatní (včetně `help`, `explain`, `parsons`) zůstává.
Lab bez řešení navíc nese `approachesCount` (počet přístupů), aby UI vědělo, jestli
nabídnout „Jiné přístupy", a obsah načetlo přes `?solution=1` až po kliknutí.

### 3.3 Odstupňované nápovědy `# --help--`

````md
# --help--

## --tip--

Potřebuješ metodu, která z pole vyrobí **jedinou hodnotu**. Viz [[reduce]] v lekci
[Metody pole do hloubky](see:js-pole/metody-pole-do-hloubky#reduce).

## --tip-- 2

`reduce` dostane callback `(akumulátor, položka)` a počáteční hodnotu. Patří do
těla `totalPrice`.

## --tip-- 2

Stejný tvar má součet délek slov: `words.reduce((sum, word) => sum + word.length, 0)`.
````

- Sekce obsahuje jen bloky `## --tip--` (text mimo ně = ParseError). Každý tip je
  neprázdný markdown.
- `## --tip-- N` = tip patří k požadavku č. N (1-based pořadí v `# --hints--`).
  N mimo rozsah = ParseError. Bez N patří tip ke kroku celkově.
- Výstup: `help: [{ text, hintIndex }]`, `hintIndex` = `N - 1` nebo `null`, pořadí jako v souboru.
- **Pořadí stupňů je závazné:** 1. jaký koncept + odkaz na nadpis lekce,
  2. která vlastnost nebo metoda a kam ji dát, 3. vzor na jiných datech.
  **Řešení nikdy není tip** — poslední stupeň dodá platforma sama jako porovnání
  s řešením (diff, B2).
- UI: tlačítko „Potřebuju nápovědu (k ze n)" je vidět vždy; po 2 neúspěšných
  kontrolách v řadě (`failsSinceOk ≥ 2`, kap. 12.2) se zvýrazní a zvýrazní se tip
  k prvnímu selhanému požadavku (tip s jeho `hintIndex`, jinak další neotevřený tip
  bez `hintIndex`). Tipy se otevírají po jednom v pořadí. Po posledním tipu nabídne
  „Porovnat s řešením" (s potvrzením). Když krok `help` nemá, nabídne odkazy `see`
  a porovnání s řešením.
- Verify: tip, který obsahuje řádek řešení (kap. 10, pravidlo T1) = **chyba**;
  krok workshopu bez tipů mimo první třetinu = **varování**; krok s víc než 3 tipy
  = **varování**; lab s víc než 2 tipy = **varování**.

### 3.4 Oprava chyby `kind: debug`

````md
---
title: Kolegův markAllBought
kind: debug
runtime: js
see: js-pole/co-je-pole#typicke-chyby-a-pasti
---

# --description--

## Hlášení

Po kliknutí na „Označit vše" se sice všechno označí, ale tlačítko „Zpět" už nevrátí
původní stav. `markAllBought(groceries)` totiž mění i původní seznam.

## Úkol

Oprav `markAllBought` tak, aby vracela nové pole a původní nechala beze změny.
Změň co nejmenší kus kódu.

# --hints--

`markAllBought` vrátí položky s `bought: true`.

```js
…
```

Původní pole a jeho objekty zůstanou beze změny.

```js
…
```

# --seed--
…
# --solution--
…
````

- Popis musí obsahovat řádky `## Hlášení` a `## Úkol` (mimo bloky kódu), v tomto
  pořadí. Chybí-li = ParseError. Pod `## Hlášení` je popis chyby tak, jak ji nahlásil
  uživatel nebo kolega (co se čekalo, co se stalo, případně přesná chybová hláška).
- Čtyři kroky ladění **nepíše autor** — UI je vždy ukáže pod popisem:
  1. Zopakuj chybu (spusť kód, přečti hlášku nebo výstup).
  2. Najdi místo, kde se skutečnost rozchází s očekáváním.
  3. Oprav jednu věc.
  4. Ověř, že oprava funguje a nic dalšího se nerozbilo.
- Testy: aspoň jeden ověřuje opravu, aspoň jeden, že zbytek funguje dál.
- Seed obsahuje chybný kód, který jde spustit (chyba je v logice, ne v syntaxi).
- **Míra změny** (UI, neblokuje splnění): posuzované řádky = neprázdné řádky oblasti
  `--edit--`, když ji soubor má, jinak celých souborů, které se v řešení liší od seedu.
  `ratio` = počet posuzovaných řádků seedu, které v uživatelově verzi po řádkovém
  LCS diffu (řádky porovnané po `trim`) chybí ÷ počet posuzovaných řádků. Když
  `ratio > maxChange`, UI po úspěšné kontrole ukáže „Přepsal jsi víc než polovinu kódu
  — u opravy chyby jde o nejmenší změnu."
- Verify: řešení samo přesahuje `maxChange` = **varování**; debug krok bez `see` = doporučení.

### 3.5 Seřaď řádky `kind: parsons`

`````md
---
title: Seřaď počítání podle kategorie
kind: parsons
runtime: js
---

# --description--

Seřaď řádky tak, aby `countByCategory(items)` vrátila objekt s počtem položek
v každé kategorii. Odsazení nastavíš klávesou Tab. Dva řádky jsou navíc.

# --hints--

`countByCategory` vrátí počty podle kategorie.

```js
const items = [{ category: 'ovoce' }, { category: 'pečivo' }, { category: 'ovoce' }];
assert.deepEqual(countByCategory(items), { ovoce: 2, 'pečivo': 1 }, 'countByCategory(…) má spočítat ovoce: 2, pečivo: 1');
```

# --seed--

## --file-- script.js

```js
--edit--
--edit--

console.log(countByCategory([{ category: 'ovoce' }]));
```

# --parsons--

```js
function countByCategory(items) {
  return items.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
    return counts;
  }, __1__);
}
```

## --distractors--

```js
return counts + 1;
counts.push(item.category);
```

## --blanks--

```text
1: {}
1: Object.create(null)
```
`````

- `# --parsons--` má jako preambuli **přesně jeden** blok kódu = řádky ve správném
  pořadí se správným odsazením. Prázdné řádky se ignorují. Tabulátor v odsazení = ParseError.
- `indentUnit` = nejmenší kladný počet mezer na začátku řádku (2, když žádný řádek
  odsazený není). Odsazení, které není násobkem, = ParseError. `indent` = počet úrovní.
- `## --distractors--` (nepovinné): jeden blok kódu, každý neprázdný řádek (bez
  odsazení) je řádek navíc. Shoda s řádkem řešení (po `trim`) = ParseError.
- **Mezery k doplnění:** v řádcích značka `__N__` (N = 1, 2, …). Pak je povinné
  `## --blanks--`: jeden blok ` ```text `, řádky `N: odpověď`. První řádek s daným N
  je kanonická odpověď (jde do řešení), další řádky se stejným N jsou další přijatelné
  tvary. Porovnání přes `normalizeAnswer`. Značka bez odpovědi, odpověď bez značky nebo
  N, které nejde od 1 souvisle = ParseError.
- Seed musí mít **právě jeden** soubor s oblastí `--edit--` a ta musí být prázdná.
  Jiný počet = ParseError.
- `# --solution--` je zakázaná. Parser řešení vyrobí sám: do oblasti seedu vloží
  správné řádky (`' '.repeat(indent * indentUnit) + text`, mezery nahrazené kanonickou
  odpovědí).
- Kontrola: UI poskládá soubor stejně z uživatelova pořadí, odsazení a doplněných
  mezer (distraktory, které uživatel do řešení přetáhl, se vloží taky) a spustí
  **stejné `# --hints--`** jako u běžného kroku. Špatné odsazení kontrolu neshodí,
  UI ho jen označí. Ovládání myší i klávesnicí: šipky nahoru/dolů přesouvají řádek,
  Tab / Shift+Tab mění odsazení, Enter přesune řádek mezi „nabídka" a „řešení".

```js
// parsons →
{
  file: 'script.js',
  indentUnit: 2,
  lines: [{ text: 'function countByCategory(items) {', indent: 0 }, …, { text: '}, __1__);', indent: 1 }, …],
  distractors: ['return counts + 1;', 'counts.push(item.category);'],
  blanks: [{ number: 1, accept: ['{}', 'Object.create(null)'] }],   // accept[0] = kanonická
}
```

Verify: standardně seed (prázdná oblast) aspoň jednou selže a vygenerované řešení
projde; navíc pro každý další přijatelný tvar mezery se řešení s tímto tvarem
musí projít testy = jinak **chyba**. Parsons bez distraktorů = doporučení.

### 3.6 Štítky `kind: recall` a `kind: choose`

Chovají se jako běžný krok. UI jen ukáže štítek:

- `recall` — „Opakování bez návodu": krok zopakuje dřív naučenou věc (i z předchozí sekce).
- `choose` — „Vyber nástroj sám": popis nejmenuje metodu ani vlastnost, testy ji
  nevynucují (žádný regex na konkrétní metodu).

Slouží i verify k počítání (kap. 10).

### 3.7 Vysvětli vlastními slovy `# --explain--`

````md
# --explain--

Vysvětli vlastními slovy, proč `b.push(4)` změnilo i pole `a`.

## --model--

Proměnná neobsahuje pole, ale odkaz na něj. `const b = a` zkopíruje odkaz, takže
`a` i `b` ukazují na totéž pole a `push` ho mění pro obě jména.

## --checklist--

- Proměnná drží odkaz, ne celé pole.
- Přiřazení zkopíruje odkaz, ne pole.
- Kopii vyrobí `[...a]` nebo `a.slice()`.
````

- Preambule = zadání (`prompt`, povinné). `## --model--` (povinné) = vzorové vysvětlení.
  `## --checklist--` (povinné) = markdown seznam (`- `, `* ` nebo `1. `), každá položka
  jeden bod; text mimo položky seznamu = ParseError. Víceřádková položka pokračuje
  odsazenými řádky.
- Výstup: `explain: { prompt, model, checklist: [{ key: hashKey(text), text }] }`.
- UI: blok se ukáže **po splnění kroku** (a na požádání kdykoli dřív). Uživatel napíše
  text, pak uvidí model a zaškrtne body, které v jeho textu jsou. Text se připíše do
  poznámek sekce (kap. 12.5, `kind: 'explain'`), nezaškrtnuté body jdou do opakování
  jako `explain:<id kroku>#<klíč>` (kap. 12.3). Nic z toho nepodmiňuje splnění.
- Verify: checklist mimo 2–6 bodů = doporučení.

### 3.8 Lab: „Než začneš" a jiné přístupy `# --approaches--`

**Než začneš** nepíše autor. UI ho ukáže nad zadáním každého labu a projektu:

1. Zadání vlastními slovy (1–2 věty).
2. Čemu se to podobá (workshop nebo úloha, kterou už znáš).
3. Postup ve 3–7 krocích.
4. Jak ověříš první požadavek.

Vyplnění je nepovinné, odpovědi se připíšou do poznámek sekce (`kind: 'plan'`).

**Jiné přístupy** (jen `lab.md`):

`````md
# --approaches--

## --approach-- Cyklus for…of

Nejčitelnější, když potřebuješ víc hodnot najednou (součet i počet).

### --file-- script.js

```js
…celý soubor…
```

## --approach-- Math.min se spreadem

Kratší, ale na velkých polích může narazit na limit počtu argumentů.

### --file-- script.js

```js
…celý soubor…
```
`````

- Sekce obsahuje jen bloky `## --approach-- <název>` (název povinný). Každý má
  nepovinný popis (markdown) a aspoň jeden `### --file-- <jméno>` s jedním blokem kódu.
- Soubory se sloučí se seedem stejně jako `--solution--` (`mergeFiles`).
- Výstup: `approaches: [{ title, description, files }]`.
- UI je ukáže **až po splnění** labu (před splněním jen s potvrzením, jako řešení).
- Verify: každý přístup spustí proti testům labu — neprojde-li = **chyba** (buď je
  přístup špatně, nebo jsou testy příliš přísné). Počet mimo 2–4 = doporučení.

### 3.9 Rubrika `# --review--` (projekt, lab)

````md
# --review--

Testy kontrolují chování. Tohle zkontroluj sám, než projekt uzavřeš.

## --rubric--

- Jména funkcí a proměnných říkají, co dělají, bez komentáře.
- Stejný kód se neopakuje na třech místech.
- README popisuje, jak projekt spustit, a jedno rozhodnutí, které jsi udělal.
- Víš, co bys příště udělal jinak.

## --extensions--

Rozšíření bez testů: skutečné API místo souboru, nasazení na URL, stránkování.
````

- Preambule (nepovinná) = úvod. `## --rubric--` (povinné) = seznam bodů jako
  u checklistu. `## --extensions--` (nepovinné) = markdown „Rozšíření bez testů"
  (u projektů i „Rozšíření do portfolia").
- Výstup: `review: { intro, rubric: [{ key, text }], extensions }` (`intro`/`extensions` = `''`, když chybí).
- UI: vždy dostupné, po projití všech testů se zvýrazní. Zaškrtání se neukládá do postupu.

---

## 4. Otázky a kvíz

Otázka má jeden formát všude: v kvízu, v `# --questions--` lekce, v `:::check`
(kap. 5.4), v kartách (kap. 2.5, typy `output` a `css`) a v předpovědi (kap. 5.3,
zkrácený zápis).

### 4.1 Otázka s výběrem

```md
## --question--

Text otázky, klidně s kódem.

### --answer--

Špatná odpověď.

#### --why--

Proč je špatná — pojmenuje mylnou představu, správnou odpověď neprozradí.

### --correct--

Správná odpověď.

#### --why--

Proč je správná.

### --see--

css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky
```

- Aspoň 2 odpovědi, aspoň jedna `--correct--`. Víc správných = otázka s více volbami.
- `#### --why--` patří k odpovědi (nepovinné). Jiná sekce úrovně 4 = ParseError.
- `### --see--` (nepovinné) patří k otázce: reference (kap. 2.9), jedna na řádek.
- `### --why--` na úrovni otázky u otázky s výběrem = ParseError.

### 4.2 Otázka s psanou odpovědí

````md
## --question--

Co vypíše poslední řádek?

```js
const shopping = ['chleba', 'mléko'];
console.log(shopping.indexOf('máslo'));
```

### --expected--

-1

### --why--

`indexOf` vrací `-1`, když prvek nenajde. Proto `if (shopping.indexOf(x))` je past:
`-1` je pravdivá hodnota a `0` (první prvek) nepravdivá.

### --see--

js-pole/co-je-pole#hledani-v-poli
````

- Otázka **bez** `--answer--`/`--correct--` a **s** `### --expected--` je psaná.
  Kombinace obou druhů = ParseError. Otázka bez obojího = ParseError.
- `### --expected--` (povinné): obsah je buď **přesně jeden blok kódu** (bere se jeho
  obsah), nebo **prostý text** (bere se oříznutý text). Blok kódu a text zároveň = ParseError.
- `### --expected-- ignore-case` — porovnání bez ohledu na velikost písmen (pro
  slovní odpovědi). Jiný argument = ParseError.
- `### --accept--` (nepovinné): další přijatelné tvary. Když obsahuje bloky kódu,
  každý blok je jeden tvar (text mimo bloky = ParseError); jinak je každý neprázdný
  řádek jeden tvar (celý řádek doslova, bez odstraňování odrážek).
- `### --why--` (nepovinné, doporučené): vysvětlení, ukáže se po správné odpovědi
  nebo po odhalení. Smí obsahovat správnou odpověď.
- `### --see--` jako u 4.1.

**Normalizace** (`shared/answers.js`) — odpověď je správná, když
`normalizeAnswer(vstup) === normalizeAnswer(tvar)` pro `expected` nebo některý `accept`:

```js
export function normalizeAnswer(text, { ignoreCase = false } = {}) {
  let s = String(text ?? '').replace(/\r\n?/g, '\n');
  s = s.split('\n')
    .map((line) => line.trim().replace(/;+$/, '').trimEnd())   // koncový ; na řádku
    .filter((line) => line !== '')
    .join('\n');
  s = s.replace(/"/g, "'");                                     // " a ' jsou totéž
  s = s.replace(/[ \t]+/g, ' ');                                 // víc mezer = jedna
  s = s.replace(/ ?([^\p{L}\p{N}_$' \n]) ?/gu, '$1');            // mezery kolem interpunkce pryč
  return ignoreCase ? s.toLowerCase() : s;
}
```

Takže `[1, 2]` = `[ 1,2 ]`, `"a"` = `'a'`, `x = 1;` = `x=1`, ale `hello world` ≠ `helloworld`
a řádky zůstávají řádky.

`normalizeCss(text)` (karty `css`): rozdělí text podle `;`, každou neprázdnou deklaraci
`vlastnost: hodnota` převede na `vlastnost.trim().toLowerCase() + ':' + normalizeAnswer(hodnota).toLowerCase()`
(obsah v uvozovkách velikost písmen zachová) a vrátí seřazené deklarace spojené `;`.
Pořadí deklarací tedy nerozhoduje.

`checkTextAnswer(question, input)` → `boolean` (použije `normalizeCss` pro kartu `css`, jinak `normalizeAnswer`).

### 4.3 Kvíz (`quiz.md`)

Jednoduchý kvíz je jen řada otázek:

```md
---
pass: 0.8
---

## --question--
…

## --question--
…
```

Kvíz s **delším cizím kódem** (A15) používá sekce úrovně 1:

`````md
---
pass: 0.8
---

# --questions--

## --question--
…obecné otázky…

# --code-- Košík v e-shopu

## --file-- cart.js

```js
…40–120 řádků, psaných jiným stylem než workshop…
```

## --file-- format.js

```js
…
```

## --question--

Co vrátí `cartTotal(items)` na řádku 34, když je košík prázdný?

### --expected--

0

## --question--
…
`````

- Když soubor obsahuje aspoň jeden nadpis úrovně 1 `# --x--` (mimo bloky kódu),
  smí obsahovat jen `# --questions--` a `# --code-- <titulek>` (titulek povinný), každou
  libovolněkrát, v libovolném pořadí. Text mimo ně = ParseError. Jinak je celý soubor
  řada otázek (starý formát).
- `# --code--` obsahuje nejdřív 1–3 bloky `## --file-- <jméno>` (každý s jedním blokem
  kódu), pak aspoň jednu `## --question--`. Soubor po první otázce, žádný soubor,
  víc než 3 soubory nebo sada bez otázky = ParseError.
- `pass` = podíl správně zodpovězených otázek nutný ke splnění (výchozí 0.8).
- UI zamíchá odpovědi otázek s výběrem. Otázky jedné sady `# --code--` jdou za sebou
  a kód je v panelu vedle nich jen ke čtení, s čísly řádků.

### 4.4 Výstup parseru

```js
// Question (společný tvar pro kvíz, lekci, :::check i předpověď)
{ key: '9f86d081', type: 'choice', text, multiple: false, answers: [{ text, correct, why }], see: [] }
{ key: '1b4f0e98', type: 'text', text, expected: '-1', accept: [], ignoreCase: false, why: '…', see: ['js-pole/co-je-pole#hledani-v-poli'] }

// parseQuiz(md, { id }) →
{
  id, pass: 0.8,
  questions: [ Question & { code: null | 0 } ],     // code = index do codeSets
  codeSets: [{ title: 'Košík v e-shopu', files: [{ name: 'cart.js', lang: 'js', content }] }],   // [] ve starém formátu
}
```

`key = hashKey(text)` s příponou `-2`… při shodě v souboru (kap. 2.8). Id otázky pro
opakování a pokusy: `q:<id modulu>#<key>`.

Otázka s výběrem z předpovědi (kap. 5.3) má navíc `why` (text `--why--` celé otázky,
`''` když chybí); `why` jednotlivých odpovědí tam zůstává `''`.

### 4.5 Chování UI, které ovlivňuje obsah

- **Jistota:** u každé hodnocené otázky volí uživatel před odesláním „Jsem si jistý"
  nebo „Tipuju" (nepovinné). V obsahu se nic nepíše.
- **Otázka s výběrem neprozradí odpověď:** po prvním špatném pokusu jen ✗ a `why`
  **zvolené** odpovědi. Správná odpověď se ukáže po druhém neúspěchu nebo na kliknutí
  „Ukaž odpověď"; potom se volby znovu zamíchají. Proto `why` špatné odpovědi nesmí
  prozradit správnou. Po ukázání správné odpovědi je otázka zamčená; další pokus
  (`retry()`, v kvízu „Projít jen chybné") ji otevře a volby zamíchá jiným klíčem.
- **Psaná otázka:** po špatném pokusu ✗ „Zkus to znovu"; `expected` a `why` se ukážou
  po správné odpovědi, po druhém neúspěchu nebo na kliknutí. Pole je jednořádkové,
  když `expected` nemá nový řádek, jinak víceřádkové.
- Otázka je **vyřešená**, když ji uživatel zodpověděl správně nebo si odpověď nechal
  ukázat. Každé vyhodnocení se pošle do pokusů (kap. 12.2, id `q:…`).
- **Kvíz:** skóre prvního průchodu se ukládá zvlášť od nejlepšího (kap. 12.2
  `firstScore`). Souhrn ukáže chybné otázky s odkazy `see` a nabídne „Projít jen chybné".

---

## 5. Lekce (`lesson.md`)

### 5.1 Stavba

````md
# Flexbox: hlavní a vedlejší osa

:::check pretest
Co udělá `display: flex` s odstavci uvnitř kontejneru?

### --answer--
Nic, flex funguje jen na `<div>`.

### --correct--
Postaví je vedle sebe do řádku.
:::

## Problém: prvky vedle sebe

Výklad… **Mentální model v jedné tučné větě.**

:::live
```html
<div class="row"><div>1</div><div>2</div></div>
```
```css
.row { display: flex; gap: 1rem; }
```
:::

:::check
Která vlastnost určuje směr hlavní osy?

### --expected--
flex-direction
:::

## Kde to najdeš v MDN

…

# --questions--

## --question--
…stejný formát jako kvíz (kap. 4)…
````

- Tělo lekce je markdown s bloky `:::jméno [argumenty]` … `:::`. Otevírací i zavírací
  řádek musí být mimo blok kódu a sám na řádku. Bloky se nevnořují (vnořený nebo
  neuzavřený blok = ParseError). Neznámé jméno bloku = ParseError.
- `# --questions--` (nepovinné) je vždy na konci; za ním jen otázky.
- Nadpisy `##` a `###` dostávají kotvy (kap. 2.8).
- Lekce nemají živé ukázky pro node kromě předpovědi (`:::live node predict`).

### 5.2 Živá ukázka `:::live`

````md
:::live [dom|js|vue]
```html
…
```
```css
…
```
```js
…
```
```controls
--justify: select(flex-start, center, space-between) = flex-start | Zarovnání
--gap: range(0, 3, 0.5, rem) = 1 | Mezera
--wrap: toggle(nowrap, wrap) | Zalomení
```
:::
````

- Výchozí runtime `dom`; `:::live js` pro čistý JS s konzolí; `vue` jako `dom`.
- Uvnitř jen bloky kódu `html`, `css`, `js` (každý jazyk nejvýš jednou; mapují se na
  `index.html`, `styles.css`, `script.js`) a nejvýš jeden blok `controls`. Text mimo
  bloky kódu = ParseError. Aspoň jeden soubor.
- `index.html` u živé ukázky je jen tělo stránky, CSS i JS se připojí automaticky.
- Uživatel si ukázku může upravit a vidí výsledek hned. Tlačítko „Obnovit" vrátí originál.

**Ovládací prvky** (` ```controls `, jen runtime `dom` a `vue`; jinde ParseError).
Každý neprázdný řádek je jeden prvek:

```
--jméno: select(hodnota, hodnota, …) [= výchozí] [| Popisek]
--jméno: range(min, max, krok[, jednotka]) [= výchozí] [| Popisek]
--jméno: toggle(vypnuto, zapnuto) [= výchozí] [| Popisek]
```

- `--jméno` odpovídá `/^--[a-z][a-z0-9-]*$/`, v bloku jedinečné.
- Hodnoty `select`/`toggle` jsou holé (bez `,` `(` `)` `"`) nebo v uvozovkách `"repeat(3, 1fr)"`.
  `select` aspoň 2 hodnoty, `toggle` přesně 2.
- `range`: čísla `min < max`, `krok > 0`, jednotka nepovinná (`px`, `rem`, `%`, `fr`…; bez jednotky `unit: ''`).
- Výchozí hodnota: u `select`/`toggle` první hodnota, u `range` `min`. Výchozí mimo
  povolené hodnoty nebo rozsah = ParseError. Popisek chybí → popisek = jméno bez `--`.
- CSS ukázky používá `var(--jméno)`. Hodnota prvku se nastaví jako custom property na
  `:root` stránky náhledu (`mountPreview(...).setCssVariables`, kap. 6.7). Vedle
  ovládání UI živě ukazuje každou deklaraci z `styles.css`, jejíž hodnota obsahuje
  `var(--jméno`, s dosazenou hodnotou (`justify-content: center;`).
- Pro běh bez UI (verify, první vykreslení) se na začátek `styles.css` předřadí
  `:root { --jméno: výchozí; … }` (soubor vznikne, když chybí).

```js
// Control
{ name: '--justify', type: 'select', label: 'Zarovnání', options: ['flex-start', 'center', 'space-between'], default: 'flex-start' }
{ name: '--gap', type: 'range', label: 'Mezera', min: 0, max: 3, step: 0.5, unit: 'rem', default: 1 }
{ name: '--wrap', type: 'toggle', label: 'Zalomení', options: ['nowrap', 'wrap'], default: 'nowrap' }
// hodnota v CSS: range → `${n}${unit}`, jinak zvolená option
```

Verify: ukázka (s výchozími hodnotami) běží bez `errors`; `--jméno`, které se v CSS
nepoužije = **varování**.

### 5.3 Předpověď `:::live … predict`

````md
:::live js predict
```js
const a = [1, 2, 3];
const b = a;
b.push(4);
console.log(a.length);
```
--question-- Co vypíše `console.log`?
--expected-- 4
--why-- `b` není kopie, ale druhý odkaz na totéž pole.
:::

:::live predict
```html
<div class="row"><p>Dlouhý text…</p><img src="…" alt=""></div>
```
```css
.row { display: flex; }
```
--question-- Co se stane s obrázkem, když se text nevejde?
--option-- Text se zalomí pod obrázek.
--option*-- Obrázek se zmenší.
--option-- Kontejner přeteče doprava.
--why-- Flex položky mají `flex-shrink: 1`, zmenšují se všechny.
:::

:::live node predict
```js
import { readFile } from 'node:fs/promises';
console.log('A');
readFile('data.txt', 'utf8').then(() => console.log('B'));
console.log('C');
```
--question-- V jakém pořadí se vypíší písmena?
--output--
```text
A
C
B
```
:::
````

- Hlavička: `:::live [dom|js|vue|node] predict`. Runtime `node` je povolený jen s `predict`.
- Nejdřív bloky souborů jako u 5.2 (u `node` jen jeden blok `js` → `index.js`),
  pak **značky**: řádek mimo blok kódu, který začíná `--question--`, `--expected--`,
  `--accept--`, `--why--`, `--option--`, `--option*--`, `--output--` nebo `--see--`.
  Obsah značky = zbytek řádku + následující řádky až po další značku nebo `:::`
  (smí obsahovat bloky kódu). Text před první značkou mimo bloky souborů = ParseError.
  Blok `html`/`css`/`js`/`controls` v obsahu `--expected--`, `--accept--`, `--output--`
  nebo `--see--` = ParseError; v `--question--`, `--why--` a `--option--` je to obyčejný
  markdown (ukázka kódu v textu). `controls` s `predict` = ParseError.
- `--question--` povinná, jednou. `--option--`/`--option*--` (hvězdička = správná):
  otázka s výběrem (aspoň 2, aspoň jedna správná). Jinak psaná otázka:
  `--expected--` (obsah jako v 4.2: jeden blok kódu, nebo text), `--accept--` (každý
  neprázdný řádek jeden tvar). `--why--` a `--see--` jako v kap. 4.
- **dom/vue**: jen otázka s výběrem (`--expected--` = ParseError).
- **js**: psaná i s výběrem. Skutečný výstup = `logs.map((l) => l.text).join('\n')`
  z běhu ukázky.
- **node**: `--output--` povinné (skutečný výstup napsaný autorem, obsah jako
  `--expected--`); nic se nespouští. `--expected--` nepovinné, výchozí = `--output--`.
  U ostatních runtime je `--output--` ParseError.
- UI: náhled i konzole jsou skryté, dokud student nenapíše tip (nebo nezvolí možnost)
  nebo neklikne „Nevím, ukaž". Pak se tip ukáže vedle skutečnosti (u js skutečná
  konzole, u node `output`) a kód jde upravovat. Předpověď se nehodnotí do splnění
  lekce a nejde do opakování.

```js
{ kind: 'live', runtime: 'js', files: [...], controls: [], predict: Question, output: null }
{ kind: 'live', runtime: 'node', files: [{ name: 'index.js', lang: 'js', content }], controls: [], predict: Question, output: 'A\nC\nB' }
```

Verify: **js** psaná předpověď — `normalizeAnswer(skutečný výstup) !== normalizeAnswer(expected)`
= **chyba** (`accept` se neověřuje). Ukázka dom/vue/js běží bez `errors` (jinak chyba).

### 5.4 Kontrolní otázka `:::check` a otázky předem

````md
:::check
Proč `shopping[5]` nespadne?

### --answer--
Pole se samo prodlouží.

#### --why--
Čtení pole nikdy nemění.

### --correct--
Neexistující index vrátí `undefined`.
:::

:::check pretest
Co myslíš, co vypíše `[1, 2] === [1, 2]`?

### --expected--
false
:::
````

- Obsah bloku = **jedna** otázka ve formátu kap. 4.1/4.2 bez řádku `## --question--`
  (preambule = text otázky).
- `:::check pretest` = otázka předem. Nehodnotí se: po odpovědi UI ukáže
  „Uvidíme za chvíli" a odpověď (bez ✗), nejde do pokusů ani do opakování.
  Pretest za prvním nadpisem `##` = **varování**. Jiný argument než `pretest` = ParseError.

```js
{ kind: 'check', pretest: false, question: Question }
```

### 5.5 Vysvětli vlastními slovy `:::explain`

````md
:::explain
Vysvětli, proč `const` pole nezabrání `push`.

## --model--
`const` hlídá proměnnou, ne hodnotu…

## --checklist--
- `const` zakazuje nové přiřazení do proměnné.
- Obsah pole jde měnit dál.
:::
````

Stejný obsah a chování jako `# --explain--` (kap. 3.7). V lekci se ukáže hned (není
co splnit). Id bodů checklistu pro opakování: `explain:<id modulu lekce>#<klíč>`.

```js
{ kind: 'explain', prompt, model, checklist: [{ key, text }] }
```

### 5.6 Stavy paměti `:::memory`

````md
:::memory
```js
const a = [1, 2];
const b = a;
b.push(3);
```
--step-- 1
a -> @arr
@arr: [1, 2]
--step-- 2 | b = a nezkopíruje pole
a -> @arr
b -> @arr
@arr: [1, 2]
--step-- 3
a -> @arr
b -> @arr
@arr: [1, 2, 3]
:::
````

- První obsah bloku je **přesně jeden** blok kódu (ukázka jen ke čtení).
- Pak kroky `--step-- N [| popisek]`: stav **po** provedení řádku N (1-based, v rozsahu kódu).
  Bez popisku je `label: ''`.
  Aspoň jeden krok, jinak ParseError.
- Řádky kroku:
  - `jméno = hodnota` — proměnná s primitivní hodnotou (`count = 3`, `name = 'Ema'`),
  - `jméno -> @id` — proměnná s odkazem na objekt,
  - `@id: text` — objekt; `text` je jeho zápis (`[1, 2]`, `{ name: 'Ema', tags: @tags }`)
    a smí obsahovat odkazy `@id` na další objekty.
  - `id` = `[a-z0-9-]+`. Odkaz na objekt, který v témže kroku není definovaný = ParseError.
- UI kreslí proměnné vlevo, objekty vpravo a odkazy jako šipky; krokuje šipkami
  a zvýrazní řádek N v kódu. Kód se nespouští ani neinstrumentuje.

```js
{
  kind: 'memory',
  code: { lang: 'js', content },
  steps: [{
    line: 2, label: 'b = a nezkopíruje pole',
    bindings: [{ name: 'a', value: null, ref: 'arr' }, { name: 'count', value: '3', ref: null }],
    objects: [{ id: 'arr', text: '[1, 2]', refs: [] }],
  }],
}
```

Automatické krokování (`:::trace js`) je plánované (kap. 13); formát `:::memory` zůstane.

### 5.7 Porovnání `:::compare`

````md
:::compare
```html
<div class="wrap"><div class="box">Široký box</div><div class="box">Druhý</div></div>
```
```css
.wrap { width: 300px; outline: 1px solid; }
.box { width: 2000px; }
```
--variant-- Normální tok
```css
.wrap { display: block; }
```
--variant-- Flexbox
```css
.wrap { display: flex; }
```
:::
````

- Runtime vždy `dom`. Nejdřív společné bloky (`html`/`css`/`js`, každý jazyk nejvýš
  jednou), pak **přesně dvě** značky `--variant-- <popisek>` (popisek povinný), každá
  s aspoň jedním blokem `html`/`css`/`js`.
- Blok varianty se **připojí** za společný soubor stejného jazyka (`společný + '\n' + variantní`);
  když společný soubor chybí, vznikne. Parser vrací už sloučené soubory.
- UI ukáže dva náhledy vedle sebe (na úzkém displeji pod sebou), každý s popiskem;
  úprava společného kódu se promítne do obou.

```js
{ kind: 'compare', runtime: 'dom', variants: [{ label: 'Normální tok', files: [...] }, { label: 'Flexbox', files: [...] }] }
```

Verify: obě varianty běží bez `errors`; varianty se shodnými soubory = **chyba**.

### 5.8 Splnění lekce

Lekce je splněná, když uživatel vyřeší (kap. 4.5) všechny `:::check` bez `pretest`
a všechny otázky z `# --questions--` a klikne „Mám přečteno". Bez takových otázek
stačí tlačítko. Předpovědi, pretest, `:::explain` a `:::memory` splnění nepodmiňují.
Splnění lekce nepodmiňuje nic jiného (nic se nezamyká).

### 5.9 Výstup parseru

```js
// parseLesson(md, { id }) →
{
  id,
  title: 'Flexbox: hlavní a vedlejší osa',       // text prvního nadpisu `#` v těle, jinak ''
  headings: [{ level: 2, text: 'Problém: prvky vedle sebe', anchor: 'problem-prvky-vedle-sebe' }],
  blocks: [
    { kind: 'md', text },
    { kind: 'live', runtime, files: [{ name, lang, content }], controls: Control[], predict: Question | null, output: string | null },
    { kind: 'check', pretest, question: Question },
    { kind: 'explain', prompt, model, checklist },
    { kind: 'memory', code, steps },
    { kind: 'compare', runtime: 'dom', variants },
  ],
  questions: Question[],
}
```

Klíče otázek (`key`) se počítají přes všechny otázky lekce dohromady (`:::check` i
`# --questions--`) v pořadí souboru, takže přípony `-2` jsou jednoznačné v celém souboru.

### 5.10 Plánované bloky

`:::trace js`, `:::specificita`, `:::regex`, `:::eventloop` — viz kap. 13. Do té doby
je parser odmítá jako neznámé bloky.

### 5.11 Zvýraznění v textu: rámečky a barvy (platí pro veškerý markdown)

Výklad má být **střídmě barevný**: důležité věci musí na první pohled vyskočit, ale
stránka nesmí být přeplácaná. Platí pro každý markdown, který UI vykresluje — `md` bloky
lekce, `# --description--` a text nápověd kroku/labu/projektu, tipy `## --tip--`,
`--why--`, `tahak.md`, `intro` sekce.

**Rámečky** jsou citace ve stylu GitHub alerts — čistý markdown, parser je nechává jako
text `md` bloku (nejsou to `:::` bloky):

```md
> [!REMEMBER]
> **Proměnná neobsahuje pole, ale odkaz na něj.** Dvě proměnné můžou ukazovat na totéž pole.

> [!PITFALL]
> `sort()` bez porovnávací funkce řadí čísla jako text: `[10, 9, 1].sort()` → `[1, 10, 9]`.

> [!TIP]
> V DevTools u flex kontejneru klikni na odznak `flex` a uvidíš osy.

> [!NOTE]
> K `this` se dostaneme v sekci Closures, `this` a funkcionální styl.
```

| značka | nadpis v UI | barva (token) | ikona | použití |
|---|---|---|---|---|
| `[!REMEMBER]` | Zapamatuj si | `--callout-remember-*` (modrá/akcent) | záložka | mentální model, pravidlo, které musí znát zpaměti |
| `[!PITFALL]` | Pozor, past | `--callout-pitfall-*` (oranžová) | výstraha | typická chyba a její příznak |
| `[!TIP]` | Tip | `--callout-tip-*` (zelená) | žárovka | praktická rada, zkratka, DevTools |
| `[!NOTE]` | Poznámka | `--callout-note-*` (šedá) | info | odbočka, odkaz na pozdější sekci |

- Řádek se značkou je jen `> [!TYP]` (volitelně `> [!TYP] Vlastní nadpis`); obsah jsou
  další řádky citace a smí obsahovat kód, seznamy i `[[pojmy]]`.
- Neznámý typ = vykreslí se jako obyčejná citace; verify dá varování `[M1]`.
- Rámeček se nevnořuje a nepatří do bloku kódu (tam se nehledá).

**Barvy textu** (dělá je UI, autor nic nepíše navíc):

- `**tučné**` = barva `--text-strong-accent` (tlumený akcent, ne křiklavý) a váha 650.
  Proto tučně jen opravdu klíčové věty a pojmy — nejvýš ~1 tučné místo na odstavec.
- `` `inline kód` `` = vlastní podbarvení `--code-inline-bg` a barva `--code-inline-fg`.
- `[[pojem|text]]` = tečkované podtržení v barvě `--term-fg`, popover s definicí (kap. 2.6).
- `==zvýraznění==` = podbarvení jako zvýrazňovač `--mark-bg`; jen pro 1–3 slova, která
  se právě mění nebo porovnávají (nejvýš 2× na lekci).
- Nadpisy `##` mají akcentní proužek vlevo nebo barevné číslo části.

Tokeny jsou v `client/src/styles/tokens.css` ve světlé i tmavé variantě
(`[data-theme="dark"]`); kontrast textu vůči pozadí rámečku aspoň 4.5:1.

---

## 6. Běh testů

### 6.1 Společný požadavek a výsledek

```js
// RunRequest
{
  runtime: 'dom' | 'js' | 'vue' | 'node',
  files: [{ name: 'index.html', content: '…' }],
  hints: [{ text, test }],
  timeoutMs: 5000,         // na jeden test; výchozí dom/js/vue 5000, node 10000; frontmatter timeoutMs přebíjí
  signal,                  // nepovinné, jen v prohlížeči: AbortSignal zruší kontrolu
  storage,                 // nepovinné, jen dom/js/vue: { localStorage: { klíč: 'text' }, sessionStorage: {…} } — naplní úložiště v paměti před spuštěním kódu (kap. 13)
}

// RunResult
{
  ok: false,                                // všechny testy prošly
  results: [
    { index: 0, pass: true },
    { index: 1, pass: false,
      error: 'sum([1, 2]) má vrátit 3',     // zpráva aserce (vlastní, nebo vygenerovaná česky)
      errorName: 'AssertionError',          // jméno třídy chyby: AssertionError, TypeError, …
      operator: 'strictEqual',              // jen u asercí
      actual: '4',                          // jen u asercí, které porovnávají; formatValue, max 2000 znaků
      expected: '3',
      generatedMessage: false,              // true = zprávu vyrobil assert, ne autor
      diff: [{ path: 'items[2].price', actual: '5', expected: '6' }] },   // jen deepEqual/deepStrictEqual, max 10 položek
    { index: 2, pass: false, skipped: true, error: '…' },
  ],
  logs: [{ level: 'log' | 'info' | 'warn' | 'error', text: 'Ahoj' }],   // konzole uživatelova kódu
  errors: ['ReferenceError: x is not defined (script.js:3)'],          // nezachycené chyby uživatelova kódu
  syntaxError: null | { file: 'script.js', line: 3, column: 14, message: "Unexpected token ')'" },
  runnerError: undefined | 'česká zpráva',  // selhal runner sám (nedostupné API, spadlá stránka), ne test
}
```

- Test je **tělo async funkce**: smí používat `await`, projde, když nevyhodí výjimku,
  selže výjimkou nebo po překročení `timeoutMs`. Každý test běží v **čerstvém
  prostředí** (nový iframe / nový proces), aby se testy neovlivňovaly.
- `actual`, `expected`, `operator`, `generatedMessage` jsou u **každé** selhané aserce,
  která je má (`equal`, `notEqual`, `deepEqual`, `notDeepEqual`, `match`, `doesNotMatch`,
  `ok`/`assert(v)` s `expected: 'true'`), **i když má aserce vlastní zprávu**.
  Chybí u `fail`, `throws`, `rejects` bez porovnání a u ne-asercí. `diff` = cesty k lišícím
  se listům (`a.b[2]`), u přidaného nebo chybějícího klíče `actual`/`expected` = `'(chybí)'`.
  Vygenerované zprávy jsou česky (`Očekávám 3, ale kód vrátil 4`).
- `skipped: true` — test se nespustil: stránka se zasekla už při načítání (runner po
  prvním selhání zbylé nespouští, jinak by kontrola trvala `timeoutMs × počet testů`),
  kontrola byla zrušena, nebo kód nejde spustit.
- **Kód nejde spustit** (`syntaxError` není `null`): runner před spuštěním naparsuje
  každý JS uživatele přes `acorn` (`ecmaVersion: 'latest'`; soubory `.js`/`.mjs`/`.cjs`
  kroku a inline `<script>` bez `src` s typem prázdným, `text/javascript` nebo `module`).
  Chyba = kód nejde naparsovat **ani** jako `script`, **ani** jako `module`. Pak se
  žádný test nespustí, `ok: false`, všechny `results` jsou
  `{ index, pass: false, skipped: true, error: 'Neověřeno — kód nejde spustit' }`,
  `syntaxError` nese první chybu (řádek a sloupec 1-based v souboru; u inline skriptu
  v `index.html`) a `errors` obsahuje `SyntaxError: <message> (<file>:<line>)`.
  UI ukáže nahoře „Kód nejde spustit" s tlačítkem „Skočit na řádek N".
  U projektu s `cwd` (kap. 9) se syntaxe předem nekontroluje.
- `logs` a `errors` se berou z prvního spuštění. U runtime node se `logs` berou
  z prvního testu, který nějaké logy má (stdout → `log`, stderr → `error`).

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
| `helpers.waitFor(fn, timeoutMs = 2000)` | čeká, dokud `fn()` (i async) nevrátí pravdivou hodnotu; vrátí ji. Výjimku z `fn` bere jako „zatím ne"; po vypršení vyhodí s poslední hláškou. |

### 6.3 Runtime `dom`

Stránka poskládaná z `index.html`. Odkazy `<link rel="stylesheet" href="X">`
a `<script src="X">` na soubory kroku se nahradí vloženým `<style>`/`<script>`
se stejnými atributy (`type="module"` zůstává). Když `index.html` chybí,
vytvoří se prázdná stránka, do které se připojí všechny `.css` a `.js` soubory.
`index.html` bez doctype a `<html>/<head>/<body>` se bere jako tělo stránky;
nepřipojené CSS/JS se připojí samo (JS s `import`/`export` jako modul).
Každý vložený skript končí `//# sourceURL=akademie/<soubor>` (čísla řádků se nemění),
aby v DevTools byl vidět pod svým jménem.

Test běží **uvnitř iframe náhledu**, takže `document`, `window`,
`getComputedStyle` jsou dokumenty uživatelovy stránky. Test se spustí po události
`load` a po dokončení synchronních skriptů uživatele. Iframe má výchozí velikost
**1024×768**; test čeká, až layout velikost iframu převezme. `alert/confirm/prompt`
v testu jdou do `logs` (`confirm` → `false`, `prompt` → `null`).

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
| `assert` | `node:assert/strict` (výsledek selhání má `actual`/`expected` jako v 6.1) |
| `files`, `helpers.stripComments`, `helpers.normalize`, `helpers.wait`, `helpers.waitFor` | jako 6.2 |
| `helpers.dir` | absolutní cesta pracovního adresáře |
| `await helpers.importFile(name)` | dynamický import souboru z adresáře (bez cache) |
| `await helpers.run(cmd, { timeoutMs = 10000, input })` | spustí příkaz v shellu (`bash -c`) v adresáři → `{ code, stdout, stderr }`; při timeoutu `{ code: null, timedOut: true, … }` |
| `await helpers.startServer(file, { port, env, timeoutMs = 5000 })` | spustí `node file` s `PORT` (volný port, když nezadáš) a počká, až port přijímá spojení → `{ url, port, output(), stop() }`. `url` je `http://127.0.0.1:PORT` (nebo `http://[::1]:PORT`, když server poslouchá jen na IPv6). Po testu se zastaví sám. |
| `fetch` | globální `fetch` Node |

`logs` = stdout/stderr uživatelova hlavního souboru, jen když ho test spustil
přes `helpers.run`/`startServer` (jinak prázdné). `errors` = prázdné.

### 6.7 Rozhraní modulů runneru

```js
// client/src/runner/index.js  (prohlížeč)
export async function runTests(request /* RunRequest */) /* → RunResult */
//   dom/js/vue běží lokálně v iframech; node → POST /api/run-node. request.signal (AbortSignal) kontrolu zruší.
export function mountPreview(container /* HTMLElement */, { runtime, files, viewport = null }) /* → Preview */
//   živý náhled: iframe (dom/vue) nebo panel konzole (js); node → jen tlačítko „Spustit" v UI

// Preview
{
  update({ runtime, files }),
  destroy(),
  onConsole(cb) /* → odhlášení */,
  //   cb({ level: 'log'|'info'|'warn'|'error'|'clear', text, uncaught?: true, file?: 'script.js', line?: 3, column?: 5 })
  //   file/line/column u nezachycených chyb, když jsou známé (pro označení řádku v editoru)
  setViewport(viewport /* { width: 1024, height: 768 } | null */),
  //   null = náhled vyplní panel; jinak iframe v dané velikosti zmenšený (CSS transform), aby se vešel
  setCssVariables(vars /* { '--justify': 'center' } */),
  //   nastaví custom properties na :root stránky bez znovunačtení (kap. 5.2)
  openInNewTab(),
  //   otevře stránku v nové kartě (Blob URL) se stejným skládáním a ochranou smyček, pro skutečné DevTools; → false, když ji prohlížeč zablokoval
  viewport(),
  //   → aktuální { width, height } | null (poslední setViewport)
}

export async function inspectCss({ runtime, files, declarations, signal }) /* → [{ id, property, reason, elements }] */
//   složí stránku v neviditelném iframu 1024×768 a vrátí neaktivní deklarace (lint „neaktivní CSS")

// client/runner.html — stránka bez UI, vystaví: window.akademieRunner = { runTests, mountPreview, inspectCss }

// server/node-runner.js  (Node)
export async function runNodeTests({ files, hints, timeoutMs = 10000, cwd = null, signal }) /* → RunResult */
export async function runNodeFile({ files, main, timeoutMs = 5000, cwd = null }) /* → { code, stdout, stderr, timedOut } */
```

Přepínač šířky náhledu (nastavení `previewWidth`, kap. 12.6) mapuje:
`tests` → `{ width: 1024, height: 768 }`, `768` → `{ width: 768, height: 1024 }`,
`375` → `{ width: 375, height: 667 }`, `panel` → `null`.

### 6.8 Izolace a nekonečné smyčky (povinné)

Uživatel píše kód živě — `while (true)` napůl dopsaný v editoru nesmí zamrazit aplikaci.

- Uživatelův kód **i test** běží uvnitř iframu `sandbox="allow-scripts allow-modals allow-forms"`
  **bez `allow-same-origin`** (neprůhledný origin, v Chromu mimo hlavní vlákno aplikace).
  Test se do stránky vloží jako skript a s rodičem komunikuje jen přes `postMessage`
  (výsledek, konzole, chyby, požadavek na `resize`, `set-vars`). Rodič drží watchdog:
  po `timeoutMs` iframe odstraní a test označí jako selhaný („Test nedoběhl včas —
  nekonečná smyčka?"). Watchdog přidává rezervu +2000 ms na načtení a +1000 ms od
  startu testu, aby dřív zasáhl časovač testu nebo ochrana smyček s konkrétní hláškou.
- Testovací iframy jsou **průhledné v rohu okna** (ne mimo obrazovku — Chrome by
  přestal vykreslovat).
- **Ochrana smyček**: každý uživatelův JS (inline skripty v HTML, `.js` soubory, moduly)
  se před spuštěním přepíše přes `acorn` + `acorn-walk`: do těla každého `for`, `for…in`,
  `for…of`, `while`, `do…while` se vloží kontrola, která vyhodí
  `Error('Smyčka běží příliš dlouho — nekonečná smyčka? (řádek N)')`, když jedna smyčka
  běží déle než 1000 ms (v náhledu) nebo `timeoutMs` (v testu). Tělo bez složených
  závorek se obalí. Čísla řádků v chybách odpovídají původnímu kódu.
  Kód, který nejde naparsovat: **testy** se nespustí (kap. 6.1, `syntaxError`),
  **náhled** ho spustí beze změny (prohlížeč sám ohlásí syntaktickou chybu).
- Náhled vue (`/vendor/vue.esm-browser.js`) se z neprůhledného originu načítá přes CORS:
  server na `/vendor/*` posílá `Access-Control-Allow-Origin: *`. Absolutní URL předává
  rodič (`location.origin`).
- **Headless Chromium (verify, E2E) se musí spouštět s `--site-per-process`**, jinak
  sandboxované iframy nejsou v odděleném procesu a nekonečná smyčka zamrazí stránku.
  Běžný Chrome izoluje sám.
- Sandboxované iframy sdílejí jeden proces: zaseknutý test na chvíli zdrží i živý
  náhled. Při odchodu z obrazovky se kontrola ruší (`AbortSignal`).
- Ve verify i v UI se používá **stejný** runner — to, co projde ve verify, projde uživateli.

### 6.9 České vysvětlení chyb (`shared/errors-cs.js`)

```js
explainError(text /* 'TypeError: Cannot read properties of undefined (reading \'name\')' */) →
  null | {
    id: 'cannot-read-undefined',
    title: 'Čteš vlastnost z hodnoty undefined.',       // jedna česká věta
    causes: ['Index nebo klíč neexistuje.', 'Funkce nic nevrací (chybí return).'],   // 2–3 nejčastější příčiny
    see: 'js-pole/co-je-pole#typicke-chyby-a-pasti' | null,
    match: { name: 'name' },                             // zachycené části hlášky (nepovinné)
  }
```

~40 vzorů (JS, DOM, Node: `Cannot read properties of undefined`, `x is not a function`,
`x is not defined`, `Unexpected token '<'… JSON`, `EADDRINUSE`, `ERR_MODULE_NOT_FOUND`,
`Cannot set headers after they are sent`…). UI ukáže větu, příčiny a odkaz pod
testem nebo v konzoli; anglický originál zůstane pod tím. Nenapsané funkce
(víc `ReferenceError: x is not defined` pro různá jména) UI sloučí do jednoho řádku.
Reference `see` ověřuje verify stejně jako v obsahu (kap. 2.9).

---

## 7. HTTP API serveru

Server: `node server/index.js`, port z `PORT` (výchozí **4300**). Exportuje
`createApp({ contentDir, dataDir, projectsDir, distDir }) → http.Server` (neposlouchá),
aby ho šlo spustit z testů a z verify.

Ve vývoji běží Vite (`npm run dev`, port **5300**) a proxuje `/api` a `/vendor` na 4300.
V produkci (`./start.sh`) server servíruje `dist/` a pro neznámé cesty bez přípony vrací
`dist/index.html` (SPA).

Všechna těla jsou JSON objekty. Chyby: `{ error: 'česká zpráva' }` se stavem:
400 neplatný vstup/slug/id, 403 cizí Host/Origin, 404 neexistující modul/adresa,
405 metoda, 409 konflikt stavu (`check` před `start`, dev-process neběží),
413 tělo nad 5 MB, 500 rozbitý obsah (`ParseError`) nebo chyba serveru.

**Ochrana:** požadavky s `Host` mimo `localhost`/`127.0.0.1`/`::1` → 403; POST/PUT/DELETE
s `Origin` mimo loopback → 403 (ochrana proti DNS rebindingu a CSRF — server spouští kód).
Poslouchá jen na `127.0.0.1`.

| metoda a cesta | tělo | odpověď |
|---|---|---|
| `GET /api/curriculum` | — | výstup `loadCurriculum` (kap. 2.1) |
| `GET /api/module/:section/:module` | — | výstup `loadModule(…, { includeSolutions: false })` |
| `GET /api/module/:section/:module?solution=1` | — | totéž i s řešeními a přístupy |
| `GET /api/section/:section` | — | výstup `loadSection` (kap. 2.7); 404, když sekce není na disku |
| `GET /api/terms` | — | výstup `loadTerms` (kap. 2.7) |
| `GET /api/progress` | — | `Progress` (viz 8) |
| `PUT /api/progress/code` | `{ id, files: [{ name, content }] }` | `{ ok: true }` — rozpracovaný kód |
| `POST /api/progress/complete` | `{ id, score? }` | `{ ok: true, progress }` |
| `POST /api/progress/reset` | `{ id }` | kap. 8 → `{ ok: true, progress }` |
| `POST /api/run-node` | `RunRequest` (runtime node, bez `cwd`) | `RunResult` |
| `POST /api/run-node-file` | `{ files, main, timeoutMs? }` | `{ code, stdout, stderr, timedOut }` |
| `POST /api/project/:section/:module/start` | — | zkopíruje `starter/` do `moje-projekty/<section>--<module>/`, pokud tam ještě nic není → `{ dir, created }` |
| `GET /api/project/:section/:module/files` | — | `{ dir, exists, files: [{ name, lang, content }] }` |
| `POST /api/project/:section/:module/check` | — | jen `runtime: node`: `runNodeTests` s `cwd` projektu a `timeoutMs` z frontmatteru → `RunResult`. U `dom` vrací 400 a klient testuje sám nad `files`. 409 před `start`. |
| `GET /vendor/vue.esm-browser.js` | — | `node_modules/vue/dist/vue.esm-browser.js`, s hlavičkou `Access-Control-Allow-Origin: *` |
| nástroje | | kap. 12 (pokusy, opakování, jistota, poznámky, nastavení, statistiky, dev-process) |

Server nikdy nespouští kód mimo `/api/run-node*`, `/api/project/*/check` a `/api/dev-process/*`.
Souběžné node úlohy (`run-node*`, `check`) omezuje fronta; když klient spojení zavře,
běh se zruší.

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
- `complete` se `score` uloží nejlepší skóre (kvíz). Skóre prvního průchodu je
  v pokusech (`firstScore`, kap. 12.2).
- `lastVisited` nastavuje `PUT /api/progress/code` i `complete` (pro „Pokračovat";
  UI vede na první nesplněný krok od `lastVisited`).
- **Reset** `POST /api/progress/reset { id }` (id sekce, modulu nebo kroku) smaže
  v `progress.json` splnění, skóre a kód pro `id` a všechna id začínající `id + '/'`,
  **a navíc** v `pokusy.json` záznamy, které k id patří, a v `opakovani.json` položky,
  jejichž `itemTarget` k id patří (kap. 2.10). Poznámky, jistota a nastavení zůstávají.
- Zápis je atomický (zapsat do `.tmp`, pak `rename`). Poškozený soubor se přejmenuje na
  `<soubor>.broken-<čas>` a začne se prázdným. Totéž platí pro všechny soubory v kap. 12.

---

## 9. Projekty (VS Code)

- `project.md` má `# --description--` (zadání, uživatelské příběhy), `# --hints--`
  (testy = uživatelské příběhy), nepovinně `# --help--` a `# --review--`. Seed a řešení
  jsou složky `starter/` a `solution/`.
- UI ukáže „Než začneš" (kap. 3.8), zadání, tlačítko **Začít projekt** (→ `start`),
  cestu k adresáři a příkaz `code <cesta>`, a tlačítko **Zkontrolovat**:
  - `runtime: dom` — klient si načte `files` a spustí `runTests` v prohlížeči;
  - `runtime: node` — `POST …/check`. Test si smí sám zavolat `helpers.run('npm test')`,
    `helpers.run('npm run build')` apod. (projekt si závislosti instaluje uživatel,
    zadání mu to řekne).
- Náhled `dom` projektu: iframe se stejným skládáním jako runtime `dom`.
- Node projekt jde spustit jako běžící server přes dev-process s `project` (kap. 12.7).
- Po projití všech testů se zvýrazní rubrika `# --review--`.

---

## 10. Ověření obsahu (`npm run overit`)

```
npm run overit                          # celý obsah
npm run overit -- content/css-flexbox   # jen prefix
npm run overit -- --json                # strojový výstup
npm run overit -- --doporuceni          # vypíše i doporučení (jinak jen jejich počet)
```

`tools/verify.js` je soběstačný: sám si spustí, co potřebuje (server na volném
portu, Vite build nebo dev server, Playwright s `--site-per-process`), a po sobě uklidí.

**Úrovně:** **chyba** (exit kód 1), **varování** (vypíše se, exit 0), **doporučení**
(pravidla příručky, jen počet; text s `--doporuceni`). JSON položka:
`{ id, type, errors: [], warnings: [], notes: [], advice: [] }` (`notes` = informativní
souhrny, např. počet kroků).

### 10.1 Struktura a odkazy

| # | kontrola | úroveň |
|---|---|---|
| S1 | `osnova.json`, `section.json`, `module.json`, všechny `.md` (i `cards.md`, `pojmy.md`) jdou naparsovat; `tahak.md` bez značek `--x--` a `:::` (kap. 2.7) | chyba |
| S2 | `doporucenaTrasa`: neznámý slug, duplicita / `uroven` neplatná / plánovaná sekce bez `title`/`summary` | chyba |
| S2 | sekce na disku (má `section.json`), která není v `osnova.json` | varování |
| S3 | sekce `jadro` chybí v trase (když trasa existuje) | varování |
| S4 | reference `see`, `### --see--`, `--see--`, `lekce:`, `links`, odkazy `](see:…)`, `see` v `errors-cs.js` na neexistující sekci/modul/krok/kotvu, kotva u nelekce | chyba |
| S5 | `[[pojem]]` neexistuje; kolize pojmu/aliasu mezi sekcemi | chyba |
| S6 | pojem použitý v sekci před sekcí jeho `lekce` (kap. 2.6) | varování |
| S7 | duplicitní klíč otázky/karty/bodu v souboru | varování |
| S8 | chybí `cards.md` v dostupné sekci | varování |
| S9 | chybí `pojmy.md`, `tahak.md`, `outcomes`; pojem se nikde nepoužije; karet mimo 15–30; karet `free` méně než 5; karta bez `--see--` | doporučení |

### 10.2 Krok, lab, projekt

| # | kontrola | úroveň |
|---|---|---|
| K1 | testy nad **seedem**: aspoň jeden musí selhat; testy nad **řešením**: všechny projdou, bez `errors`, bez `syntaxError` | chyba |
| K2 | seed má `syntaxError` | varování |
| K3 | návaznost workshopu: seed kroku N ≠ řešení kroku N−1 po normalizaci bílých znaků (nové soubory se nepočítají). Seed kroku `kind: debug` se lišit smí (chyba je záměr); návaznost se pak hlídá u kroku za ním. | varování |
| K4 | lab bez `--solution--` | chyba |
| T1 | **tip prozrazuje řešení**: *přidané řádky* = řádky souborů řešení (po `normalizeWhitespace`), které v seedu téhož souboru nejsou, mají aspoň 8 znaků a obsahují písmeno nebo číslici. *Kandidáti z tipu* = každý řádek textu tipu (bez úvodní odrážky `- `/`* `/`1. `), obsah každého inline kódu a každý řádek bloků kódu v tipu, po `normalizeWhitespace`. Shoda kandidáta s přidaným řádkem = chyba. | chyba |
| T2 | krok workshopu mimo první třetinu bez `# --help--` (kromě `kind: parsons`) | varování |
| T3 | krok s víc než 3 tipy; lab s víc než 2 tipy | varování |
| A1 | **aserce bez zprávy**: test se naparsuje (`acorn`, obalený do `async function`); volání `assert(x)`/`assert.ok(x)` s méně než 2 argumenty a `assert.equal/notEqual/deepEqual/notDeepEqual/strictEqual/notStrictEqual/deepStrictEqual/notDeepStrictEqual/match/doesNotMatch` s méně než 3 argumenty. Jedno varování na krok s počtem a čísly řádků testů. | varování |
| D1 | `kind: debug`: řešení mění víc než `maxChange` (kap. 3.4) | varování |
| D2 | `kind: debug` bez `see` | doporučení |
| P1 | `kind: parsons`: přijatelný tvar mezery neprojde testy | chyba |
| P2 | parsons bez distraktorů | doporučení |
| X1 | lab: přístup z `# --approaches--` neprojde testy | chyba |
| X2 | lab: přístupů mimo 2–4; checklist `--explain--` mimo 2–6 bodů | doporučení |
| L1 | lab s runtime js: nad seedem hlásí většina testů `ReferenceError … is not defined` (chybí kostry funkcí) | doporučení |
| L2 | lab: požadavků mimo 8–20 | doporučení |

### 10.3 Workshop jako celek

Třetina kroku `i` (0-based) z `n` = `Math.floor(i * 3 / n)` (0, 1, 2).

| # | kontrola | úroveň |
|---|---|---|
| W1 | workshop s ≥ 10 kroky bez `kind: debug` | varování |
| W2 | **zeslabování**: víc než 50 % kroků poslední třetiny (bez `debug`/`parsons`) má v popisu blok kódu jazyka `html`, `css`, `js`, `javascript`, `vue`, `jsx`, `ts` nebo `tsx` s neprázdným obsahem | varování |
| W3 | popis kroku ve druhé nebo třetí třetině obsahuje přidaný řádek řešení (pravidlo T1 nad popisem) | varování |
| W4 | počet `debug` < ⌊n/10⌋; počet `# --explain--` < ⌊n/5⌋; n ≥ 10 bez `parsons`; n ≥ 10 bez `choose`; n ≥ 8 bez `recall`; kroků mimo 15–60 | doporučení |

### 10.4 Lekce

| # | kontrola | úroveň |
|---|---|---|
| E1 | každá živá ukázka (i s výchozími `controls`), obě varianty `:::compare` a ukázka předpovědi dom/vue/js běží bez `errors` | chyba |
| E2 | psaná předpověď `js`: skutečný výstup ≠ `expected` (kap. 5.3) | chyba |
| E3 | varianty `:::compare` shodné | chyba |
| E4 | lekce bez `:::check` (bez `pretest`) | varování |
| E5 | `:::check pretest` za prvním `##`; `controls` proměnná nepoužitá v CSS | varování |
| E6 | část `##` bez `:::check` (i `pretest`; kromě části `## Kde to najdeš v MDN`); md text mezi dvěma interaktivními bloky (`live`, `check`, `explain`, `memory`, `compare`) delší než 400 slov (mimo bloky kódu); lekce bez předpovědi; bez pretestu; v `# --questions--` méně než polovina psaných; chybí nadpis `## Kde to najdeš v MDN` | doporučení |

### 10.5 Kvíz a karty

| # | kontrola | úroveň |
|---|---|---|
| Q1 | kvíz má méně než 5 otázek | varování |
| Q2 | špatná odpověď (`--answer--`) bez `#### --why--` | varování |
| Q3 | soubor `# --code--` mimo 40–120 řádků | varování |
| Q4 | otázek mimo 10–20; psaná otázka bez `--why--`; otázka bez `--see--`; kvíz bez `# --code--`; méně než polovina psaných; méně než 20 % otázek má `--see--` do dřívější sekce téže části (jen když taková sekce už existuje na disku) | doporučení |
| C1 | karta `code`: test nad seedem neselže nebo nad řešením neprojde | chyba |
| C2 | karta `output` s právě jedním blokem ` ```js ` v textu: kód se spustí v runtime js a `normalizeAnswer(výstup) !== normalizeAnswer(expected)` | chyba |
| C3 | karta `output` s jedním blokem js, který nic nevypíše | varování |
| M1 | rámeček `> [!TYP]` s neznámým typem (kap. 5.11) | varování |
| M2 | lekce bez `> [!REMEMBER]` nebo sekce „pasti“ bez `> [!PITFALL]` | doporučení |

Výstup: souhrn po modulech (a sekcích pro `cards.md`/`pojmy.md`), na konci počet chyb,
varování a doporučení. Exit kód 1 při chybě.

**Další nástroje:** `node tools/e2e.js [--port N]` — kouřový průchod UI v Playwrightu
(vlastní dočasná data, snímky do `.e2e/`): jádro a nástroje — nápověda → porovnání s řešením, opakování, poznámky, tmavý režim.

---

## 11. Pravidla pro agenty

- Pracuj **jen ve svých souborech** (kap. 1 a zadání). Potřebuješ změnu jinde
  (kontrakt, `shared/`, `package.json`, cizí modul)? Napiš ji do závěrečné zprávy.
- **Neinstaluj balíčky** a neměň `package.json`. K dispozici: `vite`, `codemirror`,
  `@codemirror/state`, `@codemirror/view`, `@codemirror/lint`, `@codemirror/lang-html`,
  `@codemirror/lang-css`, `@codemirror/lang-javascript`, `@codemirror/theme-one-dark`,
  `@lezer/highlight`, `marked`, `vue`, `acorn`, `acorn-walk`, `playwright`
  (Chromium headless shell).
- **Nikdy `pkill node` / `killall node`** — zabiješ cizí procesy. Zabíjej jen PID,
  které jsi sám spustil. Používej porty ze svého přiděleného rozsahu.
- Žádné commity — commituje koordinátor.
- **AI v kódu platformy ne:** v kódu platformy (`server/`, `client/`, `shared/`,
  `tools/`), v komentářích, v commitech a v atribuci nezmiňuj AI, Clauda ani asistenta
  a nepřidávej žádné řádky o spoluautorství. Platforma nemá žádnou funkci, která by
  volala AI (ani vysvětlování chyb).
- **AI jako téma obsahu ano:** obsah kurzu smí učit práci s AI jako dovednost — sekce
  `prace-s-ai` a lekce o učení ve `start-nastroje` (`jak-se-ucit-v-akademii`). Mimo tato
  místa obsah AI nezmiňuje, pokud to téma lekce přímo nevyžaduje.

---

## 12. Nástroje: datové soubory a HTTP API

Všechny soubory leží v `dataDir` (`data/`), každý nástroj má **vlastní soubor**,
zapisuje se atomicky (`.tmp` + `rename`) přes společné úložiště (`createJsonStore`,
popsané v `docs/platforma.md`). Každý JSON soubor má `"version": 1`. Časy jsou ISO
řetězce UTC, **data** pro opakování jsou `YYYY-MM-DD` v místním čase serveru
(„dnes" = místní datum). Odpovědi nástrojů nesou jen svoje data, nikdy celý
`progress.json`.

### 12.1 Přehled

| metoda a cesta | kap. |
|---|---|
| `POST /api/attempts` · `GET /api/attempts` | 12.2 |
| `GET /api/stats` | 12.2 |
| `GET /api/reviews/summary` · `GET /api/reviews/due` · `POST /api/reviews/answer` · `POST /api/reviews/add` · `POST /api/reviews/remove` | 12.3 |
| `GET /api/confidence` · `GET /api/confidence/:section` | 12.4 |
| `GET /api/notes` · `GET /api/notes/:section` · `PUT /api/notes/:section` · `POST /api/notes/:section/append` | 12.5 |
| `GET /api/settings` · `PUT /api/settings` | 12.6 |
| `GET /api/dev-process` · `POST /api/dev-process/start` · `POST /api/dev-process/stop` · `POST /api/dev-process/request` · `GET /api/dev-process/output` | 12.7 |
| `POST /api/progress/reset` (rozšířený) | 8 |

Neplatné tělo (chybějící nebo špatně typované pole, neznámé id) = 400 s českou zprávou.

Obrazovky v UI (hash router): `#/opakovani`, `#/poznamky`, `#/poznamky/<sekce>`,
`#/statistiky`, `#/hledat` (vlna 2 jen prázdná obrazovka „připravuje se"),
`#/piskoviste` a `#/pojmy` (vlna 3). Menu v hlavičce: Hledat · Opakování · Poznámky ·
Statistiky, ve vlně 3 přibude Pískoviště (pořadí `order` v `docs/platforma.md`, kap. 3.3).

### 12.2 Pokusy (`data/pokusy.json`)

Záznam neúspěšných kontrol, otevřených tipů, zobrazení řešení a času. Slouží
nápovědám (B1), statistikám (B8) a zakládání položek opakování.

`POST /api/attempts`

```js
{
  id: 'js-pole/workshop-nakupni-seznam/017',  // id kroku nebo modulu (kap. 2.4), nebo q:… (kap. 2.10)
  ok: false,              // nepovinné: výsledek kontroly / odpovědi; chybí = jen aktualizace (tip, řešení, čas)
  failed: [1, 3],         // nepovinné, jen s ok: indexy selhaných požadavků této kontroly
  tipsOpened: 2,          // nepovinné: nejvyšší otevřený stupeň tipu (server drží maximum)
  solutionViewed: true,   // nepovinné: uživatel otevřel porovnání s řešením nebo přístupy
  activeMs: 45000,        // nepovinné: přírůstek aktivního času od posledního odeslání (0–3 600 000)
  score: 0.7,             // nepovinné: skóre průchodu kvízu 0–1
  confidence: 'sure',     // nepovinné, jen u q: s ok: 'sure' | 'guess'
}
```

→ `{ ok: true, attempt: Attempt }`

Validace těla: neznámé pole = 400 („Neznámé pole …"); `failed` a `confidence` jen spolu
s `ok` (jinak 400); `confidence` jen u id `q:` (jinak 400), `null` = bez jistoty.

```js
// data/pokusy.json
{
  "version": 1,
  "items": {
    "js-pole/workshop-nakupni-seznam/017": {
      "checks": 7,               // počet odeslání s ok
      "fails": 5,                // z toho ok: false
      "failsSinceOk": 0,         // ok: false od posledního ok: true (nápověda B1 při ≥ 2)
      "failedHints": { "1": 3, "3": 2 },
      "tipsOpened": 2,
      "solutionViewed": true,
      "assisted": true,          // řešení zobrazené dřív, než byl krok poprvé ok
      "firstOkAt": "2026-09-13T10:12:00.000Z",   // null, dokud nebyl ok
      "lastAt": "2026-09-13T10:12:00.000Z",
      "activeMs": 812345,
      "firstScore": null,        // první odeslané score (kvíz)
      "lastScore": null
    }
  }
}
```

Pravidla na serveru:

- `solutionViewed: true` při `firstOkAt === null` nastaví `assisted: true`. V jednom požadavku
  se `solutionViewed` započte **před** `ok` — `solutionViewed: true` spolu s prvním `ok: true` = `assisted`.
- První `ok: true` u **kroku workshopu nebo labu** (typ ověří server z obsahu), když
  `assisted` nebo `fails ≥ 3` → `reviews.add('step:<id>')` (kap. 12.3).
- `ok` u id `q:…` → pokud položka v opakování ještě není, založí ji podle první
  odpovědi (kap. 12.3, „Založení z první odpovědi"); s `confidence` přičte do jistoty
  (kap. 12.4). Pretest a předpovědi klient neposílá.
- Id `q:…`, které v obsahu neexistuje = 400.

`GET /api/attempts` → celý obsah souboru; `GET /api/attempts?prefix=js-pole` → jen
položky, jejichž id (nebo `itemTarget` u `q:`) k prefixu patří.

`GET /api/stats` → podklad obrazovky `#/statistiky` (bez grafů a bodů):

```js
{
  topFailedHints: [{ id: 'js-pole/workshop-nakupni-seznam/017', title, hintIndex: 1, hintText: '…', fails: 3 }],  // max 10, fails sestupně
  wrongQuestions: [{ id: 'q:js-pole/kviz#1b4f0e98', moduleId: 'js-pole/kviz', text: '…', wrong: 2, see: [] }],    // otázky s fails > 0, max 20
  solutionViewed: [{ id, title, assisted: true }],
  timeBySection: [{ sectionId: 'js-pole', title: 'Pole v JavaScriptu', activeMs: 5400000 }],                   // v pořadí osnovy, jen > 0
}
```

Položky, které už v obsahu neexistují, se ve statistikách vynechají (v souboru zůstávají).

### 12.3 Opakování (`data/opakovani.json`)

**Leitner.** Krabičky 1–6, intervaly `INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 16, 5: 35, 6: 90 }` dní.

```js
// data/opakovani.json
{
  "version": 1,
  "items": {
    "q:js-pole/kviz#1b4f0e98": {
      "box": 2,
      "due": "2026-09-16",
      "added": "2026-09-13T10:00:00.000Z",
      "reason": "first-answer",       // first-answer | card | assisted | fails | self | explain | outcome
      "lastAnswered": "2026-09-13T10:00:00.000Z" | null,
      "history": [{ "at": "…", "ok": true, "confidence": "sure" | "guess" | null }]   // posledních max 20
    }
  },
  "removed": { "card:js-pole#77aa01bc": "2026-09-13T10:30:00.000Z" }   // „Už to umím" — znovu se nezaloží
}
```

**Založení z první odpovědi** (otázky `q:`, přes `POST /api/attempts`):
- správně a `sure` → `box 2`, `due = dnes + 3`;
- správně a `guess`/bez jistoty → `box 1`, `due = dnes + 1`;
- špatně → `box 1`, `due = dnes + 1` (chyba s jistotou tedy „opakování zítra").

**Odpověď v opakování** (`POST /api/reviews/answer`):
- `ok` a `confidence !== 'guess'` → `box = min(box + 1, 6)`, `due = dnes + INTERVALS[box]`;
- `ok` a `confidence === 'guess'` → box se nemění, `due = dnes + INTERVALS[box]`;
- `!ok` → `box = 1`, `due = dnes + 1`.

**Zdroje položek:**

| id | kdy vznikne | co je obsahem |
|---|---|---|
| `q:<modul>#<klíč>` | první vyhodnocení otázky lekce/kvízu | otázka (kap. 4.4) |
| `card:<sekce>#<klíč>` | automaticky při každém `GET /api/reviews/summary` a `due`: každá **aktivní** karta, která ve `items` ani v `removed` není, se založí s `box 1`, `due = dnes`, `reason: 'card'`. Karta je aktivní, když je splněný modul její první reference `see`; karta bez `see`, když je splněná aspoň polovina modulů sekce. | karta (kap. 2.5) |
| `step:<krok nebo modul>` | pokusy (assisted nebo 3+ neúspěchů) nebo tlačítko „Nezvládl bych to znovu" (`add`, `reason: 'self'`) | seed a požadavky kroku bez popisu |
| `explain:<krok nebo modul>#<klíč>` | nezaškrtnutý bod checklistu (`add`, `reason: 'explain'`) | bod, zadání a model |
| `outcome:<sekce>#<klíč>` | vlna 3 | — |

`GET /api/reviews/summary` → `{ date: '2026-09-13', due: 12, estimateMinutes: 8 }`
(`due` = kolik se dnes nabídne, tj. `min(splatné, zbývá do stropu)`; přehled ukáže
jeden řádek „K opakování: 12 (asi 8 min)", žádné série).

`GET /api/reviews/due` →

```js
{
  date: '2026-09-13',
  total: 31,            // všechny splatné (due ≤ dnes)
  answeredToday: 8,     // položek, jejichž lastAnswered (nastavuje jen POST /api/reviews/answer) je dnešní místní datum
  limit: 20,            // denní strop
  estimateMinutes: 8,
  items: [ReviewItem],  // max limit − answeredToday
}

// ReviewItem
{
  id: 'q:js-pole/kviz#1b4f0e98',
  type: 'question' | 'card' | 'step' | 'explain',
  box: 2, due: '2026-09-13',
  source: { sectionId: 'js-pole', moduleId: 'js-pole/kviz' | null, title: 'Kvíz: pole', see: [] },
  content:
    // question: Question (kap. 4.4); u otázky ze sady # --code-- navíc codeSet: { title, files }
    // card: Card (kap. 2.5)
    // step: { stepId, runtime, title, hints: [{ text, test }], seed: [File], meta }   — bez popisu a řešení
    // explain: { prompt, point: { key, text }, model }
}
```

- **Výběr:** splatné položky seřazené podle `due` vzestupně, pak `box` vzestupně, pak id;
  pak se proloží po sekcích (round-robin přes sekce v pořadí prvního výskytu) a vezme se
  prvních `limit − answeredToday`.
- **Osiřelé položky** (obsah s daným id už neexistuje) server při `due`/`summary` smaže.
- **Odhad času** (sekundy): otázka 30, karta `output`/`css` 45, `free` 60, `code` 180,
  `explain` 45, `step` 480; `estimateMinutes = Math.ceil(součet / 60)`.
- UI: otázka s výběrem se nejdřív ukáže **bez voleb a bez `why`** („Odpověz v hlavě",
  tlačítko „Ukaž volby"); `free` karta ukáže `back` a „Věděl jsem / Nevěděl jsem";
  `step` se otevře od seedu jen s požadavky a `ok` = všechny testy prošly (nebo
  „Vzdávám" = `!ok`); `explain` = napiš bod vlastními slovy, pak model a sebehodnocení.

`POST /api/reviews/answer { id, ok: boolean, confidence?: 'sure' | 'guess' | null }`
→ `{ ok: true, item: { id, box, due } }`. Neznámé id = 404. S `confidence` přičte do jistoty.

`POST /api/reviews/add { id, reason }` (`reason` ∈ `assisted | fails | self | explain | outcome`)
→ založí položku (`box 1`, `due = dnes + 1`); když už existuje, nastaví `box 1`,
`due = dnes + 1` (`reason`, `added` a `history` zůstanou). Smaže id z `removed`. → `{ ok: true, item, created: boolean }`.
Id, které v obsahu neexistuje = 400.

`POST /api/reviews/remove { id }` → „Už to umím, nezobrazovat": smaže položku a zapíše
id do `removed` (vždy) → `{ ok: true, removed: boolean }` (`true`, když položka ve `items` byla). Pozdější první odpověď na otázku ani
aktivace karty ji znovu nezaloží; jen `add`.

Reset (kap. 8) maže položky i záznamy v `removed`, jejichž `itemTarget` k id patří.
Osiřelé záznamy v `removed` se mažou stejně jako osiřelé položky.

### 12.4 Jistota (`data/jistota.json`)

```js
{
  "version": 1,
  "sections": {
    "js-pole": { "sure": { "total": 14, "correct": 10 }, "guess": { "total": 6, "correct": 3 } }
  }
}
```

- Přičítá se jen odpověď s `confidence` (z `POST /api/attempts` u `q:` a z
  `POST /api/reviews/answer`). Sekce = `sectionId` z `itemTarget`.
- `GET /api/confidence` → celý obsah; `GET /api/confidence/:section` →
  `{ sectionId, sure: { total, correct }, guess: { total, correct } }` (nuly, když nic).
- UI: na stránce sekce jedna věta, když `sure.total ≥ 5`: „Když jsi byl jistý, měl jsi
  pravdu v 71 %." Po chybě s jistotou u otázky: „Tady ses mýlil s jistotou — zopakuješ
  si to zítra."

### 12.5 Poznámky (`data/poznamky/<sekce>.md`)

Jeden markdown soubor na sekci, `obecne.md` pro poznámky mimo sekci (`obecne` je
rezervované jméno). Soubor je obyčejný markdown, který si uživatel smí upravit i ručně.

| metoda a cesta | tělo | odpověď |
|---|---|---|
| `GET /api/notes` | — | `{ notes: [{ section: 'js-pole', title: 'Pole v JavaScriptu', updated: ISO, size: 1234 }] }` (jen existující soubory, v pořadí osnovy, `obecne` první) |
| `GET /api/notes/:section` | — | `{ section, content: '…', updated: ISO \| null }` (`content: ''`, když soubor není) |
| `PUT /api/notes/:section` | `{ content, baseUpdated? }` | přepíše soubor → `{ ok: true, updated }`; když `baseUpdated` nesouhlasí s aktuálním `updated` → 409 |
| `POST /api/notes/:section/append` | `{ kind, source, title, text, quote? }` | připíše záznam → `{ ok: true, updated }` |

`:section` = slug dostupné sekce nebo `obecne`, jinak 400. `kind`: `note` (poznámka
z panelu), `quote` („Nerozumím" u odstavce, `quote` = citovaný text), `explain`
(kap. 3.7, 5.5), `plan` („Než začneš", kap. 3.8). `source` = reference (kap. 2.9),
u „Nerozumím" s kotvou nejbližšího nadpisu. Tělo `append` nad 100 kB = 413; `PUT` celého
souboru má limit serveru 5 MB (soubor poznámek sekce časem 100 kB přeroste). Protože `source`
je vždy reference, `append` do `obecne` přijde jen z lekce nebo kroku; mimo ně se `obecne.md`
upravuje přes `PUT` (obrazovka `#/poznamky/obecne`).

Formát připsaného záznamu (přesně):

```md

## {title}

<!-- zdroj: {source} · {ISO čas} · {kind} -->

> {quote, každý řádek s "> "}

{text}
```

(Řádek s citací jen při `quote`. Soubor vždy končí novým řádkem.)

### 12.6 Nastavení (`data/nastaveni.json`)

```js
{ "version": 1, "theme": "system", "previewWidth": "tests" }
```

| klíč | hodnoty | výchozí |
|---|---|---|
| `theme` | `system` \| `light` \| `dark` | `system` |
| `previewWidth` | `tests` \| `768` \| `375` \| `panel` (kap. 6.7) | `tests` |

`GET /api/settings` → nastavení s doplněnými výchozími hodnotami (bez `version`).
`PUT /api/settings` s částí klíčů → sloučí → celé nastavení. Neznámý klíč nebo hodnota = 400.
Nastavení je na serveru (ne v `localStorage`), aby bylo stejné na portu 4300 i 5300.

### 12.7 Běžící Node proces a HTTP klient (`/api/dev-process`)

Vždy běží **nejvýš jeden** proces. Slouží tlačítku **Spustit** u runtime node (skript
i server) a panelu HTTP klienta. Proces, který jen poslouchá, se nikdy neoznačí za
nekonečnou smyčku.

`POST /api/dev-process/start`

```js
{
  files: [{ name: 'server.js', content: '…' }],     // buď files…
  project: { section: 'node-zaklady', module: 'projekt-api-poznamek' },   // …nebo project (přesně jedno)
  main: 'server.js',       // nepovinné; výchozí index.js, jinak první .js (files v pořadí, project v kořeni abecedně)
  env: { API_KEY: 'x' },   // nepovinné; klíče /^[A-Z_][A-Z0-9_]*$/, hodnoty řetězce
}
```

- Běžící proces se nejdřív zastaví. `files` se zapíšou do nového dočasného adresáře
  (po zastavení se smaže); `project` běží v `moje-projekty/<section>--<module>/`
  (409, když projekt nezačal).
- Spustí se `node <main>` v novém procesu (vlastní skupina procesů), `PORT` = volný port
  (přebije `env`), `NODE_ENV=development` (tohle `env` přebít smí).
- Odpověď přijde, jakmile port přijímá spojení, proces skončí, nebo po 5000 ms —
  **nic z toho není chyba**:

```js
// DevProcess
{
  id: 'p-3',                          // nové při každém startu
  status: 'running' | 'exited',
  listening: true,                    // port přijímá spojení
  port: 41234, url: 'http://127.0.0.1:41234',
  main: 'server.js',
  startedAt: ISO,
  exitCode: null | 0, signal: null | 'SIGTERM',
}
```

→ `{ ok: true, process: DevProcess }`

`GET /api/dev-process` → `{ process: DevProcess | null }` (poslední proces, i skončený).

`POST /api/dev-process/stop` (tělo `{}`) → SIGTERM celé skupině, po 2000 ms SIGKILL →
`{ ok: true, stopped: boolean }`.

`GET /api/dev-process/output?since=<seq>` →

```js
{
  process: DevProcess | null,
  next: 128,                 // since pro další dotaz
  truncated: false,          // true, když since je starší než nejstarší držený záznam
  chunks: [{ seq: 127, stream: 'stdout' | 'stderr' | 'system', text: '…', at: ISO }],
}
```

Server drží posledních 5000 záznamů nebo 1 MB textu. Záznamy `system` jsou české
zprávy platformy: „Server poslouchá na http://127.0.0.1:41234", „Proces skončil
s kódem 1", „Zastaveno po 10 minutách nečinnosti". Při novém `id` začíná klient od `since=0`.

`POST /api/dev-process/request`

```js
{ method: 'POST', path: '/notes?limit=5', headers: { 'content-type': 'application/json' }, body: '{"text":"Ahoj"}', timeoutMs: 10000 }
```

- `method` ∈ `GET POST PUT PATCH DELETE HEAD OPTIONS`; `path` musí začínat `/`
  (žádná absolutní URL); hlavičky `host` a `content-length` doplní server; `timeoutMs`
  výchozí 10000, max 30000. Požadavek jde vždy na `127.0.0.1:<port>` běžícího procesu
  (na `[::1]:<port>`, když proces poslouchá jen na IPv6 — pak i `url` je `http://[::1]:PORT`).
  Proces neběží = 409.
- Odpověď (vždy 200, když se požadavek pokusil odejít):

```js
{ ok: true, status: 201, statusText: 'Created',
  headers: { 'content-type': 'application/json' },    // malá písmena; víc hodnot spojených ', ' (set-cookie '\n')
  body: '{"id":1}', bodyEncoding: 'utf8' | 'base64', bodyTruncated: false,   // tělo max 1 MB
  durationMs: 12 }
{ ok: false, error: 'Spojení odmítnuto — server na portu 41234 neposlouchá.', code: 'ECONNREFUSED', durationMs: 3 }
```

  `bodyEncoding: 'utf8'`, když je `content-type` textový (`text/*`, `json`, `javascript`,
  `xml`, `x-www-form-urlencoded`) nebo chybí a tělo je platné UTF-8; jinak `base64`.

**Úklid:** proces se zastaví (1) po 10 minutách bez volání `start`/`request`/`stop`
(samotné `output` nečinnost neprodlužuje), (2) při ukončení serveru, (3) když klient
odchází z obrazovky (volá `stop` s `keepalive`).

### 12.8 Vyhledávání

Ve vlně 2 se nestaví (obrazovka `#/hledat` je jen místo v menu). `GET /api/search`
doplní vlna 3.

**Převod id na obsah** (opakování, pokusy, statistiky) dělá jedna funkce
`resolveContentItem(contentDir, id)` ve `shared/content.js` (na serveru `ctx.resolveItem(id)`):

```js
resolveContentItem(contentDir, 'q:js-pole/kviz#1b4f0e98') →
  null | { id, type: 'question' | 'card' | 'step' | 'explain',
           source: { sectionId, moduleId: string | null, title, see: [] },
           content }          // přesně `content` z ReviewItem (kap. 12.3)
```

- `null` = neplatné id nebo položka v obsahu není (osiřelá, kap. 12.3). `outcome:` → `null` (vlna 3).
- Rozbitý soubor obsahu vyhodí `ParseError` — položka se pak **nesmí** smazat jako osiřelá.
- `q:` hledá mezi otázkami kvízu, `:::check` bez `pretest` a `# --questions--` lekce;
  `explain:` mezi body `# --explain--` kroku/labu a `:::explain` lekce; `step:` jen krok
  workshopu (`s/m/NNN`) nebo lab (`s/m`). Titulek zdroje = titulek kroku, u ostatních modulu.
- Lehký index `buildContentIndex` (sekce, moduly, kroky, kotvy; `docs/platforma.md`, kap. 2.1)
  slouží k přehledům a validaci referencí.

---

## 13. Plánované (formát doplní vlna 3+)

Následující prvky jsou ohlášené, ale **ještě nespecifikované**. Obsah je nesmí
používat, parser je odmítá, dokud je kontrakt nedoplní.

- `:::trace js` — automatické krokování JS (zásobník, rozsahy, halda se šipkami);
  tam, kde jde kód krokovat, nahradí `:::memory`. Vlna 3, před `js-objekty`.
- `:::specificita` — kalkulačka specificity (A, B, C). Vlna 3, `css-kaskada`.
- `:::regex` — tester regulárních výrazů s rozborem. Vlna 3, `js-retezce-cisla`.
- `:::eventloop` — event loop s předpovědí pořadí a kroky popsanými autorem. Vlna 4, před `js-async`.
- `target: layout` — vizuální cíl v CSS labech (porovnání geometrie). Vlna 4.
- Cvičné úlohy `content/cviceni/<slug>/` ve formátu labu s `requires`, `topics`, `level`. Vlna 4.
- Runtime `react` (import map, JSX/TSX, `helpers.flush()`). Vlna 5, před React sekcemi.
- Vyhledávání Ctrl+K, popover pojmů, `#/pojmy`, REPL v konzoli, pískoviště, „Postavit
  znovu naslepo", obrazovka „Po sekci umíš" s `outcome:` položkami opakování. Vlna 3.
- Poznámky analyzátoru k řešení (`feedback:`). Vlna 5.
- **Úložiště v sandboxovaném iframu** (runtime `dom`, `js`, `vue`, `react`): iframe bez
  `allow-same-origin` vyhazuje `SecurityError` u `localStorage`, `sessionStorage`,
  IndexedDB a cookies. **Hotové (vlna 2b):** runner má in-memory `localStorage`/`sessionStorage`
  (čerstvé pro každý test i každé překreslení náhledu) a `RunRequest.storage` (kap. 6.1); test
  může úložiště naplnit i sám přes `localStorage.setItem` a pak zavolat funkce stránky.
  **Chybí:** zápis počátečního úložiště v obsahu (frontmatter kroku?) a IndexedDB/cookies. Vlna 3, nejpozději před
  `js-dom` (`prohlizecova-api`, `workshop-filtr-produktu`, `projekt-kanban`),
  `nastroje-testovani/projekt-rozpoctovac` a hookem `useLocalStorage` v Reactu.
- **Obrázky v obsahu** (snímky návrhu z Figmy v `css-design/cteni-navrhu`): kde leží
  (`content/<sekce>/<modul>/obrazky/`), jak se na ně odkazuje z markdownu a jak je
  server servíruje. Vlna 5, před `css-design`.

**Nestaví se:** vysvětlování chyb přes AI, vlastní překryvy DevTools, plánovač `#/plan`,
přehrávač `:::replay`.

---

## Příloha: kde co najdeš (návrh vylepšení 2026-09-14 → kapitoly)

| položka | kapitola |
|---|---|
| A1 psaná odpověď | 4.2, 4.4 |
| A2 `:::check`, pretest | 5.4, 5.8 |
| A3 `:::live … predict` | 5.3 |
| A4 `# --help--` | 3.3 |
| A5 `cards.md` | 2.5 |
| A6 `kind: debug` | 3.4 |
| A7 `kind: parsons` | 3.5 |
| A8 `# --explain--`, `:::explain` | 3.7, 5.5 |
| A9 `:::memory` | 5.6 |
| A10 `controls`, `:::compare` | 5.2, 5.7 |
| A11 `see`, kotvy | 2.8, 2.9, 4.1 |
| A12 Než začneš, `# --approaches--`, `# --review--` | 3.8, 3.9, 9 |
| A13 `pojmy.md`, `[[ ]]`, `tahak.md`, `outcomes` | 2.2, 2.6, 2.7 |
| A14 pravidla učení | `styl-obsahu.md`, kontroly v kap. 10 |
| A15 kvíz `# --code--` | 4.3 |
| osnova `uroven`, `doporucenaTrasa` | 2.1 |
| B0 úložiště, routy, reset | 12, 8, `platforma.md` |
| B1 nápovědy při zaseknutí | 3.3, 12.2 |
| B2 porovnání s řešením | 3.3, 12.2 (`assisted`), 7 (`?solution=1`) |
| B3 skutečné hodnoty, česky, SyntaxError | 6.1, 6.9 |
| B4 lint v editoru | 6.7 (`onConsole` s řádkem); jinak jen UI |
| B5 fronta opakování | 12.3 |
| B6 jistota | 4.5, 12.4 |
| B7 otázky neprozradí odpověď | 4.5, 12.2 (`firstScore`) |
| B8 pokusy a statistiky | 12.2 |
| B9 poznámky | 12.5 |
| B10 běžící Node server a HTTP klient | 12.7 |
| B11 ligatury, sourceURL, nová karta, šířka náhledu | 6.3, 6.7, 12.6 |
| B12 orientace, tmavý režim | 12.6 (`theme`), 8 (`lastVisited`) |
