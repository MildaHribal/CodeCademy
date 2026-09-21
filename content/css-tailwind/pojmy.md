## --term-- utility-first

en: utility-first
aliases: utility first, utility-first myšlení, utility-first přístup
lekce: css-tailwind/utility-first#utilita-jedna-deklarace-nad-tokenem

Přístup, ve kterém se vzhled skládá z mnoha malých tříd s jednou deklarací
(`bg-white`, `p-4`, `rounded-lg`) místo jedné pojmenované třídy se stylopisem
(`.karta`). Vzhled je pak vidět přímo ve značce a stylopis nerozrůstá.

## --term-- token motivu

en: theme token
aliases: tokeny motivu, tokenů motivu, tokenem motivu, token v @theme, tokeny v @theme
lekce: css-tailwind/theme-a-tokeny#co-jsou-tokeny-motivu

Pojmenovaná hodnota v bloku `@theme`, ze které Tailwind odvodí utility. Z
`--color-znacka: #1f6f8b` vzniknou `bg-znacka`, `text-znacka`, `border-znacka`
a zároveň obyčejná CSS proměnná `var(--color-znacka)`.

## --term-- @theme

en: @theme
aliases: theme direktiva, blok theme, direktiva @theme
lekce: css-tailwind/theme-a-tokeny#theme-paleta-pismo-rozestupy

Direktiva Tailwindu v4, do které se píše celé nastavení vzhledu — přímo v CSS, místo
dřívějšího `tailwind.config.js`. Proměnná v ní není jen proměnná: podle předpony
(`--color-*`, `--font-*`, `--spacing`) z ní Tailwind vyrobí odpovídající utility.

## --term-- varianta

en: variant
aliases: varianty, variantu, variantou, variant, modifikátor třídy
lekce: css-tailwind/responzivita-a-stavy#stavy-hover-focus-visible-a-dalsi

Předpona třídy zakončená dvojtečkou (`hover:`, `md:`, `dark:`, `group-hover:`), která
utilitu zapne jen za určité podmínky. Varianty se dají skládat za sebe:
`md:hover:bg-znacka`.

## --term-- libovolná hodnota

en: arbitrary value
aliases: libovolné hodnoty, libovolnou hodnotu, arbitrary value, hodnota v hranatých závorkách
lekce: css-tailwind/utility-first#libovolne-hodnoty-unikovy-ventil

Hodnota napsaná přímo do třídy v hranatých závorkách: `top-[117px]`, `bg-[#1f6f8b]`,
`grid-cols-[1fr_320px]`. Únikový ventil pro případ, na který token není — a zároveň
signál, že možná chybí token.

## --term-- @utility

en: @utility
aliases: direktiva @utility, vlastní utilita, vlastní utility
lekce: css-tailwind/komponenty-bez-duplicit#2-utility-vlastni-utilita

Direktiva, kterou si vyrobíš vlastní utilitu. Narozdíl od obyčejné třídy v CSS umí
všechno, co utility Tailwindu — dá se na ni použít varianta (`hover:`, `md:`) a zařadí
se do správné vrstvy.

## --term-- @apply

en: @apply
aliases: direktiva @apply, apply
lekce: css-tailwind/komponenty-bez-duplicit#3-apply-a-proc-stridme

Direktiva, která vezme utility a vloží jejich deklarace do vlastní třídy. Svádí k tomu
vyrobit si zpátky `.karta` se vším všudy — a tím se ztratí to, kvůli čemu se Tailwind
používá. Používá se střídmě, hlavně na cizí značky, které nejde otřídovat.

## --term-- container query v Tailwindu

en: container query
aliases: at-container, třída @container, container varianta
lekce: css-tailwind/responzivita-a-stavy#container-queries-kdyz-nerozhoduje-okno

Varianta `@md:`, `@lg:` a spol., která se řídí šířkou **nejbližšího kontejneru**
označeného třídou `@container`, ne šířkou okna. Díky tomu se stejná komponenta chová
správně v širokém i úzkém sloupci.
