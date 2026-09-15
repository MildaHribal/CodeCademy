## --term-- vizuální hierarchie

en: visual hierarchy
aliases: vizuální hierarchii, vizuální hierarchií
lekce: css-design/hierarchie-a-rozestupy#problem-vsechno-je-stejne-dulezite

Pořadí, ve kterém oko čte stránku. Vzniká rozdílem ve vzdálenosti, velikosti, váze a barvě: důležité vyčnívá, protože vedlejší ustoupí.

## --term-- princip blízkosti

en: law of proximity
aliases: principu blízkosti, principem blízkosti
lekce: css-design/hierarchie-a-rozestupy#blizkost-a-seskupeni

Oko spojuje věci, které jsou u sebe, a odděluje ty, mezi kterými je místo. Proto má být mezera uvnitř skupiny menší než mezera mezi skupinami.

## --term-- stupnice rozestupů

en: spacing scale
aliases: stupnici rozestupů, stupnicí rozestupů
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
lekce: css-design/hierarchie-a-rozestupy#stupnice-rozestupu

Pevná sada hodnot pro mezery (typicky násobky 4 px: 4, 8, 12, 16, 24, 32, 48, 64), zapsaná jako tokeny v `rem`. Mezera se volí o stupeň větší nebo menší, ne po pixelech.

## --term-- světlost

en: lightness
aliases: světlosti, světlostí
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
lekce: css-design/barvy-a-typografie#oklch-svetlost-chroma-a-odstin

První kanál `oklch()`, od `0` (černá) do `1` (bílá). Odpovídá vnímání oka, takže barvy se stejnou světlostí mají s bílou nebo černou podobný kontrast.

## --term-- chroma

en: chroma
aliases: chromu, chromou, chromy
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
lekce: css-design/barvy-a-typografie#oklch-svetlost-chroma-a-odstin

Druhý kanál `oklch()`: jak moc je barva sytá. `0` je šedá, běžné barvy na webu mají 0.05 až 0.2.

## --term-- relativní barva

en: relative color syntax
aliases: relativní barvy, relativní barvou, relativních barev, relativní barvu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors
lekce: css-design/barvy-a-typografie#stupnice-odstinu-z-jedne-barvy

Zápis `oklch(from <barva> l c h)`, který rozloží existující barvu na kanály a z nich poskládá novou. Kanály jsou čísla, takže `calc(l + 0.1)` funguje a `calc(l + 10%)` ne.

## --term-- primitivní token

en: primitive token
aliases: primitivní tokeny, primitivních tokenů, primitivním tokenem
lekce: css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny

Proměnná, která pojmenovává hodnotu z palety nebo stupnice (`--gray-600`, `--brand-100`). Komponenty ji přímo nepoužívají.

## --term-- sémantický token

en: semantic token
aliases: sémantické tokeny, sémantických tokenů, sémantickým tokenem, sémantickými tokeny
lekce: css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny

Proměnná, která pojmenovává účel (`--color-text-muted`, `--color-surface`) a ukazuje na primitivní token. Tmavý motiv mění jen tyhle tokeny.

## --term-- modulární stupnice

en: modular scale
aliases: modulární stupnici, modulární stupnicí
lekce: css-design/barvy-a-typografie#typograficka-stupnice

Řada velikostí písma, kde každý stupeň vznikne vynásobením předchozího stejným poměrem (třeba 1.25): 16, 20, 25, 31,25 px.

## --term-- variabilní font

en: variable font
aliases: variabilní fonty, variabilního fontu, variabilním fontem, variabilní písmo
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts
lekce: css-design/barvy-a-typografie#pisma-font-face-a-variabilni-fonty

Jeden soubor písma, který obsahuje plynulý rozsah vah (případně šířek). V `@font-face` se zapisuje jako `font-weight: 100 900`.

## --term-- auto layout

en: auto layout
aliases: auto layoutu, auto layoutem
lekce: css-design/cteni-navrhu#auto-layout-je-flexbox

Nastavení rámce ve Figmě, které řadí jeho děti za sebe se směrem, mezerou, odsazením a zarovnáním. V CSS odpovídá flex kontejneru (u varianty *Grid* mřížce).

## --term-- viewBox

en: viewBox
aliases: viewBoxu, viewBoxem
mdn: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox
lekce: css-design/svg-a-ikony#viewbox-souradnice-ne-pixely

Atribut SVG se čtyřmi čísly (`0 0 24 24`), který určuje souřadnice kresby. Velikost na stránce dá až CSS a prohlížeč souřadnice na ni přepočítá, takže vektor zůstane ostrý.

## --term-- currentColor

en: currentColor
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword
lekce: css-design/svg-a-ikony#currentcolor-ikona-v-barve-textu

Klíčové slovo, které znamená aktuální hodnotu `color`. V `fill` nebo `stroke` inline SVG zařídí, že se ikona barví s textem kolem sebe.

## --term-- SVG sprite

en: SVG sprite
aliases: spritu, sprite, spritem
lekce: css-design/svg-a-ikony#tri-zpusoby-jak-ikonu-vlozit

Jeden skrytý `<svg>` se značkami `<symbol>`, na které se stránka odkazuje přes `<use href="#id">`. Kresba je v HTML jednou a přitom se barví přes `currentColor` jako inline SVG.
