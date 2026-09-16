# useRef a DOM

Do formuláře na přidání poznámky napíšeš text, zmáčkneš Enter — a kurzor ti
z políčka vyskočí. V každé slušné aplikaci zůstane tam, kde byl, abys mohl psát
dál. Jenže „dej fokus do toho políčka" není nic, co by se dalo spočítat z dat.
Tahle lekce je o tom, jak si v Reactu sáhnout na skutečný prvek ve stránce —
a kde je hranice, za kterou už si sahat nemáš.

:::check pretest
V komponentě je `const pocetRef = useRef(0);` a tlačítko, jehož obsluha udělá
`pocetRef.current = pocetRef.current + 1` a nic víc. Co uvidí uživatel v odstavci,
který vypisuje `{pocetRef.current}`, po třech kliknutích?

### --answer--

Trojku — hodnota v refu se přece zvýšila třikrát.

#### --why--

Hodnota v refu se opravdu zvýšila. Otázka je, jestli se kvůli tomu React obtěžoval spustit komponentu znovu a přepsat odstavec.

### --correct--

Nulu, dokud stránku něco jiného nepřekreslí.

#### --why--

Ref mění hodnotu potichu. Proč to tak je — a kdy se to hodí — je celá první polovina lekce.

### --answer--

Nulu, protože zápis do `ref.current` React zakazuje.

#### --why--

Zápis do `current` je naopak jediný správný způsob, jak refu měnit obsah. Jen z něj neplyne to, co bys čekal od stavu.
:::

:::check pretest
`const poleRef = useRef(null);` a v JSX `<input ref={poleRef} />`. Co je
v `poleRef.current` v tělě komponenty **při prvním** renderu, ještě než se
cokoli objeví na stránce? Odpověz jedním slovem.

### --expected-- ignore-case

null

### --why--

Ref na prvek naplňuje React až v commitu, tedy potom, co prvek vznikne v DOMu. V renderu, který ten prvek teprve popisuje, tam žádný prvek být nemůže.
:::

Ref je krabička s jedinou přihrádkou `current`. React ji vytvoří při prvním
renderu a od té chvíle je to **pořád tatáž krabička** — přežije každý další
render. Co do ní dáš, to v ní zůstane; a když obsah vyměníš, React se nic nedozví.

> [!REMEMBER]
> **Ref je schránka, kterou React nesleduje: změna `ref.current` nevyvolá render.**
> Stav je opak — ten React sleduje a při změně překresluje. Do stavu patří
> všechno, co je vidět na obrazovce; do refu to, co má jen přežít render.

## Ref na prvek: fokus, scroll a měření

Předáš ref do atributu `ref` nějakého prvku a React ti do `current` uloží
skutečný uzel DOMu — ten samý, jaký bys dostal z `querySelector`. Pak na něm smíš
volat metody prohlížeče, které React nenabízí: `focus()`, `scrollIntoView()`,
`getBoundingClientRect()`, `play()` u videa, `showModal()` u dialogu.

Napiš poznámku a zmáčkni **Přidat** — kurzor zůstane v políčku:

:::live react
```jsx
import { useRef, useState } from 'react';

export default function Poznamky() {
  const [poznamky, setPoznamky] = useState(['Zavolat do tiskárny', 'Poslat nabídku Konečné']);
  const [text, setText] = useState('');
  const poleRef = useRef(null);

  function pridat(udalost) {
    udalost.preventDefault();
    if (!text.trim()) return;
    setPoznamky([...poznamky, text.trim()]);
    setText('');
    poleRef.current.focus();
  }

  return (
    <div className="blok">
      <h2>Poznámky ke schůzce</h2>
      <ul>
        {poznamky.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <form onSubmit={pridat}>
        <input
          ref={poleRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nová poznámka"
        />
        <button>Přidat</button>
      </form>
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
.blok {
  margin: 1.5rem;
  padding: 1.25rem 1.5rem;
  max-width: 26rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.12);
}
h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}
ul {
  margin: 0 0 1rem;
  padding-left: 1.1rem;
  color: #475467;
}
form {
  display: flex;
  gap: 0.5rem;
}
input {
  flex: 1;
  padding: 0.5rem 0.65rem;
  border: 1px solid #cfd4dc;
  border-radius: 0.5rem;
  font: inherit;
}
input:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 1px;
}
button {
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
```
:::

Zkus řádek `poleRef.current.focus();` smazat a přidat další poznámku — kurzor
z políčka po odeslání zmizí a musíš do něj znovu kliknout.

> [!TIP]
> Fokus, scroll, měření a přehrávání médií — to jsou čtyři legitimní důvody,
> proč si na prvek sáhnout. Všechno ostatní (text, třídy, atributy, viditelnost)
> popiš v JSX a nech na Reactu.

:::check
Proč se `poleRef.current.focus()` volá v obsluze odeslání, a ne v tělě komponenty hned za `const poleRef = useRef(null)`?

### --expected--

v tělě komponenty je ref ještě prázdný

### --accept--

protože ref.current je při renderu ještě null
v renderu prvek ještě neexistuje
render je čistý, fokus je vedlejší efekt

### --why--

Tělo komponenty běží **před** tím, než React prvky vytvoří a naplní refy — v prvním renderu by tam bylo `null` a kód by spadl na `Cannot read properties of null`. Navíc je nastavení fokusu vedlejší efekt: v čistém renderu nemá co dělat.

### --see--

react-hloubka/useref-a-dom#ref-na-prvek-fokus-scroll-a-mereni
:::

## Ref jako schránka mimo render

Druhé použití refu nemá s DOMem nic společného: je to místo pro hodnotu, kterou
si komponenta potřebuje pamatovat mezi rendery, ale nikdo ji nevidí. Typicky
**id běžícího časovače**, předchozí hodnota nebo počet pokusů.

Ve stopkách je `sekund` ve stavu (vidí se), `idRef` v refu (nevidí se). Zkus
si je prohodit a uvidíš proč:

:::live react
```jsx
import { useRef, useState } from 'react';

export default function Stopky() {
  const [desetin, setDesetin] = useState(0);
  const idRef = useRef(null);
  const bezi = idRef.current !== null;

  function start() {
    if (idRef.current !== null) return;
    idRef.current = setInterval(() => setDesetin((d) => d + 1), 100);
    setDesetin((d) => d);
  }

  function stop() {
    clearInterval(idRef.current);
    idRef.current = null;
    setDesetin((d) => d);
  }

  return (
    <div className="stopky">
      <p className="cas">{(desetin / 10).toFixed(1)} s</p>
      <button onClick={start} disabled={bezi}>Start</button>
      <button onClick={stop} disabled={!bezi}>Stop</button>
      <button onClick={() => setDesetin(0)}>Vynulovat</button>
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
.stopky {
  margin: 1.5rem;
  padding: 1.25rem 1.5rem;
  max-width: 20rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 0.12);
}
.cas {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
}
button {
  margin-right: 0.4rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid #cfd4dc;
  border-radius: 0.5rem;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
button:disabled {
  opacity: 0.45;
  cursor: default;
}
button:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 1px;
}
```
:::

Id intervalu je číslo, které uživatel nikdy neuvidí — do stavu nepatří. Kdyby
tam bylo, každé spuštění stopek by přidalo render navíc. Všimni si řádku
`setDesetin((d) => d)` v `start` a `stop`: je tam jen proto, aby se překreslila
tlačítka. To je příznak, že hranice mezi stavem a refem je na tomhle místě
tenká — kdyby se mělo z refu odvozovat víc, patří „běží / neběží" do stavu.

:::memory
```jsx
const [desetin, setDesetin] = useState(0);
const idRef = useRef(null);
idRef.current = setInterval(tik, 100);
```
--step-- 2 | první render: stav i ref mají výchozí hodnotu
desetin = 0
idRef -> @ref
@ref: { current: null }
--step-- 3 | po kliknutí na Start: do téže krabičky se zapsalo id
desetin = 0
idRef -> @ref
@ref: { current: 12 }
--step-- 1 | další render (tikl časovač): stav je nový, krabička pořád tatáž
desetin = 1
idRef -> @ref
@ref: { current: 12 }
:::

Proměnná `idRef` ukazuje ve všech renderech na **tutéž** krabičku — proto si ji
komponenta pamatuje. Obyčejná `let id = null` v tělě komponenty by se při každém
renderu vyrobila znovu a časovač by se ztratil.

:::check
Kterou z těchhle tří hodnot bys v komponentě přehrávače držel v refu, a ne ve stavu: hlasitost zobrazená na posuvníku, id `requestAnimationFrame`, nebo název právě hrající skladby?

### --expected--

id requestAnimationFrame

### --accept--

id requestAnimationFrame
id animace
id z requestAnimationFrame

### --why--

Hlasitost i název skladby jsou vidět na obrazovce — ty patří do stavu, protože jejich změna má stránku překreslit. Id animačního snímku uživatel nikdy neuvidí; potřebuješ ho jen proto, abys ho uměl zrušit.

### --see--

react-hloubka/useref-a-dom#ref-jako-schranka-mimo-render
:::

## `ref` je v React 19 obyčejná prop

Do vlastní komponenty ref nepropadne sám — komponenta není prvek DOMu a React
neví, kterému z jejích prvků ho má dát. Od React 19 se to řeší úplně obyčejně:
`ref` je **normální prop**, kterou si komponenta vezme a předá dál.

```jsx
function Pole({ popisek, ref, ...zbytek }) {
  return (
    <label className="pole">
      <span>{popisek}</span>
      <input ref={ref} {...zbytek} />
    </label>
  );
}

// v rodiči
<Pole popisek="E-mail" ref={emailRef} type="email" />;
```

> [!NOTE]
> Ve starším kódu na tohle narazíš jako na `forwardRef`:
> `const Pole = forwardRef(function Pole(props, ref) { … })`. Dělá to samé,
> jen se `ref` předával druhým parametrem. V React 19 je `forwardRef` označený
> jako zastaralý a nový kód ho nepotřebuje.

Atribut `ref` umí i **funkci**. React jí po připojení prvku předá uzel a od
React 19 může vrátit úklidovou funkci, která se zavolá při odpojení — hodí se,
když si chceš na prvek pověsit `ResizeObserver` nebo `IntersectionObserver`:

```jsx
<section
  ref={(uzel) => {
    const sledovac = new ResizeObserver(([zaznam]) => setSirka(zaznam.contentRect.width));
    sledovac.observe(uzel);
    return () => sledovac.disconnect();
  }}
>
```

:::check
Rodič napíše `<Tlacitko ref={mojeRef}>Uložit</Tlacitko>`, ale `Tlacitko` je definované jako `function Tlacitko({ children }) { return <button>{children}</button>; }`. Co bude v `mojeRef.current`?

### --answer--

Kořenový prvek komponenty, tedy `<button>`.

#### --why--

React by musel uhodnout, který prvek z komponenty myslíš. Podívej se, jestli se ta prop v `Tlacitko` vůbec někam dostane.

### --correct--

`null` — komponenta prop `ref` nikam nepředala.

#### --why--

`ref` je obyčejná prop. Když si ji komponenta nevezme do parametrů a nepošle dál na nějaký prvek, nikdo ji nepřipojí a v refu zůstane výchozí `null`.

### --answer--

Samotná komponenta `Tlacitko` jako objekt.

#### --why--

Komponenta je funkce, ne instance — v refu by taková hodnota nebyla k ničemu. Refy na komponentu vracely instanci jen u starých komponent psaných jako třídy.

### --see--

react-hloubka/useref-a-dom#ref-je-v-react-19-obycejna-prop
:::

## Proč ref nečíst při renderu

Render musí být [[čistá funkce]]: ze stejných props a stavu stejný výsledek.
`ref.current` ale žádnou takovou záruku nemá — mění se kdykoli a bez vědomí
Reactu. Když z něj čteš při renderu, dostaneš hodnotu, kterou ti nikdo negarantuje,
a React si toho nevšimne.

:::live react predict
```jsx
import { useRef } from 'react';

export default function Karta() {
  const boxRef = useRef(null);
  const sirka = boxRef.current ? Math.round(boxRef.current.offsetWidth) : 'neznámá';

  return (
    <div ref={boxRef} style={{ width: 240, padding: 16, background: '#fff' }}>
      Šířka karty: {sirka}
    </div>
  );
}
```
--question-- Co bude na stránce, když komponenta doběhne a nic dalšího ji nepřekreslí?
--option-- `Šířka karty: 240` — ref se naplní ještě před vykreslením textu.
--option*-- `Šířka karty: neznámá`
--option-- Nic, komponenta spadne na `Cannot read properties of null`.
--why-- Při prvním renderu je `boxRef.current` ještě `null` — prvek totiž teprve vzniká z toho, co render vrátí. Podmínka `boxRef.current ? …` pád uhlídá, takže se vypíše `neznámá`. A protože zápis refu React nepřekresluje, zůstane tam `neznámá` navždy. Skutečné měření patří do efektu (nebo do ref callbacku), který po commitu zavolá `setSirka`.
:::

Pravidlo je proto jednoduché: **`ref.current` čti a zapisuj v obsluze události
nebo v efektu, nikdy v tělě komponenty.** Jediná výjimka je zápis výchozí hodnoty,
kterou nejde spočítat dřív (`if (ref.current === null) ref.current = drahyObjekt();`).

:::check
Komponenta má změřit výšku textu a vypsat ji na obrazovku. Kam patří volání `getBoundingClientRect()`?

### --answer--

Do těla komponenty, hned za `useRef`.

#### --why--

Tam prvek ještě neexistuje a hodnota by se navíc nikdy neaktualizovala. Zkus si položit otázku, kdy je prvek poprvé opravdu v DOMu.

### --correct--

Do efektu, který výsledek uloží do stavu.

#### --why--

Efekt běží po commitu, takže je prvek v DOMu a má rozměry. Výsledek se musí uložit do stavu, aby se nové číslo objevilo na obrazovce.

### --answer--

Do obsluhy `onChange` textu.

#### --why--

Handler běží dřív, než React překreslí — změřil bys rozměr **před** změnou. Navíc by měření chybělo hned po prvním vykreslení.

### --see--

react-hloubka/useref-a-dom#proc-ref-necist-pri-renderu
:::

## Typické chyby a pasti

### Ref použitý místo stavu

> [!PITFALL]
> **Číslo v refu se na obrazovce nezmění.** Příznak: počítadlo ukazuje pořád
> `0`, a přitom v konzoli vidíš správné hodnoty; číslo „naskočí" až po kliknutí
> někam jinam. Oprava: co je vidět, patří do `useState`. Ref je pro hodnoty,
> které vidět nejsou.

### `current` je `null`, když ho potřebuješ

> [!PITFALL]
> **`TypeError: Cannot read properties of null (reading 'focus')`** znamená, že
> prvek v tu chvíli v DOMu nebyl. Nejčastěji proto, že je uvnitř větve, která se
> zrovna nevykresluje (`{otevreno && <input ref={poleRef} />}`), nebo že se čte
> při renderu. Oprava: čti až v efektu nebo v handleru a u podmíněných prvků se
> zeptej `if (!poleRef.current) return;`.

### Ruční změna DOMu, který spravuje React

> [!PITFALL]
> **Co React vykreslil, to si React taky přepíše.** `nadpisRef.current.textContent
> = 'Hotovo'` vydrží do nejbližšího renderu, `uzelRef.current.remove()` skončí
> při dalším renderu chybou `NotFoundError: Failed to execute 'removeChild'`.
> Oprava: měň data ve stavu. Ručně sahej jen na prvky, které React nevykresluje,
> nebo jen na vlastnosti, o kterých nic neví (fokus, scroll, `play()`).

### Jeden ref na víc prvků v seznamu

> [!PITFALL]
> **`ref` v `map` přepíše `current` pokaždé, takže v něm zbyde poslední řádek.**
> Příznak: „scrollni na vybranou položku" scrolluje vždycky na konec seznamu.
> Oprava: ref na kontejner a uvnitř `kontejner.querySelector(…)`, nebo jeden ref
> s `Map` a ref callback (`ref={(uzel) => mapaRef.current.set(id, uzel)}`).

:::check
Kolega hlásí: „Po kliknutí na **Upravit** se má rozbalit políčko a mít fokus, ale padá to na `Cannot read properties of null`." V kódu je `{upravuji && <input ref={poleRef} />}` a hned v obsluze kliknutí `setUpravuji(true); poleRef.current.focus();`. Co je příčinou?

### --answer--

`useRef(null)` se má nahradit `useRef()`, aby v refu nebyl `null`.

#### --why--

Výchozí hodnota refu není příčina — kdyby `useRef()` bylo bez argumentu, byl by v `current` `undefined` a hláška by se jen změnila na „reading 'focus' of undefined".

### --correct--

`setUpravuji(true)` překreslí až po skončení obsluhy, takže `<input>` v tu chvíli ještě v DOMu není.

#### --why--

Stav se během jedné obsluhy nemění okamžitě; React překresluje až potom. Fokus proto patří do efektu, který se spustí po commitu (`useEffect(() => { if (upravuji) poleRef.current.focus(); }, [upravuji])`).

### --answer--

Ref na `<input>` se musí předávat jako `ref={poleRef.current}`.

#### --why--

Do atributu `ref` patří celý objekt refu, ne jeho obsah — React do něj `current` teprve naplní.

### --see--

react-hloubka/useref-a-dom#current-je-null-kdyz-ho-potrebujes
:::

:::explain
Vysvětli vlastními slovy, proč by číslo, které vidí uživatel na obrazovce, nemělo bydlet v refu.

## --model--

Ref je schránka, kterou React nesleduje. Když do `current` zapíšu novou hodnotu, React o tom neví a nespustí render — obrazovka tedy zůstane u staré hodnoty a změní se náhodně až ve chvíli, kdy komponentu překreslí něco jiného. Stav je přesně na tohle: jeho změna je pro React žádost o nový render, takže se obrazovka a data nikdy nerozejdou. Do refu proto dávám jen to, co uživatel nevidí — id časovače, předchozí hodnotu, uzel DOMu.

## --checklist--

- Zápis do `ref.current` nevyvolá render.
- Stav je jediná hodnota, kvůli které React překresluje.
- Co je vidět na obrazovce, patří do stavu.
- Do refu patří hodnoty mimo render: id časovače, uzel DOMu, předchozí hodnota.
:::

## Kde to najdeš v MDN

- [HTMLElement: focus()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus) —
  včetně volby `preventScroll`, kterou oceníš u dlouhých formulářů.
- [Element: getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) —
  rozměry a poloha prvku, typický důvod, proč si na něj přes ref sáhneš.
- [Element: scrollIntoView()](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) —
  posun na prvek, volby `block` a `behavior`.
- [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) —
  sledování změn velikosti prvku, které se uklízí v ref callbacku nebo v efektu.

> [!NOTE]
> Dokumentace Reactu: [useRef](https://react.dev/reference/react/useRef),
> [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
> a [ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop).

# --questions--

## --question--

Napiš, co bude v `mereniRef.current` v okamžiku, kdy se poprvé spustí efekt s prázdnými závislostmi v téhle komponentě.

```jsx
function Panel() {
  const mereniRef = useRef(null);
  useEffect(() => {
    // sem
  }, []);
  return <div ref={mereniRef}>Obsah</div>;
}
```

### --expected--

prvek div

### --accept--

uzel div
element div
div z DOMu
odkaz na prvek div

### --why--

Efekty běží po commitu, tedy potom, co React prvky vytvoří a naplní refy. Právě proto se měření, fokus i připojení observeru dělá v efektu, a ne v tělě komponenty.

### --see--

react-hloubka/useref-a-dom#proc-ref-necist-pri-renderu

## --question--

Komponenta překresluje graf, který kreslíš sám do `<canvas>`. Co z téhle trojice patří do refu: data grafu ze serveru, kontext plátna z `canvas.getContext('2d')`, nebo zvolené období, které jde přepnout tlačítky?

### --expected--

kontext plátna

### --accept--

kontext plátna
kontext z getContext
kontext canvasu

### --why--

Data i zvolené období se promítají do toho, co uživatel vidí, takže jejich změna má vyvolat render — patří do stavu (data typicky z načítání, období z tlačítek). Kontext plátna je pomůcka pro kreslení: nikdo ho nevidí a jeho uložení nemá nic překreslovat.

### --see--

react-hloubka/useref-a-dom#ref-jako-schranka-mimo-render

## --question--

Ve které z těchhle situací je sáhnutí na prvek přes ref na místě?

### --correct--

Po zavření dialogu vrátit fokus na tlačítko, které ho otevřelo.

#### --why--

Fokus není součást dat komponenty a v JSX se popsat nedá — je to přesně ten případ, kdy si na uzel sáhneš.

### --answer--

Po kliknutí na „Koupit" přebarvit tlačítko na zelenou přes `tlacitkoRef.current.style`.

#### --why--

Barva plyne z dat: drž stav („koupeno") a v JSX podle něj vyber třídu. Ruční zápis do `style` React při dalším renderu klidně přepíše.

### --answer--

Vypsat do odstavce počet položek v košíku.

#### --why--

Text vykresluje React z hodnoty — sahat kvůli němu na uzel znamená mít dva zdroje pravdy, které se rozejdou.

### --answer--

Odstranit řádek tabulky po kliknutí na křížek přes `radekRef.current.remove()`.

#### --why--

Mazání prvku patří do dat (`setRadky(radky.filter(…))`). Ruční `remove()` navíc skončí chybou, až bude React chtít ten uzel spravovat.

### --see--

react-hloubka/useref-a-dom#rucni-zmena-domu-ktery-spravuje-react

## --question--

Napiš jedním slovem, co musí `Vstup` udělat s prop `ref`, aby `<Vstup ref={poleRef} />` v rodiči fungovalo.

### --expected-- ignore-case

předat

### --accept--

predat
předat dál
poslat dál
předat ji na input

### --why--

V React 19 je `ref` obyčejná prop: komponenta si ji vezme do parametrů a napíše ji na ten prvek DOMu, který má rodič ovládat. Bez toho zůstane v refu `null`, protože komponenta sama žádný uzel není.

### --see--

react-hloubka/useref-a-dom#ref-je-v-react-19-obycejna-prop
