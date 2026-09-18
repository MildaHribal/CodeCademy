# Čas, síť a závislosti

:::check pretest
Funkce `isShopOpen()` uvnitř volá `new Date()` a vrací, jestli má kavárna otevřeno. Test „v neděli je zavřeno" napíšeš v neděli a projde. Co se s ním stane v pondělí ráno?

### --answer--
Projde dál, test přece nic nezměnil.

#### --why--
Myslíš si, že test běží pořád ve stejném prostředí? Funkce se ptá na skutečný čas
počítače a ten se mezi spuštěními mění.

### --correct--
Selže, protože funkce vidí skutečné pondělí.

#### --why--
Výsledek závisí na hodinách počítače, které test neovládá. Takovému testu se říká
nestabilní — jednou projde, jindy ne, a v kódu se přitom nic nezměnilo.

### --answer--
Node test přeskočí, protože datum je jiné.

#### --why--
Myslíš si, že test runner hlídá datum? Node o tom, co funkce uvnitř dělá, nic neví.
Test spustí a ten selže.
:::

Kavárna na webu ukazuje „Právě otevřeno", eshop posílá upomínku tři dny po
nezaplacené objednávce, našeptávač hledá až po 300 ms od posledního stisku klávesy
a přehled cen si načítá kurz eura z API. Všechny tyhle funkce závisí na něčem, co test
neovládá: **na čase a na síti**. Test by musel čekat tři dny, trefit se do otevírací
doby nebo volat skutečné API, které je zrovna pomalé, mění data nebo počítá požadavky.

> [!REMEMBER]
> **Co test neovládá (čas, síť, náhodu, e-mail), nahraď v testu náhradou, kterou ovládá — ale jen na hranici aplikace, ne uvnitř vlastního kódu.** Každá náhrada navíc je místo, kde test může lhát.

## Vložení závislosti: předej ji zvenku

Nejjednodušší náhrada nepotřebuje žádnou knihovnu. Funkce si závislost nevezme
sama (`new Date()`, `fetch`), ale dostane ji parametrem. V aplikaci předáš
skutečnou, v testu tu, kterou ovládáš. Tomu se říká [[vkládání závislostí]]
(*dependency injection*).

:::live js
```js
function isShopOpen(now = new Date()) {
  const day = now.getDay();
  const hour = now.getHours();
  return day !== 0 && hour >= 8 && hour < 18;
}

// v aplikaci: skutečný čas
console.log('teď:', isShopOpen());

// v testu: čas, který si vybereš
const sundayMorning = new Date(2026, 8, 20, 10, 0);
const mondayMorning = new Date(2026, 8, 21, 10, 0);
console.log('neděle 10:00:', isShopOpen(sundayMorning));
console.log('pondělí 10:00:', isShopOpen(mondayMorning));
```
:::

Zkus přidat pondělí v 18:00 a sleduj, jestli funkce správně zavírá přesně v šest.

Výchozí hodnota parametru (`now = new Date()`) znamená, že aplikace nemusí nic
měnit — volá dál `isShopOpen()`. Stejně jde předat funkce na odeslání e-mailu,
`fetch` nebo generátor náhodných čísel.

:::check
Proč je `isShopOpen(now = new Date())` snazší otestovat než funkce, která si `new Date()` zavolá uvnitř?

### --answer--
Protože výchozí parametr běží rychleji.

#### --why--
Myslíš si, že jde o výkon? Rychlost je stejná. Rozdíl je v tom, kdo o čase rozhoduje.

### --correct--
Test jí může předat libovolné datum a výsledek pak nezávisí na tom, kdy test běží.

#### --why--
Závislost přišla zvenku, takže ji test ovládá. Aplikace přitom nic nepředává
a dostane skutečný čas.

### --answer--
Protože `new Date()` uvnitř funkce v testu nefunguje.

#### --why--
Myslíš si, že test čas nevidí? Vidí ho, a právě proto je problém: vidí skutečný,
pořád jiný čas.
:::

## Mock funkce a špeh

Když funkce dostane závislost jako funkci (třeba `sendEmail`), chceš v testu vědět,
**jestli a s čím** ji zavolala. Na to je [[mock funkce]] — náhradní funkce, která si
zapisuje každé volání. `node:test` ji má vestavěnou jako `mock.fn()`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remindUnpaid } from './orders.js';

test('upomínka odejde na e-mail zákazníka', async (t) => {
  const sendEmail = t.mock.fn(async () => ({ delivered: true }));
  const order = { id: 1042, email: 'jana@example.cz', paid: false };

  await remindUnpaid(order, { sendEmail });

  assert.equal(sendEmail.mock.callCount(), 1);
  assert.equal(sendEmail.mock.calls[0].arguments[0].to, 'jana@example.cz');
});
```

- `t.mock.fn(implementace)` vytvoří funkci, která dělá to, co jí dáš, a zapisuje volání.
- `fn.mock.callCount()` je počet volání, `fn.mock.calls[i].arguments` argumenty i-tého volání.
- `t.mock.method(objekt, 'jméno')` je [[špeh]] (*spy*): nahradí metodu existujícího
  objektu a po konci testu ji sám vrátí zpátky.

Ve Vitestu je totéž `vi.fn()`, `vi.spyOn(objekt, 'jméno')` a místo čtení `mock.calls`
aserce `expect(sendEmail).toHaveBeenCalledWith(…)`.

Princip mock funkce je tak jednoduchý, že ho napíšeš za pár řádků:

:::live js predict
```js
function fakeFn() {
  const calls = [];
  const fn = (...args) => { calls.push(args); };
  fn.calls = calls;
  return fn;
}

function notifyAll(customers, send) {
  customers.filter((c) => c.newsletter).forEach((c) => send(c.email));
}

const send = fakeFn();
notifyAll([
  { email: 'petr@example.cz', newsletter: true },
  { email: 'eva@example.cz', newsletter: false },
  { email: 'jan@example.cz', newsletter: true },
], send);
console.log(send.calls.length);
```
--question-- Co vypíše `console.log`?
--expected-- 2
--why-- Náhradní `send` jen zapisuje argumenty každého volání. `notifyAll` ji zavolá pro dva zákazníky s `newsletter: true`, takže pole `calls` má dva záznamy. Přesně tohle dělá `mock.fn()` — test pak čte, kolikrát a s čím byla zavolaná.
:::

:::check
Test ověří `assert.equal(sendEmail.mock.callCount(), 1)` a nic dalšího. Kterou chybu v `remindUnpaid` nechytí?

### --answer--
Upomínka se vůbec neodešle.

#### --why--
Myslíš si, že počet volání tohle nepozná? Bez odeslání je počet 0 a aserce na 1 selže.

### --correct--
Upomínka odejde na špatnou adresu.

#### --why--
Počet volání sedí, i když je argument špatně. Když na adrese záleží, test musí číst
i `mock.calls[0].arguments`.

### --answer--
Upomínka odejde dvakrát.

#### --why--
Myslíš si, že `callCount` hlídá jen „aspoň jednou"? Vrací přesný počet, takže 2 ≠ 1 a test selže.
:::

## Falešné časovače

Našeptávač na e-shopu s kávou hledá až 300 ms po posledním stisku klávesy
(*debounce*). Test by mohl opravdu čekat, ale byl by pomalý a pod zátěží nestabilní.
[[falešné časovače|Falešné časovače]] (*fake timers*) nahradí `setTimeout`
a `Date` verzí, u které čas posouváš ručně:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debounce } from './debounce.js';

test('našeptávač hledá jen jednou, 300 ms po posledním písmenu', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const search = t.mock.fn();
  const onInput = debounce(search, 300);

  onInput('k');
  onInput('ka');
  onInput('kav');
  t.mock.timers.tick(299);
  assert.equal(search.mock.callCount(), 0);

  t.mock.timers.tick(1);
  assert.equal(search.mock.callCount(), 1);
  assert.deepEqual(search.mock.calls[0].arguments, ['kav']);
});
```

`tick(299)` posune falešný čas o 299 ms a spustí všechno, co mělo do té doby
proběhnout. Test trvá jednu milisekundu a nezávisí na vytížení počítače.

Stejně jde zafixovat datum, když funkce `new Date()` volá uvnitř a přepsat ji nemůžeš:

```js
t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 8, 20, 10, 0) });
assert.equal(isShopOpen(), false); // neděle
```

Ve Vitestu: `vi.useFakeTimers()`, `vi.advanceTimersByTime(300)`, `vi.setSystemTime(datum)`
a na konci `vi.useRealTimers()`.

> [!TIP]
> V `node:test` používej `t.mock.timers` (z kontextu testu), ne globální `mock.timers`.
> Kontext po konci testu skutečné časovače vrátí sám.

:::check
Test zapne falešné časovače, zavolá `onInput('kava')` a hned ověří, že `search` byla zavolaná jednou. Proč selže?

### --answer--
Falešné časovače s `debounce` nefungují.

#### --why--
Myslíš si, že `debounce` potřebuje skutečný čas? Používá `setTimeout`, a ten falešné
časovače nahrazují právě kvůli takovým funkcím.

### --correct--
Falešný čas se sám neposouvá, test musí zavolat `tick(300)`.

#### --why--
Falešné časovače zastaví čas. Dokud ho test neposune, nic naplánovaného se nespustí.

### --answer--
Chybí `await` před `onInput`.

#### --why--
Myslíš si, že `debounce` vrací Promise? Vrací obyčejnou funkci. Čekání na čas tu
nahrazuje `tick`, ne `await`.
:::

## Síť: MSW místo nahrazeného fetch

Nabízí se v testu přepsat `globalThis.fetch` vlastní funkcí. Funguje to, ale
test pak ví, **jak** kód volá síť: jestli přes `fetch`, s jakými parametry, kolikrát.
Když kód přepíšeš na jinou knihovnu, test spadne, i když se chování nezměnilo.

[[MSW]] (*Mock Service Worker*) jde na to z druhé strany: nechá kód volat skutečný
`fetch` a požadavek zachytí až na úrovni sítě. Ty jen popíšeš, co má „server"
odpovědět — obsluhu (*handler*) pro každou adresu:

```js
// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.kavarna.cz/menu', () =>
    HttpResponse.json([
      { id: 1, name: 'Espresso', price: 59 },
      { id: 2, name: 'Flat white', price: 89 },
    ]),
  ),
];
```

V testech v Node spustíš falešný server z `msw/node`:

```js
import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { handlers } from './mocks/handlers.js';
import { loadMenu } from './menu.js';

const server = setupServer(...handlers);
before(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
after(() => server.close());

test('menu obsahuje ceny v korunách', async () => {
  const menu = await loadMenu();
  assert.equal(menu[0].label, 'Espresso — 59 Kč');
});

test('při výpadku API vrátí prázdné menu a chybu', async () => {
  server.use(http.get('https://api.kavarna.cz/menu', () => new HttpResponse(null, { status: 500 })));
  const menu = await loadMenu();
  assert.deepEqual(menu, []);
});
```

- `server.use(…)` přebije handler jen pro jeden test (tady výpadek), `resetHandlers`
  ho po testu vrátí.
- `onUnhandledRequest: 'error'` shodí test, který zavolá adresu bez handleru. Bez toho
  by požadavek tiše odešel na skutečný internet.
- Tytéž `handlers` použiješ i v prohlížeči přes `setupWorker` z `msw/browser`: frontend
  pak vyvíjíš proti API, které ještě neexistuje. **Jeden popis API slouží testům
  i vývoji.**

> [!NOTE]
> MSW se instaluje do projektu (`npm install -D msw`), v editoru Akademie ho nespustíš.
> Vyzkoušíš ho v projektu Rozpočtovač na konci sekce nebo ve vlastním projektu.

:::check
Proč je zachycení požadavku přes MSW odolnější vůči refaktoringu než přepsání `globalThis.fetch`?

### --answer--
MSW je rychlejší než náhradní `fetch`.

#### --why--
Myslíš si, že jde o rychlost? Oba přístupy běží lokálně a bez sítě. Rozdíl je v tom,
na co test spoléhá.

### --correct--
Test nespoléhá na to, jak kód síť volá — jen na to, co „server" odpoví.

#### --why--
Handler popisuje adresu a odpověď. Kód smí volat `fetch` jakkoli nebo přes jinou
knihovnu a test projde, dokud chování zůstane stejné.

### --answer--
MSW posílá požadavky na skutečné API, takže ví, jestli funguje.

#### --why--
Myslíš si, že MSW volá internet? Naopak, požadavek zachytí dřív, než odejde. Proto
je dobré mít `onUnhandledRequest: 'error'`.
:::

## Kdy mock škodí

Mock je náhrada skutečnosti a každá náhrada může lhát. Nejčastěji takhle:

:::live js predict
```js
async function loadRates(fetchFn) {
  const response = await fetchFn('/api/kurzy');
  const data = await response.json();
  return data.eur;
}

// test s mockem, který vrací vždy úspěch
const alwaysOk = async () => ({ ok: true, json: async () => ({ eur: 24.3 }) });
loadRates(alwaysOk).then((eur) => console.log(eur === 24.3 ? 'test prošel' : 'test selhal'));
```
--question-- Kolega tvrdí, že `loadRates` je otestovaná. Co test vypíše a co tím o výpadku API opravdu víš?
--option-- Vypíše „test selhal", protože `loadRates` nekontroluje `response.ok`.
--option*-- Vypíše „test prošel", ale o chování při chybě API nevíš nic — mock chybu nikdy nevrátí.
--option-- Vypíše „test prošel", takže `loadRates` zvládne i výpadek API.
--why-- Mock vrací vždy `ok: true`, takže test prověřuje jen šťastnou cestu. Kdyby server vrátil 500 s HTML stránkou, `response.json()` by spadl a funkce by to neřešila — a test o tom mlčí. Mock, který umí jen úspěch, otestuje jen úspěch; na chybu potřebuješ druhý test s mockem, který vrátí `ok: false`.
:::

Zkus do ukázky přidat druhý mock, který vrátí `ok: false` a `json`, která vyhodí
chybu, a sleduj, co se stane.

Znaky, že mock škodí:

- **Mockuješ vlastní kód.** Náhrada vlastní čisté funkce (`calculateTotal`) test
  odstřihne od kódu, který měl hlídat. Mockuj jen hranice: síť, čas, náhodu, e-mail,
  platební bránu.
- **Mock kopíruje implementaci.** Když mock vrací to, co by kód „asi" spočítal,
  testuješ mock.
- **Ověřuješ volání místo výsledku.** `callCount` na vnitřní pomocné funkci je
  [[křehký test]] v jiném kabátě.
- **Mock se rozešel se skutečností.** API přejmenovalo `eur` na `EUR`, mock ne. Testy
  jsou zelené a produkce rozbitá. Pomůže jeden sdílený popis API (handlery MSW)
  a kontrola tvaru dat na hranici, třeba schématem v Zodu ze sekce
  [TypeScript](see:nastroje-typescript/validace-na-hranici).

:::explain
Vysvětli, proč test s mockem, který vrací vždy úspěch, nedává jistotu, že aplikace zvládne výpadek API.

## --model--
Mock určuje, co funkce dostane. Když vrací jen úspěšnou odpověď, kód při testu nikdy
nejde chybovou cestou, takže chyba v ní zůstane neodhalená. Test tím ověřuje jen
šťastný případ. Na výpadek potřebuju samostatný test, ve kterém mock vrátí chybu,
a ověřit, co s ní kód udělá.

## --checklist--
- Mock rozhoduje, jakou odpověď kód v testu dostane.
- Mock s vždy úspěšnou odpovědí nikdy nespustí chybovou větev.
- Chybová cesta potřebuje vlastní test s mockem, který vrátí chybu.
:::

## Testing Library: testuj jako uživatel

Stejná myšlenka jako „testuj chování, ne implementaci" platí i pro komponenty
a stránky. [[Testing Library]] je rodina knihoven (pro DOM, React, Vue), jejíž
pravidlo zní: **čím víc se test podobá tomu, jak aplikaci používá člověk, tím
víc jistoty dává.** Proto hledá prvky tak, jak je najde uživatel a čtečka obrazovky:

| dotaz | najde | proč právě tak |
|---|---|---|
| `getByRole('button', { name: 'Objednat' })` | tlačítko s přístupným názvem | tak ho vidí čtečka obrazovky i uživatel |
| `getByLabelText('E-mail')` | pole formuláře podle popisku | bez `<label>` test selže — a má |
| `getByText('Košík je prázdný')` | text na stránce | uživatel čte text, ne třídy |
| `getByTestId('cart')` | prvek s `data-testid` | nouzovka, když nic z výše nejde |

Test, který hledá `.btn-primary` nebo čte vnitřní stav komponenty, se rozbije při
každé změně vzhledu. Test, který hledá tlačítko „Objednat", se rozbije, jen když
tlačítko opravdu zmizí nebo se přejmenuje. Stejné lokátory podle role potkáš
v lekci o Playwrightu a v Reactu je použiješ s `@testing-library/react`.

:::check
Tlačítko s ikonou košíku nemá žádný text. Test `getByRole('button', { name: 'Přidat do košíku' })` ho nenajde. Co je správná oprava?

### --answer--
Přepsat test na `container.querySelector('.cart-button')`.

#### --why--
Myslíš si, že chyba je v testu? Test právě odhalil, že tlačítko nemá přístupný název
a čtečka obrazovky ho přečte jen jako „tlačítko".

### --correct--
Dát tlačítku přístupný název, třeba `aria-label="Přidat do košíku"`.

#### --why--
Oprava pomůže uživatelům čteček i testu. Dotaz podle role tak hlídá i přístupnost.

### --answer--
Přidat tlačítku `data-testid` a hledat podle něj.

#### --why--
Myslíš si, že `data-testid` je rovnocenná náhrada? Test by prošel, ale tlačítko by
zůstalo pro čtečku obrazovky bez názvu. `data-testid` je až poslední možnost.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Globální falešné časovače bez vrácení.** `mock.timers.enable()` bez
> `mock.timers.reset()` zůstane zapnuté i pro další testy v souboru. Příznak: další
> test, který čeká na `setTimeout`, nikdy neskončí a `node --test` visí — falešný čas
> se bez `tick` neposune. Oprava: `t.mock.timers` z kontextu testu, nebo `reset()`
> v `afterEach`.

> [!PITFALL]
> **Přepsaný `globalThis.fetch` bez vrácení.** Test přiřadí vlastní `fetch` a další
> testy v souboru dostanou jeho odpovědi. Příznak: test projde samotný, v sadě selže
> se starými daty. Oprava: `t.mock.method(globalThis, 'fetch', …)`, které původní
> funkci po testu vrátí, nebo rovnou MSW.

> [!PITFALL]
> **Mock bez chybové cesty.** Všechny testy mají mock s `ok: true`. Příznak: sada je
> zelená, a v produkci při výpadku API bílá stránka a v konzoli
> `SyntaxError: Unexpected token '<'`. Oprava: ke každému mocku sítě aspoň jeden test,
> kde vrátí chybu.

> [!PITFALL]
> **Požadavek bez handleru tiše odejde ven.** MSW ve výchozím nastavení jen varuje.
> Příznak: testy jsou pomalé a občas selžou podle stavu skutečného API. Oprava:
> `server.listen({ onUnhandledRequest: 'error' })`.

:::check
Test v sadě selhává, samotný prochází, a v jiném testu souboru je `globalThis.fetch = async () => …`. Co je nejpravděpodobnější příčina?

### --expected-- ignore-case
náhradní fetch se po testu nevrátil

### --accept--
fetch se nevrátil
nevrácený fetch
přepsaný fetch zůstal
přepsaný globalThis.fetch zůstal
fetch zůstal přepsaný
globalThis.fetch se nevrátil

### --why--
Přiřazení do `globalThis.fetch` platí pro celý proces, dokud ho někdo nevrátí. Testy
za ním dostanou náhradní odpovědi. `t.mock.method(globalThis, 'fetch', …)` původní
funkci po testu vrátí samo.
:::

## Kde to najdeš v MDN

Mockování popisují dokumentace nástrojů, ne MDN. V angličtině:

- [Node.js: Mocking](https://nodejs.org/api/test.html#mocking) — `mock.fn`, `mock.method`
  a `mock.timers` s příklady.
- [MSW: Quick start](https://mswjs.io/docs/quick-start) — handlery, `setupServer`
  a `setupWorker`.
- [Testing Library: Guiding Principles](https://testing-library.com/docs/guiding-principles)
  a [Which query should I use?](https://testing-library.com/docs/queries/about#priority) —
  proč hledat podle role.
- [MDN: `setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) —
  co přesně falešné časovače nahrazují.

V další lekci pustíš celou aplikaci ve skutečném prohlížeči: [End-to-end v Playwrightu](see:nastroje-testovani/playwright).

# --questions--

## --question--

Funkce `createOrder(cart, { now })` ukládá do objednávky čas vytvoření. Jak v testu ověříš, že se uloží přesně ten čas, který jsi předal? Napiš, co předáš jako `now`.

### --expected-- ignore-case
pevné datum

### --accept--
konkrétní datum
new Date(2026, 0, 1)
pevně dané datum
vlastní datum
datum, které si vyberu

### --why--
Díky vloženému `now` rozhoduje o čase test. Předáš pevné datum (třeba
`new Date(2026, 0, 1, 12, 0)`) a porovnáš ho s uloženou hodnotou. Se skutečným
`new Date()` bys nevěděl, jaký čas čekat.

### --see--
nastroje-testovani/mocky-cas-sit#vlozeni-zavislosti-predej-ji-zvenku

## --question--

Kolega mockuje v testu košíku vlastní funkci `calculateVat`, aby „test košíku nezávisel na DPH". Co tím ztratí?

### --answer--
Nic, test košíku je teď rychlejší a přesnější.

#### --why--
Myslíš si, že izolace od vlastního kódu je vždy výhoda? `calculateVat` je čistá funkce
bez sítě a času, nic nestabilního do testu nepřináší.

### --correct--
Test přestane hlídat, jestli košík s DPH opravdu počítá správně.

#### --why--
Mock vrací, co mu kolega napsal, takže chyba v napojení košíku na DPH projde. Mockovat
se vyplatí hranice aplikace, ne vlastní čisté funkce.

### --answer--
Test bude nestabilní, protože mock běží asynchronně.

#### --why--
Myslíš si, že mock přidává čekání? `mock.fn` je obyčejná synchronní funkce, pokud jí
nedáš async implementaci.

### --see--
nastroje-testovani/mocky-cas-sit#kdy-mock-skodi

## --question--

Test zapne falešné časovače a chce ověřit, že upomínka odejde přesně po 3 dnech. O kolik milisekund posune čas, aby upomínka právě odešla? Napiš číslo.

### --expected--
259200000

### --accept--
259 200 000
3 * 24 * 60 * 60 * 1000

### --why--
3 dny × 24 h × 60 min × 60 s × 1 000 ms = 259 200 000 ms. Dobrý test navíc posune
čas nejdřív o 1 ms méně a ověří, že upomínka ještě neodešla.

### --see--
nastroje-testovani/mocky-cas-sit#falesne-casovace
