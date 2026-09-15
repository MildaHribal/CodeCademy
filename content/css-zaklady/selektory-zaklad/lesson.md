# Selektory

Tabulka jízdního řádu s barevně prostřídanými řádky, ikona PDF u odkazu ke stažení, podtržení jen u aktivní položky menu, červený rámeček u vyplněného špatně zadaného e-mailu — to všechno jsou selektory. Čím přesněji umíš prvky vybrat, tím méně tříd musíš do HTML přidávat a tím méně pravidel přepisovat.

:::check pretest
Seznam `<ul>` má pět položek `<li>` a CSS obsahuje `li:nth-child(2n) { background-color: #f1f5f9; }`. Které položky dostanou šedé pozadí?

### --answer--
Jen druhá.

#### --why--
Číslo `2` samotné by vybralo jen druhou položku. `2n` je vzorec, za `n` se dosazuje 0, 1, 2…

### --correct--
Druhá a čtvrtá.

#### --why--
`2n` dá pro n = 1, 2, 3… pozice 2, 4, 6. Šestá položka v seznamu není, takže zbudou druhá a čtvrtá — sudé řádky.

### --answer--
Každá druhá od první: první, třetí a pátá.

#### --why--
Liché pozice by vybral vzorec `2n+1` nebo slovo `odd`. `2n` jsou sudé.
:::

:::check pretest
Co je rozdíl mezi selektory `.card .title` a `.card.title`?

### --answer--
Žádný, mezera se v CSS ignoruje.

#### --why--
Mezera je v selektoru významný znak. Mezi dvěma třídami mění, jestli mluvíš o jednom prvku, nebo o dvou.

### --correct--
První vybere prvek `.title` uvnitř `.card`, druhý jeden prvek, který má obě třídy.

#### --why--
Mezera znamená „někde uvnitř". Třídy nalepené na sebe znamenají „tentýž prvek má obě".

### --answer--
První vybere prvky s jednou z tříd, druhý s oběma.

#### --why--
„Jedna z tříd" by byla skupina s čárkou `.card, .title`. Mezera říká něco o vztahu dvou prvků.
:::

## Problém: jak vybrat správné prvky

V článku o výletech chceš, aby odkazy na mapy.cz měly za textem šipku, odkazy ke stažení PDF ikonu a první odstavec byl větší. Dát každému takovému prvku vlastní třídu jde, ale HTML často píše někdo jiný nebo ho generuje redakční systém. Přesný selektor to vyřeší bez zásahu do HTML.

> [!REMEMBER]
> **Selektor je dotaz na strom HTML: popisuje, jaký prvek hledáš (typ, třída, atribut, stav) a kde leží vůči ostatním (uvnitř, hned za, na kolikáté pozici).** Pravidlo dostanou všechny prvky, které dotazu odpovídají.

Stejné dotazy píšeš i v JavaScriptu: `document.querySelector('.card .title')` bere přesně stejné selektory jako CSS. Hledání prvků v JavaScriptu probírá lekce [Strom DOM](see:js-dom/strom-dom#hledani-prvku-queryselector-a-closest).

:::check
Selektor vybere prvky ze stromu HTML. Kolik prvků vybere `p`, když stránka obsahuje tři odstavce v článku a dva v patičce?

### --expected--
5

### --accept--
pět

### --why--
Typový selektor `p` nevolí podle umístění, vybere každý odstavec na stránce. Zúžit výběr na článek by umožnil kombinátor, ke kterému se dostaneš za chvíli.
:::

## Typ, třída a id

Tři základní druhy jednoduchých selektorů:

| selektor | zápis | vybere | kdy |
|---|---|---|---|
| typ | `button` | všechny prvky toho jména | základní vzhled pro celý web: `body`, `h1`, `a` |
| třída | `.button` | prvky s třídou `button` v atributu `class` | skoro vždycky — komponenty, varianty, stavy |
| id | `#cart` | prvek s `id="cart"` | v CSS výjimečně, spíš pro odkazy `#cart` a JavaScript |
| univerzální | `*` | úplně všechno | resety jako `*, *::before, *::after { box-sizing: border-box; }` |

Selektory jde **lepit k sobě** bez mezery a pak musí platit všechny části najednou pro jeden prvek:

- `button.primary` — tlačítko s třídou `primary`,
- `.alert.alert--error` — prvek, který má obě třídy.

Proč se v CSS vyhýbat id? Id smí být na stránce jen jednou, takže pravidlo pro něj nejde použít znovu. A hlavně má id v CSS **vyšší prioritu** než jakýkoli počet tříd: pravidlo `#cart` přebije `.cart--empty`, ať je napsané kdekoli. Jak se priorita přesně počítá, rozebere sekce o kaskádě a specificitě. Teď si pamatuj: stylovat třídami.

:::live predict
```html
<button id="order" class="button button--disabled">Objednat</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

#order {
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background-color: #2563eb;
  color: white;
}

.button--disabled {
  background-color: #cbd5e1;
  color: #475569;
}
```
--question-- Tlačítko má třídu `button--disabled`, jejíž pravidlo je napsané až za pravidlem `#order`. Jakou bude mít barvu?
--option-- Šedou, protože pozdější pravidlo vyhrává.
--option*-- Modrou, protože selektor s id přebije třídu bez ohledu na pořadí.
--option-- Napůl — pozadí šedé z třídy, text bílý z id.
--why-- „Pozdější vyhrává" platí jen pro selektory se stejnou prioritou. Id má vyšší prioritu než třída, takže `#order` vyhraje v pozadí i v barvě textu. Proto se stav „vypnuto" nedá snadno přidat. Zkus přejmenovat `#order` na `.button` a šedá začne platit.
:::

:::check
Napiš selektor, který vybere odkaz `<a>` jen tehdy, když má třídu `nav-link` a zároveň třídu `is-active`.

### --expected--
a.nav-link.is-active

### --accept--
.nav-link.is-active
.is-active.nav-link
a.is-active.nav-link

### --why--
Části nalepené k sobě bez mezery popisují jeden prvek, pro který musí platit všechny. Mezera by znamenala „`.is-active` někde uvnitř `.nav-link`".
:::

## Atributové selektory

Hranaté závorky vyberou prvek podle atributu v HTML:

| selektor | vybere | příklad použití |
|---|---|---|
| `[disabled]` | prvek, který atribut má (na hodnotě nezáleží) | vypnutá tlačítka |
| `[type="email"]` | atribut s přesně touhle hodnotou | e-mailová pole ve formuláři |
| `[href^="https://"]` | hodnota **začíná** textem | odkazy na jiné weby |
| `[href$=".pdf"]` | hodnota **končí** textem | odkazy ke stažení PDF |
| `[href*="mapy.cz"]` | hodnota **obsahuje** text | odkazy na mapy |

Atributový selektor jde přilepit k typu nebo třídě: `a[href$=".pdf"]`, `input[type="checkbox"]`. U většiny atributů, včetně `href`, záleží na velikosti písmen, takže `[href$=".pdf"]` nevybere `SOUBOR.PDF`. Pomůže přidat za hodnotu ` i`: `[href$=".pdf" i]`.

:::live
```html
<article class="trip">
  <h2>Výlet na Pradědovo</h2>
  <p>Trasa začíná na <a href="https://mapy.cz/s/karlova-studanka">parkovišti v Karlově Studánce</a>.</p>
  <p>Stáhni si <a href="/vylety/praded-trasa.pdf">mapu trasy v PDF</a> a <a href="/vylety/praded-vyskovy-profil.PDF">výškový profil</a>.</p>
  <p>Další výlety najdeš v <a href="/vylety">přehledu výletů</a>.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.6; }

a[href^="https://"] {
  color: #047857;
}

a[href$=".pdf"] {
  font-weight: 700;
}
```
:::

Výškový profil tučný není, protože jeho adresa končí velkým `.PDF`. Přidej do selektoru ` i` před zavírací závorku a sleduj, jak ztuční. Pak zkus pravidlo `a[href*="vylety"] { text-decoration-style: wavy; }` a spočítej, kolik odkazů dostane vlnku.

:::check
Napiš selektor, který vybere všechny prvky `<input>` s atributem `type` rovným `password`.

### --expected--
input[type="password"]

### --accept--
input[type=password]
[type="password"]
[type=password]

### --why--
Typ `input` a atributový selektor v hranatých závorkách jsou nalepené k sobě, takže popisují jeden prvek. Uvozovky u jednoslovné hodnoty nejsou povinné.
:::

## Kombinátory: vztahy mezi prvky

[[kombinátor|Kombinátory]] (*combinators*) spojí dva selektory a řeknou, jak spolu prvky souvisejí:

| zápis | jméno | vybere `B`, když… |
|---|---|---|
| `A B` (mezera) | potomek | `B` leží **kdekoli uvnitř** `A` |
| `A > B` | přímý potomek | `B` je **dítě** `A`, ne vnouče |
| `A + B` | sousední sourozenec | `B` je **hned za** `A` se stejným rodičem |
| `A ~ B` | obecný sourozenec | `B` je **kdekoli za** `A` se stejným rodičem |

A pak je tu čárka, která nic nekombinuje: `h1, h2` je [[skupina selektorů]] — dvě samostatná pravidla se stejnými deklaracemi. Pozor na past z lekce Jak CSS funguje: když je jeden selektor ve skupině neplatný, zahodí se celé pravidlo.

:::live predict
```html
<nav class="menu">
  <a href="/">Domů</a>
  <ul>
    <li><a href="/kurzy">Kurzy</a></li>
    <li><a href="/lektori">Lektoři</a></li>
  </ul>
  <a href="/kontakt">Kontakt</a>
</nav>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.menu > a {
  color: #be185d;
  font-weight: 700;
}
```
--question-- Které odkazy budou růžové a tučné?
--option-- Všechny čtyři, protože všechny leží v `.menu`.
--option*-- Jen „Domů" a „Kontakt".
--option-- Jen „Domů", protože `>` vybere první odkaz.
--why-- `>` vybírá jen přímé děti. „Domů" a „Kontakt" jsou dětmi `.menu`, „Kurzy" a „Lektoři" leží v `<li>` uvnitř `<ul>`, takže jsou pravnoučata. Změň `>` na mezeru a obarví se všechny čtyři.
:::

Sousední sourozenec se hodí na rozestupy mezi prvky stejného druhu. Pravidlo `.step + .step { border-top: 1px solid #e2e8f0; }` dá čáru mezi kroky postupu, ale ne nad první — první krok žádného předchůdce nemá.

:::check
Máš `<h2>` a za ním tři odstavce se stejným rodičem. Napiš selektor, který vybere **jen první** odstavec za nadpisem.

### --expected--
h2 + p

### --accept--
h2+p

### --why--
`+` vybere prvek, který stojí hned za `h2`. Druhý a třetí odstavec stojí za jiným odstavcem, ne za nadpisem. `h2 ~ p` by vybral všechny tři.
:::

## Pseudotřídy: stav prvku

[[pseudotřída|Pseudotřídy]] (*pseudo-classes*) začínají jednou dvojtečkou a vyberou prvek podle stavu, který v HTML napsaný není:

| pseudotřída | platí, když… |
|---|---|
| `:hover` | je nad prvkem ukazatel myši |
| `:active` | je prvek právě stisknutý |
| `:focus` | má prvek fokus (klávesnicí i kliknutím) |
| `:focus-visible` | má fokus **a** prohlížeč usoudil, že je ho potřeba ukázat — při ovládání klávesnicí a u textových polí i po kliknutí, protože do nich budeš psát |
| `:visited` | odkaz vede na už navštívenou adresu (smí měnit jen barvy) |
| `:disabled`, `:checked` | pole je vypnuté, zaškrtávátko zaškrtnuté |

Pravidlo se stavem obsahuje jen to, co se **změní**. Zbytek vzhledu si prvek nese ze základního pravidla.

**Obrys pro klávesnici patří do `:focus-visible`.** `:focus` platí i po kliknutí myší, a když se tam obrys někomu nelíbí, smaže ho — a člověk ovládající web klávesnicí pak nevidí, kde je. `:focus-visible` u odkazu nebo tlačítka obrys po kliknutí myší neukáže, z klávesnice ano.

:::live
```html
<a class="cta" href="#">Rezervovat stůl</a>
<a class="cta" href="#">Zobrazit menu</a>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; display: flex; gap: 1rem; }

.cta {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  background-color: #7c2d12;
  color: #fff7ed;
  text-decoration: none;
}

.cta:hover {
  background-color: #9a3412;
}

.cta:focus-visible {
  outline: 3px solid #f97316;
  outline-offset: 3px;
}
```
:::

Najeď myší na tlačítka, pak klikni do náhledu a mačkej Tab. Klikni myší na tlačítko — obrys se neobjeví. Zkus v pravidle přepsat `:focus-visible` na `:focus` a klikni znovu.

:::check
Uživatel prochází odkazy v patičce klávesou Tab a nevidí, na kterém je. Ve stylech je `.footer a:focus { outline: none; }`, protože obrys po kliknutí myší vadil grafikovi. Napiš selektor pravidla, do kterého patří náhradní výrazný obrys — vidět ho má uživatel klávesnice, ne uživatel myši po kliknutí.

### --expected--
.footer a:focus-visible

### --accept--
a:focus-visible

### --why--
`:focus-visible` platí, když je fokus potřeba ukázat, u odkazu tedy při ovládání klávesnicí. Pravidlo s `outline: none` na `:focus` je lepší úplně smazat, protože ruší výchozí obrys i tam, kde je potřeba.
:::

## Pseudotřídy podle pozice

Další pseudotřídy vybírají podle **pořadí mezi sourozenci**:

- `:first-child`, `:last-child` — první nebo poslední dítě svého rodiče,
- `:nth-child(3)` — třetí dítě,
- `:nth-child(2n)` nebo `:nth-child(even)` — sudé děti, `:nth-child(2n+1)` nebo `odd` — liché,
- `:nth-child(-n+3)` — první tři děti.

Důležité slovo je **dítě**: pozice se počítá mezi všemi sourozenci bez ohledu na typ a třídu. Selektor `p:first-child` neznamená „první odstavec", ale „prvek, který je prvním dítětem svého rodiče **a zároveň** je to odstavec".

:::live predict
```html
<article class="news">
  <h2>Tramvaj na Barrandov jezdí častěji</h2>
  <p>Od pondělí jezdí linka 5 ve špičce každé čtyři minuty.</p>
  <p>Změna platí do konce roku, pak ji dopravce vyhodnotí.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.6; }

.news p:first-child {
  font-size: 1.25rem;
  color: #0f766e;
}
```
--question-- Který odstavec bude větší a tyrkysový?
--option-- První odstavec „Od pondělí…".
--option-- Oba odstavce.
--option*-- Žádný.
--why-- Prvním dítětem článku je `<h2>`, ne odstavec. `p:first-child` hledá odstavec, který je zároveň prvním dítětem — takový tu není. Na první odstavec za nadpisem se hodí `h2 + p`, nebo `p:first-of-type` (první odstavec mezi sourozenci). Zkus obojí.
:::

:::check
Tabulka s jízdním řádem má v `<tbody>` dvacet řádků `<tr>`. Napiš selektor, který vybere **liché** řádky, aby šly prostřídat barvou.

### --expected--
tbody tr:nth-child(odd)

### --accept--
tr:nth-child(odd)
tr:nth-child(2n+1)
tbody tr:nth-child(2n+1)
tbody > tr:nth-child(odd)
tbody > tr:nth-child(2n+1)
tr:nth-child(2n + 1)
tbody tr:nth-child(2n + 1)

### --why--
`:nth-child(odd)` je totéž co `:nth-child(2n+1)`: pozice 1, 3, 5… Počítá se mezi sourozenci uvnitř `<tbody>`, a tam jsou jen řádky.
:::

## Pseudoprvky `::before` a `::after`

[[pseudoprvek|Pseudoprvky]] (*pseudo-elements*) začínají **dvěma** dvojtečkami a vybírají část prvku, která v HTML není jako samostatný prvek. Nejčastější jsou `::before` a `::after`: vloží do prvku obsah na začátek, nebo na konec.

```css
.external::after {
  content: " ↗";
}
```

Bez vlastnosti `content` se `::before` ani `::after` vůbec nevytvoří — ani s barvou, ani s rozměry. Hodnota je text v uvozovkách, prázdný text `""` pro čistě dekorativní tvary, nebo třeba `counter()`.

Další pseudoprvky, které potkáš: `::marker` (odrážka nebo číslo seznamu), `::placeholder` (zástupný text v poli), `::selection` (označený text).

:::live
```html
<ul class="checklist">
  <li>Pas nebo občanský průkaz</li>
  <li>Evropský průkaz zdravotního pojištění</li>
  <li>Nabíječka a powerbanka</li>
</ul>
<p><a class="external" href="https://www.mzv.gov.cz">Rady pro cestování na webu ministerstva</a></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.6; }

.checklist {
  padding: 0;
  list-style: none;
}

.checklist li::before {
  content: "✓ ";
  color: #16a34a;
  font-weight: 700;
}

.external::after {
  content: " ↗";
}
```
:::

Smaž v pravidle `.checklist li::before` řádek s `content` a sleduj, že zmizí celá fajfka, i když barva a tučnost v pravidle zůstaly.

> [!NOTE]
> Text z `content` čtečky obrazovky čtou jen někdy a nejde označit myší. Důležitý obsah proto patří do HTML, pseudoprvky jen na ozdoby.

:::check
Pravidlo `.new::before { color: #dc2626; font-weight: 700; }` nic nezobrazí. Napiš deklaraci, která do pseudoprvku vloží text `Nové: `.

### --expected--
content: "Nové: "

### --accept--
content: 'Nové: '

### --why--
Pseudoprvek `::before` vznikne jen s vlastností `content`. Barva a tučnost pak platí pro vložený text.
:::

## Jak pojmenovat třídy

Selektory umí hodně, ale na většinu pravidel se hodí **jedna třída**. Pravidlo `.card__title` je krátké, jasně říká, co styluje, a nerozbije se, když někdo nadpis v HTML přesune nebo změní z `h2` na `h3`. Řetězec `main section article > div h2` se rozbije při první změně struktury.

Aby se ve třídách dalo vyznat i ve velkém projektu, používá se konvence pojmenování. Nejrozšířenější je **BEM** (*Block, Element, Modifier*):

- **blok** — samostatná komponenta: `.card`, `.menu`,
- **element** — část bloku, oddělená dvěma podtržítky: `.card__title`, `.menu__link`,
- **modifikátor** — varianta nebo stav, oddělený dvěma pomlčkami: `.card--featured`, `.menu__link--active`.

V HTML pak prvek nese základní třídu i modifikátor: `class="menu__link menu__link--active"`. Takhle byly pojmenované třídy v digitální vizitce (`.card__name`, `.status--available`).

:::check
Komponenta „karta produktu" má blok `product`. Napiš podle BEM jméno třídy (s tečkou) pro její cenu ve variantě „ve slevě".

### --expected--
.product__price--sale

### --accept--
.product__price--discount

### --why--
Blok `product`, element `price` za dvěma podtržítky, modifikátor `sale` za dvěma pomlčkami. V HTML pak cena nese obě třídy: `product__price product__price--sale`.
:::

## Typické chyby a pasti

> [!PITFALL] Mezera navíc nebo chybějící
> *Příznak:* `.button .primary` nic nevybere, i když tlačítko má obě třídy.
>
> *Oprava:* mezera znamená „uvnitř". Pro jeden prvek se dvěma třídami piš `.button.primary` bez mezery.

> [!PITFALL] `:first-child` není „první toho typu"
> *Příznak:* `.news p:first-child` neobarví první odstavec, protože před ním je nadpis.
>
> *Oprava:* pozice se počítá mezi všemi sourozenci. Použij `h2 + p`, `p:first-of-type`, nebo dej prvku třídu.

> [!PITFALL] `:nth-child` ignoruje třídu
> *Příznak:* `.product:nth-child(2)` nevybere druhý produkt, protože v seznamu je před produkty ještě nadpis.
>
> *Oprava:* číslo je pozice mezi všemi dětmi rodiče. Počítej i ostatní prvky, nebo použij `:nth-child(2 of .product)`.

> [!PITFALL] Pseudoprvek bez `content`
> *Příznak:* `::before` s barvou, rozměry i pozadím se neukáže, v DevTools ho ve stromu vůbec nenajdeš.
>
> *Oprava:* přidej `content: ""` (nebo text). Bez `content` pseudoprvek nevznikne.

> [!PITFALL] Stav přes id nejde přepsat
> *Příznak:* pravidlo `.button--disabled` se neprojeví, i když je ve stylopisu později než `#order`.
>
> *Oprava:* styluj třídami. Selektor s id má vyšší prioritu než třídy, pořadí to nezmění.

:::check
Kolega chce zvýraznit aktivní záložku, která má v HTML `class="tab is-active"`. Napsal `.tab .is-active { color: #1d4ed8; }` a nic se nestalo. Napiš opravený selektor.

### --expected--
.tab.is-active

### --accept--
.is-active.tab

### --why--
S mezerou selektor hledá prvek `.is-active` někde uvnitř `.tab`. Záložka má obě třídy sama, takže části patří k sobě bez mezery.
:::

:::live predict
```html
<ul class="products">
  <li class="products__heading">Nejprodávanější</li>
  <li class="product">Batoh Rhino 28 l</li>
  <li class="product">Láhev Kupilka 0,55 l</li>
  <li class="product">Čelovka Petzl Tikka</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.8; }

.products { list-style: none; padding: 0; }
.products__heading { font-weight: 700; }

.product:nth-child(2) {
  color: #b45309;
  font-weight: 700;
}
```
--question-- Který produkt bude oranžový a tučný?
--option*-- Batoh Rhino 28 l.
--option-- Láhev Kupilka 0,55 l.
--option-- Žádný, `:nth-child` s třídou nefunguje.
--why-- `:nth-child(2)` počítá mezi všemi dětmi seznamu, nadpis je na pozici 1. Druhým dítětem je batoh, a protože má třídu `product`, vybere se. Druhý **produkt** (láhev) je až třetí dítě — vybral by ho `:nth-child(2 of .product)`. Zkus to.
:::

:::explain
Vysvětli vlastními slovy, proč se na většinu pravidel používá jedna třída pojmenovaná podle BEM, a ne selektor s id nebo dlouhý řetězec potomků jako `main article div h2`.

## --model--
Třída se dá použít na libovolném počtu prvků a pravidlo s ní nezávisí na tom, kde prvek v HTML leží, takže přesun nebo změna značky nic nerozbije. Id je na stránce jen jednou a má vysokou prioritu, takže se pravidlo s ním špatně přepisuje třeba stavem. Dlouhý řetězec potomků se rozbije při každé změně struktury a z jeho zápisu není poznat, co styluje. BEM k tomu dává jménům řád: z `.card__title--large` je hned vidět komponenta, část i varianta.

## --checklist--
- Třídu jde použít opakovaně na víc prvků.
- Pravidlo s třídou nezávisí na struktuře HTML.
- Id má vysokou prioritu a pravidla s ním se špatně přepisují.
- Dlouhý řetězec potomků se rozbije při změně HTML.
- BEM z názvu ukáže blok, element a modifikátor.
:::

V dalším labu použiješ selektory na stránce programu kina, kde HTML skoro žádné třídy nemá — vybírat budeš podle pozice, atributů a vztahů.

## Kde to najdeš v MDN

- [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors) — přehled všech druhů selektorů s odkazy na podrobnosti.
- [Attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors) — všechny varianty `[atribut]` včetně `^=`, `$=`, `*=` a přepínače ` i`.
- [:nth-child()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:nth-child) — vzorce `An+B`, `odd`, `even` a zápis `of S`.
- [Pseudo-elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements) — `::before`, `::after`, `::marker` a další, s poznámkami o přístupnosti.

# --questions--

## --question--

Žebříček nejprodávanějších knih je seznam `<li>` libovolné délky. Napiš selektor, který vybere **první tři** položky, aby dostaly medailovou barvu.

### --expected--
li:nth-child(-n+3)

### --accept--
li:nth-child(-n + 3)
:nth-child(-n+3)
li:nth-child(1), li:nth-child(2), li:nth-child(3)

### --why--
Ve vzorci `-n+3` se za `n` dosazuje 0, 1, 2, 3…, takže vyjdou pozice 3, 2, 1, 0, −1… Existují jen pozice 1 až 3. Na rozdíl od tří samostatných selektorů to funguje beze změny pro jakkoli dlouhý seznam.

### --see--

css-zaklady/selektory-zaklad#pseudotridy-podle-pozice

## --question--

Kde se v této ukázce objeví šipka ` ↗`?

```html
<p>Více na <a href="https://www.cd.cz">webu Českých drah</a> a v <a href="/jizdenky">našem ceníku</a>.</p>
```

```css
a[href^="http"]::after {
  content: " ↗";
}
```

### --answer--

Za oběma odkazy, protože oba jsou `<a>` s atributem `href`.

#### --why--
Myslíš si, že atributový selektor se `^=` kontroluje jen přítomnost atributu? Kontroluje, čím hodnota začíná.

### --correct--

Jen za odkazem na web Českých drah.

#### --why--
`^="http"` vybere odkazy, jejichž `href` začíná na `http`. `/jizdenky` začíná lomítkem.

### --answer--

Nikde, `::after` nejde použít na odkaz.

#### --why--
`::after` funguje na odkazech, odstavcích i nadpisech. Nejde jen na prvky bez obsahu, jako je `<img>` nebo `<input>`.

### --see--

css-zaklady/selektory-zaklad#atributove-selektory

## --question--

Napiš selektor, který vybere odstavce `<p>`, které jsou **přímými dětmi** prvku s třídou `modal`, ale ne odstavce vnořené hlouběji.

### --expected--
.modal > p

### --accept--
.modal>p

### --why--
Kombinátor `>` vybírá jen přímé děti. Mezera (`.modal p`) by vybrala i odstavce ve vnořených prvcích.

### --see--

css-zaklady/selektory-zaklad#kombinatory-vztahy-mezi-prvky
