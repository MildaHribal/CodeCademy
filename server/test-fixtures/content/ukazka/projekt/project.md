# --description--

Postav server, který na `/` odpoví `Ahoj z Akademie`.

# --hints--

Soubor `server.js` existuje.

```js
assert.ok(files['server.js']);
```

Server odpoví pozdravem.

```js
const server = await helpers.startServer('server.js');
const res = await fetch(server.url + '/');
assert.equal(await res.text(), 'Ahoj z Akademie');
```
