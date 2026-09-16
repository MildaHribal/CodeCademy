# Vlastní hooky

Otevři libovolný React projekt v práci a najdeš v něm složku `hooks/`. Bydlí v ní
funkce jako `useDebouncedValue`, `useLocalStorage`, `useMediaQuery` nebo
`useOnClickOutside` — a jsou to obyčejné funkce, které si napsal někdo z týmu.
Jednu takovou (`useOznameni`) jsi napsal v minulém workshopu; teď se podíváme,
podle jakých pravidel fungují a co přesně sdílejí.

:::check pretest
Dvě různé komponenty na stránce zavolají tentýž vlastní hook `usePocitadlo()`.
Uživatel klikne na tlačítko v první z nich. Co se stane s číslem v druhé?

### --answer--

Zvýší se taky — hook je jeden a stav v něm taky.

#### --why--

Hook je funkce, ne úložiště. Zkus se zeptat, kdo vlastně `useState` uvnitř hooku „patří".

### --correct--

Nic, druhá komponenta si počítá své vlastní číslo.

#### --why--

Tohle je nejdůležitější věta celé lekce a hned si ji ukážeme na živé ukázce.

### --answer--

React ohlásí chybu, že se hook volá dvakrát.

#### --why--

Volat stejný hook z víc komponent je úplně normální — přesně kvůli tomu vlastní hooky vznikly.
:::

:::check pretest
Proč se vlastní hooky musí jmenovat `useNeco`? Odpověz jednou větou.

### --expected--

podle jména se pozná, že uvnitř volá hooky

### --accept--

aby React a ESLint poznaly, že jde o hook
podle jména se kontrolují pravidla hooků
aby na něj platila pravidla hooků

### --why--

Jméno není kosmetika: podle předpony `use` pozná ESLint (a React DevTools), že se na tu funkci mají vztahovat pravidla hooků. Funkce bez `use`, která zavolá `useState`, projde bez varování a rozbije se až za běhu.
:::

Vlastní hook nepřináší žádnou novou schopnost. Je to **funkce, která smí volat
jiné hooky** — a tím pádem si smí pořídit stav, efekt nebo ref pro komponentu,
která ji zavolala.

> [!REMEMBER]
> **Vlastní hook sdílí logiku, ne stav.** Každé zavolání hooku si pořídí vlastní
> `useState` uvnitř té komponenty, která ho volá. Chceš-li sdílet data mezi
> komponentami, potřebuješ kontext nebo stav u společného rodiče, ne hook.

## Z komponenty do hooku

Hook vytáhneš ve chvíli, kdy se ti v komponentě sejde **stav a logika kolem
něj**, se kterou samotný JSX nemá nic společného. Postup je mechanický: vezmi
řádky se stavem a efekty, přesuň je do funkce `useNeco`, vrať z ní to, co
komponenta potřebuje, a v komponentě funkci zavolej.

Před vytažením má komponenta stav, efekt i JSX pohromadě:

```jsx
const [text, setText] = useState('');
const [ulozeno, setUlozeno] = useState(false);

useEffect(() => {
  const id = setTimeout(() => setUlozeno(true), 500);
  return () => clearTimeout(id);
}, [text]);
```

Po vytažení zbyde v komponentě jediný řádek a logika bydlí v souboru `hooks.js`:

```jsx
const { text, setText, ulozeno } = useAutoUlozeni('');
```

Komponenta se tím zkrátí na to, co opravdu dělá: vykresluje. A logika je na
jednom místě, odkud se dá použít i jinde.

:::check
Podle čeho poznáš, že je čas vytáhnout kus komponenty do vlastního hooku?

### --expected--

když se stav a logika kolem něj opakují

### --accept--

když stejný stav a efekt potřebuje víc komponent
když logika se stavem nesouvisí s JSX
opakuje se stav a efekt ve víc komponentách

### --why--

Vlastní hook je na **stav a logiku kolem něj** (efekty, odvozené hodnoty, obsluhy), která se opakuje nebo která s vykreslováním nemá nic společného. Kód, který jen počítá z argumentů a žádný hook nevolá, patří do obyčejné funkce — hook z něj nedělej.

### --see--

react-hloubka/vlastni-hooky#z-komponenty-do-hooku
:::

## Hook sdílí logiku, ne stav

Tohle je místo, kde se lidé nejčastěji seknou. Na obrazovce jsou dvě počítadla
a obě volají tentýž `usePocitadlo`. Klikni na první:

:::live react predict
```jsx
import { useState } from 'react';

function usePocitadlo(pocatek = 0) {
  const [hodnota, setHodnota] = useState(pocatek);
  const pridej = () => setHodnota((h) => h + 1);
  return { hodnota, pridej };
}

function Tlacitko({ popis }) {
  const { hodnota, pridej } = usePocitadlo();
  return (
    <button onClick={pridej}>
      {popis}: {hodnota}
    </button>
  );
}

export default function App() {
  return (
    <div>
      <Tlacitko popis="Káva" />
      <Tlacitko popis="Čaj" />
    </div>
  );
}
```
--question-- Klikneš třikrát na tlačítko **Káva**. Co bude na obrazovce?
--option-- `Káva: 3` a `Čaj: 3` — hook mají společný.
--option*-- `Káva: 3` a `Čaj: 0`
--option-- `Káva: 3` a `Čaj: 3`, ale až po překreslení celé stránky.
--why-- Volání hooku je jako vložení jeho těla do komponenty. `useState` uvnitř `usePocitadlo` tedy nepatří hooku, ale té komponentě, která ho zavolala — a ty jsou dvě, takže jsou i dva nezávislé stavy. Kdyby mělo být číslo společné, musel by stav bydlet výš (u rodiče) nebo v kontextu.
:::

Jinak řečeno: **hook je recept, ne spíž.** Každá komponenta, která ho použije,
si uvaří vlastní porci. Přesně proto můžeš `useOznameni` z minulého workshopu
zavolat i na jiné obrazovce a nic se nepomíchá.

:::check
Dvě komponenty volají `useUzivatel()`, který si v efektu načte přihlášeného uživatele. Kolik načtení proběhne?

### --answer--

Jedno — hook si výsledek zapamatuje pro všechny.

#### --why--

Hook nemá žádnou vlastní paměť mimo komponenty. Zkus si představit, že jeho tělo prostě zkopíruješ do obou komponent.

### --correct--

Dvě — každá komponenta má vlastní stav i vlastní efekt.

#### --why--

Každé zavolání hooku vytvoří v té komponentě vlastní stav a vlastní efekt. Sdílení dat řeší kontext nebo knihovna na dotazy (TanStack Query), ne samotný hook.

### --answer--

Jedno při prvním renderu, pak už nikdy.

#### --why--

Efekty se spouštějí podle závislostí v každé komponentě zvlášť, ne globálně pro celou aplikaci.

### --see--

react-hloubka/vlastni-hooky#hook-sdili-logiku-ne-stav
:::

## Pravidla hooků: vždycky všechny a ve stejném pořadí

React si stav komponenty nepamatuje podle jmen, ale **podle pořadí, ve kterém se
hooky zavolaly**. První `useState` v komponentě je „stav číslo 1", druhý „stav
číslo 2". Proto platí dvě pravidla:

1. Hook se volá jen **na nejvyšší úrovni** komponenty nebo jiného hooku — nikdy
   v `if`, v cyklu, ve vnořené funkci ani po `return`.
2. Hook se volá jen **z komponenty nebo z jiného hooku**, ne z obyčejné funkce
   ani z obsluhy události.

