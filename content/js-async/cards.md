## --card-- output

V jakém pořadí se vypíšou řádky?

```js
setTimeout(() => console.log('úloha'), 0);
queueMicrotask(() => console.log('mikroúloha'));
console.log('skript');
```

### --expected--

```text
skript
mikroúloha
úloha
```

### --why--

Myslíš si, že rozhoduje pořadí naplánování? Nejdřív doběhne synchronní skript, pak se vyprázdní celá fronta mikroúloh a úloha časovače přijde na řadu až potom. `queueMicrotask` plánuje stejnou mikroúlohu jako callback `then`.

### --see--

js-async/event-loop#mikroulohy-promise-ma-prednost

## --card-- output

Co vypíše tenhle kód?

```js
Promise.resolve('uloženo')
  .finally(() => 'hotovo')
  .then((value) => console.log(value));
```

### --expected--

uloženo

### --why--

Myslíš si, že `finally` předá dál svou návratovou hodnotu jako `then`? Hodnotu v řetězu nemění, proto se hodí na úklid (schování načítání) po úspěchu i po chybě.

### --see--

js-async/promise#chyby-catch-a-finally

## --card-- output

Co vypíše tenhle kód? Napiš jméno chyby a číslo oddělené mezerou.

```js
Promise.any([Promise.reject(new Error('Zrcadlo A')), Promise.reject(new Error('Zrcadlo B'))])
  .catch((error) => console.log(error.name, error.errors.length));
```

### --expected--

AggregateError 2

### --why--

Myslíš si, že `any` vrátí první chybu jako `race`? `any` chyby přeskakuje a zamítne se, až když selžou všechny, a to souhrnnou chybou `AggregateError`, která všechny důvody nese v poli `errors`.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any

## --card-- output

V jakém pořadí se vypíšou čísla?

```js
async function run() {
  console.log(1);
  const value = await 2;
  console.log(value);
}

run();
console.log(3);
```

### --expected--

```text
1
3
2
```

### --why--

Myslíš si, že `await` na hodnotě, která není Promise, nečeká? Zastaví funkci vždycky: zbytek se naplánuje jako mikroúloha, i když je hodnota hned k dispozici, a hlavní kód mezitím vypíše `3`.

### --see--

js-async/async-await#await-prerusi-funkci-ne-program

## --card-- output

Co vypíše tenhle kód?

```js
async function run() {
  const response = new Response('{"stock": 4}');
  await response.json();
  try {
    await response.json();
  } catch (error) {
    console.log(error.name);
  }
}

run();
```

### --expected--

TypeError

### --why--

Myslíš si, že odpověď drží data a jde je číst opakovaně? Tělo odpovědi je proud dat a přečíst jde jen jednou. Když ho potřebuješ dvakrát, ulož si výsledek prvního čtení do proměnné.

### --see--

js-async/fetch#jedna-funkce-na-nacitani-json

## --card-- output

Co vypíše tenhle kód?

```js
const params = new URLSearchParams({ q: 'Hradec Králové', page: 1 });
console.log(params.toString());
```

### --expected--

q=Hradec+Kr%C3%A1lov%C3%A9&page=1

### --why--

Myslíš si, že se text do adresy dostane tak, jak je? `URLSearchParams` mezeru zapíše jako `+` a diakritiku zakóduje po bajtech UTF-8, takže adresu nerozbije. Ruční spojování textů by poslalo mezeru a `á` nezakódované.

### --see--

js-async/fetch#json-tam-a-zpatky-metoda-hlavicky-a-telo

## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
const controller = new AbortController();
controller.abort();
console.log(controller.signal.aborted, controller.signal.reason.name);
```

### --expected--

true AbortError

### --why--

Myslíš si, že `abort()` bez argumentu nechá důvod prázdný? Signál si zapamatuje, že je zrušený, a jako důvod dostane chybu `AbortError`. Stejnou chybou se zamítne `fetch`, který signál dostal.

### --see--

js-async/async-await#zruseni-abortcontroller-a-signal

## --card-- output

Co vypíše tenhle kód? Napiš obě hodnoty oddělené mezerou.

```js
const created = new Response(null, { status: 204 });
const moved = new Response('', { status: 301 });
console.log(created.ok, moved.ok);
```

### --expected--

true false

### --why--

Myslíš si, že `ok` znamená jen stav 200? `ok` je `true` pro celý rozsah 200–299, takže i pro `201 Created` a `204 No Content`. Stav mimo tenhle rozsah má `ok` rovné `false`, i když nejde o chybu serveru.

### --see--

js-async/fetch#co-vraci-fetch-nejdriv-odpoved-pak-data

## --card-- code js

Napiš funkci `delay(ms, value)`, která vrátí Promise splněnou hodnotou `value` po `ms` milisekundách.

### --seed--

```js
function delay(ms, value) {
}
```

### --test--

```js
const started = performance.now();
const result = delay(60, 'hotovo');
assert.ok(result instanceof Promise, "delay(60, 'hotovo') má vrátit Promise");
assert.equal(await result, 'hotovo', "delay(60, 'hotovo') se má splnit hodnotou 'hotovo'");
assert.ok(performance.now() - started >= 50, 'Promise z delay(60, …) se má splnit až po zhruba 60 ms');
```

### --solution--

```js
function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
```

### --why--

Časovač Promise nevrací, a tak ho obalíš: executor nastaví časovač a ten zavolá `resolve` s hodnotou.

### --see--

js-async/promise#kdy-psat-new-promise

## --card-- code js

Doplň `getJSON(url)`: vrátí data z odpovědi a při stavu mimo 200–299 se zamítne chybou se stavem ve zprávě. Falešný server v seedu na `/api/stock` odpoví daty, na jiné adresy stavem 404.

### --seed--

```js
window.fetch = async (url) =>
  url === '/api/stock' ? Response.json({ pieces: 4 }) : Response.json({ error: 'Nenalezeno' }, { status: 404 });

async function getJSON(url) {
}
```

### --test--

```js
assert.deepEqual(await getJSON('/api/stock'), { pieces: 4 }, "await getJSON('/api/stock') má vrátit { pieces: 4 }");
let caught = null;
let value;
try {
  value = await getJSON('/api/missing');
} catch (error) {
  caught = error;
}
assert.equal(value, undefined, `getJSON('/api/missing') se nemá splnit, splnila se ${JSON.stringify(value)}`);
assert.ok(caught instanceof Error, "getJSON('/api/missing') se má zamítnout chybou (Error)");
assert.match(caught.message, /404/, 'zpráva chyby má obsahovat stav 404');
```

### --solution--

```js
window.fetch = async (url) =>
  url === '/api/stock' ? Response.json({ pieces: 4 }) : Response.json({ error: 'Nenalezeno' }, { status: 404 });

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Server odpověděl ${response.status}`);
  }
  return response.json();
}
```

### --why--

`fetch` se u odpovědi 404 nezamítne, proto kontrola `response.ok` patří hned za něj. Tělo čteš až u úspěšné odpovědi.

### --see--

js-async/fetch#404-a-500-nejsou-pro-fetch-chyba

## --card-- code js

Napiš `async` funkci `saveAll(items, save)`, která pro každou položku zavolá `save(item)` (vrací Promise), **počká na něj, než zavolá další**, a nakonec vrátí počet uložených položek.

### --seed--

```js
async function saveAll(items, save) {
}
```

### --test--

```js
const log = [];
const save = async (item) => {
  log.push(`start ${item}`);
  await new Promise((resolve) => setTimeout(resolve, 20));
  log.push(`konec ${item}`);
};
const count = await saveAll(['A', 'B'], save);
assert.deepEqual(log, ['start A', 'konec A', 'start B', 'konec B'], 'saveAll má další uložení začít až po skončení předchozího');
assert.equal(count, 2, 'saveAll se dvěma položkami má vrátit 2');
```

### --solution--

```js
async function saveAll(items, save) {
  let count = 0;
  for (const item of items) {
    await save(item);
    count++;
  }
  return count;
}
```

### --why--

`for…of` se na `await` v každém kole zastaví. `forEach` s `async` callbackem by spustil všechna uložení naráz a na žádné by nečekal.

### --see--

js-async/async-await#cykly-for-of-ceka-foreach-ne

## --card-- code js

Napiš funkci `loadAll(ids, load)`, která zavolá `load(id)` pro všechna `id` **naráz** a vrátí Promise s výsledky ve stejném pořadí jako `ids`.

### --seed--

