# useEffect správně

`useEffect` je hook, kterým začínají potíže: zdvojená oznámení, počítadlo
zaseknuté na jedničce, detail zákazníka, který ukazuje data předchozího
zákazníka. V týmech se proto říká „efektů co nejmíň" — a tahle lekce ti řekne,
kdy je efekt na místě, kdy ne a jak ten na místě napsat tak, aby nelhal.

:::check pretest
V komponentě je seznam položek ve stavu a vedle něj `soucet` taky ve stavu,
který se přepočítává v efektu:

```jsx
useEffect(() => {
  setSoucet(polozky.reduce((s, p) => s + p.cena, 0));
}, [polozky]);
```

Kolik renderů proběhne po přidání položky?

### --answer--

Jeden — React změny sloučí do jednoho renderu.

#### --why--

React dávkuje změny, které nastanou ve **jedné** obsluze události. Efekt ale běží až po commitu, tedy po renderu — a jeho `setSoucet` je nová žádost o aktualizaci.

### --correct--

Dva — nejdřív s novou položkou a starým součtem, pak s novým součtem.

#### --why--

Efekt běží po commitu. Uživatel tak na okamžik vidí nesouhlasící data. Co s tím, uvidíš v části „Kdy efekt nepotřebuješ".

### --answer--

Nekonečně mnoho, protože `setSoucet` efekt znovu spustí.

#### --why--

Efekt má v závislostech `polozky`, a ty se nezměnily. Nekonečná smyčka by vznikla, kdyby v závislostech byl `soucet` nebo tam nebylo nic.
:::

:::check pretest
Efekt se spouští při změně `mistnost`. Uživatel přepne z `obecná` na `rady`.
V jakém pořadí proběhne úklid starého efektu a nový efekt? Odpověz `úklid, efekt`,
nebo `efekt, úklid`.

### --expected-- ignore-case

úklid, efekt

### --accept--

uklid, efekt
nejdřív úklid

### --why--

React nejdřív uklidí po starém efektu (odpojí se od staré místnosti) a pak spustí nový. Kdyby to bylo naopak, byl bys chvíli připojený ke dvěma místnostem.
:::

Efekt není „udělej to po vykreslení". Je to způsob, jak **udržet něco mimo React
v souladu se stavem Reactu**: otevřené spojení, časovač, posluchač na `window`,
titulek stránky, přehrávač videa.

> [!REMEMBER]
> **Efekt synchronizuje vnější systém se stavem.** Když v efektu není nic
> vnějšího — jen přepočet hodnoty, nebo reakce na kliknutí — patří ten kód do
> renderu nebo do handleru, ne do efektu.

## Efekt jako synchronizace s vnějším systémem

Ukázka simuluje chat: „vnější systém" je objekt `spojeni`, který si komponenta
otevře a musí ho zavřít. Přepni místnost a přečti si výpisy:

:::live react
```jsx
import { useEffect, useState } from 'react';

function otevriSpojeni(mistnost) {
  console.log('připojuji se k ' + mistnost);
  return {
    zavri() {
      console.log('zavírám ' + mistnost);
    },
  };
}

function Chat({ mistnost }) {
  useEffect(() => {
    const spojeni = otevriSpojeni(mistnost);
    return () => spojeni.zavri();
  }, [mistnost]);

  return <p className="stav">Jsi v místnosti {mistnost}.</p>;
}

export default function App() {
  const [mistnost, setMistnost] = useState('obecná');

  return (
    <div className="chat">
      <div className="chat__ovladani">
        {['obecná', 'rady', 'nabídky'].map((m) => (
          <button key={m} onClick={() => setMistnost(m)} aria-pressed={m === mistnost}>
            {m}
          </button>
        ))}
      </div>
      <Chat mistnost={mistnost} />
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
.chat {
  margin: 1.5rem;
  padding: 1.25rem;
  max-width: 24rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.12);
}
.chat__ovladani {
  display: flex;
  gap: 0.5rem;
}
button {
  padding: 0.4rem 0.8rem;
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
.stav {
  margin: 1rem 0 0;
  color: #475467;
}
```
:::

Efekt má tři části a každá má jasnou roli: **tělo** vnější systém zapne,
**návratová funkce** ho vypne a **závislosti** říkají, na čem to zapnutí stojí.
Zkus do závislostí místo `[mistnost]` napsat `[]` a přepni místnost — uvidíš,
že se spojení už nepřepojí.

