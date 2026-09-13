# Co je Node.js

:::check pretest
Co myslíš, co vypíše `console.log(typeof window)`, když soubor spustíš v Node příkazem `node app.js`?

### --expected--
undefined

### --why--
V Node žádné okno prohlížeče není, a proto ani globální `window`. Operátor `typeof`
u neexistujícího jména nespadne, jen vrátí `'undefined'`.
:::

JavaScript z prohlížeče má jedno zásadní omezení: běží **u uživatele**, na cizím
počítači, v zabezpečeném prostředí stránky. Nesmí číst soubory na disku, nemůže
čekat na požadavky z internetu a nikdy neví, jestli ho za minutu někdo nezavře.

Aplikace ale potřebuje i druhou polovinu — program, který běží u tebe (na
serveru), drží data, odpovídá tisícům uživatelů a nepřestane, když někdo zavře
záložku. Ten se dá napsat ve spoustě jazyků. Node je způsob, jak ho napsat ve
stejném JavaScriptu, který už znáš.

> [!REMEMBER]
> **Node je JavaScript bez stránky: stejný jazyk, ale místo `window` a DOM má přístup k počítači — k souborům, síti a procesům.**

## Co Node je

Node.js je [[běhové prostředí]] (*runtime*) pro JavaScript. Není to nový jazyk ani
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

> [!TIP]
> Zkus si to hned: ve VS Code vytvoř prázdnou složku, v ní soubor `hello.js`
> s kódem výše a v terminálu ve stejné složce spusť `node hello.js`. Pak změň text
> v `console.log`, soubor ulož a spusť ho znovu. Příklady v této lekci si tak
> vyzkoušíš všechny.

:::check
Kamarád tvrdí: „Node je framework na backend, něco jako Express." Co je na tom pravda?

### --answer--
Všechno. Node i Express jsou frameworky, jen od jiných autorů.

#### --why--
Myslíš si, že Node předepisuje, jak stavět aplikaci? Framework dává kostru a pravidla.
Node jen spouští JavaScript a přidává k němu knihovnu.

### --answer--
Nic. Node je nový jazyk, který se JavaScriptu jen podobá.

#### --why--
Myslíš si, že je to jiný jazyk? V Node běží tentýž engine V8 jako v Chromu, se
stejnou syntaxí.

### --correct--
Node není framework, ale běhové prostředí. Express je knihovna, která v Node běží.

#### --why--
Node spustí JavaScript mimo prohlížeč a přidá moduly pro soubory a síť. Frameworky
jako Express stojí na něm a řeší za tebe část práce se serverem.
:::

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

Kód pro stránku v Node nefunguje a naopak. Rozdíl uvidíš hned při spuštění:

:::live node predict
```js
console.log(typeof window, typeof process);
console.log(document.title);
```
--question-- Soubor `app.js` spustíš příkazem `node app.js`. Co vypíše **první** řádek výstupu?
--expected-- undefined object
--output--
```text
undefined object
file:///home/jana/app.js:2
console.log(document.title);
            ^

ReferenceError: document is not defined
    at file:///home/jana/app.js:2:13

Node.js v26.5.1
```
--why-- `typeof` u neexistujícího `window` vrátí `'undefined'` a nespadne. Druhý řádek ale na `document` sáhne doopravdy — a protože v Node žádná stránka není, program skončí na `ReferenceError`. Není to chyba v kódu, je to chyba v místě, kde běží.
:::

Zkus si to: v souboru změň `document.title` na `process.cwd()` a spusť ho znovu —
program doběhne a vypíše složku, ze které jsi ho spustil.

:::check
Který z těchto řádků v Node skončí chybou: `setTimeout(done, 100)`, `localStorage.getItem('theme')`, `JSON.parse('[]')`? Napiš jméno globálního objektu, na kterém to spadne.

### --expected--
localStorage

### --why--
`localStorage` je úložiště prohlížeče pro konkrétní web. `setTimeout` a `JSON` jsou
v obou prostředích. Server si data ukládá jinak — do souborů nebo databáze.
:::

## Moduly v Node

Moduly `import`/`export` fungují v Node stejně jako v prohlížeči, jen je potřeba
Node říct, že je chceš. Do kořene projektu patří soubor `package.json` s typem:

```json
{
  "type": "module"
}
```

Od té chvíle jsou všechny soubory `.js` ve složce ES moduly. Import
[[vestavěný modul|vestavěného modulu]] se píše s předponou `node:`:

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
  o vestavěný modul, nebo o balíček. Některé novější moduly (třeba `node:test`)
  jdou načíst jen s ní.
- **Relativní import má příponu** — `'./format.js'`, ne `'./format'`. Nástroje
  jako Vite příponu dohledají samy, Node ne.
- **`await` na nejvyšší úrovni** souboru. V ES modulu nemusíš kód balit do
  `async function main()`.

> [!NOTE]
> Ve starších návodech uvidíš jiný zápis — [[CommonJS]], původní modulový systém
> Node: `const fs = require('fs')` a `module.exports = …`. Dnes ho nepiš, ale
> poznej ho, až ho potkáš v cizím kódu.

:::check
V projektu s `"type": "module"` je řádek `import { slugify } from './utils'` a Node hlásí `ERR_MODULE_NOT_FOUND`. Soubor `utils.js` leží hned vedle. Napiš opravený řádek.

### --expected--
import { slugify } from './utils.js'

### --why--
Node v ES modulech příponu nedohledává. Cestu k vlastnímu souboru musíš napsat celou,
i s `.js`.
:::

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

[[Proměnná prostředí|Proměnné prostředí]] (*environment variables*, `process.env`)
jsou nastavení, která programu předá ten, kdo ho spouští — ne kód. Typicky port
serveru, adresa databáze nebo tajné klíče. Stejný kód tak může běžet u tebe na portu
3000 a na serveru na portu 8080, aniž bys v něm cokoli měnil. Složka z `process.cwd()`
je [[pracovní složka]] programu.

Proměnnou nastavíš přímo před příkazem: `PORT=8080 node server.js`. Co dostane kód?

:::live node predict
```js
// config.js
const port = process.env.PORT;
console.log(port + 1);
console.log(process.env.DEBUG ? 'ladím' : 'tiše');
```
--question-- Program spustíš příkazem `PORT=8080 DEBUG=false node config.js`. Co vypíše?
--output--
```text
80801
ladím
```
--why-- Proměnné prostředí jsou **vždycky řetězce**. `'8080' + 1` spojí text a `'false'` je neprázdný řetězec, tedy v podmínce pravdivý. Čísla převeď přes `Number()`, pravdivostní hodnoty porovnej s řetězcem: `process.env.DEBUG === 'true'`.
:::

Zkus si to: spusť `config.js` bez proměnných (`node config.js`) a sleduj, co vypíše
`port + 1`, když `PORT` vůbec není nastavený.

:::check
Program spustíš jen příkazem `node app.js`, bez jakékoli proměnné. Jakou hodnotu má `process.env.API_KEY`?

### --expected--
undefined

### --why--
Nenastavená proměnná prostředí v `process.env` prostě chybí, takže čtení vrátí
`undefined` — ne prázdný řetězec a ne chybu.
:::

## Soubory: `node:fs/promises`

Modul `node:fs` pracuje se soubory. Jeho verze `node:fs/promises` vrací Promise,
takže se píše s `await`:

```js
import { readFile, writeFile } from 'node:fs/promises';

const config = JSON.parse(await readFile('config.json', 'utf8'));
config.visits += 1;
await writeFile('config.json', JSON.stringify(config, null, 2));
```

Druhý argument `'utf8'` je důležitý: bez něj dostaneš [[Buffer]] (surové bajty),
ne text. `writeFile` soubor celý přepíše, nic nepřidává na konec.

Čtení souboru chvíli trvá. Node na něj nečeká se založenýma rukama:

:::live node predict
```js
import { readFile } from 'node:fs/promises';

console.log('A');
readFile('pozdrav.txt', 'utf8').then((text) => console.log(text));
console.log('C');
```
--question-- Soubor `pozdrav.txt` obsahuje slovo `Ahoj`. Co program vypíše, řádek po řádku?
--output--
```text
A
C
Ahoj
```
--why-- `readFile` čtení jen spustí a hned vrátí Promise. Kód pokračuje dál a vypíše `C`. Až je soubor přečtený, smyčka událostí zavolá callback z `then`. Stejně se chová `fetch` v prohlížeči.
:::

