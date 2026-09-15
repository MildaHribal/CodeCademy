## --card-- css

Karta produktu se nemá nikam posunout, ale štítky uvnitř ní s `position: absolute` se mají měřit od jejích rohů. Napiš deklaraci pro kartu.

### --expected--

```css
position: relative;
```

### --why--

`relative` bez `top` a `left` prvek nechá na místě, jen z něj udělá pozicovaný prvek, a tím obsahující blok pro absolutní potomky.

### --see--

css-pozicovani/position#absolute-a-obsahujici-blok

## --card-- css

Poloprůhledná vrstva „Vyprodáno" má ležet přes celou kartu, která už má `position: relative`. Vrstva je `position: absolute`. Napiš jednu deklaraci, která ji roztáhne od všech čtyř hran karty.

### --expected--

```css
inset: 0;
```

### --accept--

```css
top: 0; right: 0; bottom: 0; left: 0;
```

### --why--

`inset` je zkratka pro `top`, `right`, `bottom` a `left`. Absolutní prvek s nastavenými protilehlými stranami a bez rozměrů se roztáhne mezi ně.

### --see--

css-pozicovani/position#inset-roztazeni-a-velikost

## --card-- css

Lišta s filtry nad seznamem bytů se má při rolování držet 8 px pod horní hranou okna a dokud se neroluje, zabírat své místo v toku. Napiš obě deklarace.

### --expected--

```css
position: sticky; top: 8px;
```

### --accept--

```css
position: sticky; top: 0.5rem;
```

```css
position: sticky; inset-block-start: 8px;
```

### --why--

`sticky` bez `top` (nebo jiné strany) se nelepí nikam. Na rozdíl od `fixed` prvek dál zabírá místo v toku.

### --see--

css-pozicovani/position#sticky-lepi-se-dokud-muze

## --card-- css

Karusel produktů ořezává přesah do strany deklarací `overflow-x: hidden` a přilepené nadpisy uvnitř se kvůli tomu nelepí k oknu. Napiš deklaraci, která přesah ořízne stejně, ale posuvný kontejner nevytvoří.

### --expected--

```css
overflow-x: clip;
```

### --accept--

```css
overflow: clip;
```

### --why--

`hidden` z prvku dělá posuvný kontejner a sticky potomci se lepí k němu. `clip` jen ořízne a lepení nechá na okně.

### --see--

css-pozicovani/position#typicke-chyby-a-pasti

## --card-- css

Nadpisy sekcí v dlouhém návodu mají po kliknutí na odkaz v obsahu skončit 88 px pod horní hranou okna, aby je nezakryla přilepená hlavička. Napiš deklaraci pro nadpisy.

### --expected--

```css
scroll-margin-top: 88px;
```

### --accept--

```css
scroll-margin-top: 5.5rem;
```

```css
scroll-margin-block-start: 88px;
```

### --why--

Prohlížeč při skoku na kotvu roluje tak, aby cíl byl u horní hrany okna, a o přilepené hlavičce neví. `scroll-margin-top` posune místo, kde se rolování zastaví, a vzhled stránky nezmění.

### --see--

css-pozicovani/position#typicke-chyby-a-pasti

## --card-- css

Widget s mapou používá uvnitř vlastní `z-index` pro body, bubliny a ovládání. Jeho čísla nemají soutěžit s hlavičkou ani modálním oknem stránky. Napiš deklaraci pro obal widgetu, která nic neposune ani nezprůhlední.

### --expected--

```css
isolation: isolate;
```

### --why--

`isolation: isolate` založí stacking context a nic jiného nedělá. Vrstvy uvnitř widgetu se pak porovnávají jen mezi sebou.

### --see--

css-pozicovani/stacking-context#isolation-isolate-kontext-naschval

## --card-- css

Nabídka filtru je ukotvená k tlačítku u levého okraje stránky. Má ležet pod tlačítkem, začínat u jeho levé hrany a růst doprava. Napiš deklaraci s polohou v mřížce kolem kotvy.

### --expected--

```css
position-area: bottom span-right;
```

### --accept--

```css
position-area: span-right bottom;
```

### --why--

`bottom` vybere řadu pod kotvou a `span-right` sloupec kotvy spolu se sloupcem vpravo, takže prvek začne u levé hrany kotvy a pokračuje doprava.

### --see--

css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

## --card-- css

Tooltip u ikon v levém bočním panelu má `position-area: left`. U ikon těsně u levého okraje okna by vyjel ven. Napiš deklaraci, po které se tam přehodí doprava.

### --expected--

```css
position-try-fallbacks: flip-inline;
```

### --accept--

```css
position-try-fallbacks: right;
```

```css
position-try: flip-inline;
```

### --why--

`flip-inline` přehodí polohu ve vodorovném směru. Prohlížeč záložní polohu použije, jen když se tooltip do původní nevejde.

### --see--

css-pozicovani/top-layer-a-kotveni#zalozni-polohy-position-try-fallbacks

## --card-- css

Seznam našeptávání pod vyhledávacím polem je ukotvený k poli. Napiš deklaraci, po které bude seznam přesně tak široký jako pole.

### --expected--

```css
width: anchor-size(width);
```

### --accept--

```css
inline-size: anchor-size(inline-size);
```

```css
width: anchor-size(inline);
```

### --why--

`anchor-size()` vrátí rozměr kotvy. Když pole změní šířku, seznam se změní s ním.

### --see--

css-pozicovani/top-layer-a-kotveni#presneji-anchor-a-anchor-size

## --card-- output

Oba bloky jsou sourozenci v tomhle pořadí. Který z prvků `.b` a `.c` bude navrchu tam, kde se překrývají? Napiš jeho třídu.

```css
.a { position: relative; z-index: 1; }
.a .b { position: absolute; z-index: 999; }
.c { position: relative; z-index: 2; }
```

### --expected--

.c

### --accept--

c

### --why--

`.a` se `z-index: 1` je stacking context a `.b` se v něm uzavře. Na úrovni stránky se porovnává `.a` (1) s `.c` (2), takže `.c` vyhraje i nad `.b` s číslem 999.

### --see--

css-pozicovani/stacking-context#proc-se-prvek-nedostane-nad-sourozence-rodice

## --card-- output

Panel s filtry má `<form class="filters" popover>` a v CSS `.filters { display: grid; gap: 12px; }`. Stránka se právě načetla a nikdo na tlačítko Filtry neklikl. Je panel na stránce vidět? Napiš „ano", nebo „ne".

### --expected-- ignore-case

ano

### --why--

Zavřený popover schovává výchozí styl `display: none` a autorské `display: grid` ho přebije. Rozvržení patří do pravidla `.filters:popover-open`.

### --see--

css-pozicovani/top-layer-a-kotveni#vychozi-styly-popover-open-a-backdrop

## --card-- output

Odstavec `<p>` v obyčejném bloku (rodič není flex ani grid) má jen `z-index: 10`. Změní se tím, co je nad ním a pod ním? Napiš „ano", nebo „ne".

### --expected-- ignore-case

ne

### --why--

`z-index` působí jen na pozicované prvky a na položky flexboxu a gridu. Neaktivní deklaraci ukáže i DevTools.

### --see--

css-pozicovani/stacking-context#poradi-vykresleni

## --card-- output

Panel má `position: relative`, obsah široký 500 px a `padding: 10px`. Tlačítko v něm má `position: absolute; left: 0; right: 0;` a žádnou šířku. Jak široké bude tlačítko v px?

### --expected--

520

### --accept--

520 px
520px

### --why--

Obsahující blok pro `absolute` sahá po vnitřní hranu rámečku, padding do něj patří: 500 + 2 × 10 = 520 px.

### --see--

css-pozicovani/position#inset-roztazeni-a-velikost

## --card-- output

Kotva je 60 × 40 px s levým horním rohem na souřadnicích 300 × 200 px. Prvek 50 × 20 px má `position-area: right` a `margin: 0`. Na jaké vodorovné souřadnici (v px) bude jeho levá hrana?

### --expected--

360

### --accept--

360 px
360px

### --why--

Buňka `right` začíná u pravé hrany kotvy: 300 + 60 = 360 px. Svisle bude prvek vycentrovaný s kotvou.

### --see--

css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

## --card-- output

Tři záložky mají všechny `anchor-name: --tab` a ukazatel pod nimi má `position-anchor: --tab`. Pod kolikátou záložkou bude ukazatel? Napiš číslo.

### --expected--

3

### --accept--

třetí

### --why--

Když jméno kotvy sdílí víc prvků, kotvou je poslední z nich v HTML.

### --see--

css-pozicovani/top-layer-a-kotveni#typicke-chyby-a-pasti

## --card-- output

Nástěnka `.board` je vysoká 2 400 px a má `backdrop-filter: blur(6px)`. Uvnitř je tlačítko chatu `position: fixed; right: 24px; bottom: 24px;`. Okno je vysoké 800 px. Uvidíš tlačítko hned po otevření stránky, bez rolování? Napiš „ano", nebo „ne".

### --expected-- ignore-case

ne

### --why--

`backdrop-filter` na předkovi z něj udělá obsahující blok i pro `fixed` potomky. Tlačítko je 24 px nad spodní hranou nástěnky, tedy asi 2 300 px od začátku stránky — hluboko pod oknem.

### --see--

css-pozicovani/position#fixed-prispendlene-k-oknu

## --card-- free

Jak se liší `relative`, `absolute`, `fixed` a `sticky`? Odpověz tak, jak bys to řekl na pohovoru.

### --back--

Hodnota `position` rozhoduje o dvou věcech: jestli prvek zabírá místo v toku a od čeho se měří `top`, `left` a spol. `relative` místo drží a posouvá se od své původní polohy. `absolute` z toku vypadne a měří se od nejbližšího pozicovaného předka. `fixed` taky vypadne z toku a měří se od okna, dokud předek nemá `transform` nebo `filter`. `sticky` zabírá místo jako obyčejný prvek a při rolování se přilepí k hranici z `top`, ale jen v rámci svého rodiče a nejbližšího posuvného kontejneru.

### --see--

css-pozicovani/position#problem-stitek-v-rohu-karty

## --card-- free

Co je obsahující blok a proč se štítek s `position: absolute` někdy objeví v rohu stránky místo v rohu karty?

### --back--

Obsahující blok je obdélník, od kterého se měří poloha a procentní rozměry prvku. Pro `absolute` je to vnitřní hrana rámečku nejbližšího předka s `position` jinou než `static`. Když karta pozicovaná není a žádný jiný předek taky ne, měří se štítek od začátku stránky. Oprava je dát kartě `position: relative`. Pro `fixed` je obsahujícím blokem okno, ale přebije ho předek s `transform`, `filter`, `backdrop-filter` nebo `will-change: transform`.

### --see--

css-pozicovani/position#absolute-a-obsahujici-blok

## --card-- free

Kolega dal nabídce `z-index: 99999` a pořád je pod sousední kartou. Jak to vysvětlíš a jak budeš postupovat?

### --back--

`z-index` se porovnává jen uvnitř stejného stacking contextu. Nabídka je nejspíš v kartě, která kontext zakládá — třeba kvůli `transform`, `opacity` pod 1, `filter` nebo `z-index` na pozicovaném prvku — a navenek se porovnává celá karta se sousední kartou. V DevTools projdu předky nabídky a hledám první, který kontext zakládá. Pak buď zvednu `z-index` jemu, odeberu mu kontext, přesunu nabídku v HTML mimo něj, nebo z nabídky udělám popover, který je v top layer.

