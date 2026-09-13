## --card-- css

Napiš deklaraci pro flex kontejner, která položkám, jež se nevejdou do řádku, dovolí přejít na další řádek.

### --expected--

```css
flex-wrap: wrap;
```

### --accept--

```css
flex-flow: row wrap;
```

### --why--

Ve výchozím stavu `nowrap` drží kontejner všechno v jednom řádku a položky raději zmenší nebo nechá přetéct.

### --see--

css-flexbox/uvod-do-flexboxu#zalamovani-flex-wrap-gap-a-align-content

## --card-- css

Kontejner má `flex-direction: column` a výšku 400 px. Napiš deklaraci pro kontejner, která celou skupinu položek posune **ke spodnímu okraji**.

### --expected--

```css
justify-content: flex-end;
```

### --accept--

```css
justify-content: end;
```

### --why--

Ve sloupci vede hlavní osa shora dolů a volné místo na ní rozděluje `justify-content`. `align-items: flex-end` by položky posunul k pravému okraji, protože vedlejší osa je ve sloupci vodorovná.

### --see--

css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

## --card-- css

V řádkové liště `display: flex` má jedna položka odjet k pravému okraji a vzít s sebou všechny položky za ní. Napiš deklaraci pro tu položku.

### --expected--

```css
margin-inline-start: auto;
```

### --accept--

```css
margin-left: auto;
```

### --why--

Automatický margin sežere na své straně všechno volné místo v řádku, takže položku (a ty za ní) odtlačí doprava.

### --see--

css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou

## --card-- css

Flex položka obsahuje dlouhou URL, která nejde zalomit, a vytlačuje sousedy z řádku. Napiš deklaraci pro tu položku, aby se směla zmenšit pod šířku obsahu.

### --expected--

```css
min-width: 0;
```

### --accept--

```css
min-width: 0px;
```

### --why--

Výchozí `min-width: auto` nepustí flex položku pod nejmenší šířku jejího obsahu. Nula tu hranici zruší.

### --see--

css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

## --card-- css

Logo v hlavičce se na úzké obrazovce láme na dva řádky, protože ho flexbox zmenšuje spolu s ostatními položkami. Napiš deklaraci pro logo, aby se nezmenšovalo.

### --expected--

```css
flex-shrink: 0;
```

### --accept--

```css
flex: none;
```

```css
flex: 0 0 auto;
```

### --why--

`flex-shrink` říká, jakým dílem se položka podílí na zmenšování. Nula znamená „mě nezmenšuj".

### --see--

css-flexbox/workshop-navigace/008

## --card-- css

Napiš zkratku `flex` pro kartu, která roste do volného místa, smí se zmenšit a startuje na šířce `15rem`.

### --expected--

```css
flex: 1 1 15rem;
```

### --accept--

```css
flex: 1 1 240px;
```

### --why--

Pořadí je grow, shrink, basis. Všechna tři čísla píšeš proto, že kratší zápisy doplňují nečekané hodnoty (`flex: 1` nastaví basis na nulu).

### --see--

css-flexbox/workshop-navigace/016

## --card-- css

Ve sloupcové kartě jsou všechny položky přes celou šířku. Štítek má být jen tak široký jako jeho text a zůstat vlevo, ostatní položky se nemají změnit. Napiš deklaraci pro štítek.

### --expected--

```css
align-self: flex-start;
```

### --accept--

```css
align-self: start;
```

```css
margin-inline-end: auto;
```

```css
margin-right: auto;
```

### --why--

`align-self` přepíše výchozí `align-items: stretch` jen pro jednu položku. `align-items` na kartě by zúžilo všechny.

### --see--

css-flexbox/workshop-navigace/020

## --card-- css

Karta je `display: flex; flex-direction: column;`. Napiš deklaraci pro patičku karty, která ji přitlačí ke spodnímu okraji.

### --expected--

```css
margin-block-start: auto;
```

### --accept--

```css
margin-top: auto;
```

### --why--

Ve sloupci je volné místo pod obsahem. Automatický margin nad patičkou si ho vezme celé a patičku odsune dolů.

### --see--

css-flexbox/workshop-navigace/021

## --card-- output

Kontejner je široký 600 px, bez `gap`. Položka A má `flex: 1 1 100px`, položka B má `flex: 2 1 200px`. Kolik pixelů bude široká B?

### --expected--

400

### --accept--

400 px
400px

### --why--

Volné místo je 600 − 300 = 300 px, dílů jsou 3 po 100 px. B dostane dva: 200 + 200 = 400 px. `flex-grow` dělí jen volné místo, ne celou šířku.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --card-- output

Kontejner je široký 400 px a má `gap: 20px`. Jsou v něm tři položky s `flex: 1 1 0`. Kolik pixelů bude široká každá položka?

### --expected--

120

### --accept--

120 px
120px

### --why--

Dvě mezery zaberou 40 px, zbylých 360 px je volné místo, protože položky startují z nuly. Stejné `flex-grow` ho rozdělí na třetiny.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --card-- output

Kontejner je široký 300 px. Položka A má `flex: 0 1 300px`, položka B má `flex: 0 1 100px`. Kolik pixelů bude široká A?

### --expected--

225

### --accept--

225 px
225px

### --why--

Chybí 100 px. Ubírá se podle `flex-shrink` × basis, tedy v poměru 300 : 100. A nese tři čtvrtiny ztráty (75 px), B jednu čtvrtinu (25 px).

### --see--

css-flexbox/flex-do-hloubky#zmensovani-v-cislech

## --card-- output

Rozepiš `flex: 1` do tří hodnot v pořadí grow, shrink, basis.

### --expected--

1 1 0%

### --accept--

1 1 0
1 1 0px

### --why--

Jedno číslo ve zkratce je `flex-grow` a basis se doplní na nulu. Proto jsou položky s `flex: 1` stejně široké bez ohledu na obsah a `width` vedle toho přestane platit.

### --see--

css-flexbox/flex-do-hloubky#zkratka-flex-a-jeji-vychozi-hodnoty

## --card-- output

Kontejner je široký 700 px (bez paddingu a `gap`), má `justify-content: space-between` a čtyři položky po 100 px. Kolik pixelů je mezi dvěma sousedními položkami?

### --expected--

100

### --accept--

100 px
100px

### --why--

Volné místo je 700 − 400 = 300 px. `space-between` ho rozdělí jen mezi položky: tři mezery po 100 px, na krajích nic.

### --see--

css-flexbox/uvod-do-flexboxu#justify-content-volne-misto-na-hlavni-ose

## --card-- output

Kontejner v řádku je vysoký 80 px a má `align-items: flex-end`. Položka v něm je vysoká 30 px. Kolik pixelů je mezi horním okrajem kontejneru a položkou?

### --expected--

50

### --accept--

50 px
50px

### --why--

V řádku je vedlejší osa svislá a `flex-end` dá položku na její konec, dolů. Nad ní zůstane celé volné místo 80 − 30 = 50 px.

### --see--

css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose

## --card-- output

Kolik flex položek má `.menu`?

```html
<ul class="menu">
  <li>Domů</li>
  <li>
    Produkty
    <ul>
      <li>Boty</li>
      <li>Batohy</li>
    </ul>
  </li>
  <li>Kontakt</li>
</ul>
```

```css
.menu { display: flex; }
```

### --expected--

3

### --why--

Flex položkami jsou jen přímí potomci kontejneru: tři `<li>`. „Boty" a „Batohy" jsou vnoučata a řídí se normálním tokem ve vnořeném seznamu.

### --see--

css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky

## --card-- output

Kontejner má `display: flex; flex-direction: column; height: 300px; justify-content: center;`. Jeho položky jsou dohromady vysoké 200 px. Kolik pixelů je nad první položkou?

### --expected--

50

### --accept--

50 px
50px

### --why--

Ve sloupci vede hlavní osa shora dolů a `justify-content: center` rozdělí volné místo 100 px napůl nad a pod skupinu položek.

### --see--

css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

## --card-- code js

Napiš funkci `growWidths(containerWidth, items)`, která spočítá šířky flex položek tak jako prohlížeč, když volné místo **zbývá** (bez `gap`). Každá položka je objekt `{ basis, grow }`. Funkce vrátí pole šířek ve stejném pořadí.

### --seed--

```js
/**
 * @param {number} containerWidth  šířka kontejneru v px
 * @param {{ basis: number, grow: number }[]} items
 * @returns {number[]} šířky položek v px
 */
function growWidths(containerWidth, items) {
}
```

### --test--

```js
assert.deepEqual(growWidths(400, [{ basis: 50, grow: 1 }, { basis: 100, grow: 1 }, { basis: 50, grow: 2 }]), [100, 150, 150], 'growWidths(400, A 50/1, B 100/1, C 50/2) má vrátit [100, 150, 150]');
assert.deepEqual(growWidths(700, [{ basis: 100, grow: 1 }, { basis: 300, grow: 1 }]), [250, 450], 'growWidths(700, X 100/1, Y 300/1) má vrátit [250, 450] — stejný grow neznamená stejnou šířku');
assert.deepEqual(growWidths(500, [{ basis: 100, grow: 0 }, { basis: 200, grow: 0 }]), [100, 200], 'growWidths(500, obě s grow 0) má vrátit výchozí velikosti [100, 200]');
```

### --solution--

```js
/**
 * @param {number} containerWidth  šířka kontejneru v px
 * @param {{ basis: number, grow: number }[]} items
 * @returns {number[]} šířky položek v px
 */
function growWidths(containerWidth, items) {
  let basisSum = 0;
  let growSum = 0;
  for (const item of items) {
    basisSum += item.basis;
    growSum += item.grow;
  }
  const freeSpace = containerWidth - basisSum;
  const widths = [];
  for (const item of items) {
    const share = growSum > 0 ? (freeSpace * item.grow) / growSum : 0;
    widths.push(item.basis + share);
  }
  return widths;
}
```

### --why--

Nejdřív se od kontejneru odečte součet výchozích velikostí, teprve zbytek se dělí podle `grow`. Když je součet `grow` nula, volné místo nedostane nikdo.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --card-- free

Proč `display: flex` na hlavičce nepostaví vedle sebe odkazy, které leží v `<nav>` uvnitř hlavičky? Jak to opravíš?

### --back--

Flex kontejner rozvrhuje jen své přímé potomky. Přímí potomci hlavičky jsou třeba logo, `<nav>` a tlačítko; odkazy jsou až uvnitř `<nav>` (často ještě v `<ul>`), takže se jich flex hlavičky netýká. Oprava je dát `display: flex` rodiči odkazů, tedy seznamu nebo `<nav>`. Jeden prvek pak může být položkou hlavičky a zároveň kontejnerem pro své děti.

### --see--

css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky

## --card-- free

Jaký je rozdíl mezi `justify-content` a `align-items`? Co se s nimi stane po `flex-direction: column`?

### --back--

`justify-content` rozděluje volné místo na hlavní ose, `align-items` zarovnává položky na vedlejší ose. V řádku je hlavní osa vodorovná, takže `justify-content` pracuje vodorovně a `align-items` svisle. `flex-direction: column` otočí hlavní osu shora dolů, takže role se prohodí: `justify-content` pak posouvá svisle a vodorovně centruje `align-items`.

### --see--

css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

## --card-- free

Proč položka s `flex-grow: 2` není dvakrát širší než sousedka s `flex-grow: 1`?

### --back--

`flex-grow` nedělí celou šířku kontejneru, ale jen volné místo, které zbude po odečtení výchozích velikostí (`flex-basis`) a mezer. Položka s dvojkou dostane dvakrát víc **volného místa**, jenže k němu se přičítá její vlastní basis. Dvojnásobnou šířku dostaneš jen tehdy, když obě položky startují z nuly (`flex: 2` a `flex: 1`) a nemají padding ani rámečky.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --card-- free

Flex položka s dlouhou URL se nezmenší, i když má `flex-shrink: 1`, a vytlačí sousedy z kontejneru. Proč a jak to opravíš?

### --back--

Flex položka má výchozí `min-width: auto`, což znamená, že se nesmí zmenšit pod nejmenší šířku svého obsahu. URL je jedno dlouhé „slovo", takže minimum je šířka celé URL a `flex-shrink` zmenšuje jen do té hranice. Opravím to `min-width: 0` na flex položce (ne na textu uvnitř) a podle potřeby přidám `overflow-wrap: anywhere` nebo oříznutí třemi tečkami.

### --see--

css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

## --card-- free

Jaký je rozdíl mezi `flex: 1` a `flex: auto`? Kdy použiješ který?

### --back--

`flex: 1` je `1 1 0%`: položky startují z nuly a celou šířku si dělí podle `flex-grow`, takže jsou stejně široké bez ohledu na obsah — hodí se pro sloupce nebo tlačítka stejné šířky. `flex: auto` je `1 1 auto`: položky startují ze své šířky (obsahu nebo `width`) a teprve pak rostou, takže delší obsah dostane víc místa — hodí se, když má rozhodovat obsah. Pozor, `flex: 1` tiše zruší `width`.

### --see--

css-flexbox/flex-do-hloubky#zkratka-flex-a-jeji-vychozi-hodnoty

## --card-- free

Proč je vlastnost `order` riskantní z hlediska přístupnosti? Co uděláš místo ní?

### --back--

`order` mění jen vizuální pořadí položek. Čtečka obrazovky i klávesa Tab jdou dál podle pořadí v HTML, takže když se vizuální pořadí a kód rozejdou, fokus skáče po stránce a obsah se čte jinak, než vypadá. `order` proto používám jen na drobné přeskupení, u kterého pořadí nemění smysl; když se má pořadí změnit doopravdy, přesunu prvky v HTML.

### --see--

css-flexbox/uvod-do-flexboxu#typicke-chyby-a-pasti

## --card-- free

Kdy sáhneš po flexboxu a kdy po gridu? Uveď příklad pro každý.

### --back--

Flexbox rozvrhuje v jedné ose a velikost položek určuje hlavně obsah — hlavička s logem a navigací, lišta nástrojů, zalamované štítky nebo vnitřek karty s patičkou u dna. Grid rozvrhuje ve dvou osách najednou, sloupce platí pro všechny řádky — mřížka produktů, kde mají karty i na posledním řádku stát ve sloupcích, nebo kostra stránky s bočním panelem. Typický příznak špatné volby: poslední neúplný řádek flexboxu se roztáhne jinak než řádky nad ním.

### --see--

css-flexbox/flex-do-hloubky#flexbox-nebo-grid

## --card-- free

Jak funguje automatický margin ve flex kontejneru a proč s ním přestane fungovat `justify-content`?

### --back--

Margin s hodnotou `auto` na flex položce si vezme všechno volné místo na své straně, takže položku odtlačí od ostatních — třeba tlačítko k pravému okraji hlavičky nebo patičku ke dnu karty. Volné místo se rozděluje mezi automatické marginy dřív, než se uplatní `justify-content`. Protože ho margin spotřebuje celé, `justify-content` už nemá co rozdělovat a nic nedělá.

### --see--

css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou
