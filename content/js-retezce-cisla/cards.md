## --card-- free

Mění metody řetězců jako `toUpperCase()` nebo `slice()` původní proměnnou?

### --back--

Ne, řetězce jsou v JavaScriptu neměnné (primitivní hodnota). Žádná řetězcová metoda původní text nemění — vždy vrací nový řetězec. Výsledek je proto potřeba přiřadit do proměnné: `greeting = greeting.toUpperCase()`.

### --see--

js-retezce-cisla/retezce#retezec-se-neda-zmenit

## --card-- output

Co vypíše tenhle kód?

```js
const filename = 'report.final.pdf';
console.log(filename.slice(-3));
```

### --expected--

pdf

### --why--

Záporný index u metody `slice()` počítá pozici od konce řetězce. Index `-3` vyřízne poslední tři znaky textu.

### --see--

js-retezce-cisla/retezce#kousky-textu-at-slice-a-hledani

## --card-- output

Co vypíše tenhle kód?

```js
const email = '  eva@priklad.cz  ';
console.log(email.trim());
```

### --expected--

eva@priklad.cz

### --why--

Metoda `trim()` odstraní bílé znaky (mezery, tabulátory, konce řádků) ze začátku i konce řetězce, ale mezer uvnitř textu se nedotkne.

### --see--

js-retezce-cisla/retezce#upravy-trim-velikost-pismen-padstart-replaceall

## --card-- output

Co vypíše tenhle kód?

```js
const month = '4';
console.log(month.padStart(2, '0'));
```

### --expected--

04

### --why--

Metoda `padStart(cílováDélka, výplň)` doplní řetězec zleva zadaným znakem tak, aby dosáhl požadované délky. Pokud už řetězec zadané délky dosahuje, vrátí ho beze změny.

### --see--

js-retezce-cisla/retezce#upravy-trim-velikost-pismen-padstart-replaceall

## --card-- output

Co vypíše tenhle kód?

```js
const text = 'JavaScript je skvělý';
console.log(text.includes('Script', 5));
```

### --expected--

false

### --why--

Druhý parametr metody `includes(hledanýText, odIndexu)` udává pozici, od které se začíná hledat. Slovo `'Script'` začíná na indexu 4; od indexu 5 už v textu není celé, proto metoda vrátí `false`.

### --see--

js-retezce-cisla/retezce#kousky-textu-at-slice-a-hledani

## --card-- output

Co vypíše tenhle kód?

```js
const tags = 'html, css, js';
console.log(tags.split(', ').join('/'));
```

### --expected--

html/css/js

### --why--

`split(', ')` rozdělí text podle čárky s mezerou na pole tří prvků `['html', 'css', 'js']` a `join('/')` je spojí zpět do jednoho řetězce odděleného lomítky.

### --see--

js-retezce-cisla/retezce#rozdeleni-a-spojeni-split-a-join

## --card-- free

Proč v JavaScriptu porovnání `0.1 + 0.2 === 0.3` vrátí `false` a jak se bezpečně počítá s penězi?

### --back--

JavaScript ukládá čísla v plovoucí řádové čárce (standard IEEE 754). Desetinná čísla 0.1 a 0.2 nelze v binární soustavě vyjádřit přesně a jejich součet je `0.30000000000000004`. Pro bezpečné počítání s penězi se částky převádějí na nejmenší celočíselné jednotky (haléře, centy), kde ke ztrátě přesnosti nedochází.

### --see--

js-retezce-cisla/cisla#desetinna-cisla

## --card-- output

Co vypíše součet cen počítaných v haléřích?

```js
const rohlik = 290;
const chleba = 4990;
const celkemKc = (rohlik + chleba) / 100;
console.log(celkemKc);
```

### --expected--

52.8

### --why--

Počítání v nejmenších měnových jednotkách (haléře, centy) využívá bezpečnou celočíselnou aritmetiku bez zaokrouhlovacích chyb plovoucí čárky. Na koruny s desetinným místem se částka převede až dělením 100 při zobrazení.

### --see--

js-retezce-cisla/cisla#pocitani-v-halerich

## --card-- free

Jaký je rozdíl mezi převodem pomocí `Number('50px')` a `parseInt('50px', 10)`?

### --back--

`Number()` vyžaduje, aby celý řetězec tvořilo platné číslo, jinak vrátí `NaN`. Naproti tomu `parseInt()` čte číslice zleva a zastaví se u prvního nečíselného znaku (`p`), takže z `'50px'` vrátí číslo `50`.

### --see--

js-retezce-cisla/cisla#parseint-vs-number

## --card-- output

Co vypíše tenhle kód?

```js
console.log(isNaN('test'), Number.isNaN('test'));
```

### --expected--

true false

### --why--

Globální funkce `isNaN()` nejdříve převede argument na číslo (`Number('test')` je `NaN`), proto vrátí `true`. Moderní `Number.isNaN()` žádný převod typu neprovádí a vrátí `true` pouze tehdy, když je hodnota typu number a rovna `NaN`.

### --see--

js-retezce-cisla/cisla#number-isnan

## --card-- output

Co vypíše dělení velkých celých čísel?

```js
const result = 7n / 2n;
console.log(result);
```

### --expected--

3n

### --why--

U typu `BigInt` je dělení vždy celočíselné a zbytek po dělení se zahodí (zaokrouhlí se k nule). Výsledkem operace s hodnotami BigInt je opět hodnota typu BigInt.

### --see--

js-retezce-cisla/cisla#bigint

## --card-- output

Co vypíše zaokrouhlení záporného čísla?

```js
console.log(Math.floor(-1.5), Math.ceil(-1.5));
```

### --expected--

-2 -1

### --why--

`Math.floor()` zaokrouhluje vždy dolů směrem k menšímu číslu (u `-1.5` je to `-2`). `Math.ceil()` zaokrouhluje nahoru k většímu číslu (u `-1.5` je to `-1`).

### --see--

js-retezce-cisla/cisla#zaokrouhleni-zapornych-cisel

## --card-- free

Jak pomocí `Math.random()` vygeneruješ náhodné celé číslo v intervalu od `min` do `max` (včetně obou krajních hodnot)?

### --back--

Pomocí vzorce:
```js
Math.floor(Math.random() * (max - min + 1)) + min;
```
`Math.random()` vrátí desetinné číslo z polootevřeného intervalu `[0, 1)`. Vynásobením `(max - min + 1)` a zaokrouhlením dolů přes `Math.floor()` získáme celá čísla od `0` do `max - min`. Přičtením `min` pak celý interval posuneme na `min` až `max`.

### --see--

js-retezce-cisla/cisla#math-random

## --card-- output

Co vypíše zformátování částky v české měně?

```js
const fmt = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
});
console.log(fmt.format(2500).replace(/\s/g, ' '));
```

### --expected--

2 500 Kč

### --why--

`Intl.NumberFormat` respektuje české zvyklosti — tisíce oddělí mezerou a měnu zapíše za částku. Díky `maximumFractionDigits: 0` vynechá desetinná místa.

### --see--

js-retezce-cisla/intl-a-datum#intl-numberformat

## --card-- output

Co vypíše zformátování data pomocí `Intl.DateTimeFormat`?

```js
const date = new Date(2026, 8, 14);
const fmt = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' });
console.log(fmt.format(date).replace(/\s/g, ' '));
```

### --expected--

14. 9. 2026

### --why--

`Intl.DateTimeFormat` s volbou `dateStyle: 'medium'` zformátuje datum v češtině do podoby dne, měsíce a roku oddělených tečkami s mezerami (`14. 9. 2026`). Měsíc s indexem 8 v konstruktoru `Date` představuje září, protože měsíce se číslují od 0.

### --see--

js-retezce-cisla/intl-a-datum#datetimeformat-a-relativetimeformat

## --card-- output

Které kategorie vrátí `Intl.PluralRules` pro češtinu u hodnot 1, 2 a 5?

```js
const pr = new Intl.PluralRules('cs');
console.log(pr.select(1), pr.select(2), pr.select(5));
```

### --expected--

one few other

### --why--

V češtině `Intl.PluralRules` podle standardu CLDR rozlišuje pravidla pro celá čísla: hodnota `1` odpovídá kategorii `'one'` (1 položka), hodnoty `2..4` kategorii `'few'` (2 položky) a `5` i více (včetně nuly) kategorii `'other'` (5 položek). Kategorie `'many'` se v češtině používá pro desetinná čísla.

### --see--

js-retezce-cisla/intl-a-datum#pluralrules

## --card-- output

Který měsíc vytvoří tento konstruktor objektu `Date`?

```js
const d = new Date(2026, 0, 1);
console.log(d.getMonth());
```

### --expected--

0

### --why--

V objektu `Date` se měsíce indexují od nuly: 0 je leden, 1 je únor a 11 je prosinec. Hodnota `0` tedy představuje leden.

### --see--

js-retezce-cisla/intl-a-datum#pasti-date

## --card-- free

Jaké hlavní nevýhody starého objektu `Date` odstraňuje moderní rozhraní `Temporal`?

### --back--

1. **Neměnnost (immutability):** Objekty v `Temporal` jsou neměnné, každá metoda vrací novou instanci a nehrozí nechtěná změna původního data.
2. **Přirozené číslování měsíců:** Měsíce se číslují lidsky od 1 do 12 (leden je 1, ne 0).
3. **Oddělené specializované typy:** `Temporal.PlainDate` (datum bez času a pásma), `Temporal.PlainTime` (čas bez data), `Temporal.ZonedDateTime` (okamžik v konkrétním časovém pásmu).
4. **Správná podpora časových pásem a letního času:** Žádné tiché převody do lokálního pásma systému.

### --see--

js-retezce-cisla/intl-a-datum#temporal

## --card-- output

Co vypíše líný kvantifikátor `*?` při hledání v textu?

```js
const html = '<b>první</b> a <b>druhý</b>';
const match = html.match(/<b>.*?<\/b>/);
console.log(match[0]);
```

### --expected--

```html
<b>první</b>
```

### --why--

Běžný kvantifikátor `*` je hladový (greedy) a zabral by co nejdelší úsek až po poslední `</b>`. Otazník za ním `*?` vytváří líný (lazy) kvantifikátor, který se zastaví hned u prvního výskytu uzavírací značky.

### --see--

js-retezce-cisla/regularni-vyrazy#kvantifikatory-hladove-vs-line

## --card-- output

Co vypíše regulární výraz s kotvami `^`, `$` a příznakem `i`?

```js
const re = /^user_[a-z]+$/i;
console.log(re.test('USER_admin'), re.test('user_123'));
```

### --expected--

true false

### --why--

Kotva `^` testuje začátek řetězce, `$` konec řetězce a příznak `i` (ignoreCase) ignoruje velikost písmen, takže vzor projde i pro velká písmena `USER_ADMIN`. Vstup `'user_123'` neprojde, protože číslice neodpovídají třídě `[a-z]`.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-skupiny
