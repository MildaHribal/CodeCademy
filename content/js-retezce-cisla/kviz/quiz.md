---
pass: 0.8
---

# --questions--

## --question--

Co vypíše tenhle kód?

```js
const product = 'Kolo';
console.log(product.at(-1) + product.slice(1, 3));
```

### --expected--

ool

### --accept--

'ool'

### --why--

`at(-1)` vezme poslední znak `o`. `slice(1, 3)` vyřízne znaky na pozicích 1 a 2, tedy `ol` — znak na pozici 3 už do výsledku nepatří. Dohromady `ool`.

### --see--

js-retezce-cisla/retezce#kousky-textu-at-slice-a-hledani

## --question--

Pole pro zprávu má limit a hlídá ho přes `length`. Kolik vypíše `console.log('Ahoj 👋'.length)`?

### --expected--

7

### --why--

`Ahoj` a mezera jsou pět kódových jednotek, emoji mávající ruky zabírá další dvě. `length` počítá jednotky, ne znaky na obrazovce, proto 7 a ne 6.

### --see--

js-retezce-cisla/retezce#unicode-diakritika-a-emoji

## --question--

E-shop řadí výdejní místa porovnáním `a.localeCompare(b, 'cs')`. V jakém pořadí vyjdou města Cheb, Hodonín, Čáslav a Cvikov?

### --answer--

Cheb, Cvikov, Hodonín, Čáslav

#### --why--

Takhle řadí porovnání podle čísel znaků v Unicode (`<` nebo `sort()` bez funkce): `Ch` je pro něj `C` a `h`, a `Č` má vyšší číslo než všechna anglická písmena. Česká pravidla vypadají jinak.

### --correct--

Cvikov, Čáslav, Hodonín, Cheb

#### --why--

V české abecedě je `Č` hned za `C` a `ch` samostatné písmeno až za `h`. Přesně to `localeCompare` s jazykem `'cs'` zná.

### --answer--

Čáslav, Cheb, Cvikov, Hodonín

#### --why--

Myslíš si, že diakritika řadí písmeno před obyčejné? `Č` patří v češtině až za `C`, ne před něj.

### --see--

js-retezce-cisla/retezce#porovnani-a-razeni-podle-cestiny

## --question--

Zákazníkovi se vrací 249,50 Kč, v systému je to záporná částka. Co vypíše tenhle kód?

```js
const refund = -249.5;
console.log(Math.round(refund));
```

### --expected--

-249

### --why--

`Math.round` posouvá přesnou polovinu vždycky nahoru na číselné ose, tedy k většímu číslu. U `-249.5` je větší `-249`. Na papíře bys zaokrouhlil na `-250`: zaokrouhli kladnou hodnotu a znaménko přidej zpátky.

### --see--

js-retezce-cisla/cisla#zaokrouhleni-round-floor-ceil-a-trunc

## --question--

Které výrazy vrátí `true`? Vyber všechny.

### --correct--

`Number.isNaN(Number('12,50'))`

#### --why--

`Number` nezná desetinnou čárku, takže `'12,50'` převede na `NaN`, a `Number.isNaN` to potvrdí.

### --correct--

`parseInt('3.99 Kč', 10) === 3`

#### --why--

`parseInt` čte celé číslo zleva a u tečky skončí. Zbytek textu tiše zahodí.

### --answer--

`Number.isNaN('12,50')`

#### --why--

`Number.isNaN` hodnotu nepřevádí. Text `'12,50'` není hodnota `NaN`, je to řetězec.

### --answer--

`Number('') === NaN`

#### --why--

Dvě chyby najednou: prázdný text je pro `Number` nula, a `NaN` se navíc nerovná ničemu, ani sám sobě.

### --see--

js-retezce-cisla/cisla#z-textu-na-cislo-number-parseint-parsefloat

## --question--

Co vypíše tenhle kód?

```js
const coupon = 0.7;
const credit = 0.1;
console.log(coupon + credit === 0.8);
```

