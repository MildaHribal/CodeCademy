---
pass: 0.8
---

# --questions--

## --question--

Otázka číslo 1: kolik je 1 + 1?

### --answer--

3

#### --why--

Přičetl jsi dvojku místo jedničky.

### --correct--

2

### --see--

dobra/lab-soucet

## --question--

Otázka číslo 2: kolik je 2 + 1?

### --answer--

4

#### --why--

Přičetl jsi dvojku místo jedničky.

### --correct--

3

### --see--

dobra/lab-soucet

## --question--

Otázka číslo 3: kolik je 3 + 1?

### --answer--

5

#### --why--

Přičetl jsi dvojku místo jedničky.

### --correct--

4

### --see--

dobra/lab-soucet

## --question--

Kolik prvků má pole `[1, 2, 3]`?

### --expected--

3

### --why--

`length` počítá prvky.

### --see--

dobra/lekce-flexbox#flex-kontejner


# --code-- Kroky

## --file-- kroky.js

```js
function krok1(x) {
  return x + 1;
}
function krok2(x) {
  return x + 2;
}
function krok3(x) {
  return x + 3;
}
function krok4(x) {
  return x + 4;
}
function krok5(x) {
  return x + 5;
}
function krok6(x) {
  return x + 6;
}
function krok7(x) {
  return x + 7;
}
function krok8(x) {
  return x + 8;
}
function krok9(x) {
  return x + 9;
}
function krok10(x) {
  return x + 10;
}
function krok11(x) {
  return x + 11;
}
function krok12(x) {
  return x + 12;
}
function krok13(x) {
  return x + 13;
}
const vysledek = krok1(0);
```

## --question--

Co vrátí `krok2(1)`?

### --expected--

3

### --why--

`krok2` přičte dvojku.

### --see--

dobra/lab-soucet
