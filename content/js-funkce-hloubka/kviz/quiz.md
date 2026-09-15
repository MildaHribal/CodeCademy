---
pass: 0.8
---

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function createStock(initial) {
  let left = initial;
  return {
    sell: () => --left,
    restock: (amount) => {
      left += amount;
      return left;
    },
  };
}

const shop = createStock(5);
shop.sell();
shop.restock(3);
console.log(shop.sell());
```

### --expected--

6

### --why--

`sell` i `restock` vznikly v jednom zavolání `createStock`, takže sdílejí jednu proměnnou `left`: 5 → 4 → 7 → 6. `--left` nejdřív odečte a pak vrátí novou hodnotu.

### --see--

js-funkce-hloubka/closures#pamatuje-si-promennou-ne-hodnotu

## --question--

Kolega obalil funkci pro aktuální čas do `memoize`, aby „šetřil výkon": `const now = memoize(() => new Date().toLocaleTimeString('cs'))`. Co se stane?

### --answer--

Nic zvláštního, `now()` vrátí pokaždé aktuální čas, jen rychleji.

#### --why--

Mezipaměť vrátí uložený výsledek, kdykoli ji zavoláš se stejným argumentem. Zamysli se, co tu je argumentem a jestli se mění.

### --correct--

`now()` vrátí pořád čas prvního zavolání, protože výsledek se uloží a funkce se už nespustí.

#### --why--

Funkce není čistá: pro stejný vstup (žádný argument) vrací pokaždé jiný výsledek. Memoizace se proto hodí jen pro čisté funkce.

### --answer--

Spadne, protože `memoize` funguje jen s funkcí, která má parametr.

#### --why--

Obal zavolá funkci i bez argumentu a klíčem bude `undefined`. Chyba nevznikne, problém je jinde.

### --see--

js-funkce-hloubka/funkcionalni-styl#cista-funkce-a-skryte-vedlejsi-efekty

## --question--

Co vypíše tenhle kód?

```js
'use strict';
const cart = {
  items: ['káva', 'čaj'],
  count() {
    return this.items.length;
  },
};

const { count } = cart;
try {
  console.log(count());
} catch (error) {
  console.log(error.name);
}
```

### --expected--

TypeError

### --why--

Destrukturalizace vytáhne z objektu jen funkci, stejně jako `const count = cart.count`. Volání `count()` nemá objekt před tečkou, ve strict mode je `this` `undefined` a čtení `this.items` vyhodí `TypeError`.

### --see--

js-funkce-hloubka/this#volani-bez-tecky-a-strict-mode

## --question--

Co vrátí `show()`?

```js
'use strict';
function describe() {
  return this.name;
}

const show = describe.bind({ name: 'Brno' }).bind({ name: 'Ostrava' });
```

### --answer--

`'Ostrava'`, protože poslední `bind` přepíše ten předchozí.

#### --why--

Myslíš si, že `bind` jde přepsat? Funkce, kterou vrátil první `bind`, má `this` přivázané natrvalo.

### --correct--

`'Brno'`, protože `this` z prvního `bind` už nic nezmění.

#### --why--

Druhé `bind` obalí funkci, která `this` ignoruje a volá `describe` vždy s `{ name: 'Brno' }`.

### --answer--

`undefined`, protože se `show` volá bez tečky.

#### --why--

U funkce z `bind` nerozhoduje, jak ji zavoláš. `this` jí přivázal `bind`.

### --see--

js-funkce-hloubka/this#call-apply-a-bind-this-natvrdo

## --question--

Automatické ukládání konceptu používá `const save = debounce(saveDraft, 1000)` a volá `save()` při každém stisku klávesy. Uživatel píše v čase 0 ms, 400 ms a 900 ms a pak přestane. V kolikáté milisekundě se `saveDraft` spustí? Napiš číslo.

### --expected--

1900

### --why--

Každé zavolání obalu zruší starý časovač a naplánuje nový na 1000 ms. Poslední zavolání bylo v 900 ms, takže `saveDraft` proběhne jednou, v 1900 ms. Starší časovače se zrušily.

### --see--

js-funkce-hloubka/workshop-tovarny-funkci/015

## --question--

Tlačítko „Nahoru" se má ukázat, když uživatel sjede stránkou níž. Kontrola se volá při každém posunu, desítkykrát za sekundu, a má reagovat průběžně i během posouvání. Který obal použiješ?

### --answer--

`debounce`, aby se kontrola spustila až po zastavení.

#### --why--

`debounce` čeká na klid. Při plynulém posouvání by se tlačítko ukázalo až po zastavení, ne průběžně.

### --correct--

`throttle`, aby se kontrola spustila nejvýš jednou za interval.

#### --why--

`throttle` pustí první zavolání hned a pak nejvýš jedno za interval, takže reaguje i během posouvání a přitom nezahltí prohlížeč.

### --answer--

`once`, aby se kontrola spustila jen jednou.

#### --why--

Po prvním posunu by se kontrola už nikdy nespustila a tlačítko by nezmizelo, když se uživatel vrátí nahoru.

### --see--

js-funkce-hloubka/workshop-tovarny-funkci/017

## --question--

Co vypíše poslední řádek?

```js
function flatten(list) {
  return list.flatMap((item) => (Array.isArray(item) ? flatten(item) : [item]));
}

console.log(flatten([1, [2, [3, [4]]], 5]).length);
```

### --expected--

5

### --why--

Když je položka pole, funkce ho zploští stejnou funkcí, jinak vrátí položku v poli. Základní případ je položka, která pole není. Výsledek je `[1, 2, 3, 4, 5]`.

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-funkce-ktera-vola-sama-sebe

## --question--

Knihovna nabízí `compose(f, g)`, která volá funkce zprava doleva, jako vnořená volání. Který zápis dá stejný výsledek jako `compose(format, addVat)(price)`?

### --answer--

`pipe(format, addVat)(price)`

#### --why--

`pipe` volá funkce zleva doprava, takže by nejdřív formátoval a pak přičítal DPH k textu.

### --correct--

`pipe(addVat, format)(price)`

#### --why--

`compose` jde zprava doleva: nejdřív `addVat`, pak `format`, tedy `format(addVat(price))`. `pipe` má stejné pořadí zapsané zleva.

### --answer--

`addVat(format(price))`

#### --why--

Tady se nejdřív formátuje a DPH se přičítá až k textu. Vnořená volání se čtou zevnitř ven.

### --see--

js-funkce-hloubka/funkcionalni-styl#kompozice-vystup-jedne-funkce-je-vstupem-dalsi

## --question--

Chrome hlásí příliš hlubokou rekurzi jako `RangeError: Maximum call stack size exceeded`. Firefox používá jiný typ chyby. Najdi v anglické dokumentaci MDN stránku o této chybě a napiš, jak se ve Firefoxu jmenuje **typ** chyby (slovo před dvojtečkou).

### --expected--

InternalError

### --accept--

InternalError: too much recursion

### --why--

Stránka [InternalError: too much recursion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion) ukazuje hlášky jednotlivých prohlížečů. Firefox hlásí `InternalError: too much recursion`, Chrome a Safari `RangeError: Maximum call stack size exceeded`. Příčina je vždy stejná: rekurze bez základního případu nebo příliš hluboká data.

### --see--

js-funkce-hloubka/funkcionalni-styl#limit-zasobniku

## --question--

Co vypíše poslední řádek?

```js
const prices = [30, 5, 100];
prices.sort();
console.log(prices[0]);
```

### --expected--

100

### --why--

Myslíš si, že `sort` řadí čísla podle velikosti? Bez porovnávací funkce je převede na text a řadí znak po znaku: `'100'` < `'30'` < `'5'`. A protože `sort` mění původní pole, je `100` v `prices` na indexu 0.

### --see--

js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce

## --question--

Co vypíše poslední řádek?

```js
const settings = { theme: 'dark', notify: { email: true } };
const draft = { ...settings };
draft.notify.email = false;
console.log(settings.notify.email);
```

### --expected--

false

### --why--

Spread udělá mělkou kopii: nový je jen vnější objekt, `notify` je v `draft` i v `settings` tentýž objekt. Změna přes kopii je proto vidět i v originálu. Stejně se chová i kopie pole přes `[...a]`.

### --see--

js-pole/co-je-pole#melka-kopie

## --question--

Co vypíše tenhle kód? Napiš jen jméno chyby.

```js
function greet() {
  return message;
}

try {
  console.log(greet());
} catch (error) {
  console.log(error.name);
}
let message = 'Ahoj';
```

### --expected--

ReferenceError

### --why--

`let message` je sice deklarované ve stejném rozsahu, ale až pod voláním. Do řádku s deklarací je proměnná v TDZ a čtení vyhodí `ReferenceError: Cannot access 'message' before initialization`. Funkce ji najde správně, jen příliš brzy.

### --see--

js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

## --question--

Co vypíše poslední řádek?

```js
const doubled = [1, 2, 3].map((n) => {
  n * 2;
});
console.log(doubled);
```

### --expected--

[undefined, undefined, undefined]

### --why--

Šipková funkce se složenými závorkami má tělo a bez `return` vrací `undefined`. `map` tak dostane tři `undefined`. Oprava: `(n) => n * 2`, nebo `return n * 2;`.

### --see--

js-pole/metody-pole-do-hloubky#zapomenuty-return-ve-slozenych-zavorkach

# --code-- Katalog outdoorového e-shopu

## --file-- catalog.js

```js
// Katalog e-shopu s outdoorovým vybavením: menu kategorií a vyhledávání.
var categoryTree = {
  name: 'Vše',
  count: 0,
  children: [
    { name: 'Stany', count: 14, children: [] },
    {
      name: 'Oblečení',
      count: 3,
      children: [
        { name: 'Bundy', count: 22, children: [] },
        { name: 'Boty', count: 17, children: [] },
      ],
    },
  ],
};

