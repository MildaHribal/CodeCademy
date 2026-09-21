# Map, Set a WeakMap

:::check pretest
Co vypíše poslední řádek?

```js
const tags = new Set(['akce', 'novinka', 'akce']);
console.log(tags.size);
```

### --expected--

2

### --why--

`Set` si každou hodnotu pamatuje nejvýš jednou, druhé `'akce'` zahodí. Proč a k čemu je to dobré, uvidíš v části o `Set`.
:::

:::check pretest
Chat potřebuje seznam uživatelů, kteří jsou právě online. Často se ptá „je Eva online?", uživatele přidává a odebírá a nikdo tam nesmí být dvakrát. Co se hodí nejvíc?

### --answer--

Pole jmen a `includes`.

#### --why--

Pole jde použít, ale duplicity musíš hlídat sám a `includes` prochází celé pole. Lepší nástroj ukáže lekce.

### --answer--

Objekt `{ Eva: true, Jan: true }`.

#### --why--

Funguje to, ale objekt má zděděné klíče a počet položek nezná. Na co se víc hodí, uvidíš v první části.

### --correct--

`Set` se jmény.

#### --why--

`Set` hlídá jedinečnost sám a `has` odpoví rychle i u velké kolekce. Detaily v části o `Set`.
:::

Košík v e-shopu si pamatuje počet kusů podle id produktu. Chat drží uživatele online. Filtr zobrazuje produkty, které mají všechny zaškrtnuté štítky. Doporučení ukazuje filmy, které viděl kamarád a ty ne. Na tohle všechno se dá použít objekt nebo pole — a na tohle všechno existují lepší nástroje.

> [!REMEMBER]
> **`Map` je slovník, jehož klíčem může být cokoli. `Set` je kolekce, ve které je každá hodnota nejvýš jednou.**

## Proč nestačí objekt

Objekt jako slovník má tři slabiny. Klíče jsou vždycky texty (čísla se na text převedou). Objekt dědí klíče z prototypu, jak víš z [lekce o prototypech](see:js-tridy-kolekce/prototypy#vlastni-nebo-zdedena-vlastnost). A když chceš za klíč použít objekt:

:::live js predict
```js
const lastSeen = {};

lastSeen[{ id: 1, name: 'Eva' }] = '10:15';
lastSeen[{ id: 2, name: 'Jan' }] = '10:20';

console.log(Object.keys(lastSeen).length);
```
--question-- Co vypíše `console.log`?
--expected-- 1
--why-- Klíč objektu musí být text, takže JavaScript oba uživatele převede na text — a z každého objektu vyjde `'[object Object]'`. Druhé přiřazení přepsalo první a v objektu je jediný klíč. Zkus na konec přidat `console.log(Object.keys(lastSeen))`.
:::

:::check
Proč `prices[42]` a `prices['42']` čtou u obyčejného objektu stejnou hodnotu?

### --answer--

Protože `42` a `'42'` jsou si rovné přes `==`.

#### --why--

Porovnání `==` s tím nesouvisí. Jde o to, v jakém tvaru objekt klíče ukládá.

### --correct--

Klíče objektu jsou texty, číslo `42` se na klíč `'42'` převede.

#### --why--

Objekt nezná číselné klíče. Proto nerozliší ani `42` od `'42'`, ani dva různé objekty.

### --see--

js-tridy-kolekce/map-a-set#proc-nestaci-objekt
:::

## `Map`: slovník s libovolnými klíči

[[Map]] ukládá dvojice klíč → hodnota. Klíčem může být číslo, text, objekt i funkce, a každý se porovnává takový, jaký je.

:::live js
```js
const cart = new Map();

cart.set(101, 2);
cart.set(205, 1).set(318, 4);

console.log(cart.get(101), cart.has(205), cart.size);

cart.delete(205);

for (const [productId, quantity] of cart) {
  console.log(`produkt ${productId}: ${quantity} ks`);
}
console.log(cart);
```
:::

- `set(klíč, hodnota)` přidá nebo přepíše a vrátí mapu, takže jde řetězit.
- `get` vrátí hodnotu, nebo `undefined`; `has` odpoví ano/ne; `delete` odebere; `size` je počet dvojic.
- `for…of` prochází dvojice `[klíč, hodnota]` **v pořadí vložení**. Jen klíče dá `map.keys()`, jen hodnoty `map.values()`.

Zkus přidat `cart.set(101, cart.get(101) + 1)` a sleduj, že se dvojice nezdvojí, jen přepíše.

Klíče se porovnávají přísně, podobně jako `===`:

:::live js predict
```js
const cart = new Map([[101, 2]]);

console.log(cart.get('101'), cart.get(101));
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- undefined 2
--why-- `Map` klíče nepřevádí na text: číslo `101` a text `'101'` jsou dva různé klíče. Pozor na hodnoty z formuláře nebo z URL, které jsou vždycky texty — převeď je přes `Number(…)`, než se zeptáš mapy.
:::

Mapu z objektu vyrobí `new Map(Object.entries(objekt))` a zpátky `Object.fromEntries(mapa)`. Počítání výskytů vypadá s mapou takhle:

```js
const visits = new Map();
for (const page of ['/kosik', '/', '/kosik']) {
  visits.set(page, (visits.get(page) ?? 0) + 1);
}
```

> [!NOTE]
> Seskupení do mapy umí i hotová funkce `Map.groupBy(pole, callback)`, obdoba `Object.groupBy`. Nejnovější prohlížeče (od roku 2026) mají navíc `map.getOrInsert(klíč, výchozí)`, která vrátí hodnotu a chybějící klíč nejdřív založí. Ve starším prohlížeči ji zatím nemusíš mít.

:::check
Napiš výraz, který zvýší počet kusů produktu `productId` v mapě `cart` o jedna. Produkt, který v mapě ještě není, začne na jedničce.

### --expected--

cart.set(productId, (cart.get(productId) ?? 0) + 1)

### --accept--

cart.set(productId, (cart.get(productId) || 0) + 1)
cart.set(productId, cart.has(productId) ? cart.get(productId) + 1 : 1)

### --why--

`get` vrátí `undefined` pro chybějící klíč, `?? 0` z něj udělá nulu a `set` uloží nový počet. Zápis `cart[productId]++` by s mapou nefungoval, uvidíš v pastech.

### --see--

js-tridy-kolekce/map-a-set#map-slovnik-s-libovolnymi-klici
:::

## Kdy `Map` a kdy objekt

| použij | když |
|---|---|
| **objekt** | záznam se známými klíči: uživatel `{ name, email }`, nastavení, data pro JSON a API |
| **`Map`** | slovník s klíči, které přicházejí za běhu: počty podle slova, košík podle id, cache podle objektu |
| **`Map`** | klíče nejsou texty, často přidáváš a mažeš, potřebuješ `size` nebo pořadí vložení |

Objekt je pořád správná volba pro data s pevným tvarem. `Map` nahrazuje objekt tam, kde objekt dělal **slovník**.

:::check
Kde se víc hodí `Map` než objekt?

### --correct--

Počet hlasů v anketě podle id odpovědi, odpovědi přibývají za běhu.

#### --why--

Klíče vznikají za běhu a jsou to čísla. `Map` je nepřevádí na text a má `size`.

### --answer--

Profil uživatele s klíči `name`, `email` a `city`, který se posílá na server.

#### --why--

Tady jsou klíče známé předem a data jdou do JSON. Na záznam s pevným tvarem je objekt přirozený.

### --answer--

Konfigurace aplikace načtená ze souboru `config.json`.

#### --why--

JSON se převádí na objekty a konfigurace má klíče dané předem. Objekt tu nic neztrácí.

### --see--

js-tridy-kolekce/map-a-set#kdy-map-a-kdy-objekt
:::

## `Set`: každá hodnota jednou

[[Set]] je kolekce hodnot bez duplicit. `add` přidá (a když už tam hodnota je, nic nezmění), `has` odpoví ano/ne, `delete` odebere, `size` je počet.

:::live js
```js
const online = new Set();

online.add('Eva').add('Jan').add('Eva');
console.log(online.size, online.has('Jan'));

online.delete('Jan');
console.log(online);

const tags = ['akce', 'novinka', 'akce', 'sleva'];
console.log([...new Set(tags)]);
```
:::

Poslední řádek je nejkratší cesta, jak z pole odstranit duplicity: `new Set(pole)` je vyřadí a spread z množiny zase udělá pole. Zkus do `tags` přidat `'Akce'` s velkým písmenem — pro `Set` je to jiná hodnota.

`has` je u `Set` rychlé i pro statisíce hodnot, kdežto `includes` u pole musí projít položku po položce. Když se v cyklu ptáš „je tohle v seznamu?", `Set` pomůže.

Hodnoty se porovnávají stejně jako klíče `Map`. Co to znamená pro objekty?

:::live js predict
```js
const selected = new Set();

selected.add({ id: 7, name: 'Káva' });
selected.add({ id: 7, name: 'Káva' });

console.log(selected.size);
```
--question-- Co vypíše `console.log`?
--expected-- 2
--why-- Dva zápisy `{ id: 7, … }` vytvoří dva různé objekty a `Set` porovnává odkazy, ne obsah. Když chceš jedinečnost podle id, ukládej do `Set` přímo id (`selected.add(7)`), nebo použij `Map` s id jako klíčem.
:::

:::check
Co vypíše poslední řádek?

```js
const cities = ['Brno', 'Praha', 'Brno', 'Ostrava', 'Praha'];
const unique = new Set(cities);
unique.add('Brno');
console.log(unique.size);
```

### --expected--

3

### --why--

Z pěti měst zůstanou tři různá. Další `add('Brno')` nic nepřidá, protože `Brno` v množině už je.

### --see--

js-tridy-kolekce/map-a-set#set-kazda-hodnota-jednou
:::

## Množinové operace

Od roku 2024 umí `Set` [[množinové operace]] přímo. Každá vrací **novou** množinu nebo `true`/`false`, původní množiny nemění.

| metoda | vrátí |
|---|---|
| `a.union(b)` | hodnoty z `a` nebo `b` (sjednocení) |
| `a.intersection(b)` | hodnoty, které jsou v obou (průnik) |
| `a.difference(b)` | hodnoty z `a`, které nejsou v `b` (rozdíl) |
| `a.symmetricDifference(b)` | hodnoty jen v jedné z nich |
| `a.isSubsetOf(b)` | `true`, když je každá hodnota `a` i v `b` |
| `a.isSupersetOf(b)` | `true`, když `a` obsahuje všechny hodnoty `b` |
| `a.isDisjointFrom(b)` | `true`, když nemají nic společného |

:::live js
```js
const required = new Set(['JavaScript', 'CSS', 'Git']);
const eva = new Set(['JavaScript', 'React', 'CSS']);

console.log('Chybí:', required.difference(eva));
console.log('Splňuje:', required.intersection(eva));
console.log('Umí všechno?', required.isSubsetOf(eva));
```
:::

Inzerát požaduje tři dovednosti a Eva jich dvě splňuje. Zkus Evě přidat `'Git'` a sleduj, jak se změní poslední řádek. Pak zkus `eva.difference(required)` — co umí navíc.

> [!PITFALL]
> **Množinové metody chtějí jako argument množinu, ne pole.** `required.union(['TypeScript'])` v Chromu skončí `TypeError: The .size property is NaN`. Oprava: `required.union(new Set(['TypeScript']))`.

:::check
Máš množiny `watchedByEva` a `watchedByJan` s názvy filmů. Napiš výraz, který vrátí množinu filmů, které viděl Jan, ale Eva ne.

### --expected--

watchedByJan.difference(watchedByEva)

### --accept--

new Set([...watchedByJan].filter((film) => !watchedByEva.has(film)))

### --why--

`a.difference(b)` nechá z `a` jen to, co v `b` není. Na pořadí záleží: `watchedByEva.difference(watchedByJan)` by vrátilo Eviny filmy, které neviděl Jan.

### --see--

js-tridy-kolekce/map-a-set#mnozinove-operace
:::

## `WeakMap`: data k objektu, dokud objekt žije

[[WeakMap]] je mapa, jejíž klíče musí být objekty a která je **nedrží naživu**. Když na objekt klíče už nic jiného v programu neodkazuje, prohlížeč ho uklidí z paměti i s hodnotou v mapě.

```js
const tooltipTexts = new WeakMap();

const button = document.querySelector('#save');
tooltipTexts.set(button, 'Uloží rozpracovaný článek');
```

Když tlačítko zmizí ze stránky a nikdo na něj neodkazuje, zmizí i jeho text v mapě. Obyčejná `Map` by tlačítko držela v paměti navždy. Proto `WeakMap` nemá `size` ani `for…of`: její obsah se může kdykoli sám zmenšit. Umí jen `set`, `get`, `has` a `delete`.

Použiješ ji na data „přilepená" k cizím objektům: cache výsledků podle objektu, metadata k prvkům stránky, soukromá data knihovny. Obdobou pro množinu je `WeakSet`.

:::check
Co udělá `new WeakMap().set('eva', 3)`?

### --answer--

Uloží dvojici jako obyčejná `Map`.

#### --why--

Text nemůže být klíčem `WeakMap`, protože u primitivní hodnoty nejde říct, kdy „zanikla".

### --correct--

Vyhodí `TypeError: Invalid value used as weak map key`.

#### --why--

Klíčem `WeakMap` smí být jen objekt, aby šlo poznat, kdy na něj nic neodkazuje.

### --answer--

Uloží dvojici a hned ji smaže.

#### --why--

Nic se neuloží. `WeakMap` klíč, který není objekt, odmítne rovnou.

### --see--

js-tridy-kolekce/map-a-set#weakmap-data-k-objektu-dokud-objekt-zije
:::

:::explain
Vysvětli vlastními slovy, proč se dva objekty se stejným obsahem chovají v `Set` jako
dvě různé hodnoty.

## --model--
`Set` i `Map` porovnávají hodnoty podle **totožnosti**, ne podle obsahu. U čísel a
řetězců je totožnost a obsah totéž, takže se dvakrát vložená pětka započítá jednou.
U objektu je ale hodnotou odkaz na konkrétní objekt v paměti — a dva objekty se
stejnými vlastnostmi jsou dva různé objekty na dvou různých místech. Proto
`new Set([{ id: 1 }, { id: 1 }])` má dva prvky. Když chci deduplikovat podle obsahu,
musím si zvolit klíč (třeba `id`) a udělat množinu z něj, ne z celých objektů.

## --checklist--
- Porovnává se totožnost hodnoty, ne její obsah.
- U primitivních hodnot totožnost a obsah splývají.
- Dva objekty se stejnými vlastnostmi jsou různé hodnoty.
- Deduplikace podle obsahu potřebuje vlastní klíč.
:::

## Typické chyby a pasti

### Hranaté závorky místo `set`

:::live js predict
```js
const scores = new Map();

scores['Eva'] = 42;

console.log(scores.size, scores.get('Eva'));
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- 0 undefined
--why-- `Map` je objekt, takže `scores['Eva'] = 42` projde — jen vytvoří obyčejnou vlastnost objektu mapy. Do slovníku se nic neuložilo, `size` je `0` a `get` nic nenajde.
:::

> [!PITFALL]
> **`map[klíč] = hodnota` a `map[klíč]` s mapou jen předstírají, že fungují.** Příznak: `size` je `0` a `get` vrací `undefined`, přestože „jsi tam něco uložil". Oprava: vždycky `map.set(klíč, hodnota)` a `map.get(klíč)`.

### `JSON.stringify` mapy

> [!PITFALL]
> **`JSON.stringify(new Map([['Eva', 42]]))` vrátí `'{}'`.** JSON mapy nezná a data tiše ztratí — v `localStorage` nebo v těle požadavku pak nic není. Oprava: `JSON.stringify(Object.fromEntries(map))`, u `Set` `JSON.stringify([...set])`.

### Pořadí argumentů v `forEach`

> [!PITFALL]
> **`map.forEach((value, key) => …)` dostává nejdřív hodnotu, pak klíč** — obráceně než dvojice ve `for…of`. Příznak: vypisuješ „klíč" a vidíš čísla. Oprava: pojmenuj parametry `(value, key)`, nebo použij `for (const [key, value] of map)`.

:::check
Kolega ukládá košík přes `localStorage.setItem('cart', JSON.stringify(cart))`, kde `cart` je `Map`. Po obnovení stránky je košík prázdný. Napiš výraz, který má místo `JSON.stringify(cart)` uložit.

### --expected--

JSON.stringify(Object.fromEntries(cart))

### --accept--

JSON.stringify([...cart])
JSON.stringify(Array.from(cart))
JSON.stringify([...cart.entries()])

### --why--

`JSON.stringify` z mapy udělá `'{}'`. Objekt z `Object.fromEntries` nebo pole dvojic se uloží celé a zpátky na mapu ho převede `new Map(Object.entries(…))`, resp. `new Map(pole)`.

### --see--

js-tridy-kolekce/map-a-set#json-stringify-mapy
:::

Dál: ve workshopu [Filmový klub](see:js-tridy-kolekce/workshop-filmovy-klub) z `Map`, `Set` a množinových operací postavíš doporučovač filmů podle podobnosti vkusu.

## Kde to najdeš v MDN

- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) — metody a v části *Objects vs. maps* tabulka, kdy použít který.
- [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) — část *Set composition* s obrázky sjednocení, průniku a rozdílu.
- [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) — proč nejde procházet a příklady s daty k objektům.
- [Map.groupBy()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy) — seskupení do mapy; porovnej s `Object.groupBy`.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const likes = new Map();
const post = { id: 1, title: 'Výlet na Pálavu' };

likes.set(post, 10);
likes.set({ id: 1, title: 'Výlet na Pálavu' }, 99);

console.log(likes.get(post), likes.size);
```

### --expected--

10 2

### --why--

Klíče objekty se porovnávají odkazem. Druhý objekt vypadá stejně, ale je to jiný objekt, takže vznikla druhá dvojice a hodnota pod `post` zůstala `10`.

### --see--

js-tridy-kolekce/map-a-set#map-slovnik-s-libovolnymi-klici

## --question--

Napiš výraz, který z pole `emails` vrátí **pole** e-mailů bez duplicit.

### --expected--

[...new Set(emails)]

### --accept--

Array.from(new Set(emails))

### --why--

`new Set(emails)` duplicity vyřadí a spread (nebo `Array.from`) z množiny udělá zase pole. Pořadí zůstane podle prvního výskytu.

### --see--

js-tridy-kolekce/map-a-set#set-kazda-hodnota-jednou

## --question--

E-shop má množinu `inCart` s id produktů v košíku a množinu `onSale` s id zlevněných produktů. Který výraz odpoví, jestli je v košíku aspoň jeden zlevněný produkt?

### --answer--

`inCart.isSubsetOf(onSale)`

#### --why--

Tohle platí, jen když jsou zlevněné **všechny** produkty v košíku.

### --correct--

`!inCart.isDisjointFrom(onSale)`

#### --why--

`isDisjointFrom` je `true`, když množiny nemají nic společného. Negace tedy znamená „aspoň jeden společný".

### --answer--

`inCart.union(onSale).size > 0`

#### --why--

Sjednocení obsahuje všechno z obou množin, takže je neprázdné, i když se nepřekrývají vůbec.

### --see--

js-tridy-kolekce/map-a-set#mnozinove-operace

## --question--

Proč `WeakMap` nemá vlastnost `size` ani nejde procházet cyklem `for…of`?

### --answer--

Aby byla rychlejší než `Map`.

#### --why--

O rychlost nejde. Rozhoduje, co se s dvojicí stane, když na klíč nic neodkazuje.

### --correct--

Dvojice může kdykoli zmizet, jakmile prohlížeč uklidí objekt klíče, takže počet ani obsah nejsou stálé.

#### --why--

`WeakMap` klíče nedrží naživu. Kdyby šla procházet, výsledek by závisel na tom, kdy zrovna proběhl úklid paměti.

### --answer--

Protože klíče nejsou seřazené.

#### --why--

I obyčejná `Map` jde procházet, a pořadí má dané vložením. Důvod je v tom, že dvojice ve `WeakMap` můžou mizet samy.

### --see--

js-tridy-kolekce/map-a-set#weakmap-data-k-objektu-dokud-objekt-zije
