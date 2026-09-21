# Metody pole do hloubky

:::check pretest
Co vrátí tenhle výraz? Pozor, je to `map`, ne `filter`.

```js
[3, 8, 12].map((n) => n > 5)
```

### --expected--

[false, true, true]

### --why--

`map` z každé položky udělá to, co vrátí callback. Callback tu vrací `true`/`false`, takže vznikne pole tří pravdivostních hodnot. Vybírání položek je práce pro `filter`.
:::

:::check pretest
Kolikrát se zavolá callback v tomhle kódu?

```js
[1, 2, 3].some((n) => n > 0)
```

### --expected--

1

### --why--

`some` hledá aspoň jednu vyhovující položku. Hned první (`1 > 0`) vyhoví, takže je odpověď jasná a metoda skončí. Proč na tom záleží, vysvětlí první část.
:::

Ve workshopu jsi napsal přes třicet funkcí a skoro každá měla jeden řádek. Tahle
lekce vysvětluje, **proč** to funguje — co se děje uvnitř `map` nebo `reduce`, jak
číst dlouhé řetězení metod a kdy je lepší vrátit se k obyčejnému cyklu. A hlavně
ukáže chyby, na kterých se u metod pole padá nejčastěji.

Porovnej dva zápisy téže věci:

```js
const result = [];
for (let i = 0; i < orders.length; i++) {
  if (orders[i].paid) {
    result.push(orders[i].total);
  }
}
```

```js
const result = orders.filter((order) => order.paid).map((order) => order.total);
```

U prvního musíš přečíst celé tělo cyklu, abys zjistil, co dělá. U druhého to
říkají jména metod: vyber zaplacené, z každé vezmi částku.

> [!REMEMBER]
> **Metodu pole vybírej podle toho, co chceš dostat zpátky** — nové pole stejné
> délky, kratší pole, jednu položku, ano/ne, nebo jednu hodnotu.

## Callback: funkce, kterou volá někdo jiný

Všechny metody z workshopu dostávají funkci jako argument. Takové funkci se
říká *callback* — ty ji napíšeš, ale **zavolá ji metoda**, kolikrát a s jakými
argumenty uzná za vhodné.

Callback dostane tři argumenty: položku, její index a celé pole. Většinou
potřebuješ jen první, ale ostatní tam jsou vždycky:

:::live js
```js
const letters = ['a', 'b', 'c'];

letters.map((letter, index, array) => {
  console.log(`volání č. ${index + 1}: položka ${letter}, pole má ${array.length} položky`);
  return letter.toUpperCase();
});
```
:::

Zkus místo `map` napsat `some` a sleduj, kolikrát se callback zavolá. Zavolá se
jen jednou: callback vrací `'A'`, což je pravdivá hodnota, a odpověď „aspoň jedna
vyhovuje" je tím jasná. Zkus pak, ať callback vrací `letter === 'c'`, a zavolá se
třikrát.

Callback nemusí být šipková funkce napsaná na místě. Může to být jakákoli funkce,
klidně pojmenovaná. Funkci, která odpovídá `true`/`false` o jedné položce, se říká
[[predikát]]:

:::live js
```js
function isAdult(person) {
  return person.age >= 18;
}

const people = [{ name: 'Eva', age: 34 }, { name: 'Tom', age: 12 }];

// bez závorek za isAdult: předáváš funkci, nevoláš ji
console.log(people.filter(isAdult));
```
:::

Zkus za `isAdult` v posledním řádku připsat závorky a přečti si hlášku v konzoli.

:::check
Co se stane, když napíšeš `people.filter(isAdult())` místo `people.filter(isAdult)`?

### --answer--

Nic, oba zápisy dělají totéž.

#### --why--

Závorky znamenají „zavolej hned". `filter` pak nedostane funkci, ale to, co volání vrátilo.

### --correct--

Kód spadne už při volání `isAdult()`, protože funkce dostane `undefined` místo osoby.

#### --why--

`isAdult()` se zavolá jednou, bez argumentu, a `person.age` na `undefined` vyhodí `TypeError: Cannot read properties of undefined (reading 'age')`. K `filter` se kód ani nedostane.

### --answer--

`filter` vrátí prázdné pole.

#### --why--

K `filter` se kód nedostane. Rozmysli si, kdy se zavolá `isAdult()` se závorkami.

### --see--

js-pole/metody-pole-do-hloubky#callback-funkce-kterou-vola-nekdo-jiny
:::

## Co která metoda vrací

Tohle je tabulka, kterou se vyplatí umět nazpaměť. Když víš, **co metoda vrací**,
víš, co s výsledkem můžeš dělat dál.

| metoda | callback vrací | metoda vrací |
|---|---|---|
| `map` | novou položku | nové pole **stejné délky** |
| `filter` | `true` / `false` | nové pole, stejně dlouhé nebo kratší, s původními položkami |
| `find` | `true` / `false` | **první** vyhovující položku, nebo `undefined` |
| `findIndex` | `true` / `false` | její index, nebo `-1` |
| `some` / `every` | `true` / `false` | `true` / `false` |
| `reduce` | novou hodnotu akumulátoru | **poslední** hodnotu akumulátoru (cokoli) |
| `toSorted` | záporné číslo / 0 / kladné číslo | nové seřazené pole |
| `forEach` | nic | **`undefined`** |

[[forEach]] je jediná, která nic nevrací. Je to „cyklus zapsaný jako metoda" — hodí
se, když s každou položkou chceš něco ==udělat== (vypsat, poslat), ne něco
==vyrobit==.

Callback u [[filter]], [[find]], `some` a `every` nemusí vracet přesně `true` nebo
`false`. Stačí pravdivá nebo nepravdivá hodnota: `filter((item) => item.note)`
propustí položky s neprázdnou poznámkou.

`some` a `every` se zastaví, jakmile znají odpověď. Nad **prázdným** polem
vrací `some` hodnotu `false` (žádná položka nevyhověla) a `every` hodnotu `true`
(žádná položka podmínku neporušila).

:::check
Co vrátí tenhle výraz?

```js
[4, 7, 9].find((n) => n > 5)
```

### --expected--

7

### --why--

`find` vrátí **první** vyhovující položku samotnou, ne pole. `9` taky vyhovuje, ale na tu už nedojde. Pole `[7, 9]` by vrátil `filter`.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci
:::

## Jak pracuje `reduce`

[[reduce]] je nejobecnější z metod — `map`, `filter` i `some` jde napsat přes něj.
Proto je taky nejhůř čitelný. Callback dostává [[akumulátor]] (průběžný
výsledek) a položku a vrací **novou hodnotu akumulátoru**. Když si nevíš rady,
vypiš si akumulátor v každém kroku:

:::live js
```js
const expenses = [120, 45, 300];

const total = expenses.reduce((sum, amount) => {
  console.log(`sum = ${sum}, amount = ${amount}, vracím ${sum + amount}`);
  return sum + amount;
}, 0);

console.log('výsledek:', total);
```
:::

Zkus změnit počáteční hodnotu `0` na `1000` a sleduj první řádek výpisu. Pak ji
úplně smaž (i s čárkou) — první volání dostane jako `sum` rovnou `120` a callback
se zavolá o jednou méně.

Stejný průběh v paměti. Každý krok je stav po jednom volání callbacku:

:::memory
```js
const expenses = [120, 45, 300];
const total = expenses.reduce((sum, amount) => {
  return sum + amount;
}, 0);
```
--step-- 1 | pole výdajů
expenses -> @expenses
@expenses: [120, 45, 300]
--step-- 3 | 1. volání: sum začíná počáteční hodnotou 0, callback vrátí 120
expenses -> @expenses
sum = 0
amount = 120
@expenses: [120, 45, 300]
--step-- 3 | 2. volání: sum je to, co vrátilo 1. volání, callback vrátí 165
expenses -> @expenses
sum = 120
amount = 45
@expenses: [120, 45, 300]
--step-- 3 | 3. volání: poslední položka, callback vrátí 465
expenses -> @expenses
sum = 165
amount = 300
@expenses: [120, 45, 300]
--step-- 4 | reduce vrátí, co vrátilo poslední volání
expenses -> @expenses
total = 465
@expenses: [120, 45, 300]
:::

> [!REMEMBER]
> **Callback `reduce` vrací novou hodnotu akumulátoru a `reduce` vrátí tu poslední.**
> Akumulátor je po celou dobu toho typu, jakým začal: `0` dá číslo, `''` text,
> `{}` objekt, `[]` pole.

### Akumulátor nemusí být číslo

Když akumulátor začne jako prázdný objekt, můžeš ho postupně plnit — třeba počty
podle hodnoty:

:::live js
```js
const answers = ['ano', 'ne', 'ano', 'nevím', 'ano'];

const counts = answers.reduce((result, answer) => {
  result[answer] = (result[answer] ?? 0) + 1;
  return result;
}, {});

console.log(counts);
```
:::

Zkus smazat `?? 0` a sleduj, co se stane s počty. Když klíč přijde poprvé, je
`result[answer]` `undefined` a `undefined + 1` je `NaN`. Pak zkus smazat
`return result;` — druhé volání dostane jako akumulátor `undefined` a spadne.

Když místo počtu potřebuješ položky rozdělit do skupin, má JavaScript hotovou
funkci `Object.groupBy(pole, callback)`: callback vrátí klíč skupiny a položka se
přidá do pole pod tím klíčem.

:::check
Jakou hodnotu vrátí tenhle výraz?

```js
[2, 3, 4].reduce((product, n) => product * n, 1)
```

### --expected--

24

### --why--

Akumulátor začne na `1`, pak `1 × 2 = 2`, `2 × 3 = 6`, `6 × 4 = 24`. U součinu je počáteční hodnota `1`, protože `0` by všechno vynulovala.

### --see--

js-pole/metody-pole-do-hloubky#jak-pracuje-reduce
:::

:::explain
Vysvětli vlastními slovy, co v `reduce` dělá počáteční hodnota a proč ji máš psát vždycky.

## --model--

Počáteční hodnota je akumulátor pro první volání callbacku a určuje, jakého typu výsledek bude. Když ji vynechám, `reduce` vezme jako akumulátor první položku pole a začne až od druhé. U pole čísel to náhodou vyjde, ale u pole objektů se pak sčítá objekt s číslem a nad prázdným polem `reduce` vyhodí `TypeError`. S počáteční hodnotou vrátí prázdné pole právě ji.

## --checklist--

- Počáteční hodnota je akumulátor při prvním volání callbacku.
- Bez ní se jako akumulátor použije první položka pole.
- U pole objektů bez počáteční hodnoty vznikne nesmysl (třeba `[object Object]250`).
- Nad prázdným polem bez počáteční hodnoty `reduce` vyhodí chybu.
:::

## Řazení a porovnávací funkce

Pole má dvě metody na řazení. [[sort]] řadí **na místě** (mutuje) a vrací totéž
pole. [[toSorted]] vrátí seřazenou kopii. Obě dostávají [[porovnávací funkce|porovnávací funkci]]
(*compare function*): dostane dvě položky `a` a `b` a vrátí

- **záporné** číslo, když `a` patří před `b`,
- **kladné** číslo, když `a` patří za `b`,
- **nulu**, když je pořadí jedno.

:::live js
```js
const books = [
  { title: 'Krakatit', pages: 280 },
  { title: 'Babička', pages: 310 },
  { title: 'Čapí hnízdo', pages: 280 },
];

const shortestFirst = books.toSorted((a, b) => a.pages - b.pages);
console.log(shortestFirst.map((book) => book.title));

const byTitle = books.toSorted((a, b) => a.title.localeCompare(b.title, 'cs'));
console.log(byTitle.map((book) => book.title));

console.log(books.map((book) => book.title));
```
:::

Zkus v první porovnávací funkci prohodit `a` a `b` a sleduj pořadí. Pak zkus
u názvů místo `localeCompare` porovnání `a.title < b.title ? -1 : 1` — `Čapí hnízdo`
skončí na konci, protože `<` porovnává čísla znaků v Unicode, ne českou abecedu.

Všimni si `Krakatit` a `Čapí hnízdo` v prvním výpisu: obě mají 280 stran
a zůstaly v pořadí, v jakém byly v původním poli. Řazení v JavaScriptu je
[[stabilní řazení|stabilní]] — položky, které porovnávací funkce označí za stejné,
nepřehází.

> [!TIP]
> U textů piš jazyk vždycky: `a.localeCompare(b, 'cs')`. Bez něj se použije jazyk
> prohlížeče nebo systému a pořadí se liší počítač od počítače.

:::check
Napiš porovnávací funkci (šipkovou), se kterou `prices.toSorted(…)` seřadí čísla od největšího.

### --expected--

(a, b) => b - a

### --accept--

(x, y) => y - x
(first, second) => second - first
function (a, b) { return b - a; }

### --why--

Když má `b` přijít před `a` (větší napřed), musí funkce pro větší `b` vrátit záporné číslo — to dá `b - a`. Vzestupně je `a - b`.

### --see--

js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce
:::

## Řetězení

Když metoda vrací pole, můžeš na výsledek hned zavolat další metodu. Tak vzniká
[[řetězení metod]]:

:::live js
```js
const orders = [
  { customer: 'Eva', total: 450, paid: true },
  { customer: 'Tom', total: 1200, paid: false },
  { customer: 'Jana', total: 980, paid: true },
  { customer: 'Petr', total: 120, paid: true },
];

const bigPaidCustomers = orders
  .filter((order) => order.paid)
  .filter((order) => order.total > 400)
  .toSorted((a, b) => b.total - a.total)
  .map((order) => order.customer);

console.log(bigPaidCustomers);
```
:::

Zkus přesunout `.map(…)` před první `.filter(…)` a podívej se, co se rozbije. Po
`map` už v poli nejsou objekty objednávek, jen jména — a jména nemají `paid`.

Pravidla pro čitelné řetězy:

- **Každou metodu na vlastní řádek.** Řetěz se pak čte shora dolů jako postup.
- **Nejdřív zužuj, pak přetvářej.** `filter` napřed zmenší pole, se kterým pracují
  další kroky, a ty pořád mají po ruce celé objekty.
- **Pojmenuj mezivýsledek**, když je řetěz delší než tři čtyři kroky nebo když jeho
  část znamená něco v řeči zadání: `const paidOrders = orders.filter(…)`.
- `reduce` dávej na **konec** řetězu — vrací většinou jednu hodnotu, ne pole.

:::check
Máš pole objednávek a chceš **jména zákazníků** zaplacených objednávek. Který řetěz funguje?

### --correct--

`orders.filter((o) => o.paid).map((o) => o.customer)`

#### --why--

`filter` vybere zaplacené objednávky (celé objekty), `map` z nich pak vytáhne jména.

### --answer--

`orders.map((o) => o.customer).filter((o) => o.paid)`

#### --why--

Po `map` jsou v poli jen texty se jmény. Text nemá vlastnost `paid`, takže `filter` nepropustí nic.

### --answer--

`orders.forEach((o) => o.customer).filter((o) => o.paid)`

#### --why--

Podívej se do tabulky, co vrací `forEach`, a zkus na to zavolat `filter`.

### --see--

js-pole/metody-pole-do-hloubky#retezeni
:::

## Kdy metody a kdy `for…of`

Metody nejsou vždycky lepší. Obyčejný [[for…of]] vyhraje, když:

- **potřebuješ skončit dřív** podle složitější podmínky — `for…of` umí `break`
  a `continue`, `forEach` ani `map` ne,
- **potřebuješ v jednom průchodu víc výsledků** najednou (třeba minimum, maximum
  a součet) a `reduce` s objektem by byl nečitelný,
- **uvnitř čekáš na asynchronní operace postupně** (viz past níže).

Metody vyhrají, když **přetváříš data** — z pole děláš jiné pole nebo jednu
hodnotu. Jméno metody pak slouží jako dokumentace.

> [!NOTE]
> A výkon? Řetěz `filter → map → reduce` projde pole třikrát, cyklus jednou.
> U stovek nebo tisíců položek je rozdíl v mikrosekundách. Piš čitelně;
> optimalizuj, až když měřením zjistíš, že je to opravdu úzké hrdlo.

:::check
Kdy je lepší napsat `for…of` než řetěz metod?

### --answer--

Vždycky, když má pole víc než sto položek, protože metody jsou pomalé.

#### --why--

U stovek i tisíců položek je rozdíl neměřitelný. Výkon je důvod až u opravdu velkých dat a po změření.

### --correct--

Když uvnitř postupně čekáš přes `await` nebo potřebuješ průchod ukončit dřív přes `break`.

#### --why--

`forEach` na `await` nečeká a metody pole neumí `break`. Na tohle je `for…of` správný nástroj.

### --answer--

Když z pole vyrábíš nové pole se stejným počtem položek.

#### --why--

Podívej se do tabulky v části Co která metoda vrací — tuhle práci jedna metoda popisuje přesně.

### --see--

js-pole/metody-pole-do-hloubky#kdy-metody-a-kdy-for-of
:::

## Typické chyby a pasti

### Zapomenutý `return` ve složených závorkách

Šipková funkce bez složených závorek vrací výraz automaticky. Se složenými
závorkami je to tělo funkce:

:::live js predict
```js
const prices = [100, 250];

const withVat = prices.map((price) => { price * 1.21 });

console.log(withVat);
```
--question-- Co vypíše `console.log(withVat)`?
--expected-- [undefined, undefined]
--why-- `{ price * 1.21 }` je tělo funkce, ne výraz k vrácení. Funkce bez `return` vrací `undefined` a `map` z těch výsledků poskládá pole stejné délky. Zkus smazat složené závorky.
:::

> [!PITFALL]
> **Callback se složenými závorkami bez `return` vrací `undefined`.** Příznak:
> `map` vrátí `[undefined, undefined]`, `filter` tiše **prázdné pole** a `reduce`
> vrátí `undefined` (nebo spadne ve druhém volání, když s akumulátorem pracuje,
> třeba `result[key]`). Oprava: smaž složené závorky, nebo připiš `return`.
> Objekt vracej v kulatých závorkách: `(price) => ({ price, vat: price * 0.21 })`.

### `reduce` bez počáteční hodnoty

:::live js predict
```js
const cart = [{ price: 100 }, { price: 250 }];

const total = cart.reduce((sum, item) => sum + item.price);

console.log(total);
```
--question-- Co vypíše `console.log(total)`?
--expected-- [object Object]250
--why-- Bez počáteční hodnoty je první akumulátor celý objekt `{ price: 100 }`. `objekt + 250` převede objekt na text `[object Object]` a připojí `250`. Zkus doplnit `, 0` za callback.
:::

> [!PITFALL]
> **`reduce` bez počáteční hodnoty bere jako akumulátor první položku.** Příznak:
> u pole objektů vyjde `[object Object]250`, u prázdného pole kód spadne s hláškou
> `TypeError: Reduce of empty array with no initial value`. Oprava:
> [[počáteční hodnota reduce|počáteční hodnotu]] piš vždycky, i u čísel: `reduce((sum, item) => sum + item.price, 0)`.

### `sort` bez porovnávací funkce

:::live js predict
```js
const prices = [10, 9, 1];

console.log(prices.sort());
```
--question-- Co vypíše `console.log(prices.sort())`?
--expected-- [1, 10, 9]
--why-- Bez porovnávací funkce `sort` převede položky na text a řadí je jako slova: `'1'` < `'10'` < `'9'`, protože se porovnává znak po znaku. Zkus `prices.sort((a, b) => a - b)`.
:::

> [!PITFALL]
> **`sort()` bez porovnávací funkce řadí čísla jako text** a navíc mutuje pole.
> Příznak: `[9, 25, 100]` se seřadí na `[100, 25, 9]`. Oprava:
> `toSorted((a, b) => a - b)`.

### Mutace uvnitř `map`

:::live js predict
```js
const tasks = [{ title: 'Uklidit', done: false }];

const finished = tasks.map((task) => {
  task.done = true;
  return task;
});

console.log(tasks[0].done);
```
--question-- Co vypíše `console.log(tasks[0].done)`?
--expected-- true
--why-- `map` vytvoří nové pole, ale callback dostává tytéž objekty, které leží v `tasks`, a přímo jim přepisuje `done`. Nové je jen pole, ne položky.
:::

> [!PITFALL]
> **Callback v `map` mění položku, kterou dostal.** Příznak: výsledek vypadá
> správně, ale změnila se i původní data (nefunguje „Zpět", přehled ukazuje nový
> stav dřív, než jsi ho uložil). Oprava: vrať nový objekt,
> `tasks.map((task) => ({ ...task, done: true }))`.

### `forEach` s `async` funkcí

K asynchronnímu kódu se dostaneme v samostatné sekci. Teď stačí vědět, že `await`
čeká na dokončení operace, která chvíli trvá (třeba stažení dat ze sítě), a funkce
označená `async` vrací slib, že výsledek teprve bude. `forEach` na tyhle sliby
**nečeká**. Zavolá callback pro všechny položky a hned skončí:

:::live js
```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveAll(names) {
  names.forEach(async (name) => {
    await wait(100);
    console.log('uloženo:', name);
  });
  console.log('forEach: hotovo?');

  for (const name of names) {
    await wait(100);
    console.log('for…of uložilo:', name);
  }
  console.log('for…of: hotovo');
}

saveAll(['Eva', 'Tom']);
```
:::

Sleduj, kde ve výpisu je řádek `forEach: hotovo?` a kde `for…of: hotovo`.

> [!PITFALL]
> **`forEach` na `await` v callbacku nečeká.** Příznak: kód za `forEach` běží
> dřív, než se položky zpracují („hotovo" se vypíše jako první). Oprava: `for…of`
> s `await` uvnitř. Jak spustit všechny operace najednou a počkat na výsledek,
> uvidíš v sekci o asynchronním kódu.

### `map` místo `forEach` (a naopak)

> [!PITFALL]
> **`map`, jehož výsledek nikdo nepoužije, je `forEach` v přestrojení**, a `forEach`,
> ve kterém plníš pole přes `push`, je `map` napsaný složitě. Příznak: čtenář čeká
> nové pole a žádné nepřijde, nebo naopak hledá, kde se pole plní. Oprava: vyber
> metodu podle toho, co chceš **vrátit**.

### Předání funkce, která bere víc argumentů

:::live js predict
```js
const texts = ['1', '2', '3'];

console.log(texts.map(parseInt));
```
--question-- Co vypíše `console.log(texts.map(parseInt))`?
--expected-- [1, NaN, NaN]
--why-- `map` volá callback se třemi argumenty (položka, index, pole) a `parseInt` bere druhý argument jako číselnou soustavu: `parseInt('2', 1)` je `NaN`. Zkus `texts.map((text) => parseInt(text, 10))` nebo `texts.map(Number)`.
:::

> [!PITFALL]
> **Hotová funkce předaná jako callback dostane i index a pole.** Příznak:
> `['1', '2', '3'].map(parseInt)` vrátí `[1, NaN, NaN]`. Oprava: obal ji do šipkové
> funkce, která předá jen to, co chceš: `map((text) => parseInt(text, 10))`.

:::check
`toSorted` pole nemutuje. Co ale vrátí tenhle výraz?

```js
[5, 1, 10].toSorted()
```

### --expected--

[1, 10, 5]

### --why--

`toSorted` bez porovnávací funkce řadí stejně jako `sort` — jako text: `'1'` < `'10'` < `'5'`. Nemutuje, ale čísla bez `(a, b) => a - b` pořád neseřadí.

### --see--

js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce
:::

:::explain
Vysvětli vlastními slovy, jaký je rozdíl mezi `map` a `forEach` a podle čeho mezi nimi vybereš.

## --model--

`map` zavolá callback pro každou položku a z hodnot, které callback vrátí, postaví nové pole stejné délky. `forEach` callback taky zavolá pro každou položku, ale vrácené hodnoty zahodí a sám vrací `undefined`. Proto `map` použiju, když chci z pole vyrobit jiné pole, a `forEach`, když chci s položkami jen něco udělat, třeba je vypsat. Ani jeden neumí skončit dřív a ani jeden nečeká na `await`.

## --checklist--

- `map` vrací nové pole stejné délky z hodnot, které vrátí callback.
- `forEach` vrací `undefined` a hodnoty z callbacku zahazuje.
- `map` je na přetváření dat, `forEach` na vedlejší efekty (výpis, odeslání).
- `map`, jehož výsledek nikdo nepoužije, patří přepsat na `forEach` nebo `for…of`.
:::

## Kde to najdeš v MDN

- [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) — průběh volání callbacku v tabulce a část *Edge cases* o prázdném poli bez počáteční hodnoty.
- [Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) — co má vracet porovnávací funkce a proč se bez ní řadí jako text.
- [String.prototype.localeCompare()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare) — řazení textů podle jazyka.
- [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) — oddíl o `parseInt` jako callbacku (hledej *Using parseInt()*).

# --questions--

## --question--

Co vrátí tenhle výraz?

```js
[3, 8, 12].filter((n) => { n > 5 })
```

### --expected--

[]

### --why--

Se složenými závorkami je `n > 5` jen příkaz v těle funkce a callback vrací `undefined`, tedy nepravdu. Žádná položka neprojde.

### --see--

js-pole/metody-pole-do-hloubky#zapomenuty-return-ve-slozenych-zavorkach

## --question--

Co vypíše poslední řádek?

```js
const words = ['pes', 'kočka', 'slon'];
const lengths = words
  .filter((word) => word.length > 3)
  .map((word) => word.length);
console.log(lengths);
```

### --expected--

[5, 4]

### --why--

`filter` propustí `'kočka'` a `'slon'` (`'pes'` má přesně tři znaky, podmínka je `> 3`). `map` z nich udělá délky `5` a `4`.

### --see--

js-pole/metody-pole-do-hloubky#retezeni

## --question--

Proč se u `reduce` doporučuje vždycky psát počáteční hodnotu?

### --answer--

Bez ní `reduce` projde pole pozpátku.

#### --why--

Směr průchodu počáteční hodnota neovlivňuje. Zamysli se, čím začne akumulátor, když žádnou nemá.

### --correct--

Bez ní se jako první akumulátor použije první položka pole — u pole objektů vznikne nesmysl a nad prázdným polem `reduce` vyhodí chybu.

#### --why--

S počáteční hodnotou je typ akumulátoru jasný od začátku a prázdné pole vrátí právě ji.

### --answer--

Bez ní vrací `reduce` pole místo jedné hodnoty.

#### --why--

`reduce` vrací to, co vrátí poslední volání callbacku. Počáteční hodnota určuje, čím akumulátor začne, ne co metoda vrací.

### --see--

js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty

## --question--

Chceš zjistit, jestli je v košíku aspoň jedna položka dražší než 1000 Kč. Která metoda odpoví nejpřímočařeji?

### --correct--

`some`

#### --why--

`some` vrátí rovnou `true`/`false` a zastaví se u první drahé položky.

### --answer--

`filter`

#### --why--

Funguje přes `filter(…).length > 0`, ale postaví zbytečné pole a projde všechny položky. Je metoda, která vrací rovnou ano/ne?

### --answer--

`map`

#### --why--

`map` vrací pole stejné délky, ne jednu odpověď.

### --answer--

`forEach`

#### --why--

`forEach` vrací `undefined`, výsledek bys musel skládat ručně v proměnné.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci
