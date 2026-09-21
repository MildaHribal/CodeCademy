# Data a server actions

Tohle je ta část Next.js, kvůli které se do něj chodí z čistého Reactu. Stránka si
data přečte rovnou z databáze a formulář je změní — a mezi tím není žádné API,
žádný `useEffect`, žádný stav „načítám". Zároveň je to místo, kde se dá nejsnáz
udělat bezpečnostní díra, takže půlka lekce je o tom, jak si ji neudělat.

:::check pretest
Ve Vite SPA potřebuješ vypsat seznam inzerátů z databáze. Kolik vrstev mezi stránkou a databází musíš napsat? Napiš číslo.

### --expected--
2

### --accept--
dvě
2 vrstvy
tři
3

### --why--
Nejmíň dvě: endpoint na serveru a `fetch` s načítáním v komponentě. V Next.js
obě zmizí — komponenta si data přečte přímo.
:::

:::check pretest
Co myslíš, že se stane, když formulář zavolá serverovou akci, ta zapíše nový inzerát do databáze a stránka se hned překreslí?

### --answer--
Uživatel uvidí nový inzerát, data se přece změnila.

#### --why--
Data v databázi ano. Jenže stránka nemusí číst z databáze — může číst z uložené
kopie, kterou si Next.js schoval, aby byl web rychlý.

### --correct--
Může vidět pořád starý seznam, dokud akce neřekne, že je uložená kopie neplatná.
:::

## Problém: API, které nikdo nepotřebuje

Takhle vypadá „načti seznam" ve Vite SPA. Endpoint, klient, tři stavy, efekt:

```jsx
// 1) server: app.get('/api/inzeraty', …)
// 2) klient:
const [inzeraty, setInzeraty] = useState([]);
const [nacitam, setNacitam] = useState(true);
const [chyba, setChyba] = useState(null);

useEffect(() => {
  fetch('/api/inzeraty')
    .then((r) => r.json())
    .then(setInzeraty)
    .catch(setChyba)
    .finally(() => setNacitam(false));
}, []);
```

A takhle v serverové komponentě:

```tsx
const inzeraty = await db.query.inzeraty.findMany();
```

Rozdíl není v počtu řádků. Je v tom, že prostřední vrstva **neexistuje**: není co
zabezpečovat, není co verzovat, není kde se rozejít s frontendem.

> [!REMEMBER]
> **Serverová komponenta čte data přímo, serverová akce je mění.** Vlastní API
> (`route.ts`) píšeš až pro klienty, kteří nejsou tvoje stránka — mobilní aplikaci,
> webhook, partnerský web.

:::check
Napiš jméno hooku, který v Next.js pro načtení seznamu ze serveru nepotřebuješ.

### --expected--
useEffect

### --accept--
useState
useEffect ani useState

### --why--
Serverová komponenta počká na data přímo v těle a vykreslí se až s nimi.
Nepotřebuje ani `useEffect`, ani stav „načítám".
:::

## Data v serverové komponentě

Dotaz do databáze píšeš v Next.js stejně, jako bys ho psal v Node — tady s Drizzlem,
který znáš z TypeScriptu:

```tsx
// app/inzeraty/page.tsx
import { db } from '@/lib/db';
import { inzeraty } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export default async function SeznamInzeratu() {
  const polozky = await db
    .select()
    .from(inzeraty)
    .orderBy(desc(inzeraty.vytvoreno))
    .limit(20);

  return (
    <ul>
      {polozky.map((inzerat) => (
        <li key={inzerat.id}>
          {inzerat.nazev} — {inzerat.cena} Kč
        </li>
      ))}
    </ul>
  );
}
```

Dotazy si dávej do zvláštního modulu (`lib/data.ts`), ne přímo do stránky. Získáš
tím tři věci: dotaz se dá použít na víc místech, dá se otestovat bez Next.js —
a je jedno místo, kam přidat kontrolu oprávnění.

> [!TIP]
> Když tentýž dotaz potřebuje layout i stránka, obal ho do `cache()` z Reactu.
> Během jednoho požadavku se pak provede jednou, i když ho zavoláš třikrát.

:::check
Proč se dotaz do databáze nepíše přímo do `page.tsx`, ale do modulu `lib/data.ts`?

### --answer--
Protože v `page.tsx` by se spustil v prohlížeči.

#### --why--
Myslíš si, že `page.tsx` jde do prohlížeče? Nejde — je to serverová komponenta
a její kód se nikam neposílá. Důvod je v údržbě, ne v bezpečnosti kódu.

### --correct--
Aby šel použít na víc místech, dal se otestovat a měl jedno místo pro kontrolu práv.

#### --why--
Datová vrstva na jednom místě je i jediné rozumné místo, kam napsat „tenhle
uživatel smí vidět jen svoje". Rozkopírovaná kontrola se vždycky někde zapomene.
:::

## Serverová akce: formulář, který mluví s databází

[[Serverová akce]] je asynchronní funkce označená `'use server'`. Smí ji zavolat
formulář nebo obsluha události z prohlížeče, ale její tělo běží **jen na serveru**.

```ts
// app/inzeraty/akce.ts
'use server';

import { db } from '@/lib/db';
import { inzeraty } from '@/lib/schema';

export async function vytvorInzerat(formData: FormData) {
  const nazev = String(formData.get('nazev') ?? '');
  const cena = Number(formData.get('cena'));

  await db.insert(inzeraty).values({ nazev, cena });
}
```

A formulář, který ji zavolá — všimni si, že tohle je obyčejná serverová komponenta,
žádný `onSubmit`, žádný `fetch`:

```tsx
import { vytvorInzerat } from './akce';

export function FormularInzeratu() {
  return (
    <form action={vytvorInzerat}>
      <input name="nazev" required />
      <input name="cena" type="number" required />
      <button type="submit">Přidat inzerát</button>
    </form>
  );
}
```

Co se stane po kliknutí: prohlížeč pošle `FormData` metodou POST, server funkci
spustí a vrátí **jednou odpovědí** i novou verzi stránky. Když JavaScript ještě
není načtený, formulář se odešle postaru — a funguje to.

> [!REMEMBER]
> **Ze serverové akce Next.js udělá veřejný endpoint.** Do prohlížeče se pošle
> jen její adresa; tělo funkce nikoli. Ale tu adresu může kdokoli zavolat ručně,
> s jakýmikoli daty.

:::check
Napiš direktivu (i s uvozovkami), kterou označíš soubor se serverovými akcemi.

### --expected--
'use server'

### --accept--
"use server"
'use server';

### --why--
Na prvním řádku souboru označí všechny jeho exporty za serverové funkce. Dá se
napsat i dovnitř jedné `async` funkce, když akci potřebuješ jen na jednom místě.
:::

## Validace a autorizace v každé akci

Předchozí ukázka je zároveň učebnicová díra. Zkus si přečíst, co všechno v ní
chybí, než budeš číst dál:

```ts
export async function smazInzerat(formData: FormData) {
  const id = Number(formData.get('id'));
  await db.delete(inzeraty).where(eq(inzeraty.id, id));    // ← kdokoli, cokoli
}
```

Útočník nepotřebuje tvůj formulář. Pošle POST přímo na endpoint akce s cizím `id`
a smaže inzerát, který mu nepatří. **Formulář v prohlížeči není ochrana**, je to
jen nejpohodlnější způsob, jak akci zavolat.

Každá akce proto potřebuje tři kroky ve stejném pořadí:

1. **Kdo to je.** Načti session na serveru. Bez přihlášení konec.
2. **Jsou data platná.** Rozparsuj vstup schématem (Zod), ne ručními `if`.
3. **Smí to udělat?** Načti dotčený záznam a porovnej vlastníka nebo roli.

```ts
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const Inzerat = z.object({
  nazev: z.string().trim().min(3, 'Název musí mít aspoň 3 znaky.').max(80),
  cena: z.coerce.number('Cena musí být číslo.').int().positive('Cena musí být kladná.'),
});

export async function vytvorInzerat(_stav: unknown, formData: FormData) {
  // 1. kdo to je
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { chyba: 'Musíš být přihlášený.' };

  // 2. platná data
  const vysledek = Inzerat.safeParse(Object.fromEntries(formData));
  if (!vysledek.success) {
    return { chybyPoli: z.flattenError(vysledek.error).fieldErrors };
  }

  // 3. teprve teď se zapisuje
  await db.insert(inzeraty).values({ ...vysledek.data, autorId: session.user.id });
  return { ok: true };
}
```

Všimni si, že `autorId` se bere ze session, **ne z formuláře**. Co přijde od klienta,
o vlastnictví nerozhoduje — jinak si ho útočník nastaví sám.

> [!PITFALL]
> Kontrola v `proxy.ts` (dřív `middleware.ts`) tohle neřeší. Proxy rozhoduje
> o adresách stránek; endpoint serverové akce se dá zavolat bez nich. **Autorizace
> patří do akce a do datové vrstvy**, kde se opravdu čte a zapisuje.

:::check
Proč se `autorId` nesmí vzít z `formData`, i když ho tam formulář poctivě posílá?

### --expected--
protože ho klient může změnit

### --accept--
klient si ho nastaví sám
data od klienta se dají podvrhnout
přijde z prohlížeče, takže se mu nedá věřit

### --why--
Endpoint akce zavolá kdokoli s jakýmkoli tělem. Identita smí pocházet jen ze
session, kterou server ověří sám.
:::

## Stav akce v UI

Když chceš uživateli ukázat chyby od serveru a stav odesílání, sáhneš po hooku
`useActionState` v klientské komponentě. Vrací trojici: poslední výsledek akce,
funkci, kterou dáš do `action`, a příznak čekání.

```tsx
'use client';

import { useActionState } from 'react';
import { vytvorInzerat } from './akce';

export function FormularInzeratu() {
  const [stav, akce, ceka] = useActionState(vytvorInzerat, {});

  return (
    <form action={akce}>
      <input name="nazev" aria-invalid={Boolean(stav.chybyPoli?.nazev)} />
      {stav.chybyPoli?.nazev && <p role="alert">{stav.chybyPoli.nazev[0]}</p>}
      <button disabled={ceka}>{ceka ? 'Ukládám…' : 'Přidat inzerát'}</button>
    </form>
  );
}
```

Proto má akce v předchozí ukázce první parametr `_stav`: `useActionState` do něj
posílá předchozí výsledek. Celý tenhle formulář si za chvíli postavíš ve workshopu
[Formulář, který mluví se serverem](see:next-fullstack/workshop-formular-akce/001),
takže tady stačí vědět, že to jde.

:::check
Co je druhá hodnota, kterou vrací `useActionState`?

### --answer--
Původní akce, kterou jsi hooku předal.

#### --why--
Kdyby to byla ta samá funkce, hook by neměl co dělat. Vrací její obalenou verzi,
která navíc hlídá stav a předává předchozí výsledek.

### --correct--
Obalená akce, kterou dáš do `action` formuláře.

#### --why--
Ta obálka si pamatuje poslední výsledek, posílá ho akci jako první parametr
a přepíná příznak čekání.

### --answer--
Funkce, která formulář vyresetuje.

#### --why--
Reset formuláře `useActionState` neřeší. React ho u úspěšného odeslání
přes `action` udělá sám.
:::

## Revalidace: řekni cache, že je neplatná

Next.js si výsledky schovává, aby byl web rychlý. Uložit se dá výsledek funkce
i celá komponenta — direktivou `'use cache'` s dobou platnosti a značkou:

```ts
import { cacheLife, cacheTag } from 'next/cache';

export async function ctiInzeraty() {
  'use cache';
  cacheLife('hours');       // jak dlouho je kopie platná
  cacheTag('inzeraty');     // jméno, kterým ji půjde zneplatnit

  return db.select().from(inzeraty).orderBy(desc(inzeraty.vytvoreno));
}
```

A teď ta past, kterou pretest naznačil. Uložená kopie o zápisu do databáze neví:

:::live js predict
```js
const cache = new Map();

function ctiInzeraty(databaze) {
  if (!cache.has('inzeraty')) cache.set('inzeraty', [...databaze]);
  return cache.get('inzeraty');
}

const databaze = ['Kolo Author', 'Stan pro dva'];
ctiInzeraty(databaze);
databaze.push('Lyže Atomic');

console.log(ctiInzeraty(databaze).length);
```
--question-- Co vypíše `console.log`?
--expected-- 2
--why-- Kopie vznikla před zápisem a nikdo ji o změně neinformoval. Přesně takhle se chová cache v Next.js: uživatel po odeslání formuláře vidí starý seznam, dokud akce neřekne, že je kopie neplatná. V ukázce by to udělal `cache.delete('inzeraty')`, v Next.js `updateTag('inzeraty')`.
:::

Zkus na konec přidat `cache.delete('inzeraty')` před poslední řádek a sleduj,
jak se číslo změní.

[[Revalidace]] je právě tohle „kopie je neplatná". Máš na ni tři nástroje:

| funkce | co udělá | kdy ji použít |
|---|---|---|
| `updateTag('inzeraty')` | kopii **hned** zahodí | uživatel má vidět vlastní změnu ihned (jen v akci) |
| `revalidateTag('inzeraty')` | pustí starou kopii a novou dopočítá na pozadí | změna smí dorazit se zpožděním |
| `revalidatePath('/inzeraty')` | zneplatní všechno na dané adrese | když nevíš, jaké značky tam jsou |

[[Značka cache]] je jen text, který si vymyslíš. Stejnou značku můžeš dát víc
funkcím a jedním voláním zneplatnit všechny.

:::memory
```js
const inzeraty = await ctiInzeraty();
await db.insert(inzeraty).values(novy);
updateTag('inzeraty');
```
--step-- 1 | první čtení uloží kopii pod značku „inzeraty"
db -> @db
cache -> @cache
@db: [Kolo Author, Stan pro dva]
@cache: { inzeraty: @kopie }
@kopie: [Kolo Author, Stan pro dva]
--step-- 2 | zápis změní databázi, kopie o tom neví
db -> @db
cache -> @cache
@db: [Kolo Author, Stan pro dva, Lyže Atomic]
@cache: { inzeraty: @kopie }
@kopie: [Kolo Author, Stan pro dva]
--step-- 3 | updateTag kopii zahodí, další čtení ji vyrobí znovu
db -> @db
cache -> @cache
@db: [Kolo Author, Stan pro dva, Lyže Atomic]
@cache: { }
:::

Hotová akce tedy končí revalidací a často i přesměrováním:

```ts
await db.insert(inzeraty).values({ ...vysledek.data, autorId: session.user.id });

updateTag('inzeraty');
redirect('/inzeraty');        // vyhodí výjimku, kód za tím se neprovede
```

:::check
Uživatel přidal inzerát a po přesměrování ho v seznamu nevidí. Napiš, co v akci chybí.

### --expected--
revalidace

### --accept--
updateTag
revalidateTag
zneplatnění cache
updateTag('inzeraty')

### --why--
Zápis do databáze proběhl, ale stránka čte z uložené kopie. Dokud jí někdo neřekne,
že je neplatná, bude ji posílat dál.
:::

## Čeho se cache nesmí dotknout

Uložit se smí jen to, co je **stejné pro všechny a nezávisí na požadavku**. Jakmile
se data liší podle uživatele, cache je nejen zbytečná, ale nebezpečná — jednomu
uživateli by se mohl ukázat obsah druhého.

Do `'use cache'` proto nepatří:

- `cookies()` a `headers()` — údaje o tomhle jednom požadavku,
- session a cokoli odvozeného od přihlášeného uživatele,
- `Date.now()`, `Math.random()`, `crypto.randomUUID()`,
- výsledky, které mají být pokaždé čerstvé (zůstatek, volné kapacity).

Takové části stránky patří do `<Suspense>` a dostřelí se až při požadavku —
to už znáš jako [streamování](see:next-fullstack/ssr-csr-ssg#streamovani-necekat-na-to-nejpomalejsi).

```tsx
export default function Stranka() {
  return (
    <>
      <SeznamInzeratu />                          {/* 'use cache', pro všechny stejné */}
      <Suspense fallback={<p>Načítám…</p>}>
        <MojeOblibene />                          {/* čte session, čerstvé při každém požadavku */}
      </Suspense>
    </>
  );
}
```

Když opravdu potřebuješ dát dobu platnosti i něčemu osobnímu, existuje
`'use cache: private'` — uloží se to jen v prohlížeči toho jednoho uživatele.
A když potřebuješ náhodné číslo nebo čas per požadavek, zavolej nejdřív
`await connection()`; tím Next.js řekneš „počkej na skutečný požadavek".

> [!PITFALL]
> Nejhorší chyba téhle lekce je uložit do sdílené cache něco osobního. Projeví se
> tím, že uživatel vidí cizí jméno, cizí objednávky nebo cizí zůstatek — a ve
> vývoji to skoro nikdy nenastane, protože jsi tam sám. Pravidlo: ==do cache jde
> jen to, co bys klidně vyvěsil na nástěnku==.

:::check
Funkce čte `cookies()` a má nad sebou `'use cache'`. Napiš jedním slovem, co je na tom špatně.

### --expected--
cookies

### --accept--
osobní data
'use cache'
uloží se osobní údaj
cookie

### --why--
`cookies()` popisují jeden konkrétní požadavek. Uložená kopie by se pak nabídla
i jinému uživateli — tedy s cizí session. Next.js na to upozorní hláškou
„Route used `cookies` inside `use cache`".
:::

:::explain
Vysvětli vlastními slovy, proč pro vlastní stránku obvykle nepotřebuješ psát API
endpoint.

## --model--
API endpoint existuje proto, aby si **cizí klient** mohl vyžádat data po síti. Serverová
komponenta ale běží na serveru už předtím, než se cokoli pošle do prohlížeče — může si
tedy sáhnout do databáze rovnou a poslat dolů už hotové HTML. Kdybych mezi to vložil
vlastní endpoint, server by volal sám sebe po síti a přidal si kolo navíc. Stejně tak
na zápis stačí serverová akce, kterou zavolá formulář. Endpoint se píše až tehdy, když
data chce někdo jiný: mobilní aplikace, webhook, partnerský web — tedy klient, který
moje stránky vůbec nenačítá.

## --checklist--
- Endpoint slouží klientům, kteří se ptají po síti.
- Serverová komponenta už na serveru je a data si vezme přímo.
- Vlastní endpoint by znamenal, že server volá sám sebe.
- Endpoint se píše pro cizí klienty, ne pro vlastní stránku.
:::

## Typické chyby a pasti

> [!PITFALL] `Route used "cookies" inside "use cache"`
> V uložené funkci se sáhlo na něco, co patří jednomu požadavku. **Oprava:**
> hodnotu si přečti mimo cache a předej ji dovnitř jako argument (stane se
> součástí klíče), nebo tu část dej do `<Suspense>` a necachuj ji vůbec.

> [!PITFALL] Po odeslání formuláře jsou vidět stará data
> Akce zapsala, ale nezneplatnila kopii. **Oprava:** `updateTag('…')` (uživatel
> má vidět svoji změnu hned), nebo `revalidatePath('/…')`, když nevíš, jaké
> značky na stránce jsou. Volej to **před** `redirect`.

> [!PITFALL] `redirect()` v `try`/`catch` skončí jako chyba
> `redirect` funguje tak, že vyhodí zvláštní výjimku. Když ho obalíš `try`/`catch`,
> tvůj `catch` ji spolkne a přesměrování se neprovede. **Oprava:** volej `redirect`
> až za blokem `try`, nikdy uvnitř něj.

> [!PITFALL] Akce vyhodí výjimku a uživatel vidí „Something went wrong"
> Očekávané chyby (neplatný vstup, chybějící oprávnění) **vracej jako hodnotu**,
> ne výjimkou — z výjimky se v produkci stane obecná hláška bez detailů.
> Výjimku nech jen na to, co je opravdu porucha.

> [!PITFALL] Jen `disabled` na tlačítku jako ochrana proti dvojímu odeslání
> Zablokované tlačítko brání jen tomu, kdo používá tvoji stránku. Endpoint akce
> se dá zavolat dvakrát. **Oprava:** hlídej to i v databázi (unikátní index,
> kontrola stavu záznamu), ne jen v UI.

:::check
Akce v `try` bloku volá `redirect('/inzeraty')` a v `catch` píše „Nepodařilo se uložit". Co uvidí uživatel po úspěšném uložení?

### --answer--
Přesměruje se na `/inzeraty`, catch se nespustí.

#### --why--
Myslíš si, že `redirect` je obyčejné volání? Není — pracuje přes výjimku, a ta
projde každým `catch`, který stojí v cestě.

### --correct--
Chybovou hlášku „Nepodařilo se uložit", i když se všechno povedlo.

#### --why--
`catch` chytí i řídicí výjimku z `redirect`. Proto se `redirect` volá vždycky
až za blokem `try`.
:::

## Kde to najdeš v MDN

- [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) — přesně
  tenhle objekt dostane serverová akce; `get`, `getAll` a `Object.fromEntries`
  z něj dostanou hodnoty.
- [Atribut `name` u formulářových prvků](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#name) —
  bez něj se hodnota do `FormData` vůbec nedostane, což je nejčastější „proč je to
  `undefined`".
- [HTTP cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) — obecná
  pravidla platnosti a revalidace, ze kterých Next.js vychází.
- [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) — metoda,
  kterou se serverové akce volají, a proč je právě ona na změny dat.

> [!NOTE]
> Pravidla cache se mezi verzemi Next.js hodně měnila. Aktuální model
> (Cache Components) má dokumentace na
> [nextjs.org/docs/app/getting-started/caching](https://nextjs.org/docs/app/getting-started/caching);
> návody psané pro verzi 14 mluví o `fetch` s `revalidate` a dnes platí jinak.

# --questions--

## --question--

Serverová akce po zápisu do databáze zavolá `redirect('/inzeraty')`, ale ne
revalidaci. Napiš, co uživatel na cílové stránce uvidí.

### --expected--

stará data

### --accept--

starý seznam
seznam bez nového inzerátu
data z cache

### --why--

`redirect` mění jen adresu. Uložená kopie seznamu zůstává platná, takže se
pošle znovu — i bez právě přidaného záznamu. Revalidace patří **před** přesměrování.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

## --question--

Napiš jméno funkce z `next/cache`, kterou v serverové akci zahodíš uloženou kopii
okamžitě, aby uživatel viděl vlastní změnu hned.

### --expected--

updateTag

### --accept--

updateTag()
updateTag('…')

### --why--

`updateTag` kopii hned zruší a smí se volat jen v serverové akci. `revalidateTag`
naproti tomu ještě chvíli posílá starou verzi a novou dopočítává na pozadí —
což je u vlastní právě provedené změny to, co uživatele zmate.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

## --question--

Akce `smazInzerat` načte session, zkontroluje, že je uživatel přihlášený,
a pak smaže inzerát podle `id` z formuláře. Co v ní pořád chybí?

### --answer--

Nic, přihlášení stačí.

#### --why--

Přihlášený je každý registrovaný uživatel. Mezi „je to někdo" a „smí zrovna
tohle" je celý rozdíl mezi bezpečnou a nebezpečnou aplikací.

### --correct--

Kontrola, že inzerát patří právě tomuhle uživateli.

#### --why--

Bez ní smaže přihlášený útočník jakýkoli inzerát, stačí mu poslat cizí `id`.
Záznam se musí načíst a porovnat vlastníka se session.

### --answer--

Kontrola v `proxy.ts`, aby se na akci nedalo dostat.

#### --why--

`proxy.ts` rozhoduje o adresách stránek, ne o tom, kdo smí zavolat endpoint akce.
Autorizace patří dovnitř akce.

### --see--

next-fullstack/data-a-server-actions#validace-a-autorizace-v-kazde-akci

## --question--

Napiš metodu HTTP, kterou prohlížeč volá serverové akce.

### --expected--

POST

### --accept--

post

### --why--

Serverové akce jdou vždy metodou POST, i když tvoje funkce jenom něco počítá.
Proto se dá endpoint zavolat i mimo tvůj formulář — a proto do každé akce patří
kontrola identity a oprávnění.

### --see--

next-fullstack/data-a-server-actions#serverova-akce-formular-ktery-mluvi-s-databazi
