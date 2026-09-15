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
