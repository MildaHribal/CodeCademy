## --term-- kódová jednotka

en: code unit
aliases: kódové jednotky, kódovou jednotku, kódovými jednotkami, kódových jednotek, kódovým jednotkám
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Code_unit
lekce: js-retezce-cisla/retezce#unicode-diakritika-a-emoji

Základní 16bitová paměťová jednotka (UTF-16), kterou JavaScript používá k reprezentaci textu. Běžné znaky zabírají jednu kódovou jednotku, zatímco emoji a méně obvyklé znaky vyžadují dvě spárované jednotky (tzv. surrogate pair).

## --term-- grafém

en: grapheme
aliases: grafému, grafémem, grafémy, grafémů, grafémech
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
lekce: js-retezce-cisla/retezce#unicode-diakritika-a-emoji

Jednotlivý vizuální znak textu z pohledu lidského čtenáře (např. písmeno s háčkem nebo složené emoji rodiny či vlajky). Grafém se může skládat z více kódových bodů a kódových jednotek spojených dohromady.

## --term-- RegExp

en: regular expression
aliases: regulární výraz, regulárnímu výrazu, regulárním výrazem, regulární výrazy, regulárních výrazů, regulárními výrazy, regex
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
lekce: js-retezce-cisla/regularni-vyrazy#tridy-znaku-a-priznaky

Objekt reprezentující vzor pro vyhledávání, testování platnosti a nahrazování částí textu. V JavaScriptu se zapisuje buď literálem mezi lomítky (`/vzor/příznaky`), nebo konstruktorem `new RegExp()`.

## --term-- NaN

en: Not-a-Number
aliases: Not a Number
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN
lekce: js-retezce-cisla/cisla#number-isnan

Speciální hodnota číselného typu vyjadřující neplatný nebo nedefinovaný matematický výsledek (například dělení nuly nulou nebo nepovedený převod textu na číslo). Je to jediná hodnota v JavaScriptu, která se nerovná sama sobě (`NaN !== NaN`).

## --term-- plovoucí řádová čárka

en: floating-point
aliases: plovoucí řádové čárce, plovoucí řádovou čárkou, plovoucí čárka, plovoucí čárce, plovoucí čárkou, IEEE 754
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
lekce: js-retezce-cisla/cisla#desetinna-cisla

Způsob reprezentace čísel ve standardu IEEE 754 na 64 bitech s dvojitou přesností. Kvůli binárnímu převodu nelze některé zlomky (například 0.1 nebo 0.2) vyjádřit přesně, což při sčítání vede k drobným zaokrouhlovacím chybám (`0.1 + 0.2 !== 0.3`).

## --term-- neměnnost řetězce

en: string immutability
aliases: neměnnosti řetězce, neměnnost řetězců, neměnnosti řetězců, neměnný řetězec, neměnné řetězce, immutability
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type
lekce: js-retezce-cisla/retezce#retezec-se-neda-zmenit

Vlastnost řetězců v JavaScriptu, podle které jednou vytvořený text nelze na místě měnit. Zápis na index (`text[0] = 'a'`) změnu neprovede a všechny textové metody (`slice`, `trim`, `replaceAll`) vracejí nový řetězec, zatímco původní zůstává nedotčený.

## --term-- BigInt

en: BigInt
aliases: velká celá čísla, velkým celým číslům, velkých celých čísel
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
lekce: js-retezce-cisla/cisla#bigint

Primitivní datový typ pro bezpečnou práci s celými čísly libovolné velikosti, která přesahují limit `Number.MAX_SAFE_INTEGER` ($2^{53}-1$). Zapisuje se s příponou `n` (např. `9007199254740992n`) a nepodporuje desetinná čísla.

## --term-- Temporal

en: Temporal
aliases: rozhraní Temporal, API Temporal
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
lekce: js-retezce-cisla/intl-a-datum#temporal

Moderní standardní rozhraní pro práci s datem a časem navržené jako náhrada problematického objektu `Date`. Pracuje s neměnnými instancemi, správně řeší časová pásma i přechody na letní čas a nabízí oddělené typy pro datum bez času, čas bez data i kompletní časový okamžik.

## --term-- kvantifikátor

en: quantifier
aliases: kvantifikátoru, kvantifikátorem, kvantifikátory, kvantifikátorů, kvantifikátorech
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers
lekce: js-retezce-cisla/regularni-vyrazy#kvantifikatory-hladove-vs-line

Symbol v regulárním výrazu udávající, kolikrát se smí nebo musí opakovat předchozí znak, třída či skupina (např. `+`, `*`, `?` nebo `{2,5}`). Ve výchozím nastavení je hladový (greedy) a zabere co nejdelší odpovídající úsek textu.

## --term-- kotva

en: anchor
aliases: kotvy, kotvě, kotvami, kotvách, kotvám
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
lekce: js-retezce-cisla/regularni-vyrazy#kotvy-a-skupiny

Prvek regulárního výrazu, který neodpovídá žádnému konkrétnímu znaku, ale testuje pozici v textu. Mezi základní kotvy patří stříška `^` pro začátek řetězce, dolar `$` pro konec řetězce a `\b` pro hranici celého slova.
