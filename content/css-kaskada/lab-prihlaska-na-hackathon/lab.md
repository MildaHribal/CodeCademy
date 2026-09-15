---
title: Přihláška na hackathon
see: css-kaskada/moderni-selektory#stav-formulare-focus-within-a-user-invalid, css-kaskada/kaskada#vrstvy-layer
---

# --description--

Brněnský hackathon **Kód pro město** spouští registraci. HTML přihlášky je hotové a první návrh stylů taky — jenže je napsaný postaru: id selektory, `!important`, všechno mimo vrstvy a chyby, které na uživatele svítí dřív, než stihne cokoli napsat. Pole a tlačítko navíc nemají písmo stránky a přepínače zkušeností dostaly odsazení a rámeček určené pro textová pole.

Přepiš `styles.css` tak, aby se styly daly dál rozvíjet bez přebíjení a aby formulář reagoval na to, co uživatel dělá. HTML neměň. **Téma, texty a vzhled jsou tvoje volba** — testy kontrolují, jak jsou styly uspořádané a jak se formulář chová, ne barvy.

**Jak se má přihláška chovat:**

- Styly jsou ve vrstvách `reset`, `base` a `components` v tomhle pořadí (další vrstvy smíš přidat). Mimo vrstvy nezůstane nic, žádný `!important` ani selektor s id.
- Pole, výběr, textová oblast i tlačítko mají stejné písmo jako zbytek formuláře.
- Když uživatel přihlášku otevře, nevidí žádnou chybu ani souhrn chyb, i když jsou povinná pole prázdná.
- Když zkusí odeslat formulář s chybou, u každého chybného pole se ukáže jeho zpráva `.field__error`, chybné pole se vizuálně změní a nad tlačítkem se objeví souhrn `.form__summary`.
- Když chybné pole opraví, jeho zpráva zmizí. Jakmile opraví všechno a zaškrtne souhlas, zmizí i souhrn.
- Když píše do některého pole, je zvýrazněný celý jeho obal `.field`, ne jen samotné pole.
- Vybraná volba zkušeností `.choice` je zvýrazněná.
- Dokud není zaškrtnutý souhlas, je tlačítko ztlumené.

Všechno jde bez JavaScriptu.

> [!TIP]
> Stav formuláře si vyzkoušíš v náhledu: klikni na **Odeslat přihlášku** s prázdnými poli. Náhled odeslání zablokuje, dokud jsou pole chybná.

# --hints--

Ve `styles.css` není žádné pravidlo mimo vrstvy `@layer`.

```js
const sheet = document.styleSheets[0];
assert.ok(sheet && sheet.cssRules.length, 'Nenašel jsem styly ze styles.css — nesmazal jsi odkaz v index.html?');
const outside = [...sheet.cssRules]
  .filter((rule) => !(rule instanceof CSSLayerBlockRule || rule instanceof CSSLayerStatementRule))
  .map((rule) => rule.cssText.split('{')[0].trim());
assert.deepEqual(outside, [], `Pravidla mimo vrstvy ve styles.css: ${outside.join(', ')}`);
```

Vrstvy jdou v pořadí `reset`, `base`, `components`: pravidlo v pozdější vrstvě přebije stejné pravidlo v dřívější.

```js
const probe = document.createElement('style');
probe.textContent = `
  @layer components { .probe-a { color: rgb(3, 3, 3); } }
  @layer base { .probe-a, .probe-b { color: rgb(2, 2, 2); } }
  @layer reset { .probe-a, .probe-b { color: rgb(1, 1, 1); } }
`;
document.head.append(probe);
const a = document.createElement('p');
a.className = 'probe-a';
const b = document.createElement('p');
b.className = 'probe-b';
document.body.append(a, b);
assert.equal(getComputedStyle(a).color, 'rgb(3, 3, 3)', 'Pravidlo ve vrstvě components má přebít base i reset — chybí vrstva components, nebo není v pořadí poslední z těch tří?');
assert.equal(getComputedStyle(b).color, 'rgb(2, 2, 2)', 'Pravidlo ve vrstvě base má přebít reset — je base v pořadí za reset?');
```

Pole, výběr, textová oblast i tlačítko mají stejné písmo (rodinu i velikost) jako text formuláře.

```js
const form = getComputedStyle(document.querySelector('.signup'));
for (const selector of ['#name', '#shirt', '#note', '.btn']) {
  const style = getComputedStyle(document.querySelector(selector));
  assert.equal(style.fontFamily, form.fontFamily, `${selector} má písmo ${style.fontFamily}, formulář ${form.fontFamily}`);
  assert.equal(style.fontSize, form.fontSize, `${selector} má velikost písma ${style.fontSize}, formulář ${form.fontSize}`);
}
```

`styles.css` neobsahuje žádný `!important`.

```js
const css = helpers.stripComments(files['styles.css'], 'css');
const count = (css.match(/!\s*important/gi) ?? []).length;
assert.equal(count, 0, `styles.css obsahuje ${count}× !important`);
```

Žádný selektor ve `styles.css` neobsahuje id.

