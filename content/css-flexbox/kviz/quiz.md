---
pass: 0.8
---

# --questions--

## --question--

Máš tenhle kód a v prohlížeči jsou položky seznamu pořád pod sebou. Proč?

```html
<nav class="menu">
  <ul>
    <li><a href="/">Domů</a></li>
    <li><a href="/blog">Blog</a></li>
  </ul>
</nav>
```

```css
.menu { display: flex; }
```

### --answer--

Protože `<li>` jsou blokové prvky a ty flexbox do řádku nepostaví.

#### --why--

Myslíš si, že flexbox rozlišuje blokové a řádkové prvky? Postaví do řádku oboje. Podmínkou je jen to, kde prvky v HTML leží.

### --correct--

Protože jediným přímým potomkem `.menu` je `<ul>`; položky `<li>` jsou vnoučata a flex se jich netýká.

#### --why--

Flex kontejner rozvrhuje jen své přímé potomky. Tady je to jediný `<ul>`. Aby byly odkazy vedle sebe, musí `display: flex` dostat `<ul>`.

### --answer--

Protože chybí `flex-direction: row`.

#### --why--

`row` je výchozí hodnota, psát ji nemusíš. Chyba je jinde než ve směru osy.

### --see--

css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky

## --question--

Kontejner má `display: flex; align-items: center;`, ale jeho položky nejsou svisle uprostřed obrazovky, jen nahoře. Kontejner nemá nastavenou výšku. Proč?

### --correct--

Kontejner je vysoký přesně jako jeho nejvyšší položka, takže na vedlejší ose není žádné volné místo, ve kterém by se dalo centrovat.

#### --why--

`align-items: center` centruje v rámci výšky kontejneru. Kontejner bez nastavené výšky je vysoký podle obsahu. Když ho chceš mít doprostřed obrazovky, musí mít výšku, třeba `min-height: 100vh`.

### --answer--

Svislé centrování dělá `justify-content: center`, ne `align-items`.

#### --why--

Myslíš si, že `justify-content` je „svislé" zarovnání? V řádku vede hlavní osa vodorovně, takže `justify-content` pracuje vodorovně.

### --answer--

`align-items` funguje jen spolu s `flex-wrap: wrap`.

#### --why--

`align-items` zarovnává položky i v jediném řádku, zalamování nepotřebuje. Hledej, jestli má kontejner na vedlejší ose vůbec kam položky posunout.

### --see--

css-flexbox/uvod-do-flexboxu#typicke-chyby-a-pasti

## --question--

Co uvidíš?

```css
.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 200px;
}
```

### --answer--

Položky budou vedle sebe vodorovně uprostřed.

#### --why--

`flex-direction: column` řadí položky pod sebe, ne vedle sebe.

### --correct--

Položky budou pod sebou a celá skupina bude svisle uprostřed kontejneru.

#### --why--

Ve sloupci vede hlavní osa shora dolů a `justify-content` rozděluje volné místo právě na ní. 200 px vysoký kontejner má volné místo, takže se skupina posune doprostřed svisle.

### --answer--

Položky budou pod sebou, každá vodorovně vycentrovaná a jen tak široká jako její obsah.

#### --why--

Myslíš si, že `justify-content` pracuje vždycky vodorovně? Ve sloupci ne. Vodorovně tu rozhoduje jiná vlastnost a její výchozí hodnota položky roztahuje.

### --see--

css-flexbox/uvod-do-flexboxu#hlavni-a-vedlejsi-osa

## --question--

Kontejner má `display: flex; flex-direction: column;` a všechny jeho položky jsou přes celou šířku. Jedna položka má být jen tak široká jako její obsah a stát u pravého okraje, ostatní se nemají změnit. Napiš deklaraci, kterou dáš té jedné položce.

### --expected--

align-self: flex-end

### --accept--

align-self: end
margin-inline-start: auto
margin-left: auto

### --why--

`align-self` přepíše zarovnání na vedlejší ose jen pro jednu položku; ve sloupci je vedlejší osa vodorovná, takže `flex-end` znamená vpravo. Automatický margin na začátku řádku udělá totéž.

### --see--

css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose

## --question--

Kontejner je široký 500 px, bez mezer. Položka A má `flex: 1 1 100px`, položka B má `flex: 4 1 100px`. Jak široká bude B?

### --expected--

340

### --accept--

340 px
340px

### --why--

Součet výchozích velikostí je 200 px, volné místo 300 px, dílů 5, jeden díl 60 px. B = 100 + 4 × 60 = 340 px, A = 160 px. Kdo napsal 400 px, dělil v poměru 1 : 4 celou šířku.

### --see--

css-flexbox/flex-do-hloubky#rust-v-cislech

## --question--

Kontejner je široký 300 px, bez mezer. Položka A má `flex: 0 1 200px`, položka B má `flex: 0 3 200px`, obě s krátkým textem. Jak široká bude B?

### --expected--

125

### --accept--

125 px
125px

### --why--

Chybí 100 px. Váhy jsou `flex-shrink` × basis: A = 1 × 200 = 200, B = 3 × 200 = 600. B nese 600/800 = tři čtvrtiny ztráty, tedy 75 px, a bude 125 px široká; A ztratí 25 px (175 px).

### --see--

css-flexbox/flex-do-hloubky#zmensovani-v-cislech

## --question--

Rozepiš `flex: none` do tří hodnot v pořadí grow, shrink, basis.

### --expected--

0 0 auto

### --accept--

flex: 0 0 auto

### --why--

`none` znamená: neroste (`0`), nezmenšuje se (`0`) a velikost bere z obsahu nebo `width` (`auto`). Hodí se pro ikonu nebo cenu, která se nikdy nemá deformovat.

### --see--

css-flexbox/flex-do-hloubky#zkratka-flex-a-jeji-vychozi-hodnoty

## --question--

Karta v řádku karet má `flex: 1 1 200px` a uvnitř nadpis s `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`. Nadpis se ale neořízne a karta je širší než ostatní. Co pomůže?

### --answer--

Dát kartě `flex-shrink: 10`.

#### --why--

Myslíš si, že karta se zmenšuje málo? Zmenšování tu nezastavuje malý `flex-shrink`, ale hranice, pod kterou karta nesmí.

### --answer--

Dát nadpisu `min-width: 0`.

#### --why--

Nadpis není flex položkou řádku karet, tou je karta. Hranice, která brání zmenšení, patří té položce, kterou flexbox rozvrhuje.

### --correct--

Dát kartě `min-width: 0`.

#### --why--

Flex položka má výchozí `min-width: auto` = nejmenší šířka obsahu. Nadpis se nesmí zalomit, takže minimum karty je šířka celého nadpisu. `min-width: 0` na kartě ji dovolí zmenšit a teprve pak má nadpis co ořezávat.

### --see--

css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

## --question--

Hlavička má `display: flex; gap: 1rem;` a položky logo, navigaci a tlačítko. Tlačítko má `margin-inline-start: auto`. Pak do hlavičky přidáš `justify-content: center`. Co se změní?

### --answer--

Všechny tři položky se přesunou doprostřed.

#### --why--

Doprostřed by se přesunuly, jen kdyby na `justify-content` zbylo nějaké volné místo. Zjisti, kdo si volné místo bere dřív.

### --correct--

Nic. Automatický margin tlačítka spotřebuje všechno volné místo dřív, než se uplatní `justify-content`.

#### --why--

Volné místo se nejdřív rozdělí mezi automatické marginy. Na `justify-content` pak nezbude nic, takže logo s navigací zůstanou vlevo a tlačítko vpravo.

### --answer--

Tlačítko zůstane vpravo a logo s navigací se vycentrují ve zbytku místa.

#### --why--

Myslíš si, že automatický margin a `justify-content` sdílejí volné místo? Nesdílejí — jeden z nich dostane všechno.

### --see--

css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou

## --question--

Ve flex kontejneru chceš na mobilu ukázat tlačítko „Koupit" nad popisem produktu. V HTML je popis před tlačítkem. Tlačítku dáš `order: -1`. Co je pravda?

### --answer--

Tlačítko bude nahoře vizuálně i pro klávesu Tab a čtečku obrazovky.

#### --why--

Myslíš si, že `order` přesouvá prvek i v dokumentu? Mění jen to, jak ho prohlížeč nakreslí.

### --correct--

Tlačítko bude nahoře jen vizuálně; klávesa Tab i čtečka obrazovky na něj narazí až po popisu.

#### --why--

Pořadí v HTML určuje, jak stránku čte čtečka a jak prochází fokus. Když má být tlačítko první i pro ně, přesuň ho v HTML.

### --answer--

`order: -1` není platná hodnota, nic se nestane.

#### --why--

Záporné hodnoty jsou platné. Položka s `order: -1` se postaví před všechny položky s výchozím `order: 0`.

### --see--

css-flexbox/uvod-do-flexboxu#typicke-chyby-a-pasti

## --question--

Karty jsou v kontejneru širokém 800 px s `display: flex; flex-wrap: wrap; gap: 16px;` a každá má `flex: 1 1 250px`. Karet je sedm. Jak široká bude sedmá karta?

### --expected--

800

### --accept--

800 px
800px

### --why--

Do řádku se vejdou tři karty (3 × 250 + 2 × 16 = 782 px), takže sedmá karta zůstane v třetím řádku sama. `flex-grow: 1` jí dá celé volné místo toho řádku a roztáhne se na všech 800 px. Ve flexboxu si každý řádek počítá volné místo sám; karty srovnané ve sloupcích by dal grid.

### --see--

css-flexbox/flex-do-hloubky#flexbox-nebo-grid

## --question--

Flex kontejner s `flex-wrap: wrap` má tři řádky položek a je vyšší, než kolik řádky zaberou. Napiš jméno vlastnosti, která rozhoduje, kam půjde volné místo **mezi řádky**.

### --expected--

align-content

### --why--

`align-content` rozděluje volné místo na vedlejší ose mezi celé řádky, podobně jako `justify-content` mezi položky na hlavní ose. `align-items` zarovnává položky uvnitř jednoho řádku.

### --see--

css-flexbox/uvod-do-flexboxu#zalamovani-flex-wrap-gap-a-align-content

## --question--

Najdi v anglické dokumentaci MDN stránku o vlastnosti `flex-flow`. Které dvě vlastnosti tahle zkratka nastavuje? Napiš jejich jména oddělená čárkou.

### --expected--

flex-direction, flex-wrap

### --accept--

flex-wrap, flex-direction
flex-direction a flex-wrap

### --why--

`flex-flow` je zkratka pro `flex-direction` a `flex-wrap`, třeba `flex-flow: row wrap`. Na MDN ji najdeš pod adresou `developer.mozilla.org/en-US/docs/Web/CSS/flex-flow` — v části „Constituent properties" jsou vždycky vypsané vlastnosti, které zkratka nastavuje.

### --see--

css-flexbox/uvod-do-flexboxu#kde-to-najdes-v-mdn

## --question--

Které z těchto rozvržení se hodí spíš pro flexbox než pro grid? (Vyber všechny správné.)

### --correct--

Lišta nástrojů s tlačítky různé šířky, kde jedno tlačítko má být u pravého okraje.

#### --why--

Jedna řada položek, jejichž šířku určuje obsah, a automatický margin — typická práce pro flexbox.

### --correct--

Seznam štítků, které se zalamují na další řádek podle délky textu.

#### --why--

Štítky nemají být ve sloupcích, jen za sebou a zalomené. Velikost určuje obsah, to je flexbox.

### --answer--

Galerie fotek, kde mají být fotky v přesných sloupcích i na posledním neúplném řádku.

#### --why--

Srovnání do sloupců přes všechny řádky je rozvržení ve dvou osách najednou.

### --answer--

Kostra stránky s hlavičkou, bočním panelem, obsahem a patičkou v mřížce.

#### --why--

Rozvržení v řádcích i sloupcích najednou je jiný typ úlohy než jedna řada položek.

### --see--

css-flexbox/flex-do-hloubky#flexbox-nebo-grid

# --code-- Kolegova stránka obchodu s deskovými hrami

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>Kostka — deskové hry</title>
  <link rel="stylesheet" href="shop.css">
</head>
<body>
  <div class="bar">
    <a class="bar-brand" href="/">Kostka</a>
    <a href="/novinky">Novinky</a>
    <a href="/akce">Akce</a>
    <a class="bar-cart" href="/kosik">Košík (2)</a>
  </div>

  <ul class="chips">
    <li>Pro dva</li>
    <li>Rodinné</li>
    <li>Strategické</li>
    <li>Party hry</li>
    <li>Kooperativní</li>
  </ul>

  <div class="row">
    <img class="thumb" src="carcassonne.jpg" width="96" height="96" alt="">
    <div class="info">
      <h2 class="name">Carcassonne: Hostinec a katedrály, rozšíření 1 (nová verze 2026)</h2>
      <p class="meta">2–6 hráčů · 35 minut · od 7 let</p>
      <p class="desc">Rozšíření přidává hostince u cest, katedrály ve městech
        a velké figurky, které se počítají za dvě.</p>
    </div>
    <div class="buy">
      <strong class="price">549 Kč</strong>
      <button class="add">Do košíku</button>
    </div>
  </div>

  <div class="note">
    <span class="note-icon">i</span>
    <span>Objednávky nad 1 500 Kč posíláme zdarma.</span>
  </div>
</body>
</html>
```

## --file-- shop.css

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
}

img {
  max-width: 100%;
  height: auto;
}

.bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: #102a43;
}

.bar a {
  color: #f0f4f8;
}

.bar-cart {
  margin-left: auto;
}

.chips {
  display: flex;
  gap: 8px;
  max-width: 320px;
  padding: 0;
  list-style: none;
}

.chips li {
  padding: 4px 12px;
  border-radius: 999px;
  background: #d9e2ec;
  white-space: nowrap;
}

.row {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #d9e2ec;
}

.info {
  flex: 1 1 auto;
}

.name {
  margin: 0;
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.note {
  display: flex;
  gap: 8px;
  padding: 8px 20px;
}

.note-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #243b53;
  color: #fff;
  text-align: center;
}
```

## --question--

Pravidlo `.bar` (řádky 12–18 v `shop.css`) rozvrhuje logo, dva odkazy a košík, který má na řádku 25 `margin-left: auto`. Jeden řádek v pravidle `.bar` je zbytečný — když ho smažeš, lišta bude vypadat úplně stejně. Napiš jeho číslo.

### --expected--

14

### --why--

Řádek 14 je `justify-content: space-between`. Automatický margin košíku na řádku 25 si vezme všechno volné místo v liště dřív, než se uplatní `justify-content`, takže ten nemá co rozdělovat. Logo s odkazy zůstanou vlevo a košík vpravo i bez něj.

### --see--

css-flexbox/workshop-navigace/007

## --question--

Pět štítků v seznamu `.chips` (řádky 28–34, seznam má nejvýš 320 px) se do šířky nevejde. Co uvidíš?

### --answer--

Štítky se zalomí na druhý řádek.

#### --why--

Myslíš si, že flex kontejner zalamuje sám? Ve výchozím stavu drží všechny položky v jednom řádku. Podívej se, jestli pravidlo `.chips` zalamování zapíná.

### --correct--

Štítky zůstanou v jednom řádku a poslední z nich vylezou ze seznamu doprava.

#### --why--

`.chips` nemá `flex-wrap: wrap`, takže řádek je jeden. Zmenšit se štítky taky nemůžou: řádek 40 `white-space: nowrap` dělá z celého textu štítku nejmenší šířku obsahu a výchozí `min-width: auto` je pod ni nepustí. Zbytek přeteče.

### --answer--

Štítky se zmenší a text v nich se zalomí na dva řádky.

#### --why--

Zalomení textu uvnitř štítku zakazuje jeden z řádků pravidla `.chips li`. A bez zalomení nejde štítek zúžit pod šířku textu.

### --see--

css-flexbox/flex-do-hloubky#proc-se-polozka-nezmensi-min-width-auto

## --question--

Obrázek hry na řádku 25 v `index.html` má atributy 96 × 96 px, ale v prohlížeči je vyšší a zdeformovaný. Napiš deklaraci, kterou doplníš do pravidla `.row` (řádky 43–48), aby obrázek držel svůj tvar.

### --expected--

align-items: flex-start

### --accept--

align-items: start
align-items: center
align-items: flex-end
align-items: end

### --why--

Řádek 9 dává všem obrázkům `height: auto` a výchozí `align-items: stretch` pak roztáhne obrázek na výšku celého řádku s popisem. Jiné zarovnání na vedlejší ose roztahování vypne. Stejně by pomohlo `align-self: flex-start` přímo na `.thumb`.

### --see--

css-flexbox/uvod-do-flexboxu#typicke-chyby-a-pasti

## --question--

Na telefonu dlouhý název hry (řádek 27 v `index.html`) neskončí třemi tečkami, ale vytlačí cenu a tlačítko z řádku ven, přestože `.name` má `overflow: hidden` a `text-overflow: ellipsis`. Napiš deklaraci, kterou doplníš do pravidla `.info` na řádcích 50–52.

### --expected--

min-width: 0

### --accept--

min-width: 0px

### --why--

Flex položkou řádku je `.info`, ne nadpis. Její výchozí `min-width: auto` je nejmenší šířka obsahu, a to je kvůli `white-space: nowrap` na řádku 57 celý název. `min-width: 0` dovolí `.info` zmenšit se a teprve pak má nadpis co ořezávat.

### --see--

css-flexbox/workshop-navigace/017

## --question--

Kolega chtěl mít cenu a tlačítko v bloku `.buy` vycentrované **vodorovně** a napsal k tomu řádek 65 v `shop.css`. Co ten řádek ve skutečnosti dělá?

### --answer--

Vycentruje cenu a tlačítko vodorovně, jak kolega chtěl.

#### --why--

Podívej se na řádek 64. Po otočení hlavní osy pracuje `justify-content` jiným směrem než v řádku.

### --correct--

Posune cenu s tlačítkem svisle doprostřed bloku `.buy`.

#### --why--

Řádek 64 otočil hlavní osu shora dolů a `justify-content` rozděluje volné místo na hlavní ose. `.buy` je jako flex položka `.row` roztažený na výšku řádku, takže volné místo má a skupina skončí svisle uprostřed. Vodorovně by centrovalo `align-items: center`.

### --answer--

Nic, protože blok `.buy` nemá nastavenou výšku.

#### --why--

Výšku mu nastavovat nemusíš: jako flex položka řádku `.row` s výchozím `align-items: stretch` je vysoký jako celý řádek.

### --see--

css-flexbox/uvod-do-flexboxu#typicke-chyby-a-pasti
