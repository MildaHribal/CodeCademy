# Vite, React a TypeScript

Doteď jsi psal komponenty v jednom souboru. Skutečná aplikace — plánovač jídel,
katalog kol, rezervace stolů — je desítky souborů, které někdo musí přeložit,
spojit a poslat do prohlížeče. Tuhle práci dělá **Vite** a tvar dat v nich hlídá
**TypeScript**. Tahle lekce je ta nudná část, po které všechno ostatní jde rychle:
projekt, struktura, typy props a hlášky, kterým rozumíš.

:::check pretest
Co z TypeScriptu zůstane v souborech, které Vite pošle prohlížeči?

### --answer--

Typy se přeloží na kontroly, které se spustí za běhu.

#### --why--

To by byla jiná knihovna. Co přesně s typy udělá překlad, ukáže první část lekce.

### --correct--

Nic, typy se při překladu jen smažou.

#### --why--

Přesně tak. Co to znamená pro data z API, uvidíš v předpovědi.

### --answer--

Prohlížeč typům rozumí sám, když je soubor `.ts`.

#### --why--

Prohlížeč umí jen JavaScript. Kdo z `.ts` udělá `.js`, ukáže první část lekce.
:::

:::check pretest
V projektu z `npm create vite` je `src/main.tsx`, `src/App.tsx` a `index.html`.
Který z těch souborů si prohlížeč vyžádá jako první? Napiš jméno souboru.

### --expected--

index.html

### --why--

`index.html` není „jen šablona" — je to vstupní bod celé aplikace. Vite z něj čte
`<script type="module" src="/src/main.tsx">` a podle toho ví, odkud začít.
:::

## Jak vznikne projekt

Jeden příkaz, tři otázky, hotovo:

```sh
npm create vite@latest planovac -- --template react-ts
cd planovac
npm install
npm run dev
```

Poslední příkaz vypíše adresu dev serveru:

```text
  VITE v8.3.0  ready in 143 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Dev server drží v paměti jen to, co je právě na obrazovce, a po uložení souboru
vymění **jen změněnou komponentu** — stav ve stránce zůstane. Proto se v Reactu
pracuje s otevřeným prohlížečem vedle editoru.

V projektu jsou tři skripty:

| příkaz | co dělá |
|---|---|
| `npm run dev` | dev server s okamžitou výměnou modulů |
| `npm run build` | produkční build do `dist/` (minifikace, hashe v názvech) |
| `npm run preview` | naservíruje hotový `dist/` jako opravdový web |

> [!REMEMBER]
> **Vite je dvě věci v jedné: dev server s okamžitou odezvou a build pro produkci.**
> Tvůj kód v obou případech projde překladem — TypeScript a JSX prohlížeč sám nezná.

:::check
Napsal jsi komponentu, spustil `npm run build` a nahrál obsah `dist/` na hosting.
Který příkaz ti tentýž výsledek ukáže lokálně ještě před nahráním?

### --expected--

npm run preview

### --accept--

vite preview

### --why--

`npm run dev` servíruje zdrojové soubory s dev nástroji, `npm run preview` už
hotový `dist/`. Rozdíly (chybějící soubor v `public/`, špatná cesta k obrázku) se
proto poznají jen v `preview`.

### --see--

react-aplikace/vite-react-ts#jak-vznikne-projekt
:::

## Struktura podle funkcí

Výchozí projekt má `src/App.tsx` a `src/main.tsx`. Za týden budeš mít třicet
souborů a rozhoduje jediná věc: **hledám soubor podle toho, co dělá, nebo podle
toho, čím je?**

```text
src/
  features/            ← podle funkcí: všechno k receptům na jednom místě
    recepty/
      SeznamReceptu.tsx
      KartaReceptu.tsx
      api.ts
      typy.ts
    plan/
      TydenniPlan.tsx
      api.ts
  komponenty/          ← sdílené, nic nevědí o receptech ani o plánu
    Tlacitko.tsx
    Dialog.tsx
  lib/                 ← pomocné funkce bez Reactu (formátování, výpočty)
    format.ts
  App.tsx
  main.tsx
```

Rozdělení podle typu souboru (`components/`, `hooks/`, `utils/` s padesáti soubory
v každé) vypadá na začátku uklizeně, ale jedna změna pak znamená skákat po čtyřech
složkách. Rozdělení **podle funkcí** drží spolu věci, které se mění spolu.

> [!TIP]
> Pravidlo, které ti ušetří hodiny: když soubor nepatří dvěma funkcím, nepatří do
> sdílené složky. `komponenty/` je až pro to, co používají aspoň dvě funkce.

:::check
Do které složky podle struktury výš patří funkce `formatujCenu(castka: number)`,
kterou chceš použít u receptů i v nákupním seznamu?

### --expected--

lib

### --accept--

src/lib
lib/format.ts

### --why--

Nemá nic společného s Reactem ani s jednou konkrétní funkcí aplikace — je to
sdílená pomocná funkce, a ta se dá otestovat bez vykreslení komponenty.

### --see--

react-aplikace/vite-react-ts#struktura-podle-funkci
:::

## Typy props

Props komponenty jsou obyčejný objekt, takže jeho tvar popíšeš obyčejným typem.
V `.tsx` souboru to vypadá takhle:

:::live react
```tsx
type Recept = { nazev: string; minuty: number; porce: number };

type KartaProps = {
  recept: Recept;
  oblibeny?: boolean;
  onPridat: (nazev: string) => void;
};

function KartaReceptu({ recept, oblibeny = false, onPridat }: KartaProps) {
  return (
    <article className="karta">
      <h2>
        {recept.nazev} {oblibeny ? '★' : ''}
      </h2>
      <p>
        {recept.minuty} min · {recept.porce} porce
      </p>
      <button type="button" onClick={() => onPridat(recept.nazev)}>
        Do plánu
      </button>
    </article>
  );
}

export default function App() {
  return (
    <div className="mriz">
      <KartaReceptu
        recept={{ nazev: 'Svíčková', minuty: 90, porce: 6 }}
        oblibeny
        onPridat={(nazev) => console.log('do plánu:', nazev)}
      />
      <KartaReceptu recept={{ nazev: 'Bramborové placky', minuty: 35, porce: 4 }} onPridat={() => {}} />
    </div>
  );
}
```
```css
body { margin: 0; font: 16px/1.5 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.mriz { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); padding: 24px; }
.karta { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgb(31 41 51 / 0.12); }
.karta h2 { margin: 0 0 4px; font-size: 1.1rem; }
.karta p { margin: 0 0 16px; color: #6b7280; }
button { border: 0; border-radius: 8px; padding: 8px 14px; background: #1f6f4f; color: #fff; font: inherit; cursor: pointer; transition: background 150ms ease; }
button:hover { background: #17573e; }
button:focus-visible { outline: 3px solid #9ae6b4; outline-offset: 2px; }
```
:::

Zkus v druhé kartě smazat `onPridat={() => {}}` a sleduj, co ti podtrhne editor
(v náhledu Akademie se typy nekontrolují, ale ve tvém projektu ano — o tom je část
o hláškách).

Tři zápisy, které v reálném projektu potkáš pořád:

| chci | zápis |
|---|---|
| props s dětmi | `type Props = { children: React.ReactNode }` |
| přidat vlastní props k HTML tlačítku | `type Props = React.ComponentProps<'button'> & { varianta?: 'hlavni' \| 'vedlejsi' }` |
| props jiné komponenty | `type Props = React.ComponentProps<typeof KartaReceptu>` |

`ComponentProps<'button'>` je ta nejužitečnější: tvoje `<Tlacitko>` tím zdědí
`onClick`, `disabled`, `type`, `aria-*` — všechno, co `<button>` umí — a ty
přidáš jen to své.

:::check
Komponenta `Panel` má vykreslit cokoli, co do ní vložíš mezi značky
(`<Panel><p>text</p></Panel>`). Jaký typ dáš vlastnosti `children`?

### --expected--

React.ReactNode

### --accept--

ReactNode

### --why--

`ReactNode` pokrývá všechno, co jde vykreslit: prvky, text, čísla, pole, `null`.
`JSX.Element` by pustil jen jeden prvek a ne text — proto s ním `children` typovat
nechceme.

### --see--

react-aplikace/vite-react-ts#typy-props
:::

## Události a stav v TypeScriptu

Typ handleru si TypeScript odvodí sám, když ho napíšeš **přímo do JSX**. Jméno
typu musíš napsat jen tehdy, když handler bydlí vedle:

:::live react
```tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';

type Porce = 2 | 4 | 6;

export default function Kalkulacka() {
  // useState si typ odvodí z výchozí hodnoty: number
  const [minuty, setMinuty] = useState(30);
  // tady odvození nestačí — chceme jen tři povolené hodnoty
  const [porce, setPorce] = useState<Porce>(4);

  function zmenMinuty(event: ChangeEvent<HTMLInputElement>) {
    setMinuty(Number(event.target.value));
  }

  return (
    <form className="panel">
      <label htmlFor="minuty">Čas vaření: {minuty} min</label>
      <input id="minuty" type="range" min="10" max="120" step="5" value={minuty} onChange={zmenMinuty} />

      <label htmlFor="porce">Porcí</label>
      <select id="porce" value={porce} onChange={(event) => setPorce(Number(event.target.value) as Porce)}>
        <option value="2">2</option>
        <option value="4">4</option>
        <option value="6">6</option>
      </select>

      <p>
        Na {porce} porce potřebuješ asi {Math.round((minuty / 30) * porce * 100) / 100} h práce.
      </p>
    </form>
  );
}
```
```css
body { margin: 0; font: 16px/1.5 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.panel { display: grid; gap: 8px; max-width: 340px; margin: 24px; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgb(31 41 51 / 0.12); }
label { font-weight: 600; }
p { margin: 8px 0 0; color: #6b7280; }
```
:::

Zkus změnit `useState<Porce>(4)` na `useState<Porce>(3)` — ve svém projektu uvidíš
chybu ještě před spuštěním, protože `3` mezi povolené hodnoty nepatří.

> [!TIP]
> `import type { ChangeEvent } from 'react'` (s klíčovým slovem `type`) říká
> „tohle je jen typ, po překladu zmiz". Bez něj by v hotovém souboru zůstal
> zbytečný import.

:::check
Handler `onClick={(event) => …}` v JSX typ nepotřebuje. Proč si ho TypeScript
odvodí sám?

### --expected--

Typ zná z vlastnosti onClick

### --accept--

Z typu props prvku, do kterého handler zapisuješ.
Protože onClick na button má typ daný, takže parametr se odvodí z něj.

### --why--

Jde o odvození z kontextu (*contextual typing*): `onClick` na `<button>` má
v typech Reactu předepsaný tvar, takže parametr `event` typ zdědí. Když handler
napíšeš vedle, kontext chybí a typ musíš doplnit.

### --see--

react-aplikace/vite-react-ts#udalosti-a-stav-v-typescriptu
:::

## Typy nejsou kontrola dat

Tohle je nejdůležitější věta lekce, a přijde na ni každý až na ostrém API:

:::live react predict
```tsx
type Recept = { nazev: string; porce: number };

// odpověď z API — server poslal porce jako text, ne jako číslo
const odpoved = JSON.parse('{"nazev":"Svíčková","porce":"4"}') as Recept;

export default function App() {
  return <p>Porcí po zdvojení: {odpoved.porce + 2}</p>;
}
```
--question-- Co se ve stránce objeví?
--option-- Porcí po zdvojení: 6
--option*-- Porcí po zdvojení: 42
--option-- Nic, TypeScript to nepustí a stránka zůstane prázdná
--why-- `as Recept` je **slib**, ne kontrola. Po překladu z typů nic nezůstane, takže za běhu je v `porce` text `'4'` a `'4' + 2` je spojení řetězců — `'42'`. Typy hlídají, co píšeš ty; co posílá server, musíš zkontrolovat sama za běhu — schématem (Zod), nebo vlastní funkcí. Tomu se říká [[validace na hranici]].
:::

> [!REMEMBER]
> **TypeScript hlídá kód, ne data.** Všude, kde data přicházejí zvenčí (`fetch`,
> `localStorage`, `JSON.parse`, parametr z URL), je typ jen tvoje domněnka —
> platí jen to, co si ověříš za běhu.

:::check
Odkud do aplikace přichází hodnota, jejíž typ je jen tvoje domněnka? Jmenuj jeden
takový zdroj.

### --expected--

fetch

### --accept--

API
JSON.parse
localStorage
parametr z URL
odpověď ze serveru

### --why--

Typ platí jen pro kód, který jsi napsal. Odpověď z `fetch`, obsah `localStorage`,
parametr z adresy i `JSON.parse` jsou za běhu cokoli — proto se na hranici
kontrolují schématem.

### --see--

react-aplikace/vite-react-ts#typy-nejsou-kontrola-dat
:::

## Když to neprojde: čtení hlášky TypeScriptu

Hláška TypeScriptu bývá dlouhá, ale čte se odzadu a vždycky stejně: **kde**,
**co jsem čekal**, **co tam je**. Tohle vypíše `npx tsc --noEmit`, když kartě
zapomeneš `onPridat`:

```text
src/features/recepty/SeznamReceptu.tsx:14:8 - error TS2741: Property 'onPridat'
is missing in type '{ recept: Recept; }' but required in type 'KartaProps'.

14       <KartaReceptu recept={recept} />
         ~~~~~~~~~~~~~
  src/features/recepty/KartaReceptu.tsx:7:3
    7   onPridat: (nazev: string) => void;
        ~~~~~~~~
    'onPridat' is declared here.
```

Česky: v `SeznamReceptu.tsx` na řádku 14 chybí vlastnost `onPridat`, kterou typ
`KartaProps` vyžaduje — a je deklarovaná v `KartaReceptu.tsx` na řádku 7. Druhá
část hlášky (odsazená) je vždycky **ukazovátko na místo, kde je typ napsaný**.

Tři nejčastější kódy, které uvidíš:

| kód | česky | typicky |
|---|---|---|
| `TS2741` / `TS2322` | chybí vlastnost / typ nesedí | zapomenutá props, `string` místo `number` |
| `TS2339` | vlastnost na tom typu neexistuje | překlep v klíči, `data` může být `undefined` |
| `TS18048` / `TS2532` | hodnota může být `undefined` | `useState<Recept>()` bez výchozí hodnoty, `params.id` |

> [!PITFALL]
> **`npm run build` sám typy nekontroluje.** Vite typy jen smaže (esbuildem), takže
> build s chybou v typech klidně projde. Kontrolu musíš pustit zvlášť:
> `"typecheck": "tsc --noEmit"` ve `scripts` a v šabloně `react-ts` je i
> `"build": "tsc -b && vite build"`. Když build v CI běží bez `tsc`, rozbité typy
> se dovezou až na produkci.

:::check
Co znamená hláška `TS18048: 'recept' is possibly 'undefined'` u řádku
`<h2>{recept.nazev}</h2>`?

### --expected--

Že recept nemusí existovat

### --accept--

Že v recept může být undefined, takže se čtení nazev musí nejdřív ošetřit.
Hodnota může být undefined — TypeScript chce podmínku nebo ?.

### --why--

Typ říká „tady **může** být `undefined`" — třeba proto, že hledání receptu podle
id nic nenašlo. Oprava není `!` ani `as`, ale podmínka: `if (!recept) return <p>Recept neexistuje</p>;`
před vykreslením.

### --see--

react-aplikace/vite-react-ts#kdyz-to-neprojde-cteni-hlasky-typescriptu
:::

## Proměnné prostředí

Adresa API se mezi vývojem a produkcí liší, takže nepatří do kódu. Ve Vite se čte
z `import.meta.env` a soubor s hodnotami je `.env.local` (v `.gitignore`):

```text
# .env.local
VITE_API_URL=http://localhost:3000/api
```

```ts
// src/lib/api.ts
const zaklad = import.meta.env.VITE_API_URL;

export async function nactiRecepty() {
  const odpoved = await fetch(`${zaklad}/recepty`);
  if (!odpoved.ok) throw new Error(`Recepty se nenačetly (${odpoved.status})`);
  return odpoved.json();
}
```

Vite do buildu pustí **jen** proměnné s předponou `VITE_`. To není otrava, ale
pojistka: cokoli v prohlížečovém balíčku si každý přečte v DevTools.

> [!PITFALL]
> **Do `VITE_*` nikdy nedávej tajemství.** `VITE_API_KEY` skončí čitelně v `dist/`
> a stačí otevřít Zdroje v DevTools. Klíče k platbám a databázi patří na server —
> prohlížeč o nich nesmí vědět. [[proměnná prostředí]] bez předpony `VITE_` je
> dostupná jen při buildu, ne v aplikaci.

:::check
Do `.env.local` jsi přidal `API_URL=…`, ale `import.meta.env.API_URL` je
`undefined`. Proč?

### --expected--

Chybí předpona VITE_

### --accept--

Vite pustí do prohlížeče jen proměnné začínající VITE_.

### --why--

Vite do klienta vloží jen proměnné s předponou `VITE_` (jméno si můžeš změnit
v `envPrefix`). Ostatní zůstanou serverové, aby se tajemství nedostalo do balíčku.

### --see--

react-aplikace/vite-react-ts#promenne-prostredi
:::

## Lint, který hlídá hooky

Šablona `react-ts` přinese `eslint.config.js` a v něm pravidla pro hooky. Dvě
z nich ti ušetří večer:

- `react-hooks/rules-of-hooks` — hook nesmí být v podmínce, cyklu ani ve vnořené
  funkci. Kdo to zkusí, dostane za běhu nesmyslný stav; lint to řekne hned.
- `react-hooks/exhaustive-deps` — v poli závislostí `useEffect` chybí hodnota,
  kterou efekt používá. Typicky vede na „data se nenačtou po změně filtru".

```sh
npm run lint          # vypíše chyby
npm run lint -- --fix # opraví, co se opravit dá (formátování, importy)
```

> [!NOTE]
> Od šablony `react-compiler-ts` se pravidla hooků hlídají i za tebe: React
> Compiler kód analyzuje a sám doplní memoizaci. Kdo pravidla porušuje, o
> zrychlení přijde — compiler takovou komponentu radši vynechá. Pro tuhle sekci
> zůstáváme u `react-ts`, ale jméno šablony si pamatuj.

:::check
Proč je `useState` uvnitř `if (jeVidet) { … }` chyba, i když se kód „tváří", že
funguje?

### --expected--

React pozná hooky podle pořadí volání

### --accept--

Protože se hooky musí volat vždy ve stejném pořadí, jinak si React spáruje stav se špatným hookem.
Podmínka změní počet i pořadí hooků mezi vykreslením.

### --why--

React si hodnoty hooků pamatuje **podle pořadí**, ne podle jména. Když se podmínka
při dalším vykreslení změní, druhý `useState` dostane hodnotu prvního — a stav se
„zamíchá". Proto hooky patří vždy nahoru do těla komponenty.

### --see--

react-aplikace/vite-react-ts#lint-ktery-hlida-hooky
:::

:::explain
Vysvětli vlastními slovy, proč prohlížeč nemůže spustit soubor `.tsx` přímo.

## --model--
Prohlížeč umí JavaScript, nic jiného. TypeScript přidává zápis typů a JSX přidává
zápis podobný HTML uprostřed kódu — obojí je syntaxe, kterou by prohlížeč nepřečetl,
protože ve specifikaci jazyka není. Proto musí před spuštěním projít překladem, který
typy odstraní (za běhu už nic nekontrolují) a JSX převede na obyčejná volání funkcí.
Vite tohle dělá v obou režimech: při vývoji po jednotlivých souborech a na vyžádání,
při sestavení pro celý projekt najednou.

## --checklist--
- Prohlížeč rozumí jen JavaScriptu.
- Typy i JSX jsou syntaxe navíc, kterou by nepřečetl.
- Typy se při překladu odstraní, JSX se změní na volání funkcí.
- Překlad probíhá při vývoji i při sestavení, jen jinak.
:::

## Typické chyby a pasti

> [!PITFALL]
> **JSX v souboru `.ts`.** `src/lib/format.ts` s `<span>{…}</span>` skončí hláškou
> `error TS1005: '>' expected` nebo `Unterminated regular expression literal`.
> JSX patří jen do `.tsx` — přejmenuj soubor.

> [!PITFALL]
> **Velká a malá písmena v cestách.** `import Karta from './komponenty/karta'`
> na tvém Linuxu nebo v CI spadne (`Failed to resolve import`), na macOS projde.
> Jméno souboru piš přesně tak, jak se jmenuje.

> [!PITFALL]
> **Obrázek v `public/` versus `src/assets/`.** Co je v `public/`, servíruje se
> tak, jak je, a odkazuješ na to absolutně: `<img src="/logo.svg">`. Co je v
> `src/assets/`, musíš naimportovat (`import logo from './assets/logo.svg'`), aby
> to build dostal hash a dohledal. Relativní `<img src="./assets/logo.svg">`
> v produkci najde jen 404.

> [!PITFALL]
> **`as` místo kontroly.** `const data = await odpoved.json() as Recept[]` je slib,
> který se nikdy neověří. Když server pošle jiný tvar, spadne to o tři komponenty
> dál s `Cannot read properties of undefined`. Hranici aplikace ověřuj schématem.

> [!PITFALL]
> **`any` jako řešení hlášky.** `any` chybu neopraví, jen ji přesune dál a vypne
> nápovědu editoru. Když nevíš typ, začni `unknown` — TypeScript pak vynutí, abys
> hodnotu před použitím zkontroloval.

:::check
Soubor `src/lib/format.ts` vrací `<span>{castka} Kč</span>` a build hlásí
`error TS1005: '>' expected`. Co s tím?

### --expected--

Přejmenovat soubor na .tsx

### --accept--

Soubor musí mít příponu tsx, aby v něm šlo psát JSX.

### --why--

JSX se překládá jen v souborech `.tsx` (v čistém JS `.jsx`). V `.ts` bere
TypeScript `<` jako porovnání nebo generikum a hláška ukazuje na náhodné místo.

### --see--

react-aplikace/vite-react-ts#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) —
  co `import.meta` je a proč z něj Vite dělá `import.meta.env`.
- [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) —
  `import`/`export`, které Vite ve vývoji posílá prohlížeči beze změny.
- [HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement) —
  co všechno má `event.target` u `<input>`, když si ho typuješ jako `HTMLInputElement`.

> [!NOTE]
> Vite, React ani TypeScript na MDN nejsou — dokumentaci mají vlastní:
> [vite.dev/guide](https://vite.dev/guide/) (konfigurace, `import.meta.env`),
> [react.dev/reference](https://react.dev/reference/react) (hooky a komponenty)
> a [typescriptlang.org/docs/handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
> (typy). Hláškám `TS…` rozumíš nejlíp tak, že kód hlášky vyhledáš i s číslem.

# --questions--

## --question--

Ve `src/App.tsx` je `import { Karta } from './komponenty/Karta'`, ale soubor
exportuje komponentu přes `export default function Karta()`. Co se stane?

### --answer--

Funguje to, `default` a pojmenovaný export jsou totéž.

#### --why--

Myslíš si, že se React nebo Vite v exportech „domyslí"? Nedomyslí — jsou to dva
různé druhy exportu.

### --correct--

Import bude `undefined` a React ohlásí neplatný typ prvku.

#### --why--

Ze souboru bez pojmenovaného exportu `Karta` se naimportuje `undefined`. React pak
hlásí `Element type is invalid: expected a string or a class/function but got: undefined`.
Oprava: `import Karta from './komponenty/Karta'`.

### --answer--

Vite build spadne, ale dev server to zvládne.

#### --why--

Chyba se pozná až za běhu při vykreslení, ne při buildu. Dev server i build se tu
chovají stejně.

## --question--

V projektu máš `"build": "vite build"` a `"typecheck": "tsc --noEmit"`. V kódu je
chyba v typech. Který příkaz skončí s nenulovým kódem? Napiš jméno skriptu.

### --expected--

typecheck

### --accept--

npm run typecheck

### --why--

Vite typy při překladu jen smaže, takže `vite build` projde. Chyby v typech
najde jen `tsc`. Proto se do buildu často píše `tsc -b && vite build`.

### --see--

react-aplikace/vite-react-ts#kdyz-to-neprojde-cteni-hlasky-typescriptu

## --question--

Komponenta `Tlacitko` má přijímat všechno, co umí `<button>`, a navíc vlastnost
`varianta`. Jak zapíšeš typ jejích props? Napiš celý typ.

### --expected--

```tsx
type Props = React.ComponentProps<'button'> & { varianta?: string };
```

### --accept--

```tsx
type TlacitkoProps = ComponentProps<'button'> & { varianta?: string };
```

```tsx
type Props = React.ComponentProps<'button'> & { varianta: string };
```

### --why--

`ComponentProps<'button'>` je hotový typ props HTML tlačítka (`onClick`, `disabled`,
`aria-*`) a `&` k němu přidá to tvoje. Psát ta props znovu ručně je práce, kterou
za tebe udělaly typy Reactu.

### --see--

react-aplikace/vite-react-ts#typy-props

## --question--

Adresu API čteš v komponentě jako `import.meta.env.VITE_API_URL`. V produkci je
v proměnné `undefined`, i když v `.env.local` je správně. Co zkontrolujete jako
první?

### --answer--

Jestli komponenta není načtená jako `lazy`.

#### --why--

Líné načítání komponenty s hodnotami prostředí nesouvisí — ty se dosazují při
buildu, ne při načtení modulu.

### --correct--

Jestli na produkčním prostředí ta proměnná existuje při buildu.

#### --why--

Hodnoty se do kódu dosazují při `npm run build`. `.env.local` je jen tvůj lokální
soubor a do Gitu ani na server se nedostane, takže hodnotu musíš nastavit
v prostředí, kde build běží.

### --answer--

Jestli soubor není `.env.local` místo `.env.production`.

#### --why--

Jméno souboru je jen jedno z možných míst. Podstatné je, že proměnná musí být
dostupná v tom prostředí, kde se build spouští.
