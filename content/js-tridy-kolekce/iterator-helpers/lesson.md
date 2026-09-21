# Iterator helpers

:::check pretest
Co vypíše poslední řádek? Tipni si pořadí, i když si nejsi jistý.

```js
const log = [];
[1, 2]
  .map((n) => { log.push(`map ${n}`); return n; })
  .forEach((n) => log.push(`forEach ${n}`));
console.log(log.join(', '));
```

### --expected--

map 1, map 2, forEach 1, forEach 2

### --why--

Metody pole pracují po celých polích: `map` nejdřív projde všechno a postaví nové pole, teprve pak ho dostane `forEach`. Iterator helpers z téhle lekce to dělají jinak — uvidíš v části o líném zpracování.
:::

:::check pretest
`transactionIds('TX')` je nekonečný generátor z lekce o iterátorech. Jde z něj získat první tři id jako pole bez ručního `next()` a bez `break`?

### --answer--

Ne, z nekonečného generátoru jde brát jen přes `next()`.

#### --why--

Ještě před pár lety to tak bylo. Co dnes umí generátor sám, ukáže první část.

### --answer--

Ano, `[...transactionIds('TX')].slice(0, 3)`.

#### --why--

Spread chce všechny hodnoty najednou, a těch je nekonečně mnoho. Tenhle řádek nikdy nedoběhne.

### --correct--

Ano, generátor má vlastní metodu, která vezme jen prvních pár hodnot.

#### --why--

Jmenuje se `take` a patří k iterator helpers. Jak funguje a proč nezamrzne, vysvětlí lekce.
:::

