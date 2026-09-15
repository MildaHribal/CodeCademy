---
title: Platební terminál
runtime: js
see: js-async/promise#kdy-psat-new-promise, js-async/promise#retezeni-then, js-async/promise#vic-promise-najednou-all-allsettled-race-a-any
---

# --description--

Kavárna Na Schodech má ke kase připojený platební terminál. Jeho SDK je starší než Promise: každá operace dostane callback `(error, result)`. Nová kasa ale chce se vším pracovat přes Promise, a navíc potřebuje přehled o tržbách ze tří terminálů (u baru, na terase a u výdejního okénka). Napíšeš vrstvu, přes kterou kasa s terminály mluví.

Tentokrát bez návodu. V `script.js` je nahoře simulace terminálu a sítě (tu neměň) a pod ní prázdné kostry funkcí s popisem. Používej, co znáš z lekce o Promise: `new Promise`, řetězení `then`, `catch` a kombinace `all`, `allSettled` a `any`. Na `async`/`await` přijde řada až v další lekci, tady si vystačíš bez nich.

Co kasa od vrstvy chce:

- Když obsluha zadá částku a zákazník přiloží kartu, kasa zavolá `pay`: karta se přečte, banka platbu schválí a kasa dostane účtenku. Když se cokoli pokazí, dozví se proč.
- Displej kasy nechce řešit chyby: `payOrExplain` mu vždy vrátí větu, kterou ukáže.
- Na konci směny chce vedoucí součet tržeb. Buď přesný ze všech terminálů (a když některý neodpoví, raději nic), nebo aspoň z těch, které odpověděly, se seznamem těch, které ne.
- Když terminál u baru nejde, kasa se připojí k tomu, který odpoví nejrychleji.

Přesné požadavky jsou v seznamu kontrol. Simulace odpovídá za desítky milisekund, takže každá kontrola proběhne rychle.

> [!REMEMBER]
> **Každá funkce vrací Promise a žádná chyba se neztratí:** co selže uvnitř, dorazí ven jako zamítnutí (kromě `payOrExplain`, která ho převede na text).

# --hints--

`wait(ms)` vrátí Promise, která se splní až po `ms` milisekundách.

```js
const promise = wait(60);
assert.ok(promise instanceof Promise, 'wait(60) má vrátit Promise');
const start = performance.now();
await promise;
assert.ok(performance.now() - start >= 50, 'Promise z wait(60) se má splnit až po zhruba 60 ms, splnila se dřív');
```

`readCard()` vrátí Promise, která se splní kartou z terminálu.

```js
const promise = readCard();
assert.ok(promise instanceof Promise, 'readCard() má vrátit Promise');
const card = await promise;
assert.deepEqual(card, { number: '4580 1234 5678 4821', holder: 'JANA NOVAKOVA' }, 'readCard() se má splnit kartou, kterou terminál předal callbacku');
```

Když terminál kartu nepřečte, `readCard()` se zamítne chybou terminálu.

```js
terminal.readError = 'Karta nečitelná';
let caught = null;
await readCard().then(() => {}, (error) => { caught = error; });
assert.ok(caught instanceof Error, 'když terminál hlásí chybu, readCard() se má zamítnout (chyba nedorazila)');
assert.equal(caught.message, 'Karta nečitelná', 'readCard() se má zamítnout přesně chybou z terminálu');
```

`authorize(card, amount)` se splní schválením, a když banka platbu zamítne, zamítne se chybou terminálu.

```js
const card = { number: '4580 1234 5678 4821' };
const approval = await authorize(card, 129);
assert.deepEqual(approval, { approvalCode: 'SCH-129-21' }, 'authorize(karta, 129) se má splnit objektem { approvalCode } z terminálu');
let caught = null;
await authorize(card, 9000).then(() => {}, (error) => { caught = error; });
assert.equal(caught?.message, 'Platba zamítnuta: nedostatek prostředků', 'authorize(karta, 9000) se má zamítnout chybou terminálu');
```

