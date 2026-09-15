# Úvod do gridu

Mřížku produktů v e-shopu, kostru webové aplikace s bočním panelem nebo dashboard s dlaždicemi dnes skoro každý web staví přes CSS Grid. Než začneš číst, tipni si dvě odpovědi — pomůžou ti ve výkladu poznat, co hledáš.

:::check pretest
Kontejner je široký 700 px a má `display: grid; grid-template-columns: 200px 1fr 1fr;` bez mezer. Odhadni, jak široký bude druhý sloupec.

### --expected--
250

### --accept--
250 px
250px

### --why--
Pevný sloupec si vezme 200 px, zbylých 500 px se rozdělí na dva stejné díly. Jednotka `fr` je právě „díl zbylého místa" a první část lekce ukáže, jak se počítá i s mezerami.
:::

:::check pretest
Mřížka má nastavené jen tři sloupce a nic o řádcích. Položek je devět. Co se stane?

### --answer--
Vejdou se jen první tři, zbytek přeteče doprava.

#### --why--
Grid položky za třetím sloupcem nepřidává další sloupce. Co s nimi udělá, ukáže část o explicitní a implicitní mřížce.

### --correct--
Prohlížeč sám přidá další řádky a položky do nich poskládá.

#### --why--
Řádky, které jsi nevypsal, grid vytvoří automaticky. Jak vysoké budou a jak je ovlivníš, ukáže část o explicitní a implicitní mřížce.

### --answer--
Nic se nezobrazí, dokud nenastavíš i `grid-template-rows`.

#### --why--
Grid bez vypsaných řádků funguje, řádky jsou nepovinné. Jak vznikají, ukáže část o explicitní a implicitní mřížce.
:::

## Problém: řádky i sloupce najednou

Flexbox řadí položky v jedné ose. Když se zalomí do více řádků, **každý řádek si počítá místo sám** a o řádcích nad sebou nic neví. Pro hlavičku nebo štítky je to přesně správně. Jenže formulář, ceník nebo mřížka produktů potřebují, aby věci v různých řádcích stály ==pod sebou== ve sloupcích.

Obě varianty níž mají stejné HTML formuláře bez obalovacích prvků. Liší se jen tím, jestli je formulář flex, nebo grid kontejner:

:::compare
```html
<form class="form">
  <label for="name">Jméno</label>
  <input id="name" value="Tereza Nováková">
  <label for="email">E-mailová adresa</label>
  <input id="email" value="tereza@example.cz">
  <label for="phone">Telefon</label>
  <input id="phone" value="+420 777 123 456">
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.form {
  gap: 0.75rem 1rem;
  align-items: center;
  max-width: 26rem;
  padding: 1rem;
  border: 2px dashed #94a3b8;
}

input {
  min-width: 0;
  padding: 0.375rem 0.5rem;
  font: inherit;
}
```
--variant-- Flexbox se zalamováním
```css
.form { display: flex; flex-wrap: wrap; }
input { flex: 1 1 60%; }
```
--variant-- Grid se dvěma sloupci
```css
.form { display: grid; grid-template-columns: auto 1fr; }
```
:::

Ve flexboxu začíná každé pole jinde — hned za svým popiskem, protože každý řádek rozděluje místo zvlášť. V gridu tvoří popisky jeden sloupec, pole druhý a všechna pole začínají na stejné svislé čáře. Zkus ve společném CSS zúžit formulář na `max-width: 18rem` a sleduj, že v gridu zůstanou pole srovnaná i na malém místě.

> [!REMEMBER]
> **Grid kontejner nejdřív narýsuje mřížku z řádků a sloupců a teprve pak do jejích buněk skládá položky.** Rozvržení tedy popisuješ na kontejneru, ne na každé položce zvlášť.

:::check
Proč ve flexboxové variantě nezačínají všechna pole na stejné svislé čáře?

### --answer--
Protože pole mají `flex: 1 1 60%` a procenta se počítají z každého popisku zvlášť.

#### --why--
Procenta ve `flex-basis` se počítají ze šířky kontejneru, ne z popisku. Hledej, co spolu jednotlivé řádky zalomeného flexboxu sdílejí.

### --correct--
Protože každý zalomený řádek flexboxu rozděluje místo sám a o šířce popisků v ostatních řádcích neví.

