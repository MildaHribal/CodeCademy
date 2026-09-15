---
pass: 0.8
---

# --questions--

## --question--

V jakém pořadí se vypíšou čísla? Napiš je oddělená mezerou.

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
(async () => {
  console.log('3');
  await null;
  console.log('4');
})();
console.log('5');
```

### --expected--

1 3 5 4 2

### --why--

`async` funkce běží synchronně až k prvnímu `await`, proto `3` přijde hned po `1`. Na `await null` se zastaví, i když nečeká na nic skutečného, a zbytek se naplánuje jako mikroúloha. Skript dojede (`5`), pak se vyprázdní mikroúlohy (`4`) a teprve potom přijde úloha časovače (`2`).

### --see--

js-async/async-await#await-prerusi-funkci-ne-program

## --question--

Kdy se vypíše `časovač`?

```js
setTimeout(() => console.log('časovač'), 0);
Promise.resolve()
  .then(() => console.log('první then'))
  .then(() => console.log('druhý then'));
```

### --answer--

Jako první, protože byl naplánovaný dřív než oba `then`.

#### --why--

Pořadí naplánování rozhoduje jen uvnitř jedné fronty. Callback časovače a callbacky `then` jsou ve dvou různých frontách.

### --answer--

Mezi `první then` a `druhý then`, protože druhý `then` se naplánuje až po prvním.

#### --why--

Druhý `then` se opravdu naplánuje až po doběhnutí prvního, ale zase jako mikroúloha. Event loop vyprazdňuje frontu mikroúloh, dokud v ní něco je, i když přibývají nové.

### --correct--

Až po obou `then`.

#### --why--

Po skriptu se vyprázdní celá fronta mikroúloh, včetně mikroúlohy, kterou první `then` přidal. Úloha časovače přijde na řadu až potom.

### --see--

js-async/event-loop#mikroulohy-promise-ma-prednost

## --question--

Co vypíše tenhle kód?

```js
Promise.resolve(10)
  .then((n) => n + 5)
  .catch(() => 0)
  .then((n) => {
    throw new Error(`Chyba ${n}`);
  })
  .catch((error) => error.message)
  .then((text) => console.log(text));
```

### --expected--

Chyba 15

### --why--

První `catch` se přeskočí, protože nic nebylo zamítnuté, a hodnota `15` proteče dál. `throw` v dalším `then` řetěz zamítne, druhý `catch` chybu obslouží a jeho návratová hodnota (zpráva) jde jako splněná hodnota do posledního `then`.

### --see--

js-async/promise#chyby-catch-a-finally

## --question--

Co vypíše tenhle kód?

```js
const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

Promise.all([wait(30, 'A'), wait(10, 'B'), 'C'])
  .then((values) => console.log(values.join('')));
```

### --expected--

ABC

### --why--

`Promise.all` vrací hodnoty v pořadí pole, ne v pořadí, jak doběhly, takže `B` zůstane na druhém místě, i když je hotové první. Hodnotu, která není Promise (`'C'`), bere jako už splněnou.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any

## --question--

Stránka načítá tři widgety přes `const results = await Promise.allSettled([loadWeather(), loadNews(), loadRates()])`. Načtení zpráv selže chybou `Error('Zprávy nedostupné')`. Co je v `results[1]`?

### --answer--

`undefined`, protože se zprávy nenačetly.

#### --why--

`allSettled` pro každou Promise vrátí objekt s výsledkem, i pro zamítnutou. Prázdné místo v poli nenechá.

### --answer--

`{ status: 'fulfilled', value: Error('Zprávy nedostupné') }`

#### --why--

Chyba se nestane hodnotou splnění. Podívej se, jak `allSettled` pojmenovává zamítnutou Promise a pod jakým klíčem je důvod.

### --correct--

`{ status: 'rejected', reason: Error('Zprávy nedostupné') }`

#### --why--

Zamítnutá Promise má v `allSettled` stav `rejected` a důvod v klíči `reason`. Splněná má `status: 'fulfilled'` a hodnotu ve `value`.

### --answer--

Nic, `Promise.allSettled` se zamítne a na řádek s `results` se nedojde.

#### --why--

Takhle se chová `Promise.all`. `allSettled` se nezamítne nikdy, počká, až se usadí všechny.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any

## --question--

Co vypíše tenhle kód? Napiš tři hodnoty oddělené mezerou.

```js
const ids = [1, 2, 3];
const results = ids.map(async (id) => id * 10);
console.log(Array.isArray(results), results.length, typeof results[0].then);
```

### --expected--

true 3 function

### --why--

`map` s `async` callbackem vrátí obyčejné pole, jenže v něm nejsou čísla, ale tři Promise (mají metodu `then`). Na hodnoty se čeká až přes `await Promise.all(results)`.

### --see--

js-async/async-await#cykly-for-of-ceka-foreach-ne

## --question--

Co vypíše tenhle kód? Falešný `fetch` vrátí stejnou odpověď, jakou by vrátil server.

```js
const fetch = async () => new Response('Nenalezeno', { status: 404 });

fetch('/api/products/999')
  .then((response) => console.log(response.ok, response.status))
  .catch(() => console.log('chyba'));
```

### --expected--

false 404

### --why--

Odpověď `404` dorazila, takže se `fetch` splní a spustí se `then`, ne `catch`. Neúspěch poznáš jen podle `response.ok`, které je `false` pro všechny stavy mimo 200–299.

### --see--

js-async/fetch#404-a-500-nejsou-pro-fetch-chyba

## --question--

Jak dlouho zhruba čeká `loadDashboard`, když `loadUser` trvá 300 ms, `loadOrders` 200 ms a `loadTips` 500 ms? Napiš počet milisekund.

```js
async function loadDashboard() {
  const user = await loadUser();
  const [orders, tips] = await Promise.all([loadOrders(user.id), loadTips()]);
  return { user, orders, tips };
}
```

### --expected--

800

### --accept--

800 ms
800ms

### --why--

Uživatel se načte první (300 ms), protože objednávky potřebují jeho `id`. Objednávky a doporučení pak běží souběžně a `Promise.all` čeká na delší z nich (500 ms). Celkem 300 + 500. Kdyby `loadTips` stálo před `loadUser` s vlastním `await`, bylo by to 1000 ms.

### --see--

js-async/async-await#postupne-nebo-soubezne

## --question--

Načítání dostane `signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)])`. Uživatel po sekundě klikne na **Zrušit** a zavolá se `controller.abort()`. Jakou hodnotu má `error.name` v `catch`?

### --expected--

AbortError

### --accept--

'AbortError'

### --why--

Spojený signál převezme důvod toho signálu, který se zrušil první. Tady to byl ovladač bez vlastního důvodu, takže chyba je `AbortError`. `TimeoutError` by přišel, jen kdyby uživatel čekal pět sekund.

### --see--

js-async/async-await#zruseni-abortcontroller-a-signal

## --question--

Frontend běží na `http://localhost:5173` a volá API na `http://127.0.0.1:5173`. Je to pro prohlížeč stejný původ?

### --answer--

Ano, obě adresy vedou na tentýž počítač a port.

#### --why--

Kam adresa fyzicky vede, prohlížeč neřeší. Porovnává text schématu, domény a portu.

### --correct--

Ne, liší se doména (`localhost` × `127.0.0.1`), takže jde o dva původy.

#### --why--

Původ je schéma, doména a port. `localhost` a `127.0.0.1` jsou dvě různé domény, i když vedou na stejný stroj, a bez hlavičky `Access-Control-Allow-Origin` skončí požadavek chybou CORS.

### --answer--

Ano, protože se shoduje port.

#### --why--

Port je jen jedna ze tří částí původu. Musí se shodovat všechny.

### --see--

js-async/fetch#cors-z-pohledu-prohlizece

## --question--

Najdi v anglické dokumentaci MDN stránku *Response: type property*. Jakou hodnotu má `response.type` u odpovědi na požadavek s `mode: 'no-cors'` na cizí původ? Napiš jedno slovo.

### --expected-- ignore-case

opaque

### --accept--

'opaque'

### --why--

Neprůhledná (*opaque*) odpověď je přesně ta, o které mluví past s `mode: 'no-cors'`: stav `0` a prázdné tělo, ze kterého skript nic nepřečte. Stejná tabulka hodnot `basic`, `cors`, `error`, `opaque` a `opaqueredirect` je na MDN u vlastnosti `type`.

### --see--

js-async/fetch#cors-z-pohledu-prohlizece

## --question--

Recenze přichází z API a její text napsal zákazník. Který řádek ho vloží do položky seznamu bezpečně?

### --answer--

`item.innerHTML = review.text;`

#### --why--

`innerHTML` text rozebere jako HTML, takže značky z recenze se ve stránce stanou prvky i se svými atributy, třeba `onerror`.

### --answer--

`` item.innerHTML = `<p>${review.text}</p>`; ``

#### --why--

Obalení do šablony nic nezmění: text z recenze pořád skončí uvnitř HTML, které prohlížeč rozebere.

### --correct--

`item.textContent = review.text;`

#### --why--

`textContent` vloží text přesně tak, jak je, i se znaky `<` a `>`. Z dat se nikdy nestane HTML.

### --answer--

`item.insertAdjacentHTML('beforeend', review.text);`

#### --why--

`insertAdjacentHTML` jen přidá HTML na jiné místo. Rozebírá text stejně jako `innerHTML`.

### --see--

js-dom/strom-dom#text-a-html-textcontent-a-innerhtml

## --question--

Co vypíše tenhle kód?

```js
const body = JSON.stringify({ at: new Date(Date.UTC(2026, 8, 15)) });
console.log(body);
```

### --expected--

{"at":"2026-09-15T00:00:00.000Z"}

### --why--

`JSON.stringify` datum převede na text ve formátu ISO 8601 v UTC. Server, který tělo přečte přes `JSON.parse`, dostane obyčejný řetězec, ne objekt `Date`, a musí si ho převést zpátky sám.

### --see--

js-objekty/kopie-a-json#co-json-ztrati

## --question--

Kolega napsal `debounce` pro našeptávač, ale hledání se při psaní spustí po každém písmenu. Proč?

```js
function debounce(fn, ms) {
  return (...args) => {
    let timer;
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

### --answer--

`clearTimeout` nejde zavolat dřív, než je časovač nastavený.

#### --why--

`clearTimeout(undefined)` je dovolené a tiše nic neudělá. Problém je v tom, kterou proměnnou ruší.

### --correct--

Proměnná `timer` vzniká při každém zavolání obalu znovu, takže `clearTimeout` nikdy nevidí předchozí časovač.

#### --why--

Aby si obal pamatoval časovač mezi voláními, musí `let timer` stát v `debounce`, mimo vrácenou funkci. Pak ho sdílí všechna volání jednoho obalu.

### --answer--

Šipková funkce nevidí parametr `ms` z vnější funkce.

#### --why--

Vnořená funkce vidí proměnné z místa, kde vznikla, i parametry. `ms` je dostupné; chyba je jinde.

### --see--

js-funkce-hloubka/closures#funkce-ktera-obali-jinou-funkci

## --question--

Vypíše tenhle kód `chyceno`? Odpověz ano, nebo ne.

```js
try {
  setTimeout(() => {
    throw new Error('Neplatná objednávka');
  }, 0);
} catch (error) {
  console.log('chyceno');
}
```

### --expected-- ignore-case

ne

### --accept--

nevypíše
nevypise

### --why--

`try` hlídá jen kód, který běží uvnitř bloku teď. Callback časovače se spustí až v další úloze, kdy je blok `try` dávno za námi, takže chyba skončí v konzoli jako nezachycená. Chytit ji jde jen uvnitř callbacku, nebo přes Promise a `await` v `try`.

### --see--

js-chyby-ladeni/vyjimky#try-nechyti-chybu-ktera-nastane-pozdeji

## --question--

Galerie po načtení skriptu zavolá `loadNextPage()` a hned potom začne sledovat prázdný prvek pod seznamem. Seznam je zatím prázdný, takže `#sentinel` je od začátku vidět. Kolikrát se po otevření stránky zavolá `loadNextPage`, když uživatel vůbec neposouvá? Napiš číslo.

```js
loadNextPage();

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadNextPage();
});
observer.observe(document.querySelector('#sentinel'));
```

### --expected--

2

### --why--

Myslíš si, že observer ohlásí prvek až při prvním posunu? Prohlížeč zavolá callback hned po `observe` s aktuálním stavem, a protože je `#sentinel` vidět, zavolá `loadNextPage` podruhé, zatímco první načtení ještě běží. Bez stavu „právě načítám" by se první stránka stáhla dvakrát.

### --see--

js-dom/prohlizecova-api#sledovani-prvku-intersectionobserver-a-resizeobserver

# --code-- Kolegův modul objednávek

## --file-- objednavky.js

```js
// Modul objednávek pro administraci e-shopu.
var API = '/api/orders';

function wait(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// Když odpověď nepřijde do ms milisekund, vrátí chybu.
function withLimit(promise, ms) {
  var limit = wait(ms).then(function () {
    throw new Error('Vypršel limit ' + ms + ' ms');
  });
  return Promise.race([promise, limit]);
}

function getOrder(id) {
  return fetch(API + '/' + id).then(function (res) {
    return res.json();
  });
}

async function getOrders(ids) {
  var list = [];
  for (var i = 0; i < ids.length; i++) {
    var order = await withLimit(getOrder(ids[i]), 2000);
    list.push(order);
  }
  return list;
}

function orderTotal(order) {
  var sum = 0;
  for (var i = 0; i < order.items.length; i++) {
    sum = sum + order.items[i].price * order.items[i].qty;
  }
  return sum;
}

async function markShipped(orders) {
  var done = [];
  orders.forEach(async function (order) {
    var res = await fetch(API + '/' + order.id + '/ship', { method: 'POST' });
    if (res.ok) {
      done.push(order.id);
    }
  });
  console.log('Odesláno: ' + done.length);
  return done;
}

async function dailyReport(ids) {
  var status = document.getElementById('report-status');
  status.textContent = 'Počítám…';
  try {
    var orders = await getOrders(ids);
    var total = 0;
    for (var i = 0; i < orders.length; i++) {
      total = total + orderTotal(orders[i]);
    }
    status.textContent = 'Tržba: ' + total + ' Kč';
    await markShipped(orders);
  } catch (err) {
    status.textContent = 'Chyba: ' + err.message;
  } finally {
    setTimeout(function () {
      status.textContent = '';
    }, 5000);
  }
}
```

## --question--

Každá objednávka odpoví za 400 ms. Jak dlouho zhruba trvá `getOrders([1, 2, 3])`? Napiš počet milisekund.

### --expected--

1200

### --accept--

1200 ms
1200ms

### --why--

`await` na řádku 27 stojí uvnitř cyklu, takže další objednávka se začne načítat až po té předchozí a časy se sečtou. Souběžně by to šlo přes `Promise.all(ids.map(…))` a trvalo by to zhruba 400 ms.

### --see--

js-async/async-await#postupne-nebo-soubezne

## --question--

Server odpoví na `getOrder(7)` stavem `404` a tělem `{ "error": "Objednávka nenalezena" }`. Co ukáže `dailyReport([7])` v prvku `report-status`?

### --answer--

`Chyba: Objednávka nenalezena`

#### --why--

Tu zprávu by kód ukázal, jen kdyby z odpovědi 404 někdo udělal chybu. Podívej se, co s odpovědí dělá `getOrder` na řádcích 18–22.

### --answer--

`Tržba: 0 Kč`

#### --why--

K součtu se kód nedostane. Zkus projít, co přesně dostane `orderTotal` na řádku 60 a co se stane na řádku 35.

### --correct--

`Chyba: Cannot read properties of undefined (reading 'length')`

#### --why--

`getOrder` nekontroluje `res.ok`, takže tělo s chybou vrátí jako objednávku. `orderTotal` pak na řádku 35 čte `order.items.length` z objektu, který `items` nemá, vyhodí `TypeError` a ten skončí v bloku `catch` na řádcích 64–65. Uživatel dostane nesrozumitelnou hlášku místo „Objednávka nenalezena".

### --see--

js-async/fetch#chybi-kontrola-response-ok

## --question--

`markShipped` odesílá dvě objednávky a server obě přijme. Co vypíše `console.log` na řádku 49?

### --expected--

Odesláno: 0

### --why--

`forEach` na řádku 43 zavolá `async` callback pro obě objednávky a vrácené Promise zahodí. Callbacky se zastaví na `await fetch` a `console.log` proběhne dřív, než dorazí první odpověď, takže pole `done` je ještě prázdné. Funkce navíc vrátí prázdné pole, které se naplní až později.

### --see--

js-async/async-await#cykly-for-of-ceka-foreach-ne

## --question--

Odpověď na `getOrder` nepřijde do dvou sekund a limit z `withLimit` vyprší. Co se stane s požadavkem na server?

### --answer--

Prohlížeč ho zruší, protože `Promise.race` na řádku 15 už skončil.

#### --why--

`Promise.race` jen vybere, na kterou Promise se bude čekat. Sám nic neruší a o požadavku za Promise nic neví.

### --correct--

Běží dál a zabírá síť, jen na jeho výsledek už nikdo nečeká.

#### --why--

Zamítnutí z limitu ukončí čekání, ale požadavek se zastaví, jen když `fetch` dostane `signal` a někdo zavolá `abort()`. Lepší limit by předal `signal: AbortSignal.timeout(2000)` přímo do `fetch`.

### --answer--

Požadavek se zopakuje, protože `withLimit` na řádku 27 volá `getOrder` znovu.

#### --why--

`getOrder` se na řádku 27 zavolá jednou a jeho Promise se předá dál. Opakování tu nikde není.

### --see--

js-async/async-await#zruseni-abortcontroller-a-signal
