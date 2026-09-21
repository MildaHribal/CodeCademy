## --term-- odeslání formuláře

en: form submission
lekce: html-formulare/jak-funguje-formular

Proces, kdy prohlížeč posbírá data ze vstupních polí formuláře a odešle je metodou (GET nebo POST) na adresu určenou v action.

## --term-- action

en: action
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-action
lekce: html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

URL adresa (nebo endpoint), na kterou prohlížeč pošle nasbíraná data z formuláře. Když atribut chybí, odejdou data na adresu stránky, na které formulář je.

## --term-- metoda formuláře

en: form method
aliases: method, metodu formuláře, metodou formuláře
lekce: html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

Atribut `method` s hodnotou `get` (výchozí) nebo `post`. `get` přidá data do adresy za otazník, `post` je pošle v těle požadavku a adresa zůstane čistá.

## --term-- atribut name

en: name attribute
aliases: name, atributem name, atributu name
lekce: html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

Jméno dvojice, pod kterým se hodnota pole odešle. Pole bez `name` se neodešle vůbec — `id`, třída ani popisek na tom nic nezmění.

## --term-- label

en: label
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
lekce: html-formulare/jak-funguje-formular

Značka, která vytváří textový popisek formulářového pole. Pomocí atributu `for` (který se odkazuje na `id` pole) zaručuje, že prohlížeč pochopí, které pole popisek popisuje.

## --term-- skryté pole

en: hidden input
aliases: skrytého pole, skrytá pole, skrytým polem
lekce: html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

Pole `type="hidden"`, které uživatel nevidí, ale odešle se jako každé jiné. Hodí se na hodnoty, které si stránka nese s sebou (id, krok průvodce), ne na tajemství — v HTML je vidí každý.

## --term-- zaškrtávací políčko

en: checkbox
aliases: checkbox, zaškrtávacího políčka, zaškrtávací políčka
lekce: html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

Pole `type="checkbox"`, které se odešle **jen když je zaškrtnuté**. Hodnotou je jeho `value`, a když `value` chybí, pošle se `on`. Nezaškrtnuté políčko neodešle nic, žádné `off` neexistuje.

## --term-- odesílací tlačítko

en: submit button
aliases: odesílacího tlačítka, odesílacím tlačítkem, submit
lekce: html-formulare/jak-funguje-formular#tlacitka-submit-button-a-reset

Tlačítko `type="submit"`, které formulář odešle. Uvnitř formuláře je to **výchozí** chování, takže každé tlačítko, které má dělat něco jiného, potřebuje `type="button"`.

## --term-- tlačítko reset

en: reset button
aliases: reset, tlačítka reset, tlačítkem reset
lekce: html-formulare/jak-funguje-formular#tlacitka-submit-button-a-reset

Tlačítko `type="reset"`, které vrátí všechna pole na výchozí hodnoty. Uživatel si ho plete s odesláním a ztrátu rozepsaných dat nejde vzít zpět, takže se skoro nikdy nepoužívá.

## --term-- implicitní odeslání

en: implicit submission
lekce: html-formulare/jak-funguje-formular#odeslani-enterem

Odeslání formuláře stiskem klávesy Enter v textovém poli. Prohlížeč se zachová, jako by uživatel klikl na **první odesílací tlačítko v pořadí HTML** — nerozhoduje tedy vzhled ani pořadí na obrazovce.

## --term-- validace v prohlížeči

en: client-side validation
aliases: validaci v prohlížeči, validace na klientovi, klientská validace
lekce: html-formulare/validace-v-prohlizeci#proc-to-nestaci

Kontrola vyplněných hodnot, kterou udělá prohlížeč ještě před odesláním. Je to pohodlí pro uživatele, ne bezpečnost: běží na jeho počítači, takže ji jde obejít v DevTools nebo požadavkem úplně mimo prohlížeč.

## --term-- validační atribut

en: validation attribute
aliases: validační atributy, validačních atributů, validačními atributy
lekce: html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

Atribut pole, kterým se pravidlo zapíše přímo do HTML: `required`, `minlength`, `maxlength`, `min`, `max`, `step`, `pattern`. Prohlížeč pak sám zastaví odeslání a chybu ohlásí.

## --term-- required

en: required
aliases: atribut required, povinné pole, povinná pole
lekce: html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

Atribut, který zakáže odeslat formulář s prázdným polem. U zaškrtávacího políčka znamená „musí být zaškrtnuté", u skupiny přepínačů „musí být vybraná jedna možnost".

## --term-- maxlength

en: maxlength
aliases: minlength, atribut maxlength, atribut minlength
lekce: html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

Dvojice atributů pro počet znaků v textovém poli. `maxlength` víc znaků rovnou napsat nedovolí, kdežto `minlength` se projeví až při odeslání.

## --term-- step

en: step
aliases: atribut step, krok hodnoty
lekce: html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

Atribut, který u čísla, data a času určuje **povolené násobky**, počítané od `min` (jinak od nuly). Neurčuje počet desetinných míst: se `step="0.01"` hodnota `1.005` neprojde.

## --term-- pattern

en: pattern
aliases: atribut pattern, patternem
lekce: html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

Atribut s regulárním výrazem, kterému musí hodnota textového pole odpovídat. Používá se tam, kde typ pole tvar nehlídá — třeba u telefonu nebo PSČ.

## --term-- typ pole

en: input type
aliases: type, typ vstupu, typem pole
lekce: html-formulare/validace-v-prohlizeci#validace-podle-typu-type

Atribut `type` u `<input>`. Rozhoduje o vzhledu pole, o klávesnici na mobilu i o tom, co prohlížeč zkontroluje sám: `email` hlídá tvar adresy, `url` schéma, `number` čísla, `tel` nehlídá nic.

## --term-- validační bublina

en: validation bubble
aliases: bublina prohlížeče, bublinu prohlížeče, validační bubliny
lekce: html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

Hláška, kterou prohlížeč ukáže u prvního vadného pole, když se formulář nepodaří odeslat. Píše ji prohlížeč ve svém jazyce a nastylovat se nedá.

## --term-- pseudotřída :invalid

en: :invalid
aliases: :invalid, invalid
lekce: html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy

Pseudotřída, která platí pro každé vadné pole **už od načtení stránky**. Prázdné povinné pole je vadné od první vteřiny, takže formulář svítí červeně dřív, než uživatel cokoli udělá.

## --term-- pseudotřída :user-invalid

en: :user-invalid
aliases: :user-invalid, user-invalid
lekce: html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy

Pseudotřída, která platí pro vadné pole až poté, co do něj uživatel sáhl nebo zkusil odeslat. Na obarvení chyb se hodí líp než `:invalid`; protějšek pro pole v pořádku je `:user-valid`.

## --term-- novalidate

en: novalidate
aliases: atribut novalidate
lekce: html-formulare/validace-v-prohlizeci#kdyz-chces-chyby-resit-po-svem

Atribut na `<form>`, který vypne bubliny prohlížeče a blokování odeslání. Pravidla v HTML platí dál, takže pseudotřídy v CSS i kontrola v JavaScriptu fungují — jen si chyby vypíšeš sám.
