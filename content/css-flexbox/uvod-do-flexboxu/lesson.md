# Úvod do flexboxu

## Problém: prvky vedle sebe

Blokové prvky (`div`, `p`, `nav`, `li`, `section`…) se v normálním toku stránky řadí **pod sebe** a každý si zabere celou šířku rodiče. Pro text je to přesně to, co chceš. Jenže většina rozhraní potřebuje prvky **vedle sebe**: logo a navigaci v hlavičce, ikonu a text v tlačítku, cenu a tlačítko „Koupit" v kartě.

Dřív se to řešilo `float`, `display: inline-block` nebo `position: absolute`. Každé z toho mělo háček: plovoucí prvky „vypadávaly" z rodiče, mezi `inline-block` prvky se vkrádaly mezery podle mezer v HTML a svislé vycentrování bylo kapitola sama pro sebe.

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

Zkus do pravidla `.bar` přidat `display: flex;` a sleduj, co se stane s nadpisem, počtem i tlačítkem.

## Flex kontejner a flex položky

Flexbox má dvě role:

- **flex kontejner** (*flex container*) — prvek, kterému dáš `display: flex`,
- **flex položky** (*flex items*) — jeho **přímí potomci**.

Rozvržení nastavuješ skoro vždycky na kontejneru. Položky se ve výchozím stavu postaví do řádku, a to bez ohledu na to, jestli byly blokové, nebo řádkové — `display: block` na `.bar__title` v ukázce výše po přepnutí na flex nic nezmění.

Důležité slovo je **přímí**. Vnoučata kontejneru se flexboxem neřídí:

:::live
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
:::

Položky „Boty" a „Batohy" jsou pod sebou, protože `.submenu` flex kontejner není. Zkus mu přidat `display: flex; gap: 1rem;`. Jeden prvek tak může být položkou svého rodiče a zároveň kontejnerem pro své děti.

## Hlavní a vedlejší osa

Flexbox neuvažuje ve „vodorovně" a „svisle", ale ve dvou osách:

- **hlavní osa** (*main axis*) — směr, ve kterém se položky řadí za sebou,
- **vedlejší osa** (*cross axis*) — kolmo na hlavní osu.

Směr hlavní osy určuje vlastnost `flex-direction` na kontejneru:

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
  flex-direction: row;
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
:::

Zkus změnit `flex-direction` na `column`, pak na `row-reverse`. Sleduj, že v `column` jsou krabičky přes celou šířku — k tomu, proč, se dostaneš za chvíli u `align-items`.

## `justify-content`: volné místo na hlavní ose

Když položky nevyplní celou hlavní osu, zbude **volné místo**. Kam ho dát, určuje `justify-content` na kontejneru:

- `flex-start` (výchozí) — položky na začátku, volné místo za nimi,
- `flex-end` — položky na konci,
- `center` — položky uprostřed, volné místo napůl před a za nimi,
- `space-between` — krajní položky u okrajů, volné místo rovným dílem mezi položkami,
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
  justify-content: space-between;
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
:::

Vyzkoušej postupně všechny hodnoty `justify-content`. Pak kontejneru přidej `flex-direction: column; height: 20rem;` — `justify-content` teď rozděluje místo **svisle**, protože hlavní osa vede shora dolů.

## `align-items`: zarovnání na vedlejší ose

`align-items` zarovnává položky na vedlejší ose, v řádku tedy svisle:

- `stretch` (výchozí) — roztáhne položky přes celou vedlejší osu,
- `flex-start`, `center`, `flex-end` — začátek, střed, konec,
- `baseline` — srovná položky podle účaří prvního řádku textu.

Výchozí `stretch` je důvod, proč jsou v řádku všechny položky stejně vysoké a ve sloupci stejně široké. Často je to užitečné (karty v řádku mají stejnou výšku), někdy překvapí (malý štítek se roztáhne do pruhu).

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
  align-items: stretch;
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
:::

Zkus `align-items` přepnout na `flex-start`, `center` a `baseline`. U `baseline` sleduj, jak se srovnají spodní hrany písmen u malého i velkého textu.

Jedna položka může zarovnání přepsat vlastností `align-self` — přidej `.box--tall { align-self: flex-end; }` a zbytek řádku zůstane, jak je.

## `gap`: mezery mezi položkami

`gap` na kontejneru vloží mezeru **jen mezi** položky, ne na kraje. Když se položky zalamují do více řádků, platí i mezi řádky. Dvě hodnoty znamenají nejdřív mezeru mezi řádky, pak mezi sloupci: `gap: 0.5rem 1rem`.

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
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 16rem;
  padding: 0;
  list-style: none;
}

.tags li {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #fde68a;
}
```
:::

Zkus změnit `gap` na `1rem 0.25rem`. Vlastnost `flex-wrap: wrap` dovoluje položkám přejít na další řádek — podrobně ji použiješ ve workshopu.

Proč ne `margin`? Margin má každá položka i na kraji, takže se pak musí prvnímu nebo poslednímu prvku zase odebírat. S `gap` je mezera nastavená na jednom místě a o krajích nemusíš přemýšlet.

## Typické chyby a pasti

**`display: flex` na špatném prvku.** Chceš-li mít vedle sebe odkazy v `<ul>`, flex patří na `<ul>`, ne na `<li>` ani na `<a>`. Flex vždycky dostává **rodič** prvků, které rozvrhuješ.

**Svislé centrování, které „nefunguje".** `align-items: center` centruje v rámci výšky kontejneru. Když kontejner nemá žádnou výšku navíc (je vysoký přesně jako obsah), není kam centrovat a nic se nestane. Stejně tak `justify-content` ve sloupci potřebuje kontejner vyšší než obsah.

**Prohozené osy po `flex-direction: column`.** Ve sloupci centruješ vodorovně přes `align-items`, ne přes `justify-content`. Když si nejsi jistý, zeptej se: „Kudy teď vede hlavní osa?"

**Obrázek natažený do výšky.** Většina webů má ve stylech `img { height: auto; }`, aby obrázky držely poměr stran. Jenže výška `auto` znamená pro flexbox „tuhle položku smím roztáhnout" — a výchozí `align-items: stretch` ji roztáhne na výšku řádku, takže se obrázek zdeformuje. Řešení je `align-items: flex-start` (nebo `center`) na kontejneru, případně `align-self` na obrázku.

:::live
```html
<article class="review">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23f97316'/%3E%3C/svg%3E" width="64" height="64" alt="">
  <p>Recenze s delším textem, který se zalomí do několika řádků. Obrázek vedle se kvůli výchozímu stretch natáhne do výšky celého odstavce a z kolečka je vajíčko.</p>
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
:::

Přidej do `.review` `align-items: flex-start;` a kolečko se vrátí do správného tvaru.

**Mezery marginem místo `gap`.** Funguje to, ale kód je delší a na krajích se mezery sčítají s paddingem rodiče. Používej `gap`.

# --questions--

## --question--

V HTML je `<header class="top"><a class="logo">…</a><nav><a>Domů</a><a>Blog</a></nav></header>` a v CSS jen `.top { display: flex; }`. Odkazy „Domů" a „Blog" ale nejsou položkami, které by rozvrhoval flexbox hlavičky. Proč?

### --answer--

Protože odkazy jsou řádkové prvky a flexbox umí rozvrhovat jen blokové.

#### --why--

Flexbox rozvrhuje blokové i řádkové prvky stejně — z každého přímého potomka udělá flex položku.

### --correct--

Protože nejsou přímými potomky `.top`; jejich rodičem je `<nav>`, který flex kontejner není.

#### --why--

`display: flex` působí jen na přímé potomky. Položkami hlavičky jsou `.logo` a `<nav>`. Chceš-li rozvrhovat odkazy, musí flex dostat `<nav>`.

### --answer--

Protože chybí `flex-direction: row`.

#### --why--

`row` je výchozí hodnota, psát ji nemusíš. Na tom, které prvky jsou položkami, se nic nemění.

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

## --question--

V řádku jsou tři karty s různě dlouhým textem a kontejner má jen `display: flex; gap: 1rem;`. Jak budou karty vysoké?

### --correct--

Všechny stejně vysoké jako nejvyšší karta.

#### --why--

Výchozí `align-items: stretch` roztáhne položky přes celou vedlejší osu — v řádku do výšky, kterou určuje nejvyšší položka.

### --answer--

Každá tak vysoká, jak potřebuje její text.

#### --why--

Tak by to bylo s `align-items: flex-start` nebo `center`. Výchozí hodnota je ale `stretch`.

### --answer--

Nejnižší karta určí výšku a delší text přeteče.

#### --why--

Flexbox položky do výšky roztahuje, nezkracuje. Kontejner bez nastavené výšky je vysoký podle nejvyšší položky.

## --question--

Proč je na mezery mezi flex položkami lepší `gap` než `margin-right` na každé položce?

### --answer--

`margin` ve flex kontejneru nefunguje.

#### --why--

Margin na flex položkách funguje normálně (a `margin: auto` má dokonce speciální chování). Důvod je jinde.

### --correct--

`gap` dělá mezeru jen mezi položkami, takže poslední položka nemá přebytečný okraj a mezera je nastavená na jednom místě.

#### --why--

S marginem má okraj i poslední položka a musí se jí odebírat (`:last-child`), při zalomení do řádků je to ještě složitější. `gap` platí jen mezi položkami, i mezi řádky.

### --answer--

`gap` je rychlejší na vykreslení.

#### --why--

Rozdíl ve výkonu tu nehraje roli. Výhoda `gap` je v jednoduchosti a v tom, že neřeší kraje.
