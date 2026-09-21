Co si pamatovat z testování: kterou aserci vybrat, kam který test patří, osm vzorů,
které napíšeš pořád dokola, a pasti, kvůli kterým testy lžou.

## Kterou aserci (`node:assert/strict`)

| aserce | kdy ji použiješ |
|---|---|
| `assert.equal(a, b, 'zpráva')` | čísla, texty, `true`/`false` — porovnává přes `===` |
| `assert.deepEqual(a, b, 'zpráva')` | objekty a pole — porovná obsah, ne odkaz |
| `assert.ok(hodnota, 'zpráva')` | stačí, že je hodnota pravdivá |
| `assert.match(text, /vzor/, 'zpráva')` | text obsahuje vzor |
| `assert.throws(() => f(x), TypChyby, 'zpráva')` | **synchronní** kód má vyhodit chybu |
| `await assert.rejects(f(x), { message: /vzor/ }, 'zpráva')` | **async** kód má skončit odmítnutou Promise |

Zpráva aserce pojmenuje chování i vstup: `'shippingFee(1500) má vrátit 0'`. Ve výpisu
selhání pak hned víš, o který případ šlo.

## Na jaké úrovni to testovat

| úroveň | co zapojí | co jí svěříš |
|---|---|---|
| [[statická analýza]] | nic, kód se nespouští | typy, překlepy, nepoužitý kód |
| unit | jednu funkci nebo modul | výpočty, formátování, okrajové případy |
| integrační | víc částí: API s databází, komponentu s daty | propojení částí, formát dat mezi nimi |
| end-to-end | celou aplikaci v prohlížeči | že se to poskládá, načte a proklikne |

Pravidlo: **testuj na nejnižší úrovni, na které se daná chyba ještě dá zachytit.**

## Kostra testu a tři kroky

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addToCart } from './cart.js';

test('přidání stejného zboží zvýší počet kusů', () => {
  const cart = [{ sku: 'KAVA-250', qty: 1 }];            // arrange: připrav
  const updated = addToCart(cart, 'KAVA-250');           // act: jedno volání
  assert.deepEqual(updated, [{ sku: 'KAVA-250', qty: 2 }], 'druhý kus má zvýšit qty na 2');
});
```

## Očekávaná chyba synchronně i asynchronně

```js
assert.throws(() => parseTime('25:99'), RangeError, "parseTime('25:99') má vyhodit RangeError");
await assert.rejects(loadOrder(999), { message: /nenalezena/ }, 'neexistující objednávka se nemá načíst');
```

## Vlož závislost výchozím parametrem

```js
function isShopOpen(now = new Date()) {     // aplikace volá isShopOpen()
  return now.getDay() !== 0 && now.getHours() >= 8 && now.getHours() < 18;
}
assert.equal(isShopOpen(new Date(2026, 8, 20, 10, 0)), false, 'v neděli v 10:00 je zavřeno');
```

## Zjisti, kolikrát a s čím se závislost zavolala

```js
test('upomínka odejde na e-mail zákazníka', async (t) => {
  const sendEmail = t.mock.fn(async () => ({ delivered: true }));
  await remindUnpaid({ id: 1042, email: 'jana@example.cz', paid: false }, { sendEmail });
  assert.equal(sendEmail.mock.callCount(), 1, 'upomínka má odejít právě jednou');
  assert.equal(sendEmail.mock.calls[0].arguments[0].to, 'jana@example.cz', 'má odejít na adresu zákazníka');
});
```

## Posuň čas místo čekání

```js
t.mock.timers.enable({ apis: ['setTimeout'] });
onInput('kav');
t.mock.timers.tick(299);
assert.equal(search.mock.callCount(), 0, '299 ms po stisku se ještě nehledá');
t.mock.timers.tick(1);
assert.equal(search.mock.callCount(), 1, '300 ms po posledním stisku se hledá jednou');
// pevné datum: t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 8, 20) })
```

## Popiš odpověď API handlerem MSW

```js
const server = setupServer(http.get('https://api.kavarna.cz/menu', () => HttpResponse.json([{ id: 1, name: 'Espresso', price: 59 }])));

before(() => server.listen({ onUnhandledRequest: 'error' }));   // požadavek bez handleru = chyba
afterEach(() => server.resetHandlers());
after(() => server.close());

// výpadek jen pro jeden test:
server.use(http.get('https://api.kavarna.cz/menu', () => new HttpResponse(null, { status: 500 })));
```

## Klikni jako zákazník a počkej na výsledek

```js
await page.goto('/kosik');
await page.getByRole('listitem').filter({ hasText: 'Flat white' })
  .getByRole('button', { name: 'Přidat', exact: true }).click();
await expect(page.getByRole('status')).toHaveText('V košíku: 1 položka');
```

## Zamkni dnešní chování, než začneš přepisovat

```js
test('upomínka pro Janu vypadá dnes takhle', () => {
  const dnesni = vypisUpominky([{ jmeno: 'Jana Nováková', dnu: 12, druh: 'kniha' }]);
  assert.equal(dnesni, 'Jana Nováková: 60 Kč', 'text upomínky se refaktoringem nemá změnit');
});
```

Zamkni i okraje (0 dnů, den na hranici sazby, strop) a pak refaktoruj po malých krocích:
jedna změna, spustit testy, zelená. Zčervenalý test je rozhodnutí — buď chyba v kódu,
nebo záměrná změna chování, která patří do popisu pull requestu.

## Lokátory: hledej to, co vidí uživatel

| Playwright | Testing Library | najde |
|---|---|---|
| `page.getByRole('button', { name: 'Objednat' })` | `getByRole('button', { name: 'Objednat' })` | prvek podle role a přístupného názvu |
| `page.getByLabel('E-mail')` | `getByLabelText('E-mail')` | pole formuláře podle `<label>` |
| `page.getByText('Košík je prázdný')` | `getByText('Košík je prázdný')` | text na stránce |
| `page.getByTestId('cart-total')` | `getByTestId('cart-total')` | nouzovka, když nic z výše nejde |

Jméno v `getByRole` je [[přístupné jméno|přístupný název]] prvku: text tlačítka,
`aria-label` nebo popisek pole. Hledá se jako podřetězec bez ohledu na velikost písmen; přesnou shodu vynutí
`{ exact: true }`. Zúžit lokátor na rodiče jde přes `filter({ hasText: … })`, pořadím
(`nth(1)`) ne — rozbije se při každé změně řazení.

## Pasti

- **Test bez aserce** projde vždycky. Každý test rozbij, než mu začneš věřit.
- **Chybějící `await`** u `assert.rejects` a u `expect(locator)` — test doběhne dřív
  než kontrola a zelená nic neznamená.
- **Očekávaná hodnota spočítaná stejně jako v kódu** (`assert.equal(withVat(100), 100 * 1.21)`)
  porovnává chybu se stejnou chybou. Napiš hotové číslo.
- **Pevná mezera:** `toLocaleString('cs-CZ')` odděluje tisíce znakem ` `.
- **Sdílená data mezi testy** — projdou jen v jednom pořadí. Každý test si data
  připraví sám, i v e2e (přes API, ne klikáním).
- **Přepsaný `globalThis.fetch` bez vrácení** ovlivní další testy v souboru; použij
  `t.mock.method(globalThis, 'fetch', …)` nebo MSW.
- **Mock, který umí jen úspěch,** otestuje jen úspěch. Ke každému mocku sítě aspoň
  jeden test s chybou.
- **`waitForTimeout`** test zpomalí a nestabilitu neodstraní. Čekej na stav:
  `toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveURL`.
- **`strict mode violation`** znamená, že lokátor sedí na víc prvků, ne že prvek chybí.
- **Test, který zčervená po refaktoringu bez změny chování,** hlídá implementaci.
  Přepiš ho na výsledek.
