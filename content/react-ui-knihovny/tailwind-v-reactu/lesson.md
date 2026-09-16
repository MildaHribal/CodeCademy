# Tailwind v komponentách

Tlačítko, štítek, karta, pole formuláře — každá aplikace v Reactu má svoji sadu
těchhle stavebních kamenů a každý tým, který stylu je Tailwindem, řeší stejnou
věc: jedna komponenta, pár variant, a zvenku se dá dostylovat. Tahle lekce je o
tom, jak takovou komponentu napsat, aby se její třídy nepřebíjely náhodou.

:::check pretest
Komponenta `Button` má v sobě `className="px-4 py-2"`. Zavoláš ji jako
`<Button className="px-8">Rezervovat</Button>` a obě třídy skončí v atributu
`class`. Jaké bude vnitřní odsazení vlevo?

### --answer--
32 px — třída z props je v atributu napsaná později, takže vyhraje.

#### --why--
Pořadí jmen v atributu `class` prohlížeč neřeší. Rozhoduje se jinde.

### --correct--
16 px — `px-4` vyhraje, i když je v atributu napsaná dřív.
:::

:::check pretest
Proč by v komponentě nestačilo napsat `` className={`bg-${tone}-600`} ``
a barvu si tak složit z props?

### --answer--
Šablonový řetězec v `className` React neumí přeložit.

#### --why--
Řetězec vznikne správně a v atributu `class` opravdu bude. Problém je jinde —
ne v Reactu.

### --correct--
Takový název třídy nikdy nebyl v žádném souboru, takže pro něj nevznikne CSS.
:::

## Problém: stejný blok tříd na pěti místech

V čistém CSS bys pro tlačítko napsal jednu třídu `.button` a použil ji kdekoli.
V Tailwindu jsou třídy utility, takže tlačítko vypadá takhle:

```jsx
<button className="inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 font-medium text-white">
  Rezervovat
</button>
```

Ten blok potřebuješ na pěti obrazovkách. Zkopírovat ho pětkrát znamená, že
změna zaoblení je pět úprav a na šesté obrazovce to někdo nastyluje trochu
jinak. Tailwind na to má direktivu `@apply`, v Reactu je ale zbytečná: máš
něco lepšího.

> [!REMEMBER]
> **Komponenta je v Reactu to, čím byla v CSS jedna třída.** Blok utilit
> pojmenuješ tím, že z něj uděláš komponentu `Button`, ne třídu `.button`.

Komponenta navíc umí to, co CSS třída ne: podle props si třídy poskládá, předá
dál `onClick` i `aria-*` a nechá volajícího dostylovat okraje.

:::check
Máš pět stránek se stejným blokem utilit pro kartu produktu. Co je v React
projektu lepší řešení a proč?

### --answer--
Vytáhnout blok do třídy `.card` s `@apply` a psát `className="card"`.

#### --why--
Funguje to, ale vzniká druhé místo, kde se rozhoduje o vzhledu: část pravidel v
CSS, část v JSX. A nic z toho neumí přijmout props ani předat `onClick`.

### --correct--
Vytvořit komponentu `Card`, která ten blok tříd drží v sobě.

#### --why--
Pojmenování bloku utilit je přesně to, na co v Reactu máš komponenty — a ty
navíc přijmou props a předají dál události.
:::

## Podmíněné třídy: clsx

Třídy se v komponentě skládají podle props a stavu. Ruční skládání řetězců je
cesta do pekla — zapomenutá mezera a ze `rounded` a `bg-white` je
`roundedbg-white`, tedy nic. Na to je knihovna `clsx`: posbírá argumenty,
zahodí `false`, `null` a `undefined` a zbytek spojí mezerou.

```js
clsx('rounded-lg', false, undefined, 'px-4');                       // 'rounded-lg px-4'
clsx('rounded-lg', { 'bg-red-600': true, 'bg-slate-200': false });  // 'rounded-lg bg-red-600'
clsx(['h-10', 'px-4'], vybrano && 'outline-2');                     // pole i výraz
```

Objekt je nejčitelnější zápis pro „třídu přidej, když platí podmínka": klíč je
celý název třídy, hodnota rozhoduje.

:::live react libs=tailwind
```jsx
import { clsx } from 'clsx';

function Stitek({ volno, children }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-3 py-1 text-sm font-medium',
        { 'bg-emerald-100 text-emerald-900': volno, 'bg-slate-200 text-slate-600': !volno },
      )}
    >
      {children}
    </span>
  );
}

export default function App() {
  return (
    <div className="flex gap-3 p-6">
      <Stitek volno>Volno 9:30</Stitek>
      <Stitek volno={false}>Obsazeno</Stitek>
    </div>
  );
}
```
:::

Zkus v ukázce u prvního štítku přepsat `volno` na `volno={false}` a sleduj, že
se prohodí obě třídy naráz — pozadí i barva textu.

:::check
Co vrátí `clsx('px-4', undefined, { 'text-white': false, 'font-bold': true })`?

### --expected--
px-4 font-bold
:::

## Proč `px-8` z props nevyhraje

Tohle je ta past, kvůli které lidé Tailwind v komponentách nenávidí. Komponenta
má v sobě `px-4`, volající pošle `px-8` — a vyhraje `px-4`.

:::live react libs=tailwind predict
```jsx
import { clsx } from 'clsx';

function Button({ className, children }) {
  return <button className={clsx('rounded-lg bg-emerald-600 px-4 py-2 text-white', className)}>{children}</button>;
}

export default function App() {
  return (
    <div className="p-6">
      <Button className="px-8">Rezervovat</Button>
    </div>
  );
}
```
--question-- Tlačítko má v atributu `class` napsané `px-4` a za ním `px-8`. Jak velké bude jeho vnitřní odsazení vlevo?
--option-- 32 px — `px-8` je v atributu napsaná později, takže přebije `px-4`.
--option*-- 16 px — o vítězi rozhoduje pořadí pravidel ve vygenerovaném CSS, ne v atributu.
--option-- 48 px — odsazení se sečte: 16 px z komponenty plus 32 px z props.
--why-- Obě třídy mají stejnou specificitu, takže vyhraje ta, která je v CSS souboru níž. Tailwind generuje utility v pevném pořadí podle velikosti, a `px-4` je až za `px-8`. Atribut `class` je jen seznam jmen, jeho pořadí prohlížeč ignoruje — viz [pořadí ve zdroji](see:css-kaskada/kaskada#poradi-ve-zdroji).
:::

Poslední možnost mimochodem popisuje jinou domněnku: že se hodnoty utilit
sčítají. Nesčítají — jsou to obyčejné deklarace `padding-inline` a druhá první
prostě přebije.

> [!PITFALL]
> Příznak: `<Button className="px-8">` vypadá stejně jako bez `className` a v
> DevTools je `px-8` **přeškrtnutá**. Nepomůže přesunout `className` v `clsx`
> na konec ani vymýšlet vyšší specificitu. Pomůže jedině tu původní třídu ze
> seznamu **odebrat** — a přesně to dělá `tailwind-merge`.

:::check
Dvě tailwindové třídy nastavují stejnou vlastnost. Podle čeho se prohlížeč
rozhodne, která platí?

### --answer--
Podle pořadí jmen v atributu `class` — poslední vyhrává.

#### --why--
Atribut `class` je neuspořádaný seznam jmen. Přehazování jmen v něm nezmění
vůbec nic, což si můžeš zkusit v DevTools.

### --correct--
Podle pořadí pravidel ve vygenerovaném CSS — vyhraje to, které je níž.

#### --why--
Specificita je u obou utilit stejná, takže rozhoduje pořadí ve zdroji stylů.
:::

## `cn()`: clsx a tailwind-merge v jednom

`tailwind-merge` umí jednu věc: dostane seznam tailwindových tříd a vyhodí z
něj ty, které si přebíjejí stejnou vlastnost — z každé skupiny nechá
**poslední**.

```js
twMerge('px-4 py-2 px-8');              // 'py-2 px-8'
twMerge('bg-emerald-600 bg-red-600');   // 'bg-red-600'
twMerge('px-4 pt-6');                   // 'px-4 pt-6' — dvě různé vlastnosti, obě zůstanou
twMerge('text-sm text-white');          // 'text-sm text-white' — velikost a barva
```

Skupiny zná z konfigurace Tailwindu, takže ví, že `size-10` přebíjí `h-10`,
zato `text-sm` a `text-white` jsou dvě různé věci.

V praxi se obě knihovny slepí do jednoho pomocníka, kterému se všude říká `cn`.
Tohle je jediný soubor, který si z celé lekce budeš přepisovat do každého
projektu:

```js
// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

Pořadí je důležité: nejdřív `clsx` vyřeší podmínky a objekty na jeden řetězec,
teprve pak `twMerge` uklidí konflikty. Tomuhle úklidu budu dál říkat
[[slučování tříd]].

:::live react libs=tailwind
```jsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Bez({ className, children }) {
  return <button className={clsx('rounded-lg bg-emerald-600 px-4 py-2 text-white', className)}>{children}</button>;
}

function S({ className, children }) {
  return <button className={cn('rounded-lg bg-emerald-600 px-4 py-2 text-white', className)}>{children}</button>;
}

export default function App() {
  return (
    <div className="flex items-start gap-4 p-6">
      <Bez className="px-8">Bez úklidu</Bez>
      <S className="px-8">Po úklidu</S>
    </div>
  );
}
```
:::

Obě tlačítka dostala stejné props. Zkus v ukázce přepsat `px-8` na `px-12`
a sleduj, že se hýbe jen to druhé — v prvním zůstává `px-4` z komponenty a
přebíjí ho.

:::explain
Vysvětli vlastními slovy, proč v komponentě potřebuješ `clsx` **i**
`tailwind-merge` a proč jedno nenahradí druhé.

## --model--
`clsx` z podmínek, objektů a polí vyrobí jeden řetězec tříd a zahodí prázdné
hodnoty — řeší, **které** třídy se do atributu dostanou. `tailwind-merge` pak z
toho řetězce odebere třídy, které si přebíjejí stejnou vlastnost, a nechá
poslední. Bez něj by v atributu zůstaly obě a vyhrála by ta, která je ve
vygenerovaném CSS níž — tedy ne nutně ta, kterou posílá volající.

## --checklist--
- `clsx` skládá třídy z podmínek a zahazuje `false` a `undefined`.
- `tailwind-merge` odebírá kolidující třídy a nechává poslední.
- O dvou třídách v atributu jinak rozhoduje pořadí pravidel ve CSS.
- `cn()` je obojí v jednom volání: `twMerge(clsx(inputs))`.
:::

:::check
Co vrátí `cn('rounded bg-slate-200 p-2', 'bg-red-600', false && 'p-6')`?

### --expected--
rounded p-2 bg-red-600
:::

## Varianty v mapě tříd

Tlačítko potřebuje víc než jeden vzhled: hlavní akci, tichou akci, nebezpečnou
akci. Takové sadě předpřipravených vzhledů se říká [[varianta komponenty]] a v
kódu je to obyčejná mapa z hodnoty props na **celý** název tříd:

```jsx
const tony = {
  volno: 'bg-emerald-100 text-emerald-900',
  obsazeno: 'bg-slate-200 text-slate-600',
  akce: 'bg-amber-100 text-amber-900',
};

function Stitek({ tone = 'volno', className, ...props }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-xs', tony[tone], className)} {...props} />;
}
```

Klíčové je to slovo **celý**. Tailwind hledá názvy tříd ve tvém zdrojovém kódu
jako text. Když název složíš za běhu, v žádném souboru nikdy nebyl a Tailwind
pro něj nevygeneruje ani řádek CSS.

> [!PITFALL]
> Příznak: `` className={`bg-${tone}-100`} `` nedělá vůbec nic — prvek je bez
> pozadí a v DevTools má třídu `bg-akce-100`, ke které neexistuje žádné
> pravidlo. Oprava: celé názvy tříd do mapy (`{ akce: 'bg-amber-100' }`), ať je
> Tailwind najde ve zdrojáku.

:::check
Proč Tailwind nevygeneruje CSS pro třídu, jejíž název vznikne až za běhu
v šablonovém řetězci?

### --answer--
Protože `bg-akce-100` není platný název tailwindové třídy.

#### --why--
Platnost názvu s tím nesouvisí — `bg-amber-100` je platná a v mapě funguje.
Problém je v tom, kdy název vznikne.

### --correct--
Protože Tailwind názvy tříd hledá ve zdrojových souborech, a tam ten složený nikdy nebyl.
:::

## Stav jako data atribut

Aktivní filtr, otevřené menu, vybraná záložka — stav se v HTML nejlíp nese jako
[[stavový atribut]], tedy `data-*` nebo `aria-*`. Tailwind na ně má variantu:
`data-[aktivni=true]:bg-slate-900` platí, jen když má prvek
`data-aktivni="true"`.

```jsx
<button
  data-aktivni={aktivni === filtr}
  className="px-3 py-2 data-[aktivni=true]:bg-slate-900 data-[aktivni=true]:text-white"
>
```

Proč ne jen podmínka v `clsx`? Obě cesty fungují, ale atribut má dvě výhody: v
DevTools stav prvku **vidíš** a stejný zápis ti bude fungovat i s knihovnami —
Radix primitiva z další lekce sama nasazují `data-state="open"` nebo
`data-highlighted`, takže je stylujeme úplně stejně. Atributy `data-*` znáš z
[práce s DOM](see:js-dom/strom-dom#atributy-a-vlastnosti-classlist-dataset-a-spol).

:::live react libs=tailwind
```jsx
import { useState } from 'react';

const filtry = ['Vše', 'Dnes', 'Tento týden'];

export default function App() {
  const [aktivni, setAktivni] = useState('Vše');

  return (
    <div className="flex gap-2 p-6">
      {filtry.map((filtr) => (
        <button
          key={filtr}
          data-aktivni={aktivni === filtr}
          onClick={() => setAktivni(filtr)}
          className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 data-[aktivni=true]:bg-slate-900 data-[aktivni=true]:text-white"
        >
          {filtr}
        </button>
      ))}
    </div>
  );
}
```
:::

Zkus do pole `filtry` přidat čtvrtou položku a sleduj, že nemusíš psát nic
dalšího — stav i styl visí na atributu.

:::check
Napiš třídu, která zabarví text bíle, jen když má prvek `data-stav="open"`.

### --expected--
data-[stav=open]:text-white
:::

## Hodnoty spočtené za běhu

Tailwind je sada hotových hodnot. Šířka ukazatele baterie, která vyjde na
62,4 %, mezi nimi není a hranatá závorka (`w-[62.4%]`) to nespasí — takový
název by zas vznikl až za běhu. Pro hodnotu, kterou znáš až za běhu, je správný
nástroj `style`, nejlépe přes CSS proměnnou:

```jsx
<div className="h-2 rounded-full bg-slate-200" style={{ '--uroven': `${procenta}%` }}>
  <div className="h-full rounded-full bg-emerald-600" style={{ width: 'var(--uroven)' }} />
</div>
```

V Tailwindu zůstane všechno ostatní — barva, výška, zaoblení. Výhoda proti
`style={{ width: … }}` na vnitřním prvku je, že tu jednu hodnotu můžeš přebít
v CSS i v media dotazu.

> [!TIP]
> V DevTools se dívej na kartu **Computed**: když tam vlastnost chybí nebo má
> jinou hodnotu, než čekáš, hledej v panelu **Styles** přeškrtnutou třídu. To
> je konflikt utilit.

:::check
Ukazatel má výšku 8 px a šířku 62,4 % spočtenou z dat. Co dáš do `className`
a co do `style`?

### --answer--
Výšku do `style`, šířku do `className` jako `w-[62.4%]`.

#### --why--
Je to naopak. Pro 8 px má Tailwind hotovou utilitu, zato název s hodnotou z dat
by ve zdrojáku nikdy nebyl.

### --correct--
Výšku do `className` jako `h-2`, šířku spočtenou z dat do `style`.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Komponenta nepředává `className` dál.** Příznak: `<Button className="w-full">`
> tlačítko neroztáhne a v DevTools třída `w-full` v atributu vůbec není.
> Oprava: props `className` v komponentě přijmi a pošli ho do `cn(...)`.

> [!PITFALL]
> **Zbytek props se zahodí.** Příznak: `onClick` na komponentě nic nedělá a
> `aria-label` se do HTML nedostane. Oprava: `function Button({ className, ...props })`
> a `{...props}` na výsledném prvku — jinak komponenta přijímá jen to, co jsi
> vyjmenoval.

> [!PITFALL]
> **`cn()` se volá na dvakrát.** Příznak: varianty fungují, ale `className`
> zvenku ne. Stává se to při zápisu `className={cn(base) + ' ' + className}`:
> obě třídy jsou v atributu a konflikt zůstal neuklizený. Do jednoho volání
> `cn()` musí jít **všechno** a `className` až jako poslední argument.

> [!NOTE]
> `cn()` je čistá funkce nad krátkým seznamem řetězců, takže o výkon se tu bát
> nemusíš a `useMemo` okolo ní nepatří.

:::check
`<Badge className="w-full" onClick={smazat} />` nic nedělá a v HTML není ani
třída, ani obsluha kliknutí. Jaké dvě věci chybí v komponentě `Badge`?

### --expected--
className a ...props
### --accept--
className a zbytek props
předat className a rozprostřít props
:::

## Kde to najdeš v MDN

- [Attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) — jak funguje selektor `[data-stav="open"]`, na kterém stojí varianta `data-[…]:`.
- [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — proměnná v `style`, kterou pak čte tailwindová utilita.
- [tailwind-merge: what is it for](https://github.com/dcastil/tailwind-merge/blob/main/docs/what-is-it-for.md) — anglicky a krátce: proč atribut `class` o vítězi nerozhoduje.
- [clsx](https://github.com/lukeed/clsx#readme) — všechny tvary argumentů (řetězec, objekt, pole) na deseti řádcích.

# --questions--

## --question--

Komponenta `Badge` vypadá takhle:

```jsx
function Badge({ className, ...props }) {
  return <span className={cn('rounded-full bg-slate-200 px-2 text-xs', className)} {...props} />;
}
```

Vypiš třídy, které budou v atributu `class` po volání
`<Badge className="bg-emerald-100 px-4" />`.

### --expected--

rounded-full text-xs bg-emerald-100 px-4

### --why--

`cn()` nechá z každé kolidující skupiny poslední třídu: `bg-emerald-100`
přebije `bg-slate-200` a `px-4` přebije `px-2`. `rounded-full` a `text-xs`
nekolidují s ničím, takže zůstanou — a zůstanou i v původním pořadí.

### --see--

react-ui-knihovny/tailwind-v-reactu#cn-clsx-a-tailwind-merge-v-jednom

## --question--

Kolega napsal štítek takhle a stěžuje si, že „Tailwind nefunguje":

```jsx
<span className={`rounded-full px-2 bg-${barva}-100`}>{text}</span>
```

Co přesně je špatně?

### --expected--

název třídy vznikne až za běhu, ve zdrojáku není

### --accept--

Tailwind ten název ve zdrojových souborech nenajde, takže pro něj nevygeneruje CSS

### --why--

Tailwind prochází zdrojové soubory jako text a generuje CSS jen pro názvy, které
v nich najde. `bg-${barva}-100` v souboru není, takže pro `bg-akce-100` žádné
pravidlo nevznikne. Řešení je mapa celých názvů tříd.

### --see--

react-ui-knihovny/tailwind-v-reactu#varianty-v-mape-trid

## --question--

Kdy `tailwind-merge` ze seznamu **nic** neodebere?

### --answer--

Když jsou v seznamu `px-4` i `px-8`.

#### --why--

To je právě ten případ, kdy zasáhne: obě třídy nastavují `padding-inline`,
takže jedna musí jít pryč.

### --answer--

Když jsou v seznamu `bg-slate-200` i `bg-emerald-100`.

#### --why--

Dvě barvy pozadí patří do jedné skupiny, takže jedna odejde.

### --correct--

Když jsou v seznamu `px-4` a `pt-6`.

#### --why--

Odsazení po stranách a odsazení nahoře jsou různé vlastnosti, takže si nelezou
do cesty a obě zůstanou.

### --see--

react-ui-knihovny/tailwind-v-reactu#cn-clsx-a-tailwind-merge-v-jednom

## --question--

Karta má mít stav „vybraná" a podle něj tmavý rámeček. Napiš, jak ten stav
dostaneš do HTML a jakou variantou ho v Tailwindu nastyluješ.

### --expected--

data-vybrana={vybrana} a data-[vybrana=true]:border-slate-900

### --accept--

jako data atribut, variantou data-[vybrana=true]:

### --why--

Stav v `data-*` atributu je vidět v DevTools, styl k němu drží variantu
`data-[…]:` a přesně tak stavy vystavují i knihovny primitiv
(`data-state="open"`).

### --see--

react-ui-knihovny/tailwind-v-reactu#stav-jako-data-atribut
