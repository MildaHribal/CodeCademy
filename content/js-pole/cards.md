## --card-- output

Co vypíše tenhle kód?

```js
const numbers = [3, 1, 2];
const sorted = numbers.sort();
console.log(numbers === sorted);
```

### --expected--

true

### --why--

Myslíš si, že `sort` vrací seřazenou kopii? Řadí pole na místě a vrací totéž pole. Kopii vrací `toSorted`.

### --see--

js-pole/co-je-pole#metody-ktere-pole-meni-a-metody-ktere-vraceji-nove

## --card-- output

Co vypíše tenhle kód?

```js
console.log([5, 40, 300].sort());
```

### --expected--

[300, 40, 5]

### --why--

Bez porovnávací funkce `sort` řadí položky jako text, znak po znaku: `'300'` < `'40'` < `'5'`, protože rozhoduje první znak. Čísla seřadí `(a, b) => a - b`.

### --see--

js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce

## --card-- output

Co vypíše tenhle kód?

```js
console.log(['1', '2', '3'].map(parseInt));
```

### --expected--

[1, NaN, NaN]

### --why--

`map` volá callback i s indexem a `parseInt` ho bere jako číselnou soustavu: `parseInt('2', 1)` je `NaN`. Oprava: `map((text) => parseInt(text, 10))`.

### --see--

js-pole/metody-pole-do-hloubky#predani-funkce-ktera-bere-vic-argumentu

## --card-- output

Co vypíše tenhle kód?

```js
const runs = [{ km: 5 }, { km: 3 }];
console.log(runs.reduce((sum, run) => sum + run.km));
```

### --expected--

[object Object]3

### --why--

Bez počáteční hodnoty je první akumulátor celý objekt `{ km: 5 }` a `objekt + 3` spojí text `[object Object]` s číslem. Oprava: `reduce(…, 0)`.

### --see--

js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty

## --card-- output

Co vypíše tenhle kód?

```js
const fruits = ['jablko', 'hruška'];
console.log(fruits.indexOf('jablko') ? 'mám jablko' : 'nemám jablko');
```

### --expected--

nemám jablko

### --why--

`indexOf` vrátí `0` a nula je v podmínce nepravda. Na otázku ano/ne patří `includes`, nebo porovnání s `-1`.

### --see--

js-pole/co-je-pole#indexof-v-podmince

## --card-- output

Co vypíše tenhle kód?

```js
const items = [1, 2, 3];
console.log(items.at(-1), items[3]);
```

### --expected--

3 undefined

### --why--

`at(-1)` počítá od konce. Index `3` je až za poslední položkou (ta má index `length - 1`) a čtení mimo pole vrací `undefined`, nespadne.

### --see--

js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot

## --card-- output

Co vypíše tenhle kód?

```js
const a = [1, 2];
const b = a;
b.push(3);
console.log(a.length);
```

### --expected--

3

### --why--

`const b = a` zkopíruje odkaz, ne pole. `a` i `b` ukazují na jedno pole, takže `push` přes `b` je vidět i přes `a`.

### --see--

js-pole/co-je-pole#promenna-neobsahuje-pole-ale-odkaz-na-nej

## --card-- output

Co vypíše tenhle kód?

```js
const tasks = [{ done: false }];
const copy = [...tasks];
copy[0].done = true;
console.log(tasks[0].done);
```

### --expected--

true

### --why--

`[...tasks]` je mělká kopie: nové pole, ale se stejnými objekty uvnitř. Změna `copy[0]` mění i `tasks[0]`.

### --see--

js-pole/co-je-pole#melka-kopie

## --card-- output

Co vypíše tenhle kód?

```js
console.log(['a', 'bb', 'ccc'].filter((word) => { word.length > 1 }));
```

### --expected--

[]

### --why--

Se složenými závorkami je `word.length > 1` jen příkaz v těle funkce. Callback vrací `undefined`, tedy nepravdu, a `filter` nepropustí nic.

### --see--

js-pole/metody-pole-do-hloubky#zapomenuty-return-ve-slozenych-zavorkach

## --card-- output

Co vypíše tenhle kód?

```js
console.log([].every((n) => n > 0), [].some((n) => n > 0));
```

### --expected--

true false

### --why--

V prázdném poli není žádná položka, která by podmínku porušila (`every` → `true`), ani žádná, která by ji splnila (`some` → `false`).

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

## --card-- output

Co vypíše tenhle kód?

```js
const queue = ['a', 'b', 'c', 'd'];
const served = queue.splice(1, 2);
console.log(queue, served);
```

### --expected--

['a', 'd'] ['b', 'c']

### --why--

`splice(1, 2)` vyřízne z původního pole dvě položky od indexu 1 a vrátí je. Původní pole se zkrátí. Nemutující dvojče je `toSpliced`.

### --see--

js-pole/co-je-pole#slice-a-splice

## --card-- output

Co vypíše tenhle kód?

```js
console.log(typeof [], Array.isArray([]));
```

### --expected--

object true

### --why--

Pole je zvláštní druh objektu, takže `typeof` vrátí `'object'`. Jestli je hodnota pole, zjistí `Array.isArray`.

### --see--

js-pole/co-je-pole#typeof-pole-je-object

## --card-- output

Co vypíše tenhle kód?

```js
console.log([2, 15, 30].find((n) => n > 10));
```

### --expected--

15

### --why--

`find` vrátí první vyhovující položku samotnou, ne pole, a dál nehledá. Všechny vyhovující v poli by vrátil `filter`.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

## --card-- code js

Napiš funkci `last(items)`, která vrátí poslední položku pole (u prázdného pole `undefined`) a pole nezmění.

### --seed--

```js
function last(items) {
}
```

### --test--

```js
const items = [1, 2, 3];
assert.equal(last(items), 3, 'last([1, 2, 3]) má vrátit 3');
assert.equal(items.length, 3, 'last([1, 2, 3]) nesmí z pole nic odebrat');
assert.equal(last([]), undefined, 'last([]) má vrátit undefined');
```

### --solution--

```js
function last(items) {
  return items.at(-1);
}
```

### --see--

js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot

## --card-- code js

Napiš funkci `ascending(numbers)`, která vrátí **nové** pole čísel seřazených od nejmenšího a původní pole nechá v původním pořadí.

### --seed--

```js
function ascending(numbers) {
}
```

### --test--

```js
const numbers = [9, 100, 25];
assert.deepEqual(ascending(numbers), [9, 25, 100], 'ascending([9, 100, 25]) má vrátit [9, 25, 100] — čísla, ne text');
assert.deepEqual(numbers, [9, 100, 25], 'ascending([9, 100, 25]) nesmí přerovnat původní pole');
```

### --solution--

```js
function ascending(numbers) {
  return numbers.toSorted((a, b) => a - b);
}
```

### --see--

js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce

## --card-- code js

Napiš funkci `totalPages(books)`, která přes `reduce` sečte `pages` všech knih. Prázdné pole vrátí `0`.

### --seed--

```js
function totalPages(books) {
}
```

### --test--

```js
assert.equal(totalPages([{ pages: 280 }, { pages: 310 }]), 590, 'totalPages([280 stran, 310 stran]) má vrátit 590');
assert.equal(totalPages([]), 0, 'totalPages([]) má vrátit 0 — dostal reduce počáteční hodnotu?');
```

### --solution--

```js
function totalPages(books) {
  return books.reduce((sum, book) => sum + book.pages, 0);
}
```

### --see--

js-pole/metody-pole-do-hloubky#jak-pracuje-reduce

## --card-- code js

Napiš funkci `countWords(words)`, která vrátí objekt, kde klíčem je slovo a hodnotou počet jeho výskytů v poli.

### --seed--

```js
function countWords(words) {
}
```

### --test--

```js
assert.deepEqual(countWords(['ano', 'ne', 'ano']), { ano: 2, ne: 1 }, "countWords(['ano', 'ne', 'ano']) má vrátit { ano: 2, ne: 1 }");
assert.deepEqual(countWords([]), {}, 'countWords([]) má vrátit prázdný objekt {}');
```

### --solution--

```js
function countWords(words) {
  return words.reduce((counts, word) => {
    counts[word] = (counts[word] ?? 0) + 1;
    return counts;
  }, {});
}
```

### --see--

js-pole/metody-pole-do-hloubky#akumulator-nemusi-byt-cislo

## --card-- code js

Napiš funkci `withoutAt(items, index)`, která vrátí nové pole bez položky na indexu `index` a původní pole nezmění.

### --seed--

```js
function withoutAt(items, index) {
}
```

### --test--

```js
const items = ['a', 'b', 'c'];
assert.deepEqual(withoutAt(items, 1), ['a', 'c'], "withoutAt(['a', 'b', 'c'], 1) má vrátit ['a', 'c']");
assert.deepEqual(items, ['a', 'b', 'c'], "withoutAt(['a', 'b', 'c'], 1) nesmí měnit původní pole");
```

### --solution--

```js
function withoutAt(items, index) {
  return items.toSpliced(index, 1);
}
```

### --see--

js-pole/co-je-pole#slice-a-splice

## --card-- code js

Napiš funkci `markDone(tasks, id)`, která vrátí nové pole, ve kterém má úkol s daným `id` hodnotu `done: true`. Původní pole ani objekty úkolů se nesmí změnit.

### --seed--

```js
function markDone(tasks, id) {
}
```

### --test--

```js
const wash = { id: 1, title: 'Umýt nádobí', done: false };
const shop = { id: 2, title: 'Nakoupit', done: false };
const result = markDone([wash, shop], 2);
assert.deepEqual(result, [wash, { id: 2, title: 'Nakoupit', done: true }], 'markDone([Umýt nádobí, Nakoupit], 2) má označit jen úkol s id 2');
assert.equal(shop.done, false, 'markDone nesmí změnit původní objekt úkolu — vrať nový objekt');
```

### --solution--

```js
function markDone(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: true } : task));
}
```

### --see--

js-pole/metody-pole-do-hloubky#mutace-uvnitr-map

## --card-- free

Jaký je rozdíl mezi `map` a `forEach`? Kdy použiješ který?

### --back--

`map` zavolá callback pro každou položku a z vrácených hodnot postaví nové pole stejné délky. `forEach` callback taky zavolá pro každou položku, ale vrácené hodnoty zahodí a sám vrací `undefined`. `map` je proto na přetváření dat (z pole produktů pole názvů), `forEach` na vedlejší efekty (vypsat, odeslat). `map`, jehož výsledek nikdo nepoužije, je signál, že patří `forEach` nebo `for…of`. Ani jeden neumí skončit dřív ani počkat na `await`.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

## --card-- free

Proč jde do pole deklarovaného přes `const` přidávat položky?

### --back--

`const` zakazuje jen nové přiřazení do proměnné — proměnná musí pořád ukazovat na totéž pole. Obsah pole je dál změnitelný: `push`, `tags[0] = …` i `sort` projdou. Chybu `TypeError: Assignment to constant variable.` vyhodí až `tags = []`. Neměnnost obsahu `const` nezaručuje; tu musí zajistit kód, který pole nemutuje.

### --see--

js-pole/co-je-pole#proc-jde-menit-pole-v-const

## --card-- free

Co je mělká kopie pole a kdy nestačí?

### --back--

Mělká kopie (`[...items]`, `items.slice()`) vytvoří nové pole, ale do něj dá tytéž odkazy na objekty. Stačí, když chceš přidat, odebrat nebo přerovnat položky, aniž by se změnilo původní pole. Nestačí, když chceš změnit objekt uvnitř: `copy[0].quantity = 5` změní i originál. Pak musíš vytvořit nový objekt pro měněnou položku, třeba `items.map((item) => (item.id === id ? { ...item, quantity: 5 } : item))`.

### --see--

js-pole/co-je-pole#melka-kopie

## --card-- free

Proč se u `reduce` píše vždycky počáteční hodnota?

### --back--

Počáteční hodnota je akumulátor pro první volání a určuje typ výsledku. Bez ní `reduce` vezme jako akumulátor první položku pole a začne od druhé. U pole čísel to náhodou vyjde, u pole objektů vznikne nesmysl typu `[object Object]250` a nad prázdným polem kód spadne na `TypeError: Reduce of empty array with no initial value`. S počáteční hodnotou vrátí prázdné pole právě ji.

### --see--

js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty

## --card-- free

Kdy napíšeš raději cyklus `for…of` než řetěz metod pole?

### --back--

Když potřebuješ průchod ukončit dřív (`break`, `continue`), když v jednom průchodu počítáš víc výsledků najednou a `reduce` s objektem by byl nečitelný, a když uvnitř postupně čekáš přes `await` — `forEach` na sliby nečeká. Metody vyhrávají, když přetváříš data na nové pole nebo jednu hodnotu, protože jméno metody říká, co se děje. Výkon u běžných polí o stovkách položek rozhodovat nemá.

### --see--

js-pole/metody-pole-do-hloubky#kdy-metody-a-kdy-for-of

## --card-- free

Proč by funkce, která dostane pole, neměla měnit (mutovat) jeho obsah?

### --back--

Parametr drží jen odkaz na pole volajícího, takže změna je vidět všude, kde se s polem pracuje: v jiné části stránky, v uloženém stavu pro tlačítko Zpět, v dalších výpočtech. Chyba se pak projeví daleko od místa, kde vznikla, a těžko se hledá. Frameworky navíc poznávají změnu podle toho, že vznikl nový objekt nebo pole. Proto funkce vrací nové pole (`toSorted`, `toSpliced`, `map`, `[...items, item]`) a původní nechá být.

### --see--

js-pole/co-je-pole#mutace-pole-z-parametru

## --card-- free

Co vrací porovnávací funkce pro `sort` a `toSorted` a jak seřadíš čísla sestupně?

### --back--

Porovnávací funkce dostane dvě položky `a` a `b` a vrací záporné číslo, když `a` patří před `b`, kladné, když za `b`, a nulu, když je pořadí jedno. Pro čísla vzestupně stačí `(a, b) => a - b`, sestupně `(a, b) => b - a`. Texty se porovnávají přes `a.localeCompare(b, 'cs')`. Bez porovnávací funkce se řadí jako text, takže `[9, 100, 25]` skončí jako `[100, 25, 9]`.

### --see--

js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce
