---
pass: 0.8
---

# --questions--

## --question--

Kolega „opravil" příliš malé odsazení úvodu na počítači. Na konec souboru, pod všechny media dotazy, přidal jedno pravidlo. Kolik pixelů bude mít úvod vnitřní odsazení nahoře v okně širokém 1024 px? Napiš jen číslo.

```css
.hero {
  padding-block: 1rem;
}

@media (width >= 48rem) {
  .hero {
    padding-block: 3rem;
  }
}

/* úprava od kolegy */
.hero {
  padding-block: 2rem;
}
```

### --expected--

32

### --accept--

32 px
32px

### --why--

V okně 1024 px platí všechna tři pravidla a všechna mají selektor `.hero`. Media dotaz specificitu nepřidává, takže vyhraje poslední pravidlo v souboru: 2rem = 32 px. Kolegova úprava tím zrušila i odsazení z media dotazu. Správně patří změna do základního pravidla nahoře nebo dovnitř media dotazu.

### --see--

css-responzivita/mobile-first#poradi-rozhoduje-media-dotaz-nepridava-silu

## --question--

Perex článku má `font-size: clamp(1.25rem, 0.5rem + 2.5vw, 2rem)`. Kolik pixelů bude mít v okně širokém 800 px? Napiš jen číslo.

### --expected--

28

### --accept--

28 px
28px

### --why--

Preferovaná hodnota je 0.5rem + 2.5vw = 8 + 0.025 × 800 = 8 + 20 = 28 px. Minimum je 20 px a maximum 32 px, takže platí 28 px.

### --see--

css-responzivita/mobile-first#plynule-velikosti-clamp

## --question--

Napiš podmínku media dotazu v syntaxi rozsahů, která platí pro okna od 40rem včetně do 64rem, ale na přesně 64rem už ne.

### --expected--

(40rem <= width < 64rem)

### --accept--

40rem <= width < 64rem
(width >= 40rem) and (width < 64rem)

### --why--

Oboustranný rozsah se čte jako matematická nerovnost: `40rem <= width` hranici zahrnuje, `width < 64rem` ji vylučuje. Se starším `max-width: 64rem` by pravidlo platilo i na přesně 1024 px a mohlo by se překrýt s dotazem `min-width: 64rem`.

### --see--

css-responzivita/mobile-first#media-dotaz-a-syntaxe-rozsahu

## --question--

Galerie ukazuje náhledy přes celou šířku telefonu a od 60rem ve třech sloupcích. Obrázky mají `sizes="100vw, (width >= 60rem) 33vw"`. Co je špatně?

### --answer--

Nic, prohlížeč si z obou hodnot vybere tu menší.

#### --why--

Myslíš si, že prohlížeč hodnoty v `sizes` porovnává? Čte je zleva a použije první, která pro okno platí.

### --correct--

Hodnota bez podmínky je první, takže platí vždycky a prohlížeč i na počítači stáhne soubor pro celé okno.

#### --why--

`sizes` se čte zleva a použije se první položka, jejíž podmínka platí. Položka bez podmínky platí vždy, proto patří na konec: `(width >= 60rem) 33vw, 100vw`.

### --answer--

Podmínky v `sizes` se musí psát přes `min-width`, syntaxi rozsahů `sizes` nezná.

#### --why--

`sizes` přijímá stejné podmínky jako media dotazy, včetně syntaxe rozsahů. Chyba je jinde.

### --see--

css-responzivita/mobile-first#obrazky-srcset-a-sizes

## --question--

Karta produktu je v HTML zabalená v `<li>` a CSS obsahuje jen tohle. Žádný prvek na stránce nemá `container-type`. Co udělá karta v obsahu širokém 800 px?

```css
.product {
  display: grid;
  gap: 1rem;
}

@container (width >= 30rem) {
  .product {
    grid-template-columns: 10rem 1fr;
  }
}
```

### --answer--

Bude vodorovná, protože bez kontejneru se `@container` ptá okna.

#### --why--

Myslíš si, že se `@container` bez kontejneru chová jako media dotaz? Jednotky `cqi` bez kontejneru opravdu berou míru z okna, ale podmínka `@container` potřebuje kontejner, kterého by se zeptala.

### --correct--

Zůstane svislá na každé šířce, protože podmínka nemá kontejner, kterého by se zeptala, a neplatí.

#### --why--

Bez předka s `container-type` se podmínka nemá na co ptát a pravidla uvnitř se nepoužijí. Obal karty `<li>` potřebuje `container-type: inline-size`.

### --answer--

Stránka ohlásí chybu a karta se nezobrazí.

#### --why--

CSS chyby nehlásí a nezobrazení karty by nic nevysvětlilo. Pravidla, jejichž podmínka neplatí, se prostě nepoužijí.

### --see--

css-responzivita/container-queries#kontejner-container-type-a-container

## --question--

Obal galerie `.gallery` je kontejner široký 900 px. Mezera mezi fotkami je `gap: calc(2cqi + 4px)`. Kolik pixelů je mezera? Napiš jen číslo.

### --expected--

22

### --accept--

22 px
22px

### --why--

`1cqi` je 1 % šířky nejbližšího kontejneru: 2 × 9 = 18 px, k tomu 4 px, celkem 22 px. Když obal galerie zúžíš, mezera se zmenší s ním, na okně nezáleží.

### --see--

css-responzivita/container-queries#jednotky-kontejneru-cqi

## --question--

Stránka má tmavé tokeny jen v `@media (prefers-color-scheme: dark) { :root { … } }`. Ruční přepínač při volbě „Světlý" nastaví `:root[data-theme="light"] { color-scheme: light; }`. Uživatel má tmavý systém a zvolí „Světlý". Jak bude stránka vypadat?

### --answer--

Celá světlá, protože `color-scheme: light` vypne tmavý media dotaz.

#### --why--

Myslíš si, že `color-scheme` ovlivňuje media dotaz `prefers-color-scheme`? Ten se ptá systému a na styly stránky se neohlíží.

### --correct--

Barvy z tokenů zůstanou tmavé, jen pole formulářů a posuvníky budou světlé.

#### --why--

Media dotaz dál platí, protože systém je tmavý, a tokeny v něm přepíšou světlé hodnoty. `color-scheme: light` změní jen to, co kreslí prohlížeč. Pomůže `:root:not([data-theme="light"])` uvnitř media dotazu, nebo tokeny s `light-dark()`.

### --answer--

Celá tmavá, včetně polí formulářů, protože systém má přednost před stránkou.

#### --why--

Pole formulářů se řídí použitým `color-scheme` a to přepínač nastavil na `light`. Tmavé zůstane něco jiného.

### --see--

css-responzivita/preference-uzivatele#rucni-prepinac-motivu

## --question--

Galerie fotek má tohle CSS. Co uvidí uživatel, který si galerii otevře na telefonu a ovládá ho prstem?

```css
.photo__caption {
  position: absolute;
  inset: auto 0 0;
}

@media (hover: hover) {
  .photo__caption {
    opacity: 0;
  }

  .photo:hover .photo__caption {
    opacity: 1;
  }
}
```

### --answer--

Popisky nikdy, protože na telefonu nejde na fotku najet myší.

#### --why--

Myslíš si, že skrytí popisku platí vždycky? Stojí uvnitř media dotazu a ten se ptá, jestli hlavní ovládání umí najet nad prvek.

### --correct--

Popisky u všech fotek pořád, bez klepání.

#### --why--

Prst najet nad prvek neumí, takže `(hover: hover)` na telefonu neplatí a pravidlo s `opacity: 0` se nepoužije. Popisky zůstanou vidět. S myší je popisek skrytý a ukáže se při najetí.

### --answer--

Popisek se ukáže až po klepnutí na fotku a pak zůstane viset.

#### --why--

Tak by to dopadlo, kdyby skrytí a `:hover` stály mimo media dotaz. Tady se na telefonu nepoužije ani jedno.

### --see--

css-responzivita/preference-uzivatele#mys-nebo-prst-hover-a-pointer

## --question--

Najdi v anglické dokumentaci MDN (stránka o jednotkách container queries): která jednotka je 1 % **menšího** z rozměrů kontejneru, šířky, nebo výšky? Napiš její název.

### --expected-- ignore-case

cqmin

### --why--

`cqmin` je menší z hodnot `cqi` a `cqb`, `cqmax` větší. Pro rozměr na výšku (`cqb`, `cqh`) musí mít kontejner `container-type: size`, jinak se počítá z okna. Najdeš je v MDN v části *Container query length units*.

### --see--

css-responzivita/container-queries#jednotky-kontejneru-cqi

## --question--

Mřížka karet má `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` a `gap: 16px`. Kontejner je široký 700 px. Kolik sloupců vznikne? Napiš jen číslo.

### --expected--

3

### --accept--

tři

### --why--

Každý další sloupec potřebuje 200 px a jednu mezeru 16 px. Tři sloupce zaberou 3 × 200 + 2 × 16 = 632 px, čtyři by potřebovaly 848 px. Vzniknou tři a zbylých 68 px rozdělí `1fr` mezi ně. Proto taková mřížka media dotaz nepotřebuje.

### --see--

css-grid/mrizka-bez-media-queries#jak-prohlizec-spocita-pocet-sloupcu

## --question--

Stránka dokumentace je na telefonu mřížka `grid-template-columns: 1fr`. V článku je blok `<pre>` s dlouhým řádkem kódu a `overflow-x: auto`, a přesto jde celá stránka posouvat do strany. Napiš hodnotu `grid-template-columns`, která to opraví a nechá jeden sloupec.

### --expected--

minmax(0, 1fr)

### --accept--

minmax(0,1fr)
minmax(0px, 1fr)

### --why--

`1fr` je `minmax(auto, 1fr)` a minimum `auto` je nejmenší šířka obsahu, tedy celý dlouhý řádek kódu. Sloupec se roztáhne a `overflow-x: auto` na `<pre>` nemá co posouvat. S minimem nula zůstane sloupec široký jako okno a posouvá se jen blok kódu.

### --see--

css-grid/uvod-do-gridu#typicke-chyby-a-pasti

## --question--

Aby na telefonu nešla stránka posouvat do strany, kolega dal obalu celé stránky `.wrapper { overflow-x: hidden; }`. Od té doby se přilepená hlavička (`position: sticky; top: 0`) uvnitř obalu nelepí. Proč?

### --answer--

`overflow-x: hidden` skryje hlavičku, když se stránka posune.

#### --why--

Hlavička zůstane vidět, jen odjede se stránkou. Hledej, vůči čemu se teď lepí.

### --correct--

Obal se tím stal posuvným kontejnerem a hlavička se lepí k němu, jenže obal sám neroluje, roluje okno.

#### --why--

`overflow` jiné než `visible` (i jen na ose x) udělá z předka posuvný kontejner a sticky prvek se lepí k nejbližšímu z nich. Ořezat přetečení bez posuvného kontejneru umí `overflow-x: clip`.

### --answer--

`sticky` na telefonu nefunguje, prohlížeče ho na úzkých oknech vypínají.

#### --why--

`sticky` funguje na každé šířce. Změnilo se CSS předka, ne šířka okna.

### --see--

css-pozicovani/position#typicke-chyby-a-pasti

## --question--

Mobilní menu má `position: fixed; z-index: 100` a je uvnitř hlavičky s `position: sticky; top: 0; z-index: 10`. Úvodní blok `.hero` pod hlavičkou má `position: relative; z-index: 20`. Menu se otevře **pod** úvodním blokem. Proč?

### --answer--

`position: fixed` ignoruje `z-index`.

#### --why--

Pozicovaný prvek `z-index` respektuje. Problém je v tom, s čím se jeho číslo porovnává.

### --correct--

Hlavička se `sticky` zakládá vlastní stacking context, a menu tak soupeří s `.hero` jen číslem hlavičky 10, které je menší než 20.

#### --why--

`z-index: 100` platí jen uvnitř kontextu hlavičky. Navenek se celá hlavička i s menu vykreslí jako jedna vrstva se `z-index: 10`, a ta prohraje s 20. Pomůže zvýšit `z-index` hlavičky nebo menu přesunout mimo ni.

### --answer--

`z-index: 100` je příliš malé, pomohlo by `z-index: 9999`.

#### --why--

Jakékoli číslo uvnitř kontextu hlavičky zůstane uvnitř něj. Vyšší číslo na menu nic nezmění.

### --see--

css-pozicovani/stacking-context#proc-se-prvek-nedostane-nad-sourozence-rodice

## --question--

Mobilní lišta „Zavolat" má `position: fixed; bottom: 0; height: 4rem` a na telefonu zakrývá konec patičky, když stránku odroluješ úplně dolů. Napiš vlastnost, kterou dáš prvku `body`, aby pod patičkou zbylo místo pro lištu.

### --expected--

padding-bottom

### --accept--

padding-block-end
margin-bottom
margin-block-end

### --why--

Prvek s `position: fixed` v toku stránky nezabírá místo, takže se obsah pod ním neodsune a lišta ho překryje. Vnitřní odsazení `body` dole aspoň tak velké jako lišta (tady 4rem) přidá na konec stránky prázdné místo, přes které lišta leží.

### --see--

css-pozicovani/position#fixed-prispendlene-k-oknu

# --code-- Kolegův web knihkupectví

## --file-- styles.css

```css
:root {
  --paper: #fffdf8;
  --ink: #1d1b16;
  --muted: #6b665c;
  --brand: #8a3b12;
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #16140f;
    --ink: #f1ede4;
    --muted: #a9a293;
    --brand: #f0a36b;
  }
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--ink);
  background: var(--paper);
}

h1 {
  font-size: clamp(2rem, 1rem + 3vw, 3rem);
}

@media (max-width: 48rem) {
  .nav-links {
    display: none;
  }
}

@media (min-width: 48rem) {
  .nav-toggle {
    display: none;
  }
}

@media (max-width: 40rem) {
  .books {
    grid-template-columns: 1fr;
  }
}

.books {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.book {
  container-type: inline-size;
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--paper);
  box-shadow: 0 2px 12px rgb(0 0 0 / 0.08);
}

@container (width >= 24rem) {
  .book {
    grid-template-columns: 6rem 1fr;
  }
}

.book__title {
  margin: 0;
  font-size: 1.125rem;
}

.book__price {
  color: #1d1b16;
  font-weight: 700;
}

.book__cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}
```

## --question--

Na telefonu s oknem 390 px jsou knihy ve čtyřech úzkých sloupcích, i když soubor obsahuje media dotaz pro úzká okna. Napiš číslo řádku, jehož deklarace media dotaz přebije.

### --expected--

48

### --why--

Na 390 px platí media dotaz na řádcích 40–44 i základní pravidlo `.books`. Obě pravidla mají stejný selektor, a tak vyhraje to pozdější: `grid-template-columns: repeat(4, 1fr)` na řádku 48. Oprava je přesunout media dotaz pod pravidlo `.books`, nebo celé přepsat mobile-first.

### --see--

css-responzivita/mobile-first#poradi-rozhoduje-media-dotaz-nepridava-silu

## --question--

Tablet má okno široké přesně 768 px. Co uvidí uživatel v navigaci podle řádků 28–38?

### --answer--

Odkazy navigace, tlačítko menu je skryté.

#### --why--

Tlačítko menu opravdu skryté je. Zkontroluj, jestli na 768 px platí i první z obou media dotazů.

### --answer--

Tlačítko menu, odkazy jsou skryté.

#### --why--

Odkazy skryté jsou. Zkontroluj, jestli na 768 px platí i druhý media dotaz.

### --correct--

Ani odkazy, ani tlačítko menu.

#### --why--

48rem je 768 px a `max-width` i `min-width` hranici zahrnují, takže na přesně 768 px platí oba bloky a každý skryje jednu část. Oprava: `(width < 48rem)` a `(width >= 48rem)`.

### --see--

css-responzivita/mobile-first#typicke-chyby-a-pasti

## --question--

Karta knihy se má přepnout na vodorovnou (obálka vedle textu), když má aspoň 24rem místa. Nepřepne se nikdy, ani v širokém sloupci. Napiš číslo řádku, který je na špatném prvku.

### --expected--

53

### --why--

Řádek 53 dělá kontejner ze samotné karty `.book`, jenže podmínka na řádku 62 se pro pravidlo `.book` ptá předků karty, ne karty samotné. Žádný předek kontejner není, takže podmínka neplatí. `container-type` patří na obal karty, třeba na položku seznamu.

### --see--

css-responzivita/container-queries#typicke-chyby-a-pasti

## --question--

Kolik pixelů bude mít nadpis `h1` podle řádku 25 v okně širokém 800 px? Napiš jen číslo.

### --expected--

40

### --accept--

40 px
40px

### --why--

1rem + 3vw = 16 + 0.03 × 800 = 16 + 24 = 40 px. Minimum je 32 px a maximum 48 px, takže platí 40 px.

### --see--

css-responzivita/mobile-first#plynule-velikosti-clamp

## --question--

Uživatel s tmavým režimem systému hlásí, že cena knihy je skoro neviditelná. Zbytek karty je v pořádku. Napiš číslo řádku, který to způsobuje.

### --expected--

74

### --why--

Řádek 74 nastavuje ceně tmavou barvu natvrdo. V tmavém motivu se tokeny přepnou, ale tahle barva ne, a tak je tmavý text na tmavém pozadí karty. Oprava: `color: var(--ink)`, nebo nový token pro cenu.

### --see--

css-responzivita/preference-uzivatele#typicke-chyby-a-pasti
