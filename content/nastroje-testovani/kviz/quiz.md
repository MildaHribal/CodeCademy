---
pass: 0.8
---

# --questions--

## --question--

Rezervační systém tenisových kurtů má tři nahlášené chyby. Kterou z nich odhalíš nejlevnějším druhem testu?

### --answer--

Tlačítko „Rezervovat" na mobilu překrývá lišta se souhlasem s cookies.

#### --why--

Myslíš si, že překrytí prvku pozná i test, který jen volá funkce? O tom, co na
stránce leží přes co, se dozví jen test, který stránku opravdu vykreslí — a takový
test je ze všech nejdražší.

### --answer--

Formulář posílá rezervaci na starou adresu `/api/rezervace-v1`.

#### --why--

Myslíš si, že adresu v požadavku ověří test jedné funkce? Aby se chyba projevila,
musí se potkat formulář a API, tedy dvě části najednou.

### --correct--

Večerní příplatek se počítá z ceny po členské slevě, ne před ní.

#### --why--

Je to výpočet uvnitř jedné funkce. Unit test jí předá cenu i hodinu a porovná
výsledek — běží milisekundy a při selhání přesně víš, kde chyba je.

### --see--

nastroje-testovani/proc-testovat#pyramida-a-trofej

## --question--

Rezervace odeslaná přes `POST /api/rezervace` se má uložit do databáze i se spočítanou cenou. Doplň druh testu: nejlevněji to ověříš ______ testem.

### --expected-- ignore-case

integračním

### --accept--

integrační
integračním testem
integration

### --why--

Zapojíš dvě části najednou: obsluhu požadavku a databázi. Unit test databázi vůbec
nevidí a e2e test by kvůli jednomu uložení spouštěl celý prohlížeč. Právě špatný
formát dat mezi částmi je to, co integrační test chytá nejlíp.

### --see--

nastroje-testovani/proc-testovat#unit-integracni-a-end-to-end-testy

## --question--

**Opakování z dřívějška.** V projektu s TypeScriptem jsi přejmenoval vlastnost `price` na `pricePerHour`. Chceš co nejrychleji zjistit, kde na ni kód ještě sahá. Napíšeš na to unit test, nebo pustíš `npx tsc --noEmit`? A proč?

### --answer--

Unit test — teprve spuštěný kód potvrdí, že se přejmenování povedlo.

#### --why--

Myslíš si, že o kódu se bez spuštění nic nezjistí? Vzpomeň si, co ze sekce
o TypeScriptu projde celý projekt, aniž by z něj cokoli spustilo.

### --answer--

Unit test — `tsc` v projektu bez `strict: true` na neexistující vlastnost neupozorní.

#### --why--

Myslíš si, že `strict` rozhoduje o kontrole názvů vlastností? `strict` přitvrzuje
práci s `null` a implicitním `any`. Čtení vlastnosti, která v typu není, je chyba
i bez něj.

### --correct--

`npx tsc --noEmit` — projde celý projekt najednou, nic nespustí a nemusíš kvůli tomu psát řádek testu.

#### --why--

Statická kontrola je nejlevnější test ze všech: najde všechna místa v jednom běhu,
ještě než se cokoli spustí. Unit testy napíšeš na chování, které se z typů poznat nedá.

### --see--

nastroje-typescript/proc-typescript#kontrola-typu-npx-tsc-noemit
nastroje-testovani/proc-testovat#pyramida-a-trofej

## --question--

Funkce `pickCourt(freeCourts)` si uvnitř volá `Math.random()`, takže test nikdy neví, který kurt vybere. Napiš její hlavičku tak, aby šla náhoda předat zvenku a volání v aplikaci se přitom nemuselo změnit.

### --expected--

function pickCourt(freeCourts, random = Math.random)

### --accept--

