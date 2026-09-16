# Serverové a klientské komponenty

V Next.js píšeš jeden strom komponent, ale běží na dvou strojích: část na serveru
u databáze, část v prohlížeči u uživatele. Kdo neví, kde která komponenta je, píše
buď zbytečně velký balík JavaScriptu, nebo si do prohlížeče omylem pošle heslo
k databázi. Tahle lekce je o té hranici.

:::check pretest
Co myslíš, že se stane, když do komponenty v Next.js napíšeš `onClick={() => setPocet(1)}` a soubor nezačíná řádkem `'use client'`?

### --answer--
Nic zvláštního, tlačítko bude fungovat.

#### --why--
Kdyby to fungovalo, nebyl by důvod `'use client'` vůbec psát. Někde se to rozhodnout
musí — a rozhoduje se to po souborech.

### --correct--
Build skončí chybou, že obsluhy událostí se serverové komponentě předat nedají.
:::

:::check pretest
Kolik kilobajtů JavaScriptu podle tebe pošle do prohlížeče komponenta, která jen vypíše seznam produktů z databáze a nemá žádné tlačítko? Napiš číslo.

### --expected--
0

### --accept--
nula
žádné
0 kB

### --why--
Serverová komponenta se v prohlížeči nikdy nespustí, takže se tam její kód ani
neposílá. Do balíku jde jen to, co musí umět reagovat.
:::

## Problém: `window is not defined` a balík, který nikdo nechtěl

Tyhle dvě chyby potká každý, kdo přijde z čistého Reactu:

```text
ReferenceError: window is not defined
```

```text
Error: Event handlers cannot be passed to Client Component props.
  <button onClick={function onClick} children=...>
                  ^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

Obě říkají totéž z opačných stran: **kód skončil na stroji, kde nemá co dělat.**
První v prohlížeči hledal server, druhá na serveru hledala prohlížeč.

> [!REMEMBER]
> **V Next.js je každá komponenta serverová, dokud ji ty sám neprohlásíš za
> klientskou.** Hranici kreslí řádek `'use client'` na začátku souboru — a platí
> pro ten soubor i pro všechno, co odtud importuješ.

:::check
Komponenta sahá na `localStorage` a soubor nemá `'use client'`. Napiš, na jakém stroji ten kód spadne.

### --expected--
na serveru

### --accept--
server
při serverovém vykreslení
na serveru při buildu

### --why--
Bez `'use client'` se komponenta vykreslí jen na serveru, kde žádné
`localStorage` není. Prohlížeč se k tomu kódu vůbec nedostane.
:::

## Výchozí stav: všechno je serverové

[[Serverová komponenta]] se vykreslí na serveru a do prohlížeče z ní odjede jen
výsledek. To je docela osvobozující: může být `async`, může sáhnout rovnou do
databáze a její kód (včetně knihoven, které používá) se nikam neposílá.

```tsx
// app/kava/page.tsx — žádná direktiva, tedy serverová komponenta
import { db } from '@/lib/db';

export default async function Katalog() {
  const kavy = await db.query.kavy.findMany();      // rovnou z databáze, bez API

  return (
    <ul>
      {kavy.map((kava) => (
        <li key={kava.id}>{kava.nazev} — {kava.cena} Kč</li>
      ))}
    </ul>
  );
}
```

Za tuhle svobodu ale něco platíš. Serverová komponenta **nemá**:

| co nemá | proč |
|---|---|
| `useState`, `useReducer` | nemá kde si stav pamatovat, vykreslí se jednou a končí |
| `useEffect` | efekty patří do prohlížeče, tam komponenta nikdy nebude |
| `onClick`, `onChange` a spol. | obsluhu události není komu navěsit |
| `window`, `document`, `localStorage` | na serveru neexistují |

Naopak smí to, co klientská nesmí: `await`, přístup k souborům, proměnné prostředí,
tajné klíče.

:::check
Proč může být serverová komponenta `async`, ale klientská ne?

### --answer--
Protože `await` funguje jen v Node, ne v prohlížeči.

#### --why--
Myslíš si, že `await` v prohlížeči není? Je, a běžně ho tam používáš —
třeba u `fetch`. Důvod je jinde.

### --correct--
Protože se vykreslí jen jednou a nikdo nečeká, že by se překreslila.

#### --why--
Klientská komponenta se překresluje při každé změně stavu, takže její tělo musí
být rychlá synchronní funkce. Serverová se vykreslí jednou do HTML — server si
na `await` počkat může.
:::

## `"use client"`: hranice, ne přepínač

Řádek `'use client'` na začátku souboru není „tady se vypne server". Je to
**hranice ve stromu**: soubor s direktivou a všechno, co se z něj importuje,
už patří do klientského balíku.

```tsx
// app/kava/Filtr.tsx
'use client';

import { useState } from 'react';

export function Filtr({ kategorie, onZmena }) {
  const [vybrana, setVybrana] = useState('vse');
  // … obyčejný React, jaký znáš …
}
```

A tady je největší nedorozumění celé téhle lekce:

> [!PITFALL]
> [[Klientská komponenta]] se **taky vykreslí na serveru** — právě proto je její
> obsah v HTML a proto v ní `window` v těle komponenty spadne stejně jako
> v serverové. Rozdíl není „server × prohlížeč", ale ==„jen server × server
> i prohlížeč"==.

Z toho plyne praktické pravidlo: hranici posouvej **co nejníž**. Když má stránka
jedno tlačítko „Přidat do košíku", nedělej klientskou celou stránku — udělej
klientské jen to tlačítko.

:::live react
```jsx
import { useState } from 'react';

// Tohle by v Next.js byl soubor s 'use client' — jediný kus, který musí do balíku.
function TlacitkoKosik({ nazev }) {
  const [pocet, setPocet] = useState(0);
  return (
    <button className="kosik" onClick={() => setPocet(pocet + 1)}>
      Přidat do košíku {pocet > 0 && <span className="odznak">{pocet}</span>}
    </button>
  );
}

// Všechno ostatní zůstává serverové: žádný stav, žádná obsluha událostí.
export default function KartaKavy() {
  return (
    <article className="karta">
      <p className="puvod">Etiopie · Yirgacheffe</p>
      <h1>Citrusová a květinová</h1>
      <p className="cena">289 Kč / 250 g</p>
      <TlacitkoKosik nazev="Etiopie Yirgacheffe" />
      <p className="popis">Praženo 12. září 2026 v Brně.</p>
    </article>
  );
}
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #faf7f4; color: #26201b; }
.karta { max-width: 22rem; padding: 1.5rem; border-radius: 1rem; background: #fff; box-shadow: 0 14px 34px -22px #6b4b2f; }
.puvod { margin: 0 0 0.35rem; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: #8a6c52; }
h1 { margin: 0 0 0.5rem; font-size: 1.3rem; line-height: 1.2; }
.cena { margin: 0 0 1rem; font-weight: 600; color: #b4573a; }
.popis { margin: 1rem 0 0; font-size: 0.85rem; color: #6d6259; }
.kosik { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; border: 0; border-radius: 999px; background: #26201b; color: #fff; font: inherit; font-weight: 600; cursor: pointer; transition: background 160ms ease, transform 160ms ease; }
.kosik:hover { background: #3d332b; }
.kosik:focus-visible { outline: 3px solid #b4573a; outline-offset: 2px; }
.kosik:active { transform: translateY(1px); }
.odznak { min-width: 1.4rem; padding: 0.1rem 0.4rem; border-radius: 999px; background: #b4573a; font-size: 0.8rem; }
@media (prefers-reduced-motion: reduce) { .kosik { transition: none; } }
```
:::

Zkus přesunout `useState` do `KartaKavy` a sleduj, že se tím nic nerozbije — ale
v Next.js by ses tím právě připravil o to, že zbytek karty do prohlížeče vůbec nejde.

:::check
Soubor `Filtr.tsx` má `'use client'` a importuje `formatujCenu` z `lib/ceny.ts`, kde žádná direktiva není. Kde skončí `formatujCenu`?

### --answer--
Zůstane na serveru, protože `lib/ceny.ts` direktivu nemá.

#### --why--
Myslíš si, že direktiva platí jen pro svůj soubor? Platí i směrem dolů —
jinak by klientský kód volal funkci, která v prohlížeči neexistuje.

### --correct--
V klientském balíku, protože ho importuje klientský soubor.

#### --why--
Hranice se dědí do všeho, co klientský soubor importuje. Proto se do takových
modulů nesmí zatoulat nic tajného.
:::

## Co jde po drátu

Serverová komponenta smí vykreslit klientskou a předat jí propy. Ty propy se
ale musí dostat přes síť, takže se **serializují**. Prochází to, co umí React
poslat v [[RSC payload]]: čísla, řetězce, pole, prosté objekty, `Date`, `Map`, `Set`,
JSX — a serverové akce.

Neprochází funkce, třídy ani instance. Přesně stejné pravidlo znáš z prohlížeče:

:::live js predict
```js
const props = { nazev: 'Etiopie Yirgacheffe', cena: 289, naKlik: () => alert('koupit') };

try {
  structuredClone(props);
  console.log('props se daji poslat');
} catch (chyba) {
  console.log(chyba.name);
}
```
--question-- Co vypíše `console.log`?
--expected-- DataCloneError
--why-- `structuredClone` je přesně ten druh přenosu, kterým prochází i propy ze serverové komponenty do klientské: hodnoty ano, funkce ne. Next.js na to místo `DataCloneError` hlásí „Event handlers cannot be passed to Client Component props", ale příčina je stejná — funkci nelze poslat po drátu.
:::

Zkus z objektu `naKlik` odstranit a sleduj, jak se výstup překlopí.

> [!TIP]
> Když potřebuješ, aby klientská komponenta něco udělala na serveru, neposílej jí
> funkci — pošli jí **serverovou akci**. To je jediná funkce, kterou React přes
> hranici pustit umí, protože z ní na klientovi udělá jen odkaz na endpoint.
> Píšeme je v lekci [Data a server actions](see:next-fullstack/data-a-server-actions#serverova-akce-formular-ktery-mluvi-s-databazi).

:::check
Chceš klientské komponentě předat prop `pripraveno: new Date()`. Projde to přes hranici?

### --expected--
ano

### --accept--
ano, Date projde
projde

### --why--
`Date` patří mezi hodnoty, které React serializovat umí (stejně jako `Map`, `Set`
nebo obyčejné objekty). Neprojdou funkce, třídy a instance vlastních tříd.
:::

## Serverová komponenta jako `children`

Když klientská komponenta importuje serverovou, stane se z ní taky klientská —
hranice se dědí. Existuje ale jedna cesta, jak dostat serverový obsah dovnitř
klientského obalu: **předat ho jako `children`**.

```tsx
// app/kava/page.tsx — serverová
import { Rozbalovac } from './Rozbalovac';        // klientská (má stav „otevřeno")
import { Recenze } from './Recenze';              // serverová (čte z databáze)

export default function Stranka() {
  return (
    <Rozbalovac titulek="Recenze zákazníků">
      <Recenze slug="etiopie-yirgacheffe" />
    </Rozbalovac>
  );
}
```

Proč to funguje? `<Recenze />` se vykreslí **na serveru**, protože ho vykresluje
serverová stránka. `Rozbalovac` dostane jen hotový výsledek jako `children` —
tedy data, ne kód. Kdyby si `Rozbalovac` komponentu `Recenze` sám importoval,
musel by mít její kód, a ten by odjel do prohlížeče.

> [!REMEMBER]
> **Rozhoduje, kdo komponentu vykresluje, ne kdo ji obaluje.** Serverová komponenta
> předaná jako `children` zůstane serverová i uvnitř klientského obalu.

:::check
Klientská komponenta `Rozbalovac` má uvnitř `{children}` a dostane serverovou `<Recenze />`. Kde se `Recenze` vykreslí?

### --expected--
na serveru

### --accept--
server
jen na serveru

### --why--
Vykresluje ji serverová stránka, která `Rozbalovac` používá. Do klientského obalu
se dostane až hotový výsledek — proto se kód `Recenze` do prohlížeče neposílá.
:::

## Tajemství a veřejné proměnné

Serverová komponenta má přístup k proměnným prostředí, tedy i k tajemstvím:

```tsx
const odpoved = await fetch('https://api.platebnibrana.cz/platby', {
  headers: { Authorization: `Bearer ${process.env.PLATBY_SECRET}` },
});
```

Kdybys ten samý řádek napsal v klientské komponentě, klíč by se **zapekl do
JavaScriptu** a přečetl by si ho každý návštěvník. Next.js proto do klientského
balíku pustí jen proměnné, jejichž jméno začíná `NEXT_PUBLIC_`.

| jméno proměnné | server | prohlížeč |
|---|---|---|
| `DATABASE_URL` | hodnota | `undefined` |
| `PLATBY_SECRET` | hodnota | `undefined` |
| `NEXT_PUBLIC_ANALYTIKA_ID` | hodnota | **hodnota** |

> [!PITFALL]
> `NEXT_PUBLIC_` není „povolení pro frontend". Je to prohlášení ==tohle je
> veřejné==. Cokoli s tímhle prefixem najde kdokoli v souborech `.js`, které si
> stáhne. Když to nechceš na billboardu, prefix tam nepatří.

Jistotu, že se ti serverový modul omylem neocitne v prohlížeči, dá balíček
`server-only`. Stačí ho na první řádek modulu s databází nebo klíči:

```ts
// lib/db.ts
import 'server-only';           // build spadne, kdyby to naimportoval klientský soubor
```

Build pak selže hned, ne až v produkci.

:::explain
Kolega tvrdí, že `'use client'` znamená „tahle komponenta se vykreslí jen v prohlížeči". Vysvětli vlastními slovy, proč to není pravda a co `'use client'` doopravdy znamená.

## --model--
`'use client'` nevypíná serverové vykreslení. Označuje hranici: soubor s direktivou
a všechno, co importuje, se **navíc** pošle do prohlížeče, aby tam komponenta mohla
ožít a reagovat. Vykreslí se tedy dvakrát — na serveru do HTML a v prohlížeči při
hydrataci. Proto v ní `window` v těle komponenty pořád spadne a proto ji musím psát
tak, aby vyšla na obou stranách stejně.

## --checklist--
- `'use client'` označuje hranici ve stromu, ne stroj, na kterém se kód spustí.
- Direktiva platí i pro všechno, co soubor importuje.
- Klientská komponenta se vykresluje i na serveru, aby byl její obsah v HTML.
- Prohlížečová API patří do efektu nebo do obsluhy události, ne do těla komponenty.
:::

:::check
Proměnná `NEXT_PUBLIC_MAPY_KLIC` je v klientské komponentě vidět. Napiš, kdo další si ji může přečíst.

### --expected--
kdokoli

### --accept--
každý návštěvník
kdokoliv
všichni návštěvníci webu

### --why--
Hodnota se zapeče do staženého JavaScriptu. Prefix `NEXT_PUBLIC_` nic nechrání —
jen říká „vím, že tohle bude veřejné".
:::

## Typické chyby a pasti

> [!PITFALL] `Error: Event handlers cannot be passed to Client Component props`
> Serverová komponenta předává funkci (`onClick`, `onChange`) dolů. **Oprava:**
> udělej klientskou komponentu z toho nejmenšího kusu, který funkci potřebuje,
> a obsluhu napiš uvnitř ní.

> [!PITFALL] `You're importing a component that needs "useState". It only works in a Client Component`
> Do serverového souboru se dostal hook. **Oprava:** přidej `'use client'` na první
> řádek souboru — ale nejdřív si ověř, jestli místo toho nestačí vytáhnout tu
> interaktivní část do vlastní komponenty.

> [!PITFALL] Tajemství v klientské komponentě je `undefined`
> Kód v prohlížeči čte `process.env.API_KLIC` a dostane `undefined`. To není chyba,
> to je ochrana. **Oprava:** volání přesuň do serverové komponenty nebo do serverové
> akce. Přejmenování na `NEXT_PUBLIC_API_KLIC` **není oprava** — klíč tím zveřejníš.

> [!PITFALL] `'use client'` až za importy
> Direktiva musí být úplně první, ještě před `import`. Když ji dáš pod importy,
> tiše se ignoruje a soubor zůstane serverový.

> [!PITFALL] Celá stránka klientská kvůli jednomu tlačítku
> Nejde o chybu, která by cokoli shodila — jen si tím pošleš do prohlížeče
> i formátování, výpočty a knihovny, které tam nikdo nepotřebuje. **Oprava:**
> hranici posuň dolů, na tu jednu interaktivní komponentu.

:::check
Do souboru se stránkou jsi přidal `'use client'` a najednou ti spadl `await db.query(...)` s chybou. Napiš jedním slovem, co je na té stránce špatně.

### --expected--
direktiva

### --accept--
'use client'
use client
ta direktiva tam nepatří

### --why--
Klientská komponenta nesmí být `async` a nemá přístup k databázi. Stránka má
zůstat serverová a klientské má být jen to, co potřebuje stav nebo události.
:::

## Kde to najdeš v MDN

- [structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone) —
  algoritmus, podle kterého se pozná, co jde poslat mezi dvěma prostředími a co ne.
- [The structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) —
  úplný seznam typů, které přenos přežijí (a proč mezi nimi nejsou funkce).
- [Environment variables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) —
  moduly a jejich hranice; na hranici server/klient staví i `'use client'`.

> [!NOTE]
> Přehled obou druhů komponent vedle sebe má Next.js na
> [nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components).
> Je tam i diagram stromu s hranicí — vyplatí se na něj kouknout, než začneš stavět.

# --questions--

## --question--

Napiš direktivu (i s uvozovkami), kterou označíš soubor jako klientský.

### --expected--

'use client'

### --accept--

"use client"
'use client';

### --why--

Patří na úplně první řádek souboru, ještě před importy. Pod importy se tiše
ignoruje a soubor zůstane serverový.

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --question--

Serverová stránka předává klientské komponentě prop `formatuj: (cena) => cena + ' Kč'`.
Napiš první dvě slova chyby, kterou Next.js ohlásí.

### --expected--

Event handlers

### --accept--

Event handlers cannot be passed to Client Component props
Event handlers cannot

### --why--

Funkce se přes hranici serializovat nedá, a Next.js všechny funkce v propech
hlásí stejnou hláškou o obsluhách událostí. Řešení je formátování udělat na serveru
a poslat hotový řetězec, nebo tu funkci definovat uvnitř klientské komponenty.

### --see--

next-fullstack/server-a-client-komponenty#co-jde-po-dratu

## --question--

Která z těchhle vět o klientské komponentě je pravdivá?

### --answer--

Vykresluje se pouze v prohlížeči, na serveru se přeskočí.

#### --why--

Kdyby se přeskočila, nebyl by její obsah v HTML a celá stránka by se ve
vyhledávači ukázala děravá. Serveru v jejím vykreslení nic nebrání — jen
z něj nevzniká interaktivita.

### --correct--

Vykreslí se na serveru do HTML a v prohlížeči pak ožije při hydrataci.

#### --why--

Právě proto v ní musí tělo komponenty vyjít na obou stranách stejně a proto
prohlížečová API patří až do efektu.

### --answer--

Nesmí dostat žádné propy ze serverové komponenty.

#### --why--

Propy dostat smí, jen musí být serializovatelné — čísla, řetězce, objekty, `Date`,
JSX. Neprojdou funkce a instance vlastních tříd.

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --question--

Máš modul `lib/platby.ts` s tajným klíčem. Napiš jméno balíčku, jehož import na
prvním řádku zajistí, že build spadne, kdyby si ten modul naimportoval klientský soubor.

### --expected--

server-only

### --accept--

'server-only'
import 'server-only'

### --why--

Balíček `server-only` nemá žádné API — jen záměrně neexistuje ve verzi pro
prohlížeč, takže jeho import z klientského souboru shodí build. Chybu tak
najdeš při sestavení, ne v produkci.

### --see--

next-fullstack/server-a-client-komponenty#tajemstvi-a-verejne-promenne
