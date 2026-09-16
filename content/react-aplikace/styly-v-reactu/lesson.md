# Styly v Reactu

Komponenta bez stylu není komponenta, je to polotovar. Otázka „kam napsat to
CSS" vypadá jako kosmetika, ale rozhoduje o tom, jestli půjde komponenta za půl
roku smazat, nebo jestli se po jejím smazání rozsype karta úplně jinde v aplikaci.

:::check pretest
Dvě komponenty na téže stránce si každá ve svém CSS souboru nadefinuje třídu
`.title`. Co se v prohlížeči stane?

### --answer--

Nic, každá komponenta má svoje CSS oddělené.

#### --why--

Zamysli se, co prohlížeč o komponentách ví. Dostane hotovou stránku a v ní
jeden balík pravidel — slovo „komponenta" v CSS neexistuje.

### --correct--

Obě pravidla platí pro oba nadpisy a rozhodne pořadí a specificita.

#### --why--

Přesně tak. Prohlížeč nemá ponětí o tom, ze kterého souboru pravidlo přišlo.
Celá tahle lekce je o tom, jak z toho ven.

### --answer--

Vite to ohlásí jako chybu už při buildu.

#### --why--

Duplicitní selektor není chyba, je to úplně běžná věc. Build nemá jak poznat,
že jsi to nemyslel vážně.
:::

:::check pretest
Aplikace ve Vite má deset komponent a každá vlastní CSS soubor. Kolik souborů se
stylem si prohlížeč v produkci obvykle stáhne? Napiš číslo.

### --expected--

1

### --accept--

jeden
jedna

### --why--

Build je sloučí do jednoho (u velkých aplikací do několika po trasách). „Vlastní
soubor u komponenty" je tedy věc pořádku ve zdrojácích, ne počtu požadavků.
:::

## Problém: globální CSS v komponentách

Tohle je běžný začátek: `App.css` na všechno, třídy pojmenované podle toho, co
zrovna stylujeme. Chvíli to funguje krásně — a pak přijde druhý vývojář, druhá
komponenta a stejné slovo.

:::live react
```jsx
import './styles.css';

function ArticleCard() {
  return (
    <article className="card">
      <h3 className="title">Jak vybrat kolo na dovolenou</h3>
      <p>Tři věci, na kterých opravdu záleží.</p>
    </article>
  );
}

function PriceCard() {
  return (
    <section className="card">
      <h3 className="title">Půjčovné</h3>
      <p>390 Kč / den</p>
    </section>
  );
}

export default function App() {
  return (
    <div className="page">
      <ArticleCard />
      <PriceCard />
    </div>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f5f4f1; color: #1f2933; }
.page { display: grid; gap: 14px; max-width: 420px; margin: 24px auto; }
.card { background: #fff; border: 1px solid #e4e1db; border-radius: 12px; padding: 16px 18px; }

/* styl nadpisu článku */
.title { font-size: 1.05rem; margin: 0 0 6px; }

/* …a o dvě stě řádků níž styl nadpisu ceníku, od někoho jiného */
.title { font-size: 2rem; color: #0f766e; letter-spacing: -0.02em; }
```
:::

Zkus smazat druhé pravidlo `.title` a sleduj, co se stane s nadpisem článku —
oba nadpisy se hýbou spolu, protože pro prohlížeč jsou to prostě dva prvky
s toutéž třídou.

> [!REMEMBER]
> **Styl patří ke komponentě, ne ke stránce.** Cílem každého řešení v téhle lekci
> je, aby se jméno třídy nemohlo potkat se stejným jménem odjinud.

Z toho plyne i druhá polovina problému: v globálním CSS si nikdy nejsi jistý, jestli
je pravidlo ještě k něčemu. Smazat komponentu umí každý, smazat její styl už nikdo
netroufne — a soubor rok od roku roste.

:::check
Proč nestačí „domluvit se v týmu, že třídy budeme jmenovat opatrně"?

### --expected--

Protože to nic nevynucuje

### --accept--

Protože to nikdo nekontroluje a dřív nebo později se jméno zopakuje.
Je to dohoda, ne pravidlo — build ji nehlídá.

### --why--

Dohoda drží, dokud na projektu nepřibude třetí člověk nebo knihovna s vlastními
třídami. Řešení, o kterých je tahle lekce, kolizi **znemožní**, ne zakážou.

### --see--

react-aplikace/styly-v-reactu#problem-globalni-css-v-komponentach
:::

## CSS Modules: třídy bez kolizí

[[CSS Modules]] jsou nejmenší možná změna oproti tomu, co už umíš: pořád píšeš
obyčejné CSS, jen soubor pojmenuješ `Neco.module.css` a třídy si z něj naimportuješ
jako objekt.

```jsx
// PriceCard.jsx
import styles from './PriceCard.module.css';

export function PriceCard({ price }) {
  return (
    <section className={styles.card}>
      <h3 className={styles.title}>Půjčovné</h3>
      <p>{price} Kč / den</p>
    </section>
  );
}
```

```css
/* PriceCard.module.css */
.card { background: #fff; border-radius: 12px; padding: 16px 18px; }
.title { font-size: 2rem; color: #0f766e; }
```

Build z toho vyrobí objekt `{ card: 'PriceCard_card__a1b2', title: 'PriceCard_title__c3d4' }`
a do stránky pošle přejmenovaná pravidla. V prohlížeči pak `.title` z jedné
komponenty **nemá jak** potkat `.title` z druhé: každá má jiné jméno.

Co z toho plyne v praxi:

- Jméno třídy smíš zvolit krátké a popisné (`.title`, `.row`, `.active`), protože
  o jedinečnost se stará build.
- Když komponentu smažeš, smažeš s ní i její `.module.css` — a víš jistě, že tím
  nic jiného nerozbiješ.
- Třídu s pomlčkou vytáhneš hranatými závorkami: `styles['card-title']`. Proto se
  v modulech píšou jména jednoslovně nebo `camelCase`.
- Globální kus (reset, styl `body`, třída z cizí knihovny) patří do obyčejného
  `index.css`, ne do modulu. V modulu si ho vynutíš zápisem `:global(.leaflet-popup)`.

> [!PITFALL]
> **Překlep ve jménu třídy nic neohlásí.** `styles.cardTitle` u třídy `.card-title`
> je `undefined`, React z toho udělá `class="undefined"` a prvek je prostě
> nenastylovaný. Žádná hláška v konzoli, žádná chyba buildu. Když ti komponenta
> vypadá „jako holé HTML", podívej se v DevTools na atribut `class`: buď je
> `undefined`, nebo tam není vůbec.

> [!NOTE]
> Přejmenování dělá **build**, ne prohlížeč. V náhledu tady v Akademii proto CSS
> Modules nevyzkoušíš — potkáš je až v projektu ve Vite. Tady si vystačíme
> s obyčejným CSS souborem, který se do stránky připojí celý.

:::check
Komponenta `Rating.jsx` používá `styles.starFilled`, ale v `Rating.module.css` je
třída `.star-filled`. Jak se to projeví v prohlížeči?

### --expected--

Prvek bude bez stylu

### --accept--

Nic se nestane, prvek zůstane nenastylovaný.
Dostane class="undefined" a styl se neuplatní.

### --why--

`styles.starFilled` je `undefined`, protože v objektu je klíč `star-filled`.
Chyba se nikde neohlásí — poznáš ji jen podle atributu `class` v DevTools.

### --see--

react-aplikace/styly-v-reactu#css-modules-tridy-bez-kolizi
:::

## Tailwind v komponentě

Druhá cesta je opačná: žádné vlastní třídy, jen hotové utility třídy přímo
v `className`. Kolize nehrozí, protože žádné jméno nevymýšlíš.

:::live react libs=tailwind
```jsx
function PriceCard({ title, price, note }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-medium tracking-wide text-stone-500 uppercase">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-teal-700">{price} Kč</p>
      <p className="mt-2 text-sm text-stone-500">{note}</p>
    </section>
  );
}

export default function App() {
  return (
    <div className="mx-auto grid max-w-sm gap-3 p-6">
      <PriceCard title="Půjčovné" price="390" note="za den, helma a zámek v ceně" />
      <PriceCard title="Víkend" price="690" note="pátek odpoledne až neděle večer" />
    </div>
  );
}
```
:::

Zkus změnit `p-5` na `p-8` a `text-3xl` na `text-5xl` — uvidíš, že hodnoty
nevymýšlíš, vybíráš je ze škály. To je hlavní přínos: rozestupy a velikosti
v celé aplikaci vycházejí ze stejné sady čísel.

Cenu za to zaplatíš na dvou místech. Zaprvé je `className` dlouhý; proto se
opakující se blok tříd nekopíruje, ale **schová do komponenty** — přesně jako
`PriceCard` nahoře. Zadruhé si musíš zvyknout číst rozhraní z JSX, ne z CSS
souboru.

> [!TIP]
> Tailwind a CSS Modules se nevylučují. Běžná kombinace je Tailwind na rozvržení
> a rozestupy a `*.module.css` na tu jednu komponentu, která má složitou animaci
> nebo se opírá o `@container` a v utility třídách by byla nečitelná.

:::check
Proč se v Tailwindu opakující se sada tříd neřeší kopírováním, ale vytažením
komponenty?

### --expected--

Aby se dala změnit na jednom místě

### --accept--

Protože jinak bys změnu musel udělat na všech místech.
Komponenta je v Tailwindu to, co je jinde třída.

### --why--

V Tailwindu nahrazuje komponenta pojmenovanou třídu. Když chceš, aby všechny
karty dostaly jiný stín, změníš `PriceCard`, ne pět míst v JSX.

### --see--

react-aplikace/styly-v-reactu#tailwind-v-komponente
:::

## Podmíněné třídy a stav

Ať zvolíš cokoli, potřebuješ třídu, která platí jen někdy: aktivní záložka,
vyprodaná karta, formulářové pole s chybou. Spojovat řetězce ručně se zvrhne
hned u druhé podmínky.

```jsx
// tři podmínky a už si nejsi jistý, kde chybí mezera
const cls = 'tab ' + (isActive ? 'tab--active ' : '') + (disabled ? 'tab--disabled' : '');
```

Od toho je `clsx`: vezme cokoli a vyhodí z toho jen pravdivé kousky, oddělené
mezerou.

```jsx
import clsx from 'clsx';

<button className={clsx('tab', { 'tab--active': isActive, 'tab--disabled': disabled })}>
```

S [[CSS Modules]] je to totéž, jen klíčem je hodnota z objektu:
`clsx(styles.tab, isActive && styles.tabActive)`.

Druhá možnost je stav vůbec nedávat do třídy a nechat ho na **datovém atributu**:
`<button data-state={isActive ? 'active' : 'idle'}>` a v CSS
`[data-state='active'] { … }`. V DevTools pak vidíš stav komponenty rovnou na prvku.

> [!NOTE]
> Skládání tříd do hloubky — varianty přes `cva`, slučování konfliktů přes
> `tailwind-merge` a pomocník `cn()` — má vlastní lekci
> [Tailwind v Reactu](see:react-ui-knihovny/tailwind-v-reactu#podminene-tridy-clsx).
> Tady stačí vědět, že podmíněnou třídu skládá funkce, ne plus.

:::live react
```jsx
import { useState } from 'react';
import clsx from 'clsx';
import './styles.css';

const tabs = [
  { id: 'mestska', label: 'Městská', text: 'Nízký nástup, koš a blatníky. Nejčastější volba na výlet po městě.' },
  { id: 'trekova', label: 'Treková', text: 'Na delší trasy po asfaltu i po lesních cestách.' },
  { id: 'elektro', label: 'Elektrokolo', text: 'Dojezd 80 km, nabíječka a druhá baterie na vyžádání.' },
];

export default function App() {
  const [active, setActive] = useState('mestska');

  return (
    <div className="panel">
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active}
            className={clsx('tab', tab.id === active && 'tab--active')}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text">{tabs.find((tab) => tab.id === active).text}</p>
    </div>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f5f4f1; color: #1f2933; }
.panel { max-width: 460px; margin: 24px auto; background: #fff; border: 1px solid #e4e1db; border-radius: 14px; padding: 18px; }
.tabs { display: flex; gap: 6px; }
.tab { border: 0; background: #f1efea; border-radius: 999px; padding: 8px 16px; font: inherit; cursor: pointer; transition: background 150ms ease, color 150ms ease; }
.tab:hover { background: #e6e2da; }
.tab:focus-visible { outline: 2px solid #0f766e; outline-offset: 2px; }
.tab--active { background: #0f766e; color: #fff; }
.text { margin: 14px 0 0; color: #5b6570; }
```
:::

Zkus přidat druhou podmínku (třeba `tab.id === 'elektro' && 'tab--novinka'`)
a všimni si, že v zápisu nemusíš řešit ani jednu mezeru navíc.

:::check
Co vrátí `clsx('tab', false && 'tab--active', undefined, 'tab--velky')`?

### --expected--

tab tab--velky

### --why--

`clsx` zahodí všechno nepravdivé a zbytek spojí jednou mezerou. Právě proto
se podmínka píše rovnou dovnitř volání.

### --see--

react-aplikace/styly-v-reactu#podminene-tridy-a-stav
:::

## Sdílené tokeny a tmavý režim

Barvy, rozestupy a poloměry nepatří do komponent rozkopírované, ale na jedno
místo. V obyčejném CSS i v CSS Modules jsou to custom properties na `:root`,
v Tailwindu blok `@theme` v hlavním CSS souboru, ze kterého Tailwind vyrobí
utility třídy (`bg-brand` z `--color-brand`).

Tmavý režim je pak jen **druhá sada hodnot** těch samých proměnných. Komponenty
o něm nevědí vůbec nic — vždycky sahají na `var(--surface)`, ne na konkrétní barvu.

:::live react
```jsx
import { useState } from 'react';
import './styles.css';

export default function App() {
  const [theme, setTheme] = useState('light');

  return (
    <div className="app" data-theme={theme}>
      <div className="bar">
        <strong>Půjčovna Na Rovině</strong>
        <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? 'Tmavý režim' : 'Světlý režim'}
        </button>
      </div>
      <article className="card">
        <h3>Treková 28"</h3>
        <p>Volná od pátku. 390 Kč / den.</p>
      </article>
    </div>
  );
}
```
```css
:root {
  --surface: #ffffff;
  --page: #f5f4f1;
  --text: #1f2933;
  --muted: #5b6570;
  --line: #e4e1db;
  --brand: #0f766e;
  --radius: 12px;
}

[data-theme='dark'] {
  --surface: #1c2024;
  --page: #14171a;
  --text: #edf0f2;
  --muted: #a3adb5;
  --line: #2b3137;
  --brand: #5eead4;
}

body { margin: 0; font: 16px/1.6 system-ui, sans-serif; }
.app { min-height: 240px; padding: 18px; background: var(--page); color: var(--text); transition: background 200ms ease, color 200ms ease; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.bar button { border: 1px solid var(--line); background: var(--surface); color: var(--brand); border-radius: 999px; padding: 6px 14px; font: inherit; cursor: pointer; }
.bar button:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px 18px; }
.card h3 { margin: 0 0 4px; }
.card p { margin: 0; color: var(--muted); }
```
:::

Zkus změnit `--brand` v tmavé sadě na `#fb7185` a sleduj, že se přebarví tlačítko
i všechno ostatní, co na ten token sahá. To je ten rozdíl proti psaní barev
napřímo: jedna změna, jedno místo.

Přepínač drží hodnotu v `useState` a zapisuje ji do `data-theme`. Ve skutečné
aplikaci ji navíc uložíš (aby volba přežila obnovení) a výchozí hodnotu vezmeš
z `prefers-color-scheme`, aby uživatel se systémem v tmavém nedostal do očí bílou.

:::check
Proč se v komponentě píše `background: var(--surface)` místo `background: #fff`,
když je tmavý režim vypnutý a obě hodnoty jsou stejné?

### --expected--

Aby ji stačilo změnit na jednom místě

### --accept--

Protože tmavý režim pak jen přepíše proměnnou, ne komponenty.
Komponenta tak nemusí o motivu vědět nic.

### --why--

Token je závazek: komponenta říká „chci barvu povrchu", ne „chci bílou". Druhá
sada hodnot pak stačí na přebarvení celé aplikace.

### --see--

react-aplikace/styly-v-reactu#sdilene-tokeny-a-tmavy-rezim
:::

## Proč se CSS-in-JS dnes spíš nepoužívá

Pár let byl standardem třetí přístup: styl jako JavaScript uvnitř komponenty
(`styled-components`, `emotion`).

```jsx
const Card = styled.section`
  background: ${(props) => (props.highlighted ? '#0f766e' : '#fff')};
  padding: 16px 18px;
`;
```

Vypadá to pohodlně a má to tři nevýhody, kvůli kterým se od toho odchází:

- **Styl se počítá za běhu.** Knihovna při vykreslení složí CSS a vloží ho do
  stránky. U velkých seznamů je to měřitelné a nic z toho nemá uživatel.
- **Nesedí to k serverovým komponentám.** Styl potřebuje běžet na klientovi,
  takže komponenta, která by mohla zůstat serverová, musí být klientská.
  (K serverovým komponentám se dostaneme v sekci o Next.js.)
- **Prohlížeč mezitím dospěl.** Custom properties, vnořování a `@container` umí
  nativně to, kvůli čemu se dřív sahalo po JavaScriptu.

Dnešní odpověď je „styly řeš při buildu": CSS Modules, Tailwind, nebo
zero-runtime knihovny, které z šablony vyrobí obyčejný CSS soubor.

> [!NOTE]
> Nepředělávej kvůli tomu cizí projekt. `styled-components` v existující aplikaci
> funguje dál; tohle je rada pro **novou** volbu.

:::check
Uveď jeden konkrétní důvod, proč CSS-in-JS zpomaluje vykreslení, zatímco CSS
Modules ne.

### --expected--

Skládá CSS až za běhu

### --accept--

Protože styl vzniká při renderu, ne při buildu.
CSS-in-JS vkládá pravidla do stránky během běhu aplikace.

### --why--

U CSS Modules je hotové CSS už v souboru, který si prohlížeč stáhne. U CSS-in-JS
musí JavaScript nejdřív pravidla složit a vložit — a to při každém vykreslení
komponenty, které styl mění.

### --see--

react-aplikace/styly-v-reactu#proc-se-css-in-js-dnes-spis-nepouziva
:::

## Co si vybrat do projektu

Pro jednu aplikaci si vyber **jedno** hlavní řešení a drž se ho. Míchání tří
přístupů je horší než kterýkoli z nich.

| situace | sáhni po |
|---|---|
| máš rád CSS a chceš ho psát dál, jen bez kolizí | CSS Modules |
| chceš rychle stavět rozhraní a držet škálu rozestupů | Tailwind |
| komponenta má složitou animaci, `@container` nebo tisk | `*.module.css`, i v tailwindovém projektu |
| stahuješ hotové přístupné komponenty | Radix nebo shadcn/ui (mají vlastní lekci) |
| začínáš nový projekt a lákají tě `styled-components` | nezačínej, viz předchozí část |

:::check
Projekt používá Tailwind. Jedna komponenta potřebuje `@container` a dvě klíčové
animace, ve kterých by byly utility třídy nečitelné. Co s tím?

### --expected--

Napsat jí vlastní CSS modul

### --accept--

Dát té jedné komponentě *.module.css.
Zbytek nechat v Tailwindu, tuhle jednu napsat v CSS modulu.

### --why--

„Jedno hlavní řešení" neznamená „nikdy nic jiného". Znamená to, že výjimka je
vědomá, je jich pár a týká se celé komponenty, ne tří tříd v ní.

### --see--

react-aplikace/styly-v-reactu#co-si-vybrat-do-projektu
:::

:::explain
Vysvětli, proč je jedno jméno třídy v globálním CSS riziko, a proč u CSS Modules
totéž jméno riziko není.

## --model--

V globálním CSS je jméno třídy adresa v celé aplikaci. Když ho použiju v jedné
komponentě, nemám jak zabránit tomu, aby ho zítra někdo použil v jiné — pravidla
se sečtou a rozhodne pořadí a specificita, ne to, ze kterého souboru přišly.
U CSS Modules jméno v souboru není jméno v prohlížeči: build z `.title` udělá
`PriceCard_title__a1b2`, takže dvě stejná jména ze dvou komponent vyrobí dvě
různé třídy a potkat se nemůžou.

## --checklist--

- V globálním CSS platí jméno třídy pro celou stránku.
- O výsledku pak rozhoduje pořadí pravidel a specificita, ne původ souboru.
- CSS Modules jméno při buildu přejmenují podle souboru.
- Dvě stejná jména ze dvou komponent tak vyrobí dvě různé třídy.
:::

## Typické chyby a pasti

:::live react predict
```jsx
import './styles.css';

export default function App() {
  return <p className="note note--warning">Kolo vracíš do 18:00.</p>;
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; }
.note--warning { padding: 24px; background: #fef3c7; }
.note { padding: 4px; background: #e2e8f0; }
```
--question-- Jak velké vnitřní odsazení bude odstavec mít?
--option-- 24 px — `note--warning` je v `className` napsaná jako druhá, takže vyhrává.
--option*-- 4 px — v CSS je `.note` až za `.note--warning`.
--option-- Sečte se, odstavec bude mít 28 px.
--why-- Pořadí tříd v `className` neznamená vůbec nic: je to jen seznam. Když mají dva selektory stejnou specificitu (obojí jedna třída), rozhodne **pořadí v CSS**, a `.note` je v souboru níž. Proto se modifikátory píšou v CSS **za** základní třídu — a proto se v Tailwindu konflikty řeší knihovnou `tailwind-merge`, ne přeházením `className`.
:::

> [!PITFALL]
> **Pořadí v `className` nic neřeší.** `className="note note--warning"` vypadá
> jako „nejdřív základ, pak úprava", ale prohlížeč vidí jen dvě třídy se stejnou
> specificitou. Příznak: modifikátor se neprojeví, i když je v `className` zjevně
> poslední. Oprava: dej pravidlo modifikátoru v CSS **pod** základní třídu.

> [!PITFALL]
> **Skládání jména třídy z proměnné.** `` className={`text-${color}-600`} `` v Tailwindu
> nefunguje: nástroj hledá celá jména tříd ve zdrojovém kódu a `text-emerald-600`
> tam nikde nenajde. Příznak: v produkci je text černý, i když v DevTools třída
> na prvku je. Oprava: napiš celá jména do mapy
> (`const colors = { emerald: 'text-emerald-600', rose: 'text-rose-600' }`).

> [!PITFALL]
> **`styles` bez `.module` v názvu souboru.** `import styles from './Card.css'`
> vrátí ve Vite prázdný modul, ne mapu tříd. Příznak: `styles.card` je `undefined`
> a v DOM je `class="undefined"`. Oprava: soubor se musí jmenovat `Card.module.css`.

> [!PITFALL]
> **Styl `body` v modulu komponenty.** `body { background: … }` v `Card.module.css`
> se přejmenovat nedá (není to třída), takže zůstane globální — a zmizí ve chvíli,
> kdy komponentu smažeš. Příznak: pozadí stránky závisí na tom, jestli je zrovna
> vidět karta. Oprava: globální styly patří do `index.css`.

> [!PITFALL]
> **Inline `style` jako náhrada tříd.** `style={{ padding: 16 }}` má vyšší
> specificitu než jakákoli třída, takže se přes něj nedá nic přepsat, a neumí
> `:hover` ani media dotazy. Příznak: hover na tlačítku nefunguje a nikdo neví
> proč. Inline styl si nech na hodnoty, které vznikají za běhu (šířka pruhu podle
> procent).

:::check
Komponenta má `className="badge badge--new"`, v CSS jsou obě pravidla se stejnou
specificitou a modifikátor se neprojevuje. Co je s tím?

### --expected--

Modifikátor je v CSS nad základní třídou

### --accept--

Pravidlo .badge je v souboru až za .badge--new.
Rozhoduje pořadí v CSS, ne v className.

### --why--

Při shodné specificitě vyhrává poslední pravidlo v pořadí CSS. Pořadí jmen
v `className` je jen seznam bez významu.

### --see--

react-aplikace/styly-v-reactu#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

CSS Modules a Tailwind jsou nástroje nad CSS; samotné mechanismy, o které se
opírají, popisuje MDN.

- [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) —
  jak se dědí proměnné a proč stačí přepsat je na jednom prvku.
- [Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity) —
  proč při shodě rozhoduje pořadí a proč inline styl přebije třídu.
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) —
  jak se zeptat na motiv nastavený v systému.
- [Attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) —
  zápis `[data-theme='dark']` a `[data-state='active']`.

# --questions--

## --question--

V `Card.module.css` je třída `.card-title`. Který zápis ji v komponentě použije
správně?

### --answer--

```jsx
<h3 className="card-title">
```

#### --why--

Tímhle prosíš o globální třídu `card-title`, kterou v prohlížeči nikdo nemá —
build ji přejmenoval. Prvek zůstane bez stylu.

### --correct--

```jsx
<h3 className={styles['card-title']}>
```

#### --why--

Klíč s pomlčkou se z objektu vytahuje hranatými závorkami. Proto se v modulech
jména tříd častěji píšou `camelCase`.

### --answer--

```jsx
<h3 className={styles.cardTitle}>
```

#### --why--

Objekt má klíče přesně takové, jaká jsou jména tříd v souboru. `cardTitle` mezi
nimi není, takže je výsledek `undefined`.

## --question--

Komponenta tlačítka má základní vzhled a variantu „nebezpečná akce". Napiš, čím
v komponentě poskládáš `className` tak, aby se varianta přidala jen někdy.

### --expected--

clsx

### --accept--

Funkcí clsx.
clsx(styles.button, isDanger && styles.danger)

### --why--

`clsx` vezme libovolný počet argumentů, nepravdivé zahodí a zbytek spojí mezerou.
Skládání přes `+` se u druhé podmínky rozbije o chybějící mezeru.

### --see--

react-aplikace/styly-v-reactu#podminene-tridy-a-stav

## --question--

Proč tmavý režim řešíš druhou sadou hodnot proměnných, a ne druhou sadou tříd
v každé komponentě?

### --expected--

Aby komponenty o motivu nevěděly

### --accept--

Protože pak se motiv přepíná na jednom místě.
Komponenty sahají na tokeny, takže je nemusíš měnit.

### --why--

Když komponenta sahá na `var(--surface)`, přepnutí motivu je změna hodnoty
proměnné na jednom prvku. Se dvěma sadami tříd bys musel v každé komponentě
myslet na obě varianty a na každou novou taky.

### --see--

react-aplikace/styly-v-reactu#sdilene-tokeny-a-tmavy-rezim

## --question--

Nový projekt, tým dvou lidí, hodně vlastního designu a žádná knihovna komponent.
Který argument mluví **proti** volbě `styled-components`?

### --answer--

Neumí podmíněné styly podle props.

#### --why--

Právě to umí a je to jeho hlavní lákadlo. Problém je jinde než ve funkcích.

### --correct--

Styl se skládá za běhu a komponenta musí být klientská.

#### --why--

Obojí je cena, kterou platí uživatel a architektura aplikace. Dnešní řešení
vyrobí CSS při buildu.

### --answer--

Vyžaduje Tailwind.

#### --why--

Jsou to konkurenční přístupy, ne doplňky. `styled-components` žádný Tailwind
nepotřebuje.
