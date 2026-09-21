---
title: Audit výkonu
runtime: dom
see: nastroje-devtools-vykon/core-web-vitals#tri-otazky-uzivatele-nacetlo-se-reaguje-drzi-na-miste, nastroje-devtools-vykon/nacitani-stranky#kriticka-cesta-vykreslovani, nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly
---

# --description--

Knihkupectví Stránka si nechalo udělat web od někoho, kdo o výkonu nikdy neslyšel.
Lighthouse svítí červeně, na mobilu se stránka načítá vteřiny do bílé a při psaní
do vyhledávání sekne.

Dostal jsi ho k auditu. Máš před sebou **devět konkrétních problémů** ve třech souborech.
Každý z nich je typický a každý potkáš znovu.

## Než začneš

Pusť si stránku a podívej se do DevTools dřív, než začneš cokoli měnit:

1. **Network** — co se stahuje a co na co čeká.
2. **Lighthouse** — projdi doporučení odshora; u každého je seznam souborů.
3. **Performance** — nahraj psaní do vyhledávacího pole a najdi dlouhou úlohu.

Teprve pak opravuj. Audit, který začíná opravami, spraví to, co bije do očí, a mine to,
co uživatele doopravdy zdržuje.

## Co je potřeba opravit

**V `index.html`**

1. Dva skripty v hlavičce blokují vykreslení. Nech je stáhnout souběžně, ale spustit
   až po sestavení dokumentu.
2. Žádný obrázek nemá rozměry, takže při načítání všechno poskakuje (logo 200 × 50,
   hlavní banner 1200 × 400, obálky knih 300 × 450).
3. Hlavní banner je prvek, podle kterého se měří LCP. Dej prohlížeči signál, ať ho
   stáhne přednostně.
4. Hlavní banner má zároveň `loading="lazy"` — u prvku nad ohybem je to přesně naopak,
   než co chceš.
5. Obálky knih pod ohybem se stahují hned, i když je zatím nikdo nevidí.
6. Písmo se stahuje pozdě, až na něj narazí CSS. Přednačti `Lato.woff2` z hlavičky.

**V `search.js`**

7. Při každém stisku klávesy odchází dotaz na server. Vyhledávání se má spustit až
   **300 ms poté**, co uživatel přestal psát.
8. `sledujSeznam` přidává posluchač scrollování pokaždé, když se seznam překreslí, ale
   nikdy žádný neodebere. Po pár hledáních jich tam visí desítky a drží v paměti staré
   seznamy.

**V `heavy.js`**

9. `spoctiStatistiku` projde deset tisíc knih v jednom kuse a na tu dobu stránka
   neodpovídá. Rozděl práci tak, aby mezi dávkami pustila hlavní vlákno ke slovu — a ať
   jde na konec počkat.

> [!TIP]
> Body 7 a 9 se dají ověřit i bez testů: otevři Performance, nahraj psaní do vyhledávání
> a podívej se, kolik úloh vzniklo. Před opravou uvidíš jednu na každé písmeno,
> po opravě jednu celkem.

# --hints--

Oba skripty v hlavičce se stahují souběžně, ale nespouštějí se dřív než po sestavení dokumentu.

```js
const html = files['index.html'];
const znacky = [...html.matchAll(/<script\b[^>]*\bsrc=[^>]*>/gi)].map((m) => m[0]);
assert.equal(znacky.length, 2, `V index.html jsou ${znacky.length} značky <script src>, mají být dvě`);
for (const znacka of znacky) {
  assert.match(znacka, /\b(defer|async|type=["']module["'])/i, `Skript pořád blokuje vykreslení: ${znacka}`);
}
```

Všechny obrázky mají v HTML zapsané rozměry, takže se stránka při načítání nehýbe.

```js
const bez = [...document.querySelectorAll('img')].filter((img) => !img.getAttribute('width') || !img.getAttribute('height'));
assert.deepEqual(bez.map((img) => img.getAttribute('src')), [], `Bez rozměrů zůstaly obrázky: ${bez.map((i) => i.getAttribute('src')).join(', ')}`);
const rozmery = (sel) => { const el = document.querySelector(sel); return [el.getAttribute('width'), el.getAttribute('height')]; };
assert.deepEqual(rozmery('.logo'), ['200', '50'], 'Logo má mít rozměry 200 × 50');
assert.deepEqual(rozmery('.hero'), ['1200', '400'], 'Hlavní banner má mít rozměry 1200 × 400');
for (const obalka of document.querySelectorAll('.knihy img')) {
  assert.deepEqual([obalka.getAttribute('width'), obalka.getAttribute('height')], ['300', '450'], `Obálka ${obalka.getAttribute('src')} má mít rozměry 300 × 450`);
}
```

Hlavní banner se stahuje přednostně.

```js
const hero = document.querySelector('.hero');
assert.equal(hero.getAttribute('fetchpriority'), 'high', `Hlavní banner má fetchpriority="${hero.getAttribute('fetchpriority') ?? ''}" — prvek, podle kterého se měří LCP, si zaslouží high`);
```

Hlavní banner se načítá hned, ne líně.

```js
const hero = document.querySelector('.hero');
assert.notEqual(hero.getAttribute('loading'), 'lazy', 'Banner nad ohybem nesmí mít loading="lazy" — líné načítání odsune právě ten prvek, podle kterého se LCP měří');
```

Obálky knih pod ohybem se načítají líně.

```js
const obalky = [...document.querySelectorAll('.knihy img')];
assert.ok(obalky.length >= 3, `Obálek je ${obalky.length}, mají být aspoň tři`);
const bez = obalky.filter((img) => img.getAttribute('loading') !== 'lazy');
assert.deepEqual(bez.map((i) => i.getAttribute('src')), [], `Bez líného načítání zůstaly obálky: ${bez.map((i) => i.getAttribute('src')).join(', ')}`);
```

Písmo se přednačítá z hlavičky.

```js
const hlavicka = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(files['index.html'])?.[1] ?? '';
const link = [...hlavicka.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((t) => /rel=["']preload["']/i.test(t) && /Lato\.woff2/i.test(t));
assert.ok(link, 'V <head> chybí <link rel="preload"> na Lato.woff2');
assert.match(link, /\bas=["']font["']/i, `Přednačtení potřebuje as="font", jinak prohlížeč neví, co s tím: ${link}`);
assert.match(link, /\bcrossorigin\b/i, `Přednačtení písma potřebuje atribut crossorigin, jinak se soubor stáhne dvakrát: ${link}`);
```

Vyhledávání se spustí až 300 ms poté, co uživatel přestal psát.

```js
let volani = 0;
const hledej = window.debounceSearch(() => { volani += 1; });
assert.equal(typeof hledej, 'function', 'debounceSearch má vrátit funkci');
hledej('h'); hledej('ha'); hledej('har');
await helpers.wait(120);
assert.equal(volani, 0, `Po 120 ms už vyhledávání běželo ${volani}× — má počkat, až uživatel přestane psát`);
await helpers.wait(360);
assert.equal(volani, 1, `Po 480 ms mělo vyhledávání proběhnout právě jednou, proběhlo ${volani}×`);
```

Posluchač scrollování po sobě uklidí.

```js
const kod = helpers.stripComments(files['search.js']);
assert.match(kod, /removeEventListener|AbortController|\{\s*once:\s*true\s*\}/, 'V search.js se posluchač scrollování nikdy neodebere — použij removeEventListener nebo AbortController');
const seznam = document.querySelector('.seznam');
const pridano = [];
const odebrano = [];
const puvodniPridat = seznam.addEventListener.bind(seznam);
const puvodniOdebrat = seznam.removeEventListener.bind(seznam);
seznam.addEventListener = (...args) => { pridano.push(args[0]); return puvodniPridat(...args); };
seznam.removeEventListener = (...args) => { odebrano.push(args[0]); return puvodniOdebrat(...args); };
const puvodniAbort = AbortController.prototype.abort;
let zruseno = 0;
AbortController.prototype.abort = function (...args) { zruseno += 1; return puvodniAbort.apply(this, args); };
try {
  window.sledujSeznam(seznam);
  window.sledujSeznam(seznam);
  window.sledujSeznam(seznam);
} finally {
  AbortController.prototype.abort = puvodniAbort;
  seznam.addEventListener = puvodniPridat;
  seznam.removeEventListener = puvodniOdebrat;
}
assert.equal(pridano.length, 3, `Posluchač se přidal ${pridano.length}×, má se přidat při každém volání`);
assert.ok(odebrano.length + zruseno >= 2, `Po třech překresleních se uklidily ${odebrano.length + zruseno} posluchače — každé další volání má nejdřív zrušit to předchozí`);
```

Dlouhý výpočet pustí mezi dávkami hlavní vlákno a dá se na něj počkat.

```js
const vysledek = window.spoctiStatistiku(Array.from({ length: 10000 }, (_, i) => ({ cena: (i % 500) + 1 })));
assert.ok(vysledek && typeof vysledek.then === 'function', 'spoctiStatistiku má vracet Promise, aby se dalo počkat na konec');
// Kdyby cyklus proběhl v jednom kuse, promise by se vyřídila hned v první mikroúloze.
let hotovo = false;
vysledek.then(() => { hotovo = true; });
for (let i = 0; i < 200; i += 1) await Promise.resolve();
assert.ok(!hotovo, 'Výpočet doběhl bez jediného uvolnění vlákna — rozděl ho na dávky a mezi nimi počkej (await), ať se prohlížeč dostane ke slovu');
const prumer = await vysledek;
assert.equal(typeof prumer, 'number', `spoctiStatistiku má vrátit číslo, vrátila ${typeof prumer}`);
assert.ok(Number.isFinite(prumer) && prumer > 0, `Průměrná cena vyšla ${prumer} — má to být kladné číslo`);
```

# --help--

## --tip--

Začni tím, co ti řekne Lighthouse sám: pusť audit a jdi odshora podle doporučení.
U každého je rozbalovací seznam konkrétních souborů, kterých se týká.

## --tip--

U bodů 1 až 6 se nic nepočítá — jsou to atributy v HTML. Který na co je, najdeš
v částech [Skripty](see:nastroje-devtools-vykon/nacitani-stranky#skripty-defer-async-a-moduly)
a [Obrázky](see:nastroje-devtools-vykon/nacitani-stranky#obrazky-format-rozmery-a-priorita).

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Knihkupectví Stránka</title>
    <link rel="stylesheet" href="styles.css">
    <script src="search.js"></script>
    <script src="heavy.js"></script>
  </head>
  <body>
    <header class="hlavicka">
      <img class="logo" src="logo.webp" alt="Knihkupectví Stránka">
      <input class="hledani" type="search" placeholder="Hledat knihu…" aria-label="Hledat knihu">
    </header>

    <main>
      <img class="hero" src="hero.webp" loading="lazy" alt="Podzimní sleva: druhá kniha za polovinu">

      <h1>Novinky v prodeji</h1>
      <div class="knihy">
        <img src="obalka-1.webp" alt="Obálka knihy Tichá pošta">
        <img src="obalka-2.webp" alt="Obálka knihy Vlak do Chebu">
        <img src="obalka-3.webp" alt="Obálka knihy Poslední směna">
        <img src="obalka-4.webp" alt="Obálka knihy Nebe nad sídlištěm">
      </div>

      <h2>Výsledky hledání</h2>
      <ul class="seznam"></ul>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
@font-face {
  font-family: 'Lato';
  src: url('Lato.woff2') format('woff2');
  font-display: swap;
}

* { box-sizing: border-box; }
body { margin: 0; padding: 1.5rem 1.25rem 3rem; font-family: 'Lato', system-ui, sans-serif; color: #1c2430; background: #f6f5f2; }
.hlavicka { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.logo { display: block; }
.hledani { flex: 1; min-width: 12rem; padding: 0.5rem 0.75rem; border: 2px solid #d3d0c8; border-radius: 0.4rem; font: inherit; }
.hero { display: block; width: 100%; height: auto; border-radius: 0.75rem; background: linear-gradient(135deg, #b08968, #6b4f3a); }
h1 { font-size: 1.5rem; }
.knihy { display: grid; grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); gap: 1rem; }
.knihy img { width: 100%; height: auto; border-radius: 0.4rem; background: linear-gradient(135deg, #8aa5b8, #3c5a72); }
.seznam { min-height: 6rem; max-height: 12rem; overflow: auto; padding-left: 1.25rem; }
```

## --file-- search.js

```js
// Vyhledávání v katalogu. Volá se při každém stisku klávesy v poli .hledani.

// Obal, který má vyhledávání spustit až poté, co uživatel přestane psát.
function debounceSearch(fn) {
  // TODO: spusť fn až 300 ms po posledním volání
  return fn;
}

// Po každém překreslení seznamu se sem přidá posluchač scrollování,
// aby se doměřilo, kam uživatel došel. Odebrat ho zatím nikoho nenapadlo.
function sledujSeznam(seznam) {
  seznam.addEventListener('scroll', () => {
    seznam.dataset.dole = String(seznam.scrollTop + seznam.clientHeight >= seznam.scrollHeight - 4);
  });
}

window.debounceSearch = debounceSearch;
window.sledujSeznam = sledujSeznam;
```

## --file-- heavy.js

```js
// Statistika nad katalogem. Deset tisíc knih, jeden cyklus, půl vteřiny ticha.

function spoctiStatistiku(knihy) {
  let soucet = 0;
  for (const kniha of knihy) {
    soucet += kniha.cena;
  }
  return soucet / knihy.length;
}

window.spoctiStatistiku = spoctiStatistiku;
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Knihkupectví Stránka</title>
    <link rel="preload" href="Lato.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="styles.css">
    <script src="search.js" defer></script>
    <script src="heavy.js" defer></script>
  </head>
  <body>
    <header class="hlavicka">
      <img class="logo" src="logo.webp" width="200" height="50" alt="Knihkupectví Stránka">
      <input class="hledani" type="search" placeholder="Hledat knihu…" aria-label="Hledat knihu">
    </header>

    <main>
      <img class="hero" src="hero.webp" width="1200" height="400" fetchpriority="high" alt="Podzimní sleva: druhá kniha za polovinu">

      <h1>Novinky v prodeji</h1>
      <div class="knihy">
        <img src="obalka-1.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Tichá pošta">
        <img src="obalka-2.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Vlak do Chebu">
        <img src="obalka-3.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Poslední směna">
        <img src="obalka-4.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Nebe nad sídlištěm">
      </div>

      <h2>Výsledky hledání</h2>
      <ul class="seznam"></ul>
    </main>
  </body>
</html>
```

## --file-- search.js

```js
// Vyhledávání v katalogu. Volá se při každém stisku klávesy v poli .hledani.

// Obal, který spustí vyhledávání až 300 ms po posledním stisku.
function debounceSearch(fn) {
  let casovac;
  return (...args) => {
    clearTimeout(casovac);
    casovac = setTimeout(() => fn(...args), 300);
  };
}

// Posluchač scrollování po sobě uklidí: před přidáním nového zruší ten předchozí.
let sledovani = null;

function sledujSeznam(seznam) {
  sledovani?.abort();
  sledovani = new AbortController();
  seznam.addEventListener(
    'scroll',
    () => {
      seznam.dataset.dole = String(seznam.scrollTop + seznam.clientHeight >= seznam.scrollHeight - 4);
    },
    { signal: sledovani.signal },
  );
}

window.debounceSearch = debounceSearch;
window.sledujSeznam = sledujSeznam;
```

## --file-- heavy.js

```js
// Statistika nad katalogem. Po dávkách, s uvolněním vlákna mezi nimi.

async function spoctiStatistiku(knihy) {
  const DAVKA = 500;
  let soucet = 0;
  for (let i = 0; i < knihy.length; i += 1) {
    soucet += knihy[i].cena;
    if (i % DAVKA === DAVKA - 1) {
      await new Promise((hotovo) => setTimeout(hotovo, 0));
    }
  }
  return soucet / knihy.length;
}

window.spoctiStatistiku = spoctiStatistiku;
```

# --approaches--

## --approach-- Úklid posluchače přes removeEventListener

Bez `AbortController`: podrž si odkaz na funkci posluchače a před přidáním nového ho
odeber. Funguje všude a je to vidět na první pohled — za to si musíš pamatovat i prvek,
ze kterého odebíráš. `AbortController` se hodí ve chvíli, kdy jedním signálem rušíš víc
posluchačů naráz.

### --file-- search.js

```js
// Vyhledávání v katalogu. Volá se při každém stisku klávesy v poli .hledani.

function debounceSearch(fn) {
  let casovac;
  return (...args) => {
    clearTimeout(casovac);
    casovac = setTimeout(() => fn(...args), 300);
  };
}

// Odkaz na posledního posluchače a prvek, na kterém visí.
let posledni = null;

function sledujSeznam(seznam) {
  if (posledni) posledni.prvek.removeEventListener('scroll', posledni.handler);
  const handler = () => {
    seznam.dataset.dole = String(seznam.scrollTop + seznam.clientHeight >= seznam.scrollHeight - 4);
  };
  seznam.addEventListener('scroll', handler);
  posledni = { prvek: seznam, handler };
}

window.debounceSearch = debounceSearch;
window.sledujSeznam = sledujSeznam;
```

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Knihkupectví Stránka</title>
    <link rel="preload" href="Lato.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="styles.css">
    <script src="search.js" defer></script>
    <script src="heavy.js" defer></script>
  </head>
  <body>
    <header class="hlavicka">
      <img class="logo" src="logo.webp" width="200" height="50" alt="Knihkupectví Stránka">
      <input class="hledani" type="search" placeholder="Hledat knihu…" aria-label="Hledat knihu">
    </header>

    <main>
      <img class="hero" src="hero.webp" width="1200" height="400" fetchpriority="high" alt="Podzimní sleva: druhá kniha za polovinu">

      <h1>Novinky v prodeji</h1>
      <div class="knihy">
        <img src="obalka-1.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Tichá pošta">
        <img src="obalka-2.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Vlak do Chebu">
        <img src="obalka-3.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Poslední směna">
        <img src="obalka-4.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Nebe nad sídlištěm">
      </div>

      <h2>Výsledky hledání</h2>
      <ul class="seznam"></ul>
    </main>
  </body>
</html>
```

### --file-- heavy.js

```js
// Statistika nad katalogem. Po dávkách, s uvolněním vlákna mezi nimi.

async function spoctiStatistiku(knihy) {
  const DAVKA = 500;
  let soucet = 0;
  for (let i = 0; i < knihy.length; i += 1) {
    soucet += knihy[i].cena;
    if (i % DAVKA === DAVKA - 1) {
      await new Promise((hotovo) => setTimeout(hotovo, 0));
    }
  }
  return soucet / knihy.length;
}

window.spoctiStatistiku = spoctiStatistiku;
```

## --approach-- scheduler.yield() s náhradním řešením

`scheduler.yield()` je přesně na tohle: vrátí řízení prohlížeči a slíbí, že se dostaneš
ke slovu dřív než nově příchozí úlohy — na rozdíl od `setTimeout(…, 0)`, který si stoupne
na konec fronty. Zatím ho ale neumí všechny prohlížeče, takže potřebuje záložní větev.

### --file-- heavy.js

```js
// Statistika nad katalogem. Po dávkách, s uvolněním vlákna mezi nimi.

// Uvolni vlákno tím nejlepším způsobem, který prohlížeč umí.
const pustVlakno = () =>
  globalThis.scheduler?.yield?.() ?? new Promise((hotovo) => setTimeout(hotovo, 0));

async function spoctiStatistiku(knihy) {
  const DAVKA = 500;
  let soucet = 0;
  for (let i = 0; i < knihy.length; i += 1) {
    soucet += knihy[i].cena;
    if (i % DAVKA === DAVKA - 1) {
      await pustVlakno();
    }
  }
  return soucet / knihy.length;
}

window.spoctiStatistiku = spoctiStatistiku;
```

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Knihkupectví Stránka</title>
    <link rel="preload" href="Lato.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="styles.css">
    <script src="search.js" defer></script>
    <script src="heavy.js" defer></script>
  </head>
  <body>
    <header class="hlavicka">
      <img class="logo" src="logo.webp" width="200" height="50" alt="Knihkupectví Stránka">
      <input class="hledani" type="search" placeholder="Hledat knihu…" aria-label="Hledat knihu">
    </header>

    <main>
      <img class="hero" src="hero.webp" width="1200" height="400" fetchpriority="high" alt="Podzimní sleva: druhá kniha za polovinu">

      <h1>Novinky v prodeji</h1>
      <div class="knihy">
        <img src="obalka-1.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Tichá pošta">
        <img src="obalka-2.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Vlak do Chebu">
        <img src="obalka-3.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Poslední směna">
        <img src="obalka-4.webp" width="300" height="450" loading="lazy" alt="Obálka knihy Nebe nad sídlištěm">
      </div>

      <h2>Výsledky hledání</h2>
      <ul class="seznam"></ul>
    </main>
  </body>
</html>
```

### --file-- search.js

```js
// Vyhledávání v katalogu. Volá se při každém stisku klávesy v poli .hledani.

// Obal, který spustí vyhledávání až 300 ms po posledním stisku.
function debounceSearch(fn) {
  let casovac;
  return (...args) => {
    clearTimeout(casovac);
    casovac = setTimeout(() => fn(...args), 300);
  };
}

// Posluchač scrollování po sobě uklidí: před přidáním nového zruší ten předchozí.
let sledovani = null;

function sledujSeznam(seznam) {
  sledovani?.abort();
  sledovani = new AbortController();
  seznam.addEventListener(
    'scroll',
    () => {
      seznam.dataset.dole = String(seznam.scrollTop + seznam.clientHeight >= seznam.scrollHeight - 4);
    },
    { signal: sledovani.signal },
  );
}

window.debounceSearch = debounceSearch;
window.sledujSeznam = sledujSeznam;
```

# --review--

Testy kontrolují soubory a chování. Samotný audit si udělej sám — o to tu jde.

## --rubric--

- Před opravami jsem si pustil Lighthouse a zapsal výchozí čísla; po opravách jsem ho
  pustil znovu a porovnal.
- V panelu Network vidím, že se obálky knih stahují až při scrollování.
- V panelu Performance je psaní do vyhledávání jedna úloha, ne jedna na každé písmeno.
- Rozumím, proč `loading="lazy"` na hlavním banneru škodí, i když jinde pomáhá.
- U dlouhého výpočtu vím, proč se dělí na dávky a co by se stalo bez uvolnění vlákna.
- Umím říct, který z těch devíti problémů měl na uživatele největší vliv — a podle čeho
  to soudím.

## --extensions--

- Změř si rozdíl: přidej do stránky `PerformanceObserver` na `largest-contentful-paint`
  a vypiš hodnotu do konzole před opravou a po ní.
- Zkus `content-visibility: auto` na sekci s knihami a porovnej v Performance dobu
  rozvržení.
- Nahraď dávkování podle počtu za `scheduler.yield()` a zjisti v tabulce kompatibility,
  odkdy se na to dá spolehnout.
- Najdi na webu, který sám používáš, aspoň jeden z těchhle devíti problémů.
