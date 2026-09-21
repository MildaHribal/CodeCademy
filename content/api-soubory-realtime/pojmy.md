## --term-- multipart/form-data

en: multipart/form-data
aliases: multipart, multipartu, multipart tělo, multipart těla
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type
lekce: api-soubory-realtime/nahravani-souboru#multipart-form-data-jak-vypada-telo

Kódování těla požadavku, ve kterém je tělo rozdělené na části oddělené náhodnou
hranicí. Každá část má vlastní hlavičky, takže se do jednoho požadavku vejdou textová
pole i binární obsah souborů.

## --term-- podpis souboru

en: magic bytes
aliases: podpisu souboru, podpisem souboru, podpis, podpisy souborů, magic bytes
lekce: api-soubory-realtime/nahravani-souboru#typ-podle-obsahu-ne-podle-pripony

Několik prvních bajtů souboru, podle kterých se pozná jeho skutečný formát — JPEG
začíná `FF D8 FF`, PNG `89 50 4E 47`. Na rozdíl od přípony a hlavičky `Content-Type`
si je odesílatel nevymyslí, aniž by tím změnil obsah.

## --term-- předepsaná adresa

en: presigned URL
aliases: předepsané adresy, předepsanou adresu, předepsaných adres, presigned URL
lekce: api-soubory-realtime/nahravani-souboru#kam-soubory-ukladat-a-jak-je-vracet

Dočasně platná adresa do objektového úložiště, kterou vydá aplikace a se kterou pak
klient nahrává nebo stahuje soubor přímo, bez toho, aby data tekla přes server.
Platnost se počítá v minutách a je podepsaná, takže ji nejde vyrobit ani upravit.

## --term-- dotazování

en: polling
aliases: dotazováním, dotazování serveru, polling, pollingu
lekce: api-soubory-realtime/realtime-prehled#dotazovani-ptej-se-dokola

Získávání čerstvých dat tak, že se klient v pravidelném rytmu ptá novým požadavkem.
Nejjednodušší ze tří způsobů, ale počet požadavků roste s počtem klientů i s jemností
intervalu.

## --term-- Server-Sent Events

en: Server-Sent Events
aliases: SSE, Server Sent Events, serverových událostí, serverové události
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
lekce: api-soubory-realtime/realtime-prehled#server-sent-events-jednosmerny-proud

Jednosměrný proud událostí přes obyčejné HTTP spojení, které server neukončí a místo
toho do něj postupně zapisuje textové události. Mluví jen server, klient jen poslouchá.

## --term-- EventSource

en: EventSource
aliases: EventSourcem, EventSourcu, EventSource objekt
mdn: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
lekce: api-soubory-realtime/realtime-prehled#server-sent-events-jednosmerny-proud

Objekt prohlížeče, který otevře SSE spojení, rozebere příchozí text na události a po
výpadku se sám připojí znovu. Kvůli tomuhle automatickému znovupřipojení bývá SSE
levnější na údržbu než WebSocket.

## --term-- Last-Event-ID

en: Last-Event-ID
aliases: Last Event ID, hlavička Last-Event-ID
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
lekce: api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

Hlavička, kterou prohlížeč při znovupřipojení k SSE pošle s posledním přijatým `id`.
Doplnit zmeškané události podle ní musí server sám — prohlížeč hlavičku jen přidá.

## --term-- heartbeat

en: heartbeat
aliases: heartbeatu, heartbeatem, tlukot spojení
lekce: api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

Pravidelná prázdná zpráva do otevřeného spojení, která ho udrží při životě a zároveň
odhalí, že druhá strana už neodpovídá. U SSE je to komentářový řádek `: ping`,
u WebSocketu rámce `ping` a `pong`.

## --term-- WebSocket

en: WebSocket
aliases: WebSocketu, WebSocketem, WebSockety, WebSocketů, websocket
mdn: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
lekce: api-soubory-realtime/websockety#handshake-upgrade-z-http

Trvalé obousměrné spojení mezi prohlížečem a serverem, které vznikne přepnutím
z obyčejného požadavku HTTP. Zprávy tečou oběma směry, dokud jedna strana spojení
neukončí.

## --term-- upgrade spojení

en: protocol upgrade
aliases: upgradu spojení, upgrade, přepnutí protokolu
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Protocol_upgrade_mechanism
lekce: api-soubory-realtime/websockety#handshake-upgrade-z-http

Přepnutí už navázaného HTTP spojení na jiný protokol pomocí hlaviček `Upgrade`
a `Connection` a odpovědi `101 Switching Protocols`. Tímhle způsobem začíná každý
WebSocket.

## --term-- rozesílání

en: broadcast
aliases: rozeslání, rozesílá, rozeslat všem, broadcast
lekce: api-soubory-realtime/websockety#server-s-knihovnou-ws

Odeslání jedné zprávy všem otevřeným spojením, kterým zpráva patří. Server projde
seznam klientů, vynechá ta spojení, která se zavírají, a zbylým pošle tentýž text.

## --term-- protitlak

en: backpressure
aliases: protitlaku, protitlakem, backpressure
lekce: api-soubory-realtime/websockety#server-s-knihovnou-ws

Stav, kdy příjemce nestíhá číst tak rychle, jak odesílatel posílá, a data se hromadí
ve frontě na odeslání. U WebSocketu se pozná podle rostoucí hodnoty `bufferedAmount`
a řeší se zahazováním zpráv nebo zavřením spojení.

## --term-- exponenciální odstup

en: exponential backoff
aliases: exponenciálního odstupu, exponenciálním odstupem, rostoucí odstup, backoff
lekce: api-soubory-realtime/websockety#znovupripojeni-a-heartbeat

Prodlužování pauzy mezi opakovanými pokusy — 1 s, 2 s, 4 s, 8 s až po pevný strop.
Přidává se k němu náhodné rozptýlení, aby se všichni klienti nevrátili v tutéž chvíli.

## --term-- transakční e-mail

en: transactional email
aliases: transakčního e-mailu, transakční e-maily, transakčních e-mailů, transakční mail
lekce: api-soubory-realtime/emaily-a-ulohy-na-pozadi#transakcni-e-maily

Zpráva, kterou vyvolá konkrétní akce konkrétního uživatele: potvrzení objednávky,
obnovení hesla, upozornění na konec předplatného. Odesílá se přes poštovní službu
a na rozdíl od hromadného rozesílání se neodhlašuje.

## --term-- fronta úloh na pozadí

en: background job queue
aliases: fronty úloh na pozadí, frontě úloh na pozadí, frontu úloh na pozadí, fronta na pozadí
lekce: api-soubory-realtime/emaily-a-ulohy-na-pozadi#fronta-uloh-na-pozadi

Seznam práce, kterou aplikace při zpracování požadavku jen zapíše a vykoná ji později
jiný proces. Díky tomu odpověď nečeká na pomalé volání a selhání se dá bez škody
zopakovat.

## --term-- pracovník fronty

en: worker
aliases: pracovníka fronty, pracovníci fronty, pracovník, pracovníka, worker
lekce: api-soubory-realtime/emaily-a-ulohy-na-pozadi#fronta-uloh-na-pozadi

Proces, který si z fronty vyzvedne úlohu, vykoná ji a zapíše výsledek. Běží vedle
aplikace, škáluje se nezávisle na ní a jeho pád nesmí úlohu ztratit.

## --term-- idempotenční klíč

en: idempotency key
aliases: idempotenčního klíče, idempotenčním klíčem, idempotenční klíče, Idempotency-Key
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Idempotent
lekce: api-soubory-realtime/emaily-a-ulohy-na-pozadi#idempotence-uloha-se-spusti-vickrat

Hodnota odvozená z dat úlohy nebo požadavku, podle které příjemce pozná, že tutéž
práci už jednou udělal. Při opakování musí vyjít stejná, proto se nikdy negeneruje
náhodně.

## --term-- mrtvá schránka

en: dead letter queue
aliases: mrtvé schránky, mrtvou schránku, mrtvé schránce, dead letter queue
lekce: api-soubory-realtime/emaily-a-ulohy-na-pozadi#opakovani-s-rostoucim-odstupem

Místo, kam putuje úloha, která vyčerpala všechny pokusy nebo selhala trvalou chybou.
Nemá se opakovat automaticky — má si jí všimnout člověk a rozhodnout, co dál.

## --term-- plánovaná úloha

en: scheduled job
aliases: plánované úlohy, plánovanou úlohu, plánovaných úloh, cron úloha, cron
lekce: api-soubory-realtime/emaily-a-ulohy-na-pozadi#planovane-ulohy

Práce, kterou nespouští uživatel, ale čas: noční uzávěrka, úklid starých souborů,
připomínka. Plánovač by ji měl jen zapsat do fronty, běžet v jediné instanci
a počítat čas v UTC.
