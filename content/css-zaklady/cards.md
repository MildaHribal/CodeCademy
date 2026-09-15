## --card-- css

Napiš deklaraci, která odkazu zruší podtržení.

### --expected--

```css
text-decoration: none;
```

### --accept--

```css
text-decoration-line: none;
```

### --why--

Podtržení dávají odkazům výchozí styly prohlížeče přímo, proto se nezmění jen tím, že rodič podtržení nemá.

### --see--

css-zaklady/workshop-vizitka/014

## --card-- css

Napiš deklaraci řádkování 1,5násobku písma tak, aby si ho vnořený nadpis s větším písmem přepočítal podle svého písma.

### --expected--

```css
line-height: 1.5;
```

### --why--

Číslo bez jednotky se dědí jako násobek. `150%` nebo `1.5em` by se spočítaly na pixely u rodiče a nadpis by zdědil pevné číslo.

### --see--

css-zaklady/workshop-vizitka/013

## --card-- css

Napiš deklaraci, která textový sloupec omezí na nejvýš 60 znaků a na úzkém displeji ho nechá užší.

### --expected--

```css
max-width: 60ch;
```

### --why--

`ch` je šířka znaku písma, takže sloupec drží počet znaků i po změně velikosti písma. `max-width` omezí šířku jen shora.

### --see--

css-zaklady/workshop-typografie/004

## --card-- css

Napiš deklaraci velikosti písma, která roste s oknem podle `1rem + 2vw`, ale nikdy není menší než `1.5rem` a větší než `2.25rem`.

### --expected--

```css
font-size: clamp(1.5rem, 1rem + 2vw, 2.25rem);
```

### --why--

`clamp()` bere minimum, ideál a maximum v tomhle pořadí. Přičtené `rem` zajistí, že velikost reaguje i na písmo nastavené v prohlížeči.

### --see--

css-zaklady/jednotky-a-hodnoty#min-max-a-clamp

## --card-- css

Napiš deklaraci pozadí, která čte token `--color-surface`, a když token není definovaný, použije bílou.

### --expected--

```css
background-color: var(--color-surface, white);
```

### --accept--

```css
background-color: var(--color-surface, #fff);
```

```css
background-color: var(--color-surface, #ffffff);
```

### --why--

Druhý argument `var()` je záložní hodnota pro nedefinovanou proměnnou. Před špatnou hodnotou v definované proměnné nechrání.

### --see--

css-zaklady/vlastni-vlastnosti#zalozni-hodnota-ve-var

## --card-- css

Napiš deklaraci, která dá prvku jako obrázek pozadí přechod shora dolů od `#fef3c7` do `#fde68a`.

### --expected--

```css
background-image: linear-gradient(180deg, #fef3c7, #fde68a);
```

### --accept--

```css
background-image: linear-gradient(to bottom, #fef3c7, #fde68a);
```

```css
background-image: linear-gradient(#fef3c7, #fde68a);
```

### --why--

Přechod není barva, ale obrázek, který prohlížeč kreslí sám. V `background-color` by byl neplatný a zahodil by se.

### --see--

css-zaklady/workshop-vizitka/008

## --card-- css

Napiš deklaraci, se kterou prohlížeč dlouhá slova na konci řádku dělí se spojovníkem podle jazyka stránky.

### --expected--

```css
hyphens: auto;
```

### --why--

Slovník pro dělení vybírá prohlížeč podle atributu `lang`. Když stránka česká slova označí jako `lang="en"`, dělí je podle anglických pravidel.

### --see--

css-zaklady/workshop-typografie/010

## --card-- css

Napiš deklaraci, která rozdělí text krátkého nadpisu do řádků podobné délky.

### --expected--

```css
text-wrap: balance;
```

### --accept--

```css
text-wrap-style: balance;
```

### --why--

`balance` vyrovná délky řádků, ale prohlížeče ho používají jen u textu s pár řádky. Na konec dlouhého odstavce patří `pretty`.

### --see--

css-zaklady/workshop-typografie/008

## --card-- css

Napiš deklaraci, která z libovolně velkého čtvercového obrázku udělá kruh.

### --expected--

```css
border-radius: 50%;
```

### --why--

Procenta v `border-radius` se počítají z rozměrů prvku, takže polovina strany sedí na jakoukoli velikost. Pevné pixely by fungovaly jen pro jednu.

### --see--

css-zaklady/workshop-vizitka/009

## --card-- output

Stránka má výchozí písmo 16 px. Menu `.nav` má `font-size: 0.75em` a uvnitř něj je další menu se stejnou třídou. Kolik pixelů má písmo vnořeného menu?

### --expected--

9

### --accept--

9px
9 px

### --why--

`em` u `font-size` násobí písmo rodiče: 16 × 0,75 = 12 px pro vnější menu a 12 × 0,75 = 9 px pro vnořené. S `0.75rem` by obě měla 12 px.

