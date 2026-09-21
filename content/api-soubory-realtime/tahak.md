## Nahraný soubor: čemu nevěřit

| co přijde od klienta | proč tomu nevěřit | čím to nahradit |
|---|---|---|
| jméno souboru | může obsahovat `../`, `\`, řídicí znaky | vlastní jméno (`randomUUID()`) nebo jméno bez cesty a jen z `a-z0-9.-` |
| přípona | je součást jména, kdokoli si ji vymyslí | přípona odvozená z ověřeného formátu |
| `Content-Type` části | nastaví si ji odesílatel, nikdo ji nekontroluje | [[podpis souboru]] z prvních bajtů |
| velikost v `Content-Length` | dá se lhát, tělo přijde delší | limit se počítá **při čtení** proudu a nad limitem se spojení ukončí |

```js
// Cesta pryč, diakritika pryč, zbytek na pomlčky.
const bezpecne = jmeno.split(/[\\/]/).pop().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9.-]+/g, '-');
```

| formát | první bajty |
|---|---|
| JPEG | `FF D8 FF` |
| PNG | `89 50 4E 47` |
| PDF | `25 50 44 46` (`%PDF`) |
| GIF | `47 49 46 38` (`GIF8`) |

Velké soubory neposílej přes vlastní server: aplikace vydá [[předepsaná adresa|předepsanou adresu]]
do objektového úložiště a data tečou rovnou tam.

## Tři způsoby, jak dostat čerstvá data

| | [[dotazování]] | [[Server-Sent Events|SSE]] | [[WebSocket]] |
|---|---|---|---|
| směr | klient se ptá | server mluví | oba |
| protokol | HTTP | HTTP | vlastní, po [[upgrade spojení|upgradu]] z HTTP |
| znovupřipojení | netřeba | umí prohlížeč sám | napíšeš si sám |
| doplnění zmeškaného | netřeba | [[Last-Event-ID]] | napíšeš si sám |
| kdy | data se mění po minutách | tabule, notifikace, průběh úlohy | chat, spolupráce, hry |

## Rámec SSE

```text
id: 12
event: objednavka
data: {"id":7,"stul":3}

: ping

```

- Každý řádek je `klíč: hodnota`, událost končí **prázdným řádkem**.
- `data:` je povinné, `id:` a `event:` ne. Bez `event:` se událost jmenuje `message`.
- Řádek začínající dvojtečkou je komentář — takhle se posílá [[heartbeat]].
- Víc řádků `data:` za sebou klient spojí do jednoho textu oddělených `\n`.

## Server SSE v čistém Node

```js
// 1. Otevři proud
res.writeHead(200, {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
});
res.flushHeaders();

// 2. Zapiš klienta do registru a uklid po něm
klienti.add(res);
const ping = setInterval(() => res.write(': ping\n\n'), 15000);
req.on('close', () => {
  clearInterval(ping);
  klienti.delete(res);
});
```

```js
// 3. Rozesílání: rámec vyrob jednou, pošli všem
function rozesli(typ, data) {
  const ramec = `event: ${typ}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const klient of klienti) klient.write(ramec);
}
```

```js
// 4. Doplnění zmeškaných po výpadku
const odkud = Number(req.headers['last-event-id'] ?? 0);
for (const udalost of historie.filter((polozka) => polozka.id > odkud)) {
  res.write(`id: ${udalost.id}\nevent: ${udalost.typ}\ndata: ${JSON.stringify(udalost.data)}\n\n`);
}
```

## Klient: EventSource

```js
const proud = new EventSource('/api/udalosti');
proud.addEventListener('objednavka', (udalost) => {
  const data = JSON.parse(udalost.data); // data jsou vždycky text
});
proud.addEventListener('error', () => {
  // prohlížeč se připojí sám; readyState: 0 připojuje se, 1 otevřeno, 2 zavřeno
});
proud.close(); // jediný způsob, jak znovupřipojení zastavit
```

[[EventSource]] umí jen `GET` a neposílá vlastní hlavičky — ověřuj cookie se session
nebo krátce platným tokenem v query.

## WebSocket

```js
// Prohlížeč
const spojeni = new WebSocket(`wss://${location.host}/chat`);
spojeni.addEventListener('message', (zprava) => console.log(JSON.parse(zprava.data)));
spojeni.send(JSON.stringify({ text: 'ahoj' })); // až po události open
```

```js
// Server (knihovna ws): rozesílání s ohledem na protitlak
for (const klient of wss.clients) {
  if (klient.readyState !== WebSocket.OPEN) continue;
  if (klient.bufferedAmount > 1_000_000) { klient.terminate(); continue; }
  klient.send(zprava);
}
```

- Handshake je `GET` s hlavičkami `Upgrade: websocket` a `Connection: Upgrade`,
  odpověď `101 Switching Protocols`.
- Rostoucí `bufferedAmount` znamená [[protitlak]] — příjemce nestíhá.
- Znovupřipojení si napiš s [[exponenciální odstup|exponenciálním odstupem]]:
  `Math.min(1000 * 2 ** pokus, 30000)` plus náhodné rozptýlení.
- Na víc instancí potřebuješ sdílený kanál (Redis Pub/Sub), jinak se zpráva
  k druhé instanci nedostane.

## Pomalá práce na pozadí

| pojem | v jedné větě |
|---|---|
| [[transakční e-mail]] | zpráva vyvolaná akcí konkrétního uživatele |
| [[fronta úloh na pozadí]] | požadavek úlohu jen zapíše a hned odpoví |
| [[pracovník fronty]] | proces vedle aplikace, který úlohy vyzvedává a vykonává |
| [[idempotenční klíč]] | hodnota odvozená z dat úlohy, podle které se pozná opakování |
| [[mrtvá schránka]] | kam putuje úloha, která vyčerpala pokusy |
| [[plánovaná úloha]] | práci spouští čas, ne uživatel; plánovač jen zapíše do fronty |

```js
// Opakování s rostoucím odstupem a stropem
const odstup = Math.min(1000 * 2 ** pokus, 30 * 60 * 1000);
// Klíč se odvozuje z dat, nikdy náhodně:
const klic = `objednavka-${objednavka.id}-potvrzeni`;
```

## Pasti

| past | příznak | co s tím |
|---|---|---|
| `res.end` v proudu | klient se každých pár sekund připojuje znovu | do proudu se píše `res.write` |
| chybí `flushHeaders` | klient visí, dokud nepřijde první událost | hlavičky pošli hned |
| `if (id)` místo `if (id !== undefined)` | událost s `id: 0` přijde bez čísla | porovnávej s `undefined` |
| úklid na `finish` | registr klientů roste, čísla v metrikách nepadají | poslouchej `close` na `req` |
| zapomenutý `setInterval` | proces neskončí, zápisy do zavřené odpovědi | `clearInterval` při zavření |
| objekt na řádku `data:` | klientovi přijde `[object Object]` | vždycky `JSON.stringify` |
| rámec bez prázdného řádku | klient čeká a nic nezobrazí | ukonči `\n\n` |
| doplnění bez filtru příjemce | uživatel po výpadku uvidí cizí zprávy | filtruj historii i podle toho, komu patří |
| náhodný idempotenční klíč | zákazník dostane tři stejné e-maily | odvoď klíč z dat úlohy |
