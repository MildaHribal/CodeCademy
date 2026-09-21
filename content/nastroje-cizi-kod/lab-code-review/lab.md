---
title: Code review s testy
runtime: node
see: nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum
---

# --description--

Jsi reviewer. Kolega z týmu **Bistro Pod Kaštanem** otevřel pull request, který
k objednávkám přidává věrnostní slevu a kupóny. Kód funguje na šťastné cestě, testy
v repozitáři svítí zeleně — a přesto by v tomhle stavu neměl jít do produkce.

Tvoje práce má dvě půlky, jako každé skutečné review:

1. **Najdi a oprav** problémy v `src/orders.js`.
2. **Napiš komentáře** do `REVIEW.md`, aby se z toho autor něco dozvěděl.

Zadání, které kolega dostal, je v `docs/issue-71.md`. Konvence projektu jsou
v `CONTRIBUTING.md`. Obojí si přečti — bez nich je polovina problémů neviditelná.

## Co má po tvé opravě platit

1. `orderTotal(order, customer, coupon)` vrací objekt
   `{ base, discount, total, discountReason }`, všechny částky v **celých haléřích**.
2. `base` je součet `price * qty` přes všechny položky objednávky.
3. Prázdná objednávka projde a vrátí `base: 0`, `total: 0`, `discountReason: null`.
4. Věrnostní sleva se řídí body zákazníka podle tabulky v `src/orders.js`.
5. Kupón, pokud je zadaný, dává slevu ze **základní ceny**.
6. **Slevy se nesčítají ani neřetězí** — platí vyšší z obou. Při shodě zůstává
   věrnostní.
7. `discountReason` je `'loyalty'`, `'coupon'`, nebo `null`, když žádná sleva není.
8. Procenta se počítají pomocníkem `percentOf` ze `src/money.js`, takže výsledek je
   vždy celé číslo.
9. Množství `qty`, které není celé kladné číslo, skončí chybou s `code: 'INVALID_QTY'`.
   Totéž pro zápornou cenu (`code: 'INVALID_PRICE'`).
10. Funkce **nemění** objednávku ani pole položek, které dostane.
11. Do logu se nedostane e-mail ani jiný osobní údaj zákazníka.
12. `REVIEW.md` obsahuje aspoň pět komentářů, každý s odkazem na soubor a s důvodem;
    aspoň jeden z nich je označený jako `nit:`.

> [!TIP]
> Začni tím, že si spustíš `npm test`. Existující testy projdou — a to je první
> zjištění, které do review patří: testují jen šťastnou cestu.

# --hints--

Základní cena je součet položek a prázdná objednávka nespadne.

```js
const { orderTotal } = await helpers.importFile('src/orders.js');
const zakaznik = { email: 'hana@example.cz', points: 0 };
const vysledek = orderTotal({ items: [{ name: 'polévka', price: 6900, qty: 2 }, { name: 'káva', price: 4500, qty: 1 }] }, zakaznik, null);
assert.equal(vysledek.base, 18300, 'base má být součet price * qty přes všechny položky');
assert.equal(vysledek.total, 18300, 'Bez slevy je total stejný jako base');
assert.equal(vysledek.discountReason, null, 'Bez slevy má být discountReason null');
const prazdna = orderTotal({ items: [] }, zakaznik, null);
assert.deepEqual(prazdna, { base: 0, discount: 0, total: 0, discountReason: null }, 'Prázdná objednávka má vrátit nuly, ne spadnout');
```

Slevy se neřetězí — platí vyšší z věrnostní a kupónové.

```js
const { orderTotal } = await helpers.importFile('src/orders.js');
const objednavka = { items: [{ name: 'menu', price: 50000, qty: 2 }] };
const zlaty = { email: 'hana@example.cz', points: 2500 };
const kupon = { code: 'PODZIM20', percent: 20 };
const vysledek = orderTotal(objednavka, zlaty, kupon);
assert.equal(vysledek.base, 100000, 'Základní cena je 1000 Kč');
assert.equal(vysledek.discount, 20000, 'Platit má vyšší sleva (kupón 20 %), ne řetězení 10 % a pak 20 %');
assert.equal(vysledek.total, 80000, 'Po vyšší slevě zbývá 800 Kč, ne 720 Kč');
assert.equal(vysledek.discountReason, 'coupon', 'Když vyhrál kupón, discountReason je coupon');
```

Při shodě zůstává věrnostní sleva.

```js
const { orderTotal } = await helpers.importFile('src/orders.js');
const objednavka = { items: [{ name: 'menu', price: 50000, qty: 2 }] };
const zlaty = { email: 'hana@example.cz', points: 2500 };
const vysledek = orderTotal(objednavka, zlaty, { code: 'STEJNE10', percent: 10 });
assert.equal(vysledek.discount, 10000, 'Obě slevy jsou 10 %, takže sleva je 100 Kč');
assert.equal(vysledek.discountReason, 'loyalty', 'Při shodě má zůstat věrnostní sleva');
const bezKuponu = orderTotal(objednavka, zlaty, null);
assert.equal(bezKuponu.discountReason, 'loyalty', 'Bez kupónu platí věrnostní sleva');
```

Všechny částky jsou celá čísla v haléřích.

```js
const { orderTotal } = await helpers.importFile('src/orders.js');
const objednavka = { items: [{ name: 'štrúdl', price: 6333, qty: 1 }] };
const stribrny = { email: 'hana@example.cz', points: 900 };
const vysledek = orderTotal(objednavka, stribrny, null);
for (const klic of ['base', 'discount', 'total']) {
  assert.ok(Number.isInteger(vysledek[klic]), `${klic} má být celé číslo haléřů, je ${vysledek[klic]}`);
}
assert.equal(vysledek.discount, 317, '5 % z 6333 haléřů je po zaokrouhlení 317 haléřů');
assert.equal(vysledek.total, 6016, 'Celkem má zbýt 6016 haléřů');
```

Nesmyslné množství nebo cena skončí chybou s kódem.

```js
const { orderTotal } = await helpers.importFile('src/orders.js');
const zakaznik = { email: 'hana@example.cz', points: 0 };
const spatne = [
  [{ name: 'polévka', price: 6900, qty: 0 }, 'INVALID_QTY'],
  [{ name: 'polévka', price: 6900, qty: -2 }, 'INVALID_QTY'],
  [{ name: 'polévka', price: 6900, qty: 1.5 }, 'INVALID_QTY'],
  [{ name: 'polévka', price: 6900, qty: '2' }, 'INVALID_QTY'],
  [{ name: 'polévka', price: -100, qty: 1 }, 'INVALID_PRICE'],
];
for (const [polozka, code] of spatne) {
  assert.throws(
    () => orderTotal({ items: [polozka] }, zakaznik, null),
    (chyba) => chyba.code === code,
    `Položka ${JSON.stringify(polozka)} má skončit chybou s code ${code}`,
  );
}
```

Výpočet nemění objednávku, kterou dostane.

```js
const { orderTotal } = await helpers.importFile('src/orders.js');
const polozky = [
  { name: 'zákusek', price: 5500, qty: 1 },
  { name: 'polévka', price: 6900, qty: 2 },
];
const objednavka = { items: polozky };
const predtim = JSON.stringify(objednavka);
orderTotal(objednavka, { email: 'hana@example.cz', points: 2500 }, { code: 'PODZIM20', percent: 20 });
assert.equal(JSON.stringify(objednavka), predtim, 'orderTotal nesmí měnit objednávku ani pořadí položek, které dostane');
assert.equal(polozky[0].name, 'zákusek', 'Pole položek se nesmí seřadit na místě');
```

Osobní údaje zákazníka se nelogují.

```js
const zdroj = files['src/orders.js'];
assert.doesNotMatch(zdroj, /console\.(log|info|debug)[^\n]*email/i, 'E-mail zákazníka nepatří do logu — v produkci se logy uchovávají a sdílejí');
assert.doesNotMatch(zdroj, /console\.(log|info|debug)[^\n]*customer/i, 'Nelogujte celý objekt zákazníka, jsou v něm osobní údaje');
```

Procenta se počítají sdíleným pomocníkem, ne ručním dělením.

```js
const zdroj = helpers.stripComments(files['src/orders.js'], 'js');
assert.match(zdroj, /percentOf\s*\(/, 'Procenta počítej pomocníkem percentOf ze src/money.js — je to konvence projektu');
assert.doesNotMatch(zdroj, /\*\s*[a-zA-Z_.]*percent[a-zA-Z_.]*\s*\)?\s*\/\s*100/i, 'Ruční dělení stem vrací desetinné haléře; na to je percentOf');
```

REVIEW.md obsahuje aspoň pět komentářů s odkazem na soubor.

