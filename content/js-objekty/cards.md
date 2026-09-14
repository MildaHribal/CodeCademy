## --card-- output

Co vypíše tenhle kód?

```js
const song = { plays: 10 };
const current = song;
current.plays += 1;
console.log(song.plays);
```

### --expected--

11

### --why--

Myslíš si, že `current` je kopie? Přiřazení zkopírovalo jen odkaz, obě proměnné ukazují na jeden objekt a zápis přes `current` mění i `song`.

### --see--

js-objekty/reference-a-mutace#objekty-se-sdileji-pres-odkaz

## --card-- output

Co vypíše tenhle kód?

```js
const home = { city: 'Zlín' };
const copy = { ...home };
console.log(home === copy, home.city === copy.city);
```

### --expected--

false true

### --why--

`===` u objektů porovnává identitu: spread vytvořil nový objekt, takže `false`. Texty uvnitř se porovnávají podle hodnoty, takže `true`.

### --see--

js-objekty/reference-a-mutace#porovnani-se-pta-na-identitu

## --card-- output

Co vypíše tenhle kód?

```js
function clearFilters(filters) {
  filters = {};
}

const active = { maxPrice: 500 };
clearFilters(active);
console.log(active.maxPrice);
```

### --expected--

500

### --why--

Myslíš si, že funkce filtry vymazala? `filters = {}` jen přesměruje parametr na nový objekt. Objekt volajícího se nezmění — změnila by ho až mutace, třeba `filters.maxPrice = null`.

### --see--

js-objekty/reference-a-mutace#objekt-v-parametru-funkce

## --card-- output

Co vypíše tenhle kód?

```js
const config = Object.freeze({ api: { retries: 3 } });
config.api.retries = 5;
console.log(config.api.retries);
```

### --expected--

5

### --why--

`Object.freeze` zamkne jen první patro. `config.api` je odkaz na jiný objekt, a ten zamčený není.

### --see--

js-objekty/reference-a-mutace#object-freeze-je-melke

## --card-- output

Co vypíše tenhle kód?

```js
const labels = { cs: 'Košík', en: 'Cart' };
const lang = 'en';
console.log(labels.lang);
```

### --expected--

undefined

### --why--

Tečka bere jméno doslova a hledá klíč `lang`, který v objektu není. Klíč z proměnné přečte `labels[lang]`.

### --see--

js-objekty/objekty#tecka-misto-zavorek

## --card-- output

Co vypíše tenhle kód?

```js
const stock = { rohlik: 0 };
console.log(stock.rohlik ? 'skladem' : 'chybí', Object.hasOwn(stock, 'rohlik'));
```

### --expected--

chybí true

### --why--

Podmínka se ptá na hodnotu a `0` je nepravda. Na existenci klíče se ptá `Object.hasOwn`, a klíč `rohlik` v objektu je.

### --see--

js-objekty/objekty#podminka-na-hodnotu-misto-na-existenci

## --card-- output

Co vypíše tenhle kód?

```js
const user = { prefs: { dark: false } };
const copy = { ...user };
copy.prefs.dark = true;
console.log(user.prefs.dark);
```

### --expected--

true

### --why--

Spread kopíruje jen první patro. `copy.prefs` je tentýž objekt jako `user.prefs`, takže zápis mění i originál.

### --see--

js-objekty/kopie-a-json#melka-kopie-spread-a-object-assign

## --card-- output

Co vypíše tenhle kód?

```js
const event = { at: new Date('2026-05-01T08:00:00Z') };
const restored = JSON.parse(JSON.stringify(event));
console.log(typeof restored.at);
```

### --expected--

string

### --why--

JSON datum neumí: `JSON.stringify` z něj udělá text ve formátu ISO a `JSON.parse` ho nechá textem. Datum zpátky postaví `new Date(restored.at)`.

### --see--

js-objekty/kopie-a-json#datum-po-json

## --card-- output

Co vypíše tenhle kód?

```js
console.log(JSON.stringify({ note: undefined, coupon: null }));
```

### --expected--

{"coupon":null}

### --why--

Vlastnost s `undefined` z JSON potichu zmizí, `null` zůstane. Kdo potřebuje „prázdnou" hodnotu uložit, používá `null`.

### --see--

js-objekty/kopie-a-json#co-json-ztrati

## --card-- output

Co vypíše tenhle kód?

```js
console.log(Object.keys({ b: 1, 2: 1, a: 1, 1: 1 }).join(''));
```

### --expected--

12ba

### --why--

Klíče, které vypadají jako celé nezáporné číslo, jdou první a vzestupně. Ostatní následují v pořadí, v jakém vznikly.

### --see--

js-objekty/objekty#prochazeni-objektu-object-keys-values-a-entries

## --card-- output

Co vypíše tenhle kód?

```js
const { title: heading = 'Bez názvu' } = { title: '' };
console.log(heading === '');
```

### --expected--

true

### --why--

Výchozí hodnota v destrukturalizaci zabere jen na `undefined`. Prázdný text je platná hodnota, takže `heading` je `''`.

### --see--

js-objekty/objekty#destrukturalizace-vlastnosti-rovnou-do-promennych

## --card-- output

Co vypíše tenhle kód?

```js
const defaults = { lang: 'cs' };
const merged = Object.assign(defaults, { lang: 'en' });
console.log(defaults.lang, merged === defaults);
```

### --expected--

en true

### --why--

`Object.assign` zapisuje do prvního argumentu a ten vrací. Výchozí hodnoty se tak přepsaly. Bezpečně: `{ ...defaults, lang: 'en' }`.

### --see--

js-objekty/kopie-a-json#object-assign-do-vychozich-hodnot

## --card-- output

Co vypíše tenhle kód?

```js
const toUser = (name) => { name };
console.log(toUser('Ema'));
```

### --expected--

undefined

### --why--

Složená závorka hned za `=>` je tělo funkce, ne objekt, a funkce bez `return` vrací `undefined`. Objekt vrátí `(name) => ({ name })`.

### --see--

js-objekty/objekty#sipkova-funkce-ktera-ma-vratit-objekt

## --card-- output

Co vypíše tenhle kód?

```js
console.log('constructor' in {}, Object.hasOwn({}, 'constructor'));
```

### --expected--

true false

### --why--

`in` hledá i ve zděděných vlastnostech a `constructor` zdědil každý obyčejný objekt. `Object.hasOwn` se dívá jen na vlastní klíče.

### --see--

js-objekty/objekty#in-najde-i-zdedene-vlastnosti

## --card-- output

Co vypíše tenhle kód?

```js
console.log({ ...{ speed: 1 }, ...{ speed: undefined } }.speed);
```

### --expected--

undefined

### --why--

Spread kopíruje i vlastnost s hodnotou `undefined`, a pozdější vlastnost přepíše dřívější. Při slučování s výchozími hodnotami proto do objektu nedávej klíče s `undefined`.

### --see--

js-objekty/workshop-nastaveni-aplikace/008

## --card-- code js

Napiš funkci `withZip(order, zip)`, která vrátí novou objednávku s novým PSČ v objektu `address`. Původní objednávka ani její `address` se nesmí změnit.

### --seed--

```js
function withZip(order, zip) {
}
```

### --test--

```js
const order = { id: 7, address: { city: 'Brno', zip: '602 00' } };
const result = withZip(order, '612 00');
assert.deepEqual(result, { id: 7, address: { city: 'Brno', zip: '612 00' } }, "withZip(order, '612 00') má vrátit objednávku s novým PSČ a stejným městem");
assert.equal(order.address.zip, '602 00', 'withZip nesmí změnit PSČ v původní objednávce');
assert.notEqual(result.address, order.address, 'výsledek withZip má mít nový objekt address');
```

### --solution--

```js
function withZip(order, zip) {
  return { ...order, address: { ...order.address, zip } };
}
```

### --see--

js-objekty/kopie-a-json#kopie-po-patrech

## --card-- code js

Napiš funkci `withoutPassword(user)`, která vrátí nový objekt se všemi vlastnostmi uživatele kromě `password`. Původní objekt se nezmění.

### --seed--

```js
function withoutPassword(user) {
}
```

### --test--

```js
const user = { id: 3, email: 'ema@example.cz', password: 'tajne123' };
const result = withoutPassword(user);
assert.deepEqual(result, { id: 3, email: 'ema@example.cz' }, 'withoutPassword má vrátit uživatele bez password');
assert.equal(user.password, 'tajne123', 'withoutPassword nesmí smazat heslo z původního objektu');
```

### --solution--

```js
function withoutPassword(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}
```

### --see--

js-objekty/objekty#destrukturalizace-vlastnosti-rovnou-do-promennych

## --card-- code js

Napiš funkci `invert(dictionary)`, která vrátí nový objekt, ve kterém jsou klíče a hodnoty prohozené: z `{ cs: 'Ahoj' }` udělá `{ Ahoj: 'cs' }`.

### --seed--

```js
function invert(dictionary) {
}
```

### --test--

```js
assert.deepEqual(invert({ cs: 'Ahoj', en: 'Hello' }), { Ahoj: 'cs', Hello: 'en' }, "invert({ cs: 'Ahoj', en: 'Hello' }) má vrátit { Ahoj: 'cs', Hello: 'en' }");
assert.deepEqual(invert({}), {}, 'invert({}) má vrátit {}');
```

### --solution--

```js
function invert(dictionary) {
  const pairs = [];
  for (const [key, value] of Object.entries(dictionary)) {
    pairs.push([value, key]);
  }
  return Object.fromEntries(pairs);
}
```

### --see--

js-objekty/objekty#prochazeni-objektu-object-keys-values-a-entries

## --card-- code js

Napiš funkci `parseOr(text, fallback)`, která vrátí data z JSON textu, a když text není platný JSON, vrátí `fallback`.

### --seed--

```js
function parseOr(text, fallback) {
}
```

### --test--

```js
assert.deepEqual(parseOr('{"theme":"dark"}', {}), { theme: 'dark' }, "parseOr('{\"theme\":\"dark\"}', {}) má vrátit { theme: 'dark' }");
assert.deepEqual(parseOr('{"theme":', { theme: 'light' }), { theme: 'light' }, 'parseOr s poškozeným textem má vrátit fallback, ne spadnout');
assert.equal(parseOr('', 0), 0, "parseOr('', 0) má vrátit 0");
```

### --solution--

```js
function parseOr(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
```

### --see--

js-objekty/kopie-a-json#bezpecne-nacteni-json

## --card-- code js

Napiš funkci `label({ name, unit = 'ks', amount = 1 })` tak, aby nespadla ani při zavolání bez argumentu a vrátila text `'1 ks'` bez jména, nebo `'2 kg Mouka'` se jménem.

### --seed--

```js
function label({ name, unit = 'ks', amount = 1 }) {
  return name === undefined ? `${amount} ${unit}` : `${amount} ${unit} ${name}`;
}
```

### --test--

```js
assert.equal(label(), '1 ks', "label() bez argumentu má vrátit '1 ks', ne spadnout");
assert.equal(label({ name: 'Mouka', unit: 'kg', amount: 2 }), '2 kg Mouka', "label({ name: 'Mouka', unit: 'kg', amount: 2 }) má vrátit '2 kg Mouka'");
```

### --solution--

```js
function label({ name, unit = 'ks', amount = 1 } = {}) {
  return name === undefined ? `${amount} ${unit}` : `${amount} ${unit} ${name}`;
}
```

### --see--

js-objekty/objekty#destrukturalizace-z-undefined

## --card-- free

Proč jde měnit vlastnosti objektu uloženého v `const`?

### --back--

`const` hlídá proměnnou, ne hodnotu. Proměnná obsahuje odkaz na objekt a `const` jen zakáže přiřadit do ní jiný odkaz (`settings = {}`). Objekt samotný zůstává změnitelný, takže `settings.theme = 'dark'` projde. Opravdu zamknout objekt jde přes `Object.freeze`, ale jen první patro.

### --see--

js-objekty/reference-a-mutace#const-nezamrazi-obsah

## --card-- free

Proč `Object.freeze` nestačí, když chceš data v aplikaci chránit před nechtěnou změnou?

### --back--

`Object.freeze` zamkne jen první patro, vnořené objekty jde měnit dál. Zápis do zmrazené vlastnosti v obyčejném skriptu navíc nic nehlásí, jen se tiše neprovede, takže chybu hledáš dlouho. A zmrazení nic nekopíruje: zamkne originál, takže ho nezměníš ani tam, kde změnit chceš. V praxi se data chrání tím, že je funkce nemutují a místo zápisu vracejí nový objekt.

### --see--

js-objekty/reference-a-mutace#object-freeze-tise-selze

## --card-- free

Jaký je rozdíl mezi mělkou a hlubokou kopií a kdy použiješ kterou?

### --back--

Mělká kopie (`{ ...obj }`, `Object.assign({}, obj)`) vytvoří nový jen vnější objekt, vnořené objekty sdílí s originálem. Hluboká kopie (`structuredClone(obj)`) vytvoří nové objekty ve všech patrech. Na změnu jednoho údaje stačí mělká kopie, případně nový objekt v každém patře cesty ke změně. Hlubokou kopii použiju, když chci měnit cokoli, třeba koncept formuláře, který jde zahodit.

### --see--

js-objekty/kopie-a-json#kterou-kopii-vybrat

## --card-- free

Aplikace při startu načítá nastavení z `localStorage`. Na jaké situace musí kód myslet, aby nespadl ani nepřišel o data?

### --back--

Pod klíčem nemusí být nic: `getItem` vrátí `null` a použije se výchozí nastavení. Text může být poškozený: `JSON.parse` vyhodí `SyntaxError`, proto patří do `try…catch` s náhradní hodnotou. Platný JSON nemusí být objekt (`42`, `null`), a to je potřeba zkontrolovat zvlášť. Uložená data můžou být neúplná nebo ze starší verze, proto se slučují s výchozím nastavením po skupinách. A datum je po načtení text, takže se obnoví přes `new Date(…)`.

### --see--

js-objekty/kopie-a-json#bezpecne-nacteni-json

## --card-- free

Proč se v aplikacích se stavem (třeba v Reactu) data mění vytvořením nového objektu, a ne zápisem do starého?

### --back--

Změnu jde pak poznat obyčejným `===`: změněná část je nový objekt, nezměněné části zůstávají tytéž. Při mutaci by starý i nový stav ukazovaly na jeden objekt a změna by nebyla vidět, takže by se stránka nepřekreslila. Nový objekt navíc nerozbije data, která drží někdo jiný, třeba uložený stav pro tlačítko Zrušit.

### --see--

js-objekty/reference-a-mutace#porovnani-se-pta-na-identitu

## --card-- free

Proč je dobré ukládat jen to, čím se nastavení liší od výchozího, a při načtení ho slučovat s výchozím nastavením po skupinách?

### --back--

Uložený text je kratší a hlavně nezamrazí výchozí hodnoty: když nová verze aplikace změní výchozí hodnotu, kterou uživatel nikdy neměnil, dostane ji taky. Při načtení se chybějící hodnoty doplní z výchozího nastavení. Slučovat se musí po skupinách, protože spread slučuje jen první patro a uložená skupina s jedinou hodnotou by jinak nahradila celou výchozí skupinu.

### --see--

js-objekty/workshop-nastaveni-aplikace/016

## --card-- free

Proč je `Object.assign(DEFAULTS, saved)` past a jak ji opravíš?

### --back--

`Object.assign` zapisuje do svého prvního argumentu a ten vrací. Tady tedy přepíše výchozí hodnoty uloženými a všichni, kdo `DEFAULTS` použijí později, dostanou nastavení prvního uživatele. Oprava je dát jako cíl nový objekt, `Object.assign({}, DEFAULTS, saved)`, nebo psát `{ ...DEFAULTS, ...saved }`. Obojí slučuje jen první patro, vnořené skupiny je potřeba sloučit zvlášť.

### --see--

js-objekty/kopie-a-json#object-assign-do-vychozich-hodnot
