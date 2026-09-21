## --term-- flex kontejner

en: flex container
aliases: flex kontejneru, flex kontejnerem, flex kontejnery, flex kontejnerů
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Flex_Container
lekce: css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky

Prvek s `display: flex`. Rozvrhuje jen své **přímé** potomky — řadí je podél hlavní osy a rozhoduje, co s volným místem.

## --term-- flex položka

en: flex item
aliases: flex položky, flex položku, flex položkou, flex položek, flex položkám, flex položkách
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Flex_Item
lekce: css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky

Přímý potomek flex kontejneru, včetně holého textu. Jeho velikost na hlavní ose řídí `flex-basis`, `flex-grow` a `flex-shrink`.

## --term-- hlavní osa

en: main axis
aliases: hlavní osy, hlavní ose, hlavní osu, hlavní osou
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Main_Axis
lekce: css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

Směr, ve kterém flex kontejner řadí položky za sebou. Určuje ho `flex-direction`; volné místo na ní rozděluje `justify-content`.

## --term-- vedlejší osa

en: cross axis
aliases: vedlejší osy, vedlejší ose, vedlejší osu, vedlejší osou
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Cross_Axis
lekce: css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

Osa kolmá na hlavní osu. Položky na ní zarovnává `align-items` (jednu položku `align-self`), celé řádky `align-content`.

## --term-- volné místo

en: free space
aliases: volného místa, volném místě, volným místem
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Controlling_ratios_of_flex_items_along_the_main_axis
lekce: css-flexbox/uvod-do-flexboxu#justify-content-volne-misto-na-hlavni-ose

Rozdíl mezi velikostí kontejneru a součtem výchozích velikostí položek a mezer. Kladné rozdělí `flex-grow`, automatické marginy nebo `justify-content`; záporné ubere `flex-shrink`.

## --term-- automatický margin

en: auto margin
aliases: automatického marginu, automatickým marginem, automatické marginy, automatických marginů
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_alignment/Box_alignment_in_flexbox
lekce: css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou

Margin s hodnotou `auto` na flex položce. Sežere na své straně všechno volné místo v řádku, dřív než se uplatní `justify-content`, a tím odtlačí položku od ostatních.

## --term-- logická vlastnost

en: logical property
aliases: logické vlastnosti, logickou vlastnost, logickou vlastností, logických vlastností
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values
lekce: css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou

Vlastnost pojmenovaná podle směru textu místo stran obrazovky, například `margin-inline-start` (začátek řádku) nebo `margin-block-start` (začátek bloku). V češtině znamená `inline-start` vlevo, v arabštině vpravo.

## --term-- nejmenší šířka obsahu

en: min-content size
aliases: nejmenší šířku obsahu, nejmenší šířky obsahu, nejmenší šířce obsahu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/min-content
lekce: css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

Nejužší šířka, na kterou jde obsah zúžit bez přetečení: u textu nejdelší slovo, u `white-space: nowrap` celý text. Pod ni flex položku nepustí výchozí `min-width: auto`.

## --term-- flexbox

en: flexbox
aliases: flexboxu, flexboxem, flexboxem rozvržený, flexible box layout
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout
lekce: css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky

Způsob rozvržení, který řadí prvky do jedné řady a rozhoduje, co s místem, které po nich zbude. Zapíná se na rodiči (`display: flex`) a od té chvíle o velikosti a zarovnání jeho přímých potomků nerozhoduje normální tok, ale kontejner. S gridem se plete proto, že flexbox počítá každý řádek zvlášť, kdežto grid srovnává sloupce přes všechny řádky.

## --term-- flex-direction

en: flex-direction
aliases: směr hlavní osy, flex direction
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction
lekce: css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

Vlastnost kontejneru, která určuje, kudy vede hlavní osa: `row` zleva doprava, `column` shora dolů, tvary s `-reverse` opačným směrem. Když osu otočíš, otočí se i to, co dělá `justify-content` a `align-items` — ve sloupci proto centruje vodorovně `align-items`, ne `justify-content`.

## --term-- justify-content

en: justify-content
aliases: zarovnání na hlavní ose, justify content
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
lekce: css-flexbox/uvod-do-flexboxu#justify-content-volne-misto-na-hlavni-ose

Vlastnost kontejneru, která rozděluje volné místo na hlavní ose: `flex-start`, `center`, `space-between` a spol. Pracuje jen s místem, které opravdu zbylo — když položky přetékají, žádné volné místo není a `justify-content` nedělá nic.

## --term-- align-items

en: align-items
aliases: zarovnání na vedlejší ose, align items
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/align-items
lekce: css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose

Vlastnost kontejneru, která zarovnává položky na vedlejší ose, v řádku tedy svisle. Výchozí `stretch` roztáhne každou položku bez pevné velikosti přes celou vedlejší osu: díky tomu jsou karty v řadě stejně vysoké, a proto se taky kulatý avatar vedle víceřádkového textu natáhne do vajíčka.

## --term-- align-self

en: align-self
aliases: align self, zarovnání jedné položky
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/align-self
lekce: css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose

Totéž co `align-items`, jen zapsané na jedné konkrétní položce. Přepíše zarovnání, které kontejner nastavil všem ostatním, takže se dá vyjmout jediný prvek bez zásahu do zbytku řádku.

## --term-- align-content

en: align-content
aliases: zarovnání řádků, align content
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/align-content
lekce: css-flexbox/uvod-do-flexboxu#zalamovani-flex-wrap-gap-a-align-content

Vlastnost kontejneru, která rozděluje volné místo mezi celé řádky na vedlejší ose — funguje jako `justify-content`, jen o řádek výš. Má smysl až při zalamování a víc řádcích; u jediného řádku nedělá nic, a právě tím se plete s `align-items`.

