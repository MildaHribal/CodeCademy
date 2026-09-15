---
title: Generátor a kontrola hesel
runtime: js
see: js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny, js-funkce/funkce#vychozi-a-zbytkove-parametry
---

# --description--

Registrační formulář potřebuje dvě věci: tlačítko „Vygeneruj mi heslo" a ukazatel síly hesla, který se mění při psaní. Napíšeš k tomu sadu malých funkcí. Tentokrát bez návodu — rozklad na funkce je daný kostrami v `script.js`, postup uvnitř je na tobě.

Náhoda se špatně testuje: jak ověříš funkci, která pokaždé vrátí něco jiného? Proto funkce, které náhodu potřebují, dostanou **funkci `random` jako parametr** — callback, který vrací číslo od 0 do 1 stejně jako `Math.random`. V aplikaci se použije výchozí `Math.random`, v testech se předá funkce s předem daným výsledkem, třeba `() => 0.5`. Na tomhle triku stojí testování většiny kódu s náhodou nebo časem.

Co formulář od funkcí chce:

- Celé náhodné číslo i náhodný znak jde získat s vlastní náhodou i bez ní.
- Vygenerované heslo má zadanou délku, nikdy ale kratší než `MIN_LENGTH`. Bez argumentů má 16 znaků z `DEFAULT_CHARS`.
- Ukazatel síly počítá body za délku, číslice, velká písmena a symboly a ukáže slovní hodnocení.
- Kdo si radši pamatuje slova, dostane heslovou frázi z náhodných slov, třeba `kopec-řeka-les-chata`.

Slova pro heslovou frázi a výpisy do konzole jsou tvoje volba: fráze z pohádek, z Pokémonů, z pražských ulic. Testy si posílají vlastní slova.

Přesné požadavky jsou v seznamu kontrol. Pomocné funkce si klidně přidej a funkce volej navzájem — `pickChar` se hodí v `generatePassword`, `countMatching` v `passwordScore`.

> [!NOTE]
> `Math.random` stačí na výuku a hry, ne na skutečná hesla: jeho čísla nejsou kryptograficky bezpečná. Ve skutečné aplikaci se použije `crypto.getRandomValues()` z Web Crypto API. Díky parametru `random` ho do svých funkcí dostaneš bez přepisování — to je jedno z rozšíření na konci.

# --hints--

`randomInt(max, random)` převede číslo z `random()` na celé číslo od `0` do `max - 1`.

```js
assert.equal(randomInt(10, () => 0), 0, 'randomInt(10, () => 0) má vrátit 0');
assert.equal(randomInt(10, () => 0.999), 9, 'randomInt(10, () => 0.999) má vrátit 9 — nikdy ne 10');
assert.equal(randomInt(6, () => 0.5), 3, 'randomInt(6, () => 0.5) má vrátit 3');
```

`randomInt(max)` bez druhého argumentu použije `Math.random` a vrací jen celá čísla v rozsahu.

```js
for (let i = 0; i < 200; i++) {
  const value = randomInt(4);
  assert.ok(Number.isInteger(value) && value >= 0 && value < 4, `randomInt(4) má vrátit celé číslo 0–3, vrátil ${value}`);
}
```

`pickChar(chars, random)` vrátí znak z textu podle náhodného čísla.

```js
assert.equal(pickChar('abc', () => 0), 'a', "pickChar('abc', () => 0) má vrátit 'a'");
assert.equal(pickChar('abc', () => 0.99), 'c', "pickChar('abc', () => 0.99) má vrátit 'c'");
assert.equal(pickChar('xyz', () => 0.4), 'y', "pickChar('xyz', () => 0.4) má vrátit 'y'");
```

`generatePassword(length, chars, random)` vrátí heslo zadané délky a pro každý znak zavolá `random`.

```js
const sequence = (...values) => {
  let index = 0;
  return () => values[index++ % values.length];
};
assert.equal(generatePassword(10, 'ab', sequence(0, 0.7)), 'ababababab', "generatePassword(10, 'ab', náhoda 0, 0.7, 0, …) má vrátit 'ababababab'");
assert.equal(generatePassword(12, 'k', () => 0), 'kkkkkkkkkkkk', "generatePassword(12, 'k', …) má vrátit 12× 'k'");
```

`generatePassword()` bez argumentů vrátí 16 znaků, všechny z `DEFAULT_CHARS`.

