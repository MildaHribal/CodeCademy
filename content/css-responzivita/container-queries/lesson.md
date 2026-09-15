# Container queries

Karta článku, produktu nebo akce se na skutečném webu objeví na několika místech: ve výpisu přes celou šířku obsahu, v úzkém postranním panelu „Doporučujeme" a třeba ve třísloupcové mřížce na úvodní stránce. Pokaždé má jinak místa, i když je okno stejně široké. Tahle lekce ukáže, jak napsat komponentu, která se ptá na své místo, ne na okno.

:::check pretest
Karta akce má `@media (width >= 40rem) { .event { display: grid; grid-template-columns: 8rem 1fr; } }`. Na monitoru širokém 1440 px ji vložíš do postranního panelu širokého 250 px. Co se stane?

### --answer--
Karta v panelu zůstane svislá, protože je panel úzký.

#### --why--
Tak by to fungovalo, kdyby se karta ptala na šířku panelu. Media dotaz se ale ptá na něco jiného.

### --correct--
Karta bude vodorovná a v panelu se zmáčkne: na text zbude asi 120 px.

#### --why--
Media dotaz měří okno, a to má 1440 px. Podmínka platí, i když karta sama má jen 250 px. Právě tenhle problém řeší container queries.

### --answer--
Media dotaz uvnitř panelu nefunguje a karta se nezobrazí.

#### --why--
Media dotaz platí pro celou stránku bez ohledu na to, kde prvek leží. Karta se zobrazí, jen ne tak, jak bys chtěl.
:::

:::check pretest
Prvek má `container-type: inline-size` a pod ním je `@container (width >= 30rem) { … }`. Tipni si: šířku čeho podmínka měří?

### --answer--
Šířku okna, stejně jako media dotaz.

#### --why--
Okno měří media dotaz. `@container` měří prvek, který si o to řekne vlastností `container-type`.

### --correct--
Šířku nejbližšího předka, který má `container-type`.

#### --why--
Podmínka `@container` se ptá nejbližšího předka stylovaného prvku, který je kontejner. Za chvíli uvidíš, proč na tom slově „předek" záleží.

### --answer--
Šířku prvku, na který se pravidlo uvnitř `@container` vztahuje.

#### --why--
Prvek se na vlastní šířku zeptat nemůže: jeho styly by šířku měnily a ta by zase měnila styly. Kontejner musí být předek.
:::

## Problém: komponenta neví, kde je

V ukázce je stejná karta koncertu dvakrát: nahoře v úzkém panelu (11rem), dole v širším obsahu (24rem). Karta se přepíná na vodorovné rozvržení media dotazem od 20rem, a protože náhled je širší než 320 px, platí podmínka pro obě.

:::live
```html
<aside class="sidebar">
  <article class="event">
    <div class="event__image"></div>
    <div>
      <h2 class="event__title">Jazz na Špilberku</h2>
      <p class="event__meta">pá 18. 9. · Brno</p>
    </div>
  </article>
</aside>

<main class="content">
  <article class="event">
    <div class="event__image"></div>
    <div>
      <h2 class="event__title">Jazz na Špilberku</h2>
      <p class="event__meta">pá 18. 9. · Brno</p>
    </div>
  </article>
</main>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; color: #1e1b4b; }

.sidebar { width: 11rem; margin-bottom: 1rem; outline: 2px dashed #a5b4fc; }
.content { width: 24rem; max-width: 100%; outline: 2px dashed #a5b4fc; }

.event { display: grid; gap: 0.75rem; padding: 0.75rem; border-radius: 0.75rem; background: #eef2ff; }
.event__image { aspect-ratio: 16 / 9; border-radius: 0.5rem; background: linear-gradient(135deg, #4338ca, #db2777); }
.event__title { margin: 0; font-size: 1.125rem; line-height: 1.2; }
.event__meta { margin: 0.25rem 0 0; color: #6366f1; font-size: 0.875rem; }

@media (width >= 20rem) {
  .event { grid-template-columns: 6rem 1fr; align-items: center; }
}
```
:::

Dole je karta v pořádku, nahoře se nadpis mačká do sloupce širokého pár písmen. Změň v kódu šířku `.sidebar` na `20rem` a sleduj, že media dotaz se nezmění: karta v panelu byla vodorovná už předtím.

Na řešení se nedá použít jiný bod zlomu v media dotazu. Okno je pro obě karty stejné, liší se jen **místo**.

> [!REMEMBER]
> **Media dotaz se ptá na okno. [[Container query]] se ptá na kontejner, do kterého komponentu vložíš.** Stejná karta tak může být v panelu svislá a v obsahu vodorovná na jednom a tomtéž monitoru.

:::check
Pro které rozhodnutí se hodí media dotaz spíš než container query?

### --answer--
Karta produktu má být vodorovná, když má dost místa.

#### --why--
„Když má místo" je otázka na místo karty, ne na okno. Karta se může objevit v úzkém panelu i na širokém monitoru.

### --correct--
Stránka má od šířky okna 60rem postranní panel vedle obsahu.

#### --why--
Rozvržení celé stránky závisí na okně, tady je media dotaz správně. Container queries jsou pro komponenty, které se vkládají na různá místa.

### --answer--
Widget s počasím se má zmenšit, když ho uživatel dá do úzkého sloupce na nástěnce.

#### --why--
Widget se ptá na svůj sloupec. Okno se při přesunu mezi sloupci nemění, takže media dotaz by nic nepoznal.
:::

## Kontejner: `container-type` a `@container`

Container query má dvě části:

1. Prvek, na jehož šířku se chceš ptát, označíš jako [[kontejner dotazu|kontejner]] (*query container*): `container-type: inline-size`. `inline-size` znamená šířku (ve směru řádku textu).
2. Pravidla pro potomky napíšeš do bloku `@container (podmínka) { … }`. Podmínka se vyhodnotí proti **nejbližšímu předkovi**, který je kontejner.

```css
.slot {
  container-type: inline-size;
}

@container (width >= 22rem) {
  .event {
    grid-template-columns: 6rem 1fr;
  }
}
```

Podmínky se píšou stejně jako u media dotazů, včetně syntaxe rozsahů. Posuvníkem měníš šířku kontejneru `.slot`, okno zůstává stejné:

:::live
```html
<div class="slot">
  <article class="event">
    <div class="event__image"></div>
    <div>
      <h2 class="event__title">Jazz na Špilberku</h2>
      <p class="event__meta">pá 18. 9. · Brno</p>
    </div>
  </article>
</div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; color: #1e1b4b; }

.slot {
  container-type: inline-size;
  width: var(--slot);
  max-width: 100%;
  outline: 2px dashed #a5b4fc;
}

.event { display: grid; gap: 0.75rem; padding: 0.75rem; border-radius: 0.75rem; background: #eef2ff; }
.event__image { aspect-ratio: 16 / 9; border-radius: 0.5rem; background: linear-gradient(135deg, #4338ca, #db2777); }
.event__title { margin: 0; font-size: 1.125rem; line-height: 1.2; }
.event__meta { margin: 0.25rem 0 0; color: #6366f1; font-size: 0.875rem; }

@container (width >= 16rem) {
  .event { grid-template-columns: 6rem 1fr; align-items: center; }
}
```
```controls
--slot: range(10, 24, 1, rem) = 12 | Šířka kontejneru
```
:::

Posuň šířku kontejneru přes 16rem a karta se přepne. Zkus pak v kódu smazat `container-type: inline-size` z `.slot`: karta zůstane svislá na každé šířce, protože `@container` nemá koho se zeptat.

Když teď kartu vložíš do úzkého panelu i do širokého obsahu, každá se rozhodne sama. Obě varianty mají stejné CSS karty, liší se jen šířkou kontejneru:

