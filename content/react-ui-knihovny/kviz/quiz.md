---
pass: 0.8
---

# --questions--

## --question--

Napiš, jaký řetězec vrátí tohle volání, když `isWide` je `true`.

```js
twMerge(clsx('px-4 py-2', isWide && 'px-8', false && 'py-4'));
```

### --expected--

py-2 px-8

### --accept--

'py-2 px-8'
"py-2 px-8"

### --why--

`clsx` nejdřív zahodí `false` a slepí zbytek na `'px-4 py-2 px-8'`. Teprve `twMerge` pozná, že `px-4` a `px-8` nastavují stejnou vlastnost, a nechá tu pozdější. `py-2` s ničím nekoliduje, takže zůstane.

### --see--

react-ui-knihovny/tailwind-v-reactu#cn-clsx-a-tailwind-merge-v-jednom

## --question--

Tlačítko má varianty přes `cva`:

```js
const buttonVariants = cva('inline-flex rounded-lg', {
  variants: {
    variant: { primary: 'bg-slate-900 text-white', ghost: 'bg-transparent' },
    size: { sm: 'h-8 px-3', md: 'h-10 px-4' },
  },
  compoundVariants: [{ variant: 'ghost', size: 'sm', class: 'px-2' }],
  defaultVariants: { variant: 'primary', size: 'md' },
});
```

Volání je `buttonVariants({ size: 'sm' })`. Obsahuje výsledek třídu `px-2`?

### --correct--

Ne — chybějící `variant` doplní `defaultVariants` na `primary`, a kombinace `ghost` + `sm` tak nenastane.

#### --why--

`compoundVariants` se porovnávají s hodnotami **po** doplnění výchozích. Výchozí vzhled je `primary`, takže podmínka `variant: 'ghost'` neplatí.

### --answer--

Ano — `size` sedí a u `compoundVariants` stačí, když se shoduje aspoň jedna podmínka.

#### --why--

Kombinovaná varianta platí, jen když sedí **všechny** její podmínky současně. Jedna shoda nestačí — o to právě jde, jinak by se od obyčejné varianty ničím nelišila.

### --answer--

Ano — nezadaná prop `variant` se chová jako „cokoli", takže kombinace sedí.

#### --why--

Nezadaná prop není zástupný znak. `cva` ji nejdřív doplní z `defaultVariants` a teprve s touhle hodnotou porovnává.

### --answer--

Ne — `compoundVariants` se použijí jen tehdy, když zadáš všechny props ručně.

#### --why--

Hodnoty z `defaultVariants` se do porovnání počítají stejně jako ručně zadané. Kombinace by klidně platila i bez zadaných props, kdyby na ni sedly výchozí hodnoty.

### --see--

react-ui-knihovny/workshop-sada-komponent

## --question--

Dialog nastavení profilu otevřeš tlačítkem „Upravit profil" a zavřeš ho klávesou Escape. Radix dialog nemá nic navíc nastavené. Napiš, na kterém prvku bude fokus po zavření.

### --expected--

na tlačítku Upravit profil

### --accept--

tlačítko Upravit profil
na tlačítku, které dialog otevřelo
na spouštěči dialogu
na Dialog.Trigger

### --why--

Návrat fokusu na prvek, který dialog otevřel, je jedna z věcí, kterou primitivum řeší za tebe. Bez ní by fokus po zavření spadl na `body` a uživatel klávesnice by začínal znovu od začátku stránky.

### --see--

react-ui-knihovny/shadcn-a-radix#radix-primitiva-chovani-bez-vzhledu

## --question--

Kolega napsal `<Dialog.Root open={isOpen}>` a `isOpen` nastavuje jen tlačítko, které dialog otevírá. Co se stane, když uživatel v otevřeném dialogu zmáčkne Escape?

### --correct--

Nic — Radix jen ohlásí požadavek na zavření, ale bez `onOpenChange` ho nikdo nepřepíše do `isOpen`.

#### --why--

V řízeném režimu drží stav tvůj kód. Primitivum zavolá `onOpenChange(false)` a čeká, že stav změníš ty. Když ho nikdo neposlouchá, zůstane `open` pořád `true`.

### --answer--

Dialog se zavře, protože Radix si otevření drží vnitřně sám.

#### --why--

Vnitřní stav má primitivum jen v neřízeném režimu. Jakmile předáš `open`, bere se jako jediný zdroj pravdy a vnitřní stav se nepoužije.

### --answer--

React vyhodí chybu, že `open` bez `onOpenChange` není dovolené.

#### --why--

Žádná výjimka nepadne, komponenta se vykreslí normálně. Chyba se projeví jen chováním, proto se špatně hledá.

### --answer--

Escape nic neudělá, ale tlačítko `Dialog.Close` dialog zavře.

#### --why--

`Dialog.Close` i Escape i klik na překryv vedou na stejný požadavek. Když Escape stav nezmění, nezmění ho ani `Close`.

### --see--

react-ui-knihovny/shadcn-a-radix#rizeny-a-nerizeny-rezim

## --question--

Ikonové tlačítko se šipkou je přímo `DropdownMenu.Trigger`. Když je menu otevřené, Radix mu dá `data-state="open"`. Napiš tailwindovou třídu, která šipku v otevřeném stavu otočí o 180 stupňů.

### --expected--

data-[state=open]:rotate-180

### --accept--

data-[state=open]:rotate-180 transition-transform

### --why--

Stav je v atributu, který Radix na trigger zapíše sám. Varianta `data-[state=open]:` platí, jen dokud atribut má tuhle hodnotu, takže se šipka otočí bez jediné podmínky v JSX a bez vlastního stavu.

### --see--

react-ui-knihovny/shadcn-a-radix#stav-v-atributech-data-state
react-ui-knihovny/tailwind-v-reactu#stav-jako-data-atribut

## --question--

Vyšla nová verze shadcn/ui, která v komponentě `Dialog` opravuje chybu. Ty máš v projektu `components/ui/dialog.tsx`, do kterého jsi přidal vlastní velikosti. Co udělá `npm update`?

### --correct--

S tvým `dialog.tsx` nic — kód je v repozitáři, opravu si převezmeš ručně.

#### --why--

shadcn/ui nekopíruje balíček, ale zdrojový kód do tvého projektu. Aktualizuje se jen to, co je v `node_modules` (třeba `radix-ui` pod ním), tvůj soubor zůstane, jak je.

### --answer--

Stáhne novou verzi a tvoje úpravy velikostí přepíše.

#### --why--

`npm update` pracuje jen se závislostmi v `package.json`. Soubor v `components/ui` mezi ně nepatří, takže na něj nesáhne — přepsat by ho mohl až nový `add`.

### --answer--

Stáhne novou verzi a tvoje úpravy se sloučí jako u Gitu.

#### --why--

Žádné slučování se neděje, protože shadcn/ui v `node_modules` vůbec není. Představa „knihovna se aktualizuje sama" patří k běžným závislostem.

### --answer--

Skončí chybou, protože se liší verze `dialog.tsx` a `package-lock.json`.

#### --why--

Lockfile o souborech v `components/ui` nic neví. Nemá se tedy s čím rozcházet.

### --see--

react-ui-knihovny/shadcn-a-radix#shadcn-ui-kod-v-repozitari-ne-zavislost

## --question--

Při načítání se místo seznamu kol ukazuje skeleton. Když data dorazí, oba prvky jsou na okamžik vidět pod sebou a seznam poskočí. Kód:

```jsx
<AnimatePresence>
  {isLoading ? (
    <motion.div key="skeleton" exit={{ opacity: 0 }} />
  ) : (
    <motion.ul key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
  )}
</AnimatePresence>
```

Co s tím uděláš?

### --correct--

Přidáš `mode="wait"`, aby nový prvek začal až po odchodu starého.

#### --why--

Výchozí režim nechá odcházející i přicházející prvek v DOM současně. `mode="wait"` výměnu seřadí za sebou: nejdřív doběhne `exit`, pak se vykreslí nový.

### --answer--

Dáš oběma prvkům stejný `key`, aby je Motion považoval za jeden.

#### --why--

Se stejným `key` React prvek nevymění, jen ho přepoužije — a `AnimatePresence` pak nemá žádný odchod, na který by čekala. Výměna by proběhla skokem.

### --answer--

Přidáš seznamu `layout`, aby se posun doanimoval.

#### --why--

`layout` by poskočení jen rozmazal do pohybu. Oba prvky by pořád byly na chvíli vidět zároveň — příčina je v tom, jak `AnimatePresence` střídá potomky.

### --answer--

Zkrátíš `exit` skeletonu na nulu.

#### --why--

Tím odchodovou animaci zrušíš úplně a skeleton zmizí skokem. Chtěl jsi zachovat plynulost, jen bez překryvu.

### --see--

react-ui-knihovny/motion-for-react#animatepresence-odchod-z-dom

## --question--

Ukazatel aktivní záložky místo přeletu jen skočí. Každá záložka vykresluje:

```jsx
{activeTab === tab.id && <motion.span layoutId={tab.id} className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />}
```

Napiš, co je potřeba změnit.

### --expected--

layoutId musí být u všech záložek stejné

### --accept--

stejný layoutId pro všechny záložky
dát všem stejné layoutId, třeba "indicator"
layoutId nesmí záviset na tab.id

### --why--

Motion spojí mizející a vznikající prvek jen tehdy, když mají **stejné** `layoutId`. S `tab.id` je každý ukazatel jiný prvek, takže starý zmizí a nový se objeví bez přechodu.

### --see--

react-ui-knihovny/motion-for-react#layout-animace-a-layoutid

## --question--

Úvodní stránka má prezentaci, která se sama přepíná každých pět vteřin a každý snímek vjíždí zprava. Celá aplikace je obalená `<MotionConfig reducedMotion="user">`. Je tím omezený pohyb vyřešený?

### --correct--

Jen zčásti — vjíždění zmizí, ale automatické přepínání musíš vypnout sám podle `useReducedMotion()`.

#### --why--

`MotionConfig` mění, **jak** se animace přehraje: zahodí posun a nechá průhlednost. O tom, **jestli** se má snímek vůbec sám měnit, rozhoduje tvůj časovač, a ten o nastavení uživatele neví, dokud se nezeptáš.

### --answer--

Ano, `reducedMotion="user"` zastaví u takových uživatelů všechno, co se hýbe.

#### --why--

`MotionConfig` nezastavuje tvůj kód, jen upravuje animace Motionu. Časovač, který mění snímky, poběží dál.

### --answer--

Ne, `reducedMotion="user"` na posuny nemá vliv, vypíná jen průhlednost.

#### --why--

Je to obráceně. Omezený pohyb vadí kvůli pohybu po obrazovce, ne kvůli změně průhlednosti.

### --answer--

Ano, ale jen v Safari — ostatní prohlížeče nastavení systému nepředávají.

#### --why--

`prefers-reduced-motion` hlásí všechny současné prohlížeče. Na prohlížeči tu nic nezávisí.

### --see--

react-ui-knihovny/motion-for-react#omezeny-pohyb

## --question--

Skeleton se po načtení dat rozplyne. Zadání od designérky zní „přesně za 200 ms, rovnoměrně". Napiš, jaký `type` dáš do `transition`.

### --expected--

tween

### --accept--

'tween'
"tween"

### --why--

Tween má pevnou délku a křivku průběhu, takže se dá nastavit přesně `duration: 0.2`. Pružina délku nemá — vyjde z tuhosti a tlumení a na „přesně 200 ms" se nastavit nedá.

### --see--

react-ui-knihovny/motion-for-react#pruzina-nebo-tween

## --question--

V tabulce stojanů se obsazenost aktualizuje každou vteřinu z websocketu. Kolega chce, aby každé nové číslo poskočilo přes `animate={{ scale: [1, 1.2, 1] }}`. Co mu řekneš?

### --correct--

Ať to nedělá — změna, která přichází pořád, by celou tabulku neustále rozhýbávala a nic nezvýraznila.

#### --why--

Animace říká „dívej se sem". U hodnot, které se mění každou vteřinu, by to říkala všude pořád, takže by přestala nést informaci a jen by rušila čtení.

### --answer--

Ať to dělá přes CSS `@keyframes`, protože Motion je na to pomalý.

#### --why--

Problém není v tom, čím se animace přehraje. Stejně rušivé by to bylo v CSS i v Motionu.

### --answer--

Ať to dělá, jen ať místo `scale` použije `layout`.

#### --why--

`layout` doanimuje změnu pozice nebo velikosti z layoutu. Tady se nic neposouvá, jen se mění text — a otázka je, jestli animovat vůbec.

### --answer--

Ať to dělá, jen ať délku animace zkrátí pod 400 ms.

#### --why--

Krátká animace je lepší než dlouhá, ale tady je problém v četnosti. Po vteřině přijde další a další.

### --see--

react-ui-knihovny/motion-for-react#kdy-animaci-nepouzit

## --question--

Najdi na MDN stránku media dotazu `prefers-reduced-motion` (anglicky). Napiš hodnotu, kterou dotaz hlásí, když uživatel omezení pohybu v systému **nezapnul**.

### --expected--

no-preference

### --why--

Dotaz má dvě hodnoty: `reduce` a `no-preference`. Právě proto se pravidla pro omezený pohyb píšou do `@media (prefers-reduced-motion: reduce)` — výchozí stav žádná zvláštní pravidla nepotřebuje.

### --see--

react-ui-knihovny/motion-for-react#omezeny-pohyb

## --question--

Panel detailu je Radix `Dialog` s `Dialog.Portal`, takže je v DOM přímo v `<body>`. V JSX je ale napsaný uvnitř `<article onClick={selectRow}>`. Uživatel klikne na tlačítko uvnitř dialogu. Zavolá se `selectRow`?

### --correct--

Ano — události v Reactu probublávají podle stromu komponent, ne podle DOM.

#### --why--

Portál mění jen to, kam se prvek zapíše do DOM. Pro React je dialog pořád potomkem `article`, takže klik k jeho `onClick` doputuje.

### --answer--

Ne — v DOM dialog v `article` není, takže tam událost nemá jak doputovat.

#### --why--

Tak by to fungovalo u posluchačů přes `addEventListener`. React ale bublání vede po svém stromu komponent a na polohu v DOM nehledí.

### --answer--

Ne — Radix v portálu bublání vždy zastaví přes `stopPropagation`.

#### --why--

Radix bublání obecně nezastavuje. Kdyby to dělal, rozbil by ti obsluhy událostí výš ve stromu.

### --answer--

Ano, ale jen když je dialog v neřízeném režimu.

#### --why--

Řízený a neřízený režim rozhoduje, kdo drží stav otevření. Na cestu událostí nemá žádný vliv.

### --see--

react-hloubka/chyby-suspense-portaly#portal-v-domu-jinde-ve-stromu-reactu-doma

## --question--

Tvoje komponenta `Button` ze sady má dostat `ref` od rodiče, aby rodič mohl zavolat `focus()`. Projekt je na React 19. Napiš, jak `Button` ten `ref` přijme.

### --expected--

jako obyčejnou prop ref

### --accept--

jako prop ref
přes props, function Button({ ref, ...props })
ref je normální prop, forwardRef netřeba

### --why--

V React 19 je `ref` u funkční komponenty obyčejná prop: vytáhneš ho z props a předáš na `<button>`. `forwardRef` už potřeba není — potkáš ho jen ve starším kódu a ve starších zkopírovaných komponentách.

### --see--

react-hloubka/useref-a-dom#ref-je-v-react-19-obycejna-prop
react-ui-knihovny/workshop-sada-komponent

## --question--

Oznámení se po čtyřech vteřinách zavírá samo:

```jsx
useEffect(() => {
  setTimeout(() => onDismiss(toast.id), 4000);
}, [toast.id]);
```

Uživatel oznámení zavře ručně po vteřině. Napiš, co v efektu chybí, aby časovač po zavření neběžel dál.

### --expected--

úklid s clearTimeout

### --accept--

return () => clearTimeout(timer)
vrátit funkci, která zavolá clearTimeout
cleanup s clearTimeout

### --why--

Efekt nastartoval časovač, ale nevrátil úklid. Po odmontování oznámení tak časovač doběhne a zavolá `onDismiss` pro už zavřené oznámení. Id časovače si ulož do proměnné a v úklidu ho zruš.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

## --question--

Karta statistiky je obalená v `memo` a rodič jí předává `variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}` zapsané přímo v JSX. Rodič se každou vteřinu překreslí kvůli hodinám. Karta se kvůli tomu překresluje taky. Napiš nejjednodušší opravu.

### --expected--

přesunout objekt variant mimo komponentu

### --accept--

definovat variants jako konstantu mimo komponentu
vytáhnout variants do konstanty nad komponentou
dát variants mimo tělo rodiče

### --why--

Objektový literál v JSX vzniká při každém renderu znovu, takže `memo` vidí pokaždé jinou hodnotu. Varianty na ničem z renderu nezávisí — konstanta mimo komponentu je jeden objekt navždy a `useMemo` tu ani není potřeba.

### --see--

react-hloubka/render-a-rerender#identita-kazdy-render-vyrabi-nove-objekty-a-funkce

# --code-- Upozornění stanic sdílených kol

## --file-- alerts.jsx

```jsx
import * as React from 'react';
import { Dialog } from 'radix-ui';
import { AnimatePresence, motion } from 'motion/react';

const INITIAL_ALERTS = [
  { id: 'a-101', station: 'Anděl', level: 'warning', text: 'Stojan 4 hlásí slabý signál' },
  { id: 'a-102', station: 'Florenc', level: 'danger', text: 'Kolo 118 se nevrátilo 26 hodin' },
  { id: 'a-103', station: 'Palmovka', level: 'info', text: 'Plánovaná údržba ve čtvrtek' },
];

function Badge(props) {
  const { className, children, ...rest } = props;
  return (
    <span className={'rounded-full px-2 py-0.5 text-xs font-medium ' + className} {...rest}>
      {children}
    </span>
  );
}

const LEVEL_CLASSES = {
  info: 'bg-sky-100 text-sky-800',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-800',
};

export default function AlertsPanel() {
  const [alerts, setAlerts] = React.useState(INITIAL_ALERTS);
  const [selectedId, setSelectedId] = React.useState(null);

  function dismiss(id) {
    setAlerts(function (current) {
      return current.filter(function (alert) {
        return alert.id !== id;
      });
    });
  }

  let selected = null;
  for (let i = 0; i < alerts.length; i++) {
    if (alerts[i].id === selectedId) selected = alerts[i];
  }

  return (
    <section className="max-w-md space-y-3 p-6">
      <h2 className="text-lg font-semibold">Upozornění stanic</h2>
      <ul className="space-y-2">
        <AnimatePresence>
          {alerts.map(function (alert, i) {
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
              >
                <Badge className={'px-3 ' + LEVEL_CLASSES[alert.level]}>{alert.station}</Badge>
                <button type="button" className="flex-1 text-left text-sm" onClick={() => setSelectedId(alert.id)}>
                  {alert.text}
                </button>
                <button type="button" aria-label="Skrýt upozornění" onClick={() => dismiss(alert.id)}>
                  ×
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <Dialog.Root
        open={selected !== null}
        onOpenChange={function (isOpen) {
          if (!isOpen) setSelectedId(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5">
            {selected && (
              <>
                <h3 className="text-base font-semibold">Stanice {selected.station}</h3>
                <Dialog.Description className="mt-2 text-sm text-slate-600">
                  {selected.text}
                </Dialog.Description>
                <div className="mt-4 flex justify-end gap-2">
                  <Dialog.Close className="rounded-lg px-3 py-1.5 text-sm">Zavřít</Dialog.Close>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white"
                    onClick={() => {
                      dismiss(selected.id);
                      setSelectedId(null);
                    }}
                  >
                    Vyřešeno
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
```

## --question--

Uživatel se čtečkou obrazovky otevře detail upozornění (řádky 70–102 v `alerts.jsx`). Co uslyší jako název dialogu?

### --correct--

Žádný název, jen „dialog" — nadpis na řádku 81 je obyčejné `h3`, ne `Dialog.Title`.

#### --why--

Radix propojí dialog s názvem přes `aria-labelledby`, ale jen s tím, co mu dáš jako `Dialog.Title`. Nadpis `h3` v obsahu si sám nevyhledá.

### --answer--

„Stanice Anděl" — Radix vezme první nadpis v obsahu.

#### --why--

Primitivum žádné nadpisy neprohledává. Kdyby to dělalo, nepotřeboval by samostatnou část pro název.

### --answer--

Text z `Dialog.Description` na řádku 82, protože jiný popisek dialog nemá.

#### --why--

`Description` se propojí přes `aria-describedby` a čtečka ho přečte jako doplňující popis. Název dialogu nenahrazuje.

### --answer--

Nic — bez názvu Radix dialog vůbec neotevře.

#### --why--

Dialog se otevře a vypadá normálně, proto se ta chyba snadno přehlédne. Chybí jen propojení s názvem.

### --see--

react-ui-knihovny/shadcn-a-radix#typicke-chyby-a-pasti

## --question--

Seznam obsahuje tři upozornění a uživatel skryje to první (Anděl). Odchodovou animaci ale přehraje řádek s Palmovkou. Napiš číslo řádku v `alerts.jsx`, na kterém je příčina.

### --expected--

51

### --why--

`key={i}` dává klíč podle pozice. Po smazání prvního upozornění dostane Florenc klíč 0 a Palmovka 1 — klíč 2 zmizel, a `AnimatePresence` proto přehraje `exit` na posledním řádku. Oprava je `key={alert.id}`.

### --see--

react-ui-knihovny/motion-for-react#typicke-chyby-a-pasti

## --question--

Štítek na řádku 57 chce širší odsazení `px-3`, ale v prohlížeči má někdy `px-2` a někdy `px-3`, podle toho, v jakém pořadí Tailwind pravidla vygeneroval. Napiš, čím nahradíš výraz v `className` na řádku 14.

### --expected--

cn('rounded-full px-2 py-0.5 text-xs font-medium', className)

### --accept--

twMerge('rounded-full px-2 py-0.5 text-xs font-medium', className)
twMerge(clsx('rounded-full px-2 py-0.5 text-xs font-medium', className))
cn("rounded-full px-2 py-0.5 text-xs font-medium", className)

### --why--

Obyčejné spojení řetězců nechá v atributu `px-2` i `px-3` a o vítězi rozhodne pořadí ve vygenerovaném CSS. `cn()` přes `tailwind-merge` konfliktní `px-2` odstraní, takže vyhraje vždy třída od volajícího. Navíc bez `className` by na konci atributu nezůstalo slovo `undefined`.

### --see--

react-ui-knihovny/tailwind-v-reactu#cn-clsx-a-tailwind-merge-v-jednom

## --question--

Dialog na řádcích 70–75 je řízený (`open` a `onOpenChange`). Uživatel v otevřeném detailu zmáčkne Escape. Co se stane?

### --correct--

Radix zavolá funkci z řádku 72 s `false`, ta vynuluje `selectedId`, `selected` je `null` a dialog se zavře.

#### --why--

`open` se počítá ze `selectedId`, takže zavřít dialog znamená vynulovat výběr. Přesně to udělá obsluha `onOpenChange` — kód je v tomhle místě v pořádku.

### --answer--

Dialog se nezavře, protože `open` je výraz, a ne stav.

#### --why--

`open` smí být jakákoli pravdivostní hodnota spočtená při renderu. Důležité je, že se po `onOpenChange` změní data, ze kterých se počítá.

### --answer--

Dialog se zavře, ale upozornění zmizí i ze seznamu.

#### --why--

Ze seznamu maže jen `dismiss`, a ten volá tlačítko „Vyřešeno" a křížek. Obsluha `onOpenChange` jen ruší výběr.

### --answer--

Dialog se zavře a hned zase otevře, protože `selectedId` zůstane nastavené.

#### --why--

Podívej se, co obsluha `onOpenChange` udělá, když dostane `false`. Výběr po ní nastavený nezůstane.

### --see--

react-ui-knihovny/shadcn-a-radix#rizeny-a-nerizeny-rezim
