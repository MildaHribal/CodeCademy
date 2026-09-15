---
title: Zpracování objednávek
runtime: js
see: js-funkce-hloubka/funkcionalni-styl#kompozice-vystup-jedne-funkce-je-vstupem-dalsi
---

# --description--

Pražírna Kávový mlýnek prodává kávu, pomůcky a dárkové balíčky. Administrace e-shopu potřebuje z objednávek rychlé přehledy: kolik která objednávka stojí, které tři zaplacené jsou nejdražší a kolik se utržilo v jednotlivých městech. Navíc počítání ceny dopravy trvá dlouho a vyhledávání v objednávkách nemá zatěžovat server po každém písmenu.

Tentokrát bez návodu. V `script.js` jsou ukázková data, pomalá funkce `shippingPrice` a prázdné kostry funkcí s popisem. Pomocné funkce si přidej, kostry `topOrders` a `cachedShippingPrice` klidně nahraď konstantami. Styl zápisu — `pipe`, řetězení metod, cykly nebo rekurze — je tvoje volba.

Objednávka vypadá takhle:

```js
{ id: 'OBJ-1003', customer: 'Eva Černá', city: 'Ostrava', status: 'paid', items: [
  { name: 'Degustační box', quantity: 1, items: [
    { name: 'Keňa Nyeri 100 g', price: 159, quantity: 1 },
    { name: 'Mini balíček espresso', quantity: 2, items: [{ name: 'Espresso směs 50 g', price: 69, quantity: 1 }] },
  ] },
] }
```

Položka je buď **produkt** s cenou za kus a počtem kusů, nebo **balíček** s počtem kusů a vlastními položkami. Balíček stojí tolik, kolik všechno uvnitř, a může obsahovat další balíčky. `status` je `'paid'`, `'pending'`, nebo `'cancelled'`.

Co administrace potřebuje:

- U každé objednávky vidí její cenu, i když obsahuje balíčky v balíčcích.
- Na nástěnce má tři nejdražší zaplacené objednávky i s cenou.
- V přehledu vidí tržby zaplacených objednávek podle města.
- Cena dopravy do jednoho města se počítá jen jednou.
- Hledání v objednávkách se spustí až ve chvíli, kdy obsluha dopíše.

Přesné požadavky jsou v seznamu kontrol. Jedno pravidlo platí pro všechny:

> [!REMEMBER]
> **Žádná funkce nesmí změnit pole ani objekty, které dostane.**

# --hints--

`pipe(...fns)` vrátí funkci, která hodnotu pošle přes funkce zleva doprava; bez funkcí vrátí hodnotu beze změny.

```js
const addVat = (price) => price * 1.21;
const round = (price) => Math.round(price);
assert.equal(pipe(addVat, round)(100), 121, 'pipe(addVat, round)(100) má vrátit 121');
assert.equal(pipe((n) => n + 1, (n) => n * 10)(2), 30, 'pipe(+1, ×10)(2) má vrátit 30 — funkce zleva doprava');
assert.equal(pipe()(42), 42, 'pipe()(42) má vrátit 42');
```

`itemPrice(item)` vrátí cenu produktu za všechny kusy.

```js
assert.equal(itemPrice({ name: 'Filtry', price: 149, quantity: 3 }), 447, 'itemPrice(Filtry 149 Kč × 3) má vrátit 447');
```

`itemPrice` spočítá balíček včetně počtu balíčků a balíčků uvnitř.

```js
const box = { name: 'Box', quantity: 2, items: [
  { name: 'Káva', price: 100, quantity: 1 },
  { name: 'Mini', quantity: 3, items: [{ name: 'Vzorek', price: 10, quantity: 2 }] },
] };
assert.equal(itemPrice({ name: 'Mini', quantity: 3, items: [{ name: 'Vzorek', price: 10, quantity: 2 }] }), 60, 'itemPrice(3 × Mini s 2 vzorky po 10 Kč) má vrátit 60');
assert.equal(itemPrice(box), 320, 'itemPrice(2 × Box s kávou za 100 a 3 × Mini po 20) má vrátit 2 × (100 + 60) = 320');
```

`orderTotal(order)` vrátí cenu všech položek objednávky.

```js
assert.equal(orderTotal(orders[0]), 727, 'orderTotal(OBJ-1001) má vrátit 727 (2 × 289 + 149)');
assert.equal(orderTotal(orders[2]), 416, 'orderTotal(OBJ-1003) má vrátit 416 — degustační box s balíčkem uvnitř');
assert.equal(orderTotal({ id: 'X', items: [] }), 0, 'orderTotal(objednávka bez položek) má vrátit 0');
```

`onlyPaid(orders)` vrátí jen zaplacené objednávky ve stejném pořadí.

```js
const list = [
  { id: 'A', status: 'pending' },
  { id: 'B', status: 'paid' },
  { id: 'C', status: 'cancelled' },
  { id: 'D', status: 'paid' },
];
assert.deepEqual(onlyPaid(list).map((order) => order.id), ['B', 'D'], "onlyPaid([pending, paid, cancelled, paid]) má vrátit ['B', 'D']");
```

`withTotals(orders)` vrátí kopie objednávek s vlastností `total` a ostatní vlastnosti zachová.

```js
const list = [{ id: 'A', city: 'Brno', status: 'paid', items: [{ name: 'Káva', price: 200, quantity: 2 }] }];
const [result] = withTotals(list);
assert.equal(result.total, 400, 'withTotals(…)[0].total má být 400');
assert.equal(result.city, 'Brno', 'withTotals má zachovat ostatní vlastnosti objednávky');
assert.notEqual(result, list[0], 'withTotals má vrátit kopii objednávky, ne původní objekt');
```

`byTotalDesc(orders)` vrátí nové pole od nejvyššího `total`; při shodě jde dřív nižší `id`.

```js
const list = [
  { id: 'OBJ-2003', total: 500 },
  { id: 'OBJ-2001', total: 300 },
  { id: 'OBJ-2004', total: 900 },
  { id: 'OBJ-2002', total: 500 },
];
const result = byTotalDesc(list);
assert.deepEqual(result.map((order) => order.id), ['OBJ-2004', 'OBJ-2002', 'OBJ-2003', 'OBJ-2001'], 'byTotalDesc má vrátit 900, 500 (OBJ-2002), 500 (OBJ-2003), 300');
assert.notEqual(result, list, 'byTotalDesc má vrátit nové pole');
```

`take(count)` vrátí funkci, která z pole vrátí prvních `count` položek.

```js
const firstTwo = take(2);
const firstThree = take(3);
assert.equal(typeof firstTwo, 'function', 'take(2) má vrátit funkci');
assert.deepEqual(firstTwo(['a', 'b', 'c']), ['a', 'b'], "take(2)(['a', 'b', 'c']) má vrátit ['a', 'b'] i poté, co vznikla take(3)");
assert.deepEqual(firstTwo(['x']), ['x'], "take(2)(['x']) má vrátit ['x']");
assert.deepEqual(firstThree(['a', 'b', 'c', 'd']), ['a', 'b', 'c'], 'take(3) má mít vlastní count, nezávislý na take(2)');
```

`topOrders(orders)` vrátí tři nejdražší zaplacené objednávky od nejdražší, i s `total`.

```js
const result = topOrders(orders);
assert.deepEqual(result.map((order) => order.id), ['OBJ-1004', 'OBJ-1006', 'OBJ-1001'], 'topOrders(orders) má vrátit OBJ-1004 (929), OBJ-1006 (856), OBJ-1001 (727) — nezaplacené se nepočítají');
assert.deepEqual(result.map((order) => order.total), [929, 856, 727], 'objednávky z topOrders mají mít total 929, 856, 727');
```

`revenueByCity(orders)` vrátí objekt s tržbou zaplacených objednávek pro každé město, ve kterém nějaká je.

```js
assert.deepEqual(revenueByCity(orders), { Brno: 727, Ostrava: 416, Praha: 929, 'Plzeň': 856 }, 'revenueByCity(orders) má vrátit Brno 727, Ostrava 416, Praha 929 (jen zaplacená OBJ-1004), Plzeň 856');
const list = [
  { id: 'A', city: 'Zlín', status: 'paid', items: [{ price: 100, quantity: 1 }] },
  { id: 'B', city: 'Zlín', status: 'paid', items: [{ price: 50, quantity: 2 }] },
  { id: 'C', city: 'Cheb', status: 'pending', items: [{ price: 999, quantity: 1 }] },
];
assert.deepEqual(revenueByCity(list), { 'Zlín': 200 }, 'revenueByCity má sečíst dvě zaplacené objednávky ze Zlína a Cheb bez zaplacené objednávky vynechat');
```

`memoize(fn)` zavolá `fn` pro každý argument jen jednou, i když vrátí `0`, a každý obal má vlastní mezipaměť.

```js
let calls = 0;
const discount = memoize((code) => {
  calls += 1;
  return code === 'KAVA10' ? 10 : 0;
});
assert.equal(discount('KAVA10'), 10, "memoize(discount)('KAVA10') má vrátit 10");
discount('KAVA10');
discount('NEPLATNY');
discount('NEPLATNY');
assert.equal(calls, 2, 'dva různé kódy, každý dvakrát, mají spustit fn jen dvakrát — i výsledek 0 se má zapamatovat');
const upper = memoize((text) => text.toUpperCase());
const lower = memoize((text) => text.toLowerCase());
assert.equal(upper('Káva'), 'KÁVA', "upper('Káva') má vrátit 'KÁVA'");
assert.equal(lower('Káva'), 'káva', "lower('Káva') má vrátit 'káva', ne výsledek z mezipaměti jiného obalu");
```

`cachedShippingPrice(city)` vrátí cenu dopravy a pro každé město ji spočítá jen jednou.

```js
const before = shippingCalculations;
assert.equal(cachedShippingPrice('Brno'), 89, "cachedShippingPrice('Brno') má vrátit 89");
cachedShippingPrice('Brno');
cachedShippingPrice('Brno');
assert.equal(cachedShippingPrice('Jihlava'), 129, "cachedShippingPrice('Jihlava') má vrátit 129");
assert.equal(shippingCalculations - before, 2, 'čtyři dotazy na dvě města mají spustit shippingPrice jen dvakrát');
```

`debounce(fn, delay)` zavolá `fn` jednou po chvíli klidu, s argumenty posledního zavolání, a každý obal má vlastní časovač.

```js
const searched = [];
const search = debounce((query) => searched.push(query), 60);
search('Ja');
search('Jana');
assert.deepEqual(searched, [], 'hned po zavolání obalu se hledání ještě nemá spustit');
const other = debounce((query) => searched.push(`město ${query}`), 60);
other('Brno');
await helpers.wait(350);
assert.deepEqual(searched.toSorted(), ['Jana', 'město Brno'], "po chvíli klidu má proběhnout hledání 'Jana' a nezávisle na něm 'město Brno'");
```

Žádná funkce nezmění pole objednávek ani objekty v něm.

```js
const before = JSON.stringify(orders);
const calls = { onlyPaid, withTotals, topOrders, revenueByCity };
for (const [name, fn] of Object.entries(calls)) {
  fn(orders);
  assert.equal(JSON.stringify(orders), before, `${name}(orders) změnila vstupní data`);
}
byTotalDesc(withTotals(orders));
orders.forEach((order) => orderTotal(order));
assert.equal(JSON.stringify(orders), before, 'byTotalDesc nebo orderTotal změnila vstupní data');
```

# --help--

## --tip-- 3

Balíček je strom: jeho cena je součet cen položek, spočítaných **stejnou funkcí**, krát počet balíčků. Produkt je základní případ. Viz [Rekurze: funkce, která volá sama sebe](see:js-funkce-hloubka/funkcionalni-styl#rekurze-funkce-ktera-vola-sama-sebe).

## --tip-- 12

Obal mezipaměti musí vzniknout jednou, mimo funkci, která se volá při každém dotazu. Viz past [Továrna zavolaná při každém použití](see:js-funkce-hloubka/closures#tovarna-zavolana-pri-kazdem-pouziti).

# --seed--

## --file-- script.js

```js
// Objednávky z e-shopu pražírny Kávový mlýnek. Ceny jsou v Kč za kus.
// Položka je buď produkt (price, quantity), nebo balíček (quantity, items) —
// balíček stojí tolik, kolik položky v něm, a může obsahovat další balíčky.
const orders = [
  { id: 'OBJ-1001', customer: 'Jana Nováková', city: 'Brno', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 2 },
    { name: 'Papírové filtry V60', price: 149, quantity: 1 },
  ] },
  { id: 'OBJ-1002', customer: 'Petr Svoboda', city: 'Praha', status: 'pending', items: [
    { name: 'Kolumbie Huila 1 kg', price: 890, quantity: 1 },
  ] },
  { id: 'OBJ-1003', customer: 'Eva Černá', city: 'Ostrava', status: 'paid', items: [
    { name: 'Degustační box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 1 },
      { name: 'Brazílie Santos 100 g', price: 119, quantity: 1 },
      { name: 'Mini balíček espresso', quantity: 2, items: [
        { name: 'Espresso směs 50 g', price: 69, quantity: 1 },
      ] },
    ] },
  ] },
  { id: 'OBJ-1004', customer: 'Tomáš Dvořák', city: 'Praha', status: 'paid', items: [
    { name: 'Moka konvička na 3 šálky', price: 690, quantity: 1 },
    { name: 'Brazílie Santos 250 g', price: 239, quantity: 1 },
  ] },
  { id: 'OBJ-1005', customer: 'Marie Veselá', city: 'Brno', status: 'cancelled', items: [
    { name: 'Ruční mlýnek', price: 1290, quantity: 1 },
  ] },
  { id: 'OBJ-1006', customer: 'Karel Horák', city: 'Plzeň', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 1 },
    { name: 'Dárkový box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 2 },
      { name: 'Hrnek Kávový mlýnek', price: 249, quantity: 1 },
    ] },
  ] },
];

// Počítadlo výpočtů ceny dopravy (ve skutečném e-shopu dotaz na API dopravce).
let shippingCalculations = 0;

// Cena dopravy do města v Kč. Je pomalá, proto se vyplatí si výsledek pamatovat.
function shippingPrice(city) {
  shippingCalculations += 1;
  const zones = { Praha: 79, Brno: 89, Ostrava: 99 };
  return zones[city] ?? 129;
}

/**
 * Složí funkce zleva doprava: výstup jedné je vstupem další.
 * @param {...Function} fns
 * @returns {Function} funkce jednoho argumentu
 */
function pipe(...fns) {
}

/**
 * Cena jedné položky objednávky včetně počtu kusů; u balíčku součet položek uvnitř.
 * @param {object} item produkt { price, quantity } nebo balíček { quantity, items }
 * @returns {number} cena v Kč
 */
function itemPrice(item) {
}

/**
 * Cena celé objednávky.
 * @param {object} order
 * @returns {number} cena v Kč
 */
function orderTotal(order) {
}

/**
 * Jen zaplacené objednávky (status 'paid').
 * @param {object[]} orders
 * @returns {object[]}
 */
function onlyPaid(orders) {
}

/**
 * Kopie objednávek s vlastností total.
 * @param {object[]} orders
 * @returns {object[]}
 */
function withTotals(orders) {
}

/**
 * Nové pole objednávek od nejvyššího total; při shodě podle id vzestupně.
 * @param {object[]} orders objednávky s vlastností total
 * @returns {object[]}
 */
function byTotalDesc(orders) {
}

/**
 * Vyrobí funkci, která z pole vrátí prvních count položek.
 * @param {number} count
 * @returns {Function}
 */
function take(count) {
}

/**
 * Tři nejdražší zaplacené objednávky s vlastností total. Klidně nahraď konstantou.
 * @param {object[]} orders
 * @returns {object[]}
 */
function topOrders(orders) {
}

/**
 * Tržby zaplacených objednávek podle města.
 * @param {object[]} orders
 * @returns {Object<string, number>} město → součet v Kč
 */
function revenueByCity(orders) {
}

/**
 * Obal, který si pro každý argument pamatuje výsledek fn.
 * @param {Function} fn funkce jednoho argumentu
 * @returns {Function}
 */
function memoize(fn) {
}

/**
 * Cena dopravy, která se pro každé město spočítá jen jednou. Klidně nahraď konstantou.
 * @param {string} city
 * @returns {number}
 */
function cachedShippingPrice(city) {
}

/**
 * Obal, který fn zavolá až po delay ms klidu, s argumenty posledního zavolání.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
}

console.log(topOrders(orders));
```

# --solution--

## --file-- script.js

```js
// Objednávky z e-shopu pražírny Kávový mlýnek. Ceny jsou v Kč za kus.
// Položka je buď produkt (price, quantity), nebo balíček (quantity, items) —
// balíček stojí tolik, kolik položky v něm, a může obsahovat další balíčky.
const orders = [
  { id: 'OBJ-1001', customer: 'Jana Nováková', city: 'Brno', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 2 },
    { name: 'Papírové filtry V60', price: 149, quantity: 1 },
  ] },
  { id: 'OBJ-1002', customer: 'Petr Svoboda', city: 'Praha', status: 'pending', items: [
    { name: 'Kolumbie Huila 1 kg', price: 890, quantity: 1 },
  ] },
  { id: 'OBJ-1003', customer: 'Eva Černá', city: 'Ostrava', status: 'paid', items: [
    { name: 'Degustační box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 1 },
      { name: 'Brazílie Santos 100 g', price: 119, quantity: 1 },
      { name: 'Mini balíček espresso', quantity: 2, items: [
        { name: 'Espresso směs 50 g', price: 69, quantity: 1 },
      ] },
    ] },
  ] },
  { id: 'OBJ-1004', customer: 'Tomáš Dvořák', city: 'Praha', status: 'paid', items: [
    { name: 'Moka konvička na 3 šálky', price: 690, quantity: 1 },
    { name: 'Brazílie Santos 250 g', price: 239, quantity: 1 },
  ] },
  { id: 'OBJ-1005', customer: 'Marie Veselá', city: 'Brno', status: 'cancelled', items: [
    { name: 'Ruční mlýnek', price: 1290, quantity: 1 },
  ] },
  { id: 'OBJ-1006', customer: 'Karel Horák', city: 'Plzeň', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 1 },
    { name: 'Dárkový box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 2 },
      { name: 'Hrnek Kávový mlýnek', price: 249, quantity: 1 },
    ] },
  ] },
];

// Počítadlo výpočtů ceny dopravy (ve skutečném e-shopu dotaz na API dopravce).
let shippingCalculations = 0;

// Cena dopravy do města v Kč. Je pomalá, proto se vyplatí si výsledek pamatovat.
function shippingPrice(city) {
  shippingCalculations += 1;
  const zones = { Praha: 79, Brno: 89, Ostrava: 99 };
  return zones[city] ?? 129;
}

// Složí funkce zleva doprava.
const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);

// Produkt: cena × kusy. Balíček: součet položek uvnitř × počet balíčků.
function itemPrice(item) {
  if (item.items === undefined) {
    return item.price * item.quantity;
  }
  const bundle = item.items.reduce((sum, inner) => sum + itemPrice(inner), 0);
  return bundle * item.quantity;
}

const orderTotal = (order) => order.items.reduce((sum, item) => sum + itemPrice(item), 0);

const onlyPaid = (list) => list.filter((order) => order.status === 'paid');

const withTotals = (list) => list.map((order) => ({ ...order, total: orderTotal(order) }));

const byTotalDesc = (list) => list.toSorted((a, b) => b.total - a.total || a.id.localeCompare(b.id));

const take = (count) => (list) => list.slice(0, count);

const topOrders = pipe(onlyPaid, withTotals, byTotalDesc, take(3));

function revenueByCity(list) {
  return withTotals(onlyPaid(list)).reduce((revenue, order) => {
    revenue[order.city] = (revenue[order.city] ?? 0) + order.total;
    return revenue;
  }, {});
}

function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg);
  };
}

const cachedShippingPrice = memoize(shippingPrice);

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

console.log(topOrders(orders));
```

# --approaches--

## --approach-- Malé funkce složené přes pipe

Každá funkce udělá jednu věc a `topOrders` je jen jejich pořadí. Nejsnáz se testuje po kouscích a jednotlivé kroky jde použít jinde (`withTotals` i v `revenueByCity`). Hodí se, když se stejné úpravy dat skládají na víc místech.

### --file-- script.js

```js
// Objednávky z e-shopu pražírny Kávový mlýnek. Ceny jsou v Kč za kus.
// Položka je buď produkt (price, quantity), nebo balíček (quantity, items) —
// balíček stojí tolik, kolik položky v něm, a může obsahovat další balíčky.
const orders = [
  { id: 'OBJ-1001', customer: 'Jana Nováková', city: 'Brno', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 2 },
    { name: 'Papírové filtry V60', price: 149, quantity: 1 },
  ] },
  { id: 'OBJ-1002', customer: 'Petr Svoboda', city: 'Praha', status: 'pending', items: [
    { name: 'Kolumbie Huila 1 kg', price: 890, quantity: 1 },
  ] },
  { id: 'OBJ-1003', customer: 'Eva Černá', city: 'Ostrava', status: 'paid', items: [
    { name: 'Degustační box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 1 },
      { name: 'Brazílie Santos 100 g', price: 119, quantity: 1 },
      { name: 'Mini balíček espresso', quantity: 2, items: [
        { name: 'Espresso směs 50 g', price: 69, quantity: 1 },
      ] },
    ] },
  ] },
  { id: 'OBJ-1004', customer: 'Tomáš Dvořák', city: 'Praha', status: 'paid', items: [
    { name: 'Moka konvička na 3 šálky', price: 690, quantity: 1 },
    { name: 'Brazílie Santos 250 g', price: 239, quantity: 1 },
  ] },
  { id: 'OBJ-1005', customer: 'Marie Veselá', city: 'Brno', status: 'cancelled', items: [
    { name: 'Ruční mlýnek', price: 1290, quantity: 1 },
  ] },
  { id: 'OBJ-1006', customer: 'Karel Horák', city: 'Plzeň', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 1 },
    { name: 'Dárkový box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 2 },
      { name: 'Hrnek Kávový mlýnek', price: 249, quantity: 1 },
    ] },
  ] },
];

// Počítadlo výpočtů ceny dopravy (ve skutečném e-shopu dotaz na API dopravce).
let shippingCalculations = 0;

// Cena dopravy do města v Kč. Je pomalá, proto se vyplatí si výsledek pamatovat.
function shippingPrice(city) {
  shippingCalculations += 1;
  const zones = { Praha: 79, Brno: 89, Ostrava: 99 };
  return zones[city] ?? 129;
}

// Složí funkce zleva doprava.
const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);

// Produkt: cena × kusy. Balíček: součet položek uvnitř × počet balíčků.
function itemPrice(item) {
  if (item.items === undefined) {
    return item.price * item.quantity;
  }
  const bundle = item.items.reduce((sum, inner) => sum + itemPrice(inner), 0);
  return bundle * item.quantity;
}

const orderTotal = (order) => order.items.reduce((sum, item) => sum + itemPrice(item), 0);

const onlyPaid = (list) => list.filter((order) => order.status === 'paid');

const withTotals = (list) => list.map((order) => ({ ...order, total: orderTotal(order) }));

const byTotalDesc = (list) => list.toSorted((a, b) => b.total - a.total || a.id.localeCompare(b.id));

const take = (count) => (list) => list.slice(0, count);

const topOrders = pipe(onlyPaid, withTotals, byTotalDesc, take(3));

function revenueByCity(list) {
  return withTotals(onlyPaid(list)).reduce((revenue, order) => {
    revenue[order.city] = (revenue[order.city] ?? 0) + order.total;
    return revenue;
  }, {});
}

function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg);
  };
}

const cachedShippingPrice = memoize(shippingPrice);

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

console.log(topOrders(orders));
```

## --approach-- Řetězení metod a cykly

`topOrders` je jeden řetěz `filter`, `map`, `toSorted` a `slice` — pořadí kroků je vidět bez pomocné `pipe`. Cena a tržby se počítají cyklem `for…of`, který v jednom průchodu zvládne i podmínku. Hodí se, když úpravy nesdílíš a řetěz se vejde na pár řádků.

### --file-- script.js

```js
// Objednávky z e-shopu pražírny Kávový mlýnek. Ceny jsou v Kč za kus.
// Položka je buď produkt (price, quantity), nebo balíček (quantity, items) —
// balíček stojí tolik, kolik položky v něm, a může obsahovat další balíčky.
const orders = [
  { id: 'OBJ-1001', customer: 'Jana Nováková', city: 'Brno', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 2 },
    { name: 'Papírové filtry V60', price: 149, quantity: 1 },
  ] },
  { id: 'OBJ-1002', customer: 'Petr Svoboda', city: 'Praha', status: 'pending', items: [
    { name: 'Kolumbie Huila 1 kg', price: 890, quantity: 1 },
  ] },
  { id: 'OBJ-1003', customer: 'Eva Černá', city: 'Ostrava', status: 'paid', items: [
    { name: 'Degustační box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 1 },
      { name: 'Brazílie Santos 100 g', price: 119, quantity: 1 },
      { name: 'Mini balíček espresso', quantity: 2, items: [
        { name: 'Espresso směs 50 g', price: 69, quantity: 1 },
      ] },
    ] },
  ] },
  { id: 'OBJ-1004', customer: 'Tomáš Dvořák', city: 'Praha', status: 'paid', items: [
    { name: 'Moka konvička na 3 šálky', price: 690, quantity: 1 },
    { name: 'Brazílie Santos 250 g', price: 239, quantity: 1 },
  ] },
  { id: 'OBJ-1005', customer: 'Marie Veselá', city: 'Brno', status: 'cancelled', items: [
    { name: 'Ruční mlýnek', price: 1290, quantity: 1 },
  ] },
  { id: 'OBJ-1006', customer: 'Karel Horák', city: 'Plzeň', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 1 },
    { name: 'Dárkový box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 2 },
      { name: 'Hrnek Kávový mlýnek', price: 249, quantity: 1 },
    ] },
  ] },
];

// Počítadlo výpočtů ceny dopravy (ve skutečném e-shopu dotaz na API dopravce).
let shippingCalculations = 0;

// Cena dopravy do města v Kč. Je pomalá, proto se vyplatí si výsledek pamatovat.
function shippingPrice(city) {
  shippingCalculations += 1;
  const zones = { Praha: 79, Brno: 89, Ostrava: 99 };
  return zones[city] ?? 129;
}

function pipe(...fns) {
  return (value) => {
    let result = value;
    for (const fn of fns) {
      result = fn(result);
    }
    return result;
  };
}

function itemPrice(item) {
  if ('price' in item) {
    return item.price * item.quantity;
  }
  let sum = 0;
  for (const inner of item.items) {
    sum += itemPrice(inner);
  }
  return sum * item.quantity;
}

function orderTotal(order) {
  let total = 0;
  for (const item of order.items) {
    total += itemPrice(item);
  }
  return total;
}

function onlyPaid(list) {
  return list.filter((order) => order.status === 'paid');
}

function withTotals(list) {
  return list.map((order) => ({ ...order, total: orderTotal(order) }));
}

function byTotalDesc(list) {
  return [...list].sort((a, b) => {
    if (a.total !== b.total) {
      return b.total - a.total;
    }
    return a.id < b.id ? -1 : 1;
  });
}

function take(count) {
  return (list) => list.slice(0, count);
}

// Řetězení metod místo pipe: pořadí kroků je vidět v jednom výrazu.
function topOrders(list) {
  return list
    .filter((order) => order.status === 'paid')
    .map((order) => ({ ...order, total: orderTotal(order) }))
    .toSorted((a, b) => b.total - a.total || a.id.localeCompare(b.id))
    .slice(0, 3);
}

function revenueByCity(list) {
  const revenue = {};
  for (const order of list) {
    if (order.status !== 'paid') {
      continue;
    }
    revenue[order.city] = (revenue[order.city] ?? 0) + orderTotal(order);
  }
  return revenue;
}

function memoize(fn) {
  const results = {};
  return (arg) => {
    if (!Object.hasOwn(results, arg)) {
      results[arg] = fn(arg);
    }
    return results[arg];
  };
}

const cachedShippingPrice = memoize(shippingPrice);

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };
}

console.log(topOrders(orders));
```

## --approach-- Bez rekurze a s Object.groupBy

`itemPrice` místo rekurze drží vlastní pole položek, které ještě zbývá spočítat, i s násobkem kusů nadřazených balíčků. Zásobník volání tak nemůže přetéct ani u hodně vnořených dat. `revenueByCity` je taky `pipe`: seskupí objednávky podle města a sečte je. Víc řádků, ale funguje na libovolně hlubokých datech.

### --file-- script.js

```js
// Objednávky z e-shopu pražírny Kávový mlýnek. Ceny jsou v Kč za kus.
// Položka je buď produkt (price, quantity), nebo balíček (quantity, items) —
// balíček stojí tolik, kolik položky v něm, a může obsahovat další balíčky.
const orders = [
  { id: 'OBJ-1001', customer: 'Jana Nováková', city: 'Brno', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 2 },
    { name: 'Papírové filtry V60', price: 149, quantity: 1 },
  ] },
  { id: 'OBJ-1002', customer: 'Petr Svoboda', city: 'Praha', status: 'pending', items: [
    { name: 'Kolumbie Huila 1 kg', price: 890, quantity: 1 },
  ] },
  { id: 'OBJ-1003', customer: 'Eva Černá', city: 'Ostrava', status: 'paid', items: [
    { name: 'Degustační box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 1 },
      { name: 'Brazílie Santos 100 g', price: 119, quantity: 1 },
      { name: 'Mini balíček espresso', quantity: 2, items: [
        { name: 'Espresso směs 50 g', price: 69, quantity: 1 },
      ] },
    ] },
  ] },
  { id: 'OBJ-1004', customer: 'Tomáš Dvořák', city: 'Praha', status: 'paid', items: [
    { name: 'Moka konvička na 3 šálky', price: 690, quantity: 1 },
    { name: 'Brazílie Santos 250 g', price: 239, quantity: 1 },
  ] },
  { id: 'OBJ-1005', customer: 'Marie Veselá', city: 'Brno', status: 'cancelled', items: [
    { name: 'Ruční mlýnek', price: 1290, quantity: 1 },
  ] },
  { id: 'OBJ-1006', customer: 'Karel Horák', city: 'Plzeň', status: 'paid', items: [
    { name: 'Etiopie Yirgacheffe 250 g', price: 289, quantity: 1 },
    { name: 'Dárkový box', quantity: 1, items: [
      { name: 'Keňa Nyeri 100 g', price: 159, quantity: 2 },
      { name: 'Hrnek Kávový mlýnek', price: 249, quantity: 1 },
    ] },
  ] },
];

// Počítadlo výpočtů ceny dopravy (ve skutečném e-shopu dotaz na API dopravce).
let shippingCalculations = 0;

// Cena dopravy do města v Kč. Je pomalá, proto se vyplatí si výsledek pamatovat.
function shippingPrice(city) {
  shippingCalculations += 1;
  const zones = { Praha: 79, Brno: 89, Ostrava: 99 };
  return zones[city] ?? 129;
}

const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);

// Bez rekurze: vlastní pole „co ještě spočítat" s násobkem kusů nadřazených balíčků.
function itemPrice(item) {
  const pending = [{ item, multiplier: 1 }];
  let sum = 0;
  while (pending.length > 0) {
    const { item: current, multiplier } = pending.pop();
    if (current.items === undefined) {
      sum += current.price * current.quantity * multiplier;
    } else {
      for (const inner of current.items) {
        pending.push({ item: inner, multiplier: multiplier * current.quantity });
      }
    }
  }
  return sum;
}

const sum = (numbers) => numbers.reduce((total, n) => total + n, 0);
const orderTotal = (order) => sum(order.items.map(itemPrice));
const onlyPaid = (list) => list.filter((order) => order.status === 'paid');
const withTotals = (list) => list.map((order) => ({ ...order, total: orderTotal(order) }));
const byTotalDesc = (list) => list.toSorted((a, b) => b.total - a.total || a.id.localeCompare(b.id));
const take = (count) => (list) => list.slice(0, count);
const topOrders = pipe(onlyPaid, withTotals, byTotalDesc, take(3));

const revenueByCity = pipe(
  onlyPaid,
  withTotals,
  (list) => Object.groupBy(list, (order) => order.city),
  (groups) => Object.fromEntries(Object.entries(groups).map(([city, list]) => [city, sum(list.map((order) => order.total))])),
);

function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg);
  };
}

const cachedShippingPrice = memoize(shippingPrice);

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

console.log(topOrders(orders));
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každá funkce je čistá: nečte ani nemění nic mimo své parametry (kromě `cachedShippingPrice`, která si záměrně pamatuje výsledky).
- Cena objednávky se počítá na jednom místě a `topOrders` i `revenueByCity` ji znovu nepíšou.
- Rekurze v `itemPrice` má základní případ jako první větev a každé volání dostane menší kus dat.
- Jména pomocných funkcí říkají, co dělají, bez komentáře.
- Umíš říct, proč je `memoize` bezpečné použít jen u čisté funkce, a proč by `memoize(orderTotal)` s objednávkou jako klíčem v praxi nepomohlo.

## --extensions--

Rozšíření bez testů:

- `pipe` s výpisem mezivýsledků: obal každé funkce, který do konzole napíše její jméno a výsledek.
- Mezipaměť s limitem: `memoize(fn, maxSize)`, která při překročení velikosti zapomene nejstarší záznam.
- `throttle` pro tlačítko „Obnovit objednávky", které se smí spustit nejvýš jednou za 5 sekund.
