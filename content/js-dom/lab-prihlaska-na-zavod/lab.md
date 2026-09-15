---
title: Přihláška na závod
see: js-dom/formulare-v-js#chyby-ktere-uvidi-kazdy
---

# --description--

Pořadatelé podzimního **Běhu kolem Máchova jezera** mají hotové HTML a vzhled přihlášky. Chybí JavaScript: formulář teď neumí nic víc než bubliny prohlížeče, které čtečka obrazovky ohlásí napůl a na telefonu zmizí dřív, než je člověk dočte. Formulář má atribut `novalidate`, takže bubliny se neukážou a všechno je na tvém kódu v `script.js`. Data tratí, rok závodu a formát ceny tam už jsou.

Tentokrát bez návodu. Použij, co znáš z lekce [Formuláře v JavaScriptu](see:js-dom/formulare-v-js): událost `submit`, `validity`, vlastní hlášky a přístupné zobrazení chyb. Pravidla jako `required`, `type="email"`, `min` a `max` už v HTML jsou.

**Co má přihláška umět:**

- Odeslání formuláře stránku nikdy znovu nenačte.
- Když uživatel odešle formulář s chybami, každé chybné pole dostane `aria-invalid="true"` a v prvku, na který ukazuje jeho `aria-describedby`, **vlastní srozumitelnou hlášku** (ne text bubliny prohlížeče). Prázdný e-mail a e-mail bez zavináče mají každý jinou hlášku, stejně jako prázdný rok narození a rok mimo povolený rozsah.
- Na trať se dá přihlásit jen od minimálního věku z `distances`; věk je `RACE_YEAR` minus rok narození. Když je běžec na trať mladý, chyba se ukáže u výběru trati a přihláška se neodešle.
- Po odeslání s chybami skočí fokus na **první** chybné pole ve formuláři.
- Než uživatel poprvé zkusí formulář odeslat, žádná chyba se neukazuje — nikdo nechce červená pole, když teprve začal psát.
- Po prvním odeslání se pole, které uživatel mění, kontroluje hned: opravená chyba zmizí. Změna roku narození znovu posoudí i trať.
- Platná přihláška skryje formulář a ukáže souhrn `#summary` se jménem běžce, názvem trati a cenou k úhradě (startovné plus případné tričko), naformátovanou přes `priceFormat`.
- Tlačítko **Upravit přihlášku** v souhrnu vrátí formulář s vyplněnými údaji a přesune fokus do pole se jménem.
- Pod poznámkou se při psaní ukazuje počet znaků ve tvaru `12 / 200`.

Texty hlášek jsou tvoje volba, jen ať říkají, co opravit. Vzhled chybných polí zařídí CSS samo podle `aria-invalid`.

> [!TIP]
> Testy vyplňují pole z kódu. Atributy jako `minlength` hodnotu nastavenou skriptem neposuzují — tady je proto v HTML nenajdeš.

# --hints--

Odeslání formuláře stránku znovu nenačte.

```js
let prevented = null;
document.addEventListener('submit', (event) => {
  prevented = event.defaultPrevented;
  event.preventDefault();
});
await helpers.submit(document.querySelector('#registration'));
assert.equal(prevented, true, 'posluchač submit na #registration má zavolat event.preventDefault(), jinak se stránka znovu načte');
```

