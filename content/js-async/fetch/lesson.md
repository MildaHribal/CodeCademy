# fetch a HTTP z prohlížeče

:::check pretest
Aplikace načte `/api/products/999`, ale produkt s tímhle číslem neexistuje a server odpoví stavem `404`. Co udělá tenhle kód?

```js
try {
  const response = await fetch('/api/products/999');
  console.log('dorazilo');
} catch (error) {
  console.log('chyba');
}
```

### --answer--

Vypíše `chyba`, protože `404` je chyba.

#### --why--

Pro server je to chyba, pro `fetch` ne. Na co přesně `fetch` odpovídá, uvidíš v první a druhé části.

### --correct--

Vypíše `dorazilo`.

#### --why--

`fetch` se zamítne, jen když odpověď vůbec nedorazí. `404` je odpověď jako každá jiná. Jak ji poznat, ukáže druhá část.

### --answer--

Nevypíše nic, `fetch` na neexistující adresu čeká donekonečna.

#### --why--

Server odpověděl hned, jen stavem `404`. Co s takovou odpovědí `fetch` udělá, uvidíš v druhé části.
:::

:::check pretest
Co je v proměnné `response` po `const response = await fetch('/api/products');`?

### --answer--

Pole produktů, které server poslal.

#### --why--

Tak to vypadá v mnoha návodech, jenže mezi odpovědí a daty je ještě jeden krok. Jaký, ukáže první část.

### --correct--

Objekt s informacemi o odpovědi, data z něj musíš ještě přečíst.

#### --why--

`fetch` vrací objekt `Response` se stavem a hlavičkami. Tělo se čte zvlášť, další metodou s dalším `await`.

### --answer--

Text JSON, který je potřeba převést přes `JSON.parse`.

#### --why--

Text by to být mohl, ale `fetch` ho nevrací přímo. Co vrací, ukáže první část.
:::

Katalog e-shopu, předpověď počasí, komentáře pod článkem, našeptávač adres: skoro každá dnešní stránka si po načtení stahuje data ze serveru a vykresluje je bez obnovení stránky. V prohlížeči na to je funkce `fetch`. Vypadá jednoduše, a proto se v ní dělají chyby, které se na localhostu neprojeví a v produkci zobrazí prázdnou stránku.

> [!REMEMBER]
> **`fetch` odpovídá na otázku „dorazila odpověď?", ne „povedlo se to?".** Stav odpovědi, tělo a jeho formát kontroluješ sám.

## Co vrací `fetch`: nejdřív odpověď, pak data

`fetch(url)` pošle požadavek HTTP a vrátí Promise. Ta se splní, **jakmile dorazí stavový řádek a hlavičky** odpovědi, a jejím výsledkem je objekt `Response`. Tělo odpovědi v tu chvíli ještě nemusí být stažené, proto se čte zvlášť a znovu přes `await`:

- `response.status` — číselný stav (`200`, `404`, `500`…),
- `response.ok` — `true` pro stavy 200–299, jinak `false`,
- `response.headers.get('content-type')` — hlavička odpovědi,
- `await response.json()` — tělo převedené z JSON na hodnotu,
- `await response.text()` — tělo jako text.

Ukázky v téhle lekci nesahají na internet. Na prvním řádku si `fetch` vždycky nahradíme malou funkcí, která vrátí **stejný objekt `Response`**, jaký vrací prohlížeč. Kód pod ní je přesně ten, který napíšeš proti skutečnému serveru.

:::live js
```js
// místo sítě: falešný server, který vrátí dva produkty
const fetch = async (url) =>
  new Response(JSON.stringify([{ name: 'Čelovka 400 lm', price: 490 }, { name: 'Termoska 0,75 l', price: 590 }]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

async function loadProducts() {
  const response = await fetch('/api/products');
  console.log('stav:', response.status, response.ok);
  console.log('typ:', response.headers.get('content-type'));

  const products = await response.json();
  console.log('první produkt:', products[0].name);
}

loadProducts();
```
:::

Zkus smazat `await` před `response.json()` a sleduj, co se vypíše místo názvu produktu. Pak změň `status: 200` na `status: 404` a sleduj, co se stane s `response.ok` — a jestli kód spadne.

:::check
Která dvě `await` potřebuješ, abys z adresy `/api/news` dostal pole článků?

### --answer--

Jedno stačí: `const news = await fetch('/api/news');`

#### --why--

První `await` dá objekt `Response`, ne data. Tělo se z odpovědi čte další metodou, která taky vrací Promise.

### --correct--

`const response = await fetch('/api/news');` a pak `const news = await response.json();`

#### --why--

`fetch` se splní odpovědí se stavem a hlavičkami a `response.json()` teprve přečte a převede tělo. Obojí vrací Promise.

### --answer--

`await fetch('/api/news')` a pak `JSON.parse(response)`.

#### --why--

`JSON.parse` potřebuje text, ne objekt `Response`. Tělo odpovědi musíš nejdřív přečíst, a to je asynchronní.

### --see--

js-async/fetch#co-vraci-fetch-nejdriv-odpoved-pak-data
:::

## 404 a 500 nejsou pro `fetch` chyba

Server na požadavek vždycky něco odpoví: produkt nenašel (`404`), nemáš přístup (`401`, `403`), sám spadl (`500`). Pro `fetch` je každá z těch odpovědí úspěch — přišla. Promise se **zamítne jen tehdy, když žádná odpověď nedorazí**: nejde síť, server neexistuje, prohlížeč odpověď zablokoval kvůli CORS nebo jsi požadavek zrušil. Chyba pak v Chromu zní `TypeError: Failed to fetch`.

:::live js predict
```js
// falešný server: databáze právě neběží
const fetch = async () =>
  new Response(JSON.stringify({ error: 'Databáze neodpovídá' }), { status: 500 });

async function loadOrders() {
  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();
    console.log('načteno:', orders.length);
  } catch (error) {
    console.log('chyba:', error.message);
  }
}

loadOrders();
```
--question-- Co vypíše tenhle kód?
--expected-- načteno: undefined
--why-- Odpověď se stavem `500` dorazila, takže `fetch` se splnil a `catch` se nespustí. Tělo je platný JSON s chybovou zprávou, a tak `response.json()` projde taky. Kód pak pracuje s objektem `{ error: … }`, jako by to bylo pole objednávek, a `orders.length` je `undefined`. Uživatel uvidí „0 objednávek" nebo prázdnou tabulku místo chyby. Zkus za první `await` přidat podmínku, která při `!response.ok` vyhodí chybu se stavem, a sleduj, kam kód doběhne.
:::

Kontrolu stavu proto píšeš sám, hned za `fetch`:

```js
const response = await fetch('/api/orders');
if (!response.ok) {
  throw new Error(`Server odpověděl ${response.status}`);
}
const orders = await response.json();
```

> [!REMEMBER]
> **Za každým `fetch` následuje kontrola `response.ok`.** Bez ní se chybová odpověď tváří jako data a chyba se ukáže až o kus dál, jako `undefined` nebo `x.map is not a function`.

:::explain
Na pohovoru dostaneš otázku: „Proč `fetch` u odpovědi 404 neskončí v `catch` a jak to v kódu ošetříte?"

## --model--

`fetch` se zamítne jen tehdy, když odpověď vůbec nedorazí, třeba při výpadku sítě, zablokování kvůli CORS nebo zrušení požadavku. Stav 404 nebo 500 je normální odpověď serveru, takže se Promise splní objektem `Response`. Jestli se požadavek povedl, poznám podle `response.ok`, které je `true` jen pro stavy 200 až 299. Proto hned za `fetch` kontroluju `if (!response.ok)` a vyhodím chybu se stavem, aby ji zachytil stejný `catch` jako výpadek sítě.

## --checklist--

- `fetch` se zamítne jen, když odpověď nedorazí (síť, CORS, zrušení).
- Stav 404 nebo 500 je odpověď, `fetch` se splní.
- `response.ok` je `true` jen pro stavy 200–299.
- Za `fetch` kontroluju `response.ok` a při neúspěchu vyhodím chybu sám.
:::

:::check
Kdy skončí `await fetch(url)` v bloku `catch`? Vyber všechny správné možnosti.

### --correct--

Uživatel nemá připojení k internetu.

#### --why--

Odpověď nedorazí, `fetch` se zamítne chybou `TypeError`.

### --answer--

Server odpoví `401 Unauthorized`, protože uživatel není přihlášený.

#### --why--

Server odpověděl, i když nepříjemně. `fetch` se splní a `response.ok` je `false`.

### --correct--

Požadavek zrušíš přes `AbortController`.

#### --why--

Zrušený `fetch` se zamítne chybou `AbortError`.

### --answer--

Server vrátí `500 Internal Server Error`.

#### --why--

Chyba serveru je pořád odpověď se stavem. Poznáš ji podle `response.ok`, ne podle `catch`.

### --see--

js-async/fetch#404-a-500-nejsou-pro-fetch-chyba
:::

## JSON tam a zpátky: metoda, hlavičky a tělo

Bez druhého argumentu pošle `fetch` požadavek `GET`. Když chceš data na server poslat, předáš objekt voleb:

```js
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: 3, stars: 5, text: 'Svítí celou noc' }),
});
```

- `method` — `POST` na vytvoření, `PUT` nebo `PATCH` na úpravu, `DELETE` na smazání,
- `headers` — hlavička `Content-Type` říká serveru, v jakém formátu je tělo,
- `body` — tělo požadavku jako **text**. Objekt na JSON převede `JSON.stringify`.

Co se stane, když `JSON.stringify` vynecháš?

:::live js predict
```js
// falešný server: odpoví přesně tím tělem, které dostal
const fetch = async (url, options) => new Response(options.body);

async function saveReview() {
  const review = { stars: 5, text: 'Rychlé doručení' };
  const response = await fetch('/api/reviews', { method: 'POST', body: review });
  console.log(await response.text());
}

saveReview();
```
--question-- Co vypíše tenhle kód?
--expected-- [object Object]
--why-- Tělo požadavku musí být text (nebo `FormData`, `Blob` a podobně). Obyčejný objekt prohlížeč převede na text přes `String(review)` a z toho vznikne `[object Object]`. Server pak dostane nesmysl a odpoví `400`. Zkus `body: review` přepsat na `body: JSON.stringify(review)`.
:::

Parametry do adresy (*query string*) neskládej ručně spojováním textů. Čeština, mezery a znaky `&` nebo `?` by adresu rozbily. Postará se o ně `URLSearchParams`:

```js
const params = new URLSearchParams({ q: 'Český Krumlov', page: 2 });
const response = await fetch(`/api/places?${params}`);
// požadavek jde na /api/places?q=%C4%8Cesk%C3%BD+Krumlov&page=2
```

:::check
Napiš výraz, který z proměnné `query` s textem `Plzeň & okolí` vyrobí správně zakódovaný query string pro parametr `q` (výsledek bez otazníku).

### --expected--

new URLSearchParams({ q: query }).toString()

### --accept--

new URLSearchParams({ q: query })
`q=${encodeURIComponent(query)}`
'q=' + encodeURIComponent(query)
"q=" + encodeURIComponent(query)
new URLSearchParams({ q: query }) + ''
String(new URLSearchParams({ q: query }))

### --why--

`URLSearchParams` zakóduje diakritiku, mezery i `&`, takže znak `&` v názvu nerozdělí parametr na dva. Pro jeden parametr stačí i `encodeURIComponent`. Ruční `'q=' + query` by poslalo `q=Plzeň ` a zbytek `okolí` jako další, prázdný parametr.

### --see--

js-async/fetch#json-tam-a-zpatky-metoda-hlavicky-a-telo
:::

## Jedna funkce na načítání JSON

Kontrola stavu, čtení těla a srozumitelná chyba se opakují u každého požadavku. V projektu je proto napíšeš jednou:

:::live js
```js
// falešný server: /api/stock/7 je v pořádku, jiná čísla neexistují
const fetch = async (url) => {
  if (url === '/api/stock/7') return Response.json({ code: 7, pieces: 12 });
  return Response.json({ error: 'Zboží nenalezeno' }, { status: 404 });
};

async function getJSON(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Server odpověděl ${response.status}`);
  }
  return data;
}

async function showStock(code) {
  try {
    const stock = await getJSON(`/api/stock/${code}`);
    console.log(`Skladem ${stock.pieces} ks`);
  } catch (error) {
    console.log(`Nepodařilo se: ${error.message}`);
  }
}

showStock(7);
showStock(99);
```
:::

`Response.json(data, volby)` je jen zkratka, kterou si falešný server vyrobí odpověď s JSON tělem. Zkus u druhého volání falešnému serveru místo JSON vrátit HTML stránku: `return new Response('<!DOCTYPE html><h1>Nenalezeno</h1>', { status: 404 });` a sleduj hlášku.

Skutečné servery při chybě často vrací HTML (stránku „404" nebo chybu proxy), ne JSON. `response.json()` na HTML v Chromu skončí chybou `SyntaxError: Failed to execute 'json' on 'Response': Unexpected token '<', "<!DOCTYPE "... is not valid JSON`. Když si nejsi jistý, co server vrací, zkontroluj nejdřív `response.ok` a hlavičku `content-type`, a teprve pak čti tělo.

> [!NOTE]
> Tělo odpovědi jde přečíst **jen jednou**. Druhé `response.json()` nebo `response.text()` na stejné odpovědi skončí chybou `TypeError: Failed to execute 'json' on 'Response': body stream already read`. Když potřebuješ tělo dvakrát, přečti ho jednou do proměnné.

:::check
`getJSON` na chybu 503 z proxy dostane HTML stránku a hlásí `SyntaxError: Unexpected token '<'`. Jak ji upravit, aby uživatel dostal smysluplnou zprávu se stavem?

### --answer--

Obalit `response.json()` do dalšího `fetch`.

#### --why--

Druhý požadavek nepomůže, odpověď už máš. Jde o to, v jakém pořadí se ptáš na stav a čteš tělo.

### --correct--

Nejdřív zkontrolovat `response.ok` a u neúspěchu vyhodít chybu se stavem, tělo jako JSON číst až u úspěšné odpovědi.

#### --why--

Chybová odpověď může mít jakýkoli formát. Stav je k dispozici vždy, takže chybu postavíš z něj; JSON čteš, jen když víš, že přišel.

### --answer--

Zavolat `response.json()` dvakrát, podruhé to projde.

#### --why--

Tělo jde přečíst jen jednou a HTML se na JSON nezmění ani napodruhé.

### --see--

js-async/fetch#jedna-funkce-na-nacitani-json
:::

## CORS z pohledu prohlížeče

Stránka z `https://moje-pocasi.cz` zavolá `fetch('https://api.pocasi-data.cz/forecast')`. Server odpověděl a v záložce Network v DevTools požadavek vidíš (Chrome u něj napíše *CORS error*), a přesto kód skončí v `catch` a konzole hlásí:

```text
Access to fetch at 'https://api.pocasi-data.cz/forecast' from origin 'https://moje-pocasi.cz'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Prohlížeč hlídá pravidlo stejného původu (*same-origin policy*): [[původ]] (*origin*) je schéma, doména a port. Skript smí číst odpovědi ze **svého** původu. Z cizího jen tehdy, když to cizí server výslovně dovolí hlavičkou `Access-Control-Allow-Origin`. Tomu se říká [[CORS]] (*Cross-Origin Resource Sharing*).

Pro frontend z toho plynou tři věci:

- **Rozhoduje server, ne tvůj kód.** Žádná volba `fetch` CORS neobejde. Buď hlavičku přidá server, nebo požadavek pošle tvůj vlastní backend (proxy) a prohlížeč mluví jen se stejným původem.
- **U „složitějších" požadavků se prohlížeč nejdřív zeptá.** Požadavek s `Content-Type: application/json` nebo vlastní hlavičkou předchází automatický dotaz `OPTIONS` (*preflight*). V záložce Network ho uvidíš jako samostatný řádek.
- **CORS chrání uživatele, ne server.** `curl` nebo Node stejnou adresu přečtou bez potíží, protože pravidlo platí jen ve skriptech prohlížeče.

> [!PITFALL]
> **`mode: 'no-cors'` chybu neopraví, jen ji schová.** `fetch` se sice splní, ale odpověď je neprůhledná: `response.status` je `0`, `response.ok` `false` a tělo prázdné. Oprava: povolení na serveru, nebo proxy přes vlastní backend. Jak na to ve vývojovém serveru, uvidíš v sekci o modulech a Vite.

:::check
Frontend na `http://localhost:5173` volá API na `http://localhost:3000` a dostane chybu CORS. Kde je potřeba to opravit?

### --answer--

Ve `fetch` přidat volbu `mode: 'no-cors'`.

#### --why--

Požadavek pak projde, ale odpověď bude neprůhledná: stav `0`, prázdné tělo. Data stejně nepřečteš.

### --answer--

Nikde, na `localhost` CORS neplatí.

#### --why--

Původ je schéma, doména **a port**. `localhost:5173` a `localhost:3000` jsou dva různé původy.

### --correct--

Na serveru na portu 3000: má posílat hlavičku `Access-Control-Allow-Origin` s původem frontendu (nebo frontend volá API přes proxy stejného původu).

#### --why--

O tom, kdo smí odpověď číst, rozhoduje server svými hlavičkami. Prohlížeč jen vynucuje, co server povolil.

### --see--

js-async/fetch#cors-z-pohledu-prohlizece
:::

## Zrušení a časový limit

`fetch` přijímá `signal` stejně jako funkce z lekce o `async`/`await`. Zrušený požadavek prohlížeč opravdu přeruší, takže přestane zabírat síť, a Promise se zamítne chybou `AbortError`. Časový limit dostaneš přes `AbortSignal.timeout`, chyba se pak jmenuje `TimeoutError`:

```js
try {
  const response = await fetch('/api/forecast?place=brno', { signal: AbortSignal.timeout(5000) });
  // …
} catch (error) {
  if (error.name === 'TimeoutError') showError('Server neodpověděl do pěti sekund.');
  else if (error.name === 'AbortError') return;
  else showError('Nepodařilo se připojit.');
}
```

`fetch` sám žádný rozumný limit nemá: bez signálu může na pomalý server čekat klidně minuty.

:::check
Uživatel klikne na **Zrušit** a zavolá se `controller.abort()`. V `catch` máš kód, který každou chybu ukáže červeně v rámečku. Co uživatel uvidí a jak to napravit?

### --answer--

Nic, zrušený `fetch` se tiše splní s prázdnou odpovědí.

#### --why--

Zrušený `fetch` se nesplní, zamítne se. Kam taková chyba doteče?

### --correct--

Červený rámeček s hláškou o zrušení. V `catch` je potřeba nejdřív poznat `error.name === 'AbortError'` a skončit bez chyby.

#### --why--

Zrušení je chtěné a končí stejným `catch` jako porucha. Proto ho odlišíš podle jména chyby.

### --see--

js-async/fetch#zruseni-a-casovy-limit
:::

## Souběh odpovědí: starší nesmí přepsat novější

Našeptávač míst posílá požadavek při každém napsaném písmenu. Odpovědi ale nepřicházejí v pořadí, v jakém odešly: krátký dotaz „Pra" najde stovky míst a server ho zpracovává déle než „Praha".

:::live js predict
```js
// falešný server: krátký dotaz hledá déle než dlouhý
const fetch = (url) => {
  const query = new URLSearchParams(url.split('?')[1]).get('q');
  const delay = query.length < 4 ? 80 : 20;
  return new Promise((resolve) => setTimeout(() => resolve(Response.json([`výsledky pro ${query}`])), delay));
};

async function search(query) {
  const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
  const places = await response.json();
  console.log('zobrazeno:', places[0]);
}

search('Pra');
search('Praha');
```
--question-- Co vypíše tenhle kód? Napiš výpis pod sebe. Co zůstane uživateli na obrazovce?
--expected--
```text
zobrazeno: výsledky pro Praha
zobrazeno: výsledky pro Pra
```
--why-- Obě hledání běží souběžně. „Praha" dorazí po 20 ms a vykreslí se, „Pra" dorazí až po 80 ms a přepíše ji. Uživatel napsal „Praha", ale vidí výsledky pro „Pra". Takové chybě se říká [[souběh odpovědí]] (*race condition*) a na localhostu, kde je všechno rychlé, se skoro nikdy neprojeví.
:::

Dvě běžné opravy:

- **zrušit předchozí požadavek** přes `AbortController` — ušetří síť i server a stará odpověď nikdy nedorazí,
- **zapamatovat si číslo posledního požadavku** a výsledek zahodit, když mezitím odešel novější: `const requestId = ++lastRequestId;` a po `await` `if (requestId !== lastRequestId) return;`. Hodí se tam, kde zrušit nejde.

:::live js
```js
// falešný server jako výš, jen umí zrušení přes signal
const fetch = (url, { signal } = {}) => {
  const query = new URLSearchParams(url.split('?')[1]).get('q');
  const delay = query.length < 4 ? 80 : 20;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(Response.json([`výsledky pro ${query}`])), delay);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
};

let searchController;

async function search(query) {
  searchController?.abort();
  searchController = new AbortController();
  try {
    const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`, { signal: searchController.signal });
    const places = await response.json();
    console.log('zobrazeno:', places[0]);
  } catch (error) {
    if (error.name === 'AbortError') return console.log('zrušeno:', query);
    throw error;
  }
}

search('Pra');
search('Praha');
```
:::

Zkus smazat řádek `searchController?.abort();` a sleduj, že se chyba vrátí. Pak ho vrať a prohoď obě volání `search`: poslední slovo má vždycky to hledání, které začalo naposledy.

> [!REMEMBER]
> **Na obrazovce smí skončit jen odpověď na poslední požadavek.** Starší požadavek zruš, nebo jeho výsledek zahoď podle čísla požadavku.

:::check
Našeptávač si pamatuje `lastRequestId` a po `await` porovná `requestId !== lastRequestId`. Proč tohle porovnání musí být **až za** `await`, a ne před `fetch`?

### --answer--

Před `fetch` ještě `requestId` neexistuje.

#### --why--

Číslo se přiděluje hned na začátku funkce. Rozhoduje, kdy už může existovat novější požadavek.

### --correct--

Novější požadavek může začít až během čekání, takže před `fetch` by porovnání vždycky prošlo.

#### --why--

V okamžiku odeslání je každý požadavek zatím poslední. Jestli ho mezitím něco předběhlo, zjistíš až po návratu z `await`.

### --answer--

Za `await` je porovnání rychlejší, protože běží jako mikroúloha.

#### --why--

Rychlost tu nehraje roli. Jde o to, co se může stát mezi odesláním a odpovědí.

### --see--

js-async/fetch#soubeh-odpovedi-starsi-nesmi-prepsat-novejsi
:::

## Stavy: načítání, chyba a prázdno

Obrazovka, která načítá data, není „hotová, nebo prázdná". Má aspoň čtyři stavy a každý potřebuje vlastní vzhled: **načítám**, **data**, **nic jsme nenašli** a **chyba s možností zkusit znovu**. Nejčastější chyba v portfoliích juniorů je, že ukazují jen stav „data".

:::live dom
```html
<section class="panel" aria-labelledby="title">
  <h2 id="title">Recenze</h2>
  <p>
    <button type="button" data-scenario="ok">Načíst</button>
    <button type="button" data-scenario="empty">Načíst prázdné</button>
    <button type="button" data-scenario="error">Načíst s chybou</button>
  </p>
  <p id="status" role="status"></p>
  <ul id="reviews"></ul>
</section>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; color: #1d2a24; }
.panel { max-width: 28rem; padding: 1rem 1.25rem; border: 1px solid #e4dccd; border-radius: 0.8rem; background: #fffdf9; }
button { font: inherit; padding: 0.4rem 0.8rem; margin-inline-end: 0.3rem; border-radius: 0.5rem; border: 1px solid #1f5243; background: #fff; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: wait; }
#status { min-height: 1.5em; color: #637269; }
#status.is-error { color: #b42318; font-weight: 600; }
```
```js
// falešný server se třemi scénáři
const scenarios = {
  ok: () => Response.json([{ author: 'Jana', text: 'Svítí celou noc.' }, { author: 'Petr', text: 'Rychlé doručení.' }]),
  empty: () => Response.json([]),
  error: () => new Response('Chyba serveru', { status: 500 }),
};
const fetch = (url) => new Promise((resolve) => setTimeout(() => resolve(scenarios[url.split('=')[1]]()), 600));

const status = document.querySelector('#status');
const list = document.querySelector('#reviews');

async function loadReviews(scenario, button) {
  // 1. stav načítání
  button.disabled = true;
  status.classList.remove('is-error');
  status.textContent = 'Načítám recenze…';
  list.replaceChildren();
  try {
    const response = await fetch(`/api/reviews?scenario=${scenario}`);
    if (!response.ok) throw new Error(`Server odpověděl ${response.status}`);
    const reviews = await response.json();
    // 2. prázdno, nebo data
    status.textContent = reviews.length ? `Recenzí: ${reviews.length}` : 'Zatím tu nejsou žádné recenze.';
    list.replaceChildren(...reviews.map((review) => {
      const item = document.createElement('li');
      item.textContent = `${review.author}: ${review.text}`;
      return item;
    }));
  } catch (error) {
    // 3. chyba
    status.classList.add('is-error');
    status.textContent = `Recenze se nepodařilo načíst (${error.message}).`;
  } finally {
    button.disabled = false;
  }
}

document.querySelector('.panel').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-scenario]');
  if (button) loadReviews(button.dataset.scenario, button);
});
```
:::

Klikni na všechna tři tlačítka. Pak zkus smazat řádek `list.replaceChildren();` na začátku funkce a načti nejdřív recenze a potom chybu: staré recenze zůstanou pod chybovou hláškou a tváří se jako aktuální.

Odstavec `#status` má `role="status"`, takže čtečka obrazovky každou změnu textu přečte, aniž by uživatel musel hledat, co se změnilo. `finally` vrátí tlačítko do původního stavu po úspěchu i po chybě.

:::check
Proč je `button.disabled = false` ve `finally`, a ne na konci bloku `try`?

### --answer--

Ve `finally` se tlačítko odemkne dřív, než dorazí data.

#### --why--

`finally` běží až po skončení `try` nebo `catch`, ne dřív. Rozhoduje, **kdy všude** se odemknutí provede.

### --correct--

Aby se tlačítko odemklo i tehdy, když načítání skončí chybou.

#### --why--

Na konci `try` by se při chybě řádek přeskočil a tlačítko by zůstalo zamčené, takže uživatel nemůže zkusit znovu.

### --see--

js-async/fetch#stavy-nacitani-chyba-a-prazdno
:::

## Typické chyby a pasti

### Chybí kontrola `response.ok`

> [!PITFALL]
> **Chybová odpověď se zpracuje jako data.** Příznak: místo chyby prázdný seznam, `undefined` v textu nebo `TypeError: products.map is not a function`, protože tělo je `{ error: … }`. Oprava: hned za `fetch` `if (!response.ok) throw new Error(…)`.

### `response.json()` bez `await`

> [!PITFALL]
> **`const data = response.json();` vrací Promise, ne data.** Příznak: `data.length` je `undefined`, v konzoli `Promise {<pending>}`. Oprava: `const data = await response.json();`.

### Objekt v `body` bez `JSON.stringify`

> [!PITFALL]
> **Server dostane text `[object Object]`.** Příznak: odpověď `400 Bad Request` nebo „neplatný JSON", přestože objekt v kódu vypadá správně. Oprava: `body: JSON.stringify(data)` a hlavička `Content-Type: application/json`.

:::check
Co vypíše tenhle kód?

```js
const fetch = async (url, options) => new Response(options.body);

fetch('/api/cart', { method: 'POST', body: JSON.stringify({ items: [3, 7] }) })
  .then((response) => response.json())
  .then((cart) => console.log(cart.items.length));
```

### --expected--

2

### --why--

Tělo tentokrát prošlo přes `JSON.stringify`, takže falešný server vrátil platný JSON `{"items":[3,7]}` a `response.json()` z něj udělá zase objekt s polem o dvou položkách. Bez `JSON.stringify` by v těle bylo `[object Object]` a `response.json()` by skončilo chybou `SyntaxError`.

### --see--

js-async/fetch#objekt-v-body-bez-json-stringify
:::

### HTML tam, kde čekáš JSON

