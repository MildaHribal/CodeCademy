# WebSockety

:::check pretest
Adresa WebSocketu začíná `wss://`. Znamená to, že se spojení naváže úplně mimo HTTP?

### --answer--
Ano, WebSocket má vlastní port a s HTTP nemá nic společného.

#### --why--
Port je stejný jako u webu, 443. Jinak by ho firemní firewall nepustil skoro nikde.

### --correct--
Ne. Spojení začne obyčejným požadavkem HTTP, který se teprve potom přepne.

#### --why--
Jak takový přepínací požadavek vypadá a jaký stavový kód na něj přijde, uvidíš v první části.

### --answer--
Ano, `wss` je zkratka pro vlastní šifrovaný protokol nad TCP bez HTTP hlaviček.

#### --why--
Šifrování je stejné TLS jako u `https`, a hlavičky v úvodu spojení jsou obyčejné HTTP hlavičky.
:::

:::check pretest
Server pošle přes WebSocket zprávu ve chvíli, kdy klient zrovna ztratil signál. Co se se zprávou stane?

### --expected-- ignore-case
ztratí se

### --accept--
zmizi
ztrati se
zahodí se
nic, ztratí se

### --why--
WebSocket nemá frontu ani potvrzování doručení. Když spojení není, zpráva se nedoručí a nikdo ji nezopakuje — to si musíš dodělat sám.
:::

Chat na podpoře, kurzor druhého autora v dokumentu, tahy ve hře, spolujízda na mapě. Všude tam mluví obě strany a každá desetina vteřiny je vidět. To je území, kde [[WebSocket]] nemá náhradu: jedno spojení, kterým tečou zprávy oběma směry, dokud ho někdo neukončí.

> [!REMEMBER]
> **WebSocket je trvalá roura na zprávy, ne API.** Nemá metody, adresy, stavové kódy ani opakování požadavku — dostaneš syrový kanál a formát zpráv, přihlášení, potvrzování i znovupřipojení si na něm postavíš sám.

## Handshake: upgrade z HTTP

Spojení začne jako obyčejný požadavek `GET` s hlavičkami, které si říkají o [[upgrade spojení]]:

```text
GET /kuchyn HTTP/1.1
Host: bistro.example.cz
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

```text
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

Stav `101` znamená „od téhle chvíle už to není HTTP". Totéž TCP spojení se přestane chovat jako žádost a odpověď a začne přenášet zprávy v obou směrech.

Z toho plyne pár praktických věcí. Spojení jde přes port 443 jako zbytek webu, takže projde firewallem. Cookies se při handshaku pošlou jako u každého jiného požadavku, takže přihlášení máš k dispozici. A protože je to zpočátku HTTP, platí pro handshake i pravidla původu — server dostane hlavičku `Origin` a musí se podle ní rozhodnout sám.

:::check
Napiš stavový kód, kterým server potvrdí přechod na WebSocket.

### --expected--
101

### --accept--
101 Switching Protocols

### --why--
`101 Switching Protocols` je jediná odpověď, po které spojení přestane být HTTP. Cokoli jiného (`200`, `404`, `403`) znamená, že se přepnutí nekonalo a klient dostane chybu.
:::

## WebSocket v prohlížeči

Klientské API má čtyři události a jednu metodu na odeslání:

```js
// 1. Otevři spojení
const socket = new WebSocket('wss://bistro.example.cz/kuchyn');

// 2. Po otevření se představ
socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'hello', screen: 'vydej' }));
});

// 3. Zpracuj příchozí zprávu
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'order-created') renderOrder(message.order);
});

// 4. Ukliď po sobě
socket.addEventListener('close', (event) => scheduleReconnect(event.code));
socket.addEventListener('error', () => console.warn('spojení selhalo'));
```

`event.data` je vždy **text nebo binární data**, nikdy objekt. Vlastní strukturu si proto vymyslíš sám — nejčastěji JSON s polem `type`, podle kterého se zpráva rozděluje, jako v ukázce.

> [!PITFALL]
> `socket.send()` zavolané dřív, než spojení dosáhne stavu `OPEN`, vyhodí `InvalidStateError: Still in CONNECTING state.` Posílat se smí až v handleru `open`, nebo si zprávy odkládej do pole a odešli je, až se spojení otevře.

:::check
Co je v `event.data` po přijetí zprávy, kterou server odeslal jako `JSON.stringify({ type: 'ping' })`?

