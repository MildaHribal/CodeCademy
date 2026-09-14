---
title: Oprav 3 chyby
runtime: js
kind: debug
see: js-funkce/scope-a-hoisting#promenna-pouzita-pred-deklaraci, js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku, js-funkce/scope-a-hoisting#funkce-ceka-promennou-volajiciho
---

# --description--

Kolegyně napsala pro letní kino `script.js` s funkcemi pro pokladnu a online rezervace a odjela na festival. Funkce se používají na třech místech systému a z každého přišlo jedno hlášení. Chyby spolu nesouvisejí — každá je v jiné funkci a každá je jedna z pastí lekce o rozsahu platnosti.

## Hlášení

- **Studentské vstupenky.** Když pokladní zaškrtne „student", pokladna spadne s hláškou `ReferenceError: Cannot access 'price' before initialization`. Vstupenky bez slevy se prodávají bez problémů.
- **Rezervace pro rodiny.** Od čtyř vstupenek v jedné objednávce má být rezervace zdarma. Rodina se čtyřmi lístky ale platí poplatek 25 Kč a v konzoli žádná chyba není.
- **Potvrzení objednávky.** Po zaplacení se potvrzení nevygeneruje, v konzoli je `ReferenceError: row is not defined` — přestože `orderSummary` řadu v parametru dostává.

Ostatní části systému funkce volají takhle a na tom se nic nemění: `ticketPrice(age, isStudent)`, `bookingFee(ticketCount)`, `groupTotal(ticketCount, age)`, `orderSummary(row, seat, age, isStudent)` a nový tiskový modul vstupenek bude volat `seatLabel(row, seat)`.

## Úkol

Oprav všechny tři chyby. U každé změň co nejmenší kus kódu a zkontroluj, že zbytek funguje dál. Každá chyba má v seznamu kontrol vlastní požadavky. Místo `console.log` na mnoha místech zkus breakpoint: tlačítko **Nová karta**, DevTools a panel Scope ti ukážou, které proměnné v místě chyby existují.

# --hints--

Studentská vstupenka pro dospělého stojí 126 Kč a nespadne.

```js
let price;
assert.doesNotThrow(() => { price = ticketPrice(20, true); }, 'ticketPrice(20, true) nesmí spadnout — student 20 let');
assert.equal(price, 126, 'ticketPrice(20, true) má vrátit 126 (180 Kč se slevou 30 %)');
```

Studentská sleva platí i na dětskou cenu: `ticketPrice(12, true)` vrátí `63`.

```js
assert.equal(ticketPrice(12, true), 63, 'ticketPrice(12, true) má vrátit 63 (90 Kč se slevou 30 %)');
```

Vstupenky bez slevy stojí dál 90 Kč pro děti do 15 let a 180 Kč pro ostatní.

```js
assert.equal(ticketPrice(14, false), 90, 'ticketPrice(14, false) má vrátit 90 — dětská cena');
assert.equal(ticketPrice(15, false), 180, 'ticketPrice(15, false) má vrátit 180 — od 15 let plná cena');
```

Od čtyř vstupenek je poplatek za rezervaci `0`.

```js
assert.equal(bookingFee(4), 0, 'bookingFee(4) má vrátit 0 — od čtyř vstupenek je rezervace zdarma');
assert.equal(bookingFee(6), 0, 'bookingFee(6) má vrátit 0');
```

Při méně než čtyřech vstupenkách zůstává poplatek 25 Kč.

```js
assert.equal(bookingFee(1), 25, 'bookingFee(1) má vrátit 25');
assert.equal(bookingFee(3), 25, 'bookingFee(3) má vrátit 25');
```

`seatLabel(row, seat)` vrátí popisek s řadou i sedadlem.

```js
let label;
assert.doesNotThrow(() => { label = seatLabel(7, 12); }, 'seatLabel(7, 12) nesmí spadnout');
assert.equal(label, 'řada 7, sedadlo 12', "seatLabel(7, 12) má vrátit 'řada 7, sedadlo 12'");
```

`orderSummary(row, seat, age, isStudent)` vrátí potvrzení s místem a cenou včetně poplatku.

```js
assert.equal(orderSummary(7, 12, 30, false), 'řada 7, sedadlo 12 · 205 Kč', "orderSummary(7, 12, 30, false) má vrátit 'řada 7, sedadlo 12 · 205 Kč'");
assert.equal(orderSummary(3, 1, 20, true), 'řada 3, sedadlo 1 · 151 Kč', "orderSummary(3, 1, 20, true) má vrátit 'řada 3, sedadlo 1 · 151 Kč' (126 + 25)");
```

`groupTotal(ticketCount, age)` počítá cenu skupiny i s poplatkem.

```js
assert.equal(groupTotal(2, 30), 385, 'groupTotal(2, 30) má vrátit 385 (2 × 180 + 25)');
assert.equal(groupTotal(4, 10), 360, 'groupTotal(4, 10) má vrátit 360 (4 × 90, rezervace zdarma)');
```

# --help--

## --tip--

Každé hlášení odpovídá jedné pasti z lekce: [proměnná použitá před deklarací](see:js-funkce/scope-a-hoisting#promenna-pouzita-pred-deklaraci), [stínění v bloku](see:js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku) a [funkce čeká proměnnou volajícího](see:js-funkce/scope-a-hoisting#funkce-ceka-promennou-volajiciho). Nejdřív si ke každému hlášení najdi funkci, pak past.

## --tip--

Chybu si nejdřív zopakuj: pod funkce napiš volání s daty z hlášení, třeba studentskou vstupenku, rezervaci čtyř lístků a potvrzení pro řadu 7, a sleduj konzoli. U `bookingFee` dej breakpoint na řádek uvnitř `if` a v panelu Scope se podívej do částí *Local* a *Block*: kolik proměnných `fee` tam vidíš?

# --seed--

## --file-- script.js

```js
// Pokladna letního kina: ceny vstupenek, poplatek za rezervaci a potvrzení objednávky.
const BASE_PRICE = 180;
const CHILD_PRICE = 90;
const STUDENT_DISCOUNT = 0.3;
const BOOKING_FEE = 25;
const FREE_FEE_FROM = 4;

// Cena jedné vstupenky. Děti do 15 let platí dětskou cenu, studenti mají slevu 30 %.
function ticketPrice(age, isStudent) {
  if (isStudent) {
    return Math.round(price * (1 - STUDENT_DISCOUNT));
  }
  const price = age < 15 ? CHILD_PRICE : BASE_PRICE;
  return price;
}

// Poplatek za rezervaci. Od čtyř vstupenek v jedné objednávce je zdarma.
function bookingFee(ticketCount) {
  let fee = BOOKING_FEE;
  if (ticketCount >= FREE_FEE_FROM) {
    let fee = 0;
  }
  return fee;
}

// Popisek místa na vstupence.
function seatLabel(seat) {
  return `řada ${row}, sedadlo ${seat}`;
}

function formatCzk(amount) {
  return `${amount} Kč`;
}

// Cena skupiny lidí stejného věku bez slevy, včetně poplatku.
function groupTotal(ticketCount, age) {
  return ticketCount * ticketPrice(age, false) + bookingFee(ticketCount);
}

// Potvrzení objednávky jedné vstupenky.
function orderSummary(row, seat, age, isStudent) {
  const total = ticketPrice(age, isStudent) + bookingFee(1);
  return `${seatLabel(seat)} · ${formatCzk(total)}`;
}

console.log(formatCzk(groupTotal(2, 30)));
```

# --solution--

## --file-- script.js

```js
// Pokladna letního kina: ceny vstupenek, poplatek za rezervaci a potvrzení objednávky.
const BASE_PRICE = 180;
const CHILD_PRICE = 90;
const STUDENT_DISCOUNT = 0.3;
const BOOKING_FEE = 25;
const FREE_FEE_FROM = 4;

// Cena jedné vstupenky. Děti do 15 let platí dětskou cenu, studenti mají slevu 30 %.
function ticketPrice(age, isStudent) {
  const price = age < 15 ? CHILD_PRICE : BASE_PRICE;
  if (isStudent) {
    return Math.round(price * (1 - STUDENT_DISCOUNT));
  }
  return price;
}

// Poplatek za rezervaci. Od čtyř vstupenek v jedné objednávce je zdarma.
function bookingFee(ticketCount) {
  let fee = BOOKING_FEE;
  if (ticketCount >= FREE_FEE_FROM) {
    fee = 0;
  }
  return fee;
}

// Popisek místa na vstupence.
function seatLabel(row, seat) {
  return `řada ${row}, sedadlo ${seat}`;
}

function formatCzk(amount) {
  return `${amount} Kč`;
}

// Cena skupiny lidí stejného věku bez slevy, včetně poplatku.
function groupTotal(ticketCount, age) {
  return ticketCount * ticketPrice(age, false) + bookingFee(ticketCount);
}

// Potvrzení objednávky jedné vstupenky.
function orderSummary(row, seat, age, isStudent) {
  const total = ticketPrice(age, isStudent) + bookingFee(1);
  return `${seatLabel(row, seat)} · ${formatCzk(total)}`;
}

console.log(formatCzk(groupTotal(2, 30)));
```

# --explain--

Vysvětli vlastními slovy, proč `seatLabel` nenašla `row`, přestože `orderSummary`, která ji volá, parametr `row` má.

## --model--

JavaScript má lexikální rozsah platnosti: funkce vidí své parametry a proměnné a pak to, co je kolem místa, kde je napsaná. `seatLabel` je napsaná na nejvyšší úrovni skriptu, a tam žádná `row` není. Parametr `row` patří jen volání `orderSummary` a jiná funkce na něj nedosáhne, i když ji `orderSummary` zavolá. Hodnotu, kterou funkce potřebuje, jí proto musím předat parametrem: `seatLabel(row, seat)`.

## --checklist--

- Funkce hledá proměnné podle místa, kde je napsaná, ne odkud se volá.
- Parametr `row` existuje jen uvnitř volání `orderSummary`.
- Na nejvyšší úrovni skriptu žádná `row` není, proto `ReferenceError`.
- Oprava je předat řadu jako parametr.

# --approaches--

## --approach-- Nejmenší opravy

Pár změněných řádků: deklarace `price` nad kontrolu studenta, přiřazení `fee = 0` bez `let` a parametr `row` v hlavičce i volání `seatLabel`. Takovou opravu kolegyně po návratu zkontroluje v diffu za minutu.

### --file-- script.js

```js
// Pokladna letního kina: ceny vstupenek, poplatek za rezervaci a potvrzení objednávky.
const BASE_PRICE = 180;
const CHILD_PRICE = 90;
const STUDENT_DISCOUNT = 0.3;
const BOOKING_FEE = 25;
const FREE_FEE_FROM = 4;

// Cena jedné vstupenky. Děti do 15 let platí dětskou cenu, studenti mají slevu 30 %.
function ticketPrice(age, isStudent) {
  const price = age < 15 ? CHILD_PRICE : BASE_PRICE;
  if (isStudent) {
    return Math.round(price * (1 - STUDENT_DISCOUNT));
  }
  return price;
}

// Poplatek za rezervaci. Od čtyř vstupenek v jedné objednávce je zdarma.
function bookingFee(ticketCount) {
  let fee = BOOKING_FEE;
  if (ticketCount >= FREE_FEE_FROM) {
    fee = 0;
  }
  return fee;
}

// Popisek místa na vstupence.
function seatLabel(row, seat) {
  return `řada ${row}, sedadlo ${seat}`;
}

function formatCzk(amount) {
  return `${amount} Kč`;
}

// Cena skupiny lidí stejného věku bez slevy, včetně poplatku.
function groupTotal(ticketCount, age) {
  return ticketCount * ticketPrice(age, false) + bookingFee(ticketCount);
}

// Potvrzení objednávky jedné vstupenky.
function orderSummary(row, seat, age, isStudent) {
  const total = ticketPrice(age, isStudent) + bookingFee(1);
  return `${seatLabel(row, seat)} · ${formatCzk(total)}`;
}

console.log(formatCzk(groupTotal(2, 30)));
```

## --approach-- Úprava tak, aby se past nemohla vrátit

`ticketPrice` spočítá cenu jednou a slevu vyjádří číslem, takže žádná větev nečte proměnnou před deklarací. `bookingFee` nemá proměnnou, kterou by šlo zastínit — dvě větve s `return` jako guard clause. Delší diff, ale kód se čte bez pastí. Hodí se, když kód stejně upravuješ kvůli nové funkci.

### --file-- script.js

```js
// Pokladna letního kina: ceny vstupenek, poplatek za rezervaci a potvrzení objednávky.
const BASE_PRICE = 180;
const CHILD_PRICE = 90;
const STUDENT_DISCOUNT = 0.3;
const BOOKING_FEE = 25;
const FREE_FEE_FROM = 4;

// Cena jedné vstupenky. Děti do 15 let platí dětskou cenu, studenti mají slevu 30 %.
function ticketPrice(age, isStudent) {
  const price = age < 15 ? CHILD_PRICE : BASE_PRICE;
  const discount = isStudent ? STUDENT_DISCOUNT : 0;
  return Math.round(price * (1 - discount));
}

// Poplatek za rezervaci. Od čtyř vstupenek v jedné objednávce je zdarma.
function bookingFee(ticketCount) {
  if (ticketCount >= FREE_FEE_FROM) {
    return 0;
  }
  return BOOKING_FEE;
}

// Popisek místa na vstupence.
function seatLabel(row, seat) {
  return `řada ${row}, sedadlo ${seat}`;
}

function formatCzk(amount) {
  return `${amount} Kč`;
}

// Cena skupiny lidí stejného věku bez slevy, včetně poplatku.
function groupTotal(ticketCount, age) {
  return ticketCount * ticketPrice(age, false) + bookingFee(ticketCount);
}

// Potvrzení objednávky jedné vstupenky.
function orderSummary(row, seat, age, isStudent) {
  const total = ticketPrice(age, isStudent) + bookingFee(1);
  return `${seatLabel(row, seat)} · ${formatCzk(total)}`;
}

console.log(formatCzk(groupTotal(2, 30)));
```