function pickCourt(freeCourts, random = Math.random) {
const pickCourt = (freeCourts, random = Math.random) =>
function pickCourt(freeCourts, { random = Math.random } = {})

### --why--

Výchozí hodnota parametru nechá aplikaci volat `pickCourt(courts)` jako dřív, ale
test může předat vlastní funkci, třeba `() => 0`. O náhodě pak rozhoduje test, ne
prostředí.

### --see--

nastroje-testovani/mocky-cas-sit#vlozeni-zavislosti-predej-ji-zvenku

## --question--

V testu je `const sendSms = t.mock.fn();` a po zavolání kódu chceš ověřit, na jaké číslo potvrzení odešlo. Napiš výraz, kterým přečteš první argument prvního volání.

### --expected--

sendSms.mock.calls[0].arguments[0]

### --accept--

sendSms.mock.calls.at(0).arguments.at(0)
sendSms.mock.calls[0].arguments.at(0)

### --why--

`mock.calls` je pole volání v pořadí, jak přišla, a každé z nich má pole
`arguments`. Samotný `sendSms.mock.callCount()` by prošel i tehdy, kdyby potvrzení
odešlo na cizí číslo.

### --see--

nastroje-testovani/mocky-cas-sit#mock-funkce-a-speh

## --question--

Čím doplníš `server.listen()` v `before`, aby test spadl, když kód zavolá adresu, pro kterou nemáš v MSW handler?

### --expected--

{ onUnhandledRequest: 'error' }

### --accept--

onUnhandledRequest: 'error'
server.listen({ onUnhandledRequest: 'error' })

### --why--

Ve výchozím nastavení MSW o nezachyceném požadavku jen varuje a ten odejde na
skutečný internet. Test je pak pomalý a jeho výsledek závisí na cizím serveru.
S `'error'` se o zapomenutém handleru dozvíš hned.

### --see--

nastroje-testovani/mocky-cas-sit#sit-msw-misto-nahrazeneho-fetch

## --question--

Odpočet do začátku hry běží v `startCountdown` na `setInterval`. Test zapne `t.mock.timers.enable({ apis: ['setTimeout'] })`, posune čas `t.mock.timers.tick(60000)` a hlásí nula odtikaných minut. Proč?

### --answer--

`tick` posune čas nejvýš o limit jednoho testu, 60 000 ms je nad ním.

#### --why--

Myslíš si, že falešný čas naráží na limit testu? Falešný čas se posouvá skokem
a nic při tom neuběhne — limit testu se ho netýká.

### --answer--

`setInterval` se v `node:test` nahradit nedá, musíš si ho v testu přepsat sám.

#### --why--

Myslíš si, že falešné časovače umí jen `setTimeout`? Podívej se, co přesně test
vypsal do `apis` a co tím o ostatních časovačích řekl.

### --correct--

Falešný je jen `setTimeout`; `setInterval` zůstal skutečný, takže s ním `tick` nic nedělá.

#### --why--

Seznam `apis` určuje, co se nahradí. Co v něm není, běží dál na skutečném čase.
Oprava je `enable({ apis: ['setInterval'] })`, případně obojí.

### --see--

nastroje-testovani/mocky-cas-sit#falesne-casovace

## --question--

**Opakování z dřívějška.** Na serveru CI se před `npx playwright test` instalují závislosti. Kterým příkazem je nainstaluješ, aby verze přesně odpovídaly souboru `package-lock.json`?

### --expected--

npm ci

### --accept--

npm clean-install

### --why--

`npm ci` smaže `node_modules` a nainstaluje přesně to, co je v zámku. `npm install`
smí zámek upravit, takže by se na CI mohla objevit jiná verze knihovny než na tvém
počítači — a s ní test, který selže jen tam.

### --see--

nastroje-moduly-vite/npm-a-pnpm#lockfile-a-npm-ci

## --question--

Lokátor `page.getByRole('button', { name: 'Rezervovat' })` sedí i na tlačítka „Rezervovat na zítra" a „Rezervovat opakovaně", takže klik spadne na `strict mode violation`. Kterou volbu přidáš do druhého argumentu, aby se název porovnával přesně?

### --expected--

exact: true

### --accept--

{ name: 'Rezervovat', exact: true }
page.getByRole('button', { name: 'Rezervovat', exact: true })

### --why--

Playwright hledá název ve výchozím stavu jako podřetězec bez ohledu na velikost
písmen. S `exact: true` projde jen tlačítko s názvem přesně „Rezervovat". Druhá
cesta je zúžit hledání na řádek s konkrétním kurtem přes `filter({ hasText: … })`.

### --see--

nastroje-testovani/playwright#lokatory-podle-role-a-popisku

## --question--

E2e test „zruší rezervaci" pracuje s rezervací, kterou vytvořil dřívější test „vytvoří rezervaci". Oba běží v sadě, kterou Playwright rozděluje mezi dva pracovníky. Co uvidíš?

### --answer--

Nic, Playwright spouští testy jednoho souboru vždy v tom pořadí, ve kterém jsou napsané.

#### --why--

Myslíš si, že pořadí v souboru je zároveň zárukou? Podívej se, co dostane každý
test na začátku sám pro sebe a co naopak zůstává společné na serveru.

### --answer--

Druhý test selže vždy, protože dostane čistý kontext prohlížeče bez přihlášení.

#### --why--

Myslíš si, že problém je v přihlášení? To si test umí obstarat z uloženého stavu.
Chybí mu něco jiného, co vzniklo až za běhu jiného testu.

### --correct--

Test „zruší rezervaci" bude selhávat nahodile a spuštěný samostatně neprojde nikdy.

#### --why--

Data na serveru jsou společná a pořadí ani souběh nemáš pod kontrolou. Proto si
každý e2e test rezervaci vytvoří sám, nejrychleji přes `request.post`.

### --see--

nastroje-testovani/playwright#izolace-dat

## --question--

**Opakování z dřívějška.** Testovací soubor má řádek `import { courtPrice } from './courts';` a Node hlásí `ERR_MODULE_NOT_FOUND`. Napiš opravený řádek.

### --expected--

import { courtPrice } from './courts.js';

### --accept--

./courts.js
from './courts.js'

### --why--

ES moduly v Node nedoplňují příponu ani `/index.js` — cestu musíš napsat celou,
tak jak soubor na disku leží. Bundler jako Vite si příponu domyslí, a právě proto
kód, který v prohlížeči jede, v `node --test` spadne.

### --see--

nastroje-moduly-vite/es-moduly#cesty-v-importu

## --question--

**Opakování z dřívějška.** Commit, který rozbil testy na větvi `main`, je už na `origin/main` a kolegové si ho stáhli. Čím ho vrátíš?

### --answer--

`git reset --hard <hash před ním>` a `git push --force`.

#### --why--

Myslíš si, že nejrychlejší je commit ze sdílené větve prostě smazat? Kolegové ho
mají ve svých kopiích a jejich historie se s tou tvojí rozejde.

### --answer--

`git commit --amend` s opravou a `git push --force-with-lease`.

#### --why--

Myslíš si, že `--amend` upraví libovolný commit? Přepíše jen ten poslední — a i to
je na sdílené větvi přepisování historie.

### --correct--

`git revert <hash>` — přidá nový commit, který změnu ruší, a historii nechá být.

#### --why--

Kolegové si jen stáhnou další commit. Zlaté pravidlo zní: sdílenou historii
nepřepisuj, opravuj ji dalším commitem.

### --see--

nastroje-git-terminal/git-zachrana#revert-oprava-bez-prepisovani-historie

# --code-- Cizí testy rezervací kurtů

## --file-- rezervace.test.js

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courtPrice, reserveCourt, cancelCourt, loadOpeningHours } from './courts.js';

