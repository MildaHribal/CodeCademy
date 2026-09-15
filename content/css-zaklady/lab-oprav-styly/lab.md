---
title: Oprav rozbité menu
kind: debug
see: css-zaklady/devtools-pro-css#styles-ktera-pravidla-na-prvek-miri, css-zaklady/devtools-pro-css#panel-styles-co-plati-a-co-je-preskrtnute, css-zaklady/workshop-vizitka/005
---

# --description--

Bistro U Zvonu v Olomouci vyvěšuje každý den polední menu na web. Kolega mu upravil styly a odjel na dovolenou. Obsluha teď hlásí tři chyby. Chyby spolu nesouvisejí a každá je na jiném místě `styles.css`. HTML je v pořádku, neměň ho.

## Hlášení

- **Ceny.** Ceny jídel měly být tučné, tmavě zelené (`#166534`) a o kus větší než běžný text (18 px). Jsou ale obyčejné, tmavé jako název jídla a stejně velké jako běžný text.
- **Alergeny.** Řádek „Alergeny: …" pod každým jídlem měl být oranžovohnědý (`#b45309`), aby ho šlo rychle najít. Menší písmo sedí, ale barva je stejně tmavá jako název jídla. Kolega tvrdí, že barvu do pravidla `.allergens` napsal a je správná.
- **Denní nabídka.** Doporučená svíčková má mít vlevo výrazný červený pruh široký 4 px (`#b91c1c`). Světle žluté pozadí má, pruh žádný. Editor u deklarace nic nepodtrhává.

## Úkol

Oprav všechny tři chyby. U každé změň co nejmenší kus kódu a zkontroluj, že zbytek menu vypadá jako předtím.

Tentokrát nehledej očima v kódu. Nad náhledem klikni na **Nová karta**, u každého prvku z hlášení klikni pravým tlačítkem na **Prozkoumat** a zeptej se DevTools: míří pravidlo na prvek? Vyhrála deklarace? Jakou hodnotu prohlížeč spočítal?

# --hints--

Ceny jídel mají tmavě zelenou barvu `#166534`.

```js
document.querySelectorAll('.dish__price').forEach((price, i) => {
  assert.equal(getComputedStyle(price).color, 'rgb(22, 101, 52)', `getComputedStyle(${i + 1}. .dish__price).color má být rgb(22, 101, 52), tedy #166534`);
});
```

Ceny jídel jsou tučné (700) a mají velikost písma 18 px.

```js
document.querySelectorAll('.dish__price').forEach((price, i) => {
  const style = getComputedStyle(price);
  assert.equal(style.fontWeight, '700', `getComputedStyle(${i + 1}. .dish__price).fontWeight má být 700`);
  assert.equal(style.fontSize, '18px', `getComputedStyle(${i + 1}. .dish__price).fontSize má být 18px`);
});
```

Ceny zůstávají vpravo vedle názvu jídla, ne pod ním.

```js
document.querySelectorAll('.dish').forEach((dish, i) => {
  const name = dish.querySelector('.dish__name').getBoundingClientRect();
  const price = dish.querySelector('.dish__price').getBoundingClientRect();
  assert.ok(price.left >= name.right && price.top < name.bottom, `Cena ${i + 1}. jídla má být vpravo od názvu ve stejném řádku`);
});
```

Alergeny mají oranžovohnědou barvu `#b45309`.

```js
document.querySelectorAll('.allergens').forEach((line, i) => {
  assert.equal(getComputedStyle(line).color, 'rgb(180, 83, 9)', `getComputedStyle(${i + 1}. .allergens).color má být rgb(180, 83, 9), tedy #b45309`);
});
```

Alergeny mají dál menší písmo 14 px.

```js
document.querySelectorAll('.allergens').forEach((line, i) => {
  assert.equal(getComputedStyle(line).fontSize, '14px', `getComputedStyle(${i + 1}. .allergens).fontSize má zůstat 14px`);
});
```

Denní nabídka má vlevo plný pruh široký 4 px v barvě `#b91c1c`.

```js
const style = getComputedStyle(document.querySelector('.daily-special'));
assert.equal(style.borderLeftStyle, 'solid', 'getComputedStyle(.daily-special).borderLeftStyle má být solid');
assert.equal(style.borderLeftWidth, '4px', 'getComputedStyle(.daily-special).borderLeftWidth má být 4px');
assert.equal(style.borderLeftColor, 'rgb(185, 28, 28)', 'getComputedStyle(.daily-special).borderLeftColor má být rgb(185, 28, 28), tedy #b91c1c');
```

Denní nabídka má dál světle žluté pozadí a ostatní jídla pruh nemají.

```js
assert.equal(getComputedStyle(document.querySelector('.daily-special')).backgroundColor, 'rgb(254, 252, 232)', 'getComputedStyle(.daily-special).backgroundColor má zůstat rgb(254, 252, 232)');
document.querySelectorAll('.dish:not(.daily-special)').forEach((dish, i) => {
  assert.equal(getComputedStyle(dish).borderLeftStyle, 'none', `Obyčejné jídlo č. ${i + 1} nemá mít levý pruh`);
});
```

Názvy jídel zůstávají tmavé a hlavička menu beze změny.

```js
document.querySelectorAll('.dish__name').forEach((name, i) => {
  assert.equal(getComputedStyle(name).color, 'rgb(28, 25, 23)', `getComputedStyle(${i + 1}. .dish__name).color má zůstat rgb(28, 25, 23)`);
});
assert.equal(getComputedStyle(document.querySelector('.menu__title')).fontSize, '40px', 'Nadpis menu má zůstat 40px');
assert.equal(getComputedStyle(document.querySelector('.menu__eyebrow')).color, 'rgb(185, 28, 28)', 'Řádek nad nadpisem má zůstat červený');
```

HTML stránky zůstává beze změny: jídla mají pořád své původní třídy.

```js
assert.equal(document.querySelectorAll('article.dish').length, 4, 'Menu má mít 4 prvky article.dish');
assert.equal(document.querySelectorAll('p.dish__price').length, 4, 'Každé jídlo má mít cenu p.dish__price');
assert.equal(document.querySelectorAll('p.allergens').length, 4, 'Každé jídlo má mít řádek p.allergens');
assert.equal(document.querySelectorAll('.daily-special').length, 1, 'Denní nabídka .daily-special má být jedna');
```

# --help--

## --tip-- 1

Pravidlo, které v panelu Styles u prvku vůbec není, na prvek nemíří. Porovnej jeho selektor s tím, jak se v CSS zapisuje třída — připomene to [Anatomie pravidla](see:css-zaklady/jak-css-funguje#anatomie-pravidla-selektor-a-deklarace).

## --tip-- 6

V panelu Styles je deklarace pruhu platná a nepřeškrtnutá, a přesto pruh chybí. Podívej se do Computed na `border-left-style` a vzpomeň si, co je u zkratky `border` povinné ([pátý krok vizitky](see:css-zaklady/workshop-vizitka/005)).

# --explain--

Vysvětli vlastními slovy, proč barva alergenů neplatila, přestože byla v pravidle `.allergens` napsaná správně, a jak ti s tím pomohly DevTools.

## --model--

Na konci stylopisu zůstalo staré pravidlo se stejným selektorem `.allergens`, které nastavilo barvu na `inherit`. U stejných selektorů vyhrává pozdější pravidlo, takže oranžová prohrála a alergeny zdědily tmavou barvu. V DevTools byla oranžová přeškrtnutá bez ikony varování, což znamená přebitá, ne neplatná — a nad ní bylo vidět vítězné pravidlo i s řádkem, kde leží.

## --checklist--

- Na konci stylopisu bylo druhé pravidlo `.allergens`.
- U stejných selektorů vyhrává to pozdější.
- Přeškrtnutá deklarace bez ikony je přebitá, ne neplatná.
- DevTools ukážou vítězné pravidlo i s místem ve stylopisu.

# --approaches--

## --approach-- Nejmenší oprava

Tři malé zásahy: doplněná tečka v selektoru, smazané staré pravidlo z jarního menu a doplněný styl `solid` do zkratky `border-left`. Přesně to, co by prošlo rychlou kontrolou kódu.

### --file-- styles.css

```css
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
  color: #1c1917;
  background-color: #f5f5f4;
}

.menu {
  max-width: 40rem;
  margin: 0 auto;
}

/* ===== Hlavička ===== */

.menu__header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.menu__eyebrow {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu__title {
  margin: 0.25rem 0;
  font-size: 2.5rem;
  line-height: 1.1;
}

.menu__date {
  margin: 0;
  color: #57534e;
}

/* ===== Jídla ===== */

.dish {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background-color: white;
  box-shadow: 0 1px 2px rgb(28 25 23 / 0.08);
}

.dish__label {
  grid-column: 1 / -1;
  margin: 0 0 0.25rem;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.dish__name {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.3;
}

.dish__price {
  margin: 0;
  color: #166534;
  font-size: 1.125rem;
  font-weight: 700;
}

.allergens {
  grid-column: 1 / -1;
  margin: 0.25rem 0 0;
  color: #b45309;
  font-size: 0.875rem;
}

.daily-special {
  background-color: #fefce8;
  border-left: 4px solid #b91c1c;
}

/* ===== Poznámka pod menu ===== */

.menu__note {
  margin: 1.5rem 0 0;
  color: #57534e;
  font-size: 0.875rem;
  text-align: center;
}
```

## --approach-- Oprava s rozepsanými vlastnostmi

Stejné chyby, jiná volba zápisu. Selektor ceny je `.dish .dish__price` — vybere cenu jen uvnitř jídla (kombinátorům se věnuje lekce o selektorech). Pruh je rozepsaný do tří samostatných vlastností, takže styl nejde zapomenout. Delší zápis se hodí, když se v různých stavech mění jen jedna část rámečku, třeba barva.

### --file-- styles.css

```css
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
  color: #1c1917;
  background-color: #f5f5f4;
}

.menu {
  max-width: 40rem;
  margin: 0 auto;
}

/* ===== Hlavička ===== */

.menu__header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.menu__eyebrow {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu__title {
  margin: 0.25rem 0;
  font-size: 2.5rem;
  line-height: 1.1;
}

.menu__date {
  margin: 0;
  color: #57534e;
}

/* ===== Jídla ===== */

.dish {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background-color: white;
  box-shadow: 0 1px 2px rgb(28 25 23 / 0.08);
}

.dish__label {
  grid-column: 1 / -1;
  margin: 0 0 0.25rem;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.dish__name {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.3;
}

.dish .dish__price {
  margin: 0;
  color: #166534;
  font-size: 1.125rem;
  font-weight: 700;
}

.allergens {
  grid-column: 1 / -1;
  margin: 0.25rem 0 0;
  color: #b45309;
  font-size: 0.875rem;
}

.daily-special {
  background-color: #fefce8;
  border-left-width: 4px;
  border-left-style: solid;
  border-left-color: #b91c1c;
}

/* ===== Poznámka pod menu ===== */

.menu__note {
  margin: 1.5rem 0 0;
  color: #57534e;
  font-size: 0.875rem;
  text-align: center;
}
```

# --review--

Testy kontrolují, že je menu opravené. Tohle zkontroluj sám.

## --rubric--

- U každé chyby víš, kterou z otázek (míří pravidlo? vyhrálo? jaká je spočtená hodnota?) jsi ji v DevTools našel.
- Změnil jsi jen řádky, které chybu způsobily, zbytek stylopisu je jako předtím.
- Ve stylopisu nezůstala dvě pravidla se stejným selektorem, která si navzájem přepisují tutéž vlastnost.
- Umíš kolegovi jednou větou napsat, co bylo u které chyby špatně.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Polední menu — Bistro U Zvonu</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="menu">
      <header class="menu__header">
        <p class="menu__eyebrow">Bistro U Zvonu · Olomouc</p>
        <h1 class="menu__title">Polední menu</h1>
        <p class="menu__date">Úterý 15. září · 11:00–14:30</p>
      </header>

      <article class="dish daily-special">
        <p class="dish__label">Doporučujeme</p>
        <h2 class="dish__name">Svíčková na smetaně, houskový knedlík</h2>
        <p class="dish__price">189 Kč</p>
        <p class="allergens">Alergeny: 1, 3, 7, 9</p>
      </article>

      <article class="dish">
        <h2 class="dish__name">Kuřecí steak s bylinkovým máslem, grilovaná zelenina</h2>
        <p class="dish__price">209 Kč</p>
        <p class="allergens">Alergeny: 7</p>
      </article>

      <article class="dish">
        <h2 class="dish__name">Čočkový salát s balkánským sýrem a ředkvičkami</h2>
        <p class="dish__price">159 Kč</p>
        <p class="allergens">Alergeny: 7, 10</p>
      </article>

      <article class="dish">
        <h2 class="dish__name">Polévka dne: dýňový krém s pečenými semínky</h2>
        <p class="dish__price">59 Kč</p>
        <p class="allergens">Alergeny: 7, 11</p>
      </article>

      <p class="menu__note">Menu podáváme do vyprodání. Na bezlepkovou variantu se zeptej obsluhy.</p>
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
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #1c1917;
  background-color: #f5f5f4;
}

.menu {
  max-width: 40rem;
  margin: 0 auto;
}

/* ===== Hlavička ===== */

.menu__header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.menu__eyebrow {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu__title {
  margin: 0.25rem 0;
  font-size: 2.5rem;
  line-height: 1.1;
}

.menu__date {
  margin: 0;
  color: #57534e;
}

/* ===== Jídla ===== */

.dish {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background-color: white;
  box-shadow: 0 1px 2px rgb(28 25 23 / 0.08);
}

.dish__label {
  grid-column: 1 / -1;
  margin: 0 0 0.25rem;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.dish__name {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.3;
}

dish__price {
  margin: 0;
  color: #166534;
  font-size: 1.125rem;
  font-weight: 700;
}

.allergens {
  grid-column: 1 / -1;
  margin: 0.25rem 0 0;
  color: #b45309;
  font-size: 0.875rem;
}

.daily-special {
  background-color: #fefce8;
  border-left: 4px #b91c1c;
}

/* ===== Poznámka pod menu ===== */

.menu__note {
  margin: 1.5rem 0 0;
  color: #57534e;
  font-size: 0.875rem;
  text-align: center;
}

/* ===== Starší úpravy z jarního menu ===== */

.allergens {
  color: inherit;
}
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
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: #1c1917;
  background-color: #f5f5f4;
}

.menu {
  max-width: 40rem;
  margin: 0 auto;
}

/* ===== Hlavička ===== */

.menu__header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.menu__eyebrow {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu__title {
  margin: 0.25rem 0;
  font-size: 2.5rem;
  line-height: 1.1;
}

.menu__date {
  margin: 0;
  color: #57534e;
}

/* ===== Jídla ===== */

.dish {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background-color: white;
  box-shadow: 0 1px 2px rgb(28 25 23 / 0.08);
}

.dish__label {
  grid-column: 1 / -1;
  margin: 0 0 0.25rem;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.dish__name {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.3;
}

.dish__price {
  margin: 0;
  color: #166534;
  font-size: 1.125rem;
  font-weight: 700;
}

.allergens {
  grid-column: 1 / -1;
  margin: 0.25rem 0 0;
  color: #b45309;
  font-size: 0.875rem;
}

.daily-special {
  background-color: #fefce8;
  border-left: 4px solid #b91c1c;
}

/* ===== Poznámka pod menu ===== */

.menu__note {
  margin: 1.5rem 0 0;
  color: #57534e;
  font-size: 0.875rem;
  text-align: center;
}
```
