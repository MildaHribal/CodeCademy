# Titulek

:::check pretest
Co vypíše `[1] === [1]`?

### --expected--
false
:::

## Část

> [!PITFALL]
> Pozor.

:::live js predict
```js
console.log(4);
```
--question-- Co vypíše?
--expected-- 4
:::

:::live
```css
.a { gap: var(--gap); }
```
```controls
--gap: range(0, 3, 0.5, rem) = 1 | Mezera
```
:::

:::memory
```js
const a = [1];
```
--step-- 1 | start
a -> @arr
@arr: [1]
:::

:::compare
```css
.w { width: 1px; }
```
--variant-- A
```css
.w { display: block; }
```
--variant-- B
```css
.w { display: flex; }
```
:::

:::explain
Proč?

## --model--
Protože.

## --checklist--
- Bod.
:::

# --questions--

## --question--

Kolik je `1 + 1`?

### --expected--

2
