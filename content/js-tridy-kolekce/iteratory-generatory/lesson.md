# Iterátory a generátory

:::check pretest
Co vypíše poslední řádek?

```js
const [first, second] = new Set(['Brno', 'Praha', 'Ostrava']);
console.log(second);
```

### --expected--

Praha

### --why--

Rozbalení do hranatých závorek nefunguje jen s poli. Funguje se vším, co jde procházet po jedné hodnotě — a `Set` to umí. Co přesně to znamená, vysvětlí první část.
:::

:::check pretest
Proč `for (const entry of { theme: 'tmavý' })` skončí `TypeError`?

### --answer--

`for…of` funguje jen na polích.

#### --why--

`for…of` projde i `Map`, `Set` nebo řetězec. Rozhoduje něco jiného než typ „pole".

### --correct--

Obyčejný objekt nemá metodu, která by říkala, jak ho procházet.

#### --why--

Přesně tak. Jak se ta metoda jmenuje a jak vypadá, ukáže lekce.

### --answer--

Objekt má jen jednu vlastnost a cyklus potřebuje aspoň dvě.

#### --why--

Počet vlastností nerozhoduje. I prázdné pole `for…of` projde bez chyby.
:::

Cyklus `for…of` projde pole, řetězec, `Map`, `Set` i seznam prvků ze `querySelectorAll`. Spread `[...x]` a `Array.from(x)` fungují na tytéž hodnoty. Na obyčejný objekt ale ne. V téhle lekci zjistíš, na čem to stojí — a jak naučit procházení vlastní třídu, třeba playlist, stránkovaný seznam objednávek nebo nekonečnou řadu id.

> [!REMEMBER]
> **Iterovatelný objekt umí vyrobit iterátor. Iterátor na každé `next()` vydá další hodnotu jako `{ value, done }`.**

## Co je iterovatelné

[[iterovatelný objekt|Iterovatelný]] (*iterable*) je každý objekt, který jde procházet po jedné hodnotě. Takové hodnoty přijímá `for…of`, spread `...`, `Array.from`, rozbalení `const [a, b] = …` a konstruktory `new Map(…)` a `new Set(…)`.

| iterovatelné | co dává |
|---|---|
| pole | položky |
| řetězec | znaky (i emoji jako jeden znak) |
| `Map` | dvojice `[klíč, hodnota]` |
| `Set` | hodnoty |
| `NodeList` z `querySelectorAll` | prvky stránky |
| **obyčejný objekt** | **nic — není iterovatelný** |

:::live js predict
```js
const settings = { theme: 'tmavý', language: 'cs' };

try {
  for (const entry of settings) {
    console.log(entry);
  }
} catch (error) {
  console.log(error.message);
}
```
--question-- Co vypíše tenhle kód?
--expected-- settings is not iterable
--why-- Obyčejný objekt procházet přes `for…of` nejde. Když chceš jeho dvojice, řekni to: `for (const [key, value] of Object.entries(settings))` — `Object.entries` vrací pole, a to iterovatelné je.
:::

:::check
Která volání projdou bez chyby? `prices` je obyčejný objekt `{ chleba: 45 }`, `tags` je `Set`. Vyber všechna.

### --correct--

`[...tags]`

#### --why--

`Set` je iterovatelný, spread z něj udělá pole.

### --correct--

`Array.from(Object.keys(prices))`

#### --why--

`Object.keys` vrací pole a pole je iterovatelné.

### --answer--

`[...prices]`

#### --why--

Obyčejný objekt iterovatelný není. Skončí to `TypeError: prices is not iterable`.

### --correct--

`const [first] = 'Brno';`

#### --why--

Řetězec je iterovatelný po znacích, `first` bude `'B'`.

### --see--

js-tridy-kolekce/iteratory-generatory#co-je-iterovatelne
:::

## Iterační protokol: `Symbol.iterator` a `next()`

Iterovatelný objekt má metodu pod klíčem `Symbol.iterator`. `Symbol.iterator` není text, ale speciální jedinečný klíč (*symbol*), který se nemůže srazit s žádným obyčejným názvem vlastnosti. Metoda vrátí [[iterátor]]: objekt s metodou `next()`, která při každém zavolání vydá další hodnotu.

:::live js
```js
const cities = ['Brno', 'Praha'];
const iterator = cities[Symbol.iterator]();

console.log(iterator.next());
console.log(iterator.next());
```
:::

Každé `next()` vrátí objekt se dvěma klíči: `value` je hodnota a `done` říká, jestli už je konec. Tomuhle domluvenému tvaru se říká iterační protokol. Zkus přidat ještě jedno `console.log(iterator.next())`:

:::live js predict
```js
const iterator = ['Brno', 'Praha'][Symbol.iterator]();

iterator.next();
iterator.next();
console.log(iterator.next());
```
--question-- Co vypíše `console.log`? Napiš objekt tak, jak ho vypíše konzole.
--expected-- { value: undefined, done: true }
--why-- Po posledním prvku vrací iterátor `done: true` a `value: undefined` — a vrací to při každém dalším `next()`. Podle `done: true` pozná `for…of`, že má skončit.
:::

`for (const city of cities)` tedy dělá tohle: jednou zavolá `cities[Symbol.iterator]()`, pak opakovaně volá `next()` a do `city` dosazuje `value`, dokud nepřijde `done: true`.

:::check
Napiš výraz, který z pole `queue` získá iterátor.

### --expected--

queue[Symbol.iterator]()

### --accept--

queue.values()

### --why--

Iterátor vrací metoda pod klíčem `Symbol.iterator`. U pole vrací totéž i `queue.values()`.

### --see--

js-tridy-kolekce/iteratory-generatory#iteracni-protokol-symbol-iterator-a-next
:::

## Generátory: `function*` a `yield`

Iterátor jde napsat ručně: objekt s `next()`, který si pamatuje pozici a sestavuje `{ value, done }`. Je to ale zdlouhavé a snadno se splete. Proto má JavaScript [[generátor|generátory]]. Funkce s hvězdičkou `function*` při zavolání **nespustí** svoje tělo, ale vrátí generátor — iterátor, který tělo spouští po kouscích. Každé `next()` pustí kód do nejbližšího `yield` a hodnotu za `yield` vrátí jako `value`.

:::live js predict
```js
function* steps() {
  console.log('start');
  yield 1;
  console.log('mezi');
  yield 2;
}

const generator = steps();
console.log('vytvořeno');
console.log(generator.next().value);
```
--question-- Co vypíše tenhle kód? Napiš každý výpis na nový řádek.
--expected--
```text
vytvořeno
start
1
```
--why-- Zavolání `steps()` tělo nespustí, jen vytvoří generátor — proto je první `vytvořeno`. První `next()` pustí tělo od začátku po první `yield`: vypíše `start` a vrátí `value: 1`. Text `mezi` se vypíše až při dalším `next()`.
:::

Generátor je zároveň iterovatelný, takže ho projde `for…of` i spread:

:::live js
```js
function* countdown(from) {
  for (let seconds = from; seconds > 0; seconds -= 1) {
    yield seconds;
  }
  yield 'Start!';
}

for (const value of countdown(3)) {
  console.log(value);
}
console.log([...countdown(2)]);
```
:::

Zkus změnit `countdown(3)` na `countdown(5)`. A zkus za cyklus `for` dopsat `return 'hotovo';` místo `yield 'Start!';` — hodnotu z `return` `for…of` nevypíše, protože přijde už s `done: true`.

:::check
Co vypíše poslední řádek?

```js
function* weekend() {
  yield 'sobota';
  yield 'neděle';
}

const days = weekend();
days.next();
console.log(days.next().value);
```

### --expected--

neděle

### --why--

První `next()` vydal `sobota`, druhé pokračuje za prvním `yield` a vydá `neděle`.

### --see--

js-tridy-kolekce/iteratory-generatory#generatory-function-a-yield
:::

## Vlastní iterovatelná třída

Když třídě dáš metodu `[Symbol.iterator]`, projde ji `for…of` jako pole. S generátorem je to pár řádků: metodu zapíšeš s hvězdičkou `*[Symbol.iterator]()`. Hranaté závorky znamenají „klíč je hodnota výrazu", tady symbol.

:::live js
```js
class Playlist {
  #songs = [];

  add(title, seconds) {
    this.#songs.push({ title, seconds });
  }

  *[Symbol.iterator]() {
    for (const song of this.#songs) {
      yield song.title;
    }
  }
}

const trip = new Playlist();
trip.add('Holubí dům', 214);
trip.add('Jarní tání', 187);

for (const title of trip) {
  console.log(title);
}
console.log([...trip].length);
```
:::

Playlist si písničky drží soukromě a ven dává jen názvy, v pořadí, jaké sám určí. Zkus v generátoru vydávat jen písničky kratší než 200 sekund. Zápis `yield* pole` by vydal všechny položky jiného iterovatelného objektu najednou.

:::check
Co je potřeba, aby šla instance třídy `Order` procházet cyklem `for…of`?

### --answer--

Aby třída rozšiřovala `Array` přes `extends`.

#### --why--

Dědit z pole nemusíš. `for…of` se o typ nestará, hledá jednu konkrétní metodu.

### --correct--

Metoda pod klíčem `Symbol.iterator`, která vrací iterátor — třeba generátor `*[Symbol.iterator]()`.

#### --why--

Tuhle metodu `for…of` zavolá a z vráceného iterátoru bere hodnoty.

### --answer--

Metoda `next()` přímo na instanci objednávky.

#### --why--

`next()` patří iterátoru, ne iterovatelnému objektu. `for…of` nejdřív hledá metodu, která iterátor vyrobí.

### --see--

js-tridy-kolekce/iteratory-generatory#vlastni-iterovatelna-trida
:::

## Líné a nekonečné sekvence

Generátor počítá další hodnotu až ve chvíli, kdy si o ni někdo řekne. Takové [[líná sekvence|líné sekvenci]] (*lazy sequence*) nevadí, že je nekonečná:

```js
function* transactionIds(prefix) {
  let number = 1;
  while (true) {
    yield `${prefix}-${number}`;
    number += 1;
  }
}

const ids = transactionIds('TX');
ids.next().value;
ids.next().value;
```

`while (true)` tu nic nezasekne: generátor po každém `yield` stojí a čeká na další `next()`. Dvě volání vydají `TX-1` a `TX-2` a víc se nikdy nespočítá. Stejně funguje stránkované načítání dat — další stránka se stáhne, až když ji cyklus potřebuje. K tomu se vrátíš v sekci o asynchronním JavaScriptu (`async function*` a `for await…of`).

> [!PITFALL]
> **`[...transactionIds('TX')]` nebo `Array.from` na nekonečný generátor nikdy neskončí.** Spread chce všechny hodnoty najednou a záložka prohlížeče zamrzne. Oprava: z nekonečné sekvence ber hodnoty po jedné přes `next()`, nebo v `for…of` skonči `break`, až máš dost.

:::check
Proč nekonečná smyčka `while (true)` uvnitř generátoru nezasekne stránku, když generátor voláš přes `next()`?

### --answer--

Prohlížeč smyčky v generátorech automaticky ukončí po chvíli.

#### --why--

Žádná automatická pojistka tu není. Rozhoduje, co se s během funkce stane u `yield`.

### --correct--

Generátor se u každého `yield` zastaví a pokračuje až při dalším `next()`.

#### --why--

Smyčka neběží pořád dokola, ale po jednom kroku na každé `next()`. Hodnota se spočítá, až je potřeba.

### --answer--

`while (true)` se v generátoru provede jen jednou.

#### --why--

Smyčka se opakuje, jen ne najednou: každé `next()` ji posune o jedno kolo k dalšímu `yield`.

### --see--

js-tridy-kolekce/iteratory-generatory#line-a-nekonecne-sekvence
:::

## Typické chyby a pasti

### Iterátor se vyčerpá

Pole projdeš kolikrát chceš. Generátor ne:

:::live js predict
```js
function* colors() {
  yield 'červená';
  yield 'modrá';
}

const palette = colors();
console.log([...palette].length, [...palette].length);
```
--question-- Co vypíše `console.log`? Napiš dvě čísla oddělená mezerou.
--expected-- 2 0
--why-- První spread generátor vyčerpal až do `done: true`. Druhý dostane tentýž, už doběhlý generátor, a nenajde žádnou hodnotu. Nový průchod potřebuje nový generátor: `[...colors()]`.
:::

> [!PITFALL]
> **Generátor (a každý iterátor, třeba `map.keys()`) jde projít jen jednou.** Příznak: druhý `for…of` nad stejnou proměnnou neproběhne ani jednou a nic nehlásí. Oprava: ulož si hodnoty do pole (`const values = [...generator]`), nebo generátor vytvoř znovu. Třída s `*[Symbol.iterator]()` tenhle problém nemá — každý `for…of` si vyrobí nový.

### `break` a rozbalení generátor ukončí

> [!PITFALL]
> **Když `for…of` přerušíš `break`em, nebo z generátoru vezmeš jen část rozbalením `const [a, b] = ids`, generátor se ukončí.** Další `ids.next()` vrátí `{ value: undefined, done: true }`. Oprava: když chceš v sekvenci pokračovat později, ber hodnoty přes `next()`.

### Obyčejný objekt v `for…of`

> [!PITFALL]
> **`for (const x of objekt)` hlásí `TypeError: objekt is not iterable`.** Oprava: projdi `Object.entries(objekt)`, `Object.keys` nebo `Object.values` — všechny vracejí pole. Nebo použij `Map`, která iterovatelná je.

:::check
Co vypíše poslední řádek?

```js
const cart = new Map([['káva', 2], ['čaj', 1]]);
const names = cart.keys();

const first = [...names];
const second = [...names];
console.log(first.length, second.length);
```

### --expected--

2 0

### --why--

`cart.keys()` nevrací pole, ale iterátor. První spread ho vyčerpal, druhý už nic nedostal. Pole klíčů si ulož jednou, nebo zavolej `cart.keys()` znovu.

### --see--

js-tridy-kolekce/iteratory-generatory#iterator-se-vycerpa
:::

## Kde to najdeš v MDN

- [Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) — přesný popis iterable a iterator protokolu a seznam míst, která iterovatelné hodnoty přijímají.
- [function*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) — generátorové funkce, `yield` a `yield*`.
- [Symbol.iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) — příklad vlastního iterovatelného objektu.
- [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) — metody `next`, `return` a `throw` generátorového objektu.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function* evenNumbers() {
  let n = 0;
  while (true) {
    yield n;
    n += 2;
  }
}

const numbers = evenNumbers();
numbers.next();
numbers.next();
console.log(numbers.next().value);
```

### --expected--

4

### --why--

Generátor vydá postupně `0`, `2` a `4`. Třetí `next()` vrátí `4`. Nekonečná smyčka nevadí, protože se u každého `yield` zastaví.

### --see--

js-tridy-kolekce/iteratory-generatory#line-a-nekonecne-sekvence

## --question--

Třída `Bookshelf` má soukromé pole `#books` (pole objektů `{ title, author }`). Napiš hlavičku metody, se kterou půjde `for…of` přímo nad instancí a ve které budeš používat `yield`.

### --expected--

*[Symbol.iterator]() {

### --accept--

*[Symbol.iterator]()
* [Symbol.iterator]() {

### --why--

`for…of` hledá metodu pod klíčem `Symbol.iterator`. Hvězdička z ní dělá generátor, takže v těle můžeš psát `yield book.title`. Bez hvězdičky bys musel vrátit iterátor ručně.

### --see--

js-tridy-kolekce/iteratory-generatory#vlastni-iterovatelna-trida

## --question--

Co vypíše poslední řádek?

```js
function* letters() {
  yield 'a';
  yield 'b';
  return 'c';
}

console.log([...letters()].join(''));
```

### --expected--

ab

### --why--

Hodnota z `return` přijde s `done: true`, a tu spread ani `for…of` nepoužijí. Do pole se dostanou jen hodnoty z `yield`.

### --see--

js-tridy-kolekce/iteratory-generatory#generatory-function-a-yield

## --question--

Kolega volá v cyklu `if (visitedIds.includes(id))` nad polem `visitedIds` a chce místo toho iterátor `visitedSet.values()`, „protože je rychlejší". Co je na tom špatně?

### --answer--

Nic, iterátor má taky metodu `includes`.

#### --why--

Iterátor umí hlavně `next()`. Metoda `includes` na něm není.

### --correct--

Iterátor se vyčerpá a nemá rychlé vyhledávání. Rychlé je `visitedSet.has(id)` přímo na množině.

#### --why--

Iterátor jde projít jen jednou a hledání v něm je průchod po jedné hodnotě. Rychlé „je tam?" dává `has` na `Set`.

### --answer--

Iterátor nejde vytvořit z `Set`, jen z pole.

#### --why--

`Set` iterátor vytvořit umí (`values()`, `keys()`, `entries()`). Problém je v tom, k čemu se iterátor hodí.

### --see--

js-tridy-kolekce/iteratory-generatory#iterator-se-vycerpa
