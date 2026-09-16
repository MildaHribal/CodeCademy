---
pass: 0.8
---

# --questions--

## --question--

Modul `money.js` obsahuje jen `export function formatCzk(amount) { … }`. Soubor `cart.js` začíná řádkem `import formatCzk from './money.js';`. Co se stane, když aplikaci spustíš?

### --answer--
Import projde a `formatCzk` bude `undefined`, chyba přijde až při volání.

#### --why--
Myslíš si, že chybějící import se chová jako chybějící vlastnost objektu? Importy a exporty se propojují ještě před spuštěním kódu.

### --correct--
Aplikace se nespustí: `money.js` nemá výchozí export, import skončí `SyntaxError`.

#### --why--
Zápis bez složených závorek hledá výchozí export. Hláška zní `The requested module './money.js' does not provide an export named 'default'`.

### --answer--
Funguje to, jméno importu sedí se jménem funkce.

#### --why--
U výchozího importu na jménu nezáleží, a proto ho ani nehledá. Bez závorek se vždy bere výchozí export, který tu chybí.

### --see--
nastroje-moduly-vite/es-moduly#vychozi-export

## --question--

Modul `basket.js` obsahuje `export let itemCount = 0;` a `export function addItem() { itemCount += 1; }`. Co vypíše tenhle soubor?

```js
import { itemCount, addItem } from './basket.js';

addItem();
addItem();
addItem();
console.log(itemCount);
```

### --expected--
3

### --why--
Import je živá vazba na proměnnou v `basket.js`, ne kopie nuly z okamžiku importu. Po třech voláních `addItem` čte `console.log` aktuální hodnotu.

### --see--
nastroje-moduly-vite/es-moduly#zive-vazby

## --question--

V `package.json` je `"date-fns": "^4.2.1"`. Které z verzí `4.1.9`, `4.9.0` a `5.0.0` smí `npm install` nainstalovat? Napiš je oddělené čárkou.

### --expected--
4.9.0

### --why--
Stříška povolí novější verze se stejným MAJOR číslem. `4.1.9` je starší než spodní hranice `4.2.1` a `5.0.0` mění MAJOR.

### --see--
nastroje-moduly-vite/npm-a-pnpm#verze-a-striska

## --question--

Projekt používá `"chart-lite": "^0.8.2"`. Vyšla verze `0.9.0` s funkcí, kterou potřebuješ. Dostaneš ji po `npm update`?

### --answer--
Ano, stříška povoluje všechny novější verze.

#### --why--
To platí jen u verzí od `1.0.0`. U nuly autor ničím neručí a stříška zamyká i prostřední číslo.

### --correct--
Ne, `^0.8.2` povolí jen `0.8.x`. Rozsah musíš změnit vědomě.

#### --why--
U verzí `0.x` se za rozbíjející změnu považuje už změna prostředního čísla, takže `^0.8.2` znamená `>=0.8.2 <0.9.0`.

### --answer--
Ne, stříška povoluje jen opravné verze `0.8.2` až `0.8.9`.

#### --why--
Opravné verze nejsou omezené na jednu číslici. `0.8.10` i `0.8.25` do rozsahu padnou, zastaví se to až na `0.9.0`.

### --see--
nastroje-moduly-vite/npm-a-pnpm#verze-a-striska

## --question--

Automatické sestavení pouští `npm ci`. Vývojář přidal do `package.json` nový balíček ručně, bez `npm install`, a lockfile necommitnul. Co se stane?

### --answer--
`npm ci` balíček doinstaluje a lockfile aktualizuje.

#### --why--
Myslíš si, že `npm ci` je jen rychlejší `npm install`? Lockfile nikdy nemění — přesně proto se v automatickém sestavení používá.

### --correct--
`npm ci` skončí chybou, protože `package.json` a lockfile spolu nesouhlasí.

### --answer--
`npm ci` balíček přeskočí a sestavení spadne až na importu.

#### --why--
`npm ci` nesoulad pozná předem a instalaci vůbec nezačne. Nic potichu nepřeskakuje.

### --see--
nastroje-moduly-vite/npm-a-pnpm#lockfile-a-npm-ci

## --question--

Soubor `.env` projektu ve Vite obsahuje dva řádky: `MAPS_SECRET=sk_77a1` a `VITE_MAP_STYLE=outdoor`. Co vypíše po sestavení v prohlížeči řádek `console.log(import.meta.env.MAPS_SECRET, import.meta.env.VITE_MAP_STYLE)`?

### --expected--
undefined outdoor

### --why--
Do kódu pro prohlížeč Vite vepíše jen proměnné s předponou `VITE_`. Tajný klíč bez předpony zůstane mimo sestavený JavaScript.

### --see--
nastroje-moduly-vite/vite#promenne-prostredi-import-meta-env

## --question--

Ve Vite projektu je `import logoUrl from './assets/logo.svg'` a soubor `public/robots.txt`. Který z nich bude po sestavení v `dist/` pod stejným jménem, jaké má v projektu?

### --answer--
`logo.svg`, protože se importuje přímo.

#### --why--
Importované soubory Vite zpracuje a dá jim otisk do jména (nebo je malé vloží přímo do kódu). Jméno se tedy mění.

### --correct--
`robots.txt`, protože soubory z `public/` se kopírují beze změny.

### --answer--
Oba, Vite jména souborů nemění.

#### --why--
Otisk ve jméně je jedna z hlavních věcí, které sestavení dělá — kvůli mezipaměti prohlížeče.

### --see--
nastroje-moduly-vite/vite#slozka-public

## --question--

Napiš objekt, který v `eslint.config.js` úplně vyřadí z kontroly složku `coverage/` s vygenerovaným přehledem testů.

### --expected--
{ ignores: ['coverage/'] }

### --accept--
{ ignores: ['coverage'] }
{ ignores: ['coverage/**'] }
{ ignores: ['**/coverage/'] }

### --why--
Objekt, který obsahuje jen `ignores`, platí pro celou konfiguraci. Vygenerovaný kód se nekontroluje, stejně jako `dist/`.

### --see--
nastroje-moduly-vite/lint-a-format#eslint-a-eslint-config-js

## --question--

Najdi v anglické dokumentaci Vite (vite.dev, část Build Options), jak se jmenuje volba ve `vite.config.js`, která změní složku pro sestavený web z výchozí `dist`. Napiš celé jméno i se sekcí, ve které leží.

### --expected--
build.outDir

### --accept--
outDir

### --why--
Volba `build.outDir` určuje, kam `vite build` zapíše výsledek. Zapisuje se `defineConfig({ build: { outDir: 'public_html' } })`.

### --see--
nastroje-moduly-vite/vite#sestaveni-a-slozka-dist

## --question--

Tým chce, aby se kód s nepoužitou proměnnou nedostal do repozitáře, ani když si někdo nevšimne podtržení v editoru. Co to zajistí nejspolehlivěji?

### --answer--
Formátování při uložení v editoru.

#### --why--
Formátovač nepoužité proměnné nehledá, jen upraví vzhled. A editor s nastavením nemusí mít každý.

### --answer--
Git hook `pre-commit`, který pustí lint.

#### --why--
Hook pomůže, ale jde obejít přes `git commit --no-verify` a musí ho mít každý nastavený. Sám o sobě pravidlo pro všechny nezaručí.

### --correct--
Lint v hooku před commitem a stejný `npm run lint` v automatické kontrole na serveru.

#### --why--
Hook zachytí chybu hned a rychle, kontrola na serveru je pojistka, kterou nikdo neobejde.

### --see--
nastroje-moduly-vite/lint-a-format#pred-commitem-git-hook-a-lint-staged

# --code-- Rezervace tenisových kurtů

## --file-- src/booking.js

```js
// Rezervace tenisových kurtů: cena, volné termíny a přehled dne.
import { formatCzk } from 'cesky-text';
import holidays from './data/holidays.json' with { type: 'json' };
import * as slots from './slots.js';

const PEAK_START = 17;
const PEAK_END = 21;
let reservationCount = 0;

export const COURT_PRICES = {
  antuka: 320,
  beton: 250,
  hala: 480,
};

function isPeakHour(hour) {
  return hour >= PEAK_START && hour < PEAK_END;
}

function isHoliday(date) {
  var iso = date.toISOString().slice(0, 10);
  for (var i = 0; i < holidays.length; i++) {
    if (holidays[i] === iso) {
      return true;
    }
  }
  return false;
}

export function priceFor(court, date, hours) {
  let price = COURT_PRICES[court] * hours;
  const memberDiscount = 0.1;
  if (isPeakHour(date.getHours()) || isHoliday(date)) {
    price = price * 1.25;
  }
  return Math.round(price);
}

export function reserve(court, date, hours) {
  if (!slots.isFree(court, date, hours)) {
    throw new Error('Termín je obsazený');
  }
  slots.block(court, date, hours);
  reservationCount = reservationCount + 1;
  return {
    number: reservationCount,
    court: court,
    price: formatCzk(priceFor(court, date, hours)),
  };
}

export { reservationCount };

export default function summary() {
  return 'Rezervací dnes: ' + reservationCount;
}

export async function showPriceList(container) {
  const { renderPriceList } = await import('./price-list.js');
  container.replaceChildren(renderPriceList(COURT_PRICES));
}
```

## --file-- package.json

```json
{
  "name": "rezervace-kurtu",
  "version": "0.4.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.3.0",
  "exports": {
    ".": "./src/booking.js"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "pnpm lint && pnpm format:check && pnpm build",
    "prepare": "git config core.hooksPath .githooks"
  },
  "dependencies": {
    "cesky-text": "^1.0.0",
    "dayjs": "~1.11.13",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.10.0",
    "prettier": "^3.9.6"
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,html,json,md}": "prettier --write"
  },
  "engines": {
    "node": ">=24"
  }
}
```

## --question--

Co ohlásí ESLint s `js.configs.recommended` u řádku 32 v `src/booking.js`? Napiš jméno pravidla.

### --expected--
no-unused-vars

### --why--
Proměnná `memberDiscount` vznikne a nikdo ji nepoužije. Hlášení prozrazuje skutečnou chybu: slevu pro členy výpočet ceny vůbec neuplatní.

### --see--
nastroje-moduly-vite/lint-a-format#eslint-a-eslint-config-js

## --question--

Jiný soubor projektu obsahuje `import { reservationCount, reserve } from './booking.js'` a potom dvakrát úspěšně zavolá `reserve(…)`. Kolik vypíše následující `console.log(reservationCount)`? (Pomůže řádek 52 v `src/booking.js`.)

### --expected--
2

### --why--
`export { reservationCount }` exportuje proměnnou, ne její hodnotu v okamžiku exportu. Import je živá vazba, takže po dvou rezervacích vidí dvojku.

### --see--
nastroje-moduly-vite/es-moduly#zive-vazby

## --question--

Který import funkce na řádku 54 v `src/booking.js` je správný?

### --answer--
`import { summary } from './booking.js'`

#### --why--
Složené závorky hledají pojmenovaný export `summary`. Funkce je ale vyexportovaná jako výchozí, jméno za `function` pojmenovaný export nevytvoří.

### --correct--
`import summary from './booking.js'`

### --answer--
`import * as summary from './booking.js'`

#### --why--
Tohle vytvoří jmenný prostor se všemi exporty modulu. Funkci bys pak volal přes `summary.default()`, ne `summary()`.

### --see--
nastroje-moduly-vite/es-moduly#vychozi-export

## --question--

Kdy prohlížeč stáhne soubor `price-list.js` z řádku 59 v `src/booking.js`?

### --answer--
Hned při načtení stránky, jako ostatní importy.

#### --why--
Tak se chová statický `import` na začátku souboru. Volání `import()` uvnitř funkce se vyhodnotí, až funkce poběží.

### --correct--
Až při prvním zavolání `showPriceList`.

### --answer--
Nikdy, `import()` uvnitř `async` funkce nefunguje.

#### --why--
Dynamický import smí stát kdekoli, i v podmínce nebo ve funkci. Vrací Promise, na kterou `await` počká.

### --see--
nastroje-moduly-vite/es-moduly#dynamicky-import

## --question--

Jeden balíček v `package.json` (řádky 20 až 24) je ve špatném poli. Napiš jeho jméno.

### --expected--
vite

### --why--
Vite je nástroj pro vývoj a sestavení a do stránky se sám nedostane, proto patří do `devDependencies`. `cesky-text` a `dayjs` importuje kód aplikace, ty v `dependencies` jsou správně.

### --see--
nastroje-moduly-vite/npm-a-pnpm#dependencies-a-devdependencies

## --question--

Podle řádku 6 v `package.json` projekt spravuje pnpm. Jak se jmenuje lockfile, který má být v repozitáři?

### --expected--
pnpm-lock.yaml

### --why--
pnpm zapisuje přesné verze do `pnpm-lock.yaml`. Kdyby v repozitáři ležel i `package-lock.json`, instalovali by lidé v týmu každý podle jiného souboru.

### --see--
nastroje-moduly-vite/npm-a-pnpm#pnpm

## --question--

Jiný projekt si nainstaluje `rezervace-kurtu` a napíše `import { isFree } from 'rezervace-kurtu/src/slots.js'`. Co se stane? Pomůžou řádky 7 až 9 v `package.json`.

### --answer--
Import projde, soubor `src/slots.js` v balíčku existuje.

#### --why--
Myslíš si, že import může sáhnout na jakýkoli soubor balíčku? Balíček s polem `exports` pustí ven jen cesty, které v něm vyjmenuje.

### --correct--
Node import odmítne s `ERR_PACKAGE_PATH_NOT_EXPORTED`.

#### --why--
`exports` vystavuje jen `"."`, tedy `src/booking.js`. Každá jiná cesta do balíčku je zavřená.

### --answer--
Node ohlásí `ERR_MODULE_NOT_FOUND`, protože chybí přípona.

#### --why--
Přípona `.js` v cestě je. Problém není v nalezení souboru, ale v tom, co balíček dovolí importovat.

### --see--
nastroje-moduly-vite/npm-a-pnpm#type-a-exports
