## --term-- třída

en: class
aliases: třídy, třídu, třídou, tříd, třídě, třídám
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
lekce: js-tridy-kolekce/tridy#trida-new-a-constructor

Šablona pro objekty se stejnými daty a chováním, zapsaná přes `class`. Pod kapotou je to funkce a objekt `prototype`, ve kterém leží metody.

## --term-- instance

en: instance
aliases: instancí, instanci, instancemi
lekce: js-tridy-kolekce/tridy#trida-new-a-constructor

Objekt vytvořený z třídy přes `new`. Má vlastní data z konstruktoru a polí třídy, metody sdílí s ostatními instancemi přes prototyp.

## --term-- konstruktor

en: constructor
aliases: konstruktoru, konstruktorem, konstruktory
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
lekce: js-tridy-kolekce/tridy#trida-new-a-constructor

Metoda `constructor` třídy, kterou zavolá `new`. Připraví data nové instance; `this` v ní je právě vytvářený objekt.

## --term-- pole třídy

en: class field
aliases: poli třídy, polí třídy, pole tříd
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields
lekce: js-tridy-kolekce/tridy#pole-tridy

Zápis `jméno = hodnota;` přímo v těle třídy. Hodnota se vyhodnotí pro každou novou instanci znovu, takže každá instance má třeba vlastní pole.

## --term-- soukromé pole

en: private field
aliases: soukromého pole, soukromém poli, soukromým polem, soukromá pole, soukromých polí
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties
lekce: js-tridy-kolekce/tridy#soukroma-pole

Pole třídy se jménem začínajícím `#`. Přístup k němu má jen kód v těle třídy, která ho deklaruje; zápis zvenku je syntaktická chyba.

## --term-- getter

en: getter
aliases: gettery, getteru, getterem, getterů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
lekce: js-tridy-kolekce/tridy#gettery-a-settery

Metoda označená `get`, která se čte jako vlastnost, bez závorek. Hodí se pro spočítané hodnoty a pro čtení soukromého pole zvenku.

## --term-- setter

en: setter
aliases: settery, setteru, setterem
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
lekce: js-tridy-kolekce/tridy#gettery-a-settery

Metoda označená `set`, která se zavolá při přiřazení do vlastnosti. Může hodnotu zkontrolovat nebo upravit, než ji uloží.

## --term-- statická metoda

en: static method
aliases: statické metody, statickou metodu, statickou metodou, statických metod, statické metodě
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
lekce: js-tridy-kolekce/tridy#staticke-cleny-static

Metoda označená `static`, která patří třídě, ne instanci: volá se `Třída.metoda()`. Typicky tovární metoda nebo pomocná funkce k celé třídě.

## --term-- dědičnost

en: inheritance
aliases: dědičnosti, dědičností
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends
lekce: js-tridy-kolekce/tridy#dedicnost-extends-a-super

Vztah „potomek je druh rodiče" zapsaný přes `extends`. Potomek převezme metody rodiče, může je přepsat a na rodiče dosáhne přes `super`.

## --term-- kompozice objektů

en: composition
aliases: kompozici objektů, kompozicí objektů
lekce: js-tridy-kolekce/tridy#kompozice-nebo-dedicnost

Objekt jiný objekt **má** (třeba v poli třídy) a volá jeho metody, místo aby z něj dědil. Pokladna má košík, přehrávač má frontu.

## --term-- prototyp

en: prototype
aliases: prototypu, prototypem, prototypy, prototypů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
lekce: js-tridy-kolekce/prototypy#kazdy-objekt-ma-prototyp

Objekt, na který jiný objekt skrytě odkazuje a ve kterém JavaScript hledá vlastnosti, které objekt sám nemá. Čte se přes `Object.getPrototypeOf`, nastavuje přes `Object.create` nebo `class`.

## --term-- řetěz prototypů

en: prototype chain
aliases: řetězu prototypů, řetězem prototypů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain
lekce: js-tridy-kolekce/prototypy#retez-prototypu

Posloupnost prototypů od objektu až k `null`, třeba `pole → Array.prototype → Object.prototype → null`. Hledání vlastnosti jde po řetězu, dokud ji nenajde.

## --term-- vlastní vlastnost

en: own property
aliases: vlastní vlastnosti, vlastních vlastností, vlastní vlastností
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
lekce: js-tridy-kolekce/prototypy#vlastni-nebo-zdedena-vlastnost

Vlastnost uložená přímo v objektu, ne zděděná z prototypu. Zjistí ji `Object.hasOwn`; `in` najde i zděděné.

## --term-- Map

en: Map
aliases: mapa, mapy, mapu, mapou, mapě
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
lekce: js-tridy-kolekce/map-a-set#map-slovnik-s-libovolnymi-klici

Slovník dvojic klíč → hodnota, kde klíčem může být cokoli a nepřevádí se na text. Pamatuje si pořadí vložení a zná `size`.

## --term-- Set

en: Set
aliases: množina, množiny, množinu, množinou, množině
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
lekce: js-tridy-kolekce/map-a-set#set-kazda-hodnota-jednou

Kolekce hodnot, ve které je každá hodnota nejvýš jednou. Rychle odpoví na `has` a umí množinové operace.

## --term-- množinové operace

en: set composition
aliases: množinových operací, množinovými operacemi, množinová operace
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition
lekce: js-tridy-kolekce/map-a-set#mnozinove-operace

Metody `Set` jako `union`, `intersection`, `difference` a `isSubsetOf`. Vracejí novou množinu nebo `true`/`false` a původní množiny nemění.

## --term-- WeakMap

en: WeakMap
aliases: weak mapa, weakmapy
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
lekce: js-tridy-kolekce/map-a-set#weakmap-data-k-objektu-dokud-objekt-zije

Mapa, jejíž klíče musí být objekty a kterou klíče nedrží naživu. Nemá `size` ani nejde procházet, protože záznamy můžou mizet s úklidem paměti.

## --term-- iterovatelný objekt

en: iterable
aliases: iterovatelný, iterovatelné, iterovatelná, iterovatelného objektu, iterovatelné objekty
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
lekce: js-tridy-kolekce/iteratory-generatory#co-je-iterovatelne

Objekt s metodou pod klíčem `Symbol.iterator`, která vyrobí iterátor. Přijímá ho `for…of`, spread, `Array.from` i rozbalení do proměnných.

## --term-- iterátor

en: iterator
aliases: iterátoru, iterátorem, iterátory, iterátorů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator
lekce: js-tridy-kolekce/iteratory-generatory#iteracni-protokol-symbol-iterator-a-next

Objekt s metodou `next()`, která vrací `{ value, done }`. Jde projít jen jednou; po posledním prvku vrací `done: true`.

## --term-- generátor

en: generator
aliases: generátoru, generátorem, generátory, generátorů
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
lekce: js-tridy-kolekce/iteratory-generatory#generatory-function-a-yield

Iterátor vrácený funkcí `function*`. Každé `next()` pustí tělo funkce k dalšímu `yield` a vrátí jeho hodnotu.

## --term-- líná sekvence

en: lazy sequence
aliases: líné sekvence, línou sekvenci, líné sekvenci
lekce: js-tridy-kolekce/iteratory-generatory#line-a-nekonecne-sekvence

Sekvence, která další hodnotu spočítá až ve chvíli, kdy si o ni někdo řekne. Díky tomu může být i nekonečná.

## --term-- iterator helper

en: iterator helpers
aliases: iterator helpers
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator#iterator_helper_methods
lekce: js-tridy-kolekce/iterator-helpers#metody-pole-primo-na-iteratoru

Metody jako `map`, `filter`, `take` a `toArray` přímo na iterátoru. Vracejí nový líný iterátor nebo výslednou hodnotu a nevyrábějí mezipole.
