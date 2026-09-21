# HTTP do hloubky

:::check pretest
Frontend poslal `DELETE /api/loans/7` a těsně před odpovědí mu spadla wi-fi. Neví, jestli se výpůjčka smazala. Smí stejný požadavek poslat znovu?

### --answer--
Ne, výpůjčka by se smazala dvakrát.

#### --why--
Smazat už smazanou věc nejde. Druhý pokus nemůže udělat víc škody než první, a právě na tom stojí odpověď.

### --correct--
Ano, druhý `DELETE` na stav serveru nic dalšího nezmění.

#### --why--
`DELETE` je idempotentní: jedno i pět stejných volání nechá server ve stejném stavu. Proč na tom záleží, ukáže první část lekce.

### --answer--
Jen když první pokus vrátil `500`.

#### --why--
Klient odpověď vůbec nedostal, takže podle kódu rozhodovat nemůže. Rozhoduje, co metoda slibuje.
:::

V [HTTP serveru v Node](see:node-zaklady/http-v-node#stavove-kody) jsi používal sedm stavových kódů a čtyři metody. Na skutečném API, se kterým bude mluvit tvoje React aplikace, se rozhoduje jemněji: smí prohlížeč požadavek zopakovat? Je kniha, která je už vypůjčená, chyba klienta, nebo serveru? Jak frontend pozná, kde najde právě vytvořený záznam? Na tyhle otázky se ptají i na pohovoru na backend.

> [!REMEMBER]
> **Metoda je slib, co požadavek se serverem udělá. Stavový kód je odpověď, jak to dopadlo a kdo má co opravit.**

## Metody: bezpečné a idempotentní

Každá metoda nese dvě vlastnosti, na které spoléhají prohlížeče, proxy servery i knihovny pro volání API:

- [[bezpečná metoda|Bezpečná]] (*safe*) metoda stav serveru **nemění**, jen čte.
- [[idempotentní metoda|Idempotentní]] (*idempotent*) metoda má po jednom i po deseti stejných voláních **stejný účinek** na stav serveru.

| metoda | k čemu | bezpečná | idempotentní |
|---|---|---|---|
| `GET` | přečti zdroj | ano | ano |
| `HEAD` | jako `GET`, ale jen hlavičky | ano | ano |
| `OPTIONS` | co adresa umí (preflight, lekce o CORS) | ano | ano |
| `PUT` | nahraď zdroj celým novým obsahem | ne | ano |
| `DELETE` | smaž zdroj | ne | ano |
| `POST` | vytvoř nový zdroj nebo spusť akci | ne | ne |
| `PATCH` | změň část zdroje | ne | není zaručená |

Proč na tom záleží: prohlížeč a knihovny zkoušejí bezpečné a idempotentní požadavky při výpadku spojení zopakovat samy. Náhled odkazu v chatu nebo prohlížeč, který si odkazy předem načítá, pošle `GET` bez ptaní. Kdyby `GET /api/loans/7/return` knihu vracel, vrátí ji i robot, který si odkaz jen prohlédl. A dvakrát odeslaný `POST /api/orders` jsou dvě objednávky, proto se u plateb tlačítko po kliknutí zamyká.

Idempotence mluví o **stavu serveru, ne o odpovědi**. Zkus předpovědět, co vrátí dvakrát stejné smazání:

:::live js predict
```js
const loans = new Map([[7, { reader: 'Jana Dvořáková' }]]);

function deleteLoan(id) {
  const existed = loans.delete(id);
  return existed ? 204 : 404;
}

console.log(deleteLoan(7));
console.log(deleteLoan(7));
```
--question-- Co vypíšou oba řádky `console.log`?
--expected--
```text
204
404
```
--why-- První volání výpůjčku smaže (`204`), druhé už nic nenajde (`404`). Odpovědi se liší, a přesto je `DELETE` idempotentní: po prvním i po druhém volání je stav stejný, výpůjčka 7 neexistuje. Zkus místo druhého smazání zavolat funkci, která přidá výpůjčku s novým id, dvakrát za sebou. Stav se pak po každém volání liší, to je `POST`.
:::

:::check
Která adresa porušuje slib bezpečné metody?

### --answer--
`GET /api/books?genre=humor&sort=title`

#### --why--
Filtr a řazení jen vybírají, co se přečte. Na serveru se nic nezmění, ať požadavek pošleš jednou, nebo stokrát.

### --correct--
`GET /api/newsletter/unsubscribe?email=eva@example.cz`

#### --why--
Odhlášení mění stav. Poštovní klient, který si odkazy v e-mailu předem kontroluje, tě odhlásí dřív, než na odkaz klikneš. Patří na to `POST` nebo `DELETE`.

### --answer--
`HEAD /api/books/3`

#### --why--
`HEAD` je `GET` bez těla. Klient se jen ptá na hlavičky, třeba jestli zdroj existuje.
:::

## Stavové kódy po skupinách

První číslice říká, **kdo je na tahu**. Z `node-zaklady` znáš `200`, `201`, `204`, `400`, `404`, `405` a `500`. Tohle jsou kódy, které potkáš v každém větším API:

| kód | kdy | co k němu patří |
|---|---|---|
| `200 OK` | povedlo se, v těle jsou data | |
| `201 Created` | vznikl nový zdroj | hlavička `Location` s adresou nového zdroje, v těle zdroj s id |
| `204 No Content` | povedlo se, nic se nevrací (smazání) | žádné tělo |
| `304 Not Modified` | data se od minula nezměnila | lekce o cache |
| `400 Bad Request` | požadavku nejde rozumět: rozbitý JSON, `page=abc` | |
| `401 Unauthorized` | nevím, kdo jsi: chybí nebo neplatí přihlášení | |
| `403 Forbidden` | vím, kdo jsi, ale tohle nesmíš | |
| `404 Not Found` | takový zdroj není | |
| `405 Method Not Allowed` | adresa existuje, metoda ne | hlavička `Allow: GET, DELETE` |
| `409 Conflict` | požadavek je v pořádku, ale střetne se s aktuálním stavem | |
| `413 Content Too Large` | tělo je větší, než server přijme | |
| `415 Unsupported Media Type` | tělo je v typu, který server nečte (`text/plain` místo JSON) | |
| `422 Unprocessable Content` | JSON je v pořádku, data porušují pravidla | |
| `429 Too Many Requests` | klient posílá moc požadavků | hlavička `Retry-After` |
| `500 Internal Server Error` | rozbil se server | |
| `503 Service Unavailable` | server je dočasně mimo (údržba, přetížení) | |

Tři dvojice, u kterých se chybuje nejčastěji:

- ==`400`== × ==`422`==: `400` znamená „nerozumím", `422` „rozumím, ale takhle ne". `{"bookId": 3` bez závorky je `400`, `{"bookId": "tři"}` je `422`. Některá API dávají na obojí `400`, důležité je držet se jednoho pravidla v celém API.
- `401` × `403`: nepřihlášený uživatel dostane `401`, přihlášený čtenář, který chce smazat cizí výpůjčku, `403`. Jak přihlášení funguje, přijde až v samostatné sekci o autentizaci.
- `422` × `409`: `422` je chyba v datech, kterou klient opraví ve formuláři. `409` je střet se stavem, stejný požadavek může projít později, třeba až někdo knihu vrátí.

:::check
Čtenář chce prodloužit výpůjčku, ale poslal `{"dueDate": "31. 2. 2026"}`. JSON je platný, jen datum nedává smysl. Jaký kód vrátíš?

### --expected--
422

### --accept--
422 Unprocessable Content
400

### --why--
Požadavku jde rozumět (platný JSON), ale data porušují pravidla, to je `422`. Když API rozlišování `400` a `422` nepoužívá a na obojí vrací `400`, je to taky v pořádku, pokud to dělá všude stejně.
:::

:::check
Přihlášený knihovník poslal `DELETE /api/readers/5`, ale mazat čtenáře smí jen vedoucí pobočky. Jaký kód vrátíš?

### --answer--
`401`

#### --why--
`401` říká „nevím, kdo jsi, přihlas se". Knihovník přihlášený je a nové přihlášení nic nezmění.

### --correct--
`403`

#### --why--
Server ví, kdo požadavek poslal, a tahle osoba akci provést nesmí.

### --answer--
`405`

#### --why--
`405` popisuje adresu, která metodu neumí vůbec, pro nikoho. Tady `DELETE` funguje, jen ne pro každého.
:::

## Hlavičky, které API potřebuje

Hlavičky jsou popis požadavku a odpovědi. Jejich jména nerozlišují velká a malá písmena. Pro API stačí znát tyhle:

| hlavička | kde | co říká |
|---|---|---|
| `Content-Type` | požadavek i odpověď | v jakém formátu je tělo: `application/json; charset=utf-8` |
| `Accept` | požadavek | jaký formát odpovědi klient chce |
| `Authorization` | požadavek | kdo požadavek posílá (token) |
| `Location` | odpověď `201` | adresa nově vytvořeného zdroje |
| `Allow` | odpověď `405` | které metody adresa umí |
| `Retry-After` | odpověď `429`, `503` | za kolik sekund to zkusit znovu |
| `Cache-Control`, `ETag` | odpověď | jak dlouho a za jakých podmínek smí klient odpověď znovu použít (lekce o cache) |
| `Origin`, `Access-Control-Allow-Origin` | požadavek, odpověď | ze kterého webu požadavek přišel a jestli ho smí číst (lekce o CORS) |

> [!NOTE]
> HTTP/2 a HTTP/3 mění, jak se zprávy přenášejí (binárně, víc požadavků jedním spojením, u HTTP/3 přes protokol QUIC), ne co znamenají. Metody, kódy i hlavičky zůstávají stejné, jen jména hlaviček se posílají vždy malými písmeny.

:::check
Server právě založil výpůjčku s id 12. Jak se jmenuje hlavička, ze které klient zjistí její adresu?

### --expected-- ignore-case
Location

### --why--
`Location: /api/loans/12` ušetří klientovi skládání adresy. Když se tvar adres jednou změní, klient, který čte `Location`, se nerozbije.
:::

## Požadavek z terminálu: curl

Panel HTTP klienta v Akademii nebo rozšíření ve VS Code jsou pohodlné. `curl` je ale na každém serveru a každý návod k API ho používá, proto ho musíš umět přečíst i napsat. Čtyři přepínače pokryjí skoro všechno:

| přepínač | co udělá |
|---|---|
| `-i` | vypíše i stavový řádek a hlavičky odpovědi |
| `-X METODA` | pošle jinou metodu než `GET` |
| `-H 'Jméno: hodnota'` | přidá hlavičku požadavku |
| `-d 'tělo'` | pošle tělo (a sám přepne metodu na `POST`) |

```sh
curl -i -X POST http://localhost:3000/api/loans \
  -H 'Content-Type: application/json' \
  -d '{"bookId": 3, "reader": "Eva Malá"}'
```

```text
HTTP/1.1 201 Created
Location: /api/loans/3
Content-Type: application/json; charset=utf-8
Content-Length: 69

{"id":3,"bookId":3,"reader":"Eva Malá","dueDate":"2026-10-14"}
```

Bez `-i` bys viděl jen tělo a o `201` ani `Location` by ses nedozvěděl. Zpětné lomítko na konci řádku jen pokračuje příkaz na dalším řádku.

> [!PITFALL]
> `curl -d '{"bookId": 3}' http://localhost:3000/api/loans` **bez** `-H 'Content-Type: application/json'` pošle hlavičku `Content-Type: application/x-www-form-urlencoded`, jako by odesílal HTML formulář. Server, který kontroluje typ těla, odpoví `415`, a Express bez té hlavičky tělo vůbec nepřečte a v `req.body` najdeš `undefined`. Oprava: hlavičku vždy přidej, nebo v novém curl použij `--json '{"bookId": 3}'`, který ji nastaví sám.

:::check
Jakým přepínačem curl ukážeš stavový kód a hlavičky odpovědi?

### --expected--
-i

### --accept--
--include
-v

### --why--
`-i` (`--include`) přidá stavový řádek a hlavičky odpovědi před tělo. `-v` ukáže navíc i hlavičky požadavku, hodí se, když nevíš, co curl vlastně poslal.
:::

## Automatický test API

curl ověří API jednou, teď. Za týden přidáš nové pole, rozbiješ stavový kód a nikdo si toho nevšimne. Automatický test pošle stejné požadavky při každém spuštění. Node má testovací běhoun vestavěný, stačí `node:test` a `node:assert`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL;

test('neznámý žánr vrátí 200 a prázdná data', async () => {
  const res = await fetch(`${baseUrl}/api/books?genre=poezie`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.data, []);
});
```

Server spustíš v jednom terminálu a testy ve druhém:

```sh
API_URL=http://localhost:3000 node --test books.test.js
```

Test API kontroluje **stavový kód, důležité hlavičky i tělo**. Klient se rozhoduje podle kódu, a kdyby server vrátil `500` s tělem `{"data": []}`, test, který čte jen tělo, projde.

:::check
Kolega píše test na smazání výpůjčky a kontroluje jen, že odpověď nemá tělo. Proč to nestačí?

### --answer--
Protože `DELETE` musí vždycky vracet tělo se smazaným záznamem.

#### --why--
Tělo po smazání být může i nemusí. Problém testu je jinde: prázdné tělo vrátí i odpověď, která se nepovedla.

### --correct--
Prázdné tělo může mít i odpověď `404` nebo `500`. Test musí ověřit stav `204` a že výpůjčka opravdu zmizela.

#### --why--
Stav je to první, co čte klient. A to, že smazání opravdu proběhlo, ověří až další požadavek `GET`, který vrátí `404`.

### --answer--
Nestačí, protože testy API musí běžet v prohlížeči.

#### --why--
Test API je obyčejný program, který posílá HTTP požadavky. Běží v Node stejně dobře jako curl.
:::

:::explain
Vysvětli vlastními slovy, proč je podstatné, jestli je metoda idempotentní — když klient
požadavek pošle dvakrát.

## --model--
Po síti se ztrácejí odpovědi, ne jen požadavky. Klient, který nedostal odpověď, neví,
jestli server nic neudělal, nebo udělal všechno a odpověď se ztratila cestou. Jediná
bezpečná reakce je požadavek zopakovat — a právě tady rozhoduje idempotence. U `GET`,
`PUT` a `DELETE` má druhé odeslání stejný výsledek jako první, takže opakování nic
nepokazí. `POST` takový slib nedává: dvakrát odeslaná objednávka může být dvě
objednávky. Proto se u něj zavádí klíč požadavku, podle kterého server pozná opakování.

## --checklist--
- Při výpadku se může ztratit i odpověď, nejen požadavek.
- Klient pak neví, jestli se akce provedla.
- U idempotentní metody opakování nic nezmění.
- `POST` opakovat bez pojistky nejde.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Chyba se stavem `200`.** Server na neexistující knihu vrátí `200` a `{"error": "Kniha nenalezena"}`. Ve frontendu je `response.ok` `true`, kód pokračuje, vykreslí prázdnou kartu a v konzoli se objeví `TypeError: Cannot read properties of undefined (reading 'title')`. Oprava: chyby vracej s kódem `4xx` nebo `5xx`, jak se to naučil [fetch v js-async](see:js-async/fetch#404-a-500-nejsou-pro-fetch-chyba).

> [!PITFALL]
> **Změna stavu přes `GET`.** Odkaz `GET /api/loans/7/return` v e-mailu vrátí knihu ve chvíli, kdy poštovní služba odkaz zkontroluje na viry. Oprava: vrácení je `DELETE /api/loans/7` nebo `POST`, `GET` nikdy nic nemění.

> [!PITFALL]
> **`500` na chybu klienta.** `JSON.parse` na rozbitém těle vyhodí výjimku, obecný `catch` z ní udělá `500` a frontend začne požadavek zkoušet znovu, protože čeká, že se server vzpamatuje. Oprava: vadný vstup zachyť a vrať `400`.

> [!PITFALL]
> **`201` bez `Location`.** Frontend po vytvoření potřebuje přejít na detail a adresu si skládá sám: `'/api/loan/' + id`. Překlep v jednotném čísle vrátí `404` a hledá se chyba na serveru. Oprava: posílej `Location` a čti ji.

:::check
Server na `GET /api/books/99` (kniha neexistuje) vrací `200` a `{"error": "Kniha nenalezena"}`. Co se stane ve frontendu, který kontroluje `if (!response.ok) throw …`?

### --answer--
`fetch` vyhodí výjimku a frontend ukáže chybu.

#### --why--
`fetch` výjimku při odpovědi `4xx` ani `200` nevyhazuje. A `response.ok` je tady `true`.

### --correct--
Kontrola projde, protože `response.ok` je `true`, a frontend zkusí vykreslit knihu z objektu s chybou.

#### --why--
`response.ok` se řídí jen stavovým kódem (200–299). Server tvrdí, že všechno proběhlo, takže kód pokračuje jako u úspěchu.

### --answer--
Prohlížeč sám pozná klíč `error` a vrátí `404`.

#### --why--
Prohlížeč tělo odpovědi nijak nevykládá. Kód si určuje jen server.
:::

## Kde to najdeš v MDN

- [HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods) — všechny metody s tabulkou „Safe" a „Idempotent" u každé z nich.
- [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) — seznam kódů po skupinách, u každého kdy ho poslat.
- [Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent) — krátká definice s příklady `DELETE` a `POST`.
- [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers) — přehled hlaviček; `Location`, `Allow` a `Retry-After` tam najdeš podle jména.

# --questions--

## --question--

Platební brána dostane `POST /api/payments` s částkou 1 290 Kč a spojení vypadne dřív, než přijde odpověď. Proč knihovna pro volání API tenhle požadavek sama nezopakuje, kdežto `PUT /api/readers/5/address` ano?

### --answer--
`POST` je pomalejší než `PUT`, takže by opakování trvalo dlouho.

#### --why--
Rychlost s tím nesouvisí. Rozhoduje, co se stane se stavem serveru, když požadavek dorazí dvakrát.

### --correct--
`POST` není idempotentní: dvakrát odeslaná platba může být dvě platby. `PUT` adresu podruhé jen přepíše stejnou hodnotou.

#### --why--
Knihovny smí automaticky opakovat jen požadavky, u kterých opakování nic nepokazí.

### --answer--
`PUT` je bezpečná metoda, takže nic nemění.

#### --why--
`PUT` stav mění, nahrazuje zdroj. Bezpečné jsou jen metody, které čtou, třeba `GET` a `HEAD`.

### --see--
api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

## --question--

Registrace čtenáře dostane e-mail, se kterým už účet existuje. Formát e-mailu je správný. Napiš číslo stavového kódu, který vrátíš.

### --expected--
409

### --accept--
409 Conflict

### --why--
Data jsou platná, jen se střetávají s tím, co už na serveru je. `422` by frontend vyložil jako chybně vyplněné pole.

### --see--
api-http-rest/http-do-hloubky#stavove-kody-po-skupinach

## --question--

Napiš příkaz curl, který pošle `DELETE` na `http://localhost:3000/api/loans/3` a vypíše stavový řádek i hlavičky odpovědi.

### --expected--
curl -i -X DELETE http://localhost:3000/api/loans/3

### --accept--
curl -X DELETE -i http://localhost:3000/api/loans/3
curl -i -X DELETE localhost:3000/api/loans/3
curl -X DELETE -i localhost:3000/api/loans/3
curl --include -X DELETE http://localhost:3000/api/loans/3
curl -i --request DELETE http://localhost:3000/api/loans/3

### --why--
`-X DELETE` změní metodu, `-i` přidá stavový řádek a hlavičky. Bez `-i` bys u odpovědi `204` neviděl vůbec nic.

### --see--
api-http-rest/http-do-hloubky#pozadavek-z-terminalu-curl
