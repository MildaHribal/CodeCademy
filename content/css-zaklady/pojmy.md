## --term-- CSS pravidlo

en: CSS rule
aliases: CSS pravidla, CSS pravidlem, CSS pravidel, pravidlo CSS
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Syntax/Introduction
lekce: css-zaklady/jak-css-funguje#anatomie-pravidla-selektor-a-deklarace

Selektor a za ním ve složených závorkách seznam deklarací. Říká „těmhle prvkům nastav tyhle vlastnosti".

## --term-- selektor

en: selector
aliases: selektoru, selektorem, selektory, selektorů, selektorech
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors
lekce: css-zaklady/jak-css-funguje#anatomie-pravidla-selektor-a-deklarace

Část pravidla před složenými závorkami, která určuje, na které prvky se pravidlo použije. Selektor, který nevybere žádný prvek, je platný — jen se nic nestane.

## --term-- deklarace

en: declaration
aliases: deklaraci, deklarací, deklaracemi
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Syntax/Introduction
lekce: css-zaklady/jak-css-funguje#anatomie-pravidla-selektor-a-deklarace

Dvojice `vlastnost: hodnota` uvnitř pravidla, oddělená středníkem. Neplatnou deklaraci prohlížeč tiše zahodí a ostatní v pravidle platí dál.

## --term-- výchozí styly prohlížeče

en: user agent stylesheet
aliases: výchozích stylů prohlížeče, výchozími styly prohlížeče, výchozím stylům prohlížeče
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction
lekce: css-zaklady/jak-css-funguje#vychozi-styly-prohlizece

Stylopis zabudovaný v prohlížeči, který platí na každé stránce: okraj `body`, velké nadpisy, modré podtržené odkazy, odsazené seznamy. Tvoje CSS ho doplňuje a přepisuje.

## --term-- spočtená hodnota

en: computed value
aliases: spočtené hodnoty, spočtenou hodnotu, spočtenou hodnotou, spočtené hodnotě
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Property_value_processing
lekce: css-zaklady/devtools-pro-css#computed-spoctena-hodnota-a-odkud-prisla

Hodnota vlastnosti, se kterou prohlížeč u prvku počítá po vyhodnocení všech pravidel a dědičnosti. Ukazuje ji panel Computed v DevTools a v JavaScriptu `getComputedStyle`.

## --term-- pseudotřída

en: pseudo-class
aliases: pseudotřídy, pseudotřídu, pseudotřídou, pseudotříd, pseudotřídami
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes
lekce: css-zaklady/selektory-zaklad#pseudotridy-stav-prvku

Část selektoru za jednou dvojtečkou, která vybere prvek jen v určitém stavu nebo na určitém místě: `:hover`, `:focus-visible`, `:first-child`, `:nth-child()`.

## --term-- kombinátor

en: combinator
aliases: kombinátory, kombinátoru, kombinátorem, kombinátorů
mdn: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Combinators
lekce: css-zaklady/selektory-zaklad#kombinatory-vztahy-mezi-prvky

Znak mezi dvěma selektory, který určuje vztah prvků: mezera (potomek kdekoli uvnitř), `>` (přímé dítě), `+` (sourozenec hned za) a `~` (sourozenec kdekoli za).

## --term-- skupina selektorů

en: selector list
aliases: skupinu selektorů, skupině selektorů, skupinou selektorů
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Selector_list
lekce: css-zaklady/selektory-zaklad#kombinatory-vztahy-mezi-prvky

Selektory oddělené čárkou, které sdílejí jedno pravidlo: `h1, h2`. Když je jeden z nich neplatný, zahodí se celé pravidlo.

## --term-- pseudoprvek

en: pseudo-element
aliases: pseudoprvky, pseudoprvku, pseudoprvkem, pseudoprvků
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements
lekce: css-zaklady/selektory-zaklad#pseudoprvky-before-a-after

Část prvku, která v HTML není jako samostatný prvek, zapsaná za dvěma dvojtečkami: `::before`, `::after`, `::marker`. `::before` a `::after` vzniknou jen s vlastností `content`.

## --term-- CSS proměnná

en: custom property
aliases: CSS proměnné, CSS proměnnou, CSS proměnných, CSS proměnnými, vlastní CSS vlastnost, vlastní CSS vlastnosti
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
lekce: css-zaklady/vlastni-vlastnosti#definice-a-pouziti-jmeno-a-var

Vlastnost, jejíž jméno začíná dvěma pomlčkami (`--color-accent`). Hodnotu čte funkce `var()` a dědí se stromem jako barva textu, takže ji jde přepsat pro část stránky.

## --term-- záložní hodnota

en: fallback value
aliases: záložní hodnoty, záložní hodnotu, záložní hodnotou
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var
lekce: css-zaklady/vlastni-vlastnosti#zalozni-hodnota-ve-var

Druhý argument `var(--jméno, záloha)`. Použije se jen tehdy, když proměnná není definovaná — před špatnou hodnotou v proměnné nechrání.

## --term-- neplatná hodnota za běhu

en: invalid at computed-value time
aliases: neplatné hodnoty za běhu, neplatnou hodnotu za běhu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
lekce: css-zaklady/vlastni-vlastnosti#zalozni-hodnota-ve-var

Deklarace s `var()`, jejíž dosazená hodnota do vlastnosti nepasuje. Prohlížeč ji přijal, takže předchozí pravidla prohrála, a vlastnost se chová jako nenastavená: zdědí hodnotu od rodiče, nebo dostane výchozí.

## --term-- design token

en: design token
aliases: design tokeny, design tokenů, design tokenem, tokeny, tokenů, token
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
lekce: css-zaklady/vlastni-vlastnosti#design-tokeny-pojmenovani-a-skala

Pojmenovaná hodnota návrhu — barva, rozestup, velikost písma, zaoblení — uložená jako vlastní vlastnost na jednom místě. Jméno popisuje účel (`--color-accent`), ne vzhled (`--blue`).
