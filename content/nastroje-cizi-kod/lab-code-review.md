---
title: Code review s testy
runtime: node
see: nastroje-cizi-kod/code-review
---
<--description-->
Dostal jsi za úkol udělat code review Pull Requestu, který přidává funkci na aplikování kupónů. Autor v něm ale nasekal několik chyb.
Tvým úkolem je kód opravit tak, aby plnil zadání, a do souboru `REVIEW.md` napsat komentáře pro autora, jaké chyby tam udělal a proč je oprava potřeba.
</--description-->
<--hints-->
Kód musí aplikovat kupón a vracet správnou cenu.
```js
assert.equal(applyCoupon(100, 'DISCOUNT10'), 90, 'Kupón sleví 10 %');
```
</--hints-->
<--seed-->
## --file-- script.js
```js
/**
 * Aplikuje kupón
 * @param {number} price
 * @param {string} code
 */
function applyCoupon(price, code) {
  // TODO
}
```
## --file-- REVIEW.md
```markdown
# Komentáře z Code Review
```
</--seed-->
<--solution-->
## --file-- script.js
```js
function applyCoupon(price, code) {
  if (code === 'DISCOUNT10') return price * 0.9;
  return price;
}
```
## --file-- REVIEW.md
```markdown
# Komentáře z Code Review
1. nit: použij const místo let
2. chyběl okrajový případ neplatného kupónu
```
</--solution-->
