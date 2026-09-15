# Top layer a ukotvení

Nabídka účtu pod avatarem v Gmailu, výběr barvy u produktu, tooltip u ikony v editoru, menu „⋯" u zprávy v chatu. Roky se stavěly přes `position: absolute`, `z-index` a knihovnu v JavaScriptu, která počítala, kam nabídku posadit. Dnes to prohlížeč umí sám. Nejdřív dva odhady.

:::check pretest
Nabídka je uvnitř karty, která má `overflow: hidden` a `translate: 0 -4px`. Nabídka má atribut `popover` a je otevřená. Bude oříznutá okrajem karty?

### --answer--
Ano, `overflow: hidden` ořízne všechno, co je v kartě.

#### --why--
Pro absolutně pozicovanou nabídku by to platilo. Proč na `popover` neplatí, vysvětlí první část.

### --correct--
Ne, bude vidět celá a nad vším na stránce.

#### --why--
Otevřený popover se přesune do *top layer*, vrstvy nad celou stránkou. Na `overflow`, stacking contexty ani `z-index` předků se v ní nehledí.

### --answer--
Jen když kartě dáš `z-index` vyšší než mají sousední karty.

#### --why--
`z-index` řeší pořadí vrstev, oříznutí přes `overflow` s ním nesouvisí. A popover nepotřebuje ani jedno.
:::

:::check pretest
Kolik řádků JavaScriptu potřebuješ na tlačítko, které otevře nabídku, a na to, aby se nabídka zavřela klávesou Esc nebo kliknutím mimo ni? Napiš číslo.

### --expected--
0

### --why--
Nula. Atribut `popover` na nabídce a `popovertarget` na tlačítku zařídí otevírání, zavírání i Esc. Uvidíš v druhé části.
:::

## Problém: nabídka, kterou nic neudrží

Nabídka postavená přes `position: absolute` má tři slabiny, které už znáš nebo tušíš:

- **Ořízne ji předek** s `overflow: hidden` nebo `auto` — posuvný seznam, karta se zaoblenými rohy.
- **Uvězní ji stacking context** předka — `opacity`, `translate` nebo `z-index` na kartě.
- **Neví, kde je okraj okna.** U tlačítka dole na stránce vyjede pod okraj a posadit ji jinam umí jen JavaScript, který měří polohy.

K tomu zavírání klávesou Esc, kliknutím mimo a vrácení fokusu — všechno ručně. Obě varianty níž mají stejnou kartu s `overflow: hidden` a stejnou nabídku. Liší se tím, jestli je nabídka popover:

:::compare
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: #eef2f7; }

.card {
  position: relative;
  width: 16rem;
  height: 5rem;
  padding: 0.75rem 1rem;
  overflow: hidden;
  border-radius: 1rem;
  background: white;
}

.menu {
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: #1e293b;
  color: white;
  line-height: 1.8;
}
```
--variant-- position: absolute
```html
<article class="card">
  Faktura 2026-091
  <div class="menu menu--absolute">Stáhnout PDF<br>Poslat e-mailem<br>Zrušit</div>
</article>
```
```css
.menu--absolute { position: absolute; top: 2.5rem; left: 3rem; }
```
--variant-- popover
```html
<article class="card">
  Faktura 2026-091
  <div class="menu" id="menu" popover>Stáhnout PDF<br>Poslat e-mailem<br>Zrušit</div>
</article>
```
```js
document.querySelector('#menu').showPopover();
```
:::

Absolutní nabídka je uříznutá spodní hranou karty. Popover je celý, protože se otevřený vykreslí v [[top layer]], zvláštní vrstvě nad celou stránkou. Jen leží uprostřed okna — k tomu, jak ho posadit vedle tlačítka, se dostaneš v části o ukotvení. (Řádek v JavaScriptu tu jen otevře popover bez kliknutí, v praxi ho nepotřebuješ.)

> [!REMEMBER]
> **Otevřený popover nebo modální `<dialog>` se vykreslí v top layer — nad celou stránkou, mimo všechny stacking contexty, `overflow` i `z-index`. Ukotvení mu pak řekne, u kterého prvku a na které straně má ležet.**

:::check
Proč popover v ukázce nebyl oříznutý kartou s `overflow: hidden`?

### --answer--
Protože popover má automaticky obrovský `z-index`.

#### --why--
`z-index` s oříznutím přes `overflow` nesouvisí, a top layer navíc na `z-index` vůbec nehledí.

### --correct--
Protože se otevřený popover vykresluje v top layer, mimo kartu i její `overflow`.

#### --why--
V HTML je popover pořád v kartě, ale vykreslí se ve zvláštní vrstvě nad celou stránkou. Oříznutí, stacking contexty i obsahující blok předků pro něj neplatí.

### --answer--
Protože `overflow: hidden` ořezává jen text, ne prvky.

#### --why--
`overflow: hidden` ořízne cokoli, co z prvku přesahuje — i absolutně pozicovanou nabídku, jak ukázala první varianta.
:::

## Atribut `popover` a tlačítko `popovertarget`

[[popover|Popover]] je obyčejný prvek s atributem `popover`. Dokud je zavřený, nevidíš ho (prohlížeč mu dá `display: none`). Otevře ho tlačítko s atributem `popovertarget`, ve kterém je `id` popoveru:

```html
<button popovertarget="share-menu">Sdílet</button>
<div id="share-menu" popover>
  <a href="#">Kopírovat odkaz</a>
  <a href="#">Poslat e-mailem</a>
</div>
```

Popover s hodnotou `auto` (výchozí, stačí napsat jen `popover`) umí sám:

- **přepnout** se kliknutím na tlačítko (otevřít, znovu kliknout, zavřít),
- **zavřít** se klávesou Esc a kliknutím kamkoli mimo něj — tomu se říká [[zavření kliknutím mimo]] (*light dismiss*),
- **zavřít ostatní** otevřené `auto` popovery, když se otevře (kromě těch, ve kterých je vnořený),
- říct čtečce obrazovky, že tlačítko něco rozbalilo, a pustit klávesu Tab z tlačítka rovnou do popoveru, i když je v HTML jinde.

Fokus se při otevření nepřesune, zůstane na tlačítku. Zkus to s myší i s klávesnicí:

:::live
```html
<header class="bar">
  <strong>Faktury</strong>
  <button class="bar__button" popovertarget="account">Jana Dvořáková ▾</button>
</header>
<div id="account" class="account" popover>
  <a href="#">Můj profil</a>
  <a href="#">Nastavení</a>
  <a href="#">Odhlásit se</a>
</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.bar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #0f172a; color: white; }
.bar__button { padding: 0.375rem 0.75rem; border: 0; border-radius: 999px; background: #334155; color: white; font: inherit; cursor: pointer; }

.account { padding: 0.5rem; border: 0; border-radius: 0.75rem; box-shadow: 0 20px 40px -12px rgb(15 23 42 / 0.45); }
.account a { display: block; padding: 0.375rem 0.75rem; border-radius: 0.375rem; color: #0f172a; text-decoration: none; }
.account a:hover, .account a:focus-visible { background: #e2e8f0; }
```
:::

Klikni na jméno, pak zkus Esc, kliknutí mimo a opakované kliknutí na jméno. Pak klávesou Tab dojdi na jméno, stiskni Enter a znovu Tab — fokus skočí na „Můj profil".

:::check
Na stránce jsou dvě tlačítka: „Filtry" otevírá popover s filtry, „Řazení" popover s řazením. Oba popovery mají jen atribut `popover`. Otevřeš filtry a pak klikneš na „Řazení". Kolik popoverů bude otevřených? Napiš číslo.

### --expected--
1

### --accept--
jeden

### --why--
Popover `auto` při otevření zavře ostatní otevřené `auto` popovery, pokud v nich není vnořený. Filtry se zavřou a zůstane jen řazení. Kliknutí na „Řazení" je navíc kliknutí mimo filtry.
:::

## `auto` a `manual`

Hodnota `popover="manual"` vypne automatické chování: nezavře se Esc ani kliknutím mimo a nezavírá ostatní. Otevřít a zavřít ho musí tlačítko nebo skript. Hodí se na věci, které mají zůstat, dokud je uživatel sám nezavře — oznámení „Uloženo", panel nápovědy, přehrávač, který se nesmí schovat při kliknutí do stránky.

Tlačítko umí i jen otevřít nebo jen zavřít: `popovertargetaction="show"` nebo `"hide"` (výchozí je `"toggle"`). Manuální popover proto skoro vždycky obsahuje vlastní zavírací tlačítko:

```html
<div id="saved" popover="manual" role="status">
  Změny jsou uložené.
  <button popovertarget="saved" popovertargetaction="hide">Zavřít</button>
</div>
```

:::live predict
```html
<div id="help" popover="manual" class="panel panel--help">Nápověda k formuláři</div>
<div id="filters" popover class="panel panel--filters">Filtry</div>
<div id="sort" popover class="panel panel--sort">Řazení</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.panel { margin: 0; padding: 1rem 1.25rem; border: 0; border-radius: 0.75rem; color: white; font-weight: 700; }
.panel--help { inset: 1rem auto auto 1rem; background: #0f766e; }
.panel--filters { inset: 5rem auto auto 1rem; background: #7c3aed; }
.panel--sort { inset: 9rem auto auto 1rem; background: #c2410c; }
```
```js
// Otevře postupně všechny tři popovery, jako by uživatel klikal na tlačítka.
document.querySelector('#help').showPopover();
document.querySelector('#filters').showPopover();
document.querySelector('#sort').showPopover();
```
--question-- Skript otevřel nápovědu (`manual`), pak filtry (`auto`) a nakonec řazení (`auto`). Které panely uvidíš?
--option-- Všechny tři, každý popover se zavírá jen sám.
--option*-- Nápovědu a řazení.
--option-- Jen řazení, poslední otevřený popover zavře všechny ostatní.
--why-- Otevření řazení zavřelo filtry, protože oba jsou `auto`. Manuální nápovědy se automatické zavírání netýká, zůstane otevřená, dokud ji něco výslovně nezavře. Zkus u filtrů změnit hodnotu na `manual` — zůstanou vidět všechny tři.
--see-- css-pozicovani/top-layer-a-kotveni#auto-a-manual
:::

:::check
Stavíš oznámení „Soubor se nahrál", které nesmí zmizet, když uživatel klikne jinam do stránky. Napiš hodnotu atributu `popover`.

### --expected--
manual

### --why--
`auto` by se zavřelo kliknutím mimo. `manual` zůstane otevřené, dokud ho nezavře tlačítko s `popovertargetaction="hide"` nebo skript.
:::

## Výchozí styly, `:popover-open` a `::backdrop`

Prohlížeč dává popoveru výchozí styly: `position: fixed`, `inset: 0` a `margin: auto` (proto je uprostřed okna), šířku a výšku podle obsahu, tenký rámeček a padding. Zavřený popover má `display: none`.

Otevřený popover najdeš selektorem `:popover-open`. Za otevřeným popoverem je pseudoprvek `::backdrop` přes celé okno — průhledný, dokud mu nedáš pozadí. Hodí se na ztmavení stránky za panelem:

```css
.share-panel::backdrop {
  background: rgb(15 23 42 / 0.4);
}
```

:::live predict
```html
<button popovertarget="colors">Vybrat barvu</button>
<div id="colors" class="colors" popover>
  <span style="background:#ef4444"></span>
  <span style="background:#f59e0b"></span>
  <span style="background:#10b981"></span>
  <span style="background:#3b82f6"></span>
</div>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }

.colors {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 0;
  border-radius: 0.75rem;
  box-shadow: 0 12px 30px -10px rgb(0 0 0 / 0.4);
}

.colors span { width: 2rem; height: 2rem; border-radius: 50%; }
```
--question-- Nikdo zatím na tlačítko neklikl. Co uvidíš?
--option-- Jen tlačítko, popover je zavřený, dokud na tlačítko neklikneš.
--option*-- Tlačítko a paletu barev uprostřed okna, i když je popover zavřený.
--option-- Tlačítko a paletu barev hned pod ním, protože `display: flex` z popoveru udělá běžný prvek v toku.
--why-- Zavřený popover skrývá výchozí styl `display: none`. Tvoje `display: flex` ho přebilo, takže je paleta vidět pořád — a protože zbytek výchozích stylů (`position: fixed`, `inset: 0`, `margin: auto`) zůstal, sedí uprostřed okna. Oprava: `display: flex` dej jen otevřenému popoveru, selektorem `.colors:popover-open`. Zkus to.
--see-- css-pozicovani/top-layer-a-kotveni#vychozi-styly-popover-open-a-backdrop
:::

:::check
Panel košíku je popover s třídou `.cart`. Napiš selektor, který ztmaví stránku za otevřeným košíkem (pravidlo s `background`).

### --expected--
.cart::backdrop

### --why--
`::backdrop` je pseudoprvek přes celé okno, který leží v top layer těsně pod otevřeným popoverem. Bez pozadí je průhledný, takže ztmavení musíš nastavit sám.
:::

> [!NOTE]
> Plynulé objevení popoveru (vyjetí a zprůhlednění při otevření) se dělá přes `transition` a `@starting-style`. Dostaneš se k tomu v sekci o animacích, v workshopu ho už najdeš hotový ve výchozích stylech.

## `<dialog>` pro modální okna

Popover **není modální**: stránka pod ním zůstává ==aktivní==, jde klikat i tabovat dál. Na nabídky, tooltipy a výběry to je přesně správně. Pro okno, které musí uživatel vyřídit, než bude pokračovat (potvrzení smazání, přihlášení, košík před platbou), je prvek `<dialog>` otevřený jako modální.

Modální dialog se taky vykreslí v top layer a navíc: přesune fokus dovnitř, zbytek stránky udělá ==neaktivní== (nejde na něj kliknout ani se na něj dostat klávesou Tab) a zavře se klávesou Esc. Otevřít ho jde bez JavaScriptu tlačítkem s atributy `commandfor` a `command`:

```html
<button commandfor="delete-dialog" command="show-modal">Smazat projekt</button>

<dialog id="delete-dialog" aria-labelledby="delete-title">
  <h2 id="delete-title">Opravdu smazat projekt?</h2>
  <button commandfor="delete-dialog" command="close">Zrušit</button>
</dialog>
```

Atributy `commandfor` a `command` jsou nové — ve všech hlavních prohlížečích jsou od konce roku 2025. Z JavaScriptu otevřeš dialog metodou `showModal()`, k tomu se dostaneš v sekci js-dom.

| | `popover` | modální `<dialog>` |
|---|---|---|
| vrstva | top layer | top layer |
| stránka pod ním | aktivní | neaktivní |
| fokus při otevření | zůstane na tlačítku | přesune se dovnitř |
| zavření kliknutím mimo | `auto` ano, `manual` ne | ne (jen Esc a tlačítko) |
| použij na | nabídky, tooltipy, výběry, oznámení | potvrzení, formulář, který se musí vyřídit |

:::check
Uživatel kliká na „Smazat účet" a musí potvrdit, nebo zrušit. Dokud se nerozhodne, nesmí jít klikat do stránky. Co použiješ?

### --answer--
`popover="auto"`, protože se sám zavře Esc.

#### --why--
Esc umí oba. Jenže popover nechá stránku pod sebou aktivní a zavře se i kliknutím mimo — uživatel by potvrzení odklikl omylem.

### --correct--
`<dialog>` otevřený jako modální.

#### --why--
Modální dialog udělá zbytek stránky neaktivní, přesune fokus dovnitř a nezavře se kliknutím mimo. Přesně to potvrzení potřebuje.

### --answer--
`popover="manual"`, protože se nezavře kliknutím mimo.

#### --why--
Manuální popover se sice nezavře sám, ale stránka pod ním zůstává aktivní a fokus se do něj nepřesune. Modalitu popover nemá.
:::

## Ukotvení: `anchor-name`, `position-anchor` a `position-area`

Popover leží uprostřed okna. Aby ležel pod tlačítkem, potřebuje [[ukotvení]] (*anchor positioning*):

1. Tlačítko pojmenuješ: `anchor-name: --account`. Jméno začíná dvěma pomlčkami jako custom property. Z tlačítka je [[kotevní prvek]] (*anchor*).
2. Popover se k němu přiváže: `position-anchor: --account`. Funguje to pro každý prvek s `position: absolute` nebo `fixed`, a popover `fixed` už je.
3. Řekneš, kam ho posadit: `position-area`.

`position-area` si představ jako mřížku 3 × 3, v jejímž středu je kotva. Hodnota vybere buňku (nebo pás buněk), do které se popover vloží: `top`, `bottom`, `left`, `right`, rohy jako `top left`, a hodnoty se `span-` pro „od středu na jednu stranu": `bottom span-right` začne pod kotvou u její levé hrany a pokračuje doprava.

:::live
```html
<div class="stage">
  <button class="avatar" popovertarget="menu">JD</button>
</div>
<div id="menu" class="menu" popover>
  <a href="#">Můj profil</a>
  <a href="#">Nastavení</a>
</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.stage { display: grid; place-items: center; height: 18rem; background: #f1f5f9; }

.avatar {
  anchor-name: --account;
  width: 3rem;
  height: 3rem;
  border: 0;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  font: 700 1rem system-ui, sans-serif;
  cursor: pointer;
}

.menu {
  position-anchor: --account;
  position-area: var(--area);
  margin: 0.5rem;
  padding: 0.375rem;
  border: 0;
  border-radius: 0.625rem;
  box-shadow: 0 12px 30px -10px rgb(15 23 42 / 0.45);
}

.menu a { display: block; padding: 0.25rem 0.75rem; color: #0f172a; text-decoration: none; white-space: nowrap; }
```
```controls
--area: select(bottom, top, right, left, "bottom span-right", "bottom span-left", "top left") = bottom | position-area
```
:::

Klikni na avatar, pak nabídku zavři, přepni `position-area` a otevři ji znovu. Všimni si, že `margin: 0.5rem` teď dělá mezeru mezi nabídkou a avatarem — okraj se počítá uvnitř buňky mřížky.

:::check
Kotva je tlačítko 100 × 40 px s levým horním rohem na souřadnicích 400 × 300 px. Tooltip široký 60 px a vysoký 20 px má `position-area: bottom` a `margin: 0`. Na jaké svislé souřadnici (v px) bude horní hrana tooltipu?

### --expected--
340

### --accept--
340 px
340px

### --why--
Buňka `bottom` začíná pod spodní hranou kotvy: 300 + 40 = 340 px. Vodorovně je tooltip vycentrovaný pod kotvou, jeho levá hrana tedy bude na 420 px.
:::

## Přesněji: `anchor()` a `anchor-size()`

Když mřížka nestačí, píšeš polohu do `top`, `left` a spol. funkcí `anchor()`, která vrátí souřadnici hrany kotvy. `anchor-size()` vrátí její rozměr:

```css
.suggestions {
  position: absolute;
  position-anchor: --search;
  top: calc(anchor(bottom) + 4px); /* 4 px pod spodní hranou vyhledávání */
  left: anchor(left);               /* zarovnané s levou hranou */
  width: anchor-size(width);        /* stejně široké jako vyhledávání */
}
```

Našeptávač u vyhledávacího pole je typický případ: má být přesně tak široký jako pole a přilepený k jeho levé hraně.

:::check
Kotva je 100 × 40 px s levým horním rohem na 400 × 300 px. Prvek má `top: anchor(bottom)`, `left: anchor(left)` a `width: anchor-size(width)`. Jak široký bude prvek v px?

### --expected--
100

### --accept--
100 px
100px

### --why--
`anchor-size(width)` vrátí šířku kotvy, tedy 100 px. Prvek začne na 400 × 340 px, pod levým dolním rohem kotvy.
:::

## Záložní polohy: `position-try-fallbacks`

Avatar je vpravo nahoře, tlačítko „⋯" u posledního řádku tabulky dole u okraje okna. Nabídka pod ním by vyjela ven. [[záložní poloha|Záložní polohy]] (*position try fallbacks*) řeknou prohlížeči, co zkusit, když se prvek do své polohy nevejde:

- `flip-block` — přehodit na opačnou stranu ve svislém směru (zespodu nahoru),
- `flip-inline` — přehodit ve vodorovném směru (zprava doleva),
- `flip-block flip-inline` — obojí najednou,
- nebo rovnou jinou hodnotu `position-area`, třeba `top`.

Možnosti oddělené čárkou se zkoušejí v pořadí a použije se první, ve které prvek nepřeteče ven:

```css
.row-menu {
  position-area: bottom span-left;
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
}
```

:::live predict
```html
<button class="more" popovertarget="row-menu">⋯</button>
<div id="row-menu" class="menu" popover>Upravit<br>Duplikovat<br>Smazat</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.more {
  anchor-name: --more;
  position: fixed;
  bottom: 0.5rem;
  left: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  font-size: 1.25rem;
}

.menu {
  position-anchor: --more;
  position-area: bottom span-right;
  position-try-fallbacks: flip-block;
  margin: 0;
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #1e293b;
  color: white;
  line-height: 1.8;
}
```
```js
document.querySelector('#row-menu').showPopover();
```
--question-- Tlačítko „⋯" je 8 px nad spodním okrajem okna a nabídka je otevřená. Kde bude?
--option-- Pod tlačítkem, uříznutá spodním okrajem okna.
--option*-- Nad tlačítkem, protože se pod ně nevejde.
--option-- Uprostřed okna, protože se nevešla do žádné polohy.
--why-- Pod tlačítkem zbývá jen 8 px. `flip-block` přehodí `bottom` na `top`, nabídka se tam vejde, a tak ji prohlížeč použije. Smaž řádek s `position-try-fallbacks` a nabídka zůstane dole — prohlížeč ji jen posune tak, aby nevyjela z okna, a tím zakryje tlačítko.
--see-- css-pozicovani/top-layer-a-kotveni#zalozni-polohy-position-try-fallbacks
:::

:::check
Nabídka u avataru má `position-area: bottom span-right` a avatar je u pravého okraje okna, takže nabídka vyjíždí doprava ven. Napiš hodnotu `position-try-fallbacks`, která ji přehodí tak, aby se rozbalila doleva.

### --expected--
flip-inline

### --accept--
bottom span-left

### --why--
`flip-inline` přehodí polohu ve vodorovném směru: `span-right` se změní na `span-left` a nabídka se rozbalí od pravé hrany avataru doleva.
:::

## Progresivní vylepšení

Atribut `popover` funguje ve všech hlavních prohlížečích od roku 2024. Ukotvení (`anchor-name`, `position-area`, `position-try-fallbacks`) je ve všech od začátku roku 2026 — Chrome od verze 125, Safari od 26, Firefox od 147. Na starších zařízeních ho ještě potkáš.

Dobrá zpráva: popover bez ukotvení pořád funguje, jen je uprostřed okna. Nabídka, která se v novém prohlížeči otevře pod avatarem a ve starém uprostřed, je pořád použitelná. To je [[progresivní vylepšení]] (*progressive enhancement*): základ funguje všude, lepší zážitek navíc tam, kde to prohlížeč umí. Když chceš pro staré prohlížeče jiný vzhled, obal ukotvení do `@supports`:

```css
@supports (anchor-name: --a) {
  .menu {
    position-anchor: --account;
    position-area: bottom span-left;
  }
}
```

:::check
Starší prohlížeč nezná `position-area`, ale zná `popover`. Kde uvidí uživatel otevřenou nabídku s CSS z příkladu výš?

### --answer--
Nikde, nabídka se neotevře.

#### --why--
Otevírání obstará atribut `popover` a ten starší prohlížeč zná. Neznámé vlastnosti ukotvení jen ignoruje.

### --correct--
Uprostřed okna, podle výchozích stylů popoveru.

#### --why--
Prohlížeč neznámé deklarace přeskočí a zůstanou výchozí styly `position: fixed; inset: 0; margin: auto`. Nabídka funguje, jen neleží u avataru.

### --answer--
V levém horním rohu stránky.

#### --why--
Tam by skončil absolutně pozicovaný prvek bez pozicovaného předka. Popover má ve výchozích stylech `inset: 0` a `margin: auto`.
:::

## Typické chyby a pasti

> [!PITFALL] Zavřený popover je pořád vidět
> *Příznak:* nabídka je vidět uprostřed okna hned po načtení a tlačítko ji jen „přeblikne".
>
> *Oprava:* `display: flex` nebo `grid` na popoveru přebilo výchozí `display: none`. Dej ho jen otevřenému: `.menu:popover-open { display: flex; }`.

> [!PITFALL] Všechny nabídky se otevírají u poslední karty
> *Příznak:* každá karta má „⋯" s `anchor-name: --card-menu`, ale nabídky se otevírají u poslední karty v seznamu.
>
> *Oprava:* když má kotvu se stejným jménem víc prvků, vyhraje poslední v HTML. Každá dvojice potřebuje vlastní jméno — třeba přes custom property v atributu `style`: `<li style="--anchor: --card-7">` a v CSS `anchor-name: var(--anchor)` i `position-anchor: var(--anchor)`.

Druhá past se týká kotvy, která je sama absolutně pozicovaná — třeba tlačítko „⋯" přišpendlené do rohu karty:

:::live predict
```html
<article class="invoice">
  <span class="tip">Další akce</span>
  <button class="more" aria-label="Akce u faktury">⋯</button>
  <h3>Faktura 2026-091</h3>
  <p>Splatnost 30. 9. · 12 400 Kč</p>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: #f1f5f9; }

.invoice { position: relative; width: 18rem; padding: 1rem 1.25rem; border-radius: 1rem; background: white; }
.invoice h3 { margin: 0; font-size: 1rem; }
.invoice p { margin: 0.25rem 0 0; color: #64748b; }

.more {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  anchor-name: --more;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 0.5rem;
  background: #e2e8f0;
}

.tip {
  position: absolute;
  position-anchor: --more;
  position-area: bottom;
  margin-top: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  background: #0f172a;
  color: white;
  font-size: 0.75rem;
  white-space: nowrap;
}
```
--question-- Tooltip „Další akce" je absolutně pozicovaný a ukotvený k tlačítku „⋯". Kde bude?
--option-- Pod tlačítkem „⋯", jak říká `position-area: bottom`.
--option*-- V levém horním rohu karty, ukotvení se nepoužije.
--option-- Nad tlačítkem, protože je v HTML před ním.
--why-- Tlačítko i tooltip jsou absolutně pozicované ve stejném obsahujícím bloku (karta) a tlačítko je v HTML až **za** tooltipem. Takovou kotvu prohlížeč nepřijme: ukotvit se dá jen k prvku, jehož poloha je známá dřív než poloha ukotveného prvku. Ukotvení ignoruje a tooltip zůstane tam, kde by byl bez něj. Přesuň `<span class="tip">` v HTML za tlačítko a tooltip skočí pod něj. Kotva, která je v normálním toku, tuhle podmínku nemá.
--see-- css-pozicovani/top-layer-a-kotveni#typicke-chyby-a-pasti
:::

> [!PITFALL] Tooltip se neukotví
> *Příznak:* absolutně pozicovaný tooltip s `position-anchor` leží v rohu rodiče nebo na svém místě v toku, jako by ukotvení neexistovalo.
>
> *Oprava:* když je kotva sama absolutně pozicovaná a má stejný obsahující blok jako tooltip, musí být v HTML **před** ním. Přesuň tooltip za kotvu, nebo z něj udělej popover.

> [!PITFALL] Tooltip se nevejde pod ikonu v liště
> *Příznak:* tooltip s `position: absolute` a `position-area: bottom` u ikony v nízké přilepené liště nezačíná pod ikonou. Prohlížeč ho posune nahoru přes ikonu až ke spodní hraně lišty.
>
> *Oprava:* mřížka `position-area` sahá jen po okraje obsahujícího bloku ukotveného prvku a prohlížeč prvek z něj nepustí. U `absolute` je obsahujícím blokem nejbližší pozicovaný předek — tady lišta vysoká 3 rem. Dej tooltipu `position: fixed` (obsahujícím blokem je pak okno, pokud žádný předek nemá `transform`, `filter` nebo `backdrop-filter`), nebo z něj udělej popover.

:::compare
```html
<header class="bar">
  <strong>Editor</strong>
  <button class="bar__icon" aria-label="Uložit">⤓</button>
  <span class="tip" aria-hidden="true">Uložit změny</span>
</header>
<p class="text">Text dokumentu pod lištou…</p>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.bar { position: sticky; top: 0; display: flex; align-items: center; gap: 1rem; height: 3rem; padding-inline: 1rem; background: #0f172a; color: white; }
.bar__icon { anchor-name: --save; width: 2rem; height: 2rem; border: 0; border-radius: 0.5rem; background: #334155; }
.text { padding: 1rem; }

.tip {
  position-anchor: --save;
  position-area: bottom;
  margin-top: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  background: #f59e0b;
  color: #111827;
  font-size: 0.75rem;
  white-space: nowrap;
}
```
--variant-- position: absolute
```css
.tip { position: absolute; }
```
--variant-- position: fixed
```css
.tip { position: fixed; }
```
:::

S `absolute` tooltip přejede ikonu a zůstane v liště. S `fixed` leží pod ikonou přes text dokumentu. Zkus lište přidat `backdrop-filter: blur(8px)` a sleduj, co se stane s variantou `fixed`.

> [!PITFALL] Tlačítko s ikonou bez jména
> *Příznak:* tlačítko „⋯" nebo avatar otevírá nabídku, ale čtečka obrazovky přečte jen „tlačítko".
>
> *Oprava:* ikona sama jméno nedá. Přidej tlačítku `aria-label="Akce u faktury"` nebo text schovaný pro oči. Popover tlačítku přidá jen informaci „rozbaleno", jméno ne.

:::explain
Vysvětli vlastními slovy, proč nabídka s atributem `popover` není oříznutá kartou s `overflow: hidden` a nezajede pod sousední kartu, i když nemá žádný `z-index`.

## --model--
Otevřený popover se vykreslí v top layer, zvláštní vrstvě nad celou stránkou. V HTML je pořád uvnitř karty, ale jeho vykreslení se od karty odpojí: neplatí pro něj `overflow` předků, stacking contexty předků ani jejich `z-index`, a obsahujícím blokem je okno. Proto ho nic neořízne a nic nepřekryje. Kde přesně leží, pak určuje ukotvení k tlačítku.

## --checklist--
- Otevřený popover se vykresluje v top layer nad celou stránkou.
- Na `overflow` a stacking contexty předků se v top layer nehledí.
- `z-index` pro top layer nehraje roli.
- Polohu popoveru u tlačítka určuje ukotvení, ne pozice v HTML.
:::

:::check
Deset řádků tabulky má každý tlačítko `.row__more` s `anchor-name: --row-more` a vlastní popover s `position-anchor: --row-more`. U kterého řádku se otevře nabídka, když klikneš na „⋯" ve třetím řádku? Napiš číslo řádku.

### --expected--
10

### --accept--
desátého
desátý

### --why--
Deset prvků se stejným `anchor-name` znamená, že kotvou je poslední v HTML. Všechny nabídky se proto posadí k desátému řádku. Každý řádek potřebuje vlastní jméno kotvy.
:::

Příště postavíš horní lištu podcastové aplikace s nabídkou účtu, tooltipy u ikon a nabídkami u epizod — bez jediného řádku JavaScriptu.

## Kde to najdeš v MDN

- [Using the Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) — `auto` a `manual`, `popovertarget`, zavírání, vnořené popovery a přístupnost.
- [Using CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning/Using) — `anchor-name`, `position-anchor`, `position-area`, `anchor()` a `anchor-size()` s interaktivními ukázkami.
- [Fallback options and conditional hiding for overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning/Try_options_hiding) — `position-try-fallbacks`, `flip-block`, `flip-inline` a vlastní `@position-try`.
- [\<dialog\>: The Dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) — modální dialog, `::backdrop`, `commandfor` a `command`.

# --questions--

## --question--

Menu výběru jazyka je `<ul id="langs" popover>` a tlačítko má `popovertarget="langs"`. Kolega přidal do CSS `#langs { position: absolute; top: 100%; }`, aby menu bylo pod tlačítkem. Menu je po otevření u spodního okraje okna, kus pod ním, a ne u tlačítka. Proč?

### --answer--
Protože `top: 100%` se u popoveru počítá z výšky tlačítka.

#### --why--
Myslíš si, že popover má za obsahující blok tlačítko? Tlačítko s popoverem není ani rodič, ani kotva, dokud ho tak nepojmenuješ.

### --correct--
Protože otevřený popover je v top layer a jeho obsahujícím blokem je okno, ne tlačítko. Polohu u tlačítka zařídí ukotvení.

#### --why--
Popover v top layer nemá pozicovaného předka, podle kterého by se `absolute` měřilo, měří se od okna. `top: 100%` je proto celá výška okna a menu odjede k jeho spodnímu okraji. K tlačítku ho přiváže jen `anchor-name` a `position-anchor`.

### --answer--
Protože `position: absolute` na popoveru nefunguje vůbec.

#### --why--
Funguje, jen se měří od jiného obsahujícího bloku, než kolega čekal.

### --see--

css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

## --question--

Tooltip s `position-area: top` je u ikony v horní liště, těsně pod horním okrajem okna. Nad ikonu se nevejde. Napiš deklaraci, která ho v takovém případě posadí pod ikonu.

### --expected--

position-try-fallbacks: flip-block

### --accept--

position-try-fallbacks: bottom
position-try: flip-block

### --why--

`flip-block` přehodí polohu ve svislém směru, `top` se změní na `bottom`. Prohlížeč záložní polohu použije, jen když se tooltip do původní nevejde.

### --see--

css-pozicovani/top-layer-a-kotveni#zalozni-polohy-position-try-fallbacks

## --question--

Kotva je 120 × 40 px s levým horním rohem na 200 × 100 px. Nabídka široká 160 px má `position-area: bottom span-left` a `margin: 0`. Na jaké vodorovné souřadnici (v px) bude **pravá** hrana nabídky?

### --expected--

320

### --accept--

320 px
320px

### --why--

`span-left` začne ve středním sloupci mřížky a pokračuje doleva, takže nabídka je zarovnaná k pravé hraně kotvy: 200 + 120 = 320 px. Levá hrana bude na 160 px.

### --see--

css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

## --question--

Najdi v MDN na stránce vlastnosti `position-try-fallbacks`, jak se jmenuje at-pravidlo, kterým si definuješ vlastní pojmenovanou záložní polohu (třeba s jiným okrajem). Napiš ho i se zavináčem.

### --expected--

@position-try

### --why--

`@position-try --nazev { … }` definuje vlastní záložní polohu s vlastním `position-area`, okraji nebo rozměry. Na jméno se pak odkážeš v `position-try-fallbacks: --nazev`.

### --see--

css-pozicovani/top-layer-a-kotveni#zalozni-polohy-position-try-fallbacks
