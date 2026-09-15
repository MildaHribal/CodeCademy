---
title: Příspěvek na sociální síti
see: css-box-model/normalni-tok#display-meni-druh-boxu, css-box-model/box-model#box-sizing-co-presne-meri-width
---

# --description--

Běžecký klub má na webu vlastní nástěnku a tohle je jeden příspěvek z ní: autorka s avatarem, text, fotka, štítky, tlačítka a pole pro odpověď. HTML je hotové a vzhled (barvy, písmo, zaoblení, stín) taky. Jenže kdo příspěvek styloval, nerozuměl normálnímu toku: štítky na telefonu lezou přes sebe, tlačítka jsou malá, pod fotkou je proužek a nápis, který měl být skrytý, je vidět. Oprav to v souboru `styles.css` pod komentářem `/* Tvoje úpravy */`.

Tentokrát bez návodu. U každého rozbitého místa si nejdřív řekni, jestli jde o blokový, nebo řádkový box, a co z box modelu na něj působí.

Téma, texty a vzhled jsou tvoje volba: klidně z příspěvku udělej recenzi knihy nebo fotku z dovolené. Testy kontrolují jen rozvržení podle tříd v HTML.

**Co má příspěvek umět:**

- Na počítači je příspěvek čitelně úzký sloupec uprostřed stránky, nejvýš 40rem široký.
- Na telefonu jde celá stránka posouvat jen svisle, nic nepřečnívá do strany.
- Pole pro odpověď je přes celou šířku obsahu příspěvku, ne víc.
- Fotka vyplní celou šířku obsahu příspěvku a pod obrázkem není proužek tmavého pozadí.
- Avatar je svisle vycentrovaný se jménem autorky.
- Štítky zůstanou v řádku textu, ale každý je celistvá „pilulka": nerozdělí se na dva řádky, řádky štítků se nepřekrývají a mezi řádky zůstane malá mezera (aspoň 4 px).
- Tlačítka „Líbí se mi" a „Komentovat" jsou dotykové cíle vysoké aspoň 44 px a široké jen podle svého textu.
- Nápis „Uloženo do sbírky" se ukáže až po uložení (to dodělá kolega v JavaScriptu). Zatím není vidět, ale drží si místo, aby se po jeho ukázání nic neposunulo.
- Odkaz „Nahlásit příspěvek" má v HTML atribut `hidden` a nesmí být vidět ani zabírat místo. Až kolega atribut odebere, má se ukázat.

Testy měří na šířce 1024 px a 375 px, obě si přepneš nad náhledem („Jako testy" a 375).

# --hints--

Na šířce 1024 px je příspěvek široký nejvýš 40rem (640 px) a je vodorovně uprostřed stránky.

```js
const post = document.querySelector('.post').getBoundingClientRect();
const right = document.documentElement.clientWidth - post.right;
assert.ok(post.width <= 641, `Příspěvek je široký ${Math.round(post.width)} px, má být nejvýš 640 px`);
assert.ok(post.width >= 320, `Příspěvek je široký jen ${Math.round(post.width)} px — na počítači má být čitelný sloupec, ne úzký proužek`);
assert.ok(Math.abs(post.left - right) <= 2, `Vlevo od příspěvku je ${Math.round(post.left)} px, vpravo ${Math.round(right)} px — má být uprostřed`);
```

Na šířce 375 px nejde stránka posouvat do strany.

```js
await helpers.resize(375);
const root = document.documentElement;
assert.ok(root.scrollWidth <= root.clientWidth, `Při šířce 375 px je obsah stránky široký ${root.scrollWidth} px, okno jen ${root.clientWidth} px`);
```

Pole pro odpověď je přes celou šířku obsahu příspěvku a nepřečnívá.

```js
for (const width of [1024, 375]) {
  await helpers.resize(width);
  const post = document.querySelector('.post');
  const style = getComputedStyle(post);
  const box = post.getBoundingClientRect();
  const contentLeft = box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
  const contentRight = box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
  const field = document.querySelector('.post__field').getBoundingClientRect();
  assert.ok(Math.abs(field.left - contentLeft) <= 1 && Math.abs(field.right - contentRight) <= 1, `Při šířce ${width} px je pole od ${Math.round(field.left)} do ${Math.round(field.right)} px, obsah příspěvku od ${Math.round(contentLeft)} do ${Math.round(contentRight)} px`);
}
```

Fotka vyplní celou šířku obsahu příspěvku a pod obrázkem není proužek pozadí.

```js
const post = document.querySelector('.post');
const style = getComputedStyle(post);
const box = post.getBoundingClientRect();
const contentWidth = box.width - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
const figure = document.querySelector('.post__media').getBoundingClientRect();
const image = document.querySelector('.post__media img').getBoundingClientRect();
assert.ok(Math.abs(figure.width - contentWidth) <= 1, `Rámeček fotky je široký ${Math.round(figure.width)} px, obsah příspěvku ${Math.round(contentWidth)} px`);
assert.ok(Math.abs(image.width - figure.width) <= 1, `Obrázek je široký ${Math.round(image.width)} px, rámeček fotky ${Math.round(figure.width)} px`);
assert.ok(Math.abs(figure.height - image.height) <= 0.5, `Rámeček fotky je vysoký ${figure.height.toFixed(1)} px, obrázek ${image.height.toFixed(1)} px — pod obrázkem je proužek`);
```

Avatar je svisle vycentrovaný se jménem autorky.

```js
const avatar = document.querySelector('.post__avatar').getBoundingClientRect();
const range = document.createRange();
range.selectNodeContents(document.querySelector('.post__name'));
const name = range.getBoundingClientRect();
const avatarMiddle = avatar.top + avatar.height / 2;
const nameMiddle = name.top + name.height / 2;
assert.ok(name.left >= avatar.right, 'Jméno má být vpravo od avataru, ve stejném řádku');
assert.ok(Math.abs(avatarMiddle - nameMiddle) <= 5, `Střed avataru je na ${Math.round(avatarMiddle)} px, střed jména na ${Math.round(nameMiddle)} px — mají být na stejné výšce`);
```

Štítky zůstávají v řádku textu: na šířce 1024 px stojí aspoň dva štítky vedle sebe ve stejném řádku.

```js
const tags = [...document.querySelectorAll('.tag')].map((tag) => tag.getBoundingClientRect());
assert.ok(tags.length >= 2, 'Příspěvek má mít aspoň dva štítky .tag');
assert.ok(Math.abs(tags[1].top - tags[0].top) <= 1 && tags[1].left >= tags[0].right, 'Druhý štítek má stát vedle prvního ve stejném řádku, ne pod ním');
```

Na šířce 375 px se žádný štítek nerozdělí na dva řádky.

```js
await helpers.resize(375);
document.querySelectorAll('.tag').forEach((tag) => {
  const parts = tag.getClientRects().length;
  assert.equal(parts, 1, `Štítek „${tag.textContent.trim()}" je rozdělený na ${parts} kusy — má zůstat celý (počet obdélníků)`);
});
```

Na šířce 375 px se řádky štítků nepřekrývají a mezi řádky je aspoň 4 px.

```js
await helpers.resize(375);
const tags = [...document.querySelectorAll('.tag')].map((tag) => tag.getBoundingClientRect());
const rows = [];
for (const tag of tags) {
  const row = rows.find((r) => Math.abs(r.top - tag.top) <= 2);
  if (row) row.bottom = Math.max(row.bottom, tag.bottom);
  else rows.push({ top: tag.top, bottom: tag.bottom });
}
assert.ok(rows.length >= 2, `Při šířce 375 px jsou štítky v ${rows.length} řádku — mají se zalomit do víc řádků (máš jich dost?)`);
rows.sort((a, b) => a.top - b.top);
for (let i = 1; i < rows.length; i++) {
  const space = rows[i].top - rows[i - 1].bottom;
  assert.ok(space >= 4, `Mezi ${i}. a ${i + 1}. řádkem štítků je ${Math.round(space)} px — štítky se nesmí překrývat a mezi řádky mají být aspoň 4 px`);
}
```

Tlačítka „Líbí se mi" a „Komentovat" jsou vysoká aspoň 44 px.

```js
for (const selector of ['.post__like', '.post__comment']) {
  const height = document.querySelector(selector).getBoundingClientRect().height;
  assert.ok(height >= 43.5, `${selector} je vysoké ${Math.round(height)} px, dotykový cíl má mít aspoň 44 px`);
}
```

Tlačítka stojí vedle sebe v jednom řádku a každé je jen tak široké jako jeho text s odsazením.

```js
const like = document.querySelector('.post__like');
const comment = document.querySelector('.post__comment').getBoundingClientRect();
const box = like.getBoundingClientRect();
const range = document.createRange();
range.selectNodeContents(like);
const text = range.getBoundingClientRect();
assert.ok(comment.left >= box.right && comment.top < box.bottom, 'Tlačítko „Komentovat" má stát vpravo od „Líbí se mi" ve stejném řádku');
assert.ok(box.width <= text.width + 80, `„Líbí se mi" je široké ${Math.round(box.width)} px, jeho text jen ${Math.round(text.width)} px — tlačítko se nemá roztahovat`);
```

Nápis „Uloženo do sbírky" není vidět, ale drží si své místo v řádku.

```js
const saved = document.querySelector('.post__saved');
const style = getComputedStyle(saved);
assert.equal(style.visibility, 'hidden', 'getComputedStyle(.post__saved).visibility má být hidden — nápis nemá být vidět');
assert.ok(saved.getBoundingClientRect().width > 0, 'Nápis .post__saved nezabírá žádné místo — má být skrytý, ale držet si místo');
```

Odkaz „Nahlásit příspěvek" s atributem `hidden` není vidět a nezabírá místo; po odebrání atributu se ukáže.

```js
const report = document.querySelector('.post__report');
assert.ok(report.hasAttribute('hidden'), 'Prvek .post__report má mít v HTML dál atribut hidden');
assert.equal(getComputedStyle(report).display, 'none', 'getComputedStyle(.post__report).display má být none, dokud má atribut hidden');
report.removeAttribute('hidden');
const shown = getComputedStyle(report).display;
report.setAttribute('hidden', '');
assert.notEqual(shown, 'none', 'Po odebrání atributu hidden má být odkaz vidět (display jiné než none)');
```

# --help--

## --tip-- 5

Obrázek je řádkový prvek a ve výchozím stavu sedí na účaří řádku. Jak ho v řádku zarovnat jinak, najdeš v [Mezera pod obrázkem](see:css-box-model/normalni-tok#mezera-pod-obrazkem).

## --tip-- 8

Svislý padding řádkového boxu se kreslí přes okolní řádky, ale neodsouvá je. Porovnej obě varianty v části [display mění druh boxu](see:css-box-model/normalni-tok#display-meni-druh-boxu).

# --approaches--

## --approach-- Resety na začátku stylopisu

Obecné problémy (`box-sizing`, obrázky na účaří, atribut `hidden`) se opraví jednou pro celý web a na komponentě zůstane jen to, co je opravdu její. Hodí se, když stylopis zakládáš nebo můžeš reset přidat do celého projektu. Pozor: kdybys přidal i obvyklý reset `img { display: block }`, zasáhne i avatar, který má zůstat v řádku se jménem.

### --file-- styles.css

```css
:root {
  --color-bg: #f5f3ff;
  --color-surface: #ffffff;
  --color-text: #1e1b4b;
  --color-muted: #6b7280;
  --color-accent: #7c3aed;
  --color-accent-soft: #ede9fe;
  --color-line: #e5e7eb;
  --radius: 1rem;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.5;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

.post {
  padding: 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgb(30 27 75 / 0.06), 0 12px 32px rgb(30 27 75 / 0.08);
}

.post__avatar {
  border-radius: 50%;
}

.post__name {
  font-weight: 700;
}

.post__handle,
.post__time {
  color: var(--color-muted);
}

.post__text {
  margin-block: 1rem;
}

.post__media {
  border-radius: 0.75rem;
  background: var(--color-text);
  overflow: hidden;
}

.tag {
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease, color 150ms ease;
}

.tag:hover {
  background: var(--color-accent);
  color: #fff;
}

.post__actions {
  padding-block-start: 0.75rem;
  border-block-start: 1px solid var(--color-line);
}

.post__like,
.post__comment {
  padding: 0.625rem 1rem;
  border-radius: 999px;
  color: var(--color-text);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.post__like {
  background: var(--color-accent-soft);
}

.post__like:hover,
.post__comment:hover {
  background: var(--color-line);
}

.post__like:focus-visible,
.post__comment:focus-visible,
.tag:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.post__saved {
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
}

.post__report {
  display: block;
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}

.post__label {
  display: block;
  margin-block: 1rem 0.25rem;
  font-weight: 600;
}

.post__field {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-line);
  border-radius: 0.75rem;
  font: inherit;
  resize: vertical;
}

.post__field:focus-visible {
  border-color: var(--color-accent);
  outline: none;
}

/* Tvoje úpravy */

*,
*::before,
*::after {
  box-sizing: border-box;
}

.post {
  max-inline-size: 36rem;
  margin-inline: auto;
}

.post__avatar {
  vertical-align: middle;
  margin-inline-end: 0.5rem;
}

.post__media {
  margin: 0;
}

.post__media img {
  display: block;
}

.tag {
  display: inline-block;
  margin-block: 0.25rem;
}

.post__like,
.post__comment {
  display: inline-block;
  min-block-size: 2.75rem;
}

.post__saved {
  visibility: hidden;
}

[hidden] {
  display: none !important;
}
```

## --approach-- Opravy jen na komponentě

Nic globálního: každá oprava se týká jen tříd příspěvku, obrázek zůstane řádkový s `vertical-align: top` a atribut `hidden` hlídá selektor `.post__report[hidden]`. Hodí se v cizím projektu, kde nesmíš sáhnout na styly zbytku webu.

### --file-- styles.css

```css
:root {
  --color-bg: #f5f3ff;
  --color-surface: #ffffff;
  --color-text: #1e1b4b;
  --color-muted: #6b7280;
  --color-accent: #7c3aed;
  --color-accent-soft: #ede9fe;
  --color-line: #e5e7eb;
  --radius: 1rem;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.5;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

.post {
  padding: 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgb(30 27 75 / 0.06), 0 12px 32px rgb(30 27 75 / 0.08);
}

.post__avatar {
  border-radius: 50%;
}

.post__name {
  font-weight: 700;
}

.post__handle,
.post__time {
  color: var(--color-muted);
}

.post__text {
  margin-block: 1rem;
}

.post__media {
  border-radius: 0.75rem;
  background: var(--color-text);
  overflow: hidden;
}

.tag {
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease, color 150ms ease;
}

.tag:hover {
  background: var(--color-accent);
  color: #fff;
}

.post__actions {
  padding-block-start: 0.75rem;
  border-block-start: 1px solid var(--color-line);
}

.post__like,
.post__comment {
  padding: 0.625rem 1rem;
  border-radius: 999px;
  color: var(--color-text);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.post__like {
  background: var(--color-accent-soft);
}

.post__like:hover,
.post__comment:hover {
  background: var(--color-line);
}

.post__like:focus-visible,
.post__comment:focus-visible,
.tag:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.post__saved {
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
}

.post__report {
  display: block;
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}

.post__label {
  display: block;
  margin-block: 1rem 0.25rem;
  font-weight: 600;
}

.post__field {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-line);
  border-radius: 0.75rem;
  font: inherit;
  resize: vertical;
}

.post__field:focus-visible {
  border-color: var(--color-accent);
  outline: none;
}

/* Tvoje úpravy */

.post {
  max-width: 36rem;
  margin: 0 auto;
}

.post__avatar {
  vertical-align: middle;
}

.post__media {
  margin-inline: 0;
}

/* Obrázek zůstane řádkový, jen nesedí na účaří. */
.post__media img {
  vertical-align: top;
}

.tag {
  display: inline-block;
  margin-block-end: 0.375rem;
}

/* 10 px padding nahoře a dole + 24 px řádek = 44 px. */
.post__like,
.post__comment {
  display: inline-block;
}

.post__saved {
  visibility: hidden;
}

/* Přebije display: block z .post__report, jen dokud má prvek atribut hidden. */
.post__report[hidden] {
  display: none;
}

.post__field {
  box-sizing: border-box;
}
```

# --review--

Testy kontrolují rozvržení. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- U každé opravy umíš říct, jestli šlo o blokový, nebo řádkový box.
- Tlačítka nemají pevnou `width` ani `height`, rozměr jim dává obsah, padding a nejmenší výška.
- Nepoužil jsi `display: block` na štítky ani tlačítka, které mají zůstat v řádku.
- Víš, proč `visibility: hidden` u nápisu „Uloženo" a `display: none` u nahlášení, a ne naopak.
- Prošel jsi náhled v šířkách „Jako testy" a 375 a nic nepřeteklo.

## --extensions--

Rozšíření bez testů: druhý příspěvek pod prvním se společnou mezerou mezi příspěvky, počet komentářů jako malé kulaté číslo vedle tlačítka „Komentovat" s nejmenší šířkou, aby i jednociferné číslo bylo kolečko, a vlastní téma nástěnky s vlastní paletou v tokenech.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Běžecký klub Přehrada — příspěvek</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="feed">
      <article class="post">
        <header class="post__header">
          <img class="post__avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23f472b6'/%3E%3Cstop offset='1' stop-color='%237c3aed'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='96' height='96' fill='url(%23g)'/%3E%3Ctext x='48' y='62' font-family='Arial,sans-serif' font-size='42' font-weight='700' fill='white' text-anchor='middle'%3EKN%3C/text%3E%3C/svg%3E" width="48" height="48" alt="">
          <span class="post__author"><strong class="post__name">Klára Nováková</strong> <span class="post__handle">@klara.bezi</span> · <time class="post__time" datetime="2026-09-14">včera v 7:12</time></span>
        </header>

        <p class="post__text">Nedělní desítka kolem Brněnské přehrady. Mlha se zvedla přesně na mostě u Rokle a poslední dva kilometry byly nejhezčí za celý rok. Kdo se přidá příští týden? Sraz v 7:00 u přístaviště.</p>

        <figure class="post__media">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Cdefs%3E%3ClinearGradient id='s' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23fde68a'/%3E%3Cstop offset='1' stop-color='%23fb923c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23s)'/%3E%3Ccircle cx='470' cy='130' r='46' fill='%23fff7ed'/%3E%3Cpath d='M0 230 120 150l90 60 110-90 140 100 90-50 90 60v130H0Z' fill='%236d28d9' opacity='.55'/%3E%3Cpath d='M0 270 140 210l120 50 130-70 120 70 130-40v130H0Z' fill='%234c1d95'/%3E%3Crect y='300' width='640' height='60' fill='%230e7490'/%3E%3Cpath d='M0 318h640M0 336h640' stroke='%2367e8f9' stroke-width='3' stroke-dasharray='30 22' opacity='.6'/%3E%3C/svg%3E" width="640" height="360" alt="Východ slunce nad Brněnskou přehradou">
        </figure>

        <p class="post__tags">
          <a class="tag" href="#">#nedělní běh</a>
          <a class="tag" href="#">#Brněnská přehrada</a>
          <a class="tag" href="#">#10 km</a>
          <a class="tag" href="#">#běh v mlze</a>
          <a class="tag" href="#">#běžecký klub</a>
          <a class="tag" href="#">#podzim 2026</a>
        </p>

        <footer class="post__actions">
          <a class="post__like" href="#">Líbí se mi · 128</a>
          <a class="post__comment" href="#">Komentovat</a>
          <span class="post__saved">Uloženo do sbírky</span>
        </footer>

        <p class="post__report" hidden><a href="#">Nahlásit příspěvek</a></p>

        <form class="post__reply">
          <label class="post__label" for="reply">Tvoje odpověď</label>
          <textarea class="post__field" id="reply" rows="3" placeholder="Přidám se, sraz u přístaviště."></textarea>
        </form>
      </article>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --color-bg: #f5f3ff;
  --color-surface: #ffffff;
  --color-text: #1e1b4b;
  --color-muted: #6b7280;
  --color-accent: #7c3aed;
  --color-accent-soft: #ede9fe;
  --color-line: #e5e7eb;
  --radius: 1rem;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.5;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

.post {
  padding: 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgb(30 27 75 / 0.06), 0 12px 32px rgb(30 27 75 / 0.08);
}

.post__avatar {
  border-radius: 50%;
}

.post__name {
  font-weight: 700;
}

.post__handle,
.post__time {
  color: var(--color-muted);
}

.post__text {
  margin-block: 1rem;
}

.post__media {
  border-radius: 0.75rem;
  background: var(--color-text);
  overflow: hidden;
}

.tag {
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease, color 150ms ease;
}

.tag:hover {
  background: var(--color-accent);
  color: #fff;
}

.post__actions {
  padding-block-start: 0.75rem;
  border-block-start: 1px solid var(--color-line);
}

.post__like,
.post__comment {
  padding: 0.625rem 1rem;
  border-radius: 999px;
  color: var(--color-text);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.post__like {
  background: var(--color-accent-soft);
}

.post__like:hover,
.post__comment:hover {
  background: var(--color-line);
}

.post__like:focus-visible,
.post__comment:focus-visible,
.tag:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.post__saved {
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
}

.post__report {
  display: block;
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}

.post__label {
  display: block;
  margin-block: 1rem 0.25rem;
  font-weight: 600;
}

.post__field {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-line);
  border-radius: 0.75rem;
  font: inherit;
  resize: vertical;
}

.post__field:focus-visible {
  border-color: var(--color-accent);
  outline: none;
}

/* Tvoje úpravy */
--edit--

--edit--
```

# --solution--

## --file-- styles.css

```css
:root {
  --color-bg: #f5f3ff;
  --color-surface: #ffffff;
  --color-text: #1e1b4b;
  --color-muted: #6b7280;
  --color-accent: #7c3aed;
  --color-accent-soft: #ede9fe;
  --color-line: #e5e7eb;
  --radius: 1rem;
  --font-body: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  margin: 0;
  padding: 2rem 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.5;
}

img {
  max-inline-size: 100%;
  block-size: auto;
}

.post {
  padding: 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgb(30 27 75 / 0.06), 0 12px 32px rgb(30 27 75 / 0.08);
}

.post__avatar {
  border-radius: 50%;
}

.post__name {
  font-weight: 700;
}

.post__handle,
.post__time {
  color: var(--color-muted);
}

.post__text {
  margin-block: 1rem;
}

.post__media {
  border-radius: 0.75rem;
  background: var(--color-text);
  overflow: hidden;
}

.tag {
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease, color 150ms ease;
}

.tag:hover {
  background: var(--color-accent);
  color: #fff;
}

.post__actions {
  padding-block-start: 0.75rem;
  border-block-start: 1px solid var(--color-line);
}

.post__like,
.post__comment {
  padding: 0.625rem 1rem;
  border-radius: 999px;
  color: var(--color-text);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.post__like {
  background: var(--color-accent-soft);
}

.post__like:hover,
.post__comment:hover {
  background: var(--color-line);
}

.post__like:focus-visible,
.post__comment:focus-visible,
.tag:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.post__saved {
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 600;
}

.post__report {
  display: block;
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}

.post__label {
  display: block;
  margin-block: 1rem 0.25rem;
  font-weight: 600;
}

.post__field {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-line);
  border-radius: 0.75rem;
  font: inherit;
  resize: vertical;
}

.post__field:focus-visible {
  border-color: var(--color-accent);
  outline: none;
}

/* Tvoje úpravy */

*,
*::before,
*::after {
  box-sizing: border-box;
}

.post {
  max-inline-size: 36rem;
  margin-inline: auto;
}

.post__avatar {
  vertical-align: middle;
  margin-inline-end: 0.5rem;
}

.post__media {
  margin: 0;
}

.post__media img {
  display: block;
}

.tag {
  display: inline-block;
  margin-block: 0.25rem;
}

.post__like,
.post__comment {
  display: inline-block;
  min-block-size: 2.75rem;
}

.post__saved {
  visibility: hidden;
}

[hidden] {
  display: none !important;
}
```
