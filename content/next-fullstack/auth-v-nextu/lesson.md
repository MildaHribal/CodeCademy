# Přihlášení v Next.js

Jakmile má aplikace vlastní data, potřebuje vědět, kdo je za obrazovkou. Přihlášení
si dnes nepíšeš od nuly — hashování hesel, tokeny a session dělá knihovna. Tvoje
práce začíná tam, kde knihovna končí: **rozhodnout, kdo co smí**. A přesně tam se
dělá většina bezpečnostních chyb.

:::check pretest
Přesměruješ nepřihlášené pryč ze `/admin` v souboru `proxy.ts`. Kolik procent své administrace máš podle tebe zabezpečených? Napiš číslo.

### --expected--
0

### --accept--
nula
0 %
málo

### --why--
Proxy hlídá adresy stránek. Data se čtou a mění i mimo ně — endpointem serverové
akce, route handlerem. Skutečná ochrana je u dat, ne u adres.
:::

:::check pretest
Co myslíš, že se stane, když se v kontrole oprávnění porovná `inzerat.autorId === session?.user?.id` a obě strany jsou `undefined`?

### --answer--
Porovnání `undefined` s `undefined` vyhodí chybu.

#### --why--
`undefined` se porovnávat dá jako cokoli jiného. Chyba by tu aspoň byla vidět —
tenhle problém je tichý.

### --correct--
Vyjde `true`, takže kontrola pustí dál někoho, kdo neměl projít.
:::

## Problém: „přihlášení mám, bezpečné to není"

Takhle vypadá typická první verze. Vypadá rozumně a je děravá:

```ts
// proxy.ts — jediná ochrana v celé aplikaci
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.redirect(new URL('/prihlaseni', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
```

Stránka `/admin/inzeraty` je opravdu schovaná. Ale serverová akce `smazInzerat`,
kterou ta stránka používá, je samostatný endpoint metodou POST — a `matcher`
na `/admin/…` na něj nesedí. Útočník ho zavolá přímo.

> [!REMEMBER]
> **Ověření (kdo jsi) dělá knihovna, autorizaci (co smíš) děláš ty — u dat.**
> Proxy je rychlá výhybka pro pohodlí uživatele, ne zámek.

:::check
Napiš, kde má být kontrola oprávnění, aby platila i pro volání mimo tvoje stránky.

### --expected--
v akci

### --accept--
v serverové akci
v datové vrstvě
u dat
v akci a v datové vrstvě

### --why--
Endpoint akce a route handler se dají zavolat bez otevření stránky. Jediné místo,
kterým projde každé čtení i každý zápis, je datová vrstva a akce nad ní.
:::

## Co za tebe udělá knihovna

V téhle lekci používáme **Better Auth**: běží na tvém serveru, ukládá uživatele
do tvojí databáze a umí e-mail s heslem i přihlášení přes Google nebo GitHub.
Potřebuje od tebe tři soubory.

**1. Nastavení** — jediné místo, kde se rozhoduje, jak se lidé přihlašují:

```ts
// lib/auth.ts
import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],      // aby šlo přihlásit i ze serverové akce
});
```

**2. Route handler**, na který posílá formuláře knihovní klient:

```ts
// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

**3. Klient** pro tlačítka „Přihlásit se" a „Odhlásit se" v prohlížeči:

```ts
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();
```

Tabulky uživatelů, session a účtů si knihovna vygeneruje do tvého schématu; pustíš
na ně migraci jako na cokoli jiného.

> [!NOTE]
> Jiné knihovny (Auth.js, Clerk, Supabase Auth) mají jiná jména funkcí, ale stejné
> tři části: nastavení, endpoint, klient. Co se naučíš tady, přeložíš do kterékoli
> z nich za půl hodiny.

:::check
Do kterého z těch tří souborů patří `import 'server-only'`?

### --expected--
lib/auth.ts

### --accept--
do nastavení
auth.ts
lib/auth.ts, tedy nastavení

### --why--
Nastavení sahá na databázi a na tajné klíče. `server-only` zajistí, že build
spadne, kdyby si ten soubor naimportoval klientský kód — dřív, než se dostane
do produkce.
:::

## Session na serveru

Ať děláš cokoli, začátek je pořád stejný: zeptat se, kdo posílá tenhle požadavek.
Knihovna si přečte cookie z hlaviček a ověří ji proti databázi.

```ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const session = await auth.api.getSession({ headers: await headers() });
// session === null  → nepřihlášený
// session.user.id, session.user.email, session.user.role
```

Funguje to stejně v serverové komponentě, v serverové akci i v route handleru.
Všimni si `await headers()` — hlavičky jsou v Next.js slib, stejně jako `params`.

> [!TIP]
> Zabal to do vlastní funkce `vyzadujUzivatele()`, která buď vrátí uživatele, nebo
> rovnou přesměruje. Kontrola se pak píše na jeden řádek a nedá se zapomenout půlka.

```ts
// lib/session.ts
import { redirect } from 'next/navigation';

export async function vyzadujUzivatele() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/prihlaseni');
  return session.user;
}
```

:::check
Proč se u `headers()` píše `await`?

### --expected--
protože vrací Promise

### --accept--
je to Promise
hlavičky jsou slib
vrací slib

### --why--
Od Next.js 15 jsou `headers()`, `cookies()`, `params` i `searchParams` sliby —
díky tomu může Next.js vykreslit zbytek stránky dřív, než se k nim dostane.
:::

## Ochrana stránky a akce

Teď to hlavní. Jsou tři místa, kde se kontroluje, a každé má jinou roli:

| kde | co tam patří | co se stane, když to vynecháš |
|---|---|---|
| `proxy.ts` | rychlé přesměrování nepřihlášeného pryč | uživatel uvidí prázdnou stránku místo přihlášení |
| stránka | „co má tenhle uživatel vidět" | zobrazí se cizí data |
| **akce a datová vrstva** | „smí tenhle uživatel zrovna tohle" | **kdokoli může změnit cokoli** |

Poslední řádek je ten, na kterém záleží. Ochrana stránky:

```tsx
// app/moje-inzeraty/page.tsx
export default async function MojeInzeraty() {
  const uzivatel = await vyzadujUzivatele();
  const polozky = await ctiInzeratyAutora(uzivatel.id);   // dotaz filtruje podle id ze session
  return <SeznamInzeratu polozky={polozky} />;
}
```

A ochrana akce, kde jsou potřeba **dva** kroky — přihlášení a vlastnictví:

```ts
'use server';

export async function smazInzerat(formData: FormData) {
  const uzivatel = await vyzadujUzivatele();

  const id = Number(formData.get('id'));
  const inzerat = await ctiInzerat(id);
  if (!inzerat) return { chyba: 'Inzerát neexistuje.' };
  if (inzerat.autorId !== uzivatel.id) return { chyba: 'Tenhle inzerát není tvůj.' };

  await db.delete(inzeraty).where(eq(inzeraty.id, id));
  updateTag('inzeraty');
}
```

A tady je ta tichá past, na kterou se ptal pretest:

:::live js predict
```js
const session = null;                                  // nepřihlášený návštěvník
const inzerat = { id: 7, nazev: 'Stan pro dva' };      // starý záznam bez autora

console.log(inzerat.autorId === session?.user?.id ? 'smí mazat' : 'nesmí mazat');
```
--question-- Co vypíše `console.log`?
--expected-- smí mazat
--why-- Obě strany jsou `undefined` a `undefined === undefined` je `true`. Kontrola tak pustí dál nepřihlášeného návštěvníka u záznamu, kterému chybí autor. Proto se nejdřív ověří, že session existuje (a skončí se, když ne), a teprve potom se porovnávají id.
:::

Zkus doplnit `autorId: 'eva'` do objektu `inzerat` a sleduj, jak se výsledek změní —
past se objeví jen u dat, která nikdo nečekal.

> [!PITFALL]
> Kontrolu **nikdy nestav jen na porovnání dvou hodnot, které můžou obě chybět.**
> Nejdřív `if (!uzivatel) …` a `if (!inzerat) …`, teprve pak porovnání. Chybějící
> hodnoty se rovnají sobě navzájem a tvoje podmínka se tváří spokojeně.

:::check
Akce načte session a zkontroluje, že uživatel je přihlášený. Co dalšího musí ověřit, než smaže záznam podle `id` z formuláře?

### --expected--
že záznam patří jemu

### --accept--
vlastníka
že je autorem
že mu ten záznam patří

### --why--
Přihlášený je každý registrovaný uživatel. Mezi „je to někdo" a „smí zrovna tohle"
je rozdíl mezi bezpečnou a děravou aplikací.
:::

## Role a práva

Jakmile má aplikace admina, přibude druhá otázka: nejen „je to jeho?", ale i „má
na to roli?". Nejjednodušší rozumný model je sloupec `role` u uživatele a jedna
funkce, která rozhoduje:

```ts
// lib/prava.ts
export function smiUpravit(uzivatel, inzerat) {
  if (!uzivatel || !inzerat) return false;
  if (uzivatel.role === 'admin') return true;
  return inzerat.autorId === uzivatel.id;
}
```

Je to obyčejná čistá funkce: dostane uživatele a záznam, vrátí `true` nebo `false`.
Tím pádem se dá **otestovat bez databáze a bez Next.js** — a hlavně je pravidlo
na jednom místě. Když ho za půl roku budeš měnit, měníš ho jednou.

```ts
if (!smiUpravit(uzivatel, inzerat)) return { chyba: 'Na tohle nemáš právo.' };
```

> [!PITFALL]
> Role uložená v cookie, v `localStorage` nebo poslaná ve formuláři je jen
> ==přání klienta==. Roli čti vždycky z databáze přes session. Skrýt tlačítko
> v UI je hezké pro uživatele, ale útočníkovi nezabrání v ničem.

Tenhle model stačí na drtivou většinu aplikací. Až na něj bude malý (role podle
týmu, pozvánky, práva na jednotlivé záznamy), sáhneš po připraveném řešení —
Better Auth má na to zásuvné moduly `admin` a `organization`.

:::explain
Vysvětli vlastními slovy, proč nestačí schovat tlačítko „Smazat" před uživatelem, který na mazání nemá právo.

## --model--
Skryté tlačítko je jen vzhled stránky. Mazání dělá endpoint serverové akce a ten
se dá zavolat i bez mé stránky — obyčejným POST požadavkem s jakýmkoli `id`. Všechno,
co přijde z prohlížeče, si může útočník vymyslet, včetně role a cizího id. Skrývání
tlačítka je proto pohodlí pro uživatele, ne ochrana. Skutečné rozhodnutí musí padnout
na serveru: načíst session, načíst dotčený záznam a teprve pak porovnat práva.

## --checklist--
- Endpoint akce jde zavolat i bez mojí stránky, takže UI nic nechrání.
- Všechno, co přijde od klienta (id, role), se dá podvrhnout.
- Rozhoduje se na serveru ze session a z načteného záznamu.
- Skrytí tlačítka je pohodlí pro uživatele, ne bezpečnostní opatření.
:::

:::check
Uživatel si v DevTools přepíše v `localStorage` hodnotu `role` na `admin`. Co to udělá se serverovou kontrolou?

### --expected--
nic

### --accept--
vůbec nic
nic, server čte roli z databáze

### --why--
Server roli čte ze session, tedy z vlastní databáze. Co si klient napíše k sobě,
na rozhodnutí serveru nemá vliv — proto se role nikdy nepřenáší z prohlížeče.
:::

## Odhlášení a stav v prohlížeči

Přihlášení a odhlášení jsou jediná místa, kde potřebuješ klienta:

```tsx
'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function TlacitkoOdhlasit() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.refresh();          // ať se serverové komponenty přečtou znovu
      }}
    >
      Odhlásit se
    </button>
  );
}
```

`router.refresh()` je důležitý: bez něj by hlavička dál ukazovala jméno
odhlášeného uživatele, protože ji vykreslil server a nikdo mu neřekl, že se něco
změnilo.

Jméno přihlášeného do hlavičky **nečti v prohlížeči**. Přečti ho v serverovém
layoutu ze session a pošli dolů jako prop — stránka pak nebliká a v HTML je rovnou
správný obsah.

:::check
Po odhlášení zůstane v hlavičce jméno uživatele. Napiš volání, které to opraví.

### --expected--
router.refresh()

### --accept--
refresh()
router.refresh

### --why--
Hlavičku vykreslil server. Odhlášení se stalo v prohlížeči, takže si serverovou
část musíš vyžádat znovu — jinak koukáš na starý výsledek.
:::

## Typické chyby a pasti

> [!PITFALL] Ochrana jen v `proxy.ts`
> Proxy sedí na adresách stránek. Serverové akce a route handlery jí projdou bokem.
> **Oprava:** kontrolu dej do akce a do datové vrstvy; proxy si nech na přesměrování
> nepřihlášených, aby nekoukali na prázdno.

> [!PITFALL] `session.user.id` spadne na `Cannot read properties of null`
> `getSession` vrací `null`, když přihlášení není. **Oprava:** nejdřív
> `if (!session) …`, teprve pak sahej na `user`. Optional chaining (`session?.user`)
> chybu skryje, ale vyrobí tu horší past s `undefined === undefined`.

> [!PITFALL] Vlastník bere z formuláře
> `autorId: formData.get('autorId')` je pozvánka k podvržení. **Oprava:** identita
> vždycky ze session, nikdy z těla požadavku.

> [!PITFALL] Kontrola práv rozkopírovaná po komponentách
> Když je pravidlo na pěti místech, jedno z nich bude za rok jiné. **Oprava:**
> jedna čistá funkce (`smiUpravit`) s testy, kterou volají všechna místa.

> [!PITFALL] Chyba přihlášení prozradí, co existuje
> „Uživatel neexistuje" versus „Špatné heslo" říká útočníkovi, které e-maily jsou
> registrované. **Oprava:** jedna společná hláška („Nesprávný e-mail nebo heslo.")
> pro oba případy.

:::check
Dotaz na vlastní inzeráty zní `where(eq(inzeraty.autorId, autorId))`, kde `autorId` přišel ze `searchParams`. Napiš, odkud ho vzít správně.

### --expected--
ze session

### --accept--
session
z přihlášené session
ze session na serveru

### --why--
Kdyby id přicházelo z adresy, stačí ho v adresním řádku přepsat a uvidíš cizí
inzeráty. Identita patří ze session, kterou ověřuje server.
:::

## Kde to najdeš v MDN

- [Cookies (HTTP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) —
  co znamená `HttpOnly`, `Secure` a `SameSite`; přesně tyhle atributy nastavuje
  knihovna u session cookie za tebe.
- [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) —
  hlavička, kterou se session dostane do prohlížeče; uvidíš ji v DevTools na kartě Network.
- [Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
  a [401 vs. 403](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403) — rozdíl
  mezi „nevím, kdo jsi" a „vím, a nesmíš".
- [Cross-site request forgery](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF) —
  proti čemu chrání `SameSite` a proč se změny posílají metodou POST.

> [!NOTE]
> Nastavení Better Auth pro Next.js je na
> [better-auth.com/docs/integrations/next](https://www.better-auth.com/docs/integrations/next).
> Až budeš potřebovat role podle týmů nebo pozvánky, hledej v dokumentaci
> zásuvné moduly `admin` a `organization`.

# --questions--

## --question--

Napiš volání, kterým v serverové komponentě zjistíš přihlášeného uživatele
(bez `await` u celého výrazu stačí jméno metody).

### --expected--

auth.api.getSession

### --accept--

getSession
auth.api.getSession({ headers: await headers() })

### --why--

`getSession` si přečte session cookie z hlaviček a ověří ji proti databázi.
Funguje stejně v serverové komponentě, v akci i v route handleru — hlavičky se
předávají z `await headers()`.

### --see--

next-fullstack/auth-v-nextu#session-na-serveru

## --question--

Proč je kontrola oprávnění jen v `proxy.ts` nedostatečná?

### --answer--

Protože `proxy.ts` běží na edge runtime, kde není databáze.

#### --why--

Runtime tu nehraje roli — `proxy.ts` v Next.js 16 běží v Node a k databázi se
dostane. Problém je v tom, na co proxy vůbec sedí.

### --correct--

Protože se vztahuje na adresy stránek, ale serverové akce a route handlery mají
vlastní adresy mimo `matcher`.

#### --why--

Endpoint serverové akce se dá zavolat přímo metodou POST. Proto autorizace patří
do akce a do datové vrstvy, kudy projde každý zápis.

### --answer--

Protože proxy neumí číst cookie, a tedy ani session.

#### --why--

Cookie číst umí a session si ověřit může. Kontrola tam není zbytečná — jen sama
o sobě nestačí.

### --see--

next-fullstack/auth-v-nextu#ochrana-stranky-a-akce

## --question--

Funkce `smiUpravit(uzivatel, inzerat)` má pustit admina a autora záznamu.
Napiš první podmínku, kterou v ní chceš mít, aby nevznikla past s `undefined`.

### --expected--

if (!uzivatel || !inzerat) return false

### --accept--

!uzivatel || !inzerat
kontrola, že uzivatel i inzerat existují

### --why--

Když obě hodnoty chybí, porovnání `inzerat.autorId === uzivatel.id` vyjde
`undefined === undefined`, tedy `true`. Chybějící vstupy se proto odmítají
hned na začátku.

### --see--

next-fullstack/auth-v-nextu#role-a-prava

## --question--

Uživatel se odhlásil, ale hlavička pořád ukazuje jeho jméno. Napiš volání,
které to v klientské komponentě opraví.

### --expected--

router.refresh()

### --accept--

refresh()
router.refresh

### --why--

Hlavičku vykreslil server ze session. Odhlášení proběhlo v prohlížeči, takže
je potřeba si serverovou část vyžádat znovu — `router.refresh()` přesně to dělá,
a přitom nezahodí stav klientských komponent.

### --see--

next-fullstack/auth-v-nextu#odhlaseni-a-stav-v-prohlizeci
