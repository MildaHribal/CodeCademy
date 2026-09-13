# Tahák: pole v JavaScriptu

> [!REMEMBER]
> **Proměnná drží odkaz na pole, ne pole samotné.** Funkce, která dostane pole, vrací nové a původní nechá být — i s objekty uvnitř.

## Základy

| zápis | co dělá |
|---|---|
| `items[0]` | první položka; neexistující [[index]] vrátí `undefined` |
| `items.length` | počet položek; poslední má index `length - 1` |
| `items.at(-1)` | poslední položka (záporné číslo počítá od konce) |
| `[...items]`, `items.slice()` | mělká kopie — nové pole, tytéž objekty uvnitř |
| `Array.isArray(value)` | je to pole? (`typeof []` je `'object'`) |

## Metody: co vracejí a jestli mutují

| metoda | callback vrací | metoda vrací | mutuje? | kdy |
|---|---|---|---|---|
| `map` | novou položku | pole stejné délky | ne | přetvořit každou položku |
| `filter` | ano/ne | kratší pole původních položek | ne | vybrat položky |
| `find` / `findIndex` | ano/ne | první položku / její index (`undefined` / `-1`) | ne | najít jednu podle podmínky |
| `some` / `every` | ano/ne | `true` / `false` | ne | platí pro aspoň jednu / pro všechny |
| `includes` / `indexOf` | — | `true`/`false` / index nebo `-1` | ne | hledat konkrétní hodnotu |
| `reduce` | nový [[akumulátor]] | poslední akumulátor | ne | z pole jedna hodnota |
| `toSorted` / `sort` | záporné / 0 / kladné | seřazené pole | `sort` ano | řazení |
| `toSpliced` / `splice` | — | upravená kopie / vyříznuté položky | `splice` ano | odebrat nebo vložit uprostřed |
| `push`, `pop`, `shift`, `unshift`, `reverse` | — | délku / položku / pole | ano | jen nad vlastním polem |
| `forEach` | nic | `undefined` | ne | vedlejší efekt (výpis) |
| `Object.groupBy(items, fn)` | klíč skupiny | objekt skupin | ne | rozdělit do skupin |

## Vzory

```js
// přidat a odebrat bez mutace
const added = [...items, newItem];
const removed = items.filter((item) => item.id !== id);
const withoutSecond = items.toSpliced(1, 1);

// změnit jednu položku bez mutace
const updated = items.map((item) => (item.id === id ? { ...item, quantity: 3 } : item));

// součet a počty podle klíče
const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const counts = items.reduce((result, item) => {
  result[item.category] = (result[item.category] ?? 0) + 1;
  return result;
}, {});

// řazení bez mutace: čísla a české texty
const cheapest = items.toSorted((a, b) => a.price - b.price);
const byName = items.toSorted((a, b) => a.name.localeCompare(b.name, 'cs'));

// řetězení: nejdřív zužuj, pak přetvářej
const names = items.filter((item) => !item.bought).map((item) => item.name);
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| `[1, 10, 9]` místo `[1, 9, 10]` | `sort()` bez [[porovnávací funkce]] řadí jako text | `toSorted((a, b) => a - b)` |
| `[undefined, undefined]` nebo `[]` | callback se `{ }` bez `return` | smaž závorky nebo připiš `return`; objekt do `({ … })` |
| `[object Object]250`, `Reduce of empty array with no initial value` | `reduce` bez počáteční hodnoty | `reduce(…, 0)` |
| první položka „není", chybějící „je" | `if (items.indexOf(x))` — `0` je nepravda, `-1` pravda | `includes(x)` nebo `!== -1` |
| změnila se i původní data | [[mutující metoda]] nebo zápis do objektu z parametru | `toSorted`, `toSpliced`, `{ ...item, … }` |
| `[1, NaN, NaN]` | `map(parseInt)` — callback dostane i index | `map((text) => parseInt(text, 10))` |
| `Cannot read properties of undefined` | čtení mimo pole (`items[items.length]`) | index `length - 1` nebo `at(-1)` |
| kód za `forEach` běží dřív | `forEach` nečeká na `await` | `for…of` s `await` |
| `Čaj` za `Zelím`, `Chleba` před `Hrách` | porovnání textů přes `<` nebo bez jazyka | `localeCompare(b, 'cs')` |
