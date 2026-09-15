---
title: Blog ve světlém i tmavém režimu
see: css-responzivita/preference-uzivatele#light-dark-dve-hodnoty-v-jedne-deklaraci, css-responzivita/workshop-karta-kontejner/002, css-responzivita/workshop-landing-mobil/006
---

# --description--

Blog **Hrnec** píše o domácím vaření. HTML a základní vzhled jsou hotové, jenže stránka je jen světlá, na každé šířce v jednom sloupci a barvy jsou zapsané natvrdo přímo v pravidlech komponent. Tvým úkolem je udělat z ní blog, který se přizpůsobí šířce okna, místu každé karty i motivu, který si čtenář vybere.

Přepínač motivu v hlavičce už funguje: skript `theme.js` při volbě „Světlý" nebo „Tmavý" nastaví na `<html>` atribut `data-theme="light"` nebo `data-theme="dark"` a při volbě „Systém" atribut odebere. Jak skript funguje, uvidíš v sekci o DOM. Ty píšeš CSS a jednu značku do `<head>`.

**Co má blog umět:**

- Když si čtenář otevře blog na telefonu (320 i 375 px), nemusí stránku posouvat do strany.
- Na počítači (1024 px) je panel „Nejčtenější" vpravo vedle článků, užší než ony a široký mezi 15rem a 25rem. Na tabletu (768 px) je pod články.
- Karta článku je vodorovná (obrázek vlevo, text vpravo), když má sama aspoň **30rem** místa, jinak je svislá. Na počítači jsou tedy karty v článcích vodorovné a v panelu svislé. Na tabletu, kde je panel pod články přes celou šířku, jsou vodorovné i v něm.
- Nadpis blogu má na telefonu **32 px**, od šířky okna **1280 px** má **56 px** a mezi tím roste plynule.
- Když čtenář nechá volbu „Systém", blog je světlý, nebo tmavý podle nastavení systému. Prohlížeč to ví už před stažením CSS.
- Volba „Světlý" nebo „Tmavý" motiv přepne bez ohledu na systém, a to včetně pole pro e-mail, které kreslí prohlížeč.
- V obou motivech má text stránky a datum, nadpis i perex každé karty kontrast aspoň **4.5 : 1** vůči svému pozadí.
- Karta se při najetí myší zvedne, ale jen čtenářům, kteří si v systému nezapnuli omezení pohybu.

Téma blogu, texty, barvy a písmo jsou tvoje volba. Testy měří rozvržení, kontrast a to, jestli motiv reaguje, ne konkrétní barvy. Třídy v HTML nech, testy podle nich prvky hledají.

Průběžně kontroluj náhled v šířkách „Jako testy", 768 a 375. Testy měří i na šířkách 320, 600 až 1000, 1280 a 1600 px, které přepínač nenabízí.

> [!TIP]
> Motiv podle systému si ověříš bez přepínání celého počítače: v náhledu otevři „Nová karta" a v DevTools v panelu Rendering nastav „Emulate CSS media feature prefers-color-scheme" na `dark`. Stejně tam zapneš i `prefers-reduced-motion: reduce`.

# --hints--

V `<head>` je značka `<meta name="color-scheme">`, která stránce dovolí světlý i tmavý motiv.

```js
const meta = document.querySelector('head meta[name="color-scheme"]');
assert.ok(meta, 'V <head> má být <meta name="color-scheme">');
const values = meta.content.toLowerCase().split(/\s+/);
assert.ok(values.includes('light') && values.includes('dark'), `Značka color-scheme má obsahovat light i dark (teď je content="${meta.content}")`);
```

Při volbě „Systém" má `<html>` spočtenou vlastnost `color-scheme` se světlým i tmavým motivem.

```js
document.querySelector('input[name="theme"][value="system"]').click();
const scheme = getComputedStyle(document.documentElement).colorScheme;
assert.ok(scheme.includes('light') && scheme.includes('dark'), `Při volbě Systém má <html> color-scheme se světlým i tmavým motivem, teď je „${scheme}"`);
```

Styly obsahují tmavé hodnoty pro systémový motiv: přes `light-dark()`, nebo v media dotazu `prefers-color-scheme: dark`.

```js
const css = helpers.stripComments(files['styles.css'], 'css');
assert.match(css, /light-dark\s*\(|prefers-color-scheme\s*:\s*dark/, 'styles.css má obsahovat light-dark() nebo @media (prefers-color-scheme: dark)');
```

Při volbě „Systém" odpovídá blog motivu systému: ve světlém systému má stránka světlé pozadí, v tmavém tmavé.

```js
const rgba = (color) => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};
const over = (top, bottom) => top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3])).concat(1);
const background = (el) => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'Canvas';
  document.body.append(probe);
  let color = rgba(getComputedStyle(probe).backgroundColor);
  probe.remove();
  const chain = [];
  for (let node = el; node; node = node.parentElement) chain.unshift(node);
  for (const node of chain) color = over(rgba(getComputedStyle(node).backgroundColor), color);
  return color;
};
const luminance = ([r, g, b]) => [r, g, b].map((c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);

document.querySelector('input[name="theme"][value="system"]').click();
const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
const light = luminance(background(document.querySelector('.page')));
if (systemDark) {
  assert.ok(light <= 0.1, `Tvůj systém má tmavý režim, ale pozadí stránky při volbě Systém je světlé (jas ${light.toFixed(2)})`);
} else {
  assert.ok(light >= 0.5, `Tvůj systém má světlý režim, ale pozadí stránky při volbě Systém je tmavé (jas ${light.toFixed(2)})`);
}
```

Při volbě „Světlý" má stránka světlé pozadí a nadpis i úvodní text blogu mají vůči němu kontrast aspoň 4.5 : 1.

```js
const rgba = (color) => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};
const over = (top, bottom) => top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3])).concat(1);
const background = (el) => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'Canvas';
  document.body.append(probe);
  let color = rgba(getComputedStyle(probe).backgroundColor);
  probe.remove();
  const chain = [];
  for (let node = el; node; node = node.parentElement) chain.unshift(node);
  for (const node of chain) color = over(rgba(getComputedStyle(node).backgroundColor), color);
  return color;
};
const luminance = ([r, g, b]) => [r, g, b].map((c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (el) => {
  const bg = background(el);
  const fg = over(rgba(getComputedStyle(el).color), bg);
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

document.querySelector('input[name="theme"][value="light"]').click();
const page = luminance(background(document.querySelector('.page')));
assert.ok(page >= 0.5, `Při volbě Světlý má stránka tmavé pozadí (jas ${page.toFixed(2)}, čekám aspoň 0.5)`);
for (const selector of ['.blog-title', '.blog-lead']) {
  const ratio = contrast(document.querySelector(selector));
  assert.ok(ratio >= 4.5, `Při volbě Světlý má ${selector} kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4.5 : 1`);
}
```

Při volbě „Tmavý" má stránka tmavé pozadí a nadpis i úvodní text blogu mají vůči němu kontrast aspoň 4.5 : 1.

```js
const rgba = (color) => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};
const over = (top, bottom) => top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3])).concat(1);
const background = (el) => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'Canvas';
  document.body.append(probe);
  let color = rgba(getComputedStyle(probe).backgroundColor);
  probe.remove();
  const chain = [];
  for (let node = el; node; node = node.parentElement) chain.unshift(node);
  for (const node of chain) color = over(rgba(getComputedStyle(node).backgroundColor), color);
  return color;
};
const luminance = ([r, g, b]) => [r, g, b].map((c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (el) => {
  const bg = background(el);
  const fg = over(rgba(getComputedStyle(el).color), bg);
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

document.querySelector('input[name="theme"][value="dark"]').click();
const page = luminance(background(document.querySelector('.page')));
assert.ok(page <= 0.1, `Při volbě Tmavý má stránka světlé pozadí (jas ${page.toFixed(2)}, čekám nejvýš 0.1)`);
for (const selector of ['.blog-title', '.blog-lead']) {
  const ratio = contrast(document.querySelector(selector));
  assert.ok(ratio >= 4.5, `Při volbě Tmavý má ${selector} kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4.5 : 1`);
}
```

V obou motivech mají datum, nadpis a perex každé karty vůči kartě kontrast aspoň 4.5 : 1 a při volbě „Tmavý" jsou karty tmavé.

```js
const rgba = (color) => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};
const over = (top, bottom) => top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3])).concat(1);
const background = (el) => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'Canvas';
  document.body.append(probe);
  let color = rgba(getComputedStyle(probe).backgroundColor);
  probe.remove();
  const chain = [];
  for (let node = el; node; node = node.parentElement) chain.unshift(node);
  for (const node of chain) color = over(rgba(getComputedStyle(node).backgroundColor), color);
  return color;
};
const luminance = ([r, g, b]) => [r, g, b].map((c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (el) => {
  const bg = background(el);
  const fg = over(rgba(getComputedStyle(el).color), bg);
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

for (const theme of ['light', 'dark']) {
  document.querySelector(`input[name="theme"][value="${theme}"]`).click();
  const name = theme === 'light' ? 'Světlý' : 'Tmavý';
  document.querySelectorAll('.post-card').forEach((card, i) => {
    if (theme === 'dark') {
      const cardLight = luminance(background(card));
      assert.ok(cardLight <= 0.15, `Při volbě Tmavý má ${i + 1}. karta světlé pozadí (jas ${cardLight.toFixed(2)})`);
    }
    for (const selector of ['.post-card__meta', '.post-card__title a', '.post-card__excerpt']) {
      const ratio = contrast(card.querySelector(selector));
      assert.ok(ratio >= 4.5, `Při volbě ${name} má ${selector} v ${i + 1}. kartě kontrast ${ratio.toFixed(2)} : 1, čekám aspoň 4.5 : 1`);
    }
  });
}
```

Při volbě „Tmavý" kreslí prohlížeč pole pro e-mail v tmavém motivu a při volbě „Světlý" ve světlém.

```js
const input = document.querySelector('#newsletter-email');
document.querySelector('input[name="theme"][value="dark"]').click();
assert.equal(getComputedStyle(input).colorScheme, 'dark', 'Při volbě Tmavý má pole pro e-mail spočtené color-scheme „dark"');
document.querySelector('input[name="theme"][value="light"]').click();
assert.equal(getComputedStyle(input).colorScheme, 'light', 'Při volbě Světlý má pole pro e-mail spočtené color-scheme „light"');
```

Při šířce 1024 px je panel Nejčtenější vpravo vedle článků, začíná na stejné výšce, je široký 240 až 400 px a užší než sloupec s články.

```js
const posts = document.querySelector('.posts').getBoundingClientRect();
const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
assert.ok(sidebar.left >= posts.right, 'Při šířce 1024 px má být panel .sidebar vpravo od článků');
assert.ok(Math.abs(sidebar.top - posts.top) <= 1, 'Při šířce 1024 px mají články a panel začínat na stejné výšce');
assert.ok(sidebar.width >= 240 && sidebar.width <= 400, `Při šířce 1024 px je panel široký ${Math.round(sidebar.width)} px, čekám 240 až 400 px`);
assert.ok(sidebar.width < posts.width, `Panel (${Math.round(sidebar.width)} px) má být užší než sloupec s články (${Math.round(posts.width)} px)`);
```

Při šířce 768 px je panel Nejčtenější pod články.

```js
await helpers.resize(768);
const posts = document.querySelector('.posts').getBoundingClientRect();
const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
assert.ok(sidebar.top >= posts.bottom, 'Při šířce 768 px má být panel pod články');
```

Karta je vodorovná (obrázek vlevo, text vpravo), když má aspoň 30rem místa: při šířce 1024 px v článcích vodorovná a v panelu svislá, při 768 px vodorovná i v panelu a při 375 px svislá.

```js
const layoutOf = (selector) => {
  const card = document.querySelector(selector);
  const image = card.querySelector('.post-card__image').getBoundingClientRect();
  const body = card.querySelector('.post-card__body').getBoundingClientRect();
  if (body.left >= image.right - 1 && body.top < image.bottom) return 'vodorovná';
  if (body.top >= image.bottom - 1) return 'svislá';
  return 'jiná';
};
const expectLayout = async (width, selector, place, expected) => {
  await helpers.resize(width);
  const actual = layoutOf(selector);
  assert.equal(actual, expected, `Při šířce ${width} px má být karta ${place} ${expected}, je ${actual}`);
};
await expectLayout(1024, '.posts .post-card', 'v článcích', 'vodorovná');
await expectLayout(1024, '.sidebar .post-card', 'v panelu', 'svislá');
await expectLayout(768, '.sidebar .post-card', 'v panelu pod články', 'vodorovná');
await expectLayout(375, '.posts .post-card', 'v článcích', 'svislá');
```

Nadpis blogu má při šířce 320 i 375 px 32 px, při šířce 1280 i 1600 px 56 px a mezi 600 a 1000 px plynule roste.

```js
const size = () => parseFloat(getComputedStyle(document.querySelector('.blog-title')).fontSize);
for (const [width, expected] of [[320, 32], [375, 32], [1280, 56], [1600, 56]]) {
  await helpers.resize(width);
  assert.ok(Math.abs(size() - expected) <= 1.5, `Při šířce ${width} px má nadpis blogu ${size().toFixed(1)} px, čekám ${expected} px`);
}
let previous = 0;
for (const width of [600, 800, 1000]) {
  await helpers.resize(width);
  assert.ok(size() >= previous + 2, `Při šířce ${width} px má nadpis ${size().toFixed(1)} px, o 200 px užší okno ${previous.toFixed(1)} px — má plynule růst`);
  previous = size();
}
```

Při šířce 320 px ani 375 px nejde stránka posouvat do strany.

```js
for (const width of [320, 375]) {
  await helpers.resize(width);
  const root = document.documentElement;
  assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce ${width} px je obsah stránky široký ${root.scrollWidth} px, okno ${root.clientWidth} px`);
}
```

Karta se při najetí myší pořád zvedá, ale posun dostanou jen uživatelé bez omezeného pohybu: pravidlo s posunem je v `@media (prefers-reduced-motion: no-preference)`, nebo ho blok `prefers-reduced-motion: reduce` vypíná.

```js
const moves = [];
const resets = [];
const walk = (rules, conditions) => {
  for (const rule of rules) {
    if (rule instanceof CSSMediaRule) {
      walk(rule.cssRules, [...conditions, rule.media.mediaText]);
    } else if (rule instanceof CSSStyleRule) {
      const values = ['transform', 'translate', 'scale', 'rotate'].map((name) => rule.style.getPropertyValue(name).trim()).filter(Boolean);
      const selector = rule.selectorText;
      if (/post-card|&/.test(selector) && values.some((value) => value !== 'none') && /:hover/.test(selector)) moves.push(conditions);
      if (/post-card|&/.test(selector) && values.length && values.every((value) => value === 'none') && conditions.some((c) => /prefers-reduced-motion:\s*reduce/.test(c))) resets.push(selector);
      if (rule.cssRules?.length) walk(rule.cssRules, conditions);
    } else if (rule.cssRules) {
      walk(rule.cssRules, conditions);
    }
  }
};
for (const sheet of document.styleSheets) walk(sheet.cssRules, []);
assert.ok(moves.length > 0, 'Karta se má při najetí myší dál zvedat (pravidlo s :hover a posunem translate nebo transform)');
const guarded = moves.every((conditions) => conditions.some((c) => /prefers-reduced-motion:\s*no-preference/.test(c)));
assert.ok(guarded || resets.length > 0, 'Posun karty při najetí myší platí i pro uživatele s omezeným pohybem — zabal ho do @media (prefers-reduced-motion: no-preference), nebo ho v bloku reduce vypni');
```

# --help--

## --tip-- 4

Při volbě „Systém" nesmí stránku přebít žádné pravidlo pro ruční volbu. Rozmysli si, co se v tvém řešení změní, když má systém tmavý režim: tokeny s `light-dark()` se řídí použitým `color-scheme`, tokeny v media dotazu se ptají systému. Obě cesty ukazuje část [Ruční přepínač motivu](see:css-responzivita/preference-uzivatele#rucni-prepinac-motivu).

## --tip-- 11

Na počítači musí být karta v článcích vodorovná a v panelu svislá zároveň, na stejně širokém okně. Tohle media dotaz rozlišit nemůže. Kde má být kontejner a proč ne na samotné kartě, shrnuje [Kontejner: container-type a @container](see:css-responzivita/container-queries#kontejner-container-type-a-container).

# --approaches--

## --approach-- Tokeny s light-dark()

Každý token má světlou i tmavou hodnotu na jednom řádku. Ruční volba jen přepne `color-scheme` na `<html>` a všechny tokeny se přizpůsobí samy, formuláře i posuvníky s nimi. Nejkratší zápis a jedno místo pro každou barvu. Hodí se, když stačí dva motivy.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Hrnec — vaříme doma, bez stresu</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Hrnec</a>
      <fieldset class="theme-switch">
        <legend class="visually-hidden">Motiv stránky</legend>
        <label><input class="visually-hidden" type="radio" name="theme" value="system" checked> Systém</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="light"> Světlý</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="dark"> Tmavý</label>
      </fieldset>
    </header>

    <main class="page">
      <div class="intro">
        <h1 class="blog-title">Vaříme doma, bez stresu</h1>
        <p class="blog-lead">Recepty, které zvládneš ve všední den, a víkendová jídla rozepsaná tak, aby se nic nepřipálilo. Každý recept jsme uvařili aspoň třikrát.</p>
      </div>

      <div class="layout">
        <section class="posts" aria-labelledby="posts-title">
          <h2 class="section-title" id="posts-title">Nejnovější recepty</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #7c2d12, #f59e0b)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">18. 9. 2026 · 3 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Svíčková bez stresu</a></h3>
                  <p class="post-card__excerpt">Omáčka se dá připravit den předem. Ukážeme, co udělat v sobotu, aby v neděli zbylo jen nakrájet knedlíky.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #78350f, #d6b98c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">11. 9. 2026 · 20 minut denně</p>
                  <h3 class="post-card__title"><a href="#">Kvásek za pět dní</a></h3>
                  <p class="post-card__excerpt">Deník jednoho kvásku: kdy ho krmit, jak poznat, že je připravený, a proč nevadí, když první chleba nevyjde.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #365314, #eab308)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">4. 9. 2026 · 45 minut</p>
                  <h3 class="post-card__title"><a href="#">Bramboráky jako od babičky</a></h3>
                  <p class="post-card__excerpt">Syrové brambory, majoránka, česnek a trocha trpělivosti. A proč je dobré těsto před smažením nechat odkapat.</p>
                </div>
              </article>
            </li>
          </ul>
        </section>

        <aside class="sidebar" aria-labelledby="popular-title">
          <h2 class="section-title" id="popular-title">Nejčtenější</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #991b1b, #fb923c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">30 minut</p>
                  <h3 class="post-card__title"><a href="#">Rychlé lečo z trhu</a></h3>
                  <p class="post-card__excerpt">Papriky, rajčata a cibule. Vajíčka, klobásu nebo nic navíc, podle toho, co zbylo v lednici.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #4c1d95, #c084fc)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">1,5 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Buchty s povidly</a></h3>
                  <p class="post-card__excerpt">Kynuté těsto, které se nebojí chladna, a povidla, která při pečení nevytečou.</p>
                </div>
              </article>
            </li>
          </ul>

          <form class="newsletter">
            <label for="newsletter-email">Nové recepty e-mailem</label>
            <input id="newsletter-email" type="email" name="email" placeholder="jana.novakova@email.cz" autocomplete="email">
            <button type="submit">Odebírat</button>
          </form>
        </aside>
      </div>
    </main>

    <footer class="site-footer">
      <p>© 2026 Hrnec · Recepty píšeme a vaříme v Olomouci</p>
    </footer>

    <script src="theme.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  color-scheme: light dark;
  --color-bg: light-dark(#fbf7f1, #17120e);
  --color-surface: light-dark(#ffffff, #231c16);
  --color-soft: light-dark(#f3e6d8, #2e241c);
  --color-text: light-dark(#2b2118, #f3ebe2);
  --color-text-soft: light-dark(#4a3d33, #d8cabd);
  --color-muted: light-dark(#6f6155, #b8a999);
  --color-accent: light-dark(#b4461b, #f0935c);
  --color-on-accent: light-dark(#ffffff, #1f130b);
  --color-line: light-dark(#eadfd2, #3a3029);
  --color-field-line: light-dark(#d9c6b3, #5a4b3f);
  --shadow-color: light-dark(rgb(43 33 24 / 0.14), rgb(0 0 0 / 0.55));
}

/* Ruční volba motivu přepíše systém. */
:root[data-theme="light"] {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface);
}

.logo {
  color: var(--color-accent);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.theme-switch {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
}

.theme-switch label {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.25rem;
  padding-inline: 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.theme-switch label:has(:checked) {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.theme-switch label:has(:focus-visible) {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* ===== Stránka ===== */

.page {
  max-inline-size: 70rem;
  margin-inline: auto;
  padding: 2rem 1rem 3rem;
}

.intro {
  margin-block-end: 2.5rem;
}

.blog-title {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 1.2rem + 3.5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.blog-lead {
  max-inline-size: 40rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.layout {
  display: grid;
  gap: 2.5rem;
}

.section-title {
  margin: 0 0 1rem;
  color: var(--color-accent);
  font-size: 0.875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ===== Karta článku ===== */

.post-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 1px 2px var(--shadow-color);
}

.post-card:hover {
  box-shadow: 0 16px 32px var(--shadow-color);
}

/* Pohyb jen pro ty, kdo si v systému neomezili animace. */
@media (prefers-reduced-motion: no-preference) {
  .post-card {
    /* transition: plynulý přechod, naučíš se ho v sekci o animacích */
    transition: translate 0.25s, box-shadow 0.25s;
  }

  .post-card:hover {
    translate: 0 -4px;
  }
}

.post-card__image {
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.35), transparent 50%),
    var(--photo);
}

.post-card__meta {
  margin: 0 0 0.25rem;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.post-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  line-height: 1.25;
}

.post-card__title a {
  text-decoration: none;
}

.post-card__title a:hover {
  color: var(--color-accent);
}

.post-card__title a:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.post-card__excerpt {
  margin: 0;
  color: var(--color-text-soft);
}

/* ===== Odběr novinek ===== */

.newsletter {
  display: grid;
  gap: 0.5rem;
  margin-block-start: 1.5rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: var(--color-soft);
}

.newsletter label {
  font-weight: 700;
}

.newsletter input {
  min-block-size: 2.75rem;
  padding-inline: 0.75rem;
  border: 1px solid var(--color-field-line);
  border-radius: 0.5rem;
  font: inherit;
}

.newsletter button {
  min-block-size: 2.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* ===== Patička ===== */

.site-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

.site-footer p {
  margin: 0;
}

/* ===== Rozvržení ===== */

@media (width >= 60rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 20rem;
  }
}

/* Karta se rozhoduje podle místa, které dostala. */
.post-list__item {
  container-type: inline-size;
}

@container (width >= 30rem) {
  .post-card {
    grid-template-columns: 11rem 1fr;
    align-items: start;
  }

  .post-card__image {
    aspect-ratio: 1;
  }
}
```

## --approach-- Dvě sady tokenů v media dotazu

Světlé tokeny na `:root`, tmavé v `@media (prefers-color-scheme: dark)`. Media dotaz se ptá systému a o ruční volbě neví, proto potřebuje `:not([data-theme="light"])` a ruční tmavý motiv musí tmavé hodnoty zopakovat. Víc psaní, ale funguje i tam, kde se kromě barev mění další hodnoty (stíny, obrázky, `filter`), a v kódu, který `light-dark()` ještě nepoužívá.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Hrnec — vaříme doma, bez stresu</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Hrnec</a>
      <fieldset class="theme-switch">
        <legend class="visually-hidden">Motiv stránky</legend>
        <label><input class="visually-hidden" type="radio" name="theme" value="system" checked> Systém</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="light"> Světlý</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="dark"> Tmavý</label>
      </fieldset>
    </header>

    <main class="page">
      <div class="intro">
        <h1 class="blog-title">Vaříme doma, bez stresu</h1>
        <p class="blog-lead">Recepty, které zvládneš ve všední den, a víkendová jídla rozepsaná tak, aby se nic nepřipálilo. Každý recept jsme uvařili aspoň třikrát.</p>
      </div>

      <div class="layout">
        <section class="posts" aria-labelledby="posts-title">
          <h2 class="section-title" id="posts-title">Nejnovější recepty</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #7c2d12, #f59e0b)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">18. 9. 2026 · 3 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Svíčková bez stresu</a></h3>
                  <p class="post-card__excerpt">Omáčka se dá připravit den předem. Ukážeme, co udělat v sobotu, aby v neděli zbylo jen nakrájet knedlíky.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #78350f, #d6b98c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">11. 9. 2026 · 20 minut denně</p>
                  <h3 class="post-card__title"><a href="#">Kvásek za pět dní</a></h3>
                  <p class="post-card__excerpt">Deník jednoho kvásku: kdy ho krmit, jak poznat, že je připravený, a proč nevadí, když první chleba nevyjde.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #365314, #eab308)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">4. 9. 2026 · 45 minut</p>
                  <h3 class="post-card__title"><a href="#">Bramboráky jako od babičky</a></h3>
                  <p class="post-card__excerpt">Syrové brambory, majoránka, česnek a trocha trpělivosti. A proč je dobré těsto před smažením nechat odkapat.</p>
                </div>
              </article>
            </li>
          </ul>
        </section>

        <aside class="sidebar" aria-labelledby="popular-title">
          <h2 class="section-title" id="popular-title">Nejčtenější</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #991b1b, #fb923c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">30 minut</p>
                  <h3 class="post-card__title"><a href="#">Rychlé lečo z trhu</a></h3>
                  <p class="post-card__excerpt">Papriky, rajčata a cibule. Vajíčka, klobásu nebo nic navíc, podle toho, co zbylo v lednici.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #4c1d95, #c084fc)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">1,5 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Buchty s povidly</a></h3>
                  <p class="post-card__excerpt">Kynuté těsto, které se nebojí chladna, a povidla, která při pečení nevytečou.</p>
                </div>
              </article>
            </li>
          </ul>

          <form class="newsletter">
            <label for="newsletter-email">Nové recepty e-mailem</label>
            <input id="newsletter-email" type="email" name="email" placeholder="jana.novakova@email.cz" autocomplete="email">
            <button type="submit">Odebírat</button>
          </form>
        </aside>
      </div>
    </main>

    <footer class="site-footer">
      <p>© 2026 Hrnec · Recepty píšeme a vaříme v Olomouci</p>
    </footer>

    <script src="theme.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  color-scheme: light dark;
  --color-bg: #fbf7f1;
  --color-surface: #ffffff;
  --color-soft: #f3e6d8;
  --color-text: #2b2118;
  --color-text-soft: #4a3d33;
  --color-muted: #6f6155;
  --color-accent: #b4461b;
  --color-on-accent: #ffffff;
  --color-line: #eadfd2;
  --color-field-line: #d9c6b3;
  --shadow-color: rgb(43 33 24 / 0.14);
}

/* Tmavý systém, pokud si čtenář nevybral světlý motiv ručně. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #17120e;
    --color-surface: #231c16;
    --color-soft: #2e241c;
    --color-text: #f3ebe2;
    --color-text-soft: #d8cabd;
    --color-muted: #b8a999;
    --color-accent: #f0935c;
    --color-on-accent: #1f130b;
    --color-line: #3a3029;
    --color-field-line: #5a4b3f;
    --shadow-color: rgb(0 0 0 / 0.55);
  }
}

:root[data-theme="light"] {
  color-scheme: light;
}

/* Ruční tmavý motiv musí tmavé hodnoty zopakovat. */
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-bg: #17120e;
  --color-surface: #231c16;
  --color-soft: #2e241c;
  --color-text: #f3ebe2;
  --color-text-soft: #d8cabd;
  --color-muted: #b8a999;
  --color-accent: #f0935c;
  --color-on-accent: #1f130b;
  --color-line: #3a3029;
  --color-field-line: #5a4b3f;
  --shadow-color: rgb(0 0 0 / 0.55);
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface);
}

.logo {
  color: var(--color-accent);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.theme-switch {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
}

.theme-switch label {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.25rem;
  padding-inline: 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.theme-switch label:has(:checked) {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.theme-switch label:has(:focus-visible) {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* ===== Stránka ===== */

.page {
  max-inline-size: 70rem;
  margin-inline: auto;
  padding: 2rem 1rem 3rem;
}

.intro {
  margin-block-end: 2.5rem;
}

.blog-title {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 1.2rem + 3.5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.blog-lead {
  max-inline-size: 40rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.layout {
  display: grid;
  gap: 2.5rem;
}

.section-title {
  margin: 0 0 1rem;
  color: var(--color-accent);
  font-size: 0.875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ===== Karta článku ===== */

.post-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 1px 2px var(--shadow-color);
}

.post-card:hover {
  box-shadow: 0 16px 32px var(--shadow-color);
}

/* Pohyb jen pro ty, kdo si v systému neomezili animace. */
@media (prefers-reduced-motion: no-preference) {
  .post-card {
    /* transition: plynulý přechod, naučíš se ho v sekci o animacích */
    transition: translate 0.25s, box-shadow 0.25s;
  }

  .post-card:hover {
    translate: 0 -4px;
  }
}

.post-card__image {
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.35), transparent 50%),
    var(--photo);
}

.post-card__meta {
  margin: 0 0 0.25rem;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.post-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  line-height: 1.25;
}

.post-card__title a {
  text-decoration: none;
}

.post-card__title a:hover {
  color: var(--color-accent);
}

.post-card__title a:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.post-card__excerpt {
  margin: 0;
  color: var(--color-text-soft);
}

/* ===== Odběr novinek ===== */

.newsletter {
  display: grid;
  gap: 0.5rem;
  margin-block-start: 1.5rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: var(--color-soft);
}

.newsletter label {
  font-weight: 700;
}

.newsletter input {
  min-block-size: 2.75rem;
  padding-inline: 0.75rem;
  border: 1px solid var(--color-field-line);
  border-radius: 0.5rem;
  font: inherit;
}

.newsletter button {
  min-block-size: 2.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* ===== Patička ===== */

.site-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

.site-footer p {
  margin: 0;
}

/* ===== Rozvržení ===== */

@media (width >= 60rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 20rem;
  }
}

/* Karta se rozhoduje podle místa, které dostala. */
.post-list__item {
  container-type: inline-size;
}

@container (width >= 30rem) {
  .post-card {
    grid-template-columns: 11rem 1fr;
    align-items: start;
  }

  .post-card__image {
    aspect-ratio: 1;
  }
}
```

## --approach-- Ruční volba přes :has()

Stejné tokeny s `light-dark()`, jen ruční volbu pozná CSS samo podle zaškrtnutého přepínače a atribut ze skriptu nepotřebuje. Skript pak slouží jen k zapamatování volby. Hodí se u malé stránky; ve větší aplikaci je čitelnější jeden atribut na `<html>`, který nastavuje jedno místo v kódu.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Hrnec — vaříme doma, bez stresu</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Hrnec</a>
      <fieldset class="theme-switch">
        <legend class="visually-hidden">Motiv stránky</legend>
        <label><input class="visually-hidden" type="radio" name="theme" value="system" checked> Systém</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="light"> Světlý</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="dark"> Tmavý</label>
      </fieldset>
    </header>

    <main class="page">
      <div class="intro">
        <h1 class="blog-title">Vaříme doma, bez stresu</h1>
        <p class="blog-lead">Recepty, které zvládneš ve všední den, a víkendová jídla rozepsaná tak, aby se nic nepřipálilo. Každý recept jsme uvařili aspoň třikrát.</p>
      </div>

      <div class="layout">
        <section class="posts" aria-labelledby="posts-title">
          <h2 class="section-title" id="posts-title">Nejnovější recepty</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #7c2d12, #f59e0b)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">18. 9. 2026 · 3 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Svíčková bez stresu</a></h3>
                  <p class="post-card__excerpt">Omáčka se dá připravit den předem. Ukážeme, co udělat v sobotu, aby v neděli zbylo jen nakrájet knedlíky.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #78350f, #d6b98c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">11. 9. 2026 · 20 minut denně</p>
                  <h3 class="post-card__title"><a href="#">Kvásek za pět dní</a></h3>
                  <p class="post-card__excerpt">Deník jednoho kvásku: kdy ho krmit, jak poznat, že je připravený, a proč nevadí, když první chleba nevyjde.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #365314, #eab308)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">4. 9. 2026 · 45 minut</p>
                  <h3 class="post-card__title"><a href="#">Bramboráky jako od babičky</a></h3>
                  <p class="post-card__excerpt">Syrové brambory, majoránka, česnek a trocha trpělivosti. A proč je dobré těsto před smažením nechat odkapat.</p>
                </div>
              </article>
            </li>
          </ul>
        </section>

        <aside class="sidebar" aria-labelledby="popular-title">
          <h2 class="section-title" id="popular-title">Nejčtenější</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #991b1b, #fb923c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">30 minut</p>
                  <h3 class="post-card__title"><a href="#">Rychlé lečo z trhu</a></h3>
                  <p class="post-card__excerpt">Papriky, rajčata a cibule. Vajíčka, klobásu nebo nic navíc, podle toho, co zbylo v lednici.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #4c1d95, #c084fc)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">1,5 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Buchty s povidly</a></h3>
                  <p class="post-card__excerpt">Kynuté těsto, které se nebojí chladna, a povidla, která při pečení nevytečou.</p>
                </div>
              </article>
            </li>
          </ul>

          <form class="newsletter">
            <label for="newsletter-email">Nové recepty e-mailem</label>
            <input id="newsletter-email" type="email" name="email" placeholder="jana.novakova@email.cz" autocomplete="email">
            <button type="submit">Odebírat</button>
          </form>
        </aside>
      </div>
    </main>

    <footer class="site-footer">
      <p>© 2026 Hrnec · Recepty píšeme a vaříme v Olomouci</p>
    </footer>

    <script src="theme.js"></script>
  </body>
</html>
```

### --file-- styles.css

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  color-scheme: light dark;
  --color-bg: light-dark(#fbf7f1, #17120e);
  --color-surface: light-dark(#ffffff, #231c16);
  --color-soft: light-dark(#f3e6d8, #2e241c);
  --color-text: light-dark(#2b2118, #f3ebe2);
  --color-text-soft: light-dark(#4a3d33, #d8cabd);
  --color-muted: light-dark(#6f6155, #b8a999);
  --color-accent: light-dark(#b4461b, #f0935c);
  --color-on-accent: light-dark(#ffffff, #1f130b);
  --color-line: light-dark(#eadfd2, #3a3029);
  --color-field-line: light-dark(#d9c6b3, #5a4b3f);
  --shadow-color: light-dark(rgb(43 33 24 / 0.14), rgb(0 0 0 / 0.55));
}

/* Ruční volba přímo podle zaškrtnutého přepínače, bez atributu ze skriptu. */
:root:has(input[name="theme"][value="light"]:checked) {
  color-scheme: light;
}

:root:has(input[name="theme"][value="dark"]:checked) {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface);
}

.logo {
  color: var(--color-accent);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.theme-switch {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
}

.theme-switch label {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.25rem;
  padding-inline: 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.theme-switch label:has(:checked) {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.theme-switch label:has(:focus-visible) {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* ===== Stránka ===== */

.page {
  max-inline-size: 70rem;
  margin-inline: auto;
  padding: 2rem 1rem 3rem;
}

.intro {
  margin-block-end: 2.5rem;
}

.blog-title {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 1.2rem + 3.5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.blog-lead {
  max-inline-size: 40rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.layout {
  display: grid;
  gap: 2.5rem;
}

.section-title {
  margin: 0 0 1rem;
  color: var(--color-accent);
  font-size: 0.875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ===== Karta článku ===== */

.post-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 1px 2px var(--shadow-color);
}

.post-card:hover {
  box-shadow: 0 16px 32px var(--shadow-color);
}

/* Pohyb jen pro ty, kdo si v systému neomezili animace. */
@media (prefers-reduced-motion: no-preference) {
  .post-card {
    /* transition: plynulý přechod, naučíš se ho v sekci o animacích */
    transition: translate 0.25s, box-shadow 0.25s;
  }

  .post-card:hover {
    translate: 0 -4px;
  }
}

.post-card__image {
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.35), transparent 50%),
    var(--photo);
}

.post-card__meta {
  margin: 0 0 0.25rem;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.post-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  line-height: 1.25;
}

.post-card__title a {
  text-decoration: none;
}

.post-card__title a:hover {
  color: var(--color-accent);
}

.post-card__title a:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.post-card__excerpt {
  margin: 0;
  color: var(--color-text-soft);
}

/* ===== Odběr novinek ===== */

.newsletter {
  display: grid;
  gap: 0.5rem;
  margin-block-start: 1.5rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: var(--color-soft);
}

.newsletter label {
  font-weight: 700;
}

.newsletter input {
  min-block-size: 2.75rem;
  padding-inline: 0.75rem;
  border: 1px solid var(--color-field-line);
  border-radius: 0.5rem;
  font: inherit;
}

.newsletter button {
  min-block-size: 2.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* ===== Patička ===== */

.site-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

.site-footer p {
  margin: 0;
}

/* ===== Rozvržení ===== */

@media (width >= 60rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 20rem;
  }
}

/* Karta se rozhoduje podle místa, které dostala. */
.post-list__item {
  container-type: inline-size;
}

@container (width >= 30rem) {
  .post-card {
    grid-template-columns: 11rem 1fr;
    align-items: start;
  }

  .post-card__image {
    aspect-ratio: 1;
  }
}
```

# --review--

Testy kontrolují rozvržení, kontrast a reakci na motiv. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- V pravidlech komponent nezůstala žádná barva natvrdo; každá barva, která se v motivech liší, je token.
- Každý token má světlou i tmavou hodnotu na jednom místě a víš, kde bys přidal další.
- Karta neví nic o tom, kde leží: žádná třída typu `.sidebar .post-card` s vlastním rozvržením.
- Nadpis roste přes `clamp()` se součtem `rem` a `vw`, ne jen ve `vw`.
- Prošel jsi stránku v DevTools s emulací `prefers-color-scheme: dark` i `prefers-reduced-motion: reduce`.
- Stav fokusu (`:focus-visible`) je vidět v obou motivech.

## --extensions--

Rozšíření bez testů: `@media print` s černým textem na bílém a adresami odkazů, třetí motiv „sépiový" jako další hodnota `data-theme`, a `@media (prefers-contrast: more)`, který ztmaví šedé texty a zesílí rámečky karet.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hrnec — vaříme doma, bez stresu</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Hrnec</a>
      <fieldset class="theme-switch">
        <legend class="visually-hidden">Motiv stránky</legend>
        <label><input class="visually-hidden" type="radio" name="theme" value="system" checked> Systém</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="light"> Světlý</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="dark"> Tmavý</label>
      </fieldset>
    </header>

    <main class="page">
      <div class="intro">
        <h1 class="blog-title">Vaříme doma, bez stresu</h1>
        <p class="blog-lead">Recepty, které zvládneš ve všední den, a víkendová jídla rozepsaná tak, aby se nic nepřipálilo. Každý recept jsme uvařili aspoň třikrát.</p>
      </div>

      <div class="layout">
        <section class="posts" aria-labelledby="posts-title">
          <h2 class="section-title" id="posts-title">Nejnovější recepty</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #7c2d12, #f59e0b)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">18. 9. 2026 · 3 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Svíčková bez stresu</a></h3>
                  <p class="post-card__excerpt">Omáčka se dá připravit den předem. Ukážeme, co udělat v sobotu, aby v neděli zbylo jen nakrájet knedlíky.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #78350f, #d6b98c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">11. 9. 2026 · 20 minut denně</p>
                  <h3 class="post-card__title"><a href="#">Kvásek za pět dní</a></h3>
                  <p class="post-card__excerpt">Deník jednoho kvásku: kdy ho krmit, jak poznat, že je připravený, a proč nevadí, když první chleba nevyjde.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #365314, #eab308)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">4. 9. 2026 · 45 minut</p>
                  <h3 class="post-card__title"><a href="#">Bramboráky jako od babičky</a></h3>
                  <p class="post-card__excerpt">Syrové brambory, majoránka, česnek a trocha trpělivosti. A proč je dobré těsto před smažením nechat odkapat.</p>
                </div>
              </article>
            </li>
          </ul>
        </section>

        <aside class="sidebar" aria-labelledby="popular-title">
          <h2 class="section-title" id="popular-title">Nejčtenější</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #991b1b, #fb923c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">30 minut</p>
                  <h3 class="post-card__title"><a href="#">Rychlé lečo z trhu</a></h3>
                  <p class="post-card__excerpt">Papriky, rajčata a cibule. Vajíčka, klobásu nebo nic navíc, podle toho, co zbylo v lednici.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #4c1d95, #c084fc)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">1,5 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Buchty s povidly</a></h3>
                  <p class="post-card__excerpt">Kynuté těsto, které se nebojí chladna, a povidla, která při pečení nevytečou.</p>
                </div>
              </article>
            </li>
          </ul>

          <form class="newsletter">
            <label for="newsletter-email">Nové recepty e-mailem</label>
            <input id="newsletter-email" type="email" name="email" placeholder="jana.novakova@email.cz" autocomplete="email">
            <button type="submit">Odebírat</button>
          </form>
        </aside>
      </div>
    </main>

    <footer class="site-footer">
      <p>© 2026 Hrnec · Recepty píšeme a vaříme v Olomouci</p>
    </footer>

    <script src="theme.js"></script>
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
  line-height: 1.6;
  color: #2b2118;
  background: #fbf7f1;
}

a {
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eadfd2;
  background: #ffffff;
}

.logo {
  color: #b4461b;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.theme-switch {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid #eadfd2;
  border-radius: 999px;
}

.theme-switch label {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.25rem;
  padding-inline: 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.theme-switch label:has(:checked) {
  background: #b4461b;
  color: #ffffff;
}

.theme-switch label:has(:focus-visible) {
  outline: 3px solid #b4461b;
  outline-offset: 2px;
}

/* ===== Stránka ===== */

.page {
  max-inline-size: 70rem;
  margin-inline: auto;
  padding: 2rem 1rem 3rem;
}

.intro {
  margin-block-end: 2.5rem;
}

.blog-title {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.blog-lead {
  max-inline-size: 40rem;
  margin: 0;
  color: #6f6155;
  font-size: 1.125rem;
}

.layout {
  display: grid;
  gap: 2.5rem;
}

.section-title {
  margin: 0 0 1rem;
  color: #b4461b;
  font-size: 0.875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ===== Karta článku ===== */

.post-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eadfd2;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(43 33 24 / 0.06);
  /* transition: plynulý přechod, naučíš se ho v sekci o animacích */
  transition: translate 0.25s, box-shadow 0.25s;
}

.post-card:hover {
  translate: 0 -4px;
  box-shadow: 0 16px 32px rgb(43 33 24 / 0.14);
}

.post-card__image {
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.35), transparent 50%),
    var(--photo);
}

.post-card__meta {
  margin: 0 0 0.25rem;
  color: #6f6155;
  font-size: 0.875rem;
}

.post-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  line-height: 1.25;
}

.post-card__title a {
  text-decoration: none;
}

.post-card__title a:hover {
  color: #b4461b;
}

.post-card__title a:focus-visible {
  outline: 3px solid #b4461b;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.post-card__excerpt {
  margin: 0;
  color: #4a3d33;
}

/* ===== Odběr novinek ===== */

.newsletter {
  display: grid;
  gap: 0.5rem;
  margin-block-start: 1.5rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: #f3e6d8;
}

.newsletter label {
  font-weight: 700;
}

.newsletter input {
  min-block-size: 2.75rem;
  padding-inline: 0.75rem;
  border: 1px solid #d9c6b3;
  border-radius: 0.5rem;
  font: inherit;
}

.newsletter button {
  min-block-size: 2.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: #b4461b;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* ===== Patička ===== */

.site-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid #eadfd2;
  color: #6f6155;
  font-size: 0.875rem;
  text-align: center;
}

.site-footer p {
  margin: 0;
}
```

## --file-- theme.js

```js
// Přepínač motivu je hotový: uloží volbu a nastaví na <html> atribut data-theme.
// „Systém" atribut odebere. Jak skript funguje, uvidíš v sekci o DOM, ty píšeš jen CSS.
const root = document.documentElement;
const radios = document.querySelectorAll('input[name="theme"]');

function applyTheme(value) {
  if (value === 'system') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = value;
  }
}

const saved = localStorage.getItem('theme') ?? 'system';

for (const radio of radios) {
  radio.checked = radio.value === saved;
  radio.addEventListener('change', () => {
    applyTheme(radio.value);
    localStorage.setItem('theme', radio.value);
  });
}

applyTheme(saved);
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Hrnec — vaříme doma, bez stresu</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">Hrnec</a>
      <fieldset class="theme-switch">
        <legend class="visually-hidden">Motiv stránky</legend>
        <label><input class="visually-hidden" type="radio" name="theme" value="system" checked> Systém</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="light"> Světlý</label>
        <label><input class="visually-hidden" type="radio" name="theme" value="dark"> Tmavý</label>
      </fieldset>
    </header>

    <main class="page">
      <div class="intro">
        <h1 class="blog-title">Vaříme doma, bez stresu</h1>
        <p class="blog-lead">Recepty, které zvládneš ve všední den, a víkendová jídla rozepsaná tak, aby se nic nepřipálilo. Každý recept jsme uvařili aspoň třikrát.</p>
      </div>

      <div class="layout">
        <section class="posts" aria-labelledby="posts-title">
          <h2 class="section-title" id="posts-title">Nejnovější recepty</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #7c2d12, #f59e0b)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">18. 9. 2026 · 3 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Svíčková bez stresu</a></h3>
                  <p class="post-card__excerpt">Omáčka se dá připravit den předem. Ukážeme, co udělat v sobotu, aby v neděli zbylo jen nakrájet knedlíky.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #78350f, #d6b98c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">11. 9. 2026 · 20 minut denně</p>
                  <h3 class="post-card__title"><a href="#">Kvásek za pět dní</a></h3>
                  <p class="post-card__excerpt">Deník jednoho kvásku: kdy ho krmit, jak poznat, že je připravený, a proč nevadí, když první chleba nevyjde.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #365314, #eab308)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">4. 9. 2026 · 45 minut</p>
                  <h3 class="post-card__title"><a href="#">Bramboráky jako od babičky</a></h3>
                  <p class="post-card__excerpt">Syrové brambory, majoránka, česnek a trocha trpělivosti. A proč je dobré těsto před smažením nechat odkapat.</p>
                </div>
              </article>
            </li>
          </ul>
        </section>

        <aside class="sidebar" aria-labelledby="popular-title">
          <h2 class="section-title" id="popular-title">Nejčtenější</h2>
          <ul class="post-list">
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #991b1b, #fb923c)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">30 minut</p>
                  <h3 class="post-card__title"><a href="#">Rychlé lečo z trhu</a></h3>
                  <p class="post-card__excerpt">Papriky, rajčata a cibule. Vajíčka, klobásu nebo nic navíc, podle toho, co zbylo v lednici.</p>
                </div>
              </article>
            </li>
            <li class="post-list__item">
              <article class="post-card">
                <div class="post-card__image" style="--photo: linear-gradient(135deg, #4c1d95, #c084fc)"></div>
                <div class="post-card__body">
                  <p class="post-card__meta">1,5 hodiny</p>
                  <h3 class="post-card__title"><a href="#">Buchty s povidly</a></h3>
                  <p class="post-card__excerpt">Kynuté těsto, které se nebojí chladna, a povidla, která při pečení nevytečou.</p>
                </div>
              </article>
            </li>
          </ul>

          <form class="newsletter">
            <label for="newsletter-email">Nové recepty e-mailem</label>
            <input id="newsletter-email" type="email" name="email" placeholder="jana.novakova@email.cz" autocomplete="email">
            <button type="submit">Odebírat</button>
          </form>
        </aside>
      </div>
    </main>

    <footer class="site-footer">
      <p>© 2026 Hrnec · Recepty píšeme a vaříme v Olomouci</p>
    </footer>

    <script src="theme.js"></script>
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

:root {
  color-scheme: light dark;
  --color-bg: light-dark(#fbf7f1, #17120e);
  --color-surface: light-dark(#ffffff, #231c16);
  --color-soft: light-dark(#f3e6d8, #2e241c);
  --color-text: light-dark(#2b2118, #f3ebe2);
  --color-text-soft: light-dark(#4a3d33, #d8cabd);
  --color-muted: light-dark(#6f6155, #b8a999);
  --color-accent: light-dark(#b4461b, #f0935c);
  --color-on-accent: light-dark(#ffffff, #1f130b);
  --color-line: light-dark(#eadfd2, #3a3029);
  --color-field-line: light-dark(#d9c6b3, #5a4b3f);
  --shadow-color: light-dark(rgb(43 33 24 / 0.14), rgb(0 0 0 / 0.55));
}

/* Ruční volba motivu přepíše systém. */
:root[data-theme="light"] {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== Hlavička ===== */

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface);
}

.logo {
  color: var(--color-accent);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.theme-switch {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
}

.theme-switch label {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.25rem;
  padding-inline: 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.theme-switch label:has(:checked) {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.theme-switch label:has(:focus-visible) {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* ===== Stránka ===== */

.page {
  max-inline-size: 70rem;
  margin-inline: auto;
  padding: 2rem 1rem 3rem;
}

.intro {
  margin-block-end: 2.5rem;
}

.blog-title {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 1.2rem + 3.5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.blog-lead {
  max-inline-size: 40rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.layout {
  display: grid;
  gap: 2.5rem;
}

.section-title {
  margin: 0 0 1rem;
  color: var(--color-accent);
  font-size: 0.875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ===== Karta článku ===== */

.post-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 1px 2px var(--shadow-color);
}

.post-card:hover {
  box-shadow: 0 16px 32px var(--shadow-color);
}

/* Pohyb jen pro ty, kdo si v systému neomezili animace. */
@media (prefers-reduced-motion: no-preference) {
  .post-card {
    /* transition: plynulý přechod, naučíš se ho v sekci o animacích */
    transition: translate 0.25s, box-shadow 0.25s;
  }

  .post-card:hover {
    translate: 0 -4px;
  }
}

.post-card__image {
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.35), transparent 50%),
    var(--photo);
}

.post-card__meta {
  margin: 0 0 0.25rem;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.post-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  line-height: 1.25;
}

.post-card__title a {
  text-decoration: none;
}

.post-card__title a:hover {
  color: var(--color-accent);
}

.post-card__title a:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.post-card__excerpt {
  margin: 0;
  color: var(--color-text-soft);
}

/* ===== Odběr novinek ===== */

.newsletter {
  display: grid;
  gap: 0.5rem;
  margin-block-start: 1.5rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: var(--color-soft);
}

.newsletter label {
  font-weight: 700;
}

.newsletter input {
  min-block-size: 2.75rem;
  padding-inline: 0.75rem;
  border: 1px solid var(--color-field-line);
  border-radius: 0.5rem;
  font: inherit;
}

.newsletter button {
  min-block-size: 2.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* ===== Patička ===== */

.site-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}

.site-footer p {
  margin: 0;
}

/* ===== Rozvržení ===== */

@media (width >= 60rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 20rem;
  }
}

/* Karta se rozhoduje podle místa, které dostala. */
.post-list__item {
  container-type: inline-size;
}

@container (width >= 30rem) {
  .post-card {
    grid-template-columns: 11rem 1fr;
    align-items: start;
  }

  .post-card__image {
    aspect-ratio: 1;
  }
}
```
