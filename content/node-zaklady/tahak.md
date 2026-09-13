# Tahák: Node.js základy

## Prohlížeč × Node

| jen v prohlížeči | v obou | jen v Node |
|---|---|---|
| `window`, `document`, DOM | `console`, `setTimeout`, `fetch`, `URL` | `process`, `Buffer` |
| `localStorage` | `JSON`, `Promise`, `structuredClone` | `node:fs`, `node:http`, `node:path` |

- Projekt s ES moduly: v `package.json` `"type": "module"`.
- [[vestavěný modul|Vestavěné moduly]] s předponou `node:`, vlastní soubory **s příponou** `./utils.js`.
- `node server.js` spustí program, `node --watch server.js` ho restartuje po uložení, Ctrl+C ukončí.

## `process`

| co | kde | pozor |
|---|---|---|
| [[proměnná prostředí|proměnné prostředí]] | `process.env.PORT` | vždycky řetězec nebo `undefined` |
| [[pracovní složka]] | `process.cwd()` | od ní se počítají relativní cesty |
| argumenty | `process.argv` | první dva jsou cesta k `node` a ke skriptu |
| ukončení s chybou | `process.exit(1)` | |

## Požadavek a odpověď

| čteš z `req` | posíláš přes `res` |
|---|---|
| `req.method` — `'GET'`, `'POST'`… | `res.writeHead(status, { 'Content-Type': … })` |
| `req.url` — cesta **i s query stringem** | `res.setHeader('Allow', 'GET, POST')` — před odesláním |
| `req.headers['content-type']` — malá písmena | `res.end(text)` — jen text nebo bajty, jednou |
| tělo — [[proud]], čte se `for await…of` | |

## Stavové kódy

| kód | kdy |
|---|---|
| `200 OK` | tady to je (i prázdný výsledek filtru `[]`) |
| `201 Created` | vytvořeno, v těle nový záznam s id od serveru |
| `204 No Content` | hotovo bez těla (typicky `DELETE`), bez `Content-Type` |
| `400 Bad Request` | vadná data od klienta — rozbitý JSON, chybějící pole |
| `404 Not Found` | adresa nebo záznam neexistuje |
| `405 Method Not Allowed` | adresa je, metodu neumí — s hlavičkou `Allow` |
| `500 Internal Server Error` | chyba serveru — podrobnosti jen do logu |

## Vzory

Cesta k souboru vedle modulu, nezávislá na místě spuštění:

```js
const dataFile = new URL('./data.json', import.meta.url);
```

Port z prostředí:

```js
const port = Number(process.env.PORT ?? 3000);
```

Čtení a zápis JSON souboru:

```js
const items = JSON.parse(await readFile(dataFile, 'utf8'));
await writeFile(dataFile, JSON.stringify(items, null, 2));
```

Odpověď v JSON:

```js
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
```

Routování podle cesty, [[parametr cesty|parametru cesty]] a metody:

```js
const { pathname, searchParams } = new URL(req.url, 'http://localhost');

if (pathname === '/api/items') {
  if (req.method === 'GET') return sendJson(res, 200, await loadItems());
  res.setHeader('Allow', 'GET');
  return sendJson(res, 405, { error: 'Metoda není povolená.' });
}

if (pathname.startsWith('/api/items/')) {
  const id = Number(pathname.slice('/api/items/'.length));
  // …
}
```

Tělo požadavku:

```js
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}
```

Neplatný JSON → `400`:

```js
let input;
try {
  input = JSON.parse(await readBody(req));
} catch {
  return sendJson(res, 400, { error: 'Tělo musí být platný JSON.' });
}
```

Nečekaná chyba → `500` a server běží dál:

```js
const server = createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'Na serveru se něco pokazilo.' });
  }
});
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| `ERR_HTTP_HEADERS_SENT`, server spadne po první odpovědi | chybí `return` po odeslání | `return sendJson(…)` |
| klient čeká a nic nepřijde | větev bez `res.end()` | každá cesta handlerem končí odpovědí |
| `ERR_INVALID_ARG_TYPE … "chunk" argument` | `res.end(objekt)` | `JSON.stringify(data)` |
| adresa s `?…` vrací `404` | porovnáváš `req.url` | porovnávej `pathname` |
| detail vrací vždy `404` | id z adresy je řetězec | `Number(…)` |
| `SyntaxError: Unexpected end of JSON input` shodí server | `JSON.parse` bez `try` | `try`/`catch` a `400` |
| rozsypané `č` v těle | převod kousků zvlášť | `Buffer.concat` a pak `toString` |
| `ENOENT` u existujícího souboru | relativní cesta od `process.cwd()` | `new URL('./x', import.meta.url)` |
| `ERR_MODULE_NOT_FOUND` | chybí přípona | `'./utils.js'` |
| `EADDRINUSE` | port drží jiný proces | ukonči starý server nebo jiný `PORT` |
| `DEBUG=false` se chová jako zapnuté | proměnné prostředí jsou řetězce | `process.env.DEBUG === 'true'` |
