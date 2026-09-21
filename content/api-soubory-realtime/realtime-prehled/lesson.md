# Polling, SSE a WebSocket

:::check pretest
Kuchyňská obrazovka v bistru má ukazovat nové objednávky do pár vteřin. Co je na řešení „`setInterval` a každé 2 sekundy `fetch` seznamu objednávek" nejdražší?

### --answer--
Že prohlížeč neumí spustit `fetch` častěji než jednou za 5 sekund.

#### --why--
Prohlížeč takový limit nemá. Drahé je něco jiného, a projeví se to až na serveru.

### --correct--
Že drtivá většina požadavků odpoví „nic nového" a server je přesto musí všechny obsloužit.

#### --why--
Kolik práce to znamená pro sto obrazovek, spočítáš v první části.

### --answer--
Že odpověď je pokaždé celý seznam, takže se přenáší zbytečně moc dat.

#### --why--
Velikost odpovědi se dá srazit stránkováním nebo parametrem `since`. Hlavní cena je v samotném počtu požadavků.
:::

:::check pretest
Kolik spojení otevře prohlížeč, který má na jedné stránce `new EventSource('/api/stream')`? Odpověz číslem.

### --expected--
1

### --accept--
jedno
1 spojení

### --why--
Jedno HTTP spojení, které server nechá otevřené a posílá do něj události, dokud stránka žije.
:::

Bistro U Kachny má u výdeje obrazovku s objednávkami, banka ukazuje zůstatek po platbě hned a sdílený dokument píše ve dvou lidech naráz. Všechny tři případy potřebují totéž: data ze serveru **bez toho, aby si o ně klient pokaždé řekl**. HTTP je přitom postavené obráceně — server nemluví první.

> [!REMEMBER]
> **Existují tři způsoby, jak tohle obejít, a liší se hlavně tím, kdo mluví: u dotazování se klient pořád ptá, u SSE mluví jen server a u WebSocketu mluví oba.** Čím víc směrů, tím víc práce s provozem — vyber nejmenší, který úlohu zvládne.

## Proč nestačí obnovit stránku

HTTP je žádost a odpověď. Server nemá kam „zavolat zpátky": neví, na jaké adrese klient je, a mezi ním a klientem je nejčastěji domácí router, který příchozí spojení nepustí. Všechna tři řešení proto stojí na spojení, které naváže **klient** — a liší se jen tím, jak dlouho ho nechají otevřené a co do něj kdo píše.

| způsob | kdo naváže spojení | kdo do něj mluví | co spotřebuje |
|---|---|---|---|
| dotazování | klient, pořád znovu | klient se ptá, server odpoví | jeden požadavek za interval a klienta |
| SSE | klient, jednou | server | jedno otevřené spojení na klienta |
| WebSocket | klient, jednou | server i klient | jedno otevřené spojení na klienta |

:::check
Proč nemůže server poslat nová data prohlížeči sám od sebe, bez toho, aby klient něco navázal?

### --answer--
Protože HTTP neumí poslat odpověď, o kterou si nikdo neřekl.

#### --why--
Tohle je důsledek, ne příčina. Zeptej se, proč to HTTP takhle má — odpověď je v tom, jak vypadá síť mezi klientem a serverem.

### --correct--
Protože k prohlížeči nevede adresa, na kterou by se dalo zvenčí připojit — příchozí spojení zastaví router nebo firewall.

#### --why--
Spojení proto vždycky naváže klient zevnitř ven. Rozdíly mezi způsoby jsou jen v tom, co se s takovým spojením dál dělá.

### --answer--
Protože prohlížeč z bezpečnostních důvodů nepřijímá data, která si nevyžádal.

#### --why--
Prohlížeč přijímá data, která přitečou do spojení, jež sám otevřel — přesně na tom stojí SSE i WebSocket.
:::

## Dotazování: ptej se dokola

[[dotazování|Dotazování]] je `setInterval` a `fetch`. Je to nejjednodušší řešení a u spousty úloh úplně stačí — třeba když se stav mění jednou za minuty a zpoždění nikomu nevadí.

```js
// 1. Pamatuj si, co už znáš
let lastId = 0;

// 2. Ptej se v pravidelném rytmu
setInterval(async () => {
  // 3. Řekni serveru, odkud dál
  const response = await fetch(`/api/orders?since=${lastId}`);
  const orders = await response.json();

  // 4. Zpracuj jen to nové
  for (const order of orders) {
    renderOrder(order);
    lastId = Math.max(lastId, order.id);
  }
}, 2000);
```

Parametr `since` je to, co dělá dotazování snesitelným: server vrací jen nové záznamy, takže odpověď je při klidu prázdná. Zůstane ale počet požadavků. Sto obrazovek každé dvě sekundy je **180 000 požadavků za hodinu**, i když se nic neděje.

:::live node predict
```js
const clients = 100;
const intervalSeconds = 2;
const hours = 8;

const perHour = (3600 / intervalSeconds) * clients;
console.log(`za hodinu: ${perHour}`);
console.log(`za směnu: ${perHour * hours}`);
```
--question-- Kolik požadavků nasbírá sto obrazovek za osmihodinovou směnu?
--output--
```text
za hodinu: 180000
za směnu: 1440000
```
--why-- Počet požadavků roste s počtem klientů **i** s jemností intervalu. Zkrátit interval na polovinu znamená dvojnásobek požadavků, ne dvojnásobek užitku. Zkus si v hlavě dosadit interval 10 sekund: požadavků je pětina, ale objednávka se na obrazovce objeví až za deset vteřin.
:::

> [!TIP]
> Dotazování zvol vždy, když se stav mění řidčeji než jednou za půl minuty a nevadí zpoždění: stav nasazení, počet nepřečtených zpráv, kurz měny. Zvládne ho jakákoli infrastruktura a ladí se přes záložku Network jako obyčejné API.

:::check
Dotazování běží každé 2 sekundy a uživatel nechá záložku deset minut na pozadí. Kolik požadavků server dostane, když v tom čase nemá co poslat?

### --answer--
Žádný, protože prohlížeč časovače na pozadí úplně zastaví.

#### --why--
Prohlížeč časovače v zahozené záložce zpomalí, typicky na jednou za minutu, ale nezastaví je. Požadavky chodit budou, jen řidčeji.

### --correct--
Chodit budou dál, jen zpomaleně — a každý z nich odpoví prázdným seznamem.

#### --why--
Proto se k dotazování hodí `document.visibilityState`: na pozadí interval prodlouž nebo vypni a po návratu se zeptej jednou hned.

### --answer--
Přesně 300, protože interval na pozadí běží beze změny.

#### --why--
Na pozadí prohlížeč časovače přiškrtí, takže jich bude výrazně méně. Přestat se ale ptát sám od sebe neumí.
:::

## Server-Sent Events: jednosměrný proud

[[Server-Sent Events]] otočí rytmus. Klient otevře jedno obyčejné HTTP spojení a server ho **neukončí** — místo toho do něj postupně zapisuje události.

```js
// server (Node): odpověď, která nekončí
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
});
res.write('event: order-created\ndata: {"id":41,"table":7}\n\n');
```

```js
// klient: jediný objekt, o zbytek se stará prohlížeč
const stream = new EventSource('/api/stream');
stream.addEventListener('order-created', (event) => {
  renderOrder(JSON.parse(event.data));
});
```

[[EventSource]] je součástí prohlížeče od dob před Reactem. Vlastní knihovna není potřeba, a co je cennější: **prohlížeč se po výpadku spojení připojí sám**. Když spojení spadne, počká a zkusí to znovu, dokud stránka žije nebo dokud nezavoláš `stream.close()`.

:::check
Server u SSE odpoví stavovým kódem `200` a pak nechá spojení otevřené. Napiš hodnotu hlavičky `Content-Type`, podle které prohlížeč pozná, že jde o proud událostí.

### --expected--
text/event-stream

### --why--
`text/event-stream` říká prohlížeči, že tělo odpovědi bude přibývat po částech a že ho má rozebírat jako události. Bez ní `EventSource` spojení rovnou uzavře a ohlásí chybu.
:::

## Formát události a znovupřipojení

Tělo je prostý text. Jedna událost je několik řádků `klíč: hodnota` a po nich **prázdný řádek**, který událost ukončí:

```text
id: 41
event: order-created
data: {"id":41,"table":7}

: tohle je komentář, klient ho zahodí

retry: 5000
```

- `data` je jediné povinné pole. Když ho napíšeš víckrát, řádky se spojí novým řádkem.
- `event` pojmenuje událost. Bez něj dorazí jako `message`.
- `id` si prohlížeč zapamatuje a při znovupřipojení ho pošle v hlavičce [[Last-Event-ID]] — server podle něj doplní, co klient zmeškal.
- `retry` nastaví, za kolik milisekund se má klient po výpadku připojit.
- Řádek začínající dvojtečkou je komentář. Používá se jako [[heartbeat]]: proxy servery totiž tiché spojení po chvíli zahodí.

:::live js
```js
const raw = 'id: 41\nevent: order-created\ndata: {"id":41,"table":7}\n\n: ping\n\nid: 42\ndata: prostá zpráva\n\n';

function parseEvents(text) {
  return text
    .split('\n\n')
    .filter((chunk) => chunk.trim() !== '' && !chunk.trim().startsWith(':'))
    .map((chunk) => {
      const event = { id: null, event: 'message', data: '' };
      for (const line of chunk.split('\n')) {
        const separator = line.indexOf(':');
        const field = line.slice(0, separator);
        const value = line.slice(separator + 1).trimStart();
        if (field === 'data') event.data += event.data ? '\n' + value : value;
        else if (field in event) event[field] = value;
      }
      return event;
    });
}

for (const event of parseEvents(raw)) {
  console.log(event.event, '→', event.data);
}
```
:::

Zkus v `raw` smazat jeden z prázdných řádků `\n\n` a sleduj, jak se dvě události slijí do jedné — právě proto je prázdný řádek povinný.

:::check
Klientovi spadne spojení po události `id: 41`. Co pošle prohlížeč serveru, když se připojí znovu?

### --answer--
Nic navíc, server musí sám poznat, že jde o tentýž prohlížeč.

#### --why--
Prohlížeč jednu věc připojí sám, a to bez ohledu na cookies a přihlášení.

### --correct--
Hlavičku `Last-Event-ID: 41`, aby server věděl, odkud navázat.

#### --why--
Doplnit zmeškané události ale musí server: hlavička je jen informace, kterou musí handler přečíst a podle ní z historie poslat, co chybí.

### --answer--
Celou historii událostí, které si uložil, aby si je server ověřil.

#### --why--
Prohlížeč si posílá jen poslední `id`. Historii drží server, ne klient.
:::

## WebSocket: obousměrný kanál

Když má mluvit i klient — chat, kurzor spoluautora v dokumentu, tahy ve hře — jednosměrný proud nestačí. [[WebSocket]] začíná jako obyčejný požadavek HTTP, který se hlavičkou `Upgrade` přepne na trvalé obousměrné spojení. Oběma směry pak tečou zprávy, dokud jedna strana nezavěsí.

```js
const socket = new WebSocket('wss://bistro.example.cz/kuchyn');
socket.addEventListener('message', (event) => renderOrder(JSON.parse(event.data)));
socket.addEventListener('open', () => socket.send(JSON.stringify({ type: 'hello', screen: 'vydej' })));
```

Cena za druhý směr je práce navíc: znovupřipojení si musíš napsat sám, formát zpráv si musíš vymyslet sám a spojení mimo HTTP hůř prochází firemními proxy. Podrobně se na to podíváš v [lekci o WebSocketech](see:api-soubory-realtime/websockety#handshake-upgrade-z-http).

:::check
Chat, kde píšou obě strany, jde postavit i tak, že se zprávy **čtou** přes SSE a **odesílají** obyčejným `POST`. Co je na tom oproti WebSocketu horší a co lepší?

### --answer--
Horší je latence čtení, lepší je jednodušší server.

#### --why--
Čtení přes SSE latenci nezhoršuje — zprávy tečou otevřeným spojením stejně rychle.

### --correct--
Horší je latence odeslané zprávy (každá je nový požadavek), lepší je, že se o znovupřipojení stará prohlížeč.

#### --why--
Tahle kombinace se v praxi používá často: zápisy jsou řídké a snesou režii požadavku, čtení je časté a těží z otevřeného proudu.

### --answer--
Horší není nic, lepší je, že SSE umí posílat binární data.

#### --why--
SSE posílá jen text v UTF-8. Binární data umí WebSocket, u SSE je musíš zakódovat, třeba do base64.
:::

## Jak mezi nimi vybrat

Rozhoduj podle dvou otázek: **mluví klient?** a **jak často přijde nové?**

| úloha | volba | proč |
|---|---|---|
| stav nasazení, kurz měny | dotazování | mění se zřídka, zpoždění nevadí |
| kuchyňská obrazovka, sledování zásilky | SSE | mluví jen server, klient jen kouká |
| notifikace v aplikaci | SSE | jeden směr, prohlížeč řeší výpadky |
| chat, hra, sdílený dokument | WebSocket | mluví obě strany a na latenci záleží |
| náhled průběhu dlouhého exportu | SSE | server hlásí procenta, klient nic neposílá |

> [!NOTE]
> Všechny tři způsoby drží spojení jen mezi klientem a **jednou** instancí serveru. Jakmile poběží aplikace ve dvou kopiích, musí si instance události předávat přes společné médium (Redis, fronta zpráv) — jinak uvidí událost jen ti klienti, kteří náhodou visí na té správné instanci.

:::check
Pro který z těchhle případů je dotazování lepší volba než SSE: (a) náhled průběhu exportu, (b) stav nasazení v CI, (c) kurzor spoluautora? Odpověz písmenem.

### --expected-- ignore-case
b

### --accept--
b)
(b)
stav nasazení

### --why--
Stav nasazení se mění zřídka a zpoždění pár vteřin nikomu nevadí, takže se nevyplatí držet otevřené spojení. Export hlásí procenta často (SSE) a kurzor spoluautora je obousměrný provoz s nízkou latencí (WebSocket).
:::

:::explain
Vysvětli vlastními slovy, proč se u kuchyňské obrazovky volí SSE, i když by WebSocket zvládl totéž.

## --model--
Kuchyňská obrazovka jen čte: server posílá objednávky, klient neposílá nic. WebSocket by druhý směr nabídl, ale nikdo by ho nevyužil — a zaplatilo by se za něj vlastním protokolem zpráv a vlastním znovupřipojením. SSE je obyčejné HTTP, takže projde proxy i logováním jako každý jiný požadavek, a výpadky řeší prohlížeč sám. Volí se nejmenší nástroj, který úlohu pokryje.

## --checklist--
- Provoz je jednosměrný: mluví jen server.
- WebSocket by přidal schopnost, kterou úloha nepotřebuje.
- SSE je obyčejné HTTP, takže projde stejnou cestou jako zbytek API.
- Znovupřipojení u SSE obstará prohlížeč, u WebSocketu si ho píšeš sám.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Vyrovnávací paměť proxy drží události u sebe.** Server posílá, ale klientovi nic nechodí, dokud se nenasbírá pár kilobajtů. Příznak: lokálně to funguje, po nasazení za Nginx ne. Oprava: hlavička `X-Accel-Buffering: no` u odpovědi a vypnutá komprese proudu — `Content-Encoding: gzip` u SSE také zdržuje.

> [!PITFALL]
> **Chybějící heartbeat.** Spojení vydrží, dokud se v něm něco děje. V klidném provozu ho proxy po 30–60 vteřinách zavře a klient se připojuje pořád dokola. Příznak: v logu přibývá nových připojení, i když nikdo nic nedělá. Oprava: posílat komentář `: ping` každých 15–30 sekund.

> [!PITFALL]
> **Interval dotazování kratší než odpověď serveru.** Když odpověď trvá 3 sekundy a interval je 2, požadavky se překrývají a hromadí. Příznak: server se postupně zahltí a odpovědi se prodlužují. Oprava: další požadavek plánovat `setTimeout` až po dokončení předchozího, ne `setInterval`.

> [!PITFALL]
> **Limit šesti spojení na doménu.** `EventSource` drží spojení trvale, a prohlížeč jich pro jednu doménu přes HTTP/1.1 otevře nejvýš šest. Sedmá otevřená záložka téhož webu se nepřipojí a tváří se to jako výpadek serveru. Příznak: funguje to všude kromě uživatele, který má web v mnoha záložkách. Oprava: HTTP/2, kde limit odpadá.

:::check
SSE proud funguje lokálně, ale po nasazení za proxy dorazí události až po několika kilobajtech naráz. Napiš hlavičku i s hodnotou, kterou na to odpověď potřebuje.

### --expected--
X-Accel-Buffering: no

### --accept--
x-accel-buffering: no

### --why--
Proxy si odpověď ukládá do vyrovnávací paměti a pouští ji po blocích, což je u obyčejné stránky užitečné a u proudu událostí zhoubné. Tahle hlavička ukládání pro danou odpověď vypne.
:::

## Kde to najdeš v MDN

- [Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) — kompletní formát událostí včetně `retry` a `Last-Event-ID`.
- [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) — vlastnosti, události `open`/`error` a `readyState`.
- [The WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) — přehled obousměrného spojení a jeho životního cyklu.
- [`Document.visibilityState`](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState) — jak poznat, že je záložka na pozadí, a přiškrtit dotazování.

# --questions--

## --question--

Sledování zásilky ukazuje polohu balíku. Dopravce hlásí novou polohu v průměru jednou za deset minut, ale zákazník chce vidět změnu hned, jak přijde. Napiš, který ze tří způsobů zvolíš.

### --expected-- ignore-case
SSE

### --accept--
Server-Sent Events
server sent events
sse

### --why--
Mluví jen server a klient nic neposílá, takže druhý směr WebSocketu by ležel ladem. Dotazování by při požadavku „hned" muselo běžet po sekundách, a to je při desetiminutové frekvenci změn devadesát devět procent požadavků naprázdno.

### --see--
api-soubory-realtime/realtime-prehled#jak-mezi-nimi-vybrat

## --question--

Tenhle SSE proud dorazí klientovi celý naráz. Kolik událostí z něj `EventSource` vyrobí?

```text
data: první

data: druhá
data: pokračování

: ping

data: třetí
```

### --expected--
3

### --accept--
tři

### --why--
Událost končí prázdným řádkem. Druhá událost má dva řádky `data`, které se spojí do jediného textu `druhá\npokračování`. Řádek začínající dvojtečkou je komentář a žádnou událost nevyrobí.

### --see--
api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --question--

**Opakování z dřívějška.** Dotazování volá `fetch` každé dvě sekundy a při každém přepnutí filtru se výsledky občas přepíšou staršími daty. Napiš jméno objektu, kterým předchozí, už nepotřebný požadavek zrušíš.

### --expected--
AbortController

### --accept--
new AbortController()
abortcontroller

### --why--
`AbortController` dá `fetch` svůj `signal`. Když před novým požadavkem zavoláš `controller.abort()`, starý požadavek skončí chybou `AbortError` a jeho odpověď už nemá šanci přepsat novější data.

### --see--
js-async/async-await#zruseni-abortcontroller-a-signal

## --question--

**Opakování z dřívějška.** SSE proud běží přes `https://api.bistro.example.cz`, zatímco obrazovka je na `https://bistro.example.cz`. `EventSource` hlásí chybu ještě dřív, než dorazí první událost. Co chybí?

### --answer--
Hlavička `Content-Type: text/event-stream` na straně klienta.

#### --why--
`Content-Type` nastavuje server v odpovědi, klient ho neposílá. A kdyby chyběla, chyba by přišla až po přijetí odpovědi.

### --correct--
Hlavička `Access-Control-Allow-Origin` v odpovědi serveru — `api.` je jiný původ než hlavní doména.

#### --why--
Původ tvoří schéma, doména a port celé, takže subdoména je jiný původ. Pro `EventSource` s `withCredentials` navíc musí server poslat konkrétní původ, ne `*`.

### --answer--
Nic, `EventSource` pravidla stejného původu neřeší, protože nejde o `fetch`.

#### --why--
Pravidla platí pro každý požadavek, který skript ze stránky pošle, `EventSource` nevyjímaje.

### --see--
api-http-rest/cors-a-cache#stejny-puvod-a-cors-ze-strany-serveru
