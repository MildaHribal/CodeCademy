---
pass: 0.8
---

# --questions--

## --question--

Soubor `app/faktury/page.tsx` nemá na prvním řádku žádnou direktivu. Kde se jeho kód spustí?

### --answer--

Na serveru i v prohlížeči — Next.js ho vykreslí dvakrát.

#### --why--

To platí o něčem jiném než o souboru bez direktivy. Dvojí běh je právě ten
rozdíl, kterým se od sebe obě rodiny komponent liší.

### --answer--

Jen v prohlížeči, server pošle prázdné HTML.

#### --why--

Tohle je chování aplikace bez serverového vykreslování. V `app/` je výchozí
nastavení opačné, než čekáš.

### --correct--

Jen na serveru. Do balíku pro prohlížeč se z něj nedostane nic.

#### --why--

V `app/` je [[serverová komponenta]] výchozí stav. Kód, který se nikdy nepošle
do prohlížeče, smí sáhnout do databáze i na tajemství a nezvětší balík.

### --see--

next-fullstack/server-a-client-komponenty#vychozi-stav-vsechno-je-serverove
node-zaklady/co-je-node#stejny-jazyk-jine-prostredi

## --question--

Komponenta `Kosik.tsx` má na prvním řádku `'use client'`. Kolikrát se její kód vykreslí při prvním načtení stránky?

### --answer--

Jednou, a to v prohlížeči.

#### --why--

Kdyby to tak bylo, v HTML od serveru by po té komponentě nebyla ani stopa —
a vyhledávač ani čtečka by z ní nic neviděly. Zkus si, co server opravdu pošle.

### --correct--

Dvakrát: nejdřív na serveru do HTML, pak v prohlížeči při hydrataci.

#### --why--

`'use client'` neznamená „tohle server nevykreslí". Znamená „tohle půjde
i do prohlížeče". Proto v ní `window` v těle komponenty spadne stejně jako
v serverové.

### --answer--

Jednou na serveru; v prohlížeči se jen připojí obsluha událostí.

#### --why--

Připojit obsluhu k cizímu HTML by React neuměl — musí nejdřív zjistit, jaký
strom mu z toho kódu vyjde. Podívej se, co dělá [[hydratace]].

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --question--

Napiš přesně to, co musí být na prvním řádku souboru, aby se z něj stala klientská komponenta.

### --expected--

```tsx
'use client';
```

### --why--

Je to obyčejný řetězec jako direktiva, na úplně prvním řádku — nad importy.
Uvozovky můžou být jednoduché i dvojité. Když ho dáš až pod importy, Next.js
ho ignoruje a ohlásí chybu o `useState` v serverové komponentě.

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --question--

Která z těchhle věcí **nesmí** být v serverové komponentě?

### --answer--

`await db.select().from(faktury)` — přímý dotaz do databáze.

#### --why--

Tohle je naopak hlavní důvod, proč serverové komponenty existují: data si berou
rovnou u zdroje, bez API mezi tím.

### --answer--

`process.env.DATABASE_URL`.

#### --why--

Tajemství v serverové komponentě zůstane na serveru. Nebezpečné je to až tam,
odkud se kód posílá do prohlížeče.

### --correct--

`onClick={() => setOtevreno(true)}` — obsluha události se stavem.

#### --why--

Obsluha události i stav potřebují prohlížeč, a ten kód serverové komponenty
nikdy neuvidí. Next.js to hlásí jako „Event handlers cannot be passed to Client
Component props" nebo „useState only works in a Client Component".

### --see--

next-fullstack/server-a-client-komponenty#vychozi-stav-vsechno-je-serverove

## --question--

Soubor `Filtr.tsx` má `'use client'` a importuje `formatujCenu` z `lib/ceny.ts`, kde žádná direktiva není. Napiš jedním slovem, kam se `formatujCenu` dostane: na **server**, nebo do **balíku** pro prohlížeč?

