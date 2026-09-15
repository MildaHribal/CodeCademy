---
pass: 0.8
---

# --questions--

## --question--

Kontejner je široký 800 px a má `grid-template-columns: 2fr 1fr 150px; gap: 25px;`. Jak široký bude první sloupec v pixelech?

### --expected--

400

### --accept--

400 px
400px

### --why--

Nejdřív se odečte pevný sloupec a obě mezery: 800 − 150 − 50 = 600 px. Ty se rozdělí na tři díly po 200 px a první sloupec dostane dva. Kdo napsal 433, dělil 650 px a zapomněl na mezery; kdo 533, dělil celou šířku.

### --see--

css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

## --question--

Mřížka má `grid-template-columns: repeat(4, 1fr)`. První položka má `grid-column: 3 / 5`, dalších čtyři položky nemají nic. Ve kterém řádku bude druhá položka?

### --expected--

2

### --accept--

ve druhém
druhém
druhý

### --why--

První položka zabere třetí a čtvrtý sloupec prvního řádku. Automatické umísťování jde od ní jen dopředu, v prvním řádku za ní už místo není, a tak druhá položka začne druhý řádek. Levá polovina prvního řádku zůstane prázdná — za sebe se umísťování nevrací.

### --see--

css-grid/uvod-do-gridu#umisteni-podle-car-grid-column-grid-row-a-span

## --question--

Kontejner je široký 600 px a má `grid-template-columns: repeat(4, 25%); gap: 12px;`. O kolik pixelů přeteče mřížka z kontejneru?

### --expected--

36

### --accept--

36 px
36px

### --why--

Čtyři sloupce po 25 % zaberou celých 600 px a tři mezery po 12 px se k nim přičtou. Procenta se počítají z celé šířky, ne z místa po mezerách. `repeat(4, 1fr)` by dělilo až to, co po mezerách zbude.

### --see--

css-grid/uvod-do-gridu#typicke-chyby-a-pasti

## --question--

Kontejner je široký 1000 px, bez mezer, a obsahuje dvě karty. Šablona je `repeat(auto-fit, minmax(200px, 1fr))`. Jak široká bude jedna karta?

### --expected--

500

### --accept--

500 px
500px

### --why--

Vejde se pět sloupců po 200 px, ale karty jsou jen dvě. `auto-fit` prázdné sloupce sbalí na nulu a dvě karty s `1fr` si rozdělí celou šířku. S `auto-fill` by prázdné sloupce zůstaly a karty by měly 200 px.

### --see--

css-grid/mrizka-bez-media-queries#auto-fill-nebo-auto-fit

## --question--

Napiš hodnotu `grid-template-columns` pro mřížku karet: tolik sloupců, kolik se vejde při šířce aspoň `15rem`, sloupce vyplní celý řádek a na telefonu užším než 15rem nic nepřeteče. Počet karet se mění podle filtru.

### --expected--

repeat(auto-fill, minmax(min(15rem, 100%), 1fr))

### --why--

`auto-fill` spočítá sloupce podle minima a nechá je, i když je karet málo, takže osamělá karta se neroztáhne přes celou šířku. `min(15rem, 100%)` sníží minimum na šířku kontejneru, když je užší než 15rem, a `1fr` rozdělí zbylé místo.

### --see--

css-grid/mrizka-bez-media-queries#min-v-minmax-mrizka-na-uzkem-telefonu

## --question--

Kostra stránky má `grid-template-columns: 16rem 1fr`. Do hlavního sloupce přibyl blok `<pre>` s dlouhým řádkem kódu a `overflow-x: auto`, a celá stránka teď jde posouvat do strany. Proč `overflow-x: auto` nepomohlo?

### --answer--

Protože `overflow-x` v gridu nefunguje a musí se nahradit `overflow: hidden`.

#### --why--

`overflow-x: auto` v grid položkách funguje normálně. Obal se ale posouvá jen tehdy, když je užší než obsah — podívej se, jak široký mu sloupec dovolil být.

### --correct--

Protože `1fr` má minimum `auto`, sloupec se nezmenší pod nejmenší šířku obsahu a `<pre>` ho roztáhl na celý řádek kódu.

#### --why--

`1fr` znamená `minmax(auto, 1fr)`. Nezalomitelný řádek kódu je nejmenší šířkou obsahu sloupce, takže sloupec narostl a obal `<pre>` se neměl kde posouvat. `minmax(0, 1fr)` minimum zruší.

### --answer--

Protože boční sloupec `16rem` se nesmí zmenšit, a tak se musí rozšířit stránka.

#### --why--

Pevný sloupec opravdu zůstane 16rem, ale kdyby hlavní sloupec dostal jen zbylé místo, stránka by nepřetekla. Příčina je v minimu hlavního sloupce.

### --see--

css-grid/uvod-do-gridu#typicke-chyby-a-pasti

## --question--

Dlaždice statistiky je `display: grid; grid-auto-rows: 8rem; justify-items: center;` a číslo v ní má navíc `align-self: end`. Kde v dlaždici bude to číslo?

### --answer--

Vpravo, svisle uprostřed.

#### --why--

`justify-items` i `align-self` mají v gridu pevné směry a `center` s `end` v nich nic neotočí. Který z těch dvou směrů je svislý?

### --correct--

U spodního okraje, vodorovně uprostřed.

#### --why--

`justify-items: center` platí pro všechny položky v řádkovém směru, tedy vodorovně. `align-self: end` přepíše jen té jedné položce zarovnání v blokovém směru, tedy svisle dolů.

### --answer--

Vodorovně uprostřed a svisle roztažené přes celý řádek, protože `align-self` bez `align-items` na kontejneru nic nedělá.

#### --why--

`align-self` na položce funguje samostatně, nastavení na kontejneru k němu nepotřebuje. Roztažení je jen výchozí stav, který přepíšeš.

### --see--

css-grid/uvod-do-gridu#zarovnani-v-bunce

## --question--

Karta kurzu má čtyři části a pravidlo `display: grid; grid-template-rows: subgrid; grid-row: span 3;`. Kde skončí cena, která je v HTML jako čtvrtá?

### --answer--

V novém čtvrtém řádku, který subgrid přidá.

#### --why--

Subgrid vlastní řádky netvoří, má jen ty, přes které vede v rodiči. Kolik jich karta má?

### --correct--

Ve třetím řádku přes popis, protože subgrid má jen tři řádky.

#### --why--

Karta vede přes tři řádky rodiče a subgrid jiné nemá. Čtvrtá část se nevejde a spadne do posledního řádku, kde překryje popis. Pomůže `grid-row: span 4`.

### --answer--

Rodičovská mřížka pro ni přidá řádek pod všemi kartami.

#### --why--

Rodič o částech uvnitř karty neví, řádky přidává jen pro své vlastní položky.

### --see--

css-grid/mrizka-bez-media-queries#karty-zarovnane-napric-subgrid

## --question--

Pod článkem jsou štítky „Recept", „Bez lepku", „Vegetariánské" a „Rychlá večeře". Každý má být široký podle textu a na telefonu se zalomí. Co zvolíš pro seznam štítků?

### --answer--

`display: grid; grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));`

#### --why--

Mřížka dá všem štítkům stejně široký sloupec, krátké budou mít prázdné místo a dlouhé se zalomí na dva řádky. O šířce tu má rozhodovat obsah.

### --correct--

`display: flex; flex-wrap: wrap; gap: 0.5rem;`

#### --why--

Štítky jsou cluster: velikost určuje text a řada se přizpůsobí. Flexbox položku startuje na velikosti obsahu a zalomí, co se nevejde.

### --answer--

`display: grid; grid-auto-flow: column; gap: 0.5rem;`

#### --why--

`grid-auto-flow: column` přidává sloupce do jednoho řádku a nikdy nezalomí. Na telefonu by štítky přetekly.

### --see--

css-grid/grid-nebo-flex#cluster-stitky-a-tlacitka-ktere-se-zalamuji

## --question--

Najdi v anglické dokumentaci MDN na stránce vlastnosti `grid-template-columns` funkci, která dá stopě velikost podle obsahu, ale nejvýš zadanou délku. Napiš její jméno bez závorek.

### --expected--

fit-content

### --accept--

fit-content()

### --why--

`fit-content(300px)` se chová jako `auto`, dokud obsah nepřeroste 300 px, pak se zastaví. Hodí se pro boční panel, který má být úzký, když má krátké položky, ale nikdy širší než limit.

### --see--

css-grid/uvod-do-gridu#kde-to-najdes-v-mdn

## --question--

Kontejner je široký 500 px, bez mezer, a má `display: flex`. Položka A má `flex: 1 1 100px`, položka B má `flex: 1 1 200px`. Jak široká bude B?

### --expected--

300

### --accept--

300 px
300px

### --why--

Volné místo je 500 − 300 = 200 px a obě položky mají stejný `flex-grow`, takže každá dostane 100 px. B: 200 + 100 = 300 px. Stejný `flex-grow` neznamená stejnou šířku, když se liší basis.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --question--

Karta je `display: flex; flex-direction: column; align-items: center;`. Co se stane s tlačítkem, které bylo předtím přes celou šířku karty?

### --answer--

Zůstane přes celou šířku, jen jeho text se vycentruje.

#### --why--

Roztažení přes celou šířku dělala výchozí hodnota `stretch`. Tu jsi právě přepsal.

### --correct--

Stáhne se na šířku svého obsahu a bude vodorovně uprostřed karty.

#### --why--

Ve sloupci je vedlejší osa vodorovná. `align-items: center` nahradí výchozí `stretch`, takže položky už nevyplní šířku a vycentrují se.

### --answer--

Posune se svisle doprostřed karty.

#### --why--

Svisle vede ve sloupci hlavní osa a volné místo na ní rozděluje `justify-content`, ne `align-items`.

### --see--

css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

## --question--

Ve flex řádku je položka `.file__name` s `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` uvnitř obalu `.file__info`, který má `flex: 1`. Tři tečky se neobjeví a tlačítko vedle vyčuhuje z řádku. Napiš deklaraci, kterou dáš `.file__info`.

### --expected--

min-width: 0

### --accept--

min-width: 0px

### --why--

Flex položkou je obal, ne název, a jeho výchozí `min-width: auto` ho nepustí pod šířku celého nezalomitelného názvu. `min-width: 0` hranici zruší, obal se zmenší a název se ořízne. Stejnou roli má v gridu `minmax(0, 1fr)`.

### --see--

css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

## --question--

V hlavičce je `display: flex` a položky logo, odkazy „Plakáty", „Kurzy" a tlačítko „Košík". Jen košík má odjet k pravému okraji, logo a odkazy zůstanou vlevo. Kterou deklaraci dáš košíku?

### --answer--

`justify-self: end`

#### --why--

`justify-self` ve flexboxu nefunguje, na hlavní ose se jednotlivá položka zarovnat nedá. Hledej způsob, jak položce dát všechno volné místo na jedné straně.

### --correct--

`margin-inline-start: auto`

#### --why--

Automatický margin sežere všechno volné místo před košíkem a odtlačí ho doprava, ostatní položky zůstanou vlevo.

### --answer--

`align-self: flex-end`

#### --why--

`align-self` pracuje na vedlejší ose, v řádku tedy svisle. Košík by klesl ke spodnímu okraji hlavičky.

### --see--

css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou

# --code-- Kolegův web s recepty

## --file-- layout.css

```css
/* Recepty od Báry — rozvržení */
body {
  margin: 0;
  font-family: Georgia, serif;
}

.site {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
}

.site-header {
  grid-column: 1 / 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #3f2a1d;
  color: #fff8ee;
}

.site-nav {
  padding: 24px;
  background: #f5e9dc;
}

.site-main {
  padding: 24px;
}

.site-footer {
  grid-column: 1 / -1;
  padding: 16px 24px;
  background: #3f2a1d;
  color: #fff8ee;
}

.recipes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
}

.recipe {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #e0cdb8;
  border-radius: 12px;
}

.recipe--big {
  grid-column: span 2;
}

.recipe .time {
  margin-top: auto;
  color: #8a6a52;
}

.recipe pre {
  overflow-x: auto;
  background: #fbf6f0;
}

@media (max-width: 600px) {
  .site {
    grid-template-columns: 1fr;
  }

  .recipes {
    gap: 12px;
  }
}
```

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>Recepty od Báry</title>
  <link rel="stylesheet" href="layout.css">
</head>
<body>
  <div class="site">
    <header class="site-header">
      <strong>Recepty od Báry</strong>
      <a href="#hledat">Hledat</a>
    </header>
    <nav class="site-nav">
      <a href="#">Polévky</a>
      <a href="#">Hlavní jídla</a>
      <a href="#">Moučníky</a>
    </nav>
    <main class="site-main">
      <h1>Nové recepty</h1>
      <ul class="recipes">
        <li class="recipe recipe--big">
          <h2>Svíčková na smetaně</h2>
          <p>Nedělní klasika podle babičky.</p>
          <p class="time">3 hodiny</p>
        </li>
        <li class="recipe">
          <h2>Kulajda</h2>
          <p>S koprem, houbami a zastřeným vejcem. Do hrnce dej brambory nakrájené na kostičky, přidej houby a nech vařit patnáct minut. Pak vmíchej smetanu s moukou, osol, opepři, okyseli octem a nakonec přidej kopr.</p>
          <p class="time">45 minut</p>
        </li>
        <li class="recipe">
          <h2>Kynuté buchty</h2>
          <pre>mouka_hladka_polohruba = 500 g; drozdi_cerstve = 20 g; mleko_vlazne = 250 ml</pre>
          <p class="time">2 hodiny</p>
        </li>
      </ul>
    </main>
    <footer class="site-footer">
      <p>© 2026 Recepty od Báry</p>
    </footer>
  </div>
</body>
</html>
```

## --question--

Na šířce 1024 px jde stránka posouvat do strany. Příčinou je dlouhý řádek v `<pre>` u receptu Kynuté buchty. Na kterém řádku `layout.css` změníš jednu hodnotu, aby se kód posouval uvnitř karty a stránka ne?

### --expected--

9

### --accept--

řádek 9

### --why--

Řádek 9 v `layout.css` dává hlavnímu sloupci `1fr`, tedy minimum `auto`. Nezalomitelný řádek kódu je nejmenší šířkou obsahu a sloupec se roztáhl přes okno. `250px minmax(0, 1fr)` minimum zruší a teprve pak se uplatní `overflow-x: auto` z řádku 66.

### --see--

css-grid/uvod-do-gridu#typicke-chyby-a-pasti

## --question--

Předpokládej, že řádek 9 v `layout.css` je opravený na `250px minmax(0, 1fr)`. Hlavní obsah má pak na šířce 1024 px pro seznam receptů 726 px. Kolik sloupců bude mít `.recipes` podle řádků 42 a 43?

### --expected--

2

### --accept--

dva

### --why--

Sloupec potřebuje aspoň 280 px a mezi sloupci je 20 px: ⌊(726 + 20) / (280 + 20)⌋ = 2. Svíčková s `span 2` z řádku 57 zabere celý první řádek a Kulajda s buchtami jsou pod ní vedle sebe.

### --see--

css-grid/mrizka-bez-media-queries#jak-prohlizec-spocita-pocet-sloupcu

## --question--

Na telefonu (360 px) platí media dotaz z řádku 70. I s opraveným hlavním sloupcem vznikne v `.site` vedle obsahu sloupec navíc a patička je jen úzký proužek vlevo. Který řádek `layout.css` sloupec navíc vytváří?

### --answer--

Řádek 34, `grid-column: 1 / -1` u patičky.

#### --why--

`1 / -1` vede přes celou explicitní mřížku, ať má sloupců kolik chce, žádný nový nepřidá. Patička je úzká, protože sloupec navíc vytvořil někdo jiný.

### --correct--

Řádek 15, `grid-column: 1 / 3` u hlavičky.

#### --why--

Na telefonu má mřížka jediný sloupec, tedy čáry 1 a 2. Hlavička chce skončit na čáře 3, a tak grid přidá implicitní sloupec. Patička s `1 / -1` vede jen přes explicitní mřížku, tedy přes první sloupec. Oprava: `grid-column: 1 / -1` i u hlavičky.

### --answer--

Řádek 57, `grid-column: span 2` u velkého receptu.

#### --why--

Tenhle řádek přidává sloupec navíc, ale v seznamu `.recipes`, ne v kostře `.site`. Hledej položku kostry, která chce víc sloupců, než kostra na telefonu má.

### --see--

css-grid/uvod-do-gridu#umisteni-podle-car-grid-column-grid-row-a-span

## --question--

Kolega opravil řádky 9 a 15 i sloupec v media dotazu, ale na telefonu 360 px recepty pořád přetékají doprava. Co za to může?

### --answer--

`auto-fit` na řádku 42, protože na telefonu sbalí všechny sloupce.

#### --why--

`auto-fit` sbalí jen prázdné sloupce, a na telefonu by se vešel jediný. Přetečení způsobuje položka, která jeden sloupec nepřijme.

### --correct--

`grid-column: span 2` na řádku 57 chce druhý sloupec, pro který v telefonu není místo.

#### --why--

Do seznamu se vejde jediný sloupec, ale Svíčková chce dva. Grid proto přidá implicitní sloupec navíc, ten se řídí obsahem (nejdelším řádkem v `<pre>`) a mřížka přeteče. `span 2` patří do media dotazu od šířky, kde se dva sloupce vejdou. Na ještě užších telefonech by navíc minimum na řádku 42 potřebovalo `min(280px, 100%)`.

### --answer--

`height: 100vh` na řádku 11.

#### --why--

Výška okna ovlivňuje řádky kostry, ne šířku receptů. Hledej, co v seznamu chce víc sloupců.

### --see--

css-grid/mrizka-bez-media-queries#typicke-chyby-a-pasti

## --question--

Po opravě řádku 9 stojí Kulajda a Kynuté buchty vedle sebe. Proč jsou texty „45 minut" a „2 hodiny" na stejné výšce u spodního okraje karet, i když má Kulajda mnohem delší popis? Stačí ti řádky 49–51, 60–62 a výchozí chování gridu.

### --answer--

Protože `margin-top: auto` na řádku 61 zarovná všechny časy v mřížce na jednu čáru.

#### --why--

Automatický margin pracuje uvnitř jedné flex položky a o sousedních kartách neví. Proč jsou obě karty stejně vysoké?

### --correct--

Karty v jednom řádku mřížky jsou stejně vysoké (výchozí `stretch`) a v každé kartě-sloupci odtlačí `margin-top: auto` čas ke dnu.

#### --why--

Grid roztáhne obě položky řádku na výšku nejvyšší. Každá karta je flex sloupec (řádky 49–51) a automatický margin z řádku 61 dá veškeré volné místo nad čas. Dohromady jsou časy u dna na stejné výšce.

### --answer--

Protože řádek 11 dává stránce výšku okna a karty se roztáhnou až dolů.

#### --why--

Výška `.site` určuje řádky kostry, ne výšku karet v seznamu. Karty jsou vysoké podle nejvyšší karty ve svém řádku.

### --see--

css-flexbox/workshop-navigace/021
