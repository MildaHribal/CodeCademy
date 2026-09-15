# SVG a ikony

Ikona košíku v hlavičce e-shopu, šipka v tlačítku „Pokračovat", hvězdičky hodnocení nebo logo v patičce: skoro každá dnešní ikona na webu je SVG. Když ji vložíš špatně, nepřebarví se s textem, na mobilu je rozmazaná nebo obří a čtečka obrazovky přečte „obrázek, obrázek, tlačítko". Lekce ukáže, jak ji vložit, aby se chovala jako text.

:::check pretest
Tlačítko „Do košíku" má modrý text a vedle něj ikonu košíku. Při najetí myší text zčervená. Ikonu máš jako soubor `cart.svg` vložený přes `<img>`. Odhadni, co udělá ikona.

### --answer--
Zčervená spolu s textem.

#### --why--
Tak by se chovala ikona, která je součástí stránky. Obrázek v `<img>` je ale samostatný dokument a styly stránky do něj nevidí. V lekci uvidíš proč.

### --correct--
Zůstane v barvě, kterou má uloženou v souboru.

#### --why--
SVG v `<img>` je uzavřený obrázek. Barvu textu kolem sebe nezná, ani když má uvnitř `currentColor`.

### --answer--
Zmizí, protože SVG v `<img>` barvu neumí.

#### --why--
Zobrazí se normálně, jen v barvě ze souboru. Nezmizí.
:::

:::check pretest
SVG ikona má `viewBox="0 0 24 24"` a CSS jí nastaví šířku i výšku 48 px. Odhadni, co se stane s kresbou.

### --answer--
Zůstane malá 24 × 24 px v rohu a zbytek bude prázdný.

#### --why--
Tak by se choval obrázek s pevnými pixely. `viewBox` ale není velikost v pixelech.

### --correct--
Zvětší se ostře na dvojnásobek.

#### --why--
`viewBox` určuje souřadnice kresby, ne velikost na stránce. Prohlížeč souřadnice 0–24 roztáhne na 48 px a vektor zůstane ostrý.
:::

## Problém: ikona, která se nechová jako text

Ikona patří k textu: má stejnou barvu, roste s písmem a mění se při najetí myší. PNG to neumí — má pevné pixely a pevnou barvu, na displeji s vysokou hustotou pixelů je rozmazané a pro každou barvu potřebuješ jiný soubor.

**SVG** (*Scalable Vector Graphics*) je obrázek zapsaný jako text: tvary v souřadnicích. Když je vložený přímo do HTML, stane se součástí stránky.

:::live
```html
<p class="links">
  <a href="#">
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 4h2l2.4 11.2A2 2 0 0 0 9.4 17H18a2 2 0 0 0 2-1.6L21.5 8H7.1L6.6 5.6A2 2 0 0 0 4.6 4H3Zm6.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/>
    </svg>
    Do košíku
  </a>
  <a class="big" href="#">
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3.1 4.5 6.9 4.5c2.1 0 3.8 1.2 5.1 3 1.3-1.8 3-3 5.1-3 3.8 0 6 3.8 4.5 7.2C19.5 16.4 12 21 12 21Z"/>
    </svg>
    Oblíbené
  </a>
</p>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }
.links { display: flex; align-items: center; gap: 2rem; }
.links a { display: inline-flex; align-items: center; gap: 0.5em; color: oklch(0.45 0.13 255); font-weight: 600; text-decoration: none; transition: color 150ms ease; }
.links a:hover { color: oklch(0.52 0.19 25); }
.big { font-size: 1.75rem; }
.icon { flex: none; width: 1.25em; height: 1.25em; }
```
:::

Najeď myší na oba odkazy: ikona mění barvu s textem. Druhý odkaz má větší písmo a ikona je větší sama, protože má šířku v `em`. Zkus v CSS změnit `.big { font-size: … }` na `3rem`.

> [!REMEMBER]
> **Inline SVG je součást stránky: CSS ho obarví přes `currentColor` a zvětší přes `em` jako text. SVG v `<img>` je uzavřený obrázek, do kterého styly stránky nevidí.**

:::check
Ikona má v CSS `width: 1.25em; height: 1.25em` a je v odkazu s písmem 20 px. Jak široká bude v px?

### --expected--
25

### --accept--
25 px
25px

### --why--
`em` se počítá z písma prvku, ikona ho zdědí od odkazu: 1,25 × 20 = 25 px. Když se písmo odkazu změní, ikona se přizpůsobí.
:::

## `viewBox`: souřadnice, ne pixely

Atribut `viewBox="minX minY šířka výška"` říká, **kterou část plátna** kresba zabírá. Ikonové sady kreslí nejčastěji na plátno 24 × 24 (`viewBox="0 0 24 24"`) nebo 16 × 16. Velikost na stránce určí až CSS (nebo atributy `width` a `height`) a prohlížeč souřadnice na tu velikost přepočítá.

Obě varianty níž mají stejnou kresbu a stejnou velikost 96 px. Liší se jen `viewBox`.

:::compare
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: oklch(0.45 0.13 150); }
svg { width: 96px; height: 96px; outline: 1px dashed #94a3b8; }
```
--variant-- viewBox 0 0 24 24
```html
<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Zm-1.2 13.6-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z"/></svg>
```
--variant-- viewBox 0 0 12 12
```html
<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Zm-1.2 13.6-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z"/></svg>
```
:::

S `viewBox="0 0 12 12"` je vidět jen levá horní čtvrtina kresby, dvakrát zvětšená. Zkus v druhé variantě napsat `viewBox="-6 -6 36 36"` — kresba se zmenší a kolem vznikne okraj.

> [!PITFALL] SVG bez `viewBox`
> *Příznak:* ikona se nezvětšuje ani nezmenšuje, jen se ořízne nebo kolem ní zůstane prázdné místo.
>
> *Oprava:* nech v souboru `viewBox` a velikost řiď přes CSS. Starší nastavení optimalizátoru SVGO `viewBox` mazalo, od verze 4 ho nechává.

:::check
Ikona má `viewBox="0 0 16 16"` a v CSS velikost 32 × 32 px. Kruh v ní má střed v souřadnici `cx="8"`. Kolik px od levé hrany ikony bude střed kruhu?

### --expected--
16

### --accept--
16 px
16px

### --why--
Plátno 16 jednotek se roztáhne na 32 px, jedna jednotka je 2 px. Souřadnice 8 je tedy 16 px.
:::

## Tři způsoby, jak ikonu vložit

| způsob | barva z CSS | cache | kdy |
|---|---|---|---|
| **inline** `<svg>…</svg>` v HTML | ano | ne, je v každé stránce | pár ikon, ikony v komponentách Reactu |
| **`<img src="icon.svg" alt="…">`** | ne | ano | ilustrace, loga, obrázky s vlastními barvami |
| **sprite**: `<svg><use href="#icon-cart"/></svg>` | ano | s externím souborem ano | stejná ikona na mnoha místech |

Sprite je jeden skrytý `<svg>` se značkami `<symbol>` a na každém místě jen odkaz `<use>`:

```html
<svg hidden>
  <symbol id="icon-check" viewBox="0 0 24 24">
    <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
  </symbol>
</svg>

<!-- kdekoli na stránce -->
<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>
```

`<use>` zkopíruje symbol včetně jeho `viewBox`, takže velikost i `currentColor` fungují jako u inline SVG. Externí sprite (`<use href="/icons.svg#icon-check"/>`) prohlížeč uloží do cache, ale musí být ze stejné domény.

Tip na chybu, kterou potkáš v cizím kódu, si tipni předem:

:::live predict
```html
<p class="rating">
  <svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8L12 2Z"/></svg>
  <img class="star" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8L12 2Z'/%3E%3C/svg%3E">
  4,8 z 5
</p>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }
.rating { display: flex; align-items: center; gap: 0.5rem; color: oklch(0.7 0.16 70); font-size: 1.5rem; font-weight: 700; }
.star { width: 1em; height: 1em; }
```
--question-- Obě hvězdičky mají v kresbě `fill="currentColor"` a text odstavce je oranžový. Jakou barvu budou mít?
--option-- Obě oranžové.
--option*-- Inline hvězdička oranžová, hvězdička v `<img>` černá.
--option-- Obě černé, protože `currentColor` v SVG znamená černou.
--why-- `currentColor` znamená „barva textu v místě, kde kresba je". Inline SVG leží v odstavci, takže převezme oranžovou. SVG v `<img>` je samostatný dokument bez stylů stránky, jeho barva textu je výchozí černá. Chceš-li ikonu ze souboru barvit přes CSS, použij sprite s `<use>` nebo masku z poslední části lekce.
--see-- css-design/svg-a-ikony#tri-zpusoby-jak-ikonu-vlozit
:::

:::check
Na stránce objednávky je 40 řádků s ikonou „smazat", která má být červená při najetí myší. Který způsob vložení je nejvhodnější?

### --answer--
`<img src="trash.svg">` v každém řádku.

#### --why--
Soubor se sice stáhne jednou, ale obrázek v `<img>` nepřebarvíš při najetí myší.

### --correct--
Jeden `<symbol>` ve spritu a v každém řádku `<use href="#icon-trash"/>`.

#### --why--
Kresba je v HTML jen jednou, a přitom se chová jako inline SVG: barví se přes `currentColor` a mění se s `:hover`.

### --answer--
40× celé inline `<svg>` s cestou.

#### --why--
Fungovalo by to, jen by se stejná kresba 40× opakovala v HTML. Sprite dá stejný výsledek s jednou kopií.
:::

## `currentColor`: ikona v barvě textu

`currentColor` je hodnota, která znamená „aktuální hodnota `color`". V ikonách se píše do `fill` (výplň tvaru) nebo `stroke` (obrys čáry):

- **plné ikony** (*solid*): `fill="currentColor"`,
- **obrysové ikony** (*outline*, třeba Lucide nebo Tabler): `fill="none" stroke="currentColor" stroke-width="2"`.

Když ikonu stáhneš z návrhu, bývá v ní barva natvrdo (`fill="#1E293B"`). Tu je potřeba přepsat na `currentColor`, jinak se ikona v tmavém motivu ani při najetí myší nezmění. Hodnoty můžeš přepsat i v CSS, protože atributy `fill` a `stroke` mají nejnižší prioritu:

```css
.icon path {
  fill: currentColor;
}
```

Barvu pak řídíš jen vlastností `color` na ikoně nebo jejím rodiči.

:::live
```html
<ul class="status">
  <li class="ok"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1e293b" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.4-5.4 1.4 1.4-6.8 6.8Z"/></svg>Platba přijata</li>
  <li class="warn"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1e293b" d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z"/></svg>Čeká na vyzvednutí</li>
</ul>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: oklch(0.2 0.02 260); }
.status { display: grid; gap: 0.75rem; padding: 0; list-style: none; font-weight: 600; }
.status li { display: flex; align-items: center; gap: 0.5rem; }
.ok { color: oklch(0.8 0.14 150); }
.warn { color: oklch(0.85 0.14 80); }
.icon { flex: none; width: 1.5em; height: 1.5em; }
```
:::

Ikony mají v kresbě natvrdo tmavou barvu, takže na tmavém pozadí skoro nejsou vidět. Přidej do CSS pravidlo `.icon path { fill: currentColor; }` a ikony převezmou zelenou a žlutou svého řádku.

:::check
Obrysová ikona má `<path fill="none" stroke="#0f172a" stroke-width="2" d="…"/>` a má se barvit s textem. Napiš atribut, který nahradí `stroke="#0f172a"`.

### --expected--
stroke="currentColor"

### --accept--
stroke='currentColor'
stroke=currentColor

### --why--
Obrysová ikona kreslí čárou, takže barvu přebírá `stroke`. `fill` má zůstat `none`, jinak by se tvar vyplnil.
:::

## Přístupnost ikon

Čtečka obrazovky ikonu přečte podle toho, jak ji označíš. Rozhoduje, **jestli ikona nese informaci, kterou jinde na stránce nenajdeš**:

| situace | kód |
|---|---|
| dekorace vedle textu („🛒 Do košíku") | `<svg aria-hidden="true">` |
| tlačítko jen s ikonou | jméno na tlačítku: `<button aria-label="Zavřít">` a `<svg aria-hidden="true">` uvnitř |
| ikona sama nese význam (stav bez textu) | `<svg role="img" aria-label="Doručeno">` |
| obrázek v `<img>` | `alt="Doručeno"`, u dekorace `alt=""` |

Nejčastější chyba je tlačítko s ikonou bez jména. Čtečka pak řekne jen „tlačítko" a uživatel neví, jestli zavírá okno, nebo maže objednávku. Druhá chyba je opak: ikona vedle textu bez `aria-hidden`, kterou čtečka ohlásí jako obrázek navíc.

```html
<button class="icon-button" type="button" aria-label="Přidat do oblíbených">
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
    <use href="#icon-heart"/>
  </svg>
</button>
```

Ikonové tlačítko potřebuje i dost velkou plochu na klepnutí: kolem 44 × 44 px, i když ikona sama má 20 px. Zvětši `padding`, ne ikonu.

:::check
V hlavičce je tlačítko s ikonou lupy a bez textu, které otevře hledání. Kam patří `aria-label="Hledat"`?

### --answer--
Na `<svg>` uvnitř tlačítka.

#### --why--
Jméno potřebuje prvek, se kterým uživatel pracuje — tlačítko. SVG uvnitř je jen jeho obsah a má být pro čtečku skryté.

### --correct--
Na `<button>`, a `<svg>` dostane `aria-hidden="true"`.

#### --why--
Čtečka ohlásí „Hledat, tlačítko". Skrytá ikona nepřidá nic navíc.

### --answer--
Nikam, čtečka pozná lupu z tvaru.

#### --why--
Čtečka tvary nevidí. Bez jména řekne jen „tlačítko".
:::

## Barvení ikony ze souboru přes `mask`

Někdy ikonu nemůžeš vložit do HTML (přichází z CMS jako URL, nebo ji chceš jen v CSS jako ozdobu u odkazu). Pak ji použij jako **masku**: prvek dostane barevné pozadí v barvě textu a maska z něj vykrojí tvar ikony.

```css
.external::after {
  content: "";
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-inline-start: 0.25em;
  background-color: currentColor;
  mask: url("/icons/external.svg") center / contain no-repeat;
}
```

Barva pak jde z `color`, stejně jako u inline SVG. Ikona v `::after` je čistě dekorativní, čtečka ji nepřečte, takže nesmí nést informaci, kterou nemá text.

:::live
```html
<p><a class="external" href="#">Dokumentace MDN</a></p>
<p><a class="external danger" href="#">Smazat účet</a></p>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; font-size: 1.25rem; }
a { color: oklch(0.45 0.13 255); font-weight: 600; transition: color 150ms ease; }
a:hover { color: oklch(0.3 0.1 255); }
.danger { color: oklch(0.5 0.18 25); }

.external::after {
  content: "";
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-inline-start: 0.25em;
  vertical-align: -0.125em;
  background-color: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z'/%3E%3C/svg%3E") center / contain no-repeat;
}
```
:::

Najeď myší na první odkaz a ikona ztmavne s textem. Barva kresby v souboru masky nehraje roli, rozhoduje jen tvar. Zkus v CSS smazat `background-color: currentColor` — ikona zmizí, protože maska nemá co vykrojit.

:::check
Ikona v `::after` s maskou je neviditelná, i když má `width` a `height` i platnou `mask`. Která deklarace nejspíš chybí? Napiš ji celou.

### --expected--
background-color: currentColor

### --accept--
background: currentColor
background-color: currentcolor

### --why--
Maska jen vykrojí tvar z toho, co prvek maluje. Bez pozadí prvek nemaluje nic, takže je vidět prázdné místo.
:::

## Ikonové sady, licence a optimalizace

Ikony nekresli sám a nekombinuj sady. Jedna sada má stejnou tloušťku čar, zaoblení a velikost plátna, takže ikony k sobě ladí. Běžné sady pro weby:

| sada | styl | licence |
|---|---|---|
| Lucide | obrysové, 24 × 24 | ISC (volné použití, zachovat licenci) |
| Heroicons | obrysové i plné, 24 a 20 | MIT |
| Tabler Icons | obrysové i plné | MIT |
| Phosphor | šest tlouštěk | MIT |
| Material Symbols | variabilní (tloušťka, výplň) | Apache 2.0 |

MIT, ISC a Apache 2.0 dovolují použití i v komerčním projektu, jen je potřeba mít v projektu jejich licenční text (u balíčku z npm už je). U sad s licencí CC BY je navíc povinné uvést autora.

SVG z grafického editoru bývá plné metadat, skupin bez významu a pevných rozměrů. Optimalizátor **SVGO** (i webová verze SVGOMG) soubor zmenší třeba na třetinu. Po optimalizaci zkontroluj, že zůstal `viewBox`, a barvy přepiš na `currentColor`.

:::check
Stáhl jsi ikony ze sady s licencí MIT a použiješ je v placeném projektu pro klienta. Co musíš udělat?

### --answer--
Nic, MIT znamená, že autor nemá žádné požadavky.

#### --why--
MIT je velmi volná, ale jednu podmínku má: v projektu musí zůstat text licence s copyrightem autora.

### --correct--
Nechat v projektu licenční text sady (u balíčku z npm už je v jeho složce).

#### --why--
MIT dovoluje komerční použití a úpravy, jen chce zachovat licenci a copyright. Uvádět autora na webu nemusíš.

### --answer--
Koupit komerční licenci.

#### --why--
MIT je svobodná licence, komerční použití dovoluje bez poplatku.
:::

## Typické chyby a pasti

> [!PITFALL] Ikona v `<img>` se nepřebarví
> *Příznak:* text při najetí myší změní barvu, ikona vedle zůstane černá, a v tmavém motivu je skoro neviditelná.
>
> *Oprava:* vlož ikonu inline nebo přes `<use>`, s `fill="currentColor"`. Když musí zůstat soubor, použij `mask` s `background-color: currentColor`.

> [!PITFALL] Obří ikona před načtením CSS
> *Příznak:* na pomalém připojení nebo v e-mailu je ikona přes celou šířku stránky, protože SVG bez rozměrů je ve výchozím stavu široké jako kontejner.
>
> *Oprava:* dej inline SVG atributy `width="24" height="24"` jako záložní velikost a skutečnou velikost řiď v CSS.

> [!PITFALL] Ikona se ve flexu zmáčkne
> *Příznak:* vedle dlouhého textu je ikona užší než ostatní nebo úplně zmizí.
>
> *Oprava:* SVG je flex položka jako každá jiná a zmenšuje se. Dej ikoně `flex: none` (nebo `flex-shrink: 0`).

> [!PITFALL] Tlačítko jen s ikonou bez jména
> *Příznak:* čtečka ohlásí jen „tlačítko" a automatická kontrola přístupnosti hlásí „Buttons must have discernible text".
>
> *Oprava:* `aria-label` s popisem akce na `<button>` a `aria-hidden="true"` na SVG.

Poslední past si ověř v ukázce. Tipni si, jak dopadne ikona vedle dlouhého názvu souboru:

:::live predict
```html
<div class="file">
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V9h5.5L13 3.5Z"/></svg>
  <span>smlouva-o-pronajmu-bytu-brno-zabovresky-podepsana-verze-final.pdf</span>
</div>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; color: oklch(0.35 0.05 255); }
.file { display: flex; align-items: center; gap: 0.5rem; width: 16rem; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; overflow-wrap: anywhere; }
.icon { width: 1.5rem; height: 1.5rem; }
```
--question-- Ikona má v CSS šířku 1.5rem (24 px). Jak bude široká vedle dlouhého názvu?
--option-- 24 px, protože má šířku nastavenou v CSS.
--option*-- Užší než 24 px, flexbox ji zmenší spolu s textem.
--option-- 0 px, ikona zmizí úplně.
--why-- Ikona je flex položka s výchozím `flex-shrink: 1`. Název se díky `overflow-wrap: anywhere` smí zúžit, takže místo chybí a flexbox ubírá všem položkám, i ikoně — `width` je jen výchozí velikost. Přidej do `.icon` deklaraci `flex: none` a ikona zůstane 24 px.
--see-- css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto
:::

:::explain
Vysvětli vlastními slovy, proč se inline SVG s `fill="currentColor"` přebarví při najetí myší spolu s textem, ale stejný soubor v `<img>` ne.

## --model--
`currentColor` znamená hodnotu `color` tam, kde kresba je. Inline SVG je součást stránky, takže zdědí barvu textu od rodiče a změní se s ní, třeba při `:hover`. SVG v `<img>` je samostatný dokument, do kterého styly stránky nevidí, takže jeho `currentColor` je výchozí černá. Aby se ikona ze souboru barvila, musím ji vložit inline nebo přes `<use>`, případně použít masku.

## --checklist--
- `currentColor` je aktuální hodnota `color` v místě kresby.
- Inline SVG je součást stránky a barvu dědí od rodiče.
- SVG v `<img>` je samostatný dokument bez stylů stránky.
- Řešení je inline SVG, sprite s `<use>` nebo `mask`.
:::

:::check
Ikona má `width: 1.5rem` a ve flex řádku vedle dlouhého textu se zúží. Napiš deklaraci pro ikonu, která tomu zabrání.

### --expected--
flex: none

### --accept--
flex-shrink: 0
flex: 0 0 auto

### --why--
`flex: none` je `0 0 auto`: ikona neroste ani se nezmenšuje a zůstane na své šířce.
:::

## Kde to najdeš v MDN

- [viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox) — jak čtyři čísla určí souřadnice kresby a jak se přepočítají na velikost.
- [&lt;use&gt;](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use) — odkaz na `<symbol>` ve spritu a co se z něj zkopíruje.
- [currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword) — klíčové slovo, přes které ikona přebírá barvu textu.
- [mask](https://developer.mozilla.org/en-US/docs/Web/CSS/mask) — zkratka pro masku z obrázku, polohu a velikost.
- [ARIA: img role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role) — kdy dát SVG `role="img"` a přístupné jméno.

# --questions--

## --question--

Logo firmy je SVG se třemi barvami a má se zobrazit v patičce. Nemá se přebarvovat. Který způsob vložení je nejjednodušší? Napiš název prvku bez špičatých závorek.

### --expected-- ignore-case

img

### --accept--

<img>

### --why--

Logo má vlastní barvy a styly stránky do něj zasahovat nemají. `<img src="logo.svg" alt="Název firmy">` se uloží do cache a `alt` dá logu přístupné jméno.

### --see--

css-design/svg-a-ikony#tri-zpusoby-jak-ikonu-vlozit

## --question--

Ikonová sada kreslí na plátno `viewBox="0 0 20 20"`. Chceš ikonu velkou 30 px. Kolik px na stránce bude čára, která má v kresbě tloušťku `stroke-width="2"`?

### --expected--

3

### --accept--

3 px
3px

### --why--

Plátno 20 jednotek se roztáhne na 30 px, jedna jednotka je 1,5 px. Čára 2 jednotky má tedy 3 px — s velikostí ikony roste i tloušťka čar.

### --see--

css-design/svg-a-ikony#viewbox-souradnice-ne-pixely

## --question--

Stav objednávky je v tabulce jen ikona zelené fajfky, bez textu. Jak ji označíš pro čtečku?

### --answer--

`aria-hidden="true"`, aby čtečka nečetla zbytečnosti.

#### --why--

Ikona tady nese jedinou informaci o stavu. Když ji skryješ, uživatel čtečky se stav nedozví.

### --correct--

`role="img"` a `aria-label` s popisem stavu, třeba „Doručeno".

#### --why--

Ikona bez textu, která nese význam, potřebuje přístupné jméno. `role="img"` říká, že celé SVG je jeden obrázek.

### --answer--

Nic, fajfka je všeobecně známý symbol.

#### --why--

Tvar symbolu čtečka nevidí. Bez jména ikonu přeskočí nebo ohlásí jako prázdný obrázek.

### --see--

css-design/svg-a-ikony#pristupnost-ikon

## --question--

V ikoně z návrhu je `<path fill="#334155" d="…"/>`. Nechceš upravovat SVG, jen CSS. Napiš deklaraci do pravidla `.icon path`, aby se ikona barvila podle textu.

### --expected--

fill: currentColor

### --accept--

fill: currentcolor

### --why--

Atribut `fill` v SVG má nižší prioritu než jakékoli pravidlo v CSS, takže deklarace ho přepíše a ikona převezme `color` rodiče.

### --see--

css-design/svg-a-ikony#currentcolor-ikona-v-barve-textu
