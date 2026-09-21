Rychlý přehled pro přípravu na technický pohovor.

## Postup u tabule

1. **Přeformuluj zadání** vlastními slovy a nech si ho potvrdit.
2. **Vymysli příklady**, hlavně ošklivé: prázdný vstup, jeden prvek, duplicity, záporná čísla, obří `n`.
3. **Zeptej se na omezení:** jak velké je `n`, můžou se hodnoty opakovat, co při neplatném vstupu.
4. **Popiš hrubou sílu** a její složitost. Až pak hledej lepší řešení.
5. **Piš a mluv zároveň.** Ticho u tabule je horší než pomalé řešení.
6. **Projdi si vlastní kód** na jednom malém příkladu, řádek po řádku.

## Složitosti

| Zápis | Název | Typicky |
|---|---|---|
| `O(1)` | konstantní | `pole[i]`, `mapa.get`, `mnozina.has`, `push` |
| `O(log n)` | logaritmická | binární hledání, vyvážený strom |
| `O(n)` | lineární | jeden průchod, `includes`, `filter`, `map` |
| `O(n log n)` | linearitmická | `sort`, merge sort |
| `O(n²)` | kvadratická | dva vnořené cykly, `includes` v cyklu |
| `O(2ⁿ)` | exponenciální | rekurze bez memoizace (naivní Fibonacci) |

Při milionu prvků: konstantní = 1 krok · logaritmická ≈ 20 · lineární = 10⁶ ·
`n log n` ≈ 2·10⁷ · kvadratická = 10¹² (řádově hodiny).

**Konstanty a méně významné členy se zahazují:** `O(3n + 50)` je `O(n)`,
`O(n² + n)` je `O(n²)`.

## Skryté `n` v metodách pole

```js
// O(n) samy o sobě, O(n²) uvnitř cyklu:
pole.includes(x)   pole.indexOf(x)   pole.find(...)   pole.filter(...)

// O(n), protože musí posunout všechny prvky:
pole.unshift(x)    pole.shift()      pole.splice(0, 1)

// O(1):
pole[i]            pole.push(x)      pole.pop()       pole.length
```

## Výměna paměti za čas

```js
// O(n²) — hledání v poli uvnitř cyklu
for (const x of a) if (b.includes(x)) spolecne.push(x);

// O(n) času za O(n) paměti
const vBecku = new Set(b);
for (const x of a) if (vBecku.has(x)) spolecne.push(x);
```

## Map a Set

```js
const pocty = new Map();
pocty.set(klic, (pocty.get(klic) ?? 0) + 1);   // frekvenční mapa
pocty.has(klic)  pocty.get(klic)  pocty.size  pocty.delete(klic)
[...pocty]                                      // pole dvojic [klic, hodnota]

const unikatni = [...new Set(pole)];            // deduplikace
mnozina.has(x)   mnozina.add(x)   mnozina.size
```

**Map místo objektu**, když klíče přicházejí z dat: objekt dědí `constructor`,
`toString` a `__proto__` z prototypu a podmínka `if (!objekt[klic])` na nich selže.

## Řazení

```js
[...pole].sort((a, b) => a - b);                       // čísla vzestupně
[...pole].sort((a, b) => b - a);                       // čísla sestupně
[...pole].sort((a, b) => a.jmeno.localeCompare(b.jmeno, 'cs'));  // česky
[...pole].sort((a, b) => b.pocet - a.pocet || a.nazev.localeCompare(b.nazev, 'cs'));  // dvě kritéria
```

- `sort()` **bez funkce řadí jako text**: `[10, 9, 1].sort()` → `[1, 10, 9]`.
- `sort` řadí **na místě** — před řazením kopíruj (`[...pole]`), nebo použij `toSorted()`.
- Od ES2019 je `sort` **stabilní**: při shodě zůstane původní pořadí.
- Česká abeceda: `Č` hned za `C`, ale `CH` až za `H`.

## Binární hledání

```js
function najdi(serazene, hledane) {
  let zleva = 0;
  let zprava = serazene.length - 1;
  while (zleva <= zprava) {
    const stred = Math.floor((zleva + zprava) / 2);
    if (serazene[stred] === hledane) return stred;
    if (serazene[stred] < hledane) zleva = stred + 1;
    else zprava = stred - 1;
  }
  return -1;
}
```

Podmínkou je **seřazené** pole. Jedno seřazení `O(n log n)` se vyplatí, jen když
hledáš opakovaně.

## Rekurze

Každá rekurze potřebuje **základní případ** a **krok**, který se k němu blíží.

```js
function zplosti(pole) {
  return pole.flatMap((x) => (Array.isArray(x) ? zplosti(x) : [x]));
}
```

**Rozděl a panuj:** rozděl na menší úlohy stejného tvaru, vyřeš je, spoj výsledky
(merge sort, binární hledání, procházení stromu).

## Utility, na které se ptají

```js
// debounce — čeká na klid (našeptávač, ukládání konceptu)
function debounce(fn, delay) {
  let cekani;
  return (...args) => { clearTimeout(cekani); cekani = setTimeout(() => fn(...args), delay); };
}

// throttle — drží tempo (scroll, resize)
function throttle(fn, limit) {
  let naposledy = 0;
  return (...args) => {
    const ted = Date.now();
    if (ted - naposledy < limit) return;
    naposledy = ted;
    fn(...args);
  };
}

// memoize — spočítej jednou
function memoize(fn, keyFn = (prvni) => prvni) {
  const cache = new Map();
  return (...args) => {
    const klic = keyFn(...args);
    if (!cache.has(klic)) cache.set(klic, fn(...args));
    return cache.get(klic);
  };
}
```

Hluboká kopie: `structuredClone(hodnota)` zvládne i cykly, `Map` i `Set` — ale u tabule
ukaž, že ji umíš napsat rekurzí s `WeakMap` na už zkopírované objekty.

## Pasti a časté chyby

- **`sort()` bez porovnávací funkce** u čísel.
- **Mutace vstupu:** `sort`, `reverse`, `splice`, `push` na poli, které přišlo parametrem.
- **`typeof null === 'object'`** — u hluboké kopie a validací se na to zapomíná pořád.
- **Jeden prvek použitý dvakrát** v úlohách typu „dvojice se součtem".
- **Rekurze bez základního případu** → `RangeError: Maximum call stack size exceeded`.
- **`if (cache[klic])` místo `cache.has(klic)`** — hodnoty `0`, `''` a `false` se pak počítají znovu.
- **Optimalizace bez čísla:** než něco zrychlíš, řekni nahlas, co je v úloze `n` a kolik to je.
