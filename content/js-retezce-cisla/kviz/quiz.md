---
pass: 0.8
---

# --questions--

## --question--

Co vypíše následující kód? Napiš přesný text, který se zobrazí v konzoli.

```js
const price = 10.5;
console.log(price.toFixed(2) + 5);
```

### --expected--

10.505

### --accept--

'10.505'
"10.505"

### --why--

Metoda `toFixed(2)` zaokrouhlí číslo na dvě desetinná místa a výsledek vrátí jako řetězec (`'10.50'`), nikoli jako číslo. Operátor `+` s řetězcem provede textové spojení (konkatenaci) místo matematického sčítání, takže vznikne `'10.505'`. S výsledkem z `toFixed` se už nemá dále počítat.

### --see--

js-retezce-cisla/cisla#tofixed-vraci-retezec

## --question--

Co vypíše následující kód? Napiš pouze výsledné číslo.

```js
const symbol = '👋';
console.log(symbol.length);
```

### --expected--

2

### --why--

Vlastnost `length` v JavaScriptu nepočítá viditelné znaky (grafémy), ale počet 16bitových kódových jednotek (code units) v kódování UTF-16. Většina běžných emoji leží mimo základní rovinu Unicode (BMP) a skládá se ze dvou kódových jednotek (tzv. náhradního páru / surrogate pair).

### --see--

js-retezce-cisla/retezce#unicode-diakritika-a-emoji

## --question--

Co vypíše následující kód při hledání značek v textu?

```js
const html = '<b>rychle</b> a <b>zběsile</b>';
const match = html.match(/<b>.*<\/b>/);
console.log(match[0]);
```

### --correct--

`<b>rychle</b> a <b>zběsile</b>`

#### --why--

Kvantifikátor `*` je ve výchozím stavu hladový (greedy), takže zabere co nejdelší možný podřetězec od prvního `<b>` až po úplně poslední `</b>`.

### --answer--

`<b>rychle</b>`

#### --why--

Takový výsledek by vrátil líný kvantifikátor `.*?`. Bez otazníku je kvantifikátor hladový a nezastaví se u prvního konce značky.

### --answer--

`null`

#### --why--

Regulární výraz značky `<b>` i text mezi nimi v řetězci bez potíží najde, `match` tedy `null` nevrátí.

### --see--

js-retezce-cisla/regularni-vyrazy#kvantifikatory-hladove-vs-line

## --question--

Co vypíše následující kód? Napiš pouze číslo.

```js
const date = new Date(2026, 0, 15);
console.log(date.getMonth());
```

### --expected--

0

### --why--

V konstruktoru `Date` i v metodě `getMonth()` se měsíce v JavaScriptu číslují od nuly: `0` představuje leden, `1` únor a `11` prosinec. Dny v měsíci se naproti tomu číslují běžně od 1.

### --see--

js-retezce-cisla/intl-a-datum#pasti-date

## --question--

V aplikaci potřebuješ uložit a zobrazit datum narození uživatele (např. 12. 4. 1998). Čas ani časová zóna tě nezajímají. Které moderní API je pro tento účel navržené a netrpí nechtěnými posuny kvůli časovým pásmům?

### --correct--

`Temporal.PlainDate`

#### --why--

`Temporal.PlainDate` reprezentuje čisté kalendářní datum bez času a bez časové zóny, takže nehrozí nechtěný posun data při zobrazení uživateli v jiném časovém pásmu.

### --answer--

`new Date().toISOString()`

#### --why--

Objekt `Date` vnitřně vždy obsahuje čas i časové pásmo. Při převodu do formátu UTC (ISO) se datum narození může posunout o den dozadu nebo dopředu podle lokálního časového posunu.

### --answer--

`Intl.RelativeTimeFormat`

#### --why--

`Intl.RelativeTimeFormat` slouží k formátování relativního času (např. „před 3 dny"), nikoli k reprezentaci konkrétního kalendářního data.

### --see--

js-retezce-cisla/intl-a-datum#temporal

## --question--

Co vypíše následující kód v konzoli? Napiš obě hodnoty přesně tak, jak se vypíšou, oddělené mezerou.

```js
console.log(typeof null, typeof undefined);
```

### --expected--

object undefined

### --why--

`typeof null` vrací `'object'` kvůli historické chybě v první verzi JavaScriptu z roku 1995, kterou nebylo možné opravit bez rozbití existujících stránek. Naproti tomu `typeof undefined` vrací standardní řetězec `'undefined'`.

### --see--

js-retezce-cisla/cisla

## --question--

Co vypíše následující porovnání v konzoli?

```js
console.log('' == 0, '' === 0);
```

### --correct--

`true false`

#### --why--

Volné porovnání `==` provede automatickou typovou konverzi, při které prázdný řetězec `''` převede na číslo `0` (`0 == 0` je `true`). Striktní porovnání `===` typy nepřevádí a string se číslu nerovná.

### --answer--

`false false`

#### --why--

Při striktním porovnání `===` je výsledek skutečně `false`, ale volné porovnání `==` prázdný text na nulu převede.

### --answer--

`true true`

#### --why--

Striktní porovnání `===` vyžaduje shodný datový typ. Řetězec a číslo se při striktním porovnání nikdy nerovnají.

### --see--

js-retezce-cisla/cisla

## --question--

Co vypíše následující kód? Napiš přesný text, který se zobrazí v konzoli.

```js
const text = 'Žluťoučký';
const clean = text.normalize('NFD').replace(/\p{M}/gu, '');
console.log(clean);
```

### --expected--

Zlutoucky

### --accept--

'Zlutoucky'
"Zlutoucky"

### --why--

Metoda `normalize('NFD')` rozloží znaky s diakritikou na základní písmena a samostatné diakritické značky (kombinační značky). Regulární výraz `\p{M}` tyto značky v celém textu najde a `replace` je smaže, takže zůstane text bez diakritiky.

### --see--

js-retezce-cisla/retezce#diakritika-a-normalize

# --code-- Správa objednávek v e-shopu

## --file-- order-processor.js

```js
// Správa a formátování objednávek v e-shopu
function parsePriceToCents(priceText) {
  // Ošetření české desetinné čárky a převod na haléře
  const normalized = priceText.trim().replace(',', '.');
  const price = Number(normalized);
  if (Number.isNaN(price) || price < 0) {
    return null;
  }
  return Math.round(price * 100);
}

function createProductSlug(title) {
  return title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isValidPostalCode(code) {
  // České PSČ: 5 číslic (může mít uprostřed mezeru)
  const pattern = /^\d{3}\s?\d{2}$/;
  return pattern.test(code.trim());
}

function createDeliveryDate(year, month, day) {
  // Pozor na indexování měsíců v Date
  return new Date(year, month - 1, day);
}

function applyDiscount(order, discountPercent) {
  const factor = (100 - discountPercent) / 100;
  order.totalCents = Math.round(order.totalCents * factor);
  return order;
}

const originalOrder = {
  id: 101,
  customer: 'Jan Novák',
  totalCents: 50000,
};

const discountedOrder = applyDiscount(originalOrder, 10);
console.log(originalOrder.totalCents, originalOrder === discountedOrder);

const rawPrice = ' 129,50 ';
console.log(parsePriceToCents(rawPrice));

const delivery = createDeliveryDate(2026, 2, 29);
console.log(delivery.getMonth());

const slug = createProductSlug('Dětské tričko 👕');
console.log(slug);
```

## --question--

Co vypíše řádek 46? Napiš obě hodnoty oddělené mezerou.

### --expected--

45000 true

### --why--

Objekty se v JavaScriptu předávají referencí. Funkce `applyDiscount` nevytváří nový objekt, ale přímo mění vlastnost `totalCents` předaného objektu `originalOrder` a vrátí odkaz na něj. Původní objednávka má po slevě 45 000 haléřů a obě proměnné ukazují na tentýž objekt v paměti (`true`).

### --see--

js-retezce-cisla/cisla

## --question--

Co vypíše řádek 49? Napiš pouze výsledné číslo.

### --expected--

12950

### --why--

Metoda `trim()` odstraní mezery, `replace(',', '.')` nahradí českou čárku tečkou a `Number('129.50')` vrátí číslo `129.5`. Vynásobením stem a zaokrouhlením přes `Math.round` získáme částku v haléřích jako celé číslo `12950`.

### --see--

js-retezce-cisla/cisla#pocitani-v-halerich

## --question--

Funkce `isValidPostalCode` na řádku 22 používá regulární výraz `/^\d{3}\s?\d{2}$/`. Proč jsou v něm kotvy `^` a `$` nezbytné?

### --correct--

Bez kotev by výraz prošel i pro text s dalšími znaky nebo číslicemi navíc (např. `'123456'` nebo `'Praha 11000'`), protože by v něm našel vyhovující podřetězec.

#### --why--

Kotva `^` vynucuje shodu od samého začátku řetězce a `$` na samém konci. Bez nich metoda `test()` hledá vzor kdekoli uvnitř textu.

### --answer--

Bez kotev by regulární výraz vyhodil syntaktickou chybu při zavolání `test()`.

#### --why--

Kotvy jsou volitelné značky vzoru; regulární výraz bez nich je plně platný.

### --answer--

Kotvy zajišťují, že regulární výraz ignoruje velikost písmen.

#### --why--

Ignorování velikosti písmen dělá příznak `i` na konci výrazu, nikoli kotvy `^` a `$`.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-skupiny

## --question--

Co vypíše řádek 52 (`console.log(delivery.getMonth());`), když rok 2026 není přestupný rok?

### --correct--

`2`

#### --why--

Funkce `createDeliveryDate(2026, 2, 29)` volá `new Date(2026, 1, 29)`. Únor (měsíc 1) má v nepřestupném roce 2026 jen 28 dní. Konstruktor `Date` nepovolený den automaticky posune o den dopředu na 1. března. Březen má index `2`.

### --answer--

`1`

#### --why--

Objekt `Date` neplatný 29. únor neudrží — přebytečný den automaticky přeteče do následujícího měsíce.

### --answer--

`NaN`

#### --why--

Konstruktor `Date` při neplatném dni nevyhodí chybu ani nevrátí `NaN`, ale datum tiše opraví (autocorrection) přetečením do dalšího měsíce.

### --see--

js-retezce-cisla/intl-a-datum#pasti-date
