---
pass: 0.8
---

# --questions--

## --question--

Jak se jmenuje hlavička, kterou prohlížeč pošle při znovupřipojení k SSE, aby serveru
řekl, kterou událost viděl naposled?

### --expected-- ignore-case

Last-Event-ID

### --accept--

Last Event ID

### --why--

Prohlížeč hlavičku přidá sám, bez jediného řádku tvého kódu. Doplnit podle ní zmeškané
události už ale musí server: musí si posledních pár událostí pamatovat a poslat ty
s vyšším `id`.

### --see--

api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --question--

Server posílá do otevřeného proudu tenhle text. Čím pozná klient, že jedna událost
skončila a začíná další?

```text
event: objednavka
data: {"id":7}

event: ceka
data: {"ceka":3}

```

### --correct--

Prázdným řádkem mezi nimi.

#### --why--

Rámec končí prázdným řádkem, tedy dvěma znaky `\n` za sebou. Dokud nepřijde, klient
čeká, že událost ještě pokračuje.

### --answer--

Tím, že další řádek začíná znovu klíčem `event:`.

#### --why--

Řádek `event:` je nepovinný — událost může mít jen `data:`. Kdyby se hranice hledala
podle něj, dvě události bez jména by splynuly v jednu.

### --answer--

Podle čárky na konci posledního řádku dat.

#### --why--

SSE není JSON ani CSV. Jednotlivé řádky se od sebe oddělují koncem řádku a nic se za
ně nepřipisuje.

### --answer--

Podle délky uvedené v hlavičce `Content-Length`.

#### --why--

Odpověď, která nikdy neskončí, žádnou délku předem nezná — právě proto se `Content-Length`
u proudu neposílá.

### --see--

api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --question--

Jakou hodnotu hlavičky `Content-Type` musí mít odpověď, kterou server otevírá proud
Server-Sent Events? Napiš jen typ, bez kódování.

### --expected-- ignore-case

text/event-stream

### --why--

Podle téhle hodnoty pozná prohlížeč (a `EventSource`), že má odpověď číst po rámcích
a nečekat na její konec. S `text/plain` by se stal z proudu obyčejný stahovaný soubor.

### --see--

api-soubory-realtime/realtime-prehled#server-sent-events-jednosmerny-proud

## --question--

Stavíš dvě věci: tabuli s výsledky zápasů, kterou lidé jen sledují, a spolupracovní
editor poznámek, kde všichni píšou naráz. Kdy sáhneš po WebSocketu místo SSE a proč?

### --correct--

U editoru — potřebuje posílat data **oběma** směry, a to je přesně to, co SSE neumí.

#### --why--

SSE je jednosměrné: mluví jen server. Jakmile musí klient posílat zprávy průběžně
a s malým zpožděním, je WebSocket jediná rozumná volba.

### --answer--

U tabule — u velkého počtu čtenářů je WebSocket levnější než SSE.

#### --why--

U samotného čtení je to naopak. SSE jede po obyčejném HTTP, projde proxy i firewallem
a znovupřipojení s doplněním zmeškaných událostí má prohlížeč v sobě.

### --answer--

U obou — SSE je starší technologie, kterou už dnešní prohlížeče nepodporují.

#### --why--

SSE podporují všechny dnešní prohlížeče. Stáří technologie není důvod k volbě; rozhoduje
směr dat.

### --answer--

U žádné z nich — na obojí stačí dotazování každou sekundu.

#### --why--

Dotazování funguje, ale při dvaceti klientech a sekundovém intervalu je to 1200 požadavků
za minutu, z nichž drtivá většina vrátí nezměněná data.

### --see--

api-soubory-realtime/realtime-prehled#jak-mezi-nimi-vybrat

## --question--

Klient poslal požadavek na adresu `/api/objednavky?stav=nova`. Co přesně bude v Node
obsahovat `req.url`?

### --expected--

/api/objednavky?stav=nova

### --why--

`req.url` nese cestu **i s query stringem**. Čistou cestu pro routování dá až
`new URL(req.url, 'http://localhost').pathname` — porovnání `req.url === '/api/objednavky'`
by u tohohle požadavku neplatilo.

### --see--

node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

## --question--

`POST /api/notifikace` právě uložil novou notifikaci. Jaký stavový kód má odpověď
vrátit?

### --correct--

`201 Created`

#### --why--

Dvoustovky znamenají úspěch a `201` konkrétně „vznikl nový záznam". Klient podle toho
pozná, že má přidat řádek, ne jen překreslit.

### --answer--

`200 OK`

#### --why--

`200` říká jen „proběhlo to". Použít se dá, ale klientovi zatajíš, že vznikl nový
zdroj — a u `POST` je to právě ta informace, která ho zajímá.

### --answer--

`204 No Content`

#### --why--

`204` znamená „hotovo a nic ti neposílám". Tady ale odpověď tělo má: uloženou notifikaci
i s přiděleným `id`.

### --answer--

`202 Accepted`

#### --why--

`202` patří práci, která teprve poběží na pozadí. Notifikace je uložená hned, takže
odpověď nemá tvrdit, že se to teprve zpracuje.

### --see--

api-http-rest/http-do-hloubky#stavove-kody-po-skupinach

## --question--

`EventSource` v prohlížeči neumí k požadavku přidat vlastní hlavičky, takže
`Authorization: Bearer …` do proudu neposlané. Jak se tedy otevření proudu ověřuje?

### --correct--

Cookie se session, nebo jednorázový token v query řetězci adresy.

#### --why--

Cookie prohlížeč přiloží sám, protože proud je obyčejný požadavek na stejný původ.
Token v adrese je druhá cesta — za cenu toho, že se objeví v logu proxy, takže má mít
krátkou platnost.

### --answer--

Nijak — proud událostí se ověřovat nedá, ověřuje se až každá jednotlivá událost.

#### --why--

Událost se posílá do už otevřeného spojení; v tu chvíli je na ověřování pozdě. Rozhodnout,
kdo smí poslouchat, jde jen při otevření.

### --answer--

Přes hlavičku `Last-Event-ID`, do které se token vloží.

#### --why--

`Last-Event-ID` si plní prohlížeč sám číslem poslední události. Vlastní hodnotu do ní
dostat nejde a k ověřování neslouží.

### --answer--

Tím, že se proud otevře metodou `POST` s tokenem v těle.

#### --why--

`EventSource` umí jen `GET` a tělo požadavku neposílá. Na `POST` bys potřeboval vlastní
čtení odpovědi přes `fetch`.

### --see--

auth-bezpecnost/session-a-cookies#autentizace-a-autorizace

## --question--

Kterými třemi bajty začíná každý soubor JPEG? Napiš je hexadecimálně, oddělené mezerou.

### --expected-- ignore-case

FF D8 FF

### --accept--

FFD8FF

### --why--

Tomuhle se říká podpis souboru. Na rozdíl od přípony a hlavičky `Content-Type` si ho
odesílatel nevymyslí, aniž by změnil obsah — proto se skutečný formát nahraného souboru
určuje právě z prvních bajtů.

### --see--

api-soubory-realtime/nahravani-souboru#typ-podle-obsahu-ne-podle-pripony

## --question--

Pracovník fronty odeslal potvrzovací e-mail, ale spadl dřív, než stihl zapsat, že je
hotovo. Fronta úlohu vrátí zpátky. Proč se idempotenční klíč nesmí generovat náhodně?

### --correct--

Při opakování musí vyjít **stejný** klíč, jinak druhý pokus vypadá jako úplně nová práce.

#### --why--

Klíč se odvozuje z dat úlohy (`objednavka-412-potvrzeni`), ne z náhody. Jen tak podle
něj příjemce pozná, že tuhle práci už jednou udělal.

### --answer--

Náhodné klíče se můžou shodovat a dvě různé úlohy by splynuly v jednu.

#### --why--

Šance na kolizi náhodného klíče je zanedbatelná. Problém je opačný: náhodný klíč je
pokaždé jiný, takže opakování nikdy nerozpozná.

### --answer--

Náhodná čísla se v Node generují pomalu a fronta by se zahltila.

#### --why--

Generování náhodného řetězce je levné. S výkonem to nemá co dělat.

### --answer--

Nesmí, protože klíč musí jít přečíst člověkem v administraci.

#### --why--

Čitelnost je příjemná, ale není to důvod. Kdyby byl odvozený klíč nečitelný hash,
idempotence funguje dál.

### --see--

api-soubory-realtime/emaily-a-ulohy-na-pozadi#idempotence-uloha-se-spusti-vickrat

## --question--

Otevři v MDN stránku o rozhraní `EventSource` a najdi vlastnost `readyState`. Jakou
číselnou hodnotu má u spojení, které je právě otevřené?

### --expected--

1

### --why--

`EventSource.readyState` má tři hodnoty: `0` (CONNECTING — připojuje se nebo se po
výpadku připojuje znovu), `1` (OPEN) a `2` (CLOSED — spojení bylo zavřeno a samo se
už nepokusí vrátit).

### --see--

api-soubory-realtime/realtime-prehled#kde-to-najdes-v-mdn

# --code-- Stavová tabule serverovny

## --file-- status.js

```js
'use strict';
const http = require('node:http');
const { EventEmitter } = require('node:events');

const bus = new EventEmitter();
const clients = [];
const log = [];
var lastId = 0;

const SERVICES = {
  web: 'ok',
  db: 'ok',
  mail: 'ok',
};

function send(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function frame(id, name, payload) {
  var out = '';
  if (id) {
    out += 'id: ' + id + '\n';
  }
  out += 'event: ' + name + '\n';
  out += 'data: ' + JSON.stringify(payload) + '\n';
  return out + '\n';
}

bus.on('change', function (change) {
  lastId = lastId + 1;
  log.push({ id: lastId, change: change });
  for (var i = 0; i < clients.length; i++) {
    clients[i].write(frame(lastId, 'change', change));
  }
});

const server = http.createServer(function (req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    });
    res.write(frame(0, 'hello', SERVICES));
    clients.push(res);
    res.on('finish', function () {
      clients.splice(clients.indexOf(res), 1);
    });
    return;
  }

  if (url.pathname === '/status') {
    return send(res, 200, { services: SERVICES, clients: clients.length });
  }

  if (url.pathname.indexOf('/set/') === 0) {
    const parts = url.pathname.split('/');
    const name = parts[2];
    const value = parts[3];
    SERVICES[name] = value;
    bus.emit('change', { service: name, state: value });
    return send(res, 200, { ok: true });
  }

  send(res, 404, { error: 'not found' });
});

server.listen(process.env.PORT || 3000, function () {
  console.log('status board on ' + (process.env.PORT || 3000));
});
```

## --question--

Kolik řádků (nepočítáme závěrečný prázdný) má rámec, který vrátí volání
`frame(0, 'hello', SERVICES)` na řádku 47 v `status.js`?

### --expected--

2

### --why--

Podmínka `if (id)` na řádku 23 je pravdivostní, a nula je nepravdivá — řádek `id: 0`
se proto nikdy nepřipíše. Zbydou `event:` a `data:`. Přesně takhle vypadá past, kterou
řeší porovnání `id !== undefined` místo `if (id)`.

### --see--

api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --question--

Jaké číslo bude na řádku `id:` u první události `change`, kterou server rozešle?

### --expected--

1

### --why--

`lastId` startuje na nule (řádek 8) a na řádku 32 se zvýší **před** vytvořením záznamu.
První rozeslaná změna tedy dostane `id: 1` — a to je dobře: nula by kvůli podmínce na
řádku 23 z rámce vypadla.

### --see--

api-soubory-realtime/workshop-sse/012

## --question--

Uživatel zavře kartu prohlížeče se stavovou tabulí. Co udělá úklid na řádcích 49–51
v `status.js`?

### --correct--

Nic — `finish` se u odpovědi, kterou nikdo neukončil, nevyvolá, takže spojení zůstane
v poli `clients` napořád.

#### --why--

`finish` znamená „tuhle odpověď jsem dopsal a ukončil". Proud se ale nikdy neukončuje,
takže ta chvíle nenastane. Poslouchat se musí `close`.

### --answer--

Odebere spojení z pole `clients` — přesně jak má.

#### --why--

To by platilo u běžné odpovědi, kterou server ukončí přes `res.end`. U nikdy nekončícího
proudu `finish` nepřijde.

### --answer--

Odebere spojení, ale až po vypršení časového limitu spojení.

#### --why--

Žádný limit se tu nenastavuje a `finish` se nevyvolá ani po něm. Spojení zmizí z pole
teprve tehdy, když se poslouchá událost o jeho zavření.

### --answer--

Shodí server, protože `clients.indexOf(res)` vrátí `-1`.

#### --why--

`splice(-1, 1)` nespadne, jen odebere poslední prvek. To je sice další chyba, ale až
ve chvíli, kdy by se obsluha vůbec spustila.

### --see--

api-soubory-realtime/realtime-prehled#typicke-chyby-a-pasti

## --question--

Co je na routě na řádcích 59–66 v `status.js` nejzávažnější?

### --correct--

Kdokoli bez přihlášení může obyčejným `GET` přepsat stav libovolné služby.

#### --why--

Routa nic neověřuje a ještě používá `GET`, takže stav změní i pouhé načtení adresy —
třeba obrázkem `<img src="…/set/db/down">` na cizí stránce.

### --answer--

`indexOf(…) === 0` je pomalejší než `startsWith`.

#### --why--

Rozdíl ve výkonu je neměřitelný a na jednom porovnání cesty nezáleží. Problém je
v tom, co ta routa dovolí.

### --answer--

Chybí kontrola, že `parts` má aspoň čtyři prvky.

#### --why--

Je to skutečná chyba — `/set/db` uloží `undefined`. Vedle toho, že stav smí měnit
kdokoli, je to ale drobnost.

### --answer--

Odpověď by měla mít stav `201`, protože se něco změnilo.

#### --why--

`201` patří vzniku nového zdroje. Tady se mění existující záznam, takže `200` je
v pořádku.

### --see--

auth-bezpecnost/owasp-zranitelnosti#csrf-pozadavek-z-cizi-stranky
