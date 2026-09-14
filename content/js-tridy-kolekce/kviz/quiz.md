---
pass: 0.8
---

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const base = {
  greet() {
    return `Ahoj, ${this.name}`;
  },
};

const eva = Object.create(base);
eva.name = 'Eva';
console.log(eva.greet(), Object.keys(eva).length);
```

### --expected--

Ahoj, Eva 1

### --why--

`eva` má u sebe jen `name`, proto `Object.keys` vrátí jeden klíč. Metodu `greet` najde až v prototypu `base`, ale `this` při zavolání je pořád `eva`, takže pozdrav obsahuje její jméno.

### --see--

js-tridy-kolekce/prototypy#kazdy-objekt-ma-prototyp

## --question--

Co vypíše poslední řádek? Napiš dvě hodnoty oddělené mezerou.

```js
class Ticket {
  constructor(seat) {
    this.seat = seat;
  }

  print() {
    return `Sedadlo ${this.seat}`;
  }
}

console.log(typeof Ticket, Object.hasOwn(new Ticket('A4'), 'print'));
```

### --expected--

function false

### --why--

`class` pod kapotou vytvoří funkci, proto `typeof` vrátí `'function'`. Metoda `print` leží v `Ticket.prototype`, ne v instanci — instance ji najde až po řetězu prototypů.

### --see--

js-tridy-kolekce/prototypy#co-dela-class-pod-kapotou

## --question--

Co se stane se souborem, který obsahuje tenhle kód?

```js
class Account {
  #balance = 0;
}

class SavingsAccount extends Account {
  reset() {
    this.#balance = 0;
  }
}
```

### --answer--

Projde, `reset` vynuluje zůstatek zděděný od `Account`.

#### --why--

Myslíš si, že potomek dědí i soukromá pole? Soukromé pole je vidět jen v těle třídy, která ho deklaruje.

### --answer--

Projde, ale `reset` vytvoří v instanci nové soukromé pole `#balance`.

#### --why--

Soukromé pole nejde vytvořit přiřazením jako obyčejnou vlastnost. Musí být deklarované v těle třídy, ve které ho používáš.

### --correct--

Soubor vůbec nepůjde spustit, protože `#balance` není deklarované v `SavingsAccount`.

#### --why--

Přístup k soukromému poli mimo třídu, která ho deklaruje, je syntaktická chyba: `Private field '#balance' must be declared in an enclosing class`. Potomek se k zůstatku dostane jen přes veřejný getter nebo metodu rodiče.

### --see--

js-tridy-kolekce/tridy#soukroma-pole

## --question--

Co vypíše poslední řádek? Napiš dvě hodnoty oddělené mezerou.

```js
class Coupon {
  static fromCode(code) {
    return new Coupon(code.toUpperCase());
  }

  constructor(code) {
    this.code = code;
  }
}

const coupon = Coupon.fromCode('leto26');
console.log(coupon.code, typeof coupon.fromCode);
```

### --expected--

LETO26 undefined

### --why--

Statická metoda patří třídě: `Coupon.fromCode` vytvoří instanci s velkými písmeny. Instance statickou metodu nemá, takže `coupon.fromCode` je `undefined`.

### --see--

js-tridy-kolekce/tridy#staticke-cleny-static

## --question--

Co se stane při spuštění tohoto kódu?

```js
class Timer {
  seconds = 0;

  tick() {
    this.seconds += 1;
  }
}

const timer = new Timer();
[1, 2, 3].forEach(timer.tick);
```

### --answer--

`timer.seconds` bude `3`.

#### --why--

Tak by to dopadlo s `forEach(() => timer.tick())`. Co dostane `forEach`, když předáš jen `timer.tick` bez závorek?

### --answer--

`timer.seconds` bude `NaN`.

#### --why--

`NaN` by vzniklo, kdyby `seconds` bylo `undefined`. Tady se k `seconds` kód vůbec nedostane — rozhoduje, co je `this`.

### --correct--

Vyhodí `TypeError: Cannot read properties of undefined (reading 'seconds')`.

#### --why--

`forEach` dostal samotnou funkci `tick` bez objektu a zavolá ji bez tečky. V těle třídy platí strict mode, takže `this` je `undefined`. Oprava: `forEach(() => timer.tick())` nebo `timer.tick.bind(timer)`.

### --see--

js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this

## --question--

Co vypíše poslední řádek? Napiš dvě čísla oddělená mezerou.

```js
const seats = new Map();
seats.set(1, 'Eva');
seats.set('1', 'Jan');

const plain = {};
plain[1] = 'Eva';
plain['1'] = 'Jan';

console.log(seats.size, Object.keys(plain).length);
```

### --expected--

2 1

### --why--

`Map` porovnává klíče tak, jak jsou: číslo `1` a text `'1'` jsou dva klíče. Obyčejný objekt převede číslo na text, takže druhé přiřazení přepíše první.

### --see--

js-tridy-kolekce/map-a-set#proc-nestaci-objekt

## --question--

Knihovna na tooltipy si ke každému prvku stránky pamatuje, jestli je bublina otevřená. Prvky se ze stránky průběžně mažou a knihovna nechce, aby kvůli ní zůstávaly v paměti. Co použije?

### --answer--

Obyčejný objekt, kde klíčem je prvek.

#### --why--

Klíč objektu musí být text. Každý prvek by se převedl na stejný text a všechny by sdílely jeden záznam.

### --answer--

`Map`, kde klíčem je prvek.

#### --why--

Klíčem být prvek může, jenže `Map` ho drží v paměti, dokud ho sama nesmaže — i když už ze stránky zmizel.

### --correct--

`WeakMap`, kde klíčem je prvek.

#### --why--

`WeakMap` klíče nedrží naživu. Když na smazaný prvek nic jiného neodkazuje, prohlížeč ho uklidí i se záznamem v mapě.

### --see--

js-tridy-kolekce/map-a-set#weakmap-data-k-objektu-dokud-objekt-zije

## --question--

Co vypíše poslední řádek? Napiš dvě hodnoty oddělené mezerou.

```js
const course = new Set(['HTML', 'CSS', 'JS']);
const done = new Set(['CSS', 'Git']);

console.log([...course.difference(done)].join(' '), course.isSubsetOf(done));
```

### --expected--

HTML JS false

### --why--

`course.difference(done)` nechá z kurzu to, co ještě není hotové: `HTML` a `JS`. `isSubsetOf` by platilo, jen kdyby každá hodnota z `course` byla i v `done`.

### --see--

js-tridy-kolekce/map-a-set#mnozinove-operace

## --question--

Co vypíše poslední řádek? Napiš dvě čísla oddělená mezerou.

```js
class Queue {
  #items = ['A1', 'B7', 'C3'];

  *[Symbol.iterator]() {
    yield* this.#items;
  }
}

const queue = new Queue();
const iterator = queue[Symbol.iterator]();
iterator.next();

console.log([...iterator].length, [...queue].length);
```

### --expected--

2 3

### --why--

`iterator` je jeden generátor: první `next()` z něj vzal `A1`, takže spread dostane už jen dvě hodnoty. `[...queue]` si zavolá `[Symbol.iterator]()` znovu a dostane nový generátor se všemi třemi.

### --see--

js-tridy-kolekce/iteratory-generatory#iterator-se-vycerpa

## --question--

Najdi v anglické dokumentaci MDN stránku **Object.create()**. Jak se jmenuje její druhý, nepovinný parametr? Napiš jeho název přesně tak, jak ho MDN píše v části *Syntax*.

### --expected--

propertiesObject

### --why--

V části *Syntax* stojí `Object.create(proto, propertiesObject)`. Druhým parametrem jde novému objektu rovnou nadefinovat vlastnosti. V běžném kódu ho potkáš málokdy, ale stejně rychle v MDN zjistíš u každé funkce, jaké parametry bere a co vrací.

### --see--

js-tridy-kolekce/prototypy#kde-to-najdes-v-mdn

## --question--

Co vypíše poslední řádek? Napiš dvě hodnoty oddělené mezerou.

```js
class Seat {
  constructor(code) {
    this.code = code;
  }

  label() {
    return `Sedadlo ${this.code}`;
  }
}

const copy = structuredClone(new Seat('B12'));
console.log(copy.code, copy instanceof Seat);
```

### --expected--

B12 false

### --why--

`structuredClone` zkopíruje vlastní data objektu, ale prototyp ne: kopie je obyčejný objekt s `code`, bez vazby na `Seat.prototype`. Proto nemá ani metodu `label`. Instanci třídy je potřeba vytvořit znovu přes `new` nebo statickou tovární metodu.

### --see--

js-objekty/kopie-a-json
js-tridy-kolekce/prototypy#co-dela-class-pod-kapotou

## --question--

Co vypíše tenhle kód?

```js
class User {
  #password = 'tajne123';

  constructor(name) {
    this.name = name;
  }
}

console.log(JSON.stringify(new User('Eva')));
```

### --expected--

{"name":"Eva"}

### --why--

`JSON.stringify` bere jen veřejné vlastní vlastnosti objektu. Soukromé pole `#password` do výsledku nepatří — což je u hesla přesně to, co chceš. Ze stejného důvodu se po `JSON.parse` z textu nestane zase instance `User`.

### --see--

js-objekty/kopie-a-json
js-tridy-kolekce/tridy#soukroma-pole

## --question--

Co vypíše poslední řádek? Napiš dvě hodnoty oddělené mezerou.

```js
const cart = new Set();
cart.add({ id: 7 });

console.log(cart.has({ id: 7 }), [{ id: 7 }].includes({ id: 7 }));
```

### --expected--

false false

### --why--

`Set` i `includes` porovnávají objekty odkazem. Každé `{ id: 7 }` je nový objekt, takže ani jedno hledání ho nenajde. Podle id hledá `some((item) => item.id === 7)`, nebo množina samotných id.

### --see--

js-pole/co-je-pole#includes-v-poli-objektu
js-tridy-kolekce/map-a-set#set-kazda-hodnota-jednou

## --question--

Co vypíše poslední řádek?

```js
class Team {
  #players = ['Eva', 'Jan'];

  get players() {
    return this.#players;
  }
}

const team = new Team();
const list = team.players;
list.push('Bára');
console.log(team.players.length);
```

### --expected--

3

### --why--

Getter vrátil odkaz na soukromé pole, ne kopii. `list` a `#players` jsou totéž pole, takže `push` změnil tým. Soukromé je jen jméno `#players`, ne pole, na které ukazuje. Oprava: vracet `[...this.#players]`.

### --see--

js-tridy-kolekce/tridy#getter-vraci-soukrome-pole-ven
js-objekty/reference-a-mutace

# --code-- Garáž u nádraží

## --file-- garage.js

