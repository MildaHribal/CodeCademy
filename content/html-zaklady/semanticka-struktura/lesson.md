# Sémantická struktura stránky

Otevři si zpravodajský web nebo blog: nahoře logo a menu, uprostřed článek, vedle panel s dalšími články, dole patička s kontakty. Na pohled to umí poskládat kdokoli z `div`ů a CSS. Rozdíl mezi amatérskou a profesionální stránkou je v tom, jestli tu strukturu pozná i program — čtečka obrazovky, vyhledávač nebo režim čtení v prohlížeči.

:::check pretest
Dvě stránky vypadají na obrazovce úplně stejně. První je poskládaná z prvků `div` s třídami, druhá z prvků `header`, `nav`, `main` a `footer`. Co se liší?

### --answer--
Nic, prohlížeč s oběma zachází stejně, rozhoduje jen CSS.

#### --why--
Vzhled může být stejný, ale prohlížeč z prvků vyčte i význam a předává ho dál dalším programům.

### --correct--
Druhou stránku umí čtečka obrazovky a další nástroje rozdělit na části a skákat mezi nimi.

#### --why--
Prvky jako `nav` a `main` nesou význam. Nevidomý uživatel díky nim skočí rovnou na obsah nebo na menu, u `div`ů musí poslouchat stránku od začátku.

### --answer--
Druhá stránka se načte rychleji, protože má kratší kód.

#### --why--
Rozdíl v délce kódu je zanedbatelný a rychlost načtení nemění. Rozdíl je jinde.
:::

## Problém: polévka z divů

Tohle je kostra blogu, jakou vyrobí spousta šablon:

```html
<div class="header">
  <div class="logo">Dvě kola</div>
  <div class="menu">…</div>
</div>
<div class="content">
  <div class="post">…</div>
  <div class="sidebar">…</div>
</div>
<div class="footer">© 2026 Dvě kola</div>
```

Pro člověka, který stránku vidí, je všechno v pořádku. Pro čtečku obrazovky je to jedna dlouhá hromada textu. Třída `menu` je jen jméno pro CSS a o významu nic neříká — stejně dobře by se mohla jmenovat `x7`.

[[sémantický prvek]] (*semantic element*) nese **význam**: říká, co obsah je, ne jak vypadá. `nav` znamená „navigace", `article` „samostatný článek". Prohlížeč takový prvek převede na informaci, kterou dostanou pomocné technologie.

> [!REMEMBER]
> **Vyber prvek podle toho, co obsah znamená, ne podle toho, jak má vypadat.** Vzhled dodá CSS, význam jen HTML.

:::check
Proč nestačí dát `div` třídu `class="navigation"`, aby čtečka poznala navigaci?

### --answer--
Protože čtečka umí číst jen anglické třídy a tohle je chyba v jménu.

#### --why--
Čtečka třídy nečte vůbec, v žádném jazyce. Třída slouží pro CSS a JavaScript.

### --correct--
Protože třída je jen jméno pro styly a skripty, význam prvku nemění.

#### --why--
Pro prohlížeč je `div` s jakoukoli třídou pořád obecný kontejner bez významu. Navigaci z něj udělá až prvek `nav`.

### --answer--
Protože třída musí být na prvku `body`, aby platila pro celou stránku.

#### --why--
Na umístění třídy nezáleží. I kdyby byla kdekoli, význam prvku nezmění.
:::

## Orientační oblasti: `header`, `nav`, `main`, `aside`, `footer`

Pět prvků rozdělí stránku na velké části. Čtečka obrazovky z nich vyrobí seznam [[orientační oblast|orientačních oblastí]] (*landmarks*), mezi kterými uživatel skáče klávesou, podobně jako ty přeskočíš očima rovnou na článek.

| prvek | význam | oblast ve čtečce |
|---|---|---|
| `header` | úvodní část: logo, název webu, hlavní menu | banner |
| `nav` | hlavní skupina odkazů pro pohyb po webu | navigace |
| `main` | hlavní obsah stránky, **jen jeden** | hlavní obsah |
| `aside` | obsah vedle hlavního: související články, o autorovi | doplňující obsah |
| `footer` | patička: kontakt, autorská práva, odkazy na podmínky | informace o obsahu |

```html
<body>
  <header>
    <a href="/">Dvě kola</a>
    <nav>
      <ul>
        <li><a href="/clanky/">Články</a></li>
        <li><a href="/trasy/">Trasy</a></li>
      </ul>
    </nav>
  </header>
  <main>…článek…</main>
  <aside>…další články…</aside>
  <footer>© 2026 Dvě kola</footer>
</body>
```

`main` je na stránce jen jeden a nepatří dovnitř `article`, `aside`, `header`, `footer` ani `nav`. `nav` nepoužívej na každou skupinu odkazů — tři odkazy na sociální sítě v patičce navigace webu nejsou.

Ukázka níže vypíše oblasti tak, jak je pozná čtečka obrazovky. Skript nečti, sleduj výsledek.

:::live
```html
<header class="site">Dvě kola</header>
<nav>Články · Trasy · O mně</nav>
<main>
  <h1>Tři dny podél Baťova kanálu</h1>
  <p>Z Kroměříže do Hodonína na kole.</p>
</main>
<footer class="site">© 2026 Dvě kola</footer>
<h2>Oblasti, které uvidí čtečka</h2>
<ol id="landmarks"></ol>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2933; }
.site, nav { background: #ecfdf5; padding: 0.5rem 1rem; }
#landmarks { font-family: ui-monospace, monospace; background: #f8fafc; padding: 0.75rem 2rem; }
```
```js
const names = { header: 'banner', nav: 'navigation', main: 'main', aside: 'complementary', footer: 'contentinfo' };
const found = [...document.querySelectorAll('header, nav, main, aside, footer')]
  .filter((el) => !['header', 'footer'].includes(el.localName) || !el.parentElement.closest('article, aside, main, nav, section'))
  .map((el) => `<li>${names[el.localName]} — &lt;${el.localName}&gt;</li>`);
document.querySelector('#landmarks').innerHTML = found.join('') || '<li>žádné</li>';
```
:::

Zkus přepsat `<nav>` na `<div>` (i uzavírací značku) a sleduj, že navigace ze seznamu zmizí, i když stránka vypadá stejně.

:::check
Kolikrát smí být na jedné stránce viditelný prvek `main`? Napiš číslo.

### --expected--
1

### --why--
`main` označuje hlavní obsah stránky a ten je jen jeden. Čtečka na něj skáče jednou klávesou — kdyby byly dva, nevěděla by kam.
:::

## `article` a `section`

Oba prvky obalí kus obsahu s nadpisem. Liší se v tom, jestli ten kus dává smysl **sám o sobě**.

`article` je samostatný celek, který bys mohl vytrhnout a poslat jinam a pořád by dával smysl: článek na blogu, recept, příspěvek v diskusi, karta produktu, recenze. Test: dal bys ho do RSS čtečky nebo sdílel samotný?

`section` je tematická část většího celku. Kapitola „Etapy" z článku o výletu sama o sobě nedává smysl — potřebuje článek kolem. `section` má skoro vždy vlastní nadpis.

```html
<article>
  <h1>Tři dny podél Baťova kanálu</h1>
  <section>
    <h2>Etapy</h2>
    …
  </section>
  <section>
    <h2>Co s sebou</h2>
    …
  </section>
</article>
```

Vnořovat se dají oba směry: stránka kategorie je `section` plná `article` (upoutávek na články), článek obsahuje `section` (kapitoly) a komentáře pod článkem jsou `article` uvnitř `article`.

:::explain
Vysvětli vlastními slovy, podle čeho se rozhodneš mezi `article` a `section`.

## --model--
`article` použiju pro obsah, který dává smysl sám o sobě a šel by vytrhnout ze stránky — třeba článek, recept nebo komentář. `section` je jen tematická část něčeho většího, typicky kapitola s nadpisem uvnitř článku. Když si nejsem jistý, zeptám se, jestli by ten kus mohl vyjít samostatně třeba v RSS.

## --checklist--
- `article` je samostatný celek, který dává smysl i vytržený ze stránky.
- `section` je tematická část většího celku.
- `section` má obvykle vlastní nadpis.
- Oba prvky se dají vnořovat do sebe (kapitoly v článku, články v sekci).
:::

:::check
Na e-shopu je stránka „Horská kola" s nadpisem a dvanácti kartami produktů. Každá karta má fotku, název, cenu a odkaz. Co je nejlepší volba pro jednu kartu?

### --answer--
`section`, protože karta je část stránky kategorie.

#### --why--
Myslíš si, že `section` je „kus stránky"? Každá karta ale dává smysl i sama, bez okolních karet.

### --correct--
`article`, protože karta produktu je samostatný celek.

#### --why--
Kartu bys mohl vytrhnout a poslat kamarádovi a pořád by dávala smysl. Celý výpis pak může být `section` nebo rovnou `main`.

### --answer--
`aside`, protože karty stojí vedle sebe.

#### --why--
`aside` je obsah vedle hlavního obsahu stránky. Tady jsou karty naopak hlavní obsah.
:::

## `div` a `span`: kdy jsou správně

Sémantika neznamená, že `div` je zakázaný. `div` (blokový) a `span` (řádkový) jsou obecné obaly **bez významu** a přesně k tomu slouží: když potřebuješ skupinu jen kvůli CSS nebo JavaScriptu.

- obal pro rozvržení dvou sloupců (`<div class="layout">`),
- barevný štítek v textu (`<span class="badge">Novinka</span>`),
- skupina, na kterou potřebuješ skript.

Pořadí rozhodování: **existuje prvek s tímhle významem? Použij ho. Neexistuje? Použij `div` nebo `span`.** Špatně je `div` místo `nav`, `button` nebo `h2`. Správně je `div` tam, kde žádný význam není.

:::check
Potřebuješ obalit dva sloupce (článek a boční panel) kvůli rozvržení vedle sebe. Uvnitř už jsou `article` a `aside`. Jaký prvek zvolíš pro ten obal?

### --answer--
`section`, protože obaluje část stránky.

#### --why--
`section` je tematická část s vlastním nadpisem. Obal kvůli rozvržení žádné téma ani nadpis nemá.

### --correct--
`div`, protože obal slouží jen pro CSS a žádný význam nemá.

#### --why--
Význam už nesou `article` a `aside` uvnitř. Obal pro rozvržení je přesně případ, kdy je `div` správná volba.

### --answer--
`main`, protože článek je hlavní obsah.

#### --why--
`main` označuje hlavní obsah stránky, ale boční panel do hlavního obsahu nepatří — nemůžeš ho zabalit dovnitř.
:::

## Obsah s významem: `time`, `address`, `blockquote` a `cite`

Pár prvků dá význam i drobným údajům v textu:

```html
<p>Zveřejněno <time datetime="2026-06-14">14. června 2026</time></p>

<address>
  Napiš mi: <a href="mailto:tereza@dvekola.cz">tereza@dvekola.cz</a>
</address>

<blockquote cite="https://www.dvekola.cz/rozhovory/spravce-komory">
  <p>Loni tu propluly přes čtyři tisíce lodí.</p>
</blockquote>
<p>Správce plavební komory ve Spytihněvi, v rozhovoru pro <cite>Dvě kola</cite></p>
```

- `time` ukáže datum lidsky a v atributu `datetime` ho má pro stroje ve tvaru `RRRR-MM-DD` (případně s časem `2026-06-14T09:30`). Díky tomu vyhledávač pozná datum článku.
- `address` jsou **kontaktní údaje autora** článku nebo webu. Nepatří do něj každá adresa v textu, třeba adresa restaurace v recenzi.
- `blockquote` je delší citát ve vlastním bloku, `q` krátký citát uvnitř věty (prohlížeč k němu doplní uvozovky).
- `cite` je **název díla** — knihy, filmu, webu. Jméno člověka do něj nepatří.

:::check
Jak zapíšeš hodnotu atributu `datetime` pro datum 3. září 2026?

### --expected--
2026-09-03

### --why--
Strojový formát je rok-měsíc-den se dvěma číslicemi pro měsíc i den. Lidský text uvnitř `time` může být jakýkoli, třeba „3. září".
:::

## Osnova nadpisů

Nadpisy `h1`–`h6` tvoří [[osnova nadpisů|osnovu stránky]] (*heading outline*), jako obsah knihy. Uživatelé čteček podle ní procházejí stránku nejčastěji — vypíšou si seznam nadpisů a skočí na ten, který je zajímá.

Pravidla:

- **Jeden `h1`** na stránce: o čem stránka je.
- **Úrovně nepřeskakuj směrem dolů**: pod `h2` přijde `h3`, ne `h4`. Nahoru se vracet smíš kdykoli (po `h4` klidně `h2`).
- Úroveň vybírej podle **pozice v osnově, ne podle velikosti písma**. Velikost upraví CSS.

```text
h1 Tři dny podél Baťova kanálu
  h2 Etapy
    h3 Den 1: Kroměříž – Otrokovice
    h3 Den 2: Otrokovice – Veselí nad Moravou
  h2 Co s sebou
  h2 Časté otázky
```

:::live predict
```html
<header>
  <p class="logo">Dvě kola</p>
</header>
<main>
  <article>
    <header>
      <h1>Tři dny podél Baťova kanálu</h1>
      <p>14. června 2026 · Tereza Horáková</p>
    </header>
    <p>Z Kroměříže do Hodonína na kole.</p>
  </article>
</main>
<h2>Oblasti, které uvidí čtečka</h2>
<ol id="landmarks"></ol>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2933; }
header { background: #ecfdf5; padding: 0.25rem 1rem; }
#landmarks { font-family: ui-monospace, monospace; background: #f8fafc; padding: 0.75rem 2rem; }
```
```js
const names = { header: 'banner', nav: 'navigation', main: 'main', aside: 'complementary', footer: 'contentinfo' };
const found = [...document.querySelectorAll('header, nav, main, aside, footer')]
  .filter((el) => !['header', 'footer'].includes(el.localName) || !el.parentElement.closest('article, aside, main, nav, section'))
  .map((el) => `<li>${names[el.localName]} — &lt;${el.localName}&gt;</li>`);
document.querySelector('#landmarks').innerHTML = found.join('');
```
--question-- Stránka má dva prvky `header`. Kolik oblastí `banner` (úvodní část stránky) vypíše seznam?
--option-- Dvě, každý `header` je jedna oblast banner.
--option*-- Jednu, `header` uvnitř článku je jen hlavička toho článku.
--option-- Žádnou, dva `header` na stránce jsou chyba a čtečka je obě ignoruje.
--why-- `header` a `footer` jsou oblastí celé stránky jen tehdy, když nejsou uvnitř `article`, `aside`, `main`, `nav` nebo `section`. Uvnitř článku znamenají „hlavička a patička tohohle článku" a smí jich být na stránce kolik chceš. `main` je naopak oblast vždy a smí být jen jeden.
:::

:::check
Designérka chce pod nadpisem článku `h1` menší mezititulky, a tak kolega použil `h4`, „protože má hezkou velikost". Co je špatně?

### --answer--
Nic, úroveň nadpisu si smí autor vybrat podle vzhledu.

#### --why--
Myslíš si, že číslo nadpisu určuje velikost? Určuje místo v osnově. Velikost je věc CSS.

### --correct--
Osnova přeskočí z `h1` rovnou na `h4` — správně je `h2` a menší písmo zařídí CSS.

#### --why--
Čtečka ohlásí „nadpis úrovně 4" a uživatel hledá, kde jsou úrovně 2 a 3. Vzhled se řeší stylem, třeba `font-size`, ne volbou jiného prvku.

### --answer--
`h4` se nesmí použít na stránce, která už má `h1`.

#### --why--
`h4` na stránce s `h1` použít smíš, jen musí ležet pod `h3` v osnově. Chyba je ve skoku přes dvě úrovně.
:::

## Co sémantika mění

Správné prvky nejsou jen „čistý kód". Mají tři konkrétní dopady:

1. **Čtečka obrazovky** vypíše oblasti a nadpisy a uživatel mezi nimi skáče. Bez nich musí stránku poslouchat od začátku, včetně menu při každém načtení. Přístupnosti se podrobně věnuje samostatná sekce.
2. **Vyhledávač** pozná hlavní obsah (`main`, `article`), datum zveřejnění (`time`) a strukturu podle nadpisů. Menu a patička pro něj mají menší váhu.
3. **Režim čtení** v prohlížeči (ikona knížky v adresním řádku) vybere podle `article` a `main` samotný text článku bez reklam a panelů. Stejně pracují aplikace typu „ulož na později" a náhledy odkazů.

> [!TIP]
> Seznam oblastí a osnovu nadpisů si můžeš prohlédnout v DevTools: v Chromu v panelu Elements otevři záložku **Accessibility** a zapni **Enable full-page accessibility tree**. Uvidíš stránku tak, jak ji dostane čtečka.

:::check
Uživatel čtečky otevře tvůj blog a chce přeskočit menu rovnou na článek. Který prvek mu to umožní jednou klávesou? Napiš jeho jméno bez závorek.

### --expected--
main

### --accept--
article

### --why--
Čtečky mají zkratku „přejdi na hlavní obsah" a ta míří na `main`. Některé umí skákat i mezi články, proto projde i `article` — hlavní skok ale vede na `main`.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Dva prvky `main`.** Boční panel nebo druhý sloupec dostane `main`, „protože je taky důležitý". Validátor hlásí `A document must not include more than one visible “main” element.` Oprava: jeden `main` pro hlavní obsah, panel vedle něj je `aside`.

> [!PITFALL]
> **Nadpis podle velikosti.** `h4` místo `h2`, protože je menší, nebo `strong` místo nadpisu, protože je nenápadný. Čtečka pak hlásí rozbitou osnovu. Oprava: úroveň podle osnovy, velikost přes CSS.

> [!PITFALL]
> **`section` jako náhrada za `div`.** Obal kvůli rozvržení dostane `section` bez nadpisu. Oprava: když obal nemá téma ani nadpis, je to `div`.

> [!PITFALL]
> **Jméno autora v `cite`.** `<cite>Tereza Horáková</cite>` je chyba, `cite` je pro název díla. Jméno patří do obyčejného textu nebo do `address`, když jde o kontakt na autora.

## Kde to najdeš v MDN

- [HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) — všechny prvky rozdělené podle účelu, sekce „Content sectioning" jsou orientační oblasti.
- [`<article>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article) a [`<section>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section) — příklady použití a rozdíl mezi nimi.
- [Heading elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) — pravidla osnovy a proč nepřeskakovat úrovně.
- [`<time>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time) — všechny platné tvary atributu `datetime`.

# --questions--

## --question--

Pod článkem na blogu jsou tři komentáře čtenářů, každý se jménem, datem a textem. Jaký prvek je nejvhodnější pro jeden komentář? Napiš jeho jméno.

### --expected--
article

### --why--
Komentář je samostatný celek s autorem a datem, který dává smysl i sám. Komentáře jsou pak `article` vnořené v `article` článku.

### --see--
html-zaklady/semanticka-struktura#article-a-section

## --question--

Recenze restaurace končí větou „Najdete ji na adrese Údolní 5, Brno". Kolega adresu obalil do `address`. Je to správně?

### --answer--
Ano, `address` je určený pro všechny poštovní adresy.

#### --why--
Myslíš si, že `address` znamená „adresa" v jakémkoli smyslu? Označuje jen kontakt na autora nebo vlastníka obsahu.

### --correct--
Ne, `address` patří jen ke kontaktním údajům autora článku nebo webu.

#### --why--
Adresa restaurace je běžný údaj v textu a patří do odstavce. `address` by říkal, že restaurace je autorka recenze.

### --answer--
Ne, `address` smí obsahovat jen e-mail, ne ulici.

#### --why--
Poštovní adresa v `address` být smí, když jde o kontakt na autora. Rozhoduje, čí je, ne jaký má tvar.

### --see--
html-zaklady/semanticka-struktura#obsah-s-vyznamem-time-address-blockquote-a-cite

## --question--

Stránka má nadpisy v tomhle pořadí: `h1`, `h2`, `h3`, `h2`, `h4`. Který nadpis rozbíjí osnovu? Napiš ho.

### --expected--
h4

### --why--
Po `h2` smí přijít `h3`, ne rovnou `h4`. Návrat z `h3` zpátky na `h2` je v pořádku — směrem nahoru se přeskakovat smí.

### --see--
html-zaklady/semanticka-struktura#osnova-nadpisu
