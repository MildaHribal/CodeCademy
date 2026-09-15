## --card-- output

Napiš specificitu selektoru ve tvaru `A,B,C`.

```css
nav > a.active:focus-visible
```

### --expected--

0,2,2

### --accept--

(0,2,2)
0-2-2
0 2 2

### --why--

Třída `.active` a pseudotřída `:focus-visible` jsou ve sloupci B, typy `nav` a `a` ve sloupci C. Kombinátor `>` nepřidává nic.

### --see--

css-kaskada/kaskada#specificita-trojice-a-b-c

## --card-- output

Napiš specificitu selektoru ve tvaru `A,B,C`.

```css
#app :where(.sidebar, nav) li
```

### --expected--

1,0,1

### --accept--

(1,0,1)
1-0-1
1 0 1

### --why--

Myslíš si, že `:where()` vynuluje celý selektor? Nulu má jen to, co je uvnitř závorky. Id `#app` a typ `li` se počítají normálně.

### --see--

css-kaskada/kaskada#jak-z-valky-specificity-ven

## --card-- output

Napiš specificitu selektoru ve tvaru `A,B,C`.

```css
.form:has(input:user-invalid) .form__error
```

### --expected--

0,3,1

### --accept--

(0,3,1)
0-3-1
0 3 1

### --why--

`:has()` přebírá specificitu svého argumentu `input:user-invalid`, tedy (0, 1, 1). K tomu dvě třídy `.form` a `.form__error`.

### --see--

css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu

## --card-- output

Jakou specificitu (`A,B,C`) má vnořené pravidlo `.title`?

```css
.card,
#promo {
  .title {
    font-weight: 700;
  }
}
```

### --expected--

1,1,0

### --accept--

(1,1,0)
1-1-0
1 1 0

### --why--

Vnořené pravidlo se počítá jako `:is(.card, #promo) .title` a `:is()` vezme nejsilnější argument, id. Platí to i pro nadpisy v `.card`, kde žádné id není.

### --see--

css-kaskada/moderni-selektory#specificita-vnorenych-pravidel

## --card-- output

Jakou barvu má `<span class="tag tag--hot">`? Napiš ji tak, jak je v kódu.

```css
.tag--hot { color: orangered; }

.tag { color: slategray; }
```

### --expected--

slategray

### --why--

Obě pravidla mají jednu třídu, takže rozhodne pořadí ve zdroji a vyhraje pozdější `.tag`. Pořadí tříd v atributu `class` nehraje roli — modifikátor patří v CSS pod základní třídu.

### --see--

css-kaskada/kaskada#poradi-ve-zdroji

## --card-- output

Jakou barvu textu má tlačítko `<button class="btn">` uvnitř `<div id="app">`? Napiš ji tak, jak je v kódu.

```css
@layer theme, base;

@layer base {
  .btn { color: white; }
}

@layer theme {
  #app .btn { color: black; }
}
```

### --expected--

white

### --why--

Pořadí vrstev je `theme`, pak `base`, takže `base` je pozdější a vyhraje. Id ve vrstvě `theme` nepomůže, protože vrstvy rozhodují dřív než specificita.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --card-- output

Bude odkaz `<a class="link">` podtržený? Napiš `ano`, nebo `ne`.

```css
@layer reset {
  a { text-decoration: none !important; }
}

.link { text-decoration: underline !important; }
```

### --expected-- ignore-case

ne

### --why--

U deklarací s `!important` se pořadí obrací: důležitá deklarace ve vrstvě vyhraje i nad důležitou deklarací mimo vrstvy. Vyhraje `none` z resetu.

### --see--

css-kaskada/kaskada#important-obraci-poradi-vrstev

## --card-- output

Kolik pixelů bude řádkování odstavce s `font-size: 28px`, který vlastní `line-height` nemá?

```css
.intro {
  font-size: 14px;
  line-height: 20px;
}
```

```html
<div class="intro"><p style="font-size: 28px">Úvod</p></div>
```

### --expected--

20

### --accept--

20px
20 px

### --why--

Hodnota v pixelech se dědí tak, jak je, bez ohledu na velikost písma potomka. Proto se řádky většího písma přetnou. Bezjednotkové číslo by se vynásobilo 28 px.

### --see--

css-kaskada/dedicnost#spoctena-hodnota-a-proc-line-height-bez-jednotky

## --card-- output

Napiš selektor, který vybere galerii `.gallery`, když má aspoň šest přímých dětí.

### --expected--

.gallery:has(> :nth-child(6))

### --accept--

.gallery:has(>:nth-child(6))
.gallery:has(> *:nth-child(6))

### --why--

Kvantitní dotaz: když má galerie šesté dítě, má jich aspoň šest. `>` omezí hledání na přímé děti.

### --see--

css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu

## --card-- output

Napiš selektor pro řádek formuláře `.form-row`, ve kterém je pole s chybou až po interakci uživatele.

### --expected--

.form-row:has(:user-invalid)

### --accept--

.form-row:has(input:user-invalid)
.form-row:has(*:user-invalid)

### --why--

`:user-invalid` čeká na interakci (úprava a odchod z pole nebo pokus o odeslání) a `:has()` přenese stav pole na obal.

### --see--

css-kaskada/moderni-selektory#stav-formulare-focus-within-a-user-invalid

## --card-- output

Kolega ze Sassu napsal uvnitř `.menu` vnořené pravidlo `&__item { … }` a styl se neprojevil. Napiš selektor, který má místo toho stát jako samostatné pravidlo.

### --expected--

.menu__item

### --why--

CSS nesting neslepuje `&` s textem do jména třídy. Selektor `&__item` je neplatný a prohlížeč pravidlo zahodí. Třídu BEM piš celou.

### --see--

css-kaskada/moderni-selektory#vnorovani-css-nesting

## --card-- output

Napiš řádek, který na začátku stylů určí pořadí vrstev `reset`, `base`, `components` a `utilities` od nejslabší po nejsilnější.

### --expected--

@layer reset, base, components, utilities;

### --why--

Pořadí určuje první zmínka o vrstvě, proto řádek s pořadím patří úplně nahoru. Pozdější vrstva vyhrává nad dřívější u běžných deklarací.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --card-- output

Přepiš selektor resetu `input[type="search"]` tak, aby vybíral totéž, ale měl nulovou specificitu.

### --expected--

:where(input[type="search"])

### --accept--

:where(input[type=search])
:where(input[type='search'])

### --why--

Všechno uvnitř `:where()` má specificitu nula, takže reset přebije i obyčejné `input` nebo jedna třída. `:where(input)[type="search"]` by atributový selektor pořád počítal.

### --see--

css-kaskada/kaskada#jak-z-valky-specificity-ven

## --card-- css

Napiš deklaraci pro odkazy v tmavé patičce, díky které převezmou barvu textu patičky místo modré z prohlížeče.

### --expected--

```css
color: inherit;
```

### --accept--

```css
color: currentColor;
```

### --why--

Barvu odkazu dávají výchozí styly prohlížeče a zděděná hodnota s nimi prohraje. Pomůže jen deklarace přímo na odkazu.

### --see--

css-kaskada/dedicnost#typicke-chyby-a-pasti

## --card-- css

Utilita ve vrstvě `utilities` má zrušit svou vlastní barvu a nechat rozhodnout dřívější vrstvy. Napiš deklaraci.

### --expected--

```css
color: revert-layer;
```

### --why--

`revert-layer` zahodí deklaraci z aktuální vrstvy a použije hodnotu, kterou by prvek měl z dřívějších vrstev. `revert` by zahodil všechny autorské styly.

### --see--

css-kaskada/dedicnost#revert-layer-o-vrstvu-zpatky

## --card-- css

Nadpis `h2` má po šabloně `font-weight: 300`. Napiš deklaraci, která mu vrátí tučné písmo z výchozích stylů prohlížeče, aniž bys hodnotu psal číslem.

### --expected--

```css
font-weight: revert;
```

### --why--

`revert` vrátí hodnotu z výchozích stylů prohlížeče, a ty dávají nadpisům tučné písmo. `initial` by dalo počáteční hodnotu `normal`.

### --see--

css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert

## --card-- css

Karta `.card` má `border-radius: 1rem` a obrázek je jejím přímým dítětem. Napiš deklaraci pro obrázek, díky které převezme zaoblení karty, přestože se `border-radius` nedědí.

### --expected--

```css
border-radius: inherit;
```

### --why--

`inherit` vezme spočtenou hodnotu rodiče i u vlastnosti, která se sama nedědí. Funguje jen od přímého rodiče — obrázek zabalený ještě do `<figure>` by zdědil zaoblení `figure`, tedy nulu.

### --see--

css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert

## --card-- free

Vyjmenuj žebříček kaskády v pořadí, ve kterém prohlížeč porovnává dvě deklarace, a řekni, co se stane, když se liší hned v prvním kritériu.

### --back--

Nejdřív původ a důležitost (autorský styl nad stylem prohlížeče, `!important` nad běžnou deklarací), pak inline styl z atributu `style`, pak kaskádové vrstvy, pak specificita selektoru a nakonec pořadí ve zdroji. Rozhodne první kritérium, ve kterém se deklarace liší, a další se už neporovnávají. Proto třeba silnější selektor nepomůže proti pravidlu z pozdější vrstvy nebo proti `!important`. Soutěží jednotlivé deklarace, ne celá pravidla.

### --see--

css-kaskada/kaskada#zebricek-kaskady

## --card-- free

Tvůj styl se na stránce neprojevil. Jak v DevTools zjistíš proč?

### --back--

Prvek prozkoumám a v panelu Styles hledám svou deklaraci. Když tam pravidlo vůbec není, selektor prvek nevybírá nebo je neplatný. Když je deklarace přeškrtnutá, prohrála: nad ní najdu vítězné pravidlo a podle žebříčku kaskády určím, kde rozhodlo — vrstva, specificita (bublina u selektoru), pořadí, `!important`. V panelu Computed vidím konečnou hodnotu a odkud přišla. Opravím příčinu, ne přidáním `!important`.

### --see--

css-kaskada/kaskada#typicke-chyby-a-pasti

## --card-- free

Proč je `!important` jako rychlá oprava stylu past?

### --back--

Důležitá deklarace přeskočí skoro celý žebříček, takže ji běžná deklarace nikdy nepřebije. Kdo ji chce změnit, musí přidat vlastní `!important` a ještě silnější selektor, a tak vzniká válka vykřičníků. Ve vrstvách je to ještě horší, protože důležitá deklarace v dřívější vrstvě vyhraje nad pozdějšími. Místo toho zjistím, na kterém kritériu styl prohrál, a opravím příčinu: snížím specificitu soupeře, upravím pořadí nebo vrstvy.

### --see--

css-kaskada/kaskada#inline-styl-a-important

## --card-- free

Jak bys rozdělil CSS nového projektu do vrstev `@layer` a proč v tomhle pořadí?

### --back--

Na začátek jeden řádek s pořadím, třeba `@layer reset, base, components, utilities;`. Reset srovnává prohlížeče a má být nejslabší, `base` drží tokeny a styly prvků, `components` vzhled komponent a `utilities` malé jednoúčelové třídy, které mají vyhrát nad vším. Knihovnu nebo šablonu vložím do vlastní vrstvy na začátek, například při importu `layer(vendor)`. Uvnitř vrstvy pak píšu selektory s jednou třídou a nic nemusím přebíjet silou. Mimo vrstvy nenechám nic, protože by to přebilo i utility.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --card-- free

Převezmeš web, kde vlastní styly neustále prohrávají se starou šablonou plnou id a `!important`. Jaký bude tvůj postup?

### --back--

Nejdřív ověřím pořadí souborů, aby vlastní styly byly za šablonou. Pak šablonu vložím do nejdřívější vrstvy, takže ji přebijí všechny moje styly bez ohledu na její id selektory. Vykřičníky v šabloně odstraním, protože ve vrstvě by naopak vyhrávaly nad vším pozdějším. Vlastní styly rozdělím do vrstev komponent a utilit a zbytečné `!important` a id selektory z nich smažu. Vzhled se nemá změnit, mění se jen to, proč pravidla vyhrávají.

### --see--

css-kaskada/workshop-uklid-stylu/018

## --card-- free

Proč formulářová pole a tlačítka nemají písmo stránky, i když ho nastavíš na `body`, a jak to opravíš?

### --back--

Písmo se dědí jen tehdy, když na prvek žádná deklarace té vlastnosti nemíří. Výchozí styly prohlížeče ale polím a tlačítkům písmo nastavují (v Chromu 13,33 px Arial), a každá deklarace má přednost před zděděnou hodnotou. Pomůže deklarace přímo na prvcích: v resetu `button, input, select, textarea { font: inherit; }`. `!important` na `body` nepomůže, protože zesílí jen deklaraci na `body`, ne zděděnou hodnotu.

### --see--

css-kaskada/dedicnost#zdedena-hodnota-prohraje-s-kazdou-deklaraci

## --card-- free

Jaký je rozdíl mezi `inherit`, `initial`, `unset` a `revert`?

### --back--

`inherit` vezme hodnotu rodiče, i u vlastnosti, která se normálně nedědí. `initial` vrátí počáteční hodnotu ze specifikace CSS, která nemusí odpovídat výchozímu vzhledu — počáteční `display` je `inline` i pro `div`. `unset` se u dědičné vlastnosti chová jako `inherit` a u nedědičné jako `initial`. `revert` zahodí autorské styly a vrátí hodnotu z výchozích stylů prohlížeče; `revert-layer` zahodí jen aktuální vrstvu.

### --see--

css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert

## --card-- free

K čemu je `:has()` a co se jím dá udělat bez JavaScriptu? Uveď dva příklady.

### --back--

`:has()` vybere prvek podle toho, co obsahuje nebo co za ním následuje, takže umí stylovat rodiče podle obsahu nebo stavu potomka. Dřív to vyžadovalo skript, který přepínal třídy. Příklady: karta s obrázkem jiným rozvržením (`.card:has(img)`), obal pole zčervená při chybě (`.field:has(:user-invalid)`), karta se zaškrtnutým checkboxem zvýrazněná, nebo galerie s mnoha fotkami menšími dlaždicemi přes kvantitní dotaz. Pozor na specificitu: bere nejsilnější argument.

### --see--

css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu
