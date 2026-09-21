---
title: Rozhodovací jádro service workeru
runtime: js
see: prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou, prohlizec-navic/service-worker-a-pwa#cache-storage-vlastni-spiz
---

# --description--

Celý service worker stojí na jedné otázce: **odkud vzít odpověď?** Ta otázka se dá
oddělit od prohlížečového API a napsat jako obyčejné funkce — tak se to ostatně dělá
i ve skutečnosti, protože takový kód se dá testovat bez prohlížeče.

Postav rozhodovací jádro pro offline zápisník. Pracuje se dvěma věcmi, které mu vždycky
někdo předá zvenčí:

- **spíž** — objekt s `await spiz.match(url)` (vrátí uloženou odpověď nebo `undefined`),
  `await spiz.put(url, odpoved)` a `await spiz.klice()` (vrátí pole adres),
- **síť** — funkce `await sit(url)`, která vrátí čerstvou odpověď, nebo se **odmítne**,
  když je uživatel offline.

Co má jádro umět:

- Vrátit odpověď podle strategie **cache-first**: když je ve spíži, jdi rovnou z ní a síť
  vůbec neobtěžuj. Když není, stáhni, ulož a vrať.
- Vrátit odpověď podle strategie **network-first**: zkus síť, čerstvou odpověď si ulož.
  Když síť selže, sáhni do spíže. Když ani tam nic není, vrať `null` — aplikace si pak
  zobrazí vlastní offline stránku.
- Vrátit odpověď podle strategie **stale-while-revalidate**: uloženou odpověď vrať
  okamžitě a čerstvou si stáhni na pozadí pro příště. Když ve spíži nic není, počkej na síť.
- Vybrat strategii podle adresy: soubory s otiskem obsahu cache-first, HTML network-first,
  všechno pod `/api/` stale-while-revalidate a zbytek network-first.
- Uklidit staré spíže: z pole jmen vrátit ta, která se mají smazat.

Sáhni jen do těl připravených funkcí. Falešná spíž a falešná síť ve spodní části souboru
jsou tam kvůli tomu, abys výsledek viděl v konzoli — testy si vyrábějí vlastní.

> [!TIP]
> Nezapomeň, že „síť selže" znamená odmítnutou promise, ne návratovou hodnotu. Rozmysli
> si u každé strategie, co má být uvnitř `try` a co za ním.

# --hints--

`cacheFirst` vrátí uloženou odpověď a na síť vůbec nesáhne.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
let volaniSite = 0;
const spiz = novaSpiz({ '/a.css': 'ze spíže' });
const sit = async () => { volaniSite++; return 'ze sítě'; };
assert.equal(await cacheFirst('/a.css', spiz, sit), 'ze spíže', "cacheFirst('/a.css') má vrátit odpověď ze spíže");
assert.equal(volaniSite, 0, 'cacheFirst nemá volat síť, když je odpověď ve spíži');
```

`cacheFirst` u neuložené adresy stáhne odpověď ze sítě a uloží ji do spíže.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
const spiz = novaSpiz({});
const sit = async () => 'ze sítě';
assert.equal(await cacheFirst('/b.css', spiz, sit), 'ze sítě', "cacheFirst('/b.css') má u prázdné spíže vrátit odpověď ze sítě");
assert.equal(await spiz.match('/b.css'), 'ze sítě', 'cacheFirst má staženou odpověď uložit do spíže');
```

`networkFirst` vrátí čerstvou odpověď, i když ve spíži něco je, a spíž aktualizuje.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
const spiz = novaSpiz({ '/': 'stará stránka' });
const sit = async () => 'nová stránka';
assert.equal(await networkFirst('/', spiz, sit), 'nová stránka', "networkFirst('/') má vrátit odpověď ze sítě");
assert.equal(await spiz.match('/'), 'nová stránka', 'networkFirst má čerstvou odpověď uložit do spíže');
```

`networkFirst` při výpadku sítě sáhne do spíže.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
const spiz = novaSpiz({ '/': 'stará stránka' });
const sit = async () => { throw new Error('offline'); };
assert.equal(await networkFirst('/', spiz, sit), 'stará stránka', 'networkFirst má při chybě sítě vrátit odpověď ze spíže');
```

`networkFirst` vrátí `null`, když selže síť a spíž je prázdná.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
const spiz = novaSpiz({});
const sit = async () => { throw new Error('offline'); };
assert.equal(await networkFirst('/neznamy', spiz, sit), null, 'networkFirst má vrátit null, když není odpověď ani na síti, ani ve spíži');
```

`staleWhileRevalidate` vrátí uloženou odpověď dřív, než dorazí ta ze sítě.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
let pustit;
const spiz = novaSpiz({ '/api/kurzy': 'kurzy ze spíže' });
const sit = () => new Promise((hotovo) => { pustit = () => hotovo('kurzy ze sítě'); });
const odpoved = await staleWhileRevalidate('/api/kurzy', spiz, sit);
assert.equal(odpoved, 'kurzy ze spíže', 'staleWhileRevalidate má vrátit uloženou odpověď, aniž by čekal na síť');
pustit();
```

`staleWhileRevalidate` si na pozadí uloží čerstvou odpověď pro příště.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
const spiz = novaSpiz({ '/api/kurzy': 'kurzy ze spíže' });
const sit = async () => 'kurzy ze sítě';
await staleWhileRevalidate('/api/kurzy', spiz, sit);
await helpers.waitFor(async () => (await spiz.match('/api/kurzy')) === 'kurzy ze sítě', 2000);
```

`staleWhileRevalidate` u prázdné spíže počká na síť.

```js
const novaSpiz = (data = {}) => {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) { return ulozene.get(url); },
    async put(url, odpoved) { ulozene.set(url, odpoved); },
    async klice() { return [...ulozene.keys()]; },
  };
};
const spiz = novaSpiz({});
const sit = async () => 'kurzy ze sítě';
assert.equal(await staleWhileRevalidate('/api/kurzy', spiz, sit), 'kurzy ze sítě', 'staleWhileRevalidate má u prázdné spíže vrátit odpověď ze sítě');
```

`vyberStrategii` pozná soubor s otiskem obsahu a pošle ho na cache-first.

```js
assert.equal(vyberStrategii('/assets/app.8f3a12.js'), 'cache-first', "vyberStrategii('/assets/app.8f3a12.js') má vrátit 'cache-first'");
assert.equal(vyberStrategii('/assets/motiv.1b2c3d.css'), 'cache-first', "vyberStrategii('/assets/motiv.1b2c3d.css') má vrátit 'cache-first'");
```

`vyberStrategii` pošle HTML na network-first a data z API na stale-while-revalidate.

```js
assert.equal(vyberStrategii('/'), 'network-first', "vyberStrategii('/') má vrátit 'network-first'");
assert.equal(vyberStrategii('/poznamky.html'), 'network-first', "vyberStrategii('/poznamky.html') má vrátit 'network-first'");
assert.equal(vyberStrategii('/api/poznamky'), 'stale-while-revalidate', "vyberStrategii('/api/poznamky') má vrátit 'stale-while-revalidate'");
assert.equal(vyberStrategii('/fotky/mesto.jpg'), 'network-first', "vyberStrategii('/fotky/mesto.jpg') má u adresy bez otisku vrátit 'network-first'");
```

`uklidStareSpize` vrátí jména všech spíží kromě té aktuální.

```js
assert.deepEqual(uklidStareSpize(['zapisnik-v1', 'zapisnik-v2', 'zapisnik-v3'], 'zapisnik-v3'), ['zapisnik-v1', 'zapisnik-v2'], "uklidStareSpize([…], 'zapisnik-v3') má vrátit ['zapisnik-v1', 'zapisnik-v2']");
assert.deepEqual(uklidStareSpize(['zapisnik-v3'], 'zapisnik-v3'), [], 'uklidStareSpize nemá vrátit aktuální spíž');
assert.deepEqual(uklidStareSpize([], 'zapisnik-v3'), [], 'uklidStareSpize má u prázdného seznamu vrátit prázdné pole');
```

`uklidStareSpize` nemění pole, které dostane.

```js
const jmena = ['zapisnik-v1', 'zapisnik-v2'];
uklidStareSpize(jmena, 'zapisnik-v2');
assert.deepEqual(jmena, ['zapisnik-v1', 'zapisnik-v2'], 'uklidStareSpize nemá měnit pole, které dostane — service worker s ním počítá dál');
```

# --help--

## --tip-- 6

Rozhodni se, co se má stát **před** vrácením hodnoty a co až po něm. Odpověď ze spíže
můžeš vrátit, aniž bys počkal na promise ze sítě — stačí ji nečekat hned.

## --tip-- 12

Metoda, která z pole vybere jen některé položky, vrací **nové** pole. Tím se požadavek
na nezměněné vstupní pole splní sám.

# --seed--

## --file-- script.js

```js
/**
 * Nejdřív spíž, síť až jako doplnění.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
async function cacheFirst(url, spiz, sit) {
}

/**
 * Nejdřív síť, spíž jako záchrana při výpadku.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku, nebo null
 */
async function networkFirst(url, spiz, sit) {
}

/**
 * Uloženou odpověď vrať hned, čerstvou si stáhni na pozadí.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
async function staleWhileRevalidate(url, spiz, sit) {
}

/**
 * Vybere strategii podle adresy požadavku.
 * @param {string} url adresa požadavku
 * @returns {'cache-first'|'network-first'|'stale-while-revalidate'} jméno strategie
 */
function vyberStrategii(url) {
}

/**
 * Vrátí jména spíží, které se mají smazat.
 * @param {string[]} jmena všechna jména spíží v prohlížeči
 * @param {string} aktualni jméno spíže současné verze
 * @returns {string[]} jména ke smazání
 */
function uklidStareSpize(jmena, aktualni) {
}

// --- Falešná spíž a síť, ať je výsledek vidět v konzoli ---------------------

function falesnaSpiz(data = {}) {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) {
      return ulozene.get(url);
    },
    async put(url, odpoved) {
      ulozene.set(url, odpoved);
    },
    async klice() {
      return [...ulozene.keys()];
    },
  };
}

async function zkouska() {
  const spiz = falesnaSpiz({ '/api/poznamky': 'poznámky ze spíže' });
  const sit = async (url) => `${url} ze sítě`;

  console.log('strategie pro /api/poznamky:', vyberStrategii('/api/poznamky'));
  console.log('odpověď:', await staleWhileRevalidate('/api/poznamky', spiz, sit));
  console.log('ke smazání:', uklidStareSpize(['zapisnik-v1', 'zapisnik-v2'], 'zapisnik-v2'));
}

zkouska();
```

# --solution--

## --file-- script.js

```js
/**
 * Nejdřív spíž, síť až jako doplnění.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
async function cacheFirst(url, spiz, sit) {
  const ulozene = await spiz.match(url);
  if (ulozene !== undefined) return ulozene;

  const cerstve = await sit(url);
  await spiz.put(url, cerstve);
  return cerstve;
}

/**
 * Nejdřív síť, spíž jako záchrana při výpadku.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku, nebo null
 */
async function networkFirst(url, spiz, sit) {
  try {
    const cerstve = await sit(url);
    await spiz.put(url, cerstve);
    return cerstve;
  } catch {
    const ulozene = await spiz.match(url);
    return ulozene ?? null;
  }
}

/**
 * Uloženou odpověď vrať hned, čerstvou si stáhni na pozadí.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
async function staleWhileRevalidate(url, spiz, sit) {
  const ulozene = await spiz.match(url);

  const aktualizace = Promise.resolve()
    .then(() => sit(url))
    .then((cerstve) => spiz.put(url, cerstve))
    .catch(() => {});

  if (ulozene !== undefined) return ulozene;

  await aktualizace;
  return (await spiz.match(url)) ?? null;
}

/**
 * Vybere strategii podle adresy požadavku.
 * @param {string} url adresa požadavku
 * @returns {'cache-first'|'network-first'|'stale-while-revalidate'} jméno strategie
 */
function vyberStrategii(url) {
  if (/\.[0-9a-f]{6,}\.[a-z]+$/.test(url)) return 'cache-first';
  if (url.startsWith('/api/')) return 'stale-while-revalidate';
  return 'network-first';
}

/**
 * Vrátí jména spíží, které se mají smazat.
 * @param {string[]} jmena všechna jména spíží v prohlížeči
 * @param {string} aktualni jméno spíže současné verze
 * @returns {string[]} jména ke smazání
 */
function uklidStareSpize(jmena, aktualni) {
  return jmena.filter((jmeno) => jmeno !== aktualni);
}

// --- Falešná spíž a síť, ať je výsledek vidět v konzoli ---------------------

function falesnaSpiz(data = {}) {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) {
      return ulozene.get(url);
    },
    async put(url, odpoved) {
      ulozene.set(url, odpoved);
    },
    async klice() {
      return [...ulozene.keys()];
    },
  };
}

async function zkouska() {
  const spiz = falesnaSpiz({ '/api/poznamky': 'poznámky ze spíže' });
  const sit = async (url) => `${url} ze sítě`;

  console.log('strategie pro /api/poznamky:', vyberStrategii('/api/poznamky'));
  console.log('odpověď:', await staleWhileRevalidate('/api/poznamky', spiz, sit));
  console.log('ke smazání:', uklidStareSpize(['zapisnik-v1', 'zapisnik-v2'], 'zapisnik-v2'));
}

zkouska();
```

# --approaches--

## --approach-- Řetěz `.then()` místo `async`/`await`

Přesně takhle je napsaná většina existujících service workerů — `async`/`await` se
v nich dodnes používá málo, protože `event.respondWith()` chce promise, a ta je tu
vidět na první pohled.

### --file-- script.js

```js
/**
 * Nejdřív spíž, síť až jako doplnění.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
function cacheFirst(url, spiz, sit) {
  return spiz.match(url).then((ulozene) => {
    if (ulozene !== undefined) return ulozene;
    return sit(url).then((cerstve) => spiz.put(url, cerstve).then(() => cerstve));
  });
}

/**
 * Nejdřív síť, spíž jako záchrana při výpadku.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku, nebo null
 */
function networkFirst(url, spiz, sit) {
  return sit(url)
    .then((cerstve) => spiz.put(url, cerstve).then(() => cerstve))
    .catch(() => spiz.match(url).then((ulozene) => ulozene ?? null));
}

/**
 * Uloženou odpověď vrať hned, čerstvou si stáhni na pozadí.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
function staleWhileRevalidate(url, spiz, sit) {
  const aktualizace = Promise.resolve()
    .then(() => sit(url))
    .then((cerstve) => spiz.put(url, cerstve).then(() => cerstve))
    .catch(() => null);

  return spiz.match(url).then((ulozene) => {
    if (ulozene !== undefined) return ulozene;
    return aktualizace;
  });
}

/**
 * Vybere strategii podle adresy požadavku.
 * @param {string} url adresa požadavku
 * @returns {'cache-first'|'network-first'|'stale-while-revalidate'} jméno strategie
 */
function vyberStrategii(url) {
  const soubor = url.split('/').at(-1) ?? '';
  const casti = soubor.split('.');
  if (casti.length >= 3 && /^[0-9a-f]{6,}$/.test(casti.at(-2))) return 'cache-first';
  if (url.startsWith('/api/')) return 'stale-while-revalidate';
  return 'network-first';
}

/**
 * Vrátí jména spíží, které se mají smazat.
 * @param {string[]} jmena všechna jména spíží v prohlížeči
 * @param {string} aktualni jméno spíže současné verze
 * @returns {string[]} jména ke smazání
 */
function uklidStareSpize(jmena, aktualni) {
  const ke_smazani = [];
  for (const jmeno of jmena) {
    if (jmeno !== aktualni) ke_smazani.push(jmeno);
  }
  return ke_smazani;
}

// --- Falešná spíž a síť, ať je výsledek vidět v konzoli ---------------------

function falesnaSpiz(data = {}) {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) {
      return ulozene.get(url);
    },
    async put(url, odpoved) {
      ulozene.set(url, odpoved);
    },
    async klice() {
      return [...ulozene.keys()];
    },
  };
}

async function zkouska() {
  const spiz = falesnaSpiz({ '/api/poznamky': 'poznámky ze spíže' });
  const sit = async (url) => `${url} ze sítě`;

  console.log('strategie pro /api/poznamky:', vyberStrategii('/api/poznamky'));
  console.log('odpověď:', await staleWhileRevalidate('/api/poznamky', spiz, sit));
  console.log('ke smazání:', uklidStareSpize(['zapisnik-v1', 'zapisnik-v2'], 'zapisnik-v2'));
}

