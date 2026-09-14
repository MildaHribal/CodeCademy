## --question--
Co vypíše následující kód?
```javascript
let a = { hodnota: 10 };
let b = a;
b.hodnota = 20;
console.log(a.hodnota);
```
### --answer--
`10`

#### --why--
Špatná volba.


### --correct--
`20`

### --answer--
`undefined`

#### --why--
Špatná volba.


### --answer--
Chybu.

#### --why--
Špatná volba.



## --question--
Co se stane, když objekt předáme jako argument do funkce a uvnitř ho upravíme?
```javascript
function zmenPrijmeni(osoba) {
  osoba.prijmeni = "Novák";
}
const reditel = { jmeno: "Karel", prijmeni: "Starý" };
zmenPrijmeni(reditel);
```
### --correct--
Objekt `reditel` bude mít po zavolání funkce `prijmeni` rovno `"Novák"`.

### --answer--
Objekt `reditel` zůstane nezměněn, mění se jen lokální kopie ve funkci.

#### --why--
Špatná volba.


### --answer--
Kód vyhodí chybu, protože nemůžeme měnit vlastnosti konstanty (`const`).

#### --why--
Špatná volba.


### --answer--
Funkce vrátí nový upravený objekt.

#### --why--
Špatná volba.



## --question--
Jaký bude výstup kódu používajícího destrukturalizaci?
```javascript
const user = { id: 1, name: "Anna", role: "admin" };
const { name, role: userRole } = user;
console.log(name, userRole);
```
### --answer--
`"Anna", "admin"`

#### --why--
Špatná volba.


### --correct--
`"Anna", "admin"` (a proměnná `role` nebude definovaná)

### --answer--
`undefined, "admin"`

#### --why--
Špatná volba.


### --answer--
Chyba, `role` se nedá přejmenovat takto.

#### --why--
Špatná volba.



## --question--
Jak se správně vytvoří hluboká kopie objektu pomocí moderního JavaScriptu?
### --answer--
`const copy = { ...obj };`

#### --why--
Špatná volba.


### --answer--
`const copy = Object.assign({}, obj);`

#### --why--
Špatná volba.


### --correct--
`const copy = structuredClone(obj);`

### --answer--
`const copy = obj.clone();`

#### --why--
Špatná volba.



## --question--
Co se stane s metodou `pozdrav` po provedení kopie přes JSON?
```javascript
const clovek = {
  jmeno: "Petr",
  pozdrav() { return "Ahoj"; }
};
const klon = JSON.parse(JSON.stringify(clovek));
```
### --correct--
Zmizí, `klon.pozdrav` bude `undefined`.

### --answer--
Zůstane funkční a můžeme ji zavolat jako `klon.pozdrav()`.

#### --why--
Špatná volba.


### --answer--
V objektu zůstane, ale jako prázdný řetězec.

#### --why--
Špatná volba.


### --answer--
Během transformace JSON.stringify to vyhodí chybu.

#### --why--
Špatná volba.



## --question--
Máme pole uživatelů a chceme získat pouze pole jejich ID. Jaká je správná syntaxe s využitím šipkové funkce? (Opakování funkcí)
```javascript
const users = [{ id: 1 }, { id: 2 }, { id: 3 }];
const ids = users.map(_____);
```
### --answer--
`user.id => user`

#### --why--
Špatná volba.


### --correct--
`user => user.id`

### --answer--
`(user) { return user.id }`

#### --why--
Špatná volba.


### --answer--
`(user) => { user.id }`

#### --why--
Špatná volba.



## --question--
Co vypíše tento kód kombinující pole, spread operátor a reference?
```javascript
const arr1 = [{ id: 1 }];
const arr2 = [...arr1];
arr2[0].id = 2;
console.log(arr1[0].id);
```
### --answer--
`1`

#### --why--
Špatná volba.


### --correct--
`2`

### --answer--
`undefined`

#### --why--
Špatná volba.


### --answer--
Kód vyhodí chybu

#### --why--
Špatná volba.



## --question--
Jak správně předáme funkci jako callback k pozdějšímu spuštění? (Opakování funkcí)
### --answer--
`setTimeout(mojeFunkce(), 1000);`

#### --why--
Špatná volba.


### --correct--
`setTimeout(mojeFunkce, 1000);`

### --answer--
`setTimeout(function mojeFunkce, 1000);`

#### --why--
Špatná volba.


### --answer--
`setTimeout("mojeFunkce()", 1000);`

#### --why--
Špatná volba.



## --question--
Máme následující kód používající asynchronní operaci a destrukturalizaci.
```javascript
const nastaveni = { barva: "modra", pismo: "Arial" };
const novaData = { barva: "cervena", velikost: 12 };
const vysledek = { ...nastaveni, ...novaData };
```
Jakou hodnotu bude mít `vysledek.barva`?
### --answer--
`"modra"`

#### --why--
Špatná volba.


### --correct--
`"cervena"`

### --answer--
Bude to pole `["modra", "cervena"]`

#### --why--
Špatná volba.


### --answer--
Kód spadne kvůli konfliktu klíčů.

#### --why--
Špatná volba.



## --question--
Chceme vytvořit mělkou kopii (shallow copy) pole `seznam`. Která možnost to **NEZAJISTÍ**?
### --answer--
`const kopie = [...seznam];`

#### --why--
Špatná volba.


### --answer--
`const kopie = seznam.slice();`

#### --why--
Špatná volba.


### --answer--
`const kopie = Array.from(seznam);`

#### --why--
Špatná volba.


### --correct--
`const kopie = seznam;`

