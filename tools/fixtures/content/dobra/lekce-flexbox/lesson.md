# Flexbox na jedné stránce

Kontejner s `display: flex` skládá své děti vedle sebe.

:::live
```html
<div class="row"><div>1</div><div>2</div></div>
```
```css
.row { display: flex; gap: 1rem; }
```
```js
console.log('Počet dětí:', document.querySelector('.row').children.length);
```
:::

A čistý JavaScript s konzolí:

:::live js
```js
const ceny = [120, 80, 45];
console.log(ceny.reduce((soucet, cena) => soucet + cena, 0));
```
:::

# --questions--

## --question--

Jak se jmenuje vlastnost, která z prvku udělá flex kontejner?

### --answer--

`flex-direction`

### --correct--

`display`
