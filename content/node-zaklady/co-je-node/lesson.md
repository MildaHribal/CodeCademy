# Co je Node.js

JavaScript z prohlížeče má jedno zásadní omezení: běží **u uživatele**, na cizím
počítači, v zabezpečeném prostředí stránky. Nesmí číst soubory na disku, nemůže
čekat na požadavky z internetu a nikdy neví, jestli ho za minutu někdo nezavře.

Aplikace ale potřebuje i druhou polovinu — program, který běží **u tebe** (na
serveru), drží data, odpovídá tisícům uživatelů a nepřestane, když někdo zavře
záložku. Ten se dá napsat ve spoustě jazyků. Node je způsob, jak ho napsat ve
stejném JavaScriptu, který už znáš.

## Co Node je

Node.js je **běhové prostředí** (*runtime*) pro JavaScript. Není to nový jazyk ani
framework. Skládá se ze tří věcí:

1. **JavaScriptový engine V8** — tentýž, který běží v Chromu. Proto v Node
   funguje všechno, co umí jazyk: `const`, arrow funkce, třídy, `async`/`await`,
   destrukturalizace, `Map`…
2. **Standardní knihovna** — moduly na práci se soubory, sítí, procesy, cestami,
   šifrováním. Tohle prohlížeč nemá.
3. **Smyčka událostí** (*event loop*) — stejný princip jako v prohlížeči: kód
   běží v jednom vlákně, a když čeká (na soubor, na síť), neblokuje, ale pustí
   ke slovu něco jiného.

Program v Node je obyčejný soubor `.js`. Napíšeš ho a spustíš v terminálu:

```js
// hello.js
const name = 'Node';
console.log(`Ahoj z ${name}, verze ${process.version}`);
```

```sh
$ node hello.js
Ahoj z Node, verze v26.5.1
```

Žádné HTML, žádná stránka. `console.log` nepíše do DevTools, ale do terminálu,
ve kterém jsi program spustil. Když kód doběhne, program skončí a terminál ti vrátí
příkazový řádek.

Zkus si to hned: ve VS Code vytvoř prázdnou složku, v ní soubor `hello.js`
s kódem výše a v terminálu ve stejné složce spusť `node hello.js`. Pak změň text
v `console.log`, soubor ulož a spusť ho znovu. Příklady v této lekci si tak můžeš
vyzkoušet všechny.

## Stejný jazyk, jiné prostředí

Jazyk je stejný, ale **globální objekty** se liší. V prohlížeči máš k dispozici
všechno kolem stránky, v Node všechno kolem počítače.

| jen v prohlížeči | v obou | jen v Node |
|---|---|---|
| `window`, `document` | `console` | `process` |
| DOM a jeho události (`click`…) | `setTimeout`, `setInterval` | `node:fs` — soubory |
| `localStorage`, `sessionStorage` | `fetch`, `URL`, `URLSearchParams` | `node:http` — server |
| `alert`, `prompt` | `JSON`, `Promise`, `structuredClone` | `node:path` — cesty k souborům |
| | `globalThis` | `Buffer` — binární data |

Když v Node sáhneš na `document`, dostaneš chybu hned při spuštění:

```text
ReferenceError: document is not defined
```

Není to chyba v kódu, je to chyba v místě, kde běží. Kód, který pracuje s DOM,
patří do prohlížeče. V Node žádná stránka není.

## Moduly v Node

Moduly `import`/`export` fungují v Node stejně jako v prohlížeči, jen je potřeba
Node říct, že je chceš. Do kořene projektu patří soubor `package.json` s typem:

```json
{
  "type": "module"
}
```

Od té chvíle jsou všechny soubory `.js` ve složce ES moduly. Import vestavěného
modulu se píše s předponou `node:`:

```js
// stats.js
import { readFile } from 'node:fs/promises';
import { formatSize } from './format.js';

const text = await readFile('poznamky.txt', 'utf8');
console.log(`Soubor má ${formatSize(text.length)}.`);
```

Všimni si tří věcí:

- **Předpona `node:`** říká „vestavěný modul Node, ne balíček z npm". Bez ní by
  `import fs from 'fs'` fungoval taky, ale při čtení kódu nepoznáš, jestli jde
  o vestavěný modul, nebo o balíček. S `node:` je to jasné na první pohled
  a některé novější vestavěné moduly (třeba `node:test`) jdou načíst jen s ní.
- **Relativní import má příponu** — `'./format.js'`, ne `'./format'`. Nástroje
  jako Vite příponu dohledají samy, Node ne.
- **`await` na nejvyšší úrovni** souboru. V ES modulu nemusíš kód balit do
  `async function main()`.

Ve starších návodech uvidíš jiný zápis — **CommonJS**, původní modulový systém
Node: `const fs = require('fs')` a `module.exports = …`. Dnes ho nepiš, ale
poznej ho, až ho potkáš v cizím kódu.

## `process`: program a svět kolem něj

Objekt `process` je spojení tvého programu s operačním systémem.

```js
// greet.js
console.log(process.argv);          // argumenty z příkazové řádky
console.log(process.cwd());         // složka, ze které byl program spuštěn
console.log(process.env.LANG);      // proměnná prostředí

if (!process.env.API_KEY) {
  console.error('Chybí proměnná API_KEY.');
  process.exit(1);                  // ukončí program s chybovým kódem
}
```

```sh
$ API_KEY=tajne node greet.js Jana
[ '/usr/bin/node', '/home/jana/greet.js', 'Jana' ]
/home/jana
cs_CZ.UTF-8
```

**Proměnné prostředí** (*environment variables*, `process.env`) jsou nastavení,
která programu předá ten, kdo ho spouští — ne kód. Typicky port serveru, adresa
databáze nebo tajné klíče. Stejný kód tak může běžet u tebe na portu 3000 a na
serveru na portu 8080, aniž bys v něm cokoli měnil.

## Soubory: `node:fs/promises`

Modul `node:fs` pracuje se soubory. Jeho verze `node:fs/promises` vrací Promise,
takže se píše s `await`:

```js
import { readFile, writeFile } from 'node:fs/promises';

const config = JSON.parse(await readFile('config.json', 'utf8'));
config.visits += 1;
await writeFile('config.json', JSON.stringify(config, null, 2));
```

Druhý argument `'utf8'` je důležitý: bez něj dostaneš `Buffer` (surové bajty),
ne text.

Existují i synchronní verze (`readFileSync`). Zastaví celý program, dokud se soubor
nepřečte. Ve skriptu, který se jednou spustí a skončí, to nevadí. Na serveru to
znamená, že všichni ostatní uživatelé mezitím čekají.

## Skript a server

Program z příkladů výš doběhne a skončí. Server ne: dokud poslouchá na portu,
smyčka událostí má na co čekat a proces běží dál.

```js
// server.js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.end('Ahoj ze serveru');
});

server.listen(3000, () => {
  console.log('Poslouchám na http://localhost:3000');
});
```

Z toho plynou tři věci, na které se v prohlížeči myslet nemusí:

- **Server ukončíš sám**, v terminálu klávesami Ctrl+C.
- **Změna v kódu se neprojeví sama.** Běží pořád ta verze, kterou jsi spustil.
  Musíš server restartovat, nebo ho spustit jako `node --watch server.js` — pak se
  restartuje po každém uložení.
- **Jeden proces obsluhuje všechny.** Nezachycená chyba nespadne jednomu
  uživateli v záložce, ale shodí server všem. A dlouhý synchronní výpočet zdrží
  všechny požadavky, které přijdou mezitím.

Jak server stavět doopravdy — adresy, stavové kódy, JSON — je obsahem workshopu
v další části sekce.

## Typické chyby a pasti

**`Cannot use import statement outside a module`** — Node soubor považuje za
CommonJS, typicky proto, že v `package.json` je `"type": "commonjs"`. Když `type`
v `package.json` jen chybí, novější Node `import` rozpozná sám, ale vypíše
varování `MODULE_TYPELESS_PACKAGE_JSON` a soubor čte dvakrát. Oprava je v obou
případech stejná: `"type": "module"`.

**`require is not defined in ES module scope`** — kód z návodu je CommonJS a ty
máš ES moduly. Přepiš `require` na `import`.

**`__dirname is not defined in ES module scope`** — stejný původ. V ES modulu je
složka aktuálního souboru v `import.meta.dirname` a jeho adresa v
`import.meta.url`.

**`ERR_MODULE_NOT_FOUND` u vlastního souboru** — skoro vždy chybí přípona:
`import { x } from './utils'` místo `'./utils.js'`.

**Relativní cesta k souboru se počítá od `process.cwd()`, ne od souboru s kódem.**
`readFile('data.json')` najde soubor, když spustíš `node app.js` ze stejné složky.
Když spustíš `node projekt/app.js` o složku výš, dostaneš `ENOENT: no such file or
directory`. Cesta nezávislá na tom, odkud se program spouští, se staví od modulu:

```js
const dataFile = new URL('./data.json', import.meta.url);
const data = JSON.parse(await readFile(dataFile, 'utf8'));
```

**Proměnné prostředí jsou vždycky řetězce.** `DEBUG=false node app.js` nastaví
`process.env.DEBUG` na `'false'`, a to je neprázdný řetězec, tedy pravdivá hodnota.
Čísla převeď přes `Number()`, pravdivostní hodnoty porovnej s řetězcem.

**`EADDRINUSE: address already in use`** — na portu už něco poslouchá, nejčastěji
tvůj vlastní server z jiného terminálu, který jsi zapomněl ukončit.

# --questions--

## --question--

Soubor `app.js` obsahuje `document.querySelector('h1').textContent = 'Ahoj'`.
Co se stane po `node app.js`?

### --answer--

Node vypíše `Ahoj` do terminálu.

#### --why--

`textContent` mění prvek stránky, nevypisuje nic. A v Node žádná stránka není.

### --answer--

Nic, Node řádky pro prohlížeč přeskočí.

#### --why--

Node nic nepřeskakuje — spustí kód a na neznámém jménu skončí chybou.

### --correct--

Program skončí chybou `ReferenceError: document is not defined`.

#### --why--

`document` je globální objekt prohlížeče. Node má jiné globální objekty
(`process`, `Buffer`), DOM mezi nimi není.

## --question--

Projekt má `package.json` s `"type": "module"`. Který import vestavěného modulu
pro soubory je napsaný tak, jak se dnes píše?

### --answer--

`const fs = require('fs');`

#### --why--

To je CommonJS. V ES modulu `require` neexistuje a program skončí chybou
`require is not defined in ES module scope`.

### --correct--

`import { readFile } from 'node:fs/promises';`

#### --why--

ES modul, předpona `node:` jasně říká „vestavěný modul" a verze `promises` se
používá s `await`.

### --answer--

`import { readFile } from './fs';`

#### --why--

Tečka a lomítko znamenají vlastní soubor vedle kódu (a navíc bez přípony), ne
vestavěný modul Node.

## --question--

V souboru `projekt/app.js` je `await readFile('data.json', 'utf8')` a soubor
`data.json` leží ve složce `projekt/` hned vedle. Z nadřazené složky spustíš
`node projekt/app.js` a dostaneš `ENOENT`. Proč?

### --correct--

Relativní cesta se počítá od složky, ze které byl program spuštěn, a tam žádný
`data.json` není.

#### --why--

Rozhoduje `process.cwd()`. Cestu nezávislou na místě spuštění postavíš od modulu:
`new URL('./data.json', import.meta.url)`.

### --answer--

`readFile` umí číst jen soubory ve stejné složce jako `package.json`.

#### --why--

`readFile` přečte soubor kdekoli, kam má program přístup. Problém je, odkud se
počítá relativní cesta.

### --answer--

Chybí předpona: správně je `'node:data.json'`.

#### --why--

Předpona `node:` patří jen k importům vestavěných modulů, s cestami k souborům
nemá nic společného.

## --question--

Server spustíš příkazem `DEBUG=false node server.js`. V kódu je
`if (process.env.DEBUG) { console.log('ladím') }`. Co se stane?

### --correct--

Vypíše se `ladím`, protože hodnota je řetězec `'false'` a ten je pravdivý.

#### --why--

Proměnné prostředí jsou vždy řetězce. Neprázdný řetězec je v podmínce pravdivý,
bez ohledu na to, co v něm je napsané.

### --answer--

Nevypíše se nic, protože `DEBUG` je `false`.

#### --why--

Node proměnné prostředí nepřevádí na `true`/`false` ani na čísla. Dostaneš přesně
ten text, který byl na příkazové řádce.

### --answer--

Program skončí chybou, `process.env` se nesmí číst v podmínce.

#### --why--

`process.env` je obyčejný objekt s řetězci, číst ho můžeš kdekoli.
