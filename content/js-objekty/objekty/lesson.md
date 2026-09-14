# Objekty

:::check pretest
Co vypíše poslední řádek? Tipni si, i když si nejsi jistý.

```js
const player = { nick: 'Ema_CZ', level: 42 };
console.log(player.rank);
```

### --answer--

Vyhodí chybu `ReferenceError`, protože `rank` neexistuje.

#### --why--

`ReferenceError` patří k neznámé **proměnné**. Chybějící vlastnost objektu se chová jinak — jak, uvidíš v části o chybějících vlastnostech.

### --correct--

`undefined`

#### --why--

Čtení vlastnosti, která v objektu není, nespadne a vrátí `undefined`. Proč je to spíš past než výhoda, uvidíš v části o chybějících vlastnostech.

### --answer--

`null`

#### --why--

`null` do proměnné nebo vlastnosti vždycky někdo zapíše sám. Co JavaScript vrátí sám od sebe, vysvětlí část o chybějících vlastnostech.
:::

:::check pretest
Objekt `stock` říká, kolik kusů kterého zboží je skladem. Jak zjistíš, kolik **různých druhů** zboží v něm je?

```js
const stock = { kofola: 120, tatranka: 0, horalky: 35 };
```

### --answer--

`stock.length`

#### --why--

`length` mají pole a řetězce. Obyčejný objekt ji nemá — jak se počítají jeho klíče, ukáže poslední část lekce.

### --correct--

`Object.keys(stock).length`

#### --why--

`Object.keys` vrátí pole klíčů a délka toho pole je počet vlastností. Víc v části o procházení objektu.

### --answer--

`stock.size`

#### --why--

`size` má `Map` a `Set`, ne obyčejný objekt. Jak se počítají klíče objektu, ukáže poslední část lekce.
:::

Profil na sociální síti, produkt v e-shopu, hráč na herním serveru, odpověď z API — každý takový záznam je v JavaScriptu objekt. Kdo umí s objekty, umí číst skoro jakákoli data, která web dostane.

Zkus si údaje o jednom produktu uložit bez objektu:

```js
const productName = 'Kofola 2 l';
const productPrice = 39;
const productStock = 120;
```

Funkce, která má produkt vypsat, potřebuje tři parametry. Druhý produkt znamená další tři proměnné, a když přibude údaj o slevě, musíš upravit každé volání. Údaje o jedné věci patří k sobě, a proto je chceš mít v **jedné** hodnotě.

> [!REMEMBER]
> **Objekt je jedna hodnota, ve které má každý údaj své jméno: klíč ukazuje na hodnotu.**
> Klíčům říkáme vlastnosti. Hodnotou může být cokoli, i další objekt nebo funkce.

## Objekt a tečka

[[Objekt]] zapíšeš do složených závorek jako dvojice `klíč: hodnota` oddělené čárkou. Každé dvojici se říká [[vlastnost]] (*property*). Hodnotu přečteš tečkou za jménem objektu, stejně jako `text.length`.

:::live js
```js
const product = {
  name: 'Kofola 2 l',
  price: 39,
  inStock: true,
  producer: { name: 'Kofola ČeskoSlovensko', city: 'Krnov' },
};

console.log(product.name);
console.log(product.producer.city);

product.price = 35;
product.discount = 10;
console.log(product);
```
:::

Zkus přidat vlastnost `volume: 2` a vypiš ji. Pak zkus `product.producer.name` a sleduj, jak tečky jdou za sebou do zanořeného objektu.

Zápis `product.price = 35` přepíše existující vlastnost, `product.discount = 10` přidá novou. Objekt v `const` se měnit dá — proč, vysvětlí hned další lekce.

Když se jméno proměnné shoduje s klíčem, stačí klíč napsat jednou. Tomu se říká zkrácený zápis vlastnosti (*shorthand property*):

```js
const nick = 'Ema_CZ';
const level = 42;
const player = { nick, level }; // totéž jako { nick: nick, level: level }
```

:::check
Co vypíše poslední řádek?

```js
const city = 'Olomouc';
const event = { title: 'Festival světla', city };
console.log(event.city);
```

### --expected--

Olomouc

### --accept--

'Olomouc'

### --why--

`{ title: 'Festival světla', city }` je zkrácený zápis `city: city`. Vlastnost `city` tedy dostala hodnotu proměnné `city`.

### --see--

js-objekty/objekty#objekt-a-tecka
:::

## Hranaté závorky: klíč v proměnné

Tečka má omezení: za ní musí stát jméno klíče **napsané přímo v kódu**. Když je jméno klíče uložené v proměnné (uživatel vybral sloupec, jazyk, velikost), potřebuješ hranaté závorky. Uvnitř nich může být jakýkoli výraz, jehož výsledkem je text.

Co vypíše tenhle kód?

:::live js predict
```js
const product = { name: 'Kofola 2 l', price: 39 };
const field = 'price';

console.log(product.field, product[field]);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- undefined 39
--why-- `product.field` hledá klíč, který se **jmenuje** `field`, a ten v objektu není. `product[field]` nejdřív vyhodnotí proměnnou `field` na text `'price'` a teprve pak hledá klíč `price`. Zkus změnit `field` na `'name'` a sleduj druhou hodnotu.
:::

Hranaté závorky potřebuješ i pro klíče, které nejsou platným jménem proměnné — s mezerou, pomlčkou nebo začínající číslicí:

```js
const sizes = { 'XL': 4, 'dětská 128': 2 };
console.log(sizes['dětská 128']);
```

### Vypočítaný klíč v literálu

Totéž funguje i při zakládání objektu. Klíč v hranatých závorkách se vyhodnotí, a vznikne tak [[vypočítaný klíč]] (*computed property name*):

:::live js
```js
function createFilter(field, value) {
  return { [field]: value };
}

console.log(createFilter('city', 'Brno'));
console.log(createFilter('maxPrice', 500));
```
:::

Zkus smazat hranaté závorky kolem `field` a sleduj, jaký klíč vznikne.

> [!TIP]
> Pravidlo: když jméno klíče znáš při psaní kódu, piš tečku (`product.price`). Když ho znáš až za běhu, piš závorky (`product[field]`).

:::check
Objekt `translations` má klíče podle jazyků (`cs`, `en`, `de`) a proměnná `lang` obsahuje jazyk, který si uživatel vybral. Napiš výraz, který vrátí překlad pro vybraný jazyk.

### --expected--

translations[lang]

### --why--

Jméno klíče je v proměnné, takže tečka nestačí: `translations.lang` by hledalo klíč, který se jmenuje `lang`.

### --see--

js-objekty/objekty#hranate-zavorky-klic-v-promenne
:::

:::explain
Vysvětli vlastními slovy, kdy musíš na vlastnost objektu použít hranaté závorky a proč tečka nestačí.

## --model--

Tečka bere to, co je za ní, doslova jako jméno klíče. Když je jméno klíče uložené v proměnné nebo ho musím spočítat, potřebuju hranaté závorky, protože výraz uvnitř se nejdřív vyhodnotí a teprve výsledek se použije jako klíč. Závorky potřebuju i pro klíče s mezerou nebo pomlčkou, které nejsou platným jménem. Když jméno klíče znám předem, píšu tečku, protože se líp čte.

## --checklist--

- Tečka bere jméno za sebou doslova jako klíč.
- Výraz v hranatých závorkách se nejdřív vyhodnotí a jeho výsledek je klíč.
- Závorky jsou nutné, když je klíč v proměnné nebo ho počítám.
- Závorky jsou nutné i pro klíče s mezerou nebo pomlčkou.
:::

## Metody: funkce ve vlastnosti

Hodnotou vlastnosti může být i funkce. Takové vlastnosti říkáme [[metoda]] (*method*). Znáš je dávno: `console.log` je metoda `log` objektu `console`, `Math.round` je metoda objektu `Math`.

:::live js
```js
const price = {
  vat: 0.21,
  withVat(amount) {
    return Math.round(amount * (1 + price.vat));
  },
  format(amount) {
    return `${amount} Kč`;
  },
};

console.log(price.format(price.withVat(100)));
console.log(price.format);
```
:::

Zápis `withVat(amount) { … }` je zkratka za `withVat: function (amount) { … }`. Poslední řádek čte `price.format` bez kulatých závorek: metodu nezavolá, jen vypíše funkci samotnou. Zkus za něj připsat `(250)` a sleduj, jak se výpis změní.

> [!NOTE]
> Metody často pracují s „vlastním" objektem přes `this`. K `this` a jeho pastem se dostaneme v sekci Closures, `this` a funkcionální styl. Teď stačí vědět, že metoda je obyčejná funkce uložená ve vlastnosti.

:::check
Co udělá řádek `const result = price.format;` z ukázky výše?

### --answer--

Zavolá metodu `format` a do `result` uloží text.

#### --why--

Bez kulatých závorek se funkce nevolá. Porovnej s řádkem, kde je `price.format(…)`.

### --correct--

Uloží do `result` samotnou funkci, nic se nevypočítá.

#### --why--

Vlastnost `format` obsahuje funkci a čtení vlastnosti vrátí právě ji. Zavolá ji až `result(100)` nebo `price.format(100)`.

### --answer--

Vyhodí chybu, protože chybí argument `amount`.

#### --why--

Chybějící argument by nevadil ani při volání (parametr by byl `undefined`). Tady se ale funkce vůbec nevolá.

### --see--

js-objekty/objekty#metody-funkce-ve-vlastnosti
:::

## Když vlastnost chybí: `?.`, `in` a `Object.hasOwn`

Čtení vlastnosti, která v objektu není, vrátí `undefined` a nespadne. Spadne až další krok — když z `undefined` zkusíš číst dál:

:::live js
```js
const player = { nick: 'Ema_CZ', clan: null };

console.log(player.clan);
console.log(player.stats);

try {
  console.log(player.stats.kills);
} catch (error) {
  console.log(error.message);
}
```
:::

Blok `try…catch` tu jen zachytí chybu, aby ukázka doběhla (podrobně ho probereme v sekci o chybách a ladění). Bez něj by poslední čtení skončilo hláškou `TypeError: Cannot read properties of undefined (reading 'kills')`. Chyba neříká, že chybí `stats`, ale že ses pokusil číst `kills` z `undefined`.

### Volitelné řetězení `?.`

Volitelné řetězení (*optional chaining*) `?.`, které znáš ze základů, se zastaví, když je hodnota vlevo `undefined` nebo `null`, a celý výraz vrátí `undefined`. S operátorem `??` pak doplníš náhradní hodnotu:

```js
player.stats?.kills;              // stats chybí: bez chyby, výsledek undefined
player.clan?.name ?? 'bez klanu'; // klan je null: dosadí se náhrada
player.greet?.();                 // metodu zavolá, jen když existuje
```

Zkus v ukázce výše změnit `player.stats.kills` na `player.stats?.kills ?? 0` a sleduj, že `catch` už nic nezachytí.

### Existuje ta vlastnost?

Ne vždy tě zajímá hodnota. Někdy potřebuješ vědět, **jestli klíč v objektu je** — třeba jestli hráč už má záznam, i když je jeho skóre `0`. Na to jsou dva nástroje:

- `'kills' in player` — je klíč v objektu, nebo v tom, co objekt zdědil?
- `Object.hasOwn(player, 'kills')` — má ten klíč objekt **sám**?

Každý obyčejný objekt po narození dědí pár metod, třeba `toString`. Operátor `in` je vidí:

:::live js predict
```js
const scores = { Ema_CZ: 0, Kuba: 12 };

console.log('toString' in scores, Object.hasOwn(scores, 'toString'));
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- true false
--why-- `in` hledá i ve vlastnostech, které objekt zdědil, a `toString` zdědil každý obyčejný objekt. `Object.hasOwn` se dívá jen na vlastní klíče, tedy `Ema_CZ` a `Kuba`. Zkus se zeptat na `'Ema_CZ'` a sleduj, že obě odpovědi budou `true`.
:::

> [!REMEMBER]
> **Chybějící vlastnost vrátí `undefined`.** Na „existuje ten klíč?" se ptej přes `Object.hasOwn(objekt, klíč)`, na hodnotu s náhradou přes `?.` a `??`.

:::check
Objekt `order` může a nemusí mít vlastnost `delivery` s objektem, ve kterém je `city`. Napiš výraz, který vrátí město doručení, a když chybí, text `'osobní odběr'`.

### --expected--

order.delivery?.city ?? 'osobní odběr'

### --accept--

order?.delivery?.city ?? 'osobní odběr'

### --why--

`?.` se zastaví na chybějícím `delivery` a vrátí `undefined`, `??` pak dosadí náhradu. Samotné `order.delivery.city` by pro objednávku bez doručení spadlo na `TypeError`.

### --see--

js-objekty/objekty#volitelne-retezeni
:::

## Destrukturalizace: vlastnosti rovnou do proměnných

Často z objektu potřebuješ pár vlastností do proměnných. [[Destrukturalizace]] (*destructuring*) to zapíše na jeden řádek: nalevo od `=` vyjmenuješ klíče ve složených závorkách a vzniknou proměnné se stejnými jmény.

```js
const player = { nick: 'Ema_CZ', level: 42, clan: null };

const { nick, level } = player;          // const nick = player.nick; const level = player.level;
const { nick: name } = player;           // přejmenování: proměnná name
const { rank = 'nováček' } = player;     // výchozí hodnota, když rank chybí
const { stats: { kills } = {} } = player; // zanoření s pojistkou
```

Tři tečky na konci posbírají [[zbytek vlastností]] (*rest*) do nového objektu: `const { clan, ...publicInfo } = player` dá do `publicInfo` všechny vlastnosti kromě `clan`. Hodí se, když chceš z objektu něco vynechat, třeba heslo.

Nejčastěji uvidíš destrukturalizaci **v parametrech funkce**. Funkce pak rovnou říká, které vlastnosti z objektu potřebuje:

:::live js
```js
function playerLabel({ nick, level = 1, clan = 'bez klanu' }) {
  return `${nick} (úroveň ${level}, ${clan})`;
}

console.log(playerLabel({ nick: 'Kuba', level: 7, clan: 'Sokoli' }));
console.log(playerLabel({ nick: 'Novacek' }));
```
:::

Zkus zavolat `playerLabel({ nick: 'Ota', clan: null })` a sleduj, co se vypíše místo klanu.

Výchozí hodnota se použije jen tehdy, když je vlastnost `undefined`. Na `null` nezabere:

:::live js predict
```js
const settings = { theme: null };
const { theme = 'světlé', fontSize = 16 } = settings;

console.log(theme, fontSize);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- null 16
--why-- `fontSize` v objektu chybí, je tedy `undefined` a dostane výchozí `16`. `theme` ale v objektu **je** a má hodnotu `null`. Výchozí hodnota v destrukturalizaci zabere jen na `undefined`. Když chceš náhradu i za `null`, napiš `theme ?? 'světlé'`.
:::

:::check
Z objektu `article` potřebuješ vlastnost `title`, ale v proměnné se má jmenovat `heading`. Napiš celý řádek s destrukturalizací.

### --expected--

const { title: heading } = article

### --accept--

let { title: heading } = article

### --why--

Ve složených závorkách destrukturalizace je vlevo jméno klíče a vpravo za dvojtečkou jméno nové proměnné. Proměnná `title` přitom nevznikne.

### --see--

js-objekty/objekty#destrukturalizace-vlastnosti-rovnou-do-promennych
:::

## Procházení objektu: `Object.keys`, `values` a `entries`

Objekt nemá `length` a nejde přímo projít cyklem `for…of`. Pomůžou tři funkce, které z objektu vyrobí pole:

| volání | vrátí | pro `{ kofola: 120, horalky: 35 }` |
|---|---|---|
| `Object.keys(obj)` | pole klíčů | `['kofola', 'horalky']` |
| `Object.values(obj)` | pole hodnot | `[120, 35]` |
| `Object.entries(obj)` | pole dvojic `[klíč, hodnota]` | `[['kofola', 120], ['horalky', 35]]` |

Pole projdeš cyklem `for…of` a počet položek zjistíš přes `length`. S poli do hloubky budeš pracovat v sekci Pole, tady ti stačí tohle.

:::live js
```js
const stock = { kofola: 120, tatranka: 0, horalky: 35 };

console.log(Object.keys(stock).length);

let total = 0;
for (const count of Object.values(stock)) {
  total += count;
}
console.log(total);

for (const [product, count] of Object.entries(stock)) {
  console.log(`${product}: ${count} ks`);
}
```
:::

Zápis `[product, count]` v cyklu je destrukturalizace pole: první položka dvojice jde do `product`, druhá do `count`. Zkus přidat do `stock` další zboží a sleduj všechny tři výpisy.

Opačným směrem jde `Object.fromEntries`: z pole dvojic postaví objekt. Hodí se, když chceš objekt přetvořit — projdeš dvojice, upravíš je a složíš nový objekt:

:::live js
```js
const prices = { kofola: 39, horalky: 22 };

const pairs = [];
for (const [product, price] of Object.entries(prices)) {
  pairs.push([product, `${price} Kč`]);
}

console.log(Object.fromEntries(pairs));
```
:::

Zkus do dvojice místo `product` dát `product.toUpperCase()` a sleduj, jak se změní klíče.

> [!NOTE]
> Starší kód prochází objekty cyklem `for…in`. Ten ale projde i vlastnosti, které objekt zdědil, pokud jsou vyčíslitelné. `Object.keys` a `Object.entries` vracejí jen vlastní klíče, proto je používej.

Klíče objektu jsou vždycky texty. A klíče, které vypadají jako celé číslo, mají zvláštní pořadí:

:::live js predict
```js
const shirtSizes = { M: 3, 42: 1, S: 5, 38: 2 };

console.log(Object.keys(shirtSizes).join(', '));
```
--question-- Co vypíše `console.log`?
--expected-- 38, 42, M, S
--why-- Klíče, které vypadají jako celé nezáporné číslo, jdou vždycky první a seřazené vzestupně. Ostatní klíče následují v pořadí, v jakém vznikly. A všechny jsou texty: `'38'`, ne `38`. Když ti na pořadí záleží, nespoléhej na pořadí klíčů a hodnoty si seřaď.
:::

:::check
Co vrátí `Object.entries({ Kofola: 39 })`? Napiš výsledek tak, jak by ho vypsala konzole.

### --expected--

[['Kofola', 39]]

### --why--

`Object.entries` vrací **pole** dvojic a každá dvojice je pole `[klíč, hodnota]`. I u objektu s jedinou vlastností je to pole s jednou dvojicí.

### --see--

js-objekty/objekty#prochazeni-objektu-object-keys-values-a-entries
:::

## Typické chyby a pasti

### Tečka místo závorek

> [!PITFALL]
> **`obj.key` hledá klíč, který se jmenuje `key`, ne ten, jehož jméno je v proměnné `key`.**
> Příznak: funkce `getField(product, field)` vrací pro každé pole `undefined`. Oprava: `product[field]`.

### Překlep v názvu vlastnosti

> [!PITFALL]
> **Překlep v názvu vlastnosti nevyhodí chybu, jen vrátí `undefined`.** `product.prcie * 2` dá tiše `NaN`
> a chyba se ukáže až o kus dál, třeba jako „NaN Kč" na stránce. Oprava: když výsledek nesedí,
> vypiš si objekt celý (`console.log(product)`) a porovnej jména klíčů znak po znaku.

### Podmínka na hodnotu místo na existenci

Chceš vědět, jestli má produkt vyplněný údaj o skladu. Co vypíše tenhle kód?

:::live js predict
```js
const product = { name: 'Tatranka', stock: 0 };

if (product.stock) {
  console.log('údaj o skladu máme');
} else {
  console.log('údaj o skladu chybí');
}
```
--question-- Co vypíše tenhle kód?
--expected-- údaj o skladu chybí
--why-- Údaj tam je, jen má hodnotu `0`, a nula je v podmínce nepravda. Podmínka se neptá „existuje?", ale „je hodnota pravdivá?". Stejně dopadne prázdný text `''` nebo `false`.
:::

> [!PITFALL]
> **`if (obj.x)` neplatí i pro existující hodnoty `0`, `''` a `false`.** Příznak: zboží s nulovým
> skladem se tváří jako zboží bez údaje. Oprava: `Object.hasOwn(product, 'stock')`, nebo
> `product.stock !== undefined`.

### Destrukturalizace z `undefined`

> [!PITFALL]
> **Funkce s destrukturalizací v parametru spadne, když ji zavoláš bez argumentu.**
> `playerLabel()` skončí hláškou `TypeError: Cannot destructure property 'nick' of 'undefined' as it is undefined.`
> Oprava: dej celému parametru výchozí prázdný objekt, `function playerLabel({ nick, level = 1 } = {})`.

### `in` najde i zděděné vlastnosti

> [!PITFALL]
> **`'toString' in scores` je `true`, i když nikdo takový klíč nezapsal.** Příznak: kontrola „je hráč
> v tabulce?" projde pro jména `toString` nebo `constructor`. Oprava: `Object.hasOwn(scores, nick)`.

### Šipková funkce, která má vrátit objekt

Šipková funkce bez složených závorek vrací svůj výraz. Co ale vrátí, když ten výraz je objekt?

:::live js predict
```js
const toPoint = (x, y) => { x, y };

console.log(toPoint(3, 4));
```
--question-- Co vypíše `console.log`?
--expected-- undefined
--why-- Složená závorka hned za `=>` neznamená objekt, ale **tělo funkce**. Uvnitř je výraz `x, y`, který nic nevrací, a funkce bez `return` vrátí `undefined`. Objekt musíš obalit kulatými závorkami: `(x, y) => ({ x, y })`.
:::

> [!PITFALL]
> **`() => { name }` vrátí `undefined`, ne objekt.** Oprava: obal objekt kulatými závorkami, `() => ({ name })`.

:::check
Funkce má vrátit hodnotu vlastnosti, jejíž jméno dostane v parametru. Pro `getField({ city: 'Brno' }, 'city')` ale vrací `undefined`. Co je špatně?

```js
function getField(record, field) {
  return record.field;
}
```

### --answer--

Chybí `return`.

#### --why--

`return` tam je. Rozmysli si, jaký klíč přesně hledá výraz za ním.

### --correct--

`record.field` hledá klíč `field`, ne klíč, jehož jméno je v parametru.

#### --why--

Tečka bere jméno doslova. Klíč z proměnné přečte až `record[field]`.

### --answer--

Parametr `record` je kopie objektu, a proto je prázdná.

#### --why--

Funkce dostane tentýž objekt, ne prázdnou kopii. Chyba je ve způsobu, jakým se klíč čte.

### --see--

js-objekty/objekty#tecka-misto-zavorek
:::

## Kde to najdeš v MDN

- [Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects) — průvodce objekty od literálu po metody. Oddíly *Accessing properties* a *Enumerating properties* odpovídají téhle lekci.
- [Optional chaining (?.)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) — `?.` u vlastností, závorek i volání metod, a proč se nedá použít na levé straně přiřazení.
- [Object.hasOwn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) — rozdíl proti operátoru `in` a proti starší metodě `hasOwnProperty`.
- [Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) — všechny tvary destrukturalizace, včetně výchozích hodnot a přejmenování.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const votes = {};
const option = 'pizza';

votes[option] = 3;
votes.option = 1;

console.log(Object.keys(votes).join(', '));
```

### --expected--

pizza, option

### --why--

`votes[option]` použije hodnotu proměnné, takže vznikne klíč `pizza`. `votes.option` založí klíč, který se doslova jmenuje `option`. Objekt má tedy dva různé klíče.

### --see--

js-objekty/objekty#hranate-zavorky-klic-v-promenne

## --question--

Kvíz ukládá odpovědi do objektu `answers`, kde klíč je číslo otázky a hodnota odpověď. Odpověď může být i `0` nebo prázdný text. Která podmínka správně zjistí, jestli student na otázku `q3` odpověděl?

### --answer--

`if (answers.q3)`

#### --why--

Podmínka se ptá, jestli je hodnota pravdivá. Odpověď `0` nebo `''` by se tvářila jako chybějící.

### --correct--

`if (Object.hasOwn(answers, 'q3'))`

#### --why--

`Object.hasOwn` se ptá jen na to, jestli klíč v objektu je, a hodnota nerozhoduje.

### --answer--

`if ('q3' in answers.toString())`

#### --why--

`toString()` z objektu udělá text a `in` na textu nefunguje. Na existenci klíče se ptej přímo objektu.

### --see--

js-objekty/objekty#existuje-ta-vlastnost

## --question--

Co vypíše poslední řádek?

```js
function shippingLabel({ city, zip = '000 00' } = {}) {
  return `${zip} ${city ?? 'neznámé město'}`;
}

console.log(shippingLabel());
```

### --expected--

000 00 neznámé město

### --why--

Bez argumentu dostane parametr výchozí `{}`. Z prázdného objektu je `zip` `undefined`, a proto dostane výchozí hodnotu, a `city` je `undefined`, takže zabere `??`. Bez `= {}` by volání spadlo na `Cannot destructure property`.

### --see--

js-objekty/objekty#destrukturalizace-z-undefined

## --question--

Co vypíše poslední řádek?

```js
const labels = Object.fromEntries([
  ['cs', 'Košík'],
  ['en', 'Cart'],
]);

console.log(labels.en);
```

### --expected--

Cart

### --accept--

'Cart'

### --why--

`Object.fromEntries` postaví z každé dvojice `[klíč, hodnota]` jednu vlastnost. Vznikne `{ cs: 'Košík', en: 'Cart' }`.

### --see--

js-objekty/objekty#prochazeni-objektu-object-keys-values-a-entries
