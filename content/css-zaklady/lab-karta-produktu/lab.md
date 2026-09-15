---
title: Karta produktu z design tokenů
see: css-zaklady/vlastni-vlastnosti#design-tokeny-pojmenovani-a-skala, css-zaklady/vlastni-vlastnosti#dedicnost-a-prepsani-v-komponente, css-zaklady/workshop-vizitka
---

# --description--

Karta produktu je nejčastější komponenta e-shopu: obrázek, štítek se slevou, název, popis, cena a tlačítko. V tomhle labu ji navrhneš sám, ale tak, jak se to dělá v týmu — všechny barvy, rozestupy a zaoblení bereš z design tokenů, takže když designér změní firemní barvu, karta se přebarví sama.

**Téma, texty a vzhled jsou tvoje volba.** Prodávej kávu, deskové hry, kola nebo vstupenky na koncerty. Texty v HTML přepiš, jak chceš, jen nech třídy prvků. Rozvržení karty je hotové v `styles.css`.

Tým používá tyhle tokeny a testy je hledají pod přesně těmito jmény:

| token | účel |
|---|---|
| `--color-accent` | firemní barva: tlačítko, štítek, ikona |
| `--color-accent-soft` | světlý odstín firemní barvy, **odvozený** z `--color-accent` |
| `--color-text` | hlavní text: název a cena |
| `--color-text-muted` | doplňující text: kategorie, popis, původní cena |
| `--color-surface` | pozadí karty a text na barevných plochách |
| `--space-s`, `--space-m` | malý a střední rozestup |
| `--radius` | zaoblení karty a tlačítka |

**Co má karta umět:**

- Všechny tokeny z tabulky jsou pro kartu definované.
- Karta má pozadí z `--color-surface`, zaoblené rohy z `--radius` a oddělí se od stránky stínem nebo rámečkem.
- Obsah pod obrázkem (`.product-card__body`) má vnitřní odsazení z `--space-m`.
- Horní část s ikonou má pozadí z `--color-accent-soft` a ikona má barvu `--color-accent`.
- Štítek se slevou má pozadí z `--color-accent` a text barvou `--color-surface`.
- Název a cena mají barvu `--color-text`, cena je tučná a větší než popis.
- Kategorie, popis i původní cena mají barvu `--color-text-muted`.
- Tlačítko „Do košíku" má pozadí z `--color-accent`, text barvou `--color-surface`, zaoblení z `--radius` a není podtržené.
- Když designér změní jen `--color-accent`, změní se i světlé pozadí horní části.
- Tlačítko se při najetí myší viditelně změní a při ovládání klávesnicí má výrazný obrys.

> [!TIP]
> Testy tokeny za běhu přepisují a sledují, jestli se karta změní. Barva napsaná natvrdo místo `var()` proto neprojde, i když vypadá stejně.

# --hints--

Pro kartu jsou definované barevné tokeny `--color-accent`, `--color-accent-soft`, `--color-text`, `--color-text-muted` a `--color-surface`.

```js
const style = getComputedStyle(document.querySelector('.product-card'));
for (const name of ['--color-accent', '--color-accent-soft', '--color-text', '--color-text-muted', '--color-surface']) {
  assert.notEqual(style.getPropertyValue(name).trim(), '', `Token ${name} není pro kartu definovaný (na :root ani na .product-card)`);
}
```

Pro kartu jsou definované tokeny `--space-s`, `--space-m` a `--radius`.

```js
const style = getComputedStyle(document.querySelector('.product-card'));
for (const name of ['--space-s', '--space-m', '--radius']) {
  assert.notEqual(style.getPropertyValue(name).trim(), '', `Token ${name} není pro kartu definovaný`);
}
```

Karta má pozadí z `--color-surface` a zaoblení z `--radius`.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
setTokens({ '--color-surface': 'rgb(1, 2, 3)', '--radius': '13px' });
const style = getComputedStyle(card);
assert.equal(style.backgroundColor, 'rgb(1, 2, 3)', 'Po změně --color-surface na rgb(1, 2, 3) se pozadí karty nezměnilo — čte ho z tokenu?');
assert.equal(style.borderTopLeftRadius, '13px', 'Po změně --radius na 13px se zaoblení karty nezměnilo');
```

Karta se od stránky odděluje stínem nebo rámečkem.

```js
const style = getComputedStyle(document.querySelector('.product-card'));
assert.ok(style.boxShadow !== 'none' || parseFloat(style.borderTopWidth) > 0, 'Karta nemá stín (box-shadow) ani rámeček');
```

Obsah pod obrázkem má vnitřní odsazení z `--space-m` na všech stranách.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
setTokens({ '--space-m': '37px' });
const style = getComputedStyle(document.querySelector('.product-card__body'));
for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
  assert.equal(style[`padding${side}`], '37px', `Po změně --space-m na 37px má .product-card__body padding${side} ${style[`padding${side}`]}`);
}
```

