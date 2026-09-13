## --card-- output

Co vypíše tenhle kód?

```js
const ceny = [120, 80, 45];
console.log(ceny.length);
```

### --expected--

3

### --why--

`length` je počet prvků, ne nejvyšší index.

### --see--

dobra/lab-soucet

## --card-- code js

Napiš funkci `posledni(polozky)`, která vrátí poslední položku pole.

### --seed--

```js
function posledni(polozky) {
}
```

### --test--

```js
assert.equal(posledni([1, 2, 3]), 3, 'posledni([1, 2, 3]) má vrátit 3');
```

### --solution--

```js
function posledni(polozky) {
  return polozky.at(-1);
}
```

### --see--

dobra/lab-soucet

## --card-- css

Napiš deklaraci, která z prvku udělá [[flex kontejner]].

### --expected--

```css
display: flex;
```

### --see--

dobra/lekce-flexbox#flex-kontejner

## --card-- free

Co dělá `gap` u flex kontejneru?

### --back--

Udělá mezeru mezi položkami, ne kolem nich.

### --see--

dobra/workshop-navigace/002
