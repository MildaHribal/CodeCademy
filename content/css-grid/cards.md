## --card-- css

Stránka dokumentace má vlevo obsah kapitol široký podle nejdelšího odkazu a vpravo článek, ve kterém jsou široké tabulky s vlastním posuvníkem. Napiš deklaraci `grid-template-columns` pro kontejner, se kterou tabulka nikdy neroztáhne sloupec článku.

### --expected--

```css
grid-template-columns: auto minmax(0, 1fr);
```

### --accept--

```css
grid-template-columns: auto minmax(0px, 1fr);
```

### --why--

Samotné `1fr` má minimum `auto`, tedy nejmenší šířku obsahu, a nezalomitelná tabulka by sloupec roztáhla. S minimem `0` drží sloupec šířku ze zbylého místa a posouvá se jen obal tabulky.

### --see--

css-grid/uvod-do-gridu#typicke-chyby-a-pasti

## --card-- css

V mřížce produktů je pruh „Doprava zdarma" a má vést přes celý řádek, ať se na různých šířkách vejde sloupců kolik chce. Napiš deklaraci pro pruh.

### --expected--

```css
grid-column: 1 / -1;
```

### --why--

`-1` je vždycky poslední čára explicitní mřížky, i u `auto-fill`, kde se počet sloupců mění. Pevné `1 / 4` by na jiné šířce vedlo přes špatný počet sloupců.

### --see--

css-grid/uvod-do-gridu#umisteni-podle-car-grid-column-grid-row-a-span

## --card-- output

Mřížka má `grid-template-columns: repeat(2, 1fr); grid-template-rows: 120px; grid-auto-rows: 60px;` a šest položek, `gap: 0`. Jak vysoká bude celá mřížka v pixelech?

### --expected--

240

### --accept--

240 px
240px

### --why--

Vypsaný je jen první řádek (120 px). Zbylé dva řádky vzniknou samy, takže je řídí `grid-auto-rows`: 120 + 60 + 60 = 240 px.

### --see--

css-grid/uvod-do-gridu#explicitni-a-implicitni-mrizka

## --card-- css

Tři dlaždice statistik („Objednávky", „Tržby", „Zákazníci") mají vždycky vyplnit celý řádek, i když by se jich vešlo pět. Sloupec má být aspoň 10rem široký a na úzkém telefonu nic nesmí přetéct. Napiš deklaraci `grid-template-columns`.

### --expected--

```css
grid-template-columns: repeat(auto-fit, minmax(min(10rem, 100%), 1fr));
```

### --why--

`auto-fit` sbalí prázdné sloupce, takže tři dlaždice zaberou celou šířku. `min(10rem, 100%)` sníží minimum na šířku kontejneru, když je užší než 10rem, a `1fr` rozdělí zbylé místo.

### --see--

css-grid/mrizka-bez-media-queries#auto-fill-nebo-auto-fit

## --card-- css

Kontejner prázdného stavu („Zatím nemáš žádné objednávky") už má `display: grid`. Napiš jednu deklaraci pro kontejner, která obsah vycentruje vodorovně i svisle.

### --expected--

```css
place-items: center;
```

### --accept--

```css
place-items: center center;
```

### --why--

`place-items` s jednou hodnotou nastaví `align-items` i `justify-items`. V gridu se osy neotáčejí, takže to platí vždycky.

### --see--

css-grid/uvod-do-gridu#zarovnani-v-bunce

## --card-- css

Karta pobytu má `display: grid; grid-row: span 3;` a její tři části se mají srovnat s částmi karet vedle. Napiš deklaraci, se kterou karta převezme řádky rodičovské mřížky.

### --expected--

```css
grid-template-rows: subgrid;
```

### --why--

Hodnota `subgrid` nevytvoří vlastní řádky, ale použije ty, přes které karta vede v rodiči. Výšku řádku pak určuje nejvyšší část napříč kartami.

### --see--

css-grid/mrizka-bez-media-queries#karty-zarovnane-napric-subgrid

## --card-- css

Stránka přihlášení je grid s hlavičkou, formulářem a patičkou a má aspoň výšku okna. Napiš šablonu řádků, se kterou patička zůstane dole a formulář dostane zbylé místo.

### --expected--

```css
grid-template-rows: auto 1fr auto;
```

### --why--

Krajní řádky podle obsahu, prostřední `1fr` si vezme volné místo. Bez vypsaných řádků by se místo rozdělilo mezi všechny tři a hlavička by se nafoukla.

### --see--

css-grid/grid-nebo-flex#pancake-hlavicka-obsah-a-paticka

## --card-- css

Webová stránka má být aspoň tak vysoká jako okno, i na telefonu s lištou prohlížeče, a s dlouhým obsahem normálně narůst. Napiš deklaraci pro obal stránky.

### --expected--

```css
min-block-size: 100dvh;
```

### --accept--

```css
min-height: 100dvh;
```

### --why--

Minimální výška nechá dlouhý obsah narůst. Pevné `block-size: 100dvh` patří jen aplikaci s posuvným obsahem uvnitř — jinak dlouhý obsah vyteče z obalu, který je vysoký přesně jako okno.

### --see--

css-grid/grid-nebo-flex#pancake-hlavicka-obsah-a-paticka

## --card-- css

Dekorativní moodboard s fotkami přes jeden a dva sloupce má díry. Pořadí fotek nic neznamená. Napiš deklaraci pro kontejner, která díry zaplní pozdějšími fotkami.

### --expected--

```css
grid-auto-flow: dense;
```

### --accept--

```css
grid-auto-flow: row dense;
```

### --why--

`dense` se pro každou položku vrátí k první volné buňce, do které se vejde. Mění tím vizuální pořadí proti HTML, proto jen tam, kde pořadí nenese význam.

### --see--

css-grid/mrizka-bez-media-queries#polozky-pres-vic-sloupcu-a-dense

## --card-- output

Kontejner je široký 900 px a má `grid-template-columns: repeat(3, 1fr); gap: 30px;`. Kolik pixelů má jeden sloupec?

### --expected--

280

### --accept--

280 px
280px

### --why--

Dvě mezery zaberou 60 px, zbylých 840 px se rozdělí na tři díly.

### --see--

css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

## --card-- output

Kontejner je široký 1100 px, `gap: 20px`, šablona `repeat(auto-fill, minmax(250px, 1fr))`. Kolik pixelů bude mít jeden sloupec?

### --expected--

260

### --accept--

260 px
260px

### --why--

Vejdou se ⌊(1100 + 20) / (250 + 20)⌋ = 4 sloupce. Tři mezery zaberou 60 px a (1100 − 60) / 4 = 260 px.

### --see--

css-grid/mrizka-bez-media-queries#jak-prohlizec-spocita-pocet-sloupcu

## --card-- output

Kolik sloupců vytvoří `grid-template-columns: repeat(2, 1fr 2fr)`?

### --expected--

4

### --accept--

čtyři

### --why--

`repeat` zopakuje celý seznam stop: `1fr 2fr 1fr 2fr`.

### --see--

css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

## --card-- output

Kontejner široký 330 px bez mezer má `grid-template-columns: repeat(3, 1fr)`. Položka má `grid-column: 2 / 4`. Kolik pixelů je široká?

### --expected--

220

### --accept--

220 px
220px

### --why--

Od druhé do čtvrté čáry vedou dva sloupce po 110 px.

### --see--

css-grid/uvod-do-gridu#umisteni-podle-car-grid-column-grid-row-a-span

## --card-- output

Seznam na telefonu je tak úzký, že má `repeat(auto-fill, minmax(min(15rem, 100%), 1fr))` jediný sloupec. Jedna karta má `grid-column: span 2`. Kolik sloupců bude mřížka mít?

### --expected--

2

### --accept--

dva

### --why--

Karta chce dva sloupce, a tak grid přidá implicitní sloupec vedle explicitního. Do něj se zmáčkne některá z dalších karet a mřížka přeteče.

### --see--

css-grid/mrizka-bez-media-queries#typicke-chyby-a-pasti

## --card-- output

Kontejner má `display: grid; grid-template-columns: 1fr 1fr;` a jedinou položku je odkaz `<a class="button">Koupit</a>` bez dalších pravidel. Jakou šířku bude mít odkaz vůči svému sloupci: `obsah`, nebo `sloupec`?

### --expected-- ignore-case

sloupec

### --why--

Grid položka se ve výchozím stavu roztáhne přes celou šířku buňky, i když byla v normálním toku řádkovým prvkem. Stáhne ji `justify-self: start`.

### --see--

css-grid/grid-nebo-flex#stack-polozky-pod-sebou-s-mezerou

## --card-- output

Šablona je `grid-template-areas: "logo menu" "obsah"`. Kolik oblastí z ní prohlížeč vytvoří?

### --expected--

0

### --accept--

žádnou
žádné
nula

### --why--

Řetězce mají různý počet buněk, šablona je neplatná a prohlížeč zahodí celou deklaraci. Oblasti s těmi jmény neexistují.

### --see--

css-grid/uvod-do-gridu#pojmenovane-oblasti-grid-template-areas

## --card-- free

Jaký je rozdíl mezi gridem a flexboxem a podle čeho se rozhodneš, který použít?

### --back--

Flexbox rozvrhuje v jedné ose a vychází z obsahu: položka startuje na své velikosti a řada si místo rozdělí, každý zalomený řádek zvlášť. Grid rozvrhuje ve dvou osách a vychází z návrhu: nejdřív narýsuje řádky a sloupce, které platí pro všechny položky. Když o velikosti rozhoduje obsah (menu, štítky, lišta tlačítek), beru flexbox. Když rozhoduje rozvržení nebo mají věci v různých řádcích stát pod sebou (kostra stránky, mřížka karet, formulář), beru grid. Na jedné stránce je běžně obojí.

### --see--

css-grid/grid-nebo-flex#obsah-zevnitr-rozvrzeni-zvenku

## --card-- free

Co znamená jednotka `fr` a proč se sloupec `1fr` někdy nechce zmenšit? Jak to opravíš?

### --back--

`fr` je díl místa, které v mřížce zbude po pevných stopách a mezerách. Zápis `1fr` je ale zkratka za `minmax(auto, 1fr)` a minimum `auto` znamená nejmenší šířku obsahu. Když je v sloupci nezalomitelný obsah, třeba tabulka, `<pre>` nebo dlouhá URL, sloupec se roztáhne a stránka přeteče. Opravím to `minmax(0, 1fr)`, sloupec pak drží šířku ze zbylého místa a široký obsah se posouvá uvnitř svého obalu.

### --see--

css-grid/uvod-do-gridu#typicke-chyby-a-pasti

## --card-- free

Jaký je rozdíl mezi `auto-fill` a `auto-fit` v `repeat()`? Kdy použiješ který?

### --back--

Obě klíčová slova spočítají stejně, kolik sloupců se vejde podle minima v `minmax`. `auto-fill` nechá sloupce, na které nezbyla položka, prázdné; `auto-fit` je sbalí na nulu a položky s `1fr` se roztáhnou přes celý řádek. U výpisů, kde se počet položek mění filtrem, beru `auto-fill`, jinak by jediný produkt zabral celou šířku. `auto-fit` se hodí pro pár položek, které mají řádek vždycky vyplnit, třeba dlaždice statistik nebo sloupce patičky.

### --see--

css-grid/mrizka-bez-media-queries#auto-fill-nebo-auto-fit

## --card-- free

Co je explicitní a implicitní mřížka a proč na tom záleží u `grid-row: 1 / -1`?

### --back--

Explicitní mřížku tvoří stopy, které vypíšu v `grid-template-columns`, `grid-template-rows` nebo `grid-template-areas`. Když se položky nevejdou, grid přidá další řádky nebo sloupce sám, to je implicitní mřížka a jejich velikost řídí `grid-auto-rows` a `grid-auto-columns`. Záporná čísla čar se počítají od konce explicitní mřížky, takže boční panel s `grid-row: 1 / -1` nepovede přes řádky, které vznikly automaticky. Musím řádky vypsat, nebo použít oblasti či `span`.

### --see--

css-grid/uvod-do-gridu#explicitni-a-implicitni-mrizka

## --card-- free

Co je subgrid a jaký problém řeší?

### --back--

Subgrid je hodnota `subgrid` v `grid-template-rows` nebo `grid-template-columns` vnořené mřížky. Vnořená mřížka pak nevytváří vlastní stopy, ale použije stopy rodiče, přes které vede. Typicky ho použiju u řady karet s různě dlouhými nadpisy: karta vede přes tolik řádků rodiče, kolik má částí (`grid-row: span 3`), a nadpisy, popisy i ceny sousedních karet se srovnají, protože výšku řádku určuje nejvyšší část v celém řádku. Pozor, subgrid nové řádky nepřidá, co se nevejde, spadne do posledního.

### --see--

css-grid/mrizka-bez-media-queries#karty-zarovnane-napric-subgrid

## --card-- free

Proč může doporučená karta s `grid-column: span 2` rozbít mřížku s `auto-fill` na telefonu a jak tomu předejdeš?

### --back--

Na úzkém kontejneru se vejde jen jeden sloupec, ale karta chce dva. Grid přidá implicitní sloupec, zmáčkne do něj některou další kartu a mřížka přeteče z obrazovky. Širokou kartu proto zapínám media dotazem až od šířky, kde se dva sloupce po minimu i s mezerou opravdu vejdou; spočítám ji z minima, mezery a odsazení stránky. Na užších šířkách má karta `grid-column: auto`.

### --see--

css-grid/workshop-galerie/007

## --card-- free

Jak postavíš kostru webové aplikace s hlavičkou, bočním panelem, posuvným obsahem a přehrávačem vždycky u dna okna?

### --back--

Kontejner aplikace udělám gridem s oblastmi, třeba `"header header" "sidebar main" "player player"`, sloupci `16rem minmax(0, 1fr)` a řádky `auto 1fr auto`. Protože přehrávač má být vždycky u dna, dám aplikaci přesnou výšku `block-size: 100dvh` a hlavnímu obsahu `overflow-y: auto`, takže se posouvá jen prostřední řádek. Na telefonu v media dotazu rozvržení nakreslím znovu do jednoho sloupce a výšku vrátím na `auto`. HTML se kvůli tomu nemění.

### --see--

css-grid/workshop-kostra-stranky/004
