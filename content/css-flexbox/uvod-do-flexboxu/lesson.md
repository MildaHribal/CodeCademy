# Úvod do flexboxu

Než začneš číst, zkus odhadnout dvě odpovědi. Nikdo je nehodnotí — jde o to, abys pak ve výkladu věděl, co hledáš.

:::check pretest
Prvek má `display: flex` a uvnitř jsou tři odstavce `<p>`. Co se s odstavci stane?

### --answer--
Nic. `display: flex` působí jen na řádkové prvky jako `<span>` nebo `<a>`, odstavce zůstanou pod sebou.

#### --why--
Flexbox rozvrhuje blokové i řádkové prvky úplně stejně. Rozhoduje jen to, jestli jsou přímými potomky flex kontejneru.

### --correct--
Postaví se vedle sebe do jednoho řádku.

#### --why--
Přímí potomci flex kontejneru se ve výchozím stavu řadí za sebe na hlavní ose, a ta vede zleva doprava.

### --answer--
Každý se roztáhne přes celou šířku a zalomí se pod předchozí.

#### --why--
Tak se odstavce chovají bez flexboxu, v normálním toku stránky. `display: flex` to mění.
:::

:::check pretest
Kontejner je široký 500 px a jsou v něm tři položky, každá široká 100 px. Kolik pixelů zůstane v řádku nevyužitých?

### --expected--
200

### --accept--
200 px
200px

### --why--
500 − 3 × 100 = 200 px. Tomuhle zbytku se ve flexboxu říká volné místo a velká část lekce je o tom, kam ho dát.
:::

## Problém: prvky vedle sebe

Blokové prvky (`div`, `p`, `nav`, `li`, `section`…) se v normálním toku stránky řadí ==pod sebe== a každý si zabere celou šířku rodiče. Pro text je to přesně to, co chceš. Jenže většina rozhraní potřebuje prvky ==vedle sebe==: logo a navigaci v hlavičce, ikonu a text v tlačítku, cenu a tlačítko „Koupit" v kartě.

Dřív se to řešilo přes `float`, `display: inline-block` nebo `position: absolute`. Každé z toho mělo háček: plovoucí prvky „vypadávaly" z rodiče, mezi `inline-block` prvky se vkrádaly mezery podle mezer v HTML a svislé vycentrování bylo kapitola sama pro sebe.

Tady je typická lišta bez flexboxu. Tři prvky, každý na jiném řádku:

:::live
```html
<div class="bar">
  <strong class="bar__title">Moje úkoly</strong>
  <span class="bar__count">12 otevřených</span>
  <button>Nový úkol</button>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.bar {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: #f8fafc;
}

.bar__title { display: block; }
.bar__count { display: block; color: #64748b; }
```
:::

Zkus do pravidla `.bar` přidat `display: flex;` a sleduj, co se stane s nadpisem, počtem i tlačítkem. Pak ještě přidej `gap: 1rem;` a `align-items: center;` — k oběma se za chvíli dostaneš.

> [!REMEMBER]
> **Flex kontejner rozvrhuje své přímé potomky za sebou podél jedné osy a rozhoduje, co s místem, které po nich zbude.** Všechno ostatní ve flexboxu jsou jen podrobnosti téhle věty.

:::check
Uvnitř `<div class="actions">` jsou tři tlačítka a ty je chceš mít vedle sebe. Napiš selektor pravidla, do kterého patří `display: flex`.

### --expected--
.actions

### --accept--
div.actions

### --why--
`display: flex` dostává vždycky **rodič** prvků, které chceš rozvrhnout — tady `.actions`. Tlačítka samotná flex nepotřebují.
:::

## Flex kontejner a flex položky

[[flexbox|Flexbox]] má dvě role:

- [[flex kontejner]] (*flex container*) — prvek, kterému dáš `display: flex`,
- [[flex položka|flex položky]] (*flex items*) — jeho **přímí potomci**.

