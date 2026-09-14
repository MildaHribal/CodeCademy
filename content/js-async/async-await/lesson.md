# `async` a `await`

:::check pretest
Co vypíše tenhle kód? Tipni si, i když si nejsi jistý.

```js
async function loadPrice() {
  return 129;
}

const price = loadPrice();
console.log(price === 129);
```

### --answer--

`true`, funkce vrací `129`.

#### --why--

Tak to vypadá podle `return`. Co přesně vrací funkce označená `async`, ukáže první část lekce.

### --correct--

`false`

#### --why--

Funkce s `async` nevrací `129`, ale Promise, která se číslem `129` splní. Proč, vysvětlí první část lekce.

### --answer--

Kód skončí chybou, `return` v `async` funkci nejde.

#### --why--

`return` v `async` funkci jde a používá se běžně. Otázka je, co z funkce opravdu vyjde. To ukáže první část lekce.
:::

:::check pretest
Funkce postupně načte profil a objednávky: `const profile = await loadProfile();` a na dalším řádku `const orders = await loadOrders();`. Každé načtení trvá sekundu a na sobě nezávisí. Jak dlouho bude funkce čekat?

### --answer--

Asi sekundu, obě načtení běží zároveň.

#### --why--

Běžela by zároveň, kdyby obě začala dřív, než se na první čeká. Kdy se které načtení spustí, rozebere část o souběhu.

### --correct--

Asi dvě sekundy.

#### --why--

Druhé načtení začne až ve chvíli, kdy první skončilo. Jak to zrychlit, ukáže část o souběhu.

### --answer--

Vůbec, `await` nečeká, jen označí místo pro prohlížeč.

#### --why--

`await` opravdu čeká, jen neblokuje zbytek stránky. Jak přesně, uvidíš v druhé části.
:::

V labu s platebním terminálem potřebovala účtenka kartu i schválení najednou, takže `then` se muselo zanořit, nebo si kartu ukládat do proměnné vně řetězu. Takový kód se čte zprava doleva a zevnitř ven. Se `async`/`await` stejná platba vypadá jako obyčejný kód shora dolů:

```js
async function pay(amount) {
  const card = await readCard();
  const approval = await authorize(card, amount);
  return { amount, last4: card.number.slice(-4), approvalCode: approval.approvalCode };
}
```

Pořád jsou to Promise, jen jinak zapsané. Tak píše asynchronní kód dnes skoro každý projekt, React i Next.js.

> [!REMEMBER]
> **`await` pozastaví jen funkci, ve které je, ne celou stránku.** Zbytek funkce se spustí jako mikroúloha, až se Promise usadí; mezitím běží všechno ostatní.

## `async` funkce vždy vrací Promise

Slovo `async` před funkcí změní dvě věci. Uvnitř funkce smíš použít `await`. A funkce **vždycky vrátí Promise**: co vrátíš přes `return`, tím se Promise splní, a co vyhodíš přes `throw`, tím se zamítne.

:::live js
```js
async function loadStock(code) {
  if (code === 'X-99') {
    throw new Error(`Zboží ${code} neexistuje`);
  }
  return 4;
}

const result = loadStock('K-12');
console.log(result instanceof Promise);
result.then((pieces) => console.log('kusů:', pieces));

loadStock('X-99').catch((error) => console.log('chyba:', error.message));
```
:::

Na výsledek `async` funkce se tedy čeká stejně jako na každou jinou Promise: `then`, nebo `await` v jiné `async` funkci. Zkus v posledním řádku smazat `.catch(…)` a sleduj, co ukáže konzole: zamítnutí nikdo neobsloužil.

:::live js predict
```js
async function loadGreeting() {
  console.log('B');
  return 'ahoj';
}

console.log('A');
loadGreeting().then((text) => console.log(text));
console.log('C');
```
--question-- V jakém pořadí se vypíšou řádky? Napiš je pod sebe.
--expected--
```text
A
B
C
ahoj
```
--why-- `async` funkce se spustí hned a synchronně, dokud nenarazí na `await` nebo nedoběhne, proto `B` přijde hned po `A`. Vrácená Promise je ale splněná a callback `then` je vždy mikroúloha, takže `ahoj` počká, až doběhne `C`. Zkus před `return` přidat `await null;` a sleduj, že pořadí se nezmění.
:::

:::check
Co vrátí `getDiscount()`, když vypadá takhle?

```js
async function getDiscount() {
  return 0.2;
}
```

### --answer--

Číslo `0.2`.

#### --why--

`async` funkce nikdy nevrací hodnotu přímo, vždy ji zabalí do Promise.

### --correct--

Promise, která se splní číslem `0.2`.

#### --why--

Hodnota z `return` se stane hodnotou splnění. K číslu se dostaneš přes `await getDiscount()` nebo `then`.

### --answer--

Promise, která čeká navždy, protože funkce nic nečeká.

#### --why--

Když funkce na nic nečeká, Promise se splní hned, jakmile funkce doběhne.

### --see--

js-async/async-await#async-funkce-vzdy-vraci-promise
:::

## `await` přeruší funkci, ne program

`await promise` udělá tohle: když Promise ještě čeká, funkce se v tom místě **zastaví a vrátí řízení** tomu, kdo ji zavolal. Zásobník volání se uvolní a stránka může dělat cokoli jiného. Až se Promise usadí, zbytek funkce se naplánuje jako mikroúloha a pokračuje přesně za `await`, se všemi proměnnými tak, jak byly.

Když se Promise splní, `await` vrátí její hodnotu. Když se zamítne, `await` na tom místě **vyhodí chybu**, jako by tam stálo `throw`.

:::live js predict
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkout() {
  console.log('P');
  await sleep(20);
  console.log('Q');
}

console.log('K');
checkout();
console.log('R');
```
--question-- V jakém pořadí se vypíšou písmena? Napiš je pod sebe.
--expected--
```text
K
P
R
Q
```
--why-- `checkout` začne synchronně a vypíše `P`. Na `await` se zastaví a vrátí Promise, takže hlavní kód pokračuje a vypíše `R`. Až za 20 ms uplyne `sleep`, zbytek funkce pokračuje a vypíše `Q`. Zkus změnit `sleep(20)` na `sleep(0)` a sleduj, že `R` pořád předběhne `Q`.
:::

Takhle vypadá pozastavená funkce v paměti. Krokuj a sleduj, kde je `checkout`, zatímco běží zbytek skriptu:

:::memory
```js
console.log('K');
checkout();           // uvnitř: P, pak await sleep(20)
console.log('R');
// skript skončil, za 20 ms se sleep splní
// checkout pokračuje za await: Q
```
--step-- 1
stack -> @stack
paused -> @paused
@stack: [skript]
@paused: []
--step-- 2 | checkout vypsala P a na await se zastavila
stack -> @stack
paused -> @paused
@stack: [skript]
@paused: [checkout za await]
--step-- 3 | hlavní kód běží dál, checkout čeká mimo zásobník
stack -> @stack
paused -> @paused
@stack: [skript]
@paused: [checkout za await]
--step-- 4 | zásobník je prázdný, stránka může reagovat
stack -> @stack
paused -> @paused
@stack: []
@paused: [checkout za await]
--step-- 5 | sleep se splnil, zbytek checkout běží jako mikroúloha
stack -> @stack
paused -> @paused
@stack: [checkout]
@paused: []
:::

:::check
Uživatel klikne na **Zaplatit** a handler zavolá `await pay(amount)`, platba trvá tři sekundy. Může uživatel mezitím scrollovat a psát do polí?

### --answer--

Ne, `await` zablokuje stránku, dokud platba neskončí.

#### --why--

Zablokovala by ji jen synchronní práce. `await` funkci zastaví a uvolní zásobník, takže event loop může spouštět další úlohy.

### --correct--

Ano, handler se na `await` zastaví a stránka mezitím obsluhuje jiné úlohy.

#### --why--

Pozastavená funkce nedrží zásobník volání. Pokračuje až jako mikroúloha po splnění platby.

### --see--

js-async/async-await#await-prerusi-funkci-ne-program
:::

## Chyby: `try`/`catch` a `finally`

Protože zamítnutá Promise na `await` vyhodí chybu, chytáš ji obyčejným `try`/`catch`, jaký znáš ze synchronního kódu. `finally` se spustí po úspěchu i po chybě, typicky na schování načítání:

:::live js
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadStock(code) {
  await sleep(20);
  if (code === 'X-99') throw new Error(`Zboží ${code} neexistuje`);
  return 4;
}

async function showStock(code) {
  console.log('ukazuju načítání');
  try {
    const pieces = await loadStock(code);
    console.log(`skladem ${pieces} ks`);
  } catch (error) {
    console.log(`nepodařilo se: ${error.message}`);
  } finally {
    console.log('schovávám načítání');
  }
}

showStock('X-99');
```
:::

