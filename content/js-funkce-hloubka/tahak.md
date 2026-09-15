> [!REMEMBER]
> **[[closure|Closure]] = funkce + prostředí, ve kterém vznikla.** Pamatuje si proměnné, ne hodnoty.
> **`this` určuje řádek volání, ne místo zápisu.** Šipková funkce bere `this` z místa vzniku.

## Jak určit `this`

První odpověď „ano" platí.

| otázka | `this` je |
|---|---|
| Je to šipková funkce? | `this` z místa, kde vznikla |
| Volá se s `new`? | nový objekt |
| Je z `bind`, nebo se volá přes `call`/`apply`? | objekt, který jsi předal |
| Volá se přes tečku `obj.metoda()`? | objekt před tečkou |
| Nic z toho | `undefined` ve [[strict mode]], jinak globální objekt |

| zápis | co udělá |
|---|---|
| `fn.call(obj, a, b)` | zavolá hned, argumenty za sebou |
| `fn.apply(obj, [a, b])` | zavolá hned, argumenty v poli |
| `fn.bind(obj)` | nic nevolá, vrátí novou funkci s `this` natrvalo |

## Obaly nad funkcemi

| obal | co dělá | kdy |
|---|---|---|
| `once(fn)` | proběhne jen poprvé, pak vrací uložený výsledek | jednorázové načtení, inicializace |
| `memoize(fn)` | pro stejný argument vrátí výsledek z [[mezipaměť|mezipaměti]] | pomalý výpočet čisté funkce |
| `debounce(fn, ms)` | proběhne jednou po `ms` klidu | hledání při psaní, ukládání konceptu |
| `throttle(fn, ms)` | proběhne hned, pak nejvýš jednou za `ms` | posouvání, opakované kliknutí |

## Vzory

```js
// továrna se soukromým stavem
function createCounter() {
  let count = 0;
  return () => ++count;
}

// mezipaměť v prostředí obalu
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}

// debounce: zrušit starý časovač, naplánovat nový
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// throttle: pustit, jen když uplynul interval
function throttle(fn, interval) {
  let lastRun = -Infinity;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn(...args);
    }
  };
}

// callback uvnitř metody: šipková funkce převezme this
const player = {
  seconds: 0,
  start() {
    setInterval(() => this.seconds++, 1000);
  },
};

// kompozice zleva doprava
const pipe = (...fns) => (value) => fns.reduce((result, fn) => fn(result), value);

// strom z ploché tabulky
function buildTree(list, parentId = null) {
  return list
    .filter((item) => item.parentId === parentId)
    .map((item) => ({ ...item, children: buildTree(list, item.id) }));
}

// rekurze nad stromem: základní případ je uzel bez potomků
function countNodes(nodes) {
  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
}
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| všechny časovače a posluchače z cyklu vidí poslední hodnotu | `var` v cyklu — jedna proměnná pro všechna kola | `let` v hlavičce cyklu nebo `for…of` |
| dvě „nezávislá" počítadla nebo debounce se přepisují | stav deklarovaný nad továrnou | proměnnou dej do těla továrny |
| mezipaměť nebo debounce „nic nepamatuje" | továrna zavolaná při každém použití | obal vytvoř jednou a ulož |
| `Cannot read properties of undefined (reading …)` v metodě | metoda předaná jako callback ztratila `this` | `() => obj.metoda()` nebo `obj.metoda.bind(obj)` |
| metoda objektu vrací `undefined` | šipková funkce jako metoda | `metoda() { … }` |
| `this` funguje v metodě, ale ne v jejím `map` nebo `setTimeout` | callback jako `function () {}` | šipková funkce |
| `removeEventListener` posluchač neodebere | `bind` vyrobil jinou funkci | funkci z `bind` si ulož |
| memoizovaná funkce vrací zastaralý výsledek | memoizace nečisté funkce (čas, náhoda, vnější stav) | memoizuj jen [[čistá funkce|čisté funkce]] |
| `RangeError: Maximum call stack size exceeded` | [[rekurze]] bez [[základní případ|základního případu]], nebo příliš hluboká data | základní případ jako první; hluboká data cyklem |
| rekurzivní funkce vrací `undefined`, i když cíl existuje | výsledek vnořeného volání se nevrací dál | `const found = …; if (found) return found;` |
| `280 undefined` z `pipe` | funkce v `pipe` čeká dva argumenty | obal do funkce s jedním parametrem |
