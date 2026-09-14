# Třídy

:::check pretest
Co vypíše poslední řádek? Tipni si, i když syntaxi ještě neznáš.

```js
class Counter {
  count = 0;

  increment() {
    this.count += 1;
  }
}

const first = new Counter();
const second = new Counter();
first.increment();
first.increment();
console.log(second.count);
```

### --expected--

0

### --why--

Každé `new Counter()` vytvoří nový objekt s vlastním `count`. `increment` zvyšovalo jen `count` objektu `first`. Proč to tak je, vysvětlí první dvě části lekce.
:::

:::check pretest
Třída má soukromé pole `#balance`. Co udělá řádek `account.#balance = 1000000;` napsaný mimo třídu?

### --answer--

Přepíše zůstatek, soukromé je pole jen podle názvu.

#### --why--

Tak funguje dohoda s podtržítkem `_balance`. Znak `#` je ale součást jazyka — uvidíš v části o soukromých polích.

### --correct--

Kód vůbec nepůjde spustit.

#### --why--

Přístup k `#balance` mimo tělo třídy je syntaktická chyba. Prohlížeč takový soubor odmítne celý, ještě než spustí první řádek.

### --answer--

Nic se nestane, zápis se tiše ignoruje.

#### --why--

Tiché ignorování uvidíš u getteru bez setteru. Soukromé pole se chová přísněji — uvidíš v části o soukromých polích.
:::

Přehrávač podcastů pracuje s desítkami epizod. Každá má název, délku a stav přehrání a každá umí totéž: spustit se, posunout, vypsat popisek. Když epizody skládáš z objektových literálů, opakuješ stejné klíče a funkce u každé zvlášť. A nic nebrání tomu, aby kdokoli v aplikaci napsal `episode.position = -500`:

```js
const episode = { title: 'Jak funguje DNS', seconds: 1860, position: 0 };
episode.position = -500;
```

Třídy (*classes*) řeší obojí. Potkáš je všude, kde objekty mají stav a pravidla: modely v aplikaci, `Map` a `Set` z této sekce, `Error`, webové komponenty nebo klient pro databázi v Node.

> [!REMEMBER]
> **Třída je šablona: `constructor` připraví data každého nového objektu a metody jsou pro všechny objekty třídy společné.**

## Třída, `new` a `constructor`

[[třída|Třídu]] zapíšeš klíčovým slovem `class` a jménem s velkým písmenem. Nový objekt podle ní vyrobí `new`. Takovému objektu se říká [[instance]].

:::live js
```js
class Episode {
  constructor(title, seconds) {
    this.title = title;
    this.seconds = seconds;
    this.position = 0;
  }
}

const dns = new Episode('Jak funguje DNS', 1860);
const css = new Episode('Kaskáda v CSS', 2400);

console.log(dns);
console.log(css.title, css.seconds);
```
:::

`new Episode(…)` udělá tři věci: vytvoří prázdný objekt, zavolá [[konstruktor]] (`constructor`) s argumenty a v něm dosadí za `this` právě ten nový objekt. Nakonec objekt vrátí. Zkus přidat třetí epizodu a do konstruktoru klíč `played: false`.

Bez `new` třída nefunguje — a na rozdíl od obyčejné funkce to hned ohlásí:

:::live js predict
```js
class Episode {
  constructor(title) {
    this.title = title;
  }
}

try {
  const dns = Episode('Jak funguje DNS');
} catch (error) {
  console.log(error.message);
}
```
--question-- Co vypíše `console.log` v bloku `catch`?
--option-- `undefined`
--option-- `Cannot read properties of undefined (reading 'title')`
--option*-- `Class constructor Episode cannot be invoked without 'new'`
--why-- Třídu jde zavolat jen přes `new`. Bez něj JavaScript nepustí konstruktor vůbec ke slovu a vyhodí `TypeError` s touhle hláškou.
:::

:::check
Napiš výraz, který vytvoří instanci třídy `Ticket` s jediným argumentem `'A12'`.

### --expected--

new Ticket('A12')

### --why--

