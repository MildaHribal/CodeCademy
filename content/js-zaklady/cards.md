## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
const ageInput = '17';
console.log(ageInput + 1, ageInput - 1);
```

### --expected--

171 16

### --why--

Myslíš si, že `+` a `-` se k textu chovají stejně? `+` s textem na jedné straně spojuje (`'171'`), ostatní aritmetické operátory text převedou na číslo (`16`).

### --see--

js-zaklady/promenne-a-typy#text-a-cislo-operator-a-prevod-typu

## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
console.log(1 + 2 + '3', '1' + 2 + 3);
```

### --expected--

33 123

### --why--

`+` se vyhodnocuje zleva. V prvním výrazu se nejdřív sečtou čísla `1 + 2 = 3` a teprve pak se připojí text. Ve druhém je text hned na začátku, takže se spojuje od prvního kroku.

### --see--

js-zaklady/promenne-a-typy#text-a-cislo-operator-a-prevod-typu

## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
let coupon;
console.log(typeof coupon, typeof null);
```

### --expected--

undefined object

### --why--

Proměnná bez přiřazené hodnoty má `undefined` a `typeof` vrátí `'undefined'`. `typeof null` je `'object'` — historická chyba jazyka. Na `null` se proto ptej přímo: `value === null`.

### --see--

js-zaklady/promenne-a-typy#vyjimky-typeof

## --card-- output

Co vypíše tenhle kód?

```js
console.log(total);
var total = 250;
```

### --expected--

undefined

### --why--

Proměnná z `var` existuje od začátku programu, jen hodnotu dostane až na svém řádku. S `let` nebo `const` by program spadl s `ReferenceError` přímo na místě chyby — proto `var` nepíšeme.

### --see--

js-zaklady/promenne-a-typy#proc-ne-var

## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
console.log(Math.ceil(12.01), Math.floor(12.99));
```

### --expected--

13 12

### --why--

`Math.ceil` zaokrouhluje vždy nahoru a `Math.floor` vždy dolů, bez ohledu na to, jak blízko je číslo dalšímu celému. K nejbližšímu zaokrouhluje `Math.round`.

### --see--

js-zaklady/promenne-a-typy#zaokrouhleni-math-round-math-ceil-math-floor

## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
console.log('' == 0, '' === 0);
```

### --expected--

true false

### --why--

`==` převede prázdný text na číslo `0`, takže porovnává `0 == 0`. `===` typy nepřevádí a text s číslem se nerovná nikdy.

### --see--

js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna

## --card-- output

Co vypíše tenhle kód? Napiš tři hodnoty oddělené mezerou.

```js
console.log(Boolean(''), Boolean('0'), Boolean(-5));
```

### --expected--

false true true

### --why--

Falsy je jen prázdný text, ne text s nulou. Z čísel je falsy jen `0` (a `NaN`), záporná čísla jsou truthy.

### --see--

js-zaklady/porovnani-a-logika#truthy-a-falsy

## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
const discount = 0;
console.log(discount || 15, discount ?? 15);
```

### --expected--

15 0

### --why--

`||` nahradí každou falsy hodnotu, tedy i nulu. `??` nahradí jen `null` a `undefined`, takže nula zůstane.

### --see--

js-zaklady/porovnani-a-logika#vychozi-hodnota-misto

## --card-- output

Co vypíše tenhle kód? Každý výpis na vlastní řádek.

```js
let role = 'host';
if (role = 'admin') {
  console.log('Vítej, správce');
}
console.log(role);
```

### --expected--

```text
Vítej, správce
admin
```

### --why--

Jedno `=` v podmínce přiřazuje: do `role` uloží `'admin'` a výsledkem je neprázdný text, tedy truthy. Podmínka platí vždy a proměnná se navíc přepíše. V podmínce patří `===`.

### --see--

js-zaklady/porovnani-a-logika#misto-v-podmince

## --card-- output

Co vypíše tenhle kód? Každý výpis na vlastní řádek.

```js
const day = 6;
switch (day) {
  case 6:
    console.log('sobota');
  case 7:
    console.log('víkend');
    break;
  default:
    console.log('všední den');
}
```

### --expected--

```text
sobota
víkend
```

### --why--

Za `case 6` chybí `break`, a tak `switch` propadne do `case 7` a zastaví se až na `break` za výpisem `víkend`.

### --see--

js-zaklady/porovnani-a-logika#zapomenuty-break

## --card-- output

Co vypíše tenhle kód?

```js
let passes = 0;
for (let i = 0; i <= 10; i += 2) {
  passes++;
}
console.log(passes);
```

### --expected--

6

### --why--

`i` nabude hodnot 0, 2, 4, 6, 8 a 10 — desítka podmínku `<= 10` ještě splní. Šest průchodů, ne pět.

### --see--

js-zaklady/cykly#kolikrat-cyklus-probehne

## --card-- output

Co vypíše tenhle kód?

```js
let stock = 3;
while (stock > 0) {
  stock -= 2;
}
console.log(stock);
```

### --expected--

-1

### --why--

Podmínka se kontroluje před každým průchodem: 3 → 1 → −1. U `1` podmínka ještě platí, tělo odečte dva a teprve pak cyklus skončí. `while` se nezastaví přesně na hranici, ale až když podmínka přestane platit.

### --see--

js-zaklady/cykly#while-a-do-while

## --card-- output

Co vypíše tenhle kód?

```js
let result = '';
for (let i = 3; i > 0; i--) {
  result += i;
}
console.log(result);
```

### --expected--

321

### --why--

`result` začíná jako prázdný text, a tak `+=` čísla nesčítá, ale připojuje za sebe: `'3'`, `'32'`, `'321'`. Kdyby začínal `0`, vyšlo by `6`.

### --see--

js-zaklady/cykly#cyklus-for

## --card-- output

Jaký druh chyby ohlásí konzole, když spustíš tyhle dva řádky? Napiš jen jméno chyby.

`const discount = 10;`
`discount();`

### --expected--

TypeError

### --why--

Zápis je platný, takže to není `SyntaxError`, a jméno `discount` existuje, takže ani `ReferenceError`. Číslo ale nejde zavolat jako funkci: `TypeError: discount is not a function`. S hodnotou chceš dělat, co její typ neumí.

### --see--

js-zaklady/cteni-chyb-a-debugger#tri-druhy-chyb

## --card-- output

Na kterém řádku souboru `script.js` je překlep ve jménu proměnné? Napiš jen číslo.

```text
Uncaught ReferenceError: totl is not defined
    at printSummary (script.js:14:9)
    at script.js:30:1
```

### --expected--

14

### --why--

Horní řádek stack trace je místo, kde program spadl: uvnitř `printSummary` na řádku 14 se čte neexistující jméno `totl`. Řádek 30 je jen místo, odkud se `printSummary` zavolala — tam žádný překlep není.

### --see--

js-zaklady/cteni-chyb-a-debugger#jak-cist-hlasku-a-stack-trace

## --card-- code js

Napiš funkci `isWeekend(day)`, která pro číslo dne v týdnu (1 = pondělí, 7 = neděle) vrátí `true` pro sobotu a neděli, jinak `false`.

### --seed--

```js
function isWeekend(day) {
}
```

### --test--

```js
assert.equal(isWeekend(6), true, 'isWeekend(6) má vrátit true — sobota');
assert.equal(isWeekend(7), true, 'isWeekend(7) má vrátit true — neděle');
assert.equal(isWeekend(1), false, 'isWeekend(1) má vrátit false — pondělí');
assert.equal(isWeekend(5), false, 'isWeekend(5) má vrátit false — pátek');
```

### --solution--

```js
function isWeekend(day) {
  return day === 6 || day === 7;
}
```

### --see--

