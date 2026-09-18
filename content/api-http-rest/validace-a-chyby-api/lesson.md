# Validace a chyby na serveru

:::check pretest
Objednávkový formulář e-shopu má u počtu kusů `<input type="number" min="1" required>`. Musí server počet kusů kontrolovat znovu?

### --answer--
Ne, prohlížeč formulář s nulou neodešle.

#### --why--
Prohlížeč neodešle formulář. Požadavek na API ale pošle kdokoli i bez formuláře. Jak, ukáže hned první část.

### --correct--
Ano, API může zavolat i někdo, kdo formulář vůbec nepoužil.

#### --why--
Kontrola v prohlížeči je pohodlí pro uživatele, ne ochrana serveru.

### --answer--
Jen když je web na veřejné adrese.

#### --why--
I interní API volají skripty, jiné služby a kolegové s curl. Adresa na tom nic nemění.
:::

Po [workshopu API knihovny](see:api-http-rest/workshop-api-knihovny/012) víš, jak vypadá ruční kontrola vstupu: `typeof`, `Number.isInteger`, `trim`, pro každé pole pár řádků. U dvou polí to jde. Formulář registrace do knihovny jich má dvanáct, a každá routa kontroluje trochu jinak a vrací chyby v trochu jiném tvaru. Do toho jeden zapomenutý `try` a klient uvidí cestu k souborům na serveru.

> [!REMEMBER]
> **Všechno, co přijde po síti, je neověřený vstup, dokud neprojde schématem na serveru. Chyby opouštějí server na jednom místě, v jednom tvaru a bez vnitřností.**

## Nikdy nevěř klientovi

Formulář, `disabled` tlačítko i skrytá pole jsou jen v prohlížeči. Stejný požadavek pošleš curl bez formuláře:

```sh
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"productId": 12, "quantity": -3, "price": 1, "role": "admin"}'
```

Tři útoky v jednom těle. Záporné množství může vrátit peníze. Cena poslaná klientem znamená, že si kupující cenu určí sám. A když server uloží `{ ...body }`, uživatel si připsal roli. Poslední se říká *mass assignment*.

Z toho plynou tři pravidla:

- **Server kontroluje každé pole**: typ, rozsah, délku, povolené hodnoty.
- **Co může spočítat server, klient neposílá**: cenu, id, datum vytvoření, roli.
- **Uložený objekt skládej po klíčích** z ověřených dat, nikdy celé tělo.

:::check
Klient pošle `{"bookId": 3, "reader": "Eva Malá", "dueDate": "2099-12-31"}`. Server ukládá `loans.push({ id, ...body })`. Co je špatně?

### --answer--
Nic, klient poslal platná data.

#### --why--
Data mají platný tvar, jenže `dueDate` nemá klient co určovat. Čtenář by si právě prodloužil výpůjčku o 73 let.

### --correct--
Klient si sám nastavil datum vrácení. Server má výpůjčku složit jen z `bookId` a `reader` a datum spočítat sám.

#### --why--
Spread celého těla uloží všechno, co klient poslal, i pole, která mu nepatří.

### --answer--
`push` je pomalý, výpůjčku je lepší uložit přes `concat`.

#### --why--
Způsob uložení s bezpečností nesouvisí. Problém je v tom, **co** se ukládá.
:::

## Schéma v Zodu na serveru

