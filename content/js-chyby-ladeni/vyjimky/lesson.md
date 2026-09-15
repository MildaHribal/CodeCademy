# Výjimky

:::check pretest
Uložená hra je poškozená — text končí uprostřed. Co vypíše tenhle kód? Tipni si, i když si nejsi jistý.

```js
try {
  const save = JSON.parse('{"player":"Tonda","level":');
  console.log('načteno');
} catch {
  console.log('poškozený soubor');
}
console.log('menu');
```

### --expected--

poškozený soubor
menu

### --why--

`JSON.parse` na poškozeném textu vyhodí chybu, takže `console.log('načteno')` se už nespustí a běh skočí do `catch`. Za blokem `try…catch` program pokračuje normálně. Proč právě takhle, vysvětlí první dvě části.
:::

:::check pretest
Funkce potřebuje dát najevo, že dostala nesmyslnou úroveň hráče. Který zápis je nejlepší?

### --answer--

`return 'Chyba: neplatná úroveň';`

#### --why--

Text vrácený přes `return` vypadá jako obyčejný výsledek. Volající ho klidně uloží jako úroveň a na chybu nikdo nepřijde.

### --answer--

`throw 'Neplatná úroveň';`

#### --why--

Vyhodit se dá cokoli, ale text nemá `message` ani záznam o tom, kde chyba vznikla. Co přesně chybí, uvidíš v části o tom, co vyhodit.

### --correct--

`throw new RangeError('Úroveň musí být 1–50, ne 77');`

#### --why--

Objekt chyby nese druh (`RangeError`), zprávu i místo vzniku. Proč na tom záleží, vysvětlí část o tom, co vyhodit.
:::

Hráč otevře hru a klikne na uloženou pozici. Jenže soubor se při minulém ukládání
uřízl, `JSON.parse` na něm selže a s ním celá úvodní obrazovka: menu se nevykreslí
a hráč kouká na prázdnou stránku. V konzoli svítí
`SyntaxError: Unexpected end of JSON input`.

Takhle to dopadne pokaždé, když s chybou nikdo nepočítá. Poškozený soubor, špatně
vyplněný formulář nebo výpadek sítě nastanou dřív nebo později v každé aplikaci.
Tahle lekce ukáže, jak chybu vyhodit, chytit a uklidit po ní tak, aby hráč viděl
srozumitelnou hlášku a zbytek hry běžel dál.

> [!REMEMBER]
> **Výjimka přeruší běh a letí nahoru přes volající funkce, dokud ji nějaký `catch` nechytí.** Když ji nechytí nikdo, skript skončí.

## Co udělá `throw`

Příkaz `throw` vyhodí [[výjimka|výjimku]] (*exception*). Od toho místa se nic
dalšího ve funkci nespustí — ani `return`, ani zbytek řádků. Výjimka pak vyletí
z funkce do místa, odkud ji někdo zavolal, a odtud dál, dokud ji nezachytí blok
`try…catch`.

:::live js predict
```js
function readLevel(text) {
  const level = Number(text);
  if (level < 1) throw new RangeError('Úroveň musí být aspoň 1');
  console.log('úroveň v pořádku');
  return level;
}

function openSave(text) {
  const level = readLevel(text);
  console.log('otevírám hru');
  return level;
}

try {
  openSave('0');
} catch (error) {
  console.log('chyceno:', error.message);
}
```
--question-- Co vypíše tenhle kód? Každý výpis na nový řádek.
--expected--
```text
chyceno: Úroveň musí být aspoň 1
```
--why-- `throw` v `readLevel` ukončí funkci hned na místě, takže `úroveň v pořádku` se nevypíše. Výjimka pak vyletí z `openSave` dřív, než se dostane k `otevírám hru`, a zachytí ji až `catch` na konci. Zkus změnit `'0'` na `'5'` a sleduj, které výpisy přibudou.
:::

Když výjimku nechytí nikdo, prohlížeč ji vypíše do konzole jako
`Uncaught RangeError: Úroveň musí být aspoň 1` a zbytek skriptu se nespustí.
Stránka ale nezmizí a tlačítka, která už fungují, fungují dál.

:::check
Funkce `a` zavolá `b` a `b` zavolá `c`. Ve funkci `c` se vyhodí výjimka a `try…catch` je jen kolem volání `a()`. Kde výjimka skončí?

### --answer--

Ve funkci `c`, protože tam vznikla.

#### --why--

Funkce, která výjimku vyhodí, ji sama nezpracuje. Pokud nemá vlastní `try…catch`, výjimka z ní vyletí.

### --correct--

V `catch` kolem volání `a()` — proletí přes `b` i `a`.

#### --why--

Výjimka letí nahoru po řetězu volání, dokud nenarazí na `catch`. Zbytek těl funkcí `c`, `b` i `a` se přeskočí.

### --answer--

Ve funkci `b`, protože zavolala `c`.

#### --why--

Volání funkce výjimku nezastaví. Zastaví ji jen `catch`, a ten `b` nemá.

### --see--

js-chyby-ladeni/vyjimky#co-udela-throw
:::

## `try` a `catch`: chytit a pokračovat

Kód, který může selhat, dáš do bloku `try`. Když v něm (nebo v čemkoli, co zavolá)
vznikne výjimka, běh skočí do `catch`. Tam dostaneš objekt chyby — nejčastěji se mu
říká `error` — a můžeš ukázat hlášku, vrátit náhradní hodnotu nebo to zkusit jinak.
Za celým blokem program pokračuje, jako by se nic nestalo.

:::live js
```js
const slots = ['{"player":"Eliška","level":12}', '{"player":"Tonda","level":'];

for (const text of slots) {
  try {
    const save = JSON.parse(text);
    console.log(`${save.player}, úroveň ${save.level}`);
  } catch (error) {
    console.log(`Pozici nejde načíst — ${error.name}: ${error.message}`);
  }
}

console.log('menu je hotové');
```
:::

Každá chyba má vlastnosti `name` (druh chyby) a `message` (popis). Zkus do pole
přidat prázdný text `''` a sleduj, jakou zprávu vypíše `JSON.parse` tentokrát.
Porovnej to s tím, co by se stalo bez `try…catch`: první poškozená pozice by
shodila celý cyklus a `menu je hotové` by se nevypsalo.

Když objekt chyby nepotřebuješ, smíš závorku vynechat: `catch { … }`.

:::check
Co vypíše tenhle kód?

```js
try {
  console.log('A');
  JSON.parse('nejde');
  console.log('B');
} catch {
  console.log('C');
}
console.log('D');
```

### --expected--

A
C
D

### --why--

Řádky v `try` běží, dokud nevznikne výjimka. `A` se vypíše, `JSON.parse` selže, `B` se přeskočí a běh skočí do `catch` (`C`). Za blokem program pokračuje (`D`).

### --see--

js-chyby-ladeni/vyjimky#try-a-catch-chytit-a-pokracovat
:::

## Co vyhodit: objekt `Error` se srozumitelnou zprávou

Vyhodit smíš jakoukoli hodnotu, ale vždycky vyhazuj objekt chyby: `new Error(…)`
nebo jeden z vestavěných druhů. Objekt chyby nese `name`, `message` a `stack` —
[výpis zásobníku](see:js-zaklady/cteni-chyb-a-debugger), podle kterého v konzoli
najdeš řádek, kde chyba vznikla.

| druh | kdy ho vyhodit |
|---|---|
| `Error` | obecná chyba, když se nic přesnějšího nehodí |
| `TypeError` | hodnota má špatný typ: čekáš text, přišlo číslo nebo `undefined` |
| `RangeError` | typ sedí, ale hodnota je mimo povolený rozsah: úroveň `77` z `1–50` |

Zprávu piš pro člověka, který chybu bude hledat: **co je špatně a s jakou hodnotou**.
`Neplatná hodnota` nepomůže nikomu, `Úroveň musí být celé číslo 1–50, ne 77` řekne
všechno.

Co se stane, když místo objektu vyhodíš jen text?

