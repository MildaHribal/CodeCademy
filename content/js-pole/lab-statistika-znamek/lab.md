---
title: Statistika známek
runtime: js
see: js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci
---

# --description--

Třídní učitelka chce na konci pololetí rychlý přehled o svých dvou třídách. Známky má v poli studentů a potřebuje funkce, které z nich přehled spočítají. Tentokrát bez návodu — o postupu rozhoduješ sám. Používej, co ses naučil: metody pole, `reduce`, řazení, spread. Pomocné funkce si klidně přidej.

V `script.js` jsou ukázková data a prázdné kostry funkcí s popisem. Každý student vypadá takhle:

```js
{ name: 'Adéla Nováková', className: '2.A', grades: [1, 2, 1, 1] }
```

Známky jsou jako ve škole: `1` je nejlepší, `5` je nedostatečná. Pole `grades` může být prázdné — student zatím nemá žádnou známku.

Co učitelka od přehledu chce:

- U každého studenta vidí jeho průměr, u studenta bez známek prázdné místo.
- Ví, kdo má nejlepší průměr, a kdo propadá, protože má aspoň jednu pětku.
- Před vysvědčením si vytiskne, kdo dostane vyznamenání.
- Vidí studenty rozdělené podle tříd a kolikrát která známka padla.
- Porovná třídy mezi sebou podle průměru a seřadí studenty od nejlepšího.

Přesné požadavky jsou v seznamu kontrol. Jedno pravidlo platí pro všechny:

> [!REMEMBER]
> **Žádná funkce nesmí změnit pole ani objekty, které dostane.**

Na konci si výsledky klidně vypiš do konzole a zkontroluj je očima proti datům.

# --hints--

`average(grades)` vrátí průměr známek jako **číslo** zaokrouhlené na dvě desetinná místa (`toFixed` vrací text).

```js
assert.equal(typeof average([1, 2, 2]), 'number', 'average([1, 2, 2]) má vrátit číslo (pozor: toFixed vrací text)');
assert.equal(average([1, 2, 2]), 1.67, 'average([1, 2, 2]) má vrátit 1.67 (5 / 3 zaokrouhleno na dvě místa)');
assert.equal(average([3]), 3, 'average([3]) má vrátit 3');
assert.equal(average([1, 2]), 1.5, 'average([1, 2]) má vrátit 1.5');
```

`average([])` vrátí `null` — průměr z ničeho neexistuje.

```js
assert.equal(average([]), null, 'average([]) má vrátit null');
```

`studentAverages(students)` vrátí pole objektů `{ name, average }` ve stejném pořadí jako studenti; student bez známek má `average: null`.

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
], 'studentAverages([Karel [2, 3], Lucie [], Marek [1, 1, 2]]) má vrátit průměry 2.5, null a 1.33');
```

`bestStudent(students)` vrátí celý objekt studenta s nejlepším (nejnižším) průměrem a studenty bez známek nepočítá.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [2, 3] },
  { name: 'Lucie', className: '1.A', grades: [] },
  { name: 'Marek', className: '1.B', grades: [1, 1, 2] },
  { name: 'Nina', className: '1.B', grades: [2, 2] },
];
const marek = students[2];
assert.equal(bestStudent(students), marek, 'bestStudent([Karel 2.5, Lucie bez známek, Marek 1.33, Nina 2]) má vrátit objekt Marka');
```

`bestStudent` při shodě průměrů vrátí toho, kdo je v poli dřív.

```js
const students = [
  { name: 'Ota', className: '1.A', grades: [3, 3] },
  { name: 'Radek', className: '1.B', grades: [1, 2] },
  { name: 'Pavla', className: '1.A', grades: [2, 1] },
];
const radek = students[1];
assert.equal(bestStudent(students), radek, 'bestStudent([Ota 3, Radek 1.5, Pavla 1.5]) má vrátit Radka — je v poli před Pavlou, i když podle abecedy je až za ní');
```

`bestStudent` vrátí `undefined`, když nikdo nemá známky nebo je pole prázdné.

```js
assert.equal(bestStudent([]), undefined, 'bestStudent([]) má vrátit undefined');
assert.equal(bestStudent([{ name: 'Lucie', className: '1.A', grades: [] }]), undefined, 'bestStudent([Lucie bez známek]) má vrátit undefined');
```

`failingNames(students)` vrátí jména studentů, kteří mají aspoň jednu pětku, ve stejném pořadí.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [2, 5] },
  { name: 'Lucie', className: '1.A', grades: [4, 4] },
  { name: 'Marek', className: '1.B', grades: [5] },
  { name: 'Nina', className: '1.B', grades: [] },
];
assert.deepEqual(failingNames(students), ['Karel', 'Marek'], "failingNames([Karel [2, 5], Lucie [4, 4], Marek [5], Nina []]) má vrátit ['Karel', 'Marek']");
```

`honorRoll(students)` vrátí jména studentů s vyznamenáním: mají aspoň jednu známku, průměr nejvýš 1,5 a žádnou známku horší než 2.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1, 2] },
  { name: 'Lucie', className: '1.A', grades: [1, 1, 3] },
  { name: 'Marek', className: '1.B', grades: [2, 2, 1] },
  { name: 'Nina', className: '1.B', grades: [] },
  { name: 'Ota', className: '1.B', grades: [1] },
  { name: 'Petr', className: '1.B', grades: [1, 1, 1, 3] },
];
assert.deepEqual(honorRoll(students), ['Karel', 'Ota'], "honorRoll má vrátit ['Karel', 'Ota']: Lucie má trojku, Marek průměr 1.67, Nina žádnou známku a Petr sice průměr 1.5, ale i trojku");
```

`namesByClass(students)` vrátí objekt, kde klíčem je třída a hodnotou pole jmen jejích studentů ve stejném pořadí.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1] },
  { name: 'Marek', className: '1.B', grades: [2] },
  { name: 'Lucie', className: '1.A', grades: [] },
];
const result = namesByClass(students);
assert.deepEqual(Object.keys(result).sort(), ['1.A', '1.B'], 'namesByClass([Karel 1.A, Marek 1.B, Lucie 1.A]) má mít klíče 1.A a 1.B');
assert.deepEqual(result['1.A'], ['Karel', 'Lucie'], "namesByClass(…)['1.A'] má být ['Karel', 'Lucie']");
assert.deepEqual(result['1.B'], ['Marek'], "namesByClass(…)['1.B'] má být ['Marek']");
```

`gradeCounts(students)` vrátí objekt s počty jednotlivých známek přes všechny studenty; známky, které nikdo nedostal, ve výsledku nejsou.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1, 2, 1] },
  { name: 'Lucie', className: '1.A', grades: [] },
  { name: 'Marek', className: '1.B', grades: [5, 1] },
];
const result = gradeCounts(students);
assert.deepEqual(Object.keys(result).sort(), ['1', '2', '5'], 'gradeCounts([Karel [1, 2, 1], Lucie [], Marek [5, 1]]) má mít klíče jen pro známky 1, 2 a 5');
assert.equal(result[1], 3, 'gradeCounts(…)[1] má být 3 — jedničky mají Karel dvě a Marek jednu');
assert.equal(result[2], 1, 'gradeCounts(…)[2] má být 1');
assert.equal(result[5], 1, 'gradeCounts(…)[5] má být 1');
```

`ranking(students)` vrátí nové pole studentů seřazené podle průměru od nejlepšího; při shodě podle jména podle české abecedy; studenti bez známek jsou na konci, mezi sebou taky podle jména.

```js
const students = [
  { name: 'Zora', className: '1.A', grades: [] },
  { name: 'Čeněk', className: '1.A', grades: [2, 1] },
  { name: 'Hana', className: '1.B', grades: [3] },
  { name: 'Adam', className: '1.B', grades: [] },
  { name: 'Cyril', className: '1.B', grades: [1, 2] },
  { name: 'Iva', className: '1.A', grades: [1] },
];
assert.deepEqual(
  ranking(students).map((student) => student.name),
  ['Iva', 'Cyril', 'Čeněk', 'Hana', 'Adam', 'Zora'],
  'ranking má vrátit pořadí Iva (1), Cyril a Čeněk (1.5, podle abecedy), Hana (3), pak bez známek Adam a Zora',
);
```

`ranking` vrací nové pole a původní pole nechá v původním pořadí.

```js
const students = [
  { name: 'Hana', className: '1.B', grades: [3] },
  { name: 'Iva', className: '1.A', grades: [1] },
];
const result = ranking(students);
assert.deepEqual(students.map((student) => student.name), ['Hana', 'Iva'], 'ranking([Hana, Iva]) nesmí přerovnat původní pole');
assert.notEqual(result, students, 'ranking má vrátit nové pole, ne původní pole students');
```

`classAverages(students)` vrátí objekt, kde klíčem je třída a hodnotou průměr **všech známek** jejích studentů zaokrouhlený na dvě místa — ne průměr průměrů.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [1, 1, 1, 1] },
  { name: 'Lucie', className: '1.A', grades: [3, 3] },
  { name: 'Marek', className: '1.B', grades: [2, 3] },
];
const result = classAverages(students);
assert.deepEqual(Object.keys(result).sort(), ['1.A', '1.B'], 'classAverages má mít klíče 1.A a 1.B');
assert.equal(result['1.A'], 1.67, "classAverages(…)['1.A'] má být 1.67 = (1 + 1 + 1 + 1 + 3 + 3) / 6; průměr průměrů by dal 2");
assert.equal(result['1.B'], 2.5, "classAverages(…)['1.B'] má být 2.5");
```

`classAverages` dá třídě, ve které nikdo nemá známku, hodnotu `null`.

```js
const students = [
  { name: 'Karel', className: '1.A', grades: [2] },
  { name: 'Lucie', className: '1.C', grades: [] },
];
const result = classAverages(students);
assert.equal(result['1.A'], 2, "classAverages([Karel 1.A [2], Lucie 1.C []])['1.A'] má být 2");
assert.ok('1.C' in result, 've výsledku classAverages chybí třída 1.C — třída bez známek tam má být s hodnotou null');
assert.equal(result['1.C'], null, "classAverages(…)['1.C'] má být null");
```

Žádná z funkcí nezmění pole studentů ani objekty v něm.

```js
const students = [
  { name: 'Hana', className: '1.B', grades: [3, 1] },
  { name: 'Iva', className: '1.A', grades: [1, 5] },
  { name: 'Adam', className: '1.A', grades: [] },
];
const before = JSON.stringify(students);
const calls = { studentAverages, bestStudent, failingNames, honorRoll, namesByClass, gradeCounts, ranking, classAverages };
for (const [name, fn] of Object.entries(calls)) {
  fn(students);
  assert.equal(JSON.stringify(students), before, `${name}(students) změnila vstupní data — pole nebo objekty studentů`);
}
```

# --help--

## --tip-- 11

Porovnávací funkce pro `ranking` má tři větve: oba studenti mají průměr → rozdíl průměrů; jeden je bez známek (`null`) → ten patří dozadu; průměry se shodují → `localeCompare` s jazykem `'cs'`. Viz [Řazení a porovnávací funkce](see:js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce).

## --tip-- 13

Průměr všech známek třídy neznamená zprůměrovat průměry studentů. Nejdřív posbírej **všechny známky** každé třídy do jednoho pole (třeba objekt „třída → pole známek") a teprve z něj spočítej průměr funkcí `average`, kterou už máš.

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

/**
 * Průměr známek zaokrouhlený na dvě desetinná místa.
 * @param {number[]} grades známky
 * @returns {number | null} průměr jako číslo, u prázdného pole null
 */
function average(grades) {
}

/**
 * Průměr každého studenta ve stejném pořadí.
 * @param {object[]} students
 * @returns {{ name: string, average: number | null }[]}
 */
function studentAverages(students) {
}

/**
 * Student s nejnižším průměrem; studenti bez známek se nepočítají, při shodě vyhrává dřívější.
 * @param {object[]} students
 * @returns {object | undefined} objekt studenta, nebo undefined
 */
function bestStudent(students) {
}

/**
 * Jména studentů s aspoň jednou pětkou.
 * @param {object[]} students
 * @returns {string[]}
 */
function failingNames(students) {
}

/**
 * Jména studentů s vyznamenáním (průměr nejvýš 1,5, žádná známka horší než 2).
 * @param {object[]} students
 * @returns {string[]}
 */
function honorRoll(students) {
}

/**
 * Jména studentů po třídách.
 * @param {object[]} students
 * @returns {Object<string, string[]>} třída → jména
 */
function namesByClass(students) {
}

/**
 * Kolikrát která známka padla přes všechny studenty.
 * @param {object[]} students
 * @returns {Object<string, number>} známka → počet
 */
function gradeCounts(students) {
}

/**
 * Nové pole studentů od nejlepšího průměru; při shodě podle jména, bez známek na konci.
 * @param {object[]} students
 * @returns {object[]}
 */
function ranking(students) {
}

/**
 * Průměr všech známek každé třídy (ne průměr průměrů), třída bez známek null.
 * @param {object[]} students
 * @returns {Object<string, number | null>} třída → průměr
 */
function classAverages(students) {
}

console.log(studentAverages(students));
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
  return students
    .flatMap((student) => student.grades)
    .reduce((counts, grade) => {
      counts[grade] = (counts[grade] ?? 0) + 1;
      return counts;
    }, {});
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
  const gradesByClass = students.reduce((classes, { className, grades }) => {
    classes[className] = [...(classes[className] ?? []), ...grades];
    return classes;
  }, {});
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

# --approaches--

## --approach-- Cykly for…of

Každá funkce projde pole jedním cyklem a výsledek skládá v proměnné. Nejvíc řádků, ale nejsnáz se krokuje v debuggeru a v jednom průchodu jde počítat víc věcí najednou (třeba součet i počet). Hodí se, když podmínky uvnitř bobtnají nebo potřebuješ `break`.

### --file-- script.js

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

function average(grades) {
  if (grades.length === 0) return null;
  let sum = 0;
  for (const grade of grades) {
    sum += grade;
  }
  return Math.round((sum / grades.length) * 100) / 100;
}

function studentAverages(students) {
  const result = [];
  for (const student of students) {
    result.push({ name: student.name, average: average(student.grades) });
  }
  return result;
}

function bestStudent(students) {
  let best;
  let bestAverage = Infinity;
  for (const student of students) {
    const current = average(student.grades);
    if (current !== null && current < bestAverage) {
      best = student;
      bestAverage = current;
    }
  }
  return best;
}

function failingNames(students) {
  const names = [];
  for (const student of students) {
    if (student.grades.includes(5)) names.push(student.name);
  }
  return names;
}

function honorRoll(students) {
  const names = [];
  for (const { name, grades } of students) {
    const current = average(grades);
    if (current === null || current > 1.5) continue;
    let allGood = true;
    for (const grade of grades) {
      if (grade > 2) allGood = false;
    }
    if (allGood) names.push(name);
  }
  return names;
}

function namesByClass(students) {
  const classes = {};
  for (const { name, className } of students) {
    if (!(className in classes)) classes[className] = [];
    classes[className].push(name);
  }
  return classes;
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

function ranking(students) {
  const withGrades = [];
  const withoutGrades = [];
  for (const student of students) {
    if (student.grades.length > 0) withGrades.push(student);
    else withoutGrades.push(student);
  }
  const byName = (a, b) => a.name.localeCompare(b.name, 'cs');
  withGrades.sort((a, b) => average(a.grades) - average(b.grades) || byName(a, b));
  withoutGrades.sort(byName);
  return [...withGrades, ...withoutGrades];
}

function classAverages(students) {
  const gradesByClass = {};
  for (const { className, grades } of students) {
    if (!(className in gradesByClass)) gradesByClass[className] = [];
    for (const grade of grades) gradesByClass[className].push(grade);
  }
  const result = {};
  for (const className in gradesByClass) {
    result[className] = average(gradesByClass[className]);
  }
  return result;
}

console.log(studentAverages(students));
```

## --approach-- Object.groupBy a Math.min

Kratší zápis s hotovými funkcemi jazyka: `Object.groupBy` rozdělí studenty do tříd, `Math.min(...průměry)` najde nejlepší průměr a `Object.fromEntries` složí výsledný objekt. Čte se dobře, když ty funkce znáš. `Math.min(...pole)` ale na obřích polích (statisíce položek) narazí na limit počtu argumentů.

### --file-- script.js

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

const sum = (numbers) => numbers.reduce((total, n) => total + n, 0);

function average(grades) {
  return grades.length ? Math.round((sum(grades) / grades.length) * 100) / 100 : null;
}

const studentAverages = (students) => students.map(({ name, grades }) => ({ name, average: average(grades) }));

function bestStudent(students) {
  const graded = students.filter(({ grades }) => grades.length > 0);
  if (graded.length === 0) return undefined;
  const lowest = Math.min(...graded.map(({ grades }) => average(grades)));
  return graded.find(({ grades }) => average(grades) === lowest);
}

const failingNames = (students) => students.filter(({ grades }) => grades.includes(5)).map(({ name }) => name);

const honorRoll = (students) =>
  students
    .filter(({ grades }) => grades.length > 0 && Math.max(...grades) <= 2 && average(grades) <= 1.5)
    .map(({ name }) => name);

function namesByClass(students) {
  const groups = Object.groupBy(students, ({ className }) => className);
  return Object.fromEntries(Object.entries(groups).map(([className, members]) => [className, members.map(({ name }) => name)]));
}

function gradeCounts(students) {
  const groups = Object.groupBy(students.flatMap(({ grades }) => grades), (grade) => grade);
  return Object.fromEntries(Object.entries(groups).map(([grade, list]) => [grade, list.length]));
}

function ranking(students) {
  return students.toSorted((a, b) => {
    const [first, second] = [average(a.grades), average(b.grades)];
    if (first === second) return a.name.localeCompare(b.name, 'cs');
    if (first === null) return 1;
    if (second === null) return -1;
    return first - second;
  });
}

function classAverages(students) {
  const groups = Object.groupBy(students, ({ className }) => className);
  return Object.fromEntries(
    Object.entries(groups).map(([className, members]) => [className, average(members.flatMap(({ grades }) => grades))]),
  );
}

console.log(studentAverages(students));
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Průměr počítá jediná funkce `average` a ostatní funkce ji volají, místo aby průměr počítaly znovu.
- Žádná funkce nevolá `sort`, `push` ani `splice` na poli, které dostala v parametru.
- Porovnávací funkce pro `ranking` se dá přečíst bez komentáře (pojmenované proměnné, jasné větve).
- Jména pomocných funkcí a proměnných říkají, co obsahují (`gradesByClass`, ne `obj`).
- Víš, který z přístupů bys zvolil příště a proč.

## --extensions--

Vypiš přehled do konzole jako tabulku přes `console.table(studentAverages(students))`; přidej funkci `improvement(before, after)`, která porovná dvě pololetí a vrátí jména studentů, kteří si zlepšili průměr aspoň o půl stupně.
