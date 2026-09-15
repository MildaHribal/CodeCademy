> [!REMEMBER]
> **Text z formuláře převeď na číslo hned, porovnávej přes `===` a hranice vždycky vyzkoušej přesně na hraniční hodnotě.**

## Proměnné a typy

| zápis | co dělá |
|---|---|
| `const name = 'Ema';` | [[proměnná]], do které už nejde přiřadit znovu — výchozí volba |
| `let count = 0;` | proměnná, do které smíš přiřazovat (`count += 1`) |
| `typeof value` | jméno [[datový typ|typu]] jako text: `'string'`, `'number'`, `'boolean'`, `'undefined'`, `'object'` |
| `typeof null` | `'object'` — na `null` se ptej přes `value === null` |
| `Number('42')`, `+'42'` | text na číslo; `Number('')` je `0`, `Number('12 Kč')` je `NaN` |
| `` `Celkem ${total} Kč` `` | [[šablonový řetězec]], smí mít víc řádků |
| `Math.round` / `Math.ceil` / `Math.floor` | k nejbližšímu / vždy nahoru / vždy dolů |
| `a % b` | zbytek po dělení; sudé číslo má `n % 2 === 0` |

## Druhy chyb

| hláška začíná | znamená | kdy se ohlásí |
|---|---|---|
| `SyntaxError` | kód není platný JavaScript | před spuštěním, neproběhne nic |
| `ReferenceError` | jméno neexistuje nebo ještě nevzniklo | na řádku, kde se použije |
| `TypeError` | hodnota to neumí (`undefined.name`, přiřazení do `const`) | na řádku, kde se použije |

Debugger: `debugger;` v kódu nebo [[breakpoint]] v panelu Sources · **F8** Resume · **F10** Step over · **F11** Step into · **Shift+F11** Step out · panel Scope ukáže všechny proměnné.

## Podmínky a logika

| výraz | vrátí |
|---|---|
| `a === b`, `a !== b` | `true`/`false`, bez převodu typů |
| `a && b` | `a`, když je falsy, jinak `b` |
| `a \|\| b` | `a`, když je truthy, jinak `b` — nahradí i `0` a `''` |
| `a ?? b` | `b` jen pro `null` a `undefined` |
| `podmínka ? x : y` | [[ternární operátor]]: jedna ze dvou hodnot |

[[falsy]] hodnoty: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Všechno ostatní je [[truthy]], i `'0'` a `'false'`.

## Cykly

| hlavička | průchody |
|---|---|
| `for (let i = 0; i < n; i++)` | přesně `n`× (0 až n − 1) |
| `for (let i = 1; i <= n; i++)` | přesně `n`× (1 až n) |
| `while (podmínka)` | dokud podmínka platí; krok piš do těla |
| `do { … } while (podmínka)` | aspoň jednou |
| `for (const char of text)` | jednou pro každý znak |

`break` ukončí cyklus, `continue` přeskočí zbytek průchodu.

## Vzory

```js
// řetěz hranic od nejvyšší
function gradeFor(percent) {
  if (percent < 0 || percent > 100) {
    return null; // brzký return pro neplatný vstup
  }
  if (percent >= 90) {
    return 1;
  } else if (percent >= 75) {
    return 2;
  } else {
    return 3;
  }
}

// přesné hodnoty: switch s return (break netřeba)
function dayType(day) {
  switch (day) {
    case 6:
    case 7:
      return 'víkend';
    default:
      return 'pracovní den';
  }
}

// průběžný součet: proměnná nad cyklem
let total = 0;
for (let month = 1; month <= 12; month++) {
  total += 1500;
}

// počítání znaků
let digits = 0;
for (const char of 'Leto2026') {
  if (char >= '0' && char <= '9') {
    digits++;
  }
}

// výchozí hodnota, která nechá nulu
const quantity = savedQuantity ?? 1;
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| `'1250' + 89` → `125089` | `+` s textem spojuje | `Number(input)` hned u vstupu |
| podmínka platí vždy, proměnná se změní | `if (x = 5)` přiřazuje | `===` |
| hodnota přesně na hranici ve špatné větvi | `>` místo `>=` | „od" a „aspoň" = `>=`, hranici vyzkoušej |
| zadaná nula se nahradí výchozí hodnotou | `value \|\| výchozí` | `value ?? výchozí` |
| `switch` nastaví víc věcí, poslední vyhraje | chybí `break` | `break` nebo `return` v každé větvi |
| o řádek víc nebo míň | [[off-by-one]]: start `0`/`1`, `<` × `<=` | řekni si první a poslední hodnotu |
| součet je vždy jen poslední hodnota | `let` součtu uvnitř cyklu | deklaruj ho nad cyklem |
| `Smyčka běží příliš dlouho` | [[nekonečná smyčka]]: chybí krok nebo jde špatným směrem | krok musí vést k hranici |
| `Cannot read properties of undefined` | hodnota před tečkou je `undefined` | hledej, odkud přišla (funkce bez `return`) |
| `'10' < '9'` je `true` | dva texty se porovnávají znak po znaku | převeď na čísla |
