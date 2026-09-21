# Úložiště v prohlížeči: od localStorage k IndexedDB

:::check pretest
Do `localStorage` uložíš počet kusů v košíku: `localStorage.setItem('kusy', 3)`. Co ti vrátí `localStorage.getItem('kusy')`?

### --correct--
Řetězec `'3'`.

#### --why--
Web Storage umí jen text. Číslo se při ukládání převede na řetězec a zpátky už se samo
nepřevede.

### --answer--
Číslo `3`.

#### --why--
To by muselo úložiště znát typy. Neumí je — všechno, co do něj dáš, projde přes `String()`.

### --answer--
`null`, protože číslo se uložit nedá.

#### --why--
Uložit se dá cokoli, co jde převést na text. Jen se to vrátí jako text.
:::

Zápisník, který si pamatuje rozepsanou poznámku. E-shop, kde zůstane košík i po zavření
prohlížeče. Editor, který funguje bez sítě. Všechny tyhle věci potřebují **data uložená
u uživatele** — a prohlížeč na to nabízí čtyři různá místa.

> [!REMEMBER]
> **Vyber úložiště podle velikosti dat a podle toho, jestli si můžeš dovolit čekat.**
> `localStorage` je malý, textový a synchronní. IndexedDB je velká, typovaná a asynchronní.

## Čtyři úložiště a kdy které

| úložiště | kolik | co umí uložit | kdy se maže | typické použití |
|---|---|---|---|---|
| `sessionStorage` | ~5 MB | text | zavřením karty | rozepsaný formulář, krok průvodce |
| `localStorage` | ~5 MB | text | ručně nebo smazáním dat webu | motiv, jazyk, souhlas s cookies, ID uživatele |
| [[IndexedDB]] | stovky MB a víc | skoro cokoli (i `Blob`) | ručně nebo při uvolňování místa | offline data aplikace, fronta requestů, cache dotazů |
| [[Cache Storage]] | stovky MB a víc | dvojice požadavek → odpověď | ručně | soubory aplikace pro offline režim |

Dva případy, na které se zapomíná:

- **Cookies nejsou úložiště pro aplikaci.** Cestují s každým požadavkem na server, takže
  je drž malé a používej je jen na to, co server opravdu potřebuje (typicky přihlášení).
- **Nic z toho není bezpečné.** Kdokoli, kdo má přístup k prohlížeči nebo zvládne na
  stránku propašovat skript, si obsah přečte. Tokeny a hesla tam nepatří.

:::check
Uživatel vyplňuje třístránkový formulář a nemá se mu ztratit, když omylem obnoví stránku. Po zavření karty ale zbytek nikoho nezajímá. Které úložiště zvolíš?

### --expected--
sessionStorage

### --why--
`sessionStorage` žije přesně tak dlouho jako karta: obnovení stránky přežije, zavření
karty ne. V `localStorage` by rozepsaný formulář zůstal navždy a uživateli by se
o půl roku později vrátil.
:::

## `localStorage`: rychlé, malé a všechno je text

Rozhraní má pět metod a jednu vlastnost:

```js
localStorage.setItem('motiv', 'tmavy');
localStorage.getItem('motiv');        // 'tmavy'
localStorage.removeItem('motiv');
localStorage.key(0);                  // jméno prvního klíče
localStorage.clear();                 // smaže všechno pro tenhle web
localStorage.length;                  // kolik je uložených klíčů
```

:::live dom
```html
<p>Motiv stránky: <strong id="stav">?</strong></p>
<button id="prepnout">Přepnout motiv</button>
<p><small>Klikni, pak klikni na Obnovit nad ukázkou — hodnota zůstane.</small></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; padding: 1rem; border-radius: .5rem; }
body.tmavy { background: #0f172a; color: #e2e8f0; }
button { font: inherit; padding: .4rem .8rem; border-radius: .4rem; border: 1px solid #94a3b8; background: #fff; cursor: pointer; }
```
```js
const stav = document.getElementById('stav');

// 1. Přečti uložené nastavení (a měj záložní hodnotu)
function pouzijMotiv(motiv) {
  document.body.classList.toggle('tmavy', motiv === 'tmavy');
  stav.textContent = motiv;
}

pouzijMotiv(localStorage.getItem('motiv') ?? 'svetly');

// 2. Při změně ulož
document.getElementById('prepnout').addEventListener('click', () => {
  const novy = localStorage.getItem('motiv') === 'tmavy' ? 'svetly' : 'tmavy';
  localStorage.setItem('motiv', novy);
  pouzijMotiv(novy);
});
```
:::

Zkus operátor `??` nahradit prázdným řetězcem a sleduj, co se stane při prvním načtení —
`getItem` u neexistujícího klíče vrací `null`, ne prázdný řetězec.

:::live js predict
```js
localStorage.setItem('kusy', 3);

const kusy = localStorage.getItem('kusy');
console.log(typeof kusy);
console.log(kusy + 1);
console.log(localStorage.getItem('sleva'));
```
--question-- Co vypíšou tři `console.log`?
--expected--
```text
string
31
null
```
--why-- Web Storage ukládá jen text: `3` projde přes `String()` a vrátí se jako `'3'`. Plus pak nesčítá, ale spojuje řetězce — `'3' + 1` je `'31'`. A klíč, který nikdy nebyl uložený, vrací `null` (ne `undefined`, ne prázdný řetězec). Tyhle tři řádky jsou tři nejčastější chyby s `localStorage` v jedné ukázce.

:::

:::check
Co vrátí `localStorage.getItem('neexistujici-klic')`?

### --expected--
null

### --why--
Právě `null` je důvod, proč se kolem čtení píše `?? výchozí hodnota`. A taky proč
`JSON.parse(localStorage.getItem(klic))` u chybějícího klíče nespadne — `JSON.parse(null)`
vrátí `null`.
:::

## JSON kolem toho

Objekty a pole se ukládají přes `JSON.stringify` a čtou přes `JSON.parse`. Vyplatí se
obalit to dvěma funkcemi, protože obojí má svoje nástrahy:

```js
// 1. Zápis: objekt na text
function uloz(klic, hodnota) {
  localStorage.setItem(klic, JSON.stringify(hodnota));
}

// 2. Čtení: text na objekt, s obranou proti poškozenému obsahu
function nacti(klic, zaloha = null) {
  const text = localStorage.getItem(klic);
  if (text === null) return zaloha;
  try {
    return JSON.parse(text);
  } catch {
    return zaloha;
  }
}
```

> [!PITFALL]
> **`JSON.parse` na poškozeném obsahu spadne.** Stačí, že v úložišti zůstala data ze
> starší verze aplikace nebo je někdo ručně upravil v DevTools. Chyba
> `SyntaxError: Unexpected token 'u', "undefined" is not valid JSON` pak shodí celou
> aplikaci hned při startu. Čtení z úložiště vždycky obal `try`/`catch`.

> [!PITFALL]
> **`JSON.stringify` nezachová všechno.** `Date` se změní v řetězec, `Map` a `Set`
> v prázdný objekt `{}` a `undefined` klíče zmizí. Příznak: po načtení ti
> `ulozeno.datum.getFullYear()` hlásí `TypeError: … is not a function`. IndexedDB tohle
> nemá — ukládá strukturovaným klonováním, takže `Date` i `Map` přežijí.

:::check
V objektu máš `{ nazev: 'Nákup', vytvoreno: new Date() }`, uložíš ho přes `JSON.stringify` a zase načteš. Co bude v `vytvoreno`?

### --correct--
Řetězec s datem ve formátu ISO.

#### --why--
`JSON.stringify` zavolá na datu metodu `toJSON`, která vrátí text. Zpětný převod si
musíš udělat sám: `new Date(nactene.vytvoreno)`.

### --answer--
Objekt `Date` se správným časem.

#### --why--
JSON nemá typ pro datum. Cokoli, co do něj dáš, se musí vejít do textu, čísla, pole,
objektu nebo `true`/`false`/`null`.

### --answer--
`null`, protože `Date` se serializovat nedá.

#### --why--
Serializovat se dá dobře, jen ne zpátky. Výsledek je platný řetězec, třeba
`'2026-09-21T08:00:00.000Z'`.
:::

## Když `localStorage` nestačí

Tři meze, na které narazíš:

1. **Velikost.** Zhruba 5 MB na jeden web. Padesát poznámek se vejde, padesát poznámek
   s fotkami ne.
2. **Je synchronní.** Každé čtení i zápis blokuje hlavní vlákno. U pár klíčů je to
   neměřitelné, u megabajtu JSONu je to [[dlouhá úloha]] přesně tam, kde ji nechceš —
   při startu aplikace.
3. **Neumí hledat.** Chceš poznámky s určitým štítkem? Musíš načíst všechno, převést
   z JSONu a projít cyklem.

IndexedDB řeší všechny tři: je velká, **asynchronní** a nad daty umí **indexy**, takže
se v ní dá hledat bez načítání všeho.

> [!NOTE]
> Živou ukázku IndexedDB tady nenajdeš: stránky v Akademii běží v odstíněném rámu, kde
> prohlížeč databázi nepovoluje (`InvalidStateError: … access to the Indexed Database API
> is denied in this context`). Kód níž si zkus v konzoli na vlastní stránce — v DevTools
> ho uvidíš na kartě **Application** → **IndexedDB**.

:::check
Aplikace na poznámky ukládá do `localStorage` megabajt JSONu a načítá ho při startu. Která ze tří mezí se projeví jako první a jak se pozná?

### --correct--
Synchronní přístup — start aplikace se viditelně zpozdí, protože čtení i parsování drží hlavní vlákno.

#### --why--
Megabajt se do kvóty ještě vejde a hledat zatím nepotřebuješ. Co poznáš hned, je prodleva
před prvním vykreslením: po celou dobu čtení a `JSON.parse` nemůže prohlížeč nic nakreslit.

### --answer--
Velikost — megabajt už `localStorage` odmítne uložit.

#### --why--
Mez je kolem pěti megabajtů, takže jeden megabajt projde. `QuotaExceededError` přijde až
mnohem později, a proto tak nepříjemně.

### --answer--
Neschopnost hledat — bez indexu se poznámky vůbec nenačtou.

#### --why--
Načíst se dají všechny naráz, jen je to drahé. Hledání je problém až ve chvíli, kdy
nechceš celý obsah.
:::

## IndexedDB v pěti krocích

Rozhraní je staré a pracuje s událostmi místo s promisy. Pět kroků je ale pořád stejných:

```js
// 1. Otevři databázi (jméno + číslo verze)
const pozadavek = indexedDB.open('zapisnik', 1);

// 2. Při první verzi (nebo změně čísla) vytvoř strukturu
pozadavek.onupgradeneeded = () => {
  const db = pozadavek.result;
  const uloziste = db.createObjectStore('poznamky', { keyPath: 'id' });
  uloziste.createIndex('podleStitku', 'stitek', { unique: false });
};

pozadavek.onsuccess = () => {
  const db = pozadavek.result;

  // 3. Otevři transakci nad úložištěm
  const transakce = db.transaction('poznamky', 'readwrite');
  const uloziste = transakce.objectStore('poznamky');

  // 4. Zapisuj a čti
  uloziste.put({ id: 1, stitek: 'nákup', text: 'mléko, chleba', vytvoreno: new Date() });

  const cteni = uloziste.index('podleStitku').getAll('nákup');
  cteni.onsuccess = () => console.log(cteni.result);

  // 5. Poznej konec
  transakce.oncomplete = () => console.log('hotovo');
};
```

Pojmy, které v tom kódu potkáváš: [[objektové úložiště]] je obdoba tabulky, `keyPath`
říká, které pole slouží jako klíč, index je předpočítané hledání podle jiného pole a
[[transakce v IndexedDB]] je obálka, ve které všechny operace buď projdou, nebo se
společně vrátí zpátky.

Protože psát takhle celou aplikaci by nikoho nebavilo, obaluje se to do promisů:

```js
function jakoPromise(pozadavek) {
  return new Promise((splnit, odmitnout) => {
    pozadavek.onsuccess = () => splnit(pozadavek.result);
    pozadavek.onerror = () => odmitnout(pozadavek.error);
  });
}

const poznamky = await jakoPromise(uloziste.index('podleStitku').getAll('nákup'));
```

> [!TIP]
> Ve skutečném projektu sáhni po knihovně `idb` nebo `dexie`. Dělají přesně tohle
> obalení, ale ošetřují i případy, na které sám nepřijdeš (zavřená databáze, souběžné
> verze ve dvou kartách). Kód výš znát stačí na to, abys jim rozuměl.

:::check
Ve kterém posluchači se v IndexedDB zakládají objektová úložiště a indexy?

### --expected--
onupgradeneeded

### --accept--
v události upgradeneeded
upgradeneeded
### --why--
Struktura databáze se smí měnit jen v `onupgradeneeded`, a ten se spustí při prvním
otevření nebo při zvýšení čísla verze. Kdybys `createObjectStore` zavolal jinde,
dostaneš `InvalidStateError`. Je to stejný nápad jako migrace u SQL databáze.
:::

## Kvóta a mazání

Prohlížeč nedá webu neomezené místo. Kolik zbývá, zjistíš takhle:

```js
const { usage, quota } = await navigator.storage.estimate();
console.log(`využito ${Math.round(usage / 1e6)} MB z ${Math.round(quota / 1e6)} MB`);
```

Když dojde místo nebo prohlížeč uklízí, data **smaže bez ptaní** — typicky u webů, které
uživatel dlouho nenavštívil. Trvalejší úložiště se dá požádat o výjimku:

```js
const trvale = await navigator.storage.persist();   // true = prohlížeč slíbil, že nesmaže
```

> [!PITFALL]
> **Data v prohlížeči nejsou záloha.** Uživatel si smaže data webu, otevře appku v jiném
> prohlížeči nebo na telefonu — a nemá nic. Cokoli, o co uživatel nesmí přijít, musí mít
> cestu na server nebo do exportu.

:::check
Aplikace ukládá poznámky jen do IndexedDB. Uživatel si v prohlížeči smaže data webu. Co se stane?

### --correct--
Poznámky jsou nenávratně pryč, aplikace o nich neví.

#### --why--
Úložiště prohlížeče je pohodlí, ne záloha. Proto má mít každá offline aplikace synchronizaci
na server nebo aspoň export do souboru.

### --answer--
Prohlížeč se zeptá, jestli data opravdu smazat.

#### --why--
Zeptá se jednou, obecně na data webu — o tvoje poznámky se nestará a jmenovitě je
nezmíní.

### --answer--
Nic, `navigator.storage.persist()` tomu zabrání.

#### --why--
`persist` chrání před automatickým uklízením prohlížeče, ne před uživatelem. Ten si
smazat může vždycky všechno.
:::

:::explain
Vysvětli, proč je synchronní `localStorage` v pořádku pro uložení motivu stránky, ale ne pro tisíc poznámek.

## --model--
`localStorage` pracuje synchronně: než `getItem` vrátí hodnotu, hlavní vlákno stojí.
U jednoho krátkého klíče je to zlomek milisekundy, takže to nikdo nepozná. U tisíce
poznámek se ale musí načíst celý megabajtový řetězec a rozparsovat JSONem, a to se dělá
zrovna ve chvíli, kdy se aplikace spouští — uživatel tedy čeká na prázdnou obrazovku.
IndexedDB je asynchronní a umí vrátit jen to, na co se ptáš, takže vlákno zůstane volné
pro vykreslení.

## --checklist--
- `localStorage` blokuje hlavní vlákno po celou dobu čtení i zápisu.
- U malé hodnoty je to neměřitelné, u megabajtu dat je to viditelné zdržení při startu.
- IndexedDB je asynchronní a umí načíst jen část dat, takže vlákno zůstane volné.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Ukládání při každém stisku klávesy.** `input` posluchač, který volá `setItem` s celým
> textem poznámky, zapisuje synchronně na disk při každém písmenu. Psaní se začne sekat.
> Ukládej až po pauze v psaní (debounce) nebo při `blur`.

> [!PITFALL]
> **Překročení kvóty.** Jakmile se `localStorage` naplní, `setItem` vyhodí
> `QuotaExceededError: Failed to execute 'setItem' on 'Storage': Setting the value of
> 'poznamky' exceeded the quota.` Nestane se to postupně — appka jednoho dne přestane
> ukládat. Zápis většího objemu dat patří do `try`/`catch`.

> [!PITFALL]
> **Dvě karty, dvě pravdy.** Když má uživatel appku otevřenou dvakrát, obě karty čtou
> a přepisují tytéž klíče a jedna druhé data přepíše. Na to je událost `storage`, která
> se spustí v **ostatních** kartách po každé změně.

> [!PITFALL]
> **Verze databáze jde jen nahoru.** Když v IndexedDB snížíš číslo verze, otevření skončí
> na `VersionError`. A dokud má jiná karta otevřenou starou verzi, upgrade se zablokuje —
> proto se na `onblocked` vyplatí ukázat hlášku „zavři ostatní karty aplikace".

:::check
V IndexedDB jsi snížil číslo verze z 3 na 2, protože ses vrátil ke starší větvi kódu. Co se stane při otevření databáze?

### --correct--
Otevření skončí chybou `VersionError` — verze jde jen nahoru.

#### --why--
Databáze si pamatuje nejvyšší verzi, kterou kdy měla. Návrat zpět by znamenal, že by
prohlížeč musel umět vrátit i změny schématu, a to nedovede. Při ladění pomůže databázi
smazat v DevTools na kartě **Application**.

### --answer--
Databáze se tiše přepne na verzi 2 a spustí se `upgradeneeded`.

#### --why--
`upgradeneeded` se spouští jen při zvýšení verze nebo při prvním otevření.

### --answer--
Otevření projde, ale objektová úložiště z verze 3 zmizí.

#### --why--
Nic se nemaže. Otevření vůbec neproběhne.
:::

## Kde to najdeš v MDN

- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) —
  `localStorage`, `sessionStorage`, kvóty a událost `storage`.
- [Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) —
  kompletní průvodce od otevření databáze po kurzory.
- [StorageManager.estimate()](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate) —
  kolik místa web zabírá a kolik má k dispozici.
- [Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) —
  kdy a co prohlížeč smaže.

# --questions--

## --question--

Aplikace má do prohlížeče ukládat 300 MB offline dat včetně obrázků a umět je filtrovat podle štítku. Které úložiště zvolíš a proč?

### --correct--
IndexedDB — zvládne velký objem, ukládá i binární data a umí nad nimi indexy.

#### --why--
Velikost, binární data i hledání jsou přesně tři věci, ve kterých `localStorage` selhává.

### --answer--
`localStorage` s daty v JSONu.

#### --why--
Strop je kolem 5 MB a obrázky by se musely převádět na text, čímž ještě narostou.

### --answer--
Cache Storage, protože zvládne stejný objem.

#### --why--
Objem ano, ale Cache Storage ukládá dvojice požadavek → odpověď. Filtrovat podle štítku
v něm nejde.

### --see--

prohlizec-navic/indexeddb#ctyri-uloziste-a-kdy-ktere

## --question--

Co vypíše tenhle kód?

```js
localStorage.setItem('kosik', JSON.stringify({ kusy: 2 }));
const kosik = JSON.parse(localStorage.getItem('kosik'));
console.log(kosik.kusy + 1);
```

### --expected--
3

### --why--
Tady už je to číslo: `JSON.parse` typy uvnitř JSONu obnoví. Past je jen v tom, když se
na `JSON.parse` zapomene — pak by `'{"kusy":2}' + 1` dalo nesmysl.

### --see--

prohlizec-navic/indexeddb#json-kolem-toho

## --question--

**Opakování z dřívějška.** Proč se `try`/`catch` kolem `JSON.parse` nedá nahradit podmínkou `if (text !== null)`?

### --correct--
Protože text může existovat a přitom nebýt platný JSON — `JSON.parse` pak vyhodí výjimku.

#### --why--
Kontrola na `null` ošetří chybějící klíč, ne poškozený obsah. Data ve starším formátu
nebo ručně upravená v DevTools kontrolou projdou a rozbijí se až při parsování.

### --answer--
Protože `JSON.parse` vrací promise, kterou podmínka nezachytí.

#### --why--
`JSON.parse` je synchronní a vrací hodnotu rovnou. S promisy nemá nic společného.

### --answer--
Protože `localStorage.getItem` u chybějícího klíče vrací `undefined`, ne `null`.

#### --why--
Vrací `null`. Porovnání by fungovalo, jen neřeší ten druhý případ.

### --see--

prohlizec-navic/indexeddb#json-kolem-toho

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód, když klíč `motiv` nikdy nebyl uložený?

```js
console.log(localStorage.getItem('motiv') ?? 'svetly');
console.log(localStorage.getItem('motiv') === undefined);
```

### --expected--
```text
svetly
false
```

### --why--
`??` sáhne po záložní hodnotě jen u `null` a `undefined` — a `getItem` vrací přesně
`null`, takže se uplatní. Druhý řádek je past: `null === undefined` je `false`, proto se
na chybějící klíč testuje `=== null`, ne `=== undefined`.

### --see--

prohlizec-navic/indexeddb#localstorage-rychle-male-a-vsechno-je-text