```js
const review = files['REVIEW.md'];
const radky = review.split('\n').filter((radek) => /^\s*(\d+\.|[-*]|#{2,3})\s+\S/.test(radek));
assert.ok(radky.length >= 5, `V REVIEW.md je ${radky.length} komentářů, mají být aspoň 4 + nit (tedy 5)`);
assert.match(review, /orders\.js/, 'Komentář má říct, kterého souboru se týká');
assert.match(review, /\bnit:/i, 'Aspoň jeden komentář označ jako nit: — drobnost, která nemá blokovat začlenění');
```

REVIEW.md pojmenovává podstatné problémy, ne jen formátování.

```js
const review = files['REVIEW.md'].toLowerCase();
const temata = [
  [/nesčít|nescit|neřetěz|neretez|vyšší z|vyssi z|řetěz|retez|sčítaj|scitaj/, 'chybějící pravidlo „slevy se nesčítají"'],
  [/halé|hale|celé čís|cele cis|zaokrouhl|percentof|desetin/, 'peníze v celých haléřích / zaokrouhlení'],
  [/e-mail|email|osobní údaj|osobni udaj|log/, 'osobní údaj v logu'],
  [/qty|množstv|mnozstv|validac|ověření vstupu|overeni vstupu|vstup/, 'chybějící kontrola vstupu'],
];
for (const [vzor, popis] of temata) {
  assert.match(review, vzor, `V REVIEW.md chybí komentář k tématu: ${popis}`);
}
```

Existující testy projektu po tvé změně pořád procházejí.

```js
const vysledek = await helpers.run('npm test', { timeoutMs: 60000 });
assert.equal(vysledek.code, 0, `Sada testů projektu musí zůstat zelená.\n${vysledek.stdout}\n${vysledek.stderr}`);
```

# --help--

## --tip--

Nečti kód rovnou. Nejdřív `docs/issue-71.md` a `CONTRIBUTING.md`, pak si každý řádek
`orderTotal` přečti s otázkou „odpovídá tohle zadání?". Dva z problémů jsou vidět jen
proti zadání, ne z kódu samotného.

## --tip--

Projdi si kontrolní seznam reviewera: **správnost** (co se stane u prázdné objednávky,
u nuly, u záporného čísla?), **konvence** (čte se to stejně jako zbytek projektu?),
**bezpečnost a soukromí** (co skončí v logu?), **vedlejší efekty** (mění funkce něco,
co dostala zvenčí?). U vedlejších efektů pomáhá jednoduché pravidlo: co přišlo
parametrem, s tím se pracuje až nad kopií.

# --seed--

## --file-- docs/issue-71.md

````md
# #71 Věrnostní sleva a kupóny

**Zadal:** provoz bistra

Zákazníci sbírají body a chceme jim za ně dávat slevu. Zároveň rozdáváme kupóny na
akcích.

## Co má platit

- Věrnostní úrovně podle bodů: do 500 bodů 0 %, od 500 bodů 5 %, od 2000 bodů 10 %.
- Kupón má procento slevy a počítá se ze základní ceny objednávky.
- **Slevy se nesčítají.** Platí vyšší z věrnostní a kupónové; při shodě zůstává
  věrnostní.
- Objednávka musí vrátit rozpis: základní cena, sleva, celkem a důvod slevy —
  potřebujeme to na účtenku.
- Nesmyslná objednávka (nulové nebo záporné množství, záporná cena) se nemá spočítat,
  má skončit chybou.
````

## --file-- CONTRIBUTING.md

````md
# Jak přispívat

## Konvence v kódu

- **Peníze jsou v haléřích jako celá čísla** (`6900` = 69 Kč). Procenta počítej
  pomocníkem `percentOf` ze `src/money.js`, nikdy ručním dělením stem. Na koruny
  převádí až zobrazení.
- **Výpočty jsou čisté funkce.** Nemění nic, co dostaly parametrem.
- **Chyby** vyhazuj jako `new AppError('KOD_CHYBY', 'Zpráva česky')` ze `src/errors.js`.
- **Do logu nepatří osobní údaje** — jméno, e-mail, telefon, adresa. Loguj id.
- Každá změna chování má test ve stejném commitu.

## Review

- Komentáře piš konkrétně a s důvodem. Drobnost, která nemá blokovat začlenění,
  začíná `nit:`.
````

## --file-- src/money.js

