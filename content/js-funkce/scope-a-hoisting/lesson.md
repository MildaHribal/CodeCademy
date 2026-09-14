# Rozsah platnosti, hoisting a TDZ

:::check pretest
Co vypíše poslední řádek? Tipni si, i když si nejsi jistý.

```js
function addToCart(price) {
  const total = price + 99;
  return total;
}

addToCart(500);
console.log(total);
```

### --answer--

`599` — funkce proměnnou `total` spočítala.

#### --why--

Funkce ji spočítala, ale proměnná vznikla uvnitř funkce. Jestli je vidět i venku, řeší první část lekce.

### --correct--

Program spadne s `ReferenceError`.

#### --why--

`total` existuje jen uvnitř funkce. Venku o ní program neví: `ReferenceError: total is not defined`.

### --answer--

`undefined`

#### --why--

`undefined` by vypsala proměnná, která existuje, ale nemá hodnotu. Tady jde o to, jestli `total` venku vůbec existuje.
:::

:::check pretest
Jde zavolat funkci na řádku **nad** tím, kde je napsaná?

```js
console.log(withVat(100));

function withVat(price) {
  return price * 1.21;
}
```

### --correct--

Ano, vypíše `121`.

#### --why--

Deklarace funkce je k dispozici v celém souboru ještě před spuštěním prvního řádku. Proč, a proč to neplatí pro šipkovou funkci v `const`, vysvětlí část o hoistingu.

### --answer--

Ne, `ReferenceError`, funkce ještě neexistuje.

#### --why--

Tak by to dopadlo u šipkové funkce uložené do `const`. U deklarace přes `function` je to jinak, uvidíš v části o hoistingu.

### --answer--

Vypíše `undefined`, protože funkce ještě nemá tělo.

#### --why--

Deklarace funkce se připraví celá, i s tělem. Podrobnosti jsou v části o hoistingu.
:::

Skript e-shopu má stovky řádků a v mnoha funkcích proměnné `total`, `price` nebo
`count`. Kdyby každá proměnná byla vidět všude, funkce pro košík by si přepisovala
`total` s funkcí pro dopravu a chyba by se projevila na úplně jiném místě, než kde
vznikla. JavaScript tomu brání tím, že každá proměnná má svůj **[[rozsah platnosti]]**
(*scope*): kus kódu, ve kterém je vidět.

```js
function cartTotal(price, quantity) {
  const total = price * quantity;
  return total;
}

function shippingTotal(weight) {
  const total = weight * 30;
  return total;
}
```

Obě funkce mají svou `total` a navzájem si je nepřepíšou.

> [!REMEMBER]
> **Proměnná je vidět v bloku, ve kterém vznikla, a ve všem, co je uvnitř něj. Když ji JavaScript hledá, jde zevnitř ven.**

## Rozsah platnosti: kde je proměnná vidět

Rozsah platnosti vytváří každá funkce a každý blok ve složených závorkách (`if`,
`for`, `while`). Proměnná napsaná mimo všechny funkce a bloky má **globální rozsah**
a vidí ji celý skript. Proměnná z těla funkce má **rozsah funkce** — existuje jen
během volání a zvenku k ní nevede cesta. Totéž platí pro parametry.

:::live js
```js
const vatRate = 1.21;

function withVat(price) {
  const total = price * vatRate;
  return total;
}

console.log(withVat(100));

try {
  console.log(total);
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
```
:::

Funkce `withVat` vidí globální `vatRate`, protože je venku, tedy „nad" ní. Naopak
`total` z funkce venku není. Zkus do bloku `try` napsat `console.log(price)` a
sleduj, že parametr se chová stejně jako `total`.

Směr hledání je jen jeden: zevnitř ven. Funkce vidí ven, nikdo zvenku nevidí dovnitř.
Díky tomu si můžeš uvnitř funkce pojmenovat proměnnou jakkoli a nerozbiješ tím
zbytek programu.

