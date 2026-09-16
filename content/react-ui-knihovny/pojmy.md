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
