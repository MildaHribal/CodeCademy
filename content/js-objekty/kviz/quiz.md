---
pass: 0.8
---

# --questions--

## --question--

Co vypíše tenhle kód?

```js
const { city = 'Praha', zip = '110 00' } = { city: undefined, zip: null };
console.log(city, zip);
```

### --expected--

Praha null

### --why--

Výchozí hodnota v destrukturalizaci zabere jen tehdy, když je vlastnost `undefined`. `city` je `undefined`, a proto dostane `'Praha'`. `zip` v objektu je a má hodnotu `null`, takže výchozí `'110 00'` se nepoužije. Náhradu i za `null` by dal operátor `??`.

### --see--

js-objekty/objekty#destrukturalizace-vlastnosti-rovnou-do-promennych

## --question--

Co vypíše tenhle kód?

```js
const base = { size: 'M', color: 'černá' };
const pick = { color: 'bílá' };
console.log({ ...pick, ...base }.color);
```

### --expected--

černá

### --accept--

'černá'

### --why--

Při shodě klíčů vyhraje vlastnost, která je v závorkách později. Tady je později `...base`, takže přepíše bílou z `pick` zpátky na černou. Kdo chce přednost pro výběr uživatele, píše `{ ...base, ...pick }`.

### --see--

js-objekty/reference-a-mutace#uprava-bez-mutace-novy-objekt

## --question--

Co vypíše tenhle kód?

```js
const trip = { destination: 'Tatry', gear: { tent: true } };
const quick = { ...trip };
const safe = structuredClone(trip);
quick.gear.tent = false;
console.log(trip.gear.tent, safe.gear.tent);
```

### --expected--

false true

### --why--

Spread vytvořil nový jen vnější objekt, `quick.gear` je tentýž objekt jako `trip.gear`, a zápis ho změnil i v originálu. `structuredClone` vytvořila nový objekt i v patře `gear`, takže v `safe` zůstal stan `true`.

### --see--

js-objekty/kopie-a-json#hluboka-kopie-structuredclone

## --question--

Co vypíše tenhle kód?

```js
console.log(JSON.stringify({ tags: new Set(['deskovky']), count: 2 }));
```

### --expected--

{"tags":{},"count":2}

### --why--

JSON zná jen texty, čísla, `true`/`false`, `null`, pole a obyčejné objekty. `Set` se převede na prázdný objekt `{}` a jeho obsah se ztratí, aniž by kód nahlásil chybu. Kopii se `Set` zachová `structuredClone`, do JSON ho musíš převést sám.

### --see--

js-objekty/kopie-a-json#co-json-ztrati

## --question--

Která z funkcí vrátí objednávku s novým stavem a **nezmění** objekt, který dostala?

### --answer--

```js
function markPaid(order) {
  order.status = 'zaplaceno';
  return order;
}
```

#### --why--

Vrátí správný stav, ale zapisuje do objektu z parametru. Parametr ukazuje na objekt volajícího, takže se změní i jeho objednávka.

### --answer--

```js
function markPaid(order) {
  const paid = order;
  paid.status = 'zaplaceno';
  return paid;
}
```

#### --why--

`const paid = order` nevytvoří kopii, jen druhé jméno pro tentýž objekt. Zápis přes `paid` mění objednávku volajícího.

### --correct--

```js
function markPaid(order) {
  return { ...order, status: 'zaplaceno' };
}
```

#### --why--

Spread vytvoří nový objekt, zkopíruje do něj vlastnosti a `status` přepíše. Původní objednávka zůstane beze změny.

### --answer--

```js
function markPaid(order) {
  return Object.assign(order, { status: 'zaplaceno' });
}
```

#### --why--

`Object.assign` zapisuje do svého prvního argumentu, a tím je tady objednávka z parametru. Vrací tentýž, změněný objekt.

### --see--

js-objekty/reference-a-mutace#funkce-ktera-ma-vracet-zmutuje-vstup

## --question--

Co vypíše poslední řádek?

```js
function rename(user) {
  user.name = 'Iva';
  user = { name: 'Olga' };
  user.name = 'Pavla';
}

const member = { name: 'Eva' };
rename(member);
console.log(member.name);
```

### --expected--

Iva

### --accept--

'Iva'

### --why--

První řádek funkce mutuje objekt, na který ukazuje i `member`, takže jméno je `Iva`. Druhý řádek jen přesměruje parametr `user` na nový objekt a třetí mění už ten nový objekt. Proměnná `member` dál ukazuje na původní objekt s `Iva`.

### --see--

js-objekty/reference-a-mutace#objekt-v-parametru-funkce

## --question--

Co vypíše tenhle kód?

```js
const make = () => ({ ok: true });
const broken = () => { ok: true };
console.log(make().ok, broken());
```

### --expected--

true undefined

### --why--

V `make` jsou složené závorky obalené kulatými, takže jde o objekt a funkce ho vrátí. V `broken` začíná složená závorka tělo funkce: `ok:` je tam návěští a `true` obyčejný výraz, funkce nemá `return`, a vrací `undefined`. Chybu kód nehlásí, protože je platný.

### --see--

js-objekty/objekty#sipkova-funkce-ktera-ma-vratit-objekt

## --question--

Otevři v MDN stránku [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) a najdi, jak se jmenuje metoda, kterou může mít objekt, aby sám určil, co z něj `JSON.stringify` udělá. Právě díky ní se z `Date` stane text. Napiš jen jméno metody.

### --expected--

toJSON

### --accept--

toJSON()

### --why--

Když má hodnota metodu `toJSON()`, `JSON.stringify` převede místo ní to, co metoda vrátí. `Date` ji má a vrací text ve formátu ISO — proto je datum po `JSON.parse` jen text. V MDN je o ní oddíl *toJSON() behavior*.

### --see--

js-objekty/kopie-a-json#co-json-ztrati

## --question--

Objekt `library` obsahuje knihy v objektu i výpůjčky v `Map` (klíčem je čtenář). Potřebuješ kopii, do které smí formulář zapisovat v libovolném patře, a `Map` v ní má zůstat `Map`. Co použiješ?

### --answer--

`{ ...library }`

#### --why--

Spread vytvoří nový jen vnější objekt. Knihy i `Map` s výpůjčkami by v kopii zůstaly tytéž objekty jako v originálu.

### --answer--

`JSON.parse(JSON.stringify(library))`

#### --why--

Kopie přes JSON vytvoří nové objekty, ale `Map` převede na prázdný objekt. O výpůjčky bys přišel.

### --correct--

`structuredClone(library)`

#### --why--

Hluboká kopie přes `structuredClone` vytvoří nové objekty ve všech patrech a umí zkopírovat i `Map`, `Set` a `Date`.

### --answer--

`Object.freeze(library)`

#### --why--

`Object.freeze` nic nekopíruje, jen zamkne první patro existujícího objektu. Formulář by do něj nemohl zapisovat vůbec.

### --see--

js-objekty/kopie-a-json#kterou-kopii-vybrat

## --question--

Proměnná `field` obsahuje text `'price'`. Který zápis vytvoří objekt `{ price: 20 }`?

### --answer--

`{ field: 20 }`

#### --why--

Jméno klíče před dvojtečkou se bere doslova. Vznikne objekt s klíčem, který se jmenuje `field`.

### --correct--

`{ [field]: 20 }`

#### --why--

Hranaté závorky v zápisu objektu vyhodnotí výraz uvnitř a jeho výsledek použijí jako jméno klíče.

### --answer--

`{ 'field': 20 }`

#### --why--

Uvozovky jen umožní klíče s mezerou nebo pomlčkou. Klíč je pořád doslova text `field`.

### --see--

js-objekty/objekty#vypocitany-klic-v-literalu

## --question--

Co vypíše tenhle kód?

```js
function greet(name = 'host') {
  return `Ahoj, ${name}`;
}

console.log(greet(null));
```

### --expected--

Ahoj, null

### --why--