:::check
Která proměnná je v kódu vidět na posledním řádku?

```js
const shop = 'Pekárna U Moudrých';

function openingLabel(hour) {
  const isOpen = hour >= 6 && hour < 18;
  return isOpen ? 'otevřeno' : 'zavřeno';
}

console.log(/* sem */);
```

### --correct--

`shop`

#### --why--

`shop` je globální, vidí ji celý skript včetně posledního řádku.

### --answer--

`isOpen`

#### --why--

`isOpen` vzniká v těle funkce a existuje jen během jejího volání. Zvenku k ní cesta nevede.

### --answer--

`hour`

#### --why--

Parametr je proměnná funkce, stejně jako `const` v jejím těle. Mimo funkci neexistuje.

### --see--

js-funkce/scope-a-hoisting#rozsah-platnosti-kde-je-promenna-videt
:::

## Blokový rozsah: `let` a `const` vs. `var`

`let` a `const` mají **blokový rozsah**: proměnná z bloku `if` nebo `for` existuje
jen do jeho uzavírací složené závorky. Starší `var` bloky nerespektuje — platí pro
celou funkci (nebo celý skript), ve které je napsaný.

:::live js predict
```js
for (var i = 0; i < 3; i++) {
  // tady by se pracovalo s položkou číslo i
}

console.log(i);
```
--question-- Co vypíše `console.log(i)`?
--expected-- 3
--why-- `var` nemá blokový rozsah, takže `i` existuje i za cyklem a zůstala v ní hodnota, na které cyklus skončil. Zkus `var` přepsat na `let` a sleduj hlášku `ReferenceError: i is not defined`. S `let` proměnná cyklu za uzavírací závorkou zanikne.
:::

Rozdíl ==var== a ==let== vypadá jako drobnost, ale s `var` se proměnná cyklu nebo
podmínky „propíše" do okolí a může přepsat jinou proměnnou se stejným jménem. Proto
se v moderním kódu `var` nepíše. Pravidlo, které ti stačí:

- `const` pro všechno, do čeho už nepřiřazuješ,
- `let` tam, kde hodnotu opravdu měníš (počítadlo, průběžný součet),
- `var` jen čteš ve starém kódu.

> [!NOTE]
> `var` v cyklu má ještě jednu past, která se projeví až s funkcemi volanými později
> (`setTimeout` uvnitř `for`). Dostaneme se k ní v sekci *Closures, `this`
> a funkcionální styl*.

:::check
Co vypíše poslední řádek?

```js
function discountLabel(total) {
  if (total > 1000) {
    const discount = 100;
  }
  return discount;
}

try {
  console.log(discountLabel(1500));
} catch (error) {
  console.log(error.name);
}
```

### --expected--

ReferenceError

### --why--

`const discount` existuje jen uvnitř bloku `if`. Řádek `return discount` je už za uzavírací závorkou, kde žádná `discount` není, takže vznikne `ReferenceError: discount is not defined`. S `var` by funkce vrátila `100`.

### --see--

js-funkce/scope-a-hoisting#blokovy-rozsah-let-a-const-vs-var
:::

## Stínění: stejné jméno uvnitř a venku

Když ve vnitřním bloku nebo funkci deklaruješ proměnnou se stejným jménem, jako má
proměnná venku, vzniknou **dvě různé proměnné**. Vnitřní [[stínění|zastíní]] vnější
(*shadowing*): od té chvíle najde hledání zevnitř ven nejdřív tu vnitřní a na vnější
už nedosáhne. Vnější se tím nezmění.

Často je to záměr — parametr `price` v jedné funkci nemá nic společného s `price`
v jiné. Past nastane, když chceš vnější proměnnou **změnit**, a omylem napíšeš `let`:

