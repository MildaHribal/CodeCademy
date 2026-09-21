# Platforma Akademie: vnitřní stavba a rozšiřovací body

Dokument pro každého, kdo do platformy přidává nástroj (nápovědy, opakování, poznámky,
lint…). Formáty obsahu a HTTP API jsou v `docs/kontrakt.md`; tady je, **kam** nový kód
patří a **jak** ho připojit, aby se nemusely upravovat soubory jádra.

**Hlavní pravidlo: nový nástroj = nové soubory.** Jádro má registry, sloty a události.
Nástroj se do nich připojí ze svého souboru. Soubory jádra (seznam v kap. 5) upravuje
jen jejich vlastník; potřebuješ-li v jádře změnu, napiš ji do závěrečné zprávy.

Obsah:

1. Server — úložiště, routy, kontext, reset
2. Sdílený kód — index obsahu, kotvy, volitelné soubory sekce
3. Klient — rozšíření, obrazovky, menu, API, události
4. Klient — pracovní plocha, lekce, otázky, výsledky testů, editor, CSS
5. Vlastnictví souborů — pravidla
6. Ověření a testy
7. Vlna 2b — přidělení práce (balíky, soubory, závislosti, ověření)

---

## 1. Server

```
server/
├── index.js            spuštění (port, signály)
├── app.js              jádro: createApp, ochrana požadavků, /vendor, statické soubory, chyby
├── context.js          ctx pro routy (cesty, úložiště, obsah, pomocníci, registry)
├── router.js           tabulka rout s parametry :jmeno
├── http.js             sendJson, readJsonBody, limity, describeError
├── errors.js           HttpError(status, zpráva), InputError (400)
├── validate.js         SLUG, ID_PATTERN, checkId, checkSlugs, isPlainObject
├── store.js            createJsonStore — JSON soubor v data/
├── progress.js         postup (data/progress.json) nad createJsonStore
├── node-runner.js …    běh node testů
└── routes/
    ├── index.js        automatické načtení (nic se tu nepřidává)
    ├── curriculum.js   GET /api/curriculum, GET /api/module/:section/:module
    ├── progress.js     /api/progress…  (reset volá resettery nástrojů)
    ├── projects.js     /api/project/…
    ├── run-node.js     /api/run-node, /api/run-node-file
    └── <nástroj>.js    ← nové routy sem, jeden soubor na nástroj
```

### 1.1 Úložiště `createJsonStore` (`server/store.js`)

```js
const store = ctx.createJsonStore('opakovani.json', {           // jméno relativní k data/
  defaults: () => ({ version: 1, items: {} }),                 // když soubor chybí nebo je poškozený
  migrate: (data) => (isPlainObject(data?.items) ? data : null) // null = poškozený → .broken-<čas>
});

store.get();                                    // hluboká kopie dat
store.update((draft) => { draft.items[id] = x; return x; });   // změna + naplánovaný zápis
store.set(data);  store.clear();                // nahradit / vrátit na defaults
await store.flush();                            // počkat na zápis (testy, před čtením souboru)
```

- Data jsou v paměti, soubor se čte líně při prvním `get`/`update`.
- **Atomický zápis** `.tmp` + `rename`, **fronta zápisů**: nejvýš jeden zápis souboru
  najednou, změny mezitím se sloučí do jednoho dalšího zápisu s posledním stavem.
- `update` pracuje s kopií: když funkce vyhodí (neplatný vstup), data se nezmění.
  Přesto nejdřív validuj a teprve pak měň.
- **Poškozený soubor** (neplatný JSON nebo `migrate` vrátí `null`) se přejmenuje na
  `<soubor>.broken-<čas>` a začne se z `defaults` (kontrakt kap. 8).
- Dvě volání `createJsonStore` nad **stejnou cestou** v jednom procesu sdílí stav i frontu.
  Díky tomu si jiný nástroj může data přečíst (viz 1.5) a restart serveru v testech
  nepřečte rozepsaný soubor.
- Při ukončení procesu se nezapsané změny dopíšou synchronně.
- Soubory mimo JSON (`data/poznamky/<sekce>.md`) si nástroj zapisuje sám; cestu vezme
  z `ctx.dataPath('poznamky/css-flexbox.md')` (nepustí ven z `data/`) a atomicky
  zapisuje stejně (`.tmp` + `fs.renameSync`).

### 1.2 Routy nástroje (`server/routes/<nástroj>.js`)

`server/routes/index.js` při startu naimportuje **všechny** `server/routes/*.js` kromě
`index.js`, `*.test.js` a souborů začínajících `_` (pomocné moduly, např. `_reviews-store.js`)
a zavolá jejich `register(router, ctx)` v abecedním pořadí. **Nikam se nic nepřidává.**

```js
// server/routes/reviews.js
import { HttpError } from '../errors.js';

export function register(router, ctx) {
  const store = ctx.createJsonStore('opakovani.json', { defaults: () => ({ version: 1, items: {} }) });

  ctx.onReset((id) => {                    // POST /api/progress/reset maže i data nástroje
    store.update((data) => {
      for (const key of Object.keys(data.items)) if (belongsTo(key, id)) delete data.items[key];
    });
  });

  router.get('/api/reviews/due', ({ query }) => ({ items: dueItems(store.get(), query.get('limit')) }));

  router.post('/api/reviews/answer', async ({ readBody }) => {
    const { id, ok, confidence } = await readBody();
    if (typeof ok !== 'boolean') throw new ctx.InputError('"ok" musí být true nebo false');
    return store.update((data) => answer(data, id, ok, confidence));
  });

  router.get('/api/reviews/section/:section', ({ params }) => {
    ctx.checkSlugs(params.section);
    if (!exists(params.section)) throw new HttpError(404, 'Sekce neexistuje');
    …
  });
}
```

- Metody: `router.get | post | put | patch | delete(path, handler)`. Parametry `:jmeno`
  (hodnota je dekódovaná; rozbité %-kódování → 400).
- Obsluha dostane objekt `{ req, res, url, params, query, readBody, signal }`:
  - `query` = `URLSearchParams`, `readBody()` = JSON objekt těla (prázdné = `{}`, špatné → 400, nad 5 MB → 413),
  - `signal` = AbortSignal zrušený, když klient zavře spojení (dlouhé běhy).
- Vrácená hodnota se pošle jako JSON 200; `undefined` → `{ ok: true }`. Obsluha smí
  odpovědět sama přes `res` (pak se vrácená hodnota ignoruje).
- Chyby: `throw new HttpError(409, 'česká zpráva')`, `throw new ctx.InputError('…')` (400).
  `ParseError` z obsahu → 500. Jiná výjimka → 500 a výpis do konzole.
- **Stejná metoda + cesta dvakrát** (i ve dvou souborech) shodí start serveru s hláškou,
  které soubory kolidují. Prefix cest = jméno nástroje (`/api/reviews/…`).
- Ochrana Host/Origin (kontrakt kap. 7) platí pro všechny routy automaticky.

### 1.3 Kontext `ctx`

| člen | co to je |
|---|---|
| `contentDir`, `dataDir`, `projectsDir`, `distDir` | cesty |
| `progress` | postup (`get`, `saveCode`, `complete`, `reset`, `flush`) — sdílený, jen číst nebo volat jeho metody |
| `createJsonStore(name, options)` | úložiště v `data/<name>` (1.1) |
| `dataPath(name)` | absolutní cesta uvnitř `data/` (vyhodí, když míří ven) |
| `loadCurriculum()` | osnova (kontrakt kap. 2.1) |
| `loadModule(section, module, { includeSolutions })` | detail modulu, výchozí bez řešení |
| `moduleExists(section, module)` | `module.json` existuje (a slugy jsou platné) |
| `contentIndex()` | `buildContentIndex(contentDir)` s mezipamětí (kap. 2.1) |
| `loadSectionExtras(section)` | `{ cards, pojmy, tahak }` jako surový text nebo `null` |
| `resolveItem(id)` | obsah položky `q:`/`card:`/`step:`/`explain:` → `{ id, type, source, content }` nebo `null` (kontrakt kap. 12.8); rozbitý obsah vyhodí `ParseError` |
| `on(name, fn)`, `await emit(name, payload)` | události mezi nástroji na serveru (1.5); `on` vrací odhlášení |
| `readTextTree(dir)` | textové soubory adresáře `[{ name, lang, content }]` |
| `readJsonBody(req)`, `sendJson(res, status, data)` | těla a odpovědi (v obsluze raději `readBody()`) |
| `HttpError`, `InputError` | chyby se stavem |
| `checkId(id)`, `checkSlugs(...slugy)`, `isPlainObject(v)` | validace (400) |
| `clampTimeout(value, výchozí, max)` | `timeoutMs` z požadavku |
| `abortOnDisconnect(res)` | AbortSignal zavřeného spojení |
| `limitRuns(task)` | fronta souběžných node běhů (sdílená s run-node a projekty) |
| `onReset(fn(id))` | resetter: zavolá se po resetu postupu s id sekce/modulu/kroku |
| `onClose(fn)` | úklid při `server.close()` (běžící procesy, časovače) |

`createApp` vrací `http.Server` s `server.akademie = { ctx, routes }` pro testy
(`await server.akademie.ctx.progress.flush()`, seznam rout). Testy můžou přidat vlastní
moduly rout: `createApp({ …, routes: [...routeModules, { name: 'x.js', register }] })`.

### 1.4 Reset

`POST /api/progress/reset { id }` nejdřív ověří id a smaže postup, pak zavolá všechny
resettery v pořadí registrace (`await`). Resetter smaže záznamy, které k id **patří**
(`key === id || key.startsWith(id + '/')`, u položek opakování přes `itemTarget`,
kontrakt kap. 2.10). `belongsTo(key, id)` je exportovaný ze `server/progress.js`.

### 1.5 Data a reakce jiného nástroje

Nástroj **nesahá do cizího souboru dat** a routy jednoho nástroje **neimportují soubory
jiného nástroje** (chybějící soubor souběžně psaného nástroje by shodil start serveru
všem). Místo toho:

- **Události na serveru:** vlastník dat po změně zavolá `await ctx.emit('<nástroj>:<co>', payload)`,
  jiný nástroj v `register()` poslouchá `ctx.on(…)`. Posluchači běží postupně a odpověď
  požadavku počká, až doběhnou (testy jsou deterministické). Chyba posluchače se jen vypíše.
- **Obsah podle id:** `ctx.resolveItem(id)` (kontrakt kap. 12.8), ne vlastní parsování.
- **Čtení cizích dat:** přes HTTP API z kontraktu kap. 12 (klient), nebo událostí.

Události serveru ve vlně 2b:

| událost | kdo vyvolá | payload | kdo poslouchá |
|---|---|---|---|
| `attempts:recorded` | `POST /api/attempts` po uložení (balík 1) | `{ id, body, attempt, previous, firstOk }` — `body` = ověřené tělo, `attempt` = záznam po změně, `previous` = před změnou (`null`, když nebyl), `firstOk` = tímto požadavkem poprvé `ok: true` | `reviews.js`: založení `q:` z první odpovědi, `step:` při `assisted` / `fails ≥ 3`; `confidence.js`: jistota u `q:` (kontrakt kap. 12.2–12.4) |
| `reviews:answered` | `POST /api/reviews/answer` po uložení (balík 3) | `{ id, ok, confidence, sectionId }` | `confidence.js`: jistota z opakování (do pokusů se odpověď z opakování neposílá, aby se nepočítala dvakrát) |

---

## 2. Sdílený kód (`shared/`)

### 2.1 Index obsahu `buildContentIndex(contentDir)` (`shared/content.js`)

Lehký přehled celého obsahu pro převod id na obsah (opakování, statistiky, validace id,
později hledání). Soubory se parsují jen při změně (mtime a velikost); když se nezměnilo
nic, vrátí se **stejný objekt** jako minule. Rozbitý modul index neshodí.

```js
{
  sections: [{ id, partId, title, available, uroven, modules: ['sekce/modul'], extras: { cards, pojmy, tahak } }],
  modules:  [{ id, sectionId, moduleId, type, title, summary, minutes, runtime, steps: ['sekce/modul/001'] }],
  steps:    [{ id, moduleId, number, title }],
  headings: [{ moduleId, level, text, anchor }],   // nadpisy lekcí úrovně 2 a 3 s kotvami
  errors:   [{ id, message }],                     // moduly, které nejdou načíst
}
```

Na serveru přes `ctx.contentIndex()`. Rozbitá `osnova.json` vyhodí `ParseError`.

