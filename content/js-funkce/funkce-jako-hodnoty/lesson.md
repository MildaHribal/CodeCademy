# Funkce jako hodnoty

:::check pretest
Jaký je výsledek tohoto kódu? Tipni si, i když nevíš.
```js
function secti(a, b) {
  return a + b;
}
const mojeSecti = secti;
console.log(mojeSecti(2, 3));
```

### --expected--
5

### --why--
`mojeSecti` je jen druhý odkaz na tutéž funkci, funguje tedy úplně stejně.
:::

V JavaScriptu jsou funkce jen další typ hodnoty. Můžeš je ukládat do proměnných, předávat jako argumenty do jiných funkcí a vracet je.

## Funkce v proměnné

Funkci můžeš přiřadit do proměnné úplně stejně jako číslo nebo řetězec.

```js
function pozdrav(jmeno) {
  console.log(`Ahoj ${jmeno}!`);
}

// Přiřazení funkce do proměnné bez volání (bez závorek)
const mojeFunkce = pozdrav;

// Volání přes novou proměnnou
mojeFunkce('Karel'); // Ahoj Karel!
```

## Callback a setTimeout

Když předáš funkci jako argument jiné funkci, říkáme jí **callback**. Funkce, která ji přijímá, ji zavolá.

Prvním příkladem je `setTimeout`. Tato funkce spustí tvou funkci až po uplynutí zadaného času.

```js
function ukazZpravu() {
  console.log('Uplynuly 2 sekundy!');
}

// Předáváme funkci ukazZpravu jako callback
setTimeout(ukazZpravu, 2000);
```

Funkce, které berou jiné funkce jako argument nebo je vrací, se nazývají funkce vyššího řádu (higher-order functions).

:::check
Jaká funkce je v kódu výše callbackem?

### --answer--
`setTimeout`

#### --why--
To je funkce vyššího řádu. Přijímá naši funkci, takže to není callback.

### --correct--
`ukazZpravu`

#### --why--
Ano, `setTimeout` je funkce vyššího řádu, které předáváme náš callback `ukazZpravu`.
:::

## Volání vs. předání

Častou chybou je, že funkci rovnou zavoláš pomocí závorek `()`, místo abys ji pouze předal jako hodnotu.

:::live js predict
```js
function getCislo() {
  console.log('Počítám...');
  return 42;
}

function tiskni(hodnota) {
  console.log('Tisknu:');
  console.log(hodnota);
}

tiskni(getCislo());
```
--question-- Co se vypíše do konzole?
--option-- Nejdřív "Tisknu:", pak "Počítám...", pak 42.
--option*-- Nejdřív "Počítám...", pak "Tisknu:", pak 42.
--option-- Vypíše to kód funkce `getCislo`.
--why-- Protože jsme napsali `getCislo()`, funkce se zavolala hned. Nejdřív vypíše "Počítám...", vrátí `42`, a teprve toto číslo (42) je jako argument předáno do `tiskni`. Kdybychom napsali `tiskni(getCislo)` bez závorek, předali bychom funkci samotnou (vypsal by se její kód).
:::

:::explain
Vysvětli vlastními slovy, co je to callback.

## --model--
Callback je funkce, kterou předáme jako argument jiné funkci. Ta jiná funkce ji pak uvnitř sebe zavolá.

## --checklist--
- Callback je funkce.
- Předává se jako argument do jiné funkce.
- Ta ji později zavolá.
:::

## Kde to najdeš v MDN

- [Callback function](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)