### --see--

css-pozicovani/stacking-context#co-zaklada-stacking-context

## --card-- free

Proč se `position: sticky` často nelepí? Vyjmenuj typické příčiny.

### --back--

Zaprvé chybí `top` nebo jiná strana, bez ní se prvek nelepí nikam. Zadruhé má některý předek `overflow` `hidden`, `auto` nebo `scroll`, a prvek se lepí k němu místo k oknu — i `overflow-x: hidden` stačí; oříznout bez tohohle efektu umí `overflow: clip`. Zatřetí je rodič stejně vysoký jako sticky prvek, typicky položka flexboxu nebo gridu roztažená na výšku řádku, takže se nemá kam posunout; pomůže `align-self: start`.

### --see--

css-pozicovani/position#typicke-chyby-a-pasti

## --card-- free

Kdy použiješ atribut `popover` a kdy modální `<dialog>`?

### --back--

Oba se vykreslí v top layer. Popover nechá stránku aktivní, fokus zůstane na tlačítku a varianta `auto` se zavře kliknutím mimo nebo Esc, takže se hodí na nabídky, tooltipy, výběry a oznámení. Modální dialog stránku pod sebou zablokuje, přesune fokus dovnitř a kliknutím mimo se nezavře — patří na potvrzení, přihlášení nebo formulář, který musí uživatel vyřídit, než bude pokračovat.

### --see--

css-pozicovani/top-layer-a-kotveni#dialog-pro-modalni-okna

## --card-- free

Co je top layer a proč se v něm popover nemusí starat o `overflow` a `z-index`?

### --back--

Top layer je zvláštní vrstva nad celou stránkou, do které prohlížeč přesune otevřený popover, modální dialog a prvek na celou obrazovku. V HTML prvek zůstává na svém místě, ale vykreslí se mimo stacking contexty předků, `overflow` předků ho neořízne a obsahujícím blokem je okno. Proto nabídka v kartě s `overflow: hidden` nebo `transform` zůstane celá a navrchu bez jediného `z-index`.

### --see--

css-pozicovani/top-layer-a-kotveni#problem-nabidka-kterou-nic-neudrzi

## --card-- free

Jak dnes bez JavaScriptu posadíš nabídku pod tlačítko a zařídíš, aby u okraje okna nevyjela ven?

### --back--

Nabídku udělám popoverem otevíraným přes `popovertarget`. Tlačítku dám `anchor-name`, nabídce `position-anchor` se stejným jménem a polohu vyberu přes `position-area`, třeba `bottom span-left`, nebo přesně přes `anchor()`. Pro okraj okna přidám `position-try-fallbacks`, třeba `flip-block`, a prohlížeč nabídku přehodí, jen když se nevejde. Když je nabídek víc, každá dvojice potřebuje vlastní jméno kotvy, jinak vyhraje poslední tlačítko. Starší prohlížeč bez ukotvení ukáže popover aspoň uprostřed okna.

### --see--

css-pozicovani/top-layer-a-kotveni#ukotveni-anchor-name-position-anchor-a-position-area

## --card-- free

Jak udržet `z-index` v pořádku ve větším projektu?

### --back--

Čísla nepíšu ručně, ale mám pár pojmenovaných vrstev v custom properties — třeba nabídky, přilepené lišty, ztmavení, modální okno a oznámení — s rozestupy, aby šlo přidat vrstvu mezi. Komponenty, které si uvnitř řeší vlastní vrstvy, uzavřu přes `isolation: isolate`, aby jejich čísla nesoutěžila se zbytkem stránky. Nabídky a dialogy dávám do top layer přes `popover` a `<dialog>`, takže škálu vůbec nepotřebují.

### --see--

css-pozicovani/stacking-context#skala-z-index-v-tokenech