```js
function loadAll(ids, load) {
}
```

### --test--

```js
let active = 0;
let maxActive = 0;
const load = async (id) => {
  active++;
  maxActive = Math.max(maxActive, active);
  await new Promise((resolve) => setTimeout(resolve, 40 - id * 10));
  active--;
  return `produkt ${id}`;
};
const result = await loadAll([1, 2, 3], load);
assert.deepEqual(result, ['produkt 1', 'produkt 2', 'produkt 3'], 'loadAll([1, 2, 3], …) má vrátit výsledky v pořadí ids');
assert.equal(maxActive, 3, `všechna tři načtení mají běžet naráz, nejvíc jich běželo ${maxActive}`);
```

### --solution--

```js
function loadAll(ids, load) {
  return Promise.all(ids.map((id) => load(id)));
}
```

### --why--

Načtení se spustí zavoláním funkce, takže `map` rozběhne všechna hned. `Promise.all` pak počká na všechna a výsledky vrátí v pořadí pole, ne v pořadí doběhnutí.

### --see--

js-async/async-await#postupne-nebo-soubezne

## --card-- code js

Napiš funkci `withTimeout(promise, ms)`: vrátí Promise, která se usadí stejně jako `promise`, a když ta do `ms` milisekund nedoběhne, zamítne se chybou se zprávou `Vypršel čas`.

### --seed--

```js
function withTimeout(promise, ms) {
}
```

### --test--

```js
const slow = new Promise((resolve) => setTimeout(() => resolve('pozdě'), 300));
const fast = new Promise((resolve) => setTimeout(() => resolve('včas'), 10));
assert.equal(await withTimeout(fast, 200), 'včas', 'withTimeout(rychlá Promise, 200) se má splnit její hodnotou');
let caught = null;
await withTimeout(slow, 30).catch((error) => {
  caught = error;
});
assert.equal(caught?.message, 'Vypršel čas', 'withTimeout(pomalá Promise, 30) se má zamítnout chybou „Vypršel čas"');
```

### --solution--

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Vypršel čas')), ms);
  });
  return Promise.race([promise, timeout]);
}
```

### --why--

`Promise.race` vezme první usazenou Promise. Požadavek za pomalou Promise tím ale nezrušíš; to umí jen `signal` předaný přímo do `fetch`.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any

## --card-- free

Proč dlouhý synchronní výpočet v handleru kliknutí zastaví animaci odpočtu i psaní do pole? Co s tím uděláš?

### --back--

JavaScript stránky běží v jednom vlákně a handler kliknutí je jedna úloha. Dokud neskončí, event loop nespustí žádnou další úlohu (časovač odpočtu, událost `input`) a prohlížeč nemůže stránku překreslit, protože vykresluje jen mezi úlohami. Pomůže rozdělit práci do krátkých dávek, mezi kterými se přes `setTimeout` pustí ke slovu fronta a vykreslení, nebo opravdu těžký výpočet přesunout do Web Workeru. Uživateli je dobré ukázat stav ještě předtím, než práce začne.

### --see--

js-async/event-loop#dlouhy-vypocet-zamrazi-stranku

## --card-- free

Jaký je rozdíl mezi úlohou a mikroúlohou? Uveď příklad každé a řekni, v jakém pořadí se spouštějí.

### --back--

Úlohu (*task*) zařadí do fronty prohlížeč: callback časovače, událost jako kliknutí nebo zpráva. Mikroúloha (*microtask*) je přednostní: callback `then`, `catch`, `finally`, pokračování za `await` nebo `queueMicrotask`. Event loop vezme jednu úlohu, po ní vyprázdní celou frontu mikroúloh, i těch, které mezitím přibyly, a teprve pak smí prohlížeč překreslit stránku a vzít další úlohu. Proto `then` předběhne `setTimeout(fn, 0)`.

### --see--

js-async/event-loop#mikroulohy-promise-ma-prednost

## --card-- free

Kdy použiješ `Promise.all`, `Promise.allSettled`, `Promise.race` a `Promise.any`?

### --back--

`Promise.all`, když potřebuju všechny výsledky a bez jednoho nemá smysl pokračovat: zamítne se při první chybě. `Promise.allSettled`, když jsou zdroje nezávislé a chci ukázat, co se povedlo: počká na všechny a u každého řekne `fulfilled`, nebo `rejected`. `Promise.race` vezme první usazenou Promise, ať dopadla jakkoli, typicky na časový limit. `Promise.any` vezme první úspěšnou a chyby přeskakuje, třeba u několika zrcadel stejného souboru.

### --see--

js-async/promise#vic-promise-najednou-all-allsettled-race-a-any

## --card-- free

Co všechno se může pokazit mezi `fetch(url)` a vykreslením dat a jak každý případ ošetříš?

### --back--

Odpověď vůbec nedorazí (výpadek sítě, CORS, zrušení): `fetch` se zamítne a chytí to `catch`, zrušení přitom tiše ukončím podle `error.name`. Odpověď dorazí s chybovým stavem: `fetch` se splní, takže kontroluju `response.ok` a sám vyhodím chybu. Tělo není JSON, třeba HTML stránka z proxy: `response.json()` vyhodí `SyntaxError`, proto nejdřív stav a případně `content-type`. A data můžou mít jiný tvar, než čekám, tak je před vykreslením zkontroluju. Uživateli pak ukážu stav chyby s možností zkusit znovu, ne prázdnou stránku.

### --see--

js-async/fetch#404-a-500-nejsou-pro-fetch-chyba

## --card-- free

Co je souběh odpovědí (*race condition*) u vyhledávání a jak ho vyřešíš?

### --back--

Při psaní odchází požadavek za požadavkem a odpovědi nepřicházejí v pořadí, v jakém odešly: krátký dotaz „Pra" může odpovědět později než „Praha" a přepsat novější výsledek starším. Na localhostu se to skoro neukáže, na pomalé síti ano. Řeším to zrušením předchozího požadavku přes `AbortController`, který ušetří i síť, nebo si pamatuju číslo posledního požadavku a po `await` výsledek zahodím, když už není poslední. Počet požadavků navíc zmenší `debounce`, ale sám souběh nevyřeší.

### --see--

js-async/fetch#soubeh-odpovedi-starsi-nesmi-prepsat-novejsi

## --card-- free

Co je CORS, kdo ho vynucuje a proč nepomůže `mode: 'no-cors'`?

### --back--

Prohlížeč dovolí skriptu číst odpovědi jen ze stejného původu, tedy stejného schématu, domény a portu. CORS jsou pravidla, podle kterých cizí server hlavičkou `Access-Control-Allow-Origin` řekne, že jeho odpovědi smí stránka z jiného původu číst. Vynucuje to prohlížeč, proto stejná adresa v `curl` funguje a opravuje se to na serveru nebo přes vlastní proxy, ne ve `fetch`. `mode: 'no-cors'` chybu jen schová: odpověď je neprůhledná, se stavem 0 a prázdným tělem.

### --see--

js-async/fetch#cors-z-pohledu-prohlizece

## --card-- free

Jak funguje zrušení přes `AbortController` a proč se o něm říká, že je to jen žádost?

### --back--

`AbortController` je ovladač a jeho `signal` předám funkci, kterou chci umět zrušit, třeba `fetch(url, { signal })`. Po `controller.abort()` se signál označí jako zrušený a funkce, které ho poslouchají, přestanou pracovat a zamítnou se chybou `AbortError`. Žádost je to proto, že nic nezruší funkci, která signál nedostala nebo ho nehlídá, a hotovou práci nevrátí. Časový limit dá `AbortSignal.timeout(ms)` a víc signálů spojí `AbortSignal.any`.

### --see--

js-async/async-await#zruseni-abortcontroller-a-signal

## --card-- free

Jaké stavy musí mít obrazovka, která načítá data ze serveru, a jak je zpřístupníš čtečce obrazovky?

### --back--

Aspoň čtyři: načítání, data, prázdný výsledek („nic jsme nenašli") a chyba s možností zkusit znovu. Každý potřebuje vlastní vzhled a při přechodu mezi nimi nesmí zůstat nic z předchozího stavu, třeba staré výsledky pod chybovou hláškou. Čtečce oznámím změny textu přes prvek s `role="status"` (u chyby `role="alert"`) a oblast, která se právě načítá, označím `aria-busy="true"`. Úklid po úspěchu i po chybě dělám ve `finally`.

### --see--

js-async/fetch#stavy-nacitani-chyba-a-prazdno
