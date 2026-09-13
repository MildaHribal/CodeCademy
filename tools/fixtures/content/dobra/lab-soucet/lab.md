# --description--

Napiš funkci `soucet(ceny)`, která vrátí součet čísel v poli.

# --hints--

Funkce `soucet` existuje.

```js
assert.equal(typeof soucet, 'function', 'soucet má být funkce');
```

`soucet([1, 2, 3])` vrátí `6`.

```js
assert.equal(soucet([1, 2, 3]), 6, 'soucet([1, 2, 3]) má vrátit 6');
```

`soucet([])` vrátí `0`.

```js
assert.equal(soucet([]), 0, 'soucet([]) má vrátit 0');
```

# --help--

## --tip-- 2

Potřebuješ projít všechny prvky pole a průběžně přičítat do proměnné.

# --seed--

## --file-- script.js

```js
/**
 * Sečte ceny v košíku.
 * @param {number[]} ceny
 * @returns {number}
 */
function soucet(ceny) {
--edit--
--edit--
}
```

# --solution--

## --file-- script.js

```js
/**
 * Sečte ceny v košíku.
 * @param {number[]} ceny
 * @returns {number}
 */
function soucet(ceny) {
  let celkem = 0;
  for (const cena of ceny) celkem += cena;
  return celkem;
}
```

# --approaches--

## --approach-- Metoda reduce

Kratší zápis, když znáš `reduce`.

### --file-- script.js

```js
function soucet(ceny) {
  return ceny.reduce((celkem, cena) => celkem + cena, 0);
}
```

## --approach-- Klasický cyklus for

Funguje všude, i ve starém kódu.

### --file-- script.js

```js
function soucet(ceny) {
  let celkem = 0;
  for (let i = 0; i < ceny.length; i++) celkem += ceny[i];
  return celkem;
}
```

# --review--

Testy kontrolují výsledek. Tohle zkontroluj sám.

## --rubric--

- Jméno proměnné říká, co v ní je.
- Prázdné pole vrací nulu bez zvláštní podmínky.
