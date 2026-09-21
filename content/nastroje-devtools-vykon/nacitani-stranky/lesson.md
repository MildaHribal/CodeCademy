# Rychlé načtení

:::check pretest
Do `<head>` stránky přidáš `<script src="chat.js"></script>`. Soubor má 400 kB a na telefonu se stahuje dvě sekundy. Co uvidí uživatel během těch dvou sekund?

### --answer--

Celou stránku, chat se jen objeví později.

#### --why--

Tak by to fungovalo s jedním atributem navíc. Obyčejný skript v hlavičce se chová jinak, ukáže druhá část.

### --correct--

Bílou stránku, prohlížeč s dalším HTML čeká, až skript stáhne a spustí.

#### --why--

Obyčejný `<script>` zastaví čtení HTML. Dokud neproběhne, prohlížeč nemá `<body>` a nemá co vykreslit. Jak to změnit, ukáže část o `defer` a `async`.

### --answer--

Stránku bez stylů, protože CSS se načte až po skriptu.

#### --why--

CSS a skript se můžou stahovat souběžně. Problém není pořadí stahování, ale to, na co prohlížeč čeká před vykreslením.
:::

:::check pretest
Nasadíš opravu v souboru `styles.css`. Server posílá hlavičku `Cache-Control: max-age=31536000`. Kdy opravu uvidí uživatel, který byl na webu včera?

### --answer--

Hned při příští návštěvě.

#### --why--

Prohlížeč by se musel na server zeptat, jestli se soubor změnil. S touhle hlavičkou se ptát nebude.

### --correct--

Nejspíš až za rok, nebo až si vymaže cache.

#### --why--

`max-age=31536000` znamená „rok nic nestahuj". Soubor se stejným jménem si prohlížeč vezme z disku. Proto se jména souborů mění s obsahem, jak uvidíš v části o cache.
:::

Na mobilu ve vlaku se nečeká na „rychlý web". Čeká se na bílou obrazovku, na hlavní fotku, na text, který se po načtení písma přeskládá. E-shopy a zpravodajské weby na rychlosti načtení vydělávají peníze, a proto se na ni ptají i u pohovoru.

V lekci [Core Web Vitals](see:nastroje-devtools-vykon/core-web-vitals#lcp-nejvetsi-obsah-v-zornem-poli) jsi viděl, že LCP se skládá z čekání na server, zpoždění před stažením, stahování a vykreslení. Tahle lekce ukáže, čím zkrátíš poslední tři.

> [!REMEMBER]
> **Nic, co není potřeba k prvnímu vykreslení, nesmí stát v cestě.** Skripty odlož, hlavní obrázek pošli dopředu, zbytek obrázků a kódu stáhni, až bude potřeba, a co se nemění, nech prohlížeč schovat.

## Kritická cesta vykreslování

Prohlížeč musí před prvním vykreslením projít [[kritická cesta vykreslování|kritickou cestu vykreslování]] (*critical rendering path*):

1. Čte HTML shora dolů a staví z něj strom DOM.
2. Stahuje a čte CSS a staví z něj strom stylů (CSSOM).
3. Spojí obojí, spočítá rozvržení a vykreslí pixely — cestu k pixelům znáš z [css-animace](see:css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum).

Co tu cestu zdrží a co ne:

| co | blokuje | proč |
|---|---|---|
| `<link rel="stylesheet">` v `<head>` | **vykreslení** | bez stylů by stránka nejdřív probleskla bez vzhledu |
| `<script src>` bez atributů | **čtení HTML** i vykreslení | skript může DOM měnit (`document.write`), prohlížeč proto s dalším HTML čeká |
| obrázek, písmo, `fetch` | nic | stahují se vedle a dokreslí se, až dorazí |

CSS blokuje vykreslení záměrně a patří do `<head>`. Zkracuje se velikostí: jen styly, které stránka opravdu používá, minifikované a zkomprimované. Skripty se naopak dají z cesty odsunout úplně.

V panelu Network poznáš [[blokující zdroj|blokující zdroje]] podle sloupce **Priority** (*High* a *Highest*) a v panelu Performance podle toho, že první vykreslení (*FCP*) nastane až po nich. Lighthouse je vypíše v doporučení *Render-blocking requests*.

:::check
Která z těchto věcí v `<head>` **nezdrží** první vykreslení stránky?

### --answer--

`<link rel="stylesheet" href="styles.css">`

#### --why--

Myslíš si, že styly se můžou dotáhnout později? Prohlížeč bez nich nevykreslí nic, aby stránka neprobleskla bez vzhledu.

### --answer--

`<script src="analytics.js"></script>`

#### --why--

Obyčejný skript zastaví čtení HTML, dokud se nestáhne a neproběhne. Dokud nemá HTML, nemá co vykreslit.

### --correct--

`<link rel="icon" href="favicon.svg">`

#### --why--

Ikona v záložce se stahuje vedle a na vykreslení stránky se nečeká. Stejně jako obrázky a písma.

### --see--

nastroje-devtools-vykon/nacitani-stranky#kriticka-cesta-vykreslovani
:::

## Skripty: `defer`, `async` a moduly

Obyčejný skript v `<head>` je nejhorší možné místo. Tři atributy to řeší:

| zápis | stahování | spuštění | pořadí mezi sebou |
|---|---|---|---|
| `<script src>` | zastaví čtení HTML | hned po stažení | v pořadí v HTML |
| `<script src defer>` | vedle čtení HTML | až je celé HTML přečtené, před `DOMContentLoaded` | **v pořadí v HTML** |
| `<script src async>` | vedle čtení HTML | hned po stažení, klidně uprostřed čtení | **podle toho, co dorazí dřív** |
| `<script type="module">` | vedle čtení HTML | jako `defer` | v pořadí v HTML |

Z toho plynou dvě pravidla:

- **Vlastní kód aplikace** dej do `<head>` s `defer` (nebo jako modul). Stáhne se hned, ale spustí se, až DOM existuje, a skripty se spustí ve správném pořadí.
- **Nezávislý skript třetí strany** (měření návštěvnosti, chat) smí mít `async`. Na ničem nezávisí a nic na něm nezávisí.

`defer` a `async` platí jen pro skripty se `src`. U skriptu napsaného přímo v HTML se ignorují. Modul (`type="module"`) se ale odloží vždycky, i když je napsaný přímo ve stránce. Tipni si, co ukáže ukázka:

:::live dom predict
```html
<p>Klasický skript našel koncertů: <output id="classic">–</output></p>
<p>Modul našel koncertů: <output id="module">–</output></p>
<script>
  document.querySelector('#classic').textContent = document.querySelectorAll('.concert').length;
</script>
<script type="module">
  document.querySelector('#module').textContent = document.querySelectorAll('.concert').length;
</script>
<ul>
  <li class="concert">Pátek 19:00 · Mirai</li>
  <li class="concert">Pátek 21:00 · Lenny</li>
  <li class="concert">Sobota 18:30 · Pokáč</li>
  <li class="concert">Sobota 20:30 · Mydy Rabycad</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #fdf6ec; color: #231a33; }
output { font-weight: 800; color: #c2410c; }
```
--question-- Oba skripty stojí v HTML **před** seznamem koncertů. Co ukážou výstupy?
--option-- Oba 4, skript vždycky vidí celou stránku.
--option*-- Klasický skript 0, modul 4.
--option-- Oba 0, oba se spustí hned, jak na ně prohlížeč narazí.
--why-- Klasický skript běží v okamžiku, kdy na něj prohlížeč při čtení HTML narazí. Seznam pod ním ještě v DOM není, `querySelectorAll` vrátí prázdný výsledek. Modul se odloží, dokud prohlížeč nepřečte celé HTML, takže vidí všechny čtyři koncerty. Zkus klasickému skriptu přidat `defer` — nic se nezmění, protože nemá `src`.
--see-- nastroje-devtools-vykon/nacitani-stranky#skripty-defer-async-a-moduly
:::

:::check
Stránka načítá `vendor.js` (knihovna na formátování dat) a `app.js`, který tu knihovnu hned při spuštění používá. Který atribut dáš oběma skriptům v `<head>`, aby neblokovaly čtení HTML a spustily se ve správném pořadí? Napiš jen jeho název.

### --expected-- ignore-case

defer

### --why--

`defer` spouští skripty v pořadí, v jakém stojí v HTML, a až po přečtení celé stránky. S `async` by se `app.js` mohl spustit dřív než `vendor.js` a spadnout na `ReferenceError`.

### --see--

nastroje-devtools-vykon/nacitani-stranky#skripty-defer-async-a-moduly
:::

## Obrázky: formát, rozměry a priorita

Obrázky bývají většina objemu stránky a hlavní fotka je nejčastější prvek LCP. Čtyři rozhodnutí u každého obrázku:

**1. Formát.** AVIF je při stejné kvalitě zhruba o polovinu menší než JPEG, WebP asi o čtvrtinu. Prohlížeč vybere první formát, kterému rozumí:

```html
<picture>
  <source type="image/avif" srcset="kolo-1200.avif">
  <source type="image/webp" srcset="kolo-1200.webp">
  <img src="kolo-1200.jpg" alt="Horské kolo Author Magnum" width="1200" height="800">
</picture>
```

**2. Velikost.** Telefon s displejem širokým 400 CSS pixelů nepotřebuje fotku 2 400 px. Více velikostí nabídneš přes `srcset` a `sizes`, které znáš z [responzivních obrázků](see:css-responzivita/mobile-first#obrazky-srcset-a-sizes).

**3. Rozměry.** Atributy `width` a `height` řeknou prohlížeči poměr stran dřív, než obrázek dorazí. Místo se vyhradí předem a text pod ním neuskočí. V CSS pak stačí `width: 100%; height: auto`.

**4. Priorita.** Hlavní fotka nad přehybem dostane `fetchpriority="high"`: prohlížeč ji začne stahovat před ostatními obrázky. Obrázky níž na stránce dostanou `loading="lazy"` a stáhnou se, až se k nim uživatel přiblíží. Obráceně nikdy — líná hlavní fotka zhorší LCP, jak víš z [pastí Core Web Vitals](see:nastroje-devtools-vykon/core-web-vitals#loading-lazy-na-hlavni-fotce).

Obě ukázky dostanou fotku až po 1,5 s, jako na pomalé síti. Liší se jen atributy `width` a `height`:

:::compare
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #fdf6ec; color: #231a33; }
.photo { display: block; width: 100%; height: auto; border-radius: 0.8rem; background: #eadfce; }
.lead { font-size: 1.1rem; }
```
```js
setTimeout(() => {
  document.querySelector('.photo').src = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='1200' height='800' fill='#f59e0b'/><circle cx='900' cy='250' r='140' fill='#fde68a'/><path d='M0 620 350 420l300 160 250-120 300 200v160H0z' fill='#7c2d12'/></svg>")}`;
}, 1500);
```
--variant-- Bez rozměrů
```html
<img class="photo" alt="Západ slunce nad festivalovým areálem">
<p class="lead">Vstupenky na sobotu jsou vyprodané. Na pátek a neděli ještě zbývá pár kusů.</p>
```
--variant-- S `width` a `height`
```html
<img class="photo" alt="Západ slunce nad festivalovým areálem" width="1200" height="800">
<p class="lead">Vstupenky na sobotu jsou vyprodané. Na pátek a neděli ještě zbývá pár kusů.</p>
```
:::

Obnov ukázku a sleduj odstavec: vlevo uskočí dolů, vpravo stojí od začátku pod vyhrazeným místem. Zkus vpravo změnit `height="800"` na `height="400"` a sleduj, co se stane s fotkou po načtení.

:::check
Detail produktu má nahoře hlavní fotku a pod popisem galerii osmi dalších fotek. Které atributy dáš **hlavní** fotce?

### --answer--

`loading="lazy"`, `width` a `height`

#### --why--

Myslíš si, že líné načítání zrychlí každý obrázek? Hlavní fotku jen odloží, dokud prohlížeč nespočítá rozvržení, a LCP se prodlouží.

### --correct--

`fetchpriority="high"`, `width` a `height`

#### --why--

Hlavní fotka je nejspíš LCP, takže ji prohlížeč má stahovat co nejdřív. Rozměry vyhradí místo. `loading="lazy"` patří galerii pod popisem.

### --answer--

Jen `width` a `height`, priorita nic nezmění.

#### --why--

Bez `fetchpriority` prohlížeč začne obrázky stahovat s nízkou prioritou a hlavní fotku zvýší až po výpočtu rozvržení. Tím ztratí čas, který se u LCP počítá.

### --see--

nastroje-devtools-vykon/nacitani-stranky#obrazky-format-rozmery-a-priorita
:::

## Písma: `font-display` a `preload`

Vlastní písmo z `@font-face` se začne stahovat, až ho prohlížeč potřebuje pro text na stránce, tedy pozdě. Co zatím ukáže, určuje `font-display`:

| hodnota | než písmo dorazí | když dorazí pozdě |
|---|---|---|
| `block` (a obvykle `auto`) | text je až 3 s **neviditelný** | vymění se, text se může přeskládat |
| `swap` | hned **náhradní písmo** | vymění se kdykoli, text se může přeskládat |
| `fallback` | 100 ms neviditelný, pak náhradní | vymění se jen do ~3 s |
| `optional` | 100 ms neviditelný, pak náhradní | **nevymění se**, vlastní písmo až při další návštěvě |

Pro text článku volíš mezi `swap` (vždycky tvoje písmo, ale riziko posunu) a `optional` (žádný posun, na pomalé síti poprvé náhradní písmo).

```css
@font-face {
  font-family: 'Manrope';
  src: url('/fonts/manrope-variable.woff2') format('woff2');
  font-display: swap;
}
```

Aby písmo dorazilo dřív, řekni o něm prohlížeči hned v `<head>` přes `preload`. Prohlížeč ho začne stahovat, ještě než přečte CSS:

```html
<link rel="preload" href="/fonts/manrope-variable.woff2" as="font" type="font/woff2" crossorigin>
```

Pravidla, na kterých se chybuje:

- **`crossorigin` u písma je povinný, i když leží na stejném serveru.** Písma se stahují v režimu CORS a preload bez něj prohlížeč nepoužije.
- **Preload jen pro 1–2 soubory**, které stránka opravdu hned potřebuje. Každý preload předbíhá všechno ostatní.
- Písmo z cizího serveru potřebuje navíc navázat spojení. `<link rel="preconnect" href="https://fonts.example.cz" crossorigin>` ho naváže předem. Rychlejší je písmo mít na vlastním serveru.
- Jen formát **WOFF2**, nic jiného dnešní prohlížeče nepotřebují.

:::check
Návrhář trvá na vlastním písmu, ale web nesmí mít žádný posun textu po načtení písma, ani na pomalé síti. Kterou hodnotu `font-display` zvolíš?

### --expected--

optional

### --why--

`optional` vlastní písmo použije, jen když dorazí během prvních 100 ms. Jinak zůstane náhradní písmo až do konce návštěvy a nic se nepřeskládá. Soubor se ale stáhne a při další návštěvě už je v cache.

### --see--

nastroje-devtools-vykon/nacitani-stranky#pisma-font-display-a-preload
:::

## Cache a otisk v názvech souborů

Nejrychlejší požadavek je ten, který se vůbec neodešle. O tom, jak dlouho si prohlížeč soubor smí nechat, rozhoduje hlavička **`Cache-Control`** z odpovědi serveru. [[HTTP cache]] funguje dobře jen se dvěma různými pravidly:

| soubor | hlavička | co to znamená |
|---|---|---|
| `assets/index-D8Kx3fQ1.js`, `assets/index-C4mw2Rta.css` | `max-age=31536000, immutable` | rok ze serveru nic nestahuj, ani se neptej |
| `index.html` | `no-cache` | použij uloženou verzi, ale **pokaždé se zeptej**, jestli se nezměnila |

Proč to funguje: [otisk v názvu](see:nastroje-moduly-vite/vite#sestaveni-a-slozka-dist) (*content hash*) spočítá Vite z obsahu souboru. Změníš jeden znak a vznikne soubor s jiným jménem. Nový `index.html` na něj odkáže a starý soubor v cache nikomu nevadí. U `index.html` se prohlížeč zeptá s hlavičkou `If-None-Match` a server odpoví krátkým **304 Not Modified**, když se nic nezměnilo.

V panelu Network to poznáš ve sloupci **Size**: `(memory cache)` a `(disk cache)` znamenají, že se nic nestahovalo, `304` že se prohlížeč jen zeptal. Proto při měření první návštěvy zaškrtáváš *Disable cache*.

:::check
Po nasazení opravy vidí část uživatelů starý JavaScript. `index.html` odkazuje na `/js/app.js` a server na všechno posílá `Cache-Control: max-age=604800`. Co je nejlepší oprava?

### --answer--

Snížit `max-age` u všech souborů na hodinu.

#### --why--

Chyba se tím zmenší, ale nezmizí: hodinu budou lidé mít starý kód a navíc přijdeš o cache u souborů, které se nemění.

### --correct--

Dávat souborům otisk do názvu, jim nechat dlouhé `max-age` a `index.html` posílat s `no-cache`.

#### --why--

Nová verze kódu má nové jméno, takže ji starý záznam v cache nezastíní. `index.html` s `no-cache` se ověří při každé návštěvě a hned odkáže na nové soubory.

### --answer--

Poprosit uživatele, ať si vymažou cache.

#### --why--

Myslíš si, že je to problém uživatelů? Vzniká na serveru a v názvech souborů. Opraví se tam jednou pro všechny.

### --see--

nastroje-devtools-vykon/nacitani-stranky#cache-a-otisk-v-nazvech-souboru
:::

## Code splitting: kód až ve chvíli, kdy je potřeba

Mapa areálu, editor fotek nebo graf statistik mají desítky kilobajtů kódu, který většina návštěvníků nikdy nespustí. Přesto se s jedním sbaleným souborem stahuje, čte a spouští u každého.

[[code splitting|Rozdělení kódu]] (*code splitting*) takový kus odsune do samostatného souboru. Stačí místo `import` nahoře v modulu použít [dynamický import](see:nastroje-moduly-vite/es-moduly#dynamicky-import) až v místě, kde je kód potřeba:

```js
const reviewsButton = document.querySelector('#show-reviews');

reviewsButton.addEventListener('click', async () => {
  // 1. stáhni a spusť modul, až když ho někdo chce
  const { renderReviewChart } = await import('./review-chart.js');
  // 2. použij ho
  renderReviewChart(document.querySelector('#chart'));
});
```

Vite při buildu z každého dynamického importu udělá samostatný soubor s otiskem (*chunk*). Prohlížeč ho stáhne jen jednou, druhé kliknutí už vezme modul z paměti. Frameworky stejně rozdělují kód po stránkách: na úvodní stránce se nestahuje kód košíku.

Nerozděluj ale všechno. Co je vidět hned po načtení (hlavička, první obrazovka), patří do hlavního souboru. Každý další soubor je další požadavek a čekání po kliknutí.

:::check
Která část e-shopu je **nejhorší** kandidát na dynamický import?

### --answer--

Průvodce reklamací, který otevře jedno procento zákazníků.

#### --why--

Tohle je naopak ideální kandidát: velký kód, který skoro nikdo nepoužije.

### --correct--

Navigace a vyhledávání v hlavičce, které jsou vidět hned po načtení.

#### --why--

Co uživatel vidí a používá hned, musí být v hlavním souboru. Dynamický import by přidal požadavek a hlavička by ožila později.

### --answer--

3D prohlížečka produktu, která se otevře po kliknutí na „Zobrazit ve 3D".

#### --why--

Knihovny pro 3D mají stovky kilobajtů a potřebuje je jen ten, kdo klikne. Takový kód se odkládá nejčastěji.

### --see--

nastroje-devtools-vykon/nacitani-stranky#code-splitting-kod-az-ve-chvili-kdy-je-potreba
:::

## Vykreslit jen to, co je vidět: `content-visibility`

Stránka se 3 000 recenzemi nemusí stahovat nic navíc, a přesto je pomalá: prohlížeč spočítá rozvržení a vykreslí všech 3 000 bloků, i když jich na obrazovce je pět.

Vlastnost [[content-visibility]] s hodnotou `auto` řekne prohlížeči: obsah tohohle prvku počítej, až bude blízko zorného pole. Mimo obrazovku ho přeskoč. Protože přeskočený prvek nemá známou výšku, přidává se k ní `contain-intrinsic-size` s odhadem:

```css
.forum-post {
  content-visibility: auto;
  contain-intrinsic-size: auto 12rem;
}
```

Slovo `auto` před odhadem znamená „zapamatuj si skutečnou výšku, jakmile prvek jednou vykreslíš". Odhad se tak použije jen poprvé.

Přepni `content-visibility` a klikni na tlačítko. Výsledek je doba od kliknutí do prvního vykreslení:

:::live dom
```html
<button type="button" id="render">Vykreslit 3 000 recenzí</button>
<p>Do vykreslení: <output id="time">–</output></p>
<ol class="reviews" id="reviews"></ol>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #fdf6ec; color: #231a33; }
button { padding: 0.6rem 1.1rem; border: 0; border-radius: 999px; background: #c2410c; color: #fff; font: inherit; font-weight: 600; }
.reviews { padding: 0; list-style: none; }
.review { content-visibility: var(--cv); contain-intrinsic-size: auto 6rem; margin-bottom: 0.5rem; padding: 0.75rem 1rem; background: #fff; border-radius: 0.6rem; }
.review h3 { margin: 0; font-size: 1rem; }
.review p { margin: 0.25rem 0 0; }
```
```js
const names = ['Tereza z Kolína', 'Martin z Brna', 'Eliška z Liberce', 'Ondřej z Ostravy'];
const texts = ['Skvěle padnoucí boty, na Sněžku bez puchýřů.', 'Podrážka po sezóně drží, jen tkaničky jsou krátké.', 'Na úzkou nohu ideální, na širokou spíš ne.'];
const list = document.querySelector('#reviews');
const time = document.querySelector('#time');

document.querySelector('#render').addEventListener('click', () => {
  const start = performance.now();
  list.replaceChildren();
  for (let i = 0; i < 3000; i++) {
    const item = document.createElement('li');
    item.className = 'review';
    item.innerHTML = `<h3>${'★'.repeat(3 + (i % 3))} ${names[i % names.length]}</h3><p>${texts[i % texts.length]}</p>`;
    list.append(item);
  }
  requestAnimationFrame(() => setTimeout(() => {
    time.textContent = `${Math.round(performance.now() - start)} ms`;
  }));
});
```
```controls
--cv: toggle(visible, auto) = visible | content-visibility
```
:::

Zkus obě hodnoty několikrát po sobě a porovnej čas. Pak smaž `contain-intrinsic-size`, přepni na `auto` a sleduj posuvník vpravo, když scrolluješ dolů.

:::check
Proč se k `content-visibility: auto` přidává `contain-intrinsic-size`?

### --answer--

Bez něj se obsah mimo obrazovku nikdy nevykreslí.

#### --why--

Vykreslí se, jakmile se k němu uživatel přiblíží. Jde o to, jak prvek vypadá, dokud ho prohlížeč přeskakuje.

### --correct--

Přeskočený prvek by měl nulovou výšku a stránka by při scrollování měnila délku.

#### --why--

Prohlížeč obsah mimo obrazovku nepočítá, takže nezná jeho výšku. Odhad z `contain-intrinsic-size` drží místo, posuvník neskáče a obsah pod ním neuhýbá.

### --answer--

Určuje, jak daleko od zorného pole se má obsah začít vykreslovat.

#### --why--

Vzdálenost si určuje prohlížeč sám. `contain-intrinsic-size` nese jinou informaci o přeskočeném prvku.

### --see--

nastroje-devtools-vykon/nacitani-stranky#vykreslit-jen-to-co-je-videt-content-visibility
:::

:::explain
Vysvětli vlastními slovy, proč skript v hlavičce bez `defer` zdrží vykreslení celé
stránky.

## --model--
Prohlížeč staví stránku průchodem HTML odshora dolů. Když narazí na obyčejnou značku
skriptu, musí ho stáhnout a spustit **dřív, než bude pokračovat** — skript totiž může
do dokumentu dopsat další obsah, takže parser neví, co by za ním následovalo. Po tu
dobu se nic nevykreslí, i když je zbytek HTML dávno stažený. `defer` tenhle slib mění:
skript se stáhne souběžně a spustí se až po dokončení dokumentu, takže vykreslení
nezdrží. Proto platí pravidlo, že v cestě k prvnímu vykreslení smí stát jen to, co je
pro ně opravdu nutné.

## --checklist--
- Prohlížeč zpracovává HTML odshora dolů.
- Obyčejný skript musí doběhnout, než se pokračuje.
- Důvodem je, že může do dokumentu dopisovat.
- `defer` skript odsune za dokončení dokumentu.
:::

## Typické chyby a pasti

### Preload písma bez `crossorigin`

> [!PITFALL]
> **Písmo se stáhne dvakrát.** Příznak: v Network jsou dva požadavky na stejný `.woff2` a konzole hlásí `A preload for 'https://…/manrope-variable.woff2' is found, but is not used because the request credentials mode does not match. Consider taking a look at crossorigin attribute.` Oprava: přidej k `<link rel="preload" as="font">` atribut `crossorigin`.

### `async` u skriptů, které na sobě závisí

> [!PITFALL]
> **Pořadí `async` skriptů záleží na tom, který se stáhne dřív.** Příznak: stránka občas (typicky po vymazání cache nebo na pomalé síti) spadne na `Uncaught ReferenceError: dayjs is not defined`, jindy funguje. Oprava: skripty, které na sobě závisí, načítej s `defer` nebo jako moduly s `import`.

### Dlouhá cache na souboru bez otisku

> [!PITFALL]
> **`max-age` na `styles.css` nebo `app.js` bez otisku zamkne uživatele ve staré verzi.** Příznak: ty opravu vidíš (máš zaškrtnuté *Disable cache*), zákazníci ne. Oprava: dlouhou cache jen na soubory s otiskem v názvu, `index.html` s `no-cache`.

### `content-visibility` bez odhadu výšky

> [!PITFALL]
> **`content-visibility: auto` bez `contain-intrinsic-size` rozhodí posuvník.** Příznak: při scrollování posuvník poskakuje a obsah pod čerstvě vykreslenými bloky uhýbá. Oprava: přidej `contain-intrinsic-size: auto` s odhadem výšky bloku.

:::check
Konzole na produkci hlásí: `The resource https://kolo-shop.cz/fonts/manrope.woff2 was preloaded using link preload but not used within a few seconds from the window's load event.` Písmo se přitom na stránce zobrazuje správně. Co je nejpravděpodobnější příčina?

### --answer--

Písmo se nestáhlo, protože server neposílá `Cache-Control`.

#### --why--

Písmo se na stránce zobrazuje, takže se stáhnout muselo. Hláška říká, že se nepoužil právě ten přednačtený soubor.

### --correct--

Preloadu chybí `crossorigin`, takže prohlížeč přednačtený soubor zahodil a písmo stáhl znovu.

#### --why--

Přednačtený soubor bez `crossorigin` nesedí k požadavku z `@font-face`, který jde v režimu CORS. Prohlížeč ho proto nepoužije a stáhne písmo podruhé. Stejné varování uvidíš, když se adresa v preloadu liší od adresy v `@font-face`.

### --answer--

`font-display: swap` způsobí, že se přednačtené písmo nepoužije.

#### --why--

`font-display` určuje, co se zobrazí během čekání. S tím, jestli se přednačtený soubor použije, nesouvisí.

### --see--

nastroje-devtools-vykon/nacitani-stranky#preload-pisma-bez-crossorigin
:::

Ve workshopu teď všechno z posledních dvou lekcí použiješ naráz: vezmeš pomalou stránku festivalu a krok za krokem ji zrychlíš.

## Kde to najdeš v MDN

- [script: defer, async a type](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script) — přesné chování atributů a tabulka, kdy se skript spustí.
- [Lazy loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading) — `loading="lazy"`, `fetchpriority` a dynamický import na jednom místě.
- [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display) — všechny hodnoty a jejich časová okna.
- [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) — `Cache-Control`, `no-cache` proti `no-store`, `ETag` a odpověď 304.

# --questions--

## --question--

Stránka má v `<head>` `<script src="map.js" async></script>` a za ním `<script src="app.js" defer></script>`. `app.js` při spuštění volá funkci z `map.js`. Uživatel s prázdnou cache hlásí chybu, ty ji nevidíš. Napiš atribut, který dáš skriptu `map.js` místo `async`, aby chyba zmizela.

### --expected-- ignore-case

defer

### --why--

`defer` skripty se spustí v pořadí v HTML po přečtení stránky, takže `map.js` vždycky před `app.js`. `async` skript se spustí, jakmile dorazí: s cache hned, bez cache klidně až po `app.js`. Proto chyba závisí na cache.

### --see--

nastroje-devtools-vykon/nacitani-stranky#async-u-skriptu-ktere-na-sobe-zavisi

## --question--

Galerie má 60 fotek pod sebou. Všechny mají `loading="lazy"`, `width` a `height`. Hlavní fotka nahoře stránky je z nich první. Lighthouse hlásí pomalé LCP. Co změníš na **první** fotce?

### --answer--

Přidám `decoding="async"`, aby dekódování nebrzdilo stránku.

#### --why--

Dekódování tu brzdou není. Problém je, kdy se hlavní fotka vůbec začne stahovat.

### --correct--

Odeberu `loading="lazy"` a přidám `fetchpriority="high"`.

#### --why--

Líný obrázek čeká na výpočet rozvržení a stahuje se s nízkou prioritou. Hlavní fotka nad přehybem je LCP, takže se má stahovat hned a před ostatními. Zbylých 59 fotek líných nech.

### --answer--

Odeberu `width` a `height`, aby se fotka načetla v přirozené velikosti.

#### --why--

Rozměry stahování nezdržují, jen vyhradí místo. Bez nich by se navíc zhoršilo CLS.

### --see--

nastroje-devtools-vykon/nacitani-stranky#obrazky-format-rozmery-a-priorita

## --question--

Po nasazení nové verze webu z Vite otevře stálý zákazník stránku. V Network vidí u `index.html` stav 200, u `assets/index-Bq3x81Kd.js` stav 200 a u `assets/logo-C2kf9aQm.svg` ve sloupci Size `(disk cache)`. Změnilo se v nové verzi logo? Odpověz ano, nebo ne.

### --expected-- ignore-case

ne

### --accept--

nezměnilo

### --why--

Otisk v názvu se počítá z obsahu souboru. Nový `index.html` odkazuje na logo se stejným otiskem jako minulá verze, takže obsah loga je stejný a prohlížeč ho vzal z cache. JavaScript dostal nový otisk, protože se změnil, a proto se stáhl.

### --see--

nastroje-devtools-vykon/nacitani-stranky#cache-a-otisk-v-nazvech-souboru
