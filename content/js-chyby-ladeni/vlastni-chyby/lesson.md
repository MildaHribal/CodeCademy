# Vlastní chyby a návratové hodnoty

:::check pretest
Co vypíše tenhle kód? Tipni si.

```js
class NotFoundError extends Error {}

const error = new NotFoundError('Objednávka 1042 neexistuje');
console.log(`${error}`);
```

### --expected--

Error: Objednávka 1042 neexistuje

### --why--

Třída zdědí po `Error` i vlastnost `name` s hodnotou `'Error'`. Dokud ji ve své třídě nepřepíšeš, chyba se v konzoli i v textu tváří jako obyčejný `Error`. Jak to spravit, ukáže první část.
:::

:::check pretest
Formulář objednávky má tři chybně vyplněná políčka. Co je pro uživatele lepší?

### --answer--

Vyhodit výjimku u prvního špatného políčka a ukázat jednu hlášku.

#### --why--

Uživatel opraví jedno políčko, odešle formulář znovu a dozví se o dalším. Tři odeslání místo jednoho.

### --correct--

Projít všechna políčka a vrátit seznam všech chyb najednou.

#### --why--

Uživatel uvidí všechny problémy naráz. Jak takový výsledek vrátit bez výjimky, ukáže část o návratových hodnotách.
:::

E-shop s kávou přijímá objednávky z formuláře. Při odeslání se může pokazit
spousta věcí: zákazník napíše e-mail bez zavináče, produkt mezitím zmizel
z nabídky, nebo má kód objednávky překlep ve jménu funkce. Všechno to jsou výjimky
a `catch` dostane každou z nich. Jak pozná, co s ní dělat?

Nejhorší řešení je luštit text zprávy:
`if (error.message.includes('e-mail'))`. Stačí, aby někdo zprávu přeformuloval,
a kontrola přestane fungovat. Potřebuješ, aby chyba nesla **druh**, podle kterého
se dá spolehlivě rozhodnout.

> [!REMEMBER]
> **Vlastní třída chyby je štítek: `catch` podle něj pozná, co se stalo, a rozhodne, jestli to umí vyřešit.**

## Vlastní třída chyby

[[vlastní třída chyby|Vlastní třídu chyby]] (*custom error class*) napíšeš jako
potomka `Error`. Konstruktor zavolá `super` se zprávou a volbami (kvůli `cause`),
nastaví `name` a přidá údaje, které se ke chybě hodí — třeba jméno políčka:

:::live js
```js
class ValidationError extends Error {
  constructor(field, message, options) {
    super(message, options);
    this.name = 'ValidationError';
    this.field = field;
  }
}

const error = new ValidationError('email', 'Zadej e-mail ve tvaru jana@example.cz');

console.log(`${error}`);
console.log(error.field);
console.log(error instanceof ValidationError, error instanceof Error);
```
:::

Chyba je pořád `Error` (má `message`, `stack` a jde vyhodit i chytit jako každá
jiná), jen má navíc svůj druh a vlastní údaje. Zkus smazat řádek s `this.name`
a sleduj první výpis.

> [!TIP]
> Místo `this.name = …` v konstruktoru smíš napsat pole třídy
> `name = 'ValidationError';`. Výsledek je stejný.

Co když konstruktor použije `this` dřív, než zavolá `super`?

:::live js predict
```js
class NotFoundError extends Error {
  constructor(sku) {
    this.sku = sku;
    super(`Produkt ${sku} neexistuje`);
  }
}

try {
  new NotFoundError('KEN-250');
} catch (error) {
  console.log(error.name);
}
```
--question-- Co vypíše `console.log(error.name)`?
--expected-- ReferenceError
--why-- V konstruktoru potomka objekt `this` vznikne až voláním `super`. Zápis `this.sku` před ním skončí chybou `ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`. Přesuň `super(…)` na první řádek a sleduj, že chyba zmizí.
:::

:::check
Proč konstruktor `ValidationError` předává `super` i třetí parametr `options`?

### --answer--

Bez něj by chyba neměla `message`.

#### --why--

Zprávu nese první argument `super(message)`. Druhý argument zprávu neovlivňuje.

### --correct--

Aby šlo i vlastní chybě předat `{ cause: původníChyba }`.

#### --why--

