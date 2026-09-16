---
title: Audit přístupnosti kliniky Tlapka
see: html-pristupnost/proc-pristupnost#vyzkousej-si-to-sam, html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita, html-pristupnost/workshop-oprava-pristupnosti
---

# --description--

Veterinární klinika Tlapka z Brna-Žabovřesk má nový web a chce, aby se na vyšetření dalo objednat i bez myši a se čtečkou. Než web spustí, dostal jsi ho na audit: projdi ho, najdi chyby přístupnosti a oprav je. Tentokrát bez návodu po krocích.

Chyb je **deset** a každá je jiného druhu. Všechny znáš z lekcí a z workshopu s pražírnou. Postupuj jako při skutečném auditu: stránku projdi Tabem, v DevTools se podívej na kartu Accessibility u ovládacích prvků, přečti si osnovu nadpisů a zkontroluj skript i styly. Vzhled stránky se měnit nemusí, když si ho ale upravíš, testy to nevadí. Třídy prvků, `id` a atributy `name` v HTML nech, testy podle nich prvky hledají.

**Co má stránka po opravě umět:**

- Čtečka čte stránku českým hlasem.
- Odkaz s logem vlevo nahoře řekne, že vede na úvodní stránku kliniky Tlapka.
- Uživatel čtečky najde osnovu stránky: jeden hlavní nadpis a pod ním nadpisy sekcí a služeb bez přeskočené úrovně.
- Uživatel čtečky skočí rovnou do hlavičky, navigace, hlavního obsahu i patičky.
- Každé pole objednávkového formuláře má popisek, který mu dá jméno i po začátku psaní.
- Formulář jde odeslat tlačítkem „Objednat" z klávesnice.
- Tlačítko pro zavření oznámení nahoře říká, co udělá, ne jen „krát".
- Čtečka u tlačítka „Celý týden" pozná, jestli jsou ordinační hodiny rozbalené, a stav sedí i po opakovaném klikání.
- Po odeslání objednávky čtečka sama ohlásí poděkování, aniž by přerušila, co zrovna čte.
- Kdo prochází stránku klávesnicí, vidí u odkazů a tlačítek výrazný obrys.

> [!TIP]
> Každý požadavek níž odpovídá jedné chybě. Kontroluj průběžně a opravuj po jedné, uvidíš, jak se odškrtávají.

# --hints--

Dokument má nastavený český jazyk.

```js
const lang = document.documentElement.getAttribute('lang') ?? '';
assert.match(lang, /^cs(-CZ)?$/i, `<html> má mít český jazyk (lang="cs"), teď má lang="${lang}"`);
```

Odkaz `.logo` má přístupné jméno s názvem kliniky Tlapka, které neříká „logo".

```js
const link = document.querySelector('a.logo');
assert.ok(link, 'v hlavičce má zůstat odkaz s třídou logo');
const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
const text = (node) => [...node.childNodes].map((child) => {
  if (child.nodeType === 3) return child.textContent;
  if (child.nodeType !== 1 || child.getAttribute('aria-hidden') === 'true') return '';
  return child.tagName === 'IMG' ? ` ${child.getAttribute('alt') ?? ''} ` : text(child);
}).join('');
const ids = link.getAttribute('aria-labelledby');
const name = ids
  ? clean(ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' '))
  : clean(link.getAttribute('aria-label')) || clean(text(link));
assert.match(name, /tlapka/i, `odkaz s logem má jméno „${name}" — má obsahovat název kliniky Tlapka`);
assert.doesNotMatch(name, /logo|obrázek/i, `jméno odkazu „${name}" má říct, kam vede, ne že jde o logo`);
```

Stránka má jeden nadpis `h1` s názvem kliniky a osnova nadpisů nepřeskočí žádnou úroveň.

```js
const h1s = document.querySelectorAll('h1');
assert.equal(h1s.length, 1, `stránka má mít právě jeden h1, má ${h1s.length}`);
assert.match(h1s[0].textContent, /Tlapka/, 'h1 má obsahovat název kliniky Tlapka');
const levels = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => Number(heading.tagName[1]));
assert.equal(levels[0], 1, `první nadpis stránky má být h1, je h${levels[0]}`);
levels.forEach((level, i) => {
  if (i > 0) assert.ok(level <= levels[i - 1] + 1, `po nadpisu úrovně ${levels[i - 1]} následuje úroveň ${level} — celá osnova: ${levels.join(', ')}`);
});
assert.ok(document.querySelectorAll('.service__name').length === 3 && [...document.querySelectorAll('.service__name')].every((el) => /^H[1-6]$/.test(el.tagName)), 'názvy tří služeb (.service__name) mají zůstat nadpisy');
```

Stránka má hlavičku, navigaci, hlavní obsah a patičku jako oblasti.

```js
const header = document.querySelector('header');
assert.ok(header?.querySelector('a.logo'), 'odkaz s logem má být v prvku header');
const nav = document.querySelector('nav');
assert.ok(nav?.querySelector('a[href="#sluzby"]') && nav.querySelector('a[href="#objednani"]'), 'odkazy menu mají být v prvku nav');
const mains = document.querySelectorAll('main');
assert.equal(mains.length, 1, `stránka má mít právě jeden main, má ${mains.length}`);
assert.ok(mains[0].querySelector('#sluzby') && mains[0].querySelector('#objednani'), 'main má obsahovat služby i objednání');
assert.ok(!mains[0].contains(header), 'hlavička nemá být uvnitř main');
const footer = document.querySelector('footer');
assert.ok(footer?.querySelector('a[href^="mailto:"]'), 'patička s e-mailem má být prvek footer');
assert.ok(!mains[0].contains(footer), 'patička nemá být uvnitř main');
```

Pole Jméno, Telefon, Druh zvířete a popis potíží mají přístupné jméno z popisku, ne z placeholderu.

```js
const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
const own = (label, field) => {
  const copy = label.cloneNode(true);
  copy.querySelectorAll('input, select, textarea').forEach((el) => el.remove());
  return clean(copy.textContent);
};
for (const [fieldName, pattern] of [['owner', /jméno/i], ['phone', /telefon/i], ['species', /druh|zvíře/i], ['problem', /zvíře|potíž|problém|je/i]]) {
  const field = document.querySelector(`.booking__form [name="${fieldName}"]`);
  assert.ok(field, `ve formuláři chybí pole name="${fieldName}"`);
  const ids = field.getAttribute('aria-labelledby');
  const name = ids
    ? clean(ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' '))
    : clean(field.getAttribute('aria-label')) || clean([...field.labels].map((label) => own(label, field)).join(' '));
  assert.match(name, pattern, `pole name="${fieldName}" má jméno „${name}" — potřebuje popisek (placeholder ani title se nepočítají)`);
}
```

„Objednat" je tlačítko, které formulář odešle a jde zaměřit klávesnicí.

```js
const form = document.querySelector('.booking__form');
const submit = form.querySelector('.booking__submit');
assert.ok(submit, 've formuláři má zůstat prvek s třídou booking__submit');
assert.ok(['BUTTON', 'INPUT'].includes(submit.tagName) && submit.type === 'submit', `„Objednat" má být odesílací tlačítko, teď je to <${submit.tagName.toLowerCase()}>`);
submit.focus();
assert.equal(document.activeElement, submit, 'tlačítko Objednat má jít zaměřit klávesnicí');
form.elements.owner.value = 'Jana Dvořáková';
form.elements.phone.value = '777 123 456';
form.elements.species.value = 'Kočka';
submit.click();
await helpers.waitFor(() => /Jana Dvořáková/.test(document.querySelector('#booking-message').textContent), 1000).catch(() => {});
assert.match(document.querySelector('#booking-message').textContent, /Děkujeme, Jana Dvořáková/, 'po kliknutí na Objednat s vyplněným formulářem se má objevit poděkování');
```

Tlačítko pro zavření oznámení má jméno, které říká, že oznámení zavře.

```js
const close = document.querySelector('.notice__close');
assert.equal(close?.tagName, 'BUTTON', 'zavírací prvek .notice__close má zůstat tlačítkem');
const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
const text = (node) => [...node.childNodes].map((child) => {
  if (child.nodeType === 3) return child.textContent;
  if (child.nodeType !== 1 || child.getAttribute('aria-hidden') === 'true') return '';
  return text(child);
}).join('');
const ids = close.getAttribute('aria-labelledby');
const name = ids
  ? clean(ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' '))
  : clean(close.getAttribute('aria-label')) || clean(text(close));
