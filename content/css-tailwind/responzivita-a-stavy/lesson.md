# Responzivita a stavy

:::check pretest
Napíšeš `<div class="text-sm md:text-lg">`. Jak velký bude text na telefonu?

### --correct--
Malý (`text-sm`) — třída bez předpony platí od nejmenší obrazovky nahoru.

#### --why--
Varianty jako `md:` znamenají „**od** této šířky výš". Třída bez předpony je základ
platný všude.

### --answer--
Velký (`text-lg`) — poslední třída v pořadí vyhrává.

#### --why--
O pořadí v atributu `class` nejde. Rozhoduje media dotaz, který se na telefonu neuplatní.

### --answer--
Záleží na pořadí tříd v atributu.

#### --why--
Nezáleží. Pořadí utilit v `class` nemá na výsledek vliv — o tom rozhoduje pořadí
ve vygenerovaném stylopisu.
:::

Utilita sama o sobě platí vždycky. Teprve [[varianta]] — předpona zakončená dvojtečkou —
z ní udělá něco podmíněného: „jen na širokém displeji", „jen při najetí myší", „jen
když je rodič otevřený".

Tahle lekce je o tom, jaké varianty existují a jak se skládají.

## Mobil první: třída bez předpony

Tailwind je postavený mobile-first. Znamená to, že:

- **třída bez předpony platí všude** a je to tvůj základní stav,
- **varianta `md:` platí od `768px` výš**, ne do ní.

```html
<!-- jeden sloupec na telefonu, dva od 768 px, čtyři od 1024 px -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

Píše se to zleva doprava od nejmenší obrazovky. Nikdy naopak — `lg:grid-cols-1` jako
základ a `grid-cols-4` pro telefon je cesta do pekel.

:::live dom libs=tailwind
```html
<div class="p-4 font-sans">
  <p class="mb-3 text-sm text-gray-600">Zmenši náhled na 375 a pak zase rozšiř.</p>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-lg bg-sky-600 p-4 text-white">1</div>
    <div class="rounded-lg bg-sky-600 p-4 text-white">2</div>
    <div class="rounded-lg bg-sky-600 p-4 text-white">3</div>
    <div class="rounded-lg bg-sky-600 p-4 text-white">4</div>
  </div>
</div>
```
:::

| varianta | od šířky |
|---|---|
| (žádná) | vždy |
| `sm:` | 640 px |
| `md:` | 768 px |
| `lg:` | 1024 px |
| `xl:` | 1280 px |
| `2xl:` | 1536 px |
| `max-md:` | **do** 768 px (opačný směr, používej výjimečně) |

Vlastní bod zlomu přidáš tokenem `--breakpoint-siroko: 1400px` a vznikne z něj
varianta `siroko:`.

:::check
Chceš, aby byl text na telefonu vycentrovaný a od tabletu zarovnaný vlevo. Napiš obě třídy.

### --expected--
text-center md:text-left

### --accept--
text-center md:text-left
"text-center md:text-left"
md:text-left text-center
:::

:::live dom libs=tailwind predict
```html
<div class="p-4 font-sans">
  <p class="text-base sm:text-sm">Jak velký jsem na širokém displeji?</p>
</div>
```
--question-- Jakou velikost bude mít odstavec na displeji širokém 1200 px?
--option-- `text-base` — třída bez předpony vyhrává, protože je napsaná dřív.
--option*-- `text-sm` — `sm:` platí od 640 px výš, a 1200 px do toho spadá.
--option-- Žádnou z nich — dvě velikosti se navzájem vyruší.
--why-- `sm:` neznamená „malý displej", ale „**od** 640 px výš". Na širokém displeji tedy platí, a protože je v pořadí za základní třídou, přebije ji. Odtud plyne mobile-first pravidlo: základ je nejmenší obrazovka, varianty jsou výjimky směrem nahoru.
:::

## Container queries: když nerozhoduje okno

`md:` se ptá na šířku **okna**. Jenže tatáž karta může být jednou v širokém sloupci
a podruhé v úzkém bočním panelu — a okno je v obou případech stejné.

Na to jsou [[container query v Tailwindu|container queries]]: označíš rodiče třídou
`@container` a uvnitř používáš varianty `@sm:`, `@md:`, `@lg:`, které se ptají **na něj**.

:::live dom libs=tailwind
```html
<div class="grid gap-4 p-4 font-sans md:grid-cols-[1fr_16rem]">
  <div class="@container rounded-lg bg-gray-100 p-3">
    <p class="mb-2 text-xs text-gray-500">Široký sloupec</p>
    <article class="flex flex-col gap-3 rounded-md bg-white p-4 @md:flex-row @md:items-center">
      <div class="h-16 w-16 shrink-0 rounded bg-sky-600"></div>
      <div>
        <h3 class="font-semibold">Stejná komponenta</h3>
        <p class="text-sm text-gray-600">Tady je místo, tak je vedle sebe.</p>
      </div>
    </article>
  </div>

  <div class="@container rounded-lg bg-gray-100 p-3">
    <p class="mb-2 text-xs text-gray-500">Úzký panel</p>
    <article class="flex flex-col gap-3 rounded-md bg-white p-4 @md:flex-row @md:items-center">
      <div class="h-16 w-16 shrink-0 rounded bg-sky-600"></div>
      <div>
        <h3 class="font-semibold">Stejná komponenta</h3>
        <p class="text-sm text-gray-600">Tady místo není, tak je pod sebou.</p>
      </div>
    </article>
  </div>
</div>
```
:::

Obě karty mají **úplně stejný `class`**. Liší se jen tím, kolik místa jim rodič dal —
a to je přesně to, co u komponent chceš.

> [!REMEMBER]
> `md:` = jak široké je okno. `@md:` = jak široký je kontejner. Komponenta, která se má
> dát použít kdekoli, má reagovat na kontejner.

:::check
Proč se u znovupoužitelné karty hodí `@md:` víc než `md:`?

### --correct--
Protože se ptá na šířku kontejneru, ve kterém karta zrovna je — a ta se mezi místy liší, i když je okno stejné.

#### --why--
Stejná karta může být v mřížce, v bočním panelu i v dialogu. S `md:` by se ve všech
třech chovala stejně, a to je špatně právě v tom úzkém.

### --answer--
Protože `@md:` funguje i ve starších prohlížečích.

#### --why--
Je to naopak novější věc než media dotazy. Podporu má dnes všude, ale „starší" není důvod.

### --answer--
Protože `md:` funguje jen na text.

#### --why--
`md:` jde dát před jakoukoli utilitu. Rozdíl je v tom, na co se ptá.
:::

## Stavy: `hover:`, `focus-visible:` a další

Nejpoužívanější varianty se vůbec netýkají velikosti:

| varianta | kdy platí |
|---|---|
| `hover:` | myš nad prvkem |
| `focus:` | prvek má fokus (i po kliknutí myší) |
| `focus-visible:` | prvek má fokus **a prohlížeč soudí, že ho má ukázat** (klávesnice) |
| `active:` | prvek je právě stisknutý |
| `disabled:` | prvek je vypnutý |
| `first:`, `last:`, `odd:`, `even:` | pozice mezi sourozenci |
| `dark:` | tmavý motiv |
| `motion-reduce:` | uživatel má omezený pohyb |

:::live dom libs=tailwind
```html
<div class="flex flex-wrap gap-3 p-6 font-sans">
  <button class="rounded-md bg-sky-700 px-4 py-2 text-white transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-900 active:scale-95">
    Projdi mě tabulátorem
  </button>
  <button class="rounded-md bg-sky-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500" disabled>
    Vypnuté
  </button>
</div>
```
:::

> [!PITFALL]
> `focus:` se ukáže i po kliknutí myší, což u tlačítek vypadá jako chyba. Na obrys
> po klávesnici používej `focus-visible:` — a **nikdy ho neruš bez náhrady**
> (`focus:outline-none` bez čehokoli dalšího je nejrychlejší způsob, jak stránku
> znepřístupnit pro klávesnici).

:::check
Které varianty použiješ pro obrys, který se ukáže při průchodu tabulátorem, ale ne po kliknutí myší?

### --expected--
focus-visible

### --accept--
focus-visible:
variantu focus-visible
:::

## `group` a `peer`: reakce na jiný prvek

Někdy má prvek reagovat na stav **někoho jiného**.

- **`group`** — rodič dostane třídu `group`, potomek používá `group-hover:`,
  `group-focus:`, `group-open:`…
- **`peer`** — sourozenec **před** prvkem dostane třídu `peer`, prvek používá
  `peer-checked:`, `peer-focus:`, `peer-invalid:`…

:::live dom libs=tailwind
```html
<div class="space-y-6 p-6 font-sans">
  <!-- group: celá karta je „hover plocha", šipka reaguje -->
  <a href="#" class="group flex items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:border-sky-600 hover:bg-sky-50">
    <span>
      <span class="block font-semibold group-hover:text-sky-800">Karta s odkazem</span>
      <span class="block text-sm text-gray-600">Najeď kamkoli na kartu.</span>
    </span>
    <span class="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-sky-700">→</span>
  </a>

  <!-- peer: popisek reaguje na stav zaškrtávátka před ním -->
  <div class="flex items-center gap-3">
    <input id="souhlas" type="checkbox" class="peer size-4">
    <label for="souhlas" class="text-gray-600 peer-checked:font-semibold peer-checked:text-sky-800">
      Zaškrtni mě a přečti si, co se stane s tímhle popiskem.
    </label>
  </div>
</div>
```
:::

Rozdíl si zapamatuj takhle: **`group` je shora dolů** (rodič → potomek), **`peer` je
zleva doprava** (sourozenec před → prvek za ním). `peer` kvůli tomu funguje jen
u sourozenců, kteří v HTML stojí **za** označeným prvkem.

:::check
Chceš, aby se při najetí na celou kartu podbarvil nadpis uvnitř. Napiš, jakou třídu dáš kartě.

### --expected--
group

### --accept--
třídu group
class="group"
:::

## Skládání variant

Varianty se řetězí a čtou zleva doprava jako podmínky spojené „a zároveň":

```html
<!-- od 768 px a zároveň při najetí myší -->
<button class="md:hover:bg-sky-800">

<!-- v tmavém motivu a zároveň při najetí -->
<button class="dark:hover:bg-sky-300">

<!-- najetí na rodiče a zároveň od 1024 px -->
<span class="lg:group-hover:translate-x-1">

<!-- jen když uživatel nemá omezený pohyb -->
<div class="motion-safe:transition motion-safe:hover:scale-105">
```

Poslední řádek stojí za pozornost: `motion-safe:` a `motion-reduce:` jsou varianty
navázané na `prefers-reduced-motion`. Animaci tak jde zapnout jen těm, kdo o ni stojí —
bez jediného řádku JavaScriptu.

:::check
Napiš třídu, která zvětší prvek při najetí myší, ale jen u uživatelů bez omezení pohybu.

### --expected--
motion-safe:hover:scale-105

### --accept--
motion-safe:hover:scale-105
motion-safe:hover:scale-110
:::

## Typické chyby a pasti

- **Psaní od velkého displeje dolů.** `lg:grid-cols-1` jako základ a výjimky pro telefon
  se nedá udržet. Základ = telefon, varianty = výjimky směrem nahoru.
- **`max-md:` všude.** Občas se hodí, ale když jich je víc než pár, znamená to, že je
  základ napsaný obráceně.
- **`focus:outline-none` bez náhrady.** Stránka se tím pro klávesnici stane
  nepoužitelnou.
- **`md:` u komponenty, která má být znovupoužitelná.** V úzkém sloupci se pak rozpadne.
- **`peer` na sourozenci, který stojí až za prvkem.** CSS umí ukázat jen dopředu — prvek
  s `peer` musí být v HTML **dřív**.
- **Varianta poskládaná za běhu** (`` `${stav}:bg-red-500` ``). Tailwind takovou třídu ve
  zdrojáku nenajde a nevygeneruje ji.
- **Spoléhání na pořadí tříd v `class`.** `p-2 p-6` nedává „to druhé vyhrává" — rozhoduje
  pořadí ve vygenerovaném stylopisu. Na řízené přebíjení je `tailwind-merge`.

> [!PITFALL]
> Poslední bod potkáš, jakmile začneš dělat komponentu s prop `className`. Uvnitř máš
> `p-4`, zvenčí někdo pošle `p-8` a výsledek závisí na tom, která utilita je ve stylopisu
> později — ne na pořadí v atributu. Řešení je v další lekci.

:::check
Komponenta má prop `className`, uvnitř má `p-4` a zvenčí přijde `p-8`. Na čem závisí výsledek?

### --expected--
na pořadí ve stylopisu

### --accept--
na pořadí pravidel v css
na tom, která utilita je v css později
ne na pořadí v class
:::

## Kde to najdeš v MDN

Varianty jsou jen zabalené CSS, které znáš:
[media dotazy](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries)
za `md:`, [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
za `@md:`, pseudotřídy [`:hover`](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover),
[`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
a [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) za `hover:`,
`focus-visible:` a `group-has-*:`. Seznam všech variant má Tailwind ve své dokumentaci
pod heslem *Hover, focus, and other states*.

# --questions--

## --question--

Napiš, od jaké šířky okna platí varianta `lg:`.

### --expected--

1024px

### --accept--

1024
1024 px
od 1024px výš

### --why--

Výchozí body zlomu jsou `sm` 640, `md` 768, `lg` 1024, `xl` 1280 a `2xl` 1536 pixelů.
Všechny znamenají „**od** téhle šířky výš" — Tailwind je mobile-first.

### --see--

css-tailwind/responzivita-a-stavy#mobil-prvni-trida-bez-predpony

## --question--

Kdy sáhneš po `@md:` místo `md:`?

### --correct--

Když má komponenta reagovat na šířku místa, kam je zasazená, ne na šířku okna.

#### --why--

Stejná karta vypadá jinak v mřížce a jinak v úzkém bočním panelu, i když je okno stejné.
Kontejner se označí třídou `@container` a varianty se pak ptají na něj.

### --answer--

Když chceš podporovat i starší prohlížeče.

#### --why--

Container queries jsou novější než media dotazy, ne starší.

### --answer--

Když je komponenta uvnitř mřížky.

#### --why--

S mřížkou to přímo nesouvisí — jde o to, jestli se má komponenta řídit oknem, nebo
místem, které dostala.

### --see--

css-tailwind/responzivita-a-stavy#container-queries-kdyz-nerozhoduje-okno

## --question--

Čím se liší `focus:` a `focus-visible:`? Napiš, kterou z nich použiješ na obrys tlačítka.

### --expected--

focus-visible

### --accept--

focus-visible:
variantu focus-visible

### --why--

`focus:` platí při každém fokusu, tedy i po kliknutí myší — a obrys po kliknutí na
tlačítko vypadá jako chyba. `focus-visible:` se ukáže tehdy, když prohlížeč soudí, že
má být fokus vidět, tedy hlavně při ovládání klávesnicí.

### --see--

css-tailwind/responzivita-a-stavy#stavy-hover-focus-visible-a-dalsi

## --question--

Napiš, jakou variantu dáš potomkovi, aby reagoval na najetí myší na rodiče s třídou `group`.

### --expected--

group-hover:

### --accept--

group-hover
group-hover:text-sky-800

### --why--

`group` se dá rodiči, `group-hover:` potomkům. Typicky se tím řeší karta, kde má při
najetí kamkoli na ni ztmavnout nadpis a posunout se šipka.

### --see--

css-tailwind/responzivita-a-stavy#group-a-peer-reakce-na-jiny-prvek

## --question--

Zaškrtávátko má třídu `peer` a stojí v HTML **za** popiskem. Proč `peer-checked:` na popisku nefunguje?

### --correct--

Protože se CSS umí dívat jen dopředu — prvek s `peer` musí stát v HTML dřív než ten, který na něj reaguje.

#### --why--

Za `peer-*` je sourozenecký kombinátor (`~`), a ten míří jen na prvky **za** sebou.
Proto se zaškrtávátko píše před popisek a vizuálně se to případně srovná pořadím ve flexu.

### --answer--

Protože `peer` funguje jen mezi rodičem a potomkem.

#### --why--

To je `group`. `peer` je mezi sourozenci.

### --answer--

Protože `peer-checked:` existuje jen u přepínačů, ne u zaškrtávátek.

#### --why--

Funguje u obojího — u všeho, co má stav `:checked`.

### --see--

css-tailwind/responzivita-a-stavy#group-a-peer-reakce-na-jiny-prvek

## --question--

Napiš variantu, kterou zapneš animaci jen uživatelům, kteří nemají zapnuté omezení pohybu.

### --expected--

motion-safe:

### --accept--

motion-safe
motion-safe:transition

### --why--

`motion-safe:` platí při `prefers-reduced-motion: no-preference`, `motion-reduce:`
naopak. Díky tomu se dá tlumená varianta udělat bez jediného řádku JavaScriptu.

### --see--

css-tailwind/responzivita-a-stavy#skladani-variant

## --question--

Prvek má `class="p-2 p-6"`. Které odsazení se uplatní?

### --correct--

To, které je ve vygenerovaném stylopisu později — pořadí v atributu `class` o tom nerozhoduje.

#### --why--

Obě utility mají stejnou specificitu, takže vyhrává pozdější pravidlo v CSS. Proto
se na řízené přebíjení tříd používá `tailwind-merge`, který z dvojice nechá jen jednu.

### --answer--

`p-6`, protože je v atributu poslední.

#### --why--

Pořadí v atributu `class` nemá na CSS žádný vliv. Je to častý omyl.

### --answer--

Ani jedno — dvě stejné utility se navzájem vyruší.

#### --why--

Nevyruší. Uplatní se ta, která je v CSS později.

### --see--

css-tailwind/responzivita-a-stavy#typicke-chyby-a-pasti
