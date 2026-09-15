# View transitions a animace řízené scrollem

Karta úkolu, která při přesunu do sloupce „Hotovo" plynule přeletí na nové místo. Galerie, která se při přepnutí z mřížky na seznam přeskládá, místo aby problikla. Ukazatel, kolik článku už máš přečteno, a karty, které se objeví, když k nim doscrolluješ. Dřív na to byla potřeba knihovna, dnes to zvládne prohlížeč s jedním řádkem JavaScriptu nebo úplně bez něj.

Než začneš, tipni si dvě odpovědi.

:::check pretest
Tvůj kód volá `document.startViewTransition(update)`. Uživatel má prohlížeč, který view transitions nezná. Co se stane?

### --answer--
Prohlížeč funkci přeskočí a zavolá rovnou `update`.

#### --why--
JavaScript neznámé metody nepřeskakuje. Když na objektu metoda není, její volání skončí chybou.

### --correct--
Skript spadne na `TypeError: document.startViewTransition is not a function` a `update` se nezavolá.

#### --why--
Proto se před voláním ověřuje, jestli metoda existuje. Jak, uvidíš v první části.

### --answer--
Změna proběhne s obyčejným prolnutím, které umí každý prohlížeč.

#### --why--
Prolnutí dělá právě view transition. Prohlížeč, který ji nezná, nic podobného sám neudělá.
:::

:::check pretest
Ukazatel průběhu nahoře na stránce má animaci řízenou scrollem a v CSS `animation-duration: 10s`. Jak dlouho bude animace trvat?

### --answer--
10 sekund od načtení stránky.

#### --why--
To platí pro animaci na běžné časové ose. Tahle ale na čase nezávisí.

### --correct--
Tak dlouho, jak dlouho uživatel scrolluje od začátku na konec stránky; délka v sekundách se nepoužije.

#### --why--
Průběh animace neurčuje čas, ale poloha posuvníku: nahoře 0 %, dole 100 %.

### --answer--
10 sekund, ale jen když uživatel zrovna scrolluje.

#### --why--
Animace se nezastavuje a nerozbíhá podle toho, jestli se scrolluje. Každé poloze posuvníku odpovídá jedno místo animace.
:::

## Problém: změna obsahu skokem

Přechody animují změnu hodnoty vlastnosti. Jenže spousta změn v rozhraní žádná změna vlastnosti není: JavaScript přesune prvek do jiného seznamu, přidá nový, smaže starý nebo přeskládá celou mřížku. Nový stav se vykreslí hned a oko nestihne sledovat, co kam zmizelo.

[[view transition|View transition]] to řeší jinak než přechody. **Prohlížeč si vyfotí stránku před změnou, provede tvoji změnu, vyfotí stránku po ní a mezi oběma fotkami animuje — obsah stránky se přitom změní okamžitě, animují se jen snímky nad ní.**

:::live
```html
<section class="gallery">
  <button class="toggle" type="button">Přepnout na seznam</button>
  <ul class="photos">
    <li><span class="thumb thumb--1"></span>Sněžka při východu slunce</li>
    <li><span class="thumb thumb--2"></span>Labský důl v mlze</li>
    <li><span class="thumb thumb--3"></span>Luční bouda v zimě</li>
    <li><span class="thumb thumb--4"></span>Úpská jáma na podzim</li>
  </ul>
</section>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }

.toggle {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: white;
  font: inherit;
}

.photos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  max-width: 24rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.photos li {
  display: grid;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.thumb {
  display: block;
  aspect-ratio: 4 / 3;
  border-radius: 0.5rem;
}

.thumb--1 { background: linear-gradient(160deg, #fdba74, #9a3412); }
.thumb--2 { background: linear-gradient(160deg, #cbd5e1, #334155); }
.thumb--3 { background: linear-gradient(160deg, #e0f2fe, #0369a1); }
.thumb--4 { background: linear-gradient(160deg, #fde68a, #b45309); }

.photos.is-list { grid-template-columns: 1fr; }
.photos.is-list li { grid-template-columns: 5rem 1fr; align-items: center; }
```
```js
const toggle = document.querySelector('.toggle');
const photos = document.querySelector('.photos');

function update() {
  const isList = photos.classList.toggle('is-list');
  toggle.textContent = isList ? 'Přepnout na mřížku' : 'Přepnout na seznam';
}

toggle.addEventListener('click', () => {
  if (!document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(update);
});
```
:::

Klikni na tlačítko: galerie se prolne z mřížky do seznamu. Pak v posluchači nahraď celý obsah jen voláním `update();` a klikni znovu — přepnutí je skokem. Zatím se prolíná celá stránka najednou; jak rozpohybovat jednotlivé fotky, uvidíš za chvíli.

> [!REMEMBER]
> **View transition vyfotí stránku před změnou a po ní a mezi fotkami animuje.** DOM se změní okamžitě, animace běží ve vrstvě nad stránkou a nic nepočítá znovu.

:::check
Proč stačí u galerie jediné volání `document.startViewTransition(update)`, a nepotřebuješ žádný `transition` na `grid-template-columns`?

### --answer--
Protože `startViewTransition` nastaví všem prvkům stránky `transition: all`.

#### --why--
View transition na prvky stránky žádné přechody nepřidává. Změna v DOM se provede okamžitě a bez přechodů.

### --correct--
Protože prohlížeč neanimuje změnu vlastností, ale prolne snímek stránky před změnou se snímkem po ní.

#### --why--
Snímky jsou obrázky ve vrstvě nad stránkou. Co se mezi nimi v DOM změnilo, je jedno.

### --answer--
Protože `grid-template-columns` jde animovat samo od sebe.

#### --why--
V ukázce bez view transition se galerie přepne skokem, takže samo se to neanimuje. Animaci dělá view transition.
:::

## `document.startViewTransition()` a detekce podpory

Celé API na straně JavaScriptu je jedna metoda: `document.startViewTransition(callback)`. Prohlížeč vyfotí starý stav, zavolá tvoji funkci, která změní DOM, vyfotí nový stav a spustí animaci. Funkce musí změnu provést celou — když by část doběhla později, na nové fotce nebude.

```js
function showFilteredProducts(products) {
  // 1. prohlížeč bez view transitions: jen změna
  if (!document.startViewTransition) {
    renderProducts(products);
    return;
  }
  // 2. se snímky před změnou a po ní
  document.startViewTransition(() => renderProducts(products));
}
```

Metoda vrací objekt s promisy `ready` (animace začíná) a `finished` (animace skončila). K promisům se dostaneš v sekci `js-async`; teď stačí vědět, že na ně jde počkat, třeba s přesunem fokusu až po animaci.

Výchozí animace je prolnutí celé stránky (skupina `root`) za 0,25 s. Snímky jsou pseudoprvky, které stylovat jde:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 400ms;
}
```

`::view-transition-old(…)` je fotka před změnou (ve výchozím stavu mizí), `::view-transition-new(…)` fotka po změně (objevuje se). Oba leží v `::view-transition-group(…)`, která hlídá polohu a velikost.

> [!TIP]
> V DevTools otevři panel **Animations** a klikni na tlačítko galerie. Animaci view transition tam jde zpomalit na 10 % a v panelu Elements pak uvidíš strom pseudoprvků `::view-transition` nad celou stránkou.

:::check
Změna v DOM má proběhnout v každém prohlížeči, animace jen tam, kde to jde. Doplň podmínku do `if (…)`, která pozná, že prohlížeč view transitions nepodporuje.

```js
if (…) {
  renderCart();
  return;
}
document.startViewTransition(renderCart);
```

### --expected--
!document.startViewTransition

### --accept--
typeof document.startViewTransition !== 'function'
typeof document.startViewTransition === 'undefined'
!('startViewTransition' in document)
document.startViewTransition === undefined

### --why--
Metoda, která neexistuje, je `undefined`, a `!undefined` je `true`. Starší prohlížeč pak jen vykreslí košík, novější zavolá `startViewTransition`.
:::

## `view-transition-name`: prvek, který přeletí

Prolnutí celé stránky je hezké, ale nejvíc pomůže, když oko vidí, **kam** se konkrétní prvek přesunul. K tomu dostane prvek vlastnost `view-transition-name`. Prohlížeč ho pak vyfotí zvlášť a jeho skupinu plynule posune a zvětší ze staré polohy do nové — i když je v DOM úplně jinde.

Jméno musí být **na stránce jedinečné**. U seznamu ho proto dostane každý prvek zvlášť, třeba ze svého `id`:

:::live
```html
<div class="board">
  <section>
    <h2>K udělání</h2>
    <ul class="list" id="todo">
      <li class="task" style="view-transition-name: task-logo">Navrhnout logo <button type="button">Hotovo</button></li>
      <li class="task" style="view-transition-name: task-menu">Nafotit menu <button type="button">Hotovo</button></li>
      <li class="task" style="view-transition-name: task-web">Nasadit web <button type="button">Hotovo</button></li>
    </ul>
  </section>
  <section>
    <h2>Hotovo</h2>
    <ul class="list" id="done"></ul>
  </section>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }

.board {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 32rem;
}

h2 { margin: 0 0 0.5rem; font-size: 1rem; }

.list {
  display: grid;
  gap: 0.5rem;
  min-height: 10rem;
  margin: 0;
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: #f1f5f9;
  list-style: none;
}

.task {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.1);
  font-size: 0.875rem;
}

#done button { display: none; }
```
```js
const done = document.querySelector('#done');

document.querySelector('#todo').addEventListener('click', (event) => {
  const task = event.target.closest('button')?.closest('.task');
  if (!task) return;
  const move = () => done.append(task);
  if (!document.startViewTransition) {
    move();
    return;
  }
  document.startViewTransition(move);
});
```
:::

Klikni na „Hotovo" u prostřední karty: přeletí do druhého sloupce a spodní karta plynule zajede na uvolněné místo. Každá karta má vlastní jméno, takže každá má vlastní skupinu. Jak se zachová stránka, když se jméno opakuje?

:::live predict
```html
<button class="add" type="button">Přidat do košíku</button>
<p class="cart">Košík: <span class="badge" style="view-transition-name: cart-badge">0</span></p>
<p class="promo">Doprava zdarma od 1 500 Kč <span class="badge" style="view-transition-name: cart-badge">%</span></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }

.add { padding: 0.5rem 1rem; font: inherit; }

.badge {
  display: inline-block;
  min-width: 1.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: #16a34a;
  color: white;
  text-align: center;
}

.cart.is-full .badge { background: #dc2626; }
```
```js
const add = document.querySelector('.add');
const count = document.querySelector('.cart .badge');

add.addEventListener('click', () => {
  document.startViewTransition(() => {
    count.textContent = Number(count.textContent) + 1;
    document.querySelector('.cart').classList.add('is-full');
  });
});
```
--question-- Dva prvky na stránce mají stejné `view-transition-name: cart-badge`. Co se stane po kliknutí na tlačítko?
--option-- Oba odznaky se prolnou do nového stavu.
--option-- Animuje se jen první odznak, druhý se změní skokem.
--option*-- Animace se zruší a změna proběhne skokem.
--why-- Prohlížeč neví, který ze dvou prvků se jménem `cart-badge` je „ten" prvek, takže view transition přeruší ještě před animací. Tvoje funkce se přesto zavolá, takže změna proběhne — jen bez animace. V konzoli DevTools uvidíš hlášku o duplicitním `view-transition-name`. Smaž atribut `style` u druhého odznaku a klikni znovu.
--see-- css-animace/view-transitions-scroll#view-transition-name-prvek-ktery-preleti
:::

:::check
Galerie má dvanáct fotek a každá se má při přeskládání přesunout samostatně. Kolik různých hodnot `view-transition-name` potřebuješ?

### --expected--
12

### --accept--
dvanáct

### --why--
Jméno musí být v jednom okamžiku na stránce jedinečné. Dvanáct fotek, dvanáct jmen — třeba `photo-1` až `photo-12` z jejich `id`.
:::

## Přechody mezi stránkami: `@view-transition`

View transition funguje i mezi dvěma samostatnými HTML stránkami, bez JavaScriptu. Obě stránky (stará i nová) musí mít v CSS:

```css
@view-transition {
  navigation: auto;
}
```

Když uživatel klikne na odkaz na stránku ze **stejného původu** (stejná doména, port a protokol), prohlížeč vyfotí starou stránku, načte novou a prolne je. Prvky se stejným `view-transition-name` na obou stránkách přeletí: náhled projektu v seznamu se tak může „rozvinout" do velkého obrázku na stránce projektu.

Mezi stránkami to zatím umí Chrome, Edge a Safari. Firefox pravidlo ignoruje a stránky se přepnou jako vždycky — nic se nerozbije. V náhledu Akademie si to nevyzkoušíš, protože ukázka je jedna stránka. Přijde na řadu ve vlajkovém projektu na konci sekce, v portfoliu.

:::check
Přidal jsi `@view-transition { navigation: auto; }` do stylů úvodní stránky portfolia, ale přechod na stránku projektu je pořád skokem. Obě stránky jsou na stejné doméně. Co nejspíš chybí?

### --answer--
Volání `document.startViewTransition()` v posluchači kliknutí na odkaz.

#### --why--
Přechody mezi stránkami se spouští samy při navigaci, JavaScript nepotřebují. `startViewTransition` je pro změny uvnitř jedné stránky.

### --correct--
Stejné pravidlo `@view-transition` ve stylech stránky projektu.

#### --why--
Souhlas musí dát obě stránky, stará i nová. Stačí společný soubor stylů pro celý web.

### --answer--
`view-transition-name` na elementu `<body>` na obou stránkách.

#### --why--
Celá stránka se prolíná sama jako skupina `root`. Jména jsou jen pro prvky, které mají přeletět zvlášť.
:::

## Animace řízená scrollem: `scroll()`

Běžná animace běží na časové ose: od začátku do konce za `animation-duration`. [[animace řízená scrollem|Animace řízená scrollem]] (*scroll-driven animation*) místo času použije polohu posuvníku. Nahoře je animace na 0 %, dole na 100 %, a když uživatel scrolluje zpátky, jede pozpátku.

Stačí klíčové snímky jako vždycky a navíc `animation-timeline`:

```css
.reading-progress {
  position: fixed;
  inset: 0 0 auto;
  height: 4px;
  background: #2563eb;
  transform-origin: left;
  animation: grow linear both;
  animation-timeline: scroll(root);
}

@keyframes grow {
  from { scale: 0 1; }
}
```

`scroll(root)` znamená posuvník celé stránky, `scroll()` bez argumentu nejbližší rodič, který se posouvá. Délka animace se nepoužije a křivka `linear` zajistí, že půlka stránky odpovídá půlce ukazatele.

Kolega napsal tentýž ukazatel s jedním rozdílem v pořadí. Tipni si, co uvidí:

:::live predict
```html
<div class="reading-progress"></div>
<article class="article">
  <h1>Jak se připravit na první výstup na Sněžku</h1>
  <p>Vyraz brzy ráno, dokud jsou cesty prázdné a počasí stabilní. Na hřebenech fouká i v létě, proto si vezmi bundu a čepici.</p>
  <p>Nejpohodlnější je trasa z Pece pod Sněžkou přes Obří důl. Je strmá, ale krátká, a cestou máš několik míst na odpočinek.</p>
  <p>Na vrcholu je poštovna a bouda s občerstvením. Když je výhled, uvidíš Polsko i Krkonošský hřeben až k Labské boudě.</p>
  <p>Zpátky se dá sjet lanovkou, která jezdí celoročně. V zimě ověř provoz předem, při silném větru nejezdí.</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; }

.article {
  max-width: 34rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 60rem;
  line-height: 1.7;
}

.reading-progress {
  position: fixed;
  inset: 0 0 auto;
  height: 6px;
  background: #2563eb;
  transform-origin: left;
  animation-timeline: scroll(root);
  animation: grow linear both;
}

@keyframes grow {
  from { scale: 0 1; }
}
```
--question-- `animation-timeline` stojí **před** shorthandem `animation`. Co ukazatel udělá, když stránku posouváš?
--option-- Plní se podle scrollování, pořadí nerozhoduje.
--option*-- Je hned na celé šířce a při scrollování se nemění.
--option-- Není vidět vůbec.
--why-- Shorthand `animation` nastaví všechny dílčí vlastnosti, i ty, které v něm nejsou napsané, na výchozí hodnotu — a mezi ně patří i `animation-timeline`. Ukazatel tak běží na obyčejné časové ose s délkou 0 s a díky `both` hned zůstane v posledním stavu, na celé šířce. Přesuň `animation-timeline` pod `animation` a posouvej znovu.
--see-- css-animace/view-transitions-scroll#animace-rizena-scrollem-scroll
:::

:::check
Stránka je vysoká 3000 px, okno 1000 px, takže posuvník urazí 2000 px. Uživatel je 500 px od začátku. Na kolika procentech je animace s `animation-timeline: scroll(root)` a křivkou `linear`?

### --expected--
25

### --accept--
25 %
25%

### --why--
Průběh je poloha posuvníku ku celé dráze posuvníku: 500 / 2000 = 25 %. Dráha je výška stránky minus výška okna, ne celá výška stránky.
:::

## `view()`: animace podle toho, kde je prvek v okně

Časová osa `view()` sleduje **jeden prvek** a jeho cestu oknem: 0 % ve chvíli, kdy spodní hranou vjede do okna, 100 %, když horní hranou z okna odjede. Kterou část té cesty animace využije, určuje `animation-range` s pojmenovanými úseky:

| úsek | od | do |
|---|---|---|
| `cover` | prvek začíná vjíždět do okna | prvek úplně odjel |
| `contain` | prvek je celý v okně | prvek začíná odjíždět |
| `entry` | prvek začíná vjíždět | prvek je celý v okně |
| `exit` | prvek začíná odjíždět | prvek úplně odjel |

Tím nahradíš odhalování obsahu přes [IntersectionObserver](see:js-dom/prohlizecova-api#sledovani-prvku-intersectionobserver-a-resizeobserver) — bez JavaScriptu a plynule oběma směry. Posouvej náhled a přepínej úsek:

:::live
```html
<main class="feed">
  <p class="hint">Posouvej dolů ↓</p>
  <article class="card">Chata Na Pláni</article>
  <article class="card">Bouda Pod Sněžkou</article>
  <article class="card">Horský hotel Hvězda</article>
  <article class="card">Penzion U Lanovky</article>
  <article class="card">Chalupa Pod Lesem</article>
</main>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; }

.feed {
  display: grid;
  gap: 2rem;
  max-width: 22rem;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 30rem;
}

.hint { height: 70vh; margin: 0; color: #64748b; }

.card {
  padding: 3rem 1.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #0f766e, #0369a1);
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

@supports (animation-timeline: view()) {
  .card {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: var(--range);
  }
}

@keyframes reveal {
  from {
    opacity: 0;
    translate: 0 3rem;
    scale: 0.94;
  }
}
```
```controls
--range: select("entry 0% entry 100%", "entry 0% cover 40%", "cover 0% cover 100%", "contain 0% contain 100%") = "entry 0% cover 40%" | animation-range
```
:::

S `entry 0% entry 100%` je karta hotová přesně ve chvíli, kdy je celá vidět. `cover 0% cover 100%` natáhne animaci přes celou cestu oknem, takže karta dojede, až když už skoro odjíždí. `@supports` zajistí, že prohlížeč bez podpory (dnes Firefox) karty ukáže rovnou, bez animace.

:::check
Karty se mají objevit během toho, jak vjíždějí do okna, a být hotové ve chvíli, kdy jsou celé vidět. Napiš hodnotu `animation-range`.

### --expected--
entry

### --accept--
entry 0% entry 100%
entry 0% entry

### --why--
Úsek `entry` začíná, když prvek začne vjíždět, a končí, když je celý v okně. Samotné `entry` znamená celý tenhle úsek.
:::

## Progresivní vylepšení a omezený pohyb

Podpora v září 2026:

| funkce | Chrome, Edge | Safari | Firefox |
|---|---|---|---|
| `document.startViewTransition()` | ano | ano | ano |
| `@view-transition` mezi stránkami | ano | ano | ne |
| `animation-timeline: scroll()` a `view()` | ano | ano (od verze 26) | ne |

[[progresivní vylepšení|Progresivní vylepšení]] (*progressive enhancement*) znamená: stránka funguje a dá se přečíst všude, animace jsou navíc tam, kde je prohlížeč zvládne.

- U view transitions ověř metodu (`if (!document.startViewTransition)`), změna DOM proběhne vždycky.
- Animace řízené scrollem obal do `@supports (animation-timeline: view())`. **Nikdy neschovávej obsah v základním stylu** (`opacity: 0`) s tím, že ho animace ukáže — bez podpory by zůstal neviditelný.
- Omezený pohyb: odhalování, parallaxu i přelety vypni.

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none;
  }

  .card {
    animation: none;
  }
}
```

:::explain
Vysvětli vlastními slovy, proč karty s odhalováním při scrollu nesmí mít `opacity: 0` v základním pravidle a jak zajistíš, že je uvidí i uživatel prohlížeče bez animací řízených scrollem.

## --model--
Když karta začne s `opacity: 0` v základním stylu a viditelnou ji udělá až animace, obsah závisí na tom, že animace proběhne. Jakmile neběží — prohlížeč nezná `view()`, pravidlo pro omezený pohyb nastaví `animation: none`, nebo je v zápisu chyba — karta zůstane neviditelná. Průhlednost proto patří jen do snímku `from` a celá animace do `@supports (animation-timeline: view())`. Bez animace je pak karta prostě vidět a animace je jen vylepšení navíc.

## --checklist--
- Když animace neběží, obsah schovaný v základním stylu zůstane skrytý.
- Počáteční průhlednost patří do klíčových snímků, ne do základního stylu.
- Animace se obalí do `@supports (animation-timeline: view())`.
- Obsah musí jít přečíst i bez animace.
:::

:::check
Která volba splní progresivní vylepšení pro odhalování karet při scrollu?

### --answer--
`.card { opacity: 0; animation: reveal linear forwards; animation-timeline: view(); }` a snímek `to { opacity: 1; }`.

#### --why--
Obsah tu závisí na tom, že animace doběhne. Stačí pravidlo pro omezený pohyb s `animation: none` a karty zůstanou s `opacity: 0` ze základního stylu neviditelné.

### --correct--
`@supports (animation-timeline: view()) { .card { animation: reveal linear both; animation-timeline: view(); } }` a snímek `from { opacity: 0; }`.

#### --why--
Bez podpory se celé pravidlo přeskočí a karty jsou normálně vidět. S podporou začne animace ze snímku `from`.

### --answer--
JavaScript, který zjistí prohlížeč podle `navigator.userAgent` a Firefoxu karty ukáže.

#### --why--
Podle jména prohlížeče se podpora nepozná spolehlivě a zítra může být jinak. Ptej se na funkci, ne na prohlížeč.
:::

## Typické chyby a pasti

> [!PITFALL] Stejné `view-transition-name` dvakrát
> *Příznak:* view transition se vůbec nespustí, změna proběhne skokem a v konzoli DevTools je hláška o duplicitním `view-transition-name`; promise `ready` skončí chybou `InvalidStateError: Transition was aborted because of invalid state. Snapshot capture failed`.
>
> *Oprava:* jméno musí být jedinečné. U seznamů ho skládej z `id` položky, nebo ho dávej jen prvku, který se právě mění.

> [!PITFALL] `animation` pod `animation-timeline`
> *Příznak:* ukazatel průběhu je hned celý, odhalované karty jsou rovnou vidět a scroll nic nedělá.
>
> *Oprava:* shorthand `animation` resetuje i `animation-timeline`. Piš `animation-timeline` (a `animation-range`) až pod něj.

> [!PITFALL] Obsah schovaný bez podpory
> *Příznak:* s omezeným pohybem (`animation: none`), v prohlížeči bez podpory nebo po překlepu v animaci jsou sekce stránky prázdné.
>
> *Oprava:* žádné `opacity: 0` v základním stylu. Počáteční stav do snímku `from`, animaci do `@supports`.

> [!PITFALL] `startViewTransition` bez kontroly
> *Příznak:* ve starším prohlížeči tlačítko nic nedělá a v konzoli je `TypeError: document.startViewTransition is not a function`.
>
> *Oprava:* nejdřív ověř, jestli metoda existuje; když ne, zavolej jen funkci se změnou.

:::check
Odhalování karet při scrollu v Chromu nefunguje: karty jsou vidět hned a scroll s nimi nic nedělá. V CSS je `animation-range: entry; animation-timeline: view(); animation: reveal linear both;`. Kolik z těch tří deklarací prohlížeč ve skutečnosti použije tak, jak jsou napsané?

### --expected--
1

### --accept--
jednu
jedna

### --why--
Shorthand `animation` stojí poslední, a tak `animation-timeline` i `animation-range` přepíše na výchozí hodnoty. Použije se jen `animation` s obyčejnou časovou osou.
:::

Na konci sekce postavíš celou stránku v kontrolním bodu a landing page ve vlajkovém projektu; animaci řízenou scrollem si tam přidáš jako rozšíření a přechody mezi stránkami zapneš v portfoliu.

> [!NOTE]
> Tím máš z pohybu všechno, co prohlížeč zvládne sám v CSS. Efekty, na které samotné CSS nestačí — odhalení nadpisu po slovech, přišpendlená sekce, tlumený scroll nebo časová osa řízená z JavaScriptu — přijdou v sekci o efektech a animacích (`css-efekty-animace`), která na tuhle navazuje. Do té doby platí: pohyb, který zvládne CSS, do JavaScriptu nepatří.

## Kde to najdeš v MDN

- [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) — `startViewTransition()`, pseudoprvky `::view-transition-*` a přechody mezi stránkami.
- [@view-transition](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition) — pravidlo pro přechody mezi dokumenty a tabulka podpory.
- [CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) — `scroll()`, `view()`, pojmenované časové osy a průvodce s ukázkami.
- [animation-range](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range) — všechny pojmenované úseky a jejich kombinace.

# --questions--

## --question--

Přesouváš kartu úkolu mezi sloupci uvnitř `document.startViewTransition(…)`. Karta přeletí, ale ostatní karty ve starém sloupci na uvolněné místo skočí. Proč?

### --answer--

Protože view transition animuje jen prvek, na který se kliklo.

#### --why--

View transition neví nic o kliknutí. Animuje skupiny podle jmen, bez ohledu na to, co změnu vyvolalo.

### --correct--

Protože jméno `view-transition-name` má jen přesouvaná karta; ostatní jsou součástí fotky celé stránky, která se jen prolne.

#### --why--

Samostatně přeletí jen prvky s vlastním jménem. Když má jméno každá karta, posunou se plynule i sousedky.

### --answer--

Protože přesun v DOM musí proběhnout až po skončení animace.

#### --why--

Změna DOM patří dovnitř funkce předané `startViewTransition`, a to je tady v pořádku. Problém je v tom, co prohlížeč fotí zvlášť.

### --see--

css-animace/view-transitions-scroll#view-transition-name-prvek-ktery-preleti

## --question--

Napiš hodnotu `animation-timeline`, se kterou se animace řídí posuvníkem celé stránky, i když je prvek uvnitř jiného posouvaného kontejneru.

### --expected--

scroll(root)

### --why--

`scroll()` bez argumentu hledá nejbližšího posouvaného předka, `scroll(root)` vezme vždycky posuvník dokumentu.

### --see--

css-animace/view-transitions-scroll#animace-rizena-scrollem-scroll

## --question--

Obrázek v článku se má postupně přibližovat přesně po dobu, kdy je celý vidět v okně, a přestat, jakmile z něj začne odjíždět. Napiš název úseku pro `animation-range`.

### --expected--

contain

### --accept--

contain 0% contain 100%

### --why--

`contain` začíná, když je prvek celý v okně, a končí, když z něj začne odjíždět. `cover` by zahrnul i vjíždění a odjíždění.

### --see--

css-animace/view-transitions-scroll#view-animace-podle-toho-kde-je-prvek-v-okne
