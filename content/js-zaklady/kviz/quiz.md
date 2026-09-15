---
pass: 0.8
---

# --questions--

## --question--

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
const bonusInput = '5';
let points = 10;
points += bonusInput;
console.log(points, typeof points);
```

### --expected--

105 string

### --accept--

'105' string
'105' 'string'

### --why--

Myslíš si, že `+=` vždycky sčítá? `points += bonusInput` je zkratka za `points = points + bonusInput` a `+` s textem na jedné straně spojuje. Z čísla `10` a textu `'5'` vznikne text `'105'`. Oprava je převést vstup hned: `points += Number(bonusInput)`.

### --see--

js-zaklady/promenne-a-typy#spojeni-misto-scitani

## --question--

Program spadl s hláškou `TypeError: Assignment to constant variable.`. Který kód ji způsobil?

### --answer--

```js
let total = 0;
total = total + 5;
```

#### --why--

Do `let` smíš přiřazovat, kolikrát chceš. Hláška mluví o jiném druhu deklarace.

### --correct--

```js
const limit = 10;
limit++;
```

#### --why--

`limit++` je přiřazení `limit = limit + 1` a `const` nové přiřazení nedovolí. Zápis je platný, proto to není `SyntaxError`, ale `TypeError` při provádění.

### --answer--

```js
const city = 'Brno';
console.log(city.length);
```

#### --why--

Čtení z konstanty je v pořádku, nic se do ní nepřiřazuje.

### --see--

js-zaklady/cteni-chyb-a-debugger#tri-druhy-chyb

## --question--

Jaký druh chyby tenhle kód vyhodí? Napiš jen jméno, třeba `SyntaxError`.

```js
const order = null;
console.log(order.total);
```

### --expected--

TypeError

### --why--

Proměnná `order` existuje, takže to není `ReferenceError`, a zápis je platný, takže ani `SyntaxError`. Z hodnoty `null` ale nejde číst vlastnost: `TypeError: Cannot read properties of null (reading 'total')`.

### --see--

js-zaklady/cteni-chyb-a-debugger#tri-druhy-chyb

## --question--

Chceš sledovat, jak se mění `total` po každém průchodu cyklem, a do kódu přitom nechceš nic psát. Co v DevTools uděláš?

### --answer--

Kliknu na číslo řádku za cyklem a pak dám Step out.

#### --why--

Za cyklem se program zastaví až po posledním průchodu, mezistavy neuvidíš. Step out navíc opouští funkci, ne cyklus.

### --correct--

Kliknu na číslo řádku v těle cyklu a po každém zastavení pokračuju tlačítkem Resume.

#### --why--

Breakpoint v těle cyklu zastaví program při každém průchodu a panel Scope ukáže aktuální `total`. Resume (F8) pustí program k dalšímu zastavení.

### --answer--

Otevřu panel Console a napíšu `total`.

#### --why--

Konzole ukáže hodnotu v okamžiku, kdy ji napíšeš — typicky až po doběhnutí programu, ne po jednotlivých průchodech.

### --see--

js-zaklady/cteni-chyb-a-debugger#debugger-zastav-program-a-podivej-se-dovnitr

## --question--

Co vypíše tenhle kód?

```js
let count = 0;
if ('0') count++;
if (0) count++;
if (' ') count++;
if (null) count++;
if ('false') count++;
console.log(count);
```

### --expected--

3

### --why--

Rozhoduje, jestli je hodnota falsy, ne co je v textu napsáno. Texty `'0'`, `' '` a `'false'` nejsou prázdné, takže jsou truthy. Falsy je z nich jen číslo `0` a `null`.

### --see--

js-zaklady/porovnani-a-logika#truthy-a-falsy

## --question--

Co vypíše tenhle kód? Napiš tři hodnoty oddělené mezerou.

```js
console.log(null == undefined, null === undefined, '1' == 1);
```

### --expected--

true false true

### --why--

Volná rovnost `==` před porovnáním převádí typy a má zvláštní pravidlo, že `null` a `undefined` se rovnají jen sobě navzájem. Přísná `===` porovná i typ, a `null` a `undefined` jsou různé typy. `'1' == 1` převede text na číslo, proto `true`.

### --see--

js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna

## --question--

Co vypíše tenhle kód?

```js
let attempts = 0;
do {
  attempts++;
} while (attempts > 3);
console.log(attempts);
```

### --expected--

1

### --why--

Myslíš si, že cyklus s neplatnou podmínkou neproběhne ani jednou? U `do…while` se podmínka kontroluje až **po** průchodu. Tělo zvýší `attempts` na `1`, pak se zkontroluje `1 > 3`, neplatí, a cyklus končí. Obyčejný `while` se stejnou podmínkou by vypsal `0`.

### --see--

js-zaklady/cykly#while-a-do-while

## --question--

Co vypíše tenhle kód? Napiš tři hodnoty oddělené mezerou.

```js
console.log(0 && 'Ano', '' || 'Host', null ?? 0);
```

### --expected--

0 Host 0

### --accept--

0 'Host' 0

### --why--

`&&` a `||` nevracejí `true`/`false`, ale jednu ze svých stran. `0 && 'Ano'` vrátí nulu, protože je falsy a dál se nevyhodnocuje. `'' || 'Host'` vrátí `'Host'`, protože prázdný text je falsy. `null ?? 0` vrátí pravou stranu, protože levá je `null`.

### --see--

js-zaklady/porovnani-a-logika#skladani-podminek-a

## --question--

Co vypíše tenhle kód?

```js
const size = 'M';
let price = 0;

switch (size) {
  case 'S':
    price = 100;
  case 'M':
    price = 150;
  case 'L':
    price = 200;
    break;
  default:
    price = 0;
}

console.log(price);
```

### --expected--

200

### --why--

`switch` skočí na `case 'M'` a nastaví `150`. Chybí ale `break`, a tak propadne do `case 'L'`, přepíše cenu na `200` a zastaví se až na `break`.

### --see--

js-zaklady/porovnani-a-logika#zapomenuty-break

## --question--

Kolikrát proběhne tělo tohohle cyklu? Napiš jen číslo.

```js
for (let seconds = 10; seconds > 0; seconds -= 3) {
  console.log('Zbývá', seconds);
}
```

### --expected--

4

### --why--

Cyklus jde po třech dolů: 10, 7, 4 a 1. Po jedničce je `seconds` rovno `-2`, podmínka `seconds > 0` neplatí a cyklus končí.

### --see--

js-zaklady/cykly#kolikrat-cyklus-probehne

## --question--

Co se stane, když tenhle kód spustíš?

```js
let floor = 0;
for (let i = 0; i < 10; i--) {
  floor = i;
}
console.log(floor);
```

### --answer--

Vypíše `9`.

#### --why--

Tak by to dopadlo s `i++`. Kterým směrem se tady `i` mění?

### --answer--

Vypíše `0`, cyklus neproběhne.

#### --why--

Podmínka `0 < 10` na začátku platí, takže tělo proběhne. Co se stane s podmínkou dál?

### --correct--

Cyklus nikdy neskončí, protože `i` se zmenšuje a pořád platí `i < 10`.

#### --why--

Krok `i--` jde od hranice pryč, takže podmínka nepřestane platit. V Akademii to zastaví ochrana s hláškou `Smyčka běží příliš dlouho`, v prohlížeči by karta zamrzla.

### --see--

js-zaklady/cykly#nekonecna-smycka

## --question--

Autor chtěl sečíst tržbu za celý týden, sedm dní po 100 Kč. Co kód vypíše?

```js
let total = 0;
for (let day = 1; day < 7; day++) {
  total += 100;
}
console.log(total);
```

### --expected--

600

### --why--

Start na `1` a ostré `< 7` dají jen dny 1 až 6 — o jeden průchod míň, klasický off-by-one. Pro sedm dní patří do podmínky `day <= 7`, nebo start na `0` s `day < 7`.

### --see--

js-zaklady/cykly#pruchod-navic

## --question--

Co vypíše tenhle kód?

```js
let letters = 0;
for (const char of 'Nová Ves') {
  if (char === ' ') {
    continue;
  }
  letters++;
}
console.log(letters);
```

### --expected--

7

### --why--

`for…of` projde osm znaků včetně mezery. U mezery `continue` přeskočí zbytek průchodu, takže se nezapočítá. Písmeno `á` je jeden znak jako každé jiné.

### --see--

js-zaklady/cykly#break-a-continue

## --question--

Máš otestovat funkci `canBuyAlcohol(age)`, která má vrátit `true` od 18 let. Která sada příkladů nejspíš odhalí chybu v hranici?

### --answer--

`5`, `30` a `60`

#### --why--

Tyhle věky jsou daleko od hranice. Funkce s `>` i s `>=` pro ně vrátí totéž.

### --correct--

`17`, `18` a `19`

#### --why--

Chyby v podmínce se schovávají přesně na hranici. `18` rozliší `>` od `>=` a sousední hodnoty ověří obě strany.

### --answer--

Jen `18`, víc příkladů nepotřebuju.

#### --why--

Jeden příklad ověří jednu hodnotu. Co když funkce vrací `true` pro všechny věky?

### --see--

js-zaklady/reseni-problemu#test-na-jedinem-prikladu

## --question--

Najdi v anglické dokumentaci MDN stránku operátoru **Remainder (%)**. Jaký výsledek má `-7 % 3`? Napiš jen číslo.

### --expected--

-1

### --why--

MDN v úvodu stránky píše, že výsledek má vždycky znaménko **dělence** (levé strany). Proto `-7 % 3` je `-1`, ne `2`. Test sudosti `n % 2 === 0` tím nerozbiješ, ale test lichosti `n % 2 === 1` pro záporná čísla selže — bezpečnější je `n % 2 !== 0`.

### --see--

js-zaklady/reseni-problemu#kde-to-najdes-v-mdn

# --code-- Věrnostní program kavárny

## --file-- kavarna.js

```js
// Kavárna U Zrnka: věrnostní program a účtenky.
// Za každých celých 50 Kč útraty dostane zákazník razítko.
// Deset razítek = káva zdarma.

const STAMP_PRICE = 50;
const STAMPS_FOR_FREE_COFFEE = 10;

function stampsFor(amount) {
  let stamps = 0;
  let rest = amount;
  while (rest > STAMP_PRICE) {
    stamps = stamps + 1;
    rest = rest - STAMP_PRICE;
  }
  return stamps;
}

function cupSize(code) {
  let size;
  switch (code) {
    case 'S':
      size = 'malá';
      break;
    case 'M':
      size = 'střední';
    case 'L':
      size = 'velká';
      break;
    default:
      size = 'neznámá';
  }
  return size;
}

function cupPrice(code, isTakeaway) {
  let price = 0;
  if (code === 'S') {
    price = 49;
  } else if (code === 'M') {
    price = 59;
  } else if (code === 'L') {
    price = 69;
  }
  if (isTakeaway) {
    price = price + 5;
  }
  return price;
}

function freeCoffees(stampsInput) {
  let free = 0;
  let counted = 0;
  for (let i = 1; i <= stampsInput; i++) {
    counted = counted + 1;
    if (counted == STAMPS_FOR_FREE_COFFEE) {
      free = free + 1;
      counted = 0;
    }
  }
  return free;
}

function receiptLine(name, amount, note) {
  const text = note ?? 'bez poznámky';
  return name + ': ' + amount + ' Kč (' + text + ')';
}

function tipFromInput(tipInput) {
  const tip = Number(tipInput) || 20;
  return tip;
}

console.log(stampsFor(150));
console.log(cupSize('M'));
console.log(cupPrice('M', true));
console.log(freeCoffees('25'));
console.log(receiptLine('Jana', 128, ''));
console.log(tipFromInput('0'));
```

## --question--

Zákazník utratil přesně 150 Kč. Co vypíše řádek 73 v `kavarna.js`?

### --expected--

2

### --why--

Cyklus na řádku 11 běží, dokud je `rest > 50`: po dvou průchodech zbyde `rest` přesně `50` a podmínka už neplatí. Třetí razítko za celých 150 Kč chybí — na hranici patří `>=`.

### --see--

js-zaklady/porovnani-a-logika#hranice-misto

## --question--

Co vypíše řádek 74 v `kavarna.js`?

### --expected--

velká

### --accept--

'velká'

### --why--

`cupSize('M')` nastaví na řádku 25 `size = 'střední'`, ale za tím chybí `break`. Program propadne do `case 'L'` a řádek 27 hodnotu přepíše na `'velká'`.

### --see--

js-zaklady/porovnani-a-logika#zapomenuty-break

## --question--

`freeCoffees` na řádku 76 dostane text `'25'`, a přesto vrátí správné `2`. Proč?

### --answer--

`for` každý text automaticky převede na číslo už při zavolání funkce.

#### --why--

Parametr `stampsInput` zůstane textem po celou dobu. Kde se s ním porovnává?

### --correct--

Porovnání `<=` na řádku 53 převede text na číslo, a `counted` je číslo od začátku.

#### --why--

Porovnání textu s číslem převede text na číslo, takže `i <= '25'` funguje jako `i <= 25`. Kdyby byly obě strany text, porovnávaly by se znak po znaku. Spolehlivé je převést vstup hned: `Number(stampsInput)`.

### --answer--

`==` na řádku 55 převede celou funkci do volného režimu.

#### --why--

`==` ovlivní jen to jedno porovnání, se kterým se píše, a v něm jsou obě strany čísla.

### --see--

js-zaklady/porovnani-a-logika#porovnani-textu-s-cislem

## --question--

Co vypíše řádek 77 v `kavarna.js`?

### --expected--

Jana: 128 Kč ()

### --why--

`??` na řádku 64 nahradí jen `null` a `undefined`. Prázdný text `''` je platná hodnota, takže zůstane a mezi závorkami není nic. Kdo chce nahradit i prázdnou poznámku, musí se na ni zeptat výslovně.

### --see--

js-zaklady/porovnani-a-logika#vychozi-hodnota-misto

## --question--

Zákazník do pole „Spropitné" napsal `0`. Co vrátí `tipFromInput('0')` na řádku 78 a proč?

### --answer--

`0`, protože `Number('0')` je nula.

#### --why--

`Number('0')` nulu opravdu vrátí. Co s ní ale udělá operátor za tím na řádku 69?

### --correct--

`20`, protože `||` na řádku 69 nahradí nulu výchozí hodnotou.

#### --why--

`Number('0')` je `0`, a nula je falsy, takže `||` vrátí `20`. Zákazník, který spropitné dávat nechtěl, ho dostane připočtené. Oprava: `Number(tipInput ?? 20)` nebo nulu odlišit výslovně.

### --answer--

`'0'`, protože text z formuláře se nepřevádí.

#### --why--

Na řádku 69 převod přes `Number` je. Podívej se, co se děje s převedenou hodnotou.

### --see--

js-zaklady/porovnani-a-logika#smaze-platnou-nulu
