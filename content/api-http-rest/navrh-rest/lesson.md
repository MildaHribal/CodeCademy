# Návrh REST API

:::check pretest
Knihovna chce API, přes které čtenář vrátí vypůjčenou knihu (výpůjčka má id 7). Který návrh odpovídá REST?

### --answer--
`GET /api/returnBook?loanId=7`

#### --why--
Sloveso v adrese a změna stavu přes `GET` jsou dvě věci, kterým se REST vyhýbá. Proč, uvidíš hned v první části.

### --correct--
`DELETE /api/loans/7`

#### --why--
Adresa jmenuje věc (výpůjčku 7) a metoda říká, co s ní. Vrácená kniha = výpůjčka, která skončila.

### --answer--
`POST /api/loans/7/delete`

#### --why--
Akce je tu napsaná dvakrát, v metodě i v adrese, a ještě si odporují.
:::

Než napíšeš první řádek serveru, dohodneš se s frontendem, jak bude API vypadat. Tahle dohoda se mění draho: jakmile ji používá mobilní aplikace, kterou lidé nemají aktualizovanou, přejmenování jednoho parametru ji rozbije. Proto se API navrhuje předem a podle pravidel, která zná každý vývojář, se kterým budeš pracovat.

> [!REMEMBER]
> **Adresa jmenuje věc, metoda říká, co s ní. Výběr, řazení a stránka jsou jen parametry v query.**

## Zdroje a adresy

[[zdroj API|Zdroj]] (*resource*) je věc, se kterou API pracuje: kniha, výpůjčka, čtenář. Každý zdroj má adresu a na ní fungují metody z [lekce o HTTP](see:api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni):

| požadavek | význam |
|---|---|
| `GET /api/books` | seznam knih |
| `POST /api/books` | přidej knihu |
| `GET /api/books/3` | kniha 3 |
| `PUT /api/books/3`, `PATCH /api/books/3` | změň knihu 3 |
| `DELETE /api/books/3` | smaž knihu 3 |
| `GET /api/readers/5/loans` | výpůjčky čtenáře 5 |

Pravidla, která z toho plynou:

- **Podstatná jména v množném čísle**: `/api/books`, ne `/api/book` ani `/api/getBooks`. Seznam i detail pak mají stejný začátek.
- **Id v cestě**: jeden konkrétní zdroj určuje [[parametr cesty]] `/api/books/3`, ne `/api/books?id=3`.
- **Vnoření jen pro vztah „patří k"**: `/api/readers/5/loans` čte se jako „výpůjčky čtenáře 5". Víc než jedna úroveň (`/api/branches/2/readers/5/loans/7`) se špatně používá, výpůjčka má i vlastní adresu `/api/loans/7`.
- **Akce jako zdroj**: vrácení knihy není sloveso `/api/returnBook`, ale konec výpůjčky `DELETE /api/loans/7`. Když se akce na zdroj převést nedá (odeslat upomínku), je v pořádku `POST /api/loans/7/reminders`, tedy „vytvoř upomínku".

JSON, který API vrátí, je **reprezentace** zdroje, ne kopie řádku z databáze. Smí obsahovat odvozené pole (`"available": false`) a nesmí obsahovat to, co klientovi nepatří (hash hesla, interní poznámky).

:::check
Napiš metodu a adresu, kterou frontend načte seznam výpůjček čtenáře s id 12.

### --expected--
GET /api/readers/12/loans

### --accept--
GET /api/loans?reader=12
GET /api/loans?readerId=12

### --why--
Výpůjčky patří čtenáři, takže vnořená adresa se čte přirozeně. Filtr `GET /api/loans?readerId=12` je taky správně, obě podoby se používají. Špatně by bylo `GET /api/getReaderLoans/12`.
:::

## Filtry a řazení v query

Filtr, řazení, hledání i stránka mění jen to, **jakou část** seznamu klient dostane. Zdroj je pořád tentýž, proto patří do [[query string|query stringu]], ne do cesty:

| chceš | adresa |
|---|---|
| jen sci-fi | `/api/books?genre=sci-fi` |
| hledání v názvu | `/api/books?q=mloky` |
| řazení podle roku, nejnovější první | `/api/books?sort=-year` (mínus = sestupně) |
| kombinace | `/api/books?genre=klasika&sort=title&page=2` |

Na serveru čteš query přes `URLSearchParams`, a ten má tři vlastnosti, na které se zapomíná. Předpověz, co se vypíše:

:::live js predict
```js
const url = new URL('http://localhost/api/books?genre=sci-fi&genre=humor&page=2');
const query = url.searchParams;

console.log(query.get('genre'));
console.log(query.get('page') + 1);
console.log(query.get('limit'));
```
--question-- Co vypíšou tři řádky `console.log`?
--expected--
```text
sci-fi
21
null
```
--why-- `get` vrátí jen **první** hodnotu opakovaného parametru, všechny dá `getAll('genre')`. Každá hodnota je **text**, takže `'2' + 1` je `'21'`, ne `3`. A chybějící parametr je `null`, ne `undefined` ani prázdný text. Zkus místo `get('genre')` napsat `getAll('genre')`.
:::

Co s hodnotou, kterou API nezná (`?sort=heslo`, `?genre=` s překlepem)? U **řazení** vrať `400`: klient chce konkrétní pořadí a tiché ignorování by mu dalo jiné. U **filtru** podle neexistující hodnoty (`?genre=poezie`) vrať `200` a prázdný seznam, protože seznam existuje, jen v něm nic není. Povolené hodnoty řazení drž v seznamu povolených hodnot (*whitelist*) a nikdy nepoužij text z query přímo jako jméno vlastnosti, proč, ukazují pasti na konci.

:::check
`GET /api/books?genre=poezie` nenajde žádnou knihu. Co vrátíš?

### --answer--
`404` a `{"error": "Nic nenalezeno"}`

#### --why--
`404` říká, že adresa nebo zdroj neexistuje. Seznam knih ale existuje, jen tomuhle výběru nic neodpovídá. Frontend by `404` vyložil jako špatnou adresu.

### --correct--
`200` a prázdný seznam

#### --why--
Prázdný výběr je platný výsledek. Frontend ukáže „Žádné knihy v tomhle žánru" a nemusí řešit chybu.

### --answer--
`204` bez těla

#### --why--
`204` znamená „hotovo, nic nevracím" a hodí se po smazání. Frontend, který čeká seznam, by nedostal nic, co by mohl projít.
:::

## Stránkování: offset a kurzor

Seznam se 12 000 knihami nikdo nechce poslat najednou. Existují dva způsoby, jak ho rozdělit.

**Offset** (posun): `?page=3&limit=20` znamená „přeskoč 40, vezmi 20". Odpověď nese data i metadata, aby frontend vykreslil „Strana 3 z 600":

```json
{ "data": [], "meta": { "page": 3, "limit": 20, "total": 12000, "totalPages": 600 } }
```

**Kurzor**: `?limit=20&after=eyJpZCI6NDB9` znamená „dej 20 položek za touhle značkou". Server vrátí data a kurzor na další stránku, frontend ho jen pošle zpátky:

```json
{ "data": [], "meta": { "nextCursor": "eyJpZCI6NjB9" } }
```

| | offset | kurzor |
|---|---|---|
| skok na stranu 7 | jde | nejde, jen další a předchozí |
| nový záznam během listování | položky se posunou, jednu uvidíš dvakrát nebo vůbec | nic se neposune |
| rychlost u hluboké stránky | databáze musí přeskočené řádky projít | stejná jako u první stránky |
| hodí se na | katalog, administraci s čísly stránek | nekonečný feed, komentáře, notifikace |

Ať volíš cokoli, `page` a `limit` přicházejí jako **text** a může je poslat kdokoli, nejen tvůj frontend. Převeď je na čísla, ověř rozsah a omez nejvyšší `limit`. Jinak `?limit=1000000` pošle celou databázi a `?page=abc` vrátí `"page": null`, protože z `Number('abc')` je `NaN` a `JSON.stringify` z `NaN` udělá `null`.

:::check
Sociální síť ukazuje komentáře pod příspěvkem, nahoru stále přibývají nové a uživatel roluje dolů. Jaké stránkování zvolíš?

### --answer--
Offset, protože umí skočit na libovolnou stránku.

#### --why--
Skok na stránku tady nikdo nepotřebuje. A když během rolování přibudou nové komentáře, offset posune všechny položky a uživatel uvidí některé komentáře dvakrát.

### --correct--
Kurzor, protože nové komentáře nahoře listování neposunou.

#### --why--
Kurzor si pamatuje, **za kterou** položkou pokračovat, ne kolik jich přeskočit. Nové položky na začátku ho neovlivní.

### --answer--
Žádné, komentářů pod příspěvkem nikdy není moc.

#### --why--
Pod populárním příspěvkem jich jsou tisíce a poslat je všechny najednou zdrží server, síť i telefon.
:::

## PUT, PATCH a idempotence

Obě metody zdroj mění, liší se tím, **co pošleš**.

- `PUT` pošle **celý** nový stav zdroje. Co v těle chybí, to ve zdroji po změně není (nebo dostane výchozí hodnotu).
- `PATCH` pošle **jen změny**. Co v těle chybí, zůstává, jak bylo.

Čtenář má `{ "name": "Eva Malá", "email": "eva@example.cz", "phone": "777 123 456" }` a chce změnit e-mail:

| požadavek | tělo | výsledek |
|---|---|---|
| `PUT /api/readers/5` | `{ "name": "Eva Malá", "email": "eva.mala@example.cz" }` | telefon **zmizel** |
| `PATCH /api/readers/5` | `{ "email": "eva.mala@example.cz" }` | telefon zůstal |

`PUT` je idempotentní vždy: poslat celý stav dvakrát dá stejný stav. `PATCH` jen když popisuje cílovou hodnotu. `{"dueDate": "2026-11-11"}` je idempotentní, `{"extendByDays": 14}` ne, každé zopakování prodlouží výpůjčku o další dva týdny.

:::explain
Vysvětli kolegovi z frontendu, kdy použije `PUT` a kdy `PATCH` a co se stane s polem, které v těle nepošle.

## --model--
`PUT` nahrazuje celý zdroj, takže musím poslat všechna pole. Co vynechám, server smaže nebo nastaví na výchozí hodnotu. `PATCH` mění jen pole, která pošlu, ostatní zůstanou. `PUT` je vždy idempotentní, `PATCH` jen tehdy, když posílá cílové hodnoty, ne přírůstky.

## --checklist--
- `PUT` posílá celý nový stav zdroje.
- Pole vynechané v `PUT` ze zdroje zmizí nebo dostane výchozí hodnotu.
- `PATCH` posílá jen pole, která se mají změnit.
- `PUT` je idempotentní, `PATCH` jen s cílovými hodnotami, ne s přírůstky.
:::

:::check
Formulář „Upravit profil" posílá jen pole, která uživatel změnil. Jakou metodou?

### --expected--
PATCH

### --why--
Tělo obsahuje jen změny, zbytek profilu má zůstat. `PUT` s neúplným tělem by nevyplněná pole smazal.
:::

## Jednotný tvar chyb: problem+json

Když každá routa vrací chybu jinak (`{"error": …}`, `{"message": …}`, holý text), frontend musí mít pro každou routu vlastní zpracování. Proto má API **jeden tvar chyby** pro všechny odpovědi `4xx` a `5xx`. Standard pro něj je *Problem Details* (RFC 9457) s typem `application/problem+json`:

```text
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://knihovna.example.cz/problemy/neplatna-vypujcka",
  "title": "Výpůjčka nemá platná data",
  "status": 422,
  "detail": "Kniha s id 99 neexistuje.",
  "errors": [{ "field": "bookId", "message": "Kniha neexistuje" }]
}
```

`title` je stejný pro všechny výskyty problému, `detail` popisuje tenhle konkrétní, `status` opakuje stavový kód a vlastní klíče jako `errors` smíš přidat. Menší interní API často vrací jednodušší `{"error": "…"}` a je to v pořádku. Podstatné je, aby **všechny** chyby měly stejný tvar.

:::check
Jakou hodnotu má hlavička `Content-Type` u chyby ve formátu Problem Details?

### --expected--
application/problem+json

### --why--
Klient podle typu pozná, že tělo není běžná data, ale popis problému s klíči `title`, `status` a `detail`.
:::

## Verzování

API používají klienti, které nemáš pod kontrolou. Změny se dělí na dvě skupiny:

- **Zpětně kompatibilní**: nové pole v odpovědi, nový nepovinný parametr, nová routa. Starý klient si ničeho nevšimne.
- **Rozbíjející**: přejmenované nebo odebrané pole, jiný typ hodnoty (`"year": "1924"` místo čísla), nově povinný parametr.

Rozbíjející změna dostane novou verzi, nejčastěji v cestě: `/api/v1/books` zůstane, `/api/v2/books` přinese změnu a starou verzi vypneš, až na novou klienti přejdou. Méně časté je verzování hlavičkou (`Accept: application/vnd.knihovna.v2+json`), adresa v cestě je vidět v logu i v prohlížeči.

:::check
Kterou změnu nesmíš udělat bez nové verze API?

### --answer--
Do odpovědi knihy přidáš pole `"pages": 240`.

#### --why--
Klient, který pole nezná, ho prostě nečte. Přidání je zpětně kompatibilní.

### --correct--
Pole `author` přejmenuješ na `authorName`.

#### --why--
Každý klient, který čte `book.author`, dostane `undefined`. To je rozbíjející změna.

### --answer--
Přidáš routu `GET /api/branches`.

#### --why--
Nová adresa nikomu nic nebere, stávající klienti ji nevolají.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Jméno pole z query bez kontroly.** `books.toSorted((a, b) => a[sort].localeCompare(b[sort], 'cs'))` s `?sort=year` spadne na `TypeError: a[sort].localeCompare is not a function` (rok je číslo) a s `?sort=heslo` na `TypeError: Cannot read properties of undefined (reading 'localeCompare')`. Klient dostane `500`, i když chybu udělal on. Oprava: objekt povolených řazení a kontrola `Object.hasOwn(sorters, sort)`. Obyčejné `sort in sorters` pustí dál i zděděné `constructor` a `toString`.