`pay(amount)` se splní účtenkou s částkou, posledními čtyřmi číslicemi karty a kódem schválení.

```js
const receipt = await pay(249);
assert.deepEqual(receipt, { amount: 249, last4: '4821', approvalCode: 'SCH-249-21' }, 'pay(249) se má splnit účtenkou { amount: 249, last4: "4821", approvalCode: "SCH-249-21" }');
```

Když se nepovede přečíst kartu, `pay` se zamítne touž chybou a schválení se vůbec nezkouší.

```js
terminal.readError = 'Karta vytažena příliš brzy';
let caught = null;
await pay(80).then(() => {}, (error) => { caught = error; });
await wait(80);
assert.equal(caught?.message, 'Karta vytažena příliš brzy', 'pay(80) se má zamítnout chybou ze čtení karty');
assert.equal(terminal.authorizeCalls, 0, 'když čtení karty selže, pay nemá volat terminal.authorize');
```

Když banka platbu zamítne, `pay` se zamítne chybou ze schválení.

```js
let caught = null;
await pay(7200).then(() => {}, (error) => { caught = error; });
assert.equal(caught?.message, 'Platba zamítnuta: nedostatek prostředků', 'pay(7200) se má zamítnout chybou ze schválení');
```

`payOrExplain(amount)` se po úspěchu splní textem `Zaplaceno 129 Kč`.

```js
assert.equal(await payOrExplain(129), 'Zaplaceno 129 Kč', "payOrExplain(129) se má splnit textem 'Zaplaceno 129 Kč'");
```

Po chybě se `payOrExplain` nezamítne, ale splní textem `Platba se nezdařila: ` a zprávou chyby.

```js
terminal.readError = 'Karta nečitelná';
let text;
try {
  text = await payOrExplain(129);
} catch (error) {
  assert.fail(`payOrExplain se nemá zamítnout, zamítla se chybou „${error.message}"`);
}
assert.equal(text, 'Platba se nezdařila: Karta nečitelná', "payOrExplain(129) s nečitelnou kartou se má splnit textem 'Platba se nezdařila: Karta nečitelná'");
```

`terminalsTotal(ids)` sečte tržby terminálů a všechny je načítá souběžně, ne jeden po druhém.

```js
dailyTotals.kiosek = 1000;
const total = await terminalsTotal(['bar', 'terasa', 'kiosek']);
assert.equal(total, 21770, "terminalsTotal(['bar', 'terasa', 'kiosek']) má vrátit 12450 + 8320 + 1000 = 21770");
assert.equal(loadTotal.maxActive, 3, `všechny tři loadTotal mají běžet zároveň, nejvíc jich ale běželo ${loadTotal.maxActive}`);
```

Když některý terminál neodpoví, `terminalsTotal` se zamítne.

```js
let caught = null;
await terminalsTotal(['bar', 'vydej']).then(() => {}, (error) => { caught = error; });
assert.equal(caught?.message, 'Terminál vydej neodpovídá', "terminalsTotal(['bar', 'vydej']) se má zamítnout chybou nedostupného terminálu");
```

`availableTotal(ids)` sečte tržby terminálů, které odpověděly, a vrátí i seznam těch, které ne.

```js
const result = await availableTotal(['vydej', 'bar', 'terasa']);
assert.deepEqual(result, { total: 20770, failed: ['vydej'] }, "availableTotal(['vydej', 'bar', 'terasa']) se má splnit { total: 20770, failed: ['vydej'] }");
dailyTotals.bar = 'offline';
assert.deepEqual(await availableTotal(['bar', 'vydej']), { total: 0, failed: ['bar', 'vydej'] }, 'když neodpoví žádný terminál, availableTotal má vrátit { total: 0, failed: [oba] } a nezamítnout se');
```

`firstOnline(ids)` se splní id terminálu, který první **úspěšně** odpoví, i když jiný selže dřív.

```js
assert.equal(await firstOnline(['bar', 'vydej', 'terasa']), 'terasa', "firstOnline(['bar', 'vydej', 'terasa']) má vrátit 'terasa' — odpoví nejrychleji, výdej selže ještě dřív, ale ten se nepočítá");
pingDelays.bar = 5;
assert.equal(await firstOnline(['terasa', 'bar']), 'bar', "když bar odpoví za 5 ms, firstOnline(['terasa', 'bar']) má vrátit 'bar'");
```

Když neodpoví žádný terminál, `firstOnline` se zamítne chybou se zprávou `Žádný terminál není online`.

```js
pingDelays.terasa = 'offline';
let caught = null;
await firstOnline(['vydej', 'terasa']).then(() => {}, (error) => { caught = error; });
assert.ok(caught, 'když neodpoví žádný terminál, firstOnline se má zamítnout');
assert.equal(caught.message, 'Žádný terminál není online', "firstOnline se má zamítnout chybou se zprávou 'Žádný terminál není online'");
```

# --help--

## --tip-- 2

Terminál výsledek předává callbacku, takže Promise musíš vyrobit sám a v callbacku rozhodnout, jestli ji splníš, nebo zamítneš. Vzor je v lekci v části [Kdy psát new Promise](see:js-async/promise#kdy-psat-new-promise).

## --tip-- 5

Pro účtenku potřebuješ kartu i schválení najednou. Když callback dalšího `then` kartu nevidí, vnoř `then` se schválením do callbacku, kde karta je, nebo si kartu ulož do proměnné vně řetězu. Nezapomeň `return`, jinak řetěz na schválení nepočká ([Řetězení then](see:js-async/promise#retezeni-then)).

# --seed--

## --file-- script.js

```js
// ===== Simulace platebního terminálu a sítě kavárny (neměň) =====

