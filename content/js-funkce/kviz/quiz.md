---
pass: 0.8
---

# --questions--

## --question--

Co vypíše tenhle kód?

```js
const discount = 50;

function finalPrice(price) {
  if (price > 1000) {
    return price - discount;
  }
  const discount = 100;
  return price - discount;
}

try {
  console.log(finalPrice(2000));
} catch (error) {
  console.log(error.name);
}
```

### --expected--

ReferenceError

### --why--

Myslíš si, že větev `if` použije globální `discount = 50`? Funkce má vlastní `const discount`, a ta platí pro celé tělo funkce — od jeho začátku až po řádek deklarace je v TDZ. Hledání zevnitř ven se zastaví u ní, ne u globální proměnné, a čtení v TDZ skončí `ReferenceError: Cannot access 'discount' before initialization`.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --question--

Které volání na prvním řádku souboru proběhne bez chyby? Funkce jsou v souboru napsané až pod ním.

```js
// sem přijde volání

function formatCzk(amount) {
  return `${amount} Kč`;
}

const formatEur = (amount) => `${amount} €`;

const formatUsd = function (amount) {
  return `$${amount}`;
};
```

### --correct--

`formatCzk(100)`

#### --why--

Deklarace funkce je díky hoistingu připravená i s tělem od začátku skriptu, takže jde zavolat nad svým řádkem.

### --answer--

`formatEur(100)`

#### --why--

Šipková funkce je uložená v `const`, a ta je až do svého řádku v TDZ. Na tom, že je v ní funkce, nezáleží.

### --answer--

`formatUsd(100)`

#### --why--

Funkční výraz v `const` se chová jako každá `const`: nad řádkem deklarace ho číst nejde.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --question--

Co vypíše poslední řádek?

```js
const total = (a, b) => { a + b; };

console.log(total(2, 3) ?? 'nic');
```

### --expected--

nic

### --why--

Za šipkou jsou složené závorky, takže jde o tělo funkce a v něm chybí `return`. Funkce vrátí `undefined` a `??` pak vybere pravou stranu. Bez složených závorek, `(a, b) => a + b`, by se vypsalo `5`.

### --see--

js-funkce/funkce#vyraz-a-sipkova-funkce

## --question--

Co vypíše poslední řádek?

```js
function quantityLabel(count = 1) {
  return `${count} ks`;
}

console.log(quantityLabel(0), quantityLabel());
```

### --expected--

0 ks 1 ks

### --why--

Výchozí hodnota se použije jen tehdy, když argument chybí nebo je `undefined`. Nula je předaná hodnota, i když je nepravdivá, takže první volání vrátí `0 ks`. Se zápisem `count || 1` uvnitř funkce by obě volání vrátila `1 ks`.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --question--

Co vrátí `readFlag()`?

```js
function readFlag() {
  if (true) {
    var flag = 'hotovo';
  }
  return flag;
}
```

### --answer--

`undefined`, protože `flag` zanikne na konci bloku `if`.

#### --why--

Tak by se chovala `let` nebo `const`. Rozsah platnosti `var` ale bloky neřeší.

### --correct--

`'hotovo'`

#### --why--

`var` má rozsah celé funkce, ne bloku. `flag` proto existuje i za uzavírací závorkou `if` a má hodnotu `'hotovo'`.

### --answer--

`ReferenceError`, protože `flag` je deklarovaná v jiném bloku.

#### --why--

`ReferenceError` by vznikl s `let` nebo `const`. Deklarace přes `var` platí pro celou funkci.

### --see--

js-funkce/scope-a-hoisting#blokovy-rozsah-let-a-const-vs-var

## --question--

Co vypíše poslední řádek?

```js
function applyToBoth(a, b, action) {
  return action(a) + action(b);
}

console.log(applyToBoth(2, 3, (n) => n * 10));
```

### --expected--

50

### --why--

`applyToBoth` zavolá callback dvakrát, jednou s `2` a jednou s `3`, a výsledky sečte: `20 + 30`. S jakými argumenty se callback zavolá, rozhoduje funkce, která ho dostala.

### --see--

js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny

## --question--

Kolega chce po 3 sekundách zavolat `notify()` a napsal:

```js
setTimeout(() => notify, 3000);
```

Co se stane?

### --answer--

`notify` se zavolá hned a po 3 sekundách se nestane nic.

#### --why--

Hned by se `notify` zavolala se závorkami přímo v argumentu: `setTimeout(notify(), 3000)`. Tady je v argumentu šipková funkce, která se sama zavolá až po 3 sekundách. Co udělá, když se spustí?

### --correct--

Po 3 sekundách se spustí šipková funkce, ta `notify` jen vrátí a nezavolá ji.

#### --why--

Šipka `() => notify` vrací funkci `notify` jako hodnotu. Aby ji zavolala, musí mít závorky: `() => notify()`, nebo rovnou `setTimeout(notify, 3000)`.

### --answer--

Program spadne s `TypeError`, protože `setTimeout` čeká funkci.

#### --why--

`setTimeout` funkci dostal — šipkovou. Chybu nevyhodí nic, a právě proto je chyba zrádná.

### --see--

js-funkce/funkce-jako-hodnoty#fn-vs-fn-predat-nebo-zavolat

## --question--

Co vypíše poslední řádek?

```js
function describe(first, ...others) {
  return `${first}:${others.length}`;
}

console.log(describe('a'), describe('a', 'b', 'c'));
```

### --expected--

a:0 a:2

### --why--

První argument vždy dostane `first`, zbytkový parametr sebere jen ty zbylé. Bez dalších argumentů je to prázdné pole s délkou `0`, ne `undefined`.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --question--

V anglické dokumentaci MDN otevři stránku **Default parameters** a najdi část *Evaluated at call time*. Kdy se vyhodnotí výchozí hodnota parametru, třeba `function log(message, at = Date.now())`?

### --answer--

Jednou, když JavaScript deklaraci funkce načte; všechna volání pak sdílejí stejnou hodnotu.

#### --why--

Takhle to funguje v některých jiných jazycích a MDN na to v té části výslovně upozorňuje. Přečti si první větu části *Evaluated at call time*.

### --correct--

Při každém volání, ve kterém argument chybí, znovu.

#### --why--

MDN: „The default argument is evaluated at call time". Každé volání bez argumentu proto spočítá `Date.now()` znovu a výchozí `[]` vytvoří pokaždé nové pole.

### --answer--

Jen při prvním volání funkce, pak si ji funkce pamatuje.

#### --why--

Funkce si výchozí hodnotu mezi voláními nepamatuje. Co přesně píše MDN, najdeš v části *Evaluated at call time*.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --question--

Co vypíše poslední řádek?

```js
function deliveryDays(method) {
  let days = 5;
  switch (method) {
    case 'express':
      days = 1;
    case 'zasilkovna':
      days = 3;
  }
  return days;
}

console.log(deliveryDays('express'));
```

### --expected--

3

### --why--

Myslíš si, že `switch` po shodě provede jen svůj `case`? Bez `break` (nebo `return`) pokračuje dalším `case` — propadne. Po `days = 1` se proto provede i `days = 3`. Ve funkci jde propadání zabránit i tak, že každá větev rovnou vrátí: `case 'express': return 1;`.

### --see--

js-zaklady/porovnani-a-logika#zapomenuty-break

## --question--

Co vypíše tenhle kód?

```js
const price = (19.9).toFixed(2);

console.log(price + 1);
```

### --expected--

19.901

### --why--

`toFixed` vrací text `'19.90'`, ne číslo. `+` s textem pak spojuje, takže vznikne `'19.901'`. Na počítání se zaokrouhlí jinak, třeba `Math.round(19.9 * 100) / 100`, a `toFixed` se nechá až na zobrazení.

### --see--

js-retezce-cisla/cisla#tofixed-vraci-retezec

## --question--

Kolikrát se zvýší `sent`?

```js
let sent = 0;

for (let day = 1; day < 5; day++) {
  sent++;
}

console.log(sent);
```

### --expected--

4

### --why--

Cyklus běží pro `day` 1, 2, 3 a 4. Při `day = 5` podmínka `day < 5` už neplatí. Pět průchodů by dalo `day <= 5` nebo start od nuly.

### --see--

js-zaklady/cykly#kolikrat-cyklus-probehne

## --question--

Co vypíše poslední řádek?

```js
const name = 'eva';

name.toUpperCase();

console.log(name);
```

### --expected--

eva

### --why--

Řetězec se nedá změnit. `toUpperCase` vrátí **nový** text `'EVA'`, ale ten se tu zahodí. Kdo chce velká písmena, musí výsledek uložit: `const upper = name.toUpperCase();`. Stejně jako u funkce bez `return` tu vznikne hodnota, se kterou nikdo nic neudělá.

### --see--

js-retezce-cisla/retezce#retezec-se-neda-zmenit

# --code-- Rezervace lekcí ve fitku

## --file-- rezervace.js

```js
// Rezervace skupinových lekcí ve fitku (starší kód, psaný jiným stylem).
var capacity = 12;
var reserved = 0;
var studioName = 'Fitko Na Kopci';

console.log(welcome('Jana'));

function welcome(name) {
  return 'Vítej v ' + studioName + ', ' + name + '!';
}

var freeSpots = function () {
  return capacity - reserved;
};

function reserve(count) {
  if (count <= 0) {
    return 'Neplatný počet';
  }
  if (count > freeSpots()) {
    return 'Plno';
  }
  var reserved = reserved + count;
  return 'Rezervováno: ' + count;
}

function priceFor(count, isMember) {
  var price = 150;
  if (isMember) {
    var price = 110;
  }
  return count * price;
}

function lessonLabel(title, trainer) {
  if (trainer === undefined) {
    trainer = 'bude upřesněn';
  }
  'Lekce ' + title + ' — trenér ' + trainer;
}

function reservationSummary(count, isMember) {
  var status = reserve(count);
  for (var i = 0; i < count; i++) {
    var ticket = 'vstupenka ' + (i + 1);
  }
  return status + ', poslední ' + ticket + ', cena ' + priceFor(count, isMember) + ' Kč';
}

console.log(reserve(3));
console.log(freeSpots());
console.log(priceFor(2, true));
console.log(lessonLabel('Jóga', 'Petra'));
console.log(reservationSummary(2, false));
```

## --question--

Řádek 6 volá `welcome` dřív, než je funkce na řádku 8 napsaná. Co vypíše?

### --expected--

Vítej v Fitko Na Kopci, Jana!

### --why--

Deklarace `welcome` je díky hoistingu k dispozici od začátku skriptu. `studioName` je na řádku 4 už přiřazená, takže se dosadí celý název. Kdyby byl řádek 6 nad řádkem 4, `var studioName` by měla hodnotu `undefined`.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --question--

Řádek 50 zavolá `reserve(3)` a vypíše `Rezervováno: 3`. Co pak vypíše řádek 51?

### --expected--

12

### --why--

Řádek 23 deklaruje uvnitř `reserve` vlastní `var reserved`, která stíní globální proměnnou z řádku 3. Kvůli hoistingu má lokální `reserved` na začátku hodnotu `undefined`, takže `undefined + 3` je `NaN` a globální `reserved` zůstane `0`. `freeSpots` na řádku 13 čte globální proměnnou a vrátí `12`.

### --see--

js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku

## --question--

Co vypíše řádek 52?

### --expected--

220

### --why--

`var price` na řádku 30 nevytvoří novou proměnnou v bloku `if`, protože `var` má rozsah celé funkce — jde o tutéž `price` z řádku 28 a přepíše ji na `110`. `2 * 110` je `220`. Kdyby na obou řádcích bylo `let`, vnitřní `price` by vnější jen zastínila a výsledek by byl `300`.

### --see--

js-funkce/scope-a-hoisting#blokovy-rozsah-let-a-const-vs-var

## --question--

Co vypíše řádek 53?

### --answer--

`Lekce Jóga — trenér Petra`

#### --why--

Text se na řádku 39 opravdu složí. Podívej se, jestli ho funkce `lessonLabel` také pošle ven.

### --correct--

`undefined`

#### --why--

Řádek 39 výraz spočítá a zahodí, protože před ním chybí `return`. Funkce bez `return` vrací `undefined`.

### --answer--

`Lekce Jóga — trenér bude upřesněn`

#### --why--

Náhradní trenér se použije jen pro chybějící argument (řádek 36). Tady `'Petra'` přišla.

### --see--

js-funkce/funkce#chybejici-return

## --question--

Kolega přesune `console.log(freeSpots())` na řádek 6, tedy nad řádek 12. Co se stane?

### --answer--

Vypíše se `12`, `var` se hoistuje i s funkcí.

#### --why--

Hoistuje se jen deklarace `var freeSpots`, ne přiřazení funkce z řádku 12. Jakou hodnotu má `var` před svým řádkem?

### --correct--

Program spadne s `TypeError: freeSpots is not a function`.

#### --why--

Na řádku 6 má `var freeSpots` hodnotu `undefined` a zavolat `undefined` nejde. S `const` by hláška byla `ReferenceError: Cannot access 'freeSpots' before initialization`; jen deklarace `function freeSpots()` by fungovala.

### --answer--

Program spadne s `ReferenceError: freeSpots is not defined`.

#### --why--

`ReferenceError … is not defined` vzniká pro jméno, které vůbec neexistuje. `var freeSpots` díky hoistingu existuje od začátku skriptu, jen s jinou hodnotou.

### --see--

js-funkce/scope-a-hoisting#volani-sipky-pred-jejim-zapisem
