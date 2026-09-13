## --term-- běhové prostředí

en: runtime
aliases: běhového prostředí, běhovém prostředí, běhovým prostředím
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Node.js
lekce: node-zaklady/co-je-node#co-node-je

Program, který spouští kód napsaný v nějakém jazyce a dává mu k dispozici svět kolem.
Node.js je běhové prostředí pro JavaScript mimo prohlížeč: engine V8, standardní
knihovna a smyčka událostí.

## --term-- vestavěný modul

en: built-in module
aliases: vestavěného modulu, vestavěné moduly, vestavěných modulů, vestavěným modulem
lekce: node-zaklady/co-je-node#moduly-v-node

Modul, který je součástí Node a nic se neinstaluje, třeba `node:fs`, `node:http` nebo
`node:crypto`. Importuje se s předponou `node:`.

## --term-- CommonJS

en: CommonJS
lekce: node-zaklady/co-je-node#moduly-v-node

Původní modulový systém Node se zápisem `require()` a `module.exports`. V nových
projektech ho nahrazují ES moduly (`import`/`export`), v cizím kódu ho ale potkáš.

## --term-- proměnná prostředí

en: environment variable
aliases: proměnné prostředí, proměnnou prostředí, proměnných prostředí, proměnnými prostředí
lekce: node-zaklady/co-je-node#process-program-a-svet-kolem-nej

Nastavení, které programu předá ten, kdo ho spouští (`PORT=8080 node server.js`).
V Node je v objektu `process.env` a hodnota je **vždycky řetězec**.

## --term-- pracovní složka

en: current working directory
aliases: pracovní složky, pracovní složku, pracovní složce
lekce: node-zaklady/co-je-node#process-program-a-svet-kolem-nej

Složka, ze které byl program spuštěn — vrací ji `process.cwd()`. Od ní se počítají
relativní cesty k souborům, ne od souboru s kódem.

## --term-- Buffer

en: Buffer
aliases: Bufferu, Bufferem
lekce: node-zaklady/co-je-node#soubory-node-fs-promises

Objekt Node se surovými bajty. Vrací ho `readFile` bez kódování a přicházejí v něm
kousky těla požadavku; na text ho převede `.toString('utf8')`.

## --term-- handler

en: request handler
aliases: handleru, handlerem, handlery
lekce: node-zaklady/http-v-node#pozadavek-a-odpoved

Funkce `(req, res) => { … }`, kterou dostane `createServer`. Node ji zavolá pro každý
příchozí požadavek zvlášť; z `req` čte, do `res` posílá odpověď.

## --term-- REST API

en: REST API
aliases: RESTové API, REST
mdn: https://developer.mozilla.org/en-US/docs/Glossary/REST
lekce: node-zaklady/http-v-node#pozadavek-a-odpoved

Styl HTTP API, ve kterém adresa označuje věc (`/api/books/3`) a metoda říká, co s ní
udělat (`GET` přečíst, `POST` vytvořit, `DELETE` smazat).

## --term-- stavový kód

en: status code
aliases: stavového kódu, stavovým kódem, stavové kódy, stavových kódů, stavovými kódy
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
lekce: node-zaklady/http-v-node#stavove-kody

Trojmístné číslo na začátku HTTP odpovědi, které říká, jak požadavek dopadl:
`2xx` povedlo se, `4xx` chyba v požadavku, `5xx` chyba serveru.

## --term-- HTTP hlavička

en: HTTP header
aliases: HTTP hlavičky, HTTP hlavičku, HTTP hlavičkou, HTTP hlaviček
mdn: https://developer.mozilla.org/en-US/docs/Glossary/HTTP_header
lekce: node-zaklady/http-v-node#hlavicky-a-content-type

Dvojice `Jméno: hodnota` v požadavku nebo odpovědi, která popisuje přenášená data,
třeba `Content-Type: application/json; charset=utf-8`. Jména nerozlišují velikost písmen.

## --term-- routování

en: routing
aliases: routováním, routovat
lekce: node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

Rozhodování, který kód obslouží požadavek podle jeho cesty a metody. V čistém Node
je to řada `if` nad `pathname` a `req.method`.

## --term-- query string

en: query string
aliases: query stringu, query stringem
mdn: https://developer.mozilla.org/en-US/docs/Web/API/URL/search
lekce: node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

Část adresy za otazníkem s parametry `klíč=hodnota` (`?author=Karel&limit=2`).
V Node ji přečteš přes `new URL(req.url, 'http://localhost').searchParams`.

## --term-- parametr cesty

en: path parameter
aliases: parametru cesty, parametrem cesty, parametry cesty
lekce: node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

Proměnná část cesty, třeba id v `/api/books/2`. Z adresy je to vždycky text, na číslo
ho musíš převést sám.

## --term-- tělo požadavku

en: request body
aliases: těla požadavku, tělem požadavku, tělu požadavku
lekce: node-zaklady/http-v-node#telo-pozadavku-je-proud

Data, která klient posílá spolu s požadavkem, typicky JSON u `POST`. V Node přichází
jako proud kousků a musíš ho přečíst celý.

## --term-- proud

en: stream
aliases: proudu, proudem, proudy
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts
lekce: node-zaklady/http-v-node#telo-pozadavku-je-proud

Data, která nepřijdou najednou, ale postupně po kouscích. Objekt `req` v Node je proud
a čte se cyklem `for await…of`.
