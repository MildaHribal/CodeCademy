## --term-- grid kontejner

en: grid container
aliases: grid kontejneru, grid kontejnerem, grid kontejnery, grid kontejnerů
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Grid_Container
lekce: css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

Prvek s `display: grid`. Narýsuje mřížku z řádků a sloupců a do jejích buněk skládá své **přímé** potomky.

## --term-- grid položka

en: grid item
aliases: grid položky, grid položku, grid položkou, grid položek, grid položkám
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts
lekce: css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

Přímý potomek grid kontejneru. Umístí se automaticky do další volné buňky, nebo tam, kam ho pošle `grid-column`, `grid-row` či `grid-area`.

## --term-- stopa

en: grid track
aliases: stopy, stopu, stopou, stop, stopám, stopách
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Grid_Tracks
lekce: css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

Jeden sloupec nebo jeden řádek mřížky, tedy prostor mezi dvěma sousedními čárami. Velikost stop popisují `grid-template-columns` a `grid-template-rows`.

## --term-- jednotka fr

en: fr unit
aliases: jednotku fr, jednotky fr, jednotkou fr
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns
lekce: css-grid/uvod-do-gridu#grid-kontejner-stopy-a-jednotka-fr

Díl místa, které v mřížce zbude po odečtení pevných stop a mezer `gap`. Samotné `1fr` znamená `minmax(auto, 1fr)`, takže sloupec nejde zúžit pod nejmenší šířku obsahu.

## --term-- explicitní mřížka

en: explicit grid
aliases: explicitní mřížky, explicitní mřížku, explicitní mřížce, explicitní mřížkou
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Grid
lekce: css-grid/uvod-do-gridu#explicitni-a-implicitni-mrizka

Stopy, které vypíšeš v `grid-template-columns`, `grid-template-rows` nebo `grid-template-areas`. Záporná čísla čar (`-1`) se počítají od jejího konce.

## --term-- implicitní mřížka

en: implicit grid
aliases: implicitní mřížky, implicitní mřížku, implicitní mřížce, implicitní mřížkou, implicitní řádek, implicitní řádky
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts
lekce: css-grid/uvod-do-gridu#explicitni-a-implicitni-mrizka

Stopy, které grid přidá sám, když se položky do explicitní mřížky nevejdou. Jejich velikost řídí `grid-auto-rows` a `grid-auto-columns`, výchozí je `auto`.

## --term-- čára mřížky

en: grid line
aliases: čáry mřížky, čáru mřížky, čar mřížky, čarami mřížky
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Grid_Lines
lekce: css-grid/uvod-do-gridu#umisteni-podle-car-grid-column-grid-row-a-span

Hranice mezi stopami, číslovaná od 1 zleva a shora a od -1 od konce explicitní mřížky. Položku na čáry posíláš přes `grid-column` a `grid-row`.

## --term-- automatické umísťování

en: auto-placement
aliases: automatického umísťování, automatickým umísťováním
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Auto-placement
lekce: css-grid/uvod-do-gridu#umisteni-podle-car-grid-column-grid-row-a-span

Pravidlo, podle kterého grid skládá položky bez pevného umístění do dalších volných buněk v pořadí HTML. Ve výchozím stavu jde jen dopředu a díry za sebou nechá prázdné.

## --term-- oblast mřížky

en: grid area
aliases: oblasti mřížky, oblastí mřížky
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Grid_Areas
lekce: css-grid/uvod-do-gridu#pojmenovane-oblasti-grid-template-areas

Obdélník z jedné nebo více buněk. Pojmenuje se v `grid-template-areas` a položka se do něj pošle přes `grid-area`.

## --term-- subgrid

en: subgrid
aliases: subgridu, subgridem, subgridy
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid
lekce: css-grid/mrizka-bez-media-queries#karty-zarovnane-napric-subgrid

Hodnota `subgrid` v `grid-template-rows` nebo `grid-template-columns`: vnořená mřížka nepřidá vlastní stopy, ale použije stopy rodiče, přes které vede. Díky tomu se části sousedních karet srovnají.
