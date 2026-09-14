# Hodnota vs. reference

:::check pretest
Co vypíše poslední řádek? Tipni si, i když si nejsi jistý.

```js
const saved = { name: 'Jana', city: 'Brno' };
const draft = saved;
draft.city = 'Olomouc';
console.log(saved.city);
```

### --answer--

`Brno`

#### --why--

Tak by to dopadlo, kdyby `draft` byla kopie. Co přesně přiřazení `draft = saved` zkopíruje, vysvětlí část o sdílení objektů.

### --correct--

`Olomouc`

#### --why--

`draft` není kopie, ale druhé jméno pro tentýž objekt. Proč, uvidíš v části o sdílení objektů.

### --answer--

Vyhodí chybu, protože `saved` je `const`.

#### --why--

`const` hlídá něco jiného, než se zdá. Co přesně, ukáže část o `const`.
:::

:::check pretest
Co myslíš, co vypíše `console.log({ id: 7 } === { id: 7 })`?

### --expected--

false

### --why--

Dva objekty se stejným obsahem jsou pořád dva různé objekty. Co `===` u objektů porovnává, vysvětlí část o porovnání.
:::

Formulář „Upravit profil": uživatel v náhledu přepíše město, rozmyslí si to a klikne na **Zrušit**. Jenže město je změněné i v uloženém profilu. V konzoli žádná chyba, kód vypadá rozumně. Takové chyby vznikají v každé aplikaci, která drží stav — ve formulářích, v košíku, v Reactu, ke kterému se dostaneš později. Příčina je skoro vždycky stejná:

> [!REMEMBER]
> **Proměnná neobsahuje objekt, ale odkaz na něj. Přiřazení zkopíruje odkaz, ne objekt.**
> Čísla, texty a `true`/`false` se kopírují celé. Objekty (i pole) se sdílejí.

## Primitivní hodnoty se kopírují

Čísla, texty, `true`/`false`, `null` a `undefined` jsou [[primitivní hodnota|primitivní hodnoty]] (*primitives*). Přiřazení `b = a` do `b` zkopíruje celou hodnotu. Obě proměnné pak žijí každá sama za sebe.

:::live js predict
```js
let score = 10;
let backup = score;

score = 15;

console.log(backup);
```
--question-- Co vypíše `console.log(backup)`?
--expected-- 10
--why-- `backup = score` do `backup` zkopírovalo číslo `10`. Když pak do `score` přiřadíš `15`, `backup` se to netýká. Zkus na konec přidat `console.log(score)`.
:::

Primitivní hodnotu nejde ani změnit „uvnitř". Metody textu jako `toUpperCase()` původní text nemění, vracejí nový:

```js
const nick = 'ema';
const shout = nick.toUpperCase();
```

V `nick` zůstane `'ema'`, velká písmena jsou jen v `shout`. Jediný způsob, jak proměnná získá jinou primitivní hodnotu, je nové přiřazení.

:::check
Co vypíše poslední řádek?

```js
let city = 'Brno';
const home = city;
city = city + ' – Líšeň';
console.log(home);
```

### --expected--

Brno

### --accept--

'Brno'

### --why--

Text je primitivní hodnota. `home = city` zkopírovalo text `'Brno'` a pozdější přiřazení do `city` vytvořilo nový text jen v `city`.

### --see--

js-objekty/reference-a-mutace#primitivni-hodnoty-se-kopiruji
:::

## Objekty se sdílejí přes odkaz

S objektem je to jinak. Objekt leží někde v paměti a proměnná na něj jen **ukazuje** — drží [[reference|referenci]] neboli odkaz (*reference*). Přiřazení `draft = saved` zkopíruje odkaz, takže obě jména pak ukazují na tentýž objekt. Přesně to se stalo v pretestu. Krokuj šipkami a sleduj, kam vede šipka z `draft`:

:::memory
```js
const saved = { name: 'Jana', city: 'Brno' };
const draft = saved;
draft.city = 'Olomouc';
```
--step-- 1 | vznikne objekt a saved na něj ukazuje
saved -> @profile
@profile: { name: 'Jana', city: 'Brno' }
--step-- 2 | draft = saved zkopíruje odkaz, objekt je pořád jeden
saved -> @profile
draft -> @profile
@profile: { name: 'Jana', city: 'Brno' }
--step-- 3 | změna přes draft mění jediný objekt
saved -> @profile
draft -> @profile
@profile: { name: 'Jana', city: 'Olomouc' }
:::

Zápis `draft.city = 'Olomouc'` je [[mutace]] (*mutation*): mění objekt, na který proměnná ukazuje. Každé jméno, které na tentýž objekt ukazuje, změnu uvidí. Totéž platí pro pole, protože pole je také objekt.

:::live js
```js
const cart = { items: 2, total: 540 };
const summary = cart;

summary.total = 600;

console.log(cart);
console.log(summary);
```
:::

Zkus řádek `const summary = cart;` změnit na `const summary = { items: 2, total: 540 };` a sleduj, který z výpisů se změní.

:::check
Proměnné `order` a `copy` ukazují na tentýž objekt. Kolik objektů je v paměti po posledním řádku?

```js
const order = { id: 381, paid: false };
const copy = order;
copy.paid = true;
```

### --answer--

Dva: původní objekt a jeho kopie.

#### --why--

Kopie by vznikla jen tehdy, kdyby ji někdo vytvořil novými složenými závorkami. `copy = order` zkopírovalo jen odkaz.

### --correct--

Jeden, a má `paid: true`.

#### --why--

Složené závorky se v kódu objevily jen jednou, takže objekt je jeden. Obě proměnné na něj ukazují a zápis přes `copy` ho změnil.

### --answer--

Jeden, a má `paid: false`, protože `order` je `const`.

#### --why--

`const` nezakazuje měnit vlastnosti objektu. Zápis `copy.paid = true` změnil jediný objekt, na který obě proměnné ukazují.

### --see--

js-objekty/reference-a-mutace#objekty-se-sdileji-pres-odkaz
:::

## Mutace objektu × nové přiřazení

Tady se začátečníci pletou nejčastěji. Jsou dvě úplně různé operace, které vypadají podobně:

- ==mutace== `profile.city = 'Olomouc'` mění **objekt**. Vidí to všichni, kdo na něj ukazují.
- ==přiřazení== `profile = { … }` přesměruje **proměnnou** na jiný objekt. Ostatních proměnných se to netýká.

:::live js predict
```js
let current = { theme: 'light' };
const previous = current;

current = { theme: 'dark' };

console.log(previous.theme);
```
--question-- Co vypíše `console.log(previous.theme)`?
--expected-- light
--why-- `current = { theme: 'dark' }` nezměnilo původní objekt, jen do `current` přiřadilo odkaz na **nový** objekt. `previous` pořád ukazuje na ten starý. Zkus třetí řádek změnit na `current.theme = 'dark';` a sleduj, co se vypíše teď.
:::

:::memory
```js
let current = { theme: 'light' };
const previous = current;
current = { theme: 'dark' };
```
--step-- 1
current -> @light
@light: { theme: 'light' }
--step-- 2 | obě proměnné ukazují na jeden objekt
current -> @light
previous -> @light
@light: { theme: 'light' }
--step-- 3 | přiřazení přesměruje jen current, starý objekt zůstal beze změny
current -> @dark
previous -> @light
@light: { theme: 'light' }
@dark: { theme: 'dark' }
:::

> [!REMEMBER]
> **Tečka nebo závorky nalevo od `=` mění objekt. Holé jméno nalevo od `=` mění jen proměnnou.**

:::check
Po kterém z řádků uvidí změnu i proměnná `backup`? Na začátku platí `let prefs = { lang: 'cs' }; const backup = prefs;`.

### --correct--

`prefs.lang = 'en';`

#### --why--

Zápis přes tečku je mutace objektu, na který ukazují obě proměnné.

### --answer--

`prefs = { lang: 'en' };`

#### --why--

Tohle je přiřazení do proměnné `prefs`. Vznikl nový objekt a `backup` dál ukazuje na ten původní.

### --answer--

`prefs = null;`

#### --why--

Přiřazení změní jen to, kam ukazuje `prefs`. Objekt v paměti zůstane a `backup` na něj pořád ukazuje.

### --see--

js-objekty/reference-a-mutace#mutace-objektu-nove-prirazeni
:::

## `const` nezamrazí obsah

`const` znamená „tahle **proměnná** bude navždy ukazovat na totéž". Nový objekt do ní přiřadit nejde, ale objekt samotný zůstává změnitelný.

:::live js
```js
const account = { balance: 1200 };

account.balance = 900;
account.currency = 'CZK';
console.log(account);

try {
  account = { balance: 0 };
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
```
:::

Blok `try…catch` tu jen zachytí chybu, aby ukázka doběhla. Zkus změnit `const` na `let` a sleduj, jestli chyba zmizí. Pole i objekty proto zakládej přes `const`: nechceš proměnnou omylem přesměrovat, a měnit obsah ti `const` stejně nezakáže.

### `Object.freeze` je mělké

Když chceš objekt opravdu zamknout, použij `Object.freeze(objekt)`. Zamkne ale jen **první patro**:

:::live js predict
```js
const config = Object.freeze({ currency: 'CZK', limits: { perDay: 5000 } });

config.currency = 'EUR';
config.limits.perDay = 99999;

console.log(config.currency, config.limits.perDay);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- CZK 99999
--why-- `Object.freeze` zamkne vlastnosti objektu `config`, takže `currency` zůstane `'CZK'`. Vnořený objekt v `limits` ale zamčený není — `config.limits` je jen odkaz na jiný objekt a ten jde měnit dál.
:::

Všimni si, že zápis `config.currency = 'EUR'` neskončil chybou, jen se tiše neprovedl. Chybu `TypeError: Cannot assign to read only property 'currency' of object '#<Object>'` uvidíš v přísném režimu (*strict mode*), ve kterém běží moduly a třídy — k modulům se dostaneš v sekci o nástrojích.

:::check
Proměnná je `const settings = { volume: 50 }`. Který řádek vyhodí chybu?

### --answer--

`settings.volume = 80;`

#### --why--

Tohle mění vlastnost objektu. Proměnná pořád ukazuje na tentýž objekt, takže `const` nic neporušuje.

### --answer--

`settings.muted = true;`

#### --why--

Přidání vlastnosti je taky změna objektu, ne nové přiřazení do proměnné.

### --correct--

`settings = { volume: 80 };`

#### --why--

Tady se do proměnné přiřazuje nový objekt, a to `const` zakazuje: `TypeError: Assignment to constant variable.`

### --see--

js-objekty/reference-a-mutace#const-nezamrazi-obsah
:::

## Porovnání `===` se ptá na identitu

U primitivních hodnot `===` porovnává hodnotu. U objektů se ptá: „ukazují obě strany na **tentýž** objekt?" Obsahu si nevšímá.

:::live js predict
```js
const first = { city: 'Brno' };
const second = { city: 'Brno' };
const third = first;

console.log(first === second, first === third);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- false true
--why-- Každé složené závorky vytvoří nový objekt. `first` a `second` mají stejný obsah, ale jsou to dva objekty, takže `false`. `third` ukazuje na stejný objekt jako `first`, takže `true`.
:::

Když potřebuješ porovnat obsah, porovnej vlastnosti, na kterých ti záleží: `first.city === second.city`. Jinak se na „stejný objekt" ptá React a další knihovny: zjišťují, jestli se data změnila, právě přes `===`. Změněná data proto musí být **nový** objekt — jak ho vyrobit, ukáže poslední část lekce.

:::check
Funkce `sameAddress(a, b)` má vrátit `true`, když mají dvě adresy stejné město i PSČ. Napiš výraz za `return`.

### --expected--

a.city === b.city && a.zip === b.zip

### --accept--

b.city === a.city && b.zip === a.zip
a.zip === b.zip && a.city === b.city
b.zip === a.zip && b.city === a.city

### --why--

`a === b` by pro dvě různé adresy se stejným obsahem vrátilo `false`, protože porovnává identitu. Obsah porovnáš po vlastnostech.

### --see--

js-objekty/reference-a-mutace#porovnani-se-pta-na-identitu
:::

## Objekt v parametru funkce

Když funkci předáš objekt, parametr dostane kopii **odkazu** — stejně jako při `b = a`. Funkce tedy pracuje s objektem volajícího.

:::live js predict
```js
function applyDiscount(product) {
  product.price = product.price - 100;
  return product;
}

const phone = { name: 'Pixel 9a', price: 11990 };
const discounted = applyDiscount(phone);

console.log(phone.price, discounted === phone);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- 11890 true
--why-- Parametr `product` ukazuje na tentýž objekt jako `phone`. Funkce ho zmutovala a vrátila odkaz na něj, takže `discounted` i `phone` jsou jeden objekt se sníženou cenou. Zkus funkci zavolat dvakrát za sebou a sleduj, jak cena klesá pokaždé.
:::

:::memory
```js
function applyDiscount(product) {
  product.price = product.price - 100;
  return product;
}
const phone = { name: 'Pixel 9a', price: 11990 };
const discounted = applyDiscount(phone);
```
--step-- 5 | phone ukazuje na objekt telefonu
phone -> @phone
@phone: { name: 'Pixel 9a', price: 11990 }
--step-- 2 | uvnitř volání: parametr product ukazuje na týž objekt a mutace ho mění
phone -> @phone
product -> @phone
@phone: { name: 'Pixel 9a', price: 11890 }
--step-- 6 | po návratu: discounted dostal odkaz, který funkce vrátila
phone -> @phone
discounted -> @phone
@phone: { name: 'Pixel 9a', price: 11890 }
:::

Přiřazení do parametru naopak volajícího nezmění. `product = { …nový objekt… }` uvnitř funkce jen přesměruje parametr — stejně jako `current = { theme: 'dark' }` o část výš.

:::explain
Kolega tvrdí: „JavaScript předává objekty odkazem, proto funkce změnila můj objekt." Vysvětli vlastními slovy, co se při volání funkce s objektem doopravdy předá a proč přiřazení do parametru volajícího nezmění, ale zápis do jeho vlastnosti ano.

## --model--

Parametr dostane kopii hodnoty z argumentu, a u objektu je tou hodnotou odkaz. Parametr i proměnná volajícího tak ukazují na jeden objekt. Když funkce zapíše do vlastnosti, mění ten sdílený objekt, a volající změnu uvidí. Když funkce do parametru přiřadí nový objekt, přesměruje jen svou kopii odkazu a proměnná volajícího dál ukazuje na původní objekt.

## --checklist--

- Parametr dostane kopii odkazu, ne kopii objektu.
- Parametr i proměnná volajícího ukazují na tentýž objekt.
- Zápis do vlastnosti mění sdílený objekt, proto ho vidí i volající.
- Přiřazení do parametru přesměruje jen parametr, volajícího nezmění.
:::

:::check
Co vypíše poslední řádek?

```js
function resetCart(cart) {
  cart = { items: 0, total: 0 };
}

const myCart = { items: 3, total: 870 };
resetCart(myCart);
console.log(myCart.total);
```

### --expected--

870

### --why--

`cart = { … }` je přiřazení do parametru, ne mutace. Parametr se přesměroval na nový objekt, ale `myCart` dál ukazuje na původní košík. Mutace `cart.total = 0` by naopak změnila i `myCart`.

### --see--

js-objekty/reference-a-mutace#objekt-v-parametru-funkce
:::

## Úprava bez mutace: nový objekt

Jak tedy změnit jeden údaj a nerozbít data, která ti někdo předal? Nevkládej změnu do starého objektu, **vytvoř nový**. Nejkratší cesta je [[rozprostření]] (*spread*) `...`: vysype všechny vlastnosti objektu do nových složených závorek. Za něj pak napíšeš vlastnosti, které se mají změnit.

:::live js
```js
const phone = { name: 'Pixel 9a', price: 11990, color: 'černá' };

const discounted = { ...phone, price: 10990 };

console.log(phone);
console.log(discounted);
console.log(phone === discounted);
```
:::

Záleží na pořadí: vlastnost, která je v závorkách později, přepíše tu dřívější. Zkus `price: 10990` přesunout **před** `...phone` a sleduj cenu v druhém výpisu.

Stejně se mění i pole: `[...tags, 'akce']` je nové pole s položkou navíc. Pole do hloubky probere sekce Pole v JavaScriptu.

Funkce, která takhle vrací nový objekt a vstup nemění, se dá volat kolikrát chceš a výsledek je pořád stejný:

```js
function applyDiscount(product, amount) {
  return { ...product, price: product.price - amount };
}
```

> [!REMEMBER]
> **Funkce, která dostane objekt, vrátí nový a původní nechá být.** Místo `obj.x = …` napiš `return { ...obj, x: … }`.

:::check
Proměnná `booking` obsahuje rezervaci s vlastnostmi `id`, `date` a `seats`. Napiš výraz, který vytvoří **nový** objekt se všemi údaji rezervace, jen `seats` bude `4`.

### --expected--

{ ...booking, seats: 4 }

### --accept--

Object.assign({}, booking, { seats: 4 })
({ ...booking, seats: 4 })

### --why--

`...booking` zkopíruje všechny vlastnosti do nového objektu a `seats: 4` za ním přepíše tu zkopírovanou. Kdyby `seats: 4` stálo před spreadem, přepsal by ho spread zpátky.

### --see--

js-objekty/reference-a-mutace#uprava-bez-mutace-novy-objekt
:::

## Typické chyby a pasti

### „Kopie" přiřazením

> [!PITFALL]
> **`const draft = profile` není kopie.** Příznak: po úpravě konceptu se změní i originál (tlačítko Zrušit nic nevrátí). Oprava: vytvoř nový objekt, `const draft = { ...profile }`.

### Funkce, která má vracet, zmutuje vstup

Funkce, která mutuje, je zrádná hlavně tehdy, když ji někdo zavolá víckrát — třeba při každém vykreslení stránky.

:::live js predict
```js
function withVat(item) {
  item.price = Math.round(item.price * 1.21);
  return item;
}

const lamp = { name: 'Lampa', price: 1000 };
withVat(lamp);
const label = withVat(lamp);

console.log(label.price);
```
--question-- Co vypíše `console.log(label.price)`?
--expected-- 1464
--why-- Obě volání mutovala tentýž objekt: první udělalo z `1000` cenu `1210`, druhé z `1210` cenu `1464`. DPH se připočetla dvakrát. Verze `return { ...item, price: Math.round(item.price * 1.21) }` by vrátila `1210` při každém volání.
:::

> [!PITFALL]
> **Funkce zapisuje do objektu z parametru.** Příznak: data se mění „samy" a hodnota roste nebo klesá s každým voláním. Oprava: `return { ...item, price: … }` místo `item.price = …`.

### Spread kopíruje jen první patro

> [!PITFALL]
> **`{ ...user }` vytvoří nový objekt, ale vnořené objekty uvnitř zůstanou sdílené.** Příznak: `copy.address.city = 'Ostrava'` změní i `user.address.city`. Oprava: vytvoř nový i vnořený objekt, `{ ...user, address: { ...user.address, city: 'Ostrava' } }`. Kopiím do hloubky se věnuje lekce [Mělká a hluboká kopie, JSON](see:js-objekty/kopie-a-json#melka-kopie-spread-a-object-assign).

### `Object.freeze` tiše selže

> [!PITFALL]
> **Zápis do zmrazeného objektu v obyčejném skriptu nic neudělá a nic nehlásí.** Příznak: hodnota se „nechce" změnit a konzole mlčí. A vnořené objekty zmrazené nejsou vůbec. Oprava: počítej s tím, že `Object.freeze` chrání jen první patro; vnořené objekty zmraz zvlášť.

:::check
Kolega píše funkci, která má vrátit profil s novou přezdívkou a původní profil nechat být. Co je na ní špatně?

```js
function withNick(user, nick) {
  const updated = user;
  updated.nick = nick;
  return updated;
}
```

### --answer--

Nic, `updated` je nový objekt.

#### --why--

`const updated = user` nevytvořilo nový objekt, jen druhé jméno pro objekt z parametru.

### --correct--

`updated` ukazuje na objekt volajícího, takže se změní i původní profil.

#### --why--

Přiřazení zkopírovalo odkaz a zápis `updated.nick` mutuje objekt volajícího. Oprava: `return { ...user, nick };`.

### --answer--

Chyba je v `return`, funkce má vracet `user`.

#### --why--

`updated` i `user` jsou tentýž objekt, takže na tom, které jméno se vrátí, nezáleží. Problém vzniká už o dva řádky výš.

### --see--

js-objekty/reference-a-mutace#kopie-prirazenim
:::

## Kde to najdeš v MDN

- [JavaScript data types and data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures) — které hodnoty jsou primitivní a že jsou neměnné (*immutable*), oddíl *Primitive values*.
- [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) — příklad, že zmrazení je mělké, a jak se chová v přísném režimu.
- [Strict equality (===)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality) — věta o tom, že objekty se rovnají, jen když jde o tentýž objekt.
- [Spread syntax (...)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) — oddíl *Spread in object literals*: pořadí vlastností a přepisování.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const team = { name: 'Sokoli', coach: { name: 'Petr' } };
const coach = team.coach;

coach.name = 'Radka';
team.coach = { name: 'Ivan' };

console.log(coach.name);
```

### --expected--

Radka

### --accept--

'Radka'

### --why--

`coach = team.coach` zkopírovalo odkaz na objekt trenéra. Mutace `coach.name = 'Radka'` změnila ten objekt. Pak `team.coach = { name: 'Ivan' }` přiřadilo do vlastnosti týmu **nový** objekt, ale proměnná `coach` pořád ukazuje na ten původní s Radkou.

### --see--

js-objekty/reference-a-mutace#mutace-objektu-nove-prirazeni

## --question--

Co vypíše poslední řádek?

```js
function rename(ticket, owner) {
  return { ...ticket, owner };
}

const original = { seat: 'A12', owner: 'Ondra' };
const renamed = rename(original, 'Klára');

console.log(original.owner, renamed === original);
```

### --expected--

Ondra false

### --why--

Spread vytvořil nový objekt, do kterého se zkopírovaly vlastnosti a `owner` se přepsal. Původní vstupenka zůstala beze změny a výsledek je jiný objekt, proto `false`.

### --see--

js-objekty/reference-a-mutace#uprava-bez-mutace-novy-objekt

## --question--

Stránka ukazuje seznam produktů a nad ním filtr. Po kliknutí na „Zobrazit ceny s DPH" se ceny změní správně, ale po druhém kliknutí vyrostou znovu. Co je nejpravděpodobnější příčina?

### --answer--

Funkce vrací nový objekt a stránka ho neumí vykreslit.

#### --why--

Nový objekt s přepočtenou cenou by dal při každém kliknutí stejný výsledek. Ceny rostou, protože se počítá z hodnoty, která už přepočtená je.

### --correct--

Funkce zapisuje přepočtenou cenu do objektů produktů, takže další výpočet vychází z už přepočtené ceny.

#### --why--

Mutace změnila původní data. Každé další volání přičte DPH k ceně, která už DPH obsahuje.

### --answer--

Produkty jsou v `const`, a proto se nedají přepočítat znovu.

#### --why--

`const` mutaci nebrání a nic tu nezamyká. Ceny naopak rostou, protože se data mění.

### --see--

js-objekty/reference-a-mutace#funkce-ktera-ma-vracet-zmutuje-vstup

## --question--

Napiš výraz, který vrátí `true`, když proměnné `a` a `b` ukazují na **tentýž** objekt.

### --expected--

a === b

### --accept--

b === a
Object.is(a, b)

### --why--

U objektů `===` porovnává identitu, tedy jestli obě strany ukazují na jeden objekt. Pro obsah bys musel porovnat vlastnosti.

### --see--

js-objekty/reference-a-mutace#porovnani-se-pta-na-identitu