Horní část má pozadí z `--color-accent-soft` a ikona barvu `--color-accent`.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
setTokens({ '--color-accent-soft': 'rgb(4, 5, 6)', '--color-accent': 'rgb(7, 8, 9)' });
assert.equal(getComputedStyle(document.querySelector('.product-card__media')).backgroundColor, 'rgb(4, 5, 6)', 'Po změně --color-accent-soft se pozadí horní části nezměnilo');
assert.equal(getComputedStyle(document.querySelector('.product-card__icon')).color, 'rgb(7, 8, 9)', 'Po změně --color-accent se barva ikony nezměnila');
```

Štítek má pozadí z `--color-accent` a text barvou `--color-surface`.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
setTokens({ '--color-accent': 'rgb(7, 8, 9)', '--color-surface': 'rgb(1, 2, 3)' });
const style = getComputedStyle(document.querySelector('.product-card__badge'));
assert.equal(style.backgroundColor, 'rgb(7, 8, 9)', 'Po změně --color-accent se pozadí štítku nezměnilo');
assert.equal(style.color, 'rgb(1, 2, 3)', 'Po změně --color-surface se barva textu štítku nezměnila');
```

Název a cena mají barvu `--color-text` a cena je tučná a větší než popis.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
setTokens({ '--color-text': 'rgb(10, 11, 12)' });
assert.equal(getComputedStyle(document.querySelector('.product-card__title')).color, 'rgb(10, 11, 12)', 'Po změně --color-text se barva názvu nezměnila');
const price = getComputedStyle(document.querySelector('.product-card__price'));
const description = getComputedStyle(document.querySelector('.product-card__description'));
assert.equal(price.color, 'rgb(10, 11, 12)', 'Po změně --color-text se barva ceny nezměnila');
assert.ok(Number(price.fontWeight) >= 600, `Cena má tloušťku písma ${price.fontWeight}, čekám aspoň 600`);
assert.ok(parseFloat(price.fontSize) > parseFloat(description.fontSize), `Cena má písmo ${price.fontSize}, popis ${description.fontSize} — cena má být větší`);
```

Kategorie, popis i původní cena mají barvu `--color-text-muted`.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
setTokens({ '--color-text-muted': 'rgb(13, 14, 15)' });
for (const selector of ['.product-card__category', '.product-card__description', '.product-card__price-old']) {
  assert.equal(getComputedStyle(document.querySelector(selector)).color, 'rgb(13, 14, 15)', `Po změně --color-text-muted se barva ${selector} nezměnila`);
}
```

Tlačítko má pozadí z `--color-accent`, text z `--color-surface`, zaoblení z `--radius` a není podtržené.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
setTokens({ '--color-accent': 'rgb(7, 8, 9)', '--color-surface': 'rgb(1, 2, 3)', '--radius': '13px' });
const style = getComputedStyle(document.querySelector('.product-card__button'));
assert.equal(style.backgroundColor, 'rgb(7, 8, 9)', 'Po změně --color-accent se pozadí tlačítka nezměnilo');
assert.equal(style.color, 'rgb(1, 2, 3)', 'Po změně --color-surface se barva textu tlačítka nezměnila');
assert.equal(style.borderTopLeftRadius, '13px', 'Po změně --radius se zaoblení tlačítka nezměnilo');
assert.equal(style.textDecorationLine, 'none', 'Tlačítko nemá být podtržené');
```

Světlý odstín je odvozený: po změně samotného `--color-accent` se změní i pozadí horní části.

```js
const card = document.querySelector('.product-card');
const setTokens = (tokens) => {
  // Přechody (transition) by změnu barvy rozložily do času, test chce výsledek hned.
  document.head.append(Object.assign(document.createElement('style'), { textContent: '*, *::before, *::after { transition: none !important; }' }));
  for (const el of [document.documentElement, card]) {
    for (const [name, value] of Object.entries(tokens)) el.style.setProperty(name, value);
  }
};
const media = document.querySelector('.product-card__media');
const before = getComputedStyle(media).backgroundColor;
setTokens({ '--color-accent': 'rgb(37, 99, 235)' });
const after = getComputedStyle(media).backgroundColor;
assert.notEqual(after, before, `Po změně --color-accent zůstalo pozadí horní části ${before} — odvoď --color-accent-soft z --color-accent`);
assert.notEqual(after, 'rgb(37, 99, 235)', 'Pozadí horní části má být světlý odstín akcentu, ne akcent sám');
```

Tlačítko se při najetí myší viditelně změní.

```js
const button = document.querySelector('.product-card__button');
const found = [];
const walk = (rules, parent = '') => {
  for (const rule of rules) {
    let selector = rule.selectorText ?? '';
    if (selector && parent) selector = selector.includes('&') ? selector.replace(/&/g, parent) : `${parent} ${selector}`;
    if (selector) {
      for (const part of selector.split(',')) {
        if (!part.includes(':hover')) continue;
        try {
          if (button.matches(part.replace(/:hover/g, '').trim() || '*')) found.push(rule);
        } catch {}
      }
    }
    if (rule.cssRules) walk(rule.cssRules, selector || parent);
  }
};
for (const sheet of document.styleSheets) walk(sheet.cssRules);
assert.ok(found.length > 0, 'Chybí pravidlo se stavem :hover, které vybere .product-card__button');
const base = getComputedStyle(button);
let changed = false;
for (const rule of found) {
  for (const property of rule.style) {
    const probe = button.cloneNode(true);
    probe.style.visibility = 'hidden';
    button.parentElement.append(probe);
    probe.style.setProperty(property, rule.style.getPropertyValue(property));
    if (getComputedStyle(probe).getPropertyValue(property) !== base.getPropertyValue(property)) changed = true;
    probe.remove();
  }
}
assert.ok(changed, 'Pravidlo s :hover pro tlačítko nemění nic, co by bylo vidět');
```

Tlačítko má při ovládání klávesnicí plný obrys široký aspoň 2 px.

```js
const button = document.querySelector('.product-card__button');
button.focus({ focusVisible: true });
const style = getComputedStyle(button);
assert.ok(style.outlineStyle !== 'none' && style.outlineStyle !== 'auto', `Tlačítko s fokusem z klávesnice má obrys ve stylu ${style.outlineStyle} — čekám vlastní obrys`);
assert.ok(parseFloat(style.outlineWidth) >= 2, `Obrys tlačítka je široký ${style.outlineWidth}, čekám aspoň 2px`);
```

# --help--

## --tip-- 3

Karta má deklaraci pozadí i zaoblení, jen místo hodnoty čte token funkcí `var()`. Připomeň si [Definice a použití](see:css-zaklady/vlastni-vlastnosti#definice-a-pouziti-jmeno-a-var).

## --tip-- 11

Světlý odstín vznikne smícháním firemní barvy s bílou, viz [color-mix()](see:css-zaklady/vlastni-vlastnosti#color-mix-odstiny-z-jednoho-tokenu). Když tokeny definuješ na komponentě, odvozený token musí být u stejného prvku jako akcent — proč, vysvětluje past v části [Typické chyby a pasti](see:css-zaklady/vlastni-vlastnosti#typicke-chyby-a-pasti).

# --approaches--

## --approach-- Tokeny na :root

Tokeny jsou společný slovník celé stránky, komponenty z nich jen čtou. Tak to vypadá ve většině projektů: druhá karta, košík i hlavička vezmou stejné barvy. Tmavší barvu tlačítka při najetí odvozuje další token `--color-accent-strong`.

### --file-- styles.css

```css
/* Rozvržení karty je hotové. Vzhled postav z design tokenů. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  background-color: #f4f4f5;
}

.product-card {
  width: 100%;
  max-width: 20rem;
  overflow: hidden;
}

.product-card__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
}

.product-card__icon {
  width: 5rem;
  height: 5rem;
}

.product-card__badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  margin: 0;
}

.product-card__category,
.product-card__title,
.product-card__description,
.product-card__prices {
  margin: 0;
}

.product-card__button {
  display: block;
  text-align: center;
}

/* ===== Design tokeny ===== */

:root {
  --color-accent: #b45309;
  --color-accent-soft: color-mix(in oklch, var(--color-accent) 16%, white);
  --color-accent-strong: color-mix(in oklch, var(--color-accent), black 20%);
  --color-text: #1c1917;
  --color-text-muted: #57534e;
  --color-surface: #ffffff;
  --space-s: 0.5rem;
  --space-m: 1.25rem;
  --radius: 1rem;
}

/* ===== Vzhled karty ===== */

.product-card {
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgb(28 25 23 / 0.06), 0 12px 32px rgb(28 25 23 / 0.12);
}

.product-card__media {
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
}

.product-card__badge {
  padding: 0.125rem var(--space-s);
  border-radius: 999px;
  background-color: var(--color-accent);
  color: var(--color-surface);
  font-size: 0.75rem;
  font-weight: 700;
}

.product-card__body {
  padding: var(--space-m);
}

.product-card__category {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}

.product-card__title {
  margin-top: var(--space-s);
  color: var(--color-text);
  font-size: 1.25rem;
  line-height: 1.25;
}

.product-card__description {
  margin-top: var(--space-s);
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.product-card__prices {
  margin-top: var(--space-m);
}

.product-card__price {
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 700;
}

.product-card__price-old {
  margin-left: var(--space-s);
  color: var(--color-text-muted);
}

.product-card__button {
  margin-top: var(--space-m);
  padding: 0.75rem var(--space-m);
  border-radius: var(--radius);
  background-color: var(--color-accent);
  color: var(--color-surface);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.product-card__button:hover {
  background-color: var(--color-accent-strong);
}

.product-card__button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}
```

## --approach-- Tokeny na komponentě

Karta si tokeny nastaví sama v pravidle `.product-card` a nic mimo ni neovlivní. Hodí se pro komponentu, která má vypadat stejně v cizím projektu, nebo pro jednu výjimečnou kartu (třeba „Tip dne" v jiné barvě). Odvozené odstíny jsou definované vedle akcentu, takže se přepočítají, když někdo akcent na kartě přepíše.

### --file-- styles.css

```css
/* Rozvržení karty je hotové. Vzhled postav z design tokenů. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  background-color: #f4f4f5;
}

.product-card {
  width: 100%;
  max-width: 20rem;
  overflow: hidden;
}

.product-card__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
}

.product-card__icon {
  width: 5rem;
  height: 5rem;
}

.product-card__badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  margin: 0;
}

.product-card__category,
.product-card__title,
.product-card__description,
.product-card__prices {
  margin: 0;
}

.product-card__button {
  display: block;
  text-align: center;
}

/* ===== Karta s vlastními tokeny ===== */

.product-card {
  --color-accent: #0f766e;
  --color-accent-soft: color-mix(in oklch, var(--color-accent) 14%, white);
  --color-text: #134e4a;
  --color-text-muted: color-mix(in oklch, var(--color-text) 70%, white);
  --color-surface: #f8fffe;
  --space-s: 0.5rem;
  --space-m: 1.5rem;
  --radius: 0.5rem;

  border: 1px solid color-mix(in oklch, var(--color-accent) 25%, white);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text);
}

.product-card__media {
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
}

.product-card__badge {
  padding: 0.125rem var(--space-s);
  border-radius: var(--radius);
  background-color: var(--color-accent);
  color: var(--color-surface);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.product-card__body {
  padding: var(--space-m);
}

.product-card__category,
.product-card__description,
.product-card__price-old {
  color: var(--color-text-muted);
}

.product-card__category {
  font-size: 0.8125rem;
}

.product-card__title {
  margin-top: var(--space-s);
  color: var(--color-text);
  font-size: 1.375rem;
}

.product-card__description {
  margin-top: var(--space-s);
  font-size: 0.9375rem;
}

.product-card__prices {
  margin-top: var(--space-m);
}

.product-card__price {
  margin-right: var(--space-s);
  color: var(--color-text);
  font-size: 1.375rem;
  font-weight: 800;
}

.product-card__button {
  margin-top: var(--space-m);
  padding: 0.75rem;
  border-radius: var(--radius);
  background-color: var(--color-accent);
  color: var(--color-surface);
  font-weight: 700;
  text-decoration: none;
}

.product-card__button:hover {
  background-color: var(--color-text);
}

.product-card__button:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}
```

# --review--

Testy kontrolují, že karta čte tokeny. Tohle zkontroluj sám.

## --rubric--

- V pravidlech komponenty nezůstala žádná barva napsaná natvrdo, kterou by měl mít token.
- Víš, proč jsi tokeny dal na `:root`, nebo na kartu, a co by se změnilo s druhou volbou.
- Text na barevných plochách (štítek, tlačítko) i tlumený text na kartě mají dostatečný kontrast — ověř ho v DevTools u výběru barvy.
- Když změníš jen `--color-accent` na úplně jinou barvu, karta pořád vypadá jako navržená, ne rozbitá.

## --extensions--

Přidej variantu `.product-card--featured`, která jen přepíše dva nebo tři tokeny (jiná firemní barva, větší zaoblení) a jinak nemá žádná pravidla. Postav vedle sebe tři karty s různými produkty. Zkus tmavou kartu jen přepsáním `--color-surface`, `--color-text` a `--color-text-muted`.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Etiopie Yirgacheffe — Pražírna Kotlina</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main>
      <article class="product-card">
        <div class="product-card__media">
          <svg class="product-card__icon" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
            <path d="M20 8h24l6 10v36a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V18z"/>
            <ellipse cx="32" cy="38" rx="8" ry="11" fill="white" opacity="0.85"/>
            <path d="M32 28c-3 7 3 13 0 20" stroke="currentColor" stroke-width="2.5" fill="none"/>
          </svg>
          <p class="product-card__badge">Sleva 20 %</p>
        </div>
        <div class="product-card__body">
          <p class="product-card__category">Zrnková káva · 250 g</p>
          <h2 class="product-card__title">Etiopie Yirgacheffe</h2>
          <p class="product-card__description">Květinová, s tóny bergamotu a meruňky. Pražená minulý týden v Brně.</p>
          <p class="product-card__prices">
            <span class="product-card__price">279 Kč</span>
            <s class="product-card__price-old">349 Kč</s>
          </p>
          <a class="product-card__button" href="#">Do košíku</a>
        </div>
      </article>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
/* Rozvržení karty je hotové. Vzhled postav z design tokenů. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  background-color: #f4f4f5;
}

.product-card {
  width: 100%;
  max-width: 20rem;
  overflow: hidden;
}

.product-card__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
}

.product-card__icon {
  width: 5rem;
  height: 5rem;
}

.product-card__badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  margin: 0;
}

.product-card__category,
.product-card__title,
.product-card__description,
.product-card__prices {
  margin: 0;
}

.product-card__button {
  display: block;
  text-align: center;
}

/* ===== Design tokeny ===== */

:root {
--edit--

--edit--
}

/* ===== Vzhled karty ===== */
```

# --solution--

## --file-- styles.css

```css
/* Rozvržení karty je hotové. Vzhled postav z design tokenů. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  background-color: #f4f4f5;
}

.product-card {
  width: 100%;
  max-width: 20rem;
  overflow: hidden;
}

.product-card__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
}

.product-card__icon {
  width: 5rem;
  height: 5rem;
}

.product-card__badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  margin: 0;
}

.product-card__category,
.product-card__title,
.product-card__description,
.product-card__prices {
  margin: 0;
}

.product-card__button {
  display: block;
  text-align: center;
}

/* ===== Design tokeny ===== */

:root {
  --color-accent: #b45309;
  --color-accent-soft: color-mix(in oklch, var(--color-accent) 16%, white);
  --color-accent-strong: color-mix(in oklch, var(--color-accent), black 20%);
  --color-text: #1c1917;
  --color-text-muted: #57534e;
  --color-surface: #ffffff;
  --space-s: 0.5rem;
  --space-m: 1.25rem;
  --radius: 1rem;
}

/* ===== Vzhled karty ===== */

.product-card {
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgb(28 25 23 / 0.06), 0 12px 32px rgb(28 25 23 / 0.12);
}

.product-card__media {
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
}

.product-card__badge {
  padding: 0.125rem var(--space-s);
  border-radius: 999px;
  background-color: var(--color-accent);
  color: var(--color-surface);
  font-size: 0.75rem;
  font-weight: 700;
}

.product-card__body {
  padding: var(--space-m);
}

.product-card__category {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}

.product-card__title {
  margin-top: var(--space-s);
  color: var(--color-text);
  font-size: 1.25rem;
  line-height: 1.25;
}

.product-card__description {
  margin-top: var(--space-s);
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.product-card__prices {
  margin-top: var(--space-m);
}

.product-card__price {
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 700;
}

.product-card__price-old {
  margin-left: var(--space-s);
  color: var(--color-text-muted);
}

.product-card__button {
  margin-top: var(--space-m);
  padding: 0.75rem var(--space-m);
  border-radius: var(--radius);
  background-color: var(--color-accent);
  color: var(--color-surface);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.product-card__button:hover {
  background-color: var(--color-accent-strong);
}

.product-card__button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}
```
