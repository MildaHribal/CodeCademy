# Jednotky a hodnoty

Nadpis, který se na mobilu zmenší a na monitoru zvětší bez jediného media dotazu. Úvodní sekce přes celou výšku telefonu, které nepřekáží lišta prohlížeče. Článek, jehož řádky se čtou pohodlně na jakémkoli displeji. To všechno jsou jednotky a funkce jako `rem`, `dvh`, `ch` a `clamp()` — a v téhle lekci zjistíš, kterou kdy použít.

:::check pretest
Rodič má `font-size: 20px`. Jeho dítě má `font-size: 1.5em`. Kolik pixelů bude mít písmo dítěte?

### --expected--
30

### --accept--
30px
30 px

### --why--
`em` je násobek velikosti písma rodiče: 1,5 × 20 px = 30 px. Proč to u vnořených prvků vede k nečekaným číslům, uvidíš ve výkladu.
:::

:::check pretest
Uživatel si v nastavení prohlížeče zvýší výchozí velikost písma z 16 px na 20 px, protože špatně vidí. Který nadpis se zvětší?

### --answer--
Nadpis s `font-size: 32px`.

#### --why--
Pixely jsou pevné. Nastavení výchozí velikosti písma je nezmění.

### --correct--
Nadpis s `font-size: 2rem`.

#### --why--
`rem` je násobek výchozí velikosti písma stránky. Když ji uživatel zvětší na 20 px, `2rem` bude 40 px.

### --answer--
Oba stejně, prohlížeč zvětší všechno.

#### --why--
Tak funguje přiblížení stránky (Ctrl a +). Nastavení výchozí velikosti písma mění jen hodnoty, které z ní vycházejí.
:::

## Problém: web, který nejde zvětšit

Tady je popisek produktu napsaný v pixelech. Vypadá dobře — pro člověka, který má výchozí písmo prohlížeče 16 px a monitor, na kterém ho autor zkoušel.

:::live
```html
<article class="product">
  <h2 class="product__title">Horské kolo Author Traction</h2>
  <p class="product__text">Hliníkový rám, dvacetiosmipalcová kola a hydraulické brzdy. Vhodné na lesní cesty i do města.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.product {
  width: 360px;
  padding: 20px;
  border: 1px solid #d4d4d8;
  border-radius: 12px;
}

.product__title {
  margin: 0 0 8px;
  font-size: 24px;
}

.product__text {
  margin: 0;
  font-size: 15px;
  line-height: 22px;
}
```
:::

Pixely nejsou špatně samy o sobě. Problém je, že nic z toho nereaguje: když si uživatel zvětší výchozí písmo, zůstane text malý; když zvětšíš jen `font-size` odstavce, `line-height: 22px` zůstane a řádky se slepí; a karta široká 360 px se na úzkém telefonu nevejde. Zkus odstavci dát `font-size: 22px` a sleduj řádky.

> [!REMEMBER]
> **Každá relativní jednotka je násobek něčeho jiného: `rem` písma kořene stránky, `em` písma prvku (u `font-size` rodiče), `%` rozměru rodiče, `vw` a `vh` okna, `ch` šířky znaku.** Jednotku vybíráš podle toho, na co má hodnota reagovat.

:::check
Karta má `width: 360px` a displej telefonu je široký 320 px. Co se stane?

### --answer--
Karta se sama zúží na 320 px.

#### --why--
Pevná šířka v pixelech se nepřizpůsobuje. Na zúžení potřebuješ hodnotu, která na šířku rodiče nebo okna reaguje.

### --correct--
Karta přeteče přes okraj displeje a stránka půjde posouvat do strany.

#### --why--
360 px je pevné číslo a nevejde se do 320 px. Jak šířku omezit, aby se karta vešla, ukáže část o `min()`.

### --answer--
Prohlížeč celou stránku zmenší, aby se vešla.

#### --why--
Stránka s `<meta name="viewport" content="width=device-width">` se na telefonu nezmenšuje. Přetečení zůstane.
:::

## `px`: pevná hodnota

`px` je CSS pixel — pevná jednotka, jejíž velikost nezávisí na ničem v dokumentu. Na displeji s vysokou hustotou (Retina, telefony) je jeden CSS pixel složený z několika fyzických bodů, takže `1px` vypadá všude přibližně stejně velký.

Pixely se hodí tam, kde se nic nemá měnit s písmem: tloušťka rámečku (`1px`), jemný stín, malé zaoblení. Pro velikost písma a rozestupy kolem textu jsou lepší relativní jednotky.

:::check
Pro kterou z hodnot se `px` hodí nejvíc?

### --answer--
Velikost písma odstavce.

#### --why--
Písmo v pixelech ignoruje nastavení výchozí velikosti písma, které si uživatel zvolil.

### --correct--
Tloušťka rámečku karty.

#### --why--
Jednopixelová linka má zůstat jednopixelová, i když si uživatel zvětší písmo. Tady je pevná hodnota to pravé.

### --answer--
Šířka hlavního sloupce stránky.

#### --why--
Pevná šířka se na úzkém displeji nevejde. Šířka sloupce má reagovat na okno nebo na délku řádku.
:::

## `rem`: násobek kořene stránky

`1rem` je velikost písma kořenového prvku `<html>`. Když ji nikdo nezmění, je to výchozí velikost písma prohlížeče — obvykle **16 px**, ale uživatel si ji může v nastavení zvětšit.

| hodnota | při 16 px | při 20 px |
|---|---|---|
| `0.875rem` | 14 px | 17,5 px |
| `1rem` | 16 px | 20 px |
| `1.5rem` | 24 px | 30 px |
| `2rem` | 32 px | 40 px |

**`rem` je výchozí volba pro velikost písma i rozestupy.** Celé rozhraní pak roste s tím, jak velké písmo si člověk nastavil, a přitom `1.5rem` znamená na každém místě stránky totéž — nezáleží, v jak hluboko vnořeném prvku je.

> [!PITFALL] `html { font-size: 62.5%; }`
> *Příznak:* ve starších projektech najdeš na `html` velikost `62.5 %`, aby `1rem` bylo 10 px a „dobře se počítalo". Pak je potřeba přepsat písmo na `body` a každá knihovna komponent, která počítá s `1rem = 16 px`, je najednou malá.
>
> *Oprava:* nech kořenu výchozí velikost a počítej v šestnáctinách. `14 px` = `0.875rem`, `18 px` = `1.125rem`, `24 px` = `1.5rem`.

:::check
Návrh říká, že mezititulek má 18 px. Napiš hodnotu v `rem` při výchozí velikosti písma.

### --expected--
1.125rem

### --why--
18 ÷ 16 = 1,125. V CSS se píše desetinná tečka.
:::

## `em`: násobek písma prvku

`em` vypadá jako `rem`, ale počítá z jiného čísla:

- u vlastnosti `font-size` je `1em` velikost písma **rodiče**,
- u všech ostatních vlastností (`padding`, `margin`, `width`…) je `1em` velikost písma **prvku samotného**.

Vyzkoušej to na ovládání: rodič mění velikost písma, vedle sebe jsou potomci v `em` a v `rem`.

:::live
```html
<div class="parent">
  <p class="em">1.5em</p>
  <p class="rem">1.5rem</p>
  <div class="em">
    vnořené 1.5em
    <p class="em">a ještě jednou 1.5em</p>
  </div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.parent {
  font-size: var(--parent-size);
  padding: 0.5rem 1rem;
  border: 2px dashed #a1a1aa;
}

p { margin: 0.25rem 0; }

.em { font-size: 1.5em; color: #7c3aed; }
.rem { font-size: 1.5rem; color: #0f766e; }
```
```controls
--parent-size: range(10, 30, 2, px) = 16 | font-size rodiče
```
:::

Posuň velikost písma rodiče. Tyrkysový text v `rem` stojí na místě, fialové texty v `em` rostou — a vnořený `em` roste ještě rychleji, protože násobí už zvětšené písmo svého rodiče.

**Kdy `em` dává smysl:** u rozestupů, které mají růst s písmem **stejné komponenty**. Tlačítko s `padding: 0.5em 1em` má vždycky stejné proporce, ať je malé, nebo velké. Vzdálenost podtržení odkazu `text-underline-offset: 0.2em` sedí k jakékoli velikosti textu.

Teď past, kvůli které se na velikost písma `em` skoro nepoužívá. Než otevřeš náhled, tipni si:

:::live predict
```html
<ul class="menu">
  <li>Kávy
    <ul class="menu">
      <li>Espresso
        <ul class="menu">
          <li>Doppio</li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.menu {
  font-size: 0.8em;
}
```
--question-- Stránka má písmo 16 px. Jak velké bude písmo položky „Doppio"?
--option-- 12,8 px, jako všechna menu.
--option*-- Asi 8,2 px.
--option-- 16 px, protože vnořená menu se navzájem vyruší.
--why-- Každé `.menu` je uvnitř předchozího a `0.8em` násobí písmo rodiče: 16 × 0,8 = 12,8, pak 12,8 × 0,8 = 10,24 a nakonec 10,24 × 0,8 ≈ 8,19 px. Přepiš `0.8em` na `0.8rem` a všechna tři menu budou mít 12,8 px.
:::

:::check
Rodič má `font-size: 20px`. Tlačítko uvnitř má `font-size: 1.5em` a `padding: 0.5em`. Kolik pixelů bude horní vnitřní odsazení tlačítka?

### --expected--
15

### --accept--
15px
15 px

### --why--
Písmo tlačítka je 1,5 × 20 = 30 px. U `padding` se `em` počítá z písma prvku samotného, tedy 0,5 × 30 = 15 px, ne z 20 px rodiče.
:::

## Procenta: vůči čemu

Procenta jsou vždycky podíl **něčeho** a to něco se liší podle vlastnosti:

| vlastnost | 100 % je… |
|---|---|
| `width`, `max-width` | šířka obsahu rodiče |
| `height` | výška rodiče — **jen když ji má rodič pevně nastavenou**, jinak se procenta ignorují |
| `padding`, `margin` (všechny strany) | šířka rodiče, **i nahoře a dole** |
| `font-size` | písmo rodiče, jako `em` |
| `line-height` | písmo prvku, spočítané na pixely (proto je lepší číslo bez jednotky) |
| `border-radius` | rozměry prvku samotného |

:::live predict
```html
<div class="wrap">
  <div class="box">Přihlášky do 30. září</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.wrap {
  width: 500px;
  outline: 2px dashed #a1a1aa;
}

.box {
  width: 50%;
  padding-top: 10%;
  background-color: #fde68a;
}
```
--question-- Box je široký 250 px (50 % z 500). Kolik pixelů bude jeho horní vnitřní odsazení?
--option-- 25 px, desetina šířky boxu.
--option*-- 50 px, desetina šířky rodiče.
--option-- 0 px, protože rodič nemá výšku.
--why-- `padding` v procentech se počítá ze šířky rodiče, a to i nahoře a dole: 10 % z 500 px = 50 px. Díky tomu mají svislé i vodorovné rozestupy stejný základ. Otevři DevTools a zkontroluj to v diagramu box modelu.
:::

:::check
Seznam je široký 400 px a položka v něm má `width: 25%`. Kolik pixelů bude položka široká?

### --expected--
100

### --accept--
100px
100 px

### --why--
Procenta u `width` se počítají ze šířky obsahu rodiče: čtvrtina ze 400 px je 100 px.
:::

## Jednotky okna: `vw`, `vh`, `dvh` a `svh`

Jednotky okna (*viewport units*) jsou procenta z velikosti okna prohlížeče, ne z rodiče:

- `1vw` = 1 % šířky okna, `1vh` = 1 % výšky okna,
- `100vh` na počítači = přesně výška okna.

Na telefonu to je složitější. Prohlížeč má adresní řádek, který se při posouvání schová. `vh` počítá s největší možnou výškou (lišta schovaná), takže úvodní sekce s `height: 100vh` je na začátku o kus vyšší než displej a spodek je schovaný pod lištou. Proto vznikly nové jednotky:

| jednotka | výška okna, když… | kdy |
|---|---|---|
| `svh` | *small* — lišty prohlížeče jsou vidět (nejmenší okno) | obsah, který musí být celý vidět hned |
| `lvh` | *large* — lišty jsou schované (největší okno), jako `vh` | pozadí za obsahem |
| `dvh` | *dynamic* — přepočítává se podle toho, co je zrovna vidět | úvodní sekce přes celou obrazovku |

Všechny tři mají i šířkové protějšky (`svw`, `dvw`…) a fungují ve všech dnešních prohlížečích.

```css
.hero {
  min-height: 100dvh;
}
```

> [!NOTE]
> `min-height` místo `height` je pojistka: když se obsah do výšky displeje nevejde, sekce se natáhne, místo aby text přetekl. K rozměrům boxu se dostaneš v sekci o box modelu.

:::check
Úvodní sekce aplikace má na telefonu zabrat přesně viditelnou výšku displeje, i když se lišta prohlížeče schovává a zase ukazuje. Napiš deklaraci s `min-height`.

### --expected--
min-height: 100dvh

### --why--
`dvh` se přepočítává podle aktuálně viditelné části okna. `100vh` by na telefonu počítalo se schovanou lištou a spodek sekce by zajel pod ni.
:::

## `ch`: šířka řádku textu

`1ch` je šířka znaku „0" v aktuálním písmu. Používá se hlavně na jednu věc: **šířku textového sloupce**, tedy [[délka řádku|délku řádku]] (*measure*). Řádky delší než zhruba 75 znaků se čtou špatně — oko se na konci řádku těžko trefí na začátek dalšího. Pravidlo `max-width: 65ch` na článku drží délku řádku kolem 60–75 znaků bez ohledu na velikost písma.

:::live
```html
<article class="article">
  <h2>Proč na délce řádku záleží</h2>
  <p>Když je řádek příliš dlouhý, oko se na jeho konci musí vrátit daleko doleva a snadno přeskočí o řádek níž nebo čte jeden řádek dvakrát. Příliš krátké řádky zase trhají větu na kousky. Typografové proto doporučují zhruba šedesát až pětasedmdesát znaků na řádek.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.6; }

.article {
  max-width: var(--measure);
  font-size: var(--size);
  outline: 2px dashed #a1a1aa;
}
```
```controls
--measure: range(20, 120, 5, ch) = 65 | max-width článku
--size: range(0.875, 1.5, 0.125, rem) = 1 | font-size článku
```
:::

Zvětši písmo článku a sleduj, že počet znaků na řádku zůstává zhruba stejný — sloupec roste s písmem. Pak zkus `max-width` 120ch a přečti si odstavec nahlas: kde ti oko ujíždí?

:::check
Napiš deklaraci, která omezí šířku odstavců blogu na nejvýš 70 znaků.

### --expected--
max-width: 70ch

### --why--
`ch` je šířka jednoho znaku písma, takže `70ch` odpovídá přibližně sedmdesáti znakům a roste s velikostí písma. `width` by sloupec nechal široký, i když by se nevešel do okna.
:::

## `calc()`: počítání s různými jednotkami

`calc()` spočítá hodnotu z výrazu a smí míchat jednotky, které prohlížeč zná až při vykreslení:

```css
.page {
  width: calc(100% - 2rem);          /* šířka rodiče bez dvou rem */
}

.stack > * + * {
  margin-top: calc(var(--space) * 2);  /* dvojnásobek tokenu */
}
```

- Sčítat a odčítat jde jen hodnoty stejného druhu (délku s délkou). Násobit a dělit jde číslem bez jednotky.
- Kolem `+` a `-` **musí být mezery**. `calc(100%-2rem)` je neplatné, protože `-2rem` vypadá jako záporné číslo.
- S vlastní vlastností obsahující holé číslo je `calc()` jediná cesta k jednotce: `calc(var(--columns) * 1rem)`.

:::check
Kontejner je široký 600 px. Prvek v něm má `width: calc(50% - 1.5rem)`. Kolik pixelů bude široký při výchozí velikosti písma?

### --expected--
276

### --accept--
276px
276 px

### --why--
50 % z 600 px je 300 px a `1.5rem` je 24 px: 300 − 24 = 276 px.
:::

## `min()`, `max()` a `clamp()`

Tři funkce, se kterými napíšeš plynulé hodnoty bez media dotazů:

- `min(a, b)` — použije **menší** z hodnot. `width: min(100%, 40rem)` = „celá šířka, ale nejvýš 40rem".
- `max(a, b)` — použije **větší**. `padding: max(1rem, 3vw)` = „aspoň 1rem, na velkém okně víc".
- `clamp(min, ideál, max)` — ideální hodnota, ale nikdy pod minimum a nad maximum.

```css
.hero__title {
  font-size: clamp(1.75rem, 1rem + 3vw, 3rem);
}
```

Nadpis roste s šířkou okna (`3vw`), na telefonu ale nespadne pod `1.75rem` a na velkém monitoru nepřeroste `3rem`. Přičtené `1rem` zajistí, že velikost reaguje i na nastavení písma uživatele — samotné `vw` by ho ignorovalo.

:::live
```html
<div class="stage">
  <section class="panel">
    <h2 class="panel__title">Letní festival v Kroměříži</h2>
    <p>Tři dny hudby, divadla a jídla v Podzámecké zahradě.</p>
  </section>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.stage {
  width: var(--stage);
  outline: 2px dashed #a1a1aa;
}

.panel {
  width: min(100%, 24rem);
  padding: clamp(0.75rem, 6%, 2rem);
  border-radius: 1rem;
  background-color: #ecfccb;
}

.panel__title { margin: 0 0 0.5rem; }
.panel p { margin: 0; }
```
```controls
--stage: range(200, 800, 20, px) = 500 | šířka rodiče
```
:::

Posouvej šířku rodiče. Dokud je rodič užší než `24rem` (384 px), panel je přes celou šířku; pak se zastaví. Vnitřní odsazení roste s rodičem (6 %), ale nikdy neklesne pod `0.75rem` a nepřeroste `2rem`.

> [!TIP]
> V DevTools v panelu Computed uvidíš výsledek `clamp()` a `calc()` jako obyčejné pixely. Když chceš vědět, která ze tří hodnot `clamp()` právě vyhrála, změň šířku okna a sleduj číslo.

:::check
Nadpis má `font-size: clamp(1rem, 4vw, 2rem)` a okno je široké 1024 px. Kolik pixelů bude mít písmo?

### --expected--
32

### --accept--
32px
32 px

### --why--
4vw je 4 % z 1024 px, tedy 40,96 px. To je víc než maximum `2rem` = 32 px, takže `clamp()` vrátí 32 px.
:::

## Typické chyby a pasti

> [!PITFALL] `calc()` bez mezer
> *Příznak:* `width: calc(100%-2rem)` nic nezmění a prvek má šířku, jako by deklarace nebyla.
>
> *Oprava:* kolem `+` a `-` piš mezery: `calc(100% - 2rem)`. Bez nich je výraz neplatný a deklarace se zahodí.

> [!PITFALL] `height: 50%` nefunguje
> *Příznak:* prvek s `height: 50%` je vysoký jen jako jeho obsah.
>
> *Oprava:* procentní výška potřebuje rodiče s nastavenou výškou. Když rodič roste podle obsahu, procenta se ignorují. Často pomůže jiná jednotka (`dvh`) nebo rozvržení přes flexbox či grid.

> [!PITFALL] `100vw` a vodorovný posuvník
> *Příznak:* pruh s `width: 100vw` je o kousek širší než stránka a na počítači s klasickým posuvníkem (typicky ve Windows) jde stránka posouvat do strany.
>
> *Oprava:* `vw` počítá šířku okna **včetně** svislého posuvníku. Na „celou šířku" použij `width: 100%` na prvku, jehož rodič je přes celou šířku.

> [!PITFALL] `em` na velikosti písma ve vnořených prvcích
> *Příznak:* vnořené seznamy nebo komentáře mají čím dál menší (nebo větší) písmo.
>
> *Oprava:* `em` u `font-size` násobí písmo rodiče a násobení se sčítá. Na velikost písma používej `rem`, `em` nech na rozestupy uvnitř komponenty.

:::check
V pravidle je `width: calc(100%-3rem);`. Prohlížeč deklaraci zahodil. Napiš opravenou deklaraci.

### --expected--
width: calc(100% - 3rem)

### --why--
Bez mezer vypadá `-3rem` jako záporné číslo za `100%`, a to není platný výraz. S mezerami je to odčítání.
:::

:::explain
Vysvětli vlastními slovy rozdíl mezi `rem` a `em` a kdy použiješ kterou.

## --model--
`rem` se vždycky počítá z velikosti písma kořene stránky, takže `1.5rem` znamená všude totéž a respektuje velikost písma, kterou si nastavil uživatel. `em` se počítá z písma prvku, u `font-size` z písma rodiče, a ve vnořených prvcích se proto násobí. `rem` používám na velikosti písma a běžné rozestupy, `em` na rozestupy, které mají růst s písmem jedné komponenty, třeba vnitřní odsazení tlačítka.

## --checklist--
- `rem` vychází z písma kořene stránky, stejně na celé stránce.
- `em` vychází z písma prvku, u `font-size` z písma rodiče.
- `em` se ve vnořených prvcích násobí.
- Na velikost písma se hodí `rem`, na rozestupy vázané na písmo komponenty `em`.
:::

S jednotkami máš všechno na poslední workshop sekce: čitelnou stránku článku se stupnicí písma v `rem`, šířkou řádku v `ch` a nadpisem, který plynule roste s oknem.

## Kde to najdeš v MDN

- [CSS values and units](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) — přehled jednotek s příklady, vůči čemu se která počítá.
- [length](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length) — úplný seznam délkových jednotek včetně `svh`, `dvh` a `lvh`.
- [clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp) — plynulá velikost písma a proč přičíst `rem` k `vw`.
- [calc()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc) — pravidla pro mezery, jednotky a vnořené výpočty.

# --questions--

## --question--

Stránka má výchozí písmo 16 px. Sekce má `font-size: 1.25rem` a odstavec uvnitř `font-size: 0.8em`. Kolik pixelů bude mít písmo odstavce?

### --expected--
16

### --accept--
16px
16 px

### --why--
Sekce má 1,25 × 16 = 20 px. Odstavec v `em` násobí písmo rodiče: 0,8 × 20 = 16 px.

### --see--

css-zaklady/jednotky-a-hodnoty#em-nasobek-pisma-prvku

## --question--

Proč se k plynulé velikosti písma píše `clamp(1.5rem, 1rem + 2vw, 2.5rem)`, a ne jen `font-size: 3vw`?

### --answer--
`vw` v `font-size` nefunguje, musí být uvnitř `clamp()`.

#### --why--
`font-size: 3vw` funguje, jen má dva problémy, které `clamp()` řeší.

### --correct--
Samotné `vw` nemá hranice a nereaguje na velikost písma nastavenou uživatelem; `clamp()` přidá minimum, maximum a přičtené `rem`.

#### --why--
Na telefonu by `3vw` bylo nečitelně malé, na širokém monitoru obří, a když si uživatel zvětší písmo, nic by se nestalo. Minimum a maximum v `rem` a přičtené `1rem` to opraví.

### --answer--
`clamp()` je rychlejší na vykreslení.

#### --why--
Rozdíl ve výkonu tu nehraje roli. Jde o to, jak se velikost chová na malém a velkém okně.

### --see--

css-zaklady/jednotky-a-hodnoty#min-max-a-clamp

## --question--

Prvek má `width: min(100%, 30rem)` a jeho rodič je široký 360 px. Kolik pixelů bude prvek široký při výchozí velikosti písma?

### --expected--
360

### --accept--
360px
360 px

### --why--
`30rem` je 480 px a 100 % je 360 px. `min()` vybere menší hodnotu, tedy 360 px. Na širokém rodiči by se prvek zastavil na 480 px.

### --see--

css-zaklady/jednotky-a-hodnoty#min-max-a-clamp