// Sem si testy odkládají rezervace, které během souboru vzniknou.
const reservations = [];

function makeSlot(day, hour) {
  const slot = {
    court: 'Kurt 1 — antuka',
    day: day,
    hour: hour,
    player: 'Jana Nováková',
  };
  return slot;
}

const priceCases = [
  { surface: 'antuka', hour: 10, expected: 320 },
  { surface: 'hala', hour: 10, expected: 450 },
  { surface: 'antuka', hour: 7, expected: 240 },
];

for (let i = 0; i < priceCases.length; i++) {
  const priceCase = priceCases[i];
  test('cena za ' + priceCase.surface + ' v ' + priceCase.hour + ' h', () => {
    const price = courtPrice(priceCase.surface, priceCase.hour);
    assert.equal(price, priceCase.expected, 'cena hodiny neodpovídá ceníku');
  });
}

test('večerní hodina je o polovinu dražší', () => {
  assert.equal(courtPrice('antuka', 19), 320 * 1.5, 'večerní příplatek je 50 %');
});

test('rezervace se uloží do seznamu', async () => {
  const slot = makeSlot('pondeli', 10);
  reservations.push(await reserveCourt(slot));
  assert.equal(reservations.length, 1, 'po první rezervaci je v seznamu jeden záznam');
});

test('druhá rezervace dostane pořadové číslo 2', async () => {
  const slot = makeSlot('utery', 11);
  reservations.push(await reserveCourt(slot));
  assert.equal(reservations[1].number, 2, 'druhý záznam má číslo 2');
});

test('zrušení uvolní obsazený termín', async () => {
  const slot = makeSlot('streda', 8);
  await reserveCourt(slot);
  await cancelCourt(slot);
});

test('obsazený termín nejde rezervovat podruhé', async () => {
  const slot = makeSlot('pondeli', 10);
  assert.rejects(reserveCourt(slot), { message: /obsazeno/ });
});

test('otevírací doba se načte z API', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ open: 7, close: 22 }),
  });
  const hours = await loadOpeningHours('Kurty Lužánky');
  assert.deepEqual(hours, { open: 7, close: 22 }, 'otevírací doba přijde z API');
});

test('mimo otevírací dobu rezervace neprojde', async () => {
  const slot = makeSlot('ctvrtek', 23);
  await assert.rejects(reserveCourt(slot), { message: /zavřeno/ });
});
```

## --question--

Test na řádcích 48–52 skončí ✔ i tehdy, kdyby `cancelCourt` termín vůbec neuvolnil. Co v něm chybí? Napiš jedno slovo.

### --expected-- ignore-case

aserce

### --accept--

assert
ověření
kontrola výsledku
porovnání výsledku

### --why--

Test jen zavolá dvě funkce a skončí. ✔ pak znamená pouze „nic nespadlo", ne „termín
je volný". Doplň na konec porovnání, třeba `assert.equal(await isFree(slot), true)`,
a pak si ověř, že test po rozbití `cancelCourt` opravdu zčervená.

### --see--

nastroje-testovani/proc-testovat#typicke-chyby-a-pasti

## --question--

Na řádku 56 chybí jedno klíčové slovo. Bez něj test svítí zeleně i tehdy, když `reserveCourt` žádnou chybu nevyhodí. Napiš ho.

### --expected--

await

### --accept--

await assert.rejects(reserveCourt(slot), { message: /obsazeno/ });

### --why--

`assert.rejects` vrací Promise. Bez `await` test doběhne dřív, než se vyhodnotí,
a jeho výsledek se ztratí — nanejvýš se pod ✔ objeví hláška o asynchronní činnosti
po konci testu. Na řádku 70 je to napsané správně.

### --see--

nastroje-testovani/proc-testovat#ocekavana-chyba-throws-a-rejects

## --question--

Řádek 60 přiřadí do `globalThis.fetch` vlastní funkci a nikde ji nevrací zpátky. Jaký příznak uvidíš jako první?

### --answer--

Test na řádcích 59–66 selže, protože `globalThis.fetch` se přepsat nesmí.

#### --why--

Myslíš si, že Node takové přiřazení zakáže? `fetch` je obyčejná vlastnost globálního
objektu a přiřazení projde bez hlesnutí. Potíž nastane jinde než v tomhle testu.

### --answer--

Testy začnou chodit na skutečné API kurtů, budou pomalé a občas selžou podle jeho stavu.

#### --why--

Myslíš si, že náhradní `fetch` požadavek pošle dál ven? Nic neodesílá, vrací jen to,
co má napsané v těle. Přesně to je ale jádro problému.

### --correct--

Testy spuštěné samostatně projdou, ale v celé sadě selže jiný test, který dostane odpovědi z tohohle mocku.

#### --why--

Přiřazení do `globalThis` platí pro celý proces, dokud ho někdo nevrátí. Řešením je
`t.mock.method(globalThis, 'fetch', …)`, které původní funkci po testu vrátí, nebo
rovnou MSW.

### --see--

nastroje-testovani/mocky-cas-sit#typicke-chyby-a-pasti

## --question--

Testy na řádcích 36–40 a 42–46 sdílejí pole `reservations` z řádku 6. Co se stane, když pustíš jen ten druhý přes `node --test --test-name-pattern='pořadové'`?

### --answer--

Skončí chybou `ReferenceError: reservations is not defined`.

#### --why--

Myslíš si, že proměnná bude chybět? Řádek 6 patří modulu, ne testu — načte se vždy,
ať pustíš kterýkoli test.

### --answer--

Projde stejně jako v celé sadě, výběr testů na výsledek vliv nemá.

#### --why--

Myslíš si, že každý test v souboru stojí sám? Projdi si, odkud se do `reservations`
dostane první záznam a kdo ho tam dá.

### --correct--

Selže: v poli je jediný záznam, takže `reservations[1]` je `undefined` a čtení `.number` skončí chybou.

#### --why--

Druhý test počítá s tím, co udělal první. Oprava je připravit si data v každém testu
zvlášť — třeba pole vyrobit uvnitř testu, ne na úrovni modulu.

### --see--

nastroje-testovani/proc-testovat#typicke-chyby-a-pasti
