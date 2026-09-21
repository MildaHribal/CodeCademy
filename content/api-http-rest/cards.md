## --card-- free

Jaký je rozdíl mezi GET a POST metodou?

### --back--

`GET` je bezpečná metoda pro čtení dat. Zůstává v historii a jde cachovat. `POST` se používá k vytvoření nového zdroje, mění stav serveru a nelze ho cachovat ani jednoduše opakovat.

### --see--

api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

## --card-- free

Které HTTP metody jsou idempotentní a co to znamená?

### --back--

Idempotentní metoda znamená, že opakované volání se stejnými daty zanechá server ve stejném stavu jako jedno volání. Patří sem `GET`, `PUT` a `DELETE`. (`POST` a `PATCH` obecně ne).

### --see--

api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

## --card-- output

Jaký HTTP stavový kód vrátíš, když klient odešle neplatná data (např. chybí povinné pole)?

### --expected--

400
### --accept--
400 Bad Request
422
422 Unprocessable Entity

### --see--

api-http-rest/http-do-hloubky#stavove-kody-po-skupinach

## --card-- output

Co vypíše tenhle kód?

```js
const loans = new Map([[7, { reader: 'Eva Malá' }]]);

function deleteLoan(id) {
  return loans.delete(id) ? 204 : 404;
}

console.log(deleteLoan(7));
console.log(deleteLoan(7));
console.log(loans.size);
```

### --expected--

204
404
0

### --why--

Odpovědi se liší, a přesto je `DELETE` idempotentní. Idempotence mluví o stavu serveru, ne o odpovědi: po prvním i po druhém volání výpůjčka 7 neexistuje.

### --see--

api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

## --card-- output

Přihlášený knihovník poslal `DELETE /api/readers/5`, ale mazat čtenáře smí jen vedoucí pobočky. Napiš číslo stavového kódu, který vrátíš.

### --expected--

403

### --accept--

403 Forbidden

### --why--

Server ví, kdo požadavek poslal, a ta osoba akci provést nesmí. `401` by znamenalo „nevím, kdo jsi, přihlas se" — a nové přihlášení by tady nic nezměnilo.

### --see--

api-http-rest/http-do-hloubky#stavove-kody-po-skupinach

## --card-- free

Kdy vrátíš `400`, kdy `422` a kdy `409`?

### --back--

- `400` — požadavku **nejde rozumět**: rozbitý JSON, `page=abc`, prázdné tělo.
- `422` — rozumím, ale **data porušují pravidla**: `bookId: "tři"`, prázdné jméno. Klient to opraví ve formuláři.
- `409` — data jsou v pořádku, jen se **střetnou se stavem**: e-mail už existuje, kniha je právě vypůjčená. Stejný požadavek může projít později.

Některá API na první dvě situace vracejí jen `400`. To je v pořádku, dokud to dělají všude stejně.

### --see--

api-http-rest/http-do-hloubky#stavove-kody-po-skupinach

## --card-- output

Server právě založil výpůjčku s id 12. Napiš jméno hlavičky, ze které klient zjistí její adresu.

### --expected--

Location

### --accept--

location

### --why--

[[hlavička Location]] ušetří klientovi skládání adresy. Když se tvar adres jednou změní, klient, který ji čte, se nerozbije.

### --see--

api-http-rest/http-do-hloubky#hlavicky-ktere-api-potrebuje

## --card-- free

Napiš z hlavy příkaz [[curl]], který pošle `POST` na `http://localhost:3000/api/loans` s JSON tělem, a řekni, který přepínač přidáš, abys viděl stavový kód.

### --back--

```sh
curl -i -X POST http://localhost:3000/api/loans \
  -H 'Content-Type: application/json' \
  -d '{"bookId": 3, "reader": "Eva Malá"}'
```

`-i` (`--include`) přidá před tělo stavový řádek a hlavičky — bez něj bys o `201` ani o `Location` nevěděl. Hlavičku `Content-Type` nesmíš vynechat: bez ní curl pošle `application/x-www-form-urlencoded`, server odpoví `415` a Express nechá `req.body` prázdné. Novější curl má na totéž zkratku `--json`.

### --see--

api-http-rest/http-do-hloubky#pozadavek-z-terminalu-curl

## --card-- free

Kolega píše [[test API]] na smazání výpůjčky a kontroluje jen, že odpověď nemá tělo. Co mu chybí?

### --back--

Prázdné tělo vrátí i odpověď `404` nebo `500`, takže test projde i nad rozbitým serverem. Test má kontrolovat **stavový kód** (`204`), důležité hlavičky a pak ještě ověřit následným `GET`em, že výpůjčka opravdu zmizela (vrátí `404`). Klient se rozhoduje podle kódu, ne podle délky těla.

### --see--

api-http-rest/http-do-hloubky#automaticky-test-api

## --card-- free

Podle jakých pravidel skládáš adresy zdrojů v REST API?

### --back--

- **Podstatná jména v množném čísle**: `/api/books`, ne `/api/getBooks`.
- **Metoda říká, co se stane**, adresa jmenuje věc. Sloveso v adrese (`/api/books/3/delete`) je zdvojení.
- **Id v cestě**: `/api/books/3`, ne `/api/books?id=3`.
- **Filtr, řazení a stránka** patří do query, zdroj se jimi nemění.
- [[vnořený zdroj]] jen pro vztah „patří k": `/api/readers/5/loans`. Víc než jedna úroveň se špatně používá, výpůjčka má i vlastní adresu `/api/loans/7`.
- Akci, kterou nejde převést na zdroj, zapiš jako vytvoření něčeho: `POST /api/loans/7/reminders`.

### --see--

api-http-rest/navrh-rest#zdroje-a-adresy

## --card-- free

Co znamená, že JSON z API je [[reprezentace zdroje]], a ne řádek z databáze?

### --back--

Reprezentace je pohled na zdroj, který API vydává navenek. Smí obsahovat pole, která v tabulce nejsou (`"available": false` spočítané z výpůjček), a **nesmí** obsahovat to, co klientovi nepatří: hash hesla, interní poznámky, cizí klíče, které nikam nevedou. Díky tomu se dá schéma databáze změnit, aniž se rozbije klient.

### --see--

api-http-rest/navrh-rest#zdroje-a-adresy

## --card-- output

Co vypíše tenhle kód?

```js
const query = new URL('http://localhost/api/books?genre=sci-fi&genre=humor&page=2').searchParams;

console.log(query.getAll('genre').length);
console.log(query.get('page') + 1);
console.log(query.get('limit'));
```

### --expected--

2
21
null

### --why--

`get` vrátí jen první hodnotu opakovaného parametru, všechny dá `getAll`. Každá hodnota je **text**, takže `'2' + 1` je `'21'`. Chybějící parametr je `null`, ne `undefined`.

### --see--

api-http-rest/navrh-rest#filtry-a-razeni-v-query

## --card-- free

`GET /api/books?sort=heslo` a `GET /api/books?genre=poezie` neodpovídá nic. Co vrátíš u každého z nich?

### --back--

- `?sort=heslo` → **`400`**. Klient chtěl konkrétní pořadí a tiché ignorování by mu dalo jiné. Povolená řazení drž jako [[seznam povolených hodnot]] a ověřuj přes `Object.hasOwn`, ne přes `in` (to pustí i zděděné `constructor`).
- `?genre=poezie` → **`200`** a prázdný seznam. Seznam knih existuje, jen tomuhle výběru nic neodpovídá. `404` by frontend vyložil jako špatnou adresu.

### --see--

api-http-rest/navrh-rest#filtry-a-razeni-v-query

## --card-- free

Kdy zvolíš [[stránkování offsetem]] a kdy [[stránkování kurzorem]]?

### --back--

**Offset** (`?page=3&limit=20`) umí skočit na libovolnou stránku, takže se hodí na katalog a administraci s čísly stránek. Má ale dvě nevýhody: když během listování přibude záznam, položky se posunou a jednu uvidíš dvakrát nebo vůbec, a hluboká stránka je pomalá, protože databáze musí přeskočené řádky projít.

**Kurzor** (`?limit=20&after=…`) si pamatuje, **za kterou** položkou pokračovat. Nic se neposune a hluboká stránka je stejně rychlá jako první, zato skákat na stránku 7 nejde. Hodí se na feed, komentáře a notifikace.

### --see--

api-http-rest/navrh-rest#strankovani-offset-a-kurzor

## --card-- free

Čtenář má `{ "name": "Eva Malá", "email": "eva@example.cz", "phone": "777 123 456" }`. Co se stane s telefonem, když pošleš `PUT /api/readers/5` s tělem `{ "name": "Eva Malá", "email": "eva.mala@example.cz" }`?

### --back--

Telefon **zmizí** (nebo dostane výchozí hodnotu). `PUT` posílá celý nový stav zdroje, takže co v těle není, ve zdroji po změně není. Na změnu jednoho pole je `PATCH`, který mění jen to, co pošleš.

`PUT` je proto vždycky idempotentní. `PATCH` jen tehdy, když popisuje cílovou hodnotu: `{"dueDate": "2026-11-11"}` ano, `{"extendByDays": 14}` ne — každé zopakování prodlouží výpůjčku o další dva týdny.

### --see--

api-http-rest/navrh-rest#put-patch-a-idempotence

## --card-- output

Napiš hodnotu hlavičky `Content-Type`, kterou pošleš u chyby ve formátu Problem Details.

### --expected--

application/problem+json

### --why--

Podle typu klient pozná, že tělo nejsou běžná data, ale popis problému s klíči `title`, `status` a `detail`. Formát [[problem+json]] popisuje RFC 9457 a vlastní klíče jako `errors` se přidávat smějí.

### --see--

api-http-rest/navrh-rest#jednotny-tvar-chyb-problem-json

## --card-- free

Které změny API smíš vydat bez nové verze a které ne?

### --back--

[[zpětně kompatibilní změna|Bez nové verze]] projde všechno, čeho si starý klient nevšimne: nové pole v odpovědi, nový nepovinný parametr, nová routa.

[[rozbíjející změna|Novou verzi potřebuje]] přejmenované nebo odebrané pole, jiný typ hodnoty (`"year": "1924"` místo čísla) a nově povinný parametr. Verze bývá v cestě (`/api/v2/books`), starou vypneš, až na novou klienti přejdou.

### --see--

api-http-rest/navrh-rest#verzovani

## --card-- free

Klient pošle `{"productId": 12, "quantity": -3, "price": 1, "role": "admin"}`. Které tři chyby na serveru tohle tělo odhalí?

### --back--

1. **Záporné množství** — server musí kontrolovat rozsah, ne jen typ.
2. **Cena od klienta** — co si server umí spočítat sám (cenu, id, datum vytvoření), klient neposílá.
3. **Role v těle** — když server uloží `{ ...body }`, uživatel si připsal oprávnění. Tomu se říká [[mass assignment]].

Společné pravidlo: všechno, co přišlo po síti, je [[neověřený vstup]], a uložený objekt se skládá po klíčích z ověřených dat.

### --see--

api-http-rest/validace-a-chyby-api#nikdy-never-klientovi

## --card-- code js

Napiš funkci `pickAllowed(body, allowed)`, která z těla požadavku vrátí **nový** objekt jen s klíči ze seznamu `allowed`. Klíč, který v těle není, se do výsledku nedoplňuje.

### --seed--

```js
function pickAllowed(body, allowed) {
}
```

### --test--

```js
const body = { reader: 'Eva Malá', bookId: 3, role: 'admin' };
const result = pickAllowed(body, ['bookId', 'reader']);
assert.deepEqual(result, { bookId: 3, reader: 'Eva Malá' }, 'pickAllowed má vrátit jen povolené klíče');
assert.equal('role' in result, false, 'klíč role se do výsledku dostat nesmí');
assert.deepEqual(pickAllowed({ bookId: 3 }, ['bookId', 'reader']), { bookId: 3 }, 'chybějící klíč se nemá doplnit jako undefined');
assert.notEqual(pickAllowed(body, ['bookId']), body, 'pickAllowed má vrátit nový objekt, ne původní tělo');
```

### --solution--

```js
function pickAllowed(body, allowed) {
  const result = {};
  for (const key of allowed) {
    if (Object.hasOwn(body, key)) result[key] = body[key];
  }
  return result;
}
```

### --see--

api-http-rest/validace-a-chyby-api#nikdy-never-klientovi

## --card-- free

Proč po úspěšném `safeParse` pracuješ dál s `result.data`, a ne s `req.body`?

### --back--

[[validační schéma|Schéma]] vrací nový objekt, původní tělo nemění. `result.data` obsahuje **jen klíče ze schématu** (`role: 'admin'` v něm není, `z.object` neznámé klíče zahodí) a hodnoty už po úpravách — `trim()` odstranil mezery, `coerce` převedl text na číslo. V `req.body` je pořád všechno, co klient poslal, takže validace, po které se sáhne zpátky do těla, chrání jen napůl.

### --see--

api-http-rest/validace-a-chyby-api#schema-v-zodu-na-serveru

## --card-- output

Co vypíše tenhle kód?

```js
console.log(Number(''));
console.log(Number('abc'));
console.log(JSON.stringify({ page: Number('abc') }));
```

### --expected--

0
NaN
{"page":null}

### --why--

Proto `?limit=` projde schématem `z.coerce.number().int().min(0)` jako nula a `?page=abc` se v odpovědi objeví jako `null`. Dolní mez, která nulu vylučuje, nebo kontrola tvaru textu před převodem tomu zabrání.

### --see--

api-http-rest/validace-a-chyby-api#schema-v-zodu-na-serveru

## --card-- output

Napiš číslo stavového kódu, který vrátíš, když tělo požadavku překročí povolenou velikost.

### --expected--

413

### --accept--

413 Content Too Large
413 Payload Too Large

### --why--

[[limit velikosti těla]] se počítá v **bajtech**, ne ve znacích (`č` v UTF-8 zabere dva). Bez limitu se server pokusí držet v paměti cokoli, co mu kdokoli pošle.

### --see--

api-http-rest/validace-a-chyby-api#limit-tela

## --card-- free

Proč mají chyby opouštět server na jednom místě a co se do odpovědi nikdy nesmí dostat?

### --back--

Když má každý handler vlastní `try/catch`, jedna routa vrátí `{"error"}`, druhá `{"message"}` a třetí zapomene `catch` úplně. [[centrální zpracování chyb|Jedno místo]] pozná `HttpError` a použije jeho stav, chybu schématu převede na `422` a cokoli neznámého na `500` s obecnou zprávou.

Klientovi nepatří stack trace ani text výjimky (může obsahovat SQL i cizí data), cesty k souborům, verze knihoven ani vnitřní pole. Úplná chyba jde do logu; když k obojímu přidáš stejné id požadavku, najdeš ji podle toho, co ti uživatel nahlásí.

### --see--

api-http-rest/validace-a-chyby-api#centralni-zpracovani-chyb

## --card-- free

Proč CORS nechrání server a co ho tedy chrání?

### --back--

CORS je pravidlo, které vynucuje **prohlížeč**, aby ochránil uživatele: cizí stránka smí požadavek poslat, ale odpověď nepřečte, dokud server [[hlavička Access-Control-Allow-Origin|hlavičkou]] neřekne, že smí. curl, Postman ani jiný server žádná pravidla prohlížeče nedodržují a pošlou cokoli. Chyba CORS proto **neznamená**, že server požadavek odmítl — obvykle ho zpracoval.

Kdo smí co udělat, rozhoduje přihlášení a kontrola oprávnění na serveru. Když povolený původ vybíráš podle hlavičky `Origin`, přidej k odpovědi i [[hlavička Vary|Vary: Origin]], ať ji proxy nepodstrčí jinému webu.

### --see--

api-http-rest/cors-a-cache#cors-nechrani-server

## --card-- free

Kdy prohlížeč pošle požadavek z cizího původu rovnou a kdy se nejdřív zeptá?

### --back--

[[jednoduchý požadavek]] pošle rovnou: metoda `GET`, `HEAD` nebo `POST`, `Content-Type` jen `text/plain`, `multipart/form-data` nebo `application/x-www-form-urlencoded` a žádné vlastní hlavičky. Takový požadavek umí poslat i obyčejný HTML formulář, takže by zákaz stejně nic neřešil — prohlížeč až u odpovědi rozhodne, jestli ji skript uvidí.

Všechno ostatní (`PUT`, `PATCH`, `DELETE`, JSON tělo, hlavička `Authorization`) předchází [[preflight]]: požadavek `OPTIONS` s `Access-Control-Request-Method` a `-Headers`. Teprve když odpověď povolí metodu i hlavičky, odejde skutečný požadavek.

### --see--

api-http-rest/cors-a-cache#preflight

## --card-- output

Odpověď `GET /api/me/loans` obsahuje výpůjčky přihlášeného čtenáře a musí být vždy aktuální. Napiš hodnotu hlavičky `Cache-Control`, kterou pošleš.

### --expected--

private, no-cache

### --accept--

no-cache, private

### --why--

`private` znamená, že odpověď smí uložit jen prohlížeč toho čtenáře, ne sdílená proxy. `no-cache` v hlavičce [[Cache-Control]] neznamená „neukládej", ale „před každým použitím se zeptej". Kdyby data nesměla zůstat na disku vůbec, patří tam `no-store`.

### --see--

api-http-rest/cors-a-cache#cache-control

## --card-- output

Prohlížeč pošle `If-None-Match` se stejným ETag, jaký server právě spočítal. Napiš číslo stavového kódu odpovědi.

### --expected--

304

### --accept--

304 Not Modified

### --why--

Hlavička [[If-None-Match]] nese otisk uložené kopie. Odpověď `304 Not Modified` bez těla říká „tvoje kopie platí" a ušetří **přenos** — ne práci serveru, ten musí data načíst a otisk spočítat i tak.

### --see--

api-http-rest/cors-a-cache#etag-a-304

## --card-- code js

Napiš funkci `isIdempotent(method)`, která vrátí `true` pro idempotentní HTTP metody. Na velikosti písmen nesmí záležet.

### --seed--

```js
function isIdempotent(method) {
}
```

### --test--

```js
assert.equal(isIdempotent('GET'), true, 'GET je idempotentní');
assert.equal(isIdempotent('PUT'), true, 'PUT je idempotentní');
assert.equal(isIdempotent('delete'), true, 'DELETE je idempotentní i zapsaný malými písmeny');
assert.equal(isIdempotent('POST'), false, 'POST idempotentní není');
assert.equal(isIdempotent('PATCH'), false, 'PATCH zaručeně idempotentní není');
```

### --solution--

```js
const IDEMPOTENT = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];

function isIdempotent(method) {
  return IDEMPOTENT.includes(String(method).toUpperCase());
}
```

### --see--

api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni
