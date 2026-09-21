# Service worker a offline režim

:::check pretest
Stránka má service worker, který ukládá soubory do vlastní spíže. Uživatel je ve vlaku bez signálu a stránku načte znovu. Odkud se vezme HTML?

### --correct--
Ze spíže — požadavek vůbec neopustí prohlížeč, odpoví na něj skript.

#### --why--
Service worker sedí mezi stránkou a sítí. Když na požadavek odpoví sám, síť se
nepoužije, a je jedno, jestli funguje.

### --answer--
Z HTTP cache prohlížeče, pokud tam soubor ještě je.

#### --why--
HTTP cache pomůže jen náhodou — o tom, co v ní zůstane a jak dlouho, rozhoduje server
hlavičkami. Service worker je tvoje rozhodnutí, ne serverovo.

### --answer--
Nevezme se odnikud, bez sítě se stránka nenačte.

#### --why--
To platí pro běžnou stránku. Se service workerem si prohlížeč umí odpovědět sám.
:::

Spotify, Figma, Google Docs i mapy v telefonu dělají jednu věc společně: po prvním
načtení fungují i bez sítě. Za tím je [[service worker]] — skript, který běží mimo
stránku a **odchytává její požadavky**.

> [!REMEMBER]
> **Service worker je programovatelná proxy mezi tvojí stránkou a sítí.** Nesedí ve
> stránce, ale vedle ní: běží dál i po zavření karty a na každý požadavek smí odpovědět
> po svém.

## Problém: appka, která ve vlaku umře

Bez service workeru je každý požadavek otázka na server. Bez signálu dostaneš chybovou
stránku prohlížeče — i když se od minule nic nezměnilo a všechno potřebné už jsi jednou
stáhl.

HTTP cache to nezachrání: rozhoduje o ní server hlavičkami `Cache-Control`, platí jen
pro `GET`, nedá se v ní hledat a ty do ní nevidíš. Service worker naproti tomu:

- rozhoduješ ty, v JavaScriptu, požadavek po požadavku,
- data ukládáš do vlastního úložiště [[Cache Storage]] a můžeš je kdykoli vypsat,
- funguje i pro požadavky, které stránka vůbec nezačala (třeba dopředné stažení).

:::check
Čím se service worker liší od HTTP cache prohlížeče?

### --correct--
O obsahu i době platnosti rozhoduje tvůj kód, ne hlavičky od serveru.

#### --why--
To je celý rozdíl: HTTP cache je dohoda se serverem, service worker je program, který
si píšeš sám a máš ho pod kontrolou.

### --answer--
Je rychlejší, protože ukládá do paměti a ne na disk.

#### --why--
Obojí končí na disku. Rychlost není důvod, proč se service worker používá.

### --answer--
Umí na rozdíl od HTTP cache ukládat i odpovědi na `POST`.

#### --why--
`Request` s `POST` se do Cache Storage uložit nedá. Odesílání offline se řeší jinak —
frontou požadavků a synchronizací na pozadí.
:::

## Životní cyklus: install → activate → fetch

Service worker se registruje ze stránky a pak žije vlastním životem:

```js
// v main.js na stránce
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

```js
// v sw.js — běží mimo stránku, nemá document
const VERZE = 'zapisnik-v3';

self.addEventListener('install', (udalost) => {
  // 1. Připrav si zásoby
  udalost.waitUntil(
    caches.open(VERZE).then((cache) => cache.addAll(['/', '/styles.css', '/app.js'])),
  );
});

self.addEventListener('activate', (udalost) => {
  // 2. Ukliď po starší verzi
  udalost.waitUntil(
    caches.keys().then((jmena) =>
      Promise.all(jmena.filter((jmeno) => jmeno !== VERZE).map((jmeno) => caches.delete(jmeno))),
    ),
  );
});

self.addEventListener('fetch', (udalost) => {
  // 3. Odpovídej
  udalost.respondWith(caches.match(udalost.request).then((z) => z ?? fetch(udalost.request)));
});
```

Tři pojmenované fáze — **připrav zásoby**, **ukliď po starší verzi**, **odpovídej** — se
neliší podle projektu. Liší se jen to, co dáš do `addAll` a jak se rozhoduješ v `fetch`.

Mezi `install` a `activate` je ale past, kvůli které si vývojáři rvou vlasy:

> [!PITFALL]
> **Nový service worker čeká.** Když je stránka otevřená a ty nasadíš novou verzi,
> nainstaluje se, ale zůstane ve stavu *waiting* — starou verzi obsluhuje pořád ten
> původní. Příznak: nasadil jsi opravu, tvrdé obnovení (Ctrl+Shift+R) nepomůže a v
> DevTools → **Application** → **Service Workers** vidíš dva. Pomůže zavřít **všechny**
> karty s tou stránkou, tlačítko **skipWaiting** v DevTools, nebo `self.skipWaiting()`
> v `install` a `self.clients.claim()` v `activate`.

:::check
Ve které fázi životního cyklu se maže spíž po předchozí verzi a proč právě tam?

### --expected--
activate

### --why--
V `install` ještě běží stará verze a používá svoji spíž — kdybys ji smazal, podřízl bys
větev sám sobě. `activate` nastane až ve chvíli, kdy starý worker skončil a nový přebírá
službu. Teprve tehdy jsou stará data opravdu k ničemu.
:::

## Cache Storage: vlastní spíž

`caches` je pojmenované úložiště dvojic **požadavek → odpověď**. Hlavní operace:

| volání | co udělá |
|---|---|
| `caches.open('v3')` | otevře (nebo založí) pojmenovanou spíž |
| `cache.addAll([…])` | stáhne seznam adres a uloží odpovědi |
| `cache.put(request, response)` | uloží ručně vyrobenou dvojici |
| `caches.match(request)` | najde odpověď napříč všemi spížemi (nebo `undefined`) |
| `caches.delete('v2')` | zahodí celou spíž |

Jméno spíže je **tvoje verze**. Když vydáš novou verzi appky, změníš jméno — a starou
spíž v `activate` smažeš. Tím se řeší to, co by se jinak řešilo velmi bolestivě.

> [!PITFALL]
> **Odpověď se dá přečíst jen jednou.** `Response` je stream. Když odpověď uložíš do
> spíže a zároveň ji chceš vrátit stránce, musíš si ji naklonovat:
> `cache.put(pozadavek, odpoved.clone())`. Bez klonu dostaneš
> `TypeError: Failed to execute 'put' on 'Cache': Response body is already used`.

:::check
Proč se v `fetch` posluchači volá `cache.put(pozadavek, odpoved.clone())` a ne rovnou `cache.put(pozadavek, odpoved)`?

### --correct--
Tělo odpovědi se dá přečíst jen jednou a odpověď ještě potřebuješ vrátit stránce.

#### --why--
`Response` je stream. Uložení ho spotřebuje. Klon je druhá „trubka" nad týmiž daty.

### --answer--
Protože uložená odpověď by se jinak po čase sama smazala.

#### --why--
Doba života ve spíži na klonování nezávisí — data tam zůstanou, dokud je nesmažeš ty
nebo prohlížeč při nedostatku místa.

### --answer--
Protože `put` vyžaduje kopii kvůli bezpečnosti mezi zdroji.

#### --why--
Pravidla mezi zdroji (CORS) řeší, co se vůbec dá uložit. S klonováním to nesouvisí.
:::

## Tři strategie a kdy kterou

Celé rozhodování v `fetch` se dá shrnout do tří vzorů. Tahle ukázka je má vedle sebe —
místo skutečné sítě a spíže jsou tu jen `Map` a funkce, aby bylo vidět pořadí.

:::live js
```js
const spiz = new Map([['/styles.css', 'CSS ze spíže (verze 1)']]);
const zeSite = (url) => new Promise((hotovo) => setTimeout(() => hotovo(`${url} ze sítě (verze 2)`), 20));

// 1. Nejdřív spíž: rychlé, ale může být zastaralé
async function cacheFirst(url) {
  const ulozene = spiz.get(url);
  if (ulozene) return ulozene;
  const cerstve = await zeSite(url);
  spiz.set(url, cerstve);
  return cerstve;
}

// 2. Nejdřív síť: čerstvé, ale bez sítě padá zpátky do spíže
async function networkFirst(url) {
  try {
    const cerstve = await zeSite(url);
    spiz.set(url, cerstve);
    return cerstve;
  } catch {
    return spiz.get(url) ?? 'nemám nic';
  }
}

async function ukazka() {
  console.log('cacheFirst:', await cacheFirst('/styles.css'));
  console.log('networkFirst:', await networkFirst('/styles.css'));
}

ukazka();
```
:::

Zkus první řádek se `spiz` nahradit prázdnou `new Map()` a sleduj, že `cacheFirst`
začne vracet verzi 2 — tedy že spíž doplní, když v ní nic není.

Třetí vzor je kompromis: vrať hned, co máš, a na pozadí si to aktualizuj.

:::live js predict
```js
const spiz = new Map([['/kurzy.json', 'kurzy ze spíže']]);
const zeSite = () => Promise.resolve('kurzy ze sítě');

async function staleWhileRevalidate(url) {
  const ulozene = spiz.get(url);
  if (ulozene) console.log('hned:', ulozene);

  const cerstve = await zeSite(url);
  spiz.set(url, cerstve);
  console.log('později:', cerstve);
}

staleWhileRevalidate('/kurzy.json');
console.log('konec skriptu');
```
--question-- V jakém pořadí se vypíšou tři řádky?
--expected--
```text
hned: kurzy ze spíže
konec skriptu
později: kurzy ze sítě
```
--why-- Funkce běží synchronně až k prvnímu `await`, takže „hned" se vypíše ještě před návratem do hlavního skriptu. Pak se řízení vrátí a doběhne „konec skriptu". Pokračování za `await` je mikroúloha, takže přijde na řadu až potom. Přesně tohle uživatel vidí: obsah okamžitě, aktualizaci o chvíli později.

:::

Kterou strategii kde:

| druh požadavku | strategie | proč |
|---|---|---|
| hotové soubory s otiskem v názvu (`app.8f3a.js`) | cache-first | obsah se u téhle adresy už nikdy nezmění |
| HTML stránky | network-first | ať uživatel po nasazení nevidí starou aplikaci |
| data z API, která nemusí být čerstvá na vteřinu | stale-while-revalidate | rychlá odezva a tichá aktualizace |
| odesílání formuláře, platba | žádná | `POST` se nekešuje, offline se řeší frontou |

:::check
Obrázky produktů mají adresy jako `/fotky/kniha-1290.jpg` a jednou nahraná fotka se už nemění. Kterou strategii zvolíš?

### --expected--
cache-first

### --accept--
nejdřív spíž
cache first
### --why--
Když se obsah na dané adrese nemění, je každý dotaz na síť zbytečný. Cache-first je
nejrychlejší a nemá jak vrátit špatná data. U HTML by byla naopak špatně — uživatel by
po nasazení viděl starou verzi appky.
:::

## Manifest a instalace na plochu

Service worker dá aplikaci offline režim. Aby šla **nainstalovat** jako appka (ikona na
ploše, vlastní okno bez adresního řádku), potřebuje ještě [[manifest webové aplikace]]:

```json
{
  "name": "Zápisník",
  "short_name": "Zápisník",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/ikony/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/ikony/512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```html
<link rel="manifest" href="/manifest.webmanifest">
```

Tomuhle celku — manifest plus service worker plus HTTPS — se říká **PWA** (*progressive
web app*). Slovo samo o sobě nic technického neznamená; je to jen jméno pro web, který
se chová jako aplikace.

> [!TIP]
> Všechno si zkontroluješ v DevTools na kartě **Application**: vlevo **Manifest**
> (co prohlížeč z manifestu přečetl), **Service Workers** (stav, tlačítka *update*
> a *unregister*) a **Cache Storage** (co přesně máš uložené). Zaškrtávátko **Offline**
> v panelu Network je nejrychlejší test.

:::check
Aplikace má správný manifest i ikony, ale prohlížeč ji nenabídne k instalaci. Co jí nejspíš ještě chybí?

### --expected--
service worker

### --accept--
registrovaný service worker
service worker a https
### --why--
Manifest sám o sobě říká jen „takhle vypadám". Aby šla aplikace nainstalovat, musí
prohlížeč věřit, že bude fungovat i bez sítě — proto vyžaduje registrovaný service
worker a stránku na HTTPS (výjimkou je `localhost` při vývoji).
:::

:::explain
Vysvětli, proč uživatel po nasazení nové verze aplikace se service workerem někdy pořád vidí tu starou — i po obnovení stránky.

## --model--
Obnovení stránky nestačí, protože obsluhu požadavků neřídí stránka, ale service worker,
a ten běží vedle ní. Nová verze se sice stáhne a nainstaluje, ale zůstane čekat, dokud
je otevřená aspoň jedna karta obsluhovaná starou verzí. Do té doby odpovídá pořád ta
stará — a když navíc vrací soubory ze své spíže, nepomůže ani tvrdé obnovení. Převzetí
se dá vynutit přes `skipWaiting` a `clients.claim`.

## --checklist--
- Požadavky obsluhuje service worker, ne stránka, takže obnovení stránky ho nevymění.
- Nová verze čeká, dokud běží karty obsluhované tou starou.
- Odpovědi ze spíže obejdou síť, takže tvrdé obnovení nemusí pomoci.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`respondWith` musí dostat odpověď hned.** Když v posluchači `fetch` napíšeš
> `udalost.respondWith(await neco())`, je pozdě: `respondWith` se musí zavolat synchronně
> a dostat promise. Příznak: `InvalidStateError: The event handler is already finished`
> a požadavky jdou rovnou na síť, jako by service worker nebyl.

> [!PITFALL]
> **Zacachované HTML s odkazem na starý skript.** Uložíš `/` cache-first, nasadíš novou
> verzi, ale uživatel dostane staré HTML, které odkazuje na `app.8f3a.js` — a ten už na
> serveru není. Appka spadne na 404 v konzoli. HTML proto dávej network-first.

> [!PITFALL]
> **Service worker jde registrovat jen z HTTPS.** Na `http://` (kromě `localhost`)
> `navigator.serviceWorker` buď chybí, nebo registrace skončí na
> `SecurityError: Failed to register a ServiceWorker: … only secure origins are allowed`.

> [!PITFALL]
> **Rozsah (*scope*) je dán umístěním souboru.** `sw.js` v `/js/sw.js` obsluhuje jen
> požadavky pod `/js/`. Příznak: registrace projde, ale posluchač `fetch` se nikdy
> nespustí. Soubor service workeru patří do kořene webu.

:::check
V posluchači `fetch` napíšeš `udalost.respondWith(await najdiVeSpizi(udalost.request))`. Co se stane?

### --correct--
Skončí to chybou a požadavky půjdou rovnou na síť, jako by service worker nebyl.

#### --why--
`respondWith` se musí zavolat **synchronně**, dokud událost běží. Čekáním na `await` se
posluchač mezitím uzavře a prohlížeč požadavek obslouží sám.

### --answer--
Bude to fungovat, jen o něco pomaleji.

#### --why--
Prohlížeč na rozhodnutí service workeru nečeká donekonečna — potřebuje ho hned,
jinak pokračuje po svém.

### --answer--
Odpověď se vrátí, ale bez hlaviček.

#### --why--
Hlavičky s tím nesouvisí. Problém je v okamžiku, kdy se `respondWith` zavolá.
:::

## Kde to najdeš v MDN

- [Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) —
  registrace, životní cyklus a kompletní ukázka offline stránky.
- [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) — `add`, `addAll`,
  `put`, `match` a jejich volby (`ignoreSearch`, `ignoreVary`).
- [FetchEvent.respondWith()](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith) —
  proč se musí volat synchronně a co smí dostat.
- [Web app manifests](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest) —
  všechny klíče manifestu včetně `display` a `shortcuts`.

# --questions--

## --question--

Service worker leží na adrese `/static/sw.js` a registruje se bez dalších voleb. Které požadavky bude obsluhovat?

### --correct--
Jen ty, které začínají `/static/`.

#### --why--
Rozsah se odvozuje z umístění souboru. Proto se service worker dává do kořene webu —
jinak se `fetch` posluchač u požadavků na `/` nikdy nespustí.

### --answer--
Všechny požadavky celého webu.

#### --why--
To by platilo, kdyby soubor ležel v kořeni. Rozsah se nikdy nerozšiřuje nahoru sám od
sebe (jen serverovou hlavičkou `Service-Worker-Allowed`).

### --answer--
Žádné — registrace mimo kořen selže.

#### --why--
Registrace projde. Jen bude obsluhovat menší kus webu, než čekáš, a to se hledá hůř než
chyba při registraci.

### --see--

prohlizec-navic/service-worker-a-pwa#typicke-chyby-a-pasti

## --question--

Napiš jedním slovem strategii, kterou zvolíš pro soubor `app.8f3a12.js`, jehož jméno obsahuje otisk obsahu.

### --expected--
cache-first

### --accept--
cache first
nejdřív spíž

### --why--
Obsah na téhle adrese se už nikdy nezmění — při změně kódu vznikne jiný otisk a tedy
jiná adresa. Dotaz na síť by tak byl vždycky zbytečný.

### --see--

prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou

## --question--

**Opakování z dřívějška.** Server pošle hlavičku `Cache-Control: max-age=31536000, immutable`. Co tím říká prohlížeči?

### --correct--
Tenhle soubor si rok neověřuj, obsah se na téhle adrese nezmění.

#### --why--
Přesně proto se do jmen souborů dává otisk obsahu: nová verze má jinou adresu, takže
dlouhá platnost nevadí. Service worker dělá totéž, jen si o tom rozhoduje sám.

### --answer--
Soubor se má uložit do cache, ale při každém použití ověřit dotazem na server.

#### --why--
To by byla hlavička `no-cache`. `max-age` naopak říká, jak dlouho se ověřovat nemá.

### --answer--
Soubor se nesmí ukládat do žádné cache.

#### --why--
To je `no-store`. Ta se používá u citlivých odpovědí, ne u statických souborů.

### --see--

prohlizec-navic/service-worker-a-pwa#problem-appka-ktera-ve-vlaku-umre

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
async function nacti() {
  console.log('start');
  const hodnota = await Promise.resolve('data');
  console.log(hodnota);
}
nacti();
console.log('konec');
```

### --expected--
```text
start
konec
data
```

### --why--
Tělo `async` funkce běží synchronně až k prvnímu `await`. Pokračování za ním je
mikroúloha, takže se spustí, až doběhne aktuální skript. Na tomhle stojí celá strategie
stale-while-revalidate: uživateli odpovíš z prvního, synchronního kusu.

### --see--

prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou
