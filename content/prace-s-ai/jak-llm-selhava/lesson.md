# Jak jazykový model selhává

:::check pretest
- Zkusil jsi někdy zkopírovat chybovou hlášku do AI a řešení nefungovalo?
- Víš, co znamená termín "halucinace" v kontextu umělé inteligence?
:::

## Predikce dalšího tokenu

> [!REMEMBER]
> Jazykový model (LLM) je v jádru jen velmi složitý statistický model pro hádání dalšího slova (tokenu). Nerozumí tvému problému.

Když se zeptáš AI na řešení, nedívá se do dokumentace, ani nespouští kompilátor. Místo toho generuje text, který vypadá jako nejpravděpodobnější pokračování tvého promptu na základě gigabajtů textu, které přečetla z internetu.

To znamená, že pokud něco zní dostatečně přesvědčivě a objevovalo se to často ve cvičných datech, LLM ti to sebevědomě nabídne.

:::live js predict
```js
// Co vygeneruje LLM jako doplnění tohoto kódu,
// pokud ho požádáš o vyčištění pole?
const array = [1, 2, 3];
array.clear(); // Očekávaná odpověď: sebejistě doplní neexistující metodu clear()
```
:::

## Typické chyby generovaného kódu

Zde jsou nejčastější chyby, na které u AI narazíš.

### 1. Vymyšlené funkce a balíčky

Model občas navrhne metody nebo knihovny, které by dávaly smysl a znějí logicky, ale ve skutečnosti neexistují.

> [!PITFALL] Vymyšlené API
> V JavaScriptu neexistuje metoda `array.clear()`. LLM si ji ale rádo vymýšlí.
> ```js
> // Špatně: Vygenerovaný kód
> const list = [1, 2, 3];
> list.clear(); // TypeError: list.clear is not a function
> ```

Někdy si AI dokonce vymyslí celý npm balíček. Z toho pak útočníci těží – balíček s daným jménem vytvoří a schovají do něj malware.

### 2. Zastaralé vzory

Internet je plný kódu napsaného před lety. V Reactu ti model snadno nabídne třídní komponenty nebo použití Pages Routeru v Next.js, i když bys dnes měl používat funkcionální komponenty a App Router.

### 3. Ignorování okrajových případů a chybějící kontext

Model se často zaměří na tvůj prompt izolovaně. Pokud neuvedeš všechny podmínky (např. "ošetři případ, kdy API vrátí 500"), model vytvoří naivní "šťastnou cestu" (happy path). Navíc nevidí zbytek tvého repozitáře (pokud mu ho nepředáš).

## Jak s tím pracovat?

Nemůžeš slepě věřit tomu, co z AI vypadne. Pokaždé, když dostaneš kód, musíš si ho v hlavě přečíst, pochopit ho a případně si ověřit API v MDN.

:::live js predict
```js
// Co je na tomto vygenerovaném kódu špatně?
// Zadání znělo: "Napiš funkci pro validaci emailu"
function validateEmail(email) {
  return email.includes('@');
}
```
:::

:::check
- Proč jazykový model někdy navrhne funkci, která neexistuje?
- Proč ti LLM může v roce 2024 nabídnout tutoriál pro React z roku 2018?
- Jakou nevýhodu má "happy path" řešení od AI?
:::

## Kde to najdeš v MDN
- [JavaScript Array methods (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

# --questions--
- Co dělá jazykový model pod kapotou, když ti generuje kód?
- Jaká rizika plynou z halucinovaných npm balíčků?
- Co je to "šťastná cesta" (happy path) a proč ji LLM preferuje?
