# Vite a bundlery

:::check pretest
Stránka má `<script type="module" src="main.js">` a v `main.js` je `import dayjs from 'dayjs'`. Balíček je nainstalovaný v `node_modules`. Stránku otevřeš přes jednoduchý statický server. Co se stane?

### --answer--
Prohlížeč najde `dayjs` v `node_modules` a stránka poběží.

#### --why--
Složka `node_modules` je věc Node a nástrojů. Prohlížeč o ní nic neví a v adresáři sám nehledá.

### --correct--
Konzole ohlásí `Failed to resolve module specifier "dayjs"` a skript se nespustí.

#### --why--
Prohlížeč umí importovat jen adresy (`./`, `/`, `https://`). Holé jméno balíčku musí na cestu k souboru přeložit nástroj — a to je jedna z věcí, které dělá Vite.

### --answer--
Stránka poběží, jen se `dayjs` stáhne z internetu.

#### --why--
Prohlížeč nemá žádný výchozí registr balíčků, odkud by je stahoval. Holé jméno nerozluští vůbec.
:::

Moduly z předchozích lekcí umí prohlížeč načíst sám. Na skutečném projektu to ale nestačí. Import balíčku z npm nerozluští. Aplikace ze tří set modulů by při každém načtení posílala tři sta požadavků. JSX, TypeScript ani import CSS z JavaScriptu prohlížeč nezná. A když nasadíš novou verzi, uživatelům zůstane v mezipaměti ta stará.

Každý moderní frontend — Vue, React, Svelte i obyčejná stránka s pár moduly — proto stojí na nástroji, který tohle řeší. Nejrozšířenější je dnes Vite.

> [!REMEMBER]
> **Vite při vývoji servíruje tvoje moduly skoro tak, jak jsou, a při sestavení je slepí do pár malých souborů pro produkci.**

## Proč bundler

[[Bundler]] vezme vstupní soubor, projde všechny jeho importy (i do `node_modules`) a vyrobí z nich soubory pro prohlížeč. Cestou udělá:

- **přeložení importů** — `'dayjs'` na skutečný soubor v `node_modules`,
- **spojení** stovek modulů do několika souborů, aby prohlížeč nestahoval každý zvlášť,
- **převod** toho, co prohlížeč nezná: TypeScript, JSX, import CSS a obrázků,
- **minifikaci** — odstraní mezery, komentáře a zkrátí jména,
- [[tree shaking]] — vyhodí exporty, které nikdo neimportuje,
- **otisk do jména souboru** — `index-D8Kx3fQ1.js`, takže nová verze má nové jméno a prohlížeč ji nevezme ze staré mezipaměti.

Vite je ve verzi 8 postavený na nástrojích napsaných v Rustu: Rolldown spojuje moduly a Oxc převádí kód. Proto je rychlý i na velkých projektech. Ve starších projektech potkáš webpack, v Next.js Turbopack. Dělají totéž, liší se nastavením a rychlostí.

:::check
Knihovna `cz-utils` exportuje 40 funkcí a tvoje aplikace z ní importuje jen `formatCzk`. Jak se jmenuje krok bundleru, díky kterému se ostatních 39 funkcí do výsledného souboru nedostane?

### --expected-- ignore-case
tree shaking

### --accept-- ignore-case
treeshaking
tree-shaking

### --why--
Tree shaking projde, které exporty se opravdu importují, a zbytek do výsledku nezahrne. Funguje díky tomu, že ES moduly mají importy zapsané staticky a dají se přečíst bez spuštění kódu.
:::

## Založení projektu

Nový projekt založí oficiální šablona:

```sh
npm create vite@latest rezervace-kurtu -- --template vanilla
cd rezervace-kurtu
npm install
npm run dev
```

Šablona `vanilla` je čistý JavaScript bez frameworku (jiné jsou `react`, `vue`, `svelte`, varianty s `-ts`). Vznikne tahle struktura:

```text
rezervace-kurtu/
├── index.html          vstup aplikace
├── package.json        skripty dev, build, preview
├── public/             soubory, které se kopírují beze změny
│   └── vite.svg
└── src/
    ├── main.js         první modul, na který odkazuje index.html
    └── style.css
```

V `package.json` jsou tři skripty, které budeš pouštět pořád:

