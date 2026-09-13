---
title: Statistika známek
runtime: js
---

# --description--

Třídní učitelka chce na konci pololetí rychlý přehled: kdo má jaký průměr, kdo je nejlepší, kdo propadá a jak si vedou jednotlivé třídy. Známky má v poli studentů. Tvým úkolem je napsat funkce, které přehled spočítají.

Tentokrát bez návodu — zadání je seznam požadavků a o postupu rozhoduješ sám. Používej, co ses naučil: metody pole, `reduce`, řazení, spread. Pomocné funkce si klidně přidej.

V `script.js` jsou ukázková data. Každý student vypadá takhle:

```js
{ name: 'Adéla Nováková', className: '2.A', grades: [1, 2, 1, 1] }
```

Známky jsou jako ve škole: `1` je nejlepší, `5` je nedostatečná. Pole `grades` může být prázdné — student zatím nemá žádnou známku.

**Obecné pravidlo:** žádná funkce nesmí změnit pole ani objekty, které dostane.

### Požadavky

1. `average(grades)` vrátí průměr čísel v poli zaokrouhlený na dvě desetinná místa (`[1, 2, 2]` → `1.67`). Výsledek je **číslo**, ne text — pozor, `toFixed` vrací řetězec. Pro prázdné pole vrátí `null` — průměr z ničeho neexistuje.
2. `studentAverages(students)` vrátí pole objektů `{ name, average }` ve stejném pořadí jako studenti. Student bez známek má `average: null`.
3. `bestStudent(students)` vrátí celý objekt studenta s **nejlepším** (nejnižším) průměrem. Studenty bez známek nepočítá. Když mají dva stejný průměr, vyhrává ten, který je v poli dřív. Když nemá známky nikdo (nebo je pole prázdné), vrátí `undefined`.
4. `failingNames(students)` vrátí jména studentů, kteří mají **aspoň jednu pětku**, ve stejném pořadí.
5. `honorRoll(students)` vrátí jména studentů s vyznamenáním: mají aspoň jednu známku, průměr **nejvýš 1,5** a **žádnou známku horší než 2**.
6. `namesByClass(students)` vrátí objekt, kde klíčem je třída a hodnotou pole jmen jejích studentů (`{ '2.A': ['Adéla Nováková', …], '2.B': […] }`).
7. `gradeCounts(students)` vrátí objekt s počty jednotlivých známek přes všechny studenty (`{ 1: 5, 2: 3, 5: 1 }`). Známky, které nikdo nedostal, ve výsledku nejsou.
8. `ranking(students)` vrátí **nové** pole studentů seřazené podle průměru od nejlepšího. Při stejném průměru rozhoduje jméno podle české abecedy. Studenti bez známek jsou na konci (mezi sebou taky podle jména).
9. `classAverages(students)` vrátí objekt, kde klíčem je třída a hodnotou průměr **všech známek** jejích studentů, zaokrouhlený na dvě desetinná místa. Pozor: není to průměr průměrů — student s deseti známkami váží víc než student se dvěma. Třída, ve které nikdo nemá známku, má `null`.

Na konci si výsledky klidně vypiš do konzole přes `console.log` a zkontroluj je očima proti datům.

# --hints--

`average` vrátí průměr zaokrouhlený na dvě desetinná místa.

```js
assert.equal(typeof average([1, 2, 2]), 'number', 'average má vracet číslo, ne text');
assert.equal(average([1, 2, 2]), 1.67);
assert.equal(average([3]), 3);
assert.equal(average([1, 2]), 1.5);
```

`average` vrátí pro prázdné pole `null`.

```js
assert.equal(average([]), null);
```

`studentAverages` vrátí `{ name, average }` pro každého studenta ve stejném pořadí, bez známek s `average: null`.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [2, 3] },
  { name: 'Lucie', className: '1.A', grades: [] },
  { name: 'Marek', className: '1.B', grades: [1, 1, 2] },
];
assert.deepEqual(studentAverages(students), [
  { name: 'Karel', average: 2.5 },
  { name: 'Lucie', average: null },
  { name: 'Marek', average: 1.33 },
]);
```

`bestStudent` vrátí objekt studenta s nejnižším průměrem a studenty bez známek přeskočí.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [2, 3] },
  { name: 'Lucie', className: '1.A', grades: [] },
  { name: 'Marek', className: '1.B', grades: [1, 1, 2] },
  { name: 'Nina', className: '1.B', grades: [2, 2] },
];
assert.equal(bestStudent(students), students[2], 'nejlepší je Marek (1.33)');
```

`bestStudent` při shodě průměrů vrátí toho, kdo je v poli dřív.

```js
// Radek je v poli před Pavlou, ale podle abecedy až za ní — vyhrát má pořadí v poli.
const students = [
  { name: 'Ota', className: '1.A', grades: [3, 3] },
  { name: 'Radek', className: '1.B', grades: [1, 2] },
  { name: 'Pavla', className: '1.A', grades: [2, 1] },
];
assert.equal(bestStudent(students), students[1], 'Radek i Pavla mají 1.5, vyhrává Radek, který je v poli dřív');
```

`bestStudent` vrátí `undefined`, když nikdo nemá známky nebo je pole prázdné.

```js
assert.equal(bestStudent([]), undefined);
assert.equal(bestStudent([{ name: 'Lucie', className: '1.A', grades: [] }]), undefined);
```

`failingNames` vrátí jména studentů s aspoň jednou pětkou ve stejném pořadí.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [2, 5] },
  { name: 'Lucie', className: '1.A', grades: [4, 4] },
  { name: 'Marek', className: '1.B', grades: [5] },
  { name: 'Nina', className: '1.B', grades: [] },
];
assert.deepEqual(failingNames(students), ['Karel', 'Marek']);
```

`honorRoll` vrátí jména studentů s průměrem nejvýš 1,5 a bez známky horší než 2.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1, 2] },
  { name: 'Lucie', className: '1.A', grades: [1, 1, 3] },
  { name: 'Marek', className: '1.B', grades: [2, 2, 1] },
  { name: 'Nina', className: '1.B', grades: [] },
  { name: 'Ota', className: '1.B', grades: [1] },
  { name: 'Petr', className: '1.B', grades: [1, 1, 1, 3] },
];
assert.deepEqual(honorRoll(students), ['Karel', 'Ota'], 'Vyznamenání mají jen Karel a Ota: Lucie a Marek mají horší průměr, Nina nemá žádnou známku a Petr má sice průměr 1.5, ale i trojku');
```

`namesByClass` vrátí pro každou třídu pole jmen jejích studentů.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1] },
  { name: 'Marek', className: '1.B', grades: [2] },
  { name: 'Lucie', className: '1.A', grades: [] },
];
const result = namesByClass(students);
assert.deepEqual(Object.keys(result).sort(), ['1.A', '1.B']);
assert.deepEqual(result['1.A'], ['Karel', 'Lucie']);
assert.deepEqual(result['1.B'], ['Marek']);
```

`gradeCounts` spočítá jednotlivé známky přes všechny studenty a neuvádí známky, které nikdo nemá.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1, 2, 1] },
  { name: 'Lucie', className: '1.A', grades: [] },
  { name: 'Marek', className: '1.B', grades: [5, 1] },
];
const result = gradeCounts(students);
assert.deepEqual(Object.keys(result).sort(), ['1', '2', '5']);
assert.equal(result[1], 3);
assert.equal(result[2], 1);
assert.equal(result[5], 1);
```

`ranking` seřadí studenty podle průměru od nejlepšího, při shodě podle jména česky, studenty bez známek dá na konec.

```js
const students = [
  { name: 'Zora', className: '1.A', grades: [] },
  { name: 'Čeněk', className: '1.A', grades: [2, 1] },
  { name: 'Hana', className: '1.B', grades: [3] },
  { name: 'Adam', className: '1.B', grades: [] },
  { name: 'Cyril', className: '1.B', grades: [1, 2] },
  { name: 'Iva', className: '1.A', grades: [1] },
];
assert.deepEqual(ranking(students).map((s) => s.name), ['Iva', 'Cyril', 'Čeněk', 'Hana', 'Adam', 'Zora']);
```

`ranking` vrací nové pole a původní pole nechá v původním pořadí.

```js
const students = [
  { name: 'Hana', className: '1.B', grades: [3] },
  { name: 'Iva', className: '1.A', grades: [1] },
];
const result = ranking(students);
assert.deepEqual(students.map((s) => s.name), ['Hana', 'Iva'], 'původní pole se nesmí přerovnat');
assert.notEqual(result, students, 'výsledek má být nové pole');
```

`classAverages` vrátí pro každou třídu průměr všech známek jejích studentů (ne průměr průměrů).

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1, 1, 1, 1] },
  { name: 'Lucie', className: '1.A', grades: [3, 3] },
  { name: 'Marek', className: '1.B', grades: [2, 3] },
];
const result = classAverages(students);
assert.deepEqual(Object.keys(result).sort(), ['1.A', '1.B']);
assert.equal(result['1.A'], 1.67, '1.A: (1+1+1+1+3+3) / 6 = 1.67');
assert.equal(result['1.B'], 2.5);
```

`classAverages` dá třídě, ve které nikdo nemá známku, hodnotu `null`.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [2] },
  { name: 'Lucie', className: '1.C', grades: [] },
];
const result = classAverages(students);
assert.equal(result['1.A'], 2);
assert.ok('1.C' in result, 'třída 1.C ve výsledku chybí');
assert.equal(result['1.C'], null);
```

Žádná z funkcí nezmění pole studentů ani objekty v něm.

```js
const students = [
  { name: 'Hana', className: '1.B', grades: [3, 1] },
  { name: 'Iva', className: '1.A', grades: [1, 5] },
  { name: 'Adam', className: '1.A', grades: [] },
];
const before = JSON.stringify(students);
studentAverages(students);
bestStudent(students);
failingNames(students);
honorRoll(students);
namesByClass(students);
gradeCounts(students);
ranking(students);
classAverages(students);
assert.equal(JSON.stringify(students), before, 'některá funkce změnila vstupní data');
```

# --seed--

## --file-- script.js

```js
// Třídní známky za pololetí. Známka 1 je nejlepší, 5 nedostatečná.
const students = [
  { name: 'Adéla Nováková', className: '2.A', grades: [1, 2, 1, 1] },
  { name: 'Bohdan Černý', className: '2.A', grades: [3, 2, 4, 5] },
  { name: 'Česlava Malá', className: '2.B', grades: [1, 1, 2] },
  { name: 'David Horák', className: '2.B', grades: [2, 3, 2, 2, 3] },
  { name: 'Eliška Veselá', className: '2.A', grades: [] },
  { name: 'Filip Chalupa', className: '2.B', grades: [5, 4, 3] },
];

--edit--

--edit--
```

# --solution--

## --file-- script.js

```js
// Třídní známky za pololetí. Známka 1 je nejlepší, 5 nedostatečná.
const students = [
  { name: 'Adéla Nováková', className: '2.A', grades: [1, 2, 1, 1] },
  { name: 'Bohdan Černý', className: '2.A', grades: [3, 2, 4, 5] },
  { name: 'Česlava Malá', className: '2.B', grades: [1, 1, 2] },
  { name: 'David Horák', className: '2.B', grades: [2, 3, 2, 2, 3] },
  { name: 'Eliška Veselá', className: '2.A', grades: [] },
  { name: 'Filip Chalupa', className: '2.B', grades: [5, 4, 3] },
];

// Zaokrouhlí číslo na dvě desetinná místa.
function roundTwo(value) {
  return Math.round(value * 100) / 100;
}

// Průměr čísel, u prázdného pole null.
function average(grades) {
  if (grades.length === 0) {
    return null;
  }
  const sum = grades.reduce((total, grade) => total + grade, 0);
  return roundTwo(sum / grades.length);
}

function studentAverages(students) {
  return students.map(({ name, grades }) => ({ name, average: average(grades) }));
}

function bestStudent(students) {
  return students
    .filter((student) => student.grades.length > 0)
    .reduce((best, student) => {
      if (best === undefined || average(student.grades) < average(best.grades)) {
        return student;
      }
      return best;
    }, undefined);
}

function failingNames(students) {
  return students
    .filter((student) => student.grades.includes(5))
    .map((student) => student.name);
}

function honorRoll(students) {
  return students
    .filter(({ grades }) => grades.length > 0 && average(grades) <= 1.5 && grades.every((grade) => grade <= 2))
    .map((student) => student.name);
}

function namesByClass(students) {
  return students.reduce((classes, { name, className }) => {
    classes[className] = [...(classes[className] ?? []), name];
    return classes;
  }, {});
}

function gradeCounts(students) {
  const counts = {};
  for (const { grades } of students) {
    for (const grade of grades) {
      counts[grade] = (counts[grade] ?? 0) + 1;
    }
  }
  return counts;
}

// Porovnávací funkce: nejlepší průměr první, bez známek na konec, při shodě podle jména.
function compareStudents(a, b) {
  const averageA = average(a.grades);
  const averageB = average(b.grades);
  if (averageA !== averageB) {
    if (averageA === null) return 1;
    if (averageB === null) return -1;
    return averageA - averageB;
  }
  return a.name.localeCompare(b.name, 'cs');
}

function ranking(students) {
  return students.toSorted(compareStudents);
}

// Nejdřív posbírá všechny známky každé třídy, pak z nich spočítá průměr.
function classAverages(students) {
  const gradesByClass = {};
  for (const { className, grades } of students) {
    gradesByClass[className] = [...(gradesByClass[className] ?? []), ...grades];
  }
  const result = {};
  for (const className of Object.keys(gradesByClass)) {
    result[className] = average(gradesByClass[className]);
  }
  return result;
}

console.log(studentAverages(students));
console.log('Nejlepší:', bestStudent(students).name);
console.log('Pořadí:', ranking(students).map((student) => student.name));
console.log('Průměry tříd:', classAverages(students));
```
