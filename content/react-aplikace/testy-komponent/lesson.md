# Testy komponent

Testy jednotlivých funkcí už umíš. Komponenta je jiná: nemá návratovou hodnotu,
kterou bys porovnal, ale obrazovku, se kterou někdo pracuje. Dobrý test komponenty
proto nekontroluje, co komponenta **je**, ale co s ní jde **udělat**.

:::check pretest
Test najde tlačítko zápisem `container.querySelector('.btn-primary')`. Designér
přejmenuje třídu na `.button--primary`. Co se stane?

### --answer--

Test projde, třída na chování nemá vliv.

#### --why--

Test ale nekouká na chování — kouká na tu třídu. Bez ní nenajde nic.

### --correct--

Test spadne, i když aplikace funguje dál úplně stejně.

#### --why--

Přesně tak. Takovému testu se říká křehký: hlásí poplach na změny, které
uživatel nepozná. Celá lekce je o tom, jak psát testy, které to nedělají.

### --answer--

Test spadne a je to správně, protože se změnilo rozhraní.

#### --why--

Rozhraní se nezměnilo: tlačítko je pořád na stejném místě, dělá totéž a čte se
stejně. Změnil se jen zápis stylu.
:::

:::check pretest
Kolik testů podle tebe potřebuje komponenta, která jen vykreslí `props.title` do
`<h2>`? Napiš číslo.

### --expected--

0

### --accept--

žádný
nula

### --why--

Nic, co by se mohlo pokazit jinak než překlepem, který uvidíš na první pohled.
Testy se píšou na chování s podmínkami, stavem a daty — ne na dosazení props do
šablony.
:::

## Problém: test, který kontroluje kód místo chování

Vezmi si komponentu, která umí jednu drobnost: skryje dlouhý text a rozbalí ho
na kliknutí.

:::live react
```jsx
import { useState } from 'react';
import './styles.css';

export default function Note() {
  const [open, setOpen] = useState(false);

  return (
    <section className="note">
      <h2>Storno podmínky</h2>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Skrýt podrobnosti' : 'Zobrazit podrobnosti'}
      </button>
      {open && (
        <p>
          Rezervaci můžeš zrušit zdarma do 24 hodin před začátkem půjčovného.
          Později ti účtujeme jeden den.
        </p>
      )}
    </section>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f5f4f1; color: #1f2933; }
.note { max-width: 440px; margin: 24px auto; background: #fff; border: 1px solid #e4e1db; border-radius: 12px; padding: 18px; }
.note h2 { margin: 0 0 10px; font-size: 1.1rem; }
.note button { border: 1px solid #0f766e; background: none; color: #0f766e; border-radius: 999px; padding: 6px 14px; font: inherit; cursor: pointer; }
.note button:focus-visible { outline: 2px solid #0f766e; outline-offset: 2px; }
.note p { margin: 12px 0 0; color: #5b6570; }
```
:::

Zkus přejmenovat třídu `note` na cokoli jiného — z pohledu uživatele se nestane
vůbec nic. Přesně tak se má chovat i test.

Špatný test si vezme za cíl vnitřnosti:

```jsx
const { container } = render(<Note />);
expect(container.querySelector('.note p')).toBeNull();
container.querySelector('.note button').click();
```

Dobrý test popisuje totéž slovy, kterými by to popsal uživatel:

```jsx
render(<Note />);
expect(screen.queryByText(/zrušit zdarma/i)).not.toBeInTheDocument();
await user.click(screen.getByRole('button', { name: 'Zobrazit podrobnosti' }));
expect(screen.getByText(/zrušit zdarma/i)).toBeInTheDocument();
```

> [!REMEMBER]
> **Test komponenty hledá to, co vidí a slyší uživatel.** Když k nalezení prvku
> potřebuješ třídu nebo strukturu DOM, testuješ implementaci, ne chování.

:::check
Podle čeho poznáš, že je test křehký, ještě než ho spustíš?

### --expected--

Hledá prvky podle tříd nebo struktury

### --accept--

Sahá na implementaci, ne na to, co uživatel vidí.
Když se dá rozbít změnou, které si uživatel nevšimne.

### --why--

Zkouška: *změní se výsledek testu, i když uživatel žádný rozdíl nepozná?* Když
ano, test měří něco jiného, než chceš.

### --see--

react-aplikace/testy-komponent#problem-test-ktery-kontroluje-kod-misto-chovani
:::

## Nastavení: Vitest a jsdom

Testy běží ve Vitestu, který znáš z testů funkcí. Přibudou dvě věci: prostředí,
které umí DOM, a knihovna, která umí vykreslit komponentu.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',          // v Node samotném žádný document není
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';   // matchery toBeInTheDocument, toBeDisabled…
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);                          // po každém testu ukliď vykreslený DOM
```

`jsdom` je implementace DOM v JavaScriptu. Není to prohlížeč: neumí rozvržení,
takže `getBoundingClientRect()` vrací samé nuly a na `getComputedStyle` se u
rozměrů nespoléhej. Pro „co je na obrazovce napsané a co jde zmáčknout" je ale
naprosto dostatečný — a je o dva řády rychlejší než skutečný prohlížeč.

> [!TIP]
> `cleanup` po každém testu je důležitější, než vypadá. Bez něj zůstane
> v dokumentu i to, co vykreslil předchozí test, a `getByRole('button')` najednou
> najde dvě tlačítka a spadne na „Found multiple elements".

:::check
Proč se v konfiguraci testů nastavuje `environment: 'jsdom'`?

### --expected--

Protože v Node není DOM

### --accept--

Node sám o sobě nemá document ani window.
Aby měl test kam komponentu vykreslit.

### --why--

Vitest běží v Node. Bez prostředí s DOM by `render()` neměl do čeho vykreslovat
a padalo by to na `document is not defined`.

### --see--

react-aplikace/testy-komponent#nastaveni-vitest-a-jsdom
:::

## Dotazy podle role a textu

Testing Library nabízí víc způsobů, jak prvek najít, a dává jim **pořadí podle
toho, jak blízko jsou uživateli**. Drž se shora dolů:

| dotaz | najde | kdy |
|---|---|---|
| `getByRole('button', { name: 'Uložit' })` | prvek podle role a přístupného jména | skoro vždycky |
| `getByLabelText('E-mail')` | pole podle jeho `<label>` | formuláře |
| `getByText(/zrušit zdarma/i)` | prvek podle viditelného textu | odstavce, hlášky |
| `getByPlaceholderText`, `getByTitle` | podle nápovědného textu | nouzově |
| `getByTestId('row-3')` | podle `data-testid` | poslední možnost |

[[dotaz podle role|Dotaz podle role]] je nahoře ze dvou důvodů. Zaprvé odpovídá
tomu, jak prvek vnímá uživatel („tlačítko, na kterém je napsáno Uložit"). Zadruhé
**testuje přístupnost mimochodem**: když `getByRole('button', { name: 'Uložit' })`
nic nenajde, čtečka obrazovky na tom je stejně. Ikonka bez popisku, `<div>` místo
`<button>` a chybějící `<label>` se takhle provalí samy.

```jsx
// role vychází z prvku: button, link, heading, textbox, checkbox, list, listitem…
screen.getByRole('heading', { name: 'Storno podmínky', level: 2 });
screen.getByRole('link', { name: 'Zpět na seznam' });
screen.getByRole('textbox', { name: 'Jméno a příjmení' });
screen.getByRole('button', { name: /uložit/i });          // regex zvládne i změnu velikosti písmen
```

Tři varianty, které se pletou:

- **`getBy…`** — musí najít právě jeden prvek, jinak test hned spadne.
- **`queryBy…`** — když nenajde, vrátí `null`. Používá se **jen** na ověření, že
  něco na stránce **není**.
- **`findBy…`** — vrací Promise a chvíli počká. O tom je vlastní část níž.

> [!PITFALL]
> **`expect(screen.getByText('Hotovo')).not.toBeInTheDocument()`** nikdy neprojde
> tak, jak si autor myslel: `getByText` vyhodí výjimku dřív, než se vůbec dostane
> k `expect`. Chyba pak zní *Unable to find an element with the text: Hotovo*,
> což vypadá jako chyba komponenty. Na nepřítomnost patří `queryByText`.

:::check
Komponenta vykreslí `<div onClick={…}>Smazat</div>`. Test hledá
`getByRole('button', { name: 'Smazat' })` a nenajde nic. Kde je chyba?

### --expected--

V komponentě, div není tlačítko

### --accept--

Má tam být <button>, ne <div>.
Chyba je v komponentě — div nemá roli button.

### --why--

Test tady není křehký, ale přísný ve správné věci: co nenajde jako tlačítko, to
nenajde ani čtečka obrazovky a nepůjde to zmáčknout klávesnicí.

### --see--

react-aplikace/testy-komponent#dotazy-podle-role-a-textu
:::

## Akce uživatele: userEvent

Kliknutí jde vyvolat dvěma způsoby a ten pohodlnější je horší.

```jsx
fireEvent.click(button);        // vyšle jednu událost click
await user.click(button);       // pohyb myši, pointerdown, mousedown, focus, pointerup, mouseup, click
```

`userEvent` napodobuje **celou sekvenci**, kterou vyvolá skutečný člověk. To je
rozdíl u všeho, co se opírá o fokus nebo o pořadí událostí: tlačítko, které se
zablokuje v `onPointerDown`, pole, které validuje v `onBlur`, nebo menu, které
se zavírá na `pointerdown` mimo sebe.

```jsx
import userEvent from '@testing-library/user-event';

test('po odeslání se objeví potvrzení', async () => {
  const user = userEvent.setup();               // vždy před render()
  render(<ReservationForm />);

  await user.type(screen.getByLabelText('Jméno a příjmení'), 'Eva Novotná');
  await user.selectOptions(screen.getByLabelText('Termín'), 'kveten');
  await user.click(screen.getByRole('checkbox', { name: /storno podmínkami/i }));
  await user.click(screen.getByRole('button', { name: 'Rezervovat' }));

  expect(await screen.findByRole('status')).toHaveTextContent(/rezervace přijata/i);
});
```

Každá akce `userEvent` je **asynchronní** — mezi jednotlivými událostmi nechává
Reactu prostor překreslit. Zapomenuté `await` je nejčastější důvod, proč test
„náhodně" padá.

> [!TIP]
> `user.type` píše znak po znaku, takže testuje i našeptávač nebo počítadlo znaků.
> Když potřebuješ jen vyplnit hodnotu a obsah psaní tě nezajímá, `user.clear`
> a potom `user.type` je stále správná dvojice; `fireEvent.change` přeskočí
> všechno mezi tím.

:::check
Proč se před `userEvent` akcemi píše `await`, když `fireEvent` ho nepotřebuje?

### --expected--

Protože každá akce je asynchronní

### --accept--

userEvent vyšle víc událostí a mezi nimi nechá React překreslit.
Vrací Promise, bez await test pokračuje dřív, než se akce dokončí.

### --why--

`fireEvent` vyšle jednu událost a končí. `userEvent` napodobuje celou sekvenci
a čeká mezi jejími kroky, takže bez `await` test přečte DOM uprostřed akce.

### --see--

react-aplikace/testy-komponent#akce-uzivatele-userevent
:::

## Když data přijdou později: findBy

Komponenta, která si data načítá, je při prvním vykreslení prázdná. Test, který
se na ni podívá hned, uvidí stav načítání — a `getBy…` v ten okamžik selže.

:::live js predict
```js
const cell = { text: 'Načítám' };

Promise.resolve(['Svíčková', 'Rajská']).then((recipes) => {
  cell.text = recipes.join(', ');
});

console.log(cell.text);
```
--question-- Co vypíše `console.log`?
--expected-- Načítám
--accept--
Nacitam
--why-- Přiřazení uvnitř `then` se provede až po doběhnutí synchronního kódu, takže `console.log` čte ještě starou hodnotu. Stejně dopadne test, který zavolá `render()` a hned `getByText('Svíčková')`: v tu chvíli je v DOM pořád „Načítám".
:::

Řešení není čekat pevnou dobu, ale **čekat na výsledek**:

```jsx
test('vypíše recepty z API', async () => {
  render(<RecipeList />);

  expect(screen.getByText('Načítám…')).toBeInTheDocument();          // stav načítání
  expect(await screen.findByRole('listitem', { name: /svíčková/i })).toBeInTheDocument();
  expect(screen.queryByText('Načítám…')).not.toBeInTheDocument();    // a zase zmizel
});
```

`findBy…` se ptá opakovaně, dokud prvek nenajde, nejdéle jednu sekundu. Když se
nedočká, vypíše celý DOM, takže hned vidíš, co tam místo toho je.

> [!PITFALL]
> **`await waitFor(() => {})` s prázdným tělem** nebo `await new Promise((r) => setTimeout(r, 500))`
> jsou dvě podoby téhož omylu: čekat na čas místo na výsledek. Na rychlém stroji
> projdou, na pomalém padají a nikdo neví proč. Na čekání je `findBy…`, případně
> `waitFor` s konkrétní podmínkou uvnitř.

:::check
Kdy v testu použiješ `findByText` a kdy `getByText`?

### --expected--

findBy na data, která přijdou později

### --accept--

getBy na to, co je v DOM hned, findBy na to, co se objeví až po načtení.
findBy čeká, getBy ne.

### --why--

`getBy…` se podívá jednou. Cokoli, co se objeví až po odpovědi serveru nebo po
akci s `await`, potřebuje `findBy…`.

### --see--

react-aplikace/testy-komponent#kdyz-data-prijdou-pozdeji-findby
:::

## Náhrada sítě místo skutečného API

Test nesmí chodit na internet: byl by pomalý, občas by spadl kvůli cizímu serveru
a na cizích datech by kontroloval nesmysly. Potřebuje [[náhrada sítě|náhradu sítě]].

Nejrozšířenější nástroj je **MSW** (*Mock Service Worker*). Jeho trik je v tom, že
se nevměšuje do tvého kódu: odchytává odchozí požadavky až na úrovni sítě, takže
komponenta volá `fetch('/api/recepty')` úplně stejně jako v produkci.

```ts
// src/test/server.ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  http.get('/api/recepty', () =>
    HttpResponse.json([
      { id: 1, name: 'Svíčková', minutes: 150 },
      { id: 2, name: 'Rajská', minutes: 60 },
    ]),
  ),
);
```

```ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

`onUnhandledRequest: 'error'` je to nejcennější nastavení: požadavek, na který
nemáš připravenou odpověď, test rovnou shodí. Bez něj by aplikace tiše volala
skutečnou síť a ty by ses to dozvěděl až v CI.

Jednotlivý test si pak přepíše jen to, co potřebuje:

```ts
test('ukáže hlášku, když server selže', async () => {
  server.use(http.get('/api/recepty', () => new HttpResponse(null, { status: 500 })));
  render(<RecipeList />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/nepodařilo/i);
});
```

Lehčí varianta bez knihovny je podstrčit vlastní `fetch`:

```ts
vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(recipes))));
```

Funguje, ale testuje o kousek míň: obchází skutečné `fetch` i jeho zpracování
odpovědi. Na jednu komponentu to stačí, na celou aplikaci sáhni po MSW.

> [!NOTE]
> Stejné handlery se dají použít i ve vývoji, když backend ještě není hotový.
> Proto se v projektech často píšou jednou do `src/mocks/` a sdílejí mezi testy
> a dev serverem.

:::check
Proč je lepší odchytit požadavek na úrovni sítě než nahradit funkci, která data
načítá?

### --expected--

Protože se testuje i volání fetch

### --accept--

Komponenta pak volá fetch stejně jako v produkci.
Nahrazená funkce by obešla kód, který data načítá a zpracovává.

### --why--

Když nahradíš `loadRecipes`, netestuješ ani sestavení adresy, ani zpracování
odpovědi, ani reakci na `500`. S náhradou sítě zůstane v testu celá cesta kromě
serveru samotného.

### --see--

react-aplikace/testy-komponent#nahrada-site-misto-skutecneho-api
:::

## Co testovat a co ne

Testů komponent chceš mít **málo a dobrých**. Vodítko:

| stojí za test | nestojí za test |
|---|---|
| podmínka ve vykreslení (prázdný seznam, chyba, načítání) | dosazení props do šablony |
| akce uživatele a její následek | to, že se `useState` zavolal |
| hraniční data (0 položek, dlouhý text, chybějící obrázek) | konkrétní třídy a rozvržení |
| chyba, kterou ti někdo nahlásil | vzhled (od toho je oko a snímky) |
| přístupné jméno akcí, které jinak nejdou najít | knihovna třetí strany |

A hlavně: **test komponenty není náhrada za test celé cesty**. Že jde objednat
kolo od seznamu přes formulář až po potvrzení, ověříš v prohlížeči nástrojem jako
Playwright — jsdom neumí skutečné rozvržení, navigaci mezi stránkami ani cookies.
Rozdělení, které se v praxi drží:

- **hodně** testů čistých funkcí (výpočty, formátování, validace),
- **středně** testů komponent s podmínkami a akcemi,
- **pár** testů celé cesty v prohlížeči.

> [!PITFALL]
> **Test, který jen zopakuje kód komponenty**, nikdy nic nechytí:
> `expect(screen.getByText(recipe.name)).toBeInTheDocument()` projde, i kdyby bylo
> jméno prázdné. Test má obsahovat **konkrétní očekávanou hodnotu** (`'Svíčková'`),
> ne tutéž proměnnou, ze které komponenta čerpá.

:::check
Proč se test celé objednávky od seznamu po potvrzení nepíše ve Vitestu s jsdom?

### --expected--

Protože jsdom není prohlížeč

### --accept--

Neumí skutečné rozvržení, navigaci ani cookies.
Celou cestu je potřeba ověřit v prohlížeči, například Playwrightem.

### --why--

jsdom umí DOM, ne prohlížeč. Na cestu přes víc stránek, s adresou, cookies
a skutečným vykreslením patří nástroj, který spustí opravdový prohlížeč.

### --see--

react-aplikace/testy-komponent#co-testovat-a-co-ne
:::

:::explain
Vysvětli, proč `getByRole('button', { name: 'Uložit' })` odhalí chyby
v přístupnosti, i když na přístupnost vůbec necílíš.

## --model--

Dotaz podle role nehledá prvek v DOM podle značky ani podle třídy, ale podle
toho, čím prvek **je** ve stromu přístupnosti, a podle jména, které mu z obsahu
a atributů vznikne. Ten strom je přesně to, z čeho čte čtečka obrazovky. Když
je místo tlačítka `<div>` s `onClick` nebo když má tlačítko jen ikonu bez
popisku, prvek buď žádnou roli nemá, nebo nemá jméno — a dotaz ho nenajde.
Test tak spadne ze stejného důvodu, ze kterého by si uživatel čtečky nevěděl
rady.

## --checklist--

- Dotaz podle role čte ze stromu přístupnosti, ne z DOM značek.
- Stejný strom používá čtečka obrazovky.
- Prvek bez role nebo bez přístupného jména dotaz nenajde.
- Selhání testu tak ukazuje na skutečnou vadu rozhraní.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Chybějící `await` u `userEvent`.** Test pokračuje dřív, než React překreslí.
> Příznak: hláška *Unable to find an element with the role "status"*, a když test
> spustíš znovu, občas projde. Oprava: `await` u každé akce a `const user = userEvent.setup()`
> před `render`.

> [!PITFALL]
> **Varování `An update to X inside a test was not wrapped in act(…)`.** Skoro
> vždycky to znamená, že se stav změnil až po skončení testu — odpověď dorazila
> pozdě. Oprava: počkat na následek přes `findBy…` místo toho, aby test skončil
> dřív než komponenta.

> [!PITFALL]
> **`getBy` na něco, co má chybět.** `getByText` při nenalezení vyhodí výjimku,
> takže se k `expect(...).not.toBeInTheDocument()` nikdy nedostaneš. Oprava:
> `queryBy…`, které vrátí `null`.

> [!PITFALL]
> **Sdílený stav mezi testy.** Když v modulu držíš `let cache = …` nebo klienta
> dotazů vytvořeného na úrovni souboru, druhý test dostane data prvního. Příznak:
> test projde samostatně a spadne v celé sadě (nebo naopak). Oprava: čerstvý
> `new QueryClient()` v každém testu a `afterEach(cleanup)`.

> [!PITFALL]
> **Testování přes `data-testid` všude.** Funguje to a nikdy to nespadne — ale
> taky to nikdy nic neodhalí. `data-testid` má smysl tam, kde prvek nemá žádné
> viditelné jméno (řádek tabulky, obal grafu), ne jako výchozí způsob hledání.

:::check
Test občas projde a občas spadne na tom, že nenajde hlášku po odeslání formuláře.
Co je nejpravděpodobnější příčina?

### --expected--

Chybí await u akce nebo u findBy

### --accept--

Test nečeká na dokončení akce.
Použil getBy místo findBy a hláška ještě není v DOM.

### --why--

Náhodné padání je skoro vždycky závod: test čte DOM dřív, než se komponenta
překreslí. Na čas se nečeká, čeká se na výsledek.

### --see--

react-aplikace/testy-komponent#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

Testing Library a Vitest mají vlastní dokumentaci; MDN vysvětlí to, o co se
opírají — role a přístupná jména.

- [ARIA roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles) —
  seznam rolí, které `getByRole` zná, a které prvky je mají samy od sebe.
- [Accessible name](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name) —
  z čeho vzniká jméno, na které se v testu ptáš.
- [Using the aria-label attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) —
  jak pojmenovat tlačítko, které má jen ikonu.
- [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) —
  co všechno vrací `fetch` a co musí umět i tvoje náhrada sítě.

# --questions--

## --question--

Komponenta ukazuje počet volných kol a po kliknutí na „Rezervovat" ho sníží.
Který test je nejméně křehký?

### --answer--

```jsx
expect(container.querySelector('.count').textContent).toBe('3');
```

#### --why--

Stojí na třídě `.count`. Změna stylopisu ho rozbije, i když aplikace funguje
dál stejně.

### --correct--

```jsx
expect(screen.getByText('Volná kola: 3')).toBeInTheDocument();
```

#### --why--

Hledá přesně to, co uživatel čte. Rozbije se jen tehdy, když se změní i to, co
vidí uživatel.

### --answer--

```jsx
expect(wrapper.state.count).toBe(3);
```

#### --why--

Vnitřní stav komponenty není její rozhraní. Test by prošel i tehdy, kdyby se
číslo vůbec nevykreslilo.

## --question--

Test po `render()` hledá `screen.getByText('Svíčková')` a hlásí *Unable to find
an element with the text*. Komponenta přitom v prohlížeči recepty ukazuje
správně. Čím `getByText` nahradíš?

### --expected--

findByText

### --accept--

await screen.findByText('Svíčková')
screen.findByText

### --why--

Data přijdou až po odpovědi serveru. `getBy…` se podívá jednou, `findBy…` počká,
dokud se prvek neobjeví.

### --see--

react-aplikace/testy-komponent#kdyz-data-prijdou-pozdeji-findby

## --question--

Napiš, co se v testu stane, když u `server.listen()` nastavíš
`onUnhandledRequest: 'error'` a komponenta zavolá adresu, na kterou handler není.

### --expected--

Test spadne

### --accept--

Test selže s chybou o neobsloužené adrese.
Požadavek shodí test, místo aby šel na skutečnou síť.

### --why--

Je to pojistka proti tichému volání skutečného serveru. Bez ní by test na
neznámé adrese mlčky čekal, selhal jinde, nebo dokonce prošel s cizími daty.

### --see--

react-aplikace/testy-komponent#nahrada-site-misto-skutecneho-api

## --question--

Kolegyně navrhuje otestovat tímhle způsobem každou komponentu v aplikaci. Co je
na tom hlavní problém?

### --answer--

Testy komponent jsou pomalé, aplikace by se netestovala v CI.

#### --why--

V jsdom jsou testy komponent rychlé, o dva řády rychlejší než prohlížeč. Problém
je jinde než v čase.

### --correct--

Většina komponent nemá co rozbít a testy by hlídaly hlavně zápis.

#### --why--

Test dává smysl tam, kde je podmínka, stav, data nebo nahlášená chyba.
U komponenty, která jen dosadí props do šablony, hlídá jen to, že jsi ji přepsal.

### --answer--

Testing Library neumí komponenty s vnořenými komponentami.

#### --why--

Umí, a dokonce je na to postavená: vykresluje celý strom a hledá v něm tak, jak
by hledal uživatel.
