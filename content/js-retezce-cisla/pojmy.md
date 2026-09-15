## --term-- neměnnost řetězce

en: string immutability
aliases: neměnnost řetězců, neměnný řetězec, neměnné řetězce
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#character_access
lekce: js-retezce-cisla/retezce#retezec-se-neda-zmenit

Řetězec se po vytvoření nedá změnit. Každá metoda (`trim`, `slice`, `replaceAll`) vrací nový řetězec a výsledek je potřeba uložit nebo vrátit.

## --term-- kódová jednotka

en: code unit
aliases: kódové jednotky, kódovou jednotku, kódovými jednotkami, kódových jednotek, kódových jednotkách
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Code_unit
lekce: js-retezce-cisla/retezce#unicode-diakritika-a-emoji

16bitový kousek, po kterém JavaScript ukládá text. Běžná písmena včetně české diakritiky zaberou jednu, většina emoji dvě. `length` a indexy počítají právě kódové jednotky.

## --term-- grafém

en: grapheme
aliases: grafému, grafémem, grafémy, grafémů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
lekce: js-retezce-cisla/retezce#unicode-diakritika-a-emoji

To, co člověk vidí jako jeden znak, třeba palec s odstínem pleti. Může se skládat z několika znaků Unicode. Spočítá ho `Intl.Segmenter` s `granularity: 'grapheme'`.

## --term-- normalizace

en: Unicode normalization
aliases: normalizaci, normalizací, normalizace Unicode
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
lekce: js-retezce-cisla/retezce#diakritika-a-normalize

Převod textu na jednotný zápis znaků. `normalize('NFC')` skládá písmeno a diakritiku do jednoho znaku, `normalize('NFD')` je rozkládá, takže diakritika jde potom smazat.

## --term-- kód jazyka

en: locale
aliases: kódem jazyka, kódu jazyka, locale
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument
lekce: js-retezce-cisla/intl-a-datum#intl-numberformat-ceny-procenta-a-jednotky

Text jako `'cs'` nebo `'cs-CZ'`, podle kterého `localeCompare` a `Intl` řadí a formátují. Bez něj se použije jazyk prohlížeče uživatele.

## --term-- plovoucí řádová čárka

en: floating point
aliases: plovoucí řádovou čárku, plovoucí řádové čárce, plovoucí řádovou čárkou
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_encoding
lekce: js-retezce-cisla/cisla#jeden-typ-number-a-plovouci-radova-carka

Způsob, jak počítač ukládá čísla ve dvojkové soustavě (norma IEEE 754). Desetiny jako `0.1` jdou uložit jen přibližně, proto `0.1 + 0.2` není přesně `0.3`.

## --term-- nejmenší jednotka měny

en: minor currency unit
aliases: nejmenší jednotku měny, nejmenší jednotce měny
lekce: js-retezce-cisla/cisla#pocitani-v-halerich

Haléř, cent: částky se ukládají a počítají jako celá čísla v téhle jednotce (`4990` místo `49.90`). Na koruny se převádí až při výpisu.

## --term-- NaN

en: Not a Number
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN
lekce: js-retezce-cisla/cisla#nan-a-number-isnan

Číselná hodnota, která říká, že výpočet nebo převod nedal smysl (`Number('tři')`). Nerovná se ničemu, ani sama sobě, proto se testuje přes `Number.isNaN`.

## --term-- BigInt

en: BigInt
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
lekce: js-retezce-cisla/cisla#velka-cisla-a-bigint

Typ pro libovolně velká celá čísla, zapisuje se s `n` na konci (`9007199254740993n`). Nesmí se míchat s obyčejným `number`.

## --term-- Temporal

en: Temporal
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
lekce: js-retezce-cisla/intl-a-datum#temporal-datum-bez-pasti

Nové rozhraní pro datum a čas, které nahrazuje `Date`. Má zvláštní typy pro datum bez času (`PlainDate`), datum s pásmem (`ZonedDateTime`) a délku (`Duration`), měsíce čísluje od jedničky a jeho objekty jsou neměnné.

## --term-- regulární výraz

en: regular expression
aliases: regulárního výrazu, regulárním výrazem, regulární výrazy, regulárních výrazů, regex
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
lekce: js-retezce-cisla/regularni-vyrazy#vzor-misto-konkretniho-textu

Vzor, který popisuje tvar textu (`/^\d{3} ?\d{2}$/` je PSČ). Používá se ke kontrole vstupu, hledání a nahrazování.

## --term-- třída znaků

en: character class
aliases: třídy znaků, třídou znaků
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes
lekce: js-retezce-cisla/regularni-vyrazy#tridy-znaku

Část regulárního výrazu, která popisuje jeden znak ze skupiny: `\d` číslice, `\s` bílý znak, `[a-z]` rozsah, `\p{L}` písmeno v jakémkoli jazyce.

## --term-- kvantifikátor

en: quantifier
aliases: kvantifikátoru, kvantifikátorem, kvantifikátory, kvantifikátorů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers
lekce: js-retezce-cisla/regularni-vyrazy#kvantifikatory-kolikrat

Značka za znakem nebo třídou, která říká, kolikrát se smí opakovat: `+`, `*`, `?`, `{4}`. Výchozí kvantifikátor je hladový a bere co nejvíc, s otazníkem za sebou (`+?`) je líný.

## --term-- kotva regulárního výrazu

en: anchor
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
lekce: js-retezce-cisla/regularni-vyrazy#kotvy-a-cely-text-ne-kousek

Značka, která nepopisuje znak, ale místo v textu: `^` začátek, `$` konec. Bez kotev výraz hledá shodu kdekoli uvnitř textu.

## --term-- příznak regulárního výrazu

en: flag
aliases: příznaky regulárního výrazu
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#advanced_searching_with_flags
lekce: js-retezce-cisla/regularni-vyrazy#priznaky-g-i-a-u

Písmeno za druhým lomítkem, které mění chování celého výrazu: `g` všechny výskyty, `i` bez ohledu na velikost písmen, `u` celé znaky Unicode a `\p{…}`.
