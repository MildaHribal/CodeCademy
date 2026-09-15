# Promise

:::check pretest
Co vypíše tenhle kód? Napiš písmena oddělená mezerou. Tipni si, i když si nejsi jistý.

```js
const order = new Promise((resolve) => {
  console.log('A');
  resolve('zaplaceno');
});

order.then(() => console.log('B'));
console.log('C');
```

### --expected--

A C B

### --why--

Funkce předaná do `new Promise` se spustí hned, synchronně, proto `A` přijde první. Callback `then` je ale vždycky mikroúloha — i když je Promise už splněná. Proto `C` předběhne `B`. Obojí vysvětlí první dvě části lekce.
:::

:::check pretest
Aplikace načítá tři věci najednou přes `Promise.all`: profil, objednávky a doporučené zboží. Doporučené zboží selže. Co dostane kód, který na `Promise.all` čeká?

### --answer--

Profil a objednávky, místo doporučeného zboží `undefined`.

#### --why--

Tak se chová jiná metoda. Která, uvidíš v části o víc Promise najednou.

### --correct--

Chybu. Výsledky profilu a objednávek se k němu nedostanou.

#### --why--

`Promise.all` je „všechno, nebo nic". Pro „dej mi, co se povedlo" existuje jiná metoda, uvidíš ji v části o víc Promise najednou.

### --answer--

Nic, `Promise.all` bude čekat donekonečna.

#### --why--

Selhání se nezamlčí ani nečeká. Co s ním `Promise.all` udělá, uvidíš v části o víc Promise najednou.
:::

V e-shopu po kliknutí na **Zaplatit** musíš počkat na platební bránu, pak uložit objednávku a nakonec poslat e-mail. Každý krok trvá neznámou dobu a každý může selhat. Se samotnými callbacky to vypadá takhle:

```js
payOrder(cart, (payError, payment) => {
  if (payError) return showError(payError);
  saveOrder(payment, (saveError, order) => {
    if (saveError) return showError(saveError);
    sendEmail(order, (mailError) => {
      if (mailError) return showError(mailError);
      showThankYou(order);
    });
  });
});
```

Každý další krok je o úroveň hlouběji a ošetření chyby se opakuje na každém patře. Tomu se říká *callback hell*. Knihovny a prohlížeč proto dnes místo callbacku vracejí Promise.

> [!REMEMBER]
> **Promise je objekt, který zastupuje výsledek, jenž ještě není hotový.** Jako účtenka u výdejního okénka: jídlo ještě nemáš, ale máš v ruce věc, podle které ho dostaneš — nebo se dozvíš, že došlo.

## Promise má tři stavy

Každá [[Promise]] je v jednom ze tří stavů:

| stav | anglicky | co znamená |
|---|---|---|
| čeká | *pending* | výsledek ještě není |
| splněná | *fulfilled* | výsledek je hotový, má hodnotu |
| zamítnutá | *rejected* | nepovedlo se, má důvod (obvykle `Error`) |

Ze stavu „čeká" přejde Promise **jednou** do splněné, nebo zamítnuté, a v tom stavu už zůstane. Splněné nebo zamítnuté říkáme souhrnně *usazená* (*settled*).

Na výsledek se nečeká v cyklu ani dotazem „už to je?". Metodě `then` předáš callback a Promise ho zavolá, až bude hotová:

:::live js
```js
// Promise, která se splní za 50 ms (jak ji vyrobit, uvidíš v další části)
const coffee = new Promise((resolve) => {
  setTimeout(() => resolve('flat white'), 50);
});

console.log('objednávka přijata');
coffee.then((drink) => {
  console.log(`vydáno: ${drink}`);
});
console.log('čekám u okénka');
```
:::

Hodnotu, se kterou se Promise splnila, dostane callback jako parametr. Zkus přidat druhé `coffee.then(…)` s jiným výpisem a sleduj, že ho Promise zavolá taky — na jednu Promise se může čekat z víc míst.

> [!PITFALL]
> **Hodnotu z Promise nedostaneš ven do proměnné „hned".** `let drink; coffee.then((d) => { drink = d; }); console.log(drink);` vypíše `undefined`, protože `then` callback se spustí až po doběhnutí aktuálního kódu. Kód, který výsledek potřebuje, patří **do** callbacku (nebo za `await`, uvidíš v příští lekci).

:::check
Promise se splnila s hodnotou `42`. O minutu později k ní někdo zavolá `promise.then((value) => console.log(value))`. Co se stane?

### --answer--

Nic, na splnění už je pozdě a callback se nezavolá.

#### --why--

Promise si výsledek pamatuje. Nejde o událost, kterou můžeš prošvihnout, ale o hotový stav.

### --correct--

Callback se zavolá s hodnotou `42`, jen ne synchronně, ale jako mikroúloha.

#### --why--

Usazená Promise výsledek drží navždy. `then` na už splněné Promise naplánuje callback do fronty mikroúloh.

### --answer--

Promise se znovu spustí a počítá výsledek od začátku.

#### --why--

Promise nic nespouští znovu. Práce proběhla jednou, Promise jen drží její výsledek.

### --see--

js-async/promise#promise-ma-tri-stavy
:::

## Kdy psát `new Promise`

Většinu Promise nevyrábíš sám — vrací ti je `fetch`, `response.json()` a moderní knihovny. `new Promise` potřebuješ, jen když obaluješ API, které Promise nevrací: časovač, událost nebo starou knihovnu s callbacky.

Konstruktor dostane funkci (*executor*) se dvěma parametry. `resolve(hodnota)` Promise splní, `reject(chyba)` ji zamítne:

:::live js
```js
// Počká zadaný počet milisekund
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Obal starého API s callbackem (error, result)
function readCard(reader) {
  return new Promise((resolve, reject) => {
    reader.read((error, card) => {
      if (error) reject(error);
      else resolve(card);
    });
  });
}

const reader = {
  read(callback) {
    setTimeout(() => callback(null, { number: '**** 4821' }), 30);
  },
};

sleep(20).then(() => console.log('po 20 ms'));
readCard(reader).then((card) => console.log('karta', card.number));
```
:::

Zkus ve falešné čtečce změnit `callback(null, …)` na `callback(new Error('Karta nečitelná'))` a do volání přidat `.catch((error) => console.log(error.message))`.

Dvě pravidla executoru, na která se často zapomíná:

- executor běží **synchronně** hned při `new Promise` — proto v pretestu `A` předběhlo `C`,
- **platí jen první** `resolve` nebo `reject`. Další volání se tiše ignorují.

:::live js predict
```js
const payment = new Promise((resolve, reject) => {
  resolve('zaplaceno');
  reject(new Error('karta zamítnuta'));
  resolve('zaplaceno podruhé');
});

payment
  .then((result) => console.log(result))
  .catch((error) => console.log(error.message));
```
--question-- Co vypíše tenhle kód?
--expected-- zaplaceno
--why-- První `resolve` Promise usadí jako splněnou. `reject` i druhé `resolve` přijdou pozdě a nic nezmění — žádná chyba se nevyhodí, prostě se nestanou. Zkus prohodit první dva řádky executoru a sleduj, že vyhraje `reject`.
:::

Když potřebuješ `resolve` a `reject` mimo executor (třeba je zavolá až posluchač události), vrátí ti je `Promise.withResolvers()` rovnou: `const { promise, resolve, reject } = Promise.withResolvers();`. Je to zkratka za totéž, co umí `new Promise`.

> [!PITFALL]
> **`new Promise` kolem něčeho, co už Promise vrací, je zbytečné a nebezpečné.** `new Promise((resolve) => { fetch(url).then(resolve); })` zapomene chybu: když `fetch` selže, `reject` nikdo nezavolá a Promise čeká navždy. Oprava: vrať rovnou `fetch(url)` nebo řetěz `then`.

:::check
Která funkce potřebuje `new Promise`?

### --answer--

`function loadUser(id) { return fetch('/api/users/' + id); }`

#### --why--

`fetch` už Promise vrací. Obalovat ji znovu nic nepřidá a hrozí ztráta chyby.

### --correct--

Funkce, která čeká na první `click` na tlačítku a vrátí Promise.

#### --why--

`addEventListener` Promise nevrací, pracuje s callbackem. Právě takové API se obaluje přes `new Promise` (nebo `Promise.withResolvers`).

### --answer--

`function double(n) { return n * 2; }`, aby byla asynchronní.

#### --why--

Synchronní výpočet na nic nečeká. Obalením do Promise jen oddálíš výsledek a zkomplikuješ kód.

### --see--

js-async/promise#kdy-psat-new-promise
:::

## Řetězení `then`

`then` nevrací původní Promise, ale **novou**. Ta se splní hodnotou, kterou callback vrátí. Díky tomu jde kroky psát pod sebe místo do sebe:

:::live js
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function payOrder(total) {
  return sleep(20).then(() => ({ paymentId: 'P-117', total }));
}

function saveOrder(payment) {
  return sleep(20).then(() => ({ orderId: 5521, ...payment }));
}

payOrder(649)
  .then((payment) => saveOrder(payment))
  .then((order) => `Objednávka ${order.orderId} za ${order.total} Kč`)
  .then((message) => console.log(message));
```
:::

Všimni si dvou různých návratů:

- `saveOrder(payment)` vrací **Promise** — další `then` počká, až se splní, a dostane její hodnotu, ne Promise samotnou,
- druhý callback vrací **obyčejný text** — další `then` ho dostane hned.

Zkus u prvního `then` smazat složené závorky nebo naopak přidat `{ saveOrder(payment); }` a sleduj, co dorazí do dalšího kroku.

:::live js predict
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

sleep(10)
  .then(() => {
    sleep(10).then(() => console.log('uloženo'));
  })
  .then((result) => console.log('hotovo', result));
```
--question-- V jakém pořadí se vypíšou řádky a co bude v `result`? Napiš výpis pod sebe.
--expected--
```text
hotovo undefined
uloženo
```
--why-- První callback má složené závorky a žádný `return`. Vnitřní `sleep(10)` sice spustí, ale nevrátí ji, takže nová Promise z `then` se splní hned hodnotou `undefined`. Druhý `then` na uložení nepočká. Oprava je `return sleep(10).then(…)` nebo šipka bez složených závorek.
:::

> [!REMEMBER]
> **Co callback v `then` vrátí, to dostane další `then`.** Vrácená Promise se nejdřív počká. Bez `return` jde dál `undefined` a na nic se nečeká.

:::check
Co vypíše poslední `then`?

```js
Promise.resolve(2)
  .then((n) => n * 10)
  .then((n) => { n + 1; })
  .then((n) => console.log(n));
```

### --expected--

undefined

### --why--

První callback vrátí `20`. Druhý má složené závorky bez `return`, takže výraz `n + 1` spočítá a zahodí a dál pošle `undefined`.

### --see--

js-async/promise#retezeni-then
:::

## Chyby: `catch` a `finally`

Když Promise v řetězu selže — `reject`, nebo `throw` uvnitř callbacku —, další `then` se **přeskočí** až k nejbližšímu `catch`. Ten dostane chybu a jeho návratová hodnota řetěz zase „opraví":

:::live js
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStock(code) {
  return sleep(20).then(() => {
    if (code === 'X-99') throw new Error(`Zboží ${code} neexistuje`);
    return { code, pieces: 4 };
  });
}

loadStock('X-99')
  .then((stock) => console.log('na skladě', stock.pieces))
  .catch((error) => {
    console.log('chyba:', error.message);
    return { code: 'X-99', pieces: 0 };
  })
  .then((stock) => console.log('zobrazím kusů:', stock.pieces))
  .finally(() => console.log('schovám načítání'));
```
:::

Zkus změnit kód zboží na `'K-12'` a sleduj, které řádky se vypíšou teď. `finally` se spustí vždycky, po úspěchu i po chybě, a hodnotu v řetězu nemění — ideální na schování načítacího kolečka.

> [!PITFALL]
> **Zamítnutá Promise bez `catch` je [[neobsloužené zamítnutí]]** (*unhandled rejection*). V konzoli Chromu uvidíš `Uncaught (in promise) Error: Zboží X-99 neexistuje` a aplikace se tváří, že se nic nestalo — načítání se neschová, uživatel nic nevidí. Oprava: každý řetěz, který nikdo dál nevrací, ukonči `catch`, který chybu ukáže.

:::check
Callback uvnitř `then` vyhodí `throw new Error('Neplatná cena')`. Kde chybu zachytíš?

### --answer--

Ve `try`/`catch` kolem celého řetězu.

#### --why--

`try`/`catch` hlídá jen synchronní kód. Řetěz se jen naplánuje a `try` skončí dřív, než callback vůbec běží.

### --correct--

V nejbližším `.catch` dál v řetězu.

#### --why--

`throw` v callbacku zamítne Promise, kterou `then` vrátilo. Zamítnutí proteče řetězem až k prvnímu `catch`.

### --answer--

Nikde, chyba z callbacku stránku shodí.

#### --why--

Chyba v callbacku `then` stránku neshodí, promění se na zamítnutou Promise. Bez `catch` z ní bude neobsloužené zamítnutí.

### --see--

js-async/promise#chyby-catch-a-finally
:::

## Víc Promise najednou: `all`, `allSettled`, `race` a `any`

Často potřebuješ víc věcí zároveň: načíst profil, objednávky a doporučení. Spustíš všechno hned a na výsledek počkáš jednou z kombinačních metod. Všechny berou pole Promise a vracejí **jednu** novou Promise:

| metoda | splní se, když | zamítne se, když | výsledek |
|---|---|---|---|
| `Promise.all` | se splní **všechny** | selže **první** z nich | pole hodnot ve stejném pořadí |
| `Promise.allSettled` | se usadí všechny | nikdy | pole `{ status, value }` / `{ status, reason }` |
| `Promise.race` | se **první** usadí splněním | se první usadí zamítnutím | hodnota nebo chyba té první |
| `Promise.any` | se splní **první** | selžou všechny | hodnota první úspěšné, jinak `AggregateError` |

:::live js
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (ms, message) => sleep(ms).then(() => { throw new Error(message); });

const profile = sleep(30).then(() => 'Jana Nováková');
const orders = sleep(10).then(() => 3);
const tips = fail(20, 'doporučení nedostupná');

Promise.all([profile, orders, tips])
  .then((values) => console.log('all:', values))
  .catch((error) => console.log('all selhalo:', error.message));

Promise.allSettled([profile, orders, tips])
  .then((results) => console.log('allSettled:', results.map((r) => r.status)));
```
:::

Výsledky mají pořadí podle pole, ne podle toho, co doběhlo dřív — `orders` je nejrychlejší, a přesto je v poli druhé. Zkus z pole u `Promise.all` odebrat `tips` a sleduj, co vypíše.

:::live js predict
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (ms, message) => sleep(ms).then(() => { throw new Error(message); });

const mirrorA = fail(10, 'zrcadlo A nedostupné');
const mirrorB = sleep(30).then(() => 'zrcadlo B');

Promise.race([mirrorA, mirrorB])
  .then((value) => console.log('race:', value))
  .catch((error) => console.log('race:', error.message));

Promise.any([mirrorA, mirrorB])
  .then((value) => console.log('any:', value));
```
--question-- Co vypíšou oba řádky? Napiš je pod sebe.
--expected--
```text
race: zrcadlo A nedostupné
any: zrcadlo B
```
--why-- `race` bere **první usazenou** Promise, ať dopadla jakkoli — zrcadlo A selže po 10 ms a vyhraje. `any` chyby přeskakuje a čeká na **první splněnou**, tedy zrcadlo B po 30 ms. Zkus zrcadlu A dát 50 ms a sleduj, že `race` pak vrátí zrcadlo B.
:::

> [!TIP]
> `Promise.race` s Promise, která se po čase zamítne, je nejjednodušší timeout: kdo dřív přijde, ten vyhraje. Napíšeš ho ve workshopu o souběhu.

:::check
Stránka ukazuje tři nezávislé widgety (počasí, kurzy, zprávy). Když jeden selže, ostatní se mají ukázat dál. Kterou metodou na ně počkáš?

### --expected--

Promise.allSettled

### --accept--

allSettled
Promise.allSettled()
allSettled()

### --why--

`Promise.allSettled` počká na všechny a u každého řekne, jestli se povedl (`fulfilled` s `value`), nebo ne (`rejected` s `reason`). `Promise.all` by při první chybě zahodil i hotové výsledky.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any
:::

:::explain
Na pohovoru dostaneš otázku: „Co je Promise, jaké má stavy a jaký je rozdíl mezi `Promise.all` a `Promise.allSettled`?"

## --model--

Promise je objekt, který zastupuje výsledek asynchronní operace, jenž ještě není hotový. Na začátku čeká (*pending*) a jednou se usadí: buď se splní s hodnotou, nebo zamítne s chybou, a v tom stavu už zůstane. Na výsledek se čeká přes `then` a `catch` nebo `await`. `Promise.all` čeká na všechny Promise a vrátí pole hodnot, ale při první chybě se zamítne a ostatní výsledky zahodí. `Promise.allSettled` počká, až se usadí všechny, a u každé vrátí stav a hodnotu nebo důvod, takže se hodí, když jsou úlohy nezávislé.

## --checklist--

- Promise zastupuje výsledek, který ještě není hotový.
- Tři stavy: čeká, splněná s hodnotou, zamítnutá s důvodem; usadí se jen jednou.
- Na výsledek se čeká přes `then`/`catch` nebo `await`, ne synchronně.
- `Promise.all` se zamítne při první chybě a hotové výsledky zahodí.
- `Promise.allSettled` počká na všechny a u každé řekne, jak dopadla.
:::

## Typické chyby a pasti

### `then` bez `return`

> [!PITFALL]
> **Callback se složenými závorkami bez `return` přeruší řetěz.** Příznak: další `then` dostane `undefined` a spustí se dřív, než vnitřní operace doběhne („hotovo" před „uloženo"). Oprava: `return` před vnitřní Promise, nebo šipka bez složených závorek.

### Zavolaná funkce místo předané

Stejná past jako u `setTimeout` z lekce o event loopu — `then` potřebuje funkci, ne její výsledek:

:::live js predict
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hideSpinner() {
  console.log('kolečko schováno');
}

sleep(20)
  .then(() => console.log('data načtena'))
  .finally(hideSpinner());
```
--question-- V jakém pořadí se vypíšou řádky? Napiš je pod sebe.
--expected--
```text
kolečko schováno
data načtena
```
--why-- `hideSpinner()` se zavolá hned při sestavování řetězu a `finally` dostane jeho návratovou hodnotu `undefined`. Nefunkci `finally` tiše ignoruje. Kolečko se tak „schová" dřív, než data dorazí. Oprava: `.finally(hideSpinner)` bez závorek.
:::

### Pole funkcí místo pole Promise

> [!PITFALL]
> **`Promise.all([loadProfile, loadOrders])` nic nespustí.** Předáváš funkce, ne Promise. Hodnoty, které nejsou Promise, `Promise.all` bere jako hotové výsledky, takže hned vrátí pole dvou funkcí. Příznak: `values[0].name` je `undefined` a nic se nenačetlo. Oprava: funkce zavolej, `Promise.all([loadProfile(), loadOrders()])`.

:::check
Oprav řádek `Promise.all([loadWeather, loadNews])` tak, aby opravdu počkal na obě načtení. Napiš celý výraz.

### --expected--

Promise.all([loadWeather(), loadNews()])

### --why--

Funkce se musí zavolat, aby vrátily Promise. Bez závorek dostane `Promise.all` jen dvě funkce a vrátí je rovnou jako „hotové hodnoty".

### --see--

js-async/promise#pole-funkci-misto-pole-promise
:::

### Ztracená chyba v `new Promise`

> [!PITFALL]
> **Obal `new Promise` kolem Promise zapomene chybu.** Příznak: načítání se při výpadku sítě točí navždy a v konzoli nic není, protože `reject` nikdo nezavolá. Oprava: vrať původní Promise, `new Promise` jen kolem callbacků.

## Kde to najdeš v MDN

- [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) — průvodce řetězením, ošetřením chyb a častými chybami; hledej *Common mistakes*.
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) — stavy Promise a v oddílu *Promise concurrency* srovnání `all`, `allSettled`, `any` a `race`.
- [Promise() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise) — executor, `resolve` a `reject` a příklad obalení callbackového API.
- [Promise.withResolvers()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) — kdy se hodí mít `resolve` mimo executor.

Hned v dalším labu obalíš staré callbackové SDK platebního terminálu do Promise, poskládáš z něj platbu a sečteš tržby z několika terminálů najednou.

# --questions--

## --question--

Co vypíše tenhle kód? Napiš výpis pod sebe.

```js
Promise.reject(new Error('Sklad nedostupný'))
  .then(() => console.log('A'))
  .catch((error) => console.log('B'))
  .then(() => console.log('C'));
```

### --expected--

```text
B
C
```

### --why--

Zamítnutí přeskočí `then` s `A` a spadne do `catch`. `catch` chybu obslouží a vrátí `undefined`, takže řetěz za ním pokračuje jako splněný a `C` se vypíše. Kdyby `catch` chtěl chybu poslat dál, musel by ji znovu vyhodit.

### --see--

js-async/promise#chyby-catch-a-finally

## --question--

Funkce `loadAll` má vrátit Promise s polem tří produktů. Proč vrací `[undefined, undefined, undefined]`?

```js
function loadAll(ids) {
  return Promise.all(ids.map((id) => {
    loadProduct(id);
  }));
}
```

### --answer--

`Promise.all` neumí pracovat s výsledkem `map`.

#### --why--

`map` vrací obyčejné pole a `Promise.all` pole bere. Problém je v tom, co v poli je.

### --correct--

Callback v `map` má složené závorky bez `return`, takže pole obsahuje `undefined` místo Promise.

#### --why--

`loadProduct(id)` se sice spustí, ale callback ho nevrátí. `Promise.all` dostane tři `undefined`, bere je jako hotové hodnoty a na načtení nečeká.

### --answer--

`loadProduct` se volá po jednom, takže výsledky nestihnou dorazit.

#### --why--

Všechna volání se spustí hned za sebou a běží souběžně. Na načtení se nečeká z jiného důvodu.

### --see--

js-async/promise#retezeni-then

## --question--

Tři servery se zrcadlem stejného souboru. Chceš soubor z toho, který **úspěšně** odpoví první, a chybu, jen když selžou všechny. Kterou metodu použiješ?

### --expected--

Promise.any

### --accept--

any
Promise.any()

### --why--

`Promise.any` přeskakuje chyby a splní se první úspěšnou odpovědí. `Promise.race` by vzal i první chybu. Když selžou všechny, `any` se zamítne s `AggregateError`, ve kterém jsou všechny důvody.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any
