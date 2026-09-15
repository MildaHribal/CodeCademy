---
title: Malé algoritmy
runtime: js
see: js-zaklady/reseni-problemu#2-vymysli-priklady-i-ty-okrajove, js-zaklady/cykly#cyklus-for, js-zaklady/porovnani-a-logika#rozhodovani-if-else-if-else
---

# --description--

Čtyři krátké úlohy, které se dávají na začátku technického pohovoru i v prvním týdnu programátorského kroužku. Každá je na pár řádků — a každá má okrajový případ, na kterém se dá snadno spadnout. Tentokrát bez návodu: o postupu rozhoduješ sám. Než napíšeš první řádek funkce, spočítej si ručně pár příkladů, jak ukázala lekce [Jak řešit úlohu](see:js-zaklady/reseni-problemu#2-vymysli-priklady-i-ty-okrajove).

V `script.js` jsou prázdné kostry funkcí s popisem, co mají vracet. Pomocné funkce si klidně přidej a výsledky si průběžně vypisuj do konzole.

**Hra na počítání.** Hráči se střídají v počítání od jedničky. Za násobek tří neřeknou číslo, ale první slovo, za násobek pěti druhé slovo a za násobek tří i pěti obě slova hned za sebou. V angličtině se hře říká FizzBuzz a slova jsou *Fizz* a *Buzz*. Jaká slova budou ve tvé hře, je tvoje volba — nastavíš je v konstantách `FIZZ_WORD` a `BUZZ_WORD` nahoře v souboru a testy s nimi počítají.

- Když se zeptám na jedno číslo, dozvím se, co za něj hráč řekne.
- Když zadám, do kolika se hraje, dostanu celou hru jako jeden řádek, tahy oddělené mezerou.

**Kontrolní součet.** Bankovní a knihovní systémy si u čísel ověřují překlepy součtem číslic.

- Když zadám nezáporné celé číslo, dostanu součet jeho číslic.

**Teploměr.** Aplikace o počasí ukazuje teplotu ve stupních Celsia i Fahrenheita, zaokrouhlenou na jedno desetinné místo. Vzorec je `°F = °C × 9 / 5 + 32`.

- Když zadám teplotu ve stupních Celsia, dostanu ji ve stupních Fahrenheita.
- Když zadám teplotu ve stupních Fahrenheita, dostanu ji ve stupních Celsia.

**Prvočísla.** Prvočíslo je celé číslo větší než 1, které je beze zbytku dělitelné jen jedničkou a samo sebou.

- Když zadám číslo, dozvím se, jestli je prvočíslo.
- Když zadám horní hranici, dozvím se, kolik prvočísel je od 1 do ní včetně.

Přesné požadavky jsou v seznamu kontrol.

> [!TIP]
> U každé funkce si nejdřív napiš tři až pět volání s očekávaným výsledkem do `console.log` a teprve pak ji piš. Okrajové případy — nula, jednička, hranice — zkus jako první.

# --hints--

`FIZZ_WORD` a `BUZZ_WORD` jsou dvě různá neprázdná slova.

```js
assert.equal(typeof FIZZ_WORD, 'string', 'FIZZ_WORD má být text');
assert.equal(typeof BUZZ_WORD, 'string', 'BUZZ_WORD má být text');
assert.ok(FIZZ_WORD !== '' && BUZZ_WORD !== '', 'FIZZ_WORD ani BUZZ_WORD nesmí být prázdný text');
assert.notEqual(FIZZ_WORD, BUZZ_WORD, 'FIZZ_WORD a BUZZ_WORD mají být dvě různá slova');
```

`fizzBuzz(n)` vrátí `FIZZ_WORD` pro násobky tří a `BUZZ_WORD` pro násobky pěti.

```js
for (const n of [3, 9, 99]) {
  assert.equal(fizzBuzz(n), FIZZ_WORD, `fizzBuzz(${n}) má vrátit FIZZ_WORD („${FIZZ_WORD}")`);
}
for (const n of [5, 10, 100]) {
  assert.equal(fizzBuzz(n), BUZZ_WORD, `fizzBuzz(${n}) má vrátit BUZZ_WORD („${BUZZ_WORD}")`);
}
```

`fizzBuzz(n)` vrátí pro násobky tří i pěti obě slova hned za sebou, bez mezery.

```js
for (const n of [15, 45, 90]) {
  assert.equal(fizzBuzz(n), FIZZ_WORD + BUZZ_WORD, `fizzBuzz(${n}) má vrátit „${FIZZ_WORD}${BUZZ_WORD}" — ${n} je násobek tří i pěti`);
}
```

`fizzBuzz(n)` vrátí ostatní čísla jako text: `fizzBuzz(7)` je `'7'`.

```js
for (const n of [1, 7, 98]) {
  assert.equal(String(fizzBuzz(n)), String(n), `fizzBuzz(${n}) má vrátit číslo ${n} jako text`);
}
```

`fizzBuzzLine(limit)` vrátí celou hru od 1 do `limit` jako jeden text s tahy oddělenými mezerou; `fizzBuzzLine(1)` je `'1'` a `fizzBuzzLine(0)` prázdný text.

```js
const f = FIZZ_WORD;
const b = BUZZ_WORD;
const expected = `1 2 ${f} 4 ${b} ${f} 7 8 ${f} ${b} 11 ${f} 13 14 ${f}${b}`;
assert.equal(fizzBuzzLine(15), expected, `fizzBuzzLine(15) má vrátit „${expected}" — bez mezery na začátku i na konci`);
assert.equal(fizzBuzzLine(1), '1', "fizzBuzzLine(1) má vrátit '1'");
assert.equal(fizzBuzzLine(0), '', "fizzBuzzLine(0) má vrátit prázdný text ''");
```

`digitSum(n)` vrátí součet číslic: `digitSum(2026)` je `10`, `digitSum(9045)` je `18`, `digitSum(7)` je `7`.

```js
assert.equal(digitSum(2026), 10, 'digitSum(2026) má vrátit 10 (2 + 0 + 2 + 6)');
assert.equal(digitSum(9045), 18, 'digitSum(9045) má vrátit 18 (9 + 0 + 4 + 5) — nuly uprostřed čísla se počítají');
assert.equal(digitSum(7), 7, 'digitSum(7) má vrátit 7');
```

`digitSum` zvládne nulu a čísla s nulami na konci: `digitSum(0)` je `0`, `digitSum(1000000)` je `1`.

```js
assert.equal(digitSum(0), 0, 'digitSum(0) má vrátit 0');
assert.equal(digitSum(1000000), 1, 'digitSum(1000000) má vrátit 1');
assert.equal(digitSum(90), 9, 'digitSum(90) má vrátit 9 — nula na konci čísla');
```

`celsiusToFahrenheit(celsius)` vrátí číslo zaokrouhlené na jedno desetinné místo: 0 → `32`, 100 → `212`, −40 → `-40`, 36.6 → `97.9`.

```js
assert.equal(celsiusToFahrenheit(0), 32, 'celsiusToFahrenheit(0) má vrátit 32');
assert.equal(celsiusToFahrenheit(100), 212, 'celsiusToFahrenheit(100) má vrátit 212');
assert.equal(celsiusToFahrenheit(-40), -40, 'celsiusToFahrenheit(-40) má vrátit -40');
assert.equal(celsiusToFahrenheit(36.6), 97.9, 'celsiusToFahrenheit(36.6) má vrátit číslo 97.9 (97,88 zaokrouhleno na jedno místo)');
```

`fahrenheitToCelsius(fahrenheit)` vrátí číslo zaokrouhlené na jedno desetinné místo: 212 → `100`, 98.6 → `37`, 0 → `-17.8`, 451 → `232.8`.

```js
assert.equal(fahrenheitToCelsius(212), 100, 'fahrenheitToCelsius(212) má vrátit 100');
assert.equal(fahrenheitToCelsius(98.6), 37, 'fahrenheitToCelsius(98.6) má vrátit 37');
assert.equal(fahrenheitToCelsius(0), -17.8, 'fahrenheitToCelsius(0) má vrátit číslo -17.8 (−17,77… zaokrouhleno na jedno místo)');
assert.equal(fahrenheitToCelsius(451), 232.8, 'fahrenheitToCelsius(451) má vrátit 232.8');
```

`isPrime(n)` vrátí `true` pro prvočísla (2, 3, 13, 97) a `false` pro čísla, která mají dalšího dělitele (4, 9, 15, 91).

```js
for (const n of [2, 3, 13, 97]) {
  assert.equal(isPrime(n), true, `isPrime(${n}) má vrátit true`);
}
for (const n of [4, 9, 15, 91]) {
  assert.equal(isPrime(n), false, `isPrime(${n}) má vrátit false${n === 91 ? ' — 91 = 7 × 13' : ''}`);
}
```

`isPrime(n)` vrátí `false` pro čísla menší než 2.

```js
for (const n of [1, 0, -7]) {
  assert.equal(isPrime(n), false, `isPrime(${n}) má vrátit false — prvočíslo je větší než 1`);
}
```

`countPrimes(limit)` vrátí počet prvočísel od 1 do `limit` včetně: 10 → `4`, 100 → `25`, 2 → `1`, 1 → `0`.

```js
assert.equal(countPrimes(10), 4, 'countPrimes(10) má vrátit 4 (2, 3, 5, 7)');
assert.equal(countPrimes(100), 25, 'countPrimes(100) má vrátit 25');
assert.equal(countPrimes(2), 1, 'countPrimes(2) má vrátit 1 — hranice se počítá');
assert.equal(countPrimes(1), 0, 'countPrimes(1) má vrátit 0');
```

# --help--

## --tip-- 6

Číslice čísla dostaneš dvěma cestami. Buď číslo převedeš na text a projdeš ho znak po znaku (každý znak pak zase převeď na číslo), nebo opakovaně bereš zbytek po dělení deseti a číslo desetkrát zmenšuješ, dokud nezbude nula. Viz [`for…of` prochází text znak po znaku](see:js-zaklady/cykly#for-of-prochazi-text-znak-po-znaku).

## --tip-- 10

Zkoušej dělitele od 2 výš. Když některý dělí `n` beze zbytku, víš výsledek hned a dál hledat nemusíš. Až když žádný nedělí, je to prvočíslo. Pozor, aby mezi zkoušenými děliteli nebylo `n` samo.

# --seed--

## --file-- script.js

```js
// Slova pro hru na počítání. Klidně si vyber vlastní, třeba 'Bum' a 'Prásk'.
const FIZZ_WORD = 'Fizz';
const BUZZ_WORD = 'Buzz';

/**
 * Co hráč řekne za číslo n: FIZZ_WORD za násobek tří, BUZZ_WORD za násobek pěti,
 * obě slova hned za sebou za násobek tří i pěti, jinak číslo jako text.
 * @param {number} n celé kladné číslo
 * @returns {string}
 */
function fizzBuzz(n) {
}

/**
 * Celá hra od 1 do limit jako jeden text, tahy oddělené mezerou.
 * @param {number} limit do kolika se hraje (0 = nehraje se)
 * @returns {string}
 */
function fizzBuzzLine(limit) {
}

/**
 * Součet číslic nezáporného celého čísla, třeba 2026 → 10.
 * @param {number} n
 * @returns {number}
 */
function digitSum(n) {
}

/**
 * Teplota ve °C převedená na °F, zaokrouhlená na jedno desetinné místo.
 * @param {number} celsius
 * @returns {number}
 */
function celsiusToFahrenheit(celsius) {
}

/**
 * Teplota ve °F převedená na °C, zaokrouhlená na jedno desetinné místo.
 * @param {number} fahrenheit
 * @returns {number}
 */
function fahrenheitToCelsius(fahrenheit) {
}

/**
 * Je n prvočíslo?
 * @param {number} n celé číslo
 * @returns {boolean}
 */
function isPrime(n) {
}

/**
 * Kolik prvočísel je od 1 do limit včetně.
 * @param {number} limit
 * @returns {number}
 */
function countPrimes(limit) {
}

console.log(fizzBuzzLine(15));
console.log('Součet číslic 2026:', digitSum(2026));
console.log('36,6 °C =', celsiusToFahrenheit(36.6), '°F');
console.log('Prvočísel do 100:', countPrimes(100));
```

# --solution--

## --file-- script.js

```js
// Slova pro hru na počítání. Klidně si vyber vlastní, třeba 'Bum' a 'Prásk'.
const FIZZ_WORD = 'Fizz';
const BUZZ_WORD = 'Buzz';

/**
 * Co hráč řekne za číslo n: FIZZ_WORD za násobek tří, BUZZ_WORD za násobek pěti,
 * obě slova hned za sebou za násobek tří i pěti, jinak číslo jako text.
 * @param {number} n celé kladné číslo
 * @returns {string}
 */
function fizzBuzz(n) {
  if (n % 15 === 0) {
    return FIZZ_WORD + BUZZ_WORD;
  }
  if (n % 3 === 0) {
    return FIZZ_WORD;
  }
  if (n % 5 === 0) {
    return BUZZ_WORD;
  }
  return String(n);
}

/**
 * Celá hra od 1 do limit jako jeden text, tahy oddělené mezerou.
 * @param {number} limit do kolika se hraje (0 = nehraje se)
 * @returns {string}
 */
function fizzBuzzLine(limit) {
  let line = '';
  for (let n = 1; n <= limit; n++) {
    if (line !== '') {
      line += ' ';
    }
    line += fizzBuzz(n);
  }
  return line;
}

/**
 * Součet číslic nezáporného celého čísla, třeba 2026 → 10.
 * @param {number} n
 * @returns {number}
 */
function digitSum(n) {
  let sum = 0;
  for (const digit of String(n)) {
    sum += Number(digit);
  }
  return sum;
}

/**
 * Teplota ve °C převedená na °F, zaokrouhlená na jedno desetinné místo.
 * @param {number} celsius
 * @returns {number}
 */
function celsiusToFahrenheit(celsius) {
  const fahrenheit = (celsius * 9) / 5 + 32;
  return Math.round(fahrenheit * 10) / 10;
}

/**
 * Teplota ve °F převedená na °C, zaokrouhlená na jedno desetinné místo.
 * @param {number} fahrenheit
 * @returns {number}
 */
function fahrenheitToCelsius(fahrenheit) {
  const celsius = ((fahrenheit - 32) * 5) / 9;
  return Math.round(celsius * 10) / 10;
}

/**
 * Je n prvočíslo?
 * @param {number} n celé číslo
 * @returns {boolean}
 */
function isPrime(n) {
  if (n < 2) {
    return false;
  }
  for (let divisor = 2; divisor < n; divisor++) {
    if (n % divisor === 0) {
      return false;
    }
  }
  return true;
}

/**
 * Kolik prvočísel je od 1 do limit včetně.
 * @param {number} limit
 * @returns {number}
 */
function countPrimes(limit) {
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    if (isPrime(n)) {
      count++;
    }
  }
  return count;
}

console.log(fizzBuzzLine(15));
console.log('Součet číslic 2026:', digitSum(2026));
console.log('36,6 °C =', celsiusToFahrenheit(36.6), '°F');
console.log('Prvočísel do 100:', countPrimes(100));
```

# --approaches--

## --approach-- Cyklus for a průchod textem

Nejpřímější zápis zadání: `fizzBuzz` se ptá od nejpřísnější podmínky (násobek 15), součet číslic prochází číslo převedené na text znak po znaku a `isPrime` zkouší všechny dělitele od 2 do `n − 1`. Čte se nejsnáz a na čísla do stovek je rychlý dost.

### --file-- script.js

```js
// Slova pro hru na počítání. Klidně si vyber vlastní, třeba 'Bum' a 'Prásk'.
const FIZZ_WORD = 'Fizz';
const BUZZ_WORD = 'Buzz';

function fizzBuzz(n) {
  if (n % 15 === 0) {
    return FIZZ_WORD + BUZZ_WORD;
  }
  if (n % 3 === 0) {
    return FIZZ_WORD;
  }
  if (n % 5 === 0) {
    return BUZZ_WORD;
  }
  return String(n);
}

function fizzBuzzLine(limit) {
  let line = '';
  for (let n = 1; n <= limit; n++) {
    if (line !== '') {
      line += ' ';
    }
    line += fizzBuzz(n);
  }
  return line;
}

function digitSum(n) {
  let sum = 0;
  for (const digit of String(n)) {
    sum += Number(digit);
  }
  return sum;
}

function celsiusToFahrenheit(celsius) {
  const fahrenheit = (celsius * 9) / 5 + 32;
  return Math.round(fahrenheit * 10) / 10;
}

function fahrenheitToCelsius(fahrenheit) {
  const celsius = ((fahrenheit - 32) * 5) / 9;
  return Math.round(celsius * 10) / 10;
}

function isPrime(n) {
  if (n < 2) {
    return false;
  }
  for (let divisor = 2; divisor < n; divisor++) {
    if (n % divisor === 0) {
      return false;
    }
  }
  return true;
}

function countPrimes(limit) {
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    if (isPrime(n)) {
      count++;
    }
  }
  return count;
}

console.log(fizzBuzzLine(15));
console.log('Součet číslic 2026:', digitSum(2026));
console.log('36,6 °C =', celsiusToFahrenheit(36.6), '°F');
console.log('Prvočísel do 100:', countPrimes(100));
```

## --approach-- Cyklus while a počítání se zbytkem

Součet číslic bez převodu na text: `% 10` vrátí poslední číslici a `Math.floor(rest / 10)` ji z čísla odřízne. `while` se hodí, protože předem nevíš, kolik číslic číslo má. `fizzBuzz` skládá slovo po kouscích, takže podmínku pro násobek 15 vůbec nepotřebuje — tady je `||` na místě, protože prázdný text opravdu znamená „žádné slovo". `isPrime` končí u odmocniny: když `n` nemá dělitele do `√n`, nemá žádného, a pro velká čísla je to výrazně rychlejší.

### --file-- script.js

```js
// Slova pro hru na počítání. Klidně si vyber vlastní, třeba 'Bum' a 'Prásk'.
const FIZZ_WORD = 'Fizz';
const BUZZ_WORD = 'Buzz';

function fizzBuzz(n) {
  let word = '';
  if (n % 3 === 0) {
    word += FIZZ_WORD;
  }
  if (n % 5 === 0) {
    word += BUZZ_WORD;
  }
  return word || String(n);
}

function fizzBuzzLine(limit) {
  let line = '';
  let n = 1;
  while (n <= limit) {
    line += n === 1 ? fizzBuzz(n) : ` ${fizzBuzz(n)}`;
    n++;
  }
  return line;
}

function digitSum(n) {
  let rest = n;
  let sum = 0;
  while (rest > 0) {
    sum += rest % 10;
    rest = Math.floor(rest / 10);
  }
  return sum;
}

function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 1.8 + 32) * 10) / 10;
}

function fahrenheitToCelsius(fahrenheit) {
  return Math.round(((fahrenheit - 32) / 1.8) * 10) / 10;
}

function isPrime(n) {
  if (n < 2) {
    return false;
  }
  let divisor = 2;
  while (divisor * divisor <= n) {
    if (n % divisor === 0) {
      return false;
    }
    divisor++;
  }
  return true;
}

function countPrimes(limit) {
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    if (isPrime(n)) {
      count++;
    }
  }
  return count;
}

console.log(fizzBuzzLine(15));
console.log('Součet číslic 2026:', digitSum(2026));
console.log('36,6 °C =', celsiusToFahrenheit(36.6), '°F');
console.log('Prvočísel do 100:', countPrimes(100));
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Ke každé funkci jsi měl před psaním ručně spočítané příklady včetně okrajových (0, 1, hranice).
- `countPrimes` volá `isPrime`, místo aby test prvočísla psala znovu.
- `fizzBuzzLine` volá `fizzBuzz`, místo aby pravidla hry opakovala.
- Proměnné v cyklech mají jména podle obsahu (`divisor`, `digit`), ne jen `i` a `x`.
- Víš, proč `isPrime` nesmí zkoušet dělit samotným `n`.
- Umíš říct, kdy by ses rozhodl pro `while` a kdy pro `for`.

## --extensions--

Přidej `nextPrime(n)`, která vrátí nejbližší prvočíslo větší než `n`; hru na počítání rozšiř o třetí slovo pro násobky sedmi; napiš `digitalRoot(n)`, která sčítá číslice tak dlouho, dokud nezbude jediná číslice (9045 → 18 → 9).
