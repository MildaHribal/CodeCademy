# Motion for React

Oznámení, které vyjede z rohu a za tři vteřiny odjede pryč. Řádek objednávky, který
po smazání zmizí a zbytek tabulky se plynule posune nahoru. Podtržítko, které klouže
mezi záložkami. Tyhle tři věci má skoro každý dashboard a v čistém CSS se dvě z nich
napsat nedají. Proto v Reactu sáhneš po knihovně **Motion** (dřív Framer Motion),
kterou už znáš z `css-efekty-animace` v podobě `animate()` — v Reactu má navíc
komponenty, které rozumí tomu, že prvky vznikají a zanikají.

:::check pretest
Máš `{message && <div className="transition-opacity">…</div>}`. Když `message`
přepneš na `false`, jakou odchodovou animaci uvidíš?

### --expected--
žádnou

### --accept--
nic, prvek zmizí okamžitě
žádnou, React prvek rovnou odstraní z DOM
:::

:::check pretest
Řekni odhadem: kolikrát se komponenta překreslí během půlvteřinové animace
průhlednosti, kterou řídí Motion?

### --expected--
jednou

### --accept--
jednou, na začátku
skoro vůbec, Motion mění styl mimo React
:::

## Problém: CSS umí přechod, ale neumí odchod

`transition` v CSS potřebuje prvek, který v DOM **je** a mění vlastnost. Jenže
v Reactu prvky mizí ze stromu:

```jsx
{rentals.map((rental) => (
  <li key={rental.id}>{rental.bike}</li>
))}
```

Když z pole odstraníš položku, React ten `<li>` odmontuje. Není co animovat — prvek
už není. Stejně tak nejde v CSS udělat, aby se zbylé řádky **plynule posunuly** na
novou pozici: mezi „byl jsem 120 px níž" a „jsem tady" žádný CSS přechod není,
protože obě pozice určuje layout, ne vlastnost.

> [!REMEMBER]
> **`motion.div` je obyčejný `div`, který navíc rozumí props `initial`, `animate`
> a `exit`.** Rozdíl mezi hodnotami dopočítá Motion sám, mimo React render —
> a u `exit` počká s odmontováním, dokud animace neskončí.

:::check
Proč se odchodová animace prvku nedá napsat jen v CSS, když vstupní ano?

### --expected--
prvek už v DOM není, takže není co animovat

### --accept--
React ho odmontuje dřív, než by přechod stihl proběhnout
při odchodu prvek zmizí ze stromu, CSS na něm nemá co měnit
:::

## `motion.div`: initial, animate, transition

Každou HTML značku má Motion i ve své verzi: `motion.div`, `motion.li`,
`motion.button`. Props navíc:

| prop | co znamená |
|---|---|
| `initial` | hodnoty na začátku (odkud animovat); `initial={false}` vstup přeskočí |
| `animate` | cílové hodnoty (kam animovat) |
| `transition` | jak se tam dostat: typ, délka, tuhost pružiny |

Hodnoty píšeš jako objekt stylu, ale posuny a zvětšení mají zkratky: `x`, `y`,
`scale`, `rotate` (Motion je složí do jednoho `transform`).

:::live react libs=tailwind
```jsx
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-64 rounded-xl bg-white p-5 shadow"
      >
        <p className="text-sm text-slate-500">Tržba dne</p>
        <p className="text-2xl font-semibold">4 860 Kč</p>
      </motion.div>
    </div>
  );
}
```
:::

Zkus v ukázce změnit `y: 24` na `x: -40` a sleduj, odkud karta přilétne. Pak zkus
`initial={false}` — karta se objeví rovnou na místě.

Co se při tom **neděje**: komponenta se nepřekresluje. Motion si vezme prvek z DOM
a mění mu inline styl přímo, snímek po snímku. Proto můžeš animovat i sto řádků
tabulky, aniž by React o něčem věděl.

:::check
Napiš props pro `motion.div`, který má přilétnout zprava (o 40 px) a zároveň se
objevit.

### --expected--
initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}

### --accept--
initial opacity 0 a x 40, animate opacity 1 a x 0
:::

## Pružina, nebo tween

`transition` má dva světy. **Tween** je klasická animace z CSS: řekneš `duration`
a `ease`, trvá přesně tak dlouho. **Pružina** (`type: 'spring'`) délku nemá —
popisuješ fyziku a čas vyjde z ní:

| parametr | co dělá | typická hodnota |
|---|---|---|
| `stiffness` | tuhost: vyšší = rychlejší a prudší | 100–600 |
| `damping` | tlumení: vyšší = míň kmitání | 10–40 |
| `mass` | hmotnost: vyšší = línější rozjezd | 0.5–2 |

Pravidlo z praxe: **co uživatel chytil prstem nebo kurzorem, animuj pružinou**
(panel, přetažená karta, posun podtržítka), **co jen naskočí nebo zmizí, animuj
tweenem** (průhlednost, skeleton, oznámení).

:::live react libs=tailwind
```jsx
import { useState } from 'react';
import { motion } from 'motion/react';

export default function App() {
  const [isRight, setIsRight] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <button
        onClick={() => setIsRight((current) => !current)}
        className="mb-6 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Přepnout
      </button>
      <div className="space-y-4">
        <motion.div
          animate={{ x: isRight ? 220 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-12 w-28 rounded-lg bg-violet-600"
        />
        <motion.div
          animate={{ x: isRight ? 220 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="h-12 w-28 rounded-lg bg-slate-400"
        />
      </div>
    </div>
  );
}
```
:::

Fialový obdélník je pružina, šedý tween. Zkus u pružiny nastavit `damping: 6`
a sleduj, kolikrát to překmitne; pak `stiffness: 60` a sleduj, jak zleniví.

:::check
Panel detailu vyjíždí zprava poté, co na řádek klikneš. Zvolíš pružinu, nebo tween,
a proč?

### --expected--
pružinu, protože panel reaguje na akci uživatele

### --accept--
pružina — pohyb vyvolaný gestem má vypadat fyzikálně
pružinu, tween je spíš na průhlednost
:::

## Varianty a orchestrace

Psát `initial` a `animate` do každé karty zvlášť je stejná duplicita jako psát
seznam tříd do každého tlačítka. Řešení je stejné: pojmenované stavy, tentokrát
v objektu `variants`. Rodič i potomek použijí **stejná jména** a rodič jim je
rozdá — potomek pak nepotřebuje `initial` ani `animate` vůbec.

Navíc rodič umí potomky rozestřídat v čase, čemuž se říká [[orchestrace]]:

```jsx
const listVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
```

`staggerChildren` je prodleva mezi sousedními potomky, `delayChildren` posune celou
skupinu. Obojí patří do `transition` **rodiče**, ne potomka.

:::live react libs=tailwind
```jsx
import { motion } from 'motion/react';

const bikes = ['Kolo 12 — Vršovice', 'Kolo 07 — Karlín', 'Kolo 21 — Smíchov', 'Kolo 03 — Holešovice'];

const list = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const row = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

export default function App() {
  return (
    <motion.ul
      variants={list}
      initial="hidden"
      animate="visible"
      className="min-h-screen space-y-2 bg-slate-100 p-8"
    >
      {bikes.map((name) => (
        <motion.li key={name} variants={row} className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
          {name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```
:::

Zkus zvýšit `staggerChildren` na `0.4` a sleduj, jak se z toho stane pomalý výčet.
Pak přidej do `list.visible.transition` ještě `staggerDirection: -1` a řádky
naskáčou odspodu.

> [!TIP]
> Varianta smí být i funkce: `visible: (index) => ({ opacity: 1, transition: { delay: index * 0.05 } })`.
> Argument jí předáš props `custom={index}`. Hodí se, když prodleva nezávisí na
> pořadí v DOM, ale na datech (třeba na stavu baterie).

:::check
Kam patří `staggerChildren` — do variant rodiče, nebo potomka? A proč zrovna tam?

### --expected--
do transition rodiče, protože rodič rozdává variantu potomkům

### --accept--
do rodiče — on řídí, kdy které dítě začne
rodič, staggerChildren je prodleva mezi jeho potomky
:::

## `AnimatePresence`: odchod z DOM

`exit` sama o sobě nefunguje. Potřebuje kolem sebe `AnimatePresence`, protože někdo
musí prvek v DOM **podržet**, dokud odchodová animace neskončí. To je celá práce téhle
komponenty: sleduje, co z jejích potomků zmizelo, nechá to chvíli žít, spustí `exit`
a teprve pak to odstraní. Té animaci se říká [[odchodová animace]].

Tři pravidla, která se porušují nejčastěji:

- Podmínka (`{open && …}`) musí být **uvnitř** `AnimatePresence`, ne kolem ní.
- Každý přímý potomek potřebuje stabilní `key` — takový, který patří k datům
  (`rental.id`), ne k pozici v poli.
- `mode` rozhoduje, co se stane při výměně: výchozí je překryv, `mode="wait"` počká,
  až starý odejde (skeleton → obsah), `mode="popLayout"` odcházející prvek vytrhne
  z layoutu, takže se zbytek posune hned.

:::live react libs=tailwind predict
```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <button onClick={() => setIsVisible(false)} className="mb-4 rounded bg-slate-900 px-3 py-2 text-sm text-white">
        Zavřít
      </button>
      {isVisible && (
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="rounded bg-white p-4 text-sm"
          >
            Kolo 12 vráceno.
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}
```
--question-- Co uvidíš po kliknutí na „Zavřít"?
--option-- Odstavec bude 1,2 s blednout a pak zmizí.
--option-- Odstavec zůstane, protože `AnimatePresence` ho podrží napořád.
--option*-- Odstavec zmizí okamžitě, bez blednutí.
--why-- Podmínka `isVisible &&` stojí **nad** `AnimatePresence`, takže se při přepnutí odmontuje celá `AnimatePresence` i s odstavcem — a odmontovaná komponenta už nemá jak cokoli podržet. `AnimatePresence` musí zůstat vykreslená pořád a podmínka patří dovnitř ní.
:::

:::explain
Vysvětli, proč `exit` nefunguje bez `AnimatePresence`, i když `initial` a `animate`
fungují samy o sobě.

## --model--
`initial` a `animate` se hrají na prvku, který v DOM je — Motion si ho najde a mění
mu styl. Při odchodu ale React prvek ze stromu odstraní hned, jak se změní podmínka,
takže by nebylo co animovat. `AnimatePresence` si pamatuje, co měla vykreslené
minule, odcházející prvek nechá ještě chvíli v DOM, přehraje na něm `exit`
a odstraní ho až potom.

## --checklist--
- `initial` a `animate` běží na prvku, který v DOM existuje.
- Při odchodu React prvek odmontuje okamžitě.
- `AnimatePresence` odcházející prvek podrží v DOM.
- Prvek se odstraní až po dokončení `exit`.
:::

:::check
Seznam výpůjček vykresluješ z pole a chceš odchodovou animaci. Co musí být splněné
u `key`, aby odešel opravdu smazaný řádek?

### --expected--
key musí být id položky, ne index v poli

### --accept--
stabilní klíč z dat, ne pořadí
id z dat — index se po smazání posune na jinou položku
:::

## Layout animace a `layoutId`

Prop `layout` řekne: „kdykoli se změní moje pozice nebo velikost, doanimuj to".
Motion si před překreslením změří rámeček prvku, po překreslení znovu, a rozdíl
dohraje `transform`em. Tomu se říká [[layout animace]] a v CSS ekvivalent nemá.

`layoutId` jde ještě dál. Dva různé prvky se stejným `layoutId` Motion považuje za
**tentýž** prvek: když jeden zmizí a druhý se objeví, plynule mezi nimi přeletí.
Tak se dělá podtržítko aktivní záložky nebo náhled, který se rozbalí do detailu.

:::live react libs=tailwind
```jsx
import { useState } from 'react';
import { motion } from 'motion/react';

const tabs = ['Přehled', 'Výpůjčky', 'Kola'];

export default function App() {
  const [active, setActive] = useState('Přehled');

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="relative px-4 py-2 text-sm font-medium text-slate-700"
          >
            {active === tab && (
              <motion.span
                layoutId="underline"
                className="absolute inset-x-1 bottom-0 h-0.5 rounded bg-violet-600"
              />
            )}
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
```
:::

Zkus `layoutId="underline"` z komponenty smazat: podtržítko pak jen skokem zmizí
a objeví se jinde. Pak zkus přidat `transition={{ type: 'spring', stiffness: 400, damping: 30 }}`.

> [!PITFALL]
> **`layout` na prvku, jehož rodič má `overflow-hidden` a mění výšku**, může
> vypadat, že „bliká". Motion animuje `transform`, ale ořez rodiče se mění skokem.
> Oprava: dej `layout` i rodiči, aby se doanimovala i změna výšky.

:::check
K čemu je `layoutId` navíc oproti `layout`?

### --expected--
spojí dva různé prvky v jeden, který mezi nimi přeletí

### --accept--
umí animovat přechod mezi dvěma prvky, ne jen pohyb jednoho
sdílený prvek mezi dvěma místy v UI
:::

## Gesta: `whileHover`, `whileTap`, `drag`

Gesta jsou další sada props a chovají se jako dočasná varianta: platí, dokud gesto
trvá, a pak se prvek vrátí do `animate`.

| prop | kdy platí |
|---|---|
| `whileHover` | kurzor je nad prvkem |
| `whileTap` | prvek je zmáčknutý (myší, prstem i Enterem u tlačítka) |
| `whileFocus` | prvek má fokus z klávesnice |
| `whileDrag` | prvek se právě táhne |

`drag` prvek zpřístupní k přetažení: `drag="x"` jen vodorovně, `dragConstraints`
omezí, kam až, `dragElastic` říká, jak moc se dá přetáhnout za hranici. V `onDragEnd`
dostaneš druhým argumentem `info` s `offset` (o kolik se posunul) a `velocity`
(jak rychle) — z toho se rozhoduje, jestli se oznámení zavře, nebo vrátí zpátky.

:::live react libs=tailwind
```jsx
import { useState } from 'react';
import { motion } from 'motion/react';

export default function App() {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="mb-8 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white"
      >
        Půjčit bike
      </motion.button>

      {!isDismissed && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(event, info) => {
            if (Math.abs(info.offset.x) > 100) setIsDismissed(true);
          }}
          className="w-72 cursor-grab rounded-xl bg-white p-4 text-sm shadow"
        >
          Kolo 07 hlásí baterii pod 15 %. Odtáhni mě do strany.
        </motion.div>
      )}
      {isDismissed && <p className="text-sm text-slate-500">Oznámení zavřeno.</p>}
    </div>
  );
}
```
:::

Zkus oznámení odtáhnout jen o kousek — `dragConstraints={{ left: 0, right: 0 }}`
ho pružinou vrátí zpátky. Pak zkus snížit práh ze `100` na `20`.

> [!PITFALL]
> **`whileHover` na `motion.div`, který má být tlačítko.** Příznak: myší to funguje,
> klávesnicí ne — Tabem se na prvek vůbec nedostaneš. Oprava: použij `motion.button`
> (nebo `<button>` s `motion.create`) a k `whileHover` přidej `whileFocus`,
> aby se to samé stalo i po zaostření klávesnicí.

:::check
Oznámení se má zavřít, když ho uživatel odtáhne dost daleko. Ve které props to
rozhodneš a co si v ní přečteš?

### --expected--
v onDragEnd, z info.offset.x

### --accept--
onDragEnd — druhý argument info má offset a velocity
v onDragEnd podle info.offset
:::

## Animace řízená scrollem

Tři hooky tvoří řetěz: `useScroll` vrací [[motion value]] s pozicí scrollu,
`useTransform` ji přepočítá na jinou hodnotu a `useSpring` ji vyhladí. Výsledek
předáš do `style` — ne do `animate`, protože hodnota se nemá „doanimovat", má
scrollu přesně odpovídat.

```jsx
const { scrollYProgress } = useScroll();                 // 1. 0 až 1 podle scrollu stránky
const smooth = useSpring(scrollYProgress, { stiffness: 200, damping: 30 }); // 2. vyhladit
const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);           // 3. přepočítat
```

:::live react libs=tailwind
```jsx
import { motion, useScroll, useSpring } from 'motion/react';

const rentals = Array.from({ length: 30 }, (_, index) => `Výpůjčka ${index + 1} — kolo ${(index % 12) + 1}`);

export default function App() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <div className="bg-slate-100">
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 h-1 origin-left bg-violet-600"
      />
      <ul className="space-y-2 p-8">
        {rentals.map((rental) => (
          <li key={rental} className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">{rental}</li>
        ))}
      </ul>
    </div>
  );
}
```
:::

Posuň ukázku dolů a sleduj pruh nahoře. Zkus `style={{ scaleX: scrollYProgress }}`
bez `useSpring` — pruh bude přesně kopírovat kolečko myši, i s trhnutími.

Motion value se mění **bez překreslení komponenty**, stejně jako animace z `animate`.
Kdybys pozici scrollu četl přes `useState` a posluchač `scroll`, komponenta by se
překreslovala v každém snímku.

> [!NOTE]
> Tři věci, které v dokumentaci potkáš a stačí o nich vědět: `onExitComplete` na
> `AnimatePresence` zavolá funkci, až všechny odchody doběhnou (třeba přesun fokusu);
> `LayoutGroup` propojí `layout` animace sourozeneckých komponent, které o sobě
> nevědí; `LazyMotion` s komponentou `m` místo `motion` zmenší balík, protože funkce
> animací se načtou až když jsou potřeba.

:::check
Proč se hodnota ze `useScroll` předává do `style`, a ne do `animate`?

### --expected--
má přesně odpovídat scrollu, ne se k němu doanimovat

### --accept--
style ji propisuje přímo, animate by mezi hodnotami animoval s vlastní délkou
animate by za scrollem zaostával
:::

## Omezený pohyb

Část uživatelů má v systému zapnuté „omezit pohyb" (macOS Předvolby, Windows
Usnadnění, Android Usnadnění). Prohlížeč to hlásí jako `prefers-reduced-motion:
reduce` a ty to znáš z `css-efekty-animace`. Motion na to má dvě odpovědi:

```jsx
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

Tohle obalení zařídí, že se všem animacím uvnitř **vypnou posuny a zvětšení**,
zatímco průhlednost animovat smí. To je přesně ten správný kompromis: uživatel
pořád vidí, že se něco změnilo, ale nic se po obrazovce nehýbe. Tomu říkáme
[[omezený pohyb]].

Když potřebuješ rozhodnout sám (třeba úplně vypnout automatické přehrávání), zeptej
se hookem:

```jsx
const shouldReduceMotion = useReducedMotion();
const offset = shouldReduceMotion ? 0 : 24;
```

> [!NOTE]
> Nastavení systému z testu ani z DevTools náhledu nezapneš tak, aby ho
> `useReducedMotion()` viděl. V DevTools Chromu se dá vynutit
> (Rendering → Emulate CSS prefers-reduced-motion), ale ověřuj hlavně to, že
> `MotionConfig` v aplikaci opravdu je.

:::check
Co udělá `reducedMotion="user"` s animací, která mění `x` a `opacity`, když má
uživatel omezený pohyb zapnutý?

### --expected--
x přeskočí, opacity animuje dál

### --accept--
posun vynechá, průhlednost nechá
zruší pohyb, blednutí zůstane
:::

## Kdy animaci nepoužít

Animace je drahá na pozornost. Každý pohyb říká „dívej se sem", a když to říká
všechno, neříká to nic. Čtyři situace, kde Motion nesahej:

- **Vstup celé stránky.** Když obsah přilétá po načtení, uživatel čeká na něco, co
  už mohl číst. Animuj jen to, co se změnilo **po** jeho akci.
- **Něco, co umí CSS.** Hover na tlačítku, barva při fokusu, rozbalení `data-state`
  u Radixu — na to stačí `transition` nebo `@keyframes` a nevozíš si kvůli tomu
  runtime.
- **Věci, které se dějí často.** Řádek, který se obnoví každou vteřinu z websocketu,
  animovat nechceš — bude to pořád skákat.
- **Cokoli nad ~400 ms u běžné interakce.** Po třetím kliknutí je pomalá animace
  jenom brzda.

> [!REMEMBER]
> **Animuj změnu, ne stav.** Dobrá animace odpovídá na otázku „co se právě stalo
> a kam to odešlo", ne „jak je tahle karta hezká".

:::check
Kartu produktu chceš zvětšit o 4 % při najetí myší. Napíšeš to Motionem, nebo CSS,
a proč?

### --expected--
CSS, hover zvládne transition bez knihovny

### --accept--
CSS transition — nepotřebuje to znát React stav
CSS, Motion je na to zbytečný
:::

## Typické chyby a pasti

> [!PITFALL]
> **`exit` bez `AnimatePresence`.** Příznak: vstup animuje, odchod je skokový, konzole
> mlčí. Motion prop `exit` prostě ignoruje, protože prvek už není v DOM. Oprava: obal
> podmínku (ne naopak) do `<AnimatePresence>`.

> [!PITFALL]
> **`key={index}` v `AnimatePresence`.** Příznak: smažeš druhý řádek ze čtyř a odejde
> poslední. Po smazání se indexy posunou, takže „klíč 3" najednou patří jiným datům
> a Motion považuje za zaniklý ten poslední. Oprava: `key={rental.id}`.

> [!PITFALL]
> **Dva prvky se stejným `layoutId` naráz.** Příznak: podtržítko se roztáhne přes
> obě záložky, nebo zůstane uprostřed. Motion umí spojit jen dvojici „jeden mizí,
> jeden vzniká". Oprava: vykresluj prvek s `layoutId` jen pro aktivní položku.

> [!PITFALL]
> **Radix `Dialog` s odchodovou animací bez `forceMount`.** Příznak: dialog hezky
> vjede, ale zavře se skokem. Radix si obsah odmontuje sám, hned jak se zavře, takže
> `AnimatePresence` nemá co podržet. Oprava: `Dialog.Portal forceMount` a
> `Dialog.Content asChild forceMount` a podmínku `{open && …}` si uvnitř
> `AnimatePresence` napiš sám.

> [!PITFALL]
> **Animace `width` a `height` u dlouhého seznamu.** Příznak: při přetahování nebo
> mazání to viditelně seká. Šířka a výška nutí prohlížeč přepočítat layout v každém
> snímku. Oprava: animuj `transform` (`x`, `y`, `scale`) a `opacity`, nebo nech práci
> na `layout`, který rozdíl rozměrů dohraje `transform`em.

> [!PITFALL]
> **Prvek přilétá znovu při každé aktualizaci dat.** Příznak: karta tržby se po
> každém obnovení čísel znovu vynoří zespodu, přestože se nic neotevřelo. Klíč karty
> je `key={stats.updatedAt}`, takže React při nové verzi dat kartu odmontuje, připojí
> novou a Motion na ní přehraje `initial` → `animate`. Oprava: klíč podle identity
> věci (`key="revenue"`, `key={bike.id}`), ne podle verze dat.

:::check
Dialog z Radixu vjíždí hezky, ale zavírá se skokem. Co k odchodové animaci chybí?

### --expected--
forceMount na Portal i Content, aby si Radix obsah neodmontoval sám

### --accept--
forceMount a podmínka uvnitř AnimatePresence
forceMount — jinak Radix obsah odstraní dřív, než Motion doanimuje
:::

## Kde to najdeš v MDN

- [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — media dotaz, který stojí za `reducedMotion="user"`; stejný, jaký jsi psal v CSS.
- [`transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) — vlastnost, do které Motion skládá `x`, `y`, `scale` i `rotate`; proto je animace levná.
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) — nativní API prohlížeče, přes které Motion pod kapotou animuje.
- [Motion for React — dokumentace](https://motion.dev/docs/react) — anglicky: úplný seznam props, `useScroll`, `useTransform` a `LazyMotion` pro menší balík.

# --questions--

## --question--

Máš `<AnimatePresence>{rentals.map((v) => <motion.li key={v.id} exit={{ opacity: 0 }}>…</motion.li>)}</AnimatePresence>`.
Smažeš z pole prostřední výpůjčku. Napiš, co Motion udělá s tím `<li>` a kdy ho
React odstraní z DOM.

### --expected--

podrží ho v DOM, přehraje exit a odstraní až po jejím dokončení

### --accept--

nechá ho chvíli v DOM, doanimuje exit a pak ho smaže

### --why--

`AnimatePresence` si drží seznam potomků z minulého vykreslení. Když někdo zmizí,
nechá ho vykresleného, spustí na něm `exit` a teprve po jejím dokončení ho pustí
z DOM. Proto na tom `key` tak záleží: podle něj se pozná, který potomek zanikl.

### --see--

react-ui-knihovny/motion-for-react#animatepresence-odchod-z-dom

## --question--

Jeden vývojář napsal `transition={{ type: 'spring', duration: 0.3 }}` a diví se, že
animace trvá jinak dlouho. Co je na tom špatně?

### --correct--

Pružina se neřídí délkou, ale tuhostí, tlumením a hmotností.

#### --why--

Čas u pružiny vyjde z fyziky — proto se u ní nastavuje `stiffness`, `damping`
a `mass`. Když chceš přesnou délku, patří tam `type: 'tween'` s `duration`.

### --answer--

`duration` se u pružiny počítá v milisekundách, mělo by tam být `300`.

#### --why--

Jednotky nejsou problém: Motion bere `duration` v sekundách všude stejně.
Přemýšlej o tom, čím je u pružiny daná doba doběhu.

### --answer--

`spring` potřebuje ještě `ease`, jinak si délku určí sám.

#### --why--

`ease` popisuje průběh tweenu. Pružina žádnou křivku průběhu nemá, počítá se
v každém snímku znovu.

### --see--

react-ui-knihovny/motion-for-react#pruzina-nebo-tween

## --question--

V dashboardu máš seznam, ze kterého se řádky přidávají a mažou, a chceš, aby se
zbylé řádky plynule posunuly na nová místa. Napiš, kterou prop na řádky přidáš
a proč to nejde zařídit CSS přechodem.

### --expected--

layout, protože změnu pozice z layoutu žádná CSS vlastnost nemění

### --accept--

prop layout — CSS transition potřebuje měněnou vlastnost, tady se mění jen pozice v toku

### --why--

CSS `transition` umí přechod jen mezi dvěma hodnotami jedné vlastnosti. Když se
řádek posune proto, že nad ním jiný zmizel, žádná jeho vlastnost se nezměnila —
změnil se výsledek layoutu. `layout` si rámeček změří před a po překreslení a rozdíl
dohraje `transform`em.

### --see--

react-ui-knihovny/motion-for-react#layout-animace-a-layoutid

## --question--

Napiš, co konkrétně `<MotionConfig reducedMotion="user">` udělá a proč je to lepší
než všechny animace úplně vypnout.

### --expected--

vypne posuny a zvětšení, průhlednost nechá animovat

### --accept--

u uživatelů s omezeným pohybem zruší pohyb, blednutí zůstane

### --why--

Uživatel s omezeným pohybem má problém s pohybem po obrazovce, ne se změnou
samotnou. Kdybys vypnul všechno, přišel by o informaci „něco se právě změnilo".
`reducedMotion="user"` proto nechá `opacity` být a zahodí `x`, `y`, `scale`
a `rotate`.

### --see--

react-ui-knihovny/motion-for-react#omezeny-pohyb
