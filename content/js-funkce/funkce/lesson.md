# Funkce

:::check pretest
Co vypíše poslední řádek? Tipni si, i když si nejsi jistý.

```js
function double(n) {
  return n * 2;
  console.log('hotovo');
}

console.log(double(4));
```

### --expected--

8

### --why--

`return` funkci ukončí a hodnotu pošle ven. Řádek s `'hotovo'` za ním se nikdy nespustí. Proč na tom záleží, uvidíš v části o `return`.
:::

:::check pretest
Funkce má jeden parametr, ale zavoláš ji se dvěma argumenty. Co se stane?

```js
function welcome(name) {
  console.log(`Vítej, ${name}`);
}

welcome('Eva', 'Petr');
```

### --answer--

Program spadne s chybou, protože funkce čeká jen jeden argument.

#### --why--

JavaScript počet argumentů nekontroluje. Co udělá s tím navíc, vysvětlí část o parametrech.

### --correct--

Vypíše `Vítej, Eva` a druhý argument se nepoužije.

#### --why--

Argumenty se přiřazují k parametrům zleva. `name` dostane `'Eva'` a `'Petr'` nemá kam jít.

### --answer--

Vypíše `Vítej, Eva` a pak `Vítej, Petr`.

#### --why--

Funkce se zavolala jednou, takže tělo proběhne jednou. Víc argumentů neznamená víc volání.
:::

Každý e-shop počítá cenu s DPH: v košíku, v přehledu objednávky, v e-mailu
s potvrzením. Když ten výpočet napíšeš na třech místech a sazba se změní, musíš
najít a opravit všechna tři. Na jedno zapomeneš a zákazník uvidí dvě různé ceny.

```js
const cartTotal = 1250 * 1.21;
const summaryTotal = 1250 * 1.21;
const emailTotal = 1250 * 1.12;
```

Třetí řádek má jinou sazbu a nikdo si toho nevšimne. Řešením je napsat výpočet
**jednou**, pojmenovat ho a na všech místech ho jen použít. To je funkce (*function*).

> [!REMEMBER]
> **Funkce je pojmenovaný postup: vstupy dostane přes parametry a výsledek vrátí přes `return`.**
> Kdo ji volá, nemusí vědět, jak uvnitř počítá. Stačí mu jméno, co dát dovnitř a co dostane zpátky.

## Deklarace a volání funkce

Funkci zapíšeš klíčovým slovem `function`, jménem, závorkami s parametry a tělem
ve složených závorkách. Tomu zápisu se říká [[deklarace funkce]]. Samotná
deklarace nic nespočítá — tělo proběhne až při **volání**, tedy když za jméno
napíšeš závorky.

:::live js
```js
function withVat(price) {
  return price * 1.21;
}

console.log(withVat(1000));
console.log(withVat(250));
console.log(withVat(1000) + withVat(250));
```
:::

Zkus změnit sazbu `1.21` na `1.12` a sleduj, že se změní všechny tři výpisy
najednou. Pak smaž závorky u posledního volání (`withVat + withVat(250)`) a přečti
si, co vypíše — jméno funkce bez závorek funkci nezavolá.

Funkce se pojmenovávají slovesem nebo tím, co vracejí: `formatPrice`,
`calculateShipping`, `isAdult`. Jméno má říct, co dostaneš, bez čtení těla.

:::check
Máš deklaraci `function shippingPrice(weight) { … }`. Napiš volání, které spočítá dopravu pro balík o hmotnosti `3`.

### --expected--

shippingPrice(3)

### --why--

Volání je jméno funkce a v závorkách argument. Bez závorek (`shippingPrice`) by ses jen odkázal na funkci a nic by se nespočítalo.

### --see--

js-funkce/funkce#deklarace-a-volani-funkce
:::

## Parametry a argumenty

V deklaraci jsou [[parametr|parametry]] — jména, pod kterými funkce vstupy
uvidí. Při volání dosadíš [[argument|argumenty]] — konkrétní hodnoty. Parametr
je proměnná, která existuje jen uvnitř funkce, a na začátku každého volání dostane
hodnotu argumentu na stejné pozici.

