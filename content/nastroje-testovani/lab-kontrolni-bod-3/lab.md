---
title: Kontrolní bod 3
runtime: node
see: nastroje-testovani/proc-testovat#piramida
---
</--solution-->
<--description-->
Je tu kontrolní bod. Máš za úkol napsat test na chybějící funkci, opravit bug podle testu a upravit repozitář. Postupuj krok po kroku.

- Napiš test odhalující chybu ve formátování měny
- Oprav formátovací funkci
- Doplň commit
</--description-->
<--hints-->
Ujisti se, že aserce používají češtinu.
```js
assert.equal(formatCurrency(100), '100 Kč', 'Částka má být s Kč');
```
</--hints-->
<--approaches-->
## --approach--
Lze vyřešit pomocí Intl.NumberFormat nebo prostým string concat. Záleží na preferenci ohledně lokalizace.
</--approaches-->
<--seed-->
## --file-- index.js
```js
/**
 * Naformátuje číslo jako CZK.
 */
function formatCurrency(amount) {
  // TODO
}
```
</--seed-->
<--solution-->
## --file-- index.js
```js
function formatCurrency(amount) {
  return `${amount} Kč`;
}
```
