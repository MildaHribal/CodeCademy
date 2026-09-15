# Barvy v oklch a typografie

Paleta značky, tlačítko, které je čitelné ve světlém i tmavém motivu, a nadpisy, které do sebe zapadají — to řeší každý web od e-shopu po administraci. V lekci se naučíš barvy vybírat číslem, kterému jde věřit, a velikosti písma počítat, místo aby ses je snažil trefit od oka.

:::check pretest
Máš dvě barvy: `oklch(0.7 0.15 30)` (lososová) a `oklch(0.7 0.15 250)` (modrá). Odhadni, která z nich je pro oko světlejší.

### --answer--
Lososová, teplé barvy jsou pro oko světlejší.

#### --why--
Teplota barvy tady nerozhoduje. Co přesně znamenají tři čísla v `oklch()`, uvidíš v první části lekce.

### --correct--
Obě stejně, protože mají stejné první číslo.

#### --why--
První číslo `oklch()` je světlost tak, jak ji vnímá oko. Stejné číslo znamená stejně světlou barvu, ať je odstín jakýkoli. U `hsl()` to neplatí, jak ukáže hned první ukázka.

### --answer--
Modrá, protože 250 je víc než 30.

#### --why--
Třetí číslo je odstín, tedy úhel na barevném kole. Se světlostí nesouvisí.
:::

## Problém: hsl lže o světlosti

Formát `hsl()` (odstín, sytost, světlost) je pohodlný na čtení, ale jeho světlost neodpovídá tomu, co vidí oko. Když si podle ní postavíš paletu, vyjdou ti tlačítka, na kterých bílý text jednou je čitelný a jindy ne.

:::live predict
```html
<div class="buttons">
  <button class="yellow">Koupit</button>
  <button class="blue">Koupit</button>
</div>
<p class="result" hidden>Kontrast s bílou: žlutá <strong id="r1"></strong>, modrá <strong id="r2"></strong>. Pro běžný text je potřeba aspoň 4,5 : 1.</p>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; }
.buttons { display: flex; gap: 1rem; }
button { padding: 0.75rem 1.5rem; border: 0; border-radius: 8px; color: #fff; font-size: 1.125rem; font-weight: 600; }
.yellow { background: hsl(60 100% 50%); }
.blue { background: hsl(240 100% 50%); }
```
```js
// Spočítá kontrastní poměr barvy pozadí s bílou (vzorec WCAG).
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const luminance = (color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = [...ctx.getImageData(0, 0, 1, 1).data].map((v) => v / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (el) => (1.05 / (luminance(getComputedStyle(el).backgroundColor) + 0.05)).toFixed(2).replace('.', ',');
document.querySelector('#r1').textContent = `${ratio(document.querySelector('.yellow'))} : 1`;
document.querySelector('#r2').textContent = `${ratio(document.querySelector('.blue'))} : 1`;
document.querySelector('.result').hidden = false;
```
--question-- Obě tlačítka mají v `hsl()` světlost 50 %. Na kterém bude bílý text čitelnější?
--option-- Na obou stejně, protože mají stejnou světlost.
--option*-- Na modrém.
--option-- Na žlutém.
--why-- Pod tlačítky je kontrastní poměr: žlutá s bílou kolem 1,07 : 1 (text skoro zmizí), modrá kolem 8,6 : 1. Číslo světlosti v `hsl()` nebere ohled na to, že oko vnímá zelenou a žlutou mnohem jasněji než modrou. Zkus v CSS změnit obě barvy na `oklch(0.55 0.15 100)` a `oklch(0.55 0.15 265)` — poměry se k sobě přiblíží.
--see-- css-design/barvy-a-typografie#oklch-svetlost-chroma-a-odstin
:::

> [!REMEMBER]
> **V `oklch()` odpovídá první číslo světlosti tak, jak ji vnímá oko. Barvy se stejnou světlostí mají vůči bílé nebo černé podobný kontrast, ať mají jakýkoli odstín.** Proto se v nich staví palety, ve kterých platí jedno pravidlo pro všechny barvy.