zkouska();
```

## --approach-- Jedna tabulka pravidel místo podmínek

Když pravidel přibývá (fonty, obrázky, verzované API), přehlednější je seznam dvojic
„poznávací znamení → strategie". Přidání dalšího pravidla je pak jeden řádek.

### --file-- script.js

```js
/**
 * Nejdřív spíž, síť až jako doplnění.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
async function cacheFirst(url, spiz, sit) {
  const ulozene = await spiz.match(url);
  if (ulozene !== undefined) return ulozene;
  const cerstve = await sit(url);
  await spiz.put(url, cerstve);
  return cerstve;
}

/**
 * Nejdřív síť, spíž jako záchrana při výpadku.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku, nebo null
 */
async function networkFirst(url, spiz, sit) {
  try {
    const cerstve = await sit(url);
    await spiz.put(url, cerstve);
    return cerstve;
  } catch {
    return (await spiz.match(url)) ?? null;
  }
}

/**
 * Uloženou odpověď vrať hned, čerstvou si stáhni na pozadí.
 * @param {string} url adresa požadavku
 * @param {{ match: Function, put: Function, klice: Function }} spiz úložiště odpovědí
 * @param {(url: string) => Promise<string>} sit funkce, která stáhne čerstvou odpověď
 * @returns {Promise<string|null>} odpověď pro stránku
 */
async function staleWhileRevalidate(url, spiz, sit) {
  const ulozene = await spiz.match(url);
  const aktualizace = (async () => {
    try {
      const cerstve = await sit(url);
      await spiz.put(url, cerstve);
      return cerstve;
    } catch {
      return null;
    }
  })();

  return ulozene !== undefined ? ulozene : aktualizace;
}

const PRAVIDLA = [
  { pozna: (url) => /\.[0-9a-f]{6,}\.[a-z]+$/.test(url), strategie: 'cache-first' },
  { pozna: (url) => url.startsWith('/api/'), strategie: 'stale-while-revalidate' },
];

/**
 * Vybere strategii podle adresy požadavku.
 * @param {string} url adresa požadavku
 * @returns {'cache-first'|'network-first'|'stale-while-revalidate'} jméno strategie
 */
function vyberStrategii(url) {
  return PRAVIDLA.find((pravidlo) => pravidlo.pozna(url))?.strategie ?? 'network-first';
}

/**
 * Vrátí jména spíží, které se mají smazat.
 * @param {string[]} jmena všechna jména spíží v prohlížeči
 * @param {string} aktualni jméno spíže současné verze
 * @returns {string[]} jména ke smazání
 */
function uklidStareSpize(jmena, aktualni) {
  return jmena.filter((jmeno) => jmeno !== aktualni);
}

// --- Falešná spíž a síť, ať je výsledek vidět v konzoli ---------------------

function falesnaSpiz(data = {}) {
  const ulozene = new Map(Object.entries(data));
  return {
    async match(url) {
      return ulozene.get(url);
    },
    async put(url, odpoved) {
      ulozene.set(url, odpoved);
    },
    async klice() {
      return [...ulozene.keys()];
    },
  };
}

async function zkouska() {
  const spiz = falesnaSpiz({ '/api/poznamky': 'poznámky ze spíže' });
  const sit = async (url) => `${url} ze sítě`;

  console.log('strategie pro /api/poznamky:', vyberStrategii('/api/poznamky'));
  console.log('odpověď:', await staleWhileRevalidate('/api/poznamky', spiz, sit));
  console.log('ke smazání:', uklidStareSpize(['zapisnik-v1', 'zapisnik-v2'], 'zapisnik-v2'));
}

zkouska();
```

# --review--

Testy hlídají chování. Tohle si projdi sám, než lab uzavřeš.

## --rubric--

- Každá ze tří strategií je čitelná na jeden pohled — je z ní vidět pořadí „co zkusím první".
- Chyba sítě se odchytává tam, kde se opravdu může stát, ne obalením celé funkce.
- `vyberStrategii` jde rozšířit o další pravidlo, aniž bys musel přepisovat ta stávající.
- Dokážeš u každé strategie říct, co uvidí uživatel offline.

## --extensions--

Rozšíření bez testů: přidej strategii **network-only** pro odesílání dat, doplň
`cacheFirst` o maximální stáří uložené odpovědi a napiš funkci, která z pole adres
spočítá, kolik místa spíž zabírá.
