# Proměnné a typy

:::check pretest
Projde tenhle kód bez chyby?

```js
const city = 'Brno';
city = 'Praha';
```

### --answer--

Ano, `city` bude `'Praha'`.

#### --why--

U `let` by to tak bylo. Co přesně `const` zakazuje, vysvětlí první část.

### --correct--

Ne, druhý řádek spadne.

#### --why--

`const` nedovolí do proměnné přiřadit novou hodnotu. Přesnou hlášku uvidíš v první části.

### --answer--

Ano, ale `city` zůstane `'Brno'`.

#### --why--

JavaScript přiřazení tiše nezahodí. Co udělá, uvidíš v první části.
:::

:::check pretest
Co vypíše tenhle řádek? Napiš dvě slova oddělená mezerou.

```js
console.log(typeof 42, typeof '42');
```

### --expected--

number string

### --why--

`42` je číslo, `'42'` v uvozovkách je text, i když obsahuje číslice. `typeof` vrací jméno typu jako text. Proč na tom záleží, uvidíš v části o operátoru `+`.
:::

Košík v e-shopu si musí pamatovat, kolik kusů jsi vybral, jakou mají cenu a jestli platí sleva. Když přidáš kus, počet se změní, cena za kus ne. Program potřebuje hodnoty **pojmenovat** — k tomu slouží [[proměnná]] — aby s nimi mohl dál pracovat, a potřebuje vědět, jestli jde o číslo, se kterým se počítá, nebo o text, který se jen vypíše.

> [!REMEMBER]
> **Proměnná je jméno, pod kterým program najde hodnotu. Typ hodnoty určuje, co s ní jde dělat.** `const` sváže jméno s hodnotou natrvalo, do `let` smíš přiřadit znovu.

## `const` a `let`

Proměnnou založíš (*deklaruješ*) klíčovým slovem, jménem a přiřazením hodnoty přes `=`. Rovnítko tu neznamená „rovná se", ale „ulož hodnotu vpravo pod jméno vlevo".

:::live js
```js
const pricePerPiece = 89;
let quantity = 1;

console.log('Kusů:', quantity, 'cena:', pricePerPiece * quantity);

quantity = quantity + 2;
console.log('Kusů:', quantity, 'cena:', pricePerPiece * quantity);
```
:::

Zkus na konec přidat řádek `pricePerPiece = 99;` a přečti si hlášku v konzoli.

Řádek `quantity = quantity + 2` čte engine zprava doleva: nejdřív vezme dosavadní hodnotu `quantity`, přičte `2` a výsledek uloží zpátky pod stejné jméno. Krokuj šipkami a sleduj, co se po každém řádku změní:

:::memory
```js
const pricePerPiece = 89;
let quantity = 1;
quantity = quantity + 2;
```
--step-- 1 | vznikne konstanta s cenou za kus
pricePerPiece = 89
--step-- 2 | vznikne proměnná s počtem kusů
pricePerPiece = 89
quantity = 1
--step-- 3 | pravá strana se spočítá ze staré hodnoty a výsledek přepíše quantity
pricePerPiece = 89
quantity = 3
:::

Kdy použít které slovo? Začni vždycky s `const`. Na `let` ho změň jen tehdy, když do proměnné opravdu přiřazuješ znovu — průběžný součet, počítadlo, stav, který se mění. Čtenář kódu pak u `const` ví, že hodnota zůstane stejná, a nemusí hledat, kde se mění.

> [!PITFALL]
> **Přiřazení do `const` spadne s `TypeError: Assignment to constant variable.`** Příznak: hláška ukazuje na řádek, kde se do proměnné přiřazuje podruhé. Oprava: když hodnota měnit opravdu má, deklaruj ji přes `let`. Když ne, přiřazení smaž a založ novou proměnnou s jiným jménem.

:::check
V kódu je `let total = 0;` a o kus níž `total = total + 350;`. Jakou hodnotu má `total` po druhém řádku?

### --expected--

350

### --why--

Pravá strana se spočítá ze staré hodnoty: `0 + 350` je `350` a to se uloží zpátky do `total`. Právě proto je `total` deklarovaná přes `let`.

### --see--

js-zaklady/promenne-a-typy#const-a-let
:::

## Proč ne `var`

