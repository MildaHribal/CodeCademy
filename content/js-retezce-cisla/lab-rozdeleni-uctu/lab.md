---
title: Rozdělení účtu
runtime: js
see: js-retezce-cisla/cisla#pocitani-v-halerich, js-retezce-cisla/intl-a-datum#intl-numberformat
---

# --description--

Při placení v restauraci po společné večeři s přáteli často narážíš na stejný problém: jak rozdělit účet spravedlivě, připočítat spropitné a zaokrouhlit částku tak, aby nikdo nemusel řešit drobné a personál dostal přesně to, co mu patří. V JavaScriptu navíc při počítání s penězi číhají pasti plovoucí řádové čárky (IEEE 754), kdy `0.1 + 0.2 !== 0.3`.

V tomto labu napíšeš sadu funkcí pro soubor `script.js`, které bezpečně převedou textový vstup z účtenky na číslo, spočítají spropitné v celých haléřích, zaokrouhlí výslednou částku a férově ji rozdělí mezi zadaný počet hostů.

## --story--

- **Jako host** chci zadat celkovou útratu jako číslo nebo řetězec s měnou (např. `'1 250,50 Kč'`), aby systém částku bezpečně převedl na číslo v korunách.
- **Jako host** chci při zadání neplatného vstupu (např. `'neplatné'` nebo záporné číslo) dostat hodnotu `null`, aby aplikace nespadla na neošetřené chybě.
- **Jako host** chci zadat procento spropitného a spočítat jeho výši v haléřích bez nepřesností plovoucí čárky.
- **Jako plátce** chci zvolit režim zaokrouhlení účtu: bez zaokrouhlení (`'none'`), nahoru na celé koruny (`'up'`), nebo na nejbližší celou korunu (`'nearest'`).
- **Jako skupina přátel** chceme rozdělit celkovou částku rovným dílem mezi hosty tak, aby součet všech podílů přesně pokryl celý účet a žádný haléř se neztratil.
- **Jako uživatel** chci mít k dispozici souhrnnou funkci `splitBill`, která vrátí přehledný objekt se všemi mezivýpočty a zformátovanou celkovou částkou v českém formátu měny.

## --tests--

| Funkce / Vstup | Očekávaný výsledek | Stav |
|---|---|---|
| `parseAmount(120.456)` | `120.46` | Připraveno |
| `parseAmount('1 250,50 Kč')` | `1250.5` | Připraveno |
| `parseAmount('chyba')` | `null` | Připraveno |
| `calculateTip(1000, 10)` | `100` | Připraveno |
| `calculateTip(255.50, 10)` | `25.55` | Připraveno |
| `roundAmount(120.01, 'up')` | `121` | Připraveno |
| `roundAmount(120.49, 'nearest')` | `120` | Připraveno |
| `distributeHalers(10000, 3)` | `[3334, 3333, 3333]` | Připraveno |
| `formatCurrency(1250.5)` | Obsahuje `'1'`, `'250'` a `'Kč'` | Připraveno |
| `splitBill('chyba', 3)` | `null` | Připraveno |
| `splitBill(1000, 3, { tipPercent: 10, rounding: 'none' })` | `subtotal: 1000`, `tipAmount: 100`, `perPerson: 366.67` | Připraveno |
| `splitBill('1 250,50 Kč', 2, { tipPercent: 10, rounding: 'up' })` | `totalRounded: 1376`, `perPerson: 688` | Připraveno |

# --hints--

`parseAmount` převede číslo na dvě desetinná místa a záporné číslo odmítne jako `null`.

```js
assert.equal(parseAmount(100), 100, 'parseAmount(100) má vrátit číslo 100');
assert.equal(parseAmount(120.456), 120.46, 'parseAmount(120.456) má vrátit 120.46 zaokrouhlené na haléře');
assert.equal(parseAmount(0), 0, 'parseAmount(0) má vrátit 0');
assert.equal(parseAmount(-50), null, 'parseAmount(-50) má vrátit null pro záporné číslo');
assert.equal(parseAmount(NaN), null, 'parseAmount(NaN) má vrátit null');
```

`parseAmount` zpracuje text s mezerami, českou desetinnou čárkou a symbolem měny.

```js
assert.equal(parseAmount('250 Kč'), 250, "parseAmount('250 Kč') má vrátit 250");
assert.equal(parseAmount('1 250,50 Kč'), 1250.5, "parseAmount('1 250,50 Kč') má převést českou čárku i oddělovače tisíců");
assert.equal(parseAmount('  89,90 CZK  '), 89.9, "parseAmount('  89,90 CZK  ') má ignorovat okolní mezery i označení CZK");
assert.equal(parseAmount('0,50 kč'), 0.5, "parseAmount('0,50 kč') má fungovat i s malými písmeny");
```

`parseAmount` vrátí `null` pro neplatný text, prázdný řetězec nebo nepodporovaný typ.

```js
assert.equal(parseAmount('neplatné'), null, "parseAmount('neplatné') má vrátit null");
assert.equal(parseAmount(''), null, "parseAmount('') má vrátit null");
assert.equal(parseAmount('   '), null, "parseAmount('   ') má vrátit null");
assert.equal(parseAmount(null), null, 'parseAmount(null) má vrátit null');
assert.equal(parseAmount(undefined), null, 'parseAmount(undefined) má vrátit null');
```

`calculateTip` spočítá výši spropitného v korunách zaokrouhlenou na haléře.

```js
assert.equal(calculateTip(1000, 10), 100, 'calculateTip(1000, 10) má vrátit 100');
assert.equal(calculateTip(500, 15), 75, 'calculateTip(500, 15) má vrátit 75');
assert.equal(calculateTip(255.5, 10), 25.55, 'calculateTip(255.5, 10) má vrátit 25.55 (spočteno přes haléře)');
assert.equal(calculateTip(100, 0), 0, 'calculateTip(100, 0) má vrátit 0');
```

`calculateTip` vrátí `0` pro nulovou nebo zápornou částku a neplatná procenta.

```js
assert.equal(calculateTip(0, 10), 0, 'calculateTip(0, 10) má vrátit 0');
assert.equal(calculateTip(-100, 10), 0, 'calculateTip(-100, 10) má vrátit 0 pro zápornou částku');
assert.equal(calculateTip(500, -5), 0, 'calculateTip(500, -5) má vrátit 0 pro záporné procento');
```

`roundAmount` zaokrouhlí částku v korunách podle zadaného režimu (`'none'`, `'up'`, `'nearest'`).

```js
assert.equal(roundAmount(120.456, 'none'), 120.46, "roundAmount(120.456, 'none') má zaokrouhlit na 2 desetinná místa");
assert.equal(roundAmount(120.01, 'up'), 121, "roundAmount(120.01, 'up') má zaokrouhlit nahoru na celou korunu");
assert.equal(roundAmount(120.0, 'up'), 120, "roundAmount(120.0, 'up') u celého čísla nic nepřidává");
assert.equal(roundAmount(120.49, 'nearest'), 120, "roundAmount(120.49, 'nearest') má zaokrouhlit na 120");
assert.equal(roundAmount(120.5, 'nearest'), 121, "roundAmount(120.5, 'nearest') má zaokrouhlit na 121");
```

`distributeHalers` rozdělí haléře rovnoměrně a případný zbytek přidá po 1 haléři od začátku pole.

```js
assert.deepEqual(distributeHalers(10000, 3), [3334, 3333, 3333], 'distributeHalers(10000, 3) má vrátit [3334, 3333, 3333]');
assert.deepEqual(distributeHalers(1000, 4), [250, 250, 250, 250], 'distributeHalers(1000, 4) má rozdělit beze zbytku na 4 stejné díly');
assert.deepEqual(distributeHalers(5, 2), [3, 2], 'distributeHalers(5, 2) má rozdělit 5 haléřů na 3 a 2');
assert.deepEqual(distributeHalers(0, 3), [0, 0, 0], 'distributeHalers(0, 3) má vrátit tři nuly');
```

`distributeHalers` zaručí, že součet podílů přesně odpovídá celku, a pro neplatný počet lidí vrátí prázdné pole.

```js
const shares = distributeHalers(10001, 7);
assert.equal(shares.length, 7, 'distributeHalers má vrátit pole o délce rovné počtu lidí');
const sum = shares.reduce((acc, val) => acc + val, 0);
assert.equal(sum, 10001, 'Součet všech rozdělených haléřů se musí přesně rovnat původnímu číslu');
assert.deepEqual(distributeHalers(100, 0), [], 'distributeHalers pro 0 lidí má vrátit prázdné pole');
assert.deepEqual(distributeHalers(100, -2), [], 'distributeHalers pro záporný počet lidí má vrátit prázdné pole');
```

`formatCurrency` zformátuje částku přes `Intl.NumberFormat` na českou měnu s označením `'Kč'`.

```js
const formatted = formatCurrency(1250.5);
assert.equal(typeof formatted, 'string', 'formatCurrency má vrátit řetězec');
assert.ok(formatted.includes('Kč'), "formatCurrency má obsahovat symbol 'Kč'");
assert.ok(formatted.includes('1') && formatted.includes('250'), 'formatCurrency má obsahovat správně oddělené číslice');
assert.ok(formatted.includes('50'), 'formatCurrency má obsahovat haléře');
```

`splitBill` vrátí `null`, pokud je částka neplatná nebo počet lidí menší než 1.

```js
assert.equal(splitBill('chyba', 3), null, 'splitBill má vrátit null při neplatném textu');
assert.equal(splitBill(1000, 0), null, 'splitBill má vrátit null pro 0 lidí');
assert.equal(splitBill(1000, -1), null, 'splitBill má vrátit null pro záporný počet lidí');
assert.equal(splitBill(1000, 2.5), null, 'splitBill má vrátit null pro neceločíselný počet lidí');
```

`splitBill` spočítá kompletní rozpis účtu se spropitným a rozdělením mezi lidi (bez zaokrouhlení).

```js
const bill = splitBill(1000, 3, { tipPercent: 10, rounding: 'none' });
assert.equal(bill.subtotal, 1000, 'subtotal má být 1000');
assert.equal(bill.tipAmount, 100, 'tipAmount má být 100 (10 % z 1000)');
assert.equal(bill.total, 1100, 'total má být 1100');
assert.equal(bill.totalRounded, 1100, 'totalRounded má být 1100');
assert.equal(bill.perPerson, 366.67, 'perPerson má být 366.67');
assert.deepEqual(bill.shares, [366.67, 366.67, 366.66], 'shares má rozdělit 1100 Kč bez ztráty haléře');
const sharesSum = Math.round(bill.shares.reduce((a, b) => a + b, 0) * 100) / 100;
assert.equal(sharesSum, 1100, 'Součet shares musí přesně odpovídat totalRounded');
assert.ok(bill.formattedTotal.includes('1') && bill.formattedTotal.includes('100'), 'formattedTotal má obsahovat zformátovanou částku');
```

`splitBill` správně zaokrouhlí účet nahoru (`rounding: 'up'`) a přepočte podíl i jednotlivé platby.

```js
const bill = splitBill('1 250,50 Kč', 2, { tipPercent: 10, rounding: 'up' });
assert.equal(bill.subtotal, 1250.5, 'subtotal má být 1250.5');
assert.equal(bill.tipAmount, 125.05, 'tipAmount má být 125.05');
assert.equal(bill.total, 1375.55, 'total má být 1375.55');
assert.equal(bill.totalRounded, 1376, 'totalRounded má být 1376 (zaokrouhleno nahoru)');
assert.equal(bill.perPerson, 688, 'perPerson má být 688 (1375.55 / 2 zaokrouhleno nahoru na celé koruny)');
assert.deepEqual(bill.shares, [688, 688], 'shares má obsahovat [688, 688] pokrývající totalRounded');
```

# --help--

## --tip--

Při výpočtu spropitného a dělení částek převeď koruny na celé haléře vynásobením číslem 100 a zaokrouhlením. Teprve po rozdělení převeď výsledek zpět na koruny. Vyhneš se tak nepřesnostem desetinných čísel v plovoucí čárce. Přečti si [Počítání v haléřích](see:js-retezce-cisla/cisla#pocitani-v-halerich).

## --tip--

K formátování částek podle českých pravidel použij třídu `Intl.NumberFormat` s kódem jazyka pro češtinu a měnou nastavenou na české koruny. Podrobnosti najdeš v lekci [Intl.NumberFormat](see:js-retezce-cisla/intl-a-datum#intl-numberformat).

# --seed--

## --file-- script.js

```js
/**
 * Převede vstupní částku (číslo nebo text) na číslo v korunách zaokrouhlené na 2 desetinná místa.
 * Vrátí null, pokud je vstup neplatný nebo záporný.
 *
 * @param {number | string} input
 * @returns {number | null}
 */
function parseAmount(input) {
--edit--
--edit--
}

/**
 * Spočítá výši spropitného v korunách bezpečně přes haléře.
 *
 * @param {number} amount částka v korunách
 * @param {number} [tipPercent=0] procento spropitného
 * @returns {number} výše spropitného v korunách
 */
function calculateTip(amount, tipPercent = 0) {
}

/**
 * Zaokrouhlí částku v korunách podle zvoleného režimu:
 * - 'none': na 2 desetinná místa (haléře)
 * - 'up': nahoru na celou korunu (Math.ceil)
 * - 'nearest': na nejbližší celou korunu (Math.round)
 *
 * @param {number} amount
 * @param {'none' | 'up' | 'nearest'} [mode='none']
 * @returns {number}
 */
function roundAmount(amount, mode = 'none') {
}

/**
 * Rozdělí celkový počet haléřů mezi zadaný počet lidí tak, aby součet přesně odpovídal celku.
 * Případný zbytek po dělení se po jednom haléři přidá prvním lidem v seznamu.
 *
 * @param {number} totalHalers celkový počet haléřů (celé číslo)
 * @param {number} peopleCount počet lidí (celé kladné číslo)
 * @returns {number[]} pole částek v haléřích pro jednotlivé osoby
 */
function distributeHalers(totalHalers, peopleCount) {
}

/**
 * Zformátuje částku v korunách jako českou měnu přes Intl.NumberFormat.
 *
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
}

/**
 * Kompletní rozpočet účtu se spropitným a rozdělením mezi hosty.
 *
 * @param {number | string} totalInput
 * @param {number} peopleCount
 * @param {{ tipPercent?: number, rounding?: 'none' | 'up' | 'nearest' }} [options={}]
 * @returns {object | null}
 */
function splitBill(totalInput, peopleCount, options = {}) {
}
```

# --solution--

## --file-- script.js

```js
function parseAmount(input) {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || Number.isNaN(input) || input < 0) {
      return null;
    }
    return Math.round(input * 100) / 100;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }
    const cleaned = trimmed
      .replace(/kč|czk/gi, '')
      .replace(/\s+/g, '')
      .replace(',', '.');

    if (!cleaned) {
      return null;
    }

    const num = Number(cleaned);
    if (!Number.isFinite(num) || Number.isNaN(num) || num < 0) {
      return null;
    }
    return Math.round(num * 100) / 100;
  }

  return null;
}

function calculateTip(amount, tipPercent = 0) {
  if (typeof amount !== 'number' || typeof tipPercent !== 'number') {
    return 0;
  }
  if (!Number.isFinite(amount) || !Number.isFinite(tipPercent) || amount <= 0 || tipPercent <= 0) {
    return 0;
  }
  const amountHalers = Math.round(amount * 100);
  const tipHalers = Math.round((amountHalers * tipPercent) / 100);
  return tipHalers / 100;
}

function roundAmount(amount, mode = 'none') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return 0;
  }
  if (mode === 'up') {
    return Math.ceil(amount);
  }
  if (mode === 'nearest') {
    return Math.round(amount);
  }
  return Math.round(amount * 100) / 100;
}

function distributeHalers(totalHalers, peopleCount) {
  if (!Number.isInteger(peopleCount) || peopleCount <= 0 || !Number.isInteger(totalHalers) || totalHalers < 0) {
    return [];
  }
  const base = Math.floor(totalHalers / peopleCount);
  const remainder = totalHalers % peopleCount;
  const result = [];
  for (let i = 0; i < peopleCount; i++) {
    result.push(i < remainder ? base + 1 : base);
  }
  return result;
}

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

function splitBill(totalInput, peopleCount, options = {}) {
  const subtotal = parseAmount(totalInput);
  if (subtotal === null || typeof peopleCount !== 'number' || !Number.isInteger(peopleCount) || peopleCount < 1) {
    return null;
  }

  const tipPercent = options?.tipPercent ?? 0;
  const rounding = options?.rounding ?? 'none';

  const tipAmount = calculateTip(subtotal, tipPercent);
  const totalWithTip = Math.round((subtotal + tipAmount) * 100) / 100;
  const totalRounded = roundAmount(totalWithTip, rounding);

  let perPerson;
  if (rounding === 'up') {
    perPerson = Math.ceil(totalWithTip / peopleCount);
  } else if (rounding === 'nearest') {
    perPerson = Math.round(totalWithTip / peopleCount);
  } else {
    perPerson = Math.round((totalWithTip / peopleCount) * 100) / 100;
  }

  const totalHalers = Math.round(totalRounded * 100);
  const halerShares = distributeHalers(totalHalers, peopleCount);
  const shares = halerShares.map((h) => h / 100);

  return {
    subtotal,
    tipAmount,
    total: totalWithTip,
    totalRounded,
    perPerson,
    shares,
    formattedTotal: formatCurrency(totalRounded),
  };
}
```

# --approaches--

## --approach-- Celočíselné haléře a cyklus for

Přístup postavený na bezpečném převodu na haléře hned na začátku. Výpočty spropitného i dělení účtu probíhají výhradně v celých číslech. Cyklus `for` přiřadí zbývající haléře prvním platícím. Plovoucí čárka se použije až při zpětném převodu na koruny dělením stem.

### --file-- script.js

```js
function parseAmount(input) {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || Number.isNaN(input) || input < 0) {
      return null;
    }
    return Math.round(input * 100) / 100;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }
    const cleaned = trimmed
      .replace(/kč|czk/gi, '')
      .replace(/\s+/g, '')
      .replace(',', '.');

    if (!cleaned) {
      return null;
    }

    const num = Number(cleaned);
    if (!Number.isFinite(num) || Number.isNaN(num) || num < 0) {
      return null;
    }
    return Math.round(num * 100) / 100;
  }

  return null;
}

function calculateTip(amount, tipPercent = 0) {
  if (typeof amount !== 'number' || typeof tipPercent !== 'number') {
    return 0;
  }
  if (!Number.isFinite(amount) || !Number.isFinite(tipPercent) || amount <= 0 || tipPercent <= 0) {
    return 0;
  }
  const amountHalers = Math.round(amount * 100);
  const tipHalers = Math.round((amountHalers * tipPercent) / 100);
  return tipHalers / 100;
}

function roundAmount(amount, mode = 'none') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return 0;
  }
  if (mode === 'up') {
    return Math.ceil(amount);
  }
  if (mode === 'nearest') {
    return Math.round(amount);
  }
  return Math.round(amount * 100) / 100;
}

function distributeHalers(totalHalers, peopleCount) {
  if (!Number.isInteger(peopleCount) || peopleCount <= 0 || !Number.isInteger(totalHalers) || totalHalers < 0) {
    return [];
  }
  const base = Math.floor(totalHalers / peopleCount);
  const remainder = totalHalers % peopleCount;
  const result = [];
  for (let i = 0; i < peopleCount; i++) {
    result.push(i < remainder ? base + 1 : base);
  }
  return result;
}

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

function splitBill(totalInput, peopleCount, options = {}) {
  const subtotal = parseAmount(totalInput);
  if (subtotal === null || typeof peopleCount !== 'number' || !Number.isInteger(peopleCount) || peopleCount < 1) {
    return null;
  }

  const tipPercent = options?.tipPercent ?? 0;
  const rounding = options?.rounding ?? 'none';

  const tipAmount = calculateTip(subtotal, tipPercent);
  const totalWithTip = Math.round((subtotal + tipAmount) * 100) / 100;
  const totalRounded = roundAmount(totalWithTip, rounding);

  let perPerson;
  if (rounding === 'up') {
    perPerson = Math.ceil(totalWithTip / peopleCount);
  } else if (rounding === 'nearest') {
    perPerson = Math.round(totalWithTip / peopleCount);
  } else {
    perPerson = Math.round((totalWithTip / peopleCount) * 100) / 100;
  }

  const totalHalers = Math.round(totalRounded * 100);
  const halerShares = distributeHalers(totalHalers, peopleCount);
  const shares = halerShares.map((h) => h / 100);

  return {
    subtotal,
    tipAmount,
    total: totalWithTip,
    totalRounded,
    perPerson,
    shares,
    formattedTotal: formatCurrency(totalRounded),
  };
}
```

## --approach-- Funkcionální zápis s Array.from

Kratší funkcionální zápis. Pole podílů v `distributeHalers` se vygeneruje pomocí `Array.from` s mapovací funkcí podle indexu prvku. Výpočet tipu i zaokrouhlení používá ternární operátory a pomocné jednořádkové výrazy.

### --file-- script.js

```js
function parseAmount(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) && !Number.isNaN(input) && input >= 0 ? Math.round(input * 100) / 100 : null;
  }
  if (typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/kč|czk/gi, '').replace(/\s+/g, '').replace(',', '.');
  if (!cleaned) return null;

  const num = Number(cleaned);
  return Number.isFinite(num) && !Number.isNaN(num) && num >= 0 ? Math.round(num * 100) / 100 : null;
}

function calculateTip(amount, tipPercent = 0) {
  if (typeof amount !== 'number' || typeof tipPercent !== 'number' || amount <= 0 || tipPercent <= 0) {
    return 0;
  }
  return Math.round((Math.round(amount * 100) * tipPercent) / 100) / 100;
}

function roundAmount(amount, mode = 'none') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return 0;
  return mode === 'up'
    ? Math.ceil(amount)
    : mode === 'nearest'
      ? Math.round(amount)
      : Math.round(amount * 100) / 100;
}

function distributeHalers(totalHalers, peopleCount) {
  if (!Number.isInteger(peopleCount) || peopleCount <= 0 || !Number.isInteger(totalHalers) || totalHalers < 0) {
    return [];
  }
  const base = Math.floor(totalHalers / peopleCount);
  const remainder = totalHalers % peopleCount;
  return Array.from({ length: peopleCount }, (_, i) => (i < remainder ? base + 1 : base));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function splitBill(totalInput, peopleCount, options = {}) {
  const subtotal = parseAmount(totalInput);
  if (subtotal === null || typeof peopleCount !== 'number' || !Number.isInteger(peopleCount) || peopleCount < 1) {
    return null;
  }

  const tipPercent = options?.tipPercent ?? 0;
  const rounding = options?.rounding ?? 'none';

  const tipAmount = calculateTip(subtotal, tipPercent);
  const totalWithTip = Math.round((subtotal + tipAmount) * 100) / 100;
  const totalRounded = roundAmount(totalWithTip, rounding);

  const perPerson = rounding === 'up'
    ? Math.ceil(totalWithTip / peopleCount)
    : rounding === 'nearest'
      ? Math.round(totalWithTip / peopleCount)
      : Math.round((totalWithTip / peopleCount) * 100) / 100;

  const totalHalers = Math.round(totalRounded * 100);
  const shares = distributeHalers(totalHalers, peopleCount).map((h) => h / 100);

  return {
    subtotal,
    tipAmount,
    total: totalWithTip,
    totalRounded,
    perPerson,
    shares,
    formattedTotal: formatCurrency(totalRounded),
  };
}
```

# --review--

Testy kontrolují návratové hodnoty a přesnost na haléře. Než modul uzavřeš, projdi si tento kontrolní seznam.

## --rubric--

- Finanční mezivýpočty (spropitné, rozdělení) pracují s celými čísly (haléři) a k dělení stem dochází až u výsledku.
- Funkce `parseAmount` bezpečně ošetřuje českou desetinnou čárku, mezery i symboly měny a pro neplatné vstupy vrací `null`.
- Funkce `distributeHalers` vrací pole, jehož součet se přesně rovná původnímu počtu haléřů.
- Kód nepoužívá `toFixed` pro další výpočty, protože `toFixed` vrací text.
- Formátování měny používá `Intl.NumberFormat` místo ručního skládání řetězců.

## --extensions--

- Přidej možnost zadat různé spropitné pro různé hosty podle jejich spokojenosti.
- Rozšiř modul o rozdělení účtu podle zkonzumovaných položek (každý host si vybere své položky a spropitné se rozpočítá poměrně).
