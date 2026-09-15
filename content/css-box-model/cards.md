## --card-- css

Napiš deklaraci, kterou moderní reset stylů dává všem prvkům i pseudoprvkům, aby `width` znamenala šířku od rámečku k rámečku.

### --expected--

```css
box-sizing: border-box;
```

### --why--

Ve výchozím `content-box` měří `width` jen obsah a padding s rámečkem se přičítají ven.

### --see--

css-box-model/box-model#box-sizing-co-presne-meri-width

## --card-- css

Formulář má `max-inline-size: 30rem`. Napiš jednu deklaraci logickou vlastností, která ho vodorovně vycentruje.

### --expected--

```css
margin-inline: auto;
```

### --why--

Automatický margin vlevo i vpravo si rozdělí zbylé místo rovným dílem. Blok přitom musí mít omezenou šířku, jinak není co rozdělit.

### --see--

css-box-model/box-model#logicke-vlastnosti-inline-a-block-misto-stran

## --card-- css

Tlačítko „Do košíku" má být aspoň 10rem široké, aby se na něj dobře trefovalo. S delším textem („Do košíku a k pokladně") se ale musí rozšířit, ne zalomit. Napiš deklaraci logickou vlastností.

### --expected--

```css
min-inline-size: 10rem;
```

### --accept--

```css
min-width: 10rem;
```

### --why--

Pevná šířka by delší text zalomila do víc řádků. Minimum drží jen spodní hranici a nad ní tlačítko roste s obsahem.

### --see--

css-box-model/box-model#hranice-velikosti-min-a-max

## --card-- css

Štítky kategorií `<a class="chip">` s paddingem lezou na víc řádcích přes sebe. Mají zůstat v řádku textu, ale jako celistvé krabičky. Napiš deklaraci.

### --expected--

```css
display: inline-block;
```

### --why--

Řádkový box svislý padding jen nakreslí a řádky neodsune. `inline-block` teče v řádku jako slovo, ale uvnitř je blok, takže řádky se od něj odsunou.

### --see--

css-box-model/normalni-tok#display-meni-druh-boxu

## --card-- css

Pod fotkou v galerii je proužek pozadí, i když obrázek nemá margin. Obrázek nemusí zůstat v řádku. Napiš deklaraci pro obrázek.

### --expected--

```css
display: block;
```

### --accept--

```css
vertical-align: top;
```

```css
vertical-align: bottom;
```

```css
vertical-align: middle;
```

### --why--

Řádkový obrázek sedí na účaří a řádek pod ním drží místo pro písmena jako g nebo y.

### --see--

css-box-model/normalni-tok#mezera-pod-obrazkem

## --card-- css

Odznak s počtem nepřečtených zpráv se při nule schová, ale ikona vedle něj nesmí poskočit. Napiš deklaraci pro skrytý odznak.

### --expected--

```css
visibility: hidden;
```

### --why--

`visibility: hidden` nechá boxu místo, jen ho nevykreslí. `display: none` by místo uvolnilo a ikona by se posunula.

### --see--

css-box-model/normalni-tok#jak-prvek-skryt-display-none-a-visibility-hidden

## --card-- css

Upozornění s pozadím nemá svislý padding a marginy odstavců uvnitř z něj utíkají ven. Napiš deklaraci pro upozornění, která je udrží uvnitř bez vedlejších efektů.

### --expected--

```css
display: flow-root;
```

### --why--

`flow-root` založí blokový formátovací kontext, ve kterém se marginy dětí s rodičem neslévají. `overflow: hidden` by to zvládlo taky, ale ořízne stíny a obrysy.

### --see--

css-box-model/margin-collapse-a-bfc#blokovy-formatovaci-kontext

## --card-- css

Karta objednávky je flex položka a dlouhý e-mail zákazníka bez mezer ji roztahuje, takže přetéká z řádku. Obyčejná slova se mají dál lámat jen mezi slovy. Napiš deklaraci pro text s e-mailem.

### --expected--

```css
overflow-wrap: anywhere;
```

### --why--

`overflow-wrap` láme jen slova, která se celá nevejdou na řádek. Ve flex položce ale pomůže jen `anywhere`, protože zmenší i nejmenší šířku obsahu. `break-word` slovo zlomí až při vykreslení a položku roztáhne dál.

### --see--

css-box-model/preteceni#dlouha-slova-a-adresy

## --card-- css

Široký rozpis plateb je v obalu `.payments`. Napiš deklaraci pro obal, aby se na telefonu posouval do strany jen rozpis a jen tehdy, když přetéká.

### --expected--

```css
overflow-x: auto;
```

### --accept--

```css
overflow: auto;
```

```css
overflow-inline: auto;
```

### --why--

`auto` ořízne obsah na šířce obalu a posuvník ukáže, jen když je co posouvat.

### --see--

css-box-model/preteceni#overflow-co-s-obsahem-ktery-preteka

## --card-- css

Náhled videa má mít ze šířky dopočítanou výšku v poměru 16 : 9. Napiš deklaraci.

### --expected--

```css
aspect-ratio: 16 / 9;
```

### --accept--

```css
aspect-ratio: 16/9;
```

### --why--

Poměr stran se použije, když výška zůstane `auto`. S pevnou výškou i šířkou se ignoruje.

### --see--

css-box-model/preteceni#obrazky-hranice-sirky-pomer-stran-a-object-fit

## --card-- css

Loga partnerů festivalu mají různé tvary a stojí v dlaždicích s `aspect-ratio: 3 / 2`. Každé logo musí být vidět celé, nic se nesmí oříznout ani zdeformovat. Napiš deklaraci pro obrázek loga.

### --expected--

```css
object-fit: contain;
```

### --accept--

```css
object-fit: scale-down;
```

### --why--

`contain` zachová poměr stran a zmenší obrázek tak, aby se do boxu vešel celý, zbytek dlaždice zůstane prázdný. `cover` by okraje loga ořízl a výchozí `fill` ho zdeformuje.

### --see--

css-box-model/preteceni#obrazky-hranice-sirky-pomer-stran-a-object-fit

## --card-- css

Odkaz „Zobrazit další recepty" má `display: block` a `margin-inline: auto`, a přesto se roztahuje přes celou šířku a nic se necentruje. Má být jen tak široký jako jeho text, ale na úzkém displeji nesmí přetéct. Napiš deklaraci šířky.

### --expected--

```css
width: fit-content;
```

### --accept--

```css
inline-size: fit-content;
```

### --why--

`fit-content` je šířka textu na jednom řádku, nejvýš však šířka rodiče. `max-content` by na úzkém displeji přetekl.

### --see--

css-box-model/preteceni#velikost-podle-obsahu-min-content-max-content-fit-content

## --card-- output

Tlačítko má `padding: 4px 8px 12px`. Kolik pixelů paddingu má vpravo?

### --expected--

8

### --accept--

8 px
8px

### --why--

Tři hodnoty jsou nahoře, vlevo a vpravo, dole. Prostřední hodnota platí pro obě boční strany.

### --see--

css-box-model/box-model#ctyri-vrstvy-boxu

## --card-- output

Panel má `box-sizing: border-box`, `width: 300px`, `padding: 20px` a `border: 5px solid`. Kolik pixelů zbude na obsah?

### --expected--

250

### --accept--

250 px
250px

### --why--

S `border-box` se padding (2 × 20 px) a rámeček (2 × 5 px) odečtou dovnitř: 300 − 50 = 250 px.

### --see--

css-box-model/box-model#box-sizing-co-presne-meri-width

## --card-- output

Prvek má `width: 500px; max-width: 300px; min-width: 400px;`. Jak bude široký (v px)?

### --expected--

400

### --accept--

400 px
400px

### --why--

`max-width` stáhne šířku na 300 px, ale `min-width` má přednost před `max-width` a nepustí ji pod 400 px.

### --see--

css-box-model/box-model#hranice-velikosti-min-a-max

## --card-- output

Nadpis má `margin-bottom: 32px` a odstavec pod ním `margin-top: -12px`. Oba jsou obyčejné bloky v normálním toku. Kolik pixelů je mezi nimi?

### --expected--

20

### --accept--

20 px
20px

### --why--

Při slévání se sečte největší kladný a nejzápornější záporný margin: 32 + (−12) = 20 px.

### --see--

css-box-model/margin-collapse-a-bfc#kdy-se-marginy-slevaji

## --card-- output

Dvě položky ve flexboxu ve sloupci mají každá `margin-block: 12px`. Kolik pixelů je mezi nimi?

### --expected--

24

### --accept--

24 px
24px

### --why--

Flex položky marginy neslévají, takže se sečtou. Ve stejném seznamu v normálním toku by mezera byla 12 px.

### --see--

css-box-model/margin-collapse-a-bfc#kdy-se-marginy-neslevaji

## --card-- output

Seznam má `.list > * + * { margin-block-start: 8px; }` a v něm je šest položek. Kolik položek dostane horní margin?

### --expected--

5

### --accept--

pět

### --why--

`* + *` vybere jen prvek, před kterým je sourozenec. První položka margin nedostane.

### --see--

css-box-model/margin-collapse-a-bfc#mezery-drzi-rodic-stack-a-gap

## --card-- free

Co je slévání marginů (margin collapse) a kdy nenastane?

### --back--

Svislé marginy blokových boxů v normálním toku, které se dotknou, se nesčítají, ale slijí do jednoho: zůstane největší z nich. Stává se to u sousedních bloků, u rodiče s prvním nebo posledním dítětem a u prázdného bloku. Nenastane u vodorovných marginů, u položek flexboxu a gridu, u plovoucích a absolutně pozicovaných prvků a tam, kde marginy odděluje padding, rámeček nebo blokový formátovací kontext rodiče.

### --see--

css-box-model/margin-collapse-a-bfc#kdy-se-marginy-slevaji

## --card-- free

Co je blokový formátovací kontext a k čemu ho v praxi používáš?

### --back--

Je to oblast stránky, ve které se bloky rozvrhují nezávisle na okolí. Marginy dětí se v ní neslijí s rodičem, rodič obalí i plovoucí děti a sám se nepřekrývá s plovoucími prvky vedle sebe. Zakládá ho třeba `display: flow-root`, `inline-block`, `overflow` jiné než `visible` nebo flex a grid položky. V praxi ho zakládám přes `flow-root`, když z karty utíkají marginy nebo z ní vyčuhuje plovoucí obrázek.

### --see--

css-box-model/margin-collapse-a-bfc#blokovy-formatovaci-kontext

## --card-- free

Jaký je rozdíl mezi `display: block`, `inline` a `inline-block`?

### --back--

Blok začíná na novém řádku a zabírá celou šířku rodiče, rozměry i svislé marginy fungují. Řádkový box teče v řádku textu jako slovo, velikost mu určuje text a `width`, `height` ani svislý margin na něj nepůsobí. `inline-block` teče v řádku jako slovo, ale uvnitř se chová jako blok, takže mu jde nastavit rozměry a svislý padding odsune okolní řádky. Hodí se na tlačítka nebo štítky, které mají zůstat v textu.

### --see--

css-box-model/normalni-tok#blokove-a-radkove-boxy

## --card-- free

Proč je `width: auto` u blokového prvku skoro vždycky lepší než `width: 100%`?

### --back--

`auto` vyplní šířku rodiče a sama od ní odečte margin, rámeček i padding, takže se blok vždycky vejde. `width: 100%` pevně nastaví šířku rodiče a margin se přidá zvenku, takže blok přeteče; bez resetu `border-box` přetečou i padding a rámeček. Blok, který má vyplnit rodiče, proto šířku nepotřebuje, omezuju ho nanejvýš přes `max-inline-size`.

### --see--

css-box-model/box-model#width-auto-neni-totez-co-width-100

## --card-- free

Proč se v moderním CSS dávají svislé mezery jen jedním směrem nebo přes rodiče (stack, `gap`)?

### --back--

Svislé marginy se v normálním toku slévají, takže když mezeru nastaví oba sousedé, výsledek je větší z nich a ne součet, a margin prvního dítěte může utéct z rodiče. Mezera pak závisí na tom, kdo je vedle koho. Když mezery dávám jen jedním směrem, nebo je nastavuje rodič přes stack s `* + *` či `gap`, je každá mezera na jednom místě, nic neuteče a komponenty jdou skládat v libovolném pořadí.

### --see--

css-box-model/margin-collapse-a-bfc#mezery-drzi-rodic-stack-a-gap

## --card-- free

Stránka jde na telefonu posouvat do strany. Jak postupuješ?

### --back--

Nejdřív najdu prvek, který přetéká: v DevTools hledám box širší než okno, typicky dlouhou URL, obrázek s pevnou šířkou, tabulku, blok kódu nebo prvek s `width: 100%` a marginem. Opravím ten prvek: text zalomím přes `overflow-wrap: anywhere`, obrázku dám `max-inline-size: 100%` a `block-size: auto`, tabulku dám do obalu s `overflow-x: auto`. `overflow-x: hidden` na `body` problém jen schová a přetékající obsah zůstane useknutý.

### --see--

css-box-model/preteceni#typicke-chyby-a-pasti

## --card-- free

Proč na zadržení marginů v kartě radši použiješ `display: flow-root` než `overflow: hidden`?

### --back--

Obojí založí blokový formátovací kontext, takže marginy dětí zůstanou uvnitř. `overflow: hidden` ale navíc ořízne všechno, co z karty vyčuhuje: stín, obrys fokusu u odkazu nebo avatar posunutý záporným marginem přes okraj, a na obalu rozbije i přilepené prvky. `flow-root` žádný vedlejší efekt nemá, jeho jediný účel je založit nový kontext.

### --see--

css-box-model/margin-collapse-a-bfc#typicke-chyby-a-pasti

## --card-- free

K čemu se dnes používá `float` a jaký problém s ním má rodič?

### --back--

`float` se dnes používá jen na obtékání: obrázek nebo citace v článku, kolem které teče text. Rozvržení stránky a řady prvků se dělají flexboxem a gridem. Plovoucí prvek je vytažený z normálního toku a do výšky obyčejného rodiče se nepočítá, takže z něj vyčuhuje. Rodič ho obalí, když založí blokový formátovací kontext, nejlépe přes `display: flow-root`; jednotlivý prvek pod něj pošle `clear`.

### --see--

css-box-model/preteceni#float-jen-na-obtekani
