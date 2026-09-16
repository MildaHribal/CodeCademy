# Stav jako snímek

Zatím jsi vykresloval hotová data. Každá skutečná aplikace ale reaguje: filtr se přepne, počet kusů se zvýší, dialog se otevře. K tomu potřebuje komponenta paměť — a v Reactu se jí říká [[stav]].

:::check pretest
Komponenta si při kliknutí zvýší obyčejnou proměnnou `let pocet = 0` o jedna. Co uvidí uživatel na stránce?

### --answer--

Číslo se zvýší, React změnu proměnné pozná.

#### --why--

React tvoje proměnné nesleduje. Sleduje jen to, co mu sám svěříš — a k tomu slouží jeden konkrétní nástroj, který uvidíš v první části.

### --correct--

Nic. Číslo na stránce zůstane na nule.

#### --why--

Přesně tak. Proč tomu tak je a co s tím, ukáže hned první část.

### --answer--

Stránka spadne s chybou, protože měnit proměnnou v komponentě nejde.

#### --why--

Nic nespadne. Proměnná se opravdu změní — jenom to nikdo nepřekreslí.
:::

:::check pretest
V obsluze kliknutí zavoláš třikrát za sebou `setPocet(pocet + 1)`, když je `pocet` nula. Kolik bude na stránce po kliknutí?

### --expected--

1

### --accept--

jedna
1, ne 3
:::

## Problém: obyčejná proměnná nestačí

Tohle počítadlo je napsané tak, jak by ho napsal někdo, kdo zná jen JavaScript. Zkus na tlačítko kliknout — a pak si otevři konzoli náhledu.

:::live react
```jsx
let pocet = 0;

export default function Pocitadlo() {
  function pridej() {
    pocet = pocet + 1;
    console.log('proměnná je teď', pocet);
  }

  return (
    <div className="box">
      <p className="cislo">{pocet}</p>
      <button onClick={pridej}>Přidat kus</button>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.box { display: grid; gap: .5rem; justify-items: start; max-width: 14rem; padding: 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.cislo { margin: 0; font-size: 2.5rem; font-weight: 800; color: #0f766e; }
button { padding: .5rem 1rem; border: 0; border-radius: 999px; background: #0f766e; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
```
:::

V konzoli čísla rostou, na stránce je pořád nula. **React o změně neví, takže komponentu nezavolal znovu** — a dokud ji nezavolá, v DOM se nic nezmění. Kdyby ji náhodou zavolal (třeba kvůli něčemu jinému), `let pocet = 0` by ji zase vynulovalo.

> [!REMEMBER]
> **Stav je hodnota, kterou si pro komponentu pamatuje React: přežije další render a její změna render vyvolá.** Obyčejná proměnná v těle komponenty nesplňuje ani jedno.

:::check
Proměnná v komponentě se po kliknutí opravdu změnila — v konzoli rostla. Proč to uživatel na stránce nepozná?

### --answer--

React změnu zahodil, protože proměnná není ve stavu.

#### --why--

Nic se nezahazuje, proměnná má novou hodnotu. Problém je v tom, co se po změně (ne)stalo se stránkou.

### --correct--

Protože se komponenta nevykreslila znovu — v DOM zůstalo, co tam React zapsal minule.

#### --why--

Do DOM React zapisuje jen při renderu. Když ho nic nevyvolá, stránka ukazuje starý výsledek, i když data v paměti jsou nová.

### --answer--

Protože `console.log` běží dřív než vykreslení.

#### --why--

Na pořadí nezáleží. Ani za hodinu by se stránka sama nepřekreslila.

### --see--

react-zaklady/stav-jako-snimek#problem-obycejna-promenna-nestaci
:::

## Stav v `useState`

Stav zakládá funkce `useState`. Vrátí dvojici: aktuální hodnotu a funkci, kterou ji měníš. Rozebereš si ji destrukturalizací pole.

```jsx
const [pocet, setPocet] = useState(0);
```

Argument `useState(0)` je **počáteční hodnota** — použije se jen při prvním renderu komponenty, dál se ignoruje. Set funkci pojmenuj `set` + jméno hodnoty; je to nepsaná dohoda, kterou uvidíš v každém projektu.

:::live react
```jsx
import { useState } from 'react';

export default function Pocitadlo() {
  const [pocet, setPocet] = useState(0);

  return (
    <div className="box">
      <p className="cislo">{pocet}</p>
      <button onClick={() => setPocet(pocet + 1)}>Přidat kus</button>
      <button className="tise" onClick={() => setPocet(0)}>Vynulovat</button>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.box { display: grid; gap: .5rem; justify-items: start; max-width: 14rem; padding: 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.cislo { margin: 0; font-size: 2.5rem; font-weight: 800; color: #0f766e; }
button { padding: .5rem 1rem; border: 0; border-radius: 999px; background: #0f766e; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
button.tise { background: #e2e8f0; color: #1f2937; }
```
:::

Zkus změnit počáteční hodnotu na `10` a sleduj, od čeho se počítá. Pak zkus místo `setPocet(pocet + 1)` napsat `pocet = pocet + 1` — dostaneš `TypeError: Assignment to constant variable`, protože `pocet` je `const`. Měnit stav jde **jen** set funkcí.

> [!NOTE]
> `useState` je [[hook]] — funkce, která komponentě půjčuje schopnosti Reactu a pozná se podle předpony `use`. Hooky se volají vždy nahoře v těle komponenty, nikdy v podmínce ani v cyklu. Proč, si rozebereme v sekci *React do hloubky*; do té doby stačí pravidlo.

:::check
Co přesně vrací `useState('')` a v jakém pořadí?

### --expected--

hodnotu a set funkci

### --accept--

aktuální hodnotu a funkci, která ji mění
pole s hodnotou a set funkcí
dvojici hodnota, setter

### --why--

Vrací pole o dvou položkách: aktuální hodnotu stavu a funkci, kterou ji nastavíš. Pořadí je dané, proto se rozebírá destrukturalizací pole.

### --see--

react-zaklady/stav-jako-snimek#stav-v-usestate
:::

## Stav je snímek renderu

Tady se láme většina začátečnických chyb. `pocet` uvnitř komponenty **není okno do stavu** — je to hodnota, kterou měl stav v okamžiku, kdy React tenhle render spustil. Obsluha kliknutí, kterou v tom renderu vyrobíš, si tu hodnotu pamatuje, ať se stav mezitím změnil jakkoli.

:::live react predict
```jsx
import { useState } from 'react';

export default function Pocitadlo() {
  const [pocet, setPocet] = useState(0);

  function pridejTri() {
    setPocet(pocet + 1);
    setPocet(pocet + 1);
    setPocet(pocet + 1);
  }

  return (
    <div className="box">
      <p className="cislo">{pocet}</p>
      <button onClick={pridejTri}>Přidat tři</button>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; }
.box { display: grid; gap: .5rem; justify-items: start; max-width: 12rem; }
.cislo { margin: 0; font-size: 2.5rem; font-weight: 800; }
```
--question-- Kolik bude na stránce po jednom kliknutí na „Přidat tři"?
--option-- 3 — každé volání přidá jedničku
--option*-- 1 — všechna tři volání počítají s nulou
--option-- 0 — poslední volání přepíše předchozí
--why-- V tomhle renderu je `pocet` nula, a tak jsou všechna tři volání ve skutečnosti `setPocet(0 + 1)`. React si zapamatuje „nová hodnota bude 1" třikrát po sobě. Nová hodnota se objeví až v příštím renderu — teprve tam bude `pocet` jednička.
:::

:::memory
```js
const [pocet, setPocet] = useState(0);
setPocet(pocet + 1);
setPocet(pocet + 1);
```
--step-- 1 | první render: snímek se stavem 0
pocet = 0
fronta -> @f
@f: []
--step-- 2 | první setPocet počítá s nulou
pocet = 0
fronta -> @f
@f: [1]
--step-- 3 | druhé volání pořád vidí nulu
pocet = 0
fronta -> @f
@f: [1, 1]
--step-- 3 | druhý render: nový snímek, nová hodnota
pocet = 1
fronta -> @f
@f: []
:::

Ve výkladu se tomu říká **snímek** (*snapshot*): každý render má vlastní `pocet`, vlastní obsluhu kliknutí a vlastní JSX. Je to stejné jako s parametrem funkce — když funkci zavoláš dvakrát, má pokaždé vlastní hodnoty a o té druhé neví.

> [!PITFALL]
> **`setPocet(pocet + 1)` třikrát za sebou přidá jedničku, ne trojku.** Příznak: počítadlo se hýbe pomaleji, než čekáš. Stejnou past má čtení stavu hned po jeho nastavení: `setPocet(5); console.log(pocet);` vypíše starou hodnotu.

:::check
Proč `console.log(pocet)` hned za `setPocet(pocet + 1)` vypíše starou hodnotu?

### --answer--

Protože `setPocet` je asynchronní a nestihne se dokončit.

#### --why--

Není to o čase. I kdybys počkal sebedéle, v tomhle renderu se `pocet` nezmění — jeho hodnota je daná.

### --correct--

Protože `pocet` je hodnota tohohle renderu; nová hodnota platí až v příštím.

#### --why--

Render je snímek: proměnná `pocet` v něm má pevnou hodnotu, kterou už nic nepřepíše. Nový stav uvidíš v další funkci, kterou React zavolá.

### --answer--

Protože `console.log` čte proměnnou dřív, než se přiřadí.

#### --why--

Žádné přiřazení se nekoná. `setPocet` nepřepisuje proměnnou, jen říká Reactu, s čím má vykreslit příště.

### --see--

react-zaklady/stav-jako-snimek#stav-je-snimek-renderu
:::

## Funkce aktualizace

Když nová hodnota závisí na té předchozí, nepočítej s hodnotou ze snímku. Předej set funkci **funkci** — React ji zavolá s hodnotou, která je aktuálně ve frontě, takže na sebe změny navazují. Tomu se říká [[funkce aktualizace]].

:::live react
```jsx
import { useState } from 'react';

export default function Pocitadlo() {
  const [pocet, setPocet] = useState(0);

  function pridejTri() {
    setPocet((aktualni) => aktualni + 1);
    setPocet((aktualni) => aktualni + 1);
    setPocet((aktualni) => aktualni + 1);
  }

  return (
    <div className="box">
      <p className="cislo">{pocet}</p>
      <button onClick={pridejTri}>Přidat tři</button>
      <button className="tise" onClick={() => setPocet(0)}>Vynulovat</button>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .5rem; justify-items: start; max-width: 14rem; }
.cislo { margin: 0; font-size: 2.5rem; font-weight: 800; color: #0f766e; }
button { padding: .5rem 1rem; border: 0; border-radius: 999px; background: #0f766e; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
button.tise { background: #e2e8f0; color: #1f2937; }
```
:::

Zkus přidat čtvrté volání a sleduj, že přidá další jedničku. Pak zkus jedno z nich přepsat zpátky na `setPocet(pocet + 1)` — celý výsledek spadne na jedničku, protože tahle varianta zahodí, co bylo ve frontě.

**Pravidlo, které si zapamatuj:** počítáš z předchozí hodnoty → funkce aktualizace. Nastavuješ hodnotu, která na staré nezávisí (`setFiltr('novinky')`) → stačí hodnota.

:::check
Napiš volání, které zvýší stav `body` o pět a použije funkci aktualizace.

### --expected--

setBody((aktualni) => aktualni + 5)

### --accept--

setBody(aktualni => aktualni + 5)
setBody((body) => body + 5)
setBody((predchozi) => predchozi + 5)
setBody(function (aktualni) { return aktualni + 5; })

### --why--

Set funkci předáš funkci, ne hodnotu. React ji zavolá s poslední hodnotou ve frontě, takže se změny nepřepisují.

### --see--

react-zaklady/stav-jako-snimek#funkce-aktualizace
:::

## Dávkování: několik změn, jeden render

React změny stavu z jedné obsluhy **posbírá a vykreslí naráz**. Tomu se říká [[dávkování]]: i když v jedné funkci nastavíš tři různé stavy, komponenta se překreslí jednou. Uživatel tak nikdy neuvidí polovinu změny.

:::live react
```jsx
import { useState } from 'react';

let pocetRenderu = 0;

export default function Formular() {
  const [jmeno, setJmeno] = useState('');
  const [odeslano, setOdeslano] = useState(false);
  pocetRenderu = pocetRenderu + 1;

  function odesli() {
    setJmeno('Eva');
    setOdeslano(true);
  }

  return (
    <div className="box">
      <p>Jméno: {jmeno || '—'}</p>
      <p>Odesláno: {odeslano ? 'ano' : 'ne'}</p>
      <p className="mala">Komponenta se zatím vykreslila {pocetRenderu}×</p>
      <button onClick={odesli}>Odeslat</button>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .3rem; justify-items: start; max-width: 18rem; }
.box p { margin: 0; }
.mala { color: #64748b; font-size: .85rem; }
button { margin-top: .5rem; padding: .5rem 1rem; border: 0; border-radius: 999px; background: #0f766e; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
```
:::

Klikni na **Odeslat** a sleduj počítadlo renderů: změní se o jedna, i když se změnily dva stavy. (Počítadlo je tu schválně mimo stav — do stavu takové věci nepatří, jen je tak vidět, kolikrát React komponentu zavolal.)

:::check
V jedné obsluze kliknutí nastavíš tři různé stavy. Kolikrát se komponenta vykreslí?

### --expected--

jednou

### --accept--

1
1×
jednou, React změny dávkuje

### --why--

React změny z jedné obsluhy sloučí a vykreslí je jedním renderem. Proto nemá smysl „šetřit" voláním set funkcí kvůli výkonu.

### --see--

react-zaklady/stav-jako-snimek#davkovani-nekolik-zmen-jeden-render
:::

## Pole a objekty ve stavu

Do stavu patří i pole a objekty — jen se **nesmí měnit na místě**. React porovnává starou a novou hodnotu identitou (`===`), a když do pole jen přidáš položku, zůstane to totéž pole: stará i nová hodnota jsou si rovny a React nemá důvod cokoli překreslovat. Je to táž [mutace sdíleného objektu](see:js-objekty/reference-a-mutace#objekty-se-sdileji-pres-odkaz), jakou znáš z objektů.

:::live react predict
```jsx
import { useState } from 'react';

export default function Seznam() {
  const [polozky, setPolozky] = useState(['rohlík']);

  function pridej() {
    polozky.push('mléko');
    setPolozky(polozky);
  }

  return (
    <div className="box">
      <ul>
        {polozky.map((polozka) => (
          <li key={polozka}>{polozka}</li>
        ))}
      </ul>
      <button onClick={pridej}>Přidat mléko</button>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; }
.box { display: grid; gap: .5rem; justify-items: start; }
```
--question-- Co se stane po kliknutí na „Přidat mléko"?
--option-- V seznamu přibude „mléko".
--option*-- V seznamu se nic nezmění, i když v poli mléko je.
--option-- Stránka spadne s chybou o zmrazeném poli.
--why-- `push` přidá položku do téhož pole a vrátí jeho délku. `setPolozky(polozky)` pak Reactu předá pole, které už tam bylo — nová hodnota je identická se starou, takže React nevykresluje znovu. Opravou je nové pole: `setPolozky([...polozky, 'mléko'])`.
:::

Vzory, které budeš používat pořád dokola:

| co chceš | jak to napíšeš |
|---|---|
| přidat na konec | `setPolozky([...polozky, novaPolozka])` |
| odebrat podle id | `setPolozky(polozky.filter((p) => p.id !== id))` |
| změnit jednu položku | `setPolozky(polozky.map((p) => (p.id === id ? { ...p, hotovo: true } : p)))` |
| změnit vlastnost objektu | `setFiltr({ ...filtr, kategorie: 'novinky' })` |

> [!PITFALL]
> **`push`, `splice`, `sort` a přiřazení `objekt.klic = …` ve stavu nic nepřekreslí.** Příznak: data se mění (vidíš je v `console.log`), stránka ne. Oprava: vyrob novou hodnotu — `[...pole, x]`, `filter`, `map`, `toSorted`, `{ ...objekt, klic: x }`.

:::check
Stav `filtr` je objekt `{ kategorie: 'vse', jenSkladem: false }`. Napiš volání, které přepne `jenSkladem` na `true` a nechá zbytek být.

### --expected--

setFiltr({ ...filtr, jenSkladem: true })

### --accept--

setFiltr({...filtr, jenSkladem: true})
setFiltr((aktualni) => ({ ...aktualni, jenSkladem: true }))

### --why--

Spread zkopíruje existující vlastnosti do nového objektu a poslední zápis přebije tu jednu, kterou měníš. Nový objekt znamená novou identitu, a tedy nový render.

### --see--

react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu
:::

## Odvozená hodnota místo stavu

Nejčastější zbytečnost v React kódu: druhý stav, který se dá spočítat z prvního. Součet košíku, počet nepřečtených, filtrovaný seznam, „je formulář platný" — to všechno je [[odvozená hodnota]]. Spočítej ji při renderu.

:::live react
```jsx
import { useState } from 'react';

const cenik = [
  { id: 'kava', nazev: 'Káva', cena: 65 },
  { id: 'dort', nazev: 'Dort', cena: 85 },
  { id: 'limonada', nazev: 'Limonáda', cena: 45 },
];

export default function Ucet() {
  const [ucet, setUcet] = useState([]);
  const celkem = ucet.reduce((soucet, polozka) => soucet + polozka.cena, 0);

  return (
    <div className="box">
      <div className="tlacitka">
        {cenik.map((polozka) => (
          <button key={polozka.id} onClick={() => setUcet([...ucet, polozka])}>
            {polozka.nazev}
          </button>
        ))}
      </div>
      <p className="mala">{ucet.length} položek na účtu</p>
      <p className="cislo">{celkem} Kč</p>
      <button className="tise" onClick={() => setUcet([])}>Vynulovat účet</button>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.box { display: grid; gap: .5rem; justify-items: start; max-width: 20rem; }
.box p { margin: 0; }
.tlacitka { display: flex; gap: .4rem; flex-wrap: wrap; }
.cislo { font-size: 2rem; font-weight: 800; color: #0f766e; }
.mala { color: #64748b; font-size: .85rem; }
button { padding: .45rem .9rem; border: 0; border-radius: 999px; background: #0f766e; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
button.tise { background: #e2e8f0; color: #1f2937; }
```
:::

Zkus přidat druhý stav `const [celkem, setCelkem] = useState(0)` a udržovat ho ručně — a pak si představ, že přibude mazání položky a sleva. Každá taková cesta je místo, kde se součet může rozejít se seznamem.

> [!REMEMBER]
> **Do stavu patří jen to, co nejde spočítat z něčeho jiného.** Dvě čísla, která mají vždycky souhlasit, se dřív nebo později rozejdou.

:::check
Ve stavu máš seznam objednávek. Co z tohohle patří taky do stavu: počet objednávek, vybraná objednávka, nebo cena objednávek celkem?

### --expected-- ignore-case

vybraná objednávka

### --accept--

jen vybraná objednávka
vybraná

### --why--

Počet i součet se spočítají ze seznamu při renderu. Vybraná objednávka se z ničeho spočítat nedá — to je rozhodnutí uživatele, a proto patří do stavu.

### --see--

react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu
:::

:::explain
Vysvětli vlastními slovy, proč tři volání `setPocet(pocet + 1)` v jedné obsluze přidají jedničku, zatímco tři volání `setPocet((aktualni) => aktualni + 1)` přidají trojku.

## --model--

Každý render komponenty je snímek: proměnná `pocet` v něm má pevnou hodnotu a obsluha kliknutí, kterou ten render vyrobil, ji má „zamrazenou". Když třikrát napíšu `setPocet(pocet + 1)` a `pocet` je nula, říkám Reactu třikrát totéž — „příště nastav jedničku". Funkce aktualizace je jiná: neříkám hodnotu, ale předpis. React si ho uloží do fronty a při zpracování ho zavolá s tím, co ve frontě vyšlo předtím, takže se tři přírůstky sečtou na trojku.

## --checklist--

- Render je snímek: `pocet` má v jedné obsluze pevnou hodnotu.
- `setPocet(pocet + 1)` třikrát říká třikrát totéž.
- Funkce aktualizace dostane poslední hodnotu z fronty, ne ze snímku.
- Novou hodnotu stavu vidím až v příštím renderu.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Volání set funkce přímo v těle komponenty.** `setPocet(1)` napsané mimo obsluhu vyvolá render, ten ho zavolá zase a React kontrolu zastaví hláškou `Too many re-renders. React limits the number of renders to prevent an infinite loop.` Oprava: stav měň v obsluze události, ne při renderu.

> [!PITFALL]
> **Předání výsledku funkce místo funkce.** `onClick={pridej()}` funkci zavolá hned při renderu a Reactu předá její návratovou hodnotu. Příznak: akce se provede sama při načtení, nebo (když mění stav) skončí „Too many re-renders". Oprava: `onClick={pridej}`, nebo `onClick={() => pridej(id)}`, když potřebuješ předat argument.

> [!PITFALL]
> **Počáteční hodnota se použije jen jednou.** `useState(props.cena)` si vezme cenu z prvního renderu a další změny propu už ignoruje. Příznak: komponenta ukazuje starou hodnotu, i když rodič posílá novou. Oprava: většinou hodnotu vůbec do stavu nedávat a používat prop přímo.

> [!PITFALL]
> **Zapomenutá závorka u objektu ve funkci aktualizace.** `setFiltr((f) => { ...f, jenSkladem: true })` vrací `undefined`, protože složené závorky vzal JavaScript jako tělo funkce. Oprava: obal objekt kulatými závorkami — `(f) => ({ ...f, jenSkladem: true })`.

:::check
Komponenta po kliknutí spadne s hláškou `Too many re-renders`. Které dvě místa v kódu zkontroluješ nejdřív?

### --expected-- ignore-case

volání set funkce v těle komponenty a onClick s voláním funkce

### --accept--

set funkci mimo obsluhu a onClick={funkce()}
jestli se stav nemění při renderu a jestli je v onClick předaná funkce, ne její volání
volání setState při renderu a závorky u obsluhy

### --why--

Obojí vede ke stejnému kolotoči: render nastaví stav, stav vyvolá render. Buď je set funkce zavolaná přímo v těle komponenty, nebo je v `onClick` napsané `funkce()` místo `funkce`.

### --see--

react-zaklady/stav-jako-snimek#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Spread syntax (`...`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) — kopie pole i objektu, základ všech změn stavu bez mutace.
- [Destructuring assignment — Array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring#array_destructuring) — proč se dvojice z `useState` rozebírá hranatými závorkami.
- [Array.prototype.toSorted()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) — řazení, které vrací nové pole; `sort` ve stavu použít nemůžeš.

> [!NOTE]
> Reference hooku je na [react.dev/reference/react/useState](https://react.dev/reference/react/useState), výklad se stejným příměrem „snímek" na [react.dev/learn/state-as-a-snapshot](https://react.dev/learn/state-as-a-snapshot).

# --questions--

## --question--

Napiš, co bude ve stavu `pocet` na stránce po jednom kliknutí, když je počáteční hodnota 5 a obsluha kliknutí vypadá takhle:

```jsx
setPocet(pocet + 10);
setPocet((aktualni) => aktualni * 2);
```

### --expected--

30

### --why--

První volání zapíše do fronty hodnotu 15 (počítá se snímkem, kde je `pocet` pět). Druhé volání je předpis, který dostane to, co ve frontě vyšlo předtím — tedy 15 — a udělá z toho 30.

### --see--

react-zaklady/stav-jako-snimek#funkce-aktualizace

## --question--

Ve stavu je pole úkolů. Které z těchhle volání způsobí, že se seznam na stránce překreslí?

### --answer--

`ukoly.push(novy); setUkoly(ukoly);`

#### --why--

`push` mění totéž pole, takže Reactu předáváš hodnotu, kterou už má. Nic se nezmění.

### --correct--

`setUkoly([...ukoly, novy]);`

#### --why--

Spread vyrobí nové pole. Nová identita znamená pro React změnu, a tedy nový render.

### --answer--

`ukoly = [...ukoly, novy];`

#### --why--

Přiřazení do proměnné z `useState` nejde (je to `const`) a hlavně by o něm React nevěděl.

### --see--

react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu

## --question--

V komponentě máš stav `polozky` (pole objektů s cenou). Kolega navrhuje přidat druhý stav `celkem` a po každé změně ho přepočítat. Napiš jednou větou, proč to je špatný nápad.

### --expected-- ignore-case

součet jde spočítat z položek

### --accept--

je to odvozená hodnota, spočítá se při renderu
dva zdroje pravdy se rozejdou
stav navíc se může rozejít se seznamem

### --why--

Součet se dá spočítat z položek při každém renderu. Druhý stav je druhý zdroj pravdy: stačí jedna cesta, kde se zapomene přepočítat, a čísla si přestanou odpovídat.

### --see--

react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

## --question--

Tlačítko má po kliknutí zavolat `smaz(id)`. Který zápis je správný?

### --answer--

`onClick={smaz(id)}`

#### --why--

Tenhle zápis funkci zavolá hned při renderu a Reactu předá její výsledek. Mazat se bude, jakmile se komponenta vykreslí.

### --correct--

`onClick={() => smaz(id)}`

#### --why--

Obsluha musí být funkce, kterou React zavolá až při kliknutí. Šipková funkce ji obalí a argument si pamatuje.

### --answer--

`onClick={smaz}`

#### --why--

Tenhle zápis je v pořádku jen tehdy, když funkce žádný argument nepotřebuje — dostala by objekt události, ne `id`.

### --see--

react-zaklady/stav-jako-snimek#typicke-chyby-a-pasti
