---
title: Validace vstupů
runtime: js
see: js-retezce-cisla/regularni-vyrazy#kotvy-a-skupiny
---

# --description--

Při tvorbě webových formulářů v e-shopu nebo při registraci je ověření uživatelských dat klíčovou součástí každé aplikace. Špatně zadané PSČ zdrží doručení balíku, neplatné rodné číslo odmítne platební brána a slabé heslo ohrozí účet zákazníka. V tomto labu si procvičíš práci s řetězci, čísly a regulárními výrazy při validaci běžných českých vstupů.

Tvým úkolem je vytvořit sadu validačních a pomocných funkcí v souboru `script.js` pro čtyři typy vstupů: poštovní směrovací číslo (PSČ), rodné číslo, heslo a cenu zboží.

## --story-- Uživatelské příběhy

- **Jako zákazník e-shopu** chci zadat PSČ s mezerou i bez mezery (např. `110 00` i `11000`), aby systém mé zadání přijal a automaticky upravil do jednotného tvaru s mezerou.
- **Jako administrátor systému** chci ověřit rodné číslo včetně správného měsíce, dne a kontrolního součtu (dělitelnost 11 u 10místných čísel), aby v databázi nebyla neplatná data.
- **Jako uživatel při registraci** chci okamžitou zpětnou vazbu k heslu (délka aspoň 8 znaků, malé i velké písmeno, číslice a speciální znak), abych věděl, která pravidla ještě heslu chybí.
- **Jako prodejce** chci zadat cenu v různých běžných tvarech (např. `1 250 Kč`, `499,90`, `99,- Kč`), aby systém cenu správně převedl na číselnou hodnotu v Kč.

## --tests-- Tabulka testů a pravidel

| Funkce | Vstup (příklad) | Očekávaný výsledek | Pravidlo / význam |
|---|---|---|---|
| `isValidZipCode` | `'110 00'`, `'11000'` | `true` | Platné PSČ (5 číslic nebo 3 číslice, mezera a 2 číslice) |
| `isValidZipCode` | `'1100'`, `'110 000'`, `'abcde'` | `false` | Špatná délka, chybná pozice mezery nebo nečíselné znaky |
| `formatZipCode` | `'11000'` | `'110 00'` | Převedení na jednotný tvar `XXX XX` |
| `formatZipCode` | `'neplatne'` | `null` | Neplatný vstup vrátí `null` |
| `isValidBirthNumber` | `'950512/1010'`, `'9505121010'` | `true` | Platné 10místné RČ muže (květen, dělitelné 11) |
| `isValidBirthNumber` | `'855512/1003'` | `true` | Platné 10místné RČ ženy (měsíc +50) |
| `isValidBirthNumber` | `'530101/123'` | `true` | Historické 9místné RČ (do roku 1953 bez dělitelnosti 11) |
| `isValidBirthNumber` | `'951312/1010'`, `'950532/1010'` | `false` | Neplatný měsíc (13) nebo den (32) |
| `isValidBirthNumber` | `'950512/1011'` | `false` | 10místné číslo není dělitelné 11 |
| `isValidPassword` | `'TajneHeslo123!'` | `true` | Splňuje všech 5 bezpečnostních kritérií |
| `isValidPassword` | `'krat1!'` | `false` | Nesplňuje minimální délku 8 znaků |
| `validatePassword` | `'HesloBezCisla!'` | `{ valid: false, errors: ['NO_DIGIT'] }` | Seznam kódů nesplněných pravidel |
| `isValidPrice` | `'1 250,50 Kč'`, `'99,-'` | `true` | Běžné zápisy cen s měnou, desetinnou čárkou/tečkou i `,-` |
| `isValidPrice` | `'-50 Kč'`, `'zdarma'` | `false` | Záporná částka, nečíselný text |
| `parsePrice` | `'1 250,50 Kč'` | `1250.5` | Převedení textu ceny na číslo |
| `parsePrice` | `'neplatna'` | `null` | Neplatný vstup vrátí `null` |

> [!NOTE]
> Všechny funkce musí bezpečně ošetřit neplatné typy vstupů (`null`, `undefined`, číslo místo řetězce atd.) a vrátit `false` nebo `null` bez vyhození neošetřené výjimky.

# --hints--

`isValidZipCode(value)` vrátí `true` pro platná PSČ bez mezery (5 číslic) i s mezerou (3 číslice + mezera + 2 číslice) a ignoruje krajní mezery.

```js
assert.equal(isValidZipCode('11000'), true, "isValidZipCode('11000') má vrátit true");
assert.equal(isValidZipCode('110 00'), true, "isValidZipCode('110 00') má vrátit true");
assert.equal(isValidZipCode('79601'), true, "isValidZipCode('79601') má vrátit true");
assert.equal(isValidZipCode('602 00'), true, "isValidZipCode('602 00') má vrátit true");
assert.equal(isValidZipCode('  110 00  '), true, "isValidZipCode('  110 00  ') má ignorovat krajní mezery a vrátit true");
```

`isValidZipCode(value)` vrátí `false` pro nesprávnou délku, špatně umístěnou mezeru, nečíselné znaky nebo neplatný typ.

```js
assert.equal(isValidZipCode('1100'), false, "isValidZipCode('1100') má vrátit false (málo číslic)");
assert.equal(isValidZipCode('110000'), false, "isValidZipCode('110000') má vrátit false (6 číslic)");
assert.equal(isValidZipCode('11 000'), false, "isValidZipCode('11 000') má vrátit false (mezera na špatném místě)");
assert.equal(isValidZipCode('110  00'), false, "isValidZipCode('110  00') má vrátit false (dvě mezery)");
assert.equal(isValidZipCode('110-00'), false, "isValidZipCode('110-00') má vrátit false (pomlčka místo mezery)");
assert.equal(isValidZipCode('abcde'), false, "isValidZipCode('abcde') má vrátit false (písmena místo číslic)");
assert.equal(isValidZipCode('1100a'), false, "isValidZipCode('1100a') má vrátit false (písmeno na konci)");
assert.equal(isValidZipCode(''), false, "isValidZipCode('') má vrátit false pro prázdný řetězec");
assert.equal(isValidZipCode(null), false, "isValidZipCode(null) má vrátit false pro neřetězcový vstup");
```

`formatZipCode(value)` upraví platné PSČ na jednotný tvar `XXX XX`, u neplatného vstupu vrátí `null`.

```js
assert.equal(formatZipCode('11000'), '110 00', "formatZipCode('11000') má vrátit '110 00'");
assert.equal(formatZipCode('110 00'), '110 00', "formatZipCode('110 00') má vrátit '110 00'");
assert.equal(formatZipCode('  60200  '), '602 00', "formatZipCode('  60200  ') má vrátit '602 00'");
assert.equal(formatZipCode('1100'), null, "formatZipCode('1100') má vrátit null pro neplatné PSČ");
assert.equal(formatZipCode('abcde'), null, "formatZipCode('abcde') má vrátit null");
```

`isValidBirthNumber(value)` vrátí `true` pro platná 10místná rodná čísla mužů i žen, s lomítkem i bez lomítka.

```js
assert.equal(isValidBirthNumber('950512/1010'), true, "isValidBirthNumber('950512/1010') má vrátit true (muž, květen, dělitelné 11)");
assert.equal(isValidBirthNumber('9505121010'), true, "isValidBirthNumber('9505121010') má vrátit true bez lomítka");
assert.equal(isValidBirthNumber('855512/1003'), true, "isValidBirthNumber('855512/1003') má vrátit true (žena, měsíc +50, dělitelné 11)");
assert.equal(isValidBirthNumber('000101/1010'), true, "isValidBirthNumber('000101/1010') má vrátit true (rok 2000, leden)");
assert.equal(isValidBirthNumber('  040715/1008  '), true, "isValidBirthNumber('  040715/1008  ') má tolerovat krajní mezery");
```

`isValidBirthNumber(value)` vrátí `true` pro historická 9místná rodná čísla (před rokem 1954), u kterých se neověřuje dělitelnost 11.

```js
assert.equal(isValidBirthNumber('530101/123'), true, "isValidBirthNumber('530101/123') má vrátit true pro 9místné RČ s lomítkem");
assert.equal(isValidBirthNumber('530101123'), true, "isValidBirthNumber('530101123') má vrátit true pro 9místné RČ bez lomítka");
assert.equal(isValidBirthNumber('485515/001'), true, "isValidBirthNumber('485515/001') má vrátit true pro 9místné ženské RČ");
```

`isValidBirthNumber(value)` vrátí `false`, pokud datum v rodném čísle neodpovídá platnému měsíci nebo dni.

```js
assert.equal(isValidBirthNumber('951312/1010'), false, "isValidBirthNumber('951312/1010') má vrátit false (měsíc 13 neexistuje)");
assert.equal(isValidBirthNumber('950012/1010'), false, "isValidBirthNumber('950012/1010') má vrátit false (měsíc 00 neexistuje)");
assert.equal(isValidBirthNumber('856512/1003'), false, "isValidBirthNumber('856512/1003') má vrátit false (ženský měsíc 65 je mimo rozsah 51–62)");
assert.equal(isValidBirthNumber('950532/1010'), false, "isValidBirthNumber('950532/1010') má vrátit false (den 32 neexistuje)");
assert.equal(isValidBirthNumber('950500/1010'), false, "isValidBirthNumber('950500/1010') má vrátit false (den 00 neexistuje)");
```

`isValidBirthNumber(value)` vrátí `false`, pokud 10místné rodné číslo není dělitelné 11 nebo je formát neplatný.

```js
assert.equal(isValidBirthNumber('950512/1011'), false, "isValidBirthNumber('950512/1011') má vrátit false (není dělitelné 11)");
assert.equal(isValidBirthNumber('950512/101'), false, "isValidBirthNumber('950512/101') má vrátit false pro koncovku 3 číslic u ročníku 1995");
assert.equal(isValidBirthNumber('950512/10100'), false, "isValidBirthNumber('950512/10100') má vrátit false pro koncovku 5 číslic");
assert.equal(isValidBirthNumber('950512-1010'), false, "isValidBirthNumber('950512-1010') má vrátit false pro špatný oddělovač");
assert.equal(isValidBirthNumber('95051a/1010'), false, "isValidBirthNumber('95051a/1010') má vrátit false pro písmeno v čísle");
assert.equal(isValidBirthNumber(''), false, "isValidBirthNumber('') má vrátit false");
assert.equal(isValidBirthNumber(null), false, "isValidBirthNumber(null) má vrátit false");
```

`isValidPassword(password)` vrátí `true`, pokud heslo splňuje všech 5 bezpečnostních pravidel (aspoň 8 znaků, malé písmeno, velké písmeno, číslice a speciální znak).

```js
assert.equal(isValidPassword('TajneHeslo123!'), true, "isValidPassword('TajneHeslo123!') má vrátit true");
assert.equal(isValidPassword('Kratke1#'), true, "isValidPassword('Kratke1#') má vrátit true (přesně 8 znaků)");
assert.equal(isValidPassword('M0je_Bezpecne-Heslo'), true, "isValidPassword('M0je_Bezpecne-Heslo') má vrátit true s podtržítkem a pomlčkou");
```

`isValidPassword(password)` vrátí `false`, pokud v heslu chybí libovolné z pěti požadovaných pravidel nebo vstup není řetězec.

```js
assert.equal(isValidPassword('Krat1!'), false, "isValidPassword('Krat1!') má vrátit false (málo znaků)");
assert.equal(isValidPassword('dlouheheslo123!'), false, "isValidPassword('dlouheheslo123!') má vrátit false (chybí velké písmeno)");
assert.equal(isValidPassword('DLOUHEHESLO123!'), false, "isValidPassword('DLOUHEHESLO123!') má vrátit false (chybí malé písmeno)");
assert.equal(isValidPassword('BezpecneHeslo!'), false, "isValidPassword('BezpecneHeslo!') má vrátit false (chybí číslice)");
assert.equal(isValidPassword('BezpecneHeslo123'), false, "isValidPassword('BezpecneHeslo123') má vrátit false (chybí speciální znak)");
assert.equal(isValidPassword(''), false, "isValidPassword('') má vrátit false pro prázdný řetězec");
assert.equal(isValidPassword(12345678), false, "isValidPassword(12345678) má vrátit false pro neřetězcový vstup");
```

`validatePassword(password)` vrátí objekt `{ valid, errors }` s kódy chybějících pravidel v pořadí `MIN_LENGTH`, `NO_LOWER`, `NO_UPPER`, `NO_DIGIT`, `NO_SPECIAL`.

```js
assert.deepEqual(validatePassword('TajneHeslo123!'), { valid: true, errors: [] }, "validatePassword('TajneHeslo123!') má vrátit { valid: true, errors: [] }");
assert.deepEqual(validatePassword('heslo'), { valid: false, errors: ['MIN_LENGTH', 'NO_UPPER', 'NO_DIGIT', 'NO_SPECIAL'] }, "validatePassword('heslo') má vrátit 4 chyby");
assert.deepEqual(validatePassword('HesloBezCisla!'), { valid: false, errors: ['NO_DIGIT'] }, "validatePassword('HesloBezCisla!') má vrátit ['NO_DIGIT']");
assert.deepEqual(validatePassword('TajneHeslo123'), { valid: false, errors: ['NO_SPECIAL'] }, "validatePassword('TajneHeslo123') má vrátit ['NO_SPECIAL']");
assert.deepEqual(validatePassword(null).valid, false, "validatePassword(null).valid má být false");
```

`isValidPrice(value)` vrátí `true` pro běžné české zápisy cen (s měnou Kč/CZK i bez ní, s desetinnou čárkou i tečkou, se zápisem `,-` a s mezerami mezi tisíci).

```js
assert.equal(isValidPrice('150'), true, "isValidPrice('150') má vrátit true");
assert.equal(isValidPrice('150 Kč'), true, "isValidPrice('150 Kč') má vrátit true");
assert.equal(isValidPrice('150 CZK'), true, "isValidPrice('150 CZK') má vrátit true");
assert.equal(isValidPrice('1 250 Kč'), true, "isValidPrice('1 250 Kč') má vrátit true (s mezerou mezi tisíci)");
assert.equal(isValidPrice('1250,50 Kč'), true, "isValidPrice('1250,50 Kč') má vrátit true (desetinná čárka)");
assert.equal(isValidPrice('1250.50 CZK'), true, "isValidPrice('1250.50 CZK') má vrátit true (desetinná tečka)");
assert.equal(isValidPrice('99,-'), true, "isValidPrice('99,-') má vrátit true (zápis se spojovníkem)");
assert.equal(isValidPrice('99,- Kč'), true, "isValidPrice('99,- Kč') má vrátit true");
assert.equal(isValidPrice('0 Kč'), true, "isValidPrice('0 Kč') má vrátit true");
assert.equal(isValidPrice('0,50 Kč'), true, "isValidPrice('0,50 Kč') má vrátit true");
assert.equal(isValidPrice('  2 499,- Kč  '), true, "isValidPrice('  2 499,- Kč  ') má tolerovat krajní mezery");
```

`isValidPrice(value)` vrátí `false` pro záporné částky, nečíselný text, vícenásobné oddělovače a neplatné typy.

```js
assert.equal(isValidPrice('-50 Kč'), false, "isValidPrice('-50 Kč') má vrátit false pro zápornou částku");
assert.equal(isValidPrice('zdarma'), false, "isValidPrice('zdarma') má vrátit false pro nečíselný text");
assert.equal(isValidPrice('12.50.30'), false, "isValidPrice('12.50.30') má vrátit false pro více teček");
assert.equal(isValidPrice('12a50 Kč'), false, "isValidPrice('12a50 Kč') má vrátit false pro písmeno v čísle");
assert.equal(isValidPrice(''), false, "isValidPrice('') má vrátit false pro prázdný řetězec");
assert.equal(isValidPrice(null), false, "isValidPrice(null) má vrátit false pro neřetězcový vstup");
```

`parsePrice(value)` převede platný text ceny na číslo v Kč a u neplatného vstupu vrátí `null`.

```js
assert.equal(parsePrice('150'), 150, "parsePrice('150') má vrátit 150");
assert.equal(parsePrice('150 Kč'), 150, "parsePrice('150 Kč') má vrátit 150");
assert.equal(parsePrice('1 250 Kč'), 1250, "parsePrice('1 250 Kč') má vrátit 1250");
assert.equal(parsePrice('1250,50 Kč'), 1250.5, "parsePrice('1250,50 Kč') má vrátit 1250.5");
assert.equal(parsePrice('1250.50 CZK'), 1250.5, "parsePrice('1250.50 CZK') má vrátit 1250.5");
assert.equal(parsePrice('99,- Kč'), 99, "parsePrice('99,- Kč') má vrátit 99");
assert.equal(parsePrice('0,50 Kč'), 0.5, "parsePrice('0,50 Kč') má vrátit 0.5");
assert.equal(parsePrice('zdarma'), null, "parsePrice('zdarma') má vrátit null");
assert.equal(parsePrice('-10 Kč'), null, "parsePrice('-10 Kč') má vrátit null");
assert.equal(parsePrice(null), null, "parsePrice(null) má vrátit null");
```

Všechny funkce bezpečně zpracují neočekávané vstupy (`undefined`, čísla, objekty, prázdné řetězce) bez vyhození neošetřené výjimky.

```js
const invalidInputs = [undefined, 12345, {}, [], true];
for (const input of invalidInputs) {
  assert.equal(isValidZipCode(input), false, `isValidZipCode(${JSON.stringify(input)}) nesmí spadnout a má vrátit false`);
  assert.equal(formatZipCode(input), null, `formatZipCode(${JSON.stringify(input)}) nesmí spadnout a má vrátit null`);
  assert.equal(isValidBirthNumber(input), false, `isValidBirthNumber(${JSON.stringify(input)}) nesmí spadnout a má vrátit false`);
  assert.equal(isValidPassword(input), false, `isValidPassword(${JSON.stringify(input)}) nesmí spadnout a má vrátit false`);
  assert.equal(validatePassword(input).valid, false, `validatePassword(${JSON.stringify(input)}).valid má být false`);
  assert.equal(isValidPrice(input), false, `isValidPrice(${JSON.stringify(input)}) nesmí spadnout a má vrátit false`);
  assert.equal(parsePrice(input), null, `parsePrice(${JSON.stringify(input)}) nesmí spadnout a má vrátit null`);
}
```

# --help--

## --tip-- 4

Pro ověření formátu rodného čísla se hodí regulární výraz se zachycujícími skupinami pro rok, měsíc, den a koncovku. Viz výklad o skupinách v lekci [Kotvy a skupiny](see:js-retezce-cisla/regularni-vyrazy#kotvy-a-skupiny).

## --tip-- 13

Při parsování ceny nejdřív odstraň mezery a symboly měny, nahraď desetinnou čárku tečkou a teprve potom převeď řetězec na číslo pomocí vestavěné funkce `Number`.

# --seed--

## --file-- script.js

```js
/**
 * Ověří, zda je zadané PSČ platné (5 číslic nebo 3 číslice, mezera a 2 číslice).
 * @param {string} value
 * @returns {boolean}
 */
function isValidZipCode(value) {
}

/**
 * Převede platné PSČ na jednotný formát s mezerou 'XXX XX', u neplatného vstupu vrátí null.
 * @param {string} value
 * @returns {string|null}
 */
function formatZipCode(value) {
}

/**
 * Ověří platnost českého rodného čísla (formát, datum a dělitelnost 11 pro 10místná RČ).
 * @param {string} value
 * @returns {boolean}
 */
function isValidBirthNumber(value) {
}

/**
 * Ověří heslo a vrátí objekt { valid: boolean, errors: string[] }.
 * Pravidla: MIN_LENGTH (aspoň 8), NO_LOWER, NO_UPPER, NO_DIGIT, NO_SPECIAL.
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePassword(password) {
}

/**
 * Ověří, zda heslo splňuje všech 5 bezpečnostních pravidel.
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
}

/**
 * Ověří, zda řetězec představuje platný zápis ceny v Kč.
 * @param {string} value
 * @returns {boolean}
 */
function isValidPrice(value) {
}

/**
 * Převede řetězec s cenou na číslo v Kč, u neplatného vstupu vrátí null.
 * @param {string} value
 * @returns {number|null}
 */
function parsePrice(value) {
}
```

# --solution--

## --file-- script.js

```js
function isValidZipCode(value) {
  if (typeof value !== 'string') return false;
  return /^(\d{5}|\d{3} \d{2})$/.test(value.trim());
}

function formatZipCode(value) {
  if (!isValidZipCode(value)) return null;
  const digits = value.trim().replace(/\s+/g, '');
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function isValidBirthNumber(value) {
  if (typeof value !== 'string') return false;
  const match = value.trim().match(/^(\d{2})(\d{2})(\d{2})\/?(\d{3,4})$/);
  if (!match) return false;
  const [, yyStr, mmStr, ddStr, ext] = match;
  const yy = Number(yyStr);
  const mm = Number(mmStr);
  const dd = Number(ddStr);
  const isMaleMonth = mm >= 1 && mm <= 12;
  const isFemaleMonth = mm >= 51 && mm <= 62;
  if (!isMaleMonth && !isFemaleMonth) return false;
  if (dd < 1 || dd > 31) return false;
  if (ext.length === 3) {
    if (yy > 53) return false;
    return true;
  }
  const fullDigits = `${yyStr}${mmStr}${ddStr}${ext}`;
  return Number(fullDigits) % 11 === 0;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return { valid: false, errors: ['MIN_LENGTH', 'NO_LOWER', 'NO_UPPER', 'NO_DIGIT', 'NO_SPECIAL'] };
  }
  const errors = [];
  if (password.length < 8) errors.push('MIN_LENGTH');
  if (!/[a-z]/.test(password)) errors.push('NO_LOWER');
  if (!/[A-Z]/.test(password)) errors.push('NO_UPPER');
  if (!/\d/.test(password)) errors.push('NO_DIGIT');
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push('NO_SPECIAL');
  return { valid: errors.length === 0, errors };
}

function isValidPassword(password) {
  return validatePassword(password).valid;
}

function parsePrice(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const re = /^(\d{1,3}(?:[ ]\d{3})*|\d+)(?:([,.])(\d{1,2}|[-–]))?\s*(?:Kč|CZK)?$/i;
  const match = trimmed.match(re);
  if (!match) return null;
  const whole = match[1].replace(/\s+/g, '');
  const dec = match[3];
  if (!dec || dec === '-' || dec === '–') return Number(whole);
  return Number(`${whole}.${dec}`);
}

function isValidPrice(value) {
  return parsePrice(value) !== null;
}
```

# --approaches--

## --approach-- Validace regulárními výrazy

Využívá regulární výrazy na všech místech, kde ověřujeme strukturu a formát řetězce. U PSČ kontroluje buď pětici číslic, nebo trojici a dvojici oddělenou jednou mezerou (`/^(\d{5}|\d{3} \d{2})$/`). Tento zápis je velmi úsporný, vejde se na jediný řádek a snadno se čte každému, kdo zná kotvy `^` a `$` a třídu znaků `\d`.

### --file-- script.js

```js
function isValidZipCode(value) {
  if (typeof value !== 'string') return false;
  return /^(\d{5}|\d{3} \d{2})$/.test(value.trim());
}

function formatZipCode(value) {
  if (!isValidZipCode(value)) return null;
  const digits = value.trim().replace(/\s+/g, '');
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function isValidBirthNumber(value) {
  if (typeof value !== 'string') return false;
  const match = value.trim().match(/^(\d{2})(\d{2})(\d{2})\/?(\d{3,4})$/);
  if (!match) return false;
  const [, yyStr, mmStr, ddStr, ext] = match;
  const yy = Number(yyStr);
  const mm = Number(mmStr);
  const dd = Number(ddStr);
  const isMaleMonth = mm >= 1 && mm <= 12;
  const isFemaleMonth = mm >= 51 && mm <= 62;
  if (!isMaleMonth && !isFemaleMonth) return false;
  if (dd < 1 || dd > 31) return false;
  if (ext.length === 3) {
    if (yy > 53) return false;
    return true;
  }
  const fullDigits = `${yyStr}${mmStr}${ddStr}${ext}`;
  return Number(fullDigits) % 11 === 0;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return { valid: false, errors: ['MIN_LENGTH', 'NO_LOWER', 'NO_UPPER', 'NO_DIGIT', 'NO_SPECIAL'] };
  }
  const errors = [];
  if (password.length < 8) errors.push('MIN_LENGTH');
  if (!/[a-z]/.test(password)) errors.push('NO_LOWER');
  if (!/[A-Z]/.test(password)) errors.push('NO_UPPER');
  if (!/\d/.test(password)) errors.push('NO_DIGIT');
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push('NO_SPECIAL');
  return { valid: errors.length === 0, errors };
}

function isValidPassword(password) {
  return validatePassword(password).valid;
}

function parsePrice(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const re = /^(\d{1,3}(?:[ ]\d{3})*|\d+)(?:([,.])(\d{1,2}|[-–]))?\s*(?:Kč|CZK)?$/i;
  const match = trimmed.match(re);
  if (!match) return null;
  const whole = match[1].replace(/\s+/g, '');
  const dec = match[3];
  if (!dec || dec === '-' || dec === '–') return Number(whole);
  return Number(`${whole}.${dec}`);
}

function isValidPrice(value) {
  return parsePrice(value) !== null;
}
```

## --approach-- Ruční kontrola bez regulárních výrazů u PSČ

U PSČ se zcela vyhýbá regulárnímu výrazu a provádí přímou kontrolu délky a jednotlivých znaků. Nejprve ořízne krajní mezery přes `trim()`. Pokud má text délku 5, projde cyklem znak po znaku a ověří, že každý znak leží mezi `'0'` a `'9'`. Pokud má délku 6, ověří mezeru na indexu 3 a ostatní pozice jako číslice. Výhodou je naprostá explicitnost a nulová závislost na regex enginu, nevýhodou je podstatně delší kód (15 řádků místo 1 řádku).

### --file-- script.js

```js
function isValidZipCode(value) {
  if (typeof value !== 'string') return false;
  const s = value.trim();
  if (s.length === 5) {
    for (let i = 0; i < 5; i++) {
      if (s[i] < '0' || s[i] > '9') return false;
    }
    return true;
  }
  if (s.length === 6) {
    if (s[3] !== ' ') return false;
    for (let i = 0; i < 6; i++) {
      if (i === 3) continue;
      if (s[i] < '0' || s[i] > '9') return false;
    }
    return true;
  }
  return false;
}

function formatZipCode(value) {
  if (!isValidZipCode(value)) return null;
  const clean = [];
  const s = value.trim();
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') clean.push(ch);
  }
  return `${clean.slice(0, 3).join('')} ${clean.slice(3).join('')}`;
}

function isValidBirthNumber(value) {
  if (typeof value !== 'string') return false;
  const s = value.trim();
  let digits = '';
  let slashCount = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '/') {
      slashCount++;
      if (slashCount > 1 || i !== 6) return false;
    } else if (ch >= '0' && ch <= '9') {
      digits += ch;
    } else {
      return false;
    }
  }
  if (digits.length !== 9 && digits.length !== 10) return false;
  const yy = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));
  if (!((mm >= 1 && mm <= 12) || (mm >= 51 && mm <= 62))) return false;
  if (dd < 1 || dd > 31) return false;
  if (digits.length === 9) {
    if (yy > 53) return false;
    return true;
  }
  return Number(digits) % 11 === 0;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return { valid: false, errors: ['MIN_LENGTH', 'NO_LOWER', 'NO_UPPER', 'NO_DIGIT', 'NO_SPECIAL'] };
  }
  const errors = [];
  if (password.length < 8) errors.push('MIN_LENGTH');
  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSpecial = false;
  for (const ch of password) {
    if (ch >= 'a' && ch <= 'z') hasLower = true;
    else if (ch >= 'A' && ch <= 'Z') hasUpper = true;
    else if (ch >= '0' && ch <= '9') hasDigit = true;
    else hasSpecial = true;
  }
  if (!hasLower) errors.push('NO_LOWER');
  if (!hasUpper) errors.push('NO_UPPER');
  if (!hasDigit) errors.push('NO_DIGIT');
  if (!hasSpecial) errors.push('NO_SPECIAL');
  return { valid: errors.length === 0, errors };
}

function isValidPassword(password) {
  return validatePassword(password).valid;
}

function parsePrice(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const re = /^(\d{1,3}(?:[ ]\d{3})*|\d+)(?:([,.])(\d{1,2}|[-–]))?\s*(?:Kč|CZK)?$/i;
  const match = trimmed.match(re);
  if (!match) return null;
  const whole = match[1].replace(/\s+/g, '');
  const dec = match[3];
  if (!dec || dec === '-' || dec === '–') return Number(whole);
  return Number(`${whole}.${dec}`);
}

function isValidPrice(value) {
  return parsePrice(value) !== null;
}
```

# --review--

Testy kontrolují návratové hodnoty funkcí. Než lab uzavřeš, zkontroluj čistotu kódu sám.

## --rubric--

- Funkce `isValidZipCode` používá kotvy `^` a `$`, takže nezamění PSČ s delším číslem.
- Kontrola hesla rozlišuje všech 5 kritérií a vrací přesný seznam chybějících pravidel.
- Funkce `parsePrice` bezpečně odstraní mezery mezi tisíci a správně převede desetinnou čárku na tečku pro `Number()`.
- Žádná funkce nespadne s neošetřenou chybou, když dostane `null`, `undefined` nebo číslo.
- Víš, kdy je lepší použít regulární výraz a kdy stačí jednoduché metody řetězců jako `includes` nebo `slice`.

## --extensions--

Zkus přidat funkci `isValidIco(value)`, která ověří 8místné české IČO včetně váženého kontrolního součtu (váhy 8, 7, 6, 5, 4, 3, 2 modulo 11), nebo funkci `isValidEmail(value)`, která zkontroluje základní tvar e-mailové adresy se zavináčem a doménou.