> [!PITFALL]
> **`SyntaxError: … Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.** Server vrátil HTML stránku: překlep v adrese a stránka 404, přesměrování na přihlášení nebo chyba proxy. Oprava: zkontroluj adresu v záložce Network, `response.ok` před čtením těla a u nejistých serverů i `content-type`.

### Starší odpověď přepíše novější

> [!PITFALL]
> **Rychlé psaní nebo přepínání ukáže výsledek pro starší dotaz.** Příznak: na localhostu nikdy, v produkci občas, typicky u našeptávače, filtrů a záložek. Oprava: zrušit předchozí požadavek přes `AbortController`, nebo porovnat číslo požadavku po `await`.

## Kde to najdeš v MDN

- [Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) — průvodce: volby požadavku, čtení těla, kontrola stavu a zrušení; hledej oddíl *Checking response status*.
- [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) — vlastnosti `ok`, `status`, `headers` a metody na čtení těla včetně statické `Response.json()`.
- [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) — kdy prohlížeč posílá *preflight* a které hlavičky musí server vrátit.
- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — skládání a čtení query stringu bez ručního kódování.

Ve workshopu postavíš aplikaci na počasí, kde tohle všechno použiješ naostro: kontrolu stavu, stavy načítání a chyby, našeptávač se zrušením starších požadavků a časový limit.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
const fetch = async () => new Response('<!DOCTYPE html><h1>Přihlaste se</h1>', { status: 200 });

async function loadCart() {
  const response = await fetch('/api/cart');
  if (!response.ok) return 'chyba stavu';
  try {
    await response.json();
    return 'košík načten';
  } catch (error) {
    return error.name;
  }
}

loadCart().then(console.log);
```

### --expected--

SyntaxError

### --why--

Stav je `200`, takže kontrola `response.ok` projde. Tělo je ale HTML stránka s přihlášením, a `response.json()` ho neumí převést, proto se zamítne chybou `SyntaxError`. Stav `200` sám nezaručuje, že přišel JSON.

### --see--

js-async/fetch#jedna-funkce-na-nacitani-json

## --question--

Filtr produktů při každé změně zaškrtávátka volá `loadProducts(filters)` a výsledek vykreslí. Tester hlásí, že po rychlém klikání na „Skladem" a „Do 500 Kč" občas zůstanou na obrazovce produkty jen podle prvního filtru. Co je nejpravděpodobnější příčina?

### --answer--

Server vrací špatná data pro kombinaci filtrů.

#### --why--

Pomalé klikání funguje správně, takže server kombinaci filtrů zvládá. Chyba se projevuje jen při rychlém sledu požadavků.

### --correct--

Odpověď na starší požadavek dorazila později a přepsala výsledek novějšího.

#### --why--

Požadavky běží souběžně a odpovědi nepřicházejí v pořadí odeslání. Bez zrušení nebo kontroly čísla požadavku vyhraje ta, která dorazí poslední.

### --answer--

`fetch` při rychlém klikání vrací odpovědi z mezipaměti.

#### --why--

Mezipaměť by vracela stejná data pro stejnou adresu, ne data jiného filtru. Rozhoduje pořadí, v jakém odpovědi dorazí.

### --see--

js-async/fetch#soubeh-odpovedi-starsi-nesmi-prepsat-novejsi

## --question--

Doplň podmínku, která za `const response = await fetch(url);` pozná neúspěšnou odpověď se stavem mimo 200–299. Napiš jen výraz do závorek `if`.

### --expected--

!response.ok

### --accept--

response.ok === false
response.ok == false
response.status < 200 || response.status > 299
response.status < 200 || response.status >= 300

### --why--

`response.ok` je `true` přesně pro stavy 200–299. Negace je nejkratší a nejčitelnější zápis.

### --see--

js-async/fetch#404-a-500-nejsou-pro-fetch-chyba

## --question--

Stejná adresa API, která ve `fetch` na tvé stránce skončí chybou CORS, v terminálu přes `curl` vrátí data bez potíží. Proč?

### --answer--

`curl` posílá požadavek jinou metodou než `fetch`.

#### --why--

Oba mohou poslat úplně stejný `GET`. Rozdíl není v požadavku, ale v tom, kdo odpověď hlídá.

### --correct--

Pravidlo stejného původu a CORS vynucuje jen prohlížeč; server odpověděl v obou případech.

#### --why--

Server odpověď poslal i prohlížeči (v záložce Network je požadavek vidět), jen ji prohlížeč skriptu nevydal, protože chyběla hlavička `Access-Control-Allow-Origin`. Chrání tak uživatele před cizími stránkami, které by četly data jeho jménem.

### --answer--

Server rozpozná `curl` a CORS hlavičku mu přidá.

#### --why--

Hlavičku `Access-Control-Allow-Origin` nikdo kromě prohlížeče nečte. `curl` ji nepotřebuje, ať ji server pošle, nebo ne.

### --see--

js-async/fetch#cors-z-pohledu-prohlizece
