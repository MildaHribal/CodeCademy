## --card-- free
Vybral jsi v panelu Elements nějaký prvek. Jak se na něj rychle odkážeš v Console a nastavíš mu například barvu pozadí?
### --expected--
Pomocí proměnné `$0`. Příklad: `$0.style.backgroundColor = 'red'`.
### --why--
`$0` je DevTools zkratka odkazující na právě vybraný element.
### --see--
devtools-mapa#elements-a-console

## --card-- free
Co uděláš, když ti nějaký JS nenápadně mění barvu na hluboko zanořeném elementu a ty nevíš, odkud to pochází?
### --expected--
Kliknu pravým na ten prvek v Elements a vyberu **Break on > attribute modifications** (případně subtree, pokud mění vnitřek).
### --why--
Tím se kód pozastaví přesně v okamžiku modifikace a ukáže příslušný skript.
### --see--
devtools-mapa#elements-a-console

## --card-- free
Zákazníkovi padá web z důvodu nedostatku paměti (memory leak). Jaké 3 nejčastější chyby v JS to způsobují?
### --expected--
1. Neodhlášení posluchači (`addEventListener` bez `removeEventListener`).
2. Nezastavené časovače (`setInterval`).
3. Odpojené uzly (prvek je odebraný z DOMu, ale nějaká proměnná na něj dál drží referenci).
### --why--
Garbage collector tyto hodnoty nemůže uvolnit, pokud na ně dál existuje platný odkaz.
### --see--
devtools-mapa#uniky-pameti-a-panel-memory

## --card-- output
Co způsobí tento kód za metrice CLS, pokud obrázek `logo.png` má fyzické rozměry 1200x800px?
```html
<img src="logo.png" alt="Logo firmy">
```
### --expected--
Zhorší ji. Bude způsobovat poskakování stránky.
### --why--
Chybí atributy `width` a `height`. Prohlížeč před stažením obrázku neví, jak bude velký, a nedokáže pro něj předem vyhradit místo na obrazovce.
### --see--
core-web-vitals#cls-cumulative-layout-shift

## --card-- free
Co měří LCP a jaké by mělo mít hodnoty?
### --expected--
LCP (Largest Contentful Paint) měří dobu potřebnou k vykreslení největšího vizuálního prvku na stránce. Cíl je pod 2,5 sekundy.
### --why--
Indikuje uživateli, že "stránka se načetla".
### --see--
core-web-vitals#lcp-largest-contentful-paint

## --card-- code js
Kterým atributem řekneš prohlížeči, že má skript stáhnout, ale vykonat ho až po sestavení celého HTML?
```html
<script src="app.js" ______></script>
```
### --expected--
defer
### --why--
Skript se stahuje paralelně, ale počká, až je HTML domodelované. Na rozdíl od `async`, kde skript přeruší parsaci HTML, jakmile se dostahuje.
### --see--
nacitani-stranky#kriticka-cesta-critical-rendering-path

## --card-- free
Máš velmi dlouhou JavaScriptovou úlohu blokující vlákno po 500 ms. Jakou metriku Core Web Vitals to zhorší?
### --expected--
INP (Interaction to Next Paint).
### --why--
Dlouhá úloha nedovolí prohlížeči reagovat na interakci uživatele, dokud neskončí. Odezva je pomalá.
### --see--
core-web-vitals#inp-interaction-to-next-paint

## --card-- free
Zobrazuješ v hlavičce hlavní velký obrázek (hero banner). Jak pomůžeš prohlížeči, aby ho stáhl co nejrychleji?
### --expected--
Přidám atribut `fetchpriority="high"`. (A nepoužiji `loading="lazy"`!).
### --why--
Dává prohlížeči jasný signál, že tento prvek je klíčový pro prvotní vykreslení a neměl by čekat.
### --see--
nacitani-stranky#obrazky-a-pisma

## --card-- free
Proč Vite, Next.js a další nástroje kompilují styly a JS soubory s "hashem" v názvu (např. `style.a84d.css`)?
### --expected--
Aby bylo možné říct prohlížeči "cachuj to navždy".
### --why--
Pokud se kód změní, hash (a tedy jméno souboru) se změní také. Prohlížeč si vyžádá nový soubor, ale ten starý nemusel každou chvíli kontrolovat.
### --see--
nacitani-stranky#cache-a-hashovani
