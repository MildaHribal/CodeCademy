# Core Web Vitals

:::check pretest
Klikneš na článek na zpravodajském webu, začneš číst a text ti uskočí o půl obrazovky dolů, protože se nad ním načetla reklama. Jak myslíš, že tuhle nepříjemnost měří Google?

### --answer--

Neměří, jde o design, ne o výkon.

#### --why--

Měří. Posun obsahu je jedna ze tří metrik, podle kterých Google hodnotí uživatelský zážitek.

### --correct--

Sečte, o kolik a jak velké kusy stránky se nečekaně posunuly.

#### --why--

Přesně tak funguje metrika CLS. Jak se počítá a které posuny se nepočítají, uvidíš ve třetí části.

### --answer--

Změří, za jak dlouho se reklama načte.

#### --why--

Rychle načtená reklama, která odsune text, vadí stejně jako pomalá. Měří se posun, ne čas.
:::

:::check pretest
Tlačítko „Přidat do košíku" po kliknutí 400 ms nic neudělá, pak přidá zboží. Kde myslíš, že těch 400 ms prohlížeč stráví?

### --answer--

Čeká na odpověď serveru.

#### --why--

Tady se server nevolá. I bez sítě umí kliknutí trvat dlouho — kvůli tomu, co dělá hlavní vlákno.

### --correct--

Spouští JavaScript a mezitím nemůže překreslit stránku.

#### --why--

Hlavní vlákno dělá jednu věc naráz. Dokud běží obsluha kliknutí, prohlížeč nepřekreslí ani tlačítko. Tomu se věnuje část o INP.
:::

Když se majitel e-shopu zeptá „je náš web rychlý?", odpověď „mně se načítá dobře" nestačí. Google proto zavedl tři čísla, kterými se výkon webu měří po celém světě a která ovlivňují i pořadí ve vyhledávání: **Core Web Vitals**. Najdeš je v Search Console každého webu, v PageSpeed Insights i v zadání firem („LCP do 2,5 s na mobilu").

## Tři otázky uživatele: načetlo se, reaguje, drží na místě

[[Core Web Vitals]] odpovídají na tři otázky, které si uživatel klade, aniž by je vyslovil:

| metrika | otázka uživatele | dobře | špatně |
|---|---|---|---|
| **[[LCP]]** (*Largest Contentful Paint*) | Načetlo se to, co jsem chtěl vidět? | do 2,5 s | nad 4 s |
| **[[INP]]** (*Interaction to Next Paint*) | Reaguje stránka, když na ni klepnu? | do 200 ms | nad 500 ms |
| **[[CLS]]** (*Cumulative Layout Shift*) | Drží obsah na místě? | do 0,1 | nad 0,25 |

Mezi „dobře" a „špatně" je pásmo *needs improvement*. Hodnotí se **75. percentil** skutečných návštěv, zvlášť pro mobily a počítače: web je „dobrý", když aspoň tři čtvrtiny návštěv dosáhnou dobré hodnoty. Rychlá návštěva z tvého notebooku tedy nevyváží pomalé návštěvy z levných telefonů.

> [!REMEMBER]
> **LCP měří načtení hlavního obsahu, INP odezvu na interakci a CLS stabilitu rozvržení.** Každá metrika má jiné příčiny a jinou opravu — nejdřív zjisti, která je špatně.

:::check
Web zpravodajství má na mobilech LCP 1,9 s, INP 380 ms a CLS 0,04. Která metrika je mimo dobré pásmo? Napiš její zkratku.

### --expected-- ignore-case

INP

### --why--

LCP pod 2,5 s i CLS pod 0,1 jsou v pořádku. INP 380 ms je nad hranicí 200 ms, ale pod 500 ms, tedy v pásmu *needs improvement*. Stránka se načítá rychle, jen pomalu reaguje na klepnutí.

### --see--

nastroje-devtools-vykon/core-web-vitals#tri-otazky-uzivatele-nacetlo-se-reaguje-drzi-na-miste
:::

## LCP: největší obsah v zorném poli

LCP je čas od začátku navigace do chvíle, kdy se vykreslí **největší prvek v zorném poli** — obvykle hlavní fotka nebo nadpis s úvodním odstavcem. Kandidáty jsou obrázky (`<img>`, obrázek v `<svg>`, `poster` videa), prvky s `background-image: url(…)` a bloky textu. Dokud se stránka načítá, prohlížeč kandidáta průběžně mění: nejdřív je největší nadpis, pak doběhne fotka a stane se LCP ona. Po prvním kliknutí nebo scrollu uživatele se měření zastaví.

Ukázka vypisuje kandidáty LCP tak, jak je prohlížeč hlásí:

:::live dom
```html
<article class="story">
  <p class="kicker">Brno · doprava</p>
  <h1>Cyklostezka podél Svratky bude do podzimu hotová</h1>
  <div class="photo" id="photo"></div>
</article>
<ol class="log" id="log"></ol>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #f6f3ec; color: #1b2433; }
.story { max-width: 36rem; }
.kicker { margin: 0; color: #9a3a0f; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; }
h1 { margin: 0.25rem 0 1rem; font-size: 1.8rem; line-height: 1.15; }
.photo img { display: block; width: 100%; height: auto; border-radius: 0.8rem; }
.log { font-family: ui-monospace, monospace; font-size: 0.85rem; }
```
```js
const log = document.querySelector('#log');
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const item = document.createElement('li');
    item.textContent = `${Math.round(entry.startTime)} ms: <${entry.element?.tagName.toLowerCase()}> ${entry.size} px²`;
    log.append(item);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });

// Simulace pomalé sítě: fotka dorazí za 1,2 s.
setTimeout(() => {
  const img = document.createElement('img');
  img.alt = 'Rozestavěná cyklostezka u Pisárek';
  img.width = 1200;
  img.height = 700;
  img.src = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><rect width='1200' height='700' fill='#6f9a74'/><path d='M0 520 400 430l420 60 380-80v290H0z' fill='#3c6e57'/></svg>")}`;
  document.querySelector('#photo').append(img);
}, 1200);
```
:::

Nejdřív se jako LCP ohlásí nadpis `<h1>`, po 1,2 s větší fotka. LCP stránky je poslední hlášený kandidát. Zkus zpoždění změnit z `1200` na `3000` a sleduj, jak LCP odejde do pásma „špatně", i když nadpis byl vidět hned.

LCP se skládá ze čtyř částí a každá má jinou opravu:

1. **Čas do prvního bajtu** (*TTFB*) — pomalý server, přesměrování. Oprava na serveru a v cache.
2. **Zpoždění před stažením** — prohlížeč o obrázku ví pozdě: je v CSS jako pozadí, vkládá ho JavaScript, nebo má `loading="lazy"`.
3. **Stahování** — obrázek je zbytečně velký nebo ve starém formátu.
4. **Zpoždění vykreslení** — obrázek je stažený, ale vykreslení blokuje CSS nebo skript.

:::check
Hlavní fotku produktu vkládá do stránky JavaScript až po načtení dat z API. Fotka má 80 kB a stáhne se za 100 ms, LCP je přesto 3,8 s. Která ze čtyř částí LCP je tu nejspíš dlouhá?

### --answer--

Stahování, fotka by měla být menší.

#### --why--

Stahování trvá 100 ms, zmenšení fotky skoro nic neušetří. Zamysli se, kdy se prohlížeč o fotce vůbec dozví.

### --correct--

Zpoždění před stažením, protože se o fotce prohlížeč dozví až z JavaScriptu.

#### --why--

Dokud neproběhne skript i požadavek na API, v HTML žádný `<img>` není a prohlížeč nemá co stahovat. Oprava: dát `<img>` se `src` přímo do HTML ze serveru.

### --answer--

Čas do prvního bajtu, server je pomalý.

#### --why--

O serveru zadání nic neříká. Z popisu je vidět jiná brzda: fotka čeká na JavaScript a data.

### --see--

nastroje-devtools-vykon/core-web-vitals#lcp-nejvetsi-obsah-v-zornem-poli
:::

## CLS: posuny, které uživatel nečekal

Posun rozvržení (*layout shift*) nastane, když viditelný prvek změní polohu mezi dvěma snímky. Každý posun dostane skóre:

**skóre = podíl plochy, kterou posun zasáhl × podíl vzdálenosti, o kterou se prvky posunuly** (obojí vůči zornému poli).

Obsah přes polovinu obrazovky, který uskočí o čtvrtinu její výšky, dá zhruba 0,5 × 0,25 = 0,125 — jediný takový posun a stránka je mimo dobré pásmo. CLS nesčítá posuny za celou návštěvu, ale bere **nejhorší okno**: posuny těsně po sobě (mezera pod 1 s, okno nejvýš 5 s) se sečtou a CLS je nejvyšší z těchto součtů.

Dvě výjimky, na kterých se často chybuje:

- **Posun do 500 ms po kliknutí, klepnutí nebo stisku klávesy se nepočítá.** Uživatel ho čeká — rozbalil akordeon.
- **Animace přes `transform` posun rozvržení nedělá.** Prvek se vizuálně pohne, ale jeho místo v rozvržení zůstane.

:::live dom predict
```html
<p class="lead">Rezervace servisu na jaro jsou otevřené. Vyber si termín.</p>
<ul class="slots">
  <li>Út 14. 4. · 9:00</li>
  <li>St 15. 4. · 13:30</li>
  <li>Čt 16. 4. · 16:00</li>
</ul>
<p class="score">CLS: <output id="cls">0</output></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; background: #f6f3ec; }
.banner { margin: 0 0 1rem; padding: 1rem; background: #e0652b; color: #fff; font-weight: 600; }
.toast { position: fixed; right: 1rem; bottom: 1rem; margin: 0; padding: 1rem; background: #1b2433; color: #fff; border-radius: 0.6rem; }
.slots li { padding: 0.6rem; margin-bottom: 0.4rem; background: #fff; list-style: none; border-radius: 0.5rem; }
.slots.is-new { transform: translateY(40px); }
```
```js
let cls = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) if (!entry.hadRecentInput) cls += entry.value;
  document.querySelector('#cls').textContent = cls.toFixed(3);
}).observe({ type: 'layout-shift', buffered: true });

setTimeout(() => {
  // A: lišta nad obsahem
  const banner = document.createElement('p');
  banner.className = 'banner';
  banner.textContent = 'Poslední volné termíny tento týden';
  document.body.prepend(banner);
}, 800);

setTimeout(() => {
  // B: oznámení s position: fixed
  const toast = document.createElement('p');
  toast.className = 'toast';
  toast.textContent = 'Termín na čtvrtek právě někdo zarezervoval';
  document.body.append(toast);
}, 1600);

setTimeout(() => {
  // C: posun seznamu přes transform
  document.querySelector('.slots').classList.add('is-new');
}, 2400);
```
--question-- Stránka po načtení postupně ukáže lištu (A), oznámení (B) a posune seznam termínů přes `transform` (C). Která změna zvýší CLS?
--option*-- Jen A, lišta vložená nad obsah.
--option-- A i B, protože obě přidávají prvek do stránky.
--option-- A i C, protože se v obou případech seznam pohne.
--why-- Lišta v normálním toku odsune odstavec i seznam dolů, to je posun rozvržení. Oznámení s `position: fixed` leží nad stránkou a nic neodsune. Posun přes `transform` prvek jen vizuálně přesune, jeho místo v rozvržení se nezmění, takže ho CLS nepočítá. Zkus v CSS nahradit `transform: translateY(40px)` za `margin-top: 40px` a sleduj číslo CLS.
--see-- nastroje-devtools-vykon/core-web-vitals#cls-posuny-ktere-uzivatel-necekal
:::

Nejčastější příčiny CLS a opravy:

| příčina | oprava |
|---|---|
| obrázek bez rozměrů, text pod ním uskočí po načtení | atributy `width` a `height`, nebo `aspect-ratio` |
| reklama, lišta nebo embed vložený nad obsah | vyhraď místo předem (`min-height`) nebo prvek překryj (`position: fixed`) |
| písmo, které po načtení změní šířku textu | `font-display` a náhradní písmo s podobnými rozměry (lekce [Rychlé načtení](see:nastroje-devtools-vykon/nacitani-stranky#pisma-font-display-a-preload)) |
| animace `top`, `margin`, `height` | animovat `transform`, jak víš z [cesty k pixelům](see:css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum) |

:::check
Tlačítko „Zobrazit další recenze" po kliknutí okamžitě vloží pod sebe deset recenzí a obsah pod nimi odsune dolů. Zvýší to CLS?

### --answer--

Ano, obsah se posunul, a každý posun se počítá.

#### --why--

Myslíš si, že CLS počítá všechny posuny? Posun, který uživatel sám vyvolal, nečekaný není.

### --correct--

Ne, posun do 500 ms po kliknutí uživatele se nepočítá.

#### --why--

Posun těsně po interakci má v záznamu `hadRecentInput: true` a do CLS se nezapočítá. Kdyby se ale recenze načítaly ze serveru dvě sekundy, posun už by se počítal.

### --answer--

Ne, protože recenze jsou pod tlačítkem, a ne nad ním.

#### --why--

Poloha pod tlačítkem nerozhoduje, obsah pod recenzemi se posunul stejně. Rozhoduje, kdy se to stalo.

### --see--

nastroje-devtools-vykon/core-web-vitals#cls-posuny-ktere-uzivatel-necekal
:::

## INP: odezva na každou interakci

INP měří, jak dlouho trvá od kliknutí, klepnutí nebo stisku klávesy do **dalšího vykreslení** stránky. Scroll a najetí myší se nepočítají. Hodnotou INP za návštěvu je přibližně **nejhorší interakce** (u velmi dlouhých návštěv se pár nejhorších odlehlých vynechá). V březnu 2024 INP nahradilo starší metriku FID, která měřila jen zpoždění první interakce.

Každá interakce má tři části:

1. **Zpoždění vstupu** — hlavní vlákno je zrovna zaměstnané něčím jiným ([[dlouhá úloha]] z načítání, časovač) a obsluha kliknutí čeká.
2. **Zpracování** — běží tvoje posluchače.
3. **Zpoždění vykreslení** — prohlížeč přepočítá styly, rozvržení a vykreslí snímek.

Jak víš z lekce o [event loopu](see:js-async/event-loop#dlouhy-vypocet-zamrazi-stranku), dokud běží jedna úloha, prohlížeč nepřekreslí. Když obsluha kliknutí nejdřív 300 ms počítá a teprve pak změní tlačítko, uživatel 300 ms kouká na mrtvé tlačítko. Řešení: **nejdřív viditelná odezva, potom práce** — a mezi ně vlákno na chvíli pustit.

```js
function yieldToMain() {
  // Moderní prohlížeče: pokračuj hned, jakmile prohlížeč stihne vykreslit a obsloužit vstup.
  if (globalThis.scheduler?.yield) return scheduler.yield();
  // Ostatní: pokračuj v nové úloze na konci fronty.
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```

`scheduler.yield()` vrací Promise. Kód za `await scheduler.yield()` běží v nové úloze, takže prohlížeč mezitím stihne vykreslit. Na rozdíl od `setTimeout` se pokračování zařadí **před** ostatní čekající úlohy, takže tvoje práce nepředběhne jen vstup a vykreslení. Protože ho zatím nepodporují všechny prohlížeče, patří k němu náhrada přes `setTimeout`.

Klikni na obě tlačítka. Pod nimi se ukáže, jak dlouho interakce trvala podle prohlížeče:

:::live dom
```html
<div class="actions">
  <button type="button" id="slow">Přidat do košíku</button>
  <button type="button" id="fast">Přidat do košíku (s odezvou)</button>
</div>
<p id="status">Košík je prázdný.</p>
<ol id="timings"></ol>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #f6f3ec; color: #1b2433; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { padding: 0.6rem 1.1rem; border: 2px solid #1b2433; border-radius: 999px; background: #fff; font: inherit; font-weight: 600; }
button.is-added { background: #e0652b; border-color: #e0652b; color: #fff; }
```
```js
const status = document.querySelector('#status');
const timings = document.querySelector('#timings');

// Simulace: přepočet dopravy a slev trvá 300 ms.
function recalculateCart() {
  const end = performance.now() + 300;
  while (performance.now() < end) {}
}

function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

document.querySelector('#slow').addEventListener('click', (event) => {
  recalculateCart();
  event.currentTarget.classList.add('is-added');
  status.textContent = 'Přidáno. Doprava zdarma.';
});

document.querySelector('#fast').addEventListener('click', async (event) => {
  event.currentTarget.classList.add('is-added');
  status.textContent = 'Přidávám…';
  await yieldToMain();
  recalculateCart();
  status.textContent = 'Přidáno. Doprava zdarma.';
});

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.interactionId || entry.name !== 'click') continue;
    const item = document.createElement('li');
    item.textContent = `${entry.target?.id === 'fast' ? 's odezvou' : 'bez odezvy'}: ${Math.round(entry.duration)} ms`;
    timings.append(item);
  }
}).observe({ type: 'event', durationThreshold: 16 });
```
:::

Obě tlačítka odvedou stejnou práci, ale první interakce trvá přes 300 ms a druhá kolem desítek milisekund: odezva se vykreslí dřív, než výpočet začne. Zkus u druhého tlačítka smazat řádek s `await yieldToMain()` a sleduj, že se čas vrátí nad 300 ms, i když se text mění před výpočtem.

Když je práce dlouhá sama o sobě (třeba přepočet 5 000 položek), rozděl ji na dávky a `await yieldToMain()` vlož mezi ně. Každá dávka je pak krátká úloha a klepnutí uživatele se dostane na řadu mezi nimi.

:::check
Kolega píše obsluhu tlačítka: nejdřív změní text na „Ukládám…", pak synchronně 400 ms zpracovává data a nakonec napíše „Uloženo". Uživatel text „Ukládám…" nikdy neuvidí. Proč?

### --answer--

Změna textu je moc rychlá, oko ji nezachytí.

#### --why--

400 ms je dost dlouho na to, aby text uživatel viděl — kdyby se vykreslil. Problém je v tom, kdy prohlížeč vůbec kreslí.

### --correct--

Prohlížeč vykresluje až po skončení úlohy, a to je text už „Uloženo".

#### --why--

Změna DOM se vykreslí až v dalším snímku a ten přijde, až obsluha doběhne. Mezi „Ukládám…" a výpočet patří `await yieldToMain()`, aby prohlížeč stihl snímek vykreslit.

### --answer--

Text se musí měnit přes `innerHTML`, ne `textContent`.

#### --why--

Obě vlastnosti DOM změní okamžitě. Zápis není problém, problém je načasování vykreslení.

### --see--

nastroje-devtools-vykon/core-web-vitals#inp-odezva-na-kazdou-interakci
:::

## Laboratorní a terénní data

Metriky se dají získat dvěma způsoby a čísla se často liší:

- **[[laboratorní data|Laboratorní data]]** (*lab data*) — měříš sám, na jednom zařízení, s nastaveným zpomalením: Lighthouse, panel Performance. Jsou opakovatelná a hodí se na ladění: změníš kód a hned vidíš rozdíl.
- **[[terénní data|Terénní data]]** (*field data*, *RUM*) — měření ze skutečných návštěv. Chrome je sbírá do veřejné databáze **CrUX** (*Chrome UX Report*) za posledních 28 dní, uvidíš je v PageSpeed Insights a v Search Console. Vlastní měření z návštěv přidáš knihovnou `web-vitals` (`onLCP`, `onINP`, `onCLS`), která data pošle na tvůj server.

Proč se liší: laboratoř nezná skutečné telefony, sítě, polohu ani to, co uživatel dělá. **INP laboratoř při načtení stránky vůbec nezměří** — nikdo neklikne. Lighthouse místo něj ukáže *Total Blocking Time* (TBT): součet doby, o kterou dlouhé úlohy při načítání přesáhly 50 ms. Vysoké TBT naznačuje špatné INP, ale nenahradí ho.

**O tom, jestli je web dobrý, rozhodují terénní data. Laboratoř slouží k hledání příčiny.**

:::check
Lighthouse na tvém notebooku dává LCP 1,4 s. PageSpeed Insights ukazuje u stejné adresy z terénních dat LCP 3,6 s na mobilech. Které číslo odpovídá tomu, co zažívají uživatelé?

### --answer--

Lighthouse, protože měří přesně a bez náhody.

#### --why--

Přesné je, ale jen pro jedno nastavení jednoho zařízení. Uživatelé mají jiné telefony, sítě i cache.

### --correct--

3,6 s z terénních dat, protože jde o 75. percentil skutečných návštěv.

#### --why--

Terénní data jsou měřená u skutečných lidí za posledních 28 dní. Laboratoř pak použiješ, abys zjistil, proč je to u nich pomalé (třeba zpomalením sítě a CPU na úroveň levného telefonu).

### --answer--

Ani jedno, je potřeba spočítat průměr obou.

#### --why--

Průměr laboratoře a terénu nemá žádný význam — měří každá něco jiného. Jedno z čísel popisuje skutečné návštěvy.

### --see--

nastroje-devtools-vykon/core-web-vitals#laboratorni-a-terenni-data
:::

## Lighthouse: skóre a jeho limity

**Lighthouse** je panel DevTools (a nástroj v PageSpeed Insights), který stránku načte se simulovaným pomalým telefonem a vydá skóre 0–100 a seznam doporučení. Skóre výkonu je vážený součet pěti laboratorních metrik: *Total Blocking Time* 30 %, LCP 25 %, CLS 25 %, *First Contentful Paint* 10 % a *Speed Index* 10 %.

Jak s ním pracovat:

- Spouštěj ho v **anonymním okně**, jinak do měření mluví rozšíření prohlížeče.
- Pusť ho **víckrát**. Skóre skáče o několik bodů podle zátěže počítače a sítě.
- Čti **doporučení a metriky**, ne jen skóre. Skóre 100 neznamená, že uživatelé mají dobré INP, a skóre 70 může mít web s výborným terénním LCP.
- Režim *Navigation* měří načtení. *Timespan* zaznamená, co na stránce děláš (klikání), a ukáže i interakce.

:::check
Proč Lighthouse v běžném režimu *Navigation* neukazuje INP, ale ukazuje TBT? Vyber nejpřesnější důvod.

### --answer--

INP je nová metrika a Lighthouse ji zatím neumí spočítat.

#### --why--

Nejde o novost metriky. Zamysli se, co INP potřebuje, aby vůbec vzniklo.

### --correct--

Při měření načtení nikdo neklikne, takže není co měřit; TBT ukáže, jak moc bylo vlákno blokované.

#### --why--

INP vzniká z interakcí uživatele. Při automatickém načtení žádné nejsou. TBT sečte, jak dlouho byly dlouhé úlohy nad hranicí 50 ms — právě ty by interakci zdržely.

### --answer--

INP se měří jen na počítačích a Lighthouse simuluje telefon.

#### --why--

INP se měří na telefonech i počítačích, klepnutí je taky interakce.

### --see--

nastroje-devtools-vykon/core-web-vitals#lighthouse-skore-a-jeho-limity
:::

## Panel Performance: záznam a čtení

Když víš, **která** metrika je špatně, panel Performance ukáže **proč**. Po otevření panelu uvidíš živé hodnoty LCP, CLS a INP aktuální stránky, které se mění, jak na stránce klikáš. Pro rozbor pořiď záznam:

1. Nastav **CPU throttling** na *4× slowdown* (a síť na *Slow 4G*). Tvůj procesor je mnohem rychlejší než telefon zákazníka.
2. Na načítání klikni na **Record and reload**. Na interakci klikni na **Record**, udělej na stránce akci a záznam zastav.
3. Čti záznam shora:
   - stopa **Network** — kdy se co stahovalo,
   - stopy **Layout shifts** a **Interactions** — fialové kosočtverce posunů a pruhy interakcí; po kliknutí vidíš, které prvky se posunuly, nebo tři části interakce,
   - stopa **Main** — hlavní vlákno jako *flame chart*: nahoře úloha, pod ní funkce, které volala. Úloha delší než 50 ms má **červený pruhovaný roh**,
   - postranní panel **Insights** — hotové rozbory, třeba *LCP by phase* nebo *Layout shift culprits*.
4. Klikni na dlouhou úlohu a dole v **Bottom-up** seřaď funkce podle *Self time*. Nahoře je funkce, která práci opravdu dělá.

> [!TIP]
> Posuny rozvržení a přepočty stylů uvidíš i bez záznamu: Ctrl+Shift+P → *Show Rendering* → zaškrtni *Layout Shift Regions*. Každý posun na stránce blikne modře.

:::check
V záznamu interakce vidíš na stopě Main úlohu 620 ms s červeným rohem. Pod ní je `onFilterInput`, pod tím `renderList` a pod tím 300× `createCard`. Který pohled ti rychle řekne, která funkce spotřebovala nejvíc času **sama za sebe**? Napiš jeho název.

### --expected-- ignore-case

Bottom-up

### --accept--

bottom up
bottomup

### --why--

*Bottom-up* sečte čas po funkcích a seřadí je podle *Self time* — času stráveného přímo ve funkci, bez funkcí, které volala. *Call tree* ukazuje stejná data od kořene, takže nahoře je vždycky obsluha události, i když sama nic nedělá.

### --see--

nastroje-devtools-vykon/core-web-vitals#panel-performance-zaznam-a-cteni
:::

## Typické chyby a pasti

### Měření bez zpomalení

> [!PITFALL]
> **Na výkonném notebooku bez zpomalení je každý web rychlý.** Příznak: v Performance nevidíš žádnou dlouhou úlohu, uživatelé přitom hlásí zadrhávání a terénní INP je 450 ms. Oprava: CPU throttling *4× slowdown* nebo *6× slowdown* a síť *Slow 4G*; ideálně ověř i na skutečném levném telefonu.

### `loading="lazy"` na hlavní fotce

> [!PITFALL]
> **Líné načítání hlavní fotky zhorší LCP.** Příznak: v Insights *LCP by phase* je dlouhé zpoždění před stažením a Lighthouse hlásí *LCP image was lazily loaded*. Prohlížeč s líným obrázkem počká, až spočítá rozvržení. Oprava: fotku nad přehybem nech bez `loading="lazy"`, líně načítej jen obrázky níž na stránce.

### Honba za skóre místo metrik

> [!PITFALL]
> **Skóre Lighthouse 100 z notebooku neznamená rychlý web.** Příznak: tým slaví zelené skóre, Search Console hlásí stránky se špatným INP. Oprava: cíle stanov v metrikách z terénu (LCP, INP, CLS na 75. percentilu) a Lighthouse ber jako nástroj na hledání příčin.

:::check
Na stránce detailu kola má hlavní fotka `loading="lazy"`, stáhne se rychle, a přesto je LCP pomalé. Ve které části LCP se čas ztratí?

### --answer--

Ve stahování, líný obrázek se stahuje pomaleji.

#### --why--

Rychlost stahování `loading` nemění. Mění, **kdy** stahování začne.

### --correct--

Ve zpoždění před stažením: prohlížeč začne líný obrázek stahovat až po výpočtu rozvržení.

#### --why--

U líného obrázku musí prohlížeč nejdřív zjistit, jestli je v zorném poli, a na to potřebuje styly a rozvržení. Obrázek bez `loading="lazy"` začne stahovat hned, jak ho najde v HTML.

### --answer--

V čase do prvního bajtu, protože líné obrázky zdržují server.

#### --why--

Server o atributu `loading` neví, dostane jen požadavek. Zdržení vzniká v prohlížeči.

### --see--

nastroje-devtools-vykon/core-web-vitals#loading-lazy-na-hlavni-fotce
:::

V další lekci se podíváš, jak načítání zrychlit: skripty, obrázky, písma a cache.

## Kde to najdeš v MDN

- [Largest Contentful Paint](https://developer.mozilla.org/en-US/docs/Glossary/Largest_contentful_paint) a [Interaction to Next Paint](https://developer.mozilla.org/en-US/docs/Glossary/Interaction_to_next_paint) — definice metrik, co se počítá za kandidáta a za interakci.
- [LayoutShift](https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift) — záznam posunu rozvržení, vlastnosti `value` a `hadRecentInput`.
- [Scheduler: yield() method](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield) — podpora v prohlížečích a proč pokračování předbíhá ostatní úlohy.
- [web.dev: Web Vitals](https://web.dev/articles/vitals) — hranice dobrých hodnot, 75. percentil a knihovna `web-vitals`. Není to MDN, ale oficiální zdroj Chrome týmu.

# --questions--

## --question--

Stránka má tyto posuny rozvržení (v sekundách od načtení a se skóre): 1,0 s → 0,04; 1,3 s → 0,05; 4,0 s → 0,03; 4,5 s → 0,02. Jaké je CLS stránky? Napiš číslo s desetinnou tečkou.

### --expected--

0.09

### --accept--

0,09

### --why--

Posuny v 1,0 s a 1,3 s dělí méně než sekunda, tvoří jedno okno se součtem 0,09. Mezi 1,3 s a 4,0 s je mezera přes sekundu, takže začíná nové okno: 0,03 + 0,02 = 0,05. CLS je nejhorší okno, tedy 0,09 — ne součet všech 0,14.

### --see--

nastroje-devtools-vykon/core-web-vitals#cls-posuny-ktere-uzivatel-necekal

## --question--

Proč kód za `await scheduler.yield()` pomůže INP, i když celková práce trvá stejně dlouho?

### --answer--

`scheduler.yield()` práci přesune do jiného vlákna.

#### --why--

Myslíš si, že `yield` pouští kód paralelně? Kód dál běží v hlavním vlákně, jen v jiné úloze.

### --correct--

Rozdělí práci do víc úloh, takže mezi nimi prohlížeč vykreslí odezvu a obslouží další vstup.

#### --why--

INP končí dalším vykreslením. Když se práce rozdělí, první snímek s odezvou přijde hned po první krátké úloze, ne až po celé práci.

### --answer--

`scheduler.yield()` práci zrychlí, protože ji naplánuje s vyšší prioritou.

#### --why--

Priorita určuje pořadí, ne rychlost. Práce trvá stejně dlouho, jen je rozdělená.

### --see--

nastroje-devtools-vykon/core-web-vitals#inp-odezva-na-kazdou-interakci

## --question--

Terénní data ukazují dobré LCP i CLS, ale špatné INP. Lighthouse dává 98 bodů. Kterou laboratorní metriku z Lighthouse sleduješ jako náhradu za INP? Napiš její zkratku.

### --expected-- ignore-case

TBT

### --accept--

Total Blocking Time

### --why--

*Total Blocking Time* sečte, o kolik dlouhé úlohy při načítání přesáhly 50 ms. Na špatné INP ale TBT stačit nemusí: pomalá může být až konkrétní interakce po načtení. Tu najdeš záznamem v panelu Performance nebo režimem *Timespan*.

### --see--

nastroje-devtools-vykon/core-web-vitals#laboratorni-a-terenni-data
