## --term-- deklarace funkce

en: function declaration
aliases: deklaraci funkce, deklarací funkce, deklarace funkcí
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function
lekce: js-funkce/funkce#deklarace-a-volani-funkce

Zápis funkce klíčovým slovem `function` se jménem: `function withVat(price) { … }`. Díky hoistingu jde funkci zavolat v celém jejím rozsahu, i nad řádkem, kde je napsaná.

## --term-- parametr

en: parameter
aliases: parametry, parametru, parametrem, parametrů
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Parameter
lekce: js-funkce/funkce#parametry-a-argumenty

Jméno v závorkách deklarace funkce. Uvnitř funkce se chová jako proměnná, která na začátku každého volání dostane hodnotu argumentu na stejné pozici, nebo `undefined`.

## --term-- argument

en: argument
aliases: argumenty, argumentu, argumentem, argumentů
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Argument
lekce: js-funkce/funkce#parametry-a-argumenty

Konkrétní hodnota, kterou při volání funkce napíšeš do závorek, třeba `1000` ve `withVat(1000)`. Argumenty se k parametrům přiřazují podle pořadí.

## --term-- návratová hodnota

en: return value
aliases: návratové hodnoty, návratovou hodnotu, návratovou hodnotou
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return
lekce: js-funkce/funkce#return-jak-funkce-vraci-vysledek

Hodnota, kterou funkce pošle přes `return` na místo, odkud se volala. Funkce bez `return` vrací `undefined`.

## --term-- funkční výraz

en: function expression
aliases: funkčního výrazu, funkčním výrazem, funkční výrazy
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function
lekce: js-funkce/funkce#vyraz-a-sipkova-funkce

Funkce vytvořená jako hodnota uvnitř výrazu, typicky uložená do proměnné: `const withVat = function (price) { … };`. Zavolat jde až po řádku, kde vznikne.

## --term-- šipková funkce

en: arrow function
aliases: šipkovou funkci, šipkovou funkcí, šipkové funkce, šipkových funkcí, šipka
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
lekce: js-funkce/funkce#vyraz-a-sipkova-funkce

Krátký zápis funkčního výrazu: `(price) => price * 1.21`. Bez složených závorek vrátí výraz za šipkou sám, se složenými závorkami potřebuje `return`.

## --term-- výchozí parametr

en: default parameter
aliases: výchozího parametru, výchozím parametrem, výchozí parametry, výchozí hodnota parametru
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
lekce: js-funkce/funkce#vychozi-a-zbytkove-parametry

Hodnota za rovnítkem v závorkách deklarace (`decimals = 2`), která se použije, když je argument `undefined`. Nula, prázdný text ani `null` ji nespustí.

## --term-- zbytkový parametr

en: rest parameter
aliases: zbytkového parametru, zbytkovým parametrem, zbytkové parametry
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
lekce: js-funkce/funkce#vychozi-a-zbytkove-parametry

Poslední parametr se třemi tečkami (`...distances`), který sebere všechny zbylé argumenty do pole. Bez argumentů je to prázdné pole.

## --term-- guard clause

en: guard clause
aliases: guard clauses, strážní podmínka, strážní podmínku, strážní podmínky
lekce: js-funkce/funkce#predcasny-return-guard-clause

Kontrola na začátku funkce, která při nesmyslném vstupu hned vrátí náhradní výsledek. Hlavní výpočet pak stojí na konci funkce bez zanoření do `else`.

## --term-- čistá funkce

en: pure function
aliases: čistou funkci, čistou funkcí, čisté funkce, čistých funkcí
lekce: js-funkce/funkce#cista-funkce

Funkce, která pro stejné argumenty vrátí vždy stejný výsledek a nic mimo sebe nemění. Testuje se jedním voláním a porovnáním výsledku.

## --term-- vedlejší efekt

en: side effect
aliases: vedlejší efekty, vedlejšího efektu, vedlejším efektem, vedlejších efektů
lekce: js-funkce/funkce#cista-funkce

Cokoli, co funkce udělá mimo vrácení hodnoty: výpis do konzole, změna proměnné venku, zápis do stránky nebo souboru.

## --term-- rozsah platnosti

en: scope
aliases: rozsahu platnosti, rozsahem platnosti, rozsahy platnosti, scope
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Scope
lekce: js-funkce/scope-a-hoisting#rozsah-platnosti-kde-je-promenna-videt

Část programu, ve které je proměnná vidět. Vytváří ho každá funkce a každý blok ve složených závorkách; `let` a `const` platí v bloku, `var` v celé funkci.

## --term-- stínění

en: shadowing
aliases: stíněním, zastíní, zastínit, zastíněná
lekce: js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku

Situace, kdy vnitřní rozsah deklaruje proměnnou se stejným jménem jako vnější. Vznikne druhá proměnná a vnější z vnitřku není vidět; změnou vnitřní se vnější nemění.

## --term-- lexikální rozsah

en: lexical scope
aliases: lexikálního rozsahu, lexikálním rozsahem, lexikální rozsah platnosti
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures#lexical_scoping
lekce: js-funkce/scope-a-hoisting#lexikalni-rozsah-a-zasobnik-volani

Pravidlo, podle kterého funkce hledá chybějící proměnné tam, kde je napsaná, ne tam, odkud se volá.

## --term-- zásobník volání

en: call stack
aliases: zásobníku volání, zásobníkem volání, call stack
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Call_stack
lekce: js-funkce/scope-a-hoisting#lexikalni-rozsah-a-zasobnik-volani

Seznam rozdělaných volání funkcí: nahoře ta, která právě běží, pod ní ty, které na ni čekají. V DevTools ho ukazuje panel Call Stack.

## --term-- hoisting

en: hoisting
aliases: hoistingu, hoistingem
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
lekce: js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

Chování, kdy jsou deklarace zaregistrované už od začátku svého rozsahu. Deklaraci funkce jde zavolat předem, `var` má předem `undefined` a `let`/`const` jsou do svého řádku v TDZ.

## --term-- TDZ

en: temporal dead zone
aliases: Temporal Dead Zone, časová mrtvá zóna
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz
lekce: js-funkce/scope-a-hoisting#hoisting-a-temporal-dead-zone-tdz

Úsek od začátku rozsahu po řádek deklarace `let` nebo `const`. Proměnná v něm existuje, ale čtení skončí `ReferenceError: Cannot access '…' before initialization`.

## --term-- callback

en: callback function
aliases: callbacku, callbackem, callbacky, callbacků, zpětné volání
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Callback_function
lekce: js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny

Funkce předaná jako argument jiné funkci, která ji sama zavolá — kdy a s jakými argumenty, rozhoduje ona. Předává se bez závorek.

## --term-- funkce vyššího řádu

en: higher-order function
aliases: funkci vyššího řádu, funkcí vyššího řádu, funkce vyšších řádů
lekce: js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny

Funkce, která jinou funkci přijímá jako argument nebo ji vrací, třeba `setTimeout` nebo `applyRule(price, rule)`.
