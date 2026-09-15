# Normální tok, block a inline

Tlačítko „Koupit" napsané jako odkaz, které ignoruje `height`, štítky kategorií, které přes sebe lezou, nebo tenký proužek pod fotkou v kartě produktu — to všechno jsou chvíle, kdy prohlížeč skládá boxy jinak, než čekáš. Pravidla, podle kterých to dělá, jsou krátká. Nejdřív dva odhady.

:::check pretest
Odkaz `<a class="button">Koupit</a>` uprostřed odstavce má v CSS `height: 48px` a `width: 200px`. Co se stane?

### --answer--
Odkaz bude 200 × 48 px, přesně podle CSS.

#### --why--
Tak by se choval `<div>` nebo `<button>`. Odkaz je ale jiný druh boxu a za chvíli uvidíš, proč na něm tyhle dvě vlastnosti nemají vliv.

### --correct--
Nic. Odkaz bude pořád jen tak velký jako jeho text.

#### --why--
`<a>` je ve výchozím stavu řádkový prvek. Řádkové boxy tečou v textu a jejich velikost určuje text, ne `width` a `height`.

### --answer--
Odkaz se roztáhne přes celou šířku odstavce a bude vysoký 48 px.

#### --why--
Přes celou šířku se roztahují blokové prvky. Odkaz je řádkový a zůstane v řádku textu.
:::

:::check pretest
Proč myslíš, že je pod fotkou `<img>` v podbarveném rámečku často tenký proužek pozadí, i když nemá žádný margin ani padding?

### --answer--
Prohlížeč přidává obrázkům výchozí `margin-bottom`.

#### --why--
Obrázek žádný výchozí margin nemá. Proužek vzniká jinde, podívej se do DevTools a margin tam neuvidíš.

### --correct--
Obrázek sedí v řádku textu na účaří a pod ním zůstane místo pro „ocásky" písmen jako g nebo y.

#### --why--
Přesně tak. Obrázek je ve výchozím stavu řádkový prvek, a řádek textu si pod účařím drží místo pro písmena, která pod něj sahají.

### --answer--
SVG a PNG soubory mají na spodním okraji průhledný pruh.

#### --why--
Proužek je stejný u jakéhokoli obrázku, i u takového, který je až do krajů plný barvy. Příčina je v CSS, ne v souboru.
:::

## Problém: tlačítko z odkazu, které neposlouchá

Na webu je spousta „tlačítek", která jsou ve skutečnosti odkazy. Tady je jedno. Autor mu dal výšku a šířku, a přesto se chová jinak, než chtěl:

:::live
```html
<article class="promo">
  <p>Letní výprodej končí v neděli. Stany, spacáky a batohy teď se slevou až 40 %.
    <a class="promo__button" href="#">Chci slevu</a>
    Doprava zdarma nad 1 500 Kč.</p>
  <p class="promo__note">Slevy se nesčítají s věrnostním programem.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

.promo {
  max-width: 26rem;
  padding: 1rem;
  border: 2px dashed #94a3b8;
}

.promo__button {
  width: 200px;
  height: 48px;
  padding: 12px 20px;
  background: #16a34a;
  color: #fff;
  text-decoration: none;
}

.promo__note { color: #64748b; }
```
:::

Tlačítko nemá 200 × 48 px, zelené pozadí leze přes řádek nad ním i pod ním a text vedle nečeká, až tlačítko skončí. Zkus do `.promo__button` dopsat `display: inline-block;` a sleduj, co se změní. Pak zkus `display: block;`.

Důvod je v tom, jak prohlížeč skládá stránku, když mu nenastavíš žádné rozvržení (flexbox, grid, pozicování). Tomu se říká [[normální tok]] (*normal flow*) a zná dva základní druhy boxů:

> [!REMEMBER]
> **Blokové boxy se skládají pod sebe a každý si vezme celou šířku rodiče; řádkové boxy tečou v řádcích textu jako slova a jejich velikost určuje text.** Na řádkový box `width` ani `height` nepůsobí.

:::check
V ukázce jsou dva odstavce `<p>` a v prvním z nich odkaz. Kolik z těchto tří prvků je v normálním toku blokových?

### --expected--
2

### --accept--
dva

### --why--
Oba odstavce jsou blokové, proto jsou pod sebou a každý je přes celou šířku `.promo`. Odkaz je řádkový a teče uvnitř prvního odstavce.
:::

## Blokové a řádkové boxy

Každý prvek dostane od prohlížeče výchozí `display`, a ten určuje, jakým boxem v normálním toku bude:

| | [[blokový box]] (*block box*) | [[řádkový box]] (*inline box*) |
|---|---|---|
| typické prvky | `div`, `p`, `h1`–`h6`, `ul`, `li`, `section`, `article`, `header`, `form` | `a`, `span`, `strong`, `em`, `code`, `img`, `label` |
| skládá se | pod předchozí box | za předchozí slovo, v řádku |
| šířka | celá šířka rodiče (`width: auto`) | podle obsahu |
| `width`, `height` | fungují | nepůsobí (výjimka: obrázky a formulářová pole) |
| svislý `padding`, `margin`, `border` | odsouvají sousedy | padding a rámeček se kreslí, margin se ignoruje; sousedy neodsunou |
| vodorovný `padding`, `margin`, `border` | fungují | fungují, odsunou slova vedle |

Obrázek, `input` nebo `button` jsou zvláštní případ: v řádku tečou jako slova, ale mají vlastní rozměry, takže jim šířka i výška nastavit jde. `button` a pole formuláře mají ve výchozím stavu `display: inline-block`, obrázek je řádkový prvek s vlastními rozměry.

Když chceš vidět, kde který box leží, dej si na chvíli do CSS obrys všem prvkům:

:::live
```html
<section class="demo">
  <h2>Nový e-shop <em>Kolo &amp; Stan</em></h2>
  <p>Otevíráme v <strong>pondělí 6. října</strong> v Brně na Cejlu. Mapu i otevírací dobu najdeš na <a href="#">stránce brněnské prodejny Kolo &amp; Stan</a>.</p>
  <p>Prvních 50 zákazníků dostane <span class="tag">láhev zdarma</span>.</p>
</section>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

.demo * {
  outline: 2px solid var(--color);
  outline-offset: -1px;
}

.tag { background: #fde68a; }
```
```controls
--color: select(tomato, transparent) = tomato | Obrys prvků
```
:::

Nadpis a odstavce mají obdélník přes celou šířku. `em`, `strong`, `a` a `span` jsou obtažené jen kolem svého textu. Zúž si okno náhledu přepínačem šířky na 375 a sleduj odkaz na stránku prodejny: když se zalomí, jeho box se rozpadne na dva kusy, na každém řádku jeden. Blok se takhle nikdy nerozdělí.

> [!TIP]
> Obrys (`outline`) je na hledání boxů lepší než `border`, protože nezabírá místo a nic neposune. V DevTools totéž uvidíš, když najedeš myší na prvek v panelu Elements.

:::check
Uvnitř odstavce je `<strong>` s textem, který se na úzkém displeji zalomí na dva řádky. Kolik obdélníků (boxů) na obrazovce vytvoří?

### --expected--
2

### --accept--
dva

### --why--
Řádkový box se rozdělí na tolik kusů, na kolik řádků se jeho text zalomí. Proto `padding` a pozadí zalomeného odkazu vypadají na konci prvního řádku a na začátku druhého „useknutě".
:::

## `display` mění druh boxu

Druh boxu nevychází z HTML značky, ale z hodnoty `display`. Značka jen určuje výchozí hodnotu, kterou si můžeš přepsat:

- `display: block` — blokový box: pod sebe, přes celou šířku, rozměry fungují.
- `display: inline` — řádkový box: v řádku, velikost podle textu.
- `display: inline-block` — navenek teče v řádku jako slovo, uvnitř je to blok: `width`, `height` i svislý padding fungují a odsouvají okolní řádky.
- `display: none` — box vůbec nevznikne. K tomu se vrátíme na konci lekce.

Hodnoty `flex` a `grid` taky mění, jak se box chová, a navíc rozvrhují jeho děti. Těm patří vlastní sekce CSS Flexbox a CSS Grid.

Obě varianty níž mají stejné HTML i CSS. Liší se jedinou deklarací na štítcích:

:::compare
```html
<p class="article-meta">Článek zařazený do
  <a class="chip" href="#">Cestování</a>
  <a class="chip" href="#">Jižní Čechy</a>
  <a class="chip" href="#">Na kole</a>
  <a class="chip" href="#">S dětmi</a>
  a čtený 2 300×.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

.article-meta { max-width: 16rem; }

.chip {
  height: 40px;
  padding: 8px 12px;
  margin-block: 4px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1e3a8a;
  text-decoration: none;
}
```
--variant-- inline (výchozí)
```css
.chip { display: inline; }
```
--variant-- inline-block
```css
.chip { display: inline-block; }
```
:::

S `inline` leží štítky přes sebe, `height` nic nedělá a svislý padding i margin se kreslí přes sousední řádky. S `inline-block` je každý štítek krabička vysoká 40 px, řádky se od sebe odsunou a štítek se nikdy nerozdělí na dva řádky.

:::check
Chceš, aby odkaz „Chci slevu" z první ukázky zůstal v řádku textu, ale měl výšku 48 px a řádky kolem se od něj odsunuly. Napiš deklaraci, kterou mu přidáš.

### --expected--
display: inline-block

### --why--
`inline-block` nechá prvek téct v řádku jako slovo, ale uvnitř se chová jako blok: výška, šířka i svislý padding fungují a řádek se kvůli němu zvětší. `display: block` by odkaz vytrhl z řádku a roztáhl přes celou šířku.
:::

## Proč řádkovému prvku nejde nastavit výška

Řádek textu má výšku, kterou určuje písmo a `line-height`. Řádkový box je jen kus textu v tom řádku. Kdyby na něj působilo `height: 48px`, musel by se kvůli jednomu slovu přestavět celý řádek, a to normální tok u řádkových boxů nedělá.

Stejně je to se svislým marginem: `margin-top` na `span` nebo `a` řádek neodsune. Svislý padding a rámeček se sice nakreslí (pozadí bude větší), ale do výšky řádku se nepočítají, proto lezou přes okolní text.

Než odkryješ náhled, tipni si:

:::live predict
```html
<p class="intro">Vítej zpátky, Jano.</p>
<p class="text">Máš <a class="badge" href="#">3 nové zprávy</a> a jednu objednávku na cestě.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

p { margin: 0; }

.intro {
  background: #f1f5f9;
}

.badge {
  margin-top: 32px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #fecaca;
}
```
--question-- Co udělá `margin-top: 32px` na odkazu `.badge`?
--option-- Odsune celý druhý odstavec o 32 px dolů od šedého odstavce.
--option-- Posune jen odkaz o 32 px níž, zbytek řádku zůstane na místě.
--option*-- Nic, řádek zůstane přesně tam, kde byl.
--why-- Svislý margin na řádkovém boxu se ignoruje, řádek i odkaz zůstanou na místě. Padding `4px` se nakreslí (růžové pozadí přesahuje nad a pod text), ale ani ten řádek neodsune. Zkus odkazu dopsat `display: inline-block;` a margin začne odsouvat celý řádek.
--see-- css-box-model/normalni-tok#proc-radkovemu-prvku-nejde-nastavit-vyska
:::

Vodorovně se řádkový box chová normálně: `margin-inline` a `padding-inline` odsunou sousední slova, protože v řádku se slova skládají právě vodorovně.

:::check
Řádkový prvek `<span class="price">` dostane `padding: 10px 20px`. Která část paddingu odsune okolní obsah?

### --answer--
Horní a dolní, protože text nad a pod se musí posunout.

#### --why--
Svislý padding se u řádkového boxu nakreslí, ale do výšky řádku se nepočítá. Okolní řádky zůstanou na místě a pozadí přes ně přeleze.

### --correct--
Jen levá a pravá: slova vedle `span` se odsunou o 20 px.

#### --why--
V řádku se boxy skládají vodorovně, takže vodorovný padding (i margin a rámeček) okolní slova odsune. Svislý padding se jen nakreslí.

### --answer--
Žádná, na řádkový prvek padding nepůsobí.

#### --why--
Padding na řádkovém prvku působí, jen svisle neodsouvá okolí. Pozadí bude větší ve všech směrech.
:::

## Mezera pod obrázkem

Obrázek je řádkový prvek, takže sedí v řádku textu. Jeho spodní hrana leží na [[účaří]] (*baseline*), na čáře, na které stojí písmena. Pod účařím si ale řádek drží místo pro písmena, která pod ni sahají (g, j, p, y). To místo zůstane prázdné a vznikne proužek:

:::live predict
```html
<figure class="photo">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='140'%3E%3Crect width='240' height='140' fill='%230ea5e9'/%3E%3Ccircle cx='190' cy='40' r='22' fill='%23fde047'/%3E%3Cpath d='M0 140 70 60l50 50 40-30 80 60Z' fill='%23065f46'/%3E%3C/svg%3E" width="240" height="140" alt="Ilustrace hor se sluncem">
</figure>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

.photo {
  width: 240px;
  margin: 0;
  background: #f97316;
}
```
--question-- Obrázek je vysoký 140 px a `figure` nemá padding. Jak vysoký bude oranžový `figure`?
--option-- Přesně 140 px, stejně jako obrázek.
--option*-- O pár pixelů víc než 140 px, pod obrázkem bude oranžový proužek.
--option-- 140 px plus výška jednoho řádku textu, asi 164 px.
--why-- Obrázek sedí na účaří a pod ním zůstane místo pro „ocásky" písmen, jen pár pixelů (kolik přesně, záleží na písmu). Celý řádek navíc to není, řádek už obrázek obsahuje. Zkus obrázku dopsat `display: block;` a proužek zmizí, protože blok v řádku textu nesedí. Druhá oprava je `vertical-align: top;`, pak obrázek v řádku zůstane, jen se nezarovnává na účaří.
--see-- css-box-model/normalni-tok#mezera-pod-obrazkem
:::

V praxi se na obrázky v kartách a galeriích dává `display: block`. Obrázek uprostřed textu (třeba ikona vedle slova) nech řádkový a zarovnej ho přes `vertical-align: middle`.

:::check
Avatar `<img>` je jediným obsahem odkazu `<a class="profile">` s šedým pozadím a `display: inline-block`. Pod avatarem je šedý proužek. Napiš deklaraci, kterou dáš **obrázku**, aby proužek zmizel a obrázek přitom zůstal v řádku.

### --expected--
vertical-align: top

### --accept--
vertical-align: bottom
vertical-align: middle

### --why--
Proužek dělá místo pod účařím. Když obrázek přestane sedět na účaří (`top`, `bottom`, u avataru vyššího než řádek i `middle`), řádek pod ním nic navíc nedrží. `display: block` by proužek odstranil taky, ale obrázek by už nebyl v řádku.
:::

## Jak prvek skrýt: `display: none` a `visibility: hidden`

Dva způsoby, jak prvek schovat, se liší v tom, co udělají s místem:

:::compare
```html
<ul class="steps">
  <li>1. Košík</li>
  <li class="step-hidden">2. Doprava</li>
  <li>3. Platba</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.steps {
  max-width: 14rem;
  padding: 0.5rem;
  border: 2px dashed #94a3b8;
  list-style: none;
}

.steps li {
  padding: 0.5rem 0.75rem;
  margin-block: 0.25rem;
  border-radius: 0.5rem;
  background: #e0e7ff;
}
```
--variant-- display: none
```css
.step-hidden { display: none; }
```
--variant-- visibility: hidden
```css
.step-hidden { visibility: hidden; }
```
:::

- `display: none` — box vůbec nevznikne. Nezabírá místo, sousedé se přisunou, nejde na něj kliknout ani ho dosáhnout klávesou Tab. Čtečka obrazovky ho nepřečte.
- `visibility: hidden` — box vznikne a **zabírá místo**, jen není vidět. Taky na něj nejde kliknout ani ho přečíst. Hodí se, když se nic nemá posunout (například popisek, který se ukáže až po uložení).

Atribut `hidden` v HTML (`<p hidden>`) dělá totéž co `display: none`, jen to přichází z výchozích stylů prohlížeče. To má háček, ke kterému se dostaneš v pastech.

:::check
Pod formulářem je hláška „Uloženo", která se ukáže až po uložení. Tlačítko pod ní nesmí při ukázání hlášky poskočit. Napiš deklaraci, kterou hlášku schováš.

### --expected--
visibility: hidden

### --why--
`visibility: hidden` nechá hlášce její místo, takže když ji později ukážeš (`visible`), nic se neposune. `display: none` by místo uvolnilo a tlačítko by při ukázání hlášky poskočilo dolů.
:::

## Typické chyby a pasti

> [!PITFALL] Rozměry na řádkovém prvku
> *Příznak:* `<a>` nebo `<span>` s `width`, `height` nebo `margin-top` vypadá úplně stejně jako bez nich. DevTools deklaraci ukáže jako neaktivní.
>
> *Oprava:* `display: inline-block`, když má prvek zůstat v řádku, nebo `display: block`, když má mít vlastní řádek přes celou šířku.

> [!PITFALL] Proužek pod obrázkem
> *Příznak:* pod fotkou v kartě nebo galerii je pár pixelů pozadí, přestože obrázek nemá margin ani padding.
>
> *Oprava:* `img { display: block; }` (proto ho má skoro každý reset stylů), nebo `vertical-align: top` pro obrázek, který má zůstat v řádku.

Další past překvapí hlavně toho, kdo skládá tlačítka vedle sebe. Tipni si:

:::live predict
```html
<nav class="tabs"><a class="tab" href="#">Popis</a> <a class="tab" href="#">Parametry</a> <a class="tab" href="#">Recenze</a></nav>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.tab {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #1e293b;
  color: #fff;
  text-decoration: none;
}
```
--question-- Tmavé záložky mají `display: inline-block` a žádný margin. Budou se dotýkat?
--option-- Ano, bez marginu leží těsně vedle sebe.
--option*-- Ne, mezi nimi bude mezera asi 4 px.
--option-- Ne, mezi nimi bude mezera 1rem z paddingu.
--why-- Mezera mezi `</a>` a `<a>` v HTML je obyčejná mezera v textu a `inline-block` prvky tečou v textu jako slova. Její šířka je šířka mezery v aktuálním písmu. Smaž v HTML mezery mezi odkazy a záložky se dotknou. Na řady tlačítek a záložek se proto používá flexbox s `gap`, v něm se mezery z HTML nepočítají.
--see-- css-box-model/normalni-tok#typicke-chyby-a-pasti
:::

> [!PITFALL] Mezery mezi `inline-block` prvky
> *Příznak:* tlačítka, záložky nebo dlaždice s `display: inline-block` mají mezi sebou pár pixelů navíc, i když mají `margin: 0`, a čtyři dlaždice po 25 % se nevejdou do řádku.
>
> *Oprava:* nemaž mezery z HTML (kód pak nejde číst). Řadu prvků vedle sebe rozvrhni flexboxem nebo gridem, ty mezery z HTML ignorují.

> [!PITFALL] Atribut `hidden` přebitý stylem
> *Příznak:* prvek má v HTML `hidden`, a přesto je vidět. V CSS má třída prvku `display: block` (nebo `flex`).
>
> *Oprava:* `hidden` funguje jen přes výchozí styl prohlížeče `[hidden] { display: none }`, a ten prohraje s kterýmkoli pravidlem autora, které nastaví `display`. Přidej do svých stylů `[hidden] { display: none !important; }`, nebo prvku `display` nenastavuj.

:::explain
Vysvětli vlastními slovy, proč `<a class="button">` ignoruje `height: 48px` a co s tím uděláš.

## --model--
Odkaz je ve výchozím stavu řádkový prvek, teče v řádku textu jako slovo. Výšku řádku určuje písmo a `line-height`, ne jednotlivé slovo, takže `height` ani svislý margin na řádkový box nepůsobí. Když mu dám `display: inline-block`, zůstane v řádku, ale uvnitř se chová jako blok a výška začne fungovat. `display: block` by ho postavil na vlastní řádek přes celou šířku.

## --checklist--
- `<a>` je ve výchozím stavu řádkový prvek.
- Výšku řádku určuje písmo a `line-height`, ne rozměry řádkového boxu.
- Na řádkový box nepůsobí `width`, `height` ani svislý margin.
- `display: inline-block` nechá prvek v řádku a rozměry začnou fungovat.
:::

:::check
Na stránce je `<p class="notice" hidden>` a v CSS `.notice { display: block; padding: 1rem; }`. Bude hláška vidět?

### --answer--
Ne, atribut `hidden` má vždycky přednost před CSS.

#### --why--
Myslíš si, že `hidden` je silnější než styly? Funguje jen přes výchozí styl prohlížeče a ten s pravidlem autora prohraje.

### --correct--
Ano, `display: block` z pravidla `.notice` přebije výchozí `display: none` pro `[hidden]`.

#### --why--
Výchozí styly prohlížeče jsou v kaskádě nejslabší. Autorské pravidlo, které nastaví `display`, vyhraje a hláška se ukáže.

### --answer--
Ne, protože padding na skrytém prvku způsobí chybu a pravidlo se zahodí.

#### --why--
Padding na skrytém prvku není chyba a pravidlo se nezahazuje. Rozhoduje, které nastavení `display` v kaskádě vyhraje.
:::

V následujícím labu tohle použiješ na příspěvku na sociální síti: štítky, tlačítka, fotka a skryté prvky.

## Kde to najdeš v MDN

- [Block and inline layout in normal flow](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Block_and_inline_layout) — jak se v normálním toku skládají bloky a řádky, anglicky a s obrázky.
- [display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display) — všechny hodnoty `display` včetně dvouhodnotového zápisu `display: inline flow-root`.
- [vertical-align](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/vertical-align) — zarovnání řádkových prvků k účaří, proč na bloky nepůsobí.
- [visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/visibility) — rozdíl proti `display: none` a hodnota `collapse`.

# --questions--

## --question--

Pět štítků `<a class="tag">` s `display: inline-block` je v HTML každý na vlastním řádku kódu. Kolik mezer z HTML vznikne mezi štítky v řádku?

### --expected--

4

### --accept--

čtyři

### --why--

Konec řádku v HTML se v textu chová jako mezera a `inline-block` prvky tečou v textu jako slova. Mezi pěti štítky jsou čtyři mezery, před prvním a za posledním se mezera na začátku a konci řádku nezobrazí.

### --see--

css-box-model/normalni-tok#typicke-chyby-a-pasti

## --question--

Karta produktu má `<img>` s `width="300"` a pod ním nadpis. Mezi obrázkem a nadpisem je o 5 px víc místa, než odpovídá marginu nadpisu. Obrázek má v CSS `margin: 0`. Co je nejpravděpodobnější příčina?

### --answer--

Nadpis má výchozí `margin-top`, který prohlížeč přičetl dvakrát.

#### --why--
Margin nadpisu je v tvém výpočtu už započítaný. Hledej, proč je obrázek sám „vyšší", než je jeho výška.

### --correct--

Obrázek je řádkový prvek a pod ním zůstává místo pro písmena pod účařím.

#### --why--

Obrázek sedí na účaří řádku a řádek pod ním drží místo pro „ocásky" písmen. `img { display: block }` proužek odstraní.

### --answer--

`width="300"` v HTML se přičítá k šířce z CSS a obrázek se zvětší i do výšky.

#### --why--

Atribut `width` jen udává rozměr obrázku, nic se nesčítá. Mezera je pod obrázkem, ne kolem něj.

### --see--

css-box-model/normalni-tok#mezera-pod-obrazkem

## --question--

Na stránce s návodem je prvek s tipem, který se ukáže až po kliknutí. Zatím nesmí zabírat žádné místo, aby pod návodem nebyla díra. Napiš deklaraci, kterou ho skryješ.

### --expected--

display: none

### --why--

`display: none` box vůbec nevytvoří, takže nezabírá místo. `visibility: hidden` by prvek schovala, ale místo by zůstalo prázdné. Stejně by fungoval atribut `hidden` v HTML, pokud mu CSS nepřebije `display`.

### --see--

css-box-model/normalni-tok#jak-prvek-skryt-display-none-a-visibility-hidden
