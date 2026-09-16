# ES moduly

:::check pretest
Stránka načítá dva obyčejné skripty za sebou: `<script src="cart.js">` a `<script src="menu.js">`. Oba na nejvyšší úrovni obsahují řádek `const total = 0;`. Co se stane?

### --answer--
Každý soubor má svoje `total`, nic se nestane.

#### --why--
To by platilo pro moduly. Obyčejné skripty sdílejí jeden společný rozsah platnosti celé stránky.

### --answer--
Druhé `total` tiše přepíše první.

#### --why--
Tiché přepsání by nastalo u `var` nebo u přiřazení bez deklarace. Druhé `const` se stejným jménem ve stejném rozsahu se nedá deklarovat vůbec.

### --correct--
Druhý skript spadne s chybou, že `total` už je deklarované.

#### --why--
Klasické skripty sdílejí globální rozsah. Druhý skript skončí chybou `SyntaxError: Identifier 'total' has already been declared` a neproběhne z něj ani řádek.
:::

Každá větší webová aplikace — e-shop, rezervační systém, administrace — má stovky funkcí. V jednom souboru `app.js` o dvou tisících řádcích se nedá nic najít, dva lidé v něm nemůžou pracovat zároveň a každé nové jméno může kolidovat s jiným o tisíc řádků výš. Když kód rozsekáš do víc souborů obyčejnými `<script>` značkami, problém nezmizí: všechny sdílejí jeden globální prostor a záleží na pořadí, v jakém je stránka načte.

ES moduly (*ES modules*) tohle řeší přímo v jazyce. Rozdělíš kód do souborů a každý z nich řekne, co pouští ven a co potřebuje zvenku.

> [!REMEMBER]
> **Modul je soubor s vlastním rozsahem platnosti: ven pustí jen to, co exportuje, a dovnitř vezme jen to, co importuje.**

Stejná pravidla platí v prohlížeči, v Node i ve Vite, se kterým se potkáš za dvě lekce. Kdo zná moduly, přečte strukturu libovolného moderního projektu.

## Pojmenovaný export a import

Slovo `export` před deklarací z funkce, konstanty nebo třídy udělá [[pojmenovaný export]]. Jiný soubor si ji vezme přes `import` se složenými závorkami a **stejným jménem**:

```js
// money.js
export const VAT_RATE = 0.21;

export function formatCzk(amount) {
  return `${amount.toLocaleString('cs-CZ')} Kč`;
}

function roundToCrowns(amount) {
  return Math.round(amount);
}
```

```js
// checkout.js
import { formatCzk, VAT_RATE } from './money.js';

const price = 1290;
console.log(formatCzk(price * (1 + VAT_RATE)));
```

Funkce `roundToCrowns` exportovaná není. Pro `checkout.js` neexistuje — je to vnitřní věc modulu `money.js`, kterou můžeš kdykoli přejmenovat nebo smazat, aniž by se jinde něco rozbilo.

Exportovat se dá i dodatečně, seznamem na konci souboru. Je to užitečné, když chceš mít celé rozhraní modulu pohromadě na jednom místě:

```js
function formatCzk(amount) { /* … */ }
const VAT_RATE = 0.21;

export { formatCzk, VAT_RATE };
```

Když se dvě jména potkají (dva moduly exportují `format`), přejmenuješ je při importu přes `as`:

```js
import { format as formatDate } from './dates.js';
import { format as formatPrice } from './money.js';
```

A když chceš celý modul jako jeden objekt, použiješ `import * as`. Vznikne takzvaný jmenný prostor (*namespace*) — objekt, jehož vlastnosti jsou exporty:

```js
import * as money from './money.js';
money.formatCzk(99);
```

:::check
Modul `stock.js` obsahuje `export function isInStock(item) { … }` a `function logMissing(item) { … }` bez exportu. Napiš řádek, kterým si v jiném souboru ve stejné složce vezmeš `isInStock`.

### --expected--
import { isInStock } from './stock.js'

### --accept--
import { isInStock } from "./stock.js"

