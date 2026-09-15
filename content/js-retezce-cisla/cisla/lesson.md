# Čísla a počítání

:::check pretest
Co vypíše tenhle řádek? Tipni si, i když si nejsi jistý.

```js
console.log(1.1 + 2.2 === 3.3);
```

### --expected--

false

### --why--

`1.1 + 2.2` vyjde v JavaScriptu `3.3000000000000003`. Proč počítač neumí přesně sečíst dvě čísla s desetinami, vysvětlí hned první část.
:::

:::check pretest
Košík ukazuje cenu `(1.005).toFixed(2)`. Co zákazník uvidí?

### --answer--

`1.01`

#### --why--

Tak by to zaokrouhlil člověk na papíře. Jak to vidí počítač, ukáže část o `toFixed`.

### --correct--

`1.00`

#### --why--

Číslo `1.005` jde v paměti uložit jen přibližně, o kousek menší. Rozbor je v části o `toFixed`.

### --answer--

`1.005`

#### --why--

`toFixed(2)` vždycky vrátí právě dvě desetinná místa. Na kterou stranu zaokrouhlí, ukáže část o `toFixed`.
:::

Každý e-shop, kalkulačka hypotéky nebo aplikace na sdílené výdaje stojí na počítání s penězi. A přesně tam JavaScript umí nepříjemně překvapit: součet košíku vyjde o haléř jinak než na účtence, cena `49,90 × 3` se zobrazí jako `149,69 Kč` a pole „Počet kusů" pošle místo čísla text `'3'`.

Všechno to má jednu příčinu a pár pravidel, která stačí znát.

> [!REMEMBER]
> **Desetinné číslo je v počítači jen přibližné. Peníze proto počítej v celých haléřích a desetinnou čárku přidej až při výpisu.**

## Jeden typ `Number` a plovoucí řádová čárka

JavaScript má pro běžná čísla jediný typ `number` — celá i desetinná čísla jsou totéž. Ukládá je ve dvojkové soustavě jako [[plovoucí řádová čárka|plovoucí řádovou čárku]] (*floating point*, norma IEEE 754).

Ve dvojkové soustavě ale nejde přesně zapsat `0.1`, stejně jako v desítkové nejde přesně zapsat třetinu (`0.3333…`). Počítač uloží nejbližší číslo, které zapsat umí. Při výpisu se malá odchylka většinou schová, při sčítání se ale odchylky sčítají a vylezou ven.

:::live js predict
```js
const coffee = 0.1;
const milk = 0.2;

console.log(coffee + milk);
```
--question-- Co vypíše `console.log(coffee + milk)`?
--expected-- 0.30000000000000004
--why-- `0.1` i `0.2` jsou v paměti uložené jen přibližně a jejich odchylky se při sčítání sečtou. Výsledek je nejbližší dvojkové číslo k `0.30000000000000004`, ne k `0.3`. Nejde o chybu JavaScriptu — stejně počítá Python, Java i C.
:::

Zkus místo `0.1` a `0.2` sečíst `0.5` a `0.25`. Výsledek sedí přesně: poloviny a čtvrtiny jdou ve dvojkové soustavě zapsat beze zbytku, desetiny ne.

Celá čísla tenhle problém nemají. Až do 9 007 199 254 740 991 (`Number.MAX_SAFE_INTEGER`) uloží `number` každé celé číslo přesně. Na tom stojí pravidlo z rámečku nahoře.

:::check
Proč `0.1 + 0.2 === 0.3` vrátí `false`?

### --answer--

JavaScript má chybu v operátoru `+` u desetinných čísel.

#### --why--

Myslíš si, že jde o chybu JavaScriptu? Stejně počítá každý jazyk, který ukládá čísla jako plovoucí řádovou čárku.

### --correct--

`0.1` a `0.2` jde ve dvojkové soustavě uložit jen přibližně a odchylky se při sčítání sečtou.

#### --why--

Přesně tak. Desetiny ve dvojkové soustavě nemají konečný zápis, stejně jako třetina v desítkové.

### --answer--

`===` porovnává typ a `0.3` je jiný typ než součet.

#### --why--

Oba výsledky jsou typu `number`. Liší se hodnota, ne typ.

### --see--

js-retezce-cisla/cisla#jeden-typ-number-a-plovouci-radova-carka
:::

## Počítání v haléřích

Když uložíš cenu `49.90` a počítáš s ní, dostaneš přibližný výsledek. Když uložíš `4990` haléřů, násobíš a sčítáš celá čísla — a ta jsou přesná.

