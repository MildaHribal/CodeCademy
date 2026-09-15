---
pass: 0.8
---

# --questions--

## --question--

Seznam má `.list { position: relative; }`. Každá položka má `.item { position: sticky; top: 0; }` a v ní je bublina s nápovědou `.tooltip { position: absolute; top: 100%; left: 0; }`. Od kterého prvku se měří `top: 100%` bubliny?

### --answer--

Od seznamu `.list`, protože má `position: relative`.

#### --why--

Myslíš si, že opěrný bod pro `absolute` dělá jen `relative`? Projdi si ještě jednou, které hodnoty `position` dělají z prvku pozicovaný prvek — a který z předků bubliny je nejblíž.

### --correct--

Od položky `.item`, protože i `sticky` je pozicovaný prvek.

#### --why--

`sticky` je pozicovaná hodnota stejně jako `relative`, `absolute` a `fixed`. Položka je nejbližší pozicovaný předek, takže `top: 100%` je výška položky a bublina začne pod ní.

### --answer--

Od okna, protože `sticky` se lepí k oknu.

#### --why--

Kam se lepí sám sticky prvek, nerozhoduje o tom, od čeho se měří jeho potomci. Rozhoduje, jestli je předek pozicovaný.

### --see--

css-pozicovani/position#absolute-a-obsahujici-blok

## --question--

Úvodní fotka `.hero` má `position: relative`, obsah široký 800 px a žádný padding. Nadpis v ní má `position: absolute; left: 10%; right: 10%;` a žádnou šířku. Jak široký bude nadpis v px?

### --expected--

640

### --accept--

640 px
640px

### --why--

Procenta v `left` a `right` se počítají ze šířky obsahujícího bloku: 10 % z 800 px je 80 px z každé strany. Nadpis bez šířky se roztáhne mezi ně: 800 − 80 − 80 = 640 px.

### --see--

css-pozicovani/position#inset-roztazeni-a-velikost

## --question--

Na stránce jsou vedle sebe dvě komponenty a obě mají `isolation: isolate`. V první (v HTML dřív) je rozbalená nabídka se `z-index: 50`, která přečnívá přes druhou komponentu. Ve druhé je obrázek s `position: relative; z-index: 10`. Co bude navrchu tam, kde se překrývají? Napiš „nabídka", nebo „obrázek".

### --expected-- ignore-case

obrázek

### --accept--

obrazek

### --why--

Obě komponenty zakládají stacking context se `z-index: auto`, takže se na úrovni stránky porovnávají jako celky a rozhoduje pořadí v HTML. Druhá komponenta je později a je i s obrázkem nad první komponentou včetně nabídky. Čísla 50 a 10 se nikdy nepotkají.

### --see--

css-pozicovani/stacking-context#proc-se-prvek-nedostane-nad-sourozence-rodice

## --question--

Které z těchto pravidel založí na prvku stacking context? Vyber všechna.

### --correct--

`.header { position: sticky; top: 0; }`

#### --why--

`sticky` (stejně jako `fixed`) zakládá kontext vždycky, i bez `z-index`.

### --answer--

`.card { opacity: 1; }`

#### --why--

Kontext zakládá průhlednost **menší** než 1. Hodnota 1 je výchozí a nic nemění.

### --correct--

`.badge { translate: 0 0; }`

#### --why--

Jakákoli hodnota `translate` jiná než `none` zakládá kontext, i když prvek vůbec neposune.

### --answer--

`.panel { position: relative; z-index: auto; }`

#### --why--

Pozicovaný prvek zakládá kontext až s číselným `z-index`. S `auto` se jen kreslí mezi pozicovanými prvky.

### --correct--

`.avatar { z-index: 1; }` u položky flex kontejneru

#### --why--

Položka flexboxu nebo gridu s číselným `z-index` zakládá kontext i bez `position`.

### --see--

css-pozicovani/stacking-context#co-zaklada-stacking-context

## --question--

Hlavička `<header class="site-header">` má `position: sticky; top: 0;`. Kolega ji v HTML obalil do `<div class="header-wrap">`, který obsahuje jen hlavičku a nemá žádné styly. Stránka je dlouhá. Co udělá hlavička při rolování?

### --answer--

Přilepí se k horní hraně okna jako dřív.

#### --why--

Myslíš si, že sticky prvek se může lepit kdekoli na stránce? Nesmí opustit svého rodiče — a jaký rodič je teď, to je podstatné.

### --correct--

Odjede s obalem, protože obal je stejně vysoký jako ona a nemá kam se v něm posunout.

#### --why--

Sticky prvek se lepí jen v rámci svého rodiče. Obal obsahuje jen hlavičku, takže je stejně vysoký a hlavička v něm nemá žádné místo, kam by se při rolování posunula. Obal je potřeba zrušit, nebo dát `position: sticky` jemu.

### --answer--

Přilepí se, ale zajede pod obsah, protože obal nemá `z-index`.

#### --why--

`z-index` řeší, co je navrchu, ne jestli se prvek lepí.

### --see--

css-pozicovani/position#sticky-lepi-se-dokud-muze

## --question--

Oznámení je `<div id="saved" popover="manual">`. V oznámení je tlačítko, které ho má jen zavírat a nikdy neotevírat. Napiš hodnotu atributu `popovertargetaction` pro to tlačítko.

### --expected--

hide

### --why--

`popovertargetaction` má hodnoty `toggle` (výchozí), `show` a `hide`. Manuální popover se sám nezavře kliknutím mimo, takže tlačítko s `hide` je jediná cesta ven bez JavaScriptu.

### --see--

css-pozicovani/top-layer-a-kotveni#auto-a-manual

## --question--

Na stránce kola je tlačítko „Vybrat velikost rámu", které rozbalí mřížku velikostí S až XL. Uživatel si má velikost vybrat, ale smí kliknout i jinam do stránky a výběr tím zavřít. Co použiješ?

### --correct--

Prvek s atributem `popover` (hodnota `auto`) a tlačítko s `popovertarget`.

#### --why--

Výběr, který se zavře kliknutím mimo a nechá stránku aktivní, je přesně chování popoveru `auto`.

### --answer--

Modální `<dialog>`, aby výběr ležel v top layer.

#### --why--

V top layer je popover taky. Modální dialog by navíc zablokoval stránku a kliknutím mimo by se nezavřel — pro rychlý výběr velikosti je to zbytečně těžké.

### --answer--

`<div>` s `position: absolute` a `z-index: 9999`.

#### --why--

Takový výběr ořízne `overflow` předka a uvězní stacking context předka. Zavírání kliknutím mimo by navíc musel obstarat JavaScript.

### --see--

css-pozicovani/top-layer-a-kotveni#dialog-pro-modalni-okna

## --question--

Kotva je 80 × 32 px s levým horním rohem na souřadnicích 600 × 100 px. Prvek vysoký 40 px má `position-area: top span-right` a `margin: 0`. Na jaké svislé souřadnici (v px) bude jeho horní hrana?

### --expected--

60

### --accept--

60 px
60px

### --why--

Buňka `top` končí u horní hrany kotvy a prvek se v ní zarovná ke kotvě, dolů: jeho spodní hrana bude na 100 px a horní na 100 − 40 = 60 px. `span-right` jen určuje, že vodorovně začne u levé hrany kotvy (600 px) a poroste doprava.

### --see--

css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

## --question--

Tooltip má `position-area: right` a `position-try-fallbacks: flip-inline`. Ikona, ke které je ukotvený, leží uprostřed široké obrazovky a vpravo od ní je spousta místa. Na které straně ikony bude tooltip? Napiš „vpravo", nebo „vlevo".

### --expected-- ignore-case

vpravo

### --why--

Záložní poloha není druhá poloha, která platí vždycky. Prohlížeč ji zkusí, jen když by se prvek do původní polohy nevešel. Vpravo je místa dost, takže `flip-inline` se nepoužije.

### --see--

css-pozicovani/top-layer-a-kotveni#zalozni-polohy-position-try-fallbacks

## --question--

Najdi v MDN stránku vlastnosti `position-visibility`. Napiš hodnotu, která ukotvený prvek skryje, jakmile by začal přetékat ze svého obsahujícího bloku nebo z okna.

### --expected--

no-overflow

### --why--

`position-visibility: no-overflow` prvek schová, místo aby přetekl. Hodí se u tooltipů, které nemají žádnou vhodnou záložní polohu. Výchozí hodnota `anchors-visible` schová prvek, když zmizí jeho kotva.

### --see--

css-pozicovani/top-layer-a-kotveni#zalozni-polohy-position-try-fallbacks

## --question--

Stránka článku má `.layout { display: flex; gap: 2rem; }` s článkem a bočním panelem `.aside { position: sticky; top: 1rem; }`. Článek je mnohem delší než panel. Panel se při rolování nelepí. Proč?

### --answer--

Sticky ve flexboxu nefunguje, na to je potřeba grid.

#### --why--

Sticky funguje ve flexboxu i v gridu. Problém je ve výšce panelu, ne v typu rozvržení.

### --correct--

Flex položky se ve výchozím stavu roztahují na výšku řádku, takže panel je stejně vysoký jako článek a nemá kam jet.

#### --why--

`align-items` je ve výchozím stavu `stretch`. Panel je proto vysoký jako celý řádek flex kontejneru a jeho rodič mu nenechává žádné místo, ve kterém by se mohl posunout. Stačí zarovnat panel k začátku vedlejší osy.

### --answer--

Chybí `z-index`, panel zajel pod článek.

#### --why--

Panel a článek se vedle sebe nepřekrývají a `z-index` o lepení nerozhoduje.

### --see--

css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose
css-pozicovani/position#typicke-chyby-a-pasti

## --question--

Pokračování předchozí otázky: napiš deklaraci pro `.aside`, po které přestane být roztažený na výšku řádku a bude vysoký jen podle svého obsahu, zarovnaný nahoru.

### --expected--

align-self: flex-start

### --accept--

align-self: start
align-self: self-start

### --why--

`align-self` přepíše zarovnání na vedlejší ose jen pro jednu položku. V řádku vede vedlejší osa shora dolů, takže `flex-start` znamená nahoru. Panel pak má vlastní výšku a v rodiči místo, kde se může lepit.

### --see--

css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose

## --question--

Přilepená hlavička je flex kontejner široký 1024 px s paddingem 24 px z každé strany a `gap: 16px`. Obsahuje logo široké 100 px, vyhledávací pole s `flex: 1` a avatar široký 40 px. Jak široké bude vyhledávací pole v px?

### --expected--

804

### --accept--

804 px
804px

### --why--

Uvnitř hlavičky zbývá 1024 − 2 × 24 = 976 px. Odečti logo, avatar a dvě mezery: 976 − 100 − 40 − 2 × 16 = 804 px. Pole s `flex: 1` začíná na nule a sebere celé volné místo.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --question--

Řádek epizody je flex kontejner: obálka, text s dlouhým názvem bez mezer (třeba adresa) a tlačítko ⋯ s nabídkou. Tlačítko ⋯ vyjelo z řádku ven doprava a nabídka se otevírá mimo obrazovku. Která oprava na obalu textu pomůže?

### --answer--

`position: relative`, aby text zůstal v řádku.

#### --why--

`position: relative` nemění rozvržení ani velikost položky, jen z ní udělá obsahující blok.

### --correct--

`min-width: 0`, aby se text směl zmenšit pod šířku nejdelšího slova.

#### --why--

Flex položka má výchozí `min-width: auto` a nezmenší se pod nejmenší šířku svého obsahu. Dlouhé slovo ji drží široko a tlačítko vytlačí z řádku. `min-width: 0` tu hranici zruší.

### --answer--

`z-index: 1`, aby tlačítko bylo nad textem.

#### --why--

Tlačítko není překryté, je vytlačené mimo řádek. `z-index` na šířky položek nemá vliv.

### --see--

css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

# --code-- Radkova stránka produktu v obchodě s koly

## --file-- shop.css

```css
/* Stránka produktu — Obchod Sedlo (Radek, verze 3) */

.shop-page {
  overflow-x: hidden;
  filter: saturate(1.05);
}

.topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  background: #fff;
}

.variants {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.variant {
  position: relative;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  transition: scale 0.2s;
}

.variant:hover {
  scale: 1.03;
}

.variant__label {
  position: absolute;
  top: 8px;
  left: 8px;
}

.variant__more {
  anchor-name: --variant-more;
}

.variant__menu {
  position-anchor: --variant-more;
  position-area: bottom span-left;
}

.size-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px;
  border: 0;
  border-radius: 8px;
}

.cart-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
}

.promo {
  position: relative;
  isolation: isolate;
}

.promo::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, #fde68a, #fca5a5);
}
```

## --file-- index.html

```html
<body>
  <div class="shop-page">
    <nav class="topnav">
      <a href="/">Sedlo</a>
      <a href="/kola">Kola</a>
      <a href="/doplnky">Doplňky</a>
    </nav>

    <main>
      <h1>Gravel Sedlo G2</h1>
      <p class="promo">Doprava zdarma do pátku</p>

      <button popovertarget="sizes">Vybrat velikost rámu</button>
      <div class="size-picker" id="sizes" popover>
        <button>S</button>
        <button>M</button>
        <button>L</button>
        <button>XL</button>
      </div>

      <ul class="variants">
        <li class="variant">
          <span class="variant__label">Skladem</span>
          <img src="g2-olive.jpg" alt="Olivová">
          <button class="variant__more" popovertarget="menu-olive">⋯</button>
          <div class="variant__menu" id="menu-olive" popover>Porovnat · Hlídat cenu</div>
        </li>
        <li class="variant">
          <img src="g2-sand.jpg" alt="Písková">
          <button class="variant__more" popovertarget="menu-sand">⋯</button>
          <div class="variant__menu" id="menu-sand" popover>Porovnat · Hlídat cenu</div>
        </li>
        <li class="variant">
          <img src="g2-night.jpg" alt="Noční modrá">
          <button class="variant__more" popovertarget="menu-night">⋯</button>
          <div class="variant__menu" id="menu-night" popover>Porovnat · Hlídat cenu</div>
        </li>
      </ul>

      <button class="cart-button">Košík (2)</button>
    </main>
  </div>
</body>
```

## --question--

Navigace `.topnav` (řádky 8–17 v `shop.css`) má být přilepená nahoře, ale při rolování odjede se stránkou. Napiš číslo řádku v `shop.css`, který lepení rozbil.

### --expected--

4

### --why--

`overflow-x: hidden` na `.shop-page` z obalu udělá posuvný kontejner (druhý směr se změní na `auto`). Navigace se lepí k němu, jenže obal sám neroluje — roluje okno. Stejné oříznutí bez rozbití lepení dá `overflow-x: clip`.

### --see--

css-pozicovani/position#sticky-lepi-se-dokud-muze

## --question--

Tlačítko košíku (řádky 61–66 v `shop.css`) má být přišpendlené v pravém dolním rohu okna. Po otevření stránky ale není vidět a najdeš ho až úplně dole pod variantami. Proč?

### --answer--

`z-index: 60` na řádku 65 je moc nízký a tlačítko zakryl obsah.

#### --why--

Tlačítko není překryté, je jinde. `z-index` rozhoduje o vrstvách, ne o tom, od čeho se `fixed` měří.

### --correct--

`filter` na řádku 5 udělal z `.shop-page` obsahující blok i pro `fixed` potomky, takže se tlačítko měří od spodní hrany obalu.

#### --why--

`filter`, `transform`, `backdrop-filter` a podobné vlastnosti na předkovi přebijí okno jako obsahující blok. Obal je vysoký jako celá stránka, a tak `bottom: 24px` znamená 24 px nad jejím koncem.

### --answer--

`overflow-x: hidden` na řádku 4 tlačítko ořízl.

#### --why--

Oříznutí by tlačítko schovalo, ale nepřesunulo by ho na konec stránky. Hledej vlastnost, která mění, od čeho se tlačítko měří.

### --see--

css-pozicovani/position#fixed-prispendlene-k-oknu

## --question--

Mřížka velikostí `#sizes` (řádky 52–59 v `shop.css`) je vidět hned po načtení a tlačítko „Vybrat velikost rámu" ji jen přebliká. Napiš selektor, kterým nahradíš selektor `.size-picker` na řádku 52, aby mřížka byla jen u otevřeného výběru.

### --expected--

.size-picker:popover-open

### --accept--

#sizes:popover-open
[popover].size-picker:popover-open
.size-picker[popover]:popover-open

### --why--

Zavřený popover schovává výchozí styl `display: none`. `display: grid` na řádku 53 ho přebil i u zavřeného výběru. S `:popover-open` platí mřížka jen pro otevřený stav.

### --see--

css-pozicovani/top-layer-a-kotveni#typicke-chyby-a-pasti

## --question--

Klikneš na ⋯ u první varianty *Olivová* (řádek 25 v `index.html`). Kde se otevře její nabídka?

### --answer--

Pod tlačítkem ⋯ olivové varianty.

#### --why--

Tak to Radek chtěl. Podívej se ale, kolik tlačítek má jméno kotvy z řádku 44 v `shop.css`.

### --correct--

Pod tlačítkem ⋯ poslední varianty *Noční modrá*.

#### --why--

Všechna tři tlačítka mají stejné `anchor-name: --variant-more`. Když jméno sdílí víc prvků, kotvou je poslední v HTML, takže se všechny nabídky přivážou k tlačítku třetí varianty.

### --answer--

Uprostřed okna, protože ukotvení se u víc stejných jmen vypne.

#### --why--

Ukotvení se nevypne, prohlížeč si z prvků se stejným jménem jeden vybere. Rozmysli si, který.

### --see--

css-pozicovani/top-layer-a-kotveni#typicke-chyby-a-pasti

## --question--

Varianta se při najetí myší zvětší (řádky 33–35 v `shop.css`), a tím dostane vlastní stacking context. Zajede otevřená nabídka varianty (řádky 47–50) pod sousední variantu?

### --answer--

Ano, `scale` uzavře nabídku do varianty a sousední varianta je v HTML později.

#### --why--

Platilo by to pro nabídku s `position: absolute`. Tahle nabídka má v HTML atribut `popover`.

### --correct--

Ne, otevřený popover se kreslí v top layer a stacking contexty předků ho neomezují.

#### --why--

Nabídky mají v `index.html` atribut `popover`. Otevřený popover se vykreslí nad celou stránkou, takže `scale` na variantě ani pořadí variant v HTML na něj nemají vliv.

### --answer--

Jen když nemá `z-index` vyšší než sousední varianta.

#### --why--

Top layer se `z-index` vůbec neřídí. Pro popover je otázka vrstev vyřešená bez něj.

### --see--

css-pozicovani/top-layer-a-kotveni#problem-nabidka-kterou-nic-neudrzi
