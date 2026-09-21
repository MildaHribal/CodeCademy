# CORS a cache

:::check pretest
API knihovny posílá hlavičku `Access-Control-Allow-Origin` jen pro `https://knihovna.example.cz`. Ochrání to server před požadavkem, který pošle skript na cizím webu?

### --answer--
Ano, prohlížeč požadavek z cizího webu na server vůbec nepustí.

#### --why--
Některé požadavky prohlížeč pošle bez ptaní a server je normálně zpracuje. Které to jsou, ukáže část o preflightu.

### --correct--
Ne úplně. CORS rozhoduje hlavně o tom, jestli skript smí **přečíst** odpověď.

#### --why--
CORS je ochrana uživatele v prohlížeči, ne firewall serveru. Proč, uvidíš ve třetí části.

### --answer--
Ano, a navíc i před curl.

#### --why--
curl ani jiný server pravidla prohlížeče nedodržují. CORS hlavičky pro ně nic neznamenají.
:::

Tvoje React aplikace poběží na `http://localhost:5173` a API na `http://localhost:3000`. První `fetch` skončí červenou chybou v konzoli a data nepřijdou, přestože curl je vrací bez potíží. A když katalog knih načítá každá návštěva znovu celý, server počítá pořád dokola totéž. Obojí řeší hlavičky odpovědi, které nastavuje **server**.

> [!REMEMBER]
> **CORS hlavičky říkají prohlížeči, který web smí číst odpovědi API. Cache hlavičky říkají klientovi, jak dlouho a za jakých podmínek smí odpověď použít znovu.**

## Stejný původ a CORS ze strany serveru

Z [lekce o fetch](see:js-async/fetch#cors-z-pohledu-prohlizece) víš, že [[původ]] je schéma, doména a port a že skript smí číst odpovědi jen ze svého původu. Teď jsi na druhé straně: prohlížeč pošle hlavičku `Origin` a čeká, jestli ho server v odpovědi povolí.

```text
GET /api/books HTTP/1.1
Origin: http://localhost:5173
```

```text
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
```

Hodnota `Access-Control-Allow-Origin` je **jeden** původ, nebo `*` (kdokoli). Seznam oddělený čárkou nefunguje. Když má API povolit víc webů, server porovná `Origin` požadavku se seznamem a povolený původ pošle zpátky:

```js
const allowedOrigins = new Set(['http://localhost:5173', 'https://knihovna.example.cz']);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
}
```

`Vary: Origin` říká cache mezi klientem a serverem, že odpověď se liší podle `Origin`. Bez ní by proxy mohla odpověď s povolením pro jeden web vrátit i jinému.

`applyCors` volej **pro každou odpověď**, i pro chybovou. Bez hlavičky u `422` frontend místo zprávy o chybě uvidí jen chybu CORS.

:::check
API má povolit `http://localhost:5173` a `https://knihovna.example.cz`. Kolega nastavil `Access-Control-Allow-Origin: http://localhost:5173, https://knihovna.example.cz`. Co se stane?

### --answer--
Funguje to pro oba weby.

#### --why--
Hlavička smí obsahovat jen jeden původ nebo `*`. Prohlížeč celou hodnotu porovná s původem stránky.

### --correct--
Nefunguje to pro žádný z nich, protože hodnota se nerovná ani jednomu původu.

#### --why--
Prohlížeč nehledá v seznamu, porovnává celý text. Server musí vybrat jeden povolený původ podle hlavičky `Origin`.

### --answer--
Funguje to jen pro první web v seznamu.

#### --why--
Prohlížeč hodnotu nerozděluje podle čárek. Pro něj je to jeden dlouhý nesmyslný původ.
:::

## Preflight

Prohlížeč dělí požadavky z cizího původu na dvě skupiny:

- **Jednoduchý požadavek**: metoda `GET`, `HEAD` nebo `POST` a `Content-Type` jen `text/plain`, `multipart/form-data` nebo `application/x-www-form-urlencoded`, žádné vlastní hlavičky. Takový požadavek umí poslat i obyčejný HTML formulář, takže ho prohlížeč **pošle rovnou** a až u odpovědi rozhodne, jestli ji skript uvidí.
- **Všechno ostatní** (`PUT`, `PATCH`, `DELETE`, JSON tělo, hlavička `Authorization`): prohlížeč se nejdřív zeptá požadavkem `OPTIONS`. Tomu se říká [[preflight]].

```text
OPTIONS /api/loans/7 HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: authorization
```

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

Teprve když odpověď na preflight povolí metodu i hlavičky, pošle prohlížeč skutečný `DELETE`. `Access-Control-Max-Age` říká, kolik sekund si smí povolení pamatovat, aby se neptal před každým požadavkem.

:::live js predict
```js
async function borrowBook() {
  const response = await fetch('https://api.knihovna.example.cz/api/loans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId: 3, reader: 'Eva Malá' }),
  });
  return response.json();
}

console.log(typeof borrowBook);
```
--question-- Stránka `https://knihovna.example.cz` zavolá `borrowBook()`. Pošle prohlížeč před `POST` preflight `OPTIONS`?
--option-- Ne, `POST` je jednoduchá metoda, takže se nikdy neptá.
--option*-- Ano, kvůli `Content-Type: application/json`.
--option-- Ne, `api.knihovna.example.cz` je stejný původ jako `knihovna.example.cz`.
--why-- Samotná metoda `POST` jednoduchá je, ale `application/json` mezi tři povolené typy těla nepatří, takže prohlížeč se nejdřív zeptá. A subdoména `api.` je jiný původ, protože původ tvoří celá doména. Zkus si v hlavě změnit `Content-Type` na `text/plain`: preflight zmizí, ale server pak tělo nepozná jako JSON.
:::

:::check
Server na `OPTIONS /api/loans` odpovídá `404`, protože routu pro `OPTIONS` nemá. Co uvidí vývojář frontendu v konzoli při `fetch` s JSON tělem?

### --answer--
Chybu `404 Not Found` z fetch.

#### --why--
Na odpověď preflightu skript vůbec nedosáhne, `fetch` z ní nedostane stav ani tělo. Chybu hlásí prohlížeč jinak.

### --correct--
Chybu CORS: preflight nemá úspěšný stav, a skutečný `POST` se vůbec neodešle.

#### --why--
Chrome napíše `Response to preflight request doesn't pass access control check: It does not have HTTP ok status.` Oprava je na serveru: `OPTIONS` odpovědět `204` s hlavičkami `Access-Control-Allow-*`.

### --answer--
Nic, prohlížeč preflight přeskočí a pošle rovnou `POST`.

#### --why--
Neúspěšný preflight je pro prohlížeč zákaz. Skutečný požadavek bez povolení nepošle.
:::

## CORS nechrání server

CORS chrání **uživatele**: aby skript na cizí stránce nepřečetl data, která jeho prohlížeč vidí díky přihlášení. Server tím chráněný není:

- curl, Postman, jiný server nebo skript v Node CORS neřeší a pošlou cokoli.
- Jednoduchý požadavek (formulář s `POST`) prohlížeč **odešle a server ho zpracuje**, i když odpověď skriptu nakonec neukáže.
- `Access-Control-Allow-Origin: *` u veřejného katalogu knih nic neotevírá, data jsou veřejná tak jako tak.

Kdo smí co udělat, rozhoduje **přihlášení a kontrola oprávnění** na serveru. K tomu se dostaneš v samostatné sekci o autentizaci a bezpečnosti, teď stačí vědět, že CORS ji nenahradí.

:::check
Proč CORS hlavičky nezabrání tomu, aby někdo přes curl smazal výpůjčku?

### --answer--
Protože `DELETE` je idempotentní a CORS se na něj nevztahuje.

#### --why--
Na `DELETE` se CORS vztahuje, v prohlížeči před ním dokonce proběhne preflight. Rozhoduje, **kdo** pravidla vynucuje.

### --correct--
Protože CORS vynucuje jen prohlížeč a curl žádná pravidla prohlížeče nedodržuje.

#### --why--
CORS hlavičky jsou pokyn pro prohlížeč. curl je čte jako jakékoli jiné hlavičky a nic neblokuje. Mazání musí chránit přihlášení a kontrola oprávnění.

### --answer--
Zabrání, pokud server nepovolí `*`.

#### --why--
Konkrétní seznam původů omezí jen skripty v prohlížeči. Požadavek z terminálu hlavičku `Origin` vůbec poslat nemusí.
:::

## Cache-Control

Hlavička `Cache-Control` v odpovědi říká prohlížeči a proxy serverům, jestli a jak dlouho smí odpověď uložit a použít znovu bez ptaní:

| hodnota | význam | příklad |
|---|---|---|
| `max-age=60` | 60 sekund používej uloženou odpověď bez ptaní | seznam žánrů |
| `no-cache` | ulož si ji, ale **před každým použitím se zeptej**, jestli platí | detail knihy s dostupností |
| `no-store` | vůbec neukládej | odpověď s přihlašovacím tokenem |
| `private` | smí uložit jen prohlížeč uživatele, ne sdílená proxy | výpůjčky přihlášeného čtenáře |
| `public` | smí uložit i sdílená cache | veřejný katalog |

Hodnoty jdou kombinovat: `public, max-age=300` pro katalog, `private, no-cache` pro „moje výpůjčky". Čím déle cache platí, tím méně požadavků, ale tím déle uvidí klient stará data. Knihu vypůjčenou před minutou by katalog s `max-age=3600` ukazoval jako volnou ještě hodinu.

:::check
Odpověď `GET /api/me/loans` obsahuje výpůjčky přihlášeného čtenáře a musí být vždy aktuální. Kterou hodnotu `Cache-Control` pošleš?

### --answer--
`public, max-age=3600`

#### --why--
`public` dovolí uložit osobní data do sdílené cache a `max-age=3600` by hodinu ukazovalo staré výpůjčky.

### --correct--
`private, no-cache`

#### --why--
Uložit smí jen prohlížeč toho čtenáře a před každým použitím se musí serveru zeptat, jestli data platí.

### --answer--
`max-age=0, public`

#### --why--
Nula sice znamená okamžité zastarání, ale `public` pořád dovoluje uložit osobní data do cache, kterou sdílí víc lidí.
:::

## ETag a 304

`no-cache` znamená „zeptej se". Aby otázka nestála celou odpověď, pošle server s daty [[ETag]], otisk obsahu:

```text
HTTP/1.1 200 OK
Cache-Control: no-cache
ETag: "5d41402abc4b2a76"

[{"id":1,"title":"Krakatit"}, …]
```

Příště prohlížeč sám přidá `If-None-Match: "5d41402abc4b2a76"`. Když se data nezměnila, server odpoví **`304 Not Modified` bez těla** a prohlížeč použije uloženou kopii. `fetch` ve frontendu přitom dostane obyčejnou odpověď `200` s daty, práci s `304` udělá prohlížeč za tebe.

```js
import { createHash } from 'node:crypto';

const body = JSON.stringify(books);
const etag = `"${createHash('sha1').update(body).digest('base64url')}"`;

res.setHeader('ETag', etag);
res.setHeader('Cache-Control', 'no-cache');
if (req.headers['if-none-match'] === etag) {
  res.writeHead(304);
  return res.end();
}
```

ETag šetří **přenos**, ne práci serveru: server musí data načíst a otisk spočítat i u `304`. U seznamu s tisíci knih ušetří stovky kilobajtů, u malé odpovědi skoro nic.

:::check
Prohlížeč pošle `If-None-Match` se stejným ETag, jaký server právě spočítal. Napiš číslo stavového kódu odpovědi.

### --expected--
304

### --accept--
304 Not Modified

### --why--
`304 Not Modified` bez těla říká „tvoje uložená kopie platí". Prohlížeč ji podstrčí `fetch` jako normální odpověď `200`.
:::

:::explain
Vysvětli vlastními slovy, proč `curl` na API projde i tehdy, když stejný požadavek
z prohlížeče skončí chybou CORS.

## --model--
CORS není ochrana serveru — je to pravidlo, které vynucuje **prohlížeč**, aby ochránil
uživatele. Cizí stránka ti může poslat požadavek jménem přihlášeného člověka, ale
prohlížeč jí nedovolí odpověď přečíst, dokud server hlavičkou neřekne, že smí. `curl`
žádného uživatele nechrání a žádné takové pravidlo nezná, takže ho nic nezastaví.
Proto chyba CORS **neznamená**, že server požadavek odmítl — obvykle ho zpracoval
a odpověděl, jen prohlížeč odpověď nepustil dál do skriptu.

## --checklist--
- CORS vynucuje prohlížeč, ne server.
- Chrání uživatele před cizí stránkou, ne API před kýmkoli.
- Nástroje mimo prohlížeč se jím neřídí.
- Zablokovaný požadavek často na serveru proběhl.
:::

## Typické chyby a pasti

> [!PITFALL]
> **CORS hlavička jen u úspěchu.** API posílá `Access-Control-Allow-Origin` jen z handleru seznamu, chybová odpověď `422` ji nemá. Frontend místo zprávy „Kniha neexistuje" dostane `TypeError: Failed to fetch` a v konzoli `No 'Access-Control-Allow-Origin' header is present on the requested resource.` Oprava: CORS hlavičky nastav na jednom místě pro každou odpověď.

> [!PITFALL]
> **Lomítko na konci původu.** `Access-Control-Allow-Origin: http://localhost:5173/` se nerovná původu `http://localhost:5173` a Chrome hlásí `The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173/' that is not equal to the supplied origin.` Oprava: původ bez cesty a bez koncového lomítka.

> [!PITFALL]
> **Chybějící hlavička v preflightu.** Preflight povolí metody, ale ne `Content-Type`. Konzole: `Request header field content-type is not allowed by Access-Control-Allow-Headers in preflight response.` Oprava: `Access-Control-Allow-Headers: Content-Type` (a další hlavičky, které frontend posílá).

> [!PITFALL]
> **`no-cache` jako „necachuj".** `no-cache` odpověď uložit dovoluje, jen vyžaduje ověření. Odpověď s tokenem nebo osobními údaji, která nesmí zůstat na disku, potřebuje `no-store`.

:::check
Po přidání validace frontend místo chybové zprávy u formuláře hlásí `TypeError: Failed to fetch`. U úspěšných požadavků všechno funguje. Co je nejpravděpodobnější příčina?

### --answer--
Validace na serveru spadla a server neodpověděl.

#### --why--
Server odpověděl, v záložce Network je vidět stav `422`. Problém je v tom, co odpověď obsahuje za hlavičky.

### --correct--
Chybové odpovědi nemají `Access-Control-Allow-Origin`, takže prohlížeč je skriptu neukáže.

#### --why--
CORS se kontroluje u každé odpovědi zvlášť. Hlavička nastavená jen v úspěšném handleru chybí všude, kde handler končí chybou dřív.

### --answer--
`fetch` neumí zpracovat stav `422`.

#### --why--
`fetch` stav `422` normálně vrátí s `response.ok` `false`. Výjimku vyhodí jen tehdy, když odpověď vůbec nedostane nebo ji nesmí číst.
:::

## Kde to najdeš v MDN

- [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) — jednoduché požadavky, preflight a všechny hlavičky `Access-Control-*`.
- [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) — všechny hodnoty včetně rozdílu `no-cache` a `no-store`.
- [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag) — otisk obsahu a jeho použití s `If-None-Match`.
- [304 Not Modified](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/304) — co odpověď obsahuje a co ne.

# --questions--

## --question--

Frontend na `http://localhost:5173` posílá `PATCH /api/loans/7` s hlavičkou `Authorization`. Napiš hodnotu hlavičky `Access-Control-Allow-Headers`, kterou musí preflight odpovědět, když frontend posílá navíc JSON tělo.

### --expected--
Content-Type, Authorization

### --accept--
Authorization, Content-Type
content-type, authorization
authorization, content-type

### --why--
Preflight musí povolit každou hlavičku, kterou skutečný požadavek pošle a která není mezi jednoduchými. JSON tělo přináší `Content-Type: application/json`, přihlášení `Authorization`.

### --see--
api-http-rest/cors-a-cache#preflight

## --question--

Katalog knih má `Cache-Control: public, max-age=600`. Knihovník v 10:00 změní název knihy. Čtenář načetl katalog v 9:58. Kdy nejpozději uvidí nový název, když stránku obnovuje každou minutu?

### --answer--
Hned v 10:01, protože server změnu pošle sám.

#### --why--
Server klientovi nic neposílá, dokud se klient nezeptá. A s `max-age=600` se prohlížeč 10 minut neptá.

### --correct--
V 10:08, až uložená odpověď z 9:58 zestárne.

#### --why--
`max-age=600` dovoluje používat uloženou odpověď 600 sekund od jejího získání bez ptaní. Proto se dlouhé `max-age` hodí jen na data, u kterých zpoždění nevadí.

### --answer--
Nikdy, dokud nevymaže cache prohlížeče.

#### --why--
Po uplynutí `max-age` se odpověď považuje za zastaralou a prohlížeč si řekne o novou.

### --see--
api-http-rest/cors-a-cache#cache-control

## --question--

Proč server, který odpovídá `304 Not Modified`, ušetří přenos, ale ne čas na načtení dat z databáze?

### --answer--
Protože `304` se posílá jen tehdy, když je databáze nedostupná.

#### --why--
`304` s dostupností nesouvisí. Říká, že se data od posledního stažení nezměnila.

### --correct--
Protože ETag je otisk dat: aby ho server porovnal s `If-None-Match`, musí data nejdřív načíst a otisk spočítat.

#### --why--
Ušetří se jen tělo odpovědi, které se neposílá. Když chceš šetřit i práci serveru, potřebuješ `max-age`, se kterým se klient vůbec neptá.

### --answer--
Ušetří obojí, protože prohlížeč u `304` na server nic nepošle.

#### --why--
Požadavek s `If-None-Match` na server dorazí. Bez něj by server nevěděl, jaký ETag klient má.

### --see--
api-http-rest/cors-a-cache#etag-a-304
