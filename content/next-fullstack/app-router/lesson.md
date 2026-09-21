# App Router: složka jako mapa webu

Každý web má adresy: `/`, `/kava`, `/kava/etiopie-yirgacheffe`, `/admin/objednavky`.
V Next.js je nevymýšlíš v konfiguraci — nakreslíš je složkami. Tomuhle způsobu
routování se říká [[App Router]] a tahle lekce je jeho mapa: co která složka
a který soubor znamená a v jakém pořadí se to poskládá.

:::check pretest
V Reactu s react-routerem přidáváš novou stránku. Kolik souborů musíš sáhnout, než adresa začne fungovat? Napiš číslo, které bys tipl.

### --expected--
2

### --accept--
dva
2 soubory
tři
3

### --why--
Obvykle dva až tři: komponenta stránky, seznam rout a často ještě odkaz v navigaci.
V App Routeru ten seznam rout zmizí — soubor na správném místě adresu **vyrobí**.
:::

:::check pretest
Co myslíš, že se v Next.js stane s adresou `/kosik`, když v projektu existuje složka `app/kosik/`, ale je prázdná?

### --answer--
Adresa začne fungovat a ukáže prázdnou stránku.

#### --why--
Prázdná složka není stránka. Kdyby stačila složka, nešlo by vedle rout ukládat
nic jiného — a přitom se do `app/` běžně dávají komponenty i pomocné soubory.

### --correct--
Adresa vrátí 404, protože složka sama o sobě žádnou stránku nedělá.
:::

## Problém: routu hlásíš na třech místech

Ve Vite SPA vypadá přidání stránky takhle: napíšeš komponentu, přidáš ji do seznamu
rout, doplníš odkaz. Seznam rout je jeden dlouhý soubor, na který si musíš vzpomenout,
a když ho zapomeneš, komponenta prostě nikdy nikde není:

```jsx
// routes.jsx — jediné místo, kde adresa "existuje"
<Route path="/kava" element={<Katalog />} />
<Route path="/kava/:slug" element={<Detail />} />
```

App Router ten soubor ruší. Cesta ke složce **je** adresa.

> [!REMEMBER]
> **Ve složce `app/` určuje adresu cesta ke složce a roli souboru jeho jméno.**
> `app/kava/[slug]/page.tsx` je stránka na `/kava/<cokoli>`, `layout.tsx` je obal,
> `route.ts` je endpoint. Nic jiného se nikam neregistruje.

:::check
Máš soubor `app/onas/page.tsx`. Na jaké adrese se stránka zobrazí?

### --expected--
/onas

### --accept--
/onas
onas

### --why--
Složky pod `app/` skládají cestu, jméno `page` říká „tohle je stránka". Žádný
seznam rout se nepíše.
:::

## `app/` jako mapa webu

Jména souborů jsou pevná a je jich jen pár. Tohle je celá abeceda, kterou
v běžném projektu potřebuješ:

| soubor | co dělá | vzniká z něj adresa? |
|---|---|---|
| `page.tsx` | obsah stránky | **ano** |
| `route.ts` | odpověď HTTP místo stránky (JSON, webhook) | **ano** |
| `layout.tsx` | obal, který zůstává mezi přechody | ne |
| `loading.tsx` | co je vidět, než stránka dorazí | ne |
| `error.tsx` | co je vidět, když stránka spadne | ne |
| `not-found.tsx` | co je vidět u nenalezené položky | ne |

A takhle vypadá katalog pražírny, který budeš za chvíli stavět:

```text
app/
├── layout.tsx              → obal celého webu (<html>, hlavička, patička)
├── page.tsx                → /
├── kava/
│   ├── layout.tsx          → obal jen pro /kava a vše pod ním
│   ├── loading.tsx         → skeleton při čekání na seznam
│   ├── page.tsx            → /kava
│   └── [slug]/
│       ├── page.tsx        → /kava/etiopie-yirgacheffe
│       └── not-found.tsx   → 404 pro neznámou kávu
└── api/
    └── kava/
        └── route.ts        → GET /api/kava vrací JSON
```

