---
title: "Kontrolní bod: katalog knihovny"
timeoutMs: 8000
---

# --description--

Knihovna Na Náměstí chce na web přehled nových přírůstků, ve kterém si čtenáři najdou, co si půjčí. Data dodává API starého knihovního systému a běží přímo v náhledu: `api.js` nahrazuje `fetch` pro adresy `/api/…`, odpovídá se zpožděním a umí selhat. Popis API je nahoře v `api.js`.

Tohle je kontrolní bod celé části o JavaScriptu: žádné tipy, žádné odkazy na lekce. Používej, co umíš. HTML a vzhled jsou hotové, `app.js` píšeš celý sám.

## Co chce knihovna

- Po otevření stránky se katalog načte z `GET /api/books`. Během načítání má `#books` atribut `aria-busy="true"` a `#status` říká, že se načítá.
- Starý systém posílá i vadné záznamy. Do katalogu patří jen platné; vadné se vynechají a `#invalid` je vyjmenuje podle `id`. Když vadný není žádný, `#invalid` je skrytý.
- Každá platná kniha je v `#books` jako položka `li` s atributem `data-id` a ukazuje název, autora, rok vydání, žánr, jestli je k vypůjčení, a datum přidání česky, třeba `14. 8. 2026`.
- Texty z dat se ve stránce ukážou přesně tak, jak přišly, i když obsahují znaky `<` a `>`.
- Výchozí řazení je podle názvu podle české abecedy (Č za C, Ch za H). Po změně `#sort` na **Nejnovější přírůstky** se katalog hned přeřadí od nejnovějšího data přidání; knihy přidané ve stejný den jsou mezi sebou podle názvu.
- Formulář `#filters` po odeslání (tlačítko nebo Enter) zobrazí jen knihy, které vyhovují všem vyplněným polím: text z `q` je v názvu nebo jménu autora (na velikosti písmen nezáleží), žánr odpovídá `genre` (prázdná volba = všechny) a se zaškrtnutým `available` jen knihy k vypůjčení. Stránka se přitom znovu nenačte a zvolené řazení platí dál.
- `#count` říká, kolik knih je zobrazeno a kolik platných knih je v katalogu celkem.
- Když filtru nevyhoví žádná kniha, ukáže se `#empty`.
- Když se katalog nepodaří načíst (chybová odpověď serveru nebo výpadek sítě), `#error` to oznámí a v `#books` nezůstane nic. Tlačítko **Načíst znovu** (`#reload`) katalog stáhne znovu, kdykoli na něj uživatel klikne; knihy se nezdvojí a vyplněný filtr platí dál.

## Platný záznam

| klíč | podmínka |
|---|---|
| `title`, `author` | text, který po oříznutí mezer není prázdný |
| `year` | celé číslo od 1450 do 2026 |
| `addedAt` | text ve tvaru `RRRR-MM-DD` |
| `available` | `true` nebo `false` |

Klíče `id` a `genre` jsou ve všech záznamech v pořádku.

# --hints--

Během načítání má `#books` atribut `aria-busy="true"` a `#status` není prázdný; po načtení atribut zmizí.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const list = document.querySelector('#books');
await until(() => list.querySelectorAll('li').length > 0, 'po otevření se má katalog načíst a vykreslit do #books', 3000);
await helpers.wait(50);
mockApi.delay = 400;
await helpers.click(document.querySelector('#reload'));
assert.equal(list.getAttribute('aria-busy'), 'true', 'hned po kliknutí na Načíst znovu má mít #books aria-busy="true"');
assert.notEqual(document.querySelector('#status').textContent.trim(), '', 'během načítání má #status říct, že se načítá');
await until(() => list.getAttribute('aria-busy') !== 'true', 'po načtení má aria-busy z #books zmizet', 3000);
```

Po načtení je v `#books` položka `li` s `data-id` pro každý platný záznam a žádná pro vadný.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const ids = () => [...document.querySelectorAll('#books > li')].map((item) => item.dataset.id);
await until(() => ids().length > 0, 'po otevření se má katalog vykreslit do #books jako položky li', 3000);
await helpers.wait(100);
const valid = ['K-101', 'K-102', 'K-103', 'K-105', 'K-106', 'K-107', 'K-108', 'K-110', 'K-111', 'K-112', 'K-114', 'K-115', 'K-117', 'K-118', 'K-119', 'K-120', 'K-121'];
assert.deepEqual(ids().toSorted(), valid, `v #books má být 17 platných knih (li s data-id), jsou tam: ${ids().join(', ')}`);
```

`#invalid` je vidět a vyjmenuje `id` všech vadných záznamů.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const invalid = document.querySelector('#invalid');
await until(() => document.querySelectorAll('#books > li').length > 0, 'po otevření se má katalog vykreslit do #books', 3000);
assert.equal(invalid.hidden, false, '#invalid má být po načtení vidět — data obsahují vadné záznamy');
for (const id of ['K-104', 'K-109', 'K-113', 'K-116', 'K-122']) {
  assert.ok(invalid.textContent.includes(id), `#invalid má jmenovat vadný záznam ${id} (${id === 'K-122' ? 'available není true ani false' : id === 'K-116' ? 'datum přidání není RRRR-MM-DD' : id === 'K-113' ? 'chybí autor' : id === 'K-109' ? 'rok je text' : 'prázdný název'})`);
}
assert.ok(!invalid.textContent.includes('K-101'), '#invalid nemá jmenovat platný záznam K-101');
```

Když jsou všechny záznamy platné, `#invalid` není vidět.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reload = document.querySelector('#reload');
await until(() => document.querySelectorAll('#books > li').length > 0 && !reload.disabled, 'po otevření se má katalog vykreslit do #books', 3000);
mockApi.delay = 50;
mockApi.books = mockApi.books.filter((record) => !['K-104', 'K-109', 'K-113', 'K-116', 'K-122'].includes(record.id));
await helpers.click(reload);
await helpers.wait(80);
await until(() => document.querySelector('#books').getAttribute('aria-busy') !== 'true' && document.querySelectorAll('#books > li').length === 17, 'po Načíst znovu se má katalog znovu vykreslit', 2000);
assert.equal(document.querySelector('#invalid').hidden, true, 'když data neobsahují vadné záznamy, má být #invalid skrytý');
```

Každá kniha ukazuje název, autora, rok vydání, žánr a datum přidání česky.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelector('#books > li[data-id="K-102"]'), 'v #books má být položka li[data-id="K-102"]', 3000);
const text = document.querySelector('#books > li[data-id="K-102"]').textContent;
for (const part of ['Krakatit', 'Karel Čapek', '1924', 'klasika']) {
  assert.ok(text.toLocaleLowerCase('cs').includes(part.toLocaleLowerCase('cs')), `položka K-102 má obsahovat „${part}"`);
}
assert.match(text, /(?<!\d)2\.\s*9\.\s*2026(?!\d)/, 'položka K-102 má ukázat datum přidání česky: 2. 9. 2026');
```

Texty z dat se vkládají jako text: znaky `<` a `>` nevytvoří v `#books` nové prvky.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelector('#books > li[data-id="K-118"]'), 'v #books má být položka li[data-id="K-118"]', 3000);
const item = document.querySelector('#books > li[data-id="K-118"]');
assert.equal(item.querySelector('header, main, footer'), null, 'název K-118 obsahuje <header>, <main> a <footer> — nesmí z nich vzniknout prvky, vkládej text přes textContent');
assert.ok(item.textContent.includes('<main>'), 'název K-118 se má ukázat doslova, i se znaky <main>');
```

Výchozí řazení je podle názvu podle české abecedy.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const ids = () => [...document.querySelectorAll('#books > li')].map((item) => item.dataset.id);
await until(() => ids().length === 17, 'po otevření má být v #books 17 platných knih', 3000);
assert.deepEqual(
  ids(),
  ['K-101', 'K-114', 'K-110', 'K-105', 'K-107', 'K-102', 'K-120', 'K-117', 'K-121', 'K-119', 'K-108', 'K-111', 'K-118', 'K-103', 'K-115', 'K-106', 'K-112'],
  'knihy mají být podle názvu podle české abecedy: Babička, Cesta, Čarodějův učeň, Hobit…, Chrám…, Krakatit… (Č za C, Ch za H, Š za S, Ž za Z)',
);
```

Změna `#sort` na nejnovější přírůstky knihy hned přeřadí; stejné datum je podle názvu.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const ids = () => [...document.querySelectorAll('#books > li')].map((item) => item.dataset.id);
await until(() => ids().length === 17, 'po otevření má být v #books 17 platných knih', 3000);
const sort = document.querySelector('#sort');
sort.value = 'newest';
sort.dispatchEvent(new Event('input', { bubbles: true }));
sort.dispatchEvent(new Event('change', { bubbles: true }));
await helpers.wait(50);
assert.deepEqual(
  ids(),
  ['K-118', 'K-110', 'K-106', 'K-112', 'K-102', 'K-103', 'K-120', 'K-115', 'K-101', 'K-108', 'K-105', 'K-117', 'K-107', 'K-119', 'K-121', 'K-111', 'K-114'],
  'po změně #sort na newest mají být knihy od nejnovějšího data přidání, 10. 9. v pořadí Čarodějův učeň, Zaklínač, Žítkovské bohyně',
);
```

Hledání po odeslání formuláře najde text v názvu i autorovi bez ohledu na velikost písmen.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
const ids = () => [...document.querySelectorAll('#books > li')].map((item) => item.dataset.id);
await until(() => ids().length === 17, 'po otevření má být v #books 17 platných knih', 3000);
const form = document.querySelector('#filters');
form.elements.q.value = 'čApEk';
form.elements.q.dispatchEvent(new Event('input', { bubbles: true }));
await helpers.submit(form);
await helpers.wait(50);
assert.deepEqual(ids(), ['K-102', 'K-103'], "hledání 'čApEk' má najít Krakatit a Válku s mloky (autor Karel Čapek)");
form.elements.q.value = 'cesta';
form.elements.q.dispatchEvent(new Event('input', { bubbles: true }));
await helpers.submit(form);
await helpers.wait(50);
assert.deepEqual(ids(), ['K-114', 'K-105'], "hledání 'cesta' má najít Cestu a Hobita aneb Cesta tam a zase zpátky");
```

