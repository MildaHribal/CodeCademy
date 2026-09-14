# Čísla a počítání

:::check pretest
Co vypíše následující kód?

```js
console.log(0.1 + 0.2 === 0.3);
```

### --expected--

false

### --why--

V JavaScriptu (a většině dalších jazyků) se desetinná čísla ukládají v takzvané plovoucí řádové čárce (IEEE 754). Výsledkem `0.1 + 0.2` je `0.30000000000000004`, takže se `0.3` nerovná.
:::

Většinu času čísla prostě sčítáš, odčítáš a porovnáváš. Občas ale potřebuješ pracovat s penězi, generovat náhodná čísla nebo zpracovávat vstup, který by číslo měl být, ale není.

## Desetinná čísla

JavaScript má jen jeden typ pro čísla: `Number`. Jde o takzvanou **plovoucí řádovou čárku** (anglicky *floating point*). Funguje skvěle pro většinu výpočtů, ale má jednu zásadní slabinu: nedokáže přesně reprezentovat některé zlomky (třeba desetiny).

**Když počítáš s penězi, převeď je na haléře (nebo centy) a počítej v celých číslech.**

## Počítání v haléřích

Místo abys ukládal cenu jako `19.99` a pak řešil problémy se zaokrouhlením, ulož ji jako `1999` a před vypsáním vyděl stem.

:::check
Kolega počítá slevu 10 % z ceny `500`. Co z tohoto kódu vypadne?

```js
const price = 500;
const discount = price * 0.1;
console.log(price - discount);
```

### --answer--

`450`

#### --why--

V tomto konkrétním případě to projde bez chyb, ale u desetinných cen by mohlo dojít k nepřesnosti. Ukládat hodnoty v haléřích je vždy bezpečnější.

### --correct--

`450`

#### --why--

Výpočet `500 * 0.1` vyjde naštěstí přesně a výsledek je `450`. Ale je to riskantní, pokud by cena byla desetinná. Vždy je jistější pracovat s haléři.

### --see--

js-retezce-cisla/cisla#pocitani-v-halerich
:::

## toFixed vrací řetězec

Když chceš číslo vypsat na dvě desetinná místa, použiješ metodu `toFixed(2)`. 

**Metoda `toFixed` číslo zaokrouhlí a vrátí jako řetězec, ne jako číslo.**

:::live js predict
```js
const price = 1.005;
console.log(price.toFixed(2));
```
--question-- Co vypíše výpočet s toFixed?
--expected--
```text
1.00
```
--why-- V JavaScriptu může 1.005 vnitřně odpovídat číslu nepatrně menšímu, takže klasické `toFixed(2)` ho zaokrouhlí dolů. Proto je lepší k formátování používat `Intl.NumberFormat` nebo počítat v haléřích a zaokrouhlovat v nich (např. `Math.round(100.5)`).
:::

## Zaokrouhlení záporných čísel

U klasického zaokrouhlování (`Math.round`, `Math.floor`, `Math.ceil`) fungují u záporných čísel věci trochu neintuitivně. `Math.floor` zaokrouhluje **dolů** (k menšímu číslu), takže z `-1.2` udělá `-2`.

## Number.isNaN

Když se JavaScriptu nepovede převést text na číslo, vrátí speciální hodnotu `NaN` (*Not a Number*). 

**`NaN` je jediná hodnota v JavaScriptu, která se nerovná sama sobě.**

Proto nepomůže `value === NaN`. Musíš použít `Number.isNaN(value)`.

## parseInt vs. Number

Pro převod textu na číslo máš dvě hlavní cesty: `Number('42')` a `parseInt('42', 10)`.

- `Number()` je přísné: když je v textu navíc nějaký balast (třeba `'42px'`), vrátí `NaN`.
- `parseInt()` se snaží číslo vytáhnout od začátku řetězce a zbytek odříznout.

:::live js predict
```js
console.log(parseInt('08px', 10));
console.log(Number('08px'));
```
--question-- Co vypíšou tyto dva řádky? Každý na svůj řádek.
--expected--
```text
8
NaN
```
--why-- `parseInt` najde osmičku a ignoruje `px`. `Number` si s písmeny neporadí a vrátí `NaN`.
:::

> [!TIP]
> **Vždy předávej `parseInt` druhý argument (soustavu), obvykle `10`**. Bez něj mohl starší JavaScript chápat texty začínající nulou jako osmičkovou soustavu.

## BigInt

Když potřebuješ ukládat gigantická celá čísla (větší než devět bilionů, tzv. `Number.MAX_SAFE_INTEGER`), použiješ typ `BigInt`. Přidává se písmeno `n` na konec čísla (např. `10n`). Nesmí se míchat s klasickými čísly.

## Math.random

`Math.random()` vrátí číslo mezi `0` (včetně) a `1` (bez jedničky). Když potřebuješ náhodné celé číslo, vynásobíš ho a odřízneš desetiny.

## Typické chyby a pasti

### toFixed pro výpočty

> [!PITFALL]
> **S `toFixed` dál nepočítej.** Protože vrací řetězec, `price.toFixed(2) + 10` spojí text dohromady (`'10.0010'`). Použij ho až ve chvíli, kdy výsledek tiskneš na obrazovku.

### parseFloat a parseIn vs. diakritika / čárky

> [!PITFALL]
> **JavaScript nerozumí české čárce.** `Number('3,14')` vrátí `NaN`. Musíš nejdřív udělat `replace(',', '.')`.

## Kde to najdeš v MDN

- [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) — o maximálních hodnotách, `NaN` a bezpečných číslech.
- [Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math) — všechny matematické funkce jako `round`, `floor`, `max`, `min`.

# --questions--

## --question--

Co vrátí `Number.isNaN(NaN)` a co `NaN === NaN`?

### --expected--

`Number.isNaN(NaN)` vrátí `true`, `NaN === NaN` vrátí `false`.

### --why--

`NaN` se z definice nerovná ničemu, ani sobě samému, proto je `===` `false`. Musíš použít záchytnou funkci `Number.isNaN()`.

### --see--

js-retezce-cisla/cisla#number-isnan

## --question--

Jak z českého uživatelského vstupu `'19,5'` vyrobíš platné číslo?

### --expected--

`Number(vstup.replace(',', '.'))`

### --why--

JavaScript akceptuje jen tečky jako oddělovač desetinných míst. Pokud chceme, aby uživatel zadával čárky, musíme je my v kódu změnit před převodem.

### --see--

js-retezce-cisla/cisla#parsefloat-a-parsein-vs-diakritika-carky