Obsah jedné položky opakování nebo pokusů (otázka, karta, krok od seedu, bod checklistu)
podle id vrací `resolveContentItem(contentDir, id)` (`ctx.resolveItem(id)`, kontrakt
kap. 12.8). Klíče `q:`/`card:`/`explain:` najde, jakmile je parser vrací (`key`, vlna 2b).

### 2.2 Osnova a volitelné soubory sekce

- `loadCurriculum` navíc propouští `section.uroven` (`jadro` | `rozsireni` z položky
  `osnova.json`, slug = `jadro`, jiná hodnota = `ParseError`), `section.outcomes`
  (ze `section.json` tak, jak jsou, výchozí `[]`) a `curriculum.doporucenaTrasa`
  (výchozí `[]`).
- `loadSectionExtras(contentDir, sectionId)` → `{ cards, pojmy, tahak }`, každé text
  souboru nebo `null`. Parsování (`parseCards`, `parseTerms`) a `loadSection`/`loadTerms`
  podle kontraktu kap. 2.5–2.7 staví na tomhle.

### 2.3 Kotvy nadpisů (`shared/anchors.js`)

Jediná implementace kontraktu kap. 2.8 — `shared/refs.js` má `headingAnchor`
a `collectHeadings` jen re-exportovat.

```js
headingAnchor('Kopie pole: `slice` vs. `[...a]`')     // 'kopie-pole-slice-vs-a'
collectHeadings(mdTexts)                              // [{ level, text, anchor }] úrovně 2 a 3, přípony -2, -3
createSlugger()                                       // generátor kotev pro jeden dokument
anchoredHeadings(markdown, slugger)                   // nadpisy jednoho bloku (UI po blocích)
```

Klient: `renderMarkdown(text, { slugger })` dá nadpisům `h2`/`h3` `id` = kotva
a `data-anchor`. Lekce používá jeden slugger pro všechny `md` bloky, takže kotvy v DOM
jsou stejné jako v indexu a v parseru.

---

## 3. Klient: rozšíření, obrazovky, menu, API, události

```
client/src/
├── main.js                 jádro: styly, obrazovky jádra, router
├── router.js               parseHash, defineRoute, href
├── core/
│   ├── registry.js         createRegistry, createEmitter, createExtensionPoint
│   ├── events.js           appEvents — globální události
│   ├── slots.js            createSlots — místa v UI pro prvky rozšíření
│   ├── screens.js          registerScreen
│   └── header.js           registerHeaderItem, refreshHeader
├── api-request.js          apiRequest, ApiError
├── api.js                  endpointy jádra (needitovat, nástroje mají vlastní soubor)
├── extensions/
│   ├── index.js            automatické načtení (nic se tu nepřidává)
│   └── <nástroj>.js        ← vstup nástroje: registrace do registrů
├── workspace/              pracovní plocha (kap. 4.1)
├── lesson/                 bloky a rozšíření lekce (kap. 4.2)
├── components/             editor, otázky, výsledky testů, seznam nápověd…
├── screens/                obrazovky jádra
└── styles/                 tokens.css + styly jádra
```

### 3.1 Vstup nástroje `client/src/extensions/<nástroj>.js`

Vite při sestavení naimportuje každý `client/src/extensions/*.js` a
`client/src/extensions/*/index.js` (kromě `index.js` a `_*.js`) ještě před prvním
vykreslením. Soubor se při importu sám zaregistruje. Pořadí importu je abecední —
**nespoléhej na něj**, řaď přes `order`.

```js
// client/src/extensions/reviews.js
import './reviews/reviews.css';                             // vlastní styly nástroje
import { registerScreen } from '../core/screens.js';
import { registerHeaderItem } from '../core/header.js';
import { appEvents } from '../core/events.js';
import { renderReviews } from './reviews/screen.js';

registerScreen({ name: 'reviews', path: '/opakovani', render: renderReviews });
registerHeaderItem({ id: 'opakovani', order: 20, label: 'Opakování', href: '#/opakovani', routes: ['reviews'] });
appEvents.on('quiz:evaluated', ({ id, results }) => { … });
```

Větší nástroj si dá soubory do podadresáře `client/src/extensions/reviews/`
(`index.js` se načte sám, ostatní soubory importuje on).

### 3.2 Obrazovky a cesty

```js
registerScreen({ name: 'notes', path: '/poznamky/:sectionId?', render(ctx, route) { … } });
// #/poznamky            → route = { name: 'notes', sectionId: null }
// #/poznamky/css-flexbox?q=grid → { name: 'notes', sectionId: 'css-flexbox', query: { q: 'grid' } }
```

- `:jmeno?` = nepovinný poslední parametr (`null`, když chybí). Dotaz za `?` je
  v `route.query` (klíč jen když dotaz je) — tak funguje i `#/modul/a/b?kotva=x`.
- `render(ctx, route)` dostane `ctx.root`, `ctx.signal`, `ctx.onCleanup(fn)`,
  `ctx.setCrumbs([{ label, href }])`, `ctx.setLayout('page' | 'workspace')`, `ctx.setTitle(text)`.
- Pomocníci pro načítání: `withLoading`, `showLoadError` (`screens/load.js`),
  `errorNotice`, `loadingNotice` (`components/status.js`).

### 3.3 Menu v hlavičce

```js
registerHeaderItem({
  id: 'hledat', order: 10, label: 'Hledat', href: '#/hledat', routes: ['search'],
  icon: MY_ICON_PATH,          // nepovinné, SVG cesta viewBox 0 0 16 16 (ikonu si nástroj definuje sám)
  badge: () => count || null,  // nepovinné, krátký text; po změně zavolej refreshHeader()
  onClick: (event) => {},      // nepovinné (bez href = tlačítko)
  shortcut: 'Ctrl+K',          // jen popisek v title
});
```

Doporučené pořadí (`order`): Hledat 10 · Opakování 20 · Poznámky 30 · Pískoviště 40 ·
Statistiky 50. Bez položek je menu skryté. Styly `.app-menu*` jsou v `styles/layout.css`.

### 3.4 Volání API

```js
// client/src/extensions/reviews/api.js
import { apiRequest } from '../../api-request.js';
export const reviewsApi = {
  due: ({ signal } = {}) => apiRequest('GET', '/api/reviews/due', undefined, { signal }),
  answer: (body) => apiRequest('POST', '/api/reviews/answer', body),
};
```

Vrací JSON tělo nebo vyhodí `ApiError` (`message` česky, `status`, `offline`).
Parametry cesty obal `encodeURIComponent`. `api.moduleWithSolutions(section, module)`
je v jádře (porovnání s řešením).

### 3.5 Globální události `appEvents` (`core/events.js`)

| událost | payload |
|---|---|
| `route:change` | `{ route }` |
| `progress:complete` · `progress:reset` | `{ id, score }` · `{ id }` |
| `workspace:mount` | `{ ws, id }` |
| `workspace:files-change` | `{ ws, id, files }` |
| `workspace:check-start` | `{ ws, id, files }` |
| `workspace:check-result` | `{ ws, id, result, files, passed }` — `result` po transformacích (4.4) |
| `workspace:check-error` | `{ ws, id, error }` |
| `workspace:step-complete` | `{ ws, id }` — splnění uložené na serveru |
| `workspace:reset` | `{ ws, id, files }` |
| `lesson:mount` · `lesson:complete` | `{ lesson }` · `{ lesson, id }` |
| `lesson:questions-checked` | `{ lesson, id, results: [{ index, correct, question }] }` |
| `quiz:evaluated` | `{ id, score, passed, results: [{ index, correct, question }] }` |
| `project:check-result` | `{ id, result, passed }` |
| `attempts:recorded` | `{ id, attempt }` — pokus uložený přes `attemptsApi.record` (`extensions/attempts/api.js`) |
| `notes:open` | `{}` — otevře panel poznámek pro aktuální místo (poslouchá `extensions/notes/`) |

`lesson:questions-checked` se vyvolá po **každém** vyhodnocení otázky z `# --questions--`
(výsledky dosud vyhodnocených otázek), ne jednou za lekci.

Chyba v posluchači se vypíše do konzole a nezastaví ostatní. Nová událost nástroje
má prefix jména nástroje (`reviews:answered`) a popíše se u nástroje.

---

## 4. Klient: rozšiřovací body obrazovek

### 4.1 Pracovní plocha (krok workshopu, lab) — `client/src/workspace/`

Soubory: `index.js` (jádro a tok kontroly), `brief.js` (zadání, požadavky, tlačítka),
`output-browser.js` (náhled a konzole dom/js/vue), `output-node.js` (Spustit a výstup),
`stepper.js` (lišta kroků), `result.js` (souhrn kontroly), `files.js` (výchozí soubory),
`extensions.js` (registry).

**Rozšíření plochy:**

```js
import { h } from '../dom.js';
import { workspaceExtensions } from '../workspace/extensions.js';

workspaceExtensions.register({
  id: 'hints',
  order: 10,
  setup(ws) {
    if (!ws.item.help?.length) return;
    const button = h('button', { type: 'button', class: 'btn btn--quiet' }, 'Potřebuju nápovědu');
    ws.addToSlot('actions', button, { order: 10 });
    ws.on('check-result', ({ passed, result }) => {
      if (!passed && ws.state().failedChecks >= 2) button.classList.add('is-highlighted');
      const firstFailed = result.results.find((r) => !r.pass && !r.skipped);
      if (firstFailed) ws.hintList.itemElement(firstFailed.index)?.classList.add('hint--focus');
    });
    return () => { /* úklid, když nestačí ws.onCleanup */ };
  },
});
```

`ws` (API plochy):