:::check
Co v ukázce hraje roli „vnějšího systému", který efekt synchronizuje se stavem?

### --answer--

Odstavec s textem `Jsi v místnosti …`.

#### --why--

Odstavec vykresluje React sám z props — s tím se nic synchronizovat nemusí. Vnější systém je to, co o Reactu nic neví.

### --correct--

Objekt spojení vrácený z `otevriSpojeni`.

#### --why--

Spojení žije mimo React: někdo ho musí otevřít a zavřít. Přesně na to je efekt.

### --answer--

Stav `mistnost` v komponentě `App`.

#### --why--

Stav je uvnitř Reactu. Efekt ho jen čte, aby podle něj nastavil něco venku.

### --see--

react-hloubka/useeffect-spravne#efekt-jako-synchronizace-s-vnejsim-systemem
:::

## Kdy efekt nepotřebuješ

Tři nejčastější efekty, které v kódu být nemají:

**1. Odvozená hodnota.** Cokoli, co se dá spočítat ze stavu a props, spočítej
při renderu. Žádný efekt, žádný druhý stav, žádný render navíc.

```jsx
// špatně: dva stavy, dva rendery, jedna data
const [polozky, setPolozky] = useState([]);
const [soucet, setSoucet] = useState(0);
useEffect(() => setSoucet(spocitat(polozky)), [polozky]);

// dobře: jeden zdroj pravdy
const [polozky, setPolozky] = useState([]);
const soucet = spocitat(polozky);
```

