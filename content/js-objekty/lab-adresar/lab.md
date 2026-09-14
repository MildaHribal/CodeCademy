---
title: "Adresář kontaktů"
runtime: js
---
# --description--
Vytvoř malou aplikaci nebo sadu funkcí, která funguje jako adresář kontaktů. Každý kontakt by měl být objekt. Naučíš se provádět běžné operace zcela bez mutace původních dat.

- Jako uživatel chci mít možnost přidat nový kontakt do adresáře. Nový adresář musí být vytvořen jako nová kopie původního pole.
- Jako uživatel chci upravit existující kontakt (např. změnit telefon) bez toho, abych mutoval původní objekt kontaktu nebo původní adresář.
- Jako uživatel chci vyhledat kontakt podle jména (hledání by mělo být case-insensitive).

# --hints--

Zkontroluj, že addContact přidá nový kontakt bez mutace původního pole.

```js
const initialContacts = [{ id: 1, name: 'Alice', phone: '123' }, { id: 2, name: 'Bob', phone: '456' }];
const newContacts = addContact(initialContacts, { id: 3, name: 'Cyril', phone: '789' });
assert.equal(newContacts.length, 3, 'Nové pole musí obsahovat 3 kontakty.');
assert.equal(initialContacts.length, 2, 'Původní pole musí zůstat nedotčeno.');
```

Zkontroluj, že updateContact upraví kontakt bez mutace.

```js
const initialContacts2 = [{ id: 1, name: 'Alice', phone: '123' }, { id: 2, name: 'Bob', phone: '456' }];
const updated = updateContact(initialContacts2, 2, { phone: '999' });
assert.equal(updated.find(c => c.id === 2).phone, '999', 'Telefon musí být upraven.');
assert.equal(initialContacts2.find(c => c.id === 2).phone, '456', 'Původní kontakt se nesmí změnit.');
assert.notEqual(updated, initialContacts2, 'Pole adresáře musí být nové.');
```

Zkontroluj, že findContact najde kontakt podle jména bez ohledu na velikost písmen.

```js
const initialContacts3 = [{ id: 1, name: 'Alice', phone: '123' }, { id: 2, name: 'Bob', phone: '456' }];
const found = findContact(initialContacts3, 'aLIce');
assert.equal(found.id, 1, 'Musí najít správný kontakt s ID 1.');
```

# --seed--

## --file-- script.js

```js
function addContact(contacts, newContact) {
  // Tady napiš kód
}

function updateContact(contacts, id, updates) {
  // Tady napiš kód
}

function findContact(contacts, name) {
  // Tady napiš kód
}
```

# --solution--

## --file-- script.js

```js
function addContact(contacts, newContact) {
  return [...contacts, newContact];
}

function updateContact(contacts, id, updates) {
  return contacts.map(c => c.id === id ? { ...c, ...updates } : c);
}

function findContact(contacts, name) {
  const lower = name.toLowerCase();
  return contacts.find(c => c.name.toLowerCase() === lower);
}
```

# --approaches--

## --approach-- Využití spread a map
Pro přidávání položek do pole použijeme spread operátor `[...contacts, newContact]`.
Pro úpravu objektu v poli projdeme pole pomocí `map()`. Pokud najdeme správné `id`, pomocí spread operátoru vytvoříme kopii objektu s úpravami.

### --file-- script.js
```js
function addContact(contacts, newContact) {
  return [...contacts, newContact];
}

function updateContact(contacts, id, updates) {
  return contacts.map(c => c.id === id ? { ...c, ...updates } : c);
}

function findContact(contacts, name) {
  const lower = name.toLowerCase();
  return contacts.find(c => c.name.toLowerCase() === lower);
}
```

# --review--

## --rubric--
- [ ] Mutují se někde předávané objekty nebo pole?
- [ ] Vrací všechny funkce požadované výstupy?
- [ ] Funguje hledání bez rozlišení velikosti písmen?
