# Box model

Každá karta produktu, tlačítko, pole formuláře i celá stránka je pro prohlížeč obdélník. Když ti na telefonu tlačítko „Koupit" přečnívá z karty o pár pixelů nebo se objeví vodorovný posuvník, skoro vždycky jde o to, jak prohlížeč ten obdélník počítá. Než začneš číst, zkus odhadnout dvě odpovědi.

:::check pretest
Karta má tohle CSS. Jak široká bude na obrazovce (v px), když na stránce není žádné jiné pravidlo?

```css
.card {
  width: 300px;
  padding: 20px;
  border: 2px solid #cbd5e1;
}
```

### --expected--
344

### --accept--
344 px
344px

### --why--
`width` ve výchozím stavu měří jen obsah. K 300 px se přičte padding zleva i zprava (2 × 20 px) a rámeček z obou stran (2 × 2 px): 300 + 40 + 4 = 344 px. Proč to tak je a jak to změnit, je hlavní téma lekce.
:::

:::check pretest
Karta má `background: gold`, `padding: 20px`, `border: 4px dashed` a `margin: 30px`. Kam až sahá žlutá barva pozadí?

### --answer--
Jen pod textem obsahu.

#### --why--
Pozadí se nekreslí jen pod text. Kdyby to tak bylo, padding by nešel vidět jako barevná plocha kolem textu.

### --correct--
Pod obsahem, paddingem i pod rámečkem, ale ne do marginu.

#### --why--
Pozadí vyplní box až po vnější hranu rámečku (mezerami čárkovaného rámečku prosvítá). Margin je vždycky průhledný, je to mezera **vně** boxu.

### --answer--
Až po vnější okraj marginu.

#### --why--
Margin patří k místu kolem boxu, ne k boxu samotnému. Pozadí se do něj nekreslí nikdy.
:::

## Problém: box je širší, než jsi napsal

Tady jsou dvě hlášky pod sebou. Obě mají v CSS napsané `width: 100%`, a přesto jedna z nich leze z šedého rámu ven:

:::live
```html
<div class="frame">
  <p class="notice">Objednávka byla odeslána.</p>
  <p class="notice notice--padded">Platba se zpracovává, vydrž prosím pár vteřin.</p>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.frame {
  width: 20rem;
  padding: 0.5rem;
  border: 2px dashed #94a3b8;
}

.notice {
  width: 100%;
  margin: 0 0 0.5rem;
  background: #dcfce7;
}

.notice--padded {
  padding: 1rem;
  border: 3px solid #16a34a;
}
```
:::

Druhá hláška má navíc padding a rámeček. Zkus v pravidle `.notice--padded` padding smazat a sleduj, o kolik se hláška zkrátí. Pak ho vrať a smaž rámeček.

Důvod je jeden a platí pro každý prvek na stránce:

> [!REMEMBER]
> **Každý prvek je obdélník ze čtyř vrstev — obsah, padding, rámeček a margin — a `width` ve výchozím stavu měří jen tu nejvnitřnější.** Padding a rámeček se k šířce přičítají.

Tomuhle modelu se říká [[box model]] a všechno ostatní v lekci z něj vychází.

:::check
Hláška má `width: 100%` uvnitř rámu, který má pro obsah 320 px. K tomu `padding: 16px` a `border: 3px solid`. O kolik pixelů je box hlášky širší než místo pro obsah v rámu?

### --expected--
38

### --accept--
38 px
38px

### --why--
`width: 100%` dá obsahu celých 320 px. Padding přidá 2 × 16 = 32 px a rámeček 2 × 3 = 6 px. Box je tedy o 38 px širší než místo, které pro něj rám má.
:::

## Čtyři vrstvy boxu

Od středu ven:

- [[obsahová oblast]] (*content box*) — text, obrázek, děti prvku. Její rozměry jsou `width` a `height`.
- [[vnitřní odsazení]] (*padding*) — mezera mezi obsahem a rámečkem. Je vidět, protože se do ní kreslí pozadí.
- **rámeček** (*border*) — čára kolem paddingu. I rámeček `0` je vrstva, jen nulové tloušťky.
- [[vnější okraj]] (*margin*) — průhledná mezera mezi boxem a sousedy. Nepatří do velikosti boxu, ale zabírá místo v rozvržení.

Zkratky `padding` a `margin` berou 1–4 hodnoty ve směru hodinových ručiček od horní strany: `padding: 8px 16px` je 8 px nahoře a dole, 16 px vlevo a vpravo.

V ukázce měníš vrstvy posuvníky. Nad boxem se vypisuje, jak je box široký na obrazovce (od rámečku k rámečku) a kolik místa zbylo pro obsah:

:::live
```html
<p class="readout">…</p>
<div class="stage">
  <div class="box"><div class="box__content">Obsah boxu</div></div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.readout { font-variant-numeric: tabular-nums; font-weight: 600; }

.stage {
  padding: 0;
  background: #fef3c7;
  outline: 1px dashed #d97706;
  width: max-content;
}

.box {
  box-sizing: var(--sizing);
  width: 240px;
  padding: var(--padding);
  border: var(--border) solid #4338ca;
  margin: var(--margin);
  background: #e0e7ff;
}

.box__content {
  background: #a5b4fc;
}
```
```js
const box = document.querySelector('.box');
const readout = document.querySelector('.readout');

function update() {
  const style = getComputedStyle(box);
  const outer = box.getBoundingClientRect().width;
  const inner = outer - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
  readout.textContent = `Box na obrazovce: ${Math.round(outer)} px · obsah: ${Math.round(inner)} px`;
  requestAnimationFrame(update);
}
update();
```
```controls
--padding: range(0, 40, 4, px) = 20 | padding
--border: range(0, 12, 1, px) = 4 | border
--margin: range(0, 40, 4, px) = 0 | margin
--sizing: toggle(content-box, border-box) | box-sizing
```
:::

Světle fialová je padding, sytější fialová uprostřed obsah a žlutý podklad ukazuje margin. Posuň `padding` a `border` a sleduj horní číslo: roste. Posuň `margin`: box na obrazovce se nezvětší, jen se odsune a žlutá plocha kolem něj naroste. Přepínač `box-sizing` si nech na další část.

:::check
Tlačítko má `padding: 6px 12px 10px`. Kolik pixelů paddingu má **vlevo**?

### --expected--
12

### --accept--
12 px
12px

### --why--
Tři hodnoty znamenají: nahoře, vlevo a vpravo, dole. Chybějící čtvrtá (vlevo) se převezme od protější strany, tedy od pravé: 12 px.
:::

## `box-sizing`: co přesně měří `width`

Výchozí hodnota `box-sizing: content-box` říká „`width` je šířka obsahu". Hodnota `border-box` říká „`width` je šířka od rámečku k rámečku" — padding a rámeček se pak odečítají **dovnitř**, z místa pro obsah.

Obě varianty níž mají stejné HTML i CSS a liší se jedinou deklarací:

:::compare
```html
<div class="frame">
  <input class="field" type="email" value="jana.novakova@seznam.cz" aria-label="E-mail">
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.frame {
  width: 16rem;
  padding: 0.75rem;
  border: 2px dashed #94a3b8;
}

.field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid #334155;
  border-radius: 0.375rem;
  font: inherit;
}
```
--variant-- content-box
```css
.field { box-sizing: content-box; }
```
--variant-- border-box
```css
.field { box-sizing: border-box; }
```
:::

S `content-box` dostane obsah pole celých 100 % a padding s rámečkem vylezou z rámu. S `border-box` je celé pole široké přesně 100 %.

Protože s `border-box` se rozměry počítají tak, jak je člověk čte v návrhu, začíná skoro každý moderní stylopis tímhle resetem:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

`*` vybere všechny prvky a `::before` s `::after` přidají pseudoprvky, které univerzální selektor sám nechytí. Specificita `*` je nula, takže když někde výjimečně potřebuješ `content-box`, přepíše reset kterékoli jiné pravidlo.

Než otevřeš náhled, spočítej:

:::live predict
```html
<div class="panel">
  <p class="panel__text">Doprava zdarma nad 1 500 Kč</p>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.panel {
  box-sizing: border-box;
  width: 240px;
  padding: 24px;
  border: 4px solid #0f766e;
  background: #ccfbf1;
}

.panel__text {
  margin: 0;
  background: #fff;
}
```
--question-- Jak široký bude bílý odstavec uvnitř panelu?
--option*-- 184 px
--option-- 240 px
--option-- 296 px
--why-- S `border-box` je 240 px celý panel od rámečku k rámečku. Padding (2 × 24 px) a rámeček (2 × 4 px) se odečtou dovnitř, pro obsah zbude 240 − 48 − 8 = 184 px a odstavec jako blok vyplní celou šířku obsahu. 296 px by vyšlo s `content-box`, kdy se padding a rámeček naopak přičítají ven. Zkus `box-sizing` smazat a porovnej.
--see-- css-box-model/box-model#box-sizing-co-presne-meri-width
:::

:::check
Obrázek má `box-sizing: border-box`, `width: 200px`, `padding: 10px` a `border: 5px solid`. Kolik pixelů zbude na samotný obrázek uvnitř?

### --expected--
170

### --accept--
170 px
170px

### --why--
U `border-box` se od 200 px odečte padding z obou stran (20 px) a rámeček z obou stran (10 px): 200 − 30 = 170 px.
:::

## `width: auto` není totéž co `width: 100%`

Blokový prvek (odstavec, `div`, `section`) má ve výchozím stavu `width: auto`. To neznamená „100 %", ale **„vyplň šířku rodiče, ale odečti si od ní vlastní margin, rámeček i padding"**. Proto se blok s marginem vždycky vejde.

`width: 100%` řekne něco jiného: „box je široký jako obsah rodiče" (s `border-box`). Margin se k tomu přidá zvenku. Tipni si, co z toho vznikne:

:::live predict
```html
<div class="page">
  <p class="alert">Zítra od 8:00 do 10:00 probíhá údržba e-shopu.</p>
</div>
```
```css
*, *::before, *::after { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; margin: 1rem; }

.page {
  width: 400px;
  outline: 2px dashed #94a3b8;
}

.alert {
  width: 100%;
  margin: 0 16px;
  padding: 12px;
  background: #fee2e2;
}
```
--question-- Jak bude vypadat hláška uvnitř 400 px široké stránky?
--option-- Široká 368 px, s mezerou 16 px na obou stranách.
--option*-- Široká 400 px, posunutá o 16 px doprava, takže o 16 px přečnívá přes pravý okraj.
--option-- Široká 400 px, zarovnaná s okraji stránky, margin se ignoruje z obou stran.
--why-- `width: 100%` pevně nastaví šířku na 400 px. Levý margin hlášku odsune o 16 px a na pravý margin už místo není, tak ho prohlížeč pro výpočet polohy zahodí. Hláška přečnívá. Smaž `width: 100%` a výchozí `auto` spočítá 400 − 32 = 368 px, mezera bude na obou stranách.
--see-- css-box-model/box-model#width-auto-neni-totez-co-width-100
:::

> [!REMEMBER]
> Blokovému prvku, který má vyplnit šířku rodiče, **šířku nenastavuj**. `auto` s marginem i paddingem počítá samo, `width: 100%` ne.

:::check
Blok `<section>` má `margin-inline: 24px` a uvnitř rodiče s obsahem širokým 600 px mu nenastavíš žádnou šířku. Jak široký bude box sekce (v px)?

### --expected--
552

### --accept--
552 px
552px

### --why--
`width: auto` vyplní šířku rodiče po odečtení marginu: 600 − 2 × 24 = 552 px. Margin zůstane na obou stranách a nic nepřeteče.
:::

## Hranice velikosti: `min-*` a `max-*`

Pevná `width` nebo `height` je v responzivním webu vzácnost. Mnohem častěji chceš **hranici**:

- `max-width` — „nejvýš tak široký". Článek s `max-width: 40rem` je na monitoru čitelně úzký a na telefonu se zúží s oknem.
- `min-height` — „aspoň tak vysoký, ale s delším obsahem rosti". Karta s `min-height: 12rem` se nerozbije, když někdo napíše delší popis. S pevnou `height` by text z karty vytekl.
- `min-width` a `max-height` fungují stejně pro druhý rozměr.

Když si hodnoty odporují, rozhoduje pořadí důležitosti: **`min-*` vyhrává nad `max-*` a obě nad `width`/`height`**.

:::check
Prvek má `width: 900px; max-width: 600px; min-width: 700px;`. Jak bude široký (v px)?

### --expected--
700

### --accept--
700 px
700px

### --why--
`max-width` nejdřív stáhne 900 px na 600 px, jenže `min-width` má přednost před `max-width`, takže šířka nesmí klesnout pod 700 px.
:::

## Logické vlastnosti: `inline` a `block` místo stran

Moderní CSS má ke každé „straně" i logický název. Místo vlevo a vpravo mluví o směru, kterým teče text:

- **inline** — směr řádku textu (v češtině vodorovně),
- **block** — směr, kterým jdou bloky pod sebou (v češtině svisle).

