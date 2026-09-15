---
title: Galerie s náhledem
see: css-pozicovani/workshop-rozbalovacka, css-pozicovani/workshop-lepici-lista, css-pozicovani/stacking-context#typicke-chyby-a-pasti
---

# --description--

Spolek pořádá fotosoutěž **Příroda Česka** a potřebuje stránku s oceněnými snímky, na které lidi hlasují. HTML je hotové a vzhled (barvy, písmo, štítky, stíny, zvětšení fotky při najetí) taky. Chybí rozvržení, polohy a vrstvy — všechno leží pod sebou a náhledy fotek jsou vidět na konci stránky.

Tentokrát bez návodu. Píšeš do `styles.css` a do `index.html` přidáváš atributy. Třídy a `id` v HTML nech, testy podle nich prvky hledají. **Téma, texty a vzhled jsou tvoje volba** — klidně z galerie udělej portfolio svých fotek, výběr receptů nebo katalog deskových her. Testy hlídají jen rozvržení, polohu, vrstvy a chování.

**Co má stránka umět:**

- Na počítači (šířka 1024 px) jsou fotky v mřížce **po třech vedle sebe**, stejně široké. Na tabletu (768 px) jsou aspoň dvě vedle sebe a na telefonu (375 px) stránka nejde posouvat do strany.
- Štítek ocenění („1. místo", „Cena poroty") leží **přes levý horní roh obrázku** a počet hlasů **přes pravý dolní roh**. Ani jeden nezabírá místo, takže obrázky i popisky v řadě začínají na stejné výšce.
- Když se obrázek při najetí myší nebo fokusu zvětší, štítek zůstane vidět nad ním.
- Lišta s filtry a tlačítkem Řadit se při rolování **drží u horní hrany okna** a fotky pod ní jedou schované — i se štítky a počty hlasů.
- Kliknutí na fotku otevře **její náhled** uprostřed okna. Náhled se zavře tlačítkem Zavřít, klávesou Esc i kliknutím mimo. Tlačítko Zavřít leží v pravém horním rohu náhledu a stránka za otevřeným náhledem je ztmavená.
- Tlačítko **Řadit** otevře nabídku řazení **pod sebou**, zarovnanou k jeho pravé hraně a celou v okně.

Průběžně kontroluj náhled v šířkách „Jako testy", 768 a 375 z přepínače nad náhledem — testy měří na stejných šířkách.

# --hints--

Na šířce 1024 px jsou první tři fotky vedle sebe v jedné řadě a stejně široké.

```js
const photos = [...document.querySelectorAll('.photo')].slice(0, 3).map((photo) => photo.getBoundingClientRect());
assert.equal(photos.length, 3, 'Galerie má mít aspoň tři fotky (.photo)');
for (let i = 1; i < 3; i++) {
  assert.ok(Math.abs(photos[i].top - photos[0].top) <= 1 && photos[i].left >= photos[i - 1].right, `Při šířce 1024 px má být ${i + 1}. fotka vpravo vedle předchozí ve stejné řadě`);
  assert.ok(Math.abs(photos[i].width - photos[0].width) <= 2, `Šířky prvních tří fotek jsou ${photos.map((p) => Math.round(p.width)).join(', ')} px — mají být stejné`);
}
```

Na šířce 768 px jsou aspoň dvě fotky vedle sebe a na šířce 375 px stránka nejde posouvat do strany.

```js
await helpers.resize(768);
const [first, second] = [...document.querySelectorAll('.photo')].map((photo) => photo.getBoundingClientRect());
assert.ok(Math.abs(second.top - first.top) <= 1 && second.left >= first.right, 'Při šířce 768 px mají být první dvě fotky vedle sebe');
await helpers.resize(375);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce 375 px je obsah široký ${root.scrollWidth} px, okno jen ${root.clientWidth} px`);
```

Štítek ocenění leží přes obrázek u jeho levého horního rohu, nejvýš 16 px od horní a levé hrany.

```js
const badges = [...document.querySelectorAll('.photo__badge')];
assert.ok(badges.length > 0, 'Galerie má mít aspoň jeden štítek ocenění (.photo__badge)');
for (const badge of badges) {
  const image = badge.closest('.photo').querySelector('.photo__open').getBoundingClientRect();
  const box = badge.getBoundingClientRect();
  const dx = box.left - image.left;
  const dy = box.top - image.top;
  assert.ok(dx >= 0 && dx <= 16 && dy >= 0 && dy <= 16, `Štítek „${badge.textContent.trim()}" je ${Math.round(dx)} px od levé a ${Math.round(dy)} px od horní hrany obrázku, čekám 0–16 px`);
}
```

Počet hlasů leží přes obrázek u jeho pravého dolního rohu, nejvýš 16 px od pravé a spodní hrany.

```js
for (const votes of document.querySelectorAll('.photo__votes')) {
  const image = votes.closest('.photo').querySelector('.photo__open').getBoundingClientRect();
  const box = votes.getBoundingClientRect();
  const dx = image.right - box.right;
  const dy = image.bottom - box.bottom;
  assert.ok(dx >= 0 && dx <= 16 && dy >= 0 && dy <= 16, `Počet hlasů je ${Math.round(dx)} px od pravé a ${Math.round(dy)} px od spodní hrany obrázku, čekám 0–16 px`);
}
```

Štítek ani počet hlasů nezabírají místo: obrázky v první řadě začínají na stejné výšce a popisek je nejvýš 16 px pod obrázkem.

```js
const photos = [...document.querySelectorAll('.photo')].slice(0, 3);
const tops = photos.map((photo) => photo.querySelector('.photo__open').getBoundingClientRect().top);
assert.ok(Math.max(...tops) - Math.min(...tops) <= 1, `Obrázky první řady začínají na ${tops.map(Math.round).join(', ')} px — mají být na stejné výšce`);
for (const photo of photos) {
  const image = photo.querySelector('.photo__open').getBoundingClientRect();
  const caption = photo.querySelector('.photo__caption').getBoundingClientRect();
  assert.ok(caption.top - image.bottom <= 16, `Popisek začíná ${Math.round(caption.top - image.bottom)} px pod obrázkem — počet hlasů nebo štítek pořád zabírá místo`);
}
```

Štítek je vidět nad obrázkem, i když je obrázek zvětšený.

```js
const badge = document.querySelector('.photo__badge');
badge.closest('.photo').querySelector('.photo__image').style.scale = '1.06';
document.getAnimations().forEach((animation) => animation.finish());
const box = badge.getBoundingClientRect();
const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
assert.ok(hit === badge || badge.contains(hit), `Uprostřed štítku je u zvětšeného obrázku navrchu ${hit?.className || hit?.tagName} — má tam být štítek`);
```

Lišta filtrů se po odrolování drží u horní hrany okna.

```js
const filters = document.querySelector('.filters');
const start = filters.getBoundingClientRect().top + window.scrollY;
window.scrollTo(0, start + 150);
assert.ok(Math.abs(window.scrollY - (start + 150)) <= 1, 'Stránka má jít odrolovat o 150 px pod lištu filtrů');
const box = filters.getBoundingClientRect();
assert.ok(Math.abs(box.top) <= 1, `Po odrolování začíná lišta filtrů na ${Math.round(box.top)} px, čekám 0 px`);
```

Fotky, štítky a počty hlasů, které jedou pod lištou filtrů, jsou pod ní schované.

```js
const filters = document.querySelector('.filters');
const frame = document.querySelector('.photo__badge').closest('.photo');
const image = frame.querySelector('.photo__open');
const start = filters.getBoundingClientRect().top + window.scrollY;
window.scrollTo(0, start + 1);
const bar = filters.getBoundingClientRect();
window.scrollBy(0, image.getBoundingClientRect().top - (bar.bottom - 30));
const barNow = filters.getBoundingClientRect();
const badge = frame.querySelector('.photo__badge').getBoundingClientRect();
const imageBox = image.getBoundingClientRect();
for (const [what, x] of [['obrázek', imageBox.left + imageBox.width / 2], ['štítek', badge.left + badge.width / 2]]) {
  const hit = document.elementFromPoint(x, barNow.bottom - 8);
  assert.ok(hit?.closest('.filters'), `V místě, kde ${what} jede pod lištou filtrů, je navrchu ${hit?.className || hit?.tagName} — má tam být lišta`);
}
```

Náhledy fotek jsou popovery `auto` a po načtení nejsou vidět.

```js
const previews = [...document.querySelectorAll('.preview')];
assert.ok(previews.length > 0, 'Stránka má mít náhledy fotek (.preview)');
previews.forEach((preview, i) => {
  assert.equal(preview.popover, 'auto', `${i + 1}. náhled má být popover s hodnotou auto`);
  assert.equal(preview.checkVisibility(), false, `${i + 1}. náhled má být po načtení skrytý`);
});
```

Kliknutí na fotku otevře její náhled a žádný jiný.

```js
const buttons = document.querySelectorAll('.photo__open');
const previews = [...document.querySelectorAll('.preview')];
await helpers.click(buttons[1]);
assert.ok(previews[1].matches(':popover-open'), 'Po kliknutí na druhou fotku má být otevřený druhý náhled');
assert.equal(previews.filter((preview) => preview.matches(':popover-open')).length, 1, 'Po kliknutí na fotku má být otevřený jen její náhled');
```

Tlačítko Zavřít v náhledu ho zavře.

```js
const preview = document.querySelectorAll('.preview')[2];
preview.showPopover();
await helpers.click(preview.querySelector('.preview__close'));
assert.ok(!preview.matches(':popover-open'), 'Po kliknutí na Zavřít má být třetí náhled zavřený');
```

Tlačítko Zavřít leží v pravém horním rohu náhledu, nejvýš 16 px od horní a pravé hrany.

```js
const preview = document.querySelector('.preview');
preview.showPopover();
const box = preview.getBoundingClientRect();
const close = preview.querySelector('.preview__close').getBoundingClientRect();
const dx = box.right - close.right;
const dy = close.top - box.top;
assert.ok(dx >= 0 && dx <= 16 && dy >= 0 && dy <= 16, `Tlačítko Zavřít je ${Math.round(dx)} px od pravé a ${Math.round(dy)} px od horní hrany náhledu, čekám 0–16 px`);
```

Za otevřeným náhledem je stránka ztmavená.

```js
const preview = document.querySelector('.preview');
preview.showPopover();
const color = getComputedStyle(preview, '::backdrop').backgroundColor;
const [r, g, b, a = 1] = color.match(/[\d.]+/g).map(Number);
assert.ok(a >= 0.2 && (r + g + b) / 3 < 128, `Pozadí za náhledem má barvu ${color} — má být tmavé a aspoň trochu neprůhledné`);
```

Tlačítko Řadit otevře nabídku řazení, která je po načtení skrytá.

```js
const menu = document.querySelector('.sort-menu');
assert.equal(menu.checkVisibility(), false, 'Nabídka řazení má být po načtení skrytá');
await helpers.click(document.querySelector('.filters__sort'));
assert.ok(menu.matches(':popover-open'), 'Po kliknutí na Řadit má být nabídka řazení otevřená');
```

Otevřená nabídka řazení leží pod tlačítkem Řadit (nejvýš 16 px pod ním), zarovnaná k jeho pravé hraně a celá v okně.

```js
await helpers.click(document.querySelector('.filters__sort'));
document.getAnimations().forEach((animation) => animation.finish());
const root = document.documentElement;
const button = document.querySelector('.filters__sort').getBoundingClientRect();
const menu = document.querySelector('.sort-menu').getBoundingClientRect();
assert.ok(menu.top >= button.bottom - 0.5 && menu.top <= button.bottom + 16, `Nabídka začíná ${Math.round(menu.top - button.bottom)} px pod tlačítkem Řadit, čekám 0–16 px`);
assert.ok(Math.abs(menu.right - button.right) <= 2, `Nabídka končí vpravo na ${Math.round(menu.right)} px, tlačítko na ${Math.round(button.right)} px`);
assert.ok(menu.left >= 0 && menu.right <= root.clientWidth, 'Nabídka řazení má být celá v okně');
```

# --help--

## --tip-- 6

Zvětšení přes `scale` dělá z obrázku vlastní vrstvu, která se kreslí jako pozicovaný prvek — a obrázek je v HTML až za štítkem. Kdo vyhraje mezi dvěma takovými vrstvami, najdeš v [Pořadí vykreslení](see:css-pozicovani/stacking-context#poradi-vykresleni).

## --tip-- 8

Lišta i fotky jsou pozicované a fotky jsou v HTML později. Lišta potřebuje vrstvu, která je nad fotkami i nad štítkem — pokud štítku dáš `z-index`, musí být lišta ještě výš. Viz [Škála z-index v tokenech](see:css-pozicovani/stacking-context#skala-z-index-v-tokenech).

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fotosoutěž Příroda Česka 2026</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <p class="site-header__eyebrow">Fotosoutěž · ročník 2026</p>
      <h1 class="site-header__title">Příroda Česka</h1>
      <p class="site-header__lead">Šest nejlepších snímků z 2 380 přihlášených. Hlasování veřejnosti končí 30. září.</p>
    </header>

    <main class="page">
      <div class="filters">
        <div class="filters__chips" role="group" aria-label="Kategorie">
          <button class="chip chip--active" type="button" aria-pressed="true">Vše</button>
          <button class="chip" type="button" aria-pressed="false">Krajina</button>
          <button class="chip" type="button" aria-pressed="false">Zvířata</button>
          <button class="chip" type="button" aria-pressed="false">Rostliny</button>
          <button class="chip" type="button" aria-pressed="false">Město</button>
        </div>
        <button class="filters__sort" type="button">Řadit: nejvíc hlasů</button>
      </div>

      <div class="sort-menu" id="sort-menu">
        <button class="sort-menu__item" type="button" aria-pressed="true">Nejvíc hlasů</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Nejnovější</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Podle autora</button>
      </div>

      <ul class="gallery">
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">1. místo</span>
              <button class="photo__open" type="button">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Mlha nad Labským kaňonem</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 412 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Mlha nad Labským kaňonem</strong> Tomáš Beneš · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena poroty</span>
              <button class="photo__open" type="button">
                <span class="photo__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></span>
                <span class="visually-hidden">Otevřít náhled: Rys na Šumavě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 388 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rys na Šumavě</strong> Klára Nováková · Zvířata</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button">
                <span class="photo__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Vřes na Kokořínsku</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 251 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Vřes na Kokořínsku</strong> Ondřej Svoboda · Rostliny</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Střechy Malé Strany v zimě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 197 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Střechy Malé Strany v zimě</strong> Lucie Dvořáková · Město</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena veřejnosti</span>
              <button class="photo__open" type="button">
                <span class="photo__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Rašeliniště v Jizerkách</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 356 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rašeliniště v Jizerkách</strong> Petr Horák · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button">
                <span class="photo__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></span>
                <span class="visually-hidden">Otevřít náhled: Včela na levanduli</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 143 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Včela na levanduli</strong> Eva Marešová · Zvířata</p>
          </li>
      </ul>

      <section class="rules" aria-labelledby="rules-title">
        <h2 id="rules-title">Jak hlasovat</h2>
        <p>Každý návštěvník může dát jeden hlas každé fotce. Hlasy se sčítají průběžně a vítěze ceny veřejnosti vyhlásíme 8. října na výstavě v Galerii Lucerna.</p>
        <p>Porota vybírala z 2 380 snímků ve čtyřech kategoriích. Hodnotila kompozici, práci se světlem a to, jak fotka vypráví o české přírodě.</p>
        <p>Všechny oceněné fotky uvidíš od 8. do 31. října ve velkém formátu na výstavě v pasáži Lucerna. Vstup je zdarma.</p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Fotosoutěž Příroda Česka pořádá spolek Zelená stopa ve spolupráci s Českou společností ornitologickou.</p>
    </footer>

    <div class="preview" id="preview-1">
      <div class="preview__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Mlha nad Labským kaňonem</h2>
        <p class="preview__author">Tomáš Beneš · Krajina · 412 hlasů</p>
      </div>
      <button class="preview__close" type="button">Zavřít</button>
    </div>

    <div class="preview" id="preview-2">
      <div class="preview__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rys na Šumavě</h2>
        <p class="preview__author">Klára Nováková · Zvířata · 388 hlasů</p>
      </div>
      <button class="preview__close" type="button">Zavřít</button>
    </div>

    <div class="preview" id="preview-3">
      <div class="preview__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Vřes na Kokořínsku</h2>
        <p class="preview__author">Ondřej Svoboda · Rostliny · 251 hlasů</p>
      </div>
      <button class="preview__close" type="button">Zavřít</button>
    </div>

    <div class="preview" id="preview-4">
      <div class="preview__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Střechy Malé Strany v zimě</h2>
        <p class="preview__author">Lucie Dvořáková · Město · 197 hlasů</p>
      </div>
      <button class="preview__close" type="button">Zavřít</button>
    </div>

    <div class="preview" id="preview-5">
      <div class="preview__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rašeliniště v Jizerkách</h2>
        <p class="preview__author">Petr Horák · Krajina · 356 hlasů</p>
      </div>
      <button class="preview__close" type="button">Zavřít</button>
    </div>

    <div class="preview" id="preview-6">
      <div class="preview__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Včela na levanduli</h2>
        <p class="preview__author">Eva Marešová · Zvířata · 143 hlasů</p>
      </div>
      <button class="preview__close" type="button">Zavřít</button>
    </div>
  </body>
</html>
```

## --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --color-bg: #f4f6f2;
  --color-surface: #ffffff;
  --color-text: #17221b;
  --color-muted: #5d6b62;
  --color-line: #dde3dc;
  --color-accent: #2f7d4f;
  --color-gold: #f2b233;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(23 34 27 / 0.06), 0 16px 32px -20px rgb(23 34 27 / 0.45);
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

button {
  font: inherit;
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  max-width: 68rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 1.5rem;
}

.site-header__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-header__title {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.site-header__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.page {
  max-width: 68rem;
  margin-inline: auto;
  padding: 0 1.5rem 4rem;
}

/* ===== Filtry ===== */

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-inline: -1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgb(244 246 242 / 0.94);
  border-bottom: 1px solid var(--color-line);
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip,
.filters__sort {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-surface);
  font-weight: 600;
  cursor: pointer;
}

.chip--active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: #fff;
}

.chip:hover,
.chip:focus-visible,
.filters__sort:hover,
.filters__sort:focus-visible {
  border-color: var(--color-text);
}

/* ===== Nabídka řazení ===== */

.sort-menu {
  min-width: 12rem;
  padding: 0.375rem;
  border: 1px solid var(--color-line);
  border-radius: 0.75rem;
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.sort-menu__item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: none;
  text-align: start;
  cursor: pointer;
}

.sort-menu__item:hover,
.sort-menu__item:focus-visible {
  background: var(--color-bg);
}

.sort-menu__item[aria-pressed="true"] {
  color: var(--color-accent);
  font-weight: 700;
}

/* ===== Galerie ===== */

.gallery {
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.photo__open {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--radius);
  overflow: hidden;
  background: none;
  box-shadow: var(--shadow);
  cursor: zoom-in;
}

.photo__open:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.photo__image {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--photo);
  /* zvětšení při najetí a fokusu (transition a scale, víc v sekci css-animace) */
  transition: scale 0.35s ease;
}

.photo:is(:hover, :focus-within) .photo__image {
  scale: 1.06;
}

.photo__badge {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-gold);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 6px 14px -6px rgb(0 0 0 / 0.5);
}

.photo__votes {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: rgb(23 34 27 / 0.72);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

.photo__caption {
  margin: 0.75rem 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.photo__caption strong {
  display: block;
  color: var(--color-text);
  font-size: 1rem;
}

/* ===== Pravidla ===== */

.rules {
  max-width: 40rem;
  margin-top: 3rem;
}

.rules h2 {
  margin: 0 0 0.5rem;
}

.site-footer {
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

/* ===== Náhled ===== */

.preview {
  width: min(52rem, 100% - 2rem);
  padding: 0;
  border: 0;
  border-radius: 1.25rem;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.6);
}

.preview__image {
  aspect-ratio: 16 / 9;
  background: var(--photo);
}

.preview__text {
  padding: 1rem 1.25rem 1.25rem;
}

.preview__title {
  margin: 0;
  font-size: 1.375rem;
}

.preview__author {
  margin: 0.125rem 0 0;
  color: var(--color-muted);
}

.preview__close {
  padding: 0.375rem 0.875rem;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.9);
  font-weight: 700;
  cursor: pointer;
}
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fotosoutěž Příroda Česka 2026</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <p class="site-header__eyebrow">Fotosoutěž · ročník 2026</p>
      <h1 class="site-header__title">Příroda Česka</h1>
      <p class="site-header__lead">Šest nejlepších snímků z 2 380 přihlášených. Hlasování veřejnosti končí 30. září.</p>
    </header>

    <main class="page">
      <div class="filters">
        <div class="filters__chips" role="group" aria-label="Kategorie">
          <button class="chip chip--active" type="button" aria-pressed="true">Vše</button>
          <button class="chip" type="button" aria-pressed="false">Krajina</button>
          <button class="chip" type="button" aria-pressed="false">Zvířata</button>
          <button class="chip" type="button" aria-pressed="false">Rostliny</button>
          <button class="chip" type="button" aria-pressed="false">Město</button>
        </div>
        <button class="filters__sort" type="button" popovertarget="sort-menu">Řadit: nejvíc hlasů</button>
      </div>

      <div class="sort-menu" id="sort-menu" popover>
        <button class="sort-menu__item" type="button" aria-pressed="true">Nejvíc hlasů</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Nejnovější</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Podle autora</button>
      </div>

      <ul class="gallery">
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">1. místo</span>
              <button class="photo__open" type="button" popovertarget="preview-1">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Mlha nad Labským kaňonem</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 412 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Mlha nad Labským kaňonem</strong> Tomáš Beneš · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena poroty</span>
              <button class="photo__open" type="button" popovertarget="preview-2">
                <span class="photo__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></span>
                <span class="visually-hidden">Otevřít náhled: Rys na Šumavě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 388 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rys na Šumavě</strong> Klára Nováková · Zvířata</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-3">
                <span class="photo__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Vřes na Kokořínsku</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 251 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Vřes na Kokořínsku</strong> Ondřej Svoboda · Rostliny</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-4">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Střechy Malé Strany v zimě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 197 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Střechy Malé Strany v zimě</strong> Lucie Dvořáková · Město</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena veřejnosti</span>
              <button class="photo__open" type="button" popovertarget="preview-5">
                <span class="photo__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Rašeliniště v Jizerkách</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 356 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rašeliniště v Jizerkách</strong> Petr Horák · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-6">
                <span class="photo__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></span>
                <span class="visually-hidden">Otevřít náhled: Včela na levanduli</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 143 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Včela na levanduli</strong> Eva Marešová · Zvířata</p>
          </li>
      </ul>

      <section class="rules" aria-labelledby="rules-title">
        <h2 id="rules-title">Jak hlasovat</h2>
        <p>Každý návštěvník může dát jeden hlas každé fotce. Hlasy se sčítají průběžně a vítěze ceny veřejnosti vyhlásíme 8. října na výstavě v Galerii Lucerna.</p>
        <p>Porota vybírala z 2 380 snímků ve čtyřech kategoriích. Hodnotila kompozici, práci se světlem a to, jak fotka vypráví o české přírodě.</p>
        <p>Všechny oceněné fotky uvidíš od 8. do 31. října ve velkém formátu na výstavě v pasáži Lucerna. Vstup je zdarma.</p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Fotosoutěž Příroda Česka pořádá spolek Zelená stopa ve spolupráci s Českou společností ornitologickou.</p>
    </footer>

    <div class="preview" id="preview-1" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Mlha nad Labským kaňonem</h2>
        <p class="preview__author">Tomáš Beneš · Krajina · 412 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-1" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-2" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rys na Šumavě</h2>
        <p class="preview__author">Klára Nováková · Zvířata · 388 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-2" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-3" popover>
      <div class="preview__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Vřes na Kokořínsku</h2>
        <p class="preview__author">Ondřej Svoboda · Rostliny · 251 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-3" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-4" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Střechy Malé Strany v zimě</h2>
        <p class="preview__author">Lucie Dvořáková · Město · 197 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-4" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-5" popover>
      <div class="preview__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rašeliniště v Jizerkách</h2>
        <p class="preview__author">Petr Horák · Krajina · 356 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-5" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-6" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Včela na levanduli</h2>
        <p class="preview__author">Eva Marešová · Zvířata · 143 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-6" popovertargetaction="hide">Zavřít</button>
    </div>
  </body>
</html>
```

## --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --color-bg: #f4f6f2;
  --color-surface: #ffffff;
  --color-text: #17221b;
  --color-muted: #5d6b62;
  --color-line: #dde3dc;
  --color-accent: #2f7d4f;
  --color-gold: #f2b233;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(23 34 27 / 0.06), 0 16px 32px -20px rgb(23 34 27 / 0.45);
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

button {
  font: inherit;
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  max-width: 68rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 1.5rem;
}

.site-header__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-header__title {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.site-header__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.page {
  max-width: 68rem;
  margin-inline: auto;
  padding: 0 1.5rem 4rem;
}

/* ===== Filtry ===== */

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-inline: -1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgb(244 246 242 / 0.94);
  border-bottom: 1px solid var(--color-line);
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip,
.filters__sort {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-surface);
  font-weight: 600;
  cursor: pointer;
}

.chip--active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: #fff;
}

.chip:hover,
.chip:focus-visible,
.filters__sort:hover,
.filters__sort:focus-visible {
  border-color: var(--color-text);
}

/* ===== Nabídka řazení ===== */

.sort-menu {
  min-width: 12rem;
  padding: 0.375rem;
  border: 1px solid var(--color-line);
  border-radius: 0.75rem;
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.sort-menu__item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: none;
  text-align: start;
  cursor: pointer;
}

.sort-menu__item:hover,
.sort-menu__item:focus-visible {
  background: var(--color-bg);
}

.sort-menu__item[aria-pressed="true"] {
  color: var(--color-accent);
  font-weight: 700;
}

/* ===== Galerie ===== */

.gallery {
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.photo__open {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--radius);
  overflow: hidden;
  background: none;
  box-shadow: var(--shadow);
  cursor: zoom-in;
}

.photo__open:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.photo__image {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--photo);
  /* zvětšení při najetí a fokusu (transition a scale, víc v sekci css-animace) */
  transition: scale 0.35s ease;
}

.photo:is(:hover, :focus-within) .photo__image {
  scale: 1.06;
}

.photo__badge {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-gold);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 6px 14px -6px rgb(0 0 0 / 0.5);
}

.photo__votes {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: rgb(23 34 27 / 0.72);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

.photo__caption {
  margin: 0.75rem 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.photo__caption strong {
  display: block;
  color: var(--color-text);
  font-size: 1rem;
}

/* ===== Pravidla ===== */

.rules {
  max-width: 40rem;
  margin-top: 3rem;
}

.rules h2 {
  margin: 0 0 0.5rem;
}

.site-footer {
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

/* ===== Náhled ===== */

.preview {
  width: min(52rem, 100% - 2rem);
  padding: 0;
  border: 0;
  border-radius: 1.25rem;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.6);
}

.preview__image {
  aspect-ratio: 16 / 9;
  background: var(--photo);
}

.preview__text {
  padding: 1rem 1.25rem 1.25rem;
}

.preview__title {
  margin: 0;
  font-size: 1.375rem;
}

.preview__author {
  margin: 0.125rem 0 0;
  color: var(--color-muted);
}

.preview__close {
  padding: 0.375rem 0.875rem;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.9);
  font-weight: 700;
  cursor: pointer;
}

/* ===== Rozvržení a vrstvy ===== */

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 2rem 1.5rem;
}

.filters {
  position: sticky;
  top: 0;
  z-index: 2;
}

.photo__frame {
  position: relative;
}

.photo__badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
}

.photo__votes {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
}

/* ===== Popovery ===== */

.filters__sort {
  anchor-name: --sort;
}

.sort-menu {
  position-anchor: --sort;
  position-area: bottom span-left;
  margin-top: 0.5rem;
}

.preview::backdrop {
  background: rgb(10 20 14 / 0.72);
}

.preview__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}
```

# --approaches--

## --approach-- Mřížka auto-fill a position-area

Počet sloupců si mřížka spočítá sama z nejmenší šířky karty, takže stačí jedno pravidlo bez media dotazu. Nabídku řazení posadí `position-area` do buňky pod tlačítkem. Štítek dostane `z-index`, aby se dostal nad zvětšený obrázek, a lišta filtrů ještě vyšší vrstvu.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fotosoutěž Příroda Česka 2026</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <p class="site-header__eyebrow">Fotosoutěž · ročník 2026</p>
      <h1 class="site-header__title">Příroda Česka</h1>
      <p class="site-header__lead">Šest nejlepších snímků z 2 380 přihlášených. Hlasování veřejnosti končí 30. září.</p>
    </header>

    <main class="page">
      <div class="filters">
        <div class="filters__chips" role="group" aria-label="Kategorie">
          <button class="chip chip--active" type="button" aria-pressed="true">Vše</button>
          <button class="chip" type="button" aria-pressed="false">Krajina</button>
          <button class="chip" type="button" aria-pressed="false">Zvířata</button>
          <button class="chip" type="button" aria-pressed="false">Rostliny</button>
          <button class="chip" type="button" aria-pressed="false">Město</button>
        </div>
        <button class="filters__sort" type="button" popovertarget="sort-menu">Řadit: nejvíc hlasů</button>
      </div>

      <div class="sort-menu" id="sort-menu" popover>
        <button class="sort-menu__item" type="button" aria-pressed="true">Nejvíc hlasů</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Nejnovější</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Podle autora</button>
      </div>

      <ul class="gallery">
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">1. místo</span>
              <button class="photo__open" type="button" popovertarget="preview-1">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Mlha nad Labským kaňonem</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 412 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Mlha nad Labským kaňonem</strong> Tomáš Beneš · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena poroty</span>
              <button class="photo__open" type="button" popovertarget="preview-2">
                <span class="photo__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></span>
                <span class="visually-hidden">Otevřít náhled: Rys na Šumavě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 388 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rys na Šumavě</strong> Klára Nováková · Zvířata</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-3">
                <span class="photo__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Vřes na Kokořínsku</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 251 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Vřes na Kokořínsku</strong> Ondřej Svoboda · Rostliny</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-4">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Střechy Malé Strany v zimě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 197 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Střechy Malé Strany v zimě</strong> Lucie Dvořáková · Město</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena veřejnosti</span>
              <button class="photo__open" type="button" popovertarget="preview-5">
                <span class="photo__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Rašeliniště v Jizerkách</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 356 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rašeliniště v Jizerkách</strong> Petr Horák · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-6">
                <span class="photo__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></span>
                <span class="visually-hidden">Otevřít náhled: Včela na levanduli</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 143 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Včela na levanduli</strong> Eva Marešová · Zvířata</p>
          </li>
      </ul>

      <section class="rules" aria-labelledby="rules-title">
        <h2 id="rules-title">Jak hlasovat</h2>
        <p>Každý návštěvník může dát jeden hlas každé fotce. Hlasy se sčítají průběžně a vítěze ceny veřejnosti vyhlásíme 8. října na výstavě v Galerii Lucerna.</p>
        <p>Porota vybírala z 2 380 snímků ve čtyřech kategoriích. Hodnotila kompozici, práci se světlem a to, jak fotka vypráví o české přírodě.</p>
        <p>Všechny oceněné fotky uvidíš od 8. do 31. října ve velkém formátu na výstavě v pasáži Lucerna. Vstup je zdarma.</p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Fotosoutěž Příroda Česka pořádá spolek Zelená stopa ve spolupráci s Českou společností ornitologickou.</p>
    </footer>

    <div class="preview" id="preview-1" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Mlha nad Labským kaňonem</h2>
        <p class="preview__author">Tomáš Beneš · Krajina · 412 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-1" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-2" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rys na Šumavě</h2>
        <p class="preview__author">Klára Nováková · Zvířata · 388 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-2" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-3" popover>
      <div class="preview__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Vřes na Kokořínsku</h2>
        <p class="preview__author">Ondřej Svoboda · Rostliny · 251 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-3" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-4" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Střechy Malé Strany v zimě</h2>
        <p class="preview__author">Lucie Dvořáková · Město · 197 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-4" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-5" popover>
      <div class="preview__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rašeliniště v Jizerkách</h2>
        <p class="preview__author">Petr Horák · Krajina · 356 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-5" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-6" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Včela na levanduli</h2>
        <p class="preview__author">Eva Marešová · Zvířata · 143 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-6" popovertargetaction="hide">Zavřít</button>
    </div>
  </body>
</html>
```

### --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --color-bg: #f4f6f2;
  --color-surface: #ffffff;
  --color-text: #17221b;
  --color-muted: #5d6b62;
  --color-line: #dde3dc;
  --color-accent: #2f7d4f;
  --color-gold: #f2b233;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(23 34 27 / 0.06), 0 16px 32px -20px rgb(23 34 27 / 0.45);
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

button {
  font: inherit;
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  max-width: 68rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 1.5rem;
}

.site-header__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-header__title {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.site-header__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.page {
  max-width: 68rem;
  margin-inline: auto;
  padding: 0 1.5rem 4rem;
}

/* ===== Filtry ===== */

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-inline: -1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgb(244 246 242 / 0.94);
  border-bottom: 1px solid var(--color-line);
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip,
.filters__sort {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-surface);
  font-weight: 600;
  cursor: pointer;
}

.chip--active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: #fff;
}

.chip:hover,
.chip:focus-visible,
.filters__sort:hover,
.filters__sort:focus-visible {
  border-color: var(--color-text);
}

/* ===== Nabídka řazení ===== */

.sort-menu {
  min-width: 12rem;
  padding: 0.375rem;
  border: 1px solid var(--color-line);
  border-radius: 0.75rem;
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.sort-menu__item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: none;
  text-align: start;
  cursor: pointer;
}

.sort-menu__item:hover,
.sort-menu__item:focus-visible {
  background: var(--color-bg);
}

.sort-menu__item[aria-pressed="true"] {
  color: var(--color-accent);
  font-weight: 700;
}

/* ===== Galerie ===== */

.gallery {
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.photo__open {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--radius);
  overflow: hidden;
  background: none;
  box-shadow: var(--shadow);
  cursor: zoom-in;
}

.photo__open:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.photo__image {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--photo);
  /* zvětšení při najetí a fokusu (transition a scale, víc v sekci css-animace) */
  transition: scale 0.35s ease;
}

.photo:is(:hover, :focus-within) .photo__image {
  scale: 1.06;
}

.photo__badge {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-gold);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 6px 14px -6px rgb(0 0 0 / 0.5);
}

.photo__votes {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: rgb(23 34 27 / 0.72);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

.photo__caption {
  margin: 0.75rem 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.photo__caption strong {
  display: block;
  color: var(--color-text);
  font-size: 1rem;
}

/* ===== Pravidla ===== */

.rules {
  max-width: 40rem;
  margin-top: 3rem;
}

.rules h2 {
  margin: 0 0 0.5rem;
}

.site-footer {
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

/* ===== Náhled ===== */

.preview {
  width: min(52rem, 100% - 2rem);
  padding: 0;
  border: 0;
  border-radius: 1.25rem;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.6);
}

.preview__image {
  aspect-ratio: 16 / 9;
  background: var(--photo);
}

.preview__text {
  padding: 1rem 1.25rem 1.25rem;
}

.preview__title {
  margin: 0;
  font-size: 1.375rem;
}

.preview__author {
  margin: 0.125rem 0 0;
  color: var(--color-muted);
}

.preview__close {
  padding: 0.375rem 0.875rem;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.9);
  font-weight: 700;
  cursor: pointer;
}

/* ===== Rozvržení a vrstvy ===== */

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 2rem 1.5rem;
}

.filters {
  position: sticky;
  top: 0;
  z-index: 2;
}

.photo__frame {
  position: relative;
}

.photo__badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
}

.photo__votes {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
}

/* ===== Popovery ===== */

.filters__sort {
  anchor-name: --sort;
}

.sort-menu {
  position-anchor: --sort;
  position-area: bottom span-left;
  margin-top: 0.5rem;
}

.preview::backdrop {
  background: rgb(10 20 14 / 0.72);
}

.preview__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}
```

## --approach-- Media dotazy, zkratka inset a funkce anchor()

Sloupce přepínají dva media dotazy, takže přesně víš, kdy se galerie změní. Polohy štítků píše zkratka `inset` a nabídku řazení posadí `anchor()` — hodí se, když potřebuješ přesnou vzdálenost od konkrétní hrany kotvy místo buňky mřížky.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fotosoutěž Příroda Česka 2026</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <p class="site-header__eyebrow">Fotosoutěž · ročník 2026</p>
      <h1 class="site-header__title">Příroda Česka</h1>
      <p class="site-header__lead">Šest nejlepších snímků z 2 380 přihlášených. Hlasování veřejnosti končí 30. září.</p>
    </header>

    <main class="page">
      <div class="filters">
        <div class="filters__chips" role="group" aria-label="Kategorie">
          <button class="chip chip--active" type="button" aria-pressed="true">Vše</button>
          <button class="chip" type="button" aria-pressed="false">Krajina</button>
          <button class="chip" type="button" aria-pressed="false">Zvířata</button>
          <button class="chip" type="button" aria-pressed="false">Rostliny</button>
          <button class="chip" type="button" aria-pressed="false">Město</button>
        </div>
        <button class="filters__sort" type="button" popovertarget="sort-menu">Řadit: nejvíc hlasů</button>
      </div>

      <div class="sort-menu" id="sort-menu" popover>
        <button class="sort-menu__item" type="button" aria-pressed="true">Nejvíc hlasů</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Nejnovější</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Podle autora</button>
      </div>

      <ul class="gallery">
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">1. místo</span>
              <button class="photo__open" type="button" popovertarget="preview-1">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Mlha nad Labským kaňonem</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 412 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Mlha nad Labským kaňonem</strong> Tomáš Beneš · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena poroty</span>
              <button class="photo__open" type="button" popovertarget="preview-2">
                <span class="photo__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></span>
                <span class="visually-hidden">Otevřít náhled: Rys na Šumavě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 388 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rys na Šumavě</strong> Klára Nováková · Zvířata</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-3">
                <span class="photo__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Vřes na Kokořínsku</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 251 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Vřes na Kokořínsku</strong> Ondřej Svoboda · Rostliny</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-4">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Střechy Malé Strany v zimě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 197 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Střechy Malé Strany v zimě</strong> Lucie Dvořáková · Město</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <span class="photo__badge">Cena veřejnosti</span>
              <button class="photo__open" type="button" popovertarget="preview-5">
                <span class="photo__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Rašeliniště v Jizerkách</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 356 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rašeliniště v Jizerkách</strong> Petr Horák · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-6">
                <span class="photo__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></span>
                <span class="visually-hidden">Otevřít náhled: Včela na levanduli</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 143 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Včela na levanduli</strong> Eva Marešová · Zvířata</p>
          </li>
      </ul>

      <section class="rules" aria-labelledby="rules-title">
        <h2 id="rules-title">Jak hlasovat</h2>
        <p>Každý návštěvník může dát jeden hlas každé fotce. Hlasy se sčítají průběžně a vítěze ceny veřejnosti vyhlásíme 8. října na výstavě v Galerii Lucerna.</p>
        <p>Porota vybírala z 2 380 snímků ve čtyřech kategoriích. Hodnotila kompozici, práci se světlem a to, jak fotka vypráví o české přírodě.</p>
        <p>Všechny oceněné fotky uvidíš od 8. do 31. října ve velkém formátu na výstavě v pasáži Lucerna. Vstup je zdarma.</p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Fotosoutěž Příroda Česka pořádá spolek Zelená stopa ve spolupráci s Českou společností ornitologickou.</p>
    </footer>

    <div class="preview" id="preview-1" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Mlha nad Labským kaňonem</h2>
        <p class="preview__author">Tomáš Beneš · Krajina · 412 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-1" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-2" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rys na Šumavě</h2>
        <p class="preview__author">Klára Nováková · Zvířata · 388 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-2" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-3" popover>
      <div class="preview__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Vřes na Kokořínsku</h2>
        <p class="preview__author">Ondřej Svoboda · Rostliny · 251 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-3" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-4" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Střechy Malé Strany v zimě</h2>
        <p class="preview__author">Lucie Dvořáková · Město · 197 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-4" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-5" popover>
      <div class="preview__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rašeliniště v Jizerkách</h2>
        <p class="preview__author">Petr Horák · Krajina · 356 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-5" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-6" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Včela na levanduli</h2>
        <p class="preview__author">Eva Marešová · Zvířata · 143 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-6" popovertargetaction="hide">Zavřít</button>
    </div>
  </body>
</html>
```

### --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --color-bg: #f4f6f2;
  --color-surface: #ffffff;
  --color-text: #17221b;
  --color-muted: #5d6b62;
  --color-line: #dde3dc;
  --color-accent: #2f7d4f;
  --color-gold: #f2b233;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(23 34 27 / 0.06), 0 16px 32px -20px rgb(23 34 27 / 0.45);
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

button {
  font: inherit;
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  max-width: 68rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 1.5rem;
}

.site-header__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-header__title {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.site-header__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.page {
  max-width: 68rem;
  margin-inline: auto;
  padding: 0 1.5rem 4rem;
}

/* ===== Filtry ===== */

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-inline: -1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgb(244 246 242 / 0.94);
  border-bottom: 1px solid var(--color-line);
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip,
.filters__sort {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-surface);
  font-weight: 600;
  cursor: pointer;
}

.chip--active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: #fff;
}

.chip:hover,
.chip:focus-visible,
.filters__sort:hover,
.filters__sort:focus-visible {
  border-color: var(--color-text);
}

/* ===== Nabídka řazení ===== */

.sort-menu {
  min-width: 12rem;
  padding: 0.375rem;
  border: 1px solid var(--color-line);
  border-radius: 0.75rem;
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.sort-menu__item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: none;
  text-align: start;
  cursor: pointer;
}

.sort-menu__item:hover,
.sort-menu__item:focus-visible {
  background: var(--color-bg);
}

.sort-menu__item[aria-pressed="true"] {
  color: var(--color-accent);
  font-weight: 700;
}

/* ===== Galerie ===== */

.gallery {
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.photo__open {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--radius);
  overflow: hidden;
  background: none;
  box-shadow: var(--shadow);
  cursor: zoom-in;
}

.photo__open:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.photo__image {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--photo);
  /* zvětšení při najetí a fokusu (transition a scale, víc v sekci css-animace) */
  transition: scale 0.35s ease;
}

.photo:is(:hover, :focus-within) .photo__image {
  scale: 1.06;
}

.photo__badge {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-gold);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 6px 14px -6px rgb(0 0 0 / 0.5);
}

.photo__votes {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: rgb(23 34 27 / 0.72);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

.photo__caption {
  margin: 0.75rem 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.photo__caption strong {
  display: block;
  color: var(--color-text);
  font-size: 1rem;
}

/* ===== Pravidla ===== */

.rules {
  max-width: 40rem;
  margin-top: 3rem;
}

.rules h2 {
  margin: 0 0 0.5rem;
}

.site-footer {
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

/* ===== Náhled ===== */

.preview {
  width: min(52rem, 100% - 2rem);
  padding: 0;
  border: 0;
  border-radius: 1.25rem;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.6);
}

.preview__image {
  aspect-ratio: 16 / 9;
  background: var(--photo);
}

.preview__text {
  padding: 1rem 1.25rem 1.25rem;
}

.preview__title {
  margin: 0;
  font-size: 1.375rem;
}

.preview__author {
  margin: 0.125rem 0 0;
  color: var(--color-muted);
}

.preview__close {
  padding: 0.375rem 0.875rem;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.9);
  font-weight: 700;
  cursor: pointer;
}

/* ===== Rozvržení a vrstvy ===== */

.gallery {
  display: grid;
  gap: 1.5rem;
}

@media (width >= 40rem) {
  .gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 60rem) {
  .gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.filters {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
}

.photo__frame {
  position: relative;
}

.photo__badge {
  position: absolute;
  inset: 0.75rem auto auto 0.75rem;
  z-index: 1;
}

.photo__votes {
  position: absolute;
  inset: auto 0.75rem 0.75rem auto;
}

/* ===== Popovery ===== */

.filters__sort {
  anchor-name: --sort;
}

.sort-menu {
  position-anchor: --sort;
  inset: auto;
  top: calc(anchor(bottom) + 0.5rem);
  right: anchor(right);
  margin: 0;
}

.preview::backdrop {
  background: rgb(0 0 0 / 0.6);
}

.preview__close {
  position: absolute;
  inset: 1rem 1rem auto auto;
}
```

## --approach-- Pořadí v HTML místo z-index

Štítek je v HTML až za obrázkem, a tak ho zvětšený obrázek nepřekryje ani bez `z-index` — rozhoduje pořadí vykreslení. Lišta filtrů pak vystačí s nejnižší vrstvou. Nabídka řazení má navíc záložní polohu nad tlačítkem pro případ, že by lišta skončila u spodního okraje okna.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fotosoutěž Příroda Česka 2026</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <p class="site-header__eyebrow">Fotosoutěž · ročník 2026</p>
      <h1 class="site-header__title">Příroda Česka</h1>
      <p class="site-header__lead">Šest nejlepších snímků z 2 380 přihlášených. Hlasování veřejnosti končí 30. září.</p>
    </header>

    <main class="page">
      <div class="filters">
        <div class="filters__chips" role="group" aria-label="Kategorie">
          <button class="chip chip--active" type="button" aria-pressed="true">Vše</button>
          <button class="chip" type="button" aria-pressed="false">Krajina</button>
          <button class="chip" type="button" aria-pressed="false">Zvířata</button>
          <button class="chip" type="button" aria-pressed="false">Rostliny</button>
          <button class="chip" type="button" aria-pressed="false">Město</button>
        </div>
        <button class="filters__sort" type="button" popovertarget="sort-menu">Řadit: nejvíc hlasů</button>
      </div>

      <div class="sort-menu" id="sort-menu" popover>
        <button class="sort-menu__item" type="button" aria-pressed="true">Nejvíc hlasů</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Nejnovější</button>
        <button class="sort-menu__item" type="button" aria-pressed="false">Podle autora</button>
      </div>

      <ul class="gallery">
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-1">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Mlha nad Labským kaňonem</span>
              </button>
              <span class="photo__badge">1. místo</span>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 412 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Mlha nad Labským kaňonem</strong> Tomáš Beneš · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-2">
                <span class="photo__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></span>
                <span class="visually-hidden">Otevřít náhled: Rys na Šumavě</span>
              </button>
              <span class="photo__badge">Cena poroty</span>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 388 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rys na Šumavě</strong> Klára Nováková · Zvířata</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-3">
                <span class="photo__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Vřes na Kokořínsku</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 251 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Vřes na Kokořínsku</strong> Ondřej Svoboda · Rostliny</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-4">
                <span class="photo__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Střechy Malé Strany v zimě</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 197 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Střechy Malé Strany v zimě</strong> Lucie Dvořáková · Město</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-5">
                <span class="photo__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></span>
                <span class="visually-hidden">Otevřít náhled: Rašeliniště v Jizerkách</span>
              </button>
              <span class="photo__badge">Cena veřejnosti</span>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 356 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Rašeliniště v Jizerkách</strong> Petr Horák · Krajina</p>
          </li>
          <li class="photo">
            <div class="photo__frame">
              <button class="photo__open" type="button" popovertarget="preview-6">
                <span class="photo__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></span>
                <span class="visually-hidden">Otevřít náhled: Včela na levanduli</span>
              </button>
              <span class="photo__votes"><span aria-hidden="true">♥</span> 143 <span class="visually-hidden">hlasů</span></span>
            </div>
            <p class="photo__caption"><strong>Včela na levanduli</strong> Eva Marešová · Zvířata</p>
          </li>
      </ul>

      <section class="rules" aria-labelledby="rules-title">
        <h2 id="rules-title">Jak hlasovat</h2>
        <p>Každý návštěvník může dát jeden hlas každé fotce. Hlasy se sčítají průběžně a vítěze ceny veřejnosti vyhlásíme 8. října na výstavě v Galerii Lucerna.</p>
        <p>Porota vybírala z 2 380 snímků ve čtyřech kategoriích. Hodnotila kompozici, práci se světlem a to, jak fotka vypráví o české přírodě.</p>
        <p>Všechny oceněné fotky uvidíš od 8. do 31. října ve velkém formátu na výstavě v pasáži Lucerna. Vstup je zdarma.</p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Fotosoutěž Příroda Česka pořádá spolek Zelená stopa ve spolupráci s Českou společností ornitologickou.</p>
    </footer>

    <div class="preview" id="preview-1" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #d9e4ec 0%, #b7c7d3 35%, #5f7d6a 36%, #2f4a3c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Mlha nad Labským kaňonem</h2>
        <p class="preview__author">Tomáš Beneš · Krajina · 412 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-1" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-2" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 60% 45%, #d8a45c 0 18%, transparent 19%), linear-gradient(160deg, #3c5a3a, #1d2b1c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rys na Šumavě</h2>
        <p class="preview__author">Klára Nováková · Zvířata · 388 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-2" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-3" popover>
      <div class="preview__image" style="--photo: linear-gradient(170deg, #f3c1d9 0%, #c46aa0 45%, #6d2f5f 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Vřes na Kokořínsku</h2>
        <p class="preview__author">Ondřej Svoboda · Rostliny · 251 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-3" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-4" popover>
      <div class="preview__image" style="--photo: linear-gradient(180deg, #e8eef5 0%, #c3cfdc 50%, #8a5a44 51%, #5b3a2c 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Střechy Malé Strany v zimě</h2>
        <p class="preview__author">Lucie Dvořáková · Město · 197 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-4" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-5" popover>
      <div class="preview__image" style="--photo: linear-gradient(175deg, #f6d38b 0%, #d9a45a 40%, #6b7d4a 41%, #34432a 100%)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Rašeliniště v Jizerkách</h2>
        <p class="preview__author">Petr Horák · Krajina · 356 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-5" popovertargetaction="hide">Zavřít</button>
    </div>

    <div class="preview" id="preview-6" popover>
      <div class="preview__image" style="--photo: radial-gradient(circle at 45% 50%, #f2c230 0 9%, transparent 10%), linear-gradient(150deg, #b9a3e3, #5d4a9c)"></div>
      <div class="preview__text">
        <h2 class="preview__title">Včela na levanduli</h2>
        <p class="preview__author">Eva Marešová · Zvířata · 143 hlasů</p>
      </div>
      <button class="preview__close" type="button" popovertarget="preview-6" popovertargetaction="hide">Zavřít</button>
    </div>
  </body>
</html>
```

### --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --color-bg: #f4f6f2;
  --color-surface: #ffffff;
  --color-text: #17221b;
  --color-muted: #5d6b62;
  --color-line: #dde3dc;
  --color-accent: #2f7d4f;
  --color-gold: #f2b233;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(23 34 27 / 0.06), 0 16px 32px -20px rgb(23 34 27 / 0.45);
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

button {
  font: inherit;
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  max-width: 68rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 1.5rem;
}

.site-header__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-header__title {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.site-header__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.page {
  max-width: 68rem;
  margin-inline: auto;
  padding: 0 1.5rem 4rem;
}

/* ===== Filtry ===== */

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-inline: -1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgb(244 246 242 / 0.94);
  border-bottom: 1px solid var(--color-line);
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip,
.filters__sort {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-surface);
  font-weight: 600;
  cursor: pointer;
}

.chip--active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: #fff;
}

.chip:hover,
.chip:focus-visible,
.filters__sort:hover,
.filters__sort:focus-visible {
  border-color: var(--color-text);
}

/* ===== Nabídka řazení ===== */

.sort-menu {
  min-width: 12rem;
  padding: 0.375rem;
  border: 1px solid var(--color-line);
  border-radius: 0.75rem;
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.sort-menu__item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: none;
  text-align: start;
  cursor: pointer;
}

.sort-menu__item:hover,
.sort-menu__item:focus-visible {
  background: var(--color-bg);
}

.sort-menu__item[aria-pressed="true"] {
  color: var(--color-accent);
  font-weight: 700;
}

/* ===== Galerie ===== */

.gallery {
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.photo__open {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--radius);
  overflow: hidden;
  background: none;
  box-shadow: var(--shadow);
  cursor: zoom-in;
}

.photo__open:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.photo__image {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--photo);
  /* zvětšení při najetí a fokusu (transition a scale, víc v sekci css-animace) */
  transition: scale 0.35s ease;
}

.photo:is(:hover, :focus-within) .photo__image {
  scale: 1.06;
}

.photo__badge {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-gold);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 6px 14px -6px rgb(0 0 0 / 0.5);
}

.photo__votes {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: rgb(23 34 27 / 0.72);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

.photo__caption {
  margin: 0.75rem 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.photo__caption strong {
  display: block;
  color: var(--color-text);
  font-size: 1rem;
}

/* ===== Pravidla ===== */

.rules {
  max-width: 40rem;
  margin-top: 3rem;
}

.rules h2 {
  margin: 0 0 0.5rem;
}

.site-footer {
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

/* ===== Náhled ===== */

.preview {
  width: min(52rem, 100% - 2rem);
  padding: 0;
  border: 0;
  border-radius: 1.25rem;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.6);
}

.preview__image {
  aspect-ratio: 16 / 9;
  background: var(--photo);
}

.preview__text {
  padding: 1rem 1.25rem 1.25rem;
}

.preview__title {
  margin: 0;
  font-size: 1.375rem;
}

.preview__author {
  margin: 0.125rem 0 0;
  color: var(--color-muted);
}

.preview__close {
  padding: 0.375rem 0.875rem;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.9);
  font-weight: 700;
  cursor: pointer;
}

/* ===== Rozvržení a vrstvy ===== */

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
}

/* štítek je v HTML až za obrázkem, takže je nad ním i bez z-index */
.filters {
  position: sticky;
  top: 0;
  z-index: 1;
}

.photo__frame {
  position: relative;
}

.photo__badge,
.photo__votes {
  position: absolute;
}

.photo__badge {
  top: 0.625rem;
  left: 0.625rem;
}

.photo__votes {
  right: 0.625rem;
  bottom: 0.625rem;
}

/* ===== Popovery ===== */

.filters__sort {
  anchor-name: --sort;
}

.sort-menu {
  position-anchor: --sort;
  position-area: bottom span-left;
  position-try-fallbacks: flip-block;
  margin-top: 0.375rem;
}

.preview::backdrop {
  background: rgb(23 34 27 / 0.8);
}

.preview__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}
```

# --review--

Testy kontrolují polohy a chování. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každý `z-index` umíš zdůvodnit: víš, s čím se ten prvek porovnává a proč by bez něj prohrál.
- Štítek a počet hlasů se měří od rámečku obrázku, ne od celé karty s popiskem — a víš proč.
- Zkusil jsi náhled otevřít a zavřít myší, klávesou Esc i z klávesnice tabulátorem a Enterem.
- Na šířce 375 px se nabídka řazení vejde do okna a lišta filtrů nezakrývá půlku obrazovky.
- V CSS nejsou čísla typu `z-index: 9999` ani pevné souřadnice v pixelech, které by na jiné šířce nesedly.

## --extensions--

Přidej do náhledu šipky „předchozí / další" přes okraje obrázku (dvě tlačítka s `position: absolute` a `popovertarget` na sousední náhledy), tooltip s celým jménem autora u popisku, který se u pravého okraje okna přehodí na druhou stranu, a jemné objevení náhledu přes `@starting-style`, až se k němu dostaneš v sekci o animacích.
