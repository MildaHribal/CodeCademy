# SEO, metadata, obrázky a písma

Server ti vyrábí HTML — teď je potřeba, aby v něm bylo napsané, co ta stránka je.
Na tom stojí titulek v panelu, náhled odkazu v chatu, pozice ve vyhledávači i to,
jestli text pod obrázkem uskočí pod prstem, zrovna když na něj uživatel klikal.

:::check pretest
Pošleš kamarádovi odkaz na svůj produkt a v chatu se ukáže jen holá adresa. Napiš, kolik značek v `<head>` k tomu chybí.

### --expected--
3

### --accept--
tři
2
dvě
4

### --why--
Obvykle tři: `og:title`, `og:description` a `og:image`. Náhled si stáhne HTML,
přečte tyhle značky a nic víc — když tam nejsou, nemá co ukázat.
:::

:::check pretest
Co myslíš, že udělá s textem pod obrázkem fotka, která nemá v HTML uvedené rozměry?

### --answer--
Nic, prohlížeč si místo rezervuje sám.

#### --why--
Aby si prohlížeč místo rezervoval, musí vědět, jak je obrázek velký. To se
z adresy souboru nepozná — rozměry se dozví, až data dorazí.

### --correct--
Až se fotka načte, text pod ní uskočí dolů.
:::

## Problém: HTML, které o sobě nic neřekne

Robot vyhledávače i náhled odkazu v chatu dělají to samé: stáhnou HTML a přečtou
`<head>`. Nic víc. Tahle stránka tedy nemá co nabídnout:

```html
<head>
  <meta charset="utf-8">
  <title>Create Next App</title>
</head>
```

A tahle ano:

```html
<head>
  <title>Etiopie Yirgacheffe | Pražírna Zrno</title>
  <meta name="description" content="Citrusová a květinová káva z pražírny v Brně. 289 Kč za 250 g.">
  <link rel="canonical" href="https://zrno.cz/kava/etiopie-yirgacheffe">
  <meta property="og:title" content="Etiopie Yirgacheffe">
  <meta property="og:image" content="https://zrno.cz/kava/etiopie-yirgacheffe/opengraph-image">
</head>
```

V App Routeru tyhle značky nepíšeš ručně. Popíšeš je **objektem** a Next.js z něj
`<head>` složí.

> [!REMEMBER]
> **Metadata jsou export ze stránky nebo layoutu, ne značky v šabloně.**
> Next.js je posbírá po celé větvi a složí do `<head>` ještě na serveru — tedy
> v čase, kdy je robot uvidí.

:::check
Proč nestačí titulek stránky nastavit v `useEffect` přes `document.title`?

### --expected--
robot nespouští JavaScript

### --accept--
protože se to stane až v prohlížeči
robot ho neuvidí
náhled odkazu nespouští JS

### --why--
Náhled i robot pošlou jeden požadavek a přečtou, co dostanou. Co dopíše JavaScript
v prohlížeči, se k nim nedostane.
:::

## Metadata jako export

[[Metadata stránky]] napíšeš jako export `metadata`. Když jsou stejná pro celou
větev, patří do layoutu:

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://zrno.cz'),
  title: {
    default: 'Pražírna Zrno',
    template: '%s | Pražírna Zrno',
  },
  description: 'Výběrová káva pražená v Brně. Čerstvě, poctivě, bez marketingu.',
  openGraph: { locale: 'cs_CZ', type: 'website', siteName: 'Pražírna Zrno' },
};
```

- `metadataBase` udělá z relativních adres absolutní. Bez něj bude `og:image`
  relativní a většina náhledů ho zahodí.
- `template` doplní název webu k titulku každé podstránky. `default` se použije tam,
  kde si stránka titulek nenastaví.

Když metadata závisí na datech, exportuješ místo objektu **funkci**. Dostane stejné
`params` jako stránka, a stejně jako ona je musí počkat:

```tsx
// app/kava/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const kava = await ctiKavu(slug);
  if (!kava) return { title: 'Káva nenalezena' };

  return {
    title: kava.nazev,                                  // → „Etiopie Yirgacheffe | Pražírna Zrno"
    description: kava.popis.slice(0, 155),
    alternates: { canonical: `/kava/${kava.slug}` },
    openGraph: { title: kava.nazev, images: [`/kava/${kava.slug}/opengraph-image`] },
  };
}
```

> [!TIP]
> `alternates.canonical` říká vyhledávači, která adresa je ta pravá. Je to nejlevnější
> oprava duplicitního obsahu, když se tatáž stránka dá otevřít s parametry
> (`?utm_source=…`, `?razeni=cena`).

:::check
Layout má `title.template` = `'%s | Pražírna Zrno'` a stránka exportuje `title: 'Košík'`. Napiš, co bude v `<title>`.

### --expected--
Košík | Pražírna Zrno

### --accept--
Košík | Pražírna Zrno

### --why--
`template` je šablona rodiče, `%s` se nahradí titulkem potomka. Kdyby stránka
titulek nenastavila, použije se `default` z layoutu.
:::

## Náhledový obrázek, sitemap a robots

Tři soubory ve složce `app/`, které dělají věci, na které se jinde kupují nástroje.

**Náhledový obrázek** (`opengraph-image.tsx`) se vykreslí z JSX do PNG přímo na
serveru. Žádný Photoshop, žádný generátor — píšeš to jako komponentu:

```tsx
// app/kava/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Obrazek({ params }) {
  const { slug } = await params;
  const kava = await ctiKavu(slug);

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    width: '100%', height: '100%', padding: 80, background: '#26201b', color: '#fff' }}>
        <div style={{ fontSize: 34, opacity: 0.7 }}>Pražírna Zrno</div>
        <div style={{ fontSize: 76 }}>{kava.nazev}</div>
        <div style={{ fontSize: 40, color: '#e0a870' }}>{kava.cena} Kč / 250 g</div>
      </div>
    ),
    size,
  );
}
```

Tady se ta práce vyplatí okamžitě — takhle vypadá výsledek, když někdo tvůj odkaz
pošle do chatu:

:::live dom
```html
<div class="chat">
  <p class="zprava">Koukni na tuhle kávu, je fakt dobrá 👀</p>
  <a class="nahled" href="#">
    <div class="og">
      <span class="og__web">Pražírna Zrno</span>
      <span class="og__nazev">Etiopie Yirgacheffe</span>
      <span class="og__cena">289 Kč / 250 g</span>
    </div>
    <div class="nahled__text">
      <strong>Etiopie Yirgacheffe | Pražírna Zrno</strong>
      <span>Citrusová a květinová káva z pražírny v Brně.</span>
      <small>zrno.cz</small>
    </div>
  </a>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #e9edf2; }
.chat { max-width: 26rem; margin-inline: auto; }
.zprava { margin: 0 0 0.6rem; padding: 0.7rem 1rem; border-radius: 1rem 1rem 1rem 0.25rem; background: #fff; box-shadow: 0 6px 18px -14px #24303f; }
.nahled { display: block; overflow: hidden; border-radius: 0.9rem; background: #fff; text-decoration: none; color: inherit; box-shadow: 0 10px 26px -18px #24303f; transition: transform 160ms ease; }
.nahled:hover, .nahled:focus-visible { transform: translateY(-2px); }
.og { display: flex; flex-direction: column; justify-content: center; gap: 0.35rem; aspect-ratio: 1200 / 630; padding: 1.5rem; background: radial-gradient(120% 140% at 80% 0%, #3c3129 0%, #26201b 60%); color: #fff; }
.og__web { font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.65; }
.og__nazev { font-size: 1.7rem; font-weight: 700; line-height: 1.1; }
.og__cena { font-size: 1rem; color: #e0a870; }
.nahled__text { display: grid; gap: 0.2rem; padding: 0.8rem 1rem 1rem; }
.nahled__text strong { font-size: 0.92rem; }
.nahled__text span { font-size: 0.82rem; color: #55606d; }
.nahled__text small { font-size: 0.72rem; color: #8d97a3; text-transform: uppercase; letter-spacing: 0.08em; }
@media (prefers-reduced-motion: reduce) { .nahled { transition: none; } }
```
:::

Zkus změnit text v `.og__nazev` a barvu pozadí v `.og` a sleduj, jak se náhled
promění — přesně tohle v Next.js popisuješ JSX uvnitř `ImageResponse`.

**Sitemap** a **robots** jsou taky obyčejné funkce:

```ts
// app/sitemap.ts
export default async function sitemap() {
  const kavy = await ctiVsechnyKavy();

  return [
    { url: 'https://zrno.cz', lastModified: new Date(), priority: 1 },
    ...kavy.map((kava) => ({
      url: `https://zrno.cz/kava/${kava.slug}`,
      lastModified: kava.zmeneno,
    })),
  ];
}
```

```ts
// app/robots.ts
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/kosik'] }],
    sitemap: 'https://zrno.cz/sitemap.xml',
  };
}
```

Next.js z nich vyrobí `/sitemap.xml` a `/robots.txt`. Protože je to kód, seznam
adres se generuje z databáze a nezastará.

:::check
Napiš jméno souboru ve složce `app/`, ze kterého Next.js vyrobí náhledový obrázek pro sdílení.

### --expected--
opengraph-image.tsx

### --accept--
opengraph-image
opengraph-image.tsx
opengraph-image.js

### --why--
Stejně jako `page` nebo `layout` je i tohle pevné jméno. Může to být hotový
obrázek (`opengraph-image.png`), nebo kód, který ho vykreslí.
:::

## Obrázky: `next/image` a uskakující text

Obrázky bývají nejtěžší část stránky. `next/image` za tebe zmenší velikost, převede
formát, počká s načtením těch mimo obrazovku — a hlavně **rezervuje místo**.

```tsx
import Image from 'next/image';

<Image
  src="/kava/etiopie.jpg"
  alt="Zrnková káva Etiopie Yirgacheffe v papírovém sáčku"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, 400px"
  priority                    // jen pro obrázek, který je vidět hned po otevření
/>
```

Proč na rozměrech tolik záleží, uvidíš, když je vynecháš:

:::live predict
```html
<article class="clanek">
  <h1>Etiopie Yirgacheffe</h1>
  <div class="foto" id="foto"></div>
  <p class="text">Citrusová a květinová. <button id="koupit">Koupit za 289 Kč</button></p>
</article>
<button id="nacist" class="nacist">Načíst fotku</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #faf7f4; color: #26201b; }
.clanek { max-width: 24rem; padding: 1.25rem; border-radius: 0.9rem; background: #fff; box-shadow: 0 10px 26px -20px #6b4b2f; }
h1 { margin: 0 0 0.75rem; font-size: 1.25rem; }
.foto { background: linear-gradient(135deg, #b4573a, #e0a870); border-radius: 0.6rem; }
.text { margin: 0.75rem 0 0; }
button { padding: 0.5rem 0.9rem; border: 0; border-radius: 999px; background: #26201b; color: #fff; font: inherit; cursor: pointer; }
.nacist { margin-top: 1rem; background: #b4573a; }
```
```js
document.querySelector('#nacist').addEventListener('click', () => {
  // Obrázek dorazil ze sítě a teprve teď je známá jeho výška.
  document.querySelector('#foto').style.height = '180px';
});
```
--question-- Co se stane s tlačítkem „Koupit za 289 Kč" ve chvíli, kdy se fotka načte?
--option-- Zůstane na místě, fotka se vejde do rezervovaného prostoru.
--option*-- Uskočí o 180 px dolů, takže klik může trefit něco jiného.
--option-- Fotka tlačítko překryje, protože se vykreslí přes něj.
--why-- Dokud obrázek nemá známou výšku, zabírá nula pixelů. Jakmile ji dostane, všechno pod ním se posune — tomuhle se říká posun rozvržení (*layout shift*) a měří se metrikou CLS. `next/image` s `width` a `height` si místo rezervuje předem, takže se nic nehne.
:::

Zkus si v kódu ukázky nastavit `.foto { aspect-ratio: 4 / 3; }` a znovu kliknout
na **Načíst fotku** — místo je rezervované a nic neuskočí.

:::compare
```html
<div class="ukazka">
  <div class="foto"></div>
  <p class="popisek">Koupit za 289 Kč</p>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1.25rem; background: #faf7f4; }
.ukazka { max-width: 15rem; padding: 0.9rem; border-radius: 0.8rem; background: #fff; box-shadow: 0 8px 22px -18px #6b4b2f; }
.foto { background: linear-gradient(135deg, #b4573a, #e0a870); border-radius: 0.5rem; }
.popisek { margin: 0.6rem 0 0; font-weight: 600; }
```
--variant-- Bez rozměrů: místo se rezervuje až po načtení
```css
.foto { height: 0; outline: 2px dashed #b4573a; outline-offset: 3px; }
```
--variant-- S width a height: místo je rezervované předem
```css
.foto { aspect-ratio: 4 / 3; outline: 2px dashed #2f7d5d; outline-offset: 3px; }
```
:::

> [!PITFALL]
> `priority` dej **jen** obrázku, který je vidět hned po otevření (typicky jeden
> na stránku). Když ho dáš všem, prohlížeč začne stahovat naráz všechno a první
> zobrazení se zpomalí — tedy přesný opak toho, co jsi chtěl.

:::check
Napiš dva propy komponenty `Image`, díky kterým se text pod obrázkem nepohne.

### --expected--
width, height

### --accept--
width a height
width height

### --why--
Z poměru `width` a `height` si prohlížeč spočítá místo dřív, než obrázek dorazí.
Skutečná zobrazená velikost se pak řídí CSS, ale místo je rezervované.
:::

## Písma: `next/font`

Písmo z cizí domény má dva problémy: jeden požadavek navíc na jiný server a bliknutí,
než se načte. `next/font` je vyřeší tím, že si soubor s písmem **stáhne při buildu**
a naservíruje ho z tvojí domény.

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap' });

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

- `subsets: ['latin-ext']` je pro češtinu povinné — bez něj nemá písmo háčky
  a čárky a prohlížeč je dokreslí z náhradního.
- `display: 'swap'` znamená „ukaž text náhradním písmem hned a vyměň ho, až
  dorazí to pravé". Uživatel tedy nikdy nekouká na neviditelný text.
- Vlastní soubor se dá připojit přes `next/font/local` úplně stejně.

:::check
Napiš hodnotu, kterou musíš přidat do `subsets`, aby písmo mělo české háčky a čárky.

### --expected--
latin-ext

### --accept--
'latin-ext'
latin-ext

### --why--
Základní `latin` obsahuje jen anglickou abecedu. Bez `latin-ext` se `ř`, `ě` a `ů`
vezmou z náhradního písma, takže je v textu vidět, že „vypadají jinak".
:::

## Co z toho měří Core Web Vitals

Trojice metrik, kterou vyhledávač i lidé skutečně cítí:

| metrika | co měří | co s tím v Next.js |
|---|---|---|
| **LCP** (*Largest Contentful Paint*) | kdy je vidět největší prvek | serverové vykreslení, `priority` na hlavní obrázek |
| **CLS** (*Cumulative Layout Shift*) | jak moc obsah uskakuje | `width`/`height` u obrázků, `next/font` |
| **INP** (*Interaction to Next Paint*) | jak rychle stránka reaguje na klik | méně klientského JavaScriptu, hranici `'use client'` co nejníž |

Všimni si, že každý řádek téhle tabulky jsi právě probral. To není náhoda —
většina „SEO optimalizace" je ve skutečnosti technická práce, kterou si framework
řekne sám.

> [!TIP]
> Měř to. V Chrome DevTools na kartě **Lighthouse** pusť analýzu nad produkčním
> buildem (`next build && next start`), ne nad `next dev` — vývojový režim je
> pomalejší z principu a naměříš nesmysly.

:::check
Uživateli při načítání uskakuje obsah. Napiš zkratku metriky, která to měří.

### --expected--
CLS

### --accept--
cls
Cumulative Layout Shift

### --why--
CLS sčítá, o kolik se během načítání posunul viditelný obsah. Nejčastější příčiny
jsou obrázky bez rozměrů, reklamy a písma bez rezervovaného místa.
:::

## Typické chyby a pasti

> [!PITFALL] `og:image` se v náhledu neukáže
> Adresa obrázku je relativní a náhledový robot neví, vůči čemu. **Oprava:**
> nastav `metadataBase: new URL('https://…')` v kořenovém layoutu; Next.js pak
> relativní adresy doplní na absolutní.

> [!PITFALL] `generateMetadata` i stránka načítají tatáž data dvakrát
> Obě funkce běží samostatně, takže se dotaz provede dvakrát. **Oprava:** obal
> čtecí funkci do `cache()` z Reactu — během jednoho požadavku se pak provede jednou.

> [!PITFALL] `metadata` exportované z klientské komponenty
> Export `metadata` funguje jen v serverovém souboru. V souboru s `'use client'`
> se tiše ignoruje. **Oprava:** metadata dej do `page.tsx` nebo `layout.tsx`
> a klientskou část si z něj naimportuj jako komponentu.

> [!PITFALL] Stránka bez `description` a s jedním `h1` na celém webu
> Vyhledávač si popisek vymyslí z prvního odstavce a bývá to nepěkné. **Oprava:**
> každá stránka má vlastní `description` do 155 znaků a vlastní `h1`, který říká,
> co na té stránce je.

> [!PITFALL] `alt=""` u fotky produktu
> Prázdný `alt` znamená „dekorace, čtečko přeskoč". U obsahového obrázku je to
> chyba přístupnosti i SEO. **Oprava:** popiš, co na obrázku je; prázdný `alt`
> nech jen pro ozdobné tvary a ikony vedle textu, který totéž říká slovy.

:::check
Dotaz na kávu se provede dvakrát: jednou v `generateMetadata`, jednou ve stránce. Napiš jméno funkce z Reactu, kterou to spravíš.

### --expected--
cache

### --accept--
cache()
cache z Reactu
React.cache

### --why--
`cache()` si během jednoho požadavku zapamatuje výsledek volání se stejnými
argumenty. Obě funkce si tak sáhnou pro totéž a dotaz proběhne jednou.
:::

## Kde to najdeš v MDN

- [`<meta>` a značky v `<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) —
  co přesně jsou `description`, `og:title` a `viewport`; Next.js z tvého objektu
  skládá právě je.
- [Cumulative Layout Shift](https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift) —
  jak se posun rozvržení počítá a co ho způsobuje.
- [`<link rel="canonical">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel) —
  kdy a proč vyhledávači říct, která adresa je ta pravá.
- [`<img>`: `srcset` a `sizes`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#srcset) —
  přesně tohle za tebe generuje `next/image`; vyplatí se rozumět tomu, co vzniká.

> [!NOTE]
> Úplný seznam klíčů objektu `metadata` (jsou jich desítky) má Next.js na
> [nextjs.org/docs/app/api-reference/functions/generate-metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
> Nemusíš je znát zpaměti — stačí vědět, že tam jsou.

# --questions--

## --question--

Napiš klíč v kořenových `metadata`, bez kterého bude `og:image` relativní
a náhledy odkazů ho zahodí.

### --expected--

metadataBase

### --accept--

metadataBase: new URL('https://…')

### --why--

`metadataBase` je adresa, vůči které Next.js dopočítá všechny relativní odkazy
v metadatech. Náhledový robot pracuje s cizí doménou, takže potřebuje absolutní URL.

### --see--

next-fullstack/seo-a-metadata#metadata-jako-export

## --question--

Stránka detailu potřebuje titulek z databáze. Napiš jméno funkce, kterou místo
objektu `metadata` exportuješ.

### --expected--

generateMetadata

### --accept--

generateMetadata()
export async function generateMetadata

### --why--

`metadata` je konstanta, takže se do ní data z databáze dostat nedají.
`generateMetadata` je `async` funkce, dostane stejné `params` jako stránka
a může si data načíst sama.

### --see--

next-fullstack/seo-a-metadata#metadata-jako-export

## --question--

Co dělá `next/font` jinak než odkaz na Google Fonts v `<head>`?

### --answer--

Načte písmo dřív, protože použije `preload` na cizí doméně.

#### --why--

`preload` by šel přidat i k odkazu na cizí doménu. Rozdíl je v tom, odkud se
soubor stahuje, ne v pořadí stahování.

### --correct--

Stáhne soubor s písmem při buildu a servíruje ho z tvojí domény.

#### --why--

Odpadne tím spojení s cizím serverem i jeho DNS a písmo se načte s ostatními
soubory stránky. Navíc se spočítá náhradní písmo tak, aby text neuskakoval.

### --answer--

Převede písmo do formátu, který umí i staré prohlížeče.

#### --why--

Formát `woff2` dnes umí každý prohlížeč, který Next.js podporuje. O převody
tady nejde.

### --see--

next-fullstack/seo-a-metadata#pisma-next-font

## --question--

Obrázek na stránce nemá `width` ani `height`. Napiš zkratku metriky Core Web
Vitals, která se tím zhorší.

### --expected--

CLS

### --accept--

cls
Cumulative Layout Shift

### --why--

Bez rozměrů zabírá obrázek do načtení nulovou výšku a všechno pod ním pak
uskočí. CLS přesně tohle sčítá — a je to jediná z metrik, kterou uživatel vnímá
jako „ta stránka mi utíká pod rukama".

### --see--

next-fullstack/seo-a-metadata#obrazky-next-image-a-uskakujici-text