```js
// Garáž u nádraží: parkovací místa, rezervace a vyúčtování.
// Starší kód z doby před třídami, časem k němu přibyla VIP garáž.

function Garage(name, capacity) {
  this.name = name;
  this.capacity = capacity;
  this._spots = {};
}

Garage.prototype.hourlyRate = 40;
Garage.prototype.plates = [];

Garage.prototype.park = function (plate, spot) {
  if (spot < 1 || spot > this.capacity) {
    return false;
  }
  if (this._spots[spot] !== undefined) {
    return false;
  }
  this._spots[spot] = plate;
  this.plates.push(plate);
  return true;
};

Garage.prototype.leave = function (spot, hours) {
  const plate = this._spots[spot];
  if (plate === undefined) {
    return 0;
  }
  delete this._spots[spot];
  return hours * this.hourlyRate;
};

Garage.prototype.freeSpots = function () {
  let free = 0;
  for (let spot = 1; spot <= this.capacity; spot++) {
    if (!(spot in this._spots)) {
      free++;
    }
  }
  return free;
};

Garage.prototype.parkAll = function (plates) {
  let spot = 1;
  plates.forEach(function (plate) {
    while (!this.park(plate, spot)) {
      spot++;
    }
  });
};

class VipGarage extends Garage {
  constructor(name, capacity, lounge) {
    super(name, capacity);
    this.lounge = lounge;
  }

  leave(spot, hours) {
    const price = super.leave(spot, hours);
    return price * 1.5;
  }
}

VipGarage.prototype.hourlyRate = 60;

const station = new Garage('Nádraží', 3);
const airport = new VipGarage('Letiště', 2, 'Salonek Morava');

station.park('1AB 2345', 1);
station.park('2BC 3456', 2);
airport.park('3CD 4567', 1);

console.log(station.plates.length, airport.plates.length);
console.log(station.freeSpots(), 'hourlyRate' in airport, Object.hasOwn(airport, 'hourlyRate'));
console.log(station.leave(1, 2), airport.leave(1, 2));
console.log(station.park('4DE 5678', 5), station.freeSpots());
```

## --question--

Co vypíše řádek 74? Napiš dvě čísla oddělená mezerou.

### --expected--

3 3

### --why--

Pole `plates` je na řádku 11 v `Garage.prototype`, ne v každé garáži. `this.plates.push` na řádku 21 nic nezapisuje do garáže — přečte pole z prototypu a změní ho. Všechny garáže včetně letištní proto sdílejí jeden seznam tří SPZ. Patří do konstruktoru jako `this.plates = []`.

### --see--

js-tridy-kolekce/prototypy#retez-prototypu

## --question--

Co vypíše řádek 75? Napiš tři hodnoty oddělené mezerou.

### --expected--

1 true false

### --why--

Garáž na nádraží má tři místa a obsazená jsou dvě, volné zbývá jedno. `hourlyRate` letištní garáž najde v řetězu prototypů (`in` vrátí `true`), ale u sebe ho nemá — leží v `VipGarage.prototype` z řádku 65, proto `Object.hasOwn` vrátí `false`.

### --see--

js-tridy-kolekce/prototypy#vlastni-nebo-zdedena-vlastnost

## --question--

Co vypíše řádek 76? Napiš dvě čísla oddělená mezerou.

### --expected--

80 180

### --why--

Nádraží: 2 hodiny × 40 Kč. Letiště: `leave` z `VipGarage` zavolá na řádku 60 rodičovskou verzi, ta na řádku 31 čte `this.hourlyRate` — a `this` je letištní garáž, takže hledání najde `60` ve `VipGarage.prototype` dřív než `40` v `Garage.prototype`. 2 × 60 = 120 a řádek 61 přičte polovinu navíc: 180.

### --see--

js-tridy-kolekce/prototypy#co-dela-class-pod-kapotou

## --question--

Kolega zavolá `station.parkAll(['5EF 6789'])` z řádku 44 a dostane `TypeError`. Proč?

### --answer--

`plates` na řádku 44 je text, ne pole, a `forEach` na něm nejde.

#### --why--

`parkAll` dostal pole se SPZ a `forEach` na něm funguje. Chyba vznikne až uvnitř callbacku.

### --correct--

Callback na řádku 46 je zapsaný přes `function`, takže má vlastní `this` a `this.park` na řádku 47 není metoda garáže.

#### --why--

Obyčejná funkce jako callback nedostane `this` metody, ve které vznikla. Šipková funkce `(plate) => { … }` vlastní `this` nemá a použije `this` z `parkAll`, tedy garáž.

### --answer--

Metody přidané přes `Garage.prototype` nejde volat z jiné metody.

#### --why--

Jde to, `leave` ve `VipGarage` to na řádku 60 dělá přes `super`. Rozhoduje, čím je `this` uvnitř callbacku.

### --see--

js-tridy-kolekce/tridy#obycejna-funkce-jako-callback-uvnitr-metody
