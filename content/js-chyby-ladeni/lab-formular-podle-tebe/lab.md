---
title: Formulář podle tebe
runtime: js
see: js-chyby-ladeni/vlastni-chyby#vyjimka-nebo-navratova-hodnota
---

# --description--

Každá aplikace, kterou budeš stavět, má aspoň jeden formulář: přihlášku na závod, rezervaci stolu, registraci na LAN párty, objednávku lekcí jógy. Tentokrát si téma vybereš sám a validaci k němu napíšeš bez návodu — stejnými vzory jako ve workshopu Validace objednávky, jen na vlastních datech.

**Téma, políčka, hlášky i texty jsou tvoje volba.** Testy kontrolují jen tvar výsledků a chování při chybách, ne konkrétní políčka.

V `script.js` jsou prázdné kostry funkcí s popisem. Co má formulář umět:

- Když uživatel vyplní všechno správně, dostane zpět převedená data: oříznuté texty, čísla místo textů z políček.
- Když něco vyplní špatně, dozví se o **všech** chybných políčkách najednou, u každého s vlastní hláškou.
- Když formulář přijde z mobilní aplikace jako text ve formátu JSON a ten je uříznutý nebo nesmyslný, dostane hlášku o celém formuláři místo pádu.
- Když se v kódu validace objeví chyba programu, nesmí se ztratit mezi chybami políček — vyletí ven a zachytí ji až obsluha tlačítka Odeslat, která ji zapíše do konzole a uživateli ukáže obecnou hlášku.
- Po odeslání uživatel uvidí text: poděkování, nebo seznam svých chyb.

Formulář má mít **aspoň tři povinná políčka** a aspoň jedno, které se převádí (text na číslo, oříznutí, malá písmena). Do `exampleValid` dej data, která validací projdou, do `exampleInvalid` data s aspoň třemi chybnými políčky — obojí tak, jak by je poslal formulář.

Chyby políček vracej ve výsledkovém objektu: `{ ok: true, value }`, nebo `{ ok: false, errors }`, kde `errors` je objekt „jméno políčka → hláška". Chybu celého formuláře (nečitelný JSON, nečekaná chyba) dej pod klíč `form`.

# --hints--

`new ValidationError(field, message, options)` je chyba se jménem `ValidationError`, políčkem ve `field`, zprávou a příčinou z `options`.

```js
const cause = new SyntaxError('Unexpected end of JSON input');
const error = new ValidationError('email', 'Zadej e-mail', { cause });
assert.ok(error instanceof Error, "new ValidationError('email', 'Zadej e-mail') má být instance Error");
assert.equal(error.name, 'ValidationError', "new ValidationError(…).name má být 'ValidationError'");
assert.equal(error.field, 'email', "new ValidationError('email', …).field má být 'email'");
assert.equal(error.message, 'Zadej e-mail', "new ValidationError('email', 'Zadej e-mail').message má být 'Zadej e-mail'");
assert.equal(error.cause, cause, 'new ValidationError(…, …, { cause }).cause má být předaná příčina');
```

`collectError(errors, check)` vrátí výsledek kontroly; když kontrola vyhodí `ValidationError`, zapíše její zprávu do `errors` pod políčko a vrátí `undefined`.

```js
const fieldErrors = {};
assert.equal(collectError(fieldErrors, () => 42), 42, 'collectError({}, () => 42) má vrátit 42');
assert.deepEqual(fieldErrors, {}, 'po úspěšné kontrole má errors zůstat prázdný');
const result = collectError(fieldErrors, () => {
  throw new ValidationError('phone', 'Zadej telefon');
});
assert.equal(result, undefined, 'collectError s kontrolou, která vyhodí ValidationError, má vrátit undefined');
assert.deepEqual(fieldErrors, { phone: 'Zadej telefon' }, "po ValidationError('phone', 'Zadej telefon') má být errors { phone: 'Zadej telefon' }");
```

`collectError` nechá vyletět chybu, která není `ValidationError`, a nic nezapíše.

```js
const fieldErrors = {};
const programError = new TypeError('value.trim is not a function');
programError.field = 'name';
assert.throws(() => collectError(fieldErrors, () => { throw programError; }), TypeError, 'collectError má TypeError nechat vyletět — je to chyba programu, i když má vlastnost field');
assert.deepEqual(fieldErrors, {}, 'chyba programu se nemá zapsat do errors');
```

`validateForm(exampleValid)` vrátí `{ ok: true, value }`, kde `value` je nový objekt s převedenými daty, a vstup nezmění.

```js
const before = structuredClone(exampleValid);
const result = validateForm(exampleValid);
assert.equal(result?.ok, true, `validateForm(exampleValid) má vrátit ok: true, vrátila ${JSON.stringify(result)}`);
assert.equal(typeof result.value, 'object', 'validateForm(exampleValid).value má být objekt s daty');
assert.notEqual(result.value, exampleValid, 'value má být nový objekt, ne vstupní data');
assert.notEqual(JSON.stringify(result.value), JSON.stringify(exampleValid), 'value má obsahovat převedená data (oříznutý text, číslo z textu…), ne kopii vstupu');
assert.deepEqual(exampleValid, before, 'validateForm nesmí změnit exampleValid');
```

`validateForm(exampleInvalid)` vrátí `{ ok: false, errors }` s aspoň třemi chybnými políčky a neprázdnou hláškou u každého.

```js
const before = structuredClone(exampleInvalid);
const result = validateForm(exampleInvalid);
assert.equal(result?.ok, false, 'validateForm(exampleInvalid) má vrátit ok: false');
const entries = Object.entries(result.errors ?? {});
assert.ok(entries.length >= 3, `validateForm(exampleInvalid) má najít aspoň 3 chybná políčka najednou, našla ${entries.length}`);
for (const [field, message] of entries) {
  assert.ok(typeof message === 'string' && message.trim() !== '', `hláška u políčka ${field} má být neprázdný text`);
}
assert.deepEqual(exampleInvalid, before, 'validateForm nesmí změnit exampleInvalid');
```

`validateForm({})` nevyhodí výjimku a vrátí chyby aspoň tří povinných políček.

```js
let result;
assert.doesNotThrow(() => {
  result = validateForm({});
}, 'validateForm({}) nemá vyhodit výjimku — chybějící políčka jsou chyby uživatele');
assert.equal(result?.ok, false, 'validateForm({}) má vrátit ok: false');
assert.ok(Object.keys(result.errors ?? {}).length >= 3, 'validateForm({}) má vrátit chyby aspoň tří povinných políček');
```

`validateForm` kontroluje každé políčko přes `collectError`.

```js
const original = collectError;
let calls = 0;
collectError = (target, check) => {
  calls += 1;
  return original(target, check);
};
validateForm(exampleValid);
assert.ok(calls >= 3, `validateForm má zavolat collectError pro každé políčko (aspoň 3×), zavolala ${calls}×`);
```

`parseFormJson(text)` vrátí chybu `form` pro uříznutý nebo prázdný text a pro JSON, který není objekt.

```js
for (const text of ['{"name":"Kl', '', 'null', '42', '[]']) {
  let result;
  assert.doesNotThrow(() => {
    result = parseFormJson(text);
  }, `parseFormJson(${JSON.stringify(text)}) nemá vyhodit výjimku`);
  assert.equal(result?.ok, false, `parseFormJson(${JSON.stringify(text)}) má vrátit ok: false`);
  assert.deepEqual(Object.keys(result.errors ?? {}), ['form'], `parseFormJson(${JSON.stringify(text)}) má vrátit jedinou chybu pod klíčem form`);
}
```

`parseFormJson` vrátí pro platný JSON stejný výsledek jako `validateForm`.

```js
assert.equal(parseFormJson(JSON.stringify(exampleValid))?.ok, true, 'parseFormJson(JSON.stringify(exampleValid)).ok má být true');
assert.deepEqual(parseFormJson(JSON.stringify(exampleValid)), validateForm(exampleValid), 'parseFormJson(JSON.stringify(exampleValid)) má vrátit totéž co validateForm(exampleValid)');
assert.deepEqual(parseFormJson(JSON.stringify(exampleInvalid)), validateForm(exampleInvalid), 'parseFormJson(JSON.stringify(exampleInvalid)) má vrátit totéž co validateForm(exampleInvalid)');
```

`handleSubmit(data)` vrátí výsledek `validateForm` pro platná i chybná data.

```js
assert.equal(handleSubmit(exampleValid)?.ok, true, 'handleSubmit(exampleValid).ok má být true');
assert.deepEqual(handleSubmit(exampleValid), validateForm(exampleValid), 'handleSubmit(exampleValid) má vrátit výsledek validateForm');
assert.deepEqual(handleSubmit(exampleInvalid), validateForm(exampleInvalid), 'handleSubmit(exampleInvalid) má vrátit výsledek validateForm');
```

Když `validateForm` vyhodí nečekanou chybu, `handleSubmit` ji zapíše přes `console.error` a vrátí chybu `form` s neprázdnou hláškou.

```js
validateForm = () => {
  throw new TypeError('rules is not defined');
};
const before = logs.length;
let result;
assert.doesNotThrow(() => {
  result = handleSubmit(exampleValid);
}, 'handleSubmit nemá nechat vyletět nečekanou chybu — je to poslední záchranná síť');
assert.equal(result?.ok, false, 'handleSubmit má po nečekané chybě vrátit ok: false');
assert.ok(typeof result.errors?.form === 'string' && result.errors.form.trim() !== '', 'handleSubmit má po nečekané chybě vrátit neprázdnou hlášku pod errors.form');
const written = logs.slice(before).filter((entry) => entry.level === 'error').map((entry) => entry.text).join('\n');
assert.match(written, /rules is not defined/, 'nečekaná chyba se má zapsat do konzole přes console.error');
```

`resultMessage(result)` vrátí u úspěchu neprázdný text a u neúspěchu text, ve kterém je každá hláška z `errors`.

```js
const success = resultMessage(validateForm(exampleValid));
assert.ok(typeof success === 'string' && success.trim() !== '', 'resultMessage(úspěšný výsledek) má vrátit neprázdný text');
const failure = validateForm(exampleInvalid);
const text = resultMessage(failure);
assert.equal(typeof text, 'string', 'resultMessage(neúspěšný výsledek) má vrátit text');
for (const message of Object.values(failure.errors)) {
  assert.ok(text.includes(message), `text z resultMessage má obsahovat hlášku „${message}"`);
}
```

# --help--

## --tip-- 7

Test si tvoji funkci `collectError` na chvíli podmění, aby spočítal, kolikrát ji `validateForm` zavolá. Proto `collectError`, `validateForm` i ostatní funkce nech jako deklarace `function` — do `const` by test přiřadit nemohl. Vzor s kontrolou předanou jako šipková funkce znáš z [Výjimka, nebo návratová hodnota](see:js-chyby-ladeni/vlastni-chyby#vyjimka-nebo-navratova-hodnota) a z workshopu Validace objednávky.

## --tip-- 8

Na `JSON.parse` stačí `try…catch`, ale pozor na hodnoty, které se přečtou bez chyby a objektem nejsou: `typeof null` i `typeof []` je `'object'`. Obě vyřaď zvlášť, jako na hranici v [Validaci na hranici](see:js-chyby-ladeni/vlastni-chyby#validace-na-hranici).

# --seed--

## --file-- script.js

```js
// Formulář podle tebe: vyber si téma (přihláška na závod, rezervace stolu,
// registrace na LAN párty…) a napiš k němu validaci.

/**
 * Chyba jednoho políčka formuláře.
 * @param {string} field jméno políčka
 * @param {string} message hláška pro uživatele
 * @param {{ cause?: unknown }} [options] volby pro Error (cause)
 */
class ValidationError extends Error {
}

/**
 * Spustí kontrolu jednoho políčka. Chybu políčka zapíše do errors, jinou chybu nechá vyletět.
 * Nech jako deklaraci function — test si ji na chvíli podmění.
 * @param {Object<string, string>} errors objekt chyb: políčko → hláška
 * @param {() => unknown} check funkce bez parametrů, která políčko zkontroluje a vrátí hodnotu
 * @returns {unknown} výsledek kontroly, nebo undefined, když políčko neprošlo
 */
function collectError(errors, check) {
}

/** Ukázková data, která validací projdou (tak, jak je pošle formulář). */
const exampleValid = {};

/** Ukázková data s aspoň třemi chybnými políčky. */
const exampleInvalid = {};

/**
 * Validace celého formuláře. Nech jako deklaraci function — test si ji na chvíli podmění.
 * @param {object} data data z formuláře
 * @returns {{ ok: true, value: object } | { ok: false, errors: Object<string, string> }}
 */
function validateForm(data) {
}

/**
 * Formulář odeslaný jako text ve formátu JSON.
 * @param {string} text
 * @returns {{ ok: true, value: object } | { ok: false, errors: Object<string, string> }}
 */
function parseFormJson(text) {
}

/**
 * Obsluha tlačítka Odeslat: poslední záchranná síť.
 * @param {object} data
 * @returns {{ ok: true, value: object } | { ok: false, errors: Object<string, string> }}
 */
function handleSubmit(data) {
}

/**
 * Text, který uživatel uvidí po odeslání.
 * @param {{ ok: boolean, value?: object, errors?: Object<string, string> }} result
 * @returns {string}
 */
function resultMessage(result) {
}

console.log(resultMessage(handleSubmit(exampleInvalid)));
```

# --solution--

## --file-- script.js

```js
// Přihláška na Běh Stromovkou: jméno, e-mail, trať a rok narození.

class ValidationError extends Error {
  constructor(field, message, options) {
    super(message, options);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Spustí kontrolu políčka; chybu políčka zapíše, jinou nechá vyletět.
function collectError(errors, check) {
  try {
    return check();
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      throw error;
    }
    errors[error.field] = error.message;
  }
}

const DISTANCES = [5, 10, 21];
const LABELS = { name: 'Jméno', email: 'E-mail', distance: 'Trať', birthYear: 'Rok narození', form: 'Přihláška' };

const exampleValid = {
  name: '  Klára   Pokorná ',
  email: 'Klara.Pokorna@example.cz',
  distance: '10',
  birthYear: '1994',
};

const exampleInvalid = {
  name: '   ',
  email: 'klara.example.cz',
  distance: '42',
  birthYear: '1994',
};

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(field, 'Vyplň toto políčko');
  }
  return value.trim().replace(/\s+/g, ' ');
}

function checkEmail(value) {
  const email = requireText(value, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('email', 'Zadej e-mail ve tvaru klara@example.cz');
  }
  return email;
}

function checkDistance(value) {
  const distance = Number(value);
  if (!DISTANCES.includes(distance)) {
    throw new ValidationError('distance', 'Vyber trať 5, 10 nebo 21 km');
  }
  return distance;
}

function checkBirthYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1920 || year > 2014) {
    throw new ValidationError('birthYear', 'Rok narození zadej jako číslo 1920–2014');
  }
  return year;
}

function validateForm(data) {
  const errors = {};
  const value = {
    name: collectError(errors, () => requireText(data.name, 'name')),
    email: collectError(errors, () => checkEmail(data.email)),
    distance: collectError(errors, () => checkDistance(data.distance)),
    birthYear: collectError(errors, () => checkBirthYear(data.birthYear)),
  };
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value };
}

function parseFormJson(text) {
  const unreadable = { ok: false, errors: { form: 'Přihlášku nejde přečíst' } };
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return unreadable;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return unreadable;
  }
  return validateForm(data);
}

function handleSubmit(data) {
  try {
    return validateForm(data);
  } catch (error) {
    console.error(error);
    return { ok: false, errors: { form: 'Přihlášku se nepodařilo odeslat, zkus to za chvíli znovu' } };
  }
}

function resultMessage(result) {
  if (result.ok) {
    return `Díky, ${result.value.name}, jsi přihlášený na ${result.value.distance} km.`;
  }
  return Object.entries(result.errors)
    .map(([field, message]) => `${LABELS[field] ?? field}: ${message}`)
    .join('\n');
}

console.log(resultMessage(handleSubmit(exampleInvalid)));
```

# --explain--

Vysvětli vlastními slovy, proč `collectError` zapisuje jen `ValidationError` a všechno ostatní nechá vyletět, když `handleSubmit` o úroveň výš chytá úplně všechno.

## --model--

`collectError` je uprostřed validace: když by zapsal i chybu programu, uživatel by u políčka viděl nesmyslnou hlášku, validace by pokračovala se špatnými daty a chyba v kódu by zůstala schovaná. Proto zapíše jen chybu políčka, kterou pozná podle třídy. `handleSubmit` je úplně nahoře, za ním se s daty už nepracuje — nečekanou chybu zapíše do konzole pro vývojáře a uživateli ukáže obecnou hlášku. Chyba se tak neztratí a stránka nespadne.

## --checklist--

- Chyba políčka se pozná podle třídy `ValidationError`.
- Zapsaná chyba programu by se tvářila jako chyba uživatele a zůstala by schovaná.
- `handleSubmit` je nejvyšší úroveň, za ní už se s daty nepracuje.
- Nečekaná chyba se zapíše do konzole, uživatel dostane obecnou hlášku.

# --approaches--

## --approach-- Funkce pro každé políčko

Každé políčko má vlastní pojmenovanou kontrolu (`checkEmail`, `checkDistance`) a `validateForm` je vyjmenuje jednu po druhé. Hodí se, když má každé políčko jinou logiku a chceš kontroly volat i jinde, třeba při psaní do políčka.

### --file-- script.js

```js
// Přihláška na Běh Stromovkou: jméno, e-mail, trať a rok narození.

class ValidationError extends Error {
  constructor(field, message, options) {
    super(message, options);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Spustí kontrolu políčka; chybu políčka zapíše, jinou nechá vyletět.
function collectError(errors, check) {
  try {
    return check();
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      throw error;
    }
    errors[error.field] = error.message;
  }
}

const DISTANCES = [5, 10, 21];
const LABELS = { name: 'Jméno', email: 'E-mail', distance: 'Trať', birthYear: 'Rok narození', form: 'Přihláška' };

const exampleValid = {
  name: '  Klára   Pokorná ',
  email: 'Klara.Pokorna@example.cz',
  distance: '10',
  birthYear: '1994',
};

const exampleInvalid = {
  name: '   ',
  email: 'klara.example.cz',
  distance: '42',
  birthYear: '1994',
};

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(field, 'Vyplň toto políčko');
  }
  return value.trim().replace(/\s+/g, ' ');
}

function checkEmail(value) {
  const email = requireText(value, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('email', 'Zadej e-mail ve tvaru klara@example.cz');
  }
  return email;
}

function checkDistance(value) {
  const distance = Number(value);
  if (!DISTANCES.includes(distance)) {
    throw new ValidationError('distance', 'Vyber trať 5, 10 nebo 21 km');
  }
  return distance;
}

function checkBirthYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1920 || year > 2014) {
    throw new ValidationError('birthYear', 'Rok narození zadej jako číslo 1920–2014');
  }
  return year;
}

function validateForm(data) {
  const errors = {};
  const value = {
    name: collectError(errors, () => requireText(data.name, 'name')),
    email: collectError(errors, () => checkEmail(data.email)),
    distance: collectError(errors, () => checkDistance(data.distance)),
    birthYear: collectError(errors, () => checkBirthYear(data.birthYear)),
  };
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value };
}

function parseFormJson(text) {
  const unreadable = { ok: false, errors: { form: 'Přihlášku nejde přečíst' } };
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return unreadable;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return unreadable;
  }
  return validateForm(data);
}

function handleSubmit(data) {
  try {
    return validateForm(data);
  } catch (error) {
    console.error(error);
    return { ok: false, errors: { form: 'Přihlášku se nepodařilo odeslat, zkus to za chvíli znovu' } };
  }
}

function resultMessage(result) {
  if (result.ok) {
    return `Díky, ${result.value.name}, jsi přihlášený na ${result.value.distance} km.`;
  }
  return Object.entries(result.errors)
    .map(([field, message]) => `${LABELS[field] ?? field}: ${message}`)
    .join('\n');
}

console.log(resultMessage(handleSubmit(exampleInvalid)));
```

## --approach-- Objekt pravidel a cyklus

Pravidla jsou metody jednoho objektu `rules` a `validateForm` je projde cyklem přes `Object.entries`. Přidat políčko znamená přidat jedno pravidlo, `validateForm` se nemění. `parseFormJson` tu chytá jen `SyntaxError`, takže chyba programu uvnitř validace z ní vyletí.

### --file-- script.js

```js
// Rezervace stolu v Bistru U Kaštanu: jméno, telefon, počet hostů a čas.

class ValidationError extends Error {
  name = 'ValidationError';

  constructor(field, message, options) {
    super(message, options);
    this.field = field;
  }
}

function collectError(errors, check) {
  try {
    return check();
  } catch (error) {
    if (error instanceof ValidationError) {
      errors[error.field] = error.message;
      return undefined;
    }
    throw error;
  }
}

const exampleValid = { name: 'Tomáš Beneš', phone: '777 123 456', guests: '4', time: '19:30' };
const exampleInvalid = { name: 'Tomáš Beneš', phone: '123', guests: '0', time: '25:00' };

// Pravidla políček: každé dostane surovou hodnotu, vrátí převedenou nebo vyhodí chybu políčka.
const rules = {
  name(value) {
    if (typeof value !== 'string' || !value.trim()) throw new ValidationError('name', 'Na koho stůl zapíšeme?');
    return value.trim();
  },
  phone(value) {
    const digits = String(value ?? '').replaceAll(' ', '');
    if (!/^\+?\d{9,12}$/.test(digits)) throw new ValidationError('phone', 'Telefon zadej jako 777 123 456');
    return digits;
  },
  guests(value) {
    const guests = Number(value);
    if (!Number.isInteger(guests) || guests < 1 || guests > 12) throw new ValidationError('guests', 'Stůl je pro 1 až 12 hostů');
    return guests;
  },
  time(value) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? ''));
    const hour = match ? Number(match[1]) : NaN;
    if (!match || hour < 11 || hour > 21 || Number(match[2]) > 59) throw new ValidationError('time', 'Otevřeno máme 11:00–22:00');
    return `${String(hour).padStart(2, '0')}:${match[2]}`;
  },
};

function validateForm(data) {
  const errors = {};
  const value = {};
  for (const [field, rule] of Object.entries(rules)) {
    value[field] = collectError(errors, () => rule(data[field]));
  }
  return Object.keys(errors).length === 0 ? { ok: true, value } : { ok: false, errors };
}

function parseFormJson(text) {
  try {
    const data = JSON.parse(text);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, errors: { form: 'Rezervaci nejde přečíst' } };
    }
    return validateForm(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, errors: { form: 'Rezervaci nejde přečíst' } };
    }
    throw error;
  }
}

function handleSubmit(data) {
  try {
    return validateForm(data);
  } catch (error) {
    console.error('Rezervace spadla:', error);
    return { ok: false, errors: { form: 'Rezervace se nepovedla, zavolej nám prosím' } };
  }
}

function resultMessage(result) {
  if (!result.ok) {
    return Object.values(result.errors).map((message) => `• ${message}`).join('\n');
  }
  const { name, guests, time } = result.value;
  return `Stůl pro ${guests} na jméno ${name} v ${time} je zarezervovaný.`;
}

console.log(resultMessage(handleSubmit(exampleInvalid)));
```

# --review--

Testy kontrolují tvar výsledků a chování při chybách. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Hláška u každého políčka říká, co má uživatel udělat, a ukazuje správný tvar („Zadej telefon jako 777 123 456"), ne jen „Neplatná hodnota".
- Každé políčko se kontroluje na jednom místě a stejná kontrola se nikde neopakuje.
- Data, která `validateForm` vrátí, mají tvar, se kterým by zbytek aplikace počítal bez dalších kontrol (čísla jsou čísla, texty oříznuté).
- Žádný `catch` v kódu nechytá víc, než umí vyřešit.
- Víš, který z přístupů bys zvolil pro formulář s dvaceti políčky a proč.

## --extensions--

Rozšíření bez testů: přidej nepovinné políčko, které se kontroluje jen tehdy, když ho uživatel vyplnil; napiš kontrolu, která porovnává dvě políčka (heslo a jeho potvrzení, datum od a do) a chybu zapíše k druhému z nich; a když už znáš základy DOM, vypiš hlášky pod skutečná políčka formuláře a nastav jim `aria-invalid`.
