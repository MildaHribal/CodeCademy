# Co je pole

Představ si nákupní seznam uložený do proměnných:

```js
const item1 = 'chleba';
const item2 = 'mléko';
const item3 = 'jablka';
```

Dokud jsou položky tři, jde to. Ale jak zjistíš, kolik jich je? Jak je vypíšeš
všechny najednou? A co když uživatel přidá čtvrtou — založíš za běhu proměnnou
`item4`? Nejde to. Potřebuješ **jednu** hodnotu, ve které je celý seznam, ať je
dlouhý jakkoli. To je **pole** (*array*).

## Pole je očíslovaný seznam hodnot

Pole zapíšeš do hranatých závorek, položky oddělíš čárkou. Každá položka má
pořadové číslo — **index** — a počítá se **od nuly**. Počet položek je ve
vlastnosti `length`.

:::live js
```js
const shopping = ['chleba', 'mléko', 'jablka'];

console.log(shopping[0]);       // první položka
console.log(shopping[2]);       // třetí položka
console.log(shopping.length);   // počet položek
console.log(shopping[5]);       // index, který neexistuje
```
:::

Zkus změnit `shopping[5]` na `shopping[shopping.length - 1]` a sleduj, co se
vypíše. Poslední položka má vždycky index `length - 1`, protože se počítá od nuly.
Kratší zápis je `shopping.at(-1)` — záporný index u `at` počítá od konce.

Všimni si, že `shopping[5]` **nespadne**. Vrátí `undefined`, stejně jako
neexistující klíč objektu. Chyba se proto neprojeví tam, kde vznikla, ale až o kus
dál, když s tím `undefined` zkusíš něco dělat.

V poli může být cokoli: čísla, texty, i další pole. V praxi nejčastěji potkáš
**pole objektů** — každý objekt je jeden záznam se stejnými klíči:

:::live js
```js
const groceries = [
  { name: 'Chleba', price: 45 },
  { name: 'Mléko', price: 24 },
];

console.log(groceries[1].name);   // Mléko
console.log(groceries.length);    // 2

groceries.push({ name: 'Jablka', price: 39 });
console.log(groceries.length);    // 3
```
:::

`push` přidá položku na konec pole. Zkus přidat ještě jednu a vypiš
`groceries.at(-1).name`.

## Proměnná neobsahuje pole, ale odkaz na něj

Tohle je nejdůležitější věc celé lekce. Když napíšeš `const a = [1, 2, 3]`,
v proměnné `a` není samotné pole. Pole leží někde v paměti a proměnná na něj
**ukazuje** — drží **odkaz** (*reference*).

Když pak napíšeš `const b = a`, nevznikne druhé pole. Vznikne druhý odkaz na
**totéž** pole:

:::live js
```js
const a = [1, 2, 3];
const b = a;

b.push(4);

console.log(a);        // [1, 2, 3, 4] — změnilo se i a
console.log(a === b);  // true — je to jedno a totéž pole
```
:::

S čísly a texty to tak není: `let x = 1; let y = x; y = 2;` nechá `x` na jedničce.
Čísla, texty a `true`/`false` se kopírují, **pole a objekty se sdílejí**.

Ze stejného důvodu `===` u polí neporovnává obsah, ale ptá se „je to totéž pole?"

:::live js
```js
console.log([1, 2] === [1, 2]);   // false — dvě různá pole se stejným obsahem

const a = [1, 2];
const b = a;
console.log(a === b);              // true — dva odkazy na totéž pole
```
:::

### Kopie pole

Když chceš opravdu nové pole, musíš ho vytvořit. Nejčastěji rozprostřením
(*spread*): `[...a]`. Tři tečky „vysypou" všechny položky `a` do nových
hranatých závorek, a ty jsou nové pole.

:::live js
```js
const original = ['chleba', 'mléko'];
const copy = [...original];

copy.push('jablka');

console.log(original);            // ['chleba', 'mléko'] — nedotčený
console.log(copy);                // ['chleba', 'mléko', 'jablka']
console.log(original === copy);   // false
```
:::

Pozor: `[...a]` je **mělká kopie** (*shallow copy*). Nové je jen pole, ne objekty
v něm. Obě pole ukazují na tytéž objekty:

:::live js
```js
const cart = [{ name: 'Chleba', quantity: 1 }];
const copy = [...cart];

copy[0].quantity = 5;

console.log(cart[0].quantity);    // 5 — objekt je sdílený
console.log(cart === copy);       // false — pole jsou dvě
```
:::

Zkus místo `copy[0].quantity = 5` napsat `copy[0] = { name: 'Chleba', quantity: 5 }`
a sleduj, jestli se změní i `cart`. Nezmění — tentokrát jsi do kopie vložil
**nový** objekt, místo abys měnil ten sdílený. Přesně takhle se to dělá, když
chceš změnit jednu položku a původní data nechat být; ve workshopu to budeš psát.

## Proč jde měnit pole v `const`

`const` neznamená „tahle hodnota je neměnná". Znamená „tahle **proměnná** bude
navždy ukazovat na totéž". Pole samo zůstává změnitelné — můžeš do něj přidávat,
mazat, přepisovat položky. Nesmíš jen do proměnné přiřadit jiné pole.

:::live js
```js
const tags = ['nové'];

tags.push('sleva');     // v pořádku — mění se obsah pole
tags[0] = 'akce';       // v pořádku — taky obsah
console.log(tags);

try {
  tags = ['jiné pole']; // chyba — proměnná má ukazovat jinam
} catch (error) {
  console.log('Chyba:', error.message);
}
```
:::

Pravidlo pro praxi: pole i objekty zakládej přes `const`. `let` použij jen tehdy,
když do proměnné opravdu přiřazuješ novou hodnotu (třeba průběžný součet).

## Metody, které pole mění, a metody, které vracejí nové

Pole má desítky metod. Než se je začneš učit jednotlivě, rozděl si je do dvou
skupin, protože na tom záleží víc než na jejich jménech:

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

Nejzrádnější dvojice je `slice` a `splice`. Liší se jedním písmenem:

:::live js
```js
const queue = ['Anna', 'Bedřich', 'Cyril', 'Dana'];

const preview = queue.slice(0, 2);
console.log(preview, queue);     // queue je pořád celá

const served = queue.splice(0, 2);
console.log(served, queue);      // queue přišla o dvě položky
```
:::

Obě volání vrátila totéž. Rozdíl je v tom, co po nich zbylo. Zkus prohodit pořadí
obou bloků a sleduj, jak se změní výsledek `slice`.

Nové metody `toSorted`, `toReversed`, `toSpliced` a `with` přibyly do jazyka
v roce 2023 právě proto, aby šlo řadit a upravovat bez mutace. Ve starším kódu
místo nich uvidíš `[...a].sort()`.

## Pasti

**`indexOf` v podmínce.** `indexOf` vrací index nalezené hodnoty, nebo `-1`.
První položka má index `0`, a nula je v podmínce nepravda:

:::live js
```js
const cart = ['chleba', 'mléko'];

if (cart.indexOf('chleba')) {
  console.log('chleba v košíku je');
} else {
  console.log('chleba v košíku není');   // vypíše se tohle, i když tam je
}

console.log(cart.includes('chleba'));   // true — na otázku ano/ne je includes
```
:::

**`typeof` pole je `'object'`.** Pole je zvláštní druh objektu, takže
`typeof []` vrátí `'object'`. Když potřebuješ zjistit, jestli je hodnota pole,
použij `Array.isArray(value)`.

**`includes` a `indexOf` porovnávají přes `===`.** Na pole textů a čísel jsou
ideální. V poli objektů ale nenajdou objekt, který „vypadá stejně" — hledají
tentýž objekt. Hledat podle podmínky (třeba podle `id`) se naučíš ve workshopu
metodami `find` a `some`.

**Mutace uvnitř funkce.** Funkce, která má z pole jen něco vyčíst nebo vrátit
upravenou verzi, nesmí volat `push`, `splice` ani `sort` na poli z parametru.
Vytvoř si nové pole a vrať ho.

# --questions--

## --question--

Co vypíše tento kód?

```js
const original = [1, 2, 3];
const other = original;
other.push(4);
console.log(original.length);
```

### --answer--

`3`

#### --why--

`other` není kopie. `const other = original` zkopíruje jen odkaz, obě proměnné ukazují na totéž pole, takže `push` přes `other` změní i `original`.

### --correct--

`4`

#### --why--

Obě proměnné ukazují na jedno pole. Přidání přes kteroukoli z nich je vidět přes obě.

### --answer--

Chybu, protože `original` je `const`.

#### --why--

`const` zakazuje jen přiřadit do proměnné jinou hodnotu. Obsah pole měnit smíš.

## --question--

Proč tenhle kód nevyhodí chybu, přestože `tags` je `const`?

```js
const tags = ['nové'];
tags.push('sleva');
```

### --correct--

`const` hlídá, aby proměnná pořád ukazovala na totéž pole. `push` mění obsah pole, ne to, kam proměnná ukazuje.

#### --why--

Přesně tak. Chybu by vyhodilo až `tags = [...]`.

### --answer--

Protože `push` vytvoří nové pole a to se do `tags` uloží.

#### --why--

`push` žádné nové pole nevytváří, mění to stávající a vrací novou délku.

### --answer--

Protože pole v `const` se dá měnit jen do první chyby.

#### --why--

Žádné takové pravidlo neexistuje. `const` se týká proměnné, ne obsahu pole.

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

Zápis do `length` pole zkrátí — to původní. Funkce vrátí správné dvě položky, ale stránka o zbytek seznamu přijde.

## --question--

Co vypíše tento kód?

```js
const cart = [{ name: 'Chleba', quantity: 1 }];
const copy = [...cart];
copy[0].quantity = 3;
console.log(cart[0].quantity);
```

### --answer--

`1`, protože `copy` je kopie.

#### --why--

Kopie je jen pole. Objekt uvnitř je v obou polích tentýž, takže změna přes `copy[0]` je vidět i v `cart[0]`.

### --correct--

`3`

#### --why--

`[...cart]` je mělká kopie: nové pole se stejnými odkazy na objekty.

### --answer--

`undefined`

#### --why--

Položka `cart[0]` existuje a má klíč `quantity`, takže `undefined` to být nemůže.
