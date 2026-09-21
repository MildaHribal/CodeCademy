# Testy a nasazení Next.js

Aplikace, která běží jen u tebe v `next dev`, není hotová. Tahle lekce je o dvou
krocích, které z projektu udělají něco, co se dá ukázat: testy, které chytnou chybu
dřív než uživatel, a nasazení, po kterém má aplikace adresu.

:::check pretest
Kolik testů podle tebe potřebuje malá aplikace, aby ti dávaly klid při refaktoru? Napiš číslo.

### --expected--
10

### --accept--
5
deset
pět
15
20

### --why--
Řádově jednotky až nízké desítky. Nejde o počet — jde o to, aby testy pokrývaly
pravidla, na kterých aplikace stojí, a pár cest, kterými uživatel skutečně chodí.
:::

:::check pretest
Co myslíš, že se stane, když v produkci chybí proměnná prostředí `DATABASE_URL`, kterou `next build` potřebuje?

### --answer--
Aplikace se sestaví a spadne až u prvního požadavku.

#### --why--
Občas ano — ale u Next.js se stránky vyrábějí už při buildu, takže se na chybějící
databázi narazí mnohem dřív.

### --correct--
Build skončí chybou, protože se stránky vyrábějí už při něm.
:::

## Problém: „u mě to funguje"

Tenhle seznam potkáš v produkci a ve `next dev` nikdy:

- stránka, která se v `dev` vykreslila, při `next build` spadne na `window is not defined`,
- odkaz, který vede na stránku smazanou před třemi commity,
- formulář, který uloží prázdný název, protože validace zůstala jen v prohlížeči,
- proměnná prostředí, kterou má tvůj počítač a server ne.

Všechny čtyři chytí dvě věci: **produkční build** a **testy proti němu**.

> [!REMEMBER]
> **`next dev` a `next build` jsou dvě různá prostředí.** Dev je shovívavý
> a pomalý, produkční build vyrábí stránky předem a hlásí, co se vyrobit nedá.
> Než něco nasadíš, musíš `next build` vidět projít.

:::check
Napiš příkaz, kterým si ověříš, že se aplikace vůbec dá sestavit.

### --expected--
next build

### --accept--
npm run build
npx next build

### --why--
Produkční build prochází všechny stránky, kontroluje typy a vyrábí statické
stránky předem. Většina chyb „u mě to fungovalo" se ukáže právě tady.
:::

## Co testovat čím

Nejčastější chyba začátečníka není „málo testů", ale testy na špatné úrovni:
křehké testy komponent, které se rozbijí při každé změně HTML, a žádný test pravidla,
na kterém stojí celá aplikace.

| co | čím | příklad |
|---|---|---|
| čisté funkce a pravidla | **Vitest** | `smiUpravit(uzivatel, inzerat)`, formátování ceny, Zod schéma |
| serverová akce bez UI | **Vitest** nad testovací databází | „akce odmítne cizí inzerát" |
| cesta uživatele | **Playwright** proti produkčnímu buildu | „přihlásím se, přidám inzerát, vidím ho v seznamu" |
| vzhled | okem a rozšířením v prohlížeči | kontrast, rozestupy |

Serverové komponenty samotné **jednotkově netestuj**. Jsou to `async` funkce, které
vracejí strom pro server — testuje se to mizerně a hodnota je malá. Tu práci odvede
jeden Playwright test, který si stránku otevře doopravdy.

> [!TIP]
> Pravidlo, podle kterého se rozhodujeme: co by tě mrzelo v produkci, si zaslouží
> test. Že tlačítko má třídu `rounded-xl`, tě mrzet nebude. Že se cizí inzerát dal
> smazat, ano.

:::check
Napiš nástroj, kterým bys testoval funkci `smiUpravit(uzivatel, inzerat)`.

### --expected--
Vitest

### --accept--
vitest
jednotkovým testem ve Vitestu

### --why--
Je to čistá funkce bez databáze, sítě a UI: dostane dva objekty a vrátí `true`
nebo `false`. Takové testy jsou rychlé a nerozbijí se změnou vzhledu.
:::

## Vitest na logiku

Vitest nepotřebuje skoro žádné nastavení a rozumí stejným cestám jako Next.js.
Pravidla z lekce o přihlášení vypadají v testu takhle:

```ts
// lib/prava.test.ts
import { describe, expect, it } from 'vitest';
import { smiUpravit } from './prava';

const eva = { id: 'eva', role: 'user' };
const admin = { id: 'sarka', role: 'admin' };
const inzerat = { id: 1, nazev: 'Kolo Author', autorId: 'eva' };

describe('smiUpravit', () => {
  it('pustí autora', () => {
    expect(smiUpravit(eva, inzerat)).toBe(true);
  });

  it('pustí admina i u cizího inzerátu', () => {
    expect(smiUpravit(admin, inzerat)).toBe(true);
  });

  it('nepustí cizího uživatele', () => {
    expect(smiUpravit({ id: 'petr', role: 'user' }, inzerat)).toBe(false);
  });

  it('nepustí nepřihlášeného ani u záznamu bez autora', () => {
    expect(smiUpravit(null, { id: 2, nazev: 'Stan pro dva' })).toBe(false);
  });
});
```

Poslední test je ten nejcennější: hlídá past `undefined === undefined`
z lekce [Přihlášení v Next.js](see:next-fullstack/auth-v-nextu#ochrana-stranky-a-akce).
Kdyby ji někdo za rok při úpravě zavedl zpátky, test spadne.

V terminálu to vypadá takhle:

```text
 ✓ lib/prava.test.ts (4 tests) 3ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Duration  412ms
```

Pusť si to: `npx vitest` nechá testy běžet a při každém uložení je spustí znovu,
`npx vitest run` je spustí jednou a skončí (to je verze pro CI).

Stejně dobře se testuje Zod schéma — je to taky jen funkce:

```ts
it('odmítne prázdný název', () => {
  expect(Inzerat.safeParse({ nazev: '  ', cena: 100 }).success).toBe(false);
});
```

:::check
Napiš příkaz, kterým pustíš testy jednou a skončíš (ne v režimu sledování).

### --expected--
vitest run

### --accept--
npx vitest run
npm test

### --why--
Bez `run` zůstane Vitest viset a čeká na změny souborů. V CI by to znamenalo
úlohu, která nikdy neskončí.
:::

## Playwright proti produkčnímu buildu

Playwright otevře skutečný prohlížeč a proklikává aplikaci jako člověk. Aby to
mělo cenu, musí běžet proti **produkčnímu buildu**, ne proti `next dev`:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:3000' },
  webServer: {
    command: 'npm run build && npm run start',   // ne `npm run dev`
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Test pak popisuje cestu uživatele, ne implementaci:

```ts
// e2e/inzerat.spec.ts
import { expect, test } from '@playwright/test';

test('přihlášený uživatel přidá inzerát a vidí ho v seznamu', async ({ page }) => {
  await page.goto('/prihlaseni');
  await page.getByLabel('E-mail').fill('eva@example.com');
  await page.getByLabel('Heslo').fill('tajneheslo');
  await page.getByRole('button', { name: 'Přihlásit se' }).click();

  await page.goto('/inzeraty/novy');
  await page.getByLabel('Název').fill('Kolo Author Solution');
  await page.getByLabel('Cena').fill('7500');
  await page.getByRole('button', { name: 'Přidat inzerát' }).click();

  await expect(page.getByRole('heading', { name: 'Kolo Author Solution' })).toBeVisible();
});
```

Všimni si, že se prvky hledají podle **role a jména** (`getByRole`, `getByLabel`),
ne podle tříd. Test tím zároveň kontroluje přístupnost: co nemá popisek, to
Playwright nenajde — a čtečka obrazovky taky ne.

> [!PITFALL]
> Test proti `next dev` vypadá, že funguje, a přitom neověří to hlavní: že se
> aplikace vůbec dá sestavit a že stránky vyrobené předem obsahují správná data.
> Rozdíl bývá vidět zrovna u chyb, kvůli kterým padá produkce.

A jeden test navíc, který se vyplatí úplně vždy — ten na chybějící data:

```ts
test('neznámý inzerát vrátí 404', async ({ page }) => {
  const odpoved = await page.goto('/inzeraty/neexistuje');
  expect(odpoved?.status()).toBe(404);
});
```

:::check
Proč se prvky v testu hledají přes `getByRole('button', { name: 'Uložit' })` a ne přes CSS třídu?

### --expected--
třída se změní při redesignu

### --accept--
test by se rozbil při změně stylů
role a jméno popisují, co uživatel vidí
protože třída není to, co vidí uživatel

### --why--
Role a přístupné jméno popisují, co na stránce **je**. Třída popisuje, jak to
vypadá — a to se mění při každém redesignu, aniž by se chování změnilo.
:::

## Proměnné prostředí a build

Tady se láme nejvíc nasazení. Platí tři pravidla:

1. **Proměnné bez prefixu `NEXT_PUBLIC_` zná jen server.** V prohlížeči jsou `undefined`.
2. **Proměnné s prefixem `NEXT_PUBLIC_` se zapečou při buildu.** Změna hodnoty
   po nasazení se neprojeví — musíš sestavit znovu.
3. **Všechno, co build potřebuje, musí být v prostředí buildu**, ne až v runtime.

A klasická past, která z proměnných prostředí padá pokaždé:

:::live node predict
```js
// Prostředí má nastavené PORT=3000.
const port = process.env.PORT;

console.log(port + 1);
console.log(typeof port);
```
--question-- Co skript vypíše?
--output--
```text
30001
string
```
--why-- Proměnné prostředí jsou **vždycky řetězce**, i když v nich je číslo. `+` na řetězci nesčítá, ale spojuje. Proto se čísla z prostředí převádějí hned při čtení: `Number(process.env.PORT) || 3000`.
:::

Pusť si to v terminálu (`PORT=3000 node skript.js`) a pak zkus `Number(port) + 1`.

Užitečný zvyk: proměnné zkontrolovat na jednom místě při startu, ne až tam, kde
selžou. Zase se hodí Zod:

```ts
// lib/env.ts
import { z } from 'zod';

export const env = z
  .object({
    DATABASE_URL: z.string().min(1, 'Chybí DATABASE_URL.'),
    BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET musí mít aspoň 32 znaků.'),
  })
  .parse(process.env);
```

Když něco chybí, build spadne s českou větou, která přesně řekne co — místo
`Cannot read properties of undefined` někde ve třetí knihovně.

:::check
Změnil jsi hodnotu `NEXT_PUBLIC_ANALYTIKA_ID` na serveru a restartoval aplikaci, ale v prohlížeči je pořád stará. Napiš, co musíš udělat.

### --expected--
sestavit znovu

### --accept--
znovu spustit build
next build
nasadit znovu s novým buildem

### --why--
Veřejné proměnné se při buildu zapečou přímo do souborů JavaScriptu. Restart
procesu s nimi nic neudělá — jsou už součástí staženého kódu.
:::

## Nasazení: platforma, nebo kontejner

Máš dvě rozumné cesty a rozdíl je hlavně v tom, kolik provozu chceš mít na starost.

**Platforma** (Vercel, Netlify a podobné): propojíš repozitář, platforma si
sama pustí build při každém pushi, přidělí adresu, certifikát a CDN. Pro portfolio
i pro většinu malých projektů je to správná volba — má to hotové za deset minut.

**Vlastní server nebo kontejner:** máš plnou kontrolu a žádný vendor lock-in.
Next.js na to má režim `standalone`, který vyrobí složku se vším potřebným:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

```dockerfile
# Dockerfile — dvoufázový build, aby obraz nenesl zdrojáky a devDependencies
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Obraz z toho vyjde v desítkách megabajtů místo stovek, protože `standalone`
zkopíruje jen ty balíčky, které aplikace opravdu importuje.

**Migrace databáze** patří mezi build a start, ne do kódu aplikace:

```json
{
  "scripts": {
    "build": "next build",
    "migrate": "drizzle-kit migrate",
    "start": "next start"
  }
}
```

Na platformě to zapíšeš jako krok před startem, v Dockeru jako `npm run migrate && node server.js`.
Kdybys migrace pouštěl z aplikace, spustí se ti při každé instanci zvlášť —
a dvě naráz si navzájem rozbijí schéma.

> [!PITFALL]
> `output: 'standalone'` **nekopíruje** `public/` ani `.next/static`. Když na ně
> v Dockerfile zapomeneš, aplikace poběží, ale bez obrázků a bez stylů. Je to
> nejčastější „proč to vypadá rozbitě jen v produkci".

:::check
Napiš hodnotu klíče `output` v `next.config.ts`, která připraví složku pro nasazení do kontejneru.

### --expected--
standalone

### --accept--
'standalone'
output: 'standalone'

### --why--
V režimu `standalone` vyrobí build složku se serverem a jen s těmi balíčky, které
aplikace skutečně importuje. Obraz je pak malý a nepotřebuje `npm install`.
:::

:::explain
Vysvětli vlastními slovy, proč projekt může bezchybně běžet ve vývoji a spadnout při
sestavení pro produkci.

## --model--
Dev server je shovívavý: stránky vyrábí na vyžádání, takže se nikdy nedostane k těm,
na které jsi během vývoje neklikl, a chyby může jen vypsat a pokračovat. Produkční
sestavení naopak zkouší vyrobit **všechno dopředu**: projde každou trasu, spustí
serverový kód a cokoli, co selže — chybějící proměnná prostředí, odkaz na `window`
v serverové komponentě, API, které při sestavení neodpovídá — ohlásí jako chybu.
Je to tedy první opravdová zkouška, a proto se na nasazení nesahá dřív, než sestavení
projde lokálně.

## --checklist--
- Dev vyrábí stránky až na vyžádání.
- Nenavštívené trasy se ve vývoji nikdy nespustí.
- Sestavení projde všechny trasy a serverový kód.
- Proto se problémy objeví až při něm.
:::

## Typické chyby a pasti

> [!PITFALL] `next build` spadne na `window is not defined`
> V `next dev` se stránka vykreslila v prohlížeči, při buildu se vyrábí na serveru.
> **Oprava:** prohlížečová API přesuň do `useEffect` nebo do obsluhy události, jak
> to popisuje lekce [CSR, SSR, SSG](see:next-fullstack/ssr-csr-ssg#co-nesoulad-zpusobuje).

> [!PITFALL] E2E testy v CI padají „náhodně"
> Test čeká pevný počet milisekund (`page.waitForTimeout(500)`) a pomalejší stroj
> v CI to nestihne. **Oprava:** čekej na následek, ne na čas —
> `await expect(page.getByText('Uloženo')).toBeVisible()`.

> [!PITFALL] Testy sdílejí databázi s vývojem
> Test smaže záznam a tobě zmizí data, se kterými si hraješ. **Oprava:** samostatná
> testovací databáze (jiný `DATABASE_URL` v `.env.test`) a úklid po každém testu.

> [!PITFALL] Tajemství v repozitáři
> `.env.local` se commitne „jen na chvilku" a klíč je navždy v historii.
> **Oprava:** `.env*` do `.gitignore`, do repozitáře jen `.env.example` se jmény
> proměnných a prázdnými hodnotami.

> [!PITFALL] V produkci je vidět česká chybová hláška z akce
> Očekávané chyby vracíš jako hodnotu, to je správně — ale zprávy z výjimek
> (`error.message`) v produkci ven neposílej. **Oprava:** uživateli obecná věta,
> podrobnosti do logu serveru.

:::check
E2E test v CI občas spadne na tom, že po kliknutí hledá text hned. Napiš, na co má místo pevného čekání čekat.

### --expected--
na následek

### --accept--
na viditelnost prvku
až se prvek objeví
na výsledek akce

### --why--
Pevný čas je vždycky buď zbytečně dlouhý, nebo občas krátký. Čekání na konkrétní
následek (prvek je vidět, adresa se změnila) je rychlé i spolehlivé.
:::

## Kde to najdeš v MDN

- [Environment variables a `process.env`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) —
  proč je všechno v prostředí řetězec a co s tím dělá `Number()`.
- [ARIA role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) —
  seznam rolí, podle kterých hledá `getByRole` v Playwrightu i čtečka obrazovky.
- [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) —
  bez propojeného popisku `getByLabel` políčko nenajde; totéž platí pro uživatele
  s čtečkou.
- [HTTP 404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) — co
  přesně kontroluje test na neznámou adresu a proč nestačí „zobrazila se stránka".

> [!NOTE]
> Nasazení na vlastní server má Next.js popsané na
> [nextjs.org/docs/app/guides/self-hosting](https://nextjs.org/docs/app/guides/self-hosting) —
> včetně hotového `Dockerfile`, se kterým se vyplatí ten svůj porovnat.

# --questions--

## --question--

Napiš příkaz, který v `playwright.config.ts` patří do `webServer.command`,
aby testy běžely proti produkční verzi.

### --expected--

npm run build && npm run start

### --accept--

next build && next start
npm run build && npm start

### --why--

Proti `next dev` by testy neověřily to podstatné: že se aplikace dá sestavit
a že předem vyrobené stránky mají správný obsah. Zrovna tyhle chyby shazují produkci.

### --see--

next-fullstack/testy-a-nasazeni-nextu#playwright-proti-produkcnimu-buildu

## --question--

Proměnná `NEXT_PUBLIC_MAPY_KLIC` má po nasazení novou hodnotu, ale v prohlížeči
je pořád stará. Napiš, co se musí stát, aby se hodnota projevila.

### --expected--

nový build

### --accept--

sestavit znovu
next build
znovu nasadit s novým buildem

### --why--

Veřejné proměnné se nečtou za běhu — zapečou se do souborů JavaScriptu při buildu.
Restartovat proces proto nestačí.

### --see--

next-fullstack/testy-a-nasazeni-nextu#promenne-prostredi-a-build

## --question--

Co patří do jednotkového testu ve Vitestu spíš než do E2E testu?

### --answer--

Cesta „přihlásím se, přidám inzerát, vidím ho v seznamu".

#### --why--

Tahle cesta vede přes formulář, server, databázi i vykreslení. Poskládat ji
jednotkově je víc práce než ji proklikat v prohlížeči.

### --correct--

Funkce, která podle uživatele a záznamu rozhodne, jestli smí upravovat.

#### --why--

Je to čistá funkce bez UI a bez databáze. Testy jsou rychlé, pokryjí i okrajové
případy (chybějící uživatel, záznam bez autora) a nerozbijí se změnou vzhledu.

### --answer--

Vzhled tlačítka po najetí myší.

#### --why--

Na vzhled jsou testy ta nejdražší a nejkřehčí volba. Kontrast a rozestupy se
kontrolují okem a nástroji v prohlížeči.

### --see--

next-fullstack/testy-a-nasazeni-nextu#co-testovat-cim

## --question--

Aplikace v Dockeru běží, ale nemá styly ani obrázky z `public/`. Napiš, co se
zapomnělo zkopírovat do výsledného obrazu.

### --expected--

.next/static a public

### --accept--

static a public
.next/static
složky .next/static a public

### --why--

Režim `standalone` vyrobí server a potřebné balíčky, ale statické soubory
a `public/` nechává být — počítá s tím, že si je zkopíruješ sám, nebo je budeš
servírovat z CDN.

### --see--

next-fullstack/testy-a-nasazeni-nextu#nasazeni-platforma-nebo-kontejner