### --expected--

false

### --why--

`0.7 + 0.1` vyjde `0.7999999999999999`, protože desetiny jde ve dvojkové soustavě uložit jen přibližně. Proto se peníze počítají v celých haléřích, kde `===` funguje.

### --see--

js-retezce-cisla/cisla#jeden-typ-number-a-plovouci-radova-carka

## --question--

Co vypíše poslední řádek?

```js
const renewal = new Date(2026, 4, 31);
renewal.setMonth(5);
console.log(renewal.getMonth(), renewal.getDate());
```

### --expected--

6 1

### --why--

`new Date(2026, 4, 31)` je 31. května (měsíce od nuly). `setMonth(5)` chce 31. června, ten neexistuje, a datum přeteče na 1. července. Červenec má v `Date` číslo `6`.

### --see--

js-retezce-cisla/intl-a-datum#mesice-od-nuly-a-pretekani

## --question--

Předplatné začalo `Temporal.PlainDate.from('2026-03-31')`. Co vrátí `.add({ months: 1 }).toString()`?

### --answer--

`2026-05-01`

#### --why--

Takhle by přetekl `Date`. `Temporal` s neexistujícím dnem v měsíci zachází jinak.

### --correct--

`2026-04-30`

#### --why--

Duben má 30 dní. `Temporal` přičte kalendářní měsíc a den, který v dubnu není, zarovná na poslední den měsíce.

### --answer--

Vyhodí `RangeError`, protože 31. dubna neexistuje.

#### --why--

Při přičítání měsíců `Temporal` chybu nevyhodí. `RangeError` vyhodí třeba při vytváření data z textu `'2026-04-31'`.

### --see--

js-retezce-cisla/intl-a-datum#temporal-datum-bez-pasti

## --question--

Co vrátí `/^\d{2,3}$/.test('1234')`?

### --expected--

false

### --why--

Kotvy `^` a `$` chtějí, aby celý text tvořily dvě až tři číslice. Čtyři číslice jsou moc. Bez kotev by výraz našel tři číslice uvnitř a vrátil `true`.

### --see--

js-retezce-cisla/regularni-vyrazy#kvantifikatory-kolikrat

## --question--

Co vypíše tenhle kód?

```js
const caption = '#Brno #Praha';
console.log(caption.replace(/#(\p{L}+)/gu, '@$1'));
```

### --expected--

@Brno @Praha

### --why--

Příznak `g` nahradí každou shodu, ne jen první. Skupina v závorkách zachytí písmena za mřížkou a `$1` je v náhradě vloží za zavináč.

### --see--

js-retezce-cisla/regularni-vyrazy#vsechny-vyskyty-matchall-a-replace

## --question--

Najdi v anglické dokumentaci MDN u konstruktoru `Intl.NumberFormat` volbu, se kterou se místo symbolu `Kč` ukáže kód měny `CZK` (`1 299,00 CZK`). Napiš dvojici `klíč: hodnota`.

### --expected--

currencyDisplay: 'code'

### --accept--

currencyDisplay: "code"

### --why--

Volba `currencyDisplay` řídí, jak se měna ukáže: `'symbol'` (výchozí, `Kč`), `'code'` (`CZK`) nebo `'name'` (`české koruny`). Najdeš ji v části *Parameters* stránky `Intl.NumberFormat() constructor`.

### --see--

js-retezce-cisla/intl-a-datum#intl-numberformat-ceny-procenta-a-jednotky

## --question--

Doprava je zdarma, v proměnné je nula. Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
const shipping = 0;
console.log(shipping || 89, shipping ?? 89);
```

### --expected--

89 0

### --why--

`||` vrátí pravou stranu, kdykoli je levá nepravdivá, a nula nepravdivá je — doprava zdarma se tak změní na 89 Kč. `??` bere pravou stranu jen za `null` a `undefined`, nulu nechá být.

### --see--

js-zaklady/porovnani-a-logika#vychozi-hodnota-misto

## --question--

Kolikrát proběhne tělo cyklu?

```js
let count = 0;
for (const char of 'Ano 👍') {
  count++;
}
console.log(count);
```

### --expected--

5

### --why--

`for…of` prochází celé znaky Unicode, ne kódové jednotky: `A`, `n`, `o`, mezera a palec. `length` by přitom hlásil 6, protože palec zabírá dvě jednotky.

### --see--

js-zaklady/cykly#for-of-prochazi-text-znak-po-znaku

## --question--

Formulář posílá počet vstupenek jako text. Kolegova podmínka `if (tickets === 3)` nad hodnotou `const tickets = form.tickets.value;` nikdy neplatí, i když uživatel napíše 3. Proč?

### --answer--

`===` neumí porovnávat čísla.

#### --why--

Čísla `===` porovnává bez problémů. Podívej se, jakého typu je hodnota z formuláře.

### --correct--

Hodnota z formuláře je řetězec `'3'` a `===` porovnává i typ.

#### --why--

`'3' === 3` je `false`. Oprava je převést vstup hned na začátku: `Number(form.tickets.value)`.

### --answer--

Uživatel napsal mezeru navíc.

#### --why--

I bez mezery by `'3' === 3` neplatilo. Problém je v typu, ne v textu.

### --see--

js-zaklady/porovnani-a-logika#porovnani-textu-s-cislem

## --question--

Co vypíše poslední průchod cyklu?

```js
const code = 'kolo';
for (let i = 0; i <= code.length; i++) {
  console.log(code[i]);
}
```

### --expected--

undefined

### --why--

Podmínka `i <= code.length` pustí i `i = 4`, a znak na indexu 4 v textu o čtyřech znacích není. Čtení mimo řetězec nespadne, vrátí `undefined`. Správně je `i < code.length`.

### --see--

js-zaklady/cykly#pruchod-navic

# --code-- Faktury za pronájem kurtů

## --file-- invoice.js

```js
// Faktury pro rezervace kurtů (sportovní areál Lužánky)
// Autor: Radek, 2024 — převzato do nového systému beze změn

const VAT_RATE = 21;
const DUE_DAYS = 14;
const COURT_PRICE = 320;
const LIGHTS_PRICE = 60;

function invoiceNumber(order, year) {
  let digits = String(order);
  while (digits.length < 5) {
    digits = '0' + digits;
  }
  return 'FV' + year + '-' + digits;
}

function parseHours(text) {
  // "1,5 h" -> 1.5
  return parseFloat(text.replace(',', '.'));
}

function priceWithoutVat(priceWithVat) {
  let net = priceWithVat / (1 + VAT_RATE / 100);
  return net.toFixed(2);
}

function linePrice(hourlyPrice, hoursText) {
  let hours = parseHours(hoursText);
  return hourlyPrice * hours;
}

function invoiceTotal(courtHours, lightsHours) {
  let total = linePrice(COURT_PRICE, courtHours);
  total = total + linePrice(LIGHTS_PRICE, lightsHours);
  return total;
}

function formatAmount(amount) {
  let text = amount.toFixed(2);
  text = text.replace('.', ',');
  return text + ' Kč';
}

function dueDate(issued) {
  let parts = issued.split('.');
  let day = Number(parts[0]);
  let month = Number(parts[1]);
  let year = Number(parts[2]);
  let date = new Date(year, month, day + DUE_DAYS);
  return date.getDate() + '. ' + (date.getMonth() + 1) + '. ' + date.getFullYear();
}

function cleanVariableSymbol(text) {
  return text.trim().replace(' ', '');
}

function isVariableSymbol(text) {
  return /\d{1,10}/.test(text);
}

function customerLine(name, email) {
  let at = email.indexOf('@');
  if (at) {
    return name + ' <' + email + '>';
  }
  return name;
}

function summary(courtHours, lightsHours, issued) {
  let total = invoiceTotal(courtHours, lightsHours);
  let result = 'Celkem: ' + formatAmount(total) + '\n';
  result = result + 'Bez DPH: ' + priceWithoutVat(total) + ' Kč\n';
  result = result + 'Splatnost: ' + dueDate(issued);
  return result;
}

function countDigits(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] >= '0' && text[i] <= '9') {
      count++;
    }
  }
  return count;
}

console.log(invoiceNumber(42, 2026));
console.log(summary('1,5 h', '2 h', '14.9.2026'));
console.log(cleanVariableSymbol(' 2026 0042 17 '), isVariableSymbol('VS: 12a'));
console.log(customerLine('Iva Malá', 'iva@luzanky.cz'), '|', customerLine('Iva Malá', 'bez-mailu'));
```

## --question--

Co vrátí `invoiceNumber(7, 2026)` z řádků 9–15?

### --expected--

FV2026-00007

### --accept--

'FV2026-00007'

### --why--

Cyklus `while` přidává zleva nulu, dokud číslo nemá pět znaků. Stejně by fungovalo `String(order).padStart(5, '0')`.

### --see--

js-retezce-cisla/retezce#upravy-trim-velikost-pismen-padstart-replaceall

## --question--

Faktura vystavená `14.9.2026` má splatnost `28. 10. 2026` místo `28. 9. 2026`. Na kterém řádku vzniká chyba?

### --answer--

Řádek 47, `Number(parts[1])` převede měsíc špatně.

#### --why--

`Number('9')` je správně `9`. Chyba je až v tom, jak s číslem měsíce zachází `Date`.

### --correct--

Řádek 49, `new Date(year, month, …)` dostane měsíc počítaný od jedničky.

#### --why--

`Date` čísluje měsíce od nuly, takže `9` je pro něj říjen. Oprava je `month - 1`, nebo `Temporal.PlainDate`, který měsíce počítá od jedničky.

### --answer--

Řádek 50, `date.getMonth() + 1` přičítá jedničku navíc.

#### --why--

`getMonth()` vrací měsíc od nuly, takže `+ 1` je na výpis správně. Datum už ale přišlo posunuté z dřívějšího řádku.

### --see--

js-retezce-cisla/intl-a-datum#mesice-od-nuly-a-pretekani

## --question--

Co vrátí `cleanVariableSymbol(' 2026 0042 17 ')` z řádku 54?

### --expected--

20260042 17

### --accept--

'20260042 17'

### --why--

`trim` odstraní mezery na krajích, ale `replace` s obyčejným textem nahradí jen první mezeru uvnitř. Druhá zůstane. Všechny mezery odstraní `replaceAll(' ', '')`.

### --see--

js-retezce-cisla/retezce#upravy-trim-velikost-pismen-padstart-replaceall

## --question--

Variabilní symbol má být 1 až 10 číslic a nic jiného. Pro které vstupy vrátí `isVariableSymbol` z řádku 58 `true`, přestože to platný symbol není? Vyber všechny.

### --correct--

`'VS: 12a'`

#### --why--

Výraz bez kotev hledá číslice kdekoli uvnitř textu, a `12` tam je.

### --correct--

`'12345678901'`

#### --why--

Jedenáct číslic obsahuje deset číslic za sebou, a to výrazu bez kotev stačí.

### --answer--

`'0042'`

#### --why--

Čtyři číslice jsou platný symbol, tady výraz odpovídá správně.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-cely-text-ne-kousek

## --question--

Co vrátí `customerLine('Iva Malá', 'bez-mailu')` z řádků 61–67?

### --expected--

Iva Malá <bez-mailu>

### --accept--

'Iva Malá <bez-mailu>'

### --why--

`indexOf('@')` vrátí `-1`, a `-1` je v podmínce pravda. Podmínka na řádku 63 proto projde i bez zavináče. Naopak e-mail začínající zavináčem (pozice `0`) by neprošel. Správně `email.includes('@')`.

### --see--

js-retezce-cisla/retezce#kousky-textu-at-slice-a-hledani
