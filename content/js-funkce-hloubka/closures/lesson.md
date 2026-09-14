# Closures

:::check pretest
Funkce `createGreeting` už doběhla. Co vypíše poslední řádek? Tipni si.

```js
function createGreeting(name) {
  return () => `Ahoj, ${name}`;
}

const greetEma = createGreeting('Ema');
console.log(greetEma());
```

### --expected--

Ahoj, Ema

### --why--

Vnitřní funkce vznikla uvnitř `createGreeting`, a proto vidí její parametr `name` — i poté, co `createGreeting` skončila. Proč to jde, vysvětlí první dvě části.
:::

:::check pretest
Proměnná `count` je uvnitř funkce, která už skončila. Vrácená funkce ji ale používá. Co se s `count` stane?

```js
function createCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}
```

### --answer--

Zanikne spolu s funkcí `createCounter`, vrácená funkce pak spadne.

#### --why--

Tak to platí pro proměnné, na které už nic neukazuje. Tady na `count` ukazuje vrácená funkce.

### --correct--

Zůstane v paměti, dokud existuje funkce, která ji používá.

#### --why--

Přesně tak. Vrácená funkce drží celé prostředí, ve kterém vznikla, a s ním i `count`.

### --answer--

Do vrácené funkce se zkopíruje hodnota `0` a dál se nemění.

#### --why--

Funkce si nebere kopii hodnoty, ale přístup k samotné proměnné. Uvidíš v části o proměnné a hodnotě.
:::

Closures potkáš v každé aplikaci, i když o nich nevíš: počítadlo „To se mi líbí"
u produktu, košík, který si drží položky, našeptávač, který čeká, až dopíšeš,
a mezipaměť, díky které se web neptá serveru pořád dokola. Na closures se ptá
skoro každý pohovor na frontend.

Začni problémem. Web kavárny má u každého nápoje tlačítko „To se mi líbí":

```js
let likes = 0;

function like() {
  likes += 1;
  return likes;
}
```

U jednoho nápoje to funguje. U dvou už ne — espresso i čaj by sdílely jedno
číslo. A proměnnou `likes` může přepsat kterýkoli kód na stránce, třeba
`likes = 1000`. Potřebuješ pro každý nápoj **vlastní** počítadlo, na které nikdo
zvenku nedosáhne. Proměnná uvnitř funkce by zvenku schovaná byla, jenže po
doběhnutí funkce by zmizela. Nebo ne?

> [!REMEMBER]
> **Funkce si pamatuje prostředí, ve kterém vznikla — samotné proměnné, ne jejich hodnoty.**
> Tomuhle spojení funkce a prostředí se říká closure.

## Funkce vidí proměnné z místa, kde vznikla

Z lekcí o funkcích víš, že vnitřní funkce vidí proměnné vnějších funkcí. Rozhoduje
místo, kde je funkce **napsaná** v kódu, ne místo, odkud ji voláš. Tomu se říká
lexikální rozsah platnosti (*lexical scope*).

:::live js
```js
const cafe = 'Kavárna Na Rohu';

function createReceipt() {
  const total = 128;

  function line() {
    return `${cafe}: ${total} Kč`;
  }

  return line();
}

console.log(createReceipt());
```
:::

Funkce `line` nemá žádnou vlastní proměnnou, a přesto vypíše název kavárny
i částku. `total` najde v `createReceipt`, `cafe` ještě o patro výš. Zkus přesunout
`const total = 128;` nad funkci `createReceipt` a sleduj, že se výpis nezmění.
Pak řádek smaž úplně a přečti si hlášku v konzoli.

:::check
Co vypíše poslední řádek?

```js
const city = 'Brno';

function outer() {
  const city = 'Olomouc';
  return () => city;
}

const read = outer();
console.log(read());
```

### --expected--

Olomouc

### --why--

Vnitřní funkce hledá `city` nejdřív v místě, kde vznikla — ve funkci `outer`. Tam je `'Olomouc'`, takže globální `'Brno'` už nehledá. Nezáleží na tom, že `read()` voláš až venku.

### --see--

js-funkce-hloubka/closures#funkce-vidi-promenne-z-mista-kde-vznikla
:::

## Closure: prostředí přežije návrat funkce

Teď to hlavní. Co když vnitřní funkci z vnější funkce **vrátíš**? Vnější funkce
doběhne, ale vrácená funkce pořád potřebuje její proměnné. JavaScript je proto
nezahodí: prostředí (*environment*) vnější funkce zůstane v paměti, dokud na něj
vede nějaká funkce. Funkci i s jejím prostředím se říká [[closure]] (česky se občas
píše „uzávěr").

:::live js
```js
function createCounter() {
  let count = 0;

  return () => {
    count += 1;
    return count;
  };
}

const likeEspresso = createCounter();

console.log(likeEspresso());
console.log(likeEspresso());
console.log(likeEspresso());
```
:::

`createCounter` proběhla jen jednou, a přesto `count` roste dál. Zkus připsat
`console.log(count);` na konec a přečti si hlášku: zvenku proměnná neexistuje,
vidí ji jen vrácená funkce. Takhle to vypadá v paměti:

:::memory
```js
function createCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}
const likeEspresso = createCounter();
likeEspresso();
likeEspresso();
```
--step-- 8 | createCounter skončila, její prostředí zůstalo
likeEspresso -> @fn
@fn: funkce () => { count += 1; … }, prostředí: @env
@env: prostředí createCounter { count: 0 }
--step-- 9 | volání mění count přímo v zachovaném prostředí
likeEspresso -> @fn
@fn: funkce () => { count += 1; … }, prostředí: @env
@env: prostředí createCounter { count: 1 }
--step-- 10 | další volání pokračuje od stejné proměnné
likeEspresso -> @fn
@fn: funkce () => { count += 1; … }, prostředí: @env
@env: prostředí createCounter { count: 2 }
:::

> [!REMEMBER]
> **Closure = funkce + prostředí, ve kterém vznikla.** Dokud funkce existuje,
> existují i proměnné, které z toho prostředí používá.

:::check
Co vypíše poslední řádek?

```js
function createStamp() {
  let stamps = 0;
  return () => {
    stamps += 2;
    return stamps;
  };
}

const stampCard = createStamp();
stampCard();
stampCard();
console.log(stampCard());
```

### --expected--

6

### --why--

`stampCard` pracuje pořád se stejnou proměnnou `stamps` ze zachovaného prostředí. Tři volání přičtou třikrát dvojku: 2, 4, 6.

### --see--

js-funkce-hloubka/closures#closure-prostredi-prezije-navrat-funkce
:::

## Pamatuje si proměnnou, ne hodnotu

Častá mylná představa: closure si při vzniku „vyfotí" hodnoty proměnných. Neudělá
to. Drží odkaz na samotnou proměnnou, takže vidí i pozdější změny.

:::live js predict
```js
let price = 89;
const showPrice = () => `Cena: ${price} Kč`;

price = 99;

console.log(showPrice());
```
--question-- Co vypíše `console.log`?
--expected-- Cena: 99 Kč
--why-- Funkce `showPrice` vznikla, když cena byla 89, ale nezapamatovala si číslo 89 — pamatuje si proměnnou `price`. V okamžiku volání v ní je 99. Zkus přesunout řádek `price = 99;` pod `console.log` a sleduj rozdíl.
:::

Z toho plyne i druhá věc: **dvě funkce z jednoho prostředí sdílejí tytéž proměnné.**
Když jedna proměnnou změní, druhá změnu uvidí.

:::check
Co vypíše poslední řádek?

```js
function createWallet() {
  let balance = 500;
  const pay = (amount) => {
    balance -= amount;
  };
  const show = () => balance;
  return { pay, show };
}

const wallet = createWallet();
wallet.pay(120);
console.log(wallet.show());
```

### --expected--

380

### --why--

`pay` i `show` vznikly v jednom volání `createWallet`, takže sdílejí jednu proměnnou `balance`. `pay` ji sníží na 380 a `show` čte tutéž proměnnou.

### --see--

js-funkce-hloubka/closures#pamatuje-si-promennou-ne-hodnotu
:::

## Každé zavolání továrny vytvoří nové prostředí

Funkce, která vyrábí a vrací jiné funkce, je [[továrna funkcí]] (*function factory*).
`createCounter` je továrna. Každé její zavolání spustí tělo znovu, a tím vznikne
**nové** prostředí s novou proměnnou `count`.

:::live js predict
```js
function createCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}

const espresso = createCounter();
const tea = createCounter();

espresso();
espresso();
console.log(espresso(), tea());
```
--question-- Co vypíše `console.log`? Napiš dvě čísla oddělená mezerou.
--expected-- 3 1
--why-- `espresso` a `tea` vznikly dvěma voláními továrny, takže každá má vlastní prostředí a vlastní `count`. Tři volání `espresso` se `tea` nijak nedotknou. Přesně tohle chybělo počítadlu „To se mi líbí" ze začátku lekce.
:::

> [!PITFALL]
> **Továrna zavolaná při každém použití vrací pořád totéž číslo.** Kód
> `button.onclick = () => console.log(createCounter()());` vypíše po každém kliknutí `1`,
> protože každé kliknutí vyrobí nové počítadlo s novým `count`. Oprava: továrnu
> zavolej jednou, výsledek ulož do proměnné (`const likeTea = createCounter();`)
> a v posluchači volej už jen `likeTea()`.

:::check
Vytvořil jsi `const a = createCounter();` a `const b = a;`. Pak zavoláš `a()`, `a()` a `b()`. Co vrátí `b()`?

### --expected--

3

### --why--

`b = a` nevolá továrnu, jen zkopíruje odkaz na tutéž funkci — stejně jako u polí. `a` i `b` jsou jedna funkce s jedním prostředím, takže třetí volání vrátí 3. Nové prostředí vzniká jen zavoláním `createCounter()`.

### --see--

js-funkce-hloubka/closures#kazde-zavolani-tovarny-vytvori-nove-prostredi
:::

## Soukromý stav

Proměnné v prostředí továrny nejsou zvenku vidět vůbec. Když továrna vrátí objekt
s několika funkcemi, dostaneš [[soukromý stav]] (*private state*): data, ke kterým
se dá dostat jen přes funkce, které k tomu připravíš.

:::live js
```js
function createCart() {
  const items = [];

  return {
    add(name, price) {
      items.push({ name, price });
    },
    total() {
      return items.reduce((sum, item) => sum + item.price, 0);
    },
    count() {
      return items.length;
    },
  };
}

const cart = createCart();
cart.add('Espresso', 55);
cart.add('Croissant', 49);

console.log(cart.total(), cart.count());
console.log(cart.items);
```
:::

`cart.items` je `undefined`: pole `items` není vlastnost objektu, je to proměnná
v prostředí továrny. Nikdo ho nevyprázdní omylem ani do něj nevloží nesmysl — jediná
cesta vede přes `add`. Zkus přidat metodu `clear`, která košík vyprázdní, a ověř
ji výpisem `cart.count()`.

> [!NOTE]
> Metody tu k datům přistupují přes closure, ne přes `this`. Jak funguje `this`,
> vysvětlí lekce [`this`](see:js-funkce-hloubka/this). Soukromá pole tříd (`#items`)
> přijdou v sekci o třídách.

:::explain
Vysvětli vlastními slovy, co je closure a proč `cart.total()` položky vidí, i když `cart.items` je `undefined`.

## --model--

Closure je funkce spolu s prostředím, ve kterém vznikla. Metody `add` a `total` vznikly uvnitř volání `createCart`, takže vidí jeho proměnnou `items` a to prostředí zůstává v paměti i po doběhnutí továrny. Pole ale není vlastností vráceného objektu, proto `cart.items` je `undefined`. Dostat se k němu dá jen přes funkce, které továrna vrátila, a tak je stav soukromý.

## --checklist--

- Closure je funkce spolu s prostředím, ve kterém vznikla.
- Prostředí továrny zůstane v paměti, dokud na něj vede nějaká vrácená funkce.
- `items` je proměnná v prostředí, ne vlastnost objektu, proto `cart.items` je `undefined`.
- K soukromému stavu se dá dostat jen přes vrácené funkce.
:::

:::check
Jak může kód mimo `createCart` změnit pole `items` konkrétního košíku?

### --answer--

Zápisem `cart.items = []`.

#### --why--

Tím jen vytvoříš novou vlastnost objektu `cart`. Proměnná `items` v prostředí továrny o ní neví.

### --correct--

Jen voláním funkcí, které továrna vrátila, třeba `cart.add(…)`.

#### --why--

Proměnná `items` je vidět jen funkcím, které vznikly uvnitř `createCart`. Jiná cesta k ní nevede.

### --answer--

Novým zavoláním `createCart()`.

#### --why--

Nové zavolání vytvoří nové prostředí s novým prázdným polem. Původní košík se nezmění.

### --see--

js-funkce-hloubka/closures#soukromy-stav
:::

## `var` v cyklu se `setTimeout`

Tohle je nejznámější past s closures. `setTimeout` spustí funkci **později** — až
doběhne všechen kód, který právě běží, tedy i celý cyklus.

:::live js predict
```js
for (var seat = 1; seat <= 3; seat++) {
  setTimeout(() => console.log(`Sedadlo ${seat}`), 0);
}
```
--question-- Co se vypíše? Napiš všechny řádky.
--expected--
```text
Sedadlo 4
Sedadlo 4
Sedadlo 4
```
--why-- `var` vytvoří jednu proměnnou `seat` pro celou funkci (tady pro celý skript), ne pro každé kolo cyklu. Všechny tři šipkové funkce drží tutéž proměnnou. Než se spustí, cyklus doběhne a `seat` je `4` — právě to ukončilo cyklus.
:::

Teď stejný kód s jediným rozdílem, `let` místo `var`:

:::live js predict
```js
for (let seat = 1; seat <= 3; seat++) {
  setTimeout(() => console.log(`Sedadlo ${seat}`), 0);
}
```
--question-- Co se vypíše teď? Napiš všechny řádky.
--expected--
```text
Sedadlo 1
Sedadlo 2
Sedadlo 3
```
--why-- `let` v hlavičce `for` vytvoří **pro každé kolo novou proměnnou** `seat` s hodnotou z toho kola. Každá šipková funkce tak drží vlastní proměnnou. Zkus zvýšit horní mez na 5.
:::

:::memory
```js
for (let seat = 1; seat <= 3; seat++) {
  setTimeout(() => console.log(seat), 0);
}
```
--step-- 2 | 1. kolo: vlastní prostředí se seat 1 a funkce, která ho drží
@t1: funkce z 1. kola, prostředí: @k1
@k1: { seat: 1 }
--step-- 2 | 2. kolo: nové prostředí, první zůstává
@t1: funkce z 1. kola, prostředí: @k1
@t2: funkce z 2. kola, prostředí: @k2
@k1: { seat: 1 }
@k2: { seat: 2 }
--step-- 3 | po cyklu: tři funkce, tři prostředí
@t1: funkce z 1. kola, prostředí: @k1
@t2: funkce z 2. kola, prostředí: @k2
@t3: funkce z 3. kola, prostředí: @k3
@k1: { seat: 1 }
@k2: { seat: 2 }
@k3: { seat: 3 }
:::

S `var` by na obrázku bylo jediné prostředí `{ seat: 4 }` a všechny tři funkce by
ukazovaly na ně.

> [!PITFALL]
> **Funkce vytvořené v cyklu s `var` vidí všechny poslední hodnotu.** Příznak:
> všechna tlačítka nebo časovače pracují s poslední položkou, nebo s `undefined`,
> když se `items[i]` čte za koncem pole. Oprava: v hlavičce cyklu `let` (nebo
> `for…of` s `const`). Ve starém kódu uvidíš místo toho pomocnou funkci, která
> hodnotu dostane jako parametr.

:::check
Co vrátí `buttons[0]()`?

```js
const buttons = [];
for (var i = 0; i < 2; i++) {
  buttons.push(() => i);
}
```

### --expected--

2

### --why--

Obě funkce drží jedinou proměnnou `i` deklarovanou přes `var`. Po cyklu je v ní `2`, protože právě při dvojce podmínka `i < 2` přestala platit. S `let` by `buttons[0]()` vrátilo `0`.

### --see--

js-funkce-hloubka/closures#var-v-cyklu-se-settimeout
:::

## Closure a paměť

Prohlížeč maže z paměti hodnoty, na které už nic nevede (*garbage collection*).
Closure na své prostředí vede. Dokud je funkce **dosažitelná** — uložená
v proměnné, v posluchači události, v časovači nebo v poli —, zůstanou v paměti
i proměnné, které z prostředí používá.

Většinou je to přesně to, co chceš. Problém nastane ve dvou situacích:

- **Mezipaměť bez limitu.** Funkce si ukládá výsledky do objektu nebo `Map`
  v prostředí a nikdy nic nesmaže. Po hodinách práce drží tisíce záznamů.
- **Posluchač, který nikdo neodebere.** Funkce předaná jako posluchač drží velké
  pole dat. Dokud posluchač visí na prvku, pole se neuvolní.

:::live js
```js
function createSearch(allStations) {
  const cache = new Map();

  return (query) => {
    if (!cache.has(query)) {
      cache.set(query, allStations.filter((name) => name.includes(query)));
    }
    return `${cache.get(query).length} výsledků, v paměti ${cache.size} dotazů`;
  };
}

const search = createSearch(['Praha hl. n.', 'Praha-Smíchov', 'Brno hl. n.']);
console.log(search('Praha'));
console.log(search('Brno'));
console.log(search('Praha'));
```
:::

Každý nový dotaz přidá do `cache` záznam a pole `allStations` zůstává v paměti,
dokud existuje `search`. Zkus přidat dalších pět různých dotazů a sleduj velikost
mezipaměti. Když `search` přestaneš potřebovat, stačí zahodit odkaz na ni
(`search = null` u proměnné `let`) a prohlížeč uvolní prostředí i s polem.

:::check
Kdy může prohlížeč uvolnit z paměti pole `allStations` z ukázky?

### --answer--

Hned po doběhnutí `createSearch`, protože je to parametr.

#### --why--

Parametr je součást prostředí. Vrácená funkce ho používá, takže po doběhnutí továrny zůstává.

### --correct--

Až na funkci `search` nepovede žádný odkaz.

#### --why--

Prostředí žije, dokud je dosažitelná některá funkce, která z něj vznikla. Když zmizí poslední odkaz, uvolní se i pole.

### --answer--

Nikdy, closures z paměti nemizí.

#### --why--

Closure je obyčejná hodnota. Když na ni nic nevede, uklidí se jako jakýkoli jiný objekt.

### --see--

js-funkce-hloubka/closures#closure-a-pamet
:::

## Typické chyby a pasti

### Stav mimo továrnu

Nejzákeřnější chyba vypadá jako správně napsaná továrna. Liší se jen tím, kde je
deklarovaná proměnná:

:::live js predict
```js
let count = 0;

function createCounter() {
  return () => {
    count += 1;
    return count;
  };
}

const espresso = createCounter();
const tea = createCounter();
espresso();
espresso();
console.log(tea());
```
--question-- Co vypíše `console.log(tea())`?
--expected-- 3
--why-- `count` není v prostředí `createCounter`, ale o patro výš, ve skriptu. Všechny funkce, které továrna vyrobí, proto sdílejí jedinou proměnnou. Každé zavolání továrny sice vytvoří nové prostředí, jenže prázdné. Přesuň `let count = 0;` do těla `createCounter` a výsledek bude `1`.
:::

> [!PITFALL]
> **Stav deklarovaný nad továrnou sdílejí všechny její výrobky.** Příznak: dvě
> „nezávislá" počítadla, časovače nebo mezipaměti se navzájem přepisují — třeba
> psaní do jednoho vyhledávacího pole zruší hledání v druhém. Oprava: proměnnou se
> stavem deklaruj **uvnitř** těla továrny.

### Továrna zavolaná při každém použití

> [!PITFALL]
> **`createCounter()()` vrací pokaždé `1`.** Každé zavolání továrny vyrobí nový stav.
> Příznak: počítadlo, mezipaměť nebo debounce „nefunguje", jako by si nic
> nepamatovalo. Oprava: továrnu zavolej jednou mimo posluchač a výsledek si ulož.

### `var` ve smyčce

> [!PITFALL]
> **Časovače a posluchače vytvořené v cyklu s `var` vidí poslední hodnotu.** Příznak:
> všechny vypíšou totéž číslo, nebo `undefined` při čtení `items[i]`. Oprava: `let`
> v hlavičce cyklu nebo `for…of`.

:::check
Dvě vyhledávací pole používají `createDelay()` a navzájem si ruší časovač. Kde je nejspíš chyba?

```js
let timer;

function createDelay(ms) {
  return (fn) => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}
```

### --answer--

`clearTimeout` se má volat až po `setTimeout`.

#### --why--

Pořadí je v pořádku: nejdřív zrušit starý časovač, pak nastavit nový. Problém je v tom, komu `timer` patří.

### --correct--

`let timer;` je nad továrnou, takže všechny vyrobené funkce sdílejí jeden časovač.

#### --why--

Každé pole potřebuje vlastní `timer`. Stačí přesunout deklaraci do těla `createDelay` a každé zavolání továrny dostane vlastní proměnnou.

### --answer--

Šipková funkce si časovač nepamatuje, musí to být `function`.

#### --why--

Closures vytvářejí obě formy funkcí stejně. Rozhoduje, v jakém prostředí je proměnná deklarovaná.

### --see--

js-funkce-hloubka/closures#stav-mimo-tovarnu
:::

## Kde to najdeš v MDN

- [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) — celý průvodce s počítadly, „soukromými metodami" a částí *Creating closures in loops: A common mistake*, kde je past s cyklem.
- [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) — rozdíl blokového rozsahu proti `var`.
- [setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) — co přesně dělá druhý argument a proč se funkce spustí až po doběhnutí aktuálního kódu.
- [Memory management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management) — jak prohlížeč pozná, že hodnotu už nikdo nepotřebuje.

Ve workshopu z těchhle vzorů postavíš našeptávač vlakových stanic: počítadla,
mezipaměť a funkce, které počkají, až uživatel dopíše.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function createTicketNumbers(prefix) {
  let next = 100;
  return () => `${prefix}-${next++}`;
}

const praha = createTicketNumbers('PHA');
const brno = createTicketNumbers('BRN');
praha();
console.log(praha(), brno());
```

### --expected--

PHA-101 BRN-100

### --why--

Každé zavolání továrny má vlastní `prefix` i vlastní `next`. `praha` už jednou číslo vydala, takže podruhé vrátí `PHA-101`. `brno` začíná od vlastní stovky. `next++` vrací hodnotu před zvýšením.

### --see--

js-funkce-hloubka/closures#kazde-zavolani-tovarny-vytvori-nove-prostredi

## --question--

Co vypíše poslední řádek?

```js
const labels = [];
let discount = 10;

for (const product of ['Káva', 'Čaj']) {
  labels.push(() => `${product}: sleva ${discount} %`);
}

discount = 20;
console.log(labels[0]());
```

### --expected--

Káva: sleva 20 %

### --why--

`product` je v každém kole nová proměnná, takže první funkce drží `'Káva'`. `discount` je ale jedna proměnná nad cyklem a closure čte její aktuální hodnotu v okamžiku volání — tedy `20`, ne `10`.

### --see--

js-funkce-hloubka/closures#pamatuje-si-promennou-ne-hodnotu

## --question--

Kód má do konzole vypsat `Linka 1`, `Linka 2`, `Linka 3`, ale vypíše třikrát `Linka 4`. Která úprava to opraví?

```js
for (var line = 1; line <= 3; line++) {
  setTimeout(() => console.log(`Linka ${line}`), 0);
}
```

### --answer--

Změnit druhý argument `setTimeout` z `0` na `100`.

#### --why--

Delší čekání nic nezmění: funkce se spustí po cyklu tak jako tak a všechny drží jednu proměnnou.

### --correct--

Napsat v hlavičce cyklu `let line = 1` místo `var line = 1`.

#### --why--

`let` vytvoří v každém kole novou proměnnou, takže každá funkce drží vlastní číslo linky.

### --answer--

Přepsat šipkovou funkci na `function () { … }`.

#### --why--

Obě formy funkce si prostředí pamatují stejně. Rozhoduje, kolik proměnných `line` existuje.

### --see--

js-funkce-hloubka/closures#var-v-cyklu-se-settimeout
