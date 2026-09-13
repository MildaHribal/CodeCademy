# --description--

Vypiš `Ahoj`.

# --hints--

Program vypíše Ahoj.

```js
const r = await helpers.run('node index.js');
assert.equal(r.stdout.trim(), 'Ahoj');
```

# --seed--

## --file-- index.js

```js
// sem piš
```

# --solution--

## --file-- index.js

```js
console.log('Ahoj');
```
