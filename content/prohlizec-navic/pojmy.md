## --term-- web component

en: web component
aliases: web components, web komponenta, web komponenty, web komponent, web komponentou
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
lekce: prohlizec-navic/web-components#vlastni-znacka-trida-a-customelements-define

Vlastní HTML značka s vlastním chováním, kterou umí prohlížeč sám bez frameworku. Stojí na třech věcech: vlastním prvku, shadow DOM a značce `<slot>`.

## --term-- vlastní prvek

en: custom element
aliases: vlastního prvku, vlastnímu prvku, vlastním prvkem, vlastní prvky, vlastních prvků, vlastními prvky
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
lekce: prohlizec-navic/web-components#vlastni-znacka-trida-a-customelements-define

Třída dědící z `HTMLElement`, zaregistrovaná pod jménem značky přes `customElements.define`. Jméno musí obsahovat pomlčku. Prohlížeč pak její metody životního cyklu volá sám.

## --term-- shadow DOM

en: shadow DOM
aliases: shadow DOMu, shadow DOMem, stínový strom, stínového stromu, stínovém stromu
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM
lekce: prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

Oddělený strom prvků připojený k prvku přes `attachShadow`. Selektory zvenčí do něj nedosáhnou a jeho styly neuniknou ven; dědičné vlastnosti a CSS proměnné hranicí projdou.

## --term-- shadow root

en: shadow root
aliases: shadow rootu, shadow rootem, kořen stínu, kořene stínu
mdn: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot
lekce: prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

Kořen shadow DOM, dostupný jako `element.shadowRoot` (u `mode: 'open'`). Zapisuje se do něj obsah komponenty; co má prvek ve světlém stromu, se bez `<slot>` nevykreslí.

## --term-- světlý strom

en: light DOM
aliases: světlého stromu, světlém stromu, světlým stromem
lekce: prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

Obyčejní potomci prvku v dokumentu — to, co je mezi otevírací a uzavírací značkou komponenty. Prohlížeč je zobrazí jen tam, kde pro ně shadow DOM má `<slot>`.

## --term-- slot komponenty

en: slot
aliases: slotu komponenty, sloty komponenty, slotů komponenty
mdn: https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement
lekce: prohlizec-navic/web-components#slot-obsah-ktery-doda-stranka

Značka `<slot>` uvnitř shadow DOM, do které prohlížeč promítne potomky zapsané zvenčí. Pojmenovaný slot bere potomky s odpovídajícím atributem `slot`, bezejmenný všechny ostatní.

## --term-- upgrade vlastnosti

en: lazy property upgrade
aliases: upgradu vlastnosti, upgrade vlastností
lekce: prohlizec-navic/web-components#typicke-chyby-a-pasti

Trik, kterým vlastní prvek zachrání hodnotu zapsanou do vlastnosti dřív, než byla třída zaregistrovaná: v `connectedCallback` vlastnost smaže (`delete this.hodnota`) a nastaví znovu, takže se uplatní setter třídy.

## --term-- vlastní událost

en: CustomEvent
aliases: vlastní události, vlastních událostí, vlastní událostí, vlastními událostmi
mdn: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
lekce: prohlizec-navic/web-components#ven-jen-udalosti

Událost, kterou vyrobíš a vyšleš sám: `new CustomEvent('zmena', { detail, bubbles })`. Data se vezou v `detail`. Z shadow DOM se ven dostane jen s `composed: true`.

## --term-- Web Worker

en: Web Worker
aliases: Web Workeru, Web Workery, Web Workerů, Web Workerem, dedikovaný worker
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
lekce: prohlizec-navic/web-workers#vlakno-navic-a-co-v-nem-neni

Skript běžící ve vlastním vlákně vedle stránky. Nemá přístup k DOM ani k `localStorage`; se stránkou si vyměňuje zprávy přes `postMessage`.

## --term-- strukturované klonování

en: structured clone
aliases: strukturovaného klonování, strukturovaným klonováním, structuredClone
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
lekce: prohlizec-navic/web-workers#postmessage-zpravy-misto-sdilene-pameti

Algoritmus, kterým prohlížeč hluboce kopíruje data posílaná mezi vlákny. Zvládne `Map`, `Set`, `Date` i cykly, ale ne funkce, DOM prvky a prototypy tříd.

## --term-- přenositelný objekt

en: transferable object
aliases: přenositelné objekty, přenositelných objektů, přenositelným objektem
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
lekce: prohlizec-navic/web-workers#prenos-misto-kopie-arraybuffer

Objekt, jehož paměť se mezi vlákny předá místo kopírování (`ArrayBuffer`, `MessagePort`, `ImageBitmap`). Po přenosu je na odesílající straně nepoužitelný.

## --term-- service worker

en: service worker
aliases: service workeru, service workery, service workerů, service workerem, servisní worker
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
lekce: prohlizec-navic/service-worker-a-pwa#zivotni-cyklus-install-activate-fetch

Skript běžící mimo stránku, který odchytává její síťové požadavky a smí na ně odpovědět sám. Žije dál i po zavření karty a registruje se jen z HTTPS.

## --term-- Cache Storage

en: Cache Storage
aliases: Cache Storage API, spíž service workeru, spíže service workeru
mdn: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
lekce: prohlizec-navic/service-worker-a-pwa#cache-storage-vlastni-spiz

Pojmenované úložiště dvojic požadavek → odpověď, do kterého si service worker ukládá soubory. Na rozdíl od HTTP cache o jeho obsahu i době platnosti rozhoduje tvůj kód.

## --term-- cache-first

en: cache first
aliases: cache first, nejdřív spíž
lekce: prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou

Strategie, která nejdřív hledá ve spíži a na síť jde, jen když tam nic není. Hodí se na soubory s otiskem obsahu v názvu, jejichž obsah se na dané adrese už nezmění.

## --term-- network-first

en: network first
aliases: network first, nejdřív síť
lekce: prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou

Strategie, která se nejdřív ptá sítě a spíž použije až jako záchranu při výpadku. Hodí se na HTML, aby uživatel po nasazení nedostal starou verzi aplikace.

## --term-- stale-while-revalidate

en: stale-while-revalidate
aliases: stale while revalidate
lekce: prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou

Strategie, která vrátí obsah ze spíže okamžitě a na pozadí si stáhne čerstvou verzi pro příště. Kompromis mezi rychlostí a čerstvostí, vhodný pro data z API.

## --term-- manifest webové aplikace

en: web app manifest
aliases: manifestu webové aplikace, webový manifest, manifest aplikace
mdn: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
lekce: prohlizec-navic/service-worker-a-pwa#manifest-a-instalace-na-plochu

Soubor JSON, ve kterém web popíše jméno, ikony, barvy a způsob zobrazení pro instalaci na plochu. Spolu se service workerem a HTTPS z webu dělá instalovatelnou aplikaci.

## --term-- IndexedDB

en: IndexedDB
aliases: IndexedDB databáze, indexovaná databáze prohlížeče
mdn: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
lekce: prohlizec-navic/indexeddb#kdyz-localstorage-nestaci

Asynchronní databáze v prohlížeči pro velké objemy dat. Ukládá strukturovaným klonováním (zvládne `Date`, `Map` i `Blob`) a umí nad daty indexy.

## --term-- objektové úložiště

en: object store
aliases: objektového úložiště, objektová úložiště, objektových úložišť, object store
mdn: https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
lekce: prohlizec-navic/indexeddb#indexeddb-v-peti-krocich

Obdoba tabulky v IndexedDB: pojmenovaná kolekce záznamů s klíčem. Zakládá se jen v události `upgradeneeded` a `keyPath` určuje, které pole slouží jako klíč.

## --term-- transakce v IndexedDB

en: IndexedDB transaction
aliases: transakci v IndexedDB, transakce IndexedDB
mdn: https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
lekce: prohlizec-navic/indexeddb#indexeddb-v-peti-krocich

Obálka nad skupinou operací v IndexedDB v režimu `readonly` nebo `readwrite`. Buď projdou všechny, nebo se změny vrátí zpátky; konec ohlásí událost `complete`.

## --term-- kvóta úložiště

en: storage quota
aliases: kvótu úložiště, kvóty úložiště, kvótou úložiště
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
lekce: prohlizec-navic/indexeddb#kvota-a-mazani

Místo, které prohlížeč webu povolí zabrat. Při jeho překročení zápis skončí chybou `QuotaExceededError`; při nedostatku místa prohlížeč data málo navštěvovaných webů maže sám.
