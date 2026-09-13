---
pass: 0.8
---

## --question--

Co vypíše tento kód?

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

### --answer--

`false false`

#### --why--

`map` sice vrací nové pole, ale callback dostává tytéž objekty, které jsou v `list`, a přímo jim přepisuje `bought`. Nové je jen pole, ne položky.

### --correct--

`true false`

#### --why--

Výsledek je nové pole (`result !== list`), ale callback zmutoval původní objekty. Bez mutace by vracel nový objekt: `({ ...item, bought: true })`.

### --answer--

`true true`

#### --why--

`map` vždycky vytvoří nové pole, takže `result === list` je `false`. Pravdu máš jen v tom, že se původní položka změnila.

## --question--

Co vypíše tento kód?

```js
console.log([10, 9, 1].sort());
```

### --answer--

`[1, 9, 10]`

#### --why--

Tak by to seřadil comparator `(a, b) => a - b`. Bez něj `sort` převede čísla na text a řadí abecedně.

### --correct--

`[1, 10, 9]`

#### --why--

Jako texty se porovnává znak po znaku: `'1'` < `'10'` (kratší s tímže začátkem je dřív) < `'9'`, protože `'1'` je před `'9'`.

### --answer--

`[10, 9, 1]`

#### --why--

`sort` pole opravdu přerovná, jen podle textového pořadí, ne číselného.

## --question--

Co vypíše tento kód?

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

Takhle by to dopadlo se `sort`, který řadí na místě. `toSorted` původní pole nemění.

### --answer--

`[30, 10, 20] [30, 20, 10]`

#### --why--

`a - b` řadí vzestupně. Sestupně by bylo `b - a`.

## --question--

Co vypíše tento kód?

```js
const doubled = [1, 2, 3].map((n) => { n * 2 });
console.log(doubled);
```

### --answer--

`[2, 4, 6]`

#### --why--

Složené závorky za šipkou jsou tělo funkce. Bez `return` callback nic nevrací.

### --correct--

`[undefined, undefined, undefined]`

#### --why--

Každé volání callbacku vrátí `undefined` a `map` z těch výsledků poskládá pole stejné délky.

### --answer--

`[]`

#### --why--

Prázdné pole by vrátil `filter`, kterému callback vrací nepravdu. `map` vrací vždycky pole stejné délky jako původní.

## --question--

Co vypíše tento kód?

```js
const fruits = ['jablko', 'hruška'];

if (fruits.indexOf('jablko')) {
  console.log('mám jablko');
} else {
  console.log('nemám jablko');
}
```

### --answer--

`mám jablko`

#### --why--

`indexOf` nevrací `true`/`false`, ale index. Jablko je na indexu `0`, a nula je v podmínce nepravda.

### --correct--

`nemám jablko`

#### --why--

`indexOf` vrátí `0`, podmínka je nepravdivá a spustí se `else`. Na otázku ano/ne patří `includes`, nebo porovnání `indexOf(…) !== -1`.

## --question--

Co vypíše tento kód?

```js
console.log([].some((n) => n > 5), [].every((n) => n > 5));
```

### --answer--

`false false`

#### --why--

`every` nad prázdným polem vrací `true`: není tam žádná položka, která by podmínku porušila.

### --answer--

`true true`

#### --why--

`some` nad prázdným polem vrací `false`: není tam žádná položka, která by podmínku splnila.

### --correct--

`false true`

#### --why--

`some` hledá aspoň jednu vyhovující položku (žádná není), `every` hledá aspoň jednu nevyhovující (taky žádná není).

## --question--

Co vypíše tento kód?

```js
const users = [{ id: 1 }, { id: 2 }];
console.log(users.find((u) => u.id === 3), users.findIndex((u) => u.id === 3));
```

### --correct--

`undefined -1`

#### --why--

Nenalezený `find` vrací `undefined`, nenalezený `findIndex` vrací `-1`.

### --answer--

`null -1`

#### --why--

`find` nikdy nevrací `null`. Když nic nenajde, vrátí `undefined`.

### --answer--

`undefined undefined`

#### --why--

`findIndex` vrací číslo i v případě, že nic nenajde — konkrétně `-1`.

## --question--

Co se stane při spuštění tohoto kódu?

```js
const total = [].reduce((sum, n) => sum + n);
console.log(total);
```

### --answer--

Vypíše `0`.

#### --why--

`0` by vyšla jen s počáteční hodnotou: `reduce((sum, n) => sum + n, 0)`. Bez ní nemá `reduce` s čím začít.

### --answer--

Vypíše `undefined`.

#### --why--

`reduce` bez počáteční hodnoty nad prázdným polem nic nevrací — rovnou vyhodí chybu.

### --correct--

Vyhodí `TypeError: Reduce of empty array with no initial value`.

#### --why--

Bez počáteční hodnoty bere `reduce` jako akumulátor první položku. Prázdné pole žádnou nemá, a tak skončí chybou.

## --question--

Co vypíše tento kód?

```js
const numbers = [1, 2, 3, 4, 5];
const removed = numbers.splice(1, 2);
console.log(numbers, removed);
```

### --answer--

`[1, 2, 3, 4, 5] [2, 3]`

#### --why--

Tak by se choval `slice(1, 3)`. `splice` položky z původního pole vyřízne.

### --correct--

`[1, 4, 5] [2, 3]`

#### --why--

`splice(1, 2)` odebere od indexu 1 dvě položky, vrátí je v novém poli a původní pole zkrátí.

### --answer--

`[1, 2, 5] [3, 4]`

#### --why--

Index 1 je druhá položka (číslo `2`), protože indexy se počítají od nuly. A druhý argument `splice` je počet položek, ne koncový index.

## --question--

Co vypíše tento kód?

```js
console.log([1, 2] === [1, 2], [1, 2].includes(2));
```

### --answer--

`true true`

#### --why--

`===` u polí neporovnává obsah. Ptá se, jestli jde o totéž pole, a tady vznikla dvě různá.

### --correct--

`false true`

#### --why--

Dvě pole zapsaná zvlášť jsou dva různé objekty, i když mají stejný obsah. `includes` porovnává jednotlivé položky a číslo `2` najde.

### --answer--

`false false`

#### --why--

`includes(2)` hledá hodnotu `2` mezi položkami a ta v poli je.

## --question--

Co vypíše tento kód?

```js
const cart = [{ name: 'Káva', quantity: 1 }];
const copy = [...cart];
copy[0].quantity = 3;
console.log(cart[0].quantity);
```

### --answer--

`1`

#### --why--

`[...cart]` je mělká kopie. Nové je jen pole, objekt v něm je v obou polích tentýž.

### --correct--

`3`

#### --why--

`copy[0]` a `cart[0]` jsou jeden a tentýž objekt. Aby se původní položka nezměnila, musel bys vytvořit nový objekt: `{ ...copy[0], quantity: 3 }`.

## --question--

Co vypíše tento kód?

```js
const result = [1, 2, 3].forEach((n) => n * 2);
console.log(result);
```

### --answer--

`[2, 4, 6]`

#### --why--

Tohle by vrátil `map`. `forEach` hodnoty z callbacku zahazuje.

### --answer--

`[1, 2, 3]`

#### --why--

`forEach` nevrací ani původní pole.

### --correct--

`undefined`

#### --why--

`forEach` nevrací nic. Slouží k tomu, abys s každou položkou něco udělal, ne abys z pole něco vyrobil.

## --question--

Co vypíše tento kód?

```js
const letters = ['a', 'b', 'c'];
console.log(letters[3], letters.at(-1), letters.length);
```

### --correct--

`undefined c 3`

#### --why--

Index `3` neexistuje (poslední je `2`), takže `undefined`. `at(-1)` počítá od konce a vrátí `'c'`.

### --answer--

`c c 3`

#### --why--

Indexy začínají nulou, `'c'` je na indexu `2`. Index `3` je už mimo pole.

### --answer--

Vyhodí chybu, protože index `3` je mimo pole.

#### --why--

Čtení mimo rozsah pole chybu nevyhodí, vrátí `undefined`. Proto se takové chyby hledají tak špatně.

## --question--

Co vypíše tento kód?

```js
const words = ['kočka', 'pes', 'slon'];
const result = words
  .filter((word) => word.length > 3)
  .map((word) => word.toUpperCase());
console.log(result, words);
```

### --answer--

`['KOČKA', 'SLON'] ['KOČKA', 'SLON']`

#### --why--

`filter` ani `map` původní pole nemění. `words` zůstane, jak bylo.

### --correct--

`['KOČKA', 'SLON'] ['kočka', 'pes', 'slon']`

#### --why--

`filter` vybere slova delší než tři znaky, `map` je převede na velká písmena. Obě metody vracejí nová pole.

### --answer--

`['KOČKA', 'PES', 'SLON'] ['kočka', 'pes', 'slon']`

#### --why--

`'pes'` má přesně tři znaky a podmínka je `> 3`, takže ho `filter` nepropustí.

## --question--

Co vypíše tento kód?

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

Akumulátor začíná jako prázdný objekt `{}` a callback do něj jen přidává klíče, takže `reduce` vrátí objekt, ne číslo.

### --answer--

`{ ano: NaN, ne: NaN }`

#### --why--

`NaN` by vyšlo bez `?? 0`: poprvé je `result[vote]` `undefined` a `undefined + 1` je `NaN`. Tady ale `?? 0` z `undefined` udělá nulu.

### --correct--

`{ ano: 3, ne: 1 }`

#### --why--

Při prvním hlasu pro nějakou možnost je klíč `undefined`, `?? 0` z něj udělá `0` a přičte se `1`. Callback akumulátor vrací, takže ho další volání dostane i s dosavadními počty.
