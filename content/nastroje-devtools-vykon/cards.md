## --card-- free

Vybral jsi v panelu Elements nějaký prvek. Jak se na něj rychle odkážeš v Console a nastavíš mu například barvu pozadí?

### --back--

Pomocí proměnné `$0`. Příklad: `$0.style.backgroundColor = 'red'`.

`$0` je DevTools zkratka odkazující na právě vybraný element.

### --see--

nastroje-devtools-vykon/devtools-mapa#elements-kdo-zmenil-dom

## --card-- free

Co uděláš, když ti nějaký JS nenápadně mění barvu na hluboko zanořeném elementu a ty nevíš, odkud to pochází?

### --back--

Kliknu pravým na ten prvek v Elements a vyberu **Break on > attribute modifications** (případně subtree, pokud mění vnitřek).

Tím se kód pozastaví přesně v okamžiku modifikace a ukáže příslušný skript.

### --see--

nastroje-devtools-vykon/devtools-mapa#elements-kdo-zmenil-dom

## --card-- free

Zákazníkovi padá web z důvodu nedostatku paměti (memory leak). Jaké 3 nejčastější chyby v JS to způsobují?

### --back--

1. Neodhlášení posluchači (`addEventListener` bez `removeEventListener`).
2. Nezastavené časovače (`setInterval`).
3. Odpojené uzly (prvek je odebraný z DOMu, ale nějaká proměnná na něj dál drží referenci).

Garbage collector tyto hodnoty nemůže uvolnit, pokud na ně dál existuje platný odkaz.

### --see--

nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly

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

nastroje-devtools-vykon/core-web-vitals#cls-posuny-ktere-uzivatel-necekal

## --card-- free

Co měří LCP a jaké by mělo mít hodnoty?

### --back--

LCP (Largest Contentful Paint) měří dobu potřebnou k vykreslení největšího vizuálního prvku na stránce. Cíl je pod 2,5 sekundy.

Indikuje uživateli, že "stránka se načetla".

### --see--

nastroje-devtools-vykon/core-web-vitals#lcp-nejvetsi-obsah-v-zornem-poli

## --card-- free

Kterým atributem řekneš prohlížeči, že má skript stáhnout souběžně s HTML, ale spustit ho až po sestavení celého dokumentu?

```html
<script src="app.js" ______></script>
```

### --back--

`defer`. Skript se stahuje paralelně a spustí se až po dokončení HTML, v pořadí, v jakém
je na stránce. `async` se naproti tomu spustí hned, jakmile se dostahuje — přeruší
zpracování HTML a pořadí skriptů nedrží.

### --see--

nastroje-devtools-vykon/nacitani-stranky#skripty-defer-async-a-moduly

## --card-- free

Máš velmi dlouhou JavaScriptovou úlohu blokující vlákno po 500 ms. Jakou metriku Core Web Vitals to zhorší?

### --back--

INP (Interaction to Next Paint).

Dlouhá úloha nedovolí prohlížeči reagovat na interakci uživatele, dokud neskončí. Odezva je pomalá.

### --see--

nastroje-devtools-vykon/core-web-vitals#inp-odezva-na-kazdou-interakci

## --card-- free

Zobrazuješ v hlavičce hlavní velký obrázek (hero banner). Jak pomůžeš prohlížeči, aby ho stáhl co nejrychleji?

### --back--

Přidám atribut `fetchpriority="high"`. (A nepoužiji `loading="lazy"`!).

Dává prohlížeči jasný signál, že tento prvek je klíčový pro prvotní vykreslení a neměl by čekat.

### --see--

nastroje-devtools-vykon/nacitani-stranky#obrazky-format-rozmery-a-priorita

## --card-- free

Proč Vite, Next.js a další nástroje kompilují styly a JS soubory s "hashem" v názvu (např. `style.a84d.css`)?

### --back--

Aby bylo možné říct prohlížeči "cachuj to navždy".

Pokud se kód změní, hash (a tedy jméno souboru) se změní také. Prohlížeč si vyžádá nový soubor, ale ten starý nemusel každou chvíli kontrolovat.

### --see--

nastroje-devtools-vykon/nacitani-stranky#cache-a-otisk-v-nazvech-souboru

## --card-- free

Co znamenají zkratky LCP, INP a CLS a jaké mají hraniční hodnoty?

### --back--

**LCP** (Largest Contentful Paint) — kdy se vykreslil největší prvek v zorném poli,
dobře do **2,5 s**. **INP** (Interaction to Next Paint) — jak rychle stránka viditelně
zareaguje na kliknutí nebo klávesu, dobře do **200 ms**. **CLS** (Cumulative Layout
Shift) — jak moc obsah poskakuje, dobře do **0,1**.

### --see--

nastroje-devtools-vykon/core-web-vitals#tri-otazky-uzivatele-nacetlo-se-reaguje-drzi-na-miste

## --card-- free

Jaký je rozdíl mezi laboratorními a terénními daty a podle kterých se rozhoduje?

### --back--

**Laboratorní** jsou z tvého počítače za umělých podmínek (Lighthouse, panel
Performance) — dají se opakovat a porovnávat. **Terénní** jsou od skutečných
návštěvníků s jejich telefony a připojením. Rozhoduje se podle terénních; laboratorní
slouží k hledání příčiny a k porovnání před a po.

### --see--

nastroje-devtools-vykon/core-web-vitals#laboratorni-a-terenni-data

## --card-- free

Co je kritická cesta vykreslování a jak se zkracuje?

### --back--

Nejkratší řetěz kroků, než uživatel uvidí první obsah: HTML → blokující CSS a skripty →
styly → rozvržení → vykreslení. Zkracuje se tím, že se z ní vyhodí, co v ní být nemusí:
`defer` u skriptů, kritické CSS inline, zbytek stylů později, písma přednačtená.

### --see--

nastroje-devtools-vykon/nacitani-stranky#kriticka-cesta-vykreslovani

## --card-- free

Kdy `loading="lazy"` pomůže a kdy uškodí?

### --back--

Pomůže u všeho **pod ohybem** — obrázek se stáhne, až když se k němu uživatel doscrolluje.
Uškodí u prvku **nad ohybem**, hlavně u toho, podle kterého se měří LCP: líné načítání
ho odsune na konec fronty a LCP se zhorší. Tam patří `fetchpriority="high"`.

### --see--

nastroje-devtools-vykon/nacitani-stranky#obrazky-format-rozmery-a-priorita

## --card-- free

Proč se u přednačtení písma píše `crossorigin`, i když je soubor na vlastní doméně?

### --back--

Písma se stahují v režimu CORS vždycky, i z vlastní domény. Bez `crossorigin` by
přednačtení proběhlo v jiném režimu než pozdější skutečné stažení, takže by se soubor
stáhl **dvakrát** — a přednačtení by bylo k ničemu.

### --see--

nastroje-devtools-vykon/nacitani-stranky#pisma-font-display-a-preload

## --card-- free

Co je dlouhá úloha a jak ji rozdělit?

### --back--

Práce v hlavním vlákně delší než 50 ms — po tu dobu stránka nereaguje na nic. Dělí se
tak, že se cyklus rozseká na dávky a mezi nimi se uvolní vlákno:
`await new Promise((r) => setTimeout(r, 0))` nebo novější `await scheduler.yield()`.
Projeví se to hlavně na INP.

### --see--

nastroje-devtools-vykon/core-web-vitals#inp-odezva-na-kazdou-interakci

## --card-- free

Jmenuj tři nejčastější příčiny úniku paměti v prohlížeči.

### --back--

1. **Neodhlášený posluchač** — `addEventListener` bez `removeEventListener` (nebo bez
`AbortController`). 2. **Běžící časovač** — `setInterval`, který nikdo nezastavil.
3. **Odpojený uzel** — prvek odebraný z dokumentu, na který pořád ukazuje proměnná.
Ve všech případech platí: dokud na věc existuje odkaz, garbage collector ji uklidit nesmí.

### --see--

nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly

## --card-- free

K čemu je source mapa a co bez ní v Sources uvidíš?

### --back--

Říká prohlížeči, který řádek sestaveného a zminifikovaného kódu odpovídá kterému řádku
tvého zdroje. Bez ní ladíš jeden dlouhý řádek nečitelného balíku; s ní stojíš v původním
souboru s původními jmény proměnných.

### --see--

nastroje-devtools-vykon/devtools-mapa#sources-breakpoint-na-udalost-a-na-sit

## --card-- free

Co v panelu Network znamená dlouhý pruh úplně vlevo od stažení souboru?

### --back--

Čekání — buď ve frontě (prohlížeč měl otevřených moc spojení), nebo na odpověď serveru
(TTFB). Často je to větší problém než velikost souboru: zmenšit obrázek o sto kilobajtů
nepomůže, když se na něj čekalo půl vteřiny, než se na něj vůbec došlo.

### --see--

nastroje-devtools-vykon/devtools-mapa#network-vodopad-zpomaleni-a-blokovani
