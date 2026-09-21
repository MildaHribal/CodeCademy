## --term-- DevTools

en: developer tools
aliases: devtools, vývojářské nástroje, vývojářských nástrojích, vývojářskými nástroji, nástroje pro vývojáře
mdn: https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools
lekce: nastroje-devtools-vykon/devtools-mapa#mapa-panelu-ktery-na-co

Sada nástrojů zabudovaná v prohlížeči (F12): strom dokumentu a styly, konzole, síť,
ladění skriptů, úložiště a měření výkonu. Ukazuje **skutečný stav stránky**, ne to,
co je v souboru.

## --term-- source mapa

en: source map
aliases: source mapy, source mapu, source mapě, zdrojová mapa, mapa zdrojů
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Source_map
lekce: nastroje-devtools-vykon/devtools-mapa#sources-breakpoint-na-udalost-a-na-sit

Soubor, který prohlížeči říká, který řádek zminifikovaného kódu odpovídá kterému řádku
původního zdroje. Díky ní ladíš vlastní čitelný kód, i když v prohlížeči běží sestavený
balík.

## --term-- vodopád

en: network waterfall
aliases: vodopádu, vodopádem, vodopád požadavků, waterfall
lekce: nastroje-devtools-vykon/devtools-mapa#network-vodopad-zpomaleni-a-blokovani

Graf na kartě Network, kde je každý požadavek pruh na časové ose. Ukazuje, co se
stahovalo kdy, co na co čekalo a kde vzniklo hluché místo — právě ta čekání bývají
větší problém než velikost souborů.

## --term-- garbage collector

en: garbage collector
aliases: garbage collectoru, garbage collectorem, GC, uvolňování paměti, úklid paměti
lekce: nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly

Část běhového prostředí, která sama uvolňuje paměť po objektech, na které už nikdo
neukazuje. Právě proto vznikají úniky: stačí jeden zapomenutý odkaz a objekt se nikdy
neuklidí.

## --term-- únik paměti

en: memory leak
aliases: úniku paměti, únikem paměti, úniky paměti, úniků paměti, memory leak, prosakování paměti
lekce: nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly

Paměť, kterou aplikace drží, i když už ji nepotřebuje. Nejčastější zdroje: neodhlášený
posluchač události, běžící `setInterval` a odkaz na prvek, který už není v dokumentu.
Pozná se podle toho, že spotřeba po opakované akci roste a nevrací se.

## --term-- odpojený uzel

en: detached node
aliases: odpojené uzly, odpojených uzlů, odpojeného uzlu, detached node, odpojený prvek
lekce: nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly

Prvek, který už není ve stromu dokumentu, ale pořád na něj ukazuje nějaká proměnná
nebo posluchač — takže ho garbage collector nemůže uklidit. Ve snímku haldy se hledá
pod slovem *Detached*.

## --term-- snímek haldy

en: heap snapshot
aliases: snímku haldy, snímkem haldy, snímky haldy, heap snapshot, snímek paměti
lekce: nastroje-devtools-vykon/devtools-mapa#snimek-haldy-a-porovnani

Otisk toho, co v daném okamžiku drží paměť. Samotný snímek moc neřekne — teprve
**porovnání dvou** snímků kolem podezřelé akce ukáže, co po ní zůstalo navíc.

## --term-- Core Web Vitals

en: Core Web Vitals
aliases: CWV, core web vitals, základní webové ukazatele
lekce: nastroje-devtools-vykon/core-web-vitals#tri-otazky-uzivatele-nacetlo-se-reaguje-drzi-na-miste

Tři metriky, kterými Google měří zážitek uživatele: [[LCP]] (načetlo se), [[INP]]
(reaguje) a [[CLS]] (drží na místě). Neměří rychlost serveru, ale to, co člověk před
obrazovkou vidí a cítí.

## --term-- LCP

en: Largest Contentful Paint
aliases: Largest Contentful Paint, lcp, LCP metrika
lekce: nastroje-devtools-vykon/core-web-vitals#lcp-nejvetsi-obsah-v-zornem-poli

Čas, kdy se vykreslil **největší prvek v zorném poli** — obvykle hlavní obrázek nebo
nadpis. Dobrá hodnota je do 2,5 s. Odpovídá na otázku „už tam něco podstatného je?".

## --term-- INP

en: Interaction to Next Paint
aliases: Interaction to Next Paint, inp, INP metrika
lekce: nastroje-devtools-vykon/core-web-vitals#inp-odezva-na-kazdou-interakci

Jak dlouho trvá, než stránka po kliknutí nebo stisku klávesy **viditelně zareaguje**.
Dobrá hodnota je do 200 ms. Bere nejhorší interakci na stránce, ne průměr — jedno
zaseknutí stačí.

## --term-- CLS

en: Cumulative Layout Shift
aliases: Cumulative Layout Shift, cls, CLS metrika, posun rozvržení
lekce: nastroje-devtools-vykon/core-web-vitals#cls-posuny-ktere-uzivatel-necekal

Kolik obsah během načítání poskakuje. Dobrá hodnota je do 0,1. Typický viník je
obrázek bez rozměrů, pozdě načtené písmo nebo banner vsunutý nad text.

## --term-- laboratorní data

en: lab data
aliases: laboratorních dat, laboratorními daty, lab data, měření v laboratoři
lekce: nastroje-devtools-vykon/core-web-vitals#laboratorni-a-terenni-data

Měření z tvého počítače za umělých podmínek (Lighthouse, panel Performance). Dají se
opakovat a porovnávat, ale neřeknou, jak je na tom stránka u skutečných uživatelů.

## --term-- terénní data

en: field data
aliases: terénních dat, terénními daty, field data, data z terénu, RUM
lekce: nastroje-devtools-vykon/core-web-vitals#laboratorni-a-terenni-data

Měření od skutečných návštěvníků, s jejich telefony a jejich připojením. Jsou pomalejší
a rozptýlenější než laboratorní — a jsou to ta, podle kterých se rozhoduje.

## --term-- kritická cesta vykreslování

en: critical rendering path
aliases: kritické cesty vykreslování, kritickou cestu vykreslování, kritická cesta, critical rendering path
mdn: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path
lekce: nastroje-devtools-vykon/nacitani-stranky#kriticka-cesta-vykreslovani

Nejkratší řetěz kroků, který musí proběhnout, než uživatel uvidí první obsah: stáhnout
HTML, stáhnout a zpracovat blokující CSS a skripty, spočítat styly, rozvrhnout, vykreslit.
Zrychlit stránku znamená zkrátit tenhle řetěz, ne všechno dohromady.

## --term-- blokující zdroj

en: render-blocking resource
aliases: blokující zdroje, blokujících zdrojů, blokujícím zdrojem, render-blocking, blokující vykreslení
lekce: nastroje-devtools-vykon/nacitani-stranky#skripty-defer-async-a-moduly

Soubor, který prohlížeč musí stáhnout a zpracovat, než smůže cokoli vykreslit —
typicky CSS v hlavičce a `<script>` bez `defer` nebo `async`. Každý takový soubor
prodlužuje bílou obrazovku.

## --term-- HTTP cache

en: HTTP cache
aliases: HTTP cache prohlížeče, cache prohlížeče, mezipaměť prohlížeče, cachování v prohlížeči
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
lekce: nastroje-devtools-vykon/nacitani-stranky#cache-a-otisk-v-nazvech-souboru

Úložiště v prohlížeči, kam se ukládají stažené soubory podle hlaviček `Cache-Control`
a `ETag`. Při druhé návštěvě se pak nestahuje nic, co se nezměnilo — proto mívají
sestavené soubory v názvu otisk obsahu.

## --term-- code splitting

en: code splitting
aliases: code splittingu, code splittingem, dělení kódu, rozdělení balíku
lekce: nastroje-devtools-vykon/nacitani-stranky#code-splitting-kod-az-ve-chvili-kdy-je-potreba

Rozdělení sestaveného JavaScriptu na části, které se stáhnou až ve chvíli, kdy jsou
potřeba (jiná stránka, otevřený dialog). Nejde o menší kód celkem, ale o menší kód
**na začátku**.

## --term-- content-visibility

en: content-visibility
aliases: content visibility, obsah mimo zorné pole
mdn: https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility
lekce: nastroje-devtools-vykon/nacitani-stranky#vykreslit-jen-to-co-je-videt-content-visibility

Vlastnost CSS, kterou prohlížeči řekneš, ať obsah mimo zorné pole zatím vůbec
nerozvrhuje ani nevykresluje. U dlouhých stránek s mnoha kartami to znatelně zkrátí
první vykreslení; potřebuje k tomu odhad velikosti v `contain-intrinsic-size`.