Ve starších návodech a v kódu z doby před rokem 2015 uvidíš třetí slovo, `var`. Funguje podobně jako `let`, ale má dvě vlastnosti, které schovávají chyby: stejné jméno jde přes `var` deklarovat znovu bez varování a proměnnou jde přečíst ještě **před** řádkem, kde vzniká.

:::live js predict
```js
console.log('Sleva:', discount);
var discount = 15;
```
--question-- Co vypíše `console.log`?
--expected-- Sleva: undefined
--why-- Proměnná z `var` existuje od začátku programu, jen hodnotu dostane až na svém řádku. Do té doby je v ní `undefined`, a program tiše pokračuje se špatnou hodnotou. Přepiš `var` na `let` a uvidíš `ReferenceError: Cannot access 'discount' before initialization` — chyba se ohlásí přesně tam, kde vznikla.
:::

Proto v moderním kódu `var` nepíšeme. Proč se `var` chová takhle, rozebere sekce o funkcích a rozsahu platnosti.

:::check
Proč je lepší, že `let` při čtení před deklarací spadne, než že `var` vrátí `undefined`?

### --answer--

`let` je rychlejší, protože nemusí nic vracet.

#### --why--

O rychlost tu nejde. Co se stane s programem, který pokračuje s `undefined`?

### --correct--

Chyba se ohlásí na řádku, kde vznikla, místo aby se `undefined` tiše šířilo dál.

#### --why--

S `undefined` program pokračuje a chyba se projeví až o kus dál (třeba jako `NaN` v ceně). Hláška z `let` ukáže přímo na příčinu.

### --answer--

`var` nejde použít v prohlížeči, jen v Node.js.

#### --why--

`var` funguje všude, ukázka výše běží v prohlížeči. Rozdíl je v tom, jak se chová před deklarací.

### --see--

js-zaklady/promenne-a-typy#proc-ne-var
:::

## Jak proměnné pojmenovat

Pravidla jazyka jsou krátká: jméno smí obsahovat písmena, číslice, `_` a `$`, nesmí začínat číslicí a nesmí to být vyhrazené slovo (`const`, `if`, `class`…). Velká a malá písmena se rozlišují, `total` a `Total` jsou dvě různé proměnné.

Důležitější jsou zvyklosti, podle kterých se kód čte:

- **camelCase:** víc slov dohromady, každé další s velkým písmenem — `totalPrice`, `itemCount`.
- **Anglicky:** jména v kódu píšeme anglicky, texty pro uživatele česky. Kolega z jiné země i dokumentace pak mluví stejným jazykem jako tvůj kód.
- **Podle obsahu, ne podle typu:** `deliveryFee` řekne víc než `number1` nebo `data`.
- **Ano/ne otázkou:** `isPaid`, `hasDiscount`, `canOrder`.
- **Pevné nastavení velkými písmeny:** `FREE_SHIPPING_LIMIT = 1500` je konstanta, kterou programátor nastavil jednou pro celý program.

:::check
Proměnná drží, jestli zákazník zaplatil objednávku. Které jméno se nejlépe čte?

### --answer--

`zaplaceno`

#### --why--

Česky píšeme texty pro uživatele, jména v kódu anglicky. Jak by zněla anglická otázka ano/ne?

### --answer--

`paid_status_boolean`

#### --why--

Typ do jména nepatří a podtržítka mezi slovy se v JavaScriptu u proměnných nepoužívají. Jak zní otázka, na kterou proměnná odpovídá?

### --correct--

`isPaid`

#### --why--

Anglicky, camelCase a čte se jako otázka ano/ne: `if (isPaid)` zní skoro jako věta.

### --answer--

`IsPaid`

#### --why--

Velké písmeno na začátku se v JavaScriptu nechává pro třídy. Proměnné začínají malým.

### --see--

js-zaklady/promenne-a-typy#jak-promenne-pojmenovat
:::

## Datové typy

Každá hodnota má [[datový typ]]. JavaScript rozlišuje dvě velké skupiny:

| skupina | typy | příklad |
|---|---|---|
| jednoduché hodnoty | `string` (text) | `'Brno'`, `'42'` |
| | `number` (číslo, celé i desetinné) | `42`, `89.9`, `-3` |
| | `boolean` (pravda, nepravda) | `true`, `false` |
| | `undefined` (hodnota nebyla přiřazena) | `undefined` |
| | `null` (záměrně prázdná hodnota) | `null` |
| | `bigint`, `symbol` (vzácné) | `42n` |
| objekty | objekt, pole, funkce… | `{ name: 'Ema' }`, `[1, 2]` |

