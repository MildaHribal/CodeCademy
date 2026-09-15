## --term-- proměnná

en: variable
aliases: proměnné, proměnnou, proměnných, proměnným, proměnnými
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Variable
lekce: js-zaklady/promenne-a-typy#const-a-let

Pojmenované místo pro hodnotu. Deklaruje se přes `const` (jméno nejde přiřadit znovu) nebo `let` (jde).

## --term-- datový typ

en: data type
aliases: datového typu, datovým typem, datové typy, datových typů, typ hodnoty
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#data_structures_and_types
lekce: js-zaklady/promenne-a-typy#datove-typy

Druh hodnoty, který určuje, co s ní jde dělat: `string`, `number`, `boolean`, `undefined`, `null` a objekty. Zjistí ho operátor `typeof`.

## --term-- přetypování

en: type coercion
aliases: přetypováním, přetypovat, převod typů, implicitní převod
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion
lekce: js-zaklady/promenne-a-typy#text-a-cislo-operator-a-prevod-typu

Automatický převod hodnoty na jiný typ, který JavaScript udělá sám, třeba u `'5' - 2` nebo `'' == 0`. Výslovný převod zapíšeš přes `Number()` nebo `String()`.

## --term-- šablonový řetězec

en: template literal
aliases: šablonového řetězce, šablonovým řetězcem, šablonové řetězce, šablonových řetězců
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
lekce: js-zaklady/promenne-a-typy#sablonovy-retezec

Text ve zpětných uvozovkách, do kterého se přes `${…}` vkládají hodnoty výrazů. Smí mít víc řádků.

## --term-- přísná rovnost

en: strict equality
aliases: přísné rovnosti, přísnou rovnost, přísnou rovností
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
lekce: js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna

Porovnání `===`, které vrátí `true` jen pro stejnou hodnotu stejného typu. Na rozdíl od `==` typy nepřevádí, takže `'10' === 10` je `false`.

## --term-- truthy

en: truthy
aliases: pravdivá hodnota, pravdivé hodnoty, pravdivou hodnotu
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
lekce: js-zaklady/porovnani-a-logika#truthy-a-falsy

Hodnota, která se v podmínce chová jako pravda. Truthy je všechno kromě falsy hodnot, tedy i `'0'`, `'false'` a `-1`.

## --term-- falsy

en: falsy
aliases: nepravdivá hodnota, nepravdivé hodnoty, nepravdivou hodnotu
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
lekce: js-zaklady/porovnani-a-logika#truthy-a-falsy

Hodnota, která se v podmínce chová jako nepravda: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` a `NaN`.

## --term-- propadání

en: fall-through
aliases: propadne, propadnutí, propadávání
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch#breaking_and_fall-through
lekce: js-zaklady/porovnani-a-logika#switch-a-propadani

Chování `switch`: od nalezeného `case` se provádějí příkazy dál i v dalších větvích, dokud nenarazí na `break`.

## --term-- iterace

en: iteration
aliases: iterací, iteraci, průchod cyklem, průchody cyklem
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration
lekce: js-zaklady/cykly#cyklus-for

Jeden průchod tělem cyklu. Před každou iterací se kontroluje podmínka, po ní se u `for` provede krok.

## --term-- off-by-one

en: off-by-one error
aliases: chyba o jedna, chyby o jedna
lekce: js-zaklady/cykly#kolikrat-cyklus-probehne

Chyba, kdy cyklus proběhne o jeden průchod víc nebo míň, než měl. Vzniká ve startu (`0` × `1`) nebo v porovnání (`<` × `<=`).

## --term-- pseudokód

en: pseudocode
aliases: pseudokódu, pseudokódem
lekce: js-zaklady/reseni-problemu#3-rozloz-reseni-na-kroky-v-komentarich

Postup řešení zapsaný slovy po malých krocích, bez syntaxe jazyka. V Akademii ho píšeš do komentářů jako podcíle, které pak nahradíš kódem.

## --term-- stack trace

en: stack trace
aliases: stack trace chyby, výpis zásobníku
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack
lekce: js-zaklady/cteni-chyb-a-debugger#jak-cist-hlasku-a-stack-trace

Řádky `at …` pod chybovou hláškou. Nahoře je místo, kde program spadl, pod ním funkce, které ho tam postupně zavolaly, se souborem a číslem řádku.

## --term-- breakpoint

en: breakpoint
aliases: breakpointu, breakpointem, breakpointy, bod přerušení
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger
lekce: js-zaklady/cteni-chyb-a-debugger#debugger-zastav-program-a-podivej-se-dovnitr

Místo, kde se program v DevTools zastaví před provedením řádku. Nastavíš ho kliknutím na číslo řádku v panelu Sources nebo příkazem `debugger;` v kódu.

## --term-- ternární operátor

en: conditional (ternary) operator
aliases: ternárního operátoru, ternárním operátorem, ternární operátory
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator
lekce: js-zaklady/porovnani-a-logika#ternarni-operator

Výraz `podmínka ? hodnota1 : hodnota2`, který vrátí jednu ze dvou hodnot podle podmínky. Hodí se na výběr hodnoty, na tři a víc možností je čitelnější `if`/`else if`.

## --term-- nekonečná smyčka

en: infinite loop
aliases: nekonečné smyčky, nekonečnou smyčku, nekonečnou smyčkou, nekonečný cyklus
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration
lekce: js-zaklady/cykly#nekonecna-smycka

Cyklus, jehož podmínka nikdy nepřestane platit, typicky kvůli chybějícímu kroku nebo kroku špatným směrem. Karta prohlížeče zamrzne; Akademie takovou smyčku zastaví hláškou.

## --term-- okrajový případ

en: edge case
aliases: okrajové případy, okrajového případu, okrajových případů, okrajovým případem
lekce: js-zaklady/reseni-problemu#2-vymysli-priklady-i-ty-okrajove

Vstup na hraně povolených hodnot — nula, jednička, prázdný text, hodnota přesně na hranici podmínky. Právě na něm se nejčastěji ukáže chyba, proto patří do každé sady příkladů.
