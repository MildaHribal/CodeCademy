# Čtení chyb a debugger

:::check pretest
Program spadl s hláškou `TypeError: Cannot read properties of undefined (reading 'length')` a ukazuje na řádek `console.log(customerName.length);`. Kde je chyba?

### --answer--

V `length` — tahle vlastnost neexistuje.

#### --why--

`length` text má. Hláška neříká, že chybí `length`, ale z čeho se čte. Rozbor hlášky je v druhé části.

### --correct--

V proměnné `customerName` je `undefined`, a hodnota se tam dostala dřív než na tomhle řádku.

#### --why--

Hláška popisuje hodnotu **před** tečkou. Kde se `undefined` vzalo, musíš dohledat nad tímhle řádkem. Jak na to, ukáže lekce.

### --answer--

V `console.log`, protože neumí vypsat délku.

#### --why--

`console.log` vypíše cokoli. Chyba vznikla dřív, než se k výpisu došlo. Jak hlášku číst, vysvětlí druhá část.
:::

:::check pretest
Který nástroj ti ukáže hodnoty **všech** proměnných v jednom okamžiku programu, aniž bys cokoli vypisoval?

### --answer--

`console.log` s víc hodnotami najednou.

#### --why--

`console.log` ukáže jen to, co do něj napíšeš, a program se nezastaví. Jaký nástroj program zastaví?

### --correct--

Debugger v DevTools.

#### --why--

Debugger program zastaví a ukáže všechny proměnné, které v tom místě existují. Jak ho zapnout, ukáže třetí část.

### --answer--

Panel s testy v Akademii.

#### --why--

Testy říkají, jestli výsledek sedí, ne co je v proměnných uprostřed běhu. Který nástroj program zastaví?
:::

Každý vývojář tráví velkou část dne tím, že zjišťuje, proč program nedělá, co má. Rozdíl mezi juniorem a zkušeným kolegou není v tom, kolik chyb udělá, ale jak rychle je najde: zkušený přečte hlášku do konce, skočí na správný řádek a když hláška nestačí, program zastaví a podívá se dovnitř. Obojí se naučíš tady a hned to použiješ v labu s cizím kódem.

> [!REMEMBER]
> **Hláška říká, co se stalo a kde to program vzdal — ne vždycky, kde je příčina.** Přečti ji celou, jdi na řádek, a když příčina není vidět, zastav program o kus dřív a podívej se do proměnných.

## Tři druhy chyb

Skoro všechny chyby, které teď potkáš, patří do tří druhů. Druh je první slovo hlášky.

| druh | co znamená | kdy se ohlásí | typická hláška |
|---|---|---|---|
| `SyntaxError` | kód není platný JavaScript | **před spuštěním**, neprovede se nic | `Unexpected token ')'`, `missing ) after argument list`, `Unexpected end of input` |
| `ReferenceError` | jméno neexistuje nebo ještě nevzniklo | při provádění řádku | `total is not defined`, `Cannot access 'total' before initialization` |
| `TypeError` | s hodnotou chceš dělat, co její typ neumí | při provádění řádku | `x is not a function`, `Cannot read properties of undefined`, `Assignment to constant variable.` |

`SyntaxError` je zvláštní: engine kód nejdřív celý přečte, a když mu nerozumí, nespustí z něj **ani první řádek**. V Akademii to poznáš podle panelu „Kód nejde spustit" s tlačítkem, které skočí na řádek s chybou. `ReferenceError` a `TypeError` se ohlásí až ve chvíli, kdy program na chybný řádek dojde — výpisy nad ním proběhnou.

:::live js predict
```js
try {
  const total = price * 3;
  const price = 129;
  console.log(total);
} catch (error) {
  console.log(error.name);
}
```
--question-- Jaký druh chyby ukázka vypíše?
--option-- `SyntaxError`
--option*-- `ReferenceError`
--option-- `TypeError`
--why-- Zápis je platný, takže o syntaxi nejde. Na prvním řádku se čte `price`, která vznikne až o řádek níž: `ReferenceError: Cannot access 'price' before initialization`. Jméno existuje, jen ještě nemá hodnotu. Prohoď první dva řádky a ukázka vypíše `387`.
:::

:::live js predict
```js
try {
  let customerName;
  console.log(customerName.length);
} catch (error) {
  console.log(error.name);
}
```
--question-- Jaký druh chyby ukázka vypíše?
--option-- `SyntaxError`
--option-- `ReferenceError`
--option*-- `TypeError`
--why-- `customerName` existuje, takže `ReferenceError` to není. Jen v ní je `undefined` a z `undefined` nejde číst vlastnost: `TypeError: Cannot read properties of undefined (reading 'length')`. Přiřaď do proměnné text a chyba zmizí.
:::

:::live js predict
```js
try {
  const status = 'nová';
  status = 'odeslaná';
} catch (error) {
  console.log(error.name);
}
```
--question-- Jaký druh chyby ukázka vypíše?
--option-- `SyntaxError`
--option-- `ReferenceError`
--option*-- `TypeError`
--why-- Přiřazení do `const` vypadá jako chyba zápisu, ale zápis je platný — chyba vznikne až při provádění: `TypeError: Assignment to constant variable.` Engine říká „s touhle proměnnou tohle dělat nejde".
:::

> [!NOTE]
> Ukázky zachytí chybu přes `try`/`catch` a vypíšou jen `error.name` — druh chyby. Ve vlastním kódu chyby zatím nezachytávej, nech je ohlásit se v konzoli.

:::check
V souboru chybí na konci jedna uzavírací složená závorka `}`. Co se stane s výpisem `console.log('start')` na prvním řádku?

### --answer--

Vypíše se, pak program spadne na místě chybějící závorky.

#### --why--

Tak by se chovala chyba při provádění. Kdy se ohlašuje chyba zápisu?

### --correct--

Nevypíše se. Program s `SyntaxError` nejde spustit vůbec.

#### --why--

Engine kód nejdřív celý přečte. Chybějící závorku zjistí na konci souboru (`Unexpected end of input`) a nespustí nic.

### --answer--

Vypíše se a zbytek programu doběhne bez závorky.

#### --why--

Engine chybějící závorku nedoplní — na rozdíl od středníku. Co se tedy stane se spuštěním?

### --see--

js-zaklady/cteni-chyb-a-debugger#tri-druhy-chyb
:::

## Jak číst hlášku a stack trace

Chyba v konzoli prohlížeče vypadá třeba takhle:

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'length')
    at countVowels (script.js:4:28)
    at printReport (script.js:12:17)
    at script.js:15:1
```

Čti ji po částech:

1. **`Uncaught`** — chybu nikdo nezachytil, a proto program skončil.
2. **`TypeError`** — druh chyby.
3. **`Cannot read properties of undefined (reading 'length')`** — co se stalo. Čteš vlastnost `length` z hodnoty `undefined`. Vlastnost je v závorce, hodnota před tečkou je `undefined`.
4. **`at countVowels (script.js:4:28)`** — kde: funkce `countVowels`, soubor `script.js`, **řádek 4**, znak 28.
5. Další řádky `at …` jsou [[stack trace]]: cesta, kudy program k místu chyby došel. `countVowels` zavolala funkce `printReport` z řádku 12 a tu zavolal hlavní kód na řádku 15.

> [!NOTE]
> Funkce (`countVowels`, `printReport`) do hloubky probere sekce Funkce a rozsah platnosti. Teď stačí vědět, že funkce je pojmenovaný kus kódu, který jde z jiného místa **zavolat** — a stack trace zapisuje, kdo koho volal.

Stack trace se čte shora: nahoře je místo, kde to spadlo, pod ním kdo ho zavolal. Když je chybná hodnota předaná zvenku (tady `undefined` místo textu), příčinu najdeš o řádek níž ve výpisu — tam, odkud se funkce volala.

> [!TIP]
> V DevTools je `script.js:4` odkaz. Klikni na něj a prohlížeč otevře soubor přesně na řádku s chybou. V Akademii ti pod anglickou hláškou přibude české vysvětlení s nejčastějšími příčinami a odkazem do lekce.

:::check
V hlášce je `at formatPrice (script.js:21:9)` a pod ním `at script.js:40:13`. Na kterém řádku se volala funkce, uvnitř které program spadl?

### --expected--

40

### --why--

Horní řádek (21) je místo pádu uvnitř `formatPrice`. Řádek pod ním říká, odkud byla `formatPrice` zavolána: řádek `40`. Tam hledej, jakou hodnotu funkce dostala.

### --see--

js-zaklady/cteni-chyb-a-debugger#jak-cist-hlasku-a-stack-trace
:::

## Debugger: zastav program a podívej se dovnitř

`console.log` ukáže jednu hodnotu, na kterou se zeptáš předem. Debugger program **zastaví** a ukáže všechno, co v tom okamžiku existuje. Pak ho necháš běžet po jednom řádku a sleduješ, jak se hodnoty mění.

Program zastavíš dvěma způsoby:

- Napíšeš do kódu příkaz `debugger;`. Když jsou otevřené DevTools, program se na něm zastaví. Když zavřené, příkaz nic nedělá.
- V DevTools v panelu **Sources** (ve Firefoxu **Debugger**) klikneš na číslo řádku. Vznikne modrá značka, [[breakpoint]], a program se zastaví před provedením toho řádku.

Když program stojí, řádek, na kterém stojí, je zvýrazněný. Vpravo jsou dva panely a nahoře tlačítka:

| ovládání | zkratka v Chrome | co udělá |
|---|---|---|
| **Resume** | F8 | pokračuj až k dalšímu zastavení |
| **Step over** | F10 | proveď aktuální řádek; volání funkce proveď celé a zastav na dalším řádku |
| **Step into** | F11 | když je na řádku volání funkce, vstup dovnitř a zastav na jejím prvním řádku |
| **Step out** | Shift+F11 | dokonči aktuální funkci a zastav tam, odkud byla zavolána |
| panel **Scope** | — | všechny proměnné, které v tomhle místě existují, s aktuální hodnotou |
| panel **Watch** | — | výrazy, které si přidáš (`total * 2`, `items > 3`) a které se přepočítají po každém kroku |

Nejčastější postup: zastav se kousek **před** místem, kde výsledek přestane sedět, a jdi Step over, dokud hodnota v Scope neuhne od toho, co čekáš. Ten řádek je příčina.

:::check
Program stojí na řádku `const fee = shippingFee(total);`. Chceš vidět, co se děje uvnitř `shippingFee`. Které tlačítko stiskneš?

### --answer--

Step over

#### --why--

Step over funkci provede celou naráz a zastaví se až pod ní. Dovnitř bys nenahlédl.

### --correct--

Step into

#### --why--

Step into vstoupí do volané funkce a zastaví se na jejím prvním řádku. V panelu Scope pak uvidíš i hodnotu, se kterou byla funkce zavolána.

### --answer--

Step out

#### --why--

Step out naopak aktuální funkci opouští. Která volba vstupuje dovnitř?

### --see--

js-zaklady/cteni-chyb-a-debugger#debugger-zastav-program-a-podivej-se-dovnitr
:::

## Debugger v praxi a v Akademii

Debugger si vyzkoušíš hned. Nejrychlejší cesta nepotřebuje žádný soubor:

1. Na téhle stránce otevři DevTools (F12) a přepni na panel **Console**.
2. Vlož do konzole kód z otázky pod tímhle odstavcem a stiskni Enter. Chrome při prvním vložení kódu varuje a chce, abys napsal `allow pasting` — to je ochrana proti podvodníkům, kteří lidi navádějí vkládat cizí kód.
3. Program se zastaví na `debugger;` a DevTools přepnou do panelu **Sources**. Hodnoty najdeš v panelu **Scope**, podsekce **Local** nebo **Script**.

:::check
Zastav tenhle program v DevTools a v panelu Scope zjisti, jakou hodnotu má `checksum`, když program stojí na `debugger;`. Počítat ručně nemusíš — v tom je smysl debuggeru. Řádek s `for` dvanáctkrát zopakuje výpočet pod ním; cykly se naučíš za dvě lekce, tady ho stačí vložit.

```js
let checksum = 7;
for (let i = 1; i <= 12; i++) {
  checksum = (checksum * 31 + i) % 1000;
}
debugger;
console.log('Kontrolní součet spočítán');
```

### --expected--

485

### --why--

Hodnota v Scope je stav po posledním průchodu cyklem. Totéž bys zjistil přes `console.log(checksum)` — debugger ale ukáže všechny proměnné naráz a můžeš pokračovat po krocích. Zkus `debugger;` přesunout do těla cyklu a sledovat `checksum` po každém průchodu přes Resume (F8).

### --see--

js-zaklady/cteni-chyb-a-debugger#debugger-v-praxi-a-v-akademii
:::

Ve workshopech a labech Akademie má panel s výstupem tlačítko **Nová karta**. Otevře tvůj kód ve skutečné kartě prohlížeče, kde fungují DevTools i breakpointy. Karta se načte hned, proto v ní otevři DevTools (F12) a stránku do minuty obnov (F5) — teprve při novém spuštění se program na `debugger;` zastaví.

> [!PITFALL]
> **Když se v Akademii zastavíš uvnitř cyklu déle než sekundu, po pokračování se ohlásí `Smyčka běží příliš dlouho — nekonečná smyčka?`.** Ochrana proti nekonečným smyčkám měří čas a pauzu v debuggeru nerozezná. Hodnoty, které jsi při zastavení viděl, platí. Oprava: `debugger;` dej před cyklus nebo za něj, nebo krokuj cyklus v kódu vloženém do konzole DevTools.

## Typické chyby a pasti

### Hláška ukazuje následek, ne příčinu

:::live js predict
```js
function discountFor(code) {
  if (code === 'LETO') {
    return 10;
  }
}

