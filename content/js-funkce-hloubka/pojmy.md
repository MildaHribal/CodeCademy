## --term-- closure

en: closure
aliases: closures, closuru, closurou, closury, uzávěr, uzávěru
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
lekce: js-funkce-hloubka/closures#closure-prostredi-prezije-navrat-funkce

Funkce spolu s prostředím, ve kterém vznikla. Vidí proměnné z toho prostředí i poté, co vnější funkce doběhla, a pamatuje si samotné proměnné, ne jejich hodnoty.

## --term-- továrna funkcí

en: function factory
aliases: továrny funkcí, továrnu funkcí, továrnou funkcí, továrna, továrny, továrnu
lekce: js-funkce-hloubka/closures#kazde-zavolani-tovarny-vytvori-nove-prostredi

Funkce, která vyrábí a vrací jiné funkce. Každé její zavolání vytvoří nové prostředí, takže každá vyrobená funkce má vlastní stav.

## --term-- soukromý stav

en: private state
aliases: soukromého stavu, soukromým stavem, soukromém stavu
lekce: js-funkce-hloubka/closures#soukromy-stav

Data v prostředí továrny, ke kterým se dá dostat jen přes funkce, které továrna vrátila. Zvenku je nikdo nepřečte ani nepřepíše.

## --term-- obalující funkce

en: wrapper function
aliases: obalující funkci, obalující funkcí, obalujících funkcí, obal, obalu, obalem, wrapper
lekce: js-funkce-hloubka/closures#funkce-ktera-obali-jinou-funkci

Funkce, která dostane jinou funkci a vrátí novou funkci, jež ji zavolá a přidá něco navíc: počítání, mezipaměť nebo zpoždění. Argumenty předává dál přes `(...args) => fn(...args)`.

## --term-- částečná aplikace

en: partial application
aliases: částečné aplikace, částečnou aplikaci, částečnou aplikací
lekce: js-funkce-hloubka/closures#funkce-ktera-obali-jinou-funkci

Vytvoření nové funkce, která má některé argumenty původní funkce už předvyplněné a čeká jen na zbytek.

## --term-- mezipaměť

en: cache
aliases: mezipaměti, mezipamětí, cache
lekce: js-funkce-hloubka/closures#closure-a-pamet

Úložiště už spočítaných výsledků, ze kterého se hotový výsledek vezme místo nového výpočtu. Často je to `Map` v prostředí funkce.

## --term-- memoizace

en: memoization
aliases: memoizaci, memoizací, memoizovaná funkce, memoizovanou funkci, memoize
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Memoization
lekce: js-funkce-hloubka/closures#closure-a-pamet

Technika, kdy si funkce pro stejné argumenty pamatuje výsledek v mezipaměti a podruhé ho vrátí bez výpočtu. Funguje spolehlivě jen u čistých funkcí.

## --term-- debounce

en: debounce
aliases: debouncem, debounci
lekce: js-funkce-hloubka/workshop-tovarny-funkci/014

Obal, který funkci zavolá až po určité době klidu. Každé další zavolání během čekání odpočet zruší a začne znovu, takže funkce proběhne jednou za sérii, třeba po dopsání textu.

## --term-- throttle

en: throttle
aliases: throttlem, throttlu
lekce: js-funkce-hloubka/workshop-tovarny-funkci/017

Obal, který funkci pustí hned a pak nejvýš jednou za daný interval. Zavolání mezi tím zahodí. Hodí se na opakované kliknutí nebo posouvání.

## --term-- vazba this

en: this binding
aliases: vazby this, vazbu this, vazbou this
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
lekce: js-funkce-hloubka/this#this-je-objekt-pred-teckou

Určení, na jaký objekt ukazuje `this`. Nastaví se znovu při každém volání podle toho, jak se funkce volá: přes tečku, s `new`, přes `call`/`apply`/`bind`, nebo bez objektu.

## --term-- strict mode

en: strict mode
aliases: strict modu, strict modem, striktní režim
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
lekce: js-funkce-hloubka/this#volani-bez-tecky-a-strict-mode

Přísnější režim JavaScriptu. Mimo jiné nastaví `this` při volání funkce bez objektu na `undefined` místo globálního objektu. ES moduly a třídy ho mají automaticky.

## --term-- explicitní vazba

en: explicit binding
aliases: explicitní vazby, explicitní vazbou, explicitní vazbu
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
lekce: js-funkce-hloubka/this#call-apply-a-bind-this-natvrdo

Určení `this` ručně přes `call`, `apply` nebo `bind`. `bind` vrátí novou funkci, jejíž `this` už nic nezmění.
