# Grid, nebo flexbox?

Hlavička e-shopu, řádek štítků u receptu, stránka s filtry vlevo a výsledky vpravo, patička, která má zůstat dole i u prázdného košíku. Na každou z těch věcí jde použít grid i flexbox a obojí „nějak funguje". Tahle lekce ti dá vodítko, podle kterého vybereš dřív, než začneš zkoušet hodnoty.

:::check pretest
Pod receptem je řádek štítků „Vegan", „Bez lepku", „Rychlé", „Do 30 minut". Každý štítek má být jen tak široký jako jeho text a když se nevejdou, zalomí se. Co zvolíš pro seznam štítků?

### --answer--
Grid s `repeat(auto-fill, minmax(5rem, 1fr))`, protože se přizpůsobí šířce.

#### --why--
Mřížka se šířce přizpůsobí, ale všechny štítky dostanou stejně široký sloupec. Jestli to u štítků chceš, ukáže hned první ukázka.

### --correct--
Flexbox s `flex-wrap: wrap` a `gap`.

#### --why--
U štítků rozhoduje délka textu. Proč je to přesně práce pro flexbox, vysvětlí část o obsahu zevnitř a rozvržení zvenku.

### --answer--
Je to jedno, oba nástroje dají stejný výsledek.

#### --why--
Výsledek se liší, a to viditelně. První ukázka lekce ho dá vedle sebe.
:::

## Problém: dva nástroje, dva různé výsledky

Obě varianty níž mají stejný seznam štítků ve stejně širokém kontejneru. Liší se jen tím, kdo rozhoduje o šířce štítku:

:::compare
```html
<ul class="tags">
  <li>Vegan</li>
  <li>Bez lepku</li>
  <li>Rychlé</li>
  <li>Do 30 minut</li>
  <li>Pálivé</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.tags {
  gap: 8px;
  width: 360px;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.tags li {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #dcfce7;
  color: #14532d;
  font-weight: 600;
}
```
--variant-- Flexbox se zalamováním
```css
.tags { display: flex; flex-wrap: wrap; }
```
--variant-- Grid s auto-fill
```css
.tags { display: grid; grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr)); }
```
:::

Ve flexboxu je každý štítek široký podle svého textu a do řádku se jich vejde tolik, kolik jich délka textů pustí. V gridu dostane každý štítek sloupec široký 84 px — „Vegan" má kolem sebe zbytečné místo a „Bez lepku" se láme na dva řádky. Zkus ve společném CSS zúžit seznam na `width: 220px` a sleduj, kde se který štítek zalomí.

Pro galerii plakátů z minulého workshopu to bylo naopak: tam jsi chtěl stejné sloupce, i když mají plakáty různě dlouhé názvy.

> [!REMEMBER]
> **Flexbox staví zevnitř: velikost položky vychází z jejího obsahu a řada se přizpůsobí. Grid staví zvenku: nejdřív narýsuje stopy a obsah se přizpůsobí jim.**

:::check
Proč se v gridové variantě štítek „Bez lepku" zalomil na dva řádky, i když ve flexboxové variantě se vejde na jeden?

### --answer--
Protože grid ve výchozím stavu zalamuje text a flexbox ne.

#### --why--
Zalamování textu řídí `white-space`, ne typ rozvržení. Podívej se, kdo štítku určil šířku.

### --correct--
Protože šířku štítku určil sloupec mřížky (84 px), ne délka jeho textu.

#### --why--
Mřížka nejdřív spočítala sloupce z minima `5rem` a šířky seznamu a štítek se musel vejít do svého sloupce. Ve flexboxu je výchozí velikost položky velikost obsahu.

### --answer--
Protože v gridu chybí `flex-wrap: wrap`.

#### --why--
`flex-wrap` v gridu nic nedělá a gridová varianta položky do dalšího řádku posílá sama. O šířce jednotlivého štítku rozhodlo něco jiného.
:::

## Obsah zevnitř, rozvržení zvenku

Otázka, kterou si polož u každého rozvržení: ==kdo rozhoduje== o velikosti — obsah, nebo návrh stránky?

- **Obsah rozhoduje** (menu, lišta tlačítek, štítky, řádek „ikona + text + šipka"): sáhni po flexboxu. Položky mají různé délky a řada si místo rozdělí podle nich.
- **Návrh rozhoduje** (kostra stránky, mřížka karet, formulář s popisky ve sloupci, dashboard): sáhni po gridu. Rozměry stop znáš předem a obsah se do nich vejde.
- **Dvě osy zároveň** (věci v různých řádcích mají stát pod sebou): vždycky grid. Flexbox každý zalomený řádek počítá zvlášť.

Grid umí i jednu řadu. S `grid-auto-flow: column` přidává sloupce místo řádků a výsledek vypadá jako flexbox. Jen skoro:

:::live predict
```html
<div class="actions">
  <button>OK</button>
  <button>Uložit koncept</button>
  <button>Zrušit</button>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.actions {
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
  width: 400px;
  outline: 2px dashed #94a3b8;
}

button {
  font: inherit;
}
```
--question-- Tři tlačítka v gridu s `grid-auto-flow: column` v kontejneru širokém 400 px. Jak široké bude tlačítko „OK"?
--option-- Jen tak široké jako jeho text, stejně jako ve flexboxu.
--option*-- Šířka textu a k tomu třetina místa, které zbylo.
--option-- Přesně třetina kontejneru, jako by sloupce byly `1fr`.
--why-- Nové sloupce mají velikost `auto`: nejdřív dostanou šířku obsahu a místo, které zbude, se mezi ně rozdělí rovným dílem, protože stopy `auto` se ve výchozím stavu roztahují. „OK" je proto širší než jeho text, ale užší než „Uložit koncept". Přidej `.actions` deklaraci `justify-content: start;` a tlačítka se stáhnou na šířku obsahu. Pro lištu tlačítek je přirozenější flexbox, kde je tohle výchozí chování.
--see-- css-grid/grid-nebo-flex#obsah-zevnitr-rozvrzeni-zvenku
:::

:::check
Formulář objednávky: popisky „Jméno", „E-mailová adresa" a „Poznámka pro kurýra" vlevo, pole vpravo, a všechna pole mají začínat na stejné svislé čáře. Napiš hodnotu `display`, kterou dáš formuláři.

### --expected--
grid

### --why--
Pole v různých řádcích mají stát pod sebou, tedy dvě osy zároveň. Stačí `grid-template-columns: auto 1fr`: první sloupec je široký podle nejdelšího popisku v celém formuláři, ne v jednom řádku.
:::

## Stack: položky pod sebou s mezerou

Nejčastější vzor vůbec: nadpis, text, tlačítko pod sebou s rovnoměrnou mezerou. Místo marginů na každém prvku stačí rodiči `gap`. Funguje to s gridem (`display: grid; gap: 1rem`) i s flexboxem ve sloupci — gridový zápis je o řádek kratší, protože směr nemusíš nastavovat.

Obojí má ale jeden vedlejší účinek, na který se snadno zapomene:

:::live predict
```html
<article class="course">
  <h3>Ranní světlo na Pálavě</h3>
  <p>Vyrazíme před východem slunce na Děvín a naučíš se fotit v protisvětle.</p>
  <a class="button" href="#">Přihlásit se</a>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.course {
  display: grid;
  gap: 0.75rem;
  width: 300px;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
}

.course h3,
.course p {
  margin: 0;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #0f172a;
  color: white;
  text-decoration: none;
}
```
--question-- Karta kurzu je grid s `gap`. Odkaz „Přihlásit se" je v normálním toku řádkový prvek. Jak bude široký?
--option-- Jen tak široký jako jeho text, protože odkaz je řádkový prvek.
--option*-- Přes celou šířku karty.
--option-- Přes polovinu karty, protože grid rozdělí místo mezi tři položky.
--why-- Grid položka se ve výchozím stavu roztáhne přes celou šířku své buňky (`justify-self: normal` se u ní chová jako `stretch`) a je jedno, že odkaz byl v normálním toku řádkový. Stejně by to dopadlo s flexboxem ve sloupci, kde tlačítko roztáhne `align-items: stretch`. Přidej kartě `justify-items: start;` a odkaz se stáhne na šířku textu — pak zkus místo toho `justify-self: start;` jen na `.button`.
--see-- css-grid/grid-nebo-flex#stack-polozky-pod-sebou-s-mezerou
:::

> [!TIP]
> Když chceš tlačítko přes celou šířku jen na telefonu, je roztažení v gridu výhoda: na širokém displeji ho stáhneš jedním `justify-self: start` v media dotazu.

:::check
Karta je `display: grid; gap: 1rem` a tlačítko v ní je přes celou šířku. Napiš deklaraci pro **tlačítko**, se kterou bude jen tak široké jako jeho text a zůstane vlevo.

### --expected--
justify-self: start

### --accept--
justify-self: left
justify-self: flex-start

### --why--
`justify-self` zarovná jednu grid položku v řádkovém směru. Cokoli jiného než výchozí roztažení ji stáhne na šířku obsahu; `start` ji nechá vlevo. Pro všechny položky karty by patřilo na kontejner `justify-items: start`.
:::

## Cluster: štítky a tlačítka, které se zalamují

Cluster je skupina položek různé délky, které stojí vedle sebe a zalomí se, když se nevejdou: štítky, filtry, sdílecí tlačítka, drobečková navigace. Tady rozhoduje obsah, a proto je to flexbox:

```css
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

S `justify-content` pak celou skupinu posuneš doprostřed nebo doprava a s `align-items: center` srovnáš položky různé výšky (ikonu a text). Přesně tuhle skupinu jsi psal na rozehřátí ve workshopu s plakáty.

:::check
V patičce článku jsou sdílecí tlačítka „Facebook", „LinkedIn", „Zkopírovat odkaz". Mají být u pravého okraje a na telefonu se zalomit. Kolega napsal `display: grid; grid-template-columns: repeat(3, 1fr)`. Co uvidí uživatel na širokém monitoru?

### --answer--
Tlačítka u pravého okraje, jen tak široká jako jejich text.

#### --why--
Sloupce `1fr` si rozdělí celou šířku patičky. Kde tedy tlačítka budou a jak široká?

### --correct--
Tři stejně široká tlačítka přes celou šířku patičky, na telefonu pořád tři vedle sebe.

#### --why--
`repeat(3, 1fr)` rozdělí celou šířku na třetiny a položky se ve výchozím stavu roztáhnou. Počet sloupců je pevný, takže se na telefonu nic nezalomí. Pro skupinu tlačítek podle obsahu patří flexbox s `flex-wrap: wrap` a `justify-content: flex-end`.

### --answer--
Nic, `1fr` bez `minmax` je neplatné a deklarace se zahodí.

#### --why--
`1fr` v obyčejné šabloně platné je. Neplatné je jen v `repeat(auto-fill, …)`, kde prohlížeč potřebuje pevné minimum.
:::

## Sidebar: boční panel a obsah

Filtry vedle výsledků hledání, obsah dokumentace vedle článku, knihovna vedle přehrávače. Máš dvě dobré cesty.

**Grid a media dotaz** — přesné a čitelné, znáš ho z kostry aplikace:

```css
.search-page {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  gap: 2rem;
}

@media (max-width: 48rem) {
  .search-page {
    grid-template-columns: 1fr;
  }
}
```

**Flexbox bez media dotazu** — panel i obsah dostanou výchozí velikost a obsah obrovský `flex-grow`. Dokud se oba vejdou vedle sebe, obsah si vezme skoro všechno volné místo. Když by obsah byl užší než jeho výchozí velikost, řádek se zalomí a oba prvky dostanou celou šířku. Posuvníkem měníš šířku kontejneru:

:::live
```html
<div class="search-page">
  <aside class="filters">
    <h3>Filtry</h3>
    <p>Cena, značka, dostupnost</p>
  </aside>
  <main class="results">
    <h3>Výsledky: 128 stanů</h3>
    <p>Seřazeno podle oblíbenosti</p>
  </main>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.search-page {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: var(--width);
  outline: 2px dashed #94a3b8;
}

.search-page > * {
  box-sizing: border-box;
}

.filters {
  flex: 1 1 12rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #e0e7ff;
}

.results {
  flex: 999 1 24rem;
  min-width: 0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f1f5f9;
}

.filters h3,
.results h3 {
  margin: 0 0 0.25rem;
}

.filters p,
.results p {
  margin: 0;
}
```
```controls
--width: range(300, 900, 50, px) = 700 | šířka kontejneru
```
:::

Projeď posuvník a najdi hranici, kde se filtry přesunou nad výsledky. Spočítej si ji: 12rem + 1rem mezera + 24rem = 37rem, tedy 592 px. Nad ní jsou filtry vedle, pod ní nad výsledky. Na 700 px dostanou filtry navíc jen tisícinu volného místa, protože obsah má `flex-grow: 999`.

> [!NOTE]
> Flexbox varianta reaguje na šířku **kontejneru**, ne okna, takže funguje stejně v úzkém sloupci jako přes celou stránku. Grid s media dotazem je zase přesnější: přesně víš, na které šířce se rozvržení přepne. Kontejnerové dotazy, které tenhle rozdíl smažou, přijdou v sekci o responzivním designu.

:::check
V ukázce dáš `.results` místo `flex: 999 1 24rem` zápis `flex: 1 1 24rem`. Co se změní na šířce kontejneru 900 px?

### --answer--
Filtry spadnou nad výsledky, protože se nevejdou.

#### --why--
O zalomení rozhoduje součet výchozích velikostí (12rem + mezera + 24rem), a ten se nezměnil. Změnilo se rozdělení volného místa.

### --correct--
Filtry zůstanou vedle, ale budou výrazně širší, protože si volné místo s výsledky rozdělí rovným dílem.

#### --why--
Volné místo (900 − 592 = 308 px) se dělí podle `flex-grow`. Při 1 : 1 dostanou filtry 154 px navíc a mají přes 340 px, při 1 : 999 skoro nic. Právě proto má obsah `999`.

### --answer--
Nic, `flex-grow` se uplatní jen při zalomení.

#### --why--
`flex-grow` rozděluje volné místo v řádku pokaždé, když nějaké zbývá, se zalomením i bez něj.
:::

## Pancake: hlavička, obsah a patička

Stránka s krátkým obsahem (prázdný košík, přihlášení, stránka 404) má patičku uprostřed obrazovky a pod ní prázdno. Vzor pancake (palačinky na sobě) drží patičku dole: stránka je aspoň tak vysoká jako okno a prostřední řádek si vezme všechno místo, které zbude.

:::compare
```html
<div class="page">
  <header class="page__header">Obzor</header>
  <main class="page__main">Tvůj košík je prázdný.</main>
  <footer class="page__footer">© 2026 Obzor</footer>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

/* V ukázce 20rem místo výšky okna, na skutečné stránce min-block-size: 100dvh */
.page {
  min-block-size: 20rem;
  outline: 2px dashed #94a3b8;
}

.page > * {
  padding: 0.75rem;
}

.page__header { background: #1c1917; color: white; font-weight: 700; }
.page__main { background: #faf7f2; }
.page__footer { background: #e7e5e4; }
```
--variant-- Flexbox, obsah s `flex: 1`
```css
.page { display: flex; flex-direction: column; }
.page__main { flex: 1; }
```
--variant-- Grid, řádky `auto 1fr auto`
```css
.page { display: grid; grid-template-rows: auto 1fr auto; }
```
:::

Obě varianty dávají stejný výsledek a obě jsou správně. Grid má celé rozvržení na jednom místě, v šabloně kontejneru. Flexbox potřebuje pravidlo i na obsahu. Zkus ve společném CSS smazat `min-block-size: 20rem` a sleduj, že v obou variantách patička vyjede nahoru hned pod text.

> [!PITFALL] `height: 100vh` místo minimální výšky
> *Příznak:* s dlouhým obsahem vyteče obsah i patička z obalu, který je vysoký přesně jako okno — pozadí a rámeček stránky skončí uprostřed textu. Na telefonu je navíc s `100vh` spodek krátké stránky schovaný pod lištou prohlížeče.
>
> *Oprava:* webová stránka má být **aspoň** vysoká jako okno, ne přesně: `min-block-size: 100dvh`. Jednotka `dvh` sleduje skutečnou výšku okna i s lištou prohlížeče. Přesnou výšku `block-size: 100dvh` s posuvným obsahem uvnitř chceš jen u aplikace, jako byla kostra přehrávače podcastů.

:::check
Přihlašovací stránka má `body { display: grid; grid-template-rows: auto 1fr auto; }`, ale patička je hned pod formulářem uprostřed obrazovky. Co chybí?

### --answer--
`align-items: end` na patičce.

#### --why--
Zarovnání v buňce nepomůže: celá mřížka je nízká jen jako obsah, takže řádek `1fr` nemá co rozdělit.

### --correct--
Minimální výška stránky, třeba `min-block-size: 100dvh`.

#### --why--
`1fr` dělí volné místo, a to vzniká jen tehdy, když je kontejner vyšší než obsah. Bez minimální výšky je `body` vysoké přesně jako obsah a žádné místo pro prostřední řádek nezbude.

### --answer--
`grid-template-areas` s pojmenovanou oblastí pro patičku.

#### --why--
Oblasti jen pojmenují buňky, na výšce mřížky nic nemění. Hledej, proč řádek `1fr` nedostal žádné místo.
:::

## Grid a flexbox dohromady

Na skutečném webu nevybíráš jeden nástroj pro celou stránku. Kostru a mřížky stavíš gridem, komponenty uvnitř flexboxem nebo malým gridem:

| co stavíš | nástroj | proč |
|---|---|---|
| kostra stránky, dashboard | grid s oblastmi | rozvržení dané návrhem, dvě osy |
| mřížka karet, galerie | grid s `auto-fill` | sloupce pod sebou přes všechny řádky |
| formulář s popisky ve sloupci | grid `auto 1fr` | pole srovnaná na jedné čáře |
| hlavička, lišta tlačítek | flexbox | položky různé délky, jedna řada |
| štítky, filtry (cluster) | flexbox s `flex-wrap` | velikost určuje text |
| obsah karty pod sebou (stack) | grid nebo flexbox s `gap` | obojí, rozhoduje zbytek karty |
| části sousedních karet na stejné výšce | subgrid | řádky sdílené přes karty |

Kostra aplikace s podcasty tak měla grid na `.app`, flexbox v hlavičce a malý grid v přehrávači. Galerie plakátů měla grid na seznamu, subgrid v kurzech a flexbox ve filtrech.

:::explain
Kolega se ptá, proč jsi na mřížku produktů použil grid, když „flexbox s `flex-wrap` přece taky zalamuje". Vysvětli mu to vlastními slovy.

## --model--
Flexbox je jednorozměrný: každý zalomený řádek si volné místo rozděluje sám, takže karty na posledním neúplném řádku se roztáhnou jinak a nestojí pod kartami nad nimi. Grid nejdřív narýsuje sloupce, které platí pro všechny řádky, a karty se do nich vejdou, ať je jich v řádku kolik chce. U mřížky produktů rozhoduje o šířce návrh, ne délka názvu, a to je práce pro grid. Flexbox bych použil uvnitř karty nebo na štítky, kde rozhoduje obsah.

## --checklist--
- Flexbox počítá každý zalomený řádek zvlášť.
- Grid má sloupce společné pro všechny řádky.
- U mřížky produktů rozhoduje návrh, ne obsah položky.
- Flexbox se hodí tam, kde velikost určuje obsah (štítky, lišta).
:::

:::check
Dashboard: nahoře lišta s názvem a tlačítky „Exportovat" a „Sdílet", pod ní dlaždice statistik ve čtyřech sloupcích, které se na telefonu srovnají do dvou. Který nástroj patří na **lištu** a který na **dlaždice**?

### --answer--
Lišta grid, dlaždice flexbox.

#### --why--
V liště rozhoduje délka textů tlačítek a názvu, v dlaždicích mají sloupce stát pod sebou. Který nástroj pracuje s obsahem a který se sloupci?

### --correct--
Lišta flexbox, dlaždice grid.

#### --why--
Lišta je jedna řada položek různé délky — flexbox. Dlaždice jsou sloupce srovnané přes řádky — grid, třeba `repeat(auto-fill, minmax(min(12rem, 100%), 1fr))`.

### --answer--
Obojí grid, flexbox je na layout zastaralý.

#### --why--
Flexbox zastaralý není, oba nástroje jsou současné a každý řeší jiný druh rozvržení.
:::

## Typické chyby a pasti

> [!PITFALL] Grid na štítky
> *Příznak:* štítky nebo filtry jsou stejně široké, krátké mají kolem textu prázdno a dlouhé se lámou na dva řádky.
>
> *Oprava:* když velikost určuje obsah, použij flexbox s `flex-wrap: wrap` a `gap`.

> [!PITFALL] Flexbox na mřížku karet
> *Příznak:* dvě karty na posledním řádku jsou širší než tři karty nad nimi a nestojí v jejich sloupcích.
>
> *Oprava:* `display: grid` s `repeat(auto-fill, minmax(min(15rem, 100%), 1fr))`. Laděním procent ve `flex-basis` to spolehlivě nevyřešíš.

> [!PITFALL] Roztažené tlačítko ve stacku
> *Příznak:* po přepsání karty na `display: grid` (nebo flex ve sloupci) je odkaz „Přihlásit se" přes celou šířku karty.
>
> *Oprava:* grid a flex položky se ve výchozím stavu roztahují. Tlačítku dej `justify-self: start` (ve flex sloupci `align-self: flex-start`).

> [!PITFALL] Flexbox sidebar bez `min-width: 0`
> *Příznak:* výsledky hledání obsahují širokou tabulku nebo pás karet a místo zalomení vytlačí filtry z obrazovky.
>
> *Oprava:* obsah s velkým `flex-grow` potřebuje `min-width: 0`, jinak se nezmenší pod šířku svého obsahu. V gridu je obdobou `minmax(0, 1fr)`.

:::check
Kolega postavil hlavičku jako `display: grid; grid-template-columns: repeat(4, 1fr)` pro logo, dvě položky menu a tlačítko „Košík (2)". Na telefonu se „Košík (2)" láme na dva řádky, přestože vlevo od loga je volné místo. Napiš hodnotu `display`, kterou hlavičce doporučíš.

### --expected--
flex

### --why--
Logo, menu a košík mají různě dlouhé texty a sloupce `1fr` jim daly stejné čtvrtiny bez ohledu na obsah. Ve flexboxu je výchozí velikost položky velikost obsahu, takže krátké logo si nevezme místo, které potřebuje košík.
:::

## Kde to najdeš v MDN

- [Relationship of grid layout to other layout methods](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Relationship_with_other_layout_methods) — jednorozměrný flexbox proti dvourozměrnému gridu na stejném příkladu karet.
- [Common grid layouts](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Common_grid_layouts) — kostra stránky, mřížka produktů a další vzory, které se staví gridem.
- [Typical use cases of flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Use_cases) — navigace, lišty, patička karty u dna a další místa, kde se hodí flexbox.
- [`justify-self`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/justify-self) — výchozí hodnota `normal` a proč se grid položky roztahují.

# --questions--

## --question--

Seznam receptů má `display: flex; flex-wrap: wrap; gap: 1rem;` a karty `flex: 1 1 15rem`. V kontejneru se vejdou tři karty na řádek a receptů je pět. Jak široké budou dvě karty na druhém řádku v porovnání s kartami nad nimi?

### --answer--

Stejně široké jako karty nad nimi, protože mají stejné `flex`.

#### --why--

Stejné `flex` znamená stejnou výchozí velikost a stejný podíl na volném místě — ale v rámci řádku. Kolik volného místa má druhý řádek?

### --correct--

Širší, protože si druhý řádek dělí volné místo jen mezi dvě karty.

#### --why--

Každý zalomený řádek flexboxu rozděluje místo zvlášť. Na druhém řádku jsou dvě karty, takže každá dostane větší kus volného místa a nebudou stát ve sloupcích pod kartami nad nimi.

### --answer--

Užší, protože druhý řádek má méně položek.

#### --why--

Méně položek v řádku znamená víc volného místa na každou, ne méně.

### --see--

css-grid/grid-nebo-flex#grid-a-flexbox-dohromady

## --question--

Karta je `display: flex; flex-direction: column; gap: 1rem;` a obsahuje odkaz s třídou `.button`, který je přes celou šířku karty. Napiš deklaraci pro `.button`, se kterou bude jen tak široký jako jeho text a zůstane vlevo.

### --expected--

align-self: flex-start

### --accept--

align-self: start

### --why--

Ve sloupcovém flexboxu je vodorovná vedlejší osa a položky roztahuje `align-items: stretch`. Jednu položku stáhneš přes `align-self`. `justify-self` by ve flexboxu nic neudělalo.

### --see--

css-grid/grid-nebo-flex#stack-polozky-pod-sebou-s-mezerou

## --question--

Stránka s filtry používá flexbox bez media dotazu: `.filters { flex: 1 1 14rem; }`, `.results { flex: 999 1 30rem; min-width: 0; }` a kontejner má `gap: 2rem`. Od jaké šířky kontejneru v `rem` budou filtry vedle výsledků?

### --expected--

46

### --accept--

46rem
46 rem

### --why--

Vedle sebe se vejdou, když kontejner pojme obě výchozí velikosti i mezeru: 14 + 2 + 30 = 46rem. Pod tím se řádek zalomí a oba prvky dostanou celou šířku.

### --see--

css-grid/grid-nebo-flex#sidebar-bocni-panel-a-obsah