```js
const password = generatePassword();
assert.equal(typeof password, 'string', 'generatePassword() má vrátit text');
assert.equal(password.length, 16, 'generatePassword() má vrátit heslo o 16 znacích');
for (const char of password) {
  assert.ok(DEFAULT_CHARS.includes(char), `generatePassword() vrátil znak „${char}", který v DEFAULT_CHARS není`);
}
```

`generatePassword` nikdy nevrátí heslo kratší než `MIN_LENGTH` (8 znaků).

```js
assert.equal(generatePassword(5, 'x', () => 0), 'xxxxxxxx', "generatePassword(5, 'x', …) má vrátit 8 znaků — kratší heslo formulář nepovolí");
assert.equal(generatePassword(0, 'x', () => 0).length, 8, 'generatePassword(0, …) má vrátit 8 znaků');
```

`countMatching(text, test)` spočítá znaky, pro které callback `test` vrátí `true`.

```js
assert.equal(countMatching('banán', (char) => char === 'n'), 2, "countMatching('banán', znak je n) má vrátit 2");
assert.equal(countMatching('abc', () => false), 0, "countMatching('abc', vždy false) má vrátit 0");
assert.equal(countMatching('', () => true), 0, "countMatching('', vždy true) má vrátit 0");
```

`isDigit` pozná každou číslici 0–9, i `0` a `1`, které v konstantě `DIGITS` chybí.

```js
assert.equal(isDigit('7'), true, "isDigit('7') má vrátit true");
assert.equal(isDigit('0'), true, "isDigit('0') má vrátit true");
assert.equal(isDigit('a'), false, "isDigit('a') má vrátit false");
assert.equal(isDigit('!'), false, "isDigit('!') má vrátit false");
```

`isUppercase` pozná velké písmeno i s diakritikou.

```js
assert.equal(isUppercase('K'), true, "isUppercase('K') má vrátit true");
assert.equal(isUppercase('Č'), true, "isUppercase('Č') má vrátit true — i česká velká písmena");
assert.equal(isUppercase('ž'), false, "isUppercase('ž') má vrátit false");
assert.equal(isUppercase('5'), false, "isUppercase('5') má vrátit false");
```

`isSymbol` vrátí `true` pro znak, který není písmeno, číslice ani mezera.

```js
assert.equal(isSymbol('!'), true, "isSymbol('!') má vrátit true");
assert.equal(isSymbol('_'), true, "isSymbol('_') má vrátit true");
assert.equal(isSymbol('.'), true, "isSymbol('.') má vrátit true — symbol je každý znak mimo písmena, číslice a mezeru, nejen znaky z SYMBOLS");
assert.equal(isSymbol('€'), true, "isSymbol('€') má vrátit true");
assert.equal(isSymbol('ř'), false, "isSymbol('ř') má vrátit false — písmeno s diakritikou není symbol");
assert.equal(isSymbol('3'), false, "isSymbol('3') má vrátit false");
assert.equal(isSymbol(' '), false, "isSymbol(' ') má vrátit false");
```

`passwordScore` dá po bodu za délku aspoň 12, za délku aspoň 16, za číslici, za velké písmeno a za symbol.

```js
assert.equal(passwordScore('abcdefgh'), 0, "passwordScore('abcdefgh') má vrátit 0");
assert.equal(passwordScore('Abcdefg1!'), 3, "passwordScore('Abcdefg1!') má vrátit 3 — číslice, velké písmeno, symbol");
assert.equal(passwordScore('abcdefghijkl'), 1, "passwordScore('abcdefghijkl') má vrátit 1 — jen délka 12");
assert.equal(passwordScore('abcdefghijklmnop'), 2, "passwordScore('abcdefghijklmnop') má vrátit 2 — délka 16 dá bod za 12 i za 16");
assert.equal(passwordScore('Žluťoučký kůň 2026 ě!'), 5, "passwordScore('Žluťoučký kůň 2026 ě!') má vrátit 5");
```

`strengthLabel` vrátí `'Zadej heslo'` pro prázdný text, `'silné'` od 4 bodů, `'střední'` pro 3 body a jinak `'slabé'`.

```js
assert.equal(strengthLabel(''), 'Zadej heslo', "strengthLabel('') má vrátit 'Zadej heslo'");
assert.equal(strengthLabel('abcdefgh'), 'slabé', "strengthLabel('abcdefgh') má vrátit 'slabé'");
assert.equal(strengthLabel('Abcdefgh1'), 'slabé', "strengthLabel('Abcdefgh1') má vrátit 'slabé' (2 body)");
assert.equal(strengthLabel('Abcdefg1!'), 'střední', "strengthLabel('Abcdefg1!') má vrátit 'střední' (3 body)");
assert.equal(strengthLabel('Abcdefghijk1!'), 'silné', "strengthLabel('Abcdefghijk1!') má vrátit 'silné' (4 body)");
```

`generatePassphrase(words, count, separator, random)` vybere `count` slov podle `random` a spojí je oddělovačem.

```js
const sequence = (...values) => {
  let index = 0;
  return () => values[index++ % values.length];
};
assert.equal(generatePassphrase('kopec řeka les', 3, '.', sequence(0, 0.5, 0.9)), 'kopec.řeka.les', "generatePassphrase('kopec řeka les', 3, '.', náhoda 0, 0.5, 0.9) má vrátit 'kopec.řeka.les'");
assert.equal(generatePassphrase('kopec řeka les', 2, ' + ', () => 0.9), 'les + les', "generatePassphrase('kopec řeka les', 2, ' + ', náhoda 0.9) má vrátit 'les + les'");
```

`generatePassphrase(words)` bez dalších argumentů vrátí 4 slova oddělená pomlčkou.

```js
const phrase = generatePassphrase('sova');
assert.equal(phrase, 'sova-sova-sova-sova', "generatePassphrase('sova') má vrátit 'sova-sova-sova-sova' — výchozí 4 slova a oddělovač '-'");
const parts = generatePassphrase('kopec řeka les chata').split('-');
assert.equal(parts.length, 4, "generatePassphrase('kopec řeka les chata') má vrátit 4 slova oddělená '-'");
```

# --help--

## --tip-- 1

Když `random()` vrací číslo od 0 do 1, vynásob ho počtem možností a zaokrouhli **dolů**. `Math.round` by krajní hodnoty dávalo poloviční šanci a u `0.999` by vrátilo `max`. Viz [Callback: funkce, kterou zavolá někdo jiný](see:js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny) — `random` voláš se závorkami, protože potřebuješ jeho výsledek.

## --tip-- 10

Symbol nemá velké a malé písmeno: `'!'.toUpperCase()` je pořád `'!'`, kdežto `'ř'` se změní. Tahle vlastnost odliší písmena včetně diakritiky od všeho ostatního; číslice a mezeru pak vyřaď zvlášť.

# --seed--

## --file-- script.js

```js
// Generátor a kontrola hesel pro registrační formulář.
// Znaky bez snadno zaměnitelných dvojic (l × 1, O × 0).
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?-_';
const DEFAULT_CHARS = LOWERCASE + UPPERCASE + DIGITS + SYMBOLS;
const MIN_LENGTH = 8;

