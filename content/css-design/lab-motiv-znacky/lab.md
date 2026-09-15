---
title: Motiv pro vlastní značku
see: css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny, css-design/barvy-a-typografie#typograficka-stupnice
---

# --description--

Každý web začíná stejně: paleta, písmo a pár tokenů, na kterých pak stojí všechny komponenty. V tomhle labu navrhneš motiv pro značku sám, ve světlé i tmavé verzi.

Ukázková stránka patří servisu kol, **ale téma, texty i barvy jsou tvoje volba** — klidně z ní udělej kavárnu, knihkupectví, herní klan nebo vlastní portfolio. Komponenty v `styles.css` jsou hotové a používají jen tokeny (seznam je v komentáři na `:root`). Ty píšeš tokeny, komponenty neměň. Texty v HTML měnit smíš, třídy nech.

**Co má motiv umět:**

- Barvy palety jsou v `oklch()` a značka vychází z jedné proměnné: `--brand` (celá barva), nebo `--hue` (jen odstín). Když ji změníš, přebarví se tlačítka i štítky.
- Světlý i tmavý motiv: tlačítko v záhlaví přepíná `data-theme` a `color-scheme` na `<html>`, oboje smíš využít. Ve tmavém motivu je stránka tmavá a karty jsou o kus světlejší než stránka.
- Každý text je v obou motivech čitelný podle úrovně AA a okraj pole pro e-mail je vidět.
- Tlačítko má při najetí myší jiný odstín, na kterém text zůstane čitelný.
- Velikosti písma tvoří modulární stupnici s jedním poměrem, běžný text má aspoň 16 px a pohodlnou výšku řádku, nadpisy těsnější.

Kontrast si průběžně ověřuj v DevTools u barevného čtverečku vedle `color`. Motiv přepínej tlačítkem v náhledu.

# --hints--

Všechny barvy ve `styles.css` jsou zapsané v `oklch()` (nebo odvozené přes `color-mix()`, `light-dark()`, relativní barvu či `contrast-color()`), žádné `#hex`, `rgb()` ani `hsl()`.

```js
const source = helpers.stripComments(files['styles.css'], 'css');
const legacy = source.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi);
assert.equal(legacy, null, `Ve styles.css jsou barvy mimo oklch: ${legacy?.join(', ')}`);
assert.ok((source.match(/oklch\(/g) ?? []).length >= 2, 'Ve styles.css mají být barvy palety zapsané přes oklch()');
```

Ve světlém motivu mají všechny texty s pozadím kontrast aspoň 4,5 : 1 (text, perex, popisy karet, tlačítko, odkaz, štítek).

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
theme('light');
checkPairs('Světlý motiv');
```

Ve světlém motivu má okraj pole pro e-mail s pozadím formuláře kontrast aspoň 3 : 1.

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
theme('light');
const ratio = contrast(css('.input', 'borderTopColor'), css('.newsletter', 'backgroundColor'));
assert.ok(ratio >= 3, `Světlý motiv: okraj pole má kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 3 : 1`);
```

Ve světlém motivu je stránka světlá: pozadí stránky i karet má relativní jas aspoň 0,7.

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
theme('light');
for (const selector of ['body', '.card']) {
  const value = luminance(rgba(css(selector, 'backgroundColor')));
  assert.ok(value >= 0.7, `Světlý motiv: pozadí ${selector} má jas ${value.toFixed(2)}, čekám aspoň 0.7`);
}
```

V tmavém motivu mají všechny texty s pozadím kontrast aspoň 4,5 : 1.

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
theme('dark');
checkPairs('Tmavý motiv');
```

V tmavém motivu má okraj pole pro e-mail s pozadím formuláře kontrast aspoň 3 : 1.

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
theme('dark');
const ratio = contrast(css('.input', 'borderTopColor'), css('.newsletter', 'backgroundColor'));
assert.ok(ratio >= 3, `Tmavý motiv: okraj pole má kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 3 : 1`);
```

V tmavém motivu je stránka tmavá a karty jsou o kus světlejší než stránka.

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
theme('dark');
const page = luminance(rgba(css('body', 'backgroundColor')));
const card = luminance(rgba(css('.card', 'backgroundColor')));
assert.ok(page <= 0.05, `Tmavý motiv: pozadí stránky má jas ${page.toFixed(3)}, čekám nejvýš 0.05`);
assert.ok(card > page, `Tmavý motiv: karta (jas ${card.toFixed(3)}) má být světlejší než stránka (jas ${page.toFixed(3)})`);
```

Stav `:hover` tlačítka má jinou barvu pozadí než tlačítko a text je na ní v obou motivech čitelný (aspoň 4,5 : 1).

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
const hoverRule = helpers.cssRules('.button:hover').at(-1);
assert.ok(hoverRule, 'V CSS má zůstat pravidlo .button:hover');
for (const name of ['light', 'dark']) {
  theme(name);
  const probe = document.createElement('span');
  probe.style.background = hoverRule.style.getPropertyValue('background-color') || hoverRule.style.getPropertyValue('background');
  document.body.append(probe);
  const hover = getComputedStyle(probe).backgroundColor;
  probe.remove();
  const base = css('.button', 'backgroundColor');
  assert.notDeepEqual(rgba(hover), rgba(base), `Motiv ${name}: pozadí tlačítka při najetí myší je stejné jako bez něj (${base})`);
  const ratio = contrast(css('.button', 'color'), hover);
  assert.ok(ratio >= 4.5, `Motiv ${name}: text tlačítka na pozadí při najetí myší má kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4.5 : 1`);
}
```

Velikosti písma rostou po stupnici: odstavec < `h3` < `h2` < `h1` a každý stupeň je předchozí vynásobený stejným poměrem mezi 1,125 a 1,5.

```js
const size = (selector) => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
const sizes = [size('.card__text'), size('h3'), size('h2'), size('h1')];
const ratios = sizes.slice(1).map((value, i) => value / sizes[i]);
ratios.forEach((ratio, i) => {
  assert.ok(ratio >= 1.12 && ratio <= 1.51, `Poměr stupně ${i + 1} (${sizes.map((s) => s.toFixed(1)).join(' → ')} px) je ${ratio.toFixed(3)}, čekám mezi 1.125 a 1.5`);
  assert.ok(Math.abs(ratio - ratios[0]) <= 0.03, `Poměry stupňů jsou ${ratios.map((r) => r.toFixed(3)).join(', ')} — mají být stejné (stupnice s jedním poměrem)`);
});
```

Běžný text má aspoň 16 px a výšku řádku 1,4–1,8násobek písma, nadpisy mají výšku řádku nejvýš 1,3násobek.

```js
const ratio = (el) => parseFloat(getComputedStyle(el).lineHeight) / parseFloat(getComputedStyle(el).fontSize);
const text = document.querySelector('.card__text');
assert.ok(parseFloat(getComputedStyle(text).fontSize) >= 16, `Popis karty má písmo ${getComputedStyle(text).fontSize}, čekám aspoň 16px`);
assert.ok(ratio(text) >= 1.4 && ratio(text) <= 1.8, `Výška řádku textu je ${ratio(text).toFixed(2)}× písmo, čekám 1.4–1.8×`);
for (const heading of document.querySelectorAll('h1, h2, h3')) {
  assert.ok(ratio(heading) <= 1.3, `Nadpis „${heading.textContent}" má výšku řádku ${ratio(heading).toFixed(2)}× písmo, čekám nejvýš 1.3×`);
}
```

Barvy značky vychází z jednoho místa: když se změní barva nebo odstín značky, změní se tlačítko i štítek. Značku drží proměnná `--brand` (celá barva), nebo `--hue` (jen odstín).

```js
// Přechody vypneme, aby test četl hned cílovou barvu, ne začátek animace.
document.head.insertAdjacentHTML('beforeend', '<style>*, *::before, *::after { transition: none !important; }</style>');
const theme = (name) => { document.documentElement.dataset.theme = name; document.documentElement.style.colorScheme = name; };
const rgba = (color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
const luminance = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(rgba(a)), luminance(rgba(b))].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
const css = (selector, prop) => getComputedStyle(document.querySelector(selector))[prop];
const pairs = () => [
  ['text stránky', css('body', 'color'), css('body', 'backgroundColor')],
  ['text v kartě', css('.card h3', 'color'), css('.card', 'backgroundColor')],
  ['perex', css('.lead', 'color'), css('body', 'backgroundColor')],
  ['popis karty', css('.card__text', 'color'), css('.card', 'backgroundColor')],
  ['text tlačítka', css('.button', 'color'), css('.button', 'backgroundColor')],
  ['odkaz', css('.link', 'color'), css('body', 'backgroundColor')],
  ['štítek', css('.tag', 'color'), css('.tag', 'backgroundColor')],
];
const checkPairs = (label) => {
  for (const [name, fg, bg] of pairs()) {
    assert.equal(rgba(bg)[3], 255, `${label}: ${name} leží na průhledném pozadí (${bg}) — chybí token barvy pozadí?`);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${label}: ${name} má kontrast ${ratio.toFixed(2)} : 1 (${fg} na ${bg}), čekám aspoň 4.5 : 1`);
  }
};
theme('light');
const before = [css('.button', 'backgroundColor'), css('.tag', 'backgroundColor')].map(rgba);
const root = document.documentElement;
const styles = getComputedStyle(root);
if (styles.getPropertyValue('--brand').trim()) root.style.setProperty('--brand', 'oklch(0.5 0.15 30)');
else if (styles.getPropertyValue('--hue').trim()) root.style.setProperty('--hue', '30');
else assert.fail('Na :root chybí proměnná --brand nebo --hue, ze které se barvy značky odvozují');
const after = [css('.button', 'backgroundColor'), css('.tag', 'backgroundColor')].map(rgba);
assert.notDeepEqual(after[0], before[0], 'Po změně značky zůstalo tlačítko stejné — odvozuješ barvu tlačítka ze značky?');
assert.notDeepEqual(after[1], before[1], 'Po změně značky zůstal štítek stejný — odvozuješ barvu štítku ze značky?');
```

# --help--

## --tip-- 2

Když kontrast u tlumeného textu nevychází, neměň chromu ani odstín, jen světlost. Na světlém pozadí jdi k tmavší hodnotě L, na tmavém ke světlejší; postup je v části [Kontrast podle WCAG](see:css-design/barvy-a-typografie#kontrast-podle-wcag).

## --tip-- 11

Stupnici z jedné barvy odvodíš relativní barvou s pevnou světlostí a převzatým odstínem, viz [Stupnice odstínů z jedné barvy](see:css-design/barvy-a-typografie#stupnice-odstinu-z-jedne-barvy). Sémantické tokeny pak ukazují na stupně stupnice.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cyklo Plzeň — servis a úschova kol</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Cyklo Plzeň</a>
      <button class="theme-toggle" type="button" aria-pressed="false">Tmavý motiv</button>
    </header>

    <main class="page">
      <section class="hero">
        <p class="tag">Otevřeno i v neděli</p>
        <h1>Kolo připravené na sezónu do 48 hodin</h1>
        <p class="lead">Servis silničních, horských i elektrokol hned u hlavního nádraží. Kolo si u nás můžeš nechat i přes zimu.</p>
        <div class="hero__actions">
          <a class="button" href="#objednat">Objednat servis</a>
          <a class="link" href="#cenik">Zobrazit ceník</a>
        </div>
      </section>

      <section class="services" aria-labelledby="services-title">
        <h2 id="services-title">Co pro tvoje kolo uděláme</h2>
        <div class="cards">
          <article class="card">
            <p class="tag">Nejčastější</p>
            <h3>Jarní prohlídka</h3>
            <p class="card__text">Seřízení brzd a přehazovačky, promazání řetězu a kontrola ložisek.</p>
            <p class="card__price">890 Kč</p>
          </article>
          <article class="card">
            <p class="tag">Elektrokola</p>
            <h3>Diagnostika motoru</h3>
            <p class="card__text">Aktualizace firmwaru, test baterie a výpis chyb z řídicí jednotky.</p>
            <p class="card__price">1 290 Kč</p>
          </article>
          <article class="card">
            <p class="tag">Zima</p>
            <h3>Úschova kola</h3>
            <p class="card__text">Suchý sklad od listopadu do března, při vrácení kolo omyjeme.</p>
            <p class="card__price">1 500 Kč</p>
          </article>
        </div>
      </section>

      <form class="newsletter" id="objednat">
        <h2>Připomeneme ti jarní servis</h2>
        <label class="newsletter__label" for="email">E-mail</label>
        <div class="newsletter__row">
          <input class="input" id="email" type="email" autocomplete="email" placeholder="jana@example.cz">
          <button class="button" type="submit">Připomenout</button>
        </div>
        <p class="card__text">Pošleme jediný e-mail v březnu, nic dalšího.</p>
      </form>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
/* ---------- Tokeny motivu: tady pracuješ ---------- */

:root {
  /*
    Komponenty níž čekají tyto tokeny:

    barvy:  --color-page, --color-surface, --color-text, --color-text-muted,
            --color-border, --color-accent, --color-accent-hover,
            --color-on-accent, --color-tag-bg, --color-tag-text
    písmo:  --text-base, --text-lg, --text-xl, --text-2xl,
            --leading-body, --leading-tight
  */
}

/* ---------- Komponenty: používají jen tokeny, neměň je ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--color-text);
  background: var(--color-page);
}

h1,
h2,
h3 {
  margin: 0;
  line-height: var(--leading-tight);
  text-wrap: balance;
}

h1 {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--text-xl);
}

h3 {
  font-size: var(--text-lg);
}

p {
  margin: 0;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 64rem;
  margin-inline: auto;
  padding: 1rem 1.5rem;
}

.logo {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.theme-toggle {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1.5rem 4rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 40rem;
}

.lead {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.5rem 1.25rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.button:hover {
  background: var(--color-accent-hover);
}

.button:focus-visible,
.link:focus-visible,
.input:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.link {
  color: var(--color-accent);
  font-weight: 600;
}

.tag {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  font-size: 0.875rem;
  font-weight: 600;
}

.services {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.card__text {
  color: var(--color-text-muted);
}

.card__price {
  margin-top: auto;
  padding-top: 0.5rem;
  font-weight: 700;
}

.newsletter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.newsletter__label {
  font-weight: 600;
}

.newsletter__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.input {
  flex: 1 1 16rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}
```

## --file-- script.js

```js
// Přepínač motivu: nastaví data-theme i color-scheme na <html>.
const toggle = document.querySelector('.theme-toggle');

toggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.textContent = dark ? 'Světlý motiv' : 'Tmavý motiv';
});
```

# --solution--

## --file-- styles.css

```css
/* ---------- Tokeny motivu ---------- */

:root {
  color-scheme: light dark;

  /* Primitivní paleta: stupnice značky odvozená z jedné barvy */
  --brand: oklch(0.52 0.12 195);
  --brand-100: oklch(from var(--brand) 0.94 calc(c * 0.3) h);
  --brand-300: oklch(from var(--brand) 0.82 calc(c * 0.8) h);
  --brand-400: oklch(from var(--brand) 0.74 c h);
  --brand-600: oklch(from var(--brand) 0.47 c h);
  --brand-700: oklch(from var(--brand) 0.4 c h);
  --brand-900: oklch(from var(--brand) 0.3 calc(c * 0.6) h);

  --gray-50: oklch(0.985 0.004 250);
  --gray-100: oklch(0.955 0.006 250);
  --gray-400: oklch(0.74 0.012 250);
  --gray-500: oklch(0.6 0.014 250);
  --gray-600: oklch(0.48 0.014 250);
  --gray-900: oklch(0.23 0.014 250);
  --gray-950: oklch(0.17 0.012 250);

  /* Sémantické tokeny: světlá hodnota, tmavá hodnota */
  --color-page: light-dark(var(--gray-100), var(--gray-950));
  --color-surface: light-dark(var(--gray-50), var(--gray-900));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-border: var(--gray-500);
  --color-accent: light-dark(var(--brand-600), var(--brand-400));
  --color-accent-hover: light-dark(var(--brand-700), var(--brand-300));
  --color-on-accent: light-dark(oklch(1 0 0), var(--gray-950));
  --color-tag-bg: light-dark(var(--brand-100), var(--brand-900));
  --color-tag-text: light-dark(var(--brand-700), var(--brand-300));

  /* Písmo: modulární stupnice s poměrem 1.25 */
  --text-base: 1rem;
  --text-lg: calc(var(--text-base) * 1.25);
  --text-xl: calc(var(--text-lg) * 1.25);
  --text-2xl: calc(var(--text-xl) * 1.25);
  --leading-body: 1.6;
  --leading-tight: 1.15;
}

/* ---------- Komponenty ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--color-text);
  background: var(--color-page);
}

h1,
h2,
h3 {
  margin: 0;
  line-height: var(--leading-tight);
  text-wrap: balance;
}

h1 {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--text-xl);
}

h3 {
  font-size: var(--text-lg);
}

p {
  margin: 0;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 64rem;
  margin-inline: auto;
  padding: 1rem 1.5rem;
}

.logo {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.theme-toggle {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1.5rem 4rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 40rem;
}

.lead {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.5rem 1.25rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.button:hover {
  background: var(--color-accent-hover);
}

.button:focus-visible,
.link:focus-visible,
.input:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.link {
  color: var(--color-accent);
  font-weight: 600;
}

.tag {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  font-size: 0.875rem;
  font-weight: 600;
}

.services {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.card__text {
  color: var(--color-text-muted);
}

.card__price {
  margin-top: auto;
  padding-top: 0.5rem;
  font-weight: 700;
}

.newsletter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.newsletter__label {
  font-weight: 600;
}

.newsletter__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.input {
  flex: 1 1 16rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}
```

# --approaches--

## --approach-- Relativní barvy a `light-dark()`

Primitivní stupnice značky vzniká z `--brand` relativní barvou s pevnou světlostí a sémantické tokeny vybírají stupeň pro světlý a tmavý motiv funkcí `light-dark()`. Tmavý motiv řídí jen `color-scheme`, takže by fungoval i podle nastavení systému bez přepínače.

### --file-- styles.css

```css
/* ---------- Tokeny motivu ---------- */

:root {
  color-scheme: light dark;

  /* Primitivní paleta: stupnice značky odvozená z jedné barvy */
  --brand: oklch(0.52 0.12 195);
  --brand-100: oklch(from var(--brand) 0.94 calc(c * 0.3) h);
  --brand-300: oklch(from var(--brand) 0.82 calc(c * 0.8) h);
  --brand-400: oklch(from var(--brand) 0.74 c h);
  --brand-600: oklch(from var(--brand) 0.47 c h);
  --brand-700: oklch(from var(--brand) 0.4 c h);
  --brand-900: oklch(from var(--brand) 0.3 calc(c * 0.6) h);

  --gray-50: oklch(0.985 0.004 250);
  --gray-100: oklch(0.955 0.006 250);
  --gray-400: oklch(0.74 0.012 250);
  --gray-500: oklch(0.6 0.014 250);
  --gray-600: oklch(0.48 0.014 250);
  --gray-900: oklch(0.23 0.014 250);
  --gray-950: oklch(0.17 0.012 250);

  /* Sémantické tokeny: světlá hodnota, tmavá hodnota */
  --color-page: light-dark(var(--gray-100), var(--gray-950));
  --color-surface: light-dark(var(--gray-50), var(--gray-900));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-border: var(--gray-500);
  --color-accent: light-dark(var(--brand-600), var(--brand-400));
  --color-accent-hover: light-dark(var(--brand-700), var(--brand-300));
  --color-on-accent: light-dark(oklch(1 0 0), var(--gray-950));
  --color-tag-bg: light-dark(var(--brand-100), var(--brand-900));
  --color-tag-text: light-dark(var(--brand-700), var(--brand-300));

  /* Písmo: modulární stupnice s poměrem 1.25 */
  --text-base: 1rem;
  --text-lg: calc(var(--text-base) * 1.25);
  --text-xl: calc(var(--text-lg) * 1.25);
  --text-2xl: calc(var(--text-xl) * 1.25);
  --leading-body: 1.6;
  --leading-tight: 1.15;
}

/* ---------- Komponenty: používají jen tokeny, neměň je ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--color-text);
  background: var(--color-page);
}

h1,
h2,
h3 {
  margin: 0;
  line-height: var(--leading-tight);
  text-wrap: balance;
}

h1 {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--text-xl);
}

h3 {
  font-size: var(--text-lg);
}

p {
  margin: 0;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 64rem;
  margin-inline: auto;
  padding: 1rem 1.5rem;
}

.logo {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.theme-toggle {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1.5rem 4rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 40rem;
}

.lead {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.5rem 1.25rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.button:hover {
  background: var(--color-accent-hover);
}

.button:focus-visible,
.link:focus-visible,
.input:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.link {
  color: var(--color-accent);
  font-weight: 600;
}

.tag {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  font-size: 0.875rem;
  font-weight: 600;
}

.services {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.card__text {
  color: var(--color-text-muted);
}

.card__price {
  margin-top: auto;
  padding-top: 0.5rem;
  font-weight: 700;
}

.newsletter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.newsletter__label {
  font-weight: 600;
}

.newsletter__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.input {
  flex: 1 1 16rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}
```

## --approach-- `color-mix()` a tokeny přepsané přes `data-theme`

Světlé odstíny se míchají z barvy značky a papíru, tmavý motiv je samostatný blok `:root[data-theme="dark"]`, který přepíše stejné sémantické tokeny. Je to čitelné i pro někoho, kdo `light-dark()` nezná, ale tmavý motiv platí jen s přepínačem; podle systému by potřeboval ještě media dotaz.

### --file-- styles.css

```css
/* ---------- Tokeny motivu ---------- */

:root {
  color-scheme: light;

  /* Značka a neutrální barvy */
  --brand: oklch(0.5 0.14 40);
  --ink: oklch(0.22 0.02 40);
  --paper: oklch(0.975 0.01 70);

  /* Světlý motiv: odstíny namíchané z jedné barvy značky */
  --color-page: color-mix(in oklch, var(--paper), var(--brand) 6%);
  --color-surface: var(--paper);
  --color-text: var(--ink);
  --color-text-muted: color-mix(in oklch, var(--ink) 72%, var(--paper));
  --color-border: color-mix(in oklch, var(--ink) 50%, var(--paper));
  --color-accent: var(--brand);
  --color-accent-hover: color-mix(in oklch, var(--brand), black 20%);
  --color-on-accent: oklch(1 0 0);
  --color-tag-bg: color-mix(in oklch, var(--brand) 14%, var(--paper));
  --color-tag-text: color-mix(in oklch, var(--brand), black 25%);

  /* Písmo: stupnice s poměrem 1.333 */
  --text-base: 1.0625rem;
  --text-lg: calc(var(--text-base) * 1.333);
  --text-xl: calc(var(--text-lg) * 1.333);
  --text-2xl: calc(var(--text-xl) * 1.333);
  --leading-body: 1.55;
  --leading-tight: 1.1;
}

/* Tmavý motiv: jen jiné hodnoty týchž sémantických tokenů */
:root[data-theme="dark"] {
  color-scheme: dark;

  --color-page: oklch(0.16 0.015 40);
  --color-surface: oklch(0.22 0.02 40);
  --color-text: oklch(0.96 0.01 70);
  --color-text-muted: oklch(0.78 0.02 60);
  --color-border: oklch(0.55 0.02 40);
  --color-accent: oklch(from var(--brand) 0.76 calc(c * 0.9) h);
  --color-accent-hover: oklch(from var(--brand) 0.84 calc(c * 0.7) h);
  --color-on-accent: oklch(0.18 0.02 40);
  --color-tag-bg: oklch(from var(--brand) 0.32 calc(c * 0.5) h);
  --color-tag-text: oklch(from var(--brand) 0.86 calc(c * 0.6) h);
}

/* ---------- Komponenty: používají jen tokeny, neměň je ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--color-text);
  background: var(--color-page);
}

h1,
h2,
h3 {
  margin: 0;
  line-height: var(--leading-tight);
  text-wrap: balance;
}

h1 {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--text-xl);
}

h3 {
  font-size: var(--text-lg);
}

p {
  margin: 0;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 64rem;
  margin-inline: auto;
  padding: 1rem 1.5rem;
}

.logo {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.theme-toggle {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1.5rem 4rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 40rem;
}

.lead {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.5rem 1.25rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.button:hover {
  background: var(--color-accent-hover);
}

.button:focus-visible,
.link:focus-visible,
.input:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.link {
  color: var(--color-accent);
  font-weight: 600;
}

.tag {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  font-size: 0.875rem;
  font-weight: 600;
}

.services {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.card__text {
  color: var(--color-text-muted);
}

.card__price {
  margin-top: auto;
  padding-top: 0.5rem;
  font-weight: 700;
}

.newsletter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.newsletter__label {
  font-weight: 600;
}

.newsletter__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.input {
  flex: 1 1 16rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}
```

## --approach-- Jeden odstín `--hue` a `contrast-color()`

Celá paleta je jen světlost a chroma podle úrovně s jedním společným odstínem, takže změna `--hue` přebarví všechno. Barvu textu na tlačítku vybere prohlížeč přes `contrast-color()`. Hodí se na rychlé prototypy a vícebarevné varianty; u středně tmavého akcentu ale `contrast-color()` 4,5 : 1 nezaručí, proto má akcent světlost daleko od středu.

### --file-- styles.css

```css
/* ---------- Tokeny motivu ---------- */

:root {
  color-scheme: light dark;

  /* Jediný vstup značky: odstín */
  --hue: 285;

  /* Světlost podle úrovně, chroma a odstín pro celou stupnici */
  --color-page: light-dark(oklch(0.96 0.01 var(--hue)), oklch(0.16 0.02 var(--hue)));
  --color-surface: light-dark(oklch(0.995 0.004 var(--hue)), oklch(0.22 0.025 var(--hue)));
  --color-text: light-dark(oklch(0.2 0.03 var(--hue)), oklch(0.97 0.01 var(--hue)));
  --color-text-muted: light-dark(oklch(0.47 0.03 var(--hue)), oklch(0.76 0.03 var(--hue)));
  --color-border: light-dark(oklch(0.62 0.03 var(--hue)), oklch(0.56 0.03 var(--hue)));
  --color-accent: light-dark(oklch(0.48 0.16 var(--hue)), oklch(0.78 0.12 var(--hue)));
  --color-accent-hover: light-dark(oklch(0.4 0.16 var(--hue)), oklch(0.86 0.09 var(--hue)));
  /* Bílá, nebo černá podle toho, co má s akcentem větší kontrast */
  --color-on-accent: contrast-color(var(--color-accent));
  --color-tag-bg: light-dark(oklch(0.93 0.04 var(--hue)), oklch(0.32 0.07 var(--hue)));
  --color-tag-text: light-dark(oklch(0.42 0.14 var(--hue)), oklch(0.88 0.06 var(--hue)));

  /* Písmo: stupnice s poměrem 1.2 */
  --text-base: 1rem;
  --text-lg: 1.2rem;
  --text-xl: 1.44rem;
  --text-2xl: 1.728rem;
  --leading-body: 1.65;
  --leading-tight: 1.2;
}

/* ---------- Komponenty: používají jen tokeny, neměň je ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--color-text);
  background: var(--color-page);
}

h1,
h2,
h3 {
  margin: 0;
  line-height: var(--leading-tight);
  text-wrap: balance;
}

h1 {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--text-xl);
}

h3 {
  font-size: var(--text-lg);
}

p {
  margin: 0;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 64rem;
  margin-inline: auto;
  padding: 1rem 1.5rem;
}

.logo {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.theme-toggle {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1.5rem 4rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 40rem;
}

.lead {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.5rem 1.25rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.button:hover {
  background: var(--color-accent-hover);
}

.button:focus-visible,
.link:focus-visible,
.input:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.link {
  color: var(--color-accent);
  font-weight: 600;
}

.tag {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  font-size: 0.875rem;
  font-weight: 600;
}

.services {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.card__text {
  color: var(--color-text-muted);
}

.card__price {
  margin-top: auto;
  padding-top: 0.5rem;
  font-weight: 700;
}

.newsletter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: 1rem;
  background: var(--color-surface);
}

.newsletter__label {
  font-weight: 600;
}

.newsletter__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.input {
  flex: 1 1 16rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}
```

# --review--

Testy kontrolují kontrast a stupnici. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Komponenty nepoužívají primitivní tokeny ani barvy natvrdo, jen sémantické tokeny.
- Názvy sémantických tokenů říkají účel, ne barvu (`--color-accent`, ne `--color-teal`).
- Tmavý motiv jsi prošel celý očima, nejen testy: žádná barva „nesvítí" a karty jsou vidět.
- Stupnici písma umíš popsat jednou větou: základ, poměr a kolik stupňů.
- Víš, který z přístupů bys zvolil pro velký projekt s více značkami a proč.

## --extensions--

Přidej třetí motiv „vysoký kontrast" přes `@media (prefers-contrast: more)`, druhou barvu značky pro upozornění a chyby (odstín kolem 25) a stupnici písma, která na širokých obrazovkách plynule roste přes `clamp()`.