:::live react predict
```jsx
import { useState } from 'react';

export default function Formular() {
  const [rozsireny, setRozsireny] = useState(false);
  if (rozsireny) {
    const [poznamka, setPoznamka] = useState('');
  }

  return (
    <button onClick={() => setRozsireny(!rozsireny)}>
      Rozšířit ({String(rozsireny)})
    </button>
  );
}
```
--question-- Kdy se komponenta rozbije?
--option-- Hned při prvním vykreslení — podmíněný hook React odmítne vždycky.
--option*-- Až při kliknutí, kdy se počet zavolaných hooků oproti minulému renderu změní.
--option-- Nikdy, `useState` uvnitř `if` je legální, jen se nedoporučuje.
--why-- Při prvním renderu je `rozsireny` nepravdivé, takže se zavolá jeden hook a všechno projde. Po kliknutí se zavolají dva — a React, který si stav ukládá podle pořadí volání, ohlásí `Rendered more hooks than during the previous render.` Proto se hooky volají bezpodmínečně a rozhodování se dělá až s jejich výsledkem.
:::

> [!TIP]
> Obě pravidla hlídá ESLint (`react-hooks/rules-of-hooks`). Zapnutý ho máš
> v každém projektu z Vite šablony a jeho chyby se nedají „obejít" komentářem —
> jsou to skutečné chyby, ne názor.

:::check
Potřebuješ stav jen tehdy, když komponenta dostane prop `editovatelny`. Jak to napíšeš?

### --answer--

`if (editovatelny) { const [text, setText] = useState(''); }`

#### --why--

Tenhle zápis změní počet volaných hooků podle props a React ohlásí, že jich napočítal jiný počet než minule.

### --correct--

Hook zavolám vždycky a podle `editovatelny` se rozhodnu až o tom, co vykreslím.

#### --why--

Nevyužitý stav nic nestojí. Podmínka patří do JSX nebo do obsluh, ne kolem volání hooku.

### --answer--

Vytvořím druhou komponentu jen pro editaci a hook dám do ní — stejný problém jen posunu jinam.

#### --why--

Tohle je ve skutečnosti taky legitimní řešení (komponenta s hookem se vykreslí jen podmíněně), ale je to zbytečná práce, když stačí hook zavolat vždycky. Vyber odpověď, která řeší přímo tuhle komponentu.

### --see--

react-hloubka/vlastni-hooky#pravidla-hooku-vzdycky-vsechny-a-ve-stejnem-poradi
:::

## `useLocalStorage`: hodnota, která přežije zavření karty

První skutečně užitečný hook. Chová se jako `useState`, jen si hodnotu ukládá
do `localStorage`, takže po znovunačtení stránky zůstane. Přepni tmavý režim,
obnov náhled tlačítkem **Obnovit** a nastavení tam bude pořád:

:::live react
```jsx
import { useEffect, useState } from 'react';

function useLocalStorage(klic, vychozi) {
  const [hodnota, setHodnota] = useState(() => {
    const ulozene = localStorage.getItem(klic);
    return ulozene === null ? vychozi : JSON.parse(ulozene);
  });

  useEffect(() => {
    localStorage.setItem(klic, JSON.stringify(hodnota));
  }, [klic, hodnota]);

  return [hodnota, setHodnota];
}

export default function Nastaveni() {
  const [tmave, setTmave] = useLocalStorage('tmavy-rezim', false);

  return (
    <div className={tmave ? 'panel panel--tmavy' : 'panel'}>
      <label>
        <input type="checkbox" checked={tmave} onChange={(e) => setTmave(e.target.checked)} />
        Tmavý režim
      </label>
      <p className="panel__stav">V úložišti: {JSON.stringify(tmave)}</p>
    </div>
  );
}
```
```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
.panel {
  margin: 1.5rem;
  padding: 1.25rem;
  max-width: 20rem;
  border-radius: 0.75rem;
  background: #fff;
  color: #101828;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.14);
  transition: background 0.2s ease, color 0.2s ease;
}
.panel--tmavy {
  background: #101828;
  color: #f2f4f7;
}
.panel__stav {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
  opacity: 0.7;
}
```
:::

Dvě věci stojí za pozornost. `useState` dostal **funkci**, ne hodnotu — tak se
čtení z úložiště provede jen při prvním renderu, ne při každém. A hook vrací
dvojici jako `useState`, takže se používá úplně stejně. Zkus změnit klíč
`'tmavy-rezim'` na jiný a uvidíš, že se panel vrátí do výchozího stavu.

> [!PITFALL]
> **`useState(localStorage.getItem(klic))` bez funkce čte z úložiště při každém
> renderu.** Příznak: stránka se s rostoucím množstvím dat zpomaluje a v profilu
> je vidět čtení úložiště na každý stisk klávesy. React si sice použije jen první
> výsledek, ale spočítat ho musíš pokaždé. Oprava: `useState(() => …)`.

:::check
Proč se počáteční hodnota předává jako `useState(() => JSON.parse(…))`, a ne jako `useState(JSON.parse(…))`?

### --answer--

Protože jinak by se hodnota uložila do stavu jako funkce.

#### --why--

Funkce předaná do `useState` se nikdy neuloží jako hodnota — React ji zavolá a použije, co vrátí. Otázka je, **kdy** se ten výpočet provede.

### --correct--

Protože argument se vyhodnocuje při každém renderu, kdežto funkci React zavolá jen při prvním.

#### --why--

`useState(neco())` spočítá `neco()` pokaždé a výsledek zahodí; `useState(() => neco())` ho spočítá jen jednou. U čtení z úložiště nebo drahého výpočtu je to znát.

### --answer--

Protože `JSON.parse` může vyhodit výjimku a funkce ji zachytí.

#### --why--

Funkce sama nic nezachytává — výjimka z ní vyletí stejně jako z obyčejného výrazu. Ošetření chyby by musel udělat `try`/`catch` uvnitř.

### --see--

react-hloubka/vlastni-hooky#uselocalstorage-hodnota-ktera-prezije-zavreni-karty
:::

## `useDebouncedValue`: hook s efektem a úklidem

Druhý klasický hook. Dostane hodnotu a vrátí ji se zpožděním — a když se hodnota
mezitím zase změní, začne se počítat znovu. Přesně to potřebuješ, aby se
našeptávač neptal serveru na každé písmeno. Vzor [[debounce]] znáš z JavaScriptu,
tady je v hookové podobě. Piš do pole rychle a pak se zastav:

:::live react
```jsx
import { useEffect, useState } from 'react';

function useZpozdenaHodnota(hodnota, prodleva = 400) {
  const [zpozdena, setZpozdena] = useState(hodnota);

  useEffect(() => {
    const id = setTimeout(() => setZpozdena(hodnota), prodleva);
    return () => clearTimeout(id);
  }, [hodnota, prodleva]);

  return zpozdena;
}

export default function Hledani() {
  const [dotaz, setDotaz] = useState('');
  const zpozdenyDotaz = useZpozdenaHodnota(dotaz);

  return (
    <div className="hledani">
      <input value={dotaz} onChange={(e) => setDotaz(e.target.value)} placeholder="Hledej kapelu" />
      <p>Píšu: <strong>{dotaz || '—'}</strong></p>
      <p>Poslal bych na server: <strong>{zpozdenyDotaz || '—'}</strong></p>
    </div>
  );
}
```
```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #101828;
}
.hledani {
  margin: 1.5rem;
  padding: 1.25rem;
  max-width: 22rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.14);
}
input {
  padding: 0.5rem 0.65rem;
  width: 100%;
  border: 1px solid #cfd4dc;
  border-radius: 0.5rem;
  font: inherit;
}
p {
  margin: 0.6rem 0 0;
  color: #475467;
}
```
:::

Celé kouzlo je v úklidu: každá změna hodnoty zruší rozběhnutý časovač a nasadí
nový. Poslední časovač tak doběhne jen tehdy, když uživatel na chvíli přestane
psát. Zkus úklid smazat a sleduj, jak se dolní řádek začne měnit po každém
písmenu s pevným zpožděním.

:::check
Co se stane, když z efektu v `useZpozdenaHodnota` odstraníš `return () => clearTimeout(id);`?

### --answer--

Zpožděná hodnota se přestane měnit úplně.

#### --why--

Naplánované časovače doběhnou tak jako tak — každý z nich zavolá `setZpozdena`. Změn tedy bude spíš víc než míň.

### --correct--

Doběhnou všechny naplánované časovače, takže se hodnota postupně mění po každém písmenu.

#### --why--

Bez úklidu se časovače jen hromadí a každý po své prodlevě zapíše svou hodnotu. Efekt tím ztratí smysl: server dostane tolik dotazů jako bez zpoždění, jen o kousek později.

### --answer--

React vypíše varování o efektu bez úklidu.

#### --why--

Žádné takové varování neexistuje — a proto je chybějící úklid tak zrádný. Odhalí se až chováním, nebo ve `StrictMode`.

### --see--

react-hloubka/vlastni-hooky#usedebouncedvalue-hook-s-efektem-a-uklidem
:::

## `useMediaQuery`: čtení z vnějšího zdroje bez efektu

Hodnota media dotazu je typická věc, která žije mimo React: prohlížeč ji mění,
kdy chce. Dala by se hlídat efektem a stavem, ale React má na přesně tenhle
případ hook `useSyncExternalStore`. Chce dvě funkce: jednu, která se **přihlásí
k odběru** změn a vrátí odhlašovací funkci, a druhou, která **přečte aktuální
hodnotu**.

Přepni šířku náhledu přepínačem nad ním na 375 a sleduj text:

:::live react
```jsx
import { useCallback, useSyncExternalStore } from 'react';

function useMediaDotaz(dotaz) {
  const seznam = window.matchMedia(dotaz);

  const prihlas = useCallback(
    (zmena) => {
      const cil = window.matchMedia(dotaz);
      cil.addEventListener('change', zmena);
      return () => cil.removeEventListener('change', zmena);
    },
    [dotaz],
  );

  return useSyncExternalStore(prihlas, () => seznam.matches);
}

export default function Rozvrzeni() {
  const uzke = useMediaDotaz('(max-width: 700px)');

  return (
    <div className="panel">
      <p>Šířka náhledu je <strong>{uzke ? 'úzká' : 'široká'}</strong>.</p>
      <p className="panel__popis">
        {uzke ? 'Menu se vejde jen do šuplíku.' : 'Menu se vejde do hlavičky.'}
      </p>
    </div>
  );
}
```
```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #101828;
}
.panel {
  margin: 1.5rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.14);
}
.panel__popis {
  margin: 0.5rem 0 0;
  color: #475467;
}
```
:::

Oproti dvojici `useState` + `useEffect` má tenhle zápis jednu podstatnou výhodu:
React hodnotu čte **při renderu**, takže na obrazovce nikdy nebliknou stará data.
S efektem by se komponenta nejdřív vykreslila se starou hodnotou a hned poté
znovu s novou.

> [!NOTE]
> `useSyncExternalStore` potkáš hlavně uvnitř knihoven (Zustand, Redux, Jotai)
> — ty ho používají, aby napojily svůj vlastní stav na React. Ve vlastním kódu
> ho sáhneš jen u věcí jako media dotaz, `navigator.onLine` nebo velikost okna.

:::check
Proč se u media dotazu hodí `useSyncExternalStore` víc než `useState` s efektem?

### --answer--

Protože `useState` neumí uložit `true` a `false`.

#### --why--

Typ hodnoty s tím nemá nic společného. Rozdíl je v tom, **kdy** se hodnota poprvé objeví na obrazovce.

### --correct--

Protože React hodnotu čte při renderu, takže se neukáže starý stav a hned po něm nový.

#### --why--

Efekt běží až po commitu: první vykreslení by proběhlo s výchozí hodnotou a druhé se skutečnou. `useSyncExternalStore` si hodnotu vyžádá rovnou při renderu.

### --answer--

Protože se nemusí odhlašovat posluchač.

#### --why--

Odhlásit se musíš tak jako tak — přihlašovací funkce vrací odhlašovací, což je stejná práce jako úklid v efektu.

### --see--

react-hloubka/vlastni-hooky#usemediaquery-cteni-z-vnejsiho-zdroje-bez-efektu
:::

## Typické chyby a pasti

### Hook, který žádný hook nevolá

> [!PITFALL]
> **Funkce s předponou `use`, která uvnitř nevolá žádný hook, hook není.**
> Příznak: `useFormatCena(cislo)` ve složce `hooks/`, kterou nejde zavolat
> v obsluze události, protože ESLint hlásí porušení pravidel hooků. Oprava:
> přejmenovat na `formatujCenu` a používat kdekoli.

### Podmíněné volání schované ve větvi

> [!PITFALL]
> **`Rendered more hooks than during the previous render.`** znamená, že se
> některý hook v tomhle renderu zavolal a v minulém ne. Kromě zjevného `if` ho
> vyrobí i předčasný `return` (`if (!data) return <Nacitam />;` nad zbytkem
> hooků) nebo hook v cyklu přes pole proměnné délky. Oprava: všechny hooky
> nahoru, `return` až pod ně.

### Hook, od kterého se čeká sdílení

> [!PITFALL]
> **Dvě komponenty se stejným hookem mají dva nezávislé stavy.** Příznak:
> košík v hlavičce ukazuje nula položek, i když ho na stránce produktu uživatel
> naplnil. Oprava: stav dát do společného rodiče a poslat dolů, nebo ho vystavit
> kontextem — k tomu se dostaneš hned v další lekci.

### Objekt vracený z hooku jako závislost

> [!PITFALL]
> **Hook, který vrací objektový literál, vyrábí při každém renderu novou
> identitu.** Příznak: `useEffect(…, [nastaveni])` nad hodnotou z hooku se
> spouští pořád dokola. Oprava: rozebrat výsledek na jednotlivé hodnoty
> (`const { klic } = useNastaveni()`) a do závislostí dát ty, nebo objekt uvnitř
> hooku stabilizovat přes `useMemo`.

:::check
Kolegova komponenta má nahoře `if (!uzivatel) return <Prihlaseni />;` a pod tím `const [tab, setTab] = useState('profil');`. Co se stane, až se uživatel přihlásí?

### --answer--

Nic zvláštního, jen se vykreslí profil se záložkou `profil`.

#### --why--

Před přihlášením se `useState` vůbec nezavolal, po přihlášení ano. Zkus spočítat, kolik hooků React v obou renderech napočítal.

### --correct--

React ohlásí, že se v tomhle renderu zavolalo víc hooků než v minulém.

#### --why--

Předčasný `return` je podmíněné volání hooků se vším všudy — jen není vidět na první pohled. Hooky patří nad každý `return`.

### --answer--

Stav `tab` se resetuje na výchozí hodnotu při každém přihlášení.

#### --why--

K resetu stavu by došlo při odmontování komponenty nebo při změně `key`. Tady jde o něco tvrdšího: React tenhle render vůbec nedokončí.

### --see--

react-hloubka/vlastni-hooky#podminene-volani-schovane-ve-vetvi
:::

:::explain
Vysvětli vlastními slovy, proč se dvě komponenty se stejným vlastním hookem o stav nedělí — a co udělat, když se dělit mají.

## --model--

Vlastní hook je funkce, jejíž tělo React při renderu doslova provede uvnitř té komponenty, která ji zavolala. `useState` v hooku tedy zakládá stav té komponenty, ne hooku samotného — hook žádnou vlastní paměť nemá. Dvě komponenty proto dostanou dvě nezávislé kopie: hook sdílí postup, ne data. Když se data sdílet mají, musí bydlet na jednom místě nad oběma komponentami — ve stavu společného rodiče, který se posílá props, nebo v kontextu, ze kterého si je obě přečtou.

## --checklist--

- Tělo hooku se provádí uvnitř komponenty, která ho zavolala.
- `useState` v hooku patří té komponentě, ne hooku.
- Dvě volání téhož hooku dávají dva nezávislé stavy.
- Sdílení dat řeší společný rodič nebo kontext.
:::

## Kde to najdeš v MDN

- [Window: matchMedia()](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) —
  media dotaz z JavaScriptu a událost `change`, na které stojí `useMediaQuery`.
- [Window: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) —
  co všechno umí úložiště, které si `useLocalStorage` bere pod sebe.
- [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) —
  včetně toho, kdy vyhodí `SyntaxError` (typicky nad poškozeným obsahem úložiště).
- [setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) —
  vrácené id a `clearTimeout`, bez kterých by `useDebouncedValue` nefungoval.

> [!NOTE]
> Dokumentace Reactu: [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks),
> [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) a
> [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore).

# --questions--

## --question--

Napiš, kolik nezávislých stavů vznikne, když tuhle stránku React vykreslí.

```jsx
function useRozbaleni() {
  const [otevrene, setOtevrene] = useState(false);
  return { otevrene, prepni: () => setOtevrene((o) => !o) };
}

function Otazka({ text }) {
  const { otevrene, prepni } = useRozbaleni();
  return <li onClick={prepni}>{text} {otevrene ? '▾' : '▸'}</li>;
}

export default function Faq() {
  return <ul>{['Doprava', 'Reklamace', 'Platba'].map((t) => <Otazka key={t} text={t} />)}</ul>;
}
```

### --expected--

tři

### --accept--

3
tři, jeden na každou otázku

### --why--

Hook se volá v každé `Otazka` znovu a pokaždé si založí vlastní stav v té komponentě. Proto jde každá otázka rozbalit zvlášť — přesně to je na vlastních hoocích užitečné.

### --see--

react-hloubka/vlastni-hooky#hook-sdili-logiku-ne-stav

## --question--

Napiš jméno, které by měla dostat funkce `useSpocitejDph(cena)`, jestliže uvnitř žádný hook nevolá a jen počítá `cena * 1.21`.

### --expected--

spocitejDph

### --accept--

spoctiDph
vypocitejDph
dph
funkce bez předpony use

### --why--

Předpona `use` je smlouva: říká čtenáři i ESLintu, že funkce volá hooky, a tím pádem se smí volat jen z komponent a hooků. Čistý výpočet touhle smlouvou nesmí být svázaný — jinak ho nepoužiješ v obsluze události ani mimo React.

### --see--

react-hloubka/vlastni-hooky#hook-ktery-zadny-hook-nevola

## --question--

Vlastní hook `useSirkaOkna` vrací `{ sirka, vyska }`. V komponentě je `useEffect(() => prekresli(), [rozmery])`, kde `rozmery` je návratová hodnota hooku. Co bude efekt dělat?

### --correct--

Spustí se při každém renderu, protože hook vrací pokaždé nový objekt.

#### --why--

Objektový literál má v každém renderu novou identitu a `Object.is` dvě různé reference neshodne. Pomůže dát do závislostí `rozmery.sirka` a `rozmery.vyska`.

### --answer--

Spustí se jen při skutečné změně rozměrů okna.

#### --why--

To by platilo, kdyby se porovnával obsah. Závislosti se ale porovnávají podle identity — a tu má nový objekt pokaždé jinou.

### --answer--

Nespustí se nikdy, protože objekt není primitivní hodnota.

#### --why--

Objekty v závislostech jsou úplně legální, jen se porovnávají podle identity. Efekt se spustí aspoň jednou vždycky.

### --see--

react-hloubka/vlastni-hooky#objekt-vraceny-z-hooku-jako-zavislost

## --question--

Doplň, čím se musí v `useMediaDotaz` vrátit z přihlašovací funkce, aby se posluchač uklidil. Napiš jen ten jeden výraz.

### --expected--

odhlašovací funkce

### --accept--

funkce, která posluchače odhlásí
funkcí, která zavolá removeEventListener
() => cil.removeEventListener('change', zmena)

### --why--

`useSyncExternalStore` pracuje stejně jako efekt: funkce, kterou mu předáš, se přihlásí k odběru a vrátí funkci, kterou React zavolá při odhlášení. Bez ní posluchač na media dotazu zůstane i po odmontování komponenty.

### --see--

react-hloubka/vlastni-hooky#usemediaquery-cteni-z-vnejsiho-zdroje-bez-efektu
