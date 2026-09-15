---
title: Filmová databáze
timeoutMs: 8000
---

# --description--

## Zadání

Filmový klub chce na web katalog filmů, ve kterém si členové najdou, na co se podívat, a uloží si oblíbené. Data dodává API filmové databáze. Než klub dostane přístup ke skutečnému API, pracuješ proti jeho simulaci v `api.js`: odpovídá se zpožděním, vrací skutečné objekty `Response`, umí zrušení přes `signal` a na povel selže.

Klub chce, aby se aplikace chovala jako dobrý web: odkaz na hledání nebo na film jde poslat kamarádovi, tlačítko Zpět v prohlížeči funguje, při pomalé síti uživatel vidí, že se načítá, a rychlé klikání nikdy neukáže starší výsledky.

Tohle je samostatný projekt bez kroků. Stojí na všem z téhle sekce: [stavy načítání a chyby](see:js-async/fetch#stavy-nacitani-chyba-a-prazdno), [souběh odpovědí](see:js-async/fetch#soubeh-odpovedi-starsi-nesmi-prepsat-novejsi) a [zrušení](see:js-async/async-await#zruseni-abortcontroller-a-signal), a na [stavu v adrese a v `localStorage`](see:js-dom/prohlizecova-api#stav-v-adrese-url-a-urlsearchparams) ze sekce o DOM. Nejbližší vzor je [aplikace na počasí](see:js-async/workshop-pocasi/001).

## Jak začít

1. Klikni na **Začít projekt** a otevři složku projektu ve VS Code.
2. Otevři `index.html` v prohlížeči. Jak na to pohodlně, píše `README.md`.
3. Piš do `app.js`. HTML i vzhled jsou hotové, `api.js` neměň.
4. Když máš hotový příběh, klikni na **Zkontrolovat**.

Popis API a tvar adresy stránky najdeš v `README.md`.

## Uživatelské příběhy

- Když uživatel otevře stránku, uvidí v `#results` první stránku nejlépe hodnocených filmů. Každý film je položka `li` s plakátem, názvem a rokem a s odkazem, který otevře jeho detail. `#page-info` říká, na které stránce z kolika je.
- Dokud se data načítají, má `#results` atribut `aria-busy="true"` a `#status` říká, že se načítá.
- Když uživatel odešle formulář hledání, uvidí výsledky pro zadaný text od první stránky. Stránka se znovu nenačte a v adrese je `hledat=` s textem a `strana=1`.
- Když hledání nic nenajde, ukáže se `#empty` a obě tlačítka stránkování jsou neaktivní.
- Tlačítka `#next` a `#prev` přejdou na další a předchozí stránku a změní `strana=` v adrese. Na první stránce je `#prev` neaktivní, na poslední `#next`.
- Když se změní adresa (tlačítko Zpět, ruční úprava, odkaz), aplikace ukáže to, co adresa říká, a pole hledání ukazuje hledaný text.
- Když uživatel klikne na film, schová se `#list-view`, ukáže se `#detail-view` s názvem, rokem, žánry, režisérem a popisem a do adresy přibude `film=` s číslem filmu.
- Tlačítko `#back` vrátí seznam se stejným hledáním a stejnou stránkou, ze které uživatel přišel.
- Tlačítko `#favorite-toggle` v detailu film přidá do oblíbených, nebo ho z nich odebere, a atributem `aria-pressed` ukazuje, jestli film v oblíbených je. Oblíbené jsou vidět v `#favorites` jako odkazy na detail; když žádné nejsou, je vidět `#favorites-empty`.
- Oblíbené přežijí obnovení stránky.
- Když uživatel rychle přepíná stránky nebo filmy, na obrazovce skončí vždy to, co vybral naposledy. Detail, který se načítal ve chvíli, kdy se uživatel vrátil na seznam, se už neukáže.
- Když načtení selže (chyba serveru, výpadek sítě, neexistující film), ukáže se `#error` s popisem a tlačítko `#retry` zkusí načíst totéž znovu.

## Technické požadavky

- Stav v adrese drž v části za `#` ve tvaru z `README.md` (`hledat`, `strana`, `film`) a čti ho přes `URLSearchParams`. Kontrola pracuje v náhledu, kde `history.pushState` nejde použít; změna `location.hash` a událost `hashchange` fungují.
- Oblíbené ukládej do `localStorage` pod klíčem `filmoteka:oblibene` jako JSON pole objektů s aspoň `id` a `title`.
- Náhled v Akademii i kontrola spouštějí stránku v izolovaném rámu. Klik na odkaz `href="#…"` by tam stránku opustil, proto odkazy uvnitř aplikace obsluž posluchačem: zruš výchozí akci a adresu nastav přes `location.hash` sám. V běžném prohlížeči to nevadí a odkaz jde dál otevřít v nové kartě.
- `app.js` se spouští na konci stránky. Nečekej v něm na `DOMContentLoaded`: kontrola „obnovení stránky" soubor spustí znovu a tahle událost už nepřijde.
- Texty z API vkládej do stránky jako text.

> [!TIP]
> Nejvíc práce ušetří jedna funkce, která přečte adresu a podle ní ukáže seznam, nebo detail. Tlačítka pak jen mění adresu a o zbytek se postará posluchač `hashchange`.

# --hints--

Po otevření stránky je v `#results` prvních 8 nejlépe hodnocených filmů s názvem, rokem a odkazem a `#page-info` ukazuje stránku 1 ze 4.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const items = () => [...document.querySelectorAll('#results > li')];
await until(() => items().length === 8, 'po otevření má být v #results 8 filmů (li)', 3000);
mockApi.listMovies('', 1).results.forEach((movie, index) => {
  const item = items()[index];
  assert.ok(item.textContent.includes(movie.title), `${index + 1}. film má být „${movie.title}"`);
  assert.ok(item.textContent.includes(String(movie.year)), `u filmu „${movie.title}" má být rok ${movie.year}`);
  assert.ok(item.querySelector('a[href], button'), `film „${movie.title}" má mít odkaz nebo tlačítko na detail`);
});
const info = document.querySelector('#page-info').textContent;
assert.match(info, /\b1\b/, `#page-info má ukazovat stránku 1, ukazuje „${info}"`);
assert.match(info, /\b4\b/, `#page-info má ukazovat celkový počet stránek 4, ukazuje „${info}"`);
assert.equal(document.querySelector('#prev').disabled, true, 'na první stránce má být #prev neaktivní');
```

Během načítání má `#results` atribut `aria-busy="true"` a `#status` není prázdný; po načtení atribut zmizí.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const results = document.querySelector('#results');
await until(() => results.querySelectorAll('li').length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 500;
location.hash = 'strana=2';
await until(() => results.getAttribute('aria-busy') === 'true', 'během načítání druhé stránky má mít #results aria-busy="true"', 1000);
assert.notEqual(document.querySelector('#status').textContent.trim(), '', 'během načítání má #status říct, že se načítá');
await until(() => results.getAttribute('aria-busy') !== 'true', 'po načtení má aria-busy z #results zmizet', 3000);
```

Odeslání hledání ze druhé stránky ukáže výsledky od první stránky a adresa obsahuje `hledat` a `strana=1`.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
const titles = () => [...document.querySelectorAll('#results > li')].map((item) => item.textContent);
await until(() => titles().length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 40;
location.hash = 'strana=2';
const second = mockApi.listMovies('', 2).results.map((movie) => movie.title);
await until(() => second.every((title, index) => titles()[index]?.includes(title)), 'po #strana=2 má být v #results druhá stránka', 2000);
document.querySelector('#search').value = 'po';
await helpers.submit(document.querySelector('#search-form'));
const expected = mockApi.listMovies('po', 1).results.map((movie) => movie.title);
await until(() => titles().length === expected.length && expected.every((title, index) => titles()[index].includes(title)), `po hledání „po" mají být v #results filmy: ${expected.join(', ')}`, 2000);
const params = new URLSearchParams(location.hash.slice(1));
assert.equal(params.get('hledat'), 'po', `adresa má obsahovat hledat=po, je „${location.hash}"`);
assert.equal(params.get('strana'), '1', `adresa má obsahovat strana=1, je „${location.hash}"`);
```

Hledání bez výsledků ukáže `#empty` a obě tlačítka stránkování jsou neaktivní.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
await until(() => document.querySelectorAll('#results > li').length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 40;
document.querySelector('#search').value = 'xyzzy';
await helpers.submit(document.querySelector('#search-form'));
await until(() => document.querySelector('#empty').hidden === false, 'když hledání nic nenajde, má být vidět #empty', 2000);
assert.equal(document.querySelectorAll('#results > li').length, 0, 'když hledání nic nenajde, má být #results prázdný');
assert.equal(document.querySelector('#prev').disabled, true, 'bez výsledků má být #prev neaktivní');
assert.equal(document.querySelector('#next').disabled, true, 'bez výsledků má být #next neaktivní');
```

`#next` a `#prev` přepínají stránky a mění `strana` v adrese; na poslední stránce je `#next` neaktivní.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const titles = () => [...document.querySelectorAll('#results > li')].map((item) => item.textContent);
const showsPage = (page) => {
  const expected = mockApi.listMovies('', page).results.map((movie) => movie.title);
  return titles().length === expected.length && expected.every((title, index) => titles()[index].includes(title));
};
await until(() => showsPage(1), 'po otevření má být v #results první stránka filmů', 3000);
mockApi.delay = 40;
await helpers.click(document.querySelector('#next'));
await until(() => showsPage(2), 'po kliknutí na #next má být v #results druhá stránka filmů', 2000);
assert.equal(new URLSearchParams(location.hash.slice(1)).get('strana'), '2', `po #next má adresa obsahovat strana=2, je „${location.hash}"`);
assert.equal(document.querySelector('#prev').disabled, false, 'na druhé stránce má být #prev aktivní');
await helpers.click(document.querySelector('#prev'));
await until(() => showsPage(1), 'po kliknutí na #prev má být v #results zase první stránka', 2000);
location.hash = 'strana=4';
await until(() => showsPage(4), 'po změně adresy na strana=4 má být v #results poslední stránka', 2000);
assert.equal(document.querySelector('#next').disabled, true, 'na poslední stránce má být #next neaktivní');
```

Změna adresy ukáže, co adresa říká, a pole hledání ukazuje hledaný text.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const titles = () => [...document.querySelectorAll('#results > li')].map((item) => item.textContent);
await until(() => titles().length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 40;
location.hash = 'strana=3';
const third = mockApi.listMovies('', 3).results.map((movie) => movie.title);
await until(() => third.every((title, index) => titles()[index]?.includes(title)), 'po změně adresy na #strana=3 má být v #results třetí stránka', 2000);
location.hash = 'hledat=vet&strana=1';
const found = mockApi.listMovies('vet', 1).results.map((movie) => movie.title);
await until(() => titles().length === found.length && found.every((title, index) => titles()[index].includes(title)), `po změně adresy na #hledat=vet&strana=1 mají být v #results filmy: ${found.join(', ')}`, 2000);
assert.equal(document.querySelector('#search').value, 'vet', 'pole #search má ukazovat hledaný text z adresy');
```

Kliknutí na film ukáže jeho detail a přidá `film` do adresy.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelectorAll('#results > li').length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 40;
const movie = mockApi.movies.find((item) => item.id === mockApi.listMovies('', 1).results[1].id);
const target = document.querySelectorAll('#results > li')[1].querySelector('a[href], button');
await helpers.click(target);
await until(() => document.querySelector('#detail-view').hidden === false, 'po kliknutí na film má být vidět #detail-view', 2000);
assert.equal(document.querySelector('#list-view').hidden, true, 'v detailu má být #list-view schovaný');
assert.ok(document.querySelector('#detail-view').textContent.includes(movie.title), `detail má ukazovat název „${movie.title}"`);
for (const part of [String(movie.year), movie.director, movie.overview, movie.genres[0]]) {
  assert.ok(document.querySelector('#detail-view').textContent.includes(part), `detail filmu „${movie.title}" má obsahovat „${part}"`);
}
assert.equal(new URLSearchParams(location.hash.slice(1)).get('film'), String(movie.id), `adresa má obsahovat film=${movie.id}, je „${location.hash}"`);
```

Tlačítko `#back` vrátí seznam se stejným hledáním a stránkou.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const titles = () => [...document.querySelectorAll('#results > li')].map((item) => item.textContent);
await until(() => titles().length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 40;
location.hash = 'strana=2';
const second = mockApi.listMovies('', 2).results.map((movie) => movie.title);
await until(() => second.every((title, index) => titles()[index]?.includes(title)), 'po #strana=2 má být v #results druhá stránka', 2000);
await helpers.click(document.querySelector('#results > li').querySelector('a[href], button'));
await until(() => document.querySelector('#detail-view').hidden === false, 'po kliknutí na film má být vidět #detail-view', 2000);
await helpers.click(document.querySelector('#back'));
await until(() => document.querySelector('#list-view').hidden === false && second.every((title, index) => titles()[index]?.includes(title)), 'po #back má být vidět seznam s druhou stránkou, ze které uživatel přišel', 2000);
const params = new URLSearchParams(location.hash.slice(1));
assert.equal(params.has('film'), false, `po #back už adresa nemá obsahovat film, je „${location.hash}"`);
assert.equal(params.get('strana'), '2', `po #back má adresa obsahovat strana=2, je „${location.hash}"`);
assert.equal(document.querySelector('#detail-view').hidden, true, 'po #back má být #detail-view schovaný');
```

`#favorite-toggle` přidá film do `#favorites` a zase ho odebere; `aria-pressed` ukazuje stav.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
mockApi.delay = 40;
location.hash = 'strana=1&film=19';
await until(() => document.querySelector('#detail-view').hidden === false && document.querySelector('#detail-view').textContent.includes('Cesta do fantazie'), 'po #strana=1&film=19 má být vidět detail filmu Cesta do fantazie', 3000);
const toggle = document.querySelector('#favorite-toggle');
const favorites = document.querySelector('#favorites');
assert.equal(document.querySelector('#favorites-empty').hidden, false, 'bez oblíbených má být vidět #favorites-empty');
assert.equal(toggle.getAttribute('aria-pressed'), 'false', 'film, který není v oblíbených, má mít aria-pressed="false"');
await helpers.click(toggle);
assert.equal(toggle.getAttribute('aria-pressed'), 'true', 'po přidání má mít #favorite-toggle aria-pressed="true"');
assert.equal(favorites.querySelectorAll('li').length, 1, 'po přidání má být v #favorites jedna položka');
assert.ok(favorites.textContent.includes('Cesta do fantazie'), '#favorites má obsahovat Cestu do fantazie');
assert.ok(favorites.querySelector('a[href]'), 'oblíbený film má být odkaz na detail');
assert.equal(document.querySelector('#favorites-empty').hidden, true, 's oblíbeným filmem má být #favorites-empty schovaný');
location.hash = 'strana=1&film=2';
await until(() => document.querySelector('#detail-view').textContent.includes('Kolja') && toggle.getAttribute('aria-pressed') === 'false', 'detail Kolji (není v oblíbených) má mít aria-pressed="false"', 2000);
location.hash = 'strana=1&film=19';
await until(() => document.querySelector('#detail-view').textContent.includes('Cesta do fantazie') && toggle.getAttribute('aria-pressed') === 'true', 'po návratu na oblíbený film má mít #favorite-toggle aria-pressed="true"', 2000);
await helpers.click(toggle);
assert.equal(favorites.querySelectorAll('li').length, 0, 'po odebrání má být #favorites prázdný');
assert.equal(toggle.getAttribute('aria-pressed'), 'false', 'po odebrání má mít #favorite-toggle aria-pressed="false"');
```

Oblíbené se ukládají do `localStorage` pod klíčem `filmoteka:oblibene` a po obnovení stránky se ukážou.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
mockApi.delay = 40;
location.hash = 'strana=1&film=21';
await until(() => document.querySelector('#detail-view').hidden === false && document.querySelector('#detail-view').textContent.includes('Duna'), 'po #strana=1&film=21 má být vidět detail filmu Duna', 3000);
await helpers.click(document.querySelector('#favorite-toggle'));
let stored;
try {
  stored = JSON.parse(localStorage.getItem('filmoteka:oblibene'));
} catch {
  assert.fail('v localStorage pod klíčem filmoteka:oblibene má být platný JSON');
}
assert.ok(Array.isArray(stored) && stored.some((movie) => movie.id === 21), `po přidání Duny má localStorage['filmoteka:oblibene'] obsahovat objekt s id 21, obsahuje ${JSON.stringify(stored)}`);
localStorage.setItem('filmoteka:oblibene', JSON.stringify([{ id: 2, title: 'Kolja', year: 1996 }]));
document.querySelector('#favorites').replaceChildren();
await helpers.importFile('app.js');
await until(() => document.querySelector('#favorites').textContent.includes('Kolja'), 'po obnovení stránky se mají oblíbené načíst z localStorage a ukázat v #favorites', 2000);
```

Když uživatel rychle přepne stránky, na obrazovce skončí poslední vybraná, i když starší odpověď dorazí později.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const titles = () => [...document.querySelectorAll('#results > li')].map((item) => item.textContent);
await until(() => titles().length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = ({ params }) => (params.page === '2' ? 600 : 40);
location.hash = 'strana=2';
await helpers.wait(80);
location.hash = 'strana=3';
await helpers.wait(900);
const third = mockApi.listMovies('', 3).results.map((movie) => movie.title);
assert.ok(third.every((title, index) => titles()[index]?.includes(title)), 'pomalá odpověď na stranu 2 nesmí přepsat stranu 3, kterou uživatel vybral později');
assert.match(document.querySelector('#page-info').textContent, /\b3\b/, '#page-info má ukazovat stránku 3');
```

Detail, který se ještě načítal, když se uživatel vrátil na seznam, se už neukáže.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelectorAll('#results > li').length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = ({ path }) => (path.startsWith('/api/movies/') ? 600 : 40);
location.hash = 'strana=1&film=5';
await helpers.wait(80);
location.hash = 'strana=1';
await helpers.wait(900);
assert.equal(document.querySelector('#detail-view').hidden, true, 'detail, který dorazil až po návratu na seznam, se nemá ukázat');
assert.equal(document.querySelector('#list-view').hidden, false, 'po návratu na seznam má zůstat vidět #list-view');
```

Když server odpoví chybou, ukáže se `#error` a `#retry` načte totéž znovu.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const titles = () => [...document.querySelectorAll('#results > li')].map((item) => item.textContent);
await until(() => titles().length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 40;
mockApi.failures = 1;
location.hash = 'strana=2';
const error = document.querySelector('#error');
await until(() => error.hidden === false, 'po odpovědi 500 má být vidět #error', 2000);
assert.notEqual(error.textContent.trim(), '', '#error má chybu popsat textem');
await helpers.click(document.querySelector('#retry'));
const second = mockApi.listMovies('', 2).results.map((movie) => movie.title);
await until(() => error.hidden === true && second.every((title, index) => titles()[index]?.includes(title)), 'po #retry se má načíst druhá stránka a #error zmizet', 2000);
```

Neexistující film ani výpadek sítě aplikaci neshodí: ukáže se `#error`.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelectorAll('#results > li').length === 8, 'po otevření má být v #results 8 filmů', 3000);
mockApi.delay = 40;
location.hash = 'strana=1&film=999';
await until(() => document.querySelector('#error').hidden === false, 'u neexistujícího filmu (404) má být vidět #error', 2000);
location.hash = 'strana=1';
await until(() => document.querySelector('#error').hidden === true && document.querySelectorAll('#results > li').length === 8, 'po návratu na seznam má #error zmizet a seznam se ukázat', 2000);
mockApi.offline = true;
location.hash = 'strana=2';
await until(() => document.querySelector('#error').hidden === false, 'při výpadku sítě má být vidět #error', 2000);
```

Odeslání formuláře hledání stránku znovu nenačte.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelectorAll('#results > li').length === 8, 'po otevření má být v #results 8 filmů', 3000);
let prevented = null;
document.addEventListener('submit', (event) => {
  prevented = event.defaultPrevented;
  event.preventDefault();
});
document.querySelector('#search').value = 'duna';
await helpers.submit(document.querySelector('#search-form'));
assert.equal(prevented, true, 'odeslání #search-form má zrušit výchozí akci (znovunačtení stránky)');
```

# --help--

## --tip-- 6

Když stav žije v adrese, stačí jediná funkce, která adresu přečte (`new URLSearchParams(location.hash.slice(1))`) a podle ní načte seznam, nebo detail. Zavolej ji po startu a v posluchači `hashchange`. Pozor: přiřazení stejné adresy, jaká už je, `hashchange` nevyvolá.

## --tip-- 7

Když kontrola detailu skončí hláškou „Test nedoběhl včas", nejspíš klik na odkaz `#…` odvedl rám náhledu pryč z aplikace. Podívej se do technických požadavků: odkazy obsluž jedním posluchačem na `document`, který najde odkaz přes `closest('a[href^="#"]')`, zruší výchozí akci a nastaví `location.hash`. Stejně fungují routery ve frameworcích.

## --tip-- 10

Uložení je jednoduché, zapomíná se na načtení: oblíbené přečti z `localStorage` hned při startu skriptu a vykresli je, ještě než se cokoli načte ze sítě. Hodnota je text, takže potřebuje `JSON.parse`, a když v úložišti nic není nebo je rozbité, začni s prázdným polem. Vzor je v lekci [Stav a API prohlížeče](see:js-dom/prohlizecova-api#jen-retezce-json-stringify-a-json-parse).

## --tip-- 11

Stejná chyba jako u našeptávače v [aplikaci na počasí](see:js-async/workshop-pocasi/011): každé nové zobrazení má zrušit načítání, které spustilo to předchozí. Jeden `AbortController` v proměnné mimo funkci stačí na seznam i detail, a zrušení v `catch` tiše ukonči.

## --tip-- 12

Pozdě dorazivší detail je tentýž souběh: kdyby návrat na seznam načítání detailu nezrušil, jeho odpověď by po příchodu ukázala `#detail-view`. Když zrušení nejde použít, porovnej po `await`, jestli adresa pořád ukazuje na stejný film.

# --review--

Testy kontrolují chování. Tohle zkontroluj sám, než projekt uzavřeš.

## --rubric--

- Adresa je jediný zdroj pravdy o tom, co je vidět; tlačítka jen mění adresu.
- Síť, vykreslení seznamu, vykreslení detailu a oblíbené jsou oddělené funkce s jasnými jmény.
- Žádný text z API se nevkládá přes `innerHTML`.
- Zrušení požadavku se nikde neukáže jako chyba a žádná chyba se neztratí v konzoli.
- Aplikace jde ovládat klávesnicí: odkazy na filmy, tlačítka a pole mají viditelný fokus a po otevření detailu se fokus přesune na jeho nadpis.
- `README.md` popisuje, jak aplikaci spustit, a jedno rozhodnutí, které jsi udělal (třeba proč adresa, a ne proměnná).
- Víš, co bys příště udělal jinak.

## --extensions--

**Rozšíření bez testů:** hledání při psaní s `debounce`, řazení výsledků podle roku, skeleton karet místo průhledného seznamu, ukládání posledních hledání.

**Rozšíření do portfolia:** Nahraď simulaci skutečným veřejným API. Nejznámější je [TMDB](https://developer.themoviedb.org/docs/getting-started) (The Movie Database), které po registraci vydá vlastní klíč a vrací data i plakáty podobného tvaru. Klíč nepatří do veřejného repozitáře: dokud nemáš vlastní backend, použij jen klíč určený pro čtení a v README napiš, proč. Aplikaci nasaď na GitHub Pages nebo Netlify, přidej odkaz do README a do README i snímek obrazovky. K backendu, který klíč schová, se dostaneš v sekci o Node.js.