// Staré SDK terminálu: pracuje s callbackem (error, result), Promise nevrací.
// Testy si chování přepínají přes vlastnosti readError a declineAbove.
const terminal = {
  nextCard: { number: '4580 1234 5678 4821', holder: 'JANA NOVAKOVA' },
  readError: null,
  declineAbove: 5000,
  readCalls: 0,
  authorizeCalls: 0,

  readCard(callback) {
    this.readCalls++;
    setTimeout(() => {
      if (this.readError) callback(new Error(this.readError));
      else callback(null, { ...this.nextCard });
    }, 30);
  },

  authorize(card, amount, callback) {
    this.authorizeCalls++;
    setTimeout(() => {
      if (amount > this.declineAbove) callback(new Error('Platba zamítnuta: nedostatek prostředků'));
      else callback(null, { approvalCode: `SCH-${amount}-${card.number.slice(-2)}` });
    }, 30);
  },
};

// Tržby terminálů za dnešek. Novější API: vrací Promise.
// Hodnota 'offline' znamená, že terminál neodpoví a Promise se zamítne.
const dailyTotals = { 'bar': 12450, 'terasa': 8320, 'vydej': 'offline' };

function loadTotal(terminalId) {
  loadTotal.active++;
  loadTotal.maxActive = Math.max(loadTotal.maxActive, loadTotal.active);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      loadTotal.active--;
      const total = dailyTotals[terminalId];
      if (typeof total === 'number') resolve(total);
      else reject(new Error(`Terminál ${terminalId} neodpovídá`));
    }, 40);
  });
}
loadTotal.active = 0;
loadTotal.maxActive = 0;

// Odezva terminálů v ms. Hodnota 'offline' znamená, že ping selže.
const pingDelays = { 'bar': 80, 'terasa': 20, 'vydej': 'offline' };

