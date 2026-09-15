## --card-- output

Co vypíše tenhle kód? Každý výpis na nový řádek.

```js
function closeRegister() {
  try {
    console.log('počítám tržbu');
    return 'uzavřeno';
  } finally {
    console.log('zamykám kasu');
  }
}

console.log(closeRegister());
```

### --expected--

počítám tržbu
zamykám kasu
uzavřeno

### --why--

Myslíš si, že `return` funkci ukončí hned? Výsledek si jen připraví a před návratem se ještě spustí `finally`. Volající proto dostane `uzavřeno` až po výpisu z `finally`.

### --see--

js-chyby-ladeni/vyjimky#finally-uklid-at-to-dopadne-jakkoli

## --card-- output

Co vypíše tenhle kód?

```js
function checkTicket(code) {
  try {
    if (!code.startsWith('VIP')) throw new Error('Neplatná vstupenka');
    return 'vstup povolen';
  } catch (error) {
    return error.message;
  } finally {
    return 'kontrola hotová';
  }
}

console.log(checkTicket('STD-12'));
```

### --expected--

kontrola hotová

### --why--

Myslíš si, že vyhraje `return` z `catch`? `finally` se spustí až po něm a jeho vlastní `return` připravený výsledek přepíše. Do `finally` patří jen úklid.

### --see--

js-chyby-ladeni/vyjimky#return-ve-finally

## --card-- output

Co vypíše tenhle kód? Napiš dvě hodnoty oddělené mezerou.

```js
try {
  throw 'Sklad je prázdný';
} catch (error) {
  console.log(typeof error, error.message);
}
```

### --expected--

string undefined

### --why--

Myslíš si, že se z textu stane objekt chyby? `throw` vyhodí přesně to, co mu dáš. Text nemá `message`, `name` ani `stack`. Proto vždycky `throw new Error('…')`.

### --see--

js-chyby-ladeni/vyjimky#throw-textu-misto-error

## --card-- output

Co vypíše tenhle kód? Každý výpis na nový řádek.

```js
let order;
try {
  order = JSON.parse('{"id":7');
} catch {
  console.log('poškozená objednávka');
}
console.log(order);
```

### --expected--

poškozená objednávka
undefined

### --why--

`JSON.parse` vyhodí chybu dřív, než se výsledek přiřadí, takže `order` zůstane bez hodnoty. Proměnná založená před blokem za ním existuje, jen v ní nic není — s výsledkem z `try` proto pracuj opatrně.

### --see--

js-chyby-ladeni/vyjimky#promenna-z-try-neni-za-blokem-videt

## --card-- output

Co vypíše tenhle kód?

```js
class StockError extends Error {}

console.log(String(new StockError('Kávovar není skladem')));
```

### --expected--

Error: Kávovar není skladem

### --why--

Myslíš si, že se chyba sama představí jménem třídy? `name` se zdědí z `Error` a zůstane `'Error'`, dokud ho ve třídě nenastavíš (`this.name = 'StockError'`).

### --see--

js-chyby-ladeni/vlastni-chyby#chybi-name-ve-vlastni-tride

## --card-- output

Co vypíše tenhle kód?

```js
class ValidationError extends Error {}

function couponPercent(order) {
  try {
    return order.coupon.percent;
  } catch (error) {
    if (error instanceof ValidationError) {
      return 0;
    }
  }
}

console.log(couponPercent({}));
```

### --expected--

undefined

### --why--

`order.coupon` je `undefined` a čtení `percent` vyhodí `TypeError`. Podmínka s `instanceof` neplatí a `catch` doběhne bez `return` i bez `throw`, takže funkce vrátí `undefined` a chyba programu zmizí. Na konec `catch` patří `throw error;`.

### --see--

js-chyby-ladeni/vlastni-chyby#instanceof-bez-throw-error-na-konci

## --card-- output

Co vypíše tenhle kód?

```js
const failed = [new Error('Foto 3 je moc velké'), new Error('Foto 7 není JPG')];
const error = new AggregateError(failed, 'Nahrání selhalo');

console.log(error.message, '|', error.errors.at(-1).message);
```

### --expected--

Nahrání selhalo | Foto 7 není JPG

### --why--

`message` je souhrnná zpráva z druhého argumentu. Jednotlivé chyby jsou v poli `errors`, poslední z nich vrátí `at(-1)`.

### --see--

js-chyby-ladeni/vyjimky#vic-chyb-najednou-aggregateerror

## --card-- output

Co vypíše tenhle kód?

```js
try {
  try {
    JSON.parse('{');
  } catch (error) {
    throw new Error('Profil nejde načíst', { cause: error });
  }
} catch (error) {
  console.log(error.message, '|', error.cause.name);
}
```

### --expected--

Profil nejde načíst | SyntaxError

### --why--

Vnější `catch` dostal novou chybu se zprávou o profilu. Původní `SyntaxError` z `JSON.parse` se neztratil — je celý ve vlastnosti `cause`.

### --see--

js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause

## --card-- output

Co vypíše tenhle kód? Každý výpis na nový řádek.

```js
const cart = { total: 0 };

console.assert(cart.total > 0, 'Prázdný košík');
console.assert(cart.total >= 0, 'Záporná cena');
console.log('konec');
```

### --expected--

Assertion failed: Prázdný košík
konec

### --why--

`console.assert` vypíše zprávu jen u podmínky, která neplatí — nula není větší než nula, ale je větší nebo rovna. Program přitom nezastaví, takže `konec` se vypíše taky.

### --see--

js-chyby-ladeni/ladeni-systematicky#bisekce-pul-kodu-pryc

## --card-- output

Co vypíše tenhle kód?

```js
const price = Number('1 290');

console.log(`Cena: ${price || 0} Kč`);
```

### --expected--

Cena: 0 Kč

### --why--

`Number('1 290')` je kvůli mezeře `NaN` a `|| 0` ho přemaluje na nulu. Hláška s `NaN` zmizí, ale cena je tiše špatně. Oprava patří tam, kde hodnota vzniká: mezery odstranit před převodem.

### --see--

js-chyby-ladeni/ladeni-systematicky#oprava-priznaku-misto-priciny

## --card-- output

Stránka profilu spadla a konzole ukázala tenhle stack trace. Na kterém řádku kterého souboru je poslední místo **tvého** kódu před pádem? Napiš ve tvaru `soubor:řádek`.

```text
Uncaught SyntaxError: Unexpected end of JSON input
    at JSON.parse (<anonymous>)
    at loadProfile (profile.js:14:21)
    at renderHeader (header.js:6:19)
    at main.js:3:1
```

### --expected--

profile.js:14

### --accept--

profile.js 14

### --why--

Myslíš si, že chyba je v `JSON.parse`? Řádek s `<anonymous>` patří vestavěné funkci, ne tvému kódu. První řádek tvého kódu je `loadProfile` v `profile.js` na řádku 14, kde se `JSON.parse` zavolal s poškozeným textem. Odtud pokračuj dolů: kdo ten text poslal.

### --see--

js-chyby-ladeni/ladeni-systematicky#stack-trace-pres-vic-souboru

## --card-- code js

Napiš třídu `FieldError`, potomka `Error`. Konstruktor dostane jméno políčka, zprávu a volby: `new FieldError('phone', 'Zadej telefon', { cause })`. Chyba má `name` `'FieldError'`, políčko ve vlastnosti `field` a příčinu z voleb.

### --seed--

```js
class FieldError extends Error {
}
```

### --test--

```js
const cause = new TypeError('value.trim is not a function');
const error = new FieldError('phone', 'Zadej telefon', { cause });
assert.ok(error instanceof Error, 'new FieldError(…) má být instance Error');
assert.equal(error.message, 'Zadej telefon', "message má být 'Zadej telefon'");
assert.equal(error.name, 'FieldError', "name má být 'FieldError'");
assert.equal(error.field, 'phone', "field má být 'phone'");
assert.equal(error.cause, cause, 'cause má být předaná příčina');
```

### --solution--

```js
class FieldError extends Error {
  constructor(field, message, options) {
    super(message, options);
    this.name = 'FieldError';
    this.field = field;
  }
}
```

### --see--

js-chyby-ladeni/vlastni-chyby#vlastni-trida-chyby

## --card-- code js

Napiš funkci `withFallback(run, fallback)`, která zavolá `run()` a vrátí výsledek. Když `run` vyhodí `RangeError`, vrátí `fallback`. Každou jinou chybu nechá vyletět.

### --seed--

```js
function withFallback(run, fallback) {
}
```

### --test--

```js
assert.equal(withFallback(() => 42, 0), 42, 'withFallback(() => 42, 0) má vrátit 42');
assert.equal(withFallback(() => { throw new RangeError('mimo rozsah'); }, 0), 0, 'withFallback s RangeError má vrátit fallback 0');
assert.throws(() => withFallback(() => { throw new TypeError('x is not a function'); }, 0), TypeError, 'withFallback má TypeError nechat vyletět');
```

### --solution--

```js
function withFallback(run, fallback) {
  try {
    return run();
  } catch (error) {
    if (error instanceof RangeError) {
      return fallback;
    }
    throw error;
  }
}
```

### --see--

js-chyby-ladeni/vlastni-chyby#instanceof-v-catch-chyt-jen-to-co-umis-vyresit

## --card-- code js

Napiš funkci `loadInvoice(id, text)`, která vrátí objekt z JSON textu faktury. Když text nejde přečíst, vyhodí `Error` se zprávou `Fakturu 2026-117 nejde načíst` (se skutečným `id`) a původní chybou jako příčinou.

### --seed--

```js
function loadInvoice(id, text) {
}
```

### --test--

```js
assert.deepEqual(loadInvoice('2026-001', '{"total":1290}'), { total: 1290 }, "loadInvoice('2026-001', '{\"total\":1290}') má vrátit { total: 1290 }");
let error;
try {
  loadInvoice('2026-117', '{"total":');
} catch (caught) {
  error = caught;
}
assert.equal(error?.message, 'Fakturu 2026-117 nejde načíst', "zpráva má být 'Fakturu 2026-117 nejde načíst'");
assert.ok(error.cause instanceof SyntaxError, 'cause má být původní SyntaxError z JSON.parse');
```

### --solution--

```js
function loadInvoice(id, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Fakturu ${id} nejde načíst`, { cause: error });
  }
}
```

### --see--

js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause

## --card-- code js

Napiš funkci `runAll(tasks)`, která zavolá každou funkci z pole `tasks` a vrátí pole jejich výsledků. Když některé selžou, zkusí i ostatní a nakonec vyhodí `AggregateError` se všemi chybami v pořadí úloh.

### --seed--

```js
function runAll(tasks) {
}
```

### --test--

```js
assert.deepEqual(runAll([() => 1, () => 2]), [1, 2], 'runAll([() => 1, () => 2]) má vrátit [1, 2]');
let calls = 0;
let error;
try {
  runAll([() => { throw new Error('první'); }, () => { calls += 1; return 2; }, () => { throw new Error('třetí'); }]);
} catch (caught) {
  error = caught;
}
assert.ok(error instanceof AggregateError, 'runAll s chybami má vyhodit AggregateError');
assert.equal(calls, 1, 'runAll má po první chybě spustit i další úlohy');
assert.deepEqual(error.errors.map((item) => item.message), ['první', 'třetí'], 'errors mají obsahovat chyby první a třetí úlohy');
```

### --solution--

```js
function runAll(tasks) {
  const results = [];
  const errors = [];
  for (const task of tasks) {
    try {
      results.push(task());
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, `Selhalo ${errors.length} z ${tasks.length} úloh`);
  }
  return results;
}
```

### --see--

js-chyby-ladeni/vyjimky#vic-chyb-najednou-aggregateerror

## --card-- code js

Napiš funkci `withSpinner(spinner, work)`, která nastaví `spinner.visible` na `true`, zavolá `work()` a vrátí jeho výsledek. Točící se ikona musí zmizet (`spinner.visible = false`) v každém případě, i když `work` vyhodí chybu — tu nech vyletět.

### --seed--

```js
function withSpinner(spinner, work) {
}
```

### --test--

```js
const spinner = { visible: false };
assert.equal(withSpinner(spinner, () => 'hotovo'), 'hotovo', "withSpinner(…, () => 'hotovo') má vrátit 'hotovo'");
assert.equal(spinner.visible, false, 'po úspěchu má být spinner.visible false');
let seen;
assert.throws(() => withSpinner(spinner, () => { seen = spinner.visible; throw new Error('výpadek'); }), Error, 'chyba z work má vyletět');
assert.equal(seen, true, 'během work má být spinner.visible true');
assert.equal(spinner.visible, false, 'po chybě má být spinner.visible false');
```

### --solution--

```js
function withSpinner(spinner, work) {
  spinner.visible = true;
  try {
    return work();
  } finally {
    spinner.visible = false;
  }
}
```

### --see--

js-chyby-ladeni/vyjimky#finally-uklid-at-to-dopadne-jakkoli

## --card-- free

Jaký je rozdíl mezi očekávanou chybou a chybou programu? Jak s každou z nich naložíš?

### --back--

Očekávanou chybu způsobí okolí: uživatel špatně vyplní políčko, soubor je poškozený, vypadne síť. Aplikace s ní musí počítat — chytí ji a ukáže srozumitelnou hlášku nebo použije náhradní hodnotu. Chyba programu je chyba v kódu: překlep, čtení z `undefined`, špatný typ argumentu. Tu potichu nechytám, má spadnout nahlas, abych ji našel a opravil. V `catch` je proto rozlišuju podle třídy a chyby programu vyhazuju dál.

### --see--

js-chyby-ladeni/vyjimky#chyba-uzivatele-a-chyba-programu

## --card-- free

Proč je nebezpečný `catch`, který chytí všechno a nic neudělá?

### --back--

Schová i chybu programu, se kterou nikdo nepočítal. Program pak pokračuje se špatnými daty — funkce vrátí `undefined` nebo nulu, objednávka projde za `NaN` Kč — a v konzoli po chybě nezůstane stopa. Chyba se ukáže až mnohem později a na úplně jiném místě. Chytat se má jen druh chyby, se kterým umím něco udělat, a zbytek vyhodit znovu; když už chytám všechno (úplně nahoře), chybu aspoň zapíšu přes `console.error`.

### --see--

js-chyby-ladeni/vyjimky#prazdny-catch-spolkne-chybu-programu

## --card-- free

Kdy má funkce při neúspěchu vyhodit výjimku a kdy vrátit výsledkový objekt `{ ok, value, errors }`?

### --back--

Výjimku, když je neúspěch mimořádný a funkce nemůže pokračovat: poškozená data, výpadek, chyba programu, a řešit to má někdo o několik úrovní výš. Výsledkový objekt, když je neúspěch běžná odpověď, se kterou volající hned pracuje — špatně vyplněný formulář, obsazený termín — a hlavně když chci vrátit všechny chyby najednou. Často se to kombinuje: kontroly políček vyhazují chybu a funkce nad nimi ji sbírá do výsledku.

### --see--

js-chyby-ladeni/vlastni-chyby#vyjimka-nebo-navratova-hodnota

## --card-- free

K čemu je `cause` u chyby a jak ho použiješ?

### --back--

Když nízkoúrovňová chyba (třeba `SyntaxError: Unexpected end of JSON input`) neřekne, při čem vznikla, chytím ji a vyhodím novou chybu se zprávou na úrovni aplikace: `new Error('Pozici slot-2 nejde načíst', { cause: error })`. Nová zpráva dává smysl v aplikaci i v logu a původní chyba se neztratí — je v `error.cause` a konzole ji vypíše pod `Caused by:`. U vlastních tříd nesmí konstruktor zahodit `options`, jinak se příčina ztratí.

### --see--

js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause

## --card-- free

Proč psát vlastní třídy chyb, když se dá rozhodovat podle `error.message`?

### --back--

Zpráva je text pro člověka a může se kdykoli změnit: někdo ji přeformuluje nebo přeloží a podmínka `message.includes('e-mail')` přestane platit, aniž by si toho kdo všiml. Třída je stabilní štítek, podle kterého `catch` přes `instanceof` spolehlivě pozná druh chyby. Navíc nese údaje, které chyba potřebuje (jméno políčka, kód produktu). Ve třídě nastavím `name` a přijmu `options` kvůli `cause`.

### --see--

js-chyby-ladeni/vlastni-chyby#vlastni-trida-chyby

## --card-- free

Kde v aplikaci chyby chytat?

### --back--

Tam, kde vím, co s chybou udělat. Nízkoúrovňové funkce (načtení dat, parsování, výpočet) chybu vyhodí nebo obalí přes `cause` a rozhodnutí nechají volajícímu. Nahoře — v obsluze tlačítka, při startu aplikace — chybu chytím a ukážu hlášku nebo použiju náhradu. Úplně nahoře může být jedna záchranná síť, která chytí cokoli, zapíše to do konzole a uživateli ukáže obecnou hlášku. `try…catch` v každé funkci „pro jistotu" schovává chyby.

### --see--

js-chyby-ladeni/vyjimky#kde-chybu-chytat

## --card-- free

Jak postupuješ, když dostaneš hlášení o chybě v kódu, který jsi nepsal?

### --back--

Nejdřív chybu spolehlivě zopakuju: přesný vstup a postup, a vstup zmenším na minimální reprodukci. Pak vyslovím hypotézu, ze které plyne předpověď, a ověřím ji jedním pokusem — měním vždy jen jednu věc. Když hypotézu nemám, půlím kód: zkontroluju mezivýsledek uprostřed (třeba `console.assert`) a vyřadím polovinu, kde je všechno v pořádku. Pomáhají stack trace, breakpoint na výjimce a podmíněný breakpoint. Opravu ověřím na stejné reprodukci a opravím příčinu, ne příznak.

### --see--

js-chyby-ladeni/ladeni-systematicky#nejdriv-chybu-spolehlive-zopakuj

## --card-- free

Jaký je rozdíl mezi podmíněným breakpointem a logpointem? Kdy použiješ který?

### --back--

Oba se přidávají pravým tlačítkem na číslo řádku v panelu Sources a nemění soubor. Podmíněný breakpoint program zastaví, jen když platí podmínka (`order.id === 337`) — hodí se, když chci u jednoho průchodu cyklem vidět všechny proměnné v Scope a krokovat. Logpoint program nezastaví, jen při každém průchodu vypíše zprávu do konzole — hodí se, když chci sledovat, jak se hodnota mění, bez zastavování a bez `console.log` v kódu.

### --see--

js-chyby-ladeni/ladeni-systematicky#podmineny-breakpoint-a-logpoint
