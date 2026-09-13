---
title: Ceník tarifů
see: css-flexbox/workshop-navigace/021, css-flexbox/flex-do-hloubky#tri-cisla-basis-grow-shrink
---

# --description--

Služba **Mrak** nabízí online úložiště fotek ve třech tarifech. HTML stránky s ceníkem je hotové a základní vzhled (písmo, barvy, rámečky karet, vzhled tlačítek) taky. Chybí rozvržení — všechno leží pod sebou. Rozvrhni ceník v souboru `styles.css`. HTML neměň.

Tentokrát bez návodu. Rozmysli si, které prvky mají být flex kontejnery, kudy vede jejich hlavní osa a co se má stát s volným místem.

**Co má ceník umět:**

- Když si uživatel otevře ceník na počítači (šířka 1024 px), vidí tři tarify **vedle sebe v jednom řádku**, všechny stejně široké a s mezerou mezi sebou.
- Tarify v řádku jsou **stejně vysoké**, i když má každý jinak dlouhý seznam výhod.
- Tlačítka všech tří tarifů jsou **u spodního okraje karty** a leží na jedné výšce, takže se dají porovnat pohledem. Každé tlačítko je přes celou šířku své karty.
- Prostřední tarif **Plus** je zvýrazněný barvou pozadí nebo rámečku a jeho štítek „Nejoblíbenější" je jen tak široký jako text.
- Když si ceník otevře na telefonu (šířka 480 px), jsou tarify **pod sebou** v pořadí Start, Plus, Studio, každý přes celou šířku ceníku.
- Na žádné šířce (1024, 760 ani 480 px) nejde stránka posouvat do strany.

> [!TIP]
> Ceník jde postavit s media dotazem i bez něj. Po splnění uvidíš v „Jiných přístupech" obě cesty i třetí s gridem — rozmysli si ale nejdřív vlastní.

Průběžně kontroluj náhled v šířkách „Jako testy", 768 a 375 z přepínače nad náhledem. Testy měří na 1024, 760 a 480 px, takže 768 a 375 jsou nejbližší šířky, které si v náhledu přepneš.

# --hints--

Na šířce 1024 px jsou tři tarify vedle sebe v jednom řádku v pořadí Start, Plus, Studio.

```js
const plans = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect());
assert.equal(plans.length, 3, 'Ceník má mít tři tarify (počet .plan)');
assert.ok(Math.abs(plans[1].top - plans[0].top) <= 1 && Math.abs(plans[2].top - plans[0].top) <= 1, `Tarify mají být ve stejném řádku (horní hrany ${plans.map((p) => Math.round(p.top)).join(', ')} px)`);
assert.ok(plans[0].right <= plans[1].left && plans[1].right <= plans[2].left, 'Pořadí tarifů zleva má být Start, Plus, Studio');
```

Na šířce 1024 px jsou všechny tři tarify stejně široké.

```js
const widths = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect().width);
for (const width of widths) {
  // Tolerance pár pixelů: zvýrazněný tarif smí mít silnější rámeček.
  assert.ok(Math.abs(width - widths[0]) <= 4, `Šířky tarifů jsou ${widths.map(Math.round).join(', ')} px — mají být stejné`);
}
```

Mezi tarify je mezera aspoň 16 px.

```js
const plans = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect());
for (let i = 1; i < plans.length; i++) {
  const space = plans[i].left - plans[i - 1].right;
  assert.ok(space >= 16 - 0.5, `Mezera před ${i + 1}. tarifem je ${Math.round(space)} px, čekám aspoň 16 px`);
}
```

Tarify v řádku jsou stejně vysoké.

```js
const heights = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect().height);
for (const height of heights) {
  assert.ok(Math.abs(height - heights[0]) <= 1, `Výšky tarifů jsou ${heights.map(Math.round).join(', ')} px — mají být stejné`);
}
```

Tlačítka jsou u spodního okraje karet a leží na jedné výšce.

```js
const tops = [...document.querySelectorAll('.plan')].map((plan, i) => {
  const style = getComputedStyle(plan);
  const contentBottom = plan.getBoundingClientRect().bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
  const button = plan.querySelector('.plan__button').getBoundingClientRect();
  assert.ok(Math.abs(button.bottom - contentBottom) <= 1, `Tlačítko ${i + 1}. tarifu končí na ${Math.round(button.bottom)} px, obsah karty až na ${Math.round(contentBottom)} px`);
  return button.top;
});
for (const top of tops) {
  assert.ok(Math.abs(top - tops[0]) <= 1, `Tlačítka začínají na ${tops.map(Math.round).join(', ')} px — mají být na jedné výšce`);
}
```

Tlačítko je přes celou šířku karty tarifu.

```js
document.querySelectorAll('.plan').forEach((plan, i) => {
  const style = getComputedStyle(plan);
  const contentWidth = plan.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const button = plan.querySelector('.plan__button').getBoundingClientRect();
  assert.ok(Math.abs(button.width - contentWidth) <= 1, `Tlačítko ${i + 1}. tarifu je široké ${Math.round(button.width)} px, karta má uvnitř ${Math.round(contentWidth)} px`);
});
```

Prostřední tarif je zvýrazněný jinou barvou pozadí nebo rámečku než ostatní.

```js
const [start, plus, studio] = [...document.querySelectorAll('.plan')].map((plan) => getComputedStyle(plan));
const look = (style) => `pozadí ${style.backgroundColor}, rámeček ${style.borderTopColor}`;
assert.notEqual(look(plus), look(start), 'Tarif Plus vypadá stejně jako Start (barva pozadí i rámečku)');
assert.notEqual(look(plus), look(studio), 'Tarif Plus vypadá stejně jako Studio (barva pozadí i rámečku)');
```

Štítek „Nejoblíbenější" je jen tak široký jako jeho text, ne přes celou kartu.

```js
const plan = document.querySelector('.plan--featured');
const style = getComputedStyle(plan);
const contentWidth = plan.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
const badge = plan.querySelector('.plan__badge').getBoundingClientRect();
assert.ok(badge.width < contentWidth / 2, `Štítek je široký ${Math.round(badge.width)} px, karta má uvnitř ${Math.round(contentWidth)} px — má být jen tak široký jako text`);
```

Na šířce 480 px jsou tarify pod sebou v pořadí Start, Plus, Studio, každý přes celou šířku ceníku.

```js
await helpers.resize(480);
const list = document.querySelector('.plans').getBoundingClientRect();
const plans = [...document.querySelectorAll('.plan')].map((plan) => plan.getBoundingClientRect());
plans.forEach((plan, i) => {
  assert.ok(Math.abs(plan.width - list.width) <= 1, `Při šířce 480 px je ${i + 1}. tarif široký ${Math.round(plan.width)} px, ceník ${Math.round(list.width)} px`);
  if (i > 0) assert.ok(plan.top >= plans[i - 1].bottom, `Při šířce 480 px má být ${i + 1}. tarif pod předchozím`);
});
```

Na šířce 480 px nejde stránka posouvat do strany.

```js
await helpers.resize(480);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce 480 px je obsah široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
```

Na šířce 760 px nejde stránka posouvat do strany a žádný tarif nepřesahuje okraj ceníku.

```js
await helpers.resize(760);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce 760 px je obsah široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
const list = document.querySelector('.plans').getBoundingClientRect();
document.querySelectorAll('.plan').forEach((plan, i) => {
  const box = plan.getBoundingClientRect();
  assert.ok(box.left >= list.left - 1 && box.right <= list.right + 1, `Při šířce 760 px přesahuje ${i + 1}. tarif okraj ceníku (${Math.round(box.left)}–${Math.round(box.right)} px, ceník ${Math.round(list.left)}–${Math.round(list.right)} px)`);
});
```

# --help--

## --tip-- 5

Tlačítko se ke dnu karty dostane, jen když je tarif sám flex kontejner ve sloupci a volné místo v kartě se nahromadí nad tlačítkem. Stejný řetěz jsi postavil v kroku [Patička karty u dna](see:css-flexbox/workshop-navigace/021).

## --tip-- 9

Bez media dotazu stačí, aby tarif startoval na vhodné výchozí velikosti, smí růst a seznam se smí zalamovat. Spočítej si, jaká výchozí velikost pustí na 1024 px tři tarify vedle sebe, ale na 480 px ani dva: ceník má po odečtení vnitřního odsazení 48 px uvnitř `šířka − 48` px a mezi tarify je `gap`. Jak to počítá prohlížeč, je v [Tři čísla: basis, grow, shrink](see:css-flexbox/flex-do-hloubky#tri-cisla-basis-grow-shrink).

# --approaches--

## --approach-- Zalamování s výchozí velikostí

Žádný media dotaz: tarify startují na `16rem`, rostou do volného místa a seznam je zalomí, když se nevejdou. Hodí se, když má rozvržení reagovat na místo, které má **ceník**, ne celé okno — funguje stejně v úzkém postranním sloupci i na celé stránce.

### --file-- styles.css

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

## --approach-- Media dotaz

Tarify jsou vždycky v řádku a stejně široké (`flex: 1 1 0`); pod 40rem media dotaz otočí hlavní osu seznamu do sloupce. Bod zlomu máš přesně pod kontrolou, ale rozhoduje šířka okna, ne místo, které ceník opravdu dostal.

### --file-- styles.css

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

/* Tarify vždy v jednom řádku, stejně široké. */
.plans {
  display: flex;
  gap: 1.5rem;
}

.plan {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
}

.plan__badge {
  align-self: flex-start;
}

.plan__button {
  margin-block-start: auto;
}

.plan--featured {
  border: 2px solid #4f46e5;
  background: #eef2ff;
}

/* Úzké okno: hlavní osa seznamu vede shora dolů. */
@media (max-width: 40rem) {
  .plans {
    flex-direction: column;
  }
}
```

## --approach-- Grid s auto-fit

Seznam je mřížka se sloupci `repeat(auto-fit, minmax(16rem, 1fr))`, flexbox zůstává uvnitř tarifu. Na 760 px vzniknou dva sloupce a třetí tarif je pod prvním ve stejné šířce — na rozdíl od flexboxu, kde by se poslední tarif roztáhl přes celý řádek. Grid podrobně probírá sekce CSS Grid.

### --file-- styles.css

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

/* Mřížka: tolik sloupců po aspoň 16rem, kolik se vejde. */
.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
}

/* Uvnitř tarifu zůstává flexbox ve sloupci. */
.plan {
  display: flex;
  flex-direction: column;
}

.plan__badge {
  align-self: flex-start;
}

.plan__button {
  margin-block-start: auto;
}

.plan--featured {
  border: 2px solid #4f46e5;
  background: #eef2ff;
}
```

# --review--

Testy kontrolují rozvržení. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- V CSS nejsou pevné šířky v pixelech, které by na jiné šířce ceník rozbily.
- Tlačítko u dna drží automatický margin nebo růst, ne ručně nastavená výška karty.
- Víš, proč tvůj ceník na 760 px vypadá tak, jak vypadá (dva tarify a jeden pod nimi, nebo tři úzké vedle sebe).
- Zvýraznění tarifu Plus je vidět i bez barev: silnější rámeček nebo štítek, ne jen jiný odstín pozadí.
- Prošel jsi náhled v šířkách „Jako testy", 768 a 375 a nic nepřeteklo.

## --extensions--

Přepínač „měsíčně / ročně" nad ceníkem (dvě tlačítka vedle sebe, aktivní zvýrazněné), tarif Plus o kousek vyšší než ostatní tak, aby tlačítka zůstala na jedné výšce, a seznam výhod s ikonou fajfky, která se při zalomení textu nezmenší.

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
