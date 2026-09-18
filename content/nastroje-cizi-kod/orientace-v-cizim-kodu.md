# Orientace v cizím kódu

:::check pretest
1. Co uděláš jako první, když si stáhneš neznámý repozitář?
2. Jak najdeš v kódu místo, kde se počítá cena košíku?
:::

Když nastoupíš do nové práce nebo chceš přispět do open-source, málokdy začínáš na zelené louce. Čeká tě existující repozitář se stovkami nebo tisíci souborů.

> [!REMEMBER]
> Nesnaž se pochopit celý repozitář najednou. Hledej jen to, co potřebuješ pro svůj konkrétní úkol. Vytvoř si v hlavě hrubou mapu a detaily zkoumej až ve chvíli, kdy je potřebuješ.

## První kroky v repozitáři

Tvůj první cíl je dostat kód do stavu, kdy ho můžeš spustit a testovat.

1. **Přečti si README.** Tady by mělo být popsáno, co projekt dělá, jaké má závislosti a jak ho spustit.
2. **Podívej se do `package.json` (nebo obdoby).** V sekci `scripts` najdeš příkazy pro spuštění, testování, build a linter.
3. **Spusť instalaci závislostí.** Typicky `npm install`.
4. **Spusť aplikaci.** Typicky `npm run dev` nebo `npm start`. Pokud to padá, podívej se na chybovou hlášku. Často chybí proměnné prostředí (hledáš soubor `.env.example`).
5. **Spusť testy.** Typicky `npm test`. Měly by projít na zelenou. Pokud ne, je něco špatně s tvým prostředím (nebo je repozitář rozbitý).

:::check
Který script v `package.json` obvykle spouští aplikaci v režimu pro vývojáře?
:::

## Hrubá mapa

Jakmile ti projekt běží, zkus najít jeho hlavní části:

- **Vstupní bod:** Kde aplikace začíná? Pro frontend to bývá `index.html` a `main.js` (nebo `main.tsx`). Pro backend třeba `server.js` nebo `app.ts`.
- **Základní struktura:** Jsou komponenty ve složce `components`? Je API logika v `controllers` nebo `routes`? Jsou testy vedle zdrojových kódů (`.test.js`) nebo ve zvláštní složce `__tests__`?
- **Stav aplikace:** Používá se Redux, Zustand, React Context, nebo něco jiného? Kde je definovaný globální stav?
- **Styly:** Jsou to CSS moduly, Tailwind, nebo globální CSS?

Udělěj si poznámku (třeba na papír), kde je co.

## Stopování problému

Máš první úkol: "Tlačítko 'Přidat do košíku' nic nedělá." Jak najdeš kód, který to způsobuje?

1. **Hledání textu:** Pokud má tlačítko unikátní text (nebo ID, třídu), zkus ho vyhledat v celém projektu. Většina editorů to umí (ve VS Code zkratka `Ctrl+Shift+F` nebo `Cmd+Shift+F`). Můžeš zkusit i terminál: `rg "Přidat do košíku"`.
2. **Následování vlákna (Go to Definition):** Našel jsi komponentu `AddToCartButton`. Má prop `onClick`, která volá funkci `handleAddToCart`. Klikni na ni s držením `Ctrl` (nebo `Cmd`) a editor tě přesune na její definici.
3. **Kdo to volá? (Find References):** Našel jsi funkci `calculateTotalPrice`, ale nevíš, odkud se volá. Ve VS Code klikni pravým a zvol "Find All References".

> [!PITFALL]
> Hledání textu může selhat, pokud se text skládá z více proměnných nebo je přeložený z jiného jazyka (i18n). V takovém případě hledej názvy proměnných nebo tříd (např. `btn-cart`).

:::check
Jaká klávesová zkratka tě ve VS Code přesune na definici funkce, na které zrovna stojíš kurzorem? (Může to být kliknutí myší s modifikátorem).
:::

## Historie jako zdroj kontextu

Někdy koukáš na kód a říkáš si: "Proč to někdo napsal takhle složitě?" Odpověď často najdeš v historii Gitu.

- **Kdo to napsal? (`git blame`):** Ve VS Code pomocí rozšíření GitLens vidíš přímo v řádku jméno autora a zprávu commitu. Zjistíš, z jakého úkolu (issue) to vzniklo.
- **Jaké změny k tomu vedly? (`git log -p soubor`):** Zobrazí historii commitů pro daný soubor včetně diffů (změn v kódu). Můžeš tak najít, kdy a proč se daný řádek přidal.
- **Kdy se objevilo určité slovo? (`git log -S "HledanyText"`):** Najde commity, ve kterých se přidal nebo smazal daný text. Skvělé pro hledání smazaných funkcí nebo proměnných.

## Kde to najdeš v MDN a jinde

- [VS Code: Code Navigation](https://code.visualstudio.com/docs/editor/editingevolved) - Nápověda k navigaci v kódu ve VS Code.
- [Git log dokumentace](https://git-scm.com/docs/git-log) - Podrobná dokumentace k příkazu `git log`.

# --questions--

1. Proč je důležité spustit testy jako úplně první věc po stažení neznámého repozitáře?
2. Jaký nástroj ve VS Code (nebo jaký git příkaz) použiješ, když potřebuješ zjistit, kdo a proč napsal konkrétní řádek kódu, na který se právě díváš?
3. Proč občas selhává hledání konkrétního textu (např. nápisu na tlačítku) v celém projektu?