Instanci vyrobí `new` před jménem třídy, argumenty jdou do závorek a dostane je `constructor`.

### --see--

js-tridy-kolekce/tridy#trida-new-a-constructor
:::

## Metody a `this`

Funkce zapsaná v těle třídy je [[metoda]]. Uvnitř metody je `this` objekt, na kterém jsi metodu zavolal — ten před tečkou.

:::live js
```js
class Episode {
  constructor(title, seconds) {
    this.title = title;
    this.seconds = seconds;
    this.position = 0;
  }

  skip(seconds) {
    this.position = Math.min(this.position + seconds, this.seconds);
  }

  label() {
    const minutes = Math.round(this.position / 60);
    return `${this.title} (${minutes} min)`;
  }
}

const dns = new Episode('Jak funguje DNS', 1860);
dns.skip(600);
dns.skip(30);
console.log(dns.label());
console.log(dns instanceof Episode);
```
:::

Zkus zavolat `dns.skip(5000)` a sleduj, že pozice nepřeleze konec epizody. Operátor `instanceof` odpoví, jestli objekt vznikl z dané třídy.

Metody se na rozdíl od dat nekopírují do každé instance. Dvě epizody mají vlastní `title`, ale co metoda?

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

const first = new Episode('DNS');
const second = new Episode('CSS');
console.log(first.title === second.title, first.label === second.label);
```
--question-- Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- false true
--why-- Názvy jsou dvě různé hodnoty, ale `label` je jedna jediná funkce, kterou sdílejí všechny epizody. Při zavolání `first.label()` se liší jen `this`. Kde přesně sdílená metoda leží, ukáže lekce Prototypy.
:::

:::check
Co vypíše poslední řádek?

```js
class Lamp {
  constructor() {
    this.on = false;
  }

  toggle() {
    this.on = !this.on;
  }
}

const kitchen = new Lamp();
const hall = new Lamp();
kitchen.toggle();
hall.toggle();
hall.toggle();
console.log(kitchen.on, hall.on);
```

### --expected--

true false

### --why--

`this` je pokaždé objekt před tečkou. Kuchyňská lampa se přepnula jednou, lampa v chodbě dvakrát, a obě mají vlastní `on`.

### --see--

js-tridy-kolekce/tridy#metody-a-this
:::

## Pole třídy

Data nemusíš nastavovat jen v konstruktoru. Zápis `jméno = hodnota;` přímo v těle třídy je [[pole třídy]] (*class field*): každá nová instance ho dostane s počáteční hodnotou, ještě než proběhne `constructor`.

```js
class Queue {
  items = [];
  paused = false;

  add(episode) {
    this.items.push(episode);
  }
}
```

Hodí se pro hodnoty, které nezávisí na argumentech. A důležité: `items = []` se vyhodnotí **pro každou instanci znovu**, takže každá fronta má vlastní pole. Takhle to vypadá v paměti:

:::memory
```js
const morning = new Queue();
const evening = new Queue();
morning.add('DNS');
```
--step-- 1 | nová instance dostane vlastní pole items
morning -> @morning
@morning: Queue { items: @items1, paused: false }
@items1: []
--step-- 2 | druhá instance, druhé pole
morning -> @morning
evening -> @evening
@morning: Queue { items: @items1, paused: false }
@evening: Queue { items: @items2, paused: false }
@items1: []
@items2: []
--step-- 3 | push mění jen pole ranní fronty
morning -> @morning
evening -> @evening
@morning: Queue { items: @items1, paused: false }
@evening: Queue { items: @items2, paused: false }
@items1: ['DNS']
@items2: []
:::

:::check
Třída `Basket` má pole třídy `products = [];`. Kolik položek bude mít `second.products` po `first.products.push('čaj')`?

```js
const first = new Basket();
const second = new Basket();
first.products.push('čaj');
```

### --expected--

0

### --why--

Pole třídy se vyhodnotí pro každou instanci zvlášť. `first` a `second` mají každý své pole, `push` mění jen to první.

### --see--

js-tridy-kolekce/tridy#pole-tridy
:::

## Soukromá pole `#`

