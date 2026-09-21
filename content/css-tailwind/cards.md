## --card-- free

Jak v Tailwindu vycentruješ text uvnitř divu?

```html
<div>Nadpis</div>
```

### --back--

`<div class="text-center">Nadpis</div>` — utilita `text-center` nastaví
`text-align: center`. Jméno utility říká, co dělá, ne k čemu patří; proto se používá
stejně na nadpisu, v tlačítku i v buňce tabulky.

### --see--

css-tailwind/utility-first#utilita-jedna-deklarace-nad-tokenem

## --card-- output
Co přesně znamená zápis `md:flex`?
```html
<div class="md:flex"></div>
```
### --expected--
Aplikuje `display: flex` na obrazovkách větších než breakpoint `md` (768px). Na menších bude element blokový (výchozí).
### --why--
Tailwind je mobile-first. Třídy bez prefixu platí vždy, prefixy (`md:`, `lg:`) je přidávají na větších displejích.

## --card-- free
Jaký je rozdíl mezi `group-hover:` a běžným `hover:`?

### --back--

`hover:` se aktivuje jen při najetí na samotný element. `group-hover:` se aktivuje, pokud najedeš na obalovací element, který má na sobě třídu `group`.

Pomocí `group` a `group-hover` vytváříme závislé hover stavy – typicky u karet, kde při najetí na kartu zčervená nadpis.

## --card-- free

Co je utility-first a čím se liší od psaní vlastních tříd?

### --back--

Vzhled se skládá z mnoha malých tříd s jednou deklarací (`bg-white p-4 rounded-lg`)
místo jedné pojmenované třídy se stylopisem (`.karta`). Vzhled je pak vidět přímo ve
značce, stylopis nerozrůstá a smazáním komponenty zmizí i její styly — nezůstane po ní
mrtvé CSS.

### --see--

css-tailwind/utility-first#utilita-jedna-deklarace-nad-tokenem

## --card-- free

Kdy sáhneš po libovolné hodnotě v hranatých závorkách a co to o tvém projektu říká?

### --back--

Když na tu hodnotu není token: `top-[117px]`, `grid-cols-[1fr_320px]`, `bg-[#1f6f8b]`.
Je to únikový ventil, ne chyba — ale když se tatáž hodnota objeví potřetí, patří do
`@theme` jako pojmenovaný token.

### --see--

css-tailwind/utility-first#libovolne-hodnoty-unikovy-ventil

## --card-- free

Jak Tailwind pozná, které třídy má vygenerovat?

### --back--

Prohledá zdrojové soubory a hledá v nich **celá jména tříd** jako text. Proto
`` `bg-${barva}-500` `` nefunguje: takové jméno ve zdrojáku nikde nestojí. Píšou se
celá jména do objektu a vybírá se z nich.

### --see--

css-tailwind/utility-first#jak-tailwind-najde-tridy

## --card-- free

Jakou utilitu získáš z tokenu `--color-znacka` a jakou z `--radius-karta`?

### --back--

`--color-znacka` → `bg-znacka`, `text-znacka`, `border-znacka`, `ring-znacka` a další.
`--radius-karta` → `rounded-karta`. Rozhoduje **předpona**: `--color-*`, `--font-*`,
`--text-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`. Proměnná bez známé předpony
zůstane obyčejnou proměnnou.

### --see--

css-tailwind/theme-a-tokeny#theme-paleta-pismo-rozestupy

## --card-- free

Čím se liší proměnná v `@theme` od proměnné v `:root`?

### --back--

Proměnná z `@theme` je **obojí naráz**: dá se použít jako `var(--color-znacka)`
i jako třída `bg-znacka`. Proměnná v `:root` je jen proměnná — utilita z ní nevznikne.

### --see--

css-tailwind/theme-a-tokeny#co-jsou-tokeny-motivu

## --card-- free

Co je primitivní a co sémantický token a který patří do komponent?

### --back--

**Primitivní** je konkrétní barva (`--color-znacka-500`), **sémantický** je role
(`--color-plocha`, `--color-text`). Do komponent patří **sémantické** — pak je tmavý
motiv výměna hodnot na jednom místě, ne průchod celým projektem.

### --see--

css-tailwind/theme-a-tokeny#semanticke-tokeny-a-tmavy-motiv

## --card-- free

Co udělá `--color-*: initial;` uvnitř `@theme`?

### --back--

Zruší celou výchozí barevnou paletu Tailwindu. Hodí se, když má projekt používat jen
barvy značky — po zrušení si doplníš vlastní a na `bg-blue-500` se pak už nedá kliknout.
Stejně jde vypnout kterákoli skupina tokenů.

### --see--

css-tailwind/theme-a-tokeny#prepsani-a-vypnuti-vychozich-tokenu

## --card-- free

Prvek má `class="text-sm md:text-lg"`. Jak velký bude text na telefonu a proč?

### --back--

Malý. Varianta `md:` znamená „**od** 768 px výš", ne „do". Třída bez předpony je základ
platný všude — Tailwind je mobile-first. Proto se píše od nejmenší obrazovky a varianty
jsou výjimky směrem nahoru.

### --see--

css-tailwind/responzivita-a-stavy#mobil-prvni-trida-bez-predpony

## --card-- free

Čím se liší `md:` a `@md:`?

### --back--

`md:` se ptá na šířku **okna**, `@md:` na šířku **nejbližšího kontejneru** označeného
třídou `@container`. Znovupoužitelná komponenta má reagovat na místo, které dostala —
tatáž karta vypadá jinak v mřížce a jinak v úzkém panelu, i když je okno stejné.

### --see--

css-tailwind/responzivita-a-stavy#container-queries-kdyz-nerozhoduje-okno

## --card-- free

Kdy `focus:` a kdy `focus-visible:`?

### --back--

`focus:` platí při každém fokusu, tedy i po kliknutí myší — a obrys po kliknutí na
tlačítko vypadá jako chyba. `focus-visible:` nechá rozhodnutí na prohlížeči a ukáže se
hlavně při ovládání klávesnicí. Rušit obrys bez náhrady se nesmí nikdy.

### --see--

css-tailwind/responzivita-a-stavy#stavy-hover-focus-visible-a-dalsi

## --card-- free

Jaký je rozdíl mezi `group` a `peer`?

### --back--

**`group` je shora dolů**: rodič dostane `group`, potomek reaguje přes `group-hover:`.
**`peer` je zleva doprava**: sourozenec dostane `peer` a prvek **za ním** reaguje přes
`peer-checked:`. `peer` proto funguje jen na prvky, které v HTML stojí až za označeným.

### --see--

css-tailwind/responzivita-a-stavy#group-a-peer-reakce-na-jiny-prvek

## --card-- free

Jak zapneš animaci jen uživatelům, kteří nemají omezený pohyb — bez JavaScriptu?

### --back--

Variantou `motion-safe:` (`motion-safe:transition motion-safe:hover:scale-105`).
Opačná je `motion-reduce:`. Obě jsou navázané na systémové nastavení
`prefers-reduced-motion`.

### --see--

css-tailwind/responzivita-a-stavy#skladani-variant

## --card-- free

Stejný blok patnácti tříd máš na dvanácti místech. Jaké je pořadí řešení?

### --back--

1. **Komponenta nebo smyčka** — napsat HTML jednou (devět z deseti případů).
2. **`@utility`** — když chybí jedna deklarace a chceš na ni varianty.
3. **`@apply`** — jen na značky, které negeneruješ sám (obsah z CMS, markdown).
4. **`tailwind-merge`** — když komponenta bere třídy zvenčí.

### --see--

css-tailwind/komponenty-bez-duplicit#1-smycka-nebo-komponenta

## --card-- free

Proč se vlastní utilita píše přes `@utility` a ne jako obyčejná třída v CSS?

### --back--

Protože na `@utility` jdou použít varianty (`md:text-vyvazene`, `hover:zebricek-50`)
a zařadí se do stejné vrstvy jako ostatní utility. Obyčejná třída stojí mimo systém —
`md:moje-trida` by nevzniklo.

### --see--

css-tailwind/komponenty-bez-duplicit#2-utility-vlastni-utilita

## --card-- free

Prvek má `class="p-2 p-8"`. Které odsazení vyhraje?

### --back--

To, které je ve vygenerovaném **stylopisu** později — obě utility mají stejnou
specificitu. Pořadí v atributu `class` na CSS žádný vliv nemá. Proto má komponenta,
která bere `className` zvenčí, skládat třídy přes `tailwind-merge`.

### --see--

css-tailwind/komponenty-bez-duplicit#4-slucovani-trid-clsx-a-tailwind-merge

## --card-- free

K čemu je funkce `cn` z `clsx` a `twMerge`?

### --back--

`clsx` poskládá jména tříd podle podmínek, `twMerge` pozná dvojice, které nastavují
totéž (`px-4` a `px-8`), a nechá jen tu pozdější. Bez druhého kroku je výsledek
nepředvídatelný. V projektech s Tailwindem je `cn` tak běžná, že ji poznáš i v cizím kódu.

### --see--

css-tailwind/komponenty-bez-duplicit#4-slucovani-trid-clsx-a-tailwind-merge

## --card-- free

Co napíšeš spíš v čistém CSS než v utilitách?

### --back--

Složité `@keyframes` s víc mezistavy, generované mřížky s `calc()`, styly pro tisk
(`@media print`) a drobnosti jako `::selection` nebo `::marker`. Míchat obojí je
normální — tokeny z `@theme` fungují v obou světech.

### --see--

css-tailwind/komponenty-bez-duplicit#kdy-tailwind-a-kdy-ciste-css