| fyzická vlastnost | logická vlastnost (v češtině) |
|---|---|
| `width` / `height` | `inline-size` / `block-size` |
| `max-width` | `max-inline-size` |
| `margin-left` + `margin-right` | `margin-inline` |
| `padding-top` + `padding-bottom` | `padding-block` |
| `margin-top` | `margin-block-start` |
| `border-left` | `border-inline-start` |

Proč je používat? Web v arabštině nebo hebrejštině se čte zprava doleva a `margin-inline-start` se tam sám otočí na pravou stranu. A i v češtině jsou kratší: `margin-inline: auto` nahradí dvě deklarace. V Akademii je budeš psát tam, kde jde o směr textu, a fyzické tam, kde jde opravdu o stranu obrazovky.

`margin-inline: auto` je mimochodem nejčastější způsob, jak vycentrovat blok s omezenou šířkou: automatický margin si vezme zbylé místo rovným dílem vlevo i vpravo.

:::check
Napiš jednou deklarací logickou vlastnost, která prvku dá vnitřní odsazení 1rem **nahoře a dole** (v češtině).

### --expected--
padding-block: 1rem

### --accept--
padding-block: 1rem 1rem

### --why--
`block` je směr, kterým jdou bloky pod sebou, v češtině svisle. `padding-block` nastaví začátek i konec té osy najednou, tedy horní a dolní padding.
:::

## Typické chyby a pasti

> [!PITFALL] Pole nebo tlačítko přečnívá z karty
> *Příznak:* prvek s `width: 100%` a paddingem je o pár pixelů širší než rodič a na telefonu se objeví vodorovný posuvník.
>
> *Oprava:* reset `box-sizing: border-box` na začátku stylopisu. U bloků ještě jednodušší: šířku vůbec nenastavuj a nech `auto`.

> [!PITFALL] Pevná výška a vytékající text
> *Příznak:* karta s `height: 10rem` vypadá dobře s krátkým popisem, ale s delším textem (nebo na úzké obrazovce) text přeteče přes spodní rámeček a leží přes další kartu.
>
> *Oprava:* `min-height` místo `height`. Karta pak drží minimální výšku a s obsahem roste.

Poslední past je s procenty. Tipni si:

:::live predict
```html
<div class="column">
  <div class="banner">Letní výprodej</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.column {
  width: 400px;
  outline: 2px dashed #94a3b8;
}

.banner {
  padding-top: 25%;
  background: #fde68a;
}
```
--question-- Kolik pixelů bude horní padding banneru?
--option-- 0 px, protože `.column` nemá nastavenou výšku, ze které by se 25 % dalo spočítat.
--option*-- 100 px, 25 % ze šířky sloupce.
--option-- Asi 5 px, 25 % z výšky banneru.
--why-- Procenta v paddingu i marginu se počítají **vždycky ze šířky** (z inline velikosti) rodiče, i u horní a dolní strany: 25 % ze 400 px = 100 px. Pro výšku banneru to často není to, co čekáš. Na box s daným poměrem stran je dnes `aspect-ratio`, dostaneme se k němu v lekci o přetečení.
--see-- css-box-model/box-model#typicke-chyby-a-pasti
:::

> [!PITFALL] `height: 100%`, které nic nedělá
> *Příznak:* dítě s `height: 100%` je vysoké jen jako svůj obsah.
>
> *Oprava:* procenta výšky potřebují rodiče s **určenou** výškou. Když má rodič `height: auto` (výchozí), počítá se jeho výška z dětí a `100 %` z něj spočítat nejde, takže se chová jako `auto`. Dej výšku rodiči, nebo místo procent použij `min-height` v jednotkách okna (`min-height: 100dvh`).

> [!PITFALL] Obrys a stín se do rozměrů nepočítají
> *Příznak:* přidáš kartě při najetí myší `border: 3px solid`, a karta i text v ní poskočí o 3 px.
>
> *Oprava:* rámeček je vrstva boxu a mění jeho velikost. Na zvýraznění, které nemá nic posunout, použij `outline` nebo `box-shadow` — kreslí se přes okolí a místo v rozvržení nezabírají. Nebo měj rámeček stejně silný pořád a měň jen jeho barvu.

:::explain
Vysvětli vlastními slovy, proč moderní stylopisy začínají resetem `box-sizing: border-box` na všechny prvky.

## --model--
Ve výchozím `content-box` měří `width` jen obsah a padding s rámečkem se přičítají ven, takže prvek s `width: 100%` a paddingem přeteče rodiče. S `border-box` znamená `width` celý box od rámečku k rámečku a padding s rámečkem se odečítají dovnitř. Rozměry pak odpovídají tomu, co je v návrhu, a můžu měnit padding, aniž bych přepočítával šířky. Reset je na všech prvcích a pseudoprvcích, aby platil všude stejně.

## --checklist--
- Výchozí `content-box` měří šířkou jen obsah, padding a rámeček se přičítají.
- S `border-box` je `width` šířka celého boxu včetně paddingu a rámečku.
- Prvek s `width: 100%` a paddingem s `content-box` přeteče rodiče.
- Reset se dává na `*`, `*::before` a `*::after`, aby platil pro všechny prvky.
:::

:::check
Karta při najetí myší dostane zvýraznění a nic kolem se nesmí posunout. Který zápis to splní?

### --answer--
`.card:hover { border: 3px solid #4f46e5; }` u karty, která normálně rámeček nemá.

#### --why--
Rámeček je vrstva boxu. Když přibude, box se o něj zvětší a obsah poskočí.

### --correct--
`.card:hover { outline: 3px solid #4f46e5; }`

#### --why--
`outline` se kreslí kolem boxu, ale místo v rozvržení nezabírá, takže se nic neposune.

### --answer--
`.card:hover { padding: 3px; }` u karty, která normálně padding nemá.

#### --why--
Padding je taky vrstva boxu. Karta se zvětší a všechno za ní se odsune.
:::

## Kde to najdeš v MDN

- [Introduction to the CSS basic box model](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction) — čtyři vrstvy boxu s obrázkem, anglicky stejný výklad jako tady.
- [box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-sizing) — obě hodnoty, přesný výpočet a tabulka podpory.
- [CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values) — celý seznam logických vlastností a jak se mapují podle směru psaní.
- [max-width](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/max-width) — jak se `max-width` přetahuje s `width` a `min-width`.

# --questions--

## --question--

Tlačítko má `box-sizing: content-box`, `width: 120px`, `padding: 0 16px` a `border: 1px solid`. Zapneš reset `box-sizing: border-box`. O kolik pixelů se tlačítko **zúží**?

### --expected--

34

### --accept--

34 px
34px

### --why--

S `content-box` je tlačítko široké 120 + 32 + 2 = 154 px. S `border-box` je široké přesně 120 px, padding a rámeček se odečtou dovnitř. Rozdíl je 34 px.

### --see--

css-box-model/box-model#box-sizing-co-presne-meri-width

## --question--

Obsah stránky `.page` má být na monitoru nejvýš 64rem široký a vycentrovaný, na telefonu přes celou šířku. Který zápis to udělá?

### --answer--

`.page { width: 64rem; margin-inline: auto; }`

#### --why--

Pevná šířka se na telefonu nezúží. Stránka by byla široká 64rem i na 375 px displeji a šla by posouvat do strany.

### --correct--

`.page { max-width: 64rem; margin-inline: auto; }`

#### --why--

`max-width` jen omezí šířku shora. Na úzké obrazovce zůstane `width: auto` a stránka vyplní okno, na širokém monitoru ji `max-width` zastaví na 64rem a automatický margin rozdělí zbylé místo napůl.

### --answer--

`.page { width: 100%; margin: 0 64rem; }`

#### --why--

`margin` nastavuje mezeru kolem boxu, ne jeho nejvyšší šířku. Tady by šlo o 64rem mezery na každé straně a stránka by přetekla.

### --see--

css-box-model/box-model#hranice-velikosti-min-a-max

## --question--

Proč se karta s `height: 12rem` na telefonu „rozbije", zatímco karta s `min-height: 12rem` ne? Napiš vlastnost, kterou dáš kartě místo `height`.

### --expected--

min-height

### --accept--

min-block-size

### --why--

Pevná výška nedovolí kartě růst. Když se text na úzké obrazovce zalomí do víc řádků, vyteče přes spodní okraj. `min-height` (logicky `min-block-size`) drží jen spodní hranici, s delším obsahem karta roste.

### --see--

css-box-model/box-model#typicke-chyby-a-pasti

## --question--

Karta má `margin-inline-start: 2rem` na stránce v češtině. Na které straně bude mezera?

### --expected-- ignore-case

vlevo

### --accept--

nalevo
zleva
levá
vlevo od karty

### --why--

`inline` je směr řádku textu a `start` jeho začátek. Čeština se čte zleva doprava, takže začátek řádku je vlevo. Na stránce v arabštině by stejná deklarace dala mezeru vpravo.

### --see--

css-box-model/box-model#logicke-vlastnosti-inline-a-block-misto-stran