> [!NOTE]
> Tahle lekce je **nepovinné rozšíření**. Stojí na lekci [Iterátory a generátory](see:js-tridy-kolekce/iteratory-generatory#iteracni-protokol-symbol-iterator-a-next); kvíz sekce ji nepotřebuje.

Sklad e-shopu drží zboží v `Map`, přehrávač vydává písničky generátorem, server čte záznamy po řádcích. Doteď jsi z takových dat musel nejdřív udělat pole, abys na ně mohl pustit `filter` nebo `map`:

```js
const available = [...stock.entries()].filter(([, quantity]) => quantity > 0);
```

Spread vyrobí celé mezipole, i když chceš jen první tři položky. A z nekonečného generátoru pole udělat nejde vůbec.

> [!REMEMBER]
> **Iterator helpers jsou metody pole přímo na iterátoru. Nevyrábějí pole, ale nový iterátor, a hodnoty zpracují po jedné, až si o ně někdo řekne.**

## Metody pole přímo na iterátoru

Každý vestavěný iterátor — `map.entries()`, `set.values()`, `array.values()` i generátor — dědí z `Iterator.prototype` sadu [[iterator helper|iterator helpers]]. Jmenují se stejně jako metody pole, které znáš:

:::live js
```js
const stock = new Map([
  ['Azul', 4],
  ['Dobble', 0],
  ['Krycí jména', 7],
  ['Carcassonne', 2],
]);

const available = stock.entries()
  .filter(([, quantity]) => quantity > 0)
  .map(([game, quantity]) => `${game}: ${quantity} ks`)
  .toArray();

console.log(available);
```
:::

Zkus před `.toArray()` přidat `.take(2)` a sleduj, kolik her zbude. Pak zkus `.drop(1)` — přeskočí první hodnotu.

| vrací nový iterátor (líně) | vrací hodnotu (projde iterátor) |
|---|---|
| `map(fn)`, `filter(fn)`, `flatMap(fn)` | `toArray()` — pole všech hodnot |
| `take(n)` — nejvýš prvních `n` hodnot | `reduce(fn, start)`, `forEach(fn)` |
| `drop(n)` — přeskočí prvních `n` hodnot | `some(fn)`, `every(fn)`, `find(fn)` |

Levý sloupec zatím nic nespočítal, jen si poznamenal, co se má s hodnotami stát. Pravý sloupec si hodnoty skutečně vyžádá.

:::check
`names` je iterátor se jmény. Napiš výraz, který vrátí **pole** jeho prvních tří hodnot.

### --expected--

names.take(3).toArray()

### --accept--

[...names.take(3)]
Array.from(names.take(3))

### --why--

`take(3)` vrátí iterátor s nejvýš třemi hodnotami a `toArray()` z něj udělá pole. Samotné `names.take(3)` pole ještě není.

### --see--

js-tridy-kolekce/iterator-helpers#metody-pole-primo-na-iteratoru
:::

## Líné zpracování: hodnoty tečou po jedné

Pole zpracuje každý krok řetězu pro všechny položky, než pustí výsledek dál. Iterátor pošle řetězem vždycky **jednu** hodnotu až na konec a teprve pak si řekne o další. Takovému zpracování se říká líné (*lazy*).

:::live js predict
```js
const log = [];
[1, 2].values()
  .map((n) => { log.push(`map ${n}`); return n; })
  .forEach((n) => log.push(`forEach ${n}`));
console.log(log.join(', '));
```
--question-- Co vypíše `console.log`? Porovnej s otázkou předem, kde chybělo `.values()`.
--expected-- map 1, forEach 1, map 2, forEach 2
--why-- `values()` udělalo z pole iterátor, takže `map` je iterator helper. `forEach` si řekne o první hodnotu, ta projde `map` a hned dojde do `forEach`. Teprve pak přijde na řadu druhá hodnota. Žádné mezipole nevzniklo.
:::

Díky tomu se dá skončit dřív. `take(1)` po první nalezené hodnotě přestane žádat další:

:::live js
```js
let checked = 0;

const firstExpensive = [120, 590, 1190, 349, 2490].values()
  .filter((price) => {
    checked += 1;
    return price > 1000;
  })
  .take(1)
  .toArray();

console.log(firstExpensive, checked);
```
:::

`filter` zkontroloval jen tři ceny, zbylé dvě nikdy nepotřeboval. Zkus smazat `.values()` a místo `.take(1).toArray()` napsat `.slice(0, 1)` — výsledek bude stejný, ale `checked` vyskočí na pět, protože metoda pole `filter` projde celé pole.

:::check
Kolikrát se zavolá callback `map`?

```js
const calls = [];
['a', 'b', 'c', 'd', 'e'].values()
  .map((letter) => calls.push(letter))
  .take(2)
  .toArray();
```

### --expected--

2

### --why--

`take(2)` si řekne jen o dvě hodnoty a pak skončí. Každá hodnota projde `map` až ve chvíli, kdy ji `take` potřebuje, takže `c`, `d` a `e` se ke callbacku nedostanou.

### --see--

js-tridy-kolekce/iterator-helpers#line-zpracovani-hodnoty-tecou-po-jedne
:::

## Nekonečné sekvence

Líné zpracování je přesně to, co nekonečný generátor potřebuje. Čísla faktur od stého čísla výš, jen sudá, jen tři:

:::live js
```js
function* orderNumbers() {
  let number = 1;
  while (true) {
    yield number;
    number += 1;
  }
}

const invoices = orderNumbers()
  .drop(100)
  .filter((number) => number % 2 === 0)
  .map((number) => `FA-2026-${number}`)
  .take(3)
  .toArray();

console.log(invoices);
```
:::

Zkus změnit `drop(100)` na `drop(5)` a `take(3)` na `take(5)`. Generátor pořád vydá jen tolik čísel, kolik si `take` řekne.

> [!PITFALL]
> **Na nekonečném iterátoru musí `take` (nebo `find`, `some`) přijít dřív než `toArray`, `reduce` nebo `forEach`.** `orderNumbers().map(…).toArray()` chce všechny hodnoty a nikdy neskončí — záložka zamrzne. Stejně dopadne `take` za filtrem, kterým žádná hodnota neprojde: `take(3)` čeká na tři hodnoty, které nepřijdou.

:::check
`ids` je nekonečný generátor čísel `1, 2, 3, …`. Které řádky doběhnou? Vyber všechny.

### --correct--

`ids.take(5).toArray()`

#### --why--

`take(5)` po páté hodnotě skončí a `toArray` dostane konečný iterátor.

### --correct--

`ids.map((id) => id * 2).take(5).toArray()`

#### --why--

`map` je líný, zpracuje jen těch pět hodnot, o které si řekne `take`.

### --answer--

`ids.map((id) => id * 2).toArray().slice(0, 5)`

#### --why--

`slice` by pole zkrátil, jenže `toArray` před ním chce všechny hodnoty nekonečné sekvence.

### --answer--

`ids.filter((id) => id < 0).take(5).toArray()`

#### --why--

Záporné číslo generátor nikdy nevydá. `take` pořád čeká na první hodnotu a `filter` žádá další a další čísla.

### --see--

js-tridy-kolekce/iterator-helpers#nekonecne-sekvence
:::

## `Iterator.from`: helpers pro cokoli iterovatelného

Helpers mají jen objekty, které dědí z `Iterator.prototype`. Vestavěné iterátory a generátory ano. Ručně napsaný iterátor ze starší knihovny, který má jen metodu `next()`, ne. `Iterator.from(hodnota)` z něj — nebo z čehokoli iterovatelného — udělá plnohodnotný iterátor:

:::live js
```js
const countdown = {
  seconds: 3,
  next() {
    if (this.seconds === 0) return { value: undefined, done: true };
    this.seconds -= 1;
    return { value: this.seconds + 1, done: false };
  },
};

console.log(typeof countdown.map);
console.log(Iterator.from(countdown).map((seconds) => `${seconds}…`).toArray());
```
:::

Stejně poslouží u vlastní iterovatelné třídy: `Iterator.from(playlist)` zavolá její `[Symbol.iterator]()` a vrátí iterátor s helpers. Zkus v ukázce změnit `seconds: 3` na `seconds: 5`.

> [!NOTE]
> Iterator helpers jsou ve všech hlavních prohlížečích od jara 2025 (Baseline 2025) a v Node od verze 22. V ještě starším prostředí použij `[...iterátor]` a metody pole. Novější `Iterator.concat(a, b)`, které spojí víc iterovatelných hodnot za sebe, přibylo až v roce 2026.

:::check
Třída `Playlist` je iterovatelná přes generátor `*[Symbol.iterator]()`. Napiš výraz, který z instance `trip` vrátí pole prvních dvou písniček pomocí iterator helpers.

### --expected--

Iterator.from(trip).take(2).toArray()

### --accept--

trip[Symbol.iterator]().take(2).toArray()
[...Iterator.from(trip).take(2)]
Array.from(Iterator.from(trip).take(2))

### --why--

Instance sama iterátor není, jen umí iterátor vyrobit. `Iterator.from(trip)` nebo přímé zavolání `trip[Symbol.iterator]()` ho vrátí a na něm už `take` je.

### --see--

js-tridy-kolekce/iterator-helpers#iterator-from-helpers-pro-cokoli-iterovatelneho
:::

:::explain
Vysvětli vlastními slovy, proč `.map().filter().take(3)` nad iterátorem projde jen pár
hodnot, kdežto nad polem všechny.

## --model--
Metody pole vyrábějí **nové pole**: `map` projde celý vstup a vyrobí celý mezivýsledek,
`filter` nad ním udělá totéž, a teprve pak se z toho vezmou tři položky. U iterátoru se
nic nevyrábí dopředu — každá metoda jen zabalí ten předchozí a hodnotu si vyžádá, až si
o ni někdo řekne. Řetěz se proto protáčí **po jedné hodnotě** odzadu: `take(3)` si
vyžádá hodnotu, ta projde filtrem a mapou, a jakmile má tři, přestane se ptát. Tím pádem
řetěz funguje i nad nekonečnou posloupností a nad velkými daty ušetří paměť.

## --checklist--
- Metody pole vyrábějí celý mezivýsledek dopředu.
- Iterátorové metody hodnotu jen obalí a čekají na vyžádání.
- Řetěz se protáčí po jedné hodnotě, dokud odběratel chce.
- Proto zvládne i nekonečnou posloupnost a šetří paměť.
:::

## Typické chyby a pasti

### `map` na iterátoru nevrací pole

:::live js predict
```js
const prices = new Map([['Azul', 590], ['Dobble', 349]]);
const withVat = prices.values().map((price) => Math.round(price * 1.21));

console.log(withVat.length, withVat[0]);
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- undefined undefined
--why-- `map` na iterátoru vrátil zase iterátor, ne pole. Iterátor nemá `length` ani indexy — hodnoty z něj jdou jen postupně. Pole dostaneš až přes `.toArray()`.
:::

> [!PITFALL]
> **Výsledek `map`, `filter`, `take` a `drop` na iterátoru je iterátor.** Příznak: `length` a `[0]` vrací `undefined`, `JSON.stringify` vrátí `{}` a `toSorted is not a function`. Oprava: na konec řetězu přidej `.toArray()`.

### Kolekce není iterátor

:::live js predict
```js
const tags = new Set(['akce', 'novinka']);

try {
  console.log(tags.map((tag) => tag.toUpperCase()));
} catch (error) {
  console.log(error.message);
}
```
--question-- Co vypíše tenhle kód?
--expected-- tags.map is not a function
--why-- `Set` (stejně jako `Map`) je iterovatelný, ale sám iterátor není, takže helpers nemá. Iterátor vrátí `tags.values()` a na něm `map` je.
:::

> [!PITFALL]
> **`set.map`, `map.filter` nebo `set.take` hlásí `is not a function`.** Oprava: nejdřív si řekni o iterátor — `set.values()`, `map.keys()`, `map.entries()` nebo `Iterator.from(kolekce)`. Pole má vlastní `map` a `filter`, které vracejí pole; `take` a `drop` ale nemá, ty má až `array.values()`.

### Helper jde projít jen jednou

> [!PITFALL]
> **Iterátor z helpers se vyčerpá stejně jako generátor.** `const cheap = prices.values().filter((price) => price < 500);` dá při prvním `cheap.toArray()` hodnoty a při druhém prázdné pole. Oprava: výsledek si ulož jako pole (`const cheapList = cheap.toArray()`), nebo řetěz postav znovu.

:::check
Co vypíše poslední řádek?

```js
const stock = new Map([['Azul', 4], ['Dobble', 0], ['Krycí jména', 7]]);
const inStock = stock.values().filter((quantity) => quantity > 0);

console.log(inStock.toArray().length, inStock.toArray().length);
```

### --expected--

2 0

### --why--

První `toArray()` iterátor `inStock` vyčerpal a vrátil dvě hodnoty. Druhé volání dostane tentýž doběhlý iterátor, takže vrátí prázdné pole.

### --see--

js-tridy-kolekce/iterator-helpers#helper-jde-projit-jen-jednou
:::

Tím je sekce u konce. Zbývá [kvíz](see:js-tridy-kolekce/kviz), ve kterém si ověříš třídy, prototypy i kolekce na cizím kódu.

## Kde to najdeš v MDN

- [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator) — přehled všech helpers; u každého je stav podpory, protože některé (třeba `Iterator.concat`) jsou novější.
- [Iterator.prototype.take()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/take) — příklad s nekonečným generátorem a co se stane s iterátorem po posledním `take`.
- [Iterator.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/from) — obalení iterátoru bez helpers a iterovatelných hodnot.
- [Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) — iterable a iterator, na kterých helpers stojí.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function* scores() {
  yield 12;
  yield 48;
  yield 31;
  yield 55;
}

console.log(scores().drop(1).filter((score) => score > 40).toArray().join(','));
```

### --expected--

48,55

### --why--

`drop(1)` přeskočí `12`, `filter` z `48`, `31` a `55` pustí jen hodnoty nad 40. Každý nový zavolaný `scores()` je nový generátor, takže se nic nevyčerpalo předem.

### --see--

js-tridy-kolekce/iterator-helpers#metody-pole-primo-na-iteratoru

## --question--

Data máš v poli `orders` s tisíci objednávek a potřebuješ je seřadit podle ceny a vzít prvních deset. Co je nejrozumnější?

### --answer--

`orders.values().toSorted((a, b) => a.price - b.price).take(10).toArray()`

#### --why--

Iterátor `toSorted` nemá. Seřadit hodnoty jde, jen když je máš všechny najednou, a to umí pole.

### --correct--

`orders.toSorted((a, b) => a.price - b.price).slice(0, 10)`

#### --why--

Řazení stejně potřebuje všechny položky najednou a data už v poli jsou. Iterator helpers pomáhají, když data pole nejsou (mapa, generátor) nebo když chceš skončit dřív.

### --answer--

`Iterator.from(orders).take(10).toArray()` a teprve pak seřadit.

#### --why--

Tak by ses seřazení dočkal jen u prvních deseti objednávek v původním pořadí, ne u deseti nejlevnějších.

### --see--

js-tridy-kolekce/iterator-helpers#line-zpracovani-hodnoty-tecou-po-jedne

## --question--

Co vypíše poslední řádek?

```js
const visits = new Map([['/kosik', 3], ['/', 10], ['/kontakt', 1]]);
const total = visits.values().reduce((sum, count) => sum + count, 0);
const pages = visits.keys().filter((page) => page !== '/');

console.log(total, pages.toArray().length);
```

### --expected--

14 2

### --why--

`reduce` na iterátoru hodnot sečte `3 + 10 + 1` bez mezipole. `filter` na iterátoru klíčů pustí dvě stránky a `toArray` z nich udělá pole se dvěma položkami.

### --see--

js-tridy-kolekce/iterator-helpers#metody-pole-primo-na-iteratoru
