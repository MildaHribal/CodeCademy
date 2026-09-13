---
pass: 0.8
---

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function markAllBought(items) {
  return items.map((item) => {
    item.bought = true;
    return item;
  });
}

const list = [{ name: 'Káva', bought: false }];
const result = markAllBought(list);
console.log(list[0].bought, result === list);
```

### --expected--

true false

### --why--

`map` vrací nové pole (`result === list` je `false`), ale callback dostává tytéž objekty, které jsou v `list`, a přímo jim přepisuje `bought`. Nové je jen pole, ne položky. Bez mutace by callback vracel `({ ...item, bought: true })`.

### --see--

js-pole/metody-pole-do-hloubky#mutace-uvnitr-map

## --question--

Co vypíše tenhle kód?

```js
console.log([25, 100, 9].sort());
```

### --expected--

[100, 25, 9]

### --why--

Bez porovnávací funkce `sort` převede čísla na text a řadí je znak po znaku: `'100'` < `'25'` < `'9'`. Čísla seřadí `sort((a, b) => a - b)`.

### --see--

js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce

## --question--

Co vypíše tenhle kód?

```js
const prices = [30, 10, 20];
const sorted = prices.toSorted((a, b) => a - b);
console.log(prices, sorted);
```

### --correct--

`[30, 10, 20] [10, 20, 30]`

#### --why--

`toSorted` vrátí seřazenou kopii a původní pole nechá v původním pořadí.

### --answer--

`[10, 20, 30] [10, 20, 30]`

#### --why--

Takhle by to dopadlo se `sort`, který řadí na místě. Který z nich vrací kopii?

### --answer--

`[30, 10, 20] [30, 20, 10]`

#### --why--

Rozmysli si, co vrací `a - b`, když je `a` menší: záporné číslo znamená „`a` patří dopředu".

### --see--

js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce

## --question--

Co vypíše tenhle kód?

```js
const users = [{ id: 1 }, { id: 2 }];
console.log(users.find((u) => u.id === 3), users.findIndex((u) => u.id === 3));
```

### --expected--

undefined -1

### --why--

Nenalezený `find` vrací `undefined`, nenalezený `findIndex` vrací `-1`. Proto se výsledek `findIndex` porovnává s `-1`, ne dosazuje do `if`.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

## --question--

Co vypíše tenhle kód?

```js
console.log([].some((n) => n > 5), [].every((n) => n > 5));
```

### --expected--

false true

### --why--

`some` hledá aspoň jednu vyhovující položku — žádná není, takže `false`. `every` hledá aspoň jednu nevyhovující — taky žádná není, takže `true`.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

## --question--

Co se stane při spuštění tohoto kódu?

```js
const total = [].reduce((sum, n) => sum + n);
console.log(total);
```

### --answer--

Vypíše `0`.

#### --why--

Odkud by se nula vzala? Bez druhého argumentu `reduce` žádnou počáteční hodnotu nemá.

### --answer--

Vypíše `undefined`.

#### --why--

Nad prázdným polem bez počáteční hodnoty `reduce` k vrácení výsledku vůbec nedojde.

### --correct--

Vyhodí `TypeError: Reduce of empty array with no initial value`.

#### --why--

Bez počáteční hodnoty bere `reduce` jako akumulátor první položku. Prázdné pole žádnou nemá, a tak skončí chybou.

### --see--

js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty

## --question--

Co vypíše tenhle kód?

```js
const numbers = [1, 2, 3, 4, 5];
const removed = numbers.splice(1, 2);
console.log(numbers, removed);
```

### --expected--

[1, 4, 5] [2, 3]

### --why--

`splice(1, 2)` odebere od indexu 1 dvě položky, vrátí je v novém poli a původní pole zkrátí. Index 1 je druhá položka a druhý argument je počet, ne koncový index.

### --see--

js-pole/co-je-pole#slice-a-splice

## --question--

Co vypíše tenhle kód?

```js
console.log([1, 2] === [1, 2], [1, 2].includes(2));
```

### --answer--

`true true`

#### --why--

`===` u polí neporovnává obsah. Ptá se, jestli jde o totéž pole.

### --correct--

`false true`

#### --why--

Dvě pole zapsaná zvlášť jsou dva různé objekty, i když mají stejný obsah. `includes` porovnává jednotlivé položky a číslo `2` najde.

### --answer--

`false false`

#### --why--

`includes(2)` hledá hodnotu `2` mezi položkami přes `===` — a čísla se přes `===` porovnávají hodnotou.

### --see--

js-pole/co-je-pole#porovnani-dvou-poli

## --question--

Co vypíše tenhle kód?

```js
const settings = { theme: 'light', fontSize: 16 };
const draft = { ...settings };
draft.theme = 'dark';
console.log(settings.theme);
```

### --expected--

light

### --accept--

'light'

### --why--

`{ ...settings }` vytvoří nový objekt se zkopírovanými klíči. Přepsání `draft.theme` se originálu netýká. Sdílené by zůstaly jen objekty uvnitř (mělká kopie) — tady jsou všechny hodnoty primitivní.

### --see--

js-pole/co-je-pole#melka-kopie

## --question--

Co vypíše tenhle kód?

```js
const result = [1, 2, 3].forEach((n) => n * 2);
console.log(result);
```

### --expected--

undefined

### --why--

`forEach` hodnoty z callbacku zahazuje a sám nevrací nic. Nové pole by vrátil `map`.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

## --question--

Co vypíše tenhle kód?

```js
const letters = ['a', 'b', 'c'];
console.log(letters[3], letters.at(-1), letters.length);
```

### --expected--

undefined c 3

### --accept--

undefined 'c' 3

### --why--

Index `3` neexistuje (poslední je `2`), takže `undefined` — čtení mimo pole nespadne. `at(-1)` počítá od konce a vrátí `'c'`.

### --see--

js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot

## --question--

Co vypíše tenhle kód?

```js
const votes = ['ano', 'ne', 'ano', 'ano'];
const counts = votes.reduce((result, vote) => {
  result[vote] = (result[vote] ?? 0) + 1;
  return result;
}, {});
console.log(counts);
```

### --answer--

`4`

#### --why--

Akumulátor začíná jako prázdný objekt a callback do něj jen přidává klíče. Jakého typu pak bude výsledek?

### --answer--

`{ ano: NaN, ne: NaN }`

#### --why--

`NaN` by vyšlo bez `?? 0`. Co s `undefined` udělá `?? 0` při prvním hlasu?

### --correct--

`{ ano: 3, ne: 1 }`

#### --why--

Při prvním hlasu pro možnost je klíč `undefined`, `?? 0` z něj udělá `0` a přičte se `1`. Callback akumulátor vrací, takže ho další volání dostane i s dosavadními počty.

### --see--

js-pole/metody-pole-do-hloubky#akumulator-nemusi-byt-cislo

## --question--

Najdi v anglické dokumentaci MDN stránku **Array.prototype.flat()**. Jaká je výchozí hodnota jejího parametru `depth`? Napiš jen číslo.

### --expected--

1

### --why--

V části *Parameters* stojí u `depth`: „Defaults to 1". `[1, [2, [3]]].flat()` proto rozbalí jen jednu úroveň a vrátí `[1, 2, [3]]`. Stejně rychle najdeš v MDN u každé metody, co vrací (*Return value*) a jestli mění původní pole.

### --see--

js-pole/co-je-pole#kde-to-najdes-v-mdn

# --code-- Sklad e-shopu s čajem

## --file-- sklad.js

```js
// Sklad e-shopu s čajem: kód, název, kusy na skladě, cena.
let products = [
  { code: 'C1', title: 'Zelený čaj', stock: 12, price: 129 },
  { code: 'C2', title: 'Černý čaj', stock: 3, price: 99 },
  { code: 'C3', title: 'Rooibos', stock: 0, price: 149 },
  { code: 'C4', title: 'Maté', stock: 7, price: 179 },
  { code: 'C5', title: 'Heřmánek', stock: 2, price: 59 },
];

