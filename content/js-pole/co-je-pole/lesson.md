# Co je pole

:::check pretest
Co vypíše poslední řádek? Tipni si, i když si nejsi jistý.

```js
const shopping = ['chleba', 'mléko', 'jablka'];
console.log(shopping[5]);
```

### --expected--

undefined

### --why--

Index `5` v poli neexistuje. Čtení mimo pole nespadne, vrátí `undefined` — stejně jako neexistující klíč objektu. Proč je to spíš past než výhoda, uvidíš hned v první části.
:::

:::check pretest
Pole je uložené v `const`. Jde do něj přidat další položku?

```js
const tags = ['nové'];
tags.push('sleva');
```

### --answer--

Ne, `const` hodnotu zamkne a `push` vyhodí chybu.

#### --why--

Tak to vypadá podle názvu. Co přesně `const` hlídá, vysvětlí část o `const`.

### --correct--

Ano, `push` projde bez chyby.

#### --why--

`const` hlídá proměnnou, ne obsah pole. Proč, uvidíš v části o `const`.

### --answer--

Jen když pole ještě nemá žádnou položku.

#### --why--

Počet položek s `const` nesouvisí. Co přesně `const` hlídá, vysvětlí část o `const`.
:::

Představ si nákupní seznam uložený do proměnných:

```js
const item1 = 'chleba';
const item2 = 'mléko';
const item3 = 'jablka';
```

Dokud jsou položky tři, jde to. Ale jak zjistíš, kolik jich je? Jak je vypíšeš
všechny najednou? A co když uživatel přidá čtvrtou — založíš za běhu proměnnou
`item4`? Nejde to. Potřebuješ **jednu** hodnotu, ve které je celý seznam, ať je
dlouhý jakkoli. To je [[pole]] (*array*).

> [!REMEMBER]
> **Pole je jedna hodnota s očíslovaným seznamem položek — a proměnná na ni jen ukazuje.**
> Indexy vysvětlí první část lekce, odkazy druhá. Právě kvůli odkazům se pole někdy „samo" změní i jinde.

## Pole je očíslovaný seznam hodnot

Pole zapíšeš do hranatých závorek, položky oddělíš čárkou. Každá položka má
pořadové číslo — [[index]] — a počítá se **od nuly**. Počet položek je ve
vlastnosti [[length]].

:::live js
```js
const shopping = ['chleba', 'mléko', 'jablka'];

console.log(shopping[0]);
console.log(shopping[2]);
console.log(shopping.length);
console.log(shopping[5]);
```
:::

Zkus změnit `shopping[5]` na `shopping[shopping.length - 1]` a sleduj, co se
vypíše. Poslední položka má vždycky index `length - 1`, protože se počítá od nuly.
Kratší zápis je `shopping.at(-1)` — záporné číslo u `at` počítá od konce.

> [!PITFALL]
> **Čtení mimo pole nespadne, vrátí `undefined`.** Chyba se proto neukáže tam,
> kde vznikla, ale až o kus dál, když s `undefined` zkusíš pracovat:
> `products[3].name` u pole se třemi položkami skončí hláškou
> `TypeError: Cannot read properties of undefined (reading 'name')`.
> Oprava: zkontroluj index (`i < products.length`, ne `<=`) nebo si výsledek před
> použitím ověř.

### Pole objektů

V poli může být cokoli: čísla, texty, i další pole. V praxi nejčastěji potkáš
[[pole objektů]] — každý objekt je jeden záznam se stejnými klíči:

:::live js
```js
const groceries = [
  { name: 'Chleba', price: 45 },
  { name: 'Mléko', price: 24 },
];

console.log(groceries[1].name);
console.log(groceries.length);

groceries.push({ name: 'Jablka', price: 39 });
console.log(groceries.length);
```
:::

`push` přidá položku na konec pole. Zkus přidat ještě jednu a vypiš
`groceries.at(-1).name`. Pak zkus `groceries[3].name` a přečti si hlášku v konzoli.

:::check
Pole `letters` má 26 položek. Jaký index má poslední z nich?

### --expected--

25

### --accept--

letters.length - 1

### --why--

Indexy začínají nulou, takže poslední je o jedna menší než délka: `letters.length - 1`, tady `25`. Stejnou položku vrátí `letters.at(-1)`.

### --see--

js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot
:::

## Proměnná neobsahuje pole, ale odkaz na něj

Tohle je nejdůležitější věc celé lekce. Když napíšeš `const a = [1, 2, 3]`,
v proměnné `a` není samotné pole. Pole leží někde v paměti a proměnná na něj
**ukazuje** — drží odkaz (*reference*). Pole je v tomhle ohledu obyčejný objekt.

Co se tedy stane, když napíšeš `const b = a` a pak přidáš položku přes `b`?

:::live js predict
```js
const a = [1, 2, 3];
const b = a;

b.push(4);

console.log(a.length);
```
--question-- Co vypíše `console.log(a.length)`?
--expected-- 4
--why-- `const b = a` nevytvoří druhé pole, jen zkopíruje odkaz. `a` i `b` ukazují na totéž pole, takže `push` přes `b` je vidět i přes `a`. Zkus na konec přidat `console.log(a === b)`.
:::

> [!REMEMBER]
> **Proměnná neobsahuje pole, ale odkaz na něj.** Přiřazení `b = a` zkopíruje
> odkaz, ne pole. Čísla, texty a `true`/`false` se kopírují celé, pole a objekty
> se sdílejí.

Takhle to vypadá v paměti po každém řádku. Krokuj šipkami a sleduj, kam vede šipka z `b`:

:::memory
```js
const a = [1, 2, 3];
const b = a;
b.push(4);
```
--step-- 1 | vznikne pole a proměnná a na něj ukazuje
a -> @arr
@arr: [1, 2, 3]
--step-- 2 | b = a zkopíruje odkaz, ne pole
a -> @arr
b -> @arr
@arr: [1, 2, 3]
--step-- 3 | push mění jediné pole, na které ukazují obě proměnné
a -> @arr
b -> @arr
@arr: [1, 2, 3, 4]
:::

S čísly to tak není: `let x = 1; let y = x; y = 2;` nechá `x` na jedničce, protože
`y` dostalo kopii čísla, ne odkaz.

:::check
Funkce dostane pole a přidá do něj položku. Změní se pole, které jsi jí předal?

```js
function addTag(tags) {
  tags.push('akce');
}

const productTags = ['nové'];
addTag(productTags);
```

### --answer--

Ne, funkce pracuje s vlastní kopií pole.

#### --why--

Parametr `tags` nedostal kopii pole, ale kopii odkazu — stejně jako `b = a`. Kopii by musela funkce vytvořit sama.

### --correct--

Ano, `productTags` bude mít dvě položky.

#### --why--

Parametr `tags` ukazuje na totéž pole jako `productTags`. `push` mění to jediné pole.

### --answer--

Ne, protože `productTags` je `const`.

#### --why--

`const` nezakazuje měnit obsah pole, jen přiřadit do proměnné jinou hodnotu.

### --see--

js-pole/co-je-pole#promenna-neobsahuje-pole-ale-odkaz-na-nej
:::

:::explain
Vysvětli vlastními slovy, proč `b.push(4)` změnilo i pole `a`, ale `y = 2` nezmění číslo v `x`.

## --model--

Proměnná s polem neobsahuje samotné pole, ale odkaz na místo v paměti, kde pole leží. `const b = a` zkopíruje jen tenhle odkaz, takže `a` i `b` ukazují na jedno pole a `push` ho mění pro obě jména. Čísla se naopak kopírují celá: `y` dostane vlastní jedničku a přiřazení `y = 2` se `x` netýká. Když chci opravdu druhé pole, musím ho vytvořit, třeba `[...a]`.

## --checklist--

- Proměnná s polem drží odkaz, ne celé pole.
- Přiřazení `b = a` zkopíruje odkaz, takže obě proměnné ukazují na totéž pole.
- Čísla, texty a `true`/`false` se při přiřazení kopírují celé.
- Nové pole vznikne jen tehdy, když ho vytvořím, třeba `[...a]`.
:::

### Porovnání dvou polí

Ze stejného důvodu `===` u polí neporovnává obsah. Ptá se „je to totéž pole?"

:::live js predict
```js
const first = [1, 2];
const second = [1, 2];

console.log(first === second);
```
--question-- Co vypíše `console.log(first === second)`?
--expected-- false
--why-- Každé `[ ]` vytvoří nové pole. `first` a `second` mají stejný obsah, ale ukazují na dvě různá pole, a `===` porovnává odkazy. Zkus napsat `const second = first;` a sleduj, co se změní.
:::

Když potřebuješ porovnat obsah, musíš porovnat položky jednu po druhé — `===` to
za tebe neudělá.

### Kopie pole

Když chceš opravdu nové pole, musíš ho vytvořit. Nejčastěji rozprostřením
(*spread*): `[...a]`. Tři tečky „vysypou" všechny položky `a` do nových
hranatých závorek, a ty jsou nové pole.

:::live js
```js
const original = ['chleba', 'mléko'];
const copy = [...original];

copy.push('jablka');

console.log(original);
console.log(copy);
console.log(original === copy);
```
:::

Zkus místo `[...original]` napsat jen `original` a sleduj, co se stane s prvním
výpisem. Stejně jako spread funguje i `original.slice()`.

### Mělká kopie

`[...a]` je [[mělká kopie pole|mělká kopie]] (*shallow copy*). Nové je jen pole — co s objekty uvnitř?

:::live js predict
```js
const cart = [{ name: 'Chleba', quantity: 1 }];
const copy = [...cart];

copy[0].quantity = 5;

console.log(cart[0].quantity);
```
--question-- Co vypíše `console.log(cart[0].quantity)`?
--expected-- 5
--why-- Spread zkopíroval pole, ale do nového pole dal tytéž odkazy na objekty. `copy[0]` a `cart[0]` jsou jeden objekt, takže změna přes kopii je vidět i v originálu.
:::

:::memory
```js
const cart = [{ name: 'Chleba', quantity: 1 }];
const copy = [...cart];
copy[0].quantity = 5;
```
--step-- 1
cart -> @cart
@cart: [@bread]
@bread: { name: 'Chleba', quantity: 1 }
--step-- 2 | nové pole, ale tentýž objekt uvnitř
cart -> @cart
copy -> @copy
@cart: [@bread]
@copy: [@bread]
@bread: { name: 'Chleba', quantity: 1 }
--step-- 3 | změna přes kopii mění sdílený objekt
cart -> @cart
copy -> @copy
@cart: [@bread]
@copy: [@bread]
@bread: { name: 'Chleba', quantity: 5 }
:::

Zkus v ukázce předpovědi místo `copy[0].quantity = 5` napsat
`copy[0] = { ...copy[0], quantity: 5 }` a sleduj, jestli se změní i `cart`.
Nezmění — tentokrát jsi do kopie vložil **nový** objekt, místo abys měnil ten
sdílený. Přesně takhle se mění jedna položka bez zásahu do původních dat; ve
workshopu to budeš psát.

:::check
Napiš výraz, který vytvoří mělkou kopii pole `scores`.

### --expected--

[...scores]

### --accept--

scores.slice()
Array.from(scores)
scores.slice(0)

### --why--

`[...scores]` vysype položky do nového pole. Stejně fungují `scores.slice()` a `Array.from(scores)`. Objekty uvnitř kopie zůstávají sdílené.

### --see--

js-pole/co-je-pole#kopie-pole
:::

## Proč jde měnit pole v `const`

`const` neznamená „tahle hodnota je neměnná". Znamená „tahle **proměnná** bude
navždy ukazovat na totéž". Pole samo zůstává změnitelné — můžeš do něj přidávat,
mazat, přepisovat položky. Nesmíš jen do proměnné přiřadit jiné pole.

:::live js
```js
const tags = ['nové'];

tags.push('sleva');
tags[0] = 'akce';
console.log(tags);

try {
  tags = ['jiné pole'];
} catch (error) {
  console.log('Chyba:', error.message);
}
```
:::

Zkus změnit `const` na `let` a sleduj, jestli chyba zmizí. Hláška, kterou uvidíš
u `const`, zní celá `TypeError: Assignment to constant variable.`

> [!REMEMBER]
> **`const` hlídá proměnnou, ne obsah pole.** `push`, `tags[0] = …` i `sort`
> projdou, chybu vyhodí jen nové přiřazení `tags = …`.

Pravidlo pro praxi: pole i objekty zakládej přes `const`. `let` použij jen tehdy,
když do proměnné opravdu přiřazuješ novou hodnotu (třeba průběžný součet).

:::check
Pole je v `const scores = [3, 1, 2]`. Který řádek vyhodí chybu?

### --answer--

`scores.push(4);`

#### --why--

`push` mění obsah pole. Proměnná pořád ukazuje na totéž pole, takže `const` nic neporušuje.

### --answer--

`scores[0] = 10;`

#### --why--

Přepsání položky je změna obsahu, ne nové přiřazení do proměnné.

### --correct--

`scores = [];`

#### --why--

Tady se do proměnné přiřazuje nové pole, a právě to `const` zakazuje: `TypeError: Assignment to constant variable.`

### --answer--

`scores.length = 0;`

#### --why--

Zápis do `length` pole vyprázdní — mění ale obsah pole, ne proměnnou. Chybu nevyhodí.

### --see--

js-pole/co-je-pole#proc-jde-menit-pole-v-const
:::

## Metody, které pole mění, a metody, které vracejí nové

Pole má desítky metod. Než se je začneš učit jednotlivě, rozděl si je do dvou
skupin, protože na tom záleží víc než na jejich jménech. Metodě z levého sloupce
říkáme [[mutující metoda]], metodě z pravého [[nemutující metoda]]:

| mění původní pole (*mutují*) | vracejí nové pole nebo hodnotu, původní nechají být |
|---|---|
| `push`, `pop` (přidá / odebere na konci) | `slice` (výřez), `concat`, `[...a, x]` |
| `unshift`, `shift` (přidá / odebere na začátku) | `map`, `filter`, `reduce` |
| `splice` (vyřízne nebo vloží uprostřed) | `toSpliced` (totéž co `splice`, ale do kopie) |
| `sort`, `reverse` | `toSorted`, `toReversed` |
| `fill`, `a[i] = x` | `at`, `includes`, `indexOf`, `find`, `some`, `every`, `join` |

Proč na tom záleží? Funkce často dostane pole od někoho jiného — třeba seznam
položek, který se zároveň vykresluje na stránce. Když ho funkce zmutuje, změní
data i tomu, kdo ji zavolal, a chyba se projeví úplně jinde.

### `slice` a `splice`

Nejzrádnější dvojice je ==slice== a ==splice==. Liší se jedním písmenem a oba
dostávají čísla v závorkách:

:::live js predict
```js
const queue = ['Anna', 'Bedřich', 'Cyril', 'Dana'];

const preview = queue.slice(0, 2);
const served = queue.splice(0, 2);

console.log(preview.length, served.length, queue.length);
```
--question-- Co vypíše `console.log`? Napiš tři čísla oddělená mezerou.
--expected-- 2 2 2
--why-- Obě volání vrátila nové pole se dvěma jmény, takže `preview.length` i `served.length` jsou `2`. Rozdíl je v tom, co zbylo: `slice` jen vykopíroval výřez, `splice` dvě jména z `queue` **vyřízl**, a fronta se zkrátila na dvě položky.
:::

Zkus prohodit pořadí řádků se [[slice]] a [[splice]] a sleduj, co pak obsahuje
`preview`. Nemutující dvojče `splice` je `toSpliced` — bere stejné argumenty, ale
vrátí upravenou kopii.

Nové metody `toSorted`, `toReversed`, `toSpliced` a `with` přibyly do jazyka
v roce 2023 právě proto, aby šlo řadit a upravovat bez mutace. Ve starším kódu
místo nich uvidíš `[...a].sort()`.

:::check
Které volání změní původní pole `tags`? Vyber všechna.

### --correct--

`tags.sort()`

#### --why--

`sort` řadí pole na místě a vrací totéž pole.

### --correct--

`tags.reverse()`

#### --why--

`reverse` otočí pořadí přímo v původním poli.

### --answer--

`tags.toSorted()`

#### --why--

`toSorted` vrací seřazenou kopii, původní pole nechá být.

### --answer--

`tags.slice(1)`

#### --why--

`slice` vrací výřez v novém poli. Mutuje až `splice`.

### --answer--

`[...tags, 'akce']`

#### --why--

Spread postaví nové pole, do `tags` nic nepřidá.

### --see--

js-pole/co-je-pole#metody-ktere-pole-meni-a-metody-ktere-vraceji-nove
:::

## Typické chyby a pasti

### `indexOf` v podmínce

[[indexOf]] vrací index nalezené hodnoty, nebo `-1`, když ji nenajde. Co s tím
udělá podmínka?

:::live js predict
```js
const cart = ['chleba', 'mléko'];

if (cart.indexOf('chleba')) {
  console.log('chleba v košíku je');
} else {
  console.log('chleba v košíku není');
}
```
--question-- Co vypíše tenhle kód?
--expected-- chleba v košíku není
--why-- Chleba je na indexu `0` a nula je v podmínce nepravda, takže se spustí `else`. Naopak `-1` (nenalezeno) je pravda. `indexOf` odpovídá „kde", ne „jestli".
:::

> [!PITFALL]
> **`if (list.indexOf(x))` nenajde první položku a „najde" chybějící.** Příznak:
> podmínka selže právě u položky na indexu `0`. Oprava: na otázku ano/ne použij
> `list.includes(x)`, nebo porovnej `list.indexOf(x) !== -1`.

:::check
Oprav podmínku `if (fruits.indexOf('jablko'))` tak, aby platila, kdykoli je jablko v poli — i na prvním místě. Napiš jen výraz do závorek za `if`.

### --expected--

fruits.includes('jablko')

### --accept--

fruits.indexOf('jablko') !== -1
fruits.indexOf('jablko') != -1
fruits.indexOf('jablko') >= 0
fruits.indexOf('jablko') > -1
-1 !== fruits.indexOf('jablko')

### --why--

`includes` odpoví rovnou `true`/`false`. Když už `indexOf` použiješ, porovnávej výsledek s `-1`: index `0` je platný nález.

### --see--

js-pole/co-je-pole#indexof-v-podmince
:::

### `typeof` pole je `'object'`

> [!PITFALL]
> **`typeof []` vrátí `'object'`, ne `'array'`.** Pole je zvláštní druh objektu.
> Podmínka `typeof value === 'array'` proto neplatí nikdy. Oprava je [[Array.isArray]]:
> `Array.isArray(value)`.

### `includes` v poli objektů

> [!PITFALL]
> **`includes` a `indexOf` porovnávají přes `===`.** V poli objektů proto nenajdou
> objekt, který jen „vypadá stejně":
> `[{ id: 1 }].includes({ id: 1 })` je `false`, protože jde o dva různé objekty.
> Oprava: hledej podle podmínky, třeba `items.some((item) => item.id === 1)` —
> metody `find` a `some` napíšeš ve workshopu.

### Mutace pole z parametru

> [!PITFALL]
> **Funkce, která má něco vrátit, zmutuje pole, které dostala.** Příznak: po
> zavolání funkce se změní seznam i na místě, které s ní nesouvisí (přeházené
> pořadí, zmizelé položky). Typicky `items.sort(…)`, `items.splice(…)` nebo
> `items.push(…)` nad parametrem. Oprava: vrať nové pole — `toSorted`,
> `toSpliced`, `[...items, item]`.

:::check
Funkce má vrátit ceny seřazené od nejnižší a nechat původní pole být. Co je na ní špatně?

```js
function cheapestFirst(prices) {
  return prices.sort((a, b) => a - b);
}
```

### --answer--

Nic, `sort` vrací nové seřazené pole.

#### --why--

`sort` vrací totéž pole, které přerovnal na místě. Kdo funkci zavolá, přijde o původní pořadí.

### --correct--

`sort` přerovná pole z parametru, takže se změní i pole volajícího.

#### --why--

Parametr ukazuje na pole volajícího. Oprava je `prices.toSorted((a, b) => a - b)`.

### --answer--

Porovnávací funkce `a - b` řadí sestupně.

#### --why--

`a - b` řadí vzestupně, od nejmenšího. Problém je jinde než ve směru řazení.

### --see--

js-pole/co-je-pole#mutace-pole-z-parametru
:::

## Kde to najdeš v MDN

- [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) — přehled všech metod pole. V postranním panelu jsou seřazené podle abecedy; u každé si přečti část *Return value*.
- [Array.prototype.toSpliced()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced) — nemutující metody a v úvodu odkaz na jejich mutující dvojčata.
- [Spread syntax (...)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) — kopie pole a spojování polí, včetně upozornění, že kopie je mělká.
- [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) — věta o tom, že `const` nezaručuje neměnnost hodnoty, jen proměnné.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function rename(list) {
  const copy = list;
  copy[0] = 'Ema';
  return copy;
}

const names = ['Adam', 'Bára'];
rename(names);
console.log(names[0]);
```

### --expected--

Ema

### --accept--

'Ema'

### --why--

`const copy = list` není kopie, jen další odkaz na pole `names`. Zápis `copy[0] = 'Ema'` proto mění pole volajícího. Kopii by vyrobilo `[...list]`.

### --see--

js-pole/co-je-pole#promenna-neobsahuje-pole-ale-odkaz-na-nej

## --question--

Co vypíše poslední řádek?

```js
function clearCart(list) {
  list = [];
}

const cart = ['chleba', 'mléko'];
clearCart(cart);
console.log(cart.length);
```

### --expected--

2

### --why--

Myslíš si, že funkce košík vyprázdnila? Parametr `list` na začátku ukazuje na totéž pole jako `cart`, ale `list = []` jen **přesměruje parametr** na nové prázdné pole. Pole volajícího se nikdo nedotkl. Mutace (`list.length = 0` nebo `list.splice(0)`) by naopak vyprázdnila i `cart`.

### --see--

js-pole/co-je-pole#promenna-neobsahuje-pole-ale-odkaz-na-nej

## --question--

Funkce dostane pole položek, které se zároveň vykresluje na stránce, a má vrátit jeho první dvě položky. Který zápis je správný?

### --answer--

`return items.splice(0, 2);`

#### --why--

Vrátí správné dvě položky, ale zároveň je z pole `items` vyřízne. Seznam na stránce tím přijde o dvě položky.

### --correct--

`return items.slice(0, 2);`

#### --why--

`slice` vrátí nové pole s výřezem a původní pole nechá být.

### --answer--

`items.length = 2; return items;`

#### --why--

Zápis do `length` zkrátí původní pole. Funkce vrátí správné dvě položky, ale stránka přijde o zbytek seznamu.

### --see--

js-pole/co-je-pole#slice-a-splice

## --question--

Co vypíše poslední řádek?

```js
const shelf = [{ title: 'Babička', read: false }];
const backup = [...shelf];
backup[0].read = true;
console.log(shelf[0].read, shelf === backup);
```

### --expected--

true false

### --why--

`[...shelf]` je mělká kopie: nové pole (`shelf === backup` je `false`), ale se stejným objektem uvnitř. Změna `backup[0].read` je proto vidět i v `shelf[0]`.

### --see--

js-pole/co-je-pole#melka-kopie
