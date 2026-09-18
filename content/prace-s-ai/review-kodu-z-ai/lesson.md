# Review kódu z AI

:::check pretest
- Proč nestačí spoléhat se na to, že vygenerovaný kód "funguje na první pohled"?
- Vzpomeneš si na nějaká bezpečnostní rizika (např. SQL injection) ze sekce bezpečnosti?
:::

Když použiješ kód od AI agenta (nebo i z chatu), musíš k němu přistupovat úplně stejně přísně jako k Pull Requestu od cizího (a trochu zbrklého) vývojáře.

> [!REMEMBER]
> Tím, že vložíš vygenerovaný kód do svého repozitáře, přebíráš za něj plnou zodpovědnost. Autorství a údržba je na tobě.

## Checklist pro review

Když ti AI vygeneruje kód (nebo upraví soubory v editoru), přečti si vytvořený diff (změny) řádek po řádku. Zkontroluj následující věci:

1. **Spuštění a funkčnost:** Spustil se kód vůbec? Funguje to, nebo se to jen tváří, že to funguje?
2. **Existují závislosti?** Nenavrhl ti model neexistující balíčky (`npm install magic-auth-lib`) nebo neexistující metody tříd?
3. **Okrajové případy (Edge cases):** Co se stane, když vstup bude prázdný? Co když pole nebude definované (`undefined`)? LLM typicky neřeší nulové vstupy.
4. **Zbytečná složitost:** Nenavrhl ti kód o 150 řádcích s regulárními výrazy na problém, který se dá vyřešit třemi řádky standardní funkce?
5. **Testy testující implementaci:** Často AI napíše testy, které jen zrcadlí (v podstatě kopírují) kód samotný, aniž by skutečně ověřovaly požadavky. Tím vznikne pocit falešného bezpečí.

## Bezpečnost

Toto je absolutně kritické. Jazykové modely snadno napíšou bezpečnostní díru.

> [!PITFALL] Otevřené brány
> - Skládá AI SQL dotazy z uživatelského vstupu pomocí šablon místo placeholderů? (SQL Injection)
> - Vypisuje uživatelský text do HTML bez escapování? (XSS)
> - Zanechala v kódu natvrdo napsaná hesla nebo tokeny? (Únik tajemství)

Pokud se něco z toho objeví, ihned to musíš přepsat.

## Licence a plagiátorství

Občas může LLM vyplivnout přesnou kopii kódu s licencí (např. GPL), která je nekompatibilní s tvým projektem, nebo kód chráněný autorským právem. Častěji se to stává u delších specifických algoritmů. I proto by ses měl vyhýbat generování obrovských bloků logiky najednou.

:::check
- Co znamená převzít za kód zodpovědnost?
- Jaké 3 bezpečnostní rizika bys měl v review hledat?
- Proč je důležité číst vygenerovaný kód řádek po řádku v diffu?
:::

## Kde to najdeš v MDN
- N/A

# --questions--
- Podle jakého checklistu projdeš vygenerovaný diff?
- Proč AI testy někdy nepřinášejí žádnou hodnotu?
