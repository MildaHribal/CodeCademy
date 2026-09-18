---
title: Lab ladění cizí appky
runtime: js
see: js-chyby-ladeni/systematicke-ladeni#postup
---
<--solution-->
## --file-- script.js
```js
function start() {}
```
<--description-->
Najdi chybu v cizí appce.
</--description-->
<--hints-->
Oprav `start()` aby fungovalo.
```js
assert.equal(start(), true, 'start() má vrátit true');
```
</--hints-->
<--seed-->
## --file-- script.js
```js
/** Start app */
function start() {
}
```
</--seed-->