| skript | příkaz | co dělá |
|---|---|---|
| `npm run dev` | `vite` | vývojový server s okamžitým překreslením |
| `npm run build` | `vite build` | sestaví produkční verzi do `dist/` |
| `npm run preview` | `vite preview` | pustí hotové `dist/` na zkoušku |

Nastavení Vite žije v `vite.config.js`. Šablona ho nepotřebuje, výchozí hodnoty stačí. Když ho přidáš, vypadá takhle a jeho výchozí export je objekt s nastavením:

```js
import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3000 },
});
```

:::check
Který příkaz pustíš, když chceš vidět, jak se bude chovat opravdu sestavená aplikace, a ne vývojová verze?

### --answer--
`npm run dev`

#### --why--
Dev server servíruje moduly jednotlivě a bez minifikace. Sestavenou verzi neukáže.

### --correct--
`npm run build` a pak `npm run preview`

#### --why--
`build` vyrobí `dist/` a `preview` ho pustí na místním serveru přesně tak, jak by ho servíroval hosting.

### --answer--
Otevřít `dist/index.html` dvojklikem v prohlížeči.

#### --why--
Stránka otevřená z disku přes `file://` nesmí načíst modulové skripty, takže uvidíš bílou stránku. Sestavená aplikace potřebuje server.
:::

## `index.html` jako vstup

U Vite je vstupem aplikace `index.html` v kořeni projektu, ne JavaScript. Vite v něm najde skripty a styly a od nich projde celý strom importů:

```html
<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <link rel="icon" href="/favicon.svg">
    <title>Rezervace kurtů</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Cesta `/src/main.js` začíná lomítkem a vede **od kořene projektu**. Skript musí mít `type="module"` — bez něj ho Vite při sestavení nezpracuje, jen vypíše varování, že ho nejde spojit. Při sestavení Vite přepíše adresy v `index.html` na hotové soubory s otiskem.

:::check
V `index.html` Vite projektu je `<script src="/src/main.js"></script>` bez atributu `type`. Co musíš doplnit, aby Vite skript při sestavení zpracoval i s jeho importy?

### --expected--
type="module"

### --accept--
type=module

### --why--
Vite zpracovává jen modulové skripty. Obyčejný skript nesmí obsahovat `import`, takže ho nemá jak spojit s ostatními moduly.
:::

## Dev server a HMR

`npm run dev` pustí vývojový server, obvykle na `http://localhost:5173`. Při vývoji Vite nic dopředu neslepuje. Když si prohlížeč řekne o modul, Vite ho převede (třeba TypeScript nebo JSX) a pošle. Balíčky z `node_modules` jednorázově připraví dopředu, protože mívají stovky souborů. Proto dev server naběhne za zlomek sekundy i u velké aplikace.

Po uložení souboru Vite pošle prohlížeči jen změněný modul. Tomu se říká [[HMR]] (*Hot Module Replacement*):

- **CSS** se vymění bez obnovení stránky — rozepsaný formulář ani otevřený dialog nezmizí,
- **JavaScript** v projektu bez frameworku způsobí obnovení celé stránky, protože Vite neví, jak kód vyměnit za běhu. Frameworky jako React nebo Vue to umí a vymění jen změněnou komponentu i se zachovaným stavem.

> [!TIP]
> Dev server běží, dokud ho nezastavíš klávesami Ctrl+C. Když se něco chová divně (stará verze modulu, chybějící balíček po `npm install`), zastav ho a pusť `npm run dev` znovu.

:::check
V projektu ve Vite bez frameworku upravíš barvu tlačítka v `src/style.css`, které importuje `main.js`. Co se stane v otevřeném prohlížeči?

### --answer--
Nic, musíš stránku obnovit sám.

#### --why--
Myslíš si, že dev server jen servíruje soubory jako statický server? Sleduje změny a posílá je prohlížeči.

### --correct--
Barva se změní hned a stránka se neobnoví, stav zůstane.

### --answer--
Stránka se obnoví celá a vyplněný formulář zmizí.

#### --why--
Tak se Vite zachová po změně JavaScriptu bez frameworku. CSS umí vyměnit bez obnovení.
:::

## Import CSS, obrázků a JSON

Ve Vite se do JavaScriptu importuje i to, co není JavaScript:

```js
import './style.css';
import emptyCartUrl from './assets/empty-cart.svg';
import openingHours from './opening-hours.json';

document.querySelector('#empty img').src = emptyCartUrl;
```

- **CSS** — `import './style.css'` styly vloží do stránky. Při sestavení skončí v samostatném souboru `.css`.
- **Obrázek, písmo, video** — výchozí export je **adresa** souboru. Při sestavení dostane soubor otisk do jména a adresa se přepíše. Malé soubory (do 4 KB) Vite rovnou vloží do JavaScriptu jako `data:` adresu, aby se ušetřil požadavek.
- **JSON** — výchozí export jsou data. Ve Vite se atribut `with { type: 'json' }` psát nemusí, ale funguje.

Výhoda importu proti adrese napsané ručně: když se soubor přejmenuje nebo smaže, sestavení spadne hned, ne až u uživatele s rozbitým obrázkem.

:::check
Co bude v proměnné `logoUrl` po řádku `import logoUrl from './assets/logo.png'` ve Vite projektu?

### --answer--
Obsah obrázku jako pole bajtů.

#### --why--
Myslíš si, že import načte data souboru? U obrázků Vite importem předá jen adresu, obrázek stáhne až prohlížeč.

### --correct--
Adresa obrázku, kterou můžeš dát do `src`.

### --answer--
Hotový prvek `<img>`.

#### --why--
Vite nevytváří prvky stránky. Prvek vyrobíš sám a adresu mu nastavíš.
:::

## Složka `public/`

Soubory ve složce `public/` Vite neimportuje ani nemění. Při sestavení je beze změny zkopíruje do kořene `dist/` a v kódu se na ně odkazuješ absolutní cestou bez `public`: soubor `public/favicon.svg` má adresu `/favicon.svg`.

| | `src/assets/` + import | `public/` |
|---|---|---|
| jméno po sestavení | s otiskem, `logo-B2x9qT.svg` | beze změny, `favicon.svg` |
| chybějící soubor | sestavení spadne | přijde až chyba 404 v prohlížeči |
| hodí se na | obrázky a písma, které používá kód | `favicon.ico`, `robots.txt`, soubory, které musí mít pevné jméno |

Výchozí volba je import. Do `public/` dávej jen to, co musí mít přesně dané jméno a adresu.

:::check
Vyhledávač hledá soubor `robots.txt` přesně na adrese `/robots.txt`. Kam ho ve Vite projektu dáš?

### --expected--
public/robots.txt

### --accept--
public
do public
public/

### --why--
Soubory z `public/` se zkopírují beze změny jména do kořene webu. Soubor z `src/` by dostal otisk do jména a na `/robots.txt` by nebyl.
:::

## Proměnné prostředí: `import.meta.env`

Adresa API, klíč k mapám nebo jméno obchodu se liší mezi vývojem a produkcí. Vite je čte ze souborů `.env` v kořeni projektu a dává je kódu v objektu `import.meta.env`:

```sh
# .env
VITE_API_URL=https://api.kavarna.cz
MAPS_SECRET=sk_live_8f2a91
```

Kód ale uvidí **jen proměnné s předponou `VITE_`**. Všechno ostatní Vite schová. Důvod je zásadní: hodnoty se při sestavení doslova vepíšou do JavaScriptu, který si stáhne každý návštěvník. Předpona je pojistka, aby se do stránky omylem nedostalo heslo k databázi.

Soubor `.env` projektu kavárny obsahuje `VITE_SHOP_NAME=Kavárna Na Kopečku` a `DB_PASSWORD=tajne123`.

:::live node predict
```js
// src/main.js
console.log(import.meta.env.VITE_SHOP_NAME);
console.log(import.meta.env.DB_PASSWORD);
```
--question-- Projekt sestavíš `npm run build` a otevřeš přes `npm run preview`. Co vypíše konzole prohlížeče?
--output--
```text
Kavárna Na Kopečku
undefined
```
--why-- Vite do sestaveného kódu vepíše jen proměnné s předponou `VITE_`. Místo `import.meta.env.DB_PASSWORD` dosadí `undefined`, takže heslo v souborech v `dist/` vůbec není. Kdyby se jmenovalo `VITE_DB_PASSWORD`, bylo by v JavaScriptu čitelné pro kohokoli.
:::

Vite navíc sám dodá `import.meta.env.MODE` (`'development'` nebo `'production'`), `DEV` a `PROD` (pravdivostní hodnoty) a `BASE_URL`. Soubor `.env.local` slouží pro hodnoty jen z tvého počítače a do Gitu nepatří, `.env.production` platí jen při sestavení.

> [!PITFALL]
> **Tajemství s předponou `VITE_`.** `VITE_STRIPE_SECRET_KEY` najde kdokoli v souboru `dist/assets/index-….js`. Předpona neznamená „bezpečné", ale „veřejné". Tajné klíče patří jen na server — k tomu se dostaneme v sekci o Node.

:::check
Proč Vite do kódu v prohlížeči pustí jen proměnné s předponou `VITE_`?

### --expected-- ignore-case
Aby se do veřejného kódu omylem nedostala tajná hodnota

### --accept-- ignore-case
Aby se do stránky nedostala hesla
Protože se hodnoty vepíšou do kódu, který si stáhne každý
Aby neunikla tajemství
Kvůli bezpečnosti, hodnoty jsou v kódu veřejné

### --why--
Hodnoty z `import.meta.env` se při sestavení vepíšou přímo do JavaScriptu, který si stáhne každý návštěvník. Předpona je výslovné rozhodnutí „tohle smí být veřejné".
:::

## Sestavení a složka `dist`

`npm run build` vyrobí složku `dist/` s hotovým webem:

```text
dist/
├── index.html                   přepsané adresy na soubory s otiskem
├── favicon.svg                  zkopírované z public/
└── assets/
    ├── index-D8Kx3fQ1.js        všechny moduly slepené a minifikované
    ├── index-C4mw2Rta.css       všechno CSS z importů
    └── empty-cart-B2x9qTe1.svg  obrázek s otiskem
```

Tuhle složku nahraješ na hosting — nic jiného z projektu tam nepatří. Je to výrobek, ne zdroják: do Gitu nepatří a patří do `.gitignore` vedle `node_modules`.

Otisk ve jméně (`D8Kx3fQ1`) se spočítá z obsahu souboru. Hosting proto může soubory v `assets/` nechat prohlížeče schovat v mezipaměti třeba na rok: po změně kódu vznikne soubor s jiným jménem a nová verze `index.html` odkáže na něj.

Sestavené adresy začínají lomítkem (`/assets/…`), tedy od kořene domény. Když web poběží v podsložce, třeba `https://eva.github.io/kavarna/`, nastav ve `vite.config.js` `base: '/kavarna/'` (nebo `base: './'` pro relativní adresy). Jinak prohlížeč hledá soubory o patro výš a stránka zůstane bílá.

:::check
Po nasazení na `https://jana.github.io/kurty/` je stránka bílá a konzole hlásí 404 na `https://jana.github.io/assets/index-D8Kx3fQ1.js`. Kterou volbu ve `vite.config.js` doplníš?

### --expected--
base

### --accept--
base: '/kurty/'
base: './'

### --why--
Výchozí `base` je `/`, takže adresy vedou od kořene domény. S `base: '/kurty/'` začnou všechny adresy v `dist/` podsložkou, kde web opravdu leží.
:::

:::explain
Vysvětli vlastními slovy, proč se při vývoji moduly servírují jednotlivě, ale pro
produkci se slepí dohromady.

## --model--
Při vývoji je nejdražší **čekání po uložení souboru**. Když prohlížeč načítá moduly
tak, jak jsou, může se po změně znovu poslat jen ten jeden soubor — odezva je okamžitá
bez ohledu na velikost projektu. V produkci se ale nikdo nedívá na rychlost úprav,
zato na rychlost načtení stránky u návštěvníka: tisíc samostatných požadavků je
pomalých, nepomůže ani komprese a nejde z nich vyhodit nepoužitý kód. Proto se pro
produkci soubory slepí, zmenší a rozdělí tak, aby se stahovalo jen to, co je pro danou
stránku potřeba. Jsou to dva různé cíle, a proto dva různé režimy.

## --checklist--
- Při vývoji rozhoduje rychlost odezvy po uložení.
- Jednotlivé moduly umožní poslat jen změněný soubor.
- V produkci rozhoduje rychlost načtení u návštěvníka.
- Sloučení a zmenšení dává smysl až tam.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`dist/index.html` otevřený dvojklikem.** Bílá stránka a v konzoli `Access to script at 'file:///…/assets/index-….js' from origin 'null' has been blocked by CORS policy`. Oprava: `npm run preview`.

> [!PITFALL]
> **`process.env` z návodu pro Node.** `process.env.API_URL` v kódu pro prohlížeč nespadne, ale je tiše `undefined` — Vite ho nahradí prázdným objektem. Oprava: `import.meta.env.VITE_API_URL`.

> [!PITFALL]
> **Proměnná bez předpony.** `import.meta.env.API_URL` je `undefined`. Oprava: přejmenuj ji v `.env` i v kódu na `VITE_API_URL` — pokud to není tajemství.

> [!PITFALL]
> **Web v podsložce.** Bílá stránka a 404 na `/assets/…`. Oprava: `base` ve `vite.config.js`.

:::check
Kolega poslal zazipovanou složku `dist/`. Po dvojkliku na `index.html` vidíš bílou stránku a v konzoli chybu CORS u souboru `assets/index-….js`. Je sestavení rozbité?

### --answer--
Ano, chybí v něm JavaScript.

#### --why--
Soubor `assets/index-….js` v hlášení je — prohlížeč ho našel, jen ho odmítl načíst.

### --correct--
Nejspíš ne. Modulové skripty se přes `file://` nenačtou, stránku je potřeba pustit přes server, třeba `npx vite preview`.

### --answer--
Ano, kolega zapomněl nastavit `base`.

#### --why--
Špatné `base` by se projevilo chybou 404 na adrese souboru. Chyba CORS u stránky otevřené z disku má jinou příčinu.
:::

## Kde to najdeš v MDN

- [Client-side tooling overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview) — k čemu jsou nástroje jako bundler, minifikátor a transformátory kódu.
- [Tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) — heslo ve slovníku MDN.
- [Průvodce Vite](https://vite.dev/guide/) — oficiální dokumentace: založení projektu, `public/`, `import.meta.env` a sestavení.
- [Env Variables and Modes](https://vite.dev/guide/env-and-mode) — pořadí souborů `.env` a předpona `VITE_`.

# --questions--

## --question--

Vývojář dal obrázek `hero.jpg` do `public/images/` a v `main.js` napsal `img.src = '/public/images/hero.jpg'`. Při vývoji i po sestavení se obrázek nenačte. Napiš správnou adresu.

### --expected--
/images/hero.jpg

### --why--
Obsah `public/` se servíruje z kořene webu, složka `public` sama v adrese není. Po sestavení leží soubor v `dist/images/hero.jpg`.

### --see--
nastroje-moduly-vite/vite#slozka-public

## --question--

Proč se soubory v `dist/assets/` jmenují třeba `index-D8Kx3fQ1.js`, a ne prostě `index.js`?

### --expected-- ignore-case
Aby po změně obsahu vznikl soubor s jiným jménem a prohlížeč nevzal starou verzi z mezipaměti

### --accept-- ignore-case
Kvůli mezipaměti prohlížeče
Kvůli cache
Aby prohlížeč nepoužil starou verzi z mezipaměti
Otisk se mění s obsahem, takže cache nevrátí starou verzi

### --why--
Otisk se počítá z obsahu. Nová verze kódu dostane nové jméno, takže soubory smí být v mezipaměti dlouho a uživatel stejně vždy dostane aktuální verzi.

### --see--
nastroje-moduly-vite/vite#sestaveni-a-slozka-dist

## --question--

Kterou z těchto věcí dělá Vite jen při sestavení (`vite build`), a ne na dev serveru?

### --answer--
Převod TypeScriptu a JSX na JavaScript.

#### --why--
Převod je potřeba i při vývoji, jinak by prohlížeč kód nespustil. Dev server převádí každý modul ve chvíli, kdy si o něj prohlížeč řekne.

### --correct--
Spojení všech modulů do několika souborů s otiskem ve jméně.

#### --why--
Dev server posílá moduly jednotlivě, aby po uložení mohl poslat jen ten změněný. Spojení, minifikace a otisky se dějí až při sestavení.

### --answer--
Přeložení importu `'dayjs'` na soubor v `node_modules`.

#### --why--
Bez přeložení holých jmen by aplikace nešla spustit ani při vývoji. Dev server ho dělá taky.

### --see--
nastroje-moduly-vite/vite#dev-server-a-hmr
