## --card-- output

Co vypíše tenhle kód?

```js
function telo() {
  return { jenSkladem: true };
}

const prvniRender = telo();
const druhyRender = telo();
console.log(Object.is(prvniRender, druhyRender), prvniRender.jenSkladem === druhyRender.jenSkladem);
```

### --expected--

false true

### --why--

Objektový literál v těle komponenty vzniká při každém spuštění znovu. Obsah je stejný, identita ne — a `memo`, `useMemo` i závislosti efektu porovnávají právě identitu.

### --see--

react-hloubka/render-a-rerender#identita-kazdy-render-vyrabi-nove-objekty-a-funkce

## --card-- output

Každé volání `render` odpovídá jednomu renderu komponenty. Co vypíše konzole?

```js
function render(sekund) {
  return () => console.log('nastavuji na ' + (sekund + 1));
}

const tikZPrvnihoRenderu = render(0);
const tikZDruhehoRenderu = render(1);

tikZPrvnihoRenderu();
tikZDruhehoRenderu();
tikZPrvnihoRenderu();
```

### --expected--

```text
nastavuji na 1
nastavuji na 2
nastavuji na 1
```

### --why--

Funkce si drží hodnoty toho renderu, ve kterém vznikla. Přesně tohle je zastaralá closure: efekt s prázdnými závislostmi zůstane navždy u funkce z prvního renderu, takže pořád počítá z nuly.

### --see--

react-hloubka/useeffect-spravne#zavislosti-uplny-seznam-nebo-zastarala-closure

## --card-- output

Co vypíše tenhle kód?

```js
function reducer(stav, akce) {
  stav.pocet = stav.pocet + 1;
  return stav;
}

const stav = { pocet: 2 };
const novy = reducer(stav, { typ: 'zvys' });
console.log(Object.is(stav, novy), novy.pocet);
```

### --expected--

true 3

### --why--

Hodnota v paměti se změnila, ale reducer vrátil tentýž objekt. React porovnává stav přes `Object.is`, takže žádnou změnu nevidí a render nenaplánuje — data a obrazovka se rozejdou.

### --see--

react-hloubka/reducer-a-context#reducer-ktery-mutuje-stav

## --card-- output

Co vypíše tenhle kód?

```js
const stav = { kategorie: 'vše', stranka: 4 };
const novy = { ...stav, kategorie: 'bicí', stranka: 1 };

console.log(JSON.stringify(novy));
console.log(JSON.stringify(stav));
```

### --expected--

```text
{"kategorie":"bicí","stranka":1}
{"kategorie":"vše","stranka":4}
```

### --why--

Rozprostření nejdřív zkopíruje všechny klíče a teprve pak je přepíšou klíče napsané za ním. Starý objekt zůstane nedotčený — právě proto se z reduceru vrací nový objekt a do starého se nepíše.

### --see--

react-hloubka/reducer-a-context#usereducer-akce-jako-jmeno-udalosti

## --card-- output

`nastavCasovac` představuje efekt a vrácená funkce jeho úklid. Co vypíše konzole?

```js
const naplanovane = [];

function nastavCasovac(hodnota) {
  naplanovane.push(hodnota);
  return () => naplanovane.splice(naplanovane.indexOf(hodnota), 1);
}

const uklid1 = nastavCasovac('br');
uklid1();
const uklid2 = nastavCasovac('brn');
uklid2();
nastavCasovac('brno');

console.log(naplanovane.length, naplanovane.join(','));
```

### --expected--

1 brno

### --why--

Úklid se spustí před každým dalším během efektu, takže rozdělaný časovač zruší. Bez něj by zůstaly naplánované všechny tři a server by dostal dotaz na každé písmeno.

### --see--

react-hloubka/vlastni-hooky#usedebouncedvalue-hook-s-efektem-a-uklidem

## --card-- output

Co bude v odstavci po pěti sekundách?

```jsx
export default function Stopky() {
  const [sekund, setSekund] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSekund(sekund + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>Běží {sekund} s</p>;
}
```

### --expected--

Běží 1 s

### --accept--

1
běží 1 s
zasekne se na 1

### --why--

Efekt s prázdnými závislostmi proběhl jednou a v jeho closure je `sekund` navždy nula. Každé tiknutí tedy volá `setSekund(0 + 1)`, po prvním se stav ustálí na jedničce a React už nic nepřekresluje. Oprava: `setSekund((s) => s + 1)`.

### --see--

react-hloubka/useeffect-spravne#zavislosti-uplny-seznam-nebo-zastarala-closure

## --card-- output

Uživatel přepne `mistnost` z `obecná` na `rady`. Co vypíše konzole?

```jsx
useEffect(() => {
  console.log('připojuji ' + mistnost);
  return () => console.log('odpojuji ' + mistnost);
}, [mistnost]);
```

### --expected--

```text
odpojuji obecná
připojuji rady
```

### --why--

Nejdřív běží úklid po starém efektu — a ten vidí hodnoty renderu, ve kterém se spustil, tedy `obecná`. Až pak se spustí nový efekt s novou místností. Kdyby to bylo naopak, byl bys chvíli připojený ke dvěma místnostem.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

## --card-- output

Uživatel napíše do vstupu jeden znak. Které řádky přibudou v konzoli?

```jsx
function Radek({ nazev }) {
  console.log('Radek', nazev);
  return <li>{nazev}</li>;
}

export default function App() {
  const [hledej, setHledej] = useState('');
  console.log('App');
  return (
    <div>
      <input value={hledej} onChange={(e) => setHledej(e.target.value)} />
      <Radek nazev="Rohlík" />
    </div>
  );
}
```

### --expected--

```text
App
Radek Rohlík
```

### --why--

React se props předem nekouká: když se vykreslí rodič, spustí i všechno, co rodič vrací. Do DOMu se přitom zapíše jen nová hodnota vstupu — render byl velký, commit malý.

### --see--

react-hloubka/render-a-rerender#kdyz-se-vykresli-rodic-vykresli-se-i-potomci

## --card-- output

Kolik výpisů `Seznam` přibude v konzoli po napsání jednoho znaku do vstupu?

```jsx
const Seznam = memo(function Seznam({ polozky }) {
  console.log('Seznam');
  return <ul>{polozky.map((p) => <li key={p}>{p}</li>)}</ul>;
});

export default function App() {
  const [hledej, setHledej] = useState('');
  const vObjednavce = ['Chleba'];

  return (
    <div>
      <input value={hledej} onChange={(e) => setHledej(e.target.value)} />
      <Seznam polozky={vObjednavce} />
    </div>
  );
}
```

### --expected--

jeden

### --accept--

1
jeden výpis

### --why--

`memo` porovnává props přes `Object.is`. Pole `vObjednavce` vzniká v těle `App` znovu při každém renderu, takže porovnání vždycky selže a `memo` jen přidá práci navíc. Oprava: konstantu přesunout nad komponentu.

### --see--

react-hloubka/render-a-rerender#memo-zarazka-kterou-lehce-obejdes

## --card-- output

Uživatel klikne třikrát. Co bude v odstavci?

```jsx
export default function Pocitadlo() {
  const pocetRef = useRef(0);

  return (
    <div>
      <p>Kliknuto: {pocetRef.current}×</p>
      <button onClick={() => { pocetRef.current += 1; }}>Klikni</button>
    </div>
  );
}
```

### --expected--

Kliknuto: 0×

### --accept--

0
Kliknuto: 0x
nula

### --why--

Zápis do `ref.current` nevyvolá render, takže se odstavec nepřekreslí. Hodnota v refu je přitom správně tři — data a obrazovka se rozešly. Co je vidět, patří do `useState`.

### --see--

react-hloubka/useref-a-dom#ref-pouzity-misto-stavu

## --card-- output

Uživatel klikne na tlačítko vykreslené portálem. Co bude v záznamu?

```jsx
export default function App() {
  const [log, setLog] = useState([]);
  const zapis = (kdo) => setLog((s) => [...s, kdo]);

  return (
    <div onClick={() => zapis('karta')}>
      {createPortal(
        <button onClick={() => zapis('tlačítko')}>Tlačítko</button>,
        document.body,
      )}
      <p>{log.join(', ')}</p>
    </div>
  );
}
```

### --expected--

tlačítko, karta

### --accept--

tlačítko a pak karta
obojí

### --why--

Události v Reactu probublávají podle stromu komponent, ne podle stromu DOM. Tlačítko je v JSX potomkem toho `div`, takže po jeho vlastní obsluze přijde na řadu obsluha rodiče — i když prvek leží v `<body>`.

### --see--

react-hloubka/chyby-suspense-portaly#portal-v-domu-jinde-ve-stromu-reactu-doma

## --card-- output

Kolikrát se vypíše `render 0` při prvním vykreslení ve vývoji a kolikrát v produkčním buildu?

```jsx
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

### --expected--

2 1

### --accept--

dvakrát a jednou
2x a 1x

### --why--

`StrictMode` ve vývoji render zdvojí, aby ukázal nečisté komponenty. V produkci se komponenta spustí jednou. Kdyby se zdvojení projevilo na výsledku, je chyba v kódu, ne v Reactu.

### --see--

react-hloubka/render-a-rerender#strictmode-ve-vyvoji-se-render-dela-dvakrat

## --card-- code js

Napiš `filtrReducer(stav, akce)` pro filtr e-shopu. Akce `{ typ: 'kategorie', hodnota }` nastaví kategorii a vrátí stránku na `1`, akce `{ typ: 'stranka', hodnota }` nastaví jen stránku. U neznámé akce vrať stav beze změny. Starý objekt stavu nesmíš změnit.

### --seed--

```js
function filtrReducer(stav, akce) {
}
```

### --test--

```js
const stav = { kategorie: 'vše', jenSkladem: true, stranka: 4 };
const poKategorii = filtrReducer(stav, { typ: 'kategorie', hodnota: 'bicí' });
assert.deepEqual(poKategorii, { kategorie: 'bicí', jenSkladem: true, stranka: 1 }, 'akce kategorie má nastavit kategorii a vrátit stránku na 1');
assert.deepEqual(stav, { kategorie: 'vše', jenSkladem: true, stranka: 4 }, 'reducer nesmí změnit starý objekt stavu');
const poStrance = filtrReducer(stav, { typ: 'stranka', hodnota: 3 });
assert.equal(poStrance.stranka, 3, 'akce stranka má nastavit stránku na 3');
assert.equal(poStrance.kategorie, 'vše', 'akce stranka nemá sáhnout na kategorii');
assert.equal(filtrReducer(stav, { typ: 'neznámá' }), stav, 'neznámá akce má vrátit stav beze změny');
```

### --solution--

```js
function filtrReducer(stav, akce) {
  switch (akce.typ) {
    case 'kategorie':
      return { ...stav, kategorie: akce.hodnota, stranka: 1 };
    case 'stranka':
      return { ...stav, stranka: akce.hodnota };
    default:
      return stav;
  }
}
```

### --why--

Pravidlo „změna kategorie nuluje stránku" je v reduceru na jednom místě. Kdyby bylo v obsluhách, zapomeneš na něj u čtvrtého filtru.

### --see--

react-hloubka/reducer-a-context#usereducer-akce-jako-jmeno-udalosti

## --card-- code js

Napiš `kosikReducer(stav, akce)`, kde stav je pole položek `{ id, pocet }`. Akce `{ typ: 'pridej', id }` zvýší počet u položky se stejným `id`, a když tam ještě není, přidá ji s počtem `1`. Původní pole ani jeho položky nesmíš změnit.

### --seed--

```js
function kosikReducer(stav, akce) {
}
```

### --test--

```js
const prazdny = [];
assert.deepEqual(kosikReducer(prazdny, { typ: 'pridej', id: 'kytara' }), [{ id: 'kytara', pocet: 1 }], 'do prázdného košíku se má položka přidat s počtem 1');
const kosik = [{ id: 'kytara', pocet: 1 }, { id: 'struny', pocet: 2 }];
assert.deepEqual(kosikReducer(kosik, { typ: 'pridej', id: 'struny' }), [{ id: 'kytara', pocet: 1 }, { id: 'struny', pocet: 3 }], 'u existující položky se má počet zvýšit');
assert.deepEqual(kosik, [{ id: 'kytara', pocet: 1 }, { id: 'struny', pocet: 2 }], 'reducer nesmí změnit původní pole ani jeho položky');
assert.ok(kosikReducer(kosik, { typ: 'pridej', id: 'struny' }) !== kosik, 'reducer má vrátit nové pole, ne to původní');
```

### --solution--

```js
function kosikReducer(stav, akce) {
  if (akce.typ !== 'pridej') return stav;
  const uvnitr = stav.some((polozka) => polozka.id === akce.id);
  if (!uvnitr) return [...stav, { id: akce.id, pocet: 1 }];
  return stav.map((polozka) =>
    polozka.id === akce.id ? { ...polozka, pocet: polozka.pocet + 1 } : polozka,
  );
}
```

### --why--

Nové pole nestačí — měnit se nesmí ani položka uvnitř. `map` s rozprostřením vyrobí nový objekt jen u té jediné položky, kterých se změna týká.

### --see--

react-hloubka/reducer-a-context#reducer-ktery-mutuje-stav

## --card-- code js

React porovnává závislosti položku po položce přes `Object.is`. Napiš `stejneZavislosti(stare, nove)`, která vrátí `true`, jen když mají obě pole stejnou délku a všechny položky jsou podle `Object.is` shodné.

### --seed--

```js
function stejneZavislosti(stare, nove) {
}
```

### --test--

```js
assert.equal(stejneZavislosti(['brno', 3], ['brno', 3]), true, 'stejné primitivní hodnoty mají dát true');
const filtr = { jenSkladem: true };
assert.equal(stejneZavislosti([filtr], [filtr]), true, 'tentýž objekt v obou polích má dát true');
assert.equal(stejneZavislosti([{ jenSkladem: true }], [{ jenSkladem: true }]), false, 'dva různé objekty se stejným obsahem mají dát false');
assert.equal(stejneZavislosti(['brno'], ['brno', 3]), false, 'pole různé délky mají dát false');
assert.equal(stejneZavislosti([], []), true, 'dvě prázdná pole mají dát true');
```

### --solution--

```js
function stejneZavislosti(stare, nove) {
  if (stare.length !== nove.length) return false;
  return stare.every((hodnota, index) => Object.is(hodnota, nove[index]));
}
```

### --why--

Tohle je celá „magie" závislostí: žádné porovnávání obsahu, jen identita. Proto objekt vyrobený v těle komponenty restartuje efekt při každém renderu.

### --see--

react-hloubka/render-a-rerender#identita-kazdy-render-vyrabi-nove-objekty-a-funkce

## --card-- code js

Napiš `vytvorUklid(prihlaseni)`, která dostane funkci simulující přihlášení posluchače. Funkci zavolej, její návratovou hodnotu (odhlašovací funkci) si zapamatuj a vrať funkci, která odhlášení zavolá — ale jen při prvním zavolání, další už nic neudělají.

### --seed--

```js
function vytvorUklid(prihlaseni) {
}
```

### --test--

```js
let odhlaseni = 0;
let prihlaseni = 0;
const uklid = vytvorUklid(() => {
  prihlaseni += 1;
  return () => {
    odhlaseni += 1;
  };
});
assert.equal(prihlaseni, 1, 'přihlašovací funkce se má zavolat hned jednou');
assert.equal(odhlaseni, 0, 'odhlášení se nemá zavolat dřív, než se spustí úklid');
uklid();
assert.equal(odhlaseni, 1, 'první spuštění úklidu má odhlásit posluchače');
uklid();
uklid();
assert.equal(odhlaseni, 1, 'další spuštění úklidu už nemají odhlašovat znovu');
```

### --solution--

```js
function vytvorUklid(prihlaseni) {
  let odhlas = prihlaseni();
  return () => {
    if (!odhlas) return;
    odhlas();
    odhlas = null;
  };
}
```

### --why--

Stejný tvar má přihlašovací funkce pro `useSyncExternalStore` i tělo efektu: něco zapni a vrať funkci, která to vypne. Ochrana proti dvojímu úklidu je zvyk, který tě zachrání ve `StrictMode`.

### --see--

react-hloubka/vlastni-hooky#usemediaquery-cteni-z-vnejsiho-zdroje-bez-efektu

## --card-- free

Jaký je rozdíl mezi renderem a commitem? Proč to rozlišení vůbec potřebuješ?

### --back--

Render je spuštění funkce komponenty: React si od ní vyžádá popis toho, jak má UI vypadat. Commit je zápis rozdílu mezi novým a starým popisem do DOMu a hned po něm běží efekty. React skoro vždycky spustí víc funkcí, než kolik prvků nakonec změní — tisíc renderů může skončit změnou jediného atributu. Rozlišení potřebuješ při ladění výkonu: počet renderů v Profileru sám o sobě neznamená pomalou stránku, drahé je to, co se v nich počítá. A taky při práci s refy: prvek v DOMu existuje až po commitu, proto se v renderu nedá měřit ani nastavovat fokus.

### --see--

react-hloubka/render-a-rerender#trigger-render-commit

## --card-- free

Proč `memo` často „nefunguje"? Jak to poznáš a co s tím?

### --back--

`memo` porovná props po jedné přes `Object.is`, tedy podle identity, ne podle obsahu. Tělo rodiče se ale při každém renderu spustí celé, takže objektový literál, pole i šipková funkce mají pokaždé novou identitu a porovnání selže. Nejčastější viník je handler zapsaný přímo v JSX (`onSmazat={() => smazat(id)}`) a konfigurační objekt (`filtr={{ jenSkladem: true }}`). Poznáš to tak, že komponenta je v `memo` a přesto se hlásí v konzoli nebo v Profileru při každém stisku klávesy. Opravy: posílat primitivní props, konstantní data přesunout mimo komponentu, identitu udržet přes `useMemo` a `useCallback`, nebo zapnout React Compiler.

### --see--

react-hloubka/render-a-rerender#memo-zarazka-kterou-lehce-obejdes

## --card-- free

Kdy `useEffect` nepotřebuješ? Jmenuj tři situace a řekni, kam ten kód patří místo něj.

### --back--

Zaprvé odvozená hodnota: cokoli se dá spočítat ze stavu a props, spočítej při renderu (`const soucet = spocitat(polozky)`). Efekt, který to zapisuje do druhého stavu, dělá render navíc a uživatel na okamžik vidí nesouhlasící data. Zadruhé reset stavu při změně dat: místo efektu, který stav maže, dej komponentě jiný `key` a React ji vymění za novou. Zatřetí reakce na akci uživatele: odeslání objednávky nebo oznámení „Uloženo" patří do obsluhy události, protože se to má stát po kliknutí, ne „po vykreslení, když má stav tuhle hodnotu". Efekt zbývá jen na synchronizaci s něčím mimo React: spojení, časovač, posluchač na `window`, titulek stránky.

### --see--

react-hloubka/useeffect-spravne#kdy-efekt-nepotrebujes
react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

## --card-- free

Co je úklidová funkce efektu, kdy ji React volá a co se stane, když chybí?

### --back--

Je to funkce vrácená z těla efektu. React ji zavolá před každým dalším spuštěním téhož efektu (tedy při změně závislostí) a ještě jednou při odmontování komponenty. Uklízí se v ní všechno, co efekt zapnul: `clearInterval` po `setInterval`, `removeEventListener` se stejnou funkcí, `close()` u spojení, `observer.disconnect()`, `controller.abort()` u rozjetého načítání. Bez úklidu zůstane po odmontované komponentě běžící časovač nebo posluchač, který pracuje se starým stavem — React na to od verze 18 neupozorňuje, takže se to projeví jen podivným chováním a rostoucí spotřebou paměti.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

## --card-- free

Proč se ve vývoji efekt spustí dvakrát a co to o tvém kódu říká?

### --back--

Ve `StrictMode` React každou komponentu po namontování hned odmontuje a namontuje znovu. Efekt tedy proběhne, uklidí se a proběhne podruhé. Je to zkouška: efekt, který po sobě uklízí, ji nepozná, protože druhý běh začíná z čistého stavu. Prozradí se jen efekt bez úklidu — dva běžící intervaly, dvě otevřená spojení, dvě oznámení. V produkčním buildu se to nedeje, takže „chová se to divně jen ve vývoji" neznamená rozbitý React, ale chybějící úklid nebo vedlejší efekt v renderu. Vypnout `StrictMode` je schování chyby, ne oprava.

### --see--

react-hloubka/useeffect-spravne#strictmode-mount-unmount-mount

## --card-- free

Kdy sáhneš po `useRef` a kdy po `useState`? Uveď příklad obojího.

### --back--

Do stavu patří všechno, co uživatel vidí na obrazovce — jeho změna je pro React žádost o render, takže se data a obrazovka nikdy nerozejdou. Do refu patří hodnoty, které vidět nejsou a mají jen přežít render: uzel DOMu (pro `focus()`, `scrollIntoView()`, měření), id běžícího časovače nebo `requestAnimationFrame`, předchozí hodnota, kontext plátna u `canvas`. Zápis do `ref.current` React nesleduje a nic nepřekreslí. Příklad: u přehrávače je hlasitost zobrazená na posuvníku stav, id animačního snímku ref. A `ref.current` se čte a zapisuje v obsluze události nebo v efektu, nikdy v těle komponenty.

### --see--

react-hloubka/useref-a-dom#ref-jako-schranka-mimo-render

## --card-- free

Dvě komponenty volají tentýž vlastní hook `useKosik()`. Sdílejí data? Proč?

### --back--

Ne. Vlastní hook je obyčejná funkce, jejíž tělo React provede uvnitř té komponenty, která ji zavolala — jako by se tam řádky zkopírovaly. `useState` uvnitř hooku tedy zakládá stav té komponenty, ne hooku; hook sám žádnou paměť nemá. Dvě volání dají dva nezávislé stavy a dva nezávislé efekty (takže i dvě načtení ze serveru). Hook sdílí logiku, ne data. Když se data sdílet mají, musí bydlet na jednom místě nad oběma komponentami: ve stavu společného rodiče poslaném props, v kontextu, nebo v knihovně na dotazy, která má vlastní cache.

### --see--

react-hloubka/vlastni-hooky#hook-sdili-logiku-ne-stav

## --card-- free

Kdy je `useReducer` lepší volba než několik `useState`?

### --back--

Když se několik hodnot mění vždycky společně a podle pravidel, která se opakují ve víc obsluhách. Typický příklad je filtr, kde změna kategorie i zapnutí „jen skladem" musí vrátit stránkování na první stránku: s `useState` je to pravidlo napsané na pěti místech a na jednom z nich se na něj zapomene, s reducerem je v jedné funkci. Komponenta pak jen pošle akci pojmenovanou podle události (`{ typ: 'kategorie', hodnota }`) a nerozhoduje o tom, co se se stavem stane. Naopak tři nezávislé přepínače jsou jako tři `useState` čitelnější. Reducer musí zůstat čistý: `Math.random()`, `Date.now()` ani `fetch` do něj nepatří, ty se spočítají v obsluze a pošlou v akci.

### --see--

react-hloubka/reducer-a-context#kdyz-usestate-prestane-stacit

## --card-- free

Proč se stav a funkce `poslat` dávají do dvou samostatných kontextů?

### --back--

Kontext nemá žádné chytré porovnávání: když se změní hodnota ve `value`, React překreslí všechny odběratele, a to i ty zabalené v `memo`. Kdyby byl stav i `poslat` v jednom objektu, vyrobil by se při každém renderu poskytovatele nový objekt a překreslily by se i komponenty, které stav vůbec nečtou — třeba tlačítko „Koupit", které jen posílá akci. Funkce `poslat` z `useReducer` má přitom stabilní identitu a nikdy se nemění, takže její vlastní kontext se nezmění nikdy. Stejný účel plní `useMemo` nad hodnotou kontextu: nechat identitu na pokoji, dokud se data opravdu nezměnila.

### --see--

react-hloubka/reducer-a-context#kontext-reducer-stav-a-odesilani-akci-zvlast

## --card-- free

Co error boundary zachytí a co ne? Kam ji v aplikaci umístit?

### --back--

Zachytí výjimku z renderu, z efektu a z konstruktoru kterékoli komponenty pod sebou a místo spadlého podstromu vykreslí náhradu. Nezachytí chybu z obsluhy události, ze `setTimeout` ani odmítnutou promise — tam to musíš ošetřit sám přes `try`/`catch` nebo `.catch` a chybu uložit do stavu, ze kterého ji vykreslíš. Bez boundary React při chybě v renderu odmontuje celý strom, protože polovina vykreslené stránky může ukazovat neplatná data. Jedna boundary kolem celé aplikace je proto skoro stejně málo jako žádná: hranice kresli tam, kde má smysl ztratit jen kousek — kolem jednotlivých widgetů, kolem obsahu uvnitř layoutu, kolem každé záložky.

### --see--

react-hloubka/chyby-suspense-portaly#error-boundary-zachrana-nad-komponentou

## --card-- output

Co se v tomhle kódu stane s rozepsaným textem v `<input>` uvnitř `Poznamka`, když uživatel klikne na tlačítko?

```jsx
function Seznam() {
  const [poradi, setPoradi] = useState(0);
  return (
    <div>
      <button onClick={() => setPoradi(poradi + 1)}>Další klient</button>
      <Poznamka key={poradi} />
    </div>
  );
}
```

### --expected--

smaže se

### --accept--

zmizí
resetuje se
vymaže se
stav se ztratí

### --why--

`key` je pro React identita komponenty. Nový `key` znamená jinou komponentu: starou odmontuje i se stavem a novou namontuje s výchozím. Tady je to záměr, u `key={index}` po přeskládání seznamu je to chyba.

### --see--

react-hloubka/render-a-rerender#zmena-key-vyhodi-stav

## --card-- output

Uživatel se přihlásí. Co React ohlásí?

```jsx
function Profil({ uzivatel }) {
  if (!uzivatel) return <Prihlaseni />;
  const [zalozka, setZalozka] = useState('profil');
  return <Zalozky aktivni={zalozka} onZmena={setZalozka} />;
}
```

### --expected--

Rendered more hooks than during the previous render.

### --accept--

že se zavolalo víc hooků než v minulém renderu
chybu o počtu hooků
Rendered more hooks

### --why--

Předčasný `return` je podmíněné volání hooků se vším všudy, jen není vidět na první pohled. React si stav pamatuje podle pořadí volání, takže změna počtu je tvrdá chyba. Oprava: všechny hooky nahoru, `return` až pod ně.

### --see--

react-hloubka/vlastni-hooky#podminene-volani-schovane-ve-vetvi

## --card-- output

Komponenta je uvnitř `<Suspense fallback={<Kostra />}>` a pozastaví se. Co uvidí uživatel na obrazovce?

```jsx
function Pocasi() {
  const pocasi = use(pocasiPromise);
  return <p>{pocasi.misto}: {pocasi.teplota} °C</p>;
}
```

### --expected--

kostru

### --accept--

komponentu Kostra
obsah fallbacku
Kostra

### --why--

Pozastavená komponenta se nevykreslí vůbec; místo ní ukáže React `fallback` nejbližší hranice `Suspense` nad ní a vymění ho, až se čekání vyřeší. Pozor na to, aby promise nevznikala v renderu — pak by se točil `fallback` donekonečna.

### --see--

react-hloubka/chyby-suspense-portaly#suspense-kdo-ukaze-nacitam

## --card-- free

Co se stane, když v komponentě napíšeš `useState(nactiZUloziste())` místo `useState(() => nactiZUloziste())`?

### --back--

Argument `useState` je obyčejný výraz, takže se vyhodnotí při **každém** renderu — čtení z `localStorage` a `JSON.parse` tedy proběhnou na každý stisk klávesy, i když React použije jen výsledek z prvního renderu. Když místo hodnoty předáš funkci, React ji zavolá jen při prvním renderu; říká se tomu líná počáteční hodnota. Příznak špatné varianty je stránka, která se s rostoucím množstvím dat zpomaluje, a v profilu čtení úložiště u každé interakce. Stejný rozdíl platí pro třetí argument `useReducer` (inicializační funkce).

### --see--

react-hloubka/vlastni-hooky#uselocalstorage-hodnota-ktera-prezije-zavreni-karty
