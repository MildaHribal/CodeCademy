# Čtení chyb a debugger

:::check pretest
Jaký druh chyby podle tebe prohlížeč ukáže, když se pokusíš vypsat proměnnou, kterou jsi nikde nezaložil?

```js
console.log(pocetKusu);
```

### --expected--

ReferenceError

### --accept--

ReferenceError: pocetKusu is not defined

### --why--

Program hledá referenci na `pocetKusu`, ale takové jméno neexistuje. Naučit se číst chybové hlášky je ta nejužitečnější dovednost, kterou jako programátor získáš.
:::

Když v programu uděláš chybu, prohlížeč ho zastaví a vypíše chybovou hlášku. Ze začátku působí červený text hrozivě, ale brzy zjistíš, že se s tebou prohlížeč jen snaží komunikovat. V hlášce ti přesně říká, co se stalo a na kterém řádku.

> [!REMEMBER]
> **Chyba není selhání, ale směrovka.** Hláška ti říká **co** se stalo a **kde** to program vzdal. Nezkoušej kód náhodně měnit, dokud hlášce neporozumíš.

## Tři nejčastější chyby

Když se podíváš na chybovou hlášku, nejdůležitější jsou první dvě slova: druh chyby a popis. Tři nejčastější druhy chyb tě budou provázet neustále:

### SyntaxError

SyntaxError znamená, že jsi porušil pravidla zápisu jazyka. Zapomněl jsi závorku, středník, napsal jsi `const` dvakrát nebo jsi nedokončil řetězec. Program se vůbec nespustí — engine ho přečte a hned vyhodí chybu, protože kódu nerozumí.

:::live js predict
```js
try {
  eval("const price = 100\nconsole.log(price");
} catch(e) {
  console.log(e.name);
}
```
--question-- Jaký druh chyby vyhodí tento kód?
--expected-- SyntaxError
--why-- Na konci `console.log` chybí uzavírací závorka `)`. Prohlížeč vidí konec souboru tam, kde ještě očekával další kód.
:::

### ReferenceError

ReferenceError znamená, že se snažíš použít proměnnou, která neexistuje, nebo k ní přistupuješ před jejím založením. Program běží, dokud na tenhle problém nenarazí.

:::live js predict
```js
try {
  let x = 5;
  console.log(y);
} catch(e) {
  console.log(e.name);
}
```
--question-- Jaký druh chyby vyhodí tento kód?
--expected-- ReferenceError
--why-- Pokoušíš se číst proměnnou `y`, ale ta nebyla nikde definována (`y is not defined`). Prohlížeč neví, kde vzít její hodnotu.
:::

### TypeError

TypeError je nejzrádnější. Znamená to, že se s hodnotou snažíš udělat něco, co u daného typu nejde. Třeba změnit hodnotu v `const`, zavolat jako funkci něco, co není funkce, nebo číst vlastnost z `undefined`.

:::live js predict
```js
try {
  const greeting = 'Ahoj';
  greeting = 'Nazdar';
} catch(e) {
  console.log(e.name);
}
```
--question-- Jaký druh chyby vyhodí tento kód?
--expected-- TypeError
--why-- Snažíš se do `const` proměnné přiřadit novou hodnotu (`Assignment to constant variable`). `const` se nedá přepsat.
:::

:::check
Který druh chyby se ukáže, když se program ani nezačne spouštět, protože jsi zapomněl uvozovku?

### --expected--

SyntaxError

### --why--

Bez uvozovky kód není platný JavaScript. Engine ho nedokáže ani přečíst, natož spustit.
:::

## Jak číst chybovou hlášku a stack trace

Chyba v konzoli typicky vypadá takto:

`TypeError: count is not a function`
`    at calculateTotal (script.js:15:3)`
`    at main (script.js:42:5)`

První řádek je jasný — druh chyby a popis. Další řádky tvoří **stack trace** (výpis zásobníku). Ukazují, kudy program prošel, než spadl.

Nejvýš v seznamu je místo, kde to bouchlo. Tady to je soubor `script.js`, řádek 15, znak 3. Znamená to, že chyba nevznikla u tebe, když jsi zavolal funkci `main` na řádku 42, ale až uvnitř funkce `calculateTotal`. Vždycky hledej první řádek ve stack trace, který vede k tvému kódu (někdy jsou nahoře interní soubory knihoven).

> [!PITFALL]
> **Řádek s chybou není vždycky řádek s příčinou.** Když zapomeneš čárku v objektu, prohlížeč si toho všimne až na dalším řádku, protože se snaží z těch dvou řádků slepit jeden příkaz. Chyba bude vždy ukázaná o kousek níž.

:::check
Co znamená číslo `42` v části chybové hlášky `script.js:42:5`?

### --expected--

Číslo řádku

### --accept--

Řádek
Číslo řádku v souboru script.js

### --why--

Formát je vždy `soubor:řádek:sloupec`. Když klikneš na odkaz v opravdových DevTools, prohlížeč tě vezme přesně na tento řádek.
:::

## Zastavení času: Debugger

`console.log` je skvělý, ale občas potřebuješ vidět všechno najednou. K tomu slouží **debugger**. Je to nástroj zabudovaný v každém prohlížeči.

Když do kódu napíšeš příkaz `debugger;` a máš otevřené DevTools (F12), program se v tom místě úplně zastaví. Můžeš si pak kód krokovat řádek po řádku. V naší Akademii můžeš debugger používat taky — stačí otevřít náhled v nové záložce, pustit DevTools a spustit kód.

Tady jsou tři hlavní krokovací tlačítka v DevTools:
- **Step over** (krok přes): provede aktuální řádek a posune se na další. Pokud je na řádku volání funkce, provede ji celou a nezastaví se uvnitř.
- **Step into** (krok dovnitř): pokud je na aktuálním řádku funkce, vstoupí do ní a zastaví se na jejím prvním řádku.
- **Step out** (krok ven): dokončí zbytek aktuální funkce a zastaví se tam, odkud byla zavolána.

Během pauzy vidíš panel **Scope** — seznam všech proměnných, které v danou chvíli existují, a jejich přesné hodnoty. Do panelu **Watch** si zase můžeš přidat vlastní výrazy, které chceš sledovat na každém kroku.

:::check
Jakým příkazem v kódu zastavíš běh programu, abys ho mohl krokovat v DevTools?

### --expected--

debugger;

### --accept--

debugger

### --why--

Příkaz `debugger;` zastaví program přesně tam, kde je napsaný. Prohlížeč pak otevře panel Sources a ukáže ti hodnoty všech proměnných.
:::

## Kde to najdeš v MDN

- [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) — přehled chybových objektů v JavaScriptu, včetně SyntaxError a TypeError.
- [What are browser developer tools?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools) — jak otevřít DevTools ve tvém prohlížeči.
- [debugger statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) — jak funguje klíčové slovo `debugger`.

# --questions--

## --question--

Dočetl ses v chybové hlášce: `TypeError: Cannot read properties of undefined (reading 'length')`. Co to znamená?

### --answer--

Proměnná `length` nebyla založená.

#### --why--

Hláška neříká, že chybí `length`. Říká, že se snažíš přečíst vlastnost `length` na hodnotě, která je `undefined`. Někde máš něco jako `pole.length`, ale v proměnné `pole` není pole, ale `undefined`.

### --correct--

Snažíš se přečíst vlastnost `length` u hodnoty, která je `undefined`.

### --answer--

Pole sice existuje, ale zapomněl jsi napsat závorky u `length()`.

#### --why--

Kdyby to bylo pole a ty bys napsal `length()`, dostal bys chybu `length is not a function`. Ale tohle hlásí čtení z `undefined`. V proměnné před tečkou není nic.

### --see--

js-zaklady/cteni-chyb-a-debugger#tri-nejcastejsi-chyby

## --question--

Máš spuštěný debugger a program se zastavil na řádku s voláním `calculatePrice(items)`. Chceš zjistit, co přesně se děje uvnitř funkce `calculatePrice`. Které tlačítko použiješ?

### --answer--

Step over

#### --why--

Step over celou funkci spustí naráz a zastaví se až na dalším řádku pod ní. Neviděl bys, co se děje uvnitř.

### --correct--

Step into

### --answer--

Step out

#### --why--

Step out by se pokusilo opustit aktuální funkci, ve které se právě nacházíš, ne vstoupit do nové.

### --see--

js-zaklady/cteni-chyb-a-debugger#zastaveni-casu-debugger
