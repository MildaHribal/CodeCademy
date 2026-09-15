## --card-- output

Co vypíše tenhle kód?

```js
function createQueue() {
  const people = [];
  return (name) => {
    people.push(name);
    return people.length;
  };
}

const bakery = createQueue();
const postOffice = createQueue();
bakery('Ema');
bakery('Ota');
console.log(postOffice('Iva'));
```

### --expected--

1

### --why--

Myslíš si, že fronty sdílejí pole? Každé zavolání `createQueue` vytvoří nové prostředí s vlastním polem `people`. Pošta má ve frontě jen Ivu.

### --see--

js-funkce-hloubka/closures#kazde-zavolani-tovarny-vytvori-nove-prostredi

## --card-- output

Co vypíše tenhle kód?

```js
let currency = 'Kč';
const priceLabel = (amount) => `${amount} ${currency}`;

currency = 'EUR';
console.log(priceLabel(5));
```

### --expected--

5 EUR

### --why--

Closure si nepamatuje hodnotu z doby vzniku, ale samotnou proměnnou. V okamžiku volání je v `currency` už `'EUR'`.

### --see--

js-funkce-hloubka/closures#pamatuje-si-promennou-ne-hodnotu

## --card-- output

Co vypíše tenhle kód?

```js
const reminders = [];
for (var day = 1; day <= 2; day++) {
  reminders.push(() => `Den ${day}`);
}
console.log(reminders[1]());
```

### --expected--

Den 3

### --why--

`var` vytvoří jedinou proměnnou `day` pro všechna kola. Obě funkce ji sdílejí a po cyklu je v ní 3. S `let day` v hlavičce cyklu by vyšlo `Den 2`.

### --see--

js-funkce-hloubka/closures#var-v-cyklu-se-settimeout

## --card-- output

Co vypíše tenhle kód?

```js
'use strict';
const basket = {
  total: 0,
  add(price) {
    this.total += price;
  },
};

try {
  [89, 45].forEach(basket.add);
} catch (error) {
  console.log(error.name);
}
```

### --expected--

TypeError

### --why--

`basket.add` bez závorek předá jen funkci. `forEach` ji volá bez objektu, takže ve strict mode je `this` `undefined` a zápis do `this.total` spadne. Oprava: `(price) => basket.add(price)`.

### --see--

js-funkce-hloubka/this#ztracene-this-v-callbacku

## --card-- output

Co vypíše tenhle kód?

```js
const course = {
  title: 'JavaScript',
  label: () => this.title,
};

console.log(course.label());
```

### --expected--

undefined

### --why--

Šipková funkce nemá vlastní `this`, vezme ho z místa vzniku — tady z hlavního skriptu, kde je `this` globální objekt bez `title`. Metodu piš jako `label() { return this.title; }`.

### --see--

js-funkce-hloubka/this#sipkova-funkce-jako-metoda

## --card-- output

Co vypíše tenhle kód?

```js
'use strict';
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}

console.log(greet.call({ name: 'Iva' }, 'Dobrý den'));
```

### --expected--

Dobrý den, Iva

### --why--

`call` zavolá funkci hned, první argument se stane `this` a další argumenty dostane funkce za sebou.

### --see--

js-funkce-hloubka/this#call-apply-a-bind-this-natvrdo

## --card-- output

Co vypíše tenhle kód?

```js
const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);
const half = (n) => n / 2;
const addTen = (n) => n + 10;

console.log(pipe(addTen, half)(40));
```

### --expected--

25

### --why--

`pipe` jde zleva doprava: `addTen(40)` je 50 a `half(50)` je 25. Obrácené pořadí by dalo 30.

### --see--

js-funkce-hloubka/funkcionalni-styl#kompozice-vystup-jedne-funkce-je-vstupem-dalsi

## --card-- output

Co vypíše tenhle kód?

```js
function sumTo(n) {
  if (n === 0) {
    return 0;
  }
  n + sumTo(n - 1);
}

console.log(sumTo(3));
```

### --expected--

undefined

### --why--

Rekurzivní případ výsledek spočítá, ale nevrátí. Funkce bez `return` vrací `undefined`. Oprava: `return n + sumTo(n - 1);`.

### --see--

js-funkce-hloubka/funkcionalni-styl#zapomenuty-return-u-rekurzivniho-volani

## --card-- output

Co vypíše tenhle kód?

```js
function countDown(seconds) {
  return countDown(seconds - 1);
}

try {
  countDown(10);
} catch (error) {
  console.log(error.name);
}
```

### --expected--

RangeError

### --why--

Funkce nemá základní případ, volá se donekonečna a zásobník volání přeteče: `RangeError: Maximum call stack size exceeded`. Chybí třeba `if (seconds === 0) return 'Start';`.

### --see--

js-funkce-hloubka/funkcionalni-styl#chybejici-zakladni-pripad

## --card-- output

Co vypíše tenhle kód?

```js
function once(fn) {
  let done = false;
  let result;
  return () => {
    if (!done) {
      done = true;
      result = fn();
    }
    return result;
  };
}

let loads = 0;
const init = once(() => ++loads);
init();
init();
console.log(init(), loads);
```

### --expected--

1 1

### --why--

Obal si v prostředí pamatuje, že už proběhl, a každé další zavolání vrátí uložený výsledek. Funkce uvnitř proběhla jen jednou.

### --see--

js-funkce-hloubka/workshop-tovarny-funkci/007

## --card-- code js

Napiš továrnu `createCounter(start)`, která vrátí funkci. Každé její zavolání zvýší počet o jedna a vrátí ho; první zavolání vrátí `start + 1`. Dvě počítadla se nesmí ovlivňovat.

### --seed--

```js
function createCounter(start) {
}
```

### --test--

```js
const likes = createCounter(10);
const views = createCounter(0);
assert.equal(likes(), 11, 'createCounter(10)() má poprvé vrátit 11');
assert.equal(likes(), 12, 'druhé zavolání má vrátit 12');
assert.equal(views(), 1, 'createCounter(0)() má vrátit 1 — nezávisle na prvním počítadle');
```

### --solution--

```js
function createCounter(start) {
  let count = start;
  return () => {
    count += 1;
    return count;
  };
}
```

### --see--

js-funkce-hloubka/closures#closure-prostredi-prezije-navrat-funkce

## --card-- code js

Napiš `memoize(fn)` pro funkci jednoho argumentu: pro každý argument zavolá `fn` jen jednou a pak vrací uložený výsledek, i když je to `0` nebo `false`.

### --seed--

```js
function memoize(fn) {
}
```

### --test--

```js
let calls = 0;
const isFree = memoize((price) => {
  calls += 1;
  return price === 0;
});
assert.equal(isFree(120), false, 'isFree(120) má vrátit false');
isFree(120);
isFree(0);
isFree(0);
assert.equal(calls, 2, 'pro argumenty 120, 120, 0, 0 má fn proběhnout jen dvakrát — i výsledek false se ukládá');
```

### --solution--

```js
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg);
  };
}
```

### --see--

js-funkce-hloubka/workshop-tovarny-funkci/011

## --card-- code js

Napiš `debounce(fn, delay)`: vrácený obal zavolá `fn` až po `delay` ms od posledního zavolání, s jeho argumenty. Každý obal má vlastní časovač.

### --seed--

```js
function debounce(fn, delay) {
}
```

### --test--

```js
const saved = [];
const save = debounce((text) => saved.push(text), 50);
save('K');
save('Káva');
assert.deepEqual(saved, [], 'hned po zavolání se fn ještě nemá spustit');
await helpers.wait(300);
assert.deepEqual(saved, ['Káva'], "po chvíli klidu má fn proběhnout jednou s 'Káva'");
```

### --solution--

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

### --see--

js-funkce-hloubka/workshop-tovarny-funkci/015

## --card-- code js

Napiš `throttle(fn, interval)`: první zavolání obalu spustí `fn` hned, další zavolání během `interval` ms zahodí.

### --seed--

```js
function throttle(fn, interval) {
}
```

### --test--

```js
const clicks = [];
const refresh = throttle((source) => clicks.push(source), 400);
refresh('první');
refresh('druhé');
assert.deepEqual(clicks, ['první'], 'druhé zavolání během intervalu se má zahodit');
const other = throttle(() => clicks.push('jiný obal'), 400);
other();
assert.deepEqual(clicks, ['první', 'jiný obal'], 'jiný obal má vlastní stav a proběhne hned');
```

### --solution--

```js
function throttle(fn, interval) {
  let lastRun = -Infinity;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn(...args);
    }
  };
}
```

### --see--

js-funkce-hloubka/workshop-tovarny-funkci/017

## --card-- code js

Napiš rekurzivní funkci `folderSize(folder)`, která vrátí velikost složky: její `size` plus velikosti všech podsložek v `children`, na libovolné hloubce.

### --seed--

```js
function folderSize(folder) {
}
```

### --test--

```js
const photos = { size: 5, children: [
  { size: 20, children: [] },
  { size: 1, children: [{ size: 100, children: [] }] },
] };
assert.equal(folderSize({ size: 7, children: [] }), 7, 'folderSize(složka bez podsložek o velikosti 7) má vrátit 7');
assert.equal(folderSize(photos), 126, 'folderSize(5 + 20 + 1 + 100) má vrátit 126 — i podsložka ve třetí úrovni');
```

### --solution--

```js
function folderSize(folder) {
  return folder.children.reduce((sum, child) => sum + folderSize(child), folder.size);
}
```

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-funkce-ktera-vola-sama-sebe

## --card-- code js

Napiš `pipe(...fns)`: vrátí funkci, která hodnotu pošle přes funkce zleva doprava. Bez funkcí vrátí hodnotu beze změny.

### --seed--

```js
function pipe(...fns) {
}
```

### --test--

```js
const trim = (text) => text.trim();
const shout = (text) => `${text.toUpperCase()}!`;
assert.equal(pipe(trim, shout)('  sleva '), 'SLEVA!', "pipe(trim, shout)('  sleva ') má vrátit 'SLEVA!'");
assert.equal(pipe()('beze změny'), 'beze změny', 'pipe() bez funkcí má vrátit hodnotu beze změny');
```

### --solution--

```js
function pipe(...fns) {
  return (value) => fns.reduce((result, fn) => fn(result), value);
}
```

### --see--

js-funkce-hloubka/funkcionalni-styl#kompozice-vystup-jedne-funkce-je-vstupem-dalsi

## --card-- free

Co je closure? Uveď dva příklady, kde ho v praxi použiješ.

### --back--

Closure je funkce spolu s prostředím, ve kterém vznikla. Pamatuje si proměnné z tohoto prostředí — samotné proměnné, ne jejich hodnoty — i poté, co vnější funkce doběhla, a prostředí zůstává v paměti, dokud na funkci vede odkaz. V praxi na tom stojí továrny s vlastním stavem (počítadlo, košík se soukromými daty), obalující funkce jako `once`, `memoize` a `debounce` a každý posluchač události, který používá proměnné z okolí. Každé zavolání továrny vytvoří nové prostředí, takže výrobky se navzájem neovlivňují.

### --see--

js-funkce-hloubka/closures#closure-prostredi-prezije-navrat-funkce

## --card-- free

Jak určíš, co je `this` uvnitř funkce?

### --back--

`this` se neurčuje podle místa, kde je funkce napsaná, ale podle toho, jak se volá. Šipková funkce vlastní `this` nemá a bere ho z místa vzniku. Při volání s `new` je `this` nový objekt. Funkce z `bind` nebo volaná přes `call`/`apply` má `this`, které jí předáš. Při volání přes tečku `obj.metoda()` je `this` objekt před tečkou. Jinak je `this` ve strict mode `undefined`, mimo něj globální objekt.

### --see--

js-funkce-hloubka/this#jak-urcit-this-postup

## --card-- free

Proč metoda předaná jako callback (`setTimeout(player.play, 1000)`) ztratí `this` a jak to opravíš?

### --back--

`player.play` bez závorek předá jen odkaz na funkci, objekt `player` se nepředává. Kdo funkci později zavolá, zavolá ji bez objektu před tečkou, takže `this` není `player` — ve strict mode je `undefined` a čtení vlastnosti spadne s `TypeError`. Opravy jsou dvě: předat šipkovou funkci `() => player.play()`, která metodu zavolá přes tečku, nebo funkci s přivázaným `this` přes `player.play.bind(player)`.

### --see--

js-funkce-hloubka/this#metoda-predana-jako-callback

## --card-- free

Jaký je rozdíl mezi `call`, `apply` a `bind`?

### --back--

Všechny tři určí, co bude `this`. `call` funkci hned zavolá a argumenty dostane za sebou, `apply` ji taky hned zavolá, jen argumenty dostane v poli. `bind` nic nevolá: vrátí novou funkci, která má `this` (a případně první argumenty) přivázané natrvalo, a pozdější `call` ani další `bind` ho už nezmění. `bind` se hodí na předání metody jako callbacku; každé jeho zavolání ale vyrobí novou funkci, takže pro `removeEventListener` si ji musíš uložit.

### --see--

js-funkce-hloubka/this#call-apply-a-bind-this-natvrdo

## --card-- free

Jaký je rozdíl mezi `debounce` a `throttle`? Kdy použiješ který?

### --back--

`debounce` čeká na klid: každé zavolání odpočet zruší a funkce proběhne jednou až po skončení série, s argumenty posledního zavolání. Hodí se na vyhledávání během psaní nebo automatické ukládání konceptu. `throttle` pustí první zavolání hned a pak funkci spustí nejvýš jednou za interval, bez ohledu na počet zavolání. Hodí se na posouvání stránky, změnu velikosti okna nebo opakované klikání. Oba drží svůj stav (časovač, čas posledního spuštění) v closure, takže každý obal musí vzniknout jednou.

### --see--

js-funkce-hloubka/workshop-tovarny-funkci/017

## --card-- free

Co je čistá funkce a proč se ve frontendu tolik řeší?

### --back--

Čistá funkce vrátí pro stejné argumenty vždy stejný výsledek a nemá vedlejší efekty: nemění argumenty ani nic mimo sebe, nečte čas ani náhodu, nic nevypisuje. Taková funkce se snadno testuje, dá se bezpečně zavolat znovu, zapamatovat přes memoizaci a skládat s dalšími funkcemi. React vyžaduje, aby komponenty byly čisté, a stav mění jen vytvořením nových objektů. V praxi se výpočty drží v čistých funkcích a vedlejší efekty (zápis do stránky, požadavky na server) se soustředí na okraj programu.

### --see--

js-funkce-hloubka/funkcionalni-styl#cista-funkce-a-skryte-vedlejsi-efekty

## --card-- free

Co je rekurze, z čeho se skládá a kdy je lepší ji nepoužít?

### --back--

Rekurze je řešení, kdy funkce volá sama sebe na menší část úlohy. Má základní případ, kde zná odpověď hned a sama sebe už nevolá, a rekurzivní případ, který úlohu zmenší. Hodí se na vnořená data neznámé hloubky: stromy komentářů, menu kategorií, složky. Každé rozpracované volání čeká v zásobníku volání, a ten má omezenou velikost — u hodně hlubokých dat (desítky tisíc úrovní) přeteče s `RangeError: Maximum call stack size exceeded`. Pak je lepší cyklus s vlastním polem úkolů.

### --see--

js-funkce-hloubka/funkcionalni-styl#limit-zasobniku

## --card-- free

Proč funkce vytvořené v cyklu `for (var i = 0; …)` pracují s poslední hodnotou a jak to opravit?

### --back--

Funkce (callback časovače, posluchač kliknutí) se spustí až po doběhnutí cyklu a přes closure si pamatují proměnnou `i`, ne její hodnotu z daného kola. `var` vytvoří pro celou funkci jedinou proměnnou, takže všechny funkce sdílejí tutéž a po cyklu je v ní hodnota, která cyklus ukončila. Oprava je `let` v hlavičce cyklu, který pro každé kolo vytvoří novou proměnnou, nebo `for…of` s `const`.

### --see--

js-funkce-hloubka/closures#var-v-cyklu-se-settimeout
