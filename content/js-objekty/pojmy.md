## --term-- objekt

en: object
aliases: objektu, objektem, objekty, objektů, objektech
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
lekce: js-objekty/objekty#objekt-a-tecka

Hodnota, ve které má každý údaj své jméno: dvojice `klíč: hodnota` ve složených závorkách. Proměnná objekt neobsahuje, jen na něj odkazuje.

## --term-- vlastnost

en: property
aliases: vlastnosti, vlastností, vlastnostmi
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript
lekce: js-objekty/objekty#objekt-a-tecka

Jedna dvojice `klíč: hodnota` v objektu. Čte se tečkou (`product.price`), nebo hranatými závorkami, když je klíč v proměnné (`product[field]`).

## --term-- vypočítaný klíč

en: computed property name
aliases: vypočítaného klíče, vypočítaným klíčem, vypočítané klíče
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names
lekce: js-objekty/objekty#vypocitany-klic-v-literalu

Klíč v hranatých závorkách přímo v zápisu objektu, `{ [field]: value }`. Výraz v závorkách se vyhodnotí a jeho výsledek se stane jménem klíče.

## --term-- destrukturalizace

en: destructuring
aliases: destrukturalizací, destrukturalizaci, destrukturalizace v parametru
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
lekce: js-objekty/objekty#destrukturalizace-vlastnosti-rovnou-do-promennych

Zápis, který vytáhne vlastnosti objektu (nebo položky pole) rovnou do proměnných: `const { nick, level = 1 } = player`. Výchozí hodnota zabere jen na `undefined`.

## --term-- primitivní hodnota

en: primitive value
aliases: primitivní hodnoty, primitivní hodnotu, primitivních hodnot, primitivum, primitiva
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Primitive
lekce: js-objekty/reference-a-mutace#primitivni-hodnoty-se-kopiruji

Číslo, text, `true`/`false`, `null`, `undefined` (a méně častý `bigint` a `symbol`). Přiřazení ji zkopíruje celou a změnit „uvnitř" nejde.

## --term-- reference

en: reference
aliases: referenci, referencí, reference na objekt, odkaz na objekt
lekce: js-objekty/reference-a-mutace#objekty-se-sdileji-pres-odkaz

Odkaz na objekt v paměti. Proměnná s objektem drží referenci, ne objekt, a přiřazení `b = a` zkopíruje jen ji — obě proměnné pak ukazují na tentýž objekt.

## --term-- mutace

en: mutation
aliases: mutaci, mutací, mutace objektu, mutovat, mutuje
lekce: js-objekty/reference-a-mutace#mutace-objektu-nove-prirazeni

Změna objektu, na který proměnná ukazuje (`user.city = 'Brno'`). Uvidí ji každý, kdo na tentýž objekt ukazuje. Opakem je vytvoření nového objektu (`{ ...user, city: 'Brno' }`).

## --term-- rozprostření

en: spread syntax
aliases: spread, spreadem, spreadu, rozprostřením
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
lekce: js-objekty/reference-a-mutace#uprava-bez-mutace-novy-objekt

Zápis `...`, který vysype vlastnosti objektu do nových složených závorek (`{ ...user, city: 'Brno' }`) nebo položky pole do nových hranatých. Pozdější vlastnost přepíše dřívější.

## --term-- mělká kopie

en: shallow copy
aliases: mělkou kopii, mělké kopie, mělkou kopií
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy
lekce: js-objekty/kopie-a-json#melka-kopie-spread-a-object-assign

Nový objekt, do kterého se zkopírují vlastnosti originálu. Vnořené objekty se nezkopírují, kopie na ně jen ukazuje. Vytvoří ji `{ ...obj }` nebo `Object.assign({}, obj)`.

## --term-- hluboká kopie

en: deep copy
aliases: hlubokou kopii, hluboké kopie, hlubokou kopií
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
lekce: js-objekty/kopie-a-json#hluboka-kopie-structuredclone

Kopie, ve které jsou nové objekty ve všech patrech, takže jde měnit libovolně hluboko bez vlivu na originál. Vytvoří ji `structuredClone(obj)`.

## --term-- JSON

en: JavaScript Object Notation
aliases: JSONu, JSONem, formát JSON
mdn: https://developer.mozilla.org/en-US/docs/Glossary/JSON
lekce: js-objekty/kopie-a-json#json-data-jako-text

Textový zápis dat (objekty, pole, texty, čísla, `true`/`false`, `null`) pro ukládání a posílání. Převádí se přes `JSON.stringify` a `JSON.parse`; datum se stane textem, `undefined` a funkce zmizí.

## --term-- zbytek vlastností

en: rest properties
aliases: zbytkem vlastností, zbytku vlastností
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring#rest_properties
lekce: js-objekty/objekty#destrukturalizace-vlastnosti-rovnou-do-promennych

Zápis `...jméno` na konci destrukturalizace: posbírá všechny zbývající vlastnosti do nového objektu, `const { password, ...publicData } = user`.

## --term-- metoda

en: method
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Method
lekce: js-objekty/objekty#metody-funkce-ve-vlastnosti

Vlastnost objektu, jejíž hodnotou je funkce, třeba `console.log`.
