## --card-- free

Na co se v databázi používá omezení `UNIQUE` a proč k tomu nestačí kontrola v kódu před samotným uložením?

### --back--

Zajišťuje, že se hodnota (např. e-mail) v celé tabulce neopakuje. Kontrola v kódu nestačí, protože by mohlo dojít k souběhu – dva různé požadavky projdou kontrolou ve stejný čas a databáze by pak bez `UNIQUE` uložila stejný e-mail dvakrát.

### --see--

sql-databaze/relacni-databaze#omezeni-not-null-unique-check-default

## --card-- free

Proč se peníze neukládají jako desetinná čísla (typ `REAL`), a jak je správně uložit?

### --back--

Desetinná čísla trpí zaokrouhlovacími chybami (jako `0.1 + 0.2` v JavaScriptu). Peníze se vkládají jako přesné celé číslo do `INTEGER` v menší jednotce (např. v haléřích).

### --see--

sql-databaze/relacni-databaze#datove-typy
