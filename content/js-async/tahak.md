> [!REMEMBER]
> **JavaScript dělá v jednu chvíli jen jednu věc.** Čekání obstará prohlížeč, `await` zastaví jen svou funkci a `fetch` odpovídá na „dorazila odpověď?", ne „povedlo se to?".

## Pořadí spuštění

| co | kdy se spustí |
|---|---|
| synchronní kód, executor `new Promise`, `async` funkce až k prvnímu `await` | hned |
| `then`, `catch`, `finally`, pokračování za `await`, `queueMicrotask` | [[mikroúloha]]: hned po doběhnutí aktuálního kódu, všechny najednou |
| `setTimeout`, `setInterval`, události | úloha z [[fronta úloh|fronty úloh]]: až je zásobník prázdný a mikroúlohy vyprázdněné |
| překreslení stránky | mezi úlohami; [[dlouhá úloha]] ho zdrží |

## Víc Promise najednou

| metoda | splní se | zamítne se | vrátí |
|---|---|---|---|
| `Promise.all` | všechny splněné | při první chybě | hodnoty v pořadí pole |
| `Promise.allSettled` | až se usadí všechny | nikdy | `{ status, value }` / `{ status, reason }` |
| `Promise.race` | první usazená je splněná | první usazená je zamítnutá | výsledek první usazené |
| `Promise.any` | první splněná | všechny selžou | hodnota, jinak `AggregateError` |

## `fetch`: co skončí kde

| situace | `fetch` | co udělat |
|---|---|---|
| stav 200–299 | splní se, `response.ok === true` | `await response.json()` |
| stav 404, 500… | splní se, `response.ok === false` | vyhodit chybu se stavem |
| výpadek sítě, [[CORS]] | zamítne se `TypeError: Failed to fetch` | ukázat chybu a „Zkusit znovu" |
| `controller.abort()` | zamítne se `AbortError` | tiše skončit |
| `AbortSignal.timeout(ms)` vypršel | zamítne se `TimeoutError` | ukázat „server neodpověděl včas" |
| tělo není JSON | `response.json()` vyhodí `SyntaxError` | kontrolovat stav, případně `content-type` |

## Vzory

```js
// Promise kolem callbacku nebo časovače
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// načtení JSON s kontrolou stavu
async function getJSON(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Server odpověděl ${response.status}`);
  return response.json();
}

// souběžně: nejdřív všechno spustit, pak čekat
const [profile, orders] = await Promise.all([loadProfile(), loadOrders()]);

// postupně: další krok až po předchozím
for (const file of files) {
  await upload(file);
}

// stavy načítání, chyby a úklid
async function showReviews() {
  list.setAttribute('aria-busy', 'true');
  try {
    render(await getJSON('/api/reviews'));
  } catch (error) {
    showError(error.message);
  } finally {
    list.removeAttribute('aria-busy');
  }
}

// starší požadavek zrušit, aby nepřepsal novější
let searchController;
async function search(query) {
  searchController?.abort();
  searchController = new AbortController();
  try {
    render(await getJSON(`/api/places?${new URLSearchParams({ q: query })}`, { signal: searchController.signal }));
  } catch (error) {
    if (error.name !== 'AbortError') showError(error.message);
  }
}

// časový limit a tlačítko Zrušit v jednom signálu
const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]);

// opakování s rostoucím čekáním
async function retry(fn, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === attempts) throw error;
      await sleep(100 * 2 ** (attempt - 1));
    }
  }
}
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| akce proběhne hned, časovač nic neudělá | `setTimeout(show(), 1000)` volá funkci hned | `setTimeout(show, 1000)` |
| odpočet se po návratu do karty rozchází s hodinami | počítá tiky, v kartě na pozadí jsou řidší | počítat z `deadline - Date.now()` |
| dvojnásobná rychlost, zdvojené položky | nový časovač nezrušil starý | uložit id a `clearTimeout` / `clearInterval` |
| další `then` dostane `undefined` a nečeká | callback se `{ }` bez `return` | `return` nebo šipka bez závorek |
| `[object Promise]`, `if (x)` platí vždy | chybí `await` | `await` před voláním |
| „Hotovo" dřív než uložení | `forEach` s `async` callbackem | `for…of` s `await` nebo `Promise.all` |
| `catch` s náhradní hodnotou se nespustí | `return promise` v `try` bez `await` | `return await promise` |
| stránka se načítá jako všechny požadavky dohromady | nezávislé `await` pod sebou | `Promise.all` |
| místo chyby prázdný seznam nebo `x.map is not a function` | chybí kontrola `response.ok` | `if (!response.ok) throw …` |
| server dostane `[object Object]` | objekt v `body` | `JSON.stringify` a `Content-Type: application/json` |
| chyba CORS, v Network je požadavek vidět | server neposlal `Access-Control-Allow-Origin` | povolit na serveru nebo proxy; ne `no-cors` |
| červená hláška po přepnutí zastávky | zrušení ošetřené jako chyba | `if (error.name === 'AbortError') return` |
| občas výsledek pro starší dotaz | [[souběh odpovědí]] | zrušit předchozí požadavek nebo porovnat číslo požadavku |
