---
title: "Kontrolní bod: stránka festivalu"
see: css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion, css-animace/workshop-interakce/005, css-flexbox/workshop-navigace/021
timeoutMs: 10000
---

# --description--

Spolek Táborský jazz pořádá v říjnu festival **Jazz na hradbách** a potřebuje jednostránkový web: program, informace o místě a rezervaci vstupenek. Texty dodal pořadatel a jsou hotové v `index.html`, základní vzhled (barvy, písmo, vzhled karet a tlačítek) v `styles.css`. Rozvržení, formulář, motiv a pohyb chybí.

Tohle je kontrolní bod celé části o webu a CSS: žádné tipy, žádný návod. Používej, co umíš z HTML, flexboxu, gridu, pozicování, responzivity, designu i animací. Vzhled (barvy, písmo, rozestupy) smíš měnit, texty a třídy v HTML nech.

## Co chce pořadatel

- Hlavička s logem a navigací je na počítači v jednom řádku, logo vlevo, navigace vpravo. Na telefonu se nic nepřekrývá ani nevyčuhuje z okna.
- Hlavička zůstává při posouvání přilepená nahoře a obsah pod ní projíždí schovaný. Když návštěvník klikne v navigaci na sekci, její nadpis nezajede pod hlavičku.
- Kdo prochází stránku klávesnicí, dostane jako první odkaz „Přeskočit na program". Myší ho nikdo nevidí, s fokusem se ukáže.
- Program je na počítači (1024 px) ve třech sloupcích, na tabletu (768 px) ve dvou a na telefonu (375 px) v jednom. Karty v řádku jsou stejně vysoké a odkaz „Rezervovat místo" je vždycky u dna karty.
- Karta se při najetí myší nebo při fokusu odkazu v ní jemně a plynule zvedne. Kdo má v systému zapnuté omezení pohybu, zvednutí nevidí, ale najetí myší pozná podle jiného vzhledu karty.
- Formulář rezervace doplníš podle tabulky níž. Každé pole má viditelný popisek a prohlížeč neodešle nic, co neprojde kontrolou. Chybu u pole ukáže barvou až ve chvíli, kdy s ním návštěvník pracoval, ne hned po načtení.
- Každý odkaz, tlačítko i pole má s fokusem z klávesnice výrazný obrys.
- Stránka má světlý i tmavý motiv podle nastavení systému a text se dá v obou pohodlně přečíst (kontrast aspoň 4,5 : 1).

## Pole formuláře

| `name` | popisek | druh | pravidla |
|---|---|---|---|
| `name` | Jméno a příjmení | text | povinné |
| `email` | E-mail | e-mailová adresa | povinné |
| `tickets` | Počet vstupenek | číslo | povinné, 1 až 6 |
| `evening` | Večer | výběr: pátek 9. 10., sobota 10. 10., neděle 11. 10. | povinné, uživatel musí vybrat sám |
| `note` | Poznámka | víceřádkový text | nepovinné |

Pole patří do formuláře `.signup__form` před tlačítko „Odeslat rezervaci".

Testy měří v šířkách 1024, 768 a 375 px, stejných jako přepínač nad náhledem. Tmavý motiv a omezený pohyb si testy nasimulují samy; ty si je vyzkoušíš v DevTools v panelu **Rendering** (Emulate CSS media feature).

# --hints--

Na šířce 1024 px je logo u levého okraje hlavičky a navigace u pravého, v jednom řádku a svisle vycentrované proti sobě; odkazy navigace stojí vedle sebe.

```js
const header = document.querySelector('.site-header');
const style = getComputedStyle(header);
const box = header.getBoundingClientRect();
const contentLeft = box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
const contentRight = box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
// Střed samotného textu, ne krabičky (roztažená krabička má střed jinde než text).
const textMiddle = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return r.top + r.height / 2;
};
const logo = header.querySelector('.logo');
const links = [...header.querySelectorAll('.site-nav a')];
assert.ok(Math.abs(logo.getBoundingClientRect().left - contentLeft) <= 2, `Logo začíná na ${Math.round(logo.getBoundingClientRect().left)} px, obsah hlavičky na ${Math.round(contentLeft)} px`);
assert.ok(Math.abs(links.at(-1).getBoundingClientRect().right - contentRight) <= 2, `Poslední odkaz navigace končí na ${Math.round(links.at(-1).getBoundingClientRect().right)} px, obsah hlavičky na ${Math.round(contentRight)} px`);
for (const link of links) {
  assert.ok(Math.abs(textMiddle(link) - textMiddle(logo)) <= 2, `Text odkazu „${link.textContent}" má střed na ${textMiddle(link).toFixed(1)} px, logo na ${textMiddle(logo).toFixed(1)} px — mají být v jednom řádku a vycentrované`);
}
for (let i = 1; i < links.length; i++) {
  assert.ok(links[i].getBoundingClientRect().left > links[i - 1].getBoundingClientRect().right, `Odkaz „${links[i].textContent}" má stát vpravo vedle předchozího`);
}
```

Na šířce 375 px je celé logo i každý odkaz navigace vidět uvnitř okna a stránka nejde posouvat do strany.

```js
await helpers.resize(375);
const root = document.documentElement;
for (const el of document.querySelectorAll('.site-header .logo, .site-nav a')) {
  const box = el.getBoundingClientRect();
  assert.ok(box.left >= -1 && box.right <= root.clientWidth + 1, `Při šířce 375 px sahá „${el.textContent.trim()}" od ${Math.round(box.left)} do ${Math.round(box.right)} px, okno má ${root.clientWidth} px`);
}
assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce 375 px je obsah široký ${root.scrollWidth} px, okno ${root.clientWidth} px — stránka jde posouvat do strany`);
```

Hlavička zůstává při posouvání přilepená u horního okraje okna, má neprůhledné pozadí a obsah, který pod ní projíždí, nepřekryje. Na začátku stránky nezakrývá úvod.

```js
// Barva jako [r, g, b, a] přes plátno, aby šlo porovnat i oklch() a light-dark().
const rgba = (color) => {
  const context = document.createElement('canvas').getContext('2d');
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};
const header = document.querySelector('.site-header');
window.scrollTo({ top: 0, behavior: 'instant' });
await helpers.wait(50);
const title = document.querySelector('.hero__title').getBoundingClientRect();
assert.ok(title.top >= header.getBoundingClientRect().bottom - 1, 'Na začátku stránky zakrývá hlavička nadpis úvodu');
const list = document.querySelector('.program__list');
const height = header.getBoundingClientRect().height;
window.scrollTo({ top: list.getBoundingClientRect().top + window.scrollY - height / 2, behavior: 'instant' });
await helpers.wait(50);
const box = header.getBoundingClientRect();
assert.ok(Math.abs(box.top) <= 1, `Po posunutí na program je horní hrana hlavičky na ${Math.round(box.top)} px — má zůstat přilepená nahoře (0 px)`);
assert.ok(rgba(getComputedStyle(header).backgroundColor)[3] >= 0.8, 'Hlavička má průhledné pozadí — obsah by přes ni prosvítal');
const card = document.querySelector('.event').getBoundingClientRect();
const hit = document.elementFromPoint(card.left + card.width / 2, box.bottom - 4);
assert.ok(hit && header.contains(hit), 'Karta programu, která projíždí pod hlavičkou, je vykreslená nad ní — hlavička má ležet nad obsahem');
```

Když uživatel skočí odkazem na sekci Program nebo Místo, nadpis sekce se ukáže celý pod přilepenou hlavičkou, ne pod ní schovaný.