### --answer--
Objekt `{ type: 'ping' }`, prohlížeč JSON rozbalí sám.

#### --why--
Prohlížeč neví, že jde o JSON. WebSocket přenáší text a o jeho významu nic netuší.

### --correct--
Řetězec `{"type":"ping"}`, který musíš sám projít přes `JSON.parse`.

#### --why--
Proto se u WebSocketu `JSON.parse` obaluje `try`/`catch` — zpráva, která JSON není, by jinak shodila handler.

### --answer--
Objekt `Blob` s binárním obsahem zprávy.

#### --why--
`Blob` dorazí jen u binárních zpráv. Text odeslaný jako text dorazí jako řetězec.
:::

## Server s knihovnou ws

V Node se nejčastěji používá knihovna `ws`. Sedne si na existující HTTP server, takže API i WebSocket běží na jednom portu:

```js
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/kuchyn' });

// Každé nové spojení si uložíme, ať víme, komu rozesílat
wss.on('connection', (socket, request) => {
  socket.on('message', (raw) => {
    const message = JSON.parse(raw.toString());
    if (message.type === 'hello') socket.screen = message.screen;
  });
  socket.on('close', () => console.log('obrazovka se odpojila'));
});

// Rozesílání všem otevřeným spojením
export function broadcast(payload) {
  const text = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(text);
  }
}
```

Kontrola `readyState === OPEN` není kosmetika: v `wss.clients` chvíli zůstávají i spojení, která se právě zavírají, a `send` do nich vyhodí výjimku.

[[rozesílání|Rozesílání]] je jádro každé takové aplikace. Ať posíláš objednávku do kuchyně nebo zprávu do chatu, vždycky jde o totéž: projdi otevřená spojení, vyber ta, kterým zpráva patří, a pošli jim text.

:::live js
```js
// Jak se chová fronta odeslaných dat, když klient nestíhá číst (protitlak)
const client = { bufferedAmount: 0, limit: 64 * 1024 };

function send(text) {
  if (client.bufferedAmount > client.limit) {
    console.log(`zahazuji zprávu, ve frontě je ${client.bufferedAmount} B`);
    return false;
  }
  client.bufferedAmount += text.length;
  console.log(`odesláno, ve frontě je ${client.bufferedAmount} B`);
  return true;
}

send('x'.repeat(30000));
send('x'.repeat(30000));
send('x'.repeat(30000));
send('malá zpráva');
```
:::

Zkus zvednout `limit` na `128 * 1024` a sleduj, kdy se zahazování přestane dít. Přesně tohle dělá vlastnost `socket.bufferedAmount`: říká, kolik bajtů čeká na odeslání. Když roste, klient nestíhá a má smysl mu zprávy raději zahazovat, než mu jimi zaplnit paměť serveru. Tomu se říká [[protitlak]].

:::check
Proč se v `broadcast` kontroluje `client.readyState === client.OPEN`, když procházíš seznam připojených klientů?

### --answer--
Protože v seznamu jsou i klienti, kteří se ještě nepřihlásili.

#### --why--
Přihlášení je věc tvé aplikace, `readyState` o něm nic neví. Sleduje jen stav spojení.

### --correct--
Protože v seznamu chvíli zůstávají i spojení, která se právě zavírají, a odeslání do nich skončí výjimkou.

#### --why--
Mezi „klient zmizel ze sítě" a „server to zjistil" je vždycky prodleva. Bez kontroly by jedno mrtvé spojení shodilo rozesílání všem ostatním.

### --answer--
Protože bez kontroly by se zpráva odeslala dvakrát.

#### --why--
Duplicitu `readyState` neřeší. Jde o spojení, do kterých se už posílat nedá.
:::

## Ověření a autorizace spojení

Handshake je HTTP požadavek, takže **cookie se pošle**. Session se tedy dá ověřit dřív, než spojení vůbec vznikne:

```js
wss.on('connection', async (socket, request) => {
  const session = await readSession(request.headers.cookie);
  if (!session) {
    socket.close(4401, 'Nepřihlášen');
    return;
  }
  socket.userId = session.userId;
});
```

Tři věci, na kterých se to nejčastěji láme:

- **Zavřít spojení není totéž co ho nepřijmout.** Nejčistší je odmítnout už handshake (u `ws` událostí `upgrade` s odpovědí `401`), aby nepřihlášený klient nikdy nedostal otevřený kanál.
- **`Origin` se u WebSocketu nekontroluje sám.** Pravidla původu, která zná prohlížeč u `fetch`, tady neplatí: cizí stránka spojení navázat smí a cookie se pošle s ním. Server proto musí hlavičku `Origin` porovnat se seznamem sám — jinak sis vyrobil [[CSRF|obdobu CSRF]] přes WebSocket.
- **Oprávnění se kontroluje u každé zprávy.** Klient si po otevření může říct o cokoli. Že se při připojení prokázal, neznamená, že smí i to, oč žádá ve třetí zprávě.

:::check
Skript na cizí stránce otevře `new WebSocket('wss://bistro.example.cz/kuchyn')`. Pošle prohlížeč s handshakem cookie přihlášeného uživatele?

### --answer--
Ne, cookie se posílá jen u požadavků na stejný původ.

#### --why--
Cookie se řídí svojí doménou a atributem `SameSite`, ne tím, odkud skript pochází. U WebSocketu se navíc `SameSite` nechová jako u `fetch`.

### --correct--
Ano. Právě proto musí server hlavičku `Origin` zkontrolovat sám.

#### --why--
Prohlížeč u WebSocketu neuplatní pravidla původu, jen hlavičku `Origin` přidá. Rozhodnutí nechává na serveru.

### --answer--
Ano, ale prohlížeč spojení hned zavře, protože odpověď nemá `Access-Control-Allow-Origin`.

#### --why--
Hlavičky `Access-Control-*` se na handshake WebSocketu nevztahují. Server žádnou takovou odpověď posílat nemá.
:::

## Znovupřipojení a heartbeat

U SSE se o výpadky stará prohlížeč. U WebSocketu je to tvoje práce — a znamená dvě věci: poznat, že spojení umřelo, a připojit se znovu tak, aby se server po výpadku sítě nezhroutil pod náporem tisíce klientů najednou.

Mrtvé spojení nepoznáš z toho, že nic nechodí. Když někomu vypadne wifi, spojení zůstane z pohledu serveru otevřené klidně několik minut. Proto se posílá [[heartbeat]]: protokol má na to rámce `ping` a `pong`, knihovna `ws` je umí poslat metodou `socket.ping()`. Klient, který do dvou kol neodpoví, se považuje za mrtvého a spojení se ukončí.

Znovupřipojení používá [[exponenciální odstup]]: po prvním výpadku počkáš vteřinu, po druhém dvě, pak čtyři, až po nějaký strop. K odstupu se přičte náhodné rozptýlení, aby se klienti po výpadku serveru nevrátili všichni v tutéž milisekundu.

:::live js
```js
function delays(attempts, base = 1000, max = 30000) {
  const result = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const backoff = Math.min(base * 2 ** (attempt - 1), max);
    const jitter = Math.round(backoff * 0.2);
    result.push(`${attempt}. pokus: ${backoff} ms (± ${jitter} ms)`);
  }
  return result;
}

for (const line of delays(7)) {
  console.log(line);
}
```
:::

Zkus snížit `max` na `8000` a sleduj, od kolikátého pokusu se čekání přestane zdvojnásobovat.

:::check
Klientovi vypadne wifi. Proč se server nedozví, že spojení skončilo, dokud se ho na to sám nezeptá?

### --answer--
Protože klient posílá zprávu o odpojení, která se ztratila cestou.

#### --why--
Klient, kterému zmizí síť, žádnou zprávu poslat nestihne. A kdyby ji poslal, nedorazí.

### --correct--
Protože otevřené TCP spojení bez provozu vypadá stejně jako spojení, kde se jen chvíli nic neděje.

#### --why--
Jediný způsob, jak to rozlišit, je něco poslat a čekat odpověď. Na to jsou rámce `ping` a `pong`.

### --answer--
Protože knihovna `ws` událost `close` hlásí jen při korektním ukončení.

#### --why--
`close` přijde i při nekorektním ukončení — ale až ve chvíli, kdy se o něm operační systém dozví.
:::

## Škálování na víc instancí

Otevřené spojení drží **konkrétní proces**. Jakmile běží aplikace ve dvou instancích za load balancerem, rozdělí se klienti mezi ně a `broadcast` v jedné instanci nedosáhne na klienty té druhé.

Řešení je vždycky stejné: instance si události předávají společným médiem. Nejčastěji Redis a jeho publikování a odběr — instance vydá událost do kanálu, všechny instance ji přijmou a rozešlou svým klientům.

```js
// vydání události do kanálu, který poslouchají všechny instance
await redis.publish('orders', JSON.stringify(order));

// každá instance rozešle svým vlastním klientům
subscriber.subscribe('orders', (message) => broadcast(JSON.parse(message)));
```

Druhá věc, kterou load balancer přinese, jsou **lepkavé relace**: pokud klient při znovupřipojení skončí na jiné instanci, nesmí mu to vadit. Proto stav (kdo je v jaké místnosti, co už viděl) nepatří do proměnné v procesu, ale do sdíleného úložiště.

:::check
Aplikace běží ve dvou instancích a chat funguje jen někdy — někteří lidé svoje zprávy navzájem nevidí. Co je příčina?

### --answer--
Load balancer zahazuje každý druhý WebSocket handshake.

#### --why--
Kdyby zahazoval handshake, spojení by vůbec nevzniklo a uživatel by viděl chybu připojení, ne chybějící zprávy.

### --correct--
Každá instance rozesílá jen svým vlastním spojením, takže se vidí jen lidé připojení ke stejné instanci.

#### --why--
Přesně proto se mezi instance dává společný kanál (Redis, fronta zpráv), přes který si událost předají všechny.

### --answer--
Zprávy se ztrácejí, protože WebSocket nemá potvrzování doručení.

#### --why--
Potvrzování opravdu nemá, ale ztráty by pak byly náhodné. Tady je rozdělení pravidelné podle toho, kdo je na které instanci.
:::

:::live node predict
```js
const messages = [];
const socket = {
  readyState: 'CONNECTING',
  send: (text) => messages.push(text),
};

function safeSend(text) {
  if (socket.readyState !== 'OPEN') {
    console.log(`odkládám: ${text}`);
    return;
  }
  socket.send(text);
  console.log(`posílám: ${text}`);
}

safeSend('hello');
socket.readyState = 'OPEN';
safeSend('objednávka 41');
console.log(`odesláno zpráv: ${messages.length}`);
```
--question-- Kolik zpráv se nakonec doopravdy odešle?
--output--
```text
odkládám: hello
posílám: objednávka 41
odesláno zpráv: 1
```
--why-- První volání přijde dřív, než spojení dosáhne stavu `OPEN`, takže se zpráva jen odloží — a v téhle podobě kódu se k ní už nikdo nevrátí. Odkládání má smysl jen tehdy, když odložené zprávy po otevření spojení opravdu odešleš. Zkus si v hlavě dopsat pole `pending` a jeho vyprázdnění v handleru `open`.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Znovupřipojení bez odstupu.** Handler `close` zavolá rovnou nové připojení. Když spadne server, tisíc klientů se do něj opře v nekonečné smyčce a nenechá ho nastartovat. Příznak: server po restartu okamžitě zase padá a v logu jsou tisíce připojení za sekundu. Oprava: exponenciální odstup se stropem a náhodným rozptylem.

> [!PITFALL]
> **`JSON.parse` bez `try`.** Jedna neplatná zpráva vyhodí výjimku v handleru, kterou nikdo nechytá, a shodí celý proces. Příznak: `SyntaxError: Unexpected token } in JSON at position 17` a restart aplikace. Oprava: parsování obalit `try`/`catch` a nesrozumitelnou zprávu zahodit.

> [!PITFALL]
> **Stav spojení v proměnné procesu.** `const rooms = new Map()` funguje skvěle do chvíle, než se aplikace rozjede ve dvou kopiích nebo než se restartuje. Příznak: po nasazení všichni „vypadnou z místnosti". Oprava: sdílené úložiště a schopnost stav po připojení obnovit.

> [!PITFALL]
> **Neomezená délka zprávy.** Klient pošle desetimegabajtový text a server si ho celý naskládá do paměti. Příznak: paměť procesu vyskočí po jediném spojení. Oprava: `maxPayload` u `WebSocketServer` a zavření spojení, které limit překročí.

:::check
Klient v handleru `close` volá rovnou `connect()`. Co se stane ve chvíli, kdy se restartuje server, na kterém visí tisíc klientů?

### --answer--
Klienti se připojí postupně, protože každý má jiný počítač a jinou rychlost sítě.

#### --why--
Rozptyl v milisekundách nestačí. Všichni dostanou `close` v tutéž chvíli a všichni se vrátí okamžitě.

### --correct--
Všichni se vrátí naráz a v nekonečné smyčce, takže server nemá šanci naběhnout.

#### --why--
Tomuhle se říká bouře připojení. Jediná obrana je odstup, který se s každým neúspěchem prodlužuje, a náhodné rozptýlení nad ním.

### --answer--
Prohlížeč po třetím pokusu spojení sám zablokuje.

#### --why--
Žádný takový strop prohlížeč nemá — u WebSocketu si opakování řídí tvůj kód úplně sám.
:::

## Kde to najdeš v MDN

- [The WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) — přehled protokolu i klientského rozhraní.
- [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) — `readyState`, `bufferedAmount`, `binaryType` a všechny události.
- [`CloseEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) — návratové kódy zavření a které rozsahy si smíš definovat sám.
- [Protocol upgrade mechanism](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Protocol_upgrade_mechanism) — hlavičky handshaku a stav `101`.

# --questions--

## --question--

Kolega hlásí: „Chat funguje, ale po deseti minutách nečinnosti přestanou zprávy chodit a nikdo si toho nevšimne, dokud nenapíše." Co v aplikaci chybí?

### --answer--
Delší časový limit spojení nastavený v konfiguraci serveru.

#### --why--
Limit se dá prodloužit, ale nezmizí — mezi klientem a serverem je vždycky nějaká proxy s vlastním limitem. A hlavně: ani prodloužený limit neřeší, že o zavření nikdo neví.

### --correct--
Heartbeat, který mrtvé spojení odhalí, a znovupřipojení na straně klienta.

#### --why--
Tiché spojení zavře proxy nebo operační systém a klient o tom nemusí vědět. Pravidelný `ping` výpadek odhalí a klient se po něm může připojit znovu.

### --answer--
Potvrzování doručení u každé zprávy.

#### --why--
Potvrzování by pomohlo poznat ztracenou zprávu, ale tady nechodí zprávy žádné. Nejdřív musíš zjistit, že spojení už neexistuje.

### --see--
api-soubory-realtime/websockety#znovupripojeni-a-heartbeat

## --question--

Kuchyňská obrazovka jen zobrazuje objednávky a nic neposílá. Napiš jedním slovem technologii, kterou pro ni zvolíš místo WebSocketu, a to kvůli tomu, že znovupřipojení vyřeší prohlížeč sám.

### --expected-- ignore-case
SSE

### --accept--
Server-Sent Events
server sent events
EventSource

### --why--
Druhý směr by ležel ladem a platilo by se za něj vlastním znovupřipojením, vlastním heartbeatem a horší průchodností přes proxy. SSE je obyčejné HTTP a výpadky řeší `EventSource` sám.

### --see--
api-soubory-realtime/realtime-prehled#jak-mezi-nimi-vybrat

## --question--

**Opakování z dřívějška.** Server po handshaku uloží `socket.userId` ze session a od té chvíle mu věří. Klient pak pošle zprávu `{ type: 'delete-order', orderId: 812 }` s cizím `orderId`. Jak se ta zranitelnost jmenuje, když server smaže i objednávku, která mu nepatří?

### --expected-- ignore-case
IDOR

### --accept--
idor
Insecure Direct Object Reference
nezabezpečený přímý odkaz na objekt

### --why--
Ověřený uživatel není totéž co oprávněný uživatel. Každá zpráva, která odkazuje na záznam přes id, musí projít kontrolou, jestli ten záznam patří tomu, kdo o něj žádá.

### --see--
auth-bezpecnost/owasp-zranitelnosti#idor-cizi-zaznam-podle-id

## --question--

**Opakování z dřívějška.** Handler `socket.on('message', …)` je `async` a uvnitř volá databázi. Když dotaz selže, spadne celý proces na `unhandledRejection`. Napiš, čím tělo handleru obalíš, aby se chyba dala zpracovat.

### --expected--
try

### --accept--
try/catch
try catch
try … catch
try { … } catch { … }

### --why--
`async` handler předaný knihovně vrací Promise, kterou nikdo nečeká, takže odmítnutí nemá kdo zachytit. Buď obal celé tělo `try`/`catch`, nebo handler zabal do funkce, která `catch` doplní za tebe.

### --see--
js-async/async-await#async-handler-bez-try