:::live js
```js
function shippingLabel(city, weight) {
  return `${city}: ${weight} kg`;
}

console.log(shippingLabel('Brno', 2));
console.log(shippingLabel(2, 'Brno'));
console.log(shippingLabel('Ostrava', 5, 'navíc'));
```
:::

Zkus přidat volání `shippingLabel('Plzeň')` bez druhého argumentu. Co funkce udělá
s parametrem, pro který argument nedostala?

:::live js predict
```js
function greet(name) {
  return `Ahoj, ${name}!`;
}

console.log(greet());
```
--question-- Co vypíše `console.log(greet())`?
--expected-- Ahoj, undefined!
--why-- Parametr, pro který nepřišel argument, má hodnotu `undefined`. JavaScript počet argumentů nekontroluje a nespadne — chybějící hodnota se prostě dosadí do textu. Výchozí hodnotu parametru nastavíš později v této lekci.
:::

> [!PITFALL]
> **Argumenty se přiřazují podle pořadí, ne podle jména.** `shippingLabel(2, 'Brno')`
> nespadne, jen vypíše `2: Brno kg`. Příznak: nesmyslný výsledek bez chybové hlášky.
> Oprava: drž pořadí z deklarace; když má funkce hodně parametrů, je čas ji rozdělit.

:::check
Co je v zápisu `function area(width, height) { … }` a volání `area(4, 3)` argument?

### --answer--

`width` a `height`

#### --why--

To jsou jména z deklarace, tedy parametry. Argument je hodnota, kterou dosadíš při volání.

### --correct--

`4` a `3`

#### --why--

Argumenty jsou konkrétní hodnoty při volání. `width` dostane `4`, `height` dostane `3`.

### --answer--

`area`

#### --why--

`area` je jméno funkce. Argumenty jsou to, co dáváš do závorek při volání.

### --see--

js-funkce/funkce#parametry-a-argumenty
:::

## `return`: jak funkce vrací výsledek

`return` udělá dvě věci naráz: **ukončí funkci a pošle hodnotu ven** na místo, kde
se funkce volala. Té hodnotě se říká [[návratová hodnota]]. Díky tomu jde výsledek uložit do proměnné, poslat do další
funkce nebo sečíst. Co když `return` chybí?

:::live js predict
```js
function discountedPrice(price) {
  price * 0.9;
}

const result = discountedPrice(500);
console.log(result);
```
--question-- Co vypíše `console.log(result)`?
--expected-- undefined
--why-- Výraz `price * 0.9` se spočítá a výsledek se zahodí, protože ho nic nevrací. Funkce bez `return` vrací `undefined`. Zkus před výraz napsat `return ` a sleduj, co se změní.
:::

S tím souvisí nejčastější záměna u začátečníků: ==vypsat== a ==vrátit== není
totéž. `console.log` ukáže hodnotu v konzoli člověku, ale funkce pořád vrací
`undefined`. `return` hodnotu předá programu.

:::live js
```js
function logTotal(price) {
  console.log(price * 1.21);
}

function getTotal(price) {
  return price * 1.21;
}

console.log(getTotal(100) + 50);
console.log(logTotal(100) + 50);
```
:::

Obě funkce „ukážou" 121, ale jen s výsledkem `getTotal` jde dál počítat. U
`logTotal` se vypíše `121` z těla funkce a pak `NaN`, protože `undefined + 50`
není číslo. Zkus v `logTotal` nahradit `console.log(…)` za `return …` a sleduj,
jak `NaN` zmizí.

> [!REMEMBER]
> **Funkce bez `return` vrací `undefined`.** Výpis do konzole není návratová hodnota.

### Předčasný `return` (guard clause)

Funkce smí mít `return` na víc místech a skončí na prvním, na který narazí. Toho se
využívá u kontrol na začátku funkce: když vstup nedává smysl, funkce hned vrátí
náhradní výsledek a zbytek těla už nemusí řešit výjimky. Taková kontrola se jmenuje
[[guard clause]] (doslova „strážní podmínka").

:::live js
```js
function pricePerPerson(total, people) {
  if (people <= 0) {
    return null;
  }
  return total / people;
}

console.log(pricePerPerson(1200, 4));
console.log(pricePerPerson(1200, 0));
```
:::

Zkus smazat celý blok `if` a sleduj, co vrátí druhé volání (`Infinity`, dělení nulou
v JavaScriptu nespadne). Hlavní výpočet stojí na konci funkce bez zanoření do `else`
a kontroly se čtou shora jako seznam: „nejdřív vyřeš nesmyslné vstupy, pak počítej".
Ve workshopu takové kontroly napíšeš.

:::check
Co vrátí `check(15)`?

```js
function check(age) {
  if (age < 18) {
    return 'nezletilý';
  }
  return 'dospělý';
}
```

### --expected--

nezletilý

### --accept--

'nezletilý'

### --why--

Podmínka platí, takže se provede první `return` a funkce hned skončí. Druhý `return` se nespustí.

### --see--

js-funkce/funkce#return-jak-funkce-vraci-vysledek
:::

## Výraz a šipková funkce

Funkci jde vytvořit i jako hodnotu a uložit ji do proměnné. Tomu se říká
[[funkční výraz]]. Kratší zápis téhož je [[šipková funkce]] (*arrow function*):

```js
// deklarace
function withVat(price) {
  return price * 1.21;
}

// funkční výraz
const withVatExpression = function (price) {
  return price * 1.21;
};

// šipková funkce se složenými závorkami
const withVatArrow = (price) => {
  return price * 1.21;
};

// šipková funkce s výrazem místo těla
const withVatShort = (price) => price * 1.21;
```

Všechny čtyři se volají stejně: `withVatShort(1000)`. U poslední varianty není
tělo ve složených závorkách, jen výraz za šipkou, a ten se vrátí automaticky.
Jakmile ale složené závorky napíšeš, je to obyčejné tělo funkce a `return` musíš
napsat sám.

:::live js predict
```js
const toEuro = (koruny) => { koruny / 25; };
const toDollars = (koruny) => koruny / 23;

console.log(toEuro(500), toDollars(460));
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- undefined 20
--why-- U `toEuro` jsou za šipkou složené závorky, takže jde o tělo funkce a v něm chybí `return`. `toDollars` má za šipkou jen výraz, který se vrátí sám. Zkus u `toEuro` složené závorky smazat.
:::

Rozdíly, na kterých teď záleží: deklaraci jde zavolat i nad místem, kde je
napsaná, výraz a šipku až pod ním (proč, vysvětlí lekce
[Rozsah platnosti, hoisting a TDZ](see:js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz)).
Šipka se hodí na krátké funkce, které předáváš jiným funkcím. Pro hlavní
pojmenované funkce programu je deklarace čitelnější. Šipky se liší ještě chováním
`this` — k němu se dostaneme v sekci *Closures, `this` a funkcionální styl*.

> [!PITFALL]
> **Šipka, která má vrátit objekt, potřebuje kolem objektu kulaté závorky.**
> `(name) => { name: name }` vrátí `undefined`, protože složené závorky se čtou
> jako tělo funkce. Oprava: `(name) => ({ name: name })`. Objekty podrobně přijdou
> v sekci *Objekty, reference a kopie*, tahle past tě tam bude čekat.

:::check
Přepiš funkci na šipkovou funkci s výrazem místo těla, uloženou do `const square`.

```js
function square(n) {
  return n * n;
}
```

### --expected--

const square = (n) => n * n

### --accept--

const square = n => n * n
const square = (n) => { return n * n }
const square = n => { return n * n }

### --why--

Šipka bez složených závorek vrací výraz za `=>` automaticky. Závorky kolem jediného parametru smíš vynechat, formátovače kódu je ale obvykle doplňují.

### --see--

js-funkce/funkce#vyraz-a-sipkova-funkce
:::

## Výchozí a zbytkové parametry

Parametr může mít [[výchozí parametr|výchozí hodnotu]] (*default parameter*),
která se použije, když argument chybí. Píše se za rovnítko přímo v závorkách.

:::live js
```js
function formatPrice(amount, currency = 'Kč') {
  return `${amount} ${currency}`;
}

console.log(formatPrice(350));
console.log(formatPrice(14, 'EUR'));
console.log(formatPrice(99, undefined));
console.log(formatPrice(99, null));
```
:::

Výchozí hodnota se použije, jen když je argument `undefined` — ať chybí, nebo ho
tam někdo napíše. `null` je hodnota, kterou někdo předal schválně, a ta projde.
Zkus přidat volání `formatPrice(0)` a sleduj, že nula zůstane nulou.

Starší kód výchozí hodnotu často nastavuje přes `||`. Na první pohled to vypadá
stejně:

:::live js predict
```js
function roundTo(value, decimals) {
  const places = decimals || 2;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

console.log(roundTo(3.14159, 0));
```
--question-- Co vypíše `console.log(roundTo(3.14159, 0))`?
--expected-- 3.14
--why-- `0` je nepravdivá hodnota, takže `decimals || 2` dá `2` a zaokrouhlí se na dvě místa místo na celé číslo. Výchozí parametr `decimals = 2` nebo `decimals ?? 2` nulu nechají být, protože reagují jen na chybějící hodnotu.
:::

[[zbytkový parametr|Zbytkový parametr]] (*rest parameter*) se třemi tečkami sebere
všechny zbylé argumenty do jednoho pole. Hodí se, když předem nevíš, kolik jich
bude:

:::live js
```js
function totalWeight(unit, ...weights) {
  let total = 0;
  for (const weight of weights) {
    total += weight;
  }
  return `${total} ${unit}`;
}

console.log(totalWeight('kg', 8, 2.5, 1.2));
console.log(totalWeight('kg'));
```
:::

Zkus přidat další čísla do prvního volání. Zbytkový parametr smí být jen jeden
a musí být poslední — `function bad(...weights, unit)` skončí hláškou
`SyntaxError: Rest parameter must be last formal parameter`. Bez argumentů je to
prázdné pole, ne `undefined`, takže cyklus bez problému proběhne nula krát.

:::check
Funkce `function label(text, suffix = '!')` se zavolá jako `label('Sleva', '')`. Co vrátí `` `${text}${suffix}` ``?

### --answer--

`Sleva!`

#### --why--

Výchozí hodnota se použije jen pro `undefined`. Prázdný řetězec je předaná hodnota, i když je nepravdivá.

### --correct--

`Sleva`

#### --why--

Argument `''` není `undefined`, takže `suffix` dostane prázdný řetězec a výchozí `'!'` se nepoužije.

### --answer--

`Slevaundefined`

#### --why--

`undefined` by `suffix` měl, kdyby výchozí hodnotu neměl a argument chyběl. Tady argument přišel.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry
:::

## Čistá funkce

[[čistá funkce|Čistá funkce]] (*pure function*) splňuje dvě podmínky: pro stejné
argumenty vrátí vždy stejný výsledek a nic mimo sebe nemění — nepřepisuje
proměnné venku, nevypisuje, neukládá. Všechno, co potřebuje, dostane přes parametry.

```js
// nečistá: výsledek závisí na proměnné venku a navíc ji mění
let discount = 0.1;
let discountsUsed = 0;
function applyDiscount(price) {
  discountsUsed++;
  return price * (1 - discount);
}

// čistá: všechno dostane přes parametry, nic venku nemění
function discounted(price, rate) {
  return price * (1 - rate);
}
```

Proč na tom záleží? Čistou funkci otestuješ jedním řádkem
(`discounted(1000, 0.1)` má dát `900`) a výsledek nezávisí na tom, co se v programu
stalo předtím. U `applyDiscount` musíš vědět, jakou hodnotu má zrovna `discount`,
a každé volání navíc změní `discountsUsed`. Program jako celek čistý být nemůže —
někde se musí vypsat výsledek nebo uložit data. Dobrým zvykem je mít výpočty
v čistých funkcích a [[vedlejší efekt|vedlejší efekty]] (výpis, zápis) soustředit na pár míst.

:::check
Která funkce je čistá?

### --answer--

`function addItem(item) { cart.push(item); }`

#### --why--

Funkce mění pole `cart`, které je venku. To je vedlejší efekt.

### --answer--

`function now() { return Date.now(); }`

#### --why--

Při každém volání vrátí jiný čas, i když argumenty jsou pořád stejné (žádné).

### --correct--

`` function fullName(first, last) { return `${first} ${last}`; } ``

#### --why--

Výsledek závisí jen na argumentech a funkce nic mimo sebe nemění.

### --answer--

`` function hello(name) { console.log(`Ahoj, ${name}`); } ``

#### --why--

Výpis do konzole je vedlejší efekt a funkce navíc nic nevrací.

### --see--

js-funkce/funkce#cista-funkce
:::

:::explain
Vysvětli vlastními slovy, proč se čistá funkce testuje snáz než funkce, která čte a mění proměnné mimo sebe.

## --model--

Čistá funkce dostane všechno přes parametry a výsledek jen vrátí. Pro stejné argumenty proto vrátí vždy totéž, takže test je jedno volání a porovnání výsledku. Funkce, která čte proměnnou venku, dává různé výsledky podle toho, co se v programu stalo předtím, a když proměnnou mění, ovlivní i další volání. Než ji otestuju, musím nastavit okolní stav a po testu ho uklidit.

## --checklist--

- Čistá funkce vrací pro stejné argumenty vždy stejný výsledek.
- Čistá funkce nemění nic mimo sebe (proměnné venku, výpis, ukládání).
- Test čisté funkce je volání s argumenty a porovnání návratové hodnoty.
- Funkce závislá na vnějším stavu vyžaduje před testem ten stav připravit.
:::

## Typické chyby a pasti

### Chybějící `return`

> [!PITFALL]
> **Funkce počítá, ale výsledek nevrací.** Příznak: volání dá `undefined`, a když
> s výsledkem počítáš dál, dostaneš `NaN` (`undefined * 2`) nebo text
> `undefined` ve výpisu. Oprava: před výraz napiš `return`; u šipky se složenými
> závorkami buď `return`, nebo závorky smaž.

### `return` na samostatném řádku

:::live js predict
```js
function total(price, quantity) {
  return
    price * quantity;
}

console.log(total(45, 3));
```
--question-- Co vypíše `console.log(total(45, 3))`?
--expected-- undefined
--why-- JavaScript za `return` na konci řádku sám doplní středník (automatické vkládání středníků, *ASI*). Funkce tedy skončí prázdným `return;` a výraz o řádek níž se nikdy nespustí.
:::

> [!PITFALL]
> **Za `return` nesmí být konec řádku.** Příznak: funkce vrací `undefined`,
> přestože výraz pod `return` vypadá správně. Oprava: začni výraz na stejném
> řádku jako `return`; dlouhý výraz obal do závorek `return (` … `);`.

### Funkce bez závorek

> [!PITFALL]
> **Jméno funkce bez závorek funkci nezavolá.** `'Celkem: ' + getTotal` vypíše
> celý zdrojový kód funkce (`Celkem: function getTotal() { … }`) a
> `if (isAdult)` platí vždy, protože funkce je pravdivá hodnota. Oprava: volej
> `getTotal()`, `isAdult(age)`.

### Výchozí hodnota přes `||`

> [!PITFALL]
> **`value || výchozí` přepíše i nulu a prázdný text.** Příznak: `roundTo(x, 0)`
> zaokrouhlí na dvě místa, `formatPrice(0)` ukáže výchozí cenu. Oprava: výchozí
> parametr `(value = 2)`, nebo `value ?? 2`, které reaguje jen na `undefined` a `null`.

:::check
Kolegova funkce má vrátit cenu po slevě, ale `finalPrice(1000)` vrací `undefined`. Co je špatně?

```js
const finalPrice = (price) => {
  price - price * 0.15;
};
```

### --answer--

Šipková funkce nesmí mít parametr v závorkách.

#### --why--

Závorky kolem parametru jsou v pořádku, u víc parametrů dokonce povinné. Podívej se na to, co je za šipkou.

### --correct--

Za šipkou jsou složené závorky, takže jde o tělo funkce bez `return`.

#### --why--

Tělo ve složených závorkách vrací jen to, co předáš přes `return`. Oprava: `return price - price * 0.15;`, nebo složené závorky smazat.

### --answer--

`price` je parametr, a proto se nedá použít ve výpočtu.

#### --why--

Parametr je obyčejná proměnná uvnitř funkce, počítat s ním jde. Výsledek výpočtu ale nikam neodchází.

### --see--

js-funkce/funkce#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) — průvodce funkcemi: deklarace, výrazy, parametry a volání. Začni částmi *Defining functions* a *Calling functions*.
- [Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) — zápisy šipek a v části *Function body* vysvětlení, proč objekt potřebuje kulaté závorky.
- [Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters) — věta o tom, že se výchozí hodnota použije jen pro `undefined`.
- [return](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return) — část *Automatic semicolon insertion* s pastí `return` na samostatném řádku.

Příště v převodníku jednotek rozložíš jeden větší úkol do malých funkcí, které si navzájem předávají výsledky.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function applyCoupon(price, coupon = 100) {
  return price - coupon;
}

console.log(applyCoupon(900, undefined), applyCoupon(900, null));
```

### --expected--

800 900

### --why--

Pro `undefined` se použije výchozí hodnota `100`, takže `900 - 100` je `800`. `null` je předaná hodnota a výchozí hodnotu nespustí; při odčítání se `null` převede na `0`, takže vyjde `900`.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --question--

Kolegyně chtěla dopravu zdarma od 1500 Kč, jinak od 500 Kč za 49 Kč a pod 500 Kč za 99 Kč. Co vrátí `shippingPrice(2000)`?

```js
function shippingPrice(total) {
  if (total >= 500) {
    return 49;
  }
  if (total >= 1500) {
    return 0;
  }
  return 99;
}
```

### --expected--

49

### --why--

Myslíš si, že funkce projde všechny podmínky a použije tu nejpřesnější? Skončí na prvním `return`, na který narazí. `2000 >= 500` platí, takže vrátí `49` a ke kontrole na 1500 Kč se nikdy nedostane. U guard clauses a víc `return` za sebou proto záleží na pořadí: přísnější podmínka (`>= 1500`) musí být první.

### --see--

js-funkce/funkce#predcasny-return-guard-clause

## --question--

Funkce `countItems(...items)` má vrátit, kolik argumentů dostala. Co vrátí `countItems()` bez argumentů, když tělo je `return items.length;`?

### --expected--

0

### --why--

Zbytkový parametr je bez argumentů prázdné pole, ne `undefined`. Délka prázdného pole je `0`, takže funkce nespadne.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --question--

Dnes je pondělí. Co vypíše tenhle kód na webu pekárny?

```js
function isWeekend(day) {
  return day === 'sobota' || day === 'neděle';
}

const today = 'pondělí';

if (isWeekend) {
  console.log('Otevřeno od 9:00');
} else {
  console.log('Otevřeno od 6:30');
}
```

### --answer--

`Otevřeno od 6:30`

#### --why--

Tak by to dopadlo s voláním `isWeekend(today)`. Podívej se, co přesně stojí v podmínce `if`.

### --correct--

`Otevřeno od 9:00`

#### --why--

V podmínce je funkce sama, ne její výsledek: chybí závorky i argument. Funkce je pravdivá hodnota, takže podmínka platí každý den. Oprava: `if (isWeekend(today))`.

### --answer--

Nic, program spadne, protože `isWeekend` nedostala argument.

#### --why--

Funkce se tu vůbec nevolá, takže jí argument chybět nemůže. A i kdyby se zavolala bez argumentu, JavaScript by nespadl, jen by `day` bylo `undefined`.

### --see--

js-funkce/funkce#funkce-bez-zavorek
