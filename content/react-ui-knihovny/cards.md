## --card-- output

Co vypíše tenhle kód?

```js
const tone = 'nebezpeci';
console.log(`bg-${tone}-500`);
```

### --expected--

bg-nebezpeci-500

### --why--

Řetězec vznikne správně, ale Tailwind ho nikdy neuvidí: hledá celé názvy tříd
ve zdrojovém kódu, a `bg-nebezpeci-500` tam jako celek nestojí. Ve stránce pak
třída je, jen k ní neexistuje pravidlo.

### --see--

react-ui-knihovny/tailwind-v-reactu#varianty-v-mape-trid

## --card-- output

Co vypíše tenhle kód?

```js
const classes = ['rounded-lg', false, undefined, 'px-4', null, 'text-sm'];
console.log(classes.filter(Boolean).join(' '));
```

### --expected--

rounded-lg px-4 text-sm

### --why--

Přesně tohle dělá `clsx` s polem: nepravdivé hodnoty zahodí a zbytek spojí mezerou.
Proto se u něj nemusíš bát `undefined` z nepovinné props.

### --see--

react-ui-knihovny/tailwind-v-reactu#podminene-tridy-clsx

## --card-- output

Co vypíše tenhle kód?

```js
const stavy = { 'opacity-50': false, 'ring-2': true, 'bg-slate-100': true };
console.log(Object.entries(stavy).filter(([, zapnuto]) => zapnuto).map(([trida]) => trida).join(' '));
```

### --expected--

ring-2 bg-slate-100

### --why--

Objekt je druhý zápis, kterému `clsx` rozumí: klíč je název třídy, hodnota
rozhoduje, jestli se použije. Pořadí klíčů zůstává.

### --see--

react-ui-knihovny/tailwind-v-reactu#podminene-tridy-clsx

## --card-- output

Co vypíše tenhle kód?

```js
const zKomponenty = 'px-4 py-2 rounded-lg';
const zProps = 'px-8';
console.log(`${zKomponenty} ${zProps}`.split(' ').filter((t) => t.startsWith('px-')).join(' '));
```

### --expected--

px-4 px-8

### --why--

V atributu skončí obě třídy. Která vyhraje, rozhoduje pořadí pravidel ve
vygenerovaném CSS, ne pořadí v `class` — proto potřebuješ `tailwind-merge`,
který jednu z nich vyhodí.

### --see--

react-ui-knihovny/tailwind-v-reactu#kdo-vyhraje-z-jsx-nepoznas

## --card-- output

Co vypíše tenhle kód?

```js
const varianty = { plna: 'bg-znacka text-white', ticha: 'bg-transparent text-slate-700' };
const vychozi = { variant: 'plna' };
const props = { variant: undefined };
console.log(varianty[props.variant ?? vychozi.variant]);
```

### --expected--

bg-znacka text-white

### --why--

Nepředaná varianta je `undefined`, takže se sáhne po výchozí hodnotě. Přesně tohle
dělá `defaultVariants` v `cva` — proto `<Button>` bez props vypadá jako plné tlačítko.

### --see--

react-ui-knihovny/tailwind-v-reactu#varianty-v-mape-trid

## --card-- output

Co vypíše tenhle kód?

```js
const zarizeni = [
  { id: 'pixel', skryte: true },
  { id: 'macbook', skryte: false },
];
console.log(zarizeni.map((kus) => `data-skryte="${kus.skryte}"`).join(' | '));
```

### --expected--

data-skryte="true" | data-skryte="false"

### --why--

Stav se do DOM dostane jako text, ne jako boolean. Proto se na něj v Tailwindu
míří variantou s hodnotou `data-[skryte=true]:`, a ne jen `data-[skryte]:`.

### --see--

react-ui-knihovny/tailwind-v-reactu#stav-jako-data-atribut

## --card-- output

Co vypíše tenhle kód?

```js
const sirka = Math.round((37 / 60) * 100);
console.log(`--podil: ${sirka}%`);
```

### --expected--

--podil: 62%

### --why--

Hodnota spočtená za běhu do třídy nepatří: Tailwind by ji nevygeneroval. Pošli ji
do CSS proměnné přes `style` a třídou už jen řekni, kde se má použít.

### --see--

react-ui-knihovny/tailwind-v-reactu#hodnoty-spoctene-za-behu

## --card-- output

Co vypíše tenhle kód?

```js
const props = { className: 'w-full', onClick: null, disabled: true };
const { className, ...zbytek } = props;
console.log(Object.keys(zbytek).join(', '));
```

### --expected--

onClick, disabled

### --why--

`className` si komponenta vytáhne, aby ho mohla sloučit s vlastními třídami,
a všechno ostatní pošle dál přes `{...zbytek}`. Bez toho by na tlačítku nefungoval
ani `onClick`, ani `disabled`.

### --see--

react-ui-knihovny/workshop-sada-komponent

## --card-- output

Co vypíše tenhle kód?

```js
const stav = 'open';
console.log(`data-[state=${stav}]:animate-vjezd`);
```

### --expected--

data-[state=open]:animate-vjezd

### --why--

Takhle vypadá varianta na stavový atribut, ale takhle se nesmí skládat: Tailwind
najde jen celý název třídy zapsaný ve zdroji. Ve skutečné komponentě ji napíšeš celou.

### --see--

react-ui-knihovny/shadcn-a-radix#stav-v-atributech-data-state

## --card-- output

Co vypíše tenhle kód?

```js
const polozky = ['Skrýt z historie', 'Odhlásit zařízení'];
let index = -1;
for (const stisk of ['ArrowDown', 'ArrowDown', 'ArrowUp']) {
  index += stisk === 'ArrowDown' ? 1 : -1;
}
console.log(polozky[index]);
```

### --expected--

Skrýt z historie

### --why--

Tohle je ručně napsaná obsluha šipek v menu — a je to jen začátek: chybí obtočení
na konci, Home a End, psaní písmen a návrat fokusu. Proto se bere primitivum.

### --see--

react-ui-knihovny/shadcn-a-radix#radix-primitiva-chovani-bez-vzhledu

## --card-- css

Napiš deklaraci do bloku `@theme`, která vyrobí barvu použitelnou jako `bg-znacka`
(fialová `#7c3aed`).

### --expected--

```css
--color-znacka: #7c3aed;
```

### --see--

react-ui-knihovny/workshop-sada-komponent

## --card-- css

Napiš deklaraci do bloku `@theme`, ze které vznikne třída `rounded-karta`
s poloměrem `1rem`.

### --expected--

```css
--radius-karta: 1rem;
```

### --see--

react-ui-knihovny/workshop-sada-komponent

## --card-- css

Napiš deklaraci do bloku `@theme`, ze které vznikne třída `animate-vjezd`:
animace `vjezd`, 160 ms, náběh `ease-out`.

### --expected--

```css
--animate-vjezd: vjezd 160ms ease-out;
```

### --accept--

```css
--animate-vjezd: vjezd 0.16s ease-out;
```

### --see--

react-ui-knihovny/workshop-pristupne-komponenty

## --card-- code js

Napiš funkci `joinClasses(...inputs)`, která spojí názvy tříd mezerou. Bere řetězce
a objekty (klíč se použije, když je hodnota pravdivá); `false`, `null` a `undefined`
zahodí. Je to zjednodušený `clsx`.

### --seed--

```js
function joinClasses(...inputs) {
}
```

### --test--

```js
assert.equal(joinClasses('px-4', 'py-2'), 'px-4 py-2', "joinClasses('px-4', 'py-2') má vrátit 'px-4 py-2'");
assert.equal(joinClasses('px-4', false, undefined, null), 'px-4', 'nepravdivé hodnoty se mají zahodit');
assert.equal(
  joinClasses('rounded-lg', { 'opacity-50': false, 'ring-2': true }),
  'rounded-lg ring-2',
  "z objektu { 'opacity-50': false, 'ring-2': true } má projít jen 'ring-2'",
);
assert.equal(joinClasses(), '', 'joinClasses() bez argumentů má vrátit prázdný řetězec');
```

### --solution--

```js
function joinClasses(...inputs) {
  const parts = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') parts.push(input);
    else for (const [name, enabled] of Object.entries(input)) if (enabled) parts.push(name);
  }
  return parts.join(' ');
}
```

### --see--

react-ui-knihovny/tailwind-v-reactu#podminene-tridy-clsx

## --card-- code js

Napiš funkci `mergePadding(classes)`, která z mezerou oddělených tříd nechá
u prefixu `px-` jen tu poslední a pořadí ostatních tříd nemění. Je to princip,
na kterém stojí `tailwind-merge`.

### --seed--

```js
function mergePadding(classes) {
}
```

### --test--

```js
assert.equal(mergePadding('px-4 py-2 px-8'), 'py-2 px-8', "mergePadding('px-4 py-2 px-8') má vrátit 'py-2 px-8'");
assert.equal(mergePadding('rounded-lg px-4'), 'rounded-lg px-4', 'bez konfliktu se nemá nic zahodit');
assert.equal(mergePadding('px-2 px-4 px-6'), 'px-6', "z 'px-2 px-4 px-6' má zbýt jen 'px-6'");
assert.equal(mergePadding(''), '', "mergePadding('') má vrátit prázdný řetězec");
```

### --solution--

```js
function mergePadding(classes) {
  const parts = classes.split(' ').filter(Boolean);
  const lastPadding = parts.findLastIndex((name) => name.startsWith('px-'));
  return parts.filter((name, index) => !name.startsWith('px-') || index === lastPadding).join(' ');
}
```

### --see--

react-ui-knihovny/tailwind-v-reactu#cn-clsx-a-tailwind-merge-v-jednom

## --card-- code js

Napiš funkci `variantClasses(map, defaults, props)`, která z mapy variant vybere
třídy podle props a chybějící klíč doplní z výchozích hodnot. Vrať třídy spojené
mezerou v pořadí klíčů mapy. Je to jádro toho, co dělá `cva`.

### --seed--

```js
function variantClasses(map, defaults, props) {
}
```

### --test--

```js
const map = {
  variant: { plna: 'bg-znacka text-white', ticha: 'bg-transparent' },
  size: { sm: 'h-8 px-3', md: 'h-10 px-4' },
};
const defaults = { variant: 'plna', size: 'md' };
assert.equal(
  variantClasses(map, defaults, { variant: 'ticha', size: 'sm' }),
  'bg-transparent h-8 px-3',
  "variantClasses pro { variant: 'ticha', size: 'sm' } má vrátit 'bg-transparent h-8 px-3'",
);
assert.equal(
  variantClasses(map, defaults, {}),
  'bg-znacka text-white h-10 px-4',
  'bez props se mají použít výchozí varianty',
);
assert.equal(
  variantClasses(map, defaults, { size: 'sm' }),
  'bg-znacka text-white h-8 px-3',
  "chybí-li jen variant, má se doplnit výchozí 'plna'",
);
```

### --solution--

```js
function variantClasses(map, defaults, props) {
  return Object.keys(map)
    .map((key) => map[key][props[key] ?? defaults[key]])
    .filter(Boolean)
    .join(' ');
}
```

### --see--

react-ui-knihovny/tailwind-v-reactu#varianty-v-mape-trid

## --card-- free

K čemu je `clsx` a k čemu `tailwind-merge`? Proč se používají spolu jako `cn()`?

### --back--

`clsx` řeší **podmínky**: ze řetězců, polí a objektů složí jeden seznam tříd
a zahodí `false`, `null` a `undefined`. O obsah tříd se nestará, takže v něm klidně
zůstane `px-4` i `px-8`. `tailwind-merge` řeší **konflikty**: ví, které utility míří
na stejnou vlastnost, a nechá z nich poslední. Dohromady `cn(...i) = twMerge(clsx(i))`
dává komponentě to, co potřebuje: podmíněné třídy, které jde zvenku přepsat přes
`className`.

### --see--

react-ui-knihovny/tailwind-v-reactu#cn-clsx-a-tailwind-merge-v-jednom

## --card-- free

Proč `` className={`bg-${tone}-500`} `` nefunguje a co místo toho?

### --back--

Tailwind nespouští tvůj kód — prochází zdrojové soubory a hledá v nich **celé názvy
tříd**. Složený řetězec v nich není, takže se pro `bg-nebezpeci-500` žádné pravidlo
nevygeneruje. Řešením je mapa, kde je každá varianta napsaná celá
(`{ nebezpeci: 'bg-nebezpeci-500' }`), a props vybírá klíč.

### --see--

react-ui-knihovny/tailwind-v-reactu#varianty-v-mape-trid

## --card-- free

Komponenta má `className="px-4"` a volající jí předá `className="px-8"`. Co se stane
bez `tailwind-merge` a proč to nespraví pořadí v atributu?

### --back--

V atributu skončí `px-4 px-8`, ale prohlížeč o vítězi rozhoduje podle **pořadí pravidel
ve stylu**, ne podle pořadí v atributu. Obě třídy mají stejnou specificitu, takže
vyhraje ta, která je v CSS níž — a to si autor komponenty neřídí. `tailwind-merge` tuhle
dvojznačnost odstraní tím, že dřívější třídu ze stejné skupiny vyhodí.

### --see--

react-ui-knihovny/tailwind-v-reactu#kdo-vyhraje-z-jsx-nepoznas

## --card-- free

Co přesně znamená, že shadcn/ui **není závislost**? Jaká je za to cena?

### --back--

`npx shadcn@latest add dialog` zkopíruje zdrojový kód komponenty do tvého
`components/ui/`. Od té chvíle je to tvůj soubor: můžeš v něm cokoli změnit, nikdo ti
ho neaktualizuje a v `package.json` po něm nezbyde stopa (závislosti jsou Radix,
`cva`, `clsx` a `tailwind-merge`). Cena je, že opravy a novinky v upstreamu si musíš
přenést ručně — a čím víc jsi soubor upravil, tím dráž.

### --see--

react-ui-knihovny/shadcn-a-radix#shadcn-ui-kod-v-repozitari-ne-zavislost

## --card-- free

Vyjmenuj, co za tebe udělá `Dialog.Content` z Radixu — a co zůstane na tobě.

### --back--

Primitivum dá oknu `role="dialog"`, propojí ho s názvem a popisem přes `aria-labelledby`
a `aria-describedby`, zavře ho Escapem, zamkne fokus uvnitř, po zavření ho vrátí na
`Dialog.Trigger`, zamkne scroll stránky a vykreslí obsah v portálu. Na tobě zůstane
vzhled, texty, volba správného primitiva (`AlertDialog` u nevratné akce) a rozhodnutí,
kdy se dialog otevírá a zavírá.

### --see--

react-ui-knihovny/shadcn-a-radix#co-zustava-na-tobe

## --card-- free

Kdy zvolíš řízený a kdy neřízený režim primitiva?

### --back--

Neřízený (`defaultOpen`, `defaultValue`) je výchozí volba: míň kódu a stav si drží
komponenta sama. Řízený (`open` + `onOpenChange`) potřebuješ ve chvíli, kdy o stavu
rozhoduje nebo z něj čte něco mimo primitivum — dialog se otevírá z položky menu, po
odeslání formuláře se má sám zavřít, nebo si potřebuješ pamatovat, kterého řádku se
potvrzení týká.

### --see--

react-ui-knihovny/shadcn-a-radix#rizeny-a-nerizeny-rezim

## --card-- free

Proč se akce u položky rozbalovacího menu píše do `onSelect`, a ne do `onClick`?

### --back--

`onClick` je událost myši. Položka menu se ale vybírá i Enterem a mezerníkem a taky
tahem myši přes otevřené menu. `onSelect` je vlastní událost primitiva, která pokryje
všechny tyhle cesty najednou, a menu se po ní samo zavře. S `onClick` by uživatel
klávesnice položku „vybral", ale nic by se nestalo.

### --see--

react-ui-knihovny/workshop-pristupne-komponenty

## --card-- free

Dialog je řízený stavem a otevírá ho obyčejné tlačítko mimo `Dialog.Trigger`.
Kde skončí fokus po zavření a co s tím?

### --back--

Na `<body>`. Modální `Dialog.Content` výchozí návrat fokusu zruší a místo něj zaostří
`Dialog.Trigger` — a ten tu žádný není, takže se nezaostří nic. Uživatel klávesnice pak
začíná znovu od začátku stránky. Buď dialog otevírej z `Trigger`u (s `asChild` nad svým
tlačítkem), nebo si v `onCloseAutoFocus` zavolej `event.preventDefault()` a zaostři si
tlačítko sám přes ref.

### --see--

react-ui-knihovny/shadcn-a-radix#rizeny-a-nerizeny-rezim

## --card-- free

Kdy sáhneš po `AlertDialog` místo `Dialog`?

### --back--

U akce, kterou nejde vrátit zpět — smazání účtu, odhlášení všech zařízení. `AlertDialog`
má roli `alertdialog`, nezavře ho klik mimo okno a místo jednoho `Close` má dvojici
`Cancel` (couvnout) a `Action` (provést). Uživatel tak musí vybrat jednu ze dvou
možností, ne jen „kliknout vedle".

### --see--

react-ui-knihovny/shadcn-a-radix#radix-primitiva-chovani-bez-vzhledu

## --card-- free

Proč se stav komponenty vystavuje do DOM jako `data-state` a co ti to ušetří ve stylu?

### --back--

Atribut v DOM je jediný zdroj pravdy pro JavaScript, pro CSS i pro test. Ve stylu na něj
míříš variantou `data-[state=open]:…` nebo `data-[highlighted]:…`, takže v JSX nemusíš
skládat třídy podmínkou. V testu se na něj dá zeptat bez toho, abys sahal do vnitřností
komponenty — a čtečka vedle toho dostane odpovídající `aria-*`.

### --see--

react-ui-knihovny/tailwind-v-reactu#stav-jako-data-atribut

## --card-- free

Proč ikonovému tlačítku nestačí bublina (`Tooltip`) a musí mít i `aria-label`?

### --back--

Bublina je **popis navíc**, ne jméno prvku: ukáže se až po najetí myší nebo po fokusu
a čtečka ji bere jako doplněk. Bez `aria-label` je tlačítko pro čtečku bezejmenné
(„tlačítko"), a kdo ovládá počítač hlasem, nemá jak ho pojmenovat. `aria-label` je jméno,
`Tooltip` je vysvětlení pro vidoucí uživatele.

### --see--

react-ui-knihovny/workshop-pristupne-komponenty

## --card-- free

Co dělá `asChild` a proč je lepší než vnořit `<a>` dovnitř `<button>`?

### --back--

`asChild` řekne dílu primitiva, aby nevykresloval vlastní prvek, ale svoje props (včetně
`aria-*`, obsluh a ref) předal jedinému potomkovi. Místo `<button><a>…</a></button>`,
což je neplatné HTML a pro čtečku i klávesnici nesmysl, tak dostaneš jeden `<a>`, který
se chová jako spouštěč a vypadá jako tvoje tlačítko.

### --see--

react-ui-knihovny/workshop-sada-komponent
