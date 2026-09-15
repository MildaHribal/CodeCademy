---
title: Galerie s nekonečným scrollováním
timeoutMs: 8000
see: js-dom/prohlizecova-api#sledovani-prvku-intersectionobserver-a-resizeobserver, js-async/fetch#stavy-nacitani-chyba-a-prazdno, js-async/fetch#404-a-500-nejsou-pro-fetch-chyba
---

# --description--

Nekonečný seznam znáš z Instagramu, Pinterestu i z výpisu zboží v e-shopu: dojedeš dolů a další položky se načtou samy. Postav ho pro fotosoutěž Krásy Česka. API vrací fotky po stránkách a běží přímo v náhledu: `api.js` nahrazuje `fetch` pro adresy `/api/…`, odpovídá se zpožděním a umí i selhat. Popis API je nahoře v `api.js`.

Stránka má hotové HTML a vzhled. JavaScript v `app.js` píšeš celý sám. **Texty, popisky a vzhled jsou tvoje volba**, testy kontrolují jen chování a prvky podle `id`.

Co má galerie umět:

- Hned po otevření se načte první stránka fotek. Každá fotka je položka `li` v `#gallery` s obrázkem (`src` z API, `alt` s názvem fotky), názvem a autorem.
- Během načítání má `#gallery` atribut `aria-busy="true"` a `#status` říká, že se načítá. Po načtení `aria-busy` zmizí.
- Když uživatel doscrolluje k prázdnému prvku `#sentinel` pod galerií, připojí se na konec další stránka. Fotky, které už jsou vidět, zůstanou.
- Žádná stránka se nenačte dvakrát, ani když `#sentinel` během načítání zmizí z obrazovky a znovu se objeví.
- Po poslední stránce se ukáže `#end` a galerie už nic dalšího nenačítá.
- Když načtení stránky selže (chybová odpověď serveru nebo výpadek sítě), `#status` to řekne, ukáže se tlačítko `#retry` a fotky, které už jsou vidět, zůstanou.
- Kliknutí na **Zkusit znovu** načte stejnou stránku ještě jednou a tlačítko schová.

> [!NOTE]
> Testy běží v náhledu široké 1024 px a posouvají stránku samy. Když si vzhled výrazně změníš (třeba šest fotek vedle sebe), může se stát, že se `#sentinel` po načtení stránky nevzdálí z obrazovky a posun ho „neobjeví" znovu. S výchozím rozvržením se to nestane.

# --hints--

Po otevření stránky je v `#gallery` prvních 12 fotek a první stránka se načetla jen jednou.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const images = () => document.querySelectorAll('#gallery li img');
await until(() => images().length >= 12, 'po otevření se má do #gallery načíst první stránka fotek (li s img)', 3000);
await helpers.wait(600);
assert.equal(images().length, 12, `po otevření má být v #gallery 12 fotek z první stránky, je jich ${images().length}`);
assert.equal(mockApi.requests.filter((request) => request.page === 1).length, 1, 'první stránka se má načíst jen jednou — nenačítáš ji zároveň při startu i z IntersectionObserver bez ochrany?');
```

Každá fotka má obrázek se `src` z API a `alt` s názvem a v položce je vidět název i autor.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelectorAll('#gallery li img').length === 12, 'po otevření se má do #gallery načíst 12 fotek (li s img)', 3000);
const items = [...document.querySelectorAll('#gallery > li')];
mockApi.photos.slice(0, 12).forEach((photo, index) => {
  const image = items[index]?.querySelector('img');
  assert.equal(image?.getAttribute('src'), photo.url, `${index + 1}. fotka má mít src z API (fotka „${photo.title}")`);
  assert.equal(image?.alt, photo.title, `${index + 1}. fotka má mít alt „${photo.title}"`);
  assert.ok(items[index].textContent.includes(photo.title), `v ${index + 1}. položce má být vidět název „${photo.title}"`);
  assert.ok(items[index].textContent.includes(photo.author), `v ${index + 1}. položce má být vidět autor „${photo.author}"`);
});
```

Když uživatel doscrolluje k `#sentinel`, připojí se druhá stránka a první zůstane.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reveal = async () => {
  document.body.style.paddingBlockEnd = '100vh';
  window.scrollTo(0, 0);
  await helpers.wait(120);
  document.querySelector('#sentinel').scrollIntoView({ block: 'center' });
};
const images = () => [...document.querySelectorAll('#gallery li img')];
await until(() => images().length === 12, 'po otevření se má do #gallery načíst 12 fotek první stránky', 3000);
mockApi.delay = 60;
await reveal();
await until(() => images().length === 24, 'po doscrollování k #sentinel má být v #gallery 24 fotek', 3000);
assert.deepEqual(images().map((image) => image.alt), mockApi.photos.slice(0, 24).map((photo) => photo.title), 'po doscrollování má #gallery obsahovat fotky první a druhé stránky v pořadí z API');
```

Během načítání má `#gallery` atribut `aria-busy="true"` a `#status` není prázdný; po načtení `aria-busy` zmizí.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reveal = async () => {
  document.body.style.paddingBlockEnd = '100vh';
  window.scrollTo(0, 0);
  await helpers.wait(120);
  document.querySelector('#sentinel').scrollIntoView({ block: 'center' });
};
const gallery = document.querySelector('#gallery');
await until(() => gallery.querySelectorAll('img').length === 12, 'po otevření se má do #gallery načíst 12 fotek první stránky', 3000);
await helpers.wait(50);
assert.notEqual(gallery.getAttribute('aria-busy'), 'true', 'po načtení první stránky nemá mít #gallery aria-busy="true"');
mockApi.delay = 500;
await reveal();
await until(() => gallery.getAttribute('aria-busy') === 'true', 'během načítání druhé stránky má mít #gallery aria-busy="true"', 2000);
assert.notEqual(document.querySelector('#status').textContent.trim(), '', 'během načítání má #status říct, že se načítá');
await until(() => gallery.querySelectorAll('img').length === 24, 'po doscrollování má přibýt druhá stránka (24 fotek)', 3000);
await helpers.wait(50);
assert.notEqual(gallery.getAttribute('aria-busy'), 'true', 'po načtení druhé stránky má aria-busy zmizet');
```

Stránka se nenačte dvakrát, ani když `#sentinel` během načítání zmizí a znovu se objeví.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const images = () => document.querySelectorAll('#gallery li img');
await until(() => images().length === 12, 'po otevření se má do #gallery načíst 12 fotek první stránky', 3000);
mockApi.delay = 700;
document.body.style.paddingBlockEnd = '100vh';
const sentinel = document.querySelector('#sentinel');
window.scrollTo(0, 0);
await helpers.wait(120);
sentinel.scrollIntoView({ block: 'center' });
await until(() => mockApi.requests.some((request) => request.page === 2), 'po doscrollování k #sentinel se má začít načítat druhá stránka', 2000);
window.scrollTo(0, 0);
await helpers.wait(150);
sentinel.scrollIntoView({ block: 'center' });
await helpers.wait(150);
await until(() => images().length >= 24, 'druhá stránka se má načíst', 3000);
await helpers.wait(300);
const pageTwo = mockApi.requests.filter((request) => request.page === 2).length;
assert.equal(pageTwo, 1, `druhá stránka se má načíst jednou, načetla se ${pageTwo}× — hlídáš, že už se načítá?`);
assert.equal(mockApi.maxActive, 1, `naráz má běžet nejvýš jeden požadavek, běželo jich ${mockApi.maxActive}`);
```

Po poslední stránce je vidět `#end`, v galerii je všech 48 fotek a další posun už nic nenačte.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reveal = async () => {
  document.body.style.paddingBlockEnd = '100vh';
  window.scrollTo(0, 0);
  await helpers.wait(120);
  document.querySelector('#sentinel').scrollIntoView({ block: 'center' });
};
const count = () => document.querySelectorAll('#gallery li img').length;
await until(() => count() === 12, 'po otevření se má do #gallery načíst 12 fotek první stránky', 3000);
mockApi.delay = 30;
for (let round = 0; round < 5 && count() < mockApi.photos.length; round++) {
  const before = count();
  await reveal();
  await until(() => count() > before, `po doscrollování k #sentinel má přibýt další stránka, fotek je pořád ${before}`, 2000);
}
assert.equal(count(), 48, `po doscrollování všech stránek má být v galerii 48 fotek, je jich ${count()}`);
await until(() => document.querySelector('#end').hidden === false, 'po poslední stránce má být #end vidět', 1000);
const requests = mockApi.requests.length;
await reveal();
await helpers.wait(400);
assert.equal(mockApi.requests.length, requests, 'po poslední stránce už se nemá posílat žádný další požadavek');
assert.equal(document.querySelector('#retry').hidden, true, 'po poslední stránce se nemá ukázat chyba s tlačítkem #retry');
```

Když server odpoví chybou `500`, ukáže se `#retry`, `#status` chybu popíše a načtené fotky zůstanou.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reveal = async () => {
  document.body.style.paddingBlockEnd = '100vh';
  window.scrollTo(0, 0);
  await helpers.wait(120);
  document.querySelector('#sentinel').scrollIntoView({ block: 'center' });
};
const gallery = document.querySelector('#gallery');
await until(() => gallery.querySelectorAll('img').length === 12, 'po otevření se má do #gallery načíst 12 fotek první stránky', 3000);
mockApi.delay = 60;
mockApi.failures = 1;
await reveal();
await until(() => document.querySelector('#retry').hidden === false, 'po chybě serveru má být vidět tlačítko #retry', 2000);
assert.notEqual(document.querySelector('#status').textContent.trim(), '', 'po chybě má #status říct, že se fotky nepodařilo načíst');
assert.equal(gallery.querySelectorAll('img').length, 12, 'po chybě mají v galerii zůstat fotky první stránky');
assert.notEqual(gallery.getAttribute('aria-busy'), 'true', 'po chybě už #gallery nemá mít aria-busy="true"');
```

Kliknutí na `#retry` načte stejnou stránku znovu a tlačítko schová.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reveal = async () => {
  document.body.style.paddingBlockEnd = '100vh';
  window.scrollTo(0, 0);
  await helpers.wait(120);
  document.querySelector('#sentinel').scrollIntoView({ block: 'center' });
};
const images = () => [...document.querySelectorAll('#gallery li img')];
await until(() => images().length === 12, 'po otevření se má do #gallery načíst 12 fotek první stránky', 3000);
mockApi.delay = 60;
mockApi.failures = 1;
await reveal();
const retry = document.querySelector('#retry');
await until(() => retry.hidden === false, 'po chybě má být vidět tlačítko #retry', 2000);
await helpers.click(retry);
await until(() => images().length === 24, 'po kliknutí na #retry se mají načíst fotky druhé stránky (24 fotek)', 2000);
assert.equal(retry.hidden, true, 'po úspěšném novém pokusu má být #retry schované');
assert.equal(mockApi.requests.filter((request) => request.page === 2).length, 2, 'nový pokus má načíst znovu druhou stránku, ne přeskočit na třetí');
assert.deepEqual(images().slice(12).map((image) => image.alt), mockApi.photos.slice(12, 24).map((photo) => photo.title), 'po novém pokusu mají přibýt fotky druhé stránky');
```

Výpadek sítě (`fetch` se zamítne) se obslouží stejně: ukáže se `#retry` a nový pokus fotky načte.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reveal = async () => {
  document.body.style.paddingBlockEnd = '100vh';
  window.scrollTo(0, 0);
  await helpers.wait(120);
  document.querySelector('#sentinel').scrollIntoView({ block: 'center' });
};
const images = () => document.querySelectorAll('#gallery li img');
await until(() => images().length === 12, 'po otevření se má do #gallery načíst 12 fotek první stránky', 3000);
mockApi.delay = 60;
mockApi.offline = true;
await reveal();
const retry = document.querySelector('#retry');
await until(() => retry.hidden === false, 'po chybě má být vidět tlačítko #retry', 2000);
mockApi.offline = false;
await helpers.click(retry);
await until(() => images().length === 24, 'po kliknutí na #retry se mají načíst fotky druhé stránky (24 fotek)', 2000);
```

# --help--

## --tip-- 5

Posluchač `IntersectionObserver` se zavolá pokaždé, když `#sentinel` vjede na obrazovku, i když ještě běží předchozí načítání. Potřebuješ stav, který si pamatuje, že se právě načítá, a funkce na načtení podle něj skončí dřív, než pošle další požadavek. Vzor „proměnná mimo funkci, která přežije mezi voláními" znáš z [časovače spuštěného podruhé](see:js-async/event-loop#casovac-spusteny-podruhe).

## --tip-- 8

Nový pokus potřebuje vědět, **kterou** stránku zkoušet. Když číslo stránky posouváš až po úspěšném připojení fotek, stačí po kliknutí zavolat stejnou funkci jako při posunu. Rozmysli si, jestli se má po chybě dál načítat při posunu, nebo až po kliknutí.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Krásy Česka · Fotosoutěž</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="hero">
      <p class="hero__label">Fotosoutěž 2026</p>
      <h1 class="hero__title">Krásy Česka</h1>
      <p class="hero__lead">Hory, řeky, města i ranní mlhy očima čtenářů. Posouvej dolů a další fotky se načtou samy.</p>
    </header>
    <main class="page">
      <ul id="gallery" class="gallery" aria-label="Fotky ze soutěže"></ul>
      <div id="sentinel" class="sentinel" aria-hidden="true"></div>
      <div class="feed-state">
        <p id="status" class="status" role="status"></p>
        <button id="retry" class="button" type="button" hidden>Zkusit znovu</button>
        <p id="end" class="end" hidden>To je všechno. Víc fotek v soutěži zatím není.</p>
      </div>
    </main>
    <script src="api.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --night: #14161a;
  --surface: #1e2127;
  --surface-2: #272b33;
  --amber: #f5b84c;
  --text: #f1ede4;
  --muted: #9ba1a8;
  --danger: #ff8a7a;
  --radius: 0.9rem;
  --space-s: 0.5rem;
  --space-m: 1rem;
  --space-l: 2rem;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--night);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}

.hero {
  padding: 3rem var(--space-m) var(--space-l);
  text-align: center;
  background: radial-gradient(circle at 50% -40%, #3a3f4a, var(--night) 70%);
}

.hero__label {
  margin: 0;
  color: var(--amber);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero__title {
  margin: 0.3rem 0;
  font-size: clamp(2rem, 6vw, 3.2rem);
  line-height: 1.1;
}

.hero__lead {
  max-width: 34rem;
  margin: 0 auto;
  color: var(--muted);
}

.page {
  width: min(100% - 2rem, 72rem);
  margin: var(--space-l) auto 4rem;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--space-m);
  margin: 0;
  padding: 0;
  list-style: none;
  transition: opacity 0.2s ease;
}

.gallery[aria-busy="true"] {
  opacity: 0.85;
}

.photo {
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.photo:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgb(0 0 0 / 0.5);
}

.photo img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.photo:hover img {
  transform: scale(1.04);
}

.photo__caption {
  padding: 0.7rem var(--space-m) 0.9rem;
}

.photo__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 650;
}

.photo__author {
  margin: 0.1rem 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.sentinel {
  height: 1px;
}

.feed-state {
  display: grid;
  justify-items: center;
  gap: var(--space-s);
  min-height: 5rem;
  padding-block: var(--space-l);
  text-align: center;
}

.status {
  margin: 0;
  color: var(--muted);
}

.gallery[aria-busy="true"] ~ .feed-state .status::before {
  content: "";
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  margin-inline-end: 0.5em;
  border: 2px solid var(--amber);
  border-inline-end-color: transparent;
  border-radius: 50%;
  vertical-align: -0.1em;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo,
  .photo img,
  .gallery[aria-busy="true"] ~ .feed-state .status::before {
    transition: none;
    animation: none;
  }
}

.button {
  padding: 0.6rem 1.2rem;
  border: 0;
  border-radius: 99rem;
  background: var(--amber);
  color: var(--night);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.button:hover {
  background: #ffcb70;
}

.button:focus-visible {
  outline: 3px solid var(--text);
  outline-offset: 3px;
}

.end {
  margin: 0;
  color: var(--muted);
  font-style: italic;
}
```

## --file-- api.js

```js
// ===== Simulace API fotosoutěže (neměň) =====
// Nahradí fetch pro adresy /api/…: odpovídá se zpožděním skutečnými objekty Response
// se stavem a JSON tělem. Obrázky jsou vygenerované SVG, nic se nestahuje z internetu.
//
//   GET /api/photos?page=1   { page, totalPages, photos: [{ id, title, author, url, width, height }] }
//                            12 fotek na stránku, 4 stránky; neexistující stránka = 404
//                            chyba serveru = 500 { error, page, totalPages, photos: [] }
//
// Testy si simulaci přepínají přes objekt mockApi (zpoždění, výpadky, offline, záznam požadavků).
const mockApi = (() => {
  const titles = [
    'Ranní mlha nad Šumavou', 'Sněžka při západu slunce', 'Pravčická brána v zimě', 'Vltava pod Krumlovem',
    'Lipno za úsvitu', 'Hřebeny Beskyd', 'Propast Macocha', 'Vinice pod Pálavou',
    'Adršpašské skály', 'Karlštejn na podzim', 'Máchovo jezero', 'Jizerská rašeliniště',
    'Inverze pod Lysou horou', 'Hora Říp z polí', 'Třeboňské rybníky', 'Praděd v mlze',
    'Pokličky na Kokořínsku', 'Hrubá Skála', 'Labe u Děčína', 'Boubínský prales',
    'Vysočina po žních', 'Mikulov ze Svatého kopečku', 'Lednice v zimě', 'Radhošť za soumraku',
    'Trosky v Českém ráji', 'Bílé Karpaty v květu', 'Kamenný most v Písku', 'Křivoklátské lesy',
    'Doupovské hory', 'Zámek Hluboká', 'Kokořínský hrad', 'Velký Javor',
    'Slapská přehrada', 'Chráněná krajina Brdy', 'Klínovec v lednu', 'Pálava z vyhlídky',
    'Kozákov ráno', 'Tiské stěny', 'Orlické hory', 'Punkevní jeskyně',
    'Hostýn v listopadu', 'Věž Ještědu', 'Novohradské hory', 'Dyje u Vranova',
    'Bezděz nad krajinou', 'Rožnov pod Radhoštěm', 'Blaník', 'Soutok Labe a Vltavy',
  ];
  const authors = ['Klára Veselá', 'Tomáš Horák', 'Anna Pokorná', 'Jiří Svoboda', 'Petra Marková', 'Lukáš Dvořák', 'Eliška Němcová', 'Martin Kučera'];
  const palettes = [
    ['#f7b267', '#f4845f', '#6d597a', '#355070'],
    ['#a8dadc', '#e0f2e9', '#588157', '#344e41'],
    ['#ffcad4', '#f4acb7', '#9d8189', '#5e4b56'],
    ['#8ecae6', '#e9f5fb', '#219ebc', '#023047'],
    ['#ffd166', '#fcefb4', '#8a9a5b', '#4a5a2f'],
    ['#cdb4db', '#fde2e4', '#7b6d8d', '#3d3551'],
  ];

  function landscape(id) {
    const [skyTop, skyBottom, far, near] = palettes[id % palettes.length];
    const sunX = 60 + ((id * 97) % 280);
    const sunY = 60 + ((id * 31) % 60);
    const wave = (base, amplitude, shift) => Array.from({ length: 9 }, (_, index) => {
      const x = index * 50;
      const y = base - Math.round(Math.abs(Math.sin((index + shift) * 1.3)) * amplitude);
      return `L${x} ${y}`;
    }).join(' ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">`
      + `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBottom}"/></linearGradient></defs>`
      + `<rect width="400" height="300" fill="url(#sky)"/>`
      + `<circle cx="${sunX}" cy="${sunY}" r="26" fill="#fff8e7" opacity="0.9"/>`
      + `<path d="M0 300 ${wave(210, 70, id)} L400 300 Z" fill="${far}"/>`
      + `<path d="M0 300 ${wave(260, 45, id + 3)} L400 300 Z" fill="${near}"/>`
      + `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  const photos = titles.map((title, index) => ({
    id: index + 1,
    title,
    author: authors[(index * 3) % authors.length],
    url: landscape(index + 1),
    width: 1200,
    height: 900,
  }));
  const pageSize = 12;
  const totalPages = Math.ceil(photos.length / pageSize);

  const api = {
    photos, // všechny fotky v pořadí stránek (jen pro testy)
    delay: 400, // zpoždění odpovědi v ms
    failures: 0, // kolik dalších požadavků skončí stavem 500
    offline: false, // true = síť nejde, fetch se zamítne
    requests: [], // { page, status }
    active: 0,
    maxActive: 0,
  };

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

  const realFetch = window.fetch.bind(window);

  window.fetch = function fetch(input, options = {}) {
    const url = new URL(typeof input === 'string' ? input : input.url, 'https://krasy-ceska.example');
    if (!url.pathname.startsWith('/api/')) return realFetch(input, options);
    const record = { page: Number(url.searchParams.get('page')), status: null };
    api.requests.push(record);
    return new Promise((resolve, reject) => {
      if (api.offline) {
        setTimeout(() => reject(new TypeError('Failed to fetch')), 30);
        return;
      }
      api.active++;
      api.maxActive = Math.max(api.maxActive, api.active);
      const failed = api.failures > 0;
      if (failed) api.failures--;
      setTimeout(() => {
        api.active--;
        let response;
        if (url.pathname !== '/api/photos') response = json({ error: 'Neznámá adresa' }, 404);
        else if (failed) response = json({ error: 'Chyba serveru', page: record.page, totalPages, photos: [] }, 500);
        else if (!Number.isInteger(record.page) || record.page < 1 || record.page > totalPages) response = json({ error: 'Stránka neexistuje' }, 404);
        else {
          const start = (record.page - 1) * pageSize;
          response = json({ page: record.page, totalPages, photos: photos.slice(start, start + pageSize) });
        }
        record.status = response.status;
        resolve(response);
      }, api.delay);
    });
  };

  return api;
})();
```

## --file-- app.js

```js
// Galerie fotosoutěže. API je popsané nahoře v api.js, prvky stránky v index.html:
// #gallery (seznam fotek), #sentinel (prázdný prvek pod seznamem),
// #status, #retry a #end (stav načítání pod galerií).
--edit--

--edit--
```

# --solution--

## --file-- app.js

```js
// Galerie fotosoutěže. API je popsané nahoře v api.js, prvky stránky v index.html:
// #gallery (seznam fotek), #sentinel (prázdný prvek pod seznamem),
// #status, #retry a #end (stav načítání pod galerií).

const gallery = document.querySelector('#gallery');
const sentinel = document.querySelector('#sentinel');
const statusText = document.querySelector('#status');
const retryButton = document.querySelector('#retry');
const endNote = document.querySelector('#end');

let nextPage = 1;
let totalPages = Infinity;
let isLoading = false;
let hasError = false;

function createPhotoCard(photo) {
  const item = document.createElement('li');
  item.className = 'photo';

  const image = document.createElement('img');
  image.src = photo.url;
  image.alt = photo.title;
  image.width = photo.width;
  image.height = photo.height;

  const caption = document.createElement('div');
  caption.className = 'photo__caption';
  const title = document.createElement('p');
  title.className = 'photo__title';
  title.textContent = photo.title;
  const author = document.createElement('p');
  author.className = 'photo__author';
  author.textContent = photo.author;
  caption.append(title, author);

  item.append(image, caption);
  return item;
}

async function loadNextPage() {
  // 1. nenačítej souběžně, po chybě a po poslední stránce
  if (isLoading || hasError || nextPage > totalPages) return;
  isLoading = true;
  gallery.setAttribute('aria-busy', 'true');
  statusText.textContent = 'Načítám další fotky…';
  retryButton.hidden = true;

  try {
    const response = await fetch(`/api/photos?page=${nextPage}`);
    if (!response.ok) {
      throw new Error(`server odpověděl ${response.status}`);
    }
    const data = await response.json();

    // 2. připoj fotky a posuň se na další stránku
    gallery.append(...data.photos.map(createPhotoCard));
    totalPages = data.totalPages;
    nextPage += 1;
    statusText.textContent = `Načteno ${gallery.children.length} fotek.`;

    // 3. po poslední stránce už nic nesleduj
    if (nextPage > totalPages) {
      observer.disconnect();
      endNote.hidden = false;
    }
  } catch (error) {
    hasError = true;
    statusText.textContent = `Další fotky se nepodařilo načíst (${error.message}).`;
    retryButton.hidden = false;
  } finally {
    isLoading = false;
    gallery.removeAttribute('aria-busy');
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    loadNextPage();
  }
});
observer.observe(sentinel);

retryButton.addEventListener('click', () => {
  hasError = false;
  loadNextPage();
});

loadNextPage();
```

# --explain--

Vysvětli vlastními slovy, proč nekonečná galerie potřebuje hlídat, že se stránka právě načítá, a proč nestačí, že `IntersectionObserver` hlásí vjezd `#sentinel` na obrazovku.

## --model--

`IntersectionObserver` zavolá callback pokaždé, když `#sentinel` vjede na obrazovku, a o běžícím požadavku nic neví. Když uživatel během načítání posune stránku nahoru a zase dolů, callback přijde znovu dřív, než první odpověď dorazí a číslo stránky se posune. Bez ochrany by se tatáž stránka načetla dvakrát a fotky by se zdvojily. Proto si v proměnné mimo funkci pamatuju, že se načítá, a další požadavek nepošlu, dokud předchozí neskončí.

## --checklist--

- Callback observeru přijde při každém vjezdu `#sentinel` na obrazovku.
- Observer neví, že už běží požadavek.
- Číslo stránky se posune až po odpovědi, takže druhý požadavek by chtěl stejnou stránku.
- Stav „právě načítám" v proměnné mimo funkci zabrání souběžnému načtení.

# --approaches--

## --approach-- Observer a stavové proměnné

Observer sleduje `#sentinel` celou dobu a při každém vjezdu zavolá `loadNextPage`. Ta se podle proměnných `isLoading`, `hasError` a `nextPage` rozhodne, jestli vůbec má co dělat. Tak vypadá většina nekonečných seznamů v produkci a dobře se rozšiřuje o další stavy.

### --file-- app.js

```js
// Galerie fotosoutěže. API je popsané nahoře v api.js, prvky stránky v index.html:
// #gallery (seznam fotek), #sentinel (prázdný prvek pod seznamem),
// #status, #retry a #end (stav načítání pod galerií).

const gallery = document.querySelector('#gallery');
const sentinel = document.querySelector('#sentinel');
const statusText = document.querySelector('#status');
const retryButton = document.querySelector('#retry');
const endNote = document.querySelector('#end');

let nextPage = 1;
let totalPages = Infinity;
let isLoading = false;
let hasError = false;

function createPhotoCard(photo) {
  const item = document.createElement('li');
  item.className = 'photo';

  const image = document.createElement('img');
  image.src = photo.url;
  image.alt = photo.title;
  image.width = photo.width;
  image.height = photo.height;

  const caption = document.createElement('div');
  caption.className = 'photo__caption';
  const title = document.createElement('p');
  title.className = 'photo__title';
  title.textContent = photo.title;
  const author = document.createElement('p');
  author.className = 'photo__author';
  author.textContent = photo.author;
  caption.append(title, author);

  item.append(image, caption);
  return item;
}

async function loadNextPage() {
  // 1. nenačítej souběžně, po chybě a po poslední stránce
  if (isLoading || hasError || nextPage > totalPages) return;
  isLoading = true;
  gallery.setAttribute('aria-busy', 'true');
  statusText.textContent = 'Načítám další fotky…';
  retryButton.hidden = true;

  try {
    const response = await fetch(`/api/photos?page=${nextPage}`);
    if (!response.ok) {
      throw new Error(`server odpověděl ${response.status}`);
    }
    const data = await response.json();

    // 2. připoj fotky a posuň se na další stránku
    gallery.append(...data.photos.map(createPhotoCard));
    totalPages = data.totalPages;
    nextPage += 1;
    statusText.textContent = `Načteno ${gallery.children.length} fotek.`;

    // 3. po poslední stránce už nic nesleduj
    if (nextPage > totalPages) {
      observer.disconnect();
      endNote.hidden = false;
    }
  } catch (error) {
    hasError = true;
    statusText.textContent = `Další fotky se nepodařilo načíst (${error.message}).`;
    retryButton.hidden = false;
  } finally {
    isLoading = false;
    gallery.removeAttribute('aria-busy');
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    loadNextPage();
  }
});
observer.observe(sentinel);

retryButton.addEventListener('click', () => {
  hasError = false;
  loadNextPage();
});

loadNextPage();
```

## --approach-- Jedna smyčka s await

Místo stavových proměnných čeká jediná `async` funkce: nejdřív, až bude `#sentinel` vidět (observer obalený do Promise), pak na stránku, a po chybě na kliknutí na **Zkusit znovu** (posluchač obalený do Promise). Souběžné načtení tu nemůže nastat, protože smyčka další požadavek pošle až po skončení předchozího. Kratší a čte se shora dolů, ale hůř se do ní přidávají věci, které se dějí mimo pořadí, třeba filtr.

### --file-- app.js

```js
// Galerie fotosoutěže. API je popsané nahoře v api.js, prvky stránky v index.html:
// #gallery (seznam fotek), #sentinel (prázdný prvek pod seznamem),
// #status, #retry a #end (stav načítání pod galerií).

const gallery = document.querySelector('#gallery');
const sentinel = document.querySelector('#sentinel');
const statusText = document.querySelector('#status');
const retryButton = document.querySelector('#retry');
const endNote = document.querySelector('#end');

// Splní se, jakmile je #sentinel vidět (hned, když už vidět je).
function sentinelVisible() {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(sentinel);
  });
}

// Splní se po kliknutí na tlačítko.
function clicked(button) {
  return new Promise((resolve) => {
    button.addEventListener('click', resolve, { once: true });
  });
}

async function fetchPage(page) {
  const response = await fetch(`/api/photos?page=${page}`);
  if (!response.ok) {
    throw new Error(`server odpověděl ${response.status}`);
  }
  return response.json();
}

function renderPhotos(photos) {
  gallery.append(...photos.map((photo) => {
    const item = document.createElement('li');
    item.className = 'photo';
    item.innerHTML = '<img alt=""><div class="photo__caption"><p class="photo__title"></p><p class="photo__author"></p></div>';
    item.querySelector('img').src = photo.url;
    item.querySelector('img').alt = photo.title;
    item.querySelector('.photo__title').textContent = photo.title;
    item.querySelector('.photo__author').textContent = photo.author;
    return item;
  }));
}

// Jedna smyčka: počkej na konec seznamu, načti stránku, po chybě počkej na nový pokus.
async function runGallery() {
  let page = 1;
  let totalPages = 1;
  do {
    if (page > 1) await sentinelVisible();
    let data = null;
    while (!data) {
      gallery.setAttribute('aria-busy', 'true');
      statusText.textContent = 'Načítám další fotky…';
      retryButton.hidden = true;
      try {
        data = await fetchPage(page);
      } catch (error) {
        statusText.textContent = `Další fotky se nepodařilo načíst (${error.message}).`;
        retryButton.hidden = false;
        gallery.removeAttribute('aria-busy');
        await clicked(retryButton);
      }
    }
    gallery.removeAttribute('aria-busy');
    renderPhotos(data.photos);
    statusText.textContent = `Načteno ${gallery.children.length} fotek.`;
    totalPages = data.totalPages;
    page += 1;
  } while (page <= totalPages);
  endNote.hidden = false;
}

runGallery();
```

# --review--

Testy kontrolují chování. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Texty z API vkládáš do stránky jako text, ne jako HTML.
- Stav „načítám", chyba a konec jsou poznat i bez barev a čtečka obrazovky je přečte díky `role="status"`.
- Stejný kód na vytvoření karty fotky se neopakuje na dvou místech.
- Víš, proč se po poslední stránce přestane `#sentinel` sledovat.

## --extensions--

Rozšíření bez testů: kostry karet s pulzujícím pozadím místo textu „Načítám", tlačítko **Načíst další** pro uživatele, kterým nekonečný seznam nevyhovuje, nebo detail fotky v prvku `dialog` po kliknutí.
