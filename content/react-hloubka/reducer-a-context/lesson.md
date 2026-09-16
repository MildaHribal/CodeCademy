# Reducer a kontext

Filtr v e-shopu má kategorii, rozsah ceny, „jen skladem", řazení a číslo stránky.
Pět `useState` — a ke každé změně patří pravidlo: změna kategorie vynuluje
stránku, zapnutí „jen skladem" taky, zrušení filtrů vrátí všechno kromě řazení.
Za týden je v komponentě pět míst, kde se nuluje stránka, a v jednom z nich se na
to zapomnělo. Tahle lekce je o dvou nástrojích, které to řeší: **reduceru** pro
stav, který se mění po pravidlech, a **kontextu** pro stav, který potřebuje půlka
stromu.

:::check pretest
Reducer je funkce, která dostane současný stav a akci. Co myslíš, že musí vrátit?

### --answer--

Nic — stav si upraví na místě.

#### --why--

Kdyby stav měnil na místě, React by neměl jak poznat, že se něco změnilo. Vzpomeň si, podle čeho React porovnává hodnoty.

### --correct--

Nový objekt stavu.

#### --why--

Přesně tak — a proč to musí být nový objekt, a ne upravený starý, si za chvíli ukážeme.

### --answer--

Seznam změn, které se mají provést.

#### --why--

Takhle funguje leckterá jiná knihovna, ale ne `useReducer`. Ten čeká rovnou výsledek.
:::

:::check pretest
Komponenta `Hlavicka` je zanořená pět úrovní pod `App` a potřebuje přihlášeného
uživatele, kterého má `App` ve stavu. Jak se k němu dostane bez kontextu?
Odpověz jednou větou.

### --expected--

props se protáhnou přes všechny komponenty mezi nimi

### --accept--

protažením props přes všechny mezilehlé komponenty
každá komponenta po cestě si prop předá dál
prop drilling

### --why--

Říká se tomu protahování props (*prop drilling*): komponenty mezi `App` a `Hlavickou` musí prop přijmout a poslat dál, i když ji samy nepoužijí. Kontext je zkratka přes tenhle řetěz.
:::

Obě věci se často pletou dohromady, přitom řeší jiný problém. **Reducer říká,
jak se stav mění; kontext říká, kdo k němu má přístup.** Dají se používat každý
zvlášť a dohromady tvoří sadu, se kterou zvládneš překvapivě velkou aplikaci bez
jediné knihovny navíc.

> [!REMEMBER]
> **Reducer je čistá funkce `(stav, akce) => nový stav`.** Komponenta nerozhoduje,
> co se se stavem stane — jen pošle akci („uživatel změnil kategorii") a pravidla
> jsou na jednom místě.

## Když `useState` přestane stačit

Poznáš to podle tří příznaků: několik stavů se mění vždycky společně, tatáž
změna se opakuje na víc místech, a v obsluhách je víc logiky než v reduceru by
byla. Filtr níž má tři hodnoty a jedno pravidlo: **cokoli se změní, stránka jde
na jedničku.**

Klikni na kategorii, pak na další stránku a pak zase na kategorii:

:::live react
```jsx
import { useReducer } from 'react';

const VYCHOZI = { kategorie: 'vše', jenSkladem: false, stranka: 1 };

function filtrReducer(stav, akce) {
  switch (akce.typ) {
    case 'kategorie':
      return { ...stav, kategorie: akce.hodnota, stranka: 1 };
    case 'skladem':
      return { ...stav, jenSkladem: !stav.jenSkladem, stranka: 1 };
    case 'stranka':
      return { ...stav, stranka: akce.hodnota };
    case 'reset':
      return VYCHOZI;
    default:
      throw new Error('Neznámá akce: ' + akce.typ);
  }
}

export default function Filtr() {
  const [stav, poslat] = useReducer(filtrReducer, VYCHOZI);

  return (
    <div className="filtr">
      <div className="filtr__radek">
        {['vše', 'kytary', 'bicí', 'klávesy'].map((k) => (
          <button
            key={k}
            aria-pressed={stav.kategorie === k}
            onClick={() => poslat({ typ: 'kategorie', hodnota: k })}
          >
            {k}
          </button>
        ))}
      </div>
      <label>
        <input type="checkbox" checked={stav.jenSkladem} onChange={() => poslat({ typ: 'skladem' })} />
        Jen skladem
      </label>
      <div className="filtr__radek">
        <button onClick={() => poslat({ typ: 'stranka', hodnota: stav.stranka + 1 })}>
          Další stránka
        </button>
        <button onClick={() => poslat({ typ: 'reset' })}>Zrušit filtry</button>
      </div>
      <pre className="filtr__stav">{JSON.stringify(stav, null, 2)}</pre>
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
.filtr {
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem;
  padding: 1.25rem;
  max-width: 24rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.14);
}
.filtr__radek {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
button {
  padding: 0.4rem 0.75rem;
  border: 1px solid #cfd4dc;
  border-radius: 999px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
button[aria-pressed='true'] {
  border-color: #1d4ed8;
  background: #eff4ff;
  color: #1d4ed8;
}
button:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}
.filtr__stav {
  margin: 0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #101828;
  color: #d0d5dd;
  font-size: 0.85rem;
}
```
:::

Pravidlo „stránka na jedničku" je v reduceru napsané dvakrát a **nikde jinde**.
Kdyby přibyl čtvrtý filtr, přidáš jednu větev `case`, ne další obsluhu. Zkus
přidat akci `predchozi-stranka`, která stránku sníží, ale nikdy pod jedničku.

:::check
V čem se liší volání `poslat({ typ: 'skladem' })` od `setJenSkladem(!jenSkladem)`?

### --answer--

V ničem, je to jen delší zápis téhož.

#### --why--

Výsledek je stejný, ale rozhodnutí padá jinde. Podívej se, kdo ví, že se má vynulovat stránka.

### --correct--

Komponenta jen oznámí, co se stalo; **jak** se stav změní, rozhoduje reducer.

#### --why--

Proto se akce pojmenovávají podle událostí („uživatel přepnul skladem"), ne podle zápisů do stavu. Pravidla zůstanou na jednom místě i s přibývajícími obrazovkami.

### --answer--

`poslat` změní stav okamžitě, kdežto `setJenSkladem` až po renderu.

#### --why--

Obě funkce si o aktualizaci jen řeknou a nový stav uvidíš až v dalším renderu. V tomhle se nechovají nijak jinak.

### --see--

react-hloubka/reducer-a-context#kdyz-usestate-prestane-stacit
:::

## `useReducer`: akce jako jméno události

Zápis má tři části: **reducer** (funkce mimo komponentu), **počáteční stav** a
dvojice, kterou hook vrátí — aktuální stav a funkci na posílání akcí. Akce je
obyčejný objekt; zvykem je klíč `typ` (v anglických kódech `type`) a k němu
podle potřeby data.

:::memory
```jsx
const [stav, poslat] = useReducer(filtrReducer, VYCHOZI);
poslat({ typ: 'stranka', hodnota: 3 });
poslat({ typ: 'kategorie', hodnota: 'bicí' });
```
--step-- 1 | po prvním renderu ukazuje stav na počáteční objekt
stav -> @a
@a: { kategorie: 'vše', jenSkladem: false, stranka: 1 }
--step-- 2 | akce „stranka": reducer vrátil NOVÝ objekt, starý zůstal beze změny
stav -> @b
@a: { kategorie: 'vše', jenSkladem: false, stranka: 1 }
@b: { kategorie: 'vše', jenSkladem: false, stranka: 3 }
--step-- 3 | akce „kategorie": zase nový objekt, a stránka je podle pravidla zpátky na 1
stav -> @c
@b: { kategorie: 'vše', jenSkladem: false, stranka: 3 }
@c: { kategorie: 'bicí', jenSkladem: false, stranka: 1 }
:::

Každá akce vyrobí **nový** objekt. React porovnává stav přes `Object.is`, takže
kdyby reducer vrátil ten samý objekt s upravenými klíči, React by změnu neviděl
a nic by se nepřekreslilo.

> [!TIP]
> Akce pojmenovávej podle toho, **co se stalo**, ne co se má nastavit:
> `{ typ: 'kosik/polozka-pridana' }` místo `{ typ: 'nastav-kosik' }`. Když akci
> pojmenuješ podle události, reducer může na jednu akci změnit klidně tři klíče
> a v logu z DevTools si přečteš příběh aplikace.

:::check
Reducer u akce `zvys` napíše `stav.pocet = stav.pocet + 1; return stav;`. Co uvidí uživatel?

### --answer--

Číslo se zvýší, jen o render později.

#### --why--

Žádný pozdější render nepřijde. Zamysli se, jak React pozná, že se stav změnil.

### --correct--

Nic — číslo zůstane, jako by se nekliklo.

#### --why--

Reducer vrátil tentýž objekt, takže `Object.is(novy, stary)` je `true` a React render vůbec nenaplánuje. Hodnota v paměti se přitom změnila, což je ta nejhorší kombinace: data a obrazovka se rozejdou.

### --answer--

React vyhodí chybu o mutaci stavu.

#### --why--

React mutaci nehlídá a nic nehlásí. Ve `StrictMode` se nanejvýš projeví tím, že se dvojím voláním reduceru přičte dvakrát.

### --see--

react-hloubka/reducer-a-context#usereducer-akce-jako-jmeno-udalosti
:::

## Reducer musí být čistý

Reducer je obyčejná funkce, kterou React smí zavolat, kdy uzná za vhodné — ve
`StrictMode` ji ve vývoji volá dvakrát, aby ti ukázal, že v ní nemáš vedlejší
efekty. Proto v něm nesmí být `fetch`, `Math.random()`, `Date.now()`, zápis do
`localStorage` ani `console.log` s počítadlem.

:::live react predict
```jsx
import { StrictMode, useReducer } from 'react';

function reducer(stav, akce) {
  if (akce.typ === 'pridej') {
    return { polozky: [...stav.polozky, { id: Math.random() }] };
  }
  return stav;
}

function Seznam() {
  const [stav, poslat] = useReducer(reducer, { polozky: [] });
  return (
    <div>
      <button onClick={() => poslat({ typ: 'pridej' })}>Přidat</button>
      <p>Položek: {stav.polozky.length}</p>
    </div>
  );
}

export default function App() {
  return (
    <StrictMode>
      <Seznam />
    </StrictMode>
  );
}
```
--question-- Co se ve vývoji stane po **jednom** kliknutí na **Přidat**?
--option-- Přibude jedna položka, `Math.random()` na tom nic nemění.
--option*-- Přibude jedna položka, ale `id` se přitom vyrobí dvakrát.
--option-- Přibudou dvě položky.
--why-- Ve `StrictMode` React reducer ve vývoji zavolá dvakrát nad tímtéž starým stavem. Počet položek je proto správně (jedna), ale `Math.random()` se provedlo dvakrát a do stavu se dostalo jen jedno z obou čísel — které, na to se spolehnout nedá. U náhodného `id` si toho nevšimneš; u zápisu do úložiště nebo u `fetch` v reduceru už jde o skutečnou chybu, která se provede dvakrát. Náhodná čísla, čas a id patří do akce, kterou pošle komponenta.
:::

Pravidlo je tedy: **co je nepředvídatelné, spočítej v obsluze a pošli to
v akci.** `poslat({ typ: 'pridej', id: crypto.randomUUID(), kdy: Date.now() })`
je čisté, protože reducer už jen skládá hodnoty, které dostal.

:::check
Kam patří `fetch('/api/objednavky')`, když se má poslat objednávka a pak uložit její číslo do stavu spravovaného reducerem?

### --answer--

Do reduceru, do větve `case 'odesli'`.

#### --why--

Reducer musí být čistý a synchronní — jeho jediný úkol je z (stav, akce) spočítat nový stav. Síť do něj nepatří.

### --correct--

Do obsluhy události; po odpovědi se pošle akce s číslem objednávky.

#### --why--

Vedlejší efekty dělá komponenta (nebo efekt), reducer jen zaznamená výsledek. Typicky se pošlou dvě akce: „odesílám" před dotazem a „odesláno" s daty po něm.

### --answer--

Do `useEffect` se závislostí na celém stavu.

#### --why--

Efekt nad celým stavem by se spustil po každé změně čehokoli. Odeslání objednávky je navíc následek akce uživatele, ne stavu obrazovky.

### --see--

react-hloubka/reducer-a-context#reducer-musi-byt-cisty
:::

## Kontext: hodnota pro celý podstrom

Kontext má dvě strany. `createContext(vychozi)` vyrobí objekt kontextu; ten se
pak v JSX použije jako komponenta s prop `value` a všechno pod ním si hodnotu
přečte hookem `useContext`. V React 19 se provider píše rovnou jako
`<MujKontext value={…}>` — starší zápis `<MujKontext.Provider value={…}>`
funguje dál, ale je zbytečně upovídaný.

:::live react
```jsx
import { createContext, useContext, useState } from 'react';

const TemaKontext = createContext('světlé');

function Odznak() {
  const tema = useContext(TemaKontext);
  return <span className={`odznak odznak--${tema === 'tmavé' ? 'tmavy' : 'svetly'}`}>{tema}</span>;
}

function Panel() {
  return (
    <div className="panel">
      <p>Vnořená komponenta si téma přečte sama:</p>
      <Odznak />
    </div>
  );
}

export default function App() {
  const [tema, setTema] = useState('světlé');

  return (
    <TemaKontext value={tema}>
      <button onClick={() => setTema(tema === 'světlé' ? 'tmavé' : 'světlé')}>
        Přepnout téma
      </button>
      <Panel />
    </TemaKontext>
  );
}
```
```css
body {
  margin: 1.5rem;
  font-family: system-ui, sans-serif;
  color: #101828;
}
button {
  padding: 0.5rem 0.9rem;
  border: 0;
  border-radius: 0.5rem;
  background: #1d4ed8;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
.panel {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e3e6ea;
  border-radius: 0.75rem;
}
.odznak {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
}
.odznak--svetly {
  background: #eff4ff;
  color: #1d4ed8;
}
.odznak--tmavy {
  background: #101828;
  color: #f2f4f7;
}
```
:::

Všimni si, že `Panel` o tématu neví vůbec nic a žádnou prop nepředává. Zkus
`Odznak` přesunout mimo `<TemaKontext>` (třeba nad tlačítko) a uvidíš výchozí
hodnotu `'světlé'` z `createContext` — právě proto se do ní píše smysluplný
výchozí stav, ne `null`.

:::check
Co dostane komponenta z `useContext(TemaKontext)`, když nad ní žádný provider není?

### --expected--

výchozí hodnotu z createContext

### --accept--

hodnotu předanou do createContext
výchozí hodnotu kontextu

### --why--

React hledá nejbližší provider směrem nahoru; když žádný nenajde, použije hodnotu z `createContext(vychozi)`. Proto je dobrým zvykem dát tam buď použitelný výchozí stav, nebo `null` a v hooku nad kontextem vyhodit srozumitelnou chybu („useKosik se musí volat uvnitř KosikProvider").

### --see--

react-hloubka/reducer-a-context#kontext-hodnota-pro-cely-podstrom
:::

## Kontext + reducer: stav a odesílání akcí zvlášť

Když se kontext a reducer potkají, vznikne z nich malé úložiště pro celou
aplikaci. Osvědčený tvar jsou **dva kontexty**: jeden pro stav a druhý pro
funkci `poslat`.

```jsx
const KosikKontext = createContext(null);
const KosikAkceKontext = createContext(null);

export function KosikProvider({ children }) {
  const [kosik, poslat] = useReducer(kosikReducer, []);

  return (
    <KosikKontext value={kosik}>
      <KosikAkceKontext value={poslat}>{children}</KosikAkceKontext>
    </KosikKontext>
  );
}

export const useKosik = () => useContext(KosikKontext);
export const useKosikAkce = () => useContext(KosikAkceKontext);
```

Rozdělení má praktický důvod: `poslat` z `useReducer` má **stabilní identitu**
a nikdy se nemění. Komponenta, která jen přidává do košíku (tlačítko „Koupit"),
si vezme `useKosikAkce()` a při změně obsahu košíku se nemusí překreslovat vůbec.

:::check
Proč se funkce `poslat` dává do vlastního kontextu, a ne do jednoho objektu se stavem?

### --answer--

Protože jeden kontext nesmí obsahovat funkci.

#### --why--

Kontext unese jakoukoli hodnotu, funkce nevyjímaje. Důvod je ve výkonu, ne v omezení.

### --correct--

Protože se `poslat` nikdy nemění, takže odběratelé akcí nemusí reagovat na změny stavu.

#### --why--

Kdyby byly v jednom objektu, každá změna stavu by vyrobila nový objekt a překreslila i komponenty, které stav vůbec nečtou. Oddělení nechá překreslit jen ty, které se dívají na data.

### --answer--

Protože `useReducer` vrací dvě hodnoty a nejde je dát do jednoho objektu.

#### --why--

Dát je do jednoho objektu jde snadno (`{ kosik, poslat }`) — je to dokonce běžný zápis. Otázka je, co to udělá s překreslováním.

### --see--

react-hloubka/reducer-a-context#kontext-reducer-stav-a-odesilani-akci-zvlast
:::

## Kdy kontext překreslí všechno

Kontext nemá žádné chytré porovnávání: **když se změní hodnota v `value`,
překreslí se všechny komponenty, které si ji čtou přes `useContext`** — a to
bez ohledu na `memo`. A protože objektový literál má v každém renderu novou
identitu, je snadné to vyrobit omylem.

:::live react predict
```jsx
import { createContext, memo, useContext, useState } from 'react';

const Kontext = createContext(null);

const Cas = memo(function Cas() {
  const { formatuj } = useContext(Kontext);
  console.log('Cas se vykreslil');
  return <p>{formatuj(new Date(2026, 8, 16))}</p>;
});

export default function App() {
  const [pocet, setPocet] = useState(0);
  const formatuj = (d) => d.toLocaleDateString('cs-CZ');

  return (
    <Kontext value={{ formatuj }}>
      <button onClick={() => setPocet(pocet + 1)}>Kliknuto: {pocet}</button>
      <Cas />
    </Kontext>
  );
}
```
--question-- Kolik výpisů `Cas se vykreslil` **přibude** v konzoli po třech kliknutích na tlačítko?
--option-- Žádný — `Cas` je v `memo` a žádnou prop nedostává.
--option*-- Tři, jeden na každé kliknutí.
--option-- Jeden, při prvním kliknutí.
--why-- `memo` porovnává props, ale `Cas` žádné nemá — zato čte kontext. Každý render `App` vyrobí nový objekt `{ formatuj }`, a protože se hodnota kontextu podle `Object.is` liší, React překreslí všechny odběratele. Oprava: hodnotu kontextu stabilizovat přes `useMemo` (a funkci přes `useCallback`), nebo rozdělit kontext na menší kusy podle toho, co se opravdu mění.
:::

> [!PITFALL]
> **`<Kontext value={{ a, b }}>` překresluje všechny odběratele při každém
> renderu poskytovatele.** Příznak: profil ukazuje stovky renderů komponent,
> které se vizuálně nezměnily. Oprava: `useMemo(() => ({ a, b }), [a, b])`,
> nebo rozdělit na víc kontextů (stav zvlášť, akce zvlášť).

:::check
Komponenta čte kontext a je zabalená v `memo`. Poskytovatel se překreslil, ale hodnota kontextu je podle `Object.is` stejná jako minule. Překreslí se komponenta?

### --answer--

Ano, `memo` odběratele kontextu nechrání nikdy.

#### --why--

`memo` opravdu nechrání před změnou kontextu — jenže tady se hodnota kontextu nezměnila. Zkus si oddělit dvě různé cesty, kterými se render může spustit.

### --correct--

Ne — hodnota kontextu se nezměnila a props taky ne, takže `memo` komponentu přeskočí.

#### --why--

React překresluje odběratele kontextu jen při změně hodnoty. Když se nezměnila ani hodnota, ani props, `memo` zabere úplně normálně. Problém vzniká teprve tehdy, když se hodnota vyrábí v renderu znovu.

### --answer--

Záleží na tom, jestli je poskytovatel taky v `memo`.

#### --why--

`memo` na poskytovateli rozhoduje jen o tom, jestli se vykreslí on sám. Odběratelům je to jedno — ti reagují na hodnotu.

### --see--

react-hloubka/reducer-a-context#kdy-kontext-prekresli-vsechno
:::

## Typické chyby a pasti

### Reducer, který mutuje stav

> [!PITFALL]
> **`stav.polozky.push(nova); return stav;` nepřekreslí nic.** Příznak: data
> v konzoli sedí, obrazovka se nemění; po kliknutí někam jinam se změny najednou
> objeví všechny naráz. Oprava: vracet nový objekt a nová vnořená pole
> (`{ ...stav, polozky: [...stav.polozky, nova] }`).

### Zapomenutá výchozí větev

> [!PITFALL]
> **Reducer bez `default` vrátí `undefined` a aplikace spadne na
> `Cannot read properties of undefined`.** Stane se to hned při první akci
> s překlepem v názvu. Oprava: buď `default: return stav;`, nebo (lepší při
> ladění) `default: throw new Error('Neznámá akce: ' + akce.typ);`.

### Kontext místo props

> [!PITFALL]
> **Kontext není náhrada props.** Příznak: komponenta, kterou nejde použít
> podruhé na jiné stránce, protože si všechno tahá z kontextu. Oprava: kontextem
> předávej jen věci, které opravdu potřebuje celý podstrom (přihlášený uživatel,
> téma, jazyk, košík); ostatní posílej props. Protahování přes dvě úrovně není
> důvod k zavedení kontextu.

### Jeden obrovský kontext pro celý stav

> [!PITFALL]
> **Čím víc věcí je v jednom kontextu, tím víc komponent se překresluje zbytečně.**
> Příznak: změna jednoho pole ve formuláři překreslí celou aplikaci. Oprava:
> rozdělit podle toho, co se mění spolu, nebo sáhnout po knihovně (Zustand,
> Jotai), která umí odebírat jen výřez stavu.

:::check
Kolegův reducer má větev `case 'prejmenuj': stav.nazev = akce.nazev; return { ...stav };`. Proč se změna projeví, ale nejde vrátit zpět?

### --answer--

Protože `{ ...stav }` je mělká kopie a název je vnořený objekt.

#### --why--

`nazev` je tady obyčejný text, ne objekt. Problém je v pořadí: co se stane se **starým** stavem ještě předtím, než se vyrobí kopie?

### --correct--

Protože se starý objekt stavu přepsal na místě — historie tím ztratila původní hodnotu.

#### --why--

Rozprostření sice vrátí nový objekt (takže se překreslí), ale předchozí stav už má nový název taky. Kdokoli si ho držel (historie, `useRef`, DevTools), má poškozená data. Správně je `return { ...stav, nazev: akce.nazev };` bez jediného zápisu do `stav`.

### --answer--

Protože `case` bez `break` propadne do další větve.

#### --why--

Větev končí `return`, takže se nepropadá. Chyba je v tom, co se stane se starým objektem.

### --see--

react-hloubka/reducer-a-context#reducer-ktery-mutuje-stav
:::

:::explain
Vysvětli vlastními slovy, čím se liší úloha reduceru a úloha kontextu — a proč se tak často používají spolu.

## --model--

Reducer řeší, **jak** se stav mění: je to čistá funkce, která z aktuálního stavu a akce spočítá nový stav, takže všechna pravidla (co vynuluje stránku, co smí přibýt do košíku) jsou na jednom místě a komponenty jen posílají akce. Kontext řeší, **kdo** se ke stavu dostane: nechá libovolně hluboko zanořenou komponentu přečíst hodnotu, aniž by ji musely předávat všechny komponenty po cestě. Spolu dávají malé úložiště pro celou aplikaci: reducer drží stav a pravidla, kontext ho rozvede po stromu. Zvlášť se hodí dát do kontextu stav a funkci `poslat` odděleně, protože `poslat` se nikdy nemění a komponenty, které jen posílají akce, se tak nemusí překreslovat.

## --checklist--

- Reducer určuje, jak se stav mění, na jednom místě.
- Kontext určuje, kdo ke stavu má přístup, bez protahování props.
- Dohromady dělají malé úložiště pro celou aplikaci.
- Stav a `poslat` se vyplatí dát do dvou kontextů kvůli překreslování.
:::

## Kde to najdeš v MDN

- [switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch) —
  včetně propadávání mezi větvemi, kterému se v reduceru vyhneš `return`.
- [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) —
  jak vyrobit nový objekt ze starého, což reducer dělá pořád.
- [structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone) —
  hluboká kopie, když se ve stavu opravdu nedá vyhnout vnořeným strukturám.
- [Crypto: randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) —
  id, které patří do akce, ne do reduceru.

> [!NOTE]
> Dokumentace Reactu: [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer),
> [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
> a [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context).
> Až bude stav větší než aplikace, podívej se na Zustand — knihovnu, která to samé
> umí bez poskytovatelů a s odebíráním jen části stavu.

# --questions--

## --question--

Napiš, co vrátí tenhle reducer pro akci `{ typ: 'zvys' }` nad stavem `{ pocet: 2, krok: 5 }`. Odpověz jako objekt.

```jsx
function reducer(stav, akce) {
  switch (akce.typ) {
    case 'zvys':
      return { ...stav, pocet: stav.pocet + stav.krok };
    default:
      return stav;
  }
}
```

### --expected--

{ pocet: 7, krok: 5 }

### --accept--

{ krok: 5, pocet: 7 }
{pocet: 7, krok: 5}

### --why--

Rozprostření nejdřív zkopíruje všechny klíče starého stavu a teprve pak se `pocet` přepíše spočítanou hodnotou. Proto `krok` zůstane a `pocet` je `2 + 5`.

### --see--

react-hloubka/reducer-a-context#usereducer-akce-jako-jmeno-udalosti

## --question--

Napiš, kolik komponent se překreslí, když se změní hodnota v `value` kontextu a hodnotu si čte pět komponent v podstromu (žádná z nich nemá jiné props a všechny jsou v `memo`).

### --expected--

pět

### --accept--

5
všech pět

### --why--

`memo` chrání jen před změnou props. Odběratele kontextu React překreslí vždycky, když se hodnota kontextu podle `Object.is` liší od předchozí — proto se vyplatí kontexty dělit a hodnotu stabilizovat.

### --see--

react-hloubka/reducer-a-context#kdy-kontext-prekresli-vsechno

## --question--

Kdy je `useReducer` lepší volba než několik `useState`?

### --correct--

Když se několik hodnot mění společně podle pravidel, která se opakují ve víc obsluhách.

#### --why--

Přesně to je situace, kdy se pravidla rozlézají po komponentě. Reducer je posbírá na jedno místo a obsluhy zkrátí na jedno volání.

### --answer--

Vždycky, když má komponenta víc než dva stavy.

#### --why--

Počet stavů sám o sobě nic neznamená. Tři nezávislé přepínače jsou jako tři `useState` čitelnější než reducer.

### --answer--

Když se stav musí sdílet mezi komponentami.

#### --why--

Sdílení řeší kontext nebo zvednutí stavu výš, ne reducer. `useReducer` bydlí v jedné komponentě úplně stejně jako `useState`.

### --answer--

Když je stav asynchronní (načítá se ze serveru).

#### --why--

Načítání ze serveru se reduceru netýká — ten je čistý a synchronní. Odpověď ze sítě se do něj dostane až jako akce.

### --see--

react-hloubka/reducer-a-context#kdyz-usestate-prestane-stacit

## --question--

Napiš jedním slovem, jakou vlastnost musí mít reducer, aby ho React směl ve `StrictMode` zavolat dvakrát a nic se nerozbilo.

### --expected-- ignore-case

čistý

### --accept--

cisty
musí být čistý
čistota

### --why--

Čistá funkce ze stejného vstupu vrátí stejný výsledek a nic vedle nezmění, takže druhé volání není poznat. Jakmile v reduceru přistane `Math.random()`, `Date.now()` nebo zápis do úložiště, dvojí volání se projeví.

### --see--

react-hloubka/reducer-a-context#reducer-musi-byt-cisty
