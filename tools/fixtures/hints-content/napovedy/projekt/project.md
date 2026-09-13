# --description--

Na stránce `index.html` bude nadpis `h1` s textem `Hotovo`.

# --hints--

Stránka má nadpis `h1` s textem `Hotovo`.

```js
assert.equal(document.querySelector('h1')?.textContent, 'Hotovo', 'h1 má mít text Hotovo');
```

# --help--

## --tip--

Nadpis první úrovně je prvek `h1`, text patří mezi jeho značky.
