---
title: Ceník tarifů
---

# --description--

Služba **Mrak** nabízí online úložiště fotek ve třech tarifech. HTML stránky s ceníkem je hotové a základní vzhled (písmo, barvy, rámečky karet, vzhled tlačítek) taky. Chybí rozvržení — všechno leží pod sebou. Rozvrhni ceník flexboxem v souboru `styles.css`. HTML neměň.

Tentokrát bez návodu. Rozmysli si, který prvek má být flex kontejner, kudy vede jeho hlavní osa a co se má stát s volným místem.

**Uživatelské příběhy:**

1. Na počítači (šířka 1024 px) vidí uživatel tři tarify **vedle sebe v jednom řádku**, všechny stejně široké, s mezerou aspoň 16 px.
2. Tarify v řádku jsou **stejně vysoké**, i když má každý jinak dlouhý seznam výhod.
3. Tlačítka všech tří tarifů jsou **u spodního okraje karty** a leží na jedné výšce, takže se dají porovnat pohledem.
4. Tlačítko je přes celou šířku karty tarifu.
5. Prostřední tarif **Plus** je zvýrazněný — liší se od ostatních barvou pozadí nebo rámečku.
6. Štítek „Nejoblíbenější" u tarifu Plus je malý, jen tak široký jako jeho text.
7. Na telefonu (šířka 480 px) jsou tarify **pod sebou**, každý přes celou šířku ceníku, v pořadí Start, Plus, Studio.
8. Na žádné šířce (1024, 760 ani 480 px) nejde stránka posouvat do strany.

Tip: k příběhu 7 nepotřebuješ media dotaz. Stačí dobře zvolit `flex-wrap` a `flex-basis`.

# --hints--

Na šířce 1024 px jsou tři tarify vedle sebe v jednom řádku v pořadí Start, Plus, Studio.

```js
const plans = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect());
assert.equal(plans.length, 3, 'Ceník má mít tři tarify');
assert.ok(Math.abs(plans[1].top - plans[0].top) <= 1 && Math.abs(plans[2].top - plans[0].top) <= 1, 'Tarify mají být ve stejném řádku');
assert.ok(plans[0].right <= plans[1].left && plans[1].right <= plans[2].left, 'Pořadí zleva má být Start, Plus, Studio');
```

Na šířce 1024 px jsou všechny tři tarify stejně široké.

```js
const widths = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect().width);
for (const width of widths) {
  // Tolerance pár pixelů: zvýrazněný tarif smí mít silnější rámeček.
  assert.ok(Math.abs(width - widths[0]) <= 4, `Šířky tarifů jsou ${widths.map(Math.round).join(', ')} px`);
}
```

Mezi tarify je mezera aspoň 16 px.

```js
const plans = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect());
for (let i = 1; i < plans.length; i++) {
  const space = plans[i].left - plans[i - 1].right;
  assert.ok(space >= 16 - 0.5, `Mezera před ${i + 1}. tarifem je ${space} px`);
}
```

Tarify v řádku jsou stejně vysoké.

```js
const heights = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect().height);
for (const height of heights) {
  assert.ok(Math.abs(height - heights[0]) <= 1, `Výšky tarifů jsou ${heights.map(Math.round).join(', ')} px`);
}
```

Tlačítka jsou u spodního okraje karet a leží na jedné výšce.

```js
const bottoms = [...document.querySelectorAll('.plan')].map((plan, i) => {
  const style = getComputedStyle(plan);
  const contentBottom = plan.getBoundingClientRect().bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
  const button = plan.querySelector('.plan__button').getBoundingClientRect();
  assert.ok(Math.abs(button.bottom - contentBottom) <= 1, `Tlačítko ${i + 1}. tarifu není u spodního okraje karty`);
  return button.top;
});
for (const top of bottoms) {
  assert.ok(Math.abs(top - bottoms[0]) <= 1, `Tlačítka začínají na ${bottoms.map(Math.round).join(', ')} px`);
}
```

Tlačítko je přes celou šířku karty tarifu.

```js
document.querySelectorAll('.plan').forEach((plan, i) => {
  const style = getComputedStyle(plan);
  const contentWidth = plan.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const button = plan.querySelector('.plan__button').getBoundingClientRect();
  assert.ok(Math.abs(button.width - contentWidth) <= 1, `Tlačítko ${i + 1}. tarifu je široké ${button.width} px, karta má uvnitř ${contentWidth} px`);
});
```

Prostřední tarif je zvýrazněný jinou barvou pozadí nebo rámečku než ostatní.

```js
const [start, plus, studio] = [...document.querySelectorAll('.plan')].map((plan) => getComputedStyle(plan));
const look = (style) => `${style.backgroundColor}|${style.borderTopColor}`;
assert.notEqual(look(plus), look(start), 'Tarif Plus vypadá stejně jako Start');
assert.notEqual(look(plus), look(studio), 'Tarif Plus vypadá stejně jako Studio');
```

Štítek „Nejoblíbenější" je jen tak široký jako jeho text, ne přes celou kartu.

```js
const plan = document.querySelector('.plan--featured');
const style = getComputedStyle(plan);
const contentWidth = plan.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
const badge = plan.querySelector('.plan__badge').getBoundingClientRect();
assert.ok(badge.width < contentWidth / 2, `Štítek je široký ${badge.width} px, karta má uvnitř ${contentWidth} px`);
```

Na šířce 480 px jsou tarify pod sebou v pořadí Start, Plus, Studio, každý přes celou šířku ceníku.

```js
await helpers.resize(480);
const list = document.querySelector('.plans').getBoundingClientRect();
const plans = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect());
plans.forEach((plan, i) => {
  assert.ok(Math.abs(plan.width - list.width) <= 1, `${i + 1}. tarif je široký ${plan.width} px, ceník ${list.width} px`);
  if (i > 0) assert.ok(plan.top >= plans[i - 1].bottom, `${i + 1}. tarif má být pod předchozím`);
});
```

Na šířce 480 px nejde stránka posouvat do strany.

```js
await helpers.resize(480);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Obsah je široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
```

Na šířce 760 px nejde stránka posouvat do strany a žádný tarif nepřesahuje okraj ceníku.

```js
await helpers.resize(760);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Obsah je široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
const list = document.querySelector('.plans').getBoundingClientRect();
document.querySelectorAll('.plan').forEach((plan, i) => {
  const box = plan.getBoundingClientRect();
  assert.ok(box.left >= list.left - 1 && box.right <= list.right + 1, `${i + 1}. tarif přesahuje okraj ceníku`);
});
```

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mrak — ceník</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="pricing">
      <h1>Vyber si tarif</h1>
      <p class="pricing__intro">Všechny tarify můžeš kdykoli změnit nebo zrušit. Platíš měsíčně.</p>

      <ul class="plans">
        <li class="plan">
          <h2 class="plan__name">Start</h2>
          <p class="plan__price"><strong>0&nbsp;Kč</strong> / měsíc</p>
          <ul class="plan__features">
            <li>15 GB pro fotky</li>
            <li>Sdílení alb odkazem</li>
          </ul>
          <a class="plan__button" href="#">Začít zdarma</a>
        </li>
        <li class="plan plan--featured">
          <p class="plan__badge">Nejoblíbenější</p>
          <h2 class="plan__name">Plus</h2>
          <p class="plan__price"><strong>149&nbsp;Kč</strong> / měsíc</p>
          <ul class="plan__features">
            <li>500 GB pro fotky a videa</li>
            <li>Sdílení alb odkazem i heslem</li>
            <li>Automatická záloha z telefonu</li>
            <li>Úpravy fotek v prohlížeči</li>
            <li>Rodinný účet až pro 5 lidí</li>
          </ul>
          <a class="plan__button" href="#">Vyzkoušet 30 dní</a>
        </li>
        <li class="plan">
          <h2 class="plan__name">Studio</h2>
          <p class="plan__price"><strong>399&nbsp;Kč</strong> / měsíc</p>
          <ul class="plan__features">
            <li>2 TB pro fotky a videa</li>
            <li>Vlastní doména pro portfolio</li>
            <li>Fotky v plném rozlišení RAW</li>
          </ul>
          <a class="plan__button" href="#">Kontaktovat obchod</a>
        </li>
      </ul>
    </main>
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

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #1e1b4b;
  background: #f8fafc;
}

.pricing {
  max-width: 64rem;
  margin-inline: auto;
  padding: 2.5rem 1.5rem;
}

h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.2;
}

.pricing__intro {
  margin: 0.5rem 0 2rem;
  color: #64748b;
}

.plans {
  margin: 0;
  padding: 0;
  list-style: none;
}

.plan {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
}

.plan__badge {
  margin: 0 0 0.75rem;
  padding: 0.125rem 0.75rem;
  border-radius: 999px;
  background: #4f46e5;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.plan__name {
  margin: 0;
  font-size: 1.25rem;
}

.plan__price {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.plan__price strong {
  color: #1e1b4b;
  font-size: 1.75rem;
}

.plan__features {
  margin: 1.25rem 0 1.5rem;
  padding-left: 1.25rem;
}

.plan__features li + li {
  margin-top: 0.375rem;
}

.plan__button {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  background: #1e1b4b;
  color: #fff;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.plan__button:hover {
  background: #4f46e5;
}

/* Rozvržení ceníku */
--edit--

--edit--
```

# --solution--

## --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #1e1b4b;
  background: #f8fafc;
}

.pricing {
  max-width: 64rem;
  margin-inline: auto;
  padding: 2.5rem 1.5rem;
}

h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.2;
}

.pricing__intro {
  margin: 0.5rem 0 2rem;
  color: #64748b;
}

.plans {
  margin: 0;
  padding: 0;
  list-style: none;
}

.plan {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
}

.plan__badge {
  margin: 0 0 0.75rem;
  padding: 0.125rem 0.75rem;
  border-radius: 999px;
  background: #4f46e5;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.plan__name {
  margin: 0;
  font-size: 1.25rem;
}

.plan__price {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.plan__price strong {
  color: #1e1b4b;
  font-size: 1.75rem;
}

.plan__features {
  margin: 1.25rem 0 1.5rem;
  padding-left: 1.25rem;
}

.plan__features li + li {
  margin-top: 0.375rem;
}

.plan__button {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  background: #1e1b4b;
  color: #fff;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.plan__button:hover {
  background: #4f46e5;
}

/* Rozvržení ceníku */

/* Tarify vedle sebe; když se nevejdou, zalomí se pod sebe. */
.plans {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

/* Každý tarif začíná na 16rem, roste do volného místa a je sloupec. */
.plan {
  display: flex;
  flex: 1 1 16rem;
  flex-direction: column;
  min-width: 0;
}

/* Štítek se neroztahuje přes celou šířku karty. */
.plan__badge {
  align-self: flex-start;
}

/* Automatický margin posune tlačítko ke dnu karty. */
.plan__button {
  margin-block-start: auto;
}

.plan--featured {
  border: 2px solid #4f46e5;
  background: #eef2ff;
}
```
