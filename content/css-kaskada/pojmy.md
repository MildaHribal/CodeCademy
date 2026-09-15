## --term-- kaskáda

en: cascade
aliases: kaskády, kaskádě, kaskádu, kaskádou
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade
lekce: css-kaskada/kaskada#problem-styl-ktery-se-neprojevi

Algoritmus, který ze všech deklarací mířících na stejnou vlastnost stejného prvku vybere jedinou vítěznou. Porovnává postupně původ a důležitost, inline styl, vrstvy, specificitu a pořadí ve zdroji.

## --term-- původ stylu

en: cascade origin
aliases: původu stylu, původem stylu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade#origin_types
lekce: css-kaskada/kaskada#puvod-stylu-prohlizec-nebo-ty

Odkud deklarace pochází: z výchozích stylů prohlížeče, nebo od autora stránky. Běžná autorská deklarace vyhraje nad stylem prohlížeče bez ohledu na specificitu.

## --term-- pořadí ve zdroji

en: order of appearance
aliases: pořadím ve zdroji, pořadí v souboru
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade#cascading_order
lekce: css-kaskada/kaskada#poradi-ve-zdroji

Poslední kritérium kaskády: mezi jinak rovnocennými deklaracemi vyhraje ta, která je v CSS později. Počítá se pořadí pravidel a připojených souborů, ne pořadí tříd v HTML.

## --term-- specificita

en: specificity
aliases: specificity, specificitu, specificitou, specificitě
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity
lekce: css-kaskada/kaskada#specificita-trojice-a-b-c

Síla selektoru zapsaná jako trojice (A, B, C): počet id, počet tříd, atributů a pseudotříd, počet typů prvků a pseudoelementů. Porovnává se zleva, sloupce se nepřelévají.

## --term-- inline styl

en: inline style
aliases: inline stylu, inline styly, inline stylem
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/style
lekce: css-kaskada/kaskada#inline-styl-a-important

Deklarace zapsaná v atributu `style` přímo na prvku. Přebije deklaraci z jakéhokoli selektoru ve stylopisu, prohraje jen s `!important`.

## --term-- kaskádová vrstva

en: cascade layer
aliases: kaskádové vrstvy, kaskádovou vrstvu, kaskádových vrstev, kaskádovými vrstvami
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
lekce: css-kaskada/kaskada#vrstvy-layer

Pojmenovaná skupina stylů vytvořená `@layer`. Běžná deklarace v pozdější vrstvě vyhraje nad dřívější bez ohledu na specificitu, styly mimo vrstvy vyhrají nad všemi vrstvami a u `!important` se pořadí obrací.

## --term-- utility třída

en: utility class
aliases: utility třídy, utility třídu, utility tříd, utilita, utility, utilitu, utilitou
mdn: https://developer.mozilla.org/en-US/docs/Glossary/CSS
lekce: css-kaskada/kaskada#vrstvy-layer

Malá třída s jediným úkolem, třeba `.u-center` nebo `.u-hidden`. Má vyhrát nad styly komponent, proto patří do poslední vrstvy.

## --term-- shovívavý seznam selektorů

en: forgiving selector list
aliases: shovívavý seznam, shovívavého seznamu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/Selector_list#forgiving_selector_list
lekce: css-kaskada/moderni-selektory#is-seznam-v-jednom-selektoru

Seznam selektorů v `:is()` a `:where()`, ze kterého prohlížeč přeskočí jen neplatnou položku. Obyčejný seznam oddělený čárkami se kvůli jedné neplatné položce zahodí celý.

## --term-- kvantitní dotaz

en: quantity query
aliases: kvantitní dotazy, kvantitního dotazu, kvantitním dotazem
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/:has
lekce: css-kaskada/moderni-selektory#has-styl-rodice-podle-obsahu

Selektor, který stylizuje kontejner podle počtu položek, třeba `.gallery:has(> :nth-child(4))` pro galerii s aspoň čtyřmi dětmi.

## --term-- vnořování

en: CSS nesting
aliases: vnořování CSS, vnořené pravidlo, vnořená pravidla, vnořeného pravidla, vnořených pravidel
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting
lekce: css-kaskada/moderni-selektory#vnorovani-css-nesting

Zápis pravidla uvnitř jiného pravidla. `&` zastupuje rodičovský selektor, bez `&` jde o potomka. Specificita se počítá, jako by rodič byl v `:is()`.

## --term-- dědění

en: inheritance
aliases: dědění hodnot, dědí, zděděná hodnota, zděděnou hodnotu, zděděné hodnoty
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Inheritance
lekce: css-kaskada/dedicnost#problem-tlacitko-bez-pisma-stranky

Prvek převezme spočtenou hodnotu vlastnosti od rodiče, když je vlastnost dědičná (hlavně vlastnosti textu) a na prvek nemíří žádná deklarace té vlastnosti, ani z výchozích stylů prohlížeče.

## --term-- počáteční hodnota

en: initial value
aliases: počáteční hodnotu, počáteční hodnoty, počáteční hodnotou
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Value_processing#initial_value
lekce: css-kaskada/dedicnost#klicova-slova-inherit-initial-unset-a-revert

Hodnota vlastnosti daná specifikací CSS, kterou vrací klíčové slovo `initial`. Není to výchozí styl prohlížeče: počáteční `display` je `inline` pro všechny prvky.