assert.match(name, /zavř|skrý|zruš/i, `tlačítko má jméno „${name}" — má říct, že oznámení zavře`);
close.click();
assert.equal(document.querySelector('.notice').hidden, true, 'po kliknutí se má oznámení schovat');
```

Tlačítko „Celý týden" hlásí stav rozbalení a stav se mění spolu s ordinačními hodinami.

```js
const toggle = document.querySelector('.hours__toggle');
const week = document.querySelector('#hours-week');
assert.equal(toggle.getAttribute('aria-expanded'), 'false', `po načtení má mít tlačítko aria-expanded="false", má ${toggle.getAttribute('aria-expanded')}`);
toggle.click();
assert.equal(week.hidden, false, 'po prvním kliknutí mají být hodiny vidět');
assert.equal(toggle.getAttribute('aria-expanded'), 'true', 'po rozbalení má být aria-expanded="true"');
toggle.click();
assert.equal(week.hidden, true, 'po druhém kliknutí mají být hodiny skryté');
assert.equal(toggle.getAttribute('aria-expanded'), 'false', 'po sbalení má být aria-expanded="false"');
```

Poděkování po objednání je zdvořilá živá oblast, připravená v HTML od načtení.

```js
const message = document.querySelector('#booking-message');
const role = message.getAttribute('role');
const live = message.getAttribute('aria-live');
assert.ok(role === 'status' || live === 'polite', `#booking-message má být živá oblast (role="status" nebo aria-live="polite"), má role=${role}, aria-live=${live}`);
assert.ok(role !== 'alert' && live !== 'assertive', 'poděkování nemá čtečku přerušovat (alert, assertive)');
assert.equal(message.textContent.trim(), '', 'oblast má být po načtení prázdná');
const form = document.querySelector('.booking__form');
form.elements.owner.value = 'Petr Novák';
form.elements.phone.value = '608 555 123';
form.elements.species.value = 'Pes';
form.requestSubmit();
assert.match(message.textContent, /Petr Novák/, 'po odeslání formuláře má oblast obsahovat poděkování');
```

Odkazy a tlačítka mají s fokusem výrazný obrys.

```js
for (const selector of ['.menu a', '.phone', '.hours__toggle', '.notice__close']) {
  const el = document.querySelector(selector);
  el.focus();
  const style = getComputedStyle(el);
  const outline = style.outlineStyle !== 'none' && (style.outlineStyle === 'auto' || parseFloat(style.outlineWidth) >= 2);
  assert.ok(outline || style.boxShadow !== 'none', `${selector} s fokusem nemá výrazný obrys (outline: ${style.outlineStyle} ${style.outlineWidth})`);
}
```

# --help--

## --tip-- 6

Odesílací tlačítko ve formuláři odešle formulář samo, i klávesou. Ruční odesílání ve skriptu pak už nepotřebuješ.

## --tip-- 8

Atribut ARIA drží text `"true"` nebo `"false"`. Nastav ho při každém kliknutí podle toho, jestli jsou hodiny právě vidět, ne podle toho, co v atributu bylo.

# --approaches--

## --approach-- Viditelné popisky a skrytý text

Každé pole má viditelný `<label>` propojený přes `for` a `id`, zavírací tlačítko dostane jméno ze skrytého textu a křížek je schovaný přes `aria-hidden`. Stav hodin se nastavuje z viditelnosti panelu, poděkování je `role="status"`. Tahle cesta je nejbezpečnější: jméno je vždy vidět v HTML a hlasové ovládání najde totéž, co vidí oči.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Veterinární klinika Tlapka — Brno-Žabovřesky</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="notice">
      <p class="notice__text">Od 1. prosince ordinujeme i v Líšni, Holzova 8.</p>
      <button type="button" class="notice__close"><span aria-hidden="true">×</span><span class="visually-hidden">Zavřít oznámení</span></button>
    </div>

    <header class="site-header">
      <a class="logo" href="#">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='40' viewBox='0 0 150 40'%3E%3Cg fill='%230f766e'%3E%3Cellipse cx='20' cy='26' rx='9' ry='8'/%3E%3Ccircle cx='9' cy='15' r='4'/%3E%3Ccircle cx='16' cy='9' r='4'/%3E%3Ccircle cx='24' cy='9' r='4'/%3E%3Ccircle cx='31' cy='15' r='4'/%3E%3C/g%3E%3Ctext x='44' y='28' font-family='system-ui,sans-serif' font-size='22' font-weight='700' fill='%23134e4a'%3ETlapka%3C/text%3E%3C/svg%3E" width="150" height="40" alt="Veterinární klinika Tlapka, úvodní stránka">
      </a>
      <nav class="menu">
        <a href="#sluzby">Služby</a>
        <a href="#hodiny">Ordinační hodiny</a>
        <a href="#objednani">Objednání</a>
      </nav>
      <a class="phone" href="tel:+420541123456">541 123 456</a>
    </header>

    <main class="page">
      <section class="hero">
        <h1 class="hero__title">Veterinární klinika Tlapka</h1>
        <p class="hero__lead">Ošetříme psy, kočky, králíky i morčata. V Žabovřeskách od roku 2009, s vlastním rentgenem a laboratoří.</p>
      </section>

      <section class="services" id="sluzby">
        <h2 class="section-title">Co u nás ošetříme</h2>
        <ul class="services__list">
          <li class="service">
            <h3 class="service__name">Očkování a čipování</h3>
            <p>Vakcinace podle věku zvířete, čip a pas pro cesty do zahraničí.</p>
          </li>
          <li class="service">
            <h3 class="service__name">Zubní péče</h3>
            <p>Odstranění zubního kamene v sedaci a extrakce bez stresu.</p>
          </li>
          <li class="service">
            <h3 class="service__name">Malí savci</h3>
            <p>Králíci, morčata a činčily: výživa, zuby a preventivní prohlídky.</p>
          </li>
        </ul>
      </section>

      <section class="hours" id="hodiny">
        <h2 class="section-title">Ordinační hodiny</h2>
        <p>Dnes ordinujeme 8:00–18:00.</p>
        <button type="button" class="hours__toggle" aria-expanded="false" aria-controls="hours-week">Celý týden</button>
        <dl class="hours__week" id="hours-week" hidden>
          <dt>Pondělí–čtvrtek</dt><dd>8:00–18:00</dd>
          <dt>Pátek</dt><dd>8:00–15:00</dd>
          <dt>Sobota</dt><dd>9:00–12:00, jen akutní případy</dd>
        </dl>
      </section>

      <section class="booking" id="objednani">
        <h2 class="section-title">Objednání na vyšetření</h2>
        <form class="booking__form" action="#objednani">
          <label for="owner">Jméno a příjmení</label>
          <input id="owner" name="owner" type="text" autocomplete="name" required>
          <label for="phone">Telefon</label>
          <input id="phone" name="phone" type="tel" autocomplete="tel" required>
          <label for="species">Druh zvířete</label>
          <select id="species" name="species" required>
            <option value="">Vyber</option>
            <option>Pes</option>
            <option>Kočka</option>
            <option>Králík nebo jiný malý savec</option>
          </select>
          <label for="problem">Co zvířeti je?</label>
          <textarea id="problem" name="problem" rows="3"></textarea>
          <button class="button booking__submit">Objednat</button>
        </form>
        <p class="booking__message" id="booking-message" role="status"></p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Veterinární klinika Tlapka · Kosmonautů 14, Brno-Žabovřesky · <a href="mailto:recepce@klinikatlapka.cz">recepce@klinikatlapka.cz</a></p>
    </footer>
    <script src="script.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
:root {
  --teal: #0f766e;
  --teal-dark: #134e4a;
  --mint: #ccfbf1;
  --sand: #fefce8;
  --line: #d6d3d1;
  --text: #1c1917;
  --muted: #57534e;
  --radius: 0.75rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--sand);
}

a { color: var(--teal-dark); }

:focus-visible {
  outline: 3px solid var(--teal);
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.notice {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 1rem;
  background: var(--teal-dark);
  color: white;
}

.notice__text { margin: 0; }

.notice__close {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid var(--line);
}

.logo { display: block; line-height: 0; }

.menu { display: flex; gap: 1.25rem; }
.menu a { font-weight: 600; text-decoration: none; }
.menu a:hover { text-decoration: underline; }

.phone { margin-left: auto; font-weight: 700; }

.page {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.hero {
  padding: 2rem;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--mint), white);
}

.hero__title {
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--teal-dark);
}

.hero__lead { margin: 0; max-width: 36rem; font-size: 1.125rem; color: var(--muted); }

.section-title { margin: 2.5rem 0 1rem; font-size: 1.6rem; color: var(--teal-dark); }

.services__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.service {
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: white;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.service:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgb(19 78 74 / 0.12); }
.service__name { margin: 0 0 0.25rem; font-size: 1.1rem; }
.service p { margin: 0; color: var(--muted); }

.hours__toggle,
.button {
  display: inline-flex;
  justify-content: center;
  padding: 0.55rem 1.1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--teal);
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.hours__toggle:hover,
.button:hover { background: var(--teal-dark); }

.hours__week {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1.5rem;
  margin: 1rem 0 0;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: white;
}

.hours__week[hidden] { display: none; }
.hours__week dt { font-weight: 600; }
.hours__week dd { margin: 0; }

.booking__form {
  display: grid;
  gap: 0.5rem;
  max-width: 26rem;
}

.booking__form label { font-weight: 600; }

.booking__form input,
.booking__form select,
.booking__form textarea {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid #78716c;
  border-radius: 0.5rem;
  background: white;
  font: inherit;
}

.booking__submit { justify-self: start; }

.booking__message { min-height: 1.5rem; margin: 1rem 0 0; font-weight: 600; color: var(--teal-dark); }

.site-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--line);
  background: white;
  color: var(--muted);
  text-align: center;
}
```

### --file-- script.js

```js
// Skript kliniky: oznámení, ordinační hodiny a objednávkový formulář.
const notice = document.querySelector('.notice');
document.querySelector('.notice__close').addEventListener('click', () => {
  notice.hidden = true;
});

const hoursToggle = document.querySelector('.hours__toggle');
const hoursWeek = document.querySelector('#hours-week');

hoursToggle.addEventListener('click', () => {
  hoursWeek.hidden = !hoursWeek.hidden;
  hoursToggle.setAttribute('aria-expanded', String(!hoursWeek.hidden));
});

const bookingForm = document.querySelector('.booking__form');
const bookingMessage = document.querySelector('#booking-message');

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const owner = bookingForm.elements.owner.value.trim();
  bookingMessage.textContent = `Děkujeme, ${owner}. Do hodiny vám zavoláme a domluvíme termín.`;
  bookingForm.reset();
});
```

## --approach-- Popisky obalující pole a atributy ARIA

Pole jsou uvnitř svých `<label>`, takže `for` a `id` nejsou potřeba. Zavírací tlačítko a odkaz s logem mají `aria-label` (logo je pak ozdoba s `alt=""`), poděkování je `aria-live="polite"` a obrys se schová jen po kliknutí myší přes `:focus:not(:focus-visible)`. Stav hodin se přepíná podle hodnoty atributu. Kratší zápis, ale `aria-label` se snadno rozejde s tím, co je vidět, a na obalující popisky si musíš pohlídat vzhled.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs-CZ">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Veterinární klinika Tlapka — Brno-Žabovřesky</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="notice">
      <p class="notice__text">Od 1. prosince ordinujeme i v Líšni, Holzova 8.</p>
      <button type="button" class="notice__close" aria-label="Zavřít oznámení">×</button>
    </div>

    <header class="site-header">
      <a class="logo" href="#" aria-label="Tlapka, úvodní stránka">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='40' viewBox='0 0 150 40'%3E%3Cg fill='%230f766e'%3E%3Cellipse cx='20' cy='26' rx='9' ry='8'/%3E%3Ccircle cx='9' cy='15' r='4'/%3E%3Ccircle cx='16' cy='9' r='4'/%3E%3Ccircle cx='24' cy='9' r='4'/%3E%3Ccircle cx='31' cy='15' r='4'/%3E%3C/g%3E%3Ctext x='44' y='28' font-family='system-ui,sans-serif' font-size='22' font-weight='700' fill='%23134e4a'%3ETlapka%3C/text%3E%3C/svg%3E" width="150" height="40" alt="">
      </a>
      <nav class="menu" aria-label="Hlavní menu">
        <a href="#sluzby">Služby</a>
        <a href="#hodiny">Ordinační hodiny</a>
        <a href="#objednani">Objednání</a>
      </nav>
      <a class="phone" href="tel:+420541123456">541 123 456</a>
    </header>

    <main class="page">
      <section class="hero">
        <h1 class="hero__title">Veterinární klinika Tlapka</h1>
        <p class="hero__lead">Ošetříme psy, kočky, králíky i morčata. V Žabovřeskách od roku 2009, s vlastním rentgenem a laboratoří.</p>
      </section>

      <section class="services" id="sluzby">
        <h2 class="section-title">Co u nás ošetříme</h2>
        <ul class="services__list">
          <li class="service">
            <h3 class="service__name">Očkování a čipování</h3>
            <p>Vakcinace podle věku zvířete, čip a pas pro cesty do zahraničí.</p>
          </li>
          <li class="service">
            <h3 class="service__name">Zubní péče</h3>
            <p>Odstranění zubního kamene v sedaci a extrakce bez stresu.</p>
          </li>
          <li class="service">
            <h3 class="service__name">Malí savci</h3>
            <p>Králíci, morčata a činčily: výživa, zuby a preventivní prohlídky.</p>
          </li>
        </ul>
      </section>

      <section class="hours" id="hodiny">
        <h2 class="section-title">Ordinační hodiny</h2>
        <p>Dnes ordinujeme 8:00–18:00.</p>
        <button type="button" class="hours__toggle" aria-expanded="false">Celý týden</button>
        <dl class="hours__week" id="hours-week" hidden>
          <dt>Pondělí–čtvrtek</dt><dd>8:00–18:00</dd>
          <dt>Pátek</dt><dd>8:00–15:00</dd>
          <dt>Sobota</dt><dd>9:00–12:00, jen akutní případy</dd>
        </dl>
      </section>

      <section class="booking" id="objednani">
        <h2 class="section-title">Objednání na vyšetření</h2>
        <form class="booking__form" action="#objednani">
          <label>Jméno a příjmení <input name="owner" type="text" autocomplete="name" required></label>
          <label>Telefon <input name="phone" type="tel" autocomplete="tel" placeholder="777 123 456" required></label>
          <label>Druh zvířete
          <select name="species" required>
            <option value="">Vyber</option>
            <option>Pes</option>
            <option>Kočka</option>
            <option>Králík nebo jiný malý savec</option>
          </select>
          </label>
          <label>Co zvířeti je? <textarea name="problem" rows="3"></textarea></label>
          <button type="submit" class="button booking__submit">Objednat</button>
        </form>
        <p class="booking__message" id="booking-message" aria-live="polite"></p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Veterinární klinika Tlapka · Kosmonautů 14, Brno-Žabovřesky · <a href="mailto:recepce@klinikatlapka.cz">recepce@klinikatlapka.cz</a></p>
    </footer>
    <script src="script.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
:root {
  --teal: #0f766e;
  --teal-dark: #134e4a;
  --mint: #ccfbf1;
  --sand: #fefce8;
  --line: #d6d3d1;
  --text: #1c1917;
  --muted: #57534e;
  --radius: 0.75rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--sand);
}

a { color: var(--teal-dark); }

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--teal-dark);
  outline-offset: 3px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.notice {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 1rem;
  background: var(--teal-dark);
  color: white;
}

.notice__text { margin: 0; }

.notice__close {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid var(--line);
}

.logo { display: block; line-height: 0; }

.menu { display: flex; gap: 1.25rem; }
.menu a { font-weight: 600; text-decoration: none; }
.menu a:hover { text-decoration: underline; }

.phone { margin-left: auto; font-weight: 700; }

.page {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.hero {
  padding: 2rem;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--mint), white);
}

.hero__title {
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--teal-dark);
}

.hero__lead { margin: 0; max-width: 36rem; font-size: 1.125rem; color: var(--muted); }

.section-title { margin: 2.5rem 0 1rem; font-size: 1.6rem; color: var(--teal-dark); }

.services__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.service {
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: white;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.service:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgb(19 78 74 / 0.12); }
.service__name { margin: 0 0 0.25rem; font-size: 1.1rem; }
.service p { margin: 0; color: var(--muted); }

.hours__toggle,
.button {
  display: inline-flex;
  justify-content: center;
  padding: 0.55rem 1.1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--teal);
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.hours__toggle:hover,
.button:hover { background: var(--teal-dark); }

.hours__week {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1.5rem;
  margin: 1rem 0 0;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: white;
}

.hours__week[hidden] { display: none; }
.hours__week dt { font-weight: 600; }
.hours__week dd { margin: 0; }

.booking__form {
  display: grid;
  gap: 0.5rem;
  max-width: 26rem;
}

.booking__form label { display: grid; gap: 0.35rem; font-weight: 600; }

.booking__form input,
.booking__form select,
.booking__form textarea {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid #78716c;
  border-radius: 0.5rem;
  background: white;
  font: inherit;
}

.booking__submit { justify-self: start; }

.booking__message { min-height: 1.5rem; margin: 1rem 0 0; font-weight: 600; color: var(--teal-dark); }

.site-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--line);
  background: white;
  color: var(--muted);
  text-align: center;
}
```

### --file-- script.js

```js
// Skript kliniky: oznámení, ordinační hodiny a objednávkový formulář.
const notice = document.querySelector('.notice');
document.querySelector('.notice__close').addEventListener('click', () => {
  notice.hidden = true;
});

