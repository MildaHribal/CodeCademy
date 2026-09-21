## --term-- index

en: index
aliases: indexu, indexem, indexy, indexů, indexech
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections
lekce: js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot

Pořadové číslo položky v poli. Počítá se od nuly, takže poslední položka má index `length - 1`. Čtení na neexistujícím indexu vrátí `undefined`.

## --term-- pole objektů

en: array of objects
aliases: poli objektů, polem objektů, pole objektu
lekce: js-pole/co-je-pole#pole-objektu

Pole, ve kterém je každá položka objekt se stejnými klíči, třeba seznam produktů nebo řádky z databáze. Nejčastější tvar dat, se kterým web pracuje.

## --term-- mutující metoda

en: mutating method
aliases: mutující metody, mutujících metod, mutující metodu, mutujícími metodami
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods
lekce: js-pole/co-je-pole#metody-ktere-pole-meni-a-metody-ktere-vraceji-nove

Metoda, která mění pole, na kterém ji zavoláš (`push`, `splice`, `sort`, `reverse`). Změna je vidět přes všechny proměnné, které na pole ukazují. Nemutující dvojčata vracejí nové pole (`toSpliced`, `toSorted`).

## --term-- predikát

en: predicate
aliases: predikátu, predikátem, predikáty
lekce: js-pole/metody-pole-do-hloubky#callback-funkce-kterou-vola-nekdo-jiny

Funkce, která o jedné položce odpoví pravdou nebo nepravdou. Dostávají ji `filter`, `find`, `findIndex`, `some` a `every`.

## --term-- akumulátor

en: accumulator
aliases: akumulátoru, akumulátorem, akumulátory
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
lekce: js-pole/metody-pole-do-hloubky#jak-pracuje-reduce

Průběžný výsledek v `reduce`. Callback ho dostane jako první argument a vrací jeho novou hodnotu; `reduce` vrátí hodnotu z posledního volání.

## --term-- porovnávací funkce

en: compare function
aliases: porovnávací funkci, porovnávací funkcí, porovnávacích funkcí, comparator
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#comparefn
lekce: js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce

Funkce `(a, b)`, podle které `sort` a `toSorted` řadí: záporné číslo znamená `a` před `b`, kladné `a` za `b`, nula „pořadí je jedno".

## --term-- stabilní řazení

en: stable sort
aliases: stabilního řazení, stabilním řazením
lekce: js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce

Řazení, které položky se stejnou hodnotou nechá v původním pořadí. `sort` i `toSorted` jsou v JavaScriptu stabilní.

## --term-- řetězení metod

en: method chaining
aliases: řetěz metod, řetězu metod, řetězení metod pole
lekce: js-pole/metody-pole-do-hloubky#retezeni

Volání další metody rovnou na výsledku předchozí, třeba `items.filter(…).map(…)`. Funguje, dokud metoda vrací pole.

## --term-- pole

en: array
aliases: poli, polem, polí, polím, polích
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
lekce: js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot

Jedna hodnota, ve které je očíslovaný seznam dalších hodnot, zapsaný v hranatých závorkách. Je to zvláštní druh objektu, takže `typeof []` vrátí `'object'` a proměnná v sobě nemá pole samotné, ale odkaz na ně.

## --term-- length

en: length
aliases: vlastnost length, délka pole, délku pole
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length
lekce: js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot

Vlastnost pole s počtem položek. Protože se indexy počítají od nuly, má poslední položka index `length - 1`; zápis do `length` navíc pole zkrátí, takže `list.length = 0` je mutace, ne neškodné čtení.

## --term-- nemutující metoda

en: copying method
aliases: nemutující metody, nemutujících metod, nemutující metodu, nemutujícími metodami, kopírující metoda
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods
lekce: js-pole/co-je-pole#metody-ktere-pole-meni-a-metody-ktere-vraceji-nove

Metoda, která původní pole nechá být a vrátí nové pole nebo jednu hodnotu — `slice`, `map`, `filter`, `toSorted`, `toSpliced`. Pozná se podle toho, že se její výsledek musí někam uložit: když ho zahodíš, nestalo se vůbec nic.

## --term-- mělká kopie pole

en: shallow copy of an array
aliases: mělkou kopii pole, mělké kopie pole, mělkou kopií pole
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
lekce: js-pole/co-je-pole#melka-kopie

Nové pole vyrobené z `[...a]`, `a.slice()` nebo `Array.from(a)`, do kterého se ale zkopírovaly jen odkazy na původní položky. Samotné pole je nové (`a === copy` je `false`), objekty uvnitř jsou ale sdílené, takže `copy[0].quantity = 5` změní i originál. Oddělíš je až tím, že do kopie vložíš nový objekt.

## --term-- slice

en: slice
aliases: metoda slice
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
lekce: js-pole/co-je-pole#slice-a-splice

Vrátí nové pole s výřezem od jednoho indexu po druhý (ten už do výřezu nepatří) a původní pole nechá být. Plete se se `splice`, které se liší jediným písmenem — ale pole rovnou mutuje.

## --term-- splice

en: splice
aliases: metoda splice
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
lekce: js-pole/co-je-pole#slice-a-splice

Vyřízne nebo vloží položky **přímo v původním poli** a vrátí to, co vyřízl. Když funkce dostane pole od volajícího, `splice` mu ho zkrátí i tam, kde se vykresluje; nemutující dvojče se jmenuje `toSpliced`.

## --term-- indexOf

en: indexOf
aliases: metoda indexOf
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
lekce: js-pole/co-je-pole#indexof-v-podmince

Vrátí index první shody, nebo `-1`, když hodnota v poli není. Odpovídá na otázku „kde", ne „jestli", a v podmínce proto zradí: index `0` je nepravda a `-1` pravda. Na ano/ne je `includes` nebo porovnání s `-1`.

## --term-- Array.isArray

en: Array.isArray
aliases: isArray
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
lekce: js-pole/co-je-pole#typeof-pole-je-object

Jediný spolehlivý způsob, jak zjistit, že hodnota je pole. `typeof` tady nepomůže, protože u pole vrací `'object'` stejně jako u obyčejného objektu, takže podmínka `typeof value === 'array'` neplatí nikdy.

## --term-- filter

en: filter
aliases: metoda filter
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
lekce: js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

Vrátí nové pole s **původními** položkami, u kterých callback odpověděl pravdivě — je tedy stejně dlouhé, nebo kratší. Od `map` se liší tím, že položky vybírá, nepřetváří; a když callback kvůli zapomenutému `return` nevrací nic, projde tiše prázdné pole.

## --term-- find

en: find
aliases: metoda find
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
lekce: js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

Vrátí **první** položku, u které callback odpověděl pravdivě, a `undefined`, když žádná nevyhoví. Od `filter` se liší tím, že vrací jednu položku, ne pole; `findIndex` vrátí místo ní její index, nebo `-1`.

## --term-- forEach

en: forEach
aliases: metoda forEach
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
lekce: js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

Cyklus zapsaný jako metoda: zavolá callback pro každou položku, vrácené hodnoty zahodí a sám vrací `undefined`. Hodí se na vedlejší efekty (vypsat, odeslat), ne na výrobu nového pole — a neumí `break` ani nepočká na `await` uvnitř callbacku.

## --term-- reduce

en: reduce
aliases: metoda reduce
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
lekce: js-pole/metody-pole-do-hloubky#jak-pracuje-reduce

Nejobecnější metoda pole: z celého pole udělá jedinou hodnotu. Callback dostane akumulátor a položku a vrací novou hodnotu akumulátoru, `reduce` pak vrátí tu poslední — výsledkem proto může být číslo, text, objekt i pole podle toho, čím akumulátor začal.

## --term-- počáteční hodnota reduce

en: initial value
aliases: počáteční hodnotu reduce, počáteční hodnoty reduce, druhý argument reduce
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#initialvalue
lekce: js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty

Druhý argument `reduce`, který je akumulátorem při prvním volání callbacku a určuje typ výsledku. Bez ní se akumulátorem stane první položka pole: u pole objektů z toho vyjde `[object Object]250` a nad prázdným polem `reduce` rovnou vyhodí `TypeError`.

## --term-- sort

en: sort
aliases: metoda sort
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
lekce: js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce

Seřadí pole **na místě** a vrátí totéž pole, takže přeháže i data toho, kdo ti pole půjčil. Bez porovnávací funkce navíc převede položky na text, a `[10, 9, 1]` proto seřadí na `[1, 10, 9]`.

## --term-- toSorted

en: toSorted
aliases: metoda toSorted
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
lekce: js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce

Nemutující dvojče `sort`: vrátí seřazenou kopii a původní pole nechá být. Porovnávací funkci ale potřebuje stejně — bez ní řadí čísla jako text, jen bez mutace.

## --term-- for…of

en: for...of
aliases: for of, cyklus for…of, cyklus for of
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
lekce: js-pole/metody-pole-do-hloubky#kdy-metody-a-kdy-for-of

Cyklus, který projde položky pole jednu po druhé. Proti metodám pole umí `break` a `continue` a uvnitř se dá postupně čekat přes `await` — proto se k němu vracíš tam, kde metody nestačí, kdežto na přetváření dat je čitelnější metoda.
