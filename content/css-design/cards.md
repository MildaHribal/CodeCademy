## --card-- css

Pole formuláře `.field` je flex kontejner ve sloupci s popiskem a inputem. Napiš deklaraci, která popisku a poli dá mezeru z tokenu `--space-1`, aby popisek patřil ke svému poli.

### --expected--

```css
gap: var(--space-1);
```

### --accept--

```css
row-gap: var(--space-1);
```

### --why--

Dvojice popisek a pole je skupina, takže dostane nejmenší stupeň stupnice. Mezera k dalšímu poli pak musí být viditelně větší.

### --see--

css-design/hierarchie-a-rozestupy#blizkost-a-seskupeni

## --card-- css

V jízdním řádu jsou pod sebou časy 8:05, 11:10 a 14:41 a číslice nesedí přesně pod sebou. Napiš deklaraci, která jim dá stejnou šířku.

### --expected--

```css
font-variant-numeric: tabular-nums;
```

### --why--

Proporcionální písmo má jedničku užší než osmičku. `tabular-nums` přepne na číslice se stejnou šířkou, takže se řády srovnají.

### --see--

css-design/hierarchie-a-rozestupy#zarovnani-a-bile-misto

## --card-- css

Panel *Drop shadow* ukazuje X 0, Y 2, Blur 6, Spread 0 a černou s průhledností 8 %. Napiš deklaraci stínu.

### --expected--

```css
box-shadow: 0 2px 6px 0 rgb(0 0 0 / 0.08);
```

### --accept--

```css
box-shadow: 0 2px 6px rgb(0 0 0 / 0.08);
```

```css
box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
```

```css
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
```

```css
box-shadow: 0 2px 6px 0 rgb(0 0 0 / 8%);
```

### --why--

Pořadí je stejné jako v panelu: posun X, posun Y, rozmazání, roztažení, barva. Průhlednost se píše za lomítko.

### --see--

css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty

## --card-- css

Hover tlačítka má být o 0.08 tmavší než `--color-accent` se stejnou chromou i odstínem. Napiš deklaraci `background` s relativní barvou.

### --expected--

```css
background: oklch(from var(--color-accent) calc(l - 0.08) c h);
```

### --accept--

```css
background-color: oklch(from var(--color-accent) calc(l - 0.08) c h);
```

### --why--

Kanál `l` je číslo od 0 do 1, takže odečítáš číslo. `calc(l - 8%)` by celou deklaraci zneplatnilo.

### --see--

css-design/barvy-a-typografie#stupnice-odstinu-z-jedne-barvy

## --card-- css

Pod aktivní položkou menu má být pozadí v barvě akcentu, ale jen z 12 % a zbytek průhledný. Napiš deklaraci `background` přes `color-mix()` v prostoru oklch.

### --expected--

```css
background: color-mix(in oklch, var(--color-accent) 12%, transparent);
```

### --accept--

```css
background-color: color-mix(in oklch, var(--color-accent) 12%, transparent);
```

```css
background: color-mix(in oklch, transparent, var(--color-accent) 12%);
```

### --why--

Procento u barvy určuje její podíl, druhá dostane zbytek. Míchání s `transparent` vyrobí průhlednou verzi tokenu, která se přebarví s ním.

### --see--

css-design/barvy-a-typografie#stupnice-odstinu-z-jedne-barvy

## --card-- css

Textový styl *Body/L* má písmo 16 px a výšku řádku 28 px. Napiš deklaraci `line-height` tak, aby ji vnořené prvky zdědily jako poměr.

### --expected--

```css
line-height: 1.75;
```

### --accept--

```css
line-height: calc(28 / 16);
```

### --why--

28 ÷ 16 = 1.75. Číslo bez jednotky se u každého potomka násobí jeho vlastním písmem, kdežto `28px` nebo `175%` by se zdědily jako hotové pixely.

### --see--

css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty

## --card-- css

V návrhu je u nadpisu prostrkání −1,5 %. Napiš deklaraci `letter-spacing`.

### --expected--

```css
letter-spacing: -0.015em;
```

### --accept--

```css
letter-spacing: -.015em;
```

```css
letter-spacing: -1.5%;
```

### --why--

Figma počítá procenta z velikosti písma a totéž dělá `em`. Hodnota tak zůstane správná, i když nadpis na mobilu zmenšíš.

### --see--

css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty

## --card-- css

Řádek zprávy je flex kontejner s avatarem, textem zprávy a časem. Text má v návrhu šířku *Fill container*. Napiš deklaraci pro text.

### --expected--

```css
flex: 1;
```

### --accept--

```css
flex: 1 1 0;
```

```css
flex: 1 1 0%;
```

```css
flex-grow: 1;
```

### --why--

*Fill* na hlavní ose znamená zabrat místo, které po ostatních položkách zbude. Avatar (*Fixed*) a čas (*Hug*) si nechají svou velikost.

### --see--

css-design/cteni-navrhu#hug-fill-a-fixed

## --card-- css

Obrysové ikony mají v SVG `stroke="#0F172A"`. Nechceš upravovat soubory, jen CSS. Napiš deklaraci do pravidla `.icon path`, aby čáry měly barvu textu.

### --expected--

```css
stroke: currentColor;
```

### --accept--

```css
stroke: currentcolor;
```

### --why--

Obrysová ikona kreslí čárou, takže barvu nese `stroke`. Pravidlo v CSS má přednost před atributem v SVG.

### --see--

css-design/svg-a-ikony#currentcolor-ikona-v-barve-textu

## --card-- css

Soubor variabilního písma obsahuje váhy od 200 do 800. Napiš deklaraci do `@font-face`, která to prohlížeči řekne.

### --expected--

```css
font-weight: 200 800;
```

### --why--

Rozsah dvou čísel říká, že jeden soubor pokryje každou váhu mezi nimi, takže funguje i `font-weight: 550`.

### --see--

css-design/barvy-a-typografie#pisma-font-face-a-variabilni-fonty

## --card-- output

Nadpis karty má `font-size: 1.5rem` a `margin-block-end: 1.5em`, kořen stránky má 16 px. Kolik px je mezera pod nadpisem?

### --expected--

36

### --accept--

36 px
36px

### --why--

`1.5rem` je 24 px a `em` v marginu se počítá z písma nadpisu: 1,5 × 24 = 36 px. Proto se rozestupy mezi bloky píšou v `rem` nebo tokenech.

### --see--

css-design/hierarchie-a-rozestupy#typicke-chyby-a-pasti

## --card-- output

Co vypíše tenhle výpočet typografické stupnice?

```js
const base = 16;
const ratio = 1.2;
const steps = [0, 1, 2, 3].map((step) => Math.round(base * ratio ** step));
console.log(steps.join(' '));
```

### --expected--

16 19 23 28

### --why--

Každý stupeň je předchozí vynásobený poměrem: 16, 19,2, 23,04 a 27,648 px. Stupnice roste násobením, ne přičítáním.

### --see--

css-design/barvy-a-typografie#typograficka-stupnice

## --card-- output

Ikona má `viewBox="0 0 16 16"` a v CSS velikost 24 × 24 px. Čára v ní má `stroke-width="1.5"`. Jak silná bude na stránce v px?

### --expected--

2.25

### --accept--

2,25
2.25 px
2,25 px
2.25px

### --why--

Plátno 16 jednotek se roztáhne na 24 px, jedna jednotka je 1,5 px. Čára 1,5 jednotky má tedy 2,25 px.

### --see--

css-design/svg-a-ikony#viewbox-souradnice-ne-pixely

## --card-- output

Na `.article` je `font-size: 16px` a `line-height: 125%`. Nadpis uvnitř má `font-size: 48px` a vlastní výšku řádku nemá. Kolik px bude výška řádku nadpisu?

### --expected--

20

### --accept--

20 px
20px

### --why--

Procenta se spočítají na rodiči (16 × 1,25 = 20 px) a nadpis zdědí hotových 20 px. S 48px písmem se jeho řádky překrývají. Číslo bez jednotky by se přepočítalo na 60 px.

### --see--

css-design/cteni-navrhu#typicke-chyby-a-pasti

## --card-- code js

Napiš funkci `pxToRem(px)`, která hodnotu z panelu návrhu převede na řetězec v `rem` při kořenovém písmu 16 px, třeba `pxToRem(24)` vrátí `'1.5rem'`.

### --seed--

```js
function pxToRem(px) {
}
```

### --test--

```js
assert.equal(pxToRem(24), '1.5rem', 'pxToRem(24) má vrátit "1.5rem"');
assert.equal(pxToRem(14), '0.875rem', 'pxToRem(14) má vrátit "0.875rem"');
assert.equal(pxToRem(16), '1rem', 'pxToRem(16) má vrátit "1rem"');
```

### --solution--

```js
function pxToRem(px) {
  return `${px / 16}rem`;
}
```

### --see--

css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty

## --card-- code js

Napiš funkci `lineHeightRatio(fontSize, lineHeight)`, která z hodnot v px z panelu návrhu vrátí výšku řádku jako číslo bez jednotky zaokrouhlené na 3 desetinná místa. `lineHeightRatio(18, 28)` vrátí `1.556`.

### --seed--

```js
function lineHeightRatio(fontSize, lineHeight) {
}
```

### --test--

```js
assert.equal(lineHeightRatio(18, 28), 1.556, 'lineHeightRatio(18, 28) má vrátit 1.556');
assert.equal(lineHeightRatio(20, 30), 1.5, 'lineHeightRatio(20, 30) má vrátit 1.5');
assert.equal(lineHeightRatio(56, 60), 1.071, 'lineHeightRatio(56, 60) má vrátit 1.071');
```

### --solution--

```js
function lineHeightRatio(fontSize, lineHeight) {
  return Math.round((lineHeight / fontSize) * 1000) / 1000;
}
```

### --see--

css-design/cteni-navrhu#dev-mode-jak-cist-hodnoty

## --card-- free

Proč má být mezera uvnitř skupiny (popisek a hodnota) menší než mezera mezi skupinami? Jak to souvisí s rámečky?

### --back--

Oko spojuje věci, které jsou u sebe, a odděluje ty, mezi kterými je místo (princip blízkosti). Když je popisek stejně daleko od své hodnoty jako od cizí, nepatří vizuálně k žádné. Mezera uvnitř skupiny proto bývá aspoň poloviční oproti mezeře mezi skupinami. Díky tomu skupiny oddělí samotný prostor a rámečky kolem každé části nejsou potřeba; každá čára navíc jen ruší.

### --see--

css-design/hierarchie-a-rozestupy#blizkost-a-seskupeni

## --card-- free

Proč se rozestupy a velikosti písma berou ze stupnice v tokenech, a ne od oka v pixelech?

### --back--

Hodnoty od oka (13, 15, 18 px) se liší tak málo, že nikdo nevidí záměr, a stránka působí neuspořádaně. Stupnice (4, 8, 12, 16, 24, 32…) zmenší rozhodování na „o stupeň víc, nebo míň" a stejné mezery se opakují napříč komponentami. Tokeny v `rem` rostou s nastavením písma v prohlížeči a změna stupnice je na jednom místě. Pro písmo platí totéž s modulární stupnicí, kde každý stupeň násobí předchozí stejným poměrem.

### --see--

css-design/hierarchie-a-rozestupy#stupnice-rozestupu

## --card-- free

Proč se paleta dnes staví v `oklch()`, a ne v `hsl()`?

### --back--

Světlost v `hsl()` je jen výpočet nad kanály RGB a neodpovídá tomu, jak barvu vidí oko: žlutá a modrá se stejným číslem mají s bílým textem úplně jiný kontrast. V `oklch()` první číslo sleduje vnímanou světlost, takže stupeň palety se stejnou světlostí má u všech odstínů podobný kontrast. Díky tomu jde stupnici odvodit z jedné barvy relativní barvou a pravidlo „stupeň 700 na text" platí pro celou paletu. Kontrast se stejně ověří v DevTools.

### --see--

css-design/barvy-a-typografie#oklch-svetlost-chroma-a-odstin

## --card-- free

Jaký je rozdíl mezi primitivním a sémantickým tokenem a jak ti to pomůže s tmavým motivem?

### --back--

Primitivní token pojmenuje hodnotu palety (`--gray-600`), sémantický její účel (`--color-text-muted`). Komponenty používají jen sémantické tokeny. Tmavý motiv pak změní jen to, na který primitiv sémantický token ukazuje, třeba přes `light-dark()`, a komponenty zůstanou beze změny. Kdyby komponenty používaly primitiva, musel bych tmavý motiv řešit v každé zvlášť a snadno bych na některou zapomněl.

### --see--

css-design/barvy-a-typografie#primitivni-a-semanticke-tokeny

## --card-- free

Dostaneš návrh komponenty z Figmy s auto layoutem. Jak ho převedeš do CSS a co z panelu naopak nepřebereš?

### --back--

Rámec s auto layoutem je flex kontejner: směr je `flex-direction`, *Gap* je `gap`, *Padding* je `padding`, *Gap: Auto* je `justify-content: space-between`. U dětí *Hug* nepotřebuje nic, *Fill* na hlavní ose je `flex: 1` a *Fixed* pevná velikost s `flex: none`. Barvy a rozměry přeložím na tokeny, písmo na `rem`, výšku řádku na poměr a prostrkání na `em`. Nepřeberu souřadnice X a Y ani pevné šířky kontejnerů z jedné nakreslené obrazovky, protože platí jen pro jeden text a jednu šířku.

### --see--

css-design/cteni-navrhu#auto-layout-je-flexbox

## --card-- free

Kdy vložíš ikonu jako inline SVG, kdy přes `<img>` a kdy ze spritu přes `<use>`?

### --back--

Inline SVG je součást stránky, takže se barví přes `currentColor` a zvětšuje v `em` jako text; hodí se na pár ikon a do komponent. `<img>` je uzavřený obrázek, do kterého styly stránky nevidí, takže se hodí na loga a ilustrace s vlastními barvami a prohlížeč ho uloží do cache. Sprite se `<symbol>` a `<use>` se chová jako inline SVG, ale kresba je v HTML jen jednou, takže se hodí pro stejnou ikonu na mnoha místech. Ikonu, kterou nejde vložit do HTML, obarvím maskou s `background-color: currentColor`.

### --see--

css-design/svg-a-ikony#tri-zpusoby-jak-ikonu-vlozit

## --card-- free

Jak uděláš tlačítko, které obsahuje jen ikonu, přístupné pro čtečku obrazovky i pro dotyk?

### --back--

Tlačítko dostane přístupné jméno, které popisuje akci, třeba `aria-label="Zavřít"`, a SVG uvnitř `aria-hidden="true"`, aby ho čtečka neohlásila jako obrázek navíc. Bez jména čtečka řekne jen „tlačítko". Plocha na klepnutí má mít kolem 44 × 44 px, zvětším proto padding, ne ikonu. Ikona má kontrast aspoň 3 : 1 a fokus z klávesnice je vidět přes `:focus-visible`.

### --see--

css-design/svg-a-ikony#pristupnost-ikon

## --card-- free

Na co se zeptáš návrháře, než začneš podle návrhu kódovat?

### --back--

Návrh ukazuje ideální stav, takže se ptám na to, co v kódu určitě nastane: stavy komponent (hover, fokus, neaktivní, načítání), prázdný stav a chyby, dlouhé a chybějící texty nebo obrázky, šířky mezi nakreslenými obrazovkami, tmavý motiv s ověřeným kontrastem a pohyb včetně omezeného pohybu. Otázky pošlu najednou dřív, než to napíšu. Když návrhář odpoví „rozhodni sám", navrhnu řešení a nechám ho schválit.

### --see--

css-design/cteni-navrhu#na-co-se-doptat-navrhare
