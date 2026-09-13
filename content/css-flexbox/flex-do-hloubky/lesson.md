# Flex do hloubky

:::check pretest
Kontejner je široký 400 px, bez mezer. Položka A má `flex: 1 1 100px`, položka B má `flex: 3 1 100px`. Odhadni, jak široká bude B.

### --expected--
250

### --accept--
250 px
250px

### --why--
Obě položky začínají na 100 px, volné místo je 400 − 200 = 200 px. Dělí se na 1 + 3 = 4 díly po 50 px a B dostane tři: 100 + 150 = 250 px. Kdo tipoval 300 px, dělil v poměru 1 : 3 celou šířku — přesně tuhle představu lekce rozbije.
:::

Ve workshopu jsi použil `flex: 1 1 15rem` a `min-width: 0` a viděl jsi, že fungují. Jenže až budeš rozvrhovat vlastní stránku, zkoušení hodnot naslepo tě zradí: `flex-grow: 2` neudělá položku dvakrát širší, `width: 300px` se ve flexu tiše zmenší a položka s dlouhým e-mailem odmítne zmenšit se vůbec.

> [!REMEMBER]
> **`flex-basis` je startovní velikost položky. `flex-grow` a `flex-shrink` rozdělují jen rozdíl mezi součtem startovních velikostí a velikostí kontejneru.** Nikdy ne celou šířku.

V ukázkách je malý skript, který do každé položky vypisuje její skutečnou šířku. Nemusíš mu rozumět, jen sleduj čísla.

## Tři čísla: basis, grow, shrink

Každá [[flex položka]] má tři vlastnosti, které se píšou zkratkou `flex: <grow> <shrink> <basis>`:

- `flex-basis` — **výchozí velikost** na hlavní ose. Z ní se vychází. Hodnota `auto` znamená „vezmi `width` (v řádku), a když není nastavená, velikost obsahu".
- `flex-grow` — jakým dílem si položka vezme [[volné místo]], když nějaké zbývá. Výchozí `0`.
- `flex-shrink` — jakým dílem se položka podílí na **zmenšování**, když místo chybí. Výchozí `1`.

Prohlížeč postupuje takhle:

1. Sečte `flex-basis` všech položek a mezery (`gap`).
2. Porovná součet s velikostí kontejneru.
3. Když zbývá místo, rozdělí ho podle `flex-grow`. Když místo chybí, ubere podle `flex-shrink` — a ne rovným dílem, jak uvidíš za chvíli.
4. Hlídá `min-width` a `max-width`. Položka, která by přes ně přelezla, se zastaví na hranici a zbytek se přepočítá mezi ostatní.

:::check
Kontejner je široký 500 px a součet `flex-basis` jeho položek je 650 px. Která z vlastností teď rozhoduje o výsledných šířkách?

### --answer--
`flex-grow`, protože položky se musí přizpůsobit kontejneru.

#### --why--
`flex-grow` rozděluje jen místo, které **zbývá**. Tady 150 px chybí, žádné volné místo není.

### --correct--
`flex-shrink`, protože 150 px chybí a musí se ubrat.

#### --why--
Součet startovních velikostí je větší než kontejner, takže prohlížeč ubírá. Kolik komu, určuje `flex-shrink` (vážený velikostí `flex-basis`) a hlídá to `min-width`.

### --answer--
Žádná. Položky zůstanou na své `flex-basis` a přetečou.

#### --why--
Přetečou jen tehdy, když mají `flex-shrink: 0` nebo když je zastaví `min-width`. Výchozí `flex-shrink` je `1`, takže se zmenšují.
:::

## Růst v číslech

Kontejner je široký **400 px**, bez mezer. Položky:

| položka | `flex` | basis | grow |
|---|---|---|---|
| A | `1 1 50px` | 50 | 1 |
| B | `1 1 100px` | 100 | 1 |
| C | `2 1 50px` | 50 | 2 |

1. Součet basis: 50 + 100 + 50 = 200 px.
2. Volné místo: 400 − 200 = 200 px.
3. Dílů je 1 + 1 + 2 = 4, jeden díl je 200 / 4 = 50 px.
4. A dostane 1 díl → 50 + 50 = **100 px**. B dostane 1 díl → 100 + 50 = **150 px**. C dostane 2 díly → 50 + 100 = **150 px**.

C má `flex-grow: 2`, a přesto není dvakrát širší než B. Dostalo jen dvakrát víc ==volného místa==.

Posuvníky mění `flex-grow` položek A a B a šířku kontejneru. C má pořád `flex: 2 1 50px`.

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
  width: var(--row-width);
  outline: 2px dashed #94a3b8;
}

.item {
  box-sizing: border-box;
  padding: 0.75rem 0;
  text-align: center;
  color: white;
  font-size: 0.875rem;
}

.a { flex: var(--grow-a) 1 50px; background: #6366f1; }
.b { flex: var(--grow-b) 1 100px; background: #0369a1; }
.c { flex: 2 1 50px; background: #047857; }
```
```js
// Průběžně vypisuje do každé položky její skutečnou šířku.
function showWidths() {
  for (const item of document.querySelectorAll('.item')) {
    const text = `${Math.round(item.getBoundingClientRect().width)} px`;
    const label = item.querySelector('.width');
    if (label.textContent !== text) label.textContent = text;
  }
  requestAnimationFrame(showWidths);
}

showWidths();
```
```controls
--grow-a: range(0, 4, 1) = 1 | flex-grow A
--grow-b: range(0, 4, 1) = 1 | flex-grow B
--row-width: range(150, 400, 50, px) = 400 | šířka kontejneru
```
:::

Zkus tohle a u každého pokusu si výsledek nejdřív spočítej:

- `flex-grow` A i B na `0`: celé volné místo (200 px) dostane C, takže bude 250 px.
- Šířku kontejneru na `200px`: součet basis je taky 200, volné místo je nula a na `flex-grow` vůbec nezáleží.
- Šířku na `150px`: místo **chybí**, grow nehraje roli a položky se zmenšují — o tom je další část.

Teď nová situace. Spočítej si ji, než odkryješ náhled:

:::live predict
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
  gap: 20px;
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

.a { flex: 1 1 60px; background: #6366f1; }
.b { flex: 2 1 80px; background: #0369a1; }
```
```js
// Průběžně vypisuje do každé položky její skutečnou šířku.
function showWidths() {
  for (const item of document.querySelectorAll('.item')) {
    const text = `${Math.round(item.getBoundingClientRect().width)} px`;
    const label = item.querySelector('.width');
    if (label.textContent !== text) label.textContent = text;
  }
  requestAnimationFrame(showWidths);
}

showWidths();
```
--question-- Kontejner 400 px, `gap: 20px`, A má `flex: 1 1 60px`, B má `flex: 2 1 80px`. Jak široká bude B?
--option-- 267 px
--option*-- 240 px
--option-- 253 px
--why-- Nejdřív se od šířky odečtou startovní velikosti **i mezera**: 400 − 60 − 80 − 20 = 240 px volného místa. Tři díly po 80 px, B dostane dva: 80 + 160 = 240 px, A 60 + 80 = 140 px. 267 px vyjde, když se v poměru 1 : 2 dělí celá šířka; 253 px, když zapomeneš na `gap`.
--see-- css-flexbox/flex-do-hloubky#rust-v-cislech
:::

:::check
Kontejner je široký 700 px, bez mezer. Položka X má `flex: 1 1 100px`, položka Y má `flex: 1 1 300px`. Jak široká bude Y?

### --expected--
450

### --accept--
450 px
450px

### --why--
Volné místo je 700 − 400 = 300 px a obě položky mají stejný `flex-grow`, takže každá dostane 150 px. Y: 300 + 150 = 450 px, X: 100 + 150 = 250 px. Stejné `flex-grow` neznamená stejnou šířku.
:::

## Zmenšování v číslech

Nejdřív kontrast. Obě ukázky mají stejné krabičky se `width: 2000px`, liší se jen tím, jestli je rodič flex kontejner:

:::compare
```html
<div class="wrap">
  <div class="box">Krabička 2000 px</div>
  <div class="box">Druhá</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.wrap {
  width: 300px;
  outline: 2px dashed #94a3b8;
}

.box {
  width: 2000px;
  padding: 0.5rem;
  background: #fde68a;
  border: 1px solid #b45309;
}
```
--variant-- Normální tok
```css
.wrap { display: block; }
```
--variant-- Flexbox
```css
.wrap { display: flex; }
```
:::

V normálním toku je `width` zákon: krabička je 2000 px široká a vyleze daleko z rámečku. Ve flexu je `width` jen **výchozí velikost** (`flex-basis: auto` si ji vezme) a výchozí `flex-shrink: 1` krabičky zmenší, aby se vešly.

Kolik komu ubrat? Kontejner je široký **300 px**. Položky:

| položka | `flex` | basis | shrink |
|---|---|---|---|
| A | `0 1 300px` | 300 | 1 |
| B | `0 1 200px` | 200 | 1 |

1. Součet basis: 300 + 200 = 500 px.
2. Chybí: 500 − 300 = 200 px.
3. Tady je rozdíl oproti růstu: ubírání se nedělí podle samotného `flex-shrink`, ale podle **`flex-shrink` × basis**. Váhy: A = 1 × 300 = 300, B = 1 × 200 = 200, celkem 500.
4. A ztratí 200 × 300/500 = 120 → **180 px**. B ztratí 200 × 200/500 = 80 → **120 px**.

Obě položky se zmenšily na 60 % své výchozí velikosti. Kdyby se ubíralo rovným dílem (po 100 px), malé položky by mizely mnohem rychleji než velké.

:::live predict
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
  width: 360px;
  outline: 2px dashed #94a3b8;
}

.item {
  box-sizing: border-box;
  padding: 0.75rem 0;
  text-align: center;
  color: white;
  font-size: 0.875rem;
}

.a { flex: 0 1 300px; background: #c2410c; }
.b { flex: 0 1 100px; background: #6d28d9; }
```
```js
// Průběžně vypisuje do každé položky její skutečnou šířku.
function showWidths() {
  for (const item of document.querySelectorAll('.item')) {
    const text = `${Math.round(item.getBoundingClientRect().width)} px`;
    const label = item.querySelector('.width');
    if (label.textContent !== text) label.textContent = text;
  }
  requestAnimationFrame(showWidths);
}

showWidths();
```
--question-- Kontejner 360 px, A má `flex: 0 1 300px`, B má `flex: 0 1 100px`. Jak široká bude A?
--option-- 280 px
--option*-- 270 px
--option-- 260 px
--why-- Chybí 400 − 360 = 40 px. Váhy jsou 1 × 300 a 1 × 100, A tedy nese tři čtvrtiny ztráty: 30 px → 270 px, B ztratí 10 px → 90 px. 280 px by vyšlo při ubírání rovným dílem, 260 px kdyby se zmenšovala jen větší položka.
--see-- css-flexbox/flex-do-hloubky#zmensovani-v-cislech
:::

Po odkrytí zkus dát B `flex: 0 3 100px`: váhy budou 300 a 300, obě položky ztratí po 20 px. Pak vrať B na `flex: 0 1 100px` a A přepni na `flex: 0 0 300px`: A se nezmenší vůbec a B musí vzít celou ztrátu 40 px.

:::check
Kontejner je široký 450 px. Položka A má `flex: 0 1 400px`, položka B má `flex: 0 1 100px`. O kolik pixelů se zmenší A?

### --expected--
40

### --accept--
40 px
40px

### --why--
Chybí 500 − 450 = 50 px. Váhy jsou 400 a 100, A tedy nese 400/500 = 80 % ztráty, tedy 40 px (na 360 px). B ztratí 10 px (na 90 px). Obě přijdou o 10 % své velikosti.
:::

## Zkratka `flex` a její výchozí hodnoty

Když zkratku `flex` napíšeš jen s jedním slovem nebo číslem, doplní se zbytek hodnotami, které se liší od výchozích hodnot jednotlivých vlastností:

| zápis | znamená | chování |
|---|---|---|
| (nic) | `0 1 auto` | velikost podle obsahu, neroste, smí se zmenšit |
| `flex: 1` | `1 1 0%` | basis **nula** → celé místo se dělí podle grow, obsah nehraje roli |
| `flex: auto` | `1 1 auto` | roste z velikosti obsahu → delší obsah, širší položka |
| `flex: none` | `0 0 auto` | přesně podle obsahu, nemění se |

:::live predict
```html
<div class="actions">
  <button class="action">OK</button>
  <button class="action">Zrušit objednávku</button>
</div>
<p class="widths">OK: <span class="width"></span> · Zrušit objednávku: <span class="width"></span></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.actions {
  display: flex;
  width: 400px;
  outline: 2px dashed #94a3b8;
}

.action {
  flex: 1;
  padding: 0.5rem;
  font: inherit;
}
```
```js
// Průběžně vypisuje skutečné šířky obou tlačítek.
function showWidths() {
  const buttons = document.querySelectorAll('.action');
  document.querySelectorAll('.width').forEach((label, i) => {
    const text = `${Math.round(buttons[i].getBoundingClientRect().width)} px`;
    if (label.textContent !== text) label.textContent = text;
  });
  requestAnimationFrame(showWidths);
}

showWidths();
```
--question-- Obě tlačítka mají `flex: 1`, kontejner je široký 400 px. Jak široké bude tlačítko „OK"?
--option*-- 200 px, stejně jako druhé tlačítko.
--option-- Užší než 200 px, protože má kratší text.
--option-- Tak široké jako jeho text, protože `flex: 1` jen povoluje růst.
--why-- `flex: 1` znamená `1 1 0%`: obě tlačítka startují z nuly, celých 400 px je volné místo a stejné `flex-grow` ho rozdělí napůl. Délka textu nerozhoduje. Přepiš `flex: 1` na `flex: auto` — tlačítka pak startují ze šířky textu a delší text dostane i širší tlačítko.
--see-- css-flexbox/flex-do-hloubky#zkratka-flex-a-jeji-vychozi-hodnoty
:::

:::check
Rozepiš `flex: auto` do tří hodnot v pořadí grow, shrink, basis.

### --expected--
1 1 auto

### --accept--
flex: 1 1 auto

### --why--
`auto` = roste (`1`), smí se zmenšit (`1`) a startuje z velikosti obsahu (`auto`). Na rozdíl od `flex: 1` tedy obsah rozhoduje, jak široká položka bude.
:::

## Proč se položka nezmenší: `min-width: auto`

Tohle je nejčastější past ve flexboxu. Flex položka má výchozí **`min-width: auto`**, což pro ni znamená: *nezmenšuj mě pod* [[nejmenší šířka obsahu|nejmenší šířku mého obsahu]] (*min-content*). Nejmenší šířka obsahu je:

- u běžného textu šířka **nejdelšího slova**,
- u textu s `white-space: nowrap` šířka **celého textu**,
- u obrázku jeho šířka, u `<pre>` nejdelší řádek kódu, u tabulky součet nejužších sloupců.

`flex-shrink` pak může říkat, co chce — zmenšování se zastaví na `min-width`. Výsledek: položka přeteče z kontejneru, rozbije sousedy nebo roztáhne celou stránku do šířky.

Příklad z praxe, řádek se souborem ke stažení. Přepínač mění `min-width` u `.file__info`:

:::live
```html
<div class="file">
  <span class="file__icon">PDF</span>
  <div class="file__info">
    <strong class="file__name">vyuctovani-cerven-2026-final.pdf</strong>
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
  width: 240px;
  padding: 0.5rem;
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
}

.file__icon {
  flex: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #b91c1c;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}

.file__info {
  flex: 1 1 auto;
  min-width: var(--info-min);
}

.file__name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
```controls
--info-min: toggle(auto, 0) = auto | min-width u .file__info
```
:::

S `auto` vyčuhuje tlačítko „Stáhnout" z rámečku, přestože název má `overflow: hidden` a `text-overflow: ellipsis`. Flex položkou tu totiž není název, nýbrž `.file__info` — a její minimum je šířka celého nezalomitelného názvu. Přepni na `0`: položka se smí zmenšit, název se ořízne třemi tečkami a tlačítko se vrátí dovnitř.

> [!NOTE]
> Když má **přímo flex položka** `overflow: hidden` (nebo `auto`, `scroll`), automatické minimum je nula a položka se zmenší i bez `min-width: 0`. Nespoléhej na to — `overflow: hidden` bývá uvnitř, na nadpisu nebo odstavci, a někdy ořezávat nechceš vůbec.

> [!REMEMBER]
> **Když se má flex položka zmenšit pod svůj obsah, napiš jí `min-width: 0`** (ve sloupci `min-height: 0`). Patří na flex položku, ne na prvek uvnitř ní.

:::explain
Vysvětli vlastními slovy, proč se flex položka s dlouhým nezalomitelným textem nezmenší, i když má `flex-shrink: 1`, a proč pomůže právě `min-width: 0`.

## --model--
Flex položka má výchozí `min-width: auto`, a to ve flexboxu znamená, že se nesmí zmenšit pod nejmenší šířku svého obsahu. U textu, který se nedá zalomit, je to šířka celého textu. `flex-shrink` položku zmenšuje jen do té hranice, takže položka přeteče. `min-width: 0` hranici zruší a položka se zmenší podle `flex-shrink`; obsah uvnitř se pak může oříznout nebo zalomit.

## --checklist--
- Flex položka má výchozí `min-width: auto`.
- `auto` znamená „ne pod nejmenší šířku obsahu" (min-content).
- `flex-shrink` zmenšuje jen do hranice `min-width`.
- `min-width: 0` patří na flex položku, ne na text uvnitř.
:::

:::check
Flex položka `.code` obsahuje `<pre>` s dlouhým řádkem kódu a rozšiřuje celou stránku do strany. Napiš deklaraci, kterou dáš `.code`, aby se smělo zmenšit.

### --expected--
min-width: 0

### --accept--
min-width: 0px

### --why--
Nejmenší šířka obsahu `<pre>` je nejdelší řádek kódu a výchozí `min-width: auto` nedovolí `.code` jít pod ni. `min-width: 0` hranici zruší; aby se kód dal posouvat, přidá se k tomu na `<pre>` obvykle `overflow-x: auto`.
:::

## Flexbox, nebo grid?

Flexbox rozvrhuje **v jedné ose**. Položky se řadí za sebou a každý řádek (při `flex-wrap`) si počítá místo sám, nezávisle na ostatních řádcích. Grid rozvrhuje **ve dvou osách najednou** — řádky i sloupce tvoří mřížku a položky v různých řádcích se srovnají pod sebe.

| situace | vhodnější | proč |
|---|---|---|
| hlavička, lišta nástrojů, řádek formuláře | flexbox | jedna řada prvků různé šířky |
| vnitřek karty (obrázek, text, patička u dna) | flexbox | jeden sloupec s automatickým marginem |
| štítky, které se zalamují | flexbox | velikost určuje obsah |
| mřížka produktů se sloupci pod sebou | grid | sloupce mají být srovnané přes všechny řádky |
| kostra stránky (hlavička, boční panel, obsah) | grid | dvourozměrné rozvržení |

> [!TIP]
> Vodítko do praxe: **když rozhoduje obsah, kolik místa si položka vezme, je to práce pro flexbox. Když rozhoduje rozvržení, kam položka patří, je to práce pro grid.**

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
  width: 340px;
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

Ve flexboxu jsou položky 4 a 5 na druhém řádku roztažené na polovinu šířky, protože si dělí volné místo svého řádku. V gridu zůstávají ve sloupcích pod položkami 1 a 2. Zkus změnit `width` seznamu na `250px`. Grid podrobně probírá samostatná sekce CSS Grid; teď stačí vědět, že existuje a kdy ho použít.

:::check
Galerie fotek: fotky mají stát v přesných sloupcích, i na posledním neúplném řádku. Napiš hodnotu vlastnosti `display`, kterou zvolíš pro kontejner galerie.

### --expected--
grid

### --why--
Srovnání do sloupců přes všechny řádky je rozvržení ve dvou osách. Flexbox by každý řádek počítal zvlášť a fotky na posledním řádku by se roztáhly jinak.
:::

## Typické chyby a pasti

> [!PITFALL] `flex: 1` tam, kde má rozhodovat obsah
> *Příznak:* tlačítka „OK" a „Zrušit objednávku" jsou stejně široká a delší text se láme na dva řádky.
>
> *Oprava:* `flex: 1` nastaví basis na nulu. Když má šířku určovat text, použij `flex: auto` (`1 1 auto`).

> [!PITFALL] `flex-grow: 2` není „dvakrát širší"
> *Příznak:* položka s `flex-grow: 2` je jen o kus širší než sousedka s `1`.
>
> *Oprava:* grow dělí jen volné místo. Dvojnásobnou šířku dostaneš jen s basis `0` (`flex: 2` vs. `flex: 1`) a bez `padding` a rámečků, které se přičítají zvlášť.

> [!PITFALL] Položka, která se odmítá zmenšit
> *Příznak:* dlouhý e-mail, URL, `<pre>` nebo nadpis s `nowrap` vytlačí sousedy z kontejneru, i když má položka `flex-shrink: 1`.
>
> *Oprava:* `min-width: 0` na flex položce (a podle potřeby `overflow-wrap: anywhere` nebo oříznutí textu uvnitř).

> [!PITFALL] `width` vedle `flex-basis`
> *Příznak:* `.card { flex: 1; width: 15rem; }` a karty jsou užší než 15rem — `width` jako by neexistovala.
>
> *Oprava:* když `flex-basis` není `auto`, `width` se pro výchozí velikost ignoruje. Rozhodni se pro jedno, ve flexboxu pro `flex-basis`: `flex: 1 1 15rem`.

> [!PITFALL] Mřížka z flexboxu
> *Příznak:* karty v posledním neúplném řádku jsou širší než karty nad nimi a nesedí ve sloupcích.
>
> *Oprava:* když se položky v různých řádcích mají srovnat do sloupců, použij grid a nelaď flexbox procenty.

:::check
Kolega napsal `.card { flex: 1; width: 15rem; }` a karty v řadě se smrskly pod 15rem, místo aby se zalomily. Proč?

### --answer--
Protože `width` ve flex kontejneru nefunguje nikdy.

#### --why--
`width` ve flexu funguje — když má položka `flex-basis: auto`, vezme se právě z ní. Problém je v tom, co s basis udělal zápis `flex: 1`.

### --correct--
Protože `flex: 1` nastaví `flex-basis` na `0%` a ta má před `width` přednost.

#### --why--
Výchozí velikost položky je `flex-basis`; `width` se použije jen při `flex-basis: auto`. S basis nula karty startují z nuly, vejdou se všechny do řádku a volné místo si rozdělí. Pomůže `flex: 1 1 15rem`.

### --answer--
Protože chybí `min-width: 0`.

#### --why--
`min-width: 0` dovoluje zmenšit se **pod** obsah, karty by tím byly spíš ještě užší. Tady je potíž ve startovní velikosti.
:::

## Kde to najdeš v MDN

- [Controlling ratios of flex items along the main axis](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Controlling_ratios_of_flex_items_along_the_main_axis) — přesný výpočet růstu a zmenšování, včetně vah `flex-shrink` × basis.
- [`flex`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) — všechny tvary zkratky a jak se doplňují chybějící hodnoty (`flex: 1` → `1 1 0%`).
- [`min-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width) — hodnota `auto` a její zvláštní význam u flex položek.
- [Relationship of flexbox to other layout methods](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Relationship_of_flexbox_to_other_layout_methods) — kdy flexbox a kdy grid.

# --questions--

## --question--

Kontejner je široký 600 px, bez `gap`. Položka X má `flex: 1 1 100px`, položka Y má `flex: 3 1 100px`. Jak široká bude Y?

### --expected--

400

### --accept--

400 px
400px

### --why--

Součet basis je 200 px, volné místo 400 px. Dílů jsou 4, jeden díl je 100 px. Y dostane 3 díly: 100 + 300 = 400 px, X dostane 100 + 100 = 200 px. Kdo napsal 450 px, dělil v poměru 1 : 3 celou šířku.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --question--

Kontejner je široký 300 px, bez `gap`. Položka A má `flex: 0 0 200px`, položka B má `flex: 0 1 200px`, obě s krátkým textem. Jak široká bude B?

### --expected--

100

### --accept--

100 px
100px

### --why--

Chybí 100 px. A má `flex-shrink: 0`, její váha je nula, takže celou ztrátu nese B: 200 − 100 = 100 px. Krátký text B nezastaví, jeho nejmenší šířka je malá.

### --see--

css-flexbox/flex-do-hloubky#zmensovani-v-cislech

## --question--

V řádku je `<span class="email">jan.novak.velmi.dlouha.adresa@priklad.cz</span>` s `flex: 1 1 auto` a vedle něj tlačítko. Na úzké obrazovce tlačítko vyčuhuje z kontejneru. Co je nejpravděpodobnější příčina?

### --correct--

Položka má výchozí `min-width: auto` a e-mail nejde zalomit, takže se nezmenší pod jeho šířku.

#### --why--

Minimum flex položky je nejmenší šířka jejího obsahu. E-mail je jedno dlouhé „slovo", takže položka se zastaví na jeho šířce a tlačítko vytlačí ven. Pomůže `min-width: 0` (a třeba `overflow-wrap: anywhere`).

### --answer--

Chybí `flex-shrink: 1`.

#### --why--

`flex-shrink: 1` je výchozí hodnota a v zápisu `flex: 1 1 auto` je navíc napsaná. Zmenšování zastavuje něco jiného než malý `flex-shrink`.

### --answer--

Chybí `flex-wrap: wrap` na tlačítku.

#### --why--

`flex-wrap` patří na kontejner, ne na položku. A i se zalomením by e-mail přetekl, kdyby byl širší než celý kontejner.

### --see--

css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

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

### --see--

css-flexbox/flex-do-hloubky#flexbox-nebo-grid