:::live js predict
```js
function shippingPrice(total) {
  let price = 99;
  if (total >= 1500) {
    let price = 0;
  }
  return price;
}

console.log(shippingPrice(2000));
```
--question-- Co vypíše `console.log(shippingPrice(2000))`?
--expected-- 99
--why-- `let price = 0` uvnitř `if` nevytvoří nic víc než novou proměnnou, která platí jen do konce bloku. Vnější `price` se nezměnila a funkce vrátí `99`. Zkus uvnitř `if` smazat slovo `let` — z deklarace se stane přiřazení do vnější proměnné a doprava zdarma začne fungovat.
:::

> [!PITFALL]
> **`let` nebo `const` před přiřazením uvnitř bloku vytvoří novou proměnnou místo
> změny té vnější.** Příznak: podmínka proběhne, ale výsledek se nezmění, a v konzoli
> žádná chyba. Oprava: uvnitř bloku do vnější proměnné jen přiřaď, bez `let`.

:::check
Oprav řádek `let price = 0;` uvnitř `if` tak, aby funkce při nákupu od 1500 Kč vrátila `0`. Napiš celý opravený řádek.

### --expected--

price = 0;

### --why--

Bez `let` už nejde o deklaraci nové proměnné, ale o přiřazení. Hledání zevnitř ven najde vnější `price` a přepíše ji.

### --see--

js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku
:::

## Lexikální rozsah a zásobník volání

Kde funkce hledá proměnné, které sama nemá? Tam, kde je **napsaná**, ne tam, odkud
ji někdo volá. Tomu se říká [[lexikální rozsah]] (*lexical scope*): rozsah platnosti
jde vyčíst z textu programu, bez spuštění.

:::live js predict
```js
const currency = 'Kč';

function formatPrice(amount) {
  return `${amount} ${currency}`;
}

function priceInEuro() {
  const currency = 'EUR';
  return formatPrice(100);
}

console.log(priceInEuro());
```
--question-- Co vypíše `console.log(priceInEuro())`?
--expected-- 100 Kč
--why-- `formatPrice` je napsaná na nejvyšší úrovni skriptu, takže když nemá vlastní `currency`, hledá ji tam — a najde `'Kč'`. Proměnná `currency` uvnitř `priceInEuro` je vidět jen v těle `priceInEuro` a na to, co vidí jiná funkce, nemá vliv. Když chceš euro, musíš měnu `formatPrice` předat parametrem.
:::

Každé volání funkce si navíc založí **vlastní** sadu proměnných: parametry a to, co
deklaruje v těle. Po `return` tahle sada zanikne. Rozdělaná volání se skládají na
sebe do [[zásobník volání|zásobníku volání]] (*call stack*): když funkce A zavolá B,
A čeká, B běží nahoře, a když B vrátí výsledek, pokračuje A. Krokuj šipkami a sleduj,
které proměnné existují:

:::memory
```js
const vatRate = 1.21;
function withVat(price) {
  const total = price * vatRate;
  return total;
}
const result = withVat(100);
console.log(result);
```
--step-- 5 | funkce je připravená, volání ještě neproběhlo
vatRate = 1.21
withVat -> @fn
@fn: function withVat(price)
--step-- 3 | během volání withVat(100) existují navíc price a total
vatRate = 1.21
withVat -> @fn
price = 100
total = 121
@fn: function withVat(price)
--step-- 6 | po return proměnné volání zanikly, výsledek zůstal v result
vatRate = 1.21
withVat -> @fn
result = 121
@fn: function withVat(price)
:::

Totéž uvidíš ve skutečném prohlížeči. Když se program zastaví na breakpointu uvnitř
funkce (klikni na **Nová karta** nad výstupem, otevři DevTools a v panelu Sources
klikni na číslo řádku), ukazuje Chrome vpravo dva panely:

- **Call Stack** — zásobník volání: nahoře funkce, ve které stojíš, pod ní ty, které na ni čekají.
- **Scope** — proměnné rozdělené podle rozsahu: *Local* (parametry a proměnné rozdělaného volání), *Block* (`let`/`const` z bloku, ve kterém stojíš), *Script* (`let` a `const` z nejvyšší úrovně skriptu) a *Global* (vestavěné věci prohlížeče).

