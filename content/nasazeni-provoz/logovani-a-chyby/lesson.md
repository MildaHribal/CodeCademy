# Logování a monitoring

:::check pretest
Zákazník napíše: „Včera kolem osmé večer mi neprošla objednávka." Server za den obslouží 40 000 požadavků a loguje řádky jako `Chyba při ukládání`. Jak tu jednu chybu v lozích najdeš?

### --answer--
Vyhledám text `Chyba při ukládání`.

#### --why--
Takových řádků může být za večer sto a žádný neřekne, ke kterému zákazníkovi nebo požadavku patří.

### --correct--
Bez času, identifikátoru požadavku a dalších údajů v každém řádku ji spolehlivě nenajdu.

#### --why--
Log, který se dá prohledávat, nese u každé události kontext: čas, úroveň, id požadavku, cestu, stav. Právě to přinášejí strukturované logy.

### --answer--
Podívám se do terminálu na serveru.

#### --why--
Na produkčním serveru terminál nemáš a výstup procesu sbírá platforma nebo Docker. Hledáš v lozích, ne v okně.
:::

V produkci nevidíš terminál. Když aplikace spadne ve tři ráno nebo zákazník napíše,
že mu „to nejde", zbudou ti jen **logy** — co aplikace sama o sobě zapsala — a
**monitoring**, který si všiml, že něco nejede. Log typu `console.log('tady')` ti
nepomůže. Tahle lekce ukáže, jak psát logy, které se dají prohledávat, a co do nich
nesmí.

> [!REMEMBER]
> **Log je data pro stroj, ne zpráva pro člověka: jedna událost = jeden řádek JSON s kontextem, který chybu spojí s požadavkem.**

## Strukturované logy

Porovnej dva řádky o téže události:

```text
Objednávka 5812 uložena za 312 ms pro jana@example.com
```

```json
{"time":"2026-09-14T19:02:11.481Z","level":"info","msg":"Objednávka uložena","orderId":5812,"durationMs":312,"requestId":"a3f1c9e2"}
```

První se čte hezky, ale když chceš „všechny objednávky pomalejší než 1 sekunda",
musíš psát regulární výraz a doufat, že nikdo nezměnil větu. Druhý je
[[strukturovaný log]]: nástroj na logy (Grafana Loki, Better Stack, CloudWatch…) každé
pole rozparsuje a hledáš dotazem `durationMs > 1000`.

Pravidla, která se v praxi drží:

- **Jeden řádek = jedna událost.** Víceřádkový výpis (stack trace přes `console.log`)
  se v nástroji rozpadne na desítky nesouvisejících řádků. Stack trace patří do
  jednoho pole jako řetězec.
- **`msg` je stálý text, proměnné jdou do polí.** `'Objednávka uložena'` + `{ orderId }`,
  ne `` `Objednávka ${id} uložena` `` — podle stálého textu pak spočítáš, kolikrát se
  událost stala.
- **Čas v UTC ve formátu ISO** (`new Date().toISOString()`), aby šly řádky z různých
  serverů seřadit.
- **Logy jdou na standardní výstup.** Aplikace nezapisuje do souborů, výstup procesu
  posbírá Docker nebo platforma. Rotaci a mazání starých souborů pak neřešíš v kódu.

Hotové knihovny (v Node nejčastěji `pino`) dělají přesně tohle a jsou rychlé.
Ve workshopu si jednoduchý logger napíšeš sám, abys věděl, co za tebe dělají.

Při zápisu chyby do JSON je jedna nepříjemná past:

:::live js predict
```js
const error = new Error('Platební brána neodpověděla');
console.log(JSON.stringify({ level: 'error', msg: 'Platba selhala', error }));
```
--question-- Co vypíše `console.log`?
--expected-- {"level":"error","msg":"Platba selhala","error":{}}
--why-- `message` a `stack` objektu `Error` nejsou vyčíslitelné vlastnosti, a `JSON.stringify` je proto vynechá. V logu pak zbyde prázdný objekt. Zkus místo `error` zapsat `error: error.stack` a sleduj, co se změní.
:::

:::check
Který řádek logu se bude v nástroji na logy nejlépe prohledávat podle id objednávky?

### --answer--
`console.log('Objednávka', order)` — objekt se vypíše celý.

#### --why--
`console.log` s objektem vypíše víceřádkový, pro člověka formátovaný text. Nástroj ho nerozparsuje jako pole.

### --correct--
`logger.info('Objednávka zaplacena', { orderId: order.id })`

#### --why--
Stálá zpráva a id v samostatném poli: dotaz `orderId = 5812` najde přesně tu událost.

### --answer--
`` logger.info(`Objednávka ${order.id} zaplacena`) ``

#### --why--
Id je schované v textu. Každá objednávka má jinou zprávu, takže nejde ani spočítat, kolikrát se událost stala.
:::

## Úrovně logů

Každý řádek nese [[úroveň logu]]. Běžné čtyři:

| úroveň | kdy | příklad |
|---|---|---|
| `debug` | podrobnosti pro ladění, v produkci vypnuté | „Dotaz do databáze trval 3 ms" |
| `info` | běžné události, které chceš vidět | „Server poslouchá", „Požadavek vyřízen" |
| `warn` | něco je špatně, ale aplikace si poradila | „Brána odpověděla až na třetí pokus" |
| `error` | něco selhalo a uživatel to pozná | „Uložení objednávky selhalo" |

Minimální úroveň se nastavuje z prostředí (`LOG_LEVEL=info`): logger zahodí všechno
pod ní. Při hledání chyby ji na chvíli snížíš na `debug` bez nové verze kódu.

Hlavní smysl úrovní je **upozornění**. Monitoring ti pošle zprávu, když za pět minut
přibude víc než deset řádků `error`. Když aplikace loguje jako `error` i to, že
uživatel zadal špatné heslo, zpráva chodí pořád — a za týden ji nikdo nečte.

:::check
Uživatel pošle formulář s neplatným e-mailem a server odpoví `400`. Jakou úroveň má mít řádek logu o téhle události?

### --answer--
`error`, protože požadavek neprošel.

#### --why--
Myslíš si, že každá odpověď 4xx je chyba aplikace? Aplikace se zachovala správně. Kdyby tohle bylo `error`, upozornění by chodilo při každém překlepu uživatele.

### --correct--
`info` (nebo žádný zvláštní řádek, stačí log požadavku se stavem 400).

#### --why--
Neplatný vstup je běžný provoz. `error` patří tomu, co selhalo na straně aplikace — typicky odpovědi 5xx.

### --answer--
`warn`, aby o tom tým věděl.

#### --why--
Tým s překlepem uživatele nic neudělá. `warn` patří situacím, kdy aplikace něco obcházela a stojí za to to sledovat.
:::

## Request id

Jeden požadavek zanechá v logu víc řádků: začátek, dotaz do databáze, volání brány,
chybu, konec. Mezi nimi jsou řádky stovky jiných souběžných požadavků. Spojí je
[[request id]]: náhodný identifikátor, který server přidělí požadavku na začátku
a zapíše do **každého** řádku, který k němu patří.

```js
import { randomUUID } from 'node:crypto';

const requestId = req.headers['x-request-id'] ?? randomUUID();
res.setHeader('X-Request-Id', requestId);
```

Dvě podrobnosti, proč právě takhle:

- **Převzít id z hlavičky.** Když před aplikací stojí proxy nebo jiná tvoje služba,
  pošle id v hlavičce `X-Request-Id`. Stejné id pak najdeš v lozích obou služeb.
- **Vrátit id v odpovědi.** Chybová stránka ukáže „Kód chyby: a3f1c9e2" a zákazník ho
  pošle podpoře. Podle něj najdeš v lozích přesně ten požadavek — i stack trace.

Chybová odpověď proto nese request id, ale nikdy text výjimky ani stack trace:

```json
{ "error": "Na serveru se něco pokazilo.", "requestId": "a3f1c9e2-7b1d-4c55-9a0e-5b2f3d8c1e44" }
```

:::explain
Vysvětli, proč server posílá request id i klientovi v odpovědi, když ho už zapisuje do logu.

## --model--
Klient, podpora ani uživatel do logu nevidí. Když dostanou id v odpovědi nebo na chybové stránce, můžou ho nahlásit a já podle něj v lozích najdu přesně ten jeden požadavek mezi tisíci jiných. Stack trace přitom zůstane jen v logu, ven nejde.

## --checklist--
- Klient ani uživatel do logů přístup nemají.
- Id v odpovědi jde nahlásit (podpora, chybová stránka).
- Podle id se v lozích najde přesně jeden požadavek.
- Podrobnosti chyby zůstávají v logu, ne v odpovědi.
:::

## Co do logu nepatří

Logy čte víc lidí a nástrojů než databázi: kolegové, externí služba na logy, záloha.
Často se drží měsíce. Proto v nich nesmí být nic, co by nesměl vidět každý z nich:

- **Hesla a tajemství** — hlavička `Authorization`, cookie se session, API klíče, tokeny
  pro obnovu hesla.
- **Tokeny v adrese** — `?token=…` v odkazu z e-mailu. Loguj `pathname`, ne celé
  `req.url`.
- **Celá těla požadavků** — formulář registrace obsahuje heslo, platba číslo karty.
- **Osobní údaje navíc** — e-mail, adresa, telefon. GDPR se vztahuje i na logy.
  Místo e-mailu stačí `userId`.

Nejspolehlivější obrana je loggeru výslovně zakázat citlivé klíče. Logger je
nahradí textem jako `[SKRYTO]`, ať je zavolá kdokoli:

```js
const SECRET_KEYS = ['password', 'token', 'authorization', 'cookie'];
```

:::check
Co je na tomhle řádku logu špatně? Vyber všechno.

```json
{"time":"2026-09-14T08:12:03.004Z","level":"info","msg":"Přihlášení","path":"/login?next=/ucet","email":"petra.kralova@example.com","password":"Jaro2026!","requestId":"7d0c2b1e"}
```

### --correct--
Obsahuje heslo v čitelné podobě.

#### --why--
Heslo nesmí být v logu nikdy — ani když přihlášení selže. Kdo čte logy, mohl by se přihlásit za uživatele.

### --correct--
Obsahuje e-mail, i když by k dohledání stačilo `userId`.

#### --why--
E-mail je osobní údaj. V logu, který čte víc lidí a drží se měsíce, stačí identifikátor.

### --answer--
Chybí stack trace.

#### --why--
Přihlášení je běžná událost úrovně `info`, žádná výjimka tu nenastala. Stack trace patří k chybám.

### --answer--
`time` má být v místním čase, ne v UTC.

#### --why--
Myslíš si, že místní čas je čitelnější? Servery a nástroje řadí události podle UTC; místní čas s letním časem by pořadí rozbil.
:::

## Sledování chyb

Log najdeš, když víš, co hledat. Na chyby, o kterých nevíš, je **sledování chyb**
(*error tracking*, třeba Sentry): knihovna v aplikaci pošle každou nezachycenou
výjimku službě, ta stejné chyby sloučí, spočítá, kolik uživatelů zasáhly, ukáže
stack trace se zdrojovým kódem a pošle ti upozornění na novou chybu.

Z pohledu kódu to znamená hlavně jedno: **nezachycené chyby se nesmí ztratit.**

```js
handleRequest(req, res).catch((error) => {
  logger.error('Neočekávaná chyba', { requestId, error: error.stack });
  if (!res.headersSent) {
    sendJson(res, 500, { error: 'Na serveru se něco pokazilo.', requestId });
  }
});
```

Bez `.catch` se výjimka z `async` funkce stane nezachyceným odmítnutím Promise
a Node celý proces ukončí — jeden špatný požadavek shodí server všem. Síť proti pádu
ale neopravuje chybu: dá ti čas ji najít a opravit. Předvídatelný špatný vstup má
dostat `400` z validace, ne `500` ze sítě.

:::check
Proč se ve `.catch` kontroluje `res.headersSent`, než se pošle `500`?

### --answer--
Aby se chyba nezalogovala dvakrát.

#### --why--
Logování s hlavičkami nesouvisí; zalogovat se má vždy.

### --correct--
Výjimka mohla nastat, když už handler začal posílat odpověď, a druhá odpověď by spadla.

#### --why--
Na jeden požadavek jde jen jedna odpověď. Po odeslání hlaviček by `writeHead` vyhodil `ERR_HTTP_HEADERS_SENT`.

### --answer--
Protože `500` se smí poslat jen na požadavky bez hlaviček.

#### --why--
Jde o hlavičky odpovědi, ne požadavku. Hlavičky požadavku má každý požadavek.
:::

## Metriky a uptime

Logy říkají, **co** se stalo. Metriky říkají, **kolik a jak rychle**, v čase:

- počet požadavků za minutu a podíl odpovědí 5xx,
- doba odpovědi — ne průměr, ale 95. percentil (jak dlouho čeká 5 % nejpomalejších),
- využití paměti a CPU, počet spojení k databázi.

Z metrik se staví grafy a upozornění („podíl 5xx je přes 2 % po dobu 5 minut").
Pro začátek je nejdůležitější **uptime monitoring**: externí služba (UptimeRobot,
Better Stack) každou minutu zavolá tvůj `/health` z internetu a pošle ti SMS nebo
e-mail, když neodpoví. Dozvíš se to dřív než zákazníci — a zvenku, takže to zachytí
i výpadek DNS nebo certifikátu, který zevnitř serveru neuvidíš.

:::check
Průměrná doba odpovědi API je 120 ms, 95. percentil 4 s. Co to říká?

### --answer--
API je rychlé, 4 s je jen chyba měření.

#### --why--
Percentil nemá s chybou měření nic společného. Říká, jak dlouho čekají nejpomalejší požadavky.

### --correct--
Většina požadavků je rychlá, ale každý dvacátý čeká přes 4 sekundy.

#### --why--
Průměr pomalé požadavky schová mezi mnoha rychlými. Percentil ukáže zážitek uživatelů, kteří mají smůlu — a ti píšou podpoře.

### --answer--
5 % požadavků skončilo chybou.

#### --why--
Percentil popisuje dobu odpovědi, ne úspěšnost. Pomalá odpověď může být úspěšná.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Stack trace přes `console.error(error)`.** Víceřádkový výpis se v nástroji na
> logy rozpadne na samostatné řádky bez úrovně a bez request id. Oprava: jeden řádek
> JSON s polem `error: error.stack`.

> [!PITFALL]
> **`JSON.stringify` s objektem `Error`.** V logu zbyde `"error":{}` a nevíš, co
> selhalo. Oprava: loguj `error.message` nebo `error.stack` jako řetězec.

> [!PITFALL]
> **Logování celého `req.url` nebo těla.** Token z odkazu pro obnovu hesla nebo heslo
> z registrace skončí v lozích na měsíce. Oprava: loguj `pathname` a vybraná pole,
> citlivé klíče nech logger přepsat na `[SKRYTO]`.

> [!PITFALL]
> **Všechno jako `error`.** Upozornění chodí pořád, tým je začne ignorovat a skutečný
> výpadek přehlédne. Oprava: `error` jen pro to, co selhalo na straně aplikace.

:::check
V lozích je u chyby jen `{"level":"error","msg":"Import selhal","error":{}}`. Volání vypadá jako `logger.error('Import selhal', { … })`. Co nejspíš stojí uvnitř složených závorek?

### --expected--
error: error

### --accept--
{ error }
error
{ error: error }

### --why--
Do logu se předal celý objekt `Error`. `JSON.stringify` jeho vlastnosti `message` a `stack` vynechá, protože nejsou vyčíslitelné. Oprava: `error: error.stack`.
:::

## Kde to najdeš v MDN

- [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) — které vlastnosti převod vynechá (nevyčíslitelné, `undefined`, funkce).
- [Error.prototype.stack](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack) — co obsahuje stack trace a že není standardní vlastnost.
- [Crypto: randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) — náhodné UUID; v Node je stejná funkce v modulu `node:crypto`.
- [Date.prototype.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) — čas v UTC ve formátu ISO 8601.

# --questions--

## --question--

Proč má `msg` v logu zůstat stálý text („Objednávka uložena") a id objednávky jít do samostatného pole?

### --answer--
Protože JSON neumí uložit text s číslem.

#### --why--
JSON text s číslem uloží bez problému. Jde o to, jak se v logu hledá a počítá.

### --correct--
Podle stálé zprávy jde spočítat, kolikrát událost nastala, a podle pole najít jednu konkrétní.

#### --why--
Zpráva s vloženým id je pokaždé jiná, takže ji nejde seskupit. Samostatné pole jde filtrovat přesně.

### --answer--
Kvůli úspoře místa v logu.

#### --why--
Místo je skoro stejné. Rozdíl je v tom, co s řádkem zvládne nástroj na logy.

### --see--
nasazeni-provoz/logovani-a-chyby#strukturovane-logy

## --question--

Logger má minimální úroveň `warn`. Kolik z těchto volání zapíše řádek: `logger.debug(…)`, `logger.info(…)`, `logger.warn(…)`, `logger.error(…)`?

### --expected--
2

### --why--
Zapíšou se úrovně od minimální výš: `warn` a `error`. `debug` a `info` logger zahodí.

### --see--
nasazeni-provoz/logovani-a-chyby#urovne-logu

## --question--

Zákaznice pošle podpoře snímek chybové stránky s textem „Kód chyby: 7d0c2b1e". Podle kterého pole v lozích budeš hledat?

### --expected--
requestId

### --accept--
request id
x-request-id

### --why--
Chybová stránka ukazuje request id z odpovědi. Stejné id je v každém řádku logu toho požadavku, včetně chyby se stack trace.

### --see--
nasazeni-provoz/logovani-a-chyby#request-id
