# Render a rerender

Otevřeš administraci e-shopu, začneš psát do vyhledávacího pole a tabulka se sekne:
každý znak se napíše se zpožděním. Kód je přitom „normální React". Tohle je lekce
o tom, co React při každém stisku klávesy dělá — a proč se v takové tabulce dá
zpoždění odstranit jedním řádkem.

:::check pretest
Klikneš na tlačítko, které nastaví stav na **stejnou** hodnotu, jakou už má
(`setPocet(0)`, když je `pocet` nula). Co myslíš, že se stane?

### --answer--

Komponenta se vykreslí znovu a React jen nezmění DOM.

#### --why--

React opravdu nemění DOM, když se výsledek nezmění. Otázka je, jestli se vůbec dostane k tomu, aby komponentu spustil. Odpověď je v první části.

### --correct--

React komponentu ani nespustí.

#### --why--

React porovná novou hodnotu stavu se starou, a když je stejná, další práci si ušetří. Ukážeme si to na živé ukázce.

### --answer--

React vypíše do konzole varování o zbytečné aktualizaci.

#### --why--

Žádné varování v Reactu na tohle není. Co se opravdu stane, vidíš v první části.
:::

:::check pretest
Rodič se vykreslil znovu. Potomek dostal **úplně stejné** props jako předtím.
Spustí React funkci toho potomka znovu? Odpověz `ano`, nebo `ne`.

### --expected-- ignore-case

ano

### --why--

Ano — a je to nejčastější zdroj zmatku. React se props předem nekouká: vykreslí celý podstrom pod tím, co se změnilo. Zastavit ho umí `memo`, ale za podmínek, které si v lekci projdeme.
:::

Než React něco udělá se stránkou, **spustí tvoje funkce**. Komponenta je funkce,
která dostane props a vrátí popis toho, jak má UI vypadat. React ten popis
porovná s předchozím a do DOMu zapíše jen rozdíl. Spuštění funkcí je levné,
zápis do DOMu drahý — a lidé to obojí míchají do jednoho slova „render".

> [!REMEMBER]
> **Render je spuštění tvé funkce, commit je zápis do DOMu.** React skoro vždycky
> spustí víc funkcí, než kolik prvků v DOMu nakonec změní. Pomalé stránky jsou
> většinou o tom, že se spouští moc funkcí — ne o tom, že React je pomalý.

## Trigger, render, commit

Každá změna na obrazovce jde přes tři kroky:

1. **Trigger** — něco React požádá o aktualizaci: první vykreslení (`createRoot`)
   nebo změna stavu (`setNeco`).
2. **Render** — React spustí funkci komponenty a všech komponent, které se jí
   pod rukama vykreslují. Nic se přitom na stránce nemění.
3. **Commit** — React zapíše rozdíl do DOMu a pak spustí efekty.

V ukázce je `console.log` přímo v těle komponenty, takže uvidíš každý render.
Klikni na **Přišla zpráva** a pak dvakrát na **Přečteno**:

:::live react
```jsx
import { useState } from 'react';

export default function Zvonek() {
  const [zprav, setZprav] = useState(0);
  console.log('render, zpráv:', zprav);

  return (
    <div className="zvonek">
      <p>
        Nepřečtené zprávy: <strong>{zprav}</strong>
      </p>
      <button onClick={() => setZprav(zprav + 1)}>Přišla zpráva</button>
      <button onClick={() => setZprav(0)}>Přečteno</button>
    </div>
  );
}
```
```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f6f7f9;
  color: #101828;
}
.zvonek {
  margin: 1.5rem;
  padding: 1.25rem 1.5rem;
  max-width: 22rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.12);
}
.zvonek strong {
  font-size: 1.5rem;
}
button {
  margin-right: 0.5rem;
  padding: 0.5rem 0.9rem;
  border: 0;
  border-radius: 0.5rem;
  background: #1d4ed8;
  color: #fff;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}
button:hover {
  background: #1e40af;
}
button:focus-visible {
  outline: 2px solid #f59f0a;
  outline-offset: 2px;
}
```
:::

Druhý klik na **Přečteno** už do konzole nic nenapíše: stav byl nula a zůstal
nula, takže React render ani nespustil. Zkus přidat do těla komponenty `alert`
místo `console.log` a sleduj, kolikrát vyskočí — a pak to zas vrať.

:::check
Klikneš na **Přišla zpráva**. Který ze tří kroků (trigger, render, commit) spustí `onClick`, a který z nich zapíše nové číslo do stránky? Odpověz dvěma slovy oddělenými mezerou.

### --expected-- ignore-case

trigger commit

### --why--

`onClick` je trigger: zavolá `setZprav`, a tím požádá o aktualizaci. Pak přijde render (React spustí funkci `Zvonek` a dostane popis nového UI) a nakonec commit, který do DOMu zapíše nové číslo.

### --see--

react-hloubka/render-a-rerender#trigger-render-commit
:::

## Když se vykreslí rodič, vykreslí se i potomci

Tohle je věta, která vysvětluje většinu „proč je to pomalé": React se
nerozhoduje podle props. Když se vykreslí rodič, vykreslí (spustí) i všechny
komponenty, které rodič vrací — bez ohledu na to, jestli mají stejné props.

:::live react predict
```jsx
import { useState } from 'react';

function Radek({ nazev }) {
  console.log('Radek', nazev);
  return <li>{nazev}</li>;
}

function Seznam() {
  console.log('Seznam');
  return (
    <ul>
      {['Rohlík', 'Mléko'].map((n) => (
        <Radek key={n} nazev={n} />
      ))}
    </ul>
  );
}

export default function App() {
  const [hledej, setHledej] = useState('');
  console.log('App');
  return (
    <div>
      <input value={hledej} onChange={(e) => setHledej(e.target.value)} placeholder="Hledat" />
      <Seznam />
    </div>
  );
}
```
--question-- Napíšeš do pole **jeden** znak. Co se objeví v konzoli?
--option-- Jen `App` — `Seznam` ani `Radek` nemají props, takže se přeskočí.
--option*-- `App`, `Seznam` a oba `Radek`y.
--option-- Nic, dokud se nezmění délka seznamu.
--why-- `setHledej` je trigger pro `App`. React spustí `App` a s ní všechno, co `App` vrací — `Seznam` a v něm oba řádky. Props se přitom vůbec neporovnávají. Do DOMu se ale zapíše jen nová hodnota vstupu; commit je malý, render velký.
:::

Že se funkce spustila, ještě neznamená, že se stránka překreslila. U dvou
řádků je to zdarma. U tabulky s pěti sty řádky a šesti sloupci to znamená tři
tisíce spuštění funkce na každý stisk klávesy — a to už je ten sekající se filtr
z úvodu.

:::check
Podle čeho se React rozhoduje, jestli spustí funkci potomka?

### --answer--

Porovná props potomka s předchozími a při shodě ho přeskočí.

#### --why--

Tohle dělá až `memo`, a to ho tam musíš dát sám. Obyčejná komponenta se takhle nechová — jinak by `memo` k ničemu nebylo.

### --correct--

Nerozhoduje se: spustí všechno, co vykreslila komponenta, ve které se změnil stav.

#### --why--

React jde od změněné komponenty dolů a spustí cestou všechno. Až v commitu porovná nový popis UI se starým a u `Seznamu` zjistí, že není co zapsat.

### --answer--

Podle toho, jestli se potomek objevil v DOMu poprvé.

#### --why--

První vykreslení se od dalších liší jen tím, že React nemá s čím porovnávat popis UI. Kdy se funkce potomka spustí, to neurčuje.

### --see--

react-hloubka/render-a-rerender#kdyz-se-vykresli-rodic-vykresli-se-i-potomci
:::

## Identita: každý render vyrábí nové objekty a funkce

Tělo komponenty se spouští celé znovu, takže všechno, co v něm vytvoříš,
je pokaždé **nová hodnota**. Objektový literál, pole i šipková funkce vypadají
stejně, ale nejsou `Object.is` shodné s tou z minulého renderu — jsou to
[[reference]] na dvě různá místa v paměti.

:::memory
```jsx
export default function App() {
  const [hledej, setHledej] = useState('');
  const filtr = { jenSkladem: true };
  return <Seznam filtr={filtr} onVybrat={(id) => console.log(id)} />;
}
```
--step-- 3 | první render: vznikne objekt filtru a funkce
filtr -> @filtr-a
@filtr-a: { jenSkladem: true }
@fn-a: (id) => console.log(id)
--step-- 3 | po `setHledej('a')`: tělo se spustí znovu, hodnoty jsou nové
filtr -> @filtr-b
@filtr-a: { jenSkladem: true } (zůstal u předchozího renderu)
@filtr-b: { jenSkladem: true }
@fn-b: (id) => console.log(id)
:::

Oba objekty mají stejný obsah, ale `@filtr-a === @filtr-b` je `false`. Pro tebe
je to detail, pro `memo`, `useEffect` a `useMemo` je to **všechno** — porovnávají
totiž identitu, ne obsah.

:::check
`const filtr = { jenSkladem: true };` je v těle komponenty. Co vrátí porovnání `filtr` z prvního renderu a `filtr` z druhého renderu přes `===`?

### --expected--

false

### --why--

Objektový literál vyrobí při každém spuštění těla nový objekt. `===` u objektů porovnává, jestli jde o tentýž objekt, ne jestli mají stejný obsah — a tady jde o dva různé.

### --see--

react-hloubka/render-a-rerender#identita-kazdy-render-vyrabi-nove-objekty-a-funkce
:::

## `memo`: zarážka, kterou lehce obejdeš

`memo(Komponenta)` vytvoří komponentu, která se **přeskočí**, když jsou její
props po jedné porovnané přes `Object.is` stejné jako minule. Přeskočí se
i s celým svým podstromem.

V ukázce jsou dvě zapamatované komponenty. `SeznamZDat` dostává pole, které leží
mimo komponentu, `SeznamZTela` pole vytvořené v těle `App`. Napiš do pole znak
a přečti konzoli:

:::live react
```jsx
import { memo, useState } from 'react';

const NA_SKLADE = ['Rohlík', 'Mléko'];

const SeznamZDat = memo(function SeznamZDat({ polozky }) {
  console.log('SeznamZDat');
  return <ul>{polozky.map((p) => <li key={p}>{p}</li>)}</ul>;
});

const SeznamZTela = memo(function SeznamZTela({ polozky }) {
  console.log('SeznamZTela');
  return <ul>{polozky.map((p) => <li key={p}>{p}</li>)}</ul>;
});

export default function App() {
  const [hledej, setHledej] = useState('');
  const vObjednavce = ['Chleba'];

  return (
    <div className="panel">
      <input value={hledej} onChange={(e) => setHledej(e.target.value)} placeholder="Hledat" />
      <SeznamZDat polozky={NA_SKLADE} />
      <SeznamZTela polozky={vObjednavce} />
    </div>
  );
}
```
```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f6f7f9;
}
.panel {
  margin: 1.5rem;
  padding: 1.25rem;
  max-width: 20rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.12);
}
input {
  padding: 0.45rem 0.6rem;
  width: 100%;
  border: 1px solid #cfd4dc;
  border-radius: 0.5rem;
  font: inherit;
}
ul {
  margin: 0.75rem 0 0;
  padding-left: 1.1rem;
}
```
:::

V konzoli je při psaní jen `SeznamZTela`. `SeznamZDat` dostává pořád tentýž
objekt pole, takže `memo` funguje; `SeznamZTela` dostává pokaždé nové pole,
takže `memo` nezabere a jen přidá porovnávání navíc. Zkus `vObjednavce`
přesunout nad `App` a sleduj, jak druhý výpis z konzole zmizí.

> [!PITFALL]
> **`memo` s objektem, polem nebo funkcí vytvořenou v těle rodiče nedělá nic.**
> Příznak: komponenta je v `memo`, a přesto se v konzoli hlásí při každém
> stisknutí klávesy. Oprava: podat jí primitivní props (`pocet`, `nazev`),
> přesunout konstantní data mimo komponentu, nebo identitu udržet přes
> `useMemo` / `useCallback`.

:::check
`memo(Radek)` dostává dvě props: `nazev` (text) a `onSmazat={() => smazat(radek.id)}`. Přeskočí React `Radek` při renderu rodiče?

### --answer--

Ano, `nazev` se nemění, takže porovnání projde.

#### --why--

Porovnávají se **všechny** props, ne jen ta první. Zkontroluj i tu druhou: co je `onSmazat` při každém spuštění těla rodiče?

### --correct--

Ne, `onSmazat` je při každém renderu nová funkce.

#### --why--

Šipková funkce v JSX vzniká při každém renderu znovu a `Object.is` dvě různé funkce neshodne. Stabilní identitu dá `useCallback`, nebo pošli potomkovi jen `id` a funkci si vezme z kontextu.

### --answer--

Ne, `memo` s funkcí v props vyhodí varování.

#### --why--

Žádné varování se neukáže — a právě to je na tom nepříjemné. `memo` mlčky nefunguje a v konzoli to poznáš jen na výpisech z renderu.

### --see--

react-hloubka/render-a-rerender#memo-zarazka-kterou-lehce-obejdes
:::

## `useMemo`, `useCallback` a React Compiler

Oba hooky dělají jedinou věc: **drží hodnotu mezi rendery**, dokud se nezmění
závislosti. `useMemo(() => vypocet(a), [a])` si pamatuje výsledek,
`useCallback((x) => …, [a])` si pamatuje funkci.

Mají tři legitimní důvody:

- **drahý výpočet** (řazení a filtrování tisíců řádků) se nemá dělat při každém
  stisku klávesy,
- **stabilní identita** props pro potomka v `memo`,
- **stabilní identita** hodnoty, která je v [[závislosti efektu]].

Od verze 1.0 (2025) je k dispozici **React Compiler** — nástroj, který
memoizaci vkládá do kódu sám při překladu. V novém projektu ho zapneš a ruční
`useMemo` a `useCallback` z většiny míst zmizí. Naučit se je ale musíš: potkáš
je v každém existujícím projektu a hlavně na nich pochopíš identitu hodnot.

> [!REMEMBER]
> **`useMemo` řeší drahý výpočet a stabilní identitu, ne „aby se to nevykreslovalo".**
> Když má komponenta problém s rychlostí, nejdřív změř (React DevTools, záložka
> Profiler), a teprve pak memoizuj. Ruční [[memoizace]] bez měření je jen kód navíc.

:::check
V komponentě je `const polozky = data.map(zaokrouhlit);` a pod tím `useMemo(() => filtrovat(polozky, hledej), [polozky, hledej])`. Jak často se `filtrovat` spustí?

### --answer--

Jen při změně `hledej` nebo `data`.

#### --why--

To by platilo, kdyby se `polozky` mezi rendery neměnily. Čím je `polozky` mezi dvěma rendery — tím samým polem, nebo novým?

### --correct--

Při každém renderu, protože `polozky` je pokaždé nové pole.

#### --why--

`useMemo` porovnává závislosti přes `Object.is`. Nové pole z `map` se nikdy nerovná předchozímu, takže si `useMemo` uloží výsledek, který už nikdy nepoužije. Pomůže dát do `useMemo` i `polozky`, nebo memoizovat celý výpočet nad `data`.

### --answer--

Nikdy — `useMemo` výpočet odloží, dokud výsledek někdo nepřečte.

#### --why--

`useMemo` nic neodkládá. Funkci, kterou mu předáš, spustí hned během renderu; jen ji při nezměněných závislostech přeskočí.

### --see--

react-hloubka/render-a-rerender#usememo-usecallback-a-react-compiler
:::

## `StrictMode`: ve vývoji se render dělá dvakrát

Ve vývoji React komponentu při každém renderu spustí **dvakrát**, když je
zabalená ve `<StrictMode>`. Není to chyba: je to test, jestli je tvůj render
čistý. Čistá funkce vrátí při stejném vstupu stejný výsledek a nic vedle
nezmění, takže druhé spuštění nesmí být vidět.

V ukázce je `StrictMode` obalený jen kolem počítadla, aby bylo vidět, koho se
to týká:

:::live react
```jsx
import { StrictMode, useState } from 'react';

function Pocitadlo() {
  const [n, setN] = useState(0);
  console.log('render', n);
  return <button onClick={() => setN(n + 1)}>Přidáno: {n}</button>;
}

export default function App() {
  return (
    <StrictMode>
      <Pocitadlo />
    </StrictMode>
  );
}
```
:::

V konzoli je `render 0` dvakrát, po kliknutí `render 1` dvakrát. V hotové
aplikaci (produkční build) se to nedeje. Zkus `StrictMode` odstranit a sleduj,
jak se výpisy zdvojí i nezdvojí.

> [!NOTE]
> `StrictMode` se v projektu zapíná v `main.jsx` kolem celé aplikace. Kromě
> dvojího renderu zdvojuje i efekty — a proč, uvidíš v lekci
> [useEffect správně](see:react-hloubka/useeffect-spravne#strictmode-mount-unmount-mount).

:::check
Kterou vlastnost renderu ti `StrictMode` svým dvojím spuštěním kontroluje? Doplň chybějící slovo: render musí být ==…== funkce.

### --expected-- ignore-case

čistá

### --accept--

cista
čistá funkce

### --why--

Render musí být [[čistá funkce]]: ze stejného vstupu stejný výsledek a žádná změna vnějšího světa. Pak je druhé spuštění nepozorovatelné. Jakmile se zdvojení projeví (položka v seznamu dvakrát, sudé přírůstky), máš v renderu vedlejší efekt.

### --see--

react-hloubka/render-a-rerender#strictmode-ve-vyvoji-se-render-dela-dvakrat
:::

## Typické chyby a pasti

### Nečistý render

> [!PITFALL]
> **Render, který mění něco mimo sebe, ve `StrictMode` dělá věci dvakrát.**
> Typicky `polozky.push(…)` nad props, `pocitadlo++` nad proměnnou z modulu nebo
> zápis do `document.title` přímo v těle. Příznak: zdvojené položky, sudé
> přírůstky, v produkci se to „opraví samo" (a chyba zůstane). Oprava: render
> jen počítá a vrací JSX; změny vnějšího světa patří do handleru nebo do efektu.

### Změna `key` vyhodí stav

> [!PITFALL]
> **Nový `key` znamená novou komponentu.** React podle `key` rozhoduje, jestli
> jde o tutéž instanci. `key={Math.random()}` nebo `key={index}` po přeskládání
> seznamu proto smaže rozepsaný text ve vstupu a resetuje `useState`. Příznak:
> políčko se při psaní samo maže. Oprava: `key` = stabilní `id` záznamu.
> Naopak když stav resetovat **chceš** (jiný klient, jiný formulář), je změna
> `key` ta nejčistší cesta.

### Optimalizace, která nic neoptimalizuje

> [!PITFALL]
> **`memo` kolem komponenty, jejíž rodič se nikdy nevykresluje, a `useCallback`
> pro handler předaný obyčejnému `<button>` jsou jen kód navíc.** Příznak:
> soubor plný `useMemo` a profil, který se nezměnil. Oprava: smazat, nebo změřit
> v Profileru a nechat jen to, co něco zkrátilo.

:::check
Kolegův seznam maže při psaní rozepsaný text v políčku u každého řádku. V kódu je `<Radek key={Math.random()} … />`. Co je příčinou?

### --answer--

`Math.random()` vrací občas stejné číslo, takže mají dva řádky stejný `key`.

#### --why--

Duplicitní `key` je jiná chyba (React na ni upozorní v konzoli). Tady se problém týká **každého** řádku při každém renderu — podívej se, co se s `key` děje mezi dvěma rendery.

### --correct--

Každý render dá řádku nový `key`, takže React starý řádek odmontuje a namontuje nový s prázdným stavem.

#### --why--

`key` je pro React identita komponenty. Nový `key` = nová komponenta = výchozí stav. Oprava je `key` ze stabilního `id` záznamu.

### --answer--

`key` se dává jen prvkům DOMu, ne komponentám, takže ho React ignoruje.

#### --why--

`key` patří ke každému prvku v seznamu, komponenty nevyjímaje — a právě u komponent se ztráta stavu projeví nejvíc.

### --see--

react-hloubka/render-a-rerender#zmena-key-vyhodi-stav
:::

:::explain
Vysvětli vlastními slovy, proč `memo(Seznam)` nezabralo, když mu rodič předává `filtr={{ jenSkladem: true }}`.

## --model--

Tělo rodiče se při každém renderu spustí celé, takže objektový literál `{ jenSkladem: true }` vyrobí pokaždé nový objekt. `memo` porovnává props přes `Object.is`, tedy identitu — a dva různé objekty se stejným obsahem nejsou tentýž objekt. Porovnání proto vždycky selže a `Seznam` se vykreslí, jako by tam `memo` nebylo. Pomůže poslat primitivní props, přesunout konstantu mimo komponentu, nebo identitu udržet přes `useMemo`.

## --checklist--

- Tělo komponenty se spouští celé při každém renderu.
- Objektový literál a šipková funkce mají při každém renderu novou identitu.
- `memo` porovnává props podle identity, ne podle obsahu.
- Řešením je stabilní identita (konstanta mimo komponentu, `useMemo`, `useCallback`) nebo primitivní props.
:::

## Kde to najdeš v MDN

- [Object.is()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) —
  porovnání, kterým React vyhodnocuje props v `memo` i závislosti hooků.
- [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness) —
  přehled `===`, `Object.is` a proč jsou dva objekty se stejným obsahem různé.
- [Performance: measure()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure) —
  jak si změřit vlastní úsek kódu, když chceš čísla mimo React DevTools.

> [!NOTE]
> Oficiální dokumentace Reactu k této lekci: [Render and Commit](https://react.dev/learn/render-and-commit),
> [memo](https://react.dev/reference/react/memo) a [StrictMode](https://react.dev/reference/react/StrictMode).
> Profiler najdeš v rozšíření React DevTools pro prohlížeč.

# --questions--

## --question--

V konzoli vidíš při psaní do vstupu tohle:

```text
App
Tabulka
Radek Chleba
Radek Mléko
```

Kolik prvků DOMu React v takovém případě nejspíš změní, když se text vstupu jen zapisuje do stavu?

### --expected--

jeden

### --accept--

1
jen vstup
jeden — hodnotu vstupu

### --why--

Render spustil čtyři funkce, ale commit porovná výsledek se starým: v seznamu se nic nezměnilo, takže se zapíše jen nová hodnota vstupu. Právě proto se render a commit rozlišují — počet renderů nic neříká o tom, kolik práce měl prohlížeč.

### --see--

react-hloubka/render-a-rerender#trigger-render-commit

## --question--

Komponenta `Faktura` se vykresluje pomalu, protože při každém renderu řadí tisíc řádků. Co uděláš jako první?

### --answer--

Obalím `Faktura` do `memo`.

#### --why--

`memo` zabrání renderu jen tehdy, když se props nezmění. Řazení se ale děje **uvnitř** renderu, který proběhnout musí, kdykoli se změní stav komponenty samotné.

### --correct--

Změřím v Profileru, kolik času řazení opravdu zabere, a pak ho zabalím do `useMemo` se závislostmi na datech a kritériu.

#### --why--

Nejdřív číslo, pak zásah. `useMemo` je tady na místě: drahý výpočet se má spustit jen při změně dat nebo kritéria řazení.

### --answer--

Přesunu řazení do `useEffect`, aby neblokovalo render.

#### --why--

Efekt běží po commitu, takže by se stránka nejdřív vykreslila neseřazená a hned poté znovu — dva rendery místo jednoho a poskakující obsah.

### --see--

react-hloubka/render-a-rerender#usememo-usecallback-a-react-compiler

## --question--

Napiš, co se v tomhle kódu stane s rozepsaným textem v `<input>` uvnitř `Poznamka`, když uživatel klikne na tlačítko. Odpověz jedním slovem.

```jsx
function Seznam({ klienti }) {
  const [poradi, setPoradi] = useState(0);
  return (
    <div>
      <button onClick={() => setPoradi(poradi + 1)}>Další klient</button>
      <Poznamka key={poradi} />
    </div>
  );
}
```

### --expected-- ignore-case

smaže se

### --accept--

zmizí
resetuje se
vymaže se

### --why--

Změna `key` říká Reactu, že jde o jinou komponentu: starou odmontuje (a zahodí její stav) a novou namontuje s výchozím stavem. Tady je to dokonce záměr — u dalšího klienta má být poznámka prázdná.

### --see--

react-hloubka/render-a-rerender#zmena-key-vyhodi-stav

## --question--

Kolikrát se ve vývoji s `<StrictMode>` vypíše `console.log` z těla komponenty při prvním vykreslení a kolikrát v produkčním buildu? Napiš dvě čísla oddělená mezerou.

### --expected--

2 1

### --why--

Ve vývoji React render zdvojuje, aby ukázal nečisté komponenty; v produkci se komponenta spustí jednou. Kdyby se ti zdvojení projevilo na výsledku, je to chyba v kódu, ne v Reactu.

### --see--

react-hloubka/render-a-rerender#strictmode-ve-vyvoji-se-render-dela-dvakrat