function ping(terminalId) {
  return new Promise((resolve, reject) => {
    const delay = pingDelays[terminalId];
    if (typeof delay === 'number') setTimeout(() => resolve(terminalId), delay);
    else setTimeout(() => reject(new Error(`Terminál ${terminalId} je offline`)), 10);
  });
}

// ===== Tvůj kód =====

/**
 * Počká zadaný počet milisekund.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function wait(ms) {
}

/**
 * Přečte kartu z terminálu.
 * @returns {Promise<{ number: string, holder: string }>} karta, nebo zamítnutí s chybou terminálu
 */
function readCard() {
}

/**
 * Nechá banku schválit platbu kartou.
 * @param {{ number: string }} card
 * @param {number} amount částka v Kč
 * @returns {Promise<{ approvalCode: string }>} schválení, nebo zamítnutí s chybou terminálu
 */
function authorize(card, amount) {
}

/**
 * Celá platba: přečte kartu a nechá ji schválit.
 * @param {number} amount částka v Kč
 * @returns {Promise<{ amount: number, last4: string, approvalCode: string }>} účtenka
 */
function pay(amount) {
}

/**
 * Platba pro displej kasy: nikdy se nezamítne, vždy vrátí text.
 * @param {number} amount částka v Kč
 * @returns {Promise<string>}
 */
function payOrExplain(amount) {
}

/**
 * Součet dnešních tržeb zadaných terminálů; když jeden neodpoví, zamítne se.
 * @param {string[]} terminalIds
 * @returns {Promise<number>}
 */
function terminalsTotal(terminalIds) {
}

/**
 * Součet tržeb terminálů, které odpověděly, a seznam těch, které ne.
 * @param {string[]} terminalIds
 * @returns {Promise<{ total: number, failed: string[] }>}
 */
function availableTotal(terminalIds) {
}

/**
 * Terminál, který jako první úspěšně odpoví na ping.
 * @param {string[]} terminalIds
 * @returns {Promise<string>} id terminálu, nebo zamítnutí s chybou „Žádný terminál není online"
 */
function firstOnline(terminalIds) {
}
```

# --solution--

## --file-- script.js

```js
// ===== Simulace platebního terminálu a sítě kavárny (neměň) =====

// Staré SDK terminálu: pracuje s callbackem (error, result), Promise nevrací.
// Testy si chování přepínají přes vlastnosti readError a declineAbove.
const terminal = {
  nextCard: { number: '4580 1234 5678 4821', holder: 'JANA NOVAKOVA' },
  readError: null,
  declineAbove: 5000,
  readCalls: 0,
  authorizeCalls: 0,

  readCard(callback) {
    this.readCalls++;
    setTimeout(() => {
      if (this.readError) callback(new Error(this.readError));
      else callback(null, { ...this.nextCard });
    }, 30);
  },

  authorize(card, amount, callback) {
    this.authorizeCalls++;
    setTimeout(() => {
      if (amount > this.declineAbove) callback(new Error('Platba zamítnuta: nedostatek prostředků'));
      else callback(null, { approvalCode: `SCH-${amount}-${card.number.slice(-2)}` });
    }, 30);
  },
};

// Tržby terminálů za dnešek. Novější API: vrací Promise.
// Hodnota 'offline' znamená, že terminál neodpoví a Promise se zamítne.
const dailyTotals = { 'bar': 12450, 'terasa': 8320, 'vydej': 'offline' };

function loadTotal(terminalId) {
  loadTotal.active++;
  loadTotal.maxActive = Math.max(loadTotal.maxActive, loadTotal.active);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      loadTotal.active--;
      const total = dailyTotals[terminalId];
      if (typeof total === 'number') resolve(total);
      else reject(new Error(`Terminál ${terminalId} neodpovídá`));
    }, 40);
  });
}
loadTotal.active = 0;
loadTotal.maxActive = 0;

// Odezva terminálů v ms. Hodnota 'offline' znamená, že ping selže.
const pingDelays = { 'bar': 80, 'terasa': 20, 'vydej': 'offline' };

function ping(terminalId) {
  return new Promise((resolve, reject) => {
    const delay = pingDelays[terminalId];
    if (typeof delay === 'number') setTimeout(() => resolve(terminalId), delay);
    else setTimeout(() => reject(new Error(`Terminál ${terminalId} je offline`)), 10);
  });
}

// ===== Tvůj kód =====

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readCard() {
  return new Promise((resolve, reject) => {
    terminal.readCard((error, card) => {
      if (error) reject(error);
      else resolve(card);
    });
  });
}

function authorize(card, amount) {
  return new Promise((resolve, reject) => {
    terminal.authorize(card, amount, (error, approval) => {
      if (error) reject(error);
      else resolve(approval);
    });
  });
}

function pay(amount) {
  return readCard().then((card) =>
    authorize(card, amount).then((approval) => ({
      amount,
      last4: card.number.slice(-4),
      approvalCode: approval.approvalCode,
    })),
  );
}

function payOrExplain(amount) {
  return pay(amount)
    .then((receipt) => `Zaplaceno ${receipt.amount} Kč`)
    .catch((error) => `Platba se nezdařila: ${error.message}`);
}

function terminalsTotal(terminalIds) {
  return Promise.all(terminalIds.map((id) => loadTotal(id)))
    .then((totals) => totals.reduce((sum, total) => sum + total, 0));
}

function availableTotal(terminalIds) {
  return Promise.allSettled(terminalIds.map((id) => loadTotal(id))).then((results) => {
    let total = 0;
    const failed = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') total += result.value;
      else failed.push(terminalIds[index]);
    });
    return { total, failed };
  });
}

function firstOnline(terminalIds) {
  return Promise.any(terminalIds.map((id) => ping(id)))
    .catch(() => {
      throw new Error('Žádný terminál není online');
    });
}
```

# --approaches--

## --approach-- Karta řetězem přes Promise.all a catch u každého terminálu

`pay` nevnořuje `then`: kartu pošle řetězem dál vedle schválení přes `Promise.all([card, authorize(card, amount)])`. `availableTotal` místo `allSettled` přidá každé Promise vlastní `catch`, který výpadek zapíše a vrátí nulu. Hodí se, když potřebuješ náhradní hodnotu hned u zdroje; `allSettled` je čitelnější, když chceš jen rozdělit výsledky na povedené a nepovedené.

### --file-- script.js

```js
// ===== Simulace platebního terminálu a sítě kavárny (neměň) =====

// Staré SDK terminálu: pracuje s callbackem (error, result), Promise nevrací.
// Testy si chování přepínají přes vlastnosti readError a declineAbove.
const terminal = {
  nextCard: { number: '4580 1234 5678 4821', holder: 'JANA NOVAKOVA' },
  readError: null,
  declineAbove: 5000,
  readCalls: 0,
  authorizeCalls: 0,

  readCard(callback) {
    this.readCalls++;
    setTimeout(() => {
      if (this.readError) callback(new Error(this.readError));
      else callback(null, { ...this.nextCard });
    }, 30);
  },

  authorize(card, amount, callback) {
    this.authorizeCalls++;
    setTimeout(() => {
      if (amount > this.declineAbove) callback(new Error('Platba zamítnuta: nedostatek prostředků'));
      else callback(null, { approvalCode: `SCH-${amount}-${card.number.slice(-2)}` });
    }, 30);
  },
};

// Tržby terminálů za dnešek. Novější API: vrací Promise.
// Hodnota 'offline' znamená, že terminál neodpoví a Promise se zamítne.
const dailyTotals = { 'bar': 12450, 'terasa': 8320, 'vydej': 'offline' };

function loadTotal(terminalId) {
  loadTotal.active++;
  loadTotal.maxActive = Math.max(loadTotal.maxActive, loadTotal.active);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      loadTotal.active--;
      const total = dailyTotals[terminalId];
      if (typeof total === 'number') resolve(total);
      else reject(new Error(`Terminál ${terminalId} neodpovídá`));
    }, 40);
  });
}
loadTotal.active = 0;
loadTotal.maxActive = 0;

// Odezva terminálů v ms. Hodnota 'offline' znamená, že ping selže.
const pingDelays = { 'bar': 80, 'terasa': 20, 'vydej': 'offline' };

function ping(terminalId) {
  return new Promise((resolve, reject) => {
    const delay = pingDelays[terminalId];
    if (typeof delay === 'number') setTimeout(() => resolve(terminalId), delay);
    else setTimeout(() => reject(new Error(`Terminál ${terminalId} je offline`)), 10);
  });
}

// ===== Tvůj kód =====

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

function readCard() {
  return new Promise((resolve, reject) => {
    terminal.readCard((error, card) => (error ? reject(error) : resolve(card)));
  });
}

function authorize(card, amount) {
  return new Promise((resolve, reject) => {
    terminal.authorize(card, amount, (error, approval) => (error ? reject(error) : resolve(approval)));
  });
}

// Karta putuje řetězem dál spolu se schválením: Promise.all přijme i hodnotu, která Promise není.
function pay(amount) {
  return readCard()
    .then((card) => Promise.all([card, authorize(card, amount)]))
    .then(([card, approval]) => ({ amount, last4: card.number.slice(-4), approvalCode: approval.approvalCode }));
}

function payOrExplain(amount) {
  return pay(amount)
    .then(({ amount: paid }) => `Zaplaceno ${paid} Kč`)
    .catch((error) => `Platba se nezdařila: ${error.message}`);
}

function terminalsTotal(terminalIds) {
  return Promise.all(terminalIds.map(loadTotal)).then((totals) => totals.reduce((sum, total) => sum + total, 0));
}

// Místo allSettled: každá Promise má vlastní catch, takže Promise.all se nikdy nezamítne.
function availableTotal(terminalIds) {
  const failed = [];
  const safeTotals = terminalIds.map((id) =>
    loadTotal(id).catch(() => {
      failed.push(id);
      return 0;
    }),
  );
  return Promise.all(safeTotals).then((totals) => ({
    total: totals.reduce((sum, total) => sum + total, 0),
    failed: terminalIds.filter((id) => failed.includes(id)),
  }));
}

function firstOnline(terminalIds) {
  return Promise.any(terminalIds.map(ping)).catch(() => {
    throw new Error('Žádný terminál není online');
  });
}
```

## --approach-- Jeden obal pro celé SDK a withResolvers

Pomocná funkce `callTerminal` obalí kteroukoli metodu terminálu, takže obal existuje jen jednou. `pay` drží řetěz plochý a kartu si ukládá do proměnné. Druhý argument `then` místo `catch` a `cause` u chyby, která zachová původní důvod. Hodí se, když SDK má desítky metod.

### --file-- script.js

```js
// ===== Simulace platebního terminálu a sítě kavárny (neměň) =====

// Staré SDK terminálu: pracuje s callbackem (error, result), Promise nevrací.
// Testy si chování přepínají přes vlastnosti readError a declineAbove.
const terminal = {
  nextCard: { number: '4580 1234 5678 4821', holder: 'JANA NOVAKOVA' },
  readError: null,
  declineAbove: 5000,
  readCalls: 0,
  authorizeCalls: 0,

  readCard(callback) {
    this.readCalls++;
    setTimeout(() => {
      if (this.readError) callback(new Error(this.readError));
      else callback(null, { ...this.nextCard });
    }, 30);
  },

  authorize(card, amount, callback) {
    this.authorizeCalls++;
    setTimeout(() => {
      if (amount > this.declineAbove) callback(new Error('Platba zamítnuta: nedostatek prostředků'));
      else callback(null, { approvalCode: `SCH-${amount}-${card.number.slice(-2)}` });
    }, 30);
  },
};

// Tržby terminálů za dnešek. Novější API: vrací Promise.
// Hodnota 'offline' znamená, že terminál neodpoví a Promise se zamítne.
const dailyTotals = { 'bar': 12450, 'terasa': 8320, 'vydej': 'offline' };

function loadTotal(terminalId) {
  loadTotal.active++;
  loadTotal.maxActive = Math.max(loadTotal.maxActive, loadTotal.active);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      loadTotal.active--;
      const total = dailyTotals[terminalId];
      if (typeof total === 'number') resolve(total);
      else reject(new Error(`Terminál ${terminalId} neodpovídá`));
    }, 40);
  });
}
loadTotal.active = 0;
loadTotal.maxActive = 0;

// Odezva terminálů v ms. Hodnota 'offline' znamená, že ping selže.
const pingDelays = { 'bar': 80, 'terasa': 20, 'vydej': 'offline' };

function ping(terminalId) {
  return new Promise((resolve, reject) => {
    const delay = pingDelays[terminalId];
    if (typeof delay === 'number') setTimeout(() => resolve(terminalId), delay);
    else setTimeout(() => reject(new Error(`Terminál ${terminalId} je offline`)), 10);
  });
}

// ===== Tvůj kód =====

// Jedna pomocná funkce obalí libovolnou metodu terminálu s callbackem (error, result).
function callTerminal(method, ...args) {
  const { promise, resolve, reject } = Promise.withResolvers();
  terminal[method](...args, (error, result) => (error ? reject(error) : resolve(result)));
  return promise;
}

function wait(ms) {
  const { promise, resolve } = Promise.withResolvers();
  setTimeout(resolve, ms);
  return promise;
}

function readCard() {
  return callTerminal('readCard');
}

function authorize(card, amount) {
  return callTerminal('authorize', card, amount);
}

function pay(amount) {
  let card;
  return readCard()
    .then((readCardResult) => {
      card = readCardResult;
      return authorize(card, amount);
    })
    .then(({ approvalCode }) => ({ amount, last4: card.number.slice(-4), approvalCode }));
}

function payOrExplain(amount) {
  return pay(amount).then(
    (receipt) => `Zaplaceno ${receipt.amount} Kč`,
    (error) => `Platba se nezdařila: ${error.message}`,
  );
}

function terminalsTotal(terminalIds) {
  return Promise.all(terminalIds.map(loadTotal)).then((totals) => {
    let sum = 0;
    for (const total of totals) sum += total;
    return sum;
  });
}

function availableTotal(terminalIds) {
  return Promise.allSettled(terminalIds.map(loadTotal)).then((results) => ({
    total: results.filter((r) => r.status === 'fulfilled').reduce((sum, r) => sum + r.value, 0),
    failed: terminalIds.filter((_, index) => results[index].status === 'rejected'),
  }));
}

function firstOnline(terminalIds) {
  return Promise.any(terminalIds.map(ping)).catch((error) => {
    throw new Error('Žádný terminál není online', { cause: error });
  });
}
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každý callback terminálu volá `resolve`, nebo `reject`, nikdy obojí a nikdy nic.
- Uvnitř `then` nechybí `return` u Promise, na kterou má řetěz počkat.
- Nikde není zbytečný `new Promise` kolem funkce, která už Promise vrací (`loadTotal`, `ping`).
- Žádný řetěz nekončí bez obsloužení chyby tam, kde ji nikdo dál nepřevezme.
- Umíš říct, proč `terminalsTotal` používá jinou kombinaci Promise než `availableTotal`.

## --extensions--

Přidej `payWithRetry(amount)`, která při nečitelné kartě zkusí čtení ještě dvakrát s pauzou přes `wait(500)`; a funkci `printReceipt(receipt)`, která účtenku vypíše do konzole jako tabulku přes `console.table`.
