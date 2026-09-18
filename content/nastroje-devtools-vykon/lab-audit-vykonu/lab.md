---
title: "Audit výkonu"
runtime: dom
see: core-web-vitals#core-web-vitals
---
</--solution-->
<--description-->
Klient přišel s hotovým e-shopem, který ale běží zoufale pomalu. Audit v Lighthouse svítí červeně na všech frontách.

Tvým úkolem je opravit **osm různých problémů s výkonem**. Kodér, který to dělal před tebou, zjevně neměl tušení o Core Web Vitals ani DevTools.
</--description-->
<--hints-->
1. Přepiš všechny 3 obyčejné `<script src="...">` tak, aby neblokovaly parsování HTML.
2. Nahoře na stránce je logo a hero banner (třída `.hero`). Přidej k nim signál pro maximální prioritu stažení.
3. Obrázky v sekci `.products` nastav tak, aby se načítaly až ve chvíli, kdy jsou vidět (líné načítání).
4. Žádný obrázek na celém e-shopu momentálně nemá rozměry. Doplň je do HTML (pro logo 200x50, hero banner 1200x400, produkty 300x300), abys zamezil poskakování (CLS).
5. V souboru `search.js` se vyhledává produkt. Obal volání vyhledávání funkcí `debounce` tak, aby se API nevolalo při každém stisku klávesy, ale až když uživatel 300 ms nepíše.
6. V souboru `search.js` uniká paměť. Posluchač `scroll` na elementu `.list` se přidává stále dokola, ale původní uzly po smazání zůstávají v paměti. Oprav to.
7. Font `Lato` se stahuje pozdě. Přidej do `<head>` značku `<link rel="preload">`, abys ho přednačetl.
8. V `heavy.js` je kód, který počítá průměrnou cenu na tisících produktech. Kvůli tomu je to dlouhá úloha (Long task). Najdi způsob (např. vnitřním setTimeout/yieldem), jak ji rozbít na více menších. (Pozn: V labu ověřujeme, že funkce vrací Promise a uvolní vlákno).
```js
const scripts = document.querySelectorAll('script');
assert.equal(Array.from(scripts).every(s => s.hasAttribute('defer') || s.hasAttribute('async')), true, 'Všechny skripty mají mít defer nebo async');

const hero = document.querySelector('.hero');
assert.equal(hero.getAttribute('fetchpriority'), 'high', 'Hero obrázek musí mít fetchpriority high');

const prodImages = document.querySelectorAll('.products img');
assert.equal(Array.from(prodImages).every(i => i.getAttribute('loading') === 'lazy'), true, 'Fotky produktů se mají načítat lazy');

const allImg = document.querySelectorAll('img');
assert.equal(Array.from(allImg).every(i => i.hasAttribute('width') && i.hasAttribute('height')), true, 'Všechny obrázky mají mít width a height');

// test pro JS zjednodušený pro ukázku
```
</--hints-->
<--approaches-->
## --approach--
Při rozbíjení dlouhé úlohy na menší můžeš použít novinku `scheduler.yield()`, ale zatím funguje jen v některých prohlížečích. Standardní funkční způsob je obalit každý krok cyklu do `await new Promise(r => setTimeout(r, 0))`.
</--approaches-->
<--seed-->
## --file-- index.html
```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>E-shop</title>
  <script src="search.js"></script>
  <script src="heavy.js"></script>
</head>
<body>
  <header>
    <img src="logo.webp" alt="Logo">
  </header>
  <main>
    <img src="hero.webp" class="hero" alt="Akce">
    <div class="products">
      <img src="prod1.webp" alt="Produkt 1">
      <img src="prod2.webp" alt="Produkt 2">
    </div>
  </main>
</body>
</html>
```
## --file-- search.js
```js
let timeout;
function debounceSearch(fn) {
  // Doplň debounce 300ms
}
```
## --file-- heavy.js
```js
function processHeavyTask() {
  // Zde se provádí zdlouhavý cyklus, který sekne celou stránku
}
```
</--seed-->
<--solution-->
## --file-- index.html
```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>E-shop</title>
  <link rel="preload" href="Lato.woff2" as="font" type="font/woff2" crossorigin>
  <script src="search.js" defer></script>
  <script src="heavy.js" defer></script>
</head>
<body>
  <header>
    <img src="logo.webp" width="200" height="50" alt="Logo">
  </header>
  <main>
    <img src="hero.webp" width="1200" height="400" class="hero" fetchpriority="high" alt="Akce">
    <div class="products">
      <img src="prod1.webp" width="300" height="300" loading="lazy" alt="Produkt 1">
      <img src="prod2.webp" width="300" height="300" loading="lazy" alt="Produkt 2">
    </div>
  </main>
</body>
</html>
```
## --file-- search.js
```js
let timeout;
function debounceSearch(fn) {
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, 300);
  };
}
```
## --file-- heavy.js
```js
async function processHeavyTask() {
  for (let i = 0; i < 1000; i++) {
    // zpracování malé části...
    if (i % 50 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }
}
```
</--solution-->