```js
const header = document.querySelector('.site-header');
for (const id of ['program', 'misto']) {
  const section = document.getElementById(id);
  section.scrollIntoView({ behavior: 'instant' });
  await helpers.wait(50);
  const heading = section.querySelector('h2').getBoundingClientRect();
  const bottom = header.getBoundingClientRect().bottom;
  assert.ok(heading.top >= bottom - 1, `Po skoku na #${id} začíná nadpis na ${Math.round(heading.top)} px, ale hlavička končí na ${Math.round(bottom)} px`);
}
```

Odkaz „Přeskočit na program" není vidět, dokud nemá fokus. S fokusem z klávesnice je vidět celý uvnitř okna.

```js
const skip = document.querySelector('.skip-link');
const isVisible = (el) => {
  const box = el.getBoundingClientRect();
  return box.width > 1 && box.height > 1 && box.top >= 0 && box.left >= 0 && box.right <= innerWidth && box.bottom <= innerHeight && Number(getComputedStyle(el).opacity) > 0.9;
};
window.scrollTo({ top: 0, behavior: 'instant' });
await helpers.wait(50);
assert.ok(!isVisible(skip), 'Odkaz „Přeskočit na program" je vidět i bez fokusu');
skip.focus();
await helpers.wait(600);
assert.ok(isVisible(skip), 'S fokusem má být odkaz „Přeskočit na program" vidět celý uvnitř okna');
```

Na šířce 1024 px je program ve třech stejně širokých sloupcích přes celou šířku seznamu, s mezerou aspoň 16 px.

```js
const list = document.querySelector('.program__list').getBoundingClientRect();
const cards = [...document.querySelectorAll('.event')].map((card) => card.getBoundingClientRect());
const firstRow = cards.filter((card) => Math.abs(card.top - cards[0].top) <= 2);
assert.equal(firstRow.length, 3, `V prvním řádku programu je ${firstRow.length} karet (počet), čekám 3`);
for (const card of firstRow) {
  assert.ok(Math.abs(card.width - firstRow[0].width) <= 2, `Šířky karet v řádku jsou ${firstRow.map((c) => Math.round(c.width)).join(', ')} px — mají být stejné`);
}
for (let i = 1; i < firstRow.length; i++) {
  const space = firstRow[i].left - firstRow[i - 1].right;
  assert.ok(space >= 15.5, `Mezera mezi ${i}. a ${i + 1}. kartou je ${Math.round(space)} px, čekám aspoň 16 px`);
}
assert.ok(Math.abs(firstRow[0].left - list.left) <= 2 && Math.abs(firstRow.at(-1).right - list.right) <= 2, `Karty zabírají ${Math.round(firstRow[0].left)}–${Math.round(firstRow.at(-1).right)} px, seznam ${Math.round(list.left)}–${Math.round(list.right)} px`);
```

Na šířce 768 px je program ve dvou stejně širokých sloupcích přes celou šířku seznamu.

```js
await helpers.resize(768);
const list = document.querySelector('.program__list').getBoundingClientRect();
const cards = [...document.querySelectorAll('.event')].map((card) => card.getBoundingClientRect());
const firstRow = cards.filter((card) => Math.abs(card.top - cards[0].top) <= 2);
assert.equal(firstRow.length, 2, `Při šířce 768 px je v prvním řádku programu ${firstRow.length} karet (počet), čekám 2`);
assert.ok(Math.abs(firstRow[0].width - firstRow[1].width) <= 2, `Při šířce 768 px jsou karty široké ${firstRow.map((c) => Math.round(c.width)).join(' a ')} px — mají být stejně`);
assert.ok(Math.abs(firstRow[0].left - list.left) <= 2 && Math.abs(firstRow[1].right - list.right) <= 2, `Při šířce 768 px zabírají karty ${Math.round(firstRow[0].left)}–${Math.round(firstRow[1].right)} px, seznam ${Math.round(list.left)}–${Math.round(list.right)} px`);
```

Na šířce 375 px jsou karty programu pod sebou, každá přes celou šířku seznamu, a stránka nejde posouvat do strany.

```js
await helpers.resize(375);
const list = document.querySelector('.program__list').getBoundingClientRect();
const cards = [...document.querySelectorAll('.event')].map((card) => card.getBoundingClientRect());
cards.forEach((card, i) => {
  assert.ok(Math.abs(card.width - list.width) <= 2, `Při šířce 375 px je ${i + 1}. karta široká ${Math.round(card.width)} px, seznam ${Math.round(list.width)} px`);
  if (i > 0) assert.ok(card.top >= cards[i - 1].bottom, `Při šířce 375 px má být ${i + 1}. karta pod předchozí`);
});
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce 375 px je obsah široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
```

Karty v jednom řádku programu jsou stejně vysoké a odkaz „Rezervovat místo" leží u spodního okraje karty, i když má karta kratší text.

```js
const cards = [...document.querySelectorAll('.event')];
const boxes = cards.map((card) => card.getBoundingClientRect());
const firstRow = cards.filter((card, i) => Math.abs(boxes[i].top - boxes[0].top) <= 2);
assert.ok(firstRow.length > 1, 'V prvním řádku programu má být víc karet vedle sebe');
const heights = firstRow.map((card) => card.getBoundingClientRect().height);
assert.ok(heights.every((h) => Math.abs(h - heights[0]) <= 1), `Výšky karet v řádku jsou ${heights.map(Math.round).join(', ')} px — mají být stejné`);
cards.forEach((card, i) => {
  const style = getComputedStyle(card);
  const contentBottom = card.getBoundingClientRect().bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
  const link = card.querySelector('.event__link').getBoundingClientRect();
  assert.ok(Math.abs(link.bottom - contentBottom) <= 1, `Odkaz ${i + 1}. karty končí na ${Math.round(link.bottom)} px, obsah karty až na ${Math.round(contentBottom)} px — má ležet u dna`);
});
```

Formulář má pole `name`, `email`, `tickets`, `evening` a `note` a každé má viditelný popisek propojený s polem.

```js
const form = document.querySelector('.signup__form');
for (const name of ['name', 'email', 'tickets', 'evening', 'note']) {
  const field = form.elements.namedItem(name);
  assert.ok(field, `Ve formuláři chybí pole s name="${name}"`);
  const labels = [...(field.labels ?? [])];
  assert.ok(labels.length > 0, `Pole name="${name}" nemá propojený popisek <label>`);
  const label = labels[0];
  const box = label.getBoundingClientRect();
  assert.ok(label.textContent.trim().length > 0 && box.width > 1 && box.height > 1, `Popisek pole name="${name}" má být vidět a mít text`);
}
assert.equal(form.elements.namedItem('evening').tagName, 'SELECT', 'Pole evening má být výběr ze seznamu (<select>)');
assert.equal(form.elements.namedItem('note').tagName, 'TEXTAREA', 'Pole note má být víceřádkové (<textarea>)');
```

Prohlížeč pustí dál jen správně vyplněný formulář: jméno, e-mail ve správném tvaru, 1 až 6 vstupenek a vybraný večer jsou povinné, poznámka ne.

```js
const form = document.querySelector('.signup__form');
const field = (name) => form.elements.namedItem(name);
const evening = field('evening');
assert.ok(evening && [...evening.options].some((option) => option.value === ''), 'Výběr večera má mít úvodní volbu s prázdnou hodnotou, aby večer musel uživatel vybrat sám');
const chosen = [...evening.options].find((option) => option.value !== '')?.value;
const good = { name: 'Jana Nováková', email: 'jana@example.cz', tickets: '2', evening: chosen, note: '' };
const fill = (values) => {
  for (const [name, value] of Object.entries(values)) field(name).value = value;
};
fill(good);
assert.ok(form.checkValidity(), 'Formulář s údaji Jana Nováková, jana@example.cz, 2 vstupenky, vybraný večer a prázdná poznámka má být platný');
const bad = [
  [{ name: '' }, 'prázdné jméno'],
  [{ email: 'jana.example.cz' }, 'e-mail jana.example.cz bez zavináče'],
  [{ email: '' }, 'prázdný e-mail'],
  [{ tickets: '0' }, '0 vstupenek'],
  [{ tickets: '7' }, '7 vstupenek'],
  [{ tickets: '' }, 'nevyplněný počet vstupenek'],
  [{ evening: '' }, 'nevybraný večer'],
];
for (const [change, label] of bad) {
  fill({ ...good, ...change });
  assert.equal(form.checkValidity(), false, `Formulář s chybou „${label}" nemá být platný`);
}
```

Pole vyplněné špatně vypadá jinak (barva rámečku, stín nebo pozadí) než správně vyplněné, ale až poté, co s ním uživatel pracoval: prázdné povinné pole po načtení stránky vypadá stejně jako správně vyplněné.

```js
const form = document.querySelector('.signup__form');
const look = (el) => {
  const s = getComputedStyle(el);
  return [s.borderTopColor, s.borderTopWidth, s.boxShadow, s.backgroundColor, s.outlineStyle, s.outlineColor].join(' | ');
};
const nameField = form.elements.namedItem('name');
const emailField = form.elements.namedItem('email');
emailField.value = 'jana@example.cz';
assert.equal(look(nameField), look(emailField), 'Prázdné povinné jméno vypadá po načtení jinak než správně vyplněný e-mail — chyba se nemá ukázat dřív, než uživatel s polem pracuje');
// Test nasimuluje „uživatel pole vyplnil a opustil": :user-invalid převede na třídu a dá ji chybnému poli.
for (const sheet of document.styleSheets) {
  const visit = (rules) => {
    for (const rule of rules) {
      if (typeof rule.selectorText === 'string' && rule.selectorText.includes(':user-invalid')) {
        rule.selectorText = rule.selectorText.replaceAll(':user-invalid', '.akademie-user-invalid');
      }
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  visit(sheet.cssRules);
}
nameField.value = 'Jana Nováková';
emailField.value = 'jana.example.cz';
emailField.classList.add('akademie-user-invalid');
assert.notEqual(look(emailField), look(nameField), 'Chybně vyplněný e-mail (jana.example.cz) vypadá po práci s polem stejně jako správně vyplněné jméno');
```

Odkaz v navigaci, tlačítko formuláře i pole formuláře mají s fokusem z klávesnice výrazný obrys (aspoň 2 px) nebo prstenec stínu.

```js
const targets = [
  document.querySelector('.site-nav a'),
  document.querySelector('.signup__form [type="submit"]'),
  document.querySelector('.signup__form').elements.namedItem('email'),
];
for (const el of targets) {
  assert.ok(el, 'Chybí prvek pro kontrolu fokusu (odkaz v navigaci, tlačítko typu submit nebo pole email)');
  const shadowBefore = getComputedStyle(el).boxShadow;
  el.focus({ preventScroll: true });
  await helpers.wait(300);
  const style = getComputedStyle(el);
  const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
  const ring = style.boxShadow !== 'none' && style.boxShadow !== shadowBefore;
  assert.ok(outline || ring, `<${el.tagName.toLowerCase()}> má s fokusem obrys ${style.outlineStyle} ${style.outlineWidth} a stín ${style.boxShadow} — čekám obrys aspoň 2 px nebo stín navíc`);
  el.blur();
}
```

Stránka má světlý i tmavý motiv podle nastavení systému: v tmavém je pozadí tmavé a text světlý, ve světlém naopak. V obou motivech má text stránky i text karty programu kontrast aspoň 4,5 : 1.

```js
const rgba = (color) => {
  const context = document.createElement('canvas').getContext('2d');
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};
const luminance = ([r, g, b]) => {
  const channel = (v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
const backgroundOf = (el) => {
  for (let node = el; node; node = node.parentElement) {
    const color = rgba(getComputedStyle(node).backgroundColor);
    if (color[3] > 0.95) return color;
  }
  const probe = document.createElement('div');
  probe.style.background = 'Canvas';
  document.body.append(probe);
  const color = rgba(getComputedStyle(probe).backgroundColor);
  probe.remove();
  return color;
};
// Test nasimuluje motiv systému: přepíše media dotazy prefers-color-scheme a vynutí color-scheme pro light-dark().
const rules = [];
const collect = (list) => {
  for (const rule of list) {
    if (rule.media && /prefers-color-scheme/.test(rule.media.mediaText)) rules.push([rule, rule.media.mediaText]);
    if (rule.cssRules) collect(rule.cssRules);
  }
};
for (const sheet of document.styleSheets) collect(sheet.cssRules);
const emulate = (scheme) => {
  const other = scheme === 'dark' ? 'light' : 'dark';
  for (const [rule, text] of rules) {
    rule.media.mediaText = text
      .replace(new RegExp(`\\(\\s*prefers-color-scheme\\s*:\\s*${scheme}\\s*\\)`, 'g'), '(min-width: 0px)')
      .replace(new RegExp(`\\(\\s*prefers-color-scheme\\s*:\\s*${other}\\s*\\)`, 'g'), '(max-width: 0px)');
  }
  const root = document.documentElement;
  root.style.colorScheme = '';
  if (getComputedStyle(root).colorScheme.includes(scheme)) root.style.colorScheme = scheme;
};
for (const scheme of ['light', 'dark']) {
  emulate(scheme);
  const name = scheme === 'dark' ? 'tmavém' : 'světlém';
  const page = backgroundOf(document.body);
  const text = rgba(getComputedStyle(document.body).color);
  if (scheme === 'dark') assert.ok(luminance(page) < luminance(text) && luminance(page) < 0.2, `V tmavém motivu má stránka tmavé pozadí a světlý text (pozadí ${getComputedStyle(document.body).backgroundColor}, text ${getComputedStyle(document.body).color})`);
  else assert.ok(luminance(page) > luminance(text) && luminance(page) > 0.5, `Ve světlém motivu má stránka světlé pozadí a tmavý text (pozadí ${getComputedStyle(document.body).backgroundColor}, text ${getComputedStyle(document.body).color})`);
  assert.ok(contrast(page, text) >= 4.5, `V ${name} motivu má text stránky kontrast ${contrast(page, text).toFixed(2)} : 1, čekám aspoň 4,5 : 1`);
  const cardText = document.querySelector('.event__text');
  const ratio = contrast(backgroundOf(cardText), rgba(getComputedStyle(cardText).color));
  assert.ok(ratio >= 4.5, `V ${name} motivu má popis karty programu (.event__text) kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4,5 : 1`);
}
```

Karta programu se při najetí myší i při fokusu odkazu v ní plynule zvedne o 2–12 px a karty ani sekce kolem se nepohnou.

```js
// Test nasimuluje, že uživatel nemá omezený pohyb, a najetí myší (:hover převede na třídu).
const visit = (list, fn) => {
  for (const rule of list) {
    fn(rule);
    if (rule.cssRules) visit(rule.cssRules, fn);
  }
};
for (const sheet of document.styleSheets) {
  visit(sheet.cssRules, (rule) => {
    if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
      rule.media.mediaText = rule.media.mediaText.replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(max-width: 0px)').replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(min-width: 0px)');
    }
    if (typeof rule.selectorText === 'string' && rule.selectorText.includes(':hover')) rule.selectorText = rule.selectorText.replaceAll(':hover', '.akademie-hover');
  });
}
const [card, neighbour] = document.querySelectorAll('.event');
const venue = document.querySelector('.venue');
const measure = () => ({ card: card.getBoundingClientRect().top, height: card.getBoundingClientRect().height, neighbour: neighbour.getBoundingClientRect().top, venue: venue.getBoundingClientRect().top });
const before = measure();
for (let node = card; node; node = node.parentElement) node.classList.add('akademie-hover');
getComputedStyle(card).translate;
assert.ok(card.getAnimations().length > 0, 'Po najetí myší nemá na kartě běžet žádný přechod — zvednutí má být plynulé');
await helpers.wait(800);
const hovered = measure();
const lift = before.card - hovered.card;
assert.ok(lift >= 2 && lift <= 12, `Při najetí myší se karta zvedla o ${lift.toFixed(1)} px, čekám 2–12 px`);
assert.ok(Math.abs(hovered.neighbour - before.neighbour) <= 0.5 && Math.abs(hovered.venue - before.venue) <= 0.5, 'Při zvednutí karty se pohnula sousední karta nebo sekce pod programem — zvednutí nemá měnit rozvržení');
assert.ok(Math.abs(hovered.height - before.height) <= 0.5, `Karta měla ${Math.round(before.height)} px na výšku a při zvednutí ${Math.round(hovered.height)} px — má se jen posunout, ne natáhnout`);
for (let node = card; node; node = node.parentElement) node.classList.remove('akademie-hover');
await helpers.wait(800);
card.querySelector('.event__link').focus({ preventScroll: true });
await helpers.wait(800);
const focusLift = before.card - card.getBoundingClientRect().top;
assert.ok(focusLift >= 2 && focusLift <= 12, `Když má fokus odkaz v kartě, zvedla se karta o ${focusLift.toFixed(1)} px, čekám 2–12 px`);
```

Uživatel se zapnutým omezením pohybu vidí kartu při najetí i fokusu na místě, bez zvednutí, ale najetí myší pořád pozná: karta při něm jinak vypadá (rámeček, stín nebo pozadí).

```js
// Test nasimuluje zapnuté omezení pohybu a najetí myší.
const visit = (list, fn) => {
  for (const rule of list) {
    fn(rule);
    if (rule.cssRules) visit(rule.cssRules, fn);
  }
};
for (const sheet of document.styleSheets) {
  visit(sheet.cssRules, (rule) => {
    if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
      rule.media.mediaText = rule.media.mediaText.replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(min-width: 0px)').replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(max-width: 0px)');
    }
    if (typeof rule.selectorText === 'string' && rule.selectorText.includes(':hover')) rule.selectorText = rule.selectorText.replaceAll(':hover', '.akademie-hover');
  });
}
const card = document.querySelector('.event');
const look = () => {
  const s = getComputedStyle(card);
  return [s.borderTopColor, s.boxShadow, s.backgroundColor, s.outlineStyle, s.outlineColor].join(' | ');
};
const before = card.getBoundingClientRect().top;
const lookBefore = look();
for (let node = card; node; node = node.parentElement) node.classList.add('akademie-hover');
await helpers.wait(800);
assert.ok(Math.abs(card.getBoundingClientRect().top - before) <= 0.5, `Při omezeném pohybu se karta při najetí posunula o ${(before - card.getBoundingClientRect().top).toFixed(1)} px`);
assert.notEqual(look(), lookBefore, 'Při omezeném pohybu vypadá karta při najetí myší úplně stejně — zpětná vazba bez pohybu má zůstat');
for (let node = card; node; node = node.parentElement) node.classList.remove('akademie-hover');
card.querySelector('.event__link').focus({ preventScroll: true });
await helpers.wait(800);
assert.ok(Math.abs(card.getBoundingClientRect().top - before) <= 0.5, `Při omezeném pohybu se karta při fokusu posunula o ${(before - card.getBoundingClientRect().top).toFixed(1)} px`);
```

# --approaches--

## --approach-- Grid s automatickým počtem sloupců a tmavý motiv v media dotazu

Program nemá žádný media dotaz: `repeat(auto-fill, minmax(min(17rem, 100%), 1fr))` vloží tolik sloupců, kolik se jich vejde, a `min()` zabrání přetečení na úzkém telefonu. Tmavý motiv přepisuje tokeny v `@media (prefers-color-scheme: dark)`, sekce drží odstup od hlavičky přes `scroll-margin-top` a pohyb je jen uvnitř `@media (prefers-reduced-motion: no-preference)`, takže kdo pohyb omezil, ho vůbec nedostane. Hodí se, když chceš mít všechno k motivu na jednom místě a karty mají růst podle místa, ne podle bodu zlomu.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Jazz na hradbách 2026 — Tábor</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#program">Přeskočit na program</a>

    <header class="site-header">
      <a class="logo" href="#">Jazz na hradbách</a>
      <nav class="site-nav" aria-label="Hlavní navigace">
        <ul class="site-nav__list">
          <li><a href="#program">Program</a></li>
          <li><a href="#misto">Místo</a></li>
          <li><a href="#prihlaska">Vstupenky</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <p class="hero__date">9.–11. října 2026 · Tábor, bastion Na Hradbách</p>
        <h1 class="hero__title" id="hero-title">Jazz na hradbách</h1>
        <p class="hero__lead">Tři podzimní večery pod širým nebem i v gotickém sklepě. Šest kapel, jam session do půlnoci a svařák z táborské vinotéky.</p>
        <a class="button" href="#prihlaska">Chci vstupenky</a>
      </section>

      <section class="program" id="program" aria-labelledby="program-title">
        <h2 class="section-title" id="program-title">Program</h2>
        <ul class="program__list">
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T19:00">Pátek 9. 10. · 19:00</time></p>
            <h3 class="event__title">Kvartet Lužnice</h3>
            <p class="event__text">Standardy z padesátých let v úpravách pro vibrafon a kontrabas.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T21:30">Pátek 9. 10. · 21:30</time></p>
            <h3 class="event__title">Hana Vrbová &amp; Brass Quintet</h3>
            <p class="event__text">Zpěvačka z Českých Budějovic přiváží nové album plné dechů, swingu a českých textů, které poprvé zazní naživo.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T18:00">Sobota 10. 10. · 18:00</time></p>
            <h3 class="event__title">Big band ZUŠ Tábor</h3>
            <p class="event__text">Dvacet mladých muzikantů a Ellington.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T20:30">Sobota 10. 10. · 20:30</time></p>
            <h3 class="event__title">Ondřej Kalous Trio</h3>
            <p class="event__text">Klavírní trio na pomezí jazzu a klasiky, které loni vyhrálo cenu Anděl za jazz.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T16:00">Neděle 11. 10. · 16:00</time></p>
            <h3 class="event__title">Jazz pro děti</h3>
            <p class="event__text">Hodinový koncert s pohádkou o saxofonu, který se bál tmy. Vstup pro děti do 12 let zdarma.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T20:00">Neděle 11. 10. · 20:00</time></p>
            <h3 class="event__title">Závěrečná jam session</h3>
            <p class="event__text">Otevřené pódium pro všechny, kdo přinesou nástroj.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
        </ul>
      </section>

      <section class="venue" id="misto" aria-labelledby="venue-title">
        <h2 class="section-title" id="venue-title">Místo</h2>
        <p>Bastion Na Hradbách najdeš pět minut pěšky od Žižkova náměstí. Hlavní scéna a nádvoří jsou pod širým nebem, při dešti se program přesune do gotického sklepa pod bastionem.</p>
        <p>Z vlakového nádraží Tábor jezdí autobus č. 11 až na zastávku Náměstí, parkovat můžeš na parkovišti Holečkova. Areál je bezbariérový kromě gotického sklepa.</p>
      </section>

      <section class="signup" id="prihlaska" aria-labelledby="signup-title">
        <h2 class="section-title" id="signup-title">Vstupenky</h2>
        <p class="signup__intro">Vstupenku na jeden večer rezervujeme do 48 hodin. Zaplatíš ji na místě, 390 Kč, děti do 12 let zdarma.</p>
        <form class="signup__form" action="#" method="post">
          <div class="field">
            <label for="signup-name">Jméno a příjmení</label>
            <input id="signup-name" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="signup-email">E-mail</label>
            <input id="signup-email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="signup__row">
            <div class="field">
              <label for="signup-tickets">Počet vstupenek</label>
              <input id="signup-tickets" name="tickets" type="number" min="1" max="6" value="1" required>
            </div>
            <div class="field">
              <label for="signup-evening">Večer</label>
              <select id="signup-evening" name="evening" required>
                <option value="">Vyber večer</option>
                <option value="patek">Pátek 9. 10.</option>
                <option value="sobota">Sobota 10. 10.</option>
                <option value="nedele">Neděle 11. 10.</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="signup-note">Poznámka <span class="field__optional">(nepovinné)</span></label>
            <textarea id="signup-note" name="note" rows="3" maxlength="300"></textarea>
          </div>

          <button class="button" type="submit">Odeslat rezervaci</button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <p>Jazz na hradbách · Spolek Táborský jazz · <a href="mailto:info@jazznahradbach.cz">info@jazznahradbach.cz</a></p>
    </footer>
  </body>
</html>
```

### --file-- styles.css

```css
/* ===== Tokeny (světlý motiv) ===== */

:root {
  --color-bg: oklch(97% 0.012 80);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(23% 0.035 265);
  --color-muted: oklch(45% 0.03 265);
  --color-line: oklch(88% 0.015 80);
  --color-accent: oklch(52% 0.14 45);
  --color-accent-contrast: oklch(100% 0 0);
  --color-hero-from: oklch(30% 0.07 265);
  --color-hero-to: oklch(45% 0.12 30);
  --radius: 1rem;
  --space-s: 0.75rem;
  --space-m: 1.5rem;
  --space-l: 3rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.55;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: var(--color-accent);
}

/* ===== Odkaz na přeskočení ===== */

.skip-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--color-text);
  color: var(--color-bg);
  font-weight: 650;
}

/* ===== Hlavička ===== */

.site-header {
  padding: 1rem var(--space-m);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-bg);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.site-nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-nav a {
  color: var(--color-text);
  font-weight: 550;
  text-decoration: none;
}

.site-nav a:hover {
  color: var(--color-accent);
}

/* ===== Tlačítko ===== */

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* ===== Úvod ===== */

.hero {
  padding: 5rem max(var(--space-m), (100% - 68rem) / 2 + var(--space-m)) 4rem;
  background:
    radial-gradient(circle at 88% 18%, oklch(86% 0.12 75 / 0.5), transparent 55%),
    linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to));
  color: oklch(98% 0.01 80);
}

.hero__date {
  margin: 0 0 var(--space-s);
  font-size: 0.9375rem;
  font-weight: 650;
  letter-spacing: 0.04em;
}

.hero__title {
  margin: 0;
  font-size: clamp(2.75rem, 8vw, 5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.hero__lead {
  max-width: 36rem;
  margin: var(--space-m) 0 2rem;
  font-size: 1.1875rem;
}

.hero .button {
  background: oklch(85% 0.14 80);
  color: var(--color-text);
}

/* ===== Sekce ===== */

.program,
.venue,
.signup {
  max-width: 68rem;
  margin-inline: auto;
  padding: 2.5rem var(--space-m);
}

.section-title {
  margin: 0 0 var(--space-m);
  font-size: 2rem;
  letter-spacing: -0.02em;
}

/* ===== Program ===== */

.program__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.event {
  padding: var(--space-m);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.event__time {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

.event__title {
  margin: 0.25rem 0 0.5rem;
  font-size: 1.3125rem;
  line-height: 1.25;
}

.event__text {
  margin: 0 0 var(--space-s);
  color: var(--color-muted);
}

.event__stage {
  margin: 0 0 var(--space-m);
  font-size: 0.875rem;
  font-weight: 650;
}

.event__link {
  font-weight: 700;
}

/* ===== Místo ===== */

.venue p {
  max-width: 40rem;
}

/* ===== Formulář ===== */

.signup__intro {
  max-width: 40rem;
  margin: 0 0 var(--space-m);
  color: var(--color-muted);
}

.signup__form {
  max-width: 32rem;
}

label {
  font-weight: 650;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-line);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}

/* ===== Patička ===== */

.site-footer {
  padding: 2rem var(--space-m) 3rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  text-align: center;
}

/* ===== Tvoje styly ===== */

/* Tmavý motiv přes media dotaz: jen přepsané tokeny. */
:root {
  color-scheme: light;
  --color-danger: oklch(50% 0.19 25);
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --color-bg: oklch(17% 0.02 265);
    --color-surface: oklch(23% 0.03 265);
    --color-text: oklch(95% 0.01 80);
    --color-muted: oklch(80% 0.02 265);
    --color-line: oklch(36% 0.03 265);
    --color-accent: oklch(80% 0.12 70);
    --color-accent-contrast: oklch(18% 0.02 265);
    --color-danger: oklch(75% 0.15 25);
  }
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Odkaz na přeskočení: schovaný přes clip-path, s fokusem vlevo nahoře. */
.skip-link {
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
}

.skip-link:not(:focus) {
  clip-path: inset(50%);
  width: 1px;
  height: 1px;
  overflow: hidden;
  white-space: nowrap;
  padding: 0;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
}

.site-nav {
  margin-inline-start: auto;
}

.site-nav__list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Sekce si samy drží odstup od hlavičky. */
section[id] {
  scroll-margin-top: 4.5rem;
}

/* Program bez media dotazů: tolik sloupců po aspoň 17rem, kolik se vejde. */
.program__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr));
  gap: var(--space-m);
}

.event {
  display: grid;
  grid-template-rows: auto auto 1fr auto auto;
  border-width: 2px;
}

.event__text {
  align-self: start;
}

.event__link {
  justify-self: start;
}

.event:is(:hover, :focus-within) {
  background: color-mix(in oklch, var(--color-surface), var(--color-accent) 8%);
}

@media (prefers-reduced-motion: no-preference) {
  .event {
    transition: translate 200ms ease-out;
  }

  .event:is(:hover, :focus-within) {
    translate: 0 -4px;
  }
}

.signup__form,
.field {
  display: flex;
  flex-direction: column;
}

.signup__form {
  gap: 1rem;
}

.signup__row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.signup__row .field {
  flex: 1 1 10rem;
}

.field {
  gap: 0.25rem;
}

input:user-invalid,
select:user-invalid,
textarea:user-invalid {
  border-color: var(--color-danger);
  background: color-mix(in oklch, var(--color-surface), var(--color-danger) 10%);
}

.signup__form .button {
  align-self: flex-start;
}
```

## --approach-- Program ve flexboxu

Karty startují na `17rem`, rostou do volného místa a zalomí se. Protože je karet šest, vyjdou řádky přesně po třech a po dvou a všechny karty jsou stejně široké. Kdyby jich bylo sedm, poslední by se roztáhla přes celý řádek — proto je pro mřížku karet přirozenější grid. Zbytek je stejný jako v řešení: `light-dark()` a `scroll-padding-top` na `html`.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Jazz na hradbách 2026 — Tábor</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#program">Přeskočit na program</a>

    <header class="site-header">
      <a class="logo" href="#">Jazz na hradbách</a>
      <nav class="site-nav" aria-label="Hlavní navigace">
        <ul class="site-nav__list">
          <li><a href="#program">Program</a></li>
          <li><a href="#misto">Místo</a></li>
          <li><a href="#prihlaska">Vstupenky</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <p class="hero__date">9.–11. října 2026 · Tábor, bastion Na Hradbách</p>
        <h1 class="hero__title" id="hero-title">Jazz na hradbách</h1>
        <p class="hero__lead">Tři podzimní večery pod širým nebem i v gotickém sklepě. Šest kapel, jam session do půlnoci a svařák z táborské vinotéky.</p>
        <a class="button" href="#prihlaska">Chci vstupenky</a>
      </section>

      <section class="program" id="program" aria-labelledby="program-title">
        <h2 class="section-title" id="program-title">Program</h2>
        <ul class="program__list">
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T19:00">Pátek 9. 10. · 19:00</time></p>
            <h3 class="event__title">Kvartet Lužnice</h3>
            <p class="event__text">Standardy z padesátých let v úpravách pro vibrafon a kontrabas.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T21:30">Pátek 9. 10. · 21:30</time></p>
            <h3 class="event__title">Hana Vrbová &amp; Brass Quintet</h3>
            <p class="event__text">Zpěvačka z Českých Budějovic přiváží nové album plné dechů, swingu a českých textů, které poprvé zazní naživo.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T18:00">Sobota 10. 10. · 18:00</time></p>
            <h3 class="event__title">Big band ZUŠ Tábor</h3>
            <p class="event__text">Dvacet mladých muzikantů a Ellington.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T20:30">Sobota 10. 10. · 20:30</time></p>
            <h3 class="event__title">Ondřej Kalous Trio</h3>
            <p class="event__text">Klavírní trio na pomezí jazzu a klasiky, které loni vyhrálo cenu Anděl za jazz.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T16:00">Neděle 11. 10. · 16:00</time></p>
            <h3 class="event__title">Jazz pro děti</h3>
            <p class="event__text">Hodinový koncert s pohádkou o saxofonu, který se bál tmy. Vstup pro děti do 12 let zdarma.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T20:00">Neděle 11. 10. · 20:00</time></p>
            <h3 class="event__title">Závěrečná jam session</h3>
            <p class="event__text">Otevřené pódium pro všechny, kdo přinesou nástroj.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
        </ul>
      </section>

      <section class="venue" id="misto" aria-labelledby="venue-title">
        <h2 class="section-title" id="venue-title">Místo</h2>
        <p>Bastion Na Hradbách najdeš pět minut pěšky od Žižkova náměstí. Hlavní scéna a nádvoří jsou pod širým nebem, při dešti se program přesune do gotického sklepa pod bastionem.</p>
        <p>Z vlakového nádraží Tábor jezdí autobus č. 11 až na zastávku Náměstí, parkovat můžeš na parkovišti Holečkova. Areál je bezbariérový kromě gotického sklepa.</p>
      </section>

      <section class="signup" id="prihlaska" aria-labelledby="signup-title">
        <h2 class="section-title" id="signup-title">Vstupenky</h2>
        <p class="signup__intro">Vstupenku na jeden večer rezervujeme do 48 hodin. Zaplatíš ji na místě, 390 Kč, děti do 12 let zdarma.</p>
        <form class="signup__form" action="#" method="post">
          <div class="field">
            <label for="signup-name">Jméno a příjmení</label>
            <input id="signup-name" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="signup-email">E-mail</label>
            <input id="signup-email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="signup__row">
            <div class="field">
              <label for="signup-tickets">Počet vstupenek</label>
              <input id="signup-tickets" name="tickets" type="number" min="1" max="6" value="1" required>
            </div>
            <div class="field">
              <label for="signup-evening">Večer</label>
              <select id="signup-evening" name="evening" required>
                <option value="">Vyber večer</option>
                <option value="patek">Pátek 9. 10.</option>
                <option value="sobota">Sobota 10. 10.</option>
                <option value="nedele">Neděle 11. 10.</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="signup-note">Poznámka <span class="field__optional">(nepovinné)</span></label>
            <textarea id="signup-note" name="note" rows="3" maxlength="300"></textarea>
          </div>

          <button class="button" type="submit">Odeslat rezervaci</button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <p>Jazz na hradbách · Spolek Táborský jazz · <a href="mailto:info@jazznahradbach.cz">info@jazznahradbach.cz</a></p>
    </footer>
  </body>
</html>
```

### --file-- styles.css

```css
/* ===== Tokeny (světlý motiv) ===== */

:root {
  --color-bg: oklch(97% 0.012 80);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(23% 0.035 265);
  --color-muted: oklch(45% 0.03 265);
  --color-line: oklch(88% 0.015 80);
  --color-accent: oklch(52% 0.14 45);
  --color-accent-contrast: oklch(100% 0 0);
  --color-hero-from: oklch(30% 0.07 265);
  --color-hero-to: oklch(45% 0.12 30);
  --radius: 1rem;
  --space-s: 0.75rem;
  --space-m: 1.5rem;
  --space-l: 3rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.55;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: var(--color-accent);
}

/* ===== Odkaz na přeskočení ===== */

.skip-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--color-text);
  color: var(--color-bg);
  font-weight: 650;
}

/* ===== Hlavička ===== */

.site-header {
  padding: 1rem var(--space-m);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-bg);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.site-nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-nav a {
  color: var(--color-text);
  font-weight: 550;
  text-decoration: none;
}

.site-nav a:hover {
  color: var(--color-accent);
}

/* ===== Tlačítko ===== */

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* ===== Úvod ===== */

.hero {
  padding: 5rem max(var(--space-m), (100% - 68rem) / 2 + var(--space-m)) 4rem;
  background:
    radial-gradient(circle at 88% 18%, oklch(86% 0.12 75 / 0.5), transparent 55%),
    linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to));
  color: oklch(98% 0.01 80);
}

.hero__date {
  margin: 0 0 var(--space-s);
  font-size: 0.9375rem;
  font-weight: 650;
  letter-spacing: 0.04em;
}

.hero__title {
  margin: 0;
  font-size: clamp(2.75rem, 8vw, 5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.hero__lead {
  max-width: 36rem;
  margin: var(--space-m) 0 2rem;
  font-size: 1.1875rem;
}

.hero .button {
  background: oklch(85% 0.14 80);
  color: var(--color-text);
}

/* ===== Sekce ===== */

.program,
.venue,
.signup {
  max-width: 68rem;
  margin-inline: auto;
  padding: 2.5rem var(--space-m);
}

.section-title {
  margin: 0 0 var(--space-m);
  font-size: 2rem;
  letter-spacing: -0.02em;
}

/* ===== Program ===== */

.program__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.event {
  padding: var(--space-m);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.event__time {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

.event__title {
  margin: 0.25rem 0 0.5rem;
  font-size: 1.3125rem;
  line-height: 1.25;
}

.event__text {
  margin: 0 0 var(--space-s);
  color: var(--color-muted);
}

.event__stage {
  margin: 0 0 var(--space-m);
  font-size: 0.875rem;
  font-weight: 650;
}

.event__link {
  font-weight: 700;
}

/* ===== Místo ===== */

.venue p {
  max-width: 40rem;
}

/* ===== Formulář ===== */

.signup__intro {
  max-width: 40rem;
  margin: 0 0 var(--space-m);
  color: var(--color-muted);
}

.signup__form {
  max-width: 32rem;
}

label {
  font-weight: 650;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-line);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}

/* ===== Patička ===== */

.site-footer {
  padding: 2rem var(--space-m) 3rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  text-align: center;
}

/* ===== Tvoje styly ===== */

/* Motiv: tokeny pro světlý i tmavý režim podle systému. */
:root {
  color-scheme: light dark;
  --color-bg: light-dark(oklch(97% 0.012 80), oklch(18% 0.025 265));
  --color-surface: light-dark(oklch(100% 0 0), oklch(24% 0.03 265));
  --color-text: light-dark(oklch(23% 0.035 265), oklch(94% 0.01 80));
  --color-muted: light-dark(oklch(45% 0.03 265), oklch(78% 0.02 265));
  --color-line: light-dark(oklch(88% 0.015 80), oklch(35% 0.03 265));
  --color-accent: light-dark(oklch(52% 0.14 45), oklch(78% 0.13 65));
  --color-accent-contrast: light-dark(oklch(100% 0 0), oklch(20% 0.03 265));
  --color-danger: light-dark(oklch(50% 0.19 25), oklch(74% 0.15 25));
}

html {
  /* Cíl odkazu na sekci nezajede pod přilepenou hlavičku. */
  scroll-padding-top: 5rem;
}

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

/* Odkaz na přeskočení je nad okrajem okna, dokud nemá fokus. */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 20;
  translate: 0 -200%;
  transition: translate 150ms ease-out;
}

.skip-link:focus {
  translate: 0 0;
}

/* Hlavička: logo vlevo, navigace vpravo, přilepená nahoře nad obsahem. */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
}

.site-nav__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
}

/* Program ve flexboxu: karta začíná na 17rem, roste a zalomí se, když se nevejde. */
.program__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-m);
}

/* Karta je sloupec a odkaz drží automatický margin u dna. */
.event {
  flex: 1 1 17rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: translate 250ms ease-out, border-color 250ms ease-out;
}

.event:is(:hover, :focus-within) {
  border-color: var(--color-accent);
  translate: 0 -6px;
}

.event__link {
  align-self: flex-start;
  margin-block-start: auto;
}

/* Formulář */
.signup__form {
  display: grid;
  gap: 1.25rem;
}

.signup__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1.25rem;
}

.field {
  display: grid;
  gap: 0.375rem;
}

.field__optional {
  color: var(--color-muted);
  font-weight: 400;
}

:is(input, select, textarea):user-invalid {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger);
}

.signup__form .button {
  justify-self: start;
}

/* Omezený pohyb: karta se nezvedá, rámeček se dál zbarví. */
@media (prefers-reduced-motion: reduce) {
  .event:is(:hover, :focus-within) {
    translate: none;
  }
}
```

# --review--

Testy kontrolují chování a spočtené hodnoty. Tohle zkontroluj sám, než kontrolní bod uzavřeš.

## --rubric--

- Prošel jsi celou stránku jen klávesnicí: fokus je vždycky vidět a pořadí dává smysl.
- Formulář jsi zkusil odeslat prázdný i s chybami a hlášky prohlížeče dávají smysl.
- Tmavý motiv jsi prohlédl v DevTools a nic v něm nesvítí bílým pozadím ani nezmizelo (rámečky, odkazy, pole formuláře).
- Hlavička se ti na šířce 375 px nerozlezla přes půl obrazovky.
- Barvy jsou v tokenech a v pravidlech komponent nejsou natvrdo zapsané hodnoty, které by v tmavém motivu nefungovaly.
- Víš, proč jsi pro program vybral grid, nebo flexbox, a jak by se stránka zachovala se sedmi koncerty.

## --extensions--

Rozšíření bez testů: ruční přepínač motivu, který přebije nastavení systému; animace řízená scrollem, která jemně odkryje karty programu (v `@supports` a jen bez omezení pohybu); mapa místa jako obrázek s `aspect-ratio`, který se na telefonu nezdeformuje; view transition při přepnutí programu mezi dny.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Jazz na hradbách 2026 — Tábor</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#program">Přeskočit na program</a>

    <header class="site-header">
      <a class="logo" href="#">Jazz na hradbách</a>
      <nav class="site-nav" aria-label="Hlavní navigace">
        <ul class="site-nav__list">
          <li><a href="#program">Program</a></li>
          <li><a href="#misto">Místo</a></li>
          <li><a href="#prihlaska">Vstupenky</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <p class="hero__date">9.–11. října 2026 · Tábor, bastion Na Hradbách</p>
        <h1 class="hero__title" id="hero-title">Jazz na hradbách</h1>
        <p class="hero__lead">Tři podzimní večery pod širým nebem i v gotickém sklepě. Šest kapel, jam session do půlnoci a svařák z táborské vinotéky.</p>
        <a class="button" href="#prihlaska">Chci vstupenky</a>
      </section>

      <section class="program" id="program" aria-labelledby="program-title">
        <h2 class="section-title" id="program-title">Program</h2>
        <ul class="program__list">
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T19:00">Pátek 9. 10. · 19:00</time></p>
            <h3 class="event__title">Kvartet Lužnice</h3>
            <p class="event__text">Standardy z padesátých let v úpravách pro vibrafon a kontrabas.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T21:30">Pátek 9. 10. · 21:30</time></p>
            <h3 class="event__title">Hana Vrbová &amp; Brass Quintet</h3>
            <p class="event__text">Zpěvačka z Českých Budějovic přiváží nové album plné dechů, swingu a českých textů, které poprvé zazní naživo.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T18:00">Sobota 10. 10. · 18:00</time></p>
            <h3 class="event__title">Big band ZUŠ Tábor</h3>
            <p class="event__text">Dvacet mladých muzikantů a Ellington.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T20:30">Sobota 10. 10. · 20:30</time></p>
            <h3 class="event__title">Ondřej Kalous Trio</h3>
            <p class="event__text">Klavírní trio na pomezí jazzu a klasiky, které loni vyhrálo cenu Anděl za jazz.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T16:00">Neděle 11. 10. · 16:00</time></p>
            <h3 class="event__title">Jazz pro děti</h3>
            <p class="event__text">Hodinový koncert s pohádkou o saxofonu, který se bál tmy. Vstup pro děti do 12 let zdarma.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T20:00">Neděle 11. 10. · 20:00</time></p>
            <h3 class="event__title">Závěrečná jam session</h3>
            <p class="event__text">Otevřené pódium pro všechny, kdo přinesou nástroj.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
        </ul>
      </section>

      <section class="venue" id="misto" aria-labelledby="venue-title">
        <h2 class="section-title" id="venue-title">Místo</h2>
        <p>Bastion Na Hradbách najdeš pět minut pěšky od Žižkova náměstí. Hlavní scéna a nádvoří jsou pod širým nebem, při dešti se program přesune do gotického sklepa pod bastionem.</p>
        <p>Z vlakového nádraží Tábor jezdí autobus č. 11 až na zastávku Náměstí, parkovat můžeš na parkovišti Holečkova. Areál je bezbariérový kromě gotického sklepa.</p>
      </section>

      <section class="signup" id="prihlaska" aria-labelledby="signup-title">
        <h2 class="section-title" id="signup-title">Vstupenky</h2>
        <p class="signup__intro">Vstupenku na jeden večer rezervujeme do 48 hodin. Zaplatíš ji na místě, 390 Kč, děti do 12 let zdarma.</p>
        <form class="signup__form" action="#" method="post">
--edit--
          <!-- Pole formuláře podle tabulky v zadání -->
--edit--

          <button class="button" type="submit">Odeslat rezervaci</button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <p>Jazz na hradbách · Spolek Táborský jazz · <a href="mailto:info@jazznahradbach.cz">info@jazznahradbach.cz</a></p>
    </footer>
  </body>
</html>
```

## --file-- styles.css

```css
/* ===== Tokeny (světlý motiv) ===== */

:root {
  --color-bg: oklch(97% 0.012 80);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(23% 0.035 265);
  --color-muted: oklch(45% 0.03 265);
  --color-line: oklch(88% 0.015 80);
  --color-accent: oklch(52% 0.14 45);
  --color-accent-contrast: oklch(100% 0 0);
  --color-hero-from: oklch(30% 0.07 265);
  --color-hero-to: oklch(45% 0.12 30);
  --radius: 1rem;
  --space-s: 0.75rem;
  --space-m: 1.5rem;
  --space-l: 3rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.55;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: var(--color-accent);
}

/* ===== Odkaz na přeskočení ===== */

.skip-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--color-text);
  color: var(--color-bg);
  font-weight: 650;
}

/* ===== Hlavička ===== */

.site-header {
  padding: 1rem var(--space-m);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-bg);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.site-nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-nav a {
  color: var(--color-text);
  font-weight: 550;
  text-decoration: none;
}

.site-nav a:hover {
  color: var(--color-accent);
}

/* ===== Tlačítko ===== */

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* ===== Úvod ===== */

.hero {
  padding: 5rem max(var(--space-m), (100% - 68rem) / 2 + var(--space-m)) 4rem;
  background:
    radial-gradient(circle at 88% 18%, oklch(86% 0.12 75 / 0.5), transparent 55%),
    linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to));
  color: oklch(98% 0.01 80);
}

.hero__date {
  margin: 0 0 var(--space-s);
  font-size: 0.9375rem;
  font-weight: 650;
  letter-spacing: 0.04em;
}

.hero__title {
  margin: 0;
  font-size: clamp(2.75rem, 8vw, 5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.hero__lead {
  max-width: 36rem;
  margin: var(--space-m) 0 2rem;
  font-size: 1.1875rem;
}

.hero .button {
  background: oklch(85% 0.14 80);
  color: var(--color-text);
}

/* ===== Sekce ===== */

.program,
.venue,
.signup {
  max-width: 68rem;
  margin-inline: auto;
  padding: 2.5rem var(--space-m);
}

.section-title {
  margin: 0 0 var(--space-m);
  font-size: 2rem;
  letter-spacing: -0.02em;
}

/* ===== Program ===== */

.program__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.event {
  padding: var(--space-m);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.event__time {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

.event__title {
  margin: 0.25rem 0 0.5rem;
  font-size: 1.3125rem;
  line-height: 1.25;
}

.event__text {
  margin: 0 0 var(--space-s);
  color: var(--color-muted);
}

.event__stage {
  margin: 0 0 var(--space-m);
  font-size: 0.875rem;
  font-weight: 650;
}

.event__link {
  font-weight: 700;
}

/* ===== Místo ===== */

.venue p {
  max-width: 40rem;
}

/* ===== Formulář ===== */

.signup__intro {
  max-width: 40rem;
  margin: 0 0 var(--space-m);
  color: var(--color-muted);
}

.signup__form {
  max-width: 32rem;
}

label {
  font-weight: 650;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-line);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}

/* ===== Patička ===== */

.site-footer {
  padding: 2rem var(--space-m) 3rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  text-align: center;
}

/* ===== Tvoje styly ===== */
--edit--

--edit--
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Jazz na hradbách 2026 — Tábor</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#program">Přeskočit na program</a>

    <header class="site-header">
      <a class="logo" href="#">Jazz na hradbách</a>
      <nav class="site-nav" aria-label="Hlavní navigace">
        <ul class="site-nav__list">
          <li><a href="#program">Program</a></li>
          <li><a href="#misto">Místo</a></li>
          <li><a href="#prihlaska">Vstupenky</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <p class="hero__date">9.–11. října 2026 · Tábor, bastion Na Hradbách</p>
        <h1 class="hero__title" id="hero-title">Jazz na hradbách</h1>
        <p class="hero__lead">Tři podzimní večery pod širým nebem i v gotickém sklepě. Šest kapel, jam session do půlnoci a svařák z táborské vinotéky.</p>
        <a class="button" href="#prihlaska">Chci vstupenky</a>
      </section>

      <section class="program" id="program" aria-labelledby="program-title">
        <h2 class="section-title" id="program-title">Program</h2>
        <ul class="program__list">
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T19:00">Pátek 9. 10. · 19:00</time></p>
            <h3 class="event__title">Kvartet Lužnice</h3>
            <p class="event__text">Standardy z padesátých let v úpravách pro vibrafon a kontrabas.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-09T21:30">Pátek 9. 10. · 21:30</time></p>
            <h3 class="event__title">Hana Vrbová &amp; Brass Quintet</h3>
            <p class="event__text">Zpěvačka z Českých Budějovic přiváží nové album plné dechů, swingu a českých textů, které poprvé zazní naživo.</p>
            <p class="event__stage">Hlavní scéna</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T18:00">Sobota 10. 10. · 18:00</time></p>
            <h3 class="event__title">Big band ZUŠ Tábor</h3>
            <p class="event__text">Dvacet mladých muzikantů a Ellington.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-10T20:30">Sobota 10. 10. · 20:30</time></p>
            <h3 class="event__title">Ondřej Kalous Trio</h3>
            <p class="event__text">Klavírní trio na pomezí jazzu a klasiky, které loni vyhrálo cenu Anděl za jazz.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T16:00">Neděle 11. 10. · 16:00</time></p>
            <h3 class="event__title">Jazz pro děti</h3>
            <p class="event__text">Hodinový koncert s pohádkou o saxofonu, který se bál tmy. Vstup pro děti do 12 let zdarma.</p>
            <p class="event__stage">Nádvoří</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
          <li class="event">
            <p class="event__time"><time datetime="2026-10-11T20:00">Neděle 11. 10. · 20:00</time></p>
            <h3 class="event__title">Závěrečná jam session</h3>
            <p class="event__text">Otevřené pódium pro všechny, kdo přinesou nástroj.</p>
            <p class="event__stage">Gotický sklep</p>
            <a class="event__link" href="#prihlaska">Rezervovat místo</a>
          </li>
        </ul>
      </section>

      <section class="venue" id="misto" aria-labelledby="venue-title">
        <h2 class="section-title" id="venue-title">Místo</h2>
        <p>Bastion Na Hradbách najdeš pět minut pěšky od Žižkova náměstí. Hlavní scéna a nádvoří jsou pod širým nebem, při dešti se program přesune do gotického sklepa pod bastionem.</p>
        <p>Z vlakového nádraží Tábor jezdí autobus č. 11 až na zastávku Náměstí, parkovat můžeš na parkovišti Holečkova. Areál je bezbariérový kromě gotického sklepa.</p>
      </section>

      <section class="signup" id="prihlaska" aria-labelledby="signup-title">
        <h2 class="section-title" id="signup-title">Vstupenky</h2>
        <p class="signup__intro">Vstupenku na jeden večer rezervujeme do 48 hodin. Zaplatíš ji na místě, 390 Kč, děti do 12 let zdarma.</p>
        <form class="signup__form" action="#" method="post">
          <div class="field">
            <label for="signup-name">Jméno a příjmení</label>
            <input id="signup-name" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="signup-email">E-mail</label>
            <input id="signup-email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="signup__row">
            <div class="field">
              <label for="signup-tickets">Počet vstupenek</label>
              <input id="signup-tickets" name="tickets" type="number" min="1" max="6" value="1" required>
            </div>
            <div class="field">
              <label for="signup-evening">Večer</label>
              <select id="signup-evening" name="evening" required>
                <option value="">Vyber večer</option>
                <option value="patek">Pátek 9. 10.</option>
                <option value="sobota">Sobota 10. 10.</option>
                <option value="nedele">Neděle 11. 10.</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="signup-note">Poznámka <span class="field__optional">(nepovinné)</span></label>
            <textarea id="signup-note" name="note" rows="3" maxlength="300"></textarea>
          </div>

          <button class="button" type="submit">Odeslat rezervaci</button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <p>Jazz na hradbách · Spolek Táborský jazz · <a href="mailto:info@jazznahradbach.cz">info@jazznahradbach.cz</a></p>
    </footer>
  </body>
</html>
```

## --file-- styles.css

```css
/* ===== Tokeny (světlý motiv) ===== */

:root {
  --color-bg: oklch(97% 0.012 80);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(23% 0.035 265);
  --color-muted: oklch(45% 0.03 265);
  --color-line: oklch(88% 0.015 80);
  --color-accent: oklch(52% 0.14 45);
  --color-accent-contrast: oklch(100% 0 0);
  --color-hero-from: oklch(30% 0.07 265);
  --color-hero-to: oklch(45% 0.12 30);
  --radius: 1rem;
  --space-s: 0.75rem;
  --space-m: 1.5rem;
  --space-l: 3rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.55;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: var(--color-accent);
}

/* ===== Odkaz na přeskočení ===== */

.skip-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--color-text);
  color: var(--color-bg);
  font-weight: 650;
}

/* ===== Hlavička ===== */

.site-header {
  padding: 1rem var(--space-m);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-bg);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.site-nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-nav a {
  color: var(--color-text);
  font-weight: 550;
  text-decoration: none;
}

.site-nav a:hover {
  color: var(--color-accent);
}

/* ===== Tlačítko ===== */

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* ===== Úvod ===== */

.hero {
  padding: 5rem max(var(--space-m), (100% - 68rem) / 2 + var(--space-m)) 4rem;
  background:
    radial-gradient(circle at 88% 18%, oklch(86% 0.12 75 / 0.5), transparent 55%),
    linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to));
  color: oklch(98% 0.01 80);
}

.hero__date {
  margin: 0 0 var(--space-s);
  font-size: 0.9375rem;
  font-weight: 650;
  letter-spacing: 0.04em;
}

.hero__title {
  margin: 0;
  font-size: clamp(2.75rem, 8vw, 5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.hero__lead {
  max-width: 36rem;
  margin: var(--space-m) 0 2rem;
  font-size: 1.1875rem;
}

.hero .button {
  background: oklch(85% 0.14 80);
  color: var(--color-text);
}

/* ===== Sekce ===== */

.program,
.venue,
.signup {
  max-width: 68rem;
  margin-inline: auto;
  padding: 2.5rem var(--space-m);
}

.section-title {
  margin: 0 0 var(--space-m);
  font-size: 2rem;
  letter-spacing: -0.02em;
}

/* ===== Program ===== */

.program__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.event {
  padding: var(--space-m);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.event__time {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

.event__title {
  margin: 0.25rem 0 0.5rem;
  font-size: 1.3125rem;
  line-height: 1.25;
}

.event__text {
  margin: 0 0 var(--space-s);
  color: var(--color-muted);
}

.event__stage {
  margin: 0 0 var(--space-m);
  font-size: 0.875rem;
  font-weight: 650;
}

.event__link {
  font-weight: 700;
}

/* ===== Místo ===== */

.venue p {
  max-width: 40rem;
}

/* ===== Formulář ===== */

.signup__intro {
  max-width: 40rem;
  margin: 0 0 var(--space-m);
  color: var(--color-muted);
}

.signup__form {
  max-width: 32rem;
}

label {
  font-weight: 650;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-line);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}

/* ===== Patička ===== */

.site-footer {
  padding: 2rem var(--space-m) 3rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  text-align: center;
}

/* ===== Tvoje styly ===== */

/* Motiv: tokeny pro světlý i tmavý režim podle systému. */
:root {
  color-scheme: light dark;
  --color-bg: light-dark(oklch(97% 0.012 80), oklch(18% 0.025 265));
  --color-surface: light-dark(oklch(100% 0 0), oklch(24% 0.03 265));
  --color-text: light-dark(oklch(23% 0.035 265), oklch(94% 0.01 80));
  --color-muted: light-dark(oklch(45% 0.03 265), oklch(78% 0.02 265));
  --color-line: light-dark(oklch(88% 0.015 80), oklch(35% 0.03 265));
  --color-accent: light-dark(oklch(52% 0.14 45), oklch(78% 0.13 65));
  --color-accent-contrast: light-dark(oklch(100% 0 0), oklch(20% 0.03 265));
  --color-danger: light-dark(oklch(50% 0.19 25), oklch(74% 0.15 25));
}

html {
  /* Cíl odkazu na sekci nezajede pod přilepenou hlavičku. */
  scroll-padding-top: 5rem;
}

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

/* Odkaz na přeskočení je nad okrajem okna, dokud nemá fokus. */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 20;
  translate: 0 -200%;
  transition: translate 150ms ease-out;
}

.skip-link:focus {
  translate: 0 0;
}

/* Hlavička: logo vlevo, navigace vpravo, přilepená nahoře nad obsahem. */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
}

.site-nav__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
}

/* Program: mobile-first mřížka, 1 → 2 → 3 sloupce. */
.program__list {
  display: grid;
  gap: var(--space-m);
}

@media (width >= 40rem) {
  .program__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 60rem) {
  .program__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Karta je sloupec a odkaz drží automatický margin u dna. */
.event {
  display: flex;
  flex-direction: column;
  transition: translate 250ms ease-out, border-color 250ms ease-out;
}

.event:is(:hover, :focus-within) {
  border-color: var(--color-accent);
  translate: 0 -6px;
}

.event__link {
  align-self: flex-start;
  margin-block-start: auto;
}

/* Formulář */
.signup__form {
  display: grid;
  gap: 1.25rem;
}

.signup__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1.25rem;
}

.field {
  display: grid;
  gap: 0.375rem;
}

.field__optional {
  color: var(--color-muted);
  font-weight: 400;
}

:is(input, select, textarea):user-invalid {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger);
}

.signup__form .button {
  justify-self: start;
}

/* Omezený pohyb: karta se nezvedá, rámeček se dál zbarví. */
@media (prefers-reduced-motion: reduce) {
  .event:is(:hover, :focus-within) {
    translate: none;
  }
}
```