js-zaklady/porovnani-a-logika#skladani-podminek-a

## --card-- code js

Napiš funkci `shippingFee(cartTotal)`: doprava je zdarma **od 1 500 Kč** včetně, jinak stojí 89 Kč.

### --seed--

```js
function shippingFee(cartTotal) {
}
```

### --test--

```js
assert.equal(shippingFee(1500), 0, 'shippingFee(1500) má vrátit 0 — hranice 1 500 Kč patří k dopravě zdarma');
assert.equal(shippingFee(2400), 0, 'shippingFee(2400) má vrátit 0');
assert.equal(shippingFee(1499), 89, 'shippingFee(1499) má vrátit 89');
assert.equal(shippingFee(0), 89, 'shippingFee(0) má vrátit 89');
```

### --solution--

```js
function shippingFee(cartTotal) {
  return cartTotal >= 1500 ? 0 : 89;
}
```

### --see--

js-zaklady/porovnani-a-logika#hranice-misto

## --card-- code js

Napiš funkci `countLetter(text, letter)`, která vrátí, kolikrát se znak `letter` v textu `text` vyskytuje.

### --seed--

```js
function countLetter(text, letter) {
}
```

### --test--

```js
assert.equal(countLetter('Mississippi', 's'), 4, "countLetter('Mississippi', 's') má vrátit 4");
assert.equal(countLetter('kolo', 'o'), 2, "countLetter('kolo', 'o') má vrátit 2");
assert.equal(countLetter('Brno', 'x'), 0, "countLetter('Brno', 'x') má vrátit 0");
assert.equal(countLetter('', 'a'), 0, "countLetter('', 'a') má vrátit 0 — prázdný text");
```

### --solution--

```js
function countLetter(text, letter) {
  let count = 0;
  for (const char of text) {
    if (char === letter) {
      count++;
    }
  }
  return count;
}
```

### --see--

js-zaklady/cykly#for-of-prochazi-text-znak-po-znaku

## --card-- code js

Napiš funkci `sumTo(n)`, která vrátí součet všech celých čísel od 1 do `n` včetně. Pro `n` menší než 1 vrátí `0`.

### --seed--

```js
function sumTo(n) {
}
```

### --test--

```js
assert.equal(sumTo(4), 10, 'sumTo(4) má vrátit 10 (1 + 2 + 3 + 4)');
assert.equal(sumTo(1), 1, 'sumTo(1) má vrátit 1');
assert.equal(sumTo(100), 5050, 'sumTo(100) má vrátit 5050');
assert.equal(sumTo(0), 0, 'sumTo(0) má vrátit 0');
```

### --solution--

```js
function sumTo(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
```

### --see--

js-zaklady/cykly#cyklus-for

## --card-- free

Jaký je rozdíl mezi `==` a `===` a proč v kódu píšeš `===`?

### --back--

`===` porovná hodnotu i typ, takže text `'10'` a číslo `10` se nerovnají. `==` před porovnáním potichu převádí typy podle složitých pravidel: `'' == 0` i `'0' == false` jsou `true`. Takový převod schová, že porovnávám hodnoty různých typů, třeba text z formuláře s číslem. Proto píšu `===` a `!==`, a když typy opravdu liší, převedu hodnotu sám přes `Number()`.

### --see--

js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna

## --card-- free

Co znamená truthy a falsy? Které hodnoty jsou falsy?

### --back--

Podmínka nepřijímá jen `true` a `false`: každou hodnotu převede na pravdu, nebo nepravdu. Falsy hodnot je pár — `false`, `0`, `-0`, `0n`, prázdný text `''`, `null`, `undefined` a `NaN`. Všechno ostatní je truthy, i `'0'`, `'false'`, text s mezerou nebo záporné číslo. Na tom stojí zkrácené podmínky jako `if (name)`, ale i chyby, kdy platná nula spadne do větve „nic není".

### --see--

js-zaklady/porovnani-a-logika#truthy-a-falsy

## --card-- free

Kdy použiješ `??` a kdy `||`?

### --back--

Oba vracejí jednu ze svých stran. `a || b` vrátí `b`, kdykoli je `a` falsy — tedy i pro `0`, `''` a `false`. `a ?? b` vrátí `b` jen pro `null` a `undefined`. Na výchozí hodnotu, kde je nula nebo prázdný text platný údaj (počet kusů, hlasitost, spropitné), proto patří `??`. `||` se hodí, když chci nahradit opravdu každou prázdnou hodnotu, třeba prázdný text slova.

### --see--

js-zaklady/porovnani-a-logika#vychozi-hodnota-misto

## --card-- free

Jaký je rozdíl mezi `const` a `let` a proč se nepíše `var`?

### --back--

`const` sváže jméno s hodnotou natrvalo, nové přiřazení skončí `TypeError: Assignment to constant variable.`. Do `let` smím přiřazovat znovu, hodí se pro počítadla a průběžné součty. Začínám vždycky s `const` a na `let` přejdu, jen když hodnotu opravdu měním. `var` jde přečíst ještě před svým řádkem (vrátí `undefined`) a stejné jméno jde deklarovat dvakrát, takže chyby se neohlásí tam, kde vznikly.

### --see--

js-zaklady/promenne-a-typy#const-a-let

## --card-- free

Jaký je rozdíl mezi `undefined` a `null`?

### --back--

Obě znamenají „hodnota tu není", ale z jiného důvodu. `undefined` dá JavaScript sám: proměnná bez přiřazení, funkce bez `return`, neexistující vlastnost. `null` napíše programátor, když chce říct „záměrně prázdné", třeba „student písemku nepsal". Díky tomu je `undefined` v programu často stopa k chybě. Pozor na `typeof null`, který vrací `'object'`; na `null` se ptám přímo přes `=== null`.

### --see--

js-zaklady/promenne-a-typy#undefined-a-null

## --card-- free

Program spadl s chybou. Jak postupuješ?

### --back--

Přečtu hlášku celou: druh chyby (`SyntaxError`, `ReferenceError`, `TypeError`), co se stalo a soubor s řádkem. Stack trace čtu shora, nahoře je místo pádu a pod ním, odkud se funkce volala. Když je víc hlášek, začnu první. Když příčina na řádku není vidět (třeba `undefined` přišlo odjinud), zastavím program breakpointem nebo `debugger;` o kus dřív a krokuji Step over, dokud hodnota v panelu Scope neuhne od toho, co čekám.

### --see--

js-zaklady/cteni-chyb-a-debugger#jak-cist-hlasku-a-stack-trace

## --card-- free

Na pohovoru dostaneš úlohu, kterou jsi nikdy neřešil. Jak začneš?

### --back--

Nejdřív zadání řeknu vlastními slovy a pojmenuju vstup a výstup; nejasnosti se hned doptám. Pak ručně spočítám několik příkladů, i okrajových — nula, jednička, hranice. Postup rozepíšu v komentářích na malé kroky a jeden příklad jím projdu ručně. Teprve potom píšu kód po kouscích a zkouším ho na všech příkladech. Mluvím přitom nahlas, aby tazatel viděl, jak přemýšlím.

### --see--

js-zaklady/reseni-problemu#2-vymysli-priklady-i-ty-okrajove

## --card-- free

Kdy použiješ cyklus `for` a kdy `while`?

### --back--

`for` se hodí, když vím, kolikrát opakovat, nebo počítám od–do: start, podmínka i krok mám v jedné hlavičce. `while` volím, když dopředu nevím počet opakování, jen kdy přestat — třeba „opakuj, dokud úspory nedosáhnou cíle" nebo „dokud číslo není nula". U `while` musím krok napsat do těla sám, jinak vznikne nekonečná smyčka. Na znaky textu je nejkratší `for…of`.

### --see--

js-zaklady/cykly#while-a-do-while