Rozvržení nastavuješ skoro vždycky na kontejneru. Položky se ve výchozím stavu postaví do řádku, a to bez ohledu na to, jestli byly blokové, nebo řádkové — `display: block` na `.bar__title` v ukázce výše po přepnutí na flex nic nezmění.

Důležité slovo je **přímí**. Než otevřeš náhled, tipni si:

:::live predict
```html
<ul class="menu">
  <li>Domů</li>
  <li>
    Produkty
    <ul class="submenu">
      <li>Boty</li>
      <li>Batohy</li>
    </ul>
  </li>
  <li>Kontakt</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.menu {
  display: flex;
  gap: 2rem;
  padding: 0;
  list-style: none;
}

.submenu {
  padding-left: 1rem;
  color: #64748b;
}
```
--question-- Budou položky „Boty" a „Batohy" vedle sebe, nebo pod sebou?
--option-- Vedle sebe, protože celé menu je uvnitř flex kontejneru.
--option*-- Pod sebou, protože `.submenu` flex kontejner není.
--option-- Vedle sebe, ale bez mezery, protože `gap` se na vnořený seznam nedědí.
--why-- `display: flex` na `.menu` dělá flex položky jen ze tří `<li>`, které v něm leží přímo. „Boty" a „Batohy" jsou až vnoučata a řídí se normálním tokem v `.submenu`. Zkus teď `.submenu` přidat `display: flex; gap: 1rem;` — jeden prvek může být položkou svého rodiče a zároveň kontejnerem pro své děti.
--see-- css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky
:::

:::check
V HTML je `<header><a class="logo">Zrno</a><nav><a>Káva</a><a>Kavárny</a><a>O nás</a></nav></header>` a v CSS jen `header { display: flex; }`. Kolik flex položek má `header`?

### --expected--
2

### --accept--
dvě

### --why--
Přímí potomci `header` jsou jen `.logo` a `<nav>`. Tři odkazy leží v `<nav>`, takže jsou pro hlavičku neviditelné. Aby stály vedle sebe, musí `display: flex` dostat i `<nav>`.
:::

## Hlavní a vedlejší osa

Flexbox neuvažuje ve „vodorovně" a „svisle", ale ve dvou osách:

- [[hlavní osa]] (*main axis*) — směr, ve kterém se položky řadí za sebou,
- [[vedlejší osa]] (*cross axis*) — kolmo na hlavní osu.

Směr hlavní osy určuje vlastnost [[flex-direction]] na kontejneru:

| `flex-direction` | hlavní osa vede | vedlejší osa vede |
|---|---|---|
| `row` (výchozí) | zleva doprava | shora dolů |
| `column` | shora dolů | zleva doprava |
| `row-reverse`, `column-reverse` | opačným směrem | beze změny |

Proč to celé stojí za to? Protože každá další vlastnost patří k jedné z os. Když osy otočíš, otočí se i to, co vlastnosti dělají — a ty si nemusíš pamatovat dvě sady pravidel.

:::live
```html
<div class="stack">
  <div class="box">1</div>
  <div class="box">2</div>
  <div class="box">3</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.stack {
  display: flex;
  flex-direction: var(--direction);
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px dashed #94a3b8;
}

.box {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  background: #6366f1;
  color: white;
  font-weight: 700;
}
```
```controls
--direction: select(row, column, row-reverse, column-reverse) = row | flex-direction
```
:::

Přepni `flex-direction` na `column` a sleduj šířku krabiček: najednou jsou přes celou šířku. Proč, zjistíš za chvíli u `align-items`. U `row-reverse` si všimni, že krabička 1 je vpravo — obrátil se jen směr hlavní osy.

:::check
Kontejner má `flex-direction: column`. Kterým směrem vede jeho vedlejší osa?

### --answer--
Shora dolů.

#### --why--
Shora dolů vede ve sloupci **hlavní** osa — po ní se položky řadí za sebou. Vedlejší osa je vždycky kolmo na hlavní.

### --correct--
Zleva doprava.

#### --why--
`column` otočí hlavní osu shora dolů, vedlejší osa je na ni kolmá, tedy vodorovná.

### --answer--
Ve sloupci žádnou vedlejší osu nemá, ta existuje jen v řádku.

#### --why--
Flex kontejner má vždycky obě osy. Mění se jen to, kterým směrem vedou.
:::

## `justify-content`: volné místo na hlavní ose

Když položky nevyplní celou hlavní osu, zbude [[volné místo]] (*free space*). Kam ho dát, určuje [[justify-content]] na kontejneru:

- `flex-start` (výchozí) — položky na začátku, volné místo za nimi,
- `flex-end` — položky na konci,
- `center` — položky uprostřed, volné místo napůl před a za nimi,
- `space-between` — krajní položky u okrajů, volné místo rovným dílem **mezi** položkami,
- `space-around` a `space-evenly` — volné místo mezi položkami i na krajích.

:::live
```html
<div class="row">
  <div class="box">A</div>
  <div class="box">B</div>
  <div class="box">C</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.row {
  display: flex;
  justify-content: var(--justify);
  padding: 0.5rem;
  border: 2px dashed #94a3b8;
}

.box {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  background: #0ea5e9;
  color: white;
  font-weight: 700;
}
```
```controls
--justify: select(flex-start, flex-end, center, space-between, space-around, space-evenly) = space-between | justify-content
```
:::

Projdi všechny hodnoty a u každé si řekni, kam šlo volné místo. Pak do `.row` v kódu dopiš `flex-direction: column; height: 20rem;` — `justify-content` teď rozděluje místo **svisle**, protože hlavní osa vede shora dolů.

:::check
Kontejner je široký 600 px (bez paddingu a bez `gap`), obsahuje tři položky po 100 px a má `justify-content: space-between`. Kolik pixelů je mezi první a druhou položkou?

### --expected--
150

### --accept--
150 px
150px

### --why--
Volné místo je 600 − 300 = 300 px. `space-between` ho dá jen **mezi** položky: mezery jsou dvě, každá 150 px. Na krajích nezůstane nic.
:::

## `align-items`: zarovnání na vedlejší ose

[[align-items]] zarovnává položky na vedlejší ose, v řádku tedy svisle:

- `stretch` (výchozí) — roztáhne položky přes celou vedlejší osu,
- `flex-start`, `center`, `flex-end` — začátek, střed, konec,
- `baseline` — srovná položky podle účaří prvního řádku textu.

> [!REMEMBER]
> **Výchozí `stretch` roztahuje každou položku, která nemá pevnou velikost na vedlejší ose.** Proto jsou v řádku všechny položky stejně vysoké a ve sloupci stejně široké.

Často je to užitečné (karty v řádku mají stejnou výšku), někdy překvapí (malý štítek se roztáhne do pruhu).

:::live
```html
<div class="row">
  <div class="box">Krátký</div>
  <div class="box box--tall">Vysoký<br>na<br>tři řádky</div>
  <div class="box box--big">Velké písmo</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.row {
  display: flex;
  align-items: var(--align);
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px dashed #94a3b8;
}

.box {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #10b981;
  color: white;
}

.box--big {
  font-size: 1.75rem;
}
```
```controls
--align: select(stretch, flex-start, center, flex-end, baseline) = stretch | align-items
```
:::

Přepni na `flex-start`, `center` a `baseline`. U `baseline` sleduj, jak se srovnají spodní hrany písmen u malého i velkého textu. Jedna položka může zarovnání přepsat vlastností [[align-self]] — dopiš do kódu `.box--tall { align-self: flex-end; }` a zbytek řádku zůstane, jak je.

:::check
Kontejner v řádku je vysoký 100 px a má `align-items: center`. Položka v něm je vysoká 40 px. Kolik pixelů bude od horního okraje kontejneru k horní hraně položky?

### --expected--
30

### --accept--
30 px
30px

### --why--
Volné místo na vedlejší ose je 100 − 40 = 60 px a `center` ho rozdělí napůl: 30 px nad položku, 30 px pod ni.
:::

## Zalamování: `flex-wrap`, `gap` a `align-content`

Flex kontejner ve výchozím stavu drží všechny položky **na jednom řádku** (`flex-wrap: nowrap`). Když se nevejdou, zmenší je, a když to nestačí, položky přetečou. [[flex-wrap]] s hodnotou `wrap` dovolí položce, která se nevejde, přejít na další řádek.

[[gap]] vloží mezeru **jen mezi** položky, ne na kraje — i mezi řádky. Dvě hodnoty znamenají nejdřív mezeru mezi řádky, pak mezi sloupci: `gap: 0.5rem 1rem`. Proč ne `margin`? Margin má každá položka i na kraji, takže se pak musí poslední položce zase odebírat. S `gap` je mezera nastavená na jednom místě.

Když je [[řádek flexboxu|řádků]] víc a kontejner je vyšší než ony, rozhoduje o volném místě **mezi řádky** [[align-content]] — funguje jako `justify-content`, jen na vedlejší ose a pro celé řádky. U jediného řádku nedělá nic.

:::live
```html
<ul class="tags">
  <li>JavaScript</li>
  <li>CSS</li>
  <li>Přístupnost</li>
  <li>Výkon</li>
  <li>Typografie</li>
  <li>Formuláře</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.tags {
  display: flex;
  flex-wrap: var(--wrap);
  gap: var(--gap);
  align-content: var(--lines);
  width: 16rem;
  height: 10rem;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.tags li {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #fde68a;
}
```
```controls
--wrap: toggle(nowrap, wrap) = wrap | flex-wrap
--gap: range(0, 1.5, 0.25, rem) = 0.5 | gap
--lines: select(flex-start, center, space-between, flex-end) = flex-start | align-content
```
:::

Přepni `flex-wrap` na `nowrap` a sleduj, jak se štítky nejdřív smrsknou a pak vylezou z čárkovaného rámečku. Pak zpátky na `wrap` a zkus `align-content: space-between` — řádky se rozjedou k horní a dolní hraně.

:::check
V jednom řádku je pět položek a kontejner má `gap: 10px`. Kolik pixelů mezer `gap` vloží celkem?

### --expected--
40

### --accept--
40 px
40px

### --why--
Mezi pěti položkami jsou čtyři mezery: 4 × 10 = 40 px. Před první a za poslední položku `gap` nic nedává.
:::

## Automatický margin: jedna položka stranou

`justify-content` umí volné místo rozdělit jen podle jednoho pravidla pro všechny položky. Často ale chceš něco jiného: logo a navigaci vlevo a **jen** tlačítko vpravo.

Na to je [[automatický margin]]: když má flex položka margin nastavený na `auto`, sežere na té straně **všechno** volné místo v řádku. Obě varianty níž mají stejné HTML i CSS, liší se jedinou deklarací:

:::compare
```html
<header class="top">
  <strong>Zrno</strong>
  <a href="#">Káva</a>
  <a href="#">Kavárny</a>
  <button class="top__order">Objednat</button>
</header>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.top {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border: 2px dashed #94a3b8;
}
```
--variant-- justify-content: space-between
```css
.top { justify-content: space-between; }
```
--variant-- margin-inline-start: auto
```css
.top__order { margin-inline-start: auto; }
```
:::

S `space-between` se volné místo rozdělí mezi všechny čtyři položky a odkazy „ujedou" od loga. S automatickým marginem na tlačítku jde celé volné místo před tlačítko a zbytek zůstane u sebe. `margin-inline-start` je [[logická vlastnost]]: okraj na začátku řádku textu, v češtině tedy vlevo.

:::check
V liště s `display: flex` jsou položky A, B, C a D v tomhle pořadí. A a B mají zůstat vlevo, C a D mají být u pravého okraje. Které položce dáš `margin-inline-start: auto`? Napiš její písmeno.

### --expected-- ignore-case
C

### --why--
Automatický margin vloží všechno volné místo **před** položku C. C se tím odtlačí doprava a D za ní jde s ní. Dát ho D by nechalo C vlevo.
:::

## Typické chyby a pasti