`Error` čte `cause` z objektu voleb ve druhém argumentu. Kdyby ho konstruktor zahodil, `new ValidationError('email', '…', { cause })` by příčinu tiše ztratil.

### --answer--

Bez něj by nefungovalo `instanceof`.

#### --why--

`instanceof` zjišťuje, z jaké třídy objekt vznikl. S argumenty konstruktoru nesouvisí.

### --see--

js-chyby-ladeni/vlastni-chyby#vlastni-trida-chyby
:::

## `instanceof` v `catch`: chyť jen to, co umíš vyřešit

S vlastní třídou může `catch` rozhodovat podle druhu chyby. Chyby, které umí
vyřešit, zpracuje. Všechno ostatní vyhodí znovu — to jsou chyby, se kterými tady
nikdo nepočítal, typicky [[chyba programu|chyby programu]].

:::live js
```js
class ValidationError extends Error {
  constructor(field, message, options) {
    super(message, options);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function checkEmail(value) {
  if (!value.includes('@')) {
    throw new ValidationError('email', 'Zadej e-mail ve tvaru jana@example.cz');
  }
  return value;
}

function emailMessage(value) {
  try {
    checkEmail(value);
    return 'e-mail je v pořádku';
  } catch (error) {
    if (error instanceof ValidationError) {
      return `${error.field}: ${error.message}`;
    }
    throw error;
  }
}

console.log(emailMessage('jana@example.cz'));
console.log(emailMessage('jana.example.cz'));

try {
  emailMessage(undefined);
} catch (error) {
  console.log('vyletělo ven:', error.name);
}
```
:::

Třetí volání dostane `undefined` a `value.includes` vyhodí `TypeError` — chybu
programu, ne chybu zákazníka. `emailMessage` ji nechá vyletět a nevydává ji za
špatný e-mail. Zkus řádek `throw error;` smazat a sleduj, co vrátí třetí volání.

:::check
V `catch (error)` umíš vyřešit jen `ValidationError`. Co má `catch` udělat s chybou jiného druhu?

### --expected--

throw error

### --accept--

throw error;
vyhodit ji znovu
vyhodit znovu

### --why--

Chybu, kterou neumíš vyřešit, vyhoď dál přes `throw error`. Kdybys ji ignoroval, schoval bys i chybu programu.

### --see--

js-chyby-ladeni/vlastni-chyby#instanceof-v-catch-chyt-jen-to-co-umis-vyresit
:::

## Společný předek pro chyby aplikace

Když má aplikace víc vlastních chyb, dej jim společného předka. `catch` pak může
chytit jednu konkrétní, nebo všechny chyby aplikace naráz:

```js
class AppError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(field, message, options) {
    super(message, options);
    this.field = field;
  }
}

class NotFoundError extends AppError {}
```

`this.constructor.name` je jméno třídy, ze které objekt vznikl, takže `name` se
nastaví samo i u potomků. `error instanceof AppError` platí pro `ValidationError`
i `NotFoundError`, ale ne pro `TypeError` z překlepu v kódu.

> [!NOTE]
> Nástroje, které aplikaci před nasazením zmenšují (minifikace), umí jména tříd zkrátit na `a` nebo `e`, a pak by `this.constructor.name` vrátilo nesmysl. Knihovny proto `name` často píšou v každé třídě ručně. K sestavení aplikace se dostaneš v sekci o modulech a Vite.

Hierarchii nepřeháněj. Třída se vyplatí jen tehdy, když na ni nějaký `catch`
reaguje jinak než na ostatní. Dvě až čtyři třídy na menší aplikaci stačí.

:::check
Co vypíše poslední řádek, když `ValidationError` a `NotFoundError` dědí z `AppError` jako v ukázce?

```js
const errors = [new NotFoundError('Produkt neexistuje'), new TypeError('x is not a function')];
console.log(errors.map((error) => error instanceof AppError));
```

### --expected--

[true, false]

### --why--

`NotFoundError` dědí z `AppError`, takže `instanceof AppError` platí. `TypeError` je vestavěná chyba a s `AppError` nemá nic společného.

### --see--

js-chyby-ladeni/vlastni-chyby#spolecny-predek-pro-chyby-aplikace
:::

## Výjimka, nebo návratová hodnota

Ne každý neúspěch musí být výjimka. Kontrola formuláře selže běžně: zákazník
se překlepne a to je normální průběh, ne mimořádná událost. Navíc chceš vrátit
**všechny** chyby, ne jen první. Na to se hodí [[výsledkový objekt]] (*result
object*): funkce vrací buď úspěch s hodnotou, nebo neúspěch s chybami.

```js
// úspěch
{ ok: true, value: { email: 'jana@example.cz', quantity: 2 } }
// neúspěch
{ ok: false, errors: { email: 'Zadej e-mail ve tvaru jana@example.cz' } }
```

Volající se podívá na `ok` a rozhodne. Nic se nevyhazuje, nic se nechytá.

:::live js
```js
function validateOrder(input) {
  const errors = {};
  if (!input.email?.includes('@')) errors.email = 'Zadej e-mail ve tvaru jana@example.cz';
  if (!(input.quantity >= 1)) errors.quantity = 'Objednej aspoň 1 kus';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { email: input.email.trim(), quantity: input.quantity } };
}

const result = validateOrder({ email: 'jana.example.cz', quantity: 0 });

if (result.ok) {
  console.log('odesílám', result.value);
} else {
  console.log('oprav:', Object.keys(result.errors).join(', '));
}
```
:::

Zkus opravit e-mail na `jana@example.cz` a množství na `2` a sleduj, kterou větví
program půjde.

Kdy tedy co?

| výjimka | výsledkový objekt |
|---|---|
| neúspěch je mimořádný: poškozená data, výpadek, chyba programu | neúspěch je běžná odpověď: špatně vyplněný formulář, nenalezený slevový kód |
| funkce nemůže pokračovat a volající je o několik úrovní výš | volající je hned nad funkcí a s výsledkem pracuje |
| stačí jedna chyba | chceš vrátit všechny chyby najednou |

Obojí se v praxi kombinuje: uvnitř validace jednotlivá políčka klidně vyhazují
`ValidationError`, funkce nad nimi je pochytá a vrátí výsledkový objekt se všemi.
Přesně tak budeš stavět validaci objednávky ve workshopu.

:::explain
Vysvětli, podle čeho se rozhodneš, jestli má funkce při neúspěchu vyhodit výjimku, nebo vrátit výsledkový objekt.

## --model--

Výjimku vyhodím, když je neúspěch mimořádný a funkce nemůže pokračovat — třeba poškozená data nebo chyba programu — a řešit to má někdo o několik úrovní výš. Výsledkový objekt `{ ok, value, errors }` vrátím, když je neúspěch běžná odpověď, se kterou volající hned pracuje, jako špatně vyplněný formulář. Výsledek navíc unese všechny chyby najednou. Často se to kombinuje: políčka vyhazují chybu a funkce nad nimi ji pochytá do výsledku.

## --checklist--

- Výjimka se hodí pro mimořádný neúspěch, po kterém funkce nemůže pokračovat.
- Výsledkový objekt se hodí pro běžný neúspěch, třeba špatně vyplněný formulář.
- Výsledkový objekt unese všechny chyby najednou.
- Volající musí u výsledkového objektu zkontrolovat `ok`.
- Oba přístupy jde kombinovat.
:::

:::check
Funkce `findCoupon(code)` hledá slevový kód, který zákazník napsal do políčka. Neexistující kód je častý — lidé se překlepnou. Co je lepší?

### --answer--

Vyhodit `NotFoundError` a chytit ho v obsluze formuláře.

#### --why--

Funguje to, ale překlep zákazníka je běžná situace, ne mimořádná událost. Volající je hned nad funkcí a potřebuje jen odpověď.

### --correct--

Vrátit výsledek `{ ok: false, error: 'Tenhle kód neznáme' }` a nechat formulář ukázat hlášku.

#### --why--

Neexistující kód je běžná odpověď, se kterou volající hned pracuje. Výsledkový objekt ho donutí zkontrolovat `ok` a nic se nevyhazuje.

### --answer--

Vrátit `0`, jako by sleva byla nulová.

#### --why--

Zákazník by se nedozvěděl, že kód napsal špatně, a divil by se, proč sleva nefunguje.

### --see--

js-chyby-ladeni/vlastni-chyby#vyjimka-nebo-navratova-hodnota
:::

## Validace na hranici

Data přicházejí do aplikace na několika místech: formulář, JSON ze serveru,
parametry v adrese, soubor od uživatele. Tyhle **hranice** jsou jediná místa, kde
je potřeba data podezírat. [[validace na hranici|Validace na hranici]]
(*validation at the boundary*) znamená: data na vstupu jednou zkontroluj a převeď
do tvaru, se kterým počítá zbytek programu. Uvnitř už jim věř.

```js
// 1. hranice: surová data z formuláře → zkontrolovaná objednávka, nebo chyby
const result = parseOrder(formData);
if (!result.ok) return showErrors(result.errors);

// 2. uvnitř: už žádné kontroly, data mají správný tvar
const total = orderTotal(result.value);
sendConfirmation(result.value.email, total);
```

Funkce `orderTotal` pak nemusí kontrolovat, jestli `quantity` není text `'2'`
nebo `undefined`, protože to udělal `parseOrder`. Kdyby to přesto nastalo, je to
chyba programu a má spadnout nahlas.

> [!NOTE]
> Na hranici se data nejen kontrolují, ale i **převádějí**: text `' 2 '` z políčka
> se změní na číslo `2`, e-mail se ořízne a převede na malá písmena. Zbytek
> programu tak dostane data v jednom tvaru.

:::check
Kde v aplikaci s formulářem objednávky kontrolovat, jestli je `quantity` celé číslo od 1 do 20?

### --answer--

V každé funkci, která s `quantity` pracuje, pro jistotu.

#### --why--

Stejná kontrola na deseti místech se časem rozejde, a když ji někde vynecháš, nikdo si toho nevšimne. Kontrola patří na jedno místo.

### --correct--

Jednou, když data z formuláře vstupují do aplikace, a dál s nimi pracovat jako se zkontrolovanými.

#### --why--

To je validace na hranici: data se na vstupu zkontrolují a převedou, uvnitř se jim věří.

### --answer--

Až těsně před uložením do databáze.

#### --why--

Do té doby by s nezkontrolovanými daty pracoval výpočet ceny i potvrzovací e-mail. Kontrola patří hned na vstup.

### --see--

js-chyby-ladeni/vlastni-chyby#validace-na-hranici
:::

## Typické chyby a pasti

### Chybí `name` ve vlastní třídě

> [!PITFALL]
> **Třída bez vlastního `name` se v konzoli tváří jako obyčejný `Error`.** Příznak:
> v konzoli `Error: Objednávka 1042 neexistuje` a z hlášky nepoznáš, že šlo
> o `NotFoundError`. Oprava: v konstruktoru `this.name = 'NotFoundError'` (nebo
> `this.constructor.name` ve společném předkovi).

### `instanceof` bez `throw error` na konci

:::live js predict
```js
class ValidationError extends Error {}

function readQuantity(input) {
  try {
    if (input.quantity < 1) throw new ValidationError('Objednej aspoň 1 kus');
    return input.quantity;
  } catch (error) {
    if (error instanceof ValidationError) {
      return 1;
    }
  }
}

console.log(readQuantity(null));
```
--question-- Co vypíše tenhle kód?
--expected-- undefined
--why-- `input.quantity` na `null` vyhodí `TypeError`. `catch` ho dostane, podmínka s `instanceof` neplatí a funkce skončí bez `return` — vrátí `undefined`. Chyba programu se ztratila a program jede dál s nesmyslnou hodnotou. Připiš za `if` řádek `throw error;` a sleduj, co se změní.
:::

> [!PITFALL]
> **`catch`, který zkontroluje druh chyby, ale ostatní nevyhodí znovu, spolkne
> chyby programu.** Příznak: funkce vrátí `undefined` a v konzoli není nic. Oprava:
> na konec `catch` vždycky `throw error;`.

### Rozhodování podle textu zprávy

> [!PITFALL]
> **`error.message.includes('e-mail')` přestane fungovat, jakmile někdo zprávu
> přepíše** (třeba přeloží do angličtiny). Příznak: chyba, kterou dřív `catch`
> zpracoval, najednou proletí ven. Oprava: rozhoduj podle třídy (`instanceof`) nebo
> podle údaje, který k tomu třída nese (`error.field`).

### Konstruktor zahodí `cause`

> [!PITFALL]
> **Konstruktor `constructor(message) { super(message); }` zahodí druhý argument.**
> Příznak: `new ValidationError('…', { cause: error }).cause` je `undefined`,
> i když příčinu předáváš. Oprava: přijmi `options` a předej je dál:
> `super(message, options)`.

### Výsledek bez kontroly `ok`

> [!PITFALL]
> **Kdo čte `result.value` bez kontroly `result.ok`, pracuje s `undefined`.**
> Příznak: o kus dál `TypeError: Cannot read properties of undefined (reading 'email')`.
> Oprava: vždycky nejdřív `if (!result.ok) { … }` a teprve pak `result.value`.

:::check
Ve kterém případě `catch (error) { if (error instanceof ValidationError) return null; }` spolkne chybu programu?

### --answer--

Když funkce vyhodí `ValidationError`.

#### --why--

Tu `catch` zpracuje záměrně a vrátí `null`. Ptáme se na chybu, se kterou nikdo nepočítal.

### --correct--

Když v `try` vznikne třeba `TypeError` — funkce pak vrátí `undefined` a chyba zmizí.

#### --why--

Podmínka neplatí a za ní už nic není, takže `catch` doběhne a funkce skončí bez `return`. Chybí `throw error;` na konci.

### --answer--

Nikdy, `instanceof` ostatní chyby propustí samo.

#### --why--

`instanceof` jen odpoví `true` nebo `false`. Chybu dál pošle jedině `throw`.

### --see--

js-chyby-ladeni/vlastni-chyby#instanceof-bez-throw-error-na-konci
:::

Ve workshopu teď postavíš validaci objednávky z e-shopu s kávou: vlastní třídy
chyb, kontrolu každého políčka a výsledek se všemi chybami najednou.

## Kde to najdeš v MDN

- [Error: Custom error types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types) — vlastní třída chyby přes `extends Error`, včetně nastavení `name`.
- [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) — jak `instanceof` prochází řetěz prototypů, a proto funguje i pro společného předka.
- [super](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) — proč se v konstruktoru potomka musí `super` zavolat dřív než `this`.
- [Error() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error) — parametr `options` s vlastností `cause`.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
class AppError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = this.constructor.name;
  }
}
class PaymentError extends AppError {}

const error = new PaymentError('Karta byla zamítnuta');
console.log(error.name, error instanceof AppError);
```

### --expected--

PaymentError true

### --why--

`this.constructor` je třída, ze které objekt vznikl, tedy `PaymentError`, a její `name` je `'PaymentError'`. Protože `PaymentError` dědí z `AppError`, `instanceof AppError` platí.

### --see--

js-chyby-ladeni/vlastni-chyby#spolecny-predek-pro-chyby-aplikace

## --question--

Funkce vrací výsledkový objekt `{ ok, value, errors }`. Napiš podmínku do `if`, která platí, když se validace **nepovedla**. Výsledek je v proměnné `result`.

### --expected--

!result.ok

### --accept--

result.ok === false
result.ok !== true
result.ok == false

### --why--

Výsledkový objekt nese úspěch ve vlastnosti `ok`. Neúspěch se pozná podle `ok: false`, a teprve když `ok` platí, smíš číst `result.value`.

### --see--

js-chyby-ladeni/vlastni-chyby#vysledek-bez-kontroly-ok

## --question--

Kolega rozlišuje chyby takhle: `if (error.message === 'Produkt neexistuje') { … }`. Proč je lepší vlastní třída?

### --answer--

Porovnání textů je pomalé.

#### --why--

Rychlost tu nehraje roli. Problém je v tom, co se stane, když se text zprávy změní.

### --correct--

Zpráva je text pro člověka a může se změnit; třída je stabilní štítek, na který se dá spolehnout.

#### --why--

Stačí zprávu přeformulovat nebo doplnit o kód produktu a podmínka přestane platit. `instanceof NotFoundError` na textu zprávy nezávisí.

### --answer--

`error.message` u vestavěných chyb neexistuje.

#### --why--

Vestavěné chyby `message` mají. Potíž je v tom, že se na text nedá spolehnout.

### --see--

js-chyby-ladeni/vlastni-chyby#rozhodovani-podle-textu-zpravy
