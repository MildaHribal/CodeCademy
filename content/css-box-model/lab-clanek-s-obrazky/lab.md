---
title: Článek s obtékanými obrázky
see: css-box-model/preteceni#float-jen-na-obtekani, css-box-model/preteceni#dlouha-slova-a-adresy, css-box-model/margin-collapse-a-bfc#blokovy-formatovaci-kontext
---

# --description--

Cestovatelský blog chystá článek o výletu na kole kolem Lipna. HTML je hotové a vzhled textů, citace, tabulky a karty taky. Chybí rozvržení článku a hlavně to, co udělá obsah, který se nevejde: velká úvodní fotka, dlouhá adresa ke stažení trasy, široká tabulka úseků a dlouhý název doporučeného článku. Na telefonu teď jde stránka posouvat do strany a fotka kola se roztahuje přes celou šířku. Rozvrhni článek v souboru `styles.css` pod komentářem `/* Tvoje rozvržení článku */`.

Tentokrát bez návodu. Téma, texty a vzhled jsou tvoje volba, klidně z článku udělej recept nebo recenzi. Testy kontrolují jen rozvržení podle tříd v HTML; nadpis doporučené karty jen nech delší, než se vejde na jeden řádek.

**Co má článek umět:**

- Na počítači je článek čitelný sloupec uprostřed stránky, nejvýš 44rem široký.
- Na telefonu jde stránka posouvat jen svisle: dlouhá adresa se zalomí uvnitř svého odstavce a širokou tabulku jde posouvat do strany samostatně, ve svém obalu `.table-wrap`.
- Úvodní fotka vyplní celou šířku článku ve výřezu 16 : 9 a nezdeformuje se.
- Fotka kola s popiskem (`.story__figure`) stojí na začátku řádku, zabírá nejvýš polovinu šířky článku a text vedle ní ji obtéká s odstupem aspoň 16 px.
- Sekce `.story` obalí fotku celou, takže další odstavec nezačne vedle fotky, ale až pod ní.
- Citace je přes celou šířku článku, má na začátku řádku proužek silný aspoň 3 px a text v ní má odstup aspoň 16 px od proužku a zhruba stejný odstup nahoře i dole.
- Nadpis doporučené karty je na jednom řádku a na konci zkrácený třemi tečkami.

Testy měří na šířce 1024 px a 375 px, obě si přepneš nad náhledem („Jako testy" a 375).

# --hints--

Na šířce 1024 px je článek široký nejvýš 44rem (704 px) a je vodorovně uprostřed stránky.

```js
const article = document.querySelector('.article').getBoundingClientRect();
const right = document.documentElement.clientWidth - article.right;
assert.ok(article.width <= 705, `Článek je široký ${Math.round(article.width)} px, má být nejvýš 704 px`);
assert.ok(article.width >= 400, `Článek je široký jen ${Math.round(article.width)} px — na počítači má být čitelný sloupec`);
assert.ok(Math.abs(article.left - right) <= 2, `Vlevo od článku je ${Math.round(article.left)} px, vpravo ${Math.round(right)} px — má být uprostřed`);
```

Na šířce 375 px nejde stránka posouvat do strany.

```js
await helpers.resize(375);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce 375 px je obsah stránky široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
```

Na šířce 375 px se dlouhá adresa zalomí uvnitř svého odstavce a nic z něj nevyčuhuje.

```js
await helpers.resize(375);
const paragraph = document.querySelector('.article__link');
const box = paragraph.getBoundingClientRect();
const range = document.createRange();
range.selectNodeContents(paragraph);
const rects = [...range.getClientRects()];
const right = Math.max(...rects.map((rect) => rect.right));
assert.ok(right <= box.right + 1, `Při šířce 375 px končí text odstavce s adresou na ${Math.round(right)} px, odstavec na ${Math.round(box.right)} px`);
assert.ok(paragraph.scrollWidth <= paragraph.clientWidth + 1, 'Obsah odstavce s adresou je širší než odstavec — adresa se nezalomila');
```

Na šířce 375 px zůstává obal tabulky v šířce článku a tabulku v něm jde posouvat do strany.

```js
await helpers.resize(375);
const article = document.querySelector('.article').getBoundingClientRect();
const wrap = document.querySelector('.table-wrap');
const box = wrap.getBoundingClientRect();
const style = getComputedStyle(wrap);
assert.ok(box.right <= article.right + 1, `Při šířce 375 px končí obal tabulky na ${Math.round(box.right)} px, článek na ${Math.round(article.right)} px`);
assert.ok(['auto', 'scroll'].includes(style.overflowX), `getComputedStyle(.table-wrap).overflowX je ${style.overflowX} — tabulka se má dát posouvat (auto nebo scroll)`);
assert.ok(wrap.scrollWidth > wrap.clientWidth, 'Tabulka je v obalu celá vidět — má zůstat široká a posouvat se, ne zmačkat');
```

Úvodní fotka vyplní celou šířku článku ve výřezu 16 : 9 a nezdeformuje se.

```js
const article = document.querySelector('.article').getBoundingClientRect();
const hero = document.querySelector('.article__hero');
const box = hero.getBoundingClientRect();
assert.ok(Math.abs(box.width - article.width) <= 1, `Fotka je široká ${Math.round(box.width)} px, článek ${Math.round(article.width)} px`);
assert.ok(Math.abs(box.height - box.width * 9 / 16) <= 2, `Fotka má ${Math.round(box.width)} × ${Math.round(box.height)} px, výřez 16 : 9 by byl vysoký ${Math.round(box.width * 9 / 16)} px`);
assert.equal(getComputedStyle(hero).objectFit, 'cover', 'getComputedStyle(.article__hero).objectFit má být cover — výřez má fotku oříznout, ne zdeformovat');
```

Na šířce 1024 px stojí fotka kola na začátku řádku, zabírá nejvýš polovinu šířky článku a obrázek vyplní šířku popisku.

```js
const article = document.querySelector('.article').getBoundingClientRect();
const figure = document.querySelector('.story__figure').getBoundingClientRect();
const image = document.querySelector('.story__figure img').getBoundingClientRect();
assert.ok(Math.abs(figure.left - article.left) <= 1, `Fotka kola začíná na ${Math.round(figure.left)} px, článek na ${Math.round(article.left)} px — má stát na začátku řádku`);
assert.ok(figure.width <= article.width / 2 + 1, `Fotka kola je široká ${Math.round(figure.width)} px, polovina článku je ${Math.round(article.width / 2)} px`);
assert.ok(figure.width >= article.width / 4, `Fotka kola je široká jen ${Math.round(figure.width)} px — má zabírat aspoň čtvrtinu článku`);
assert.ok(Math.abs(image.width - figure.width) <= 1, `Obrázek kola je široký ${Math.round(image.width)} px, fotka s popiskem ${Math.round(figure.width)} px`);
```

Na šířce 1024 px obtéká text sekce `.story` fotku kola zprava s odstupem aspoň 16 px.

```js
const figure = document.querySelector('.story__figure').getBoundingClientRect();
const paragraph = document.querySelector('.story p');
const range = document.createRange();
range.selectNodeContents(paragraph);
const first = range.getClientRects()[0];
assert.ok(first.top < figure.bottom, 'První řádek textu sekce má být vedle fotky, ne pod ní');
assert.ok(first.left >= figure.right + 16 - 0.5, `První řádek textu začíná ${Math.round(first.left - figure.right)} px za fotkou, čekám aspoň 16 px`);
```

Na šířce 1024 px obalí sekce `.story` fotku celou a další odstavec začíná až pod fotkou.

```js
const story = document.querySelector('.story');
const figure = document.querySelector('.story__figure').getBoundingClientRect();
const next = story.nextElementSibling.getBoundingClientRect();
assert.ok(story.getBoundingClientRect().bottom >= figure.bottom - 1, `Sekce končí na ${Math.round(story.getBoundingClientRect().bottom)} px, fotka až na ${Math.round(figure.bottom)} px — sekce ji má obalit`);
assert.ok(next.top >= figure.bottom - 1, `Další odstavec začíná na ${Math.round(next.top)} px, fotka končí na ${Math.round(figure.bottom)} px — má začít až pod ní`);
```

Citace je přes celou šířku článku a na začátku řádku má proužek silný aspoň 3 px.

```js
const article = document.querySelector('.article').getBoundingClientRect();
const quote = document.querySelector('.quote');
const box = quote.getBoundingClientRect();
const style = getComputedStyle(quote);
assert.ok(Math.abs(box.left - article.left) <= 1 && Math.abs(box.right - article.right) <= 1, `Citace je od ${Math.round(box.left)} do ${Math.round(box.right)} px, článek od ${Math.round(article.left)} do ${Math.round(article.right)} px`);
assert.ok(parseFloat(style.borderLeftWidth) >= 3 && style.borderLeftStyle !== 'none', `Citace má vlevo rámeček ${style.borderLeftWidth} ${style.borderLeftStyle}, čekám plný proužek aspoň 3 px`);
```

Text citace má od proužku odstup aspoň 16 px a nahoře i dole zhruba stejný odstup (rozdíl nejvýš 8 px), aspoň 12 px.

```js
const quote = document.querySelector('.quote');
const box = quote.getBoundingClientRect();
const style = getComputedStyle(quote);
const range = document.createRange();
range.selectNodeContents(quote);
const text = range.getBoundingClientRect();
const innerLeft = box.left + parseFloat(style.borderLeftWidth);
const top = text.top - box.top;
const bottom = box.bottom - text.bottom;
assert.ok(text.left - innerLeft >= 16 - 0.5, `Text citace začíná ${Math.round(text.left - innerLeft)} px od proužku, čekám aspoň 16 px`);
assert.ok(top >= 12 && bottom >= 12, `Text citace má nahoře ${Math.round(top)} px a dole ${Math.round(bottom)} px uvnitř podbarvení, čekám aspoň 12 px`);
assert.ok(Math.abs(top - bottom) <= 8, `Text citace má nahoře ${Math.round(top)} px a dole ${Math.round(bottom)} px — odstup má být zhruba stejný (rozdíl nejvýš 8 px)`);
```

Nadpis doporučené karty je na jednom řádku, oříznutý na šířce karty a zakončený třemi tečkami.

```js
for (const width of [1024, 375]) {
  await helpers.resize(width);
  const title = document.querySelector('.related-card__title');
  const style = getComputedStyle(title);
  const range = document.createRange();
  range.selectNodeContents(title);
  const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
  assert.equal(lines, 1, `Při šířce ${width} px je nadpis karty na ${lines} řádcích — má být na jednom (počet řádků)`);
  assert.ok(title.scrollWidth > title.clientWidth, `Při šířce ${width} px se nadpis karty celý vejde — je dost dlouhý?`);
  assert.equal(style.textOverflow, 'ellipsis', `Při šířce ${width} px: getComputedStyle(.related-card__title).textOverflow má být ellipsis`);
  assert.ok(['hidden', 'clip'].includes(style.overflowX), `Při šířce ${width} px: nadpis karty se má oříznout (overflow hidden nebo clip), je ${style.overflowX}`);
  const card = document.querySelector('.related-card').getBoundingClientRect();
  assert.ok(card.right <= document.documentElement.clientWidth, `Při šířce ${width} px přečnívá karta z okna`);
}
```

# --help--

## --tip-- 8

Plovoucí prvek se do výšky obyčejného rodiče nepočítá. Jak ho rodič obalí, najdeš v [float jen na obtékání](see:css-box-model/preteceni#float-jen-na-obtekani) a v [Blokový formátovací kontext](see:css-box-model/margin-collapse-a-bfc#blokovy-formatovaci-kontext).

## --tip-- 11

Tři tečky potřebují čtyři podmínky najednou. Projdi je u nadpisu karty podle části [Jeden řádek se třemi tečkami](see:css-box-model/preteceni#jeden-radek-se-tremi-teckami).

# --approaches--

## --approach-- Logické vlastnosti a flow-root

Sekce obalí plovoucí fotku přes `display: flow-root` bez vedlejších efektů, adresy se lámou už na celém článku (`overflow-wrap: anywhere` se dědí) a strany se píšou logickými vlastnostmi, takže článek by fungoval i v jazyce psaném zprava doleva. Tenhle zápis je dnes výchozí volba.

### --file-- styles.css

```css
:root {
  --color-bg: #f7faf7;
  --color-surface: #ffffff;
  --color-text: #1c2b25;
  --color-muted: #5f6f68;
  --color-accent: #0f766e;
  --color-accent-soft: #ccfbf1;
  --color-line: #dbe5df;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-heading: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem 4rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.65;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

h1,
h2 {
  font-family: var(--font-heading);
  line-height: 1.15;
}

.article__hero {
  display: block;
  border-radius: 1rem;
}

.article__meta {
  margin-block: 1.25rem 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.article__title {
  margin-block: 0.25rem 1.5rem;
  font-size: clamp(2rem, 6vw, 2.75rem);
}

.story__figure img {
  display: block;
  border-radius: 0.75rem;
}

.story__figure figcaption {
  margin-block-start: 0.5rem;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.4;
}

.quote {
  background: var(--color-accent-soft);
  border-radius: 0 0.75rem 0.75rem 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
}

.quote__author {
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
}

.route {
  border-collapse: collapse;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.route th,
.route td {
  padding: 0.5rem 0.875rem;
  border-block-end: 1px solid var(--color-line);
  text-align: start;
}

.route th {
  background: var(--color-accent-soft);
}

.related-card {
  margin-block-start: 2.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 10px 30px rgb(28 43 37 / 0.08);
  transition: box-shadow 200ms ease;
}

.related-card:hover {
  box-shadow: 0 16px 40px rgb(28 43 37 / 0.16);
}

.related-card__label {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.related-card__title {
  margin-block: 0.25rem;
  font-size: 1.375rem;
}

.related-card__text {
  margin: 0;
  color: var(--color-muted);
}

/* Tvoje rozvržení článku */

.article {
  max-inline-size: 42rem;
  margin-inline: auto;
  overflow-wrap: anywhere;
}

.article__hero {
  inline-size: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.story {
  display: flow-root;
}

.story__figure {
  float: inline-start;
  inline-size: 45%;
  margin: 0;
  margin-inline-end: 1.25rem;
  margin-block-end: 0.5rem;
}

.story p {
  margin-block-start: 0;
}

.quote {
  margin-inline: 0;
  padding: 1rem 1.5rem;
  border-inline-start: 4px solid var(--color-accent);
}

.quote p {
  margin: 0;
}

.quote p + p {
  margin-block-start: 0.5rem;
}

.table-wrap {
  overflow-x: auto;
}

.related-card__title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

## --approach-- Starší zápis s clearfixem

Tak to najdeš ve starším kódu: fyzické strany, `float: left` a „clearfix", prázdný pseudoprvek s `clear: both` za obsahem sekce. Funguje stejně, jen potřebuje víc řádků a pseudoprvek, který nic neznamená. `overflow-wrap: break-word` stačí, protože odstavec s adresou není flex ani grid položka.

### --file-- styles.css

```css
:root {
  --color-bg: #f7faf7;
  --color-surface: #ffffff;
  --color-text: #1c2b25;
  --color-muted: #5f6f68;
  --color-accent: #0f766e;
  --color-accent-soft: #ccfbf1;
  --color-line: #dbe5df;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-heading: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem 4rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.65;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

h1,
h2 {
  font-family: var(--font-heading);
  line-height: 1.15;
}

.article__hero {
  display: block;
  border-radius: 1rem;
}

.article__meta {
  margin-block: 1.25rem 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.article__title {
  margin-block: 0.25rem 1.5rem;
  font-size: clamp(2rem, 6vw, 2.75rem);
}

.story__figure img {
  display: block;
  border-radius: 0.75rem;
}

.story__figure figcaption {
  margin-block-start: 0.5rem;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.4;
}

.quote {
  background: var(--color-accent-soft);
  border-radius: 0 0.75rem 0.75rem 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
}

.quote__author {
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
}

.route {
  border-collapse: collapse;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.route th,
.route td {
  padding: 0.5rem 0.875rem;
  border-block-end: 1px solid var(--color-line);
  text-align: start;
}

.route th {
  background: var(--color-accent-soft);
}

.related-card {
  margin-block-start: 2.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 10px 30px rgb(28 43 37 / 0.08);
  transition: box-shadow 200ms ease;
}

.related-card:hover {
  box-shadow: 0 16px 40px rgb(28 43 37 / 0.16);
}

.related-card__label {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.related-card__title {
  margin-block: 0.25rem;
  font-size: 1.375rem;
}

.related-card__text {
  margin: 0;
  color: var(--color-muted);
}

/* Tvoje rozvržení článku */

/* Starší zápis, který potkáš v cizím kódu. */
.article {
  max-width: 44rem;
  margin: 0 auto;
}

.article__hero {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.story__figure {
  float: left;
  width: 40%;
  margin: 0 1rem 0.5rem 0;
}

.story p {
  margin-top: 0;
}

/* Clearfix: prázdný pseudoprvek za obsahem sekce, který se postaví pod plovoucí fotku. */
.story::after {
  content: "";
  display: block;
  clear: both;
}

.article__link {
  overflow-wrap: break-word;
}

.quote {
  margin-left: 0;
  margin-right: 0;
  padding: 0.75rem 1.25rem;
  border-left: 4px solid var(--color-accent);
}

.quote p:first-child {
  margin-top: 0;
}

.quote p:last-child {
  margin-bottom: 0;
}

.table-wrap {
  overflow-x: scroll;
}

.related-card__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

# --review--

Testy kontrolují rozvržení. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Nikde jsi neschoval přetečení přes `overflow: hidden` na `body` nebo na článku.
- Úvodní fotka a fotka kola mají v HTML dál atributy `width` a `height`.
- Víš, proč sekce `.story` bez tvé opravy fotku neobalila a co přesně to opravilo.
- U nadpisu karty umíš vyjmenovat všechny čtyři podmínky pro tři tečky.
- Prošel jsi náhled v šířkách „Jako testy", 768 a 375 a nic nepřeteklo.

## --extensions--

Rozšíření bez testů: popisek doporučené karty zkrácený na dva řádky, druhá obtékaná fotka na konci řádku s `float: inline-end`, a na úzkém displeji fotka kola přes celou šířku bez obtékání (media dotazy přijdou v sekci Responzivní design, zkus si je dohledat v MDN).

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kolem Lipna na kole za dva dny — Toulky na kole</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <article class="article">
      <img class="article__hero" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Cdefs%3E%3ClinearGradient id='s' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23bae6fd'/%3E%3Cstop offset='1' stop-color='%23fef3c7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23s)'/%3E%3Ccircle cx='900' cy='230' r='90' fill='%23fde68a'/%3E%3Cpath d='M0 470 180 330 330 420 520 280 700 400 880 300 1200 460V800H0Z' fill='%2315803d' opacity='.55'/%3E%3Cpath d='M0 520 220 420 420 500 640 400 860 490 1200 420V800H0Z' fill='%23166534'/%3E%3Crect y='560' width='1200' height='240' fill='%230e7490'/%3E%3Cpath d='M0 600h1200M0 650h1200M0 710h1200' stroke='%2367e8f9' stroke-width='5' stroke-dasharray='60 40' opacity='.5'/%3E%3Cpath d='M560 600 640 450 640 600Z' fill='%23fff'/%3E%3Cpath d='M520 605h160l-25 30H545Z' fill='%237c2d12'/%3E%3C/svg%3E" width="1200" height="800" alt="Lipenské jezero s plachetnicí a zelenými kopci">
      <p class="article__meta">Toulky na kole · 12. září 2026 · 7 minut čtení</p>
      <h1 class="article__title">Kolem Lipna na kole za dva dny</h1>

      <section class="story">
        <figure class="story__figure">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='600'%3E%3Crect width='480' height='600' fill='%23fef9c3'/%3E%3Crect y='380' width='480' height='220' fill='%230e7490'/%3E%3Crect x='0' y='350' width='480' height='40' fill='%23a16207'/%3E%3Cg fill='none' stroke='%231f2937' stroke-width='12'%3E%3Ccircle cx='150' cy='290' r='60'/%3E%3Ccircle cx='330' cy='290' r='60'/%3E%3Cpath d='M150 290 220 200 300 200 330 290M220 200 250 290 300 200M200 170h50M300 200l10-40h30'/%3E%3C/g%3E%3Ccircle cx='380' cy='110' r='50' fill='%23fb923c'/%3E%3C/svg%3E" width="480" height="600" alt="Kolo opřené o zábradlí mola u jezera">
          <figcaption>Ráno na molu ve Frymburku, než se zvedl vítr.</figcaption>
        </figure>
        <p>Okruh kolem Lipenského jezera měří zhruba 110 kilometrů a vede skoro celý po cyklostezkách a klidných silnicích. Rozdělili jsme ho na dva dny s noclehem ve Frymburku a přívozem mezi Frymburkem a Frýdavou, který jezero zkrátí o dobrých dvacet kilometrů.</p>
      </section>

      <p>První den z Lipna nad Vltavou po jižním břehu je rovinatý a plný lidí. Druhý den po severním břehu přes Horní Planou je klidnější, ale čekají tě dvě delší stoupání.</p>

      <blockquote class="quote">
        <p>Přívoz ve Frymburku jede každou hodinu a kolo se veze za dvacet korun. Stojí za to počkat.</p>
        <p class="quote__author">Petra z půjčovny kol v Lipně</p>
      </blockquote>

      <h2>Trasa po úsecích</h2>
      <div class="table-wrap">
        <table class="route">
          <thead>
            <tr><th>Úsek</th><th>Délka</th><th>Převýšení</th><th>Povrch</th><th>Občerstvení</th><th>Obtížnost</th></tr>
          </thead>
          <tbody>
            <tr><td>Lipno nad Vltavou – Frymburk</td><td>28 km</td><td>210 m</td><td>asfalt, cyklostezka</td><td>Lipno, Přední Výtoň</td><td>snadná</td></tr>
            <tr><td>Frymburk – Horní Planá</td><td>34 km</td><td>480 m</td><td>asfalt, šotolina</td><td>Černá v Pošumaví</td><td>střední</td></tr>
            <tr><td>Horní Planá – Lipno nad Vltavou</td><td>46 km</td><td>390 m</td><td>asfalt</td><td>Horní Planá, Frymburk</td><td>střední</td></tr>
          </tbody>
        </table>
      </div>

      <p class="article__link">Stopu pro navigaci si stáhneš tady: https://www.toulkynakole.cz/trasy/lipno/okruh-kolem-lipenskeho-jezera-dva-dny-110km.gpx</p>

      <aside class="related-card">
        <p class="related-card__label">Mohlo by tě zajímat</p>
        <h2 class="related-card__title">Po Schwarzenberském plavebním kanálu z Nové Pece až k hranici s Rakouskem</h2>
        <p class="related-card__text">Jednodenní výlet podél kanálu, kterým se kdysi plavilo dříví do Vídně.</p>
      </aside>
    </article>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --color-bg: #f7faf7;
  --color-surface: #ffffff;
  --color-text: #1c2b25;
  --color-muted: #5f6f68;
  --color-accent: #0f766e;
  --color-accent-soft: #ccfbf1;
  --color-line: #dbe5df;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-heading: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem 4rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.65;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

h1,
h2 {
  font-family: var(--font-heading);
  line-height: 1.15;
}

.article__hero {
  display: block;
  border-radius: 1rem;
}

.article__meta {
  margin-block: 1.25rem 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.article__title {
  margin-block: 0.25rem 1.5rem;
  font-size: clamp(2rem, 6vw, 2.75rem);
}

.story__figure img {
  display: block;
  border-radius: 0.75rem;
}

.story__figure figcaption {
  margin-block-start: 0.5rem;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.4;
}

.quote {
  background: var(--color-accent-soft);
  border-radius: 0 0.75rem 0.75rem 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
}

.quote__author {
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
}

.route {
  border-collapse: collapse;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.route th,
.route td {
  padding: 0.5rem 0.875rem;
  border-block-end: 1px solid var(--color-line);
  text-align: start;
}

.route th {
  background: var(--color-accent-soft);
}

.related-card {
  margin-block-start: 2.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 10px 30px rgb(28 43 37 / 0.08);
  transition: box-shadow 200ms ease;
}

.related-card:hover {
  box-shadow: 0 16px 40px rgb(28 43 37 / 0.16);
}

.related-card__label {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.related-card__title {
  margin-block: 0.25rem;
  font-size: 1.375rem;
}

.related-card__text {
  margin: 0;
  color: var(--color-muted);
}

/* Tvoje rozvržení článku */
--edit--

--edit--
```

# --solution--

## --file-- styles.css

```css
:root {
  --color-bg: #f7faf7;
  --color-surface: #ffffff;
  --color-text: #1c2b25;
  --color-muted: #5f6f68;
  --color-accent: #0f766e;
  --color-accent-soft: #ccfbf1;
  --color-line: #dbe5df;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-heading: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem 4rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.65;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

h1,
h2 {
  font-family: var(--font-heading);
  line-height: 1.15;
}

.article__hero {
  display: block;
  border-radius: 1rem;
}

.article__meta {
  margin-block: 1.25rem 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.article__title {
  margin-block: 0.25rem 1.5rem;
  font-size: clamp(2rem, 6vw, 2.75rem);
}

.story__figure img {
  display: block;
  border-radius: 0.75rem;
}

.story__figure figcaption {
  margin-block-start: 0.5rem;
  color: var(--color-muted);
  font-size: 0.8125rem;
  line-height: 1.4;
}

.quote {
  background: var(--color-accent-soft);
  border-radius: 0 0.75rem 0.75rem 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
}

.quote__author {
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
}

.route {
  border-collapse: collapse;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.route th,
.route td {
  padding: 0.5rem 0.875rem;
  border-block-end: 1px solid var(--color-line);
  text-align: start;
}

.route th {
  background: var(--color-accent-soft);
}

.related-card {
  margin-block-start: 2.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 10px 30px rgb(28 43 37 / 0.08);
  transition: box-shadow 200ms ease;
}

.related-card:hover {
  box-shadow: 0 16px 40px rgb(28 43 37 / 0.16);
}

.related-card__label {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.related-card__title {
  margin-block: 0.25rem;
  font-size: 1.375rem;
}

.related-card__text {
  margin: 0;
  color: var(--color-muted);
}

/* Tvoje rozvržení článku */

.article {
  max-inline-size: 42rem;
  margin-inline: auto;
  overflow-wrap: anywhere;
}

.article__hero {
  inline-size: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.story {
  display: flow-root;
}

.story__figure {
  float: inline-start;
  inline-size: 45%;
  margin: 0;
  margin-inline-end: 1.25rem;
  margin-block-end: 0.5rem;
}

.story p {
  margin-block-start: 0;
}

.quote {
  margin-inline: 0;
  padding: 1rem 1.5rem;
  border-inline-start: 4px solid var(--color-accent);
}

.quote p {
  margin: 0;
}

.quote p + p {
  margin-block-start: 0.5rem;
}

.table-wrap {
  overflow-x: auto;
}

.related-card__title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
