---
pass: 1
---

# --questions--

## --question--

Co vrátí `typeof 1`?

### --answer--

`"string"`

#### --why--

Myslíš si, že všechno z konzole je text? Konzole jen vypisuje, typ hodnoty se nemění.

### --correct--

`"number"`

#### --why--

Číselný literál je typu number.

### --answer--

`"integer"`

#### --why--

JavaScript nerozlišuje celá a desetinná čísla typem.

### --see--

opak/kviz

## --question--

Co vypíše `console.log([1, 2].length)`?

### --expected--

2

### --why--

Pole má dva prvky, `length` je počet prvků.

# --code-- Počítání košíku

## --file-- cart.js

```js
function cartTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].count;
  }
  return total;
}
```

## --question--

Co vrátí `cartTotal([])`?

### --expected--

0

### --why--

Cyklus se neprovede ani jednou a vrátí se počáteční hodnota.
