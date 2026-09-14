
## --card-- free

Když definujeme funkci pomocí `function nazev() {}`, jak se tento způsob nazývá?

### --back--

Deklarace funkce (function declaration).
Lze ji volat ještě předtím, než se v kódu objevila, protože funguje hoisting.

## --card-- free

Jaký je rozdíl mezi parametry a argumenty?

### --back--

**Parametry** jsou proměnné uvedené v definici funkce (co funkce očekává). **Argumenty** jsou konkrétní hodnoty předané funkci při jejím volání.

## --card-- free

Co vrátí funkce, která nemá explicitní klíčové slovo `return`?

### --back--

`undefined`.

## --card-- free

Jaký je rozdíl mezi globálním a lokálním rozsahem platnosti (scope)?

### --back--

Globální proměnné jsou dostupné kdekoli v programu. Lokální (funkční nebo blokové) jsou dostupné pouze uvnitř funkce nebo bloku, kde byly deklarovány.

## --card-- free

Co znamená „stínění“ (shadowing) proměnných?

### --back--

Když lokální proměnná (ve vnitřním scope) má stejný název jako proměnná ve vnějším scope. Vnitřní scope pak „vidí“ pouze svou lokální proměnnou, vnější je dočasně zastíněna.

## --card-- free

Co je to hoisting?

### --back--

Chování JavaScriptu, kdy jsou deklarace funkcí a proměnných logicky přesunuty na začátek jejich rozsahu platnosti ještě před spuštěním kódu.

## --card-- free

Proč u proměnných deklarovaných pomocí `let` a `const` nastává chyba, pokud je použijeme před jejich deklarací, ačkoliv podléhají hoistingu?

### --back--

Protože se nacházejí v tzv. zóně mrtvého kódu (Temporal Dead Zone, TDZ), dokud nedojde k vykonání jejich deklarace.

## --card-- free

Jaký rozsah platnosti má proměnná deklarovaná pomocí `var`?

### --back--

Funkční rozsah platnosti (function scope). Není omezena bloky (jako jsou cykly nebo podmínky).

## --card-- free

Co je to čistá funkce (pure function)?

### --back--

Funkce, která pro stejný vstup vždy vrátí stejný výstup a nemá žádné vedlejší účinky (např. nemodifikuje globální stav, nevypisuje do konzole).

## --card-- free

Když předáme název funkce jako argument (např. `setTimeout(mojeFunkce, 1000)`), jak se takové předané funkci říká?

### --back--

Callback.

## --card-- free

Co se stane, pokud do `setTimeout` napíšeme volání funkce s kulatými závorkami (např. `setTimeout(mojeFunkce(), 1000)`)?

### --back--

Funkce `mojeFunkce` se spustí okamžitě (předá se její výsledek jako callback, nejspíš `undefined`), místo aby počkala daný čas.

## --card-- free

Co je to guard clause (ochranná podmínka)?

### --back--

Podmínka na začátku funkce, která ji okamžitě ukončí (pomocí `return`), pokud nejsou splněny předpoklady pro její správný běh. Snižuje zanoření kódu.
