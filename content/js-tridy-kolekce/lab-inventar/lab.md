---
title: Inventář skladu
runtime: js
see: js-tridy-kolekce/tridy#soukroma-pole, js-tridy-kolekce/map-a-set#map-slovnik-s-libovolnymi-klici, js-tridy-kolekce/iteratory-generatory#vlastni-iterovatelna-trida
---

# --description--

Dva obchody s deskovými hrami, v Olomouci a v Brně, si chtějí vést sklad v aplikaci. Potřebují vědět, kolik kusů čeho mají, kolik zboží stojí, a porovnat, co má jedna prodejna a druhá ne. Tvým úkolem je model skladu: třídy, které si zásoby hlídají samy. Tentokrát bez návodu — co použiješ, rozhoduješ ty. Hodí se všechno ze sekce: soukromá pole, gettery, statické metody, dědičnost, `Map`, `Set` a iterovatelná třída.

Co ve skladu je, je tvoje volba: deskovky, díly na kola nebo čaje. Testy si přinesou vlastní zboží, názvy ani ceny v ukázkových datech nekontrolují.

V `script.js` jsou prázdné kostry tříd s popisem. Takhle se model používá:

```js
const shop = new Warehouse('Olomouc');
shop.add(new Product('AZU-01', 'Azul', 590), 4);
shop.add(new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20), 2);
```

Co prodejny od skladu chtějí:

- Zboží má kód, název a cenu. Nesmysl, jako záporná cena, se do skladu vůbec nedostane.
- Zboží ve slevě se chová jako každé jiné zboží, jen se prodává za cenu po slevě.
- Když prodavač naskladní zboží, které už ve skladu je, kusy se přičtou. Když prodá poslední kus, zboží ze skladu zmizí. Prodat víc, než je na skladě, nejde.
- Vedoucí vidí, kolik druhů zboží sklad má a kolik zásoby stojí po slevách.
- Aplikace sklad projde cyklem `for…of` a vypíše zboží v pořadí, v jakém přibylo — a nic přitom omylem nezmění.
- Majitel porovná dvě prodejny: co je jen v první, co jen ve druhé a co mají obě.

Přesné požadavky jsou v seznamu kontrol.

> [!REMEMBER]
> **Zásoby se mění jen metodami `add` a `remove`.** Nic, co sklad vrátí ven, nesmí dovolit změnit jeho vnitřní stav.

# --hints--

`new Product(code, name, price)` uloží kód, název a cenu a `finalPrice` vrátí cenu.

```js
const azul = new Product('AZU-01', 'Azul', 590);
assert.equal(azul.code, 'AZU-01', "new Product('AZU-01', 'Azul', 590).code má být 'AZU-01'");
assert.equal(azul.name, 'Azul', "new Product('AZU-01', 'Azul', 590).name má být 'Azul'");
assert.equal(azul.price, 590, "new Product('AZU-01', 'Azul', 590).price má být 590");
assert.equal(azul.finalPrice, 590, 'finalPrice zboží bez slevy má být jeho cena 590');
```

Zboží se zápornou cenou nebo s cenou, která není číslo, nejde vytvořit: konstruktor vyhodí `RangeError`.

```js
assert.throws(() => new Product('DOB-01', 'Dobble', -349), { name: 'RangeError' }, "new Product('DOB-01', 'Dobble', -349) má vyhodit RangeError");
assert.throws(() => new Product('DOB-01', 'Dobble', NaN), { name: 'RangeError' }, "new Product('DOB-01', 'Dobble', NaN) má vyhodit RangeError");
assert.throws(() => new Product('DOB-01', 'Dobble', '349'), { name: 'RangeError' }, "new Product('DOB-01', 'Dobble', '349') s cenou jako textem má vyhodit RangeError");
assert.equal(new Product('ZDA-01', 'Plakát zdarma', 0).price, 0, 'zboží s cenou 0 jít vytvořit má');
```

`DiscountedProduct` je druh `Product`: uloží i slevu `discount` v procentech a `finalPrice` vrátí cenu po slevě zaokrouhlenou na celé koruny.

```js
const catan = new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20);
assert.ok(catan instanceof Product, 'DiscountedProduct má rozšiřovat Product (instanceof Product)');
assert.equal(catan.name, 'Osadníci z Katanu', "new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20).name má být 'Osadníci z Katanu'");
assert.equal(catan.discount, 20, 'discount má být 20');
assert.equal(catan.finalPrice, 952, 'finalPrice za 1190 Kč se slevou 20 % má být 952');
const ticket = new DiscountedProduct('TTR-01', 'Ticket to Ride', 999, 15);
assert.equal(ticket.finalPrice, 849, 'finalPrice za 999 Kč se slevou 15 % je 849.15 a má se zaokrouhlit na 849');
const codenames = new DiscountedProduct('KRY-01', 'Krycí jména', 449, 15);
assert.equal(codenames.finalPrice, 382, 'finalPrice za 449 Kč se slevou 15 % je 381.65 a má se zaokrouhlit na 382, ne useknout');
assert.throws(() => new DiscountedProduct('TTR-02', 'Ticket to Ride: Evropa', -1, 10), { name: 'RangeError' }, 'i zboží ve slevě se zápornou cenou má vyhodit RangeError — kontrolu dělá Product');
```

Nový sklad má název, žádné zboží, hodnotu `0` a u neznámého kódu počet kusů `0`.

```js
const shop = new Warehouse('Olomouc');
assert.equal(shop.name, 'Olomouc', "new Warehouse('Olomouc').name má být 'Olomouc'");
assert.equal(shop.size, 0, 'nový sklad má mít size 0');
assert.equal(shop.totalValue, 0, 'nový sklad má mít totalValue 0');
assert.equal(shop.quantityOf('AZU-01'), 0, "quantityOf('AZU-01') v prázdném skladu má vrátit 0");
```

`add(product, quantity)` přidá kusy nového zboží a vrátí sklad, takže jde volání řetězit.

```js
const shop = new Warehouse('Olomouc');
const azul = new Product('AZU-01', 'Azul', 590);
const dobble = new Product('DOB-01', 'Dobble', 349);
const result = shop.add(azul, 4);
assert.equal(result, shop, 'add má vrátit tentýž sklad');
shop.add(dobble, 12);
assert.equal(shop.quantityOf('AZU-01'), 4, "po add(Azul, 4) má quantityOf('AZU-01') vrátit 4");
assert.equal(shop.quantityOf('DOB-01'), 12, "po add(Dobble, 12) má quantityOf('DOB-01') vrátit 12");
assert.equal(shop.size, 2, 'po přidání Azulu a Dobble má být size 2');
```

Další `add` zboží se stejným kódem kusy přičte a nový druh nezaloží; bez počtu přidá jeden kus.

```js
const shop = new Warehouse('Olomouc');
shop.add(new Product('AZU-01', 'Azul', 590), 4);
shop.add(new Product('AZU-01', 'Azul', 590), 3);
shop.add(new Product('AZU-01', 'Azul', 590));
assert.equal(shop.quantityOf('AZU-01'), 8, "po add(Azul, 4), add(Azul, 3) a add(Azul) má quantityOf('AZU-01') vrátit 8");
assert.equal(shop.size, 1, 'stejný kód je pořád jeden druh zboží — size má být 1');
```

`add` s počtem kusů, který není kladné celé číslo, vyhodí `RangeError` a zásoby nezmění.

```js
const shop = new Warehouse('Olomouc');
const azul = new Product('AZU-01', 'Azul', 590);
shop.add(azul, 2);
for (const quantity of [0, -3, 1.5, NaN]) {
  assert.throws(() => shop.add(azul, quantity), { name: 'RangeError' }, `add(Azul, ${quantity}) má vyhodit RangeError`);
}
assert.equal(shop.quantityOf('AZU-01'), 2, 'odmítnuté add nesmí změnit počet kusů 2');
```

`remove(code, quantity)` odebere kusy; když kusy dojdou, zboží ze skladu zmizí úplně.

```js
const shop = new Warehouse('Olomouc');
shop.add(new Product('AZU-01', 'Azul', 590), 4);
shop.add(new Product('DOB-01', 'Dobble', 349), 1);
shop.remove('AZU-01', 3);
assert.equal(shop.quantityOf('AZU-01'), 1, "po remove('AZU-01', 3) ze 4 kusů má zůstat 1");
shop.remove('DOB-01');
assert.equal(shop.quantityOf('DOB-01'), 0, "po remove('DOB-01') posledního kusu má quantityOf vrátit 0");
assert.equal(shop.size, 1, 'zboží s nulou kusů má ze skladu zmizet — size má být 1');
assert.equal(shop.codes().has('DOB-01'), false, "po vyprodání nemá codes() obsahovat 'DOB-01'");
```

`remove` víc kusů, než je na skladě, nebo neznámého kódu vyhodí `RangeError` a zásoby nezmění.

```js
const shop = new Warehouse('Olomouc');
shop.add(new Product('AZU-01', 'Azul', 590), 2);
assert.throws(() => shop.remove('AZU-01', 5), { name: 'RangeError' }, "remove('AZU-01', 5) ze 2 kusů má vyhodit RangeError");
assert.throws(() => shop.remove('XXX-99'), { name: 'RangeError' }, "remove('XXX-99') neznámého kódu má vyhodit RangeError");
assert.throws(() => shop.remove('AZU-01', -1), { name: 'RangeError' }, "remove('AZU-01', -1) má vyhodit RangeError");
assert.equal(shop.quantityOf('AZU-01'), 2, 'odmítnuté remove nesmí změnit počet kusů 2');
```

`totalValue` sečte `finalPrice` × počet kusů přes všechno zboží, včetně zboží ve slevě.

```js
const shop = new Warehouse('Olomouc');
shop.add(new Product('AZU-01', 'Azul', 590), 2);
shop.add(new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20), 3);
assert.equal(shop.totalValue, 4036, 'totalValue pro 2 × 590 a 3 × 952 (Katan po slevě) má být 4036 — počítáš finalPrice?');
shop.remove('AZU-01');
assert.equal(shop.totalValue, 3446, 'po odebrání jednoho Azulu má totalValue být 3446');
```

`codes()` vrátí `Set` kódů zboží a jeho změna sklad nezmění.

```js
const shop = new Warehouse('Olomouc');
shop.add(new Product('AZU-01', 'Azul', 590), 2);
shop.add(new Product('DOB-01', 'Dobble', 349), 5);
const codes = shop.codes();
assert.ok(codes instanceof Set, 'codes() má vrátit Set');
assert.deepEqual([...codes].sort(), ['AZU-01', 'DOB-01'], "codes() má obsahovat 'AZU-01' a 'DOB-01'");
codes.add('KAT-01');
codes.delete('AZU-01');
assert.equal(shop.codes().has('AZU-01'), true, 'změna vrácené množiny nesmí ze skladu odebrat Azul');
assert.equal(shop.size, 2, 'změna vrácené množiny nesmí změnit size skladu');
```

Sklad jde projít cyklem `for…of`: vydá objekty `{ product, quantity }` v pořadí, v jakém zboží poprvé přibylo.

```js
const shop = new Warehouse('Olomouc');
const azul = new Product('AZU-01', 'Azul', 590);
const dobble = new Product('DOB-01', 'Dobble', 349);
shop.add(azul, 4);
shop.add(dobble, 12);
shop.add(azul, 1);
const entries = [];
for (const entry of shop) {
  entries.push(entry);
}
assert.equal(entries.length, 2, 'for…of nad skladem se dvěma druhy zboží má proběhnout dvakrát');
assert.equal(entries[0].product, azul, 'první vydaný objekt má mít product Azul — přibyl první');
assert.equal(entries[0].quantity, 5, 'Azul má mít quantity 5');
assert.equal(entries[1].product, dobble, 'druhý vydaný objekt má mít product Dobble');
assert.equal(entries[1].quantity, 12, 'Dobble má mít quantity 12');
assert.equal([...shop].length, 2, 'sklad jde projít i podruhé, třeba spreadem');
```

Zásoby zvenku změnit nejdou: sklad nemá jinou veřejnou vlastnost než `name` a přepsání vydaného `quantity` sklad nezmění.

```js
const shop = new Warehouse('Olomouc');
shop.add(new Product('AZU-01', 'Azul', 590), 4);
assert.deepEqual(Object.keys(shop), ['name'], "Object.keys(skladu) má vrátit jen ['name'] — zásoby patří do soukromého pole");
for (const entry of shop) {
  entry.quantity = 1000;
}
assert.equal(shop.quantityOf('AZU-01'), 4, 'přepsání quantity ve vydaném objektu nesmí změnit sklad — vydávej nové objekty');
assert.equal(shop.totalValue, 2360, 'totalValue má dál počítat se 4 kusy');
```

`Warehouse.compare(first, second)` vrátí objekt se třemi množinami kódů: `onlyInFirst`, `onlyInSecond` a `inBoth`.

```js
const olomouc = new Warehouse('Olomouc');
olomouc.add(new Product('AZU-01', 'Azul', 590), 4);
olomouc.add(new Product('KRY-01', 'Krycí jména', 449), 7);
olomouc.add(new Product('KAT-01', 'Osadníci z Katanu', 1190), 2);
const brno = new Warehouse('Brno');
brno.add(new Product('AZU-01', 'Azul', 590), 1);
brno.add(new Product('DOB-01', 'Dobble', 349), 12);
const result = Warehouse.compare(olomouc, brno);
for (const key of ['onlyInFirst', 'onlyInSecond', 'inBoth']) {
  assert.ok(result[key] instanceof Set, `Warehouse.compare(…).${key} má být Set`);
}
assert.deepEqual([...result.onlyInFirst].sort(), ['KAT-01', 'KRY-01'], "onlyInFirst má obsahovat 'KAT-01' a 'KRY-01' — jen v Olomouci");
assert.deepEqual([...result.onlyInSecond], ['DOB-01'], "onlyInSecond má obsahovat jen 'DOB-01' — jen v Brně");
assert.deepEqual([...result.inBoth], ['AZU-01'], "inBoth má obsahovat jen 'AZU-01'");
assert.equal(typeof new Warehouse('Zlín').compare, 'undefined', 'compare má být statická metoda třídy Warehouse, ne metoda skladu');
```

# --help--

## --tip-- 6

Počty kusů se hodí držet v `Map` podle kódu zboží — viz [`Map`: slovník s libovolnými klíči](see:js-tridy-kolekce/map-a-set#map-slovnik-s-libovolnymi-klici). Než zapíšeš, zeptej se, jestli kód v mapě už je.

## --tip-- 13

Generátor, který vydá rovnou objekty uložené v mapě, pustí ven odkaz na vnitřní data — stejná past jako [getter, který vrací soukromé pole](see:js-tridy-kolekce/tridy#getter-vraci-soukrome-pole-ven). Vydávej pro každé zboží nový objekt.

# --seed--

## --file-- script.js

```js
// Sklad deskových her v Olomouci. Ceny jsou v celých korunách.
// Co ve skladu je, je tvoje volba — testy si přinesou vlastní zboží.

/**
 * Zboží ve skladu.
 * constructor(code, name, price) — kód (třeba 'AZU-01'), název a cena v Kč.
 * Záporná cena nebo cena, která není číslo, vyhodí RangeError.
 */
class Product {
  constructor(code, name, price) {
  }

  /** @returns {number} cena, za kterou se zboží prodává */
  get finalPrice() {
  }
}

/**
 * Zboží ve slevě. Je to druh Product.
 * constructor(code, name, price, discount) — discount je sleva v procentech (20 = 20 %).
 */
class DiscountedProduct extends Product {
  /** @returns {number} cena po slevě zaokrouhlená na celé koruny */
  get finalPrice() {
  }
}

/**
 * Sklad: kolik kusů kterého zboží v něm leží. Zásoby zvenku nejdou změnit jinak než metodami.
 * constructor(name) — název skladu.
 */
class Warehouse {
  /**
   * Porovná sortiment dvou skladů podle kódů zboží.
   * @returns {{ onlyInFirst: Set<string>, onlyInSecond: Set<string>, inBoth: Set<string> }}
   */
  static compare(first, second) {
  }

  constructor(name) {
  }

  /** @returns {number} počet různých druhů zboží */
  get size() {
  }

  /** @returns {number} součet finalPrice × počet kusů přes všechno zboží */
  get totalValue() {
  }

  /**
   * Přidá kusy zboží (výchozí 1). Neplatné množství vyhodí RangeError.
   * @returns {Warehouse} tentýž sklad, aby šlo volání řetězit
   */
  add(product, quantity = 1) {
  }

  /**
   * Odebere kusy zboží podle kódu (výchozí 1). Víc, než je na skladě, vyhodí RangeError.
   * @returns {Warehouse} tentýž sklad
   */
  remove(code, quantity = 1) {
  }

  /** @returns {number} počet kusů zboží s kódem, neznámý kód 0 */
  quantityOf(code) {
  }

  /** @returns {Set<string>} kódy zboží, které ve skladu je */
  codes() {
  }

  /** Procházení skladu: vydává { product, quantity } v pořadí, v jakém zboží poprvé přibylo. */
  *[Symbol.iterator]() {
  }
}

const olomouc = new Warehouse('Olomouc');
console.log(olomouc);
```

# --solution--

## --file-- script.js

```js
// Sklad deskových her v Olomouci. Ceny jsou v celých korunách.

class Product {
  constructor(code, name, price) {
    if (!Number.isFinite(price) || price < 0) {
      throw new RangeError('Cena musí být nezáporné číslo');
    }
    this.code = code;
    this.name = name;
    this.price = price;
  }

  // Cena, za kterou se zboží prodává.
  get finalPrice() {
    return this.price;
  }
}

class DiscountedProduct extends Product {
  constructor(code, name, price, discount) {
    super(code, name, price);
    this.discount = discount;
  }

  // Cena po slevě v procentech, zaokrouhlená na celé koruny.
  get finalPrice() {
    return Math.round((this.price * (100 - this.discount)) / 100);
  }
}

class Warehouse {
  // kód zboží → { product, quantity }
  #stock = new Map();

  // Porovná sortiment dvou skladů podle kódů zboží.
  static compare(first, second) {
    const a = first.codes();
    const b = second.codes();
    return {
      onlyInFirst: a.difference(b),
      onlyInSecond: b.difference(a),
      inBoth: a.intersection(b),
    };
  }

  constructor(name) {
    this.name = name;
  }

  get size() {
    return this.#stock.size;
  }

  get totalValue() {
    let total = 0;
    for (const { product, quantity } of this.#stock.values()) {
      total += product.finalPrice * quantity;
    }
    return total;
  }

  add(product, quantity = 1) {
    this.#assertQuantity(quantity);
    const entry = this.#stock.get(product.code);
    if (entry) {
      entry.quantity += quantity;
    } else {
      this.#stock.set(product.code, { product, quantity });
    }
    return this;
  }

  remove(code, quantity = 1) {
    this.#assertQuantity(quantity);
    const entry = this.#stock.get(code);
    if (!entry || entry.quantity < quantity) {
      throw new RangeError('Nedostatek zboží');
    }
    entry.quantity -= quantity;
    if (entry.quantity === 0) {
      this.#stock.delete(code);
    }
    return this;
  }

  quantityOf(code) {
    return this.#stock.get(code)?.quantity ?? 0;
  }

  codes() {
    return new Set(this.#stock.keys());
  }

  *[Symbol.iterator]() {
    for (const { product, quantity } of this.#stock.values()) {
      yield { product, quantity };
    }
  }

  #assertQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new RangeError('Množství musí být kladné celé číslo');
    }
  }
}

const azul = new Product('AZU-01', 'Azul', 590);
const codenames = new Product('KRY-01', 'Krycí jména', 449);
const catan = new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20);
const dobble = new Product('DOB-01', 'Dobble', 349);

const olomouc = new Warehouse('Olomouc');
olomouc.add(azul, 4).add(codenames, 7).add(catan, 2);

const brno = new Warehouse('Brno');
brno.add(azul, 1).add(dobble, 12);

for (const { product, quantity } of olomouc) {
  console.log(`${product.name}: ${quantity} ks po ${product.finalPrice} Kč`);
}
console.log('Hodnota skladu Olomouc:', olomouc.totalValue);
console.log(Warehouse.compare(olomouc, brno));
```

# --approaches--

## --approach-- Jedna mapa a generátor

Mapa „kód → `{ product, quantity }`" drží všechno o zboží pohromadě, generátor vydává kopie záznamů a `compare` je tři řádky s množinovými metodami. Nejkratší cesta, když znáš `Set.difference` a `intersection`.

### --file-- script.js

```js
// Sklad deskových her v Olomouci. Ceny jsou v celých korunách.

class Product {
  constructor(code, name, price) {
    if (!Number.isFinite(price) || price < 0) {
      throw new RangeError('Cena musí být nezáporné číslo');
    }
    this.code = code;
    this.name = name;
    this.price = price;
  }

  // Cena, za kterou se zboží prodává.
  get finalPrice() {
    return this.price;
  }
}

class DiscountedProduct extends Product {
  constructor(code, name, price, discount) {
    super(code, name, price);
    this.discount = discount;
  }

  // Cena po slevě v procentech, zaokrouhlená na celé koruny.
  get finalPrice() {
    return Math.round((this.price * (100 - this.discount)) / 100);
  }
}

class Warehouse {
  // kód zboží → { product, quantity }
  #stock = new Map();

  // Porovná sortiment dvou skladů podle kódů zboží.
  static compare(first, second) {
    const a = first.codes();
    const b = second.codes();
    return {
      onlyInFirst: a.difference(b),
      onlyInSecond: b.difference(a),
      inBoth: a.intersection(b),
    };
  }

  constructor(name) {
    this.name = name;
  }

  get size() {
    return this.#stock.size;
  }

  get totalValue() {
    let total = 0;
    for (const { product, quantity } of this.#stock.values()) {
      total += product.finalPrice * quantity;
    }
    return total;
  }

  add(product, quantity = 1) {
    this.#assertQuantity(quantity);
    const entry = this.#stock.get(product.code);
    if (entry) {
      entry.quantity += quantity;
    } else {
      this.#stock.set(product.code, { product, quantity });
    }
    return this;
  }

  remove(code, quantity = 1) {
    this.#assertQuantity(quantity);
    const entry = this.#stock.get(code);
    if (!entry || entry.quantity < quantity) {
      throw new RangeError('Nedostatek zboží');
    }
    entry.quantity -= quantity;
    if (entry.quantity === 0) {
      this.#stock.delete(code);
    }
    return this;
  }

  quantityOf(code) {
    return this.#stock.get(code)?.quantity ?? 0;
  }

  codes() {
    return new Set(this.#stock.keys());
  }

  *[Symbol.iterator]() {
    for (const { product, quantity } of this.#stock.values()) {
      yield { product, quantity };
    }
  }

  #assertQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new RangeError('Množství musí být kladné celé číslo');
    }
  }
}

const azul = new Product('AZU-01', 'Azul', 590);
const codenames = new Product('KRY-01', 'Krycí jména', 449);
const catan = new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20);
const dobble = new Product('DOB-01', 'Dobble', 349);

const olomouc = new Warehouse('Olomouc');
olomouc.add(azul, 4).add(codenames, 7).add(catan, 2);

const brno = new Warehouse('Brno');
brno.add(azul, 1).add(dobble, 12);

for (const { product, quantity } of olomouc) {
  console.log(`${product.name}: ${quantity} ks po ${product.finalPrice} Kč`);
}
console.log('Hodnota skladu Olomouc:', olomouc.totalValue);
console.log(Warehouse.compare(olomouc, brno));
```

## --approach-- Dvě mapy a pole jako iterátor

Zboží a počty kusů jsou ve dvou mapách se stejnými klíči, `[Symbol.iterator]` sestaví pole záznamů a vrátí jeho iterátor a `compare` filtruje pole kódů přes `has`. Víc řádků a dvě mapy, které se musí měnit spolu, ale obejde se to bez generátoru i bez nových metod `Set` — tak bys to psal pro starší prohlížeč.

### --file-- script.js

```js
// Sklad deskových her v Olomouci. Ceny jsou v celých korunách.

class Product {
  constructor(code, name, price) {
    if (!Number.isFinite(price) || price < 0) {
      throw new RangeError('Cena musí být nezáporné číslo');
    }
    this.code = code;
    this.name = name;
    this.price = price;
  }

  // Cena, za kterou se zboží prodává.
  get finalPrice() {
    return this.price;
  }
}

class DiscountedProduct extends Product {
  constructor(code, name, price, discount) {
    super(code, name, price);
    this.discount = discount;
  }

  // Cena po slevě v procentech, zaokrouhlená na celé koruny.
  get finalPrice() {
    return Math.round((this.price * (100 - this.discount)) / 100);
  }
}

class Warehouse {
  #products = new Map();
  #quantities = new Map();

  static compare(first, second) {
    const firstCodes = [...first.codes()];
    const secondCodes = [...second.codes()];
    return {
      onlyInFirst: new Set(firstCodes.filter((code) => !second.codes().has(code))),
      onlyInSecond: new Set(secondCodes.filter((code) => !first.codes().has(code))),
      inBoth: new Set(firstCodes.filter((code) => second.codes().has(code))),
    };
  }

  constructor(name) {
    this.name = name;
  }

  get size() {
    return this.#quantities.size;
  }

  get totalValue() {
    return [...this].reduce((sum, { product, quantity }) => sum + product.finalPrice * quantity, 0);
  }

  add(product, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new RangeError('Množství musí být kladné celé číslo');
    }
    this.#products.set(product.code, this.#products.get(product.code) ?? product);
    this.#quantities.set(product.code, this.quantityOf(product.code) + quantity);
    return this;
  }

  remove(code, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1 || this.quantityOf(code) < quantity) {
      throw new RangeError('Nedostatek zboží');
    }
    const left = this.quantityOf(code) - quantity;
    if (left === 0) {
      this.#quantities.delete(code);
      this.#products.delete(code);
    } else {
      this.#quantities.set(code, left);
    }
    return this;
  }

  quantityOf(code) {
    return this.#quantities.get(code) ?? 0;
  }

  codes() {
    return new Set(this.#quantities.keys());
  }

  [Symbol.iterator]() {
    const entries = [];
    for (const [code, product] of this.#products) {
      entries.push({ product, quantity: this.#quantities.get(code) });
    }
    return entries[Symbol.iterator]();
  }
}

const azul = new Product('AZU-01', 'Azul', 590);
const codenames = new Product('KRY-01', 'Krycí jména', 449);
const catan = new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20);
const dobble = new Product('DOB-01', 'Dobble', 349);

const olomouc = new Warehouse('Olomouc');
olomouc.add(azul, 4).add(codenames, 7).add(catan, 2);

const brno = new Warehouse('Brno');
brno.add(azul, 1).add(dobble, 12);

for (const { product, quantity } of olomouc) {
  console.log(`${product.name}: ${quantity} ks po ${product.finalPrice} Kč`);
}
console.log('Hodnota skladu Olomouc:', olomouc.totalValue);
console.log(Warehouse.compare(olomouc, brno));
```

## --approach-- Neměnné záznamy a iterator helpers

Záznam v mapě se nikdy nemění, `add` a `remove` ukládají nový objekt. Hodnotu skladu počítá `reduce` přímo na iterátoru mapy a `[Symbol.iterator]` vrací `map` nad iterátorem hodnot — tomu se věnuje nepovinná lekce [Iterator helpers](see:js-tridy-kolekce/iterator-helpers). Kontrola množství je soukromá statická metoda `static #check`.

### --file-- script.js

```js
// Sklad deskových her v Olomouci. Ceny jsou v celých korunách.

class Product {
  constructor(code, name, price) {
    if (!Number.isFinite(price) || price < 0) {
      throw new RangeError('Cena musí být nezáporné číslo');
    }
    this.code = code;
    this.name = name;
    this.price = price;
  }

  // Cena, za kterou se zboží prodává.
  get finalPrice() {
    return this.price;
  }
}

class DiscountedProduct extends Product {
  constructor(code, name, price, discount) {
    super(code, name, price);
    this.discount = discount;
  }

  // Cena po slevě v procentech, zaokrouhlená na celé koruny.
  get finalPrice() {
    return Math.round((this.price * (100 - this.discount)) / 100);
  }
}

class Warehouse {
  #stock = new Map();

  static compare(first, second) {
    const [a, b] = [first.codes(), second.codes()];
    return { onlyInFirst: a.difference(b), onlyInSecond: b.difference(a), inBoth: a.intersection(b) };
  }

  constructor(name) {
    this.name = name;
  }

  get size() {
    return this.#stock.size;
  }

  get totalValue() {
    return this.#stock.values().reduce((sum, { product, quantity }) => sum + product.finalPrice * quantity, 0);
  }

  add(product, quantity = 1) {
    Warehouse.#check(quantity);
    const current = this.#stock.get(product.code);
    this.#stock.set(product.code, { product: current?.product ?? product, quantity: (current?.quantity ?? 0) + quantity });
    return this;
  }

  remove(code, quantity = 1) {
    Warehouse.#check(quantity);
    const current = this.#stock.get(code);
    if ((current?.quantity ?? 0) < quantity) {
      throw new RangeError('Nedostatek zboží');
    }
    if (current.quantity === quantity) {
      this.#stock.delete(code);
    } else {
      this.#stock.set(code, { ...current, quantity: current.quantity - quantity });
    }
    return this;
  }

  quantityOf(code) {
    return this.#stock.get(code)?.quantity ?? 0;
  }

  codes() {
    return new Set(this.#stock.keys());
  }

  [Symbol.iterator]() {
    return this.#stock.values().map((entry) => ({ ...entry }));
  }

  static #check(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new RangeError('Množství musí být kladné celé číslo');
    }
  }
}

const azul = new Product('AZU-01', 'Azul', 590);
const codenames = new Product('KRY-01', 'Krycí jména', 449);
const catan = new DiscountedProduct('KAT-01', 'Osadníci z Katanu', 1190, 20);
const dobble = new Product('DOB-01', 'Dobble', 349);

const olomouc = new Warehouse('Olomouc');
olomouc.add(azul, 4).add(codenames, 7).add(catan, 2);

const brno = new Warehouse('Brno');
brno.add(azul, 1).add(dobble, 12);

for (const { product, quantity } of olomouc) {
  console.log(`${product.name}: ${quantity} ks po ${product.finalPrice} Kč`);
}
console.log('Hodnota skladu Olomouc:', olomouc.totalValue);
console.log(Warehouse.compare(olomouc, brno));
```

# --review--

Testy kontrolují, co třídy dělají. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Kontrola počtu kusů je napsaná jednou (soukromá metoda nebo funkce) a `add` i `remove` ji volají.
- `totalValue` se ptá zboží na `finalPrice` a neobsahuje podmínku „je to zboží ve slevě?" — o ceně rozhoduje třída zboží.
- Žádná metoda ani getter nevrací ven mapu, množinu ani objekt, který sklad drží uvnitř.
- Jména soukromých polí říkají, co obsahují (`#stock`, `#quantities`), ne `#data`.
- Víš, proč je `compare` statická metoda a ne metoda jednoho skladu.

## --extensions--

Přidej metodu `lowStock(limit)`, která vrátí názvy zboží s méně kusy, než je limit; zboží ve slevě s koncem akce (`DiscountedProduct` s datem `validUntil`); nebo `Warehouse.merge(first, second)`, která vytvoří nový sklad se součtem zásob obou prodejen.
