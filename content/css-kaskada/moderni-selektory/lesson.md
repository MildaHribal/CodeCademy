# Moderní selektory a nesting

Karta produktu, která s fotkou vypadá jinak než bez ní. Pole formuláře, které zčervená až poté, co do něj uživatel něco napíše. Vyhledávání, které se zvýrazní, když je kurzor uvnitř. Ještě před pár lety na to každý web potřeboval JavaScript, který přepínal třídy. Dnes to umí CSS samo — a v kódu knihoven i velkých webů na tyhle selektory narazíš na každém kroku.

:::check pretest
Co vybere selektor `.card:has(img)`?

### --answer--
Všechny obrázky, které leží uvnitř karty.

#### --why--
Tak by se chovalo `.card img`. Pseudotřída za dvojtečkou ale vždycky upřesňuje prvek před ní.

### --correct--
Karty, které uvnitř obsahují obrázek.

#### --why--
`:has()` vybere prvek, když uvnitř něj existuje něco, co odpovídá argumentu. Stylovat tak jde rodiče podle obsahu.

### --answer--
Karty, které obrázek neobsahují.

#### --why--
To by byl opak: `.card:not(:has(img))`.
:::

:::check pretest
V CSS je vnořené pravidlo `.menu { &:hover { color: navy; } }`. Jaký obyčejný selektor mu odpovídá?

### --answer--
`.menu :hover`

#### --why--
S mezerou by to byl libovolný potomek `.menu` pod kurzorem. Mezi `&` a `:hover` mezera není.

### --correct--
`.menu:hover`

#### --why--
`&` zastupuje rodičovský selektor, takže `&:hover` je `.menu:hover`. Za chvíli uvidíš, proč na té mezeře tolik záleží.

### --answer--
`:hover .menu`

#### --why--
`&` stojí na začátku, takže rodič je vlevo, ne vpravo.
:::

## Problém: opakované selektory a stav rodiče

Styl odkazů v nadpisech článku se v obyčejném CSS píše takhle:

```css
.article h2 a:hover,
.article h3 a:hover,
.article h4 a:hover {
  text-decoration-thickness: 2px;
}
```

Tři téměř stejné řádky. A u formuláře je to horší: chceš, aby **celé pole** (popisek, vstup i nápověda) zčervenalo, když je vstup vyplněný špatně. Selektor ale vždycky vybírá poslední prvek v řetězci — `.field input` stylizuje vstup, ne `.field`. Dřív to řešil skript, který při každé změně přidával poli třídu.

> [!REMEMBER]
> **Pseudotřídy `:is()`, `:where()`, `:not()` a `:has()` berou jako argument seznam selektorů. `:has()` se navíc dívá dovnitř prvku, takže styl rodiče může záviset na tom, co obsahuje.**

:::live
```html
<form class="signup">
  <div class="field">
    <label for="email">E-mail</label>
    <input id="email" type="email" required placeholder="jana@example.cz">
    <p class="field__hint">Pošleme ti potvrzení registrace.</p>
  </div>
  <button>Registrovat</button>
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.signup { display: grid; gap: 1rem; max-width: 20rem; }

.field {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
}

input { font: inherit; padding: 0.5rem; }
.field__hint { margin: 0; color: #64748b; font-size: 0.875rem; }

.field:has(input:user-invalid) {
  border-color: #dc2626;
  background: #fef2f2;
}

.field:has(input:user-invalid) .field__hint {
  color: #b91c1c;
}
```
:::

Napiš do pole `jana` a klikni mimo. Rámeček celého pole i nápověda zčervenají. Doplň `@example.cz` a pole se vrátí. Žádný JavaScript.

:::check
Proč pravidlo `.field input:user-invalid { border-color: red; }` neobarví rámeček kolem popisku a nápovědy?

### --answer--
Protože `:user-invalid` funguje jen na formuláři, ne na poli.

#### --why--
`:user-invalid` platí právě pro jednotlivá pole formuláře. Problém je v tom, který prvek selektor vybírá.

### --correct--
Protože selektor vybírá poslední prvek řetězce, tedy vstup, ne obal `.field`.

#### --why--
Kombinátor mezera jen říká, kde má vstup ležet. Stylovat obal podle stavu vstupu umí až `.field:has(…)`.
:::

## `:is()`: seznam v jednom selektoru

`:is()` vybere prvek, který odpovídá **kterémukoli** selektoru v závorce. Tři řádky z úvodu se zkrátí na jeden:

```css
.article :is(h2, h3, h4) a:hover {
  text-decoration-thickness: 2px;
}
```

Seznam v `:is()` je navíc [[shovívavý seznam selektorů|shovívavý]] (*forgiving selector list*): když je v něm selektor, kterému prohlížeč nerozumí, přeskočí jen ten. Obyčejný seznam oddělený čárkami se chová jinak. Tipni si:

:::live predict
```html
<h2 class="section-title">Nejprodávanější stany</h2>
<h3 class="subsection-title">Pro dva</h3>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

h2,
h3:hovr {
  color: #0f766e;
}
```
--question-- Kolega se ve druhém selektoru přepsal (`:hovr`). Jakou barvu bude mít nadpis `h2`?
--option-- Tyrkysovou, protože `h2` je napsané správně a chyba se týká jen `h3`.
--option*-- Černou, protože neplatný selektor v seznamu zahodí celé pravidlo.
--option-- Tyrkysovou oba nadpisy, prohlížeč překlep opraví.
--why-- Obyčejný seznam selektorů je jedno pravidlo a neplatná část ho zneplatní celé — prohlížeč ho zahodí i s `h2`. Přepiš selektor na `:is(h2, h3:hovr)` a `h2` zezelená, protože seznam v `:is()` přeskočí jen neplatnou položku.
--see-- css-kaskada/moderni-selektory#is-seznam-v-jednom-selektoru
:::

### Specificita `:is()`

**`:is()` má specificitu svého nejsilnějšího argumentu** — i když prvek odpovídá slabšímu z nich. To je past, když do seznamu přimícháš id:

:::live predict
```html
<p class="lead">Zimní výbava <span class="highlight">až o 30 % levněji</span></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

:is(#intro, p) span {
  color: #475569;
}

.lead span {
  color: #db2777;
  font-weight: 700;
}
```
--question-- Na stránce žádný prvek s id `intro` není. Jakou barvu bude mít zvýrazněný text?
--option-- Růžovou, protože `#intro` na stránce není a z `:is()` se použije jen `p`.
--option*-- Šedou, protože `:is(#intro, p)` má specificitu id bez ohledu na to, co se vybralo.
--option-- Růžovou, protože `.lead span` je v souboru později.
--why-- Specificita se počítá ze selektoru, ne ze stránky. `:is(#intro, p) span` má (1, 0, 1) — nejsilnější argument je id — a `.lead span` jen (0, 1, 1). Smaž z `:is()` položku `#intro` a vyhraje růžová.
--see-- css-kaskada/moderni-selektory#specificita-is
:::

:::check
Napiš specificitu selektoru `.nav :is(a, .button):hover` ve tvaru `A,B,C`.

### --expected--
0,3,0

### --accept--
(0,3,0)
0-3-0
0 3 0

### --why--
`.nav` dává jednu třídu, `:hover` jednu pseudotřídu a `:is(a, .button)` specificitu svého nejsilnějšího argumentu, tedy třídy `.button`. Celkem B = 3, C = 0 — typ `a` se nepočítá, protože v `:is()` prohrál s třídou.
:::

## `:where()`: stejný výběr, nulová specificita

`:where()` vybírá úplně stejně jako `:is()` a seznam má taky shovívavý. Jediný rozdíl: **všechno uvnitř `:where()` má specificitu nula.** Proto se hodí do resetů, výchozích stylů a knihoven, které mají jít snadno přepsat. Obě varianty níž se liší jen jménem pseudotřídy:

:::compare
```html
<article class="article">
  <h2>Jak vybrat spacák do zimy</h2>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
```
--variant-- :is(.article) h2
```css
:is(.article) h2 {
  color: #0f766e;
}

h2 {
  color: #be123c;
}
```
--variant-- :where(.article) h2
```css
:where(.article) h2 {
  color: #0f766e;
}

h2 {
  color: #be123c;
}
```
:::

Vlevo vyhraje tyrkysová: `:is(.article) h2` má (0, 1, 1) a obyčejné `h2` (0, 0, 1) ho nepřebije, i když je později. Vpravo má `:where(.article) h2` jen (0, 0, 1), specificity jsou stejné a rozhodne pořadí — vyhraje pozdější `h2`.

