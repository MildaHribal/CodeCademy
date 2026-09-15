---
title: Oprav 3 chyby
runtime: js
kind: debug
see: js-zaklady/porovnani-a-logika#misto-v-podmince, js-zaklady/cykly#pruchod-navic, js-zaklady/porovnani-a-logika#porovnani-textu-s-cislem
---

# --description--

Kolega napsal pro Kino Hvězda `script.js` s funkcemi pro pokladnu a online rezervace a odjel na dovolenou. První den provozu přišla tři hlášení. Chyby spolu nesouvisejí — každá je v jiné funkci.

## Hlášení

- **Členská sleva pro všechny.** Dospělý bez karty kinoklubu platí 180 Kč, s kartou 150 Kč. Pokladna ale účtuje 150 Kč i lidem, kteří kartu nemají: `ticketPrice(35, false)` vrací `150`.
- **Chybí sedadlo na kraji.** V řadě A je 12 sedadel. Plánek sálu na webu ukazuje jen `A1` až `A11` a sedadlo `A12` si nikdo nemůže koupit.
- **Vyprodáno, a přesto se prodává.** Rezervační systém posílá počet volných míst jako text. U vyprodaného představení pošle `'0'`, jenže web dál nabízí tlačítko Koupit: `isSoldOut('0')` vrací `false`.

Funkce `formatDuration` funguje správně a program pod funkcemi na ni spoléhá.

## Úkol

Oprav všechny tři chyby. U každé změň co nejmenší kus kódu a zkontroluj, že zbytek funguje dál. Každá chyba má v seznamu kontrol vlastní požadavky.

# --hints--

`ticketPrice` účtuje dospělému bez karty plnou cenu 180 Kč.

```js
assert.equal(ticketPrice(35, false), 180, 'ticketPrice(35, false) má vrátit 180 — bez karty kinoklubu se sleva nedává');
```

`ticketPrice` nedá slevu nikomu bez karty: dítě platí 120 Kč a senior 130 Kč.

```js
assert.equal(ticketPrice(10, false), 120, 'ticketPrice(10, false) má vrátit 120 — dítě bez karty');
assert.equal(ticketPrice(70, false), 130, 'ticketPrice(70, false) má vrátit 130 — senior bez karty');
```

`ticketPrice` dál dává členům slevu 30 Kč a hranice věku zůstávají: 15 let je dospělý, 65 let senior.

```js
assert.equal(ticketPrice(35, true), 150, 'ticketPrice(35, true) má vrátit 150 — člen kinoklubu má slevu 30 Kč');
assert.equal(ticketPrice(70, true), 100, 'ticketPrice(70, true) má vrátit 100 — senior se slevou');
assert.equal(ticketPrice(14, true), 90, 'ticketPrice(14, true) má vrátit 90 — do 14 let je to dětská vstupenka');
assert.equal(ticketPrice(15, true), 150, 'ticketPrice(15, true) má vrátit 150 — od 15 let se platí jako dospělý');
assert.equal(ticketPrice(65, true), 100, 'ticketPrice(65, true) má vrátit 100 — od 65 let je senior');
```

`seatLabels('A', 12)` vrátí všech dvanáct sedadel od `A1` do `A12`.

```js
assert.equal(seatLabels('A', 12), 'A1 A2 A3 A4 A5 A6 A7 A8 A9 A10 A11 A12', "seatLabels('A', 12) má vrátit dvanáct sedadel A1 až A12 oddělených mezerou");
```

`seatLabels` funguje pro krátkou řadu: `seatLabels('C', 3)` je `C1 C2 C3` a `seatLabels('D', 1)` je `D1`.

```js
assert.equal(seatLabels('C', 3), 'C1 C2 C3', "seatLabels('C', 3) má vrátit 'C1 C2 C3'");
assert.equal(seatLabels('D', 1), 'D1', "seatLabels('D', 1) má vrátit 'D1' — i řada s jediným sedadlem");
```

`seatLabels('E', 0)` vrátí prázdný text — řada bez sedadel.

```js
assert.equal(seatLabels('E', 0), '', "seatLabels('E', 0) má vrátit prázdný text ''");
```

`isSoldOut('0')` vrátí `true`.

```js
assert.equal(isSoldOut('0'), true, "isSoldOut('0') má vrátit true — nula volných míst je vyprodáno, i když přišla jako text");
```

`isSoldOut` pro volná místa vrátí `false`: `isSoldOut('12')` i `isSoldOut('1')`.

```js
assert.equal(isSoldOut('12'), false, "isSoldOut('12') má vrátit false");
assert.equal(isSoldOut('1'), false, "isSoldOut('1') má vrátit false — poslední volné místo se ještě prodává");
```

`formatDuration` dál vrací délku filmu v hodinách a minutách: `formatDuration(125)` je `2 h 5 min`.

```js
assert.equal(formatDuration(125), '2 h 5 min', "formatDuration(125) má vrátit '2 h 5 min'");
assert.equal(formatDuration(90), '1 h 30 min', "formatDuration(90) má vrátit '1 h 30 min'");
```

# --help--

## --tip--

Každá chyba odpovídá jedné pasti z lekcí: [`=` místo `===` v podmínce](see:js-zaklady/porovnani-a-logika#misto-v-podmince), [průchod navíc](see:js-zaklady/cykly#pruchod-navic) a [porovnání textu s číslem](see:js-zaklady/porovnani-a-logika#porovnani-textu-s-cislem). Nejdřív si ke každému hlášení najdi funkci, pak past.

## --tip--

Než začneš opravovat, chybu si zopakuj: pod funkce napiš výpis s daty z hlášení, třeba `console.log(ticketPrice(35, false))`, a sleduj konzoli. Když si nejsi jistý, co se ve funkci děje, zastav ji příkazem `debugger;` a podívej se do panelu Scope. Po opravě stejný výpis ukáže, jestli chyba zmizela.

# --seed--

## --file-- script.js

```js
// Kino Hvězda: pokladna a online rezervace.

// Cena vstupenky podle věku. Členové kinoklubu mají slevu 30 Kč.
function ticketPrice(age, isMember) {
  let price = 180;
  if (age < 15) {
    price = 120;
  } else if (age >= 65) {
    price = 130;
  }
  if (isMember = true) {
    price -= 30;
  }
  return price;
}

// Popisky sedadel v řadě pro plánek sálu, třeba „C1 C2 C3".
function seatLabels(row, seatCount) {
  let labels = '';
  for (let seat = 1; seat < seatCount; seat++) {
    if (labels !== '') {
      labels += ' ';
    }
    labels += `${row}${seat}`;
  }
  return labels;
}

// Je představení vyprodané? Rezervační systém posílá počet volných míst jako text.
function isSoldOut(freeSeatsText) {
  return freeSeatsText === 0;
}

// Délka filmu v minutách jako „2 h 5 min".
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

console.log('Dospělý bez karty:', ticketPrice(35, false), 'Kč');
console.log('Řada A:', seatLabels('A', 12));
console.log('Vyprodáno:', isSoldOut('0'));
console.log('Délka filmu:', formatDuration(125));
```

# --solution--

## --file-- script.js

```js
// Kino Hvězda: pokladna a online rezervace.

// Cena vstupenky podle věku. Členové kinoklubu mají slevu 30 Kč.
function ticketPrice(age, isMember) {
  let price = 180;
  if (age < 15) {
    price = 120;
  } else if (age >= 65) {
    price = 130;
  }
  if (isMember === true) {
    price -= 30;
  }
  return price;
}

// Popisky sedadel v řadě pro plánek sálu, třeba „C1 C2 C3".
function seatLabels(row, seatCount) {
  let labels = '';
  for (let seat = 1; seat <= seatCount; seat++) {
    if (labels !== '') {
      labels += ' ';
    }
    labels += `${row}${seat}`;
  }
  return labels;
}

// Je představení vyprodané? Rezervační systém posílá počet volných míst jako text.
function isSoldOut(freeSeatsText) {
  return Number(freeSeatsText) === 0;
}

// Délka filmu v minutách jako „2 h 5 min".
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

console.log('Dospělý bez karty:', ticketPrice(35, false), 'Kč');
console.log('Řada A:', seatLabels('A', 12));
console.log('Vyprodáno:', isSoldOut('0'));
console.log('Délka filmu:', formatDuration(125));
```

# --explain--

Vysvětli vlastními slovy, proč `if (isMember = true)` nespadlo s chybou a přesto dávalo slevu všem.

## --model--

Jedno rovnítko je přiřazení, ne porovnání. Podmínka do `isMember` uložila `true` a výsledkem přiřazení je právě ta uložená hodnota, takže podmínka platila vždycky. Zápis je platný JavaScript, a proto program nic nenahlásil — chyba je v logice, ne v syntaxi. V podmínce patří `===`, nebo rovnou `if (isMember)`, protože `isMember` už je `true`, nebo `false`.

## --checklist--

- Jedno `=` v podmínce přiřazuje, neporovnává.
- Výsledkem přiřazení je přiřazená hodnota, tady `true`, takže podmínka platí vždy.
- Zápis je platný, proto program nehlásí žádnou chybu.
- Oprava je `===`, nebo samotná proměnná s `true`/`false` v podmínce.

# --approaches--

## --approach-- Nejmenší opravy

Tři změny po jednom řádku: `===` místo `=`, `<=` v hlavičce cyklu a výslovný převod textu na číslo. Takovou opravu kolega po návratu zkontroluje na první pohled.

### --file-- script.js

```js
// Kino Hvězda: pokladna a online rezervace.

// Cena vstupenky podle věku. Členové kinoklubu mají slevu 30 Kč.
function ticketPrice(age, isMember) {
  let price = 180;
  if (age < 15) {
    price = 120;
  } else if (age >= 65) {
    price = 130;
  }
  if (isMember === true) {
    price -= 30;
  }
  return price;
}

// Popisky sedadel v řadě pro plánek sálu, třeba „C1 C2 C3".
function seatLabels(row, seatCount) {
  let labels = '';
  for (let seat = 1; seat <= seatCount; seat++) {
    if (labels !== '') {
      labels += ' ';
    }
    labels += `${row}${seat}`;
  }
  return labels;
}

// Je představení vyprodané? Rezervační systém posílá počet volných míst jako text.
function isSoldOut(freeSeatsText) {
  return Number(freeSeatsText) === 0;
}

// Délka filmu v minutách jako „2 h 5 min".
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

console.log('Dospělý bez karty:', ticketPrice(35, false), 'Kč');
console.log('Řada A:', seatLabels('A', 12));
console.log('Vyprodáno:', isSoldOut('0'));
console.log('Délka filmu:', formatDuration(125));
```

## --approach-- Opravy, po kterých se past nevrátí

Podmínka se ptá rovnou na `isMember`, takže v ní rovnítko ani nemá kde chybět. Cyklus počítá od nuly se vzorem `i < n` a číslo sedadla je `i + 1`. Počet volných míst se převede hned na začátku funkce do pojmenované proměnné a porovnání `<= 0` zvládne i záporné číslo, kdyby ho systém omylem poslal.

### --file-- script.js

```js
// Kino Hvězda: pokladna a online rezervace.

// Cena vstupenky podle věku. Členové kinoklubu mají slevu 30 Kč.
function ticketPrice(age, isMember) {
  let price = 180;
  if (age < 15) {
    price = 120;
  } else if (age >= 65) {
    price = 130;
  }
  if (isMember) {
    price -= 30;
  }
  return price;
}

// Popisky sedadel v řadě pro plánek sálu, třeba „C1 C2 C3".
function seatLabels(row, seatCount) {
  let labels = '';
  for (let i = 0; i < seatCount; i++) {
    if (labels !== '') {
      labels += ' ';
    }
    labels += `${row}${i + 1}`;
  }
  return labels;
}

// Je představení vyprodané? Rezervační systém posílá počet volných míst jako text.
function isSoldOut(freeSeatsText) {
  const freeSeats = Number(freeSeatsText);
  return freeSeats <= 0;
}

// Délka filmu v minutách jako „2 h 5 min".
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

console.log('Dospělý bez karty:', ticketPrice(35, false), 'Kč');
console.log('Řada A:', seatLabels('A', 12));
console.log('Vyprodáno:', isSoldOut('0'));
console.log('Délka filmu:', formatDuration(125));
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každou chybu jsi nejdřív zopakoval výpisem nebo v debuggeru a teprve pak opravil.
- U každé chyby umíš jednou větou říct příčinu, ne jen opravu.
- Oprava mění jen řádek s chybou, zbytek kódu zůstal, jak byl.
- V podmínkách nezůstalo `==` ani jedno `=`.
- Text z rezervačního systému převádíš na číslo výslovně, ne spoléháním na `==`.

## --extensions--

Přidej funkci `rowPlan(row, seatCount, takenSeat)`, která u obsazeného sedadla místo popisku napíše `XX`; napiš si k ní tabulku příkladů včetně sedadla na kraji řady.