Zkus si to u sebe: vytvoř `pozdrav.txt` a program spusť. Pak řádek s `then` přepiš na
`console.log(await readFile('pozdrav.txt', 'utf8'));` a sleduj, jak se změní pořadí.

Existují i synchronní verze (`readFileSync`). Ty zastaví celý program, dokud se soubor
nepřečte. Ve skriptu, který se jednou spustí a skončí, to nevadí. Na serveru to
znamená, že všichni ostatní uživatelé mezitím čekají.

:::explain
Vysvětli vlastními slovy, proč `readFileSync` v obsluze požadavku zdrží všechny uživatele serveru, a ne jen toho, kdo požadavek poslal.

## --model--
Node spouští můj JavaScript v jednom vlákně pro všechny požadavky. Synchronní čtení
to vlákno zablokuje, dokud soubor nedočte, takže server mezitím nemůže začít
obsluhovat nikoho jiného. Asynchronní `readFile` čtení předá systému a vlákno se
mezitím věnuje dalším požadavkům.

## --checklist--
- Node spouští JavaScript v jednom vlákně pro všechny požadavky.
- Synchronní volání blokuje to vlákno, dokud neskončí.
- Asynchronní verze vlákno uvolní a na výsledek čeká přes Promise.
:::

:::check
Soubor `jmeno.txt` obsahuje text `Ema`. Co vypíše `console.log(await readFile('jmeno.txt'))`, když zapomeneš na druhý argument?

### --answer--
`Ema`

#### --why--
Myslíš si, že `readFile` sám pozná, že jde o text? Bez kódování nedostaneš řetězec.

### --correct--
`<Buffer 45 6d 61>` — surové bajty souboru.

#### --why--
Bez `'utf8'` vrátí `readFile` objekt `Buffer`. Text z něj dostaneš přes
`buffer.toString('utf8')`, nebo rovnou `readFile(cesta, 'utf8')`.

### --answer--
Program skončí chybou, protože chybí povinný argument.

#### --why--
Kódování je nepovinné. Bez něj `readFile` vrátí bajty, ne chybu.
:::

## Skript a server

Program z příkladů výš doběhne a skončí. Server ne: dokud poslouchá na portu,
smyčka událostí má na co čekat a proces běží dál. Port je číslo, podle kterého
operační systém pozná, kterému programu patří příchozí spojení.

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
  uživateli v záložce, ale shodí server všem. Dlouhý synchronní výpočet zdrží
  všechny požadavky, které přijdou mezitím. A proměnná na nejvyšší úrovni modulu
  je **společná pro všechny požadavky**:

:::memory
```js
const cart = [];
function addToCart(user, item) {
  cart.push(item);
  return cart;
}
const emaCart = addToCart('Ema', 'mléko');
const petrCart = addToCart('Petr', 'chleba');
```
--step-- 1 | modul se načte jednou při startu serveru
cart -> @cart
@cart: []
--step-- 6 | požadavek od Emy
cart -> @cart
emaCart -> @cart
@cart: ['mléko']
--step-- 7 | požadavek od Petra
cart -> @cart
emaCart -> @cart
petrCart -> @cart
@cart: ['mléko', 'chleba']
:::

Petr v košíku vidí i Emino mléko. V prohlížeči má každý uživatel vlastní kopii
stránky, na serveru ne. Data jednoho uživatele proto patří do souboru, databáze
nebo do proměnných uvnitř obsluhy požadavku.

:::check
Server běží z terminálu příkazem `node server.js`. Změníš v `server.js` text odpovědi, soubor uložíš a obnovíš stránku v prohlížeči. Co uvidíš?

### --answer--
Nový text, Node soubor po uložení načte znovu.

#### --why--
Myslíš si, že Node sleduje změny souborů jako Vite? Bez `--watch` to nedělá.

### --correct--
Starý text. Běží pořád proces se starou verzí kódu, dokud ho nerestartuješ.

#### --why--
Kód se načte jednou při spuštění. Server ukonči Ctrl+C a spusť znovu, nebo ho
spouštěj jako `node --watch server.js`.

### --answer--
Chybu, protože se soubor změnil za běhu.

#### --why--
Úprava souboru běžící proces nijak neovlivní — ani ho neshodí, ani neaktualizuje.
:::

## Typické chyby a pasti

Když se v Node něco pokazí, terminál vypíše přesnou hlášku. Tady jsou ty, které
potkáš nejdřív, a co s nimi.

> [!PITFALL] `Cannot use import statement outside a module`
> Node soubor považuje za CommonJS, typicky proto, že v `package.json` je
> `"type": "commonjs"`. Když `type` jen chybí, novější Node `import` rozpozná sám, ale
> vypíše varování `MODULE_TYPELESS_PACKAGE_JSON`. **Oprava:** `"type": "module"`.

> [!PITFALL] `require is not defined in ES module scope`
> Kód z návodu je CommonJS a ty máš ES moduly. **Oprava:** přepiš `require` na `import`.

> [!PITFALL] `__dirname is not defined in ES module scope`
> Stejný původ. **Oprava:** složka aktuálního souboru je v `import.meta.dirname`,
> jeho adresa v `import.meta.url`.

> [!PITFALL] `ERR_MODULE_NOT_FOUND` u vlastního souboru
> Skoro vždy chybí přípona: `'./utils'` místo `'./utils.js'`.

Nejzákeřnější je relativní cesta k souboru. Program `projekt/app.js` čte
`data.json`, který leží hned vedle něj ve složce `projekt/`:

:::live node predict
```js
// projekt/app.js
import { readFile } from 'node:fs/promises';

const text = await readFile('data.json', 'utf8');
console.log(text);
```
--question-- Program spustíš **z nadřazené složky** příkazem `node projekt/app.js`. Co se stane?
--option-- Vypíše obsah `data.json`, protože leží vedle `app.js`.
--option*-- Skončí chybou `ENOENT: no such file or directory`.
--option-- Skončí chybou `ERR_MODULE_NOT_FOUND`.
--output--
```text
node:internal/fs/promises:1360
  return new FileHandle(await PromisePrototypeThen(
                        ^

Error: ENOENT: no such file or directory, open 'data.json'
    at async open (node:internal/fs/promises:1360:25)
    at async readFile (node:internal/fs/promises:2149:14)
    at async file:///home/jana/projekt/app.js:3:14 {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: 'data.json'
}
```
--why-- Relativní cesta se počítá od pracovní složky (`process.cwd()`), tedy odkud program spouštíš — ne od souboru s kódem. `ERR_MODULE_NOT_FOUND` patří k `import`, ne ke čtení souborů.
:::

Zkus si to: spusť program jednou ze složky `projekt/` (`node app.js`) a jednou o úroveň
výš. Pak do něj přidej `console.log(process.cwd())` a sleduj, jak se výpis mění podle
toho, odkud spouštíš.

> [!PITFALL] `ENOENT: no such file or directory` u souboru, který existuje
> Relativní cesta se počítá od `process.cwd()`. **Oprava:** cestu nezávislou na místě
> spuštění postav od modulu: `new URL('./data.json', import.meta.url)`.

> [!PITFALL] Proměnné prostředí jsou vždycky řetězce
> `DEBUG=false node app.js` dá `process.env.DEBUG === 'false'`, a to je pravdivá
> hodnota. **Oprava:** čísla převeď přes `Number()`, přepínače porovnej s `'true'`.

> [!PITFALL] `EADDRINUSE: address already in use :::3000`
> Na portu už něco poslouchá, nejčastěji tvůj vlastní server z jiného terminálu.
> **Oprava:** najdi ten terminál a ukonči server Ctrl+C, nebo spusť nový na jiném
> portu (`PORT=3001 node server.js`).

:::check
V terminálu, kde chceš spustit server, vidíš `Error: listen EADDRINUSE: address already in use :::3000`. Co je nejpravděpodobnější příčina?

### --answer--
Port 3000 je zakázaný a Node na něm poslouchat nesmí.

#### --why--
Myslíš si, že jde o oprávnění? Na to je jiná hláška (`EACCES`). `EADDRINUSE`
znamená „obsazeno".

### --correct--
Na portu 3000 už běží jiný program — často tvůj server z jiného terminálu.

#### --why--
Jeden port může v jednu chvíli poslouchat jen jeden program. Ukonči starý server,
nebo nový spusť na jiném portu.

### --answer--
V kódu chybí `server.listen`.

#### --why--
Bez `listen` by server na port vůbec nesahal, takže by nemohl hlásit, že je obsazený.
:::

## Kde to najdeš v MDN

- [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) —
  `import`, `export` a jak se moduly načítají; platí i pro Node.
- [import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) —
  co je `import.meta.url` a proč z něj jde postavit cesta k souboru.
- [JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) —
  smyčka událostí a proč se `then` zavolá až po zbytku kódu.
- [Introduction to the server side](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Introduction) —
  co dělá server a proč vůbec existuje.

> [!NOTE]
> Vestavěné moduly Node (`node:fs`, `node:http`, `process`) MDN nepopisuje. Jejich
> dokumentace je na [nodejs.org/api](https://nodejs.org/api/) — anglicky, s příklady
> u každé funkce.

# --questions--

## --question--

Soubor `app.js` obsahuje `document.querySelector('h1').textContent = 'Ahoj'`.
Co se stane po `node app.js`?

### --answer--

Node vypíše `Ahoj` do terminálu.

#### --why--

Myslíš si, že `textContent` něco vypisuje? Jen mění prvek stránky — a v Node žádná
stránka není.

### --answer--

Nic, Node řádky pro prohlížeč přeskočí.

#### --why--

Myslíš si, že Node kód pro prohlížeč pozná? Spustí ho a na neznámém jménu skončí.

### --correct--

Program skončí chybou `ReferenceError: document is not defined`.

#### --why--

`document` je globální objekt prohlížeče. Node má jiné globální objekty
(`process`, `Buffer`), DOM mezi nimi není.

### --see--

node-zaklady/co-je-node#stejny-jazyk-jine-prostredi

## --question--

Program `projekt/app.js` čte soubor `data.json`, který leží vedle něj. Napiš výraz
pro cestu k tomu souboru, který bude fungovat, ať program spustíš z jakékoli složky.

### --expected--

new URL('./data.json', import.meta.url)

### --accept--

new URL('data.json', import.meta.url)
path.join(import.meta.dirname, 'data.json')
join(import.meta.dirname, 'data.json')

### --why--

Relativní cesta v `readFile` se počítá od `process.cwd()`. `import.meta.url` je adresa
samotného modulu, takže cesta od ní vede vždycky vedle souboru s kódem.

### --see--

node-zaklady/co-je-node#typicke-chyby-a-pasti

## --question--

Projekt má `package.json` s `"type": "module"`. Který import vestavěného modulu
pro soubory je napsaný tak, jak se dnes píše?

### --answer--

`const fs = require('fs');`

#### --why--

Myslíš si, že `require` je jen starší zápis téhož? V ES modulu `require` neexistuje
a program skončí chybou `require is not defined in ES module scope`.

### --correct--

`import { readFile } from 'node:fs/promises';`

#### --why--

ES modul, předpona `node:` jasně říká „vestavěný modul" a verze `promises` se
používá s `await`.

### --answer--

`import { readFile } from './fs';`

#### --why--

Myslíš si, že `./` hledá mezi moduly Node? Tečka a lomítko znamenají vlastní soubor
vedle kódu.

### --see--

node-zaklady/co-je-node#moduly-v-node

## --question--

Server spouštíš příkazem `node server.js` a po každé změně ho ručně restartuješ.
Jak ho spustíš, aby se po uložení souboru restartoval sám? Napiš celý příkaz.

### --expected--

node --watch server.js

### --why--

Přepínač `--watch` hlídá soubory, které program načetl, a po jejich změně proces
spustí znovu. Bez něj běží pořád verze kódu z okamžiku spuštění.

### --see--

node-zaklady/co-je-node#skript-a-server
