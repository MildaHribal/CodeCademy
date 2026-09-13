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
