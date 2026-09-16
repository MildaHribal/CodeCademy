## --term-- Web Animations API

en: Web Animations API
aliases: WAAPI
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
lekce: css-efekty-animace/gsap-zaklady#web-animations-api-most-mezi-css-a-knihovnou

Rozhraní prohlížeče pro animace z JavaScriptu (`element.animate()`). Běží na stejném enginu jako CSS animace a vrací objekt `Animation` s ovládáním a promisem `finished`.

## --term-- tween

en: tween
aliases: tweeny, tweenu, tweenem, tweenů, tweenům, tweenech
lekce: css-efekty-animace/gsap-zaklady#gsap-to-from-fromto-a-set

Jedna animace v GSAPu: sada prvků, cílové (nebo počáteční) hodnoty a nastavení jako `duration` a `ease`. Vzniká přes `gsap.to`, `gsap.from` nebo `gsap.fromTo`.

## --term-- autoAlpha

en: autoAlpha
lekce: css-efekty-animace/gsap-zaklady#gsap-to-from-fromto-a-set

Zkratka GSAPu pro `opacity`, která při hodnotě 0 nastaví i `visibility: hidden` a při kladné hodnotě ji vrátí. Neviditelný prvek pak nejde kliknout ani nafokusovat.

## --term-- timeline

en: timeline
aliases: timelinu, timelině, timelinou, časová osa GSAPu
lekce: css-efekty-animace/gsap-zaklady#timeline-sekvence-bez-pocitani-delay

Kontejner na tweeny v GSAPu (`gsap.timeline()`). Řadí je za sebe, počítá začátky podle pozic a celou sekvenci ovládá jako jeden objekt.

## --term-- pozice v timeline

en: position parameter
aliases: pozici v timeline, pozic v timeline
lekce: css-efekty-animace/gsap-zaklady#timeline-sekvence-bez-pocitani-delay

Třetí argument metody timeline, který určuje začátek tweenu: `'<'`, `'>'`, `'-=0.3'`, `'<0.2'`, číslo nebo štítek. Měří se od sousedních tweenů, takže se po změně délky posune sám.

## --term-- probliknutí obsahu

en: flash of unstyled content (FOUC)
aliases: probliknutí, FOUC
lekce: css-efekty-animace/gsap-zaklady#typicke-chyby-a-pasti

Krátký okamžik, kdy je obsah vidět v konečném stavu, než ho skript schová a začne animovat. Řeší se třídou `js` přidanou skriptem v `<head>` a pravidlem s `visibility: hidden`.

## --term-- magnetické tlačítko

en: magnetic button
aliases: magnetického tlačítka, magnetickým tlačítkem
lekce: css-efekty-animace/gsap-zaklady#gsap-to-from-fromto-a-set

Tlačítko, které se při pohybu myši nad ním posune o zlomek vzdálenosti ke kurzoru a po odjetí se vrátí. Má smysl jen u zařízení s myší a bez omezeného pohybu.

## --term-- toggleActions

en: toggleActions
lekce: css-efekty-animace/scroll-efekty#scrolltrigger-trigger-start-a-end

Čtyři akce ScrollTriggeru pro okamžiky vjezdu přes `start`, výjezdu přes `end`, návratu přes `end` a návratu přes `start`, například `'play none none reverse'`. Se `scrub` se nepoužijí.

## --term-- scrub

en: scrub
aliases: scrubem
lekce: css-efekty-animace/scroll-efekty#scrub-animace-prilepena-k-posuvniku

Volba ScrollTriggeru, se kterou průběh animace odpovídá poloze scrollu mezi `start` a `end`. `true` je přesně přilepený, číslo nechá animaci posuvník o daný počet sekund dohánět.

## --term-- přišpendlení

en: pin
aliases: pin, pinovaná sekce, pinované sekce, pinovanou sekci, pinovanou sekcí
lekce: css-efekty-animace/scroll-efekty#pin-sekce-ktera-zustane-stat

Sekce, kterou ScrollTrigger (`pin: true`) drží na místě mezi `start` a `end`, zatímco scroll řídí animaci uvnitř. Obsah pod ní odsune prvek `pin-spacer`.

## --term-- parallax

en: parallax
aliases: parallaxu, parallaxem
lekce: css-efekty-animace/scroll-efekty#parallax-a-motion-scroll

Iluze hloubky, ve které se vzdálenější vrstvy při scrollu posouvají pomaleji než bližší. Dělá se animací `transform` svázanou s posuvníkem.

## --term-- plynulé scrollování

en: smooth scrolling
aliases: plynulého scrollování, plynulým scrollováním
lekce: css-efekty-animace/scroll-efekty#lenis-plynule-scrollovani

Scroll, který k cíli z kolečka nebo touchpadu dojíždí po malých krocích místo skoku. Knihovna Lenis ho počítá sama a hýbe skutečným scrollem stránky.

## --term-- scrolljacking

en: scrolljacking
aliases: scrolljackingu, scrolljackingem
lekce: css-efekty-animace/scroll-efekty#kdy-scroll-efekt-skodi

Stránka převezme kontrolu nad scrollem: mění jeho směr, rychlost nebo přeskakuje sekce. Uživatel ztratí pocit, že stránku ovládá on.
