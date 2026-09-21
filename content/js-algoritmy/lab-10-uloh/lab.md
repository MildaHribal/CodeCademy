---
title: Deset úloh na rozehřátí
runtime: js
see: js-algoritmy/postup-reseni#nejdriv-hruba-sila-pak-zlepseni
---

# --description--

Deset malých úloh, které se v té či oné podobě objeví skoro na každém technickém
pohovoru. Nejsou tu proto, že bys je měl umět zpaměti — ale proto, že po desáté takové
úloze přestane být zadání u tabule překvapením.

Pracuješ v jednom souboru a všechny funkce se testují najednou. Pořadí si vyber sám;
těžší jsou šestka, sedmička a desítka.

**Postup, který se vyplatí u každé z nich:** přeformuluj zadání vlastními slovy →
vymysli tři příklady včetně prázdného vstupu → napiš hrubou sílu → teprve pak zlepšuj.

## Co má platit

1. `pocetSlov(text)` vrátí `Map` slovo → počet. Velikost písmen nerozhoduje
   a interpunkce se ignoruje (`Brně` a `brně` je totéž slovo).
2. `prvniUnikatni(text)` vrátí první **znak**, který se v textu vyskytuje právě jednou,
   nebo `null`, když takový není. Velikost písmen tady rozhoduje.
3. `dvaSoucet(cisla, cil)` vrátí pole dvou **indexů** různých prvků, jejichž součet je
   `cil`, jinak `null`. Musí zvládnout pole o sto tisíci prvcích — dva vnořené cykly
   tedy ne.
4. `jeAnagram(a, b)` řekne, jestli jsou dva texty anagramy. Mezery a velikost písmen
   nerozhodují.
5. `zplosti(pole)` zploští libovolně zanořené pole do jedné úrovně. Bez
   `flat(Infinity)` — o to tu jde.
6. `nejdelsiRada(cisla)` vrátí délku nejdelší řady po sobě jdoucích celých čísel.
   Pořadí ve vstupu nerozhoduje, duplicity se nepočítají dvakrát.
7. `binarniHledani(serazene, hledane)` vrátí index hodnoty v seřazeném poli, jinak
   `-1`. Musí to být logaritmické — tedy žádné `indexOf`.
8. `chybejiciCislo(cisla)` dostane pole s čísly `0` až `n` v náhodném pořadí, jedno
   chybí. Vrátí to chybějící.
9. `zabalDoSkupin(pole, velikost)` rozdělí pole na skupiny dané velikosti; poslední
   smí být kratší. Velikost menší než 1 dá prázdné pole.
10. `nejcastejsi(text, k)` vrátí `k` nejčastějších slov od nejčastějšího. Při shodě
    počtu rozhoduje abecedně (česky).

Všechny funkce nechají vstupní pole i text beze změny.

> [!TIP]
> Než začneš, projdi si u každé úlohy jednu otázku: **co je tady to „n"?** Odpověď na
> ni rozhodne, jestli tvoje řešení bude stačit na sto tisíc prvků, nebo ne.

# --hints--

1. Frekvence slov.

```js
const pocty = pocetSlov(ukazkaTextu);
assert.ok(pocty instanceof Map, 'pocetSlov má vracet Map');
assert.equal(pocty.get('kávu'), 2, 'Slovo „kávu" je v textu dvakrát');
assert.equal(pocty.get('rohu'), 2, 'Slovo „rohu" je v textu dvakrát');
assert.equal(pocty.get('kavárna'), 1, 'Velikost písmen nerozhoduje: Kavárna → kavárna');
assert.equal(pocty.get('brně'), 1, 'Interpunkce se ignoruje');
assert.equal(pocetSlov('').size, 0, 'Prázdný text nemá žádná slova');
```

2. První znak, který se vyskytuje jednou.

```js
assert.equal(prvniUnikatni('svetr'), 's', 'V „svetr" je první unikátní znak s');
assert.equal(prvniUnikatni('aabbc'), 'c', 'V „aabbc" je unikátní jen c');
assert.equal(prvniUnikatni('aabb'), null, 'Když unikátní znak není, vrací se null');
assert.equal(prvniUnikatni(''), null, 'Prázdný text nemá unikátní znak');
assert.equal(prvniUnikatni('Aa'), 'A', 'Velikost písmen tady rozhoduje');
```

