## --term-- výjimka

en: exception
aliases: výjimky, výjimku, výjimkou, výjimek, výjimkám
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
lekce: js-chyby-ladeni/vyjimky#co-udela-throw

Chyba vyhozená příkazem `throw` nebo vestavěnou operací. Přeruší běh a letí nahoru přes volající funkce, dokud ji nezachytí `catch`; když ji nezachytí nikdo, skript skončí.

## --term-- očekávaná chyba

en: operational error
aliases: očekávané chyby, očekávanou chybu, očekávaných chyb, chyba uživatele, chybu uživatele, chyby uživatele
lekce: js-chyby-ladeni/vyjimky#chyba-uzivatele-a-chyba-programu

Chyba, se kterou musí aplikace počítat, protože ji způsobí okolí: špatně vyplněné políčko, poškozený soubor, výpadek sítě. Chytá se a mění na srozumitelnou hlášku nebo náhradní hodnotu.

## --term-- chyba programu

en: programmer error
aliases: chyby programu, chybu programu, chybou programu, chyb programu
lekce: js-chyby-ladeni/vyjimky#chyba-uzivatele-a-chyba-programu

Chyba v kódu samotném: překlep ve jménu, čtení z `undefined`, špatný typ argumentu. Nechytá se potichu — má spadnout nahlas, aby ji autor našel a opravil.

## --term-- příčina chyby

en: error cause
aliases: příčinu chyby, příčinou chyby, příčiny chyby
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
lekce: js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause

Původní chyba uložená ve vlastnosti `cause` nové chyby: `new Error('Pozici nejde načíst', { cause: error })`. Nová zpráva řekne, při čem chyba vznikla, a detail původní chyby se neztratí.

## --term-- polykání chyb

en: swallowing errors
aliases: spolknutá chyba, spolknutou chybu, spolkne chybu, polykání chyby
lekce: js-chyby-ladeni/vyjimky#prazdny-catch-spolkne-chybu-programu

Chycení chyby, po kterém se nic nestane: prázdný `catch` nebo `catch`, který chybu nevyhodí dál. Program pokračuje se špatnými daty a v konzoli po chybě nezůstane stopa.

## --term-- vlastní třída chyby

en: custom error class
aliases: vlastní třídu chyby, vlastní třídy chyb, vlastní třídy chyby, vlastních tříd chyb, vlastní chyba, vlastní chyby
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
lekce: js-chyby-ladeni/vlastni-chyby#vlastni-trida-chyby

Potomek `Error` (`class ValidationError extends Error`) s vlastním `name` a údaji navíc. `catch` podle ní přes `instanceof` pozná, o jakou chybu jde.

## --term-- výsledkový objekt

en: result object
aliases: výsledkového objektu, výsledkovým objektem, výsledkové objekty
lekce: js-chyby-ladeni/vlastni-chyby#vyjimka-nebo-navratova-hodnota

Návratová hodnota, která nese úspěch i neúspěch: `{ ok: true, value }` nebo `{ ok: false, errors }`. Hodí se tam, kde je neúspěch běžná odpověď a volající chce všechny chyby najednou.

## --term-- validace na hranici

en: validation at the boundary
aliases: validaci na hranici, validací na hranici, hranice aplikace, hranici aplikace
lekce: js-chyby-ladeni/vlastni-chyby#validace-na-hranici

Data se zkontrolují a převedou do správného tvaru jednou, v místě, kde vstupují do aplikace (formulář, JSON, adresa). Zbytek programu jim pak věří.
