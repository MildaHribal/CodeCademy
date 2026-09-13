---
pass: 0.8
---

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

Flexbox postaví do řádku blokové i řádkové prvky. Podmínkou je jen to, že jsou přímými potomky flex kontejneru.

### --correct--

Protože jediným přímým potomkem `.menu` je `<ul>`; položky `<li>` jsou vnoučata a flex se jich netýká.

#### --why--

Flex kontejner rozvrhuje jen své přímé potomky. Tady je to jediný `<ul>`. Aby byly odkazy vedle sebe, musí `display: flex` dostat `<ul>`.

### --answer--

Protože chybí `flex-direction: row`.

#### --why--

`row` je výchozí hodnota. Chyba je v tom, na kterém prvku je `display: flex`.

## --question--

Kontejner má `display: flex; align-items: center;`, ale jeho položky nejsou svisle uprostřed stránky, jen nahoře. Kontejner nemá nastavenou výšku. Proč?

### --correct--

Kontejner je vysoký přesně jako jeho nejvyšší položka, takže na vedlejší ose není žádné volné místo, ve kterém by se dalo centrovat.

#### --why--

`align-items: center` centruje v rámci výšky kontejneru. Blokový kontejner bez nastavené výšky je vysoký podle obsahu. Když ho chceš mít doprostřed obrazovky, musí mít kontejner výšku, třeba `min-height: 100vh`.

### --answer--

Svislé centrování dělá `justify-content: center`, ne `align-items`.

#### --why--

V řádku (výchozí `flex-direction: row`) vede hlavní osa vodorovně, takže `justify-content` centruje vodorovně. Svisle centruje `align-items` — potřebuje ale místo.

### --answer--

`align-items` funguje jen spolu s `flex-wrap: wrap`.

#### --why--

`align-items` funguje i bez zalamování. Problémem je chybějící výška kontejneru.

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

Vodorovně ve sloupci zarovnává `align-items`, které má výchozí hodnotu `stretch` — položky budou přes celou šířku.

## --question--

V řádku je `<img>` s atributy `width="80" height="80"` a vedle něj dlouhý odstavec. Kontejner má jen `display: flex; gap: 1rem;` a ve stylech webu je `img { height: auto; }`. Proč je obrázek vysoký a zdeformovaný?

### --answer--

Protože `gap` přidává místo i nad a pod položky.

#### --why--

`gap` dělá mezery mezi položkami, na jejich výšku vliv nemá.

### --answer--

Protože obrázek má `flex-shrink: 1` a zmenšuje se.

#### --why--

Zmenšování by obrázek zúžilo, ne prodloužilo. Deformaci na výšku způsobuje zarovnání na vedlejší ose.

### --correct--

Protože výchozí `align-items: stretch` roztáhne položku s výškou `auto` na výšku celého řádku, tedy na výšku odstavce.

#### --why--

Položky s automatickou výškou se v řádku natahují na výšku nejvyšší položky. Pomůže `align-items: flex-start` na kontejneru nebo `align-self: flex-start` na obrázku.

## --question--

Kontejner je široký 500 px, bez mezer. Položka A má `flex: 1 1 100px`, položka B má `flex: 4 1 100px`. Jak široké budou?

### --answer--

A 100 px, B 400 px.

#### --why--

Tak by to vyšlo, kdyby se v poměru 1 : 4 dělila celá šířka. `flex-grow` ale dělí jen volné místo.

### --correct--

A 160 px, B 340 px.

#### --why--

Součet výchozích velikostí je 200 px, volné místo 300 px, podílů 5, jeden podíl 60 px. A = 100 + 60 = 160 px, B = 100 + 240 = 340 px.

### --answer--

Obě 250 px.

#### --why--

Stejně široké by byly jen se stejným `flex-grow`. B má čtyřnásobný podíl na volném místě.

## --question--

Dvě tlačítka mají `flex: 1`. Na jednom je „OK", na druhém „Zrušit objednávku". Jak budou široká a proč?

### --correct--

Stejně široká, protože `flex: 1` znamená `1 1 0%` — obě vycházejí z nulové šířky a volné místo si dělí napůl.

#### --why--

S výchozí velikostí nula je volné místo celá šířka kontejneru a rovné podíly znamenají rovné šířky. Kdyby měla tlačítka `flex: auto`, vycházela by z šířky textu a delší text by měl širší tlačítko.

### --answer--

Tlačítko s delším textem bude širší, protože `flex: 1` znamená `1 1 auto`.

#### --why--

`1 1 auto` je zkratka `flex: auto`. Samotné `flex: 1` nastavuje `flex-basis` na `0%`.

### --answer--

Obě budou jen tak široká jako jejich text, protože `flex: 1` zakazuje růst.

#### --why--

Číslo `1` v `flex: 1` je právě `flex-grow`, růst tedy povoluje.

## --question--

Karta v řádku karet má `flex: 1 1 200px` a uvnitř nadpis s `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`. Nadpis se ale neořízne a karta je širší než ostatní. Co pomůže?

### --answer--

Dát kartě `flex-shrink: 10`.

#### --why--

Větší `flex-shrink` nepomůže — zmenšování zastavuje `min-width: auto`, ne málo velký `flex-shrink`.

### --answer--

Dát nadpisu `min-width: 0`.

#### --why--

Nadpis není flex položkou řádku karet, tou je karta. Minimum, které brání zmenšení, patří kartě.

### --correct--

Dát kartě `min-width: 0`.

#### --why--

Flex položka má výchozí `min-width: auto` = nejmenší šířka obsahu. Nadpis se nesmí zalomit, takže minimum karty je šířka celého nadpisu. `min-width: 0` na kartě ji dovolí zmenšit a teprve pak má nadpis co ořezávat.

## --question--

Kontejner je široký 300 px. Položka A má `flex: 0 1 200px`, položka B má `flex: 0 1 200px`. Obě obsahují krátký text. Jak budou široké?

### --correct--

Obě 150 px.

#### --why--

Chybí 100 px. Obě mají stejnou váhu (1 × 200), takže každá ztratí 50 px.

### --answer--

A 200 px a B 100 px, protože se zmenšuje až poslední položka.

#### --why--

Zmenšují se všechny položky s `flex-shrink` větším než nula najednou, podle vah, ne postupně od konce.

### --answer--

Obě 200 px a B přeteče, protože `flex-grow` je 0.

#### --why--

`flex-grow: 0` jen zakazuje růst. Zmenšování řídí `flex-shrink`, který je tady 1.

## --question--

Hlavička má `display: flex; gap: 1rem;` a položky logo, navigaci a tlačítko. Tlačítko má `margin-inline-start: auto`. Pak do hlavičky přidáš `justify-content: center`. Co se změní?

### --answer--

Všechny tři položky se přesunou doprostřed.

#### --why--

Doprostřed by se přesunuly, jen kdyby zbylo nějaké volné místo. To ale už spotřebovaly automatické marginy.

### --correct--

Nic. Automatický margin tlačítka spotřebuje všechno volné místo dřív, než se uplatní `justify-content`.

#### --why--

Volné místo se nejdřív rozdělí mezi automatické marginy. Na `justify-content` pak nezbude nic, takže logo s navigací zůstanou vlevo a tlačítko vpravo.

### --answer--

Tlačítko zůstane vpravo a logo s navigací se vycentrují ve zbytku místa.

#### --why--

Tohle by nastalo, kdyby automatický margin sdílel volné místo s `justify-content`. Nesdílí — margin má přednost a spotřebuje všechno.

## --question--

Ve flex kontejneru chceš na mobilu ukázat tlačítko „Koupit" nad popisem produktu. V HTML je popis před tlačítkem. Tlačítku dáš `order: -1`. Co je pravda?

### --answer--

Tlačítko bude nahoře vizuálně i pro klávesu Tab a čtečku obrazovky.

#### --why--

`order` mění jen vizuální pořadí. Tab i čtečka jdou v pořadí HTML.

### --correct--

Tlačítko bude nahoře jen vizuálně; klávesa Tab i čtečka obrazovky na něj narazí až po popisu.

#### --why--

Pořadí v HTML určuje, jak stránku čte čtečka a jak prochází fokus. Když má být tlačítko první i pro ně, přesuň ho v HTML.

### --answer--

`order: -1` není platná hodnota, nic se nestane.

#### --why--

Záporné hodnoty jsou platné. Položka s `order: -1` se postaví před všechny položky s výchozím `order: 0`.

## --question--

Karty jsou v kontejneru s `display: flex; flex-wrap: wrap; gap: 1rem;` a mají `flex: 1 1 250px`. Na obrazovce se vejdou tři do řádku a karet je sedm. Jak bude vypadat poslední řádek?

### --answer--

Sedmá karta bude stejně široká jako karty nad ní a bude vlevo.

#### --why--

Tak by to vypadalo v gridu se sloupci. Ve flexboxu si každý řádek dělí volné místo sám.

### --correct--

Sedmá karta bude sama v řádku a roztáhne se přes celou šířku.

#### --why--

`flex-grow: 1` rozdělí volné místo řádku mezi položky v tom řádku. Když je tam jen jedna, dostane všechno. Když potřebuješ karty srovnané ve sloupcích, je vhodnější grid.

### --answer--

Sedmá karta se nezobrazí, protože se do řádku nevejde.

#### --why--

`flex-wrap: wrap` přesune položku na další řádek, nic se neskrývá.

## --question--

Karta je `display: flex; flex-direction: column;` a patička karty má `margin-block-start: auto`. Karty jsou v řádku vedle sebe. Proč se patičky všech karet v řádku srovnají na jednu výšku?

### --answer--

Protože `margin-block-start: auto` nastaví všem patičkám stejnou pozici od horního okraje stránky.

#### --why--

Automatický margin nic neví o ostatních kartách. Pracuje jen s volným místem uvnitř své karty.

### --correct--

Protože kontejner karet má výchozí `align-items: stretch`, karty v řádku jsou stejně vysoké a automatický margin v každé z nich sežere volné místo nad patičkou.

#### --why--

Stretch srovná výšku karet, flex sloupec uvnitř karty a automatický margin pošlou patičku ke dnu. Když jeden článek chybí (třeba `align-items: flex-start` na kontejneru), patičky se rozjedou.

### --answer--

Protože patička má `display: flex`.

#### --why--

Na tom, kde patička v kartě leží, rozhoduje karta (její rodič), ne to, jak patička rozvrhuje vlastní obsah.

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

Srovnání do sloupců přes všechny řádky je dvourozměrné rozvržení — na to je grid.

### --answer--

Kostra stránky s hlavičkou, bočním panelem, obsahem a patičkou v mřížce.

#### --why--

Rozvržení v řádcích i sloupcích najednou je silná stránka gridu. Flexbox by potřeboval vnořené kontejnery a dopočítané šířky.
