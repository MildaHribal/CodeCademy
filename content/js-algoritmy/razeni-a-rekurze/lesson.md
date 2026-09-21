# Řazení, hledání a rekurze

:::check pretest
Co vypíše `console.log(['b', 'a'].sort() === undefined)`? Tipni si.

### --expected--

false

### --why--

`sort` nevrací `undefined`, ale samotné pole — a to je to samé pole, které dostal. První část ukáže, proč na tom záleží.
:::

:::check pretest
Funkce volá sama sebe a nemá žádnou podmínku, která by volání zastavila. Co se stane?

### --answer--

Prohlížeč funkci po chvíli sám ukončí a vrátí `undefined`.

#### --why--

JavaScript nic takového nedělá — volání se hromadí na jednom místě, dokud se to místo nezaplní. Jak se ta hláška jmenuje, ukáže třetí část.

### --correct--

Spadne to chybou `RangeError: Maximum call stack size exceeded`.

#### --why--

Každé volání zabere místo na zásobníku a nic ho neuvolní. Podrobnosti jsou ve třetí části.

### --answer--

Poběží to donekonečna a karta zamrzne.

#### --why--

Nekonečná smyčka opravdu zamrzne, ale rekurze má tvrdý strop. Zamysli se, kam se ukládají rozdělaná volání.
:::

Tabulka objednávek má tlačítka „seřadit podle data" a „seřadit podle ceny". Napíšeš `orders.sort(…)`, klikneš dvakrát a zjistíš, že se ti rozsypal graf pod tabulkou, protože pracoval se stejným polem. Pak přijde druhý požadavek: našeptávač musí najít město v seznamu deseti tisíc obcí do jednoho snímku.

Obojí je o pořadí. Seřazená data jsou totiž **jiná data** — dá se v nich hledat půlením a dá se v nich hledat dvěma ukazateli.

> [!REMEMBER]
> **`sort` řadí na místě a vrací totéž pole; `toSorted` vrací nové.** Když funkce dostane pole od volajícího, řadí kopii — jinak přerovná data i tomu, kdo o řazení nežádal.

## Řazení porovnávací funkcí

`sort` bez argumentu převede položky na text. Proto `[5, 40, 300].sort()` vrátí `[300, 40, 5]` — porovnává se první znak. Čísla i objekty se řadí **porovnávací funkcí**, která dostane dvě položky a vrátí záporné číslo, nulu, nebo kladné.

:::live js
```js
const prices = [5, 40, 300];

// 1. Bez porovnávací funkce se řadí jako text.
console.log([...prices].sort());

// 2. Se záporným, nulovým a kladným výsledkem se řadí jako čísla.
console.log([...prices].sort((a, b) => a - b));

// 3. Kopii vrátí toSorted, původní pole zůstane.
console.log(prices.toSorted((a, b) => b - a));
console.log(prices);
```
:::

Zkus prohodit `a - b` za `b - a` a sleduj, jak se pořadí obrátí. Rozdíl dvou čísel je přesně to, co porovnávací funkce chce: záporný, když má `a` jít dřív.

`sort` je [[řazení na místě]] — přerovná vstupní pole a vrátí ho. `toSorted` dělá kopii. Složitost obou je `O(N log N)`, což je na běžná data v prohlížeči naprosto v pořádku.

České texty nesrovnáš operátorem `<`. Porovnávají se totiž kódy znaků, takže `'Čapek' < 'Dvořák'` vyjde nepravda a Č skončí až za Z. Na to je `localeCompare`:

:::live js predict
```js
const names = ['Dvořák', 'Čapek', 'Chalupa', 'Adam'];
console.log(names.toSorted().join(' '));
console.log(names.toSorted((a, b) => a.localeCompare(b, 'cs')).join(' '));
```
--question-- Co vypíše konzole? Napiš oba řádky pod sebe.
--expected--
```text
Adam Chalupa Dvořák Čapek
Adam Čapek Dvořák Chalupa
```
--why-- Bez `localeCompare` rozhoduje kód znaku, takže `Č` skončí až za `D`. S českým porovnáním jde `Č` hned za `C` a `Ch` až za `H` — proto se Chalupa posune na konec.
:::

> [!PITFALL]
> **Porovnávací funkce nesmí vracet `true`/`false`.** `arr.sort((a, b) => a.price > b.price)` v některých případech nic nepřerovná, protože `true` je `1` a `false` je `0` — nikdy ne `-1`. Příznak: pole je seřazené „skoro". Oprava: `a.price - b.price`, u textů `a.name.localeCompare(b.name, 'cs')`.

:::check
Funkce dostane pole objednávek a má vrátit tři nejdražší, aniž by volajícímu rozházela pořadí. Kterou metodou začneš?

### --expected--

toSorted

### --accept--

orders.toSorted
udělám kopii a tu seřadím

### --why--

`toSorted` vrátí nové pole a původní nechá být. Stejně poslouží `[...orders].sort(…)`.
:::

## Binární vyhledávání v seřazeném poli

V seřazeném poli se dá hledat mnohem chytřeji než od začátku. Podívej se doprostřed: když je hodnota uprostřed větší než hledaná, celá pravá polovina padá. [[binární vyhledávání]] tak každým krokem zahodí půlku zbytku, což je [[logaritmická složitost]].

:::live js
```js
const cities = ['Brno', 'Jihlava', 'Olomouc', 'Ostrava', 'Plzeň', 'Praha', 'Zlín'];

// 1. Drž si hranice zbývajícího úseku.
// 2. Porovnej prostředek s hledanou hodnotou.
// 3. Zahoď tu polovinu, kde hodnota být nemůže.
function findCity(list, wanted) {
  let low = 0;
  let high = list.length - 1;
  let steps = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps++;
    if (list[mid] === wanted) return { index: mid, steps };
    if (list[mid] < wanted) low = mid + 1;
    else high = mid - 1;
  }
  return { index: -1, steps };
}

console.log(findCity(cities, 'Praha'));
console.log(findCity(cities, 'Zlín'));
console.log(findCity(cities, 'Kolín'));
```
:::

Zkus najít `'Brno'` a sleduj, kolik kroků to stojí proti `'Kolín'`. Nenalezená hodnota stojí nejvíc — ale pořád jen tři kroky na sedmi městech. Na deseti tisících by jich bylo čtrnáct.

Dvě místa, kde se v binárním vyhledávání chybuje nejčastěji: `low <= high` (s `<` se poslední jednoprvkový úsek nezkontroluje) a `mid + 1` / `mid - 1` (bez posunu o jedničku se úsek nezmenší a cyklus se zacyklí).

> [!PITFALL]
> **Binární vyhledávání na neseřazeném poli vrátí `-1`, i když hodnota v poli je.** Nespadne, nevypíše varování — prostě lže. Příznak: našeptávač některá slova „nezná". Oprava: seřaď data jednou při načtení, ne při každém hledání.

:::check
Proč se v binárním vyhledávání píše `low = mid + 1` a ne `low = mid`?

### --expected--

aby se úsek zmenšil a cyklus se nezacyklil

### --accept--

bez plus jedna se úsek nezmenší a while poběží donekonečna
prostředek už je porovnaný, takže se má vynechat

### --why--

Prostředek se právě porovnal a neodpovídal. Kdyby v úseku zůstal, `mid` by u dvouprvkového úseku vyšel pořád stejně.
:::

## Rekurze: základní případ a krok

[[rekurze]] je funkce, která volá sama sebe na menším vstupu. Má vždycky dvě části: **základní případ**, kdy se už nevolá a vrací hotový výsledek, a [[rekurzivní krok]], který úlohu zmenší.

:::live js
```js
const tree = {
  name: 'projekt',
  children: [
    { name: 'src', children: [{ name: 'index.js', children: [] }] },
    { name: 'README.md', children: [] },
  ],
};

// 1. Základní případ: uzel bez potomků je jedna položka.
// 2. Rekurzivní krok: sečti sebe a všechny potomky.
function countNodes(node) {
  let total = 1;
  for (const child of node.children) {
    total += countNodes(child);
  }
  return total;
}

console.log(countNodes(tree));
```
:::

Zkus do `src` přidat další soubor a sleduj, jak se číslo zvětší. Cyklem by se strom neznámé hloubky procházel mnohem hůř — rekurze má tu hloubku „zadarmo".

Rozdělaná volání se ukládají na [[zásobník volání]]. Každé čeká, až se dopočítá to vnořené. Proto rekurze bez základního případu skončí `RangeError: Maximum call stack size exceeded` — zásobník má strop kolem deseti tisíc úrovní.

:::memory
```js
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
const result = factorial(3);
```
--step-- 4 | první volání čeká na factorial(2)
n = 3
--step-- 2 | ve volání pro n = 1 platí základní případ
n = 1
--step-- 3 | výsledky se násobí při návratu zpět
n = 2
--step-- 5 | až se zásobník vyprázdní, je hotovo
result = 6
:::

:::check
Jaké dvě části musí mít každá rekurzivní funkce?

### --expected--

základní případ a rekurzivní krok

### --accept--

ukončovací podmínku a volání sebe sama na menším vstupu
base case a rekurzivní volání

### --why--

Bez základního případu se volání nezastaví, bez zmenšování vstupu se k němu nikdy nedojde. Obojí je potřeba.
:::

## Rozděl a panuj: merge sort

Řazení je nejznámější úloha, kde se rekurze vyplatí. Postup [[rozděl a panuj]] rozseká pole na poloviny, dokud nezbydou jednoprvková pole (ta jsou seřazená sama od sebe), a pak je po dvou slévá dohromady.

:::live js
```js
// 1. Slej dvě seřazená pole do jednoho seřazeného.
function merge(left, right) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  return out.concat(left.slice(i), right.slice(j));
}

// 2. Základní případ: pole do jedné položky je hotové.
// 3. Rekurzivní krok: rozděl na půlky a slej je.
function mergeSort(values) {
  if (values.length <= 1) return values;
  const middle = Math.floor(values.length / 2);
  return merge(mergeSort(values.slice(0, middle)), mergeSort(values.slice(middle)));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
```
:::

Zkus vypsat `console.log(values.length)` na začátku `mergeSort` a sleduj, jak se pole půlí. Hloubka dělení je `log N`, na každé úrovni se slije všech `N` položek — dohromady `O(N log N)`, tedy přesně to, co dělá `sort` v prohlížeči.

Merge sort je [[stabilní řazení]]: v `merge` se při shodě (`<=`) bere položka z levé části, takže dvě stejné hodnoty si zachovají původní pořadí. Právě proto se dá řadit ve dvou krocích — nejdřív podle jména, pak podle kategorie — a jména uvnitř kategorie zůstanou seřazená.

:::explain
Proč má merge sort složitost `O(N log N)` a ne `O(N²)`, když se v něm pole prochází pořád dokola?

## --model--

Pole se půlí, dokud nezbydou jednotlivé položky, a půlení se vejde `log N` úrovní. Na každé úrovni se ale každá položka slije právě jednou, takže jedna úroveň stojí `N` kroků, ne víc. Dohromady je to `log N` úrovní krát `N` kroků. Kvadratické by to bylo, kdyby se na každé úrovni procházelo celé pole tolikrát, kolik je položek.

## --checklist--

- Půlení vytvoří zhruba `log N` úrovní.
- Na každé úrovni se každá položka zpracuje jednou, tedy `N` kroků.
- Celek je součin obojího, ne součin počtu položek se sebou.
:::

:::check
Chceš seřadit zaměstnance podle oddělení a uvnitř oddělení podle příjmení. Jak toho dosáhneš dvěma řazeními za sebou?

### --expected--

nejdřív podle příjmení, pak podle oddělení

### --accept--

první řazení podle příjmení, druhé podle oddělení
seřadím podle příjmení a potom stabilně podle oddělení

### --why--

Stabilní řazení zachová pořadí u shodných klíčů, takže poslední řazení musí být to nejdůležitější. Uvnitř oddělení zůstane pořadí z prvního kroku.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`sort` mění pole i tomu, kdo ho jen půjčil.** `function top3(orders) { return orders.sort(…).slice(0, 3); }` přerovná pole volajícího. Příznak: tabulka se přeuspořádá i tam, kde na řazení nikdo neklikl. Oprava: `orders.toSorted(…)` nebo `[...orders].sort(…)`.

> [!PITFALL]
> **Rekurze bez zmenšování vstupu.** `flatten(items)` volaná znovu na `items` místo na `item` skončí `RangeError: Maximum call stack size exceeded`. Příznak: chyba přijde okamžitě a výpis zásobníku má stovky stejných řádků. Oprava: každé volání musí dostat menší vstup než to předchozí.

> [!PITFALL]
> **Řazení podle textu u dat ve formátu `1. 3. 2026`.** Textové porovnání dá `1. 3.` před `12. 1.`, protože rozhoduje znak po znaku. Příznak: přehled objednávek má prosincové řádky uprostřed. Oprava: řaď podle čísla (`new Date(a.iso) - new Date(b.iso)`), nebo drž datum ve tvaru `2026-03-01`, který se textově řadí správně.

:::check
Kolegova funkce `sortedNames(people)` vrací správné pořadí, ale rozbíjí graf, který používá totéž pole. Jedna změna to spraví — jaká?

### --expected--

nahradit sort za toSorted

### --accept--

řadit kopii pole
použít toSorted místo sort

### --why--

`sort` řadí na místě. Kopie (`toSorted`, `[...people].sort`) nechá vstupní pole tak, jak bylo.
:::

## Kde to najdeš v MDN

- [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) — sekce *Description* vysvětluje porovnávací funkci a stabilitu; hned na začátku stojí, že se řadí na místě.
- [Array.prototype.toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) — kopie místo mutace, včetně tabulky podpory prohlížečů.
- [String.prototype.localeCompare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare) — jak předat jazyk a volby (`sensitivity`, `numeric`) pro řazení textů s čísly.

Příště si tyhle vzory napíšeš sám: dva ukazatele, klouzavé okno a frekvenční mapa nad daty z analytiky.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const values = [3, 1, 2];
const copy = values.sort((a, b) => a - b);
copy.push(99);
console.log(values.length);
```

### --expected--

4

### --why--

`sort` vrací totéž pole, ne kopii. `copy` a `values` jsou dvě jména pro jedno pole, takže `push` přidá položku oběma. Kopii vrátí `toSorted`.

### --see--

js-algoritmy/razeni-a-rekurze#razeni-porovnavaci-funkci

## --question--

Seřazené pole má 1 000 položek a hledaná hodnota v něm není. Kolik porovnání zhruba udělá binární vyhledávání, než to pozná?

### --expected--

10

### --accept--

asi 10
zhruba 10
kolem 10

### --why--

Každý krok zahodí polovinu: 1 000 → 500 → 250 → … → 1. To je zhruba deset půlení. Lineární hledání by udělalo tisíc porovnání.

### --see--

js-algoritmy/razeni-a-rekurze#binarni-vyhledavani-v-serazenem-poli

## --question--

Proč se u rekurzivní funkce mluví o „hloubce", ale u cyklu ne?

### --answer--

Protože rekurze prochází data odzadu.

#### --why--

Směr průchodu s hloubkou nesouvisí — rekurze umí jít i zepředu. Zamysli se, kde se drží rozdělaná volání.

### --correct--

Protože každé nedokončené volání zabírá místo na zásobníku, dokud se vnořené volání nevrátí.

#### --why--

Cyklus si nic neodkládá, běží pořád v jednom rámci. Rekurze skládá rámce na sebe, a těch je omezený počet.

### --answer--

Protože rekurzivní funkce nemůže mít parametry.

#### --why--

Parametry mít může a právě jimi se vstup zmenšuje. Problém je jinde — v tom, co po sobě volání nechávají.

### --see--

js-funkce-hloubka/funkcionalni-styl#rekurze-a-zasobnik-volani

## --question--

**Opakování z dřívějška.** Proč `['Čapek', 'Dvořák'].sort()` dá jiné pořadí než seřazení podle české abecedy?

### --expected--

porovnávají se kódy znaků, ne česká abeceda

### --accept--

sort bez localeCompare porovnává podle kódů znaků
výchozí řazení jde podle Unicode, ne podle jazyka

### --why--

Výchozí `sort` porovnává textové kódy, kde jsou písmena s háčky až za celou základní abecedou. České pořadí dá `a.localeCompare(b, 'cs')`.

### --see--

js-retezce-cisla/retezce#porovnani-a-razeni-podle-cestiny

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
function sum(values) {
  return values.reduce((total, value) => total + value);
}
console.log(sum([]));
```

### --answer--

0

#### --why--

Nula by vyšla s počáteční hodnotou. Bez ní `reduce` na prázdném poli nemá, čím začít.

### --answer--

undefined

#### --why--

`reduce` se v tomhle případě nedostane k žádnému návratu. Zkus si vzpomenout, co dělá na prázdném poli bez počáteční hodnoty.

### --correct--

Vyhodí `TypeError: Reduce of empty array with no initial value`.

#### --why--

Bez počáteční hodnoty si `reduce` bere první položku jako akumulátor. Na prázdném poli žádná není, takže vyhodí chybu. Proto se počáteční hodnota píše vždycky.

### --see--

js-pole/metody-pole-do-hloubky#jak-pracuje-reduce
