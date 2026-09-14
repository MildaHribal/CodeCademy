> [!REMEMBER]
> **Funkce je pojmenovaný postup s jasným vstupem (parametry) a výstupem (`return`).** Proměnná je vidět v bloku, kde vznikla, a hledá se zevnitř ven podle toho, kde je funkce napsaná.

## Zápisy funkcí

| zápis | vrací | jde zavolat nad svým řádkem? |
|---|---|---|
| `function withVat(price) { return price * 1.21; }` | co je za `return` | ano ([[hoisting]]) |
| `const withVat = function (price) { return price * 1.21; };` | co je za `return` | ne, `ReferenceError` (TDZ) |
| `const withVat = (price) => price * 1.21;` | výraz za šipkou | ne, `ReferenceError` (TDZ) |
| `const withVat = (price) => { return price * 1.21; };` | co je za `return` | ne, `ReferenceError` (TDZ) |

## Parametry

| zápis | co dělá | pozor |
|---|---|---|
| `f(a, b)` | argumenty se přiřadí podle pořadí | chybějící argument je `undefined` |
| `function f(decimals = 2)` | [[výchozí parametr]] pro `undefined` | `0`, `''` a `null` výchozí hodnotu nespustí |
| `function f(first, ...rest)` | [[zbytkový parametr]]: zbylé argumenty v poli | jen jeden a poslední; bez argumentů `[]` |
| `value \|\| 2` | náhrada každé nepravdivé hodnoty | přepíše i `0` a `''` — na výchozí hodnoty nepoužívat |
| `value ?? 2` | náhrada jen `null` a `undefined` | nulu nechá být |

## Rozsah platnosti

| deklarace | [[rozsah platnosti]] | před svým řádkem |
|---|---|---|
| `const` | blok `{ }` | TDZ → `ReferenceError` |
| `let` | blok `{ }` | TDZ → `ReferenceError` |
| `var` | celá funkce (skript) | `undefined` |
| `function name()` | celá funkce (skript) | dá se zavolat |
| přiřazení bez deklarace | globální (ve strict mode chyba) | — |

V DevTools: breakpoint (klik na číslo řádku v Sources) → panel **Scope** (*Local*, *Block*, *Script*, *Global*) a panel **Call Stack** ([[zásobník volání]]).

## Vzory

```js
// guard clause: nesmysly vyřiď hned, výpočet nech na konci
function pricePerPerson(total, people) {
  if (people <= 0) {
    return null;
  }
  return total / people;
}

// výchozí a zbytkový parametr
function formatNumber(value, decimals = 2) {
  return String(roundTo(value, decimals)).replace('.', ',');
}

function totalKm(...milesLegs) {
  let total = 0;
  for (const miles of milesLegs) {
    total += milesToKm(miles);
  }
  return total;
}

// skládání malých funkcí
function describeConversion(text, conversion) {
  const amount = parseAmount(text);
  if (Number.isNaN(amount)) {
    return 'Zadej číslo';
  }
  return `${formatNumber(amount, 1)} → ${formatResult(convert(amount, conversion), targetUnit(conversion))}`;
}

// čistý výpočet × vedlejší efekt
const withVat = (price) => price * 1.21;
function printPrice(price) {
  console.log(`${withVat(price)} Kč`);
}

// callback: funkci předávám bez závorek
function applyRule(price, rule) {
  return Math.round(rule(price));
}
applyRule(899, (price) => price - 100);
setTimeout(hideNotice, 5000);
setTimeout(() => showMessage('Uloženo'), 1000);
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| funkce vrací `undefined`, výpočet dá `NaN` | chybí `return` (i v šipce se `{ }`) | přidat `return`, nebo u šipky smazat `{ }` |
| `undefined`, i když výraz pod `return` vypadá správně | `return` na samostatném řádku | výraz začít na řádku s `return` |
| `roundTo(x, 0)` zaokrouhlí na dvě místa | výchozí hodnota přes `\|\|` | výchozí parametr nebo `??` |
| `if (isOpen)` platí vždy, v textu je zdroják funkce | jméno funkce bez závorek | `isOpen()` |
| změna uvnitř `if` se neprojeví, žádná chyba | `let` uvnitř bloku [[zastíní]] vnější proměnnou | uvnitř bloku jen přiřadit |
| `ReferenceError: Cannot access 'x' before initialization` | čtení `let`/`const` v TDZ | deklaraci přesunout nad použití |
| `ReferenceError: row is not defined` v pomocné funkci | funkce nevidí proměnné volajícího ([[lexikální rozsah]]) | předat hodnotu parametrem |
| `TypeError: rule is not a function` | místo funkce předán její výsledek, třeba `applyRule(900, halfPrice(900))` | předat `halfPrice` bez závorek |
| akce z `setTimeout` proběhne hned | `setTimeout(fn(), ms)` | `setTimeout(fn, ms)` |
| callback dostane `undefined` | volající mu argument nepředává | obalit šipkou s argumentem |