### --see--

css-zaklady/jednotky-a-hodnoty#em-nasobek-pisma-prvku

## --card-- output

Rodič je široký 600 px. Prvek v něm má `padding: 5%`. Kolik pixelů je jeho **horní** vnitřní odsazení?

### --expected--

30

### --accept--

30px
30 px

### --why--

Procenta u `padding` se počítají ze šířky rodiče na všech čtyřech stranách, i nahoře a dole: 5 % z 600 px.

### --see--

css-zaklady/jednotky-a-hodnoty#procenta-vuci-cemu

## --card-- output

Rodič je široký 700 px a stránka má výchozí písmo 16 px. Kolik pixelů bude široký prvek s `width: min(100%, 36rem)`?

### --expected--

576

### --accept--

576px
576 px

### --why--

`36rem` je 576 px a 100 % je 700 px. `min()` vybere menší z nich, takže se prvek na širokém rodiči zastaví na 576 px.

### --see--

css-zaklady/jednotky-a-hodnoty#min-max-a-clamp

## --card-- output

Okno je široké 375 px. Kolik pixelů bude písmo s `font-size: clamp(2rem, 5vw, 3rem)` při výchozí velikosti písma?

### --expected--

32

### --accept--

32px
32 px

### --why--

5 % z 375 px je 18,75 px, méně než minimum `2rem` = 32 px. `clamp()` nepustí hodnotu pod minimum.

### --see--

css-zaklady/jednotky-a-hodnoty#min-max-a-clamp

## --card-- output

Galerie `<div class="gallery">` obsahuje šest obrázků `<img>` a nic jiného. Kolik obrázků vybere `.gallery img:nth-child(-n+2)`?

### --expected--

2

### --accept--

dva

### --why--

Za `n` se dosazuje 0, 1, 2…, vzorec `-n+2` dá pozice 2, 1, 0… a existují jen pozice 1 a 2. Tímhle vzorem se vybírá prvních pár položek.

### --see--

css-zaklady/selektory-zaklad#pseudotridy-podle-pozice

## --card-- output

Článek obsahuje v tomhle pořadí `h2`, `p`, `p`, `h2`, `p`. Kolik odstavců vybere selektor `h2 + p`?

### --expected--

2

### --accept--

dva

### --why--

`+` vybere prvek, který stojí hned za nadpisem. To platí pro první odstavec za každým z obou nadpisů. Druhý odstavec stojí za odstavcem.

### --see--

css-zaklady/selektory-zaklad#kombinatory-vztahy-mezi-prvky

## --card-- output

Stránka má výchozí písmo 16 px. Kolik pixelů bude mít odstavec spodní vnější okraj?

```css
p {
  margin: 0 0 1rem;
}

p {
  margin-bottom: 2 rem;
}
```

### --expected--

16

### --accept--

16px
16 px

### --why--

`2 rem` s mezerou není platná délka, a tak se druhá deklarace zahodí. Neplatná deklarace neznamená „vrať výchozí", platí dál `1rem` z prvního pravidla.

### --see--

css-zaklady/jak-css-funguje#neplatna-deklarace-se-tise-zahodi

## --card-- output

Na `:root` je `--size: 20;` a prvek má `width: calc(var(--size) * 1px)`. Kolik pixelů bude široký?

### --expected--

20

### --accept--

20px
20 px

### --why--

Holé číslo z proměnné dostane jednotku vynásobením v `calc()`. Zápis `var(--size)px` by jednotku nepřilepil a deklarace by byla neplatná.

### --see--

css-zaklady/vlastni-vlastnosti#typicke-chyby-a-pasti

## --card-- free

Uživatel si v prohlížeči zvětší výchozí velikost písma z 16 na 20 px. Co se na tvé stránce zvětší, co ne, a co z toho plyne pro psaní hodnot?

### --back--

Zvětší se všechno, co vychází z písma: hodnoty v `rem`, hodnoty v `em` a řádkování zapsané číslem bez jednotky. Nezvětší se nic, co je v `px` — velikost písma v pixelech, pevné šířky ani řádkování v pixelech. Přiblížení stránky (Ctrl a +) zvětší i pixely, ale nastavení výchozího písma ne, a proto se velikost textu a rozestupy kolem něj píšou v `rem`; `px` zůstává na věci, které mají zůstat stejné, jako tloušťka rámečku.

### --see--

css-zaklady/jednotky-a-hodnoty#rem-nasobek-korene-stranky

## --card-- free

Na stránce máš `body { line-height: 24px; }` a v článku velký nadpis, jehož řádky se přes sebe překrývají. Čím to je a jak to opravíš?

### --back--

Řádkování se dědí a hodnota v pixelech (stejně jako v procentech nebo v `em`) se spočítá na pevné číslo už u rodiče. Nadpis proto zdědí 24 px řádku, přestože jeho písmo má třeba 40 px, a řádky se slejí. Opravím to řádkováním zapsaným číslem bez jednotky (`line-height: 1.5`): dědí se jako násobek a každý prvek si ho vynásobí svým písmem. Nadpisům pak stačí vlastní menší násobek kolem 1,2.

### --see--

css-zaklady/workshop-vizitka/013

## --card-- free

Designérka pošle token `--blue: #2563eb`. Proč ho v projektu přejmenuješ na `--color-accent`?

### --back--

Jméno tokenu má popisovat účel, ne vzhled. Až firma změní firemní barvu na zelenou, `--blue: green` nikdo nepochopí a nikdo si netroufne ho přepsat, kdežto `--color-accent` zůstane pravdivý a stačí změnit hodnotu. Jméno podle účelu navíc říká, kde se barva používá, takže kód přečte i člověk, který návrh nezná. Stejně se pojmenovávají škály: `--space-3` nebo `--space-m` místo `--16px`.

### --see--

css-zaklady/vlastni-vlastnosti#design-tokeny-pojmenovani-a-skala

## --card-- free

Proč se v CSS na stylování nepoužívají selektory s id?

### --back--

Id smí být na stránce jen jednou, takže pravidlo s ním nejde použít znovu na dalším prvku. Hlavně má ale vyšší prioritu než jakýkoli počet tříd: pravidlo s id přebije třídu se stavem nebo variantou bez ohledu na pořadí ve stylopisu, a pak se musí přebíjet dál. Třídy jde kombinovat a přepisovat, a proto se stylují komponenty třídami. Id zůstává na odkazy uvnitř stránky a na JavaScript.

### --see--

css-zaklady/selektory-zaklad#typ-trida-a-id

## --card-- free

Grafikovi vadí obrys kolem tlačítka po kliknutí myší. Co mu nabídneš?

### --back--

Napíšu výrazný vlastní obrys do `:focus-visible`. Ten prohlížeč použije, když usoudí, že je fokus potřeba ukázat — u tlačítka a odkazu typicky při ovládání klávesnicí, ne po kliknutí myší. Grafik tedy po kliknutí nic neuvidí a člověk, který web ovládá klávesnicí, pořád pozná, kde je. Co nabídnout nemůžu, je `outline: none` na `:focus`: obrys by zmizel i klávesnici, a to je chyba přístupnosti.

### --see--

css-zaklady/selektory-zaklad#pseudotridy-stav-prvku

## --card-- free

Styl, který jsi napsal, se na prvek neprojevil. Jak v DevTools zjistíš proč?

### --back--

Prvek prozkoumám a v panelu Styles hledám své pravidlo. Když tam není, selektor na prvek nemíří — překlep ve třídě nebo špatný vztah prvků. Když tam je a deklarace je přeškrtnutá s ikonou varování, je neplatná; přeškrtnutá bez ikony znamená, že ji přebila jiná deklarace, kterou najdu výš; bledá s ikonou ⓘ platí, ale na prvek nemá účinek. Nakonec v panelu Computed rozbalím vlastnost a uvidím spočtenou hodnotu i pravidlo, ze kterého přišla.

### --see--

css-zaklady/devtools-pro-css#panel-styles-co-plati-a-co-je-preskrtnute

## --card-- free

Proč záložní hodnota ve `var(--x, fallback)` nepomůže, když proměnná obsahuje špatnou hodnotu?

### --back--

Záložní hodnota se použije jen tehdy, když proměnná není definovaná. Když definovaná je, prohlížeč její hodnotu dosadí, a že do vlastnosti nepasuje, zjistí až při výpočtu. Deklaraci ale přijal už při čtení stylopisu, takže předchozí pravidla prohrála. Vlastnost se pak chová jako nenastavená: zdědí hodnotu od rodiče, nebo dostane výchozí. Oprava je v definici proměnné, ne ve fallbacku.

### --see--

css-zaklady/vlastni-vlastnosti#zalozni-hodnota-ve-var

## --card-- free

Kdy je v CSS `px` správná volba a kdy ne? Uveď u obojího příklad.

### --back--

`px` se hodí na hodnoty, které mají zůstat stejné bez ohledu na písmo: tloušťka rámečku nebo obrysu, jemný stín, malé zaoblení. Nehodí se na velikost písma a rozestupy kolem textu — ty v pixelech ignorují velikost písma, kterou si uživatel nastavil v prohlížeči, a nezvětší se s ním. Nehodí se ani na šířku obsahu: pevných 360 px se na užším displeji nevejde, kdežto `min(100%, 22rem)` nebo `max-width` v `ch` ano.

### --see--

css-zaklady/jednotky-a-hodnoty#px-pevna-hodnota