### --expected-- ignore-case

balíku

### --accept--

balík
do balíku
klient
klientský balík

### --why--

Hranice se dědí do všeho, co klientský soubor importuje. Právě proto se do
takových modulů nesmí zatoulat nic tajného: `lib/ceny.ts` skončí v prohlížeči,
i když o tom sám neví.

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --question--

Chceš klientské komponentě poslat prop `vytvoreno: new Date()`. Projde to přes hranici? Odpověz **ano**, nebo **ne**.

### --expected-- ignore-case

ano

### --why--

`Date` patří mezi hodnoty, které React serializovat umí — stejně jako `Map`,
`Set` nebo obyčejný objekt. Neprojdou funkce, třídy a instance vlastních tříd;
místo funkce se přes hranici posílá serverová akce.

### --see--

next-fullstack/server-a-client-komponenty#co-jde-po-dratu

## --question--

Napiš direktivu, kterou se z obyčejné asynchronní funkce stane serverová akce volatelná z prohlížeče.

### --expected--

```ts
'use server';
```

### --accept--

```ts
"use server"
```

### --why--

Píše se buď na první řádek souboru (pak jsou akce všechny jeho exporty), nebo
na první řádek těla jedné funkce. React z ní na klientovi udělá jen odkaz na
endpoint — proto je to jediná „funkce", která hranicí projde.

### --see--

next-fullstack/data-a-server-actions#serverova-akce-formular-ktery-mluvi-s-databazi

## --question--

Uživatel odešle formulář, akce zapíše nový záznam do databáze a přesměruje zpátky na seznam. Seznam ho ale neukazuje. Napiš jedním slovem, co v akci chybí.

### --expected-- ignore-case

revalidace

### --accept--

updateTag
revalidateTag
zneplatnění cache
zneplatnit cache
updateTag('inzeraty')

### --why--

Zápis do databáze proběhl, jenže stránka čte uloženou kopii. Kopie o zápisu
neví a bude se posílat dál, dokud jí někdo neřekne, že je neplatná.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

## --question--

V čem se liší `updateTag('faktury')` a `revalidateTag('faktury')`?

### --correct--

`updateTag` kopii zahodí hned, `revalidateTag` ještě pustí starou a novou dopočítá na pozadí.

#### --why--

Proto se `updateTag` volá tam, kde má uživatel vidět **svoji vlastní** změnu
ihned po odeslání formuláře. `revalidateTag` stačí, když změna smí dorazit
se zpožděním.

### --answer--

`updateTag` maže jednu značku, `revalidateTag` všechny značky na dané adrese.

#### --why--

Obě funkce pracují se značkou, kterou dostanou jménem. Adresa je parametr úplně
jiné funkce z téhle trojice.

### --answer--

`updateTag` platí jen ve vývoji, `revalidateTag` i v produkci.

#### --why--

Žádná z nich není vývojářská pomůcka. Rozdíl je v tom, co se stane s **už
uloženou kopií** v okamžiku volání.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

## --question--

Která z těchhle věcí **nesmí** být uvnitř funkce s `'use cache'`?

### --answer--

`db.select()` nad veřejnou tabulkou produktů.

#### --why--

Veřejný seznam je pro všechny stejný, a to je přesně ten případ, na který cache
je. Rozhodující je, jestli výsledek závisí na konkrétním požadavku.

### --correct--

`cookies()`.

#### --why--

`cookies()` popisují jeden konkrétní požadavek. Uložená kopie by se pak nabídla
i jinému uživateli — tedy s cizí session. Next.js na to hlásí „Route used
`cookies` inside `use cache`".

### --answer--

`cacheTag('produkty')`.

#### --why--

To je naopak povinná výbava uložené funkce: bez značky ji později nemáš jak
zneplatnit.

### --see--

next-fullstack/data-a-server-actions#ceho-se-cache-nesmi-dotknout

## --question--

Partnerský web si chce z tvé aplikace stahovat ceník jako JSON. Napiš jméno souboru, který ten endpoint obslouží.

### --expected--

route.ts

### --accept--

route.js
route
app/api/cenik/route.ts

### --why--

[[Route handler]] vrací odpověď HTTP místo stránky a exportuje funkce pojmenované
podle metody (`GET`, `POST`). Ve stejné složce nesmí být zároveň `page.tsx` —
jedna adresa nemůže být stránka i endpoint.

### --see--

next-fullstack/app-router#route-handler-kdyz-potrebujes-endpoint
node-zaklady/http-v-node#hlavicky-a-content-type

## --question--

Máš formulář na vlastní stránce, kterým uživatel přidá poznámku. Co pro něj napíšeš?

### --correct--

Serverovou akci. Route handler na to nepotřebuješ.

#### --why--

Akce je funkce, kterou formulář zavolá přímo. Odpadá vymýšlení adresy, ruční
`fetch`, `JSON.stringify` i obsluha `onSubmit` — a formulář funguje i bez
JavaScriptu.

### --answer--

Route handler `POST /api/poznamky` a v komponentě `fetch` s `JSON.stringify`.

#### --why--

Tohle je API pro cizí klienty. Pro vlastní formulář si tím přidáváš vrstvu,
kterou v Nextu nikdo nepotřebuje — a přijdeš o chování bez JavaScriptu.

### --answer--

Route handler, protože akce neumí zapisovat do databáze.

#### --why--

Akce běží na serveru se vším všudy, takže do databáze zapisovat umí. Omezení,
které tu předpokládáš, se týká komponent, ne akcí.

### --see--

next-fullstack/data-a-server-actions#serverova-akce-formular-ktery-mluvi-s-databazi
node-zaklady/http-v-node#telo-pozadavku-je-proud

## --question--

Kdy naopak potřebuješ `route.ts` a serverová akce ti nestačí?

### --correct--

Když odpověď volá klient, který není tvoje stránka — mobilní aplikace, webhook platební brány, RSS.

#### --why--

Akce je navázaná na tvůj React strom. Cizí klient nemá jak ji zavolat,
potřebuje obyčejnou adresu HTTP s metodou a tělem.

### --answer--

Když potřebuješ vrátit stavový kód jiný než 200.

#### --why--

Stav si můžeš vrátit jako součást stavu akce a přesměrování akce zvládne taky.
Rozhodující je něco jiného: **kdo** tu odpověď volá.

### --answer--

Vždycky, když se zapisuje do databáze — akce jsou jen na čtení.

#### --why--

Zápis je hlavní důvod, proč akce existují. Kdyby uměly jen číst, stačila by
serverová komponenta.

### --see--

next-fullstack/app-router#route-handler-kdyz-potrebujes-endpoint
node-zaklady/http-v-node#pozadavek-a-odpoved

## --question--

`proxy.ts` přesměruje každého nepřihlášeného pryč z `/admin`. Stačí to jako ochrana dat?

### --answer--

Ano. Požadavek se do chráněné stránky vůbec nedostane.

#### --why--

Platí to o požadavku na **stránku**. Jenže data se z aplikace dají dostat i jinak
než otevřením stránky v prohlížeči.

### --correct--

Ne. Skutečná kontrola patří tam, kde se data čtou a mění — do stránky, akce a datové vrstvy.

#### --why--

`proxy.ts` je rychlá výhybka, ne ochranka. Serverové akce a route handlery mají
vlastní adresy a útočník je může volat přímo, mimo jakoukoli navigaci.

### --answer--

Ne, protože `proxy.ts` běží až po vykreslení stránky.

#### --why--

Pořadí je opačné, než si myslíš — proto se v něm dá přesměrovat dřív, než se
cokoli vykreslí. Problém není v pořadí, ale v tom, co všechno tou výhybkou projde.

### --see--

next-fullstack/auth-v-nextu#ochrana-stranky-a-akce

## --question--

Napiš, odkud se má v akci číst role uživatele: z **cookie**, z **formuláře**, nebo ze **session** uložené na serveru?

### --expected-- ignore-case

session

### --accept--

ze session
z databáze přes session
databáze

### --why--

Cokoli, co pošle prohlížeč, je jen přání klienta — cookie i skryté pole
ve formuláři si jde přepsat. Roli čti ze session, tedy z databáze. Skrýt
tlačítko v UI je hezké pro uživatele, ale útočníkovi nezabrání v ničem.

### --see--

next-fullstack/auth-v-nextu#role-a-prava

## --question--

Klientská komponenta čte `process.env.API_KLIC` a vyjde z toho `undefined`. Napiš prefix, který musí název proměnné mít, aby ji Next.js vložil i do balíku pro prohlížeč.

### --expected--

NEXT_PUBLIC_

### --accept--

NEXT_PUBLIC

### --why--

Bez prefixu proměnná v prohlížeči neexistuje. To je pojistka, aby se klíč k API
nedostal do balíku omylem. A platí to i obráceně: co ten prefix má, to si každý
přečte ve zdrojovém kódu stránky — klíč k platební bráně tam tedy nedávej.

### --see--

next-fullstack/server-a-client-komponenty#tajemstvi-a-verejne-promenne
node-zaklady/co-je-node#process-program-a-svet-kolem-nej

# --code-- Sbírky pro útulek

## --file-- lib/sbirky.ts

```ts
import 'server-only';

import { desc, eq, sql } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { cookies } from 'next/headers';

import { db } from './db.ts';
import { dary, sbirky } from './schema.ts';

export type Sbirka = typeof sbirky.$inferSelect;

export const nactiSbirky = async () => {
  'use cache';
  cacheLife('hours');
  cacheTag('sbirky');

  return db.select().from(sbirky).orderBy(desc(sbirky.vytvoreno));
};

export const nactiSbirku = async (slug: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag('sbirky');

  const [nalezena] = await db
    .select()
    .from(sbirky)
    .where(eq(sbirky.slug, slug))
    .limit(1);

  return nalezena;
};

export const vybranoCelkem = async (sbirkaId: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag('sbirky');

  const [radek] = await db
    .select({ soucet: sql<number>`coalesce(sum(${dary.castka}), 0)` })
    .from(dary)
    .where(eq(dary.sbirkaId, sbirkaId));

  return radek?.soucet ?? 0;
};

export const mojeDary = async () => {
  'use cache';
  cacheLife('minutes');
  cacheTag('dary');

  const cookieJar = await cookies();
  const darceId = cookieJar.get('darce')?.value ?? '';

  return db.select().from(dary).where(eq(dary.darceId, darceId));
};

export const ulozDar = async (sbirkaId: string, darceId: string, castka: number) => {
  await db.insert(dary).values({
    id: crypto.randomUUID(),
    sbirkaId,
    darceId,
    castka,
    vytvoreno: new Date(),
  });
};
```

## --file-- app/sbirky/[slug]/page.tsx

```tsx
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { nactiSbirku, ulozDar, vybranoCelkem } from '@/lib/sbirky.ts';
import { MojeDary } from './MojeDary.tsx';

type Props = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const sbirka = await nactiSbirku(slug);

  return { title: sbirka ? sbirka.nazev : 'Sbírka nenalezena' };
};

export default async function StrankaSbirky({ params }: Props) {
  const { slug } = await params;
  const sbirka = await nactiSbirku(slug);
  if (!sbirka) notFound();

  const vybrano = await vybranoCelkem(sbirka.id);

  const prispej = async (formData: FormData) => {
    'use server';

    const castka = Number(formData.get('castka'));
    const darce = String(formData.get('darce') ?? '');

    await ulozDar(sbirka.id, darce, castka);
  };

  return (
    <main>
      <h1>{sbirka.nazev}</h1>
      <p>
        Vybráno {vybrano} Kč z {sbirka.cil} Kč
      </p>

      <form action={prispej}>
        <input type="hidden" name="darce" value={sbirka.spravceId} />
        <label>
          Částka v Kč
          <input name="castka" type="number" min="1" required />
        </label>
        <button type="submit">Přispět</button>
      </form>

      <Suspense fallback={<p>Načítám tvoje dary…</p>}>
        <MojeDary />
      </Suspense>
    </main>
  );
}
```

## --question--

Jedna z funkcí v `lib/sbirky.ts` nesmí mít `'use cache'`. Napiš její název.

### --expected-- ignore-case

mojeDary

### --accept--

mojeDary()
funkce mojeDary

### --why--

`mojeDary` čte `cookies()`, tedy údaj o jednom konkrétním požadavku. Uložená
kopie by se nabídla i dalšímu uživateli a ten by viděl cizí dary. Next.js to
zastaví hláškou „Route used `cookies` inside `use cache`" — a kdyby ne, byla by
z toho tichá díra.

### --see--

next-fullstack/data-a-server-actions#ceho-se-cache-nesmi-dotknout

## --question--

Uživatel přispěje 500 Kč a stránka se překreslí. Co uvidí v řádku „Vybráno … Kč"?

### --answer--

Novou částku, protože se stránka po odeslání formuláře načte znovu.

#### --why--

Znovunačtení stránky samo o sobě nestačí — součet se nebere z databáze
a to místo, odkud se bere, o zápisu nemá jak vědět.

### --correct--

Starou částku, protože akce nezneplatnila značku `sbirky`.

#### --why--

`vybranoCelkem` má `'use cache'` a `cacheTag('sbirky')`. Dokud akce nezavolá
`updateTag('sbirky')`, dostane stránka uloženou kopii spočítanou před zápisem.

### --answer--

Nulu, protože `'use cache'` vrací po zápisu prázdný výsledek.

#### --why--

Cache se při zápisu nemaže ani nevyprazdňuje — to je právě ta potíž. Vrátí
přesně tu hodnotu, kterou si uložila naposledy.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

## --question--

V akci `prispej` je bezpečnostní chyba. Která odpověď ji popisuje?

### --correct--

Identita dárce se bere ze skrytého pole formuláře, takže si ji kdokoli přepíše.

#### --why--

Skryté pole je jen text v HTML — v DevTools se změní za dvě vteřiny. Kdo dar
poslal, musí akce zjistit ze session na serveru, ne z toho, co jí přijde
ve `FormData`.

### --answer--

`Number(formData.get('castka'))` může vyjít `NaN`.

#### --why--

Chybějící validace je skutečná vada, ale databázi ani cizí data tím nikdo
nezneužije. Hledá se chyba, kterou útočník obrátí ve svůj prospěch.

### --answer--

Akce je definovaná uvnitř komponenty, takže je dostupná z prohlížeče.

#### --why--

Dostupnost z prohlížeče je smysl každé serverové akce, ať je napsaná kdekoli.
Nebezpečné není to, že jde zavolat, ale čemu uvnitř věří.

### --see--

next-fullstack/auth-v-nextu#ochrana-stranky-a-akce

## --question--

Napiš název funkce z `next/cache`, kterou je potřeba doplnit do akce `prispej` hned za `ulozDar`, aby dárce viděl svůj příspěvek okamžitě.

### --expected-- ignore-case

updateTag

### --accept--

updateTag('sbirky')
updateTag("sbirky")

### --why--

`updateTag('sbirky')` zahodí kopii obou uložených funkcí najednou, protože
`nactiSbirku` i `vybranoCelkem` mají stejnou značku. `revalidateTag` by tu
nestačil — ten by dárci ještě jednou ukázal starý součet.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna
