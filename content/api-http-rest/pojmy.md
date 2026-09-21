## --term-- bezpečná metoda

en: safe method
aliases: bezpečné, bezpečnou
lekce: api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

Metoda HTTP požadavku, která nemění stav na serveru (např. GET nebo HEAD). Je pouze pro čtení dat.

## --term-- idempotentní metoda

en: idempotent method
aliases: idempotentní, idempotentní metodou
lekce: api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

Metoda HTTP požadavku, jejíž opakované volání se stejnými daty zanechá server ve stejném stavu jako jedno volání (např. PUT nebo DELETE).

## --term-- hlavička Location

en: Location header
aliases: Location, hlavičku Location, hlavičce Location
lekce: api-http-rest/http-do-hloubky#hlavicky-ktere-api-potrebuje

Hlavička odpovědi `201 Created` s adresou právě vytvořeného zdroje. Klient díky ní adresu neskládá sám, takže ho změna tvaru adres nerozbije.

## --term-- curl

en: curl
aliases: curlem, curlu, příkaz curl
lekce: api-http-rest/http-do-hloubky#pozadavek-z-terminalu-curl

Program v příkazové řádce, kterým pošleš libovolný HTTP požadavek. Přepínač `-i` vypíše i stavový řádek a hlavičky, `-X` změní metodu, `-H` přidá hlavičku a `-d` pošle tělo.

## --term-- test API

en: API test
aliases: testy API, testů API, automatický test API
lekce: api-http-rest/http-do-hloubky#automaticky-test-api

Program, který posílá na běžící API skutečné HTTP požadavky a kontroluje stavový kód, hlavičky i tělo odpovědi. Na rozdíl od ručního ověření curlem se dá spustit znovu po každé změně.

## --term-- zdroj API

en: API resource
aliases: zdroj, zdroji, zdroje
lekce: api-http-rest/navrh-rest#zdroje-a-adresy

Základní entita (Resource) v návrhu REST API (např. kniha, uživatel, výpůjčka), která je identifikována pomocí unikátní URL.

## --term-- reprezentace zdroje

en: resource representation
aliases: reprezentace, reprezentaci zdroje, reprezentací zdroje
lekce: api-http-rest/navrh-rest#zdroje-a-adresy

JSON, který API o zdroji vrátí. Není to kopie řádku z databáze: smí obsahovat odvozená pole (`"available": false`) a nesmí obsahovat to, co klientovi nepatří (hash hesla, interní poznámky).

## --term-- vnořený zdroj

en: nested resource
aliases: vnořeného zdroje, vnořená adresa, vnořené adresy
lekce: api-http-rest/navrh-rest#zdroje-a-adresy

Adresa, která vyjadřuje vztah „patří k": `/api/readers/5/loans` jsou výpůjčky čtenáře 5. Víc než jedna úroveň vnoření se špatně používá, proto má vnořená věc obvykle i vlastní adresu `/api/loans/7`.

## --term-- seznam povolených hodnot

en: allowlist
aliases: whitelist, seznamu povolených hodnot, seznamem povolených hodnot
lekce: api-http-rest/navrh-rest#filtry-a-razeni-v-query

Výčet hodnot, které server z query přijme (třeba povolená řazení). Všechno mimo seznam odmítne, takže se text od klienta nikdy nedostane přímo do jména vlastnosti ani do dotazu.

## --term-- stránkování offsetem

en: offset pagination
aliases: offsetové stránkování, offsetem, offset
lekce: api-http-rest/navrh-rest#strankovani-offset-a-kurzor

Rozdělení seznamu parametry `?page=3&limit=20`, tedy „přeskoč 40, vezmi 20". Umí skočit na libovolnou stránku, ale když během listování přibude záznam, položky se posunou.

## --term-- stránkování kurzorem

en: cursor pagination
aliases: kurzorové stránkování, kurzor, kurzoru, kurzorem
lekce: api-http-rest/navrh-rest#strankovani-offset-a-kurzor

Rozdělení seznamu značkou „pokračuj za touhle položkou" (`?limit=20&after=…`). Nové záznamy listování neposunou, ale skákat na konkrétní stránku nejde.

## --term-- problem+json

en: Problem Details
aliases: application/problem+json, Problem Details, problem json
lekce: api-http-rest/navrh-rest#jednotny-tvar-chyb-problem-json

Standardní tvar chybové odpovědi (RFC 9457) s klíči `type`, `title`, `status` a `detail` a s typem `application/problem+json`. Vlastní klíče, třeba `errors` s chybami polí, se přidávat smějí.

## --term-- rozbíjející změna

en: breaking change
aliases: rozbíjející změny, rozbíjející změnu, breaking change
lekce: api-http-rest/navrh-rest#verzovani

Změna API, po které přestane fungovat klient, který se nezměnil: přejmenované nebo odebrané pole, jiný typ hodnoty, nově povinný parametr. Dostává novou verzi (`/api/v2/…`).

## --term-- zpětně kompatibilní změna

en: backward compatible change
aliases: zpětně kompatibilní, zpětná kompatibilita, zpětně kompatibilní změny
lekce: api-http-rest/navrh-rest#verzovani

Změna, které si starý klient nevšimne: nové pole v odpovědi, nový nepovinný parametr, nová routa. Novou verzi API nepotřebuje.

## --term-- neověřený vstup

en: untrusted input
aliases: neověřeného vstupu, neověřená data, neověřeným vstupem
lekce: api-http-rest/validace-a-chyby-api#nikdy-never-klientovi

Všechno, co přišlo po síti, dokud to neprošlo schématem na serveru. Formulář, `disabled` tlačítko ani skryté pole nejsou zárukou: stejný požadavek pošle kdokoli bez prohlížeče.

## --term-- mass assignment

en: mass assignment
aliases: hromadné přiřazení, mass-assignment
lekce: api-http-rest/validace-a-chyby-api#nikdy-never-klientovi

Chyba, při které server uloží celé tělo požadavku (`{ ...body }`), a klient si tak sám nastaví pole, která mu nepatří — roli, cenu nebo datum vytvoření. Bránit se jde skládáním objektu jen z ověřených klíčů.

## --term-- validační schéma

en: validation schema
aliases: validačního schématu, validačním schématem, schéma vstupu
lekce: api-http-rest/validace-a-chyby-api#schema-v-zodu-na-serveru

Popis tvaru dat (v Zodu `z.object({ … })`), proti kterému server vstup ověří na jednom místě místo řady ručních `if`. Výsledek obsahuje jen klíče ze schématu a už upravené hodnoty.

## --term-- centrální zpracování chyb

en: centralized error handling
aliases: centrálního zpracování chyb, centrálním zpracováním chyb, error middleware
lekce: api-http-rest/validace-a-chyby-api#centralni-zpracovani-chyb

Jediné místo, které z vyhozené výjimky udělá odpověď: `HttpError` dostane svůj stav, chyba schématu `422`, cokoli neznámého `500` s obecnou zprávou. Handlery pak chybu jen vyhodí.

## --term-- limit velikosti těla

en: body size limit
aliases: limit těla, limitu těla, limitem těla
lekce: api-http-rest/validace-a-chyby-api#limit-tela

Strop v bajtech, po jehož překročení server přestane tělo číst a odpoví `413`. Bez něj drží server v paměti cokoli, co mu kdokoli pošle.

## --term-- hlavička Access-Control-Allow-Origin

en: Access-Control-Allow-Origin
aliases: Access-Control-Allow-Origin
lekce: api-http-rest/cors-a-cache#stejny-puvod-a-cors-ze-strany-serveru

Hlavička odpovědi, kterou server říká prohlížeči, který původ smí odpověď přečíst. Hodnota je **jeden** původ nebo `*`, seznam oddělený čárkou nefunguje.

## --term-- hlavička Vary

en: Vary
aliases: Vary, Vary Origin
lekce: api-http-rest/cors-a-cache#stejny-puvod-a-cors-ze-strany-serveru

Hlavička odpovědi, která cache říká, podle čeho se odpověď liší. `Vary: Origin` zabrání tomu, aby proxy vrátila odpověď s povolením pro jeden web i jinému webu.

## --term-- jednoduchý požadavek

en: simple request
aliases: jednoduchého požadavku, jednoduché požadavky, simple request
lekce: api-http-rest/cors-a-cache#preflight

Požadavek z cizího původu, který umí poslat i obyčejný HTML formulář: metoda `GET`, `HEAD` nebo `POST`, běžný typ těla a žádné vlastní hlavičky. Prohlížeč ho pošle rovnou a teprve u odpovědi rozhodne, jestli ji skript uvidí.

## --term-- preflight

en: preflight request
aliases: preflightem, preflightu
lekce: api-http-rest/cors-a-cache#preflight

Přípravný OPTIONS požadavek, kterým se prohlížeč dotazuje serveru na povolení CORS pro operace měnící stav (např. POST s JSON tělem nebo DELETE).

## --term-- Cache-Control

en: Cache-Control
aliases: hlavička Cache-Control, hlavičku Cache-Control, cachovací hlavička
lekce: api-http-rest/cors-a-cache#cache-control

Hlavička odpovědi, která říká, jestli a jak dlouho smí klient odpověď použít znovu. `max-age=60` znamená „minutu se neptej", `no-cache` „ulož, ale pokaždé se zeptej" a `no-store` „vůbec neukládej".

## --term-- ETag

en: ETag
lekce: api-http-rest/cors-a-cache#etag-a-304

Hlavička odpovědi obsahující otisk (hash) verze zdroje. Prohlížeč ji může poslat v hlavičce `If-None-Match`, aby server mohl vrátit 304 Not Modified, pokud se zdroj nezměnil.

## --term-- If-None-Match

en: If-None-Match
aliases: hlavička If-None-Match, hlavičku If-None-Match
lekce: api-http-rest/cors-a-cache#etag-a-304

Hlavička požadavku, ve které prohlížeč pošle ETag své uložené kopie. Když se zdroj nezměnil, odpoví server `304 Not Modified` bez těla a ušetří se přenos, ne ale práce serveru.
