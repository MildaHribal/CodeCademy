> [!REMEMBER]
> **Když objekt vlastnost nemá, hledá se v prototypu.** Třída je zápis nad prototypy: data jsou v instanci, metody v `Třída.prototype`.

## Třída v kostce

| zápis | co dělá |
|---|---|
| `class Account { … }` + `new Account('Eva')` | [[třída]] a její [[instance]]; bez `new` `TypeError` |
| `constructor(owner) { this.owner = owner; }` | připraví data nové instance |
| `items = [];` | [[pole třídy]], každá instance dostane vlastní |
| `#balance = 0;`, `#check() {}` | [[soukromé pole]] a metoda, jen v těle třídy |
| `get balance() {}`, `set email(v) {}` | [[getter]] se čte bez závorek, [[setter]] se volá přiřazením |
| `static open(owner) {}` | [[statická metoda]]: `Account.open(…)`, instance ji nemá |
| `class Savings extends Account` | [[dědičnost]]; `super(…)` v konstruktoru před prvním `this` |
| `super.withdraw(amount)` | zavolá rodičovskou verzi přepsané metody |
| `obj instanceof Account` | je `Account.prototype` v řetězu objektu? |

## Prototypy

| nástroj | co zjistí |
|---|---|
| `Object.getPrototypeOf(obj)` | [[prototyp]] objektu |
| `Object.create(proto)` | nový prázdný objekt s daným prototypem |
| `Object.hasOwn(obj, key)` | je klíč [[vlastní vlastnost]]? |
| `key in obj` | je klíč kdekoli v [[řetěz prototypů|řetězu prototypů]]? |

## Map, Set, WeakMap

| potřebuješ | použij |
|---|---|
| záznam se známými klíči, data pro JSON | objekt `{ name, email }` |
| slovník s klíči za běhu, klíč číslo nebo objekt | `new Map()`: `set`, `get`, `has`, `delete`, `size` |
| hodnoty bez duplicit, rychlé „je tam?" | `new Set()`: `add`, `has`, `delete`, `size` |
| data k objektu, dokud objekt žije | `new WeakMap()` (klíč jen objekt, nejde procházet) |

| [[množinové operace|množinová operace]] | vrátí |
|---|---|
| `a.union(b)` | hodnoty z obou |
| `a.intersection(b)` | jen společné |
| `a.difference(b)` | z `a`, co není v `b` (na pořadí záleží) |
| `a.isSubsetOf(b)`, `a.isDisjointFrom(b)` | `true`/`false` |

## Vzory

```js
// soukromý stav, getter a kopie ven
class Playlist {
  #songs = [];
  get songs() {
    return [...this.#songs];
  }
  add(title) {
    this.#songs.push(title);
  }
}

// statická tovární metoda
class Coupon {
  static fromCode(code) {
    return new Coupon(code.toUpperCase());
  }
  constructor(code) {
    this.code = code;
  }
}

// dědičnost a přepsaná metoda
class Chapter extends Recording {
  constructor(title, number) {
    super(title);
    this.number = number;
  }
  label() {
    return `${this.number}. ${super.label()}`;
  }
}

// počítání a seskupení do Map
const counts = new Map();
for (const word of words) {
  counts.set(word, (counts.get(word) ?? 0) + 1);
}

// pole bez duplicit
const uniqueTags = [...new Set(tags)];

// vlastní iterovatelná třída
class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
  *[Symbol.iterator]() {
    for (let value = this.from; value <= this.to; value += 1) yield value;
  }
}

// iterator helpers (rozšíření): líně a bez mezipole
const firstThree = generator.filter((n) => n % 2 === 0).take(3).toArray();
```

## Iterátory a generátory

| pojem | co to je |
|---|---|
| [[iterovatelný objekt]] | má `[Symbol.iterator]()`: pole, řetězec, `Map`, `Set` (obyčejný objekt ne) |
| [[iterátor]] | má `next()` → `{ value, done }`, projde se jen jednou |
| [[generátor]] | `function*`; tělo běží od `yield` k `yield`, až když přijde `next()` |

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| `Cannot read properties of undefined (reading '…')` v metodě | metoda předaná jako callback, nebo `function` callback uvnitř metody | `(x) => obj.method(x)`, `bind`, šipková funkce |
| `Must call super constructor … before accessing 'this'` | `this` před `super(…)` v potomkovi | `super(…)` jako první řádek konstruktoru |
| `Maximum call stack size exceeded` v getteru | `get name() { return this.name; }` | data do `#name` |
| přiřazení do vlastnosti „nic neudělá" | getter bez setteru | dopiš `set`, nebo metodu |
| `obj.fromApi is not a function` | statická metoda volaná na instanci | `Třída.fromApi(…)` |
| `push` u jednoho objektu je vidět u všech | pole v prototypu | data do konstruktoru nebo pole třídy |
| „soukromé" pole jde zvenku změnit | getter vrací `this.#items` | vrať `[...this.#items]` |
| `size` je `0`, `get` vrací `undefined` | `map[key] = value` | `map.set(key, value)` |
| `'{}'` po `JSON.stringify` | `Map` a `Set` JSON nezná | `Object.fromEntries(map)`, `[...set]` |
| `TypeError: The .size property is NaN` | množinová metoda dostala pole | `new Set(pole)` |
| druhý `for…of` neproběhne | vyčerpaný iterátor nebo generátor | ulož si pole, nebo vytvoř nový |
| `x is not iterable` | `for…of` nad obyčejným objektem | `Object.entries(x)` |
| `Array.prototype.x = …` rozbije cizí kód | rozšířený vestavěný prototyp | obyčejná funkce |
