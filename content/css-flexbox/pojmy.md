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
