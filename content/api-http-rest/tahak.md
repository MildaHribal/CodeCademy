## Metody: co je bezpečné a co idempotentní

| metoda | bezpečná | idempotentní | k čemu |
|---|---|---|---|
| `GET` | ano | ano | přečíst zdroj |
| `HEAD` | ano | ano | jen hlavičky, bez těla |
| `POST` | ne | **ne** | založit nový zdroj, spustit akci |
| `PUT` | ne | ano | nahradit zdroj celý |
| `PATCH` | ne | záleží na návrhu | změnit část zdroje |
| `DELETE` | ne | ano | smazat zdroj |

**Bezpečná** = nemění stav. **Idempotentní** = druhé stejné volání nezmění nic dalšího.
Proto se `POST` nesmí opakovat po timeoutu naslepo, kdežto `PUT` a `DELETE` ano.

## Stavové kódy, které budeš psát

| kód | kdy |
|---|---|
| `200 OK` | povedlo se a něco vracím |
| `201 Created` | vzniklo něco nového (v `Location` adresa toho zdroje) |
| `204 No Content` | povedlo se a nevracím nic (typicky `DELETE`) |
| `304 Not Modified` | klient má aktuální verzi, tělo neposílám |
| `400 Bad Request` | tělo nebo parametry nedávají smysl |
| `401 Unauthorized` | nevím, kdo jsi — přihlas se |
| `403 Forbidden` | vím, kdo jsi, a tohle nesmíš |
| `404 Not Found` | zdroj neexistuje |
| `409 Conflict` | koliduje se současným stavem (duplicitní e-mail) |
| `422 Unprocessable Content` | tělo je syntakticky OK, ale porušuje pravidla |
| `429 Too Many Requests` | příliš mnoho požadavků za krátkou dobu |
| `500 Internal Server Error` | chyba na mé straně |

`4xx` = chyba klienta, `5xx` = moje. Kdo posílá `200` s `{"error": …}` v těle, nutí
každého klienta číst tělo, aby zjistil, jestli se to povedlo.

## Adresy zdrojů

```
GET    /ukoly                 seznam
POST   /ukoly                 založit
GET    /ukoly/42              jeden
PATCH  /ukoly/42              změnit část
DELETE /ukoly/42              smazat
GET    /ukoly/42/komentare    vnořená kolekce
```

- Podstatná jména v množném čísle, **žádná slovesa** (`/getUkoly`, `/ukoly/smazat` ne).
- O akci rozhoduje metoda, ne adresa.
- Filtry, řazení a stránkování patří do query, ne do cesty.

```
GET /ukoly?hotovo=false&razeni=termin&limit=20&offset=40
```

## Stránkování

| způsob | jak | kdy |
|---|---|---|
| offset | `?limit=20&offset=40` | malá data, skoky na stránku N |
| kurzor | `?limit=20&po=eyJpZCI6NDJ9` | velká a měnící se data |

Offset má past: když mezi dotazy někdo vloží záznam, jeden se na hranici stránek
zopakuje nebo přeskočí. Kurzor si pamatuje **kde** skončil, ne kolikátý to byl.

## Jednotný tvar chyby

```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "Tělo požadavku neprošlo validací.",
  "errors": [
    { "pole": "nazev", "zprava": "Název nesmí být prázdný" }
  ]
}
```

Formát `application/problem+json` (RFC 9457) má pole `type`, `title`, `status`,
`detail` a `instance`; vlastní pole se přidávat smějí. Hlavní věc není, který standard
zvolíš, ale že je tvar **ve všech odpovědích stejný** — včetně neznámé cesty.

Skládej ho na jednom místě:

```js
function chyba(res, status, title, detail, errors) {
  const telo = { title, status, detail };
  if (errors) telo.errors = errors;
  return res.status(status).json(telo);
}
```

## Validace na hranici

```js
const schema = z.object({
  nazev: z.string().trim().min(1).max(120),
  hotovo: z.boolean().default(false),
});

const vysledek = schema.safeParse(req.body);
if (!vysledek.success) {
  const errors = vysledek.error.issues.map((p) => ({ pole: p.path.join('.'), zprava: p.message }));
  return chyba(res, 400, 'Bad Request', 'Tělo neprošlo validací.', errors);
}
// Dál pracuj s vysledek.data — má jen to, co je ve schématu.
```

- `safeParse` nevyhazuje, vrací `{ success, data | error }`.
- Do aplikace pouštěj **jen** `vysledek.data`. Klíče navíc se tím zahodí.
- Query je vždycky **text**: `req.query.limit` je `'20'`, ne `20`. Převeď, nebo použij
  `z.coerce.number()`.

## CORS

```js
res.set('Access-Control-Allow-Origin', '*');          // nebo konkrétní původ
res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.set('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.sendStatus(204);
```

- **Preflight** (`OPTIONS`) posílá prohlížeč sám u všeho, co není jednoduchý požadavek
  — tedy i u `POST` s `Content-Type: application/json`.
- S cookies (`credentials: 'include'`) hvězdička **nefunguje**, musí tam být konkrétní
  původ a `Access-Control-Allow-Credentials: true`.
- **CORS není ochrana serveru.** Je to pravidlo pro prohlížeč; `curl` ho ignoruje.
  Neveřejné API chrání přihlášení, ne CORS.

## Cache

| hlavička | co říká |
|---|---|
| `Cache-Control: max-age=300` | ulož a 5 minut se neptej |
| `Cache-Control: no-cache` | ulož, ale pokaždé se zeptej (matoucí jméno) |
| `Cache-Control: no-store` | neukládej vůbec — citlivá data |
| `ETag: "abc123"` | tohle je otisk aktuální verze |
| `If-None-Match: "abc123"` | mám tuhle verzi, změnilo se něco? |

Odpověď `304 Not Modified` je bez těla — ušetří přenos celé odpovědi.

## curl, když nechceš otvírat prohlížeč

```sh
curl -i http://localhost:3000/ukoly                 # -i vypíše i hlavičky
curl -s http://localhost:3000/ukoly | jq            # -s bez ukazatele, jq naformátuje
curl -X POST http://localhost:3000/ukoly \
  -H 'Content-Type: application/json' \
  -d '{"nazev":"Zalít kytky"}'
curl -i -X OPTIONS http://localhost:3000/ukoly \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST'          # ruční preflight
```

## Pasti

- **`200` s chybou v těle.** Stavový kód je první věc, kterou klient čte.
- **`POST` opakovaný po timeoutu** založí záznam dvakrát — není idempotentní.
  Řeší se klíčem idempotence od klienta.
- **`req.body` je `undefined`**, když chybí `express.json()`.
- **Query jako číslo.** `req.query.limit + 1` dá `'201'`, ne `21`.
- **Chyba s výpisem zásobníku v odpovědi** prozradí cesty, verze a strukturu projektu.
- **`Access-Control-Allow-Origin: *` s cookies** prohlížeč odmítne.
- **Chybějící `charset=utf-8`** v `Content-Type` rozsype diakritiku u některých klientů.
- **Sloveso v adrese** (`/ukoly/smazat/42`) — na to je `DELETE /ukoly/42`.
