# Cykly

:::check pretest
Představ si cyklus, který opakuje kód pro každé písmeno ve slově "Ahoj". Kolikrát celkem se blok kódu spustí?

### --expected--

4

### --accept--

čtyřikrát

### --why--

Slovo má 4 písmena, takže se kód otočí přesně čtyřikrát. Tomuhle opakování se říká cyklus nebo smyčka.
:::

Když chceš vypsat pět uživatelů, můžeš pětkrát napsat `console.log`. Ale když jich chceš vypsat tisíc, tak to nejde. K počítačům se programy píšou právě proto, aby za nás dělaly otravnou opakující se práci. Způsobu, jak donutit program kousek kódu opakovat, se říká cyklus (*loop*).

> [!REMEMBER]
> **Cyklus spouští stejný kód dokola, dokud platí nějaká podmínka.** Aby ses v cyklu neztratil, pamatuj si, že se pokaždé spustí ten samý kus kódu, jen proměnné se mění.

## Cyklus `for`

Nejčastější cyklus v JavaScriptu je `for`. Používá se, když předem víš, kolikrát chceš kód zopakovat. 

Cyklus má tři části v závorce, oddělené středníky:
1. **Začátek:** co se stane před prvním během (založení počítadla `let i = 0`).
2. **Podmínka:** dokud tohle platí, cyklus poběží dál (`i < 3`). Přečte se před každým krokem.
3. **Krok:** co se stane po každém kole (`i++` znamená zvětši `i` o jedna).

:::memory
```js
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```
--step-- 1 | Před smyčkou (založení i)
i = 0
--step-- 2 | První průchod
i = 1
--step-- 3 | Druhý průchod
i = 2
:::

Zkus odhadnout, co se vypíše v následujícím kódu:

:::live js predict
```js
for (let i = 1; i <= 3; i++) {
  console.log('Kolo ' + i);
}
```
--question-- Co vypíše tento kód?
--expected--
Kolo 1
Kolo 2
Kolo 3
--why-- Začíná na jedničce (`i = 1`) a končí, když podmínka (`i <= 3`) přestane platit. Vypíše to postupně pro `1`, `2` i `3`.
:::

> [!PITFALL]
> **Off-by-one errors (chyby o jedničku).** Dávat pozor, jestli napsat `<` nebo `<=`, je nejčastější úkol při psaní `for` cyklů. Když počítáš od `0` a chceš `3` průchody, píšeš `< 3`. Když počítáš od `1`, obvykle používáš `<=`. Pokud se spleteš, cyklus udělá o jeden krok víc nebo míň.

:::check
Jaká hodnota bude uložena v proměnné `i` ve chvíli, kdy cyklus `for (let i = 0; i < 5; i++)` definitivně skončí a program pokračuje dál?

### --expected--

5

### --why--

Poslední platný krok je pro `i = 4`. Po něm se `i` zvýší na `5`, zkontroluje se podmínka `5 < 5`, zjistí se, že neplatí, a cyklus končí. Kód pod cyklem by tedy (kdyby tam bylo `i` vidět) našel hodnotu 5.
:::

## Nekonečný cyklus a `while`

Druhý typ cyklu je `while` (dokud). Nemá počítadlo, má jen podmínku. Cyklus běží, dokud je podmínka v závorce pravdivá. Používá se tam, kde nevíš předem, kdy přesně skončíš — například když taháš další a další data, dokud nějaká jsou.

:::live js
```js
let count = 3;
while (count > 0) {
  console.log('Odpočet:', count);
  count = count - 1;
}
console.log('Start!');
```
:::

Co by se stalo, kdybych v předchozím kódu smazal řádek `count = count - 1`? Podmínka `count > 0` by byla pravdivá navždy. Vznikne **nekonečný cyklus**. Program se zasekne, prohlížeč zmrzne a větrák se roztočí. 

> [!PITFALL]
> **Nekonečný cyklus zasekne záložku.** Vždycky se ujisti, že něco v těle cyklu postupně mění podmínku tak, aby se jednou vyhodnotila jako `false`. U `for` na to slouží ta třetí část (`i++`), u `while` si to musíš napsat sám dovnitř.

:::check
Co chybí v tomto cyklu, aby nezmrznul prohlížeč?

```js
let n = 0;
while (n < 10) {
  console.log(n);
}
```

### --expected--

n++

### --accept--

n = n + 1
zvýšení n
n += 1

### --why--

V těle cyklu chybí cokoli, co by měnilo proměnnou `n`. Zůstane pořád na `0`, `0 < 10` je vždy `true` a cyklus poběží do nekonečna. Kód by měl mít uvnitř `n++`.
:::

## Cyklus `for...of` na texty a pole

Když chceš projít všechny položky pole nebo všechna písmena v textu, psát kvůli tomu číselné počítadlo `i` a řešit indexy, to je otrava a zdroj chyb. Proto JavaScript zavedl cyklus `for...of`. 

:::live js
```js
const word = 'Ahoj';

for (const letter of word) {
  console.log('Písmeno:', letter);
}
```
:::

Cyklus `for...of` se sám postará o všechno za oponou: vezme první písmeno, strčí ho do konstanty `letter` a provede tělo. Pak vezme druhé písmeno, a tak dále, dokud neprojde slovo celé. Později uvidíš, že přesně tohle dělá i s poli (`for (const item of cart)`). Proměnná se jmenuje jak chceš, ale konvence je volit jednotné číslo k proměnné, přes kterou procházíš.

:::check
Jakou hodnotu bude mít konstanta `char` v prvním průchodu cyklem `for (const char of 'PES')`?

### --expected--

P

### --accept--

'P'
"P"

### --why--

`for...of` prochází řetězec znak po znaku. V prvním kroku vezme první znak zleva, což je `'P'`.
:::

## Přerušení: `break` a `continue`

Občas potřebuješ cyklus zastavit dřív, než dojde na konec, nebo přeskočit aktuální položku.

- **`break`**: úplně ukončí cyklus, jako by podmínka přestala platit. Program pokračuje pod ním.
- **`continue`**: zahodí zbytek aktuálního průchodu a skočí rovnou na další (zpátky na hodnocení podmínky a inkrement počítadla).

:::live js predict
```js
for (let i = 1; i <= 5; i++) {
  if (i === 3) {
    continue;
  }
  console.log(i);
}
```
--question-- Co vypíše tento kód?
--expected--
1
2
4
5
--why-- Když je `i` přesně 3, podmínka `if` platí, spustí se `continue`. To zastaví zbytek těla cyklu (tedy `console.log`) a rovnou pošle cyklus do dalšího kola s `i = 4`. Číslo 3 se proto nevypíše.
:::

## Kde to najdeš v MDN

- [for statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for) — popis starého dobrého `for` s počítadlem.
- [while statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while) — jak funguje `while` cyklus.
- [for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) — procházení polí a řetězců (to nejpohodlnější z cyklů).

# --questions--

## --question--

Kolikrát se vypíše pozdrav v tomto kódu?

```js
let count = 5;
while (count < 3) {
  console.log('Ahoj');
  count++;
}
```

### --expected--

0

### --accept--

ani jednou
nula
0krát

### --why--

Cyklus `while` se ptá na podmínku vždy **před** začátkem těla. Jelikož hodnota proměnné `count` je už na začátku `5`, podmínka `5 < 3` se vyhodnotí jako `false` a cyklus se vůbec nespustí.

### --see--

js-zaklady/cykly#nekonecny-cyklus-a-while

## --question--

Když už v `for...of` projíždíš text a hledáš konkrétní písmeno, jak cyklus zastavíš hned ve chvíli, kdy ho najdeš, aby zbytečně neprocházel zbytek textu?

### --answer--

Použiju `continue`.

#### --why--

`continue` cyklus nezastaví, jen přeskočí jeden krok a pokračuje dalším znakem.

### --correct--

Použiju `break`.

### --answer--

Změním text na prázdný.

#### --why--

Smyčka nad původním stringem by proběhla dál. Správný příkaz na okamžité ukončení cyklu je `break`.

### --see--

js-zaklady/cykly#preruseni-break-a-continue
