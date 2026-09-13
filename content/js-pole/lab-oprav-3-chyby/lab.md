---
title: Oprav 3 chyby
runtime: js
kind: debug
see: js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce, js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty, js-pole/co-je-pole#mutace-pole-z-parametru
---

# --description--

Kolega napsal pro běžecký klub `script.js` s funkcemi pro stránku závodu a tréninkový deník a odjel na dovolenou. Funkce se používají na třech místech aplikace a z každého přišlo jedno hlášení. Chyby spolu nesouvisejí — každá je v jiné funkci.

## Hlášení

- **Nejrychlejší časy.** Tabulka „Top 3" u závodu ukazuje časy 1520, 1605 a 1710 sekund. Tomáš Beneš s časem 985 sekund, který závod vyhrál, v ní vůbec není.
- **Celkem naběháno.** U nového člena bez jediného běhu stránka deníku spadne s hláškou `TypeError: Reduce of empty array with no initial value`. U ostatních místo kilometrů ukazuje text `[object Object]7.510`.
- **Vyřazení závodníka.** Když rozhodčí vyřadí závodníka z výsledků, zmizí závodník i z tabulky „Všichni přihlášení", která má zůstat úplná. Obě tabulky dostávají stejné pole `results`.

Funkce `formatTime` funguje správně a ostatní části na ni spoléhají.

## Úkol

Oprav všechny tři chyby. U každé změň co nejmenší kus kódu a zkontroluj, že zbytek funguje dál. Každá chyba má v seznamu kontrol vlastní požadavky.

# --hints--

`fastestTimes(results)` vrátí tři nejlepší časy seřazené jako čísla od nejnižšího.

```js
const results = [
  { bib: 12, name: 'Jana', seconds: 1520 },
  { bib: 7, name: 'Tomáš', seconds: 985 },
  { bib: 31, name: 'Klára', seconds: 1605 },
  { bib: 4, name: 'Ondřej', seconds: 1710 },
];
assert.deepEqual(fastestTimes(results), [985, 1520, 1605], 'fastestTimes pro časy 1520, 985, 1605 a 1710 má vrátit [985, 1520, 1605]');
```

`fastestTimes` vrátí méně časů, když je výsledků méně než tři, a pole výsledků nepřerovná.

```js
const results = [
  { bib: 12, name: 'Jana', seconds: 1520 },
  { bib: 7, name: 'Tomáš', seconds: 985 },
];
assert.deepEqual(fastestTimes(results), [985, 1520], 'fastestTimes pro dva výsledky (1520 a 985) má vrátit [985, 1520]');
assert.deepEqual(results.map((result) => result.bib), [12, 7], 'fastestTimes nesmí přerovnat pole výsledků — startovní čísla mají zůstat 12, 7');
```

`totalDistance(runs)` sečte kilometry všech běhů.

```js
const runs = [{ date: '2026-09-01', km: 5 }, { date: '2026-09-03', km: 7.5 }, { date: '2026-09-06', km: 10 }];
assert.equal(totalDistance(runs), 22.5, 'totalDistance pro běhy 5, 7.5 a 10 km má vrátit číslo 22.5');
```

`totalDistance([])` vrátí `0`.

```js
assert.equal(totalDistance([]), 0, 'totalDistance([]) má vrátit 0 — nový člen zatím nic nenaběhal');
```

`withoutRunner(results, bib)` vrátí výsledky bez závodníka se zadaným startovním číslem.

```js
const jana = { bib: 12, name: 'Jana', seconds: 1520 };
const tomas = { bib: 7, name: 'Tomáš', seconds: 985 };
const klara = { bib: 31, name: 'Klára', seconds: 1605 };
assert.deepEqual(withoutRunner([jana, tomas, klara], 7), [jana, klara], 'withoutRunner([Jana 12, Tomáš 7, Klára 31], 7) má vrátit [Jana, Klára]');
```

`withoutRunner` nezmění pole, které dostane.

```js
const results = [
  { bib: 12, name: 'Jana', seconds: 1520 },
  { bib: 7, name: 'Tomáš', seconds: 985 },
];
withoutRunner(results, 7);
assert.equal(results.length, 2, 'withoutRunner([Jana, Tomáš], 7) nesmí odebírat z původního pole — tabulka přihlášených má mít pořád 2 závodníky');
```

`withoutRunner` s číslem, které ve výsledcích není, vrátí všechny výsledky.

```js
const jana = { bib: 12, name: 'Jana', seconds: 1520 };
const tomas = { bib: 7, name: 'Tomáš', seconds: 985 };
assert.deepEqual(withoutRunner([jana, tomas], 99), [jana, tomas], 'withoutRunner([Jana 12, Tomáš 7], 99) nemá nic odebrat');
```

`formatTime(seconds)` dál vrací čas ve tvaru `minuty:sekundy`.

```js
assert.equal(formatTime(985), '16:25', "formatTime(985) má vrátit '16:25'");
assert.equal(formatTime(1805), '30:05', "formatTime(1805) má vrátit '30:05' — sekundy vždy dvoumístné");
```

# --help--

## --tip--

Každá chyba odpovídá jedné pasti z lekcí: [`sort` bez porovnávací funkce](see:js-pole/metody-pole-do-hloubky#sort-bez-porovnavaci-funkce), [`reduce` bez počáteční hodnoty](see:js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty) a [mutace pole z parametru](see:js-pole/co-je-pole#mutace-pole-z-parametru). Nejdřív si ke každému hlášení najdi funkci, pak past.

## --tip--

Než začneš opravovat, chybu si zopakuj: pod funkce napiš volání s daty z hlášení (`console.log(fastestTimes(results))`, `console.log(totalDistance([]))`) a sleduj konzoli. Po opravě stejný výpis ukáže, jestli chyba zmizela.

# --seed--

## --file-- script.js

```js
// Výsledky závodu: startovní číslo (bib), jméno a čas v sekundách.
const results = [
  { bib: 12, name: 'Jana Dvořáková', seconds: 1520 },
  { bib: 7, name: 'Tomáš Beneš', seconds: 985 },
  { bib: 31, name: 'Klára Pokorná', seconds: 1605 },
  { bib: 4, name: 'Ondřej Král', seconds: 1710 },
];

// Tréninkový deník jednoho člena.
const runs = [
  { date: '2026-09-01', km: 5 },
  { date: '2026-09-03', km: 7.5 },
  { date: '2026-09-06', km: 10 },
];

// Čas v sekundách jako „minuty:sekundy", třeba 985 → „16:25".
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

// Tři nejlepší časy pro tabulku Top 3.
function fastestTimes(results) {
  return results
    .map((result) => result.seconds)
    .sort()
    .slice(0, 3);
}

// Kolik kilometrů člen naběhal celkem.
function totalDistance(runs) {
  return runs.reduce((sum, run) => sum + run.km);
}

// Výsledky bez vyřazeného závodníka.
function withoutRunner(results, bib) {
  const index = results.findIndex((result) => result.bib === bib);
  if (index === -1) {
    return results;
  }
  results.splice(index, 1);
  return results;
}

console.log('Top 3:', fastestTimes(results).map(formatTime));
console.log('Celkem naběháno:', totalDistance(runs), 'km');
```

# --solution--

## --file-- script.js

```js
// Výsledky závodu: startovní číslo (bib), jméno a čas v sekundách.
const results = [
  { bib: 12, name: 'Jana Dvořáková', seconds: 1520 },
  { bib: 7, name: 'Tomáš Beneš', seconds: 985 },
  { bib: 31, name: 'Klára Pokorná', seconds: 1605 },
  { bib: 4, name: 'Ondřej Král', seconds: 1710 },
];

// Tréninkový deník jednoho člena.
const runs = [
  { date: '2026-09-01', km: 5 },
  { date: '2026-09-03', km: 7.5 },
  { date: '2026-09-06', km: 10 },
];

// Čas v sekundách jako „minuty:sekundy", třeba 985 → „16:25".
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

// Tři nejlepší časy pro tabulku Top 3.
function fastestTimes(results) {
  return results
    .map((result) => result.seconds)
    .sort((a, b) => a - b)
    .slice(0, 3);
}

// Kolik kilometrů člen naběhal celkem.
function totalDistance(runs) {
  return runs.reduce((sum, run) => sum + run.km, 0);
}

// Výsledky bez vyřazeného závodníka.
function withoutRunner(results, bib) {
  const index = results.findIndex((result) => result.bib === bib);
  if (index === -1) {
    return results;
  }
  return results.toSpliced(index, 1);
}

console.log('Top 3:', fastestTimes(results).map(formatTime));
console.log('Celkem naběháno:', totalDistance(runs), 'km');
```

# --explain--

Vysvětli vlastními slovy, proč `withoutRunner` rozbila tabulku přihlášených, přestože sama vracela správné výsledky.

## --model--

`withoutRunner` dostala v parametru odkaz na stejné pole, ze kterého se kreslí i tabulka přihlášených. `splice` nevytvoří nové pole, ale vyřízne položku přímo z toho původního, takže závodník zmizel pro všechny, kdo na pole ukazují. Funkce pak vrátila totéž pole, a proto výsledek vypadal správně. Oprava je vrátit nové pole přes `toSpliced` nebo `filter` a původní nechat být.

## --checklist--

- Parametr `results` ukazuje na stejné pole, jaké používá tabulka přihlášených.
- `splice` mění původní pole, nevytváří nové.
- Změna je proto vidět všude, kde se s polem pracuje.
- Oprava vrací nové pole (`toSpliced`, `filter`) a původní nemění.

# --approaches--

## --approach-- Nejmenší opravy

Tři jednořádkové změny: porovnávací funkce pro `sort` (pole z `map` je nové, takže mutace tady nevadí), počáteční hodnota `0` a `toSpliced` místo `splice`. Tak vypadá oprava, kterou kolega po návratu snadno zkontroluje v diffu.

### --file-- script.js

```js
// Výsledky závodu: startovní číslo (bib), jméno a čas v sekundách.
const results = [
  { bib: 12, name: 'Jana Dvořáková', seconds: 1520 },
  { bib: 7, name: 'Tomáš Beneš', seconds: 985 },
  { bib: 31, name: 'Klára Pokorná', seconds: 1605 },
  { bib: 4, name: 'Ondřej Král', seconds: 1710 },
];

// Tréninkový deník jednoho člena.
const runs = [
  { date: '2026-09-01', km: 5 },
  { date: '2026-09-03', km: 7.5 },
  { date: '2026-09-06', km: 10 },
];

// Čas v sekundách jako „minuty:sekundy", třeba 985 → „16:25".
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

// Tři nejlepší časy pro tabulku Top 3.
function fastestTimes(results) {
  return results
    .map((result) => result.seconds)
    .sort((a, b) => a - b)
    .slice(0, 3);
}

// Kolik kilometrů člen naběhal celkem.
function totalDistance(runs) {
  return runs.reduce((sum, run) => sum + run.km, 0);
}

// Výsledky bez vyřazeného závodníka.
function withoutRunner(results, bib) {
  const index = results.findIndex((result) => result.bib === bib);
  if (index === -1) {
    return results;
  }
  return results.toSpliced(index, 1);
}

console.log('Top 3:', fastestTimes(results).map(formatTime));
console.log('Celkem naběháno:', totalDistance(runs), 'km');
```

## --approach-- Přepis na nemutující metody

Místo oprav jednotlivých řádků přepíše funkce tak, aby pasti ani nemohly nastat: `toSorted` s porovnávací funkcí, součet cyklem `for…of` bez `reduce` a `filter`, který nepotřebuje hledat index ani ošetřovat `-1`. Delší diff, ale kratší a odolnější kód.

### --file-- script.js

```js
// Výsledky závodu: startovní číslo (bib), jméno a čas v sekundách.
const results = [
  { bib: 12, name: 'Jana Dvořáková', seconds: 1520 },
  { bib: 7, name: 'Tomáš Beneš', seconds: 985 },
  { bib: 31, name: 'Klára Pokorná', seconds: 1605 },
  { bib: 4, name: 'Ondřej Král', seconds: 1710 },
];

// Tréninkový deník jednoho člena.
const runs = [
  { date: '2026-09-01', km: 5 },
  { date: '2026-09-03', km: 7.5 },
  { date: '2026-09-06', km: 10 },
];

// Čas v sekundách jako „minuty:sekundy", třeba 985 → „16:25".
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

// Tři nejlepší časy pro tabulku Top 3.
function fastestTimes(results) {
  return results
    .toSorted((a, b) => a.seconds - b.seconds)
    .slice(0, 3)
    .map((result) => result.seconds);
}

// Kolik kilometrů člen naběhal celkem.
function totalDistance(runs) {
  let total = 0;
  for (const run of runs) {
    total += run.km;
  }
  return total;
}

// Výsledky bez vyřazeného závodníka.
function withoutRunner(results, bib) {
  return results.filter((result) => result.bib !== bib);
}

console.log('Top 3:', fastestTimes(results).map(formatTime));
console.log('Celkem naběháno:', totalDistance(runs), 'km');
```