> [!TIP]
> Místo `console.log` na pěti místech dej jeden breakpoint a přečti si hodnoty v panelu
> Scope. Kliknutím na nižší řádek v Call Stack uvidíš proměnné funkce, která čeká.

:::check
Program stojí na breakpointu na řádku `return total;` při volání `withVat(100)` z ukázky nad touto otázkou. Ve které části panelu Scope najdeš `price`?

### --correct--

Local

#### --why--

`price` je parametr rozdělaného volání `withVat`, takže patří k jeho lokálním proměnným.

### --answer--

Script

#### --why--

Ve Script jsou `let` a `const` z nejvyšší úrovně skriptu, tedy `vatRate` a `result`. Parametr ale patří volání funkce.

### --answer--

Global

#### --why--

Global obsahuje vestavěné věci prohlížeče (`console`, `setTimeout`…). Proměnná z tvého volání funkce tam není.

### --see--

js-funkce/scope-a-hoisting#lexikalni-rozsah-a-zasobnik-volani
:::

:::explain
Vysvětli vlastními slovy, proč `formatPrice` v ukázce vypsala `100 Kč`, přestože ji volala funkce, která má vlastní `currency = 'EUR'`.

## --model--

JavaScript má lexikální rozsah platnosti: to, které proměnné funkce vidí, určuje místo, kde je funkce napsaná, ne místo, odkud ji někdo volá. `formatPrice` je napsaná na nejvyšší úrovni skriptu, takže když nemá vlastní `currency`, hledá ji ven až tam a najde `'Kč'`. Proměnná `currency` uvnitř `priceInEuro` je jen v jejím těle, a jiná funkce na ni nedosáhne. Když má funkce pracovat s jinou hodnotou, předám jí ji parametrem.

## --checklist--

- Funkce hledá chybějící proměnnou zevnitř ven podle toho, kde je napsaná.
- Místo, odkud se funkce volá, na hledání proměnných nemá vliv.
- Proměnná deklarovaná v těle jedné funkce není vidět v jiné funkci.
- Hodnotu, kterou má funkce použít, jí předám parametrem.
:::

## Hoisting a Temporal Dead Zone (TDZ)

Před spuštěním prvního řádku si JavaScript projde každý rozsah a zaregistruje v něm
všechny deklarace. Proměnné a funkce proto „existují" od začátku svého rozsahu, ještě
než k jejich řádku program dojde. Tomu se říká [[hoisting]] (vytažení nahoru). Co
z deklarace je k dispozici předem, záleží na tom, jak je napsaná:

| zápis | před svým řádkem | po svém řádku |
|---|---|---|
| `function withVat(price) { … }` | funkce se dá zavolat | funkce se dá zavolat |
| `var stock = 5` | hodnota `undefined` | hodnota `5` |
| `let` / `const` (i šipka v `const`) | `ReferenceError` | hodnota |

U deklarace funkce je tedy jedno, kde v souboru je. Díky tomu smíš dát hlavní část
programu nahoru a pomocné funkce dolů. Šipková funkce nebo funkční výraz v `const`
se ale chovají jako každá jiná `const`:

:::live js predict
```js
try {
  console.log(toEuro(500));
} catch (error) {
  console.log(error.message);
}

const toEuro = (czk) => czk / 25;
```
--question-- Co vypíše tenhle kód?
--option-- `20`
--option-- `undefined`
--option*-- Hlášku `Cannot access 'toEuro' before initialization`
--why-- `toEuro` je `const`, takže od začátku skriptu až do řádku s deklarací je v TDZ a každé čtení skončí `ReferenceError`. Zkus volání přesunout pod deklaraci, nebo `toEuro` přepsat na `function toEuro(czk) { … }`.
:::

Úsek od začátku rozsahu do řádku, kde se `let` nebo `const` deklaruje, se jmenuje
[[TDZ|Temporal Dead Zone]] (*TDZ*, časová mrtvá zóna). Proměnná v něm už existuje,
ale číst ani zapisovat ji nejde. Hláška je pokaždé `ReferenceError: Cannot access
'jméno' before initialization` — a to je dobře: `var` by místo chyby tiše vrátil
`undefined` a program by počítal dál s nesmyslem.

TDZ platí pro celý rozsah, tedy i v případě, kdy stejné jméno existuje o úroveň výš:

:::live js predict
```js
let city = 'Brno';

function printCity() {
  console.log(city);
  let city = 'Praha';
}

try {
  printCity();
} catch (error) {
  console.log(error.name);
}
```
--question-- Co vypíše tenhle kód?
--option-- `Brno`
--option-- `Praha`
--option*-- `ReferenceError`
--why-- Funkce má vlastní `let city`, a ta je v TDZ od začátku těla funkce až po řádek `let city = 'Praha'`. Hledání zevnitř ven se zastaví u vnitřní proměnné, ne u vnější `'Brno'`, a čtení v TDZ skončí chybou. Smaž řádek `let city = 'Praha'` a funkce vypíše `Brno`.
:::

:::check
Co vypíše tenhle kód?

```js
console.log(stock);
var stock = 12;
console.log(stock);
```

### --expected--

undefined
12

### --why--

Deklarace `var stock` se vytáhne na začátek skriptu i s hodnotou `undefined`; přiřazení `= 12` ale zůstává na svém řádku. První výpis proto dá `undefined`, druhý `12`. S `let` by první řádek skončil `ReferenceError`.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz
:::

## Typické chyby a pasti

### Proměnná použitá před deklarací

> [!PITFALL]
> **Kontrola na začátku funkce použije proměnnou, která je deklarovaná až pod ní.**
> Příznak: funkce funguje, dokud podmínka neplatí, a jakmile platí, spadne
> s `ReferenceError: Cannot access 'price' before initialization`. Oprava: přesuň
> deklaraci nad první použití.

### Volání šipky před jejím zápisem

> [!PITFALL]
> **Šipková funkce v `const` se nedá zavolat nad řádkem, kde je napsaná.** Příznak:
> `ReferenceError: Cannot access 'toEuro' before initialization` (u `var` je to
> `TypeError: toEuro is not a function`). Oprava: přesuň volání pod deklaraci, nebo
> z funkce udělej deklaraci `function toEuro(czk) { … }`.

### Funkce čeká proměnnou volajícího

> [!PITFALL]
> **Funkce nevidí lokální proměnné funkce, která ji volá.** Příznak: `ReferenceError:
> row is not defined`, přestože o řádek výš ve volající funkci `row` existuje, nebo
> tichý špatný výsledek, když se stejné jméno najde globálně. Oprava: předej hodnotu
> parametrem.

### Přiřazení bez deklarace

Když zapomeneš `let` nebo `const` a do neexistující proměnné jen přiřadíš, běžný
skript v prohlížeči nespadne:

:::live js
```js
function trackVisit() {
  visits = 1;
}

trackVisit();
console.log(visits);
```
:::

> [!PITFALL]
> **`visits = 1` bez deklarace založí globální proměnnou.** Příznak: proměnná z funkce
> je vidět všude a dvě funkce si ji přepisují. V JavaScriptových modulech a ve strict
> mode je to naopak chyba `ReferenceError: visits is not defined`. Oprava: každou
> proměnnou deklaruj přes `const` nebo `let`.

Zkus do ukázky jako úplně první řádek napsat `'use strict';` a sleduj, jak se z tichého
založení proměnné stane chyba.

:::check
Kolegova funkce počítá cenu vstupenky a pro studenty padá s `ReferenceError: Cannot access 'price' before initialization`. Co je špatně?

```js
function ticketPrice(age, isStudent) {
  if (isStudent) {
    return price * 0.7;
  }
  const price = age < 15 ? 110 : 220;
  return price;
}
```

### --answer--

`price` je `const`, a proto se s ní nedá násobit.

#### --why--

S `const` se počítat dá, jen do ní nejde znovu přiřadit. Hláška mluví o něčem jiném — kdy se `price` čte.

### --correct--

Větev pro studenty čte `price` ještě v TDZ, nad řádkem její deklarace.

#### --why--

`const price` existuje od začátku těla funkce, ale číst ji jde až od řádku deklarace. Oprava: řádek `const price = …` přesunout nad `if`.

### --answer--

`price` je deklarovaná v bloku `if`, takže venku není vidět.

#### --why--

Deklarace `price` je v těle funkce, ne v bloku `if`. Blok ji jen čte — příliš brzy.

### --see--

js-funkce/scope-a-hoisting#promenna-pouzita-pred-deklaraci
:::

## Kde to najdeš v MDN

- [Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope) — krátká definice globálního, funkčního a blokového rozsahu s ukázkou.
- [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) — část *Temporal dead zone (TDZ)* s příkladem stínění a přesnou chybovou hláškou.
- [Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) — čtyři druhy hoistingu a ke kterému druhu deklarace který patří.
- [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) — úvodní část *Lexical scoping*; zbytek stránky přijde na řadu v sekci o closures.

Příště ve cvičení *Oprav 3 chyby* najdeš tyhle pasti v cizím kódu pokladny kina.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
let points = 10;

function addBonus(points) {
  points = points + 5;
  return points;
}

addBonus(points);
console.log(points);
```

### --expected--

10

### --why--

Parametr `points` stíní globální `points`. Přiřazení `points = points + 5` mění jen parametr, tedy proměnnou volání, a ta po `return` zanikne. Globální `points` zůstane `10`. Kdyby se měl výsledek projevit, musel by se uložit: `points = addBonus(points)`.

### --see--

js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku

## --question--

Proč `ReferenceError` z TDZ pomáhá víc, než kdyby `let` před deklarací vracel `undefined` jako `var`?

### --answer--

Nepomáhá, jde jen o jiný název pro stejné chování.

#### --why--

Chování je jiné: `var` pokračuje s `undefined`, `let` program zastaví. Na čem z toho záleží při hledání chyby?

### --correct--

Chyba se ohlásí přesně na řádku, kde se proměnná čte příliš brzy, místo aby program tiše počítal s `undefined`.

#### --why--

S `undefined` by vzniklo `NaN` nebo text `undefined` o kus dál a příčina by se hledala dlouho. `ReferenceError` ukáže místo i jméno proměnné.

### --answer--

`let` je díky tomu rychlejší.

#### --why--

Rychlost s TDZ nesouvisí. Jde o to, kdy a kde se chyba projeví.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --question--

Co vypíše tenhle kód?

```js
const label = 'venku';

function outer() {
  const label = 'v outer';
  return inner();
}

function inner() {
  return label;
}

console.log(outer());
```

### --expected--

venku

### --why--

`inner` je napsaná na nejvyšší úrovni skriptu, a tak chybějící `label` hledá tam. Že ji volá `outer` s vlastní `label`, na tom nic nemění — rozsah platnosti je lexikální.

### --see--

js-funkce/scope-a-hoisting#lexikalni-rozsah-a-zasobnik-volani

## --question--

Co vypíše tenhle kód?

```js
function countdown() {
  for (var seconds = 3; seconds > 0; seconds--) {
    // odpočet
  }
  return seconds;
}

console.log(countdown());
```

### --expected--

0

### --why--

`var` platí pro celou funkci, ne jen pro blok cyklu, takže `seconds` existuje i za ním. Cyklus skončí ve chvíli, kdy podmínka `seconds > 0` přestane platit, tedy při `0`. S `let` by `return seconds` skončilo `ReferenceError`.

### --see--

js-funkce/scope-a-hoisting#blokovy-rozsah-let-a-const-vs-var
