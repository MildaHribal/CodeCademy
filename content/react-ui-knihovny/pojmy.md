## --term-- slučování tříd

en: class merging
aliases: sloučení tříd, sloučení třídy, sloučit třídy, slučování třídy
lekce: react-ui-knihovny/tailwind-v-reactu#cn-clsx-a-tailwind-merge-v-jednom

Spojení několika seznamů utility tříd do jednoho tak, že u tříd ze stejné skupiny
(`p-2` a `p-4`) zůstane jen poslední. Dělá to `tailwind-merge`, protože pořadí tříd
v atributu `class` o výsledku nerozhoduje — rozhoduje pořadí pravidel ve stylu.

## --term-- varianta komponenty

en: component variant
aliases: varianty komponenty, variantu komponenty, variantě komponenty, variant komponenty
lekce: react-ui-knihovny/tailwind-v-reactu#varianty-v-mape-trid

Pojmenovaný vzhled komponenty, který se vybírá props (`variant="nebezpeci"`, `size="sm"`).
Třídy jednotlivých variant jsou v mapě na jednom místě, takže volající píše jméno
a ne seznam tříd.

## --term-- stavový atribut

en: state attribute
aliases: stavové atributy, stavovém atributu, stavového atributu, stavovými atributy
lekce: react-ui-knihovny/tailwind-v-reactu#stav-jako-data-atribut

Atribut `data-*` nebo `aria-*`, kterým komponenta hlásí svůj stav přímo do DOM
(`data-state="open"`, `aria-selected="true"`). Tailwind na něj umí variantu
`data-[state=open]:`, takže stav jde nastylovat bez podmínky v JSX.

## --term-- řízený režim

en: controlled mode
aliases: řízeném režimu, řízeného režimu, řízeným režimem, neřízený režim, neřízeném režimu, neřízeného režimu
lekce: react-ui-knihovny/shadcn-a-radix#rizeny-a-nerizeny-rezim

Režim, ve kterém stav komponenty drží tvůj kód a komponenta jen hlásí požadavek na
změnu (`open` + `onOpenChange`). Opakem je neřízený režim, kde si stav drží komponenta
sama a ty nanejvýš určíš výchozí hodnotu.

## --term-- past na fokus

en: focus trap
aliases: pasti na fokus, pastí na fokus, past na fokus v dialogu
lekce: react-ui-knihovny/shadcn-a-radix#radix-primitiva-chovani-bez-vzhledu

Uzavření fokusu do otevřeného dialogu: Tab a Shift+Tab chodí jen po prvcích uvnitř
a na konci se vrátí na začátek. Bez ní uživatel klávesnice odejde za dialog na stránku,
kterou přitom nevidí.

## --term-- orchestrace

en: orchestration
aliases: orchestraci, orchestrace animací, orchestrací
lekce: react-ui-knihovny/motion-for-react#varianty-a-orchestrace

Řízení toho, kdy která animace ve skupině začne. Rodič rozdá potomkům stejně
pojmenovanou variantu a v `transition` si přes `staggerChildren` a `delayChildren`
určí prodlevu mezi nimi.

## --term-- odchodová animace

en: exit animation
aliases: odchodové animace, odchodovou animaci, odchodovou animací, odchodová animace prvku
lekce: react-ui-knihovny/motion-for-react#animatepresence-odchod-z-dom

Animace, která se přehraje, když prvek mizí ze stromu komponent. Musí ji někdo
podržet v DOM — v Motionu to dělá `AnimatePresence`, která odcházející prvek
odstraní až po dokončení `exit`.

## --term-- layout animace

en: layout animation
aliases: layout animace, layout animaci, layout animací, layoutové animace
lekce: react-ui-knihovny/motion-for-react#layout-animace-a-layoutid

Plynulý přechod mezi dvěma pozicemi nebo velikostmi, které vyplynuly z layoutu, ne
ze změny vlastnosti. Motion si prvek změří před překreslením a po něm a rozdíl
dohraje `transform`em; zapíná se prop `layout`.

## --term-- omezený pohyb

en: reduced motion
aliases: omezeného pohybu, omezeným pohybem, omezený pohyb
lekce: react-ui-knihovny/motion-for-react#omezeny-pohyb

Systémové nastavení „omezit pohyb", které prohlížeč hlásí jako
`prefers-reduced-motion: reduce`. V Motionu na něj reaguje `MotionConfig
reducedMotion="user"`: zahodí posuny a zvětšení, průhlednost animovat nechá.
