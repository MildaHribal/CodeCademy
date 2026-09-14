# Řetězce

:::check pretest
Co vypíše poslední řádek? Tipni si, i když si nejsi jistý.

```js
const city = '  Brno  ';
city.trim();
console.log(city.length);
```

### --expected--

8

### --why--

`trim()` mezery neumaže z proměnné `city`, ale vrátí **nový** řetězec bez nich. Ten tady nikdo neuložil, takže `city` má pořád osm znaků. Proč to tak je, vysvětlí hned první část.
:::

:::check pretest
Kolik znaků hlásí `'👍🏽'.length`? Emoji s odstínem pleti je na obrazovce jeden obrázek.

### --answer--

1

#### --why--

Tak to vypadá na obrazovce. `length` ale nepočítá obrázky, co přesně počítá, uvidíš v části o Unicode.

### --answer--

2

#### --why--

Blíž, ale ještě ne. Co přesně `length` počítá, uvidíš v části o Unicode.

### --correct--

4

#### --why--

`length` počítá kódové jednotky, ne to, co vidíš. Palec zabere dvě a odstín pleti další dvě. Rozbor je v části o Unicode.
:::

Text je všude: vyhledávání v e-shopu, adresa článku `/clanky/zluty-kun`, iniciály v kolečku místo profilové fotky, zkrácený popis inzerátu s výpustkou. Všechno to jsou **řetězce** (*strings*) a pár metod, které z nich vyrobí jiný řetězec.

Problém začíná u první drobnosti. Uživatel do vyhledávání napíše `  kolo ` s mezerami, v databázi je `Kolo`, a hledání nic nenajde. Nebo zkrácený popis končí `…horské k…`, protože se řezalo uprostřed slova. Nebo délka přezdívky `Ema💃` vyjde 5 a formulář ji odmítne. Na všechno existuje jedna metoda — když víš, co doopravdy vrací.

> [!REMEMBER]
> **Řetězec se nikdy nezmění. Každá metoda vrací nový řetězec a ten musíš uložit.**
> Druhá věc, na kterou se v lekci podíváš: `length` nepočítá písmena, ale kódové jednotky, a u emoji a diakritiky to není totéž.

## Řetězec se nedá změnit

Řetězec zapíšeš do jednoduchých uvozovek `'…'`, dvojitých `"…"` nebo zpětných `` `…` ``. Zpětné jsou šablonový řetězec (*template literal*) z `js-zaklady`: do `${…}` vložíš hodnotu. Metody se volají s tečkou za řetězcem a vracejí výsledek.

:::live js
```js
const title = '  Horské kolo Author  ';

const clean = title.trim();
const loud = clean.toUpperCase();

console.log(`[${title}]`);
console.log(`[${clean}]`);
console.log(`[${loud}]`);
```
:::

Hranaté závorky ve výpisu jen ukazují, kde řetězec začíná a končí. Zkus přidat řádek `title.toLowerCase();` bez `const` a vypiš znovu `title`. Nic se nezmění: metoda vrátila nový řetězec a ten jsi zahodil.

Řetězce jsou **neměnné** (*immutable*). Žádná metoda nepřepíše znaky uvnitř. Ani zápis `title[0] = 'h'` nic nezmění: v obyčejném skriptu se tiše ignoruje, v modulu (ten má přísný režim, *strict mode*) vyhodí `TypeError: Cannot assign to read only property '0' of string`. Změnit můžeš jen to, na co ukazuje proměnná: `let name = 'Ema'; name = name.toUpperCase();` uloží do `name` nový řetězec.

:::live js predict
```js
let nickname = 'ema';

nickname.toUpperCase();
nickname[0] = 'E';

console.log(nickname);
```
--question-- Co vypíše `console.log(nickname)`?
--expected-- ema
--why-- `toUpperCase()` vrátil nový řetězec `'EMA'`, ale nikdo ho neuložil. Zápis `nickname[0] = 'E'` se v obyčejném skriptu tiše ignoruje, protože řetězec změnit nejde. Oprava je přiřazení: `nickname = nickname.toUpperCase();`.
:::

:::check
Proměnná `let tag = ' Akce ';`. Který řádek opravdu uloží do `tag` text bez mezer?

### --answer--

`tag.trim();`

#### --why--

Myslíš si, že metoda změní řetězec na místě? Vrátí nový řetězec a tady ho nikdo neuloží.

### --correct--

`tag = tag.trim();`

#### --why--

`trim()` vrátí nový řetězec a přiřazení ho uloží do proměnné. Proto musí být `tag` deklarovaný přes `let`.

### --answer--

`const tag = tag.trim();`

#### --why--

`tag` už existuje. Deklarovat ho znovu ve stejném bloku nejde, skončí to chybou `SyntaxError`.

### --see--

js-retezce-cisla/retezce#retezec-se-neda-zmenit
:::

## Kousky textu: `at`, `slice` a hledání

Každý znak má pořadové číslo od nuly, stejně jako položky seznamu. `text[0]` je první znak, `text.length` počet znaků, poslední je na `text.length - 1`. Kratší zápis posledního znaku je `text.at(-1)`: záporné číslo počítá od konce.

`slice(start, end)` vyřízne kus **od** `start` **do** `end`, znak na `end` už nepatří do výsledku. Bez `end` řeže až do konce, záporná čísla počítají od konce.

:::live js
```js
const file = 'faktura-2026-09.pdf';

console.log(file.at(-1));
console.log(file.slice(0, 7));
console.log(file.slice(8, 12));
console.log(file.slice(-3));

const dot = file.lastIndexOf('.');
console.log(dot, file.slice(dot + 1));
console.log(file.includes('2026'), file.startsWith('faktura'), file.endsWith('.doc'));
```
:::

Zkus v `file` zaměnit příponu za `.jpeg` a sleduj, který výpis se rozbije a který ne. `slice(-3)` počítá s pevnou délkou přípony, `lastIndexOf('.')` najde tečku, ať je kdekoli.

Na hledání máš dvě skupiny metod. **„Jestli"** odpovídá `true`/`false`: `includes`, `startsWith`, `endsWith`. **„Kde"** vrací pozici: `indexOf` (první výskyt) a `lastIndexOf` (poslední). Když hledaný text chybí, vrátí `-1`.

> [!PITFALL]
> **`indexOf` v podmínce.** `if (email.indexOf('@'))` neplatí pro text, který zavináčem **začíná** (pozice `0` je nepravda), a platí pro text **bez** zavináče (`-1` je pravda). Na otázku ano/ne patří `email.includes('@')`, pozici porovnávej s `-1`.

:::live js predict
```js
const email = 'jana.novakova@seznam.cz';
const at = email.indexOf('@');

console.log(email.slice(0, at));
console.log(email.slice(at));
```
--question-- Co vypíšou oba řádky? Každý výpis na vlastní řádek.
--expected--
```text
jana.novakova
@seznam.cz
```
--why-- `indexOf('@')` vrátí pozici zavináče (13). `slice(0, at)` končí **před** ní, takže zavináč do jména nepatří. `slice(at)` začíná **na** ní, proto doména zavináč má. Doménu bez zavináče dá `slice(at + 1)`.
:::

:::check
Napiš výraz, který z řetězce `code` vezme **poslední dva znaky**, ať je `code` dlouhý jakkoli.

### --expected--

code.slice(-2)

### --accept--

code.slice(code.length - 2)
code.substring(code.length - 2)

### --why--

Záporný začátek `slice` počítá od konce, `-2` jsou poslední dva znaky. Stejně funguje `code.slice(code.length - 2)`.

### --see--

js-retezce-cisla/retezce#kousky-textu-at-slice-a-hledani
:::

## Úpravy: `trim`, velikost písmen, `padStart`, `replaceAll`

Tyhle metody potkáš nejčastěji. Všechny vracejí nový řetězec:

| metoda | co vrátí | kde se hodí |
|---|---|---|
| `trim()`, `trimStart()`, `trimEnd()` | text bez bílých znaků na krajích | vstup z formuláře |
| `toLowerCase()`, `toUpperCase()` | text malými / velkými písmeny | porovnání bez ohledu na velikost |
| `padStart(délka, výplň)`, `padEnd(…)` | text doplněný zleva / zprava na délku | `007`, zarovnané sloupce |
| `replace(co, čím)` | text s **prvním** výskytem nahrazeným | jedna náhrada |
| `replaceAll(co, čím)` | text se **všemi** výskyty nahrazenými | čárka za tečku, mezery pryč |
| `repeat(n)` | text zopakovaný `n`krát | hvězdičky místo hesla |

:::live js
```js
const input = '  Petr.Svoboda@Email.CZ ';
const order = 7;
const phone = '777 123 456';

console.log(input.trim().toLowerCase());
console.log(`Objednávka č. ${String(order).padStart(5, '0')}`);
console.log(phone.replace(' ', ''));
console.log(phone.replaceAll(' ', ''));
console.log('*'.repeat(6));
```
:::

Zkus v prvním výpisu prohodit pořadí na `input.toLowerCase().trim()`. Výsledek je stejný: každá metoda vrátí řetězec a na něj jde zavolat další metodu. Tomu se říká řetězení (*chaining*).

`padStart` je metoda řetězce, proto se číslo nejdřív převede přes `String(order)`. Na čísle samotném `order.padStart` spadne s `TypeError: order.padStart is not a function`.

> [!PITFALL]
> **`replace` s textem nahradí jen první výskyt.** `'777 123 456'.replace(' ', '')` vrátí `'777123 456'` — jedna mezera zůstala. Oprava: `replaceAll(' ', '')`.

:::check
Z textu `'12,5'` potřebuješ `'12.5'`, aby šel převést na číslo. Který výraz to udělá spolehlivě i pro `'1,5,0'` ve smyslu „všechny čárky"?

### --answer--

`text.replace(',', '.')`

#### --why--

Myslíš si, že `replace` s textem nahradí všechny výskyty? Nahradí jen první, u `'1,5,0'` by druhá čárka zůstala.

### --correct--

`text.replaceAll(',', '.')`

#### --why--

`replaceAll` nahradí každý výskyt, ať je jich kolik chce.

### --answer--

`text.trim(',')`

#### --why--

`trim` odstraňuje jen bílé znaky na krajích a žádný argument nebere.

### --see--

js-retezce-cisla/retezce#upravy-trim-velikost-pismen-padstart-replaceall
:::

## Rozdělení a spojení: `split` a `join`

`split(oddělovač)` rozseká řetězec na **seznam** kousků — pole. S poli se pořádně seznámíš v sekci `js-pole`. Teď ti stačí vědět, že k kouskům se dostaneš stejně jako ke znakům (`parts[0]`, `parts.length`, `parts.at(-1)`), projdeš je cyklem `for…of` a zpátky do řetězce je spojíš metodou `join(spojka)`.

:::live js
```js
const tags = 'kolo,horské,Author';
const parts = tags.split(',');

console.log(parts.length);
console.log(parts[0], parts.at(-1));
console.log(parts.join(' · '));

for (const part of parts) {
  console.log(`#${part}`);
}
```
:::

Zkus do `tags` přidat na konec čárku (`'kolo,horské,Author,'`) a sleduj `parts.length` a poslední hashtag. Za poslední čárkou je prázdný řetězec a `split` ho poctivě vrátí.

> [!PITFALL]
> **`split(' ')` a dvě mezery za sebou.** `'Jana  Nováková'.split(' ')` vrátí tři kousky `['Jana', '', 'Nováková']` — mezi mezerami je prázdný řetězec. Druhé „slovo" je pak prázdné a `parts[1][0]` je `undefined`. Oprava: nejdřív text vyčisti, nebo rozděl regulárním výrazem `split(/\s+/)`, ke kterému se dostaneš v lekci [Regulární výrazy](see:js-retezce-cisla/regularni-vyrazy#tridy-znaku).

:::check
Co vypíše tenhle kód?

```js
const time = '08:30';
const parts = time.split(':');
console.log(parts.length, parts[1]);
```

### --expected--

2 30

### --why--

Oddělovač `':'` rozdělí text na dva kousky, `'08'` a `'30'`. Druhý kousek má index `1`. Oba kousky jsou pořád řetězce, na čísla je převedeš až v lekci Čísla.

### --see--

js-retezce-cisla/retezce#rozdeleni-a-spojeni-split-a-join
:::

## Porovnání a řazení podle češtiny

Operátory `<` a `>` porovnávají řetězce podle čísel znaků v Unicode, ne podle abecedy. Pro angličtinu bez velkých písmen to náhodou vychází, pro češtinu ne: `Č` má vyšší číslo než `Z`, velká písmena mají nižší čísla než malá a `ch` je pro počítač obyčejné `c` a `h`.

:::live js predict
```js
console.log('Čáp' < 'Dům');
console.log('chata' < 'hrad');
```
--question-- Co vypíšou oba řádky? Každý výsledek na vlastní řádek.
--expected--
```text
false
true
```
--why-- `<` porovnává čísla znaků: `Č` (268) je větší než `D` (68), takže Čáp „není před" Domem. `c` má menší číslo než `h`, a tak chata vyjde před hradem, i když v české abecedě je `ch` až za `h`.
:::

Porovnání podle skutečné abecedy dělá `a.localeCompare(b, 'cs')`. Vrátí **záporné číslo**, když `a` patří před `b`, **kladné**, když za, a `0`, když jsou stejné. Druhý argument je jazyk (*locale*). Bez něj se použije jazyk prohlížeče, a u uživatele s anglickým systémem by se řadilo jinak — proto ho vždycky piš.

:::live js
```js
console.log('Čáp'.localeCompare('Dům', 'cs'));
console.log('chata'.localeCompare('hrad', 'cs'));
console.log('kolo'.localeCompare('Kolo', 'cs', { sensitivity: 'base' }));
```
:::

Zkus ve druhém řádku změnit `'cs'` na `'en'` a sleduj znaménko. S možností `{ sensitivity: 'base' }` jsou `kolo` a `Kolo` stejné, a dokonce i `kolo` a `kóló` — hodí se na porovnání bez ohledu na velikost písmen a čárky.

:::check
Co vrátí `'Řeka'.localeCompare('Ryba', 'cs')`? Stačí znaménko: napiš `záporné`, `kladné` nebo `nula`.

### --expected-- ignore-case

kladné

### --accept--

kladne
kladné číslo
1

### --why--

V české abecedě je `ř` samostatné písmeno až za `r`, takže Řeka patří **za** Rybu a výsledek je kladný.

### --see--

js-retezce-cisla/retezce#porovnani-a-razeni-podle-cestiny
:::

## Unicode: diakritika a emoji

Počítač ukládá každý znak jako číslo z tabulky Unicode. JavaScript ale řetězec neukládá po celých znacích, ukládá ho po **[[kódová jednotka|kódových jednotkách]]** (*code units*), každá má 16 bitů. Běžná písmena včetně `č` a `ř` se vejdou do jedné. Většina emoji potřebuje dvě. A `length` počítá právě jednotky.

:::live js predict
```js
console.log('👍🏽'.length);
```
--question-- Co vypíše `console.log('👍🏽'.length)`?
--expected-- 4
--why-- Emoji palce nahoru zabírá dvě kódové jednotky a odstín pleti je samostatný znak, který zabírá další dvě. Na obrazovce se složí do jednoho obrázku, ale `length` napočítá čtyři. Rodina `👨‍👩‍👧` má dokonce 8.
:::

Co s tím? Záleží, co potřebuješ spočítat:

:::live js
```js
const nick = 'Ema👍🏽';

console.log(nick.length);
console.log([...nick].length);

const graphemes = new Intl.Segmenter('cs', { granularity: 'grapheme' });
console.log([...graphemes.segment(nick)].length);

console.log(nick.slice(0, 5));
```
:::

- `length` — kódové jednotky. Stačí na limity databáze a na česká písmena.
- `[...nick].length` nebo cyklus `for…of` — celé znaky Unicode (*code points*). Palec je jeden, odstín pleti druhý.
- `Intl.Segmenter` — [[grafém|grafémy]], tedy to, co člověk vidí jako jeden znak. Tohle chceš u počítadla znaků ve formuláři.

`slice(0, 5)` vrátil palec bez odstínu pleti. Zkus ho změnit na `slice(0, 4)` a sleduj, jak se palec rozpadne. `slice` řeže po jednotkách, a když trefí doprostřed emoji, zbyde po něm znak `�`.

:::check
Počítadlo pod textovým polem má ukazovat, kolik znaků uživatel napsal, přesně tak, jak je vidí. Co použiješ?

### --answer--

`text.length`

#### --why--

`length` počítá kódové jednotky, takže emoji s odstínem pleti by počítadlo započítalo čtyřikrát.

### --answer--

Cyklus `for…of`, který počítá průchody.

#### --why--

`for…of` prochází celé znaky Unicode. Palec a odstín pleti jsou ale dva znaky, i když je člověk vidí jako jeden.

### --correct--

`Intl.Segmenter` s `granularity: 'grapheme'`.

#### --why--

Segmenter dělí text na grafémy — přesně na to, co člověk vidí jako jeden znak, včetně emoji složených z více částí.

### --see--

js-retezce-cisla/retezce#unicode-diakritika-a-emoji
:::

### Diakritika a `normalize`

Písmeno `é` jde v Unicode zapsat dvěma způsoby: jako jeden znak `é`, nebo jako `e` a za ním samostatnou čárku. Na obrazovce vypadají stejně, ale `===` je porovná jako různé řetězce. Takový text přijde třeba z macOS nebo po zkopírování z PDF.

`text.normalize('NFC')` sloučí písmeno a značku do jednoho znaku, `text.normalize('NFD')` naopak každé písmeno s diakritikou **rozloží** na základní písmeno a značku. Po rozložení jdou značky smazat — a zůstane text bez diakritiky, přesně to, co potřebuješ na adresu `/inzerat/zlutoucky-kun` nebo na vyhledávání, které najde `zidle` i v `Židle`.

:::live js
```js
const word = 'Žluťoučký';
const decomposed = word.normalize('NFD');

console.log(word.length, decomposed.length);
console.log(decomposed.replace(/\p{M}/gu, ''));
console.log(word.replace(/\p{M}/gu, ''));
```
:::

Zápis mezi lomítky `/\p{M}/gu` je regulární výraz: „každá značka (*Mark*) v celém textu". Rozebereš ho v lekci [Regulární výrazy](see:js-retezce-cisla/regularni-vyrazy#tridy-znaku), teď ho ber jako hotový vzor. Podívej se na poslední řádek: **bez `normalize('NFD')` se nesmaže nic**, protože `ž` je jeden znak a žádnou samostatnou značku nemá.

> [!REMEMBER]
> **Diakritiku odstraníš ve dvou krocích: rozlož (`normalize('NFD')`), pak smaž značky (`replace(/\p{M}/gu, '')`).** Jeden krok bez druhého nedělá nic.

:::check
Vyhledávání má najít inzerát `Židle IKEA`, i když uživatel napíše `zidle`. Který výraz dá z `'Židle IKEA'` text, ve kterém `'zidle'` najde `includes`?

### --answer--

`title.toLowerCase().replace(/\p{M}/gu, '')`

#### --why--

Bez rozložení nemá `ž` žádnou samostatnou značku, takže `replace` nic nesmaže a zůstane `židle ikea`.

### --correct--

`title.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()`

#### --why--

Rozložení oddělí háček od `z`, `replace` ho smaže a `toLowerCase` sjednotí velikost: `zidle ikea`.

### --answer--

`title.normalize('NFC').toLowerCase()`

#### --why--

`NFC` písmena a značky naopak **skládá** dohromady, takže háček zůstane součástí `ž`.

### --see--

js-retezce-cisla/retezce#diakritika-a-normalize
:::

:::explain
Vysvětli vlastními slovy, proč `'👍🏽'.length` vrátí 4 a proč `'Žluťoučký'.replace(/\p{M}/gu, '')` diakritiku nesmaže.

## --model--

JavaScript ukládá řetězce po kódových jednotkách a `length` počítá právě je, ne znaky, které vidím. Emoji palce zabírá dvě jednotky a odstín pleti další dvě, proto čtyři. S diakritikou je to podobné: `ž` je obvykle jeden znak, háček v něm není samostatně. Regulární výraz `\p{M}` maže jen samostatné značky, takže text musím nejdřív rozložit přes `normalize('NFD')` na písmeno a značku, a teprve pak jde značka smazat.

## --checklist--

- `length` počítá kódové jednotky, ne viditelné znaky.
- Emoji často zabírá víc jednotek, emoji s odstínem pleti jsou dva znaky Unicode.
- Písmeno s diakritikou je obvykle jeden znak bez samostatné značky.
- `normalize('NFD')` rozloží písmeno na základní písmeno a značku, teprve pak jde značka smazat.
:::

## Typické chyby a pasti

### Zahozený výsledek metody

> [!PITFALL]
> **Metoda zavolaná bez uložení výsledku nic nezmění.** Příznak: po `name.trim();` má jméno pořád mezery, po `code.toUpperCase();` je kód pořád malými písmeny. V konzoli žádná chyba. Oprava: `name = name.trim();`, nebo rovnou `return name.trim();`.

### Znak na neexistující pozici

> [!PITFALL]
> **Prázdný řetězec nemá první znak.** `''[0]` a `''.at(0)` vrátí `undefined` a další metoda spadne: `''[0].toUpperCase()` skončí `TypeError: Cannot read properties of undefined (reading 'toUpperCase')`. Typicky u iniciál prázdného jména. Oprava: `slice(0, 1)` vrací u prázdného textu `''`, nebo prázdný vstup ošetři podmínkou na začátku.

:::live js predict
```js
const empty = '';

console.log(`[${empty.slice(0, 1).toUpperCase()}]`);
console.log(`[${empty.at(0)}]`);
```
--question-- Co vypíšou oba řádky? Každý výpis na vlastní řádek.
--expected--
```text
[]
[undefined]
```
--why-- `slice(0, 1)` u prázdného textu vrátí prázdný řetězec a `toUpperCase()` na něm projde. `at(0)` vrátí `undefined` a šablonový řetězec z něj udělá text `undefined`. Kdybys na něm zavolal `toUpperCase()`, kód spadne.
:::

### Řez uprostřed emoji

> [!PITFALL]
> **`slice` řeže po kódových jednotkách.** Zkrácený popis `'Prodám kolo 🚲'.slice(0, 13)` skončí polovinou emoji a na stránce je `�`. Oprava: řež celé znaky, třeba přes cyklus `for…of`, nebo grafémy přes `Intl.Segmenter`.

### Porovnání bez normalizace

> [!PITFALL]
> **Dva stejně vypadající texty nejsou `===`.** `'café'` zapsané se samostatnou čárkou a `'café'` jako jeden znak se porovnají jako `false`. Příznak: hledání „nenajde" text, který na obrazovce vidíš. Oprava: před porovnáním obě strany `normalize('NFC')`.

:::check
Kolegova funkce vrací iniciálu jména. U prázdného jména shodí celou stránku. Který zápis je bezpečný?

```js
function initial(name) {
  return name[0].toUpperCase();
}
```

### --answer--

`return name.at(0).toUpperCase();`

#### --why--

`at(0)` vrací u prázdného textu taky `undefined`, takže `toUpperCase` spadne stejně.

### --correct--

`return name.slice(0, 1).toUpperCase();`

#### --why--

`slice` u prázdného textu vrátí prázdný řetězec a na něm `toUpperCase()` projde.

### --answer--

`return name.toUpperCase()[1];`

#### --why--

Index `1` je druhý znak, ne první. A u prázdného textu by vrátil `undefined`.

### --see--

js-retezce-cisla/retezce#znak-na-neexistujici-pozici
:::

Ve workshopu Inzerát do bazaru z těchhle metod postavíš čistý titulek, zkrácený popis, adresu bez diakritiky a živý náhled inzerátu.

## Kde to najdeš v MDN

- [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) — přehled všech metod řetězce. V části *UTF-16 characters, Unicode code points, and grapheme clusters* je vysvětlené, proč `length` u emoji nesedí.
- [String.prototype.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice) — co dělají záporné indexy a čím se liší od `substring`.
- [String.prototype.normalize()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) — formy `NFC` a `NFD` s příklady složených a rozložených znaků.
- [String.prototype.localeCompare()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare) — návratová hodnota a možnost `sensitivity`.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
let greeting = 'ahoj';
greeting.replace('a', 'A');
greeting = greeting.padEnd(6, '!');
console.log(greeting);
```

### --expected--

ahoj!!

### --why--

Výsledek `replace` nikdo neuložil, takže `greeting` zůstalo `'ahoj'`. `padEnd` ale přiřazený je: doplní text zprava vykřičníky na délku 6.

### --see--

js-retezce-cisla/retezce#retezec-se-neda-zmenit

## --question--

Napiš výraz, který z řetězce `path` (třeba `'fotky/2026/kolo.jpeg'`) vrátí jméno souboru za posledním lomítkem.

### --expected--

path.slice(path.lastIndexOf('/') + 1)

### --accept--

path.split('/').at(-1)
path.substring(path.lastIndexOf('/') + 1)
path.split('/').pop()

### --why--

`lastIndexOf('/')` najde poslední lomítko a `slice` od pozice za ním vezme zbytek. Bez `+ 1` by jméno začínalo lomítkem. Když lomítko chybí, `lastIndexOf` vrátí `-1` a `slice(0)` vrátí celý text — což je tady správně.

### --see--

js-retezce-cisla/retezce#kousky-textu-at-slice-a-hledani

## --question--

Seznam měst se má seřadit podle české abecedy. Proč nestačí porovnávat `a < b`?

### --answer--

Protože `<` u řetězců vyhodí chybu.

#### --why--

`<` na řetězcích funguje bez chyby. Otázka je, podle čeho porovnává.

### --correct--

`<` porovnává čísla znaků v Unicode, takže `Č` skončí za `Z` a `Ch` před `H`.

#### --why--

Čísla znaků neznají českou abecedu. Podle ní řadí až `localeCompare(b, 'cs')`.

### --answer--

`<` rozlišuje velikost písmen, jinak by řadil správně.

#### --why--

Velikost písmen je jen část problému. I malými písmeny `č` skončí za `z`.

### --see--

js-retezce-cisla/retezce#porovnani-a-razeni-podle-cestiny

## --question--

Co vypíše tenhle kód?

```js
const plain = 'Šťáva'.normalize('NFD').replace(/\p{M}/gu, '');
console.log(plain.toLowerCase(), plain.length);
```

### --expected--

stava 5

### --why--

`NFD` rozloží `Š`, `ť` a `á` na písmeno a značku, `replace` značky smaže a zůstane `Stava`. Délka je zase 5, protože značky jsou pryč.

### --see--

js-retezce-cisla/retezce#diakritika-a-normalize
