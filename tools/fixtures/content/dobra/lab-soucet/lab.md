# --description--

Napiš funkci `soucet(ceny)`, která vrátí součet čísel v poli.

# --hints--

Funkce `soucet` existuje.

```js
assert.equal(typeof soucet, 'function');
```

`soucet([1, 2, 3])` vrátí `6`.

```js
assert.equal(soucet([1, 2, 3]), 6);
```

# --seed--

## --file-- script.js

```js
--edit--
function soucet(ceny) {
}
--edit--
```

# --solution--

## --file-- script.js

```js
function soucet(ceny) {
  let celkem = 0;
  for (const cena of ceny) celkem += cena;
  return celkem;
}
```