Zkus změnit `'X-99'` na `'K-12'` a sleduj, který blok se přeskočí. Porovnej to s řetězem `then`/`catch`/`finally` z lekce o Promise: dělá totéž, jen se to čte shora dolů.

:::live js predict
```js
async function loadReviews() {
  throw new Error('Recenze nedostupné');
}

async function showReviews() {
  try {
    return loadReviews();
  } catch (error) {
    return 'Recenze teď nejdou načíst';
  }
}

showReviews()
  .then((text) => console.log('then:', text))
  .catch((error) => console.log('catch:', error.message));
```
--question-- Co vypíše tenhle kód?
--expected-- catch: Recenze nedostupné
--why-- `return loadReviews()` vrátí zamítnutou Promise, ale **nepočká** na ni. Blok `try` tím skončí bez chyby, `catch` se nespustí a zamítnutí proteče ven ze `showReviews`. Chyba se vyhodí až na `await`, a ten tu chybí. Zkus napsat `return await loadReviews();` a sleduj, že se vypíše `then:` s náhradním textem.
:::

> [!PITFALL]
> **`return promise` uvnitř `try` chybu nechytí.** Příznak: `catch` s náhradní hodnotou se nikdy nespustí a volající dostane zamítnutí, jako by `try` nebylo. Oprava: v `try` piš `return await promise`, nebo výsledek nejdřív ulož přes `await` do proměnné.

:::check
Proč v kódu výš `catch` nechytil chybu z `loadReviews`?

### --answer--

`catch` v `async` funkci chyby z jiných funkcí nechytá.

#### --why--

Chytá je, když se vyhodí uvnitř bloku `try`. Rozhoduje, jestli se v `try` na zamítnutí počkalo.

### --correct--

V `try` chybí `await`, takže blok skončil dřív, než se zamítnutí změnilo na vyhozenou chybu.

#### --why--

Zamítnutá Promise se změní na vyhozenou chybu jen na `await`. `return promise` blok ukončí hned a zamítnutí přijde až venku.

### --answer--

`loadReviews` vyhodí chybu synchronně, ještě před `try`.

#### --why--

`async` funkce nikdy nevyhazuje synchronně, `throw` v ní zamítne vrácenou Promise. A volání `loadReviews()` je uvnitř `try`.

### --see--

js-async/async-await#chyby-try-catch-a-finally
:::

## Postupně, nebo souběžně

`await` na každém řádku čeká, než začne další řádek. Když jsou dvě načtení **závislá** (schválení potřebuje kartu), je to správně. Když jsou **nezávislá** (profil a objednávky), zbytečně na sebe čekají.

Souběžné spuštění znamená nejdřív všechno spustit a pak na všechno počkat, nejčastěji přes `Promise.all`:

:::live js
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const load = (what) => sleep(100).then(() => what);

async function oneByOne() {
  const start = performance.now();
  const profile = await load('profil');
  const orders = await load('objednávky');
  const tips = await load('doporučení');
  console.log('postupně:', Math.round((performance.now() - start) / 100) * 100, 'ms');
}

async function together() {
  const start = performance.now();
  const [profile, orders, tips] = await Promise.all([load('profil'), load('objednávky'), load('doporučení')]);
  console.log('souběžně:', Math.round((performance.now() - start) / 100) * 100, 'ms');
}

oneByOne().then(together);
```
:::

Zkus změnit `sleep(100)` na `sleep(300)` a sleduj, jak se rozdíl zvětší. Destrukturalizace `[profile, orders, tips]` funguje, protože `Promise.all` vrací hodnoty v pořadí pole, ne v pořadí, jak doběhly.

:::live js predict
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const load = (what) => sleep(100).then(() => what);

async function loadPage() {
  const start = performance.now();
  const profilePromise = load('profil');
  const ordersPromise = load('objednávky');
  const profile = await profilePromise;
  const orders = await ordersPromise;
  console.log(Math.round((performance.now() - start) / 100) * 100);
}

loadPage();
```
--question-- Kolik milisekund zhruba vypíše? Obě načtení trvají 100 ms.
--option-- Asi 200, protože jsou tam dva `await` za sebou.
--option*-- Asi 100, protože obě načtení začala dřív, než se na první čeká.
--option-- Asi 0, protože Promise v proměnné už je hotová.
--why-- Načtení se **spustí** zavoláním funkce, ne na `await`. Oba `load` se zavolaly hned za sebou, takže běží zároveň, a druhý `await` už najde hotovou Promise. Tenhle zápis ale má háček: kdyby se `ordersPromise` zamítla dřív, než na ni dojde řada, prohlížeč ohlásí neobsloužené zamítnutí. `Promise.all` to ohlídá, proto je lepší volba.
:::

:::explain
Na pohovoru dostaneš otázku: „Máte tři nezávislé požadavky na API. Jak je načtete, aby to trvalo co nejkratší dobu, a proč to nejde třemi `await` za sebou?"

## --model--

Tři `await` za sebou spustí každý požadavek až po skončení předchozího, takže se doby čekání sečtou. Požadavky se spouštějí zavoláním funkce, ne na `await`, takže když je chci souběžně, zavolám všechny hned a teprve pak počkám. Nejlíp přes `await Promise.all([a(), b(), c()])`, který počká na všechny, vrátí výsledky v pořadí pole a při první chybě se zamítne. Když má zbytek fungovat i po selhání jednoho požadavku, použiju `Promise.allSettled`. Postupně čekám jen tam, kde další požadavek potřebuje výsledek předchozího.

## --checklist--

- Tři `await` za sebou čekají postupně a doby se sečtou.
- Požadavek začne běžet zavoláním funkce, ne na `await`.
- Souběžně: nejdřív všechno spustit, pak čekat přes `Promise.all`.
- `Promise.all` vrací výsledky v pořadí pole a zamítne se při první chybě.
- Postupně jen tam, kde krok potřebuje výsledek předchozího.
:::

## Cykly: `for…of` čeká, `forEach` ne

Když potřebuješ nad polem udělat asynchronní operaci **postupně** (třeba odeslat objednávky jednu po druhé, protože API nesnese souběh), napiš `await` do cyklu `for…of`. Funkce se zastaví v každém kole.

`forEach` s `async` callbackem vypadá podobně, ale nečeká na nic:

:::live js predict
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const orders = [101, 102, 103];

async function sendAll() {
  orders.forEach(async (id) => {
    await sleep(10);
    console.log(`odesláno ${id}`);
  });
  console.log('všechno odesláno');
}

sendAll();
```
--question-- V jakém pořadí se vypíšou řádky? Napiš je pod sebe.
--expected--
```text
všechno odesláno
odesláno 101
odesláno 102
odesláno 103
```
--why-- `forEach` zavolá `async` callback třikrát za sebou a z každého dostane Promise, kterou zahodí. Callbacky se na `await` zastaví a `forEach` skončí hned, takže „všechno odesláno" přijde první. Zkus cyklus přepsat na `for (const id of orders) { await sleep(10); console.log(…); }` a sleduj, že „všechno odesláno" přijde až na konec.
:::

> [!PITFALL]
> **`forEach`, `map` ani `filter` na `async` callback nečekají.** Příznak: kód za cyklem běží dřív, než operace doběhnou (hláška „Uloženo" před uložením, prázdný výsledek). Oprava: postupně přes `for…of` s `await`, souběžně přes `await Promise.all(items.map(async (item) => …))`.

Pro data, která přicházejí po částech (stránky výsledků z API, proud dat ze sítě), existuje `for await…of`. Cyklus si na každou další část počká sám:

```js
for await (const page of loadAllPages('/api/products')) {
  renderProducts(page);
}
```

Jak se takový zdroj po částech píše, teď neřeš. Stačí poznat zápis, až ho uvidíš v dokumentaci.

:::check
Máš pole `files` a funkci `upload(file)`, která vrací Promise. Server přijme jen jeden soubor naráz. Který zápis soubory nahraje jeden po druhém a teprve pak vypíše „Hotovo"?

### --answer--

`files.forEach(async (file) => { await upload(file); }); console.log('Hotovo');`

#### --why--

`forEach` na vrácené Promise nečeká, „Hotovo" se vypíše hned a všechna nahrávání začnou naráz.

### --correct--

`for (const file of files) { await upload(file); } console.log('Hotovo');`

#### --why--

`for…of` uvnitř `async` funkce se na každém `await` zastaví, takže další soubor začne až po dokončení předchozího.

### --answer--

`await Promise.all(files.map((file) => upload(file))); console.log('Hotovo');`

#### --why--

„Hotovo" se vypíše správně až na konci, ale všechna nahrávání poběží zároveň, a to server nepřijme.

### --see--

js-async/async-await#cykly-for-of-ceka-foreach-ne
:::

## `await` mimo funkci: top-level `await`

V **ES modulu** smíš `await` napsat i mimo funkci, přímo na nejvyšší úrovni souboru. Modulem je `<script type="module">`, soubor, který importuje nebo exportuje, a v Node soubor `.mjs` nebo projekt s `"type": "module"`. Zbytek modulu počká, až se Promise usadí:

:::live dom
```html
<p id="status">Načítám nabídku…</p>
<script type="module">
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await sleep(600);
  document.querySelector('#status').textContent = 'Nabídka načtená';
</script>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; }
#status { font-weight: 600; }
```
:::

Zkus smazat `type="module"` a sleduj konzoli: v obyčejném skriptu je `await` mimo funkci chyba syntaxe. K modulům se podrobně dostaneme v sekci o modulech a Vite.

> [!PITFALL]
> **`await` v obyčejném skriptu nebo v obyčejné funkci kód vůbec nespustí.** Chrome hlásí `SyntaxError: await is only valid in async functions and the top level bodies of modules`. Oprava: přidej `async` k funkci, ve které `await` je, nebo načítej soubor jako modul.

:::check
V handleru `button.addEventListener('click', () => { const data = await loadData(); })` se ukáže `SyntaxError`. Oprav ho: napiš začátek handleru až po šipku `=>` včetně.

### --expected--

async () =>

### --why--

`await` smí být jen v `async` funkci nebo na nejvyšší úrovni modulu. Tady je uvnitř šipkové funkce handleru, takže `async` patří před její závorky.

### --see--

js-async/async-await#await-mimo-funkci-top-level-await
:::

## Typické chyby a pasti

### Zapomenuté `await`

:::live js predict
```js
async function getStock(code) {
  return 0;
}

async function renderStock() {
  const stock = getStock('K-12');
  console.log(`Skladem: ${stock}`);
  if (stock) console.log('Lze objednat');
}

renderStock();
```
--question-- Co vypíše tenhle kód? Napiš výpis pod sebe.
--expected--
```text
Skladem: [object Promise]
Lze objednat
```
--why-- Bez `await` je v `stock` Promise, ne číslo. Promise převedená na text je `[object Promise]` a v podmínce je každý objekt pravdivý, takže zboží, které není skladem, „lze objednat". Oprava je `const stock = await getStock('K-12');`.
:::

> [!PITFALL]
> **Bez `await` pracuješ s Promise místo s hodnotou.** Příznaky: v textu `[object Promise]`, v konzoli `Promise {<pending>}`, podmínka `if (stock)` platí vždy, `data.map is not a function`. Oprava: `await` před voláním `async` funkce, nebo `then`.

### `async` handler bez `try`

> [!PITFALL]
> **Chyba v `async` handleru události nikam nedorazí.** Prohlížeč vrácenou Promise zahodí, takže `throw` uvnitř skončí jako `Uncaught (in promise)` a uživatel nevidí nic, třeba se ani neschová načítání. Oprava: v každém `async` handleru obal práci do `try`/`catch` a chybu ukaž ve stránce.

### Postupné čekání tam, kde nemusí být

> [!PITFALL]
> **Nezávislé požadavky pod sebou s `await` se sečtou.** Příznak: stránka se načítá tak dlouho jako všechny požadavky dohromady, v DevTools na kartě Network začíná každý až po konci předchozího. Oprava: spustit všechny najednou a počkat přes `await Promise.all([…])`.

:::check
Co vypíše tenhle kód?

```js
async function countItems() {
  return 3;
}

async function main() {
  const count = countItems();
  console.log(count + 1);
}

main();
```

### --expected--

[object Promise]1

### --why--

Bez `await` je `count` Promise. Operátor `+` ji převede na text `[object Promise]` a připojí `1`. S `const count = await countItems();` by se vypsalo `4`.

### --see--

js-async/async-await#zapomenute-await
:::

## Kde to najdeš v MDN

- [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) — co `async` funkce vrací a v oddílu *Description* přesný popis, kdy se funkce zastaví.
- [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) — co se stane se zamítnutím a oddíl *Top level await* o `await` v modulech.
- [for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) — cyklus nad daty, která přicházejí po částech.
- [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) — souběžné čekání a příklad s `async` funkcemi.

# --questions--

## --question--

Co vypíše tenhle kód? Napiš výpis pod sebe.

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function save() {
  await sleep(10);
  throw new Error('Disk je plný');
}

async function main() {
  try {
    save();
    console.log('uloženo');
  } catch (error) {
    console.log('chyba:', error.message);
  }
}

main();
```

### --expected--

uloženo

### --why--

Bez `await` se `save()` jen spustí a vrátí Promise. `try` doběhne hned, vypíše „uloženo" a skončí, takže pozdější zamítnutí už nikdo nechytí a v konzoli se ukáže jako `Uncaught (in promise) Error: Disk je plný`. S `await save();` by se vypsalo `chyba: Disk je plný`.

### --see--

js-async/async-await#chyby-try-catch-a-finally

## --question--

Funkce `loadDashboard` načítá počasí, kurzy a zprávy pod sebou, každé přes `await`, a trvá 3 sekundy. Požadavky na sobě nezávisí. Přepiš její první řádek tak, aby spustil všechna tři načtení najednou a hodnoty uložil do `weather`, `rates` a `news`. Funkce se jmenují `loadWeather`, `loadRates` a `loadNews`.

### --expected--

const [weather, rates, news] = await Promise.all([loadWeather(), loadRates(), loadNews()])

### --accept--

let [weather, rates, news] = await Promise.all([loadWeather(), loadRates(), loadNews()])

### --why--

Všechna tři volání proběhnou dřív, než se začne čekat, a `Promise.all` počká na všechna. Výsledky jsou v pořadí pole, takže je jde rovnou destrukturalizovat.

### --see--

js-async/async-await#postupne-nebo-soubezne

## --question--

Kolega tvrdí: „Když funkce obsahuje `await`, zablokuje JavaScript, dokud se Promise nesplní." Kde se mýlí?

### --answer--

Nemýlí se, proto se `await` nemá používat v handlerech událostí.

#### --why--

Handlery s `await` jsou běžné a stránku neblokují. Blokuje jen synchronní práce.

### --correct--

`await` zastaví jen svou funkci, uvolní zásobník a zbytek funkce pokračuje jako mikroúloha po splnění.

#### --why--

Během čekání event loop spouští jiné úlohy i vykreslování. Zastavená je jen jediná `async` funkce.

### --answer--

`await` nic nezastaví, jen převede Promise na hodnotu hned.

#### --why--

Funkce opravdu čeká, dokud se Promise neusadí. Hodnotu nemůže mít dřív, než existuje.

### --see--

js-async/async-await#await-prerusi-funkci-ne-program
