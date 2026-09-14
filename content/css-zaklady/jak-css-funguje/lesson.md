# Jak CSS funguje

Barva tlačítka „Do košíku", velikost nadpisu v článku, zaoblené rohy karty s produktem — všechno, co na webu vypadá nějak, a ne jen „nějak je", zařizuje CSS. V téhle lekci zjistíš, jak prohlížeč styly čte a proč se ti někdy deklarace „neprojeví", aniž by kdokoli ohlásil chybu.

Než začneš, tipni si dvě odpovědi. Nehodnotí se, jen ti řeknou, na co se ve výkladu dívat.

:::check pretest
V CSS je `p { color: blue; font-size: 20; }`. Co se stane s odstavci?

### --answer--
Budou modré a mají písmo 20 px, prohlížeč si jednotku domyslí.

#### --why--
U vlastností jako `font-size` si prohlížeč jednotku nedomýšlí. Číslo bez jednotky je pro něj neplatná hodnota.

### --correct--
Budou modré, ale velikost písma zůstane výchozí.

#### --why--
`font-size: 20` je neplatná deklarace, a tu prohlížeč přeskočí. `color: blue` je v pořádku, takže platí.

### --answer--
Nic se nezmění, chyba v jedné deklaraci shodí celé pravidlo.

#### --why--
Neplatná deklarace se zahodí sama. Ostatní deklarace ve stejném pravidle platí dál.
:::

:::check pretest
Napíšeš stránku jen s HTML, bez jediného řádku CSS. Nadpis `<h1>` je přesto velký a tučný a odkazy modré. Odkud se ty styly vzaly?

### --answer--
Z HTML: značka `<h1>` sama znamená „velký tučný text".

#### --why--
HTML říká, **co** obsah je (nadpis první úrovně), ne jak vypadá. Vzhled přidává až CSS, i když ho nenapíšeš ty.

### --correct--
Prohlížeč má vlastní výchozí styly, které použije na každou stránku.

#### --why--
Každý prohlížeč má zabudovaný stylopis s pravidly jako „`h1` má velké tučné písmo". Tvoje CSS ho pak doplňuje a přepisuje.

### --answer--
Z operačního systému, podle jeho nastavení písma.

#### --why--
Systém může ovlivnit třeba výchozí písmo, ale velikost nadpisů a modré odkazy určuje prohlížeč.
:::

## Problém: HTML říká co, ne jak

Tady je kousek stránky s kontaktem na kavárnu. Jen HTML a CSS s jediným pravidlem:

:::live
```html
<article class="cafe">
  <h2>Kavárna Na Rohu</h2>
  <p>Otevřeno denně 8–20, Veveří 12, Brno.</p>
  <a href="#">Rezervovat stůl</a>
</article>
```
```css
.cafe {
  color: #3b2a20;
}
```
:::

Obsah je v pořádku, ale vypadá jako dokument z roku 1995. Zkus do pravidla `.cafe` přidat `background-color: #fdf3e7;` a pod `color` ještě `font-family: system-ui, sans-serif;`. Sleduj, jak se změní barva plochy a písmo — a že odkaz zůstal modrý, přestože pravidlo `.cafe` nastavuje barvu textu.

HTML popisuje strukturu: tohle je nadpis, tohle odstavec, tohle odkaz. CSS (*Cascading Style Sheets*) k tomu přidá vzhled. Soubor s pravidly se česky jmenuje **stylopis** (*stylesheet*).

> [!REMEMBER]
> **CSS je seznam pravidel „těmhle prvkům nastav tyhle vlastnosti" a prohlížeč z něj použije jen to, čemu rozumí.** Co nepochopí, tiše přeskočí.

:::check
V ukázce výše jsi změnil `color` na `.cafe` a odkaz zůstal modrý. Co z toho plyne?

### --answer--
Pravidlo `.cafe` se na odkaz vůbec nevztahuje, protože odkaz nemá třídu `cafe`.

#### --why--
Odkaz leží uvnitř `.cafe`, takže nadpis i odstavec barvu převzaly. Odkaz je jiný případ — a důvod je jinde než ve třídě.

### --correct--
Odkaz má vlastní barvu odjinud, a ta má u něj přednost před barvou zděděnou z `.cafe`.

#### --why--
Nadpis a odstavec barvu od `.cafe` zdědí. Odkaz ale dostává modrou přímo z výchozích stylů prohlížeče, a pravidlo, které míří přímo na prvek, vyhraje nad zděděnou hodnotou. Výchozí styly probereme o dvě části níž.

### --answer--
Barva odkazů se v CSS změnit nedá.

#### --why--
Dá, jen pravidlem, které vybere přímo odkaz, třeba `.cafe a { color: … }`.
:::

## Anatomie pravidla: selektor a deklarace

Každé [[CSS pravidlo]] (*rule*) má dvě části:

```css
.price {
  color: #b91c1c;
  font-weight: 700;
}
```

- [[selektor]] (*selector*) `.price` říká, **kterých prvků** se pravidlo týká,
- ve složených závorkách jsou [[deklarace]] (*declarations*): vždy `vlastnost: hodnota;`. Tady dvě — barva textu a tloušťka písma.

Tři selektory, které budeš potřebovat hned:

| selektor | vybere | příklad |
|---|---|---|
| typ (jméno značky) | všechny prvky toho typu | `p`, `h2`, `button` |
| třída (tečka a jméno) | prvky s danou třídou v atributu `class` | `.price` pro `<p class="price">` |
| skupina (čárka) | prvky, které vybere kterýkoli ze selektorů | `h1, h2` |

Třídu v HTML píšeš **bez tečky** (`class="price"`), v CSS **s tečkou** (`.price`). Jeden prvek může mít víc tříd oddělených mezerou: `class="price price--sale"`. Selektorů je mnohem víc, podrobně je probere lekce [Selektory](see:css-zaklady/selektory-zaklad#typ-trida-a-id).

:::live
```html
<h2 class="product">Zrnková káva Etiopie</h2>
<p class="price">349 Kč</p>
<p class="price price--sale">289 Kč</p>
<p>Doprava zdarma od 1 000 Kč.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.price {
  color: #b91c1c;
  font-weight: 700;
}
```
:::

Přidej pravidlo `.price--sale { background-color: #fef08a; }` a sleduj, který z odstavců dostane žluté pozadí. Pak změň selektor `.price` na `p` — co se stane s posledním odstavcem o dopravě?

`/* komentář */` v CSS prohlížeč ignoruje. Hodí se na nadpisy oddílů stylopisu nebo na dočasné vypnutí deklarace.

:::check
Napiš selektor, který vybere všechny prvky s třídou `badge`.

### --expected--
.badge

### --why--
Třída se v selektoru píše s tečkou na začátku. `badge` bez tečky by hledal prvek `<badge>`, který v HTML není.
:::

## Kam CSS napsat: `link`, `style` a atribut `style`

Styly můžeš dát na tři místa:

```html
<!-- 1. Samostatný soubor, připojený v <head> -->
<link rel="stylesheet" href="styles.css">

<!-- 2. Blok přímo ve stránce -->
<style>
  .price { color: #b91c1c; }
</style>

<!-- 3. Atribut na jednom prvku -->
<p style="color: #b91c1c">349 Kč</p>
```

**Samostatný soubor přes `<link>` je výchozí volba.** Jeden stylopis sdílí všechny stránky webu, prohlížeč si ho uloží do mezipaměti a HTML zůstane čisté. Blok `<style>` se hodí pro jednu stránku nebo e-mail. Atribut `style` platí jen pro jeden prvek, nejde v něm napsat `:hover` ani jiný stav a — to je hlavní past — vyhraje nad pravidly ze stylopisu. Než otevřeš náhled, tipni si:

:::live predict
```html
<p class="notice" style="color: #15803d">Objednávka odeslána.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.notice {
  color: #b91c1c;
  font-weight: 700;
}
```
--question-- Jakou barvu bude mít text oznámení?
--option-- Červenou, protože stylopis je napsaný později než HTML.
--option*-- Zelenou, protože atribut `style` má přednost před pravidlem ze stylopisu.
--option-- Černou, protože se dvě barvy navzájem vyruší.
--why-- Deklarace v atributu `style` se týká přímo jednoho prvku a vyhrává nad pravidly ze stylopisu, ať jsou napsaná kdekoli. Tučné písmo zůstane — v atributu `font-weight` není, takže platí to z `.notice`. Proto se atribut `style` hůř přepisuje a v běžném kódu se mu vyhýbáme. Podrobně, kdo nad kým vyhrává, probírá sekce o kaskádě.
:::

V Akademii píšeš styly do souboru `styles.css` a stránka ho připojuje přes `<link>`. Když `<link>` chybí nebo má špatnou cestu v `href`, stránka vypadá, jako by žádné CSS neměla.

:::check
Kolega píše do e-shopu styly jen do atributů `style` u jednotlivých prvků. Který důvod proti tomu je správný?

### --answer--
Atribut `style` nefunguje ve všech prohlížečích.

#### --why--
Atribut `style` umí každý prohlížeč. Problém je v údržbě a v tom, že se špatně přepisuje.

### --correct--
Stejný vzhled se musí opakovat u každého prvku a atribut vyhrává nad stylopisem, takže se špatně mění.

#### --why--
Sto tlačítek znamená sto kopií stejných deklarací. A když chceš vzhled změnit ze stylopisu, atribut u prvku tvoji změnu přebije.

### --answer--
V atributu `style` nejde zapsat barvu.

#### --why--
Barva i jakákoli jiná vlastnost do atributu zapsat jde. Chybí tam jen selektory, takže třeba `:hover`.
:::

## Výchozí styly prohlížeče

I stránka bez tvého CSS má styly: [[výchozí styly prohlížeče]] (*user agent stylesheet*). V Chromu třeba:

- `body` má okraj 8 px ze všech stran — proto obsah nezačíná přesně v rohu,
- `h1` má velikost dvojnásobku písma rodiče a je tučný, nadpisy i odstavce mají okraje nahoře a dole,
- seznam `ul` má vlevo vnitřní odsazení 40 px a odrážky,
- odkaz je modrý a podtržený,
- tlačítko má vlastní menší písmo a nepřebírá písmo stránky.

Tvoje pravidla výchozí styly doplňují a přepisují. Proto skoro každý projekt začíná pár řádky, které nejotravnější výchozí hodnoty srovnají:

:::live
```html
<h1>Menu dne</h1>
<ul class="menu">
  <li>Dýňová polévka</li>
  <li>Svíčková, knedlík</li>
</ul>
<button>Objednat</button>
```
```css
body {
  margin: var(--body-margin);
  font-family: system-ui, sans-serif;
}

.menu {
  padding-left: var(--list-padding);
}
```
```controls
--body-margin: toggle(8px, 0) = 8px | margin na body
--list-padding: select(40px, 1rem, 0) = 40px | padding-left seznamu
```
:::

Přepni `margin` na `0` a sleduj, jak se nadpis přilepí k okraji náhledu. U seznamu zkus `0` — odrážky vylezou mimo. Pak do CSS dopiš `button { font: inherit; }` a porovnej velikost a písmo tlačítka s položkami seznamu před změnou a po ní.

:::check
Ve stránce nemáš pro `<ul>` žádné pravidlo, a přesto je seznam odsazený zleva. Napiš deklaraci, kterou to odsazení zrušíš.

### --expected--
padding-left: 0

### --accept--
padding: 0
padding-inline-start: 0

### --why--
Odsazení seznamu je vnitřní odsazení z výchozích stylů prohlížeče (`40px`). Tvoje deklarace ho přepíše. `margin` by nepomohl, ten tam nulový je.
:::

## Neplatná deklarace se tiše zahodí

Prohlížeč CSS čte shovívavě. Když narazí na něco, čemu nerozumí, **nevyhodí chybu a nezastaví se**. Přeskočí jen tu jednu věc a čte dál. Nic se nevypíše ani do konzole.

Co všechno se přeskočí:

- neznámá vlastnost — `font-colour: red;` nebo `text-color: red;` (správně je `color`),
- neplatná hodnota — `font-size: 20;` bez jednotky, `color: #ff000;` s pěti číslicemi,
- když chybí středník, splynou dvě deklarace v jednu nesmyslnou a zahodí se **obě**.

Tahle shovívavost má dobrý důvod: starší prohlížeč přeskočí vlastnost, kterou ještě nezná, a zbytek stránky vykreslí. Pro tebe to ale znamená, že překlep se neprojeví chybou, jen tím, že **se nic nestane**.

:::live predict
```html
<p class="status">Na skladě</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.status {
  color: #15803d;
}

.status {
  color: #16a3400;
}
```
--question-- Druhé pravidlo má barvu se sedmi číslicemi. Jakou barvu bude mít text?
--option*-- Zelenou z prvního pravidla.
--option-- Černou, protože neplatná barva vrátí text na výchozí barvu.
--option-- Světle zelenou, prohlížeč přebytečnou číslici ignoruje.
--why-- Neplatná deklarace se zahodí, jako by v kódu vůbec nebyla. Neznamená „vrať výchozí", takže dál platí `color` z prvního pravidla. Kdyby první pravidlo nebylo, text by zůstal černý. Zkus v druhém pravidle smazat jednu nulu na konci a barva se změní.
:::

:::live predict
```html
<h2 class="title">Letní výprodej</h2>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.title {
  color: crimson
  font-size: 3rem;
  text-align: center;
}
```
--question-- Za `color: crimson` chybí středník. Jak nadpis dopadne?
--option-- Bude karmínový, velký 3rem a vycentrovaný — středník za poslední hodnotou není potřeba.
--option-- Nebude karmínový, ale bude velký a vycentrovaný.
--option*-- Nebude karmínový ani velký 3rem, jen vycentrovaný.
--why-- Bez středníku čte prohlížeč `color: crimson font-size: 3rem` jako jednu deklaraci s hodnotou `crimson font-size: 3rem`. Taková barva neexistuje, a tak zahodí celou tu dlouhou deklaraci — přijde o barvu i o velikost. `text-align` za dalším středníkem platí. Středník se smí vynechat jen za úplně poslední deklarací v pravidle.
:::

> [!TIP]
> V DevTools uvidíš zahozenou deklaraci přeškrtnutou a s ikonou varování. Jak je najít, ukazuje lekce [DevTools pro CSS](see:css-zaklady/devtools-pro-css#panel-styles-co-plati-a-co-je-preskrtnute).

:::check
V pravidle je `.card { background-color: #fff; border-radius: 12; color: #1f2937; }`. Které deklarace prohlížeč použije?

### --answer--
Žádnou, pravidlo s chybou se přeskočí celé.

#### --why--
Přeskočí se jen neplatná deklarace, ne celé pravidlo.

### --correct--
`background-color` a `color`; `border-radius: 12` se zahodí.

#### --why--
`12` bez jednotky není platná délka, takže rohy zůstanou ostré. Ostatní deklarace jsou platné a oddělené středníky.

### --answer--
Všechny, `border-radius` si doplní `px`.

#### --why--
Jednotku si prohlížeč nedoplní. Bez jednotky smí být jen nula a vlastnosti, které berou holé číslo (třeba `font-weight: 700`).
:::

## Typické chyby a pasti

> [!PITFALL] Tečka v atributu `class`
> *Příznak:* v HTML máš `<div class=".card">` a pravidlo `.card` se na prvek nevztahuje, prvek vypadá bez stylu.
>
> *Oprava:* tečka patří jen do selektoru v CSS. V HTML piš `class="card"`.

> [!PITFALL] Chybějící jednotka
> *Příznak:* `padding: 12;` nebo `font-size: 18;` nic nezmění.
>
> *Oprava:* délky potřebují jednotku (`12px`, `1.125rem`). Bez jednotky smí být jen `0`.

> [!PITFALL] Jeden neplatný selektor shodí celou skupinu
> *Příznak:* pravidlo `h1, h2:hovr { color: crimson; }` neobarví ani nadpis `h1`.
>
> *Oprava:* když prohlížeč nerozumí jednomu selektoru ve skupině, zahodí **celé** pravidlo, nejen jednu část. Oprav překlep (`:hover`), nebo napiš dvě samostatná pravidla.

:::live predict
```html
<h1>Pražírna Zrno</h1>
<h2>Naše kávy</h2>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

h1, h2:hovr {
  color: #9a3412;
}
```
--question-- Který nadpis bude oranžovohnědý?
--option-- Jen `h1`, druhá část selektoru se přeskočí.
--option-- Oba, `:hovr` prohlížeč pochopí jako `:hover`.
--option*-- Žádný.
--why-- Selektor `h2:hovr` je neplatný, a když je neplatná jedna část skupiny, zahodí se celé pravidlo. U deklarací se zahazuje jen ta jedna, u skupiny selektorů všechno. Oprav `:hovr` na `:hover` a `h1` se obarví hned, `h2` až při najetí myší.
:::

> [!PITFALL] Stylopis se nenačetl
> *Příznak:* stránka vypadá úplně bez stylů — písmo Times, modré odkazy, žádné barvy.
>
> *Oprava:* zkontroluj `<link rel="stylesheet" href="…">` v `<head>`: jestli tam vůbec je, jestli sedí cesta a jméno souboru (`styles.css` ≠ `style.css`) a jestli `rel` není překlep.

:::explain
Vysvětli, proč prohlížeč neplatnou deklaraci jen přeskočí, místo aby ohlásil chybu a stránku nevykreslil. Co to znamená pro tebe, když ladíš styly?

## --model--
CSS je navržené tak, aby stránka fungovala i ve starším prohlížeči, který novou vlastnost nebo hodnotu nezná. Prohlížeč proto neplatnou deklaraci zahodí a zbytek stylů použije. Pro vývojáře to znamená, že překlep nevyhodí žádnou hlášku, jen se deklarace neprojeví. Musím ji tedy hledat sám, nejlépe v DevTools, kde je přeškrtnutá.

## --checklist--
- Neplatná deklarace se zahodí a zbytek pravidla platí dál.
- Důvod je zpětná kompatibilita: starší prohlížeč přeskočí, co nezná, a stránku vykreslí.
- Překlep v CSS nevyhodí chybovou hlášku, jen se neprojeví.
- Zahozené deklarace se hledají v DevTools, kde jsou přeškrtnuté.
:::

## Kde to najdeš v MDN

- [What is CSS?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/What_is_CSS) — úvod do CSS s pravidlem, selektorem a deklarací a s výchozími styly prohlížeče.
- [Introduction to CSS syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Syntax/Introduction) — přesná stavba pravidla a deklarace a co se stane s chybou v zápisu.
- [`<link>`: The External Resource Link element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link) — všechny atributy prvku `link`, včetně `rel="stylesheet"`.

# --questions--

## --question--

Stránka má v `<head>` řádek `<link rel="stylesheet" href="style.css">`, ale soubor se stylem se jmenuje `styles.css`. Jak bude stránka vypadat?

### --answer--

Normálně, prohlížeč si podobný soubor najde sám.

#### --why--
Prohlížeč jde přesně na adresu z `href`. Soubor s jiným jménem pro něj neexistuje.

### --correct--

Jako bez CSS: jen výchozí styly prohlížeče.

#### --why--
Stylopis se nenačte, a tak na stránku působí jen výchozí styly — písmo Times, modré odkazy, okraje kolem `body`.

### --answer--

Stránka se nezobrazí vůbec a prohlížeč ukáže chybu.

#### --why--
Chybějící stylopis stránku nezastaví. HTML se vykreslí, jen bez tvých stylů.

### --see--

css-zaklady/jak-css-funguje#typicke-chyby-a-pasti

## --question--

V pravidle `.button { background: #0f766e; color: white; padding: 10; border-radius: 8px; }` je jedna deklarace neplatná. Napiš jméno její vlastnosti.

### --expected--

padding

### --why--

Hodnota `10` nemá jednotku a `padding` čeká délku. Tlačítko tak zůstane bez vnitřního odsazení, ostatní deklarace platí.

### --see--

css-zaklady/jak-css-funguje#neplatna-deklarace-se-tise-zahodi

## --question--

Tlačítko `<button class="cta">` má ve stylopisu `.cta { color: white; }` a v HTML atribut `style="color: black"`. Napiš barvu, kterou bude mít text tlačítka.

### --expected-- ignore-case

black

### --accept--

černou
černá

### --why--

Deklarace v atributu `style` vyhrává nad pravidlem ze stylopisu. Aby platila bílá, musel by atribut zmizet.

### --see--

css-zaklady/jak-css-funguje#kam-css-napsat-link-style-a-atribut-style

## --question--

Na stránce bez vlastního CSS začíná nadpis kousek od levého horního rohu okna, ne přímo v něm. Napiš selektor prvku, kterému to odsazení dávají výchozí styly prohlížeče.

### --expected--

body

### --why--

Výchozí styly dávají `body` okraj 8 px ze všech stran. Proto skoro každý projekt začíná pravidlem `body { margin: 0; }`.

### --see--

css-zaklady/jak-css-funguje#vychozi-styly-prohlizece
