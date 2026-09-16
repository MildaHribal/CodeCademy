# Z vývoje do produkce

:::check pretest
Server na tvém notebooku běží bez chyby. Po nasazení na hosting spadne hned při startu s hláškou `Error: listen EACCES: permission denied 0.0.0.0:80`. Co myslíš, kde je problém?

### --answer--
V kódu je syntaktická chyba, kterou notebook přehlédl.

#### --why--
Syntaktická chyba by spadla stejně i u tebe. Kód je tentýž, liší se prostředí, ve kterém běží.

### --correct--
Server má port zapsaný natvrdo, a na hostingu ho nesmí použít nebo má poslouchat jinde.

#### --why--
Port, cesta k databázi nebo adresa jiné služby se mezi počítači liší. Proto patří do konfigurace z prostředí, ne do kódu.

### --answer--
Hosting nepodporuje Node.
:::

Na notebooku server spouštíš ručně, databáze leží ve složce projektu, heslo k platební
bráně máš v kódu „jen na chvíli" a když se něco pokazí, podíváš se do terminálu.
V produkci nic z toho neplatí. Server spouští a vypíná cizí program, běží na počítači,
kam se nepřihlásíš, a jeho chybu uvidí dřív zákazník než ty.

Tahle lekce projde, co musí aplikace umět, aby ji šlo nasadit na jakýkoli hosting
nebo do Dockeru: vzít si nastavení z prostředí, neprozradit tajemství, říct, jestli je
zdravá, a slušně skončit, když ji někdo vypíná.

> [!REMEMBER]
> **Tentýž kód běží všude, liší se jen konfigurace z prostředí. A o životě procesu rozhoduje cizí správce, ne ty.**

## Vývoj a produkce: co se změní

| | vývoj (*development*) | produkce (*production*) |
|---|---|---|
| kdo spouští | ty, `node server.js` | správce procesů: Docker, systemd, platforma |
| kdo vypíná | ty, Ctrl+C | správce procesů při nasazení nové verze, škálování, restartu stroje |
| data | pokusná, klidně smazat | skutečná, zálohovaná |
| chyby | vidíš v terminálu | musíš je najít v lozích |
| nastavení | výchozí hodnoty | proměnné prostředí od hostingu |

V Node se zavedla konvence proměnné `NODE_ENV`. Když je `production`, knihovny se
přepnou do úspornějšího režimu (Express třeba přestane posílat stack trace v chybových
stránkách a začne cachovat šablony) a `npm ci --omit=dev` nenainstaluje vývojové
závislosti. Hodnota se nastavuje zvenku:

```sh
NODE_ENV=production PORT=8080 node server.js
```

`NODE_ENV` ale říká jen „optimalizuj pro ostrý provoz", ne *kde* běžíš. Testovací
server (*staging*) má mít `NODE_ENV=production` taky, jinak by se choval jinak než ostrý
a testoval bys něco jiného, než nasadíš.

> [!NOTE]
> K tomu, kdo přesně proces spouští a vypíná — Docker, platforma nebo systemd — se
> dostaneme v lekci [Kontejnery, servery a HTTPS](see:nasazeni-provoz/kontejnery-a-servery#image-a-kontejner).

:::check
Tým má dva servery: `staging` na zkoušení a ostrý web. Jak má mít staging nastavené `NODE_ENV`?

### --answer--
`NODE_ENV=staging`, aby se poznalo, kde aplikace běží.

#### --why--
Myslíš si, že `NODE_ENV` popisuje místo? Knihovny znají jen `production`; s jinou hodnotou se staging přepne do vývojového režimu a testuješ jinou aplikaci, než nasadíš.

### --correct--
`NODE_ENV=production`; kde aplikace běží, řekne jiná proměnná.

#### --why--
Staging má běžet co nejpodobněji ostrému provozu. Pro rozlišení prostředí si zaveď vlastní proměnnou, třeba `APP_ENV=staging`.

### --answer--
Nechat ho prázdné, na stagingu na tom nezáleží.

#### --why--
Prázdné `NODE_ENV` knihovny berou jako vývoj. Chyba, která se v produkčním režimu projeví jinak, pak na stagingu neuvidíš.
:::

## Konfigurace z prostředí

Všechno, co se mezi prostředími liší, čte aplikace z [[proměnná prostředí|proměnných prostředí]]
— jak jsi to viděl v [sekci o Node](see:node-zaklady/co-je-node#process-program-a-svet-kolem-nej).
V praxi je jich víc než jen `PORT`, a proto se čtou **na jednom místě** při startu:

```js
// config.js
export function loadConfig(env) {
  const isProduction = env.NODE_ENV === 'production';
  if (isProduction && !env.DATABASE_URL) {
    throw new Error('Chybí proměnná prostředí DATABASE_URL.');
  }
  return {
    port: Number(env.PORT ?? 3000),
    databaseUrl: env.DATABASE_URL ?? 'postgres://localhost:5432/eshop_dev',
    paymentApiUrl: env.PAYMENT_API_URL ?? 'https://sandbox.platby.example',
  };
}
```

```js
// server.js
const config = loadConfig(process.env);
```

Proč funkce, která dostane `env` jako parametr, a ne `process.env` rozházené po kódu:

- Na jednom místě vidíš, co aplikace potřebuje. Nový kolega nemusí hledat
  `process.env` v třiceti souborech.
- Převod na správný typ (`Number`, `=== 'true'`) se udělá jednou.
- Chybějící povinná hodnota shodí aplikaci **hned při startu**, ne za tři hodiny na
  prvním požadavku, který databázi potřebuje. Tomu se říká [[rychlé selhání]] (*fail fast*):
  nasazení se zastaví a stará verze běží dál.
- Funkci otestuješ s obyčejným objektem `{ NODE_ENV: 'production' }`.

Proměnné prostředí jsou **vždy řetězce**. Past je vidět nejlépe na obyčejném objektu:

:::live js predict
```js
const env = { PORT: '8080', DEBUG: 'false' };
const nextPort = env.PORT + 1;
console.log(nextPort, env.DEBUG ? 'ladění zapnuto' : 'ladění vypnuto');
```
--question-- Co vypíše `console.log`?
--expected-- 80801 ladění zapnuto
--why-- `'8080' + 1` spojí řetězce. A `'false'` je neprázdný řetězec, tedy pravdivá hodnota. Zkus změnit první řádek výpočtu na `Number(env.PORT) + 1` a podmínku na `env.DEBUG === 'true'`.
:::

:::check
V `config.js` je `retries: env.RETRIES || 3`. Hosting nastaví `RETRIES=0`, protože opakování nechceš. Kolik bude `config.retries`?

### --expected--
'0'

### --accept--
"0"
řetězec '0'

### --why--
`'0'` je neprázdný řetězec, takže `||` ho nechá — ale jako řetězec. Kdyby ho někdo převedl na číslo až po `||` (`Number(env.RETRIES) || 3`), dostal by 3, protože `0` je nepravdivé. Správně: `Number(env.RETRIES ?? 3)`.
:::

## `.env` a tajemství

Heslo k databázi, klíč k platební bráně nebo tajný klíč pro podpis session jsou
[[tajemství]] (*secrets*). Kdo je zná, může se tvářit jako tvoje aplikace. Proto
**nikdy nejsou v Gitu** — ani v soukromém repozitáři, ani „jen na chvíli". Historie
Gitu si pamatuje všechno a smazání v dalším commitu nic nevrací.

Na vývojovém počítači je držíš v souboru `.env`, který Git ignoruje:

```sh
# .env — jen na tvém počítači, v .gitignore
DATABASE_URL=postgres://eshop:tajne-heslo@localhost:5432/eshop_dev
PAYMENT_API_KEY=sk_test_51Hq…
```

Node soubor načte sám, bez balíčku:

```sh
node --env-file=.env server.js
```

Do repozitáře patří `.env.example` se jmény proměnných a vymyšlenými hodnotami, aby
nový člověk věděl, co vyplnit. Na serveru `.env` není: tajemství zadáš do nastavení
hostingu nebo CI a proces je dostane jako proměnné prostředí.

> [!PITFALL]
> Tajemství v kódu frontendu není tajemství. Všechno, co se pošle do prohlížeče
> (i proměnné, které bundler vloží do JavaScriptu), si přečte každý v DevTools.
> Klíč k platební bráně smí znát jen server.

Když tajemství uteče (commit, snímek obrazovky, log), nestačí ho smazat. Musíš ho
**zneplatnit a vydat nové** — u poskytovatele služby, hned.

:::check
Kolega omylem commitnul a pushnul `.env` s klíčem k platební bráně. Hned v dalším commitu soubor smazal. Co ještě musí udělat?

### --answer--
Nic, soubor už v repozitáři není.

#### --why--
Myslíš si, že smazání soubor odstraní? Starý commit v historii zůstal a kdokoli s přístupem k repozitáři si ho přečte.

### --correct--
Klíč u platební brány zneplatnit, vydat nový a přidat `.env` do `.gitignore`.

#### --why--
Uniklé tajemství se musí považovat za prozrazené. Pomůže jen nový klíč; `.gitignore` zabrání dalšímu omylu.

### --answer--
Přejmenovat proměnnou v kódu, aby útočník nevěděl, jak se klíč jmenuje.

#### --why--
Jméno proměnné útočníka nezajímá, zajímá ho hodnota klíče. Ta pořád platí.
:::

## Health check

Správce procesů potřebuje vědět, jestli aplikace žije a zvládne obsloužit požadavek.
K tomu slouží [[health check]]: jednoduchá adresa, typicky `GET /health`, která odpoví
`200`, když je vše v pořádku, a `503 Service Unavailable`, když ne.

```js
if (req.method === 'GET' && pathname === '/health') {
  try {
    db.prepare('SELECT 1').get();
    return sendJson(res, 200, { status: 'ok' });
  } catch {
    return sendJson(res, 503, { status: 'error' });
  }
}
```

Kdo se ptá a co s odpovědí udělá:

- **Docker a orchestrace** — kontejner, který opakovaně neodpovídá, restartují.
- **Nasazení bez výpadku** — nová verze dostane provoz, až když health check projde.
  Když neprojde, nasazení se zastaví a stará verze běží dál.
- **Monitoring** — služba, která se zvenku ptá každou minutu, ti pošle zprávu, když
  web nejede.

Health check, který vrací `200` natvrdo, prozradí jen to, že proces běží. Aplikace
bez databáze je ale pro uživatele stejně mrtvá, proto se typicky ověří i spojení
s databází jednoduchým dotazem. Pomalé nebo drahé kontroly (volání cizích API) sem
nepatří — ptá se často a jeho výpadek by restartoval zdravou aplikaci.

> [!TIP]
> Health check nevrací nic tajného: žádnou verzi knihoven, adresu databáze ani text
> chyby. Adresa je obvykle veřejná.

:::check
Health check aplikace volá přes síť API platební brány. Brána má výpadek na 10 minut. Co se stane, když Docker kontejnery s neúspěšným health checkem restartuje?

### --answer--
Nic, restart aplikaci s bránou pomůže.

#### --why--
Restart nespraví cizí službu. Aplikace po startu dostane stejnou chybu.

### --correct--
Docker bude restartovat zdravé kontejnery pořád dokola a web nepůjde ani tam, kde by brána nebyla potřeba.

#### --why--
Health check má ověřovat, co je v moci aplikace (proces, vlastní databáze). Výpadek cizí služby řeší aplikace sama, třeba hláškou u platby.

### --answer--
Docker pozná, že chyba je v bráně, a kontejner nechá být.

#### --why--
Docker vidí jen stavový kód odpovědi. Neví, proč health check selhal.
:::

## `SIGTERM`: korektní ukončení

Když se nasazuje nová verze, správce procesů starý proces nezabije hned. Pošle mu
**signál** `SIGTERM` („prosím skonči") a počká — Docker 10 sekund. Když proces
do té doby neskončí, pošle `SIGKILL`, který se nedá zachytit ani odložit.

Bez vlastní obsluhy Node na `SIGTERM` okamžitě skončí. Požadavek, který se zrovna
zpracovával (platba, nahrávání souboru), klient nikdy nedokončí:

:::live node predict
```js
import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const server = createServer(async (req, res) => {
  await delay(2000); // export faktur trvá dvě sekundy
  res.end('hotovo');
});
server.listen(8080);
```
--question-- Klient pošle požadavek a po jedné sekundě správce pošle procesu `SIGTERM`. Co klient dostane?
--option-- Odpověď `hotovo` — Node požadavek dokončí a teprve pak skončí.
--option*-- Žádnou odpověď, spojení se přeruší.
--option-- Odpověď `503`, protože server se vypíná.
--output--
```text
$ curl localhost:8080
curl: (52) Empty reply from server
```
--why-- Výchozí reakce Node na `SIGTERM` je okamžitý konec procesu. Rozpracovaný požadavek se nedokončí a server nic neposlal, ani `503`.
:::

[[korektní ukončení|Korektní ukončení]] (*graceful shutdown*) má pevné pořadí:

```js
process.on('SIGTERM', () => {
  console.log('Dostal jsem SIGTERM, končím');
  // 1. nepřijímej nová spojení, počkej na rozpracované požadavky
  server.close(() => {
    // 2. až potom zavři databázi
    db.close();
    // 3. skonči s kódem 0 = v pořádku
    process.exit(0);
  });
});
```

`server.close(callback)` přestane přijímat nová spojení a callback zavolá, až se
zavře poslední otevřené. Databázi zavřeš až v něm — kdybys ji zavřel hned, rozpracovaný
požadavek by na ni sáhl a spadl.

> [!PITFALL]
> `server.close()` čeká i na **keep-alive spojení**: prohlížeč i `fetch` nechávají
> spojení po odpovědi otevřené pro další požadavek. Node při volání `close` zavře ta,
> která jsou zrovna nečinná, ale spojení, které se uvolní až po odpovědi rozpracovaného
> požadavku, zůstane viset (výchozí `keepAliveTimeout` je 5 s). Příznak: proces po
> `SIGTERM` „visí" a správce ho po limitu zabije. Oprava: odpovědi během ukončování
> posílej s hlavičkou `Connection: close` a pro jistotu nastav časovač, který proces
> po limitu ukončí sám s kódem `1`.

:::explain
Vysvětli, proč se v obsluze `SIGTERM` zavírá databáze až v callbacku `server.close`, a ne hned za ním.

## --model--
`server.close` jen přestane přijímat nová spojení, rozpracované požadavky ještě běží a můžou sahat do databáze. Callback se zavolá, až skončí poslední spojení. Kdybych databázi zavřel hned, rozpracovaný požadavek by spadl na zavřeném spojení a klient by dostal chybu místo odpovědi.

## --checklist--
- `server.close` nečeká synchronně, jen přestane přijímat nová spojení.
- Rozpracované požadavky po `close` ještě běží a potřebují databázi.
- Callback se zavolá, až skončí poslední spojení.
- Zavřená databáze by rozpracovaný požadavek shodila.
:::

:::check
Správce procesů po `SIGTERM` čeká 10 sekund. Co se stane s procesem, který za tu dobu neskončí?

### --expected-- ignore-case
SIGKILL

### --accept--
dostane SIGKILL
zabije ho SIGKILL
zabije ho

### --why--
Po limitu přijde `SIGKILL`, který proces nemůže zachytit — skončí okamžitě, i uprostřed zápisu. Proto vlastní časovač, který skončí o chvíli dřív a stihne to zalogovat.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Port natvrdo.** `server.listen(3000)` na platformě, která přiděluje port přes
> `PORT`, skončí tím, že health check nikdy neprojde: aplikace poslouchá jinde, než se
> platforma ptá. Příznak v logu platformy: `Health check failed` nebo
> `Application failed to respond`. Oprava: `Number(process.env.PORT ?? 3000)`.

> [!PITFALL]
> **Server naslouchá jen na `localhost`.** `server.listen(port, '127.0.0.1')` v Dockeru
> přijímá spojení jen zevnitř kontejneru, zvenku přijde `curl: (52) Empty reply from server`
> nebo `connection refused`. Oprava: adresu vynech (Node pak poslouchá na všech
> rozhraních) nebo ji vezmi z konfigurace.

> [!PITFALL]
> **Spouštění přes `npm start` v produkci.** npm signál `SIGTERM` nemusí předat dál
> tvému procesu, tvoje obsluha se nezavolá a správce proces po limitu zabije. Příznak:
> každé nasazení trvá přesně 10 s a v lozích chybí „končím". Oprava: spouštěj přímo
> `node server.js`.

> [!PITFALL]
> **`.env` v Gitu.** Stačí jeden `git add .` bez `.gitignore`. Oprava: `.env` do
> `.gitignore` hned při založení projektu; když už uteklo, zneplatni tajemství.

:::check
Po nasazení na platformu aplikace v logu napíše `Server běží na portu 3000`, ale platforma hlásí `Application failed to respond`. Proměnná `PORT` je `10000`. Co je nejpravděpodobnější příčina?

### --answer--
Aplikace je pomalá a platforma nečekala dost dlouho.

#### --why--
Log ukazuje, že server už poslouchá. Neodpovídá proto, že se platforma ptá na jiném portu.

### --correct--
Port je v kódu natvrdo a proměnnou `PORT` aplikace ignoruje.

#### --why--
Platforma posílá provoz na port z `PORT`, aplikace ale poslouchá na 3000. Stačí číst port z prostředí.

### --answer--
Chybí `NODE_ENV=production`.

#### --why--
`NODE_ENV` mění chování knihoven, ne port, na kterém server poslouchá.
:::

## Kde to najdeš v MDN

- [503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503) — stavový kód pro health check, když služba dočasně nezvládá požadavky.
- [Connection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Connection) — hlavička `Connection: close`, kterou server řekne klientovi, že spojení po odpovědi zavře.
- [Keep-Alive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Keep-Alive) — proč spojení po odpovědi zůstává otevřené.
- Mimo MDN: v dokumentaci Node hledej `server.close()` (modul `http`) a `--env-file` (Command-line API).

# --questions--

## --question--

Aplikace čte `const debug = process.env.DEBUG === 'true'`. V nastavení hostingu je `DEBUG=True`. Jaká bude hodnota `debug`?

### --expected--
false

### --why--
Porovnání řetězců rozlišuje velká a malá písmena: `'True' === 'true'` je `false`. Proto se hodnoty z prostředí buď normalizují (`.toLowerCase()`), nebo dokumentují přesně.

### --see--
nasazeni-provoz/produkcni-rezim#konfigurace-z-prostredi

## --question--

Proč má `loadConfig` shodit aplikaci při startu, když chybí povinná proměnná, místo aby vrátila výchozí hodnotu nebo spadla až při prvním dotazu do databáze?

### --answer--
Protože výjimka při startu je rychlejší než výjimka za běhu.

#### --why--
Rychlost vyhození výjimky tu nehraje roli. Jde o to, kdy se chybu dozvíš a co mezitím běží.

### --correct--
Nasazení s chybnou konfigurací selže hned, health check neprojde a stará verze běží dál.

#### --why--
Chyba se ukáže při nasazení, ne až uživateli. Výchozí hodnota v produkci by aplikaci potichu připojila k vývojové databázi nebo k ničemu.

### --answer--
Protože bez toho by `process.env` vrátilo chybu.

#### --why--
Chybějící proměnná v `process.env` je jen `undefined`, žádná chyba. Právě proto ji musíš zkontrolovat sám.

### --see--
nasazeni-provoz/produkcni-rezim#konfigurace-z-prostredi

## --question--

Jakou číselnou hodnotou (exit kódem) má proces skončit po korektním ukončení na `SIGTERM`?

### --expected--
0

### --accept--
process.exit(0)

### --why--
Kód `0` znamená „skončil jsem v pořádku". Nenulový kód (typicky `1`) správce procesů bere jako pád — třeba po vypršení vlastního časovače.

### --see--
nasazeni-provoz/produkcni-rezim#sigterm-korektni-ukonceni
