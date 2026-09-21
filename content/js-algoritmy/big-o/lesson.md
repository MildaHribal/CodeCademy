# Složitost: co se stane, když dat přibude

:::check pretest
Funkce projde pole o 1 000 položkách a u každé položky projde celé pole znovu. Kolik porovnání udělá dohromady?

### --expected--

1000000

### --accept--

1 000 000
10^6

### --why--

Tisíc krát tisíc je milion. Tohle číslo je důvod, proč se dva vnořené cykly nad tisícovkou řádků počítají v sekundách, ne v milisekundách.
:::

:::check pretest
Které z těchhle dvou řešení poběží na deseti tisících položkách rychleji? Tipni si.

### --answer--

To s třemi průchody za sebou (`filter`, `map`, `reduce`).

#### --why--

Tři průchody za sebou vypadají jako víc práce, ale zkus je porovnat s tím, co dělá vnořený cyklus u každé položky.

### --correct--

To se třemi průchody za sebou — jeden vnořený cyklus je horší než tři průchody vedle sebe.

#### --why--

Tři průchody znamenají `3 × N` kroků, vnořený cyklus `N × N`. Proč se to `3` v zápisu složitosti nakonec zahodí, vysvětlí první část.

### --answer--

To s jedním cyklem, ve kterém se uvnitř volá `includes`.

#### --why--

`includes` nevypadá jako cyklus, ale prochází pole položku po položce. Co se stane, když ho zavoláš u každé položky?
:::

Napsal jsi filtr nad tabulkou objednávek. Na dvaceti testovacích řádcích je to hotové dřív, než pustíš myš. V produkci přijde dvanáct tisíc objednávek, uživatel napíše do hledání písmeno a stránka na dvě vteřiny zamrzne. Kód je přitom pořád stejný — změnila se jen velikost dat.

Abys tohle poznal **dřív než uživatel**, nepotřebuješ měřit. Stačí spočítat, kolikrát víc práce kód udělá, když dat přibude.

> [!REMEMBER]
> **Složitost neříká, jak je kód rychlý. Říká, jak rychle zpomalí, když dat přibude.** Proto se v ní zahazují konstanty: `3N` i `N` rostou stejně, `N²` roste jinak.

## Počítáme kroky, ne sekundy

Sekundy závisí na počítači, prohlížeči i na tom, co zrovna běží na pozadí. Kroky ne. Za krok považuj jednu jednoduchou operaci: porovnání, přiřazení, přístup do pole podle indexu.

:::live js
```js
// Spočítáme kroky místo měření času: každý průchod přičte jedničku.
function countSteps(size) {
  let steps = 0;
  const items = Array.from({ length: size }, (_, i) => i);

  // 1. jeden průchod polem
  for (const item of items) steps++;

  // 2. průchod polem uvnitř průchodu polem
  for (const a of items) {
    for (const b of items) steps++;
  }

  return steps;
}

console.log(countSteps(10));
console.log(countSteps(20));
console.log(countSteps(100));
```
:::

Zkus změnit `countSteps(20)` na `countSteps(40)` a sleduj, jak výsledek povyroste. Z 10 na 20 se počet kroků skoro zečtyřnásobil, z 20 na 40 zase. To je podpis [[kvadratická složitost|kvadratické složitosti]].

Přesný vzorec je `N² + N`. Při `N = 100` je to `10 000 + 100` — ta stovka navíc se v tom úplně ztratí. Proto se v [[notace velkého O|zápisu velkého O]] nechá jen **[[dominantní člen]]** a konstanty se zahodí:

| přesný počet kroků | zápis | proč |
|---|---|---|
| `N` | `O(N)` | jeden průchod |
| `3N + 20` | `O(N)` | trojnásobek i dvacítka navíc růst nemění |
| `N² + N` | `O(N²)` | při velkém `N` je `N` proti `N²` zanedbatelné |
| `N/2` | `O(N)` | poloviční průchod pořád roste lineárně |

> [!TIP]
> Když si nejsi jistý, dosaď si `N = 1000` a `N = 2000` a porovnej, kolikrát se výsledek zvětšil. Dvakrát znamená `O(N)`, čtyřikrát `O(N²)`, skoro vůbec `O(log N)`.

:::check
Funkce projde pole třikrát za sebou a pak ještě jednou pozpátku. Jaká je její [[časová složitost]]?

### --expected--

O(N)

### --accept--

O(n)

### --why--

Čtyři průchody za sebou jsou `4N` kroků. Konstanta se zahodí, protože nemění tempo růstu — dvojnásobek dat znamená dvojnásobek práce.
:::

## Nejčastější třídy složitosti

V praxi potkáš pět tříd. Stačí je poznat od pohledu.

| zápis | jméno | typický kód | 1 000 položek |
|---|---|---|---|
| `O(1)` | konstantní | `items[5]`, `map.get(key)`, `push` | 1 krok |
| `O(log N)` | [[logaritmická složitost]] | [[binární vyhledávání]] v seřazeném poli | ~10 kroků |
| `O(N)` | [[lineární složitost]] | `map`, `filter`, `for…of`, `includes` | 1 000 kroků |
| `O(N log N)` | kvazilineární | `sort`, merge sort | ~10 000 kroků |
| `O(N²)` | kvadratická | dva vnořené cykly nad týmiž daty | 1 000 000 kroků |

Poslední sloupec je celý příběh. Mezi `O(N)` a `O(N²)` je na tisícovce položek tisícinásobek práce. Mezi `O(N)` a `O(log N)` je to stonásobek ve tvůj prospěch.

Složitost se standardně uvádí pro [[nejhorší případ]] — tedy pro vstup, na kterém kód udělá nejvíc práce. `includes` najde první položku na jeden krok, ale když hledaná hodnota v poli není, projde všech `N`. Proto je `O(N)`, ne `O(1)`.

:::live js predict
```js
const found = ['a', 'b', 'c', 'd'].indexOf('a');
const missing = ['a', 'b', 'c', 'd'].indexOf('z');
console.log(found);
console.log(missing);
```
--question-- Co vypíše konzole? Napiš obě čísla, každé na vlastní řádek.
--expected--
```text
0
-1
```
--why-- Nalezená položka skončí hned na prvním kroku, ale nenalezená projde celé pole a vrátí `-1`. Složitost se počítá podle toho druhého případu — podle nejhoršího.
:::

:::check
Pole má milion položek a je seřazené. Kolik kroků zhruba potřebuje binární vyhledávání?

### --expected--

20

### --accept--

asi 20
zhruba 20
kolem 20

### --why--

Každý krok zahodí polovinu. Milion se dá půlit zhruba dvacetkrát (`2²⁰` je přes milion), takže `O(log N)` je tady dvacet porovnání místo milionu.
:::

## Skryté N v metodách pole

Nejčastější kvadratická past nemá v kódu žádný vnořený cyklus. Má tam metodu pole uvnitř jiné metody pole.

:::live js
```js
const orders = Array.from({ length: 6 }, (_, i) => ({ id: i, customerId: i % 3 }));
const vipIds = [0, 2];
let comparisons = 0;

// Vypadá to jako jeden průchod. Není.
const vipOrders = orders.filter((order) => {
  return vipIds.some((id) => {
    comparisons++;
    return id === order.customerId;
  });
});

console.log(vipOrders.length);
console.log(comparisons);
```
:::

Zkus zvětšit `length` na 12 a sleduj, jak vyskočí `comparisons`. `filter` projde `N` objednávek a u každé projde `some` celé pole `vipIds` — to je `N × M` porovnání. Kdyby obě pole rostla spolu, je to `O(N²)`.

`includes`, `indexOf`, `find`, `some`, `every` a `filter` dělají všechny totéž: [[lineární vyhledávání]], položku po položce. Uvnitř cyklu je to vždycky varovný signál.

> [!PITFALL]
> **`includes` uvnitř `filter` je kvadratická složitost.** Příznak: na sta položkách to letí, na deseti tisících prohlížeč nahlásí „Stránka neodpovídá". Oprava: převeď vnitřní pole na `Set` nebo `Map` **před** cyklem — hledání v nich je `O(1)`, a z `O(N²)` je rázem `O(N)`.

:::check
`orders.filter((o) => vipIds.includes(o.customerId))` je pomalé. Co uděláš s `vipIds`, aby z toho byl jeden průchod?

### --expected--

převedu ho na Set

### --accept--

new Set(vipIds)
udělám z něj Set a použiju has

### --why--

`const vip = new Set(vipIds)` se postaví jedním průchodem a `vip.has(id)` je pak `O(1)`. Celkem `O(N + M)` místo `O(N × M)`.
:::

## Z kvadrátu na lineární průchod

Druhý způsob, jak z kvadrátu udělat průchod, je **nepočítat totéž pořád dokola**. Úloha: najdi nejvyšší součet tří po sobě jdoucích dnů v tržbách.

Naivní řešení sečte pro každý začátek tři hodnoty znovu. [[klouzavé okno|Klouzavé okno]] místo toho drží jeden součet a při posunu jen přičte to, co přibylo, a odečte to, co vypadlo.

:::live js
```js
const sales = [120, 340, 90, 500, 210, 60];
let sum = sales[0] + sales[1] + sales[2];
let best = sum;

// 1. Posuň okno o jeden den.
// 2. Přičti novou hodnotu, odečti tu, která vypadla.
// 3. Zapamatuj si nejlepší součet.
for (let i = 3; i < sales.length; i++) {
  sum = sum + sales[i] - sales[i - 3];
  if (sum > best) best = sum;
  console.log(i, sum);
}

console.log('nejlepší:', best);
```
:::

Zkus změnit `500` na `50` a sleduj, který součet vyhraje. Každá hodnota se přičte právě jednou a odečte nejvýš jednou, takže celý výpočet je `O(N)` bez ohledu na šířku okna.

:::explain
Proč je klouzavé okno rychlejší než počítání součtu pro každý začátek zvlášť, když obě řešení projdou stejná data?

## --model--

Naivní verze u každého začátku sečte celé okno znovu, takže stejné hodnoty sčítá tolikrát, jak je okno široké. Klouzavé okno si součet pamatuje mezi kroky a při posunu udělá jen jedno sčítání a jedno odčítání. Počet kroků tak nezávisí na šířce okna, jen na počtu položek.

## --checklist--

- Naivní verze počítá stejné součty opakovaně.
- Okno si mezivýsledek pamatuje a jen ho upravuje.
- Posun stojí konstantní čas, takže je celek lineární.
:::

:::check
Okno je široké 30 dnů a pole má 365 hodnot. Kolik sčítání a odčítání udělá klouzavé okno při každém posunu?

### --expected--

2

### --accept--

dvě
jedno sčítání a jedno odčítání

### --why--

Přičte hodnotu, která do okna vstoupila, a odečte tu, která z něj vypadla. Šířka okna do počtu kroků nevstupuje, proto je celý průchod `O(N)`.
:::

## Prostorová složitost

Kroky nejsou jediné, co se počítá. [[prostorová složitost]] říká, kolik **paměti navíc** si kód vyrobí kromě vstupu.

| řešení | čas | paměť navíc |
|---|---|---|
| dva vnořené cykly | `O(N²)` | `O(1)` — jen pár proměnných |
| pomocná `Map` přes celé pole | `O(N)` | `O(N)` — mapa je velká jako vstup |
| [[dva ukazatele]] na seřazeném poli | `O(N)` | `O(1)` |
| `items.map(…)` | `O(N)` | `O(N)` — nové pole stejné délky |

Tohle je nejčastější výměna, kterou u algoritmů děláš: **zaplatíš pamětí a ušetříš čas**. Mapa přes celé pole je `O(N)` paměti navíc, ale ušetří ti vnořený cyklus. Na frontendu to skoro vždycky stojí za to; u dat, která se do paměti nevejdou, ne.

:::check
Funkce si nad polem `N` objednávek postaví `Set` zákaznických id a pak pole projde jedním cyklem. Jaká je její prostorová složitost?

### --expected--

O(N)

### --accept--

O(n)

### --why--

Set může v nejhorším případě obsahovat tolik id, kolik je objednávek. Roste tedy spolu se vstupem, i když samotný průchod je jen jeden.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Konstanta se zahazuje, ale jen v zápisu.** `O(N)` se čtyřmi průchody je pořád čtyřikrát pomalejší než `O(N)` s jedním. Příznak: „složitost mám dobrou" a stránka se pořád seká. Oprava: když už máš `O(N)`, slučuj průchody až potom, co změříš v DevTools, že je to opravdu ono.

> [!PITFALL]
> **`shift` a `unshift` nejsou `O(1)`.** Odebrání z začátku pole posune všechny zbývající položky o jednu, takže je `O(N)`. `queue.shift()` ve `while` cyklu je tím pádem `O(N²)`. Příznak: fronta zpracuje deset tisíc úloh mnohem pomaleji než dvakrát pět tisíc. Oprava: čti index místo mazání (`let head = 0; head++`).

> [!PITFALL]
> **Spojování řetězců v cyklu.** `text += radek` vyrobí pokaždé nový řetězec, takže `O(N²)` znaků. Příznak: generování CSV z deseti tisíc řádků trvá vteřiny. Oprava: nasbírej do pole a na konci `parts.join('\n')`.

:::check
Fronta úloh se zpracovává jako `while (queue.length) { const task = queue.shift(); … }`. Proč to na deseti tisících úlohách vázne?

### --expected--

shift posune všechny zbývající položky, takže je O(N)

### --accept--

shift je O(N), celý cyklus tedy O(N na druhou)
protože shift musí přeindexovat zbytek pole

### --why--

Odebrání ze začátku pole posune všechny zbývající položky o jedno místo. Ve `while` cyklu je to `O(N²)`. Oprava je číst přes index (`let head = 0`) a nemazat.
:::

## Kde to najdeš v MDN

- [Big O notation](https://developer.mozilla.org/en-US/docs/Glossary/Big_O_notation) — slovníkové heslo s definicí a tabulkou nejčastějších tříd.
- [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) — v sekci *Description* stojí, že řazení je implementačně stabilní; složitost `O(N log N)` je vlastnost použitého algoritmu.
- [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) — hned v úvodu je věta, že `has` je v průměru rychlejší než `Array.prototype.includes`. To je celý důvod, proč se `Set` v algoritmech používá.

Příště si ukážeme struktury, kterými se ta kvadratická past nejčastěji řeší: `Map`, `Set` a mezipaměť.

# --questions--

## --question--

Jaká je časová složitost téhle funkce?

```js
function hasDuplicate(values) {
  for (const value of values) {
    if (values.filter((other) => other === value).length > 1) return true;
  }
  return false;
}
```

### --expected--

O(N²)

### --accept--

O(n^2)
O(N^2)
O(n²)

### --why--

`filter` uvnitř `for…of` projde celé pole u každé položky. Dva průchody nad týmiž daty vnořené do sebe znamenají `N × N` porovnání.

### --see--

js-algoritmy/big-o#skryte-n-v-metodach-pole

## --question--

Pole se zdvojnásobí z 5 000 na 10 000 položek a doba výpočtu vzroste ze 4 na 16 sekund. Jakou složitost má ten kód?

### --expected--

O(N²)

### --accept--

O(n^2)
O(N^2)
O(n²)

### --why--

Dvojnásobek dat a čtyřnásobek času je podpis kvadratické složitosti. U `O(N)` by čas vzrostl dvakrát, u `O(N log N)` o něco víc než dvakrát.

### --see--

js-algoritmy/big-o#pocitame-kroky-ne-sekundy

## --question--

Proč se říká, že `Map` vymění paměť za čas?

### --answer--

Protože zabere méně paměti než pole se stejnými daty.

#### --why--

Mapa nese klíč i hodnotu, takže úsporná rozhodně není. Zamysli se, co se za tu paměť kupuje.

### --correct--

Protože si navíc drží celou pomocnou strukturu, zato hledání v ní je `O(1)` místo `O(N)`.

#### --why--

Postavení mapy stojí jeden průchod a `O(N)` paměti navíc. Tím ale zmizí vnořený cyklus, takže se `O(N²)` změní na `O(N)`.

### --answer--

Protože se data z mapy načítají až ve chvíli, kdy je potřebuješ.

#### --why--

Odložené načítání `Map` nedělá, položky v ní leží celou dobu. Rozdíl je v rychlosti hledání, ne v tom, kdy se data objeví.

### --see--

js-algoritmy/big-o#prostorova-slozitost

## --question--

**Opakování z dřívějška.** V DevTools na kartě Performance vidíš jeden dlouhý žlutý blok skriptu při psaní do vyhledávacího pole. Co ti to říká o kódu, který na `input` reaguje?

### --answer--

Že se stránka čeká na odpověď ze sítě.

#### --why--

Čekání na síť by se ukázalo jako požadavek v síťovém pruhu, ne jako souvislá práce skriptu. Žlutá barva patří běžícímu JavaScriptu.

### --correct--

Že běží dlouho na hlavním vlákně a blokuje překreslení i reakci na další stisk.

#### --why--

Dlouhý souvislý blok skriptu drží hlavní vlákno. U vyhledávání nad velkým polem to bývá právě skrytá kvadratická složitost.

### --answer--

Že má funkce moc parametrů a JavaScript je musí kopírovat.

#### --why--

Počet parametrů je proti průchodům polem zanedbatelný. Délka bloku odpovídá množství práce, ne počtu argumentů.

### --see--

nastroje-devtools-vykon/core-web-vitals#panel-performance-zaznam-a-cteni

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
const values = [5, 40, 300];
console.log(values.sort());
```

### --expected--

[300, 40, 5]

### --why--

Bez porovnávací funkce `sort` převede položky na text a řadí je znak po znaku. Čísla seřadí `values.sort((a, b) => a - b)` — a `sort` přitom mění původní pole.

### --see--

js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce
