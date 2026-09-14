## --card-- output

Co vypíše tenhle kód?

```js
const double = (n) => { n * 2; };
console.log(double(4) + 1);
```

### --expected--

NaN

### --why--

Myslíš si, že šipka vrací výraz sama i se složenými závorkami? Se závorkami je to tělo funkce a bez `return` vrací `undefined`. `undefined + 1` je `NaN`.

### --see--

js-funkce/funkce#vyraz-a-sipkova-funkce

## --card-- output

Co vypíše tenhle kód?

```js
function greeting(name) {
  return
    `Ahoj ${name}`;
}

console.log(greeting('Ema'));
```

### --expected--

undefined

### --why--

Myslíš si, že `return` si výraz o řádek níž vezme? Za `return` na konci řádku JavaScript sám doplní středník, funkce skončí prázdným `return;` a text se nikdy nevyhodnotí.

### --see--

js-funkce/funkce#return-na-samostatnem-radku

## --card-- output

Co vypíše tenhle kód?

```js
function tip(percent = 10) {
  return percent;
}

console.log(tip(null), tip(undefined));
```

### --expected--

null 10

### --why--

Myslíš si, že výchozí hodnota nahradí každou „prázdnou" hodnotu? Použije se jen pro `undefined`. `null` je hodnota, kterou někdo předal schválně, a projde.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --card-- output

Co vypíše tenhle kód?

```js
function volume(level) {
  const current = level || 50;
  return current;
}

console.log(volume(0));
```

### --expected--

50

### --why--

Myslíš si, že `||` doplní jen chybějící hodnotu? Doplní každou nepravdivou, a `0` nepravdivá je. Uživatel, který si ztlumil zvuk na nulu, dostane hlasitost 50. Oprava: `level = 50` v parametrech nebo `level ?? 50`.

### --see--

js-funkce/funkce#vychozi-hodnota-pres

## --card-- output

Co vypíše tenhle kód?

```js
function addressLine(city, zip) {
  return `${zip} ${city}`;
}

console.log(addressLine('602 00', 'Brno'));
```

### --expected--

Brno 602 00

### --why--

Myslíš si, že se argument přiřadí k parametru podle toho, co obsahuje? Přiřazuje se podle pořadí: `city` dostane `'602 00'` a `zip` dostane `'Brno'`. JavaScript nespadne, jen vrátí nesmysl.

### --see--

js-funkce/funkce#parametry-a-argumenty

## --card-- output

Co vypíše tenhle kód?

```js
let status = 'čeká';

if (true) {
  let status = 'hotovo';
}

console.log(status);
```

### --expected--

čeká

### --why--

Myslíš si, že `let status = 'hotovo'` změní vnější proměnnou? Vytvoří novou proměnnou jen pro blok `if`, která vnější zastíní. Přiřazení do vnější by bylo `status = 'hotovo'` bez `let`.

### --see--

js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku

## --card-- output

Co vypíše tenhle kód?

```js
if (true) {
  var color = 'modrá';
}

console.log(color);
```

### --expected--

modrá

### --why--

Myslíš si, že proměnná z bloku za jeho závorkou zanikne? S `let` a `const` ano, ale `var` bloky nerespektuje a platí pro celou funkci nebo skript.

### --see--

js-funkce/scope-a-hoisting#blokovy-rozsah-let-a-const-vs-var

## --card-- output

Co vypíše tenhle kód?

```js
try {
  console.log(size);
  let size = 'M';
} catch (error) {
  console.log(error.name);
}
```

### --expected--

ReferenceError

### --why--

Myslíš si, že proměnná před svým řádkem má hodnotu `undefined`? To platí jen pro `var`. `let` a `const` jsou do řádku deklarace v TDZ a čtení skončí `ReferenceError: Cannot access 'size' before initialization`.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --card-- output

Co vypíše tenhle kód?

```js
console.log(typeof total);
var total = 5;
```

### --expected--

undefined

### --why--

Myslíš si, že program spadne, protože `total` ještě neexistuje? Deklarace `var` se vytáhne na začátek skriptu s hodnotou `undefined`, přiřazení `= 5` zůstane na svém řádku. `typeof undefined` je `'undefined'`.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --card-- output

Co vypíše tenhle kód?

```js
const unit = 'kg';

function show(value) {
  return `${value} ${unit}`;
}

function inGrams() {
  const unit = 'g';
  return show(500);
}

console.log(inGrams());
```

### --expected--

500 kg

### --why--

Myslíš si, že `show` uvidí proměnné funkce, která ji zavolala? Funkce hledá proměnné tam, kde je napsaná — `show` je na nejvyšší úrovni, a tam je `unit = 'kg'`. To je lexikální rozsah.

### --see--

js-funkce/scope-a-hoisting#lexikalni-rozsah-a-zasobnik-volani

## --card-- output

Co vypíše tenhle kód?

```js
function isOpen() {
  return false;
}

console.log(isOpen ? 'otevřeno' : 'zavřeno');
```

### --expected--

otevřeno

### --why--

Myslíš si, že podmínka použije výsledek funkce? Bez závorek se funkce nezavolá — v podmínce stojí funkce sama, a ta je pravdivá hodnota. Správně `isOpen()`.

### --see--

js-funkce/funkce#funkce-bez-zavorek

## --card-- output

Co vypíše tenhle kód?

```js
function repeatTwice(action) {
  action('první');
  action('druhé');
}

repeatTwice((word) => console.log(word.length));
```

### --expected--

5
5

### --why--

Myslíš si, že callback něco dostane sám od sebe? Argumenty mu předává ten, kdo ho volá: `repeatTwice` ho zavolá dvakrát se dvěma slovy a obě mají pět znaků.

### --see--

js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny

## --card-- output

Co vypíše tenhle kód?

```js
function joinTags(separator, ...tags) {
  return tags.join(separator);
}

console.log(joinTags(', ', 'akce', 'novinka'));
```

### --expected--

akce, novinka

### --why--

Myslíš si, že zbytkový parametr sebere všechny argumenty? Sebere jen ty, na které nezbyl obyčejný parametr: první argument jde do `separator`, zbytek do pole `tags`.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --card-- code js

Napiš funkci `pricePerPiece(total, pieces)`, která vrátí cenu za kus. Když `pieces` není kladné číslo, vrátí hned `null` (guard clause).

### --seed--

```js
function pricePerPiece(total, pieces) {
}
```

### --test--

```js
assert.equal(pricePerPiece(120, 4), 30, 'pricePerPiece(120, 4) má vrátit 30');
assert.equal(pricePerPiece(120, 0), null, 'pricePerPiece(120, 0) má vrátit null');
assert.equal(pricePerPiece(120, -2), null, 'pricePerPiece(120, -2) má vrátit null');
```

### --solution--

```js
function pricePerPiece(total, pieces) {
  if (pieces <= 0) {
    return null;
  }
  return total / pieces;
}
```

### --why--

Kontrola nesmyslného vstupu stojí na začátku a hned vrací. Hlavní výpočet pak zůstane na konci bez `else`.

### --see--

js-funkce/funkce#predcasny-return-guard-clause

## --card-- code js

Napiš funkci `durationLabel(minutes, unit)`, která vrátí text `` `${minutes} ${unit}` ``. Když `unit` chybí, použije se `'min'`. Nula minut musí dát `'0 min'`.

### --seed--

```js
function durationLabel(minutes, unit) {
}
```

### --test--

```js
assert.equal(durationLabel(45), '45 min', "durationLabel(45) má vrátit '45 min'");
assert.equal(durationLabel(2, 'h'), '2 h', "durationLabel(2, 'h') má vrátit '2 h'");
assert.equal(durationLabel(0), '0 min', "durationLabel(0) má vrátit '0 min'");
```

### --solution--

```js
function durationLabel(minutes, unit = 'min') {
  return `${minutes} ${unit}`;
}
```

### --why--

Výchozí parametr se použije jen pro chybějící argument. Nula v `minutes` s výchozí hodnotou nijak nesouvisí a projde.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --card-- code js

Napiš funkci `applyRule(price, rule)`, která zavolá callback `rule` s cenou a vrátí jeho výsledek zaokrouhlený na celé koruny.

### --seed--

```js
function applyRule(price, rule) {
}
```

### --test--

```js
assert.equal(applyRule(999, (price) => price / 2), 500, 'applyRule(999, polovina) má vrátit 500');
assert.equal(applyRule(1000, (price) => price - 150), 850, 'applyRule(1000, sleva 150) má vrátit 850');
```

### --solution--

```js
function applyRule(price, rule) {
  return Math.round(rule(price));
}
```

### --why--

`rule` je funkce, takže ji uvnitř zavoláš se závorkami a cenou. Kdo `applyRule` volá, předá pravidlo bez závorek nebo jako šipku.

### --see--

js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny

## --card-- code js

Napiš funkci `maxOf(...numbers)`, která vrátí největší z čísel předaných jako samostatné argumenty. Bez argumentů vrátí `null`.

### --seed--

```js
function maxOf(...numbers) {
}
```

### --test--

```js
assert.equal(maxOf(3, 9, 4), 9, 'maxOf(3, 9, 4) má vrátit 9');
assert.equal(maxOf(-5, -2), -2, 'maxOf(-5, -2) má vrátit -2');
assert.equal(maxOf(), null, 'maxOf() má vrátit null');
```

### --solution--

```js
function maxOf(...numbers) {
  if (numbers.length === 0) {
    return null;
  }
  let max = numbers[0];
  for (const number of numbers) {
    if (number > max) {
      max = number;
    }
  }
  return max;
}
```

### --why--

Zbytkový parametr sebere argumenty do pole, které projdeš cyklem. Začít s `max = 0` by u samých záporných čísel dalo špatný výsledek.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --card-- free

Jaký je rozdíl mezi deklarací funkce a šipkovou funkcí uloženou do `const`? Kdy použiješ kterou?

### --back--

Deklarace `function name() {}` je díky hoistingu k dispozici v celém rozsahu, takže ji jde zavolat i nad řádkem, kde je napsaná. Šipka v `const` se chová jako každá `const` — nad svým řádkem je v TDZ a volání skončí `ReferenceError`. Šipka je kratší a vrací výraz sama, když nemá složené závorky, proto se hodí na krátké callbacky. Pro hlavní pojmenované funkce programu je deklarace čitelnější. Šipky se navíc liší chováním `this`, ke kterému se dostaneme později.

### --see--

js-funkce/funkce#vyraz-a-sipkova-funkce

## --card-- free

Co je rozsah platnosti (scope) a jak JavaScript hledá proměnnou, kterou funkce sama nemá?

### --back--

Rozsah platnosti je část kódu, ve které je proměnná vidět. Vytváří ho každá funkce a každý blok ve složených závorkách; `let` a `const` platí v bloku, `var` v celé funkci. Když proměnná v aktuálním rozsahu není, JavaScript ji hledá ve vnějších rozsazích až po globální. Rozhoduje místo, kde je funkce napsaná, ne odkud se volá — tomu se říká lexikální rozsah. Zvenku do funkce vidět nejde.

### --see--

js-funkce/scope-a-hoisting#lexikalni-rozsah-a-zasobnik-volani

## --card-- free

Co je hoisting a TDZ? Proč `let` před deklarací vyhodí chybu, když `var` vrátí `undefined`?

### --back--

Hoisting znamená, že deklarace jsou zaregistrované už od začátku svého rozsahu. Deklarace funkce je připravená celá, `var` má předem hodnotu `undefined` a `let` a `const` existují, ale až do řádku deklarace jsou v TDZ, časové mrtvé zóně. Čtení v TDZ skončí `ReferenceError: Cannot access … before initialization`. Je to záměr: chyba se ukáže přesně tam, kde se proměnná čte příliš brzy, místo aby program tiše počítal s `undefined`.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --card-- free

Co je callback? Jaký je rozdíl mezi `setTimeout(save, 1000)` a `setTimeout(save(), 1000)`?

### --back--

Callback je funkce předaná jako argument jiné funkci, která ji zavolá sama — kdy a s jakými argumenty, rozhoduje ona. `setTimeout(save, 1000)` předá funkci a prohlížeč ji zavolá za sekundu. `setTimeout(save(), 1000)` funkci zavolá hned a `setTimeout` dostane jen její výsledek, typicky `undefined`, takže po sekundě se nestane nic. Funkce jako hodnota se tedy předává bez závorek; s argumenty se obalí šipkou `() => save(draft)`.

### --see--

js-funkce/funkce-jako-hodnoty#fn-vs-fn-predat-nebo-zavolat

## --card-- free

Co je čistá funkce a proč se vyplatí psát výpočty jako čisté funkce?

### --back--

Čistá funkce vrátí pro stejné argumenty vždy stejný výsledek a nic mimo sebe nemění — nevypisuje, nemění proměnné venku, nezapisuje do stránky. Otestuje se jedním voláním a porovnáním výsledku a dá se použít kdekoli bez obav z nečekaných změn. Program jako celek čistý být nemůže, ale výpočty patří do čistých funkcí a vedlejší efekty do pár tenkých funkcí na okraji, které čisté funkce volají.

### --see--

js-funkce/funkce#cista-funkce

## --card-- free

Co je guard clause a proč ji používat místo zanořených `if` / `else`?

### --back--

Guard clause je kontrola na začátku funkce, která při nesmyslném vstupu hned vrátí výsledek a funkce skončí. Kontroly se pak čtou shora jako seznam podmínek a hlavní výpočet stojí na konci bez zanoření, takže je jasné, co funkce dělá v běžném případě. Další kontrola se přidá jako nový krátký `if` a nemusí se přeskupovat větve `else`.

### --see--

js-funkce/funkce#predcasny-return-guard-clause

## --card-- free

Funkce vrací špatný výsledek a nevíš proč. Jak chybu najdeš breakpointem místo `console.log` na mnoha místech?

### --back--

Otevřu stránku s DevTools, v panelu Sources kliknu na číslo řádku uvnitř podezřelé funkce a spustím kód, který ji zavolá. Program se na breakpointu zastaví a v panelu Scope vidím všechny proměnné, které v tu chvíli existují, rozdělené na Local, Block, Script a Global. V panelu Call Stack vidím, kdo funkci zavolal, a kliknutím se podívám i do jeho proměnných. Krokováním pak najdu řádek, kde se hodnota rozejde s očekáváním, a v kódu nezůstane žádný zapomenutý výpis.

### --see--

js-funkce/scope-a-hoisting#lexikalni-rozsah-a-zasobnik-volani
