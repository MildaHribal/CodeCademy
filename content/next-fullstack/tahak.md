## Kde co běží

| | serverová komponenta | klientská komponenta |
|---|---|---|
| direktiva | žádná (výchozí v `app/`) | `'use client'` na prvním řádku |
| kde běží | **jen** na serveru | na serveru **i** v prohlížeči |
| jde do balíku | ne | ano, i všechno, co importuje |
| smí | `await db…`, `process.env`, tajemství | `useState`, `onClick`, `useEffect`, `window` |
| nesmí | stav a obsluhu událostí | číst tajemství, sáhnout do databáze |

- Hranici posouvej **co nejníž**: klientské je jen to, co potřebuje stav.
- Klientská komponenta importuje serverovou → stane se z ní klientská. Jediná cesta
  ven je předat serverový obsah jako `children`.

## Co projde přes hranici jako prop

| projde | neprojde |
|---|---|
| čísla, řetězce, `null`, pole, prosté objekty | funkce (kromě serverové akce) |
| `Date`, `Map`, `Set`, JSX | třídy a instance vlastních tříd |
| [[serverová akce]] | `Symbol`, `WeakMap` |

Hláška při porušení: `Event handlers cannot be passed to Client Component props`.

## Mapa složky `app/`

| soubor | k čemu je |
|---|---|
| `layout.tsx` | obal, který zůstává mezi přechody; kořenový má `<html>` a `<body>` |
| `page.tsx` | stránka na té adrese |
| `loading.tsx` | co se ukáže, dokud se stránka skládá |
| `error.tsx` | hranice chyby; **musí** být klientská a dostane `reset` |
| `not-found.tsx` | stránka pro `notFound()` v téhle větvi |
| `route.ts` | endpoint HTTP místo stránky (`GET`, `POST`, …) |
| `[slug]/` | dynamický segment; `params` je **slib**, počkej na něj |
| `_soucasti/` | složka s podtržítkem se do adres nepočítá |
| `proxy.ts` (v kořeni) | výhybka před požadavkem; do Next.js 15 `middleware.ts` |

```tsx
export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const zaznam = await najdiZaznam(slug);
  if (!zaznam) notFound();
  return <article>{zaznam.nazev}</article>;
}
```

## Serverová akce

```ts
'use server';

export async function vytvorZaznam(_stav: StavAkce, formData: FormData): Promise<StavAkce> {
  const uzivatel = await vyzadujUzivatele();                 // 1. kdo to je
  const hodnoty = Object.fromEntries(formData);
  const vysledek = ZaznamSchema.safeParse(hodnoty);          // 2. je vstup platný
  if (!vysledek.success) return { chybyPoli: chybyPoli(vysledek.error), hodnoty };

  await db.insert(zaznamy).values({ ...vysledek.data, autorId: uzivatel.id });   // 3. zápis
  updateTag('zaznamy');                                      // 4. zneplatnění
  redirect('/zaznamy');                                      // 5. přesměrování
}
```

Pořadí drž vždycky stejné. `autorId` ber ze session, **nikdy** z formuláře.

## Formulář v klientské komponentě

```tsx
'use client';

const [stav, akce] = useActionState(vytvorZaznam, {});
// uvnitř <form action={akce}>: stav.chybyPoli?.nazev?.[0], stav.hodnoty?.nazev
// tlačítko v podkomponentě: const { pending } = useFormStatus();
```

## Cache a její zneplatnění

```ts
export async function vsechnyZaznamy() {
  'use cache';
  cacheLife('hours');       // jak dlouho kopie platí
  cacheTag('zaznamy');      // jméno, kterým ji zneplatníš
  return db.select().from(zaznamy);
}
```

| funkce | co udělá | kdy |
|---|---|---|
| `updateTag('zaznamy')` | kopii zahodí **hned** (jen v akci) | uživatel má vidět svoji změnu ihned |
| `revalidateTag('zaznamy')` | pustí starou, novou dopočítá na pozadí | změna smí dorazit se zpožděním |
| `revalidatePath('/zaznamy')` | zneplatní všechno na adrese | nevíš, jaké značky tam jsou |

Do `'use cache'` **nepatří**: `cookies()`, `headers()`, session, `Date.now()`,
`Math.random()`, `crypto.randomUUID()`. Osobní část dej do `<Suspense>`; pro čas
nebo náhodu per požadavek zavolej nejdřív `await connection()`.

## Serverová akce × route handler

| | serverová akce | `route.ts` |
|---|---|---|
| volá to | tvůj formulář | mobilní aplikace, webhook, RSS, partner |
| zápis | ano | ano |
| bez JavaScriptu | funguje | nefunguje |
| co píšeš | funkci | `GET`/`POST` s `Request`/`Response` |

## Oprávnění: tři místa

| kde | co tam patří | co hrozí bez toho |
|---|---|---|
| `proxy.ts` | rychlé přesměrování nepřihlášeného | uživatel vidí prázdnou stránku |
| stránka | co má tenhle uživatel vidět | zobrazí se cizí data |
| **akce a datová vrstva** | smí tenhle uživatel zrovna tohle | **kdokoli změní cokoli** |

```ts
export function smiUpravit(uzivatel, zaznam) {
  if (!uzivatel || !zaznam) return false;      // nejdřív chybějící hodnoty!
  if (uzivatel.role === 'admin') return true;
  return Boolean(zaznam.autorId) && zaznam.autorId === uzivatel.id;
}
```

Roli čti ze session, ne z cookie a ne z formuláře. Skryté tlačítko není ochrana.

## Metadata a proměnné prostředí

```tsx
export const metadata: Metadata = { title: 'Seznam', description: '…' };
export async function generateMetadata({ params }) { /* dynamická stránka */ }
```

- `process.env.NEKLIC` — jen na serveru.
- `process.env.NEXT_PUBLIC_KLIC` — i v prohlížeči, **zapeče se při buildu**;
  je veřejný, každý si ho přečte ve zdrojovém kódu.

## Časté hlášky

| hláška | příčina | oprava |
|---|---|---|
| `window is not defined` | `window` v těle komponenty | přesuň do `useEffect`, nebo přidej `'use client'` a odlož |
| `useState only works in a Client Component` | stav v serverové komponentě | `'use client'` na první řádek souboru |
| `Event handlers cannot be passed…` | funkce jako prop přes hranici | pošli serverovou akci, nebo hranici posuň |
| `Hydration failed…` | čas, náhoda, `localStorage` při vykreslení | dopočítej v `useEffect`, nebo pošli jako prop |
| `Route used cookies inside use cache` | osobní údaj v uložené funkci | vyndej z `'use cache'`, dej do `<Suspense>` |
| `params should be awaited` | chybí `await params` | `const { slug } = await params;` |

## Než to nasadíš

```sh
npm run lint && npm run typecheck && npm test && npm run build
```

Playwright pouštěj **proti produkčnímu buildu**. Tajemství do `.env.local`
(a do `.gitignore`), vzor do `.env.example`. Kontejner: `output: 'standalone'`.
