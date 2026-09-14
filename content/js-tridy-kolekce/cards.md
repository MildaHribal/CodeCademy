## --card-- output

Co vypíše tenhle kód?

```js
const defaults = { volume: 50, playlist: [] };
const kitchen = Object.create(defaults);
const car = Object.create(defaults);

kitchen.volume = 80;
kitchen.playlist.push('Rádio Wave');

console.log(car.volume, car.playlist.length);
```

### --expected--

50 1

### --why--

Myslíš si, že oba řádky s `kitchen` fungují stejně? Přiřazení `kitchen.volume = 80` vytvoří vlastní vlastnost jen v `kitchen`. `kitchen.playlist.push` ale nic nepřiřazuje: přečte pole z prototypu a mění to jediné pole, které vidí i `car`.

### --see--

js-tridy-kolekce/prototypy#retez-prototypu

## --card-- output

Co vypíše tenhle kód?

```js
const votes = {};
console.log('valueOf' in votes, Object.hasOwn(votes, 'valueOf'));
```

### --expected--

true false

### --why--

Prázdný objekt metodu `valueOf` u sebe nemá, ale zdědil ji z `Object.prototype`. `in` hledá v celém řetězu prototypů, `Object.hasOwn` jen v objektu samotném. Proto je objekt jako slovník s libovolnými klíči zrádný.

### --see--

js-tridy-kolekce/prototypy#vlastni-nebo-zdedena-vlastnost

## --card-- output

Co vypíše tenhle kód?

```js
class Media {}
class Podcast extends Media {}

const episode = new Podcast();
console.log(episode instanceof Media, Object.getPrototypeOf(episode) === Media.prototype);
```

### --expected--

true false

### --why--

Prototyp epizody je `Podcast.prototype` a teprve jeho prototyp je `Media.prototype`. `instanceof` hledá `Media.prototype` kdekoli v řetězu, proto vrátí `true`, i když přímý prototyp je jiný.

### --see--

js-tridy-kolekce/prototypy#co-dela-class-pod-kapotou

## --card-- output

Co vypíše tenhle kód?

```js
class Price {
  format() {
    return '100 Kč';
  }
}

class Sale extends Price {
  format() {
    return `${super.format()} (sleva)`;
  }
}

console.log(new Sale().format());
```

### --expected--

100 Kč (sleva)

### --why--

Přepsaná metoda v potomkovi zakryje rodičovskou, ale `super.format()` na rodičovskou verzi pořád dosáhne. Tak se chování rodiče rozšiřuje, místo aby se kopírovalo.

### --see--

js-tridy-kolekce/tridy#dedicnost-extends-a-super

## --card-- output

Co vypíše tenhle kód?

```js
const stock = new Map([['káva', 3]]);
stock.set('káva', 5);

stock.forEach((first, second) => console.log(first, second));
```

### --expected--

5 káva

### --why--

`set` se stejným klíčem hodnotu přepíše, dvojice se nezdvojí. A `forEach` mapy dostává nejdřív hodnotu, pak klíč — obráceně než dvojice `[klíč, hodnota]` ve `for…of`.

### --see--

js-tridy-kolekce/map-a-set#poradi-argumentu-v-foreach

## --card-- output

Co vypíše tenhle kód?

```js
const cache = new Map();
cache['/kosik'] = '<h1>Košík</h1>';

console.log(cache.has('/kosik'), '/kosik' in cache);
```

### --expected--

false true

### --why--

Hranaté závorky u mapy vytvoří obyčejnou vlastnost objektu mapy — proto ji `in` najde. Do slovníku se ale nic neuložilo, `has` ani `get` o ní nevědí. Záznam do mapy ukládá jen `cache.set('/kosik', …)`.

### --see--

js-tridy-kolekce/map-a-set#hranate-zavorky-misto-set

## --card-- output

Co vypíše tenhle kód?

```js
const scores = new Map([['Eva', 12]]);
console.log(JSON.stringify({ scores }));
```

### --expected--

{"scores":{}}

### --why--

JSON mapy nezná a zapíše ji jako prázdný objekt — data tiše zmizí. Před uložením převeď mapu přes `Object.fromEntries(scores)` nebo na pole dvojic `[...scores]`.

### --see--

js-tridy-kolekce/map-a-set#json-stringify-mapy

## --card-- output

Co vypíše tenhle kód?

```js
const ids = new Set([1, '1', 1]);
console.log(ids.size);
```

