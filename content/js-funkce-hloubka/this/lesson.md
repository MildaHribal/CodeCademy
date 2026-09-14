# `this`

:::check pretest
Co vypíše poslední řádek? Tipni si.

```js
const podcast = {
  title: 'Vědátor',
  describe() {
    return `Posloucháš ${this.title}`;
  },
};

console.log(podcast.describe());
```

### --expected--

Posloucháš Vědátor

### --why--

Metoda se volá přes tečku na objektu `podcast`, a proto `this` uvnitř je právě `podcast`. Proč na tečce tolik záleží, uvidíš v první části.
:::

:::check pretest
Tatáž metoda, jen ji před zavoláním uložíš do proměnné. Co se stane?

```js
'use strict';
const podcast = {
  title: 'Vědátor',
  describe() {
    return `Posloucháš ${this.title}`;
  },
};

const describe = podcast.describe;
describe();
```

### --answer--

Vrátí `'Posloucháš Vědátor'`, funkce pořád patří objektu `podcast`.

#### --why--

Tak to vypadá, protože funkce vznikla uvnitř objektu. `this` se ale neřídí tím, kde funkce vznikla. Uvidíš v části o volání bez tečky.

### --correct--

Spadne s chybou `TypeError`.

#### --why--

Při volání bez tečky nemá funkce žádný objekt, a tak je `this` ve strict mode `undefined`. Čtení `undefined.title` skončí chybou.

### --answer--

Vrátí `'Posloucháš undefined'`.

#### --why--

Takhle by to dopadlo mimo strict mode. Řádek `'use strict'` ale mění, co je `this` při volání bez objektu.
:::

`this` potkáš všude, kde mají objekty metody: přehrávač s tlačítky Další a Pauza, košík
s metodou `add`, časovač v kvízu, starší React komponenty a skoro každá knihovna. A potkáš
ho hlavně ve chvíli, kdy něco nefunguje: metoda, která při přímém zavolání funguje,
přestane fungovat, když ji předáš tlačítku nebo `setTimeout`.

```js
const player = {
  episode: 'Pilotní díl',
  play() {
    console.log(`Přehrávám: ${this.episode}`);
  },
};

player.play();
setTimeout(player.play, 1000);
```

První řádek vypíše „Přehrávám: Pilotní díl". Druhý za sekundu „Přehrávám: undefined".
Stejná funkce, jiný výsledek. Rozdíl není v tom, **kde** je funkce napsaná, ale **jak**
se volá.

> [!REMEMBER]
> **`this` není místo, kde je funkce napsaná, ale objekt, na kterém ji v okamžiku volání voláš.**
> U closures rozhoduje místo vzniku funkce, u `this` řádek volání.

## `this` je objekt před tečkou

Když funkci voláš jako metodu, tedy `objekt.metoda()`, je `this` uvnitř ten objekt
**před tečkou**. Říká se tomu [[vazba this]] (*this binding*): při každém volání se
`this` znovu naváže podle toho, jak voláš.

:::live js
```js
const episode = {
  title: 'Jak funguje paměť',
  minutes: 42,
  describe() {
    return `${this.title} (${this.minutes} min)`;
  },
};

console.log(episode.describe());
```
:::

Zkus změnit `this.title` na `episode.title`. Funguje to stejně, jenže metoda je teď
navždy přivázaná k jednomu objektu. S `this` jde tatáž funkce použít pro víc objektů:

:::live js predict
```js
function describe() {
  return `${this.title} (${this.minutes} min)`;
}

const news = { title: 'Zprávy', minutes: 5, describe };
const talk = { title: 'Rozhovor', minutes: 40, describe };

console.log(talk.describe());
```
--question-- Co vypíše `console.log`?
--expected-- Rozhovor (40 min)
--why-- `news` i `talk` mají v klíči `describe` tutéž funkci. Při volání `talk.describe()` stojí před tečkou `talk`, takže `this` je `talk`. Zkus zavolat i `news.describe()`.
:::

:::check
Co vrátí `app.player.getVolume()`?

```js
const app = {
  volume: 20,
  player: {
    volume: 80,
    getVolume() {
      return this.volume;
    },
  },
};
```

### --expected--

80

### --why--

`this` je objekt těsně před tečkou, tedy `app.player`, ne `app`. Na tom, že je `player` uvnitř `app`, nezáleží.

### --see--

js-funkce-hloubka/this#this-je-objekt-pred-teckou
:::

## Volání bez tečky a strict mode

Co když funkci zavoláš bez objektu, jako obyčejnou funkci? Pak nemá kam `this`
navázat. Co v něm bude, určuje [[strict mode]], přísnější režim JavaScriptu.

- **Ve strict mode** je `this` při volání bez objektu `undefined`. Čtení `this.title`
  proto spadne s chybou, a to je dobře: chyba se ukáže hned.
- **Mimo strict mode** dosadí JavaScript za `this` globální objekt (v prohlížeči
  `window`). `this.title` pak tiše vrátí `undefined` a chyba se projeví až o kus dál.

Strict mode zapíná řádek `'use strict';` na začátku souboru. **V moderních projektech
ho nepíšeš**, protože ES moduly (`import`/`export`) a třídy jsou ve strict mode
automaticky. Ukázky v téhle lekci proto začínají `'use strict'`, aby se chovaly jako
kód, který budeš psát.

:::live js predict
```js
'use strict';
const podcast = {
  title: 'Vědátor',
  describe() {
    return this.title;
  },
};

const describe = podcast.describe;
try {
  console.log(describe());
} catch (error) {
  console.log(error.message);
}
```
--question-- Co vypíše tenhle kód?
--expected-- Cannot read properties of undefined (reading 'title')
--why-- `const describe = podcast.describe` zkopíruje jen odkaz na funkci. Objekt si funkce nepamatuje. Při volání `describe()` před závorkami žádná tečka není, takže `this` je `undefined` a čtení `undefined.title` vyhodí `TypeError`. Zkus smazat první řádek `'use strict'` a sleduj, co se vypíše teď.
:::

Proč si funkce objekt nepamatuje? Protože metoda není „uvnitř" objektu. Objekt má jen
klíč, který na funkci **ukazuje**, stejně jako proměnná ukazuje na pole:

:::memory
```js
const podcast = {
  title: 'Vědátor',
  describe() { return this.title; },
};
const describe = podcast.describe;
describe();
```
--step-- 4 | objekt má v klíči describe jen odkaz na funkci
podcast -> @podcast
@podcast: { title: 'Vědátor', describe: @fn }
@fn: funkce describe() { return this.title; }
--step-- 5 | proměnná describe ukazuje na tutéž funkci, o objektu neví
podcast -> @podcast
describe -> @fn
@podcast: { title: 'Vědátor', describe: @fn }
@fn: funkce describe() { return this.title; }
--step-- 6 | volání bez tečky: this = undefined
podcast -> @podcast
describe -> @fn
this = undefined
@podcast: { title: 'Vědátor', describe: @fn }
@fn: funkce describe() { return this.title; }
:::

:::check
Proč `describe()` v ukázce nevrátí `'Vědátor'`, i když funkce vznikla v objektu `podcast`?

### --answer--

Protože `const` zkopíruje funkci i s objektem a kopie objektu nemá `title`.

#### --why--

`const describe = podcast.describe` nic nekopíruje, jen přidá druhý odkaz na tutéž funkci. Objekt se nekopíruje vůbec.

### --correct--

Protože `this` se určuje až při volání a volání `describe()` žádný objekt před tečkou nemá.

#### --why--

Místo vzniku funkce na `this` vliv nemá. Rozhoduje, jak ji voláš.

### --answer--

Protože `'use strict'` zakazuje ukládat metody do proměnných.

#### --why--