Dvě věci navíc, které uvidíš v každém větším projektu:

- **skupina rout** `(nazev)` — složka v kulatých závorkách se **do adresy nepočítá**.
  `app/(marketing)/cenik/page.tsx` je pořád `/cenik`. Slouží k tomu, abys skupině
  stránek dal vlastní layout.
- **soukromá složka** `_nazev` — složka s podtržítkem se na routy vůbec nekouká,
  takže je to bezpečné místo na komponenty: `app/kava/_components/Karta.tsx`.

:::check
V projektu je `app/(shop)/kosik/page.tsx`. Napiš adresu, na které se stránka zobrazí.

### --expected--
/kosik

### --accept--
kosik

### --why--
Kulaté závorky znamenají „jen pro pořádek ve složkách". Do adresy se `(shop)`
nepromítne — proto se dá stejný segment adresy obsloužit několika různými layouty.
:::

## Vnořené layouty: co zůstává a co se mění

Layouty se **vnořují**. Když otevřeš `/kava/etiopie-yirgacheffe`, Next.js poskládá
strom odshora dolů: kořenový layout, pak layout `kava`, pak stránka. Každý layout
dostane svého potomka v propě `children`.

:::live react
```jsx
function LayoutWebu({ children }) {
  return (
    <div className="ramec ramec--web">
      <span className="stitek">app/layout.tsx</span>
      <header className="hlavicka">Pražírna Zrno</header>
      {children}
      <footer className="paticka">© 2026 Zrno</footer>
    </div>
  );
}

function LayoutKavy({ children }) {
  return (
    <div className="ramec ramec--sekce">
      <span className="stitek">app/kava/layout.tsx</span>
      <nav className="filtry">Espresso · Filtr · Bezkofeinová</nav>
      {children}
    </div>
  );
}

function Stranka() {
  return (
    <div className="ramec ramec--stranka">
      <span className="stitek">app/kava/[slug]/page.tsx</span>
      <h1>Etiopie Yirgacheffe</h1>
      <p>289 Kč / 250 g</p>
    </div>
  );
}

export default function Ukazka() {
  return (
    <LayoutWebu>
      <LayoutKavy>
        <Stranka />
      </LayoutKavy>
    </LayoutWebu>
  );
}
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #faf7f4; color: #26201b; }
.ramec { position: relative; padding: 2rem 1rem 1rem; border-radius: 0.9rem; border: 2px solid; margin: 0; }
.ramec--web { border-color: #8a6c52; background: #fff; }
.ramec--sekce { border-color: #2f7d5d; background: #f3faf6; margin: 1rem 0; }
.ramec--stranka { border-color: #b4573a; background: #fff6f2; }
.stitek { position: absolute; top: 0.4rem; left: 0.9rem; font-size: 0.7rem; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.65; }
.hlavicka { font-weight: 700; font-size: 1.1rem; }
.paticka { margin-top: 1rem; font-size: 0.8rem; opacity: 0.7; }
.filtry { font-size: 0.85rem; color: #2f7d5d; margin-bottom: 0.75rem; }
h1 { margin: 0 0 0.25rem; font-size: 1.3rem; }
p { margin: 0; color: #8a6c52; font-weight: 600; }
```
:::

Zkus prohodit `LayoutKavy` a `Stranka` a sleduj, který rámeček skončí uvnitř kterého —
přesně tohle za tebe dělá struktura složek.

Rozdíl proti SPA je v tom, co se při přechodu **překreslí**. Když klikneš z jedné
kávy na druhou, kořenový layout ani layout `kava` se nevykreslují znovu; vymění se
jen obsah stránky. Proto do layoutu patří navigace a filtry, ne obsah konkrétní položky.

> [!PITFALL]
> Layout se mezi přechody uvnitř své větve **nevykresluje znovu**. Když do něj dáš
> něco, co se má měnit podle adresy (třeba nadpis produktu), zůstane tam viset starý.
> Takové věci patří do `page.tsx`, nebo do `template.tsx`, který se naopak překreslí vždy.

:::check
Do kterého souboru dáš vyhledávací pole, které má zůstat vyplněné, i když uživatel proklikává jednotlivé produkty?

### --expected--
layout.tsx

### --accept--
do layoutu
layout

### --why--
Layout při přechodu uvnitř své větve zůstává namontovaný, takže si drží stav.
Kdyby pole bylo v `page.tsx`, každý přechod by ho vytvořil znovu a prázdné.
:::

## Dynamické segmenty a `params` jako Promise

Hranaté závorky ve jméně složky dělají ze segmentu proměnnou. `app/kava/[slug]/page.tsx`
obslouží `/kava/cokoli` a to „cokoli" dostane stránka v propě `params`.

Pozor na jednu věc, na které se dnes sekne každý, kdo se učil z tutoriálu pro Next.js 14:
**`params` i `searchParams` jsou od Next.js 15 sliby (*Promise*)**. Musíš je počkat.

```tsx
// app/kava/[slug]/page.tsx
export default async function DetailKavy({ params }) {
  const { slug } = await params;        // ← await, jinak dostaneš Promise
  const kava = await najdiKavu(slug);
  return <h1>{kava.nazev}</h1>;
}
```

:::live js predict
```js
const params = Promise.resolve({ slug: 'etiopie-yirgacheffe' });

// Takhle to napíše každý, kdo params zná ze starších návodů:
const { slug } = params;

console.log(`/kava/${slug}`);
```
--question-- Co vypíše `console.log`?
--expected-- /kava/undefined
--why-- Destrukturalizace z Promise nečeká na hodnotu — hledá klíč `slug` přímo na objektu Promise, a ten tam není. V prohlížeči z toho vznikne text `undefined`, v Next.js hláška, že `params` se musí počkat. Oprava je jedno slovo: `await params`.
:::

Zkus `params` obalit do `params.then(({ slug }) => console.log(slug))` a sleduj,
jak se hodnota konečně objeví.

Typy si Next.js vygeneruje sám: v TypeScriptu můžeš psát
`{ params }: PageProps<'/kava/[slug]'>` a máš `slug` i `searchParams` popsané bez
ručního rozepisování.

:::check
Proč `const { slug } = params` nespadne s chybou, ale vrátí `undefined`?

### --answer--
Protože `params` je v tu chvíli ještě prázdný objekt.

#### --why--
Myslíš si, že se objekt časem naplní? Tak to nefunguje — `params` je slib,
a slib se nenaplňuje na místě. Hodnotu vydá jen přes `await` nebo `.then()`.

### --correct--
Protože `params` je Promise a čtení neznámého klíče z objektu vrací `undefined`.

#### --why--
Promise je obyčejný objekt s metodami `then` a `catch`. Klíč `slug` na něm není,
a JavaScript čtení neexistujícího klíče nehlásí jako chybu.
:::

## `loading` a `error`: stavy za tebe

Dva soubory ti ušetří kód, který bys jinak psal ručně v každé komponentě.

**`loading.tsx`** je `fallback` pro `<Suspense>` okolo celé stránky. Next.js ho ukáže,
dokud se stránka vyrábí — návštěvník vidí layout a skeleton hned, ne bílo:

```tsx
// app/kava/loading.tsx
export default function Nacitam() {
  return <ul className="skeleton" aria-hidden="true">{/* šedé obdélníky */}</ul>;
}
```

**`error.tsx`** je hranice chyby (*error boundary*). Musí být klientská (má stav)
a dostane dva propy: `error` a funkci `reset`, kterou se dá vykreslení zkusit znovu:

```tsx
// app/kava/error.tsx
'use client';

export default function Chyba({ error, reset }) {
  return (
    <div role="alert">
      <p>Katalog se nepodařilo načíst.</p>
      <button onClick={reset}>Zkusit znovu</button>
    </div>
  );
}
```

**`not-found.tsx`** je jiný případ: vyvoláš ho sám funkcí `notFound()` ve chvíli,
kdy data nenajdeš. Next.js pak vykreslí nejbližší `not-found.tsx` a pošle stav 404.

```tsx
import { notFound } from 'next/navigation';

const kava = await najdiKavu(slug);
if (!kava) notFound();          // dál se už nepokračuje
```

> [!TIP]
> `loading.tsx`, `error.tsx` i `not-found.tsx` platí pro celou svou větev.
> Když je dáš do `app/kava/`, chrání i `/kava/[slug]`. Nemusíš je opakovat.

:::check
Uživatel otevře `/kava/neexistujici-slug`. Jakou funkci zavoláš ve stránce, aby dostal stav 404 a vykreslil se `not-found.tsx`?

### --expected--
notFound()

### --accept--
notFound
notFound() z next/navigation

### --why--
`notFound()` vyhodí zvláštní výjimku, kterou Next.js zachytí: pošle stav 404
a vykreslí nejbližší `not-found.tsx`. Kód za voláním se neprovede.
:::

## Route handler: když potřebuješ endpoint

Někdy nechceš stránku, ale odpověď: JSON pro mobilní aplikaci, webhook od platební
brány, RSS. Na to je [[route handler]] — soubor `route.ts`, který exportuje funkci
pojmenovanou podle metody HTTP:

```ts
// app/api/kava/route.ts
export async function GET() {
  const kavy = await nactiKavy();
  return Response.json(kavy);
}

export async function POST(request: Request) {
  const data = await request.json();
  // … uložení …
  return Response.json({ ok: true }, { status: 201 });
}
```

Je to tentýž `Request` a `Response`, jaké znáš z prohlížeče a z Node — žádné vlastní
API frameworku.

> [!NOTE]
> Na změnu dat z vlastního formuláře route handler **nepotřebuješ**. Od toho jsou
> serverové akce z lekce
> [Data a server actions](see:next-fullstack/data-a-server-actions#serverova-akce-formular-ktery-mluvi-s-databazi).
> `route.ts` piš pro klienty, které nejsou tvoje stránka.

Ve stejné rodině je ještě `proxy.ts` v kořeni projektu (do Next.js 15 se jmenoval
`middleware.ts`). Běží **před** každým požadavkem a hodí se na přesměrování,
jazykové varianty nebo rychlou kontrolu, jestli vůbec existuje cookie se session.

> [!PITFALL]
> `proxy.ts` je rychlá výhybka, ==ne== ochranka. Skutečnou kontrolu, jestli
> uživatel smí data vidět, dělej tam, kde se data čtou a mění. Proč, je v lekci
> [Přihlášení v Next.js](see:next-fullstack/auth-v-nextu#ochrana-stranky-a-akce).

:::check
Chceš vystavit veřejný JSON s cenami pro partnerský web. Jaké jméno bude mít soubor, který to obslouží?

### --expected--
route.ts

### --accept--
route
route.js
app/api/ceny/route.ts

### --why--
`route.ts` vrací odpověď HTTP místo stránky. Ve stejné složce nesmí být zároveň
`page.tsx` — jedna adresa nemůže být stránka i endpoint.
:::

## Odkazy a přechody: `Link`

Odkazy piš komponentou `Link` z `next/link`, ne holým `<a>`. Rozdíl je v tom, co se
při kliknutí stane:

- `<a href="/kava">` — prohlížeč zahodí celou stránku a načte novou. Stav se ztratí.
- `<Link href="/kava">` — Next.js si cílovou stránku **předem stáhne** (prefetch),
  jakmile se odkaz objeví na obrazovce, a při kliknutí vymění jen to, co se liší.

```tsx
import Link from 'next/link';

<Link href={`/kava/${kava.slug}`}>{kava.nazev}</Link>
```

V HTML z toho stejně vznikne obyčejné `<a href="…">`, takže robot i „otevřít
v novém panelu" fungují normálně.

:::check
Proč je `<Link href="/kava">` rychlejší než `<a href="/kava">`, i když v HTML z obojího vznikne `<a>`?

### --expected--
předem si stáhne cílovou stránku

### --accept--
prefetch
stránku si stáhne dopředu
načte ji dopředu a vymění jen část

### --why--
`Link` sleduje, kdy je odkaz vidět, a cílovou routu si vyžádá dopředu. Při kliknutí
už data má a mění jen tu část stromu, která se liší — layout zůstane.
:::

:::explain
Vysvětli vlastními slovy, proč ve složce `app/` nikde nestojí seznam tras.

## --model--
Seznam tras by byl druhý zdroj pravdy vedle souborů — a ty dva se dřív nebo později
rozejdou. Místo toho platí, že **adresu určuje cesta ke složce a roli souboru jeho
jméno**: `app/kava/[slug]/page.tsx` je stránka na `/kava/<cokoli>`, `layout.tsx` je
obal, `route.ts` endpoint. Přidat trasu tedy znamená přidat složku a nic víc; smazat ji
znamená smazat složku. Cenou za to je, že na jménech souborů záleží doslova a překlep
v `page.tsx` se neprojeví jako chyba, ale jako neexistující stránka.

## --checklist--
- Seznam tras by byl druhý zdroj pravdy vedle souborů.
- Adresu určuje cesta ke složce, roli jméno souboru.
- Přidání trasy je přidání složky, nic se neregistruje.
- Překlep ve jméně se projeví jako chybějící stránka.
:::

## Typické chyby a pasti

> [!PITFALL] Složka je, stránka není → 404
> Samotná složka adresu nevyrobí. Adresa vzniká teprve souborem `page.tsx`
> (nebo `route.ts`). **Oprava:** zkontroluj jméno souboru — `Page.tsx`, `index.tsx`
> ani `page.jsx` ve složce s TypeScriptem nestačí, jméno musí být přesně `page`.

> [!PITFALL] `Error: Route "/kava/[slug]" used params.slug. params should be awaited`
> Čteš `params` bez `await`. **Oprava:** `const { slug } = await params;`. Totéž
> platí pro `searchParams`, `cookies()` a `headers()` — všechno jsou to sliby.

> [!PITFALL] `You cannot have two parallel pages that resolve to the same path`
> Dvě různé cesty ve složkách vedou na stejnou adresu, typicky přes skupinu rout:
> `app/(shop)/kosik/page.tsx` a `app/kosik/page.tsx`. **Oprava:** jednu z nich smaž
> nebo přejmenuj — skupina se do adresy nepočítá, takže obě znamenají `/kosik`.

> [!PITFALL] `error.tsx` nic nechytá
> Hranice chyby chytá jen chyby **pod sebou**, ne v layoutu na stejné úrovni.
> Když spadne `app/kava/layout.tsx`, `app/kava/error.tsx` se neuplatní.
> **Oprava:** dej `error.tsx` o patro výš, nebo v případě kořenového layoutu použij
> `global-error.tsx`.

> [!PITFALL] Kořenový layout bez `<html>` a `<body>`
> Kořenový `app/layout.tsx` je jediné místo, kde tyhle značky jsou. Když je smažeš
> nebo obalíš podmínkou, aplikace se nevykreslí. **Oprava:** kořenový layout vrací
> vždycky `<html lang="cs"><body>{children}</body></html>`.

:::check
Přidal jsi `app/(marketing)/page.tsx`, ale `app/page.tsx` už existuje. Co Next.js udělá?

### --answer--
Vezme ten specifičtější, tedy `(marketing)`.

#### --why--
Myslíš si, že mezi nimi Next.js rozhodne podle „specifičnosti"? Obě cesty vedou
na naprosto stejnou adresu, takže není podle čeho vybrat.

### --correct--
Skončí chybou — dvě stránky pro stejnou adresu.

#### --why--
Skupina rout se do adresy nepočítá, takže oba soubory znamenají `/`. Next.js to
nahlásí už při buildu a nepustí to dál.
:::

## Kde to najdeš v MDN

Konvence souborů jsou vlastnost Next.js, MDN je nezná. Zato zná všechno, na čem stojí:

- [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) a
  [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) — přesně tyhle
  třídy dostaneš a vracíš v `route.ts`, včetně `Response.json()`.
- [HTTP status kódy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — co
  přesně říká 404, 307 a 500, když je posíláš z handleru nebo z `notFound()`.
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) —
  proč z `params` bez `await` vyleze `undefined` a ne hodnota.

> [!NOTE]
> Konvence souborů App Routeru má Next.js pohromadě na
> [nextjs.org/docs/app/getting-started/project-structure](https://nextjs.org/docs/app/getting-started/project-structure) —
> je to tabulka na jednu obrazovku a vyplatí se ji mít otevřenou, dokud ji nebudeš znát zpaměti.

# --questions--

## --question--

Napiš cestu k souboru (od `app/`), který obslouží adresu `/blog/moje-prvni-recenze`,
kde poslední část adresy je proměnná.

### --expected--

app/blog/[slug]/page.tsx

### --accept--

blog/[slug]/page.tsx
app/blog/[slug]/page.js
app/blog/[slug]/page.jsx

### --why--

Hranaté závorky dělají ze složky proměnnou část adresy a `page` říká, že jde
o stránku. Jméno proměnné (`slug`) je na tobě — pod tím klíčem ho pak najdeš
v `await params`.

### --see--

next-fullstack/app-router#dynamicke-segmenty-a-params-jako-promise

## --question--

V `app/ucet/layout.tsx` je panel s odkazy a v něm nadpis „Objednávka #{cislo}".
Uživatel proklikává jednotlivé objednávky, ale nadpis zůstává na první z nich.
Napiš jméno souboru, do kterého ten nadpis patří.

### --expected--

page.tsx

### --accept--

page
page.js
do page.tsx

### --why--

Layout při přechodu uvnitř své větve zůstává namontovaný, takže se nepřekreslí.
Co se má měnit podle adresy, patří do stránky — nebo výjimečně do `template.tsx`,
který se na rozdíl od layoutu vykresluje při každém přechodu znovu.

### --see--

next-fullstack/app-router#vnorene-layouty-co-zustava-a-co-se-meni

## --question--

Co platí o souboru `route.ts`?

### --answer--

Je to náhrada za `page.tsx`, když stránka potřebuje data ze serveru.

#### --why--

Myslíš si, že stránka potřebuje vlastní endpoint, aby se dostala k datům? Serverová
komponenta si data načte přímo, žádný mezistupeň k tomu nepotřebuje.

### --correct--

Vrací odpověď HTTP a exportuje funkce pojmenované podle metod (`GET`, `POST`).

#### --why--

Hodí se pro klienty, kteří nejsou tvoje stránka: mobilní aplikace, webhook, RSS.
Pracuje s obyčejnými `Request` a `Response`.

### --answer--

Běží před každým požadavkem a hodí se na přesměrování.

#### --why--

Myslíš na `proxy.ts` (dřív `middleware.ts`). Ten opravdu běží před požadavkem,
ale je to jiný soubor v kořeni projektu, ne `route.ts` uvnitř `app/`.

### --see--

next-fullstack/app-router#route-handler-kdyz-potrebujes-endpoint

## --question--

Složka `app/(admin)/` obsahuje `objednavky/page.tsx`. Napiš adresu, na které se
stránka zobrazí.

### --expected--

/objednavky

### --accept--

objednavky

### --why--

Kulaté závorky znamenají skupinu rout: slouží jen k tomu, aby skupina stránek
mohla mít vlastní layout, a do adresy se nepromítnou.

### --see--

next-fullstack/app-router#app-jako-mapa-webu
