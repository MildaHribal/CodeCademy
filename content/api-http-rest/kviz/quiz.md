---
pass: 0.8
---

## --question--

Která HTTP metoda je podle specifikace **bezpečná** (nemění stav na serveru) a **idempotentní** (opakované volání má stejný výsledek)?

### --correct--

`GET`

#### --why--

`GET` slouží k vyzvednutí dat. Nemění data na serveru, a proto je bezpečná i idempotentní.

### --answer--

`POST`

#### --why--

`POST` není ani bezpečný (vytváří zdroje/mění stav), ani idempotentní (dvě volání vytvoří dva záznamy).

### --answer--

`PUT`

#### --why--

`PUT` je sice idempotentní (dvakrát nahradit stará data stejnými novými daty udělá to samé), ale není bezpečný (mění data na serveru).

### --answer--

`DELETE`

#### --why--

`DELETE` je sice idempotentní (opětovné smazání už smazaného nic dalšího nezničí), ale není bezpečný (mění data na serveru).

### --see--

api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

## --question--

Při návrhu REST API potřebuješ vytvořit endpoint pro získání recenzí ke konkrétnímu filmu. Jak by měla URL správně vypadat?

### --correct--

`/movies/:id/reviews`

#### --why--

Toto je standardní způsob pro vyjádření vztahu (recenze patřící pod určitý film).

### --answer--

`/reviews/movie/:id`

#### --why--

Konvence velí držet se struktury `kolekce/id/podkolekce`, nikoli obráceně.

### --answer--

`/get-movie-reviews?movieId=:id`

#### --why--

Do URL v REST API by se neměla dávat slovesa (jako `get`), o akci rozhoduje HTTP metoda.

### --answer--

`/movies/:id`

#### --why--

Toto je jen detail filmu, pro vnořené recenze potřebujeme další segment.

### --see--

api-http-rest/navrh-rest#zdroje-a-adresy

## --question--

Co se stane, když prohlížeč odesílá `POST` požadavek s hlavičkou `Content-Type: application/json` na API na jiné doméně?

### --correct--

Prohlížeč nejprve automaticky odešle `OPTIONS` požadavek (tzv. preflight), a pokud server odpoví kladně, odešle samotný `POST`.

#### --why--

Složitější požadavky spouštějí automatický preflight dotaz na politiku CORS.

### --answer--

Prohlížeč rovnou odešle `POST` požadavek a server se rozhodne, jestli mu to umožní.

#### --why--

`application/json` tělo aktivuje preflight. Rovnou by se to poslalo např. s `application/x-www-form-urlencoded`.

### --answer--

Požadavek selže na klientovi a na server vůbec nedojde, protože je to z jiné domény.

#### --why--

Požadavek nedojde jen v případě, že selže následný `OPTIONS` dotaz (preflight).

### --answer--

Server rovnou vrátí `403 Forbidden`.

#### --why--

Server by to musel úmyslně zakázat, ale prohlížeč nejdřív udělá preflight.

### --see--

api-http-rest/cors-a-cache#preflight

## --question--

Jakým stavovým kódem (číslem) by mělo API odpovědět, když klient odešle na endpoint k vytvoření uživatele `POST` požadavek a ten úspěšně proběhne?

### --expected--

201

### --why--

201 znamená `Created`, tedy že na serveru byl úspěšně vytvořen nový zdroj.

### --see--

api-http-rest/http-do-hloubky#stavove-kody-po-skupinach

## --question--

K čemu v HTTP a REST slouží hlavička `ETag`?

### --correct--

Server posílá unikátní identifikátor (např. hash) dané verze odpovědi. Klient jej pak může použít v požadavku `If-None-Match`, aby si ušetřil stahování zbytečných dat.

#### --why--

Toto je přesně mechanismus podmínečných požadavků s ETagem pro cachování.

### --answer--

Odesílá v ní autentizační token.

#### --why--

K tomu se používá `Authorization: Bearer <token>`.

### --answer--

Server si pomocí ní vyhrazuje místo (tag) pro konkrétní relaci klienta.

#### --why--

To se obvykle řeší pomocí session ID v Cookies.

### --answer--

Je to obdoba query parametrů, ve které se předává stránkování.

#### --why--

Stránkování se většinou dává do URL.

### --see--

api-http-rest/cors-a-cache#etag-a-304

## --question--

Klient pošle `PATCH /ukoly/7` s tělem `{"hotovo": true}`. Napiš, čím se to liší od `PUT` na stejnou adresu.

### --expected--

patch mění jen uvedená pole

### --accept--

patch je částečná úprava, put nahradí celý zdroj
put nahradí celý záznam, patch jen část
put posílá celý objekt

### --why--

`PUT` znamená „takhle ať ten zdroj vypadá" — co v těle nepošleš, zmizí. `PATCH` znamená
„tohle na něm změň" a zbytku se nedotkne. Proto je `PUT` idempotentní vždycky, kdežto
`PATCH` jen tehdy, když ho tak navrhneš (`{"pocet": 5}` ano, `{"pocet": "+1"}` ne).

### --see--

api-http-rest/navrh-rest#put-patch-a-idempotence

## --question--

Uživatel pošle na `POST /registrace` tělo, ve kterém chybí heslo. Jaký stavový kód vrátíš?

### --answer--

`500 Internal Server Error`

#### --why--

Pětistovka znamená „chyba na mé straně". Tady je chyba na straně klienta a server
funguje přesně jak má — jen dostal nesmysl.

### --correct--

`400 Bad Request` (nebo `422`, když tělo dorazilo správně, jen neprošlo validací)

#### --why--

Čtyřstovky jsou chyby klienta. `400` se hodí vždycky; `422 Unprocessable Content`
se používá, když je tělo syntakticky v pořádku, ale porušuje pravidla — je to jemnější
rozlišení, ne povinnost.

### --answer--

`204 No Content`

#### --why--

Dvoustovky říkají „proběhlo to". `204` navíc znamená „a nic ti neposílám" — tady by
klient vůbec nepoznal, že se něco pokazilo.

### --see--

api-http-rest/validace-a-chyby-api#400-nebo-422

## --question--

Napiš, co má API vrátit v těle odpovědi u chyby, aby se s ní dalo pracovat.

### --expected--

jednotný tvar chyby

### --accept--

strukturovanou chybu, ne holý text
json s kódem a popisem chyby
problem+json
kód chyby, popis a které pole je špatně

### --why--

Když každý endpoint vrací chybu jinak (jednou text, jednou `{error}`, jednou
`{message}`), klient to nemůže odbavit jednotně. Ustálený tvar (třeba
`application/problem+json`) má vždycky stejná pole a u validace navíc seznam polí,
která neprošla — to je přesně to, co potřebuje formulář na druhé straně.

### --see--

api-http-rest/navrh-rest#jednotny-tvar-chyb-problem-json

## --question--

Vývojář zapnul na serveru `Access-Control-Allow-Origin: *`, aby „API bylo přístupné". Co si o tom myslíš?

### --correct--

Neohrožuje to server, ale neochrání ho to — CORS je pravidlo pro prohlížeč, ne autorizace.

#### --why--

Požadavek z `curl` nebo ze skriptu na serveru žádné CORS neřeší a hlavičku ignoruje.
Pokud má být API neveřejné, musí ho chránit přihlášení, ne CORS. Hvězdička je v pořádku
u opravdu veřejného API — u toho s cookies ale nefunguje vůbec.

### --answer--

Je to vážná bezpečnostní díra, kdokoli si teď přečte data.

#### --why--

Data si mohl přečíst i předtím — třeba `curl`em. CORS jen říká prohlížeči, jestli smí
**cizí stránka** odpověď přečíst.

### --answer--

Nic to nedělá, hvězdička je výchozí hodnota.

#### --why--

Výchozí je, že cizí původ odpověď nepřečte. Hvězdička to mění.

### --see--

api-http-rest/cors-a-cache#cors-nechrani-server

## --question--

Napiš metodu a adresu pro „vyzvedni druhou stránku úkolů po dvaceti, seřazených podle termínu".

### --expected--

GET /ukoly?strana=2&limit=20&razeni=termin

### --accept--

GET /ukoly?page=2&limit=20&sort=termin
GET /ukoly?offset=20&limit=20&sort=termin
GET /ukoly?limit=20&strana=2&razeni=termin

### --why--

Zdroj je kolekce `/ukoly`, akci určuje metoda `GET` a všechno ostatní (stránkování,
řazení, filtry) patří do query. Sloveso do adresy nepatří — `/ukoly/najdi` ani
`/getUkoly` ne.

### --see--

api-http-rest/navrh-rest#filtry-a-razeni-v-query

## --question--

API vrací u seznamu produktů hlavičku `Cache-Control: no-store`. Co to znamená a kdy je to správně?

### --correct--

Odpověď se nesmí nikde uložit — ani v prohlížeči, ani v proxy. Správně je to u citlivých dat, ne u veřejného katalogu.

#### --why--

U katalogu se tím zahazuje výkon zadarmo: stačilo by `max-age` na pár minut, případně
`ETag` a podmíněné požadavky. `no-store` patří na výpisy objednávek, faktur nebo osobních
údajů, které nemají zůstat v mezipaměti.

### --answer--

Že se odpověď uloží, ale při každém požadavku se ověří u serveru.

#### --why--

To je `no-cache` — matoucí jméno, ale znamená „ulož a pokaždé se zeptej". `no-store`
neukládá vůbec.

### --answer--

Že se odpověď uloží na hodinu.

#### --why--

Dobu ukládání určuje `max-age`. `no-store` žádnou dobu nemá, protože se neukládá.

### --see--

api-http-rest/cors-a-cache#cache-control

## --question--

V minulé části jsi psal Node. Napiš, co udělá `express.json()` a proč bez něj `req.body` chybí.

### --expected--

parsuje tělo požadavku z json

### --accept--

převede json tělo na objekt v req.body
čte tělo požadavku a naplní req.body
bez něj express tělo nečte

### --why--

Tělo požadavku přichází jako proud bajtů. `express.json()` je middleware, který ho
přečte, zkusí z něj udělat JSON a výsledek dá do `req.body`. Bez něj je `req.body`
nedefinované — což je nejčastější důvod, proč „POST nefunguje", i když je klient v pořádku.

### --see--

node-zaklady/http-v-node

## --question--

Proč se validace vstupu na serveru nedá nahradit validací ve formuláři na klientovi?

### --correct--

Požadavek na API může přijít odkudkoli — ze skriptu, z `curl`u, z cizí aplikace. Formulář v tom nefiguruje.

#### --why--

Server dostává jen HTTP požadavek a nemá jak zjistit, čím byl odeslaný. Validace
na klientovi je pohodlí pro uživatele; validace na serveru je jediné, co drží data
v pořádku.

### --answer--

Dá, pokud je API dostupné jen z vlastního webu.

#### --why--

„Dostupné jen z vlastního webu" nezařídí CORS ani nic jiného v prohlížeči — adresu API
si kdokoli přečte v DevTools a zavolá ji přímo.

### --answer--

Nedá, protože prohlížeče validaci implementují různě.

#### --why--

Rozdíly mezi prohlížeči jsou drobné a nejsou důvod. Důvod je, že klient se dá obejít celý.

### --see--

api-http-rest/validace-a-chyby-api#nikdy-never-klientovi

## --question--

Napiš stavový kód, kterým server odpoví na podmíněný požadavek, když se zdroj od poslední verze nezměnil.

### --expected--

304

### --accept--

304 Not Modified

### --why--

Klient pošle `If-None-Match` s `ETag`em, který dostal minule. Když se zdroj nezměnil,
server odpoví `304` **bez těla** — ušetří se přenos celé odpovědi a klient použije to,
co má uložené.

### --see--

api-http-rest/cors-a-cache#etag-a-304
