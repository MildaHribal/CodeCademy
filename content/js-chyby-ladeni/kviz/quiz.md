---
pass: 0.8
---

# --questions--

## --question--

Co vypíše tenhle kód?

```js
function readBonus(text) {
  try {
    return JSON.parse(text).bonus;
  } catch {
    return 0;
  } finally {
    console.log('kontrola bonusu');
  }
}

console.log(readBonus('{"bonus":'));
```

### --expected--

kontrola bonusu
0

### --why--

`JSON.parse` na uříznutém textu vyhodí `SyntaxError`, `catch` si připraví výsledek `0`. Než ho funkce vrátí, spustí se `finally` a vypíše svůj text. Teprve potom volající dostane `0` a vypíše ho. Myslíš si, že `finally` běží až po návratu z funkce? Běží ještě uvnitř, před předáním výsledku.

### --see--

js-chyby-ladeni/vyjimky#finally-uklid-at-to-dopadne-jakkoli

## --question--

Co vypíše tenhle kód?

```js
function pickSeat(row) {
  try {
    if (row > 20) throw new RangeError('Sál má jen 20 řad');
    return `řada ${row}`;
  } finally {
    return 'místo vybráno';
  }
}

console.log(pickSeat(25));
```

### --expected--

místo vybráno

### --why--

`throw` vyhodí `RangeError` a funkce nemá `catch`, takže by výjimka měla vyletět ven. Jenže `finally` se spustí i tehdy a jeho `return` výjimku zahodí a nahradí vlastním výsledkem. Rezervace řady 25 v sále s dvaceti řadami tak „projde". Do `finally` patří jen úklid.

### --see--

js-chyby-ladeni/vyjimky#return-ve-finally

## --question--

Co vypíšou volání `console.log`? Každý výpis na nový řádek.

```js
try {
  setTimeout(() => {
    throw new Error('Platba vypršela');
  }, 0);
  console.log('A');
} catch {
  console.log('B');
}
console.log('C');
```

### --expected--

A
C

### --why--

`setTimeout` funkci jen naplánuje a blok `try` doběhne bez chyby: vypíše se `A`, `catch` se přeskočí a vypíše se `C`. Chyba vznikne až později, kdy už žádný `try` neběží, a v konzoli se ukáže jako `Uncaught Error: Platba vypršela` — `console.log('B')` se nespustí nikdy.

### --see--

js-chyby-ladeni/vyjimky#try-nechyti-chybu-ktera-nastane-pozdeji

## --question--

Kolega obalil chybu z platební brány: `throw new Error('Platbu nejde dokončit', { cause: gatewayError })`. Ty tu chybu chytíš do proměnné `error`. Napiš výraz, který vrátí **zprávu původní chyby** z brány.

### --expected--

error.cause.message

### --accept--

error.cause?.message
error?.cause?.message

### --why--

Původní chyba je celý objekt ve vlastnosti `cause`, takže její zprávu najdeš v `error.cause.message`. Samotné `error.message` je nová zpráva `Platbu nejde dokončit`.

### --see--

js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause

## --question--

Funkce `loadAvatar(url)` načítá obrázek profilu a na nedostupné adrese vyhodí chybu. Profil uživatele má místo chybějícího obrázku ukázat iniciály. Kde se má chyba chytit?

### --answer--

Uvnitř `loadAvatar`, která v `catch` vrátí prázdný text.

#### --why--

`loadAvatar` neví, co s chybou udělat: jinde (třeba v nastavení profilu) je potřeba uživateli říct, že nahrání selhalo. Prázdný text navíc vypadá jako platná adresa.

### --correct--

V kódu profilu, který `loadAvatar` volá a v `catch` ukáže iniciály.

#### --why--

Chytá se tam, kde je jasné, co s chybou dělat. Profil ví, že má ukázat iniciály, `loadAvatar` to vědět nemusí.

### --answer--

Nikde, ať stránka spadne a chyba je vidět.

#### --why--

Nedostupný obrázek je očekávaná chyba — stane se každý den. Stránka kvůli ní nemá přestat fungovat.

### --see--

js-chyby-ladeni/vyjimky#kde-chybu-chytat

## --question--

Co vypíše tenhle kód?

```js
class StockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StockError';
  }
}

const original = new RangeError('Počet kusů nesmí být záporný');
const error = new StockError('Sklad nejde aktualizovat', { cause: original });
console.log(error.name, error.cause);
```

### --expected--

StockError undefined

### --why--

Myslíš si, že `cause` projde do chyby samo? Konstruktor `StockError` přijímá jen zprávu a objekt voleb zahodí — `super(message)` ho `Error` nepředá. Původní `RangeError` se tak ztratí. Oprava: `constructor(message, options)` a `super(message, options)`.

### --see--

js-chyby-ladeni/vlastni-chyby#konstruktor-zahodi-cause

## --question--

Rezervační systém kina má funkci `reserveSeat(seat)`. Obsazené místo je běžná situace — o populární místa se lidé přetahují a formulář má hned nabídnout jiné. Jak má funkce dát najevo, že místo je obsazené?

### --answer--

Vyhodit `Error('Místo je obsazené')` a nechat ho vyletět až do obsluhy stránky.

#### --why--

Funguje to, ale obsazené místo není mimořádná událost a volající je hned nad funkcí. Výjimka tu jen komplikuje obyčejné rozhodnutí.

### --correct--

Vrátit výsledek `{ ok: false, reason: 'obsazeno' }`, se kterým formulář hned pracuje.

#### --why--

Neúspěch je běžná odpověď a volající ji zpracuje na místě. Výsledkový objekt ho donutí zkontrolovat `ok` a nic se nevyhazuje ani nechytá.

### --answer--

Vrátit `null` a nechat formulář, ať si domyslí proč.

#### --why--

`null` neřekne, co se stalo: obsazené místo, neexistující sál, nebo chyba v kódu? Formulář by nevěděl, jakou hlášku ukázat.

### --see--

js-chyby-ladeni/vlastni-chyby#vyjimka-nebo-navratova-hodnota

## --question--

Stránka košíku padá s hláškou `TypeError: total.toFixed is not a function`. Hodnota `total` se počítá ze vstupu z formuláře. Která oprava řeší příčinu, ne příznak?

### --answer--

`String(total).toFixed(2)` — převést hodnotu na text, ať `toFixed` vždycky existuje.

#### --why--

`toFixed` je metoda čísel, ne textů, takže tohle spadne stejně. A i kdyby nespadlo, špatný typ hodnoty by v kódu zůstal.

### --answer--

`total?.toFixed?.(2) ?? '0.00'` — když metoda chybí, ukázat nulu.

#### --why--

Hláška zmizí, ale košík ukáže `0.00` místo skutečné ceny. Oprava schová špatnou hodnotu, místo aby zjistila, odkud přišla.

### --correct--

Převést vstup z formuláře na číslo přes `Number` hned na hranici, kde do aplikace vstupuje, a zkontrolovat ho.

#### --why--

`total` je text, protože hodnota z formuláře nebyla převedená. Validace na hranici ji převede a zkontroluje jednou a zbytek kódu už počítá s číslem.

### --see--

js-chyby-ladeni/vlastni-chyby#validace-na-hranici

## --question--

Chceš u každé z 300 objednávek v cyklu vidět v konzoli `id` a cenu, ale do kódu nechceš nic přidávat ani program zastavovat. Který nástroj DevTools použiješ?

### --answer--

Podmíněný breakpoint

#### --why--

Podmíněný breakpoint program zastaví, když podmínka platí. Tady nechceš zastavovat vůbec.

### --correct--

Logpoint

#### --why--

Logpoint vypíše zprávu při každém průchodu řádkem, bez zastavení a bez změny souboru.

### --answer--

Pause on caught exceptions

#### --why--

Tahle volba zastaví program na výjimce. Tady žádná výjimka není, chceš jen vypsat hodnoty.

### --see--

js-chyby-ladeni/ladeni-systematicky#podmineny-breakpoint-a-logpoint

## --question--

Najdi v anglické dokumentaci MDN na stránce objektu `console` metodu, která vypíše, kolikrát byla zavolaná se stejným popiskem (třeba kolikrát se spustilo překreslení košíku). Napiš její celé volání bez argumentů.

### --expected--

console.count()

### --accept--

console.count
count()
count

### --why--

`console.count('render')` při každém zavolání vypíše `render: 1`, `render: 2`… Hodí se, když potřebuješ zjistit, jestli se funkce nevolá častěji, než má. Vynulovat počítadlo umí `console.countReset`.

### --see--

js-chyby-ladeni/ladeni-systematicky#konzole-umi-vic-nez-log

## --question--

Co vypíše tenhle kód?

```js
class Stopwatch {
  seconds = 0;

  tick() {
    this.seconds += 1;
  }
}

const stopwatch = new Stopwatch();
try {
  [1, 2, 3].forEach(stopwatch.tick);
} catch (error) {
  console.log(error.name);
}
console.log(stopwatch.seconds);
```

### --expected--

TypeError
0

### --why--

`forEach` dostal jen funkci `tick` bez objektu, takže `this` uvnitř je `undefined` a `this.seconds` spadne s `TypeError` hned při prvním volání. Stopky se nepohnuly. Oprava: `forEach(() => stopwatch.tick())`.

### --see--

js-tridy-kolekce/tridy#metoda-predana-jako-callback-ztrati-this

## --question--

Jaký druh chyby vyhodí `JSON.parse('')`? Napiš jen jeho jméno.

### --expected--

SyntaxError

### --why--

Prázdný text není platný JSON a `JSON.parse` na neplatném textu vyhazuje `SyntaxError` (`Unexpected end of JSON input`). Je to očekávaná chyba — prázdné úložiště nebo uříznutá odpověď se stane — a chytá se kolem čtení.

### --see--

js-objekty/kopie-a-json#json-parse-bez-osetreni

## --question--

Import objednávek hlásí `TypeError: order.items.map is not a function`. Co je nejpravděpodobnější příčina?

### --answer--

Metoda `map` se v novém JavaScriptu přejmenovala.

#### --why--

`map` na polích existuje. Hláška říká, že hodnota před `.map` žádnou funkci `map` nemá — jakou hodnotu tam asi kód dostal?

### --correct--

`order.items` není pole — přišel třeba objekt, text nebo `null` z dat, se kterými kód nepočítal.

#### --why--

`x is not a function` znamená, že hodnota před voláním funkci nemá. Příčina je v datech, ne v řádku s `map`: zjisti, odkud `items` přišly, a ověř je na hranici.

### --answer--

`order` je `undefined`.

#### --why--

Kdyby `order` bylo `undefined`, hláška by zněla `Cannot read properties of undefined (reading 'items')`. Tady se `items` přečetly, jen v nich není pole.

### --see--

js-zaklady/cteni-chyb-a-debugger#tri-druhy-chyb

## --question--

Po kliknutí na **Vytisknout účtenku** se v konzoli objeví tohle. Kam se podíváš jako první, když hledáš **příčinu**?

```text
Uncaught TypeError: Cannot read properties of null (reading 'toFixed')
    at formatPrice (format.js:4:17)
    at Array.map (<anonymous>)
    at renderReceipt (receipt.js:22:30)
    at HTMLButtonElement.<anonymous> (checkout.js:57:9)
```

### --answer--

Do `formatPrice` na řádek 4 v `format.js` a přidám tam kontrolu, jestli cena není `null`.

#### --why--

Myslíš si, že příčina je tam, kde program spadl? `formatPrice` jen dostala `null` a přečetla z něj `toFixed`. Kontrola by schovala příznak, ale neřekla by, odkud se `null` vzalo.

### --answer--

Do `Array.map`, protože řádek s `<anonymous>` ukazuje, že chyba je ve vestavěné metodě.

#### --why--

`<anonymous>` označuje vestavěnou metodu, ne tvůj kód. `map` jen zavolá funkci pro každou položku — takové řádky při čtení přeskoč.

### --correct--

Do `renderReceipt` na řádek 22 v `receipt.js`, kde se `map` volá nad položkami, a zjistím, odkud v nich je cena `null`.

#### --why--

Stack trace se čte shora: nahoře je místo pádu, pod ním kdo koho volal. Chybná data přišla s polem položek, které `renderReceipt` předala do `map`, takže příčina je o patro níž než pád — nebo ještě dřív, tam, kde položky vznikly.

### --see--

js-chyby-ladeni/ladeni-systematicky#stack-trace-pres-vic-souboru

## --question--

Co vypíše tenhle kód? Napiš dvě hodnoty oddělené mezerou.

```js
const discountInput = '';
const stockInput = null;

console.log(discountInput == 0, stockInput == 0);
```

### --expected--

true false

### --why--

`==` převede prázdný text na číslo `0`, takže `'' == 0` platí — prázdné políčko se tváří jako nula. `null` se ale s nulou přes `==` nerovná. Pravidla volné rovnosti si nikdo nepamatuje, proto `===`.

### --see--

js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna

# --code-- Import přihlášek na plavání

## --file-- enroll.js

```js
// Přihlášky na kurzy plavání — import z tabulky, kterou posílá trenérka.
// Formát řádku: jméno dítěte;kurz;věk
class EnrollmentError extends Error {
  constructor(row, message, options) {
    super(message, options);
    this.name = 'EnrollmentError';
    this.row = row;
  }
}

const COURSES = { delfin: 1890, zralok: 2190, velryba: 2490 };

function parseRow(line, row) {
  const parts = line.split(';');
  if (parts.length !== 3) {
    throw new EnrollmentError(row, 'Řádek ' + row + ' nemá tři sloupce');
  }
  const course = parts[1].trim();
  const price = COURSES[course];
  if (price === undefined) {
    throw new EnrollmentError(row, 'Neznámý kurz ' + course);
  }
  const age = Number(parts[2]);
  if (!Number.isInteger(age) || age < 4) {
    throw new EnrollmentError(row, 'Dítě na řádku ' + row + ' musí mít aspoň 4 roky');
  }
  return { child: parts[0].trim(), course: course, price: price, age: age };
}

function importEnrollments(text) {
  const lines = text.split('\n');
  const enrollments = [];
  const problems = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      enrollments.push(parseRow(lines[i], i + 1));
    } catch (error) {
      if (error instanceof EnrollmentError) {
        problems.push(error);
      } else {
        throw error;
      }
    }
  }
  if (problems.length > 0) {
    throw new AggregateError(problems, 'Import: ' + problems.length + ' chybných řádků');
  }
  return enrollments;
}

function totalPrice(enrollments) {
  let total = 0;
  for (let i = 0; i < enrollments.length; i++) {
    total = total + enrollments[i].price;
  }
  return total;
}

function sendInvoice(enrollment) {
  try {
    if (!enrollment.email.includes('@')) {
      return 'chybí e-mail';
    }
    return 'odesláno';
  } catch (error) {
    return 'odesláno';
  }
}

function importSummary(text) {
  try {
    const enrollments = importEnrollments(text);
    return 'Přihlášek: ' + enrollments.length + ', celkem ' + totalPrice(enrollments) + ' Kč';
  } catch (error) {
    if (error instanceof AggregateError) {
      const messages = [];
      for (let i = 0; i < error.errors.length; i++) {
        messages.push(error.errors[i].message);
      }
      return 'Opravte tabulku: ' + messages.join('; ');
    }
    throw error;
  } finally {
    console.log('import dokončen');
  }
}
```

## --question--

Co vrátí `importSummary('Ema;delfin;6\nOta;zralok;3')`? Napiš text bez uvozovek.

### --expected--

Opravte tabulku: Dítě na řádku 2 musí mít aspoň 4 roky

### --why--

Řádek s Otou projde počtem sloupců i kurzem, ale věk 3 neprojde podmínkou na řádku 24, a `parseRow` vyhodí `EnrollmentError`. `catch` v cyklu (řádek 37) ji uloží do `problems`, cyklus pokračuje a na řádku 46 vznikne `AggregateError`. `importSummary` ho chytí a poskládá zprávy chyb.

### --see--

js-chyby-ladeni/vyjimky#vic-chyb-najednou-aggregateerror

## --question--

Trenérka pošle tabulku, kterou tabulkový editor uloží s novým řádkem na konci: `'Ema;delfin;6\n'`. Co vrátí `importSummary` pro tenhle text? Napiš text bez uvozovek.

### --expected--

Opravte tabulku: Řádek 2 nemá tři sloupce

### --why--

`split('\n')` na řádku 31 vyrobí i prázdný poslední řádek. Ten má po `split(';')` jen jeden sloupec, takže `parseRow` vyhodí chybu z řádku 16. Tabulka je přitom v pořádku — importu chybí přeskočení prázdných řádků.

### --see--

js-chyby-ladeni/ladeni-systematicky#nejdriv-chybu-spolehlive-zopakuj

## --question--

Ve kterém řádku `enroll.js` je `catch`, který spolkne chybu programu a vydá ji za úspěch? Napiš jen číslo řádku.

### --expected--

65

### --accept--

66

### --why--

Když přihláška nemá `email`, řádek 61 čte `includes` z `undefined` a vznikne `TypeError`. `catch` na řádku 65 ho chytí a vrátí `'odesláno'`, takže faktura „odejde", i když se nikomu neposlala. Chybějící e-mail patří do kontroly na řádku 61, `catch` sem vůbec nepatří.

### --see--

js-chyby-ladeni/vyjimky#prazdny-catch-spolkne-chybu-programu

## --question--

Co se stane při volání `importSummary(undefined)`?

### --answer--

Vrátí `'Opravte tabulku: …'` se zprávou o chybějícím textu.

#### --why--

Tuhle zprávu `importSummary` skládá jen z `AggregateError`. Jakou chybu vyhodí `text.split` na `undefined` a projde podmínkou na řádku 75?

### --correct--

Vypíše `import dokončen` a vyhodí `TypeError`, protože `catch` ho na řádku 82 vyhodí znovu.

#### --why--

`text.split` na řádku 31 vyhodí `TypeError` ještě před cyklem. `importSummary` ho chytí, ale není to `AggregateError`, tak ho vyhodí dál. Než výjimka z funkce vyletí, spustí se `finally` s výpisem.

### --answer--

Vrátí `'Přihlášek: 0, celkem 0 Kč'`.

#### --why--

K součtu se běh nedostane: chyba vznikne už při rozdělení textu. Co s ní udělá `catch`?

### --see--

js-chyby-ladeni/vyjimky#kde-chybu-chytat
