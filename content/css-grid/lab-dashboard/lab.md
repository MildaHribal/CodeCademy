---
title: Přehled domácí elektrárny
see: css-grid/workshop-kostra-stranky, css-grid/workshop-galerie, css-grid/grid-nebo-flex#grid-a-flexbox-dohromady
---

# --description--

Aplikace **Slunce na střeše** ukazuje majitelům fotovoltaiky, kolik dnes vyrobili, spotřebovali a prodali do sítě. HTML přehledu i vzhled (barvy, písmo, stíny, graf ze sloupců) jsou hotové, chybí jen rozvržení — všechno leží pod sebou. Rozvrhni přehled v souboru `styles.css`, HTML neměň.

Tentokrát bez návodu. U každé části si rozmysli, jestli o velikosti rozhoduje návrh, nebo obsah, a podle toho vyber grid, nebo flexbox. Texty, barvy a téma jsou tvoje volba — klidně z přehledu udělej dashboard svého projektu, jen nech třídy v HTML.

**Co má přehled umět:**

- Na počítači je nahoře **horní lišta** přes celou šířku: logo vlevo, datum a avatar vpravo, všechno svisle vycentrované.
- Pod lištou je vlevo tmavý **boční panel** s navigací (široký 12rem až 18rem) a vpravo obsah. Panel sahá až ke spodnímu okraji přehledu, i když je obsah delší než okno.
- **Dlaždice** tvoří mřížku, která se přizpůsobí šířce bez media dotazu pro každý počet sloupců: sloupce jsou stejně široké, aspoň 12rem, a v řádku je jich tolik, kolik se vejde.
- **Graf výroby** vede přes dva sloupce a vedle něj stojí dlaždice „Dnes vyrobeno". Kde se dva sloupce nevejdou, je graf široký jako ostatní dlaždice a v mřížce nevznikne sloupec navíc.
- Sloupce grafu stojí vedle sebe, jsou stejně široké, s mezerou, a rostou od spodního okraje grafu.
- V dlaždicích s číslem je text trendu vždycky **u spodního okraje**, i když je dlaždice vedle grafu vyšší.
- **Tabulka posledních dní** vede přes celou šířku mřížky. Na telefonu se posouvá do strany uvnitř své dlaždice, celá stránka ne.
- Na tabletu (768 px) zůstává boční panel vlevo. Na telefonu (375 px) je všechno pod sebou — lišta, navigace, obsah — a odkazy navigace stojí vedle sebe a zalomí se.

> [!TIP]
> Kostru jde postavit pojmenovanými oblastmi, čísly čar i flexboxem. Po splnění uvidíš v „Jiných přístupech" všechny tři. Nejdřív si ale na papír nakresli, co je kostra, co mřížka a co komponenta.

Testy měří na šířkách 1024, 768 a 375 px z přepínače náhledu a navíc na 700 px, kterou přepínač nemá. Mezilehlé šířky projdi v DevTools v responzivním režimu.

# --hints--

Na šířce 1024 px je horní lišta nahoře přes celou šířku přehledu.

```js
const dashboard = document.querySelector('.dashboard').getBoundingClientRect();
const topbar = document.querySelector('.topbar').getBoundingClientRect();
assert.ok(Math.abs(topbar.top - dashboard.top) <= 2, `Horní lišta začíná na ${Math.round(topbar.top)} px, přehled na ${Math.round(dashboard.top)} px`);
assert.ok(Math.abs(topbar.width - dashboard.width) <= 2, `Horní lišta je široká ${Math.round(topbar.width)} px, přehled ${Math.round(dashboard.width)} px`);
```

Na šířce 1024 px je boční panel vlevo pod horní lištou, široký 192 až 288 px, a obsah vpravo vedle něj až k pravému okraji.

```js
const dashboard = document.querySelector('.dashboard').getBoundingClientRect();
const topbar = document.querySelector('.topbar').getBoundingClientRect();
const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
const content = document.querySelector('.content').getBoundingClientRect();
assert.ok(Math.abs(sidebar.left - dashboard.left) <= 2 && sidebar.top >= topbar.bottom - 2, 'Boční panel má být vlevo pod horní lištou');
assert.ok(sidebar.width >= 191 && sidebar.width <= 289, `Boční panel je široký ${Math.round(sidebar.width)} px, čekám 192 až 288 px (12rem až 18rem)`);
assert.ok(Math.abs(content.left - sidebar.right) <= 2 && Math.abs(content.top - sidebar.top) <= 2, 'Obsah má začínat vpravo vedle bočního panelu, ve stejné výšce');
assert.ok(Math.abs(content.right - dashboard.right) <= 2, `Obsah končí na ${Math.round(content.right)} px, přehled na ${Math.round(dashboard.right)} px`);
```

Na šířce 1024 px sahá tmavý boční panel až ke spodnímu okraji přehledu, i když je obsah delší.

```js
const dashboard = document.querySelector('.dashboard').getBoundingClientRect();
const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
assert.ok(Math.abs(sidebar.bottom - dashboard.bottom) <= 2, `Boční panel končí na ${Math.round(sidebar.bottom)} px, přehled na ${Math.round(dashboard.bottom)} px`);
```

V horní liště je logo u levého a avatar u pravého okraje, všechno v jednom řádku a svisle vycentrované.

```js
const topbar = document.querySelector('.topbar');
const style = getComputedStyle(topbar);
const box = topbar.getBoundingClientRect();
const brand = document.querySelector('.brand').getBoundingClientRect();
const date = document.querySelector('.topbar__date').getBoundingClientRect();
const avatar = document.querySelector('.avatar').getBoundingClientRect();
assert.ok(Math.abs(brand.left - box.left - parseFloat(style.paddingLeft)) <= 2, 'Logo má začínat u levého okraje horní lišty');
assert.ok(Math.abs(box.right - parseFloat(style.paddingRight) - avatar.right) <= 2, `Avatar končí na ${Math.round(avatar.right)} px, obsah lišty na ${Math.round(box.right - parseFloat(style.paddingRight))} px`);
assert.ok(date.left >= brand.right && avatar.left >= date.right, 'Pořadí v liště má zůstat logo, datum, avatar zleva doprava');
const middle = (rect) => rect.top + rect.height / 2;
assert.ok(Math.abs(middle(brand) - middle(avatar)) <= 2 && Math.abs(middle(date) - middle(avatar)) <= 2, 'Logo, datum a avatar mají být svisle vycentrované proti sobě');
```

Na šířkách 1024 a 768 px jsou běžné dlaždice stejně široké, aspoň 192 px (12rem), a v řádku je jich tolik, kolik se vejde: plný řádek končí u pravého okraje seznamu.

```js
for (const width of [1024, 768]) {
  await helpers.resize(width);
  const list = document.querySelector('.tiles').getBoundingClientRect();
  const tiles = [...document.querySelectorAll('.tile:not(.tile--chart):not(.tile--wide)')].map((tile) => tile.getBoundingClientRect());
  assert.ok(tiles.every((tile) => Math.abs(tile.width - tiles[0].width) <= 2), `Na šířce ${width} px mají běžné dlaždice šířky ${tiles.map((t) => Math.round(t.width)).join(', ')} px — mají být stejné`);
  assert.ok(tiles[0].width >= 191, `Na šířce ${width} px je dlaždice široká ${Math.round(tiles[0].width)} px, čekám aspoň 192 px`);
  const rows = new Map();
  for (const tile of tiles) rows.set(Math.round(tile.top), [...(rows.get(Math.round(tile.top)) ?? []), tile]);
  const fullRow = [...rows.values()].sort((a, b) => b.length - a.length)[0];
  const columns = fullRow.length;
  const gap = columns > 1 ? fullRow[1].left - fullRow[0].right : 16;
  assert.ok(Math.abs(fullRow.at(-1).right - list.right) <= 2, `Na šířce ${width} px končí nejplnější řádek dlaždic na ${Math.round(fullRow.at(-1).right)} px, seznam na ${Math.round(list.right)} px`);
  assert.ok((columns + 1) * 192 + columns * gap > list.width + 1, `Na šířce ${width} px je v řádku ${columns} dlaždic, ale vešlo by se jich víc`);
}
```

Na šířce 1024 px vede graf výroby přes dva sloupce dlaždic a „Dnes vyrobeno" stojí vpravo vedle něj ve stejném řádku.

```js
const chart = document.querySelector('.tile--chart').getBoundingClientRect();
const tiles = [...document.querySelectorAll('.tile:not(.tile--chart):not(.tile--wide)')].map((tile) => tile.getBoundingClientRect());
const next = tiles[0];
const gap = next.left - chart.right;
assert.ok(Math.abs(next.top - chart.top) <= 2 && gap >= 0, '„Dnes vyrobeno" má stát vpravo vedle grafu ve stejném řádku');
assert.ok(Math.abs(chart.width - (2 * next.width + gap)) <= 2, `Graf je široký ${Math.round(chart.width)} px, dva sloupce s mezerou mají ${Math.round(2 * next.width + gap)} px`);
```

Dlaždice s tabulkou vede na šířkách 1024 a 768 px přes celou šířku seznamu dlaždic.

```js
for (const width of [1024, 768]) {
  await helpers.resize(width);
  const list = document.querySelector('.tiles').getBoundingClientRect();
  const wide = document.querySelector('.tile--wide').getBoundingClientRect();
  assert.ok(Math.abs(wide.left - list.left) <= 2 && Math.abs(wide.right - list.right) <= 2, `Na šířce ${width} px sahá dlaždice s tabulkou od ${Math.round(wide.left)} do ${Math.round(wide.right)} px, seznam od ${Math.round(list.left)} do ${Math.round(list.right)} px`);
}
```

Na šířce 1024 px je text trendu („o 12 % víc než včera"…) u spodního okraje každé dlaždice s číslem.

```js
document.querySelectorAll('.tile:not(.tile--chart):not(.tile--wide)').forEach((tile) => {
  const style = getComputedStyle(tile);
  const bottom = tile.getBoundingClientRect().bottom - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth);
  const trend = tile.querySelector('.tile__trend').getBoundingClientRect();
  assert.ok(Math.abs(trend.bottom - bottom) <= 2, `V dlaždici „${tile.querySelector('.tile__label').textContent}" končí trend na ${Math.round(trend.bottom)} px, obsah dlaždice na ${Math.round(bottom)} px`);
});
```

Sloupce grafu stojí vedle sebe přes celou šířku grafu, jsou stejně široké, mají mezi sebou mezeru a vyrůstají ze spodního okraje grafu.

```js
const chart = document.querySelector('.chart').getBoundingClientRect();
const bars = [...document.querySelectorAll('.chart__bar')].map((bar) => bar.getBoundingClientRect());
assert.ok(Math.abs(bars[0].left - chart.left) <= 2 && Math.abs(bars.at(-1).right - chart.right) <= 2, 'Sloupce grafu mají vyplnit celou šířku grafu od prvního po poslední');
bars.forEach((bar, i) => {
  assert.ok(Math.abs(bar.width - bars[0].width) <= 1, `Sloupce grafu mají šířky ${bars.map((b) => Math.round(b.width)).join(', ')} px — mají být stejné`);
  assert.ok(Math.abs(bar.bottom - chart.bottom) <= 1, `Sloupec ${i + 1} končí na ${Math.round(bar.bottom)} px, graf na ${Math.round(chart.bottom)} px`);
  if (i > 0) assert.ok(bar.left - bars[i - 1].right >= 1, `Mezi sloupci ${i} a ${i + 1} má být mezera`);
});
assert.ok(bars[7].height > bars[2].height * 2, 'Sloupce mají být vysoké podle svých hodnot (--value)');
```

Na šířce 768 px zůstává boční panel vlevo vedle obsahu.

```js
await helpers.resize(768);
const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
const content = document.querySelector('.content').getBoundingClientRect();
assert.ok(Math.abs(content.top - sidebar.top) <= 2 && content.left >= sidebar.right - 2, 'Na šířce 768 px má být obsah vpravo vedle bočního panelu');
```

Na šířce 375 px je všechno v jednom sloupci pod sebou: horní lišta, navigace, obsah, každý přes celou šířku.

```js
await helpers.resize(375);
const dashboard = document.querySelector('.dashboard').getBoundingClientRect();
const parts = ['.topbar', '.sidebar', '.content'].map((selector) => document.querySelector(selector).getBoundingClientRect());
parts.forEach((part, i) => {
  assert.ok(Math.abs(part.width - dashboard.width) <= 2, `Na šířce 375 px je ${['horní lišta', 'navigace', 'obsah'][i]} široká ${Math.round(part.width)} px, přehled ${Math.round(dashboard.width)} px`);
  if (i > 0) assert.ok(part.top >= parts[i - 1].bottom - 2, 'Na šířce 375 px má být pořadí shora horní lišta, navigace, obsah');
});
```

Odkazy navigace jsou na šířce 1024 px pod sebou a na šířce 375 px vedle sebe; když se nevejdou, zalomí se a nepřetečou.

```js
const links = () => [...document.querySelectorAll('.sidebar__link')].map((link) => link.getBoundingClientRect());
const desktop = links();
assert.ok(desktop[1].top >= desktop[0].bottom - 1, 'Na šířce 1024 px mají být odkazy navigace pod sebou');
await helpers.resize(375);
const phone = links();
const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
assert.ok(Math.abs(phone[1].top - phone[0].top) <= 2 && phone[1].left >= phone[0].right, 'Na šířce 375 px mají být první dva odkazy vedle sebe');
assert.ok(new Set(phone.map((link) => Math.round(link.top))).size > 1, 'Na šířce 375 px se odkazy mají zalomit do víc řádků');
assert.ok(phone.every((link) => link.right <= sidebar.right + 1), 'Na šířce 375 px nesmí odkaz přetéct z navigace');
```

Na šířce 375 px jsou všechny dlaždice včetně grafu pod sebou přes celou šířku seznamu, bez sloupce navíc.

```js
await helpers.resize(375);
const list = document.querySelector('.tiles').getBoundingClientRect();
document.querySelectorAll('.tile').forEach((tile) => {
  const box = tile.getBoundingClientRect();
  assert.ok(Math.abs(box.left - list.left) <= 2 && Math.abs(box.width - list.width) <= 2, `Na šířce 375 px sahá dlaždice „${tile.querySelector('.tile__label').textContent}" od ${Math.round(box.left)} px a je široká ${Math.round(box.width)} px, seznam od ${Math.round(list.left)} px a ${Math.round(list.width)} px`);
});
```

Na šířce 700 px nevzniká v mřížce dlaždic sloupec navíc: žádná dlaždice nepřetéká ze seznamu a běžné dlaždice mají aspoň 192 px.

```js
await helpers.resize(700);
const list = document.querySelector('.tiles').getBoundingClientRect();
document.querySelectorAll('.tile').forEach((tile) => {
  const box = tile.getBoundingClientRect();
  const name = tile.querySelector('.tile__label').textContent;
  assert.ok(box.left >= list.left - 1 && box.right <= list.right + 1, `Na šířce 700 px přetéká dlaždice „${name}" ze seznamu (${Math.round(box.left)}–${Math.round(box.right)} px, seznam ${Math.round(list.left)}–${Math.round(list.right)} px)`);
  if (!tile.matches('.tile--chart, .tile--wide')) assert.ok(box.width >= 191, `Na šířce 700 px je dlaždice „${name}" široká jen ${Math.round(box.width)} px`);
});
```

Na šířce 375 px se tabulka posouvá do strany uvnitř své dlaždice, celá stránka ne.

```js
await helpers.resize(375);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Na šířce 375 px je stránka široká ${root.scrollWidth} px, okno ${root.clientWidth} px`);
const wrap = document.querySelector('.table-wrap');
assert.ok(wrap.scrollWidth > wrap.clientWidth, 'Na šířce 375 px má být tabulka širší než její obal a posouvat se uvnitř něj');
```

Na šířkách 1024 a 768 px nejde stránka posouvat do strany.

```js
for (const width of [1024, 768]) {
  await helpers.resize(width);
  const root = document.documentElement;
  assert.ok(root.scrollWidth <= root.clientWidth, `Na šířce ${width} px je stránka široká ${root.scrollWidth} px, okno ${root.clientWidth} px`);
}
```

# --help--

## --tip-- 14

Široká položka v automatické mřížce si vynutí sloupec navíc, když se dva sloupce nevejdou — viz past [`span 2` v mřížce, kde se vejde jen jeden sloupec](see:css-grid/mrizka-bez-media-queries#typicke-chyby-a-pasti). Spočítej, od jaké šířky okna má seznam dlaždic místo na dva sloupce po 12rem i s mezerou, když od něj odečteš boční panel a odsazení obsahu.

## --tip-- 15

Tabulka má `white-space: nowrap` a obal s `overflow-x: auto`, a přesto může roztáhnout sloupec, ve kterém obsah leží. Přečti si [Sloupec `1fr`, který se nechce zmenšit](see:css-grid/uvod-do-gridu#typicke-chyby-a-pasti) a hledej sloupec (nebo flex položku), jejíž minimum je nejmenší šířka obsahu.

# --review--

Testy kontrolují rozvržení. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- U každé části umíš říct, proč je gridem, nebo flexboxem (kostra, mřížka dlaždic, lišta, navigace, graf).
- Kostru rozvržení najdeš na jednom místě v CSS a HTML jsi kvůli ní neměnil.
- V CSS nejsou pevné šířky obsahu v pixelech, které by rozbily jinou šířku okna.
- Prošel jsi v DevTools šířky od 320 do 1400 px a graf nikde nevytvořil sloupec navíc a nic nepřeteklo.
- Víš, proč na telefonu pomohlo minimum `0` u sloupce nebo položky s tabulkou.

## --extensions--

Rozšíření bez testů: sbalitelný boční panel jen s ikonami na šířkách mezi 768 a 1024 px, dlaždice „Počasí na zítra" přes dva řádky vedle grafu a zvýraznění dnešního sloupce grafu jinou barvou. A přeměň přehled na téma, které tě baví: statistiky herního serveru, běžecký deník nebo přehled výdajů.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Slunce na střeše — přehled</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="dashboard">
      <header class="topbar">
        <a class="brand" href="#"><span class="brand__mark" aria-hidden="true"></span>Slunce na střeše</a>
        <p class="topbar__date">Středa 16. září 2026</p>
        <span class="avatar" role="img" aria-label="Přihlášená Jana Veselá">JV</span>
      </header>

      <nav class="sidebar" aria-label="Hlavní navigace">
        <ul class="sidebar__list">
          <li><a class="sidebar__link" href="#" aria-current="page">Přehled</a></li>
          <li><a class="sidebar__link" href="#">Výroba</a></li>
          <li><a class="sidebar__link" href="#">Baterie</a></li>
          <li><a class="sidebar__link" href="#">Spotřebiče</a></li>
          <li><a class="sidebar__link" href="#">Vyúčtování</a></li>
          <li><a class="sidebar__link" href="#">Nastavení</a></li>
        </ul>
      </nav>

      <main class="content">
        <h1 class="content__title">Přehled domácnosti</h1>
        <ul class="tiles">
          <li class="tile tile--chart">
            <h2 class="tile__label">Výroba za posledních 14 dní</h2>
            <div class="chart" role="img" aria-label="Sloupcový graf denní výroby od 2. do 15. září, nejvíc 24 kWh v sobotu 9. září">
            <span class="chart__bar" style="--value: 48%"></span>
            <span class="chart__bar" style="--value: 62%"></span>
            <span class="chart__bar" style="--value: 35%"></span>
            <span class="chart__bar" style="--value: 71%"></span>
            <span class="chart__bar" style="--value: 80%"></span>
            <span class="chart__bar" style="--value: 55%"></span>
            <span class="chart__bar" style="--value: 90%"></span>
            <span class="chart__bar" style="--value: 100%"></span>
            <span class="chart__bar" style="--value: 76%"></span>
            <span class="chart__bar" style="--value: 42%"></span>
            <span class="chart__bar" style="--value: 66%"></span>
            <span class="chart__bar" style="--value: 84%"></span>
            <span class="chart__bar" style="--value: 58%"></span>
            <span class="chart__bar" style="--value: 77%"></span>
            </div>
          </li>
          <li class="tile">
            <h2 class="tile__label">Dnes vyrobeno</h2>
            <p class="tile__value">18,4 kWh</p>
            <p class="tile__trend tile__trend--up">o 12 % víc než včera</p>
          </li>
          <li class="tile">
            <h2 class="tile__label">Spotřeba domu</h2>
            <p class="tile__value">11,2 kWh</p>
            <p class="tile__trend tile__trend--down">o 3 % méně než včera</p>
          </li>
          <li class="tile">
            <h2 class="tile__label">Baterie</h2>
            <p class="tile__value">86 %</p>
            <p class="tile__trend">nabitá do 17:40</p>
          </li>
          <li class="tile">
            <h2 class="tile__label">Prodáno do sítě</h2>
            <p class="tile__value">7,1 kWh</p>
            <p class="tile__trend tile__trend--up">výdělek 21 Kč</p>
          </li>
          <li class="tile tile--wide">
            <h2 class="tile__label">Posledních 7 dní v kWh</h2>
            <div class="table-wrap" tabindex="0" role="region" aria-label="Tabulka posledních 7 dní">
              <table class="days">
                <thead>
                  <tr><th scope="col">Den</th><th scope="col">Výroba</th><th scope="col">Spotřeba</th><th scope="col">Z baterie</th><th scope="col">Do sítě</th><th scope="col">Ze sítě</th><th scope="col">Úspora</th></tr>
                </thead>
                <tbody>
                <tr><th scope="row">St 9. 9.</th><td>21,6</td><td>12,8</td><td>3,1</td><td>8,4</td><td>0,0</td><td>96 Kč</td></tr>
                <tr><th scope="row">Čt 10. 9.</th><td>11,2</td><td>13,5</td><td>4,2</td><td>0,6</td><td>2,9</td><td>41 Kč</td></tr>
                <tr><th scope="row">Pá 11. 9.</th><td>17,9</td><td>10,4</td><td>2,8</td><td>6,9</td><td>0,0</td><td>84 Kč</td></tr>
                <tr><th scope="row">So 12. 9.</th><td>24,0</td><td>15,1</td><td>3,5</td><td>9,6</td><td>0,4</td><td>108 Kč</td></tr>
                <tr><th scope="row">Ne 13. 9.</th><td>18,3</td><td>14,2</td><td>4,0</td><td>5,1</td><td>0,8</td><td>79 Kč</td></tr>
                <tr><th scope="row">Po 14. 9.</th><td>9,8</td><td>12,9</td><td>5,3</td><td>0,2</td><td>3,6</td><td>35 Kč</td></tr>
                <tr><th scope="row">Út 15. 9.</th><td>16,4</td><td>11,7</td><td>3,2</td><td>5,4</td><td>0,5</td><td>72 Kč</td></tr>
                </tbody>
              </table>
            </div>
          </li>
        </ul>
      </main>
    </div>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --bg: #f3f5f9;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --accent: #f59e0b;
  --accent-strong: #b45309;
  --green: #15803d;
  --red: #b91c1c;
  --sidebar: #0f172a;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.06);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
}

h1,
h2,
p {
  margin: 0;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* ===== Horní lišta ===== */

.topbar {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  font-weight: 800;
  white-space: nowrap;
  font-size: 1.125rem;
  text-decoration: none;
}

.brand__mark {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  background: radial-gradient(circle, #fde68a 35%, var(--accent) 36%);
  vertical-align: -0.2em;
}

.topbar__date {
  color: var(--muted);
  font-size: 0.875rem;
}

.avatar {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ea580c);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

/* ===== Boční panel ===== */

.sidebar {
  padding: 1.5rem 1rem;
  background: var(--sidebar);
  color: #cbd5e1;
}

.sidebar__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar__link:hover {
  background: rgb(255 255 255 / 0.08);
  color: #fff;
}

.sidebar__link[aria-current="page"] {
  background: rgb(245 158 11 / 0.18);
  color: #fde68a;
  font-weight: 600;
}

/* ===== Obsah ===== */

.content {
  padding: 2rem;
}

.content__title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  line-height: 1.2;
}

.tiles {
  max-inline-size: 56rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  transition: transform 0.25s, box-shadow 0.25s;
}

.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.08), 0 16px 32px rgb(15 23 42 / 0.12);
}

.tile__label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.tile__value {
  margin-top: 0.25rem;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.tile__trend {
  margin-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.tile__trend--up {
  color: var(--green);
}

.tile__trend--down {
  color: var(--red);
}

/* Graf výroby */

.chart {
  height: 10rem;
  margin-top: 1rem;
}

.chart__bar {
  display: block;
  height: var(--value);
  border-radius: 0.375rem 0.375rem 0 0;
  background: linear-gradient(to top, var(--accent-strong), var(--accent));
}

/* Tabulka */

.table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
}

.days {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.days th,
.days td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: right;
}

.days th:first-child {
  text-align: left;
}

.days thead th {
  color: var(--muted);
  font-weight: 600;
}

/* ===== Rozvržení ===== */
--edit--

--edit--
```

# --solution--

## --file-- styles.css

```css
:root {
  --bg: #f3f5f9;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --accent: #f59e0b;
  --accent-strong: #b45309;
  --green: #15803d;
  --red: #b91c1c;
  --sidebar: #0f172a;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.06);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
}

h1,
h2,
p {
  margin: 0;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* ===== Horní lišta ===== */

.topbar {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  font-weight: 800;
  white-space: nowrap;
  font-size: 1.125rem;
  text-decoration: none;
}

.brand__mark {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  background: radial-gradient(circle, #fde68a 35%, var(--accent) 36%);
  vertical-align: -0.2em;
}

.topbar__date {
  color: var(--muted);
  font-size: 0.875rem;
}

.avatar {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ea580c);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

/* ===== Boční panel ===== */

.sidebar {
  padding: 1.5rem 1rem;
  background: var(--sidebar);
  color: #cbd5e1;
}

.sidebar__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar__link:hover {
  background: rgb(255 255 255 / 0.08);
  color: #fff;
}

.sidebar__link[aria-current="page"] {
  background: rgb(245 158 11 / 0.18);
  color: #fde68a;
  font-weight: 600;
}

/* ===== Obsah ===== */

.content {
  padding: 2rem;
}

.content__title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  line-height: 1.2;
}

.tiles {
  max-inline-size: 56rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  transition: transform 0.25s, box-shadow 0.25s;
}

.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.08), 0 16px 32px rgb(15 23 42 / 0.12);
}

.tile__label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.tile__value {
  margin-top: 0.25rem;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.tile__trend {
  margin-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.tile__trend--up {
  color: var(--green);
}

.tile__trend--down {
  color: var(--red);
}

/* Graf výroby */

.chart {
  height: 10rem;
  margin-top: 1rem;
}

.chart__bar {
  display: block;
  height: var(--value);
  border-radius: 0.375rem 0.375rem 0 0;
  background: linear-gradient(to top, var(--accent-strong), var(--accent));
}

/* Tabulka */

.table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
}

.days {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.days th,
.days td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: right;
}

.days th:first-child {
  text-align: left;
}

.days thead th {
  color: var(--muted);
  font-weight: 600;
}

/* ===== Rozvržení ===== */

.dashboard {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "topbar topbar"
    "sidebar content";
  min-block-size: 100dvh;
}

.topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar__date {
  margin-inline-start: auto;
}

.sidebar {
  grid-area: sidebar;
}

.content {
  grid-area: content;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
  gap: 1rem;
}

.tile {
  display: flex;
  flex-direction: column;
}

.tile__trend {
  margin-top: auto;
  padding-top: 0.75rem;
}

.tile--wide {
  grid-column: 1 / -1;
}

.chart {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  align-items: end;
  gap: 0.25rem;
}

@media (min-width: 48rem) {
  .tile--chart {
    grid-column: span 2;
  }
}

@media (max-width: 40rem) {
  .sidebar__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .dashboard {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    grid-template-areas:
      "topbar"
      "sidebar"
      "content";
  }
}
```

# --approaches--

## --approach-- Pojmenované oblasti a media dotaz

Kostra je nakreslená v `grid-template-areas` a na telefonu se jen nakreslí znovu. Nejčitelnější, když se rozvržení na různých šířkách mění víc než jednou; kolega hned vidí, kde co je.

### --file-- styles.css

```css
:root {
  --bg: #f3f5f9;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --accent: #f59e0b;
  --accent-strong: #b45309;
  --green: #15803d;
  --red: #b91c1c;
  --sidebar: #0f172a;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.06);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
}

h1,
h2,
p {
  margin: 0;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* ===== Horní lišta ===== */

.topbar {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  font-weight: 800;
  white-space: nowrap;
  font-size: 1.125rem;
  text-decoration: none;
}

.brand__mark {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  background: radial-gradient(circle, #fde68a 35%, var(--accent) 36%);
  vertical-align: -0.2em;
}

.topbar__date {
  color: var(--muted);
  font-size: 0.875rem;
}

.avatar {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ea580c);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

/* ===== Boční panel ===== */

.sidebar {
  padding: 1.5rem 1rem;
  background: var(--sidebar);
  color: #cbd5e1;
}

.sidebar__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar__link:hover {
  background: rgb(255 255 255 / 0.08);
  color: #fff;
}

.sidebar__link[aria-current="page"] {
  background: rgb(245 158 11 / 0.18);
  color: #fde68a;
  font-weight: 600;
}

/* ===== Obsah ===== */

.content {
  padding: 2rem;
}

.content__title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  line-height: 1.2;
}

.tiles {
  max-inline-size: 56rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  transition: transform 0.25s, box-shadow 0.25s;
}

.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.08), 0 16px 32px rgb(15 23 42 / 0.12);
}

.tile__label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.tile__value {
  margin-top: 0.25rem;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.tile__trend {
  margin-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.tile__trend--up {
  color: var(--green);
}

.tile__trend--down {
  color: var(--red);
}

/* Graf výroby */

.chart {
  height: 10rem;
  margin-top: 1rem;
}

.chart__bar {
  display: block;
  height: var(--value);
  border-radius: 0.375rem 0.375rem 0 0;
  background: linear-gradient(to top, var(--accent-strong), var(--accent));
}

/* Tabulka */

.table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
}

.days {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.days th,
.days td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: right;
}

.days th:first-child {
  text-align: left;
}

.days thead th {
  color: var(--muted);
  font-weight: 600;
}

/* ===== Rozvržení ===== */

.dashboard {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "topbar topbar"
    "sidebar content";
  min-block-size: 100dvh;
}

.topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar__date {
  margin-inline-start: auto;
}

.sidebar {
  grid-area: sidebar;
}

.content {
  grid-area: content;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
  gap: 1rem;
}

.tile {
  display: flex;
  flex-direction: column;
}

.tile__trend {
  margin-top: auto;
  padding-top: 0.75rem;
}

.tile--wide {
  grid-column: 1 / -1;
}

.chart {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  align-items: end;
  gap: 0.25rem;
}

@media (min-width: 48rem) {
  .tile--chart {
    grid-column: span 2;
  }
}

@media (max-width: 40rem) {
  .sidebar__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .dashboard {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    grid-template-areas:
      "topbar"
      "sidebar"
      "content";
  }
}
```

## --approach-- Čísla čar

Bez pojmenovaných oblastí: horní lišta vede přes `1 / -1` a panel s obsahem se do buněk skládají automaticky v pořadí HTML. Kratší zápis, hodí se, když je kostra jednoduchá a pořadí v HTML odpovídá pořadí na obrazovce. Uvnitř dlaždic je místo flexboxu malý grid a graf je flexbox.

### --file-- styles.css

```css
:root {
  --bg: #f3f5f9;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --accent: #f59e0b;
  --accent-strong: #b45309;
  --green: #15803d;
  --red: #b91c1c;
  --sidebar: #0f172a;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.06);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
}

h1,
h2,
p {
  margin: 0;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* ===== Horní lišta ===== */

.topbar {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  font-weight: 800;
  white-space: nowrap;
  font-size: 1.125rem;
  text-decoration: none;
}

.brand__mark {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  background: radial-gradient(circle, #fde68a 35%, var(--accent) 36%);
  vertical-align: -0.2em;
}

.topbar__date {
  color: var(--muted);
  font-size: 0.875rem;
}

.avatar {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ea580c);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

/* ===== Boční panel ===== */

.sidebar {
  padding: 1.5rem 1rem;
  background: var(--sidebar);
  color: #cbd5e1;
}

.sidebar__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar__link:hover {
  background: rgb(255 255 255 / 0.08);
  color: #fff;
}

.sidebar__link[aria-current="page"] {
  background: rgb(245 158 11 / 0.18);
  color: #fde68a;
  font-weight: 600;
}

/* ===== Obsah ===== */

.content {
  padding: 2rem;
}

.content__title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  line-height: 1.2;
}

.tiles {
  max-inline-size: 56rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  transition: transform 0.25s, box-shadow 0.25s;
}

.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.08), 0 16px 32px rgb(15 23 42 / 0.12);
}

.tile__label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.tile__value {
  margin-top: 0.25rem;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.tile__trend {
  margin-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.tile__trend--up {
  color: var(--green);
}

.tile__trend--down {
  color: var(--red);
}

/* Graf výroby */

.chart {
  height: 10rem;
  margin-top: 1rem;
}

.chart__bar {
  display: block;
  height: var(--value);
  border-radius: 0.375rem 0.375rem 0 0;
  background: linear-gradient(to top, var(--accent-strong), var(--accent));
}

/* Tabulka */

.table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
}

.days {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.days th,
.days td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: right;
}

.days th:first-child {
  text-align: left;
}

.days thead th {
  color: var(--muted);
  font-weight: 600;
}

/* ===== Rozvržení ===== */

.dashboard {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  min-block-size: 100dvh;
}

.topbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar__date {
  margin-inline-start: auto;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
  gap: 1.25rem;
}

.tile {
  display: grid;
  grid-template-rows: auto auto 1fr;
}

.tile__trend {
  align-self: end;
}

.tile--wide {
  grid-column: 1 / -1;
  grid-template-rows: auto;
}

.chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
}

.chart__bar {
  flex: 1;
}

@media (min-width: 48rem) {
  .tile--chart {
    grid-column: span 2;
    grid-template-rows: auto 1fr;
  }
}

@media (max-width: 40rem) {
  .dashboard {
    grid-template-columns: minmax(0, 1fr);
  }

  .sidebar__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}
```

## --approach-- Kostra z flexboxu bez media dotazu

Panel a obsah dostanou výchozí velikost a obsah obrovský `flex-grow`, takže se kostra zalomí sama, když obsah nemá místo — reaguje na šířku přehledu, ne okna. Media dotaz zůstane jen pro graf a navigaci. Graf má sloupce z `grid-auto-flow: column`, takže nemusíš znát jejich počet.

### --file-- styles.css

```css
:root {
  --bg: #f3f5f9;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --accent: #f59e0b;
  --accent-strong: #b45309;
  --green: #15803d;
  --red: #b91c1c;
  --sidebar: #0f172a;
  --radius: 1rem;
  --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.06);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
}

h1,
h2,
p {
  margin: 0;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* ===== Horní lišta ===== */

.topbar {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  font-weight: 800;
  white-space: nowrap;
  font-size: 1.125rem;
  text-decoration: none;
}

.brand__mark {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  background: radial-gradient(circle, #fde68a 35%, var(--accent) 36%);
  vertical-align: -0.2em;
}

.topbar__date {
  color: var(--muted);
  font-size: 0.875rem;
}

.avatar {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ea580c);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}

/* ===== Boční panel ===== */

.sidebar {
  padding: 1.5rem 1rem;
  background: var(--sidebar);
  color: #cbd5e1;
}

.sidebar__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar__link:hover {
  background: rgb(255 255 255 / 0.08);
  color: #fff;
}

.sidebar__link[aria-current="page"] {
  background: rgb(245 158 11 / 0.18);
  color: #fde68a;
  font-weight: 600;
}

/* ===== Obsah ===== */

.content {
  padding: 2rem;
}

.content__title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  line-height: 1.2;
}

.tiles {
  max-inline-size: 56rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  transition: transform 0.25s, box-shadow 0.25s;
}

.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.08), 0 16px 32px rgb(15 23 42 / 0.12);
}

.tile__label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.tile__value {
  margin-top: 0.25rem;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.tile__trend {
  margin-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.tile__trend--up {
  color: var(--green);
}

.tile__trend--down {
  color: var(--red);
}

/* Graf výroby */

.chart {
  height: 10rem;
  margin-top: 1rem;
}

.chart__bar {
  display: block;
  height: var(--value);
  border-radius: 0.375rem 0.375rem 0 0;
  background: linear-gradient(to top, var(--accent-strong), var(--accent));
}

/* Tabulka */

.table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
}

.days {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.days th,
.days td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: right;
}

.days th:first-child {
  text-align: left;
}

.days thead th {
  color: var(--muted);
  font-weight: 600;
}

/* ===== Rozvržení ===== */

.dashboard {
  display: flex;
  flex-wrap: wrap;
  min-block-size: 100dvh;
}

.topbar {
  flex-basis: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar__date {
  margin-inline-start: auto;
}

.sidebar {
  flex: 1 1 15rem;
}

.content {
  flex: 999 1 26rem;
  min-width: 0;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
  gap: 1rem;
}

.tile {
  display: flex;
  flex-direction: column;
}

.tile__trend {
  margin-top: auto;
  padding-top: 0.75rem;
}

.tile--wide {
  grid-column: 1 / -1;
}

.chart {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: end;
  gap: 0.25rem;
}

@media (min-width: 48rem) {
  .tile--chart {
    grid-column: span 2;
  }
}

@media (max-width: 41rem) {
  .sidebar__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}
```
