---
title: Rozpočet ve Vite a TypeScriptu
runtime: node
---
</--solution-->
<--description-->
Tento projekt spojuje vše, co ses naučil. Postavíš kalkulačku rozpočtu v TypeScriptu, pokryješ ji testy a vytvoříš frontend ve Vite.

Rozšíření do portfolia: Přidej persistence do LocalStorage, nasaď přes GitHub Pages a přidej podrobné README s E2E testem v Playwrightu.
</--description-->
<--hints-->
Rozděl kód na testovatelné funkce nezávislé na DOM.
</--hints-->
<--seed-->
## --file-- src/budget.ts
```ts
export function addTransaction() {
  // TODO
}
```
</--seed-->
<--solution-->
## --file-- src/budget.ts
```ts
export function addTransaction(budget, amount) {
  return budget + amount;
}
```