:::check
Knihovna komponent píše výchozí vzhled tlačítek jako `:where(.ui-button) { background: gray; }`. Ty ve svých stylech napíšeš `button { background: teal; }`. Tlačítko je `<button class="ui-button">` a tvoje styly se načítají po knihovně. Jaké bude mít pozadí?

### --expected--
teal

### --why--
`:where(.ui-button)` má specificitu (0, 0, 0) a tvoje `button` (0, 0, 1), takže vyhraje i bez ohledu na pořadí. Knihovna tím schválně dává přednost tvým stylům.
:::

## `:not()` se seznamem

`:not()` vybere prvky, které **neodpovídají žádnému** selektoru v závorce. Klasické použití jsou oddělovače mezi položkami:

```css
/* čára pod každou položkou kromě poslední */
.menu li:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

/* odkazy v navigaci, které nejsou aktivní ani vypnuté */
.nav a:not(.is-active, [aria-disabled="true"]) {
  color: #475569;
}
```

`:not(.a, .b)` znamená „ani `.a`, ani `.b`", ne „není obojí zároveň". Specificita se počítá stejně jako u `:is()`: nejsilnější argument. Takže `li:not(#featured)` má (1, 0, 1) — id v negaci selektor zesílí, přestože vybírá skoro všechno.

:::check
Seznam má položky `<li class="done">`, `<li class="urgent">` a `<li>`. Kolik položek vybere `li:not(.done, .urgent)`?

### --expected--
1

### --accept--
jednu
jedna

### --why--
`:not()` se seznamem vyloučí každou položku, která odpovídá **kterémukoli** selektoru v závorce. Zbude jen `<li>` bez třídy.
:::

## `:has()`: styl rodiče podle obsahu

`:has()` vybere prvek, uvnitř kterého je něco, co odpovídá argumentu. Argument je relativní selektor: bez kombinátoru hledá mezi všemi potomky, s `>` jen mezi přímými dětmi a s `+` nebo `~` mezi následujícími sourozenci.

```css
/* karta s fotkou má fotku vedle textu */
.card:has(img) { display: grid; grid-template-columns: 8rem 1fr; }

/* nadpis, za kterým hned následuje odstavec, má menší spodní okraj */
h2:has(+ p) { margin-bottom: 0.25rem; }

/* galerie se čtyřmi a více fotkami má menší dlaždice */
.gallery:has(> :nth-child(4)) { --tile: 8rem; }
```

Poslední řádek je [[kvantitní dotaz]] (*quantity query*): když má galerie čtvrté dítě, má jich aspoň čtyři. Tipni si, co vybere `:has()` bez kombinátoru:

:::live predict
```html
<article class="card">
  <span class="badge">Novinka</span>
  <h2>Stan Husky Bright 3</h2>
</article>
<article class="card">
  <h2>Karimatka Vango Ultralite</h2>
  <footer><span class="badge">Doprava zdarma</span></footer>
</article>
<article class="card">
  <h2>Čelovka Ledlenser H7R</h2>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; display: grid; gap: 0.75rem; max-width: 22rem; }

.card { padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 0.75rem; }
.card h2 { margin: 0; font-size: 1rem; }
.badge { font-size: 0.75rem; font-weight: 700; color: #7c3aed; }

.card:has(.badge) {
  border-color: #7c3aed;
  background: #f5f3ff;
}
```
--question-- Které karty budou mít fialový rámeček?
--option-- Jen první, protože štítek musí být přímo v kartě.
--option*-- První a druhá, protože `:has(.badge)` hledá mezi všemi potomky.
--option-- Všechny tři, protože `:has()` se týká každé karty na stránce, kde nějaký štítek je.
--why-- Argument bez kombinátoru znamená „kdekoli uvnitř", takže se počítá i štítek zanořený v `<footer>`. Přepiš selektor na `.card:has(> .badge)` a fialová zůstane jen první kartě, kde je štítek přímým dítětem. Třetí karta štítek nemá, takže ji `:has()` nevybere nikdy.
--see-- css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu
:::

Specificita `:has()` je opět specificita nejsilnějšího argumentu: `.card:has(img)` má (0, 1, 1). A jedno omezení: `:has()` nejde vnořit do jiného `:has()` — takové pravidlo prohlížeč zahodí.

:::check
Napiš selektor, který vybere `<label>`, když **hned za ním** následuje zaškrtnuté zaškrtávací pole `input:checked`.

### --expected--
label:has(+ input:checked)

### --accept--
label:has(+input:checked)
label:has(+ :checked)
label:has(+ input[type="checkbox"]:checked)

### --why--
`:has()` se nemusí dívat jen dovnitř. Relativní selektor začínající `+` hledá bezprostředně následujícího sourozence, takže `label:has(+ input:checked)` vybere popisek před zaškrtnutým polem.
:::

## Stav formuláře: `:focus-within` a `:user-invalid`

Dvě pseudotřídy, které se s `:has()` skvěle doplňují:

- `:focus-within` platí pro prvek, když má fokus on sám **nebo kterýkoli jeho potomek**. Vyhledávací lišta se zvýrazní, když je kurzor v jejím poli.
- `:user-invalid` platí pro pole s neplatnou hodnotou, ale až **poté, co s ním uživatel pracoval** (napsal a odešel, nebo odeslal formulář). Starší `:invalid` platí hned od načtení stránky.

Obě varianty níž mají prázdné povinné pole. Liší se jen pseudotřídou:

:::compare
```html
<form class="search" role="search">
  <label for="q">Hledat v obchodě</label>
  <input id="q" name="q" type="search" required placeholder="stan, spacák, čelovka">
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.search {
  display: grid;
  gap: 0.25rem;
  max-width: 18rem;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
}

.search:focus-within {
  border-color: #2563eb;
}

input { font: inherit; padding: 0.5rem; border: 2px solid #cbd5e1; border-radius: 0.5rem; }
```
--variant-- input:invalid
```css
input:invalid {
  border-color: #dc2626;
}
```
--variant-- input:user-invalid
```css
input:user-invalid {
  border-color: #dc2626;
}
```
:::

Vlevo je pole červené hned — uživatel ještě nic neudělal a už vidí chybu. Vpravo je šedé. Klikni do pravého pole: rámeček formuláře zmodrá díky `:focus-within`. Napiš písmeno, smaž ho a klikni vedle — teprve teď pole zčervená.

> [!NOTE]
> Validaci v prohlížeči (`required`, `type="email"`, `pattern`) probírala sekce o formulářích. Tady jde jen o to, jak stav pole vybrat selektorem.

:::check
Formulář objednávky má povinné pole pro telefon. Chceš, aby zčervenalo až po tom, co ho uživatel vyplní špatně nebo zkusí formulář odeslat. Kterou pseudotřídu použiješ?

### --answer--
`:invalid`

#### --why--
`:invalid` platí od načtení stránky, takže by prázdné povinné pole svítilo červeně dřív, než do něj uživatel klikne.

### --correct--
`:user-invalid`

#### --why--
`:user-invalid` čeká na interakci uživatele: na úpravu pole a odchod z něj, nebo na pokus o odeslání.

### --answer--
`:focus-within`

#### --why--
`:focus-within` sleduje fokus, ne platnost hodnoty.
:::

## Vnořování: CSS nesting

Pravidla jde psát do sebe, jako to znáš z preprocesorů. [[vnořování|Vnořování]] (*CSS nesting*) funguje ve všech prohlížečích bez nástrojů:

```css
.card {
  padding: 1rem;
  border-radius: 0.75rem;

  /* potomek: .card h2 */
  h2 {
    margin: 0;
  }

  /* stav karty: .card:hover */
  &:hover {
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  }

  /* varianta: .card.card--featured */
  &.card--featured {
    border: 2px solid #7c3aed;
  }

  /* karta v tmavé sekci: .dark-section .card */
  .dark-section & {
    background: #1e293b;
  }

  /* media dotaz jen pro kartu */
  @media (width >= 40rem) {
    padding: 1.5rem;
  }
}
```

Pravidla vnořování:

- `&` zastupuje rodičovský selektor. Kde `&` není, platí vnořený selektor jako potomek (`h2` uvnitř `.card` = `.card h2`).
- **Mezera za `&` je kombinátor.** `&:hover` je stav karty, `& :hover` je libovolný potomek pod kurzorem.
- `&` smí stát i uprostřed nebo na konci (`.dark-section &`).
- Vnořit jde i `@media`, `@supports` a `@container`. Media dotazy do hloubky probere sekce Responzivní design a témata, teď stačí vědět, že pravidlo uvnitř platí jen na dost širokém okně.

Tipni si, jestli tahle rozbalovací nabídka dostane barvu:

:::live predict
```html
<div class="dropdown is-open">
  <button class="dropdown__toggle">Kategorie</button>
  <ul class="dropdown__menu">
    <li>Stany</li>
    <li>Spacáky</li>
  </ul>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.dropdown {
  display: inline-block;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;

  & .is-open {
    border-color: #2563eb;
    background: #eff6ff;
  }
}
```
--question-- Dostane nabídka s třídou `is-open` modrý rámeček a pozadí?
--option-- Ano, `& .is-open` je totéž co `.dropdown.is-open`.
--option*-- Ne, `& .is-open` hledá potomka s třídou `is-open` uvnitř `.dropdown`.
--option-- Ne, protože vnořené pravidlo potřebuje svůj vlastní blok mimo `.dropdown`.
--why-- Mezera za `&` je kombinátor potomka, takže pravidlo odpovídá `.dropdown .is-open`. Uvnitř nabídky žádný prvek s `is-open` není. Smaž mezeru (`&.is-open`) a styl se použije na samotnou nabídku.
--see-- css-kaskada/moderni-selektory#vnorovani-css-nesting
:::

> [!PITFALL] Zvyk ze Sassu: `&__title`
> *Příznak:* napíšeš `.card { &__title { … } }` a nadpis karty žádný styl nedostane, v DevTools pravidlo vůbec není.
>
> *Oprava:* v CSS `&` neslepuje text do jména třídy jako v Sassu, takže selektor `&__title` je neplatný a prohlížeč pravidlo zahodí. Třídy BEM piš celé: `.card__title { … }` vedle `.card`, ne uvnitř.

:::check
Uvnitř pravidla `.tabs` je vnořené `&[aria-selected="true"] { … }`. Jaký obyčejný selektor mu odpovídá?

### --expected--
.tabs[aria-selected="true"]

### --accept--
.tabs[aria-selected=true]
.tabs[aria-selected='true']

### --why--
Mezi `&` a atributovým selektorem není mezera, takže jde o tentýž prvek `.tabs` s atributem, ne o potomka.
:::

### Specificita vnořených pravidel

Vnořené pravidlo má specificitu, jako by za `&` stál `:is(rodič)`. U jednoduchého rodiče to vyjde stejně jako rozepsaný selektor: `.card { h2 { } }` má (0, 1, 1) jako `.card h2`. Past přijde, když je rodič **seznam**:

:::live predict
```html
<aside class="panel">
  <a class="panel__link" href="#">Průvodce velikostmi</a>
</aside>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

#sidebar,
.panel {
  padding: 1rem;
  border-radius: 0.75rem;
  background: #f8fafc;

  a {
    color: #475569;
  }
}

.panel .panel__link {
  color: #ea580c;
  font-weight: 700;
}
```
--question-- Jakou barvu bude mít odkaz v panelu?
--option-- Oranžovou, protože `.panel .panel__link` má dvě třídy a vnořené `a` jen typ prvku.
--option*-- Šedou, protože vnořené pravidlo odpovídá `:is(#sidebar, .panel) a` se specificitou id.
--option-- Oranžovou, protože `#sidebar` na stránce není.
--why-- Rodičovský seznam se do vnořeného pravidla dosadí jako `:is(#sidebar, .panel)`, a `:is()` má specificitu nejsilnějšího argumentu. Vnořené `a` má proto (1, 0, 1) a porazí (0, 2, 0). Rozděl pravidlo na dvě — `#sidebar` zvlášť a `.panel` zvlášť — a vyhraje oranžová.
--see-- css-kaskada/moderni-selektory#specificita-vnorenych-pravidel
:::

:::check
Napiš specificitu vnořeného pravidla `&:focus-visible` uvnitř `nav .link { … }` ve tvaru `A,B,C`.

### --expected--
0,2,1

### --accept--
(0,2,1)
0-2-1
0 2 1

### --why--
Pravidlo odpovídá `:is(nav .link):focus-visible`. `:is()` přinese (0, 1, 1) ze selektoru rodiče a `:focus-visible` přidá jednu pseudotřídu.
:::

## `@scope`: styly jen pro kus stránky

`@scope` omezí platnost pravidel na podstrom stránky, a volitelně i s dolní hranicí, kam už styl nesahá:

```css
@scope (.product-card) to (.product-card__description) {
  img {
    border-radius: 0.5rem;
    aspect-ratio: 4 / 3;
  }
}
```

Obrázky v kartě dostanou zaoblení a poměr stran, ale obrázky vložené do popisu produktu (třeba z redakčního systému) zůstanou beze změny. Obyčejný selektor `.product-card img` by zasáhl i je. Holé selektory uvnitř `@scope` nepřidávají specificitu za kořen, takže `img` tu má (0, 0, 1).

`@scope` funguje ve všech hlavních prohlížečích od prosince 2025, kdy ho doplnil Firefox 146. Na komponenty bez vnořených cizích částí ti dál stačí třída komponenty.

:::live
```html
<article class="product-card">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120'%3E%3Crect width='160' height='120' fill='%230ea5e9'/%3E%3C/svg%3E" width="160" height="120" alt="">
  <h2>Batoh Osprey Talon 22</h2>
  <div class="product-card__description">
    <p>Na zádech jako přilepený. Detail zádového systému:</p>
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120'%3E%3Crect width='160' height='120' fill='%2322c55e'/%3E%3C/svg%3E" width="160" height="120" alt="">
  </div>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

@scope (.product-card) to (.product-card__description) {
  img {
    border-radius: 1rem;
    outline: 4px solid #f59e0b;
    outline-offset: 3px;
  }
}
```
:::

Zkus smazat `to (.product-card__description)` a sleduj, že oranžový obrys a zaoblení dostane i zelený obrázek v popisu.

:::check
Proč se v ukázce zelený obrázek v popisu nezaoblil, přestože leží uvnitř `.product-card`?

### --answer--
Protože `@scope` platí jen pro přímé potomky kořene.

#### --why--
`@scope` sahá do libovolné hloubky pod kořenem. Zastavit ho umí jen dolní hranice.

### --correct--
Protože `to (.product-card__description)` určuje dolní hranici a obsah uvnitř ní už do rozsahu nepatří.

#### --why--
Rozsah začíná u `.product-card` a končí u prvků, které odpovídají selektoru za `to`. Co je uvnitř hranice, styl nezasáhne.

### --answer--
Protože druhý obrázek je až za nadpisem a `img` vybere jen první obrázek.

#### --why--
Typový selektor vybere všechny obrázky, ne jen první. Rozdíl dělá hranice rozsahu.
:::

## Typické chyby a pasti

> [!PITFALL] Id v `:is()` nebo v rodičovském seznamu
> *Příznak:* pravidlo s `:is(#main, .content)` nebo vnořené pravidlo pod `#sidebar, .panel` přebíjí všechno ostatní, i tam, kde žádné id není.
>
> *Oprava:* `:is()` i vnořování počítají specificitu nejsilnějšího selektoru v seznamu. Id do seznamů nedávej, nebo místo `:is()` použij `:where()`.

> [!PITFALL] Mezera za `&`
> *Příznak:* `&:hover` funguje, ale `& :hover` nebo `& .is-active` se na prvek samotný nikdy nepoužije.
>
> *Oprava:* mezera je kombinátor potomka. Pro stav nebo variantu stejného prvku piš `&` a selektor bez mezery.

> [!PITFALL] Chyba vidět hned po načtení
> *Příznak:* povinná pole svítí červeně dřív, než do nich uživatel klikne.
>
> *Oprava:* `:invalid` platí od začátku, `:user-invalid` až po interakci. Pro zobrazení chyb použij `:user-invalid`.

> [!PITFALL] Jeden překlep shodí celý seznam
> *Příznak:* pravidlo `a:hover, a:focus-visibel` nefunguje ani při najetí myší.
>
> *Oprava:* neplatný selektor v obyčejném seznamu zneplatní celé pravidlo. Oprav překlep; `:is()` by neplatnou položku přeskočil, ale překlep by tím jen schoval.

:::explain
Vysvětli vlastními slovy, kdy do seznamu selektorů sáhneš po `:where()` a kdy po `:is()`, a proč na tom záleží.

## --model--
`:is()` i `:where()` vyberou totéž, liší se jen specificitou. `:is()` převezme specificitu nejsilnějšího argumentu, `:where()` má vždycky nulu. Do resetů, výchozích stylů a knihoven, které se mají snadno přepsat, dám `:where()`. `:is()` použiju tam, kde má pravidlo vážit jako normální selektor, a hlídám, abych do něj nepřidal id.

## --checklist--
- `:is()` a `:where()` vybírají stejné prvky.
- `:is()` má specificitu nejsilnějšího argumentu.
- `:where()` má specificitu nula.
- `:where()` se hodí do resetů a stylů, které se mají snadno přepsat.
:::