> [!PITFALL]
> **Řazení sdílených dat na místě.** `books.sort(…)` v handleru seřadí pole, ze kterého čtou všechny další požadavky. Po prvním `?sort=title` pak přijde podle abecedy i seznam, který řazení nechtěl. Oprava: `toSorted()` nebo `[...books].sort()`.

> [!PITFALL]
> **`total` po stránkování.** `total: pageItems.length` vrátí `5` místo `12` a frontend ukáže „Strana 1 z 1". Oprava: `total` počítej z výsledku po filtru, **před** `slice`.

> [!PITFALL]
> **Sloveso v adrese.** `POST /api/books/3/update` a `GET /api/books/3/delete` zdvojí akci (metoda i adresa) a `GET`, který maže, spustí každý robot. Oprava: `PATCH /api/books/3`, `DELETE /api/books/3`.

:::check
Proč kontrola `if (!(sort in sorters))` nestačí a `?sort=constructor` ji obejde?

### --answer--
Protože `in` funguje jen u polí, ne u objektů.

#### --why--
`in` funguje u objektů i polí. Problém je v tom, **které** vlastnosti započítá.

### --correct--
`in` hledá i ve zděděných vlastnostech a každý objekt dědí `constructor`.

#### --why--
`'constructor' in {}` je `true`. `Object.hasOwn(sorters, 'constructor')` je `false`, protože se dívá jen na vlastní klíče objektu.

### --answer--
Protože `constructor` je vyhrazené slovo a v query nejde poslat.

#### --why--
Query je obyčejný text, poslat se v něm dá cokoli. Proto ho server nesmí brát jako důvěryhodný.
:::

## Kde to najdeš v MDN

- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — `get`, `getAll`, `has` a co vrací u chybějícího parametru.
- [PATCH request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH) — rozdíl proti `PUT` a proč `PATCH` není zaručeně idempotentní.
- [PUT request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT) — `PUT` jako náhrada celého zdroje a odpovědi `201` a `204`.
- [Object.hasOwn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) — kontrola vlastního klíče bez zděděných vlastností.

# --questions--

## --question--

Kolega navrhl `GET /api/books/search/sci-fi/title/2`: hledání sci-fi, řazení podle názvu, stránka 2. Přepiš adresu podle pravidel REST na `/api/books` s query parametry `genre`, `sort` a `page` (v tomhle pořadí).

### --expected--
/api/books?genre=sci-fi&sort=title&page=2

### --accept--
GET /api/books?genre=sci-fi&sort=title&page=2

### --why--
Zdroj je pořád seznam knih. Žánr, řazení i stránka jen vybírají, co z něj klient uvidí, takže patří do query, kde jdou vynechat i kombinovat v libovolném pořadí.

### --see--
api-http-rest/navrh-rest#filtry-a-razeni-v-query

## --question--

Výpůjčka má `dueDate: "2026-10-14"`. Frontend pošle dvakrát za sebou (uživatel dvakrát klikl) `PATCH /api/loans/7` s tělem `{"extendByDays": 14}`. Jaké datum vrácení bude mít výpůjčka potom? Napiš ve tvaru RRRR-MM-DD.

### --expected--
2026-11-11

### --why--
Každý požadavek přičte 14 dní: 14. 10. → 28. 10. → 11. 11. Tělo popisuje přírůstek, ne cílovou hodnotu, proto takový `PATCH` není idempotentní. S `{"dueDate": "2026-10-28"}` by dvojklik nic nepokazil.

### --see--
api-http-rest/navrh-rest#put-patch-a-idempotence

## --question--

Katalog se 40 000 knihami používá `?page=N&limit=20`. Knihovníci přes den přidávají nové knihy na začátek seznamu. Co uvidí čtenář, který listuje stránkami?

### --answer--
Nic zvláštního, offset je na přidávání odolný.

#### --why--
Offset počítá, kolik položek přeskočit. Když na začátek přibude položka, všechno se o jednu posune.

### --correct--
Některou knihu uvidí na konci jedné stránky a znovu na začátku další.

#### --why--
Po přidání knihy se poslední položka stránky 3 posune na první místo stránky 4. U katalogu to většinou nevadí, u feedu už ano, tam se hodí kurzor.

### --answer--
Server vrátí `409`, protože se data změnila.

#### --why--
Změna dat mezi dvěma nezávislými `GET` požadavky není konflikt. Každý požadavek dostane aktuální stav.

### --see--
api-http-rest/navrh-rest#strankovani-offset-a-kurzor
