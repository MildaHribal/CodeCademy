---
title: Adresář kontaktů
runtime: js
see: js-objekty/reference-a-mutace#uprava-bez-mutace-novy-objekt
---

# --description--

Malá pekárna si píše vlastní adresář dodavatelů a zákazníků. Obrazovku s formulářem, hledáním a hvězdičkou oblíbených už někdo má, od tebe potřebuje funkce nad daty. Tohle je lab: žádné kroky, jen zadání. Všechno potřebné jsi psal ve workshopech [Profil uživatele](see:js-objekty/workshop-profil-uzivatele) a [Nastavení aplikace](see:js-objekty/workshop-nastaveni-aplikace).

Adresář není pole, ale **objekt**: klíčem je `id` kontaktu, hodnotou kontakt. Kontakt podle `id` se tak najde hned, bez procházení. Jeden kontakt vypadá takhle:

```js
{ id: 'c1', name: 'Tereza Novotná', phone: '+420 603 111 222', email: 'tereza@example.cz', company: 'Mlýn Hrubý', tags: ['dodavatel'], favorite: true }
```

Téma a data v `script.js` jsou tvoje volba: klidně z adresáře udělej spoluhráče z klanu nebo kamarády z kurzu. Testy mají vlastní data a kontrolují jen chování funkcí.

## Uživatelské příběhy

- Když uživatel vyplní formulář **Nový kontakt**, vznikne kontakt se všemi klíči; co nevyplnil, má `null`, bez štítků prázdné pole a oblíbený není.
- Když kontakt uloží, přibude v adresáři. Kontakt se stejným `id` se nepřepíše.
- Když kontakt upraví, změní se jen vyplněné údaje; `id` změnit nejde. Upravit neexistující kontakt nic nezmění.
- Když kontakt smaže, z adresáře zmizí. Když klikne na hvězdičku, kontakt se přepne mezi oblíbenými. Když přidá štítek, přibude u kontaktu, ale stejný štítek dvakrát ne.
- Když píše do hledání, vidí kontakty, jejichž jméno obsahuje hledaný text bez ohledu na velká a malá písmena.
- V přehledu vidí, kolik kontaktů je z které firmy.
- Když otevře dialog **Upravit**, pracuje nad konceptem kontaktu, do kterého smí dialog zapisovat, a **Zrušit** koncept zahodí.
- Adresář jde vyexportovat do JSON bez hvězdiček (ty jsou osobní) a importovat zpátky; import rozbitého textu nic nerozbije.

> [!REMEMBER]
> **Žádná funkce nesmí změnit adresář, kontakt ani pole štítků, které dostane.** Funkce, které nic nemění, vracejí tentýž adresář.

# --hints--

`createContact(form)` vrátí kontakt se všemi klíči a výchozími hodnotami pro to, co ve formuláři chybí.

```js
assert.deepEqual(
  createContact({ id: 'k7', name: 'Ivana Malá', phone: '+420 700 000 007' }),
  { id: 'k7', name: 'Ivana Malá', phone: '+420 700 000 007', email: null, company: null, tags: [], favorite: false },
  "createContact({ id: 'k7', name: 'Ivana Malá', phone: … }) má vrátit kontakt s email: null, company: null, tags: [] a favorite: false",
);
```

`createContact` do kontaktu nepřevezme neznámé klíče, bez argumentu nespadne a každý kontakt má vlastní pole štítků.

```js
const contact = createContact({ id: 'k8', name: 'Oto Hora', nickname: 'Otík' });
assert.equal(Object.hasOwn(contact, 'nickname'), false, "createContact nemá převzít neznámý klíč nickname");
assert.equal(createContact().favorite, false, 'createContact() bez argumentu má vrátit kontakt s favorite: false, ne spadnout');
assert.notEqual(createContact({ id: 'a' }).tags, createContact({ id: 'b' }).tags, 'dva kontakty bez štítků mají mít dvě různá pole tags');
```

`addContact(book, contact)` vrátí nový adresář s kontaktem pod jeho `id` a původní adresář nechá beze změny.

```js
const eva = { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: [], favorite: false };
const book = { k1: eva };
const ota = { id: 'k2', name: 'Oto Hora', phone: null, email: null, company: 'Pila Hora', tags: [], favorite: false };
const result = addContact(book, ota);
assert.deepEqual(Object.keys(result), ['k1', 'k2'], 'addContact({ k1 }, kontakt k2) má vrátit adresář s klíči k1 a k2');
assert.deepEqual(result.k2, ota, 'addContact má pod klíč k2 uložit předaný kontakt');
assert.deepEqual(Object.keys(book), ['k1'], 'addContact nesmí přidat kontakt do původního adresáře');
```

`addContact` nepřepíše kontakt se stejným `id` a vrátí tentýž adresář.

```js
const eva = { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: [], favorite: false };
const book = { k1: eva };
assert.equal(addContact(book, { ...eva, name: 'Někdo jiný' }), book, 'addContact s id, které v adresáři už je, má vrátit tentýž adresář');
```

`updateContact(book, id, changes)` vrátí nový adresář, ve kterém má kontakt změněné údaje a stejné `id`; původní kontakt ani adresář se nezmění.

```js
const eva = { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: ['zákaznice'], favorite: false };
const ota = { id: 'k2', name: 'Oto Hora', phone: null, email: null, company: 'Pila Hora', tags: [], favorite: false };
const book = { k1: eva, k2: ota };
const result = updateContact(book, 'k1', { phone: '+420 700 111 222', id: 'x' });
assert.equal(result.k1.phone, '+420 700 111 222', "updateContact(book, 'k1', { phone: … }) má změnit telefon kontaktu k1");
assert.equal(result.k1.id, 'k1', "updateContact nesmí změnit id kontaktu, i když je v changes");
assert.equal(result.k1.name, 'Eva Kolářová', 'updateContact má zachovat ostatní údaje kontaktu');
assert.equal(eva.phone, null, 'updateContact nesmí změnit původní objekt kontaktu');
assert.notEqual(result, book, 'updateContact má vrátit nový adresář');
assert.deepEqual(result.k2, ota, 'updateContact nemá měnit ostatní kontakty');
```

`updateContact` s `id`, které v adresáři není, vrátí tentýž adresář.

```js
const book = { k1: { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: [], favorite: false } };
assert.equal(updateContact(book, 'k9', { name: 'Nikdo' }), book, "updateContact(book, 'k9', …) má vrátit tentýž adresář — kontakt k9 neexistuje");
```

`removeContact(book, id)` vrátí nový adresář bez kontaktu a původní adresář nechá beze změny.

```js
const book = {
  k1: { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: [], favorite: false },
  k2: { id: 'k2', name: 'Oto Hora', phone: null, email: null, company: null, tags: [], favorite: false },
};
const result = removeContact(book, 'k1');
assert.deepEqual(Object.keys(result), ['k2'], "removeContact(book, 'k1') má vrátit adresář jen s klíčem k2");
assert.deepEqual(Object.keys(book), ['k1', 'k2'], 'removeContact nesmí smazat kontakt z původního adresáře');
assert.equal(Object.hasOwn(result, 'id'), false, 'removeContact nemá vytvořit klíč id — klíč se bere z hodnoty parametru');
```

`toggleFavorite(book, id)` přepne hvězdičku kontaktu bez změny původních dat.

```js
const eva = { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: [], favorite: false };
const book = { k1: eva };
const once = toggleFavorite(book, 'k1');
assert.equal(once.k1.favorite, true, "toggleFavorite(book, 'k1') má kontaktu k1 nastavit favorite: true");
assert.equal(eva.favorite, false, 'toggleFavorite nesmí změnit původní kontakt');
assert.equal(toggleFavorite(once, 'k1').k1.favorite, false, 'druhé toggleFavorite má vrátit favorite: false');
```

`addTag(book, id, tag)` přidá štítek na konec pole štítků kontaktu; štítek, který kontakt už má, nepřidá a vrátí tentýž adresář. Původní pole štítků se nezmění.

```js
const tags = ['dodavatel'];
const book = { k1: { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags, favorite: false } };
const result = addTag(book, 'k1', 'mouka');
assert.deepEqual(result.k1.tags, ['dodavatel', 'mouka'], "addTag(book, 'k1', 'mouka') má vrátit štítky ['dodavatel', 'mouka']");
assert.deepEqual(tags, ['dodavatel'], 'addTag nesmí přidat štítek do původního pole');
assert.equal(addTag(book, 'k1', 'dodavatel'), book, "addTag se štítkem 'dodavatel', který kontakt už má, má vrátit tentýž adresář");
```

`findByName(book, query)` vrátí pole kontaktů, jejichž jméno obsahuje hledaný text bez ohledu na velká a malá písmena, v pořadí adresáře.

```js
const book = {
  k1: { id: 'k1', name: 'Čeněk Dvořák', phone: null, email: null, company: null, tags: [], favorite: false },
  k2: { id: 'k2', name: 'Oto Hora', phone: null, email: null, company: null, tags: [], favorite: false },
  k3: { id: 'k3', name: 'Dana Čermáková', phone: null, email: null, company: null, tags: [], favorite: false },
};
assert.deepEqual(findByName(book, 'ČE').map((contact) => contact.id), ['k1', 'k3'], "findByName(book, 'ČE') má najít Čeňka Dvořáka i Danu Čermákovou");
assert.deepEqual(findByName(book, 'hor'), [book.k2], "findByName(book, 'hor') má vrátit pole s kontaktem Oto Hora");
assert.deepEqual(findByName(book, 'xyz'), [], "findByName(book, 'xyz') má vrátit prázdné pole");
```

`countByCompany(book)` vrátí objekt s počtem kontaktů podle firmy; kontakty bez firmy jsou pod klíčem `'bez firmy'`.

```js
const book = {
  k1: { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: 'Mlýn Hrubý', tags: [], favorite: false },
  k2: { id: 'k2', name: 'Oto Hora', phone: null, email: null, company: null, tags: [], favorite: false },
  k3: { id: 'k3', name: 'Dana Čermáková', phone: null, email: null, company: 'Mlýn Hrubý', tags: [], favorite: false },
};
assert.deepEqual(countByCompany(book), { 'Mlýn Hrubý': 2, 'bez firmy': 1 }, "countByCompany má vrátit { 'Mlýn Hrubý': 2, 'bez firmy': 1 }");
assert.deepEqual(countByCompany({}), {}, 'countByCompany({}) má vrátit {}');
```

`draftContact(book, id)` vrátí koncept kontaktu: kopii, do které jde zapisovat i do pole štítků bez změny adresáře; pro neexistující `id` vrátí `null`.

```js
const tags = ['dodavatel'];
const eva = { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags, favorite: false };
const book = { k1: eva };
const draft = draftContact(book, 'k1');
assert.deepEqual(draft, eva, "draftContact(book, 'k1') má mít stejné údaje jako kontakt k1");
draft.name = 'Eva Nová';
draft.tags.push('mouka');
assert.equal(eva.name, 'Eva Kolářová', 'zápis do konceptu nesmí změnit jméno v adresáři');
assert.deepEqual(tags, ['dodavatel'], 'zápis do štítků konceptu nesmí změnit štítky v adresáři');
assert.equal(draftContact(book, 'k9'), null, "draftContact(book, 'k9') má vrátit null");
```

`exportBook(book)` vrátí JSON text adresáře, ve kterém kontakty nemají `favorite`; původní kontakty se nezmění.

```js
const eva = { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: [], favorite: true };
const text = exportBook({ k1: eva });
assert.equal(typeof text, 'string', 'exportBook má vrátit text');
assert.deepEqual(JSON.parse(text), { k1: { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: [] } }, 'exportBook má vrátit JSON adresáře bez favorite u kontaktů');
assert.equal(eva.favorite, true, 'exportBook nesmí z původního kontaktu odstranit favorite');
```

`importBook(text)` z JSON vrátí adresář, ve kterém má každý kontakt všechny klíče (co chybí, doplní výchozí hodnoty jako u nového kontaktu).

```js
const book = importBook('{"k1":{"id":"k1","name":"Eva Kolářová","tags":["zákaznice"]}}');
assert.deepEqual(book, { k1: { id: 'k1', name: 'Eva Kolářová', phone: null, email: null, company: null, tags: ['zákaznice'], favorite: false } }, 'importBook má kontaktu doplnit chybějící klíče výchozími hodnotami');
```

`importBook` vrátí `null`, když text není platný JSON nebo v něm není objekt.

```js
assert.equal(importBook('{"k1": '), null, 'importBook s poškozeným textem má vrátit null, ne spadnout');
assert.equal(importBook('null'), null, "importBook('null') má vrátit null");
assert.equal(importBook('7'), null, "importBook('7') má vrátit null");
```

# --help--

## --tip-- 7

Kontakt z adresáře „vyjmeš" bez mutace třemi způsoby: zbytkem vlastností (hranaté závorky s klíčem z proměnné fungují i na levé straně destrukturalizace), kopií adresáře a smazáním klíče až v kopii, nebo procházením dvojic a přeskočením jedné. Viz [Úprava bez mutace](see:js-objekty/reference-a-mutace#uprava-bez-mutace-novy-objekt).

## --tip-- 12

Do konceptu se bude zapisovat i o patro níž, do pole `tags`. Porovnej, co z tabulky [Kterou kopii vybrat](see:js-objekty/kopie-a-json#kterou-kopii-vybrat) vytvoří nové pole i uvnitř kontaktu.

# --seed--

## --file-- script.js

```js
// Adresář kontaktů pekárny: klíčem je id kontaktu, hodnotou kontakt.
const contacts = {
  c1: { id: 'c1', name: 'Tereza Novotná', phone: '+420 603 111 222', email: 'tereza@example.cz', company: 'Mlýn Hrubý', tags: ['dodavatel'], favorite: true },
  c2: { id: 'c2', name: 'Marek Šimek', phone: '+420 777 333 444', email: null, company: null, tags: [], favorite: false },
  c3: { id: 'c3', name: 'Čeněk Dvořák', phone: null, email: 'cenek@example.cz', company: 'Mlýn Hrubý', tags: ['účetní'], favorite: false },
};

/**
 * Nový kontakt z formuláře; chybějící údaje mají null, štítky prázdné pole, favorite false.
 * @param {object} [form] údaje z formuláře
 * @returns {object} kontakt se všemi klíči
 */
function createContact(form) {
}

/**
 * Nový adresář s kontaktem pod jeho id; existující id nepřepíše.
 * @param {object} book adresář
 * @param {object} contact kontakt
 * @returns {object} nový adresář, nebo tentýž, když id už existuje
 */
function addContact(book, contact) {
}

/**
 * Nový adresář se změněným kontaktem; id změnit nejde.
 * @param {object} book adresář
 * @param {string} id id kontaktu
 * @param {object} changes změněné údaje
 * @returns {object} nový adresář, nebo tentýž, když kontakt neexistuje
 */
function updateContact(book, id, changes) {
}

/**
 * Nový adresář bez kontaktu.
 * @param {object} book adresář
 * @param {string} id id kontaktu
 * @returns {object} nový adresář
 */
function removeContact(book, id) {
}

/**
 * Nový adresář s přepnutou hvězdičkou kontaktu.
 * @param {object} book adresář
 * @param {string} id id kontaktu
 * @returns {object} nový adresář
 */
function toggleFavorite(book, id) {
}

/**
 * Nový adresář se štítkem navíc; štítek, který kontakt má, se nepřidá.
 * @param {object} book adresář
 * @param {string} id id kontaktu
 * @param {string} tag štítek
 * @returns {object} nový adresář, nebo tentýž
 */
function addTag(book, id, tag) {
}

/**
 * Kontakty, jejichž jméno obsahuje hledaný text (bez ohledu na velikost písmen).
 * @param {object} book adresář
 * @param {string} query hledaný text
 * @returns {object[]} nalezené kontakty v pořadí adresáře
 */
function findByName(book, query) {
}

/**
 * Počet kontaktů podle firmy; bez firmy pod klíčem 'bez firmy'.
 * @param {object} book adresář
 * @returns {Object<string, number>} firma → počet
 */
function countByCompany(book) {
}

/**
 * Koncept kontaktu pro dialog Upravit, do kterého jde zapisovat.
 * @param {object} book adresář
 * @param {string} id id kontaktu
 * @returns {object | null} kopie kontaktu, nebo null
 */
function draftContact(book, id) {
}

/**
 * JSON adresáře bez hvězdiček u kontaktů.
 * @param {object} book adresář
 * @returns {string} JSON text
 */
function exportBook(book) {
}

/**
 * Adresář z JSON, kontakty doplněné výchozími hodnotami; neplatný text vrátí null.
 * @param {string} text JSON text
 * @returns {object | null} adresář, nebo null
 */
function importBook(text) {
}
```

# --solution--

## --file-- script.js

```js
// Adresář kontaktů pekárny: klíčem je id kontaktu, hodnotou kontakt.
const contacts = {
  c1: { id: 'c1', name: 'Tereza Novotná', phone: '+420 603 111 222', email: 'tereza@example.cz', company: 'Mlýn Hrubý', tags: ['dodavatel'], favorite: true },
  c2: { id: 'c2', name: 'Marek Šimek', phone: '+420 777 333 444', email: null, company: null, tags: [], favorite: false },
  c3: { id: 'c3', name: 'Čeněk Dvořák', phone: null, email: 'cenek@example.cz', company: 'Mlýn Hrubý', tags: ['účetní'], favorite: false },
};

function createContact({ id, name, phone = null, email = null, company = null, tags = [], favorite = false } = {}) {
  return { id, name, phone, email, company, tags, favorite };
}

function addContact(book, contact) {
  if (Object.hasOwn(book, contact.id)) {
    return book;
  }
  return { ...book, [contact.id]: contact };
}

function updateContact(book, id, changes) {
  if (!Object.hasOwn(book, id)) {
    return book;
  }
  return { ...book, [id]: { ...book[id], ...changes, id } };
}

function removeContact(book, id) {
  const { [id]: removed, ...rest } = book;
  return rest;
}

function toggleFavorite(book, id) {
  return updateContact(book, id, { favorite: !book[id].favorite });
}

function addTag(book, id, tag) {
  const contact = book[id];
  if (contact.tags.includes(tag)) {
    return book;
  }
  return updateContact(book, id, { tags: [...contact.tags, tag] });
}

function findByName(book, query) {
  const needle = query.toLocaleLowerCase('cs');
  const found = [];
  for (const contact of Object.values(book)) {
    if (contact.name.toLocaleLowerCase('cs').includes(needle)) {
      found.push(contact);
    }
  }
  return found;
}

function countByCompany(book) {
  const counts = {};
  for (const { company } of Object.values(book)) {
    const key = company ?? 'bez firmy';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function draftContact(book, id) {
  if (!Object.hasOwn(book, id)) {
    return null;
  }
  return structuredClone(book[id]);
}

function exportBook(book) {
  const exportable = {};
  for (const [id, contact] of Object.entries(book)) {
    const { favorite, ...rest } = contact;
    exportable[id] = rest;
  }
  return JSON.stringify(exportable, null, 2);
}

function importBook(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const book = {};
  for (const [id, contact] of Object.entries(parsed)) {
    book[id] = createContact(contact);
  }
  return book;
}
```

# --approaches--

## --approach-- Spread, vypočítané klíče a zbytek vlastností

Každá úprava postaví nový adresář jedním výrazem a úpravy kontaktu jdou přes jedinou funkci `updateContact`, takže pravidlo „id změnit nejde" hlídá jedno místo. Kontakt z adresáře vyjme zbytek vlastností s klíčem z proměnné.

### --file-- script.js

```js
// Adresář kontaktů pekárny: klíčem je id kontaktu, hodnotou kontakt.
const contacts = {
  c1: { id: 'c1', name: 'Tereza Novotná', phone: '+420 603 111 222', email: 'tereza@example.cz', company: 'Mlýn Hrubý', tags: ['dodavatel'], favorite: true },
  c2: { id: 'c2', name: 'Marek Šimek', phone: '+420 777 333 444', email: null, company: null, tags: [], favorite: false },
  c3: { id: 'c3', name: 'Čeněk Dvořák', phone: null, email: 'cenek@example.cz', company: 'Mlýn Hrubý', tags: ['účetní'], favorite: false },
};

function createContact({ id, name, phone = null, email = null, company = null, tags = [], favorite = false } = {}) {
  return { id, name, phone, email, company, tags, favorite };
}

function addContact(book, contact) {
  if (Object.hasOwn(book, contact.id)) {
    return book;
  }
  return { ...book, [contact.id]: contact };
}

function updateContact(book, id, changes) {
  if (!Object.hasOwn(book, id)) {
    return book;
  }
  return { ...book, [id]: { ...book[id], ...changes, id } };
}

function removeContact(book, id) {
  const { [id]: removed, ...rest } = book;
  return rest;
}

function toggleFavorite(book, id) {
  return updateContact(book, id, { favorite: !book[id].favorite });
}

function addTag(book, id, tag) {
  const contact = book[id];
  if (contact.tags.includes(tag)) {
    return book;
  }
  return updateContact(book, id, { tags: [...contact.tags, tag] });
}

function findByName(book, query) {
  const needle = query.toLocaleLowerCase('cs');
  const found = [];
  for (const contact of Object.values(book)) {
    if (contact.name.toLocaleLowerCase('cs').includes(needle)) {
      found.push(contact);
    }
  }
  return found;
}

function countByCompany(book) {
  const counts = {};
  for (const { company } of Object.values(book)) {
    const key = company ?? 'bez firmy';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function draftContact(book, id) {
  if (!Object.hasOwn(book, id)) {
    return null;
  }
  return structuredClone(book[id]);
}

function exportBook(book) {
  const exportable = {};
  for (const [id, contact] of Object.entries(book)) {
    const { favorite, ...rest } = contact;
    exportable[id] = rest;
  }
  return JSON.stringify(exportable, null, 2);
}

function importBook(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const book = {};
  for (const [id, contact] of Object.entries(parsed)) {
    book[id] = createContact(contact);
  }
  return book;
}
```

## --approach-- Kopie a zápis jen do vlastní kopie

Každá funkce si nejdřív udělá kopii toho, co mění (adresář, kontakt, pole štítků), a do kopie pak zapisuje postaru přes tečku, `delete` a `push`. Čte se to krok po kroku a hodí se, když úprava potřebuje víc příkazů. Hlídat je potřeba jen jedno: nikdy nezapisovat do objektu, který funkce dostala. Export vynechá hvězdičku přes `replacer` funkci, kterou `JSON.stringify` volá pro každý klíč.

### --file-- script.js

```js
// Adresář kontaktů pekárny: klíčem je id kontaktu, hodnotou kontakt.
const contacts = {
  c1: { id: 'c1', name: 'Tereza Novotná', phone: '+420 603 111 222', email: 'tereza@example.cz', company: 'Mlýn Hrubý', tags: ['dodavatel'], favorite: true },
  c2: { id: 'c2', name: 'Marek Šimek', phone: '+420 777 333 444', email: null, company: null, tags: [], favorite: false },
  c3: { id: 'c3', name: 'Čeněk Dvořák', phone: null, email: 'cenek@example.cz', company: 'Mlýn Hrubý', tags: ['účetní'], favorite: false },
};

function createContact(form) {
  const source = form ?? {};
  return {
    id: source.id,
    name: source.name,
    phone: source.phone ?? null,
    email: source.email ?? null,
    company: source.company ?? null,
    tags: source.tags ?? [],
    favorite: source.favorite ?? false,
  };
}

function addContact(book, contact) {
  if (book[contact.id] !== undefined) {
    return book;
  }
  const copy = { ...book };
  copy[contact.id] = contact;
  return copy;
}

function updateContact(book, id, changes) {
  if (!Object.hasOwn(book, id)) {
    return book;
  }
  const contact = { ...book[id] };
  for (const [key, value] of Object.entries(changes)) {
    if (key !== 'id') {
      contact[key] = value;
    }
  }
  const copy = { ...book };
  copy[id] = contact;
  return copy;
}

function removeContact(book, id) {
  const copy = { ...book };
  delete copy[id];
  return copy;
}

function toggleFavorite(book, id) {
  const copy = { ...book };
  const contact = { ...book[id] };
  contact.favorite = !contact.favorite;
  copy[id] = contact;
  return copy;
}

function addTag(book, id, tag) {
  if (book[id].tags.includes(tag)) {
    return book;
  }
  const tags = [...book[id].tags];
  tags.push(tag);
  const copy = { ...book };
  copy[id] = { ...book[id], tags };
  return copy;
}

function findByName(book, query) {
  const found = [];
  for (const id of Object.keys(book)) {
    const name = book[id].name.toLowerCase();
    if (name.includes(query.toLowerCase())) {
      found.push(book[id]);
    }
  }
  return found;
}

function countByCompany(book) {
  const counts = {};
  for (const id of Object.keys(book)) {
    let company = book[id].company;
    if (company === null) {
      company = 'bez firmy';
    }
    if (Object.hasOwn(counts, company)) {
      counts[company] += 1;
    } else {
      counts[company] = 1;
    }
  }
  return counts;
}

function draftContact(book, id) {
  const contact = book[id];
  if (contact === undefined) {
    return null;
  }
  return { ...contact, tags: [...contact.tags] };
}

function exportBook(book) {
  return JSON.stringify(book, (key, value) => (key === 'favorite' ? undefined : value));
}

function importBook(text) {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    const book = {};
    for (const id of Object.keys(parsed)) {
      book[id] = createContact(parsed[id]);
    }
    return book;
  } catch {
    return null;
  }
}
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Žádná funkce nezapisuje do adresáře, kontaktu ani pole štítků, které dostala v parametru — zapisuje nejvýš do kopie, kterou si sama vytvořila.
- Pravidlo „id změnit nejde" je v kódu na jednom místě a ostatní úpravy kontaktu ho využívají.
- Výchozí hodnoty kontaktu jsou napsané jednou (v `createContact`) a import je nepíše znovu.
- Jména proměnných říkají, co obsahují (`contact`, `rest`, `counts`), ne `obj` nebo `x`.
- Víš, kdy bys zvolil spread jedním výrazem a kdy kopii se zápisem po krocích.

## --extensions--

Rozšíření bez testů: hledání, které ignoruje i diakritiku (`normalize('NFD')` znáš z textů), funkce `mergeBooks(a, b)`, která sloučí dva adresáře a při shodném `id` vezme novější kontakt podle vlastnosti `updatedAt`, a uložení adresáře do `localStorage` s bezpečným načtením.
