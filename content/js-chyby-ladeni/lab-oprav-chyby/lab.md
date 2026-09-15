---
title: Oprav pět chyb
runtime: js
kind: debug
see: js-chyby-ladeni/ladeni-systematicky#nejdriv-chybu-spolehlive-zopakuj, js-zaklady/cykly#kolikrat-cyklus-probehne, js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna, js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this, js-objekty/reference-a-mutace#funkce-ktera-ma-vracet-zmutuje-vstup, js-retezce-cisla/cisla#porovnani-desetinnych-cisel-pres
---

# --description--

Kolega napsal pro Tenisový klub Stromovka `script.js` s funkcemi pro rezervaci kurtů a odešel do jiného týmu. Recepce, pokladní a trenéři od té doby poslali pět hlášení. Chyby spolu nesouvisejí, každá je v jiné funkci — a tentokrát bez nápověd. Postupuj jako v lekci [Ladění systematicky](see:js-chyby-ladeni/ladeni-systematicky#nejdriv-chybu-spolehlive-zopakuj): každé hlášení nejdřív zopakuj voláním funkce s daty z hlášení, vyslov hypotézu a teprve pak měň kód.

## Hlášení

- **Kalendář kurtů.** Rezervační kalendář u kurtu 1 nabízí i hodinu 21:00. Klub ale ve 21:00 zavírá a poslední hodina začíná ve 20:00.
- **Rezervace dlužníků.** Petra Malá si zarezervovala kurt, přestože pravidlo klubu zní: rezervovat smí jen člen s dluhem přesně 0 Kč. V importu z tabulky má dluh nevyplněný — prázdný text `''`, protože pokladní zatím neví, kolik dluží.
- **Vyúčtování.** Stránka Vyúčtování se vůbec nenačte. V konzoli je `TypeError: Cannot read properties of undefined (reading 'hourlyRate')`.
- **Tlačítko Zpět.** Recepční zrušila rezervaci 102 a hned klikla na **Zpět**. Aplikace vrátí seznam, který si držela z doby před zrušením — jenže i v něm už je rezervace 102 zrušená.
- **Skupinová lekce.** Lekce za 200 Kč, šest hráčů zaplatilo pět plateb po 33,33 Kč a jednu 33,35 Kč. Součet je přesně 200 Kč, a přesto aplikace lekci ukazuje jako nedoplacenou.

Funkce `formatHour` a výpočet ceny v `PriceList` fungují správně a ostatní části na ně spoléhají.

## Úkol

Oprav všech pět chyb. U každé změň co nejmenší kus kódu a zkontroluj, že zbytek funguje dál. Každá chyba má v seznamu kontrol vlastní požadavek, další požadavky hlídají, že se nic nerozbilo.

# --hints--

`availableHours(bookings, court)` nabízí jen hodiny 7 až 20 a vynechá obsazené hodiny daného kurtu.

```js
const list = [
  { id: 1, court: 1, hour: 8, hours: 1, member: 'Tereza', isMember: true, status: 'potvrzeno' },
  { id: 2, court: 2, hour: 9, hours: 1, member: 'Marek', isMember: false, status: 'potvrzeno' },
  { id: 3, court: 1, hour: 20, hours: 1, member: 'Lucie', isMember: true, status: 'potvrzeno' },
];
assert.deepEqual(
  availableHours(list, 1),
  [7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  'availableHours(…, 1) s obsazenými hodinami 8 a 20 má vrátit 7, 9–19 — hodina 21 už není otevřeno',
);
assert.deepEqual(availableHours([], 3).at(-1), 20, 'availableHours([], 3) má jako poslední nabídnout hodinu 20 — ve 21 klub zavírá');
```

`canBook(member)` nepustí k rezervaci člena s nevyplněným dluhem (prázdný text).

```js
assert.equal(canBook({ name: 'Petra Malá', debt: '' }), false, "canBook({ debt: '' }) má vrátit false — neznámý dluh není dluh 0 Kč");
```

`bookingPrices(bookings, priceList)` vrátí cenu každé rezervace podle ceníku.

```js
const list = [
  { id: 1, court: 1, hour: 8, hours: 1, member: 'Tereza', isMember: true, status: 'potvrzeno' },
  { id: 2, court: 2, hour: 9, hours: 2, member: 'Marek', isMember: false, status: 'potvrzeno' },
];
assert.deepEqual(bookingPrices(list, new PriceList(360, 0.25)), [270, 720], 'bookingPrices([člen 1 h, nečlen 2 h], new PriceList(360, 0.25)) má vrátit [270, 720]');
```

`cancelBooking(bookings, id)` nezmění pole ani rezervace, které dostane.

```js
const list = [
  { id: 1, court: 1, hour: 8, hours: 1, member: 'Tereza', isMember: true, status: 'potvrzeno' },
  { id: 2, court: 2, hour: 9, hours: 1, member: 'Marek', isMember: false, status: 'potvrzeno' },
];
const before = structuredClone(list);
cancelBooking(list, 2);
assert.deepEqual(list, before, 'cancelBooking(list, 2) nesmí změnit původní seznam ani jeho rezervace — tlačítko Zpět ho potřebuje beze změny');
```

`isPaidInFull(payments, price)` uzná platby, jejichž součet je přesně cena, i když jsou v haléřích.

```js
assert.equal(isPaidInFull([33.33, 33.33, 33.33, 33.33, 33.33, 33.35], 200), true, 'isPaidInFull([5 × 33.33, 33.35], 200) má vrátit true — součet je přesně 200 Kč');
assert.equal(isPaidInFull([28.33, 28.33, 28.33, 28.33, 28.33, 28.35], 170), true, 'isPaidInFull([5 × 28.33, 28.35], 170) má vrátit true — součet je přesně 170 Kč');
```

`cancelBooking` vrátí nový seznam, ve kterém má rušená rezervace stav `zrušeno` a ostatní rezervace zůstanou stejné.

```js
const list = [
  { id: 1, court: 1, hour: 8, hours: 1, member: 'Tereza', isMember: true, status: 'potvrzeno' },
  { id: 2, court: 2, hour: 9, hours: 1, member: 'Marek', isMember: false, status: 'potvrzeno' },
];
const result = cancelBooking(list, 2);
assert.notEqual(result, list, 'cancelBooking má vrátit nový seznam, ne původní pole');
assert.deepEqual(result.map((booking) => booking.status), ['potvrzeno', 'zrušeno'], "cancelBooking(list, 2) má vrátit stavy ['potvrzeno', 'zrušeno']");
assert.equal(result[1].member, 'Marek', 'zrušená rezervace má dál obsahovat své údaje (member: Marek)');
const other = [{ id: 7, court: 3, hour: 10, hours: 1, member: 'Lucie', isMember: true, status: 'potvrzeno' }];
assert.deepEqual(cancelBooking(other, 99).map((booking) => booking.status), ['potvrzeno'], 'cancelBooking([rezervace 7], 99) s neexistujícím id nemá nic zrušit');
```

`isPaidInFull` dál odmítne nedoplatek a uzná přeplatek.

```js
assert.equal(isPaidInFull([100, 99.6], 200), false, 'isPaidInFull([100, 99.6], 200) má vrátit false — chybí 40 haléřů');
assert.equal(isPaidInFull([33.33, 33.33, 33.33, 33.33, 33.33, 33.34], 200), false, 'isPaidInFull([5 × 33.33, 33.34], 200) má vrátit false — chybí haléř');
assert.equal(isPaidInFull([66.66, 66.66, 66.67], 200), false, 'isPaidInFull([66.66, 66.66, 66.67], 200) má vrátit false — chybí haléř, tolerance „o haléř míň" je moc velká');
assert.equal(isPaidInFull([150, 60], 200), true, 'isPaidInFull([150, 60], 200) má vrátit true — přeplatek stačí');
assert.equal(isPaidInFull([], 0), true, 'isPaidInFull([], 0) má vrátit true');
```

`canBook` dál pustí člena bez dluhu a odmítne dlužníka.

```js
assert.equal(canBook({ name: 'Tereza', debt: 0 }), true, 'canBook({ debt: 0 }) má vrátit true');
assert.equal(canBook({ name: 'Ondřej', debt: 150 }), false, 'canBook({ debt: 150 }) má vrátit false');
```

`formatHour` a `PriceList` fungují dál beze změny.

```js
assert.equal(formatHour(8), '08:00', "formatHour(8) má vrátit '08:00'");
assert.equal(formatHour(20), '20:00', "formatHour(20) má vrátit '20:00'");
assert.equal(new PriceList(360, 0.25).priceFor({ hours: 2, isMember: true }), 540, 'new PriceList(360, 0.25).priceFor({ hours: 2, isMember: true }) má vrátit 540');
```

# --seed--

## --file-- script.js

```js
// Tenisový klub Stromovka — rezervace kurtů.
// Kurty se pronajímají po celých hodinách: první hodina začíná v 7:00,
// ve 21:00 klub zavírá.
const OPENING_HOUR = 7;
const CLOSING_HOUR = 21;

const bookings = [
  { id: 101, court: 1, hour: 8, hours: 1, member: 'Tereza Svobodová', isMember: true, status: 'potvrzeno' },
  { id: 102, court: 1, hour: 17, hours: 1, member: 'Marek Doležal', isMember: false, status: 'potvrzeno' },
  { id: 103, court: 2, hour: 18, hours: 1, member: 'Lucie Kratochvílová', isMember: true, status: 'potvrzeno' },
];

// Členové z importu tabulky pokladní. Nevyplněný dluh je prázdný text.
const members = [
  { name: 'Tereza Svobodová', debt: 0 },
  { name: 'Ondřej Kučera', debt: 150 },
  { name: 'Petra Malá', debt: '' },
];

// Hodina jako text pro kalendář: 8 → „08:00".
function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

// Hodiny, na které jde kurt ještě zarezervovat.
function availableHours(bookings, court) {
  const taken = bookings
    .filter((booking) => booking.court === court && booking.status === 'potvrzeno')
    .map((booking) => booking.hour);
  const hours = [];
  for (let hour = OPENING_HOUR; hour <= CLOSING_HOUR; hour++) {
    if (!taken.includes(hour)) {
      hours.push(hour);
    }
  }
  return hours;
}

// Rezervovat smí jen člen, který klubu nic nedluží (dluh přesně 0 Kč).
function canBook(member) {
  return member.debt == 0;
}

// Ceník: cena za hodinu a sleva pro členy klubu (0.25 = 25 %).
class PriceList {
  constructor(hourlyRate, memberDiscount) {
    this.hourlyRate = hourlyRate;
    this.memberDiscount = memberDiscount;
  }

  priceFor(booking) {
    const base = this.hourlyRate * booking.hours;
    return booking.isMember ? Math.round(base * (1 - this.memberDiscount)) : base;
  }
}

// Ceny všech rezervací pro stránku Vyúčtování.
function bookingPrices(bookings, priceList) {
  return bookings.map(priceList.priceFor);
}

// Nový seznam rezervací, ve kterém je rezervace s daným id zrušená.
// Předchozí seznam si aplikace drží kvůli tlačítku Zpět.
function cancelBooking(bookings, id) {
  const booking = bookings.find((item) => item.id === id);
  if (booking) {
    booking.status = 'zrušeno';
  }
  return [...bookings];
}

// Pokryjí platby hráčů cenu lekce? Platby i cena jsou v korunách s haléři.
function isPaidInFull(payments, price) {
  const paid = payments.reduce((sum, payment) => sum + payment, 0);
  return paid >= price;
}

console.log('Volné hodiny kurtu 1:', availableHours(bookings, 1).map(formatHour));
console.log('Může rezervovat:', members.filter(canBook).map((member) => member.name));
console.log('Zaplaceno:', isPaidInFull([33.33, 33.33, 33.33, 33.33, 33.33, 33.35], 200));
console.log('Vyúčtování:', bookingPrices(bookings, new PriceList(360, 0.25)));
```

# --solution--

## --file-- script.js

```js
// Tenisový klub Stromovka — rezervace kurtů.
// Kurty se pronajímají po celých hodinách: první hodina začíná v 7:00,
// ve 21:00 klub zavírá.
const OPENING_HOUR = 7;
const CLOSING_HOUR = 21;

const bookings = [
  { id: 101, court: 1, hour: 8, hours: 1, member: 'Tereza Svobodová', isMember: true, status: 'potvrzeno' },
  { id: 102, court: 1, hour: 17, hours: 1, member: 'Marek Doležal', isMember: false, status: 'potvrzeno' },
  { id: 103, court: 2, hour: 18, hours: 1, member: 'Lucie Kratochvílová', isMember: true, status: 'potvrzeno' },
];

// Členové z importu tabulky pokladní. Nevyplněný dluh je prázdný text.
const members = [
  { name: 'Tereza Svobodová', debt: 0 },
  { name: 'Ondřej Kučera', debt: 150 },
  { name: 'Petra Malá', debt: '' },
];

// Hodina jako text pro kalendář: 8 → „08:00".
function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

// Hodiny, na které jde kurt ještě zarezervovat.
function availableHours(bookings, court) {
  const taken = bookings
    .filter((booking) => booking.court === court && booking.status === 'potvrzeno')
    .map((booking) => booking.hour);
  const hours = [];
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    if (!taken.includes(hour)) {
      hours.push(hour);
    }
  }
  return hours;
}

// Rezervovat smí jen člen, který klubu nic nedluží (dluh přesně 0 Kč).
function canBook(member) {
  return member.debt === 0;
}

// Ceník: cena za hodinu a sleva pro členy klubu (0.25 = 25 %).
class PriceList {
  constructor(hourlyRate, memberDiscount) {
    this.hourlyRate = hourlyRate;
    this.memberDiscount = memberDiscount;
  }

  priceFor(booking) {
    const base = this.hourlyRate * booking.hours;
    return booking.isMember ? Math.round(base * (1 - this.memberDiscount)) : base;
  }
}

// Ceny všech rezervací pro stránku Vyúčtování.
function bookingPrices(bookings, priceList) {
  return bookings.map((booking) => priceList.priceFor(booking));
}

// Nový seznam rezervací, ve kterém je rezervace s daným id zrušená.
// Předchozí seznam si aplikace drží kvůli tlačítku Zpět.
function cancelBooking(bookings, id) {
  return bookings.map((item) => (item.id === id ? { ...item, status: 'zrušeno' } : item));
}

// Pokryjí platby hráčů cenu lekce? Platby i cena jsou v korunách s haléři.
function isPaidInFull(payments, price) {
  const paid = payments.reduce((sum, payment) => sum + payment, 0);
  return Math.round(paid * 100) >= Math.round(price * 100);
}

console.log('Volné hodiny kurtu 1:', availableHours(bookings, 1).map(formatHour));
console.log('Může rezervovat:', members.filter(canBook).map((member) => member.name));
console.log('Zaplaceno:', isPaidInFull([33.33, 33.33, 33.33, 33.33, 33.33, 33.35], 200));
console.log('Vyúčtování:', bookingPrices(bookings, new PriceList(360, 0.25)));
```

# --explain--

Vysvětli vlastními slovy, proč `bookings.map(priceList.priceFor)` spadlo na `this`, i když `priceFor` je metoda objektu `priceList`.

## --model--

Zápis `priceList.priceFor` bez závorek metodu nezavolá, jen z objektu vytáhne funkci. `map` pak tu funkci volá sám, bez objektu před tečkou, takže `this` uvnitř je `undefined` a čtení `this.hourlyRate` spadne. Hláška ukazuje do `priceFor`, ale příčina je v místě, kde se metoda předala. Oprava je předat šipkovou funkci, která metodu zavolá přes objekt, nebo `this` svázat přes `bind` či druhý argument `map`.

## --checklist--

- `priceList.priceFor` bez závorek předá jen funkci, bez objektu.
- `this` se určuje podle toho, jak se funkce zavolá, ne kde vznikla.
- `map` volá funkci bez objektu před tečkou, takže `this` je `undefined`.
- Pád je v metodě, ale příčina v místě, kde se metoda předala.
- Oprava: šipková funkce `(booking) => priceList.priceFor(booking)` nebo svázání `this`.

# --approaches--

## --approach-- Nejmenší opravy

Pět malých změn: `<` místo `<=`, `===` místo `==`, šipková funkce kolem metody, `map` s novým objektem jen pro rušenou rezervaci a porovnání v celých haléřích. Tak vypadá oprava, kterou kolega snadno zkontroluje v diffu: každá změna odpovídá jednomu hlášení.

### --file-- script.js

```js
// Tenisový klub Stromovka — rezervace kurtů.
// Kurty se pronajímají po celých hodinách: první hodina začíná v 7:00,
// ve 21:00 klub zavírá.
const OPENING_HOUR = 7;
const CLOSING_HOUR = 21;

const bookings = [
  { id: 101, court: 1, hour: 8, hours: 1, member: 'Tereza Svobodová', isMember: true, status: 'potvrzeno' },
  { id: 102, court: 1, hour: 17, hours: 1, member: 'Marek Doležal', isMember: false, status: 'potvrzeno' },
  { id: 103, court: 2, hour: 18, hours: 1, member: 'Lucie Kratochvílová', isMember: true, status: 'potvrzeno' },
];

// Členové z importu tabulky pokladní. Nevyplněný dluh je prázdný text.
const members = [
  { name: 'Tereza Svobodová', debt: 0 },
  { name: 'Ondřej Kučera', debt: 150 },
  { name: 'Petra Malá', debt: '' },
];

// Hodina jako text pro kalendář: 8 → „08:00".
function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

// Hodiny, na které jde kurt ještě zarezervovat.
function availableHours(bookings, court) {
  const taken = bookings
    .filter((booking) => booking.court === court && booking.status === 'potvrzeno')
    .map((booking) => booking.hour);
  const hours = [];
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    if (!taken.includes(hour)) {
      hours.push(hour);
    }
  }
  return hours;
}

// Rezervovat smí jen člen, který klubu nic nedluží (dluh přesně 0 Kč).
function canBook(member) {
  return member.debt === 0;
}

// Ceník: cena za hodinu a sleva pro členy klubu (0.25 = 25 %).
class PriceList {
  constructor(hourlyRate, memberDiscount) {
    this.hourlyRate = hourlyRate;
    this.memberDiscount = memberDiscount;
  }

  priceFor(booking) {
    const base = this.hourlyRate * booking.hours;
    return booking.isMember ? Math.round(base * (1 - this.memberDiscount)) : base;
  }
}

// Ceny všech rezervací pro stránku Vyúčtování.
function bookingPrices(bookings, priceList) {
  return bookings.map((booking) => priceList.priceFor(booking));
}

// Nový seznam rezervací, ve kterém je rezervace s daným id zrušená.
// Předchozí seznam si aplikace drží kvůli tlačítku Zpět.
function cancelBooking(bookings, id) {
  return bookings.map((item) => (item.id === id ? { ...item, status: 'zrušeno' } : item));
}

// Pokryjí platby hráčů cenu lekce? Platby i cena jsou v korunách s haléři.
function isPaidInFull(payments, price) {
  const paid = payments.reduce((sum, payment) => sum + payment, 0);
  return Math.round(paid * 100) >= Math.round(price * 100);
}

console.log('Volné hodiny kurtu 1:', availableHours(bookings, 1).map(formatHour));
console.log('Může rezervovat:', members.filter(canBook).map((member) => member.name));
console.log('Zaplaceno:', isPaidInFull([33.33, 33.33, 33.33, 33.33, 33.33, 33.35], 200));
console.log('Vyúčtování:', bookingPrices(bookings, new PriceList(360, 0.25)));
```

## --approach-- Odolnější zápisy

Místo drobných oprav přepíše místa tak, aby past nemohla nastat znovu: hodiny vzniknou z počtu otevřených hodin (`Array.from`), `canBook` vyžaduje číslo, `map` dostane `this` druhým argumentem a platby se sčítají rovnou v haléřích. Delší diff, ale kód sám říká, na co si dávat pozor.

### --file-- script.js

```js
// Tenisový klub Stromovka — rezervace kurtů.
// Kurty se pronajímají po celých hodinách: první hodina začíná v 7:00,
// ve 21:00 klub zavírá.
const OPENING_HOUR = 7;
const CLOSING_HOUR = 21;

const bookings = [
  { id: 101, court: 1, hour: 8, hours: 1, member: 'Tereza Svobodová', isMember: true, status: 'potvrzeno' },
  { id: 102, court: 1, hour: 17, hours: 1, member: 'Marek Doležal', isMember: false, status: 'potvrzeno' },
  { id: 103, court: 2, hour: 18, hours: 1, member: 'Lucie Kratochvílová', isMember: true, status: 'potvrzeno' },
];

// Členové z importu tabulky pokladní. Nevyplněný dluh je prázdný text.
const members = [
  { name: 'Tereza Svobodová', debt: 0 },
  { name: 'Ondřej Kučera', debt: 150 },
  { name: 'Petra Malá', debt: '' },
];

// Hodina jako text pro kalendář: 8 → „08:00".
function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

// Hodiny, na které jde kurt ještě zarezervovat.
function availableHours(bookings, court) {
  const taken = bookings
    .filter((booking) => booking.court === court && booking.status === 'potvrzeno')
    .map((booking) => booking.hour);
  const openHours = Array.from({ length: CLOSING_HOUR - OPENING_HOUR }, (_, index) => OPENING_HOUR + index);
  return openHours.filter((hour) => !taken.includes(hour));
}

// Rezervovat smí jen člen, který klubu nic nedluží (dluh přesně 0 Kč).
function canBook(member) {
  return typeof member.debt === 'number' && member.debt === 0;
}

// Ceník: cena za hodinu a sleva pro členy klubu (0.25 = 25 %).
class PriceList {
  constructor(hourlyRate, memberDiscount) {
    this.hourlyRate = hourlyRate;
    this.memberDiscount = memberDiscount;
  }

  priceFor(booking) {
    const base = this.hourlyRate * booking.hours;
    return booking.isMember ? Math.round(base * (1 - this.memberDiscount)) : base;
  }
}

// Ceny všech rezervací pro stránku Vyúčtování.
function bookingPrices(bookings, priceList) {
  return bookings.map(priceList.priceFor, priceList);
}

// Nový seznam rezervací, ve kterém je rezervace s daným id zrušená.
// Předchozí seznam si aplikace drží kvůli tlačítku Zpět.
function cancelBooking(bookings, id) {
  return bookings.map((item) => (item.id === id ? { ...item, status: 'zrušeno' } : item));
}

// Pokryjí platby hráčů cenu lekce? Platby i cena jsou v korunách s haléři.
function isPaidInFull(payments, price) {
  // v haléřích počítá JavaScript s celými čísly, a ta jsou přesná
  const paidHalere = payments.reduce((sum, payment) => sum + Math.round(payment * 100), 0);
  return paidHalere >= Math.round(price * 100);
}

console.log('Volné hodiny kurtu 1:', availableHours(bookings, 1).map(formatHour));
console.log('Může rezervovat:', members.filter(canBook).map((member) => member.name));
console.log('Zaplaceno:', isPaidInFull([33.33, 33.33, 33.33, 33.33, 33.33, 33.35], 200));
console.log('Vyúčtování:', bookingPrices(bookings, new PriceList(360, 0.25)));
```

# --review--

Testy kontrolují, že chyby zmizely. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Ke každému hlášení umíš říct, jakým voláním jsi chybu zopakoval, ještě než jsi kód změnil.
- Každá oprava mění jen místo, kde chyba vznikla, ne místo, kde se projevila.
- Žádná oprava neschovává špatnou hodnotu podmínkou typu `|| 0` nebo `?.`.
- V kódu nezůstaly pomocné výpisy ani zakomentované pokusy.
- Umíš u každé chyby pojmenovat past, ze které pochází.

## --extensions--

Rozšíření bez testů: rezervace na víc hodin (`hours: 2`) má v `availableHours` blokovat i navazující hodinu; `isPaidInFull` přepiš tak, aby vracela, kolik haléřů chybí; a k `canBook` napiš `console.assert`, který při vývoji upozorní na člena s dluhem jiného typu než číslo.