3. Dvojice se zadaným součtem — a to rychle.

```js
assert.deepEqual(dvaSoucet([2, 7, 11, 15], 9), [0, 1], 'Součet 2 + 7 je 9, indexy 0 a 1');
assert.deepEqual(dvaSoucet([3, 2, 4], 6), [1, 2], 'Vrací se první nalezená dvojice v pořadí druhého indexu');
assert.equal(dvaSoucet([1, 2, 3], 100), null, 'Když dvojice není, vrací se null');
assert.equal(dvaSoucet([3], 6), null, 'Jeden prvek se nesmí použít dvakrát');

const velke = Array.from({ length: 100000 }, (_, i) => i);
const zacatek = Date.now();
assert.deepEqual(dvaSoucet(velke, 199997), [99998, 99999], 'Musí najít dvojici i ve velkém poli');
const trvani = Date.now() - zacatek;
assert.ok(trvani < 400, `Nad 100 000 prvky to trvalo ${trvani} ms — dva vnořené cykly nestačí`);
```

4. Anagramy.

```js
assert.equal(jeAnagram('listen', 'silent'), true, 'listen a silent jsou anagramy');
assert.equal(jeAnagram('Slovo dnes', 'Vodnes slo'), true, 'Mezery a velikost písmen nerozhodují');
assert.equal(jeAnagram('abc', 'abd'), false, 'Jiné znaky nejsou anagram');
assert.equal(jeAnagram('abc', 'abcc'), false, 'Jiný počet znaků nejsou anagram');
assert.equal(jeAnagram('', ''), true, 'Dva prázdné texty jsou triviálně anagramy');
```

5. Zploštění zanořeného pole.

```js
assert.deepEqual(zplosti([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5], 'Zploštit se má libovolná hloubka');
assert.deepEqual(zplosti([]), [], 'Prázdné pole zůstane prázdné');
assert.deepEqual(zplosti([[], [[]], [[[1]]]]), [1], 'Prázdná vnořená pole zmizí');
const vstup = [1, [2, 3]];
zplosti(vstup);
assert.deepEqual(vstup, [1, [2, 3]], 'Vstupní pole musí zůstat beze změny');
```

6. Nejdelší řada po sobě jdoucích čísel.

```js
assert.equal(nejdelsiRada([100, 4, 200, 1, 3, 2]), 4, 'Řada 1,2,3,4 má délku 4');
assert.equal(nejdelsiRada([]), 0, 'Prázdné pole má řadu délky 0');
assert.equal(nejdelsiRada([7]), 1, 'Jedno číslo je řada délky 1');
assert.equal(nejdelsiRada([1, 1, 2, 2, 3]), 3, 'Duplicity se nepočítají dvakrát');
assert.equal(nejdelsiRada([10, 30, 20]), 1, 'Když na sebe nic nenavazuje, je nejdelší řada 1');
```

7. Binární hledání.

```js
const serazene = [1, 3, 5, 7, 9, 11, 13];
assert.equal(binarniHledani(serazene, 7), 3, 'Sedmička je na indexu 3');
assert.equal(binarniHledani(serazene, 1), 0, 'První prvek se má najít');
assert.equal(binarniHledani(serazene, 13), 6, 'Poslední prvek se má najít');
assert.equal(binarniHledani(serazene, 8), -1, 'Chybějící hodnota vrací -1');
assert.equal(binarniHledani([], 1), -1, 'V prázdném poli se nic nenajde');

const milion = Array.from({ length: 1000000 }, (_, i) => i * 2);
const zacatek = Date.now();
for (let i = 0; i < 2000; i++) binarniHledani(milion, 1999998);
assert.ok(Date.now() - zacatek < 300, 'Dva tisíce hledání v milionu prvků musí být otázka milisekund — půlením, ne průchodem');
```

8. Chybějící číslo.

```js
assert.equal(chybejiciCislo([3, 0, 1]), 2, 'Z 0..3 chybí 2');
assert.equal(chybejiciCislo([0]), 1, 'Z 0..1 chybí 1');
assert.equal(chybejiciCislo([1]), 0, 'Z 0..1 chybí 0');
const velke = Array.from({ length: 50000 }, (_, i) => i).filter((n) => n !== 31337);
assert.equal(chybejiciCislo(velke), 31337, 'Musí to fungovat i na velkém rozsahu');
```

9. Rozdělení do skupin.

```js
assert.deepEqual(zabalDoSkupin([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]], 'Poslední skupina smí být kratší');
assert.deepEqual(zabalDoSkupin([1, 2, 3, 4], 2), [[1, 2], [3, 4]], 'Beze zbytku to vyjde přesně');
assert.deepEqual(zabalDoSkupin([], 3), [], 'Prázdné pole dá prázdný výsledek');
assert.deepEqual(zabalDoSkupin([1, 2], 0), [], 'Velikost menší než 1 dá prázdné pole');
assert.deepEqual(zabalDoSkupin([1, 2], 10), [[1, 2]], 'Větší velikost než pole dá jednu skupinu');
const vstup = [1, 2, 3];
zabalDoSkupin(vstup, 2);
assert.deepEqual(vstup, [1, 2, 3], 'Vstupní pole musí zůstat beze změny');
```

10. Nejčastější slova.

```js
assert.deepEqual(nejcastejsi(ukazkaTextu, 2), ['kávu', 'rohu'], 'Nejčastější jsou kávu a rohu, obě dvakrát — při shodě rozhoduje abeceda');
assert.deepEqual(nejcastejsi('a b a c b a', 1), ['a'], 'Nejčastější je a');
assert.deepEqual(nejcastejsi('b a c', 3), ['a', 'b', 'c'], 'Při shodě počtu rozhoduje abeceda');
assert.deepEqual(nejcastejsi('', 3), [], 'Prázdný text nemá slova');
assert.deepEqual(nejcastejsi('a b', 10), ['a', 'b'], 'Když je slov míň než k, vrátí se všechna');
```

# --help--

## --tip--

U úloh 1, 2, 3, 6 a 10 je společný nápad: **jeden průchod, do kterého si ukládáš, co
jsi už viděl.** Ta úložná struktura pak odpovídá otázku „viděl jsem tohle?" za konstantní
čas — viz [Frekvenční mapa](see:js-algoritmy/datove-struktury#frekvencni-mapa-nejcastejsi-vzor-z-pohovoru).

## --tip--

U úloh 5 a 7 je společný nápad **rozděl a panuj**: úloha se převede na menší úlohu
téhož tvaru. U sedmičky se interval půlí, u pětky se o úroveň snižuje zanoření.
Nezapomeň na základní případ, viz
[Rekurze](see:js-algoritmy/razeni-a-rekurze#rekurze-zakladni-pripad-a-krok).

# --seed--

## --file-- script.js

```js
// Deset úloh, které se v té či oné podobě objeví skoro na každém pohovoru.
// Doplň těla funkcí. Testy běží nad všemi najednou, takže si klidně vyber pořadí.

const ukazkaTextu = 'Kavárna na rohu má nejlepší kávu v Brně a ta kávu z rohu předčí';

/** 1. Frekvence slov: vrátí Map slovo → počet. */
function pocetSlov(text) {

}

/** 2. První znak, který se v textu vyskytuje právě jednou (jinak null). */
function prvniUnikatni(text) {

}

/** 3. Indexy dvou různých čísel, jejichž součet je `cil` (jinak null). */
function dvaSoucet(cisla, cil) {

}

/** 4. Jsou to anagramy? Mezery a velikost písmen nerozhodují. */
function jeAnagram(a, b) {

}

/** 5. Zploští libovolně zanořené pole do jedné úrovně. */
function zplosti(pole) {

}

/** 6. Délka nejdelší řady po sobě jdoucích celých čísel. */
function nejdelsiRada(cisla) {

}

/** 7. Index hledané hodnoty v seřazeném poli, jinak -1. */
function binarniHledani(serazene, hledane) {

}

/** 8. Které číslo z rozsahu 0..n v poli chybí? */
function chybejiciCislo(cisla) {

}

/** 9. Rozdělí pole na skupiny dané velikosti. */
function zabalDoSkupin(pole, velikost) {

}

/** 10. `k` nejčastějších slov textu, od nejčastějšího. */
function nejcastejsi(text, k) {

}
```

# --solution--

## --file-- script.js

```js
// Deset úloh, které se v té či oné podobě objeví skoro na každém pohovoru.

const ukazkaTextu = 'Kavárna na rohu má nejlepší kávu v Brně a ta kávu z rohu předčí';

/** Rozdělí text na slova bez interpunkce, malými písmeny. */
function slova(text) {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** 1. Frekvence slov: Map slovo → počet. Jeden průchod, O(n). */
function pocetSlov(text) {
  const pocty = new Map();
  for (const slovo of slova(text)) {
    pocty.set(slovo, (pocty.get(slovo) ?? 0) + 1);
  }
  return pocty;
}

/** 2. První znak, který se v textu vyskytuje právě jednou. */
function prvniUnikatni(text) {
  const pocty = new Map();
  for (const znak of text) pocty.set(znak, (pocty.get(znak) ?? 0) + 1);
  for (const znak of text) {
    if (pocty.get(znak) === 1) return znak;
  }
  return null;
}

/** 3. Dvojice se zadaným součtem. Mapa viděných hodnot místo dvou cyklů → O(n). */
function dvaSoucet(cisla, cil) {
  const videne = new Map();
  for (let i = 0; i < cisla.length; i++) {
    const hledany = cil - cisla[i];
    if (videne.has(hledany)) return [videne.get(hledany), i];
    videne.set(cisla[i], i);
  }
  return null;
}

/** 4. Anagramy: stejné znaky bez ohledu na pořadí, mezery a velikost písmen. */
function jeAnagram(a, b) {
  const otisk = (text) => [...text.toLowerCase().replace(/\s+/gu, '')].sort().join('');
  return otisk(a) === otisk(b);
}

/** 5. Zploštění rekurzí: základní případ je „není to pole". */
function zplosti(pole) {
  const vysledek = [];
  for (const polozka of pole) {
    if (Array.isArray(polozka)) vysledek.push(...zplosti(polozka));
    else vysledek.push(polozka);
  }
  return vysledek;
}

/** 6. Nejdelší řada: začátek řady se pozná tím, že předchůdce v množině není. */
function nejdelsiRada(cisla) {
  const mnozina = new Set(cisla);
  let nejdelsi = 0;
  for (const cislo of mnozina) {
    if (mnozina.has(cislo - 1)) continue;
    let delka = 1;
    while (mnozina.has(cislo + delka)) delka += 1;
    if (delka > nejdelsi) nejdelsi = delka;
  }
  return nejdelsi;
}

/** 7. Binární hledání: půlení intervalu, O(log n). */
function binarniHledani(serazene, hledane) {
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

/** 8. Chybějící číslo: součet celého rozsahu minus součet pole. */
function chybejiciCislo(cisla) {
  const n = cisla.length;
  const ocekavany = (n * (n + 1)) / 2;
  const skutecny = cisla.reduce((soucet, cislo) => soucet + cislo, 0);
  return ocekavany - skutecny;
}

/** 9. Rozdělení do skupin dané velikosti. */
function zabalDoSkupin(pole, velikost) {
  if (velikost < 1) return [];
  const skupiny = [];
  for (let i = 0; i < pole.length; i += velikost) {
    skupiny.push(pole.slice(i, i + velikost));
  }
  return skupiny;
}

/** 10. k nejčastějších slov. Při shodě počtu rozhoduje abeceda. */
function nejcastejsi(text, k) {
  return [...pocetSlov(text)]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'cs'))
    .slice(0, k)
    .map(([slovo]) => slovo);
}
```

# --approaches--

## --approach-- Nejdelší řada přes seřazení

Místo množiny se čísla seřadí a projdou jedním cyklem. Je to `O(n log n)` místo
`O(n)`, zato kratší a nepotřebuje to nápad s „začátkem řady". Na pohovoru je to
naprosto přijatelná odpověď — hlavně když nahlas řekneš, kolik tě to stojí.

### --file-- script.js

```js
// Deset úloh, které se v té či oné podobě objeví skoro na každém pohovoru.

const ukazkaTextu = 'Kavárna na rohu má nejlepší kávu v Brně a ta kávu z rohu předčí';

/** Rozdělí text na slova bez interpunkce, malými písmeny. */
function slova(text) {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** 1. Frekvence slov: Map slovo → počet. Jeden průchod, O(n). */
function pocetSlov(text) {
  const pocty = new Map();
  for (const slovo of slova(text)) {
    pocty.set(slovo, (pocty.get(slovo) ?? 0) + 1);
  }
  return pocty;
}

/** 2. První znak, který se v textu vyskytuje právě jednou. */
function prvniUnikatni(text) {
  const pocty = new Map();
  for (const znak of text) pocty.set(znak, (pocty.get(znak) ?? 0) + 1);
  for (const znak of text) {
    if (pocty.get(znak) === 1) return znak;
  }
  return null;
}

/** 3. Dvojice se zadaným součtem. Mapa viděných hodnot místo dvou cyklů → O(n). */
function dvaSoucet(cisla, cil) {
  const videne = new Map();
  for (let i = 0; i < cisla.length; i++) {
    const hledany = cil - cisla[i];
    if (videne.has(hledany)) return [videne.get(hledany), i];
    videne.set(cisla[i], i);
  }
  return null;
}

/** 4. Anagramy: stejné znaky bez ohledu na pořadí, mezery a velikost písmen. */
function jeAnagram(a, b) {
  const otisk = (text) => [...text.toLowerCase().replace(/\s+/gu, '')].sort().join('');
  return otisk(a) === otisk(b);
}

/** 5. Zploštění rekurzí: základní případ je „není to pole". */
function zplosti(pole) {
  const vysledek = [];
  for (const polozka of pole) {
    if (Array.isArray(polozka)) vysledek.push(...zplosti(polozka));
    else vysledek.push(polozka);
  }
  return vysledek;
}

/** 6. Nejdelší řada přes seřazení: O(n log n), zato bez množiny a kratší. */
function nejdelsiRada(cisla) {
  if (cisla.length === 0) return 0;
  const serazene = [...new Set(cisla)].sort((a, b) => a - b);
  let nejdelsi = 1;
  let aktualni = 1;
  for (let i = 1; i < serazene.length; i++) {
    if (serazene[i] === serazene[i - 1] + 1) aktualni += 1;
    else aktualni = 1;
    if (aktualni > nejdelsi) nejdelsi = aktualni;
  }
  return nejdelsi;
}

/** 7. Binární hledání: půlení intervalu, O(log n). */
function binarniHledani(serazene, hledane) {
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

/** 8. Chybějící číslo: součet celého rozsahu minus součet pole. */
function chybejiciCislo(cisla) {
  const n = cisla.length;
  const ocekavany = (n * (n + 1)) / 2;
  const skutecny = cisla.reduce((soucet, cislo) => soucet + cislo, 0);
  return ocekavany - skutecny;
}

/** 9. Rozdělení do skupin dané velikosti. */
function zabalDoSkupin(pole, velikost) {
  if (velikost < 1) return [];
  const skupiny = [];
  for (let i = 0; i < pole.length; i += velikost) {
    skupiny.push(pole.slice(i, i + velikost));
  }
  return skupiny;
}

/** 10. k nejčastějších slov. Při shodě počtu rozhoduje abeceda. */
function nejcastejsi(text, k) {
  return [...pocetSlov(text)]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'cs'))
    .slice(0, k)
    .map(([slovo]) => slovo);
}
```

## --approach-- Rekurzivní půlení a flatMap

Sedmičku i pětku lze napsat rekurzivně: binární hledání si posílá hranice intervalu
parametrem a zploštění se vejde do jednoho `flatMap`. Čitelnější, ale u velmi hlubokého
zanoření nebo obřího pole spotřebuje zásobník.

### --file-- script.js

```js
// Deset úloh, které se v té či oné podobě objeví skoro na každém pohovoru.

const ukazkaTextu = 'Kavárna na rohu má nejlepší kávu v Brně a ta kávu z rohu předčí';

/** Rozdělí text na slova bez interpunkce, malými písmeny. */
function slova(text) {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** 1. Frekvence slov: Map slovo → počet. Jeden průchod, O(n). */
function pocetSlov(text) {
  const pocty = new Map();
  for (const slovo of slova(text)) {
    pocty.set(slovo, (pocty.get(slovo) ?? 0) + 1);
  }
  return pocty;
}

/** 2. První znak, který se v textu vyskytuje právě jednou. */
function prvniUnikatni(text) {
  const pocty = new Map();
  for (const znak of text) pocty.set(znak, (pocty.get(znak) ?? 0) + 1);
  for (const znak of text) {
    if (pocty.get(znak) === 1) return znak;
  }
  return null;
}

/** 3. Dvojice se zadaným součtem. Mapa viděných hodnot místo dvou cyklů → O(n). */
function dvaSoucet(cisla, cil) {
  const videne = new Map();
  for (let i = 0; i < cisla.length; i++) {
    const hledany = cil - cisla[i];
    if (videne.has(hledany)) return [videne.get(hledany), i];
    videne.set(cisla[i], i);
  }
  return null;
}

/** 4. Anagramy: stejné znaky bez ohledu na pořadí, mezery a velikost písmen. */
function jeAnagram(a, b) {
  const otisk = (text) => [...text.toLowerCase().replace(/\s+/gu, '')].sort().join('');
  return otisk(a) === otisk(b);
}

/** 5. Zploštění přes flatMap: rekurze schovaná do jednoho řádku. */
function zplosti(pole) {
  return pole.flatMap((polozka) => (Array.isArray(polozka) ? zplosti(polozka) : [polozka]));
}

/** 6. Nejdelší řada: začátek řady se pozná tím, že předchůdce v množině není. */
function nejdelsiRada(cisla) {
  const mnozina = new Set(cisla);
  let nejdelsi = 0;
  for (const cislo of mnozina) {
    if (mnozina.has(cislo - 1)) continue;
    let delka = 1;
    while (mnozina.has(cislo + delka)) delka += 1;
    if (delka > nejdelsi) nejdelsi = delka;
  }
  return nejdelsi;
}

/** 7. Binární hledání rekurzí. Čitelnější, ale spotřebuje zásobník. */
function binarniHledani(serazene, hledane, zleva = 0, zprava = serazene.length - 1) {
  if (zleva > zprava) return -1;
  const stred = Math.floor((zleva + zprava) / 2);
  if (serazene[stred] === hledane) return stred;
  if (serazene[stred] < hledane) return binarniHledani(serazene, hledane, stred + 1, zprava);
  return binarniHledani(serazene, hledane, zleva, stred - 1);
}

/** 8. Chybějící číslo: součet celého rozsahu minus součet pole. */
function chybejiciCislo(cisla) {
  const n = cisla.length;
  const ocekavany = (n * (n + 1)) / 2;
  const skutecny = cisla.reduce((soucet, cislo) => soucet + cislo, 0);
  return ocekavany - skutecny;
}

/** 9. Rozdělení do skupin dané velikosti. */
function zabalDoSkupin(pole, velikost) {
  if (velikost < 1) return [];
  const skupiny = [];
  for (let i = 0; i < pole.length; i += velikost) {
    skupiny.push(pole.slice(i, i + velikost));
  }
  return skupiny;
}

/** 10. k nejčastějších slov. Při shodě počtu rozhoduje abeceda. */
function nejcastejsi(text, k) {
  return [...pocetSlov(text)]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'cs'))
    .slice(0, k)
    .map(([slovo]) => slovo);
}
```

# --review--

Testy kontrolují, že to funguje. Tohle si projdi sám — přesně na to se totiž u tabule
ptají dál.

## --rubric--

- U každé funkce umíš říct její složitost v `O` notaci a co je v ní to „n".
- Víš, kterou z deseti funkcí jsi napsal hrubou silou a co by ji zrychlilo.
- Názvy pomocných proměnných říkají, co v nich je (`videne`, `pocty`), ne `tmp` a `x`.
- U každé funkce jsi vyzkoušel prázdný vstup dřív, než jsi spustil testy.
- Žádná z funkcí nemění vstup, který dostala.
- Umíš nahlas popsat postup u trojky a šestky, aniž by ses díval do kódu.

## --extensions--

- **Řekni to nahlas.** Vyber si tři úlohy a vysvětli postup do prázdné místnosti —
  od zadání přes příklady po složitost. Tohle je ta dovednost, která se na pohovoru
  testuje, ne psaní.
- **Bez vestavěných metod.** Napiš devítku a pětku jen s `for` a indexy, bez `slice`,
  `flatMap` a spreadu.
- **Vlastních deset.** Najdi si deset dalších úloh a pusť se do nich stejným postupem.
  Po dvacáté už to bude rutina.
