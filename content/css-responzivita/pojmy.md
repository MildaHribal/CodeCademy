## --term-- mobile-first

en: mobile-first
aliases: mobile first
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Mobile_First
lekce: css-responzivita/mobile-first#problem-stranka-z-pocitace-na-telefonu

Postup, kdy základní styly píšeš pro nejužší obrazovku a media dotazy s `width >=` k nim přidávají rozvržení pro širší okna.

## --term-- layout viewport

en: layout viewport
aliases: okno stránky, rozvrhovací okno
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Layout_viewport
lekce: css-responzivita/mobile-first#meta-viewport-rekni-telefonu-ze-web-je-pripraveny

Plocha, do které prohlížeč stránku rozvrhuje a ke které se vztahují media dotazy a jednotky `vw`. Mobilní prohlížeč ji bez značky `<meta name="viewport">` nastaví na asi 980 px.

## --term-- media dotaz

en: media query
aliases: media dotazu, media dotazem, media dotazy, media dotazů, media dotazech, media dotazům
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
lekce: css-responzivita/mobile-first#media-dotaz-a-syntaxe-rozsahu

Blok `@media (podmínka) { … }`, jehož pravidla platí, jen když okno nebo zařízení podmínku splňuje. Specificitu pravidlům nepřidává.

## --term-- syntaxe rozsahů

en: range syntax
aliases: syntaxí rozsahů, syntaxi rozsahů
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries#syntax_improvements_in_level_4
lekce: css-responzivita/mobile-first#media-dotaz-a-syntaxe-rozsahu

Zápis podmínek porovnáním: `(width >= 40rem)`, `(40rem <= width < 64rem)`. Na rozdíl od `min-width` a `max-width` umí i ostrou nerovnost.

## --term-- bod zlomu

en: breakpoint
aliases: body zlomu, bodu zlomu, bodem zlomu, bodech zlomu, bodů zlomu
mdn: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design#media_queries
lekce: css-responzivita/mobile-first#body-zlomu-podle-obsahu

Šířka, na které media dotaz nebo container query mění rozvržení. Volí se podle toho, kde se obsah přestane vejít, ne podle konkrétních zařízení.

## --term-- dotykový cíl

en: touch target
aliases: dotykového cíle, dotykové cíle, dotykových cílů, dotykovým cílem
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Operable#guideline_2.5_input_modalities
lekce: css-responzivita/mobile-first#dotykove-cile

Plocha, na kterou jde klepnout prstem. Doporučená velikost je 44 × 44 px, WCAG 2.2 bere jako minimum 24 × 24 px.

## --term-- container query

en: container query
aliases: container queries, container query dotaz, dotaz na kontejner, dotazy na kontejner
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
lekce: css-responzivita/container-queries#problem-komponenta-nevi-kde-je

Blok `@container (podmínka) { … }`, jehož pravidla platí podle velikosti nejbližšího předka s `container-type`, ne podle okna.

## --term-- kontejner dotazu

en: query container
aliases: kontejneru dotazu, kontejnerem dotazu, kontejnery dotazu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/container-type
lekce: css-responzivita/container-queries#kontejner-container-type-a-container

Prvek s `container-type: inline-size` (nebo `size`), na jehož šířku se ptají container queries jeho potomků. Jeho šířka se počítá bez ohledu na obsah.

## --term-- jednotka cqi

en: container query inline-size unit
aliases: jednotky cqi, jednotku cqi, jednotkami cqi, cqi
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries#container_query_length_units
lekce: css-responzivita/container-queries#jednotky-kontejneru-cqi

`1cqi` je 1 % šířky nejbližšího kontejneru dotazu. Bez kontejneru se počítá z malého okna prohlížeče.

## --term-- pojmenovaný kontejner

en: named container
aliases: pojmenovaného kontejneru, pojmenované kontejnery, pojmenovaných kontejnerů, jméno kontejneru
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/container-name
lekce: css-responzivita/container-queries#pojmenovane-kontejnery

Kontejner se jménem z `container-name` nebo zkratky `container: jméno / inline-size`. Podmínka `@container jméno (…)` přeskočí bližší kontejnery s jiným jménem.

## --term-- plynulá velikost

en: fluid sizing
aliases: plynulé velikosti, plynulou velikost, plynulá typografie, plynulé typografie
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
lekce: css-responzivita/mobile-first#plynule-velikosti-clamp

Velikost písma nebo rozestupu, která roste s oknem nebo kontejnerem bez skoků a drží se mezi minimem a maximem, typicky `clamp(2rem, 1rem + 4vw, 3.5rem)`.

## --term-- responzivní obrázek

en: responsive image
aliases: responzivní obrázky, responzivního obrázku, responzivních obrázků
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
lekce: css-responzivita/mobile-first#obrazky-srcset-a-sizes

Obrázek s atributy `srcset` a `sizes`, u kterého si prohlížeč sám vybere soubor podle skutečné šířky na stránce a hustoty displeje.

## --term-- color-scheme

en: color-scheme
aliases: color scheme
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
lekce: css-responzivita/preference-uzivatele#color-scheme-rekni-prohlizeci-co-stranka-umi

Vlastnost, která prohlížeči říká, jaké motivy stránka nebo její část podporuje (`light`, `dark`, `light dark`). Řídí se jí formuláře, posuvníky, výchozí barvy a funkce `light-dark()`.

## --term-- light-dark()

en: light-dark()
aliases: light-dark
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
lekce: css-responzivita/preference-uzivatele#light-dark-dve-hodnoty-v-jedne-deklaraci

Funkce se dvěma barvami, která vrátí první ve světlém a druhou v tmavém motivu. Řídí se použitým `color-scheme`; bez něj vrací vždy první barvu.

## --term-- omezený pohyb

en: reduced motion
aliases: omezení pohybu, omezeným pohybem, omezeného pohybu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
lekce: css-responzivita/preference-uzivatele#omezeny-pohyb-prefers-reduced-motion

Nastavení systému, kterým uživatel žádá méně pohybu na obrazovce. Web ho pozná podle `prefers-reduced-motion: reduce` a vypne posuny, paralaxu a velké animace.

## --term-- vynucené barvy

en: forced colors
aliases: vynucených barev, vynucenými barvami, režim vynucených barev
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
lekce: css-responzivita/preference-uzivatele#kontrast-a-vynucene-barvy

Režim, ve kterém systém (třeba kontrastní režim Windows) nahradí barvy stránky omezenou paletou a odstraní stíny. Pozná se podle `forced-colors: active`.
