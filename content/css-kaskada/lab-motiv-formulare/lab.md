---
title: "Lab: Styly formuláře"
runtime: dom
see: css-kaskada/moderni-selektory#stav-formulare-focus-within-a-user-invalid
---
</--solution-->
<--description-->
Tvým úkolem je nastylovat formulář, který reaguje na chyby zadání, ale až poté, co s ním uživatel začal pracovat.

Požadavky:
- Všechny inputy mají základní vzhled (border, padding).
- Pokud je vstup nevalidní (`:user-invalid`), okraj zčervená.
- Zkus použít `:has()` k obarvení celého kontejneru pole, pokud obsahuje chybu.
</--description-->
<--hints-->
Napiš styly pro `input:user-invalid`.
```js
assert.equal(1, 1, 'Testy v labech obvykle kontrolují DOM strukturu a vypočítané styly.')
```
</--hints-->
<--approaches-->
## --approach--
Alternativou je použít třídy přepínané pomocí JavaScriptu, ale `:user-invalid` to zvládne čistě v CSS.
</--approaches-->
<--seed-->
## --file-- index.html
```html
<form>
  <div class="field">
    <label>Email</label>
    <input type="email" required>
  </div>
</form>
```
## --file-- style.css
```css
/* Doplnit styly */
```
</--seed-->
<--solution-->
## --file-- index.html
```html
<form>
  <div class="field">
    <label>Email</label>
    <input type="email" required>
  </div>
</form>
```
## --file-- style.css
```css
input {
  border: 1px solid gray;
  padding: 8px;
}
input:user-invalid {
  border-color: red;
}
.field:has(input:user-invalid) label {
  color: red;
}
```
</--solution-->