Výchozí hodnota parametru se použije, jen když je argument `undefined` (nebo chybí). `null` je předaná hodnota, a tak zůstane. Stejně se chová výchozí hodnota v destrukturalizaci.

### --see--

js-funkce/funkce#vychozi-a-zbytkove-parametry

## --question--

Co vypíše tenhle kód?

```js
function withVat(price) {
  price * 1.21;
}

console.log(withVat(100));
```

### --expected--

undefined

### --why--

Funkce výsledek spočítá, ale nevrátí: chybí `return`. Funkce bez `return` vrací `undefined`.

### --see--

js-funkce/funkce#chybejici-return

## --question--

Co vypíše poslední řádek?

```js
const prices = [120, 80];
let total = 0;

for (const price of prices) {
  let total = price;
}

console.log(total);
```

### --answer--

`200`

#### --why--

Uvnitř cyklu se nic nesčítá, jen přiřazuje. A přiřazuje se do jiné proměnné, než kterou vypisuješ.

### --answer--

`80`

#### --why--

Tak by to dopadlo, kdyby cyklus přiřazoval do vnější proměnné. `let` uvnitř bloku ale založí novou.

### --correct--

`0`

#### --why--

`let total` uvnitř cyklu založí novou proměnnou platnou jen v bloku, která vnější `total` zastíní. Vnější proměnná zůstane `0`.

### --see--

js-funkce/scope-a-hoisting#stineni-stejne-jmeno-uvnitr-a-venku

## --question--

Co vypíše poslední řádek?

```js
function label() {
  return 'hotovo';
}

const handler = label;
const text = label();
console.log(typeof handler, typeof text);
```

### --expected--

function string

### --why--

`label` bez závorek je samotná funkce jako hodnota, takže `handler` obsahuje funkci. `label()` funkci zavolá a do `text` uloží, co vrátila: text `'hotovo'`.

### --see--

js-funkce/funkce-jako-hodnoty#fn-vs-fn-predat-nebo-zavolat

# --code-- Košík e-shopu s deskovými hrami

## --file-- cart.js

```js
// Košík e-shopu s deskovými hrami. Napsal ho kolega, který už ve firmě není.
const EMPTY_CART = {
  items: {},
  coupon: null,
  shipping: { method: 'Zásilkovna', price: 79 },
  updatedAt: null,
};

const loadCart = function () {
  const raw = localStorage.getItem('cart');
  if (!raw) {
    return EMPTY_CART;
  }
  const cart = JSON.parse(raw);
  return Object.assign({}, EMPTY_CART, cart);
};

const addItem = function (cart, code, name, price) {
  const next = Object.assign({}, cart);
  if (next.items[code]) {
    next.items[code].qty = next.items[code].qty + 1;
  } else {
    next.items[code] = { name: name, price: price, qty: 1 };
  }
  next.updatedAt = new Date();
  return next;
};

const removeItem = function (cart, code) {
  const items = {};
  for (const key in cart.items) {
    if (key !== code) {
      items[key] = cart.items[key];
    }
  }
  return Object.assign({}, cart, { items: items });
};

const itemCount = function (cart) {
  let count = 0;
  const codes = Object.keys(cart.items);
  for (let i = 0; i < codes.length; i++) {
    count = count + cart.items[codes[i]].qty;
  }
  return count;
};

const cartTotal = function (cart) {
  let total = 0;
  for (const code in cart.items) {
    const line = cart.items[code];
    total = total + line.price * line.qty;
  }
  if (cart.coupon && cart.coupon.percent) {
    total = total - Math.round((total * cart.coupon.percent) / 100);
  }
  return total + cart.shipping.price;
};

const setShipping = function (cart, method, price) {
  const next = Object.assign({}, cart);
  next.shipping.method = method;
  next.shipping.price = price;
  return next;
};

const saveCart = function (cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const lastChange = function (cart) {
  if (cart.updatedAt === null) {
    return 'košík je prázdný';
  }
  return 'upraveno ' + cart.updatedAt.toLocaleDateString('cs-CZ');
};
```

## --question--