:::compare
```html
<div class="slot">
  <article class="event">
    <div class="event__image"></div>
    <div>
      <h2 class="event__title">Jazz na Špilberku</h2>
      <p class="event__meta">pá 18. 9. · Brno</p>
    </div>
  </article>
</div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; color: #1e1b4b; }

.slot { container-type: inline-size; max-width: 100%; outline: 2px dashed #a5b4fc; }

.event { display: grid; gap: 0.75rem; padding: 0.75rem; border-radius: 0.75rem; background: #eef2ff; }
.event__image { aspect-ratio: 16 / 9; border-radius: 0.5rem; background: linear-gradient(135deg, #4338ca, #db2777); }
.event__title { margin: 0; font-size: 1.125rem; line-height: 1.2; }
.event__meta { margin: 0.25rem 0 0; color: #6366f1; font-size: 0.875rem; }

@container (width >= 16rem) {
  .event { grid-template-columns: 6rem 1fr; align-items: center; }
}
```
--variant-- úzký panel (11rem)
```css
.slot { width: 11rem; }
```
--variant-- obsah (18rem)
```css
.slot { width: 18rem; }
```
:::

:::check
Na stránce je `<div class="slot"><article class="event">…</article></div>` a CSS `.event { container-type: inline-size; }` a `@container (width >= 16rem) { .event { grid-template-columns: 6rem 1fr; } }`. Karta je široká 20rem. Bude vodorovná?

### --answer--
Ano, karta je kontejner a má víc než 16rem.

#### --why--
Myslíš si, že se prvek může ptát sám na sebe? Podmínka se vyhodnocuje proti předkovi stylovaného prvku.

### --correct--
Ne, pravidlo pro `.event` se ptá předků karty a žádný z nich kontejner není.

#### --why--
`@container` hledá nejbližšího předka prvku, kterého se pravidlo týká. `.event` sebe nepočítá a `.slot` kontejner není. `container-type` patří na `.slot`.

### --answer--
Ne, `@container` funguje jen s pojmenovaným kontejnerem.

#### --why--
Jméno kontejneru je nepovinné. Bez jména se podmínka ptá nejbližšího předka, který je kontejner.
:::

## Kontejner bez vlastní šířky se zhroutí

`container-type: inline-size` má vedlejší účinek, který překvapí skoro každého: prvek přestane počítat se šířkou svého obsahu. Jinak by vznikl kruh: obsah by měnil šířku kontejneru, šířka by měnila pravidla v `@container` a ta zase obsah. Kontejner proto musí šířku dostat zvenku.

Blokový prvek ji dostane sám, vyplní rodiče. Ve flex řádku se ale položka dělá tak širokou jako obsah. Než odkryješ náhled, tipni si:

:::live predict
```html
<div class="row">
  <div class="slot">
    <article class="event">
      <h2 class="event__title">Jazz na Špilberku</h2>
      <p class="event__meta">pá 18. 9. · Brno</p>
    </article>
  </div>
  <p class="note">Vstupenky od 390 Kč</p>
</div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; color: #1e1b4b; }

.row { display: flex; gap: 1rem; align-items: start; }

.slot { container-type: inline-size; }

.event { padding: 0.75rem; border-radius: 0.75rem; background: #eef2ff; }
.event__title { margin: 0; font-size: 1.125rem; }
.event__meta { margin: 0.25rem 0 0; color: #6366f1; }
.note { margin: 0; }
```
--question-- Jak široká bude karta v řádku?
--option-- Tak široká jako její nadpis, stejně jako bez `container-type`.
--option*-- Skoro nulová: text přeteče mimo a fialové pozadí bude jen tenký proužek.
--option-- Přes celou šířku řádku, protože kontejner vždycky vyplní rodiče.
--why-- Flex položka má výchozí šířku podle obsahu, jenže `container-type: inline-size` obsah z výpočtu šířky vyřadí. `.slot` tak má šířku 0 a karta s ním. Pomůže dát kontejneru šířku zvenku: `flex: 1` na `.slot`, pevnou šířku, nebo z něj udělat blokový prvek. Zkus do `.slot` dopsat `flex: 1;`.
--see-- css-responzivita/container-queries#kontejner-bez-vlastni-sirky-se-zhrouti
:::

> [!PITFALL] Zhroucený kontejner
> *Příznak:* po přidání `container-type: inline-size` se karta ve flex řádku, v buňce s `width: fit-content` nebo v absolutně pozicovaném prvku smrskne na nulovou šířku.
>
> *Oprava:* kontejner potřebuje šířku zvenku. Ve flexu `flex: 1` nebo `flex-basis`, jinde pevná nebo procentní šířka. Kontejner v gridu nebo v normálním toku šířku dostane sám.

:::check
Proč kontejner s `container-type: inline-size` nepočítá se šířkou svého obsahu?

### --answer--
Protože kontejnery musí mít vždycky pevnou šířku v pixelech.

#### --why--
Pevnou šířku mít nemusí. Stačí, když šířku dostane od rodiče, třeba jako blok nebo `flex: 1`.

### --correct--
Protože pravidla v `@container` mění obsah podle šířky kontejneru, a kdyby obsah zároveň určoval šířku, vznikl by kruh.

#### --why--
Šířka kontejneru musí být hotová dřív, než se vyhodnotí podmínky. Proto ji prohlížeč počítá bez obsahu.

### --answer--
Protože `inline-size` znamená, že kontejner je řádkový prvek.

#### --why--
`inline-size` je šířka ve směru řádku textu, ne `display: inline`. Kontejner může být blok, flex položka i buňka gridu.
:::

## Pojmenované kontejnery

Na větší stránce bývá kontejnerů víc v sobě: slot v mřížce je kontejner a uvnitř karty je kontejner i blok se štítky. Podmínka bez jména se vždycky ptá **nejbližšího** kontejneru. Když přidáš kontejner dovnitř karty, pravidla pro jeho potomky se najednou ptají jeho, ne slotu.

Kontejner proto můžeš pojmenovat a v podmínce jméno uvést:

```css
.slot {
  container-name: slot;
  container-type: inline-size;
}

/* totéž zkratkou: jméno / typ */
.slot {
  container: slot / inline-size;
}

@container slot (width >= 30rem) {
  .event__title { font-size: 1.5rem; }
}
```

`@container slot (…)` přeskočí všechny bližší kontejnery s jiným jménem a zeptá se nejbližšího předka jménem `slot`.

:::check
Karta leží v `.slot` s `container: slot / inline-size` (600 px) a nadpis je uvnitř `.event__body` s `container-type: inline-size` (200 px). Pro nadpis platí `@container (width >= 30rem) { h2 { color: navy; } }`. Bude nadpis tmavě modrý?

### --answer--
Ano, slot je široký 600 px, tedy víc než 30rem.

#### --why--
Podmínka bez jména se neptá slotu, ale nejbližšího kontejneru nad nadpisem.

### --correct--
Ne, podmínka se ptá nejbližšího kontejneru `.event__body`, a ten má jen 200 px.

#### --why--
Bez jména rozhoduje nejbližší předek s `container-type`. Aby se nadpis ptal slotu, podmínka musí být `@container slot (width >= 30rem)`.

### --answer--
Ne, dva kontejnery v sobě nejdou a vnitřní se ignoruje.

#### --why--
Kontejnery se do sebe vnořovat smí. Jen je potřeba vědět, kterého z nich se podmínka ptá.
:::

## Jednotky kontejneru: `cqi`

Uvnitř kontejneru můžeš velikosti vztahovat k jeho šířce: `1cqi` je 1 % šířky nejbližšího kontejneru (*container query inline*). Funguje to jako `vw`, jen místo okna je měřítkem kontejner. S `clamp()` dostaneš nadpis, který roste s kartou:

```css
.event__title {
  font-size: clamp(1rem, 0.5rem + 4cqi, 2rem);
}
```

V kontejneru širokém 500 px: 0.5rem + 4cqi = 8 + 0.04 × 500 = 8 + 20 = **28 px**.

:::live
```html
<div class="slot">
  <article class="event">
    <div class="event__image"></div>
    <h2 class="event__title">Jazz na Špilberku</h2>
    <p class="event__meta">pá 18. 9. · Brno</p>
  </article>
</div>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; color: #1e1b4b; }

.slot {
  container-type: inline-size;
  width: var(--slot);
  max-width: 100%;
  outline: 2px dashed #a5b4fc;
}

.event { display: grid; gap: 0.5rem; padding: 0.75rem; border-radius: 0.75rem; background: #eef2ff; }
.event__image { aspect-ratio: 21 / 9; border-radius: 0.5rem; background: linear-gradient(135deg, #4338ca, #db2777); }

.event__title {
  margin: 0;
  font-size: clamp(1rem, 0.5rem + 4cqi, 2rem);
  line-height: 1.1;
}

.event__meta { margin: 0; color: #6366f1; font-size: clamp(0.8125rem, 0.5rem + 2cqi, 1rem); }
```
```controls
--slot: range(150, 400, 10, px) = 200 | Šířka kontejneru
```
:::

Na 200 px vyjde nadpis přesně na minimum 16 px, na 400 px má 24 px. Zkus změnit `4cqi` na `8cqi` a najdi šířku, od které nadpis narazí na maximum 2rem.

> [!NOTE]
> Když kolem prvku žádný kontejner není, `cqi` se počítá z malého okna prohlížeče, tedy skoro jako `svw`. Chyba to nevyhodí, jen výsledek nečekaně roste s oknem.

:::check
Nadpis má `font-size: clamp(1rem, 0.25rem + 5cqi, 1.75rem)` a jeho kontejner je široký 300 px. Kolik pixelů má nadpis? Napiš jen číslo.

### --expected--
19

### --accept--
19 px
19px

### --why--
0.25rem + 5cqi = 4 + 0.05 × 300 = 4 + 15 = 19 px. Je to mezi minimem 16 px a maximem 28 px, takže platí 19 px.
:::

## Media dotaz, nebo container query?

| otázka | nástroj | příklad |
|---|---|---|
| Jak široké je okno? | media dotaz | kolik sloupců má stránka, kde je navigace |
| Kolik místa má komponenta? | container query | karta, widget, formulář v postranním panelu |
| Co uživatel chce nebo umí? | media dotaz | tmavý motiv, omezené animace, myš nebo prst |
| Jaký styl má rodič nastavený? | container style query | varianta karty podle vlastní vlastnosti |

V praxi se oba nástroje doplňují: media dotazy rozvrhnou kostru stránky a komponenty uvnitř se přizpůsobí container queries. Stránka pak nemusí vědět, kolik místa která karta dostala.

> [!NOTE]
> Poslední řádek tabulky je *style query*: `@container style(--variant: featured) { … }` platí, když má předek vlastní vlastnost s touhle hodnotou. Kontejner k tomu nemusí mít `container-type`. Od roku 2026 ji umí všechny hlavní prohlížeče; v kurzu ji nebudeme potřebovat, ale v cizím kódu ji poznáš.

:::check
Blog má na počítači sloupec článků a vedle něj panel „Nejčtenější". Napiš, kterým nástrojem rozhodneš, **jestli bude panel vedle sloupce, nebo pod ním**: napiš `media` nebo `container`.

### --expected-- ignore-case
media

### --accept--
media dotaz
media query

### --why--
Jestli se panel vejde vedle sloupce, závisí na šířce okna, a to je otázka pro media dotaz. Karty článků uvnitř panelu i sloupce už se rozhodnou container queries podle místa, které dostaly.
:::

## Typické chyby a pasti

> [!PITFALL] Kontejner na samotné kartě
> *Příznak:* karta má `container-type: inline-size` a pravidlo `@container (…) { .card { … } }` se nikdy neuplatní, i když je karta dost široká.
>
> *Oprava:* prvek se nemůže ptát sám sebe. `container-type` dej obalu karty (slotu v mřížce, položce seznamu). Na samotné kartě je kontejner užitečný jen pro pravidla jejích potomků.

> [!PITFALL] Nejbližší kontejner je jiný, než myslíš
> *Příznak:* po přidání `container-type` na vnitřní blok karty se nadpis v široké kartě zmenší zpátky, jako by karta byla úzká.
>
> *Oprava:* podmínky bez jména se teď ptají nového, užšího kontejneru. Pojmenuj vnější kontejner a piš `@container slot (…)`.

> [!PITFALL] `container-type: size` bez výšky
> *Příznak:* kontejner s `container-type: size` má výšku 0 a obsah přetéká přes prvky pod ním.
>
> *Oprava:* `size` vyřadí obsah z výpočtu šířky **i výšky**. Pro dotazy na šířku stačí `inline-size`; `size` použij jen u prvku s výškou nastavenou zvenku.

:::explain
Vysvětli vlastními slovy, proč na kartu, která se objevuje v postranním panelu i v obsahu, nestačí media dotaz a co udělá container query jinak.

## --model--
Media dotaz se ptá na šířku okna, a ta je pro kartu v panelu i v obsahu stejná, takže obě karty dostanou stejné rozvržení. Container query se ptá nejbližšího předka s `container-type`, tedy místa, kam kartu vložím. Karta v úzkém panelu tak zůstane svislá a v širokém obsahu se přepne na vodorovnou, i na stejném monitoru.

## --checklist--
- Media dotaz měří okno, které je pro všechny karty na stránce stejné.
- Container query měří nejbližšího předka s `container-type`.
- Kontejner musí být předek karty, ne karta sama.
- Stejná komponenta se tak rozhodne podle místa, kam ji vložíš.
:::

## Kde to najdeš v MDN

- [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) — `container-type`, `@container`, jména kontejnerů a jednotky `cqi`, `cqw`, `cqh`.
- [container-type](https://developer.mozilla.org/en-US/docs/Web/CSS/container-type) — rozdíl mezi `inline-size`, `size` a `normal` a co znamená containment.
- [Using container size and style queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries) — podrobně podmínky na velikost i style queries s vlastními vlastnostmi.

# --questions--

## --question--

Galerie má `.gallery { display: flex; flex-wrap: wrap; gap: 1rem; }` a každá položka `.gallery__item { container-type: inline-size; }`. Po přidání `container-type` zmizely všechny fotky v galerii. Co pomůže?

### --answer--

Změnit `inline-size` na `size`.

#### --why--
`size` vyřadí obsah z výpočtu šířky i výšky, takže položky budou nulové v obou směrech.

### --correct--

Dát položkám šířku zvenku, třeba `flex: 1 1 12rem`.

#### --why--
Flex položka bez `flex-basis` a `width` bere šířku z obsahu, a ten kontejner nepočítá. S výchozí velikostí 12rem a růstem má položka šířku dřív, než se vyhodnotí `@container`.

### --answer--

Přesunout `container-type` na obrázky uvnitř položek.

#### --why--
Obrázky pak zhroutí samy sebe a navíc se pravidla pro obrázky nebudou mít koho zeptat. Problém je v tom, odkud položka bere šířku.

### --see--

css-responzivita/container-queries#kontejner-bez-vlastni-sirky-se-zhrouti

## --question--

Kontejner `.widget` je široký 640 px. Napiš, kolik pixelů je `25cqi` uvnitř něj.

### --expected--

160

### --accept--

160 px
160px

### --why--

`1cqi` je 1 % šířky nejbližšího kontejneru: 640 × 0.25 = 160 px.

### --see--

css-responzivita/container-queries#jednotky-kontejneru-cqi

## --question--

Napiš deklaraci jedinou vlastností, která z `.slot` udělá kontejner jménem `product` pro dotazy na šířku.

### --expected--

container: product / inline-size

### --accept--

container:product/inline-size

### --why--

Zkratka `container` bere nejdřív jméno, za lomítkem typ. Stejné je `container-name: product` spolu s `container-type: inline-size`.

### --see--

css-responzivita/container-queries#pojmenovane-kontejnery
