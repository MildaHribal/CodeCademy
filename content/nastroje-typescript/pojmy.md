## --term-- typová anotace

en: type annotation
aliases: typové anotace, typovou anotací, typovou anotaci, typovým anotacím, typových anotacích
lekce: nastroje-typescript/proc-typescript

Zápis, kterým vývojář překladači říká, jaký typ má daná proměnná, parametr nebo návratová hodnota mít. Píše se za dvojtečku (např. `let name: string`).

## --term-- strukturální typování

en: structural typing
aliases: strukturálního typování, strukturálnímu typování, strukturálním typováním
lekce: nastroje-typescript/proc-typescript

Způsob kontroly typů, který zkoumá tvar dat, ne jejich původ nebo název typu. Pokud má objekt vlastnosti s očekávanými typy, TypeScript ho přijme, i když pochází z jiné třídy nebo je vytvořen jako literál (tzv. "duck typing").

## --term-- odvození typu

en: type inference
aliases: odvozování typu, odvozením typu, odvození typů
lekce: nastroje-typescript/proc-typescript

Schopnost TypeScriptu automaticky poznat typ hodnoty podle toho, jak je proměnné přiřazena. Díky odvození nemusíš psát anotaci u každé proměnné (např. u `let age = 42` TypeScript sám odvodí `number`).

## --term-- odstraňování typů

en: type erasure
aliases: odstraňováním typů, odstraňování typu
lekce: nastroje-typescript/proc-typescript

Proces, při kterém překladač odstraní z TypeScript kódu veškeré typové anotace a zanechá pouze čistý JavaScript. Typy slouží pouze pro statickou kontrolu v době překladu a do výsledného spouštěného kódu se nedostanou.

## --term-- n-tice

en: tuple
aliases: n-tici, n-tice, n-ticí, n-tic
lekce: nastroje-typescript/zakladni-typy

Pole o pevně dané délce, kde každý prvek má přesně určený typ (např. `[number, string]`). Často se používají pro návratové hodnoty funkcí, které vrací více souvisejících hodnot najednou (např. v React `useState`).

## --term-- sjednocení typů

en: union type
aliases: sjednocením typů, sjednocení
lekce: nastroje-typescript/zakladni-typy

Typ vzniklý spojením dvou nebo více typů pomocí operátoru `|`. Hodnota s tímto typem může nabývat hodnot z kteréhokoli ze sjednocených typů (např. `string | number`).

## --term-- literálový typ

en: literal type
aliases: literálové typy, literálového typu, literálovým typům
lekce: nastroje-typescript/zakladni-typy

Typ představující jednu konkrétní hodnotu (např. přesný řetězec `"success"`, číslo `42` nebo boolean `true`). Používá se k vytvoření velmi přesných typů tam, kde pouhý `string` nebo `number` není dostatečně omezující.

## --term-- zúžení typu

en: type narrowing
aliases: zúžení typů, zúžením typu, zužování typu, zužování
lekce: nastroje-typescript/zuzovani-a-genericita

Proces, při kterém TypeScript postupně omezuje sjednocení typů na jeden konkrétní typ na základě logických podmínek v kódu (např. testováním pomocí `typeof` nebo `if`).

## --term-- rozlišené sjednocení

en: discriminated union
aliases: rozlišeného sjednocení, rozlišenému sjednocení, rozlišeným sjednocením, tagged union
lekce: nastroje-typescript/zuzovani-a-genericita

Sjednocení objektových typů, které sdílejí jednu unikátní vlastnost (tzv. "diskriminátor", často vlastnost `type` nebo `kind`). TypeScript podle této vlastnosti umí bezpečně a automaticky odvodit, o kterou variantu objektu se jedná.

## --term-- type guard

en: type guard
aliases: type guardy, type guardu, type guardem
lekce: nastroje-typescript/zuzovani-a-genericita

Podmínka nebo speciální funkce vracející boolean (typicky anotovaná jako `x is T`), která po svém ověření informuje překladač, že hodnota uvnitř bloku spolehlivě odpovídá určitému konkrétnímu typu. Pomáhá tak se zúžením typu.

## --term-- generikum

en: generic
aliases: generika, generik, generikům, generický typ
lekce: nastroje-typescript/zuzovani-a-genericita

Typová proměnná (často značená `T`), díky které lze psát znovupoužitelné typy a funkce, jež mohou pracovat s různými typy, ale stále mezi nimi uchovávat typovou závislost a bezpečnost (např. `Array<T>`).

## --term-- pomocný typ

en: utility type
aliases: pomocné typy, pomocných typů, pomocnému typu
lekce: nastroje-typescript/zuzovani-a-genericita

Zabudované generické typy v TypeScriptu (např. `Partial`, `Pick`, `Omit`, `Record`), které slouží k rychlé a pohodlné úpravě nebo transformaci stávajících typů bez nutnosti je znovu ručně přepisovat.
