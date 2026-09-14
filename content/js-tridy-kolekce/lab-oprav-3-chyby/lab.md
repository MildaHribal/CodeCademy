---
title: Oprav 3 chyby
runtime: js
kind: debug
see: js-tridy-kolekce/prototypy#retez-prototypu, js-tridy-kolekce/tridy#getter-se-stejnym-jmenem-jako-vlastnost, js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this
---

# --description--

Kolega napsal pro fitness studio Pohyb v Brně `script.js` s rezervacemi lekcí, registrací členů a newsletterem a odjel na dovolenou. Z provozu přišla tři hlášení. Chyby spolu nesouvisejí — každá je v jiné části souboru a každá odpovídá jedné pasti z lekcí o třídách a prototypech.

## Hlášení

- **Rezervace.** Když se Eva Dvořáková zapíše na jógu, objeví se na seznamu přihlášených i u kruhového tréninku a pilates. A jakmile je v celém studiu dvanáct rezervací, hlásí se plno u všech lekcí najednou.
- **Registrace členů.** Založení člena `new Member('Eva Dvořáková', ' Eva.Dvorakova@Seznam.cz ')` spadne s hláškou `RangeError: Maximum call stack size exceeded`. E-mail se má uložit malými písmeny a bez mezer okolo.
- **Newsletter.** `newsletter.greetings(members)` má vrátit oslovení pro všechny členy, ale skončí `TypeError: Cannot read properties of undefined (reading 'studioName')`. Jedno oslovení přes `newsletter.greeting(member)` přitom funguje.

Funkce `book` počítá kapacitu a duplicity správně a ostatní části na ni spoléhají.

## Úkol

Oprav všechny tři chyby. U každé změň co nejmenší kus kódu a zkontroluj, že zbytek funguje dál. Každá chyba má v seznamu kontrol vlastní požadavky.

# --hints--

Zápis na jednu lekci se neobjeví u jiné lekce.

```js
const yoga = createLesson('Jóga', '2026-09-21T18:00');
const pilates = createLesson('Pilates', '2026-09-23T17:30');
book(yoga, 'Eva Dvořáková');
assert.deepEqual(yoga.attendees, ['Eva Dvořáková'], "po book(jóga, 'Eva Dvořáková') má jóga mít přihlášenou Evu");
assert.deepEqual(pilates.attendees, [], "book(jóga, 'Eva Dvořáková') nesmí Evu zapsat i na pilates — má každá lekce vlastní pole attendees?");
```

Plná lekce nezaplní ostatní lekce.

```js
const yoga = createLesson('Jóga', '2026-09-21T18:00');
const circuit = createLesson('Kruhový trénink', '2026-09-22T07:00');
for (let i = 1; i <= 12; i += 1) {
  book(yoga, `Člen ${i}`);
}
assert.equal(book(yoga, 'Petr Svoboda'), false, 'třináctá rezervace na jógu s kapacitou 12 má vrátit false');
assert.equal(book(circuit, 'Petr Svoboda'), true, 'kruhový trénink je prázdný, rezervace na něj má vrátit true i po zaplnění jógy');
```

Nová lekce má název, začátek, kapacitu `12` a nikoho přihlášeného.

```js
const lesson = createLesson('Pilates', '2026-09-23T17:30');
assert.equal(lesson.title, 'Pilates', "createLesson('Pilates', …).title má být 'Pilates'");
assert.equal(lesson.start, '2026-09-23T17:30', "createLesson(…, '2026-09-23T17:30').start má být '2026-09-23T17:30'");
assert.equal(lesson.capacity, 12, 'nová lekce má mít kapacitu 12');
assert.equal(lesson.attendees.length, 0, 'nová lekce nemá mít nikoho přihlášeného');
```

`book` odmítne dvojí zápis téhož člena na jednu lekci.

```js
const lesson = createLesson('Pilates', '2026-09-23T17:30');
assert.equal(book(lesson, 'Jan Novák'), true, "první book(pilates, 'Jan Novák') má vrátit true");
assert.equal(book(lesson, 'Jan Novák'), false, "druhý book(pilates, 'Jan Novák') má vrátit false — Jan už je zapsaný");
```

`new Member('Eva Dvořáková', ' Eva.Dvorakova@Seznam.cz ')` uloží jméno a e-mail malými písmeny bez mezer.

```js
const member = new Member('Eva Dvořáková', ' Eva.Dvorakova@Seznam.cz ');
assert.equal(member.name, 'Eva Dvořáková', "member.name má být 'Eva Dvořáková'");
assert.equal(member.email, 'eva.dvorakova@seznam.cz', "member.email má být 'eva.dvorakova@seznam.cz' — malými písmeny a bez mezer");
```

Změna e-mailu přes `member.email = …` ho znovu upraví.

```js
const member = new Member('Jan Novák', 'jan.novak@email.cz');
member.email = '  JAN@Novak.CZ';
assert.equal(member.email, 'jan@novak.cz', "po member.email = '  JAN@Novak.CZ' má member.email být 'jan@novak.cz'");
```

`greetings(members)` vrátí oslovení pro všechny členy v pořadí.

```js
const newsletter = new Newsletter('Studio Pohyb');
const members = [{ name: 'Eva Dvořáková' }, { name: 'Jan Novák' }];
assert.deepEqual(newsletter.greetings(members), ['Studio Pohyb zdraví: Eva Dvořáková', 'Studio Pohyb zdraví: Jan Novák'], "greetings([Eva, Jan]) má vrátit ['Studio Pohyb zdraví: Eva Dvořáková', 'Studio Pohyb zdraví: Jan Novák']");
```

`greeting(member)` pro jednoho člena funguje dál a každý newsletter používá svůj název studia.

```js
const brno = new Newsletter('Studio Pohyb');
const olomouc = new Newsletter('Pohyb Olomouc');
assert.equal(brno.greeting({ name: 'Eva Dvořáková' }), 'Studio Pohyb zdraví: Eva Dvořáková', "greeting(Eva) má vrátit 'Studio Pohyb zdraví: Eva Dvořáková'");
assert.deepEqual(olomouc.greetings([{ name: 'Jan Novák' }]), ['Pohyb Olomouc zdraví: Jan Novák'], "greetings druhého newsletteru má použít jeho název 'Pohyb Olomouc'");
```

# --help--

## --tip--

Každé hlášení odpovídá jedné pasti: [sdílené pole v prototypu](see:js-tridy-kolekce/prototypy#retez-prototypu), [getter se stejným jménem jako vlastnost](see:js-tridy-kolekce/tridy#getter-se-stejnym-jmenem-jako-vlastnost) (u setteru platí totéž) a [metoda předaná jako callback](see:js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this). Nejdřív ke každému hlášení najdi místo v kódu, pak past.

## --tip--

U rezervací si pod kód vypiš `Object.hasOwn(yoga, 'attendees')` a sleduj, kde pole přihlášených ve skutečnosti leží. U registrace si rozmysli, co udělá `this.email = …` uvnitř setteru `email`.

# --seed--

## --file-- script.js

```js
// Rezervační systém studia Pohyb v Brně. Kolega ho dopsal před dovolenou.

// Výchozí hodnoty každé lekce.
const LESSON_DEFAULTS = {
  capacity: 12,
  attendees: [],
};

// Vytvoří lekci s názvem a časem začátku.
function createLesson(title, start) {
  const lesson = Object.create(LESSON_DEFAULTS);
  lesson.title = title;
  lesson.start = start;
  return lesson;
}

// Zapíše člena na lekci. Vrátí false, když je plno nebo už je zapsaný.
function book(lesson, memberName) {
  if (lesson.attendees.length >= lesson.capacity || lesson.attendees.includes(memberName)) {
    return false;
  }
  lesson.attendees.push(memberName);
  return true;
}

class Member {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  // E-mail ukládáme vždy malými písmeny a bez mezer okolo.
  set email(value) {
    this.email = value.trim().toLowerCase();
  }

  get email() {
    return this.email;
  }
}

class Newsletter {
  constructor(studioName) {
    this.studioName = studioName;
  }

  // Oslovení do hlavičky e-mailu.
  greeting(member) {
    return `${this.studioName} zdraví: ${member.name}`;
  }

  // Oslovení pro všechny příjemce.
  greetings(members) {
    return members.map(this.greeting);
  }
}

const yoga = createLesson('Jóga', '2026-09-21T18:00');
const circuit = createLesson('Kruhový trénink', '2026-09-22T07:00');
book(yoga, 'Eva Dvořáková');
console.log('Kruhový trénink:', circuit.attendees);

const members = [new Member('Eva Dvořáková', ' Eva.Dvorakova@Seznam.cz '), new Member('Jan Novák', 'jan.novak@email.cz')];
console.log(members[0].email);
console.log(new Newsletter('Studio Pohyb').greetings(members));
```

# --solution--

## --file-- script.js

```js
// Rezervační systém studia Pohyb v Brně. Kolega ho dopsal před dovolenou.

// Výchozí hodnoty každé lekce.
const LESSON_DEFAULTS = {
  capacity: 12,
  attendees: [],
};

// Vytvoří lekci s názvem a časem začátku.
function createLesson(title, start) {
  const lesson = Object.create(LESSON_DEFAULTS);
  lesson.title = title;
  lesson.start = start;
  lesson.attendees = [];
  return lesson;
}

// Zapíše člena na lekci. Vrátí false, když je plno nebo už je zapsaný.
function book(lesson, memberName) {
  if (lesson.attendees.length >= lesson.capacity || lesson.attendees.includes(memberName)) {
    return false;
  }
  lesson.attendees.push(memberName);
  return true;
}

class Member {
  #email;

  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  // E-mail ukládáme vždy malými písmeny a bez mezer okolo.
  set email(value) {
    this.#email = value.trim().toLowerCase();
  }

  get email() {
    return this.#email;
  }
}

class Newsletter {
  constructor(studioName) {
    this.studioName = studioName;
  }

  // Oslovení do hlavičky e-mailu.
  greeting(member) {
    return `${this.studioName} zdraví: ${member.name}`;
  }

  // Oslovení pro všechny příjemce.
  greetings(members) {
    return members.map((member) => this.greeting(member));
  }
}

const yoga = createLesson('Jóga', '2026-09-21T18:00');
const circuit = createLesson('Kruhový trénink', '2026-09-22T07:00');
book(yoga, 'Eva Dvořáková');
console.log('Kruhový trénink:', circuit.attendees);

const members = [new Member('Eva Dvořáková', ' Eva.Dvorakova@Seznam.cz '), new Member('Jan Novák', 'jan.novak@email.cz')];
console.log(members[0].email);
console.log(new Newsletter('Studio Pohyb').greetings(members));
```

# --explain--

Vysvětli vlastními slovy, proč se Eva po zápisu na jógu objevila i na ostatních lekcích, i když `book` zapisuje jen do jedné lekce.

## --model--

`Object.create(LESSON_DEFAULTS)` vytvořilo lekce, které pole `attendees` nemají u sebe, ale dědí ho z prototypu. Když `book` volá `lesson.attendees.push`, nejdřív pole přečte, najde to jediné v `LESSON_DEFAULTS` a mění ho, takže změnu vidí všechny lekce. Oprava je dát každé lekci vlastní pole přímo do objektu; v prototypu smí zůstat jen hodnoty, které se nemění, třeba kapacita.

## --checklist--

- Lekce pole `attendees` nemají u sebe, dědí ho z prototypu.
- `push` nic nezapisuje do lekce, jen mění nalezené pole z prototypu.
- Všechny lekce proto sdílejí jedno pole přihlášených.
- Každá lekce potřebuje vlastní pole přímo v objektu.

# --approaches--

## --approach-- Nejmenší opravy

Tři malé zásahy: vlastní pole `attendees` v `createLesson`, soukromé pole `#email` pro data setteru a šipková funkce v `map`. Kolega po návratu uvidí v diffu jen pár řádků a pozná, co bylo špatně.

### --file-- script.js

```js
// Rezervační systém studia Pohyb v Brně. Kolega ho dopsal před dovolenou.

// Výchozí hodnoty každé lekce.
const LESSON_DEFAULTS = {
  capacity: 12,
  attendees: [],
};

// Vytvoří lekci s názvem a časem začátku.
function createLesson(title, start) {
  const lesson = Object.create(LESSON_DEFAULTS);
  lesson.title = title;
  lesson.start = start;
  lesson.attendees = [];
  return lesson;
}

// Zapíše člena na lekci. Vrátí false, když je plno nebo už je zapsaný.
function book(lesson, memberName) {
  if (lesson.attendees.length >= lesson.capacity || lesson.attendees.includes(memberName)) {
    return false;
  }
  lesson.attendees.push(memberName);
  return true;
}

class Member {
  #email;

  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  // E-mail ukládáme vždy malými písmeny a bez mezer okolo.
  set email(value) {
    this.#email = value.trim().toLowerCase();
  }

  get email() {
    return this.#email;
  }
}

class Newsletter {
  constructor(studioName) {
    this.studioName = studioName;
  }

  // Oslovení do hlavičky e-mailu.
  greeting(member) {
    return `${this.studioName} zdraví: ${member.name}`;
  }

  // Oslovení pro všechny příjemce.
  greetings(members) {
    return members.map((member) => this.greeting(member));
  }
}

const yoga = createLesson('Jóga', '2026-09-21T18:00');
const circuit = createLesson('Kruhový trénink', '2026-09-22T07:00');
book(yoga, 'Eva Dvořáková');
console.log('Kruhový trénink:', circuit.attendees);

const members = [new Member('Eva Dvořáková', ' Eva.Dvorakova@Seznam.cz '), new Member('Jan Novák', 'jan.novak@email.cz')];
console.log(members[0].email);
console.log(new Newsletter('Studio Pohyb').greetings(members));
```

## --approach-- Přepis bez pastí

Místo oprav jednotlivých řádků kód přestaví tak, aby pasti ani nemohly nastat: lekce je obyčejný objektový literál bez prototypu s daty, `#email` má výchozí hodnotu a `greeting` je šipková funkce v poli třídy, takže `this` neztratí, ani když ji někdo předá jako callback. Cena: šipková funkce v poli třídy vzniká pro každou instanci znovu a neleží v prototypu.

### --file-- script.js

```js
// Rezervační systém studia Pohyb v Brně. Kolega ho dopsal před dovolenou.

// Vytvoří lekci s názvem a časem začátku. Každá lekce má vlastní seznam přihlášených.
function createLesson(title, start) {
  return { title, start, capacity: 12, attendees: [] };
}

// Zapíše člena na lekci. Vrátí false, když je plno nebo už je zapsaný.
function book(lesson, memberName) {
  if (lesson.attendees.length >= lesson.capacity || lesson.attendees.includes(memberName)) {
    return false;
  }
  lesson.attendees.push(memberName);
  return true;
}

class Member {
  #email = '';

  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  // E-mail ukládáme vždy malými písmeny a bez mezer okolo.
  set email(value) {
    this.#email = value.trim().toLowerCase();
  }

  get email() {
    return this.#email;
  }
}

class Newsletter {
  constructor(studioName) {
    this.studioName = studioName;
  }

  // Šipková funkce v poli třídy má this navždy nastavené na instanci.
  greeting = (member) => `${this.studioName} zdraví: ${member.name}`;

  greetings(members) {
    const result = [];
    for (const member of members) {
      result.push(this.greeting(member));
    }
    return result;
  }
}

const yoga = createLesson('Jóga', '2026-09-21T18:00');
const circuit = createLesson('Kruhový trénink', '2026-09-22T07:00');
book(yoga, 'Eva Dvořáková');
console.log('Kruhový trénink:', circuit.attendees);

const members = [new Member('Eva Dvořáková', ' Eva.Dvorakova@Seznam.cz '), new Member('Jan Novák', 'jan.novak@email.cz')];
console.log(members[0].email);
console.log(new Newsletter('Studio Pohyb').greetings(members));
```
