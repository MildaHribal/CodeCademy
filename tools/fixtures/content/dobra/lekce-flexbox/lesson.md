# Flexbox na jedné stránce

:::check pretest
Co myslíš, co udělá `display: flex` s dětmi prvku?

### --answer--
Schová je.

#### --why--
Myslíš si, že flex mění viditelnost? Mění jen rozložení.

### --correct--
Postaví je vedle sebe.
:::

## Flex kontejner

Kontejner s `display: flex` skládá své děti vedle sebe.

> [!REMEMBER]
> **Flex kontejner řídí rozložení svých přímých dětí.**

:::live
```html
<div class="row"><div>1</div><div>2</div></div>
```
```css
.row { display: flex; gap: var(--gap); justify-content: var(--justify); }
```
```js
console.log('Počet dětí:', document.querySelector('.row').children.length);
```
```controls
--gap: range(0, 3, 0.5, rem) = 1 | Mezera
--justify: select(flex-start, center, space-between) | Zarovnání
```
:::

:::check
Která hodnota vlastnosti `display` udělá z prvku flex kontejner?

### --expected--
flex

### --why--
Jen `display: flex` (nebo `inline-flex`) zapne flexbox.
:::

:::live js predict
```js
const ceny = [120, 80, 45];
console.log(ceny.reduce((soucet, cena) => soucet + cena, 0));
```
--question-- Co vypíše `console.log`?
--expected-- 245
--why-- `reduce` sečte všechny ceny od nuly.
:::

:::live predict
```html
<div class="row"><p>Text</p><p>Druhý</p></div>
```
```css
.row { display: flex; }
```
--question-- Jak budou odstavce rozložené?
--option-- Pod sebou.
--option*-- Vedle sebe.
--why-- Děti flex kontejneru stojí v řádku.
:::

:::live node predict
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');
```
--question-- V jakém pořadí se vypíší písmena?
--output--
```text
A
C
B
```
:::

:::explain
Vysvětli, proč `gap` nedělá mezeru před první položkou.

## --model--
`gap` je mezera mezi položkami, ne okraj kontejneru.

## --checklist--
- `gap` patří mezi položky.
- Okraj kontejneru dělá `padding`.
:::

:::memory
```js
const a = [1, 2];
const b = a;
```
--step-- 1
a -> @pole
@pole: [1, 2]
--step-- 2 | b ukazuje na totéž pole
a -> @pole
b -> @pole
@pole: [1, 2]
:::

:::compare
```html
<div class="wrap"><div class="box">Široký box</div><div class="box">Druhý</div></div>
```
```css
.wrap { width: 300px; outline: 1px solid; }
.box { width: 2000px; }
```
--variant-- Normální tok
```css
.wrap { display: block; }
```
--variant-- Flexbox
```css
.wrap { display: flex; }
```
:::

## Typické chyby a pasti

> [!PITFALL]
> `gap` na prvku bez `display: flex` nic neudělá.

:::check
Proč `gap: 1rem` na obyčejném `div` nic neudělá?

### --expected-- ignore-case
Není to flex kontejner

### --accept--
není flex kontejner
:::

## Kde to najdeš v MDN

Hledej „flexbox" na [MDN](https://developer.mozilla.org/).

# --questions--

## --question--

Jak se jmenuje vlastnost, která z prvku udělá flex kontejner?

### --expected--

display

### --why--

`display: flex` zapne flexbox.

### --see--

dobra/lekce-flexbox#flex-kontejner

## --question--

Co udělá `gap`?

### --answer--

Mezeru kolem kontejneru.

#### --why--

Myslíš si, že `gap` je okraj? Okraj dělá `padding`.

### --correct--

Mezeru mezi položkami.