#### --why--
Flexbox je jednorozměrný: řádek „Jméno" a řádek „E-mailová adresa" nemají společný sloupec. Grid sloupce vytvoří napříč všemi řádky.

### --answer--
Protože `align-items: center` ve flexboxu zarovnává i vodorovně.

#### --why--
`align-items` v řádkovém flexboxu zarovnává na vedlejší ose, tedy svisle. Na tom, kde pole začíná, nic nemění.
:::

## Grid kontejner, stopy a jednotka `fr`

Roli rozdělíš stejně jako u flexboxu:

- [[grid kontejner]] (*grid container*) — prvek s `display: grid`,
- [[grid položka|grid položky]] (*grid items*) — jeho **přímí** potomci.

Sloupce a řádky se společně jmenují [[stopa|stopy]] (*tracks*). Sloupce popíše `grid-template-columns`: každá hodnota v seznamu je jeden sloupec, `200px 1fr 1fr` jsou tedy tři sloupce. Mezery mezi stopami dělá `gap` stejně jako ve flexboxu (`row-gap`, `column-gap`, nebo `gap: řádky sloupce`).

Nová je [[jednotka fr|jednotka `fr`]] (*fraction*, díl). Prohlížeč šířku sloupců počítá takhle:

1. Od šířky kontejneru odečte pevné sloupce (`px`, `rem`, `%`) a všechny mezery `gap`.
2. Co zbude, rozdělí na tolik dílů, kolik je dohromady `fr`.
3. Každý sloupec dostane svůj počet dílů.

Opakující se stopy zkrátí `repeat()`: `repeat(4, 1fr)` je totéž jako `1fr 1fr 1fr 1fr`.

:::live
```html
<ul class="grid">
  <li>Mléko</li>
  <li>Chléb</li>
  <li>Sýr</li>
  <li>Jablka</li>
  <li>Káva</li>
  <li>Rýže</li>
</ul>
<p class="widths"></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.grid {
  display: grid;
  grid-template-columns: var(--columns);
  gap: var(--gap);
  width: 420px;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.grid li {
  padding: 0.75rem 0.5rem;
  border-radius: 0.5rem;
  background: #818cf8;
  color: white;
  font-weight: 600;
  text-align: center;
}

.widths {
  color: #475569;
}
```
```js
// Průběžně vypisuje šířky položek v prvním řádku.
function showWidths() {
  const items = [...document.querySelectorAll('.grid li')];
  const firstRow = items.filter((item) => item.offsetTop === items[0].offsetTop);
  const text = `Šířky v prvním řádku: ${firstRow.map((item) => Math.round(item.getBoundingClientRect().width)).join(' + ')} px`;
  const label = document.querySelector('.widths');
  if (label.textContent !== text) label.textContent = text;
  requestAnimationFrame(showWidths);
}

showWidths();
```
```controls
--columns: select("repeat(3, 1fr)", "120px 1fr", "1fr 2fr 1fr", "repeat(4, 1fr)", "100px 1fr 100px") = repeat(3, 1fr) | grid-template-columns
--gap: range(0, 40, 10, px) = 0 | gap
```
:::

Nejdřív si u každé šablony spočítej šířky v hlavě a teprve pak se podívej pod mřížku. Třeba `1fr 2fr 1fr` bez mezery: 420 px na čtyři díly po 105 px, prostřední sloupec 210 px. Pak přidej `gap` 20 px a počítej znovu — mezery se odečtou dřív, než se dělí.

Teď bez náhledu:

:::live predict
```html
<div class="grid">
  <div class="cell">A</div>
  <div class="cell">B</div>
  <div class="cell">C</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.grid {
  display: grid;
  grid-template-columns: 100px 1fr 2fr;
  gap: 20px;
  width: 500px;
  outline: 2px dashed #94a3b8;
}

.cell {
  padding: 0.75rem 0;
  border-radius: 0.5rem;
  background: #0ea5e9;
  color: white;
  text-align: center;
}
```
```js
// Vypíše do každé buňky její skutečnou šířku.
function showWidths() {
  for (const cell of document.querySelectorAll('.cell')) {
    const text = `${cell.textContent.charAt(0)}: ${Math.round(cell.getBoundingClientRect().width)} px`;
    if (cell.textContent !== text) cell.textContent = text;
  }
  requestAnimationFrame(showWidths);
}

showWidths();
```
--question-- Kontejner 500 px, `grid-template-columns: 100px 1fr 2fr`, `gap: 20px`. Jak široký bude sloupec C?
--option*-- 240 px
--option-- 267 px
--option-- 333 px
--why-- Od 500 px se odečte pevný sloupec (100 px) i obě mezery (40 px). Zbude 360 px na tři díly po 120 px a C dostane dva: 240 px. 267 px vyjde, když zapomeneš na mezery, 333 px, když dělíš celou šířku kontejneru v poměru 1 : 2.
--see-- css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr
:::

:::check
Napiš hodnotu `grid-template-columns` pro pět stejně širokých sloupců tak, abys `1fr` nepsal pětkrát.

### --expected--
repeat(5, 1fr)

### --why--
`repeat(počet, stopa)` zopakuje stopu. Hodí se i pro vzor: `repeat(2, 1fr 3fr)` jsou čtyři sloupce střídavě úzký a široký.
:::

## Explicitní a implicitní mřížka

Stopy, které vypíšeš v `grid-template-columns` a `grid-template-rows`, tvoří [[explicitní mřížka|explicitní mřížku]] (*explicit grid*). Když položek přibude víc, než kolik je v ní buněk, grid nepřetéká: položky skládá po řádcích a na konec přidává **nové řádky**. Ty tvoří [[implicitní mřížka|implicitní mřížku]] (*implicit grid*).

Výšku nových řádků řídí `grid-auto-rows`. Výchozí je `auto`, tedy tak vysoké, jak potřebuje obsah. Směr skládání určuje `grid-auto-flow`: výchozí `row` plní řádek po řádku, `column` plní sloupce a přidává nové sloupce.

:::live predict
```html
<ul class="tiles">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
  <li>6</li>
  <li>7</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 80px 80px;
  gap: 8px;
  max-width: 24rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tiles li {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: #34d399;
  font-weight: 700;
}
```
--question-- Mřížka má tři sloupce a dva řádky po 80 px. Kam spadne sedmá položka a jak bude vysoká?
--option-- Do nového sloupce vpravo od šesté položky, vysoká 80 px.
--option*-- Do nového třetího řádku pod první položku, vysoká jen podle svého textu.
--option-- Do nového třetího řádku pod první položku, vysoká 80 px jako ostatní.
--why-- Šest buněk explicitní mřížky je plných, a tak grid přidá implicitní řádek. `grid-template-rows` platí jen pro dva vypsané řádky, nový řádek má výchozí `grid-auto-rows: auto` a je vysoký podle obsahu. Dopiš do `.tiles` `grid-auto-rows: 80px;` a sedmá dlaždice dostane stejnou výšku. Pak zkus `grid-auto-flow: column;` a sleduj, kam se sedmička přesune.
--see-- css-grid/uvod-do-gridu#explicitni-a-implicitni-mrizka
:::

> [!TIP]
> V praxi řádky málokdy vypisuješ. U mřížky produktů nebo galerie znáš jen sloupce, řádků přibývá s daty — nastav `grid-template-columns` a výšku nových řádků nech na obsahu, nebo ji sjednoť přes `grid-auto-rows`.

:::check
Mřížka má `grid-template-columns: repeat(4, 1fr)` a žádné řádky nastavené nemá. Položek je deset. Kolik řádků vznikne?

### --expected--
3

### --accept--
tři

### --why--
Po čtyřech položkách na řádek: 4 + 4 + 2. Všechny tři řádky jsou implicitní, protože žádný řádek jsi nevypsal.
:::

## Umístění podle čar: `grid-column`, `grid-row` a `span`

Mřížku ohraničují [[čára mřížky|čáry]] (*grid lines*). Čáry se číslují od 1: tři sloupce mají čtyři svislé čáry. Záporná čísla se počítají od konce, `-1` je poslední čára explicitní mřížky.

Položku umístíš tak, že řekneš, na které čáře začíná a na které končí:

- `grid-column: 1 / 3` — od první do třetí svislé čáry, tedy přes dva sloupce,
- `grid-column: 1 / -1` — přes všechny sloupce explicitní mřížky, i když jich později přibude,
- `grid-column: span 2` — přes dva sloupce tam, kam by položka spadla sama,
- `grid-row: span 2` — totéž pro řádky.

Ostatní položky se [[automatické umísťování|automaticky umístí]] (*auto-placement*) do buněk, které zůstaly volné. Přepínače mění umístění doporučené položky:

:::live
```html
<ul class="shop">
  <li class="shop__item shop__item--featured">Doporučujeme</li>
  <li class="shop__item">Stan</li>
  <li class="shop__item">Spacák</li>
  <li class="shop__item">Karimatka</li>
  <li class="shop__item">Vařič</li>
  <li class="shop__item">Čelovka</li>
  <li class="shop__item">Batoh</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.shop {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 4rem;
  gap: 8px;
  max-width: 28rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.shop__item {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: #e2e8f0;
}

.shop__item--featured {
  grid-column: var(--featured-column);
  grid-row: var(--featured-row);
  background: linear-gradient(135deg, #f97316, #db2777);
  color: white;
  font-weight: 700;
}
```
```controls
--featured-column: select(auto, "span 2", "1 / -1", "2 / 4", "3 / span 2") = span 2 | grid-column
--featured-row: select(auto, "span 2", "1 / 3") = span 2 | grid-row
```
:::

Nastav sloupec `2 / 4` a sleduj levou horní buňku: zůstane prázdná a „Stan" skončí vpravo. Automatické umísťování jde po buňkách jen dopředu a za sebe se nevrací. U `1 / -1` zabere doporučená položka celý řádek. Pak v kódu změň počet sloupců na `repeat(5, 1fr)`: `1 / -1` se přizpůsobí, `2 / 4` ne.

> [!TIP]
> Čísla čar nemusíš počítat. V DevTools (tlačítko „Nová karta" nad náhledem, pak pravým tlačítkem Prozkoumat) má grid kontejner v panelu Elements odznak `grid`. Klikni na něj a přes stránku se nakreslí mřížka i s čísly čar.

:::check
Mřížka má čtyři sloupce. Napiš hodnotu `grid-column`, se kterou položka povede přes celou šířku mřížky a zůstane přes celou šířku, i když kolega změní počet sloupců na šest.

### --expected--
1 / -1

### --why--
`-1` je vždycky poslední čára explicitní mřížky, ať má sloupců kolik chce. Zápis `1 / 5` by po změně na šest sloupců vedl jen přes čtyři.
:::

## Pojmenované oblasti: `grid-template-areas`

U kostry stránky jsou čísla čar nepřehledná. `grid-template-areas` ti dovolí rozvržení **nakreslit**: každý řetězec v uvozovkách je jeden řádek, každé slovo jedna buňka. Stejné slovo ve vedlejších buňkách spojí buňky do jedné [[oblast mřížky|oblasti]] (*grid area*), tečka `.` je prázdná buňka. Položku do oblasti pošleš vlastností `grid-area` se jménem oblasti (bez uvozovek).

:::live
```html
<div class="app">
  <header class="app__header">Hlavička</header>
  <nav class="app__nav">Menu</nav>
  <main class="app__main">Obsah stránky</main>
  <footer class="app__footer">Patička</footer>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.app {
  display: grid;
  grid-template-columns: 9rem 1fr;
  grid-template-rows: auto 12rem auto;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  gap: 8px;
  max-width: 30rem;
}

.app > * {
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.app__header { grid-area: header; background: #1e293b; color: white; }
.app__nav { grid-area: nav; background: #cbd5e1; }
.app__main { grid-area: main; background: #f1f5f9; }
.app__footer { grid-area: footer; background: #e2e8f0; }
```
:::

Zkus poslední řetězec přepsat na `". footer"` — patička se posune pod obsah a pod menu zůstane prázdná buňka. Pak přehoď v prostředním řádku `nav` a `main` a menu je vpravo, aniž by ses dotkl HTML.

Oblast musí být **obdélník** a všechny řetězce musí mít stejný počet buněk. Když podmínku porušíš, prohlížeč celou deklaraci zahodí. Obě varianty níž se liší jen posledním řádkem šablony:

:::compare
```html
<div class="app">
  <header class="app__header">Hlavička</header>
  <nav class="app__nav">Menu</nav>
  <main class="app__main">Obsah</main>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.app {
  display: grid;
  grid-template-columns: 6rem 1fr;
  gap: 8px;
}

.app > * {
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.app__header { grid-area: header; background: #1e293b; color: white; }
.app__nav { grid-area: nav; background: #cbd5e1; }
.app__main { grid-area: main; background: #f1f5f9; }
```
--variant-- Oblasti jsou obdélníky
```css
.app { grid-template-areas: "header header" "nav main" "nav main"; }
```
--variant-- Hlavička do tvaru L
```css
.app { grid-template-areas: "header header" "nav main" "header main"; }
```
:::

:::check
Šablona je `"logo search" "menu content" "menu logo"`. Co udělá prohlížeč?

### --answer--
Logo se zobrazí dvakrát, nahoře vlevo a dole vpravo.

#### --why--
Jedna položka se nikdy nezobrazí dvakrát. Podívej se, jaký tvar by oblast `logo` měla.

### --correct--
Zahodí celou deklaraci `grid-template-areas`, protože oblast `logo` není obdélník.

#### --why--
Buňky `logo` spolu nesousedí a netvoří obdélník, šablona je neplatná. Neplatná deklarace se v CSS ignoruje celá, oblasti s těmi jmény neexistují a položky s `grid-area` skončí přes sebe v automaticky přidaném sloupci.

### --answer--
Použije jen první výskyt `logo` a druhý bude prázdná buňka.

#### --why--
Prohlížeč neplatnou šablonu neopravuje po kouscích. Neplatná deklarace se v CSS ignoruje celá.
:::

## Zarovnání v buňce

Položka ve výchozím stavu vyplní celou svou buňku: `justify-items` i `align-items` se u ní chovají jako `stretch`. Na rozdíl od flexboxu se v gridu osy neotáčejí:

- `justify-items` zarovnává v řádkovém směru (*inline*), v češtině **vodorovně**,
- `align-items` zarovnává v blokovém směru (*block*), tedy **svisle**,
- `place-items: <align> <justify>` je zkratka pro obojí; s jednou hodnotou platí pro obě osy,
- `justify-self` a `align-self` přepíší zarovnání jen pro jednu položku.

:::live
```html
<div class="grid">
  <div class="item">Káva</div>
  <div class="item">Čaj s mátou</div>
  <div class="item">Kakao</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 6rem;
  gap: 8px;
  justify-items: var(--justify);
  align-items: var(--align);
  max-width: 26rem;
}

.item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: #fbbf24;
  outline: 1px dashed #b45309;
  outline-offset: 2px;
}
```
```controls
--justify: select(stretch, start, center, end) = stretch | justify-items
--align: select(stretch, start, center, end) = stretch | align-items
```
:::

Nastav obě hodnoty na `center` — to je nejkratší vycentrování čehokoli: `display: grid; place-items: center;` na rodiči. Pak do kódu přidej `.item:first-child { align-self: end; }` a sleduj, že se pohne jen první položka.

:::check
Kontejner má `display: grid; place-items: end center; height: 200px;` a jednu malou položku. Kde bude?

### --answer--
U pravého okraje, svisle uprostřed.

#### --why--
Myslíš si, že první hodnota zkratky je vodorovná? U `place-items` je první hodnota `align-items`.

### --correct--
Dole, vodorovně uprostřed.

#### --why--
`place-items` bere nejdřív `align-items` (blokový směr, svisle), pak `justify-items` (řádkový směr, vodorovně). `end` ji tedy posune dolů a `center` doprostřed šířky.

### --answer--
Nahoře uprostřed, protože `end` bez `flex-direction` nic nedělá.

#### --why--
Grid žádný `flex-direction` nemá a jeho osy se neotáčejí. `end` v něm funguje vždycky.
:::

## Typické chyby a pasti

Nejčastější past gridu se neukáže, dokud do sloupce nepřijde něco širokého. Tipni si, co udělá vodorovný pás karet v hlavním sloupci:

:::live predict
```html
<div class="layout">
  <aside class="layout__side">Knihovna</aside>
  <main class="layout__main">
    <h2>Podobné podcasty</h2>
    <ul class="shelf">
      <li>Dějiny</li>
      <li>Věda</li>
      <li>Sport</li>
      <li>Byznys</li>
      <li>Kultura</li>
      <li>Technika</li>
      <li>Příroda</li>
      <li>Cestování</li>
    </ul>
  </main>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.layout {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1rem;
  width: 420px;
  outline: 2px dashed #94a3b8;
}

.layout__side {
  padding: 0.5rem;
  background: #e2e8f0;
}

h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

/* Pás karet, který se má posouvat do strany. */
.shelf {
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  list-style: none;
}

.shelf li {
  flex: 0 0 6rem;
  height: 6rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  color: white;
}
```
--question-- Pás karet má `overflow-x: auto` a je v hlavním sloupci `1fr`. Co se stane?
--option-- Hlavní sloupec zůstane úzký a pás karet se v něm dá posouvat do strany.
--option*-- Hlavní sloupec se roztáhne na šířku celého pásu a mřížka vyleze z čárkovaného rámečku.
--option-- Boční panel se zmenší, aby se pás karet vešel.
--why-- `1fr` znamená `minmax(auto, 1fr)` a `auto` jako minimum je [[nejmenší šířka obsahu]]. Pás s osmi kartami, které se nezalomí, má nejmenší šířku přes 800 px, a tak sloupec pod ni nesmí. `overflow-x: auto` nepomůže, dokud sloupec pás pustí do celé šířky. Přepiš šablonu na `8rem minmax(0, 1fr)`: minimum sloupce je nula, sloupec zůstane v rámečku a pás se posouvá.
--see-- css-grid/uvod-do-gridu#typicke-chyby-a-pasti
:::

> [!PITFALL] Sloupec `1fr`, který se nechce zmenšit
> *Příznak:* pás karet, `<pre>` s kódem, široká tabulka nebo dlouhá URL bez pomlček roztáhne sloupec `1fr`, mřížka vyleze z obrazovky a celá stránka jde posouvat do strany.
>
> *Oprava:* `minmax(0, 1fr)` místo `1fr` u sloupce, kde může být široký obsah. Minimum `auto` je nejmenší šířka obsahu, `0` sloupci dovolí být užší než obsah — a teprve pak začne fungovat `overflow-x: auto` uvnitř.

:::explain
Vysvětli vlastními slovy, proč pás karet roztáhl sloupec `1fr` a proč pomohl zápis `minmax(0, 1fr)`.

## --model--
`1fr` je zkratka za `minmax(auto, 1fr)`: sloupec chce díl volného místa, ale nesmí být užší než nejmenší šířka svého obsahu. Pás karet, které se nezalomí, má nejmenší šířku celého pásu, takže sloupec narostl na ni a mřížka přetekla. `minmax(0, 1fr)` nastaví minimum na nulu, sloupec zůstane podle volného místa a široký obsah se uvnitř posouvá nebo ořízne.

## --checklist--
- `1fr` je zkratka za `minmax(auto, 1fr)`.
- Minimum `auto` znamená nejmenší šířku obsahu sloupce.
- Nezalomitelný obsah proto sloupec roztáhne.
- `minmax(0, 1fr)` nastaví minimum na nulu a sloupec drží šířku z volného místa.
:::

> [!PITFALL] Procenta a `gap` přetečou
> *Příznak:* `grid-template-columns: repeat(3, 33.33%)` s `gap: 16px` a poslední sloupec vyčuhuje 32 px z kontejneru.
>
> *Oprava:* procenta se počítají z celé šířky a mezery se k nim přičtou. `fr` dělí až místo, které po mezerách zbude: `repeat(3, 1fr)`.

> [!PITFALL] Šablona oblastí, která tiše nefunguje
> *Příznak:* nová šablona `grid-template-areas` jako by neexistovala a chybová hláška nikde. Když výš v kaskádě platí jiná šablona (třeba mimo media dotaz), použije se ta. Když žádná není, části stránky se naskládají přes sebe do jedné buňky na kraji mřížky.
>
> *Oprava:* zkontroluj, že každý řetězec má stejný počet buněk a každá oblast je obdélník. V DevTools je neplatná deklarace přeškrtnutá.

> [!PITFALL] Hlavička nafouklá na vysokém okně
> *Příznak:* kostra stránky má `block-size: 100dvh` a na vysokém monitoru je hlavička i patička vysoká přes sto pixelů, obsah v nich plave uprostřed.
>
> *Oprava:* nevypsané řádky mají velikost `auto` a v kontejneru vyšším než obsah se roztáhnou všechny rovným dílem. Vypiš řádky: `grid-template-rows: auto 1fr auto` — krajní podle obsahu, prostřední dostane zbytek.

> [!PITFALL] `1 / -1` nevede přes automaticky přidané řádky
> *Příznak:* boční panel má `grid-row: 1 / -1`, ale je vysoký jen jako první řádek, protože řádky vznikly automaticky.
>
> *Oprava:* `-1` je poslední čára **explicitní** mřížky. Vypiš řádky v `grid-template-rows` (nebo použij `grid-template-areas`), případně `grid-row: span 3`.

:::check
Kolega má `grid-template-columns: 15rem 1fr` a v hlavním sloupci tabulku s dvanácti sloupci v obalu s `overflow-x: auto`. Na notebooku jde celá stránka posouvat do strany. Napiš opravenou hodnotu `grid-template-columns`.

### --expected--
15rem minmax(0, 1fr)

### --accept--
15rem minmax(0px, 1fr)

### --why--
Tabulka se nezalomí a její nejmenší šířka roztáhla sloupec `1fr`. S minimem `0` zůstane sloupec široký podle volného místa a posouvat se bude jen obal tabulky.
:::

## Kde to najdeš v MDN

- [Basic concepts of grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts) — stopy, `fr`, `repeat()`, explicitní a implicitní mřížka a čáry, s obrázky.
- [Grid layout using line-based placement](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Line-based_placement) — `grid-column`, `grid-row`, záporná čísla čar a `span`.
- [Grid template areas](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Grid_template_areas) — kreslení rozvržení řetězci, prázdné buňky a pravidla pro platnou šablonu.
- [`minmax()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/minmax) — co znamená minimum `auto` a proč `1fr` odpovídá `minmax(auto, 1fr)`.

# --questions--

## --question--

Kontejner je široký 600 px a má `grid-template-columns: 1fr 1fr 1fr 1fr; gap: 24px;`. Kolik pixelů bude široký jeden sloupec?

### --expected--

132

### --accept--

132 px
132px

### --why--

Čtyři sloupce mají mezi sebou tři mezery: 3 × 24 = 72 px. Zbude 528 px a čtyři díly po 132 px. Kdo napsal 150, dělil celou šířku a na mezery zapomněl.

### --see--

css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

## --question--

Mřížka má `grid-template-columns: repeat(3, 1fr)`. První položka má `grid-column: span 3`, ostatní nic. Položek je pět. Kolik řádků vznikne?

### --expected--

3

### --accept--

tři

### --why--

První položka zabere celý první řádek. Zbylé čtyři položky se skládají po třech: druhý řádek plný, ve třetím zbude jedna. Všechny řádky jsou implicitní.

### --see--

css-grid/uvod-do-gridu#umisteni-podle-car-grid-column-grid-row-a-span

## --question--

Galerie má `grid-template-columns: repeat(3, 1fr)` a řádky nevypsané. Chceš, aby měly všechny řádky, i ty, které přibudou s dalšími fotkami, výšku 200 px. Napiš deklaraci.

### --expected--

grid-auto-rows: 200px

### --why--

Nevypsané řádky patří do implicitní mřížky a jejich velikost řídí `grid-auto-rows`. `grid-template-rows: 200px` by nastavil jen první řádek.

### --see--

css-grid/uvod-do-gridu#explicitni-a-implicitni-mrizka

## --question--

Karta v mřížce má být vycentrovaná vodorovně ve své buňce, ale ostatní karty mají zůstat roztažené. Kterou vlastnost dáš té jedné kartě?

### --answer--

`align-self: center`

#### --why--

`align-*` v gridu pracuje v blokovém směru, tedy svisle. Na rozdíl od flexboxu se osy v gridu neotáčejí.

### --correct--

`justify-self: center`

#### --why--

`justify-self` zarovná jednu položku v řádkovém směru, v češtině vodorovně, a ostatní položky nechá být.

### --answer--

`justify-items: center`

#### --why--

`*-items` patří na kontejner a platí pro všechny položky. Ostatní karty by se přestaly roztahovat.

### --see--

css-grid/uvod-do-gridu#zarovnani-v-bunce
