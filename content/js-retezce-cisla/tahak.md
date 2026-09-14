> [!REMEMBER]
> **Metody řetězce vracejí nový řetězec. Peníze počítej v celých haléřích, formátuj až při výpisu přes `Intl`. Regulární výraz na celý vstup má kotvy `^` a `$`.**

## Řetězce

| zápis | vrátí | pozor |
|---|---|---|
| `text.at(-1)` | poslední znak | u prázdného textu `undefined` |
| `text.slice(start, end)` | výřez, znak na `end` už ne | záporné číslo počítá od konce |
| `includes`, `startsWith`, `endsWith` | `true` / `false` | na otázku „jestli" |
| `indexOf`, `lastIndexOf` | pozice, nebo `-1` | `0` je platná pozice, nedávej do `if` |
| `trim()`, `toLowerCase()` | upravený text | výsledek ulož |
| `padStart(délka, výplň)` | text doplněný zleva | jen na řetězci: `String(číslo)` |
| `replace(co, čím)` / `replaceAll` | první / všechny výskyty | `replaceAll` s výrazem chce `g` |
| `split(oddělovač)` / `join(spojka)` | kousky / zpátky text | dvě mezery = prázdný kousek |
| `a.localeCompare(b, 'cs')` | záporné / 0 / kladné | bez [[kód jazyka|kódu jazyka]] rozhoduje prohlížeč |

**Délka textu:** `text.length` = [[kódová jednotka|kódové jednotky]] (emoji 2 i víc) · `[...text].length` a `for…of` = znaky Unicode · `Intl.Segmenter` s `granularity: 'grapheme'` = to, co vidí člověk.

## Čísla

| zápis | `'42'` | `'08px'` | `'12,5'` | `''` |
|---|---|---|---|---|
| `Number(text)` | `42` | `NaN` | `NaN` | `0` |
| `parseInt(text, 10)` | `42` | `8` | `12` | `NaN` |
| `parseFloat(text)` | `42` | `8` | `12` | `NaN` |

| funkce | `4.7` | `-4.7` | `-2.5` |
|---|---|---|---|
| `Math.round` | `5` | `-5` | `-2` |
| `Math.floor` | `4` | `-5` | `-3` |
| `Math.ceil` | `5` | `-4` | `-2` |
| `Math.trunc` | `4` | `-4` | `-2` |

## Intl a datum

| potřebuješ | nástroj |
|---|---|
| `1 234,50 Kč` | `new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' })` |
| „1 hra, 3 hry, 5 her" | `new Intl.PluralRules('cs').select(n)` → `one` / `few` / `many` / `other` |
| „středa 16. září" | `Intl.DateTimeFormat` nebo `toLocaleString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })` |
| „zítra", „před 5 minutami" | `new Intl.RelativeTimeFormat('cs', { numeric: 'auto' }).format(-5, 'minute')` |
| datum bez času | `Temporal.PlainDate.from('2026-09-14')`, `add({ days: 2 })`, `until(jiné).days` |

## Regulární výrazy

| značka | význam |
|---|---|
| `\d`, `\s`, `\w`, `.` | číslice, bílý znak, anglické písmeno/číslice/`_`, cokoli |
| `[abc]`, `[^0-9]`, `\p{L}` | jeden z nich, cokoli kromě, písmeno v jakémkoli jazyce (s `u`) |
| `+`, `*`, `?`, `{2,3}` | 1+, 0+, 0–1, 2 až 3 ([[kvantifikátor]]); `+?` je líný |
| `^`, `$` | začátek, konec textu |
| `(…)`, `(?<name>…)` | skupina, pojmenovaná skupina |
| `g`, `i`, `u` | všechny výskyty, bez velikosti písmen, Unicode |

## Vzory

### Z korun na haléře a zpátky na výpis

```js
const priceHalere = Math.round(Number(input.replace(',', '.')) * 100);
const label = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(priceHalere / 100);
```

### Text bez diakritiky

```js
const plain = title.normalize('NFD').replace(/\p{M}/gu, '');
```

### Zkrácení s výpustkou

```js
const short = text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;
```

### Zaokrouhlení záporné částky jako na papíře

```js
const rounded = amount < 0 ? -Math.round(-amount) : Math.round(amount);
```

### Kontrola celého vstupu

```js
const isZip = /^\d{3} ?\d{2}$/.test(input.trim());
```

### Části textu přes pojmenované skupiny

```js
const match = url.match(/(?<year>\d{4})-(?<month>\d{2})/);
if (match) {
  console.log(match.groups.year);
}
```

### Kalendářní dny do data

```js
const days = Temporal.PlainDate.from(today).until(deliveryDate).days;
```

## Pasti

- `name.trim();` bez uložení nic nezmění.
- `if (text.indexOf('@'))` neplatí pro pozici `0` a platí pro `-1`.
- `split(' ')` u dvou mezer vrátí prázdný kousek.
- `0.1 + 0.2 === 0.3` je `false`; `Math.floor(49.9 * 3 * 100)` ztratí haléř.
- `toFixed` vrací řetězec: `(10).toFixed(2) + 5` je `'10.005'`.
- `Number('')` je `0`, `value === NaN` neplatí nikdy.
- `new Date(2026, 1, 30)` je 2. března — měsíce od nuly a přetékání.
- Výsledek `Intl` obsahuje nezalomitelné mezery, `===` s ručním textem selže.
- `\w` a `[a-z]` neznají diakritiku; `test` s příznakem `g` střídá výsledky.
- Výraz bez `^` a `$` propustí text, který vzor jen obsahuje.
