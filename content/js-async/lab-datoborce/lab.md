---
title: "Datoborce"
runtime: dom
see: section/lesson#anchor
---
<--description-->
Tento lab prověří tvé schopnosti získat data z API, správně ošetřit chyby (404, 500, síťová chyba) a vykreslit výsledky do DOMu. Tvým úkolem je vytvořit malou aplikaci, která zobrazí seznam uživatelů a při kliknutí načte jejich detaily.
</--description-->
<--hints-->
Splň tyto požadavky:
- Zobraz loading state během načítání.
- Po úspěšném načtení ukaž data.
- Při chybě ukaž červenou chybovou hlášku.

```js
assert.equal(1, 1, 'Data se úspěšně načetla');
```
</--hints-->
<--approaches-->
## --approach--
Můžeš použít `try...catch` a ručně ovládat styly.
</--approaches-->
<--seed-->
## --file-- script.js
```js
/**
 * Načte uživatele ze zadaného API.
 * @param {string} url Adresa API
 */
async function loadUsers(url) {
  // Doplň kód
}
```
</--seed-->
<--solution-->
## --file-- script.js
```js
async function loadUsers(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Chyba serveru');
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```
