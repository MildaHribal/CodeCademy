# Chyby, Suspense a portály

Tři věci, které odlišují hračku od aplikace, kterou používají lidé: **nespadne
celá, když se rozbije jedna komponenta**, **řekne, že se něco načítá**, a **umí
vykreslit obsah mimo místo, kde je v kódu napsaný**. React na to má tři nástroje
a všechny tři mají jedno společné — komponenta si o pomoc říká svému okolí,
ne naopak.

:::check pretest
V komponentě `Graf` vyletí při vykreslování výjimka a nikdo ji nezachytí.
Co uvidí uživatel v React 19?

### --answer--

Chybovou hlášku místo grafu, zbytek stránky funguje dál.

#### --why--

To by bylo milé, ale React sám žádnou náhradní podobu komponenty nevykreslí. Zamysli se, co se stane se stromem, do kterého komponenta patří.

### --correct--

Prázdnou bílou stránku — React odmontuje celý strom.

#### --why--

Přesně tak, a proč to React dělá schválně, si řekneme v první části.

### --answer--

Poslední vykreslený stav, jako by se nic nestalo.

#### --why--

React nemá jak se vrátit k předchozímu stavu: strom, který se nepodařilo vykreslit, není v konzistentním stavu, a proto ho React radši zahodí celý.
:::

:::check pretest
Modal je přes `createPortal` vykreslený v `<body>`, ale v JSX je napsaný uvnitř
komponenty `Karta`, která má `onClick`. Uživatel klikne na tlačítko v modalu.
Spustí se `onClick` karty? Odpověz `ano`, nebo `ne`.

### --expected-- ignore-case

ano

### --why--

Události v Reactu probublávají podle **stromu komponent**, ne podle stromu DOM. Modal je v JSX potomkem karty, takže klik doletí až k ní — i když je v DOMu úplně jinde.
:::

> [!REMEMBER]
> **Error boundary, Suspense a portál se v JSX píšou jako obal kolem toho, co mají
> obsloužit.** Komponenta uvnitř o nich neví nic; jen buď spadne, nebo si řekne
> o čekání, nebo se vykreslí jinam. Zodpovědnost je v obalu, ne v ní.

## Error boundary: záchrana nad komponentou

React se při chybě v renderu chová tvrdě: odmontuje celý strom, protože polovina
vykreslené stránky je horší než žádná (formulář, který by odeslal nesmysl, graf
se starými čísly). Aby se pád zastavil dřív, obalíš rizikovou část komponentou,
která chybu zachytí. Říká se jí **error boundary** a jako jediná se dodneška píše
jako třída — v tom zápisu totiž existují metody, které React při chybě volá.

Klikni na **Rozbít graf** a pak na **Zkusit znovu**:

:::live react
```jsx
import { Component, useState } from 'react';

class Zachrana extends Component {
  state = { chyba: null };

  static getDerivedStateFromError(chyba) {
    return { chyba };
  }

  render() {
    if (this.state.chyba) {
      return (
        <div className="panel panel--chyba">
          <p>Graf se nepodařilo vykreslit: {this.state.chyba.message}</p>
          <button
            onClick={() => {
              this.setState({ chyba: null });
              this.props.onObnovit();
            }}
          >
            Zkusit znovu
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Graf({ rozbity }) {
  if (rozbity) throw new Error('data grafu nejsou pole');
  return <p className="panel">Tržby za září: 128 400 Kč</p>;
}

export default function App() {
  const [rozbity, setRozbity] = useState(false);

  return (
    <div className="stranka">
      <h2>Přehled</h2>
      <Zachrana onObnovit={() => setRozbity(false)}>
        <Graf rozbity={rozbity} />
      </Zachrana>
      <p className="zbytek">Tenhle odstavec zůstane na stránce i po pádu grafu.</p>
      <button onClick={() => setRozbity(true)}>Rozbít graf</button>
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
.stranka {
  margin: 1.5rem;
  max-width: 24rem;
}
h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}
.panel {
  margin: 0 0 0.75rem;
  padding: 1rem;
  border-radius: 0.6rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.14);
}
.panel--chyba {
  border-left: 4px solid #d92d20;
  background: #fef3f2;
}
.zbytek {
  margin: 0 0 1rem;
  color: #475467;
}
button {
  padding: 0.45rem 0.85rem;
  border: 0;
  border-radius: 0.5rem;
  background: #1d4ed8;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
```
:::

Odstavec pod grafem zůstal na místě — pád se zastavil na hranici, kterou jsi
nakreslil. Zkus `Zachrana` z JSX odstranit a klikni znovu: zmizí celá stránka.

> [!PITFALL]
> **Error boundary chytá jen chyby z renderu, z efektů a z konstruktorů
> komponent pod sebou.** Nezachytí výjimku z obsluhy události, z `setTimeout`
> ani odmítnutou promise. Příznak: „mám boundary a přesto mi to padá do konzole".
> Oprava: v handlerech a v asynchronním kódu ošetři chybu sám (`try`/`catch`,
> `.catch`) a výsledek dej do stavu.

:::check
Proč React při nezachycené chybě raději odmontuje celý strom, místo aby nechal aspoň to, co se vykreslit povedlo?

### --answer--

Protože by jinak zůstaly v paměti nedokončené efekty.

#### --why--

Efekty React uklidí tak jako tak. Problém je v tom, co by uživatel na obrazovce viděl a co by s tím mohl udělat.

### --correct--

Protože polovina vykreslené stránky může ukazovat neplatná data a svádět k akci, která napáchá škodu.

#### --why--

Rozbité UI je horší než žádné: uživatel by mohl odeslat formulář s nedopočítanou cenou nebo si přečíst čísla, která neplatí. Proto React nechá rozhodnutí na tobě — a ty ho uděláš tím, kam dáš boundary.

### --answer--

Protože React neumí zjistit, která komponenta chybu způsobila.

#### --why--

React to ví přesně — komponentu i celý strom ti vypíše do konzole. Rozhodnutí odmontovat je záměr, ne bezradnost.

### --see--

react-hloubka/chyby-suspense-portaly#error-boundary-zachrana-nad-komponentou
:::

## Suspense: kdo ukáže „Načítám…"

Druhý obal řeší opačný problém: komponenta ještě nemá data. Místo aby si každá
sama držela stav `nacitam` a vracela spinner, může **pozastavit vykreslování** —
a nejbližší `<Suspense>` nad ní zatím ukáže svoji náhradu z prop `fallback`.

Komponenta se pozastaví hookem `use(promise)`, který jako jediný hook smí být
uvnitř podmínky a v cyklu:

:::live react
```jsx
import { Suspense, use } from 'react';

const pocasiPromise = new Promise((resolve) => {
  setTimeout(() => resolve({ misto: 'Brno', teplota: 18, popis: 'polojasno' }), 900);
});

function Pocasi() {
  const pocasi = use(pocasiPromise);

  return (
    <p className="karta">
      <strong>{pocasi.misto}</strong>: {pocasi.teplota} °C, {pocasi.popis}
    </p>
  );
}

export default function App() {
  return (
    <div className="stranka">
      <h2>Počasí na zítra</h2>
      <Suspense fallback={<p className="karta karta--nacitam">Načítám počasí…</p>}>
        <Pocasi />
      </Suspense>
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
.stranka {
  margin: 1.5rem;
  max-width: 22rem;
}
h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}
.karta {
  margin: 0;
  padding: 1rem;
  border-radius: 0.6rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.14);
}
.karta--nacitam {
  color: #667085;
  font-style: italic;
}
```
:::

Zkus prodloužit čekání na 3000 ms a sleduj, jak dlouho vydrží kurzívou psaná
náhrada. Všimni si, že promise vzniká **mimo** komponentu: kdyby se vyráběla
v renderu, vznikla by při každém pokusu nová a `Suspense` by se točil donekonečna.

`Suspense` je i způsob, jak rozdělit kód aplikace na části, které se stáhnou až
při potřebě. `const Nastaveni = lazy(() => import('./Nastaveni'))` vrátí
komponentu, která se stáhne, teprve až ji někdo vykreslí — a do té doby platí
`fallback` nejbližšího `Suspense`.

> [!NOTE]
> Ve skutečné aplikaci `use(promise)` nad ručně vyrobenou promise skoro nepotkáš.
> Data se načítají přes knihovnu (TanStack Query) nebo přes framework (Next.js),
> které promise vyrábějí a cachují za tebe. K obojímu se dostaneš v sekcích
> `react-aplikace` a `next-fullstack`; `Suspense` kolem toho zůstává stejný.

:::check
Proč se promise pro `use()` nesmí vyrobit v těle komponenty?

### --answer--

Protože `use` smí dostat jen promise vytvořenou v efektu.

#### --why--

Efekt běží až po commitu, takže by komponenta v renderu neměla co předat. Odpověď souvisí s tím, co se stane po pozastavení.

### --correct--

Protože se komponenta po pozastavení vykreslí znovu — a pokaždé by vznikla nová promise, na kterou se zase čeká.

#### --why--

Pozastavení znamená, že React render zahodí a po vyřešení promise ho zopakuje. Nová promise v každém pokusu z toho dělá nekonečnou smyčku, ve které uživatel vidí jen `fallback`.

### --answer--

Protože promise vyrobená v renderu není čistá funkce.

#### --why--

Vytvoření promise samo o sobě čistotu renderu neporušuje (nic mimo komponentu to nemění). Problém je až v tom, co s ní React udělá při opakovaném renderu.

### --see--

react-hloubka/chyby-suspense-portaly#suspense-kdo-ukaze-nacitam
:::

## Přechody: `useTransition` a `useDeferredValue`

Třetí situace: data jsou, ale vykreslení je drahé. Uživatel píše do filtru,
každý znak překreslí dva tisíce řádků a psaní se seká. React umí takovou práci
označit za **nespěchající** a pustit před ni psaní.

`useDeferredValue(hodnota)` vrátí hodnotu, která se „opozdí": při rychlých
změnách zůstane u té staré a dožene to, až bude chvilka. Napiš do pole pár
písmen rychle po sobě:

:::live react
```jsx
import { useDeferredValue, useState } from 'react';

const VSE = Array.from({ length: 2000 }, (_, i) => `Objednávka ${1000 + i}`);

function Seznam({ dotaz }) {
  const nalezene = VSE.filter((polozka) => polozka.includes(dotaz));

  return (
    <ul className="seznam">
      {nalezene.slice(0, 50).map((polozka) => (
        <li key={polozka}>{polozka}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [dotaz, setDotaz] = useState('');
  const odlozeny = useDeferredValue(dotaz);
  const zastarale = dotaz !== odlozeny;

  return (
    <div className="stranka">
      <input value={dotaz} onChange={(e) => setDotaz(e.target.value)} placeholder="Číslo objednávky" />
      <div style={{ opacity: zastarale ? 0.5 : 1 }}>
        <Seznam dotaz={odlozeny} />
      </div>
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
.stranka {
  margin: 1.5rem;
  max-width: 20rem;
}
input {
  padding: 0.5rem 0.65rem;
  width: 100%;
  border: 1px solid #cfd4dc;
  border-radius: 0.5rem;
  font: inherit;
}
.seznam {
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
  max-height: 12rem;
  overflow: auto;
  color: #475467;
}
```
:::

Vstup reaguje okamžitě, seznam se dohání. Zkus `odlozeny` v `<Seznam>` vyměnit
za `dotaz` a psát rychle — rozdíl ucítíš v prstech. Dvojče `useTransition` dělá
totéž pro **akce**: `startTransition(() => setZalozka('reporty'))` řekne Reactu,
že překreslení po přepnutí záložky smí počkat, a `isPending` mezitím umožní
ztlumit starý obsah.

> [!TIP]
> Obojí je poslední krok, ne první. Nejdřív zkus vykreslovat míň (stránkování,
> virtualizace, `slice`), pak memoizovat drahý výpočet a teprve pak odkládat
> vykreslení. Odložené vykreslení pomalý kód nezrychlí — jen ho přestane
> pouštět uživateli pod rukama.

:::check
Co udělá `useDeferredValue` s hodnotou, když uživatel píše rychle za sebou?

### --expected--

vrací starou hodnotu, dokud není chvilka na překreslení

### --accept--

drží předchozí hodnotu a novou dožene později
opozdí se za novou hodnotou
vrací předchozí hodnotu

### --why--

React nechá přednost naléhavé aktualizaci (psaní ve vstupu) a překreslení nad odloženou hodnotou odsune. Porovnáním `hodnota !== odlozena` navíc poznáš, že to, co je na obrazovce, je momentálně zastaralé — a můžeš to uživateli naznačit.

### --see--

react-hloubka/chyby-suspense-portaly#prechody-usetransition-a-usedeferredvalue
:::

## Portál: v DOMu jinde, ve stromu Reactu doma

Portál už jsi použil na modal: `createPortal(jsx, cíl)` vykreslí obsah do jiného
místa v DOMu. Co je na něm zrádné a co je naopak úleva, je jeho druhá polovina —
**ve stromu Reactu zůstává prvek tam, kde je napsaný.** Kontext, props i události
tedy fungují, jako by k žádnému přesunu nedošlo.

:::live react predict
```jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function App() {
  const [log, setLog] = useState([]);
  const zapis = (kdo) => setLog((stary) => [...stary, kdo]);

  return (
    <div className="karta" onClick={() => zapis('karta')}>
      <p>Klikni na tlačítko v bublině.</p>
      {createPortal(
        <button className="bublina" onClick={() => zapis('tlačítko')}>
          Tlačítko v portálu
        </button>,
        document.body,
      )}
      <p className="log">Zaznamenáno: {log.join(', ') || '—'}</p>
    </div>
  );
}
```
--question-- Co se objeví v záznamu po jednom kliknutí na tlačítko v portálu?
--option-- Jen `tlačítko` — tlačítko je v DOMu mimo kartu.
--option*-- `tlačítko, karta`
--option-- Jen `karta`, protože portál si vlastní obsluhu nedrží.
--why-- Události v Reactu probublávají podle stromu komponent, ne podle stromu DOM. Tlačítko je v JSX potomkem karty, takže po jeho vlastní obsluze přijde na řadu obsluha karty. Je to nejčastější překvapení u portálů: modal vykreslený v `<body>` může spustit `onClick` komponenty, uvnitř které je napsaný — a naopak `event.stopPropagation()` v modalu zastaví i to, co je od něj v DOMu na míle daleko.
:::

Je to výhoda i past zároveň. Výhoda: modal vykreslený v `<body>` si čte kontext
(téma, přihlášeného uživatele) úplně normálně. Past: „zavřít po kliknutí mimo"
napsané na rodiči zavře okno i po kliknutí uvnitř něj.

:::check
Modal v portálu si přes `useContext` čte téma z poskytovatele, který je v `App`. Bude téma znát?

### --answer--

Ne, protože je v DOMu mimo poskytovatele.

#### --why--

Kontext se nehledá podle DOMu, ale podle stromu komponent. Zkus si položit otázku, kde je modal napsaný v JSX.

### --correct--

Ano, protože ve stromu komponent je pořád pod poskytovatelem.

#### --why--

Portál mění jen to, kam React výsledek zapíše. Kontext, props i události jdou dál podle JSX — proto se modal v portálu chová jako každá jiná komponenta.

### --answer--

Jen když se poskytovatel vykreslí taky do portálu.

#### --why--

Poskytovatel nemusí být v portálu vůbec; důležité je, že je v JSX nad modalem.

### --see--

react-hloubka/chyby-suspense-portaly#portal-v-domu-jinde-ve-stromu-reactu-doma
:::

## Typické chyby a pasti

### Error boundary, která chytá všechno

> [!PITFALL]
> **Jedna boundary kolem celé aplikace je skoro stejně málo jako žádná.**
> Příznak: po chybě v jednom grafu vidí uživatel celostránkové „Něco se
> pokazilo" a přijde o rozepsaný formulář. Oprava: hranice kreslit tam, kde má
> smysl ztratit jen kousek — kolem jednotlivých widgetů, kolem obsahu stránky
> uvnitř layoutu, kolem každé záložky.

### Suspense, který se točí donekonečna

> [!PITFALL]
> **Promise vyrobená v renderu se po každém pozastavení vytvoří znovu.** Příznak:
> `fallback` zůstane navždy a v síti přibývají dotazy. Oprava: promise vyrábět
> mimo render (modul, cache, knihovna) a do komponenty ji předat.

### `setState` v obsluze chyby

> [!PITFALL]
> **Chyba z obsluhy události error boundary nezachytí.** `onClick={() => JSON.parse(text)}`
> nad poškozeným textem skončí v konzoli a uživatel nevidí nic. Příznak: tlačítko
> „nic nedělá". Oprava: `try`/`catch` v handleru a chybu uložit do stavu, ze
> kterého ji vykreslíš.

### `stopPropagation` uvnitř portálu

> [!PITFALL]
> **`event.stopPropagation()` v modalu zastaví bublání v celém stromu Reactu.**
> Příznak: klik uvnitř modalu přestane zavírat nabídku otevřenou úplně jinde na
> stránce, nebo naopak rodičovský `onClick` reaguje na kliknutí v modalu.
> Oprava: rozhodovat podle `event.target === event.currentTarget` místo plošného
> zastavení bublání.

:::check
Komponenta `Detail` volá `fetch` v obsluze kliknutí a při výpadku sítě se nic nestane — ani chyba, ani hláška. Nad `Detail` je error boundary. Proč nezabrala?

### --answer--

Protože boundary musí být přímým rodičem komponenty, která chybu vyhodí.

#### --why--

Boundary chytá chyby z celého podstromu pod sebou, ne jen od přímého potomka. Důvod je jinde — zamysli se, odkud ta chyba přichází.

### --correct--

Protože chyba vznikla v obsluze události a v asynchronním kódu, a tam boundary nesahá.

#### --why--

Error boundary chytá jen chyby z renderu, z efektů a z konstruktorů komponent. Odmítnutou promise z handleru musíš ošetřit sám a stav chyby vykreslit.

### --answer--

Protože `fetch` odmítnutí nevyhazuje, jen vrátí odpověď se stavovým kódem.

#### --why--

Při výpadku sítě `fetch` opravdu odmítne (a chybný stavový kód naopak odmítnutí nezpůsobí). Tady jde ale o to, kdo tu chybu má zachytit.

### --see--

react-hloubka/chyby-suspense-portaly#error-boundary-ktera-chyta-vsechno
:::

:::explain
Vysvětli vlastními slovy, co mají error boundary, `Suspense` a portál společného — a čím se liší.

## --model--

Všechny tři jsou obaly: v JSX je napíšu kolem části stromu a ta uvnitř o nich neví nic. Error boundary říká, co se ukáže, když něco pod ní při vykreslování spadne. `Suspense` říká, co se ukáže, dokud něco pod ní čeká na data. Portál neříká nic o stavu, jen přesune výsledek do jiného místa v DOMu — ve stromu Reactu obsah zůstává na svém místě, takže kontext i události fungují dál. Liší se tím, na co reagují: boundary na výjimku, `Suspense` na pozastavení, portál na nic — ten je čistě o tom, kam se výsledek zapíše.

## --checklist--

- Všechny tři se píšou jako obal kolem části stromu.
- Error boundary zachytí chybu z renderu a efektů pod sebou.
- `Suspense` ukáže náhradu, dokud se komponenta pod ní pozastavuje.
- Portál mění jen místo v DOMu, strom Reactu zůstává stejný.
:::

## Kde to najdeš v MDN

- [try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) —
  jediná cesta, jak ošetřit chybu z obsluhy události, kam error boundary nedosáhne.
- [Promise.prototype.catch()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) —
  odmítnutá promise, kterou si React sám nevšimne.
- [Event: stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation) —
  co přesně zastaví a proč je v portálu zrádnější, než vypadá.
- [Dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#dynamic_module_loading) —
  `import()` jako výraz, na kterém stojí `lazy`.

> [!NOTE]
> Dokumentace Reactu: [Component: getDerivedStateFromError](https://react.dev/reference/react/Component#static-getderivedstatefromerror),
> [Suspense](https://react.dev/reference/react/Suspense), [use](https://react.dev/reference/react/use)
> a [createPortal](https://react.dev/reference/react-dom/createPortal).
> Na obzoru je `<Activity>` — obal, který umí podstrom schovat a zachovat mu stav
> místo odmontování; až se ustálí, nahradí leckterý `display: none` hack.

# --questions--

## --question--

Napiš, kolik z těchhle čtyř chyb zachytí error boundary: výjimka v renderu potomka, výjimka v jeho efektu, odmítnutá promise z `fetch` v obsluze kliknutí, výjimka v `setTimeout`.

### --expected--

dvě

### --accept--

2
dvě — render a efekt

### --why--

Error boundary chytá chyby z renderu, z efektů a z konstruktorů komponent pod sebou. Obsluha události ani `setTimeout` mezi ně nepatří — tam se chyba musí ošetřit ručně a výsledek uložit do stavu.

### --see--

react-hloubka/chyby-suspense-portaly#error-boundary-zachrana-nad-komponentou

## --question--

Napiš, co uvidí uživatel na obrazovce ve chvíli, kdy se komponenta uvnitř `<Suspense fallback={<Kostra />}>` pozastaví.

### --expected--

kostru

### --accept--

komponentu Kostra
obsah fallbacku
Kostra

### --why--

Pozastavená komponenta se nevykreslí vůbec; React místo ní ukáže `fallback` nejbližšího `Suspense` nad ní. Jakmile se čekání vyřeší, vymění ho za skutečný obsah.

### --see--

react-hloubka/chyby-suspense-portaly#suspense-kdo-ukaze-nacitam

## --question--

V administraci je tabulka s pěti sty řádky a nad ní vyhledávací pole. Psaní se sekne po každém znaku. Co uděláš?

### --correct--

Filtrování nechám nad odloženou hodnotou z `useDeferredValue` a zastaralý obsah ztlumím.

#### --why--

Vstup tak reaguje okamžitě a překreslení tabulky počká na chvilku klidu. Uživatel navíc podle ztlumení pozná, že výsledky ještě nedoběhly.

### --answer--

Obalím tabulku do `<Suspense>` s fallbackem `Načítám…`.

#### --why--

`Suspense` reaguje na čekání na data, ne na drahé vykreslení. Tabulka data má — jen jich je moc.

### --answer--

Obalím tabulku do error boundary, aby seknutí nespadlo na celou stránku.

#### --why--

Seknutí není chyba: nic se nevyhodí a boundary se nemá čeho chytit.

### --answer--

Přesunu filtrování do `useEffect`, aby neblokovalo render.

#### --why--

Efekt běží po commitu, takže by tabulka nejdřív blikla s původními daty a hned se překreslila — dva rendery místo jednoho a stejné sekání.

### --see--

react-hloubka/chyby-suspense-portaly#prechody-usetransition-a-usedeferredvalue

## --question--

Napiš jedním slovem, podle čeho se řídí probublávání událostí z prvku vykresleného portálem.

### --expected-- ignore-case

strom komponent

### --accept--

strom Reactu
podle JSX
komponentový strom
strom komponent, ne DOM

### --why--

React události zpracovává nad svým stromem, takže klik z portálu doletí ke komponentě, uvnitř které je portál napsaný — bez ohledu na to, kde prvek skutečně v DOMu leží.

### --see--

react-hloubka/chyby-suspense-portaly#portal-v-domu-jinde-ve-stromu-reactu-doma