## --term-- flex-wrap

en: flex-wrap
aliases: zalamování, zalamování položek, flex wrap
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap
lekce: css-flexbox/uvod-do-flexboxu#zalamovani-flex-wrap-gap-a-align-content

Vlastnost kontejneru, která rozhoduje, jestli položka, která se nevejde, smí přejít na další řádek. Výchozí `nowrap` je drží v jednom řádku za každou cenu: nejdřív je zmenší a pak je nechá přetéct z kontejneru ven.

## --term-- gap

en: gap
aliases: gapu, gapem, mezera mezi položkami, mezery mezi položkami
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/gap
lekce: css-flexbox/uvod-do-flexboxu#zalamovani-flex-wrap-gap-a-align-content

Mezera, kterou kontejner vloží **mezi** položky, ne na kraje — a při zalamování i mezi řádky. Proti `margin` má výhodu, že se poslední položce nemusí nic odebírat; mezi pěti položkami vloží čtyři mezery a do výpočtu volného místa se počítá stejně jako položky samotné.

## --term-- flex-basis

en: flex-basis
aliases: basis, výchozí velikost položky, flex basis
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis
lekce: css-flexbox/flex-do-hloubky#tri-cisla-basis-grow-shrink

Startovní velikost flex položky na hlavní ose, ze které se teprve počítá růst a zmenšování. Hodnota `auto` si vezme `width` (v řádku), a když není, velikost obsahu; jakmile je basis cokoli jiného, `width` se pro výchozí velikost ignoruje — proto `.card { flex: 1; width: 15rem; }` nefunguje.

## --term-- flex-grow

en: flex-grow
aliases: grow, flex grow
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow
lekce: css-flexbox/flex-do-hloubky#rust-v-cislech

Číslo, kterým se položka hlásí o podíl na volném místě. Dělí se jen to místo, co po součtu startovních velikostí a mezer zbylo, takže `flex-grow: 2` neznamená „dvakrát širší" — jen dvakrát větší díl z volného místa.

## --term-- flex-shrink

en: flex-shrink
aliases: shrink, flex shrink
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink
lekce: css-flexbox/flex-do-hloubky#zmensovani-v-cislech

Číslo, kterým se položka podílí na zmenšování, když místo naopak chybí. Výchozí `1` znamená „smím se zmenšit", `0` znamená „nesahej na mě"; neubírá se ale rovným dílem, nýbrž podle váhy zmenšování.

## --term-- váha zmenšování

en: scaled flex shrink factor
aliases: váhu zmenšování, váhy zmenšování, vážené zmenšování
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Controlling_ratios_of_flex_items_along_the_main_axis
lekce: css-flexbox/flex-do-hloubky#zmensovani-v-cislech

Součin `flex-shrink` a `flex-basis`, podle kterého se rozděluje chybějící místo mezi položky. Velká položka tak ztratí víc pixelů než malá, ale obě se zmenší o stejné procento — kdyby se ubíralo rovným dílem, malé položky by zmizely mnohem dřív.

## --term-- zkratka flex

en: flex shorthand
aliases: zkratku flex, zkratky flex, zápis flex
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/flex
lekce: css-flexbox/flex-do-hloubky#zkratka-flex-a-jeji-vychozi-hodnoty

Zápis `flex: <grow> <shrink> <basis>`, kterým se všechna tři čísla nastavují najednou. Zkrácené tvary doplňují jiné hodnoty, než mají vlastnosti samy o sobě, a právě v tom se chybuje: `flex: 1` je `1 1 0%` (o šířce nerozhoduje obsah), kdežto `flex: auto` je `1 1 auto` (rozhoduje).

## --term-- automatické minimum

en: automatic minimum size
aliases: automatického minima, automatickým minimem, min-width: auto
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/min-width
lekce: css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

Výchozí `min-width: auto` flex položky, které jí zakazuje zmenšit se pod nejmenší šířku obsahu. Proto dlouhý e-mail, URL nebo `<pre>` vytlačí sousedy z kontejneru, i když má položka `flex-shrink: 1`; hranici zruší `min-width: 0` napsané na té položce (ve sloupci `min-height: 0`).

## --term-- řádek flexboxu

en: flex line
aliases: řádku flexboxu, řádky flexboxu, řádcích flexboxu, flex řádek
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Mastering_wrapping_of_flex_items
lekce: css-flexbox/uvod-do-flexboxu#zalamovani-flex-wrap-gap-a-align-content

Jedna řada položek, která vznikne při `flex-wrap: wrap`. Každý řádek si dělí volné místo sám a o ostatních neví — proto je poslední neúplný řádek roztažený jinak než řádky nad ním a mřížku z flexboxu nepostavíš.

## --term-- order

en: order
aliases: vlastnost order, pořadí položek
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/order
lekce: css-flexbox/uvod-do-flexboxu#typicke-chyby-a-pasti

Vlastnost položky, která mění její pořadí ve vykreslení. Mění ale jen to, co je vidět: klávesa Tab i čtečka obrazovky jdou dál podle pořadí v HTML, takže se hodí na drobné přeskupení, ne na skutečnou změnu pořadí — tu udělej v HTML.

## --term-- jednorozměrné rozvržení

en: one-dimensional layout
aliases: jednorozměrného rozvržení, jednorozměrném rozvržení, rozvržení v jedné ose
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Relationship_of_flexbox_to_other_layout_methods
lekce: css-flexbox/flex-do-hloubky#flexbox-nebo-grid

Rozvržení, které řeší jen jeden směr: položky se řadí za sebou a každý řádek si počítá místo sám. Tím se flexbox liší od gridu, který rozvrhuje ve dvou osách a drží sloupce srovnané přes všechny řádky — vodítko zní, že flexbox použiješ, když o místu rozhoduje obsah.