:::check
Kolegovo vnořené pravidlo `.card { &-footer { padding: 1rem; } }` nefunguje. Co s tím?

### --answer--
Dopsat mezeru: `& -footer`.

#### --why--
S mezerou by `-footer` byl typ prvku uvnitř karty. Takový prvek neexistuje a potíž je jinde.

### --correct--
Napsat celé jméno třídy jako samostatné pravidlo `.card-footer`.

#### --why--
CSS nesting neslepuje `&` s textem do nového jména třídy jako Sass. Selektor `&-footer` je neplatný, takže celé vnořené pravidlo prohlížeč zahodí.

### --answer--
Nahradit `&` za `:is(.card)`.

#### --why--
`:is(.card)-footer` je stejně neplatný selektor. Jméno třídy se ze dvou kusů poskládat nedá.
:::

V dalším workshopu z těchhle selektorů postavíš přehled herních serverů: štítky a tlačítka ve variantách, vnořené stavy a karty, které reagují na obsah.

## Kde to najdeš v MDN

- [:is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) a [:where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) — shovívavý seznam selektorů a rozdíl ve specificitě s příklady.
- [:has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) — relativní selektory s `>`, `+` a `~`, omezení a výkon.
- [Using CSS nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting) a [Nesting and specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Nesting_and_specificity) — všechna místa, kam jde `&` napsat, a jak se počítá specificita.
- [@scope](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope) — kořen, dolní hranice a blízkost rozsahu (*scope proximity*), která rozhoduje mezi dvěma rozsahy.

# --questions--

## --question--

Kontejner `.toolbar` má mít jiné rozvržení, když obsahuje vyhledávací pole `input[type="search"]` kdekoli uvnitř. Napiš selektor.

### --expected--

.toolbar:has(input[type="search"])

### --accept--

.toolbar:has(input[type=search])
.toolbar:has([type="search"])
.toolbar:has(input[type='search'])

### --why--

`:has()` s argumentem bez kombinátoru hledá kdekoli mezi potomky `.toolbar`, takže vybere lištu podle obsahu.

### --see--

css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu

## --question--

V CSS je `:where(.prose) a { color: navy; }` a o řádek výš `a { color: teal; }`. Jakou barvu bude mít odkaz uvnitř `.prose`?

### --answer--

`navy`, protože pravidlo je konkrétnější — vybírá jen odkazy v `.prose`.

#### --why--
„Konkrétnější" v kaskádě znamená vyšší specificitu, ne užší výběr. Třída uvnitř `:where()` do specificity nepřidá nic.

### --correct--

`navy`, protože obě pravidla mají (0, 0, 1) a `:where(.prose) a` je později.

#### --why--
`:where(.prose)` má nulu, zbude typ `a`. Specificity jsou stejné a rozhodne pořadí ve zdroji. Kdyby pravidla byla v opačném pořadí, vyhrála by `teal`.

### --answer--

`teal`, protože `:where()` má nulovou specificitu a prohraje s každým pravidlem.

#### --why--
Nulu má jen část uvnitř `:where()`. Typ `a` za závorkou se počítá, takže se specificita rovná obyčejnému `a`.

### --see--

css-kaskada/moderni-selektory#where-stejny-vyber-nulova-specificita

## --question--

Rozepiš vnořené pravidlo do obyčejného selektoru bez `&`: uvnitř `.menu` je `.site-header--dark & { … }`.

### --expected--

.site-header--dark .menu

### --why--

`&` zastupuje rodiče tam, kde stojí. Mezera před ním je kombinátor potomka, takže pravidlo platí pro `.menu` uvnitř tmavé hlavičky.

### --see--

css-kaskada/moderni-selektory#vnorovani-css-nesting

## --question--

Kolik z těchto tří pravidel prohlížeč zahodí jako neplatná? `li:not(.done, .urgent) { }`, `.card:has(.a:has(.b)) { }` a `.card { &__title { } }`

### --expected--

2

### --accept--

dvě
dva

### --why--

`:not()` se seznamem je platný. `:has()` vnořené do jiného `:has()` platné není a `&__title` taky ne, protože CSS neslepuje `&` s textem do jména třídy.

### --see--

css-kaskada/moderni-selektory#typicke-chyby-a-pasti
