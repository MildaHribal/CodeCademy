---
title: Karta nabídky práce z návrhu
see: css-design/cteni-navrhu#auto-layout-je-flexbox, css-design/svg-a-ikony#pristupnost-ikon
---

# --description--

Na portálu s nabídkami práce je karta nabídky nejdůležitější komponenta: uživatel jich projde desítky a musí se v nich vyznat na první pohled. Návrhářka dodala komponentu *Job card* a ty ji postavíš podle specifikace, ve světlém i tmavém motivu, na počítači i na telefonu.

V `styles.css` jsou tokeny z návrhu, styly stránky a hotové části, které s komponentou nesouvisí (vzhled loga a štítku, reset seznamů a tlačítka). Ikony v HTML jsou přesně tak, jak vypadly po exportu z Dev Mode, takže je čeká stejná kontrola jako každý jiný export. Texty nabídek si klidně změň, třídy a pořadí prvků nech.

Výtah ze specifikace:

| prvek (vrstva ve Figmě) | z návrhu |
|---|---|
| karta `.job` | *Vertical*, *Gap* 16, *Padding* 24, *Radius* 16, *Stroke* 1 inside `color/border`, *Fill* `color/raised`; stav *Hover*: *Stroke* `color/accent` |
| hlavička `.job__header` | *Horizontal*, *Gap* 12, zarovnání nahoru |
| logo `.job__logo` | *Fixed* 48 × 48 (vzhled už je hotový) |
| blok s názvem `.job__heading` | *Fill container* |
| název `.job__title` | text *Title/S* 18 / 24, *Semibold*, `color/text` |
| firma `.job__company` | text *Body/S* 14 / 20, `color/text-muted` |
| uložit `.job__save` | *Fixed* 40 × 40, *Radius* 8, ikona 20 `color/accent`; stav *Hover*: *Fill* `color/accent-soft` |
| údaje `.job__meta` | *Horizontal*, *Wrap*, *Gap* 16, mezera mezi řádky 8 |
| údaj `.job__fact` | *Horizontal*, *Gap* 6, na střed; ikona *Fixed* 16 × 16; text *Body/S* `color/text-muted` |
| štítky `.job__tags` | *Horizontal*, *Wrap*, *Gap* 8 (vzhled štítku je hotový) |
| patička `.job__footer` | *Horizontal*, *Gap: Auto*, na střed; plat *Body/M* 16 / 24 *Bold*; datum *Body/S* `color/text-muted` |
| fokus | obrys 2 `color/focus`, odsazení 2 |

Co má komponenta umět:

- Karta sedí na hodnoty ze specifikace a na telefonu nic nepřeteče, ani když má pozice dlouhý název nebo čtyři údaje.
- Ikony se barví s textem kolem sebe, i po přepnutí do tmavého motivu.
- Uživatel čtečky obrazovky neslyší ikony navíc a u tlačítka pro uložení ví, co udělá.
- Po najetí myší karta i tlačítko reagují podle stavů z návrhu, fokus z klávesnice je vidět.
- Každý text je čitelný v obou motivech.

Testy měří na šířce 1024 px a u zalamování a přetékání na 375 px (přepínač šířky náhledu). Motiv přepínej tlačítkem v hlavičce.

# --hints--

Karta `.job` má vnitřní odsazení 24 px, zaoblení 16 px, rámeček 1 px v barvě `color/border` a pozadí `color/raised`, ve světlém i tmavém motivu.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const token = (name, prop = 'color') => { const probe = document.createElement('span'); probe.style[prop] = `var(${name})`; document.querySelector('.job').append(probe); const value = getComputedStyle(probe)[prop]; probe.remove(); return value; };
const [first, long, many] = document.querySelectorAll('.job');

for (const name of ['light', 'dark']) {
  theme(name);
  const style = getComputedStyle(first);
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    assert.equal(style[`padding${side}`], '24px', `.job má padding${side} ${style[`padding${side}`]}, čekám 24px`);
    assert.equal(style[`border${side}Width`], '1px', `.job má border${side}Width ${style[`border${side}Width`]}, čekám 1px`);
  }
  assert.equal(style.borderTopLeftRadius, '16px', `.job má zaoblení ${style.borderTopLeftRadius}, čekám 16px`);
  assert.equal(style.borderTopColor, token('--color-border'), `Motiv ${name}: rámeček karty má mít barvu var(--color-border)`);
  assert.equal(style.backgroundColor, token('--color-raised'), `Motiv ${name}: pozadí karty má být var(--color-raised)`);
}
```

Hlavička, údaje, štítky a patička jsou v kartě pod sebou s mezerou 16 px.

```js
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

const parts = [...first.children].map(box);
assert.equal(parts.length, 4, 'Karta má mít čtyři části: hlavičku, údaje, štítky a patičku');
for (let i = 1; i < parts.length; i++) {
  const space = parts[i].top - parts[i - 1].bottom;
  assert.ok(Math.abs(space - 16) <= 1, `Mezi ${i}. a ${i + 1}. částí karty je ${Math.round(space)} px, čekám 16 px`);
}
```

V hlavičce je logo 48 × 48 px u levého okraje, tlačítko pro uložení 40 × 40 px u pravého a blok s názvem mezi nimi s mezerou 12 px na obou stranách. Všechny tři začínají nahoře.

```js
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

const style = getComputedStyle(first);
const left = box(first).left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
const right = box(first).right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
const logo = box(first.querySelector('.job__logo'));
const heading = box(first.querySelector('.job__heading'));
const save = box(first.querySelector('.job__save'));
assert.ok(Math.abs(logo.width - 48) <= 0.5 && Math.abs(logo.height - 48) <= 0.5, `Logo má ${Math.round(logo.width)} × ${Math.round(logo.height)} px, čekám 48 × 48`);
assert.ok(Math.abs(save.width - 40) <= 0.5 && Math.abs(save.height - 40) <= 0.5, `Tlačítko má ${Math.round(save.width)} × ${Math.round(save.height)} px, čekám 40 × 40`);
assert.ok(Math.abs(logo.left - left) <= 1, `Logo začíná ${Math.round(logo.left - left)} px od okraje obsahu karty`);
assert.ok(Math.abs(save.right - right) <= 1, `Tlačítko končí ${Math.round(right - save.right)} px před okrajem obsahu karty`);
assert.ok(Math.abs(heading.left - logo.right - 12) <= 1, `Mezi logem a názvem je ${Math.round(heading.left - logo.right)} px, čekám 12 px`);
assert.ok(Math.abs(save.left - heading.right - 12) <= 1, `Mezi blokem s názvem a tlačítkem je ${Math.round(save.left - heading.right)} px, čekám 12 px (blok má vyplnit zbylé místo)`);
assert.ok(Math.abs(logo.top - heading.top) <= 1 && Math.abs(save.top - heading.top) <= 1, 'Logo, blok s názvem a tlačítko mají začínat na stejné horní hraně');
```

Na šířce 375 px si u karty s dlouhým názvem pozice drží logo 48 × 48 px a tlačítko 40 × 40 px a stránka nejde posouvat do strany.

```js
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

await helpers.resize(375);
const logo = box(long.querySelector('.job__logo'));
const save = box(long.querySelector('.job__save'));
assert.ok(Math.abs(logo.width - 48) <= 0.5 && Math.abs(logo.height - 48) <= 0.5, `Na šířce 375 px má logo u dlouhého názvu ${Math.round(logo.width)} × ${Math.round(logo.height)} px, čekám 48 × 48`);
assert.ok(Math.abs(save.width - 40) <= 0.5 && Math.abs(save.height - 40) <= 0.5, `Na šířce 375 px má tlačítko u dlouhého názvu ${Math.round(save.width)} × ${Math.round(save.height)} px, čekám 40 × 40`);
assert.ok(save.right <= box(long).right, 'Na šířce 375 px vyjíždí tlačítko z karty');
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Na šířce 375 px je obsah široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
```

Název pozice má styl 18 / 24 a je aspoň polotučný. Firma má 14 / 20 a barvu `color/text-muted`.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const token = (name, prop = 'color') => { const probe = document.createElement('span'); probe.style[prop] = `var(${name})`; document.querySelector('.job').append(probe); const value = getComputedStyle(probe)[prop]; probe.remove(); return value; };
const [first, long, many] = document.querySelectorAll('.job');

const title = getComputedStyle(first.querySelector('.job__title'));
assert.equal(title.fontSize, '18px', `Název pozice má fontSize ${title.fontSize}, čekám 18px`);
assert.ok(Math.abs(parseFloat(title.lineHeight) - 24) <= 0.5, `Název pozice má lineHeight ${title.lineHeight}, čekám 24px`);
assert.ok(Number(title.fontWeight) >= 600, `Název pozice má fontWeight ${title.fontWeight}, čekám aspoň 600`);
const company = getComputedStyle(first.querySelector('.job__company'));
assert.equal(company.fontSize, '14px', `Firma má fontSize ${company.fontSize}, čekám 14px`);
assert.ok(Math.abs(parseFloat(company.lineHeight) - 20) <= 0.5, `Firma má lineHeight ${company.lineHeight}, čekám 20px`);
for (const name of ['light', 'dark']) {
  theme(name);
  assert.equal(getComputedStyle(first.querySelector('.job__company')).color, token('--color-text-muted'), `Motiv ${name}: firma má mít barvu var(--color-text-muted)`);
}
```

Údaje (místo, režim, úvazek) mají text 14 / 20 v barvě `color/text-muted`, ikonu 16 × 16 px 6 px před textem a ikona je svisle na středu textu.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const token = (name, prop = 'color') => { const probe = document.createElement('span'); probe.style[prop] = `var(${name})`; document.querySelector('.job').append(probe); const value = getComputedStyle(probe)[prop]; probe.remove(); return value; };
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

theme('light');
first.querySelectorAll('.job__fact').forEach((fact) => {
  const style = getComputedStyle(fact);
  assert.equal(style.fontSize, '14px', `Údaj „${fact.textContent}" má fontSize ${style.fontSize}, čekám 14px`);
  assert.ok(Math.abs(parseFloat(style.lineHeight) - 20) <= 0.5, `Údaj „${fact.textContent}" má lineHeight ${style.lineHeight}, čekám 20px`);
  assert.equal(style.color, token('--color-text-muted'), `Údaj „${fact.textContent}" má mít barvu var(--color-text-muted)`);
  const icon = box(fact.querySelector('svg'));
  assert.ok(Math.abs(icon.width - 16) <= 0.5 && Math.abs(icon.height - 16) <= 0.5, `Ikona u „${fact.textContent}" má ${Math.round(icon.width)} × ${Math.round(icon.height)} px, čekám 16 × 16`);
  const textNode = [...fact.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  const range = document.createRange();
  range.selectNodeContents(textNode);
  const text = range.getBoundingClientRect();
  assert.ok(Math.abs(text.left - icon.right - 6) <= 1, `Mezi ikonou a textem „${fact.textContent}" je ${Math.round(text.left - icon.right)} px, čekám 6 px`);
  const line = box(fact);
  const offset = (icon.top + icon.height / 2) - (line.top + line.height / 2);
  assert.ok(Math.abs(offset) <= 1.5, `Ikona u „${fact.textContent}" je ${offset.toFixed(1)} px mimo střed textu`);
});
```

Údaje se zalamují: vedle sebe mají mezeru 16 px, a když se nevejdou, další řádek začíná 8 px pod předchozím (vyzkoušeno na šířce 375 px u karty se čtyřmi údaji).

```js
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

const [a, b] = [...first.querySelectorAll('.job__fact')].map(box);
assert.ok(Math.abs(a.top - b.top) <= 1, 'Na šířce 1024 px mají být první dva údaje vedle sebe');
assert.ok(Math.abs(b.left - a.right - 16) <= 1, `Mezi prvními dvěma údaji je ${Math.round(b.left - a.right)} px, čekám 16 px`);
await helpers.resize(375);
const facts = [...many.querySelectorAll('.job__fact')].map(box);
const rows = [...new Set(facts.map((f) => Math.round(f.top)))];
assert.ok(rows.length >= 2, 'Na šířce 375 px se mají čtyři údaje zalomit do víc řádků');
const firstRowBottom = Math.max(...facts.filter((f) => Math.round(f.top) === rows[0]).map((f) => f.bottom));
assert.ok(Math.abs(rows[1] - firstRowBottom - 8) <= 1, `Mezi řádky údajů je ${Math.round(rows[1] - firstRowBottom)} px, čekám 8 px`);
const card = box(many);
assert.ok(facts.every((f) => f.right <= card.right), 'Na šířce 375 px vyjíždí některý údaj z karty');
```

Ikony údajů i ikona tlačítka mají barvu textu svého prvku (`currentColor`), takže se v tmavém motivu přebarví s ním.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const [first, long, many] = document.querySelectorAll('.job');

const shapes = (svg) => {
  const use = svg.querySelector('use');
  if (!use) return [...svg.querySelectorAll('path, circle, rect, polygon')].map((el) => ({ el, sprite: false }));
  const target = document.querySelector(use.getAttribute('href') ?? use.getAttribute('xlink:href'));
  return target ? [...target.querySelectorAll('path, circle, rect, polygon')].map((el) => ({ el, sprite: true })) : [];
};
const followsText = ({ el, sprite }, owner) => {
  if (sprite) return (el.getAttribute('fill') ?? '').toLowerCase() === 'currentcolor' || getComputedStyle(el).fill === getComputedStyle(el.closest('svg')).color;
  return getComputedStyle(el).fill === getComputedStyle(owner).color;
};
for (const name of ['light', 'dark']) {
  theme(name);
  for (const fact of first.querySelectorAll('.job__fact')) {
    const list = shapes(fact.querySelector('svg'));
    assert.ok(list.length > 0, `Ikona u „${fact.textContent}" nemá žádný tvar`);
    assert.ok(list.every((shape) => followsText(shape, fact)), `Motiv ${name}: ikona u „${fact.textContent}" má výplň ${getComputedStyle(list[0].el).fill}, text ${getComputedStyle(fact).color} — má mít currentColor`);
  }
  const button = first.querySelector('.job__save');
  const list = shapes(button.querySelector('svg'));
  assert.ok(list.every((shape) => followsText(shape, button)), `Motiv ${name}: ikona tlačítka má mít barvu textu tlačítka (currentColor)`);
}
```

Tlačítko pro uložení má ikonu 20 × 20 px v barvě `color/accent`.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const token = (name, prop = 'color') => { const probe = document.createElement('span'); probe.style[prop] = `var(${name})`; document.querySelector('.job').append(probe); const value = getComputedStyle(probe)[prop]; probe.remove(); return value; };
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

const button = first.querySelector('.job__save');
const icon = box(button.querySelector('svg'));
assert.ok(Math.abs(icon.width - 20) <= 0.5 && Math.abs(icon.height - 20) <= 0.5, `Ikona tlačítka má ${Math.round(icon.width)} × ${Math.round(icon.height)} px, čekám 20 × 20`);
for (const name of ['light', 'dark']) {
  theme(name);
  assert.equal(getComputedStyle(button).color, token('--color-accent'), `Motiv ${name}: tlačítko má mít barvu var(--color-accent)`);
}
```

Ikony v údajích i v tlačítku jsou pro čtečku skryté a tlačítko má přístupné jméno, které říká, co udělá.

```js
document.querySelectorAll('.job').forEach((job, i) => {
  job.querySelectorAll('.job__fact svg, .job__save svg').forEach((svg) => {
    assert.equal(svg.getAttribute('aria-hidden'), 'true', `V ${i + 1}. kartě má ikona v „${svg.parentElement.textContent.trim() || 'tlačítku'}" chybět aria-hidden="true"`);
  });
  const button = job.querySelector('.job__save');
  const labelledby = button.getAttribute('aria-labelledby');
  const name = (button.getAttribute('aria-label') ?? '').trim() || (labelledby ? labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim() : '') || button.textContent.trim() || (button.getAttribute('title') ?? '').trim();
  assert.ok(name.length >= 3, `Tlačítko pro uložení v ${i + 1}. kartě nemá přístupné jméno — čtečka řekne jen „tlačítko"`);
});
```

Štítky technologií mají mezi sebou 8 px a na šířce 375 px se zalomí, místo aby vyjely z karty.

```js
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

const [a, b] = [...first.querySelectorAll('.tag')].map(box);
assert.ok(Math.abs(a.top - b.top) <= 1 && Math.abs(b.left - a.right - 8) <= 1, `Mezi prvními dvěma štítky je ${Math.round(b.left - a.right)} px, čekám 8 px vedle sebe`);
await helpers.resize(375);
const card = box(many);
const tags = [...many.querySelectorAll('.tag')].map(box);
assert.ok(tags.every((tag) => tag.right <= card.right), 'Na šířce 375 px vyjíždí štítek z karty');
const lineHeight = Math.min(...tags.map((tag) => tag.height));
assert.ok(tags.every((tag) => tag.height <= lineHeight + 1), 'Na šířce 375 px se text některého štítku zalomil uvnitř štítku — zalomit se mají štítky, ne jejich text');
```

Patička má plat vlevo (16 px, tučně) a datum zveřejnění u pravého okraje (14 / 20, `color/text-muted`), obojí svisle na středu.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const token = (name, prop = 'color') => { const probe = document.createElement('span'); probe.style[prop] = `var(${name})`; document.querySelector('.job').append(probe); const value = getComputedStyle(probe)[prop]; probe.remove(); return value; };
const [first, long, many] = document.querySelectorAll('.job');
const box = (el) => el.getBoundingClientRect();

theme('light');
const footer = first.querySelector('.job__footer');
const salary = footer.querySelector('.job__salary');
const posted = footer.querySelector('.job__posted');
const fb = box(footer);
assert.ok(Math.abs(box(salary).left - fb.left) <= 1, 'Plat má začínat u levého okraje patičky');
assert.ok(Math.abs(box(posted).right - fb.right) <= 1, `Datum končí ${Math.round(fb.right - box(posted).right)} px před pravým okrajem patičky`);
const middle = (r) => r.top + r.height / 2;
assert.ok(Math.abs(middle(box(salary)) - middle(box(posted))) <= 1, 'Plat a datum mají být svisle na středu jednoho řádku');
assert.equal(getComputedStyle(salary).fontSize, '16px', 'Plat má mít písmo 16px');
assert.ok(Number(getComputedStyle(salary).fontWeight) >= 700, `Plat má fontWeight ${getComputedStyle(salary).fontWeight}, čekám aspoň 700`);
assert.equal(getComputedStyle(posted).fontSize, '14px', 'Datum má mít písmo 14px');
assert.equal(getComputedStyle(posted).color, token('--color-text-muted'), 'Datum má mít barvu var(--color-text-muted)');
```

Po najetí myší dostane karta rámeček v barvě `color/accent` a tlačítko pro uložení výplň `color/accent-soft`, ve světlém i tmavém motivu.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const token = (name, prop = 'color') => { const probe = document.createElement('span'); probe.style[prop] = `var(${name})`; document.querySelector('.job').append(probe); const value = getComputedStyle(probe)[prop]; probe.remove(); return value; };
const hoverRules = (el) => [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]).flatMap(function walk(rule) { return [rule, ...[...(rule.cssRules ?? [])].flatMap(walk)]; }).filter((rule) => rule.selectorText?.includes(':hover') && rule.selectorText.split(',').some((part) => part.includes(':hover') && el.matches(part.replace(/:hover/g, '').trim() || '*')));
const [first, long, many] = document.querySelectorAll('.job');

const button = first.querySelector('.job__save');
const declaration = (rules, props) => { for (const rule of rules.reverse()) for (const prop of props) { const value = rule.style.getPropertyValue(prop); if (value) return [prop, value]; } return null; };
const cardHover = declaration(hoverRules(first), ['border-color', 'border-top-color', 'border']);
const buttonHover = declaration(hoverRules(button), ['background-color', 'background']);
assert.ok(cardHover, 'V CSS chybí pravidlo pro kartu při najetí myší, které mění barvu rámečku');
assert.ok(buttonHover, 'V CSS chybí pravidlo pro tlačítko při najetí myší, které mění pozadí');
for (const name of ['light', 'dark']) {
  theme(name);
  const probe = document.createElement('div');
  probe.style.border = '1px solid';
  probe.style.setProperty(cardHover[0], cardHover[1]);
  probe.style.setProperty(buttonHover[0], buttonHover[1]);
  first.append(probe);
  const border = getComputedStyle(probe).borderTopColor;
  const background = getComputedStyle(probe).backgroundColor;
  probe.remove();
  assert.equal(border, token('--color-accent'), `Motiv ${name}: rámeček karty při najetí myší má být var(--color-accent), je ${border}`);
  assert.equal(background, token('--color-accent-soft'), `Motiv ${name}: výplň tlačítka při najetí myší má být var(--color-accent-soft), je ${background}`);
}
```

Odkaz v názvu pozice i tlačítko pro uložení mají při fokusu z klávesnice (`:focus-visible`) obrys aspoň 2 px odsazený od prvku, s kontrastem aspoň 3 : 1 vůči kartě v obou motivech.

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const [first, long, many] = document.querySelectorAll('.job');

const selectors = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]).flatMap(function walk(rule) { return [rule.selectorText ?? '', ...[...(rule.cssRules ?? [])].flatMap(walk)]; });
assert.ok(selectors.some((selector) => selector.includes(':focus-visible')), 'V CSS má být pravidlo s :focus-visible');
for (const name of ['light', 'dark']) {
  theme(name);
  for (const el of [first.querySelector('.job__title a'), first.querySelector('.job__save')]) {
    el.focus();
    const style = getComputedStyle(el);
    const label = el.matches('a') ? 'Odkaz v názvu' : 'Tlačítko pro uložení';
    assert.ok(el.matches(':focus-visible'), `${label} po focus() nemá :focus-visible`);
    assert.ok(style.outlineStyle !== 'none' && style.outlineStyle !== 'auto' && parseFloat(style.outlineWidth) >= 2, `Motiv ${name}: ${label} má obrys ${style.outlineStyle} ${style.outlineWidth}, čekám vlastní obrys aspoň 2px`);
    assert.ok(parseFloat(style.outlineOffset) >= 1, `Motiv ${name}: ${label} má odsazení obrysu ${style.outlineOffset}, čekám aspoň 1px`);
    const ratio = contrast(style.outlineColor, getComputedStyle(first).backgroundColor);
    assert.ok(ratio >= 3, `Motiv ${name}: obrys u ${label.toLowerCase()} má s kartou kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 3 : 1`);
    el.blur();
  }
}
```

Všechny texty v kartě mají se svým pozadím kontrast aspoň 4,5 : 1 ve světlém i tmavém motivu (název, firma, údaje, štítky, plat a datum).

```js
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const [first, long, many] = document.querySelectorAll('.job');

for (const name of ['light', 'dark']) {
  theme(name);
  const surface = getComputedStyle(first).backgroundColor;
  assert.equal(rgba(surface)[3], 255, `Motiv ${name}: karta nemá neprůhledné pozadí (${surface})`);
  for (const selector of ['.job__title a', '.job__company', '.job__fact', '.job__salary', '.job__posted']) {
    const el = first.querySelector(selector);
    const ratio = contrast(getComputedStyle(el).color, surface);
    assert.ok(ratio >= 4.5, `Motiv ${name}: ${selector} má kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4.5 : 1`);
  }
  const tag = first.querySelector('.tag');
  const ratio = contrast(getComputedStyle(tag).color, getComputedStyle(tag).backgroundColor);
  assert.ok(ratio >= 4.5, `Motiv ${name}: štítek má kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4.5 : 1`);
}
```

# --help--

## --tip-- 4

Logo, které se u dlouhého názvu zmenší, je past z [Hug, fill a fixed](see:css-design/cteni-navrhu#hug-fill-a-fixed): *Fixed* na flex položce znamená pevnou velikost, kterou flexbox nesmí zmenšit, a *Fill* se má dělit o místo, které po ostatních zbude.

## --tip-- 8

Barvu, kterou ikona dostala při exportu natvrdo, přepíšeš buď v atributu SVG, nebo pravidlem v CSS. Obě cesty ukazuje [currentColor: ikona v barvě textu](see:css-design/svg-a-ikony#currentcolor-ikona-v-barve-textu).

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nástupka — práce z frontendu pro juniory</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Nástupka</a>
      <button class="theme-toggle" type="button" aria-pressed="false">Tmavý motiv</button>
    </header>

    <main class="page">
      <h1 class="page__title">Nabídky pro juniory</h1>
      <p class="page__lead">Pozice z frontendu, u kterých firmy výslovně počítají se začátečníkem. Aktualizováno 16. 9. 2026.</p>

      <ul class="jobs">
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 150" aria-hidden="true">LS</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Junior frontend vývojář/ka</a></h2>
                <p class="job__company">Lanýž Studio, Brno</p>
              </div>
              <button class="job__save" type="button">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#4F46E5" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Brno</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Hybridně</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">React</li>
              <li class="tag">CSS</li>
              <li class="tag">Přístupnost</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">45 000–55 000 Kč</p>
              <time class="job__posted" datetime="2026-09-14">před 2 dny</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 40" aria-hidden="true">CH</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Vývojář/ka webových aplikací pro rezervační systém horských chat</a></h2>
                <p class="job__company">Chalupník, Trutnov</p>
              </div>
              <button class="job__save" type="button">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#4F46E5" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1Zm1 2v7h14V7H5ZM1 18h22v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1Z"/></svg>Na dálku</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Next.js</li>
              <li class="tag">TypeScript</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">50 000–60 000 Kč</p>
              <time class="job__posted" datetime="2026-09-15">včera</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 250" aria-hidden="true">JM</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Frontend developer pro jízdní řády</a></h2>
                <p class="job__company">Jízdenky Morava, Olomouc</p>
              </div>
              <button class="job__save" type="button">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#4F46E5" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Olomouc</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Na místě</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Zkrácený úvazek 30 h</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24"><path fill="#64748B" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></svg>Nástup ihned</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Vue</li>
              <li class="tag">Design systém</li>
              <li class="tag">Testování</li>
              <li class="tag">Přístupnost</li>
              <li class="tag">Git</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">38 000–46 000 Kč</p>
              <time class="job__posted" datetime="2026-09-09">před týdnem</time>
            </footer>
          </article>
        </li>
      </ul>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
/* ---------- Tokeny z návrhu (kolekce Primitives a Semantic) ---------- */

:root {
  color-scheme: light dark;

  --gray-0: oklch(1 0 0);
  --gray-50: oklch(0.984 0.003 250);
  --gray-100: oklch(0.955 0.006 250);
  --gray-200: oklch(0.91 0.01 250);
  --gray-400: oklch(0.72 0.02 250);
  --gray-500: oklch(0.6 0.02 250);
  --gray-600: oklch(0.48 0.02 250);
  --gray-800: oklch(0.29 0.02 250);
  --gray-900: oklch(0.21 0.02 250);
  --gray-950: oklch(0.155 0.015 250);
  --violet-100: oklch(0.94 0.04 285);
  --violet-300: oklch(0.8 0.1 285);
  --violet-600: oklch(0.51 0.17 285);
  --violet-900: oklch(0.31 0.09 285);

  --color-page: light-dark(var(--gray-50), var(--gray-950));
  --color-raised: light-dark(var(--gray-0), var(--gray-900));
  --color-border: light-dark(var(--gray-200), var(--gray-800));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-accent: light-dark(var(--violet-600), var(--violet-300));
  --color-accent-soft: light-dark(var(--violet-100), var(--violet-900));
  --color-tag: light-dark(var(--gray-100), var(--gray-800));
  --color-focus: var(--color-accent);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-16: 4rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
}

/* ---------- Stránka (mimo komponentu) ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-page);
}

.site-header,
.page {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.theme-toggle {
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--gray-500);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  padding-block: var(--space-8) var(--space-16);
}

.page__title {
  margin: 0;
  font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.page__lead {
  max-width: 40rem;
  margin: var(--space-2) 0 var(--space-8);
  color: var(--color-text-muted);
}

.jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ---------- Reset a hotové části komponenty ---------- */

.job h2,
.job p,
.job ul {
  margin: 0;
}

.job ul {
  padding: 0;
  list-style: none;
}

.job__logo {
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: light-dark(oklch(0.93 0.05 var(--logo-hue)), oklch(0.33 0.06 var(--logo-hue)));
  color: light-dark(oklch(0.42 0.11 var(--logo-hue)), oklch(0.86 0.08 var(--logo-hue)));
  font-weight: 700;
}

.job__title a {
  color: inherit;
  text-decoration: none;
}

.job__title a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.job__save {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.tag {
  padding: var(--space-1) 0.625rem;
  border-radius: 999px;
  background: var(--color-tag);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}

/* ---------- Komponenta Job card podle návrhu: tady pracuješ ---------- */
--edit--

--edit--
```

## --file-- script.js

```js
// Přepínač motivu: nastaví color-scheme na <html>, tokeny s light-dark() se přepnou samy.
const toggle = document.querySelector('.theme-toggle');

toggle.addEventListener('click', () => {
  const dark = document.documentElement.style.colorScheme !== 'dark';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.textContent = dark ? 'Světlý motiv' : 'Tmavý motiv';
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
    <title>Nástupka — práce z frontendu pro juniory</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Nástupka</a>
      <button class="theme-toggle" type="button" aria-pressed="false">Tmavý motiv</button>
    </header>

    <main class="page">
      <h1 class="page__title">Nabídky pro juniory</h1>
      <p class="page__lead">Pozice z frontendu, u kterých firmy výslovně počítají se začátečníkem. Aktualizováno 16. 9. 2026.</p>

      <ul class="jobs">
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 150" aria-hidden="true">LS</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Junior frontend vývojář/ka</a></h2>
                <p class="job__company">Lanýž Studio, Brno</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Junior frontend vývojář/ka">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Brno</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Hybridně</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">React</li>
              <li class="tag">CSS</li>
              <li class="tag">Přístupnost</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">45 000–55 000 Kč</p>
              <time class="job__posted" datetime="2026-09-14">před 2 dny</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 40" aria-hidden="true">CH</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Vývojář/ka webových aplikací pro rezervační systém horských chat</a></h2>
                <p class="job__company">Chalupník, Trutnov</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Vývojář/ka webových aplikací pro rezervační systém horských chat">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1Zm1 2v7h14V7H5ZM1 18h22v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1Z"/></svg>Na dálku</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Next.js</li>
              <li class="tag">TypeScript</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">50 000–60 000 Kč</p>
              <time class="job__posted" datetime="2026-09-15">včera</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 250" aria-hidden="true">JM</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Frontend developer pro jízdní řády</a></h2>
                <p class="job__company">Jízdenky Morava, Olomouc</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Frontend developer pro jízdní řády">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Olomouc</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Na místě</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Zkrácený úvazek 30 h</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></svg>Nástup ihned</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Vue</li>
              <li class="tag">Design systém</li>
              <li class="tag">Testování</li>
              <li class="tag">Přístupnost</li>
              <li class="tag">Git</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">38 000–46 000 Kč</p>
              <time class="job__posted" datetime="2026-09-09">před týdnem</time>
            </footer>
          </article>
        </li>
      </ul>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
/* ---------- Tokeny z návrhu (kolekce Primitives a Semantic) ---------- */

:root {
  color-scheme: light dark;

  --gray-0: oklch(1 0 0);
  --gray-50: oklch(0.984 0.003 250);
  --gray-100: oklch(0.955 0.006 250);
  --gray-200: oklch(0.91 0.01 250);
  --gray-400: oklch(0.72 0.02 250);
  --gray-500: oklch(0.6 0.02 250);
  --gray-600: oklch(0.48 0.02 250);
  --gray-800: oklch(0.29 0.02 250);
  --gray-900: oklch(0.21 0.02 250);
  --gray-950: oklch(0.155 0.015 250);
  --violet-100: oklch(0.94 0.04 285);
  --violet-300: oklch(0.8 0.1 285);
  --violet-600: oklch(0.51 0.17 285);
  --violet-900: oklch(0.31 0.09 285);

  --color-page: light-dark(var(--gray-50), var(--gray-950));
  --color-raised: light-dark(var(--gray-0), var(--gray-900));
  --color-border: light-dark(var(--gray-200), var(--gray-800));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-accent: light-dark(var(--violet-600), var(--violet-300));
  --color-accent-soft: light-dark(var(--violet-100), var(--violet-900));
  --color-tag: light-dark(var(--gray-100), var(--gray-800));
  --color-focus: var(--color-accent);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-16: 4rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
}

/* ---------- Stránka (mimo komponentu) ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-page);
}

.site-header,
.page {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.theme-toggle {
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--gray-500);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  padding-block: var(--space-8) var(--space-16);
}

.page__title {
  margin: 0;
  font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.page__lead {
  max-width: 40rem;
  margin: var(--space-2) 0 var(--space-8);
  color: var(--color-text-muted);
}

.jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ---------- Reset a hotové části komponenty ---------- */

.job h2,
.job p,
.job ul {
  margin: 0;
}

.job ul {
  padding: 0;
  list-style: none;
}

.job__logo {
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: light-dark(oklch(0.93 0.05 var(--logo-hue)), oklch(0.33 0.06 var(--logo-hue)));
  color: light-dark(oklch(0.42 0.11 var(--logo-hue)), oklch(0.86 0.08 var(--logo-hue)));
  font-weight: 700;
}

.job__title a {
  color: inherit;
  text-decoration: none;
}

.job__title a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.job__save {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.tag {
  padding: var(--space-1) 0.625rem;
  border-radius: 999px;
  background: var(--color-tag);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}

/* ---------- Komponenta Job card podle návrhu ---------- */

.job {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-raised);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.job:hover {
  border-color: var(--color-accent);
  box-shadow: 0 12px 32px -16px oklch(from var(--color-accent) 0.3 c h / 0.45);
}

.job__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.job__logo {
  flex: none;
  width: 3rem;
  height: 3rem;
}

.job__heading {
  flex: 1;
  min-width: 0;
}

.job__title {
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: calc(24 / 18);
}

.job__company,
.job__fact,
.job__posted {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: calc(20 / 14);
}

.job__save {
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  transition: background-color 150ms ease;
}

.job__save:hover {
  background: var(--color-accent-soft);
}

.job__save-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.job__title a:focus-visible,
.job__save:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.job__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.job__fact {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.job__icon {
  flex: none;
  width: 1rem;
  height: 1rem;
}

.job__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.job__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.job__salary {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

# --approaches--

## --approach-- Flexbox, tokeny a opravené SVG v HTML

Každá skupina z auto layoutu je flex kontejner, hodnoty jsou tokeny stupnice a ikony mají v HTML `fill="currentColor"` a `aria-hidden="true"`. Tlačítko dostalo `aria-label` s názvem pozice, takže čtečka v seznamu nabídek rozliší, kterou kartu ukládáš. Nejbližší překlad návrhu a nejsnazší na údržbu v týmu.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nástupka — práce z frontendu pro juniory</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Nástupka</a>
      <button class="theme-toggle" type="button" aria-pressed="false">Tmavý motiv</button>
    </header>

    <main class="page">
      <h1 class="page__title">Nabídky pro juniory</h1>
      <p class="page__lead">Pozice z frontendu, u kterých firmy výslovně počítají se začátečníkem. Aktualizováno 16. 9. 2026.</p>

      <ul class="jobs">
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 150" aria-hidden="true">LS</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Junior frontend vývojář/ka</a></h2>
                <p class="job__company">Lanýž Studio, Brno</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Junior frontend vývojář/ka">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Brno</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Hybridně</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">React</li>
              <li class="tag">CSS</li>
              <li class="tag">Přístupnost</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">45 000–55 000 Kč</p>
              <time class="job__posted" datetime="2026-09-14">před 2 dny</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 40" aria-hidden="true">CH</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Vývojář/ka webových aplikací pro rezervační systém horských chat</a></h2>
                <p class="job__company">Chalupník, Trutnov</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Vývojář/ka webových aplikací pro rezervační systém horských chat">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1Zm1 2v7h14V7H5ZM1 18h22v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1Z"/></svg>Na dálku</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Next.js</li>
              <li class="tag">TypeScript</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">50 000–60 000 Kč</p>
              <time class="job__posted" datetime="2026-09-15">včera</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 250" aria-hidden="true">JM</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Frontend developer pro jízdní řády</a></h2>
                <p class="job__company">Jízdenky Morava, Olomouc</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Frontend developer pro jízdní řády">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Olomouc</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Na místě</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Zkrácený úvazek 30 h</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></svg>Nástup ihned</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Vue</li>
              <li class="tag">Design systém</li>
              <li class="tag">Testování</li>
              <li class="tag">Přístupnost</li>
              <li class="tag">Git</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">38 000–46 000 Kč</p>
              <time class="job__posted" datetime="2026-09-09">před týdnem</time>
            </footer>
          </article>
        </li>
      </ul>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
/* ---------- Tokeny z návrhu (kolekce Primitives a Semantic) ---------- */

:root {
  color-scheme: light dark;

  --gray-0: oklch(1 0 0);
  --gray-50: oklch(0.984 0.003 250);
  --gray-100: oklch(0.955 0.006 250);
  --gray-200: oklch(0.91 0.01 250);
  --gray-400: oklch(0.72 0.02 250);
  --gray-500: oklch(0.6 0.02 250);
  --gray-600: oklch(0.48 0.02 250);
  --gray-800: oklch(0.29 0.02 250);
  --gray-900: oklch(0.21 0.02 250);
  --gray-950: oklch(0.155 0.015 250);
  --violet-100: oklch(0.94 0.04 285);
  --violet-300: oklch(0.8 0.1 285);
  --violet-600: oklch(0.51 0.17 285);
  --violet-900: oklch(0.31 0.09 285);

  --color-page: light-dark(var(--gray-50), var(--gray-950));
  --color-raised: light-dark(var(--gray-0), var(--gray-900));
  --color-border: light-dark(var(--gray-200), var(--gray-800));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-accent: light-dark(var(--violet-600), var(--violet-300));
  --color-accent-soft: light-dark(var(--violet-100), var(--violet-900));
  --color-tag: light-dark(var(--gray-100), var(--gray-800));
  --color-focus: var(--color-accent);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-16: 4rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
}

/* ---------- Stránka (mimo komponentu) ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-page);
}

.site-header,
.page {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.theme-toggle {
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--gray-500);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  padding-block: var(--space-8) var(--space-16);
}

.page__title {
  margin: 0;
  font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.page__lead {
  max-width: 40rem;
  margin: var(--space-2) 0 var(--space-8);
  color: var(--color-text-muted);
}

.jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ---------- Reset a hotové části komponenty ---------- */

.job h2,
.job p,
.job ul {
  margin: 0;
}

.job ul {
  padding: 0;
  list-style: none;
}

.job__logo {
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: light-dark(oklch(0.93 0.05 var(--logo-hue)), oklch(0.33 0.06 var(--logo-hue)));
  color: light-dark(oklch(0.42 0.11 var(--logo-hue)), oklch(0.86 0.08 var(--logo-hue)));
  font-weight: 700;
}

.job__title a {
  color: inherit;
  text-decoration: none;
}

.job__title a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.job__save {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.tag {
  padding: var(--space-1) 0.625rem;
  border-radius: 999px;
  background: var(--color-tag);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}

/* ---------- Komponenta Job card podle návrhu ---------- */

.job {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-raised);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.job:hover {
  border-color: var(--color-accent);
  box-shadow: 0 12px 32px -16px oklch(from var(--color-accent) 0.3 c h / 0.45);
}

.job__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.job__logo {
  flex: none;
  width: 3rem;
  height: 3rem;
}

.job__heading {
  flex: 1;
  min-width: 0;
}

.job__title {
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: calc(24 / 18);
}

.job__company,
.job__fact,
.job__posted {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: calc(20 / 14);
}

.job__save {
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  transition: background-color 150ms ease;
}

.job__save:hover {
  background: var(--color-accent-soft);
}

.job__save-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.job__title a:focus-visible,
.job__save:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.job__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.job__fact {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.job__icon {
  flex: none;
  width: 1rem;
  height: 1rem;
}

.job__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.job__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.job__salary {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

## --approach-- Mřížka v hlavičce a barvy ikon přes CSS

Hlavička je mřížka se sloupci `3rem minmax(0, 1fr) 2.5rem`, takže logo i tlačítko drží velikost bez `flex: none`. Ikony zůstaly, jak přišly z exportu, jen dostaly `aria-hidden`, a barvu jim přepíše pravidlo `path { fill: currentColor }`. Tlačítko má skrytý text místo `aria-label`. Hodí se, když SVG přichází z CMS nebo knihovny a do HTML nesmíš sahat.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nástupka — práce z frontendu pro juniory</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Nástupka</a>
      <button class="theme-toggle" type="button" aria-pressed="false">Tmavý motiv</button>
    </header>

    <main class="page">
      <h1 class="page__title">Nabídky pro juniory</h1>
      <p class="page__lead">Pozice z frontendu, u kterých firmy výslovně počítají se začátečníkem. Aktualizováno 16. 9. 2026.</p>

      <ul class="jobs">
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 150" aria-hidden="true">LS</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Junior frontend vývojář/ka</a></h2>
                <p class="job__company">Lanýž Studio, Brno</p>
              </div>
              <button class="job__save" type="button">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4F46E5" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
                <span class="visually-hidden">Uložit nabídku</span>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Brno</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Hybridně</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">React</li>
              <li class="tag">CSS</li>
              <li class="tag">Přístupnost</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">45 000–55 000 Kč</p>
              <time class="job__posted" datetime="2026-09-14">před 2 dny</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 40" aria-hidden="true">CH</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Vývojář/ka webových aplikací pro rezervační systém horských chat</a></h2>
                <p class="job__company">Chalupník, Trutnov</p>
              </div>
              <button class="job__save" type="button">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4F46E5" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
                <span class="visually-hidden">Uložit nabídku</span>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1Zm1 2v7h14V7H5ZM1 18h22v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1Z"/></svg>Na dálku</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Next.js</li>
              <li class="tag">TypeScript</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">50 000–60 000 Kč</p>
              <time class="job__posted" datetime="2026-09-15">včera</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 250" aria-hidden="true">JM</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Frontend developer pro jízdní řády</a></h2>
                <p class="job__company">Jízdenky Morava, Olomouc</p>
              </div>
              <button class="job__save" type="button">
                <svg class="job__save-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4F46E5" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></svg>
                <span class="visually-hidden">Uložit nabídku</span>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>Olomouc</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></svg>Na místě</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>Zkrácený úvazek 30 h</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#64748B" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></svg>Nástup ihned</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Vue</li>
              <li class="tag">Design systém</li>
              <li class="tag">Testování</li>
              <li class="tag">Přístupnost</li>
              <li class="tag">Git</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">38 000–46 000 Kč</p>
              <time class="job__posted" datetime="2026-09-09">před týdnem</time>
            </footer>
          </article>
        </li>
      </ul>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
/* ---------- Tokeny z návrhu (kolekce Primitives a Semantic) ---------- */

:root {
  color-scheme: light dark;

  --gray-0: oklch(1 0 0);
  --gray-50: oklch(0.984 0.003 250);
  --gray-100: oklch(0.955 0.006 250);
  --gray-200: oklch(0.91 0.01 250);
  --gray-400: oklch(0.72 0.02 250);
  --gray-500: oklch(0.6 0.02 250);
  --gray-600: oklch(0.48 0.02 250);
  --gray-800: oklch(0.29 0.02 250);
  --gray-900: oklch(0.21 0.02 250);
  --gray-950: oklch(0.155 0.015 250);
  --violet-100: oklch(0.94 0.04 285);
  --violet-300: oklch(0.8 0.1 285);
  --violet-600: oklch(0.51 0.17 285);
  --violet-900: oklch(0.31 0.09 285);

  --color-page: light-dark(var(--gray-50), var(--gray-950));
  --color-raised: light-dark(var(--gray-0), var(--gray-900));
  --color-border: light-dark(var(--gray-200), var(--gray-800));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-accent: light-dark(var(--violet-600), var(--violet-300));
  --color-accent-soft: light-dark(var(--violet-100), var(--violet-900));
  --color-tag: light-dark(var(--gray-100), var(--gray-800));
  --color-focus: var(--color-accent);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-16: 4rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
}

/* ---------- Stránka (mimo komponentu) ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-page);
}

.site-header,
.page {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.theme-toggle {
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--gray-500);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  padding-block: var(--space-8) var(--space-16);
}

.page__title {
  margin: 0;
  font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.page__lead {
  max-width: 40rem;
  margin: var(--space-2) 0 var(--space-8);
  color: var(--color-text-muted);
}

.jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ---------- Reset a hotové části komponenty ---------- */

.job h2,
.job p,
.job ul {
  margin: 0;
}

.job ul {
  padding: 0;
  list-style: none;
}

.job__logo {
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: light-dark(oklch(0.93 0.05 var(--logo-hue)), oklch(0.33 0.06 var(--logo-hue)));
  color: light-dark(oklch(0.42 0.11 var(--logo-hue)), oklch(0.86 0.08 var(--logo-hue)));
  font-weight: 700;
}

.job__title a {
  color: inherit;
  text-decoration: none;
}

.job__title a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.job__save {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.tag {
  padding: var(--space-1) 0.625rem;
  border-radius: 999px;
  background: var(--color-tag);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}

/* ---------- Komponenta Job card podle návrhu ---------- */

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.job {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-raised);
  transition: border-color 150ms ease;
}

.job:hover {
  border-color: var(--color-accent);
}

.job__header {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) 2.5rem;
  align-items: start;
  column-gap: 0.75rem;
}

.job__logo {
  aspect-ratio: 1;
}

.job__title {
  font-size: 1.125rem;
  font-weight: 650;
  line-height: 1.5rem;
}

.job__company,
.job__fact,
.job__posted {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.job__save {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  color: var(--color-accent);
}

.job__save:hover {
  background-color: var(--color-accent-soft);
}

.job__save:focus-visible,
.job__title a:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.job__save-icon {
  width: 20px;
  height: 20px;
}

/* Ikony z Dev Mode mají barvu v atributu fill, pravidlo v CSS ho přebije. */
.job__save-icon path,
.job__icon path {
  fill: currentColor;
}

.job__meta,
.job__tags {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.5rem;
  row-gap: 0.5rem;
}

.job__meta {
  column-gap: 1rem;
}

.job__fact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.job__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.job__footer {
  display: flex;
  align-items: center;
}

.job__posted {
  margin-inline-start: auto;
}

.job__salary {
  font-weight: 700;
}
```

## --approach-- Sprite se symboly

Kresby jsou jednou v skrytém `<svg>` se `<symbol>` a karty na ně odkazují přes `<use href>`. U třiceti karet na stránce to znamená jednu kopii každé ikony místo třiceti. CSS je stejné jako v prvním přístupu, jen logo a blok s názvem mají rozepsané `flex` hodnoty.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nástupka — práce z frontendu pro juniory</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <svg hidden>
      <symbol id="icon-pin" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></symbol>
      <symbol id="icon-home" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z"/></symbol>
      <symbol id="icon-laptop" viewBox="0 0 24 24"><path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1Zm1 2v7h14V7H5ZM1 18h22v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1Z"/></symbol>
      <symbol id="icon-clock" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 3h-2v6l5 3 1-1.7-4-2.3V7Z"/></symbol>
      <symbol id="icon-cal" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></symbol>
      <symbol id="icon-bookmark" viewBox="0 0 24 24"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Zm1 2v12.3l5-3.2 5 3.2V5H7Z"/></symbol>
    </svg>

    <header class="site-header">
      <a class="logo" href="#">Nástupka</a>
      <button class="theme-toggle" type="button" aria-pressed="false">Tmavý motiv</button>
    </header>

    <main class="page">
      <h1 class="page__title">Nabídky pro juniory</h1>
      <p class="page__lead">Pozice z frontendu, u kterých firmy výslovně počítají se začátečníkem. Aktualizováno 16. 9. 2026.</p>

      <ul class="jobs">
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 150" aria-hidden="true">LS</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Junior frontend vývojář/ka</a></h2>
                <p class="job__company">Lanýž Studio, Brno</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Junior frontend vývojář/ka">
                <svg class="job__save-icon" width="24" height="24" aria-hidden="true"><use href="#icon-bookmark"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-pin"/></svg>Brno</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-home"/></svg>Hybridně</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-clock"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">React</li>
              <li class="tag">CSS</li>
              <li class="tag">Přístupnost</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">45 000–55 000 Kč</p>
              <time class="job__posted" datetime="2026-09-14">před 2 dny</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 40" aria-hidden="true">CH</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Vývojář/ka webových aplikací pro rezervační systém horských chat</a></h2>
                <p class="job__company">Chalupník, Trutnov</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Vývojář/ka webových aplikací pro rezervační systém horských chat">
                <svg class="job__save-icon" width="24" height="24" aria-hidden="true"><use href="#icon-bookmark"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-laptop"/></svg>Na dálku</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-clock"/></svg>Plný úvazek</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Next.js</li>
              <li class="tag">TypeScript</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">50 000–60 000 Kč</p>
              <time class="job__posted" datetime="2026-09-15">včera</time>
            </footer>
          </article>
        </li>
        <li>
          <article class="job">
            <header class="job__header">
              <span class="job__logo" style="--logo-hue: 250" aria-hidden="true">JM</span>
              <div class="job__heading">
                <h2 class="job__title"><a href="#">Frontend developer pro jízdní řády</a></h2>
                <p class="job__company">Jízdenky Morava, Olomouc</p>
              </div>
              <button class="job__save" type="button" aria-label="Uložit nabídku Frontend developer pro jízdní řády">
                <svg class="job__save-icon" width="24" height="24" aria-hidden="true"><use href="#icon-bookmark"/></svg>
              </button>
            </header>
            <ul class="job__meta">
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-pin"/></svg>Olomouc</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-home"/></svg>Na místě</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-clock"/></svg>Zkrácený úvazek 30 h</li>
              <li class="job__fact"><svg class="job__icon" width="24" height="24" aria-hidden="true"><use href="#icon-cal"/></svg>Nástup ihned</li>
            </ul>
            <ul class="job__tags" aria-label="Technologie">
              <li class="tag">Vue</li>
              <li class="tag">Design systém</li>
              <li class="tag">Testování</li>
              <li class="tag">Přístupnost</li>
              <li class="tag">Git</li>
            </ul>
            <footer class="job__footer">
              <p class="job__salary">38 000–46 000 Kč</p>
              <time class="job__posted" datetime="2026-09-09">před týdnem</time>
            </footer>
          </article>
        </li>
      </ul>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
/* ---------- Tokeny z návrhu (kolekce Primitives a Semantic) ---------- */

:root {
  color-scheme: light dark;

  --gray-0: oklch(1 0 0);
  --gray-50: oklch(0.984 0.003 250);
  --gray-100: oklch(0.955 0.006 250);
  --gray-200: oklch(0.91 0.01 250);
  --gray-400: oklch(0.72 0.02 250);
  --gray-500: oklch(0.6 0.02 250);
  --gray-600: oklch(0.48 0.02 250);
  --gray-800: oklch(0.29 0.02 250);
  --gray-900: oklch(0.21 0.02 250);
  --gray-950: oklch(0.155 0.015 250);
  --violet-100: oklch(0.94 0.04 285);
  --violet-300: oklch(0.8 0.1 285);
  --violet-600: oklch(0.51 0.17 285);
  --violet-900: oklch(0.31 0.09 285);

  --color-page: light-dark(var(--gray-50), var(--gray-950));
  --color-raised: light-dark(var(--gray-0), var(--gray-900));
  --color-border: light-dark(var(--gray-200), var(--gray-800));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-accent: light-dark(var(--violet-600), var(--violet-300));
  --color-accent-soft: light-dark(var(--violet-100), var(--violet-900));
  --color-tag: light-dark(var(--gray-100), var(--gray-800));
  --color-focus: var(--color-accent);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-16: 4rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
}

/* ---------- Stránka (mimo komponentu) ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-page);
}

.site-header,
.page {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.theme-toggle {
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--gray-500);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  padding-block: var(--space-8) var(--space-16);
}

.page__title {
  margin: 0;
  font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.page__lead {
  max-width: 40rem;
  margin: var(--space-2) 0 var(--space-8);
  color: var(--color-text-muted);
}

.jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ---------- Reset a hotové části komponenty ---------- */

.job h2,
.job p,
.job ul {
  margin: 0;
}

.job ul {
  padding: 0;
  list-style: none;
}

.job__logo {
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: light-dark(oklch(0.93 0.05 var(--logo-hue)), oklch(0.33 0.06 var(--logo-hue)));
  color: light-dark(oklch(0.42 0.11 var(--logo-hue)), oklch(0.86 0.08 var(--logo-hue)));
  font-weight: 700;
}

.job__title a {
  color: inherit;
  text-decoration: none;
}

.job__title a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.job__save {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.tag {
  padding: var(--space-1) 0.625rem;
  border-radius: 999px;
  background: var(--color-tag);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}

/* ---------- Komponenta Job card podle návrhu ---------- */

.job {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-raised);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.job:hover {
  border-color: var(--color-accent);
  box-shadow: 0 12px 32px -16px oklch(from var(--color-accent) 0.3 c h / 0.45);
}

.job__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.job__logo {
  flex: 0 0 3rem;
  height: 3rem;
}

.job__heading {
  flex: 1 1 0;
  min-width: 0;
}

.job__title {
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: calc(24 / 18);
}

.job__company,
.job__fact,
.job__posted {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: calc(20 / 14);
}

.job__save {
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  transition: background-color 150ms ease;
}

.job__save:hover {
  background: var(--color-accent-soft);
}

.job__save-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.job__title a:focus-visible,
.job__save:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.job__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.job__fact {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.job__icon {
  flex: none;
  width: 1rem;
  height: 1rem;
}

.job__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.job__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.job__salary {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

# --review--

Testy kontrolují rozměry, barvy a přístupnost. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Hodnoty ze specifikace jsou v CSS jako tokeny nebo jako čísla, u kterých je vidět, odkud přišla (`calc(24 / 18)`), ne jako náhodné zaokrouhlení.
- Žádná komponenta nepoužívá primitivní token (`--gray-600`) místo sémantického.
- Kartu jsi prošel klávesnicí: fokus je vidět na odkazu i tlačítku a pořadí dává smysl.
- Přístupné jméno tlačítka rozliší karty od sebe, když jich je na stránce víc.
- Víš, co bys návrhářce napsal jako otázku: prázdný stav, nabídka bez platu, stav „uloženo".

## --extensions--

Přidej stav „uloženo" přes `aria-pressed="true"` s plnou ikonou a barvou, kartu přes celou plochu klikací tak, aby tlačítko zůstalo samostatně ovladatelné, a jemné zvednutí karty po najetí myší, které se při `prefers-reduced-motion: reduce` vypne.