:::check
Návrhář chce řadu barevných štítků (zelený, oranžový, fialový) s bílým textem a všechny mají být stejně čitelné. Ve kterém zápisu je jednodušší to zajistit?

### --answer--
V `hsl()`, stačí všem dát stejnou světlost.

#### --why--
Stejná světlost v `hsl()` dá žluté a zelené odstíny mnohem světlejší než fialové, takže kontrast se bude lišit.

### --correct--
V `oklch()`, stačí všem dát stejnou světlost a měnit jen odstín.

#### --why--
Světlost v `oklch()` sleduje vnímání oka, takže kontrast s bílým textem zůstane u všech odstínů podobný.

### --answer--
V `#hex`, protože je nejpřesnější.

#### --why--
Hex je jen jiný zápis červené, zelené a modré. Přesný je, ale ze tří dvojic čísel nepoznáš, jak je barva světlá.
:::

## `oklch()`: světlost, chroma a odstín

Zápis `oklch(L C H)` má tři čísla:

- **L** — [[světlost]] (*lightness*) od `0` (černá) do `1` (bílá). Smíš psát i procenta: `0.55` = `55%`.
- **C** — [[chroma]], tedy sytost, od `0` (šedá). Běžné barvy na webu mají 0.05 až 0.2, víc než asi 0.3 displej stejně neukáže.
- **H** — odstín (*hue*) jako úhel 0–360: kolem 30 červená, 90 žlutá, 145 zelená, 250 modrá, 300 fialová.

Průhlednost se přidá za lomítko: `oklch(0.55 0.15 250 / 0.5)`. Všechny moderní prohlížeče `oklch()` podporují.

V ukázce měníš všechna tři čísla a pod vzorkem vidíš kontrastní poměr s bílým a s tmavým textem.

:::live
```html
<div class="swatch">
  <p class="light">Bílý text</p>
  <p class="dark">Tmavý text</p>
</div>
<p class="info">S bílou: <strong id="white"></strong> · S tmavou: <strong id="dark"></strong></p>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; }
.swatch {
  display: flex;
  gap: 1.5rem;
  max-width: 22rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: oklch(var(--l) var(--c) var(--h));
  font-size: 1.125rem;
  font-weight: 600;
}
.swatch p { margin: 0; }
.light { color: #fff; }
.dark { color: #111827; }
```
```js
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const luminance = (color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = [...ctx.getImageData(0, 0, 1, 1).data].map((v) => v / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return `${((x + 0.05) / (y + 0.05)).toFixed(2).replace('.', ',')} : 1`;
};
// Posuvníky mění CSS proměnné bez obnovení stránky, proto čteme barvu opakovaně.
setInterval(() => {
  const bg = getComputedStyle(document.querySelector('.swatch')).backgroundColor;
  document.querySelector('#white').textContent = ratio(bg, '#fff');
  document.querySelector('#dark').textContent = ratio(bg, '#111827');
}, 200);
```
```controls
--l: range(0, 1, 0.01) = 0.55 | Světlost L
--c: range(0, 0.35, 0.01) = 0.15 | Chroma C
--h: range(0, 360, 5) = 250 | Odstín H
```
:::

Nech světlost na 0.55 a toč jen odstínem od 0 do 360. Kontrast s bílou se pohybuje jen mezi asi 4,2 a 5,3 : 1. Pak zvedni světlost na 0.75 — bílý text přestane být čitelný u všech odstínů najednou a tmavý text naopak ožije.

> [!NOTE]
> Ne každá kombinace čísel jde na displeji ukázat. Světlá barva s vysokou chromou (třeba `oklch(0.95 0.3 250)`) je mimo barvy obrazovky a prohlížeč ji přizpůsobí nejbližší zobrazitelné. Proto světlé odstíny palety dostávají nízkou chromu.

:::check
Máš barvu značky `oklch(0.62 0.19 150)` (zelená). Napiš zápis barvy, která má **stejnou světlost i sytost**, ale je fialová (odstín 300).

### --expected--
oklch(0.62 0.19 300)

### --accept--
oklch(62% 0.19 300)

### --why--
Odstín je třetí číslo. Světlost a chroma zůstanou, takže fialová bude mít s bílým textem skoro stejný kontrast jako zelená.
:::

## Stupnice odstínů z jedné barvy

Design systémy mají od každé barvy řadu odstínů: `50` skoro bílý na pozadí štítku, `500` základní, `700` na text a hover, `900` skoro černý. Ručně vybrat deset barev, které k sobě sedí, je práce pro návrháře. V CSS si je umíš **odvodit z jedné barvy**.

[[relativní barva|Relativní barva]] (*relative color syntax*) vezme existující barvu, rozloží ji na kanály a z nich poskládá novou:

```css
:root {
  --brand: oklch(0.55 0.16 265);

  /* 1. světlost napevno, 2. chroma zlomek původní, 3. odstín převezmi */
  --brand-50: oklch(from var(--brand) 0.97 calc(c * 0.2) h);
  --brand-100: oklch(from var(--brand) 0.93 calc(c * 0.35) h);
  --brand-700: oklch(from var(--brand) 0.42 c h);
  --brand-900: oklch(from var(--brand) 0.28 calc(c * 0.7) h);
}
```

Za `from` je výchozí barva a písmena `l`, `c`, `h` jsou její kanály jako čísla. Když změníš `--brand`, přebarví se celá stupnice.

Druhý nástroj je `color-mix()`, který smíchá dvě barvy v zadaném poměru. Hodí se na hover nebo průhledné pozadí:

```css
.button:hover {
  /* 85 % barvy tlačítka a 15 % černé, míchá se v oklch */
  background: color-mix(in oklch, var(--brand), black 15%);
}
```

V ukázce posuvník mění odstín značky a všech pět vzorků se odvodí z něj.

:::live
```html
<div class="scale">
  <span class="s50">50</span>
  <span class="s100">100</span>
  <span class="s500">500</span>
  <span class="s700">700</span>
  <span class="s900">900</span>
</div>
<p class="tag">Novinka</p>
```
```css
:root {
  --brand: oklch(0.55 0.16 var(--hue));
  --brand-50: oklch(from var(--brand) 0.97 calc(c * 0.2) h);
  --brand-100: oklch(from var(--brand) 0.93 calc(c * 0.35) h);
  --brand-700: oklch(from var(--brand) 0.42 c h);
  --brand-900: oklch(from var(--brand) 0.28 calc(c * 0.7) h);
}
body { margin: 1.5rem; font-family: system-ui, sans-serif; }
.scale { display: flex; gap: 0.5rem; }
.scale span { display: grid; place-items: center; width: 4rem; height: 4rem; border-radius: 12px; font-weight: 600; }
.s50 { background: var(--brand-50); color: var(--brand-900); }
.s100 { background: var(--brand-100); color: var(--brand-900); }
.s500 { background: var(--brand); color: #fff; }
.s700 { background: var(--brand-700); color: #fff; }
.s900 { background: var(--brand-900); color: #fff; }
.tag { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; background: var(--brand-100); color: var(--brand-700); font-weight: 600; }
```
```controls
--hue: range(0, 360, 10) = 265 | Odstín značky
```
:::

Toč odstínem a sleduj štítek „Novinka": pozadí `100` a text `700` jsou čitelné pro každý odstín, protože stupnice drží světlost pevně. Zkus v kódu u `--brand-50` chromu `calc(c * 0.2)` nahradit za `c` a podívej se, jak křiklavě pak vypadá skoro bílé pozadí.

:::check
Z barvy `--accent` chceš vyrobit tmavší variantu na text: stejný odstín i sytost, jen světlost 0.4. Doplň relativní barvu: `oklch(from var(--accent) … )`. Napiš celý zápis.

### --expected--
oklch(from var(--accent) 0.4 c h)

### --accept--
oklch(from var(--accent) 40% c h)

### --why--
Místo kanálu `l` napíšeš novou hodnotu, `c` a `h` převezmeš z výchozí barvy.
:::

## Kontrast podle WCAG

Aby text šel přečíst i na slunci, na levném monitoru nebo se slabším zrakem, musí se dost lišit od pozadí. Ze sekce o přístupnosti znáš pravidla WCAG a kontrastní poměr (*contrast ratio*) od 1 : 1 (stejné barvy) po 21 : 1 (černá na bílé). Tady je důležité, že je musíš splnit **už při návrhu palety**, ne až při kontrole hotové stránky. Úroveň AA chce:

| co | nejmenší poměr |
|---|---|
| běžný text | **4,5 : 1** |
| velký text (od 24 px, nebo od 18,7 px tučně) | **3 : 1** |
| hranice ovládacích prvků a ikony, které nesou význam (okraj pole, ikona bez textu, fokus) | **3 : 1** |

Pro přísnější úroveň AAA je u textu potřeba 7 : 1. Dekorace, loga a neaktivní prvky kontrast splňovat nemusí.

Poměr nespočítáš z hlavy, ale nemusíš: v DevTools klikni na barevný čtvereček u `color`, výběr barvy ukáže **Contrast ratio** i čáry pro AA a AAA. Kontrast se vždy měří **dvojice** barev — text sám o sobě žádný kontrast nemá.

> [!NOTE]
> Nová CSS funkce `contrast-color(var(--bg))` vrátí bílou, nebo černou podle toho, co má s pozadím větší kontrast. Je to novinka, takže podporu ověř v MDN. Hlavně ale u středně tmavých pozadí 4,5 : 1 nesplní ani bílá, ani černá, takže paletu stejně navrhuj s kontrastem předem.

:::check
Šedý popisek pod polem formuláře má velikost 14 px, normální váhu a kontrast s pozadím 3,9 : 1. Projde úrovní AA? Odpověz ano, nebo ne.

### --expected-- ignore-case
ne

### --why--
14 px normální váhy je běžný text a potřebuje 4,5 : 1. Hranice 3 : 1 platí až od 24 px, nebo od 18,7 px tučně.
:::

## Primitivní a sémantické tokeny

Když komponenty používají přímo `--brand-700` nebo `--gray-500`, tmavý motiv znamená přepsat barvu v každé komponentě. Proto se tokeny dělí do dvou pater:

- [[primitivní token]] (*primitive token*) — **co to je za barvu**: `--gray-900`, `--brand-100`. Jen paleta, komponenty je nepoužívají.
- [[sémantický token]] (*semantic token*) — **k čemu barva slouží**: `--color-text`, `--color-text-muted`, `--color-surface`, `--color-accent`. Komponenty používají jen tyhle.

Tmavý motiv pak změní jen druhé patro. S funkcí `light-dark()` ze sekce o responzivitě a motivech to je jeden řádek na token:

```css
:root {
  color-scheme: light dark;

  --color-surface: light-dark(var(--gray-50), var(--gray-900));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
}

.card { background: var(--color-surface); color: var(--color-text); }
```

V ukázce přepínáš motiv. Karta zná jen sémantické tokeny.

:::live
```html
<article class="card">
  <p class="card__eyebrow">Pozvánka</p>
  <h3 class="card__title">Grilování na zahradě</h3>
  <p class="card__meta">so 17. 10. · od 14:00 · Olomouc</p>
  <a class="card__link" href="#">Potvrdit účast</a>
</article>
```
```css
:root {
  color-scheme: var(--scheme);

  --gray-50: oklch(0.98 0.005 260);
  --gray-400: oklch(0.72 0.02 260);
  --gray-600: oklch(0.48 0.02 260);
  --gray-800: oklch(0.3 0.02 260);
  --gray-900: oklch(0.22 0.02 260);
  --brand-300: oklch(0.78 0.11 155);
  --brand-700: oklch(0.45 0.12 155);

  --color-page: light-dark(oklch(0.94 0.01 260), oklch(0.16 0.015 260));
  --color-surface: light-dark(var(--gray-50), var(--gray-800));
  --color-text: light-dark(var(--gray-900), var(--gray-50));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
  --color-accent: light-dark(var(--brand-700), var(--brand-300));
}
body { margin: 0; padding: 1.5rem; font-family: system-ui, sans-serif; background: var(--color-page); }
.card { max-width: 18rem; padding: 1.5rem; border-radius: 16px; background: var(--color-surface); color: var(--color-text); }
.card p, .card h3 { margin: 0; }
.card__eyebrow { color: var(--color-accent); font-size: 0.875rem; font-weight: 600; }
.card__title { margin-block: 0.25rem; font-size: 1.25rem; }
.card__meta { color: var(--color-text-muted); }
.card__link { display: inline-block; margin-top: 1rem; color: var(--color-accent); font-weight: 600; }
```
```controls
--scheme: toggle(light, dark) | Motiv
```
:::

Přepni na `dark` a všimni si, že karta je v tmavém motivu **světlejší** než stránka: hloubku tu nedělá stín, ale světlejší povrch. Zkus pak v tokenu `--color-text-muted` prohodit tmavou hodnotu na `var(--gray-600)` — v tmavém motivu popisek skoro zmizí.

:::check
Komponenta tlačítka má v CSS `background: var(--brand-600)`. Ve tmavém motivu je potřeba světlejší odstín. Kam tuhle změnu podle dvoupatrového systému napíšeš?

### --answer--
Do pravidla tlačítka přidám media dotaz na tmavý motiv s `background: var(--brand-400)`.

#### --why--
Funguje to, ale stejnou úpravu pak potřebuje každá komponenta s barvou značky. To je přesně problém, který dvě patra tokenů řeší.

### --correct--
Tlačítko přepnu na sémantický token (třeba `--color-accent`) a světlou i tmavou hodnotu nastavím jen v tom tokenu.

#### --why--
Komponenty znají jen účel barvy. Motiv mění, na kterou barvu palety účel ukazuje, na jednom místě.

### --answer--
Změním v tmavém motivu hodnotu `--brand-600` na světlejší barvu.

#### --why--
Primitivní token pak lže: `--brand-600` by v tmavém motivu byla jiná barva, a každý, kdo ho použije pro něco jiného, dostane překvapení.
:::

## Typografická stupnice

Velikosti písma mají stejný problém jako rozestupy: 15, 17, 21 a 26 px od oka k sobě nesedí. [[modulární stupnice]] (*modular scale*) začne od základní velikosti textu a každý další stupeň vynásobí stejným poměrem:

| poměr | jméno | 16 px nahoru |
|---|---|---|
| 1.2 | malá tercie | 16 → 19.2 → 23 → 27.6 → 33.2 |
| 1.25 | velká tercie | 16 → 20 → 25 → 31.25 → 39.1 |
| 1.333 | kvarta | 16 → 21.3 → 28.4 → 37.9 → 50.5 |

Menší poměr se hodí do aplikací s hodně textu na malé ploše, větší na landing page s velkými nadpisy. Kromě velikosti se se stupněm mění i další vlastnosti:

- **Výška řádku** klesá s velikostí: text kolem 1.5, nadpisy 1.1–1.25. Velký nadpis s výškou řádku 1.5 se rozpadá na samostatné řádky.
- **Prostrkání** (`letter-spacing`) u velkých nadpisů mírně záporné (třeba `-0.02em`), u malého textu psaného velkými písmeny kladné.
- **Šířka řádku** textu 45–75 znaků: `max-inline-size: 65ch`.

V ukázce měníš poměr stupnice a velikosti se přepočítají.

:::live
```html
<div class="type">
  <p class="step-3">Nadpis stránky</p>
  <p class="step-2">Nadpis sekce</p>
  <p class="step-1">Nadpis karty</p>
  <p class="step-0">Běžný text odstavce, na kterém stojí celá stupnice.</p>
</div>
```
```css
:root {
  --text-0: 1rem;
  --text-1: calc(var(--text-0) * var(--ratio));
  --text-2: calc(var(--text-1) * var(--ratio));
  --text-3: calc(var(--text-2) * var(--ratio));
}
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #111827; }
.type p { margin: 0 0 0.75rem; }
.step-3 { font-size: var(--text-3); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
.step-2 { font-size: var(--text-2); font-weight: 700; line-height: 1.2; }
.step-1 { font-size: var(--text-1); font-weight: 600; line-height: 1.25; }
.step-0 { font-size: var(--text-0); line-height: 1.5; max-inline-size: 65ch; }
```
```controls
--ratio: select(1.125, 1.2, 1.25, 1.333, 1.5) = 1.25 | Poměr stupnice
```
:::

Přepni na 1.125 — nadpisy se skoro neliší od textu a hierarchie zmizí. Na 1.5 je nadpis stránky přes 50 px, na landing page dobré, v tabulce objednávek moc. Pravým tlačítkem na nadpis → Prozkoumat a v Computed uvidíš spočtenou velikost v px.

:::check
Základ stupnice je 16 px a poměr 1.25. Kolik px má velikost o **dva** stupně nad základem?

### --expected--
25

### --accept--
25 px
25px

### --why--
16 × 1.25 = 20 px je první stupeň, 20 × 1.25 = 25 px druhý.
:::

## Písma: `@font-face` a variabilní fonty

Systémové písmo (`system-ui`) je rychlé a vypadá dobře. Značka ale často chce vlastní písmo. Soubor písma patří **k tvému webu** (formát `woff2`), ne na cizí server — je to rychlejší a návštěvník neposílá svou IP adresu třetí straně. Kvůli písmům načítaným z cizího serveru už německý soud přiznal návštěvníkovi webu odškodné podle GDPR.

```css
@font-face {
  font-family: "Inter Variable";
  src: url("/fonts/inter-variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}

body {
  font-family: "Inter Variable", system-ui, sans-serif;
}
```

- `font-weight: 100 900` říká, že soubor je [[variabilní font]] (*variable font*): **jeden soubor pro všechny váhy** místo pěti souborů pro 400, 500, 600, 700 a 800. Pak funguje i `font-weight: 650`.
- `font-display: swap` ukáže text hned systémovým písmem a vymění ho, až se soubor stáhne. Bez toho může prohlížeč text až tři sekundy nezobrazit. `optional` písmo použije, jen když dorazí okamžitě (hodí se pro pomalé sítě).
- Za jménem písma vždycky následuje **záložní písmo** (`system-ui, sans-serif`), které se použije, než se soubor stáhne nebo když se nestáhne vůbec.

:::check
Stránka používá vlastní písmo a na pomalém mobilu je první dvě sekundy vidět jen obrázky a tlačítka bez textu. Napiš deklaraci do `@font-face`, která zajistí, že text bude vidět hned.

### --expected--
font-display: swap

### --why--
`swap` vykreslí text hned záložním písmem a vlastní písmo dosadí, až se stáhne. Bez `font-display` čeká prohlížeč na soubor s neviditelným textem.
:::

## Typické chyby a pasti

Nejdřív past v relativní barvě. Tipni si, jak dopadne hover varianta:

:::live predict
```html
<div class="swatches">
  <div class="swatch base">základ</div>
  <div class="swatch lighter">světlejší</div>
</div>
```
```css
:root { --brand: oklch(0.5 0.14 250); }
body { margin: 1.5rem; font-family: system-ui, sans-serif; }
.swatches { display: flex; gap: 1rem; }
.swatch { display: grid; place-items: center; width: 7rem; height: 5rem; border: 1px dashed #9ca3af; border-radius: 12px; color: #111827; font-weight: 600; }
.base { background: var(--brand); color: #fff; }
.lighter { background: oklch(from var(--brand) calc(l + 10%) c h); }
```
--question-- Jaké pozadí bude mít vzorek „světlejší"?
--option-- Stejná modrá, jen o 10 % světlejší.
--option-- Bílé, protože se k světlosti přičetlo 10 celých.
--option*-- Žádné, deklarace je neplatná a vzorek zůstane průhledný.
--why-- Kanál `l` je v relativní barvě **číslo** od 0 do 1, a čísla s procenty v `calc()` sčítat nejde. Celá deklarace je neplatná a prohlížeč ji zahodí bez hlášky. Správně je `calc(l + 0.1)`. Zkus to opravit v kódu.
--see-- css-design/barvy-a-typografie#stupnice-odstinu-z-jedne-barvy
:::

> [!PITFALL] Procenta v `calc()` relativní barvy
> *Příznak:* `oklch(from var(--brand) calc(l + 10%) c h)` nedělá nic, prvek nemá pozadí a DevTools deklaraci přeškrtne jako neplatnou.
>
> *Oprava:* kanály `l`, `c`, `h` jsou čísla, takže přičítej číslo: `calc(l + 0.1)`. Samotnou světlost napsat v procentech smíš: `oklch(from var(--brand) 60% c h)`.
>
> Když stejná chyba leží v tokenu (`--brand-soft: oklch(from … calc(l + 10%) c h)`), DevTools u tokenu nic nepřeškrtne. Neplatnost se ukáže až u prvku, který token použije: `background: var(--brand-soft)` pak dostane výchozí průhlednou hodnotu, ne pozadí z dřívějšího pravidla.

> [!PITFALL] Tlumený text, který projde jen ve světlém motivu
> *Příznak:* ve tmavém motivu jsou popisky, časy a zástupný text skoro neviditelné, DevTools ukáže kontrast kolem 2 : 1.
>
> *Oprava:* kontrast kontroluj v obou motivech. Sémantický token pro tlumený text potřebuje ve tmavém motivu **světlejší** odstín než ve světlém.

> [!PITFALL] Paleta podle světlosti v `hsl()`
> *Příznak:* tlačítka různých barev se stejnou světlostí v `hsl()` mají s bílým textem kontrast od 1 : 1 do 8 : 1.
>
> *Oprava:* stupnice odvozuj v `oklch()` se stejnou světlostí pro stejný stupeň a kontrast ověř v DevTools.

> [!PITFALL] Vlastní písmo bez záložního
> *Příznak:* `font-family: "Inter Variable"` bez dalších písem — když se soubor nestáhne, stránka spadne do výchozí patkové Times.
>
> *Oprava:* vždycky přidej záložní rodinu: `"Inter Variable", system-ui, sans-serif`.

:::explain
Vysvětli vlastními slovy, proč komponenty mají používat sémantické tokeny (`--color-text-muted`) a ne primitivní (`--gray-600`).

## --model--
Primitivní token říká, jaká je to barva, sémantický říká, k čemu slouží. Když komponenta použije účel, můžu tmavý motiv nebo novou značku udělat jen změnou toho, na kterou barvu palety token ukazuje, na jednom místě. S primitivními tokeny v komponentách bych musel projít každou komponentu zvlášť a snadno bych na nějakou zapomněl.

## --checklist--
- Primitivní token pojmenovává barvu, sémantický její účel.
- Tmavý motiv mění jen hodnoty sémantických tokenů.
- Změna je na jednom místě, komponenty se nemění.
- Primitivní tokeny v komponentách vedou k přepisování v každé komponentě.
:::

:::check
Hover tlačítka má být o kus tmavší než `--color-accent`. Napiš hodnotu pro `background`, která smíchá `--color-accent` s 15 % černé v prostoru oklch.

### --expected--
color-mix(in oklch, var(--color-accent), black 15%)

### --accept--
color-mix(in oklch, var(--color-accent) 85%, black)
color-mix(in oklch, var(--color-accent) 85%, black 15%)
color-mix(in oklch, black 15%, var(--color-accent))

### --why--
`color-mix()` bere prostor, ve kterém se míchá, a dvě barvy. Procento u jedné z nich určí její podíl, druhá dostane zbytek.
:::

V labu si z toho postavíš motiv pro vlastní značku: paletu z jedné barvy, sémantické tokeny pro oba motivy a stupnici písma. Stejné tokeny později přeneseš do `@theme` v sekci o Tailwindu (`css-tailwind`), která na tuhle navazuje.

## Kde to najdeš v MDN

- [oklch()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) — rozsahy L, C, H, průhlednost a relativní zápis `oklch(from …)`.
- [Using relative colors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors) — jak se z barvy odvozují kanály a co v `calc()` smíš sčítat.
- [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) — míchání dvou barev a proč záleží na barevném prostoru.
- [Color contrast](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast) — požadavky WCAG na kontrast a jak ho ověřit.
- [@font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) — `src`, rozsah `font-weight` u variabilních písem a `font-display`.

# --questions--

## --question--

Štítek „Skladem" má pozadí `oklch(0.93 0.05 150)`. Text má mít stejnou chromu i odstín, jen jinou světlost. Jakou světlost textu z těchto možností zvolíš, aby měl text s pozadím nejlepší šanci na kontrast 4,5 : 1 a zůstal zelený? Napiš jedno číslo: 0.85, 0.65, nebo 0.4.

### --expected--

0.4

### --accept--

0,4
40%

### --why--

Kontrast roste s rozdílem světlostí. Pozadí má 0.93, takže text musí být hodně tmavý: 0.4 dá kolem 7,5 : 1, 0.65 jen asi 2,6 : 1. Odstín 150 zůstane, takže text je pořád zelený.

### --see--

css-design/barvy-a-typografie#oklch-svetlost-chroma-a-odstin

## --question--

Proč se velký nadpis s `font-size: 3rem` a `line-height: 1.5` na dvou řádcích špatně čte?

### --answer--

Protože `line-height: 1.5` se u velkého písma počítá z výchozích 16 px a řádky se překrývají.

#### --why--
Výška řádku bez jednotky se násobí písmem **prvku**, tady 48 px. Řádky se nepřekrývají, spíš naopak.

### --correct--

Mezera mezi řádky je 24 px a oko pak řádky nevnímá jako jeden nadpis.

#### --why--
48 × 1.5 = 72 px na řádek, takže mezi řádky zbude kolem 24 px volného místa. U velkého písma se výška řádku snižuje k 1.1–1.2.

### --answer--

Protože nadpisy nesmí mít `line-height` a mají se řídit prohlížečem.

#### --why--
Výchozí `line-height: normal` je u většiny písem kolem 1.2, a ta hodnota se nastavovat smí i má.

### --see--

css-design/barvy-a-typografie#typograficka-stupnice

## --question--

Návrhář dodal paletu a text `--gray-500` na bílém má kontrast 4,2 : 1. Použil ho pro popisky 13 px pod poli formuláře. Co mu napíšeš?

### --answer--

Je to v pořádku, popisky jsou vedlejší text a stačí jim 3 : 1.

#### --why--

Hranice 3 : 1 neplatí pro „vedlejší" text, ale pro velký text od 24 px (nebo 18,7 px tučně). Na důležitosti textu nezáleží.

### --correct--

Popisky potřebují o stupeň tmavší šedou, protože 13 px je běžný text a potřebuje aspoň 4,5 : 1.

#### --why--

Úroveň AA chce pro běžný text 4,5 : 1 a 13 px je hluboko pod hranicí velkého textu. Řešením je tmavší odstín, třeba `--gray-600`.

### --answer--

Stačí popisky dát tučně, tučný text má nižší požadavek.

#### --why--

Nižší požadavek má tučný text až od 18,7 px. Popisek 13 px zůstane běžným textem i tučně.

### --see--

css-design/barvy-a-typografie#kontrast-podle-wcag

## --question--

Na stránce je `--text-1: calc(1rem * 1.2)` a `--text-2: calc(var(--text-1) * 1.2)`. Kolik px má `--text-2`, když kořen stránky má 16 px? Zaokrouhli na celé px.

### --expected--

23

### --accept--

23.0
23,0
23 px
23.04
23,04

### --why--

16 × 1.2 = 19.2 px, 19.2 × 1.2 = 23.04 px, tedy asi 23 px. Každý stupeň násobí předchozí, neprůměruje ani nepřičítá.

### --see--

css-design/barvy-a-typografie#typograficka-stupnice
