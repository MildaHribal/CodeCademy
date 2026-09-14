# První program

:::check pretest
Co vypíše tenhle řádek? Tipni si, i když si nejsi jistý.

```js
console.log('2 + 3');
```

### --expected--

2 + 3

### --why--

Uvozovky dělají z `2 + 3` text a text se vypíše přesně tak, jak je napsaný. Bez uvozovek by JavaScript nejdřív spočítal výsledek. Rozdíl uvidíš hned v první ukázce.
:::

:::check pretest
Otevřeš e-shop a klikneš na „Přidat do košíku". Kde se provede JavaScript, který zvýší číslo u ikony košíku?

### --answer--

Na serveru e-shopu, prohlížeč dostane jen výsledek.

#### --why--

Server stránku i skript pošle, ale kód ze stránky se neprovádí u něj. Kde tedy? Odpověď je v první části.

### --correct--

V prohlížeči uživatele.

#### --why--

Prohlížeč si skript stáhne spolu s HTML a CSS a spustí ho sám. Víc v první části.

### --answer--

V editoru, ve kterém programátor kód napsal.

#### --why--

Editor kód jen upravuje a ukládá, nespouští ho. Kde běží, vysvětlí první část.
:::

Každý web, kde se po kliknutí něco změní bez načtení nové stránky — číslo u košíku, rozbalené menu, kontrola formuláře —, dělá tu práci JavaScriptem. HTML stránku popíše a CSS ji obleče, ale ani jedno neumí nic spočítat, rozhodnout nebo zopakovat. Na to potřebuješ program.

> [!REMEMBER]
> **Program je seznam příkazů, které se provedou shora dolů, jeden po druhém.** Když některý příkaz spadne, zbytek se už neprovede.

## Kde JavaScript běží

Každý prohlížeč má zabudovaný *engine*, který JavaScript čte a provádí: Chrome a Edge mají V8, Firefox SpiderMonkey, Safari JavaScriptCore. Když stránka načte skript, engine ho provede přímo v počítači nebo telefonu uživatele. Server skript jen pošle, stejně jako obrázek.

Stejný jazyk umí běžet i mimo prohlížeč. Node.js vezme engine V8 a spouští JavaScript v terminálu — píšou se v něm servery a nástroje. K němu se dostaneš v sekci Node.js. Do té doby píšeš JavaScript pro prohlížeč.

V Akademii máš prohlížeč pořád po ruce: ukázky v lekcích i kroky workshopů spouštějí kód v izolovaném rámu stránky a výpisy ukazují v panelu konzole. Nic nemusíš instalovat.

:::check
Kamarád tvrdí, že JavaScript ze stránky nepoběží, když uživatel nemá nainstalovaný Node.js. Má pravdu?

### --answer--

Ano, Node.js je potřeba pro každý JavaScript.

#### --why--

Node.js je jen jedno z prostředí, kde JavaScript běží. Co spouští skripty webových stránek?

### --correct--

Ne, skript ze stránky provede engine zabudovaný v prohlížeči.

#### --why--

Každý prohlížeč má vlastní engine (V8, SpiderMonkey, JavaScriptCore). Node.js je prostředí pro JavaScript mimo prohlížeč.

### --answer--

Ne, protože skript provede server a prohlížeči pošle výsledek.

#### --why--

Server skript jen pošle jako soubor. Provádí se až u uživatele.

### --see--

js-zaklady/prvni-program#kde-javascript-bezi
:::

## Konzole a `console.log`

Konzole je místo, kam program píše zprávy pro vývojáře. Uživatel ji nevidí, ty ano. Ve skutečném prohlížeči ji otevřeš v nástrojích pro vývojáře (*DevTools*) klávesou **F12** nebo zkratkou Ctrl+Shift+J (na Macu Cmd+Option+J). Do konzole jde psát i přímo: napiš `2 + 3`, stiskni Enter a uvidíš `5`.

V programu do konzole píše příkaz `console.log(…)`. Do závorek dáš, co chceš vypsat. Víc hodnot oddělíš čárkou a konzole je vypíše za sebou s mezerou.

:::live js
```js
console.log('Objednávka přijata');
console.log(2 + 3);
console.log('2 + 3');
console.log('Cena:', 250 * 2, 'Kč');
```
:::

Zkus smazat uvozovky u `'Objednávka přijata'` a sleduj, co se v konzoli změní. Pak u třetího řádku uber jednu uvozovku.

Text v uvozovkách je ==řetězec== (*string*) — hodnota, která se nepočítá, jen se vypíše. Číslo bez uvozovek je ==číslo== a JavaScript s ním počítá: `250 * 2` se vypíše jako `500`. Uvozovky můžou být jednoduché `'…'` i dvojité `"…"`, jen musí být na obou stranách stejné. V Akademii píšeme jednoduché.