Uložit metodu do proměnné jde v každém režimu. Strict mode jen určuje, že `this` bez objektu je `undefined`, a ne `window`.

### --see--

js-funkce-hloubka/this#volani-bez-tecky-a-strict-mode
:::

## Ztracené `this` v callbacku

Nejčastěji `this` ztratíš, aniž bys napsal `const describe = podcast.describe`. Stačí
metodu **předat jako callback**: `setTimeout(player.play, 1000)`,
`episodes.forEach(stats.add)` nebo `button.addEventListener('click', player.next)`.
Předáváš tím jen funkci. Kdo ji pak zavolá, zavolá ji bez tvého objektu.

:::live js predict
```js
'use strict';
const stats = {
  total: 0,
  add(minutes) {
    this.total += minutes;
  },
};

try {
  [12, 30].forEach(stats.add);
} catch (error) {
  console.log(error.message);
}
console.log(stats.total);
```
--question-- Co vypíše tenhle kód? Napiš oba řádky.
--expected--
```text
Cannot read properties of undefined (reading 'total')
0
```
--why-- `forEach` dostal jen funkci `add` a volá ji jako `callback(minutes)`, bez objektu před tečkou. `this` je proto `undefined` a hned první zápis do `this.total` spadne. `stats.total` zůstane `0`.
:::

Oprava je předat funkci, která metodu zavolá **přes tečku**. Nejjednodušší je šipková
funkce:

:::live js
```js
'use strict';
const stats = {
  total: 0,
  add(minutes) {
    this.total += minutes;
  },
};

[12, 30].forEach((minutes) => stats.add(minutes));
console.log(stats.total);

setTimeout(() => stats.add(8), 0);
setTimeout(() => console.log('Po časovači:', stats.total), 10);
```
:::

Uvnitř šipkové funkce stojí `stats.add(minutes)` s tečkou, takže `this` je `stats`.
Zkus šipkovou funkci v `forEach` nahradit zase jen `stats.add` a přečti si hlášku.

> [!NOTE]
> `setTimeout` je výjimka: funkci bez objektu zavolá s `this` nastaveným na `window`
> i ve strict mode. `setTimeout(player.play, 1000)` z úvodu proto nespadne, jen
> vypíše „Přehrávám: undefined". Příčina i oprava jsou stejné.

:::check
Která úprava opraví `setTimeout(player.play, 1000)` tak, aby se vypsal název dílu?

### --answer--

`setTimeout(player.play(), 1000)`

#### --why--

Závorky metodu zavolají hned a `setTimeout` dostane její výsledek, tedy `undefined`. Díl se vypíše okamžitě, ne za sekundu.

### --correct--

`setTimeout(() => player.play(), 1000)`

#### --why--

Časovač dostane šipkovou funkci a ta za sekundu zavolá `player.play()` přes tečku.

### --answer--

`setTimeout(play, 1000)`

#### --why--

Proměnná `play` neexistuje. A kdyby existovala, pořád by šlo o volání bez objektu.

### --see--

js-funkce-hloubka/this#ztracene-this-v-callbacku
:::

## `call`, `apply` a `bind`: `this` natvrdo

Každá funkce má tři metody, kterými `this` určíš sám. Říká se tomu [[explicitní vazba]]:

| zápis | co udělá |
|---|---|
| `fn.call(obj, a, b)` | zavolá `fn` hned, `this` je `obj`, argumenty vypíšeš za sebou |
| `fn.apply(obj, [a, b])` | totéž, jen argumenty dostane v poli |
| `fn.bind(obj)` | **nic nevolá**, vrátí novou funkci, která má `this` navždy `obj` |

:::live js
```js
'use strict';
function formatEpisode(number, minutes) {
  return `${this.show} #${number} (${minutes} min)`;
}

const show = { show: 'Vědátor' };

console.log(formatEpisode.call(show, 12, 45));
console.log(formatEpisode.apply(show, [13, 38]));

const formatVedator = formatEpisode.bind(show);
console.log(formatVedator(14, 51));
```
:::

`bind` je nejužitečnější z nich: vyrobí funkci, kterou můžeš předat jako callback
a `this` se neztratí. `setTimeout(player.play.bind(player), 1000)` funguje stejně jako
šipková funkce. Zkus v ukázce vytvořit `formatEpisode.bind({ show: 'Dvojka' })`
a zavolat ji.

Co když funkci z `bind` zavoláš přes `call` s jiným objektem?

:::live js predict
```js
'use strict';
function describe() {
  return this.title;
}

const news = { title: 'Zprávy' };
const talk = { title: 'Rozhovor' };

const describeNews = describe.bind(news);
console.log(describeNews.call(talk));
```
--question-- Co vypíše `console.log`?
--expected-- Zprávy
--why-- `bind` vrátí novou funkci, která má `this` přivázané natrvalo. Pozdější `call`, `apply` ani další `bind` ho už nezmění. Zkus místo `describeNews.call(talk)` napsat `describe.call(talk)`.
:::

:::check
Která z metod vrátí novou funkci místo toho, aby funkci zavolala?

### --expected--

bind

### --accept--

fn.bind
.bind
bind()

### --why--

`call` a `apply` funkci zavolají hned a vrátí její výsledek. `bind` nevolá nic, vrátí novou funkci s přivázaným `this`.

### --see--

js-funkce-hloubka/this#call-apply-a-bind-this-natvrdo
:::

## Šipková funkce nemá vlastní `this`

[[šipková funkce|Šipková funkce]] si `this` nenastavuje. Použije `this` z místa, kde
vznikla, stejně jako jakoukoli jinou proměnnou z okolí. Tady se `this` chová
**jako closure**. To je přesně to, co potřebuješ u callbacku uvnitř metody.

Porovnej dvě verze metody `labels`. Liší se jen tím, jakou funkci dostane `map`:

:::live js predict
```js
'use strict';
const playlist = {
  name: 'Na cesty',
  episodes: ['Úvod', 'Rozhovor'],
  labels() {
    return this.episodes.map(function (episode) {
      return `${this.name}: ${episode}`;
    });
  },
};

try {
  console.log(playlist.labels());
} catch (error) {
  console.log(error.message);
}
```
--question-- Co vypíše tenhle kód?
--expected-- Cannot read properties of undefined (reading 'name')
--why-- `this.episodes` na začátku metody funguje, protože `labels` se volá přes tečku. Ale `function (episode)` je nová funkce s vlastním `this` a `map` ji volá bez objektu, takže uvnitř je `this` `undefined`. Přepiš ji na šipkovou `(episode) => …` a sleduj výsledek.
:::

S šipkovou funkcí je `this` uvnitř callbacku totéž `this` jako v metodě `labels`,
tedy `playlist`. Proto je v callbackách uvnitř metod šipková funkce výchozí volba.

Opačně to ale nefunguje. Šipková funkce jako **metoda objektu** si `this` objektu nevezme:

:::live js predict
```js
'use strict';
const player = {
  episode: 'Pilotní díl',
  describe: () => this.episode,
};

console.log(player.describe());
```
--question-- Co vypíše `console.log`?
--expected-- undefined
--why-- Šipková funkce vznikla přímo ve skriptu, ne uvnitř žádné metody. Vezme si proto `this` skriptu, v prohlížeči `window`, a `window.episode` neexistuje. V ES modulu je `this` skriptu `undefined` a stejný kód by spadl s `TypeError`. Přepiš metodu na `describe() { return this.episode; }`.
:::

> [!REMEMBER]
> **Metoda objektu: `metoda() { … }`. Callback uvnitř metody: šipková funkce.**
> Šipková funkce bere `this` z místa, kde vznikla, obyčejná funkce z místa, kde se volá.

:::check
Timer má po jedné sekundě zvýšit `this.seconds`. Která verze metody `start` to udělá?

### --correct--

```js
start() {
  setTimeout(() => {
    this.seconds += 1;
  }, 1000);
}
```

#### --why--

Šipková funkce vznikla uvnitř `start`, a proto má stejné `this` jako metoda, tedy objekt timeru.

### --answer--

```js
start() {
  setTimeout(function () {
    this.seconds += 1;
  }, 1000);
}
```

#### --why--

Obyčejná funkce má vlastní `this` a `setTimeout` ji zavolá bez objektu timeru.

### --answer--

```js
start: () => {
  setTimeout(() => {
    this.seconds += 1;
  }, 1000);
}
```

#### --why--

Vnitřní šipková funkce si `this` vezme ze `start`. Jenže `start` je sama šipková funkce napsaná přímo v objektu, takže `this` objektu nemá ani ona.

### --see--

js-funkce-hloubka/this#sipkova-funkce-nema-vlastni-this
:::

## `new` vytvoří nový objekt

Poslední pravidlo. Když funkci zavoláš s `new`, JavaScript vytvoří **nový prázdný
objekt**, naváže na něj `this` a na konci ho vrátí.

:::live js
```js
'use strict';
function Episode(title, minutes) {
  this.title = title;
  this.minutes = minutes;
  this.played = false;
}

const pilot = new Episode('Pilotní díl', 42);
console.log(pilot);
```
:::

Zkus smazat `new` a přečti si hlášku. Bez `new` jde o obyčejné volání bez objektu,
`this` je `undefined` a zápis `this.title` spadne. Takhle se objekty vyráběly před
třídami. Dnes napíšeš `class Episode` a `new` použiješ stejně. Třídy přijdou v sekci
Třídy, prototypy, Map, Set a iterátory.

:::check
Co je `this` uvnitř funkce při volání `new Episode('Pilot', 30)`?

### --answer--

Funkce `Episode`.

#### --why--

`this` je objekt, ne funkce. `new` ho pro volání vyrobí nový.

### --correct--

Nový objekt, který `new` vytvořilo a na konci vrátí.

#### --why--

Přesně tak. Do toho objektu se zapíšou `title` a `minutes` a proměnná `pilot` na něj pak ukazuje.

### --answer--

`undefined`, protože se funkce volá bez tečky.

#### --why--

Bez `new` by to platilo. `new` je samostatné pravidlo a vytvoří objekt, na který `this` naváže.

### --see--

js-funkce-hloubka/this#new-vytvori-novy-objekt
:::

## Jak určit `this`: postup

Když nevíš, co je `this`, projdi otázky v tomhle pořadí. První odpověď „ano" platí:

| otázka | `this` je |
|---|---|
| Je to šipková funkce? | `this` z místa, kde vznikla |
| Volá se s `new`? | nový objekt |
| Je to funkce z `bind`, nebo se volá přes `call`/`apply`? | objekt, který jsi předal |
| Volá se přes tečku, `obj.metoda()`? | objekt před tečkou |
| Nic z toho | `undefined` (mimo strict mode `window`) |

Rozhoduje vždycky **řádek, kde se funkce volá**, ne řádek, kde je napsaná. U callbacku
to znamená podívat se, jak funkci volá ten, komu jsi ji předal.

:::check
Co je `this` uvnitř šipkové funkce v `map` při posledním řádku?

```js
'use strict';
const quiz = {
  seconds: 30,
  start() {
    return [1, 2].map(() => this.seconds);
  },
};

const start = quiz.start;
start();
```

### --answer--

`quiz`, protože šipková funkce vznikla uvnitř metody objektu `quiz`.

#### --why--

Šipková funkce si `this` bere z místa vzniku, tedy z konkrétního volání `start`. Podívej se, jak se `start` na posledním řádku volá.

### --correct--

`undefined`, protože šipková funkce přebírá `this` z volání `start()` bez tečky.

#### --why--

První otázka tabulky: je to šipková funkce, takže `this` je stejné jako ve `start`. A `start()` se volá bez objektu, takže tam je `this` `undefined`. Kód spadne na čtení `seconds`.

### --answer--

Pole `[1, 2]`, protože `map` se volá přes tečku na poli.

#### --why--

Přes tečku na poli se volá `map`, ne šipková funkce. Šipková funkce navíc vlastní `this` nemá vůbec.

### --see--

js-funkce-hloubka/this#jak-urcit-this-postup
:::

:::explain
Vysvětli vlastními slovy, proč `setTimeout(player.play, 1000)` ztratí `this` a jak to opravíš.

## --model--

`this` se určuje při volání podle toho, jak funkci voláš, ne podle toho, kde je napsaná. Výraz `player.play` bez závorek předá `setTimeout` jen odkaz na funkci, bez objektu. Časovač ji za sekundu zavolá jako obyčejnou funkci, takže před tečkou žádný `player` není a `this` není `player`. Opravím to tak, že předám šipkovou funkci `() => player.play()`, která metodu zavolá přes tečku, nebo funkci s přivázaným `this` přes `player.play.bind(player)`.

## --checklist--

- `this` se určuje při volání, ne podle místa, kde je funkce napsaná.
- `player.play` bez závorek předá jen funkci, ne objekt.
- Časovač funkci zavolá bez objektu před tečkou.
- Oprava je šipková funkce, která metodu zavolá přes tečku.
- Druhá oprava je `bind`, který `this` přiváže natrvalo.
:::

## Typické chyby a pasti

### Metoda předaná jako callback

> [!PITFALL]
> **`list.forEach(stats.add)`, `setTimeout(player.play, 1000)` nebo
> `button.addEventListener('click', player.next)` ztratí `this`.** Příznak:
> `TypeError: Cannot read properties of undefined (reading 'total')`, případně tiché
> `undefined` v textu. Oprava: `(x) => stats.add(x)` nebo `stats.add.bind(stats)`.

### Šipková funkce jako metoda

> [!PITFALL]
> **`describe: () => this.title` v objektu nevidí objekt.** Příznak: metoda vrací
> `undefined`, v modulu spadne na `Cannot read properties of undefined`. Oprava: metodu
> piš zkráceně, `describe() { return this.title; }`.

### Obyčejná funkce uvnitř metody

> [!PITFALL]
> **`function () { … }` jako callback v metodě má vlastní `this`.** Příznak: `this.x`
> na začátku metody funguje, ale uvnitř `map`, `forEach` nebo `setTimeout` je
> `undefined`. Oprava: šipková funkce. Ve starém kódu místo toho uvidíš
> `const self = this;` nad callbackem.

### `bind` vyrobí pokaždé novou funkci

:::live js predict
```js
'use strict';
const player = {
  next() {},
};

console.log(player.next.bind(player) === player.next.bind(player));
```
--question-- Co vypíše `console.log`?
--expected-- false
--why-- Každé zavolání `bind` vrátí novou funkci. Dvě funkce se porovnávají přes odkaz, stejně jako pole, a tohle jsou dva různé odkazy.
:::

> [!PITFALL]
> **`removeEventListener('click', player.next.bind(player))` posluchač neodebere.**
> Příznak: tlačítko reaguje dál, i když jsi posluchač „odebral". `bind` vrátil jinou
> funkci než při přidání. Oprava: funkci z `bind` si ulož do proměnné a tutéž předej
> při přidání i odebrání. Posluchače podrobně probírá sekce o DOM.

:::check
Kód má po kliknutí přepnout na další díl, ale hlásí `TypeError: Cannot read properties of undefined (reading 'length')`. Proč?

```js
'use strict';
const player = {
  episodes: ['Úvod', 'Rozhovor', 'Závěr'],
  current: 0,
  next() {
    this.current = (this.current + 1) % this.episodes.length;
  },
};

const shortcuts = { ArrowRight: player.next };
shortcuts.ArrowRight();
```

### --answer--

Operátor `%` nejde použít s délkou pole.

#### --why--

`%` s číslem funguje. Hláška říká, že `length` se čte z `undefined`, takže problém je v tom, z čeho se čte.

### --correct--

Metoda se volá přes `shortcuts`, takže `this` je objekt `shortcuts`, který nemá `episodes`.

#### --why--

Před tečkou při volání stojí `shortcuts`. `this.episodes` je proto `undefined` a čtení `undefined.length` spadne. Oprava: `ArrowRight: () => player.next()`.

### --answer--

`this` je `undefined`, protože `next` se volá bez tečky.

#### --why--

Podívej se pořádně na poslední řádek: tečka tam je. Otázka je, jaký objekt před ní stojí.

### --see--

js-funkce-hloubka/this#metoda-predana-jako-callback
:::

## Kde to najdeš v MDN

- [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) — všechna pravidla na jedné stránce, včetně části *Callbacks* o tom, kdo určuje `this` u callbacku.
- [Function.prototype.bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) — přivázání `this` a předvyplnění argumentů.
- [Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) — část *Cannot be used as methods* vysvětluje past se šipkovou metodou.
- [Strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) — co strict mode mění a že moduly a třídy ho mají automaticky.

Ve workshopu postavíš přehrávač podcastů, jehož metody si `this` neztratí ani
v časovači, ani v klávesových zkratkách.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
'use strict';
const radio = {
  station: 'Vltava',
  tune() {
    return () => this.station;
  },
};

const getStation = radio.tune();
console.log(getStation());
```

### --expected--

Vltava

### --why--

Šipková funkce vznikla při volání `radio.tune()`, kdy bylo `this` objekt `radio`. Vezme si `this` z tohoto místa, a tak ho má i později, když ji zavoláš bez tečky. S `function () { return this.station; }` by `getStation()` spadlo.

### --see--

js-funkce-hloubka/this#sipkova-funkce-nema-vlastni-this

## --question--

Co vypíše poslední řádek?

```js
'use strict';
const counter = {
  count: 0,
  increment() {
    this.count += 1;
    return this;
  },
};

console.log(counter.increment().increment().count);
```

### --expected--

2

### --why--

`increment` vrací `this`, tedy objekt `counter`. Druhé `.increment()` se proto volá zase přes tečku na `counter` a `this` je pořád stejný objekt. Takhle funguje řetězení metod.

### --see--

js-funkce-hloubka/this#this-je-objekt-pred-teckou

## --question--

Knihovna volá tvou funkci přes `callback.call(button)`. Co bude uvnitř `this`, když předáš `player.next.bind(player)`?

### --answer--

`button`, protože `call` má přednost.

#### --why--

`call` určí `this` jen u funkce, která ho ještě nemá přivázané. Funkce z `bind` ho má natrvalo.

### --correct--

`player`, protože `bind` přivázal `this` natrvalo.

#### --why--

Funkce z `bind` ignoruje `this`, které jí předává `call`, `apply` i další `bind`.

### --answer--

`undefined`, protože se volá bez tečky.

#### --why--

Knihovna ji volá přes `call`, a navíc má funkce `this` přivázané přes `bind`. Bez objektu to rozhodně není.

### --see--

js-funkce-hloubka/this#call-apply-a-bind-this-natvrdo

## --question--

Doplň výraz, který předáš do `setInterval`, aby se každou sekundu zavolalo `clock.tick()` se správným `this`. Napiš jen první argument.

```js
setInterval(/* sem */, 1000);
```

### --expected--

() => clock.tick()

### --accept--

clock.tick.bind(clock)
function () { clock.tick(); }
function () { return clock.tick(); }
() => { clock.tick(); }

### --why--

Časovač musí dostat funkci, která `tick` zavolá přes tečku na `clock`, nebo funkci s přivázaným `this`. Samotné `clock.tick` by `this` ztratilo a `clock.tick()` by metodu zavolalo hned, jen jednou.

### --see--

js-funkce-hloubka/this#ztracene-this-v-callbacku
