# Čtení návrhu z Figmy

Ve většině firem nedostaneš zadání „udělej hezkou stránku", ale odkaz na návrh ve Figmě. Tam je přesně nakreslená obrazovka pro 1440 a 375 px a tvoje práce je z ní udělat stránku, která funguje i na 900 px, s dlouhým jménem uživatele a v tmavém motivu. Lekce ukáže, co z návrhu převzít, co přeložit a na co se zeptat.

:::check pretest
Ve Figmě klikneš na tlačítko a v panelu vidíš `X: 312, Y: 540, W: 148, H: 44`. Co z toho do CSS převezmeš?

### --answer--
Všechno, jako `position: absolute; left: 312px; top: 540px; width: 148px; height: 44px`.

#### --why--
Souřadnice platí jen pro jednu nakreslenou šířku obrazovky a jeden text. Když se změní šířka nebo text tlačítka, stránka se rozpadne. Uvidíš to v první ukázce.

### --correct--
Nejspíš jen výšku (44 px) — polohu a šířku určí rozvržení a obsah.

#### --why--
Poloha na plátně je výsledek, ne pravidlo. Pravidla (mezery, zarovnání, jak se prvek natahuje) najdeš v nastavení auto layoutu. Výška 44 px je pravděpodobně záměr: nejmenší dotykový cíl.

### --answer--
Nic, návrh je jen obrázek pro inspiraci.

#### --why--
Návrh obsahuje přesné hodnoty rozestupů, velikostí a barev a tým čeká, že je dodržíš. Jen je musíš přeložit na pravidla, ne na souřadnice.
:::

:::check pretest
Návrhář v panelu u textu uvádí výšku řádku `150%`. Odhadni: je v CSS jedno, jestli napíšeš `line-height: 150%`, nebo `line-height: 1.5`?

### --answer--
Je to jedno, obojí znamená 1,5násobek písma.

#### --why--
Na prvku, kde to napíšeš, ano. Rozdíl se ukáže u potomků s jinou velikostí písma — past je rozebraná na konci lekce.

### --correct--
Není, liší se tím, co zdědí vnořené prvky.

#### --why--
Procenta se spočítají na pixely a potomci zdědí pixely. Číslo bez jednotky zdědí jako poměr. Předpověď na konci lekce to ukáže.
:::

## Problém: návrh není kód

Figma umí u každého prvku ukázat CSS. Vypadá to jako zkratka, jenže u prvku, který v návrhu leží volně na plátně, dostaneš souřadnice. Tady je karta akce přepsaná přesně podle hodnot z panelu:

:::live predict
```html
<article class="event">
  <p class="event__date">so 24. 10. · 20:00</p>
  <h3 class="event__title">Koncert: Noční tramvaj a hosté z Brna a Ostravy</h3>
  <p class="event__place">MeetFactory, Praha</p>
  <a class="event__button" href="#">Vstupenky</a>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; background: #eef1f5; }

/* Hodnoty zkopírované z návrhu, kde byl nadpis na jeden řádek */
.event {
  position: relative;
  width: 320px;
  height: 188px;
  border-radius: 16px;
  background: #fff;
}
.event p, .event h3 { margin: 0; }
.event__date { position: absolute; left: 24px; top: 24px; color: #b45309; font-size: 14px; font-weight: 600; }
.event__title { position: absolute; left: 24px; top: 46px; width: 272px; font-size: 20px; line-height: 28px; }
.event__place { position: absolute; left: 24px; top: 78px; color: #6b7280; }
.event__button { position: absolute; left: 24px; top: 120px; padding: 10px 20px; border-radius: 8px; background: #1f2937; color: #fff; text-decoration: none; }
```
--question-- V návrhu měl nadpis jeden řádek, tady je delší. Co se stane?
--option-- Karta se prodlouží a ostatní prvky se posunou dolů.
--option*-- Nadpis se na druhém řádku překryje s místem konání.
--option-- Nadpis se zkrátí třemi tečkami, aby se vešel.
--why-- Absolutně umístěné prvky nevědí o sobě ani o obsahu. Místo konání je napevno 78 px od horní hrany, ať je nadpis jakkoli dlouhý, a karta má pevnou výšku. Návrh zachytil jeden stav s jedním textem; kód musí zvládnout všechny. Zkus kartu přepsat na `display: flex; flex-direction: column; gap: 8px; padding: 24px;` bez `position` a pevné výšky.
--see-- css-design/cteni-navrhu#auto-layout-je-flexbox
:::

> [!REMEMBER]
> **Z návrhu nepřebíráš souřadnice, ale pravidla: co je skupina, jaké jsou mezery a zarovnání, jak se prvek chová, když se změní obsah nebo šířka, a který token hodnota znamená.** Když pravidlo z návrhu nevyčteš, zeptáš se.

:::check
V návrhu je text „Poslední 3 vstupenky" umístěný `X: 24, Y: 132` uvnitř karty, bez auto layoutu. Co je nejlepší první krok, než napíšeš CSS?

### --answer--
Napsat `position: absolute; left: 24px; top: 132px`, ať to přesně sedí.

#### --why--
Přesně to sedí jen s tímhle textem a touhle výškou karty. S jiným obsahem se prvky překryjí, jako v ukázce.

### --correct--
Zjistit, ke které skupině text patří a jaká je mezera k sousedům, a zapsat to jako tok nebo flex s `gap`.

#### --why--
Souřadnice jsou výsledek. Pravidlo, ze kterého vznikly, je vzdálenost od souseda a příslušnost ke skupině.

### --answer--
Požádat návrháře o obrázek ve vyšším rozlišení.

#### --why--
Obrázek nic neřekne o tom, jak se karta chová s jiným textem. Potřebuješ pravidla, ne pixely.
:::

## Auto layout je flexbox

Dobrý návrh má skupiny v [[auto layout|auto layoutu]] (*auto layout*): rámec (*frame*), který řadí své děti za sebe s mezerou a odsazením. Je to flexbox nakreslený myší a hodnoty se překládají skoro jedna k jedné:

| Figma (panel Auto layout) | CSS |
|---|---|
| směr *Horizontal* / *Vertical* | `display: flex` + `flex-direction: row` / `column` |
| *Wrap* | `flex-wrap: wrap` |
| *Grid* (sloupce a řádky) | `display: grid` + `grid-template-columns` |
| *Gap* (číslo) | `gap` |
| *Gap: Auto* (rozestoupit) | `justify-content: space-between` |
| *Padding* | `padding` |
| zarovnání v mřížce 3 × 3 | `justify-content` a `align-items` podle směru |
| *Absolute position* u dítěte | `position: absolute` uvnitř `position: relative` |

U dětí rámce nastavuje návrhář, jak se mají natahovat. Tomu se věnuje další část. Pozor na jednu věc: když má rámec *Gap: Auto*, mezeru mezi prvky v návrhu vidíš jako číslo, ale je to jen **volné místo** v té nakreslené šířce — v CSS ji nepiš jako `gap`.

:::check
Rámec „Karta" má auto layout *Vertical*, *Gap 12*, *Padding 24*. Napiš tři deklarace, které ho kromě `display: flex` přeloží do CSS. Každou na nový řádek.

### --expected--
flex-direction: column
gap: 12px
padding: 24px

### --accept--
flex-direction: column
gap: 0.75rem
padding: 1.5rem
flex-direction:column
gap:12px
padding:24px

### --why--
*Vertical* je sloupec, *Gap* je `gap` a *Padding* je `padding`. V projektu místo pixelů použiješ tokeny stupnice, třeba `gap: var(--space-3)`.
:::

## Hug, fill a fixed

Každé dítě auto layoutu má na šířku i na výšku jedno ze tří nastavení velikosti:

- *Hug contents* — prvek je velký podle obsahu. V CSS obvykle **nic nepíšeš**: tlačítko ve flex řádku je samo tak široké jako text.
- *Fill container* — prvek zabere zbylé místo. Na hlavní ose rodiče `flex: 1` (nebo `flex: 1 1 0`), na vedlejší ose výchozí `align-self: stretch`.
- *Fixed* — pevná hodnota, `width` nebo `height`. U textu a kontejnerů je to často **omyl návrhu** (nakreslené v jedné šířce obrazovky), u ikon a avatarů záměr.

K tomu *Min* a *Max* width, které se přeloží na `min-width` a `max-width`.

Obě varianty níž mají stejné HTML i CSS řádku. Liší se jen nastavením pole pro hledání.

:::compare
```html
<form class="search">
  <input class="search__input" type="search" placeholder="Hledat koncerty, divadla, výstavy" aria-label="Hledat">
  <button class="search__button">Hledat</button>
</form>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }
.search { display: flex; gap: 0.5rem; max-width: 30rem; padding: 0.5rem; border-radius: 12px; background: #eef1f5; }
.search__input { min-width: 0; padding: 0.625rem 0.75rem; border: 1px solid #94a3b8; border-radius: 8px; font: inherit; }
.search__button { padding: 0.625rem 1.25rem; border: 0; border-radius: 8px; background: #1f2937; color: #fff; font: inherit; font-weight: 600; }
```
--variant-- Pole: Hug
```css
.search__input { flex: none; }
```
--variant-- Pole: Fill container
```css
.search__input { flex: 1; }
```
:::

Vlevo je pole jen tak široké, jak mu určí prohlížeč, a vpravo zbyde prázdné místo. Vpravo pole zabere všechno kromě tlačítka, které zůstalo na *Hug*. Zkus ve variantě „Fill container" zvětšit `max-width` formuláře na `40rem` — roste jen pole.

:::check
V návrhu je řádek notifikace: ikona *Fixed 24 × 24*, text *Fill container*, čas *Hug contents*. Který prvek dostane v CSS `flex: 1`?

### --answer--
Ikona, protože má pevnou velikost.

#### --why--
*Fixed* se překládá na `width` a `height`, případně `flex: none`, aby se nezmenšovala. `flex: 1` by ji naopak natáhl.

### --correct--
Text notifikace.

#### --why--
*Fill container* na hlavní ose řádku je `flex: 1`: text zabere místo, které po ikoně a času zbude.

### --answer--
Čas, aby byl u pravého okraje.

#### --why--
*Hug contents* znamená velikost podle obsahu. U pravého okraje skončí sám, protože text před ním zabere zbylé místo.
:::

## Rámce bez auto layoutu a různé šířky

Ne všechno v návrhu je v auto layoutu. Volně umístěné prvky mají *constraints*: ke které hraně rámce jsou přišpendlené (*Left*, *Right*, *Left and right*, *Center*, *Scale*). Když návrhář rámec roztáhne, prvek se podle nich posune nebo natáhne. V CSS to odpovídá spíš `position` s `inset` než toku — a obvykle je lepší zjistit, jaké rozvržení tím návrhář myslel.

Návrh stránky mívá dvě až tři šířky: typicky 1440 (desktop), 768 (tablet) a 375 px (telefon). **Co se děje mezi nimi, v návrhu není.** Z rozdílů si odvodíš pravidla:

- Mění se jen šířka a počet sloupců? Mřížka s `auto-fit`, nebo jeden media dotaz.
- Mění se velikost nadpisu z 56 na 36 px? Plynulá velikost přes `clamp()`.
- Na mobilu úplně jiná navigace? Zlomový bod podle obsahu, kde se položky přestanou vejít.

Když z rozdílů pravidlo nevyčteš (karta na 768 px má dva sloupce, na 1440 tři, ale nevíš, kdy přejít), zeptáš se, nebo navrhneš řešení a necháš ho schválit.

:::check
Návrh má nadpis stránky 56 px na šířce 1440 a 32 px na šířce 375. Mezi nimi nic. Co je nejrozumnější překlad?

### --answer--
Media dotaz na 1440 px s 56 px a jinak 32 px.

#### --why--
Na 1439 px by nadpis skočil na 32 px — okna mezi 375 a 1440 jsou přitom nejčastější.

### --correct--
Plynulá velikost `clamp()`, která mezi oběma šířkami roste od 32 do 56 px.

#### --why--
Dvě nakreslené šířky jsou krajní body. Plynulé písmo zachová oba a mezi nimi dopočítá rozumné hodnoty.

### --answer--
Pevných 56 px, protože desktop je hlavní návrh.

#### --why--
Na telefonu by se nadpis rozpadl na řádky po dvou slovech. Mobilní návrh existuje právě proto, aby se to nestalo.
:::

## Komponenty, varianty a proměnné

Návrh je poskládaný z **komponent** (*components*): tlačítko, karta, štítek jsou nakreslené jednou a na obrazovkách jsou jejich kopie (*instances*). Komponenta má **varianty** (*variants*) s vlastnostmi jako `Size: sm | md | lg`, `State: default | hover | disabled` nebo `Tone: neutral | danger`. To se ti hodí dvakrát:

- **Názvy variant jsou tvoje API.** Vlastnost `Tone=danger` přeložíš na modifikátor `.button--danger` nebo atribut `[data-tone="danger"]`; když stejnou komponentu později postavíš v Reactu, bude to vlastnost `tone`.
- **Stav, který chybí mezi variantami, chybí i v kódu.** Když má tlačítko jen `default` a `hover`, zeptej se na `focus`, `disabled` a načítání.

Barvy, rozestupy a písmo návrhář ukládá do **proměnných** (*variables*) a **stylů textu** (*text styles*). Proměnné bývají ve dvou sbírkách: primitivní (`gray/600`) a sémantické (`text/muted`), a sémantické mívají **režimy** (*modes*) *Light* a *Dark*. Je to přesně systém primitivních a sémantických tokenů z lekce o barvách: `text/muted` přeložíš na `--color-text-muted` a režimy na dvě hodnoty v `light-dark()`.

> [!TIP]
> Když v panelu u barvy vidíš název proměnné, použij odpovídající token. Když vidíš jen `#6B7280` bez názvu, návrhář proměnnou zapomněl připojit — najdi token se stejnou hodnotou, nebo se zeptej, než do CSS napíšeš barvu natvrdo.

:::check
Komponenta štítku má ve Figmě variantu `Status: success | warning | error`. Napiš selektor atributu, kterým v CSS vybereš štítek ve stavu `warning`, když stav zapisuješ do atributu `data-status`.

### --expected--
[data-status="warning"]

### --accept--
[data-status=warning]
.tag[data-status="warning"]
.badge[data-status="warning"]

### --why--
Hodnota vlastnosti varianty se přenese do atributu a selektor atributu vybere právě tu variantu. Stejně dobře by posloužil modifikátor třídy `.tag--warning`.
:::

## Dev Mode: jak číst hodnoty

V režimu pro vývojáře (*Dev Mode*) klikneš na prvek a panel ukáže jeho vlastnosti, proměnné a CSS. Podržením klávesy Alt a najetím na jiný prvek změříš vzdálenost mezi nimi. V záložce s assety stáhneš ikony jako SVG. Hodnoty z panelu ale většinou potřebují překlad:

| panel | v CSS |
|---|---|
| písmo 18 px | `1.125rem` (px ÷ 16), nebo token stupnice |
| výška řádku 28 px u písma 18 px | `line-height: 1.5556` (28 ÷ 18), bez jednotky |
| výška řádku 150 % | `line-height: 1.5` |
| prostrkání −2 % | `letter-spacing: -0.02em` |
| *Drop shadow* X 0, Y 4, Blur 12, Spread 0, #000 10 % | `box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.1)` |
| rámeček *Inside* 1 px | `border: 1px solid` s `box-sizing: border-box` |
| zaoblení 8 | `border-radius: 0.5rem` |

Ukázka napodobuje panel Dev Mode u tlačítka. Vpravo je tlačítko, kterému chybí styly — zkus hodnoty z panelu přepsat do pravidla `.cta` a sleduj, jak se k návrhu blíží.

:::live
```html
<div class="handoff">
  <button class="cta">Koupit vstupenku</button>
  <aside class="panel" aria-label="Vlastnosti z návrhu">
    <p class="panel__title">Button / Primary / md</p>
    <dl>
      <dt>Auto layout</dt><dd>Horizontal · Gap 8 · Padding 12 24</dd>
      <dt>Velikost</dt><dd>Hug × Fixed 48</dd>
      <dt>Fill</dt><dd><code>color/accent</code></dd>
      <dt>Text</dt><dd>Semibold 16 / 24 · −1 %</dd>
      <dt>Barva textu</dt><dd><code>color/on-accent</code></dd>
      <dt>Radius</dt><dd>12</dd>
      <dt>Efekt</dt><dd>Drop shadow 0 2 6 0 · accent 30 %</dd>
    </dl>
  </aside>
</div>
```
```css
:root {
  --color-accent: oklch(0.5 0.15 280);
  --color-on-accent: oklch(1 0 0);
}
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: #1f2937; }
.handoff { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2rem; }
.panel { flex: 1 1 16rem; padding: 1rem; border-radius: 12px; background: #1e1e1e; color: #e5e5e5; font-size: 0.8125rem; }
.panel__title { margin: 0 0 0.75rem; font-weight: 600; }
.panel dl { display: grid; grid-template-columns: auto 1fr; gap: 0.375rem 1rem; margin: 0; }
.panel dt { color: #a3a3a3; }
.panel dd { margin: 0; }
.panel code { color: #c4b5fd; }

/* Tady přepiš hodnoty z panelu */
.cta {
  border: 0;
  font: inherit;
}
```
:::

Zkus to sám a pak porovnej: `display: inline-flex; align-items: center; gap: 0.5rem; height: 3rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; background: var(--color-accent); color: var(--color-on-accent); font-weight: 600; line-height: 1.5; letter-spacing: -0.01em; box-shadow: 0 2px 6px 0 oklch(from var(--color-accent) l c h / 0.3);`. Stín s barvou akcentu a průhledností je relativní barva z předchozí lekce.

:::check
Text v návrhu má písmo 20 px a výšku řádku 30 px. Napiš hodnotu `line-height` bez jednotky.

### --expected--
1.5

### --accept--
1,5
calc(30 / 20)

### --why--
30 ÷ 20 = 1.5. Číslo bez jednotky se násobí písmem každého prvku zvlášť, takže sedí i u potomků s jinou velikostí.
:::

## Na co se doptat návrháře

Návrh ukazuje ideální stav: krátké texty, správná data, široká obrazovka. Než začneš psát, projdi si seznam a co v návrhu chybí, napiš do jedné zprávy:

- **Stavy komponent:** hover, fokus z klávesnice, stisknuté, neaktivní, načítání.
- **Prázdný stav:** co uvidí uživatel, který ještě nemá žádné objednávky nebo oblíbené.
- **Chyby:** špatně vyplněné pole, výpadek spojení, prázdný výsledek hledání.
- **Dlouhý a chybějící obsah:** jméno na 40 znaků, nadpis na tři řádky, produkt bez fotky.
- **Šířky mezi nakreslenými obrazovkami** a co se stane s tabulkou nebo navigací na telefonu.
- **Tmavý motiv** a jestli prošel kontrastem.
- **Pohyb:** co se animuje, jak dlouho, a co při omezeném pohybu.

Tahle otázka ušetří víc času než cokoli jiného: odpověď „tohle nevím, rozhodni sám" je v pořádku, jen ji chceš mít dřív, než to napíšeš třikrát.

:::check
Návrh profilu uživatele ukazuje jméno „Eva Nová" a fotku. Co z toho seznamu je u téhle obrazovky nejdůležitější doptat, protože to v kódu nastane určitě?

### --answer--
Jak se má profil animovat při otevření.

#### --why--
Pohyb je dobré mít domluvený, ale uživatel bez animace profil použije. Chybějící fotka nebo dlouhé jméno ho rozbije.

### --correct--
Jak vypadá profil bez fotky a s dlouhým jménem.

#### --why--
Návrh ukazuje ideální data. Uživatelé bez fotky a s dlouhým jménem v reálných datech určitě budou, a ty musíš vědět, kam se text zalomí a co je místo fotky.

### --answer--
Jakou barvu má fotka.

#### --why--
Fotka je obsah od uživatele, její barvy neovlivníš. Návrh potřebuje vyřešit spíš to, co se stane, když fotka chybí.
:::

## Typické chyby a pasti

Nejdřív past s výškou řádku v procentech. Návrhář napsal u textu 150 % a vývojář to přepsal na `body`:

:::live predict
```html
<article class="article">
  <h1>Jak jsme postavili festival pro třicet tisíc lidí za tři měsíce</h1>
  <p>Na začátku jsme měli jen louku u Rokycan, tabulku s rozpočtem a odvahu.</p>
</article>
```
```css
body {
  margin: 1.5rem;
  font-family: system-ui, sans-serif;
  font-size: 16px;
  line-height: 150%;
  color: #1f2937;
}

.article { max-width: 30rem; }
.article h1 { margin: 0 0 1rem; font-size: 40px; }
.article p { margin: 0; }
```
--question-- Jak budou vypadat řádky velkého nadpisu?
--option-- Pohodlně, s výškou řádku 60 px (1,5 × 40 px).
--option*-- Natěsno až přes sebe, protože nadpis zdědí výšku řádku 24 px.
--option-- Stejně jako odstavec, protože se nadpis zmenší na 16 px.
--why-- `150%` se na `body` spočítá z písma `body` na 24 px a potomci dědí už **hotových 24 px**, ne poměr. Nadpis se 40 px písma má řádky vysoké 24 px a přetékají do sebe. Přepiš v `body` hodnotu na `1.5` a nadpis dostane 60 px, protože zdědí poměr.
--see-- css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty
:::

> [!PITFALL] Výška řádku v procentech nebo px na předku
> *Příznak:* velké nadpisy mají řádky přes sebe, i když v návrhu vypadaly dobře.
>
> *Oprava:* `line-height` piš číslem bez jednotky (`1.5`), procenta a px z panelu přepočítej.

> [!PITFALL] Pevná šířka z mobilního rámce
> *Příznak:* karta má `width: 343px`, protože tak byla široká v rámci 375 px, a na tabletu je úzký proužek uprostřed.
>
> *Oprava:* šířka kontejneru v návrhu bývá *Fill*, jen nakreslená v jedné šířce. Použij tok nebo `flex: 1` a nejvýš `max-width`.

> [!PITFALL] Mezera z *Gap: Auto* jako pevný `gap`
> *Příznak:* logo a menu jsou v návrhu od sebe 612 px, v CSS máš `gap: 612px` a na menší obrazovce hlavička přeteče.
>
> *Oprava:* rozestoupení je `justify-content: space-between` nebo automatický margin, ne číslo.

> [!PITFALL] Prostrkání v procentech zkopírované do CSS
> *Příznak:* nadpis s `letter-spacing: -2%` má v Chromu starším než verze 145 normální prostrkání, protože takový prohlížeč deklaraci s procenty zahodí.
>
> *Oprava:* procenta z Figmy jsou z velikosti písma, v CSS je piš v `em`, které funguje všude: −2 % = `-0.02em`.

:::explain
Vysvětli vlastními slovy, jak přeložíš do CSS rámec v auto layoutu *Horizontal, Gap 16, Padding 20*, ve kterém je ikona *Fixed 40*, text *Fill container* a tlačítko *Hug contents*.

## --model--
Rámec je flex kontejner v řádku s `gap: 16px` a `padding: 20px`, v projektu přes tokeny. Ikona má pevnou šířku i výšku a nesmí se zmenšit, takže `width`, `height` a `flex: none`. Text zabere zbylé místo, takže `flex: 1` a kvůli dlouhým slovům `min-width: 0`. Tlačítko je velké podle obsahu, takže mu nic nenastavuji.

## --checklist--
- Auto layout rámec je flex kontejner, směr určuje `flex-direction`.
- *Gap* a *Padding* se přeloží na `gap` a `padding`.
- *Fixed* je pevná velikost, u flex položky i se zákazem zmenšení.
- *Fill container* na hlavní ose je `flex: 1`.
- *Hug contents* nepotřebuje žádnou deklaraci.
:::

:::check
V panelu je stín *Drop shadow: X 0, Y 8, Blur 24, Spread −4*, barva černá 12 %. Napiš hodnotu pro `box-shadow`.

### --expected--
0 8px 24px -4px rgb(0 0 0 / 0.12)

### --accept--
0 8px 24px -4px rgba(0, 0, 0, 0.12)
0 8px 24px -4px rgb(0 0 0 / 12%)
0 8px 24px -4px oklch(0 0 0 / 0.12)
0px 8px 24px -4px rgb(0 0 0 / 0.12)

### --why--
Pořadí je stejné jako v panelu: posun X, posun Y, rozmazání, roztažení a barva. Průhlednost 12 % se zapíše za lomítko.
:::

## Kde to najdeš v MDN

- [Basic concepts of flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox) — to, co Figma kreslí jako auto layout, včetně `flex: 1` pro *Fill*.
- [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) — proč je hodnota bez jednotky lepší než procenta a px (oddíl o dědičnosti).
- [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) — pořadí hodnot, které odpovídá panelu *Drop shadow*.
- [Attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) — jak vybrat variantu komponenty podle `data-*` atributu.

# --questions--

## --question--

V návrhu je hlavička v auto layoutu *Horizontal*, *Gap: Auto*, obsahuje logo a navigaci. Napiš deklaraci, která kromě `display: flex` přeloží *Gap: Auto*.

### --expected--

justify-content: space-between

### --why--

*Auto* znamená, že se volné místo rozdělí mezi prvky. Pevné číslo, které návrh ukazuje, je jen volné místo v nakreslené šířce.

### --see--

css-design/cteni-navrhu#auto-layout-je-flexbox

## --question--

Návrhář dodal text se stylem *Body/Large: 18 px, výška řádku 28 px, prostrkání 0 %*. Napiš hodnotu `font-size` v `rem` (kořen stránky má 16 px).

### --expected--

1.125rem

### --accept--

1,125rem

### --why--

18 ÷ 16 = 1.125. V `rem` se písmo zvětší spolu s nastavením prohlížeče uživatele.

### --see--

css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty

## --question--

Karta produktu je v mobilním návrhu *Fixed 343 × 420*. Jak ji přeložíš?

### --answer--

`width: 343px; height: 420px`, protože tak je to nakreslené.

#### --why--

Pevná šířka platí jen v rámci 375 px a pevná výška uřízne delší název produktu. Návrh zachytil jednu šířku a jeden text.

### --correct--

Šířku podle rozvržení (tok nebo mřížka, případně `max-width`) a výšku podle obsahu; pevné rozměry si ověřím u návrháře.

#### --why--

Rozměr kontejneru v mobilním rámci je skoro vždy důsledek šířky obrazovky. Výška podle obsahu zvládne dlouhý text. Když návrhář pevný rozměr opravdu chce, řekne proč.

### --answer--

`width: 100%; height: 420px`, protože na mobilu je karta přes celou šířku.

#### --why--

Šířka je lepší, ale pevná výška pořád uřízne nebo nechá přetéct delší obsah.

### --see--

css-design/cteni-navrhu#typicke-chyby-a-pasti

## --question--

V panelu Dev Mode vidíš u barvy textu jen `#64748B` bez názvu proměnné a v tokenech projektu je `--color-text-muted` se stejnou hodnotou. Co napíšeš do CSS? Napiš celou hodnotu vlastnosti `color`.

### --expected--

var(--color-text-muted)

### --why--

Hodnota odpovídá sémantickému tokenu, takže použiješ ho. Když se změní motiv nebo paleta, text se změní s ním. Barva natvrdo by v tmavém motivu zůstala stejná.

### --see--

css-design/cteni-navrhu#komponenty-varianty-a-promenne