| člen | co to je |
|---|---|
| `item`, `module`, `steps`, `stepIndex`, `nav` | data (item = výstup parseStep bez řešení) |
| `runtime`, `kind`, `isWorkshop`, `isNode` | druh plochy |
| `signal`, `onCleanup(fn)` | odchod z obrazovky |
| `editor` | `getFiles()`, `setFiles(files)`, `focus()`, `activeFile()`, `selectFile(name)`, `revealLine(name, line)`, `view` |
| `preview` | živý náhled (`update`, `onConsole`), `null` u node |
| `consolePanel` | `receive(entry)`, `log`, `error`, `system`, `clear` |
| `hintList` | `itemElement(i)`, `status(i)`, `setResults`, `reset` |
| `elements` | `{ root, brief, editor, output, result, previewHost }` |
| `getFiles()`, `setFiles(files, { save })` | soubory; `setFiles` uloží a obnoví náhled (např. „Pokračovat autorovým řešením") |
| `check()`, `focusEditor()` | spustí kontrolu / fokus |
| `state()` | `{ passed, checking, changedSincePass, completed, failedChecks }` |
| `addToSlot(slot, element, { order })` | vloží prvek, vrátí funkci na odebrání |
| `on(event, fn)` | `check-start`, `check-result`, `check-error`, `step-complete`, `files-change`, `reset` — jen pro tuto plochu, odhlásí se samo |

**Sloty:**

| slot | kde |
|---|---|
| `brief-head` | pod nadpisem kroku (štítky druhu kroku, proužek „Pokračuješ autorovým řešením", Než začneš) |
| `brief-after-description` | pod popisem kroku, nad požadavky (čtyři kroky ladění u `kind: debug`) |
| `brief-after-hints` | pod seznamem požadavků (tipy, vysvětli vlastními slovy, diff) |
| `actions` | lišta tlačítek vedle Zkontrolovat a Obnovit |
| `output-tools` | vedle nadpisu Náhled (dom/vue), Konzole (js) nebo Výstup (node) — šířka náhledu, nová karta |
| `output-after` | pod konzolí ve výstupním panelu (HTTP klient) |
| `bar` | konec lišty s kroky (jen workshop) |

Prázdný slot je skrytý a rozložení neovlivní; obsah slotu se chová jako přímí potomci
rodiče (`display: contents`), výjimkou je `output-tools` u náhledu, který je sám krabička `.pane__tools`.

**Druh kroku s vlastní plochou místo editoru** (parsons):

```js
import { registerStepKind } from '../workspace/extensions.js';
registerStepKind({
  kind: 'parsons',
  createEditor(host, { files, onChange, onSubmit, item, runtime }) {
    // vykreslí se do host (panel editoru); onChange(files) po každé změně pořadí
    return { getFiles, setFiles, focus, destroy };   // stejné rozhraní jako editor kódu
  },
});
```

Kontrola, ukládání a náhled pak fungují beze změny nad tím, co vrací `getFiles()`.
Druhy bez registrace (`step`, `debug`, `recall`, `choose`) mají editor kódu; štítky
a „čtyři kroky ladění" přidá rozšíření do `brief-head`.

### 4.2 Lekce — `client/src/lesson/`

**Nový blok** (`:::check`, `:::memory`, `:::explain`, `:::compare`…) = soubor
`client/src/lesson/blocks/<kind>.js` + jeden řádek registrace ve vstupu nástroje:

```js
// client/src/lesson/blocks/memory.js
import { h } from '../../dom.js';
export const memoryBlock = {
  kind: 'memory',
  render(block, env) {
    return h('figure', { class: 'memory' }, …);                    // prvek
    // nebo { element, mount() {…}, destroy() {…} } — mount až je prvek ve stránce (iframe)
  },
};

// client/src/extensions/lesson-blocks.js
import { registerLessonBlock } from '../lesson/blocks.js';
import { memoryBlock } from '../lesson/blocks/memory.js';
registerLessonBlock(memoryBlock);
```

`env`: `lesson` (API lekce níž), `index` (pořadí bloku), `number` (pořadí bloku
stejného kind od 1), `slugger` (pro `renderMarkdown` s kotvami). Blok, který podmiňuje
splnění (`:::check` bez `pretest`, kontrakt kap. 5.8), zavolá při vykreslení
`env.lesson.addRequirement({ id, label, isMet: () => vyřešeno, element })` (`element` nepovinný:
kam tlačítko v hlášce „Ještě vyřeš…" odscrolluje). Neznámý kind
se ukáže jako upozornění „blok zatím aplikace neumí zobrazit".

Bloky jádra: `md` (`lesson/blocks/md.js`), `live` (`lesson/blocks/live.js`), registrované
v `lesson/blocks/index.js`.

**Rozšíření lekce** (poznámky, „Nerozumím", obsah lekce):

```js
import { lessonExtensions } from '../lesson/extensions.js';
lessonExtensions.register({
  id: 'lesson-toc',
  setup(lesson) {
    const links = lesson.headings().map((heading) =>
      h('button', { type: 'button', class: 'lesson-toc__link', onclick: () => heading.element.scrollIntoView() }, heading.text));
    lesson.addToSlot('aside', h('nav', { class: 'lesson-toc', 'aria-label': 'Obsah lekce' }, links));
  },
});
```

`lesson`: `module`, `id`, `nav`, `article`, `signal`, `onCleanup`, `headings()` →
`[{ anchor, text, level, element }]`, `addToSlot(name, el)` se sloty `head`,
`before-finish`, `end`, `aside`, `addRequirement(…)`, `unmetRequirements()`.
Pozor: hash `#kotva` koliduje s routerem — skok na nadpis dělej přes
`element.scrollIntoView()` nebo adresu `?kotva=` (kontrakt kap. 2.9).

### 4.3 Otázky — `client/src/components/question.js`

```js
import { registerQuestionType } from '../components/question.js';
import { createTextQuestion } from '../components/questions/text.js';
registerQuestionType({ id: 'text', order: 10, match: (q) => q.type === 'text', create: createTextQuestion });
```

`create(question, { key, number, total, onChange })` vrátí `{ element, isAnswered(), focus(), reveal() → boolean, answer?() }`.
Kvíz, lekce, `:::check` i opakování volají jen `createQuestion(question, options)`.
Otázka s výběrem je v `components/questions/choice.js`, unikátní čísla prvků
`nextQuestionUid()` z `components/questions/uid.js`.

### 4.4 Výsledky testů — `client/src/components/test-result.js`

```js
registerRunTransform({ id: 'errors-cs', order: 10, transform(run, { item, files, runtime }) {
  // např. SyntaxError → požadavky neověřené s vysvětlením
  return { ...run, results: run.results.map((r) => ({ ...r, skipped: true, note: 'Neověřeno — kód nejde spustit.' })) };
} });

registerHintResultRenderer({ id: 'actual-expected', order: 10, render({ result, hint, index, run, item }) {
  if (result.actual === undefined) return null;       // null = nech to dalšímu / výchozímu
  return h('div', { class: 'hint-diff' }, …);
} });

registerRunSummaryRenderer({ id: 'errors-cs', order: 10, render({ run, item, total, passedCount, skipped, context }) {
  return run.errors?.length ? [h('p', …), h('pre', …)] : null;   // context: 'workspace' | 'project'
} });
```

- Transformace běží na pracovní ploše i u projektu před zobrazením a před událostí
  `workspace:check-result`. `results[i].skipped` + `note` = požadavek „neověřeno" s tvým textem.
- U detailu požadavku a souhrnu vyhrává první renderer (podle `order`), který vrátí prvek.

### 4.5 Editor — `client/src/components/code-editor.js`

```js
import { registerEditorExtension } from '../components/code-editor.js';
registerEditorExtension({
  id: 'js-lint',
  order: 10,
  extension: ({ name, lang, region, runtime, context, compact, item }) =>
    lang === 'js' ? [linter(jsLint), lintGutter()] : null,
});
```

Volá se pro každý soubor v každém editoru; `context` je `'workspace'` (krok, lab) nebo
`'live'`/`'editor'` (ostatní). Balíčky: `@codemirror/lint`, `@codemirror/view`, `@codemirror/state`.

### 4.6 Další obrazovky

| extension point | soubor | sloty | API navíc |
|---|---|---|---|
| `projectExtensions` | `screens/project.js` | `head`, `after-stories`, `end` | `module`, `runtime`, `page`, `hintList` |
| `quizExtensions` | `screens/quiz.js` | `head`, `end` | `module`, `quiz`, `page` |
| `overviewExtensions` | `screens/overview.js` | `head`, `before-toc`, `end` | `curriculum`, `page` |
| `sectionExtensions` | `screens/section.js` | `head`, `after-progress`, `end` | `curriculum`, `part`, `section`, `page` |

Registrace je všude stejná: `xExtensions.register({ id, order, setup(api) { api.addToSlot(…) } })`.

### 4.7 CSS a tmavý režim

- **Barvy jen v `client/src/styles/tokens.css`** jako custom properties
  (`--surface`, `--ink`, `--accent`, `--done`, `--code-*`, `--console-*`, `--tok-*`…).
  Ostatní CSS i JS (téma CodeMirroru) používá `var(--…)`. Novou barvu přidej jako token.
- Tmavý režim: atribut `data-theme` na `<html>`. `tokens.css` má `:root, :root[data-theme='light']`
  a připravené místo pro `:root[data-theme='dark']` se stejnými jmény. Přepínač a uložení
  volby (`data/nastaveni.json`) patří nástroji tmavého režimu.
- `--preview-bg` zůstává bílé i v tmavém režimu (uživatelova stránka má vlastní barvy).
- Nástroj má **vlastní CSS soubor** (importuje ho jeho vstup v `extensions/`), styly jádra neupravuje.
  Třídy s prefixem nástroje (`.reviews__…`, `.hint-tips__…`).

---

## 5. Vlastnictví souborů — pravidla

Každý existující soubor v `server/`, `client/`, `shared/` a `tools/` má ve vlně 2b
**právě jednoho** vlastníka (kap. 7.3) nebo patří do jádra. Upravovat existující soubor
smí jen vlastník; nové soubory si každý zakládá ve svém jmenném prostoru (kap. 7.2).

### 5.1 Jádro (nikdo z 2b)

Potřebná změna jde koordinátorovi.

- **server:** `app.js`, `index.js`, `context.js`, `router.js`, `http.js`, `store.js`, `errors.js`,
  `validate.js`, `progress.js`, `routes/index.js`, `routes/{curriculum,progress,projects,run-node}.js`,
  testy `{app,progress,router,store}.test.js`, `test-fixtures/content/`
- **client:** `index.html`, `src/main.js`, `src/router.js`, `src/core/*`, `src/api.js`,
  `src/api-request.js`, `src/progress.js`, `src/dom.js`, `src/content.js`, `src/text.js`,
  `src/shuffle.js`, `src/run.js`, `src/extensions/index.js`, `src/workspace/extensions.js`,
  `src/lesson/blocks.js`, `src/lesson/extensions.js`, `src/components/{status,copy-field}.js`,
  `src/components/questions/uid.js`, `src/screens/not-found.js`
- **shared:** `anchors.js`, `anchors.test.js`
- **tools:** `client-unit.test.js`
- **docs:** `platforma.md` (nástroje jen přidávají vlastní kapitolu, 5.4)

### 5.2 Přidělení

Kdo co ve vlně 2b vlastní, na čem závisí a jak ověří, je v **kap. 7**. Obecná pravidla:

- **Jediná sdílená místa jsou datové kontrakty, ne soubory:** tvar dat v `data/*.json`,
  endpointy z kontraktu kap. 12, události (1.5, 3.5) a rozhraní z kap. 7.2.
- Klientský kód volá cizí endpoint **přímo** přes `apiRequest` podle kontraktu, neimportuje
  cizí `api.js`.
- Vlastník kostry obrazovky nesmí odebrat ani přejmenovat existující slot, člen `ws`/`lesson`,
  událost ani registr. Chybějící slot nebo událost přidá vlastník na požádání (jedna
  aditivní změna) a do té doby žadatel použije nejbližší existující.
- Menu: položku přidává vlastník obrazovky ve svém vstupu v `extensions/`.
- Ikony a barvy: nástroj definuje SVG cesty ve svém souboru; novou barvu jako token
  v `tokens.css` přidá na požádání balík 6 (do té doby existující token).

### 5.3 Když přece musíš sáhnout do cizího nebo sdíleného souboru

1. Nejdřív hledej registr, slot nebo událost (kap. 3–4). Skoro vždy existuje.
2. Když ne, udělej změnu co nejmenší a **aditivní** (nový export, nový slot, nová
   událost), nic nepřejmenovávej a nepřesouvej. Před úpravou soubor znovu přečti
   (souběžně ho mohl změnit vlastník) a měň přesný úsek, ne celý soubor.
3. Změnu uveď v závěrečné zprávě s důvodem.

### 5.4 Dokumentace nástrojů

Každý agent popíše svůj nástroj (endpointy, soubory, události, které vyvolává) ve
**vlastní kapitole na konci tohoto dokumentu** (za kap. 7) pod nadpisem `## Nástroj: <jméno>` —
jen přidává, cizí kapitoly ani kap. 1–7 nemění.

---

## 6. Ověření a testy

```
npm test                                  # unit a integrační testy (shared, server, tools)
npx vite build                            # klient se sestaví
npm run overit                            # verify celého obsahu
node tools/e2e.js --port <port z rozsahu> # kouřový průchod UI
```

- Testy serveru bez prohlížeče: `createApp({ …, routes: [...routeModules, mujModul] })`
  na portu 0, po zápisech `await server.akademie.ctx.createJsonStore('x.json').flush()`.
  Vzor je `server/router.test.js`.
- Testy logiky klienta bez DOM (router, registry, výpočty) jdou do nového
  `tools/<nástroj>-unit.test.js` (`tools/client-unit.test.js` je jádro, ve vlně 2b ho nikdo nemění). Soubory, které při importu sahají na
  `document`/`window`, v Node nejdou naimportovat — výpočty drž v samostatném modulu.
- UI testy v prohlížeči: nový soubor `tools/ui-<nástroj>.test.js` podle `tools/ui.test.js`
  (vlastní fixture obsah v `tools/fixtures/<nástroj>-content/`). `tools/e2e.js` je kouřový průchod
  nad skutečným obsahem: jádro (přehled, lekce, workshop, lab, kvíz, projekt, restart) a od
  integrace 2b i nástroje (nápověda → porovnání s řešením, opakování, poznámky, tmavý režim);
  nový scénář jen tehdy, když chrání napojení, které unit a UI testy nevidí.
- Porty: každý agent jen ze svého přiděleného rozsahu (`--port`, `listen(server, port)`).
  Testy runneru (`tools/lib/test-setup.js`) berou první volný port z 4320–4339, souběh
  víc běhů `npm test` snesou.

---

## 7. Vlna 2b — přidělení práce

Šest balíků platformy běží **souběžně** (fáze 2b). Tři balíky přepracování pilotů
běží souběžně **po sloučení 2b** (fáze 2c). Zdroj pravdy pro formáty a API je
`docs/kontrakt.md`; tahle kapitola určuje, **kdo** co píše a přes jaké rozhraní se balíky
potkávají. Nikdo nečeká na hotový kód jiného balíku: pracuje proti tvaru dat z kontraktu
(fixture data, volitelné volání `?.()`), a když cizí část dorazí, jen ověří napojení.

### 7.1 Přehled

| balík | položky návrhu | hlavní kapitoly kontraktu | porty |
|---|---|---|---|
| **1** Nápovědy, diff, pokusy | B1, B2, B8 | 3.3, 12.2, 7, 8 | 4400–4419 |
| **2** Chyby česky, lint, runner | B3, B4, runner části B11 | 6 (celá), 3.1 (`timeoutMs`), 10 K1–K2 (tvar výsledku) | 4420–4439 |
| **3** Opakování, jistota, otázky, karty v UI | B5, B6, B7, A1 UI, A5 UI, A15 UI | 2.5, 2.10, 4 (celá), 12.3, 12.4, 12.2 (`firstScore`) | 4440–4459 |
| **4** Formáty obsahu: parser, verify, bloky lekcí, druhy kroků | A1–A15 (parser, verify), A2, A3, A8, A9, A10, A6, A7, A11–A13 UI | 2, 3, 4.1–4.4, 5, 7 (`/api/section`, `/api/terms`), 10, 12.8 | 4460–4479 |
| **5** Běžící Node a HTTP klient | B10 | 12.7, 6.6, 9 | 4480–4499 |
| **6** Poznámky, drobnosti, orientace, tmavý režim | B9, B11 (UI), B12 | 12.5, 12.6, 2.9 (`?kotva=`), 2.1 (trasa), 6.7 (přepínač šířky), 8 (`lastVisited`) | 4500–4519 |
| **P1** Pilot `css-flexbox` | D4, D5 | 2.5–2.7, 3.3–3.7, 5, styl-obsahu | 4520–4539 |
| **P2** Pilot `js-pole` | D1, D2, D3 | 2.5–2.7, 3.3–3.8, 4.3, 5, styl-obsahu | 4540–4559 |
| **P3** Pilot `node-zaklady` | D6 | 2.5–2.7, 3.3–3.9, 6.6, 6.9, 12.7, styl-obsahu | 4560–4579 |

Porty: server testů, `tools/e2e.js --port`, Playwright. Testy runneru dál berou první
volný port z 4320–4339 (`tools/lib/test-setup.js`), procesy `dev-process` a
`helpers.startServer` dostávají volný port od systému. Mimo svůj rozsah nic neposlouchej.

**První dodávky** (odblokují ostatní, udělej je jako první a hned je ohlas):

1. Balík 4: `shared/answers.js` a `shared/refs.js` přesně podle kontraktu kap. 2.8–2.10
   a 4.2 (kód je v kontraktu), v parseru `key` u otázek, `kind`, `help`, `see` a `explain`,
   `parseLesson(...).headings` přes `collectHeadings` ze `shared/anchors.js` (klient už čte
   `item.kind` a `data-anchor`).
2. Balík 1: `shared/diff.js` (7.2).
3. Balík 2: metody `setViewport`, `setCssVariables`, `openInNewTab` v `Preview` (klidně
   nejdřív jen `setViewport` a `setCssVariables`) a `shared/syntax-check.js`.
4. Balík 3: `isSolved()` a volba `itemId` v rozhraní otázky (7.2).

### 7.2 Rozhraní mezi balíky (závazná)

**Jmenné prostory nových souborů.** Nový soubor zakládá jen balík, kterému patří jeho
prefix. Platí pro `server/routes/`, `client/src/extensions/`, `shared/`, `tools/`
(`tools/<prefix>-unit.test.js`, `tools/ui-<prefix>.test.js`, `tools/fixtures/<prefix>-content/`),
testy serveru vedle souboru (`server/routes/<prefix>.test.js`, fixture v
`server/test-fixtures/<prefix>/`) a CSS nástroje vedle jeho vstupu.

| balík | prefixy |
|---|---|
| 1 | `attempts`, `hints`, `solution-diff`, `stats`, `diff` |
| 2 | `errors-cs`, `lint`, `syntax-check`, `runner` |
| 3 | `reviews`, `confidence`, `cards-ui`, `quiz-`, `questions/text` |
| 4 | `sections`, `lesson-blocks`, `step-kinds`, `answers`, `refs`, `verify`, `parse`, `lesson/blocks/<kind>` |
| 5 | `dev-process` |
| 6 | `notes`, `settings`, `theme`, `lesson-toc`, `shortcuts`, `preview-tools`, `next-on-route`, `search`, `orientation` |

**`shared/diff.js`** (balík 1, používá i balík 4):

```js
diffLines(before, after, { ignoreWhitespace = false } = {})
  // → [{ type: 'same' | 'add' | 'del', text, beforeLine: number | null, afterLine: number | null }]
  // řádkový LCS, \r\n = \n; ignoreWhitespace porovnává řádky po normalizeWhitespace
changeRatio(seedLines /* string[] posuzovaných řádků */, userText /* string */)
  // → 0..1: podíl neprázdných řádků seedu, které v userText po LCS (řádky po trim) chybí (kontrakt kap. 3.4)
```

**`shared/syntax-check.js`** (balík 2, používá prohlížečový runner i `server/node-runner.js`):

```js
findSyntaxError(files /* [{ name, content }] */) // → null | { file, line, column, message } (kontrakt kap. 6.1)
```

**`Preview`** (balík 2, kontrakt kap. 6.7): `setViewport`, `setCssVariables`, `openInNewTab`,
`onConsole` s `file`/`line`/`column`. Volající (balík 4 `controls`/`:::compare`/předpověď,
balík 6 přepínač šířky a nová karta) volají `preview.setViewport?.(…)`, dokud metoda chybí.

**Otázka** (`client/src/components/question.js`, balík 3). Rozhraní z kap. 4.3 se rozšíří,
nic se neubírá:

```js
createQuestion(question, {
  key, number, total, onChange,
  itemId: 'q:js-pole/kviz#1b4f0e98' | null,  // null/chybí = nehodnotí se nikam (pretest, předpověď)
  onEvaluated: ({ correct, solved, confidence }) => {},   // po každém vyhodnocení
})
// instance navíc: isSolved() — správně zodpovězená nebo odhalená (kontrakt kap. 4.5)
```

S `itemId` otázka sama ukáže volbu jistoty a pošle `POST /api/attempts` (`ok`, `confidence`).
Volající: kvíz a opakování (balík 3), `:::check` a `# --questions--` lekce (balík 4). Do
splnění lekce (kontrakt 5.8) balík 4 počítá `isSolved?.() ?? isAnswered()`.

**Události serveru:** `attempts:recorded` (1.5). Balík 1 ji vyvolá, balík 3 poslouchá.
Routy balíků 1 a 3 se navzájem neimportují.

**Obsah podle id:** `ctx.resolveItem(id)` / `resolveContentItem` (kontrakt kap. 12.8) —
balíky 1 a 3 ho používají, balík 4 zajistí, že parser vrací `key` (pak funguje sám).

**HTTP mezi balíky** (volá se přímo přes `apiRequest`):

| endpoint (vlastník) | kdo ho volá navíc |
|---|---|
| `POST /api/attempts` (1) | 3 (otázky, `score` kvízu), 4 (`solutionViewed` u přístupů před splněním) |
| `POST /api/reviews/add` (3) | 4 (nezaškrtnuté body `explain`) |
| `POST /api/notes/:section/append` (6) | 4 (`explain`, `plan` z „Než začneš") |
| `GET /api/section/:section`, `GET /api/terms` (4) | jen balík 4 (tahák, outcomes, pojmy); „Další na trase" (6) bere data z `GET /api/curriculum` |
| `GET/PUT /api/settings` (6) | jen balík 6 (tmavý režim, šířka náhledu) |

### 7.3 Balíky platformy

Každý balík: **vlastní** = smí upravit existující soubory a zakládat nové ve svých
prefixech. **Registrace** = jediné řádky, kterými se napojí na jádro (všechny ve vlastních
souborech — routy a rozšíření se načítají automaticky). **Nesahá** = typické pokušení,
které patří jinému balíku.

#### Balík 1 — nápovědy (B1), porovnání s řešením (B2), pokusy a statistiky (B8)

- **Vlastní existující:** nic.
- **Nové:** `server/routes/attempts.js` (`POST/GET /api/attempts`, `GET /api/stats`),
  `server/routes/_attempts-store.js`, `shared/diff.js` (+ test), `client/src/extensions/hints.js`,
  `client/src/extensions/solution-diff.js`, `client/src/extensions/attempts.js` (odesílání
  `ok`/`failed`/`activeMs`/`tipsOpened`/`solutionViewed` z plochy a projektu),
  `client/src/extensions/stats/` (`#/statistiky`), vlastní CSS.
- **Registrace:** `register(router, ctx)`; `ctx.onReset` (pokusy, kontrakt kap. 8);
  `ctx.emit('attempts:recorded', …)`; `workspaceExtensions.register` (sloty `actions`,
  `brief-after-hints`, `brief-head` — proužek „Pokračuješ autorovým řešením"); `projectExtensions.register`;
  `registerScreen({ name: 'stats', path: '/statistiky' })`; `registerHeaderItem({ id: 'statistiky', order: 50 })`.
- **Závisí na:** kontrakt 3.3 (UI nápověd, `failsSinceOk ≥ 2`), 12.2 (celé), 7 (`?solution=1`,
  `api.moduleWithSolutions`), 8 (reset), 12.8 (`resolveItem`); balík 4 — parser `help`, `see`, `key`
  (do té doby fixture s ručně doplněnými poli).
- **Nesahá:** `hint-list.js` (balík 2 — zvýraznění přes `ws.hintList.itemElement`), úložiště
  opakování (jen událost).
- **Ověření:** `node --test server/routes/attempts.test.js shared/diff.test.js` (pravidla 12.2:
  `assisted`, `failsSinceOk`, maximum `tipsOpened`, `firstScore`, 400 pro neznámé `q:`, reset,
  událost s `firstOk`); `tools/ui-hints.test.js` na portu z rozsahu (2 neúspěchy → zvýraznění,
  poslední tip → diff s potvrzením, `assisted`); `npm test`, `npx vite build`.

#### Balík 2 — výsledky a chyby česky (B3), lint (B4), runner (sourceURL a Preview API z B11)

- **Vlastní existující:** `client/runner.html`, `client/src/runner/**`, `client/src/components/{test-result,hint-list,code-editor}.js`,
  `server/node-runner.js` (+ test), `server/node-harness.js`, `server/text-helpers.js` (+ test),
  `tools/runner.test.js`, `tools/runner-unit.test.js` (bez bloku verify, viz balík 4),
  `tools/lib/{build-runner,runner-pool,static-app,test-setup,listen}.js`.
- **Nové:** `shared/errors-cs.js` (+ test), `shared/syntax-check.js` (+ test),
  `client/src/extensions/errors-cs.js`, `client/src/extensions/lint/`.
- **Registrace:** `registerRunTransform`, `registerHintResultRenderer`, `registerRunSummaryRenderer`
  (`errors-cs`), `registerEditorExtension` (`lint`), `workspaceExtensions.register`
  (označení řádku chyby za běhu přes `ws.preview.onConsole` a `ws.editor.revealLine`).
- **Závisí na:** kontrakt 6.1 (`actual`/`expected`/`operator`/`generatedMessage`/`diff`,
  `syntaxError`, `skipped`), 6.3 (`sourceURL`), 6.7 (Preview API), 6.8, 6.9, 2.9 (`see`
  v `errors-cs.js`). Na jiných balících nezávisí.
- **Nesahá:** `workspace/output-browser.js` a přepínač šířky (balík 6), `console-panel.js`
  v `components/` (balík 6 — vysvětlení chyb patří do souhrnu výsledku), parser.
- **Ověření:** `tools/runner.test.js` a `runner-unit.test.js` rozšířené o `actual`/`expected`
  i s vlastní zprávou, `diff` u `deepEqual`, `syntaxError` (script i module, inline skript
  v HTML, node bez `cwd`), `setCssVariables`/`setViewport` bez znovunačtení; `server/node-runner.test.js`
  pro node; `npm run overit` na stávajícím obsahu beze změny počtu chyb; `npm test`, `npx vite build`.

#### Balík 3 — opakování (B5), jistota (B6), otázky neprozradí odpověď (B7), karty v UI

- **Vlastní existující:** `client/src/components/question.js`, `client/src/components/questions/choice.js`,
  `client/src/screens/quiz.js`, `client/src/styles/quiz.css`.
- **Nové:** `server/routes/reviews.js` (`/api/reviews/*`), `server/routes/confidence.js`
  (`/api/confidence*`), `server/routes/_reviews-store.js`, `server/routes/_confidence-store.js`,
  `client/src/components/questions/text.js`, `client/src/extensions/reviews/` (`#/opakovani`,
  karty všech typů, `step` od seedu), `client/src/extensions/confidence.js`, vlastní CSS.
- **Registrace:** `register(router, ctx)`; `ctx.on('attempts:recorded', …)`; `ctx.onReset`
  (opakování včetně `removed`; jistota se nemaže); `registerQuestionType({ id: 'text' })`;
  `registerScreen({ name: 'reviews', path: '/opakovani' })`; `registerHeaderItem({ id: 'opakovani', order: 20 })`;
  `overviewExtensions` („K opakování: N (asi M min)"); `sectionExtensions` (věta kalibrace);
  `workspaceExtensions` (tlačítko „Nezvládl bych to znovu" po splnění → `POST /api/reviews/add`).
- **Závisí na:** kontrakt 2.5 (tvar karty), 2.10, 4 (celá: B7, psaná odpověď, sady `# --code--`
  v kvízu), 12.3, 12.4, 12.8; balík 4 — `shared/answers.js` (první dodávka; vlastní
  normalizaci nepsat) a `parseCards` (do té doby testy nad kartami sestavenými ručně ve
  tvaru kap. 2.5); runner `runTests` pro karty `code js` (existuje).
- **Nesahá:** `POST /api/attempts` (balík 1), `screens/lesson.js` a bloky lekce (balík 4),
  `screens/section.js`/`overview.js` (balík 6 — jen přes extension pointy).
- **Ověření:** `server/routes/reviews.test.js` (Leitner: první odpověď `sure`/`guess`/chyba,
  `answer` s `guess` nepovyšuje, denní strop a proložení po sekcích, aktivace karet, osiřelé
  položky, `removed`, reset, odhad času, 404/400), `confidence.test.js`; `tools/reviews-unit.test.js`
  pro výběr a plánování bez DOM; `tools/ui-reviews.test.js` (první špatný pokus neukáže
  správnou, druhý ano, kvíz „Projít jen chybné"); `npm test`, `npx vite build`.

#### Balík 4 — formáty obsahu: parser, verify, bloky lekcí, druhy kroků

Největší balík. Doporučené pořadí: (a) `answers.js`, `refs.js`, parser všech formátů + testy,
(b) `loadSection`, `loadTerms`, routy, (c) verify, (d) UI bloků a druhů kroků.

- **Vlastní existující:** `shared/parse.js` (+ test), `shared/content.js` (+ test),
  `tools/verify.js`, `tools/verify.test.js`, `tools/e2e.js`, `tools/lib/{content-checks,content-scan,czech,report}.js`,
  `tools/fixtures/content/`, `client/src/lesson/blocks/{index,md,live}.js`,
  `client/src/components/live-example.js`, `client/src/screens/lesson.js`, `client/src/markdown.js`,
  `client/src/styles/{lesson,prose}.css`.
- **Nové:** `shared/answers.js`, `shared/refs.js` (kotvy jen re-export z `anchors.js`),
  `server/routes/sections.js` (`GET /api/section/:section`, `GET /api/terms`),
  `client/src/lesson/blocks/{check,explain,memory,compare}.js` (a režim `predict`
  v `live.js`/`live-example.js`), `client/src/extensions/lesson-blocks.js`,
  `client/src/extensions/step-kinds/` (parsons, debug, explain, approaches, review, „Než začneš",
  štítky `recall`/`choose`), `client/src/extensions/sections/` (tahák, outcomes, pojmy na
  stránce sekce), `tools/verify-unit.test.js`, fixture v `tools/fixtures/verify-*`.
- **První krok v cizím souboru (jediný povolený):** přesunout blok
  `describe('verify — výběr obsahu a kontroly')` z `tools/runner-unit.test.js` do nového
  `tools/verify-unit.test.js` (před úpravou soubor znovu přečíst, měnit jen ten blok).
- **Registrace:** `registerLessonBlock` (`check`, `explain`, `memory`, `compare`) v
  `lesson/blocks/index.js` nebo `extensions/lesson-blocks.js`; `registerStepKind({ kind: 'parsons' })`;
  `workspaceExtensions` (`brief-head`: štítky a čtyři kroky ladění, `brief-after-hints`: explain
  a přístupy po splnění, míra změny u `debug`); `projectExtensions` (Než začneš, `# --review--`);
  `sectionExtensions` (tahák, outcomes); `register(router, ctx)` v `sections.js`.
- **Závisí na:** kontrakt 2 (celá), 3 (celá), 4.1–4.4, 5 (celá), 7, 10 (všechny kódy, `advice`,
  `--doporuceni`), 12.8; balík 1 `shared/diff.js` (`changeRatio` pro D1 a míru změny);
  balík 2 `RunResult.syntaxError` (K2) a `Preview.setCssVariables` (`controls`); balík 3
  rozhraní otázky (`itemId`, `isSolved`) a typ `text` (bez něj `:::check` s psanou odpovědí
  ukáže upozornění z registru).
- **Nesahá:** `components/question.js` (3), `test-result.js`/`hint-list.js`/runner (2),
  `workspace/*` (6 — jen sloty a `registerStepKind`), `screens/section.js` (6 — jen `sectionExtensions`).
- **Ověření:** `node --test shared/parse.test.js shared/content.test.js server/routes/sections.test.js tools/verify-unit.test.js tools/verify.test.js`
  (každý formát z kontraktu: příklad z kontraktu → přesný JSON výstup; každá ParseError věta
  z kontraktu má test; kódy verify S/K/T/A/D/P/X/L/W/E/Q/C nad fixture); zpětná kompatibilita:
  `npm run overit` nad současným obsahem = 0 chyb (varování A1/T2/E4/S8 a W1/W2/W3 se čekají —
  opraví je piloti P1–P3);
  `node tools/e2e.js --port 4460`; `npm test`, `npx vite build`.

#### Balík 5 — běžící Node proces a HTTP klient (B10)

- **Vlastní existující:** `client/src/workspace/output-node.js`.
- **Nové:** `server/dev-process.js` (+ test), `server/routes/dev-process.js` (+ test),
  `client/src/extensions/dev-process/` (panel HTTP klienta, API klient).
- **Registrace:** `register(router, ctx)`; `ctx.onClose` (zastavit proces); `ctx.onReset` ne;
  `workspaceExtensions` (slot `output-after` — HTTP klient, `output-tools`), `projectExtensions`
  (spuštění projektu `project`), úklid při odchodu `ws.onCleanup` → `stop` s `keepalive`.
- **Závisí na:** kontrakt 12.7 (celá), 6.6, 9, 7 (409). Na jiných balících nezávisí;
  pomocníky pro skupiny procesů si napíše v `server/dev-process.js` (node-runner je balíku 2).
- **Nesahá:** `server/node-runner.js`, `runner/node-client.js` (2), `workspace/index.js` (6).
- **Ověření:** `server/dev-process.test.js` (start se `files` i `project`, `listening`, výstup
  se `since` a `truncated`, `request` 200/`ok: false`/409, `bodyEncoding`, SIGTERM→SIGKILL
  skupiny, nečinnost s krátkým limitem přes volbu, žádný proces po `server.close()`);
  `tools/ui-dev-process.test.js` nad fixture krokem se serverem; `npm test`, `npx vite build`.
  Po testech `pgrep -f` nesmí najít tvoje dočasné procesy.

#### Balík 6 — poznámky (B9), drobnosti (B11 UI), orientace (B12), tmavý režim

- **Vlastní existující:** `client/src/workspace/{index,brief,output-browser,stepper,result,files}.js`,
  `client/src/screens/{overview,section,module,project,nav,load}.js`,
  `client/src/components/{console-panel,columns}.js`, `client/src/icons.js`,
  `client/src/styles/{tokens,base,layout,workspace,overview,project}.css`,
  `tools/ui.test.js`, `tools/fixtures/ui-content/`.
- **Nové:** `server/routes/notes.js`, `server/routes/settings.js` (+ testy),
  `client/src/extensions/notes/` (`#/poznamky[/sekce]`, panel v lekci a na ploše, „Nerozumím"),
  `client/src/extensions/theme.js`, `…/lesson-toc.js`, `…/shortcuts.js`, `…/preview-tools.js`,
  `…/next-on-route.js`, `…/search.js` (prázdná `#/hledat`).
- **Registrace:** `register(router, ctx)` (notes, settings); `registerScreen` (`notes`, `search`);
  `registerHeaderItem` (Hledat 10, Poznámky 30); `lessonExtensions` (`aside`: obsah lekce,
  poznámky, „Nerozumím"); `workspaceExtensions` (`output-tools`: šířka náhledu, nová karta);
  `data-theme` na `<html>`.
- **Úkoly v kostře** (jen tady se mění vlastní soubory jádra plochy a obrazovek): stepper
  jako seznam s názvy a ✓, drobečky jako odkazy, „Pokračovat" na první nesplněný krok,
  konzole pod editorem u `js`, sbalení kódu mimo `--edit--`, skrýt Zkontrolovat po splnění,
  ligatury vypnuté, tmavé tokeny, na přehledu odznak `rozsireni` a pohled podle `doporucenaTrasa`,
  na konci sekce „Další na trase" (u rozšíření i další sekce jádra).
- **Závisí na:** kontrakt 12.5, 12.6, 2.1, 2.9, 6.7 (mapování `previewWidth`), 8 (`lastVisited`);
  balík 2 `Preview.setViewport`/`openInNewTab` (volat přes `?.()`).
- **Nesahá:** `runner/*` (2), `screens/lesson.js` (4 — obsah lekce jen přes `lessonExtensions`,
  skok na `?kotva=` dělá balík 4), `screens/quiz.js` (3). Existující sloty, členy `ws` a události
  zachovat (balíky 1–5 na nich stojí); nový slot nebo událost na požádání přidat.
- **Ověření:** `server/routes/notes.test.js` (formát připsaného záznamu přesně podle 12.5,
  409 s `baseUpdated`, 413, `obecne`, atomický zápis přes `ctx.dataPath`), `settings.test.js`;
  `tools/ui.test.js` a e2e beze změny výsledku; `tools/ui-orientation.test.js` (tmavý režim
  bez natvrdo zapsané barvy, přepínač šířky, TOC); `npm test`, `npx vite build`.

### 7.4 Balíky přepracování pilotů (fáze 2c)

Startují po sloučení 2b (nejméně balíky 2 a 4: parser a verify nových formátů). Každý
vlastní **jen svůj adresář obsahu**; do platformy ani do `content/osnova.json` nezasahuje
(chybu platformy nahlásí, neobchází ji obsahem).

| | P1 `css-flexbox` | P2 `js-pole` | P3 `node-zaklady` |
|---|---|---|---|
| **vlastní** | `content/css-flexbox/**` | `content/js-pole/**` | `content/node-zaklady/**` |
| **úkoly** | D4 (workshop-navigace: cíl + kandidáti, debug mezi 16 a 17, explain `min-width: 0`, předpověď v 17, kroky 007–010 bez dočasného `max-width`, tipy od kroku 8), D5 (`controls`, `:::compare`, 3 předpovědi, explain, `:::check` po částech, `tahak.md`, `cards.md`, `pojmy.md`, lab cenik `# --approaches--`) | D1 (co-je-pole: `predict`, `:::memory`, pretest, `:::check`, `:::explain`, výstupy pryč z komentářů), D2 (workshop: ~50 zpráv asercí, debug za 023, `choose` místo 017, explain u 009, parsons u prvního `reduce`, tipy, zeslabení poslední třetiny), D3 (`cards.md` ~20, `pojmy.md`, `tahak.md`, `outcomes`, lab s kostrami a `approaches`, kvíz s `# --code--`) | D6 (tipy u kroků se serverem, debug „server spadne na neplatném JSON", explain ke stavovým kódům, `cards.md` s chybami navázanými na `errors-cs.js`, projekt `# --review--` s rozšířeními) |
| **sdílené řádky** | žádné | žádné | žádné; `see` z `shared/errors-cs.js` míří na nadpisy sekce — přejmenování takového nadpisu nahlásit balíku 2 |
| **závisí na** | kontrakt 2.5–2.9, 3.3–3.7, 5.2–5.8, 10; styl-obsahu; balíky 4, 2 (`setCssVariables`) a 6 (přepínač šířky pro kroky 007–010) | kontrakt 2.5–2.10, 3.3–3.8, 4.2–4.3, 5.3–5.6, 10; styl-obsahu; balíky 2 (aserce se skutečnou hodnotou), 4 | kontrakt 2.5–2.9, 3.3–3.9, 6.6, 6.9, 12.7, 10; styl-obsahu; balíky 2, 4, 5 (HTTP klient na krocích 5+) |
| **mimo rozsah** | `target: layout` u labu cenik (kontrakt 13, vlna 4) | `:::trace` (kontrakt 13) | — |

**Ověření každého pilotu:** `npm run overit -- content/<sekce>` = 0 chyb, každé varování
opravené nebo zdůvodněné ve zprávě; `npm run overit -- --doporuceni content/<sekce>` projít
proti kontrolnímu seznamu `docs/styl-obsahu.md` kap. 16; `node tools/e2e.js --port <rozsah>`;
ruční průchod přepracovaných modulů v UI (snímek obrazovky každého nového bloku).

### 7.5 Kontrola nepřekrývání

- Každý z existujících souborů v `server/`, `client/`, `shared/`, `tools/` (179 ke dni
  rozdělení) má právě jednoho vlastníka z 7.3 nebo je v jádru (5.1). Soubor, který
  v seznamech chybí, je jádro.
- Nové soubory se nepotkají díky prefixům (7.2). Po sloučení 2b potvrzené i soubory podle
  prefixu mimo výčet 7.3: balík 4 `tools/lib/verify-course.js`, `tools/lib/verify-rules.js`,
  `shared/answers.test.js`, `shared/refs.test.js`, `tools/lesson-blocks-unit.test.js`,
  `tools/ui-lesson-blocks.test.js`, `tools/fixtures/lesson-blocks-content/`; balík 2
  `shared/runner-assertion.js`; balík 3 `components/questions/flow.js`, `components/quiz-code-set.js`. Routy se nepotkají díky prefixům cest
  (`/api/attempts`, `/api/stats` · `/api/reviews`, `/api/confidence` · `/api/section`,
  `/api/terms` · `/api/dev-process` · `/api/notes`, `/api/settings`); kolizi by start serveru
  ohlásil (1.2).
- Parser (`shared/parse.js`) a `shared/content.js` mění **jen balík 4**. Ostatní balíky
  spoléhají na tvar dat z kontraktu a testují na ručně sestavených datech ve tvaru kontraktu.
- `docs/kontrakt.md` a `docs/styl-obsahu.md` ve 2b nikdo nemění; nejasnost nebo rozpor
  jde do závěrečné zprávy koordinátorovi.


---

## Nástroj: dev-process

Běžící Node proces pro tlačítko **Spustit** u runtime node a HTTP klient (kontrakt kap. 12.7,
návrh B10). Vždy nejvýš jeden proces na server Akademie.

**Server**

- `server/dev-process.js` — `createDevProcessManager(options)`: `start`, `stop`, `request`,
  `output(since)`, `process()`, `close()`. Proces běží „detached" jako vedoucí vlastní skupiny;
  `stop` pošle SIGTERM skupině, po `killGraceMs` (2000) SIGKILL a počká na konec. Po skončení
  hlavního procesu se zbytek skupiny zabije a dočasný adresář (`akademie-dev-*` v tmp) smaže.
  Volby (výchozí v `DEV_PROCESS_DEFAULTS`): `idleMs` (10 min), `startWaitMs` (5000),
  `maxChunks`/`maxOutputBytes` (5000 / 1 MB), `maxBodyBytes` (1 MB), `requestTimeoutMs`,
  `tempPrefix`, `projectDir(project)`. Výstup má `seq` od 0 pro každý proces.
  `listening` se hlídá i po odpovědi `start` (server, který začne poslouchat později);
  poslouchá-li proces jen na `::1`, je `url` `http://[::1]:PORT` a požadavky jdou tam.
- `server/routes/dev-process.js` — routy `GET /api/dev-process`, `POST …/start|stop|request`,
  `GET …/output?since=`; `ctx.onClose` proces zabije hned. Testy si routy s jinými limity
  připojí přes `registerDevProcess(router, ctx, options)` (automaticky načtenou
  `dev-process.js` z `routeModules` vynechají, jinak kolize rout).

**Klient** (`client/src/extensions/dev-process/`)

| soubor | co dělá |
|---|---|
| `api.js` | `devProcessApi` — volání `/api/dev-process/*` (bez DOM) |
| `session.js` | `createDevProcessSession()` — relace jedné obrazovky: `start`, `stop`, `request`, `markChanged`, `dispose`, `state()`, `on('change' \| 'output')`; stahuje výstup každých 300 ms, dokud proces běží; `dispose` zastaví **vlastní** běžící proces s `keepalive`. `attachSession(element, s)` / `sessionFor(element)` |
| `run-view.js` | `createRunStatus(session)` (řádek „Poslouchá na …" s odkazem do nové karty), `connectConsole(session, consolePanel)` |
| `http-format.js` | výpočty HTTP klienta bez DOM: `buildRequest`, `parseHeaderLines`, `describeBody`, `statusGroup`, `formatBytes` |
| `http-client.js` | `createHttpClient({ session, draftKey })` — formulář (metoda, cesta, hlavičky, tělo; Ctrl+Enter pošle) a odpověď (stav, hlavičky, tělo, čas) |
| `index.js` | registrace: `workspaceExtensions` (u `ws.isNode` HTTP klient do `output-after`, `files-change` → `markChanged`), `projectExtensions` (u runtime node panel „Vyzkoušej server" ve slotu `after-stories`) |

`client/src/workspace/output-node.js` vytváří relaci pro krok (tlačítka Spustit / Spustit znovu /
Zastavit, řádek stavu) a připojí ji k `output.element`; rozšíření ji najde přes
`sessionFor(ws.elements.output)`. Při odchodu z obrazovky (`signal`) a na `pagehide` se vlastní
proces zastaví. Nové události ani sloty nástroj nepřidává.

**Testy:** `server/dev-process.test.js`, `server/routes/dev-process.test.js`,
`tools/dev-process-unit.test.js` (relace a HTTP výpočty bez DOM), `tools/ui-dev-process.test.js`
(fixture `tools/fixtures/dev-process-content/`, port 4480–4499).

---

## Nástroj: pokusy, nápovědy, porovnání s řešením a statistiky

Balík 1 (návrh B1, B2, B8; kontrakt kap. 3.3 a 12.2).

**Sdílený kód**

- `shared/diff.js` — `diffLines(before, after, { ignoreWhitespace })` (řádkový LCS, `\r\n` = `\n`,
  při shodě délky nejdřív `del`, pak `add`; `text` u `same` je řádek z `after`) a
  `changeRatio(seedLines, userText)` (kap. 3.4). Normalizace bílých znaků = `normalizeWhitespace`
  ze `shared/answers.js`.

**Server**

- `server/routes/_attempts-store.js` — logika bez HTTP: `validateAttemptBody` (neznámé pole = 400),
  `applyAttempt(previous, body, nowIso)` → `{ attempt, firstOk }` (`solutionViewed` se započte před
  `ok`, takže „řešení i první ok v jednom požadavku" = `assisted`), `attemptTarget(id)` (u `q:`
  modul přes `itemTarget`), `buildStats(data, content)`.
- `server/routes/attempts.js` — `POST /api/attempts`, `GET /api/attempts[?prefix=]`, `GET /api/stats`.
  Id kroku/modulu musí být v `ctx.contentIndex()`, `q:` přes `ctx.resolveItem` (jinak 400).
  Po uložení `await ctx.emit('attempts:recorded', { id, body, attempt, previous, firstOk })`
  (`body` = očištěné tělo, `previous` = `null` u prvního záznamu). `ctx.onReset` maže položky,
  jejichž cíl k id patří. Statistiky vynechají položky, které v obsahu nejsou, a rozbitý modul
  přeskočí (nespadnou kvůli němu).

**Klient** (`client/src/extensions/`)

| soubor | co dělá |
|---|---|
| `attempts/api.js` | `attemptsApi.record(body, { keepalive })` — požadavky na stejné id jdou postupně; po uložení `appEvents` `attempts:recorded` (`{ id, attempt }`). `list(prefix)`, `stats()`, `recordQuietly(body)` (chybu jen vypíše) |
| `attempts/active-time.js` | `createActiveTimer({ now, idleAfterMs })` — aktivní čas mezi projevy aktivity (pauza nad 60 s se nepočítá), `take()` nejvýš 1 h |
| `attempts.js` | `workspaceExtensions` a `projectExtensions` (`order: 5`): po každé kontrole `{ id, ok, failed, activeMs }`, při odchodu a `pagehide` zbylý `activeMs` s `keepalive` |
| `hints/logic.js` | výpočty bez DOM: `failedHintIndexes`, `firstFailedIndex`, `nextFailStreak`, `shouldHighlight` (≥ 2), `focusTipIndex`, `helpButtonState`, `restoredOpenedCount` |
| `hints/panel.js` | `createHintsUi({ id, item, hintList, onCompare, signal })` → `{ button, panel, checked({ passed, run }) }`; po načtení obnoví `tipsOpened` a `failsSinceOk` z `GET /api/attempts?prefix=<id>` |
| `hints/see-links.js` | `renderSeeLinks(refs)` — odkazy `refHref` s názvem modulu a nadpisu lekce |
| `hints.js` | plocha: tlačítko do slotu `actions`, panel do `brief-after-hints`; projekt: blok do `after-stories` |
| `solution-diff/hunks.js` | bez DOM: `compareFiles(mine, author, { ignoreWhitespace })`, `collapseUnchanged(diff, context = 3)`, `differsFromAuthor`, `plainFiles` |
| `solution-diff/dialog.js` | `openSolutionDiff({ heading, intro, confirm, load, onViewed, labels })` — `<dialog>` s potvrzením, načtením až po kliknutí, přepínačem „Ignorovat bílé znaky" a sbalenými stejnými řádky |
| `solution-diff/open.js` | `openWorkspaceSolution(ws)`, `openProjectSolution(project, { passed })` — řešení z `api.moduleWithSolutions`; před splněním s potvrzením, každé zobrazení pošle `solutionViewed: true` |
| `solution-diff.js` | tlačítko „Jak to napsal autor" po splnění (`actions` / `after-stories`), proužek „Pokračuješ autorovým řešením kroku N" v `brief-head` (když se uložený kód kroku N liší od seedu kroku N+1) |
| `stats/` | `#/statistiky` (`registerScreen` `stats`, položka menu `statistiky`, `order: 50`), `format.js` bez DOM |

CSS třídy: `.hint-tips*`, `.hint--focus` (zvýrazněný požadavek v seznamu), `.solution-diff*`,
`.solution-diff-banner*`, `.stats__*`. Barvy jen z tokenů.

Klientská událost `attempts:recorded` (`appEvents`) `{ id, attempt }` — po každém uloženém pokusu
z tohoto klienta (odeslaném přes `attemptsApi.record`).

**Testy:** `shared/diff.test.js`, `server/routes/attempts.test.js` (otázku `q:` podstrčí přes
`ctx.resolveItem`, aby nezávisel na klíčích parseru), `tools/hints-unit.test.js`,
`tools/solution-diff-unit.test.js`, `tools/stats-unit.test.js`, `tools/ui-hints.test.js`
(fixture `tools/fixtures/hints-content/`, porty 4400–4419).

## Nástroj: opakování, jistota a otázky

Balík 3 (B5, B6, B7, karty v UI, kvíz s `# --code--`). Formáty a API: kontrakt kap. 4, 12.3, 12.4.

**Server**

| soubor | co dělá |
|---|---|
| `server/routes/reviews.js` | `GET /api/reviews/summary`, `GET /api/reviews/due`, `POST /api/reviews/answer`, `POST /api/reviews/add`, `POST /api/reviews/remove`; `ctx.onReset` (položky i `removed` podle `itemTarget`) |
| `server/routes/_reviews-store.js` | Leitner bez HTTP: `itemFromFirstAnswer`, `applyAnswer`, `sortDue`, `interleaveBySection`, `isCardActive`, `estimateSeconds`, `addDays`, `localDate` |
| `server/routes/confidence.js` | `GET /api/confidence`, `GET /api/confidence/:section` (reset jistotu nemaže) |
| `server/routes/_confidence-store.js` | `addAnswer`, `sectionConfidence`, `sectionOfItem` |

- Poslouchá `attempts:recorded`: `q:` s `ok` → založí položku z první odpovědi (když není v `items`
  ani v `removed`) a přičte jistotu; krok nebo lab s `firstOk` a `assisted`/`fails ≥ 3` → `step:<id>`.
- Vyvolává **`reviews:answered`** `{ id, ok, confidence, sectionId }` po `POST /api/reviews/answer`
  (poslouchá `confidence.js`; jistota z opakování se do pokusů neposílá, aby se nepočítala dvakrát).
- `GET …/summary` i `…/due` nejdřív založí aktivní karty (`parseCards` nad `cards.md` z indexu obsahu)
  a smažou osiřelé položky; položka s rozbitým obsahem (`ParseError`) zůstává, jen se dnes nenabídne.
- Testy si podstrčí čas a obsah: `register(router, ctx, { now, resolveItem, listCards })`.

**Otázka** (`client/src/components/question.js`) — rozhraní z kap. 7.2 a navíc:

```js
createQuestion(question, {
  key, number, total, onChange,
  itemId,                       // q:… → volba jistoty + POST /api/attempts { id, ok, confidence? } po každém vyhodnocení
  onEvaluated,                  // ({ correct, solved, confidence, showAnswer, failures })
  checkButton: false,           // vlastní „Zkontrolovat" (samostatná otázka); po 1. neúspěchu zůstane odemčená
  pretest: false,               // „Uvidíme za chvíli" + odpověď bez ✗, nic se neposílá
  askConfidence: Boolean(itemId),
  recallFirst: false,           // volby až po „Ukaž volby" (opakování)
  onReveal,                     // uživatel klikl „Ukaž odpověď"
  label,                        // popisek pole psané odpovědi
})
// → { element, isAnswered, isSolved, isCorrect, evaluate, reveal, showAnswer, retry, focus, answer, state }
```

- Pravidla „neprozradí odpověď" jsou v `components/questions/flow.js` (bez DOM): správná odpověď
  se ukáže po 2. neúspěchu nebo po „Ukaž odpověď"; `retry()` po zobrazené odpovědi zamíchá volby
  jiným kolem (`shuffleBy(key + '#kolo-N')`).
- Typy: `choice` (`questions/choice.js`) a `text` (`questions/text.js`, porovnání jen přes
  `checkTextAnswer` ze `shared/answers.js`; odpovídá i kartám `output`/`css`). Typ vrací
  `{ element, isAnswered, focus, grade, answer, showResult, clearResult, reset }`; starší typ jen
  s `reveal()` funguje dál.
- `questionItemId(moduleId, question)` → `q:<modul>#<key>` nebo `null`.
- Panel kódu sady `# --code--`: `createCodeSetPanel(codeSet)` z `components/quiz-code-set.js`.

**Klient — nástroj** (`client/src/extensions/reviews/`, `client/src/extensions/confidence.js`)

- `registerScreen({ name: 'reviews', path: '/opakovani' })`, `registerHeaderItem({ id: 'opakovani', order: 20 })`
  s odznakem počtu (souhrn nejvýš jednou za 30 s, po odpovědi/splnění/resetu hned — `count.js`).
- `overviewExtensions` `reviews-summary` (slot `head`): „K opakování: N (asi M min)", jen když N > 0.
- `workspaceExtensions` `reviews-self` (slot `actions`, order 60): „Nezvládl bych to znovu" po
  splnění → `POST /api/reviews/add { id: 'step:<id>', reason: 'self' }`.
- `sectionExtensions` `confidence-calibration` (slot `after-progress`): věta kalibrace od 5 jistých odpovědí.
- Položky opakování kreslí `items.js` (otázka, karty output/css/free/code, step, explain); kód od seedu
  (`practice.js`) nic neukládá do postupu.

**Kvíz** (`client/src/screens/quiz.js`): instance otázek žijí po celou dobu obrazovky, souhrn ukáže
chybné otázky s odkazy `see` a nabídne „Projít jen chybné"; skóre každého průchodu jde do
`POST /api/attempts { id: <kvíz>, score }` (server drží `firstScore`). `quiz:evaluated` nese výsledky
všech otázek s posledním vyhodnocením.

**Testy:** `server/routes/reviews.test.js`, `server/routes/confidence.test.js`,
`tools/reviews-unit.test.js`, `tools/ui-reviews.test.js` (fixture `tools/fixtures/reviews-content/`,
porty 4440–4459), fixture serveru `server/test-fixtures/reviews/content/`.

## Nástroj: výsledky a chyby česky, lint, runner

Balík 2 (B3, B4, runner části B11). Formáty jsou v kontraktu kap. 6.

### Runner (`client/src/runner/`, `server/node-runner.js`)

- **RunResult** (kontrakt 6.1): selhaný test má `errorName` a u asercí `operator`, `actual`,
  `expected`, `generatedMessage`, u `deepEqual` `diff` — i s vlastní zprávou autora. Výpočet je
  jeden pro prohlížeč i Node: `describeAssertion(error, format)` ve `shared/runner-assertion.js`.
  Vygenerované hlášky jsou česky (`Očekávám 3, ale kód vrátil 4`); v Node je překládá
  `server/node-harness.js` a vlastní zprávu autora nechá beze změny.
- **`syntaxError`**: `shared/syntax-check.js` → `findSyntaxError(files, { includeHtml })`,
  `checkJsSyntax(code)`, `extractInlineScripts(html)`, `syntaxErrorResult(hints, syntaxError)`.
  `runTests` (dom/js/vue) i `runNodeTests` bez `cwd` kód, který nejde naparsovat, nespustí.
- **`//# sourceURL=akademie/<soubor>`** na konci každého skriptu náhledu a testu. Inline skript
  z `index.html` dostane na začátek prázdné řádky a mezery, takže řádek i sloupec sedí na `index.html`.
  Chyby v konzoli proto hlásí přímo `script.js:3`.
- **Preview** (`mountPreview`): `setViewport({ width, height } | null)` — iframe v dané velikosti
  zmenšený na šířku panelu (výpočet `runner/viewport.js`), `setCssVariables({ '--x': 'v' })` —
  bez znovunačtení, přežije i `update`, `openInNewTab()` → `boolean` (Blob URL, `opener = null`),
  `onConsole` u nezachycené chyby navíc `file`, `line`, `column`; navíc `viewport()`.
- **`inspectCss({ runtime, files, declarations, signal })`** (export `runner/index.js`, také
  `window.akademieRunner.inspectCss`): složí stránku v neviditelném iframu 1024×768 a vrátí
  neaktivní deklarace `[{ id, property, reason, elements }]` (`runner/frame/inactive-css.js`).
- **Úložiště v sandboxu** (kontrakt 13, první verze): iframe runneru dostane `localStorage`
  a `sessionStorage` v paměti, čerstvé pro každý test i každé překreslení náhledu. Nepovinné
  `RunRequest.storage = { localStorage: { klíč: 'text' }, sessionStorage: {…} }` je naplní před
  spuštěním kódu uživatele (formát pro obsah zatím kontrakt nemá).

### Výsledky a chyby česky (`client/src/extensions/errors-cs.js`, `…/errors-cs/`)

- `shared/errors-cs.js`: `explainError(text)` → `{ id, title, causes, see, match? }` (46 vzorů,
  `ERROR_PATTERNS`), `groupUndefinedNames(errors)` sloučí nenapsané funkce do jednoho řádku.
  Texty smí obsahovat `` `inline kód` ``. `see` míří na nadpisy pilotních sekcí — přejmenování
  nadpisu v obsahu = upravit `see` tady (verify S4).
- Registrace: `registerRunTransform('errors-cs')` (u `syntaxError` požadavky „Neověřeno — kód nejde
  spustit."), `registerHintResultRenderer('errors-cs')` („Očekávám / Tvůj kód vrátil" se
  zvýrazněným rozdílem, tabulka lišících se klíčů, české vysvětlení a anglický originál; první
  selhaný požadavek rozbalený), `registerRunSummaryRenderer('errors-cs')` („Kód nejde spustit"
  a chyby při spuštění s tlačítkem „Skočit na řádek N" přes `ws.editor.revealLine`),
  `workspaceExtensions('errors-cs')` (jen si pamatuje editor plochy pro souhrn).
- Výpočty bez DOM: `errors-cs/format.js` (test `tools/errors-cs-unit.test.js`).

### Lint (`client/src/extensions/lint/`)

- `registerEditorExtension('lint')` pro `.js/.mjs/.cjs`, `.html` (inline skripty), `.css`, `.json`:
  syntaxe JS (chyba), neplatný JSON (chyba), neplatná CSS deklarace přes `CSS.supports` s návrhem
  opravy (varování), neaktivní CSS jen na pracovní ploše dom/vue (info), chyby za běhu z náhledu
  na svém řádku (chyba).
- `workspaceExtensions('lint')` poslouchá `ws.preview.onConsole` a přelintuje editor
  (`StateEffect` + `needsRefresh`).
- Čisté moduly (test `tools/lint-unit.test.js`): `css-scan.js` (deklarace s pozicemi),
  `css-check.js` (neplatné deklarace, návrhy), `diagnostics.js` (nálezy všech druhů).
- Barvy podtržení a bublin jen přes tokeny editoru a konzole.

### Testy

`node --test shared/syntax-check.test.js shared/errors-cs.test.js server/node-runner.test.js
tools/runner-unit.test.js tools/errors-cs-unit.test.js tools/lint-unit.test.js tools/runner.test.js
tools/ui-errors-cs.test.js` (UI test na portech 4420–4439, obsah `tools/fixtures/errors-cs-content/`).

## Nástroj: bloky lekce, druhy kroků a stránka sekce

Balík 4b. Jen klient; data bere z parseru (kontrakt kap. 3, 5) a z `GET /api/section`, `GET /api/terms`.

**Soubory**

| soubor | co dělá |
|---|---|
| `client/src/markdown.js` | markdown pro celou aplikaci: rámečky `> [!REMEMBER]` / `[!PITFALL]` / `[!TIP]` / `[!NOTE]`, `==mark==`, `[[pojem\|text]]` s bublinou (načte `GET /api/terms` jednou za běh), odkazy `see:` přes `refHref`; exporty `renderMarkdown`, `markdownToHtml` (Node, testy), `highlightLines`, `loadTermIndex`, `closeTermPopover`, `CALLOUT_TYPES` |
| `client/src/lesson/blocks/{check,explain,memory,compare,live}.js` | bloky lekce; `check.js` exportuje `createStandaloneQuestion` a `lessonQuestionId`, `explain.js` exportuje `createExplainPanel` (sdílí ho `# --explain--` kroku) |
| `client/src/lesson/blocks/{live-logic,memory-logic}.js` | výpočty bez DOM (ovládací prvky, rozdělení `:::compare`, změny v `:::memory`) |
| `client/src/components/live-example.js` | živá ukázka: `controls` (hodnoty přes `preview.setCssVariables?.()`, jinak nové spuštění s `:root { … }` na začátku `styles.css`) a `predict` |
| `client/src/screens/lesson.js` | splnění lekce (kap. 5.8), skok na `?kotva=` |
| `client/src/extensions/lesson-blocks.js` | registrace `check`, `explain`, `memory`, `compare` |
| `client/src/extensions/step-kinds/` | štítky druhů kroků, čtyři kroky ladění, míra změny (`change-ratio.js` nad `shared/diff.js`), plocha Seřaď řádky (`parsons.js`, `parsons-logic.js`), `# --explain--` kroku, jiné přístupy, rubrika, Než začneš |
| `client/src/extensions/sections/` | Po sekci umíš, tahák (tisk přes `body[data-print="cheatsheet"]`), pojmy sekce |
| `client/src/styles/{prose,lesson}.css`, `step-kinds.css`, `sections.css` | vzhled; barvy jen tokeny z kap. 5.11 kontraktu |

**Registrace:** `registerLessonBlock` (4×), `registerStepKind({ kind: 'parsons' })`, `workspaceExtensions`
(`step-kinds-label`, `-debug-change`, `-explain`, `-approaches`, `-review`, `-plan`), `projectExtensions`
(`step-kinds-project`: Než začneš ve slotu `head`, rubrika v `after-stories`), `sectionExtensions` (`sections`).

**Rozhraní lekce navíc:** `lesson.addRequirement({ id, label, isMet, element? })` — `element` je nepovinný
prvek, na který tlačítko v hlášce „Ještě vyřeš…" odscrolluje. Událost `lesson:questions-checked` se vyvolá
po každém vyhodnocení otázky z `# --questions--` (výsledky dosud vyhodnocených otázek).

**Volá cizí API** (přímo přes `apiRequest`): `POST /api/attempts` (otázky přes `createQuestion` s `itemId`,
`solutionViewed` u přístupů před splněním), `POST /api/notes/:section/append` (`explain`, `plan`),
`POST /api/reviews/add` (`explain:<id>#<klíč>`), `GET /api/module/…?solution=1` (přístupy labu, řešení
pro míru změny, když krok nemá oblast `--edit--`).

**Třídy pro testy a rozšíření:** bloky mají `data-block="<kind>"`; `.callout[data-callout]`, `button.term`,
`.term-popover`, `.see-link`, `.live--predict[data-revealed]`, `.live-controls__css`, `.memory__position`,
`.parsons__line`, `.kind-label--<kind>`, `.debug-change`, `.plan`, `.review`, `.approach`,
`.section-outcomes`, `.cheatsheet`, `.section-terms`.

**Ověření:** `node --test tools/lesson-blocks-unit.test.js tools/ui-lesson-blocks.test.js` (UI test: porty
4470–4479, fixture `tools/fixtures/lesson-blocks-content/`, snímky s `LESSON_BLOCKS_SHOTS=<adresář>`).

## Nástroj: poznámky, nastavení, tmavý režim a orientace (balík 6)

**Server**

| endpoint | soubor | poznámka |
|---|---|---|
| `GET /api/notes`, `GET/PUT /api/notes/:section`, `POST /api/notes/:section/append` | `server/routes/notes.js` | kontrakt 12.5; soubory `data/poznamky/<sekce>.md` zapisované atomicky (`.tmp` + `rename`) přes `ctx.dataPath`; „verze" souboru = `mtime` (`updated`), PUT s jiným `baseUpdated` → 409 (`baseUpdated: null` = soubor ještě neexistuje); tělo `append` nad 100 kB → 413 (PUT má limit serveru 5 MB, soubor poznámek časem 100 kB přeroste); reset postupu poznámky nemaže |
| `GET/PUT /api/settings` | `server/routes/settings.js` | kontrakt 12.6; `data/nastaveni.json` přes `createJsonStore`; neznámý klíč/hodnota → 400, ručně rozbité hodnoty v souboru se nahradí výchozími |

Pomocné čisté funkce (testy): `formatNoteEntry`, `appendEntry`, `validateAppendBody` (notes.js),
`SETTINGS_SCHEMA`, `normalizeSettings`, `validateSettingsPatch` (settings.js).

**Klient — rozšíření (`client/src/extensions/`)**

| soubor | co dělá | registrace |
|---|---|---|
| `theme.js` | `data-theme` (`light`/`dark`, u „system" podle `prefers-color-scheme`) a `data-theme-choice` na `<html>`; přepínač v liště; nápověda `akademie.theme` v localStorage jen proti bliknutí při načtení, pravda je na serveru | `registerHeaderItem({ id: 'theme', order: 90 })` |
| `settings/client.js`, `settings/logic.js` | `settings.load()/get()/update()/onChange()`; `previewViewport(width)`, `nextTheme`, `resolveTheme` bez DOM | — |
| `preview-tools.js` | přepínač šířky „Jako testy · 768 · 375 · Panel" (`preview.setViewport`) a „Nová karta" (`preview.openInNewTab`); u runtime js jen nová karta | `workspaceExtensions` (slot `output-tools`) |
| `lesson-toc.js` | obsah lekce: připnutý panel vpravo (`orientation/aside.js`, když je vedle nejširšího bloku aspoň ~180 px a okno ≥ 1200 px), jinak rozbalovací řádek v `head`; odkazy `?kotva=` přes `replaceState` | `lessonExtensions` (sloty `aside`, `head`) |
| `notes/` | `#/poznamky[/sekce]`, panel poznámek (`notes/drawer.js`), „Nerozumím" u odstavce nebo označeného textu (`notes/not-understood.js`), tlačítko Poznámka v lekci, na ploše a u projektu | `registerScreen('notes')`, `registerHeaderItem({ id: 'poznamky', order: 30 })`, `lessonExtensions`, `workspaceExtensions` (slot `actions`), `projectExtensions` (slot `head`) |
| `shortcuts.js` | Alt+←/→ (krok workshopu, jinde modul), `?` přehled zkratek, `N` panel poznámek | `workspaceExtensions`, `appEvents` |
| `next-on-route.js` | „Další na trase" a u rozšíření „Další sekce jádra" (`orientation/route.js`) | `sectionExtensions` (slot `end`) |
| `search.js` | prázdná obrazovka `#/hledat` | `registerScreen('search')`, `registerHeaderItem({ id: 'hledat', order: 10 })` |
| `orientation/` | `route.js` (trasa, Další na trase, `resumeStepId`, `partHref`), `aside.js` (připnutí slotu `aside` lekce), `fold.js` + `fold-ranges.js` (sbalení kódu mimo `--edit--` v kroku workshopu) | `registerEditorExtension({ id: 'fold-outside-edit-region' })` |

**Události:** `notes:open` (`appEvents`, payload `{}`) — otevře panel poznámek pro aktuální místo.
Kdo chce otevřít poznámky ze svého nástroje, vyvolá tuhle událost; zápis záznamu dělá přímo
`POST /api/notes/:section/append` (kontrakt 12.5).

**Kostra (vlastní soubory jádra):** stepper má rozbalovací „Krok N z M" se seznamem názvů a ✓
(`.step-menu`), drobečky část → sekce → modul jsou odkazy (`#/?cast=<id části>` odscrolluje přehled),
„Pokračovat" vede přes `resumeStepId` na první nesplněný krok od `lastVisited`, runtime js má
konzoli pod editorem (`.workspace__stack`, 65/35), po splnění kroku se Zkontrolovat schová
(`brief.setPassed`), přehled má štítek „Rozšíření" a pohled „Doporučená trasa" (volba v localStorage
`akademie.overview.view`), ligatury jsou vypnuté v `code`, `pre`, editoru i konzoli.

**Barvy:** všechny v `styles/tokens.css`, světlá i tmavá varianta se stejnými jmény (hlídá
`tools/theme-unit.test.js` i kontrast ≥ 4.5:1 a to, že žádné CSS mimo tokens.css nepíše barvu
natvrdo). Tokeny výkladu z kontraktu 5.11: `--callout-{remember,pitfall,tip,note}-{bg,border,fg,icon}`,
`--text-strong-accent`, `--code-inline-bg/fg`, `--term-fg`, `--mark-bg` (+ `--mark-fg`). Navíc:
`--rule-heavy`, `--shadow-pop`, `--backdrop`, `--preview-stage`, `--code-fold-bg`,
`--shadow-page` a `--page-edge` (hrana a stín listu, viz níž).

**Vzhled: stránka je list papíru.** Světlá paleta stojí na teplém papíru (`--paper`), ne na
studené šedi; tmavá je „učebnice večer" s deskou tmavší než list. Čtecí obrazovky (`.page`)
mají vlastní plochu `--surface`, hranu `--page-edge` a nízký stín `--shadow-page`, takže leží
na desce stolu; pracoviště naopak zabírá celé okno, protože se v něm pracuje, ne čte. Na úzkém
okně list hranu i stín ztrácí a vyplní obrazovku.

Opakované sazečské motivy: **dvojitá linka** (silná + vlasová) pod titulem přehledu i pod hlavou
části, **tečkovaná vodicí linka** v obsahu, **čísla kroků jako paginace** (antikva, tabulkové
číslice, bez rámečků; splněný krok podtržený, aktuální v plném inkoustu), **štítek typu modulu
jako marginálie** (antikva kurzívou v barvě typu) a **záložka „Pokračovat"** jako vložený lístek
se stužkou. Výběr textu má barvu zvýrazňovače (`--mark-bg`).

**Pohyb** (`client/src/motion.js` nad knihovnou `motion`, styly v `styles/motion.css`). Komponenty
knihovnu neimportují přímo, volají pomocníky `popIn`, `settleIn`, `riseIn`, `riseInEach`, `growIn`,
`expand`, `nudge` — délky a křivky jsou tak na jednom místě. Pravidla: pohyb **odpovídá na akci**
a ukazuje, co se změnilo; u neúspěchu se nic neposmívá (křížek jen přijde, fajfka doskočí);
při `prefers-reduced-motion` se všechno stane okamžitě; **stav v DOM je správně hned**, zpožděný
smí být jen vzhled (testy čtou `data-status` bez čekání). Kde je pohyb: požadavky se po kontrole
vyhodnotí postupně shora dolů, tlačítko Check hned roztočí kolečko, nový tip a detail chyby se
rozbalí, popover pojmu vyroste od pojmu, řádky konzole přijdou (nejvýš 6 na snímek), verdikt
otázky přijde, `<details>` odhalí obsah, list se po navigaci prolne (**jen průhledností** —
`transform` na předkovi rozbije `position: fixed` připnutého obsahu lekce), části přehledu přijdou
postupně. Čistě v CSS: linka čtení pod lištou řízená posunem (`animation-timeline: scroll()`),
stín lišty po odrolování, odezva řádků a odpovědí na najetí a stisk, razítko u správné odpovědi.

**Ověření:** `node --test server/routes/notes.test.js server/routes/settings.test.js tools/orientation-unit.test.js tools/notes-unit.test.js tools/theme-unit.test.js tools/ui-orientation.test.js tools/ui.test.js`
(UI testy: porty 4500–4519, fixture `tools/fixtures/orientation-content/`).

## Nástroj: parser obsahu, stránka sekce a verify (balík 4a)

**Sdílené moduly** (formáty podle kontraktu kap. 2–5, exporty kap. 1.1; navíc jen přidané exporty):

| soubor | navíc proti kontraktu |
|---|---|
| `shared/parse.js` | `STEP_KINDS`; `assembleParsons(seedFile, lines, { indentUnit, blanks, forms })` a `fillParsonsLine` — skládání souboru z řádků parsons (parser, verify P1 i UI stejně); `applyControlDefaults(files, controls)` a `controlValue(control, value)` — `:root { --x: výchozí }` a hodnota prvku do CSS |
| `shared/answers.js` | `createKeyAllocator()` — klíče `hashKey` s příponou `-2`, `-3` v jednom souboru |
| `shared/refs.js` | `findSeeLinks(markdown)` → `[{ ref, text, line, index }]` pro `[text](see:ref)` mimo kód; `findTermRefs` vrací `[{ term, text, raw, line, index }]` |
| `shared/content.js` | `loadSection` vrací `null`, když sekce není na disku; `sectionOutcomes(sectionJson, sectionId)` |

- `parseStep(…, { fileKind })`: `'step' | 'lab' | 'project'`; `requireSeed` (výchozí jen u kroku) dál vypíná povinný seed a řešení. Lab bez `# --solution--` má `solution: []` (verify K4).
- Předpověď s výběrem má navíc `question.why` (text `--why--` celé otázky). Chybějící popisek kroku `:::memory` = `''`, jednotka `range` bez jednotky = `''`.
- Klíče v lekci: `:::check` + `# --questions--` jedna řada, body `:::explain` druhá, předpovědi třetí.

**Routy** (`server/routes/sections.js`): `GET /api/section/:section` (404 mimo disk, 400 neplatný slug, 500 rozbitý soubor), `GET /api/terms`. Test `server/routes/sections.test.js`.

**Verify** (`npm run overit [-- --json | --doporuceni | content/<sekce>]`):

| soubor | co dělá |
|---|---|
| `tools/verify.js` | orchestrace: `runVerify` → položky `{ id, type, errors, warnings, notes, advice }`, souhrn `{ modules, errors, warnings, advice }`; typ `section` = soubory sekce |
| `tools/lib/content-scan.js` | `loadCourse` (celý kurz vždy — kvůli odkazům a pojmům), `scanContent` (výběr podle prefixu) |
| `tools/lib/content-checks.js` | `planModule(module, context)` (K/T/A/D/P/X/L/W/E/Q + S7, M1, M2), `planCards` (C1–C3) |
| `tools/lib/verify-course.js` | `createCourseChecks(course)`: S2–S9 napříč kurzem, `planSection`, `checkOsnova`, odkazy `ERROR_PATTERNS` ze `shared/errors-cs.js` (jen nad `content/`) |
| `tools/lib/verify-rules.js` | textová pravidla bez prohlížeče (T1, A1, W2, M1, E6, sběr markdownu a referencí) |

Každá zpráva začíná kódem pravidla (`[K1] krok 002: …`). `shared/diff.js` (D1) a `shared/errors-cs.js` (S4) se načítají volitelně.
Tahák se značkami `--x--` nebo `:::` = `[S1]`. Testy: `tools/verify-unit.test.js` (fixture `tools/fixtures/verify-content/`, běhy simulované),
`tools/verify.test.js` (skutečný runner nad `tools/fixtures/content/`).