Jednoduché hodnoty jsou jedna věc: jedno číslo, jeden text. Objekty v sobě drží víc hodnot — k nim se dostaneš v sekcích o objektech a polích. V téhle sekci pracuješ s jednoduchými hodnotami.

Jaký typ hodnota má, zjistí operátor `typeof`. Vrací jméno typu jako text:

:::live js
```js
const productName = 'Káva zrnková';
const price = 289.9;
const inStock = true;
let note;

console.log(typeof productName);
console.log(typeof price);
console.log(typeof inStock);
console.log(typeof note);
```
:::

Zkus změnit `289.9` na `'289.9'` a sleduj, jak se změní druhý výpis. Na pohled je to pořád cena, pro JavaScript už text.

:::check
Jaký typ vrátí `typeof true`? Napiš přesně to, co vypíše konzole.

### --expected--

boolean

### --why--

`true` a `false` jsou jediné dvě hodnoty typu `boolean`. Bez uvozovek — `'true'` v uvozovkách by byl `string`.

### --see--

js-zaklady/promenne-a-typy#datove-typy
:::

## Výjimky `typeof`

`typeof` má několik výsledků, které nečekáš a které se objevují na pohovorech. Nejznámější je tenhle:

:::live js predict
```js
const coupon = null;
console.log(typeof coupon);
```
--question-- Co vypíše `console.log`?
--expected-- object
--why-- `typeof null` vrací `'object'`. Je to historická chyba z první verze jazyka, kterou už nejde opravit, protože by se rozbily miliony webů. `null` přitom objekt není. Když chceš vědět, jestli je hodnota `null`, porovnej ji přímo: `coupon === null`.
:::

Další dvě výjimky:

- `typeof [1, 2]` je taky `'object'` — pole je druh objektu.
- `typeof NaN` je `'number'`. `NaN` (*Not a Number*) je zvláštní číselná hodnota, která vznikne z nepovedeného výpočtu nebo převodu.

A jedna výjimka „opačným směrem": `typeof` funkce vrátí `'function'`, přestože funkce je objekt.

:::check
Proměnná `value` má hodnotu `null`. Který zápis spolehlivě pozná, že je v ní `null`?

### --answer--

`typeof value === 'null'`

#### --why--

`typeof` nikdy nevrací `'null'`. Co vrací u `null`, ukázala předpověď.

### --answer--

`typeof value === 'object'`

#### --why--

Tahle podmínka platí i pro každý objekt a pole. `null` od nich neodliší.

### --correct--

`value === null`

#### --why--

`null` je jediná hodnota svého druhu, stačí ji porovnat přímo.

### --see--

js-zaklady/promenne-a-typy#vyjimky-typeof
:::

## `undefined` a `null`

Obě hodnoty znamenají „tady nic není", ale říkají to jinými slovy:

- `undefined` = **hodnota ještě nebyla přiřazena.** Dá ho JavaScript sám: proměnná `let note;` bez hodnoty, neexistující vlastnost objektu, funkce, která nic nevrací.
- `null` = **hodnota je záměrně prázdná.** Napíše ho programátor: „zákazník kupon nezadal", „vybraný den zatím není".

:::live js
```js
let deliveryDate;
const coupon = null;

console.log('Datum doručení:', deliveryDate);
console.log('Kupon:', coupon);

deliveryDate = 'pátek 18. 9.';
console.log('Datum doručení:', deliveryDate);
```
:::

Zkus prohodit význam: nastav `let deliveryDate = null;` a přemýšlej, co by tahle hodnota říkala kolegovi, který kód čte.

Pravidlo pro vlastní kód: `undefined` nech na JavaScriptu, prázdnou hodnotu, kterou nastavuješ ty, zapiš jako `null`. Když pak v programu uvidíš `undefined`, víš, že něco nebylo nastavené — často je to stopa k chybě.

:::check
Formulář objednávky má nepovinné pole „Poznámka pro kurýra". Zákazník ho nechal prázdné a program to chce zapsat do proměnné `courierNote`. Kterou hodnotou to vyjádříš podle zvyklostí z téhle části?

### --answer--

`undefined`

#### --why--

`undefined` nechává JavaScript pro hodnoty, které nikdo nepřiřadil. Tady se program rozhodl hodnotu nastavit.

### --correct--

`null`

#### --why--

Programátor tím záměrně říká „prázdné". Kdo kód čte, pozná, že nejde o zapomenutou hodnotu.

### --answer--

`'null'`

#### --why--

V uvozovkách je to text o čtyřech písmenech, ne prázdná hodnota. Podmínka `courierNote === null` by pro něj neplatila.

### --see--

js-zaklady/promenne-a-typy#undefined-a-null
:::

## Operátory a přednost

S čísly počítají aritmetické operátory:

| operátor | význam | příklad | výsledek |
|---|---|---|---|
| `+` `-` | sčítání, odčítání | `1200 - 150` | `1050` |
| `*` `/` | násobení, dělení | `89 * 3`, `10 / 4` | `267`, `2.5` |
| `%` | zbytek po celočíselném dělení | `17 % 5` | `2` |
| `**` | mocnina | `2 ** 10` | `1024` |

Přednost je jako v matematice: nejdřív `**`, pak `*`, `/` a `%`, nakonec `+` a `-`. Stejně silné operátory jdou zleva doprava. Když chceš jiné pořadí, použij závorky — a použij je i tehdy, když si pořadím nejsi jistý, čtenáři to pomůže.

Zbytek po dělení `%` vypadá nenápadně, ale používá se pořád: jestli je číslo sudé (`n % 2` je `0`), kolik korun zbyde po rozdělení účtu, kolik minut zbývá po celých hodinách.

:::live js predict
```js
const pizza = 219;
const drink = 45;
const people = 2;

console.log(pizza + drink / people);
```
--question-- Autor chtěl spočítat, kolik zaplatí jeden člověk. Co ukázka vypíše?
--expected-- 241.5
--why-- Dělení má přednost před sčítáním, takže se napřed spočítá `45 / 2` a k tomu se přičte celá pizza: `219 + 22.5`. Zkus obalit součet závorkami `(pizza + drink) / people` a dostaneš `132`.
:::

Když do proměnné přičítáš k její vlastní hodnotě, je tu zkratka: `total += 45` znamená totéž co `total = total + 45`. Stejně fungují `-=`, `*=` a `/=`. Proměnná musí být `let`.

:::check
Kolik je `20 % 6`?

### --expected--

2

### --why--

Šestka se do dvaceti vejde třikrát (`18`), zbytek je `2`. `%` vrací právě ten zbytek, ne výsledek dělení.

### --see--

js-zaklady/promenne-a-typy#operatory-a-prednost
:::

### Zaokrouhlení: `Math.round`, `Math.ceil`, `Math.floor`

Ceny, podíly a průměry často vyjdou s desetinnými místy a ty je potřebuješ zaokrouhlit. JavaScript má na to tři funkce v objektu `Math`:

| volání | zaokrouhlí | `Math.…(306.25)` | `Math.…(306.75)` |
|---|---|---|---|
| `Math.round(x)` | k nejbližšímu celému číslu | `306` | `307` |
| `Math.ceil(x)` | vždy nahoru | `307` | `307` |
| `Math.floor(x)` | vždy dolů | `306` | `306` |

Na desítky nebo na haléře zaokrouhlíš stejnými funkcemi, jen číslo nejdřív vydělíš nebo vynásobíš a výsledek vrátíš zpátky: `Math.ceil(1234 / 10) * 10` je `1240`, `Math.round(19.456 * 100) / 100` je `19.46`.

## Text a číslo: operátor `+` a převod typů

Operátor `+` má v JavaScriptu dvě práce. Mezi dvěma čísly sčítá, ale jakmile je aspoň jedna strana text, **spojí** obě strany do jednoho textu. Ostatní aritmetické operátory text naopak potichu převedou na číslo. Tomuhle tichému převodu se říká [[přetypování]] (*type coercion*).

:::live js predict
```js
const fromInput = '5';

console.log(fromInput + 2, fromInput - 2);
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- 52 3
--why-- `'5' + 2`: jedna strana je text, takže `+` spojuje a vznikne text `'52'`. `'5' - 2`: odčítání s textem neumí, a tak `'5'` převede na číslo a spočítá `3`. Stejný operátor se tedy u textu chová jinak než ostatní.
:::

Proč na tom záleží? Všechno, co uživatel napíše do formulářového pole, přijde do programu jako **text**, i když napsal číslice. Než s tím začneš počítat, převeď text na číslo sám:

:::live js
```js
const quantityInput = '3';
const price = 89;

console.log(Number(quantityInput) * price);
console.log(+quantityInput + 1);
console.log(Number(''), Number('12 Kč'));
```
:::

`Number(text)` převede text na číslo. Stejně funguje zkratka `+text` (plus před hodnotou). Zkus změnit `'3'` na `'3,5'` a sleduj výsledek — česká desetinná čárka pro JavaScript číslo není. Poslední řádek ukazuje dvě pasti převodu: prázdný text je `0` a text, který číslem není, dá `NaN`.

Opačným směrem převede číslo na text `String(42)`. Obě funkce jsou **výslovný** převod: kdo kód čte, vidí, že typ měníš záměrně.

:::check
Napiš výraz, který převede text v proměnné `ageInput` na číslo funkcí z téhle části.

### --expected--

Number(ageInput)

### --accept--

+ageInput

### --why--

`Number(ageInput)` převede text na číslo a je čitelný na první pohled. Zkratka `+ageInput` dělá totéž.

### --see--

js-zaklady/promenne-a-typy#text-a-cislo-operator-a-prevod-typu
:::

## Šablonový řetězec

Spojovat texty a hodnoty přes `+` je pracné a snadno se zapomene mezera: `'Celkem ' + total + ' Kč'`. Přehlednější je [[šablonový řetězec]] (*template literal*). Píše se do zpětných uvozovek `` ` `` a hodnotu vložíš do `${…}`:

:::live js
```js
const customer = 'Jana';
const items = 3;
const total = 267;

console.log(`${customer}, v košíku máš ${items} položky za ${total} Kč.`);
console.log(`Po slevě 10 % zaplatíš ${total * 0.9} Kč.`);
```
:::

Do `${…}` smíš napsat libovolný výraz, třeba výpočet. Zpětnou uvozovku napíšeš na české klávesnici přes pravý Alt + ý (na anglické je vlevo nahoře vedle jedničky). Zkus do šablony přidat nový řádek klávesou Enter — šablonový řetězec smí mít víc řádků a konzole je tak i vypíše.

:::check
Proměnná `city` obsahuje `'Olomouc'`. Napiš šablonový řetězec, který z ní vytvoří text `Doručíme do Olomouc`.

### --expected--

`Doručíme do ${city}`

### --why--

Pevný text se píše přímo do zpětných uvozovek, hodnota proměnné do `${…}`.

### --see--

js-zaklady/promenne-a-typy#sablonovy-retezec
:::

## Typické chyby a pasti

### Spojení místo sčítání

:::live js predict
```js
const orderTotal = '1250';
const shipping = 89;

console.log(`Zaplatíte ${orderTotal + shipping} Kč`);
```
--question-- Co zákazník uvidí?
--expected-- Zaplatíte 125089 Kč
--why-- `orderTotal` je text (třeba z formuláře nebo z URL), a tak `+` obě hodnoty spojí místo sečtení. Oprava: `Number(orderTotal) + shipping`.
:::

> [!PITFALL]
> **`+` s textem spojuje.** Příznak: částka je nesmyslně dlouhá, typicky obě čísla napsaná za sebou (`'1250' + 89` → `'125089'`). Odčítání a násobení přitom „fungují", takže chyba vypadá náhodně. Oprava: text z formuláře převeď přes `Number()` hned, jak ho dostaneš.

### Čtení proměnné před deklarací

> [!PITFALL]
> **Proměnná z `let` nebo `const` použitá o řádek dřív, než vznikla, spadne s `ReferenceError: Cannot access 'price' before initialization`.** Příznak: jméno v hlášce existuje, jen je deklarované níž. Oprava: přesuň deklaraci nad místo, kde proměnnou poprvé čteš.

### Dvakrát `let` se stejným jménem

> [!PITFALL]
> **`let total = 0;` a o kus níž znovu `let total = 100;` skončí `SyntaxError: Identifier 'total' has already been declared`** a program nejde vůbec spustit. Oprava: druhé `let` smaž a do existující proměnné jen přiřaď, `total = 100;`.

### Proměnná bez deklarace

:::live js predict
```js
let subtotal = 480;
subtotl = subtotal + 120;

console.log(subtotal);
```
--question-- Autor chtěl k mezisoučtu přičíst dopravu. Co ukázka vypíše?
--expected-- 480
--why-- Kvůli překlepu `subtotl` vznikla nová, nikde nedeklarovaná proměnná a součet se uložil do ní. `subtotal` zůstal na `480` a program nic nenahlásil. V přísném režimu (`'use strict'`, moduly, třídy) by přiřazení do nedeklarovaného jména spadlo s `ReferenceError: subtotl is not defined`.
:::

> [!PITFALL]
> **Přiřazení do jména bez `let` nebo `const` v obyčejném skriptu nespadne — založí novou proměnnou.** Příznak: hodnota se „neuloží" a proměnná, kterou čteš, zůstane stará. Oprava: každou proměnnou deklaruj; editor s lintem ti nedeklarované jméno podtrhne.

:::check
V proměnné `priceInput` je text z formulářového pole, třeba `'499'`. Oprav řádek tak, aby `total` byl součet ceny a dopravy jako číslo.

```js
const total = priceInput + 89;
```

### --expected--

const total = Number(priceInput) + 89

### --accept--

const total = +priceInput + 89
const total = 89 + Number(priceInput)

### --why--

Bez převodu `+` text a číslo spojí na `'49989'`. `Number(priceInput)` udělá z textu číslo a `+` pak sčítá.

### --see--

js-zaklady/promenne-a-typy#spojeni-misto-scitani
:::

## Kde to najdeš v MDN

- [Grammar and types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) — deklarace `let`, `const` a `var`, pravidla pro jména a přehled datových typů.
- [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) — tabulka všech výsledků `typeof` včetně výjimky pro `null`.
- [Operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence) — tabulka přednosti operátorů, když si pořadím nejsi jistý.
- [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) — šablonové řetězce, víc řádků a vkládání výrazů.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
let points = 10;
points += 5;
points = points * 2;
console.log(points);
```

### --expected--

30

### --why--

`points += 5` je zkratka za `points = points + 5`, takže `15`. Pak se `15 * 2` uloží zpátky: `30`. Každé přiřazení počítá z hodnoty, kterou proměnná má v tu chvíli.

### --see--

js-zaklady/promenne-a-typy#operatory-a-prednost

## --question--

Co vypíše tenhle kód? Napiš hodnoty oddělené mezerou.

```js
const width = '120';
const height = '80';
console.log(width * height, width + height);
```

### --expected--

9600 12080

### --why--

Násobení s textem neumí, a tak oba texty převede na čísla: `9600`. `+` naopak se dvěma texty spojuje: `'120' + '80'` je `'12080'`.

### --see--

js-zaklady/promenne-a-typy#text-a-cislo-operator-a-prevod-typu

## --question--

Proměnná `rating` zatím nemá hodnotu, protože zákazník produkt ještě nehodnotil. Kolega napsal `let rating = 0;`. Proč to může způsobit chybu v programu?

### --answer--

`0` není platná hodnota pro `let`.

#### --why--

`let` přijme jakoukoli hodnotu. Co ale nula v hodnocení znamená pro zbytek programu?

### --correct--

Nulu nejde odlišit od skutečného hodnocení nula hvězdiček; prázdnou hodnotu vyjádří `null`.

#### --why--

`0` je platné číslo, se kterým se dál počítá (třeba do průměru). `null` řekne „hodnocení zatím není" a program ho může přeskočit.

### --answer--

Nic se nestane, `0` a `null` jsou v JavaScriptu totéž.

#### --why--

Jsou to různé hodnoty různých typů: `typeof 0` je `'number'`, `null === 0` je `false`.

### --see--

js-zaklady/promenne-a-typy#undefined-a-null

## --question--

Jaký typ vrátí `typeof` pro hodnotu `'false'`? Napiš přesně výstup konzole.

### --expected--

string

### --why--

V uvozovkách je to text, i když obsahuje slovo `false`. Typ `boolean` mají jen hodnoty `true` a `false` bez uvozovek.

### --see--

js-zaklady/promenne-a-typy#datove-typy