function lowStockTitles(list, limit) {
  let titles = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].stock <= limit) {
      titles.push(list[i].title);
    }
  }
  return titles;
}

function stockValue(list) {
  let total = 0;
  for (let i = 0; i <= list.length - 1; i++) {
    total = total + list[i].stock * list[i].price;
  }
  return total;
}

function cheapestFirst(list) {
  return list.sort(function (a, b) {
    return a.price - b.price;
  });
}

function findByCode(list, code) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].code === code) {
      return list[i];
    }
  }
}

function sell(list, code, amount) {
  let product = findByCode(list, code);
  if (product === undefined) {
    return false;
  }
  if (product.stock < amount) {
    return false;
  }
  product.stock = product.stock - amount;
  return true;
}

function restock(list, code, amount) {
  let result = [];
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    if (item.code === code) {
      item = { ...item, stock: item.stock + amount };
    }
    result.push(item);
  }
  return result;
}

function lastProduct(list) {
  return list[list.length];
}

let before = products[0];
let sorted = cheapestFirst(products);
console.log(products[0].title, before === products[0]);
console.log(lowStockTitles(products, 3));
console.log(stockValue(products));
console.log(sell(products, 'C4', 2), findByCode(products, 'C4').stock);
let restocked = restock(products, 'C3', 10);
console.log(products === restocked, findByCode(products, 'C3').stock);
console.log(lastProduct(products));
```

## --question--

Co vypíše řádek 72?

### --expected--

Heřmánek false

### --why--

`cheapestFirst` na řádku 29 volá `sort` přímo na poli z parametru, takže přerovná `products`. Na indexu 0 je pak nejlevnější Heřmánek, zatímco `before` pořád ukazuje na Zelený čaj — proto `false`.

### --see--

js-pole/co-je-pole#mutace-pole-z-parametru

## --question--

Co vypíše řádek 73? Napiš pole tak, jak ho vypíše konzole.

### --expected--

['Heřmánek', 'Černý čaj', 'Rooibos']

### --why--

`lowStockTitles` prochází pole v aktuálním pořadí — a to už řádek 71 přerovnal podle ceny (Heřmánek 59, Černý čaj 99, Zelený čaj 129, Rooibos 149, Maté 179). Z nich mají nejvýš 3 kusy Heřmánek, Černý čaj a Rooibos.

### --see--

js-pole/co-je-pole#mutace-pole-z-parametru

## --question--

Funkce `sell` na řádku 50 přepíše `product.stock`. Změní se tím i pole `products`?

### --answer--

Ne, `findByCode` vrací kopii produktu.

#### --why--

Podívej se na řádek 37: vrací se `list[i]`, ne nový objekt.

### --correct--

Ano, `findByCode` vrací tentýž objekt, který leží v poli.

#### --why--

`return list[i]` vrací odkaz na objekt v `products`. Zápis do `product.stock` proto mění produkt přímo ve skladu — řádek 75 vypíše `true 5`.

### --answer--

Ne, protože `product` je deklarovaný přes `let`.

#### --why--

`let` ani `const` neurčují, jestli je objekt kopie. Rozhoduje, odkud se objekt vzal.

### --see--

js-pole/co-je-pole#promenna-neobsahuje-pole-ale-odkaz-na-nej

## --question--

Co vypíše řádek 77?

### --expected--

false 0

### --why--

`restock` skládá nové pole `result` (řádek 55), takže `products === restocked` je `false`. Rooibos v něm dostane nový objekt se zásobou 10 (řádek 59), ale `findByCode(products, …)` hledá v původním poli, kde má Rooibos pořád `0`.

### --see--

js-pole/co-je-pole#melka-kopie

## --question--

Funkce `lastProduct` na řádku 67 vždycky vrátí `undefined`. Proč?

### --answer--

Pole `products` je deklarované přes `let`, a proto nemá poslední položku.

#### --why--

Způsob deklarace proměnné na obsah pole nemá vliv. Podívej se na index v hranatých závorkách.

### --correct--

Index `list.length` je za koncem pole; poslední položka má index `list.length - 1`.

#### --why--

Indexy začínají nulou, takže u pěti produktů je poslední na indexu `4`. Oprava je `list[list.length - 1]` nebo `list.at(-1)`.

### --answer--

`sort` na řádku 71 poslední položku z pole odebral.

#### --why--

`sort` pořadí mění, ale počet položek ne. Co vrací čtení na indexu, který v poli není?

### --see--

js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot
