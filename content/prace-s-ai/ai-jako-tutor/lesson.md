# AI jako tutor

:::check pretest
- Pamatuješ si ze sekce `start-nastroje`, jak použít AI pro vysvětlení kódu?
- Zkoušel ses někdy s LLM dohadovat o řešení chyby?
:::

## Sokratovský tutor

Nejhorší věc, co můžeš při učení udělat, je zkopírovat chybovou hlášku do ChatGPT, vzít první kus kódu, plácnout ho do editoru, a pokud to funguje, jít dál. Nic ses nenaučil.

> [!REMEMBER]
> Abys AI využil pro růst, musíš ho přepnout do role tutora. Chceš vysvětlení konceptů, ne hotový kód.

Tzv. **sokratovský přístup** znamená, že po AI chceš, aby ti kladla návodné otázky, ne aby ti dala odpověď.

### Jak napsat dobrý prompt pro tutora

Místo: *"Oprav mi tenhle kód [kód]"*
Zkus: *"V tomto kódu [kód] dostávám chybu `TypeError: undefined is not a function`. Nevyřeš to za mě. Jen mi vysvětli, na jakém řádku k chybě dochází a nakopni mě správným směrem, ať na to přijdu sám."*

> [!TIP]
> Pokud používáš ChatGPT nebo Claude, můžeš si do "Custom instructions" (nebo systémového promptu) dát pravidlo: *"Jsi učitel programování. Nikdy mi nedávej rovnou hotový kód. Vždycky mi vysvětli koncept a polož mi návodnou otázku."*

## Nechat se kvízovat

Další skvělý způsob, jak AI využít, je obrátit role. Můžeš říct:
*"Právě se učím o Promises a asynchronním JS. Polož mi 3 kvízové otázky na porozumění. Pokládej je jednu po druhé a čekej na mou odpověď."*

## Kdy AI raději vypnout

Jsou chvíle, kdy bys měl GitHub Copilot nebo ChatGPT úplně zavřít:
1. **První pokus** – když se učíš úplně nový koncept (např. syntaxi tříd).
2. **Příprava na pohovor** – na pohovoru za tebe AI kód nenapíše.
3. **Cvičné úlohy** – v Akademii mají laby smysl jen tehdy, když mozek bolí z hledání řešení, ne ze čtení vygenerovaného textu.

:::check
- Proč je špatný nápad kopírovat vygenerované řešení bez porozumění?
- Co je to sokratovský přístup?
- Kdy je lepší AI nástroje úplně vypnout?
:::

## Kde to najdeš v MDN
- N/A – toto je spíše dovednost (soft skill).

# --questions--
- Jak bys přeformuloval prompt "jak se dělají array reduce v JS?", aby ses skutečně něco naučil?
- Vyjmenuj tři situace, kdy se používání AI k psaní kódu nevyplatí.
