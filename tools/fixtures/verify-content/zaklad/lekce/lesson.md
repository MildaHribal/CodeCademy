# Lekce

Úvod s [[objekt]] a [odkaz](see:zaklad/lekce#neni).

> [!INFO]
> Neznámý typ rámečku.

## Pole

:::check pretest
Předem?

### --expected--
ano
:::

:::live
```css
p { color: red; }
```
```controls
--nepouzita: toggle(a, b)
```
:::

:::live js predict
```js
console.log(1 + 1);
// log: 2
```
--question-- Co vypíše?
--expected-- 3
:::

:::live js
```js
chyba(); // verify: errors
```
:::

:::compare
```html
<p>x</p>
```
--variant-- A
```css
p { color: red; }
```
--variant-- B
```css
p { color: red; }
```
:::

:::explain
Vysvětli.

## --model--
Model.

## --checklist--
- Jen jeden bod.
:::

# --questions--

## --question--

Stejná?

### --answer--

A

### --correct--

B

## --question--

Stejná?

### --answer--

A

#### --why--

Proto.

### --correct--

B
