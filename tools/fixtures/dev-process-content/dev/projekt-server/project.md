# --description--

Server, který na `/` odpoví pozdravem.

# --hints--

Server odpoví pozdravem.

```js
const server = await helpers.startServer('app.js');
const res = await fetch(server.url + '/');
assert.equal(await res.text(), 'Ahoj z projektu', 'GET / má vrátit pozdrav');
```