Zatím může kdokoli napsat `dns.position = -500`. Třída ale chce hlídat pravidla: pozice je mezi nulou a délkou epizody. [[soukromé pole|Soukromé pole]] (*private field*) začíná znakem `#` a jde k němu přistoupit **jen z kódu uvnitř těla třídy**.

:::live js
```js
class Episode {
  #position = 0;

  constructor(title, seconds) {
    this.title = title;
    this.seconds = seconds;
  }

  skip(seconds) {
    this.#position = Math.min(Math.max(this.#position + seconds, 0), this.seconds);
  }

  progress() {
    return Math.round((this.#position / this.seconds) * 100);
  }
}

const dns = new Episode('Jak funguje DNS', 1860);
dns.skip(930);
dns.position = -500;
console.log(dns.progress(), dns.position);
console.log(dns);
```
:::

`dns.position = -500` vytvořilo úplně jinou, obyčejnou vlastnost `position`. Soukromé `#position` zůstalo netknuté a `progress()` dál vrací 50. Konzole soukromá pole nevypíše; DevTools v Chromu je kvůli ladění ukážou, kód mimo třídu k nim ale nesmí. Zkus do posledního řádku dopsat `dns.#position` a sleduj, že kód přestane jít spustit úplně.

> [!NOTE]
> Ve starším kódu uvidíš `this._position`. Podtržítko je jen dohoda „nesahej na to", jazyk nic nehlídá. Soukromý stav jde udělat i přes closure, znak `#` je ale kratší a čitelnější.

Soukromá může být i metoda, třeba `#clamp(value)` — zavoláš ji `this.#clamp(…)` jen uvnitř třídy.

:::check
Který řádek napsaný **mimo** třídu `Episode` způsobí, že soubor nepůjde spustit?

### --answer--

`dns.position = 10;`

#### --why--

Tenhle zápis jen vytvoří obyčejnou veřejnou vlastnost `position`. Chybu nevyhodí, jen nic neudělá se stavem epizody.

### --correct--

`console.log(dns.#position);`

#### --why--

Soukromé pole je vidět jen v těle třídy, která ho deklaruje. Zápis `#position` jinde je syntaktická chyba celého souboru.

### --answer--

`dns.skip(-100);`

#### --why--

`skip` je veřejná metoda. Uvnitř ní se k `#position` přistupovat smí, takže volání projde.

### --see--

js-tridy-kolekce/tridy#soukroma-pole
:::

## Gettery a settery

Metoda `progress()` vrací hodnotu, ale volá se se závorkami. [[getter|Getter]] je metoda označená `get`, kterou čteš **jako vlastnost**, bez závorek. Hodí se pro hodnoty spočítané z jiných dat nebo pro čtení soukromého pole zvenku. [[setter|Setter]] (`set`) se zavolá při přiřazení a může hodnotu zkontrolovat.

```js
class Episode {
  #position = 0;

  constructor(title, seconds) {
    this.title = title;
    this.seconds = seconds;
  }

  get position() {
    return this.#position;
  }

  set position(value) {
    if (value < 0 || value > this.seconds) {
      throw new RangeError(`Pozice ${value} je mimo epizodu`);
    }
    this.#position = value;
  }

  get remaining() {
    return this.seconds - this.#position;
  }
}
```

`dns.position = 600` teď zavolá setter a `dns.remaining` getter. Zápis `dns.position = -500` vyhodí `RangeError` — chybný stav se do objektu vůbec nedostane. K vyhazování chyb se podrobně dostaneš v sekci Chyby a ladění; teď stačí, že `throw` zastaví metodu a chyba doletí k volajícímu.

Co když getter má, ale setter ne?

:::live js predict
```js
class Temperature {
  #celsius = 20;

  get celsius() {
    return this.#celsius;
  }
}

const room = new Temperature();
room.celsius = 35;
console.log(room.celsius);
```
--question-- Co vypíše `console.log`?
--expected-- 20
--why-- Vlastnost s getterem a bez setteru jde jen číst. Přiřazení v obyčejném skriptu se **tiše ignoruje**, žádná chyba. V ES modulech a uvnitř tříd (tam platí strict mode) by stejný řádek vyhodil `TypeError: Cannot set property celsius of #<Temperature> which has only a getter`.
:::

> [!PITFALL]
> **Přiřazení do vlastnosti, která má jen getter, v obyčejném skriptu nic neudělá a nic neohlásí.** Příznak: hodnota se „nechce změnit". Oprava: dopiš `set`, nebo nabídni metodu se jménem, které říká, co dělá (`skipTo(seconds)`).

:::check
Třída `Order` má `get total() { … }`. Jak ve výrazu získáš celkovou cenu objednávky `order`?

### --expected--

order.total

### --why--

Getter se čte jako vlastnost, bez závorek. `order.total()` by skončilo `TypeError: order.total is not a function`, protože výsledek getteru je číslo, ne funkce.

### --see--

js-tridy-kolekce/tridy#gettery-a-settery
:::

## Statické členy `static`

Někdy funkce patří k třídě jako celku, ne k jedné instanci: [[statická metoda]] (`static`) se volá na třídě. Typicky vytváří instance z jiných dat (*tovární metoda*) nebo drží konstantu.

:::live js
```js
class Episode {
  static MAX_TITLE = 80;

  static fromApi(data) {
    return new Episode(data.name.slice(0, Episode.MAX_TITLE), data.duration_ms / 1000);
  }

  constructor(title, seconds) {
    this.title = title;
    this.seconds = seconds;
  }
}

const episode = Episode.fromApi({ name: 'Jak funguje DNS', duration_ms: 1860000 });
console.log(episode);
console.log(typeof Episode.fromApi, typeof episode.fromApi);
```
:::

Statické metody znáš dávno, jen jsi jim tak neříkal: `Array.isArray`, `Object.groupBy`, `Number.isInteger`, `Date.now()`. Zkus zavolat `episode.fromApi(…)` a přečti si hlášku `episode.fromApi is not a function`: instance statickou metodu nemá.

:::check
Která volání fungují? Třída `Invoice` má `static fromJSON(text)` a obyčejnou metodu `total()`; `invoice` je její instance. Vyber všechna.

### --correct--

`Invoice.fromJSON('{"items": []}')`

#### --why--

Statická metoda se volá na třídě.

### --correct--

`invoice.total()`

#### --why--

Obyčejná metoda se volá na instanci a `this` je ta instance.

### --answer--

`invoice.fromJSON('{"items": []}')`

#### --why--

Instance statické metody nedědí. Volání skončí `TypeError: invoice.fromJSON is not a function`.

### --answer--

`Invoice.total()`

#### --why--

Obyčejná metoda patří instancím, na samotné třídě ji nenajdeš.

### --see--

js-tridy-kolekce/tridy#staticke-cleny-static
:::

## Dědičnost: `extends` a `super`

Podcast má epizody, audiokniha kapitoly. Obojí je „nahrávka" se stejným základem. [[dědičnost|Dědičností]] (*inheritance*) řekneš, že třída je zvláštní případ jiné třídy: `class Chapter extends Recording` převezme všechny metody `Recording` a může přidat nebo přepsat další.

:::live js
```js
class Recording {
  constructor(title, seconds) {
    this.title = title;
    this.seconds = seconds;
  }

  label() {
    return `${this.title}, ${Math.round(this.seconds / 60)} min`;
  }
}

class Chapter extends Recording {
  constructor(title, seconds, number) {
    super(title, seconds);
    this.number = number;
  }

  label() {
    return `${this.number}. kapitola: ${super.label()}`;
  }
}

const chapter = new Chapter('Babička', 1500, 1);
console.log(chapter.label());
console.log(chapter instanceof Chapter, chapter instanceof Recording);
```
:::

- `super(title, seconds)` v konstruktoru zavolá konstruktor rodičovské třídy. Dokud neproběhne, `this` neexistuje.
- `super.label()` v metodě zavolá rodičovskou verzi metody, kterou potomek přepsal.

Zkus v `Chapter` smazat celou metodu `label` a sleduj, že se použije ta z `Recording`. A co když `this` použiješ dřív než `super`?

:::live js predict
```js
class Recording {
  constructor(title) {
    this.title = title;
  }
}

class Chapter extends Recording {
  constructor(title, number) {
    this.number = number;
    super(title);
  }
}

try {
  new Chapter('Babička', 1);
} catch (error) {
  console.log(error.name);
}
```
--question-- Jak se jmenuje chyba, kterou vypíše `console.log`?
--expected-- ReferenceError
--why-- V konstruktoru potomka `this` vznikne až voláním `super(…)`. Každé použití `this` před ním vyhodí `ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`. Stejná chyba přijde, když `super` v konstruktoru potomka chybí úplně.
:::

:::check
Proč musí konstruktor třídy `Chapter extends Recording` zavolat `super(…)` dřív, než nastaví `this.number`?

### --answer--

Kvůli čitelnosti, jazyk to nevyžaduje.

#### --why--

Vyžaduje. Zkus v předpovědi výše řádky prohodit a přečti si hlášku.

### --correct--

Objekt `this` v potomkovi vytvoří až konstruktor rodiče, který `super` zavolá.

#### --why--

Dokud rodič neproběhne, instance neexistuje a každé `this` vyhodí `ReferenceError`.

### --answer--

Jinak by `this.number` přepsal rodičovský konstruktor.

#### --why--

Rodičovský konstruktor `number` vůbec nezná. Problém je v tom, jestli `this` už existuje.

### --see--

js-tridy-kolekce/tridy#dedicnost-extends-a-super
:::

## Kompozice, nebo dědičnost?

Dědičnost svádí stavět dlouhé řetězy (`Recording → AudioRecording → PaidAudioRecording → …`). Každá změna rodiče pak může rozbít všechny potomky. Proto se v praxi víc používá [[kompozice]] (*composition*): objekt jiný objekt **má** a volá jeho metody.

| vztah | otázka | zápis |
|---|---|---|
| dědičnost | Je `Chapter` druh `Recording`? Ano. | `class Chapter extends Recording` |
| kompozice | Je přehrávač druh fronty? Ne, přehrávač **má** frontu. | `#queue = new Queue();` uvnitř `Player` |

```js
class Player {
  #queue = new Queue();

  enqueue(episode) {
    this.#queue.add(episode);
  }
}
```

Pravidlo pro začátek: `extends` jen tam, kde potomek opravdu je druh rodiče a používá všechno, co rodič nabízí. Jinak objekt vlož do pole třídy. Dědičnost nejčastěji uvidíš u vlastních chyb (`class ValidationError extends Error`) a u webových komponent (`extends HTMLElement`).

:::check
Kde se víc hodí kompozice než dědičnost?

### --answer--

`class Admin extends User` — administrátor je uživatel s právy navíc.

#### --why--

Administrátor opravdu je druh uživatele a používá všechno, co uživatel umí. Tady dědičnost dává smysl.

### --correct--

`Checkout` (pokladna e-shopu) potřebuje pracovat s košíkem `Cart`.

#### --why--

Pokladna není druh košíku, pokladna košík **má**. Vloží si ho do pole třídy a volá jeho metody.

### --answer--

`class NotFoundError extends Error` — chyba „nenalezeno".

#### --why--

Vlastní chyba je druh chyby a má všechno, co `Error` (zprávu, zásobník volání). Tohle je typické místo pro `extends`.

### --see--

js-tridy-kolekce/tridy#kompozice-nebo-dedicnost
:::

## Typické chyby a pasti

### Metoda předaná jako callback ztratí `this`

`this` se neurčuje podle toho, kde metoda vznikla, ale podle toho, **jak ji zavoláš**. Když metodu předáš jinam bez objektu před tečkou, `this` uvnitř je `undefined`.

:::live js predict
```js
class Queue {
  items = [];

  add(episode) {
    this.items.push(episode);
  }
}

const queue = new Queue();
try {
  ['DNS', 'CSS'].forEach(queue.add);
} catch (error) {
  console.log(error.message);
}
```
--question-- Co vypíše `console.log`?
--option-- Nic, obě epizody se přidají do fronty.
--option*-- `Cannot read properties of undefined (reading 'items')`
--option-- `queue.add is not a function`
--why-- `forEach` dostal jen funkci `add`, bez objektu `queue`. Zavolá ji jako `add('DNS')`, takže `this` je `undefined` a čtení `this.items` spadne. Oprava: `forEach((episode) => queue.add(episode))` nebo `forEach(queue.add.bind(queue))`.
:::

> [!PITFALL]
> **`list.forEach(object.method)`, `setTimeout(object.method, 1000)` nebo `button.addEventListener('click', object.method)` předají funkci bez objektu.** Příznak: `TypeError: Cannot read properties of undefined (reading '…')` uvnitř metody. Oprava: obal volání šipkovou funkcí `(x) => object.method(x)`, nebo použij `object.method.bind(object)`.

### Obyčejná funkce jako callback uvnitř metody

Stejná past přijde uvnitř třídy. Callback zapsaný přes `function` má vlastní `this`, a ten je `undefined`:

```js
class Queue {
  items = [];

  addAll(episodes) {
    episodes.forEach(function (episode) {
      this.items.push(episode);
    });
  }
}
```

> [!PITFALL]
> **`function` jako callback uvnitř metody nevidí `this` instance.** `new Queue().addAll(['DNS'])` skončí `TypeError: Cannot read properties of undefined (reading 'items')`. Oprava: šipková funkce `(episode) => this.items.push(episode)` — šipková funkce vlastní `this` nemá a použije `this` metody, ve které vznikla.

:::explain
Vysvětli vlastními slovy, proč `['DNS', 'CSS'].forEach(queue.add)` spadne, ale `['DNS', 'CSS'].forEach((episode) => queue.add(episode))` funguje.

## --model--

`this` v metodě je objekt, na kterém metodu zavolám, tedy ten před tečkou. Když předám `queue.add` do `forEach`, předám jen samotnou funkci bez objektu a `forEach` ji zavolá jako obyčejnou funkci, takže `this` je `undefined` a `this.items` spadne. Šipková funkce volá `queue.add(episode)` i s objektem před tečkou, takže `this` je fronta.

## --checklist--

- `this` určuje způsob zavolání, ne místo, kde metoda vznikla.
- `queue.add` bez závorek je jen funkce, objekt `queue` se nepředá.
- Bez objektu před tečkou je `this` v metodě třídy `undefined`.
- Šipková funkce zavolá metodu i s objektem, stejně funguje `bind`.
:::

### Getter se stejným jménem jako vlastnost

> [!PITFALL]
> **`get name() { return this.name; }` volá sám sebe.** Čtení `this.name` uvnitř getteru `name` zavolá zase getter a skončí `RangeError: Maximum call stack size exceeded`. A když konstruktor přitom zapisuje `this.name = name`, spadne dřív: `TypeError: Cannot set property name of #<User> which has only a getter`. Oprava: data ulož do soukromého pole `#name` a getter ať vrací `this.#name`.

### Getter vrací soukromé pole ven

Soukromé pole hlídá proměnnou, ne objekt, na který ukazuje. Když getter vrátí soukromé pole přímo, dostane volající odkaz na totéž pole:

```js
class Playlist {
  #songs = ['Intro', 'Refrén'];

  get songs() {
    return this.#songs;
  }
}

const playlist = new Playlist();
playlist.songs.length = 0;
```

> [!PITFALL]
> **Getter, který vrací `this.#songs`, pustí ven odkaz na soukromé pole.** Příznak: `playlist.songs.length = 0` nebo `playlist.songs.push(…)` změní obsah uvnitř třídy, i když je pole soukromé. Oprava: vrať kopii, třeba `[...this.#songs]` — stejná mělká kopie, jakou znáš z polí.

### Statická metoda na instanci

> [!PITFALL]
> **`episode.fromApi(data)` hlásí `episode.fromApi is not a function`.** Statická metoda patří třídě: `Episode.fromApi(data)`. A obráceně: uvnitř statické metody `this` není instance, ale třída.

:::check
Oprav řádek `setTimeout(player.next, 3000);` tak, aby metoda `next` po třech sekundách dostala jako `this` objekt `player`. Napiš celý opravený řádek.

### --expected--

setTimeout(() => player.next(), 3000);

### --accept--

setTimeout(player.next.bind(player), 3000);
setTimeout(() => { player.next(); }, 3000);
setTimeout(function () { player.next(); }, 3000);

### --why--

Šipková funkce zavolá `player.next()` s objektem před tečkou. Stejně funguje `player.next.bind(player)`, které vrátí funkci s pevně nastaveným `this`.

### --see--

js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this
:::

## Kde to najdeš v MDN

- [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) — přehled celé syntaxe tříd; v postranním panelu jsou podstránky pro `constructor`, `extends`, `static` a soukromé prvky.
- [Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties) — soukromá pole a metody včetně toho, proč je přístup zvenku syntaktická chyba.
- [get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) a [set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) — gettery a settery v objektech i třídách.
- [super](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) — volání rodičovského konstruktoru a metod, s příkladem chyby při `this` před `super`.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
class Wallet {
  #coins = 0;

  add(amount) {
    this.#coins += amount;
    return this;
  }

  get coins() {
    return this.#coins;
  }
}

const wallet = new Wallet();
wallet.add(20).add(5);
wallet.coins = 1000;
console.log(wallet.coins);
```

### --expected--

25

### --why--

`add` vrací `this`, proto jde volání řetězit: mince jsou 25. Vlastnost `coins` má jen getter, takže přiřazení `1000` se v obyčejném skriptu tiše ignoruje a soukromé `#coins` zůstane 25.

### --see--

js-tridy-kolekce/tridy#gettery-a-settery

## --question--

Kolegova třída `Badge` hlásí při `new Badge('Eva')` chybu `TypeError: Cannot set property label of #<Badge> which has only a getter`. Co je špatně?

```js
class Badge {
  constructor(label) {
    this.label = label;
  }

  get label() {
    return this.label.toUpperCase();
  }
}
```

### --answer--

Chybí `super()` na začátku konstruktoru.

#### --why--

`super` patří jen do tříd, které něco rozšiřují přes `extends`. `Badge` nerozšiřuje nic.

### --correct--

Getter `label` se jmenuje stejně jako vlastnost, do které konstruktor zapisuje.

#### --why--

`this.label = label` narazí na getter bez setteru a uvnitř třídy (strict mode) vyhodí chybu. I kdyby zápis prošel, `this.label` v getteru by volal sám sebe. Data patří do `#label`.

### --answer--

`toUpperCase` nejde volat uvnitř getteru.

#### --why--

Getter je obyčejná funkce, volat v něm jde cokoli. Chyba vznikne dřív, už v konstruktoru.

### --see--

js-tridy-kolekce/tridy#getter-se-stejnym-jmenem-jako-vlastnost

## --question--

Třída `Subscriber` má metodu `notify(message)`, která používá `this.email`. Napiš výraz, který předá do `messages.forEach` callback volající `notify` na objektu `subscriber` tak, aby `this` fungovalo.

### --expected--

(message) => subscriber.notify(message)

### --accept--

subscriber.notify.bind(subscriber)
message => subscriber.notify(message)
(m) => subscriber.notify(m)
m => subscriber.notify(m)

### --why--

`messages.forEach(subscriber.notify)` by předalo jen funkci a `this` by bylo `undefined`. Šipková funkce volá metodu s objektem před tečkou, `bind` vrátí funkci s pevným `this`.

### --see--

js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this

## --question--

Co vypíše poslední řádek?

```js
class Shape {
  describe() {
    return `tvar s obsahem ${this.area()}`;
  }

  area() {
    return 0;
  }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  area() {
    return this.side * this.side;
  }
}

console.log(new Square(3).describe());
```

### --expected--

tvar s obsahem 9

### --why--

`describe` zdědil `Square` od `Shape`. Uvnitř volá `this.area()` a `this` je čtverec, takže se použije přepsaná metoda `area` z `Square`, ne ta z rodiče.

### --see--

js-tridy-kolekce/tridy#dedicnost-extends-a-super
