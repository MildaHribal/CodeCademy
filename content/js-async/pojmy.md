## --term-- event loop

en: event loop
aliases: smyčka událostí, smyčky událostí, event loopu, event loopem
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
lekce: js-async/event-loop#cekani-obstara-prohlizec-fronta-uloh

Mechanismus, který opakovaně bere další úlohu z fronty a spouští ji, když je zásobník volání prázdný. Po každé úloze nejdřív vyprázdní frontu mikroúloh a prohlížeč smí překreslit stránku.

## --term-- fronta úloh

en: task queue
aliases: fronty úloh, frontě úloh, frontu úloh
mdn: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
lekce: js-async/event-loop#cekani-obstara-prohlizec-fronta-uloh

Fronta callbacků, které prohlížeč připravil ke spuštění: časovače, události, zprávy. Event loop z ní bere jednu úlohu po druhé.

## --term-- mikroúloha

en: microtask
aliases: mikroúlohy, mikroúloh, mikroúlohou, mikroúlohu
mdn: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
lekce: js-async/event-loop#mikroulohy-promise-ma-prednost

Přednostní úloha, typicky callback Promise nebo pokračování za `await`. Fronta mikroúloh se vyprázdní celá po každé úloze, dřív než přijde na řadu další úloha nebo vykreslení.

## --term-- dlouhá úloha

en: long task
aliases: dlouhé úlohy, dlouhou úlohu
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Long_task
lekce: js-async/event-loop#dlouhy-vypocet-zamrazi-stranku

Úloha, která drží hlavní vlákno déle než 50 ms. Stránka mezitím nereaguje na kliknutí ani se nepřekresluje.

## --term-- Promise

en: Promise
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
lekce: js-async/promise#promise-ma-tri-stavy

Objekt, který zastupuje výsledek asynchronní operace, jenž ještě není hotový. Čeká, pak se jednou usadí: splní se s hodnotou, nebo zamítne s důvodem.

## --term-- neobsloužené zamítnutí

en: unhandled rejection
aliases: neobslouženého zamítnutí, neobsloužené zamítnutí Promise
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
lekce: js-async/promise#chyby-catch-a-finally

Zamítnutá Promise, na kterou nikdo nečeká přes `catch` ani `await` v `try`. V konzoli se ukáže jako `Uncaught (in promise)` a uživatel se o chybě nedozví.

## --term-- AbortController

en: AbortController
aliases: AbortControlleru, AbortControllerem, zrušení přes signal
mdn: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
lekce: js-async/async-await#zruseni-abortcontroller-a-signal

Ovladač zrušení. Jeho `signal` se předá funkci, která zrušení podporuje (třeba `fetch`), a `controller.abort()` ji zastaví: její Promise se zamítne chybou `AbortError`.

## --term-- exponenciální čekání

en: exponential backoff
aliases: exponenciálním čekáním, exponenciálního čekání
lekce: js-async/workshop-casovace/011

Opakování po chybě, při kterém se před každým dalším pokusem čeká dvakrát déle (100 ms, 200 ms, 400 ms). Přetížený server tak dostane čas se vzpamatovat.

## --term-- původ

en: origin
aliases: původu, původem, původy, stejného původu
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Origin
lekce: js-async/fetch#cors-z-pohledu-prohlizece

Trojice schéma, doména a port adresy, třeba `https://moje-pocasi.cz:443`. Skript v prohlížeči smí bez dovolení číst jen odpovědi ze svého původu.

## --term-- CORS

en: Cross-Origin Resource Sharing
aliases: chyba CORS, chybou CORS
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
lekce: js-async/fetch#cors-z-pohledu-prohlizece

Pravidla, podle kterých server hlavičkou `Access-Control-Allow-Origin` dovolí stránce z jiného původu číst své odpovědi. Vynucuje je prohlížeč; opravuje se na serveru, ne ve `fetch`.

## --term-- souběh odpovědí

en: race condition
aliases: souběhu odpovědí, souběhem odpovědí, race condition
lekce: js-async/fetch#soubeh-odpovedi-starsi-nesmi-prepsat-novejsi

Chyba, kdy výsledek závisí na pořadí, v jakém dorazí souběžné odpovědi: pomalá odpověď na starší požadavek přepíše novější. Řeší se zrušením předchozího požadavku nebo kontrolou čísla požadavku.