function totalCount(category) {
  var sum = category.count;
  for (var i = 0; i < category.children.length; i++) {
    sum = sum + totalCount(category.children[i]);
  }
  return sum;
}

function findPath(category, name) {
  if (category.name === name) {
    return [category.name];
  }
  for (var i = 0; i < category.children.length; i++) {
    var path = findPath(category.children[i], name);
    if (path) {
      return [category.name].concat(path);
    }
  }
  return null;
}

var searchBox = {
  lastQuery: '',
  timer: null,
  results: [],
  search: function (query) {
    this.lastQuery = query;
    this.results = findPath(categoryTree, query) || [];
  },
  schedule: function (query) {
    var self = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(function () {
      self.search(query);
    }, 300);
  },
};

function createBadge(label) {
  var clicks = 0;
  return {
    click: function () {
      clicks = clicks + 1;
      return label + ' (' + clicks + ')';
    },
    reset: function () {
      clicks = 0;
    },
  };
}

var tents = createBadge('Stany');
var boots = createBadge('Boty');
tents.click();
tents.click();

var handlers = [];
for (var h = 0; h < 3; h++) {
  handlers.push(function () {
    return h;
  });
}

var runSearch = searchBox.search;
```

## --question--

Co vrátí `totalCount(categoryTree)` z řádku 18?

### --expected--

56

### --why--

Funkce sečte počet vlastní kategorie a rekurzivně všech podkategorií: 0 + 14 + (3 + 22 + 17) = 56. Kategorie bez `children` cyklus přeskočí, to je základní případ.

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-funkce-ktera-vola-sama-sebe

## --question--

Proč je na řádku 48 `var self = this;` a na řádku 51 `self.search(query)` místo `this.search(query)`?

### --answer--

Aby `setTimeout` dostal kopii objektu `searchBox`, kterou nejde přepsat.

#### --why--

`var self = this` nic nekopíruje, jen uloží odkaz na tentýž objekt do další proměnné.

### --correct--

Obyčejná funkce na řádku 50 má vlastní `this` a časovač ji zavolá bez objektu, takže `this.search` by tam nefungovalo.

#### --why--

`self` je proměnná, kterou si vnitřní funkce pamatuje přes closure. Dnes by se místo toho napsala šipková funkce, která `this` převezme z metody `schedule`.

### --answer--

Protože `clearTimeout` na řádku 49 `this` vynuluje.

#### --why--

`clearTimeout` jen zruší naplánovaný časovač, na `this` nemá žádný vliv.

### --see--

js-funkce-hloubka/this#obycejna-funkce-uvnitr-metody

## --question--

Co vrátí `boots.click()`, když ho zavoláš po řádku 72?

### --expected--

Boty (1)

### --accept--

'Boty (1)'

### --why--

`tents` a `boots` vznikly dvěma zavoláními `createBadge` (řádky 69 a 70), takže každý má vlastní proměnnou `clicks`. Dvě kliknutí na `tents` se `boots` netýkají.

### --see--

js-funkce-hloubka/closures#kazde-zavolani-tovarny-vytvori-nove-prostredi

## --question--

Co vrátí `handlers[0]()` po cyklu na řádcích 75–79?

### --expected--

3

### --why--

`var h` je jedna proměnná pro celý soubor a všechny tři funkce ji sdílejí. Volají se až po cyklu, kdy je `h` rovno 3. S `let h` v hlavičce cyklu by `handlers[0]()` vrátilo 0.

### --see--

js-funkce-hloubka/closures#var-v-cyklu-se-settimeout

## --question--

Soubor neběží ve strict mode. Co bude v `searchBox.lastQuery`, když po řádku 81 zavoláš `runSearch('Stany')`?

### --answer--

`'Stany'`

#### --why--

`runSearch` je jen funkce vytažená z objektu. Podívej se, na jakém objektu se na řádku 44 zapisuje `lastQuery`, když funkci voláš bez tečky.

### --correct--

Prázdný řetězec `''` — zápis na řádku 44 šel do globálního objektu.

#### --why--

Volání bez tečky mimo strict mode dosadí za `this` globální objekt `window`. `lastQuery` i `results` se zapsaly do něj a `searchBox` zůstal beze změny. Ve strict mode by volání spadlo s `TypeError`.

### --answer--

Volání spadne s `TypeError`, takže se nic nezmění.

#### --why--

Tak by to dopadlo ve strict mode. Tady je `this` při volání bez tečky globální objekt a zápis projde bez chyby.

### --see--

js-funkce-hloubka/this#volani-bez-tecky-a-strict-mode