/**
 * Náhodné celé číslo od 0 do max - 1.
 * @param {number} max
 * @param {() => number} random funkce vracející číslo od 0 (včetně) do 1 (bez 1)
 * @returns {number}
 */
function randomInt(max, random) {
}

/**
 * Jeden náhodný znak z textu chars.
 * @param {string} chars
 * @param {() => number} random
 * @returns {string}
 */
function pickChar(chars, random) {
}

/**
 * Náhodné heslo zadané délky (nejméně MIN_LENGTH) ze znaků chars.
 * @param {number} length
 * @param {string} chars
 * @param {() => number} random
 * @returns {string}
 */
function generatePassword(length, chars, random) {
}

/**
 * Kolik znaků textu splní podmínku test.
 * @param {string} text
 * @param {(char: string) => boolean} test
 * @returns {number}
 */
function countMatching(text, test) {
}

/** @param {string} char @returns {boolean} je to číslice 0–9? */
function isDigit(char) {
}

/** @param {string} char @returns {boolean} je to velké písmeno (i s diakritikou)? */
function isUppercase(char) {
}

/** @param {string} char @returns {boolean} je to symbol — ne písmeno, číslice ani mezera? */
function isSymbol(char) {
}

/**
 * Body za sílu hesla, 0 až 5.
 * @param {string} password
 * @returns {number}
 */
function passwordScore(password) {
}

/**
 * Slovní hodnocení hesla pro formulář.
 * @param {string} password
 * @returns {string}
 */
function strengthLabel(password) {
}

/**
 * Heslová fráze z náhodných slov.
 * @param {string} words slova oddělená mezerou
 * @param {number} count
 * @param {string} separator
 * @param {() => number} random
 * @returns {string}
 */
function generatePassphrase(words, count, separator, random) {
}
```

# --solution--

## --file-- script.js

```js
// Generátor a kontrola hesel pro registrační formulář.
// Znaky bez snadno zaměnitelných dvojic (l × 1, O × 0).
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?-_';
const DEFAULT_CHARS = LOWERCASE + UPPERCASE + DIGITS + SYMBOLS;
const MIN_LENGTH = 8;

function randomInt(max, random = Math.random) {
  return Math.floor(random() * max);
}

function pickChar(chars, random = Math.random) {
  return chars[randomInt(chars.length, random)];
}

function generatePassword(length = 16, chars = DEFAULT_CHARS, random = Math.random) {
  const safeLength = Math.max(length, MIN_LENGTH);
  let password = '';
  for (let i = 0; i < safeLength; i++) {
    password += pickChar(chars, random);
  }
  return password;
}

function countMatching(text, test) {
  let count = 0;
  for (const char of text) {
    if (test(char)) {
      count++;
    }
  }
  return count;
}

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isUppercase(char) {
  return char !== char.toLowerCase();
}

function isSymbol(char) {
  const hasCase = char.toLowerCase() !== char.toUpperCase();
  return !hasCase && !isDigit(char) && char !== ' ';
}

function passwordScore(password) {
  let score = 0;
  if (password.length >= 12) {
    score++;
  }
  if (password.length >= 16) {
    score++;
  }
  if (countMatching(password, isDigit) > 0) {
    score++;
  }
  if (countMatching(password, isUppercase) > 0) {
    score++;
  }
  if (countMatching(password, isSymbol) > 0) {
    score++;
  }
  return score;
}

function strengthLabel(password) {
  if (password === '') {
    return 'Zadej heslo';
  }
  const score = passwordScore(password);
  if (score >= 4) {
    return 'silné';
  }
  if (score === 3) {
    return 'střední';
  }
  return 'slabé';
}

function generatePassphrase(words, count = 4, separator = '-', random = Math.random) {
  const list = words.split(' ');
  let phrase = '';
  for (let i = 0; i < count; i++) {
    const word = list[randomInt(list.length, random)];
    phrase += i === 0 ? word : separator + word;
  }
  return phrase;
}

console.log(generatePassword());
console.log(strengthLabel('Kolo2026!'));
console.log(generatePassphrase('kopec řeka les chata kolo jezero'));
```

# --approaches--

## --approach-- Cykly for, guard clauses a porovnání znaků

Každá kontrola je samostatná podmínka a každý znak se porovná bez regulárních výrazů (`toLowerCase`, porovnání s `'0'` a `'9'`). Nejvíc řádků, ale všechno jde krokovat v debuggeru a přidat další bod za sílu znamená přidat jeden `if`.

### --file-- script.js

```js
// Generátor a kontrola hesel pro registrační formulář.
// Znaky bez snadno zaměnitelných dvojic (l × 1, O × 0).
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?-_';
const DEFAULT_CHARS = LOWERCASE + UPPERCASE + DIGITS + SYMBOLS;
const MIN_LENGTH = 8;

function randomInt(max, random = Math.random) {
  return Math.floor(random() * max);
}

function pickChar(chars, random = Math.random) {
  return chars[randomInt(chars.length, random)];
}

function generatePassword(length = 16, chars = DEFAULT_CHARS, random = Math.random) {
  const safeLength = Math.max(length, MIN_LENGTH);
  let password = '';
  for (let i = 0; i < safeLength; i++) {
    password += pickChar(chars, random);
  }
  return password;
}

function countMatching(text, test) {
  let count = 0;
  for (const char of text) {
    if (test(char)) {
      count++;
    }
  }
  return count;
}

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isUppercase(char) {
  return char !== char.toLowerCase();
}

function isSymbol(char) {
  const hasCase = char.toLowerCase() !== char.toUpperCase();
  return !hasCase && !isDigit(char) && char !== ' ';
}

function passwordScore(password) {
  let score = 0;
  if (password.length >= 12) {
    score++;
  }
  if (password.length >= 16) {
    score++;
  }
  if (countMatching(password, isDigit) > 0) {
    score++;
  }
  if (countMatching(password, isUppercase) > 0) {
    score++;
  }
  if (countMatching(password, isSymbol) > 0) {
    score++;
  }
  return score;
}

function strengthLabel(password) {
  if (password === '') {
    return 'Zadej heslo';
  }
  const score = passwordScore(password);
  if (score >= 4) {
    return 'silné';
  }
  if (score === 3) {
    return 'střední';
  }
  return 'slabé';
}

function generatePassphrase(words, count = 4, separator = '-', random = Math.random) {
  const list = words.split(' ');
  let phrase = '';
  for (let i = 0; i < count; i++) {
    const word = list[randomInt(list.length, random)];
    phrase += i === 0 ? word : separator + word;
  }
  return phrase;
}

console.log(generatePassword());
console.log(strengthLabel('Kolo2026!'));
console.log(generatePassphrase('kopec řeka les chata kolo jezero'));
```

## --approach-- Regulární výrazy, while a ternární operátor

Kontroly znaků jsou jednořádkové šipky s regulárními výrazy s příznakem `u`: `\p{Lu}` je velké písmeno v jakémkoli jazyce, `\p{L}` písmeno a `\p{N}` číslice. Kratší, ale čtenář musí regexy znát. Body za sílu se sčítají převodem `true`/`false` na `1`/`0` a hodnocení je řetěz ternárních operátorů — u tří hodnot ještě čitelné, u pěti už ne.

### --file-- script.js

```js
// Generátor a kontrola hesel pro registrační formulář.
// Znaky bez snadno zaměnitelných dvojic (l × 1, O × 0).
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?-_';
const DEFAULT_CHARS = LOWERCASE + UPPERCASE + DIGITS + SYMBOLS;
const MIN_LENGTH = 8;

function randomInt(max, random = Math.random) {
  return Math.floor(random() * max);
}

function pickChar(chars, random = Math.random) {
  return chars.charAt(randomInt(chars.length, random));
}

function generatePassword(length = 16, chars = DEFAULT_CHARS, random = Math.random) {
  let password = '';
  while (password.length < Math.max(length, MIN_LENGTH)) {
    password += pickChar(chars, random);
  }
  return password;
}

function countMatching(text, test) {
  let count = 0;
  let index = 0;
  while (index < text.length) {
    if (test(text[index])) {
      count++;
    }
    index++;
  }
  return count;
}

const isDigit = (char) => /^[0-9]$/.test(char);
const isUppercase = (char) => /^\p{Lu}$/u.test(char);
const isSymbol = (char) => /^[^\p{L}\p{N}\s]$/u.test(char);

function passwordScore(password) {
  return Number(password.length >= 12)
    + Number(password.length >= 16)
    + Number(countMatching(password, isDigit) > 0)
    + Number(countMatching(password, isUppercase) > 0)
    + Number(countMatching(password, isSymbol) > 0);
}

function strengthLabel(password) {
  if (!password) return 'Zadej heslo';
  const score = passwordScore(password);
  return score >= 4 ? 'silné' : score === 3 ? 'střední' : 'slabé';
}

function generatePassphrase(words, count = 4, separator = '-', random = Math.random) {
  const list = words.split(' ');
  let phrase = list[randomInt(list.length, random)];
  let added = 1;
  while (added < count) {
    phrase += separator + list[randomInt(list.length, random)];
    added++;
  }
  return phrase;
}
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- `generatePassword` a `generatePassphrase` náhodu nepočítají samy, ale přes `randomInt` nebo `pickChar` — výpočet indexu je v kódu jen jednou.
- Kontroly znaků jsou malé čisté funkce a `passwordScore` je předává `countMatching` jako callbacky, bez závorek.
- Výchozí hodnoty jsou výchozí parametry, ne `||` uvnitř funkce.
- Funkce nic nevypisují; výpisy jsou jen na konci souboru.
- Víš, proč parametr `random` zjednodušil testy.

## --extensions--

Předej do `generatePassword` bezpečnou náhodu: napiš `secureRandom()`, která vrátí `crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32`, a zavolej `generatePassword(20, DEFAULT_CHARS, secureRandom)`. Přidej bod za to, že heslo neobsahuje tři stejné znaky za sebou. Uprav `generatePassword`, aby zaručila aspoň jednu číslici, velké písmeno a symbol.