Místo ručních `if` popíšeš tvar dat jednou jako schéma. Zod znáš z [validace na hranici](see:nastroje-typescript/validace-na-hranici#zod-validace-a-typy-v-jednom), na serveru ho použiješ úplně stejně:

```js
import { z } from 'zod';

const LoanInput = z.object({
  bookId: z.number().int().positive(),
  reader: z.string().trim().min(1).max(100),
});

const result = LoanInput.safeParse(body);
if (!result.success) {
  // result.error.issues: [{ path: ['reader'], message: 'Too small: …' }, …]
}
const { bookId, reader } = result.data;
```

Tři vlastnosti schématu, které se na serveru hodí:

- `result.data` obsahuje **jen klíče ze schématu**. `role: 'admin'` z těla v něm není, `z.object` neznámé klíče zahodí.
- `result.data` je **už upravený** vstup: `trim()` odstranil mezery, takže `' Eva '` je `'Eva'`.
- Chyby jsou data: `issues` mají `path` a `message`, ze kterých složíš odpověď pro každé pole.

Query parametry přicházejí jako text. `z.coerce.number()` je před kontrolou převede na číslo. Předpověz, co vypíše:

:::live node predict
```js
import { z } from 'zod';

const Query = z.object({ page: z.coerce.number().int().min(1).default(1) });

console.log(Query.parse({}).page);
console.log(Query.safeParse({ page: '2' }).data.page + 1);
console.log(Query.safeParse({ page: 'abc' }).success);
```
--question-- Co vypíšou tři řádky?
--output--
```text
1
3
false
```
--why-- Chybějící `page` je `undefined`, takže nastoupí `default(1)`. Text `'2'` převede `coerce` na číslo, a proto je `2 + 1` opravdu `3`, ne `'21'` jako u `URLSearchParams`. A `Number('abc')` je `NaN`, které `int()` odmítne. Pozor na `searchParams.get`: chybějící parametr vrací `null`, ne `undefined`, a `default` pak nezabere. Schématu proto předávej `Object.fromEntries(searchParams)`.
:::

:::check
Proč se po úspěšném `safeParse` pracuje s `result.data`, a ne dál s `req.body`?

### --answer--
`req.body` po validaci Zod smaže.

#### --why--
Zod vstup nemění, vrací nový objekt. Původní tělo zůstává i s tím, co v něm nemá být.

### --correct--
`result.data` obsahuje jen povolené klíče a hodnoty po úpravách schématu, jako je `trim` nebo `coerce`.

#### --why--
`req.body` pořád obsahuje i neznámé klíče a neořezané texty. Validace by pak chránila jen napůl.

### --answer--
Je to jen konvence, obojí obsahuje totéž.

#### --why--
Neobsahuje. Z těla `{ "reader": " Eva ", "role": "admin" }` zůstane v `req.body` všechno, v `result.data` jen `{ reader: "Eva" }`.
:::

## 400, nebo 422

Chyba vstupu má dvě úrovně a každá svůj kód:

| co je špatně | příklad | kód |
|---|---|---|
| tělo nejde přečíst | `{"bookId": 3` bez závorky, prázdné tělo, `null` místo objektu | `400` |
| tělo je v jiném formátu | `Content-Type: text/plain` | `415` |
| tělo je moc velké | 5 MB JSON | `413` |
| data porušují schéma | `bookId: "tři"`, prázdný `reader` | `422` |
| data jsou v pořádku, ale střetnou se se stavem | kniha je vypůjčená | `409` |

Odpověď `422` vrací chyby **ke každému poli**, aby je frontend ukázal u správného políčka formuláře:

```json
{
  "title": "Výpůjčka nemá platná data",
  "status": 422,
  "errors": [
    { "field": "bookId", "message": "Invalid input: expected number, received string" },
    { "field": "reader", "message": "Too small: expected string to have >=1 characters" }
  ]
}
```

`field` složíš z `issue.path.join('.')`. Vnořené pole `address.city` tak dostane přesnou cestu.

:::check
Tělo požadavku je text `null` (platný JSON). Jaký kód vrátíš, když API rozlišuje 400 a 422?

### --expected--
400

### --accept--
422

### --why--
`null` je platný JSON, ale nedá se z něj vůbec číst jako objekt s poli, proto většina API vrací `400`. Když `null` pustíš do schématu, Zod vrátí chybu `expected object` s prázdnou cestou a `422` s ní je taky obhajitelné. Hlavně ať server nespadne na `null.bookId` a nevrátí `500`.
:::

## Centrální zpracování chyb

Když má každý handler vlastní `try/catch` a vlastní tvar odpovědi, jedna routa vrátí `{"error"}`, druhá `{"message"}` a třetí zapomene `catch` úplně. Lepší je chyby v handlerech **vyhodit** a zpracovat je na jednom místě. Vlastní třídu chyby znáš z [lekce o vlastních chybách](see:js-chyby-ladeni/vlastni-chyby#vlastni-trida-chyby):

```js
export class HttpError extends Error {
  constructor(status, title) {
    super(title);
    this.name = 'HttpError';
    this.status = status;
  }
}

// v handleru: throw new HttpError(404, 'Výpůjčka nenalezena.');

function toProblem(error) {
  if (error instanceof HttpError) return { status: error.status, title: error.message };
  if (error instanceof z.ZodError) return { status: 422, title: 'Neplatná data', errors: formatIssues(error.issues) };
  console.error(error);
  return { status: 500, title: 'Na serveru se něco pokazilo.' };
}
```

V čistém Node se `toProblem` volá v jediném `catch` kolem celého zpracování požadavku. Express má pro totéž *error middleware*, to uvidíš ve [workshopu API ve frameworku](see:api-http-rest/workshop-api-ve-frameworku/009).

:::check
Handler vyhodí `new HttpError(409, 'Kniha je právě vypůjčená.')`. Co dostane klient, když centrální zpracování vypadá jako `toProblem` výše?

### --answer--
`500`, protože každá vyhozená výjimka je chyba serveru.

#### --why--
Tak by to bylo bez centrálního zpracování. `toProblem` ale nejdřív pozná `HttpError` a použije jeho stav.

### --correct--
Stav `409` a `title` „Kniha je právě vypůjčená."

#### --why--
`instanceof HttpError` rozezná očekávanou chybu, kterou handler vyhodil úmyslně, od skutečné chyby programu.

### --answer--
Nic, požadavek zůstane viset.

#### --why--
Visel by, kdyby výjimku nikdo nezachytil a odpověď se nikdy neposlala. Tady ji zachytí centrální `catch`.
:::

## Co nesmí uniknout

Tohle vrátil skutečný server na `GET /api/books?sort=titel`:

```json
{
  "error": "SqliteError: no such column: titel",
  "stack": "at Database.prepare (/home/knihovna/app/node_modules/better-sqlite3/lib/methods/wrappers.js:5:21)"
}
```

Útočník se právě dozvěděl, že běží SQLite, jak se jmenují sloupce a kde leží aplikace na disku. Klientovi nepatří:

- stack trace a text výjimky u `500` (`error.message` může obsahovat SQL i data jiných uživatelů),
- cesty k souborům, verze knihoven a hlavička `X-Powered-By`,
- vnitřní id a pole, která mu nepatří (hash hesla, poznámky knihovníka).

Úplnou chybu zapiš do **logu na serveru** a klientovi pošli obecnou zprávu. Když k oběma přidáš stejné id požadavku, najdeš chybu v logu podle toho, co ti uživatel nahlásil.

:::check
Kterou odpověď na neočekávanou chybu smí server poslat?

### --answer--
`500` a `{"title": "Cannot read properties of undefined (reading 'bookId')"}`

#### --why--
Text výjimky prozrazuje, jak je kód napsaný, a u jiných chyb může obsahovat i data nebo SQL. Patří do logu.

### --correct--
`500` a `{"title": "Na serveru se něco pokazilo.", "requestId": "c81f2a"}`

#### --why--
Klient ví, že chyba není na jeho straně, a s id požadavku najdeš podrobnosti v logu.

### --answer--
`200` a `{"title": "Zkuste to později."}`

#### --why--
Chyba se stavem `200` projde přes `response.ok` a frontend ji bude považovat za úspěch.
:::

## Limit těla

Tělo požadavku je proud a čteš ho po kouscích. Bez limitu pošle kdokoli 2 GB a server se je pokusí držet v paměti, dokud nespadne. Proto má každé čtení těla strop, pro JSON API stačí desítky až stovky kilobajtů (Express má výchozí `100kb`):

```js
const MAX_BODY_BYTES = 100_000;

export async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'Tělo požadavku je příliš velké.');
    chunks.push(chunk);
  }
  // …JSON.parse, při chybě HttpError(400)
}
```

Počítá se v **bajtech**, ne ve znacích: `č` v UTF-8 zabere dva bajty, proto `chunk.length`, ne délka textu.

:::check
Jaký stavový kód vrátíš, když tělo požadavku překročí limit?

### --expected--
413

### --accept--
413 Content Too Large
413 Payload Too Large

### --why--
`413 Content Too Large` (dřív *Payload Too Large*) říká, že problém není v obsahu, ale ve velikosti. Klient může poslat menší kus.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`parse` bez centrálního zpracování.** `LoanInput.parse(body)` na neplatných datech vyhodí `ZodError`. Když ho nic nezachytí, čistý Node server spadne s `Uncaught ZodError` a u Expressu dostane klient `500` s HTML stránkou. Oprava: `safeParse`, nebo převod `ZodError` na `422` v centrálním zpracování.

> [!PITFALL]
> **`z.coerce.number()` z prázdného textu.** `Number('')` je `0`, takže `?limit=` projde schématem `z.coerce.number().int().min(0)` jako nula. Oprava: dolní mez, která nulu vylučuje, nebo `z.string().regex(/^\d+$/)` před převodem.

> [!PITFALL]
> **Validace, a pak `req.body`.** Schéma ořízlo `reader` a zahodilo `role`, ale handler ukládá `req.body.reader` a `...req.body`. Validace proběhla, jen se její výsledek nepoužil. Oprava: dál pracuj výhradně s `result.data`.

> [!PITFALL]
> **`error.message` v odpovědi `500`.** Obecný `catch` posílá `{ error: error.message }` a klient uvidí `SqliteError: UNIQUE constraint failed: readers.email` i s názvem tabulky. Oprava: u neočekávaných chyb obecná zpráva, podrobnosti jen do logu.

:::check
Kolega používá schéma `z.object({ limit: z.coerce.number().int().min(0).max(50) })`. Co dostane handler pro `?limit=` (prázdná hodnota)?

### --answer--
Chybu `422`, protože prázdný text není číslo.

#### --why--
`coerce` hodnotu nejdřív převede přes `Number()`, a prázdný text se převede bez chyby.

### --correct--
`limit: 0`, validace projde.

#### --why--
`Number('')` je `0`, to je celé číslo v rozsahu 0 až 50. Handler pak vrátí prázdnou stránku a nikdo neví proč.

### --answer--
`limit: undefined`, protože hodnota chybí.

#### --why--
Parametr v adrese je, jen s prázdnou hodnotou. `URLSearchParams` z něj udělá prázdný text `''`, ne `undefined`.
:::

## Kde to najdeš v MDN

- [422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422) — kdy je požadavek syntakticky v pořádku, ale nejde zpracovat.
- [413 Content Too Large](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/413) — odpověď na příliš velké tělo.
- [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) — `SyntaxError` na neplatném JSON, ze kterého uděláš `400`.
- [Error.prototype.stack](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack) — co přesně stack obsahuje a proč nepatří do odpovědi.

# --questions--

## --question--

Registrační API ukládá čtenáře příkazem `readers.push({ id: nextId(), ...result.data })`, kde schéma je `z.object({ name: z.string().min(1), email: z.email() })`. Klient pošle i `"isAdmin": true`. Bude nový čtenář správce?

### --answer--
Ano, spread zkopíruje všechny klíče z těla.

#### --why--
Spread by to udělal s `req.body`. Tady se kopíruje `result.data`, a v něm jsou jen klíče ze schématu.

### --correct--
Ne, `z.object` neznámý klíč `isAdmin` do `result.data` nepustí.

#### --why--
`z.object` nepopsané klíče zahodí. Kdyby handler spreadoval `req.body`, `isAdmin` by se uložil.

### --answer--
Ne, protože Zod vrátí chybu `422` kvůli neznámému klíči.

#### --why--
Chybu na neznámé klíče vrací `z.strictObject`. Obyčejný `z.object` je tiše zahodí a validace projde.

### --see--
api-http-rest/validace-a-chyby-api#schema-v-zodu-na-serveru

## --question--

`POST /api/loans` dostane tělo `{"bookId": 3, "reader": "Eva Malá"` (chybí koncová závorka). Napiš stavový kód, který server vrátí.

### --expected--
400

### --accept--
400 Bad Request

### --why--
Tělo nejde přečíst jako JSON, takže se k validaci schématem ani nedostaneš. `422` je až pro data, kterým server rozumí, ale porušují pravidla.

### --see--
api-http-rest/validace-a-chyby-api#400-nebo-422

## --question--

Zod vrátil issue s `path: ['address', 'zip']`. Napiš hodnotu pole `field`, kterou pošleš klientovi, když `field` skládáš přes `issue.path.join('.')`.

### --expected--
address.zip

### --why--
`join('.')` spojí cestu tečkou. Frontend podle ní najde vnořené políčko PSČ v části formuláře s adresou.

### --see--
api-http-rest/validace-a-chyby-api#400-nebo-422
