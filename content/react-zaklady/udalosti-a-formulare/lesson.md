# Události a formuláře

Přihlášení, hledání, filtr, objednávka, komentář — všude, kde uživatel něco píše nebo vybírá, potkáš tenhle vzor. V Reactu se formuláře píšou jinak než v čistém DOM: nečteš, co je v poli napsané, ale **říkáš poli, co v něm má být**.

:::check pretest
Co myslíš, že se stane, když tlačítku napíšeš `onClick={smazVse()}`?

### --answer--

Nic, dokud uživatel neklikne. Závorky nevadí.

#### --why--

Závorky v JavaScriptu znamenají volání. Zkus si vzpomenout, co se stane, když funkci zavoláš.

### --correct--

Funkce se zavolá hned při vykreslení a Reactu se předá její návratová hodnota.

#### --why--

Přesně tak. Podrobně si to projdeme hned v první části.

### --answer--

React závorky pozná a zavolá funkci až při kliknutí.

#### --why--

React žádnou magii nedělá — `onClick` jen dostane hodnotu výrazu ve složených závorkách.
:::

:::check pretest
Do formulářového pole napíšeš `value={jmeno}`, kde `jmeno` je stav. Co se stane, když do pole uživatel začne psát a ty nic dalšího nedoplníš?

### --expected-- ignore-case

nic se nenapíše

### --accept--

nic
pole zůstane prázdné
nepůjde do něj psát
:::

## Obsluha události je funkce, kterou předáváš

Vlastnosti jako `onClick`, `onChange` nebo `onSubmit` čekají **funkci**. React si ji schová a zavolá ji, až událost nastane. Když za jméno funkce napíšeš závorky, zavoláš ji sám — hned při renderu.

:::live react predict
```jsx
export default function Kosik() {
  function vypis() {
    console.log('kliknuto');
    return 'hotovo';
  }

  return (
    <div>
      <button onClick={vypis}>Správně</button>
      <button onClick={vypis()}>Se závorkami</button>
    </div>
  );
}
```
--question-- Co bude v konzoli hned po vykreslení stránky, ještě než na cokoli klikneš?
--option-- Nic, dokud někam neklikneš.
--option*-- Jednou „kliknuto" — od druhého tlačítka.
--option-- Dvakrát „kliknuto" — od obou tlačítek.
--why-- `onClick={vypis}` předá funkci, `onClick={vypis()}` ji zavolá při renderu a Reactu předá její výsledek (`'hotovo'`). Proto se do konzole vypíše jedno „kliknuto" hned a na druhé tlačítko pak klikání nic nedělá. Kdyby funkce měnila stav, skončilo by to hláškou `Too many re-renders`.
:::

Když potřebuješ obsluze předat argument, obal volání do šipkové funkce: `onClick={() => smaz(ukol.id)}`. Vyrobíš tím **novou funkci**, která se zavolá až při kliknutí a `smaz` uvnitř si pamatuje správné `id`.

> [!REMEMBER]
> **`onClick={smaz}` předává funkci, `onClick={smaz()}` ji volá.** Potřebuješ-li argument, použij `onClick={() => smaz(id)}`.

:::check
Napiš, jak tlačítku předáš obsluhu, která zavolá `pridej('mléko')` až po kliknutí.

### --expected--

onClick={() => pridej('mléko')}

### --accept--

onClick={() => pridej("mléko")}
onClick={() => { pridej('mléko'); }}

### --why--

Šipková funkce se vyrobí při renderu, ale její tělo se spustí až při kliknutí. Bez ní bys funkci zavolal hned.

### --see--

react-zaklady/udalosti-a-formulare#obsluha-udalosti-je-funkce-kterou-predavas
:::

## Co obsluha dostane: objekt události

React předá obsluze objekt události — je to tentýž druh objektu, jaký znáš z [práce s událostmi v DOM](see:js-dom/udalosti#target-a-currenttarget), jen zabalený tak, aby se choval stejně ve všech prohlížečích. Zajímají tě hlavně dvě věci: `event.target` (prvek, na kterém se událost stala) a u polí `event.target.value` (co je v poli napsané).

:::live react
```jsx
import { useState } from 'react';

export default function Lupa() {
  const [posledni, setPosledni] = useState('nic');

  function zapamatuj(event) {
    setPosledni(`${event.type} na <${event.target.tagName.toLowerCase()}>`);
  }

  return (
    <div className="box" onClick={zapamatuj}>
      <p>Klikni na cokoli uvnitř rámečku.</p>
      <button>Tlačítko</button>
      <p className="mala">Poslední událost: {posledni}</p>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .5rem; justify-items: start; max-width: 22rem; padding: 1rem; background: #fff; border: 1px solid #cbd5e1; border-radius: .8rem; }
.box p { margin: 0; }
.mala { color: #64748b; font-size: .85rem; }
button { padding: .4rem .9rem; border: 0; border-radius: 999px; background: #0f766e; color: #fff; font: inherit; cursor: pointer; }
```
:::

Zkus kliknout na odstavec a pak na tlačítko a sleduj, jak se `target` mění. Posluchač je přitom jediný — na rámečku. React posluchače nevěší na každý prvek zvlášť, takže [delegace](see:js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam) funguje sama od sebe.

:::check
V obsluze `onChange` textového pole chceš zjistit, co uživatel napsal. Odkud to přečteš?

### --expected--

event.target.value

### --accept--

e.target.value
z event.target.value

### --why--

`event.target` je prvek, na kterém událost nastala, a `value` je jeho aktuální obsah. Stejné to bylo i v čistém DOM.

### --see--

react-zaklady/udalosti-a-formulare#co-obsluha-dostane-objekt-udalosti
:::

## Řízené pole

V čistém DOM je pravda **v poli**: uživatel píše a ty se pak ptáš `input.value`. V Reactu se to obrací. Pole dostane `value` ze stavu a při každém úhozu pošle novou hodnotu zpátky do stavu. Takovému poli se říká [[řízené pole]].

:::live react
```jsx
import { useState } from 'react';

export default function Hledani() {
  const [dotaz, setDotaz] = useState('');
  const knihy = ['Babička', 'Hordubal', 'Bílá nemoc', 'Krakatit', 'Saturnin'];
  const nalezene = knihy.filter((kniha) => kniha.toLowerCase().includes(dotaz.toLowerCase()));

  return (
    <div className="box">
      <label className="pole">
        Hledat v knihovně
        <input value={dotaz} onChange={(event) => setDotaz(event.target.value)} placeholder="Např. Krakatit" />
      </label>
      <p className="mala">{nalezene.length} z {knihy.length} knih</p>
      <ul>
        {nalezene.map((kniha) => (
          <li key={kniha}>{kniha}</li>
        ))}
      </ul>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .6rem; max-width: 22rem; }
.pole { display: grid; gap: .25rem; font-size: .9rem; color: #475569; }
input { padding: .5rem .7rem; border: 1px solid #cbd5e1; border-radius: .5rem; font: inherit; }
ul { margin: 0; padding-left: 1.2rem; }
.mala { margin: 0; color: #64748b; font-size: .85rem; }
```
:::

Zkus do pole psát a sleduj, jak se seznam zužuje při každém písmenu. Pak zkus `value={dotaz}` smazat — psát půjde dál, ale stav se bude měnit jen podle `onChange`; a zkus naopak smazat `onChange` — pole zůstane prázdné, ať píšeš co píšeš, a React si do konzole postěžuje, že jsi zapomněl obsluhu.

> [!REMEMBER]
> **U řízeného pole je pravda ve stavu. Pole jen ukazuje, co ve stavu je, a každý úhoz posílá zpátky.** Proto jde obsah pole kdykoli změnit i odjinud — tlačítkem, po odeslání, po načtení dat.

:::live react predict
```jsx
import { useState } from 'react';

export default function Formular() {
  const [email, setEmail] = useState('eva@example.com');

  return (
    <div className="box">
      <input value={email} />
      <p>Ve stavu je: {email}</p>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; }
.box { display: grid; gap: .5rem; max-width: 20rem; }
input { padding: .5rem; border: 1px solid #cbd5e1; border-radius: .5rem; font: inherit; }
```
--question-- Co se stane, když v náhledu začneš do pole psát?
--option-- Text se normálně napíše, jen se nezmění odstavec pod polem.
--option*-- Do pole nejde napsat nic — obsah se hned vrátí na hodnotu ze stavu.
--option-- Pole se vyprázdní a stav se nastaví na prázdný řetězec.
--why-- Pole s `value` bez `onChange` je jen ke čtení: React po každém úhozu vykreslí znovu tu hodnotu, kterou má ve stavu. Do konzole k tomu napíše `You provided a `value` prop to a form field without an `onChange` handler`. Buď dodej `onChange`, nebo (když má být pole opravdu neměnné) napiš `readOnly`.
:::

:::check
Textové pole má `value={jmeno}` a `onChange={(event) => setJmeno(event.target.value)}`. Kde je po deseti napsaných písmenech uložená pravda o obsahu pole?

### --expected-- ignore-case

ve stavu

### --accept--

ve stavu jmeno
ve stavu komponenty

### --why--

Pole při každém úhozu pošle hodnotu do stavu a React mu ji vzápětí vrátí zpátky jako `value`. V DOM je jen odraz stavu.

### --see--

react-zaklady/udalosti-a-formulare#rizene-pole
:::

## Výběr, zaškrtávátko a číslo

Ostatní pole fungují stejně, jen se liší vlastnost, kterou řídíš:

| pole | co řídí stav | co čteš v obsluze |
|---|---|---|
| `<input type="text">`, `<textarea>` | `value` | `event.target.value` |
| `<select>` | `value` na `<select>` (ne `selected` na `<option>`) | `event.target.value` |
| `<input type="checkbox">` | `checked` | `event.target.checked` |
| `<input type="number">` | `value` | `event.target.value` — **je to text**, ne číslo |

:::live react
```jsx
import { useState } from 'react';

const ceny = { maly: 120, stredni: 160, velky: 190 };

export default function Objednavka() {
  const [velikost, setVelikost] = useState('stredni');
  const [sSebou, setSSebou] = useState(false);
  const [kusy, setKusy] = useState(1);
  const cena = ceny[velikost] * kusy + (sSebou ? 5 : 0);

  return (
    <div className="box">
      <label className="pole">
        Velikost
        <select value={velikost} onChange={(event) => setVelikost(event.target.value)}>
          <option value="maly">Malá káva</option>
          <option value="stredni">Střední káva</option>
          <option value="velky">Velká káva</option>
        </select>
      </label>
      <label className="pole">
        Kusů
        <input type="number" min="1" value={kusy} onChange={(event) => setKusy(Number(event.target.value))} />
      </label>
      <label className="zaskrtnuti">
        <input type="checkbox" checked={sSebou} onChange={(event) => setSSebou(event.target.checked)} />
        Kelímek s sebou (+5 Kč)
      </label>
      <p className="cena">{cena} Kč</p>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .6rem; max-width: 18rem; padding: 1rem 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.pole { display: grid; gap: .25rem; font-size: .9rem; color: #475569; }
.zaskrtnuti { display: flex; align-items: center; gap: .5rem; font-size: .9rem; }
select, input { padding: .45rem .6rem; border: 1px solid #cbd5e1; border-radius: .5rem; font: inherit; }
.zaskrtnuti input { inline-size: 1.1rem; block-size: 1.1rem; accent-color: #0f766e; }
.cena { margin: 0; font-size: 1.6rem; font-weight: 800; color: #0f766e; }
```
:::

Zkus změnit počet kusů a sleduj cenu; pak zkus z obsluhy počtu odstranit `Number(...)` a napsat do pole dvojku — z ceny bude nesmysl, protože `'2'` krát číslo se sice spočítá, ale sčítání s poplatkem už spojí řetězce.

:::check
Zaškrtávátko má stav `souhlas`. Kterou vlastnost mu nastavíš a co přečteš v obsluze?

### --expected--

checked a event.target.checked

### --accept--

checked, event.target.checked
checked={souhlas} a event.target.checked

### --why--

`value` u zaškrtávátka nese hodnotu, která se odesílá, ne stav zaškrtnutí. Ten je v `checked`.

### --see--

react-zaklady/udalosti-a-formulare#vyber-zaskrtavatko-a-cislo
:::

## Odeslání formuláře

Formulář má vlastní událost `onSubmit`. Přijde i při stisku Enteru v poli, takže je to jediné správné místo pro „odeslání" — ne `onClick` na tlačítku. Výchozí chování prohlížeče (odejít na jinou adresu) zastavíš pomocí `event.preventDefault()`.

:::live react
```jsx
import { useState } from 'react';

export default function Prihlaska() {
  const [jmeno, setJmeno] = useState('');
  const [prihlaseni, setPrihlaseni] = useState([]);

  function odesli(event) {
    event.preventDefault();
    if (jmeno.trim() === '') return;
    setPrihlaseni([...prihlaseni, jmeno.trim()]);
    setJmeno('');
  }

  return (
    <div className="box">
      <form onSubmit={odesli} className="formular">
        <label className="pole">
          Jméno na seznam
          <input value={jmeno} onChange={(event) => setJmeno(event.target.value)} />
        </label>
        <button type="submit" disabled={jmeno.trim() === ''}>Přihlásit</button>
      </form>
      <ul>
        {prihlaseni.map((kdo, poradi) => (
          <li key={`${kdo}-${poradi}`}>{kdo}</li>
        ))}
      </ul>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .75rem; max-width: 22rem; }
.formular { display: grid; gap: .5rem; justify-items: start; }
.pole { display: grid; gap: .25rem; inline-size: 100%; font-size: .9rem; color: #475569; }
input { padding: .5rem .7rem; border: 1px solid #cbd5e1; border-radius: .5rem; font: inherit; }
button { padding: .5rem 1rem; border: 0; border-radius: 999px; background: #0f766e; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
button:disabled { opacity: .5; cursor: not-allowed; }
ul { margin: 0; padding-left: 1.2rem; }
```
:::

Zkus napsat jméno a stisknout Enter — formulář se odešle stejně jako kliknutím. Pak zkus smazat `event.preventDefault()`: stránka se pokusí odejít a náhled se přenačte i se stavem.

**Vyprázdnění pole po odeslání** je hezky vidět na řízeném poli: stačí nastavit stav na prázdný řetězec a pole se vyprázdní samo. V čistém DOM bys musel sáhnout na `input.value`.

> [!NOTE]
> React 19 umí předat funkci rovnou do `action` formuláře (`<form action={ulozit}>`); funkce dostane `FormData` a React sám hlídá, jestli akce běží. Stav takové akce sleduje hook `useActionState`. Hodí se hlavně při odesílání na server, takže se k tomu vrátíme v sekcích *React aplikace* a *Next.js*. Do té doby stačí `onSubmit`.

:::check
Proč se odeslání formuláře obsluhuje na `<form onSubmit>` a ne na `<button onClick>`?

### --answer--

Protože `onClick` na tlačítku v Reactu nefunguje.

#### --why--

Funguje, jen zachytí míň případů, než potřebuješ.

### --correct--

Protože `onSubmit` zachytí i odeslání Enterem v poli.

#### --why--

Formulář se dá odeslat klávesnicí bez kliknutí na tlačítko. `onSubmit` je jediné místo, kam přijdou obě cesty.

### --answer--

Protože jen `onSubmit` umí `event.preventDefault()`.

#### --why--

`preventDefault` funguje u obou událostí. Rozdíl je v tom, co všechno tu událost vyvolá.

### --see--

react-zaklady/udalosti-a-formulare#odeslani-formulare
:::

## Zvednutí stavu

Dvě komponenty potřebují tutéž hodnotu: filtr ji nastavuje, seznam se podle ní vykresluje. Stav proto nepatří ani do jedné — patří do **nejbližšího společného rodiče**, který ho pošle oběma dolů. Tomu se říká [[zvednutí stavu]] (*lifting state up*).

Rodič posílá potomkovi dvě věci: **hodnotu** a **funkci, kterou o změnu požádá**. Potomek pak žádnou vlastní paměť nemá.

:::live react
```jsx
import { useState } from 'react';

const ukoly = [
  { id: 1, text: 'Koupit mouku', hotovo: true },
  { id: 2, text: 'Odvézt kolo do servisu', hotovo: false },
  { id: 3, text: 'Zavolat pojišťovně', hotovo: false },
];

function Prepinac({ hodnota, onZmena }) {
  return (
    <label className="zaskrtnuti">
      <input type="checkbox" checked={hodnota} onChange={(event) => onZmena(event.target.checked)} />
      Skrýt hotové
    </label>
  );
}

function SeznamUkolu({ polozky }) {
  if (polozky.length === 0) return <p className="mala">Nic tu není.</p>;
  return (
    <ul>
      {polozky.map((ukol) => (
        <li key={ukol.id}>{ukol.hotovo ? '✓ ' : '• '}{ukol.text}</li>
      ))}
    </ul>
  );
}

export default function Ukoly() {
  const [skryvat, setSkryvat] = useState(false);
  const videt = skryvat ? ukoly.filter((ukol) => !ukol.hotovo) : ukoly;

  return (
    <div className="box">
      <Prepinac hodnota={skryvat} onZmena={setSkryvat} />
      <SeznamUkolu polozky={videt} />
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .6rem; max-width: 22rem; }
.zaskrtnuti { display: flex; align-items: center; gap: .5rem; font-size: .9rem; }
.zaskrtnuti input { inline-size: 1.1rem; block-size: 1.1rem; accent-color: #0f766e; }
ul { margin: 0; padding-left: 1.2rem; }
.mala { color: #64748b; font-size: .85rem; }
```
:::

Zkus přesunout `useState` z `Ukoly` do `Prepinac` — přepínač bude fungovat, ale seznam se o změně nedozví. Zkus také přejmenovat prop `onZmena` na `onPrepni`: jméno je na tobě, `on…` je jen zvyk, podle kterého se pozná, že v propu přijde funkce.

> [!REMEMBER]
> **Stav patří do nejbližšího společného rodiče všech komponent, které ho potřebují.** Dolů jde hodnota a funkce, která ji umí změnit; nahoru nejde nic jiného než volání té funkce.

:::check
Potomek dostane z rodiče prop `hodnota` a prop `onZmena`. Co z toho si smí sám přepsat?

### --expected-- ignore-case

nic

### --accept--

ani jedno
nic, props patří rodiči

### --why--

Props patří rodiči. Potomek hodnotu jen zobrazí a když se má změnit, zavolá funkci, kterou dostal — rozhodnutí i paměť zůstávají nahoře.

### --see--

react-zaklady/udalosti-a-formulare#zvednuti-stavu
:::

:::explain
Vysvětli vlastními slovy, proč se stav „zvedá" do rodiče, místo aby si ho každá komponenta držela sama.

## --model--

Stav drží ten, kdo ho potřebuje celý. Když ho potřebují dvě komponenty — jedna ho mění, druhá se podle něj vykresluje — a každá by měla vlastní, měly by dvě různé pravdy a rozešly by se. Proto ho dám do nejbližšího společného rodiče a dolů posílám dvě věci: aktuální hodnotu a funkci, kterou potomek požádá o změnu. Potomek tím zůstane hloupý: nic si nepamatuje, jen zobrazuje, co dostal, a hlásí, co se stalo. Díky tomu ho můžu použít na deseti místech s deseti různými rodiči.

## --checklist--

- Dvě komponenty potřebují tutéž hodnotu.
- Vlastní stav v každé z nich by znamenal dvě pravdy.
- Stav patří do nejbližšího společného rodiče.
- Dolů jde hodnota a funkce na její změnu.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Pole s `value` bez `onChange`.** Do pole nejde psát a v konzoli stojí `You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field.` Oprava: dodej `onChange`, nebo pole označ `readOnly`.

> [!PITFALL]
> **`value={undefined}` na začátku.** Když stav založíš jako `useState()` bez argumentu, je pole nejdřív neřízené a po prvním úhozu se stane řízeným — React na to upozorní hláškou `A component is changing an uncontrolled input to be controlled.` Oprava: počáteční hodnota `''`.

> [!PITFALL]
> **Číslo z pole je text.** `event.target.value` u `type="number"` vrátí `'2'`. Příznak: `kusy + 1` dá `'21'`. Oprava: `Number(event.target.value)`, nebo počítat až na konci s převodem.

> [!PITFALL]
> **Chybějící `event.preventDefault()` v `onSubmit`.** Prohlížeč formulář odešle po svém, stránka se přenačte a stav zmizí. Příznak: náhled „blikne" a všechno je pryč.

> [!PITFALL]
> **`onChange` v Reactu není `change` z DOM.** V čistém DOM se `change` u textového pole ozve až po opuštění pole; React ho posílá při každém úhozu (chová se jako `input`). Počítej s tím, že obsluha běží při každém písmenu.

:::check
Do pole s `type="number"` uživatel napíše 3 a ty v obsluze uložíš `event.target.value` do stavu `kusy`. Co vyjde z výrazu `kusy + 1`?

### --expected--

31

### --accept--

'31'
"31"
řetězec 31

### --why--

`value` je vždycky text, i u číselného pole. `'3' + 1` je spojení řetězců, ne součet. Proto se hodnota převádí hned v obsluze přes `Number(...)`.

### --see--

react-zaklady/udalosti-a-formulare#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [`<input>` — form input element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) — přehled typů polí a jejich atributů (`min`, `required`, `placeholder`).
- [HTMLFormElement: submit event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event) — kdy formulář událost vyvolá a co dělá výchozí chování.
- [Event: preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) — co přesně „výchozí chování" znamená u odkazu, formuláře a klávesnice.

> [!NOTE]
> Reactová stránka k formulářům je [react.dev/learn/reacting-to-input-with-state](https://react.dev/learn/reacting-to-input-with-state), zvednutí stavu má vlastní kapitolu [react.dev/learn/sharing-state-between-components](https://react.dev/learn/sharing-state-between-components).

# --questions--

## --question--

Napiš, čím doplníš obsluhu, aby se do stavu `poznamka` dostalo, co uživatel napsal do textového pole:

```jsx
<textarea value={poznamka} onChange={(event) => setPoznamka(/* sem */)} />
```

### --expected--

event.target.value

### --accept--

e.target.value

### --why--

`event.target` je prvek, na kterém se událost stala, `value` jeho aktuální obsah. U zaškrtávátka by na stejném místě bylo `checked`.

### --see--

react-zaklady/udalosti-a-formulare#rizene-pole

## --question--

Komponenta `Filtr` má tlačítka kategorií, komponenta `Vypis` podle kategorie vykresluje zboží. Kam patří stav se zvolenou kategorií?

### --answer--

Do komponenty `Filtr`, protože ta ho mění.

#### --why--

Kdyby ho měl `Filtr`, výpis by se o změně nedozvěděl — sourozenci k sobě nevidí.

### --correct--

Do nejbližšího společného rodiče obou komponent.

#### --why--

Rodič ho pošle dolů oběma: `Vypis` dostane hodnotu, `Filtr` k tomu ještě funkci, kterou ji změní.

### --answer--

Do obou, aby ho každá měla po ruce.

#### --why--

Dvě kopie téže pravdy se dřív nebo později rozejdou. Proto se stav drží na jednom místě.

### --see--

react-zaklady/udalosti-a-formulare#zvednuti-stavu

## --question--

Ve formuláři s polem na jméno chybí `event.preventDefault()`. Uživatel napíše jméno a stiskne Enter. Co uvidí?

### --expected-- ignore-case

stránka se přenačte

### --accept--

stránka se znovu načte a stav se ztratí
prohlížeč formulář odešle a stránka se obnoví
přenačtení stránky

### --why--

Výchozí chování formuláře je odeslat data na adresu a načíst odpověď. V aplikaci, která běží v prohlížeči, tím zmizí celý stav — proto se výchozí chování ruší.

### --see--

react-zaklady/udalosti-a-formulare#odeslani-formulare

## --question--

Co je špatně na zápisu `<input type="checkbox" value={souhlas} onChange={(event) => setSouhlas(event.target.value)} />`?

### --answer--

Nic, jen je zbytečně dlouhý.

#### --why--

Zápis vypadá rozumně, ale zaškrtávátko se řídí jinou vlastností než textové pole.

### --correct--

Zaškrtnutí se řídí vlastností `checked` a čte se z `event.target.checked`; `value` u zaškrtávátka znamená něco jiného.

#### --why--

`value` je hodnota, která by se odeslala s formulářem. Jestli je políčko zaškrtnuté, říká `checked`.

### --answer--

Chybí tam `preventDefault`, bez něj se stránka přenačte.

#### --why--

`preventDefault` patří k odeslání formuláře, ne ke změně pole.

### --see--

react-zaklady/udalosti-a-formulare#vyber-zaskrtavatko-a-cislo
