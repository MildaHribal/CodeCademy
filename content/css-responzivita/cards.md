## --card-- css

Přehrávač hudby `.player` má zůstat tmavý i ve světlém systému, včetně posuvníku hlasitosti `<input type="range">`, který kreslí prohlížeč. Napiš deklaraci pro přehrávač, která to prohlížeči řekne.

### --expected--

```css
color-scheme: dark;
```

### --why--

`color-scheme` se dědí a jde nastavit jen části stránky. Prvky formulářů, posuvníky i `light-dark()` uvnitř přehrávače se pak řídí tmavým motivem bez ohledu na systém.

### --see--

css-responzivita/preference-uzivatele#color-scheme-rekni-prohlizeci-co-stranka-umi

## --card-- css

Napiš deklaraci tokenu `--surface`, který má ve světlém motivu hodnotu `#fff` a v tmavém `#1f2937`, obojí na jednom řádku.

### --expected--

```css
--surface: light-dark(#fff, #1f2937);
```

### --accept--

```css
--surface: light-dark(#ffffff, #1f2937);
```

### --why--

`light-dark()` vrátí první hodnotu ve světlém a druhou v tmavém motivu. Funguje jen tam, kde je `color-scheme: light dark` (nebo `dark`), jinak vrací vždy první.

### --see--

css-responzivita/preference-uzivatele#light-dark-dve-hodnoty-v-jedne-deklaraci

## --card-- css

Obal karty `.slot` se má stát kontejnerem, na jehož šířku se ptají `@container` dotazy uvnitř. Jméno nepotřebuje. Napiš deklaraci.

### --expected--

```css
container-type: inline-size;
```

### --why--

`inline-size` sleduje jen šířku a z obsahu vyřadí jen ji. Hodnota `size` by vyřadila i výšku a obal bez nastavené výšky by měl 0 px.

### --see--

css-responzivita/container-queries#kontejner-container-type-a-container

## --card-- output

Kontejner je široký 480 px. Kolik pixelů má uvnitř něj `clamp(1rem, 0.5rem + 3cqi, 1.5rem)`? Napiš jen číslo.

### --expected--

22.4

### --accept--

22,4
22.4px
22.4 px

### --why--

0.5rem + 3cqi = 8 + 0.03 × 480 = 8 + 14.4 = 22.4 px, mezi minimem 16 px a maximem 24 px.

### --see--

css-responzivita/container-queries#jednotky-kontejneru-cqi

## --card-- css

Podnadpis má mít nejméně 1.5rem, nejvýš 2.5rem a mezi tím růst jako `1rem + 2vw`. Napiš deklaraci.

### --expected--

```css
font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem);
```

### --why--

První hodnota je minimum, poslední maximum a prostřední preferovaná hodnota, která roste s oknem. Součet `rem` a `vw` roste i s přiblížením stránky, samotné `vw` ne.

### --see--

css-responzivita/mobile-first#plynule-velikosti-clamp

## --card-- output

Stránka má `html { font-size: 125%; }` a v CSS je `@media (width >= 50rem) { … }`. Od kolika pixelů šířky okna platí pravidla uvnitř? Napiš jen číslo.

### --expected--

800

### --accept--

800 px
800px

### --why--

`rem` v podmínce media dotazu se nepočítá z `font-size` na `html`, ale z výchozí velikosti písma prohlížeče (16 px): 50 × 16 = 800 px.

### --see--

css-responzivita/mobile-first#body-zlomu-podle-obsahu

## --card-- output

CSS obsahuje blok `@media (max-width: 30rem)` a blok `@media (min-width: 30rem)`. Kolik z nich platí v okně širokém přesně 480 px? Napiš jen číslo.

### --expected--

2

### --accept--

dva
oba

### --why--

`max-width` i `min-width` hranici zahrnují a 30rem je 480 px. Na přesně 480 px proto platí oba. Syntaxe rozsahů `(width < 30rem)` a `(width >= 30rem)` se nepřekrývá.

### --see--

css-responzivita/mobile-first#typicke-chyby-a-pasti

## --card-- output

Napiš podmínku media dotazu, do které zabalíš posun karty při najetí myší, aby ho dostali jen uživatelé, kteří si v systému neomezili pohyb.

### --expected--

(prefers-reduced-motion: no-preference)

### --accept--

prefers-reduced-motion: no-preference

### --why--

`no-preference` platí pro každého, kdo omezení nezapnul. Uživatel s omezeným pohybem pravidlo nedostane a karta mu zůstane na místě.

### --see--

css-responzivita/preference-uzivatele#omezeny-pohyb-prefers-reduced-motion

## --card-- output

Napiš podmínku media dotazu, která platí, když uživatel ovládá stránku hlavně přesným ukazatelem, typicky myší.

### --expected--

(pointer: fine)

### --accept--

pointer: fine

### --why--

`pointer: fine` je přesné ovládání, `pointer: coarse` nepřesné (prst). Na otázku „umí najet nad prvek" je zvlášť podmínka `hover`.

### --see--

css-responzivita/preference-uzivatele#mys-nebo-prst-hover-a-pointer

## --card-- css

Odkaz v mobilní navigaci má být vysoký aspoň 44 px, ale když se text zalomí, smí vyrůst. Napiš deklaraci s logickou vlastností.

### --expected--

```css
min-block-size: 2.75rem;
```

### --accept--

```css
min-block-size: 44px;
```

```css
min-height: 2.75rem;
```

```css
min-height: 44px;
```

### --why--

Minimální výška nechá prvek růst, pevná `height` by delší text nechala přetéct. Aby výška platila, odkaz nesmí být řádkový prvek (`inline-flex`, `flex` nebo `block`).

### --see--

css-responzivita/mobile-first#dotykove-cile

## --card-- css

Řada filtrů nad výpisem receptů je na telefonu širší než obrazovka. Posouvat do strany se má jen ona, ne celá stránka. Napiš deklaraci pro řadu filtrů.

### --expected--

```css
overflow-x: auto;
```

### --accept--

```css
overflow: auto;
```

```css
overflow-x: scroll;
```

### --why--

S `auto` se posuvník objeví jen tehdy, když obsah přetéká. Hodnota `hidden` by přečnívající filtry usekla a uživatel by se k nim nedostal.

### --see--

css-responzivita/workshop-landing-mobil/004

## --card-- output

Obrázek má `sizes="(width >= 64rem) 25vw, 50vw"`. Okno je široké 1280 px a displej má hustotu pixelů 2. Jak široký soubor v pixelech prohlížeč potřebuje? Napiš jen číslo.

### --expected--

640

### --accept--

640 px
640px
640w

### --why--

1280 px je víc než 64rem, platí 25vw = 320 px. Hustota 2 znamená dva pixely souboru na jeden pixel CSS: 320 × 2 = 640.

### --see--

css-responzivita/mobile-first#obrazky-srcset-a-sizes

## --card-- css

Karta v řádku s `display: flex` má `container-type: inline-size` a zhroutila se na nulovou šířku. Napiš deklaraci pro kartu, aby začínala na 16rem a smí růst i se zmenšovat.

### --expected--

```css
flex: 1 1 16rem;
```

### --accept--

```css
flex: 16rem;
```

### --why--

Kontejner nepočítá se šířkou obsahu, takže flex položka s `flex-basis: auto` nemá z čeho vyjít. Výchozí velikost 16rem jí šířku dá zvenku.

### --see--

css-responzivita/container-queries#kontejner-bez-vlastni-sirky-se-zhrouti

## --card-- output

Obal `.slot` má `container: slot / inline-size` a je široký 700 px. Uvnitř karty je `.body` s `container-type: inline-size`, široké 300 px. Nadpis v `.body` má pravidlo v `@container slot (width >= 40rem)`. Platí? Napiš `ano`, nebo `ne`.

### --expected-- ignore-case

ano

### --why--

Podmínka se jménem přeskočí bližší kontejnery s jiným jménem a ptá se `.slot`: 700 px je víc než 640 px. Bez jména by se ptala `.body` a neplatila by.

### --see--

css-responzivita/container-queries#pojmenovane-kontejnery

## --card-- css

Vstupenka na koncert se při tisku nesmí roztrhnout na dvě stránky. Napiš deklaraci pro vstupenku do bloku `@media print`.

### --expected--

```css
break-inside: avoid;
```

### --accept--

```css
page-break-inside: avoid;
```

### --why--

`break-inside: avoid` řekne prohlížeči, aby uvnitř prvku nezalamoval stránku, pokud to jde. Starší zápis `page-break-inside` funguje taky.

### --see--

css-responzivita/preference-uzivatele#tisk-media-print

## --card-- free

Co znamená mobile-first a proč se media dotazy píšou s `width >=` a až pod základní styly?

### --back--

Základní styly píšu pro nejužší obrazovku, takže platí všude a každé zařízení dostane aspoň funkční jeden sloupec. Media dotazy s `width >=` k nim od určité šířky přidávají, co širší okno unese. Media dotaz pravidlům nepřidává specificitu, takže při stejném selektoru vyhraje pozdější pravidlo; proto rozšíření stojí pod základem a seřazená od nejmenší šířky.

### --see--

css-responzivita/mobile-first#poradi-rozhoduje-media-dotaz-nepridava-silu

## --card-- free

Jaký je rozdíl mezi media query a container query? Kdy použiješ který?

### --back--

Media dotaz se ptá na okno nebo zařízení: šířku okna, tmavý režim, omezený pohyb, tisk. Container query se ptá nejbližšího předka s `container-type`, tedy místa, které komponenta dostala. Media dotazy proto používám na rozvržení celé stránky a preference uživatele, container queries na komponenty, které se objevují na různých místech, třeba kartu v panelu i v obsahu. Často se doplňují: stránka mění sloupce media dotazem a karty v nich se přizpůsobí samy.

### --see--

css-responzivita/container-queries#media-dotaz-nebo-container-query

## --card-- free

Proč kontejner s `container-type: inline-size` nepočítá se šířkou svého obsahu a kde to způsobí problém?

### --back--

Pravidla v `@container` mění obsah podle šířky kontejneru. Kdyby obsah zároveň určoval šířku kontejneru, vznikl by kruh, a tak prohlížeč šířku kontejneru počítá bez obsahu. Problém nastane všude, kde prvek šířku bere z obsahu: flex položka bez `flex-basis`, `width: fit-content` nebo absolutně pozicovaný prvek se zhroutí na nulu. Kontejner musí dostat šířku zvenku.

### --see--

css-responzivita/container-queries#kontejner-bez-vlastni-sirky-se-zhrouti

## --card-- free

Jak volíš body zlomu a proč je píšeš v `rem`?

### --back--

Body zlomu volím podle obsahu, ne podle zařízení: tam, kde se rozvržení přestane vejít, nebo spočítám nejmenší čitelnou šířku karet, mezery a padding. Zařízení se mění každý rok a mezi nimi je spousta šířek. V `rem` je píšu proto, že se posunou, když si uživatel zvětší výchozí písmo, a rozvržení se přepne dřív, než se zvětšený text začne mačkat. `rem` v podmínce se přitom počítá z výchozího písma prohlížeče, ne z `font-size` na `html`.

### --see--

css-responzivita/mobile-first#body-zlomu-podle-obsahu

## --card-- free

Jak bys na webu udělal tmavý motiv podle systému s ručním přepínačem?

### --back--

Všechny barvy dám do tokenů a komponenty používají jen je. Na `:root` nastavím `color-scheme: light dark`, aby prohlížeč kreslil formuláře a posuvníky podle systému, a stejnou informaci dám do `<meta name="color-scheme">`. Tokeny zapíšu přes `light-dark()`, takže ruční přepínač jen změní `color-scheme` na `light` nebo `dark`, třeba podle atributu na `<html>`. Alternativně tmavé tokeny v `@media (prefers-color-scheme: dark)` s výjimkou pro ruční světlou volbu a jejich kopií pro ruční tmavou.

### --see--

css-responzivita/preference-uzivatele#rucni-prepinac-motivu

## --card-- free

K čemu jsou u obrázku atributy `srcset` a `sizes` a proč samotný `srcset` nestačí?

### --back--

`srcset` nabídne prohlížeči víc souborů různé šířky, třeba `foto-480.jpg 480w`. Prohlížeč vybírá soubor dřív, než stránku rozvrhne, takže neví, jak široký obrázek bude. Bez `sizes` počítá s obrázkem přes celé okno a na počítači stáhne zbytečně velký soubor. `sizes` mu šířku řekne předem, třeba `(width >= 60rem) 33vw, 100vw`, a prohlížeč ji vynásobí hustotou displeje a vybere nejmenší soubor, který stačí.

### --see--

css-responzivita/mobile-first#obrazky-srcset-a-sizes

## --card-- free

Proč pro plynulé písmo použít `clamp()` se součtem `rem` a `vw`, a ne jen `font-size: 5vw`?

### --back--

Samotné `vw` nemá meze: na telefonu je text nečitelně malý a na širokém monitoru obrovský. `clamp()` přidá minimum a maximum. Součet s `rem` je důležitý kvůli přístupnosti: když si uživatel stránku přiblíží, okno se v CSS pixelech zúží a čisté `vw` se zmenší, takže text skoro neroste. Část v `rem` roste s přiblížením i s větším výchozím písmem.

### --see--

css-responzivita/mobile-first#plynule-velikosti-clamp

## --card-- free

Na které preference uživatele kromě tmavého režimu by měl web reagovat a jak?

### --back--

`prefers-reduced-motion: reduce` znamená omezit pohyb: vypnout posuny, paralaxu a velké animace, změny barev můžou zůstat. `prefers-contrast: more` si žádá silnější rámečky a tmavší šedé texty. Při `forced-colors: active` systém nahradí barvy vlastní paletou a zmizí stíny, takže fokus musí mít i `outline`. Podmínky `hover` a `pointer` říkají, jestli jde najet myší a jak přesné je ovládání; informace jen při `:hover` na dotykovém zařízení nesmí chybět.

### --see--

css-responzivita/preference-uzivatele#kontrast-a-vynucene-barvy