Po odeslání prázdného formuláře má každé povinné pole `aria-invalid="true"` a pod sebou hlášku.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await helpers.submit(form);
for (const name of ['name', 'email', 'birthYear', 'distance', 'consent']) {
  const field = form.elements[name];
  assert.equal(field.getAttribute('aria-invalid'), 'true', `po odeslání prázdného formuláře má mít pole ${name} aria-invalid="true"`);
  assert.notEqual(errorOf(field), '', `po odeslání prázdného formuláře má být u pole ${name} hláška v #${field.getAttribute('aria-describedby')}`);
}
```

Hlášky jsou vlastní texty, ne text bubliny prohlížeče.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await helpers.submit(form);
for (const name of ['name', 'email', 'birthYear', 'distance', 'consent']) {
  const field = form.elements[name];
  const probe = field.cloneNode(true);
  assert.notEqual(errorOf(field), probe.validationMessage, `hláška u pole ${name} má být vlastní text, ne bublina prohlížeče „${probe.validationMessage}"`);
}
```

Prázdný e-mail a e-mail bez zavináče mají každý jinou hlášku.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill({ ...valid, email: '' });
await helpers.submit(form);
const empty = errorOf(form.elements.email);
await helpers.type(form.elements.email, 'eva.example.cz');
await helpers.submit(form);
const wrong = errorOf(form.elements.email);
assert.notEqual(empty, '', 'prázdný e-mail má po odeslání dostat hlášku');
assert.equal(form.elements.email.getAttribute('aria-invalid'), 'true', 'e-mail „eva.example.cz" má mít po odeslání aria-invalid="true"');
assert.notEqual(wrong, '', 'e-mail „eva.example.cz" má po odeslání dostat hlášku');
assert.notEqual(wrong, empty, 'e-mail bez zavináče má mít jinou hlášku než prázdný e-mail');
```

Prázdný rok narození a rok mimo povolený rozsah mají každý jinou hlášku; platný rok chybu nemá.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill({ ...valid, birthYear: '' });
await helpers.submit(form);
const empty = errorOf(form.elements.birthYear);
await helpers.type(form.elements.birthYear, '2024');
await helpers.submit(form);
const outOfRange = errorOf(form.elements.birthYear);
assert.notEqual(empty, '', 'prázdný rok narození má po odeslání dostat hlášku');
assert.notEqual(outOfRange, '', 'rok 2024 (mimo rozsah 1930–2016) má po odeslání dostat hlášku');
assert.notEqual(outOfRange, empty, 'rok mimo rozsah má mít jinou hlášku než prázdné pole');
await helpers.type(form.elements.birthYear, '1990');
await helpers.submit(form);
assert.notEqual(form.elements.birthYear.getAttribute('aria-invalid'), 'true', 'rok 1990 je platný a nemá mít aria-invalid="true"');
assert.equal(errorOf(form.elements.birthYear), '', 'u platného roku 1990 má být hláška prázdná');
```

Běžec, který je na trať mladý, dostane chybu u výběru trati a přihláška se neodešle; přesně minimální věk stačí.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill({ ...valid, birthYear: '2012', distance: '21' });
await helpers.submit(form);
const distance = form.elements.distance;
assert.equal(distance.getAttribute('aria-invalid'), 'true', 'ročník 2012 (14 let) na půlmaraton (od 18) má mít u trati aria-invalid="true"');
assert.notEqual(errorOf(distance), '', 'u trati má být hláška, proč se na ni běžec nemůže přihlásit');
assert.notEqual(form.elements.birthYear.getAttribute('aria-invalid'), 'true', 'samotný rok 2012 je platný, chyba patří k trati');
assert.equal(document.querySelector('#summary').hidden, true, 'přihláška s tratí pro starší běžce se nemá odeslat (souhrn zůstane skrytý)');
await helpers.type(form.elements.birthYear, '2011');
await fill({ distance: '10' });
await helpers.submit(form);
assert.notEqual(distance.getAttribute('aria-invalid'), 'true', 'ročník 2011 má v roce 2026 přesně 15 let a na 10 km (od 15) se přihlásit smí');
assert.equal(document.querySelector('#summary').hidden, false, 'přihláška ročníku 2011 na 10 km se má odeslat');
```

Po odeslání s chybami je fokus na prvním chybném poli ve formuláři.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await helpers.submit(form);
assert.equal(document.activeElement, form.elements.name, 'po odeslání prázdného formuláře má být fokus v poli Jméno a příjmení');
await fill({ ...valid, email: 'eva.example.cz', consent: false });
await helpers.submit(form);
assert.equal(document.activeElement, form.elements.email, 'když je první chyba v e-mailu (a další u souhlasu), má být fokus v poli E-mail');
```

Než uživatel poprvé odešle formulář, žádná chyba se neukazuje.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await helpers.type(form.elements.email, 'eva.example');
await helpers.type(form.elements.birthYear, '2024');
await fill({ distance: '21' });
await helpers.type(form.elements.name, '');
form.elements.name.dispatchEvent(new Event('input', { bubbles: true }));
for (const name of ['name', 'email', 'birthYear', 'distance', 'consent']) {
  const field = form.elements[name];
  assert.notEqual(field.getAttribute('aria-invalid'), 'true', `před prvním odesláním nemá mít pole ${name} aria-invalid="true"`);
  assert.equal(errorOf(field), '', `před prvním odesláním má být hláška u pole ${name} prázdná`);
}
```

Po prvním odeslání chyba u pole zmizí, jakmile ho uživatel opraví.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await helpers.submit(form);
await helpers.type(form.elements.name, 'Eva Dvořáková');
assert.notEqual(form.elements.name.getAttribute('aria-invalid'), 'true', 'po napsání jména má pole ztratit aria-invalid="true"');
assert.equal(errorOf(form.elements.name), '', 'po napsání jména má hláška u jména zmizet');
await helpers.click(form.elements.consent);
assert.equal(errorOf(form.elements.consent), '', 'po zaškrtnutí souhlasu má jeho hláška zmizet');
assert.equal(form.elements.email.getAttribute('aria-invalid'), 'true', 'e-mail, který uživatel neopravil, má zůstat chybný');
```

Po odeslání změna roku narození znovu posoudí i trať.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill({ ...valid, birthYear: '2012', distance: '21' });
await helpers.submit(form);
assert.equal(form.elements.distance.getAttribute('aria-invalid'), 'true', 'ročník 2012 na půlmaraton má po odeslání chybu u trati');
await helpers.type(form.elements.birthYear, '1990');
assert.notEqual(form.elements.distance.getAttribute('aria-invalid'), 'true', 'po změně roku na 1990 má chyba u trati zmizet bez dalšího odeslání');
assert.equal(errorOf(form.elements.distance), '', 'po změně roku na 1990 má být hláška u trati prázdná');
await helpers.submit(form);
assert.equal(document.querySelector('#summary').hidden, false, 'po opravě roku se má přihláška odeslat');
```

Platná přihláška skryje formulář a ukáže souhrn se jménem, tratí a cenou včetně trička.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill({ ...valid, shirt: true });
await helpers.submit(form);
const summary = document.querySelector('#summary');
assert.equal(form.hidden, true, 'po odeslání platné přihlášky má být formulář skrytý (hidden)');
assert.equal(summary.hidden, false, 'po odeslání platné přihlášky má být souhrn #summary vidět');
assert.equal(document.querySelector('#summary-name').textContent.trim(), 'Eva Dvořáková', '#summary-name má obsahovat jméno běžce');
assert.equal(document.querySelector('#summary-distance').textContent.trim(), '10 km', '#summary-distance má obsahovat název trati z distances („10 km")');
assert.equal(document.querySelector('#summary-price').textContent.replace(/\s/g, ' ').trim(), priceFormat.format(700).replace(/\s/g, ' '), '#summary-price má ukazovat 700 Kč (450 Kč startovné + 250 Kč tričko) přes priceFormat');
```

Bez trička je cena jen startovné.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill({ ...valid, distance: '21' });
await helpers.submit(form);
assert.equal(document.querySelector('#summary-price').textContent.replace(/\s/g, ' ').trim(), priceFormat.format(650).replace(/\s/g, ' '), 'půlmaraton bez trička má stát 650 Kč');
assert.equal(document.querySelector('#summary-distance').textContent.trim(), 'Půlmaraton 21 km', '#summary-distance má obsahovat „Půlmaraton 21 km"');
```

Jméno se v souhrnu zobrazí jako text, značky v něm se nespustí.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill({ ...valid, name: '<img src="x" onerror="document.title = \'hack\'">Eva' });
await helpers.submit(form);
const name = document.querySelector('#summary-name');
assert.equal(name.querySelector('img'), null, 'ze jména nesmí v souhrnu vzniknout element <img> — cizí text vkládej přes textContent');
assert.equal(name.textContent.trim(), '<img src="x" onerror="document.title = \'hack\'">Eva', 'v souhrnu má být celé jméno jako text');
```

Upravit přihlášku vrátí formulář s vyplněnými údaji, skryje souhrn a přesune fokus do jména.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await fill(valid);
await helpers.submit(form);
await helpers.click(document.querySelector('#edit-registration'));
assert.equal(form.hidden, false, 'po Upravit přihlášku má být formulář vidět');
assert.equal(document.querySelector('#summary').hidden, true, 'po Upravit přihlášku má být souhrn skrytý');
assert.equal(form.elements.email.value, 'eva@example.cz', 'formulář si má nechat vyplněný e-mail');
assert.equal(document.activeElement, form.elements.name, 'po Upravit přihlášku má být fokus v poli Jméno a příjmení');
```

Pod poznámkou se při psaní ukazuje počet znaků ve tvaru `12 / 200`.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const form = document.querySelector('#registration');
const errorOf = (field) => document.getElementById(field.getAttribute('aria-describedby')).textContent.trim();
async function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements[name];
    if (field.type === 'checkbox') {
      if (field.checked !== value) await helpers.click(field);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      await helpers.type(field, value);
    }
  }
}
const valid = { name: 'Eva Dvořáková', email: 'eva@example.cz', birthYear: '1990', distance: '10', consent: true };
await helpers.type(form.elements.note, 'Běžím s psem');
assert.match(document.querySelector('#note-count').textContent, /^\s*12\s*\/\s*200\s*$/, 'po napsání 12 znaků má #note-count ukazovat „12 / 200"');
await helpers.type(form.elements.note, 'Ahoj');
assert.match(document.querySelector('#note-count').textContent, /^\s*4\s*\/\s*200\s*$/, 'po přepsání poznámky na 4 znaky má #note-count ukazovat „4 / 200"');
```

# --help--

## --tip-- 6

Pravidlo věku HTML nezapíše. Metoda pole `setCustomValidity` z části [Vlastní pravidla](see:js-dom/formulare-v-js#vlastni-pravidla-setcustomvalidity) udělá select neplatným s tvým textem — a platí, dokud ji nezavoláš s prázdným textem. Věk počítej jen z platného roku.

## --tip-- 8

Formulář potřebuje pamatovat si jednu věc navíc: jestli už ho uživatel zkusil odeslat. Posluchač změn podle ní rozhodne, jestli hlášky ukáže, nebo jen tiše přepočítá pravidlo trati.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Běh kolem Máchova jezera — přihláška</title>
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
  </head>
  <body>
    <main class="page">
      <header class="hero">
        <p class="hero__date">Sobota 17. října 2026 · Doksy</p>
        <h1>Běh kolem Máchova jezera</h1>
        <p>Trať po písčitých cestách kolem jezera, start i cíl na pláži. Vyber si délku a přihlas se.</p>
      </header>

      <form class="registration" id="registration" novalidate>
        <div class="field">
          <label for="runner-name">Jméno a příjmení</label>
          <input id="runner-name" name="name" autocomplete="name" required aria-describedby="name-error">
          <p class="field__error" id="name-error"></p>
        </div>

        <div class="field">
          <label for="email">E-mail</label>
          <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error">
          <p class="field__error" id="email-error"></p>
        </div>

        <div class="field">
          <label for="birth-year">Rok narození</label>
          <input id="birth-year" name="birthYear" type="number" inputmode="numeric" min="1930" max="2016" required aria-describedby="birth-year-error">
          <p class="field__error" id="birth-year-error"></p>
        </div>

        <div class="field">
          <label for="distance">Trať</label>
          <select id="distance" name="distance" required aria-describedby="distance-error">
            <option value="">Vyber trať</option>
            <option value="5">5 km · od 10 let · 350 Kč</option>
            <option value="10">10 km · od 15 let · 450 Kč</option>
            <option value="21">Půlmaraton 21 km · od 18 let · 650 Kč</option>
          </select>
          <p class="field__error" id="distance-error"></p>
        </div>

        <label class="check">
          <input type="checkbox" id="shirt" name="shirt">
          Chci funkční tričko závodu (+250 Kč)
        </label>

        <div class="field">
          <label for="note">Poznámka pro pořadatele</label>
          <textarea id="note" name="note" rows="3" maxlength="200"></textarea>
          <p class="field__hint" id="note-count">0 / 200</p>
        </div>

        <div class="field">
          <label class="check">
            <input type="checkbox" id="consent" name="consent" required aria-describedby="consent-error">
            Souhlasím s pravidly závodu
          </label>
          <p class="field__error" id="consent-error"></p>
        </div>

        <button class="button" type="submit">Odeslat přihlášku</button>
      </form>

      <section class="summary" id="summary" tabindex="-1" hidden>
        <h2>Přihláška je odeslaná</h2>
        <dl class="summary__list">
          <dt>Běžec</dt>
          <dd id="summary-name"></dd>
          <dt>Trať</dt>
          <dd id="summary-distance"></dd>
          <dt>K úhradě</dt>
          <dd id="summary-price"></dd>
        </dl>
        <button class="button button--ghost" type="button" id="edit-registration">Upravit přihlášku</button>
      </section>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --bg: #eef4f8;
  --card: #ffffff;
  --ink: #152433;
  --muted: #5d6b78;
  --line: #d4dfe7;
  --accent: #0f6c8f;
  --accent-dark: #0b5470;
  --danger: #b42318;
  --danger-soft: #fdecea;
  --radius: 0.8rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

[hidden] {
  display: none !important;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #d9ebf3 0, var(--bg) 22rem);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}

.page {
  width: min(100% - 2rem, 36rem);
  margin: 3rem auto;
}

.hero__date {
  margin: 0;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.1;
}

.hero p:last-child {
  margin: 0 0 1.5rem;
  color: var(--muted);
}

.registration,
.summary {
  display: grid;
  gap: 1.1rem;
  padding: 1.75rem;
  background: var(--card);
  border-radius: 1.25rem;
  box-shadow: 0 1px 2px rgb(21 36 51 / 0.06), 0 20px 45px rgb(21 36 51 / 0.08);
}

.field {
  display: grid;
  gap: 0.3rem;
}

label {
  font-weight: 600;
}

input:not([type="checkbox"]),
select,
textarea {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 2px solid var(--line);
  border-radius: 0.6rem;
  background: #fbfdfe;
  color: var(--ink);
  font: inherit;
  transition: border-color 0.2s, background-color 0.2s;
}

[aria-invalid="true"] {
  border-color: var(--danger);
  background: var(--danger-soft);
}

.check {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 400;
  cursor: pointer;
}

.check input {
  width: 1.15rem;
  height: 1.15rem;
  accent-color: var(--accent);
}

.check input[aria-invalid="true"] {
  outline: 2px solid var(--danger);
  outline-offset: 2px;
}

.field__error {
  min-height: 1.3em;
  margin: 0;
  color: var(--danger);
  font-size: 0.9rem;
}

.field__hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
  text-align: right;
}

:is(input, select, textarea, button):focus-visible,
.summary:focus-visible {
  outline: 3px solid #7cc4e0;
  outline-offset: 2px;
}

.button {
  padding: 0.8rem 1.2rem;
  border: 0;
  border-radius: 0.7rem;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, translate 0.2s;
}

.button:hover {
  background: var(--accent-dark);
  translate: 0 -1px;
}

.button--ghost {
  justify-self: start;
  border: 2px solid var(--accent);
  background: transparent;
  color: var(--accent);
}

.button--ghost:hover {
  background: #e3f1f7;
}

.summary h2 {
  margin: 0;
}

.summary__list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 1.5rem;
  margin: 0;
}

.summary__list dt {
  color: var(--muted);
}

.summary__list dd {
  margin: 0;
  font-weight: 700;
}
```

## --file-- script.js

```js
// Rok závodu: věk běžce se počítá jako RACE_YEAR minus rok narození.
const RACE_YEAR = 2026;

// Tratě podle value v selectu #distance: název, minimální věk a startovné.
const distances = {
  5: { label: '5 km', minAge: 10, price: 350 },
  10: { label: '10 km', minAge: 15, price: 450 },
  21: { label: 'Půlmaraton 21 km', minAge: 18, price: 650 },
};

// Příplatek za tričko závodu.
const SHIRT_PRICE = 250;

// Cena v korunách, třeba „900 Kč".
const priceFormat = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 });

// Tvůj kód:
```

# --solution--

## --file-- script.js

```js
// Rok závodu: věk běžce se počítá jako RACE_YEAR minus rok narození.
const RACE_YEAR = 2026;

// Tratě podle value v selectu #distance: název, minimální věk a startovné.
const distances = {
  5: { label: '5 km', minAge: 10, price: 350 },
  10: { label: '10 km', minAge: 15, price: 450 },
  21: { label: 'Půlmaraton 21 km', minAge: 18, price: 650 },
};

// Příplatek za tričko závodu.
const SHIRT_PRICE = 250;

// Cena v korunách, třeba „900 Kč".
const priceFormat = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 });

// Tvůj kód:

const form = document.querySelector('#registration');
const summary = document.querySelector('#summary');

// Chyby se ukazují až po prvním pokusu o odeslání.
let submitted = false;

// Vlastní pravidlo: trať podle věku. Chyba visí na selectu, dokud ji prázdný text nesmaže.
function checkAge() {
  const distanceField = form.elements.distance;
  const yearField = form.elements.birthYear;
  const distance = distances[distanceField.value];
  const tooYoung = distance !== undefined && yearField.validity.valid && RACE_YEAR - Number(yearField.value) < distance.minAge;
  distanceField.setCustomValidity(tooYoung ? `Na trať ${distance.label} se můžeš přihlásit od ${distance.minAge} let.` : '');
}

// Srozumitelná hláška podle důvodu z validity; prázdný text = pole je v pořádku.
function messageFor(field) {
  const { validity } = field;
  if (validity.valueMissing) {
    if (field.type === 'checkbox') return 'Bez souhlasu s pravidly tě nemůžeme přihlásit.';
    if (field.tagName === 'SELECT') return 'Vyber trať, na kterou poběžíš.';
    return 'Tohle pole je povinné.';
  }
  if (validity.typeMismatch) return 'Zadej e-mail ve tvaru jmeno@domena.cz.';
  if (validity.rangeUnderflow || validity.rangeOverflow || validity.badInput) {
    return `Zadej rok narození mezi ${field.min} a ${field.max}.`;
  }
  if (validity.customError) return field.validationMessage;
  return '';
}

// Zapíše hlášku pod pole a označí ho; vrátí true, když je pole v pořádku.
function showError(field) {
  const message = messageFor(field);
  document.getElementById(field.getAttribute('aria-describedby')).textContent = message;
  field.setAttribute('aria-invalid', String(message !== ''));
  return message === '';
}

function updateNoteCount() {
  document.querySelector('#note-count').textContent = `${form.elements.note.value.length} / 200`;
}

function showSummary() {
  const distance = distances[form.elements.distance.value];
  const price = distance.price + (form.elements.shirt.checked ? SHIRT_PRICE : 0);
  document.querySelector('#summary-name').textContent = form.elements.name.value.trim();
  document.querySelector('#summary-distance').textContent = distance.label;
  document.querySelector('#summary-price').textContent = priceFormat.format(price);
  form.hidden = true;
  summary.hidden = false;
  summary.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  submitted = true;
  checkAge();
  const results = [...form.querySelectorAll('[required]')].map((field) => ({ field, ok: showError(field) }));
  const firstInvalid = results.find((result) => !result.ok);
  if (firstInvalid) {
    firstInvalid.field.focus();
    return;
  }
  showSummary();
});

form.addEventListener('input', (event) => {
  if (event.target === form.elements.note) updateNoteCount();
  checkAge();
  if (!submitted) return;
  if (event.target.required) showError(event.target);
  showError(form.elements.distance);
});

document.querySelector('#edit-registration').addEventListener('click', () => {
  summary.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
```

# --approaches--

## --approach-- Constraint Validation API a setCustomValidity

Pravidla nechá hlídat prohlížeč a jen se ho ptá přes `validity`; vlastní pravidlo věku přidá přes `setCustomValidity`. Nejméně kódu a pravidla zůstanou v HTML, kde je vidí i čtečky. Hodí se, když formulář stojí na pravidlech, která HTML umí.

### --file-- script.js

```js
// Rok závodu: věk běžce se počítá jako RACE_YEAR minus rok narození.
const RACE_YEAR = 2026;

// Tratě podle value v selectu #distance: název, minimální věk a startovné.
const distances = {
  5: { label: '5 km', minAge: 10, price: 350 },
  10: { label: '10 km', minAge: 15, price: 450 },
  21: { label: 'Půlmaraton 21 km', minAge: 18, price: 650 },
};

// Příplatek za tričko závodu.
const SHIRT_PRICE = 250;

// Cena v korunách, třeba „900 Kč".
const priceFormat = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 });

// Tvůj kód:

const form = document.querySelector('#registration');
const summary = document.querySelector('#summary');

// Chyby se ukazují až po prvním pokusu o odeslání.
let submitted = false;

// Vlastní pravidlo: trať podle věku. Chyba visí na selectu, dokud ji prázdný text nesmaže.
function checkAge() {
  const distanceField = form.elements.distance;
  const yearField = form.elements.birthYear;
  const distance = distances[distanceField.value];
  const tooYoung = distance !== undefined && yearField.validity.valid && RACE_YEAR - Number(yearField.value) < distance.minAge;
  distanceField.setCustomValidity(tooYoung ? `Na trať ${distance.label} se můžeš přihlásit od ${distance.minAge} let.` : '');
}

// Srozumitelná hláška podle důvodu z validity; prázdný text = pole je v pořádku.
function messageFor(field) {
  const { validity } = field;
  if (validity.valueMissing) {
    if (field.type === 'checkbox') return 'Bez souhlasu s pravidly tě nemůžeme přihlásit.';
    if (field.tagName === 'SELECT') return 'Vyber trať, na kterou poběžíš.';
    return 'Tohle pole je povinné.';
  }
  if (validity.typeMismatch) return 'Zadej e-mail ve tvaru jmeno@domena.cz.';
  if (validity.rangeUnderflow || validity.rangeOverflow || validity.badInput) {
    return `Zadej rok narození mezi ${field.min} a ${field.max}.`;
  }
  if (validity.customError) return field.validationMessage;
  return '';
}

// Zapíše hlášku pod pole a označí ho; vrátí true, když je pole v pořádku.
function showError(field) {
  const message = messageFor(field);
  document.getElementById(field.getAttribute('aria-describedby')).textContent = message;
  field.setAttribute('aria-invalid', String(message !== ''));
  return message === '';
}

function updateNoteCount() {
  document.querySelector('#note-count').textContent = `${form.elements.note.value.length} / 200`;
}

function showSummary() {
  const distance = distances[form.elements.distance.value];
  const price = distance.price + (form.elements.shirt.checked ? SHIRT_PRICE : 0);
  document.querySelector('#summary-name').textContent = form.elements.name.value.trim();
  document.querySelector('#summary-distance').textContent = distance.label;
  document.querySelector('#summary-price').textContent = priceFormat.format(price);
  form.hidden = true;
  summary.hidden = false;
  summary.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  submitted = true;
  checkAge();
  const results = [...form.querySelectorAll('[required]')].map((field) => ({ field, ok: showError(field) }));
  const firstInvalid = results.find((result) => !result.ok);
  if (firstInvalid) {
    firstInvalid.field.focus();
    return;
  }
  showSummary();
});

form.addEventListener('input', (event) => {
  if (event.target === form.elements.note) updateNoteCount();
  checkAge();
  if (!submitted) return;
  if (event.target.required) showError(event.target);
  showError(form.elements.distance);
});

document.querySelector('#edit-registration').addEventListener('click', () => {
  summary.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
```

## --approach-- Vlastní funkce validate

Všechna pravidla jsou v jedné čisté funkci, která z `FormData` vrátí objekt chyb podle jména pole. Funkci jde otestovat bez stránky a stejná pravidla se dají použít i na serveru. Za to si formát e-mailu a rozsah roku píšeš sám a hlídáš, aby se nerozešly s atributy v HTML.

### --file-- script.js

```js
// Rok závodu: věk běžce se počítá jako RACE_YEAR minus rok narození.
const RACE_YEAR = 2026;

// Tratě podle value v selectu #distance: název, minimální věk a startovné.
const distances = {
  5: { label: '5 km', minAge: 10, price: 350 },
  10: { label: '10 km', minAge: 15, price: 450 },
  21: { label: 'Půlmaraton 21 km', minAge: 18, price: 650 },
};

// Příplatek za tričko závodu.
const SHIRT_PRICE = 250;

// Cena v korunách, třeba „900 Kč".
const priceFormat = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 });

// Tvůj kód:

const form = document.querySelector('#registration');
const summary = document.querySelector('#summary');
const requiredNames = ['name', 'email', 'birthYear', 'distance', 'consent'];
let submitted = false;

// Všechna pravidla na jednom místě: jméno pole → text chyby.
function validate(data) {
  const errors = {};
  if (data.get('name').trim() === '') errors.name = 'Napiš jméno a příjmení.';

  const email = data.get('email').trim();
  if (email === '') errors.email = 'Napiš e-mail, pošleme na něj startovní číslo.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'E-mail potřebuje zavináč a doménu, třeba eva@example.cz.';

  const yearText = data.get('birthYear');
  const year = Number(yearText);
  if (yearText === '') errors.birthYear = 'Napiš rok narození.';
  else if (!Number.isInteger(year) || year < 1930 || year > 2016) errors.birthYear = 'Rok narození musí být mezi 1930 a 2016.';

  const distance = distances[data.get('distance')];
  if (!distance) errors.distance = 'Vyber trať.';
  else if (!errors.birthYear && RACE_YEAR - year < distance.minAge) {
    errors.distance = `Trať ${distance.label} je od ${distance.minAge} let, vyber kratší.`;
  }

  if (!data.has('consent')) errors.consent = 'Potvrď souhlas s pravidly závodu.';
  return errors;
}

function showErrors(errors, names) {
  for (const name of names) {
    const field = form.elements[name];
    const message = errors[name] ?? '';
    document.getElementById(field.getAttribute('aria-describedby')).textContent = message;
    field.setAttribute('aria-invalid', String(message !== ''));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  submitted = true;
  const errors = validate(new FormData(form));
  showErrors(errors, requiredNames);
  const firstInvalid = requiredNames.find((name) => errors[name]);
  if (firstInvalid) {
    form.elements[firstInvalid].focus();
    return;
  }
  const distance = distances[form.elements.distance.value];
  const total = distance.price + (form.elements.shirt.checked ? SHIRT_PRICE : 0);
  document.querySelector('#summary-name').textContent = form.elements.name.value.trim();
  document.querySelector('#summary-distance').textContent = distance.label;
  document.querySelector('#summary-price').textContent = priceFormat.format(total);
  form.hidden = true;
  summary.hidden = false;
  summary.focus();
});

form.addEventListener('input', (event) => {
  if (event.target.name === 'note') {
    document.querySelector('#note-count').textContent = `${event.target.value.length} / 200`;
  }
  if (!submitted || !requiredNames.includes(event.target.name)) return;
  const errors = validate(new FormData(form));
  showErrors(errors, [event.target.name, 'distance']);
});

document.querySelector('#edit-registration').addEventListener('click', () => {
  summary.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
```

# --review--

Testy kontrolují chování formuláře. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Text hlášky vzniká na jediném místě a zobrazení chyby dělá jedna funkce pro všechna pole.
- Každá hláška říká, co opravit, ne jen že je něco špatně.
- Pravidlo věku se počítá z dat `distances`, ne z čísel přepsaných do podmínek.
- Bez myši projdeš celý formulář klávesnicí a po chybě víš, kde jsi.
- Víš, který z přístupů bys zvolil příště a proč.

## --extensions--

Ulož rozepsanou přihlášku do `localStorage`, aby přežila zavření karty, a po odeslání ji smaž. Přidej políčko pro dítě do 10 let na dětskou trať 1 km s doprovodem a pravidlem „jen s rodičem na jiné trati".