### --why--
Pojmenovaný export se importuje ve složených závorkách přesně pod svým jménem. `logMissing` exportovaná není, takže ji importovat nejde.
:::

## Výchozí export

Modul může mít navíc jeden [[výchozí export]] (*default export*). Importuje se **bez** složených závorek a pod jakýmkoli jménem:

```js
// receipt.js
export default function renderReceipt(order) { /* … */ }
```

```js
// app.js
import renderReceipt from './receipt.js';
import printBill from './receipt.js'; // totéž, jen jiné jméno
```

Právě ta volnost je jeho slabina. V jednom souboru se funkce jmenuje `renderReceipt`, ve druhém `printBill`, ve třetím `receipt` — hledání v projektu ji nenajde a editor při přejmenování neví, co všechno má změnit. Pojmenovaný export drží jedno jméno všude.

Výchozí export uvidíš tam, kde je to konvence nástroje: React komponenta stránky, konfigurační soubor `vite.config.js` nebo `eslint.config.js`. **Ve vlastním kódu dávej přednost pojmenovaným exportům.**

Záměna obou zápisů je jedna z nejčastějších chyb. Když modul exportuje jen pojmenovaně a ty napíšeš import bez závorek, prohlížeč i Node odmítnou modul vůbec spustit:

```text
SyntaxError: The requested module './money.js' does not provide an export named 'default'
```

:::check
V souboru `slugify.js` je jediný export: `export default function slugify(text) { … }`. Kolega v jiném souboru napsal `import { slugify } from './slugify.js'`. Co se stane?

### --answer--
Funguje to, jméno funkce sedí.

#### --why--
Myslíš si, že složené závorky hledají funkci podle jejího jména v deklaraci? Hledají pojmenovaný export `slugify` — a ten modul nemá, má jen výchozí.

### --correct--
Modul se nespustí: `slugify.js` nemá pojmenovaný export `slugify`.

#### --why--
Závorky znamenají pojmenovaný export. Výchozí export se importuje bez nich: `import slugify from './slugify.js'`.

### --answer--
`slugify` bude `undefined` a chyba přijde až při volání.

#### --why--
Import chybějícího jména není jako čtení chybějící vlastnosti objektu. Propojení importů a exportů se kontroluje před spuštěním, takže kód neběží ani chvíli.
:::

## Modul má vlastní rozsah platnosti

Proměnné a funkce na nejvyšší úrovni modulu nejsou globální. Nepřidají se do `window` a jiný skript je nevidí. Moduly mají navíc tři vlastnosti, které klasické skripty nemají:

- běží vždy ve striktním režimu (`'use strict'` psát nemusíš),
- v prohlížeči se odloží jako `defer` a spustí se až po postavení stránky,
- každý modul se **spustí jen jednou**, i když ho importuje deset souborů. Všichni dostanou tytéž hodnoty.

V prohlížeči se modul zapíná atributem `type="module"`. Z vlastního rozsahu plyne past, na kterou narazíš, když převádíš starou stránku na moduly:

:::live predict
```html
<button type="button" onclick="addToCart()">Přidat do košíku</button>
<p id="status">Košík je prázdný.</p>

<script type="module">
  function addToCart() {
    document.querySelector('#status').textContent = 'V košíku: 1 položka';
  }
</script>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
button { font: inherit; padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid #1d4ed8; background: #2563eb; color: white; cursor: pointer; }
```
--question-- Co se stane po kliknutí na tlačítko?
--option-- Text se změní na „V košíku: 1 položka".
--option*-- Nic se nezmění a v konzoli je `ReferenceError: addToCart is not defined`.
--option-- Nic se nestane, protože modul ještě neproběhl.
--why-- Atribut `onclick` hledá funkci v globálním rozsahu stránky. `addToCart` ale žije uvnitř modulu, ven se nedostala. Správná oprava je posluchač přímo v modulu: `document.querySelector('button').addEventListener('click', addToCart)`. Zkus ji dopsat do skriptu, smazat `onclick` a kliknout znovu.
:::

:::check
Soubor `analytics.js` má na nejvyšší úrovni `console.log('Měření spuštěno')`. Importují ho `cart.js` i `checkout.js` a oba tyhle soubory importuje `main.js`. Kolikrát se po načtení stránky zpráva vypíše?

### --expected--
1

### --why--
Modul se vyhodnotí jen při prvním importu. Každý další import dostane už hotový modul se stejnými hodnotami.
:::

## Cesty v importu

Text za `from` se jmenuje specifikátor modulu. Rozlišuj dva druhy:

| zápis | co to je | kdo ho najde |
|---|---|---|
| `'./money.js'`, `'../menu.js'` | relativní cesta k vlastnímu souboru | prohlížeč, Node i Vite |
| `'dayjs'`, `'vue'` | [[holý specifikátor]] — jméno balíčku | Node a Vite v `node_modules`, prohlížeč sám ne |

Relativní cesta začíná `./` (stejná složka) nebo `../` (o složku výš) a vede od **souboru, ve kterém import stojí**, ne od kořene projektu. Z `orders/receipt.js` vede cesta k `money.js` v kořeni jako `'../money.js'`.

**Příponu `.js` piš vždy.** Prohlížeč ani Node ji nedoplní a Node bez ní skončí takhle:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/eva/pokladna/money' imported from /home/eva/pokladna/app.js
Did you mean to import "./money.js"?
```

Vite a další nástroje příponu dohledat umí, a proto ji v cizích projektech často neuvidíš. Kód s příponou ale funguje všude.

Holý specifikátor prohlížeč sám nerozluští a ohlásí `Failed to resolve module specifier "dayjs"`. Balíčky z npm do stránky dostane až nástroj jako Vite — k tomu se dostaneme v lekci [Vite a bundlery](see:nastroje-moduly-vite/vite#proc-bundler).

:::check
Soubor `reports/daily.js` potřebuje funkci `formatCzk` ze souboru `money.js`, který leží v kořeni projektu (o složku výš). Napiš import.

### --expected--
import { formatCzk } from '../money.js'

### --why--
Cesta se počítá od souboru s importem. Ze složky `reports` se do kořene dostaneš přes `../`.
:::

## Živé vazby

Import nevyrobí kopii hodnoty. Importované jméno je [[živá vazba]] (*live binding*) — okno, kterým se díváš na proměnnou uvnitř modulu. Když ji modul změní, uvidíš novou hodnotu i ty. Sám ji ale měnit nesmíš: import je jen pro čtení.

Modul `queue.js` vydává pořadová čísla:

```js
// queue.js
export let lastNumber = 0;

export function nextNumber() {
  lastNumber += 1;
  return lastNumber;
}
```

:::live node predict
```js
import { lastNumber, nextNumber } from './queue.js';

console.log(lastNumber);
nextNumber();
nextNumber();
console.log(lastNumber);
```
--question-- Co vypíše tenhle soubor, který importuje z `queue.js`?
--output--
```text
0
2
```
--why-- `lastNumber` v importujícím souboru není kopie nuly z okamžiku importu. Je to vazba na proměnnou uvnitř `queue.js`, takže po dvou voláních `nextNumber()` ukazuje dvojku. Kdybys hodnotu potřeboval zmrazit, ulož si ji do vlastní proměnné: `const numberAtStart = lastNumber`.
:::

Opačný směr nefunguje. Řádek `lastNumber = 5` nebo `lastNumber++` v importujícím souboru skončí chybou:

```text
TypeError: Assignment to constant variable.
```

Hláška mluví o konstantě, i když modul napsal `let` — z pohledu importu je každé jméno konstanta. Kdo chce hodnotu změnit, musí zavolat funkci modulu, která to udělá uvnitř. **Stav tak mění jen modul, kterému patří.**

:::check
Modul `theme.js` exportuje `export let currentTheme = 'light';`. Jak má jiný soubor přepnout motiv na tmavý?

### --answer--
Napsat `currentTheme = 'dark'` hned pod import.

#### --why--
Myslíš si, že `let` v modulu dovolí přiřazení i zvenku? Importované jméno je jen pro čtení a přiřazení skončí `TypeError: Assignment to constant variable.`

### --correct--
Zavolat funkci, kterou `theme.js` exportuje a která `currentTheme` změní uvnitř modulu.

### --answer--
Importovat `currentTheme` pod jiným jménem přes `as` a přiřadit do něj.

#### --why--
`as` mění jen jméno vazby, ne to, že je jen pro čtení. Přiřazení skončí stejnou chybou.
:::

:::explain
Vysvětli, proč importující soubor po zavolání `nextNumber()` vidí novou hodnotu `lastNumber`, ale sám do `lastNumber` přiřadit nesmí.

## --model--
Import nekopíruje hodnotu, ale vytvoří živou vazbu na proměnnou uvnitř modulu. Když modul proměnnou změní, importující soubor čte novou hodnotu. Vazba je ale jen pro čtení, takže přiřazení zvenku skončí `TypeError`. Stav mění jen modul sám, třeba funkcí, kterou exportuje.

## --checklist--
- Import je vazba na proměnnou v modulu, ne kopie hodnoty.
- Změnu uvnitř modulu importující soubor vidí.
- Importované jméno je jen pro čtení, přiřazení zvenku vyhodí `TypeError`.
- Měnit stav se dá přes exportovanou funkci modulu.
:::

## Veřejné rozhraní a `index.js`

Co modul exportuje, je jeho [[veřejné rozhraní]]: slib ostatním souborům, že tohle můžou používat. Čím menší rozhraní, tím volněji můžeš měnit vnitřek. Dobré pravidlo: exportuj to, co opravdu volá někdo jiný, a nic „pro jistotu".

Když se složka rozroste na víc modulů, dostane vlastní vstupní soubor `index.js`, kterému se říká [[barrel soubor]] (*barrel file*). Nic nepočítá, jen znovu vyexportuje to, co je veřejné:

```js
// cart/index.js
export { addItem, removeItem } from './items.js';
export { cartTotal } from './totals.js';
```

Zápis `export { … } from` vezme exporty jiného modulu a pustí je ven, aniž by si je sám importoval. Zbytek aplikace pak píše jen `import { addItem, cartTotal } from './cart/index.js'` a nezajímá ho, ve kterém souboru uvnitř složky funkce leží. Když `totals.js` později rozdělíš na dva soubory, změníš jen `index.js`.

> [!PITFALL]
> `export * from './items.js'` vypadá pohodlně, ale pustí ven **všechno**, i pomocné funkce, které měly zůstat uvnitř. Za rok na nich závisí půl aplikace a vnitřek složky už nejde měnit. Veřejné rozhraní vyjmenuj.

:::check
Proč zbytek aplikace importuje z `cart/index.js`, a ne rovnou z `cart/totals.js`?

### --answer--
Import přes `index.js` je rychlejší, prohlížeč stahuje méně souborů.

#### --why--
Myslíš si, že mezikrok ušetří stahování? Moduly za `index.js` se stáhnout musí tak jako tak, spíš je o jeden soubor víc.

### --correct--
Vnitřní rozdělení složky se pak dá měnit, aniž by se přepisovaly importy ve zbytku aplikace.

### --answer--
Přímý import z `cart/totals.js` není povolený, soubor bez `index.js` nejde importovat.

#### --why--
Importovat se dá z jakéhokoli souboru, který export má. `index.js` je dohoda o rozhraní, ne technické omezení.
:::

## Import JSON

Data v souboru JSON (ceník, překlady, konfigurace) jde importovat jako modul. Celý
obsah souboru je jeho výchozí export. Musíš ale výslovně říct, že importuješ JSON,
atributem `with { type: 'json' }`:

```js
import translations from './cs.json' with { type: 'json' };

console.log(translations.cartTitle);
```

Bez atributu Node import odmítne:

```text
TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Module "file:///home/eva/web/cs.json" needs an import attribute of "type: json"
```

Atribut není formalita. Server může na adrese `.json` vrátit i JavaScript, a prohlížeč
by ho bez atributu spustil. S atributem ho načte jen jako data. Pojmenované importy
z JSON nefungují — `import { cartTitle } from './cs.json' with { type: 'json' }` hlásí,
že export `cartTitle` neexistuje. Vezmi výchozí export a vlastnosti čti z něj.

:::check
Soubor `prices.json` obsahuje `{ "espresso": 55 }`. Napiš import, po kterém `prices.espresso` vrátí 55.

### --expected--
import prices from './prices.json' with { type: 'json' }

### --why--
JSON má jen výchozí export (celý obsah souboru) a import potřebuje atribut `type: 'json'`.
:::

## Dynamický `import()`

Statický `import` na začátku souboru se načte vždy, ještě před spuštěním kódu. Někdy ale modul potřebuješ jen občas: editor fotek po kliknutí na „Upravit", graf v administraci až na záložce Statistiky. Na to je [[dynamický import]] — funkce `import()`, která vrátí Promise se jmenným prostorem modulu:

```js
const editButton = document.querySelector('#edit-photo');

editButton.addEventListener('click', async () => {
  const { openEditor } = await import('./photo-editor.js');
  openEditor();
});
```

Soubor `photo-editor.js` se stáhne až po prvním kliknutí; další kliknutí ho už mají v paměti. Výsledek je obyčejná Promise, takže chybu (třeba výpadek sítě) chytíš přes `try`/`catch` jako u `fetch`.

Na rozdíl od statického importu smí `import()` stát kdekoli — v podmínce, ve funkci, v posluchači — a cesta smí být i spočítaná za běhu.

:::check
Proč stránka e-shopu načítá modul s platební bránou přes `await import('./payment.js')` až po kliknutí na „K pokladně", a ne statickým importem nahoře?

### --expected-- ignore-case
Aby se nestahoval, dokud ho uživatel nepotřebuje

### --accept-- ignore-case
Aby se stáhl až když je potřeba
Aby se úvodní stránka načetla rychleji
Kvůli rychlejšímu načtení stránky

### --why--
Statický import se stáhne a spustí vždy, i když se k pokladně většina návštěvníků nedostane. Dynamický import odloží stažení až na chvíli, kdy je modul opravdu potřeba, a úvodní stránka je menší a rychlejší.
:::

## Top-level `await` a `import.meta`

V modulu smí `await` stát přímo na nejvyšší úrovni souboru, mimo `async` funkci:

```js
// settings.js
const response = await fetch('/api/settings');
export const settings = await response.json();
```

Moduly, které `settings.js` importují, počkají, až se dokončí, a teprve pak se spustí samy. To je pohodlné, ale **pomalý top-level `await` zdrží všechny, kdo modul importují**. Hodí se na krátkou přípravu (načtení konfigurace), ne na nic, co může trvat sekundy.

Druhá věc, kterou mají jen moduly, je objekt `import.meta` s informacemi o aktuálním modulu:

- `import.meta.url` — adresa souboru modulu (`file:///…` v Node, `https://…` v prohlížeči). S `new URL('./menu.json', import.meta.url)` postavíš cestu k souboru vedle modulu, ať program spustíš odkudkoli.
- `import.meta.main` — v Node `true`, když je soubor spuštěný přímo (`node receipt.js`), a `false`, když ho jen někdo importuje.
- `import.meta.env` — proměnné prostředí, které doplní Vite. Uvidíš je v lekci o Vite.

:::check
Soubor `menu.js` čte `menu.json` ze stejné složky. Program spuštěný `node app.js` ze složky projektu funguje, `node pokladna/app.js` o složku výš hlásí, že `menu.json` neexistuje. Která z cest to spraví?

### --answer--
`'./menu.json'`

#### --why--
Myslíš si, že `./` u čtení souboru znamená „vedle modulu"? U funkcí pro práci se soubory znamená „od složky, odkud jsi program spustil". Vedle modulu míří jen import.

### --correct--
`new URL('./menu.json', import.meta.url)`

### --answer--
`'/menu.json'`

#### --why--
Lomítko na začátku je kořen celého disku, ne kořen projektu.
:::

## Cyklické importy

Cyklus vznikne, když `a.js` importuje z `b.js` a `b.js` zase z `a.js`. Moduly to dovolí, ale jeden z nich se nutně začne vyhodnocovat dřív, než druhý doběhne. Když ten první hned na nejvyšší úrovni sáhne na hodnotu z nedokončeného modulu, spadne:

```js
// order.js
import { formatCzk } from './money.js';
export const VAT_RATE = 0.21;
```

```js
// money.js
import { VAT_RATE } from './order.js';
const vatMultiplier = 1 + VAT_RATE;
export function formatCzk(amount) { /* … */ }
```

```text
ReferenceError: Cannot access 'VAT_RATE' before initialization
```

Když spustíš `order.js`, Node nejdřív vyhodnotí jeho závislost `money.js`. Ta na řádku `1 + VAT_RATE` čte konstantu z `order.js`, jenže tam zatím žádný řádek neproběhl.

Oprava skoro nikdy není prohodit importy. Cyklus znamená, že dva moduly sdílejí něco, co nepatří ani jednomu. **Přesuň sdílenou věc do třetího modulu** (`tax.js` s `VAT_RATE`), ze kterého importují oba.

:::check
`user.js` importuje z `permissions.js` a `permissions.js` importuje z `user.js` konstantu `ROLES`. Aplikace padá na `Cannot access 'ROLES' before initialization`. Co je čistá oprava?

### --answer--
Prohodit pořadí importů v `main.js`.

#### --why--
Pořadí vyhodnocení se tím sice může změnit, ale cyklus zůstane a spadne jinde, až někdo přidá další import. Příčina je ve sdílené hodnotě, ne v pořadí.

### --correct--
Přesunout `ROLES` do samostatného modulu, ze kterého importují oba soubory.

### --answer--
Změnit `export const ROLES` na `export var ROLES`.

#### --why--
S `var` chyba zmizí, ale `ROLES` bude v tu chvíli `undefined` a program pojede dál se špatnou hodnotou. Chybu jsi jen schoval.
:::

## CommonJS v cizím kódu

Node měl moduly dřív než JavaScript. Jeho původní systém, CommonJS, uvidíš ve starších návodech, v konfiguracích a uvnitř některých balíčků:

```js
// starý zápis CommonJS
const { formatCzk } = require('./money');
module.exports = { renderReceipt };
```

Poznáš ho podle `require(…)` a `module.exports`. Nový kód tak nepiš. Uvnitř ES modulu `require` ani neexistuje — kdo ho tam ze starého návodu opíše, dostane:

```text
ReferenceError: require is not defined in ES module scope, you can use import instead
```

Když ale potřebuješ starý soubor použít, ES modul ho importovat umí. Celé `module.exports` dostane jako výchozí export:

```js
import legacyLoyalty from './loyalty.cjs';
legacyLoyalty.pointsFor(990);
```

Pojmenované importy z CommonJS fungují jen někdy — Node musí z textu souboru odhadnout, jaká jména `module.exports` obsahuje. Když to nedokáže, hlásí `Named export 'pointsFor' not found. The requested module './loyalty.cjs' is a CommonJS module…`. Výchozí import funguje vždy.

Přípona `.cjs` říká „tenhle soubor je CommonJS", `.mjs` „tenhle je ES modul", bez ohledu na nastavení projektu. Co platí pro obyčejné `.js`, určuje `package.json` — to je téma další lekce.

:::check
V cizím projektu vidíš `const express = require('express')`. Jaký modulový systém ten soubor používá?

### --expected-- ignore-case
CommonJS

### --accept-- ignore-case
CJS

### --why--
`require` a `module.exports` patří CommonJS, původnímu modulovému systému Node. ES moduly používají `import` a `export`.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Import bez přípony.** `import { menu } from './menu'` skončí v Node chybou `ERR_MODULE_NOT_FOUND: Cannot find module '…/menu'`. Oprava: dopiš `.js`.

> [!PITFALL]
> **Závorky u výchozího exportu nebo bez nich u pojmenovaného.** `import formatCzk from './money.js'` nad modulem bez výchozího exportu skončí `does not provide an export named 'default'`. Oprava: `import { formatCzk } from './money.js'`.

