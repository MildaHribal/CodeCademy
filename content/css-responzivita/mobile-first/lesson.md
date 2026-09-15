# Mobile-first

Víc než polovinu návštěv e-shopů, zpravodajských webů i rezervačních systémů dělají lidé z telefonu. Stránka, která na počítači vypadá dobře a na telefonu nutí uživatele zvětšovat prsty a posouvat do strany, přichází o zákazníky. V téhle lekci se naučíš psát CSS tak, aby jedna stránka fungovala od úzkého telefonu po široký monitor.

:::check pretest
Otevřeš na telefonu stránku, která v `<head>` nemá značku `<meta name="viewport">`. Co udělá mobilní prohlížeč?

### --answer--
Vykreslí stránku v šířce telefonu, jen trochu pomaleji.

#### --why--
To by byl ideální stav, jenže mobilní prohlížeč bez téhle značky neví, jestli je stránka na telefon připravená.

### --correct--
Rozvrhne stránku, jako by měl okno široké kolem 980 px, a celou ji zmenší na šířku displeje.

#### --why--
Staré weby počítaly s monitorem, a tak se mobilní prohlížeče tváří jako široké okno a výsledek zmenší. Text je pak drobný a media dotazy pro úzké obrazovky se nikdy nepoužijí.

### --answer--
Stránku nezobrazí a ohlásí chybu.

#### --why--
Značka je doporučená, ne povinná. Stránka se zobrazí i bez ní, jen jinak, než čekáš.
:::

:::check pretest
V CSS je `@media (width >= 48rem) { … }`. Od kolika pixelů šířky okna se pravidla uvnitř použijí? Napiš číslo.

### --expected--
768

### --accept--
768 px
768px

### --why--
V media dotazu se `rem` počítá z výchozí velikosti písma prohlížeče, obvykle 16 px: 48 × 16 = 768 px. Za chvíli uvidíš, proč tu nerozhoduje ani `font-size` nastavený na `html`.
:::

## Problém: stránka z počítače na telefonu

Rámeček v ukázce je **okno prohlížeče v okně**: posuvníkem měníš jeho šířku a stránka uvnitř se chová, jako by ji někdo otevřel na zařízení s takovým displejem. Ukázka se sama zmenší, aby se vešla, proto u širokých oken vypadá drobně.

Stránka má tři karty výletů ve třech sloupcích a žádné media dotazy. Nejdřív nech šířku 360 px (menší telefon) a přečti si nadpisy karet.

:::live
```html
<div class="frame"><iframe class="device" title="Stránka v okně zvolené šířky" srcdoc="
<style>
  body { margin: 0; padding: 1rem; font-family: system-ui, sans-serif; color: #1c2b36; }
  h1 { margin: 0 0 1rem; font-size: 1.75rem; }
  .trips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .trip { padding: 1rem; border-radius: 0.75rem; background: #e0f2fe; }
  .trip h2 { margin: 0 0 0.25rem; font-size: 1.25rem; }
  .trip p { margin: 0; }
</style>
<h1>Výlety po Česku</h1>
<div class='trips'>
  <article class='trip'><h2>Pravčická brána</h2><p>Největší přirozená skalní brána v Evropě.</p></article>
  <article class='trip'><h2>Propast Macocha</h2><p>Hluboká 138 metrů, dolů vede lodička.</p></article>
  <article class='trip'><h2>Sněžka</h2><p>Nejvyšší hora Česka s výhledem do Polska.</p></article>
</div>
"></iframe></div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; }

.device {
  width: calc(var(--w) * 1px);
  height: 26rem;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  background: white;
  /* Zmenší široké okno, aby se vešlo do náhledu. */
  scale: calc(340 / max(var(--w), 340));
  transform-origin: 0 0;
}

.frame {
  /* Zmenšený rámeček zabírá jen tolik místa, kolik je ho vidět. */
  width: 346px;
  height: calc((26rem + 4px) * 340 / max(var(--w), 340));
  overflow: hidden;
}
```
```controls
--w: range(320, 1280, 20) = 360 | Šířka okna (px)
```
:::

Na 360 px zbude na tři sloupce necelých 300 px: nadpisy se lámou, popis má jedno dvě slova na řádek a třetí karta i tak vyčuhuje z okna. Posuň šířku na 1000 px a tatáž stránka vypadá dobře. Rozvržení, které funguje na jedné šířce, na jiné selže.

Řešení má dvě části. Nejdřív napíšeš styly, které fungují na **nejužší** obrazovce: tady jeden sloupec, protože karty pod sebou čte telefon nejlépe. Pak přidáš pravidla, která se použijí jen od určité šířky okna, a na nich rozvržení rozšíříš. Tomu se říká [[mobile-first]].

> [!REMEMBER]
> **Základní styly platí všude a jsou pro nejužší obrazovku. Media dotazy jen přidávají to, co širší obrazovka unese.** Každé rozšíření se zapisuje „od téhle šířky výš".

:::check
Rozvrhuješ patičku se čtyřmi sloupci odkazů. Podle mobile-first: které rozvržení napíšeš do základních stylů mimo media dotaz?

### --answer--
Čtyři sloupce, protože tak má patička vypadat na počítači.

#### --why--
Tak se píše *desktop-first*: základ pro široké okno a pak ubírání pro telefon. Mobile-first začíná od opačného konce.

### --correct--
Jeden sloupec pod sebou; čtyři sloupce přidá media dotaz pro širší okna.

#### --why--
Základ je pro nejužší obrazovku. Jeden sloupec funguje i na 320 px a širší okno k němu přidá sloupce.

### --answer--
Nic, rozvržení patří celé do media dotazů pro jednotlivá zařízení.

#### --why--
Styly mimo media dotaz platí vždy. Kdyby tam nic nebylo, zařízení, na které jsi nepomyslel, by dostalo nerozvrženou stránku.
:::

## Meta viewport: řekni telefonu, že web je připravený

Mobilní prohlížeč nemůže vědět, jestli stránku někdo psal s ohledem na telefony. Proto ve výchozím stavu rozvrhne stránku do [[layout viewport|okna]] širokého kolem 980 px a výsledek zmenší na displej. Media dotaz `(width < 40rem)` by se tak na telefonu nikdy nepoužil, protože okno „má" 980 px.

Značka `<meta name="viewport">` v `<head>` tohle chování vypne:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

- `width=device-width` — okno je široké jako displej v CSS pixelech (u většiny telefonů 360–430 px),
- `initial-scale=1` — stránka se na začátku nezvětšuje ani nezmenšuje.

Značku potřebuje každá stránka, kterou napíšeš. Náhled v Akademii ji ignoruje, protože není mobilní prohlížeč. Rozdíl uvidíš na skutečném telefonu nebo v DevTools v režimu zařízení, když nahoře vybereš konkrétní telefon.

> [!PITFALL] Zakázaný zoom
> *Příznak:* v kódu webu najdeš `maximum-scale=1` nebo `user-scalable=no` a slabozraký uživatel si na telefonu nemůže text zvětšit prsty.
>
> *Oprava:* obě hodnoty smaž. Zakázat přiblížení odporuje pravidlům přístupnosti (WCAG 1.4.4) a některé prohlížeče ho stejně ignorují.

:::check
Napiš hodnotu atributu `content` značky viewport, kterou dáš do každé nové stránky.

### --expected--
width=device-width, initial-scale=1

### --accept--
width=device-width,initial-scale=1
initial-scale=1, width=device-width

### --why--
`width=device-width` nastaví šířku okna podle displeje a `initial-scale=1` zruší počáteční zmenšení. Bez ní se media dotazy pro telefon na skutečném telefonu nepoužijí.
:::

## Media dotaz a syntaxe rozsahů

[[Media dotaz]] (*media query*) je podmínka, za kterou napíšeš blok pravidel. Pravidla uvnitř platí, jen když okno podmínku splňuje:

```css
.trips {
  display: grid;
  gap: 1rem;
}

@media (width >= 40rem) {
  .trips {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

Podmínka `(width >= 40rem)` se čte „šířka okna je aspoň 40rem". Je to [[syntaxe rozsahů]] (*range syntax*), kterou dnes umí všechny běžné prohlížeče. Rozsah jde zapsat i oboustranně: `(40rem <= width < 64rem)`. Podmínky spojuje `and`, čárka znamená „nebo".

Ve starším kódu uvidíš totéž zapsané přes `min-width` a `max-width`:

| syntaxe rozsahů | starší zápis | platí |
|---|---|---|
| `(width >= 40rem)` | `(min-width: 40rem)` | od 40rem včetně výš |
| `(width <= 40rem)` | `(max-width: 40rem)` | do 40rem včetně |
| `(width < 40rem)` | nejde přesně zapsat | do 40rem, ale 40rem už ne |

Karty výletů teď mají základ v jednom sloupci a dva media dotazy. Hýbej posuvníkem a sleduj, při jaké šířce se změní počet sloupců:

:::live
```html
<div class="frame"><iframe class="device" title="Stránka v okně zvolené šířky" srcdoc="
<style>
  body { margin: 0; padding: 1rem; font-family: system-ui, sans-serif; color: #1c2b36; }
  h1 { margin: 0 0 1rem; font-size: 1.75rem; }
  .trips { display: grid; gap: 1rem; }
  .trip { padding: 1rem; border-radius: 0.75rem; background: #e0f2fe; }
  .trip h2 { margin: 0 0 0.25rem; font-size: 1.25rem; }
  .trip p { margin: 0; }

  @media (width >= 40rem) {
    .trips { grid-template-columns: repeat(2, 1fr); }
  }

  @media (width >= 60rem) {
    .trips { grid-template-columns: repeat(3, 1fr); }
  }
</style>
<h1>Výlety po Česku</h1>
<div class='trips'>
  <article class='trip'><h2>Pravčická brána</h2><p>Největší přirozená skalní brána v Evropě.</p></article>
  <article class='trip'><h2>Propast Macocha</h2><p>Hluboká 138 metrů, dolů vede lodička.</p></article>
  <article class='trip'><h2>Sněžka</h2><p>Nejvyšší hora Česka s výhledem do Polska.</p></article>
</div>
"></iframe></div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; }

.device {
  width: calc(var(--w) * 1px);
  height: 26rem;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  background: white;
  scale: calc(340 / max(var(--w), 340));
  transform-origin: 0 0;
}

.frame {
  /* Zmenšený rámeček zabírá jen tolik místa, kolik je ho vidět. */
  width: 346px;
  height: calc((26rem + 4px) * 340 / max(var(--w), 340));
  overflow: hidden;
}
```
```controls
--w: range(320, 1280, 20) = 360 | Šířka okna (px)
```
:::

Dva sloupce naskočí na 640 px (40 × 16), tři na 960 px. Zkus v kódu změnit první podmínku na `(width >= 30rem)` a najdi šířku, od které se karty zase mačkají.

> [!TIP]
> V DevTools zapneš režim zařízení zkratkou Ctrl+Shift+M (na Macu Cmd+Shift+M). Nahoře nastavíš šířku a v nabídce ⋮ zapneš „Show media queries": lišta nad stránkou pak ukazuje, kde začínají tvoje media dotazy. Ve workshopech Akademie přepneš šířku náhledu tlačítky „Jako testy", 768 a 375 nad náhledem.

:::check
Stránka má `@media (40rem <= width < 60rem) { … }`. Platí pravidla uvnitř v okně širokém přesně 960 px?

### --answer--
Ano, 960 px je horní hranice rozsahu.

#### --why--
Myslíš si, že `<` hranici zahrnuje? Nezahrnuje, to by bylo `<=`.

### --correct--
Ne, 960 px je přesně 60rem a `width < 60rem` tuhle šířku vylučuje.

#### --why--
Rozsah platí od 640 px včetně do 960 px bez 960 px. V okně 960 px už platí to, co je od 60rem výš.

### --answer--
Nedá se říct, záleží na velikosti písma nastavené na `html`.

#### --why--
`rem` v podmínce media dotazu se na styly stránky neohlíží. Počítá se z výchozí velikosti písma prohlížeče.
:::

## Pořadí rozhoduje: media dotaz nepřidává sílu

Media dotaz jen rozhoduje, **jestli** se pravidla uvnitř vůbec použijí. Když se použijí, soupeří s ostatními pravidly podle obvyklých pravidel kaskády: stejná specificita, vyhraje pozdější pravidlo v souboru.

Rámeček níž je okno široké 700 px. Než odkryješ náhled, tipni si:

:::live predict
```html
<div class="frame"><iframe class="device" title="Okno široké 700 px" srcdoc="
<style>
  body { margin: 0; padding: 2rem; font-family: system-ui, sans-serif; }

  @media (width >= 40rem) {
    .sale { background: #bbf7d0; }
  }

  .sale { padding: 1.5rem; border-radius: 1rem; background: #fde68a; font-size: 2rem; }
</style>
<p class='sale'>Sleva 20 % na stany</p>
"></iframe></div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; }

.device {
  width: 700px;
  height: 14rem;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  background: white;
  scale: 0.5;
  transform-origin: 0 0;
}

.frame {
  /* Zmenšený rámeček zabírá jen tolik místa, kolik je ho vidět. */
  width: 354px;
  height: calc((14rem + 4px) / 2);
  overflow: hidden;
}
```
--question-- Jakou barvu pozadí bude mít banner v okně širokém 700 px?
--option-- Zelenou, protože 700 px je víc než 40rem a pravidlo v media dotazu má přednost.
--option*-- Žlutou, protože obě pravidla platí a pozdější v souboru vyhraje.
--option-- Žlutou, protože 700 px je méně než 40rem a media dotaz neplatí.
--why-- 40rem je 640 px, takže v okně 700 px media dotaz platí. Jeho pravidlo ale nemá žádnou prioritu navíc: obě pravidla mají selektor `.sale`, a tak vyhraje to, které je v souboru později, tedy žluté. Přesuň blok `@media` pod základní pravidlo a banner zezelená. Proto se v mobile-first píše nejdřív základ a pod něj media dotazy od nejužšího po nejširší.
--see-- css-responzivita/mobile-first#poradi-rozhoduje-media-dotaz-nepridava-silu
:::

> [!REMEMBER]
> **Media dotaz pravidlům nepřidává specificitu.** Základní styly patří nad media dotazy a media dotazy seřaď od nejmenší šířky po největší.

:::check
V souboru je nejdřív `@media (width >= 48rem) { .menu { display: flex; } }` a pod ním `.menu { display: grid; }`. Jakou hodnotu `display` bude mít `.menu` v okně 1200 px? Napiš jen hodnotu.

### --expected--
grid

### --why--
V okně 1200 px platí obě pravidla se stejnou specificitou, takže vyhraje pozdější `display: grid`. Pravidlo v media dotazu se neuplatní nikdy.
:::

## Body zlomu podle obsahu

Šířka, na které media dotaz mění rozvržení, je [[bod zlomu]] (*breakpoint*). Svádí to psát body zlomu podle zařízení: 375 px pro iPhone, 768 px pro tablet. Zařízení se ale mění každý rok a mezi nimi je stovka šířek, na které nikdo nepomyslel.

Lepší je ptát se **obsahu**: posouvej šířku okna a zapiš si, kde rozvržení začne vypadat špatně. Tam patří bod zlomu. Když víš, jak široká má karta nejméně být, můžeš bod zlomu i spočítat:

1. Karta je čitelná od 18rem, mezi kartami je `gap` 1rem, stránka má vlevo i vpravo `padding` 1rem.
2. Dva sloupce potřebují 18 + 1 + 18 = 37rem, s paddingem 37 + 2 = 39rem.
3. Bod zlomu je **`(width >= 39rem)`**, tedy 624 px.

Body zlomu piš v `rem` nebo `em`, ne v `px`. Když si uživatel v nastavení prohlížeče zvětší výchozí písmo z 16 na 20 px, zvětší se i text karet a bod zlomu `39rem` se posune s ním na 780 px. Bod zlomu v pixelech by zůstal na 624 px a zvětšené karty by se ve dvou sloupcích mačkaly.

Tady je past, kterou čeká málokdo. Okno je znovu široké 700 px:

:::live predict
```html
<div class="frame"><iframe class="device" title="Okno široké 700 px" srcdoc="
<style>
  html { font-size: 62.5%; }
  body { margin: 0; padding: 2rem; font-family: system-ui, sans-serif; }
  .plan { padding: 2rem; border-radius: 1rem; background: #fde68a; font-size: 3.2rem; }

  @media (width >= 60rem) {
    .plan { background: #bbf7d0; }
  }
</style>
<p class='plan'>Tarif Plus</p>
"></iframe></div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; }

.device {
  width: 700px;
  height: 14rem;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  background: white;
  scale: 0.5;
  transform-origin: 0 0;
}

.frame {
  /* Zmenšený rámeček zabírá jen tolik místa, kolik je ho vidět. */
  width: 354px;
  height: calc((14rem + 4px) / 2);
  overflow: hidden;
}
```
--question-- Kolega nastavil `html { font-size: 62.5% }`, aby 1rem byl 10 px. Jakou barvu bude mít tarif v okně širokém 700 px?
--option-- Zelenou, protože 60rem je teď 600 px a okno je širší.
--option*-- Žlutou, protože v media dotazu je 60rem pořád 960 px.
--option-- Žlutou, protože media dotaz v `rem` nefunguje a prohlížeč ho zahodí.
--why-- `rem` v podmínce media dotazu se nepočítá z `font-size` na `html`, ale z výchozí velikosti písma prohlížeče (obvykle 16 px). Media dotaz se totiž vyhodnocuje dřív, než prohlížeč styly stránky použije. 60rem je proto 960 px a v okně 700 px dotaz neplatí. Uvnitř pravidel (padding, písmo) ale `rem` 10 px je — dvě různé „rem" v jednom souboru. Posuň podmínku na `(width >= 40rem)` a tarif zezelená.
--see-- css-responzivita/mobile-first#body-zlomu-podle-obsahu
:::

:::check
Karta je čitelná od 20rem, mezi dvěma kartami je `gap` 1.5rem a stránka má `padding-inline` 1rem na každé straně. Od jaké šířky okna v `rem` se vejdou dva sloupce? Napiš jen číslo.

### --expected--
43.5

### --accept--
43.5rem
43,5

### --why--
20 + 1.5 + 20 = 41.5rem pro karty s mezerou, k tomu 2 × 1rem paddingu, tedy 43.5rem (696 px). Bod zlomu je `(width >= 43.5rem)`.
:::

## Plynulé velikosti: `clamp()`

Nadpis, který má na telefonu 32 px, je na monitoru malý. Dva media dotazy s pevnými velikostmi fungují, ale nadpis mezi nimi skáče. [[plynulá velikost|Plynulá velikost]] (*fluid sizing*) roste s oknem bez skoků a drží se v mezích. Funkci `clamp()` znáš ze základů CSS:

```css
h1 {
  font-size: clamp(2rem, 1rem + 4vw, 3.5rem);
}
```

- první hodnota je **minimum**, poslední **maximum**,
- prostřední je **preferovaná** hodnota, která roste s oknem: `1vw` je 1 % šířky okna.

Výpočet pro okno 600 px: 1rem + 4vw = 16 + 0.04 × 600 = 16 + 24 = **40 px**. To je mezi 32 a 56 px, takže platí 40 px. V okně 375 px vyjde 16 + 15 = 31 px, což je pod minimem, a platí **32 px**.

:::live
```html
<div class="frame"><iframe class="device" title="Stránka v okně zvolené šířky" srcdoc="
<style>
  body { margin: 0; padding: 1rem; font-family: system-ui, sans-serif; color: #1c2b36; }
  h1 { margin: 0 0 0.5rem; font-size: clamp(2rem, 1rem + 4vw, 3.5rem); line-height: 1.1; }
  .ruler { margin: 0; color: #94a3b8; line-height: 1.1; }
</style>
<h1>Výlety po Česku</h1>
<p class='ruler' style='font-size: 2rem'>min 32 px</p>
<p class='ruler' style='font-size: 3.5rem'>max 56 px</p>
"></iframe></div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; }

.device {
  width: calc(var(--w) * 1px);
  height: 16rem;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  background: white;
  scale: calc(340 / max(var(--w), 340));
  transform-origin: 0 0;
}

.frame {
  /* Zmenšený rámeček zabírá jen tolik místa, kolik je ho vidět. */
  width: 346px;
  height: calc((16rem + 4px) * 340 / max(var(--w), 340));
  overflow: hidden;
}
```
```controls
--w: range(320, 1280, 20) = 360 | Šířka okna (px)
```
:::

Posouvej šířku a porovnávej nadpis se šedými řádky, které mají velikost minima a maxima: do 400 px je nadpis stejně velký jako „min", pak roste o 4 px na každých 100 px okna a od 1000 px se zastaví na velikosti „max". Zkus v kódu změnit `4vw` na `6vw` a najdi šířku, od které nadpis přestane růst.

> [!PITFALL] Písmo jen ve `vw`
> *Příznak:* `font-size: 5vw` vypadá dobře, ale když si uživatel stránku přiblíží (Ctrl +), text se skoro nezvětší. Přiblížení totiž zúží okno v CSS pixelech a `vw` se zmenší.
>
> *Oprava:* v preferované hodnotě vždy sčítej `rem` a `vw` (`1rem + 4vw`) a meze piš v `rem`.

:::check
Nadpis má `font-size: clamp(1.5rem, 0.5rem + 5vw, 3rem)`. Kolik pixelů bude mít v okně širokém 400 px? Napiš jen číslo.

### --expected--
28

### --accept--
28 px
28px

### --why--
0.5rem + 5vw = 8 + 0.05 × 400 = 8 + 20 = 28 px. Minimum je 24 px a maximum 48 px, takže 28 px platí.
:::

## Obrázky: `srcset` a `sizes`

Obrázek, který na monitoru zabírá 1200 px, je na telefonu široký 360 px. Když telefon stahuje verzi pro monitor, platí uživatel za data a stránka se načítá déle. [[responzivní obrázek|Responzivní obrázek]] (*responsive image*) to řeší: atribut `srcset` nabídne prohlížeči víc souborů a atribut `sizes` mu řekne, jak široký obrázek na stránce bude:

```html
<img
  src="kolo-960.jpg"
  srcset="kolo-480.jpg 480w, kolo-960.jpg 960w, kolo-1600.jpg 1600w"
  sizes="(width >= 60rem) 50vw, 100vw"
  alt="Mechanik seřizuje přehazovačku">
```

- `480w` říká „tenhle soubor je široký 480 pixelů",
- `sizes` se čte zleva: od 60rem bude obrázek široký půlku okna, jinak celé okno,
- prohlížeč vynásobí šířku ze `sizes` hustotou displeje a vybere nejbližší vhodný soubor. Displej s hustotou 2 potřebuje na 360 px obrázku 720 pixelů souboru.

Bez `sizes` prohlížeč počítá s `100vw`, tedy s obrázkem přes celé okno. Obě varianty níž mají stejné tři soubory a stejný obrázek široký 160 px, liší se jen atributem `sizes`. Na každém souboru je napsaná jeho šířka, takže hned vidíš, který prohlížeč stáhl. Skript v ukázce jen nahrazuje server, ze kterého by se soubory jinak stahovaly.

:::compare
```css
body { margin: 1rem; font-family: system-ui, sans-serif; }
img { display: block; width: 160px; height: auto; border-radius: 0.5rem; }
```
```js
// Náhled nemá odkud stáhnout soubory kolo-160.svg, kolo-480.svg a kolo-960.svg,
// tak je skript vyrobí sám a do každého napíše jeho šířku.
const colors = { 160: '#0f766e', 480: '#1d4ed8', 960: '#7c3aed' };

for (const img of document.querySelectorAll('img[srcset]')) {
  img.srcset = img.getAttribute('srcset').replace(/[\w-]+-(\d+)\.svg/g, (name, width) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${width * 0.625}">
      <rect width="100%" height="100%" fill="${colors[width]}"/>
      <text x="50%" y="60%" font-family="sans-serif" font-size="${width / 5}" fill="white" text-anchor="middle">${width} px</text>
    </svg>`;
    return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  });
}
```
--variant-- bez sizes
```html
<img srcset="kolo-160.svg 160w, kolo-480.svg 480w, kolo-960.svg 960w"
  alt="Obrázek s nápisem šířky staženého souboru">
```
--variant-- sizes="160px"
```html
<img srcset="kolo-160.svg 160w, kolo-480.svg 480w, kolo-960.svg 960w"
  sizes="160px"
  alt="Obrázek s nápisem šířky staženého souboru">
```
:::

Vlevo prohlížeč stáhl soubor pro obrázek přes celý náhled, i když ho zobrazuje ve 160 px. Vpravo stačil menší soubor. Na displeji s vyšší hustotou uvidíš v obou náhledech o stupeň větší soubor, poměr ale zůstane. Zkus vpravo změnit `sizes` na `100px`.

> [!NOTE]
> U obrázků s `loading="lazy"` jde napsat `sizes="auto, 100vw"` a prohlížeč si šířku změří sám. Prohlížeč, který `auto` ještě nezná, ho přeskočí a použije `100vw`. Ručně psaný `sizes` funguje všude a u obrázků nahoře na stránce, které se načítají hned, je jediná možnost.

:::check
Obrázek je na telefonu přes celou šířku okna a od 50rem zabírá třetinu okna. Napiš hodnotu atributu `sizes`.

### --expected--
(width >= 50rem) 33vw, 100vw

### --accept--
(min-width: 50rem) 33vw, 100vw
(width >= 50rem) 33.33vw, 100vw
(min-width: 50rem) 33.33vw, 100vw
(width >= 50rem) calc(100vw / 3), 100vw

### --why--
Podmínky v `sizes` se čtou zleva a použije se první, která platí; poslední hodnota bez podmínky je výchozí. Proto užší případ bez podmínky patří na konec.
:::

## Dotykové cíle

Myš trefí odkaz velký 16 px, prst ne. Doporučená velikost [[dotykový cíl|dotykového cíle]] (*touch target*) je **44 × 44 px**; pravidla přístupnosti WCAG 2.2 berou jako úplné minimum 24 × 24 px. Rozhoduje plocha, na kterou jde kliknout, ne velikost písma. Obě navigace níž mají stejné odkazy se stejným písmem, liší se jedním pravidlem. Přerušovaný rámeček ukazuje, kam jde kliknout:

:::compare
```html
<nav class="tabs">
  <a href="#">Služby</a>
  <a href="#">Ceník</a>
  <a href="#">Kontakt</a>
</nav>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; }

.tabs { display: flex; gap: 0.5rem; }

.tabs a {
  padding-inline: 0.5rem;
  color: #0f766e;
  font-size: 0.9375rem;
  outline: 1px dashed #94a3b8;
}
```
--variant-- jen text
```css
.tabs a { display: inline-block; }
```
--variant-- cíl 44 px
```css
.tabs a {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.75rem;
}
```
:::

Vpravo má každý odkaz výšku aspoň 2.75rem (44 px) a text je v ní svisle uprostřed díky `inline-flex`. Rozestupy mezi cíli pomáhají taky: dva cíle těsně u sebe svádějí ke kliknutí vedle.

:::check
Tlačítko má `font-size: 1rem`, `line-height: 1.5` a svislý `padding` 0.5rem nahoře i dole, bez rámečku. Kolik pixelů je vysoké? Napiš jen číslo.

### --expected--
40

### --accept--
40 px
40px

### --why--
Řádek textu je 16 × 1.5 = 24 px a padding přidá 8 + 8 px, celkem 40 px. Na doporučených 44 px chybí 4 px: pomůže `min-block-size: 2.75rem` nebo padding 0.625rem.
:::

## Typické chyby a pasti

> [!PITFALL] Desktopová pravidla přebíjejí mobilní
> *Příznak:* na telefonu vidíš tři sloupce, i když máš `@media (width < 40rem) { .cards { grid-template-columns: 1fr; } }`.
>
> *Oprava:* media dotaz stojí v souboru **nad** základním pravidlem `.cards`, a to ho přebije. Přesuň základ nad media dotazy, nejlépe rovnou mobile-first: jeden sloupec v základu a více sloupců v `(width >= …)`.

> [!PITFALL] Dva dotazy platí na stejné šířce
> *Příznak:* v okně přesně 768 px se najednou ukáže mobilní i desktopová navigace. V CSS je `@media (max-width: 48rem)` a `@media (min-width: 48rem)`.
>
> *Oprava:* obě podmínky zahrnují hranici. Syntaxe rozsahů to vyřeší bez triků: `(width < 48rem)` a `(width >= 48rem)`.

> [!PITFALL] Chybí `sizes`
> *Příznak:* malá náhledová fotka ve výpisu produktů má na telefonu stažený soubor široký 1600 px (v DevTools v panelu Network).
>
> *Oprava:* `srcset` s `w` bez `sizes` znamená `100vw`. Napiš `sizes` podle toho, jak široký obrázek na stránce opravdu je.

:::check
Galerie ukazuje náhledy široké 200 px. Každý má `srcset="foto-400.jpg 400w, foto-800.jpg 800w, foto-1600.jpg 1600w"` a žádný `sizes`. Který soubor stáhne prohlížeč v okně širokém 1024 px na displeji s hustotou 1? Napiš jeho šířku.

### --expected--
1600

### --accept--
1600w
1600 px
foto-1600.jpg

### --why--
Bez `sizes` počítá prohlížeč s obrázkem přes celé okno, tedy 1024 px, a nejmenší soubor, který to pokryje, má 1600 px. S `sizes="200px"` by stačil soubor 400 px.
:::

:::explain
Vysvětli vlastními slovy, proč se v mobile-first píšou media dotazy s `width >=` a proč stojí v souboru až pod základními styly.

## --model--
Základní styly jsou pro nejužší obrazovku a platí všude, takže každé zařízení dostane aspoň funkční jeden sloupec. Media dotazy s `width >=` k nim od určité šířky přidávají, co širší okno unese. Media dotaz nepřidává specificitu, a tak při stejném selektoru vyhraje pravidlo, které je v souboru později; proto musí rozšíření stát pod základem.

## --checklist--
- Základní styly jsou pro nejužší obrazovku a platí všude.
- `width >=` přidává pravidla od určité šířky výš.
- Media dotaz nezvyšuje specificitu.
- Při stejné specificitě vyhraje pozdější pravidlo, proto media dotazy patří pod základ.
:::

Příště z téhle teorie postavíš celou úvodní stránku servisu kol: od hlavičky pro telefon přes plynulé nadpisy a obrázek se `sizes` až po ceník, který se na mobilu posouvá sám.

## Kde to najdeš v MDN

- [Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) — celá syntaxe media dotazů včetně rozsahů, `and`, `not` a čárky.
- [Viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element) — co dělají hodnoty `width` a `initial-scale` a proč nezakazovat zoom.
- [Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images) — `srcset`, `sizes` a element `<picture>` s obrázky pro různá rozvržení.
- [clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp) — minimum, preferovaná hodnota a maximum s příklady plynulé typografie.

# --questions--

## --question--

Kolega napsal navigaci takhle a na telefonu je pořád vodorovná. Okno telefonu je široké 390 px.

```css
@media (width <= 40rem) {
  .nav { flex-direction: column; }
}

.nav { display: flex; flex-direction: row; gap: 1rem; }
```

Co je špatně?

### --answer--

Podmínka `width <= 40rem` na 390 px neplatí.

#### --why--

40rem je 640 px a 390 px je méně, takže podmínka platí. Problém je v tom, co se stane potom.

### --correct--

Pozdější pravidlo `.nav` přebije `flex-direction: column` z media dotazu, protože má stejnou specificitu.

#### --why--

Media dotaz jen rozhodne, že se jeho pravidlo použije. Pak soupeří s ostatními podle kaskády a vyhraje pozdější `flex-direction: row`. Pomůže přesunout media dotaz pod základ, nebo celé přepsat mobile-first.

### --answer--

V media dotazu nejde měnit `flex-direction`, jen rozměry.

#### --why--

Uvnitř media dotazu smí být jakákoli pravidla a deklarace. Hledej, proč se deklarace neprojeví.

### --see--

css-responzivita/mobile-first#poradi-rozhoduje-media-dotaz-nepridava-silu

## --question--

Perex má `font-size: clamp(1rem, 0.75rem + 1vw, 1.25rem)`. Kolik pixelů bude mít v okně širokém 1280 px? Napiš jen číslo.

### --expected--

20

### --accept--

20 px
20px

### --why--

Preferovaná hodnota je 12 + 12.8 = 24.8 px, to je nad maximem 1.25rem = 20 px. `clamp()` ji zastaví na maximu.

### --see--

css-responzivita/mobile-first#plynule-velikosti-clamp

## --question--

Proč se body zlomu doporučuje psát v `rem` a ne v `px`?

### --answer--

Protože media dotaz v `px` na telefonech nefunguje.

#### --why--

Media dotaz v pixelech funguje všude. Rozdíl nastane, až si někdo změní velikost písma.

### --answer--

Protože `rem` v media dotazu se řídí `font-size` nastaveným na `html`.

#### --why--

Právě že neřídí. `rem` v podmínce media dotazu se počítá z výchozího písma prohlížeče, ne ze stylů stránky.

### --correct--

Protože se posunou, když si uživatel v prohlížeči zvětší výchozí písmo, a rozvržení se změní tam, kde se obsah opravdu přestane vejít.

#### --why--

Větší výchozí písmo zvětší text i bod zlomu v `rem`. Karty se tak přepnou do jednoho sloupce dřív, než by se začaly mačkat.

### --see--

css-responzivita/mobile-first#body-zlomu-podle-obsahu

## --question--

Mobilní menu je v `@media (max-width: 48rem)` a desktopové v `@media (min-width: 48rem)`. V okně širokém přesně 768 px jsou vidět obě. Napiš podmínku v syntaxi rozsahů pro mobilní blok tak, aby na 768 px už neplatila a desktopová zůstala beze změny.

### --expected--

(width < 48rem)

### --accept--

width < 48rem
(width<48rem)

### --why--

`max-width` i `min-width` hranici zahrnují, takže na 768 px platí oba bloky. `width < 48rem` hranici vylučuje a na 768 px zbude jen `min-width: 48rem`.

### --see--

css-responzivita/mobile-first#typicke-chyby-a-pasti