**2. Reset stavu při změně dat.** Formulář má zapomenout rozepsaný text, když
přijde jiný zákazník. Nepiš efekt, který stav maže — dej komponentě `key`
a React ji vymění za novou (viz [změna `key` vyhodí stav](see:react-hloubka/render-a-rerender#zmena-key-vyhodi-stav)).

**3. Reakce na akci uživatele.** Odeslání objednávky, zápis do košíku, oznámení
o uložení — to všechno patří do handleru, protože se to má stát **po kliknutí**,
ne „po vykreslení, když má stav tuhle hodnotu".

:::live react
```jsx
import { useState } from 'react';

const SAZBA = 0.21;

export default function Kalkulace() {
  const [cenaBezDph, setCenaBezDph] = useState(1000);

  const dph = Math.round(cenaBezDph * SAZBA);
  const celkem = cenaBezDph + dph;

  return (
    <div className="kalkulace">
      <label>
        Cena bez DPH
        <input
          type="number"
          value={cenaBezDph}
          onChange={(e) => setCenaBezDph(Number(e.target.value))}
        />
      </label>
      <p>
        DPH: <strong>{dph} Kč</strong>
      </p>
      <p>
        Celkem: <strong>{celkem} Kč</strong>
      </p>
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
.kalkulace {
  margin: 1.5rem;
  padding: 1.25rem;
  max-width: 18rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.12);
}
label {
  display: grid;
  gap: 0.35rem;
  color: #475467;
  font-size: 0.9rem;
}
input {
  padding: 0.45rem 0.6rem;
  border: 1px solid #cfd4dc;
  border-radius: 0.5rem;
  font: inherit;
}
p {
  margin: 0.75rem 0 0;
}
```
:::

`dph` ani `celkem` nejsou ve stavu a přesto jsou vždycky správné. Zkus přidat
řádek `console.log('render')` a sleduj, že na jeden stisk klávesy je jeden render.
Kdyby byl součet ve stavu a dopočítával ho efekt, byly by dva.

> [!PITFALL]
> **Efekt, který nastavuje stav spočítaný z jiného stavu, dělá render navíc a
> blikající data.** Příznak: uživatel na okamžik vidí novou položku se starým
> součtem, v konzoli jsou na jednu akci dva rendery. Oprava: hodnotu spočítat
> při renderu. Když je výpočet opravdu drahý, zabal ho do `useMemo` —
> ne do efektu.

:::check
Uživatel klikne na **Uložit** a má se objevit oznámení „Uloženo". Kam ten kód patří?

### --answer--

Do efektu se závislostí na uložených datech.

#### --why--

Efekt se spustí i při prvním vykreslení nebo po jakékoli jiné změně těch dat — a oznámení vyskočí, i když uživatel nikam neklikl.

### --correct--

Do obsluhy kliknutí (`onClick`).

#### --why--

Oznámení je následek konkrétní akce uživatele, ne stavu obrazovky. Kód, který patří k akci, patří do handleru.

### --answer--

Do těla komponenty, hned za výpočet dat.

#### --why--

Tělo komponenty musí být čisté — smí jen počítat a vracet JSX. Vyvolat oznámení odtud znamená vedlejší efekt v renderu, který se ve `StrictMode` provede dvakrát.

### --see--

react-hloubka/useeffect-spravne#kdy-efekt-nepotrebujes
:::

## Závislosti: úplný seznam, nebo zastaralá closure

Do závislostí patří **každá** hodnota z renderu, kterou efekt používá: props,
stav, i funkce a proměnné z těla komponenty. Když některou vynecháš, efekt
si nadále drží hodnotu z toho renderu, ve kterém se naposledy spustil — a ta už
neplatí. Tomu se říká [[zastaralá closure]].

:::live react predict
```jsx
import { useEffect, useState } from 'react';

export default function Stopky() {
  const [sekund, setSekund] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSekund(sekund + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>Běží {sekund} s</p>;
}
```
--question-- Co bude na obrazovce po pěti sekundách?
--option-- `Běží 5 s` — interval tiká každou sekundu.
--option*-- `Běží 1 s` — a dál se to nezmění.
--option-- `Běží 0 s`, protože `setSekund` nikdy neproběhne.
--why-- Efekt s prázdnými závislostmi proběhl jednou, a v jeho closure je `sekund` navždy `0`. Každé tiknutí tedy volá `setSekund(0 + 1)`. Po prvním tiknutí je stav `1`, další tiknutí ho zase nastaví na `1` a React už nic nepřekresluje. Oprava je funkce aktualizace: `setSekund((s) => s + 1)` — ta nepotřebuje `sekund` z renderu, takže smí zůstat i prázdný seznam závislostí.
:::

Pravidlo je jednoduché: **nejdřív napiš úplné závislosti, pak se podívej, která
tě otravuje, a zbav se jí v kódu** — funkcí aktualizace (`(s) => s + 1`),
přesunutím funkce dovnitř efektu, nebo `useEffectEvent` (viz dál). Nikdy ne tím,
že ji ze seznamu vyhodíš.

> [!TIP]
> Chybějící závislost ti řekne ESLint (`react-hooks/exhaustive-deps`) —
> v projektech z `nastroje-moduly-vite` ho máš zapnutý. Varování nevypínej
> komentářem, oprav kód.

:::check
Efekt používá `setSekund` a nic jiného z renderu. Jaké závislosti má správně mít?

### --answer--

`[sekund]`

#### --why--

Když efekt hodnotu `sekund` nečte, do závislostí nepatří — jen by efekt zbytečně restartovala každou sekundu (a časovač by se pokaždé zahodil).

### --correct--

`[]`

#### --why--

Funkce z `useState` má stabilní identitu, takže ji React do závislostí nepočítá. Efekt nečte nic dalšího, a proto může běžet jednou od namontování do odmontování.

### --answer--

`[setSekund]`

#### --why--

Napsat ji tam není chyba, ale nic to neřeší: `setSekund` je pořád tatáž funkce, takže se seznam chová jako prázdný. Odpověz tím, co je nejkratší správné.

### --see--

react-hloubka/useeffect-spravne#zavislosti-uplny-seznam-nebo-zastarala-closure
:::

## Úklid: co po sobě efekt uklidí

Návratová funkce efektu se spustí **před** každým dalším spuštěním efektu a ještě
jednou při odmontování komponenty. Uklízí se všechno, co efekt zapnul:

| efekt zapnul | úklid |
|---|---|
| `setInterval`, `setTimeout` | `clearInterval`, `clearTimeout` |
| `addEventListener` | `removeEventListener` se **stejnou** funkcí |
| spojení, `EventSource`, `WebSocket` | `zavri()`, `close()` |
| `IntersectionObserver`, `ResizeObserver` | `observer.disconnect()` |
| rozjeté načítání | `controller.abort()` nebo příznak „už mě nezajímá" |

V první ukázce lekce jsi to viděl na výpisech: přepnutí místnosti vypsalo
`zavírám obecná` a až potom `připojuji se k rady`.

:::check
Co se stane, když efekt s `setInterval` nemá úklid a komponenta se odmontuje?

### --answer--

Nic, prohlížeč časovač po odmontování zruší sám.

#### --why--

Prohlížeč o Reactu nic neví. Časovač zruší jedině `clearInterval`, nebo zavření stránky.

### --correct--

Interval tiká dál a jeho callback pracuje se stavem komponenty, která už není na obrazovce.

#### --why--

Odmontovaná komponenta nechává za sebou běžící časovač. V dobrém případě to jen plýtvá výkonem, v horším přepisuje data nebo vyvolává akce, které uživatel nečeká.

### --answer--

React vyhodí chybu „Can't perform a React state update on an unmounted component".

#### --why--

Tuhle hlášku React už nevypisuje (zmizela s verzí 18) — a proto je chybějící úklid o to zrádnější.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi
:::

## Souběh odpovědí při načítání

Když efekt něco načítá, může se ti vrátit odpověď na **starý** dotaz později než
na nový. Tomu se říká [[souběh odpovědí]] a v Reactu ho vyřeší úklid. V ukázce
trvá načtení Prahy 1200 ms a Brna 100 ms; klikni na **Brno** a dívej se, který
panel skončí se špatným městem:

:::live react
```jsx
import { useEffect, useState } from 'react';

function nactiMesto(id) {
  const doby = { 1: 1200, 2: 100 };
  const jmena = { 1: 'Praha', 2: 'Brno' };
  return new Promise((resolve) => setTimeout(() => resolve(jmena[id]), doby[id]));
}

function BezUklidu({ id }) {
  const [mesto, setMesto] = useState('načítám…');
  useEffect(() => {
    nactiMesto(id).then(setMesto);
  }, [id]);
  return <p className="karta karta--spatne">Bez úklidu: {mesto}</p>;
}

function SUklidem({ id }) {
  const [mesto, setMesto] = useState('načítám…');
  useEffect(() => {
    let neplatne = false;
    nactiMesto(id).then((nazev) => {
      if (!neplatne) setMesto(nazev);
    });
    return () => {
      neplatne = true;
    };
  }, [id]);
  return <p className="karta karta--dobre">S úklidem: {mesto}</p>;
}

export default function App() {
  const [id, setId] = useState(1);
  return (
    <div className="panel">
      <button onClick={() => setId(2)}>Zobrazit Brno</button>
      <BezUklidu id={id} />
      <SUklidem id={id} />
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
.panel {
  margin: 1.5rem;
  padding: 1.25rem;
  max-width: 22rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.12);
}
.karta {
  margin: 0.75rem 0 0;
  padding: 0.6rem 0.8rem;
  border-left: 4px solid;
  border-radius: 0.4rem;
  background: #f9fafb;
}
.karta--spatne {
  border-color: #d92d20;
}
.karta--dobre {
  border-color: #12b76a;
}
```
:::

Panel bez úklidu skončí u Prahy: odpověď na starý dotaz dorazila později a
přepsala novější výsledek. Panel s úklidem starou odpověď zahodí, protože si při
přepnutí nastavil `neplatne = true`. Zkus obě doby v `doby` prohodit a sleduj,
jak chyba zmizí — pasti, které závisí na časování, se v testech chytají nejhůř.

Na skutečný `fetch` se hodí `AbortController`; k němu ses dostal v sekci
[Asynchronní JavaScript](see:js-async/async-await#zruseni-abortcontroller-a-signal):

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/mesta/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setMesto)
    .catch((chyba) => {
      if (chyba.name !== 'AbortError') setChyba(chyba);
    });
  return () => controller.abort();
}, [id]);
```

:::check
Proč stačí v úklidu nastavit `neplatne = true` a nemusíš rozjeté načítání nijak zastavovat?

### --answer--

Protože `Promise` se nastavením proměnné zruší.

#### --why--

Promise zrušit nejde, jednou rozjeté načítání dobíhá. Příznak chyby přitom není to, že něco dobíhá, ale to, co se stane s výsledkem.

### --correct--

Protože výsledek starého dotazu pak nikdo nezapíše do stavu.

#### --why--

Chyba nevzniká tím, že stará odpověď dorazí, ale tím, že přepíše novější stav. Příznak („už mě nezajímá") to spolehlivě zastaví.

### --answer--

Protože React úklid spustí až po dokončení všech rozjetých dotazů.

#### --why--

React na nic nečeká: úklid proběhne hned při změně závislostí, tedy typicky dřív, než stará odpověď dorazí.

### --see--

react-hloubka/useeffect-spravne#soubeh-odpovedi-pri-nacitani
:::

## `useEffectEvent`: hodnota, která nemá restartovat efekt

Někdy efekt hodnotu **čte**, ale nechceš, aby se kvůli ní spouštěl znovu.
Klasika: při připojení k místnosti chceš zapsat do logu i zvolené téma —
ale změna tématu přece nemá přepojovat spojení. `useEffectEvent`
(v Reactu od verze 19.2) vytvoří funkci, která vždycky vidí **aktuální** hodnoty
a do závislostí nepatří:

:::live react
```jsx
import { useEffect, useEffectEvent, useState } from 'react';

export default function App() {
  const [mistnost, setMistnost] = useState('obecná');
  const [tema, setTema] = useState('světlé');

  const zapisPripojeni = useEffectEvent(() => {
    console.log('připojeno k ' + mistnost + ', téma ' + tema);
  });

  useEffect(() => {
    zapisPripojeni();
  }, [mistnost]);

  return (
    <div className="panel">
      <button onClick={() => setMistnost(mistnost === 'obecná' ? 'rady' : 'obecná')}>
        Přepnout místnost ({mistnost})
      </button>
      <button onClick={() => setTema(tema === 'světlé' ? 'tmavé' : 'světlé')}>
        Přepnout téma ({tema})
      </button>
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
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem;
  flex-wrap: wrap;
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
button:focus-visible {
  outline: 2px solid #f59f0a;
  outline-offset: 2px;
}
```
:::

Zkus zmáčknout **Přepnout téma** třikrát: v konzoli nic. Pak přepni místnost —
a v logu je nové téma. Funkce z `useEffectEvent` se smí volat jen z efektu (nebo
z jiné takové funkce), nesmí se předávat jako prop a do závislostí se nepíše.

:::check
Do závislostí efektu, který volá funkci z `useEffectEvent`, se ta funkce nepíše. Proč?

### --answer--

Protože má stabilní identitu jako `setState`.

#### --why--

Stabilní identitu naopak nemá, a to záměrně — mění se při každém renderu, aby se poznalo, když na ni někdo špatně spoléhá. Důvod, proč do závislostí nepatří, je jiný.

### --correct--

Protože není reaktivní: čte aktuální hodnoty a její změna nemá efekt restartovat.

#### --why--

`useEffectEvent` existuje právě proto, aby oddělil „na čem efekt stojí" (závislosti) od „co si přitom přečte" (neaktivní část). Proto ESLint dokonce varuje, když ji do závislostí napíšeš.

### --answer--

Protože ji React do závislostí přidá sám.

#### --why--

React závislosti nikdy nedoplňuje — seznam je vždycky ten, který napíšeš ty (nebo ti ho vloží React Compiler při překladu).

### --see--

react-hloubka/useeffect-spravne#useeffectevent-hodnota-ktera-nema-restartovat-efekt
:::

## StrictMode: mount → unmount → mount

Ve vývoji React každou komponentu po namontování hned odmontuje a namontuje
znovu. Efekt tak proběhne, uklidí se a proběhne podruhé. Je to stejný test jako
dvojí render, jen pro efekty: **efekt s úklidem tuhle zkoušku nepozná**, efekt
bez úklidu se prozradí.

:::live react
```jsx
import { StrictMode, useEffect, useState } from 'react';

function Odpocet() {
  const [tiku, setTiku] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTiku((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>Tiků: {tiku}</p>;
}

export default function App() {
  return (
    <StrictMode>
      <Odpocet />
    </StrictMode>
  );
}
```
:::

Zkus z efektu smazat řádek s `clearInterval` a sleduj, jak počítadlo začne
skákat po dvou — běží totiž dva intervaly, každý z jednoho namontování. Přesně
takhle se ve vývoji odhalí chybějící úklid, který by v produkci tichounce
zpomaloval aplikaci.

:::check
Co znamená, když se aplikace „chová divně jen ve vývoji" (dvojí oznámení, dvojí zápis), ale v produkci je v pořádku?

### --answer--

Že `StrictMode` je rozbitý a má se vypnout.

#### --why--

`StrictMode` nic nerozbíjí — jen hlasitě ukazuje, co je rozbité. Vypnout ho znamená chybu schovat, ne opravit.

### --correct--

Že některý efekt nemá úklid, nebo že render něco mění vně sebe.

#### --why--

Dvojí namontování se projeví jen tam, kde po sobě kód neuklidí nebo kde má render vedlejší efekt. V produkci chyba zůstává, jen se pozná až po delším používání.

### --answer--

Že se v produkci efekty nespouštějí.

#### --why--

Efekty se spouštějí v produkci úplně stejně — jen jednou místo dvakrát.

### --see--

react-hloubka/useeffect-spravne#strictmode-mount-unmount-mount
:::

## Typické chyby a pasti

### Prázdné závislosti jako rychlá oprava

> [!PITFALL]
> **`[]` proto, „aby se to spustilo jen jednou", vyrobí zastaralou closure.**
> Příznak: hodnota zaseknutá na první hodnotě (počítadlo na `1`, filtr na
> prázdném textu), a přitom všechno vypadá logicky. Oprava: nech úplné
> závislosti a odstraň příčinu — funkci aktualizace `(s) => s + 1`, funkci
> definovanou uvnitř efektu, nebo `useEffectEvent`.

### Efekt, který nastavuje stav bez podmínky

> [!PITFALL]
> **Efekt, který v každém běhu zapíše stav uvedený ve svých závislostech, je
> nekonečná smyčka.** Příznak: prohlížeč se zasekne, v konzoli se sype hláška
> `Maximum update depth exceeded`. Oprava: hodnotu spočítat při renderu, nebo
> závislosti a zápis rozpojit (zapisovat jen při skutečné změně).

### Posluchač odhlášený jinou funkcí

> [!PITFALL]
> **`removeEventListener` musí dostat tu samou funkci jako `addEventListener`.**
> `addEventListener('keydown', (e) => …)` a v úklidu druhá šipková funkce =
> posluchač se nikdy neodhlásí. Příznak: po několika otevřeních dialogu reaguje
> Escape několikrát, nebo reaguje i po zavření. Oprava: funkci pojmenovat
> v těle efektu (`const naKlavesu = (e) => …`) a použít v obou voláních.

### Data načtená v efektu bez ošetření chyby

> [!PITFALL]
> **`fetch` v efektu bez `catch` a bez stavu chyby znamená nekonečné „Načítám…".**
> Příznak: při vypnuté síti se nic neděje, v konzoli je neobsloužené zamítnutí.
> Oprava: tři stavy (data, načítání, chyba), nebo knihovna na dotazy (TanStack
> Query), ke které se dostaneš v sekci `react-aplikace`.

:::check
Kolegův efekt zapisuje do stavu `filtrovane` výsledek filtrování a má závislosti `[polozky, hledej, filtrovane]`. Co se stane po spuštění?

### --answer--

Efekt proběhne dvakrát a pak se zastaví.

#### --why--

Zastavil by se, kdyby nová hodnota byla podle `Object.is` shodná s předchozí. Nové pole z `filter` ale nikdy není shodné s tím minulým.

### --correct--

Efekt se bude spouštět pořád znovu, až React ohlásí `Maximum update depth exceeded`.

#### --why--

Efekt zapíše nové pole do `filtrovane`, tím se změní jeho vlastní závislost a efekt se spustí znovu. Odvozená hodnota do stavu nepatří.

### --answer--

Nic zlého — React zápis do stavu uvnitř efektu ignoruje.

#### --why--

Zápis do stavu v efektu je naprosto legitimní (třeba po načtení dat). Problém je v tom, že se zapisovaná hodnota objevila v závislostech.

### --see--

react-hloubka/useeffect-spravne#typicke-chyby-a-pasti
:::

:::explain
Vysvětli vlastními slovy, jak poznáš, že kód patří do efektu — a jak, že do handleru nebo do renderu.

## --model--

Do efektu patří jen synchronizace s něčím mimo React: spojení, časovač, posluchač na `window`, titulek stránky. Poznám to tak, že se ptám „musí se tohle stát, protože obrazovka teď zobrazuje tenhle stav?". Když je odpověď „ne, musí se to stát, protože uživatel na něco klikl", patří to do handleru. A když jde jen o hodnotu spočítanou ze stavu a props, patří to do renderu — žádný efekt a žádný druhý stav. Efekt navíc znamená render navíc a nutnost psát úklid a závislosti.

## --checklist--

- Efekt je na synchronizaci s vnějším systémem, ne na „udělej to po vykreslení".
- Následek akce uživatele patří do obsluhy události.
- Hodnota spočítaná ze stavu a props patří do renderu (případně do `useMemo`).
- Každý efekt, který něco zapnul, to musí v úklidu vypnout.
:::

## Kde to najdeš v MDN

- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) —
  zrušení rozjetého `fetch` v úklidu efektu, včetně `AbortError`.
- [EventTarget: removeEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) —
  proč se musí odhlašovat tatáž funkce, kterou jsi přihlásil.
- [Window: matchMedia()](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) —
  media dotaz z JavaScriptu, typický vnější systém pro efekt.
- [clearInterval()](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval) —
  co přesně dělá úklid časovače a co se stane, když chybí.

> [!NOTE]
> Dokumentace Reactu k této lekci: [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects),
> [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
> a [useEffectEvent](https://react.dev/reference/react/useEffectEvent).

# --questions--

## --question--

Co vypíše konzole po kliknutí na tlačítko, které změní `mistnost` z `obecná` na `rady`? Napiš řádky pod sebe.

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

Úklid dostane hodnoty z toho renderu, ve kterém se efekt spustil — proto se odpojuje `obecná`. Až potom se spustí nový efekt s novou místností. Pořadí je vždycky úklid, pak efekt.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

## --question--

Komponenta má stav `hledej` a `vysledky` a efekt, který po každé změně `hledej` filtruje pole `polozky` a zapisuje výsledek do `vysledky`. Jak se to má napsat?

### --answer--

Nechat efekt, ale přidat podmínku `if (vysledky.length !== nove.length)`.

#### --why--

Podmínka nekonečnou smyčku zalepí, ale render navíc a druhý zdroj pravdy zůstanou. Navíc podmínka neplatí, kdykoli se změní obsah bez délky.

### --correct--

Zrušit stav `vysledky` a filtrovat při renderu (`const vysledky = filtrovat(polozky, hledej)`).

#### --why--

Odvozená hodnota do stavu nepatří. Jeden zdroj pravdy, jeden render, žádný efekt a žádné závislosti, které se dají zapomenout.

### --answer--

Vyhodit `hledej` ze závislostí, aby se efekt spouštěl jen jednou.

#### --why--

Tím vznikne zastaralá closure: efekt bude navždy filtrovat podle prvního hledaného textu.

### --see--

react-hloubka/useeffect-spravne#kdy-efekt-nepotrebujes

## --question--

Doplň chybějící část efektu tak, aby posluchač po odmontování zmizel. Napiš jen ten jeden řádek, který v kódu chybí (včetně `return`).

```jsx
useEffect(() => {
  const naZmenu = () => setSirka(window.innerWidth);
  window.addEventListener('resize', naZmenu);
  // sem
}, []);
```

### --expected--

return () => window.removeEventListener('resize', naZmenu);

### --accept--

return () => { window.removeEventListener('resize', naZmenu); };

### --why--

Úklid se vrací z efektu jako funkce a odhlašuje **tu samou** funkci `naZmenu`. Kdybys tam napsal novou šipkovou funkci, posluchač by na `window` zůstal navždy.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

## --question--

Efekt otevírá spojení a v těle používá `tema` jen do logu. Které řešení nechá spojení při změně tématu na pokoji, aniž by log lhal? Napiš jméno hooku.

### --expected--

useEffectEvent

### --why--

`useEffectEvent` oddělí neaktivní část efektu: funkce z něj vidí aktuální `tema`, ale do závislostí nepatří, takže změna tématu spojení nepřepojí. Vyhodit `tema` ze závislostí by fungovalo jen do chvíle, kdy ho uživatel změní — pak by log ukazoval staré téma.

### --see--

react-hloubka/useeffect-spravne#useeffectevent-hodnota-ktera-nema-restartovat-efekt
