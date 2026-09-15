---
title: Program letního kina
see: css-zaklady/selektory-zaklad#pseudotridy-podle-pozice, css-zaklady/selektory-zaklad#atributove-selektory, css-zaklady/selektory-zaklad#kombinatory-vztahy-mezi-prvky
---

# --description--

Letní kino Ostrov v Písku má na webu týdenní program jako tabulku. HTML generuje rezervační systém a třídy do něj přidat nejde — prvky vybereš jen podle typu, pozice, atributů a vztahů mezi nimi. Tmavý základní vzhled je hotový v `styles.css`, svoje pravidla piš pod komentář „Tvoje selektory".

Barvy a velikosti jsou tvoje volba, testy kontrolují jen to, **které prvky** se změnily a jak se liší od ostatních. HTML neměň.

**Co má program umět:**

- Popisek tabulky pod nadpisem je menší a tlumenější než text v tabulce.
- Záhlaví tabulky (Den, Film, Vstupenky) má jiné pozadí než řádky programu.
- Řádky programu se střídají: sudé řádky mají jiné pozadí než liché, aby se v tabulce nedalo ujet okem.
- Den promítání v prvním sloupci je tučný, názvy filmů zůstávají normální.
- Vyprodaná představení (řádek s atributem `data-status="vyprodano"`) mají ztlumený text a přeškrtnutý název filmu. Ostatní filmy přeškrtnuté nejsou.
- Odkazy „Koupit" v tabulce vypadají jako tlačítka: mají vlastní pozadí a nejsou podtržené. Při najetí myší se viditelně změní a při ovládání klávesnicí mají výrazný obrys.
- V patičce má odkaz ke stažení PDF před textem popisek nebo ikonu z CSS a odkazy na jiné weby (adresa začíná `https://`) mají za textem šipku `↗`. Odkaz na ceník vstupného nemá ani jedno.
- Odkazy v patičce zůstávají podtržené, protože stojí uprostřed věty.

> [!TIP]
> Každé pravidlo si ověř v DevTools: když vybereš prvek, v panelu Styles uvidíš, jestli na něj tvůj selektor opravdu míří. Pseudoprvky `::before` a `::after` najdeš ve stromu Elements jako řádky uvnitř odkazu.

# --hints--

Popisek tabulky má menší písmo a jinou barvu než text v tabulce.

```js
const caption = getComputedStyle(document.querySelector('caption'));
const cell = getComputedStyle(document.querySelector('tbody td:nth-child(2)'));
assert.ok(parseFloat(caption.fontSize) < parseFloat(cell.fontSize), `Popisek má písmo ${caption.fontSize}, text tabulky ${cell.fontSize} — popisek má být menší`);
assert.notEqual(caption.color, cell.color, 'Popisek má mít jinou (tlumenější) barvu než text v tabulce');
```

Záhlaví tabulky má jiné pozadí než řádky programu.

```js
const bg = (el) => {
  for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
  }
  return 'none';
};
const header = bg(document.querySelector('thead th'));
const [first, second] = document.querySelectorAll('tbody tr');
assert.notEqual(header, bg(first.querySelector('td')), `Záhlaví i první řádek mají pozadí ${header} — záhlaví se má lišit`);
assert.notEqual(header, bg(second.querySelector('td')), `Záhlaví i druhý řádek mají pozadí ${header} — záhlaví se má lišit`);
```

Sudé řádky programu mají jiné pozadí než liché a všechny liché (i všechny sudé) mají pozadí stejné.

```js
const bg = (el) => {
  for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
  }
  return 'none';
};
const rows = [...document.querySelectorAll('tbody tr')].map((row) => bg(row.querySelector('td:nth-child(2)')));
const odd = rows.filter((_, i) => i % 2 === 0);
const even = rows.filter((_, i) => i % 2 === 1);
assert.ok(odd.every((color) => color === odd[0]), `Liché řádky (1., 3., 5., 7.) mají pozadí ${odd.join(', ')} — mají být stejné`);
assert.ok(even.every((color) => color === even[0]), `Sudé řádky (2., 4., 6.) mají pozadí ${even.join(', ')} — mají být stejné`);
assert.notEqual(odd[0], even[0], `Liché i sudé řádky mají pozadí ${odd[0]} — mají se střídat`);
```

Den promítání v prvním sloupci je tučný a název filmu ne.

```js
document.querySelectorAll('tbody tr').forEach((row, i) => {
  const day = getComputedStyle(row.querySelector('td:first-child')).fontWeight;
  const film = getComputedStyle(row.querySelector('td:nth-child(2)')).fontWeight;
  assert.ok(Number(day) >= 600, `Den v ${i + 1}. řádku má tloušťku písma ${day}, čekám aspoň 600`);
  assert.ok(Number(film) < 600, `Název filmu v ${i + 1}. řádku má tloušťku ${film} — tučný má být jen den`);
});
```

Vyprodaná představení mají ztlumený text, jiný než ostatní řádky.

```js
const soldOut = [...document.querySelectorAll('tr[data-status="vyprodano"] td:nth-child(2)')].map((cell) => getComputedStyle(cell).color);
const normal = [...document.querySelectorAll('tbody tr:not([data-status]) td:nth-child(2)')].map((cell) => getComputedStyle(cell).color);
assert.ok(soldOut.every((color) => color === soldOut[0]), `Vyprodané filmy mají barvy ${soldOut.join(', ')} — mají být stejné`);
assert.ok(!normal.includes(soldOut[0]), `Vyprodaný film má barvu ${soldOut[0]}, stejnou jako běžný film — má být ztlumený`);
```

Názvy vyprodaných filmů jsou přeškrtnuté a ostatní filmy ne.

```js
document.querySelectorAll('tbody tr').forEach((row) => {
  const film = row.querySelector('td:nth-child(2)');
  const crossed = getComputedStyle(film).textDecorationLine.includes('line-through');
  if (row.dataset.status === 'vyprodano') assert.ok(crossed, `Vyprodaný film „${film.textContent}" má být přeškrtnutý`);
  else assert.ok(!crossed, `Film „${film.textContent}" není vyprodaný a nemá být přeškrtnutý`);
});
```

Odkazy „Koupit" mají vlastní pozadí, jiné než jejich řádek, a nejsou podtržené.

```js
const bg = (el) => {
  for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
  }
  return 'none';
};
document.querySelectorAll('tbody a').forEach((link) => {
  const style = getComputedStyle(link);
  assert.notEqual(style.backgroundColor, 'rgba(0, 0, 0, 0)', `Odkaz v řádku „${link.closest('tr').cells[1].textContent}" nemá vlastní pozadí`);
  assert.notEqual(style.backgroundColor, bg(link.parentElement), 'Pozadí odkazu „Koupit" se má lišit od pozadí řádku');
  assert.equal(style.textDecorationLine, 'none', `Odkaz v řádku „${link.closest('tr').cells[1].textContent}" nemá být podtržený`);
});
```

Odkaz „Koupit" se při najetí myší viditelně změní.

```js
const link = document.querySelector('tbody a');
const found = [];
const walk = (rules, parent = '') => {
  for (const rule of rules) {
    let selector = rule.selectorText ?? '';
    if (selector && parent) selector = selector.includes('&') ? selector.replace(/&/g, parent) : `${parent} ${selector}`;
    if (selector) {
      for (const part of selector.split(',')) {
        if (!part.includes(':hover')) continue;
        try {
          if (link.matches(part.replace(/:hover/g, '').trim() || '*')) found.push(rule);
        } catch {}
      }
    }
    if (rule.cssRules) walk(rule.cssRules, selector || parent);
  }
};
for (const sheet of document.styleSheets) walk(sheet.cssRules);
assert.ok(found.length > 0, 'Chybí pravidlo se stavem :hover, které vybere odkaz „Koupit"');
const base = getComputedStyle(link);
let changed = false;
for (const rule of found) {
  for (const property of rule.style) {
    const probe = link.cloneNode(true);
    probe.style.visibility = 'hidden';
    link.parentElement.append(probe);
    probe.style.setProperty(property, rule.style.getPropertyValue(property));
    if (getComputedStyle(probe).getPropertyValue(property) !== base.getPropertyValue(property)) changed = true;
    probe.remove();
  }
}
assert.ok(changed, 'Pravidlo s :hover pro odkaz „Koupit" nemění nic, co by bylo vidět');
```

Odkaz „Koupit" má při ovládání klávesnicí plný obrys široký aspoň 2 px.

```js
const link = document.querySelector('tbody a');
link.focus({ focusVisible: true });
const style = getComputedStyle(link);
assert.ok(style.outlineStyle !== 'none' && style.outlineStyle !== 'auto', `Odkaz s fokusem z klávesnice má obrys ve stylu ${style.outlineStyle} — čekám vlastní obrys (třeba solid)`);
assert.ok(parseFloat(style.outlineWidth) >= 2, `Obrys odkazu s fokusem je široký ${style.outlineWidth}, čekám aspoň 2px`);
```

Odkaz na PDF má před textem obsah vložený z CSS, ostatní odkazy v patičce ne.

```js
const hasBefore = (link) => !['none', 'normal', '""'].includes(getComputedStyle(link, '::before').content);
const pdf = document.querySelector('footer a[href$=".pdf"]');
assert.ok(hasBefore(pdf), 'Odkaz na PDF nemá před textem obsah z ::before (vlastnost content)');
for (const link of document.querySelectorAll('footer a:not([href$=".pdf"])')) {
  assert.ok(!hasBefore(link), `Odkaz „${link.textContent}" není PDF a nemá mít obsah z ::before`);
}
```

Odkazy na jiné weby mají za textem šipku `↗`, odkazy na stránky kina ne.

```js
const after = (link) => getComputedStyle(link, '::after').content;
for (const link of document.querySelectorAll('a')) {
  const external = link.getAttribute('href').startsWith('https://');
  if (external) assert.ok(after(link).includes('↗'), `Odkaz „${link.textContent}" vede na jiný web a má mít za textem ↗`);
  else assert.ok(!after(link).includes('↗'), `Odkaz „${link.textContent}" vede na web kina a nemá mít šipku ↗`);
}
```

Odkazy v patičce zůstávají podtržené.

```js
document.querySelectorAll('footer a').forEach((link) => {
  assert.ok(getComputedStyle(link).textDecorationLine.includes('underline'), `Odkaz „${link.textContent}" v patičce má zůstat podtržený`);
});
```

HTML zůstává beze změny: žádné nové třídy ani atributy `style`.

```js
assert.equal(document.querySelectorAll('[class]').length, 0, 'V HTML nemají být žádné atributy class — vybírej selektory podle typu, pozice a atributů');
assert.equal(document.querySelectorAll('[style]').length, 0, 'V HTML nemají být atributy style');
assert.equal(document.querySelectorAll('tbody tr').length, 7, 'Program má mít 7 řádků');
assert.equal(document.querySelectorAll('tr[data-status="vyprodano"]').length, 2, 'Vyprodaná mají zůstat dvě představení');
```

# --help--

## --tip-- 3

Střídání řádků je výběr podle pozice mezi sourozenci — vzorce najdeš v části [Pseudotřídy podle pozice](see:css-zaklady/selektory-zaklad#pseudotridy-podle-pozice). Počítá se mezi řádky uvnitř `<tbody>`, záhlaví do toho nepatří.

## --tip-- 6

Potřebuješ dvě podmínky najednou: řádek s daným atributem a v něm buňka na druhé pozici. Atributový selektor pro řádek spoj kombinátorem s pseudotřídou pro buňku, jak ukazují [Kombinátory](see:css-zaklady/selektory-zaklad#kombinatory-vztahy-mezi-prvky).

# --approaches--

## --approach-- Pseudotřídy a atributy na řádcích

Pozadí patří řádkům `tr`, přeškrtnutí buňce na druhé pozici a vzhled tlačítka všem odkazům v `tbody`. Nejkratší zápis, protože v tabulce jiné odkazy nejsou.

### --file-- styles.css

```css
/* Základní vzhled je hotový. Téma, barvy a písmo klidně změň.
   HTML neměň — všechno ostatní vybereš selektory. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #e7e5e4;
  background-color: #1c1917;
}

main {
  max-width: 44rem;
  margin: 0 auto;
}

header p {
  margin: 0;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 1.5rem;
  font-size: 2.5rem;
  line-height: 1.1;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 0.75rem;
  background-color: #292524;
}

caption {
  padding-bottom: 0.75rem;
  text-align: start;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: start;
}

footer {
  margin-top: 1.5rem;
}

footer a {
  color: #fbbf24;
}

/* ===== Tvoje selektory ===== */

caption {
  color: #a8a29e;
  font-size: 0.875rem;
}

thead th {
  background-color: #b45309;
  color: #fffbeb;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

tbody tr:nth-child(even) {
  background-color: #312d2a;
}

tbody td:first-child {
  font-weight: 700;
  white-space: nowrap;
}

tr[data-status="vyprodano"] {
  color: #78716c;
}

tr[data-status="vyprodano"] td:nth-child(2) {
  text-decoration: line-through;
}

tbody a {
  display: inline-block;
  padding: 0.25rem 0.875rem;
  border-radius: 999px;
  background-color: #fbbf24;
  color: #1c1917;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

tbody a:hover {
  background-color: #fde68a;
}

tbody a:focus-visible {
  outline: 3px solid #fde68a;
  outline-offset: 2px;
}

a[href$=".pdf"]::before {
  content: "PDF ";
  font-size: 0.75rem;
  font-weight: 700;
}

a[href^="https://"]::after {
  content: " ↗";
}
```

## --approach-- Buňky, sourozenci a začátek adresy

Pozadí dostávají buňky, název filmu vybírá kombinátor `td:first-child + td` a tlačítka se poznají podle adresy `/vstupenky`. Hodí se, když by v tabulce časem přibyly i jiné odkazy, třeba na detail filmu, které tlačítka být nemají.

### --file-- styles.css

```css
/* Základní vzhled je hotový. Téma, barvy a písmo klidně změň.
   HTML neměň — všechno ostatní vybereš selektory. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #e7e5e4;
  background-color: #1c1917;
}

main {
  max-width: 44rem;
  margin: 0 auto;
}

header p {
  margin: 0;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 1.5rem;
  font-size: 2.5rem;
  line-height: 1.1;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 0.75rem;
  background-color: #292524;
}

caption {
  padding-bottom: 0.75rem;
  text-align: start;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: start;
}

footer {
  margin-top: 1.5rem;
}

footer a {
  color: #fbbf24;
}

/* ===== Tvoje selektory ===== */

caption {
  color: rgb(231 229 228 / 0.65);
  font-size: 0.8125rem;
  font-style: italic;
}

th {
  background-color: #7c2d12;
  color: #ffedd5;
}

tbody tr:nth-child(2n) td {
  background-color: #3a3430;
}

td:first-child {
  font-weight: 600;
}

[data-status="vyprodano"] td {
  color: #a8a29e;
}

[data-status="vyprodano"] td:first-child + td {
  text-decoration: line-through;
}

a[href^="/vstupenky"] {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border: 1px solid #fb923c;
  border-radius: 0.375rem;
  background-color: rgb(251 146 60 / 0.15);
  color: #fed7aa;
  text-decoration: none;
}

a[href^="/vstupenky"]:hover {
  box-shadow: 0 0 0 3px rgb(251 146 60 / 0.35);
}

a[href^="/vstupenky"]:focus-visible {
  outline: 2px solid #fb923c;
  outline-offset: 3px;
}

footer a[href$=".pdf"]::before {
  content: "↓ ";
}

footer a[href*="://"]::after {
  content: " ↗";
}
```

# --review--

Testy kontrolují, co selektory vyberou. Tohle zkontroluj sám.

## --rubric--

- U každého selektoru umíš říct, které prvky vybere, aniž bys otevřel náhled.
- Žádný selektor není delší, než je potřeba (`main table tbody tr td a` tam, kde stačí `tbody a`).
- Stavy `:hover` a `:focus-visible` mění jen to, co se má změnit, zbytek vzhledu přebírají ze základního pravidla.
- Tlumený text vyprodaných filmů má pořád dost kontrastu, aby se dal přečíst.

## --extensions--

Zvýrazni dnešní představení (třeba pátek) přes `:nth-child()` tak, aby se to dalo příští týden přepsat jedním číslem. Přidej před den promítání ikonu přes `::before`. Zkus, co udělá `tbody tr:hover` s celým řádkem.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Program — Letní kino Ostrov</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main>
      <header>
        <p>Letní kino Ostrov · Písek</p>
        <h1>Program na týden</h1>
      </header>

      <table>
        <caption>Promítáme od 21:30, za deště v sále kulturního domu.</caption>
        <thead>
          <tr>
            <th scope="col">Den</th>
            <th scope="col">Film</th>
            <th scope="col">Vstupenky</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Po 6. 7.</td>
            <td>Vlny</td>
            <td><a href="/vstupenky/vlny">Koupit</a></td>
          </tr>
          <tr data-status="vyprodano">
            <td>Út 7. 7.</td>
            <td>Pelíšky</td>
            <td>Vyprodáno</td>
          </tr>
          <tr>
            <td>St 8. 7.</td>
            <td>Kolja</td>
            <td><a href="/vstupenky/kolja">Koupit</a></td>
          </tr>
          <tr>
            <td>Čt 9. 7.</td>
            <td>Amélie z Montmartru</td>
            <td><a href="/vstupenky/amelie">Koupit</a></td>
          </tr>
          <tr>
            <td>Pá 10. 7.</td>
            <td>Duna: Část druhá</td>
            <td><a href="/vstupenky/duna-2">Koupit</a></td>
          </tr>
          <tr>
            <td>So 11. 7.</td>
            <td>Tři oříšky pro Popelku</td>
            <td><a href="/vstupenky/popelka">Koupit</a></td>
          </tr>
          <tr data-status="vyprodano">
            <td>Ne 12. 7.</td>
            <td>Na samotě u lesa</td>
            <td>Vyprodáno</td>
          </tr>
        </tbody>
      </table>

      <footer>
        <p>Stáhni si <a href="/program/cervenec-2026.pdf">program na celý červenec</a>, podívej se na <a href="/vstupne">ceník vstupného</a> nebo si přečti hodnocení filmů na <a href="https://www.csfd.cz">ČSFD</a> a najdi cestu na <a href="https://mapy.cz">Mapy.cz</a>.</p>
      </footer>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
/* Základní vzhled je hotový. Téma, barvy a písmo klidně změň.
   HTML neměň — všechno ostatní vybereš selektory. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #e7e5e4;
  background-color: #1c1917;
}

main {
  max-width: 44rem;
  margin: 0 auto;
}

header p {
  margin: 0;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 1.5rem;
  font-size: 2.5rem;
  line-height: 1.1;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 0.75rem;
  background-color: #292524;
}

caption {
  padding-bottom: 0.75rem;
  text-align: start;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: start;
}

footer {
  margin-top: 1.5rem;
}

footer a {
  color: #fbbf24;
}

/* ===== Tvoje selektory ===== */

--edit--

--edit--
```

# --solution--

## --file-- styles.css

```css
/* Základní vzhled je hotový. Téma, barvy a písmo klidně změň.
   HTML neměň — všechno ostatní vybereš selektory. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #e7e5e4;
  background-color: #1c1917;
}

main {
  max-width: 44rem;
  margin: 0 auto;
}

header p {
  margin: 0;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 1.5rem;
  font-size: 2.5rem;
  line-height: 1.1;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 0.75rem;
  background-color: #292524;
}

caption {
  padding-bottom: 0.75rem;
  text-align: start;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: start;
}

footer {
  margin-top: 1.5rem;
}

footer a {
  color: #fbbf24;
}

/* ===== Tvoje selektory ===== */

caption {
  color: #a8a29e;
  font-size: 0.875rem;
}

thead th {
  background-color: #b45309;
  color: #fffbeb;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

tbody tr:nth-child(even) {
  background-color: #312d2a;
}

tbody td:first-child {
  font-weight: 700;
  white-space: nowrap;
}

tr[data-status="vyprodano"] {
  color: #78716c;
}

tr[data-status="vyprodano"] td:nth-child(2) {
  text-decoration: line-through;
}

tbody a {
  display: inline-block;
  padding: 0.25rem 0.875rem;
  border-radius: 999px;
  background-color: #fbbf24;
  color: #1c1917;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

tbody a:hover {
  background-color: #fde68a;
}

tbody a:focus-visible {
  outline: 3px solid #fde68a;
  outline-offset: 2px;
}

a[href$=".pdf"]::before {
  content: "PDF ";
  font-size: 0.75rem;
  font-weight: 700;
}

a[href^="https://"]::after {
  content: " ↗";
}
```
