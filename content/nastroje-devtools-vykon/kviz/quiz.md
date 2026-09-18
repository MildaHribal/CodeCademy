---
title: Kvíz
---
</--solution-->
<--question-->
Chceš v panelu Elements zastavit běh kódu ve chvíli, kdy se přidá nový prvek do zanořeného `divu`. Co vybereš po kliknutí pravým tlačítkem na daný prvek?

### --answer--
Break on -> attribute modifications
#### --why--
Tohle zastaví kód při změně atributu (např. `class` nebo `style`), ne při přidání nového potomka.

### --answer--
Force state -> :hover
#### --why--
Tohle pouze nasimuluje CSS stav, nezastaví to kód.

### --correct--
Break on -> subtree modifications
#### --why--
Přesně tak, "subtree" znamená podstrom, takže se zastaví při jakékoliv změně potomků prvku.
### --see--
devtools-mapa#elements-a-console
</--question-->

<--question-->
Co měří metrika LCP (Largest Contentful Paint)?

### --answer--
Dobu, než se stáhne kompletní HTML.
#### --why--
Metriky měří uživatelský zážitek, ne čas stažení dokumentu.

### --answer--
Jak moc stránka poskakuje během načítání.
#### --why--
Toto měří metrika CLS (Cumulative Layout Shift).

### --correct--
Za jak dlouho se na obrazovce vykreslí největší vizuální prvek.
#### --why--
Správně, toto určuje, kdy uživatel získá pocit, že je obsah připraven k prohlížení.
### --see--
core-web-vitals#lcp-largest-contentful-paint
</--question-->

<--question-->
Proč atribut `defer` na `<script>` pomáhá rychlosti webu oproti tomu ho tam vůbec nedat?

### --answer--
Protože způsobí, že se skript nestahuje vůbec, dokud uživatel neklikne.
#### --why--
To by se web vůbec nerozjel, `defer` skript stáhne rovnou.

### --answer--
Protože skript vykoná asynchronně bez ohledu na DOM.
#### --why--
To dělá `async`. `defer` vždy čeká na HTML.

### --correct--
Stáhne ho na pozadí, aniž by blokoval sestavování HTML, a spustí ho na konci.
#### --why--
Přesně. Prohlížeč může rovnou vykreslovat stránku a na nic nečeká.
### --see--
nacitani-stranky#kriticka-cesta-critical-rendering-path
</--question-->

<--question-->
Zákazník má pomalý odezvy. Při kliknutí se mu nic neděje a až za 2 sekundy se vše stane najednou. Která metrika Core Web Vitals toto reprezentuje?

### --answer--
CLS
#### --why--
CLS je poskakování layoutu.

### --correct--
INP
#### --why--
Interaction to Next Paint měří přesně tuto odezvu prohlížeče.

### --answer--
LCP
#### --why--
LCP se týká načtení největšího prvku stránky na začátku, ne interakce.
### --see--
core-web-vitals#inp-interaction-to-next-paint
</--question-->

<--question-->
Na hlavní stránce máš nahoře velký úvodní obrázek. Který atribut u něj pomůže nejvíce zrychlit LCP?

### --answer--
`loading="lazy"`
#### --why--
Lazy loading zdrží stahování. U obrázků na první obrazovce (nad ohybem) naopak líné načítání LCP silně zhoršuje.

### --answer--
`decoding="async"`
#### --why--
To sice může pomoct s nezaseknutím JS vlákna, ale primárně to LCP nezrychlí.

### --correct--
`fetchpriority="high"`
#### --why--
Tím řekneš prohlížeči, že tohle je nejdůležitější požadavek hned po HTML a CSS.
### --see--
nacitani-stranky#obrazky-a-pisma
</--question-->
