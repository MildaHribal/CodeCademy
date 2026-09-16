## --card-- output

Co vypíše `main.js`?

```js
// score.js
export let best = 0;

export function submit(points) {
  if (points > best) best = points;
}
```

```js
// main.js
import { best, submit } from './score.js';

const first = best;
submit(10);
submit(4);
console.log(first, best);
```

### --expected--

0 10

### --why--

Myslíš si, že import zkopíruje hodnotu? `best` je živá vazba na proměnnou v `score.js`, takže ukazuje 10. Jen `first` si uložila nulu do vlastní proměnné.

### --see--

nastroje-moduly-vite/es-moduly#zive-vazby

## --card-- output

Soubor `analytics.js` obsahuje jediný řádek `console.log('A');`. Importují ho `cart.js` i `menu.js`. Co vypíše `main.js`?

```js
// main.js
import './cart.js';
import './menu.js';
console.log('B');
```

```js
// cart.js i menu.js začínají stejně
import './analytics.js';
```

### --expected--

A
B

### --why--

Modul se vyhodnotí jen jednou, i když ho importuje víc souborů. Importy se vyhodnotí před kódem `main.js`, proto `A` přijde před `B`.

### --see--

nastroje-moduly-vite/es-moduly#modul-ma-vlastni-rozsah-platnosti

## --card-- output

Soubor `pages/admin/users.js` potřebuje funkci z `api.js`, který leží v kořeni projektu (vedle složky `pages`). Doplň cestu: `import { fetchUsers } from '…'`.

### --expected--

../../api.js

### --why--

Relativní cesta se počítá od souboru s importem. Ze složky `pages/admin` vedou do kořene dvě patra `../`, a přípona `.js` se píše vždy.

### --see--

nastroje-moduly-vite/es-moduly#cesty-v-importu

## --card-- output

Node hlásí po spuštění `node app.js` chybu u řádku `import { menu } from './menu'`, přestože `menu.js` leží vedle. Jaký kód chyby (začíná `ERR_`) uvidíš?

### --expected--

ERR_MODULE_NOT_FOUND

### --why--

Node v ES modulech příponu nedoplňuje a hledá soubor, který se jmenuje přesně `menu`. Oprava je `'./menu.js'`.

### --see--

nastroje-moduly-vite/es-moduly#cesty-v-importu

## --card-- output

Jaký kód chyby ohlásí Node u řádku `import prices from './prices.json';` bez atributu?

### --expected--

ERR_IMPORT_ATTRIBUTE_MISSING

### --why--

JSON se importuje jen s atributem `with { type: 'json' }`, aby se omylem nespustil jako JavaScript.

### --see--

nastroje-moduly-vite/es-moduly#import-json

## --card-- output

Co vrátí volání `import('./chart.js')` — ještě před `await`?

### --expected-- ignore-case

Promise

### --why--

Dynamický import modul načítá asynchronně. Jmenný prostor s exporty dostaneš až po `await` nebo v `then`.

### --see--

nastroje-moduly-vite/es-moduly#dynamicky-import

## --card-- output

Starý kód převedený na ES moduly hlásí `ReferenceError: require is not defined in ES module scope`. Jakým klíčovým slovem nahradíš `require`?

### --expected--

import

### --why--

`require` patří CommonJS a v ES modulu neexistuje. Jeho obdobou je `import` na začátku souboru, případně `import()` za běhu.

### --see--

nastroje-moduly-vite/es-moduly#commonjs-v-cizim-kodu

## --card-- output

Která nejvyšší z verzí `3.1.9`, `3.8.0` a `4.0.0` padne do rozsahu `^3.1.4`?

### --expected--

3.8.0

### --why--

Stříška povolí novější MINOR i PATCH se stejným MAJOR číslem. `4.0.0` je rozbíjející verze.

### --see--

nastroje-moduly-vite/npm-a-pnpm#verze-a-striska

## --card-- output

Která nejvyšší z verzí `0.3.7`, `0.4.0` a `1.0.0` padne do rozsahu `^0.3.1`?

### --expected--

0.3.7

### --why--

Myslíš si, že stříška u nuly pustí `0.4.0`? U verzí `0.x` zamyká i prostřední číslo, protože autor se k ničemu nezavázal.

### --see--

nastroje-moduly-vite/npm-a-pnpm#verze-a-striska

## --card-- output

Který příkaz v automatickém sestavení nainstaluje přesně verze z lockfile, lockfile nikdy nezmění a při nesouladu s `package.json` skončí chybou?

### --expected--

npm ci

### --accept--

pnpm install --frozen-lockfile

### --why--

`npm install` lockfile při změně rozsahu upraví. `npm ci` instaluje jen podle něj, proto patří na server a do automatických kontrol.

### --see--

nastroje-moduly-vite/npm-a-pnpm#lockfile-a-npm-ci

## --card-- output

Ve Vite projektu leží obrázek v `public/icons/star.svg`. Jakou adresu napíšeš do `src` obrázku?

### --expected--

/icons/star.svg

### --why--

Obsah `public/` se servíruje z kořene webu a slovo `public` v adrese není.

### --see--

nastroje-moduly-vite/vite#slozka-public

## --card-- output

`.env` ve Vite projektu obsahuje `VITE_BAKERY=Pekárna Kvásek` a `STRIPE_KEY=sk_live_42`. Co vypíše v sestavené aplikaci `console.log(import.meta.env.STRIPE_KEY)`?

### --expected--

undefined

### --why--

Kód v prohlížeči uvidí jen proměnné s předponou `VITE_`. Díky tomu se tajný klíč do veřejného JavaScriptu nedostane.

### --see--

nastroje-moduly-vite/vite#promenne-prostredi-import-meta-env

## --card-- output

Web ve Vite poběží na `https://kvasek.github.io/pekarna/`. Jakou hodnotu dáš volbě `base` ve `vite.config.js`, když chceš přesnou podsložku?

### --expected--

/pekarna/

### --accept--

'/pekarna/'

### --why--

`base` je začátek všech adres v `dist/`. Bez něj by prohlížeč hledal `/assets/…` v kořeni domény a stránka by zůstala bílá.

### --see--

nastroje-moduly-vite/vite#sestaveni-a-slozka-dist

## --card-- output

ESLint najde v projektu dvě varování (`warn`) a žádnou chybu. Jakým kódem skončí `npx eslint .`?

### --expected--

0

### --why--

Nenulovým kódem končí jen chyby úrovně `error`. Proto pravidlo, na kterém záleží, patří na `error`.

### --see--

nastroje-moduly-vite/lint-a-format#sila-pravidel-a-vyjimky

## --card-- output

Kontrola `npx eslint .` hlásí u `document.title = 'Pekárna'` chybu `'document' is not defined`. Co chybí v `languageOptions` souboru `eslint.config.js`? Napiš jméno klíče.

### --expected--

globals

### --why--

ESLint neví, v jakém prostředí kód běží. Globální jména prohlížeče mu dodá `globals: globals.browser`.

### --see--

nastroje-moduly-vite/lint-a-format#eslint-a-eslint-config-js

## --card-- free

Jaký je rozdíl mezi `dependencies` a `devDependencies`? Uveď příklad balíčku do každého pole.

### --back--

`dependencies` jsou balíčky, které běží v aplikaci u uživatele nebo na serveru — třeba `react`, `express` nebo `zod`. `devDependencies` potřebuješ jen při vývoji a sestavení: `vite`, `eslint`, `prettier`, `typescript`. U serveru na tom záleží prakticky, protože produkční instalace `npm install --omit=dev` vývojové závislosti vynechá, a špatně zařazený balíček pak na serveru chybí. U webu sestaveného bundlerem je rozdělení spíš dohoda, ale drží projekt čitelný.

### --see--

nastroje-moduly-vite/npm-a-pnpm#dependencies-a-devdependencies

## --card-- free

K čemu je lockfile, proč se commituje a kdy použiješ `npm ci` místo `npm install`?

### --back--

`package.json` obsahuje jen rozsahy verzí, třeba `^1.11.13`. Lockfile zapíše přesnou verzi každého nainstalovaného balíčku i závislostí závislostí, takže vývojář, kolega i server mají totéž. Proto se commituje. `npm install` používám při vývoji — umí lockfile upravit, když přidám balíček. `npm ci` patří do automatického sestavení a na server: instaluje přesně podle lockfile, nikdy ho nemění a při nesouladu s `package.json` skončí chybou.

### --see--

nastroje-moduly-vite/npm-a-pnpm#lockfile-a-npm-ci

## --card-- free

Co dělá bundler a proč Vite při vývoji moduly neslepuje?

### --back--

Bundler projde importy od vstupního souboru, přeloží jména balíčků na soubory v `node_modules`, převede TypeScript, JSX a CSS, spojí moduly do pár souborů, minifikuje je, vyhodí nepoužité exporty a dá souborům otisk do jména kvůli mezipaměti. Při vývoji Vite posílá prohlížeči moduly jednotlivě a převádí je až na požádání. Server tak naběhne hned a po uložení může poslat jen změněný modul — to je HMR. Slepení a minifikace se dějí až při `vite build`.

### --see--

nastroje-moduly-vite/vite#proc-bundler

## --card-- free

Proč Vite pustí do kódu v prohlížeči jen proměnné prostředí s předponou `VITE_`? Co do nich nikdy nepatří?

### --back--

Hodnoty z `import.meta.env` se při sestavení doslova vepíšou do JavaScriptu, který si stáhne každý návštěvník. Předpona je výslovné rozhodnutí „tohle smí být veřejné", aby se do stránky omylem nedostalo heslo k databázi. Do proměnné s `VITE_` proto nepatří tajné klíče plateb, hesla ani soukromé tokeny API — ty patří jen na server. Adresa veřejného API nebo jméno obchodu tam být smí.

### --see--

nastroje-moduly-vite/vite#promenne-prostredi-import-meta-env

## --card-- free

Jaký je rozdíl mezi linterem a formátovačem a jak je zapojíš, aby je tým opravdu používal?

### --back--

Linter (ESLint) hledá chyby a riskantní vzory: nepoužitou proměnnou, neexistující jméno, přiřazení v podmínce. Formátovač (Prettier) jen srovná vzhled — odsazení, uvozovky, zalomení — a o stylu se pak nediskutuje. Ruční spouštění se neudrží, takže formátovač běží při uložení v editoru, lint i kontrola formátu v Git hooku před commitem (třeba přes lint-staged) a stejné příkazy znovu v automatické kontrole na serveru, protože hook jde obejít.

### --see--

nastroje-moduly-vite/lint-a-format#co-najde-linter-a-co-formatovac

## --card-- free

Co je živá vazba u ES modulů a jaký má důsledek pro stav, který modul drží?

### --back--

Importované jméno není kopie hodnoty, ale pohled na proměnnou uvnitř exportujícího modulu. Když ji modul změní, importující soubor čte novou hodnotu. Zvenku ale do ní přiřadit nejde — skončí to `TypeError: Assignment to constant variable.` Důsledek: stav mění jen modul, kterému patří, přes funkce, které exportuje. Kdo potřebuje hodnotu zmrazit, uloží si ji do vlastní proměnné.

### --see--

nastroje-moduly-vite/es-moduly#zive-vazby

## --card-- free

Proč je `export * from './items.js'` v `index.js` složky riskantní a proč se dává přednost pojmenovaným exportům před výchozími?

### --back--

`index.js` složky je její veřejné rozhraní: co v něm je, na tom může zbytek aplikace záviset. `export *` pustí ven všechno včetně pomocných funkcí, a vnitřek složky pak nejde měnit bez rizika. Proto se veřejné funkce vyjmenují. Pojmenovaný export má navíc jedno jméno ve všech importech, takže ho najde hledání v projektu a editor ho umí přejmenovat. Výchozí export si každý soubor pojmenuje jinak; nechávám ho tam, kde ho čeká nástroj, třeba u konfigurace.

### --see--

nastroje-moduly-vite/es-moduly#verejne-rozhrani-a-index-js