:::live js predict
```js
function checkCoins(coins) {
  if (coins < 0) throw 'Počet mincí nesmí být záporný';
  return coins;
}

try {
  checkCoins(-20);
} catch (error) {
  console.log(`Chyba: ${error.message}`);
}
```
--question-- Co vypíše `console.log` v `catch`?
--expected-- Chyba: undefined
--why-- Vyhozený text nemá vlastnost `message`, protože to není objekt chyby — `error` je tu obyčejný řetězec. Chybí mu i `name` a `stack`, takže v konzoli nezjistíš, kde vznikl. Zkus místo textu napsat `throw new RangeError('Počet mincí nesmí být záporný')`.
:::

:::check
Funkce `setVolume(volume)` dostala místo čísla text `'hlasitě'`. Který druh chyby se hodí vyhodit?

### --expected--

TypeError

### --accept--

new TypeError
TypeError()

### --why--

Hodnota má špatný typ — čekáš číslo a přišel text. `RangeError` by se hodil, kdyby přišlo číslo, jen mimo povolený rozsah (třeba `150` u hlasitosti `0–100`).

### --see--

js-chyby-ladeni/vyjimky#co-vyhodit-objekt-error-se-srozumitelnou-zpravou
:::

## `finally`: úklid, ať to dopadne jakkoli

Blok `finally` se spustí vždycky: když `try` doběhne, když vznikne výjimka i když
`try` skončí příkazem `return`. Patří do něj úklid, který se musí udělat v každém
případě — schovat točící se ikonu nahrávání, odemknout tlačítko **Uložit**,
zavřít soubor.

:::live js
```js
const loader = { busy: false };

function loadSave(text) {
  loader.busy = true;
  try {
    return JSON.parse(text);
  } finally {
    loader.busy = false;
  }
}

try {
  loadSave('{"level":');
} catch (error) {
  console.log('nepovedlo se, ikona točí:', loader.busy);
}
```
:::

Blok `try` tu nemá `catch` — chybu tahle funkce neřeší, jen po sobě uklidí
a výjimku nechá letět dál. Zkus řádek `loader.busy = false` přesunout z `finally`
za celý blok a sleduj, co se vypíše: ikona by se točila navždy.

V jakém pořadí se spustí `return` a `finally`?

:::live js predict
```js
function save() {
  try {
    console.log('ukládám');
    return 'uloženo';
  } finally {
    console.log('úklid');
  }
}

console.log(save());
```
--question-- Co vypíše tenhle kód? Každý výpis na nový řádek.
--expected--
```text
ukládám
úklid
uloženo
```
--why-- `return 'uloženo'` si výsledek připraví, ale než funkce opravdu skončí, spustí se `finally`. Proto se `úklid` vypíše dřív, než volající dostane hodnotu a vypíše ji.
:::

:::check
K čemu je `finally`, když stejný řádek můžeš napsat na konec `try` i na konec `catch`?

### --answer--

K ničemu, je to jen kratší zápis.

#### --why--

Na konec `try` se běh nedostane, když uprostřed vznikne výjimka nebo když se dřív spustí `return`. Kopie v `catch` zase nepomůže, když `catch` chybí nebo sám vyhodí výjimku.

### --correct--

Spustí se i po `return` a i tehdy, když výjimka z bloku vyletí dál.

#### --why--

Právě proto se do `finally` dává úklid: proběhne v každém případě, ať blok skončí jakkoli.

### --answer--

Spustí se jen tehdy, když nevznikla žádná chyba.

#### --why--

To dělá obyčejný kód za posledním řádkem `try`. `finally` se spouští vždycky.

### --see--

js-chyby-ladeni/vyjimky#finally-uklid-at-to-dopadne-jakkoli
:::

## Chyba uživatele a chyba programu

Ne každá výjimka je stejná. Dobré je rozlišit dva druhy:

| | [[očekávaná chyba]] | [[chyba programu]] |
|---|---|---|
| příklad | poškozený soubor, špatně vyplněný e-mail, výpadek sítě | překlep ve jménu funkce, čtení z `undefined`, špatný typ argumentu |
| čí je vina | okolí: uživatel, data, síť | autora kódu |
| co s ní | počítat s ní: srozumitelná hláška, náhradní hodnota, zkusit znovu | nechat ji spadnout, najít a opravit kód |
| typická hláška | `SyntaxError: Unexpected end of JSON input` z `JSON.parse` | `TypeError: Cannot read properties of undefined (reading 'level')` |

Očekávanou chybu chytáš, protože víš, co s ní dělat. Chybu programu **nechytáš
potichu** — kdybys ji schoval, aplikace by pokračovala se špatnými daty a chyba
by se ukázala o hodinu později na úplně jiném místě.

:::check
Která z těchhle chyb je chyba programu, kterou nemá smysl chytat a ukazovat uživateli?

### --answer--

Uživatel do políčka pro PSČ napsal `Praha`.

#### --why--

S tím musí aplikace počítat. Uživatel dostane hlášku a údaj opraví.

### --answer--

Soubor s uloženou hrou je prázdný.

#### --why--

Prázdný soubor se stane — třeba když se vypne počítač uprostřed ukládání. Hra má ukázat, že pozici nejde načíst.

### --correct--

`TypeError: saveGame is not a function` — ve funkci je překlep ve jménu.

#### --why--

Uživatel s tím nic neudělá. Chybu musí opravit autor kódu, a čím dřív spadne, tím dřív si jí všimne.

### --see--

js-chyby-ladeni/vyjimky#chyba-uzivatele-a-chyba-programu
:::

## Obalení chyby přes `cause`

Zpráva `Unexpected end of JSON input` říká, ==co== selhalo, ale ne ==při čem==.
Kdyby hra načítala deset pozic, nevíš, která z nich je poškozená. Proto chybu
chytíš, vyhodíš novou se zprávou, která dává smysl na tvé úrovni, a původní přidáš
jako [[příčina chyby|příčinu]] (*cause*): `new Error(zpráva, { cause: původníChyba })`.

:::live js
```js
function loadSlot(slotId, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Pozici ${slotId} nejde načíst`, { cause: error });
  }
}

try {
  loadSlot('slot-2', '{"player":"Tonda","level":');
} catch (error) {
  console.log(error.message);
  console.log('příčina:', error.cause.name, '—', error.cause.message);
}
```
:::

Nová chyba nese obojí: srozumitelnou zprávu pro menu i původní chybu pro toho, kdo
bude problém hledat. V konzoli Chrome se u takové chyby vypíše i řádek
`Caused by:` s původní chybou a jejím výpisem zásobníku. Zkus v `loadSlot` vynechat
`{ cause: error }` a sleduj, co vypíše druhý `console.log`.

:::check
Proč chybu z `JSON.parse` obalit novou chybou s `cause`, místo abys ji nechal vyletět tak, jak je?

### --answer--

Protože `SyntaxError` nejde chytit, dokud ho neobalíš.

#### --why--

`SyntaxError` z `JSON.parse` chytíš úplně stejně jako jakoukoli jinou výjimku. Obalení řeší něco jiného než to, jestli jde chybu chytit.

### --correct--

Nová zpráva řekne, při čem chyba vznikla, a původní chyba zůstane dostupná v `cause`.

#### --why--

`Pozici slot-2 nejde načíst` dává smysl v menu i v záznamu chyb, a detail z `JSON.parse` se neztratí.

### --answer--

Aby se chyba v konzoli nevypsala.

#### --why--

Obalení nic neschovává — nová chyba letí dál a v konzoli se vypíše i s původní příčinou.

### --see--

js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause
:::

## Víc chyb najednou: `AggregateError`

Někdy nechceš skončit u první chyby. Import deseti uložených pozic má zkusit všechny
a nakonec říct, které se nepovedly. Na to je `AggregateError`: vyhodíš ho s polem
chyb a zprávou, `new AggregateError(chyby, zpráva)`, a chyby pak najdeš v jeho
vlastnosti `errors`.

:::live js
```js
const texts = ['{"level":3}', '', '{"level":', '{"level":8}'];
const saves = [];
const errors = [];

for (const [index, text] of texts.entries()) {
  try {
    saves.push(JSON.parse(text));
  } catch (error) {
    errors.push(new Error(`Pozice ${index + 1} je poškozená`, { cause: error }));
  }
}

try {
  if (errors.length > 0) {
    throw new AggregateError(errors, `Nepovedlo se ${errors.length} z ${texts.length} pozic`);
  }
} catch (error) {
  console.log(error.name, '—', error.message);
  for (const item of error.errors) console.log(' ·', item.message);
}
```
:::

Zkus opravit prázdný text na `'{"level":1}'` a sleduj, jak se změní zpráva i seznam.

> [!NOTE]
> `AggregateError` potkáš znovu v sekci o asynchronním JavaScriptu: vyhazuje ho
> `Promise.any`, když selžou všechny pokusy.

:::check
Jak se ve výjimce `AggregateError` dostaneš k jednotlivým chybám? Napiš výraz pro první z nich, když objekt chyby máš v proměnné `error`.

### --expected--

error.errors[0]

### --accept--

error.errors.at(0)

### --why--

`AggregateError` nese pole chyb ve vlastnosti `errors`. Jeho vlastní `message` je souhrnná zpráva, kterou jsi mu dal při vytvoření.

### --see--

js-chyby-ladeni/vyjimky#vic-chyb-najednou-aggregateerror
:::

## Kde chybu chytat

Začátečník má chuť dát `try…catch` do každé funkce „pro jistotu". Tím si ale jen
schová chyby. Chytej tam, kde **víš, co s chybou udělat**:

- **Nízko** (načtení souboru, `JSON.parse`, výpočet) chybu vyhoď nebo obal přes
  `cause`. Tahle funkce neví, jestli má ukázat hlášku, zkusit zálohu, nebo skončit.
- **Nahoře** (obsluha kliknutí, spuštění hry, odeslání formuláře) chybu chytíš
  a rozhodneš: hláška v menu, náhradní hodnota, záznam do konzole.

Když chytíš chybu, se kterou neumíš nic udělat, vyhoď ji znovu: `throw error`.
Tak chytíš jen očekávaný druh a zbytek necháš letět dál:

```js
function readSettings(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    // 1. poškozený text umím vyřešit: výchozí nastavení
    if (error instanceof SyntaxError) return { sound: true };
    // 2. cokoli jiného neumím, ať to vyletí dál
    throw error;
  }
}
```

`instanceof` se ptá, jestli je chyba daného druhu. Vlastní druhy chyb si napíšeš
v další lekci.

:::explain
Vysvětli, proč nepatří `try…catch` do každé funkce a kde má smysl chybu chytit.

## --model--

Chytit chybu má smysl jen tam, kde vím, co s ní udělat: ukázat hlášku, použít náhradní hodnotu nebo to zkusit znovu. Nízkoúrovňová funkce to neví, tak chybu vyhodí nebo obalí přes `cause` a nechá rozhodnout volajícího. Nahoře, třeba v obsluze kliknutí, chybu chytím a zobrazím. Kdybych chytal všude, schoval bych i chyby programu a aplikace by pokračovala se špatnými daty.

## --checklist--

- Chybu chytám tam, kde s ní umím něco udělat.
- Nízkoúrovňová funkce chybu vyhodí nebo obalí a rozhodnutí nechá volajícímu.
- Nahoře (obsluha události, start aplikace) chybu chytím a ukážu uživateli.
- `try…catch` všude by schoval i chyby programu.
- Chybu, kterou neumím vyřešit, vyhodím znovu.
:::

:::check
Funkce `parsePrice(text)` převádí text z formuláře na číslo a na nesmyslném vstupu vyhodí `RangeError`. Kde se má chyba chytit?

### --answer--

Uvnitř `parsePrice`, aby vrátila `0`.

#### --why--

Nula vypadá jako platná cena. Objednávka by prošla zadarmo a nikdo by se nedozvěděl, že vstup byl špatně.

### --correct--

V obsluze odeslání formuláře, která ukáže hlášku u políčka s cenou.

#### --why--

Tam je jasné, co s chybou dělat: říct uživateli, které políčko má opravit. `parsePrice` to vědět nemusí.

### --answer--

Nikde — ať aplikace spadne, uživatel si toho všimne.

#### --why--

Špatně vyplněné políčko je očekávaná chyba. Spadlá aplikace uživateli neřekne, co má opravit.

### --see--

js-chyby-ladeni/vyjimky#kde-chybu-chytat
:::

## Typické chyby a pasti

### Prázdný `catch` spolkne chybu programu

:::live js predict
```js
const order = { items: [{ price: 289, quantity: 2 }] };

function orderTotal(order) {
  try {
    return order.item.reduce((sum, line) => sum + line.price * line.quantity, 0);
  } catch {
    return 0;
  }
}

console.log(`Celkem: ${orderTotal(order)} Kč`);
```
--question-- Co vypíše tenhle kód?
--expected-- Celkem: 0 Kč
--why-- V `try` je překlep `order.item` místo `order.items`. Čtení `undefined.reduce` vyhodí `TypeError`, jenže prázdný `catch` ho chytí a vrátí nulu. V konzoli není ani stopa po chybě a objednávka „stojí" 0 Kč. Zkus `catch` smazat i s `try` a sleduj, jakou hlášku uvidíš.
:::

> [!PITFALL]
> **`catch`, který chytí všechno a nic neřekne, schová i chybu programu** — tomu se
> říká [[polykání chyb]]. Příznak:
> nesmyslný výsledek (`0`, `null`, prázdné pole) a v konzoli žádná chyba. Oprava:
> chytej jen druh, se kterým umíš něco udělat, a ostatní vyhoď znovu (`throw error`).
> Když už chytáš všechno, aspoň chybu vypiš přes `console.error(error)`.

### `return` ve `finally`

:::live js predict
```js
function backupSlot(text) {
  try {
    JSON.parse(text);
    return 'záloha hotová';
  } catch {
    return 'záloha selhala';
  } finally {
    return 'hotovo';
  }
}

console.log(backupSlot('{"level":'));
```
--question-- Co vypíše tenhle kód?
--expected-- hotovo
--why-- `catch` si připraví výsledek `záloha selhala`, ale `finally` se spustí až po něm a jeho vlastní `return` výsledek přepíše. Stejně by přepsal i výjimku — ta by se ztratila.
:::

> [!PITFALL]
> **`return` ve `finally` přebije výsledek z `try` i z `catch` a spolkne výjimku.**
> Příznak: funkce vrací pořád totéž, ať se stalo cokoli. Oprava: do `finally` dávej
> jen úklid, nikdy `return` ani `throw`.

### Proměnná z `try` není za blokem vidět

> [!PITFALL]
> **`const` a `let` uvnitř `try` platí jen v tom bloku.** Kód
> `try { const save = JSON.parse(text); } catch { … }` a za ním `console.log(save)`
> skončí hláškou `ReferenceError: save is not defined`. Oprava: založ proměnnou před
> blokem (`let save;`) a v `try` do ní jen přiřaď, nebo celou práci s ní udělej
> uvnitř `try`.

### `throw` textu místo `Error`

> [!PITFALL]
> **Vyhozený text nemá `message`, `name` ani `stack`.** Příznak: hláška
> `Chyba: undefined` a v konzoli nejde zjistit, kde chyba vznikla. Oprava: vždycky
> `throw new Error('…')` nebo přesnější `TypeError`, `RangeError`.

### `try` nechytí chybu, která nastane později

> [!PITFALL]
> **`try…catch` chytí jen chybu, která vznikne, zatímco blok běží.** Když v něm jen
> naplánuješ funkci na později (`setTimeout(() => JSON.parse(text), 1000)`), chyba
> uvnitř vznikne až po skončení bloku a vypíše se jako `Uncaught SyntaxError`.
> Oprava: `try…catch` patří dovnitř funkce, která se spustí později. Jak to vypadá
> u `await`, uvidíš v sekci o asynchronním JavaScriptu.

:::check
V kódu je `try { const settings = JSON.parse(text); } catch { … }` a o řádek níž `applySettings(settings)`. Co se stane, když je text v pořádku?

### --answer--

Všechno proběhne, `settings` obsahuje načtené nastavení.

#### --why--

`JSON.parse` sice uspěje, ale `const settings` existuje jen uvnitř bloku `try`. Za ním už to jméno neznamená nic.

### --correct--

Skript spadne s `ReferenceError: settings is not defined`.

#### --why--

`const` uvnitř `try` platí jen v tom bloku. Proměnnou založ před blokem přes `let settings;`, nebo `applySettings` zavolej uvnitř `try`.

### --answer--

`catch` zachytí chybu, protože `settings` nejde přečíst.

#### --why--

Řádek s `applySettings` leží mimo `try`, takže ho žádný `catch` nechrání.

### --see--

js-chyby-ladeni/vyjimky#promenna-z-try-neni-za-blokem-videt
:::

Ve workshopu teď postavíš správce uložených her: načtení pozice, která může být
poškozená, úklid přes `finally`, obalení chyb a hlášení všech rozbitých pozic
najednou.

## Kde to najdeš v MDN

- [try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) — `try`, `catch`, `finally` a v části *The finally block* i varování, že `return` ve `finally` přebije výsledek.
- [throw](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw) — co všechno jde vyhodit a proč je lepší objekt chyby.
- [Error: cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) — obalení chyby a druhý argument konstruktoru `Error`.
- [AggregateError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) — konstruktor s polem chyb a vlastnost `errors`.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
function unlock(level) {
  try {
    if (level < 10) throw new RangeError('Mapa se odemyká od úrovně 10');
    return 'odemčeno';
  } catch (error) {
    return error.message;
  } finally {
    console.log('kontrola hotová');
  }
}

console.log(unlock(4));
```

### --expected--

kontrola hotová
Mapa se odemyká od úrovně 10

### --why--

`throw` skočí do `catch`, ten si připraví výsledek se zprávou chyby. Než ho funkce vrátí, spustí se `finally` a vypíše `kontrola hotová`. Teprve pak volající dostane zprávu a vypíše ji.

### --see--

js-chyby-ladeni/vyjimky#finally-uklid-at-to-dopadne-jakkoli

## --question--

Funkce `loadProfile(text)` volá `JSON.parse`. Na poškozeném textu má vyhodit chybu se zprávou `Profil nejde načíst` a zachovat původní chybu. Napiš příkaz, který v `catch (error)` takovou chybu vyhodí.

### --expected--

throw new Error('Profil nejde načíst', { cause: error })

### --accept--

throw new Error(`Profil nejde načíst`, { cause: error })
throw new Error('Profil nejde načíst', {cause: error})

### --why--

Druhý argument konstruktoru `Error` je objekt s volbou `cause`. Původní chyba pak zůstane dostupná v `error.cause` a konzole Chrome ji vypíše pod řádkem `Caused by:`.

### --see--

js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause

## --question--

Kolega „opravil" pád aplikace tak, že celé tělo funkce `renderInventory` obalil do `try { … } catch {}`. Aplikace už nepadá. Co je na tom špatně?

### --answer--

Nic, aplikace přece funguje.

#### --why--

Aplikace nepadá, ale nefunguje: chyba, která pád způsobila, v kódu zůstala. Jen už o ní nikdo neví.

### --correct--

Chyba programu zůstala v kódu, jen ji teď nikdo neuvidí — inventář se nevykreslí a konzole mlčí.

#### --why--

Prázdný `catch` schová i chybu programu. Správně je najít příčinu pádu a opravit ji, případně chytat jen očekávaný druh chyby.

### --answer--

`catch` bez závorky `(error)` je syntaktická chyba.

#### --why--

Zápis `catch { … }` bez proměnné je platný. Problém je v tom, co blok dělá, ne v zápisu.

### --see--

js-chyby-ladeni/vyjimky#prazdny-catch-spolkne-chybu-programu
