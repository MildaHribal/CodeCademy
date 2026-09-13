# HTTP požadavek a odpověď v Node

:::check pretest
Co myslíš: kolikrát může server odpovědět na jeden požadavek? Napiš číslo.

### --expected--
1

### --accept--
jednou
jedenkrát

### --why--
Na jeden požadavek jde právě jedna odpověď. Co se stane, když se server pokusí
odpovědět podruhé, uvidíš v téhle lekci — a není to hezké.
:::

Server z minulé lekce na všechno odpoví `Ahoj ze serveru`. Pro prohlížeč to stačí,
pro frontend ne. Aplikace, která se ptá serveru na knihu, potřebuje vědět tři věci:
jestli se to povedlo, co dostala (text, JSON, obrázek?) a samotná data.
A server musí z požadavku poznat, co po něm klient vůbec chce.

> [!REMEMBER]
> **Každý požadavek je jedno zavolání handleru: z `req` přečteš, co klient chce, a do `res` pošleš právě jednu odpověď — stavový kód, hlavičky a tělo.**

## Požadavek a odpověď

HTTP je textová dohoda mezi klientem a serverem. Když pošleš knihu přes `curl -v`,
uvidíš, co doopravdy putuje sítí:

```text
POST /api/books?draft=1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 54

{"title":"R.U.R.","author":"Karel Čapek","year":1920}
```

```text
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":6,"title":"R.U.R."}
```

Požadavek má metodu (co udělat), adresu (s čím), [[HTTP hlavička|hlavičky]]
(popis) a nepovinné tělo (data). Odpověď má [[stavový kód]], hlavičky a tělo.
Funkce, kterou předáš `createServer`, je [[handler]]: Node ji zavolá pro každý
požadavek zvlášť.

| v požadavku | v Node čteš | v odpovědi | v Node posíláš |
|---|---|---|---|
| metoda `POST` | `req.method` | stavový kód `201` | `res.writeHead(201, …)` |
| adresa `/api/books?draft=1` | `req.url` | hlavičky | `res.writeHead(…, { 'Content-Type': … })` nebo `res.setHeader` |
| hlavičky | `req.headers` (klíče **malými písmeny**) | tělo | `res.end(text)` |
| tělo | `req` je proud, čte se po kouscích | | |

Metoda a adresa spolu tvoří „větu": `GET /api/books` = vypiš knihy,
`POST /api/books` = přidej knihu, `DELETE /api/books/3` = smaž knihu 3. API, které
takhle pojmenovává věci adresami a akce metodami, se říká [[REST API]].

:::check
Klient poslal hlavičku `Content-Type: application/json`. Napiš výraz, kterým její hodnotu přečteš v handleru.

### --expected--
req.headers['content-type']

### --why--
Hlavičky jsou v objektu `req.headers` a Node jejich jména převádí na malá písmena,
protože v HTTP na velikosti písmen u jmen hlaviček nezáleží. `req.headers['Content-Type']`
by vrátilo `undefined`.
:::

## Stavové kódy

Stavový kód je první věc, kterou klient čte. Podle první číslice pozná, **kdo** je
za výsledek zodpovědný:

| skupina | význam | kódy, které v sekci použiješ |
|---|---|---|
| `2xx` | povedlo se | `200 OK`, `201 Created` (něco vzniklo), `204 No Content` (hotovo, bez těla) |
| `4xx` | chyba je v požadavku, klient ho má opravit | `400 Bad Request` (vadná data), `404 Not Found` (taková věc není), `405 Method Not Allowed` (tahle adresa neumí tuhle metodu; které umí, řekne hlavička `Allow: GET, POST`) |
| `5xx` | chyba je na serveru | `500 Internal Server Error` |

Dva kontrastní páry, na kterých se chybuje nejčastěji:

- **`400` × `500`.** Klient pošle rozbitý JSON a `JSON.parse` vyhodí výjimku. Výjimka
  sice vznikla na serveru, ale vina je v požadavku, proto `400`. `500` říká „rozbili
  jsme se my" a klient by zbytečně zkoušel požadavek opakovat.
- **`404` × `200` s `null`.** Když kniha neexistuje a pošleš `200`, tvrdíš „všechno
  proběhlo, tady to je". Klient se o chybě dozví až tím, že se mu rozbije zobrazení.

:::explain
Vysvětli vlastními slovy, proč server na rozbitý JSON v těle požadavku odpoví `400`, a ne `500`, i když výjimku vyhodil kód serveru.

## --model--
Stavový kód neříká, kde vznikla výjimka, ale kdo má chybu opravit. Rozbitý JSON je
chyba klienta: `400` mu říká, že má opravit požadavek. `500` je vyhrazená pro chyby,
které klient opravit nemůže, protože jsou na straně serveru.

## --checklist--
- Skupina `4xx` znamená chybu v požadavku, `5xx` chybu serveru.
- Rozhoduje, kdo chybu způsobil a může ji opravit, ne kde vznikla výjimka.
- Klient podle kódu pozná, jestli má požadavek opravit, nebo to zkusit později.
:::

:::check
Klient poslal `POST /api/books` a server knihu úspěšně uložil. Jaký stavový kód pošle?

### --expected--
201

### --accept--
201 Created

### --why--
`201 Created` říká „vzniklo něco nového". Tělo odpovědi obvykle obsahuje vytvořený
záznam i s `id`, které přidělil server. `200` by nebylo špatně, ale neřekne to přesně.
:::

## Hlavičky a `Content-Type`

`res.end` umí poslat jen **text nebo bajty**. Objekt musíš nejdřív převést přes
`JSON.stringify`. A aby klient věděl, že text má číst jako JSON, pošleš hlavičku
`Content-Type`:

```js
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
```

`application/json` je typ dat, `charset=utf-8` kódování znaků. Bez něj si klient
kódování tipne a místo `Čapek` může ukázat nesmyslné znaky.

Hlavičky musí odejít **před** tělem. `writeHead` je pošle hned, `res.setHeader(jméno,
hodnota)` je jen připraví a odešlou se s prvním `writeHead` nebo `end`. Co když
objekt zapomeneš převést?

:::live node predict
```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end({ title: 'Krakatit' });
});

server.listen(3000);
```
--question-- Prohlížeč otevře `http://localhost:3000`. Co se stane se serverem?
--option-- Klient dostane `{"title":"Krakatit"}`, Node objekt převede sám.
--option-- Klient dostane text `[object Object]`.
--option*-- Server spadne na `TypeError` a klient nedostane nic.
--output--
```text
node:_http_outgoing:946
    throw new ERR_INVALID_ARG_TYPE(
    ^

TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string or an instance of Buffer or Uint8Array. Received an instance of Object
    at write_ (node:_http_outgoing:946:11)
    at ServerResponse.end (node:_http_outgoing:1104:5)
    at Server.<anonymous> (file:///home/jana/server.js:5:7) {
  code: 'ERR_INVALID_ARG_TYPE'
}

Node.js v26.5.1
```
--why-- `res.end` bere řetězec nebo bajty (`Buffer`, `Uint8Array`) a na objekt vyhodí výjimku. Nikdo ji nechytí, a tak skončí celý proces. Převod `JSON.stringify` je vždycky na tobě.
:::

Zkus si to u sebe: spusť server, otevři adresu v prohlížeči a sleduj terminál. Pak objekt
obal do `JSON.stringify(…)` a v prohlížeči se podívej, jestli se JSON zobrazí hezky
naformátovaný — prohlížeč ho podle hlavičky pozná.

:::check
Napiš hodnotu hlavičky `Content-Type` pro odpověď v JSON s českými znaky.

### --expected-- ignore-case
application/json; charset=utf-8

### --why--
`application/json` říká, jak text číst, `charset=utf-8`, jak jsou v něm zapsané znaky.
:::

## Adresa: `req.url`, cesta a query string

Rozhodování „tahle adresa → tenhle kód" se jmenuje [[routování]] (*routing*).
Frameworky ho mají zabudované, v čistém Node je to obyčejný `if`. Past je v tom, co
přesně je v `req.url`: celá cesta **včetně [[query string|query stringu]]** za otazníkem.
Čistou cestu a parametry z ní vytáhne vestavěná třída `URL`:

:::live js predict
```js
const reqUrl = '/api/books?author=Karel%20%C4%8Capek&limit=2';
const url = new URL(reqUrl, 'http://localhost');

console.log(reqUrl === '/api/books');
console.log(url.pathname);
console.log(url.searchParams.get('author'));
console.log(typeof url.searchParams.get('limit'));
```
--question-- Proměnná `reqUrl` obsahuje přesně to, co by server dostal v `req.url`. Co vypíšou čtyři `console.log`, každý na svůj řádek?
--expected--
```text
false
/api/books
Karel Čapek
string
```
--why-- `req.url` nese i query string, proto porovnání s `'/api/books'` nesedí. `URL` potřebuje celou adresu, a tak dostane základ `http://localhost` (jaký, je jedno). `searchParams.get` sám dekóduje `%20` i `%C4%8C` a vrací **vždycky řetězec** — nebo `null`, když parametr chybí.
:::

Zkus si to: změň v `reqUrl` hodnotu `limit=2` na `limit=abc` a pak parametr `limit`
úplně smaž. Sleduj, co vrací `searchParams.get('limit')`.

Část adresy, která se mění, je [[parametr cesty]]: kniha s id `2` žije na
`/api/books/2`. Porovnání `===` na ni nestačí, id může být jakékoli. Cestu proto
poznáš podle začátku a zbytek odřízneš:

```js
if (pathname.startsWith('/api/movies/')) {
  const id = Number(pathname.slice('/api/movies/'.length));
  // …najdi film s tímhle id
}
```

:::check
Jakou hodnotu má `id` pro adresu `/api/books/abc`? `const id = Number('/api/books/abc'.slice('/api/books/'.length));`

### --expected--
NaN

### --why--
`slice` vrátí `'abc'` a `Number('abc')` je `NaN`. Žádná kniha takové id nemá, takže
server odpoví `404` a nesmysl v adrese nemusíš řešit zvlášť.
:::

## Tělo požadavku je proud

[[Tělo požadavku]] v Node není jedna vlastnost. Může být obrovské (nahrávaný film),
a proto přichází jako [[proud]] (*stream*) kousků bajtů. Objekt `req` je takový proud
a projdeš ho cyklem `for await…of`:

```js
async function readText(stream) {
  const pieces = [];
  for await (const piece of stream) {
    pieces.push(piece);
  }
  return Buffer.concat(pieces).toString('utf8');
}
```

Každý kousek je `Buffer`. Proč je nejdřív spojit a teprve celek převést na text?
V UTF-8 zabírá `č` **dva bajty** a hranice kousku může padnout přesně mezi ně.
V prohlížeči to vyzkoušíš s `TextEncoder` a `TextDecoder`, které dělají totéž co
převod `Buffer` na text:

:::live js predict
```js
const bytes = new TextEncoder().encode('č');
const first = bytes.slice(0, 1);
const second = bytes.slice(1);
const decoder = new TextDecoder();

console.log(decoder.decode(first) + decoder.decode(second));
```
--question-- Co vypíše `console.log`, když každou půlku znaku převedeš na text zvlášť?
--option-- `č` — dekodér si půlky spojí sám.
--option*-- Dva otazníky `��` — každá půlka je sama o sobě neplatný znak.
--option-- Nic, `decode` na neúplném znaku vyhodí chybu.
--why-- Dekodér neví, že druhá půlka přijde později, a každou nekompletní sekvenci nahradí znakem `�`. Proto se kousky spojí jako bajty (`Buffer.concat`) a na text se převádí až celek.
:::

Zkus si to: přidej řádek `console.log(decoder.decode(bytes))` a porovnej výsledek.

:::check
Proč kód na čtení těla nepíše v cyklu rovnou `body += piece.toString('utf8')`?

### --answer--
Protože `Buffer` a řetězec nejde spojit operátorem `+`.

#### --why--
Myslíš si, že to skončí chybou? Nespadne to — `Buffer` se na text převést dá. Problém
je v tom, kdy se převádí.

### --correct--
Znak zapsaný víc bajty se může rozdělit mezi dva kousky a převod po kouscích by ho rozbil.

#### --why--
Převod na text musí dostat celé sekvence bajtů. Spojit bajty a převést celek je
jediné bezpečné pořadí.

### --answer--
Protože `for await` smí do pole jen přidávat, ne spojovat řetězce.

#### --why--
Myslíš si, že `for await` omezuje, co se v těle cyklu děje? Tělo cyklu je obyčejný kód.
:::

## Jedna odpověď na každý požadavek

Odpověď se dá poslat **jen jednou**. Když kód po odeslání pokračuje, dojde na druhé
`writeHead` — a to v Node vyhodí výjimku:

:::live node predict
```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('pong');
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Nenalezeno');
});

server.listen(3000);
```
--question-- Klient pošle `GET /api/ping` a vzápětí ještě jednou. Co dostane?
--option-- Na oba požadavky `pong`.
--option-- Na oba požadavky `Nenalezeno`, protože druhá odpověď přepíše první.
--option*-- Na první `pong`, pak server spadne a na druhý neodpoví nikdo.
--output--
```text
node:_http_server:411
    throw new ERR_HTTP_HEADERS_SENT('write');
    ^

Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent to the client
    at ServerResponse.writeHead (node:_http_server:411:11)
    at Server.<anonymous> (file:///home/jana/server.js:8:7) {
  code: 'ERR_HTTP_HEADERS_SENT'
}

Node.js v26.5.1
```
--why-- První odpověď odejde celá. Pak kód pokračuje za `if`, zavolá druhé `writeHead` na už odeslané odpovědi a Node vyhodí `ERR_HTTP_HEADERS_SENT`. Nezachycená výjimka ukončí proces, a tím server všem.
:::

Zkus si to u sebe: spusť server a pošli dvakrát `curl -i http://localhost:3000/api/ping`.
Pak přidej `return` před `res.end('pong')`, restartuj server a porovnej.

Oprava je `return`, který handler po odeslání odpovědi ukončí — třeba
`return sendJson(res, 200, books);`. Stejný vzor platí pro každou větev, která odpovídá.

:::check
V handleru je `if (!book) { sendJson(res, 404, { error: 'Nenalezeno.' }); }` a hned pod ním `sendJson(res, 200, book);`. Co je potřeba doplnit, aby server na neexistující knihu nespadl? Napiš jedno klíčové slovo.

### --expected--
return

### --why--
`return` před prvním `sendJson` (nebo hned za ním) handler ukončí, takže se druhá
odpověď už nepokusí odejít.
:::

## Typické chyby a pasti

> [!PITFALL] `Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent to the client`
> Kód po odeslání odpovědi pokračuje a posílá další. Server odpoví jednou a spadne.
> **Oprava:** `return` před každým `sendJson` / `res.end` ve větvi.

> [!PITFALL] Klient čeká a nic nepřijde
> Handler nikdy nezavolal `res.end()` — třeba ve větvi, na kterou jsi zapomněl.
> `curl` visí, `fetch` skončí až po časovém limitu. **Oprava:** každá cesta handlerem
> končí odpovědí, i ta pro neznámou adresu (`404`).

> [!PITFALL] `TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string…`
> Do `res.end` jsi dal objekt. **Oprava:** `res.end(JSON.stringify(data))`.

> [!PITFALL] Adresa s parametrem vrací `404`
> `req.url === '/api/books'` nesedí na `/api/books?sort=title`. **Oprava:** porovnávej
> `new URL(req.url, 'http://localhost').pathname`.

> [!PITFALL] Rozbitý JSON v těle shodí server
> `JSON.parse` na useknutém těle vyhodí `SyntaxError: Unexpected end of JSON input`,
> v handleru ji nikdo nechytí a proces skončí pro všechny. **Oprava:** `try`/`catch`
> kolem `JSON.parse` a v `catch` odpověď `400`.

> [!PITFALL] Id z adresy nikdy nenajde záznam
> `pathname.slice(…)` vrací řetězec `'2'`, ale v datech je číslo `2` a `'2' === 2` je
> `false`. Detail pak vrací vždy `404`. **Oprava:** `Number(…)` před porovnáním.

> [!PITFALL] Rozsypané české znaky v těle (`Karel ��apek`)
> Kousky těla se převáděly na text každý zvlášť. **Oprava:** `Buffer.concat(kousky)`
> a až potom `.toString('utf8')`.

> [!TIP]
> Odpovědi serveru nejrychleji prozkoumáš přes `curl -i adresa`: přepínač `-i`
> vypíše i stavový kód a hlavičky. V krocích s Node máš v Akademii pod výstupem panel
> HTTP klienta, který ukáže totéž.

:::check
Detail knihy `GET /api/books/2` vrací vždycky `404`, i když kniha s `id: 2` v datech je. V kódu je `const id = pathname.slice('/api/books/'.length);` a `books.find((book) => book.id === id)`. Co je špatně?

### --answer--
`slice` odřízne špatný počet znaků, `id` je `'/2'`.

#### --why--
Myslíš si, že chyba je v délce? `'/api/books/'.length` odřízne přesně prefix
i s lomítkem, zbyde `'2'`.

### --correct--
`id` je řetězec `'2'`, ale v datech je číslo — a striktní porovnání `===` mezi nimi vrátí `false`.

#### --why--
Všechno z adresy je text. Převeď id přes `Number(…)` dřív, než ho porovnáš s daty.

### --answer--
`find` na poli objektů nefunguje, je potřeba `filter`.

#### --why--
Myslíš si, že `find` umí jen čísla a řetězce? Callback dostane každý objekt a `find`
vrátí první, pro který callback vrátí `true`.
:::

## Kde to najdeš v MDN

- [An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) —
  jak vypadá požadavek a odpověď, metody, hlavičky a tělo.
- [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) —
  seznam všech stavových kódů s vysvětlením, kdy který použít.
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type) —
  typ dat a `charset` v hlavičce.
- [URL: searchParams](https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams) —
  čtení parametrů z query stringu.

> [!NOTE]
> Objekty `req` a `res` popisuje dokumentace Node v modulu
> [http](https://nodejs.org/api/http.html) (`IncomingMessage` a `ServerResponse`).

# --questions--

## --question--

Klient pošle `GET /api/books?author=Karel%20%C4%8Capek`. Jakou hodnotu má v handleru `req.url`?

### --answer--

`'http://localhost:3000/api/books?author=Karel Čapek'`

#### --why--

Myslíš si, že `req.url` je celá adresa z prohlížeče? Protokol ani doménu v něm
nenajdeš, proto `new URL` potřebuje základ adresy.

### --answer--

`'/api/books'`

#### --why--

Myslíš si, že Node query string odřízne sám? To dělá až `pathname` z objektu `URL`.

### --correct--

`'/api/books?author=Karel%20%C4%8Capek'`

#### --why--

`req.url` je cesta i s query stringem, tak jak přišla — ještě nedekódovaná.
Dekódovanou hodnotu dá až `searchParams.get('author')`.

### --see--

node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

## --question--

Server na `PUT /api/books` odpoví `405`. Jak se jmenuje hlavička, ve které klientovi
řekne, jaké metody tahle adresa umí?

### --expected-- ignore-case

Allow

### --why--

`405 Method Not Allowed` znamená „adresa existuje, jen tuhle metodu neumí". Hlavička
`Allow` (třeba `Allow: GET, POST`) klientovi řekne, co zkusit místo toho.

### --see--

node-zaklady/http-v-node#stavove-kody

## --question--

Kolega tvrdí, že na neexistující knihu stačí poslat `200` a tělo `null`, „frontend si
to zkontroluje". Proč je `404` lepší?

### --answer--

`200` s tělem `null` nejde v Node poslat.

#### --why--

Myslíš si, že `null` nejde převést na JSON? `JSON.stringify(null)` je `'null'` a pošle
se bez problémů.

### --correct--

Stavový kód je první věc, kterou klient čte; `200` tvrdí, že všechno proběhlo, a chyba
se projeví až rozbitým zobrazením.

#### --why--

Kód `404` klient zpracuje na jednom místě (`if (!response.ok)`), aniž by musel znát
tvar dat každé odpovědi.

### --answer--

`404` je rychlejší, protože nemá tělo.

#### --why--

Myslíš si, že jde o rychlost? `404` tělo mít může (třeba `{ "error": "…" }`) a o rychlost
tu nejde vůbec.

### --see--

node-zaklady/http-v-node#stavove-kody

## --question--

Jakým stavovým kódem odpovíš na úspěšné `DELETE /api/books/3`, když odpověď nemá
žádné tělo? Napiš číslo.

### --expected--

204

### --accept--

204 No Content

### --why--

`204 No Content` znamená „hotovo, a nic dalšího ti neposílám". Odpověď `204` tělo nemá,
a tak nepotřebuje ani hlavičku `Content-Type` — Node by tělo stejně neposlal.

### --see--

node-zaklady/http-v-node#stavove-kody
