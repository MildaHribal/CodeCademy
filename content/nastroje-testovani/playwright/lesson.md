# End-to-end v Playwrightu

:::check pretest
Na stránce košíku se tlačítko „Zaplatit" objeví až po načtení košíku z API, zhruba za sekundu. E2e test otevře stránku a hned na tlačítko klikne. Co myslíš, že se stane?

### --answer--
Test spadne, protože tlačítko v tu chvíli ještě neexistuje.

#### --why--
Tak by to dopadlo, kdyby nástroj klikal naslepo. Uvidíš, že Playwright před akcí
sám čeká na prvek.

### --correct--
Playwright počká, až tlačítko bude vidět a půjde na něj kliknout, a pak klikne.

#### --why--
Každá akce v Playwrightu nejdřív počká, až je prvek připravený. Proto do testu
nepatří ruční čekání.

### --answer--
Klikne na místo, kde tlačítko bude, a nic se nestane.

#### --why--
Myslíš si, že Playwright kliká na souřadnice? Kliká na nalezený prvek, a dokud ho
nenajde, neklikne nikam.
:::

Všechny unit testy košíku jsou zelené, a přesto po nasazení nejde objednávka
odeslat: skript se na produkci nenačte, tlačítko je překryté cookie lištou nebo
formulář posílá data na starou adresu API. Tyhle chyby vzniknou až tam, kde se
všechno skládá dohromady. Uvidí je jen test, který otevře **skutečný prohlížeč**,
klikne jako zákazník a přečte, co se stalo. To je [[end-to-end test]] a Playwright
je dnes nejpoužívanější nástroj, kterým se píše.

> [!REMEMBER]
> **E2e test ovládá aplikaci jako člověk: prvek najde podle toho, co vidí (role, popisek, text), a čeká na stav stránky, nikdy na pevný čas.**

## První test

Playwright se do projektu přidá příkazem `npm init playwright@latest`. Průvodce
založí `playwright.config.ts`, složku `tests/` a stáhne prohlížeče. Test vypadá
takhle:

```ts
// tests/kosik.spec.ts
import { test, expect } from '@playwright/test';

test('zákazník přidá espresso do košíku', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Přidat Espresso do košíku' }).click();
  await expect(page.getByRole('status')).toHaveText('V košíku: 1 položka');
});
```

- `page` je nová karta prohlížeče. Každý test dostane vlastní, čistou.
- `page.goto('/')` otevře adresu vůči `baseURL` z konfigurace.
- Každá akce i aserce vrací Promise, proto **před každou stojí `await`**.

Aby test měl proti čemu běžet, konfigurace umí spustit vývojový server sama:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
});
```

Testy pustíš `npx playwright test`. S `--ui` se otevře okno, kde test sleduješ krok
po kroku, `--headed` ukáže skutečný prohlížeč.

:::check
Proč v testu stojí `await` i před `expect(…).toHaveText(…)`?

### --answer--
Protože `expect` je v Playwrightu pomalejší než v `node:test`.

#### --why--
Myslíš si, že jde o rychlost? `await` neurychluje ani nezpomaluje, jen počká na výsledek.

### --correct--
Aserce vrací Promise: opakuje kontrolu, dokud text nesedí nebo nevyprší čas, a bez `await` by na výsledek nikdo nepočkal.

#### --why--
Bez `await` test doběhne dřív, než aserce skončí, a neúspěch se ztratí nebo se
ohlásí jinde. Stejnou past znáš z `assert.rejects`.

### --answer--
Kvůli TypeScriptu, jinak soubor nepůjde přeložit.

#### --why--
Myslíš si, že `await` chce kompilátor? Kód bez něj se přeloží i spustí — jen
nebude čekat.
:::

## Lokátory podle role a popisku

[[lokátor|Lokátor]] (*locator*) je popis, jak prvek najít. Playwright doporučuje stejné
pořadí jako Testing Library — od toho, co vnímá uživatel:

| lokátor | kdy |
|---|---|
| `page.getByRole('button', { name: 'Objednat' })` | tlačítka, odkazy, nadpisy, zaškrtávátka — skoro vždy první volba |
| `page.getByLabel('E-mail')` | pole formuláře podle `<label>` |
| `page.getByText('Košík je prázdný')` | text, který není ovládací prvek |
| `page.getByPlaceholder('Hledat kávu')` | jen když pole nemá popisek (a to je samo chyba) |
| `page.getByTestId('cart-total')` | nouzovka, když nic z předchozího nejde |

Lokátor `page.locator('.btn.btn-primary')` funguje taky, ale rozbije se při každé
změně tříd a nic neřekne o tom, jestli tlačítko uživatel pozná.

Jméno v `getByRole` je **přístupný název** prvku: text tlačítka, `aria-label` nebo
popisek pole. Ve výchozím nastavení Playwright hledá **podřetězec bez ohledu na velikost
písmen**. Na tom se často zakopne:

:::live dom predict
```html
<ul class="menu">
  <li>Espresso — 59 Kč <button>Přidat</button></li>
  <li>Flat white — 89 Kč <button>Přidat do košíku</button></li>
  <li>Cold brew — 79 Kč <button aria-label="Přidat cold brew">+</button></li>
</ul>
```
```css
.menu { font-family: system-ui, sans-serif; list-style: none; padding: 0; display: grid; gap: 0.5rem; max-width: 22rem; }
.menu li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: #f6efe6; }
.menu button { background: #6b3e26; color: #fff; border: 0; border-radius: 999px; padding: 0.3rem 0.8rem; }
```
--question-- Test zavolá `page.getByRole('button', { name: 'Přidat' }).click()`. Co se stane?
--option-- Klikne na první tlačítko, u espressa.
--option-- Klikne jen na tlačítko s textem přesně „Přidat".
--option*-- Selže s hláškou `strict mode violation`, protože lokátor najde tři tlačítka.
--why-- Jméno se porovnává jako podřetězec bez ohledu na velikost písmen, takže sedí „Přidat", „Přidat do košíku" i `aria-label` „Přidat cold brew". Akce jako `click` vyžadují právě jeden prvek (*strict mode*), jinak test spadne. Oprava: `{ name: 'Přidat', exact: true }`, nebo nejdřív zúžit na položku přes `page.getByRole('listitem').filter({ hasText: 'Espresso' })`.
:::

Zkus třetímu tlačítku smazat `aria-label` a zamysli se, jaký název by pak mělo:
jen „+", se kterým si uživatel čtečky obrazovky nic nepočne.

:::check
Jak najdeš tlačítko „Přidat" jen u Flat white, když stejné tlačítko je u každé položky menu?

### --answer--
`page.getByRole('button', { name: 'Přidat' }).nth(1)`

#### --why--
Myslíš si, že pořadí je spolehlivé? Stačí přidat do menu novou kávu nebo změnit řazení
a test klikne jinam, aniž by selhal.

### --correct--
`page.getByRole('listitem').filter({ hasText: 'Flat white' }).getByRole('button', { name: 'Přidat' })`

#### --why--
Najdeš položku podle toho, co na ní uživatel čte, a v ní tlačítko. Pořadí v menu
na tom nic nezmění.

### --answer--
`page.locator('li:nth-child(2) button')`

#### --why--
Myslíš si, že CSS selektor je přesnější? Závisí na pořadí i na struktuře HTML, takže
se rozbije při každé úpravě menu.
:::

## Automatické čekání a aserce, které počkají

Playwright před každou akcí (`click`, `fill`, `check`) sám počká, až je prvek
připojený, viditelný, stojí na místě a přijímá události. Stejně tak aserce nad
lokátorem (`toBeVisible`, `toHaveText`, `toHaveCount`) kontrolu **opakují**, dokud
neprojde nebo nevyprší limit (výchozí 5 s).

Porovnej dva zápisy téže kontroly:

```ts
// A: čeká, dokud se text nezmění
await expect(page.getByRole('status')).toHaveText('V košíku: 1 položka');

// B: přečte text jednou, hned teď
expect(await page.getByRole('status').textContent()).toBe('V košíku: 1 položka');
```

Když košík přepočítává server, B přečte starý text „V košíku: 0 položek" a selže —
ale jen někdy, podle toho, jak rychle server zrovna odpoví. Takovému testu se říká
[[nestabilní test]] (*flaky test*). A čeká, takže projde vždy, když aplikace funguje.

:::check
Která aserce počká, až se na stránce objeví hláška „Objednávka odeslána"?

### --answer--
`expect(await page.getByText('Objednávka odeslána').isVisible()).toBe(true)`

#### --why--
Myslíš si, že `isVisible()` čeká? Vrátí stav v tu chvíli. Když hláška přijde o chvíli
později, test selže.

### --correct--
`await expect(page.getByText('Objednávka odeslána')).toBeVisible()`

#### --why--
Aserce nad lokátorem se opakuje až do limitu, takže počká na odpověď serveru.

### --answer--
`await page.waitForTimeout(2000)` a pak cokoli

#### --why--
Myslíš si, že pevná pauza stačí? Na pomalém CI nemusí, a na rychlém počítači zbytečně
zdržuje. Čekat se má na stav, ne na čas.
:::

## Proč ne `waitForTimeout`

`page.waitForTimeout(2000)` vypadá jako rychlá oprava nestabilního testu. Ve
skutečnosti je to dvojí prohra:

- **Test je pomalejší.** Dvě sekundy v každém testu, stokrát za sebou, jsou tři
  minuty čekání navíc.
- **Test je pořád nestabilní.** Na vytíženém serveru CI přijde odpověď za 2,1 s
  a test spadne stejně.

Místo pauzy čekej na to, co má nastat: na prvek (`toBeVisible`), text (`toHaveText`),
adresu (`await expect(page).toHaveURL(/\/objednavka\/\d+/)`) nebo odpověď API
(`page.waitForResponse('**/api/orders')`). Dokumentace Playwrightu `waitForTimeout`
výslovně nedoporučuje mimo ladění.

:::check
Test občas spadne, protože po kliknutí na „Hledat" ještě nejsou výsledky. Kolega přidal `await page.waitForTimeout(3000)`. Čím pauzu nahradíš?

### --answer--
`await page.waitForTimeout(6000)`, ať je rezerva.

#### --why--
Myslíš si, že stačí delší pauza? Test bude ještě pomalejší a na dost pomalém serveru
spadne stejně.

### --answer--
`const count = await page.getByRole('listitem').count()` a pak `expect(count).toBe(3)`.

#### --why--
Myslíš si, že `count()` počká? Spočítá prvky v tu chvíli. Když výsledky ještě nejsou,
vrátí 0.

### --correct--
`await expect(page.getByRole('listitem')).toHaveCount(3)`

#### --why--
Aserce nad lokátorem se opakuje, dokud počet nesedí nebo nevyprší limit. Počká přesně
tak dlouho, jak je potřeba.
:::

## Izolace dat

Každý test v Playwrightu dostane vlastní **kontext prohlížeče**: čisté cookies,
`localStorage` i přihlášení. Testy tak běží paralelně a v libovolném pořadí.
Izolaci ale snadno rozbiješ daty na serveru:

- Test „smaže objednávku" počítá s objednávkou, kterou vytvořil test „vytvoří
  objednávku". Samotný, nebo v jiném pořadí, selže.
- Dva testy běží zároveň a oba přejmenují stejného uživatele.

Pravidlo je stejné jako u unit testů: **každý test si data připraví sám.** V e2e
testech se to dělá rychle přes API, ne klikáním v UI:

```ts
test('zákazník zruší nezaplacenou objednávku', async ({ page, request }) => {
  const response = await request.post('/api/test/orders', { data: { items: ['espresso'] } });
  const { id } = await response.json();

  await page.goto(`/objednavky/${id}`);
  await page.getByRole('button', { name: 'Zrušit objednávku' }).click();
  await expect(page.getByRole('status')).toHaveText('Objednávka zrušena');
});
```

Přihlášení, které potřebuje většina testů, se v Playwrightu udělá jednou
v přípravném projektu a uloží do souboru (*storage state*), odkud si ho testy načtou.

:::check
Proč si test „zruší objednávku" vytváří objednávku přes `request.post`, místo aby použil objednávku z předchozího testu?

### --answer--
Protože `request.post` je rychlejší než čtení databáze.

#### --why--
Myslíš si, že jde o rychlost? Hlavní důvod je nezávislost — i kdyby to bylo pomalejší,
patří to tam.

### --correct--
Aby prošel sám, v libovolném pořadí i souběžně s ostatními testy.

#### --why--
Test, který spoléhá na data jiného testu, selže, když se spustí samotný, v jiném pořadí
nebo když ten první spadne.

### --answer--
Protože Playwright mezi testy smaže databázi.

#### --why--
Myslíš si, že Playwright sahá na server? Maže jen stav prohlížeče (cookies, úložiště).
Databáze je věc tvé aplikace.
:::

## Trace viewer: co se stalo na CI

E2e test na CI spadne a na svém počítači ho nezopakuješ. S nastavením
`trace: 'on-first-retry'` Playwright při opakování selhaného testu nahraje **trace**:
snímek stránky před každou akcí a po ní, síťové požadavky, konzoli a zdroják testu.

```text
npx playwright show-report          # HTML přehled běhu, u selhání odkaz na trace
npx playwright show-trace trace.zip # otevře konkrétní trace
```

V trace vieweru projdeš test krok po kroku a vidíš, jak stránka vypadala ve chvíli,
kdy klik selhal — třeba že přes tlačítko ležela cookie lišta. Na CI si trace ulož
jako artefakt běhu.

> [!TIP]
> `npx playwright codegen localhost:5173` otevře prohlížeč a z tvého klikání napíše
> kód testu i s lokátory podle role. Dobrý začátek, ale kód vždycky přečti a uprav —
> hlavně aserce, ty za tebe nevymyslí.

:::check
Test na CI selhal na kliknutí, lokálně prochází. Co ti ukáže nejvíc o tom, proč?

### --expected-- ignore-case
trace

### --accept--
trace viewer
záznam trace
npx playwright show-trace
show-trace

### --why--
Trace obsahuje snímky stránky před akcí a po ní, síť i konzoli přímo z běhu na CI.
Uvidíš, co bylo na stránce ve chvíli selhání, místo abys hádal.
:::

## Přístupnost s axe-core

Stránka může fungovat myší a přitom být pro čtečku obrazovky nepoužitelná: pole bez
popisku, obrázek bez `alt`, text s nízkým kontrastem. Balíček `@axe-core/playwright`
projde vykreslenou stránku a vrátí seznam porušených pravidel WCAG:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('stránka košíku nemá zjistitelné problémy přístupnosti', async ({ page }) => {
  await page.goto('/kosik');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});
```

Když test selže, `violations` obsahuje u každého problému `id` pravidla (třeba
`color-contrast` nebo `label`), popis a selektor prvku.

> [!NOTE]
> Automatická kontrola najde jen část problémů přístupnosti. Jestli jde stránka
> ovládat klávesnicí a dává smysl ve čtečce, ověříš jen ručně. Lokátory podle role
> jsou k tomu dobrý první krok — co nenajde `getByRole`, nenajde ani čtečka.

:::check
Axe hlásí `label` u pole „E-mail". Jak ho nejlépe opravíš?

### --answer--
Vypnu v `AxeBuilder` pravidlo `label`.

#### --why--
Myslíš si, že problém je v kontrole? Kontrola našla skutečnou chybu: čtečka obrazovky
nepozná, co do pole patří.

### --correct--
Přidám poli `<label>` propojený přes `for` a `id`.

#### --why--
Pole dostane přístupný název. Opraví se tím přístupnost a navíc na pole půjde
`getByLabel('E-mail')`.

### --answer--
Přidám poli `placeholder="E-mail"`.

#### --why--
Myslíš si, že placeholder nahradí popisek? Zmizí, jakmile uživatel začne psát, a pak
není vidět, co do pole patří. Hlášku možná umlčí, ale pole zůstane horší než s popiskem.
:::

:::explain
Vysvětli vlastními slovy, proč se prvek v e2e testu hledá podle role a popisku, a ne
podle CSS třídy.

## --model--
Test má ověřovat, že aplikace **jde použít**, ne jak je napsaná uvnitř. Třída
`.btn-primary-2` je implementační detail: přejmenuje se při redesignu a test spadne, i
když se pro uživatele nic nezměnilo. Naopak role a popisek (`tlačítko Odeslat`) jsou
přesně to, co vidí člověk a co slyší čtečka obrazovky — když se změní, změnila se
i aplikace a test má spadnout právem. Jako vedlejší efekt tenhle způsob hledání tlačí
k přístupnému kódu: co se nedá najít podle role a jména, s tím bude mít problém
i uživatel čtečky.

## --checklist--
- Test má ověřovat použitelnost, ne vnitřní zápis.
- Třída se změní při redesignu, aniž by se změnilo chování.
- Role a popisek odpovídají tomu, co vnímá uživatel.
- Hledání podle role zároveň tlačí k přístupnému kódu.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Lokátor najde víc prvků.** Příznak:
> `Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Přidat' }) resolved to 3 elements`.
> Oprava: `exact: true`, nebo lokátor zúžit na rodiče přes `filter({ hasText: … })`.

> [!PITFALL]
> **Hodnota přečtená jednou místo aserce, která čeká.** `expect(await locator.textContent()).toBe(…)`
> občas selže, podle rychlosti serveru. Příznak: test na CI jednou projde, jindy ne.
> Oprava: `await expect(locator).toHaveText(…)`.

> [!PITFALL]
> **Chybějící `await` před `expect(locator)`.** Test doběhne dřív, než aserce skončí,
> a zelená neznamená nic. Oprava: `await` před každou akcí a asercí; hlídá to pravidlo
> ESLintu `@typescript-eslint/no-floating-promises`.

> [!PITFALL]
> **Pevné čekání.** `waitForTimeout(2000)` test zpomalí a nestabilitu neodstraní.
> Příznak: sada trvá minuty a na vytíženém CI pořád občas spadne na prvku, který
> „ještě nebyl". Oprava: čekat na stav stránky (`toBeVisible`, `toHaveText`,
> `toHaveURL`), ne na čas.

:::check
Test hlásí `strict mode violation: getByRole('link', { name: 'Detail' }) resolved to 12 elements`. Co znamená?

### --answer--
Stránka se nenačetla včas.

#### --why--
Myslíš si, že jde o čekání? Playwright prvky našel, dokonce dvanáct. Problém je, že
jich je víc, než čekáš.

### --correct--
Lokátor sedí na víc prvků a akce potřebuje právě jeden.

#### --why--
Na stránce je dvanáct odkazů „Detail". Lokátor je potřeba zúžit na konkrétní položku.

### --answer--
Odkaz nemá přístupný název.

#### --why--
Myslíš si, že lokátor nic nenašel? Kdyby odkaz název neměl, lokátor by nenašel žádný
prvek a hláška by mluvila o čekání na něj.
:::

## Kde to najdeš v MDN

- [Playwright: Locators](https://playwright.dev/docs/locators) — všechny `getBy…`,
  filtrování a strict mode.
- [Playwright: Auto-waiting](https://playwright.dev/docs/actionability) a
  [Assertions](https://playwright.dev/docs/test-assertions) — co přesně akce a aserce čekají.
- [Playwright: Trace viewer](https://playwright.dev/docs/trace-viewer) a
  [Accessibility testing](https://playwright.dev/docs/accessibility-testing) — trace a axe-core.
- [MDN: ARIA roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles) —
  jaké role prvky mají, podle nich hledá `getByRole`.

Jeden e2e test napíšeš jako rozšíření projektu [Rozpočet ve Vite a TypeScriptu](see:nastroje-testovani/projekt-rozpoctovac).

# --questions--

## --question--

Formulář má `<label for="city">Město doručení</label><input id="city">`. Napiš lokátor, kterým pole v Playwrightu najdeš podle toho, co vidí uživatel.

### --expected--
page.getByLabel('Město doručení')

### --accept--
getByLabel('Město doručení')
page.getByRole('textbox', { name: 'Město doručení' })
getByRole('textbox', { name: 'Město doručení' })

### --why--
Popisek je přístupný název pole. `getByLabel` ho najde přímo, `getByRole('textbox', …)`
také. Když popisek chybí, test selže — a upozorní tak i na problém přístupnosti.

### --see--
nastroje-testovani/playwright#lokatory-podle-role-a-popisku

## --question--

Proč Playwright ve výchozím stavu dává každému testu nový kontext prohlížeče?

### --answer--
Aby test běžel rychleji, protože kontext se nemusí mazat.

#### --why--
Myslíš si, že jde hlavně o rychlost? Nový kontext něco stojí. Důvod je, co by si testy
jinak předávaly.

### --correct--
Aby si testy nepředávaly cookies, přihlášení a `localStorage` a šly pouštět v libovolném pořadí.

#### --why--
Každý test začíná s čistým prohlížečem. Závislost mezi testy pak může vzniknout už jen
přes data na serveru — a ta si má každý test připravit sám.

### --answer--
Protože jeden kontext zvládne otevřít jen jednu kartu.

#### --why--
Myslíš si, že kontext je omezený na kartu? Jeden kontext může mít karet víc.

### --see--
nastroje-testovani/playwright#izolace-dat

## --question--

Test čeká na výsledky hledání přes `waitForTimeout(3000)`. Napiš jedním slovem, jak se říká testu, který kvůli tomu jednou projde a jindy ne.

### --expected-- ignore-case
nestabilní

### --accept--
flaky
nestabilní test
flaky test

### --why--
Výsledek testu závisí na rychlosti serveru, ne na tom, jestli aplikace funguje.
Oprava je čekat na stav stránky, třeba `await expect(…).toBeVisible()`.

### --see--
nastroje-testovani/playwright#proc-ne-waitfortimeout
