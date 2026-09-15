---
pass: 0.8
---

# --questions--

## --question--

Tlačítko nemá reset `box-sizing` a v CSS má `width: 160px`, `padding: 0 20px` a `border: 2px solid`. Jak široké bude na obrazovce (v px)?

### --expected--

204

### --accept--

204 px
204px

### --why--

Ve výchozím `content-box` měří `width` jen obsah. Padding přidá 2 × 20 px a rámeček 2 × 2 px: 160 + 40 + 4 = 204 px.

### --see--

css-box-model/box-model#box-sizing-co-presne-meri-width

## --question--

Postranní panel má obsah široký 300 px. Blok s hláškou v něm má `width: 100%` a `margin-inline: 1rem`. Co uvidíš?

### --answer--

Hláška bude široká 268 px s mezerou 16 px na obou stranách.

#### --why--

Tak by počítala výchozí `width: auto`, která od šířky rodiče odečte marginy. Pevná `width: 100%` je nic neodečítá.

### --correct--

Hláška bude široká 300 px, odsunutá o 16 px doprava a o 16 px přečnívá přes pravý okraj panelu.

#### --why--

`width: 100%` pevně nastaví šířku rodiče. Levý margin blok odsune a na pravý už místo není, takže blok přeteče.

### --answer--

Hláška bude široká 300 px a marginy se ignorují, protože se s `width: 100%` nesčítají.

#### --why--

Levý margin se použije a blok odsune. Ignoruje se jen ten, na který už nezbylo místo.

### --see--

css-box-model/box-model#width-auto-neni-totez-co-width-100

## --question--

Cena v odstavci je `<span class="price">` s `margin-block: 20px`. Co to udělá s řádky nad a pod cenou?

### --answer--

Odsune je o 20 px od ceny.

#### --why--

Myslíš si, že svislý margin funguje na každém prvku? Na řádkovém boxu se ignoruje, řádky odsouvá jen u bloku nebo `inline-block`.

### --correct--

Nic, svislý margin se na řádkovém prvku nepoužije.

#### --why--

`span` je řádkový box. Výšku řádku určuje písmo a `line-height`, svislý margin řádkového boxu ji nemění.

### --answer--

Posune jen samotnou cenu o 20 px dolů, zbytek řádku zůstane.

#### --why--

Řádkový box se svislým marginem v řádku neposouvá. Svislé posunutí v řádku řídí jiné vlastnosti, margin to není.

### --see--

css-box-model/normalni-tok#proc-radkovemu-prvku-nejde-nastavit-vyska

## --question--

Galerie má čtyři dlaždice `<a class="tile">` s `display: inline-block`, `width: 25%` a nulovým marginem. Kontejner nemá padding. Čtvrtá dlaždice ale spadne na další řádek. Proč?

### --answer--

`inline-block` přidává každému prvku výchozí margin 4 px.

#### --why--

Žádný výchozí margin tam není. Podívej se, co v HTML stojí mezi dlaždicemi.

### --correct--

Mezery a konce řádků mezi dlaždicemi v HTML jsou mezery v textu a zaberou šířku navíc.

#### --why--

`inline-block` prvky tečou v řádku jako slova, takže mezera mezi nimi v HTML je obyčejná mezera. 4 × 25 % plus tři mezery je víc než 100 %.

### --answer--

Dlaždice mají výchozí `box-sizing: content-box`, takže jsou širší.

#### --why--

Bez paddingu a rámečku je `content-box` i `border-box` stejně široký. Hledej něco mezi dlaždicemi.

### --see--

css-box-model/normalni-tok#typicke-chyby-a-pasti

## --question--

`<figure>` se šedým pozadím obsahuje jen obrázek vysoký 200 px s `vertical-align: top`. Jak vysoký bude `figure` (v px), když nemá padding?

### --expected--

200

### --accept--

200 px
200px

### --why--

Proužek pod obrázkem vzniká jen tehdy, když obrázek sedí na účaří a řádek pod ním drží místo pro písmena. S `vertical-align: top` obrázek na účaří nesedí a řádek je vysoký přesně jako obrázek.

### --see--

css-box-model/normalni-tok#mezera-pod-obrazkem

## --question--

Pod sebou jsou tři bloky: odstavec s `margin-bottom: 30px`, prázdný `div` (bez obsahu, paddingu a rámečku) s `margin: 10px 0 50px` a odstavec s `margin-top: 20px`. Kolik pixelů bude mezi odstavci?

### --expected--

50

### --accept--

50 px
50px

### --why--

Všechny čtyři marginy se dotýkají: prázdný blok nemá nic, co by jeho horní a spodní margin oddělilo. Slijí se do jednoho a zůstane největší z nich, 50 px.

### --see--

css-box-model/margin-collapse-a-bfc#kdy-se-marginy-slevaji

## --question--

Seznam má `display: grid; gap: 12px` a jeho položky mají výchozí `margin-block: 10px`. Kolik pixelů je mezi dvěma položkami?

### --expected--

32

### --accept--

32 px
32px

### --why--

Grid položky marginy neslévají a `gap` se k nim přičte: 10 + 12 + 10 = 32 px.

### --see--

css-box-model/margin-collapse-a-bfc#mezery-drzi-rodic-stack-a-gap

## --question--

Které z těchto deklarací založí na prvku blokový formátovací kontext, takže marginy jeho dětí zůstanou uvnitř? Vyber všechny správné.

### --correct--

`display: flow-root`

#### --why--

`flow-root` existuje právě kvůli tomu: založí blokový formátovací kontext a nic jiného nezmění.

### --correct--

`display: inline-block`

#### --why--

`inline-block` zakládá vlastní blokový formátovací kontext, prvek přitom navíc teče v řádku.

### --answer--

`display: block`

#### --why--

Obyčejný blok v normálním toku vlastní kontext nezakládá. Právě z něj marginy prvního a posledního dítěte utíkají ven.

### --answer--

`overflow: clip`

#### --why--

`clip` obsah ořízne, ale na rozdíl od `hidden` blokový formátovací kontext nezakládá.

### --see--

css-box-model/margin-collapse-a-bfc#blokovy-formatovaci-kontext
css-box-model/preteceni#overflow-co-s-obsahem-ktery-preteka

## --question--

Prvek má `overflow-x: hidden` a `overflow-y: visible`. Jakou hodnotu ukáže panel Computed pro `overflow-y`?

### --expected--

auto

### --why--

Box nemůže být v jednom směru oříznutý a v druhém přetékat ven. Když je jeden směr `hidden`, `auto` nebo `scroll`, prohlížeč z `visible` v druhém směru udělá `auto`.

### --see--

css-box-model/preteceni#overflow-co-s-obsahem-ktery-preteka

## --question--

V drobečkové navigaci e-shopu je poslední položka odkaz `<a class="crumb">` s dlouhým názvem produktu. Odkaz má `max-width: 12rem`, `white-space: nowrap`, `overflow: hidden` a `text-overflow: ellipsis`. Název se ale neořízne, je celý a táhne se přes 12rem. Co je špatně?

### --answer--

`max-width` a `text-overflow` se navzájem ruší, stačí jedno z nich.

#### --why--

Tři tečky potřebují box s omezenou šířkou, takže `max-width` sem patří. Háček je v tom, jaký box odkaz vytváří.

### --correct--

Odkaz je řádkový prvek: `max-width` na něj nepůsobí a `overflow` s `text-overflow` taky ne. Pomůže mu `display: inline-block`.

#### --why--

Šířka i oříznutí fungují jen na boxu, který má vlastní šířku, tedy blok nebo `inline-block`. Řádkový odkaz je jen kus textu v řádku, jeho velikost určuje text.

### --answer--

`white-space: nowrap` zakazuje i oříznutí, musí pryč.

#### --why--

Bez `nowrap` by se text zalomil a do strany by nepřetékal vůbec. `nowrap` je jedna ze čtyř podmínek, ne překážka.

### --see--

css-box-model/preteceni#jeden-radek-se-tremi-teckami

## --question--

Najdi v anglické dokumentaci MDN na stránce vlastnosti `object-fit` hodnotu, se kterou se obrázek zmenší jako u `contain`, ale nikdy se nezvětší nad svou přirozenou velikost. Napiš ji.

### --expected--

scale-down

### --why--

`scale-down` vybere menší z výsledků `none` a `contain`: velký obrázek zmenší, aby se vešel, malý nechá v jeho velikosti. Hodí se na loga různých velikostí v kartách se stejným výřezem.

### --see--

css-box-model/preteceni#kde-to-najdes-v-mdn

## --question--

Ve stylopisu je nejdřív `.card p { margin: 0; }` a o kus níž `p.note { margin: 1rem; }`. Odstavec `<p class="note">` leží v `.card`. Jaký bude jeho margin? Napiš hodnotu z CSS.

### --expected--

1rem

### --accept--

16px
16 px

### --why--

Oba selektory mají stejnou specificitu (0, 1, 1): jednu třídu a jeden typ. Při shodě rozhoduje pořadí ve zdroji, a `p.note` je později.

### --see--

css-kaskada/kaskada#specificita-trojice-a-b-c

## --question--

Vzor stack je napsaný `:where(.stack) > * + * { margin-block-start: 1rem; }` a o kus níž je `h2 { margin-block-start: 3rem; }`. Jakou mezeru bude mít nadpis `h2` ve stacku, před kterým je odstavec?

### --answer--

1rem, pravidlo stacku má vyšší specificitu.

#### --why--

Myslíš si, že `:where()` započítá třídu `.stack`? Všechno uvnitř `:where()` má specificitu nula.

### --correct--

3rem, protože pravidlo stacku má díky `:where()` nulovou specificitu a `h2` vyšší.

#### --why--

`:where(.stack) > * + *` má specificitu (0, 0, 0) a `h2` (0, 0, 1). Pravidlo pro nadpis vyhraje, i kdyby bylo dřív. Proto se `:where()` hodí do vzorů, které má jít snadno přebít.

### --answer--

4rem, marginy z obou pravidel se sečtou.

#### --why--

Dvě pravidla pro tutéž vlastnost se nesčítají, kaskáda vybere jednu hodnotu.

### --see--

css-kaskada/moderni-selektory#where-stejny-vyber-nulova-specificita

## --question--

Styly resetu jsou ve vrstvě: `@layer reset { * { margin: 0; } }`. Mimo vrstvy je `p { margin-block: 1em; }`. Jaký svislý margin bude mít odstavec? Napiš hodnotu z CSS.

### --expected--

1em

### --accept--

16px
16 px

### --why--

Styly mimo vrstvy mají přednost před styly ve vrstvách bez ohledu na specificitu i pořadí. Proto se reset dává do vrstvy: cokoli napsaného mimo ni ho přebije.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --question--

Karta má `padding: var(--card-space, 1rem)`. Její rodič `.sidebar` má `--card-space: 2rem` a karta sama vlastnost nenastavuje. Kolik bude padding karty? Napiš hodnotu z CSS.

### --expected--

2rem

### --accept--

32px
32 px

### --why--

Vlastní vlastnosti se dědí, takže karta dostane `--card-space` od rodiče. Záložní hodnota `1rem` se použije jen tehdy, když vlastnost nikde nad kartou nastavená není.

### --see--

css-zaklady/vlastni-vlastnosti

# --code-- Kolegův stylopis karet akcí

## --file-- events.css

```css
/* Program kulturního domu — karty akcí (kolegův stylopis) */

body {
  margin: 0;
  font-family: Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #222;
  background: #f4f4f4;
}

.program {
  width: 960px;
  margin: 0 auto;
}

.event {
  width: 320px;
  padding: 24px;
  border: 1px solid #ddd;
  margin-top: 16px;
  margin-bottom: 24px;
  background: #fff;
}

.event__header {
  background: #1d4ed8;
  color: #fff;
  padding-left: 16px;
  padding-right: 16px;
}

.event__title {
  margin-top: 20px;
  margin-bottom: 8px;
  font-size: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event__date {
  margin: 0 0 20px;
  font-size: 14px;
}

.event__badge {
  height: 28px;
  padding: 4px 10px;
  border-radius: 14px;
  background: #fde68a;
  color: #713f12;
  font-size: 13px;
}

.event__photo {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.event__text {
  margin: 16px 0;
}

.event__button {
  display: inline-block;
  padding: 10px 20px;
  background: #1d4ed8;
  color: #fff;
  text-decoration: none;
}

.event__button:hover {
  background: #1e3a8a;
}
```

## --question--

HTML karty je `<article class="event">` a stylopis nemá reset `box-sizing`. Jak široká bude karta na obrazovce podle řádků 17–24 (v px)?

### --expected--

370

### --accept--

370 px
370px

### --why--

`width: 320px` (řádek 18) je v `content-box` jen šířka obsahu. Přičte se padding z obou stran (2 × 24 px, řádek 19) a rámeček (2 × 1 px, řádek 20): 320 + 48 + 2 = 370 px.

### --see--

css-box-model/box-model#box-sizing-co-presne-meri-width

## --question--

Karty `.event` leží v normálním toku pod sebou. Kolik pixelů bude mezi dvěma kartami podle řádků 21 a 22?

### --expected--

24

### --accept--

24 px
24px

### --why--

Spodní margin jedné karty (24 px) a horní margin další (16 px) se dotýkají a slijí se. Zůstane větší z nich. Kolega nejspíš počítal se 40 px.

### --see--

css-box-model/margin-collapse-a-bfc#problem-mezera-ktera-se-nescita

## --question--

Záhlaví karty je `<header class="event__header">` s nadpisem `.event__title` a datem `.event__date` uvnitř. Modré podbarvení (řádky 26–31) začíná přesně na horní hraně textu nadpisu a nad záhlavím je bílá mezera. Proč?

### --answer--

Řádek 34 nastavuje `margin-top` jen v px a ten se v záhlaví s `padding-left` ignoruje.

#### --why--

Jednotka ani vodorovný padding nerozhodují. Rozhoduje, jestli mezi marginem nadpisu a horní hranou záhlaví něco stojí.

### --correct--

Záhlaví nemá horní padding ani rámeček, takže se `margin-top` nadpisu z řádku 34 slije se záhlavím a objeví se nad ním.

#### --why--

Horní margin prvního dítěte se slévá s rodičem, když je nic neodděluje. Pomůže `padding-top` na záhlaví nebo `display: flow-root`.

### --answer--

Modré pozadí se kreslí jen pod text, ne pod marginy dětí, a to nejde změnit.

#### --why--

Pozadí vyplní celý box záhlaví včetně paddingu. Když marginy nadpisu zůstanou uvnitř záhlaví, podbarví se i ony.

### --see--

css-box-model/margin-collapse-a-bfc#kdy-se-marginy-slevaji

## --question--

Dlouhý název akce v `.event__title` se zalomí do dvou řádků a tři tečky nejsou vidět, i když nadpis má řádky 37 a 38. Napiš deklaraci, která v pravidle chybí.

### --expected--

white-space: nowrap

### --accept--

text-wrap: nowrap
text-wrap-mode: nowrap

### --why--

Tři tečky se kreslí jen tam, kde text přetéká do strany. Dokud se nadpis zalamuje, do strany nepřeteče. Nadpis je blok, takže šířku má, a `overflow` s `text-overflow` na řádcích 37–38 už jsou.

### --see--

css-box-model/preteceni#jeden-radek-se-tremi-teckami

## --question--

Štítek „Vyprodáno" je v HTML `<span class="event__badge">` uprostřed řádku. Jak vysoký bude jeho žlutý podklad podle řádků 46–53?

### --answer--

Přesně 28 px podle řádku 47.

#### --why--

Myslíš si, že `height` platí pro každý prvek? `span` je ve výchozím stavu řádkový box a na ten `height` nepůsobí.

### --correct--

Podle textu a paddingu, `height: 28px` z řádku 47 se nepoužije. Podklad navíc přesahuje přes okolní řádky.

#### --why--

`span` je řádkový prvek: výšku mu určuje písmo, svislý padding se kreslí, ale řádky neodsouvá. Aby platila výška, potřebuje štítek `display: inline-block`.

### --answer--

28 px plus 8 px paddingu, tedy 36 px.

#### --why--

Tak by počítal `inline-block` v `content-box`. Tady `height` na prvek vůbec nepůsobí.

### --see--

css-box-model/normalni-tok#display-meni-druh-boxu
