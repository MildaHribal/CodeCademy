---
title: "Základní aserce"
kind: step
see: nastroje-testovani/proc-testovat#piramida
---
</--description-->
Začneme s jednoduchou testovací asercí. Tvým cílem je napsat první unit test pomocí vestavěného balíčku `node:test`. 

- Otestuj, že funkce `sum(1, 2)` vrátí 3.
- Použij `assert.equal`.
</--description-->
<--hints-->
Nezapomeň přidat smysluplnou chybovou hlášku v češtině jako třetí parametr pro `assert.equal`.
```js
assert.equal(sum([1, 2]), 3, 'sum([1, 2]) má vrátit 3');
```
</--hints-->
<--help-->
## --tip--
Importuj `test` z `node:test` a `assert` z `node:assert`.
## --tip--
Napiš to takto: `test('sčítání', () => { ... })`
</--help-->
<--seed-->
## --file-- script.js
```js
const { test } = require('node:test');
const assert = require('node:assert');

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

--edit--
// Napiš test pro funkci sum
--edit--
```
</--seed-->
<--solution-->
## --file-- script.js
```js
const { test } = require('node:test');
const assert = require('node:assert');

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

test('Sčítání čísel', () => {
  assert.equal(sum([1, 2]), 3, 'sum([1, 2]) má vrátit 3');
});
```
