---
title: 10 Úloh
runtime: js
see: js-algoritmy/postup-reseni#porozumeni
---
<--solution-->
## --file-- script.js
```js
function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push('FizzBuzz');
    else if (i % 3 === 0) result.push('Fizz');
    else if (i % 5 === 0) result.push('Buzz');
    else result.push(i.toString());
  }
  return result;
}
```
<--description-->
Implementuj FizzBuzz do pole pro zadané `N`.
</--description-->
<--hints-->
Vrať pole stringů.
```js
assert.deepEqual(fizzBuzz(5), ['1', '2', 'Fizz', '4', 'Buzz'], 'fizzBuzz(5) funguje');
```
</--hints-->
<--approaches-->
## --approach--
Použít switch.
</--approaches-->
<--seed-->
## --file-- script.js
```js
/**
 * Vrátí FizzBuzz posloupnost.
 */
function fizzBuzz(n) {
  
}
```
</--seed-->
