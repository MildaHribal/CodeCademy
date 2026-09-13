## --card-- output

Co vypíše tenhle kód? Proměnná `reqUrl` obsahuje přesně to, co server dostal v `req.url`.

```js
const reqUrl = '/api/books?sort=title';
console.log(new URL(reqUrl, 'http://localhost').pathname);
```

### --expected--

/api/books

### --why--

`req.url` nese i query string. Čistou cestu pro routování dá až `pathname` z objektu
`URL`; porovnání `req.url === '/api/books'` by tady nesedlo.

### --see--

node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

## --card-- output

Co vypíše tenhle kód?

```js
const url = new URL('/api/books?limit=5', 'http://localhost');
console.log(typeof url.searchParams.get('limit'), url.searchParams.get('page'));
```

### --expected--

string null

### --why--

Parametry z query stringu jsou vždycky text — `'5'`, ne `5`. Parametr, který v adrese
není, vrátí `null`, ne `undefined`.

### --see--

node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

## --card-- output

Co vypíše tenhle kód?

```js
const pathname = '/api/books/abc';
console.log(Number(pathname.slice('/api/books/'.length)));
```

### --expected--

NaN

### --why--

`slice` odřízne prefix a zbyde `'abc'`. `Number('abc')` je `NaN` a žádný záznam takové
id nemá, takže detail skončí `404` bez zvláštní kontroly.

### --see--

node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

## --card-- output

Co vypíše tenhle kód? Druhý řádek dělá totéž co routa detailu knihy.

```js
const books = [{ id: 2, title: 'Krakatit' }];
const id = '/api/books/2'.slice('/api/books/'.length);
console.log(books.find((book) => book.id === id));
```

### --expected--

undefined

### --why--

Myslíš si, že `find` knihu najde? Id z adresy je řetězec `'2'` a v datech je číslo `2`,
takže `===` nikdy nesedí. Před porovnáním převeď id přes `Number(…)`.

### --see--

node-zaklady/http-v-node#typicke-chyby-a-pasti

## --card-- output

Program spustíš příkazem `PORT=8080 node app.js`. Objekt `env` níž má stejný obsah
jako `process.env` v tom programu. Co vypíše?

```js
const env = { PORT: '8080' };
console.log(env.PORT + 1);
```

### --expected--

80801

### --why--

Proměnné prostředí jsou vždycky řetězce, a `+` s řetězcem spojuje text. Číslo dostaneš
přes `Number(process.env.PORT)`.

### --see--

node-zaklady/co-je-node#process-program-a-svet-kolem-nej

## --card-- output

Program spustíš příkazem `DEBUG=false node app.js`. Objekt `env` níž má stejný obsah
jako `process.env` v tom programu. Co vypíše?

```js
const env = { DEBUG: 'false' };
console.log(env.DEBUG ? 'ladím' : 'tiše');
```

### --expected--

ladím

### --why--

`'false'` je neprázdný řetězec, a proto v podmínce pravdivý. Přepínač z prostředí
porovnej s textem: `process.env.DEBUG === 'true'`.

### --see--

node-zaklady/co-je-node#process-program-a-svet-kolem-nej

## --card-- output

Co vypíše tenhle kód? Knihovna je zatím prázdná a server počítá id nové knihy.

```js
const books = [];
console.log(Math.max(...books.map((book) => book.id)) + 1, Math.max(0, ...books.map((book) => book.id)) + 1);
```

### --expected--

-Infinity 1

### --why--

`Math.max()` bez argumentů vrací `-Infinity`. Nula na začátku zajistí, že první kniha
v prázdné knihovně dostane id `1`.

### --see--

node-zaklady/workshop-http-server/016

## --card-- output

Klient poslal jako tělo požadavku text `null`. Co vypíše kontrola „je tělo objekt"?

```js
const input = JSON.parse('null');
console.log(typeof input === 'object');
```

### --expected--

true

### --why--

`typeof null` je z historických důvodů `'object'`. Validace těla proto potřebuje
i podmínku `input === null`, jinak `input.title` spadne na `TypeError`.

### --see--

node-zaklady/workshop-http-server/019

## --card-- output

Co vypíše tenhle kód? Klient poslal rok vydání jako text.

```js
console.log(Number.isInteger('1920'), Number.isInteger(1920));
```

### --expected--

false true

### --why--

`Number.isInteger` řetězce nepřevádí — `'1920'` není číslo, natož celé. Proto ho
validace odmítne, kdežto `isNaN('1920')` by ho pustila.

### --see--

node-zaklady/workshop-http-server/019

## --card-- output

Jaký stavový kód pošle server, když tělo `POST` požadavku není platný JSON? Napiš číslo.

### --expected--

400

### --why--

Chybu způsobil klient a má opravit požadavek, proto `4xx`. `500` by tvrdilo, že se
rozbil server.

### --see--

node-zaklady/http-v-node#stavove-kody

## --card-- output

Jaký stavový kód pošleš po úspěšném `DELETE`, když odpověď nemá žádné tělo? Napiš číslo.

### --expected--

204

### --why--

`204 No Content` = hotovo a nic dalšího neposílám. Taková odpověď nemá tělo, a tak
nepotřebuje ani `Content-Type`.

### --see--

node-zaklady/http-v-node#stavove-kody

## --card-- output

Adresa `/api/books` existuje, ale klient na ni poslal `PUT`, který neumí. Jaký stavový
kód dostane? Napiš číslo.

### --expected--

405

### --accept--

405 Method Not Allowed

### --why--

`404` by tvrdilo, že adresa neexistuje. `405 Method Not Allowed` říká „adresa je,
jen tuhle metodu neumí".

### --see--

node-zaklady/http-v-node#stavove-kody

## --card-- output

Jak se jmenuje hlavička, ve které server u odpovědi `405` vyjmenuje metody, které adresa umí?

### --expected-- ignore-case

Allow

### --why--

Třeba `Allow: GET, POST`. Klient z ní pozná, co může zkusit místo zakázané metody.

### --see--

node-zaklady/workshop-http-server/010

## --card-- output

Server posílá jako odpověď kus HTML s českým textem. Napiš hodnotu hlavičky `Content-Type`.

### --expected-- ignore-case

text/html; charset=utf-8

### --why--

První část říká, jak tělo číst (`text/html`, u JSON `application/json`), `charset=utf-8`
říká, jak jsou v něm zapsané znaky. Bez kódování si klient může tipnout špatně a ukázat
rozsypanou češtinu.

### --see--

node-zaklady/http-v-node#hlavicky-a-content-type

## --card-- output

Klient poslal hlavičku `Authorization: Bearer abc123`. Napiš výraz, kterým její hodnotu
přečteš v handleru.

### --expected--

req.headers.authorization

### --accept--

req.headers['authorization']

### --why--

Node jména hlaviček v `req.headers` převádí na malá písmena. `req.headers.Authorization`
vrátí `undefined`.

### --see--

node-zaklady/http-v-node#pozadavek-a-odpoved

## --card-- output

Program hlásí `ERR_MODULE_NOT_FOUND` u řádku `import { formatPrice } from './money'`.
Soubor `money.js` leží vedle. Napiš opravený import.

### --expected--

import { formatPrice } from './money.js'

### --why--

Node v ES modulech příponu nedohledává, na rozdíl od Vite. Relativní import potřebuje
celé jméno souboru.

### --see--

node-zaklady/co-je-node#typicke-chyby-a-pasti

## --card-- code js

Napiš funkci `portFromEnv(env)`, která vrátí `env.PORT` jako **číslo**. Když `PORT`
v objektu chybí, vrátí `3000`.

### --seed--

```js
function portFromEnv(env) {
}
```

### --test--

```js
assert.equal(portFromEnv({ PORT: '8080' }), 8080, "portFromEnv({ PORT: '8080' }) má vrátit číslo 8080, ne řetězec");
assert.equal(portFromEnv({}), 3000, 'portFromEnv({}) má vrátit číslo 3000');
assert.equal(portFromEnv({ PORT: '4000', HOST: 'x' }), 4000, "portFromEnv({ PORT: '4000', HOST: 'x' }) má vrátit 4000");
```

### --solution--

```js
function portFromEnv(env) {
  return Number(env.PORT ?? 3000);
}
```

### --why--

Proměnné prostředí jsou řetězce, převod na číslo je vždycky na tobě.

### --see--

node-zaklady/workshop-http-server/003

## --card-- code js

Napiš funkci `sendJson(res, status, data)`, která přes `res.writeHead` pošle stavový kód
a hlavičku `Content-Type` pro JSON a přes `res.end` data převedená na text.

### --seed--

```js
function sendJson(res, status, data) {
}
```

### --test--

```js
const calls = [];
const res = {
  writeHead: (status, headers) => calls.push({ method: 'writeHead', status, headers }),
  end: (body) => calls.push({ method: 'end', body }),
};
sendJson(res, 201, { id: 6, title: 'R.U.R.' });
assert.deepEqual(calls.map((call) => call.method), ['writeHead', 'end'], 'sendJson(res, 201, …) má zavolat nejdřív res.writeHead a pak res.end');
assert.equal(calls[0].status, 201, 'sendJson(res, 201, …) má poslat stav 201');
const type = Object.entries(calls[0].headers ?? {}).find(([name]) => name.toLowerCase() === 'content-type')?.[1] ?? '';
assert.match(type, /^application\/json/i, `sendJson(…) má poslat Content-Type application/json, poslal: ${type}`);
assert.equal(calls[1].body, JSON.stringify({ id: 6, title: 'R.U.R.' }), 'sendJson(res, 201, { id: 6, title: "R.U.R." }) má do res.end dát JSON text, ne objekt');
```

### --solution--

```js
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
```

### --see--

node-zaklady/workshop-http-server/006

## --card-- code js

Napiš funkci `validateBook(input)`, která vrátí text chyby, když `input` není objekt,
když `title` není neprázdný řetězec (mezery se nepočítají), nebo když `year` není celé
číslo. Když je kniha v pořádku, vrátí `null`.

### --seed--

```js
function validateBook(input) {
}
```

### --test--

```js
assert.equal(validateBook({ title: 'R.U.R.', year: 1920 }), null, "validateBook({ title: 'R.U.R.', year: 1920 }) má vrátit null");
for (const input of [null, 42, { year: 1920 }, { title: '   ', year: 1920 }, { title: 'R.U.R.', year: '1920' }, { title: 'R.U.R.', year: 19.5 }]) {
  const result = validateBook(input);
  assert.equal(typeof result, 'string', `validateBook(${JSON.stringify(input)}) má vrátit text chyby, vrátil ${JSON.stringify(result)}`);
}
```

### --solution--

```js
function validateBook(input) {
  if (typeof input !== 'object' || input === null) {
    return 'Tělo musí být objekt.';
  }
  if (typeof input.title !== 'string' || input.title.trim() === '') {
    return 'Kniha musí mít název.';
  }
  if (!Number.isInteger(input.year)) {
    return 'Rok musí být celé číslo.';
  }
  return null;
}
```

### --see--

node-zaklady/workshop-http-server/019

## --card-- free

Co je Node.js a čím se liší JavaScript v Node od JavaScriptu v prohlížeči?

### --back--

Node.js je běhové prostředí, které spouští JavaScript mimo prohlížeč — na stejném
enginu V8 jako Chrome. Jazyk je stejný, liší se globální objekty: Node nemá `window`,
`document` ani DOM, zato má `process` a vestavěné moduly pro soubory, síť a procesy.
Proto se v Node píšou servery a nástroje pro příkazovou řádku, v prohlížeči kód stránky.

### --see--

node-zaklady/co-je-node#stejny-jazyk-jine-prostredi

## --card-- free

Proč `readFileSync` v obsluze požadavku zpomalí všechny uživatele serveru?

### --back--

Node spouští JavaScript v jednom vlákně pro všechny požadavky. Synchronní čtení to
vlákno zablokuje, dokud soubor nedočte, a server mezitím nemůže obsluhovat nikoho
jiného. Asynchronní `readFile` čtení předá systému a vlákno se mezitím věnuje dalším
požadavkům.

### --see--

node-zaklady/co-je-node#soubory-node-fs-promises

## --card-- free

Server po prvním požadavku spadl s `Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent to the client`. Co se stalo a jak to opravíš?

### --back--

Kód poslal odpověď a pak pokračoval dál k další — typicky chybí `return` za odesláním
odpovědi v `if`, a tak se pod ním pošle ještě jedna. Druhé `writeHead` na odeslané
odpovědi vyhodí výjimku, nikdo ji nechytí a proces skončí. Oprava: `return` před každým
odesláním odpovědi, aby každá cesta handlerem poslala právě jednu odpověď.

### --see--

node-zaklady/http-v-node#jedna-odpoved-na-kazdy-pozadavek

## --card-- free

Při spuštění serveru terminál hlásí `Error: listen EADDRINUSE: address already in use :::3000`. Co to znamená a co s tím uděláš?

### --back--

Na portu 3000 už poslouchá jiný program — nejčastěji tvůj vlastní server, který běží
v jiném terminálu. Jeden port může v jednu chvíli poslouchat jen jeden proces. Starý
server najdi a ukonči (Ctrl+C), nebo nový spusť na jiném portu přes `PORT=3001`.

### --see--

node-zaklady/co-je-node#typicke-chyby-a-pasti

## --card-- free

Kdy server odpoví `400` a kdy `500`? Proč na tom rozdílu záleží?

### --back--

`4xx` znamená chybu v požadavku — klient poslal vadná data a má je opravit, třeba
rozbitý JSON nebo chybějící název (`400`). `5xx` znamená chybu serveru, kterou klient
opravit nemůže, třeba poškozený soubor s daty (`500`). Rozhoduje, kdo chybu způsobil,
ne kde vznikla výjimka. Klient podle kódu pozná, jestli má požadavek opravit, nebo to
zkusit později.

### --see--

node-zaklady/http-v-node#stavove-kody

## --card-- free

Proč `GET /api/books?author=Nikdo` vrací `200` a prázdné pole, ale `GET /api/books/99` vrací `404`?

### --back--

`/api/books` je seznam, který existuje vždycky; query string jen říká, které položky
z něj klient chce, a prázdný výsledek je platná odpověď. `/api/books/99` označuje jednu
konkrétní knihu, a ta neexistuje — na adrese nic není, proto `404`.

### --see--

node-zaklady/workshop-http-server/013

## --card-- free

Proč se tělo požadavku v Node čte po kouscích a na text se převádí až spojené?

### --back--

Tělo může být velké, proto přichází jako proud kousků bajtů (`Buffer`). Hranice kousků
nerespektují znaky: `č` má v UTF-8 dva bajty a může se rozdělit mezi dva kousky. Převod
každého kousku zvlášť by z půlek udělal neplatné znaky, proto se bajty nejdřív spojí
přes `Buffer.concat` a na text se převede celek.

### --see--

node-zaklady/http-v-node#telo-pozadavku-je-proud

## --card-- free

Proč se port serveru, adresa databáze a tajné klíče předávají proměnnými prostředí, a ne v kódu?

### --back--

Liší se podle toho, kde program běží: u mě, na serveru, v testech. Když je předá ten,
kdo program spouští, běží stejný kód všude beze změny. Tajné klíče navíc v kódu nesmí
být, protože by skončily v gitu. V Node jsou v `process.env` a vždycky jako řetězce.

### --see--

node-zaklady/co-je-node#process-program-a-svet-kolem-nej

## --card-- free

Proč jedna nezachycená výjimka v handleru shodí server všem uživatelům a jak tomu zabránit?

### --back--

Všechny požadavky obsluhuje jeden proces Node a nezachycená výjimka ukončí celý proces.
Chyby ze vstupu zvenku (rozbitý JSON, špatná data) se chytají u zdroje a klient dostane
`400`. Na nečekané chyby dám jeden `try`/`catch` kolem celé obsluhy požadavku: chybu
vypíšu do logu a klientovi pošlu `500` s obecnou zprávou.

### --see--

node-zaklady/workshop-http-server/021