> [!PITFALL] Flex na špatném prvku
> *Příznak:* dáš `display: flex` na `<li>` nebo `<a>` a odkazy v menu jsou pořád pod sebou.
>
> *Oprava:* flex patří na **rodiče** prvků, které rozvrhuješ — na `<ul>`, ve kterém `<li>` přímo leží.

> [!PITFALL] Centrování, které „nefunguje"
> *Příznak:* `align-items: center` (nebo `justify-content: center` ve sloupci) neudělá nic, položky zůstanou nahoře.
>
> *Oprava:* kontejner je vysoký přesně jako obsah, takže není kam centrovat. Dej mu výšku, třeba `min-height: 100vh`.

> [!PITFALL] Prohozené osy po `flex-direction: column`
> *Příznak:* ve sloupci napíšeš `justify-content: center`, abys položky vycentroval vodorovně, a ony skočí doprostřed **svisle**.
>
> *Oprava:* ve sloupci vede hlavní osa shora dolů, vodorovně centruje `align-items`. Když si nejsi jistý, zeptej se: „Kudy teď vede hlavní osa?"

:::explain
Vysvětli vlastními slovy, proč po přepnutí kontejneru na `flex-direction: column` centruješ vodorovně přes `align-items`, a ne přes `justify-content`.

## --model--
`justify-content` pracuje vždycky na hlavní ose a `align-items` na vedlejší. `flex-direction: column` otočí hlavní osu shora dolů, takže vedlejší osa je vodorovná. Vodorovné zarovnání je proto ve sloupci práce pro `align-items`, zatímco `justify-content` teď posouvá položky svisle.

## --checklist--
- `justify-content` patří k hlavní ose, `align-items` k vedlejší.
- `flex-direction: column` otočí hlavní osu shora dolů.
- Vedlejší osa je vždycky kolmo na hlavní, ve sloupci tedy vodorovná.
:::

Poslední past se týká obrázků. Než odkryješ náhled, tipni si, jak bude vypadat kulatý avatar vedle dlouhého textu:

:::live predict
```html
<article class="review">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23f97316'/%3E%3C/svg%3E" width="64" height="64" alt="">
  <p>Recenze s delším textem, který se zalomí do několika řádků. Káva dorazila druhý den, balení bylo pěkné a chuť přesně podle popisu.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

/* Běžný začátek stylů: obrázek nikdy nepřeteče a drží poměr stran. */
img {
  max-width: 100%;
  height: auto;
}

.review {
  display: flex;
  gap: 1rem;
  max-width: 24rem;
}

.review p {
  margin: 0;
}
```
--question-- Jak bude vypadat kulatý obrázek o velikosti 64 × 64 px?
--option-- Kulatý, 64 × 64 px, zarovnaný k hornímu okraji odstavce.
--option*-- Natažený do výšky celého odstavce, z kolečka bude vajíčko.
--option-- Zmenšený pod 64 px, protože odstavec potřebuje místo.
--why-- `height: auto` říká flexboxu „tuhle položku smím roztáhnout" a výchozí `align-items: stretch` ji roztáhne na výšku řádku, tedy na výšku odstavce. Šířku drží atribut `width`, takže se obrázek zdeformuje. Přidej do `.review` `align-items: flex-start;` a kolečko se vrátí do tvaru.
--see-- css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose
:::

> [!PITFALL] Obrázek natažený do výšky
> *Příznak:* avatar nebo ikona vedle víceřádkového textu je vysoká jako celý text a zdeformovaná.
>
> *Oprava:* `align-items: flex-start` (nebo `center`) na kontejneru, případně `align-self: flex-start` jen na obrázku.

> [!PITFALL] `order` mění jen to, co je vidět
> *Příznak:* na mobilu přesuneš tlačítko vlastností `order` nahoru, ale klávesa Tab a čtečka obrazovky na něj narazí až na konci a fokus skáče po stránce.
>
> *Oprava:* [[order]] jen na drobné přeskupení, u kterého pořadí nemění smysl. Když se má pořadí změnit doopravdy, přesuň prvek v HTML.

:::check
Kontejner má `display: flex; flex-direction: column; height: 300px;`. Napiš deklaraci, která jeho položky vycentruje **vodorovně**.

### --expected--
align-items: center

### --why--
Ve sloupci je vedlejší osa vodorovná a zarovnání na vedlejší ose řídí `align-items`. `justify-content: center` by položky posunul svisle doprostřed.
:::

## Kde to najdeš v MDN

- [Basic concepts of flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox) — osy, kontejner a položky; stejný výklad anglicky, s obrázky os.
- [Aligning items in a flex container](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Aligning_items_in_a_flex_container) — všechny hodnoty `justify-content`, `align-items`, `align-content` a automatické marginy.
- [Mastering wrapping of flex items](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Mastering_wrapping_of_flex_items) — co se děje při `flex-wrap: wrap` a proč řádky nejsou sloupce.
- [Ordering flex items](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Ordering_flex_items) — `order`, `row-reverse` a proč na pořadí v HTML záleží kvůli přístupnosti.

# --questions--

## --question--

Seznam `<ul class="tags">` má `display: flex` a štítků je tolik, že vylézají z pravého okraje stránky. Co chybí?

### --answer--

`gap`, protože bez mezer se položky nemůžou rozložit.

#### --why--

`gap` jen přidává mezery mezi položky. Míň místa tím nevznikne, spíš naopak.

### --correct--

`flex-wrap: wrap` na seznamu.

#### --why--

Ve výchozím stavu `nowrap` drží flex kontejner všechno v jednom řádku, i kdyby položky měly přetéct. `wrap` je nechá přejít na další řádek.

### --answer--

`justify-content: space-between`, aby se štítky rozprostřely.

#### --why--

`justify-content` rozděluje **volné** místo. Když štítky přetékají, žádné volné místo není a `justify-content` nemá co dělat.

### --see--

css-flexbox/uvod-do-flexboxu#zalamovani-flex-wrap-gap-a-align-content

## --question--

Kontejner v řádku je široký 800 px (bez paddingu), má `justify-content: center` a `gap: 40px`. Jsou v něm dvě položky po 200 px. Kolik pixelů je od levého okraje kontejneru k první položce?

### --expected--

180

### --accept--

180 px
180px

### --why--

Položky i mezera zaberou 200 + 40 + 200 = 440 px, volné místo je 800 − 440 = 360 px. `center` ho rozdělí napůl, před první položku tedy připadne 180 px.

### --see--

css-flexbox/uvod-do-flexboxu#justify-content-volne-misto-na-hlavni-ose

## --question--

Kontejner má `display: flex; flex-direction: column; height: 300px;`. Chceš jeho položky dostat **svisle doprostřed**. Která vlastnost to udělá?

### --answer--

`align-items: center`

#### --why--

Ve sloupci je vedlejší osa vodorovná, takže `align-items: center` by položky vycentrovalo vodorovně.

### --correct--

`justify-content: center`

#### --why--

`flex-direction: column` otočí hlavní osu shora dolů. Volné místo na hlavní ose rozděluje `justify-content`, takže `center` položky posune svisle doprostřed.

### --answer--

`vertical-align: middle`

#### --why--

`vertical-align` platí pro řádkové prvky a buňky tabulek, na flex položky nemá vliv.

### --see--

css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

## --question--

Lišta aplikace má v tomhle pořadí položky Logo, Hledat, Profil a Odhlásit. Logo a Hledat mají zůstat vlevo, Profil a Odhlásit mají být u pravého okraje. Napiš deklaraci, kterou dáš položce Profil.

### --expected--

margin-inline-start: auto

### --accept--

margin-left: auto

### --why--

Automatický margin před Profilem sežere všechno volné místo v řádku, takže Profil i Odhlásit za ním se odtlačí doprava. `margin-left: auto` funguje v češtině stejně, `margin-inline-start` se navíc sám otočí u jazyků psaných zprava doleva.

### --see--

css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou
