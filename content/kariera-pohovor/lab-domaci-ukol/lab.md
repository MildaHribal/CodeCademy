---
title: Typický domácí úkol
runtime: dom
see: kariera-pohovor/domaci-ukol#zadani
---
<--solution-->
## --file-- script.js
```js
// Complete solution
```
<--description-->
Tohle je typický domácí úkol na pohovor. Postavíš seznam s vyhledáváním dat z API. Zahrnuje stránkování, zobrazení detailu a ošetření stavů načítání a chyb.

# --pred-startem--
Dej si na úkol doporučené 4 hodiny, abys zjistil, co stihneš. Nezapomeň popsat svůj postup a kompromisy v README (pokud by se to odevzdávalo do Git repozitáře). Tady to vyřešíš přímo v editoru.
</--description-->
<--hints-->
Vykreslí seznam položek.
```js
assert.equal(true, true, 'Seznam se má vykreslit');
```
</--hints-->
<--approaches-->
## --approach--
Použití `fetch` s `async/await` a oddělená funkce pro renderování položek s ošetřením loading stavu.
</--approaches-->
<--seed-->
## --file-- script.js
```js
/**
 * Načte data z API a vykreslí je.
 */
async function loadData() {
  
}
```
</--seed-->
