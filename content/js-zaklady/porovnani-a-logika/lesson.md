# Porovnání a logika

:::check pretest
Představ si podmínku `if ('0')`. Je tenhle text pravda, nebo nepravda?

### --expected--

pravda

### --accept--

true
pravda, spustí se

### --why--

Text obsahující nulu není to samé co číslo `0`. Jen prázdný text je nepravda. Jaká pravidla JavaScript při rozhodování používá, uvidíš hned v první části.
:::

## Kdy je něco pravda

V JavaScriptu nemusí být v podmínce jen `true` nebo `false`. Jakákoliv hodnota se dá převést na logickou pravdu ([[truthy]]) nebo nepravdu ([[falsy]]). Hodnot, které se vyhodnotí jako nepravda, je přesně sedm:

- `0` a `0n` (číslo nula)
- `''` nebo `""` (prázdný text)
- `null`
- `undefined`
- `NaN` (Not a Number)
- `false`

Všechno ostatní je pravda — i text `'0'`, prázdné pole `[]` nebo prázdný objekt `{}`.

:::check
Která z těchto hodnot se v podmínce chová jako nepravda?

### --answer--

`'false'`

#### --why--

Je to neprázdný text, takže je truthy.

### --answer--

`[]`

#### --why--

Pole, i prázdné, je vždy truthy.

### --correct--

`undefined`

#### --why--

`undefined` je jedna ze sedmi falsy hodnot.

### --answer--

`-1`

#### --why--

Číslo -1 je truthy. Falsy je jen nula a NaN.
:::

## Porovnávání hodnot

Pro porovnání dvou hodnot se používají operátory `>` (větší), `<` (menší) a jejich varianty s rovná se. Kde ale ostatní jazyky používají `==`, tam má JavaScript dva různé operátory.

:::live js predict
```js
console.log('' == 0);
```
--question-- Co vypíše `console.log`?
--expected-- true
--why-- Operátor `==` zkusí před porovnáním sjednotit typy. Prázdný text se převede na nulu, takže porovnává `0` a `0`. Je to sice pravda, ale většinou spíš chyba programu.
:::

Proto v JavaScriptu téměř vždy používáme **přísnou rovnost** `===` (tři rovnítka) a nerovnost `!==`. Přísná rovnost nezkouší nic převádět: pokud se liší typy, vrátí hned `false`.

> [!REMEMBER]
> **Vždy používej `===` a `!==`.** Volná rovnost `==` je plná výjimek a dělá kód nepředvídatelným. Pokud chceš porovnat čísla, musíš se ujistit, že obě hodnoty opravdu čísla jsou.

:::check
Co vrátí výraz `5 === '5'`?

### --expected--

false

### --why--

Přísná rovnost neprovádí žádné převody typů. Číslo a text jsou různé typy, takže nejsou stejné. Kdybys použil `==`, vyšlo by `true`.
:::

## Podmínky a větvení

Kód často potřebuje udělat rozhodnutí. Konstrukce `if` provede blok kódu jen tehdy, když je podmínka pravdivá (truthy). Pomocí `else if` a `else` přidáš další varianty.

:::live js
```js
const status = 'error';

if (status === 'ok') {
  console.log('Vše běží.');
} else if (status === 'error') {
  console.log('Něco se pokazilo!');
} else {
  console.log('Neznámý stav.');
}
```
:::

Když potřebuješ jen vrátit jednu ze dvou hodnot podle podmínky, blok s `if` je zbytečně dlouhý. Pomůže **ternární operátor** `? :`:

:::live js
```js
const age = 15;
const ticket = age >= 18 ? 'Dospělý' : 'Dítě';
console.log(ticket);
```
:::

Kód přečteš jako „Když je věk nad 18, vrať 'Dospělý', jinak 'Dítě'". Používej ho pro jednoduchá rozhodnutí na jednom řádku.

:::check
Jaký kód správně zapíše přiřazení do proměnné `status` podle toho, jestli `count` překročil 10, pomocí ternárního operátoru?

### --correct--

`const status = count > 10 ? 'plno' : 'volno';`

### --answer--

`const status = count > 10 : 'plno' ? 'volno';`

#### --why--

Pořadí znaků je podmínka, pak otazník, co když pravda, dvojtečka a co když nepravda.

### --answer--

`const status = if (count > 10) 'plno' else 'volno';`

#### --why--

Příkaz `if` nevrací hodnotu, takže ho nemůžeš přiřadit do proměnné.
:::

## Logické operátory nevracejí boolean

Operátory `&&` (a zároveň) a `||` (nebo) se chovají jinak než ve většině jazyků. Nevracejí totiž vždy `true` nebo `false`.

:::live js predict
```js
console.log(0 || 5);
```
--question-- Co vypíše kód?
--expected-- 5
--why-- `||` zkoumá operandy zleva. Když najde truthy hodnotu, rovnou ji vrátí. Protože nula je falsy, pokračuje dál a vrátí pětku.
:::

Operátor `&&` naopak vrátí první falsy hodnotu, kterou najde. Teprve když jsou všechny truthy, vrátí tu poslední.

:::check
Co je výsledkem výrazu `'Ahoj' && 'Světe'`?

### --expected--

Světe

### --accept--

'Světe'
"Světe"

### --why--

Operátor `&&` projde obě truthy hodnoty a vrátí tu poslední.
:::

## Chybějící hodnoty

Často se hodí použít výchozí hodnotu, když nějaká chybí. Operátor `||` se k tomu dřív používal, ale má zrádnou vlastnost.

:::live js predict
```js
console.log(0 ?? 5);
```
--question-- Co vypíše kód?
--expected-- 0
--why-- Operátor `??` kontroluje jen to, jestli není hodnota `null` nebo `undefined`. Nula je sice falsy, ale je to platná hodnota, takže ji zachová. Operátor `||` by vrátil pětku.
:::

Operátor `??` (*nullish coalescing*) je pro výchozí hodnoty bezpečnější, protože nezničí platnou nulu nebo prázdný text.

Další užitečná zkratka je *optional chaining* `?.`. Místo zjišťování, jestli objekt vůbec existuje, než přečteš jeho vlastnost, můžeš použít otazník s tečkou.

:::live js
```js
const user = { name: 'Ema' };
console.log(user.address?.city);
```
:::

Kdybychom napsali `user.address.city`, kód by spadl s chybou. Zápis `?.` pád zastaví a vrátí `undefined`.

:::check
Který zápis nastaví výchozí slevu `10`, pokud `discount` v objektu `promo` chybí (je `undefined`), ale povolí slevu `0`?

### --correct--

`const rate = promo.discount ?? 10;`

#### --why--

`??` reaguje jen na `null` nebo `undefined`. Pokud je hodnota `0`, vrátí se `0`.

### --answer--

`const rate = promo.discount || 10;`

#### --why--

`||` reaguje na všechny falsy hodnoty. Kdyby byla sleva `0`, vrátila by se `10`, což pokazí logiku.
:::

## Přepínač switch

Když porovnáváš jednu proměnnou proti mnoha různým hodnotám, můžeš místo dlouhého řetězce `else if` použít `switch`. Porovnává přísně přes `===`.

Každý případ (`case`) určuje bod, od kterého kód pokračuje dál, dokud nenarazí na příkaz `break`. Ten z bloku vyskočí.

:::live js predict
```js
const mode = 'dark';

switch (mode) {
  case 'dark':
    console.log('Tmavý');
  case 'light':
    console.log('Světlý');
    break;
  default:
    console.log('Systémový');
}
```
--question-- Co přesně tenhle kód vypíše do konzole?
--expected-- Tmavý
Světlý
--why-- Skok padne na `'dark'`, vypíše `'Tmavý'`, a protože chybí `break`, kód pokračuje (fall-through) a vypíše i `'Světlý'`. Teprve tam se zastaví.
:::

Na nezamýšlený propad (*fall-through*) narazíš snadno. Dnes se místo `switch` často používají objekty fungující jako slovník, ke kterým se dostaneme později.

:::check
Co označuje blok `default` v příkazu `switch`?

### --expected--

Co se má stát, když žádný case nevyhovuje.

### --accept--

Kód, který se provede, když se nenašla žádná shoda.
výchozí chování
výchozí možnost

### --why--

Je to záchytná síť na konci, obdoba posledního `else` u podmínek. Provádí se, když proměnná s žádným `case` nesouhlasí.
:::

## Typické chyby a pasti

### Záměna rovná se

> [!PITFALL]
> **Zápis `if (a = b)` je přiřazení, ne porovnání.** Kód nenahlásí chybu, ale hodnotu přepíše a podmínka se vyhodnotí podle nové hodnoty. Příznak: kód se chová nevyzpytatelně a proměnná má jinou hodnotu. Oprava: použij přísnou rovnost `===`.

### Logický operátor v UI

> [!PITFALL]
> **Když používáš `&&` k vykreslení něčeho, nula se projeví na stránce.** Příznak: na obrazovce se zjeví `0` místo prázdna. Důvod: u košíku `cart.length && <Ikona />` je pro délku 0 první operand `0`. Protože `0` je falsy, výraz rovnou vrátí `0` a to se vykreslí. Oprava: porovnávej explicitně přes `cart.length > 0 && <Ikona />`.

## Kde to najdeš v MDN

- [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) — kompletní seznam všech sedmi nepravdivých hodnot.
- [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) — rozdíl mezi `==` a `===`.
- [Nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — ukázky použití operátoru `??`.

# --questions--

## --question--

Jaký bude výsledek výrazu `"" || "Uživatel"`?

### --expected--

Uživatel

### --accept--

"Uživatel"
'Uživatel'

### --why--

Prázdný text `""` je falsy hodnota. Operátor `||` tedy bude pokračovat dál a vrátí druhou stranu, což je `"Uživatel"`.

### --see--

js-zaklady/porovnani-a-logika#logicke-operatory-nevraceji-boolean

## --question--

Je nějaký rozdíl v tom, co do proměnné uloží `const user = person || {}` a `const user = person ?? {}`?

### --answer--

Ne, oba výrazy dělají to samé za všech okolností.

#### --why--

Dělají něco hodně podobného, ale v některých okrajových situacích se chovají odlišně.

### --correct--

Ano, pokud je `person` například prázdný text nebo nula.

#### --why--

Pokud je `person` falsy, ale existuje (nula nebo prázdný text), `||` vrátí pravou stranu `{}`, ale `??` ho zachová a vrátí jeho hodnotu.

### --see--

js-zaklady/porovnani-a-logika#chybejici-hodnoty

## --question--

Představ si, že proměnná `config` buď obsahuje podřízený objekt `api` s vlastností `url`, nebo neobsahuje. Jak bezpečně a nejkratším způsobem přečteš `url` bez rizika, že ti kód spadne na undefined?

### --expected--

config.api?.url

### --accept--

config?.api?.url

### --why--

Operátor `?.` zastaví prohledávání vlastností objektu, pokud narazí na `null` nebo `undefined`. Výsledkem bude bezpečně `undefined` místo vyhozené výjimky.

### --see--

js-zaklady/porovnani-a-logika#chybejici-hodnoty