Zákazník přijde poprvé, `localStorage` je prázdné, a stránka zavolá `addItem(loadCart(), 'CAT', 'Catan', 990)`. Co se stane s `EMPTY_CART.items`?

### --answer--

Nic, `addItem` na řádku 19 pracuje s kopií košíku.

#### --why--

`Object.assign({}, cart)` je mělká kopie. Podívej se, odkud se na řádku 23 bere objekt, do kterého se zapisuje nová položka.

### --correct--

Přibude v něm Catan: `loadCart` na řádku 12 vrátí přímo `EMPTY_CART` a mělká kopie na řádku 19 sdílí jeho objekt `items`.

#### --why--

`next.items` je tentýž objekt jako `EMPTY_CART.items`, takže řádek 23 zapisuje do výchozího košíku. Každý další „prázdný" košík pak Catan obsahuje taky.

### --answer--

Kód spadne na řádku 20, protože `items` je prázdný objekt.

#### --why--

Čtení neexistujícího klíče z objektu nespadne, vrátí `undefined`, a podmínka pak jen přejde do `else`.

### --see--

js-objekty/kopie-a-json#melka-kopie-spread-a-object-assign

## --question--

Proměnná `cart` obsahuje košík s dopravou `{ method: 'Zásilkovna', price: 79 }`. Stránka zavolá `setShipping(cart, 'PPL', 99)` a výsledek zahodí. Jakou hodnotu má potom `cart.shipping.price`?

### --expected--

99

### --why--

Řádek 61 vytvoří mělkou kopii, takže `next.shipping` je tentýž objekt jako `cart.shipping`. Řádky 62 a 63 do něj zapisují, a změní tak dopravu i v původním košíku. Oprava: `{ ...cart, shipping: { method, price } }`.

### --see--

js-objekty/reference-a-mutace#spread-kopiruje-jen-prvni-patro

## --question--

V `localStorage` je pod klíčem `'cart'` uložený text `{"items":{},"shipping":{"method":"PPL"}}`. Co vrátí `cartTotal(loadCart())`?

### --expected--

NaN

### --why--

`Object.assign` na řádku 15 slučuje jen první patro: uložená skupina `shipping` nahradí výchozí celou, a cena v ní chybí. Řádek 57 pak počítá `0 + undefined`, což je `NaN`. Skupiny se musí slučovat zvlášť.

### --see--

js-objekty/kopie-a-json#kopie-po-patrech

## --question--

Zákazník přidá hru, stránka košík uloží přes `saveCart` a po obnovení zavolá `lastChange(loadCart())`. Kód spadne. Jaký **typ** chyby uvidíš v konzoli? Napiš jen jméno typu.

### --expected-- ignore-case

TypeError

### --why--

Řádek 68 převede `updatedAt` na text a `JSON.parse` na řádku 14 z něj datum nevyrobí. Řádek 75 pak volá `toLocaleDateString` na textu: `TypeError: cart.updatedAt.toLocaleDateString is not a function`. Oprava: `new Date(cart.updatedAt)`.

### --see--

js-objekty/kopie-a-json#datum-po-json

## --question--

Jak nejlépe opravit řádek 12, aby `loadCart` pro prázdné úložiště vracela košík, který nikdo nemůže přes `addItem` rozbít?

### --answer--

`return { ...EMPTY_CART };`

#### --why--

Nový by byl jen vnější objekt. `items` i `shipping` by zůstaly sdílené s `EMPTY_CART` a řádek 23 by do nich dál zapisoval.

### --correct--

`return structuredClone(EMPTY_CART);`

#### --why--

Hluboká kopie vytvoří nové `items` i `shipping`, takže zápisy v `addItem` a `setShipping` výchozí košík nezmění.

### --answer--

`return Object.freeze(EMPTY_CART);`

#### --why--

`Object.freeze` zamkne jen první patro. Do vnořeného `items` jde zapisovat dál, a košík by se rozbil úplně stejně.

### --see--

js-objekty/kopie-a-json#kterou-kopii-vybrat
