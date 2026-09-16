# CSR, SSR, SSG a streamování

Otevři si libovolný e-shop a dej **Zobrazit zdrojový kód stránky**. U jednoho
uvidíš celý text produktů, u druhého prázdný `<div id="root">`. Ten rozdíl
rozhoduje o tom, jestli tě najde Google, jak rychle uvidí první návštěvník obsah
a jestli vůbec potřebuješ server. Tady se naučíš ten rozdíl pojmenovat a vybrat.

:::check pretest
Vite SPA (aplikace v Reactu, jakou jsi postavil v sekci React aplikace) vypisuje 20 článků. Kolik z jejich textu najde v HTML robot, který neumí spustit JavaScript? Napiš číslo.

### --expected--
0

### --why--
Vite pošle prázdnou stránku s jedním `<div>` a balíkem JavaScriptu. Text článků
vznikne až v prohlížeči, takže v odpovědi serveru není ani jeden.
:::

:::check pretest
Komponenta vypíše `Dobrý den` jen tehdy, když `typeof window !== 'undefined'`. Co myslíš, že se stane, když stejnou komponentu vykreslí nejdřív server a pak prohlížeč?

### --answer--
Nic zvláštního, server tu podmínku přeskočí.

#### --why--
Server žádné podmínky nepřeskakuje — spustí přesně ten samý kód, jen v prostředí,
kde některé věci chybí.

### --correct--
Server a prohlížeč vyrobí jiný text a React na to upozorní.
:::

## Problém: prázdné HTML a prázdný Google

Máš hotovou SPA v Reactu. Funguje, je rychlá při přepínání stránek — a pak
přijde klient s tím, že produkty nejsou ve vyhledávači a že se na mobilu
sekundu kouká na bílou stránku. Podívej se, co server vlastně posílá:

:::live node predict
```js
// kontrola.js — co najde v odpovědi serveru robot, který neumí JavaScript
const html = await (await fetch('http://localhost:3000/')).text();

console.log(html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] ?? 'žádný h1');
console.log(html.includes('Etiopie Yirgacheffe') ? 'produkty v HTML jsou' : 'produkty v HTML nejsou');
```
--question-- Na portu 3000 běží hotová Vite SPA s katalogem kávy. Co skript vypíše?
--output--
```text
žádný h1
produkty v HTML nejsou
```
--why-- Vite pošle `index.html` s prázdným `<div id="root">` a odkazem na JavaScript. Nadpis ani produkty v odpovědi nejsou — vzniknou až po stažení a spuštění balíku v prohlížeči. Robot, čtečka odkazů na sociálních sítích ani náhled v chatu si na to nepočkají.
:::

Zkus si to: až budeš mít vedle sebe SPA a Next.js, pusť ten skript proti oběma
a srovnej výstup.

> [!REMEMBER]
> **Tvoje komponenta se umí vykreslit dvakrát: na serveru do HTML a v prohlížeči
> do DOM. Volba „kde" se dělá pro každou stránku zvlášť, ne pro celou aplikaci.**

Next.js není „React, který umí backend". Je to React, který tu volbu nabízí
u každé stránky — a proto má smysl znát čtyři možnosti, které máš.

:::check
Proč náhled odkazu v chatu u Vite SPA obvykle ukáže jen doménu bez názvu stránky?

### --answer--
Protože chat náhledy z Reactu nepodporuje.

#### --why--
Myslíš si, že je problém v Reactu? Náhled si jen stáhne HTML a přečte značky
v `<head>`. Na frameworku mu nezáleží.

### --correct--
Protože si stáhne HTML, ale nespustí JavaScript, a v tom HTML žádný název není.

#### --why--
Náhledový robot pošle jediný požadavek a přečte, co dostane. Titulek, který
dopíše JavaScript v prohlížeči, se k němu nikdy nedostane.
:::

## Čtyři strategie, čtyři výsledky

| strategie | kde vzniká HTML | kdy | k čemu |
|---|---|---|---|
| **CSR** (*client-side rendering*) | v prohlížeči | při každém otevření | přihlášené aplikace za loginem, editory, dashboardy |
| **SSR** (*server-side rendering*) | na serveru | při každém požadavku | obsah podle uživatele nebo podle právě aktuálních dat |
| **SSG** (*static site generation*) | na serveru | jednou při buildu | blog, dokumentace, marketing, karta produktu |
| **ISR** (*incremental static regeneration*) | na serveru | při buildu a pak znovu po čase nebo na pokyn | katalog s cenami, které se mění jednou za hodinu |

Rozdíl mezi CSR a SSR nejlépe uvidíš na tom, co jde po drátě. Stejná stránka,
dvě odpovědi serveru:

```html
<!-- CSR: odpověď serveru -->
<div id="root"></div>
<script type="module" src="/assets/index-a3f9.js"></script>
```

```html
<!-- SSR nebo SSG: odpověď serveru -->
<main>
  <h1>Etiopie Yirgacheffe</h1>
  <p>289 Kč / 250 g</p>
</main>
<script type="module" src="/_next/static/chunks/main-9c1.js"></script>
```

Ve druhém případě vidí návštěvník text ještě před tím, než se stáhne
JavaScript. Skript se stáhne taky, ale už jen proto, aby stránka **ožila**.

> [!NOTE]
> SSG a ISR jsou v Next.js jedna a ta samá věc s jiným nastavením platnosti.
> Proto se jim dohromady říká ==prerendering==: HTML vznikne dřív, než o něj
> někdo požádá.

:::check
Máš stránku s obchodními podmínkami. Mění se dvakrát za rok, musí ji najít Google. Kterou strategii zvolíš a proč? Odpověz jedním slovem a jednou větou.

### --expected--
SSG

### --accept--
ssg
statické vykreslení
prerendering

### --why--
Obsah je pro všechny stejný a skoro se nemění, takže není důvod ho vyrábět při
každém požadavku. HTML vznikne jednou při buildu a server ho jen posílá.
:::

## Hydratace: HTML samo nic neumí

Server pošle HTML. Tlačítko v něm je vidět, ale kliknutí zatím nic nedělá —
nikdo na něj ještě nenavěsil obsluhu. Tu práci udělá JavaScript po stažení:
projde hotové HTML, přiřadí k prvkům komponenty a navěsí obsluhy událostí.
Tomu se říká [[hydratace]].

> [!REMEMBER]
> **Hydratace je porovnání, ne nové vykreslení.** React očekává, že z jeho
> komponent vyjde v prohlížeči **totéž**, co poslal server. Když ne, ohlásí chybu.

A tady je nejčastější past celého Next.js. Kód, který se chová jinak na serveru
a jinak v prohlížeči:

:::live js predict
```js
const jeProhlizec = typeof window !== 'undefined';

function Uvitani() {
  return jeProhlizec ? 'Dobrý den, Evo' : 'Přihlásit se';
}

console.log(Uvitani());
```
--question-- Tenhle kód běží v prohlížeči. Co vypíše `console.log`?
--expected-- Dobrý den, Evo
--why-- V prohlížeči `window` existuje, takže projde první větev. Na serveru `window` neexistuje a stejná komponenta vrátí `Přihlásit se`. Server tedy pošle HTML s textem „Přihlásit se", prohlížeč při hydrataci vyrobí „Dobrý den, Evo" — a React ohlásí nesoulad.
:::

Zkus změnit podmínku na `typeof document === 'undefined'` a sleduj, jak se
výstup překlopí.

Chybová hláška v konzoli vypadá takhle:

```text
Hydration failed because the server rendered text didn't match the client.
As a result this tree will be regenerated on the client.

  <p>
+   Dobrý den, Evo
-   Přihlásit se
```

React se z toho vzpamatuje — dotčený kus vykreslí na klientovi znovu — ale
uživatel na okamžik uvidí nesprávný obsah a ty máš v konzoli chybu.

:::check
Po hydrataci se text v odstavci sám přepsal a v konzoli je `Hydration failed`. Kde je příčina: v HTML ze serveru, v JavaScriptu, nebo v tom, že se ty dva rozcházejí?

### --expected--
v tom, že se rozcházejí

### --accept--
rozcházejí se
v rozdílu mezi nimi
oba výsledky se liší

### --why--
Ani jeden z výstupů nemusí být „špatný" sám o sobě. Hydratace hlídá jen to, aby
byly **stejné** — proto se hláška objeví i u naprosto funkčního kódu.
:::

## Co nesoulad způsobuje

Vždycky je to hodnota, která na serveru a v prohlížeči nemůže být stejná:

- **čas a datum** — `new Date()`, `Date.now()`, „před 3 minutami",
- **náhoda** — `Math.random()`, `crypto.randomUUID()`,
- **věci z prohlížeče** — `window`, `localStorage`, `navigator.language`, šířka okna,
- **formátování podle prostředí** — `toLocaleDateString()` bez uvedeného jazyka
  (server má často `en-US`, prohlížeč `cs-CZ`),
- **HTML, které přepíše prohlížeč** — `<p>` uvnitř `<p>`, `<div>` uvnitř `<p>`.
  Prohlížeč neplatné vnoření opraví, a tím se strom rozejde.

Řešení je vždy jedno ze tří: hodnotu spočítat **až po hydrataci**
(`useEffect`), nebo ji spočítat **jen na serveru** a poslat jako prop, nebo
serveru říct, že tenhle kus má vzniknout až při požadavku (`connection()`
a `<Suspense>`, k tomu se dostaneme v lekci [Data a server actions](see:next-fullstack/data-a-server-actions#ceho-se-cache-nesmi-dotknout)).

```jsx
'use client';

import { useEffect, useState } from 'react';

export function Hodiny() {
  // Na serveru i při hydrataci je to prázdné — shoda. Čas dopíše až efekt.
  const [cas, setCas] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setCas(new Date().toLocaleTimeString('cs-CZ')), 1000);
    return () => clearInterval(id);
  }, []);

  return <time suppressHydrationWarning>{cas ?? '—'}</time>;
}
```

> [!PITFALL]
> `suppressHydrationWarning` **nesoulad neopraví**, jen zticha přijme rozdíl
> u jednoho prvku. Patří na časy a náhodná id, nikdy na celý layout — jinak si
> zamázneš skutečnou chybu.

:::check
Proč se `useState(new Date().toLocaleTimeString())` chová jinak než `useState(null)` a `useEffect`?

### --answer--
Protože `useState` běží jen v prohlížeči.

#### --why--
Myslíš si, že hooky na serveru neběží? `useState` se vyhodnotí i při
serverovém vykreslení — jeho počáteční hodnota jde přímo do HTML.

### --correct--
Protože počáteční hodnota `useState` se vyhodnotí i na serveru a čas se za tu chvíli změní.

#### --why--
Počáteční hodnota je součástí prvního vykreslení, tedy i HTML ze serveru.
`useEffect` se naopak spustí až v prohlížeči po hydrataci, kdy už je porovnání
za námi.
:::

## Streamování: nečekat na to nejpomalejší

SSR má jednu nevýhodu: server pošle HTML teprve tehdy, když má **všechna**
data. Jedna pomalá tabulka hodnocení tak zdrží celou stránku.

Streamování to řeší po částech. Server pošle rychlou část hned a pomalý kus
dopošle do stejného spojení, jakmile je hotový. Místo, kde se to stane,
označíš komponentou `<Suspense>` — a než data dorazí, je na jeho místě `fallback`.

:::live react
```jsx
import { Suspense, use, useState } from 'react';

function nactiHodnoceni() {
  return new Promise((resolve) => setTimeout(() => resolve('4,8 z 5 (312 hodnocení)'), 900));
}

function Hodnoceni({ slib }) {
  const text = use(slib);
  return <p className="hodnoceni">{text}</p>;
}

export default function Stranka() {
  const [slib] = useState(() => nactiHodnoceni());

  return (
    <article>
      <h1>Etiopie Yirgacheffe</h1>
      <p className="cena">289 Kč / 250 g</p>
      <Suspense fallback={<p className="skeleton">Načítám hodnocení…</p>}>
        <Hodnoceni slib={slib} />
      </Suspense>
    </article>
  );
}
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; color: #1f2933; background: #fbf9f7; }
article { max-width: 24rem; padding: 1.5rem; border-radius: 1rem; background: #fff; box-shadow: 0 10px 30px -18px #6b4b2f; }
h1 { margin: 0 0 0.25rem; font-size: 1.4rem; }
.cena { margin: 0 0 1rem; color: #8a6c52; font-weight: 600; }
.hodnoceni { margin: 0; padding: 0.6rem 0.8rem; border-radius: 0.6rem; background: #f0ece8; }
.skeleton { margin: 0; padding: 0.6rem 0.8rem; border-radius: 0.6rem; background: linear-gradient(90deg, #eee 25%, #e0dcd8 50%, #eee 75%); background-size: 200% 100%; animation: pulz 1.2s infinite; color: transparent; }
@keyframes pulz { to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
```
:::

Zkus změnit 900 na 4000 a sleduj, jak dlouho zůstane na místě šedý pruh —
a všimni si, že název a cena jsou vidět celou dobu.

V Next.js tenhle vzor dostaneš dvěma způsoby: souborem `loading.tsx`, který
obalí celou stránku (lekce [App Router](see:next-fullstack/app-router#loading-a-error-stavy-za-tebe)),
nebo `<Suspense>` přímo v kódu okolo jedné pomalé komponenty. Rychlá část
stránky se tak dostane do HTML hned; tomu se říká [[statická skořápka]].

:::compare
```html
<div class="ukazka">
  <p class="popis">Odpověď serveru dorazí naráz, nebo po částech.</p>
  <div class="pruh"></div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; }
.ukazka { padding: 1rem; border: 1px solid #ddd; border-radius: 0.75rem; }
.popis { margin: 0 0 0.75rem; font-size: 0.9rem; color: #555; }
.pruh { height: 1.5rem; border-radius: 0.25rem; }
```
--variant-- Bez streamování: čeká se na všechno
```css
.pruh { background: #c62828; }
.popis::after { content: " Uživatel vidí prázdno 1,2 s."; font-weight: 600; }
```
--variant-- Se streamováním: skořápka hned
```css
.pruh { background: linear-gradient(90deg, #2e7d32 30%, #cfd8dc 30%); }
.popis::after { content: " Uživatel vidí obsah za 0,2 s, zbytek dorazí."; font-weight: 600; }
```
:::

:::check
Stránka detailu produktu potřebuje popis (rychlý dotaz) a doporučené zboží (pomalé API). Co dáš do `<Suspense>` a proč?

### --expected--
doporučené zboží

### --accept--
to pomalé API
doporučení

### --why--
Do `<Suspense>` patří **pomalá** část. Popis se dostane do prvního HTML
a doporučení dorazí, až bude. Kdybys obalil obojí, uživatel čeká zbytečně.
:::

## Kdy Next.js a kdy stačí SPA

Next.js přidává server a s ním i starosti: build, prostředí, nasazení,
hranici mezi serverem a klientem. Za to dostaneš HTML, SEO, přístup
k databázi bez veřejného API a menší balík JavaScriptu.

**Vezmi Next.js, když** stránku má najít Google nebo náhled odkazu, když
obsah patří veřejnosti, když potřebuješ data z databáze rovnou na serveru,
nebo když ti záleží na rychlosti prvního zobrazení.

**Zůstaň u Vite SPA, když** je celá aplikace za přihlášením (interní nástroj,
administrace), když je frontend nasazený zvlášť od hotového API, nebo když jde
o silně interaktivní plochu typu editor či plátno, kde první HTML nic neřeší.

:::check
Klient chce web restaurace: menu, fotky, otevírací doba a rezervační formulář. Jednou za měsíc se mění menu. Napiš, co z toho je hlavní důvod pro Next.js.

### --expected--
vyhledávač

### --accept--
SEO
aby to našel Google
indexování obsahu

### --why--
Veřejný obsah, který má někdo najít, potřebuje být v HTML. Menu se skoro nemění,
takže ho Next.js navíc vyrobí předem — rezervační formulář může klidně být
klientský ostrůvek.
:::

:::explain
Kamarád chce předělat interní docházkový systém za přihlášením z Vite SPA do Next.js „kvůli rychlosti a SEO". Vysvětli vlastními slovy, proč to nemusí být dobrý nápad.

## --model--
SEO u aplikace za přihlášením nemá co řešit — roboti se do ní nedostanou, takže
serverové HTML nikomu nepomůže. Rychlost prvního zobrazení je u nástroje, který
má uživatel otevřený celý den, druhořadá. Next.js by zato přinesl server,
build, hranici klient–server a nové třídy chyb, třeba nesoulad při hydrataci.
Když se stránky načítají pomalu, začal bych měřením: nejčastěji to je velký
balík JavaScriptu nebo pomalé API, a to spraví rozdělení kódu, ne framework.

## --checklist--
- Aplikace za přihlášením roboti neindexují, takže SSR pro SEO nic nepřinese.
- U dlouho otevřeného nástroje je první zobrazení méně důležité než odezva.
- Next.js přináší server a hranici klient–server, tedy víc složitosti a nové druhy chyb.
- Pomalé načítání se řeší podle měření, ne výměnou frameworku.
:::

## Typické chyby a pasti

> [!PITFALL] `Hydration failed because the server rendered HTML didn't match the client`
> V komponentě je hodnota, která nemůže být na obou stranách stejná — čas,
> `Math.random()`, `localStorage` nebo `window`. **Oprava:** spočítej ji
> v `useEffect`, nebo ji pošli ze serveru jako prop.

> [!PITFALL] `ReferenceError: window is not defined` při buildu
> Komponenta sahá na `window` (nebo `document`, `localStorage`) v těle, takže
> to spadne už při serverovém vykreslení. **Oprava:** kód přesuň do `useEffect`,
> nebo ho volej z obsluhy události — obojí běží jen v prohlížeči.

> [!PITFALL] `In HTML, <div> cannot be a descendant of <p>`
> Neplatné vnoření značek. Prohlížeč HTML opraví po svém, strom se rozejde
> a hydratace hlásí nesoulad. **Oprava:** oprav vnoření, `<div>` v odstavci
> nahraď `<span>`.

> [!PITFALL] Datum formátované bez jazyka
> `new Date(x).toLocaleDateString()` vezme jazyk prostředí: na serveru
> `en-US` („9/16/2026"), v prohlížeči `cs-CZ` („16. 9. 2026"). **Oprava:**
> jazyk piš vždy: `toLocaleDateString('cs-CZ')`.

> [!PITFALL] „SSR je pomalejší, protože se vykresluje dvakrát"
> Vykreslení HTML na serveru trvá jednotky milisekund. Pomalé bývá **čekání na
> data** — a právě proto existuje streamování. Neodmítej SSR kvůli výkonu,
> dokud si to nezměříš.

:::check
Do komponenty jsi dal `const sirka = window.innerWidth;` a `next build` skončil chybou. Napiš hook, do kterého ten řádek patří.

### --expected--
useEffect

### --why--
Tělo komponenty běží i na serveru, kde `window` neexistuje. `useEffect` se
spustí jen v prohlížeči po vykreslení, takže je pro prohlížečová API bezpečný.
:::

## Kde to najdeš v MDN

- [Client-side rendering](https://developer.mozilla.org/en-US/docs/Glossary/CSR) a
  [Server-side rendering](https://developer.mozilla.org/en-US/docs/Glossary/SSR) —
  slovníkové definice obou pojmů jednou větou, dobré na pohovor.
- [Hydration](https://developer.mozilla.org/en-US/docs/Glossary/Hydration) — co se
  při hydrataci děje a proč HTML samo nestačí.
- [Time to First Byte a First Contentful Paint](https://developer.mozilla.org/en-US/docs/Glossary/First_contentful_paint) —
  metriky, na kterých se volba strategie pozná.
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) —
  proč formátování bez uvedeného jazyka dává na každém stroji jiný výsledek.

> [!NOTE]
> Samotný Next.js na MDN není. Jeho dokumentace je na
> [nextjs.org/docs](https://nextjs.org/docs) — anglicky, ale s krátkými ukázkami
> u každé funkce. Verzi si ověř v levém horním rohu, mezi 14 a 16 se hodně změnilo.

# --questions--

## --question--

Kterou strategii zvolíš pro stránku „Můj košík", kterou nikdo neindexuje a její
obsah je pro každého uživatele jiný?

### --answer--

SSG, protože stránka je jen jedna.

#### --why--

Myslíš si, že jedna adresa znamená jedno HTML? Obsah košíku se liší pro každého
uživatele, takže jedno předvyrobené HTML nikomu nesedí.

### --correct--

CSR nebo SSR — obsah je osobní, předvyrobit ho nejde.

#### --why--

Pro osobní obsah nemá prerendering co uložit. Podle toho, jestli chceš mít
košík i v prvním HTML, zvolíš SSR (ano), nebo CSR (nevadí, že dorazí později).

### --see--

next-fullstack/ssr-csr-ssg#ctyri-strategie-ctyri-vysledky

## --question--

Komponenta vypisuje „Přidáno před 5 minutami" z `Date.now()`. Napiš, co
uvidíš v konzoli prohlížeče při prvním načtení stránky. Stačí první tři slova
hlášky.

### --expected--

Hydration failed because

### --accept--

Hydration failed
hydration failed because the server rendered text didn't match the client

### --why--

Server spočítal rozdíl časů v okamžiku požadavku, prohlížeč o chvíli později.
Texty se neshodují, takže React ohlásí nesoulad při hydrataci a dotčený podstrom
vykreslí znovu.

### --see--

next-fullstack/ssr-csr-ssg#co-nesoulad-zpusobuje

## --question--

Stránka má rychlý popis akce a pomalý seznam přihlášených lidí z cizího API.
Napiš jméno komponenty z Reactu, kterou obalíš ten pomalý seznam, aby popis
dorazil uživateli hned.

### --expected--

Suspense

### --accept--

<Suspense>
React.Suspense

### --why--

`<Suspense>` označí místo, kde se smí čekat. Server pošle zbytek stránky
i `fallback` hned a hotový seznam dopošle do stejného spojení.

### --see--

next-fullstack/ssr-csr-ssg#streamovani-necekat-na-to-nejpomalejsi

## --question--

Co konkrétně dělá hydratace s HTML, které přišlo ze serveru?

### --answer--

Zahodí ho a vykreslí stránku v prohlížeči znovu od nuly.

#### --why--

Myslíš si, že serverové HTML je jen náhled? Pak by nemělo smysl ho posílat.
React se ho snaží použít, ne zahodit.

### --correct--

Projde ho, přiřadí k prvkům komponenty a navěsí obsluhy událostí — a přitom
kontroluje, že mu výsledek vychází stejně.

#### --why--

Proto hydratace umí ohlásit nesoulad: porovnává, co by vykreslila, s tím, co
v dokumentu už je. Když se to shoduje, jen navěsí interaktivitu.

### --answer--

Přeloží HTML na JSX, aby s ním React mohl pracovat.

#### --why--

Myslíš si, že React čte HTML zpátky do JSX? Žádný takový převod neexistuje —
React si vykreslí svůj strom a jen ho spáruje s existujícími prvky.

### --see--

next-fullstack/ssr-csr-ssg#hydratace-html-samo-nic-neumi
