## --term-- přechod

en: transition
aliases: přechody, přechodu, přechodem, přechodů, přechodech
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions
lekce: css-animace/transition-transform#problem-zmena-stavu-skokem

Plynulá změna hodnoty vlastnosti mezi dvěma stavy, kterou spustí změna stylu (`:hover`, třída, otevření). Nastavuje se vlastností `transition` na základním pravidle prvku.

## --term-- překmit

en: overshoot
aliases: překmitem, překmitu
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/cubic-bezier
lekce: css-animace/transition-transform#casovaci-funkce-jak-se-pohyb-zrychluje

Hodnota během animace přestřelí cíl a vrátí se zpátky. Vzniká časovací funkcí `cubic-bezier()` s `y` větším než 1 nebo funkcí `linear()`.

## --term-- transformace

en: transform
aliases: transformací, transformaci, transformacemi, transformacím
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
lekce: css-animace/transition-transform#transformace-posun-zvetseni-otoceni

Posun, zvětšení, otočení nebo zkosení vykresleného prvku (`translate`, `scale`, `rotate`, `transform`). Uplatní se až po rozvržení, takže sousední prvky se nepohnou.

## --term-- @starting-style

en: starting style
aliases: starting-style
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style
lekce: css-animace/transition-transform#objeveni-a-zmizeni-starting-style-a-allow-discrete

Blok pravidel se stylem, ze kterého přechod začne, když se prvek poprvé vykreslí (přidání do stránky, `display: none` → `block`, otevření popoveru).

## --term-- cesta k pixelům

en: rendering pipeline
aliases: cestou k pixelům, cesty k pixelům, cestě k pixelům
mdn: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work
lekce: css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

Fáze, kterými prohlížeč převádí styly na obrazovku: styl, rozvržení, kreslení, skládání. Změna vlastnosti spustí práci od své fáze dál.

## --term-- časovací funkce

en: easing function
aliases: časovací funkcí, časovací funkci, časovacích funkcí, časovací funkcemi
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function
lekce: css-animace/transition-transform#casovaci-funkce-jak-se-pohyb-zrychluje

Křivka, podle které se hodnota během přechodu nebo animace mění: `ease-out` rychle začne a zpomalí, `linear` jede stálou rychlostí, `cubic-bezier()` a `linear()` popíšou vlastní průběh.

## --term-- klíčové snímky

en: keyframes
aliases: klíčových snímků, klíčovými snímky, klíčovým snímkům
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
lekce: css-animace/keyframes#problem-pohyb-bez-zmeny-stavu

Blok `@keyframes` s hodnotami vlastností v určitých okamžicích animace (`from`, `to`, procenta). Vlastnost `animation` ho prvku přehraje, i bez změny stavu a klidně pořád dokola.

## --term-- animation-fill-mode

en: animation-fill-mode
aliases: fill-mode
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
lekce: css-animace/keyframes#keyframes-a-vlastnost-animation

Určuje, jestli styl ze snímků platí i mimo běh animace: `backwards` během zpoždění, `forwards` po konci, `both` obojí. Výchozí `none` po konci vrátí styl prvku.

## --term-- @property

en: registered custom property
aliases: registrovaná custom property
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/@property
lekce: css-animace/keyframes#property-animace-gradientu-a-vlastnich-promennych

Pravidlo, které custom property přidělí typ (`syntax`), dědičnost a výchozí hodnotu. Registrovanou vlastnost umí prohlížeč animovat, třeba úhel uvnitř gradientu.

## --term-- view transition

en: view transition
aliases: view transitions, view transitionu
mdn: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
lekce: css-animace/view-transitions-scroll#problem-zmena-obsahu-skokem

Animace změny obsahu stránky: prohlížeč vyfotí stav před změnou a po ní a mezi snímky animuje. Spouští ji `document.startViewTransition()` nebo navigace se `@view-transition`.

## --term-- animace řízená scrollem

en: scroll-driven animation
aliases: animace řízené scrollem, animací řízených scrollem, animacemi řízenými scrollem
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
lekce: css-animace/view-transitions-scroll#animace-rizena-scrollem-scroll

Animace, jejíž průběh místo času určuje poloha posuvníku (`scroll()`) nebo poloha prvku v okně (`view()`), nastavená přes `animation-timeline`.