### --expected--

2

### --why--

`Set` porovnává hodnoty přísně: dvě čísla `1` jsou tatáž hodnota, ale text `'1'` je jiná. Hodnoty z formuláře nebo URL jsou texty, proto je před vložením převeď přes `Number(…)`.

### --see--

js-tridy-kolekce/map-a-set#set-kazda-hodnota-jednou

## --card-- output

Co vypíše tenhle kód?

```js
const cities = new Set(['Praha', 'Brno']);
const visited = new Set(['Brno', 'Plzeň']);

console.log([...visited.difference(cities)]);
```

### --expected--

['Plzeň']

### --why--

`a.difference(b)` nechá hodnoty z `a`, které v `b` nejsou. Tady je `a` množina `visited`, takže zůstane jen Plzeň. Prohozené pořadí by vrátilo `['Praha']`.

### --see--

js-tridy-kolekce/map-a-set#mnozinove-operace

## --card-- output

Co vypíše tenhle kód?

```js
function* greetings() {
  console.log('generuju');
  yield 'Ahoj';
}

const generator = greetings();
console.log('hotovo');
```

### --expected--

hotovo

### --why--

Zavolání generátorové funkce tělo nespustí, jen vrátí generátor. Text `generuju` by se vypsal až při prvním `generator.next()`.

### --see--

js-tridy-kolekce/iteratory-generatory#generatory-function-a-yield

## --card-- output

Co vypíše tenhle kód?

```js
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}

const sequence = numbers();
for (const number of sequence) {
  break;
}
console.log(sequence.next().done);
```

### --expected--

true

### --why--

`break` v `for…of` generátor ukončí, i když ještě měl hodnoty. Další `next()` už vrátí `{ value: undefined, done: true }`. Když chceš pokračovat později, ber hodnoty přes `next()`.

### --see--

js-tridy-kolekce/iteratory-generatory#break-a-rozbaleni-generator-ukonci

## --card-- code js

Napiš třídu `Stopwatch` se soukromým polem pro počet sekund, metodou `tick()`, která ho zvýší o jedna, a getterem `seconds`, který ho vrátí. Instance nemá žádnou veřejnou vlastnost.

### --seed--

```js
class Stopwatch {
}
```

### --test--

```js
const watch = new Stopwatch();
assert.equal(watch.seconds, 0, 'nové stopky mají seconds 0');
watch.tick();
watch.tick();
assert.equal(watch.seconds, 2, 'po dvou tick() má být seconds 2');
assert.equal(new Stopwatch().seconds, 0, 'druhé stopky počítají zvlášť od nuly');
assert.deepEqual(Object.keys(watch), [], 'Object.keys(stopek) má být [] — sekundy patří do soukromého pole');
```

### --solution--

```js
class Stopwatch {
  #seconds = 0;

  tick() {
    this.#seconds += 1;
  }

  get seconds() {
    return this.#seconds;
  }
}
```

### --see--

js-tridy-kolekce/tridy#soukroma-pole

## --card-- code js

Doplň třídu `Admin`, která rozšiřuje `User`. Konstruktor dostane jméno a pole oprávnění `permissions`, jméno předá rodiči a oprávnění uloží. Metoda `can(permission)` vrátí, jestli admin dané oprávnění má.

### --seed--

```js
class User {
  constructor(name) {
    this.name = name;
  }
}

class Admin {
}
```

### --test--

```js
const admin = new Admin('Eva', ['mazat', 'upravovat']);
assert.ok(admin instanceof User, 'Admin má rozšiřovat User (instanceof User)');
assert.equal(admin.name, 'Eva', "new Admin('Eva', …).name má být 'Eva'");
assert.equal(admin.can('mazat'), true, "admin s oprávněním 'mazat' má u can('mazat') vrátit true");
assert.equal(admin.can('fakturovat'), false, "can('fakturovat') bez takového oprávnění má vrátit false");
```

### --solution--

```js
class User {
  constructor(name) {
    this.name = name;
  }
}

class Admin extends User {
  constructor(name, permissions) {
    super(name);
    this.permissions = permissions;
  }

  can(permission) {
    return this.permissions.includes(permission);
  }
}
```

### --see--

js-tridy-kolekce/tridy#dedicnost-extends-a-super

## --card-- code js

Oprav metodu `addAll` tak, aby přidala všechny úkoly do seznamu. Teď spadne na `TypeError`.

### --seed--

```js
class TodoList {
  items = [];

  add(text) {
    this.items.push(text);
  }

  addAll(texts) {
    texts.forEach(function (text) {
      this.add(text);
    });
  }
}
```

### --test--

```js
const list = new TodoList();
list.addAll(['nakoupit', 'vyprat']);
assert.deepEqual(list.items, ['nakoupit', 'vyprat'], "addAll(['nakoupit', 'vyprat']) má přidat oba úkoly");
```

### --solution--

```js
class TodoList {
  items = [];

  add(text) {
    this.items.push(text);
  }

  addAll(texts) {
    texts.forEach((text) => {
      this.add(text);
    });
  }
}
```

### --see--

js-tridy-kolekce/tridy#obycejna-funkce-jako-callback-uvnitr-metody

## --card-- code js

Napiš funkci `countBy(items, getKey)`, která vrátí `Map`: klíčem je výsledek `getKey(položka)` a hodnotou počet položek s tímto klíčem, v pořadí prvního výskytu.

### --seed--

```js
function countBy(items, getKey) {
}
```

### --test--

```js
const orders = [{ city: 'Brno' }, { city: 'Praha' }, { city: 'Brno' }];
const result = countBy(orders, (order) => order.city);
assert.ok(result instanceof Map, 'countBy má vrátit Map');
assert.deepEqual([...result], [['Brno', 2], ['Praha', 1]], "countBy(objednávky, město) má vrátit Brno → 2 a Praha → 1");
assert.equal(countBy([], (x) => x).size, 0, 'countBy([]) má vrátit prázdnou mapu');
```

### --solution--

```js
function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
```

### --see--

js-tridy-kolekce/map-a-set#map-slovnik-s-libovolnymi-klici

## --card-- code js

Napiš funkci `unique(items)`, která vrátí **nové pole** bez duplicit, v pořadí prvního výskytu.

### --seed--

```js
function unique(items) {
}
```

### --test--

```js
const tags = ['akce', 'novinka', 'akce', 'sleva'];
assert.deepEqual(unique(tags), ['akce', 'novinka', 'sleva'], "unique(['akce', 'novinka', 'akce', 'sleva']) má vrátit ['akce', 'novinka', 'sleva']");
assert.ok(Array.isArray(unique([1])), 'unique má vrátit pole, ne Set');
assert.equal(tags.length, 4, 'unique nesmí měnit původní pole');
```

### --solution--

```js
function unique(items) {
  return [...new Set(items)];
}
```

### --see--

js-tridy-kolekce/map-a-set#set-kazda-hodnota-jednou

## --card-- code js

Doplň třídu `Range` tak, aby šla procházet cyklem `for…of`: `new Range(2, 5)` vydá postupně `2, 3, 4, 5`.

### --seed--

```js
class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}
```

### --test--

```js
assert.deepEqual([...new Range(2, 5)], [2, 3, 4, 5], '[...new Range(2, 5)] má být [2, 3, 4, 5]');
const range = new Range(1, 2);
assert.deepEqual([...range], [1, 2], 'první průchod new Range(1, 2) má vydat [1, 2]');
assert.deepEqual([...range], [1, 2], 'i druhý průchod téže instance má vydat [1, 2]');
```

### --solution--

```js
class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  *[Symbol.iterator]() {
    for (let value = this.from; value <= this.to; value += 1) {
      yield value;
    }
  }
}
```

### --see--

js-tridy-kolekce/iteratory-generatory#vlastni-iterovatelna-trida

## --card-- free

Co je řetěz prototypů a odkud má pole `[3, 1]` metodu `map`, když ji samo nemá?

### --back--

Skoro každý objekt má skrytý odkaz na jiný objekt, svůj prototyp. Když objekt vlastnost nemá, JavaScript ji hledá v prototypu, pak v prototypu prototypu, až k `null`; tomu se říká řetěz prototypů. Pole má u sebe jen položky a `length`, jeho prototyp je `Array.prototype`, kde leží `map`, `filter` a ostatní metody. Proto je každá metoda v paměti jen jednou a sdílí ji všechna pole. Když metodu nenajde nikde, čtení vrátí `undefined` a volání skončí `is not a function`.

### --see--

js-tridy-kolekce/prototypy#odkud-maji-pole-a-retezce-sve-metody

## --card-- free

Jsou třídy v JavaScriptu něco jiného než prototypy?

### --back--

Ne, `class` je pohodlnější zápis nad prototypy. `class Episode` vytvoří funkci `Episode` a objekt `Episode.prototype`, do kterého se uloží metody z těla třídy. `new Episode()` vytvoří objekt, jehož prototypem je `Episode.prototype`, a data z konstruktoru dá přímo do něj. `extends` přidá do řetězu další článek, přepsaná metoda se najde dřív a `instanceof` jen hledá prototyp v řetězu. Třída navíc přidává věci, které se přes prototypy psaly těžko: soukromá pole a povinné `new`.

### --see--

js-tridy-kolekce/prototypy#co-dela-class-pod-kapotou

## --card-- free

Proč soukromé pole `#balance`, a ne vlastnost `_balance`?

### --back--

Podtržítko je jen dohoda „nesahej na to", jazyk nic nehlídá a kdokoli může napsat `account._balance = 1000000`. K poli `#balance` má přístup jen kód v těle třídy; zápis zvenku je syntaktická chyba celého souboru. Stav se tak mění jen metodami, které hlídají pravidla (kladná částka, dost peněz), a třída může vnitřek změnit, aniž by rozbila cizí kód. Pozor: soukromé je jméno, ne hodnota — getter, který vrací soukromé pole, pustí ven odkaz a je potřeba vracet kopii.

### --see--

js-tridy-kolekce/tridy#soukroma-pole

## --card-- free

Kdy použiješ dědičnost a kdy kompozici?

### --back--

Dědičnost (`extends`) dává smysl, když potomek opravdu je druh rodiče a používá všechno, co rodič nabízí: spořicí účet je bankovní účet, `ValidationError` je `Error`. Kompozice znamená, že objekt jiný objekt má a volá jeho metody: pokladna má košík, přehrávač má frontu. Dlouhé řetězy dědičnosti jsou křehké, protože změna rodiče může rozbít všechny potomky. Proto se v praxi víc používá kompozice a `extends` se nechává pro jasné vztahy „je druh".

### --see--

js-tridy-kolekce/tridy#kompozice-nebo-dedicnost

## --card-- free

Proč metoda předaná jako callback, třeba `setTimeout(player.next, 1000)`, ztratí `this`, a jak to opravíš?

### --back--

`this` v metodě se neurčuje podle toho, kde metoda vznikla, ale podle toho, jak ji zavoláš — je to objekt před tečkou. `player.next` bez závorek je jen samotná funkce, objekt `player` se s ní nepředá. `setTimeout` ji pak zavolá bez tečky a v těle třídy (strict mode) je `this` `undefined`, takže čtení `this.…` spadne. Oprava je zavolat metodu i s objektem: šipková funkce `() => player.next()`, nebo funkce s pevným `this` přes `player.next.bind(player)`.

### --see--

js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this

## --card-- free

Kdy použiješ `Map` a kdy obyčejný objekt?

### --back--

Objekt je přirozený pro záznam se známými klíči: uživatel `{ name, email }`, nastavení, data pro JSON a API. `Map` je lepší jako slovník, jehož klíče přicházejí za běhu: počty podle slova, košík podle id, cache podle objektu. Klíčem mapy může být cokoli a nepřevádí se na text (`1` a `'1'` jsou dva klíče), mapa nemá zděděné klíče z prototypu, zná `size` a drží pořadí vložení. Nevýhoda: `JSON.stringify` mapu neumí, před uložením ji převedeš přes `Object.fromEntries`.

### --see--

js-tridy-kolekce/map-a-set#kdy-map-a-kdy-objekt

## --card-- free

Jaký je rozdíl mezi iterovatelným objektem, iterátorem a generátorem?

### --back--

Iterovatelný objekt (pole, `Map`, `Set`, řetězec) má metodu pod klíčem `Symbol.iterator`, která vyrobí iterátor. Iterátor je objekt s metodou `next()`, která při každém zavolání vrátí `{ value, done }`; jde projít jen jednou. Generátor vznikne zavoláním funkce `function*` a je to iterátor, který spouští tělo funkce po kouscích od jednoho `yield` k dalšímu. `for…of` a spread si od iterovatelného objektu vezmou iterátor a volají `next()`, dokud nepřijde `done: true`. Vlastní třídu udělá iterovatelnou metoda `*[Symbol.iterator]()`.

### --see--

js-tridy-kolekce/iteratory-generatory#iteracni-protokol-symbol-iterator-a-next
