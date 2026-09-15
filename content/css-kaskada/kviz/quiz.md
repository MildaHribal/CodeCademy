---
pass: 0.8
---

# --questions--

## --question--

Styly obchodu jsou ve vrstvách, jen nadpis produktu zůstal mimo ně. Jakou barvu bude mít `<h2 class="product-title">`?

```css
@layer base, components;

h2 {
  color: #1e293b;
}

@layer components {
  #shop .product-title {
    color: #7c2d12;
  }
}
```

Nadpis leží v `<main id="shop">`.

### --answer--

`#7c2d12`, protože selektor s id a třídou je mnohem silnější než `h2`.

#### --why--

Myslíš si, že specificita rozhoduje vždycky? Porovná se, až když deklarace skončí nerozhodně na vrstvách. Tady nerozhodně neskončily.

### --correct--

`#1e293b`, protože pravidlo mimo vrstvy přebije běžné deklarace ve všech vrstvách.

#### --why--

Styl mimo vrstvy se chová jako poslední, nejsilnější vrstva. Kaskáda rozhodne na vrstvách, takže na id se vůbec nedojde. Oprava: dát `h2` do vrstvy `base`.

### --answer--

`#7c2d12`, protože vrstva `components` je v pořadí poslední.

#### --why--

Poslední je jen mezi pojmenovanými vrstvami. Styly, které v žádné vrstvě nejsou, stojí v pořadí ještě za ní.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --question--

Napiš specificitu selektoru `:is(.nav, header) a:not(.is-muted)` ve tvaru `A,B,C`.

### --expected--

0,2,1

### --accept--

(0,2,1)
0-2-1
0 2 1

### --why--

`:is(.nav, header)` má specificitu nejsilnějšího argumentu, tedy třídy (0, 1, 0). Typ `a` přidá (0, 0, 1) a `:not(.is-muted)` specificitu svého argumentu, další třídu. Celkem (0, 2, 1).

### --see--

css-kaskada/moderni-selektory#specificita-is

## --question--

Knihovna píše odkazy v článcích jako `:is(.prose) a { color: #334155; }`. Ty ve svých stylech, načtených až po knihovně, napíšeš `a { color: #0d9488; }`. Jakou barvu bude mít odkaz uvnitř `.prose`?

### --answer--

`#0d9488`, protože tvoje styly jsou v souboru později.

#### --why--

Pořadí ve zdroji rozhoduje až mezi stejně silnými selektory. Spočítej specificitu obou a porovnej ji.

### --correct--

`#334155`, protože `:is(.prose) a` má (0, 1, 1) a obyčejné `a` jen (0, 0, 1).

#### --why--

`:is()` přebírá specificitu svého argumentu, třídy. Kdyby knihovna použila `:where(.prose) a`, měla by (0, 0, 1) a tvoje pozdější pravidlo by vyhrálo.

### --answer--

`#334155`, protože styly knihoven mají přednost před vlastními.

#### --why--

Knihovna je pro prohlížeč obyčejný autorský styl jako ten tvůj. Rozhoduje specificita a pořadí, ne to, kdo pravidlo napsal.

### --see--

css-kaskada/moderni-selektory#where-stejny-vyber-nulova-specificita

## --question--

Na odstavec `<p class="note">` míří tři důležité deklarace. Jakou barvu bude mít?

```css
@layer base, utilities;

@layer base {
  p { color: red !important; }
}

@layer utilities {
  .note { color: blue !important; }
}

.note { color: green !important; }
```

### --answer--

Zelenou, protože styl mimo vrstvy je nejsilnější.

#### --why--

To platí pro běžné deklarace. U deklarací s `!important` se pořadí vrstev obrací.

### --answer--

Modrou, protože `utilities` je pozdější vrstva a `.note` silnější selektor.

#### --why--

Myslíš si, že vykřičník jen zesílí deklaraci a zbytek pravidel platí jako dřív? U důležitých deklarací jde pořadí vrstev pozpátku.

### --correct--

Červenou, protože u `!important` vyhrává nejdřívější vrstva.

#### --why--

Důležité deklarace procházejí vrstvy obráceně: nejdřív `base`, pak `utilities` a nakonec styl mimo vrstvy. Proto do resetů a základních vrstev vykřičníky nepatří — nic pozdějšího je nepřebije.

### --see--

css-kaskada/kaskada#important-obraci-poradi-vrstev

## --question--

Soubor začíná blokem `@layer utilities { … }` a teprve pod ním je řádek `@layer reset, utilities;`. Ve vrstvě `reset` je `p { color: red; }`, ve vrstvě `utilities` je `.lead { color: blue; }`. Jakou barvu má `<p class="lead">`?

### --answer--

Modrou, protože řádek s pořadím říká, že `utilities` je poslední.

#### --why--

Řádek s pořadím už vrstvu `utilities` nepřesune — ta byla zmíněná dřív, v bloku nad ním.

### --correct--

Červenou, protože pořadí vrstev určuje první zmínka a `utilities` se objevila dřív než `reset`.

#### --why--

Blok nahoře vrstvu `utilities` vytvořil jako první. `reset` přibyla až na dalším řádku, takže je pozdější a vyhraje. Řádek s pořadím patří na úplný začátek stylů.

### --answer--

Modrou, protože `.lead` je silnější selektor než `p`.

#### --why--

Specificita se porovnává až uvnitř jedné vrstvy. Tady se deklarace liší vrstvou.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --question--

Modální okno má `opacity: 0.5`. Tlačítku uvnitř dáš `opacity: 1`, aby bylo plně vidět. Bude?

### --answer--

Ano, `opacity: 1` na tlačítku přebije hodnotu zděděnou od okna.

#### --why--

Myslíš si, že se průhlednost dědí? Nedědí — tlačítko má `opacity: 1` i bez tvého pravidla.

### --correct--

Ne, prohlížeč vykreslí celé okno i s obsahem a průhledný je až výsledek.

#### --why--

`opacity` se nedědí, ale platí pro prvek i se vším, co je v něm. Když má být okno průhledné a tlačítko ne, dej průhlednost jen pozadí okna, třeba `background: rgb(255 255 255 / 0.5)`.

### --answer--

Ano, ale jen s `opacity: 1 !important`.

#### --why--

`!important` pomáhá v souboji deklarací. Tady žádný souboj není, tlačítko hodnotu 1 už má.

### --see--

css-kaskada/dedicnost#ktere-vlastnosti-se-dedi

## --question--

Prohlížeč dává nadpisům `h1` tučné písmo. Jakou číselnou tloušťku písma bude mít `<h1>` s pravidlem `h1 { font-weight: initial; }`?

### --expected--

400

### --accept--

normal

### --why--

`initial` vrací počáteční hodnotu ze specifikace CSS, ne výchozí styl prohlížeče. Počáteční `font-weight` je `normal`, tedy 400. Tučný nadpis by vrátilo `revert`.

### --see--

css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert

## --question--

Jakou barvu bude mít `<strong>` uvnitř upozornění? Napiš ji tak, jak je v kódu.

```css
strong { color: black; }

.alert { color: #b45309; }

.alert strong { color: unset; }
```

### --expected--

#b45309

### --why--

`color` se dědí, takže `unset` se u něj chová jako `inherit` a vezme barvu rodiče `.alert`. Pravidlo `strong { color: black; }` prohrálo se silnějším `.alert strong`.

### --see--

css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert

## --question--

Které seznamy vybere selektor `.steps:has(> li:nth-child(3))`?

### --answer--

Jen třetí seznam `.steps` na stránce.

#### --why--

`:nth-child()` je tu uvnitř `:has()`, takže se ptá na položky seznamu, ne na pořadí seznamů.

### --correct--

Každý seznam `.steps`, který má aspoň tři přímé položky.

#### --why--

Když seznam má třetí dítě `li`, má jich aspoň tři. To je kvantitní dotaz: styl kontejneru podle počtu položek, bez JavaScriptu.

### --answer--

Třetí položku v každém seznamu `.steps`.

#### --why--

Selektor končí `.steps:has(…)`, takže vybírá seznam. Třetí položku by vybralo `.steps > li:nth-child(3)`.

### --see--

css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu

## --question--

Uživatel otevře registraci, nic nevyplní a rovnou klikne na **Registrovat**. Která pole začnou odpovídat `:user-invalid`?

### --answer--

Žádná, protože do nich uživatel nic nenapsal.

#### --why--

Psaní do pole je jen jedna z interakcí. Pokus o odeslání formuláře se počítá taky.

### --correct--

Povinná pole, která zůstala prázdná nebo mají neplatnou hodnotu.

#### --why--

Pokus o odeslání je interakce uživatele, takže `:user-invalid` začne platit pro všechna chybná pole najednou. Nepovinné prázdné pole chybné není.

