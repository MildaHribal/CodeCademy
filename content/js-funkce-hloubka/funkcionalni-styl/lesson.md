# Funkcionální styl

:::check pretest
Funkce `countdown` volá sama sebe. Co vypíše poslední řádek? Tipni si.

```js
function countdown(seconds) {
  if (seconds === 0) {
    return 'Start';
  }
  return countdown(seconds - 1);
}

console.log(countdown(3));
```

### --expected--

Start

### --why--

Každé volání zavolá `countdown` s číslem o jedna menším: 3, 2, 1, 0. U nuly podmínka vrátí `'Start'` a ten se předá zpátky přes všechna čekající volání. Funkci, která volá sama sebe, se říká rekurze — vysvětlí ji druhá polovina lekce.
:::

:::check pretest
Funkce volá sama sebe a nemá žádnou podmínku, kdy přestat. Co se stane?

### --answer--

Program zamrzne a poběží navždy.

#### --why--

Nekonečný cyklus by opravdu běžel dál. Volání funkce se ale od kola cyklu v jedné věci liší — jaké, uvidíš v části o limitu zásobníku.

### --correct--

Za zlomek sekundy spadne s chybou.

#### --why--

Každé rozpracované volání čeká v zásobníku volání a ten má omezenou velikost. Přesnou hlášku uvidíš v části o limitu zásobníku.

### --answer--

Funkce vrátí `undefined`.

#### --why--

Aby funkce něco vrátila, musela by některé volání doběhnout. Bez podmínky se žádné nedostane k `return`.
:::

Funkcionální styl potkáš dřív, než si myslíš. Komponenta v Reactu musí být čistá
funkce, stav se v Reactu mění jen vytvořením nového objektu, data z API se před
vykreslením prohánějí řadou malých úprav a menu e-shopu s podkategoriemi nebo
diskuse s odpověďmi na odpovědi se procházejí rekurzí.

Začni problémem. Bistro chce přehled zaplacených objednávek:

```js
function report(orders) {
  let sum = 0;
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].paid) {
      orders[i].total = orders[i].price * 1.12;
      sum += orders[i].total;
      console.log(`${orders[i].customer}: ${orders[i].total} Kč`);
    }
  }
  return sum;
}
```

Funguje, ale v jedné funkci je výběr, výpočet DPH, součet i výpis. Funkce navíc
**přepíše** objednávky, které dostala, a každý výpis něco vypíše do konzole. Když
budeš chtít DPH jinde, nevytáhneš ho. Když ji zavoláš dvakrát, DPH se připočte
dvakrát. A otestovat ji jde jen tak, že budeš číst konzoli.

> [!REMEMBER]
> **Funkcionální styl skládá program z malých čistých funkcí, které data nemění, ale vracejí nová.**
> Každá funkce udělá jednu věc a výsledek předá další.

## Čistá funkce a skryté vedlejší efekty

Z lekce [Funkce](see:js-funkce/funkce#cista-funkce) znáš [[čistá funkce|čistou funkci]]: pro stejné argumenty vrátí
vždy stejný výsledek a nic mimo sebe nemění. Nečistotu je ale snadné přehlédnout.
Nejčastěji se schová do **změny argumentu**:

:::live js predict
```js
function addVat(order) {
  order.total = Math.round(order.total * 1.12);
  return order;
}

const lunch = { customer: 'Jana', total: 250 };
addVat(lunch);
console.log(addVat(lunch).total);
```
--question-- Co vypíše `console.log`?
--expected-- 314
--why-- `addVat` nevrací novou objednávku, ale přepisuje tu, kterou dostala. První volání změní `lunch.total` na 280, druhé počítá DPH z 280 a vrátí 314. Stejné volání tak dvakrát vrátilo něco jiného. Zkus místo přepisu vrátit `{ ...order, total: Math.round(order.total * 1.12) }` a sleduj výsledek.
:::

Kromě změny argumentu dělá funkci nečistou i čtení nebo zápis proměnné mimo ni,
`Date.now()` a `Math.random()` (vrací pokaždé něco jiného), výpis do konzole, zápis
do stránky nebo požadavek na server. Tomu všemu se říká [[vedlejší efekt|vedlejší efekty]].

Proč o tom vůbec přemýšlet? Čistá funkce se dá bez obav:

- **otestovat** jedním řádkem (`addVat({ total: 250 })` má vrátit `total: 280`),
- **zavolat znovu** nebo kdykoli později, bez ohledu na to, co se stalo předtím,
- **zapamatovat** — [[memoizace]] z workshopu Továrny funguje jen u čistých funkcí,
- **skládat** s dalšími funkcemi, jak uvidíš v další části.

Program jako celek čistý být nemůže, někde se výsledek vypsat musí. Pravidlo pro
praxi: **výpočty v čistých funkcích, vedlejší efekty na okraji programu**, třeba
jen v posluchači tlačítka, který čistou funkci zavolá a výsledek zapíše do stránky.

> [!NOTE]
> V Reactu tohle pravidlo platí doslova: komponenta se v režimu `StrictMode` během
> vývoje schválně vykreslí dvakrát, aby se nečistota projevila hned. K Reactu se
> dostaneš v sekci React: základy.

:::check
Která funkce je čistá?

### --answer--

`const label = (order) => { order.label = order.customer.toUpperCase(); return order; };`

#### --why--

Vrací sice výsledek, ale předtím zapíše do objektu, který dostala. Volající tím přijde o původní objekt.

### --answer--

`` const stamp = (order) => ({ ...order, createdAt: Date.now() }); ``

#### --why--

Vrací nový objekt, jenže `Date.now()` dá při každém volání jiný čas. Stejný vstup, jiný výsledek.

### --correct--

`` const label = (order) => ({ ...order, label: order.customer.toUpperCase() }); ``

#### --why--

Výsledek závisí jen na argumentu a vstupní objekt zůstane beze změny, protože se vrací nový.

### --answer--

`` const label = (order) => console.log(order.customer.toUpperCase()); ``

#### --why--

Výpis do konzole je vedlejší efekt a funkce navíc vrací `undefined`.

### --see--

js-funkce-hloubka/funkcionalni-styl#cista-funkce-a-skryte-vedlejsi-efekty
:::

## Kompozice: výstup jedné funkce je vstupem další

Malé čisté funkce se skládají za sebe: co jedna vrátí, dostane další. Tomu se říká
[[kompozice funkcí]] (*function composition*). Zapsat to jde vnořenými voláními:

```js
const withVat = (price) => price * 1.12;
const roundUp = (price) => Math.ceil(price);
const formatPrice = (price) => `${price} Kč`;

formatPrice(roundUp(withVat(250)));
```

Vnořená volání se čtou **zevnitř ven**, tedy pozpátku, a s pátou funkcí se v závorkách
ztratíš. Proto se píše pomocná funkce `pipe`: dostane funkce v pořadí, v jakém mají
proběhnout, a vrátí novou funkci, která hodnotu pošle přes všechny.

:::live js
```js
const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);

const withVat = (price) => price * 1.12;
const roundUp = (price) => Math.ceil(price);
const formatPrice = (price) => `${price} Kč`;

const finalPrice = pipe(withVat, roundUp, formatPrice);

console.log(finalPrice(250));
console.log(finalPrice(99));
```
:::

`pipe` je [[továrna funkcí]] ze sekce o closures: vrácená funkce si v prostředí
pamatuje pole `fns`. Uvnitř je `reduce`, jehož [[akumulátor]] je průběžná hodnota:
začne vstupem a každá funkce z něj udělá další. Zkus do `pipe` přidat na začátek
funkci `(price) => price - 20` (sleva) a sleduj, jak se změní obě ceny.

Na pořadí záleží:

:::live js predict
```js
const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);

const double = (n) => n * 2;
const addTen = (n) => n + 10;

console.log(pipe(addTen, double)(5));
```
--question-- Co vypíše `console.log`?
--expected-- 30
--why-- `pipe` volá funkce zleva doprava: nejdřív `addTen(5)` dá 15, pak `double(15)` dá 30. S `pipe(double, addTen)` by vyšlo 20. Funkce `compose`, kterou uvidíš v některých knihovnách, dělá totéž zprava doleva — jako vnořená volání.
:::

> [!REMEMBER]
> **`pipe(a, b, c)(x)` je totéž co `c(b(a(x)))`.** Funkce v `pipe` dostávají jeden
> argument a jejich výstup musí sedět na vstup další.

:::check
Máš funkce `trim`, `toLowerCase` a `removeDiacritics`, každá bere a vrací řetězec. Napiš výraz, který z nich pomocí `pipe` vyrobí funkci, jež text nejdřív ořízne, pak převede na malá písmena a nakonec odstraní diakritiku.

### --expected--

pipe(trim, toLowerCase, removeDiacritics)

### --why--

`pipe` bere funkce v pořadí, v jakém mají proběhnout, a vrací novou funkci. Text jí předáš až potom: `pipe(trim, toLowerCase, removeDiacritics)('  Žluťoučký ')`.

### --see--

js-funkce-hloubka/funkcionalni-styl#kompozice-vystup-jedne-funkce-je-vstupem-dalsi
:::

## Deklarativní a imperativní zápis

Porovnej dvě funkce, které dělají totéž — vrátí jména zákazníků se zaplacenou
objednávkou nad 200 Kč:

```js
// imperativně: jak to udělat, krok za krokem
function bigSpendersLoop(orders) {
  const names = [];
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].paid && orders[i].total > 200) {
      names.push(orders[i].customer);
    }
  }
  return names;
}

// deklarativně: co chci dostat
function bigSpenders(orders) {
  return orders
    .filter((order) => order.paid && order.total > 200)
    .map((order) => order.customer);
}
```

[[imperativní zápis|Imperativní zápis]] popisuje postup: založ pole, projdi indexy,
zkontroluj, přidej. [[deklarativní zápis|Deklarativní zápis]] popisuje výsledek:
vyber zaplacené nad 200, z nich vezmi jména. Čte se jako věta, nemá počítadlo, na
kterém jde udělat chybu o jedna, a nic nemutuje. Metody `filter`, `map` a `reduce`
jsou nejběžnější deklarativní nástroje v JavaScriptu.

Deklarativní neznamená vždycky lepší. `for…of` je čitelnější nebo rychlejší, když:

- chceš **skončit dřív** (`break` po prvním nálezu; tady ale pomůže i `find` nebo `some`),
- potřebuješ v jednom průchodu **víc výsledků** najednou (součet, minimum i počet),
- uvnitř čekáš přes `await` (k tomu se dostaneš v sekci o asynchronním JavaScriptu),
- zpracováváš statisíce položek a řetěz by pole procházel pětkrát.

:::live js
```js
const orders = [
  { customer: 'Jana', paid: true, total: 280 },
  { customer: 'Petr', paid: false, total: 450 },
  { customer: 'Eva', paid: true, total: 150 },
  { customer: 'Marek', paid: true, total: 320 },
];

const bigSpenders = (list) =>
  list.filter((order) => order.paid && order.total > 200).map((order) => order.customer);

console.log(bigSpenders(orders));
```
:::

Zkus do řetězu přidat `.toSorted((a, b) => a.localeCompare(b, 'cs'))`, aby jména
byla podle abecedy. Pak zkus totéž dopsat do imperativní verze a porovnej, co se
upravovalo snáz.

:::check
Kdy dává smysl napsat cyklus `for…of` místo řetězu `filter` a `map`?

### --answer--

Vždycky, když funkce vrací pole.

#### --why--

Vrácení pole je přesně situace, pro kterou jsou `filter` a `map` stavěné. Cyklus se vyplatí jinde.

### --correct--

Když v jednom průchodu potřebuješ spočítat několik různých výsledků najednou.

#### --why--

Řetěz metod by pole procházel pro každý výsledek znovu. Cyklus s několika proměnnými to zvládne naráz a čte se dobře.

### --answer--

Když data nechceš měnit.

#### --why--

`filter` a `map` data nemění, vracejí nová pole. Neměnnost je spíš důvod metody použít.

### --see--

js-funkce-hloubka/funkcionalni-styl#deklarativni-a-imperativni-zapis
:::

## Rekurze: funkce, která volá sama sebe

Některá data jsou vnořená do sebe: kategorie mají podkategorie, komentáře odpovědi,
složky další složky. Nevíš předem, jak hluboko to jde, takže cyklus v cyklu nestačí.
Pomůže [[rekurze]] (*recursion*): funkce, která úlohu zmenší a zavolá na menší
úlohu **sama sebe**.

Každá rekurzivní funkce má dvě části:

- **[[základní případ]]** (*base case*) — úloha je tak malá, že odpověď známe hned a funkce už sama sebe nevolá,
- **rekurzivní případ** — funkce úlohu zmenší a zavolá se na menší část.

Nejdřív na obyčejném poli. Součet cen je „první cena + součet zbytku":

:::live js
```js
function total(prices) {
  if (prices.length === 0) {
    return 0;
  }
  const [first, ...rest] = prices;
  return first + total(rest);
}

console.log(total([120, 45, 89]));
```
:::

`total([120, 45, 89])` počítá `120 + total([45, 89])`, to počká na
`45 + total([89])`, to na `89 + total([])`. Prázdné pole je základní případ a vrátí
`0`. Pak se rozpracovaná volání dopočítají odzadu. Zkus přidat
`console.log('počítám', prices);` na začátek funkce a sleduj pořadí volání.

Na polích je rekurze jen ukázka, `reduce` to zvládne kratší cestou. Síla rekurze se
ukáže na stromu. Menu e-shopu:

:::live js
```js
const sport = {
  name: 'Sport',
  products: 2,
  subcategories: [
    { name: 'Běh', products: 5, subcategories: [] },
    {
      name: 'Kolo',
      products: 3,
      subcategories: [{ name: 'Helmy', products: 4, subcategories: [] }],
    },
  ],
};

function countProducts(category) {
  let count = category.products;
  for (const sub of category.subcategories) {
    count += countProducts(sub);
  }
  return count;
}

console.log(countProducts(sport));
```
:::

Základní případ je tu schovaný: kategorie **bez podkategorií** cyklus přeskočí
a vrátí jen vlastní počet. Zkus do kategorie Helmy přidat podkategorii
`{ name: 'Dětské', products: 6, subcategories: [] }` a sleduj, že funkce najde i ji,
aniž bys na ni cokoli měnil.

> [!REMEMBER]
> **Rekurzivní funkce vyřeší malý případ hned a velký převede na menší kopii sebe sama.**
> Bez základního případu se nikdy nezastaví.

:::check
Co je v `countProducts` základní případ?

### --answer--

Kategorie `Sport`, protože u ní se začíná.

#### --why--

Tam rekurze začíná, ale základní případ je ten, kde končí — funkce se už znovu nevolá.

### --correct--

Kategorie s prázdným polem `subcategories`: cyklus neproběhne a funkce vrátí jen `category.products`.

#### --why--

U takové kategorie funkce sama sebe nezavolá a odpověď vrátí hned. Právě tady se rekurze zastaví.

### --answer--

Řádek `count += countProducts(sub)`.

#### --why--

To je rekurzivní případ: funkce se volá na menší část stromu. Základní případ je místo, kde se nevolá.

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-funkce-ktera-vola-sama-sebe
:::

## Rekurze a zásobník volání

Každé rozpracované volání čeká na výsledek toho vnořeného. JavaScript si ho mezitím
drží v [[zásobník volání|zásobníku volání]] (*call stack*): nové volání se přidá
nahoru, a když doběhne, zmizí a pokračuje to pod ním. Takhle vypadá zásobník při
`countProducts` na menším stromu:

:::memory
```js
function countProducts(category) {
  let count = category.products;
  for (const sub of category.subcategories) {
    count += countProducts(sub);
  }
  return count;
}
const helmy = { name: 'Helmy', products: 4, subcategories: [] };
const kolo = { name: 'Kolo', products: 3, subcategories: [helmy] };
countProducts(kolo);
```
--step-- 2 | zásobník: countProducts(Kolo)
kolo -> @kolo
@kolo: { name: 'Kolo', products: 3, subcategories: [@helmy] }
@helmy: { name: 'Helmy', products: 4, subcategories: [] }
@f1: rámec countProducts(Kolo) { count: 3 }
--step-- 4 | Kolo čeká, nahoru přibylo volání pro Helmy
kolo -> @kolo
@kolo: { name: 'Kolo', products: 3, subcategories: [@helmy] }
@helmy: { name: 'Helmy', products: 4, subcategories: [] }
@f1: rámec countProducts(Kolo) { count: 3 } čeká na @f2
@f2: rámec countProducts(Helmy) { count: 4 } — bez podkategorií, cyklus přeskočí
--step-- 6 | Helmy vrátí 4 a zmizí, Kolo si přičte a vrátí 7
kolo -> @kolo
@kolo: { name: 'Kolo', products: 3, subcategories: [@helmy] }
@helmy: { name: 'Helmy', products: 4, subcategories: [] }
@f1: rámec countProducts(Kolo) { count: 7 } vrací 7
:::

Každé volání má **vlastní** proměnnou `count` — stejně jako každé zavolání továrny
má vlastní prostředí. Proto se počty z různých větví nepomíchají.

:::explain
Vysvětli vlastními slovy, jak `countProducts` projde strom kategorií a proč se nezacyklí.

## --model--

Funkce spočítá produkty aktuální kategorie a pak sama sebe zavolá na každou podkategorii a přičte výsledek. Každé volání má vlastní proměnnou `count` a čeká v zásobníku volání, dokud vnořená volání nevrátí výsledek. Kategorie bez podkategorií je základní případ: cyklus neproběhne, funkce se už nevolá a vrátí rovnou svůj počet. Protože každé volání dostane menší část stromu, dojde se k listům vždycky a rozpracovaná volání se pak dopočítají odzadu.

## --checklist--

- Funkce zpracuje aktuální uzel a zavolá se na každou podkategorii.
- Každé volání má vlastní lokální proměnné.
- Rozpracovaná volání čekají v zásobníku volání.
- Kategorie bez podkategorií je základní případ, kde se funkce už nevolá.
- Každé volání dostane menší část stromu, takže se k základnímu případu vždycky dojde.
:::

:::check
Kolik rozpracovaných volání `countProducts` je v zásobníku **nejvýš najednou**, když ji zavoláš na celé menu `sport` z předchozí části (Sport → Běh, Kolo → Helmy)? Napiš číslo.

### --expected--

3

### --why--

V zásobníku čekají jen volání na cestě od kořene k právě zpracovávané kategorii. Nejhlubší cesta je Sport → Kolo → Helmy, tedy tři rámce. Běh je v zásobníku jen chvíli, pod ním čeká Sport, a než se začne s Kolem, volání pro Běh už doběhlo.

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-a-zasobnik-volani
:::

## Limit zásobníku

Zásobník volání má omezenou velikost. V Chromu se do něj vejde zhruba deset tisíc
jednoduchých volání, podle velikosti rámců i méně. Když rekurze nemá základní případ,
nebo jsou data příliš hluboká, zásobník přeteče:

:::live js predict
```js
function total(prices) {
  const [first = 0, ...rest] = prices;
  return first + total(rest);
}

try {
  console.log(total([120, 45, 89]));
} catch (error) {
  console.log(error.name, error.message);
}
```
--question-- Co vypíše tenhle kód?
--expected-- RangeError Maximum call stack size exceeded
--why-- Funkce nemá základní případ. U prázdného pole výchozí hodnota `first = 0` zakryje, že už nic nezbylo, a `total([])` volá `total([])` pořád dokola. Zásobník přeteče a prohlížeč vyhodí `RangeError: Maximum call stack size exceeded`. Vrať na začátek funkce podmínku pro prázdné pole a výsledek bude 254.
:::

Co když data opravdu mají sto tisíc úrovní, třeba dlouhý řetěz záznamů? Pak rekurzi
nahraď cyklem, případně vlastním polem „co ještě zpracovat" místo zásobníku. Stromy
v běžných aplikacích (menu, komentáře, složky) mají pár desítek úrovní a rekurze je
pro ně nejčitelnější řešení.

> [!NOTE]
> Některé jazyky umí „koncovou rekurzi" optimalizovat, aby zásobník nerostl.
> JavaScript ji má ve specifikaci, ale Chrome ani Firefox ji neimplementují, takže
> se na ni v prohlížeči spolehnout nedá.

:::check
Uživatel otevřel diskusi, ve které má vlákno 50 000 odpovědí na odpovědi (skript
je vygeneroval). Rekurzivní funkce, která funguje na běžných vláknech, spadla
s `RangeError: Maximum call stack size exceeded`. Co je nejpravděpodobnější příčina?

### --answer--

Funkce nemá základní případ.

#### --why--

Na běžných vláknech se zastaví, takže základní případ má. Liší se jen hloubka dat.

### --correct--

Vlákno je tak hluboké, že se všechna rozpracovaná volání do zásobníku nevejdou.

#### --why--

Každá úroveň přidá do zásobníku jedno čekající volání. Padesát tisíc úrovní je víc, než zásobník pojme. Řešením je cyklus s vlastním polem, nebo omezit hloubku, kterou aplikace zobrazí.

### --answer--

Prohlížeči došla operační paměť počítače.

#### --why--

Hláška mluví o velikosti zásobníku volání, ne o paměti celého počítače. Zásobník je mnohem menší.

### --see--

js-funkce-hloubka/funkcionalni-styl#limit-zasobniku
:::

## Typické chyby a pasti

### Chybějící základní případ

> [!PITFALL]
> **Rekurze bez základního případu, nebo s případem, který nikdy nenastane, spadne
> s `RangeError: Maximum call stack size exceeded`.** Typicky chybí podmínka pro
> prázdné pole, nebo ji zakryje výchozí hodnota či `?.`, které tiše dosadí „něco".
> Oprava: napiš základní případ jako první řádek funkce a ověř, že každé volání
> dostane **menší** vstup.

### Zapomenutý `return` u rekurzivního volání

:::live js predict
```js
function findCategory(category, name) {
  if (category.name === name) {
    return category;
  }
  for (const sub of category.subcategories) {
    findCategory(sub, name);
  }
}

const menu = { name: 'Sport', subcategories: [{ name: 'Běh', subcategories: [] }] };
console.log(findCategory(menu, 'Běh'));
```
--question-- Co vypíše `console.log`?
--expected-- undefined
--why-- Vnořené volání `Běh` najde a vrátí, jenže vnější volání jeho výsledek zahodí a na konci nevrátí nic. Výsledek rekurzivního volání se musí použít: `const found = findCategory(sub, name); if (found) return found;`.
:::

> [!PITFALL]
> **Rekurzivní funkce vrací `undefined`, i když cíl existuje.** Příznak: funguje jen
> pro kořen stromu. Vnořené volání výsledek našlo, ale nikdo ho nevrátil dál.
> Oprava: výsledek vnořeného volání ulož a vrať, nebo ho přičti do výsledku.

### „Čistá" funkce, která mění vstup

> [!PITFALL]
> **Funkce vrací správný výsledek, ale data se změnila i jinde.** Příznak: po
> zavolání se přeházelo pořadí nebo přepsaly hodnoty v datech, která se zároveň
> vykreslují. Typicky `sort`, `push` nebo `order.total = …` nad parametrem. Oprava:
> `toSorted`, `[...items, item]`, `{ ...order, total }`.

### Funkce v `pipe`, která potřebuje dva argumenty

> [!PITFALL]
> **`pipe(withVat, formatPrice)` vypíše `280 undefined`**, když `formatPrice` čeká
> `(price, currency)`. `pipe` předává jen jednu hodnotu. Oprava: obal ji do funkce
> s jedním parametrem, `(price) => formatPrice(price, 'Kč')`, nebo použij částečnou
> aplikaci z workshopu Továrny.

:::check
Funkce má najít nejhlubší úroveň menu. Proč vrací `1` i pro menu se třemi úrovněmi?

```js
function depth(category) {
  let deepest = 0;
  for (const sub of category.subcategories) {
    depth(sub);
  }
  return deepest + 1;
}
```

### --answer--

Chybí základní případ pro kategorii bez podkategorií.

#### --why--

Ten tu je schovaný: prázdné `subcategories` cyklus přeskočí a vrátí `1`. Problém je v tom, co se děje s výsledky vnořených volání.

### --correct--

Výsledek `depth(sub)` se zahodí, takže `deepest` zůstane `0`.

#### --why--

Vnořená volání hloubku spočítají, ale nikdo jejich výsledek nepoužije. Oprava: `deepest = Math.max(deepest, depth(sub));`.

### --answer--

`let deepest = 0` se při každém volání vynuluje a přepíše hodnotu z vnějšího volání.

#### --why--

Každé volání má vlastní proměnnou `deepest`, vnořená volání tu vnější nepřepisují. To je v pořádku.

### --see--

js-funkce-hloubka/funkcionalni-styl#zapomenuty-return-u-rekurzivniho-volani
:::

## Kde to najdeš v MDN

- [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) — průvodce funkcemi, část *Recursion* ukazuje rekurzi a zásobník na příkladu s výpisem pořadí volání.
- [Recursion](https://developer.mozilla.org/en-US/docs/Glossary/Recursion) — heslo ve slovníku s pojmy *base case* a *recursive case*.
- [InternalError: too much recursion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion) — co znamená přetečení zásobníku a jak hlášku formulují jednotlivé prohlížeče.
- [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) — v části *Examples* najdeš i skládání funkcí (*Function sequential piping*).

Ve workshopu z ploché tabulky komentářů postavíš strom diskuse s odpověďmi,
spočítáš odpovědi a vykreslíš vlákna, která jde sbalit.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);

const minusDiscount = (price) => price - 50;
const half = (price) => price / 2;

console.log(pipe(half, minusDiscount)(300));
```

### --expected--

100

### --why--

`pipe` volá funkce zleva doprava: `half(300)` je 150 a `minusDiscount(150)` je 100. Při opačném pořadí by vyšlo 125.

### --see--

js-funkce-hloubka/funkcionalni-styl#kompozice-vystup-jedne-funkce-je-vstupem-dalsi

## --question--

Co vypíše poslední řádek?

```js
function countLeaves(category) {
  if (category.subcategories.length === 0) {
    return 1;
  }
  let leaves = 0;
  for (const sub of category.subcategories) {
    leaves += countLeaves(sub);
  }
  return leaves;
}

const garden = {
  subcategories: [
    { subcategories: [] },
    { subcategories: [{ subcategories: [] }, { subcategories: [] }] },
  ],
};
console.log(countLeaves(garden));
```

### --expected--

3

### --why--

Listy jsou kategorie bez podkategorií a každá vrátí `1`. První podkategorie je list, druhá má dva listy. Kořen ani druhá podkategorie se nepočítají, jen sčítají výsledky vnořených volání: 1 + 2 = 3.

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-funkce-ktera-vola-sama-sebe

## --question--

Funkce `sortByPrice(products)` vrací produkty seřazené od nejlevnějšího přes `return products.sort((a, b) => a.price - b.price);`. Proč není čistá?

### --answer--

Protože používá porovnávací funkci.

#### --why--

Porovnávací funkce je v pořádku, nic mimo sebe nemění. Nečistota je v metodě, která ji dostává.

### --correct--

Protože `sort` přerovná pole, které funkce dostala, a změní tak data volajícího.

#### --why--

Změna argumentu je vedlejší efekt. Čistá verze vrátí `products.toSorted((a, b) => a.price - b.price)`.

### --answer--

Protože pro stejné produkty vrací pokaždé jiné pořadí.

#### --why--

Řazení je pro stejný vstup pokaždé stejné. Problém je v tom, co se stane s polem, které funkce dostala.

### --see--

js-funkce-hloubka/funkcionalni-styl#cista-funkce-a-skryte-vedlejsi-efekty

## --question--

Doplň první řádek těla funkce — základní případ — tak, aby `sumDigits(4096)` vrátila `19` a funkce se u jednociferného čísla přestala volat. Napiš celý řádek s `if`.

```js
function sumDigits(n) {
  // sem základní případ
  return (n % 10) + sumDigits(Math.floor(n / 10));
}
```

### --expected--

if (n < 10) return n;

### --accept--

if (n < 10) { return n; }
if (n <= 9) return n;
if (n <= 9) { return n; }
if (n === 0) return 0;
if (n === 0) { return 0; }
if (n < 10) return n
if (n == 0) return 0;

### --why--

Jednociferné číslo je samo sobě součtem číslic, takže ho funkce vrátí hned. Každé rekurzivní volání dostane číslo bez poslední číslice, a tak se k základnímu případu vždycky dojde: 6 + 9 + 0 + 4 = 19. Funguje i `if (n === 0) return 0;` — pak se rekurze zastaví o jedno volání později.

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-funkce-ktera-vola-sama-sebe