```js
/** Procento z částky v haléřích, zaokrouhlené na celé haléře. */
export function percentOf(amount, percent) {
  return Math.round((amount * percent) / 100);
}
```

## --file-- src/errors.js

```js
export class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}
```

## --file-- src/orders.js

```js
import { AppError } from './errors.js';
import { percentOf } from './money.js';

export const LOYALTY_TIERS = [
  { name: 'základní', minPoints: 0, percent: 0 },
  { name: 'stříbrná', minPoints: 500, percent: 5 },
  { name: 'zlatá', minPoints: 2000, percent: 10 },
];

export function tierFor(points) {
  let found = LOYALTY_TIERS[0];
  for (let i = 0; i < LOYALTY_TIERS.length; i++) {
    if (points >= LOYALTY_TIERS[i].minPoints) {
      found = LOYALTY_TIERS[i];
    }
  }
  return found;
}

export function orderTotal(order, customer, coupon) {
  order.items.sort((a, b) => a.name.localeCompare(b.name));

  let total = 0;
  for (const item of order.items) {
    total = total + item.price * item.qty;
  }
  const base = total;

  const tier = tierFor(customer.points);
  total = total - (total * tier.percent) / 100;

  if (coupon) {
    total = total - (total * coupon.percent) / 100;
  }

  console.log('objednávka pro', customer.email, 'celkem', total);

  return { base, discount: base - total, total, discountReason: tier.name };
}
```

## --file-- src/format.js

```js
const czk = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' });

/** Haléře → „1 234,50 Kč“. */
export function formatCzk(halere) {
  return czk.format(halere / 100);
}

/** Řádky účtenky z rozpisu ceny. */
export function receiptLines(price) {
  const lines = [{ label: 'Mezisoučet', amount: price.base }];
  if (price.discountReason === 'loyalty') {
    lines.push({ label: 'Věrnostní sleva', amount: -price.discount });
  } else if (price.discountReason === 'coupon') {
    lines.push({ label: 'Sleva z kupónu', amount: -price.discount });
  }
  lines.push({ label: 'Celkem', amount: price.total });
  return lines;
}
```

## --file-- test/orders.test.js

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tierFor, orderTotal } from '../src/orders.js';

const zakaznik = { email: 'hana@example.cz', points: 0 };

test('zlatá úroveň od 2000 bodů', () => {
  assert.equal(tierFor(2500).name, 'zlatá');
});

test('objednávka bez slevy', () => {
  const vysledek = orderTotal({ items: [{ name: 'polévka', price: 6900, qty: 2 }] }, zakaznik, null);
  assert.equal(vysledek.base, 13800);
  assert.equal(vysledek.total, 13800);
});
```

## --file-- package.json

```json
{
  "name": "bistro-pod-kastanem",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

## --file-- REVIEW.md

````md
# Code review: #71 Věrnostní sleva a kupóny

Díky za PR! Sepsal jsem, co jsem našel.

1.
````

# --solution--

## --file-- src/orders.js

```js
import { AppError } from './errors.js';
import { percentOf } from './money.js';

export const LOYALTY_TIERS = [
  { name: 'základní', minPoints: 0, percent: 0 },
  { name: 'stříbrná', minPoints: 500, percent: 5 },
  { name: 'zlatá', minPoints: 2000, percent: 10 },
];

// Úrovně jsou seřazené vzestupně podle minPoints, proto stačí najít poslední vyhovující.
export function tierFor(points) {
  return LOYALTY_TIERS.findLast((tier) => points >= tier.minPoints) ?? LOYALTY_TIERS[0];
}

function checkItem(item) {
  if (!Number.isInteger(item.qty) || item.qty <= 0) {
    throw new AppError('INVALID_QTY', 'Množství musí být celé kladné číslo.');
  }
  if (!Number.isInteger(item.price) || item.price < 0) {
    throw new AppError('INVALID_PRICE', 'Cena musí být celý počet haléřů, nezáporný.');
  }
}

export function orderTotal(order, customer, coupon = null) {
  const items = [...order.items];
  for (const item of items) checkItem(item);

  const base = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Slevy se nesčítají ani neřetězí: obě se počítají ze základní ceny a platí vyšší.
  const loyalty = percentOf(base, tierFor(customer.points).percent);
  const promo = coupon ? percentOf(base, coupon.percent) : 0;

  if (promo > loyalty) {
    return { base, discount: promo, total: base - promo, discountReason: 'coupon' };
  }
  return {
    base,
    discount: loyalty,
    total: base - loyalty,
    discountReason: loyalty > 0 ? 'loyalty' : null,
  };
}
```

## --file-- REVIEW.md

````md
# Code review: #71 Věrnostní sleva a kupóny

Díky za PR! Rozdělení na `tierFor` a `orderTotal` se mi líbí, funkce se dobře čte.
Sepsal jsem, co jsem našel — čtyři věci bych opravil před začleněním, jedna je drobnost.

1. **`src/orders.js`, výpočet slev — neodpovídá zadání.** Slevy se tady odečítají po
   sobě, takže věrnostních 10 % a kupón 20 % dá z 1000 Kč částku 720 Kč. Issue #71
   říká, že se slevy nesčítají a platí vyšší z obou (při shodě věrnostní), tedy
   800 Kč. Spočítal bych obě zvlášť ze základní ceny a vybral vyšší.

2. **`src/orders.js` — peníze přestanou být celá čísla.** `(total * percent) / 100`
   vrátí u nedělitelných částek desetinná místa, takže se dál počítá s haléři
   s desetinami. `CONTRIBUTING.md` na to má `percentOf` ze `src/money.js`, který
   rovnou zaokrouhluje.

3. **`src/orders.js` — do logu se dostane e-mail zákazníka.** Podle konvencí projektu
   do logu osobní údaje nepatří (logy se uchovávají a sdílejí s podporou). Buď to
   logování vypustit, nebo logovat jen id objednávky.

4. **`src/orders.js` — chybí kontrola vstupu.** Zadání říká, že nesmyslná objednávka
   se nemá spočítat, ale `qty: 0`, `qty: -2` i `qty: '2'` teď projdou a vrátí číslo
   nebo `NaN`. Hodilo by se vyhodit `AppError` s kódy `INVALID_QTY` a `INVALID_PRICE`
   a doplnit k tomu testy — existující sada testuje jen šťastnou cestu.

5. **`src/orders.js` — `order.items.sort(...)` mění pole volajícího.** Funkce má být
   podle konvencí čistá; řazení na místě přehází položky i tomu, kdo objednávku poslal
   (projeví se to třeba v pořadí na účtence). Stačí `[...order.items]`.

6. `nit:` **`src/orders.js`, `tierFor`** — cyklus funguje jen proto, že je `LOYALTY_TIERS`
   seřazené vzestupně. To z kódu není vidět; buď na to komentář, nebo rovnou
   `findLast`. Klidně až v dalším PR.

7. `nit:` **`discountReason` vrací název úrovně** („zlatá") místo důvodu slevy. Účtenka
   v `src/format.js` čeká `'loyalty'` / `'coupon'` / `null`, takže by se řádek se
   slevou nikdy nevykreslil. Tohle už je spíš chyba než drobnost, ale opravuje se to
   jedním řádkem.
````

# --approaches--

## --approach-- Vyšší sleva přes objekty a Math.max

Slevy si pojmenuje jako dvojice „kolik" a „odkud" a vybere maximum. Delší, ale
pravidlo „při shodě vyhrává věrnostní" je vidět na jednom řádku.

### --file-- src/orders.js

```js
import { AppError } from './errors.js';
import { percentOf } from './money.js';

export const LOYALTY_TIERS = [
  { name: 'základní', minPoints: 0, percent: 0 },
  { name: 'stříbrná', minPoints: 500, percent: 5 },
  { name: 'zlatá', minPoints: 2000, percent: 10 },
];

export function tierFor(points) {
  return LOYALTY_TIERS.findLast((tier) => points >= tier.minPoints) ?? LOYALTY_TIERS[0];
}

function checkItem(item) {
  if (!Number.isInteger(item.qty) || item.qty <= 0) {
    throw new AppError('INVALID_QTY', 'Množství musí být celé kladné číslo.');
  }
  if (!Number.isInteger(item.price) || item.price < 0) {
    throw new AppError('INVALID_PRICE', 'Cena musí být celý počet haléřů, nezáporný.');
  }
}

export function orderTotal(order, customer, coupon = null) {
  const items = [...order.items];
  for (const item of items) checkItem(item);

  const base = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Kandidáti na slevu. Pořadí rozhoduje při shodě: bere se první s nejvyšší částkou.
  const kandidati = [
    { amount: percentOf(base, tierFor(customer.points).percent), reason: 'loyalty' },
    { amount: coupon ? percentOf(base, coupon.percent) : 0, reason: 'coupon' },
  ];
  const nejvyssi = Math.max(...kandidati.map((k) => k.amount));
  const vitez = kandidati.find((k) => k.amount === nejvyssi);

  return {
    base,
    discount: vitez.amount,
    total: base - vitez.amount,
    discountReason: vitez.amount > 0 ? vitez.reason : null,
  };
}
```

### --file-- REVIEW.md

````md
# Code review: #71 Věrnostní sleva a kupóny

Díky za PR! Rozdělení na `tierFor` a `orderTotal` se mi líbí, funkce se dobře čte.
Sepsal jsem, co jsem našel — čtyři věci bych opravil před začleněním, jedna je drobnost.

1. **`src/orders.js`, výpočet slev — neodpovídá zadání.** Slevy se tady odečítají po
   sobě, takže věrnostních 10 % a kupón 20 % dá z 1000 Kč částku 720 Kč. Issue #71
   říká, že se slevy nesčítají a platí vyšší z obou (při shodě věrnostní), tedy
   800 Kč. Spočítal bych obě zvlášť ze základní ceny a vybral vyšší.

2. **`src/orders.js` — peníze přestanou být celá čísla.** `(total * percent) / 100`
   vrátí u nedělitelných částek desetinná místa, takže se dál počítá s haléři
   s desetinami. `CONTRIBUTING.md` na to má `percentOf` ze `src/money.js`, který
   rovnou zaokrouhluje.

3. **`src/orders.js` — do logu se dostane e-mail zákazníka.** Podle konvencí projektu
   do logu osobní údaje nepatří (logy se uchovávají a sdílejí s podporou). Buď to
   logování vypustit, nebo logovat jen id objednávky.

4. **`src/orders.js` — chybí kontrola vstupu.** Zadání říká, že nesmyslná objednávka
   se nemá spočítat, ale `qty: 0`, `qty: -2` i `qty: '2'` teď projdou a vrátí číslo
   nebo `NaN`. Hodilo by se vyhodit `AppError` s kódy `INVALID_QTY` a `INVALID_PRICE`
   a doplnit k tomu testy — existující sada testuje jen šťastnou cestu.

5. **`src/orders.js` — `order.items.sort(...)` mění pole volajícího.** Funkce má být
   podle konvencí čistá; řazení na místě přehází položky i tomu, kdo objednávku poslal
   (projeví se to třeba v pořadí na účtence). Stačí `[...order.items]`.

6. `nit:` **`src/orders.js`, `tierFor`** — cyklus funguje jen proto, že je `LOYALTY_TIERS`
   seřazené vzestupně. To z kódu není vidět; buď na to komentář, nebo rovnou
   `findLast`. Klidně až v dalším PR.

7. `nit:` **`discountReason` vrací název úrovně** („zlatá") místo důvodu slevy. Účtenka
   v `src/format.js` čeká `'loyalty'` / `'coupon'` / `null`, takže by se řádek se
   slevou nikdy nevykreslil. Tohle už je spíš chyba než drobnost, ale opravuje se to
   jedním řádkem.
````

## --approach-- Validace v samostatné čisté funkci

Kontrolu vstupu vyčlení do `validateOrder`, která vrátí očištěné položky. `orderTotal`
pak dělá jen výpočet — snáz se testuje každá část zvlášť.

### --file-- src/orders.js

```js
import { AppError } from './errors.js';
import { percentOf } from './money.js';

export const LOYALTY_TIERS = [
  { name: 'základní', minPoints: 0, percent: 0 },
  { name: 'stříbrná', minPoints: 500, percent: 5 },
  { name: 'zlatá', minPoints: 2000, percent: 10 },
];

export function tierFor(points) {
  return LOYALTY_TIERS.findLast((tier) => points >= tier.minPoints) ?? LOYALTY_TIERS[0];
}

/** Ověří objednávku a vrátí kopii položek. Nic nemění na vstupu. */
export function validateOrder(order) {
  return order.items.map((item) => {
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new AppError('INVALID_QTY', `Množství u položky ${item.name} musí být celé kladné číslo.`);
    }
    if (!Number.isInteger(item.price) || item.price < 0) {
      throw new AppError('INVALID_PRICE', `Cena u položky ${item.name} musí být celý počet haléřů.`);
    }
    return { ...item };
  });
}

function vyssiSleva(base, loyaltyPercent, couponPercent) {
  const loyalty = percentOf(base, loyaltyPercent);
  const promo = percentOf(base, couponPercent);
  if (promo > loyalty) return { discount: promo, discountReason: 'coupon' };
  return { discount: loyalty, discountReason: loyalty > 0 ? 'loyalty' : null };
}

export function orderTotal(order, customer, coupon = null) {
  const items = validateOrder(order);
  const base = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const { discount, discountReason } = vyssiSleva(
    base,
    tierFor(customer.points).percent,
    coupon ? coupon.percent : 0,
  );
  return { base, discount, total: base - discount, discountReason };
}
```

### --file-- REVIEW.md

````md
# Code review: #71 Věrnostní sleva a kupóny

Díky za PR! Rozdělení na `tierFor` a `orderTotal` se mi líbí, funkce se dobře čte.
Sepsal jsem, co jsem našel — čtyři věci bych opravil před začleněním, jedna je drobnost.

1. **`src/orders.js`, výpočet slev — neodpovídá zadání.** Slevy se tady odečítají po
   sobě, takže věrnostních 10 % a kupón 20 % dá z 1000 Kč částku 720 Kč. Issue #71
   říká, že se slevy nesčítají a platí vyšší z obou (při shodě věrnostní), tedy
   800 Kč. Spočítal bych obě zvlášť ze základní ceny a vybral vyšší.

2. **`src/orders.js` — peníze přestanou být celá čísla.** `(total * percent) / 100`
   vrátí u nedělitelných částek desetinná místa, takže se dál počítá s haléři
   s desetinami. `CONTRIBUTING.md` na to má `percentOf` ze `src/money.js`, který
   rovnou zaokrouhluje.

3. **`src/orders.js` — do logu se dostane e-mail zákazníka.** Podle konvencí projektu
   do logu osobní údaje nepatří (logy se uchovávají a sdílejí s podporou). Buď to
   logování vypustit, nebo logovat jen id objednávky.

4. **`src/orders.js` — chybí kontrola vstupu.** Zadání říká, že nesmyslná objednávka
   se nemá spočítat, ale `qty: 0`, `qty: -2` i `qty: '2'` teď projdou a vrátí číslo
   nebo `NaN`. Hodilo by se vyhodit `AppError` s kódy `INVALID_QTY` a `INVALID_PRICE`
   a doplnit k tomu testy — existující sada testuje jen šťastnou cestu.

5. **`src/orders.js` — `order.items.sort(...)` mění pole volajícího.** Funkce má být
   podle konvencí čistá; řazení na místě přehází položky i tomu, kdo objednávku poslal
   (projeví se to třeba v pořadí na účtence). Stačí `[...order.items]`.

6. `nit:` **`src/orders.js`, `tierFor`** — cyklus funguje jen proto, že je `LOYALTY_TIERS`
   seřazené vzestupně. To z kódu není vidět; buď na to komentář, nebo rovnou
   `findLast`. Klidně až v dalším PR.

7. `nit:` **`discountReason` vrací název úrovně** („zlatá") místo důvodu slevy. Účtenka
   v `src/format.js` čeká `'loyalty'` / `'coupon'` / `null`, takže by se řádek se
   slevou nikdy nevykreslil. Tohle už je spíš chyba než drobnost, ale opravuje se to
   jedním řádkem.
````

# --review--

Testy zkontrolovaly chování a formu komentářů. Tohle zkontroluj sám — je to ta část
review, kterou stroj neumí.

## --rubric--

- Každý komentář říká **proč**, ne jen co změnit.
- Komentář odkazuje na zadání nebo konvenci, když jde o jejich porušení.
- Drobnosti jsou označené jako `nit:` a nemíchají se s blokujícími připomínkami.
- Je v tom aspoň jedna věta o tom, co je na PR dobře.
- Komentáře jsou psané tak, že by se nad nimi nikdo neurazil — míří na kód, ne na autora.
- Kdybys ten PR dostal ty, věděl bys po přečtení komentářů přesně, co udělat.

## --extensions--

- Doplň do `test/orders.test.js` testy na to, co jsi opravil. Bez nich se stejná chyba
  vrátí do půl roku zpátky.
- Napiš na začátek `REVIEW.md` shrnutí ve dvou větách: co je blokující a co ne. Autor
  pak ví, co dělat, ještě než dočte.
- Zkus stejný kód zrevidovat podruhé s odstupem dne. Kolik dalších věcí najdeš?