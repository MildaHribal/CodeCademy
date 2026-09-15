---
pass: 0.8
---

# --questions--

## --question--

Ceník má tři tarify. U prostředního, doporučeného, dostala cena větší písmo, fialovou barvu, rámeček a štítek „Nejvýhodnější". Přesto ho uživatelé v testu nepoznali jako doporučený. Ostatní dva tarify mají taky tučné ceny, rámeček kolem karty a plné barevné tlačítko. Co je nejpravděpodobnější příčina?

### --answer--

Fialová je pro zvýraznění špatná barva, lepší by byla červená.

#### --why--

Myslíš si, že vyčnívání zařídí správně zvolená barva? Barva sama nic nezvýrazní, když je kolem stejně hlasité zvýraznění jiného druhu.

### --correct--

Chybí rozdíl: ostatní tarify jsou skoro stejně hlasité, takže zvýraznění prostředního se ztratí.

#### --why--

Hierarchie je poměr. Doporučený tarif vyskočí, až ostatní ustoupí: tlumenější ceny, obrysové tlačítko, žádný rámeček. Pak stačí i menší zvýraznění prostředního.

### --answer--

Štítek musí být nad kartou, ne uvnitř.

#### --why--

Poloha štítku může pomoct, ale nevyřeší to, že všechny tři karty jsou stejně výrazné. Oko pořád nemá podle čeho vybrat.

### --see--

css-design/hierarchie-a-rozestupy#velikost-vaha-a-barva

## --question--

Barva značky je `--brand: oklch(0.62 0.16 250)`. Pozadí štítku má mít stejný odstín, světlost 0.95 a čtvrtinovou chromu. Napiš hodnotu, která ho z `--brand` odvodí relativní barvou.

### --expected--

oklch(from var(--brand) 0.95 calc(c / 4) h)

### --accept--

oklch(from var(--brand) 0.95 calc(c * 0.25) h)
oklch(from var(--brand) 95% calc(c / 4) h)
oklch(from var(--brand) 95% calc(c * 0.25) h)

### --why--

Za `from` je výchozí barva, pak tři kanály. Světlost napíšeš napevno, chromu spočítáš z kanálu `c` a odstín `h` převezmeš. Světlé pozadí potřebuje nízkou chromu, jinak je křiklavé nebo mimo barvy displeje.

### --see--

css-design/barvy-a-typografie#stupnice-odstinu-z-jedne-barvy

## --question--

Nadpis sekce má písmo 24 px normální váhy a jeho barva má s pozadím kontrast 3,2 : 1. Projde úrovní AA? Odpověz ano, nebo ne.

### --expected-- ignore-case

ano

### --why--

Od 24 px normální váhy je text „velký" a stačí mu 3 : 1. Běžný text by potřeboval 4,5 : 1. U menšího nebo tenčího nadpisu by stejná barva neprošla.

### --see--

css-design/barvy-a-typografie#kontrast-podle-wcag

## --question--

Ve tmavém motivu má stránka `--gray-950` a karta taky `--gray-950`. Kolega chce karty oddělit stínem `0 8px 24px rgb(0 0 0 / 0.25)`. Co mu poradíš?

### --answer--

Stín ztmavit na `rgb(0 0 0 / 0.8)`, aby byl ve tmě vidět.

#### --why--

Myslíš si, že stín jen potřebuje víc síly? Na skoro černé stránce už není co ztmavit, takže ani silný stín kartu neoddělí a na okrajích bude špinavý.

### --correct--

Dát kartě v tmavé hodnotě tokenu povrchu o stupeň nebo dva světlejší šedou.

#### --why--

Ve tmě působí blíž to, co je světlejší. Světlejší povrch kartu oddělí a stín může zůstat jako doplněk.

### --answer--

Přidat kartě bílý stín, který ve tmě svítí.

#### --why--

Světlá záře kolem karty působí jako chyba vykreslení a nepřipomíná nic, co oko zná ze skutečného světa. Hloubku ve tmě dělá plocha, ne okraj.

### --see--

css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny

## --question--

Na `body` je `font-size: 16px` a `line-height: 24px`, přesně jak to bylo v panelu návrhu. Nadpis `h2` má jen `font-size: 32px`. Kolik px bude mít výška jeho řádku?

### --expected--

24

### --accept--

24 px
24px

### --why--

Hodnota v px se zdědí jako hotových 24 px, stejně jako u procent. Nadpis s 32px písmem má pak řádky užší než písmo a víc řádků přetéká do sebe. Číslo bez jednotky (`1.5`) by nadpis zdědil jako poměr.

### --see--

css-design/cteni-navrhu#typicke-chyby-a-pasti

## --question--

Rámec ve Figmě má auto layout *Vertical*. Jeho dítě má na šířku nastavené *Fill container*. Rámec v CSS máš jako `display: flex; flex-direction: column`. Co napíšeš dítěti, aby se roztáhlo na šířku?

### --answer--

`flex: 1`

#### --why--

`flex: 1` pracuje na hlavní ose, a ta vede ve sloupci shora dolů. Dítě by rostlo do výšky, ne do šířky.

### --correct--

Nic, šířku vyplní samo díky výchozímu `align-items: stretch`.

#### --why--

Šířka je ve sloupci vedlejší osa a flex položky se na ní ve výchozím stavu roztahují. Deklaraci potřebuješ jen tehdy, když rodič zarovnání změnil.

### --answer--

`width: fit-content`

#### --why--

`fit-content` je překlad *Hug contents*: prvek podle obsahu. *Fill* je opak.

### --see--

css-design/cteni-navrhu#hug-fill-a-fixed

## --question--

Textový styl *Overline* má v panelu Dev Mode písmo 12 px, výšku řádku 16 px a prostrkání 8 %. Napiš deklaraci `letter-spacing` v jednotce, se kterou prostrkání zůstane správné, i když styl později dostane jinou velikost písma.

### --expected--

letter-spacing: 0.08em

### --accept--

letter-spacing: .08em
letter-spacing: 8%

### --why--

Figma počítá procenta z velikosti písma, takže 8 % je `0.08em`. Hodnota v px (`0.96px`) by se při jiné velikosti písma nepřepočítala.

### --see--

css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty

## --question--

Kolega vložil ikony jako `<svg><use href="https://cdn.ikonky.cz/sprite.svg#cart"/></svg>`. Na jeho počítači se nic nezobrazí, v konzoli žádná chyba JavaScriptu. Co je nejpravděpodobnější příčina?

### --answer--

`<use>` umí odkazovat jen na `<symbol>` ve stejném HTML souboru.

#### --why--

Externí sprite funguje a prohlížeč si ho uloží do cache. Problém je v tom, odkud soubor přichází.

### --correct--

Externí sprite přes `<use>` musí být ze stejné domény jako stránka.

#### --why--

Soubor ze sprite na cizí doméně prohlížeč přes `<use>` nenačte. Sprite dej k webu, nebo ikony vlož inline.

### --answer--

Chybí `viewBox` na vnějším `<svg>`.

#### --why--

`<use>` převezme `viewBox` ze `<symbol>`. Bez něj by se ikona špatně škálovala, ale nezmizela by úplně.

### --see--

css-design/svg-a-ikony#tri-zpusoby-jak-ikonu-vlozit

## --question--

Tlačítko pro smazání položky z košíku má `aria-label="Odebrat Kávovar Sage"` a uvnitř jen SVG ikonu koše. Napiš atribut i s hodnotou, který patří na to `<svg>`.

### --expected--

aria-hidden="true"

### --accept--

aria-hidden=true
aria-hidden='true'

### --why--

Jméno už nese tlačítko. Ikona uvnitř je dekorace a bez `aria-hidden` by ji některé čtečky ohlásily jako obrázek navíc.

### --see--

css-design/svg-a-ikony#pristupnost-ikon

## --question--

Najdi v MDN stránku funkce `color-mix()`. Jaký barevný prostor prohlížeč použije, když část `in …` v zápisu vynecháš? Napiš jeho název.

### --expected-- ignore-case

oklab

### --why--

Novější verze specifikace udělala barevný prostor nepovinným a výchozí je `oklab`. Kvůli čitelnosti a starším prohlížečům je dobré ho psát výslovně, jako v lekci: `color-mix(in oklch, …)`.

### --see--

css-design/barvy-a-typografie#stupnice-odstinu-z-jedne-barvy

## --question--

Tři čísla v hero sekci (`.stat`) jsou ve flex řádku a mají být stejně široká, jako *Fill container* v návrhu. Kolega jim dal `flex-grow: 1` a čísla „600 účastníků" a „3 workshopy" jsou různě široká. Napiš deklaraci, která je udělá stejně široké bez ohledu na text.

### --expected--

flex: 1

### --accept--

flex: 1 1 0
flex: 1 1 0%
flex-basis: 0

### --why--

`flex-grow: 1` rozdělí jen **volné místo** a každé číslo začíná od šířky svého obsahu. `flex: 1` nastaví výchozí velikost na nulu, takže se rozdělí celá šířka rovným dílem.

### --see--

css-flexbox/flex-do-hloubky#zkratka-flex-a-jeji-vychozi-hodnoty
css-design/cteni-navrhu#hug-fill-a-fixed

## --question--

Hlavička v návrhu má *Gap: Auto* mezi logem a navigací. Kontejner je `display: flex` a `justify-content` měnit nechceš, protože za navigací je ještě tlačítko. Napiš deklaraci pro navigaci, která ji i s tlačítkem odtlačí doprava.

### --expected--

margin-inline-start: auto

### --accept--

margin-left: auto

### --why--

Automatický margin sežere všechno volné místo na své straně a položky za ním jdou s navigací k pravému okraji.

### --see--

css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou

## --question--

Karta má v návrhu *Fixed 320*, *Padding 24* a *Stroke 1 inside*. Stránka nemá reset `box-sizing` a v CSS je `width: 320px; padding: 24px; border: 1px solid`. Jak široká bude karta na obrazovce v px?

### --expected--

370

### --accept--

370 px
370px

### --why--

Figma kreslí rámeček i odsazení dovnitř rozměru, CSS ve výchozím `content-box` je k šířce přičte: 320 + 2 × 24 + 2 × 1 = 370 px. S `box-sizing: border-box` by karta měla 320 px jako v návrhu.

### --see--

css-box-model/box-model

## --question--

Tokeny barev jsou zapsané přes `light-dark()`, systém je přepnutý na tmavý režim, a stránka přesto zůstává světlá. Napiš deklaraci, která na `:root` nejspíš chybí.

### --expected--

color-scheme: light dark

### --accept--

color-scheme: dark light

### --why--

`light-dark()` vybírá hodnotu podle `color-scheme` prvku. Bez něj prohlížeč bere stránku jako jen světlou a vrací vždy první hodnotu.

### --see--

css-responzivita/preference-uzivatele
css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny

# --code-- Tarify aplikace Spoje

## --file-- plan.css

```css
/* Tarify aplikace Spoje (převzato od kolegy, ještě neprošlo kontrolou) */
:root {
  color-scheme: light dark;

  --violet-100: oklch(0.94 0.04 290);
  --violet-300: oklch(0.8 0.1 290);
  --violet-600: oklch(0.5 0.17 290);
  --violet-900: oklch(0.3 0.09 290);
  --slate-50: oklch(0.98 0.004 255);
  --slate-400: oklch(0.72 0.02 255);
  --slate-600: oklch(0.48 0.02 255);
  --slate-900: oklch(0.21 0.02 255);

  --brand: var(--violet-600);
  --brand-soft: oklch(from var(--brand) calc(l + 40%) calc(c / 4) h);

  --surface: light-dark(white, var(--slate-900));
  --text: light-dark(var(--slate-900), var(--slate-50));
  --text-muted: light-dark(var(--slate-400), var(--slate-400));
  --accent: light-dark(var(--violet-600), var(--violet-300));
}

.plans {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.plan {
  display: flex;
  flex: 1 1 18rem;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--surface);
  color: var(--text);
  line-height: 150%;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 12px 32px -8px rgb(0 0 0 / 0.18);
}

.plan--featured {
  background: var(--brand-soft);
}

.plan__badge {
  align-self: flex-start;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: var(--violet-100);
  color: var(--violet-600);
  font-size: 0.875rem;
  font-weight: 600;
}

.plan__name {
  margin: 1rem 0 1em;
  font-size: 1.75rem;
}

.plan__price {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
}

.plan__period {
  color: var(--text-muted);
  font-size: 1rem;
}

.plan__features {
  display: grid;
  gap: 0.5rem;
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
}

.plan__feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plan__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent);
}

.plan__button {
  margin-top: auto;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  font: inherit;
  font-weight: 600;
}
```

## --question--

Jaké pozadí bude mít doporučený tarif `.plan--featured` (řádky 40–42 v `plan.css`)? Stránka pod kartami je zelená.

### --answer--

Světle fialové, odvozené z `--brand` na řádku 15.

#### --why--

Myslíš si, že `calc(l + 40%)` přičte k světlosti 40 %? Kanál `l` je v relativní barvě číslo a procento k němu přičíst nejde, takže hodnota tokenu je neplatná.

### --correct--

Průhledné, prosvítá zelená stránka.

#### --why--

Neplatná hodnota v custom property se pozná až při použití. `background: var(--brand-soft)` je pak neplatné v době výpočtu a vlastnost dostane výchozí průhlednou hodnotu, ne hodnotu z pravidla `.plan`. Oprava je `calc(l + 0.4)`.

### --answer--

Bílé jako ostatní karty, protože neplatnou deklaraci prohlížeč zahodí a platí `background` z pravidla `.plan`.

#### --why--

Myslíš si, že prohlížeč deklaraci s `var()` zahodí už při čtení CSS, jako překlep? Hodnotu tokenu ale při čtení nezná, ověří ji až při výpočtu stylu prvku. Co se v tu chvíli s neplatnou hodnotou stane, je jiné pravidlo než u překlepu.

### --see--

css-design/barvy-a-typografie#typicke-chyby-a-pasti

## --question--

Jaká mezera v px bude pod názvem tarifu `.plan__name` (řádky 55–58 v `plan.css`)?

### --expected--

28

### --accept--

28 px
28px

### --why--

Spodní margin je `1em` a `em` se u marginu počítá z písma téhož prvku: `1.75rem` = 28 px. Na stupnici to mělo být nejspíš 16 px, tedy `1rem` nebo token.

### --see--

css-design/hierarchie-a-rozestupy#typicke-chyby-a-pasti

## --question--

Popisek `/ měsíc` (`.plan__period`) má ve světlém motivu na bílé kartě kontrast asi 2,5 : 1, v tmavém je v pořádku. Napiš opravenou hodnotu tokenu na řádku 19 jen z primitiv, které soubor definuje.

### --expected--

light-dark(var(--slate-600), var(--slate-400))

### --why--

Obě hodnoty `light-dark()` ukazují na `--slate-400`, který je čitelný jen na tmavé kartě. Světlá hodnota potřebuje tmavší stupeň, `--slate-600` má na bílé kolem 6,5 : 1.

### --see--

css-design/barvy-a-typografie#kontrast-podle-wcag

## --question--

Po přepnutí do tmavého motivu jsou dvě věci špatně. Štítek `.plan__badge` zůstane světle fialový a text tlačítka `.plan__button` skoro nejde přečíst. Co mají obě chyby společného?

### --answer--

Obě pravidla zapomněla na `color-scheme`, který je potřeba napsat ke každé komponentě.

#### --why--

`color-scheme` na `:root` stačí jednou, dědí se. Tokeny na řádcích 17–20 se v tmavém motivu přepínají správně.

### --correct--

Obě pravidla používají barvu, která se s motivem nemění: štítek primitiva `--violet-*` (řádky 49–50), tlačítko `white` (řádek 97) na akcentu, který se v tmavém motivu zesvětlí.

#### --why--

Mění se jen sémantické tokeny s `light-dark()`. Primitiva a barva natvrdo zůstanou stejné, takže štítek nezmění vzhled a bílý text leží na světlé `--violet-300` s kontrastem kolem 1,9 : 1. Oprava je sémantický token pro pozadí štítku a pro text na akcentu.

### --answer--

V tmavém motivu je potřeba všem barvám zvýšit chromu.

#### --why--

Chroma kontrast skoro neovlivňuje. Problém je, že tyhle barvy na motiv vůbec nereagují.

### --see--

css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny

## --question--

Název tarifu má `font-size: 1.75rem` a na dvou řádcích se řádky skoro dotýkají. Na kterém řádku `plan.css` je příčina? Napiš číslo řádku.

### --expected--

37

### --why--

`line-height: 150%` na kartě se spočítá z jejího písma na 24 px a název s 28px písmem zdědí hotových 24 px. Číslo bez jednotky `1.5` by se u názvu přepočítalo na 42 px, pro velký nadpis je ještě lepší vlastní `1.2`.

### --see--

css-design/cteni-navrhu#typicke-chyby-a-pasti
