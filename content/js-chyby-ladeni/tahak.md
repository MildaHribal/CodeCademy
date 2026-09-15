> [!REMEMBER]
> **Chybu vyhoď tam, kde vznikla, a chyť ji tam, kde víš, co s ní udělat.** Chybu uživatele ukaž u políčka, [[chyba programu|chybu programu]] nech vyletět a úplně nahoře ji zapiš do konzole.

## Výjimky

| zápis | co dělá |
|---|---|
| `throw new RangeError('Úroveň musí být 1–50, ne 77')` | vyhodí chybu; zbytek funkce se přeskočí |
| `try { … } catch (error) { … }` | chytí výjimku z bloku i ze všeho, co blok zavolá |
| `catch { … }` | chytí výjimku, když objekt chyby nepotřebuješ |
| `finally { … }` | spustí se vždycky, i po `return` a po výjimce — jen úklid |
| `new Error('Zpráva', { cause: error })` | obalí původní chybu, najdeš ji v `error.cause` |
| `new AggregateError(errors, 'Zpráva')` | víc chyb najednou, najdeš je v `error.errors` |
| `error.name`, `error.message`, `error.stack` | druh, zpráva a stack trace chyby |

| druh | kdy ho vyhodit |
|---|---|
| `TypeError` | hodnota má špatný typ (čekáš text, přišlo `undefined`) |
| `RangeError` | typ sedí, hodnota je mimo rozsah |
| `Error` nebo vlastní třída | chyba aplikace, na kterou má `catch` reagovat zvlášť |

## Vzory

```js
// vlastní třída chyby
class ValidationError extends Error {
  constructor(field, message, options) {
    super(message, options);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// chytit jen to, co umíš vyřešit
try {
  return JSON.parse(text);
} catch (error) {
  if (error instanceof SyntaxError) return null;
  throw error;
}

// obalit chybu, aby šla dohledat
try {
  return loadSlot(slotId);
} catch (error) {
  throw new Error(`Pozici ${slotId} nejde načíst`, { cause: error });
}

// úklid v každém případě
loader.busy = true;
try {
  return loadSlot(slotId);
} finally {
  loader.busy = false;
}

// chyby políček sbírat do výsledkového objektu
const fieldErrors = {};
const email = checkField(fieldErrors, () => validateEmail(data.email));
if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
return { ok: true, value: { email } };

// záchranná síť úplně nahoře
try {
  return submitOrder(data);
} catch (error) {
  console.error(error);
  return { ok: false, fieldErrors: { form: 'Objednávku se nepodařilo odeslat.' } };
}
```

## Výjimka, nebo výsledkový objekt

| [[výjimka]] | [[výsledkový objekt]] `{ ok, value, errors }` |
|---|---|
| neúspěch je mimořádný: poškozená data, výpadek, chyba programu | neúspěch je běžná odpověď: špatně vyplněný formulář, obsazený termín |
| řeší to někdo o několik úrovní výš | volající je hned nad funkcí |
| stačí jedna chyba | chceš všechny chyby najednou |

## Ladění systematicky

1. **Zopakuj** chybu: přesný vstup a postup, zmenši ho na [[minimální reprodukce|minimální reprodukci]]. Zkoušej hodnoty na hranicích pravidel.
2. **Hypotéza:** jedna věta o příčině, ze které plyne předpověď. Jedna změna na jeden pokus.
3. **[[bisekce|Bisekce]]:** zkontroluj mezivýsledek uprostřed a vyřaď polovinu, kde je všechno v pořádku.
4. **Oprav příčinu**, ne příznak, a ověř opravu na stejné reprodukci.

| nástroj | kdy |
|---|---|
| stack trace | čti shora, přeskoč `<anonymous>` a knihovny, příčina bývá o patro níž |
| **Pause on caught exceptions** | chyba se nikde nehlásí, někdo ji spolkl |
| [[podmíněný breakpoint]] | zastavit jen u jednoho průchodu cyklem (`order.id === 337`) |
| [[logpoint]] | vypisovat hodnoty bez zastavení a bez `console.log` v kódu |
| `console.table(items)` | projít pole objektů očima |
| `console.group` / `console.groupEnd` | seskupit výpisy jednoho průchodu |
| `console.trace()` | zjistit, odkud se funkce volala |
| `console.assert(podmínka, zpráva)` | hlídat mezivýsledek, program nezastaví |
| [[gumová kachna]] | vysvětlit kód nahlas řádek po řádku |

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| nesmyslný výsledek (`0`, `undefined`) a konzole mlčí | prázdný `catch` nebo `catch` bez `throw error` na konci | chytej jen známý druh, zbytek vyhoď znovu |
| funkce vrací pořád totéž, výjimka zmizí | `return` ve `finally` | do `finally` jen úklid |
| `Chyba: undefined` místo zprávy | `throw 'text'` místo `throw new Error('text')` | vždycky objekt chyby |
| `ReferenceError: save is not defined` za blokem | `const` uvnitř `try` platí jen v bloku | `let save;` před blokem |
| `Uncaught` chyba i přes `try` | chyba vznikla později (`setTimeout`) | `try…catch` dovnitř té funkce |
| vlastní chyba se v konzoli tváří jako `Error` | chybí `this.name` | nastav `name` ve třídě |
| `new MyError('…', { cause }).cause` je `undefined` | konstruktor nepředal `options` do `super` | `super(message, options)` |
| `ReferenceError: Must call super constructor…` | `this` před `super` | `super(…)` jako první |
| hláška zmizela, výsledek je tiše špatně | oprava příznaku (`?? 0`, `?.`, `isNaN ? 0`) | najdi, kde špatná hodnota vznikla |
| rozbalený objekt v konzoli ukazuje pozdější hodnoty | konzole načte vnitřek až při rozbalení | `console.log(structuredClone(obj))` |
