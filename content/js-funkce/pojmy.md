## --term-- funkce

en: function
aliases: funkcí
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
lekce: js-funkce/funkce

Blok znovupoužitelného kódu.

## --term-- deklarace funkce

en: function declaration
aliases: deklaraci funkce, deklarací funkce
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function
lekce: js-funkce/funkce

Standardní způsob zápisu funkce pomocí klíčového slova `function` na začátku řádku. Lze ji volat ještě před jejím definováním v kódu.

## --term-- funkční výraz

en: function expression
aliases: funkčního výrazu, funkčním výrazem, funkčních výrazů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function
lekce: js-funkce/funkce

Funkce uložená do proměnné nebo předaná jako hodnota. Lze ji volat až poté, co kód dojde k její definici.

## --term-- šipková funkce

en: arrow function
aliases: šipkovou funkci, šipkovou funkcí, šipkové funkce, šipkových funkcí
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
lekce: js-funkce/funkce

Kratší syntaxe pro vytvoření funkce `(a, b) => a + b`. Nemá vlastní `this` a chová se jako funkční výraz.

## --term-- parametr

en: parameter
aliases: parametry, parametru, parametrů, parametry
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#function_parameters
lekce: js-funkce/funkce

Proměnná uvedená v definici funkce. Představuje hodnotu, kterou funkce při spuštění očekává.

## --term-- argument

en: argument
aliases: argumenty, argumentu, argumentů, argumenty
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Argument
lekce: js-funkce/funkce

Skutečná hodnota, kterou funkci předáme při jejím volání (např. v `console.log("ahoj")` je `"ahoj"` argument).

## --term-- výchozí parametr

en: default parameter
aliases: výchozího parametru, výchozím parametrem, výchozí hodnotu, výchozí hodnoty
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
lekce: js-funkce/funkce

Záložní hodnota parametru (pomocí rovníztka, např. `jmeno = "Host"`), která se použije, pokud funkci hodnotu nepředáme (`undefined`).

## --term-- zbytkový parametr

en: rest parameter
aliases: zbytkového parametru, zbytkovým parametrem, zbytkové parametry
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
lekce: js-funkce/funkce

Parametr začínající třemi tečkami (např. `...zbytek`), který „sbalí“ všechny zbývající argumenty volání do jednoho pole.

## --term-- návratová hodnota

en: return value
aliases: návratové hodnoty, návratovou hodnotu, návratovou hodnotou
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return
lekce: js-funkce/funkce

Hodnota, kterou funkce vyprodukuje a pošle zpět na místo, odkud byla zavolána. Uvádí se klíčovým slovem `return`.

## --term-- rozsah platnosti

en: scope
aliases: scope, scopu, scopem
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Scope
lekce: js-funkce/scope-a-hoisting

Určuje, kde v kódu je určitá proměnná viditelná a kde k ní lze přistoupit. Rozlišujeme např. blokový, funkční a globální scope.

## --term-- hoisting

en: hoisting
aliases: hoistingu, hoistingem
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
lekce: js-funkce/scope-a-hoisting

Chování JS, při kterém je deklarace funkcí a proměnných (vizuálně) vynesena na začátek jejich platného scope ještě před spuštěním samotného kódu.

## --term-- stínění

en: shadowing
aliases: stíněním, stínění proměnných
lekce: js-funkce/scope-a-hoisting

Situace, kdy se vnitřní proměnná jmenuje stejně jako proměnná ve vnějším scopu. Vnitřní tak „zakryje“ vnější, a vnější je dočasně nedostupná.

## --term-- TDZ

en: Temporal Dead Zone
aliases: zóna mrtvého kódu, zónu mrtvého kódu, zóny mrtvého kódu
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz
lekce: js-funkce/scope-a-hoisting

Časový úsek od začátku bloku do chvíle, než kód dojde k deklaraci proměnné (`let`, `const`). V této zóně dojde při použití proměnné k chybě.

## --term-- callback

en: callback function
aliases: callbacku, callbackem, callbacky
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Callback_function
lekce: js-funkce/funkce-jako-hodnoty

Funkce, která se předá jiné funkci jako argument a ta ji pak (obvykle později) spustí.

## --term-- čistá funkce

en: pure function
aliases: čistou funkci, čistou funkcí, čisté funkce, čistých funkcí
lekce: js-funkce/funkce

Funkce, která vždy pro stejné parametry vrátí stejný výsledek, a nemění svět kolem sebe (nevypisuje do konzole, nemění globální proměnné).

## --term-- guard clause

en: guard clause
aliases: ochranná podmínka, ochrannou podmínku, ochranné podmínky
lekce: js-funkce/workshop-prevodnik-jednotek

Podmínka na začátku funkce, která ji přes brzký `return` okamžitě ukončí, pokud nejsou splněny požadované předpoklady, a ušetří tak složité zanořování do `if/else`.