const hoursToggle = document.querySelector('.hours__toggle');
const hoursWeek = document.querySelector('#hours-week');

hoursToggle.addEventListener('click', () => {
  const isOpen = hoursToggle.getAttribute('aria-expanded') === 'true';
  hoursToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  hoursWeek.hidden = isOpen;
});

const bookingForm = document.querySelector('.booking__form');
const bookingMessage = document.querySelector('#booking-message');

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const owner = bookingForm.elements.owner.value.trim();
  bookingMessage.textContent = `Děkujeme, ${owner}. Do hodiny vám zavoláme a domluvíme termín.`;
  bookingForm.reset();
});
```

# --review--

Testy ověřily deset chyb. Skutečný audit tím nekončí, zkontroluj ještě sám:

## --rubric--

- Stránku jsem prošel jen klávesnicí od oznámení po patičku a nikde jsem se neztratil ani nezasekl.
- V DevTools na kartě Accessibility má každé tlačítko, odkaz a pole jméno, které dává smysl samo o sobě.
- Zapnul jsem čtečku (NVDA, VoiceOver nebo Orca) a objednání jsem dokončil bez koukání na obrazovku.
- Kontrast textu v oznámení, v menu i ve formuláři jsem ověřil v DevTools a je aspoň 4,5 : 1.
- Ke každé opravě umím jednou větou říct, komu pomůže.

## --extensions--

Rozšíření bez testů: přidej odkaz „Přeskočit na obsah", přesuň oznámení do hlavičky, aby nebylo mimo oblasti stránky, a u povinných polí ukaž chybovou hlášku propojenou přes `aria-describedby`.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Veterinární klinika Tlapka — Brno-Žabovřesky</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="notice">
      <p class="notice__text">Od 1. prosince ordinujeme i v Líšni, Holzova 8.</p>
      <button type="button" class="notice__close">×</button>
    </div>

    <div class="site-header">
      <a class="logo" href="#">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='40' viewBox='0 0 150 40'%3E%3Cg fill='%230f766e'%3E%3Cellipse cx='20' cy='26' rx='9' ry='8'/%3E%3Ccircle cx='9' cy='15' r='4'/%3E%3Ccircle cx='16' cy='9' r='4'/%3E%3Ccircle cx='24' cy='9' r='4'/%3E%3Ccircle cx='31' cy='15' r='4'/%3E%3C/g%3E%3Ctext x='44' y='28' font-family='system-ui,sans-serif' font-size='22' font-weight='700' fill='%23134e4a'%3ETlapka%3C/text%3E%3C/svg%3E" width="150" height="40">
      </a>
      <div class="menu">
        <a href="#sluzby">Služby</a>
        <a href="#hodiny">Ordinační hodiny</a>
        <a href="#objednani">Objednání</a>
      </div>
      <a class="phone" href="tel:+420541123456">541 123 456</a>
    </div>

    <div class="page">
      <section class="hero">
        <div class="hero__title">Veterinární klinika Tlapka</div>
        <p class="hero__lead">Ošetříme psy, kočky, králíky i morčata. V Žabovřeskách od roku 2009, s vlastním rentgenem a laboratoří.</p>
      </section>

      <section class="services" id="sluzby">
        <h3 class="section-title">Co u nás ošetříme</h3>
        <ul class="services__list">
          <li class="service">
            <h5 class="service__name">Očkování a čipování</h5>
            <p>Vakcinace podle věku zvířete, čip a pas pro cesty do zahraničí.</p>
          </li>
          <li class="service">
            <h5 class="service__name">Zubní péče</h5>
            <p>Odstranění zubního kamene v sedaci a extrakce bez stresu.</p>
          </li>
          <li class="service">
            <h5 class="service__name">Malí savci</h5>
            <p>Králíci, morčata a činčily: výživa, zuby a preventivní prohlídky.</p>
          </li>
        </ul>
      </section>

      <section class="hours" id="hodiny">
        <h3 class="section-title">Ordinační hodiny</h3>
        <p>Dnes ordinujeme 8:00–18:00.</p>
        <button type="button" class="hours__toggle">Celý týden</button>
        <dl class="hours__week" id="hours-week" hidden>
          <dt>Pondělí–čtvrtek</dt><dd>8:00–18:00</dd>
          <dt>Pátek</dt><dd>8:00–15:00</dd>
          <dt>Sobota</dt><dd>9:00–12:00, jen akutní případy</dd>
        </dl>
      </section>

      <section class="booking" id="objednani">
        <h3 class="section-title">Objednání na vyšetření</h3>
        <form class="booking__form" action="#objednani">
          <input name="owner" type="text" autocomplete="name" placeholder="Jméno a příjmení" required>
          <input name="phone" type="tel" autocomplete="tel" placeholder="Telefon" required>
          <select name="species" required>
            <option value="">Druh zvířete</option>
            <option>Pes</option>
            <option>Kočka</option>
            <option>Králík nebo jiný malý savec</option>
          </select>
          <textarea name="problem" rows="3" placeholder="Co zvířeti je?"></textarea>
          <div class="button booking__submit">Objednat</div>
        </form>
        <p class="booking__message" id="booking-message"></p>
      </section>
    </div>

    <div class="site-footer">
      <p>Veterinární klinika Tlapka · Kosmonautů 14, Brno-Žabovřesky · <a href="mailto:recepce@klinikatlapka.cz">recepce@klinikatlapka.cz</a></p>
    </div>
    <script src="script.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --teal: #0f766e;
  --teal-dark: #134e4a;
  --mint: #ccfbf1;
  --sand: #fefce8;
  --line: #d6d3d1;
  --text: #1c1917;
  --muted: #57534e;
  --radius: 0.75rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--sand);
}

a { color: var(--teal-dark); }

:focus {
  outline: none;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.notice {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 1rem;
  background: var(--teal-dark);
  color: white;
}

.notice__text { margin: 0; }

.notice__close {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid var(--line);
}

.logo { display: block; line-height: 0; }

.menu { display: flex; gap: 1.25rem; }
.menu a { font-weight: 600; text-decoration: none; }
.menu a:hover { text-decoration: underline; }

.phone { margin-left: auto; font-weight: 700; }

.page {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.hero {
  padding: 2rem;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--mint), white);
}

.hero__title {
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--teal-dark);
}

.hero__lead { margin: 0; max-width: 36rem; font-size: 1.125rem; color: var(--muted); }

.section-title { margin: 2.5rem 0 1rem; font-size: 1.6rem; color: var(--teal-dark); }

.services__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.service {
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: white;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.service:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgb(19 78 74 / 0.12); }
.service__name { margin: 0 0 0.25rem; font-size: 1.1rem; }
.service p { margin: 0; color: var(--muted); }

.hours__toggle,
.button {
  display: inline-flex;
  justify-content: center;
  padding: 0.55rem 1.1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--teal);
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.hours__toggle:hover,
.button:hover { background: var(--teal-dark); }

.hours__week {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1.5rem;
  margin: 1rem 0 0;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: white;
}

.hours__week[hidden] { display: none; }
.hours__week dt { font-weight: 600; }
.hours__week dd { margin: 0; }

.booking__form {
  display: grid;
  gap: 0.5rem;
  max-width: 26rem;
}

.booking__form label { font-weight: 600; }

.booking__form input,
.booking__form select,
.booking__form textarea {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid #78716c;
  border-radius: 0.5rem;
  background: white;
  font: inherit;
}

.booking__submit { justify-self: start; }

.booking__message { min-height: 1.5rem; margin: 1rem 0 0; font-weight: 600; color: var(--teal-dark); }

.site-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--line);
  background: white;
  color: var(--muted);
  text-align: center;
}
```

## --file-- script.js

```js
// Skript kliniky: oznámení, ordinační hodiny a objednávkový formulář.
const notice = document.querySelector('.notice');
document.querySelector('.notice__close').addEventListener('click', () => {
  notice.hidden = true;
});

const hoursToggle = document.querySelector('.hours__toggle');
const hoursWeek = document.querySelector('#hours-week');

hoursToggle.addEventListener('click', () => {
  hoursWeek.hidden = !hoursWeek.hidden;
});

const bookingForm = document.querySelector('.booking__form');
const bookingMessage = document.querySelector('#booking-message');

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const owner = bookingForm.elements.owner.value.trim();
  bookingMessage.textContent = `Děkujeme, ${owner}. Do hodiny vám zavoláme a domluvíme termín.`;
  bookingForm.reset();
});

// „Objednat" samo formulář neodešle, tak ho odešleme po kliknutí ručně.
document.querySelector('.booking__submit').addEventListener('click', () => {
  bookingForm.requestSubmit();
});
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Veterinární klinika Tlapka — Brno-Žabovřesky</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="notice">
      <p class="notice__text">Od 1. prosince ordinujeme i v Líšni, Holzova 8.</p>
      <button type="button" class="notice__close"><span aria-hidden="true">×</span><span class="visually-hidden">Zavřít oznámení</span></button>
    </div>

    <header class="site-header">
      <a class="logo" href="#">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='40' viewBox='0 0 150 40'%3E%3Cg fill='%230f766e'%3E%3Cellipse cx='20' cy='26' rx='9' ry='8'/%3E%3Ccircle cx='9' cy='15' r='4'/%3E%3Ccircle cx='16' cy='9' r='4'/%3E%3Ccircle cx='24' cy='9' r='4'/%3E%3Ccircle cx='31' cy='15' r='4'/%3E%3C/g%3E%3Ctext x='44' y='28' font-family='system-ui,sans-serif' font-size='22' font-weight='700' fill='%23134e4a'%3ETlapka%3C/text%3E%3C/svg%3E" width="150" height="40" alt="Veterinární klinika Tlapka, úvodní stránka">
      </a>
      <nav class="menu">
        <a href="#sluzby">Služby</a>
        <a href="#hodiny">Ordinační hodiny</a>
        <a href="#objednani">Objednání</a>
      </nav>
      <a class="phone" href="tel:+420541123456">541 123 456</a>
    </header>

    <main class="page">
      <section class="hero">
        <h1 class="hero__title">Veterinární klinika Tlapka</h1>
        <p class="hero__lead">Ošetříme psy, kočky, králíky i morčata. V Žabovřeskách od roku 2009, s vlastním rentgenem a laboratoří.</p>
      </section>

      <section class="services" id="sluzby">
        <h2 class="section-title">Co u nás ošetříme</h2>
        <ul class="services__list">
          <li class="service">
            <h3 class="service__name">Očkování a čipování</h3>
            <p>Vakcinace podle věku zvířete, čip a pas pro cesty do zahraničí.</p>
          </li>
          <li class="service">
            <h3 class="service__name">Zubní péče</h3>
            <p>Odstranění zubního kamene v sedaci a extrakce bez stresu.</p>
          </li>
          <li class="service">
            <h3 class="service__name">Malí savci</h3>
            <p>Králíci, morčata a činčily: výživa, zuby a preventivní prohlídky.</p>
          </li>
        </ul>
      </section>

      <section class="hours" id="hodiny">
        <h2 class="section-title">Ordinační hodiny</h2>
        <p>Dnes ordinujeme 8:00–18:00.</p>
        <button type="button" class="hours__toggle" aria-expanded="false" aria-controls="hours-week">Celý týden</button>
        <dl class="hours__week" id="hours-week" hidden>
          <dt>Pondělí–čtvrtek</dt><dd>8:00–18:00</dd>
          <dt>Pátek</dt><dd>8:00–15:00</dd>
          <dt>Sobota</dt><dd>9:00–12:00, jen akutní případy</dd>
        </dl>
      </section>

      <section class="booking" id="objednani">
        <h2 class="section-title">Objednání na vyšetření</h2>
        <form class="booking__form" action="#objednani">
          <label for="owner">Jméno a příjmení</label>
          <input id="owner" name="owner" type="text" autocomplete="name" required>
          <label for="phone">Telefon</label>
          <input id="phone" name="phone" type="tel" autocomplete="tel" required>
          <label for="species">Druh zvířete</label>
          <select id="species" name="species" required>
            <option value="">Vyber</option>
            <option>Pes</option>
            <option>Kočka</option>
            <option>Králík nebo jiný malý savec</option>
          </select>
          <label for="problem">Co zvířeti je?</label>
          <textarea id="problem" name="problem" rows="3"></textarea>
          <button class="button booking__submit">Objednat</button>
        </form>
        <p class="booking__message" id="booking-message" role="status"></p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Veterinární klinika Tlapka · Kosmonautů 14, Brno-Žabovřesky · <a href="mailto:recepce@klinikatlapka.cz">recepce@klinikatlapka.cz</a></p>
    </footer>
    <script src="script.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --teal: #0f766e;
  --teal-dark: #134e4a;
  --mint: #ccfbf1;
  --sand: #fefce8;
  --line: #d6d3d1;
  --text: #1c1917;
  --muted: #57534e;
  --radius: 0.75rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--sand);
}

a { color: var(--teal-dark); }

:focus-visible {
  outline: 3px solid var(--teal);
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.notice {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 1rem;
  background: var(--teal-dark);
  color: white;
}

.notice__text { margin: 0; }

.notice__close {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid var(--line);
}

.logo { display: block; line-height: 0; }

.menu { display: flex; gap: 1.25rem; }
.menu a { font-weight: 600; text-decoration: none; }
.menu a:hover { text-decoration: underline; }

.phone { margin-left: auto; font-weight: 700; }

.page {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.hero {
  padding: 2rem;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--mint), white);
}

.hero__title {
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--teal-dark);
}

.hero__lead { margin: 0; max-width: 36rem; font-size: 1.125rem; color: var(--muted); }

.section-title { margin: 2.5rem 0 1rem; font-size: 1.6rem; color: var(--teal-dark); }

.services__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.service {
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: white;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.service:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgb(19 78 74 / 0.12); }
.service__name { margin: 0 0 0.25rem; font-size: 1.1rem; }
.service p { margin: 0; color: var(--muted); }

.hours__toggle,
.button {
  display: inline-flex;
  justify-content: center;
  padding: 0.55rem 1.1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--teal);
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.hours__toggle:hover,
.button:hover { background: var(--teal-dark); }

.hours__week {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1.5rem;
  margin: 1rem 0 0;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: white;
}

.hours__week[hidden] { display: none; }
.hours__week dt { font-weight: 600; }
.hours__week dd { margin: 0; }

.booking__form {
  display: grid;
  gap: 0.5rem;
  max-width: 26rem;
}

.booking__form label { font-weight: 600; }

.booking__form input,
.booking__form select,
.booking__form textarea {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid #78716c;
  border-radius: 0.5rem;
  background: white;
  font: inherit;
}

.booking__submit { justify-self: start; }

.booking__message { min-height: 1.5rem; margin: 1rem 0 0; font-weight: 600; color: var(--teal-dark); }

.site-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--line);
  background: white;
  color: var(--muted);
  text-align: center;
}
```

## --file-- script.js

```js
// Skript kliniky: oznámení, ordinační hodiny a objednávkový formulář.
const notice = document.querySelector('.notice');
document.querySelector('.notice__close').addEventListener('click', () => {
  notice.hidden = true;
});

const hoursToggle = document.querySelector('.hours__toggle');
const hoursWeek = document.querySelector('#hours-week');

hoursToggle.addEventListener('click', () => {
  hoursWeek.hidden = !hoursWeek.hidden;
  hoursToggle.setAttribute('aria-expanded', String(!hoursWeek.hidden));
});

const bookingForm = document.querySelector('.booking__form');
const bookingMessage = document.querySelector('#booking-message');

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const owner = bookingForm.elements.owner.value.trim();
  bookingMessage.textContent = `Děkujeme, ${owner}. Do hodiny vám zavoláme a domluvíme termín.`;
  bookingForm.reset();
});
```
