# DevTools pro CSS

Kdo dělá weby, má vývojářské nástroje prohlížeče otevřené pořád: když se deklarace „neprojeví", když chce zjistit, jak má web konkurence udělaný stín, nebo když ladí barvu tlačítka dřív, než ji přepíše do kódu. V téhle lekci se naučíš číst panel se styly tak, aby ti na otázku „proč to nefunguje" odpověděl během pár vteřin.

:::check pretest
V DevTools změníš barvu tlačítka a pak stránku obnovíš (F5). Co se stane?

### --answer--
Nová barva zůstane, DevTools ji zapsaly do `styles.css`.

#### --why--
DevTools ve výchozím stavu upravují jen stránku, která je právě načtená v prohlížeči. Do souborů na disku nesahají.

### --correct--
Barva se vrátí na původní, změna v DevTools se nikam neuložila.

#### --why--
DevTools měnily jen živou stránku v paměti prohlížeče. Když najdeš hodnotu, která se ti líbí, musíš ji sám přepsat do kódu.

### --answer--
Stránka se nenačte, dokud DevTools nezavřeš.

#### --why--
Otevřené DevTools načítání stránky nebrání. Změny v nich jen po obnovení zmizí.
:::

:::check pretest
V panelu se styly je deklarace `color: red` přeškrtnutá. Co to znamená?

### --answer--
Vždycky překlep — deklaraci je potřeba opravit.

#### --why--
Překlep je jen jeden z důvodů. Přeškrtnutá deklarace může být úplně v pořádku, jen ji něco přebilo.

### --correct--
Na prvek neplatí: buď ji přebila jiná deklarace, nebo jí prohlížeč nerozuměl.

#### --why--
Přeškrtnutí znamená „tahle hodnota nevyhrála". Jestli jde o přebití, nebo o neplatný zápis, prozradí ikona vedle ní — k tomu se ve výkladu dostaneš.

### --answer--
Deklarace je vypnutá zaškrtávátkem a DevTools ji zapomněly znovu zapnout.

#### --why--
Vypnutou deklaraci DevTools taky přeškrtnou, ale jen tu, kterou jsi vypnul sám. Přeškrtnutí tvého kódu po načtení stránky má jiné příčiny.
:::

## Problém: „napsal jsem to, a nic"

Tady je karta online kurzu. Autor chtěl zelené tlačítko s větším vnitřním odsazením a oranžový štítek „Novinka". Tlačítko zelené je, ale odsazení se neprojevilo, a štítek je bez barvy.

:::live
```html
<article class="course">
  <p class="course__badge badge--new">Novinka</p>
  <h2 class="course__title">Fotografování mobilem</h2>
  <p class="course__meta">6 lekcí · 1 h 40 min</p>
  <button class="course__button">Přihlásit se</button>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2937; }

.course {
  max-width: 20rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
}

.course__button {
  padding: 12;
  border: 0;
  border-radius: 999px;
  background-color: #15803d;
  color: white;
}

.badge-new {
  display: inline-block;
  background-color: #ffedd5;
  color: #9a3412;
}
```
:::

Bez nástrojů bys teď četl kód řádek po řádku a zkoušel náhodné změny. V DevTools uvidíš u tlačítka deklaraci `padding: 12` přeškrtnutou s varovnou ikonou a u štítku zjistíš, že pravidlo s barvami mezi jeho styly **vůbec není** — selektor `.badge-new` neodpovídá třídě `badge--new`.

> [!REMEMBER]
> **DevTools ukazují, co prohlížeč z tvého CSS pro vybraný prvek skutečně použil, a u všeho ostatního proč ne.** Místo hádání se zeptáš tří otázek: míří pravidlo na prvek? Vyhrála deklarace? Jakou hodnotu prohlížeč spočítal?

:::check
Pravidlo pro štítek je v CSS napsané bez chyby, přesto se na štítek nepoužilo. Kterou z tří otázek z rámečku výše odhalíš příčinu?

### --answer--
Vyhrála deklarace?

#### --why--
Aby deklarace mohla vyhrát nebo prohrát, musí se pravidlo na prvek nejdřív vztahovat. Tady se k tomu vůbec nedostane.

### --correct--
Míří pravidlo na prvek?

#### --why--
Selektor `.badge-new` nevybral žádný prvek, protože štítek má třídu `badge--new`. Pravidlo proto u štítku v DevTools chybí úplně.

### --answer--
Jakou hodnotu prohlížeč spočítal?

#### --why--
Spočtená hodnota ti řekne, že barva je výchozí, ale ne proč. Příčina je o krok dřív.
:::

## Jak otevřít DevTools u náhledu

Nejrychlejší cesta je klepnout **pravým tlačítkem** přímo na prvek a zvolit **Prozkoumat** (*Inspect*). DevTools se otevřou s tím prvkem vybraným. Funguje to i v náhledu ukázky v téhle lekci — zkus to teď na tlačítku „Přihlásit se".

Další cesty:

- **F12** nebo **Ctrl+Shift+I** (v macOS **Cmd+Option+I**) otevře DevTools,
- **Ctrl+Shift+C** (v macOS **Cmd+Shift+C**) zapne výběr prvku: najedeš myší na stránku a klikneš na to, co chceš prozkoumat.

Vlevo uvidíš panel **Elements** se stromem HTML. Když najedeš myší na řádek stromu, prohlížeč prvek na stránce podbarví. Kliknutím ho vybereš a vpravo se ukážou jeho styly. Jestli máš DevTools v češtině, panely se jmenují jinak (Elements je *Prvky*, Styles *Styly*), rozložení je stejné. Názvy v téhle lekci jsou anglické, protože tak je najdeš v návodech.

> [!TIP]
> Ve workshopu a v labu má náhled nad sebou tlačítko **Nová karta**. Otevře stránku samostatně mimo Akademii, v plné velikosti — DevTools se tam čtou nejlíp.

Zkus si hned první úkol. V DevTools vyber tlačítko „Přihlásit se", vpravo přepni z panelu **Styles** na **Computed** a do políčka **Filter** napiš `font-size`.

:::check
Jakou velikost písma má tlačítko „Přihlásit se" podle panelu Computed?

### --expected--
13.3333px

### --accept--
13.33px
13.3px
13.333px
13,33 px
13.3333 px

### --why--
Tlačítko nemá v CSS žádnou velikost písma a nedědí ji ze stránky. Hodnotu mu dávají výchozí styly prohlížeče (v Chromu 13,3333 px). V panelu Styles to poznáš podle pravidla s popiskem „user agent stylesheet" dole. V jiném prohlížeči může být číslo trochu jiné.
:::

## Styles: která pravidla na prvek míří

Panel **Styles** ukazuje pro vybraný prvek **jen ta pravidla, jejichž selektor ho vybral**. Pravidlo, které v něm chybí, na prvek nemíří — ať je v něm napsané cokoli.

Pořadí odshora:

1. `element.style` — deklarace z atributu `style` přímo na prvku (a to, co do něj přidáš v DevTools),
2. pravidla z tvých stylopisů; výš jsou ta, která vyhrávají — u stejných selektorů to pozdější,
3. pravidla s popiskem **user agent stylesheet** — [[výchozí styly prohlížeče]],
4. oddíly **Inherited from …** — zděděné hodnoty od předků, třeba `Inherited from article.course`. Ukazují jen vlastnosti, které se dědí (barva, písmo…).

U každého pravidla je vpravo odkaz na místo, odkud pochází. Na skutečném webu je to jméno souboru a řádek, třeba `styles.css:12`. U náhledu z Akademie místo `styles.css` uvidíš odkaz do samotné stránky, protože Akademie vkládá tvůj `styles.css` přímo do ní jako blok `<style>`.

:::live predict
```html
<article class="order">
  <h2 class="order__title">Objednávka č. 2026-0412</h2>
  <p class="order__status">Odesláno</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.order {
  color: #1d4ed8;
}

.order__satus {
  color: #15803d;
  font-weight: 700;
}
```
--question-- Jak bude vypadat text „Odesláno"?
--option-- Zelený a tučný.
--option*-- Modrý a normální tloušťky.
--option-- Černý a normální tloušťky.
--why-- Selektor `.order__satus` má překlep, takže na odstavec nemíří. V DevTools u odstavce to pravidlo vůbec neuvidíš. Uvidíš jen oddíl **Inherited from article.order** s barvou `#1d4ed8` — odstavec ji zdědil od článku. Tučnost se nezdědila, protože ji nenastavuje nikdo. Oprav překlep a sleduj, jak se pravidlo v panelu Styles objeví.
:::

:::check
U odstavce vidíš v panelu Styles oddíl „Inherited from div.cart" s deklarací `color: #334155` a žádné vlastní pravidlo s barvou. Co z toho plyne?

### --answer--
Odstavec má ve stylopisu třídu `cart`.

#### --why--
Třída `cart` patří předkovi, ne odstavci. Oddíl „Inherited from" popisuje prvek výš ve stromu.

### --correct--
Barvu odstavci nikdo nenastavil přímo, zdědil ji od předka `div.cart`.

#### --why--
Oddíl „Inherited from" ukazuje dědičné vlastnosti předků. Když chceš odstavci dát jinou barvu, napiš pravidlo, které míří přímo na něj.

### --answer--
Pravidlo `div.cart` je neplatné, a proto je jen „zděděné".

#### --why--
„Inherited" neznamená chybu. Pravidlo je platné a platí pro předka, odstavec jen převzal jeho barvu.
:::

## Panel Styles: co platí a co je přeškrtnuté

Deklarace v panelu Styles vypadá jedním ze tří způsobů a každý znamená něco jiného:

| jak vypadá | co znamená | co s tím |
|---|---|---|
| přeškrtnutá | **přebitá**: jiná deklarace téže vlastnosti vyhrála | najdi výš v panelu, kdo vyhrál |
| přeškrtnutá s ikonou varování ⚠ | **neplatná**: prohlížeč jí nerozuměl a zahodil ji | najeď na ikonu, uvidíš *Invalid property value* nebo *Unknown property name* |
| šedá (bledá) s ikonou ⓘ | **neaktivní**: platná a vyhrála, ale na tenhle prvek nemá účinek | najeď na ikonu, DevTools napíše proč |

Neaktivní deklarace je třeba `width: 200px` na řádkovém prvku `<span>` — řádkový prvek šířku nebere. Chrome k tomu napíše, že `display: inline` brání `width` v účinku. K řádkovým a blokovým prvkům se dostaneš v sekci o box modelu.

:::live predict
```html
<p class="price">1 290 Kč</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.price {
  color: #b91c1c;
  font-size: 2rem;
}

.price {
  color: #0f766e;
  font-size: 2;
}
```
--question-- Jakou barvu a velikost bude mít cena?
--option-- Červená, velikost 2rem — první pravidlo platí celé.
--option*-- Tyrkysová, velikost 2rem.
--option-- Tyrkysová, výchozí velikost písma.
--why-- Obě barvy jsou platné a u stejného selektoru vyhrává pozdější, takže tyrkysová. `font-size: 2` bez jednotky je neplatná a zahodí se, a proto platí `2rem` z prvního pravidla. Otevři DevTools: v prvním pravidle je `color` přeškrtnutá bez ikony (přebitá), ve druhém je `font-size: 2` přeškrtnutá s ikonou varování (neplatná).
:::

:::check
V panelu Styles je deklarace `justify-content: center` bledá, s ikonou ⓘ, a ne přeškrtnutá. Co s ní je?

### --answer--
Je neplatná, prohlížeč hodnotu `center` nezná.

#### --why--
Neplatnou deklaraci DevTools přeškrtnou a dají k ní ikonu varování. Bledá deklarace s ⓘ je platná.

### --answer--
Přebila ji jiná deklarace `justify-content` níž v panelu.

#### --why--
Přebitá deklarace je přeškrtnutá a vítěz je nad ní. Tady nikdo nevyhrál místo ní.

### --correct--
Je platná a platí, jen na tenhle prvek nemá účinek.

#### --why--
Je neaktivní — `justify-content` třeba potřebuje, aby prvek byl flex nebo grid kontejner. Ikona ⓘ napíše přesný důvod.
:::

## Computed: spočtená hodnota a odkud přišla

Panel Styles ukazuje, co je **napsané**. Panel **Computed** ukazuje, s čím prohlížeč nakonec **počítá**: [[spočtená hodnota]] (*computed value*) každé vlastnosti prvku. Délky v `rem` nebo `em` jsou tam převedené na pixely, barvy na `rgb()` a zděděné hodnoty jsou doplněné.

Když v Computed rozbalíš vlastnost šipkou, uvidíš všechna pravidla, která ji chtěla nastavit, i s odkazem na zdroj. Vítěz je první a ostatní jsou přeškrtnuté. Na otázku „odkud se ta hodnota vzala" je to nejrychlejší odpověď.

Pár tipů:

- **Filter** nahoře zúží seznam, stačí napsat kus jména vlastnosti.
- Zaškrtávátko **Show all** ukáže i vlastnosti, které nikdo nenastavil a mají výchozí hodnotu.
- Barvu `#15803d` z kódu uvidíš v Computed jako `rgb(21, 128, 61)`. Není to chyba, jen jiný zápis téže barvy.

:::live
```html
<article class="recipe">
  <h2 class="recipe__title">Bramboráky jako od babičky</h2>
  <p class="recipe__time">Příprava 40 minut</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.recipe {
  color: #422006;
  font-size: 1.125rem;
}

.recipe__title {
  font-size: 1.75rem;
}

.recipe__time {
  color: #92400e;
}
```
:::

Prozkoumej v ukázce odstavec „Příprava 40 minut" a v Computed si najdi `color` a `font-size`. U `font-size` rozbal šipku: pravidlo `.recipe__time` velikost nenastavuje, a tak se hodnota vzala zděděním z `.recipe`.

:::check
Jakou hodnotu `font-size` ukáže panel Computed u odstavce „Příprava 40 minut"? Napiš ji tak, jak ji DevTools zobrazí.

### --expected--
18px

### --accept--
18 px

### --why--
Odstavec zdědí `font-size: 1.125rem` od `.recipe`. Computed ukazuje hodnotu převedenou na pixely: 1,125 × 16 px = 18 px.
:::

## Úpravy naživo: hodnoty, zaškrtávátka a stav `:hover`

V panelu Styles se dá všechno měnit a stránka se překreslí okamžitě:

- **Klikni na hodnotu** a napiš novou. Číselné hodnoty měníš **šipkami nahoru a dolů** po 1, se **Shiftem** po 10 a s **Altem** po 0,1. Tak se nejrychleji ladí rozestupy nebo velikost písma „od oka".
- **Zaškrtávátko** vedle deklarace (objeví se po najetí myší) ji dočasně vypne. Ideální test „dělá tahle deklarace vůbec něco?".
- **Klikni do prázdného místa v pravidle** a přidáš novou deklaraci.
- **Čtvereček s barvou** otevře výběr barvy a u barvy textu ukáže i kontrast s pozadím.
- Tlačítko **:hov** nahoře v panelu vynutí stav prvku — zaškrtneš `:hover` nebo `:focus-visible` a uvidíš jeho styly, aniž bys musel držet myš na prvku. Tlačítko **.cls** přidá nebo odebere prvku třídu.

:::live
```html
<a class="download" href="#">Stáhnout jízdní řád (PDF)</a>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.download {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  background-color: #1e40af;
  color: white;
  text-decoration: none;
}

.download:hover {
  background-color: #1e3a8a;
}

.download:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 3px;
}
```
:::

Vyber odkaz v DevTools, zapni přes **:hov** stav `:focus-visible` a sleduj oranžový obrys. Pak klikni na `0.75rem` v `padding` a šipkou nahoru ho zvyšuj — tlačítko roste. Obnov lekci tlačítkem „Obnovit" a změna je pryč.

:::check
Chceš upravit styl odkazu při najetí myší, ale jakmile myš přesuneš do DevTools, stav `:hover` zmizí. Co uděláš?

### --answer--
Přepíšu v panelu Styles selektor `.download:hover` na `.download`.

#### --why--
Tím by se hover styl použil pořád a přestal bys vidět rozdíl mezi stavy. DevTools umí stav vynutit bez přepisování selektorů.

### --correct--
V panelu Styles přes tlačítko :hov zaškrtnu `:hover`.

#### --why--
Vynucený stav drží prvek „jako by na něm byla myš", dokud ho neodškrtneš. Pravidlo `.download:hover` se zobrazí mezi styly a můžeš ho upravovat.

### --answer--
Nijak, hover styly se dají ladit jen v editoru.

#### --why--
DevTools na to mají přímo tlačítko. Hledej ho nahoře v panelu Styles.
:::

## Box model a odznaky `flex` a `grid`

Nahoře v panelu Computed (a úplně dole v Styles) je **diagram box modelu**: obdélníky do sebe pro vnější okraj (*margin*), rámeček (*border*), vnitřní odsazení (*padding*) a obsah, každý s čísly v pixelech. Když na část diagramu najedeš myší, prohlížeč ji na stránce podbarví. Co jednotlivé vrstvy znamenají a proč se okraje někdy slévají, rozebere sekce o box modelu.

Ve stromu Elements má prvek s `display: flex` nebo `display: grid` vedle sebe odznak **flex** nebo **grid**. Kliknutím na odznak prohlížeč vykreslí přes stránku čáry rozvržení. To se ti bude hodit v sekcích o flexboxu a gridu.

:::check
Tlačítko je podle tebe příliš vysoké a nevíš, jestli za to může `padding`, nebo výška řádku textu. Kde v DevTools nejrychleji uvidíš, kolik pixelů tvoří vnitřní odsazení?

### --answer--
Ve stromu Elements u odznaku `flex`.

#### --why--
Odznak `flex` říká jen, že prvek je flex kontejner. Rozměry vrstev ukazuje jiná část DevTools.

### --correct--
V diagramu box modelu nahoře v panelu Computed.

#### --why--
Diagram ukazuje margin, border, padding i obsah zvlášť a v pixelech. Najetím myší se vrstva na stránce podbarví.

### --answer--
V oddílu „user agent stylesheet".

#### --why--
Tam jsou jen výchozí styly prohlížeče. Vnitřní odsazení mohlo přijít odkudkoli a jeho výsledek v pixelech ukazuje diagram.
:::

## Typické chyby a pasti

> [!PITFALL] Úprava v DevTools se neuložila
> *Příznak:* hodinu ladíš barvy v DevTools, obnovíš stránku a všechno je jako předtím.
>
> *Oprava:* DevTools mění jen živou stránku. Každou hodnotu, kterou si chceš nechat, hned přepiš do `styles.css`. Pomůže klepnout pravým tlačítkem na pravidlo a zvolit *Copy rule* (Kopírovat pravidlo).

> [!PITFALL] Upravuješ zděděné nebo výchozí pravidlo
> *Příznak:* v oddílu „Inherited from main" změníš barvu a přebarví se celá stránka, nebo pravidlo „user agent stylesheet" nejde upravit vůbec.
>
> *Oprava:* zděděné pravidlo patří předkovi a změní všechno pod ním. Výchozí styly prohlížeče jsou jen ke čtení. Když chceš změnit jen vybraný prvek, klikni na `element.style` nebo přidej nové pravidlo tlačítkem **+**.

> [!PITFALL] Zapomenutý vynucený stav
> *Příznak:* tlačítko vypadá pořád „jako při najetí myší" a ty hledáš chybu v CSS.
>
> *Oprava:* podívej se na tlačítko **:hov** — zaškrtnutý stav zůstává, dokud ho neodškrtneš.

> [!PITFALL] Hodnota v Computed „nesedí" s kódem
> *Příznak:* v kódu máš `#0f766e` a `1.5rem`, v Computed je `rgb(15, 118, 110)` a `24px`, a myslíš si, že se pravidlo nepoužilo.
>
> *Oprava:* Computed ukazuje spočtenou hodnotu v jednotném zápisu. Porovnávej čísla, ne zápis — rozbal šipku a uvidíš, ze kterého pravidla hodnota přišla.

:::check
Kolega píše: „V panelu Styles mám u nadpisu `font-size: 3` přeškrtnuté s ikonou varování, ale nad tím už nic dalšího. Který prohlížeč to nepodporuje?" Co mu odpovíš? Napiš, co v deklaraci chybí.

### --expected-- ignore-case
jednotka

### --accept--
jednotku
chybí jednotka
chybí jednotka rem
jednotka rem
jednotka px
rem
px

### --why--
Ikona varování znamená neplatnou deklaraci, ne chybějící podporu. `font-size` potřebuje délku s jednotkou, třeba `3rem`. Bez ní se deklarace zahodí v každém prohlížeči.
:::

:::explain
Vysvětli vlastními slovy rozdíl mezi deklarací, která je v DevTools přeškrtnutá s ikonou varování, přeškrtnutá bez ikony a bledá s ikonou ⓘ. U každé řekni, co s ní uděláš.

## --model--
Přeškrtnutá s varováním je neplatná: prohlížeč jí nerozuměl a zahodil ji, takže hledám překlep ve vlastnosti nebo v hodnotě. Přeškrtnutá bez ikony je platná, ale přebila ji jiná deklarace téže vlastnosti, kterou najdu výš v panelu. Bledá s ⓘ je platná a vyhrála, jen na daný prvek nemá účinek, třeba šířka na řádkovém prvku — ikona napíše, co jí chybí.

## --checklist--
- Přeškrtnutá s ikonou varování je neplatná a prohlížeč ji zahodil.
- Přeškrtnutá bez ikony je přebitá jinou deklarací, vítěz je výš.
- Bledá s ikonou ⓘ je platná, ale na prvek nemá účinek.
- U neaktivní deklarace ikona napíše důvod.
:::

Teď už chybu v CSS nehledáš čtením kódu, ale otázkami na DevTools. V labu, který následuje, si to vyzkoušíš na cizí stránce se třemi schovanými chybami.

## Kde to najdeš v MDN

- [What are browser developer tools?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools) — jak DevTools otevřít v různých prohlížečích a co je v kterém panelu.
- [Debugging CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Debugging_CSS) — postup hledání chyby v CSS krok za krokem, s DevTools Firefoxu.
- [View and change CSS](https://developer.chrome.com/docs/devtools/css) (dokumentace Chromu, ne MDN) — návod na panel Styles se všemi tlačítky.
- [CSS features reference](https://developer.chrome.com/docs/devtools/css/reference) (dokumentace Chromu) — všechny zkratky a ikony panelu Styles včetně neplatných a neaktivních deklarací.

# --questions--

## --question--

V panelu Styles u tlačítka vidíš dvě pravidla `.btn`. V horním je `background-color: #0369a1`, ve spodním `background-color: #0284c7` přeškrtnuté bez ikony. Jakou barvu pozadí tlačítko má? Napiš hex zápis.

### --expected-- ignore-case

#0369a1

### --why--

Přeškrtnutá deklarace bez ikony je přebitá. Vítěz je v panelu výš, tady `#0369a1`. Ve stylopisu je pravidlo s vítěznou barvou napsané později.

### --see--

css-zaklady/devtools-pro-css#panel-styles-co-plati-a-co-je-preskrtnute

## --question--

Kolega tvrdí, že jeho pravidlo `.menu-link` „nefunguje". Vybereš odkaz v DevTools a v panelu Styles to pravidlo vůbec nevidíš. Co je nejpravděpodobnější příčina?

### --answer--

Pravidlo je neplatné a prohlížeč ho proto skryl.

#### --why--

Neplatné deklarace DevTools nezatajují, ukážou je přeškrtnuté s ikonou. Chybějící pravidlo znamená něco jiného.

### --correct--

Selektor na odkaz nemíří — třeba má odkaz jinou třídu nebo je v selektoru překlep.

#### --why--

Panel Styles ukazuje jen pravidla, jejichž selektor prvek vybral. Porovnej selektor s atributem `class` odkazu ve stromu Elements.

### --answer--

Pravidlo přebila deklarace z výchozích stylů prohlížeče.

#### --why--

Přebité pravidlo by v panelu bylo vidět, jen s přeškrtnutými deklaracemi.

### --see--

css-zaklady/devtools-pro-css#styles-ktera-pravidla-na-prvek-miri

## --question--

Nadpis má v CSS `font-size: 1.5rem` a stránka má výchozí velikost písma. Jakou hodnotu `font-size` uvidíš u nadpisu v panelu Computed?

### --expected--

24px

### --accept--

24 px

### --why--

Computed převádí délky na pixely: 1,5 × 16 px = 24 px.

### --see--

css-zaklady/devtools-pro-css#computed-spoctena-hodnota-a-odkud-prisla