### --answer--

Všechna pole formuláře, protože se formulář nepodařilo odeslat.

#### --why--

`:user-invalid` hodnotí každé pole zvlášť. Pole bez chyby mezi ně nepatří, ani když formulář neprošel.

### --see--

css-kaskada/moderni-selektory#stav-formulare-focus-within-a-user-invalid

## --question--

Najdi v MDN stránku vlastnosti `cursor` a v tabulce *Formal definition* zjisti, jestli se dědí. Napiš `ano`, nebo `ne`.

### --expected-- ignore-case

ano

### --accept--

yes

### --why--

V řádku *Inherited* je `yes`. Proto stačí dát `cursor: pointer` na `label` a ukazatel má i text uvnitř. U každé vlastnosti v MDN tenhle řádek najdeš a nemusíš si dědičnost pamatovat.

### --see--

css-kaskada/dedicnost#ktere-vlastnosti-se-dedi

## --question--

Jakou barvu bude mít cena? Napiš ji tak, jak je v kódu.

```css
.price {
  color: #15803d;
  color: #12345;
}
```

### --expected--

#15803d

### --why--

`#12345` není platná barva (pět číslic neodpovídá žádnému zápisu). Prohlížeč takovou deklaraci zahodí, jako by v souboru nebyla, a v kaskádě se neúčastní. Platí proto předchozí zelená.

### --see--

css-zaklady/jak-css-funguje

## --question--

V panelu Styles v DevTools je u odkazu deklarace `color: #0d9488` přeškrtnutá a nemá u sebe žádnou ikonu varování. Co to znamená?

### --answer--

Deklarace je neplatná a prohlížeč jí nerozumí.

#### --why--

Neplatnou deklaraci DevTools sice taky přeškrtnou, ale přidají k ní žlutou ikonu varování. Tahle ikonu nemá, takže je platná.

### --correct--

Na stejnou vlastnost míří jiná deklarace, která v kaskádě vyhrála.

#### --why--

Přeškrtnutá deklarace prohrála. Vítěze najdeš výš v panelu Styles a v panelu Computed uvidíš, odkud hodnota přišla — pak víš, které kritérium kaskády rozhodlo.

### --answer--

Pravidlo se na odkaz nevztahuje, protože selektor ho nevybírá.

#### --why--

Pravidlo, které prvek nevybere, v panelu Styles u toho prvku vůbec není.

### --see--

css-zaklady/devtools-pro-css

## --question--

Tlačítko `.button` je uvnitř `<section class="dark">`. Jakou barvu bude mít jeho pozadí? Napiš hodnotu tak, jak je v kódu.

```css
:root { --accent: #4f46e5; }

.dark { --accent: #facc15; }

.button { background: var(--accent); }
```

### --expected--

#facc15

### --why--

Vlastní vlastnosti se dědí jako každá jiná dědičná vlastnost. `.dark` přepíše `--accent` pro celý svůj podstrom, takže tlačítko uvnitř dostane žlutou. Mimo `.dark` by zůstala fialová z `:root`.

### --see--

css-zaklady/vlastni-vlastnosti

## --question--

Karta má uvnitř nejdřív `<h2>` a pod ním `<p class="card__text">`. Obarví se odstavec pravidlem `.card__text:first-child { color: red; }`?

### --answer--

Ano, je to první odstavec s třídou `card__text`.

#### --why--

Myslíš si, že `:first-child` hledá první prvek, který odpovídá zbytku selektoru? Ptá se jen, jestli je prvek prvním dítětem svého rodiče.

### --correct--

Ne, prvním dítětem karty je `<h2>`.

#### --why--

`:first-child` platí jen pro prvek, který je v rodiči úplně první. Odstavec je druhý, takže selektor nevybere nic.

### --see--

css-zaklady/selektory-zaklad

# --code-- Styly antikvariátu U Zeleného stromu

## --file-- bookshop.css

```css
/* Antikvariát U Zeleného stromu — hlavní styly */
@layer generic, elements, components, utilities;

@layer generic {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  img {
    display: block;
    max-width: 100% !important;
  }

  :where(ul[role="list"]) {
    margin: 0;
    padding: 0;
    list-style: none;
  }
}

@layer elements {
  html {
    color: #1c1917;
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.5;
  }

  a {
    color: #9a3412;
  }

  button,
  input {
    font: inherit;
  }
}

@layer components {
  .c-book {
    display: grid;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e7e5e4;
    border-radius: 0.5rem;
    color: #57534e;
  }

  .c-book__cover {
    max-width: 8rem;
  }

  .c-book__title {
    margin: 0;
    font-size: 1.125rem;
    color: #292524;
  }

  #bestsellers .c-book__title {
    color: #0369a1;
  }

  .c-book__price {
    font-weight: 700;
  }

  .c-book--sale .c-book__price {
    color: #b91c1c;
  }

  .c-btn {
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 999px;
    background: #1c1917;
    color: #fafaf9;
  }

  .c-btn:hover {
    background: #44403c;
  }
}

@layer utilities {
  .u-text-muted {
    color: #78716c;
  }

  .u-hidden {
    display: none;
  }
}

/* Hodnocení hvězdičkami — vložil plugin e-shopu */
.rating a {
  color: #ca8a04;
  text-decoration: none;
}

.c-book__price {
  color: #15803d;
}
```

## --question--

Hodnocení knihy je `<p class="rating"><a class="u-text-muted" href="#recenze">4,8 z 5</a></p>`. Jakou barvu bude mít odkaz? Napiš ji tak, jak je v `bookshop.css`.

### --expected--

#ca8a04

### --why--

Utilita `.u-text-muted` na řádku 86 je ve vrstvě `utilities`, ale pravidlo pluginu `.rating a` na řádku 96 v žádné vrstvě není. Styl mimo vrstvy přebije běžné deklarace ve všech vrstvách, takže vyhraje žlutá.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --question--

Obálka knihy `<img class="c-book__cover">` má podle řádku 51 být nejvýš 8rem široká. Velká fotka obálky je ale široká jako celá karta. Proč?

### --answer--

Řádek 51 prohrál se specificitou selektoru `img` na řádku 11.

#### --why--

`img` má (0, 0, 1) a `.c-book__cover` (0, 1, 0), takže specificita by naopak vyhrála pro řádek 51. O výsledku rozhodlo něco dřív.

### --correct--

Řádek 13 má `!important` ve vrstvě `generic` a důležitá deklarace přebije běžnou deklaraci z pozdější vrstvy.

#### --why--

Důležitost je v žebříčku kaskády první. `max-width: 100% !important` vyhraje nad běžným `max-width: 8rem` bez ohledu na vrstvy i specificitu. Oprava: smazat `!important` na řádku 13.

### --answer--

Vrstva `components` je v pořadí před vrstvou `generic`.

#### --why--

Řádek 2 dává `generic` na první místo a `components` za ni. Pořadí vrstev je v pořádku.

### --see--

css-kaskada/kaskada#inline-styl-a-important

## --question--

V sekci `<section id="bestsellers">` je karta s nadpisem `<h3 class="c-book__title u-text-muted">`. Jakou barvu bude mít nadpis? Napiš ji tak, jak je v `bookshop.css`.

### --expected--

#78716c

### --why--

Řádek 60 má id a porazí pravidlo na řádku 54, ale obojí je ve vrstvě `components`. Utilita na řádku 86 je v pozdější vrstvě `utilities`, takže vyhraje bez ohledu na id.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --question--

Karta ve výprodeji `<article class="c-book c-book--sale">` obsahuje `<p class="c-book__price">249 Kč</p>`. Autor stylů chtěl červenou cenu. Jakou barvu cena opravdu má? Napiš ji tak, jak je v `bookshop.css`.

### --expected--

#15803d

### --why--

Řádek 68 má dvě třídy, ale leží ve vrstvě `components`. Pravidlo `.c-book__price` na řádku 101 má jen jednu třídu, jenže je mimo vrstvy — a na vrstvách se rozhodne dřív než na specificitě.

### --see--

css-kaskada/kaskada#zebricek-kaskady

## --question--

Jméno autora `<p class="c-book__author">` uvnitř karty `.c-book` nemá v `bookshop.css` žádné vlastní pravidlo. Jakou barvu textu bude mít? Napiš ji tak, jak je v souboru.

### --expected--

#57534e

### --why--

Na odstavec žádná deklarace `color` nemíří, takže zdědí barvu nejbližšího předka, který ji má. Tím je karta `.c-book` s barvou z řádku 47. Barva z `html` na řádku 25 by se uplatnila jen tehdy, kdyby ji karta nepřepsala.

### --see--

css-kaskada/dedicnost#zdedena-hodnota-prohraje-s-kazdou-deklaraci