```js
const withId = [];
const visit = (rules) => {
  for (const rule of rules) {
    if (rule.selectorText && /#[\w-]/.test(rule.selectorText.replace(/\[[^\]]*\]/g, ''))) withId.push(rule.selectorText);
    if (rule.cssRules) visit(rule.cssRules);
  }
};
visit(document.styleSheets[0].cssRules);
assert.deepEqual(withId, [], `Selektory s id ve styles.css: ${withId.join(', ')}`);
```

Hned po načtení není vidět žádná chybová zpráva ani souhrn a prázdné povinné pole vypadá stejně jako prázdné nepovinné.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const visible = (el) => {
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && el.getBoundingClientRect().height > 0;
};
const look = (field) => {
  const parts = [field, field.querySelector('.field__control')].map((el) => {
    const s = getComputedStyle(el);
    return `${s.backgroundColor} ${s.borderTopColor} ${s.borderRightColor} ${s.borderBottomColor} ${s.borderLeftColor} ${s.borderTopWidth} ${s.borderRightWidth} ${s.borderBottomWidth} ${s.borderLeftWidth} ${s.boxShadow} ${s.outlineStyle} ${s.outlineColor} ${s.color}`;
  });
  return parts.join(' | ');
};
document.querySelectorAll('.field__error').forEach((error) => {
  assert.ok(!visible(error), `Chybová zpráva „${error.textContent.trim()}" je vidět hned po načtení`);
});
assert.ok(!visible(document.querySelector('.form__summary')), 'Souhrn chyb .form__summary je vidět hned po načtení');
const required = document.querySelector('#name').closest('.field');
const optional = document.querySelector('#github').closest('.field');
assert.equal(look(required), look(optional), 'Prázdné povinné pole Jméno vypadá po načtení jinak než nepovinný GitHub — chyba se ukazuje dřív, než uživatel něco udělal (:invalid místo :user-invalid?)');
```

Po pokusu o odeslání prázdného formuláře je vidět chybová zpráva u jména, e-mailu a velikosti trička, u nepovinného GitHubu ne.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const visible = (el) => {
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && el.getBoundingClientRect().height > 0;
};
await helpers.submit(document.querySelector('.signup'));
await helpers.wait(50);
for (const id of ['name', 'email', 'shirt']) {
  const error = document.querySelector(`#${id}`).closest('.field').querySelector('.field__error');
  assert.ok(visible(error), `Po pokusu o odeslání má být vidět chyba u pole #${id}`);
}
assert.ok(!visible(document.querySelector('#github').closest('.field').querySelector('.field__error')), 'Prázdný nepovinný GitHub nemá po odeslání ukazovat chybu');
```

Po pokusu o odeslání vypadá chybné pole jinak než před ním.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const look = (field) => [field, field.querySelector('.field__control')].map((el) => {
  const s = getComputedStyle(el);
  return `${s.backgroundColor} ${s.borderTopColor} ${s.borderRightColor} ${s.borderBottomColor} ${s.borderLeftColor} ${s.borderTopWidth} ${s.borderRightWidth} ${s.borderBottomWidth} ${s.borderLeftWidth} ${s.boxShadow} ${s.outlineStyle} ${s.outlineColor} ${s.color}`;
}).join(' | ');
const fields = ['name', 'shirt'].map((id) => document.querySelector(`#${id}`).closest('.field'));
const before = fields.map(look);
await helpers.submit(document.querySelector('.signup'));
document.activeElement?.blur();
await helpers.wait(50);
fields.forEach((field, i) => {
  assert.notEqual(look(field), before[i], `Pole ${field.querySelector('.field__label').textContent} s chybou vypadá po pokusu o odeslání stejně jako před ním (rámeček, pozadí, stín, obrys ani barva textu pole nebo obalu .field se nezměnily)`);
});
```

Když uživatel chybné pole opraví, jeho chybová zpráva zmizí a pole vypadá jinak než pole, které chybu má dál.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const visible = (el) => {
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && el.getBoundingClientRect().height > 0;
};
const look = (field) => [field, field.querySelector('.field__control')].map((el) => {
  const s = getComputedStyle(el);
  return `${s.backgroundColor} ${s.borderTopColor} ${s.borderRightColor} ${s.borderBottomColor} ${s.borderLeftColor} ${s.borderTopWidth} ${s.borderRightWidth} ${s.borderBottomWidth} ${s.borderLeftWidth} ${s.boxShadow} ${s.outlineStyle} ${s.outlineColor} ${s.color}`;
}).join(' | ');
await helpers.submit(document.querySelector('.signup'));
const name = document.querySelector('#name');
await helpers.type(name, 'Jana Nováková');
document.activeElement?.blur();
await helpers.wait(50);
const fixed = name.closest('.field');
const broken = document.querySelector('#email').closest('.field');
assert.ok(!visible(fixed.querySelector('.field__error')), 'Po vyplnění jména má jeho chybová zpráva zmizet');
assert.ok(visible(broken.querySelector('.field__error')), 'E-mail je dál prázdný a jeho chyba má zůstat vidět');
assert.notEqual(look(fixed), look(broken), 'Opravené jméno vypadá stejně jako e-mail, který chybu má dál');
```

Souhrn chyb `.form__summary` se ukáže po pokusu o odeslání formuláře s chybou.

```js
const visible = (el) => {
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && el.getBoundingClientRect().height > 0;
};
await helpers.submit(document.querySelector('.signup'));
await helpers.wait(50);
assert.ok(visible(document.querySelector('.form__summary')), 'Po pokusu o odeslání s chybou má být souhrn .form__summary vidět');
```

Když uživatel po neúspěšném odeslání opraví všechna povinná pole a zaškrtne souhlas, souhrn zmizí.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const visible = (el) => {
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && el.getBoundingClientRect().height > 0;
};
const summary = document.querySelector('.form__summary');
await helpers.submit(document.querySelector('.signup'));
await helpers.type(document.querySelector('#name'), 'Jana Nováková');
await helpers.type(document.querySelector('#email'), 'jana.novakova@example.cz');
const shirt = document.querySelector('#shirt');
shirt.value = 'M';
shirt.dispatchEvent(new Event('input', { bubbles: true }));
shirt.dispatchEvent(new Event('change', { bubbles: true }));
await helpers.wait(50);
assert.ok(visible(summary), 'Souhlas ještě není zaškrtnutý, souhrn má zůstat vidět');
await helpers.click(document.querySelector('.consent__input'));
await helpers.wait(50);
assert.ok(!visible(summary), 'Všechna povinná pole jsou opravená a souhlas zaškrtnutý — souhrn má zmizet');
```

Obal `.field`, ve kterém má fokus pole, vypadá jinak než ostatní obaly.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const look = (el) => {
  const s = getComputedStyle(el);
  return `${s.backgroundColor} ${s.borderTopColor} ${s.borderRightColor} ${s.borderBottomColor} ${s.borderLeftColor} ${s.borderTopWidth} ${s.borderRightWidth} ${s.borderBottomWidth} ${s.borderLeftWidth} ${s.boxShadow} ${s.outlineStyle} ${s.outlineColor} ${s.color}`;
};
document.querySelector('#email').focus();
const focused = document.querySelector('#email').closest('.field');
const other = document.querySelector('#shirt').closest('.field');
assert.notEqual(look(focused), look(other), 'Obal .field s fokusem v poli E-mail vypadá stejně jako obal pole bez fokusu');
document.querySelector('#shirt').focus();
assert.equal(look(focused), look(document.querySelector('#name').closest('.field')), 'Po přesunu fokusu jinam má obal E-mailu zase vypadat jako ostatní');
```

Vybraná volba zkušeností `.choice` vypadá jinak než nevybrané, a to i po přepnutí na jinou volbu.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const look = (el) => {
  const s = getComputedStyle(el);
  return `${s.backgroundColor} ${s.borderTopColor} ${s.borderRightColor} ${s.borderBottomColor} ${s.borderLeftColor} ${s.borderTopWidth} ${s.borderRightWidth} ${s.borderBottomWidth} ${s.borderLeftWidth} ${s.boxShadow} ${s.outlineStyle} ${s.outlineColor} ${s.color}`;
};
const choices = [...document.querySelectorAll('.choice')];
assert.notEqual(look(choices[0]), look(choices[1]), 'Výchozí vybraná volba „Začínám" vypadá stejně jako nevybrané');
await helpers.click(choices[2].querySelector('.choice__input'));
assert.notEqual(look(choices[2]), look(choices[1]), 'Po výběru třetí volby má vypadat jinak než nevybraná druhá');
assert.equal(look(choices[0]), look(choices[1]), 'Po výběru třetí volby má první volba vypadat jako nevybraná');
```

Dokud není zaškrtnutý souhlas, je tlačítko ztlumené (průhlednost nejvýš 0,7). Po zaškrtnutí je plně neprůhledné.

```js
const off = document.createElement('style');
off.textContent = '* { transition: none !important; }';
document.head.append(off);
const button = document.querySelector('.btn');
assert.ok(Number(getComputedStyle(button).opacity) <= 0.7, `Bez souhlasu má tlačítko opacity ${getComputedStyle(button).opacity}, čekám nejvýš 0.7`);
await helpers.click(document.querySelector('.consent__input'));
assert.equal(getComputedStyle(button).opacity, '1', 'Po zaškrtnutí souhlasu má mít tlačítko opacity 1');
await helpers.click(document.querySelector('.consent__input'));
assert.ok(Number(getComputedStyle(button).opacity) <= 0.7, 'Po odškrtnutí souhlasu má být tlačítko zase ztlumené');
```

# --help--

## --tip-- 7

Chyba se má ukázat až po interakci uživatele. Pseudotřídy, které se liší právě tímhle, porovnává část [Stav formuláře: :focus-within a :user-invalid](see:css-kaskada/moderni-selektory#stav-formulare-focus-within-a-user-invalid). Zpráva ale není uvnitř pole, takže potřebuješ selektor, který se od stavu pole dostane k jeho sourozenci nebo obalu.

## --tip-- 3

Formulářové prvky nedědí písmo, protože jim ho nastavují výchozí styly prohlížeče. Proč nepomůže písmo na `body`, vysvětluje [Zděděná hodnota prohraje s každou deklarací](see:css-kaskada/dedicnost#zdedena-hodnota-prohraje-s-kazdou-deklaraci).

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Přihláška — Hackathon Kód pro město</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="page">
      <header class="event">
        <p class="event__meta">Brno · 17.–18. října 2026 · Kampus Hybernská</p>
        <h1 class="event__title">Hackathon Kód pro město</h1>
        <p class="event__text">48 hodin, 30 týmů a otevřená data brněnského magistrátu. Postav aplikaci, která městu opravdu pomůže. Účast je zdarma, jídlo a káva taky.</p>
      </header>

      <form id="signup" class="signup" action="#">
        <h2 class="signup__title">Přihláška</h2>

        <div class="field">
          <label class="field__label" for="name">Jméno a příjmení</label>
          <input class="field__control" id="name" name="name" autocomplete="name" required>
          <p class="field__error">Vyplň jméno a příjmení.</p>
        </div>

        <div class="field">
          <label class="field__label" for="email">E-mail</label>
          <input class="field__control" id="email" name="email" type="email" autocomplete="email" required placeholder="jana.novakova@example.cz">
          <p class="field__hint">Pošleme na něj potvrzení a pokyny před akcí.</p>
          <p class="field__error">Zadej e-mail ve tvaru jana.novakova@example.cz.</p>
        </div>

        <div class="field">
          <label class="field__label" for="github">Profil na GitHubu</label>
          <input class="field__control" id="github" name="github" type="url" placeholder="https://github.com/janicka">
          <p class="field__hint">Nepovinné. Pomůže nám poskládat vyrovnané týmy.</p>
          <p class="field__error">Odkaz musí být celá adresa, třeba https://github.com/janicka.</p>
        </div>

        <div class="field">
          <label class="field__label" for="shirt">Velikost trička</label>
          <select class="field__control" id="shirt" name="shirt" required>
            <option value="">Vyber velikost</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
          </select>
          <p class="field__error">Vyber velikost trička.</p>
        </div>

        <fieldset class="choices">
          <legend class="field__label">Kolik máš zkušeností?</legend>
          <label class="choice">
            <input class="choice__input" type="radio" name="level" value="start" checked>
            <span class="choice__title">Začínám</span>
            <span class="choice__text">První hackathon, chci se hlavně učit.</span>
          </label>
          <label class="choice">
            <input class="choice__input" type="radio" name="level" value="junior">
            <span class="choice__title">Pár projektů</span>
            <span class="choice__text">Mám za sebou školní nebo vlastní aplikace.</span>
          </label>
          <label class="choice">
            <input class="choice__input" type="radio" name="level" value="pro">
            <span class="choice__title">Programuju v práci</span>
            <span class="choice__text">Rád pomůžu týmu jako mentor.</span>
          </label>
        </fieldset>

        <div class="field">
          <label class="field__label" for="note">Co tě zajímá</label>
          <textarea class="field__control" id="note" name="note" rows="3" placeholder="Doprava, odpady, kultura…"></textarea>
        </div>

        <label class="consent">
          <input class="consent__input" type="checkbox" name="consent" required>
          <span>Souhlasím se zpracováním údajů pro účely hackathonu.</span>
        </label>

        <p class="form__summary">Některá pole nejsou vyplněná správně. Oprav je a odešli přihlášku znovu.</p>

        <button class="btn" type="submit">Odeslat přihlášku</button>
      </form>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
/* Přihláška na hackathon — styly z prvního návrhu */

:root {
  --color-bg: #f4f6fb;
  --color-surface: #ffffff;
  --color-ink: #0f172a;
  --color-muted: #64748b;
  --color-line: #d5dbe6;
  --color-accent: #4f46e5;
  --color-accent-soft: #eef2ff;
  --color-danger: #dc2626;
  --color-danger-soft: #fef2f2;
  --radius: 0.75rem;
  --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 20px 40px -24px rgb(15 23 42 / 0.35);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font: 1rem/1.5 system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--color-ink);
  background: var(--color-bg);
}

.page {
  max-width: 40rem;
  margin-inline: auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* ===== Hlavička akce ===== */

.event {
  margin-bottom: 1.5rem;
  padding: 2rem;
  border-radius: calc(var(--radius) * 1.5);
  background: linear-gradient(135deg, #312e81, #4f46e5 55%, #0ea5e9);
  color: #fff;
}

.event__meta {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.event__title {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  line-height: 1.1;
  text-wrap: balance;
}

.event__text {
  margin: 0;
  max-width: 34rem;
}

/* ===== Formulář ===== */

#signup {
  display: grid;
  gap: 1.25rem;
  padding: 2rem;
  border-radius: calc(var(--radius) * 1.5);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.signup__title {
  margin: 0;
  font-size: 1.375rem;
}

.field {
  display: grid;
  gap: 0.375rem;
  padding: 0.75rem;
  border: 1px solid transparent;
  border-radius: var(--radius);
  transition: background-color 0.2s, border-color 0.2s;
}

.field__label {
  font-weight: 600;
}

#signup input,
#signup select,
#signup textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-line);
  border-radius: calc(var(--radius) * 0.75);
  background: var(--color-surface);
}

#signup input:invalid,
#signup select:invalid {
  border-color: var(--color-danger);
}

.field__hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.field__error {
  display: none;
  margin: 0;
  color: var(--color-danger);
  font-size: 0.875rem;
  font-weight: 600;
}

.choices {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.choice {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.625rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.choice__input {
  grid-row: span 2;
  width: auto;
  accent-color: var(--color-accent);
}

.choice__title {
  font-weight: 600;
}

.choice__text {
  color: var(--color-muted);
  font-size: 0.875rem;
}

.consent {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
  font-size: 0.9375rem;
}

#signup .consent__input {
  width: auto;
  margin-top: 0.25rem;
  accent-color: var(--color-accent);
}

.form__summary {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: var(--color-danger-soft);
  color: #991b1b;
  font-weight: 600;
}

.btn {
  justify-self: start;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent) !important;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
}
```

# --solution--

## --file-- styles.css

```css
/* Přihláška na hackathon */

@layer reset, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}

@layer base {
  :root {
    --color-bg: #f4f6fb;
    --color-surface: #ffffff;
    --color-ink: #0f172a;
    --color-muted: #64748b;
    --color-line: #d5dbe6;
    --color-accent: #4f46e5;
    --color-accent-soft: #eef2ff;
    --color-danger: #dc2626;
    --color-danger-soft: #fef2f2;
    --radius: 0.75rem;
    --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 20px 40px -24px rgb(15 23 42 / 0.35);
  }

  body {
    margin: 0;
    font: 1rem/1.5 system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--color-ink);
    background: var(--color-bg);
  }
}

@layer components {
  .page {
    max-width: 40rem;
    margin-inline: auto;
    padding: 2.5rem 1.25rem 4rem;
  }

  /* ===== Hlavička akce ===== */

  .event {
    margin-bottom: 1.5rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: linear-gradient(135deg, #312e81, #4f46e5 55%, #0ea5e9);
    color: #fff;
  }

  .event__meta {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  .event__title {
    margin: 0.25rem 0 0.5rem;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    line-height: 1.1;
    text-wrap: balance;
  }

  .event__text {
    margin: 0;
    max-width: 34rem;
  }

  /* ===== Formulář ===== */

  .signup {
    display: grid;
    gap: 1.25rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: var(--color-surface);
    box-shadow: var(--shadow);
  }

  .signup__title {
    margin: 0;
    font-size: 1.375rem;
  }

  .field {
    display: grid;
    gap: 0.375rem;
    padding: 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: background-color 0.2s, border-color 0.2s;

    &:focus-within {
      border-color: var(--color-line);
      background: var(--color-accent-soft);
    }

    &:has(.field__control:user-invalid) {
      border-color: var(--color-danger);
      background: var(--color-danger-soft);
    }
  }

  .field__label {
    font-weight: 600;
  }

  .field__control {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--color-line);
    border-radius: calc(var(--radius) * 0.75);
    background: var(--color-surface);

    &:user-invalid {
      border-color: var(--color-danger);
    }
  }

  .field__hint {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .field__error {
    display: none;
    margin: 0;
    color: var(--color-danger);
    font-size: 0.875rem;
    font-weight: 600;

    .field:has(:user-invalid) & {
      display: block;
    }
  }

  .choices {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .choice {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.625rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    &:has(:checked) {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }
  }

  .choice__input {
    grid-row: span 2;
    accent-color: var(--color-accent);
  }

  .choice__title {
    font-weight: 600;
  }

  .choice__text {
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .consent {
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
    font-size: 0.9375rem;
  }

  .consent__input {
    margin-top: 0.25rem;
    accent-color: var(--color-accent);
  }

  .form__summary {
    display: none;
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    background: var(--color-danger-soft);
    color: #991b1b;
    font-weight: 600;

    .signup:has(:user-invalid) & {
      display: block;
    }
  }

  .btn {
    justify-self: start;
    padding: 0.75rem 1.5rem;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;

    &:hover {
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 3px;
    }

    .signup:has(.consent__input:not(:checked)) & {
      opacity: 0.55;
    }
  }
}
```

# --approaches--

## --approach-- `:has()` na obalu a na formuláři

Stav se čte z pole a CSS ho promítne do rodičů: `.field:has(:user-invalid)` obarví celý obal, `.signup:has(:user-invalid)` ukáže souhrn. Nejkratší a nejčitelnější cesta, když má reagovat kontejner — obal, formulář, volba s přepínačem.

### --file-- styles.css

```css
/* Přihláška na hackathon */

@layer reset, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}

@layer base {
  :root {
    --color-bg: #f4f6fb;
    --color-surface: #ffffff;
    --color-ink: #0f172a;
    --color-muted: #64748b;
    --color-line: #d5dbe6;
    --color-accent: #4f46e5;
    --color-accent-soft: #eef2ff;
    --color-danger: #dc2626;
    --color-danger-soft: #fef2f2;
    --radius: 0.75rem;
    --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 20px 40px -24px rgb(15 23 42 / 0.35);
  }

  body {
    margin: 0;
    font: 1rem/1.5 system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--color-ink);
    background: var(--color-bg);
  }
}

@layer components {
  .page {
    max-width: 40rem;
    margin-inline: auto;
    padding: 2.5rem 1.25rem 4rem;
  }

  /* ===== Hlavička akce ===== */

  .event {
    margin-bottom: 1.5rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: linear-gradient(135deg, #312e81, #4f46e5 55%, #0ea5e9);
    color: #fff;
  }

  .event__meta {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  .event__title {
    margin: 0.25rem 0 0.5rem;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    line-height: 1.1;
    text-wrap: balance;
  }

  .event__text {
    margin: 0;
    max-width: 34rem;
  }

  /* ===== Formulář ===== */

  .signup {
    display: grid;
    gap: 1.25rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: var(--color-surface);
    box-shadow: var(--shadow);
  }

  .signup__title {
    margin: 0;
    font-size: 1.375rem;
  }

  .field {
    display: grid;
    gap: 0.375rem;
    padding: 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: background-color 0.2s, border-color 0.2s;

    &:focus-within {
      border-color: var(--color-line);
      background: var(--color-accent-soft);
    }

    &:has(.field__control:user-invalid) {
      border-color: var(--color-danger);
      background: var(--color-danger-soft);
    }
  }

  .field__label {
    font-weight: 600;
  }

  .field__control {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--color-line);
    border-radius: calc(var(--radius) * 0.75);
    background: var(--color-surface);

    &:user-invalid {
      border-color: var(--color-danger);
    }
  }

  .field__hint {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .field__error {
    display: none;
    margin: 0;
    color: var(--color-danger);
    font-size: 0.875rem;
    font-weight: 600;

    .field:has(:user-invalid) & {
      display: block;
    }
  }

  .choices {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .choice {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.625rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    &:has(:checked) {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }
  }

  .choice__input {
    grid-row: span 2;
    accent-color: var(--color-accent);
  }

  .choice__title {
    font-weight: 600;
  }

  .choice__text {
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .consent {
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
    font-size: 0.9375rem;
  }

  .consent__input {
    margin-top: 0.25rem;
    accent-color: var(--color-accent);
  }

  .form__summary {
    display: none;
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    background: var(--color-danger-soft);
    color: #991b1b;
    font-weight: 600;

    .signup:has(:user-invalid) & {
      display: block;
    }
  }

  .btn {
    justify-self: start;
    padding: 0.75rem 1.5rem;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;

    &:hover {
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 3px;
    }

    .signup:has(.consent__input:not(:checked)) & {
      opacity: 0.55;
    }
  }
}
```

## --approach-- Stav na samotném poli a sourozenecký kombinátor

Chybné pole dostane rámeček a pozadí přímo přes `.field__control:user-invalid` a zprávu ukáže `:user-invalid ~ .field__error`. Funguje bez `:has()`, ale jen dokud je zpráva v HTML **za** polem a ve stejném rodiči. Souhrn nad tlačítkem a volby zkušeností leží jinde, takže tam `:has()` zůstává.

### --file-- styles.css

```css
/* Přihláška na hackathon */

@layer reset, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}

@layer base {
  :root {
    --color-bg: #f4f6fb;
    --color-surface: #ffffff;
    --color-ink: #0f172a;
    --color-muted: #64748b;
    --color-line: #d5dbe6;
    --color-accent: #4f46e5;
    --color-accent-soft: #eef2ff;
    --color-danger: #dc2626;
    --color-danger-soft: #fef2f2;
    --radius: 0.75rem;
    --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 20px 40px -24px rgb(15 23 42 / 0.35);
  }

  body {
    margin: 0;
    font: 1rem/1.5 system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--color-ink);
    background: var(--color-bg);
  }
}

@layer components {
  .page {
    max-width: 40rem;
    margin-inline: auto;
    padding: 2.5rem 1.25rem 4rem;
  }

  /* ===== Hlavička akce ===== */

  .event {
    margin-bottom: 1.5rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: linear-gradient(135deg, #312e81, #4f46e5 55%, #0ea5e9);
    color: #fff;
  }

  .event__meta {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  .event__title {
    margin: 0.25rem 0 0.5rem;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    line-height: 1.1;
    text-wrap: balance;
  }

  .event__text {
    margin: 0;
    max-width: 34rem;
  }

  /* ===== Formulář ===== */

  .signup {
    display: grid;
    gap: 1.25rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: var(--color-surface);
    box-shadow: var(--shadow);
  }

  .signup__title {
    margin: 0;
    font-size: 1.375rem;
  }

  .field {
    display: grid;
    gap: 0.375rem;
    padding: 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: background-color 0.2s, border-color 0.2s;

    &:focus-within {
      border-color: var(--color-line);
      background: var(--color-accent-soft);
    }

  }

  .field__label {
    font-weight: 600;
  }

  .field__control {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--color-line);
    border-radius: calc(var(--radius) * 0.75);
    background: var(--color-surface);

    &:user-invalid {
      border-color: var(--color-danger);
      background: var(--color-danger-soft);
      box-shadow: 0 0 0 3px rgb(220 38 38 / 0.15);
    }

    &:user-invalid ~ .field__error {
      display: block;
    }
  }

  .field__hint {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .field__error {
    display: none;
    margin: 0;
    color: var(--color-danger);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .choices {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .choice {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.625rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    &:has(:checked) {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }
  }

  .choice__input {
    grid-row: span 2;
    accent-color: var(--color-accent);
  }

  .choice__title {
    font-weight: 600;
  }

  .choice__text {
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .consent {
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
    font-size: 0.9375rem;
  }

  .consent__input {
    margin-top: 0.25rem;
    accent-color: var(--color-accent);
  }

  .form__summary {
    display: none;
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    background: var(--color-danger-soft);
    color: #991b1b;
    font-weight: 600;

    .signup:has(:user-invalid) & {
      display: block;
    }
  }

  .btn {
    justify-self: start;
    padding: 0.75rem 1.5rem;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;

    &:hover {
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 3px;
    }

    .signup:has(.consent__input:not(:checked)) & {
      opacity: 0.55;
    }
  }
}
```

## --approach-- Třída na poli nastavená skriptem

Tak se to psalo před `:user-invalid` a `:has()`: skript při pokusu o odeslání zachytí událost `invalid`, přidá obalu třídu `is-invalid` a formuláři `has-errors`, CSS pak styluje jen třídy. Víc kódu a víc míst, kde se stav může rozejít s tím, co ví prohlížeč. Hodí se, když chyby počítá server nebo knihovna formulářů. Události a práci s DOM probírá sekce [DOM, události a prohlížeč](see:js-dom/udalosti).

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Přihláška — Hackathon Kód pro město</title>
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
  </head>
  <body>
    <main class="page">
      <header class="event">
        <p class="event__meta">Brno · 17.–18. října 2026 · Kampus Hybernská</p>
        <h1 class="event__title">Hackathon Kód pro město</h1>
        <p class="event__text">48 hodin, 30 týmů a otevřená data brněnského magistrátu. Postav aplikaci, která městu opravdu pomůže. Účast je zdarma, jídlo a káva taky.</p>
      </header>

      <form id="signup" class="signup" action="#">
        <h2 class="signup__title">Přihláška</h2>

        <div class="field">
          <label class="field__label" for="name">Jméno a příjmení</label>
          <input class="field__control" id="name" name="name" autocomplete="name" required>
          <p class="field__error">Vyplň jméno a příjmení.</p>
        </div>

        <div class="field">
          <label class="field__label" for="email">E-mail</label>
          <input class="field__control" id="email" name="email" type="email" autocomplete="email" required placeholder="jana.novakova@example.cz">
          <p class="field__hint">Pošleme na něj potvrzení a pokyny před akcí.</p>
          <p class="field__error">Zadej e-mail ve tvaru jana.novakova@example.cz.</p>
        </div>

        <div class="field">
          <label class="field__label" for="github">Profil na GitHubu</label>
          <input class="field__control" id="github" name="github" type="url" placeholder="https://github.com/janicka">
          <p class="field__hint">Nepovinné. Pomůže nám poskládat vyrovnané týmy.</p>
          <p class="field__error">Odkaz musí být celá adresa, třeba https://github.com/janicka.</p>
        </div>

        <div class="field">
          <label class="field__label" for="shirt">Velikost trička</label>
          <select class="field__control" id="shirt" name="shirt" required>
            <option value="">Vyber velikost</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
          </select>
          <p class="field__error">Vyber velikost trička.</p>
        </div>

        <fieldset class="choices">
          <legend class="field__label">Kolik máš zkušeností?</legend>
          <label class="choice">
            <input class="choice__input" type="radio" name="level" value="start" checked>
            <span class="choice__title">Začínám</span>
            <span class="choice__text">První hackathon, chci se hlavně učit.</span>
          </label>
          <label class="choice">
            <input class="choice__input" type="radio" name="level" value="junior">
            <span class="choice__title">Pár projektů</span>
            <span class="choice__text">Mám za sebou školní nebo vlastní aplikace.</span>
          </label>
          <label class="choice">
            <input class="choice__input" type="radio" name="level" value="pro">
            <span class="choice__title">Programuju v práci</span>
            <span class="choice__text">Rád pomůžu týmu jako mentor.</span>
          </label>
        </fieldset>

        <div class="field">
          <label class="field__label" for="note">Co tě zajímá</label>
          <textarea class="field__control" id="note" name="note" rows="3" placeholder="Doprava, odpady, kultura…"></textarea>
        </div>

        <label class="consent">
          <input class="consent__input" type="checkbox" name="consent" required>
          <span>Souhlasím se zpracováním údajů pro účely hackathonu.</span>
        </label>

        <p class="form__summary">Některá pole nejsou vyplněná správně. Oprav je a odešli přihlášku znovu.</p>

        <button class="btn" type="submit">Odeslat přihlášku</button>
      </form>
    </main>
  </body>
</html>
```

### --file-- script.js

```js
const form = document.querySelector('.signup');
let submitted = false;

// 1. pole si pamatuje chybu v třídě svého obalu
function updateField(control) {
  const field = control.closest('.field');
  if (field) field.classList.toggle('is-invalid', !control.validity.valid);
}

// 2. formulář má třídu, dokud po odeslání zbývá nějaká chyba
function updateForm() {
  const hasError = [...form.elements].some((control) => control.willValidate && !control.validity.valid);
  form.classList.toggle('has-errors', submitted && hasError);
}

// 3. prohlížeč při pokusu o odeslání pošle „invalid" každému chybnému poli
form.addEventListener('invalid', (event) => {
  submitted = true;
  updateField(event.target);
  updateForm();
}, true);

// 4. po odeslání se stav přepočítá při každé změně
for (const type of ['input', 'change']) {
  form.addEventListener(type, (event) => {
    if (!submitted) return;
    updateField(event.target);
    updateForm();
  });
}
```

### --file-- styles.css

```css
/* Přihláška na hackathon */

@layer reset, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}

@layer base {
  :root {
    --color-bg: #f4f6fb;
    --color-surface: #ffffff;
    --color-ink: #0f172a;
    --color-muted: #64748b;
    --color-line: #d5dbe6;
    --color-accent: #4f46e5;
    --color-accent-soft: #eef2ff;
    --color-danger: #dc2626;
    --color-danger-soft: #fef2f2;
    --radius: 0.75rem;
    --shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 20px 40px -24px rgb(15 23 42 / 0.35);
  }

  body {
    margin: 0;
    font: 1rem/1.5 system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--color-ink);
    background: var(--color-bg);
  }
}

@layer components {
  .page {
    max-width: 40rem;
    margin-inline: auto;
    padding: 2.5rem 1.25rem 4rem;
  }

  /* ===== Hlavička akce ===== */

  .event {
    margin-bottom: 1.5rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: linear-gradient(135deg, #312e81, #4f46e5 55%, #0ea5e9);
    color: #fff;
  }

  .event__meta {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  .event__title {
    margin: 0.25rem 0 0.5rem;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    line-height: 1.1;
    text-wrap: balance;
  }

  .event__text {
    margin: 0;
    max-width: 34rem;
  }

  /* ===== Formulář ===== */

  .signup {
    display: grid;
    gap: 1.25rem;
    padding: 2rem;
    border-radius: calc(var(--radius) * 1.5);
    background: var(--color-surface);
    box-shadow: var(--shadow);
  }

  .signup__title {
    margin: 0;
    font-size: 1.375rem;
  }

  .field {
    display: grid;
    gap: 0.375rem;
    padding: 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: background-color 0.2s, border-color 0.2s;

    &:focus-within {
      border-color: var(--color-line);
      background: var(--color-accent-soft);
    }

    &.is-invalid {
      border-color: var(--color-danger);
      background: var(--color-danger-soft);
    }
  }

  .field__label {
    font-weight: 600;
  }

  .field__control {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--color-line);
    border-radius: calc(var(--radius) * 0.75);
    background: var(--color-surface);

    .is-invalid & {
      border-color: var(--color-danger);
    }
  }

  .field__hint {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .field__error {
    display: none;
    margin: 0;
    color: var(--color-danger);
    font-size: 0.875rem;
    font-weight: 600;

    .field.is-invalid & {
      display: block;
    }
  }

  .choices {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .choice {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.625rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    &:has(:checked) {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }
  }

  .choice__input {
    grid-row: span 2;
    accent-color: var(--color-accent);
  }

  .choice__title {
    font-weight: 600;
  }

  .choice__text {
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .consent {
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
    font-size: 0.9375rem;
  }

  .consent__input {
    margin-top: 0.25rem;
    accent-color: var(--color-accent);
  }

  .form__summary {
    display: none;
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    background: var(--color-danger-soft);
    color: #991b1b;
    font-weight: 600;

    .signup.has-errors & {
      display: block;
    }
  }

  .btn {
    justify-self: start;
    padding: 0.75rem 1.5rem;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;

    &:hover {
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 3px;
    }

    .signup:has(.consent__input:not(:checked)) & {
      opacity: 0.55;
    }
  }
}
```

# --review--

Testy kontrolují uspořádání stylů a chování formuláře. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každé pravidlo je ve vrstvě, kam logicky patří: reset jen srovnává prohlížeče, `base` drží tokeny a písmo stránky, komponenty vzhled formuláře.
- Selektory komponent mají nejvýš jednu až dvě třídy a nikde nepotřebuješ zesilovat selektor, aby něco vyhrálo.
- Chyba je poznat i bez barvy: zpráva pod polem, silnější rámeček nebo ikona, ne jen červený odstín.
- Obrys fokusu z klávesnice je vidět na polích i na tlačítku.
- Když přepneš náhled na šířku 375, formulář se vejde a nic nepřetéká.

## --extensions--

Rozšíření bez testů: zelené potvrzení u správně vyplněného pole přes `:user-valid`, počítadlo znaků u poznámky, tmavý motiv s vlastními tokeny ve vrstvě `base`, nebo přeměň přihlášku na registraci na akci, která zajímá tebe — závod, turnaj, kurz vaření.
