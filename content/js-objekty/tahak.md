# Tahák: Objekty, reference a kopie

## Přístup k vlastnostem
```javascript
const user = { name: "Karel", "home-town": "Praha" };

// Tečková notace (pro normální názvy)
console.log(user.name);

// Závorková notace (pro speciální názvy nebo dynamické klíče v proměnné)
console.log(user["home-town"]);
const klic = "name";
console.log(user[klic]);
```

## Průchod objektem
```javascript
const car = { brand: "Ford", year: 2020 };

// Pole klíčů
Object.keys(car); // ["brand", "year"]

// Pole hodnot
Object.values(car); // ["Ford", 2020]

// Pole dvojic (klíč, hodnota)
Object.entries(car); // [["brand", "Ford"], ["year", 2020]]

// Iterace
for (const [key, value] of Object.entries(car)) {
  console.log(`${key}: ${value}`);
}
```

## Destrukturalizace
```javascript
const person = { id: 1, firstName: "Anna", role: "admin" };

// Vytažení vlastností do proměnných
const { firstName, role } = person;

// Přejmenování proměnné
const { firstName: jmeno } = person;

// Výchozí hodnota, pokud klíč chybí
const { age = 30 } = person;

// Rest operátor pro zbytek objektu
const { id, ...zbytek } = person; 
// zbytek je { firstName: "Anna", role: "admin" }
```

## Referenční datové typy
Proměnná s objektem neobsahuje přímo ten objekt, ale jen ukazatel na místo v paměti.
```javascript
const a = { hodnota: 10 };
const b = a; // nepředává data, pouze ukazatel

b.hodnota = 20; 
console.log(a.hodnota); // 20 - ovlivnili jsme originál
```

## Kopírování objektů

### Mělká kopie (Shallow Copy)
Kopíruje jen první úroveň. Zanořené objekty/pole se dál sdílí s originálem.
```javascript
const obj = { a: 1, vnoreny: { b: 2 } };

// Spread operátor (doporučeno)
const shallow1 = { ...obj };

// Object.assign
const shallow2 = Object.assign({}, obj);
```

### Hluboká kopie (Deep Copy)
Zcela oddělí kopii od originálu na všech úrovních zanoření.

#### `structuredClone()` (Moderní, doporučeno)
```javascript
const obj = { data: [1, 2], date: new Date() };
const deep = structuredClone(obj);
```

#### JSON postup (Starší, s omezeními)
```javascript
const deepJson = JSON.parse(JSON.stringify(obj));
// Pozor: Ztratí funkce a speciální objekty jako Date se převedou na text.
```

## Úprava objektu bez mutace (Immutability)
Místo úpravy stávajícího objektu vytvoříme nový se změněnými daty.
```javascript
const state = { count: 0, theme: "light" };

// Přepíšeme count, zbytek nakopírujeme
const newState = {
  ...state,
  count: state.count + 1
};
```
