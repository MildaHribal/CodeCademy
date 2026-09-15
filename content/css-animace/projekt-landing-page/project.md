---
title: "Landing page aplikace Dělenka"
see: css-animace/workshop-interakce/009, css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion, css-animace/view-transitions-scroll#prechody-mezi-strankami-view-transition
timeoutMs: 15000
---

# --description--

## Zadání

Brněnský startup Dělenka vyvíjí aplikaci, která partě spočítá společné výdaje: kdo komu kolik dluží po chatě, dovolené nebo měsíci ve společném bytě. Aplikace je hotová, chybí úvodní stránka, na kterou povede reklama i odkaz z App Storu. Klient poslal texty (`predloha.md`), designérka popis návrhu (`navrh.md`). Stránku postavíš celou sama nebo sám: HTML i CSS, bez knihoven.

Tohle je vlajkový projekt celé části o webu a CSS a patří do portfolia. Postavíš ho ve VS Code, zkontroluješ tady a nasadíš na GitHub Pages.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku projektu ve VS Code.
2. Přečti si `predloha.md` a `navrh.md`. Než napíšeš první řádek CSS, napiš celé HTML: sekce, nadpisy, seznamy a třídy z technických požadavků.
3. Piš mobile-first: nejdřív stránka na telefonu, pak media dotazy pro širší okna.
4. Náhled vidíš tady v Akademii, přepínač šířky nad ním má i 768 a 375 px. Když máš hotovou sekci, klikni na **Zkontrolovat**.
5. Na konci doplň do `README.md` oddíl „Rozhodnutí" a adresu nasazené stránky.

## Uživatelské příběhy

- Návštěvník na telefonu vidí stránku v jednom sloupci, nic nevyčuhuje z okna a do tlačítek se pohodlně trefí prstem.
- Na tabletu a počítači se funkce, recenze a ceník rozloží vedle sebe podle tabulky rozvržení v návrhu.
- Kdo klikne na „Stáhnout aplikaci", uvidí nabídku s obchody. Nabídka plynule vyjede a stejně zmizí; zavře ji Escape i kliknutí vedle.
- Karta funkce se sama rozhodne, jestli má ikonu vedle textu, nebo nad ním, podle toho, kolik místa dostala.
- V ceníku jde tarify porovnat pohledem: stejná výška, tlačítka na jedné lince, prostřední tarif zvýrazněný.
- V častých otázkách je otevřená vždy jen jedna odpověď.
- Stránka se přizpůsobí světlému i tmavému režimu systému a text se dá přečíst v obou.
- Kdo prochází stránku klávesnicí, vždycky vidí, kde je fokus.
- Kdo má v systému zapnuté omezení pohybu, nevidí nic vyjíždět, zvedat ani rotovat. Prolínání a změny barev zůstávají.

## Technické požadavky

- Struktura a třídy podle `predloha.md` (testy hledají `header.site-header`, `.logo`, `nav`, `main`, `footer.site-footer`, `.download-button`, `#download-menu`, `.features` s kartami `.feature` a v nich `.feature__icon` a `.feature__body`, `.reviews` s `.review`, `.plans` s `.plan`, `.plan--featured` a `.plan__button`, `details.faq__item` a sekce `#funkce`, `#recenze`, `#cenik`, `#faq`).
- Celé CSS je v jednom souboru `styles.css`, začíná pravidlem s pořadím aspoň tří [kaskádových vrstev](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) a každé pravidlo se styly je v některé z nich.
- Barvy jsou v tokenech `--color-…` na `:root` zapsaných v `oklch()`. Tmavý motiv je podle `prefers-color-scheme` nebo přes `light-dark()`.
- Rozvržení používá grid i flexbox, každý tam, kam se hodí. Kontejnerem dotazu (`container-type`) je každá karta `.feature`.
- Nabídka ke stažení je popover otevíraný atributem `popovertarget`, bez JavaScriptu. Otázky tvoří skupinu přes atribut `name` na `details` (viz [exclusive accordions na MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details#multiple_named_disclosure_boxes)).
- Žádné písmo ani obrázky z internetu; ilustrace telefonu je z HTML a CSS a je schovaná před čtečkami (`aria-hidden="true"`).

Testy měří v šířkách 375, 768 a 1024 px. Tmavý motiv a omezený pohyb si nasimulují samy; ty si je vyzkoušíš v DevTools v panelu **Rendering**.

> [!TIP]
> Postupuj po sekcích a po každé klikni na **Zkontrolovat**. První dva požadavky (kostra a nic nepřetéká) splníš hned po napsání HTML a základních stylů.

# --hints--

Stránka má kostru z technických požadavků: `header.site-header`, `nav` s přístupným názvem, `main`, `footer`, právě jeden `h1` a sekce `#funkce`, `#recenze`, `#cenik` a `#faq`, každá s nadpisem `h2`.

```js
assert.ok(document.querySelector('header.site-header'), 'Chybí <header class="site-header">');
const nav = document.querySelector('.site-header nav');
assert.ok(nav, 'V hlavičce chybí <nav>');
assert.ok((nav.getAttribute('aria-label') ?? '').trim() || nav.getAttribute('aria-labelledby'), 'Navigace <nav> nemá přístupný název (aria-label)');
assert.ok(document.querySelector('main'), 'Chybí <main>');
assert.ok(document.querySelector('footer.site-footer'), 'Chybí <footer class="site-footer">');
assert.equal(document.querySelectorAll('h1').length, 1, 'Stránka má mít právě jeden nadpis h1 (počet)');
for (const id of ['funkce', 'recenze', 'cenik', 'faq']) {
  const section = document.getElementById(id);
  assert.ok(section, `Chybí sekce s id="${id}"`);
  assert.ok(section.querySelector('h2'), `Sekce #${id} nemá nadpis h2`);
}
```

Na šířkách 375, 768 i 1024 px nejde stránka posouvat do strany.

```js
for (const width of [375, 768, 1024]) {
  await helpers.resize(width);
  const root = document.documentElement;
  assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce ${width} px je obsah široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
}
```

Na šířce 1024 px jsou logo a odkazy navigace v jednom řádku, navigace vpravo od loga. Na 375 px je každý odkaz navigace celý uvnitř okna.

```js
const logoEl = document.querySelector('.site-header .logo');
assert.ok(logoEl, 'V hlavičce chybí logo .logo');
const logo = logoEl.getBoundingClientRect();
const links = [...document.querySelectorAll('.site-header nav a')].map((link) => link.getBoundingClientRect());
assert.ok(links.length >= 3, 'Navigace má mít aspoň tři odkazy na sekce');
for (const link of links) {
  assert.ok(link.top < logo.bottom && link.bottom > logo.top, 'Na šířce 1024 px mají být odkazy navigace ve stejném řádku jako logo');
  assert.ok(link.left >= logo.right, 'Na šířce 1024 px má být navigace vpravo od loga');
}
await helpers.resize(375);
for (const link of document.querySelectorAll('.site-header nav a')) {
  const box = link.getBoundingClientRect();
  assert.ok(box.left >= 0 && box.right <= document.documentElement.clientWidth, `Při šířce 375 px sahá odkaz „${link.textContent.trim()}" od ${Math.round(box.left)} do ${Math.round(box.right)} px`);
}
```

Tlačítka a odkazy s třídou `.button` jsou na telefonu (375 px) vysoké aspoň 44 px, aby se do nich dalo trefit prstem.

```js
await helpers.resize(375);
const buttons = [...document.querySelectorAll('.button')];
assert.ok(buttons.length >= 4, 'Na stránce mají být aspoň čtyři prvky .button (stažení a tři tarify)');
for (const button of buttons) {
  const height = button.getBoundingClientRect().height;
  assert.ok(height >= 43.5, `„${button.textContent.trim()}" je při šířce 375 px vysoké ${Math.round(height)} px, čekám aspoň 44 px`);
}
```

Tlačítko `.download-button` otevře popover `#download-menu` s aspoň dvěma odkazy a nabídka je celá uvnitř okna na 1024 i na 375 px. Klávesou Escape a kliknutím mimo se zavře sama, jak to popover umí.

```js
const button = document.querySelector('.download-button');
const menu = document.getElementById('download-menu');
assert.ok(button && button.tagName === 'BUTTON', 'Chybí <button class="download-button">');
assert.ok(menu && menu.hasAttribute('popover'), 'Chybí prvek #download-menu s atributem popover');
assert.ok(['auto', ''].includes(menu.getAttribute('popover')), 'Nabídka má být popover „auto", aby ji zavřel Escape i kliknutí mimo');
assert.ok(menu.querySelectorAll('a').length >= 2, 'Nabídka má mít aspoň dva odkazy');
assert.equal(menu.checkVisibility(), false, 'Zavřená nabídka #download-menu je vykreslená na stránce — nepřebíjí pravidlo s display skrytí zavřeného popoveru?');
for (const width of [1024, 375]) {
  await helpers.resize(width);
  if (menu.matches(':popover-open')) menu.hidePopover();
  await helpers.wait(400);
  await helpers.click(button);
  assert.ok(menu.matches(':popover-open'), `Při šířce ${width} px se nabídka po kliknutí na tlačítko neotevřela — má tlačítko popovertarget?`);
  await helpers.wait(500);
  const box = menu.getBoundingClientRect();
  assert.ok(box.width > 0 && box.left >= 0 && box.right <= document.documentElement.clientWidth && box.top >= 0 && box.bottom <= innerHeight, `Při šířce ${width} px sahá otevřená nabídka od ${Math.round(box.left)} do ${Math.round(box.right)} px vodorovně a od ${Math.round(box.top)} do ${Math.round(box.bottom)} px svisle — má být celá v okně`);
}
```

Nabídka `#download-menu` se otevírá i zavírá plynule: při otevření i zavření běží přechod nebo animace průhlednosti a zavřená nabídka je chvíli po zavření ještě vidět.

```js
// Test nasimuluje, že uživatel nemá v systému zapnuté omezení pohybu.
const allowMotion = (rules) => {
  for (const rule of rules) {
    if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
      rule.media.mediaText = rule.media.mediaText.replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(max-width: 0px)').replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(min-width: 0px)');
    }
    if (rule.cssRules) allowMotion(rule.cssRules);
  }
};
for (const sheet of document.styleSheets) allowMotion(sheet.cssRules);
const fades = (el) => el.getAnimations().filter((animation) => animation.transitionProperty === 'opacity' || (!animation.transitionProperty && animation.effect.getKeyframes().some((frame) => 'opacity' in frame)));
const menu = document.getElementById('download-menu');
assert.ok(menu?.hasAttribute('popover'), 'Chybí popover #download-menu');
menu.showPopover();
getComputedStyle(menu).opacity;
assert.ok(fades(menu).length > 0, 'Při otevření nabídky neběží žádný přechod ani animace průhlednosti');
await helpers.wait(600);
menu.hidePopover();
getComputedStyle(menu).opacity;
assert.ok(fades(menu).length > 0, 'Při zavírání nabídky neběží žádný přechod ani animace průhlednosti');
await helpers.wait(50);
assert.notEqual(getComputedStyle(menu).display, 'none', '50 ms po zavření má být nabídka ještě vykreslená a mizet — chybí v přechodu display … allow-discrete?');
```

Karty funkcí `.feature` jsou na 375 px v jednom sloupci, na 768 px ve dvou a na 1024 px ve třech, vždy stejně široké a přes celou šířku seznamu `.features`.

```js
for (const [width, columns] of [[375, 1], [768, 2], [1024, 3]]) {
  await helpers.resize(width);
  const listEl = document.querySelector('.features');
  assert.ok(listEl, 'Chybí seznam funkcí .features');
  const list = listEl.getBoundingClientRect();
  const cards = [...document.querySelectorAll('.feature')].map((card) => card.getBoundingClientRect());
  assert.equal(cards.length, 6, 'Sekce funkcí má mít šest karet .feature (počet)');
  const row = cards.filter((card) => Math.abs(card.top - cards[0].top) <= 2);
  assert.equal(row.length, columns, `Při šířce ${width} px je v prvním řádku funkcí ${row.length} karet (počet), čekám ${columns}`);
  assert.ok(row.every((card) => Math.abs(card.width - row[0].width) <= 2), `Při šířce ${width} px mají karty funkcí šířky ${row.map((c) => Math.round(c.width)).join(', ')} px — mají být stejné`);
  assert.ok(Math.abs(row[0].left - list.left) <= 2 && Math.abs(row.at(-1).right - list.right) <= 2, `Při šířce ${width} px zabírají karty ${Math.round(row[0].left)}–${Math.round(row.at(-1).right)} px, seznam ${Math.round(list.left)}–${Math.round(list.right)} px`);
}
```

Karta funkce se přizpůsobí své vlastní šířce, ne šířce okna: když je `.feature` široká 400 px, stojí ikona `.feature__icon` vlevo vedle textu `.feature__body`; když je široká 240 px, je ikona nad textem.

```js
const feature = document.querySelector('.feature');
assert.ok(feature, 'Chybí karta funkce .feature');
const icon = feature.querySelector('.feature__icon');
const body = feature.querySelector('.feature__body');
assert.ok(icon && body, 'Karta .feature má obsahovat .feature__icon a .feature__body');
// Stejné okno (1024 px), jen karta dostane jinou šířku: změnu pozná jen container query.
feature.style.width = '400px';
feature.style.justifySelf = 'start';
feature.style.flex = 'none';
await helpers.wait(100);
let i = icon.getBoundingClientRect();
let b = body.getBoundingClientRect();
assert.ok(i.right <= b.left + 1 && i.top < b.bottom && i.bottom > b.top, 'Když je karta .feature široká 400 px, má být ikona vlevo vedle textu');
feature.style.width = '240px';
await helpers.wait(100);
i = icon.getBoundingClientRect();
b = body.getBoundingClientRect();
assert.ok(i.bottom <= b.top + 1, 'Když je karta .feature široká 240 px, má být ikona nad textem');
```

Na šířce 1024 px jsou tři recenze `.review` vedle sebe v jednom řádku a stejně vysoké; na 375 px jsou pod sebou.

```js
let reviews = [...document.querySelectorAll('.review')].map((review) => review.getBoundingClientRect());
assert.equal(reviews.length, 3, 'Sekce recenzí má mít tři recenze .review (počet)');
assert.ok(reviews.every((r) => Math.abs(r.top - reviews[0].top) <= 2), 'Na šířce 1024 px mají být recenze v jednom řádku');
assert.ok(reviews.every((r) => Math.abs(r.height - reviews[0].height) <= 1), `Na šířce 1024 px mají recenze výšky ${reviews.map((r) => Math.round(r.height)).join(', ')} px — mají být stejné`);
await helpers.resize(375);
reviews = [...document.querySelectorAll('.review')].map((review) => review.getBoundingClientRect());
for (let n = 1; n < reviews.length; n++) {
  assert.ok(reviews[n].top >= reviews[n - 1].bottom, `Při šířce 375 px má být ${n + 1}. recenze pod předchozí`);
}
```

Na šířce 1024 px jsou tři tarify `.plan` vedle sebe, stejně vysoké, a jejich tlačítka `.plan__button` leží u spodního okraje karty na jedné výšce. Zvýrazněný tarif `.plan--featured` vypadá jinak než ostatní. Na 375 px jsou tarify pod sebou.

```js
const plans = [...document.querySelectorAll('.plan')];
assert.equal(plans.length, 3, 'Ceník má mít tři tarify .plan (počet)');
const boxes = plans.map((plan) => plan.getBoundingClientRect());
assert.ok(boxes.every((box) => Math.abs(box.top - boxes[0].top) <= 2 && Math.abs(box.height - boxes[0].height) <= 1), `Na šířce 1024 px mají být tarify v řádku a stejně vysoké (výšky ${boxes.map((b) => Math.round(b.height)).join(', ')} px)`);
const bottoms = plans.map((plan, n) => {
  const style = getComputedStyle(plan);
  const contentBottom = plan.getBoundingClientRect().bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
  const button = plan.querySelector('.plan__button');
  assert.ok(button, `Tarif ${n + 1} nemá tlačítko .plan__button`);
  const box = button.getBoundingClientRect();
  assert.ok(Math.abs(box.bottom - contentBottom) <= 1, `Tlačítko ${n + 1}. tarifu končí na ${Math.round(box.bottom)} px, obsah karty na ${Math.round(contentBottom)} px — má ležet u dna`);
  return box.bottom;
});
assert.ok(bottoms.every((bottom) => Math.abs(bottom - bottoms[0]) <= 1), 'Tlačítka tarifů mají ležet na jedné výšce');
const featured = document.querySelector('.plan--featured');
const plain = plans.find((plan) => plan !== featured);
const look = (el) => { const s = getComputedStyle(el); return [s.backgroundColor, s.borderTopColor, s.borderTopWidth, s.boxShadow].join(' | '); };
assert.ok(featured && look(featured) !== look(plain), 'Tarif .plan--featured má vypadat jinak než ostatní (pozadí, rámeček nebo stín)');
await helpers.resize(375);
const narrow = plans.map((plan) => plan.getBoundingClientRect());
for (let n = 1; n < narrow.length; n++) {
  assert.ok(narrow[n].top >= narrow[n - 1].bottom, `Při šířce 375 px má být ${n + 1}. tarif pod předchozím`);
}
```

Sekce `#faq` má čtyři otázky `details.faq__item` a otevřená může být vždy jen jedna: když uživatel otevře další, předchozí se sama zavře.

```js
const items = [...document.querySelectorAll('#faq details.faq__item')];
assert.equal(items.length, 4, 'Sekce #faq má mít čtyři otázky details.faq__item (počet)');
assert.ok(items.every((item) => item.querySelector('summary')), 'Každá otázka má mít <summary>');
items[0].open = true;
items[1].open = true;
await helpers.wait(50);
assert.equal(items[0].open, false, 'Po otevření druhé otázky má zůstat první otevřená jen jedna — první se má zavřít sama');
assert.equal(items[1].open, true, 'Druhá otázka má zůstat otevřená');
```

Barvy jsou v design tokenech: `:root` definuje aspoň čtyři vlastní vlastnosti `--color-…` a všechny jsou zapsané v `oklch()`.

```js
const tokens = new Map();
const visit = (rules) => {
  for (const rule of rules) {
    if (rule.selectorText && /(^|,)\s*:root\s*(,|$)/.test(rule.selectorText)) {
      for (const name of rule.style) {
        if (name.startsWith('--color-')) tokens.set(`${name} (${rule.style.getPropertyValue(name).trim()})`, rule.style.getPropertyValue(name));
      }
    }
    if (rule.cssRules) visit(rule.cssRules);
  }
};
for (const sheet of document.styleSheets) visit(sheet.cssRules);
const names = new Set([...tokens.keys()].map((key) => key.split(' ')[0]));
assert.ok(names.size >= 4, `Na :root je ${names.size} tokenů --color-… (počet), čekám aspoň 4`);
for (const [key, value] of tokens) {
  assert.ok(/oklch\(/.test(value) || /var\(--color-/.test(value), `Token ${key} není zapsaný v oklch()`);
}
```

Styly jsou v kaskádových vrstvách: soubor začíná pravidlem `@layer` s pořadím aspoň tří vrstev a žádné pravidlo se styly neleží mimo vrstvu.

```js
const sheets = [...document.styleSheets].filter((sheet) => sheet.cssRules.length > 0);
assert.ok(sheets.length > 0, 'Stránka nemá žádné styly');
for (const sheet of sheets) {
  const rules = [...sheet.cssRules].filter((rule) => !(rule instanceof CSSImportRule));
  const first = rules[0];
  assert.ok(first instanceof CSSLayerStatementRule && first.nameList.length >= 3, 'Styly mají začínat pravidlem s pořadím vrstev, např. @layer reset, base, components; (aspoň tři vrstvy)');
  const outside = rules.filter((rule) => rule instanceof CSSStyleRule || (rule instanceof CSSMediaRule && [...rule.cssRules].some((inner) => inner instanceof CSSStyleRule)));
  assert.equal(outside.length, 0, `Mimo vrstvy leží ${outside.length} pravidel se styly (počet), první: ${outside[0]?.cssText.slice(0, 60)}`);
}
```

Stránka má světlý i tmavý motiv podle nastavení systému. V obou motivech má text stránky, text tarifu a text recenze kontrast aspoň 4,5 : 1 a tmavý motiv má tmavé pozadí.

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
  if (scheme === 'dark') assert.ok(luminance(page) < 0.2, `V tmavém motivu má stránka tmavé pozadí, má ${getComputedStyle(document.body).backgroundColor}`);
  else assert.ok(luminance(page) > 0.5, `Ve světlém motivu má stránka světlé pozadí, má ${getComputedStyle(document.body).backgroundColor}`);
  for (const selector of ['body', '.plan__features li', '.review p']) {
    const el = document.querySelector(selector);
    assert.ok(el, `Chybí prvek ${selector}`);
    const ratio = contrast(backgroundOf(el), rgba(getComputedStyle(el).color));
    assert.ok(ratio >= 4.5, `V ${name} motivu má text ${selector} kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4,5 : 1`);
  }
}
```

Odkaz v navigaci, tlačítko `.download-button` a `summary` otázky mají s fokusem z klávesnice výrazný obrys (aspoň 2 px) nebo prstenec stínu.

```js
const targets = [document.querySelector('.site-header nav a'), document.querySelector('.download-button'), document.querySelector('.faq__item summary')];
for (const el of targets) {
  assert.ok(el, 'Chybí odkaz v navigaci, .download-button nebo summary otázky');
  const shadowBefore = getComputedStyle(el).boxShadow;
  el.focus({ preventScroll: true });
  await helpers.wait(300);
  const style = getComputedStyle(el);
  const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
  const ring = style.boxShadow !== 'none' && style.boxShadow !== shadowBefore;
  assert.ok(outline || ring, `<${el.tagName.toLowerCase()}> má s fokusem obrys ${style.outlineStyle} ${style.outlineWidth} — čekám aspoň 2 px nebo stín navíc`);
  el.blur();
}
```

Tlačítko `.download-button` reaguje na najetí myší plynulým přechodem, který trvá nejvýš 400 ms.

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
const button = document.querySelector('.download-button');
assert.ok(button, 'Chybí tlačítko .download-button');
for (let node = button; node; node = node.parentElement) node.classList.add('akademie-hover');
getComputedStyle(button).backgroundColor;
const running = button.getAnimations();
assert.ok(running.length > 0, 'Po najetí myší na .download-button neběží žádný přechod — změna má být plynulá');
const longest = Math.max(...running.map((animation) => {
  const timing = animation.effect.getComputedTiming();
  return timing.delay + timing.duration;
}));
assert.ok(longest <= 400, `Přechod tlačítka trvá ${longest} ms, čekám nejvýš 400 ms`);
```

Uživatel se zapnutým omezením pohybu vidí nabídku `#download-menu` otevřít se bez posunu a zvětšení a karta funkce se při najetí myší neposune.

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
const MOTION = ['translate', 'scale', 'rotate', 'transform'];
const moving = (el) => el.getAnimations().filter((animation) => {
  if (animation.transitionProperty) return MOTION.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOTION.some((name) => name in frame));
});
const menu = document.getElementById('download-menu');
assert.ok(menu?.hasAttribute('popover') && document.querySelector('.feature'), 'Chybí popover #download-menu nebo karta .feature');
menu.showPopover();
getComputedStyle(menu).opacity;
assert.equal(moving(menu).length, 0, 'Při omezeném pohybu nabídka při otevření vyjíždí nebo se zvětšuje');
menu.hidePopover();
const card = document.querySelector('.feature');
const target = card.querySelector('.feature__card') ?? card;
const before = card.getBoundingClientRect().top;
const inner = target.getBoundingClientRect().top;
for (let node = target; node; node = node.parentElement) node.classList.add('akademie-hover');
await helpers.wait(700);
assert.ok(Math.abs(card.getBoundingClientRect().top - before) <= 0.5 && Math.abs(target.getBoundingClientRect().top - inner) <= 0.5, 'Při omezeném pohybu se karta funkce při najetí myší posunula');
```

# --help--

## --tip-- 6

Nabídka zmizí skokem, i když má přechod průhlednosti? Připomeň si krok [Nabídka se i zavře plynule](see:css-animace/workshop-interakce/009) a hlídej, jestli otevřenou nabídku nepřepisuje obecné pravidlo pro prvky úvodu.

## --tip-- 8

Media dotaz se ptá na okno, a to se v tomhle testu nemění — mění se jen šířka jedné karty. Na šířku prvku reaguje container query, a ta stylovat smí jen potomky kontejneru, ne kontejner sám. Proto je kontejnerem `.feature` a rozvržení nese prvek uvnitř.

## --tip-- 13

Pořadí vrstev napiš jedním řádkem úplně nahoře, třeba `@layer reset, base, components;`, a každou skupinu pravidel pak zabal do bloku `@layer jméno { … }`. Pozor i na media dotazy: patří dovnitř vrstvy.

# --review--

Testy kontrolují chování a spočtené hodnoty. Kvalitu, kterou by na stránce viděl klient nebo kolega při code review, zkontroluj sám.

## --rubric--

- Stránka vypadá jako hotový produkt: jasná hierarchie nadpisů, rozestupy ze stupnice, zelená jen tam, kde má upoutat.
- Kontrast jsi ověřil i u vedlejšího textu, štítku a tlačítek v obou motivech (v DevTools je u barvy ukazatel kontrastu).
- Třídy říkají, co prvek je (`plan__button`), ne jak vypadá (`green-button`).
- V pravidlech komponent nejsou natvrdo zapsané barvy ani rozestupy mimo tokeny.
- Víš, proč je každá vrstva tam, kde je, a co by se stalo, kdybys `motion` přesunul na začátek.
- Celou stránku jsi prošel klávesnicí a se čtečkou obrazovky (VoiceOver, NVDA nebo Orca) aspoň po ceník.
- `README.md` popisuje tři rozhodnutí a adresu nasazené stránky.
- Commity po sekcích, s popisem, co přibylo.

## --extensions--

**Rozšíření bez testů**

- Přepínač motivu v hlavičce, který přebije nastavení systému a zapamatuje si volbu.
- Přepínač „měsíčně / ročně" v ceníku s plynule prolnutou cenou.
- Karty funkcí se jemně odkryjí při scrollu přes `animation-timeline: view()` v `@supports` a jen bez omezení pohybu.
- Rozbalování odpovědí přes `interpolate-size` a `::details-content` jako progresivní vylepšení.

**Rozšíření do portfolia**

- Zapracuj styly a tokeny do portfolia, které jsi postavil v sekci o přístupnosti: stejné vrstvy, stejný motiv, stejné tlačítko.
- Nasaď landing page i portfolio na GitHub Pages a adresy dej do `README.md`.
- Mezi stránkami portfolia zapni přechody přes `@view-transition { navigation: auto; }` a nech náhled projektu přeletět do velkého obrázku na stránce projektu pomocí `view-transition-name`. Ve Firefoxu se stránky přepnou jako dřív.
- Do README přidej snímky stránky na telefonu a na počítači ve světlém i tmavém motivu a oddíl „Přístupnost" s tím, co jsi ověřil.
