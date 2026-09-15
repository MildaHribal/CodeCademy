# Dědičnost a výchozí hodnoty

Nastavíš písmo na `body` a nadpisy, odstavce i seznamy ho převezmou. Tlačítko „Odeslat" a pole formuláře ale mají dál malé Arial. Odkaz v tmavé patičce zůstane modrý, i když patička má bílý text. A nadpis s dlouhým názvem se po změně `line-height` na článku slepí do sebe. Všechno to je jedna kapitola CSS: dědičnost. Setkáš se s ní v každém formuláři, patičce i designovém systému.

:::check pretest
V CSS je jen `footer { color: white; }`. Jakou barvu bude mít odkaz `<a href="/kontakt">` uvnitř patičky?

### --answer--
Bílou, protože odkaz barvu zdědí od patičky.

#### --why--
Odkaz by barvu zdědil jen tehdy, kdyby na něj žádná jiná deklarace `color` nemířila. Nějaká ale míří.

### --correct--
Modrou, protože výchozí styl prohlížeče pro odkazy má přednost před zděděnou barvou.

#### --why--
Prohlížeč dává odkazům barvu vlastním pravidlem. Zděděná hodnota se použije, jen když prvek žádnou deklaraci nemá — ani z výchozích stylů. Za chvíli uvidíš proč.
:::

:::check pretest
Karta má `border: 2px solid gray`. Bude mít rámeček i odstavec uvnitř karty?

### --answer--
Ano, všechny vlastnosti rodiče se předávají dětem.

#### --why--
Kdyby se dědil rámeček, měl by ho každý odstavec, odkaz i písmeno uvnitř karty. Dědí se jen část vlastností.

### --correct--
Ne, rámeček se nedědí.

#### --why--
Dědí se hlavně vlastnosti textu: barva, písmo, řádkování. Rámečky, okraje a pozadí patří jen prvku, kterému je nastavíš.
:::

## Problém: tlačítko bez písma stránky

Tady je formulář, kde má `body` nastavené patkové písmo o velikosti 18 px:

:::live
```html
<form class="newsletter">
  <h2>Novinky z pražírny</h2>
  <p>Jednou měsíčně nové kávy a pozvánky na ochutnávky.</p>
  <label for="email">E-mail</label>
  <input id="email" type="email" placeholder="jana@example.cz">
  <button>Odebírat</button>
</form>
```
```css
body {
  margin: 1rem;
  font: 18px/1.5 Georgia, "Times New Roman", serif;
  color: #3f2a1d;
}

.newsletter { display: grid; gap: 0.5rem; max-width: 22rem; }
.newsletter h2 { margin: 0; }
.newsletter p { margin: 0 0 0.5rem; }
```
:::

Nadpis, odstavec i popisek mají Georgii. Pole a tlačítko mají malé bezpatkové písmo. Zkus do CSS dopsat `input, button { font: inherit; }` a sleduj, jak se sjednotí.

Tomu, že prvek převezme hodnotu vlastnosti od rodiče, se říká [[dědění]] (*inheritance*).

> [!REMEMBER]
> **Prvek zdědí hodnotu od rodiče jen tehdy, když je vlastnost dědičná a když na prvek žádná deklarace té vlastnosti nemíří — ani z výchozích stylů prohlížeče.** Jakákoli deklarace má přednost před zděděnou hodnotou.

:::check
Proč popisek `<label>` v ukázce písmo stránky převzal a tlačítko ne?

### --answer--
Protože `font` se dědí jen do prvků, které obsahují text, a tlačítko je formulářový prvek.

#### --why--
Tlačítko text obsahuje. Rozdíl není v typu prvku, ale v tom, jestli na něj míří nějaká deklarace písma.

### --correct--
Protože výchozí styly prohlížeče nastavují písmo formulářovým prvkům, ale popiskům ne.

#### --why--
Na popisek žádná deklarace `font` nemíří, a tak dědí. Na tlačítko míří výchozí styl prohlížeče a ten má přednost před zděděnou hodnotou.
:::

## Které vlastnosti se dědí

Dědí se hlavně vlastnosti **textu**. Dává to smysl: když nastavíš barvu článku, chceš ji i v odstavcích a zvýrazněném slově. Rámeček ve všech potomcích nechceš.

| dědí se | nedědí se |
|---|---|
| `color` | `margin`, `padding` |
| `font-family`, `font-size`, `font-weight`, `font-style` | `border`, `border-radius`, `outline` |
| `line-height`, `letter-spacing`, `text-align`, `text-transform` | `background`, `box-shadow` |
| `list-style`, `cursor`, `visibility` | `width`, `height`, `display` |
| vlastní vlastnosti (`--token`) | `opacity`, `filter`, `transform` |

Poslední řádek vpravo mate: když dáš kartě `opacity: 0.5`, zprůhlední se i text uvnitř. Průhlednost se ale nedědí — prohlížeč vykreslí celou kartu i s obsahem a průhledný je výsledek. Potomek má pořád `opacity: 1`, a proto ho nejde „zneprůhlednit" zpátky.

Tipni si, co z pravidla zdědí zvýrazněné slovo a odkaz uvnitř:

:::live predict
```html
<p class="notice">Objednávky odeslané do <strong>čtvrtka 12:00</strong> doručíme do Vánoc. <a href="#doprava">Podmínky dopravy</a></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.notice {
  max-width: 26rem;
  padding: 0.75rem 1rem;
  border: 2px solid;
  color: #b91c1c;
}
```
--question-- Co se stane se slovem v `<strong>` a s odkazem?
--option-- Oba budou červené a každý bude mít vlastní červený rámeček.
--option*-- `<strong>` bude červený bez rámečku, odkaz zůstane modrý.
--option-- Oba budou červené, rámeček bude jen kolem odstavce.
--why-- `color` se dědí, takže `<strong>`, na který žádná deklarace `color` nemíří, zčervená. Rámeček se nedědí, je jen kolem odstavce — a protože nemá barvu, vzal si ji z `color` odstavce. Odkaz má barvu z výchozích stylů prohlížeče a ta přebije zděděnou hodnotu. Dopiš `.notice a { color: inherit; }` a odkaz zčervená.
--see-- css-kaskada/dedicnost#ktere-vlastnosti-se-dedi
:::

:::check
Seznam `<ul class="steps">` má `list-style: square` a `padding-left: 2rem`. Vnořený seznam `<ul>` uvnitř jeho položky nemá žádné vlastní pravidlo. Který z těch dvou stylů převezme?

### --answer--
Oba, protože je vnořený v seznamu, který je má.

#### --why--
`padding` se nedědí. Vnořený seznam má odsazení z výchozích stylů prohlížeče.

### --correct--
Jen čtverečkové odrážky (`list-style`).

#### --why--
`list-style` se dědí, `padding` ne. Vnořený seznam tedy dostane čtverečky, ale odsazení si nechá výchozí.

### --answer--
Žádný, protože vnořený seznam je nový prvek `ul` s vlastními výchozími styly.

#### --why--
Výchozí styly prohlížeče pro `ul` nastavují odsazení, ale styl odrážek ne — ten se tedy zdědí.
:::

## Zděděná hodnota prohraje s každou deklarací

Dědění **není** kritérium kaskády. Nejdřív kaskáda vybere vítěze ze všech deklarací, které na prvek míří. Teprve když žádná neexistuje, použije se hodnota rodiče (u dědičné vlastnosti) nebo počáteční hodnota (u nedědičné).

Proto nepomůže dát `body { color: white !important; }`: `!important` zesílí deklaraci na `body`, ale odkaz žádnou deklaraci z `body` nedostává, jen zděděnou hodnotu. A zděděná hodnota prohraje i s nejslabším pravidlem výchozích stylů prohlížeče.

Stejný mechanismus vysvětluje formuláře. Výchozí styly Chromu dávají poli, tlačítku, výběru i textové oblasti vlastní písmo (13,33 px, Arial nebo monospace). Oprava patří skoro do každého resetu:

```css
button,
input,
select,
textarea {
  font: inherit;
}
```

Obě varianty níž mají stejný formulář. Liší se jedinou deklarací na tlačítku:

:::compare
```html
<form class="search">
  <input type="search" placeholder="Hledat kávu" aria-label="Hledat kávu">
  <button class="search__button">Hledat</button>
</form>
```
```css
body {
  margin: 1rem;
  font: 1.125rem/1.5 system-ui, sans-serif;
}

.search { display: flex; gap: 0.5rem; }

input,
.search__button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #a8a29e;
  border-radius: 0.5rem;
}

input { font: inherit; }
```
--variant-- bez font: inherit
```css
.search__button { background: #fde68a; }
```
--variant-- font: inherit
```css
.search__button { background: #fde68a; font: inherit; }
```
:::

Vlevo je tlačítko menší a nižší než pole vedle, i když mají stejný `padding`. Vpravo si písmo i velikost vezme z formuláře a oba prvky jsou stejně vysoké.

:::check
Kolega dal do stylů `body { font-family: "Inter", sans-serif !important; }`, aby písmo převzaly i formulářové prvky. Tlačítka ho pořád nemají. Proč?

### --answer--
Protože `!important` na `body` platí jen pro prvky, které jsou přímo v `<body>`.

#### --why--
Na hloubce vnoření nezáleží. `!important` se týká jen deklarace na `body`, a ta k tlačítku nedoputuje jako deklarace.

### --correct--
Protože tlačítko dostává jen zděděnou hodnotu a ta prohraje s deklarací z výchozích stylů prohlížeče; `!important` zesílí jen deklaraci na samotném `body`.

#### --why--
Dědění přichází ke slovu až tehdy, když na prvek nemíří žádná deklarace. Na tlačítko míří výchozí styl prohlížeče, takže pomůže jen vlastní deklarace na tlačítku, třeba `font: inherit`.
:::

## Klíčová slova `inherit`, `initial`, `unset` a `revert`

Každé vlastnosti můžeš místo hodnoty dát jedno z klíčových slov, která s děděním a výchozími hodnotami pracují:

- `inherit` — vezmi hodnotu rodiče, i u vlastnosti, která se normálně nedědí (`border-color: inherit`).
- `initial` — vezmi [[počáteční hodnota|počáteční hodnotu]] (*initial value*) ze specifikace CSS. Pozor, **není** to výchozí styl prohlížeče: počáteční hodnota `display` je `inline` pro všechny prvky, i pro `div`.
- `unset` — u dědičné vlastnosti jako `inherit`, u nedědičné jako `initial`.
- `revert` — zahoď autorské styly a vrať hodnotu, kterou by prvek měl z výchozích stylů prohlížeče.

Přepínej klíčové slovo pro barvu odkazu uvnitř červeného odstavce:

:::live
```html
<p class="warning">Platba se nezdařila. <a href="#podpora">Napiš podpoře</a> nebo zkus jinou kartu.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.warning {
  color: #b91c1c;
}

.warning a {
  color: var(--keyword);
}
```
```controls
--keyword: select(inherit, initial, unset, revert) = inherit | color odkazu
```
:::

U `inherit` a `unset` je odkaz červený (barva se dědí). U `initial` je černý, protože počáteční hodnota `color` je barva textu podle systému, v běžném světlém režimu černá. U `revert` je zase modrý jako bez tvého pravidla.

Tipni si, jak dopadnou tři boxy s `display: initial`:

:::live predict
```html
<div class="step">1. Vyber kávu</div>
<div class="step">2. Zvol mletí</div>
<div class="step">3. Zaplať</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.step {
  display: initial;
  padding: 0.5rem 0.75rem;
  background: #fef3c7;
}
```
--question-- Jak se boxy zobrazí?
--option-- Pod sebou přes celou šířku, jako každý `div` bez stylů.
--option*-- Vedle sebe v jednom řádku jako text, protože počáteční hodnota `display` je `inline`.
--option-- Nezobrazí se, protože počáteční hodnota `display` je `none`.
--why-- `initial` neznamená „výchozí vzhled prvku", ale počáteční hodnotu vlastnosti ze specifikace. Pro `display` je to `inline` bez ohledu na to, jaký je to prvek. Blokový je `div` jen díky výchozím stylům prohlížeče. Přepiš `initial` na `revert` a boxy budou zase pod sebou.
--see-- css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert
:::

Hromadně jde klíčové slovo použít přes vlastnost `all`, která zastupuje všechny vlastnosti kromě vlastních vlastností: `all: unset` smaže prvku úplně všechno. Užitečné, když z `<button>` děláš ikonu bez rámečku — ale smaže to i obrys fokusu, takže ho musíš vrátit (viz [Typické chyby a pasti](see:css-kaskada/dedicnost#typicke-chyby-a-pasti)).

:::check
Chceš, aby prvek `<li>`, kterému šablona nastavila `display: flex`, byl zase obyčejná položka seznamu s odrážkou. Který zápis to udělá?

### --answer--
`display: initial`

#### --why--
Počáteční hodnota `display` je `inline`, ne `list-item`. Položka by se slila do řádku bez odrážky.

### --correct--
`display: revert`

#### --why--
`revert` vrátí hodnotu z výchozích stylů prohlížeče, a ty dávají `<li>` hodnotu `list-item`.

### --answer--
`display: unset`

#### --why--
`display` se nedědí, takže `unset` se chová jako `initial` a výsledek je `inline`.
:::

### `revert-layer`: o vrstvu zpátky

S vrstvami přibylo páté klíčové slovo. `revert-layer` zahodí deklaraci **jen z aktuální vrstvy** a použije hodnotu, kterou by prvek měl z dřívějších vrstev:

```css
@layer base, components, utilities;

@layer components {
  .link { color: #2563eb; }
}

@layer utilities {
  /* utilita, která zruší barvu z utilit a nechá komponentu rozhodnout */
  .u-color-default { color: revert-layer; }
}
```

Prvek s `class="link u-color-default"` bude modrý z komponenty. Hodí se v utilitách a motivech, které mají jednu vlastnost „vypnout" a vrátit ji o úroveň níž, aniž by musely znát konkrétní hodnotu.

:::check
V `@layer base` je `a { color: #0f766e; }`, v `@layer components` není žádné pravidlo pro odkazy a v `@layer theme` (poslední) je `.dark a { color: revert-layer; }`. Jakou barvu bude mít odkaz v `.dark`? Napiš ji tak, jak je v CSS.

### --expected--
#0f766e

### --why--
`revert-layer` zahodí deklaraci z vrstvy `theme` a hledá v dřívějších vrstvách. Ve `components` nic není, v `base` je `#0f766e`.
:::

## Spočtená hodnota a proč `line-height` bez jednotky

Dědí se [[spočtená hodnota]] rodiče (*computed value*): to, co z deklarace zbude po převodu relativních jednotek. `font-size: 2em` se spočte na pixely a potomci dědí pixely, ne „2em". Hodnota, kterou prvek nakonec opravdu použije při vykreslení (třeba šířka `50 %` přepočtená na px podle rodiče), je **použitá hodnota** (*used value*). Panel Computed v DevTools i `getComputedStyle` v JavaScriptu ukazují převážně tuhle konečnou podobu.

Na rozdílu mezi „dědí se jednotka" a „dědí se výsledek" stojí klasická past s řádkováním. Tipni si:

:::live predict
```html
<article class="post">
  <h1 class="post__title">Jak na espresso doma bez drahého kávovaru</h1>
  <p>Stačí mlýnek, váha a trpělivost. Ukážeme tři postupy.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.post {
  max-width: 22rem;
  font-size: 1rem;
  line-height: 1.5em;
}

.post__title {
  font-size: 2.25rem;
}
```
--question-- Jak bude vypadat dvouřádkový nadpis?
--option-- Řádky budou mít výšku 1,5násobku velikosti nadpisu (54 px), jako odstavec.
--option*-- Řádky se překryjí, protože nadpis zdědí řádkování 24 px spočtené z písma článku.
--option-- Řádkování nadpisu se nastaví na výchozí hodnotu, protože `line-height` se nedědí.
--why-- `1.5em` se spočte na článku: 1,5 × 16 px = 24 px. Nadpis zdědí těch 24 px, přestože má písmo 36 px, a řádky do sebe vjedou. Přepiš na `line-height: 1.5` bez jednotky — dědí se pak samotné číslo a každý prvek si ho vynásobí svou velikostí písma.
--see-- css-kaskada/dedicnost#spoctena-hodnota-a-proc-line-height-bez-jednotky
:::

Dědí se i vlastní vlastnosti. Díky tomu fungují tokeny definované na `:root` v celé stránce a varianta komponenty, která na štítku nastaví `--badge-bg`, obarví i to, co je uvnitř štítku.

:::check
Článek má `font-size: 20px` a `line-height: 1.4`. Kolik pixelů bude řádkování nadpisu s `font-size: 30px`, který uvnitř článku vlastní `line-height` nemá?

### --expected--
42

### --accept--
42px
42 px

### --why--
Bezjednotková hodnota se dědí jako číslo a nadpis ji vynásobí svou velikostí písma: 1,4 × 30 px = 42 px. S `1.4em` by zdědil 28 px spočtených na článku.
:::

## Typické chyby a pasti

> [!PITFALL] Odkazy v patičce zůstanou modré
> *Příznak:* patička má `color: white`, odkazy v ní jsou modré a na tmavém pozadí nečitelné.
>
> *Oprava:* barva odkazu přichází z výchozích stylů prohlížeče a zděděná bílá s ní prohraje. Dej odkazům `color: inherit` (v patičce, nebo rovnou v resetu).

> [!PITFALL] Formulářové prvky mají jiné písmo
> *Příznak:* tlačítka a pole jsou menší a mají Arial, i když `body` má jiné písmo.
>
> *Oprava:* `button, input, select, textarea { font: inherit; }` v resetu.

> [!PITFALL] `initial` místo výchozího vzhledu
> *Příznak:* po `display: initial` se `div` nebo `li` slije do řádku.
>
> *Oprava:* `initial` je počáteční hodnota ze specifikace, ne výchozí styl prohlížeče. Pro návrat k vzhledu prohlížeče použij `revert`.

> [!PITFALL] `line-height` s jednotkou na rodiči
> *Příznak:* větší nadpisy uvnitř článku mají řádky přes sebe.
>
> *Oprava:* piš `line-height` bez jednotky (`1.5`), dědí se pak poměr, ne pixely.

> [!PITFALL] `all: unset` na tlačítku
> *Příznak:* tlačítko s ikonou vypadá, jak má, ale při procházení klávesou Tab na něm není vidět fokus a kurzor nad ním není ruka.
>
> *Oprava:* `all: unset` smaže i obrys fokusu a kurzor z výchozích stylů. Vrať je: `&:focus-visible { outline: 2px solid; }` a `cursor: pointer`.

:::explain
Vysvětli vlastními slovy, proč odkaz uvnitř patičky s `color: white` zůstane modrý a proč nepomůže dát patičce `!important`.

## --model--
Dědění přichází ke slovu až tehdy, když na prvek nemíří žádná deklarace té vlastnosti. Na odkaz míří výchozí styl prohlížeče s modrou barvou, takže vyhraje on a zděděná bílá se nepoužije. `!important` zesílí jen deklaraci na patičce, odkaz ale od patičky nedostává deklaraci, jen zděděnou hodnotu. Pomůže vlastní deklarace na odkazu, třeba `color: inherit`.

## --checklist--
- Zděděná hodnota se použije, jen když na prvek nemíří žádná deklarace.
- Výchozí styl prohlížeče je deklarace a má přednost před zděděnou hodnotou.
- `!important` na rodiči se týká jen deklarace na rodiči.
- Opravou je deklarace přímo na odkazu, například `color: inherit`.
:::

:::check
Ikonové tlačítko má `all: unset`, aby nemělo rámeček a pozadí. Uživatel klávesnice si stěžuje, že neví, kde je. Co chybí?

### --answer--
`tabindex="0"`, protože `all: unset` vyřadí tlačítko z pořadí fokusu.

#### --why--
CSS pořadí fokusu nemění, tlačítko je dál fokusovatelné. Fokus na něm jen není vidět.

### --correct--
Vlastní obrys pro `:focus-visible`, protože `all: unset` smazal i ten z výchozích stylů.

#### --why--
Obrys fokusu dává tlačítku výchozí styl prohlížeče. `all: unset` ho přepsal na počáteční hodnotu `none`, a proto ho musíš vrátit sám.

### --answer--
`display: block`, protože `all: unset` tlačítko skryje.

#### --why--
Tlačítko je dál vidět, jen se z něj stal řádkový prvek. S fokusem to nesouvisí.
:::

## Kde to najdeš v MDN

- [Inheritance](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Inheritance) — dědičné a nedědičné vlastnosti; u každé vlastnosti v MDN najdeš v tabulce „Formal definition" řádek *Inherited*.
- [Handling conflicts: inheritance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts#inheritance) — `inherit`, `initial`, `unset`, `revert` a vlastnost `all` s ukázkami.
- [revert-layer](https://developer.mozilla.org/en-US/docs/Web/CSS/revert-layer) — jak se klíčové slovo chová ve vrstvách a u `!important`.
- [Computed value](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Value_processing#computed_value) — jak z deklarace vznikne spočtená, použitá a skutečná hodnota.

# --questions--

## --question--

Na `<ul class="menu">` je `color: #1e3a8a` a `border-bottom: 1px solid`. Uvnitř je `<li>` bez vlastních stylů. Které z těch dvou vlastností ovlivní vzhled položky jako její vlastní hodnota?

### --answer--

Obě, položka je uvnitř seznamu.

#### --why--
Být uvnitř nestačí. `border-bottom` se nedědí, takže položka žádný vlastní rámeček nemá — spodní čára je jen jedna, pod celým seznamem.

### --correct--

Jen barva textu.

#### --why--
`color` je dědičná vlastnost, `border-bottom` ne. Položka má barvu seznamu, rámeček ne.

### --answer--

Žádná, `li` má vlastní výchozí styly.

#### --why--
Výchozí styly prohlížeče pro `li` barvu textu nenastavují, takže ji položka zdědí.

### --see--

css-kaskada/dedicnost#ktere-vlastnosti-se-dedi

## --question--

Napiš jednu deklaraci pro tlačítko, díky které převezme velikost i rodinu písma z okolního textu.

### --expected--

font: inherit

### --accept--

font:inherit

### --why--

Zkratka `font` s `inherit` převezme všechny vlastnosti písma od rodiče a přebije tak výchozí písmo, které tlačítku dávají styly prohlížeče.

### --see--

css-kaskada/dedicnost#zdedena-hodnota-prohraje-s-kazdou-deklaraci

## --question--

Obal `.box` nemá `display: block` ani žádné jiné pravidlo pro `display`, a přesto se jako blok chová. Tvoje pravidlo `.box { display: unset; }` z něj udělá řádkový prvek. Proč?

### --answer--

Protože `unset` vrací hodnotu z výchozích stylů prohlížeče a ta je pro `div` řádková.

#### --why--
Hodnotu z výchozích stylů vrací `revert`, a pro `div` je blokový.

### --correct--

Protože `display` se nedědí, takže `unset` se chová jako `initial` a počáteční hodnota `display` je `inline`.

#### --why--
`unset` u nedědičné vlastnosti znamená počáteční hodnotu ze specifikace. Blokový vzhled `div` pochází jen z výchozích stylů prohlížeče, které `unset` přepíše.

### --answer--

Protože `unset` zdědí `display` od rodiče, a rodič je řádkový.

#### --why--
Zdědit by `unset` hodnotu mohl jen u dědičné vlastnosti. `display` dědičná není.

### --see--

css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert

## --question--

Sekce má `font-size: 18px` a `line-height: 2em`. Kolik pixelů bude řádkování odstavce uvnitř s `font-size: 14px`, když sám `line-height` nemá?

### --expected--

36

### --accept--

36px
36 px

### --why--

`2em` se spočte na sekci na 2 × 18 = 36 px a odstavec dědí spočtenou hodnotu, ne `2em`. Bezjednotková `2` by dala 2 × 14 = 28 px.

### --see--

css-kaskada/dedicnost#spoctena-hodnota-a-proc-line-height-bez-jednotky
