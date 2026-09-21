# Mapa, množina a mezipaměť

:::check pretest
Pole má 50 000 uživatelských jmen. Kolik z nich musí `names.includes('Nováková')` projít, když v poli **není**?

### --expected--

50000

### --accept--

50 000
všech 50 000
všechny

### --why--

`includes` nemá jak vědět, že hodnota chybí, dokud neprojde poslední položku. Právě proto se do cyklu nedává — první část lekce ukáže, co s tím.
:::

:::check pretest
Co vypíše `new Set(['a', 'b', 'a']).size`? Tipni si.

### --expected--

2

### --why--

Set si každou hodnotu pamatuje jen jednou, takže druhé `'a'` zahodí. Používá se právě kvůli tomu — a kvůli rychlosti hledání.
:::

Máš seznam 30 000 objednávek a seznam 2 000 zákazníků, kteří mají slevu. Úkol zní: označ objednávky se slevou. Napíšeš `orders.filter((o) => discounted.includes(o.customerId))`, pustíš to a prohlížeč ti nabídne, že stránku ukončí.

Šedesát milionů porovnání. Přitom stačí data uložit jinak a je z toho 32 000 kroků.

> [!REMEMBER]
> **Když se v cyklu něco hledá, nehledej v poli.** `Map` a `Set` najdou hodnotu podle klíče v konstantním čase, ať jsou velké jakkoli. Zaplatíš za to pamětí a jedním průchodem navíc.

## Hledání v poli je pomalé

Pole je očíslovaný seznam. `items[5]` je okamžité, protože se pozice dá spočítat. Ale `items.includes('Nováková')` pozici spočítat neumí, takže dělá [[lineární vyhledávání]] — porovnává položku po položce od začátku.

:::live js
```js
const customers = ['Nováková', 'Dvořák', 'Kučera', 'Svoboda'];
let comparisons = 0;

function contains(list, wanted) {
  for (const item of list) {
    comparisons++;
    if (item === wanted) return true;
  }
  return false;
}

console.log(contains(customers, 'Nováková'), comparisons);
comparisons = 0;
console.log(contains(customers, 'Horák'), comparisons);
```
:::

Zkus prohodit `'Nováková'` za `'Svoboda'` a sleduj, jak se počet porovnání změní. Nenalezená hodnota stojí vždycky celé pole — a to je ten případ, podle kterého se složitost počítá.

:::check
Proč je `items[5]` rychlé, ale `items.includes(5)` ne?

### --expected--

index se dá spočítat, hodnotu je potřeba hledat porovnáváním

### --accept--

u indexu se pozice spočítá, u hodnoty se musí projít pole
index je adresa, hodnota se hledá položku po položce

### --why--

Index říká pozici rovnou. Hodnota neříká nic o tom, kde leží, takže jediná možnost je projít pole.
:::

## `Map`: klíč a hodnota s rychlým hledáním

`Map` je slovník: dvojice klíč → hodnota. Pod kapotou je to [[hashovací tabulka]] — z klíče se spočítá adresa a hodnota se uloží rovnou tam. Proto `get`, `set` i `has` netrvají déle, když mapa vyroste.

:::live js
```js
const orders = [
  { id: 'A1', customerId: 7, total: 480 },
  { id: 'A2', customerId: 3, total: 1250 },
  { id: 'A3', customerId: 7, total: 90 },
];

// 1. Postav index: klíč je to, podle čeho budeš hledat.
const byId = new Map();
for (const order of orders) byId.set(order.id, order);

// 2. Hledej podle klíče, ne průchodem.
console.log(byId.get('A2').total);
console.log(byId.has('A9'));
console.log(byId.size);
```
:::

Zkus změnit klíč z `order.id` na `order.customerId` a sleduj, kolik položek v mapě zůstane. Stejný klíč se přepíše, takže ze tří objednávek budou dvě — u indexu podle zákazníka tohle chceš ošetřit (typicky polem hodnot).

Postavení mapy stojí jeden průchod, `O(N)`. Každé hledání potom `O(1)`. Vyplatí se, jakmile budeš hledat víc než jednou.

:::memory
```js
const order = { id: 'A1', total: 480 };
const byId = new Map();
byId.set(order.id, order);
order.total = 999;
```
--step-- 1
order -> @o1
@o1: { id: 'A1', total: 480 }
--step-- 2 | mapa je zatím prázdná
order -> @o1
byId -> @m
@o1: { id: 'A1', total: 480 }
@m: Map {}
--step-- 3 | v mapě není kopie, ale odkaz na týž objekt
order -> @o1
byId -> @m
@o1: { id: 'A1', total: 480 }
@m: Map { 'A1' -> @o1 }
--step-- 4 | změna přes původní proměnnou je vidět i přes mapu
order -> @o1
byId -> @m
@o1: { id: 'A1', total: 999 }
@m: Map { 'A1' -> @o1 }
:::

Mapa neukládá kopie. Drží **odkaz** na týž objekt, takže `byId.get('A1').total` je po změně taky `999`. U indexu nad daty to je přesně to, co chceš; u mezipaměti výsledků na to pozor.

:::check
Nad polem 10 000 faktur budeš dvacetkrát hledat fakturu podle čísla. Vyplatí se postavit `Map`?

### --answer--

Ne, postavení mapy stojí jeden průchod navíc.

#### --why--

Ten průchod se opravdu zaplatí, ale jen jednou. Spočítej, co stojí dvacet hledání bez mapy.

### --correct--

Ano. Mapa stojí jeden průchod, dvacet hledání v poli by stálo dvacet průchodů.

#### --why--

`10 000 + 20` kroků proti `20 × 10 000`. Mapa se vyplatí od druhého hledání.

### --answer--

Ano, protože `Map` zabere míň paměti než pole.

#### --why--

Mapa drží klíč i hodnotu, takže paměti spotřebuje víc, ne míň. Důvod je jinde.
:::

## `Set`: jen unikátní hodnoty

`Set` je mapa bez hodnot — pamatuje si, jestli hodnotu už viděl. Používá se na dvě věci: [[deduplikace]] a rychlé „je tohle v seznamu?".

:::live js
```js
const visits = ['u7', 'u3', 'u7', 'u9', 'u3', 'u7'];

// 1. Unikátní návštěvníci jedním průchodem.
const unique = new Set(visits);
console.log(unique.size);
console.log([...unique]);

// 2. Rychlá kontrola členství místo includes.
const vip = new Set(['u3', 'u9']);
console.log(visits.filter((id) => vip.has(id)).length);
```
:::

Zkus do `visits` přidat `'u1'` a sleduj, jak se změní `unique.size`, ale ne poslední číslo. Set zachovává pořadí prvního výskytu, takže `[...unique]` je použitelný výsledek, ne náhodné pořadí.

Set umí i [[množinové operace]] — `union`, `intersection`, `difference`. Průnik dvou seznamů id se tak napíše na jeden řádek místo vnořeného cyklu.

> [!PITFALL]
> **Set porovnává objekty podle identity, ne podle obsahu.** `new Set([{ id: 1 }, { id: 1 }]).size` je `2`, protože jsou to dva různé objekty. Příznak: deduplikace polí objektů „nefunguje". Oprava: deduplikuj podle klíče — `new Map(items.map((i) => [i.id, i])).values()`.

:::check
Máš pole objektů zákazníků a chceš z něj vyhodit duplicity podle `email`. Proč nestačí `new Set(customers)`?

### --expected--

Set porovnává objekty podle identity, ne podle obsahu

### --accept--

každý objekt je jiná hodnota, i když má stejný obsah
dva objekty se stejným e-mailem jsou pro Set dvě různé hodnoty

### --why--

Do Setu musí jít hodnota, kterou umí porovnat — tedy samotný e-mail. Objekty deduplikuj přes `Map` s klíčem.
:::

## Frekvenční mapa: nejčastější vzor z pohovorů

[[frekvenční mapa]] je mapa, kde klíč je hodnota z dat a hodnota je počet výskytů. Postaví se jedním průchodem a odpoví na překvapivě hodně otázek: co se opakuje, co je nejčastější, jsou dva řetězce přesmyčky, kolik je unikátních.

:::live js
```js
const pages = ['/kosik', '/produkt', '/kosik', '/kontakt', '/kosik', '/produkt'];

// 1. Spočítej výskyty.
const counts = new Map();
for (const page of pages) {
  counts.set(page, (counts.get(page) ?? 0) + 1);
}

// 2. Najdi maximum jedním průchodem mapou.
let topPage = null;
let topCount = 0;
for (const [page, count] of counts) {
  if (count > topCount) {
    topPage = page;
    topCount = count;
  }
}

console.log([...counts]);
console.log(topPage, topCount);
```
:::

Zkus přidat další `'/kontakt'` do pole a sleduj, jestli se vítěz změní. Klíčový je `?? 0` — bez něj by se k `undefined` přičítala jednička a vyšlo by `NaN`.

:::live js predict
```js
const counts = new Map();
for (const tag of ['sleva', 'novinka', 'sleva']) {
  counts.set(tag, counts.get(tag) + 1);
}
console.log([...counts.values()]);
```
--question-- Co vypíše `console.log`?
--expected-- [NaN, NaN]
--why-- U prvního výskytu vrátí `counts.get(tag)` hodnotu `undefined` a `undefined + 1` je `NaN`. Od té chvíle je `NaN + 1` zase `NaN`. Chybí počáteční hodnota `?? 0`.
:::

:::check
Jak jednou větou zjistíš z frekvenční mapy `counts`, jestli se nějaká hodnota v datech opakuje?

### --expected--

když je counts.size menší než délka pole, něco se opakuje

### --accept--

porovnám counts.size s délkou pole
counts.size < values.length znamená duplicitu

### --why--

Mapa má tolik klíčů, kolik je unikátních hodnot. Když je jich míň než položek, některá se musela opakovat.
:::

## Mezipaměť a memoizace

Poslední způsob, jak ušetřit kroky, je **nepočítat podruhé to, co už jsi spočítal**. Výsledky si ulož do mapy podle vstupu — to je [[mezipaměť]], a když jí obalíš funkci, [[memoizace]].

:::live js
```js
let calls = 0;

function slowPrice(id) {
  calls++;
  return id * 37;
}

// 1. Mezipaměť drží výsledky podle vstupu.
const cache = new Map();

// 2. Spočítej jen to, co v ní ještě není.
function cachedPrice(id) {
  if (cache.has(id)) return cache.get(id);
  const value = slowPrice(id);
  cache.set(id, value);
  return value;
}

console.log(cachedPrice(4), cachedPrice(4), cachedPrice(9));
console.log('skutečných výpočtů:', calls);
```
:::

Zkus zavolat `cachedPrice(4)` ještě pětkrát a sleduj, že `calls` zůstane na dvou. Všimni si `cache.has(id)` místo `if (cache.get(id))` — kdyby výsledek byl `0`, druhá varianta by ho počítala pořád dokola.

> [!PITFALL]
> **Mezipaměť bez omezení je únik paměti.** Mapa klíčů roste, dokud aplikace běží, a nic z ní nezmizí. Příznak: karta prohlížeče po hodině používání žere stovky megabajtů. Oprava: omez velikost (vyhoď nejstarší klíč), nebo u klíčů-objektů použij `WeakMap`, ze které se záznam uklidí spolu s objektem.

:::explain
Kdy se memoizace vyplatí a kdy funkci naopak zpomalí nebo rozbije?

## --model--

Vyplatí se u funkce, která je drahá a volá se opakovaně se stejnými vstupy — výsledek se spočítá jednou a pak se jen čte z mapy. Nevyplatí se u funkce, která je levná, protože hledání v mapě stojí zhruba stejně jako samotný výpočet. A rozbije funkci, která není čistá: když její výsledek závisí na čase, náhodě nebo na datech, která se mění, mezipaměť bude vracet zastaralou odpověď.

## --checklist--

- Vyplatí se u drahé funkce volané opakovaně se stejnými vstupy.
- U levné funkce je režie mezipaměti srovnatelná s výpočtem.
- Funkce musí být čistá, jinak mezipaměť vrací zastaralé výsledky.
:::

:::check
Proč se v mezipaměti ptáš `cache.has(key)` a ne `if (cache.get(key))`?

### --expected--

protože uložená hodnota může být 0, null nebo prázdný řetězec

### --accept--

get by u nepravdivé uložené hodnoty vedl k novému výpočtu
uložená hodnota může být nepravdivá a podmínka by ji zahodila

### --why--

`has` se ptá na existenci klíče, `get` na hodnotu. Uložená nula je platný výsledek, ale v podmínce je nepravda.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Objekt jako mapa má zděděné klíče.** `counts['constructor']` u obyčejného objektu není `undefined`, ale funkce — a `counts['constructor'] + 1` vyrobí nesmysl. Příznak: počítání četností slov spadne na jednom konkrétním slově. Oprava: `new Map()`, nebo aspoň `Object.create(null)`.

> [!PITFALL]
> **Klíče objektu jsou vždycky řetězce.** `obj[1]` a `obj['1']` je totéž, takže se ti smíchají id čísla a texty. `Map` typ klíče zachová: `map.get(1)` a `map.get('1')` jsou dva různé záznamy. Příznak: záznam „zmizí", i když ho v datech vidíš.

> [!PITFALL]
> **Mapa postavená uvnitř cyklu nepomůže.** `for (const o of orders) { const set = new Set(vipIds); … }` staví množinu znovu u každé objednávky, takže je to pořád `O(N × M)`. Příznak: „převedl jsem to na Set a nezrychlilo to". Oprava: postav strukturu **před** cyklem.

:::check
Kolegův kód počítá četnosti do obyčejného objektu a u slova `constructor` vrací nesmysl. Co s tím?

### --expected--

použít Map místo objektu

### --accept--

nahradit objekt mapou
Object.create(null) nebo Map

### --why--

Obyčejný objekt dědí vlastnosti z prototypu, takže klíč `constructor` už „existuje". Mapa žádné zděděné klíče nemá.
:::

## Kde to najdeš v MDN

- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) — v sekci *Objects vs. Maps* je tabulka rozdílů včetně typů klíčů a chování při iteraci.
- [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) — úvodní odstavec říká, že `has` je v průměru rychlejší než `Array.prototype.includes`, a dole najdeš množinové operace.
- [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) — proč se hodí na mezipaměť s klíči-objekty a proč se nedá iterovat.

Příště si přidáme druhou polovinu výbavy: řazení porovnávací funkcí, binární vyhledávání a rekurzi.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const seen = new Set();
seen.add('a');
seen.add('a');
seen.add('A');
console.log(seen.size);
```

### --expected--

2

### --why--

Set porovnává striktně, takže druhé `'a'` zahodí, ale `'A'` je jiná hodnota. Velikost písmen se nesjednocuje sama — když ji chceš ignorovat, přidávej `value.toLowerCase()`.

### --see--

js-algoritmy/datove-struktury#set-jen-unikatni-hodnoty

## --question--

Funkce dostane pole 5 000 produktů a pole 300 id v akci a má vrátit produkty v akci. Jaká je složitost řešení, které si z id postaví `Set` a pak pole jednou profiltruje?

### --expected--

O(N)

### --accept--

O(n)
O(N + M)

### --why--

Postavení množiny je jeden průchod přes id, filtr jeden průchod přes produkty a `has` uvnitř je `O(1)`. Dohromady `O(N + M)`, což je lineární — proti `O(N × M)` u `includes`.

### --see--

js-algoritmy/datove-struktury#hledani-v-poli-je-pomale

## --question--

**Opakování z dřívějška.** Proč se `WeakMap` hodí na mezipaměť, jejíž klíče jsou objekty z DOM?

### --answer--

Protože se dá iterovat a snadno vypsat, co v ní je.

#### --why--

`WeakMap` jde iterovat právě naopak — nejde. Zamysli se, co se s jejími záznamy stane, když objekt zanikne.

### --correct--

Protože záznam zmizí spolu s objektem, takže odstraněný prvek nedrží data v paměti.

#### --why--

Klíč drží `WeakMap` slabě. Když na objekt nikdo jiný neukazuje, uklidí se i záznam v mapě, a mezipaměť tak neroste donekonečna.

### --answer--

Protože hledá rychleji než `Map`.

#### --why--

Rychlost hledání je srovnatelná, obě stojí na stejném principu. Rozdíl je v tom, jak dlouho záznamy žijí.

### --see--

js-tridy-kolekce/map-a-set#weakmap-data-k-objektu-dokud-objekt-zije

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
const counts = {};
counts['sleva'] = (counts['sleva'] || 0) + 1;
console.log(Object.keys(counts).length);
```

### --expected--

1

### --why--

Do prázdného objektu přibyl jeden klíč. `Object.keys` vrací jen vlastní klíče, takže zděděné vlastnosti z prototypu se do počtu nepromítnou — na rozdíl od čtení `counts['constructor']`.

### --see--

js-objekty/objekty#kdyz-vlastnost-chybi-in-a-object-hasown