> [!TIP]
> `console.log` je tvůj nejrychlejší nástroj na otázku „co v té chvíli program ví". Když si nejsi jistý hodnotou, vypiš ji. Výpis s popiskem (`console.log('cena:', price)`) se v delší konzoli snáz najde.

:::check
Napiš příkaz, který do konzole vypíše text `Doprava zdarma`.

### --expected--

console.log('Doprava zdarma')

### --accept--

console.log(`Doprava zdarma`)

### --why--

Text patří do uvozovek, jinak by ho JavaScript bral jako jméno něčeho, co má najít. Dvojité uvozovky platforma přijme stejně jako jednoduché, středník na konci taky.

### --see--

js-zaklady/prvni-program#konzole-a-console-log
:::

## Příkazy se provádějí shora dolů

Program je řada **příkazů** (*statements*). Každý příkaz je jeden pokyn: „vypiš", „spočítej a ulož", „rozhodni". Engine je provádí v pořadí, v jakém jsou v souboru, shora dolů.

Uvnitř příkazů jsou **výrazy** (*expressions*): kusy kódu, které mají hodnotu. `2 + 3` je výraz s hodnotou `5`, `'Brno'` je výraz s hodnotou `'Brno'`. Příkaz `console.log(2 + 3);` nejdřív vyhodnotí výraz v závorkách a teprve výsledek vypíše.

:::live js predict
```js
console.log('Začátek');
console.log(10 - 2 * 3);
console.log('Konec');
```
--question-- Co vypíše tenhle program? Každý výpis napiš na vlastní řádek.
--expected--
```text
Začátek
4
Konec
```
--why-- Příkazy jdou shora dolů a každý nejdřív vyhodnotí svůj výraz. `10 - 2 * 3` počítá jako v matematice: násobení má přednost, takže `10 - 6` je `4`. Zkus výraz uzavřít do závorek `(10 - 2) * 3` a sleduj, co se změní.
:::

Pořadí má důsledek, který potkáš brzy: když příkaz uprostřed spadne, prohlížeč program v tom místě zastaví. Výpisy nad ním v konzoli zůstanou, příkazy pod ním se neprovedou vůbec.

:::check
Program má tři řádky. Druhý obsahuje překlep a spadne s chybou. Co bude v konzoli?

```js
console.log('Načítám košík');
consol.log('Položky: 3');
console.log('Hotovo');
```

### --answer--

Nic, protože program obsahuje chybu.

#### --why--

Tahle chyba se projeví až při provádění druhého řádku. Co se stihlo provést předtím?

### --correct--

`Načítám košík` a pod ním chybová hláška.

#### --why--

První řádek se provede, druhý spadne a program se zastaví. `Hotovo` se už nevypíše.

### --answer--

`Načítám košík` a `Hotovo`, chybný řádek se přeskočí.

#### --why--

Prohlížeč chybné příkazy nepřeskakuje. Co se stane s příkazy pod místem, kde program spadl?

### --see--

js-zaklady/prvni-program#prikazy-se-provadeji-shora-dolu
:::

## Středníky a automatické doplňování

Příkazy se oddělují středníkem `;`. Když ho na konci řádku vynecháš, engine ho většinou doplní sám. Tomu se říká automatické vkládání středníků (*automatic semicolon insertion*, ASI). „Většinou" je ale přesně to slovo, které v programování nechceš slyšet: když další řádek začíná závorkou `(`, engine středník nedoplní a oba řádky slepí do jednoho příkazu.

:::live js predict
```js
try {
  const price = 250
  const total = price
  (price * 2)
  console.log(total)
} catch (error) {
  console.log(String(error))
}
```
--question-- Autor chtěl vypsat `250`. Co ukázka ve skutečnosti vypíše?
--expected-- TypeError: price is not a function
--accept-- price is not a function
--why-- Za `const total = price` chybí středník a další řádek začíná závorkou. Engine to přečte jako jeden příkaz `const total = price(price * 2)` — tedy „zavolej `price` jako funkci". Jenže `price` je číslo, a proto `TypeError`. Připiš středník za `const total = price` a ukázka vypíše `250`.
:::

> [!NOTE]
> `try { … } catch (error) { … }` v ukázce jen zachytí chybu, aby se hláška vypsala do konzole a ukázka nespadla. Sám ho zatím nepiš, dostaneš se k němu v sekci o chybách.

> [!REMEMBER]
> **Středník piš za každý příkaz.** Nespoléhej na to, že ho engine doplní — u řádku začínajícího `(`, `[` nebo zpětnou uvozovkou to neudělá.

Ve skutečných projektech středníky hlídá formátovač (třeba Prettier), který kód při uložení upraví. Dokud ho nemáš, piš je sám.

:::check
Co udělá engine, když další řádek začíná závorkou `(` a na konci předchozího řádku chybí středník?

### --answer--

Středník doplní vždycky, takže se nic nestane.

#### --why--

Doplnění středníku není bezpodmínečné. Podívej se znovu, co se stalo v ukázce s `price`.

### --correct--

Oba řádky přečte jako jeden příkaz.

#### --why--

Závorka na začátku řádku může pokračovat předchozím výrazem (třeba jako volání funkce), takže engine středník nevloží a řádky spojí.

### --answer--

Ohlásí `SyntaxError` a program vůbec nespustí.

#### --why--

Spojený kód je platný zápis, proto syntaktická chyba nevznikne. Problém se ukáže až při provádění.

### --see--

js-zaklady/prvni-program#stredniky-a-automaticke-doplnovani
:::

## Komentáře

Komentář je text pro lidi, engine ho přeskočí. Jednořádkový začíná `//` a platí do konce řádku, víceřádkový je mezi `/*` a `*/`.

:::live js
```js
// Doprava zdarma od 1 500 Kč: tak to má e-shop v obchodních podmínkách.
console.log('Hranice pro dopravu zdarma:', 1500, 'Kč');

/*
  Zatím nepoužíváme, marketing slevu teprve schvaluje.
  console.log('Sleva 10 %');
*/
console.log('Hotovo');
```
:::

Zkus smazat `/*` a `*/` kolem druhého výpisu a sleduj, co přibude v konzoli.

Dobrý komentář říká **proč** kód vypadá, jak vypadá. Co dělá, má být vidět z kódu samotného. `// vypíše hranici` nad `console.log('Hranice…')` jen opakuje kód. `// podle obchodních podmínek` vysvětlí, odkud se číslo vzalo.

> [!TIP]
> Ve VS Code i v editoru Akademie zakomentuješ vybrané řádky zkratkou Ctrl+/ (na Macu Cmd+/). Stejná zkratka komentář zase odebere. Hodí se, když chceš kus kódu na chvíli vypnout.

:::check
Který komentář nad řádkem `console.log('Sklad:', 12);` má smysl nechat v kódu?

### --answer--

`// vypíše Sklad: 12`

#### --why--

Tenhle komentář jen opakuje, co je vidět z kódu. Co by čtenář z kódu vyčíst nemohl?

### --correct--

`// 12 kusů hlásí sklad v Ostravě ranní uzávěrkou`

#### --why--

Vysvětluje, odkud číslo pochází — to v kódu vidět není.

### --answer--

`// console.log`

#### --why--

Název příkazu je vidět hned pod komentářem. Komentář má přidat informaci, kterou kód neříká.

### --see--

js-zaklady/prvni-program#komentare
:::

## `<script>` ve stránce

Na skutečném webu je JavaScript v souboru s příponou `.js` a stránka ho načte prvkem `<script>`:

```html
<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <title>Košík</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Košík</h1>
  </body>
</html>
```

Atribut `defer` řekne prohlížeči: stáhni skript hned, ale proveď ho až po přečtení celého HTML. Skript tak najde všechny prvky stránky. Starší návody místo toho dávají `<script>` na konec `<body>`, výsledek je podobný. Moderní projekty často píšou `type="module"`, který se chová jako `defer` — k modulům se dostaneš v sekci o nástrojích.

V krocích s JavaScriptem bez stránky (štítek konzole) spouští Akademie tvůj `script.js` sama, `<script>` psát nemusíš.

:::check
Skript v `<head>` bez atributu `defer` hledá nadpis stránky a nenajde ho. Proč?

### --answer--

Skript v `<head>` se vůbec neprovede.

#### --why--

Provede se — a právě v tom je problém. Kdy přesně?

### --correct--

Provede se dřív, než prohlížeč přečte `<body>` s nadpisem.

#### --why--

Prohlížeč čte HTML shora dolů a skript bez `defer` provede hned, jak na něj narazí. `defer` provedení odloží na chvíli po přečtení celého HTML.

### --answer--

Nadpis musí mít atribut `defer`.

#### --why--

`defer` patří k `<script>`, ne k prvkům, které skript hledá.

### --see--

js-zaklady/prvni-program#script-ve-strance
:::

## Typické chyby a pasti

### Text bez uvozovek

:::live js predict
```js
try {
  console.log(Ahoj);
} catch (error) {
  console.log(String(error));
}
```
--question-- Autor chtěl vypsat pozdrav. Co ukázka vypíše?
--option-- `Ahoj`
--option-- `undefined`
--option*-- `ReferenceError: Ahoj is not defined`
--why-- Bez uvozovek není `Ahoj` text, ale jméno. Engine hledá proměnnou nebo funkci jménem `Ahoj`, žádnou nenajde a ohlásí `ReferenceError`. Obal slovo uvozovkami a ukázka pozdraví.
:::

> [!PITFALL]
> **Text bez uvozovek JavaScript nebere jako text, ale jako jméno.** Jedno slovo skončí hláškou `ReferenceError: Ahoj is not defined`, víc slov za sebou (`console.log(Dobrý den)`) dokonce `SyntaxError` a program nejde vůbec spustit. Oprava: text vždy do uvozovek.

### Velká písmena a překlepy

JavaScript rozlišuje velká a malá písmena. `console`, `Console` a `CONSOLE` jsou tři různá jména.

> [!PITFALL]
> **`Console.log('Ahoj')` spadne s `ReferenceError: Console is not defined`, `console.lg('Ahoj')` s `TypeError: console.lg is not a function`.** Hláška v obou případech ukazuje přesně to jméno, které je napsané špatně. Oprava: přečti jméno z hlášky a porovnej ho písmeno po písmenu s tím, co jsi chtěl napsat.

### Typografické uvozovky

> [!PITFALL]
> **Kód zkopírovaný z Wordu, e-mailu nebo chatu často obsahuje české uvozovky `„…“` místo `'…'`.** Program pak nejde spustit: `SyntaxError: Invalid or unexpected token`. Oprava: uvozovky přepiš na klávesnici. Editor ti napoví barvou — text v pravých uvozovkách je obarvený jako řetězec, v typografických ne.

### Chybějící čárka mezi hodnotami

:::check
Tenhle řádek nejde spustit. Napiš ho opravený.

```js
console.log('Cena:' 250);
```

### --expected--

console.log('Cena:', 250)

### --why--

Hodnoty v `console.log` odděluje čárka. Bez ní engine vidí dvě hodnoty těsně za sebou a ohlásí `SyntaxError: missing ) after argument list` — myslí si, že za první hodnotou měly závorky skončit.

### --see--

js-zaklady/prvni-program#chybejici-carka-mezi-hodnotami
:::

> [!PITFALL]
> **Mezi hodnotami v závorkách chybí čárka.** Příznak: `SyntaxError: missing ) after argument list` a nespustí se ani řádky nad chybou, protože syntaktická chyba zastaví celý soubor ještě před spuštěním. Oprava: najdi v řádku z hlášky místo, kde dvě hodnoty stojí těsně za sebou.

## Kde to najdeš v MDN

- [What is JavaScript?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript) — co JavaScript na stránce dělá a jak se do stránky dostane.
- [console.log()](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static) — parametry `console.log` a ukázky výpisu víc hodnot najednou.
- [Lexical grammar](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar) — v části *Automatic semicolon insertion* přesná pravidla, kdy engine středník doplní a kdy ne.
- [`<script>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script) — atributy `src`, `defer` a `type`.

# --questions--

## --question--

Co vypíše tenhle program? Každý výpis napiš na vlastní řádek.

```js
// console.log('Pobočka Plzeň');
console.log('Pobočka', 'Brno');
/* console.log('Pobočka Ostrava'); */
console.log(4 * 25, 'Kč');
```

### --expected--

```text
Pobočka Brno
100 Kč
```

### --why--

Zakomentované řádky engine přeskočí. `console.log` s víc hodnotami je vypíše oddělené mezerou a výraz `4 * 25` nejdřív spočítá.

### --see--

js-zaklady/prvni-program#komentare

## --question--

Program vypsal do konzole `Načteno` a pod tím červenou hlášku. V souboru je pod chybným řádkem ještě `console.log('Zobrazeno');`. Proč se nevypsal?

### --answer--

Konzole ukazuje vždycky jen jeden výpis.

#### --why--

Konzole ukáže libovolně výpisů. Co se stalo s programem v místě chyby?

### --correct--

Program se na chybném řádku zastavil a další příkazy neprovedl.

#### --why--

Příkazy jdou shora dolů. Nezachycená chyba program ukončí, takže řádky pod ní se nikdy neprovedou.

### --answer--

`console.log` nejde použít dvakrát za sebou.

#### --why--

`console.log` můžeš volat, kolikrát chceš — první výpis to dokazuje. Proč se druhý neprovedl?

### --see--

js-zaklady/prvni-program#prikazy-se-provadeji-shora-dolu

## --question--

Co vypíše tenhle řádek?

```js
console.log('5 * 4', 5 * 4);
```

### --expected--

5 * 4 20

### --why--

První hodnota je řetězec a vypíše se, jak je. Druhá je výraz a vypíše se jeho výsledek. Obě oddělí mezera.

### --see--

js-zaklady/prvni-program#konzole-a-console-log
