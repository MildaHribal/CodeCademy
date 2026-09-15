# Pět hodnot `position`

Štítek „Sleva" v rohu karty produktu, hlavička e-shopu, která při rolování zůstane nahoře, tlačítko chatu přišpendlené v rohu okna. Všechno to dělá jedna vlastnost: `position`. Než začneš číst, zkus odhadnout dvě odpovědi.

:::check pretest
Odstavec má `position: relative; top: 20px;`. Co se stane s odstavcem, který je v HTML hned pod ním?

### --answer--
Posune se o 20 px dolů spolu s ním.

#### --why--
Tak by to fungovalo s `margin-top`. Jestli `top` u `relative` hýbe i sousedy, se ukáže v první části.

### --correct--
Zůstane na svém místě, horní odstavec ho může překrýt.

#### --why--
`relative` posune jen vykreslení prvku. Místo, které prvek v toku zabírá, zůstává tam, kde bylo.

### --answer--
Posune se o 20 px nahoru, aby zaplnil mezeru.

#### --why--
Mezera po posunutém prvku nevzniká — prvek pořád zabírá své původní místo. Víc v první části.
:::

:::check pretest
Štítek má `position: absolute; top: 0; right: 0;` a leží v kartě, která žádnou `position` nemá. Kde se štítek objeví?

### --answer--
V pravém horním rohu karty.

#### --why--
To je nejčastější odhad — a nejčastější chyba. Vůči čemu se `absolute` měří, vysvětlí část o obsahujícím bloku.

### --correct--
V pravém horním rohu stránky, klidně daleko od karty.

#### --why--
Karta bez `position` pro štítek „neexistuje". Štítek hledá nejbližšího předka, který pozicovaný je, a když žádný nenajde, měří se od začátku stránky.

### --answer--
Nikde, `absolute` bez pozicovaného rodiče nefunguje.

#### --why--
Funguje vždycky, jen se měří od něčeho jiného, než čekáš.
:::

## Problém: štítek v rohu karty

V normálním toku stránky se prvky skládají pod sebe (bloky) nebo za sebe na řádek (text). Každý prvek si zabere místo a sousedy odstrčí. Pro text je to přesně to, co chceš, ale ne pro věci, které mají ležet **přes** jiný obsah: štítek přes roh fotky, nabídku přes stránku, lištu přes rolující obsah.

Tady je karta produktu se štítkem. Štítek je v HTML před nadpisem, a tak zabírá vlastní řádek a odtlačuje obsah dolů:

:::live
```html
<article class="product">
  <span class="badge">−20 %</span>
  <div class="photo"></div>
  <h2>Běžecké boty Kilimanjaro</h2>
  <p class="price">1 990 Kč</p>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: #f1f5f9; }

.product {
  position: relative;
  width: 16rem;
  padding: 0.75rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 10px 30px -12px rgb(15 23 42 / 0.35);
}

.badge {
  position: var(--position);
  top: var(--offset);
  right: var(--offset);
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: #e11d48;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

.photo {
  aspect-ratio: 4 / 3;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
}

h2 { margin: 0.75rem 0 0.25rem; font-size: 1.125rem; }
.price { margin: 0; font-weight: 700; color: #0f172a; }
```
```controls
--position: select(static, relative, absolute, fixed, sticky) = static | position štítku
--offset: range(0, 24, 4, px) = 12 | top a right
```
:::

Přepni `position` na `absolute` a sleduj dvě věci: štítek skočí do rohu karty **a** obsah pod ním se posune nahoru, protože štítek už v toku nezabírá místo. Pak zkus `relative` (štítek se posune, ale jeho původní místo zůstane prázdné) a `fixed` (štítek uteče do rohu celého náhledu).

> [!REMEMBER]
> **`position` rozhoduje o dvou věcech: jestli prvek zůstane v normálním toku a vůči čemu se měří jeho `top`, `right`, `bottom` a `left`.** Pět hodnot jsou jen různé odpovědi na tyhle dvě otázky.

| hodnota | zabírá místo v toku? | `top`/`left` se měří od… |
|---|---|---|
| `static` (výchozí) | ano | nic, `top` nemá vliv |
| `relative` | ano | vlastní původní polohy |
| `absolute` | ne | nejbližšího pozicovaného předka |
| `fixed` | ne | okna prohlížeče |
| `sticky` | ano | posuvného předka, jen když se roluje |

:::check
Prvek má jen `position: static; top: 50px;`. O kolik pixelů se posune dolů? Napiš číslo.

### --expected--
0

### --accept--
0 px
0px

### --why--
`static` je normální tok a vlastnosti `top`, `right`, `bottom`, `left` na něj nepůsobí vůbec. Prohlížeč deklaraci přijme, jen nic neudělá — v DevTools ji uvidíš jako neaktivní.
:::

## `relative`: posun bez ztráty místa

Prvek s `position: relative` se vykreslí posunutý o `top`, `right`, `bottom` a `left` **od své původní polohy**. V toku ale dál drží své původní místo, takže sousedi se nepohnou a posunutý prvek je může překrýt.

Pozor na směr: `top: 10px` znamená „odsaď se o 10 px od horního okraje původní polohy", tedy posun ==dolů==. `left: 10px` posouvá ==doprava==.

:::live predict
```html
<ol class="steps">
  <li>Vyber velikost</li>
  <li class="current">Zadej adresu</li>
  <li>Zaplať</li>
</ol>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }

.steps { display: grid; gap: 0.5rem; max-width: 18rem; padding: 0; list-style: none; }

.steps li {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #e2e8f0;
}

.steps .current {
  position: relative;
  top: 1.5rem;
  left: 1rem;
  background: #fbbf24;
}
```
--question-- Co se stane s položkou „Zaplať"?
--option-- Posune se o 1,5 rem dolů, aby ji aktuální krok nepřekryl.
--option*-- Zůstane na místě a aktuální krok ji částečně překryje.
--option-- Přesune se na místo, které aktuální krok uvolnil.
--why-- `relative` nemění rozvržení, jen místo, kde se prvek vykreslí. Mřížka dál počítá s původní polohou „Zadej adresu", takže „Zaplať" zůstane, kde byla, a posunutá položka ji překryje. Zkus `top` přepsat na `-1.5rem` — prvek pojede nahoru.
--see-- css-pozicovani/position#relative-posun-bez-ztraty-mista
:::

Samotný posun přes `relative` v praxi potřebuješ zřídka (na drobné doladění ikony o 1–2 px). Mnohem častěji píšeš `position: relative` **bez** `top` a `left` — prvek se nepohne, ale stane se opěrným bodem pro `absolute` potomky. K tomu je další část.

:::check
Ikona má `position: relative; left: -4px;`. Kterým směrem se posune?

### --answer--
Doprava o 4 px.

#### --why--
Kladné `left` odsazuje od levého okraje, tedy posouvá doprava. Záporné číslo směr otočí.

### --correct--
Doleva o 4 px.

#### --why--
`left: 4px` by ikonu odsunulo od levé hrany doprava, záporná hodnota ji posune opačně, doleva.

### --answer--
Nikam, záporné hodnoty `left` nepřijímá.

#### --why--
Posuny přes `top` a `left` smí být záporné, v praxi se to používá často.
:::

## `absolute` a obsahující blok

Prvek s `position: absolute` **vypadne z normálního toku**: sousedi se chovají, jako by tam nebyl, a on sám se změří a umístí podle svého [[obsahující blok|obsahujícího bloku]] (*containing block*).

Pro `absolute` je obsahujícím blokem **nejbližší předek, který je [[pozicovaný prvek|pozicovaný]]** — má `position` jinou než `static` (tedy `relative`, `absolute`, `fixed` nebo `sticky`). Měří se od jeho vnitřní hrany rámečku, takže padding předka do plochy patří. Když takový předek neexistuje, obsahujícím blokem je počáteční blok o velikosti okna na začátku stránky — štítek pak skončí v rohu stránky a roluje s ní.

:::compare
```html
<article class="product">
  <span class="badge">Novinka</span>
  <div class="photo"></div>
  <h2>Stan Hory 2</h2>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: #f1f5f9; }

.product { width: 13rem; padding: 0.75rem; border-radius: 1rem; background: white; }
.photo { height: 7rem; border-radius: 0.75rem; background: linear-gradient(135deg, #34d399, #0d9488); }
h2 { margin: 0.75rem 0 0; font-size: 1rem; }

.badge {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-size: 0.75rem;
}
```
--variant-- Karta bez position
```css
.product { margin-left: 10rem; }
```
--variant-- Karta s position: relative
```css
.product { margin-left: 10rem; position: relative; }
```
:::

Obě karty jsou odsazené o 10 rem doprava. Bez `position: relative` se štítek měří od rohu stránky a zůstane vlevo nahoře, daleko od karty. S ním se měří od rohu karty. **Vzor „`relative` na rodiči, `absolute` na potomkovi"** uvidíš na každém webu.

> [!REMEMBER]
> **`absolute` se měří od nejbližšího pozicovaného předka.** Chceš prvek v rohu karty? Karta dostane `position: relative`, prvek `position: absolute`.

:::check
HTML je `<section class="shop"><article class="card"><img class="card__photo"><span class="card__badge">Sleva</span></article></section>`. V CSS má `position: relative` jen `.shop` a `.card__badge` má `position: absolute; top: 0;`. Napiš třídu prvku, ke kterému se štítek přilepí nahoru.

### --expected--
.shop

### --accept--
shop

### --why--
Štítek hledá nejbližšího **pozicovaného** předka. Karta `.card` pozicovaná není, takže ji přeskočí a zastaví se až u `.shop`. Aby štítek seděl v kartě, musí `position: relative` dostat `.card`.
:::

## `inset`: roztažení a velikost

Vlastnosti `top`, `right`, `bottom` a `left` se souhrnně jmenují *inset* a mají zkratku `inset` se stejným pořadím jako margin: `inset: 0` je totéž co `top: 0; right: 0; bottom: 0; left: 0`. Existují i logické varianty `inset-inline` (vlevo a vpravo) a `inset-block` (nahoře a dole).

Absolutně pozicovaný prvek bez nastavené šířky je **jen tak široký jako jeho obsah**, i když je to `<div>`. Když ale nastavíš protilehlé strany zároveň, třeba `left` i `right`, prvek se mezi ně roztáhne. `inset: 0` ho tak roztáhne přes celý obsahující blok — přesně to potřebuje tmavý přechod přes fotku nebo průhledná vrstva přes kartu.

:::live
```html
<figure class="hero">
  <figcaption class="hero__caption">Sněžka při východu slunce</figcaption>
</figure>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }

.hero {
  position: relative;
  width: 20rem;
  height: 12rem;
  margin: 0;
  border-radius: 1rem;
  background: linear-gradient(160deg, #fb923c, #9333ea 60%, #1e1b4b);
  overflow: hidden;
}

.hero__caption {
  position: absolute;
  inset-inline: var(--sides);
  bottom: 0;
  padding: 2.5rem 1rem 0.75rem;
  background: linear-gradient(transparent, rgb(0 0 0 / 0.7));
  color: white;
  font-weight: 600;
}
```
```controls
--sides: select(auto, 0, 1rem) = 0 | inset-inline
```
:::

Přepni `inset-inline` na `auto`: popisek ztratí levou i pravou hranu, zúží se na šířku textu a přechod zmizí z většiny fotky. Na `0` se roztáhne od kraje ke kraji.

:::check
Karta má `position: relative`, rozměry obsahu 300 × 200 px, `padding: 20px` a žádný rámeček. Vrstva uvnitř má `position: absolute; inset: 0;`. Jak široká bude vrstva v px?

### --expected--
340

### --accept--
340 px
340px

### --why--
Obsahující blok pro `absolute` sahá po vnitřní hranu rámečku, padding do něj patří: 300 + 2 × 20 = 340 px. Vrstva přes `inset: 0` proto překryje i padding karty.
:::

## `fixed`: přišpendlené k oknu

`position: fixed` funguje jako `absolute`, jen obsahujícím blokem je **okno prohlížeče** (*viewport*). Prvek při rolování zůstává na stejném místě obrazovky: tlačítko chatu, lišta s cookies, tlačítko „Nahoru".

Háček, na který narazíš dřív nebo později: když má některý předek `transform`, `translate`, `filter`, `backdrop-filter`, `perspective`, `contain: paint` nebo `will-change: transform`, stane se obsahujícím blokem i pro `fixed` potomky. Prvek pak přestane být přišpendlený k oknu a jezdí s tímhle předkem.

:::live predict
```html
<main class="page">
  <p>Obsah stránky…</p>
  <a class="chat" href="#chat">Napiš nám</a>
</main>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.page {
  margin: 4rem 2rem;
  padding: 1rem;
  height: 10rem;
  border: 2px dashed #94a3b8;
  transform: translateY(0);
}

.chat {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: #16a34a;
  color: white;
  text-decoration: none;
}
```
--question-- Kde bude tlačítko „Napiš nám"?
--option-- V pravém horním rohu okna náhledu.
--option*-- V pravém horním rohu čárkovaného rámečku `.page`.
--option-- Vlevo nahoře, protože `fixed` s `transform` nefunguje.
--why-- `transform: translateY(0)` prvek vizuálně neposune, ale udělá z `.page` obsahující blok pro všechny pozicované potomky, i ty s `fixed`. Tlačítko se proto měří od rámečku. Smaž řádek s `transform` a tlačítko uteče do rohu okna. Tahle past se často objeví po přidání animace na obal stránky.
--see-- css-pozicovani/position#fixed-prispendlene-k-oknu
:::

:::check
Obal stránky `.app` má `filter: saturate(1.1)`. V něm je lišta s `position: fixed; bottom: 0;`. Vůči čemu se lišta umístí?

### --answer--
Vůči oknu prohlížeče, na to je `fixed`.

#### --why--
Myslíš si, že `fixed` se měří vždycky od okna? Jen dokud žádný předek nemá vlastnost ze seznamu výše. `filter` mezi ně patří.

### --correct--
Vůči obalu `.app`, protože `filter` z něj udělá obsahující blok.

#### --why--
`filter` (stejně jako `transform` nebo `backdrop-filter`) založí obsahující blok i pro `fixed` potomky. Lišta bude u spodní hrany `.app`, ne okna.

### --answer--
Vůči nejbližšímu předkovi s `position: relative`.

#### --why--
Tak se chová `absolute`. `fixed` pozicované předky ignoruje, zastaví ho jen předek s `transform`, `filter` a podobnými vlastnostmi.
:::

## `sticky`: lepí se, dokud může

`position: sticky` je kříženec: prvek je v normálním toku (zabírá místo jako `static`), dokud se neroluje. Jakmile by při rolování přejel hranici, kterou mu dáš přes `top` (nebo `bottom`), přilepí se k ní. Hlavička s `position: sticky; top: 0;` jede nejdřív se stránkou a pak zůstane na horní hraně okna.

Aby se prvek lepil, musí platit tři věci:

1. Má nastavený **aspoň jeden** `top`, `bottom`, `left` nebo `right`. Bez něj se nelepí nikam.
2. Lepí se k nejbližšímu [[posuvný kontejner|posuvnému kontejneru]] (*scroll container*) — předkovi, jehož `overflow` je `hidden`, `auto` nebo `scroll`. Když takový předek neexistuje, lepí se k oknu.
3. **Nevyjede ze svého rodiče.** Když rodič odroluje pryč, vezme přilepený prvek s sebou.

Tady je posuvný seznam kontaktů. Posuvným kontejnerem je `.contacts` (`overflow: auto`), takže písmena se lepí k jeho horní hraně:

:::live
```html
<div class="contacts">
  <section>
    <h3>A</h3>
    <p>Adam Bartoš</p><p>Alena Černá</p><p>Anna Dvořáková</p><p>Antonín Hruška</p>
  </section>
  <section>
    <h3>B</h3>
    <p>Barbora Kalinová</p><p>Bohumil Novák</p><p>Božena Pokorná</p>
  </section>
  <section>
    <h3>Č</h3>
    <p>Čeněk Růžička</p><p>Čestmír Svoboda</p><p>Čeňka Veselá</p>
  </section>
</div>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }

.contacts {
  width: 16rem;
  height: 13rem;
  overflow: auto;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
}

.contacts h3 {
  position: sticky;
  top: var(--top);
  margin: 0;
  padding: 0.25rem 1rem;
  background: #e0e7ff;
  color: #3730a3;
}

.contacts p { margin: 0; padding: 0.625rem 1rem; border-bottom: 1px solid #f1f5f9; }
```
```controls
--top: select(0, auto) = 0 | top
```
:::

Roluj seznamem: písmeno „A" se přilepí nahoru, a když přijede sekce „B", odtlačí ho, protože „A" nesmí opustit svou `<section>`. Přepni `top` na `auto` a lepení zmizí — podmínka číslo jedna.

:::check
Hlavička má `position: sticky; top: 0;` a leží v obalu `.page`, který má `overflow-x: hidden` (kvůli vodorovnému posuvníku). Obal je vysoký podle obsahu a roluje celé okno. Hlavička se nelepí. Proč?

### --answer--
`overflow-x` ovlivňuje jen vodorovný směr, lepení nahoru to rozbít nemůže.

#### --why--
Tak to vypadá podle názvu. Jenže jakmile nastavíš `overflow` v jednom směru na `hidden`, prohlížeč z druhého směru udělá `auto` a prvek je posuvný kontejner v obou směrech.

### --correct--
Obal se tím stal posuvným kontejnerem a hlavička se lepí k němu, jenže roluje okno, ne obal.

#### --why--
Sticky prvek se lepí k nejbližšímu předkovi s `overflow` jiným než `visible` (nebo `clip`). Tady je to `.page`, který sám nikdy neroluje — roluje celé okno. Pomůže `overflow-x: clip`, které ořízne, ale posuvný kontejner nevytvoří.

### --answer--
Chybí `z-index`, takže hlavička zajela pod obsah.

#### --why--
`z-index` řeší, co je navrchu, ne jestli se prvek lepí. Hlavička by se lepila a jen by ji něco překrylo.
:::

## Překrývání: kdo je navrchu

Jakmile prvky vyjedou z toku, začnou se překrývat. Základní pravidlo je jednoduché:

- pozicovaný prvek se vykreslí **nad** prvky v normálním toku,
- ze dvou pozicovaných prvků je navrchu ten, který je v HTML **později**,
- `z-index` pořadí změní: vyšší číslo je navrchu. Působí jen na pozicované prvky (a na položky flexboxu a gridu).

:::live predict
```html
<header class="topbar">Obchod Kilimanjaro</header>
<main>
  <article class="product"><span class="badge">−20 %</span>Běžecké boty</article>
</main>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.topbar {
  position: sticky;
  top: 0;
  padding: 1rem;
  background: #0f172a;
  color: white;
}

main { padding: 1rem; }

.product {
  position: relative;
  top: -2.5rem;
  height: 8rem;
  padding: 1rem;
  border-radius: 1rem;
  background: #fde68a;
}

.badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0 0.5rem;
  background: #e11d48;
  color: white;
}
```
--question-- Karta je posunutá nahoru přes tmavou hlavičku. Co bude navrchu v místě, kde se překrývají?
--option-- Hlavička, protože je `sticky`.
--option*-- Karta, protože je taky pozicovaná a v HTML je později.
--option-- Hlavička, protože pozicované prvky jsou vždycky pod prvky v toku.
--why-- Hlavička (`sticky`) i karta (`relative`) jsou pozicované a nemají `z-index`, rozhoduje tedy pořadí v HTML. Karta je později, takže je navrchu. Stejně to dopadne, když stránkou roluješ pod přilepenou hlavičkou. Oprava je `z-index: 1` na hlavičce — zkus ho dopsat.
--see-- css-pozicovani/position#prekryvani-kdo-je-navrchu
:::

Proč `z-index: 9999` někdy nepomůže vůbec, vysvětlí další lekce o stacking contextu.

:::check
Dva pozicované prvky se překrývají. První v HTML má `z-index: 2`, druhý žádný `z-index`. Který je navrchu? Napiš „první", nebo „druhý".

### --expected-- ignore-case
první

### --accept--
1
prvni

### --why--
`z-index` bez hodnoty (`auto`) se chová jako nula. Kladné číslo prvek vytáhne nad prvky s nulou, a to bez ohledu na pořadí v HTML.
:::

## Typické chyby a pasti

> [!PITFALL] Štítek uletěl do rohu stránky
> *Příznak:* prvek s `position: absolute; top: 0; right: 0;` není v rohu karty, ale v rohu stránky, a při rolování jede se stránkou.
>
> *Oprava:* rodič, od kterého se má měřit, dostane `position: relative`.

> [!PITFALL] Rodič se po `absolute` scvrkl
> *Příznak:* obrázek nebo panel přepneš na `absolute` a rámeček rodiče najednou nemá výšku, obsah pod ním najede nahoru.
>
> *Oprava:* `absolute` prvek v toku nezabírá místo, takže ho rodič do výšky nezapočítá. Rodiči dej výšku nebo `aspect-ratio`, nebo nech v toku jiný prvek, který výšku drží.

> [!PITFALL] Sticky se nelepí
> *Příznak:* `position: sticky` je v DevTools aktivní, ale prvek při rolování odjede.
>
> *Oprava:* projdi tři podmínky. Chybí `top`? Má některý předek `overflow: hidden`, `auto` nebo `scroll` (i jen `overflow-x`)? Není rodič stejně vysoký jako sticky prvek — typicky položka gridu nebo flexboxu roztažená přes celou výšku řádku? Ořezání bez posuvného kontejneru udělá `overflow: clip`, roztažení vypne `align-self: start`.

:::live predict
```html
<div class="layout">
  <article class="article">Dlouhý článek…</article>
  <aside class="toc">Obsah článku</aside>
</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.layout {
  display: grid;
  grid-template-columns: 1fr 10rem;
  gap: 1rem;
  padding: 1rem;
}

.article { height: 150vh; padding: 1rem; background: #f1f5f9; }

.toc {
  position: sticky;
  top: 1rem;
  padding: 1rem;
  background: #c7d2fe;
}
```
--question-- Obsah článku má `position: sticky; top: 1rem`. Co udělá, když stránku odroluješ dolů?
--option-- Přilepí se 1 rem pod horní hranu okna.
--option*-- Odjede nahoru spolu s článkem, protože je vysoký jako celý řádek mřížky.
--option-- Zmizí, protože sticky v gridu nefunguje.
--why-- Položky gridu se ve výchozím stavu roztahují na výšku řádku (`align-self: stretch`). Panel je proto stejně vysoký jako článek a v rodiči pro něj nezbylo místo, kam by se mohl posunout. Přidej do `.toc` deklaraci `align-self: start` — panel bude vysoký jen podle obsahu a začne se lepit.
--see-- css-pozicovani/position#sticky-lepi-se-dokud-muze
:::

> [!PITFALL] Nadpis zajel pod přilepenou hlavičku
> *Příznak:* klikneš v obsahu článku na odkaz `#kde-spat` a nadpis sekce skončí schovaný pod přilepenou hlavičkou.
>
> *Oprava:* prohlížeč roluje tak, aby byl cíl odkazu přesně u horní hrany okna, a o hlavičce neví. Nadpisům dej `scroll-margin-top` o něco větší, než je výška hlavičky (třeba `h2 { scroll-margin-top: 5rem; }`), nebo celé stránce `scroll-padding-top` na prvku `html`.

> [!PITFALL] `fixed` jezdí se stránkou
> *Příznak:* tlačítko s `position: fixed` není přišpendlené k oknu, ale roluje s nějakým obalem.
>
> *Oprava:* hledej předka s `transform`, `translate`, `filter`, `backdrop-filter`, `perspective`, `contain: paint` nebo `will-change: transform`. Odstraň vlastnost z předka, nebo přesuň přišpendlený prvek v HTML mimo něj.

:::check
Obal `.hero` nemá výšku ani padding a obsahuje jen obrázek s `position: absolute; inset: 0;`. Jak vysoký bude obal v px?

### --expected--
0

### --accept--
0 px
0px

### --why--
Absolutně pozicovaný obrázek v toku nezabírá místo, takže obal nemá podle čeho počítat výšku. Obrázek se roztáhne přes obal vysoký 0 px a nebude vidět. Obal potřebuje vlastní výšku, třeba `aspect-ratio: 16 / 9`.
:::

:::explain
Vysvětli vlastními slovy, proč štítek s `position: absolute; top: 0; right: 0;` skončil v rohu stránky, a ne v rohu karty, a co to opraví.

## --model--
Absolutně pozicovaný prvek se měří od svého obsahujícího bloku, a tím je nejbližší předek s `position` jinou než `static`. Karta žádnou `position` neměla, takže ji štítek přeskočil, a protože pozicovaný nebyl ani žádný další předek, měřil se od začátku stránky. Když kartě dám `position: relative`, stane se obsahujícím blokem a štítek se přilepí do jejího rohu, aniž by se karta sama pohnula.

## --checklist--
- `absolute` se měří od obsahujícího bloku.
- Obsahujícím blokem je nejbližší předek s `position` jinou než `static`.
- Bez pozicovaného předka se prvek měří od začátku stránky.
- `position: relative` na kartě bez `top` a `left` kartou nepohne, jen z ní udělá obsahující blok.
:::

Příště postavíš stránku s turistickou trasou: přilepenou hlavičku, štítky v rozích karet, tlačítko „Nahoru" a obsah článku, který se lepí vedle textu.

## Kde to najdeš v MDN

- [position](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position) — všech pět hodnot s ukázkami, včetně podmínek pro `sticky`.
- [Layout and the containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block) — přesná pravidla, co je obsahujícím blokem pro `absolute` a `fixed`, a seznam vlastností, které ho zakládají.
- [inset](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset) — zkratka pro `top`, `right`, `bottom` a `left` a její logické varianty.
- [overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow) — rozdíl mezi `hidden` a `clip`, který rozhoduje o tom, jestli vznikne posuvný kontejner.

# --questions--

## --question--

Seznam fotek `.gallery` má `position: relative`. Každá fotka `.photo` je v něm a má uvnitř popisek `.photo__caption` s `position: absolute; bottom: 0; left: 0;`. Fotky samy `position` nemají. Kde budou popisky?

### --answer--

Každý u spodního okraje své fotky.

#### --why--

Myslíš si, že absolutní prvek se měří od svého rodiče? Měří se od nejbližšího **pozicovaného** předka a fotka pozicovaná není.

### --correct--

Všechny na jednom místě u levého dolního rohu celé galerie, přes sebe.

#### --why--

Nejbližší pozicovaný předek všech popisků je `.gallery`, takže se všechny měří od jejího levého dolního rohu a leží přes sebe. Každá fotka potřebuje `position: relative`.

### --answer--

V normálním toku pod fotkami, protože `absolute` bez pozicovaného rodiče nefunguje.

#### --why--

Absolutně pozicovaný prvek vždycky vypadne z toku a vždycky nějaký obsahující blok najde, nejpozději začátek stránky.

### --see--

css-pozicovani/position#absolute-a-obsahujici-blok

## --question--

Karta je široká 400 px (obsah bez paddingu a rámečku) a má `position: relative`. Tlačítko v ní má `position: absolute; left: 24px; right: 24px;` a žádnou šířku. Jak široké bude tlačítko v px?

### --expected--

352

### --accept--

352 px
352px

### --why--

Když má absolutní prvek nastavené protilehlé strany a nemá šířku, roztáhne se mezi ně: 400 − 24 − 24 = 352 px.

### --see--

css-pozicovani/position#inset-roztazeni-a-velikost

## --question--

Boční menu `.sidebar` má `position: sticky; top: 0;` a leží v obalu `.shell`, který má `overflow: hidden` kvůli zaobleným rohům. Menu se při rolování stránky nelepí. Napiš deklaraci pro `.shell`, která rohy dál ořízne, ale lepení nerozbije.

### --expected--

overflow: clip

### --why--

`overflow: hidden` dělá z obalu posuvný kontejner, takže se menu lepí k němu, a obal sám neroluje. `overflow: clip` obsah ořízne stejně, jen posuvný kontejner nevytvoří a menu se lepí k oknu.

### --see--

css-pozicovani/position#sticky-lepi-se-dokud-muze

## --question--

Obal aplikace `.app` má `will-change: transform` a uvnitř je lišta s cookies `position: fixed; bottom: 0;`. Obal je vyšší než okno. Co uvidíš hned po otevření stránky, bez rolování?

### --answer--

Lištu u spodní hrany okna, jak má být.

#### --why--

`will-change: transform` patří mezi vlastnosti, které z předka udělají obsahující blok i pro `fixed`. Lišta se tedy okna netýká.

### --correct--

Nic, lišta je až u spodní hrany obalu, pod okrajem okna.

#### --why--

`will-change: transform` z obalu udělá obsahující blok pro `fixed` potomky. Lišta se měří od spodní hrany `.app`, a ta je pod oknem, takže ji uvidíš až po odrolování dolů.

### --answer--

Lištu u horní hrany okna, protože `will-change` prohodí `top` a `bottom`.

#### --why--

`will-change` nemění, od které hrany se měří. Mění, co je obsahujícím blokem.

### --see--

css-pozicovani/position#fixed-prispendlene-k-oknu
