---
pass: 0.8
---

## --question--

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

nastroje-devtools-vykon/devtools-mapa#elements-kdo-zmenil-dom

## --question--

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

nastroje-devtools-vykon/core-web-vitals#lcp-nejvetsi-obsah-v-zornem-poli

## --question--

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

nastroje-devtools-vykon/nacitani-stranky#kriticka-cesta-vykreslovani

## --question--

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

nastroje-devtools-vykon/core-web-vitals#inp-odezva-na-kazdou-interakci

## --question--

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

nastroje-devtools-vykon/nacitani-stranky#obrazky-format-rozmery-a-priorita

## --question--

Napiš, kterou metriku Core Web Vitals zhorší obrázek vložený bez atributů `width` a `height`.

### --expected--

CLS

### --accept--

Cumulative Layout Shift
cls

### --why--

Bez rozměrů prohlížeč neví, kolik místa si na obrázek nechat, takže text nejdřív vyskočí
nahoru a po stažení obrázku poskočí dolů. Právě takové posuny CLS měří.

### --see--

nastroje-devtools-vykon/core-web-vitals#cls-posuny-ktere-uzivatel-necekal

## --question--

Lighthouse dá tvé stránce 98 bodů, ale uživatelé si stěžují, že je pomalá. Jak je to možné?

### --correct--

Lighthouse měří laboratorně z tvého počítače. Skuteční uživatelé mají pomalejší telefony a horší připojení.

#### --why--

Laboratorní data se dají opakovat a porovnávat, ale neříkají, jak je na tom stránka
v terénu. Na to jsou data od skutečných návštěvníků (CrUX, vlastní měření v prohlížeči) —
a podle nich se rozhoduje.

### --answer--

Lighthouse měří jen načtení, ne interakce — a uživatelům vadí právě ty.

#### --why--

Částečná pravda: Lighthouse skutečně neumí INP. Hlavní rozdíl je ale v tom, **na čem**
se měří, ne co.

### --answer--

Skóre je náhodné, mezi běhy se liší o desítky bodů.

#### --why--

Rozptyl mezi běhy existuje, ale je v jednotkách bodů. Devadesát osm versus stížnosti
není rozptyl.

### --see--

nastroje-devtools-vykon/core-web-vitals#laboratorni-a-terenni-data

## --question--

Napiš atribut, kterým řekneš prohlížeči, že má hlavní obrázek stáhnout přednostně.

### --expected--

fetchpriority="high"

### --accept--

fetchpriority
fetchpriority=high

### --why--

Prohlížeč sám neví, který z deseti obrázků je ten, podle kterého se měří LCP. Signál
mu dá `fetchpriority="high"` — a naopak: `loading="lazy"` na takovém obrázku LCP citelně
zhorší.

### --see--

nastroje-devtools-vykon/nacitani-stranky#obrazky-format-rozmery-a-priorita

## --question--

Čím se liší `<script src="a.js" defer>` a `<script src="a.js" async>`?

### --correct--

Oba se stahují souběžně s HTML; `defer` počká na hotový dokument a drží pořadí skriptů, `async` se spustí hned po stažení.

#### --why--

Proto je `defer` výchozí volba pro kód aplikace (potřebuje DOM a záleží na pořadí)
a `async` se hodí na nezávislé skripty typu měřicí kód.

### --answer--

`defer` se stahuje až po HTML, `async` souběžně.

#### --why--

Oba se stahují souběžně. Liší se jen tím, **kdy se spustí**.

### --answer--

`async` drží pořadí, `defer` ne.

#### --why--

Je to obráceně: `defer` pořadí drží, `async` spustí skripty v pořadí, v jakém se stáhnou.

### --see--

nastroje-devtools-vykon/nacitani-stranky#skripty-defer-async-a-moduly

## --question--

Stránka po dvaceti minutách používání zabírá gigabajt paměti a pořád roste. Napiš, co si v DevTools uděláš jako první.

### --expected--

dva snímky haldy a porovnám je

### --accept--

snímek haldy před akcí a po ní
porovnám dva snímky v panelu memory
heap snapshot před a po

### --why--

Jeden snímek říká jen to, co paměť drží teď — což je vždycky hodně. Teprve **rozdíl**
dvou snímků kolem podezřelé akce ukáže, co po ní zůstalo navíc. V porovnání se pak hledá
hlavně slovo *Detached*.

### --see--

nastroje-devtools-vykon/devtools-mapa#snimek-haldy-a-porovnani

## --question--

Co je odpojený uzel a proč ho garbage collector neuklidí?

### --correct--

Prvek odebraný ze stromu dokumentu, na který pořád ukazuje nějaká proměnná nebo posluchač — a dokud odkaz existuje, uklidit se nesmí.

#### --why--

Typický případ: prvky ze seznamu se při překreslení odeberou, ale zůstanou v poli
`items`, které si drží stará funkce. Ve snímku haldy je poznáš podle *Detached*.

### --answer--

Prvek, který má `display: none` — prohlížeč ho nevykresluje, ale drží v paměti.

#### --why--

`display: none` prvek pořád je v dokumentu, jen se nevykresluje. Odpojený je ten,
který v dokumentu už není.

### --answer--

Prvek z jiného dokumentu (iframe), který garbage collector nevidí.

#### --why--

Iframy mají vlastní paměť a vlastní úklid. S odpojenými uzly to nesouvisí.

### --see--

nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly

## --question--

Napiš, kolik milisekund je horní hranice „dobrého" INP.

### --expected--

200

### --accept--

200 ms
do 200 ms

### --why--

INP do 200 ms uživatel vnímá jako okamžitou odezvu. Nad 500 ms je to „zaseklo se".
Na rozdíl od průměru bere INP tu nejhorší interakci na stránce — jedno zaseknutí stačí.

### --see--

nastroje-devtools-vykon/core-web-vitals#inp-odezva-na-kazdou-interakci

## --question--

Proč mají soubory ze sestavení v názvu otisk obsahu (`main.a84d3f.js`)?

### --correct--

Aby se daly cachovat natrvalo — při změně obsahu se změní i název, takže si prohlížeč stáhne nový soubor a starý nemusí pokaždé ověřovat.

#### --why--

Bez otisku by se muselo nastavit krátké `max-age` a prohlížeč by se u každé návštěvy ptal,
jestli se soubor nezměnil. S otiskem se ptát nemusí vůbec.

### --answer--

Aby se soubory nedaly zaměnit mezi projekty.

#### --why--

Na to by stačil jiný název složky. Jde o cache.

### --answer--

Kvůli bezpečnosti — útočník nepozná, jak se soubor jmenuje.

#### --why--

Název je vidět v HTML stránky. Žádné utajení to není.

### --see--

nastroje-devtools-vykon/nacitani-stranky#cache-a-otisk-v-nazvech-souboru

## --question--

Z minulé sekce: který příkaz nainstaluje závislosti přesně podle `package-lock.json`?

### --expected--

npm ci

### --accept--

npm ci (clean install)

### --why--

`npm install` smí lockfile upravit, když si řešení závislostí vyžádá jinou verzi.
`npm ci` ho bere jako zadání: smaže `node_modules` a nainstaluje přesně to, co je v něm.
Proto patří do CI a na server, ne k tobě při vývoji.

### --see--

nastroje-moduly-vite/npm-a-pnpm

## --question--

Taky z části o nástrojích: čím se v Gitu liší `git status` a `git diff`?

### --correct--

`status` říká, které soubory se změnily; `diff` které řádky.

#### --why--

Stejný vztah jako mezi Lighthouse a panelem Performance: jedno je přehled, druhé detail.
Přehled ti řekne, kde se podívat, detail co s tím.

### --answer--

`status` ukazuje neuložené změny, `diff` ty už commitnuté.

#### --why--

`git diff` bez přepínače ukazuje právě neuložené změny. Na porovnání s commity jsou
`git diff --staged` a `git show`.

### --answer--

Je to totéž, `diff` je jen podrobnější výpis `status`.

#### --why--

Odpovídají na jinou otázku: **které soubory** versus **které řádky**.

### --see--

start-nastroje/workshop-prvni-repozitar/009