:::live js predict
```js
const priceKc = 49.9;
const priceHalere = 4990;

console.log(Math.floor(priceKc * 3 * 100));
console.log(priceHalere * 3);
```
--question-- Kolik haléřů vypíšou oba řádky? Každý výsledek na vlastní řádek.
--expected--
```text
14969
14970
```
--why-- `49.9` je v paměti o kousek menší a násobení odchylku zvětší: `49.9 * 3 * 100` je `14969.999999999998`. `Math.floor` jde dolů, a haléř je pryč. `4990 * 3` je násobení celých čísel a `14970` haléřů je přesně 149,70 Kč. Zkus u prvního řádku smazat `Math.floor` a podívej se na surový výsledek.
:::

Převod mezi korunami a haléři má jednu past: `4.35 * 100` není `435`, ale `434.99999999999994`. Proto se po vynásobení stovkou **vždy zaokrouhluje** přes `Math.round`:

:::live js
```js
const fromForm = 4.35;

console.log(fromForm * 100);
console.log(Math.round(fromForm * 100));

const totalHalere = 435 * 3;
console.log(totalHalere / 100);
```
:::

Zkus změnit `fromForm` na `19.99` a sleduj oba první výpisy. Dělení stovkou na konci je v pořádku — to už je výpis, s výsledkem dál nepočítáš.

> [!REMEMBER]
> **Z korun na haléře: `Math.round(koruny * 100)`. Počítej v haléřích, na koruny převáděj až při výpisu.**

V praxi se tomu říká „ukládat [[nejmenší jednotka měny|nejmenší jednotku měny]]" a stejně to dělají platební brány: Stripe i GoPay posílají částky v haléřích nebo centech.

:::check
Napiš výraz, který převede cenu `price` v korunách (třeba `19.99`) na celé haléře.

### --expected--

Math.round(price * 100)

### --accept--

Math.round(100 * price)

### --why--

`price * 100` může vyjít o kousek vedle (`19.99 * 100` je `1998.9999999999998`) a `Math.round` to srovná na nejbližší celé číslo. `Math.floor` by tu ubral haléř.

### --see--

js-retezce-cisla/cisla#pocitani-v-halerich
:::

:::explain
Vysvětli vlastními slovy, proč e-shop ukládá ceny v haléřích a ne v korunách s desetinnou čárkou.

## --model--

Desetinná čísla ukládá počítač ve dvojkové soustavě jen přibližně, takže třeba `49.9 * 3 * 100` vyjde `14969.999999999998`. Odchylky se při sčítání a násobení hromadí a po zaokrouhlení dolů z nich je chybějící haléř. Celá čísla jsou až do obrovských hodnot uložená přesně, proto ceny držím v haléřích, počítám s celými čísly a na koruny je převádím až při výpisu.

## --checklist--

- Desetinná čísla jsou v paměti uložená jen přibližně.
- Odchylky se při výpočtech hromadí a můžou změnit výsledek o haléř.
- Celá čísla jsou uložená přesně, proto se počítá v haléřích.
- Na koruny se převádí až při výpisu.
:::

## Zaokrouhlení: `round`, `floor`, `ceil` a `trunc`

Objekt `Math` má čtyři způsoby, jak z desetinného čísla udělat celé. U kladných čísel dávají `floor` a `trunc` totéž, u záporných se rozejdou:

| funkce | co dělá | `4.7` | `-4.7` |
|---|---|---|---|
| `Math.round(x)` | nejbližší celé číslo | `5` | `-5` |
| `Math.floor(x)` | dolů, k menšímu číslu | `4` | `-5` |
| `Math.ceil(x)` | nahoru, k většímu číslu | `5` | `-4` |
| `Math.trunc(x)` | useknout desetinnou část | `4` | `-4` |

`floor` znamená „podlaha" — jde vždycky **dolů na číselné ose**, a u záporného čísla je dole větší absolutní hodnota. Kdo chce „jen useknout desetiny", potřebuje `trunc`.

:::live js predict
```js
console.log(Math.round(2.5));
console.log(Math.round(-2.5));
```
--question-- Co vypíšou oba řádky? Každý výsledek na vlastní řádek.
--expected--
```text
3
-2
```
--why-- `Math.round` zaokrouhluje přesnou polovinu vždycky **nahoru na číselné ose**, tedy k většímu číslu. U `2.5` je to `3`, u `-2.5` je větší číslo `-2`, ne `-3`. Při vracení peněz (záporné částky) proto „jak na papíře" zaokrouhlíš jen tak, že zaokrouhlíš kladnou hodnotu a znaménko přidáš zpátky.
:::

Zkus do obou řádků dosadit `Math.trunc` a pak `Math.floor` a sleduj, jak se liší u záporného čísla.

> [!PITFALL]
> **`Math.floor` u záporného čísla přidá, neubere.** `Math.floor(-4.7)` je `-5`. Příznak: vratka nebo sleva vychází o korunu větší, než má. Oprava: na „useknutí" používej `Math.trunc`, na běžné zaokrouhlení `Math.round`.

:::check
Co vrátí `Math.trunc(-3.9)`?

### --expected--

-3

### --why--

`trunc` jen usekne desetinnou část a znaménko nechá, takže z `-3.9` zbude `-3`. `Math.floor(-3.9)` by vrátil `-4`.

### --see--

js-retezce-cisla/cisla#zaokrouhleni-round-floor-ceil-a-trunc
:::

## `toFixed` vrací řetězec

`číslo.toFixed(n)` zaokrouhlí číslo na `n` desetinných míst a vrátí **text**. Na výpis se hodí, na další počítání ne.

:::live js predict
```js
const price = 10.5;
const label = price.toFixed(2);

console.log(label + 5);
```
--question-- Co vypíše `console.log(label + 5)`?
--expected-- 10.505
--why-- `toFixed(2)` vrátil řetězec `'10.50'` a `+` s řetězcem spojuje text, nesčítá. Vznikne `'10.505'`. Stejnou past, text sečtený s číslem, znáš z kalkulačky spropitného.
:::

Druhá past je zaokrouhlení. `toFixed` zaokrouhluje skutečnou uloženou hodnotu, a ta je u čísel jako `1.005` o kousek menší, než vypadá: `(1.005).toFixed(2)` vrátí `'1.00'`. Zkus v ukázce výše změnit `price` na `1.005` a `label + 5` na `label`.

> [!PITFALL]
> **S výsledkem `toFixed` už nepočítej.** Příznak: součet vypadá jako slepené texty (`'10.505'`, `'1299.0089'`) nebo porovnání `'9.00' < '10.00'` vrátí `false` (texty se porovnávají znak po znaku). Oprava: počítej s čísly v haléřích a `toFixed` nebo `Intl.NumberFormat` použij až na úplném konci, na výpis.

Na české formátování čísel (čárka místo tečky, mezery mezi tisíci, `Kč`) je lepší `Intl.NumberFormat` — probere ho lekce [Formátování a datum](see:js-retezce-cisla/intl-a-datum#intl-numberformat-ceny-procenta-a-jednotky).

:::check
Kolega píše `const total = (price * quantity).toFixed(2) + shipping;`. Co je špatně?

### --answer--

`toFixed` zaokrouhlí dolů, a proto bude celkem o haléř méně.

#### --why--

Zaokrouhlení tu není hlavní problém. Podívej se, jakého typu je výsledek `toFixed`.

### --correct--

`toFixed` vrátí řetězec, takže `+ shipping` přilepí dopravu za text, místo aby ji přičetl.

#### --why--

Přesně. `'299.00' + 89` je `'299.0089'`. Nejdřív sečti čísla, `toFixed` až na výpis.

### --answer--

`toFixed` nejde volat na výsledek výrazu v závorce.

#### --why--

Závorka vrátí obyčejné číslo a na čísle `toFixed` volat jde.

### --see--

js-retezce-cisla/cisla#tofixed-vraci-retezec
:::

## Z textu na číslo: `Number`, `parseInt`, `parseFloat`

Co uživatel napíše do formuláře, přijde do JavaScriptu vždycky jako text. Na převod máš tři nástroje a každý se chová jinak:

| zápis | co udělá | `'42'` | `'08px'` | `'3.99 Kč'` | `''` |
|---|---|---|---|---|---|
| `Number(text)` | celý text musí být číslo (mezery na krajích nevadí) | `42` | `NaN` | `NaN` | `0` |
| `parseInt(text, 10)` | celé číslo ze začátku textu, zbytek zahodí | `42` | `8` | `3` | `NaN` |
| `parseFloat(text)` | desetinné číslo ze začátku textu | `42` | `8` | `3.99` | `NaN` |

`Number` je přísný: buď je celý vstup číslo, nebo dostaneš `NaN`. `parseInt` a `parseFloat` čtou zleva, dokud to jde, a zbytek tiše zahodí — hodí se na `'1080px'`, ale propustí i nesmysl jako `'12abc'`.

:::live js predict
```js
console.log(parseInt('08px', 10));
console.log(Number('08px'));
console.log(Number(''));
```
--question-- Co vypíšou tři řádky? Každý výsledek na vlastní řádek.
--expected--
```text
8
NaN
0
```
--why-- `parseInt` přečte `08`, u `p` skončí a zbytek zahodí. `Number` chce, aby byl číslem celý text, takže `'08px'` je `NaN`. A prázdný text je pro `Number` nula — prázdné pole formuláře tak projde jako `0`, pokud ho neošetříš.
:::

Zkus do prvního řádku napsat `parseInt('1 250', 10)`. Vyjde `1`: mezera mezi tisíci pro `parseInt` znamená konec čísla.

> [!PITFALL]
> **JavaScript nezná desetinnou čárku.** `Number('12,5')` je `NaN` a `parseFloat('12,5')` je `12` — druhý případ je horší, protože vypadá jako číslo. Oprava: nejdřív čárku nahraď tečkou, `Number(text.replace(',', '.'))`, a výsledek ověř přes `Number.isNaN`.

Druhý argument `10` u `parseInt` je číselná soustava. Moderní prohlížeče bez něj text `'08'` čtou desítkově, ale bez soustavy `parseInt` přečte `'0x1A'` jako šestnáctkové číslo — proto se `10` píše vždycky.

:::check
Z pole formuláře přijde `'12,50'`. Napiš výraz, který z proměnné `input` udělá číslo `12.5`.

### --expected--

Number(input.replace(',', '.'))

### --accept--

Number(input.replaceAll(',', '.'))
parseFloat(input.replace(',', '.'))
+input.replace(',', '.')
Number.parseFloat(input.replace(',', '.'))

### --why--

JavaScript čte jen desetinnou tečku, proto se čárka musí nejdřív nahradit. `Number` pak odmítne cokoli, co číslo není.

### --see--

js-retezce-cisla/cisla#z-textu-na-cislo-number-parseint-parsefloat
:::

## `NaN` a `Number.isNaN`

Když převod selže, výsledkem je [[NaN]] (*Not a Number*). Je to hodnota typu `number` s jednou zvláštností: **nerovná se ničemu, ani sama sobě**. Podmínka `value === NaN` proto neplatí nikdy.

:::live js predict
```js
const quantity = Number('tři');

console.log(quantity === NaN);
console.log(Number.isNaN(quantity));
console.log(typeof quantity);
```
--question-- Co vypíšou tři řádky? Každý výsledek na vlastní řádek.
--expected--
```text
false
true
number
```
--why-- `NaN === NaN` je podle normy `false`, takže porovnání nikdy neprojde. Na test slouží `Number.isNaN`. A `typeof NaN` je opravdu `'number'` — „není číslo" je číselná hodnota, která říká, že výpočet nedal smysl.
:::

Starší globální funkce `isNaN` (bez `Number.`) nejdřív hodnotu převede na číslo, takže `isNaN('ahoj')` vrátí `true` a `isNaN('')` vrátí `false`. `Number.isNaN` nic nepřevádí a odpoví jen na otázku „je tohle hodnota `NaN`?". Používej ji.

> [!PITFALL]
> **`NaN` se šíří dál.** Jakýkoli výpočet s `NaN` dá `NaN`: `NaN * 3 + 89` je `NaN`. Příznak: v košíku svítí `NaN Kč` a chyba vznikla o několik řádků dřív, u převodu textu. Oprava: kontroluj `Number.isNaN` hned po převodu vstupu.

:::check
Co vrátí `Number.isNaN('ahoj')`?

### --expected--

false

### --why--

`Number.isNaN` hodnotu nepřevádí. `'ahoj'` je řetězec, ne hodnota `NaN`, proto `false`. Globální `isNaN('ahoj')` by text nejdřív převedl na číslo a vrátil `true`.

### --see--

js-retezce-cisla/cisla#nan-a-number-isnan
:::

## Velká čísla a `BigInt`

`number` uloží přesně každé celé číslo do `Number.MAX_SAFE_INTEGER` (9 007 199 254 740 991, zhruba 9 biliard). Nad touhle hranicí už mezi sousedními čísly vznikají mezery a některá celá čísla zapsat nejde.

:::live js predict
```js
const limit = Number.MAX_SAFE_INTEGER;

console.log(limit + 1 === limit + 2);
```
--question-- Co vypíše `console.log(limit + 1 === limit + 2)`?
--expected-- true
--why-- Za hranicí bezpečných celých čísel `number` nerozliší sousední hodnoty: `limit + 1` i `limit + 2` se uloží jako totéž číslo `9007199254740992`. Na ceny v haléřích je hranice nekonečně daleko, na ID z databáze nebo čísla účtů ne.
:::

Na libovolně velká celá čísla je typ [[BigInt]]: číslo s písmenem `n` na konci (`9007199254740993n`) nebo `BigInt('9007199254740993')`. Počítá přesně, ale jen s celými čísly a nesmí se míchat s `number` — `10n + 1` skončí `TypeError: Cannot mix BigInt and other types, use explicit conversions`.

V praxi `BigInt` potkáš zřídka: dlouhá ID ze sociálních sítí přicházejí z API jako text právě proto, aby se nepoškodila.

:::check
API vrací ID příspěvku `1829384756102938475` jako **číslo**. Co se může stát?

### --answer--

Nic, `number` uloží libovolné celé číslo.

#### --why--

Myslíš si, že celá čísla jsou vždy přesná? Jen do `Number.MAX_SAFE_INTEGER`, tohle ID je větší.

### --correct--

ID se zaokrouhlí na jiné číslo a příspěvek se nenajde.

#### --why--

Nad 9 biliardami `number` sousední celá čísla nerozliší. Proto taková ID chodí jako text nebo `BigInt`.

### --answer--

JavaScript vyhodí `RangeError`.

#### --why--

Žádná chyba nevznikne, to je na tom to zrádné. Číslo se tiše uloží nepřesně.

### --see--

js-retezce-cisla/cisla#velka-cisla-a-bigint
:::

## Náhodná čísla: `Math.random`

`Math.random()` vrátí desetinné číslo od `0` (včetně) do `1` (bez jedničky). Celé číslo z rozsahu vyrobíš ve třech krocích: vynásob počtem možností, usekni desetiny, přičti nejmenší hodnotu.

:::live js
```js
// 1. hod kostkou: 6 možností, nejmenší 1
const dice = Math.floor(Math.random() * 6) + 1;

// 2. sleva od 5 do 15 %: 11 možností, nejmenší 5
const discount = Math.floor(Math.random() * 11) + 5;

console.log(dice, discount);
```
:::

Spusť ukázku několikrát. Pak zkus v kostce zapomenout `+ 1` a sleduj, jestli někdy padne nula a jestli padne šestka.

> [!NOTE]
> `Math.random` není bezpečný na hesla, tokeny ani slosování o peníze — jde předpovědět. Na to je `crypto.getRandomValues` a na náhodná ID `crypto.randomUUID()`. Použiješ je v labu o generátoru hesel v sekci Funkce.

:::check
Napiš výraz, který vrátí náhodné celé číslo od 1 do 10 včetně.

### --expected--

Math.floor(Math.random() * 10) + 1

### --accept--

1 + Math.floor(Math.random() * 10)
Math.trunc(Math.random() * 10) + 1

### --why--

`Math.random() * 10` dá číslo od 0 do 9,999…, `Math.floor` z něj udělá 0 až 9 a `+ 1` posune rozsah na 1 až 10.

### --see--

js-retezce-cisla/cisla#nahodna-cisla-math-random
:::

## Typické chyby a pasti

### Porovnání desetinných čísel přes `===`

> [!PITFALL]
> **`0.1 * 3 === 0.3` je `false`.** Příznak: podmínka „zaplaceno přesně" nebo „součet sedí" občas neplatí, i když čísla vypadají stejně. Oprava: počítej v celých haléřích, kde `===` funguje. Když desetinná čísla porovnat musíš, porovnávej rozdíl s malou tolerancí: `Math.abs(a - b) < 0.000001`.

### Text z formuláře místo čísla

> [!PITFALL]
> **`input.value` je vždycky řetězec.** `'3' * 2` sice dá `6` (násobení text převede), ale `'3' + 2` dá `'32'`. Příznak: počet kusů `2` a přidání jednoho kusu ukáže `21`. Oprava: převeď vstup hned na začátku přes `Number` a zkontroluj `Number.isNaN`.

### Zaokrouhlení mezivýsledků

> [!PITFALL]
> **Zaokrouhlení v každém kroku posčítá chyby.** Když zaokrouhlíš DPH každé položky a pak je sečteš, může celek vyjít o haléř jinak, než když zaokrouhlíš až součet. Příznak: součet řádků na účtence nesedí s „Celkem". Oprava: rozhodni jedno místo, kde se zaokrouhluje, a drž se ho — ve workshopu Ceny v košíku to bude vždy celý haléř.

:::live js predict
```js
const count = '2';
const added = count + 1;
const doubled = count * 2;

console.log(added, doubled);
```
--question-- Co vypíše `console.log(added, doubled)`? Napiš obě hodnoty oddělené mezerou.
--expected-- 21 4
--why-- `+` s řetězcem spojuje text, takže `'2' + 1` je `'21'`. Ostatní aritmetické operátory (`*`, `-`, `/`) text na číslo převedou, proto `'2' * 2` je `4`. Nejistotu odstraní jediné `Number(count)` na začátku.
:::

:::check
V košíku je u položky počet `'2'` z formuláře. Kolega píše `quantity + 1`. Která oprava je nejlepší?

### --answer--

`quantity - -1`

#### --why--

Funguje to, ale nikdo to nepřečte a na dalším místě kódu je `quantity` zase text.

### --correct--

Převést vstup jednou na začátku: `const quantity = Number(input.value);`

#### --why--

Od toho řádku je `quantity` číslo všude a `Number.isNaN` hned odhalí nesmyslný vstup.

### --answer--

`parseInt(quantity + 1, 10)`

#### --why--

Závorky se vyhodnotí dřív: `'2' + 1` je `'21'` a `parseInt` z něj udělá `21`.

### --see--

js-retezce-cisla/cisla#text-z-formulare-misto-cisla
:::

V labu Rozdělení společných výdajů si haléře, převod textu a zaokrouhlení vyzkoušíš sám a příště ceny zformátuješ česky přes `Intl`.

## Kde to najdeš v MDN

- [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) — část *Number encoding* vysvětluje plovoucí řádovou čárku a *Number coercion*, co udělá `Number()` s textem, `''` a `null`.
- [Number.prototype.toFixed()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed) — návratová hodnota je *string* a v příkladech je `(1.005).toFixed(2)`.
- [Math.round()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round) — jak se zaokrouhluje přesná polovina u záporných čísel.
- [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) — zápis s `n` a proč se nesmí míchat s `number`.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
const discount = Math.floor(-12.4);
console.log(discount);
```

### --expected--

-13

### --why--

`Math.floor` jde vždycky dolů na číselné ose, a u záporného čísla je dole `-13`. Useknutí desetin by udělal `Math.trunc`.

### --see--

js-retezce-cisla/cisla#zaokrouhleni-round-floor-ceil-a-trunc

## --question--

Napiš výraz, který převede `totalHalere` (celé číslo, třeba `14970`) na text s korunami a dvěma desetinnými místy ve tvaru `149.70`.

### --expected--

(totalHalere / 100).toFixed(2)

### --accept--

String((totalHalere / 100).toFixed(2))

### --why--

Dělení stovkou vrátí koruny a `toFixed(2)` doplní dvě desetinná místa. Je to až výpis, takže řetězec tady nevadí. Český tvar `149,70 Kč` udělá `Intl.NumberFormat`.

### --see--

js-retezce-cisla/cisla#tofixed-vraci-retezec

## --question--

Uživatel nechal pole „Počet kusů" prázdné. Kód udělá `const quantity = Number(input.value);`. Co je v `quantity`?

### --answer--

`NaN`

#### --why--

Tak by to udělal `parseInt('')`. `Number` se na prázdný text dívá jinak.

### --correct--

`0`

#### --why--

Prázdný (nebo jen mezerový) text převede `Number` na nulu. Prázdné pole proto kontroluj zvlášť, třeba `input.value.trim() === ''`.

### --answer--

`undefined`

#### --why--

`Number` vrací vždycky hodnotu typu `number`, `undefined` nikdy.

### --see--

js-retezce-cisla/cisla#z-textu-na-cislo-number-parseint-parsefloat

## --question--

Co vypíše tenhle kód?

```js
const price = parseFloat('1 290,50 Kč');
console.log(price);
```

### --expected--

1

### --why--

`parseFloat` čte zleva a u první mezery skončí, protože mezera do čísla nepatří. Z ceny tak zbude `1`. Mezery a čárku je potřeba nejdřív upravit.

### --see--

js-retezce-cisla/cisla#z-textu-na-cislo-number-parseint-parsefloat