Žánr a „jen k vypůjčení" platí zároveň.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
const ids = () => [...document.querySelectorAll('#books > li')].map((item) => item.dataset.id);
await until(() => ids().length === 17, 'po otevření má být v #books 17 platných knih', 3000);
const form = document.querySelector('#filters');
form.elements.genre.value = 'klasika';
form.elements.genre.dispatchEvent(new Event('change', { bubbles: true }));
form.elements.available.checked = true;
form.elements.available.dispatchEvent(new Event('change', { bubbles: true }));
await helpers.submit(form);
await helpers.wait(50);
assert.deepEqual(ids(), ['K-101', 'K-108', 'K-103'], 'klasika jen k vypůjčení má ukázat Babičku, Saturnina a Válku s mloky');
```

Filtr a řazení fungují spolu.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
const ids = () => [...document.querySelectorAll('#books > li')].map((item) => item.dataset.id);
await until(() => ids().length === 17, 'po otevření má být v #books 17 platných knih', 3000);
const form = document.querySelector('#filters');
form.elements.sort.value = 'newest';
form.elements.sort.dispatchEvent(new Event('change', { bubbles: true }));
form.elements.genre.value = 'pro děti';
form.elements.genre.dispatchEvent(new Event('change', { bubbles: true }));
await helpers.submit(form);
await helpers.wait(50);
assert.deepEqual(ids(), ['K-110', 'K-120', 'K-121'], 'knihy pro děti od nejnovější mají být Čarodějův učeň, Malý princ, Ronja');
```

`#count` ukazuje počet zobrazených knih a počet platných knih v katalogu.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
await until(() => document.querySelectorAll('#books > li').length === 17, 'po otevření má být v #books 17 platných knih', 3000);
const count = document.querySelector('#count');
assert.match(count.textContent, /\b17\b/, `#count má po načtení obsahovat počet 17, obsahuje „${count.textContent}"`);
const form = document.querySelector('#filters');
form.elements.genre.value = 'detektivka';
form.elements.genre.dispatchEvent(new Event('change', { bubbles: true }));
await helpers.submit(form);
await helpers.wait(50);
assert.match(count.textContent, /\b2\b/, `po filtru detektivek má #count obsahovat počet zobrazených 2, obsahuje „${count.textContent}"`);
assert.match(count.textContent, /\b17\b/, `#count má dál obsahovat celkový počet platných knih 17, obsahuje „${count.textContent}"`);
```

Když filtru nevyhoví žádná kniha, ukáže se `#empty`; po zrušení filtru zase zmizí.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
await until(() => document.querySelectorAll('#books > li').length === 17, 'po otevření má být v #books 17 platných knih', 3000);
const form = document.querySelector('#filters');
const empty = document.querySelector('#empty');
assert.equal(empty.hidden, true, 'po načtení má být #empty skrytý');
form.elements.q.value = 'Hamlet';
form.elements.q.dispatchEvent(new Event('input', { bubbles: true }));
await helpers.submit(form);
await helpers.wait(50);
assert.equal(empty.hidden, false, "když hledání 'Hamlet' nic nenajde, má být #empty vidět");
assert.equal(document.querySelectorAll('#books > li').length, 0, 'když nic nevyhoví, má být #books prázdný');
form.elements.q.value = '';
form.elements.q.dispatchEvent(new Event('input', { bubbles: true }));
await helpers.submit(form);
await helpers.wait(50);
assert.equal(empty.hidden, true, 'po smazání hledání má #empty zmizet');
```

Odeslání formuláře stránku znovu nenačte.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
await until(() => document.querySelectorAll('#books > li').length === 17, 'po otevření má být v #books 17 platných knih', 3000);
let prevented = null;
document.addEventListener('submit', (event) => {
  prevented = event.defaultPrevented;
  event.preventDefault();
});
await helpers.submit(document.querySelector('#filters'));
assert.equal(prevented, true, 'odeslání formuláře #filters má zrušit výchozí akci (znovunačtení stránky)');
```

Když server odpoví chybou, `#error` to oznámí a `#books` je prázdný; **Načíst znovu** pak katalog načte a chybu schová.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reload = document.querySelector('#reload');
const error = document.querySelector('#error');
await until(() => document.querySelectorAll('#books > li').length === 17 && !reload.disabled, 'po otevření má být v #books 17 platných knih', 3000);
mockApi.delay = 50;
mockApi.failures = 1;
await helpers.click(reload);
await until(() => error.hidden === false, 'po odpovědi 500 má být vidět #error', 2000);
assert.notEqual(error.textContent.trim(), '', '#error má chybu popsat textem');
assert.equal(document.querySelectorAll('#books > li').length, 0, 'po chybě nemají v #books zůstat staré knihy');
await until(() => !reload.disabled, 'po chybě má jít na Načíst znovu kliknout', 1000);
await helpers.click(reload);
await until(() => document.querySelectorAll('#books > li').length === 17, 'po novém načtení má být v #books zase 17 knih', 2000);
assert.equal(error.hidden, true, 'po úspěšném načtení má být #error skrytý');
```

Výpadek sítě se oznámí v `#error` stejně jako chyba serveru.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
const reload = document.querySelector('#reload');
await until(() => document.querySelectorAll('#books > li').length === 17 && !reload.disabled, 'po otevření má být v #books 17 platných knih', 3000);
mockApi.offline = true;
await helpers.click(reload);
await until(() => document.querySelector('#error').hidden === false, 'když nejde síť, má být vidět #error', 2000);
assert.equal(document.querySelectorAll('#books > li').length, 0, 'po výpadku sítě nemají v #books zůstat staré knihy');
```

**Načíst znovu** knihy nezdvojí a vyplněný filtr platí dál.

```js
const until = (check, message, ms) => helpers.waitFor(() => {
  assert.ok(check(), message);
  return true;
}, ms);
document.addEventListener('submit', (event) => event.preventDefault());
const ids = () => [...document.querySelectorAll('#books > li')].map((item) => item.dataset.id);
const reload = document.querySelector('#reload');
await until(() => ids().length === 17 && !reload.disabled, 'po otevření má být v #books 17 platných knih', 3000);
const form = document.querySelector('#filters');
form.elements.q.value = 'čapek';
form.elements.q.dispatchEvent(new Event('input', { bubbles: true }));
await helpers.submit(form);
mockApi.delay = 50;
const before = mockApi.requests;
await helpers.click(reload);
await until(() => mockApi.requests > before && document.querySelector('#books').getAttribute('aria-busy') !== 'true', 'Načíst znovu má poslat nový požadavek na /api/books', 2000);
await helpers.wait(150);
assert.deepEqual(ids(), ['K-102', 'K-103'], `po Načíst znovu má filtr „čapek" platit dál a knihy se nemají zdvojit, v #books jsou: ${ids().join(', ')}`);
```

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nové přírůstky · Knihovna Na Náměstí</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="masthead">
      <p class="masthead__label">Knihovna Na Náměstí</p>
      <h1 class="masthead__title">Nové přírůstky</h1>
      <p class="masthead__lead">Knihy, které jsme letos zařadili do fondu. Najdi si, co si půjčíš.</p>
    </header>

    <main class="catalog">
      <form id="filters" class="filters">
        <div class="field field--grow">
          <label for="q">Hledat v názvu nebo autorovi</label>
          <input id="q" name="q" type="search" placeholder="Třeba Čapek" autocomplete="off">
        </div>
        <div class="field">
          <label for="genre">Žánr</label>
          <select id="genre" name="genre">
            <option value="">Všechny žánry</option>
            <option value="klasika">Klasika</option>
            <option value="román">Román</option>
            <option value="detektivka">Detektivka</option>
            <option value="fantasy">Fantasy</option>
            <option value="naučná">Naučná</option>
            <option value="pro děti">Pro děti</option>
          </select>
        </div>
        <div class="field">
          <label for="sort">Řadit</label>
          <select id="sort" name="sort">
            <option value="title">Podle názvu</option>
            <option value="newest">Nejnovější přírůstky</option>
          </select>
        </div>
        <label class="check">
          <input id="available" name="available" type="checkbox">
          Jen k vypůjčení
        </label>
        <button class="button" type="submit">Použít filtr</button>
      </form>

      <div class="toolbar">
        <p id="count" class="count"></p>
        <button id="reload" class="button button--ghost" type="button">Načíst znovu</button>
      </div>

      <p id="status" class="status" role="status"></p>
      <p id="error" class="notice notice--error" role="alert" hidden></p>
      <p id="invalid" class="notice notice--warning" hidden></p>

      <ul id="books" class="books"></ul>
      <p id="empty" class="empty" hidden>Takovou knihu jsme nenašli. Zkus jiné hledání nebo žánr.</p>
    </main>

    <script src="api.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --paper: #faf6ef;
  --card: #ffffff;
  --ink: #2b2118;
  --muted: #7a6a5b;
  --line: #eadfce;
  --burgundy: #7b2e3b;
  --burgundy-2: #9c3d4e;
  --sage: #3f6b4f;
  --warning: #8a5a00;
  --radius: 0.8rem;
  --space-s: 0.5rem;
  --space-m: 1rem;
  --space-l: 2rem;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}

.masthead {
  padding: 2.5rem var(--space-m) var(--space-l);
  text-align: center;
  color: var(--paper);
  background: linear-gradient(135deg, var(--burgundy), #4a1c26);
}

.masthead__label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}

.masthead__title {
  margin: 0.25rem 0;
  font-family: ui-serif, Georgia, serif;
  font-size: clamp(2rem, 5vw, 2.8rem);
}

.masthead__lead {
  margin: 0;
  opacity: 0.85;
}

.catalog {
  width: min(100% - 2rem, 62rem);
  margin: var(--space-l) auto 4rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--space-m);
  padding: var(--space-m);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
}

.field {
  display: grid;
  gap: 0.25rem;
}

.field--grow {
  flex: 1 1 14rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
}

input,
select {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--paper);
  color: inherit;
  font: inherit;
}

input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--burgundy-2);
  outline-offset: 1px;
}

.check {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding-block: 0.5rem;
}

.button {
  padding: 0.55rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--burgundy);
  color: var(--paper);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.button:hover {
  background: var(--burgundy-2);
}

.button:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.button--ghost {
  background: transparent;
  color: var(--burgundy);
  box-shadow: inset 0 0 0 2px var(--burgundy);
}

.button--ghost:hover {
  background: rgb(123 46 59 / 0.08);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-m);
  margin-block: var(--space-m) var(--space-s);
}

.count,
.status {
  margin: 0;
  color: var(--muted);
}

.notice {
  margin: var(--space-s) 0;
  padding: 0.7rem var(--space-m);
  border-radius: 0.5rem;
  border-inline-start: 4px solid;
}

.notice--error {
  border-color: var(--burgundy);
  background: #f8e4e7;
}

.notice--warning {
  border-color: var(--warning);
  background: #fbf0d9;
}

.books {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: var(--space-m);
  margin: var(--space-m) 0 0;
  padding: 0;
  list-style: none;
  transition: opacity 0.2s ease;
}

.books[aria-busy="true"] {
  opacity: 0.5;
}

.book {
  display: grid;
  gap: 0.2rem;
  padding: var(--space-m);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.book:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgb(43 33 24 / 0.1);
}

.book__title {
  margin: 0;
  font-family: ui-serif, Georgia, serif;
  font-size: 1.15rem;
  line-height: 1.3;
}

.book__author,
.book__meta {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.book__badge {
  justify-self: start;
  margin-block-start: 0.4rem;
  padding: 0.1rem 0.6rem;
  border-radius: 99rem;
  background: #e6efe8;
  color: var(--sage);
  font-size: 0.8rem;
  font-weight: 650;
}

.book__badge--out {
  background: #f1e9e0;
  color: var(--muted);
}

.empty {
  margin-block: var(--space-l);
  color: var(--muted);
  text-align: center;
}
```

## --file-- api.js

```js
// ===== Simulace API knihovny (neměň) =====
// Nahradí fetch pro adresy /api/…: odpovídá se zpožděním skutečnými objekty Response
// se stavem a JSON tělem.
//
//   GET /api/books   pole záznamů { id, title, author, year, genre, addedAt, available }
//
// Data pocházejí ze starého systému a některé záznamy jsou vadné.
// Testy si simulaci přepínají přes objekt mockApi (data, zpoždění, výpadky, offline).
const mockApi = (() => {
  const api = {
    books: [
      { id: 'K-101', title: 'Babička', author: 'Božena Němcová', year: 1855, genre: 'klasika', addedAt: '2026-08-14', available: true },
      { id: 'K-102', title: 'Krakatit', author: 'Karel Čapek', year: 1924, genre: 'klasika', addedAt: '2026-09-02', available: false },
      { id: 'K-103', title: 'Válka s mloky', author: 'Karel Čapek', year: 1936, genre: 'klasika', addedAt: '2026-09-02', available: true },
      { id: 'K-104', title: '   ', author: 'Jan Neruda', year: 1878, genre: 'klasika', addedAt: '2026-08-27', available: true },
      { id: 'K-105', title: 'Hobit aneb Cesta tam a zase zpátky', author: 'J. R. R. Tolkien', year: 1937, genre: 'fantasy', addedAt: '2026-07-30', available: true },
      { id: 'K-106', title: 'Zaklínač: Poslední přání', author: 'Andrzej Sapkowski', year: 1993, genre: 'fantasy', addedAt: '2026-09-10', available: true },
      { id: 'K-107', title: 'Chrám Matky Boží v Paříži', author: 'Victor Hugo', year: 1831, genre: 'klasika', addedAt: '2026-06-18', available: false },
      { id: 'K-108', title: 'Saturnin', author: 'Zdeněk Jirotka', year: 1942, genre: 'klasika', addedAt: '2026-08-14', available: true },
      { id: 'K-109', title: 'Maryša', author: 'Alois a Vilém Mrštíkové', year: '1894', genre: 'klasika', addedAt: '2026-06-18', available: true },
      { id: 'K-110', title: 'Čarodějův učeň', author: 'Otfried Preußler', year: 1971, genre: 'pro děti', addedAt: '2026-09-10', available: true },
      { id: 'K-111', title: 'Šikmý kostel', author: 'Karin Lednická', year: 2020, genre: 'román', addedAt: '2026-05-21', available: false },
      { id: 'K-112', title: 'Žítkovské bohyně', author: 'Kateřina Tučková', year: 2012, genre: 'román', addedAt: '2026-09-10', available: false },
      { id: 'K-113', title: 'Kytice', author: null, year: 1853, genre: 'klasika', addedAt: '2026-07-30', available: true },
      { id: 'K-114', title: 'Cesta', author: 'Cormac McCarthy', year: 2006, genre: 'román', addedAt: '2026-04-02', available: true },
      { id: 'K-115', title: 'Vražda v Orient expresu', author: 'Agatha Christie', year: 1934, genre: 'detektivka', addedAt: '2026-08-27', available: true },
      { id: 'K-116', title: 'Bylo nás pět', author: 'Karel Poláček', year: 1946, genre: 'klasika', addedAt: 'včera', available: true },
      { id: 'K-117', title: 'Pes baskervillský', author: 'Arthur Conan Doyle', year: 1902, genre: 'detektivka', addedAt: '2026-07-30', available: false },
      { id: 'K-118', title: 'Tvoříme web: <header>, <main> a <footer>', author: 'Lucie Veselá', year: 2025, genre: 'naučná', addedAt: '2026-09-12', available: true },
      { id: 'K-119', title: 'Sapiens: Stručné dějiny lidstva', author: 'Yuval Noah Harari', year: 2011, genre: 'naučná', addedAt: '2026-06-18', available: true },
      { id: 'K-120', title: 'Malý princ', author: 'Antoine de Saint-Exupéry', year: 1943, genre: 'pro děti', addedAt: '2026-08-27', available: true },
      { id: 'K-121', title: 'Ronja, dcera loupežníka', author: 'Astrid Lindgrenová', year: 1981, genre: 'pro děti', addedAt: '2026-05-21', available: true },
      { id: 'K-122', title: 'Dášeňka čili život štěněte', author: 'Karel Čapek', year: 1933, genre: 'pro děti', addedAt: '2026-08-14', available: 'ano' },
    ],
    delay: 400, // zpoždění odpovědi v ms
    failures: 0, // kolik dalších požadavků skončí stavem 500
    offline: false, // true = síť nejde, fetch se zamítne
    requests: 0, // kolik požadavků přišlo
  };

  const realFetch = window.fetch.bind(window);

  window.fetch = function fetch(input, options = {}) {
    const url = new URL(typeof input === 'string' ? input : input.url, 'https://knihovna.example');
    if (!url.pathname.startsWith('/api/')) return realFetch(input, options);
    api.requests++;
    return new Promise((resolve, reject) => {
      if (api.offline) {
        setTimeout(() => reject(new TypeError('Failed to fetch')), 30);
        return;
      }
      const failed = api.failures > 0;
      if (failed) api.failures--;
      setTimeout(() => {
        const body = url.pathname !== '/api/books'
          ? { error: 'Neznámá adresa' }
          : failed ? { error: 'Katalog je dočasně nedostupný' } : structuredClone(api.books);
        const status = url.pathname !== '/api/books' ? 404 : failed ? 500 : 200;
        resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } }));
      }, api.delay);
    });
  };

  return api;
})();
```

## --file-- app.js

```js
// Katalog nových přírůstků. API je popsané nahoře v api.js, prvky stránky v index.html.
--edit--

--edit--
```

# --solution--

## --file-- app.js

```js
// Katalog nových přírůstků. API je popsané nahoře v api.js, prvky stránky v index.html.

const form = document.querySelector('#filters');
const sortSelect = document.querySelector('#sort');
const list = document.querySelector('#books');
const countText = document.querySelector('#count');
const statusText = document.querySelector('#status');
const errorBox = document.querySelector('#error');
const invalidNote = document.querySelector('#invalid');
const emptyNote = document.querySelector('#empty');
const reloadButton = document.querySelector('#reload');

const collator = new Intl.Collator('cs');
const dateFormat = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });

// Platné knihy z posledního úspěšného načtení — zdroj pravdy pro vykreslení.
let books = [];

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidBook(record) {
  return isNonEmptyText(record?.id)
    && isNonEmptyText(record.title)
    && isNonEmptyText(record.author)
    && Number.isInteger(record.year) && record.year >= 1450 && record.year <= 2026
    && typeof record.addedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.addedAt)
    && typeof record.available === 'boolean';
}

// Datum RRRR-MM-DD jako „14. 8. 2026" (v místním čase, bez posunu přes UTC).
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

function readFilters() {
  const data = new FormData(form);
  return {
    query: String(data.get('q') ?? '').trim().toLocaleLowerCase('cs'),
    genre: data.get('genre') ?? '',
    onlyAvailable: data.has('available'),
    sort: data.get('sort') ?? 'title',
  };
}

function selectBooks({ query, genre, onlyAvailable, sort }) {
  const matching = books.filter((book) => {
    const text = `${book.title}\n${book.author}`.toLocaleLowerCase('cs');
    return (query === '' || text.includes(query))
      && (genre === '' || book.genre === genre)
      && (!onlyAvailable || book.available);
  });
  const byTitle = (a, b) => collator.compare(a.title, b.title);
  const byNewest = (a, b) => b.addedAt.localeCompare(a.addedAt) || byTitle(a, b);
  return matching.toSorted(sort === 'newest' ? byNewest : byTitle);
}

function createBookItem(book) {
  const item = document.createElement('li');
  item.className = 'book';
  item.dataset.id = book.id;

  const title = document.createElement('h2');
  title.className = 'book__title';
  title.textContent = book.title;

  const author = document.createElement('p');
  author.className = 'book__author';
  author.textContent = book.author;

  const meta = document.createElement('p');
  meta.className = 'book__meta';
  meta.textContent = `${book.year} · ${book.genre} · přidáno ${formatDate(book.addedAt)}`;

  const badge = document.createElement('span');
  badge.className = book.available ? 'book__badge' : 'book__badge book__badge--out';
  badge.textContent = book.available ? 'K vypůjčení' : 'Vypůjčeno';

  item.append(title, author, meta, badge);
  return item;
}

function render() {
  const shown = selectBooks(readFilters());
  list.replaceChildren(...shown.map(createBookItem));
  countText.textContent = `Zobrazeno ${shown.length} z ${books.length} knih`;
  emptyNote.hidden = shown.length > 0;
}

async function loadCatalog() {
  list.setAttribute('aria-busy', 'true');
  statusText.textContent = 'Načítám katalog…';
  errorBox.hidden = true;
  reloadButton.disabled = true;
  try {
    const response = await fetch('/api/books');
    if (!response.ok) {
      throw new Error(`server odpověděl ${response.status}`);
    }
    const records = await response.json();
    if (!Array.isArray(records)) {
      throw new Error('server poslal data v neznámém tvaru');
    }

    books = records.filter(isValidBook);
    const invalid = records.filter((record) => !isValidBook(record));
    invalidNote.textContent = `Vadné záznamy vynechané z katalogu (${invalid.length}): ${invalid.map((record) => record?.id ?? 'bez čísla').join(', ')}.`;
    invalidNote.hidden = invalid.length === 0;

    statusText.textContent = 'Katalog je načtený.';
    render();
  } catch (error) {
    books = [];
    list.replaceChildren();
    countText.textContent = '';
    emptyNote.hidden = true;
    invalidNote.hidden = true;
    statusText.textContent = '';
    errorBox.textContent = `Katalog se nepodařilo načíst (${error.message}). Zkus to znovu tlačítkem Načíst znovu.`;
    errorBox.hidden = false;
  } finally {
    list.removeAttribute('aria-busy');
    reloadButton.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
});
sortSelect.addEventListener('change', render);
reloadButton.addEventListener('click', loadCatalog);

loadCatalog();
```

# --approaches--

## --approach-- Proměnné a malé funkce

Platné knihy jsou v jedné proměnné a každá věc má vlastní funkci: `isValidBook`, `readFilters` přes `FormData`, `selectBooks` s `Intl.Collator('cs')` a `render`. Načítání řeší jen síť a stavy, vykreslení jen stránku. Když přibude další filtr, mění se jedna funkce.

### --file-- app.js

```js
// Katalog nových přírůstků. API je popsané nahoře v api.js, prvky stránky v index.html.

const form = document.querySelector('#filters');
const sortSelect = document.querySelector('#sort');
const list = document.querySelector('#books');
const countText = document.querySelector('#count');
const statusText = document.querySelector('#status');
const errorBox = document.querySelector('#error');
const invalidNote = document.querySelector('#invalid');
const emptyNote = document.querySelector('#empty');
const reloadButton = document.querySelector('#reload');

const collator = new Intl.Collator('cs');
const dateFormat = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });

// Platné knihy z posledního úspěšného načtení — zdroj pravdy pro vykreslení.
let books = [];

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidBook(record) {
  return isNonEmptyText(record?.id)
    && isNonEmptyText(record.title)
    && isNonEmptyText(record.author)
    && Number.isInteger(record.year) && record.year >= 1450 && record.year <= 2026
    && typeof record.addedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.addedAt)
    && typeof record.available === 'boolean';
}

// Datum RRRR-MM-DD jako „14. 8. 2026" (v místním čase, bez posunu přes UTC).
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

function readFilters() {
  const data = new FormData(form);
  return {
    query: String(data.get('q') ?? '').trim().toLocaleLowerCase('cs'),
    genre: data.get('genre') ?? '',
    onlyAvailable: data.has('available'),
    sort: data.get('sort') ?? 'title',
  };
}

function selectBooks({ query, genre, onlyAvailable, sort }) {
  const matching = books.filter((book) => {
    const text = `${book.title}\n${book.author}`.toLocaleLowerCase('cs');
    return (query === '' || text.includes(query))
      && (genre === '' || book.genre === genre)
      && (!onlyAvailable || book.available);
  });
  const byTitle = (a, b) => collator.compare(a.title, b.title);
  const byNewest = (a, b) => b.addedAt.localeCompare(a.addedAt) || byTitle(a, b);
  return matching.toSorted(sort === 'newest' ? byNewest : byTitle);
}

function createBookItem(book) {
  const item = document.createElement('li');
  item.className = 'book';
  item.dataset.id = book.id;

  const title = document.createElement('h2');
  title.className = 'book__title';
  title.textContent = book.title;

  const author = document.createElement('p');
  author.className = 'book__author';
  author.textContent = book.author;

  const meta = document.createElement('p');
  meta.className = 'book__meta';
  meta.textContent = `${book.year} · ${book.genre} · přidáno ${formatDate(book.addedAt)}`;

  const badge = document.createElement('span');
  badge.className = book.available ? 'book__badge' : 'book__badge book__badge--out';
  badge.textContent = book.available ? 'K vypůjčení' : 'Vypůjčeno';

  item.append(title, author, meta, badge);
  return item;
}

function render() {
  const shown = selectBooks(readFilters());
  list.replaceChildren(...shown.map(createBookItem));
  countText.textContent = `Zobrazeno ${shown.length} z ${books.length} knih`;
  emptyNote.hidden = shown.length > 0;
}

async function loadCatalog() {
  list.setAttribute('aria-busy', 'true');
  statusText.textContent = 'Načítám katalog…';
  errorBox.hidden = true;
  reloadButton.disabled = true;
  try {
    const response = await fetch('/api/books');
    if (!response.ok) {
      throw new Error(`server odpověděl ${response.status}`);
    }
    const records = await response.json();
    if (!Array.isArray(records)) {
      throw new Error('server poslal data v neznámém tvaru');
    }

    books = records.filter(isValidBook);
    const invalid = records.filter((record) => !isValidBook(record));
    invalidNote.textContent = `Vadné záznamy vynechané z katalogu (${invalid.length}): ${invalid.map((record) => record?.id ?? 'bez čísla').join(', ')}.`;
    invalidNote.hidden = invalid.length === 0;

    statusText.textContent = 'Katalog je načtený.';
    render();
  } catch (error) {
    books = [];
    list.replaceChildren();
    countText.textContent = '';
    emptyNote.hidden = true;
    invalidNote.hidden = true;
    statusText.textContent = '';
    errorBox.textContent = `Katalog se nepodařilo načíst (${error.message}). Zkus to znovu tlačítkem Načíst znovu.`;
    errorBox.hidden = false;
  } finally {
    list.removeAttribute('aria-busy');
    reloadButton.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
});
sortSelect.addEventListener('change', render);
reloadButton.addEventListener('click', loadCatalog);

loadCatalog();
```

## --approach-- Jeden objekt stavu a jedno vykreslení

Všechno, co stránka ukazuje, je v objektu `state` s fází `loading`, `ready` nebo `error`. Načítání stav jen mění a pak zavolá `render`, která podle něj nastaví celou stránku. Vadné záznamy pozná funkce, která vrací seznam problémů, takže by šly snadno vypsat i důvody. Víc kódu na jednom místě, ale nemůže se stát, že by se po chybě zapomněl schovat některý prvek.

### --file-- app.js

```js
// Katalog nových přírůstků. API je popsané nahoře v api.js, prvky stránky v index.html.

const elements = {
  form: document.querySelector('#filters'),
  list: document.querySelector('#books'),
  count: document.querySelector('#count'),
  status: document.querySelector('#status'),
  error: document.querySelector('#error'),
  invalid: document.querySelector('#invalid'),
  empty: document.querySelector('#empty'),
  reload: document.querySelector('#reload'),
};

// Celý stav aplikace na jednom místě; stránka se z něj vždy celá vykreslí.
const state = {
  phase: 'loading', // loading | ready | error
  books: [],
  invalidIds: [],
  errorMessage: '',
};

// Co je na záznamu špatně (prázdné pole = záznam je v pořádku).
function problemsOf(record) {
  const problems = [];
  if (typeof record.title !== 'string' || !record.title.trim()) problems.push('název');
  if (typeof record.author !== 'string' || !record.author.trim()) problems.push('autor');
  if (!Number.isInteger(record.year) || record.year < 1450 || record.year > 2026) problems.push('rok');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(record.addedAt))) problems.push('datum přidání');
  if (typeof record.available !== 'boolean') problems.push('dostupnost');
  return problems;
}

function matchesFilters(book, filters) {
  const query = filters.q.trim().toLocaleLowerCase('cs');
  if (query && !book.title.toLocaleLowerCase('cs').includes(query) && !book.author.toLocaleLowerCase('cs').includes(query)) return false;
  if (filters.genre && book.genre !== filters.genre) return false;
  if (filters.available && !book.available) return false;
  return true;
}

function compareBooks(sort) {
  return (a, b) => {
    if (sort === 'newest' && a.addedAt !== b.addedAt) return a.addedAt > b.addedAt ? -1 : 1;
    return a.title.localeCompare(b.title, 'cs');
  };
}

function render() {
  const { form, list, count, status, error, invalid, empty, reload } = elements;
  const filters = Object.fromEntries(new FormData(form));

  if (state.phase === 'loading') list.setAttribute('aria-busy', 'true');
  else list.removeAttribute('aria-busy');
  reload.disabled = state.phase === 'loading';
  status.textContent = state.phase === 'loading' ? 'Načítám katalog…' : '';
  error.hidden = state.phase !== 'error';
  error.textContent = state.errorMessage;
  invalid.hidden = state.phase !== 'ready' || state.invalidIds.length === 0;
  invalid.textContent = `Tyto záznamy mají chybu a v katalogu nejsou: ${state.invalidIds.join(', ')}`;

  if (state.phase !== 'ready') {
    if (state.phase === 'error') list.replaceChildren();
    count.textContent = '';
    empty.hidden = true;
    return;
  }

  const shown = state.books
    .filter((book) => matchesFilters(book, { q: filters.q ?? '', genre: filters.genre ?? '', available: 'available' in filters }))
    .sort(compareBooks(filters.sort));

  list.replaceChildren(...shown.map((book) => {
    const item = document.createElement('li');
    item.className = 'book';
    item.dataset.id = book.id;
    const title = document.createElement('h2');
    title.className = 'book__title';
    title.textContent = book.title;
    const details = document.createElement('p');
    details.className = 'book__meta';
    const added = new Date(`${book.addedAt}T12:00:00`).toLocaleDateString('cs-CZ');
    details.textContent = `${book.author}, ${book.year} · ${book.genre} · přidáno ${added}`;
    const badge = document.createElement('span');
    badge.className = book.available ? 'book__badge' : 'book__badge book__badge--out';
    badge.textContent = book.available ? 'K vypůjčení' : 'Vypůjčeno';
    item.append(title, details, badge);
    return item;
  }));
  count.textContent = `${shown.length} z ${state.books.length} knih`;
  empty.hidden = shown.length > 0;
}

async function loadCatalog() {
  state.phase = 'loading';
  render();
  try {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error(`server odpověděl ${response.status}`);
    const records = await response.json();
    state.books = records.filter((record) => problemsOf(record).length === 0);
    state.invalidIds = records.filter((record) => problemsOf(record).length > 0).map((record) => record.id);
    state.phase = 'ready';
  } catch (error) {
    state.books = [];
    state.phase = 'error';
    state.errorMessage = `Katalog se nepodařilo načíst: ${error.message}.`;
  }
  render();
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
});
elements.form.addEventListener('change', (event) => {
  if (event.target.name === 'sort') render();
});
elements.reload.addEventListener('click', loadCatalog);

loadCatalog();
```

# --review--

Testy kontrolují chování. Tohle zkontroluj sám, než kontrolní bod uzavřeš.

## --rubric--

- Validace, filtr, řazení a vykreslení jsou oddělené funkce, které jdou číst každá zvlášť.
- Data ze serveru nikde nevkládáš jako HTML.
- Po chybě ani po novém načtení nezůstane ve stránce nic z předchozího stavu, co by se tvářilo jako aktuální.
- Umíš vysvětlit, proč `sort` bez porovnávací funkce nebo porovnání přes `<` dá špatné české pořadí.
- Víš, co by se stalo, kdyby uživatel klikl na **Načíst znovu** dvakrát rychle za sebou, a jak bys tomu zabránil.

## --extensions--

Rozšíření bez testů: filtr a řazení v adrese stránky, aby šel výsledek poslat odkazem; hledání při psaní s `debounce`; u vadných záznamů i důvod, proč jsou vadné.