try {
  const discount = discountFor('ZIMA');
  console.log(`Sleva ${discount.toString()} %`);
} catch (error) {
  console.log(String(error));
}
```
--question-- Hláška ukáže na řádek s `console.log`. Co vypíše?
--expected-- TypeError: Cannot read properties of undefined (reading 'toString')
--accept-- Cannot read properties of undefined (reading 'toString')
--why-- Pád je na řádku s výpisem, ale příčina je ve funkci: pro kód `'ZIMA'` žádný `return` neproběhne a funkce vrátí `undefined`. Oprava patří do `discountFor` (třeba `return 0;` na konec), ne do výpisu.
:::

> [!PITFALL]
> **`Cannot read properties of undefined` na řádku X neznamená, že chyba je na řádku X.** Na řádku X se `undefined` jen použilo. Příznak: řádek vypadá v pořádku. Oprava: zjisti, odkud hodnota před tečkou přišla — z funkce bez `return`, z proměnné bez přiřazení — a oprav to místo.

### Chybějící závorka se hlásí na konci

> [!PITFALL]
> **Zapomenutá `}` se ohlásí jako `SyntaxError: Unexpected end of input` na posledním řádku souboru.** Engine až na konci zjistí, že blok nebyl uzavřený. Příznak: hláška ukazuje za poslední řádek, kde žádná chyba není. Oprava: projdi bloky odspodu a hledej ten, kterému chybí konec. Editor ti páry závorek zvýrazní, když kurzor postavíš vedle jedné z nich.

### Oprava druhé chyby dřív než první

> [!PITFALL]
> **V konzoli je víc červených hlášek a ty opravuješ tu poslední.** Pozdější chyby často jen navazují na první (hodnota chybí, protože předchozí krok spadl). Oprava: vždycky začni první hláškou shora, po opravě spusť znovu.

### Hádání místo čtení

> [!PITFALL]
> **Kód měníš naslepo, dokud chyba nezmizí.** Příznak: po „opravě" je jiná chyba nebo program nedělá, co má. Oprava: přečti druh, zprávu a řádek a řekni si nahlas, co hláška tvrdí. Když si nejsi jistý hodnotou, zastav program a podívej se, místo abys hádal.

:::check
Kolega napsal funkci a program spadne s `TypeError: Cannot read properties of undefined (reading 'toString')` na posledním řádku. Kde je příčina?

```js
function pricePerPerson(total, people) {
  if (people > 0) {
    return total / people;
  }
}

const text = pricePerPerson(1200, 0).toString();
```

### --answer--

V `toString`, výsledek dělení nejde převést na text.

#### --why--

Každé číslo `toString` má. Z jaké hodnoty se tu čte?

### --correct--

Ve funkci: pro `people` rovné nule neproběhne žádný `return`, a funkce proto vrátí `undefined`.

#### --why--

Poslední řádek jen použil `undefined`, které funkce vrátila. Oprava patří do funkce — třeba `return 0;` nebo jasná hodnota pro neplatný vstup na konec.

### --answer--

Ve výpočtu `total / people`, dělení nulou program shodí.

#### --why--

Dělení nulou JavaScript nezastaví (vyjde `Infinity`) a tady se ani neprovede. Co funkce vrátí, když podmínka neplatí?

### --see--

js-zaklady/cteni-chyb-a-debugger#hlaska-ukazuje-nasledek-ne-pricinu
:::

## Kde to najdeš v MDN

- [JavaScript error reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors) — seznam hlášek; u každé najdeš, co znamená a jak ji opravit. Hodí se, když hláška není v téhle lekci.
- [What went wrong? Troubleshooting JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_went_wrong) — syntaktické a logické chyby na jednom příkladu krok za krokem.
- [debugger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) — kdy příkaz `debugger` program zastaví a kdy nic nedělá.
- [Debug JavaScript (Chrome DevTools)](https://developer.chrome.com/docs/devtools/javascript) — návod k panelu Sources s breakpointy, Scope a Watch. Není to MDN, ale oficiální dokumentace Chrome.

Dál: v lekci Porovnání a logika se program naučí rozhodovat a ve workshopu Hodnocení studentů zkusíš debugger na kolegově funkci, která dává špatné známky přesně na hranici.

# --questions--

## --question--

Jaký druh chyby vznikne? Napiš jen jeho jméno.

```js
const items = 3;
console.log('Položek: ' + itemCount);
```

### --expected--

ReferenceError

### --why--

Zápis je platný, takže to není `SyntaxError`. Jméno `itemCount` ale nikde nevzniklo (proměnná se jmenuje `items`): `ReferenceError: itemCount is not defined`.

### --see--

js-zaklady/cteni-chyb-a-debugger#tri-druhy-chyb

## --question--

Ve které funkci program spadl? Napiš jen její jméno.

```text
Uncaught TypeError: total.toFixed is not a function
    at formatTotal (script.js:8:16)
    at renderSummary (script.js:19:21)
    at script.js:25:1
```

### --expected--

formatTotal

### --why--

Horní řádek stack trace je místo pádu: funkce `formatTotal`, řádek 8. `renderSummary` ji jen zavolala na řádku 19.

### --see--

js-zaklady/cteni-chyb-a-debugger#jak-cist-hlasku-a-stack-trace

## --question--

V kódu je `debugger;`, ale DevTools jsou zavřené. Co se stane, když stránku načteš?

### --answer--

Program se zastaví a počká, až DevTools otevřeš.

#### --why--

Program na nic nečeká. Kdy příkaz `debugger` vůbec působí?

### --correct--

Nic zvláštního, program proběhne, jako by tam příkaz nebyl.

#### --why--

`debugger;` zastaví program jen při otevřených DevTools. Uživatelům tedy neublíží, ale do hotového kódu nepatří — před odevzdáním ho smaž.

### --answer--

Ohlásí se `SyntaxError`, protože příkaz patří jen do DevTools.

#### --why--

`debugger;` je platný příkaz jazyka. Co dělá, když není kdo by program krokoval?

### --see--

js-zaklady/cteni-chyb-a-debugger#debugger-zastav-program-a-podivej-se-dovnitr

## --question--

Program má breakpoint na řádku 2 a příkaz `debugger;` na řádku 5. Oba řádky se provedou. Na kterém řádku se program zastaví nejdřív? Napiš jen číslo.

### --expected--

2

### --why--

Breakpoint i `debugger;` zastavují stejně, rozhoduje pořadí provádění. Řádek 2 přijde na řadu dřív. Po Resume (F8) se program zastaví na řádku 5.

### --see--

js-zaklady/cteni-chyb-a-debugger#debugger-zastav-program-a-podivej-se-dovnitr
