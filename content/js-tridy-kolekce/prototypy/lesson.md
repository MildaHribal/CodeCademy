# Prototypy

:::check pretest
Co vypíše poslední řádek? `Object.hasOwn(objekt, klíč)` odpoví, jestli objekt má klíč **přímo u sebe**, operátor `in` jestli ho najde vůbec.

```js
const scores = [3, 1];
console.log(Object.hasOwn(scores, 'map'), 'map' in scores);
```

### --expected--

false true

### --why--

Pole metodu `map` u sebe nemá, a přesto ji najde. Kde leží a jak se k ní JavaScript dostane, je téma celé lekce.
:::

:::check pretest
Třída `Episode` má metodu `label()`. Kolikrát je funkce `label` v paměti, když vytvoříš tisíc epizod?

### --answer--

Tisíckrát, každá instance má vlastní kopii.

#### --why--

Kopie mají data z konstruktoru. S metodami je to jinak — uvidíš v části o `class` pod kapotou.

### --correct--

Jednou, všechny instance ji sdílejí.

#### --why--

Metoda leží v jednom sdíleném objektu a instance se na něj odkazují. Jakém, vysvětlí lekce.

### --answer--

Ani jednou, metoda vznikne až při zavolání.

#### --why--

Metoda je hotová funkce už ve chvíli, kdy JavaScript přečte tělo třídy. Kde přesně leží, vysvětlí lekce.
:::

V DevTools si v konzoli rozbal jakékoli pole a na konci uvidíš řádek `[[Prototype]]: Array(0)` s desítkami metod. Pole `[3, 1]` přitom obsahuje jen dvě čísla. Stejná záhada platí pro řetězce (`'ahoj'.toUpperCase()`), pro tvoje třídy z minulé lekce i pro chybu `querySelectorAll(...).map is not a function`, kterou dřív nebo později potkáš.

> [!REMEMBER]
> **Když objekt vlastnost nemá, JavaScript se zeptá jeho prototypu, pak prototypu prototypu — až k `null`.**

## Každý objekt má prototyp

Skoro každý objekt má skrytý odkaz na jiný objekt, svůj [[prototyp]] (*prototype*). Zjistíš ho přes `Object.getPrototypeOf(objekt)`. Nejpřímější cesta, jak prototyp nastavit, je `Object.create(prototyp)`: vytvoří prázdný objekt, jehož prototypem je zadaný objekt.

:::live js
```js
const defaults = { theme: 'světlý', language: 'cs' };
const settings = Object.create(defaults);
settings.theme = 'tmavý';

console.log(settings.theme, settings.language);
console.log(Object.hasOwn(settings, 'theme'), Object.hasOwn(settings, 'language'));
console.log(Object.getPrototypeOf(settings) === defaults);
```
:::

`settings` má u sebe jen `theme`. Když čteš `settings.language`, JavaScript klíč u objektu nenajde, přejde po odkazu na `defaults` a vrátí `'cs'` odtamtud. Zkus do `defaults` přidat `currency: 'CZK'` a vypsat `settings.currency` — objeví se, i když jsi `settings` neměnil.

:::memory
```js
const defaults = { theme: 'světlý', language: 'cs' };
const settings = Object.create(defaults);
settings.theme = 'tmavý';
```
--step-- 1
defaults -> @defaults
@defaults: { theme: 'světlý', language: 'cs' }
--step-- 2 | nový prázdný objekt s odkazem na prototyp
defaults -> @defaults
settings -> @settings
@settings: { [[Prototype]]: @defaults }
@defaults: { theme: 'světlý', language: 'cs' }
--step-- 3 | zápis vytvoří vlastní vlastnost, prototyp se nezmění
defaults -> @defaults
settings -> @settings
@settings: { theme: 'tmavý', [[Prototype]]: @defaults }
@defaults: { theme: 'světlý', language: 'cs' }
:::

:::check
Co vypíše poslední řádek?

```js
const base = { currency: 'CZK', vat: 21 };
const order = Object.create(base);
order.vat = 12;
console.log(order.currency, order.vat, base.vat);
```

### --expected--

CZK 12 21

### --why--

`currency` objekt `order` nemá, najde se v prototypu. `vat` si `order` zapsal sám, takže se čte jeho vlastní hodnota a prototyp zůstal na 21.

### --see--

js-tridy-kolekce/prototypy#kazdy-objekt-ma-prototyp
:::

## Řetěz prototypů

Prototyp je obyčejný objekt, takže má zase svůj prototyp. Vzniká [[řetěz prototypů]] (*prototype chain*): `settings → defaults → Object.prototype → null`. Hledání vlastnosti jde po řetězu tak dlouho, dokud klíč nenajde, nebo nedojde na `null` — pak vrátí `undefined`.

`Object.prototype` je konec skoro každého řetězu. Proto má i prázdný objekt `{}` metody `toString` a `hasOwnProperty`: nemá je u sebe, zdědil je z `Object.prototype`.

Čtení jde po řetězu nahoru. Co zápis?

:::live js predict
```js
const defaults = { language: 'cs' };
const eva = Object.create(defaults);
const jan = Object.create(defaults);

eva.language = 'en';

console.log(jan.language, defaults.language);
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- cs cs
--why-- Zápis `eva.language = 'en'` se po řetězu **nešíří**: vytvoří vlastní vlastnost na `eva` a ta zakryje hodnotu z prototypu. `defaults` ani `jan` se nezměnily.
:::

Jenže pozor, zápis a ==mutace== jsou dvě různé věci:

:::live js predict
```js
const base = { tags: [] };
const first = Object.create(base);
const second = Object.create(base);

first.tags.push('novinka');

console.log(second.tags.length);
```
--question-- Co vypíše `console.log`?
--expected-- 1
--why-- `first.tags.push(…)` nic nezapisuje do `first`. Nejdřív **přečte** `first.tags` — najde ho v prototypu — a pak mění to jediné pole, které leží v `base`. `second.tags` je totéž pole.
:::

> [!PITFALL]
> **Pole nebo objekt v prototypu sdílejí všechny objekty, které z něj dědí.** Příznak: `push` do „vlastního" seznamu jednoho objektu je vidět u všech. Oprava: data, která má mít každý objekt svoje, dávej přímo do objektu (v třídě do konstruktoru nebo pole třídy), do prototypu jen metody.

:::check
Proč `({}).toString()` nevyhodí chybu, i když prázdný objekt nemá žádné vlastnosti?

### --answer--

Vlastnost `toString` vznikne automaticky při zavolání.

#### --why--

Nic nevzniká. Vzpomeň si, kam JavaScript sáhne, když objekt klíč nemá.

### --correct--

Najde se v `Object.prototype`, který je v řetězu prototypů prázdného objektu.

#### --why--

Hledání přejde z `{}` na jeho prototyp `Object.prototype` a tam metodu `toString` najde.

### --answer--

`toString` je výjimka, kterou jazyk zná bez objektů.

#### --why--

`toString` je obyčejná metoda uložená v jednom objektu. Který to je, určuje řetěz prototypů.

### --see--

js-tridy-kolekce/prototypy#retez-prototypu
:::

## Odkud mají pole a řetězce své metody

Každé pole má za prototyp objekt `Array.prototype`, ve kterém leží `map`, `filter`, `push` a všechny ostatní metody. Řetěz pole je `pole → Array.prototype → Object.prototype → null`.

:::live js
```js
const scores = [3, 1, 2];

console.log(Object.getPrototypeOf(scores) === Array.prototype);
console.log(scores.map === Array.prototype.map);
console.log(Object.hasOwn(scores, 'length'), Object.hasOwn(scores, 'map'));

const greeting = 'ahoj';
console.log(greeting.at(-1), greeting.toUpperCase === String.prototype.toUpperCase);
```
:::

Řetězec `'ahoj'` je primitivní hodnota, objekt to není. Když na něm voláš metodu, JavaScript na okamžik použije `String.prototype` a metodu najde tam. Stejně to funguje u čísel (`Number.prototype.toFixed`).

Zkus do ukázky přidat `console.log(Object.getOwnPropertyNames(Array.prototype))` a projdi si, co všechno pole zdědí.

> [!TIP]
> V DevTools v konzoli rozbal objekt a pak řádek `[[Prototype]]`. Uvidíš metody z prototypu a na dalším `[[Prototype]]` ty z `Object.prototype`. Rychlá cesta, jak zjistit, jestli objekt nějakou metodu opravdu má.

:::check
`document.querySelectorAll('li')` vrací `NodeList`, ne pole. Proč `document.querySelectorAll('li').map(…)` skončí `TypeError: document.querySelectorAll(...).map is not a function`?

### --answer--

`map` nejde volat na výsledku jiné metody.

#### --why--

Řetězení metod funguje normálně, pokud výsledek metodu má. Rozhoduje, co je v jeho řetězu prototypů.

### --correct--

V řetězu prototypů `NodeList` není `Array.prototype`, takže `map` se nenajde a čtení vrátí `undefined`.

#### --why--

`NodeList.prototype` má `forEach`, ale ne `map`. Zavolat `undefined` jako funkci je `TypeError`. Pole z něj udělá `Array.from(list)` nebo `[...list]`.

### --answer--

Seznam je prázdný a `map` na prázdném seznamu nejde.

#### --why--

`[].map(…)` na prázdném poli projde bez chyby. Tady jde o to, jestli metoda v řetězu vůbec je.

### --see--

js-tridy-kolekce/prototypy#odkud-maji-pole-a-retezce-sve-metody
:::

## Co dělá `class` pod kapotou

Třída je jen pohodlnější zápis prototypů. `class Episode` vytvoří funkci `Episode` (proto `typeof Episode` je `'function'`) a objekt `Episode.prototype`. Metody z těla třídy se uloží do `Episode.prototype`. `new Episode(…)` vytvoří objekt, jehož prototypem je `Episode.prototype`, a data z konstruktoru a pole třídy dá přímo do něj.

:::memory
```js
class Episode {
  constructor(title) {
    this.title = title;
  }
  label() {
    return this.title;
  }
}
const dns = new Episode('DNS');
const css = new Episode('CSS');
```
--step-- 8 | třída: funkce a objekt prototype s metodou
Episode -> @class
@class: function Episode, prototype: @proto
@proto: { label: function, [[Prototype]]: Object.prototype }
--step-- 9 | instance má u sebe data, metody hledá v prototypu
Episode -> @class
dns -> @dns
@class: function Episode, prototype: @proto
@proto: { label: function, [[Prototype]]: Object.prototype }
@dns: { title: 'DNS', [[Prototype]]: @proto }
--step-- 10 | druhá instance sdílí tentýž prototyp
Episode -> @class
dns -> @dns
css -> @css
@class: function Episode, prototype: @proto
@proto: { label: function, [[Prototype]]: Object.prototype }
@dns: { title: 'DNS', [[Prototype]]: @proto }
@css: { title: 'CSS', [[Prototype]]: @proto }
:::

:::live js predict
```js
class Episode {
  constructor(title) {
    this.title = title;
  }

  label() {
    return this.title;
  }
}

const dns = new Episode('DNS');
console.log(Object.hasOwn(dns, 'title'), Object.hasOwn(dns, 'label'));
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- true false
--why-- `title` zapsal konstruktor přímo do instance. `label` leží v `Episode.prototype` a instance ho najde až po řetězu. Proto je metoda v paměti jen jednou.
:::

`extends` přidá do řetězu další článek: `Object.getPrototypeOf(Chapter.prototype) === Recording.prototype`. Řetěz kapitoly je `chapter → Chapter.prototype → Recording.prototype → Object.prototype → null`. **Přepsání metody** v potomkovi tedy znamená jen to, že hledání najde `label` v `Chapter.prototype` dřív než v `Recording.prototype`. A `instanceof` nedělá nic jiného, než že hledá `Recording.prototype` v řetězu objektu.

:::explain
Vysvětli vlastními slovy, jak JavaScript najde metodu `label`, když zavoláš `chapter.label()` na instanci třídy `Chapter extends Recording`, která `label` nepřepisuje.

## --model--

Instance `chapter` má u sebe jen data z konstruktoru, `label` tam není. JavaScript proto jde po řetězu prototypů: nejdřív do `Chapter.prototype`, kde metoda taky není, pak do `Recording.prototype`, kde ji najde a zavolá s `this` nastaveným na `chapter`. Kdyby ji nenašel ani v `Object.prototype`, dostal by `undefined` a volání by skončilo chybou „is not a function".

## --checklist--

- Instance má u sebe data, metody leží v prototypu třídy.
- Hledání jde po řetězu: instance, `Chapter.prototype`, `Recording.prototype`, `Object.prototype`.
- Použije se první nalezená metoda, proto přepsání v potomkovi vyhraje.
- `this` při zavolání je pořád instance, ne prototyp.
- Když metodu nenajde nikde, čtení vrátí `undefined` a volání vyhodí `TypeError`.
:::

:::check
Kde leží metoda `withdraw` třídy `SavingsAccount extends BankAccount`, která ji přepisuje?

### --answer--

V každé instanci spořicího účtu.

#### --why--

Do instance jdou jen data z konstruktoru a pole třídy. Metody z těla třídy jdou jinam.

### --correct--

V `SavingsAccount.prototype`, a proto se najde dřív než `withdraw` v `BankAccount.prototype`.

#### --why--

Přepsaná metoda leží v prototypu potomka, který je v řetězu blíž instanci než prototyp rodiče.

### --answer--

V `BankAccount.prototype`, kde přepíše původní metodu.

#### --why--

Rodičovská metoda zůstává netknutá — běžné účty ji dál používají. Potomek má vlastní prototyp.

### --see--

js-tridy-kolekce/prototypy#co-dela-class-pod-kapotou
:::

## Vlastní, nebo zděděná vlastnost

[[vlastní vlastnost|Vlastní vlastnost]] (*own property*) leží přímo v objektu. Nástroje se liší v tom, jestli se dívají i do řetězu:

| nástroj | jen vlastní | i zděděné |
|---|---|---|
| `Object.hasOwn(obj, key)` | ano | |
| `key in obj` | | ano |
| `Object.keys`, `Object.entries` | ano | |
| `for…in` | | ano (jen výčtové) |

Na tohle rozlišení narazíš u objektu použitého jako slovník — třeba při počítání slov:

:::live js predict
```js
const counts = {};

for (const word of ['toString', 'map']) {
  counts[word] = (counts[word] ?? 0) + 1;
}

console.log(counts.map, typeof counts.toString);
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- 1 string
--why-- `counts.toString` na začátku není `undefined`: najde se zděděná funkce z `Object.prototype`. `??` ji proto nechá být a `funkce + 1` je text `function toString() { [native code] }1`. Slovo `map` žádný prototyp nemá, to se napočítá správně.
:::

Objekt bez prototypu vyrobí `Object.create(null)` — nemá ani `toString`. Pro slovníky s libovolnými klíči (slova, jména uživatelů) je ale lepší nástroj `Map`, ke kterému se dostaneš v příští lekci.

:::check
Napiš podmínku, která zjistí, jestli objekt `prices` má klíč `'constructor'` **přímo u sebe**, bez zděděných vlastností.

### --expected--

Object.hasOwn(prices, 'constructor')

### --accept--

prices.hasOwnProperty('constructor')
Object.prototype.hasOwnProperty.call(prices, 'constructor')
Object.keys(prices).includes('constructor')

### --why--

`'constructor' in prices` je `true` pro každý obyčejný objekt, protože `constructor` leží v `Object.prototype`. `Object.hasOwn` se dívá jen do objektu samotného.

### --see--

js-tridy-kolekce/prototypy#vlastni-nebo-zdedena-vlastnost
:::

## Typické chyby a pasti

### Nerozšiřuj vestavěné prototypy

Když do `Array.prototype` přidáš metodu, dostane ji každé pole v celé aplikaci — i v knihovnách, které o ní nevědí.

:::live js predict
```js
Array.prototype.last = function () {
  return this.at(-1);
};

const keys = [];
for (const key in ['a', 'b']) {
  keys.push(key);
}
console.log(keys);
```
--question-- Co vypíše `console.log`? Napiš pole tak, jak ho vypíše konzole.
--expected-- ['0', '1', 'last']
--why-- Metoda přidaná přiřazením je výčtová, takže ji `for…in` najde v řetězu a vypíše vedle indexů. Každý cizí kód, který prochází pole přes `for…in`, se tím rozbije.
:::

> [!PITFALL]
> **`Array.prototype.x = …` (a totéž u `String`, `Object`…) mění chování celé aplikace.** Příznak: cizí kód najednou vidí klíč navíc, nebo se tvoje metoda pohádá s metodou, kterou jazyk přidá později — přesně to se stalo knihovně MooTools, kvůli které se standardní metoda musela jmenovat `flat`, a ne `flatten`. Oprava: napiš obyčejnou funkci `last(items)`.

### Metoda, která na objektu není

> [!PITFALL]
> **`x.method is not a function` často znamená, že `method` v řetězu prototypů objektu není.** Typicky `querySelectorAll(...).map`, `arguments.map` nebo metoda pole volaná na objektu. Oprava: zkontroluj v DevTools `[[Prototype]]` a převeď hodnotu na správný typ (`Array.from(list)`).

### `__proto__` ve starém kódu

> [!NOTE]
> Ve starších návodech uvidíš `obj.__proto__`. Funguje, ale je označené jako zastaralé. Prototyp čti přes `Object.getPrototypeOf` a objekt s prototypem vytvářej přes `Object.create` nebo `class`.

:::check
Kolega chce, aby všechny řetězce v aplikaci uměly `capitalize()`, a napíše `String.prototype.capitalize = function () { … }`. Co mu doporučíš?

### --answer--

Je to v pořádku, pokud metodu přidá hned na začátku aplikace.

#### --why--

Pořadí problém neřeší: metodu uvidí všechny řetězce i kód knihoven a může se srazit s budoucí standardní metodou.

### --correct--

Napsat obyčejnou funkci `capitalize(text)` a vestavěný prototyp neměnit.

#### --why--

Funkce dělá totéž, nic nesdílí s cizím kódem a nezkomplikuje budoucí verze jazyka.

### --answer--

Použít místo toho `Object.prototype.capitalize`, ať to mají všechny objekty.

#### --why--

To problém jen zvětší: metoda by se objevila v řetězu úplně každého objektu.

### --see--

js-tridy-kolekce/prototypy#nerozsiruj-vestavene-prototypy
:::

## Kde to najdeš v MDN

- [Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain) — celý mechanismus s diagramy, včetně toho, jak ho používají třídy.
- [Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create) — vytvoření objektu s daným prototypem a objekt s prototypem `null`.
- [Object.hasOwn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) — rozdíl proti `in` a proti starší `hasOwnProperty`.
- [Object.getPrototypeOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) — čtení prototypu; v části *See also* najdeš i zastaralé `__proto__`.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
class Animal {
  sound() {
    return 'zvuk';
  }
}

class Dog extends Animal {}

const rex = new Dog();
Animal.prototype.sound = () => 'haf';
console.log(rex.sound());
```

### --expected--

haf

### --why--

`rex` metodu `sound` nemá u sebe ani v `Dog.prototype`. Najde ji až v `Animal.prototype` — a tam už je nová funkce. Hledání po řetězu probíhá při každém čtení, ne při vytvoření objektu.

### --see--

js-tridy-kolekce/prototypy#co-dela-class-pod-kapotou

## --question--

Kterými zápisy zjistíš, jestli objekt `user` vlastnost `email` **zdědil** z prototypu, a přitom ji nemá u sebe? Vyber všechny správné.

### --correct--

`'email' in user && !Object.hasOwn(user, 'email')`

#### --why--

`in` najde klíč kdekoli v řetězu, `Object.hasOwn` jen v objektu samotném. Obojí dohromady znamená „je, ale zděděný".

### --answer--

`'email' in user`

#### --why--

`in` vrátí `true` i pro vlastní vlastnost. Zděděnou od vlastní tím nerozlišíš.

### --answer--

`Object.keys(user).includes('email')`

#### --why--

`Object.keys` vidí jen vlastní vlastnosti. Tahle podmínka platí právě pro vlastní `email`, ne pro zděděný.

### --see--

js-tridy-kolekce/prototypy#vlastni-nebo-zdedena-vlastnost

## --question--

Co vypíše poslední řádek?

```js
const template = { items: [], title: 'Seznam' };
const groceries = Object.create(template);
const todo = Object.create(template);

groceries.title = 'Nákup';
groceries.items.push('mléko');

console.log(todo.title, todo.items.length);
```

### --expected--

Seznam 1

### --why--

`groceries.title = …` vytvořilo vlastní vlastnost a `todo.title` se dál čte z prototypu. `groceries.items.push` ale nic nezapsalo — přečetlo pole z prototypu a změnilo ho, takže ho vidí i `todo`.

### --see--

js-tridy-kolekce/prototypy#retez-prototypu

## --question--

Napiš výraz, který z `NodeList` uloženého v proměnné `links` vytvoří pole, na kterém půjde zavolat `map`.

### --expected--

Array.from(links)

### --accept--

[...links]

### --why--

`NodeList` nemá v řetězu `Array.prototype`. `Array.from` i spread vytvoří nové pole se stejnými prvky, a to už `map` má.

### --see--

js-tridy-kolekce/prototypy#metoda-ktera-na-objektu-neni
