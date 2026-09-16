---
title: Balíček s českými utilitami
main: src/index.js
timeoutMs: 30000
see: nastroje-moduly-vite/npm-a-pnpm#type-a-exports
---

# --description--

V každém českém projektu se píšou pořád tytéž tři funkce: adresa článku z nadpisu bez
diakritiky, cena v korunách a správný tvar slova po čísle („1 položka", „3 položky",
„5 položek"). Místo kopírování mezi projekty z nich uděláš malý balíček `cesky-text`,
který jde vydat do npm a použít kdekoli.

Tohle je lab: žádné kroky, jen zadání. Moduly a veřejné rozhraní jsi psal ve workshopu
[Pokladna kavárny v modulech](see:nastroje-moduly-vite/workshop-moduly/001), skripty
a lint ve workshopu [Seznam úkolů jako projekt ve Vite](see:nastroje-moduly-vite/workshop-vite-projekt/011).
Jak si funkce uvnitř `src/` rozdělíš a pojmenuješ pomocné funkce, je na tobě.

## Uživatelské příběhy

- Když si vývojář balíček nainstaluje, importuje funkce `slugify`, `formatCzk`
  a `pluralize` samotným jménem balíčku: `from 'cesky-text'`. Funkci `pluralize`
  najde i samostatně pod `cesky-text/plural`.
- Když zkusí sáhnout na soubor uvnitř balíčku (třeba `cesky-text/src/slugify.js`),
  Node import odmítne. Veřejné je jen to, co balíček vystaví.
- Když zavolá `slugify('Příliš žluťoučký kůň')`, dostane `prilis-zlutoucky-kun`: malá
  písmena bez diakritiky, slova spojená pomlčkou. Mezery a interpunkce na začátku
  a na konci zmizí, víc znaků za sebou se sloučí do jedné pomlčky.
- Když zavolá `formatCzk(1290)`, dostane `1 290 Kč`. Celé koruny jsou bez haléřů,
  jinak dvě desetinná místa: `formatCzk(99.5)` vrátí `99,50 Kč`. Mezery jsou české
  (klidně nezalomitelné).
- Když zavolá `pluralize(count, ['položka', 'položky', 'položek'])`, dostane číslo
  a správný tvar: 1 → první tvar, 2 až 4 → druhý, cokoli jiného (i 0) → třetí.
  Výsledek je třeba `3 položky`.
- Balíček je připravený k vydání: jmenuje se `cesky-text`, má verzi `1.0.0`, je to
  ES modul a nemá žádné závislosti pro běh.
- Skript `npm run lint` zkontroluje celý balíček doporučenými pravidly ESLint a projde.
  ESLint a jeho pravidla jsou zapsané jako nástroje pro vývoj.
- `README.md` řekne, jak balíček nainstalovat, ukáže import ze jména balíčku a popíše
  všechny tři funkce.

> [!TIP]
> Tlačítko **Spustit** pustí `src/index.js`. Na zkoušku do něj dočasně přidej
> `console.log` s voláním funkce a před odevzdáním ho zase smaž — lint i čtenář
> README ocení čisté veřejné rozhraní.

# --hints--

`package.json` popisuje balíček `cesky-text` ve verzi `1.0.0` s `"type": "module"` a není označený jako soukromý.

```js
let pkg;
try { pkg = JSON.parse(files['package.json']); } catch (error) { assert.fail(`package.json není platný JSON: ${error.message}`); }
assert.equal(pkg.name, 'cesky-text', 'package.json má mít "name": "cesky-text"');
assert.equal(pkg.version, '1.0.0', 'package.json má mít "version": "1.0.0"');
assert.equal(pkg.type, 'module', 'package.json má mít "type": "module"');
assert.notEqual(pkg.private, true, 'Balíček určený k vydání nemá mít "private": true');
```

Import `from 'cesky-text'` dá funkce `slugify`, `formatCzk` a `pluralize`.

```js
const fs = await import('node:fs/promises');
await fs.writeFile(`${helpers.dir}/probe-main.mjs`, "import * as pkg from 'cesky-text';\nconsole.log(JSON.stringify(Object.keys(pkg).sort()));\n");
const result = await helpers.run('node probe-main.mjs');
await fs.rm(`${helpers.dir}/probe-main.mjs`, { force: true });
assert.equal(result.code, 0, `import from 'cesky-text' má fungovat:\n${result.stderr}`);
const names = JSON.parse(result.stdout.trim().split('\n').at(-1));
for (const name of ['slugify', 'formatCzk', 'pluralize']) {
  assert.ok(names.includes(name), `import from 'cesky-text' má obsahovat ${name}, obsahuje: ${names.join(', ')}`);
}
```

Import `from 'cesky-text/plural'` dá funkci `pluralize`.

```js
const fs = await import('node:fs/promises');
await fs.writeFile(`${helpers.dir}/probe-plural.mjs`, "import { pluralize } from 'cesky-text/plural';\nconsole.log(typeof pluralize);\n");
const result = await helpers.run('node probe-plural.mjs');
await fs.rm(`${helpers.dir}/probe-plural.mjs`, { force: true });
assert.equal(result.code, 0, `import { pluralize } from 'cesky-text/plural' má fungovat:\n${result.stderr}`);
assert.equal(result.stdout.trim(), 'function', "Z 'cesky-text/plural' má přijít funkce pluralize");
```

Soubory uvnitř balíčku ven nejsou: import `cesky-text/src/slugify.js` skončí `ERR_PACKAGE_PATH_NOT_EXPORTED`.

```js
const fs = await import('node:fs/promises');
await fs.writeFile(`${helpers.dir}/probe-inside.mjs`, "import 'cesky-text/src/slugify.js';\n");
const result = await helpers.run('node probe-inside.mjs');
await fs.rm(`${helpers.dir}/probe-inside.mjs`, { force: true });
assert.match(result.stderr, /ERR_PACKAGE_PATH_NOT_EXPORTED/, `Import 'cesky-text/src/slugify.js' má Node odmítnout s ERR_PACKAGE_PATH_NOT_EXPORTED, výstup:\n${result.stderr || result.stdout}`);
```

`slugify` odstraní diakritiku, převede na malá písmena a spojí slova pomlčkou.

```js
const { slugify } = await helpers.importFile('src/index.js');
assert.equal(slugify('Příliš žluťoučký kůň'), 'prilis-zlutoucky-kun', "slugify('Příliš žluťoučký kůň') má vrátit 'prilis-zlutoucky-kun'");
assert.equal(slugify('Čerstvé ŘEŘICHOVÉ Ďáblíky'), 'cerstve-rerichove-dabliky', "slugify('Čerstvé ŘEŘICHOVÉ Ďáblíky') má vrátit 'cerstve-rerichove-dabliky'");
```

`slugify` sloučí mezery a interpunkci do jedné pomlčky a na krajích žádnou nenechá.

```js
const { slugify } = await helpers.importFile('src/index.js');
assert.equal(slugify('  Kavárna — U Mostu! '), 'kavarna-u-mostu', "slugify('  Kavárna — U Mostu! ') má vrátit 'kavarna-u-mostu'");
assert.equal(slugify('Top 10: tipy, triky & rady'), 'top-10-tipy-triky-rady', "slugify('Top 10: tipy, triky & rady') má vrátit 'top-10-tipy-triky-rady'");
assert.equal(slugify('!!!'), '', "slugify('!!!') má vrátit prázdný řetězec");
```

`formatCzk` píše celé koruny bez haléřů s českými mezerami: `1290` → `1 290 Kč`.

```js
const { formatCzk } = await helpers.importFile('src/index.js');
const spaces = (text) => String(text).replace(/[\u00a0\u202f]/g, ' ');
assert.equal(spaces(formatCzk(1290)), '1 290 Kč', "formatCzk(1290) má vrátit '1 290 Kč'");
assert.equal(spaces(formatCzk(0)), '0 Kč', "formatCzk(0) má vrátit '0 Kč'");
assert.equal(spaces(formatCzk(1250000)), '1 250 000 Kč', "formatCzk(1250000) má vrátit '1 250 000 Kč'");
```

`formatCzk` píše necelé částky se dvěma desetinnými místy a čárkou: `99.5` → `99,50 Kč`.

```js
const { formatCzk } = await helpers.importFile('src/index.js');
const spaces = (text) => String(text).replace(/[\u00a0\u202f]/g, ' ');
assert.equal(spaces(formatCzk(99.5)), '99,50 Kč', "formatCzk(99.5) má vrátit '99,50 Kč'");
assert.equal(spaces(formatCzk(1234.567)), '1 234,57 Kč', "formatCzk(1234.567) má vrátit '1 234,57 Kč'");
```

`pluralize` vrátí číslo se správným tvarem pro 1, 2 až 4 a ostatní počty.

```js
const { pluralize } = await helpers.importFile('src/index.js');
const forms = ['položka', 'položky', 'položek'];
assert.equal(pluralize(1, forms), '1 položka', "pluralize(1, forms) má vrátit '1 položka'");
for (const count of [2, 3, 4]) {
  assert.equal(pluralize(count, forms), `${count} položky`, `pluralize(${count}, forms) má vrátit '${count} položky'`);
}
for (const count of [0, 5, 12, 22]) {
  assert.equal(pluralize(count, forms), `${count} položek`, `pluralize(${count}, forms) má vrátit '${count} položek'`);
}
assert.equal(pluralize(3, ['den', 'dny', 'dní']), '3 dny', "pluralize(3, ['den', 'dny', 'dní']) má vrátit '3 dny'");
```

Balíček nemá závislosti pro běh a ESLint s `@eslint/js` má mezi nástroji pro vývoj.

```js
let pkg = {};
try { pkg = JSON.parse(files['package.json']); } catch { assert.fail('package.json není platný JSON'); }
assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0, `Balíček nemá mít dependencies, má: ${Object.keys(pkg.dependencies ?? {}).join(', ')}`);
assert.ok(pkg.devDependencies?.eslint, 'devDependencies mají obsahovat eslint');
assert.ok(pkg.devDependencies?.['@eslint/js'], 'devDependencies mají obsahovat @eslint/js');
```

`npm run lint` projde nad celým balíčkem.

```js
const result = await helpers.run('node --run lint', { timeoutMs: 25000 });
const output = result.stdout + result.stderr;
assert.doesNotMatch(output, /Missing script/i, 'package.json nemá skript lint');
assert.equal(result.code, 0, `node --run lint má projít:\n${output}`);
```

`npm run lint` používá doporučená pravidla a kontroluje i nové soubory v `src/`.

```js
const fs = await import('node:fs/promises');
await fs.writeFile(`${helpers.dir}/src/lint-probe.js`, 'const unusedProbe = 1;\n');
const result = await helpers.run('node --run lint', { timeoutMs: 25000 });
await fs.rm(`${helpers.dir}/src/lint-probe.js`, { force: true });
assert.match(result.stdout, /lint-probe\.js[\s\S]*no-unused-vars/, `Lint má v src/lint-probe.js najít nepoužitou proměnnou (no-unused-vars). Výstup:\n${result.stdout}${result.stderr}`);
```

`README.md` ukáže instalaci přes npm a import ze jména balíčku.

```js
const readme = files['README.md'] ?? '';
assert.match(readme, /npm (install|i) cesky-text/, 'README.md má ukázat instalaci: npm install cesky-text');
assert.match(readme, /from\s+['"]cesky-text['"]/, "README.md má ukázat import from 'cesky-text'");
```

`README.md` popisuje všechny tři funkce.

```js
const readme = files['README.md'] ?? '';
for (const name of ['slugify', 'formatCzk', 'pluralize']) {
  assert.match(readme, new RegExp(`\\b${name}\\b`), `README.md má popsat funkci ${name}`);
}
assert.ok(readme.split('\n').filter((line) => line.trim()).length >= 10, 'README.md má mít aspoň pár odstavců, ne jen nadpis a názvy funkcí');
```

# --help--

## --tip-- 4

Co pole `exports` dělá se soubory, které v něm nejsou, ukazuje část
[`"type"` a `exports`](see:nastroje-moduly-vite/npm-a-pnpm#type-a-exports).

## --tip-- 5

Rozlož úlohu na podcíle: 1. rozdělit písmena a diakritická znaménka
(`normalize` s tvarem, který znaménka oddělí), 2. znaménka odstranit, 3. malá písmena,
4. každý úsek znaků mimo `a-z0-9` nahradit pomlčkou, 5. pomlčky z krajů odstranit.

# --seed--

## --file-- package.json

```json
{
  "name": "cesky-text"
}

```

## --file-- eslint.config.js

```js
// Nastavení ESLint pro balíček.

```

## --file-- src/index.js

```js
// Veřejné rozhraní balíčku cesky-text.

```

## --file-- src/slugify.js

```js
/**
 * Z textu udělá adresu: malá písmena bez diakritiky, slova spojená pomlčkou.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {}

```

## --file-- src/money.js

```js
/**
 * Částku v korunách zapíše česky: celé koruny bez haléřů, jinak dvě desetinná místa.
 * @param {number} amount
 * @returns {string}
 */
export function formatCzk(amount) {}

```

## --file-- src/plural.js

```js
/**
 * Vrátí číslo se správným tvarem slova: 1 → forms[0], 2–4 → forms[1], jinak forms[2].
 * @param {number} count
 * @param {[string, string, string]} forms
 * @returns {string}
 */
export function pluralize(count, forms) {}

```

## --file-- README.md

```md
# cesky-text

```

# --solution--

## --file-- package.json

```json
{
  "name": "cesky-text",
  "version": "1.0.0",
  "description": "Adresy bez diakritiky, ceny v korunách a české tvary slov po čísle.",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./plural": "./src/plural.js"
  },
  "scripts": {
    "lint": "eslint ."
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.10.0"
  }
}

```

## --file-- eslint.config.js

```js
// Nastavení ESLint pro balíček.
import js from '@eslint/js';

export default [js.configs.recommended];

```

## --file-- src/index.js

```js
// Veřejné rozhraní balíčku cesky-text.
export { slugify } from './slugify.js';
export { formatCzk } from './money.js';
export { pluralize } from './plural.js';

```

## --file-- src/slugify.js

```js
/**
 * Z textu udělá adresu: malá písmena bez diakritiky, slova spojená pomlčkou.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

```

## --file-- src/money.js

```js
/**
 * Částku v korunách zapíše česky: celé koruny bez haléřů, jinak dvě desetinná místa.
 * @param {number} amount
 * @returns {string}
 */
export function formatCzk(amount) {
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

```

## --file-- src/plural.js

```js
/**
 * Vrátí číslo se správným tvarem slova: 1 → forms[0], 2–4 → forms[1], jinak forms[2].
 * @param {number} count
 * @param {[string, string, string]} forms
 * @returns {string}
 */
export function pluralize(count, forms) {
  const [one, few, many] = forms;
  if (count === 1) {
    return `${count} ${one}`;
  }
  if (count >= 2 && count <= 4) {
    return `${count} ${few}`;
  }
  return `${count} ${many}`;
}

```

## --file-- README.md

````md
# cesky-text

Tři funkce, které potřebuje skoro každý český web: adresa bez diakritiky, cena
v korunách a správný tvar slova po čísle. Bez závislostí.

## Instalace

```sh
npm install cesky-text
```

## Použití

```js
import { slugify, formatCzk, pluralize } from 'cesky-text';

slugify('Příliš žluťoučký kůň'); // 'prilis-zlutoucky-kun'
formatCzk(1290); // '1 290 Kč'
pluralize(3, ['položka', 'položky', 'položek']); // '3 položky'
```

`pluralize` jde importovat i samostatně: `import { pluralize } from 'cesky-text/plural'`.

## API

- `slugify(text)` — malá písmena bez diakritiky, slova spojená pomlčkou, bez pomlček na krajích.
- `formatCzk(amount)` — cena s českými mezerami; celé koruny bez haléřů, jinak dvě desetinná místa.
- `pluralize(count, [jeden, dva až čtyři, pět a víc])` — číslo se správným tvarem slova.

````

# --approaches--

## --approach-- Tabulka znaků a ruční formátování

Bez `normalize` a bez `Intl`: diakritika se nahradí podle tabulky a tisíce se oddělí
regulárním výrazem. Je to čitelné a pod kontrolou, ale tabulka musí pokrýt všechna
písmena a formát čísla si hlídáš sám.

### --file-- src/slugify.js

```js
const PLAIN_LETTERS = {
  á: 'a', č: 'c', ď: 'd', é: 'e', ě: 'e', í: 'i', ň: 'n', ó: 'o',
  ř: 'r', š: 's', ť: 't', ú: 'u', ů: 'u', ý: 'y', ž: 'z',
};

export function slugify(text) {
  const plain = [...text.toLowerCase()].map((letter) => PLAIN_LETTERS[letter] ?? letter).join('');
  const words = plain.split(/[^a-z0-9]+/).filter((word) => word !== '');
  return words.join('-');
}
```

### --file-- src/money.js

```js
export function formatCzk(amount) {
  const fixed = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  const [whole, fraction] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return fraction ? `${grouped},${fraction} Kč` : `${grouped} Kč`;
}
```

### --file-- src/plural.js

```js
export function pluralize(count, [one, few, many]) {
  const form = count === 1 ? one : count >= 2 && count <= 4 ? few : many;
  return `${count} ${form}`;
}
```

### --file-- package.json

```json
{
  "name": "cesky-text",
  "version": "1.0.0",
  "description": "Adresy bez diakritiky, ceny v korunách a české tvary slov po čísle.",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./plural": "./src/plural.js"
  },
  "scripts": {
    "lint": "eslint ."
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.10.0"
  }
}

```

### --file-- eslint.config.js

```js
// Nastavení ESLint pro balíček.
import js from '@eslint/js';

export default [js.configs.recommended];

```

### --file-- src/index.js

```js
// Veřejné rozhraní balíčku cesky-text.
export { slugify } from './slugify.js';
export { formatCzk } from './money.js';
export { pluralize } from './plural.js';

```

### --file-- README.md

````md
# cesky-text

Tři funkce, které potřebuje skoro každý český web: adresa bez diakritiky, cena
v korunách a správný tvar slova po čísle. Bez závislostí.

## Instalace

```sh
npm install cesky-text
```

## Použití

```js
import { slugify, formatCzk, pluralize } from 'cesky-text';

slugify('Příliš žluťoučký kůň'); // 'prilis-zlutoucky-kun'
formatCzk(1290); // '1 290 Kč'
pluralize(3, ['položka', 'položky', 'položek']); // '3 položky'
```

`pluralize` jde importovat i samostatně: `import { pluralize } from 'cesky-text/plural'`.

## API

- `slugify(text)` — malá písmena bez diakritiky, slova spojená pomlčkou, bez pomlček na krajích.
- `formatCzk(amount)` — cena s českými mezerami; celé koruny bez haléřů, jinak dvě desetinná místa.
- `pluralize(count, [jeden, dva až čtyři, pět a víc])` — číslo se správným tvarem slova.

````

## --approach-- Intl.PluralRules

Pro výběr tvaru má prohlížeč i Node vestavěná pravidla češtiny. Vrací kategorii
(`one`, `few`, `many`, `other`), kterou stačí převést na index tvaru. Hodí se, až bude
balíček potřebovat i desetinná čísla, kde čeština používá další tvar.

### --file-- src/plural.js

```js
const czechRules = new Intl.PluralRules('cs-CZ');
const FORM_INDEX = { one: 0, few: 1 };

export function pluralize(count, forms) {
  const index = FORM_INDEX[czechRules.select(count)] ?? 2;
  return `${count} ${forms[index]}`;
}
```

### --file-- package.json

```json
{
  "name": "cesky-text",
  "version": "1.0.0",
  "description": "Adresy bez diakritiky, ceny v korunách a české tvary slov po čísle.",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./plural": "./src/plural.js"
  },
  "scripts": {
    "lint": "eslint ."
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.10.0"
  }
}

```

### --file-- eslint.config.js

```js
// Nastavení ESLint pro balíček.
import js from '@eslint/js';

export default [js.configs.recommended];

```

### --file-- src/index.js

```js
// Veřejné rozhraní balíčku cesky-text.
export { slugify } from './slugify.js';
export { formatCzk } from './money.js';
export { pluralize } from './plural.js';

```

### --file-- src/slugify.js

```js
/**
 * Z textu udělá adresu: malá písmena bez diakritiky, slova spojená pomlčkou.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

```

### --file-- src/money.js

```js
/**
 * Částku v korunách zapíše česky: celé koruny bez haléřů, jinak dvě desetinná místa.
 * @param {number} amount
 * @returns {string}
 */
export function formatCzk(amount) {
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

```

### --file-- README.md

````md
# cesky-text

Tři funkce, které potřebuje skoro každý český web: adresa bez diakritiky, cena
v korunách a správný tvar slova po čísle. Bez závislostí.

## Instalace

```sh
npm install cesky-text
```

## Použití

```js
import { slugify, formatCzk, pluralize } from 'cesky-text';

slugify('Příliš žluťoučký kůň'); // 'prilis-zlutoucky-kun'
formatCzk(1290); // '1 290 Kč'
pluralize(3, ['položka', 'položky', 'položek']); // '3 položky'
```

`pluralize` jde importovat i samostatně: `import { pluralize } from 'cesky-text/plural'`.

## API

- `slugify(text)` — malá písmena bez diakritiky, slova spojená pomlčkou, bez pomlček na krajích.
- `formatCzk(amount)` — cena s českými mezerami; celé koruny bez haléřů, jinak dvě desetinná místa.
- `pluralize(count, [jeden, dva až čtyři, pět a víc])` — číslo se správným tvarem slova.

````

# --review--

Testy kontrolují rozhraní a chování. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- `src/index.js` jen znovu exportuje, žádná logika v něm není.
- Pomocné funkce, které používá jen jeden modul, nejsou vidět zvenku.
- Příklady v README fungují, když je opíšeš do nového souboru.
- Kdyby ses za měsíc vrátil, z README poznáš, jak se `pluralize` volá, bez čtení kódu.

## --extensions--

Rozšíření bez testů: funkce `truncate(text, length)`, která zkrátí text na celá slova
a přidá `…`; soubor `CHANGELOG.md` a verze `1.1.0` podle semver; skript `format`
s Prettierem; vydání balíčku do npm pod tvým jménem (`@jmeno/cesky-text`).