> [!PITFALL]
> **Přiřazení do importu.** `lastNumber++` v importujícím souboru hodí `TypeError: Assignment to constant variable.` Oprava: exportuj z modulu funkci, která hodnotu změní uvnitř.

> [!PITFALL]
> **`onclick` v HTML a funkce v modulu.** `onclick="addToCart()"` hlásí `addToCart is not defined`, protože funkce není globální. Oprava: `addEventListener` přímo v modulu.

> [!PITFALL]
> **Cyklus s hodnotou na nejvyšší úrovni.** `Cannot access 'X' before initialization`. Oprava: sdílenou hodnotu přesuň do třetího modulu.

:::check
Po přepisu staré stránky na moduly hlásí konzole `require is not defined in ES module scope`. Který řádek to způsobil?

### --answer--
`import { cartTotal } from './cart.js';`

#### --why--
`import` je v ES modulu správně. Hláška jmenuje funkci, která v modulu neexistuje.

### --correct--
`const dayjs = require('dayjs');`

#### --why--
`require` patří CommonJS. V ES modulu ho nahradí `import`.

### --answer--
`module.exports = { cartTotal };`

#### --why--
I tohle je zápis CommonJS, jenže hláška mluví o `require`. `module` by v ES modulu spadl s jinou chybou.
:::

## Kde to najdeš v MDN

- [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) — celý průvodce moduly v prohlížeči, včetně `type="module"` a dynamického importu.
- [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) — všechny tvary exportu včetně `export { … } from`.
- [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) — tvary importu, jmenný prostor `* as` a živé vazby.
- [import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) — co objekt obsahuje v prohlížeči a proč v Node navíc něco jiného.

# --questions--

## --question--

Modul `stats.js` exportuje `export let visits = 0;` a `export function countVisit() { visits += 1; }`. Soubor `page.js` provede:

```js
import { visits, countVisit } from './stats.js';

const before = visits;
countVisit();
console.log(before, visits);
```

Co vypíše `console.log`?

### --expected--
0 1

### --why--
`before` je obyčejná proměnná, do které se uložila hodnota 0 v okamžiku přiřazení. `visits` je živá vazba na proměnnou v `stats.js`, takže po `countVisit()` ukazuje 1.

### --see--
nastroje-moduly-vite/es-moduly#zive-vazby

## --question--

Složka `booking/` obsahuje `calendar.js`, `prices.js` a `index.js`. Zbytek aplikace importuje jen z `booking/index.js`. Kolegyně chce přesunout funkci `seasonPrice` z `prices.js` do nového souboru `seasons.js`. Který soubor mimo složku `booking/` musí upravit?

### --answer--
Každý soubor, který volá `seasonPrice`.

#### --why--
Ty importují z `booking/index.js`, ne z `prices.js`. Dokud `index.js` exportuje `seasonPrice` dál, jejich import se nezmění.

### --correct--
Žádný. Stačí upravit `booking/index.js`, aby `seasonPrice` exportoval ze `seasons.js`.

#### --why--
Přesně k tomu barrel soubor slouží: vnitřní rozdělení složky se schová za jedno veřejné rozhraní.

### --answer--
`main.js`, protože v něm začíná aplikace.

#### --why--
Vstupní soubor nemá k vnitřku složky `booking/` žádný zvláštní vztah. Importuje stejné veřejné rozhraní jako ostatní.

### --see--
nastroje-moduly-vite/es-moduly#verejne-rozhrani-a-index-js

## --question--

Soubor `app.js` má na prvním řádku `import { renderChart } from './chart.js'` a funkci používá jen v obsluze kliknutí na záložku Statistiky. Přepiš obsluhu tak, aby se `chart.js` stáhl až při kliknutí. Napiš jen řádek, který modul načte a vytáhne z něj `renderChart`.

### --expected--
const { renderChart } = await import('./chart.js')

### --why--
`import()` vrátí Promise se jmenným prostorem modulu, takže `await` a destrukturalizace vytáhnou `renderChart`. Statický import z prvního řádku pak smažeš a obsluha musí být `async`.

### --see--
nastroje-moduly-vite/es-moduly#dynamicky-import
