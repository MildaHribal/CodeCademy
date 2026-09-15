## --term-- box model

en: box model
aliases: box modelu, box modelem
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction
lekce: css-box-model/box-model#problem-box-je-sirsi-nez-jsi-napsal

Způsob, jakým prohlížeč počítá každý prvek jako obdélník ze čtyř vrstev: obsah, padding, rámeček a margin. Co z toho měří `width`, určuje `box-sizing`.

## --term-- obsahová oblast

en: content box
aliases: obsahové oblasti, obsahovou oblast
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction
lekce: css-box-model/box-model#ctyri-vrstvy-boxu

Nejvnitřnější vrstva boxu s textem a dětmi prvku. S výchozím `box-sizing: content-box` jsou `width` a `height` právě její rozměry.

## --term-- vnitřní odsazení

en: padding
aliases: vnitřního odsazení, vnitřním odsazením
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/padding
lekce: css-box-model/box-model#ctyri-vrstvy-boxu

Mezera mezi obsahem a rámečkem boxu (`padding`). Kreslí se do ní pozadí prvku, takže je vidět.

## --term-- vnější okraj

en: margin
aliases: vnějšího okraje, vnějším okrajem, vnější okraje
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/margin
lekce: css-box-model/box-model#ctyri-vrstvy-boxu

Průhledná mezera kolem boxu (`margin`). Do velikosti boxu se nepočítá, ale odsouvá sousedy; svislé marginy bloků se můžou slévat.

## --term-- normální tok

en: normal flow
aliases: normálního toku, normálním toku, normální tok dokumentu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Block_and_inline_layout
lekce: css-box-model/normalni-tok#problem-tlacitko-z-odkazu-ktere-neposloucha

Výchozí rozvržení stránky, když prvkům nenastavíš flexbox, grid ani pozicování. Blokové boxy se skládají pod sebe, řádkové tečou v řádcích textu.

## --term-- blokový box

en: block box
aliases: blokového boxu, blokovým boxem, blokové boxy, blokových boxů, blokový prvek, blokové prvky, blokového prvku
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Block-level_content
lekce: css-box-model/normalni-tok#blokove-a-radkove-boxy

Box, který v normálním toku začíná na novém řádku a zabírá celou šířku rodiče (`div`, `p`, `h1`, `display: block`). Šířka, výška i svislé marginy na něj působí.

## --term-- řádkový box

en: inline box
aliases: řádkového boxu, řádkovým boxem, řádkové boxy, řádkových boxů, řádkový prvek, řádkové prvky, řádkového prvku
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Inline-level_content
lekce: css-box-model/normalni-tok#blokove-a-radkove-boxy

Box, který teče v řádku textu jako slovo (`a`, `span`, `strong`, `display: inline`). Velikost mu určuje text; `width`, `height` ani svislý margin na něj nepůsobí.

## --term-- účaří

en: baseline
aliases: účařím, na účaří
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/vertical-align
lekce: css-box-model/normalni-tok#mezera-pod-obrazkem

Čára, na které stojí písmena v řádku. Řádkové prvky včetně obrázků se k ní ve výchozím stavu zarovnávají, a pod ní zůstává místo pro písmena jako g nebo y.

## --term-- slévání marginů

en: margin collapsing
aliases: slévání marginu, slévají marginy, slité marginy, margin collapse
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Mastering_margin_collapsing
lekce: css-box-model/margin-collapse-a-bfc#problem-mezera-ktera-se-nescita

Svislé marginy bloků, které se v normálním toku dotknou (sousedé, rodič s prvním nebo posledním dítětem, prázdný blok), se nesčítají: zůstane jen ten největší.

## --term-- blokový formátovací kontext

en: block formatting context
aliases: blokového formátovacího kontextu, blokový formátovací kontext založí, BFC
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Block_formatting_context
lekce: css-box-model/margin-collapse-a-bfc#blokovy-formatovaci-kontext

Oblast stránky, ve které se bloky rozvrhují nezávisle na okolí: marginy dětí se neslijí s rodičem a rodič obalí i plovoucí děti. Bez vedlejších efektů ho založí `display: flow-root`.

## --term-- stack

en: stack layout
aliases: vzor stack, stacku, stackem
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Next-sibling_combinator
lekce: css-box-model/margin-collapse-a-bfc#mezery-drzi-rodic-stack-a-gap

Vzor, ve kterém mezery mezi dětmi drží rodič: dětem vynuluje svislé marginy a každému kromě prvního dá `margin-block-start` přes selektor `* + *`.

## --term-- přetečení

en: overflow
aliases: přetečení obsahu, přetéká, přeteče
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overflow
lekce: css-box-model/preteceni#problem-obsah-ktery-se-nevejde

Obsah, který se do boxu s omezenou velikostí nevejde. Ve výchozím stavu zůstane vidět mimo box; vlastnost `overflow` ho umí oříznout nebo nechat posouvat.

## --term-- poměr stran

en: aspect ratio
aliases: poměru stran, poměrem stran
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio
lekce: css-box-model/preteceni#obrazky-hranice-sirky-pomer-stran-a-object-fit

Poměr šířky a výšky boxu (`aspect-ratio: 16 / 9`). Použije se, když jeden z rozměrů zůstane `auto`; výška se pak dopočítá ze šířky.

## --term-- plovoucí prvek

en: float
aliases: plovoucího prvku, plovoucí prvky, plovoucích prvků, plovoucím prvkem
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/float
lekce: css-box-model/preteceni#float-jen-na-obtekani

Prvek s `float`, který je vytažený z normálního toku k jedné straně řádku a text ho obtéká. Do výšky obyčejného rodiče se nepočítá.
