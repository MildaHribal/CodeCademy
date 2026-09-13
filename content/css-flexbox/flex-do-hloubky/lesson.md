# Flex do hloubky

Ve workshopu jsi použil `flex: 1 1 15rem` a `min-width: 0` a viděl jsi, že fungují. Tahle lekce vysvětlí **proč** — jak prohlížeč z těch tří čísel spočítá skutečné šířky. Když to pochopíš, přestaneš ladit rozvržení zkoušením hodnot naslepo.

V ukázkách je malý skript, který do každé položky vypíše její skutečnou šířku. Nemusíš mu rozumět, jen sleduj čísla.

## Tři čísla: basis, grow, shrink

Každá flex položka má tři vlastnosti, které se píšou zkratkou `flex: <grow> <shrink> <basis>`:

- `flex-basis` — **výchozí velikost** na hlavní ose. Z ní se vychází. Hodnota `auto` znamená „vezmi `width` (v řádku), a když není nastavená, velikost obsahu".
- `flex-grow` — jakým dílem si položka vezme **volné místo**, když nějaké zbývá. Výchozí `0`.
- `flex-shrink` — jakým dílem se položka podílí na **zmenšování**, když místo chybí. Výchozí `1`.

Prohlížeč postupuje takhle:

1. Sečte `flex-basis` všech položek a mezery (`gap`).
2. Porovná součet s velikostí kontejneru.
3. Když zbývá místo, rozdělí ho podle `flex-grow`. Když místo chybí, ubere podle `flex-shrink` — a ne rovným dílem, jak uvidíš za chvíli.
4. Hlídá `min-width` a `max-width`. Položka, která by přes ně přelezla, se zastaví na hranici a zbytek se přepočítá mezi ostatní.

## Růst v číslech

Kontejner je široký **400 px**, bez mezer. Položky:

| položka | `flex` | basis | grow |
|---|---|---|---|
| A | `1 1 50px` | 50 | 1 |
| B | `1 1 100px` | 100 | 1 |
| C | `2 1 50px` | 50 | 2 |

1. Součet basis: 50 + 100 + 50 = **200 px**.
2. Volné místo: 400 − 200 = **200 px**.
3. Podílů je 1 + 1 + 2 = 4, jeden podíl je 200 / 4 = **50 px**.
4. A dostane 1 podíl → 50 + 50 = **100 px**. B dostane 1 podíl → 100 + 50 = **150 px**. C dostane 2 podíly → 50 + 100 = **150 px**.

Všimni si: C má `flex-grow: 2`, ale není dvakrát širší než B. Dostalo jen dvakrát víc **volného místa**.

:::live
```html
<div class="row">
  <div class="item a">A: <span class="width"></span></div>
  <div class="item b">B: <span class="width"></span></div>
  <div class="item c">C: <span class="width"></span></div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.row {
  display: flex;
  width: 400px;
  outline: 2px dashed #94a3b8;
}

.item {
  box-sizing: border-box;
  padding: 0.75rem 0;
  text-align: center;
  color: white;
  font-size: 0.875rem;
}

.a { flex: 1 1 50px; background: #6366f1; }
.b { flex: 1 1 100px; background: #0ea5e9; }
.c { flex: 2 1 50px; background: #10b981; }
```
```js
// Vypíše do každé položky její skutečnou šířku.
function showWidths() {
  for (const item of document.querySelectorAll('.item')) {
    item.querySelector('.width').textContent = `${Math.round(item.getBoundingClientRect().width)} px`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showWidths);
} else {
  showWidths();
}
```
:::

Zkus změnit `.c` na `flex: 3 1 50px` a spočítej si výsledek dopředu (5 podílů po 40 px → A 90, B 140, C 170). Pak přidej `.row { gap: 20px; }` — mezery se odečtou před rozdělováním, takže volného místa je o 40 px méně.

## Zmenšování v číslech

Kontejner je široký **300 px**. Položky:

| položka | `flex` | basis | shrink |
|---|---|---|---|
| A | `0 1 300px` | 300 | 1 |
| B | `0 1 200px` | 200 | 1 |

1. Součet basis: 300 + 200 = **500 px**.
2. Chybí: 500 − 300 = **200 px**.
3. Tady je rozdíl oproti růstu: ubírání se nedělí podle samotného `flex-shrink`, ale podle **`flex-shrink` × basis**. Větší položka tak ztratí víc pixelů, ale obě přijdou o stejný **podíl** své velikosti. Váhy: A = 1 × 300 = 300, B = 1 × 200 = 200, celkem 500.
4. A ztratí 200 × 300/500 = 120 → **180 px**. B ztratí 200 × 200/500 = 80 → **120 px**.

Obě položky se zmenšily na 60 % své výchozí velikosti. Kdyby se ubíralo rovným dílem (po 100 px), malé položky by mizely mnohem rychleji než velké.

:::live
```html
<div class="row">
  <div class="item a">A: <span class="width"></span></div>
  <div class="item b">B: <span class="width"></span></div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.row {
  display: flex;
  width: 300px;
  outline: 2px dashed #94a3b8;
}

.item {
  box-sizing: border-box;
  padding: 0.75rem 0;
  text-align: center;
  color: white;
  font-size: 0.875rem;
}

.a { flex: 0 1 300px; background: #f97316; }
.b { flex: 0 1 200px; background: #8b5cf6; }
```
```js
// Vypíše do každé položky její skutečnou šířku.
function showWidths() {
  for (const item of document.querySelectorAll('.item')) {
    item.querySelector('.width').textContent = `${Math.round(item.getBoundingClientRect().width)} px`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showWidths);
} else {
  showWidths();
}
```
:::

Zkus dát `.b` hodnotu `flex: 0 3 200px`. Váhy budou 300 a 600, takže A ztratí jen třetinu z 200 px (≈ 67 → 233 px) a B dvě třetiny (≈ 133 → 67 px). A pak `.a` přepni na `flex: 0 0 300px`: A se nezmenší vůbec a B by musela ztratit celých 200 px, tedy zmizet. Nezmizí — zastaví se na šířce svého nejdelšího slova a vyčuhuje z kontejneru ven. Proč se zastaví, vysvětluje kapitola o `min-width` níž.

## Zkratka `flex` a její výchozí hodnoty

Když zkratku `flex` napíšeš jen s jedním číslem, doplní se zbytek hodnotami, které se liší od výchozích hodnot jednotlivých vlastností:

| zápis | znamená | chování |
|---|---|---|
| (nic) | `0 1 auto` | velikost podle obsahu, neroste, smí se zmenšit |
| `flex: 1` | `1 1 0%` | basis **nula** → celé místo se dělí podle grow, obsah nehraje roli |
| `flex: auto` | `1 1 auto` | roste z velikosti obsahu → delší obsah, širší položka |
| `flex: none` | `0 0 auto` | přesně podle obsahu, nemění se |

Rozdíl mezi `flex: 1` a `flex: auto` je vidět nejlíp na položkách s různě dlouhým textem:

:::live
```html
<p>flex: 1</p>
<div class="row one">
  <div class="item">Ano</div>
  <div class="item">Možná později, až budu mít čas</div>
</div>

<p>flex: auto</p>
<div class="row auto">
  <div class="item">Ano</div>
  <div class="item">Možná později, až budu mít čas</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

p { margin: 1rem 0 0.25rem; font-family: ui-monospace, monospace; }

.row {
  display: flex;
  gap: 4px;
  width: 420px;
}

.item {
  padding: 0.75rem;
  background: #e0e7ff;
  text-align: center;
}

.one .item { flex: 1; }
.auto .item { flex: auto; }
```
:::

S `flex: 1` jsou obě položky stejně široké (vycházejí z nuly a volné místo se dělí napůl). S `flex: auto` vycházejí ze šířky textu, takže delší text dostane i širší položku. Zkus v `.row` zmenšit šířku na `260px` a sleduj, co udělá dlouhý text v obou variantách.

## Proč se položka nezmenší: `min-width: auto`

Tohle je nejčastější past ve flexboxu. Flex položka má výchozí **`min-width: auto`**, což pro ni znamená: *nezmenšuj mě pod nejmenší šířku mého obsahu* (*min-content*). Nejmenší šířka obsahu je:

- u běžného textu šířka **nejdelšího slova**,
- u textu s `white-space: nowrap` šířka **celého textu**,
- u obrázku jeho šířka, u `<pre>` nejdelší řádek kódu, u tabulky součet nejužších sloupců.

`flex-shrink` pak může říkat, co chce — zmenšování se zastaví na `min-width`. Výsledek: položka přeteče z kontejneru, rozbije sousedy nebo roztáhne celou stránku do šířky.

Příklad z praxe — řádek se souborem ke stažení:

:::live
```html
<div class="file">
  <span class="file__icon">PDF</span>
  <div class="file__info">
    <strong class="file__name">vyuctovani-za-sluzby-cerven-2026-finalni-verze-opravena.pdf</strong>
    <small>2,4 MB · nahráno včera</small>
  </div>
  <button>Stáhnout</button>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 320px;
  padding: 0.5rem;
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
}

.file__icon {
  flex: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}

.file__info {
  flex: 1 1 auto;
}

.file__name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
:::

Tlačítko „Stáhnout" vyčuhuje z rámečku, přestože název má `overflow: hidden` a `text-overflow: ellipsis`. Flex položkou tu ale není název, nýbrž `.file__info` — a její minimum je šířka celého nezalomitelného názvu. Přidej do `.file__info` deklaraci `min-width: 0`: položka se smí zmenšit, název se ořízne třemi tečkami a tlačítko se vrátí dovnitř.

Jedna výjimka, ať tě nepřekvapí: když má `overflow` jiné než `visible` **přímo flex položka**, automatické minimum je nula a položka se zmenší i bez `min-width: 0`. Na to se ale nespoléhej — `overflow: hidden` bývá uvnitř, na nadpisu nebo odstavci, a někdy ořezávání nechceš vůbec. Jednoduché pravidlo: **když se má flex položka zmenšit pod svůj obsah, napiš jí `min-width: 0`** (ve sloupci `min-height: 0`).

Kde tuhle past potkáš:

- dlouhý název souboru, e-mail nebo URL v řádku s ikonami,
- nadpis s oříznutím třemi tečkami uvnitř karty, která je sama flex položkou (přesně jako ve workshopu),
- blok kódu nebo tabulka v hlavním sloupci vedle postranního panelu.

## Flexbox, nebo grid?

Flexbox rozvrhuje **v jedné ose**. Položky se řadí za sebou a každý řádek (při `flex-wrap`) si počítá místo sám, nezávisle na ostatních řádcích. Grid rozvrhuje **ve dvou osách najednou** — řádky i sloupce tvoří mřížku a položky v různých řádcích se srovnají pod sebe.

Kdy sáhnout po čem:

| situace | vhodnější | proč |
|---|---|---|
| hlavička, lišta nástrojů, řádek formuláře | flexbox | jedna řada prvků různé šířky |
| vnitřek karty (obrázek, text, patička u dna) | flexbox | jeden sloupec s automatickým marginem |
| štítky, které se zalamují | flexbox | velikost určuje obsah |
| mřížka produktů se sloupci pod sebou | grid | sloupce mají být srovnané přes všechny řádky |
| kostra stránky (hlavička, boční panel, obsah) | grid | dvourozměrné rozvržení |

Jednoduché vodítko: **když rozhoduje obsah, kolik místa si položka vezme, je to práce pro flexbox. Když rozhoduje rozvržení, kam položka patří, je to práce pro grid.**

Typický příznak, že jsi flexboxem stavěl mřížku: poslední řádek s méně položkami se roztáhne jinak než řádky nad ním.

:::live
```html
<p>flexbox s flex-wrap</p>
<ul class="flex">
  <li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>
</ul>

<p>grid</p>
<ul class="grid">
  <li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

p { margin: 1rem 0 0.25rem; }

ul {
  width: 360px;
  margin: 0;
  padding: 0;
  list-style: none;
  gap: 8px;
}

li {
  padding: 1rem;
  border-radius: 0.5rem;
  background: #fbbf24;
  text-align: center;
}

.flex {
  display: flex;
  flex-wrap: wrap;
}

.flex li {
  flex: 1 1 100px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
```
:::

Ve flexboxu jsou položky 4 a 5 na druhém řádku roztažené na polovinu šířky, protože si dělí volné místo svého řádku. V gridu zůstávají ve sloupcích pod položkami 1 a 2. Zkus změnit `width` seznamu na `480px`. Grid podrobně probírá samostatná sekce CSS Grid; teď stačí vědět, že existuje a kdy ho použít.

## Typické chyby a pasti

**`flex: 1` tam, kde chceš respektovat obsah.** `flex: 1` nastaví basis na nulu. Pro sloupce stejné šířky se hodí, pro položky, které mají být široké podle textu, špatně — pak chceš `flex: auto` nebo `flex: 1 1 auto`.

**Čekání, že `flex-grow: 2` znamená dvakrát širší.** Znamená dvakrát víc volného místa. Dvojnásobnou šířku dostaneš jen tehdy, když mají položky basis `0` (`flex: 2` vs. `flex: 1`) a žádný vnitřní okraj (`padding`) ani rámeček, které se k šířce přičítají zvlášť.

**Položka, která se odmítá zmenšit.** Skoro vždycky je to `min-width: auto` a obsah, který se nedá zalomit. Pomůže `min-width: 0` na flex položce (a případně `overflow-wrap: anywhere` nebo oříznutí textu uvnitř).

**`width` i `flex-basis` zároveň.** Když má položka `flex-basis` jiné než `auto`, `width` se pro výchozí velikost ignoruje. Rozhoduj se pro jedno — ve flexboxu pro `flex-basis`.

**Mřížka z flexboxu.** Když potřebuješ, aby se položky v různých řádcích srovnaly do sloupců, použij grid a nelaď flexbox procenty.

# --questions--

## --question--

Kontejner je široký 600 px, bez `gap`. Položka X má `flex: 1 1 100px`, položka Y má `flex: 3 1 100px`. Jak široká bude Y?

### --answer--

450 px

#### --why--

450 px by vyšlo, kdyby se v poměru 1 : 3 dělila celá šířka (600 × 3/4). `flex-grow` ale dělí jen volné místo, výchozích 100 px má každá položka předem.

### --correct--

400 px

#### --why--

Součet basis je 200 px, volné místo 400 px. Podílů jsou 4, jeden podíl je 100 px. Y dostane 3 podíly: 100 + 300 = 400 px. X dostane 100 + 100 = 200 px.

### --answer--

300 px

#### --why--

300 px by vyšlo, kdyby měly obě položky stejné `flex-grow`. Y má ale trojnásobný podíl na volném místě.

## --question--

Kontejner je široký 400 px. Položka A má `flex: 0 1 400px`, položka B má `flex: 0 1 100px`. Chybí 100 px. O kolik se zmenší A?

### --answer--

O 50 px, protože obě mají `flex-shrink: 1`.

#### --why--

Rovným dílem by se ubíralo jen tehdy, kdyby měly položky stejnou basis. Ubírání se váží součinem `flex-shrink` × basis.

### --correct--

O 80 px.

#### --why--

Váhy jsou 1 × 400 = 400 a 1 × 100 = 100, celkem 500. A ztratí 100 × 400/500 = 80 px (na 320 px), B ztratí 20 px (na 80 px). Obě přijdou o 20 % své velikosti.

### --answer--

O 100 px, protože je větší.

#### --why--

Menší položka se na zmenšování taky podílí, když má `flex-shrink` větší než nula.

## --question--

V řádku je `<span class="email">jan.novak.velmi.dlouha.adresa@priklad.cz</span>` s `flex: 1 1 auto` a vedle něj tlačítko. Na úzké obrazovce tlačítko vyčuhuje z kontejneru. Co je nejpravděpodobnější příčina?

### --correct--

Položka má výchozí `min-width: auto` a e-mail nejde zalomit, takže se nezmenší pod jeho šířku.

#### --why--

Minimum flex položky je šířka jejího obsahu. E-mail je jedno dlouhé „slovo", takže položka se zastaví na jeho šířce a tlačítko vytlačí ven. Pomůže `min-width: 0` (a třeba `overflow-wrap: anywhere`).

### --answer--

Chybí `flex-shrink: 1`.

#### --why--

`flex-shrink: 1` je výchozí hodnota a v zápisu `flex: 1 1 auto` je navíc napsaná. Zmenšování zastavuje `min-width`, ne `flex-shrink`.

### --answer--

Chybí `flex-wrap: wrap` na tlačítku.

#### --why--

`flex-wrap` patří na kontejner, ne na položku. A i se zalomením by e-mail přetekl, kdyby byl širší než celý kontejner.

## --question--

Stavíš katalog produktů: karty mají být ve sloupcích a na posledním neúplném řádku mají zůstat stejně široké a pod kartami nad nimi. Co zvolíš?

### --answer--

Flexbox s `flex-wrap: wrap` a `flex: 1 1 200px`.

#### --why--

Každý řádek flexboxu si dělí volné místo sám, takže karty na posledním neúplném řádku se roztáhnou jinak než nad nimi.

### --correct--

Grid se sloupci, například `repeat(auto-fill, minmax(200px, 1fr))`.

#### --why--

Grid rozvrhuje ve dvou osách: sloupce platí pro všechny řádky, takže karty na posledním řádku zůstanou ve stejných sloupcích jako karty nad nimi.

### --answer--

Flexbox s `justify-content: space-between`.

#### --why--

`space-between` na neúplném řádku rozhází karty ke krajům s velkou mezerou uprostřed — ve sloupcích pod ostatními nebudou.
