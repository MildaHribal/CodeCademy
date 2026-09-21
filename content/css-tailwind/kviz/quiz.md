---
pass: 0.8
---

## --question--

Který zápis nastaví elementu modré pozadí až na tabletu (`md`), zatímco na mobilu zůstane bílé?

### --answer--

`md:bg-white bg-blue-500`
#### --why--

Tailwind je mobile-first. Tohle by dalo modrou všem zařízením a na tabletu by ji přepsalo na bílou. Chtěli jsme opak.

### --correct--

`bg-white md:bg-blue-500`
#### --why--

Výborně. Třída bez prefixu nastaví bílé pozadí pro mobilní zobrazení, a jakmile displej dosáhne velikosti `md`, aplikuje se modrá barva.

### --see--

css-tailwind/responzivita-a-stavy#mobil-prvni-trida-bez-predpony

## --question--

Jak do Tailwindu v4 přidáš vlastní barvu pod jménem `brand`?

### --answer--

V `tailwind.config.js` do objektu `theme.colors`.
#### --why--

Tohle platilo ve starších verzích Tailwindu. Verze 4 přináší konfiguraci přímo v CSS pomocí `@theme`.

### --correct--

V CSS souboru v bloku `@theme` definováním `--color-brand`.
#### --why--

Přesně tak. Tailwind v4 si proměnné definované ve `@theme` automaticky načte jako design tokeny a vygeneruje z nich utility (např. `text-brand`).

### --see--

css-tailwind/theme-a-tokeny#co-jsou-tokeny-motivu

## --question--

Pokud chceš, aby podtržení odkazu vzniklo jen tehdy, když uživatel najede myší na obalovací kartu, použiješ:

### --answer--

`hover:underline` na odkazu a na kartu nedáš nic.
#### --why--

`hover:` se aktivuje, jen když najedeš myší přímo na ten konkrétní prvek (na odkaz).

### --correct--

Třídu `group` na kartu a `group-hover:underline` na odkaz.
#### --why--

Ano, třída `group` na obalovacím elementu propojí stav s potomky, kteří používají prefix `group-hover:`.

### --see--

css-tailwind/responzivita-a-stavy#group-a-peer-reakce-na-jiny-prvek

## --question--

Napiš, jakou proměnnou přidáš do `@theme`, aby vznikla utilita `rounded-karta`.

### --expected--

--radius-karta

### --accept--

--radius-karta: 0.75rem;
--radius-karta: hodnota

### --why--

Předpona rozhoduje, co z proměnné vznikne: `--color-*` dělá barevné utility,
`--radius-*` zaoblení, `--shadow-*` stíny, `--font-*` písma. Proměnná bez známé předpony
zůstane obyčejnou CSS proměnnou.

### --see--

css-tailwind/theme-a-tokeny#theme-paleta-pismo-rozestupy

## --question--

Čím se liší proměnná v `@theme` od proměnné v `:root`?

### --correct--

Z `@theme` vzniknou navíc utility; proměnná v `:root` je jen proměnná.

#### --why--

Token z `@theme` je obojí naráz — dá se použít jako `var(--color-znacka)` i jako třída
`bg-znacka`. Proto se ve verzi 4 všechno nastavení vzhledu píše právě tam.

### --answer--

`@theme` platí jen uvnitř komponenty, `:root` globálně.

#### --why--

Obojí platí globálně.

### --answer--

`@theme` funguje jen v konfiguračním souboru.

#### --why--

Ve verzi 4 žádný konfigurační soubor není — `@theme` se píše přímo do CSS.

### --see--

css-tailwind/theme-a-tokeny#co-jsou-tokeny-motivu

## --question--

Napiš, od jaké šířky okna platí varianta `md:`.

### --expected--

768px

### --accept--

768
768 px
od 768px výš

### --why--

Výchozí body zlomu jsou `sm` 640, `md` 768, `lg` 1024, `xl` 1280 a `2xl` 1536 pixelů —
a všechny znamenají „**od** téhle šířky výš". Proto je třída bez předpony základ pro
telefon.

### --see--

css-tailwind/responzivita-a-stavy#mobil-prvni-trida-bez-predpony

## --question--

Komponenta se má chovat jinak v širokém sloupci a jinak v úzkém panelu, i když je okno stejné. Co použiješ?

### --correct--

Container queries: rodiči třídu `@container` a uvnitř varianty `@md:`, `@lg:`.

#### --why--

`md:` se ptá na okno, `@md:` na nejbližší kontejner. Znovupoužitelná komponenta má
reagovat na místo, které dostala, ne na velikost obrazovky.

### --answer--

`md:` s vlastním bodem zlomu pro úzký panel.

#### --why--

Bod zlomu se pořád měří proti oknu, takže v obou místech vyjde stejně.

### --answer--

Dvě verze komponenty pro dvě místa.

#### --why--

Tím vzniknou dvě věci, které se musí udržovat zvlášť — přesně to, čemu se chceš vyhnout.

### --see--

css-tailwind/responzivita-a-stavy#container-queries-kdyz-nerozhoduje-okno

## --question--

Napiš variantu, kterou obarvíš obrys tlačítka jen při ovládání klávesnicí.

### --expected--

focus-visible:

### --accept--

focus-visible
focus-visible:outline-2

### --why--

`focus:` platí i po kliknutí myší, což u tlačítka vypadá jako chyba. `focus-visible:`
nechá rozhodnutí na prohlížeči — a ten obrys ukáže tam, kde ho uživatel potřebuje.
Rušit ho bez náhrady je nejrychlejší způsob, jak stránku znepřístupnit pro klávesnici.

### --see--

css-tailwind/responzivita-a-stavy#stavy-hover-focus-visible-a-dalsi

## --question--

Karta má při najetí myší kamkoli na ni ztmavit nadpis uvnitř. Jak to uděláš?

### --correct--

Kartě dám třídu `group` a nadpisu `group-hover:text-…`.

#### --why--

`group` funguje shora dolů: rodič se označí, potomci reagují. Na sourozence, který stojí
v HTML za označeným prvkem, je `peer`.

### --answer--

Nadpisu dám `hover:text-…`.

#### --why--

To by reagovalo jen při najetí přímo na nadpis, ne na celou kartu.

### --answer--

Kartě dám `peer` a nadpisu `peer-hover:`.

#### --why--

`peer` funguje mezi sourozenci, ne mezi rodičem a potomkem. Uvnitř karty nezabere.

### --see--

css-tailwind/responzivita-a-stavy#group-a-peer-reakce-na-jiny-prvek

## --question--

Napiš variantu, kterou zapneš animaci jen uživatelům bez omezení pohybu.

### --expected--

motion-safe:

### --accept--

motion-safe
motion-safe:transition

### --why--

`motion-safe:` platí při `prefers-reduced-motion: no-preference`, `motion-reduce:`
naopak. Tlumená varianta se tím dá udělat bez jediného řádku JavaScriptu.

### --see--

css-tailwind/responzivita-a-stavy#skladani-variant

## --question--

Blok patnácti tříd máš na dvanácti místech. Napiš první krok, který uděláš.

### --expected--

udělám z toho komponentu

### --accept--

smyčka v šabloně
komponenta nebo smyčka
napíšu HTML jednou

### --why--

Duplicita tříd je příznak duplicity značky. `@apply` by symptom schoval do CSS, ale HTML
by se opakovalo dál — a při změně struktury bys obcházel dvanáct míst.

### --see--

css-tailwind/komponenty-bez-duplicit#1-smycka-nebo-komponenta

## --question--

Kdy je `@apply` na místě?

### --correct--

U značek, které negeneruješ sám — obsah z redakčního systému, markdown, cizí widget.

#### --why--

Tam žádná komponenta nepomůže. Ve vlastních komponentách má `@apply` skoro vždycky
znamenat, že měla vzniknout komponenta.

### --answer--

Kdykoli se blok tříd opakuje víc než třikrát.

#### --why--

To je situace pro komponentu. `@apply` z toho udělá jen pojmenovanou třídu a rostoucí
stylopis — tedy přesně to, před čím Tailwind utíkal.

### --answer--

Nikdy, `@apply` bylo z verze 4 odstraněno.

#### --why--

Odstraněné není. Jen se s ním nemá začínat.

### --see--

css-tailwind/komponenty-bez-duplicit#3-apply-a-proc-stridme

## --question--

Prvek má `class="p-2 p-8"`. Napiš, co rozhoduje o výsledku.

### --expected--

pořadí ve stylopisu

### --accept--

pořadí pravidel v css
to, která utilita je v css později
ne pořadí v atributu class

### --why--

Obě utility mají stejnou specificitu, takže vyhraje ta, která je ve vygenerovaném CSS
později. Pořadí v atributu `class` nemá na CSS vliv — proto existuje `tailwind-merge`.

### --see--

css-tailwind/komponenty-bez-duplicit#4-slucovani-trid-clsx-a-tailwind-merge

## --question--

`className={`bg-${barva}-500`}` nefunguje. Proč?

### --correct--

Tailwind hledá ve zdrojových souborech **celá jména tříd**. Jméno poskládané až za běhu tam není, takže se nevygeneruje.

#### --why--

Řeší se to tím, že se celá jména napíšou do objektu a jen se z nich vybírá:
`{ modra: 'bg-sky-500', cervena: 'bg-red-500' }[barva]`.

### --answer--

Protože se šablonové řetězce v `className` nepodporují.

#### --why--

Podporují se. Problém je v tom, co z nich vznikne.

### --answer--

Protože se dynamické třídy musí skládat přes `clsx`.

#### --why--

`clsx` jen spojuje řetězce. Kdyby se jméno skládalo v něm, nepomůže to.

### --see--

css-tailwind/komponenty-bez-duplicit#typicke-chyby-a-pasti

## --question--

Napiš, co uděláš, když potřebuješ hodnotu, na kterou v tokenu nic není — třeba mřížku `1fr 320px`.

### --expected--

libovolnou hodnotu v hranatých závorkách

### --accept--

grid-cols-[1fr_320px]
použiju hranaté závorky
arbitrary value

### --why--

Hranaté závorky jsou únikový ventil: `grid-cols-[1fr_320px]`, `top-[117px]`,
`bg-[#1f6f8b]`. Zároveň jsou signálem — když se tatáž hodnota objeví potřetí, patří
do `@theme` jako token.

### --see--

css-tailwind/utility-first#libovolne-hodnoty-unikovy-ventil

## --question--

Z minulé sekce o CSS: co je specificita a jak souvisí s Tailwindem?

### --correct--

Váha selektoru, která rozhoduje při konfliktu. Utility mají všechny stejnou, takže rozhoduje pořadí v souboru — ne selektor.

#### --why--

Proto se s Tailwindem nedostaneš do války specificit a proto také `p-2 p-8` nevyhrává
„ta druhá v atributu". Je to vlastnost, ne chyba.

### --answer--

Pořadí tříd v atributu `class`.

#### --why--

To je právě častý omyl. Atribut `class` se specificitou nesouvisí vůbec.

### --answer--

Počet deklarací v pravidle.

#### --why--

Specificita se počítá ze selektoru (id, třídy, prvky), ne z obsahu pravidla.

### --see--

css-kaskada/kaskada

## --question--

Taky z dřívějška: proč se barvy v tokenu píšou hexadecimálně nebo přes `oklch()`, a ne starým `rgb(31, 111, 139)`?

### --expected--

kvůli průhlednosti přes lomítko

### --accept--

aby fungovalo bg-znacka/50
kvůli modifikátoru průhlednosti

### --why--

Tailwind u zápisu `bg-znacka/50` potřebuje barvu v takovém tvaru, aby do ní mohl doplnit
alfa kanál. Starý čárkový `rgb()` mu to neumožní.

### --see--

css-tailwind/theme-a-tokeny#prepsani-a-vypnuti-vychozich-tokenu
