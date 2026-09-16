# Animace řízené scrollem a Lenis

Karty recenzí, které se objeví, když k nim dojedeš. Fotka sluchátek, která se při scrollu natáčí. Sekce s funkcemi produktu, která zůstane stát, zatímco se v ní střídají texty. Pozadí, které se posouvá pomaleji než popředí. Tyhle efekty najdeš na produktových stránkách výrobců telefonů a sluchátek — a na stovkách webů, kde spíš otravují.

Než začneš, tipni si.

:::check pretest
ScrollTrigger má nastavené `start: 'top 80%'`. Kdy se animace spustí?

### --answer--
Když uživatel doscrolluje na 80 % délky stránky.

#### --why--
Pozice se nevztahuje k celé stránce, ale k jednomu prvku a oknu prohlížeče.

### --correct--
Když horní okraj prvku dojede na úroveň 80 % výšky okna, počítáno odshora.

#### --why--
První slovo patří prvku, druhé oknu. Rozebereme v části o ScrollTriggeru.

### --answer--
Když je z prvku vidět 80 %.

#### --why--
Tohle umí `inView` s volbou `amount`, zápis ScrollTriggeru znamená něco jiného.
:::

:::check pretest
Parallax napíšeš tak, že v posluchači `scroll` pokaždé přečteš `window.scrollY` a nastavíš fotce `style.top`. Co se stane na slabším telefonu?

### --answer--
Nic, posluchač `scroll` je stejně rychlý jako knihovna.

#### --why--
Na rychlosti volání tolik nezáleží. Rozhoduje, co posluchač dělá: změna `top` spouští přepočet rozvržení.

### --correct--
Fotka může cukat, protože každá změna `top` v každém snímku přepočítá rozvržení stránky.

#### --why--
Parallax patří do `transform` a rozměry se mají měřit předem, ne při každém scrollu. Uvidíš, jak to dělá ScrollTrigger.
:::

## Problém: tři druhy scroll efektů

„Animace na scroll" jsou ve skutečnosti tři různé věci a každá potřebuje jiný nástroj:

1. **Odhalení** — prvek se jednou animuje, když se objeví v okně. Čas animace je pevný, scroll ji jen spustí.
2. **Animace svázaná s posuvníkem** — průběh animace odpovídá poloze scrollu: popojedeš o kus, animace popojede o kus; scrolluješ zpátky, jede zpátky. Tak funguje parallax i ukazatel průběhu čtení.
3. **Přišpendlená sekce** — sekce na chvíli zůstane stát, stránka pod ní „čeká" a scroll mezitím řídí animaci uvnitř sekce.

> [!REMEMBER]
> **Nejdřív rozhodni, jestli scroll animaci jen spouští, nebo ji řídí.** Spouští: `inView` nebo ScrollTrigger s `toggleActions`. Řídí: `scrub`, CSS `animation-timeline`, Motion `scroll()`. Stání sekce: ScrollTrigger s `pin`.

:::check
Na stránce kávovaru se při scrollu plní šálek: čím níž jsi, tím víc kávy v něm je, a když scrolluješ zpátky, káva ubývá. O který druh scroll efektu jde?

### --answer--
Odhalení, protože se šálek objeví při scrollu.

#### --why--
Odhalení proběhne jednou vlastním tempem. Tady se stav mění s každým pixelem scrollu oběma směry.

### --correct--
Animace svázaná s posuvníkem.

#### --why--
Průběh animace odpovídá poloze scrollu a jede i zpátky. To je `scrub` nebo `animation-timeline`.

### --answer--
Přišpendlená sekce.

#### --why--
O zastavení sekce tu nic není. Šálek se jen plní podle polohy.
:::

## Jednorázové odhalení: Motion `inView`

Odhalení umíš postavit sám přes `IntersectionObserver` z [js-dom](see:js-dom/prohlizecova-api#sledovani-prvku-intersectionobserver-a-resizeobserver). Knihovna Motion to zabalí do jedné funkce: `inView(selektor, callback)` zavolá callback pro každý prvek, který vjede do okna. Callback může vrátit funkci, která se zavolá, když prvek z okna zase odjede.

:::live dom libs=motion
```html
<p class="hint">Scrolluj v náhledu dolů.</p>
<ul class="reviews">
  <li class="review">„Ruch tramvaje přestal existovat." <span>Jana, Brno</span></li>
  <li class="review">„Baterie mi vydržela celý týden dojíždění." <span>Petr, Pardubice</span></li>
  <li class="review">„Lehčí než moje minulá, i po třech hodinách." <span>Klára, Olomouc</span></li>
  <li class="review">„Hovory z kola bez šumu větru." <span>Ondřej, Plzeň</span></li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #f5f3ef; }
.hint { height: 70vh; color: #57534e; }
.reviews { display: grid; gap: 1rem; margin: 0 0 60vh; padding: 0; list-style: none; }
.review { padding: 1.25rem; border-radius: 1rem; background: white; font-size: 1.125rem; box-shadow: 0 8px 24px rgb(0 0 0 / 0.06); }
.review span { display: block; margin-top: 0.5rem; color: #78716c; font-size: 0.875rem; }
```
```js
import { animate, inView } from 'motion';

inView('.review', (review) => {
  animate(review, { opacity: [0, 1], y: [32, 0] }, { duration: 0.6, ease: 'easeOut' });
}, { amount: 0.4 });
```
:::

`amount: 0.4` znamená, že callback počká, až bude vidět 40 % prvku. Zkus místo prázdného návratu vrátit z callbacku `() => animate(review, { opacity: 0 })` a scrolluj nahoru a dolů: karty při odjezdu zmizí a při příjezdu se objeví znovu.

Všimni si, že karty nemají v CSS `opacity: 0`. Průhlednost začíná až v animaci (`opacity: [0, 1]`), takže bez JavaScriptu jsou vidět. Karta těsně nad hranou okna tak na zlomek sekundy problikne; když ti to vadí, skryj ji třídou `js` jako ve workshopu hero sekce.

:::check
Proč je `inView` pro odhalení lepší volba než posluchač `scroll`, který u každé karty volá `getBoundingClientRect()`?

### --answer--
Protože `getBoundingClientRect()` v posluchači `scroll` nefunguje.

#### --why--
Funguje, jen je to drahé: čte rozvržení při každé události scrollu.

### --correct--
Protože stojí na `IntersectionObserver`, který prohlížeč vyhodnocuje sám mimo tvůj kód, bez čtení rozvržení při každém scrollu.

#### --why--
Prohlížeč průniky počítá při vykreslování a callback zavolá jen při změně. Tvůj kód při scrollu vůbec neběží.

### --answer--
Protože `inView` animuje přes `transform`.

#### --why--
Jak se animuje, rozhoduje `animate`. `inView` jen hlídá, kdy prvek vjede do okna.
:::

## CSS `animation-timeline`, nebo ScrollTrigger

Animace řízené scrollem v čistém CSS znáš z [css-animace](see:css-animace/view-transitions-scroll#view-animace-podle-toho-kde-je-prvek-v-okne): `animation-timeline: view()` a `animation-range`. Pro odhalení a ukazatel průběhu jsou ideální, stojí nula kilobajtů a běží mimo hlavní vlákno. Chybí jim zastavení sekce, sekvence s pozicemi, animace hodnot mimo CSS a podpora ve všech prohlížečích, proto patří do `@supports`.

:::compare
```html
<p class="hint">Scrolluj dolů.</p>
<div class="cards">
  <article class="card">Výdrž 40 h</article>
  <article class="card">Hmotnost 250 g</article>
  <article class="card">Nabití za 10 min na 5 h</article>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.hint { height: 80vh; }
.cards { display: grid; gap: 1rem; padding-bottom: 80vh; }
.card { padding: 2rem; border-radius: 1rem; background: linear-gradient(135deg, #1e293b, #334155); color: white; font-size: 1.25rem; font-weight: 700; }
```
--variant-- CSS view()
```css
@supports (animation-timeline: view()) {
  .card {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 40%;
  }
}
@keyframes reveal {
  from { opacity: 0; translate: 0 3rem; }
}
```
--variant-- ScrollTrigger
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.card').forEach((card) => {
  gsap.from(card, {
    autoAlpha: 0,
    y: 48,
    duration: 0.6,
    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
  });
});
```
:::

Obě varianty karty odhalí, ale jinak. CSS varianta je svázaná s posuvníkem: když se zastavíš uprostřed, karta zůstane napůl průhledná. ScrollTrigger varianta se jen **spustí** a doběhne vlastním tempem, a při scrollu zpátky nad hranu se vrátí (`reverse`). Zkus v CSS variantě změnit `animation-range` na `entry`, a ve ScrollTrigger variantě `toggleActions` na `'play none none none'`.

:::check
Potřebuješ ukazatel průběhu čtení článku nahoře na stránce. Nic dalšího se na stránce neanimuje. Co použiješ?

### --answer--
ScrollTrigger se `scrub` a `pin`.

#### --why--
Ukazatel se nikde nezastavuje a kvůli jedné animaci by stránka tahala knihovnu.

### --correct--
CSS `animation-timeline: scroll()` v `@supports`, případně s malou záložní variantou v JavaScriptu.

#### --why--
Ukazatel je přesně to, na co je časová osa scrollu v CSS dělaná: nula kilobajtů a běh mimo hlavní vlákno.

### --answer--
Motion `inView`.

#### --why--
`inView` jen hlásí, jestli je prvek v okně. Průběh čtení od 0 do 100 % z něj nedostaneš.
:::

## ScrollTrigger: `trigger`, `start` a `end`

ScrollTrigger se připojí k tweenu nebo timeline přes klíč `scrollTrigger`. Nejdůležitější jsou tři údaje:

```js
gsap.registerPlugin(ScrollTrigger);

gsap.from('.feature', {
  autoAlpha: 0,
  y: 60,
  scrollTrigger: {
    trigger: '.feature',             // podle kterého prvku se měří
    start: 'top 80%',                // horní okraj prvku × 80 % výšky okna
    end: 'bottom 20%',               // dolní okraj prvku × 20 % výšky okna
    toggleActions: 'play none none reverse',
    markers: true,                   // jen při ladění
  },
});
```

`start` a `end` jsou dvě slova: **první patří prvku, druhé oknu**. `'top 80%'` = „až horní okraj prvku dojede na čáru v 80 % výšky okna". Místo procent jde psát `top`, `center`, `bottom` nebo pixely; `end: '+=500'` znamená 500 px scrollu od startu.

[[toggleActions]] jsou čtyři akce pro čtyři okamžiky: při vjezdu dolů přes start, při výjezdu dolů přes end, při návratu nahoru přes end a při návratu nahoru přes start. Hodnoty: `play`, `pause`, `resume`, `reverse`, `restart`, `reset`, `complete`, `none`.

`markers: true` nakreslí do stránky čáry startu a konce prvku i okna. Při ladění nenahraditelné, do produkce nikdy.

:::live dom libs=gsap predict
```html
<p class="spacer">Scrolluj dolů a sleduj zelenou a červenou čáru.</p>
<section class="feature">Aktivní potlačení hluku</section>
<p class="spacer"></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 0 1.5rem; }
.spacer { height: 110vh; margin: 0; padding-top: 1rem; }
.feature { padding: 3rem 1.5rem; border-radius: 1rem; background: #0f766e; color: white; font-size: 1.5rem; font-weight: 700; }
```
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.to('.feature', {
  rotation: 3,
  scale: 1.05,
  backgroundColor: '#f97316',
  duration: 0.5,
  scrollTrigger: { trigger: '.feature', start: 'top 60%', toggleActions: 'play none none reverse', markers: true },
});
```
--question-- Kdy sekce zoranžoví?
--option-- Když se její horní okraj objeví dole v okně.
--option*-- Když její horní okraj dojede na čáru v 60 % výšky okna, počítáno odshora.
--option-- Když je sekce vidět ze 60 %.
--why-- `'top 60%'`: horní okraj prvku (`top`) potká čáru v 60 % výšky okna. Markery ukazují obě čáry: `start` u prvku a `scroller-start` v okně. Animace se spustí, až se potkají, a při návratu nahoru se díky `reverse` vrátí.
:::

:::check
Napiš hodnotu `start`, se kterou se animace spustí, až bude střed prvku přesně uprostřed okna.

### --expected--
center center

### --accept--
'center center'
"center center"
center 50%
50% 50%

### --why--
První slovo je místo na prvku, druhé místo v okně. Obě mají být uprostřed.
:::

## `scrub`: animace přilepená k posuvníku

S [[scrub]] ScrollTrigger animaci nespouští, ale **řídí**: mezi `start` a `end` odpovídá průběh animace poloze scrollu. `scrub: true` je přilepený přesně, `scrub: 1` animace posuvník „dohání" s jednosekundovým zpožděním, což působí měkčeji. Se `scrub` se `toggleActions` ignorují a `duration` tweenu určuje jen poměr délek uvnitř timeline.

:::live dom libs=gsap
```html
<p class="spacer">Scrolluj a pak změň scrub vpravo.</p>
<div class="stage"><div class="bar"></div><p class="value">0 %</p></div>
<p class="spacer"></p>
```
```css
:root { --scrub-setting: var(--scrub); }
body { font-family: system-ui, sans-serif; margin: 0 1.5rem; }
.spacer { height: 90vh; margin: 0; padding-top: 1rem; }
.stage { padding: 2rem 0; }
.bar { height: 1rem; border-radius: 999px; background: #6366f1; transform-origin: left; }
.value { font-variant-numeric: tabular-nums; }
```
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let tween;
function build() {
  tween?.scrollTrigger.kill();
  tween?.revert();
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--scrub-setting').trim();
  tween = gsap.fromTo('.bar', { scaleX: 0 }, {
    scaleX: 1,
    ease: 'none',
    onUpdate() {
      document.querySelector('.value').textContent = `${Math.round(this.progress() * 100)} %`;
    },
    scrollTrigger: { trigger: '.stage', start: 'top bottom', end: 'bottom top', scrub: raw === 'true' ? true : Number(raw) },
  });
}

build();
new MutationObserver(build).observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
```
```controls
--scrub: select(true, 0.5, 2) = true | scrub
```
:::

S `true` se proužek zastaví přesně ve chvíli, kdy přestaneš scrollovat. S `2` ještě dvě sekundy dojíždí. Hodnoty kolem `0.5`–`1` vypadají na produktových stránkách nejpřirozeněji; u ukazatele průběhu chceš `true`, jinak ukazuje, kde jsi byl, ne kde jsi.

Pro animace se `scrub` používej `ease: 'none'`. Zrychlování už dělá člověk prstem; křivka navíc by pohyb zkreslila.

`snap` přitáhne scroll po zastavení k nejbližšímu bodu: `snap: 1 / 3` ke třetinám, `snap: 'labels'` ke štítkům timeline. Hodí se u sekce, kde se střídají tři funkce produktu a nechceš, aby uživatel zůstal mezi nimi.

:::check
Timeline se `scrub: true` má tweeny s délkami 1, 1 a 2 a `end: '+=800'`. Kolik pixelů scrollu zabere poslední tween?

### --expected--
400

### --accept--
400 px
400px

### --why--
Se `scrub` délky určují jen poměr: celkem 4 díly na 800 px, poslední tween má 2 díly, tedy 400 px.
:::

## `pin`: sekce, která zůstane stát

`pin: true` drží `trigger` (nebo jiný prvek) na místě mezi `start` a `end`. ScrollTrigger ho obalí prvkem `pin-spacer` a přidá mu odsazení o délku přišpendlení, takže obsah pod sekcí se posune dolů a nic se nepřekryje.

:::live dom libs=gsap
```html
<section class="intro">Scrolluj dolů</section>
<section class="features">
  <p class="feature">1 · Potlačení hluku až 40 dB</p>
  <p class="feature">2 · Výdrž 40 hodin</p>
  <p class="feature">3 · Nabití za 10 minut na 5 hodin</p>
</section>
<section class="outro">Obsah pod sekcí</section>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; }
section { display: grid; place-content: center; min-height: 100vh; padding: 1.5rem; }
.intro, .outro { background: #f1f5f9; }
.features { position: relative; background: #0f172a; color: white; }
.feature { position: absolute; inset: 0; display: grid; place-content: center; margin: 0; font-size: 1.5rem; font-weight: 700; text-align: center; }
```
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: { trigger: '.features', start: 'top top', end: '+=200%', scrub: 0.5, pin: true },
});

steps
  .from('.feature:nth-child(1)', { autoAlpha: 0, y: 40 })
  .to('.feature:nth-child(1)', { autoAlpha: 0, y: -40 })
  .from('.feature:nth-child(2)', { autoAlpha: 0, y: 40 })
  .to('.feature:nth-child(2)', { autoAlpha: 0, y: -40 })
  .from('.feature:nth-child(3)', { autoAlpha: 0, y: 40 });
```
:::

Sekce stojí po dobu dvou výšek okna (`end: '+=200%'`) a scroll mezitím přehraje timeline. Zkus přidat `pinSpacing: false`: sekce `.outro` najede přes stojící sekci, protože místo pro přišpendlení nikdo nepřidal.

:::explain
Vysvětli, co udělá `pin: true` se zbytkem stránky a proč to souvisí s `end` a `scrub`.

## --model--
Přišpendlená sekce zůstane stát, zatímco uživatel scrolluje, takže by se pod ní obsah posouval dál a překryl ji. ScrollTrigger ji proto obalí prvkem `pin-spacer` a přidá odsazení přesně o délku mezi `start` a `end`. Stránka se tím prodlouží a obsah pod sekcí přijede, až pin skončí. Ten přidaný scroll je prostor, ve kterém `scrub` přehraje animaci uvnitř sekce: delší `end` znamená víc scrollu a pomalejší animaci.

## --checklist--
- Přišpendlený prvek zůstane stát, zatímco stránka scrolluje.
- ScrollTrigger přidá odsazení (`pin-spacer`) o délku mezi `start` a `end`.
- Obsah pod sekcí se posune dolů a nepřekryje ji.
- Přidaný scroll je prostor, ve kterém `scrub` přehraje animaci.
:::

:::check
Sekce s `pin: true` má `start: 'top top'` a `end: '+=1500'`. O kolik pixelů se prodlouží stránka?

### --expected--
1500

### --accept--
1500 px
1500px
o 1500 px

### --why--
`pin-spacer` přidá odsazení o délku přišpendlení, tedy o vzdálenost mezi `start` a `end`.
:::

## Parallax a Motion `scroll()`

[[parallax|Parallax]] je iluze hloubky: vzdálenější vrstvy se posouvají pomaleji než bližší. Technicky jde o animaci `transform` svázanou s posuvníkem, každá vrstva s jinou vzdáleností.

```js
gsap.utils.toArray('[data-speed]').forEach((layer) => {
  gsap.to(layer, {
    yPercent: -20 * Number(layer.dataset.speed),
    ease: 'none',
    scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  });
});
```

Proč ne ručně v posluchači `scroll` se `style.top`? Změna `top` přepočítá rozvržení v každém snímku, a když v tomtéž posluchači ještě čteš `offsetTop` nebo `getBoundingClientRect()`, prohlížeč musí rozvržení přepočítat znovu a znovu (viz [čtení layoutu v js-dom](see:js-dom/prohlizecova-api#plynule-zmeny-requestanimationframe-a-cteni-layoutu)). ScrollTrigger si rozměry změří předem, při scrollu už jen porovná polohu s uloženými čísly a zapíše `transform`.

Motion má lehčí alternativu: `scroll(callback)` volá funkci s průběhem od 0 do 1 a `scroll(animace, { target })` animaci rovnou řídí.

:::live dom libs=motion
```html
<section class="hero">
  <div class="layer layer--far"></div>
  <div class="layer layer--near"></div>
  <h2>Krkonoše za úsvitu</h2>
</section>
<p class="text">Dvě vrstvy hor se při scrollu posouvají různě rychle. Scrolluj pomalu.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; }
.hero { position: relative; height: 90vh; overflow: hidden; display: grid; place-content: center; background: linear-gradient(#fde68a, #fb923c); }
.hero h2 { position: relative; margin: 0; color: #1c1917; font-size: 2.5rem; }
.layer { position: absolute; inset: auto -10% -20% -10%; height: 70%; }
.layer--far { background: #9a3412; clip-path: polygon(0 60%, 25% 20%, 45% 50%, 70% 10%, 100% 55%, 100% 100%, 0 100%); opacity: 0.6; }
.layer--near { background: #431407; clip-path: polygon(0 80%, 20% 45%, 50% 75%, 80% 35%, 100% 70%, 100% 100%, 0 100%); }
.text { height: 120vh; padding: 1.5rem; font-size: 1.125rem; }
```
```js
import { animate, scroll } from 'motion';

const hero = document.querySelector('.hero');
const options = { target: hero, offset: ['start start', 'end start'] };

scroll(animate('.layer--far', { y: [0, 60] }, { ease: 'linear' }), options);
scroll(animate('.layer--near', { y: [0, 180] }, { ease: 'linear' }), options);
```
:::

`offset: ['start start', 'end start']` znamená „od chvíle, kdy začátek sekce je nahoře v okně, do chvíle, kdy tam je její konec". Zkus prohodit `60` a `180`: vzdálenější hory pojedou rychleji a iluze hloubky se rozpadne.

:::check
Která vrstva parallaxu se má při scrollu posouvat nejpomaleji?

### --answer--
Nejbližší vrstva, protože je největší.

#### --why--
Blízké věci se vůči oku míhají rychle, stejně jako patníky za oknem vlaku.

### --correct--
Nejvzdálenější vrstva, třeba obloha nebo hory v pozadí.

#### --why--
Vzdálené věci se vůči pozorovateli pohybují pomalu. Tenhle rozdíl rychlostí vytváří dojem hloubky.

### --answer--
Všechny stejně, jinak se obraz roztrhne.

#### --why--
Když se všechny vrstvy posouvají stejně, hloubka zmizí a je to obyčejný scroll.
:::

## Rozměry se mění: `refresh()` a `invalidateOnRefresh`

ScrollTrigger si při vytvoření spočítá, na kolika pixelech scrollu leží `start` a `end`. Když se potom změní výška obsahu (načte se obrázek bez `height`, dorazí písmo, rozbalí se akordeon), čísla nesedí a animace startují jinde. Na změnu šířky okna reaguje sám; po změně obsahu zavolej `ScrollTrigger.refresh()`.

Hodnoty, které závisí na rozměrech (třeba jak daleko posunout vodorovný pás), napiš jako **funkci** a přidej `invalidateOnRefresh: true`. Při každém přepočtu se funkce zavolá znovu:

```js
const track = document.querySelector('.colors__track');
const distance = () => track.scrollWidth - window.innerWidth;

gsap.to(track, {
  x: () => -distance(),
  ease: 'none',
  scrollTrigger: { trigger: '.colors', pin: true, scrub: true, end: () => `+=${distance()}`, invalidateOnRefresh: true },
});
```

:::check
Vodorovný pás karet má `x: -(track.scrollWidth - window.innerWidth)` spočítané jednou při načtení. Co se stane po zúžení okna?

### --answer--
Nic, ScrollTrigger po změně šířky přepočítá všechno sám.

#### --why--
Přepočítá `start` a `end`, ale číslo, které jsi spočítal ty, zůstane stejné.

### --correct--
Pás na konci přejede a za poslední kartou zůstane prázdné místo, protože vzdálenost pro nové okno je jiná.

#### --why--
Po zúžení okna je potřeba posunout pás o jinou vzdálenost. Funkce s `invalidateOnRefresh` ji spočítá znovu.

### --answer--
Pás se přestane posouvat úplně.

#### --why--
Posouvat se bude dál, jen o starou, teď už špatnou vzdálenost.
:::

## Lenis: plynulé scrollování

Kolečko myši posouvá stránku skokově po 100 px. [[plynulé scrollování|Plynulé scrollování]] přes knihovnu Lenis zachytí vstup z kolečka a touchpadu a skutečný scroll k cíli **dopočítává** (interpoluje) po malých krocích. Stránka se pak posouvá měkce a animace se `scrub` nescukávají. Nativní posuvník, kotvy, `position: sticky` i čtečky obrazovky přitom fungují dál, protože Lenis hýbe opravdovým scrollem stránky.

```js
import Lenis from 'lenis';

const lenis = new Lenis({ autoRaf: true });   // Lenis si sám běží v requestAnimationFrame
lenis.scrollTo('#parametry', { offset: -80 }); // plynule ke kotvě, 80 px nad ní
```

Se ScrollTriggerem musí Lenis a GSAP běžet v jednom rytmu, jinak ScrollTrigger vidí polohu scrollu o snímek později a pinované sekce poskakují:

```js
const lenis = new Lenis();                         // bez autoRaf
lenis.on('scroll', ScrollTrigger.update);          // každý posun Lenisu hned ohlas ScrollTriggeru
gsap.ticker.add((time) => lenis.raf(time * 1000)); // Lenis tiká v rytmu GSAPu (ms)
gsap.ticker.lagSmoothing(0);                       // žádné vyhlazování zpoždění mezi nimi
```

Posuvné prvky uvnitř stránky (mapa, dlouhý seznam v postranním panelu, modální okno) označ atributem `data-lenis-prevent`, jinak by kolečko nad nimi posouvalo celou stránku.

:::live dom libs=lenis
```html
<nav class="nav"><a href="#baterie">Baterie</a><a href="#zvuk">Zvuk</a><a href="#cena">Cena</a></nav>
<section id="baterie">Baterie: 40 hodin přehrávání</section>
<section id="zvuk">Zvuk: měniče 40 mm a potlačení hluku</section>
<section id="cena">Cena: 5 990 Kč</section>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; }
.nav { position: sticky; top: 0; display: flex; gap: 1rem; padding: 1rem; background: white; box-shadow: 0 1px 0 #e5e7eb; }
section { min-height: 100vh; padding: 2rem 1.5rem; font-size: 1.5rem; font-weight: 700; }
section:nth-of-type(2) { background: #f1f5f9; }
```
```js
import Lenis from 'lenis';

const lenis = new Lenis({ autoRaf: true });

document.querySelector('.nav').addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  lenis.scrollTo(link.getAttribute('href'), { offset: -60, duration: 1.2 });
});
```
:::

Scrolluj kolečkem a pak klikej na odkazy. Zkus `duration: 1.2` změnit na `3` a pak celý `new Lenis(…)` zakomentovat (a místo `lenis.scrollTo` nech výchozí chování odkazu): rozdíl mezi skokovým a plynulým scrollem uvidíš hned.

:::check
Na stránce s Lenisem a pinovanou sekcí sekce při scrollu poskakuje, jako by se o kousek zpožďovala. Co chybí?

### --answer--
`pinSpacing: false`

#### --why--
`pinSpacing` řeší místo pod sekcí, ne rytmus, ve kterém ScrollTrigger čte polohu scrollu.

### --correct--
Napojení Lenisu na ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)` a tikání Lenisu v `gsap.ticker`.

#### --why--
Bez napojení ScrollTrigger vidí polohu scrollu, kterou Lenis mezitím změnil, o snímek později.

### --answer--
`scrub: true` místo `scrub: 1`

#### --why--
Poskakování nezpůsobuje dojíždění animace, ale to, že dvě knihovny počítají scroll každá ve svém rytmu.
:::

## Kdy scroll efekt škodí

- **[[scrolljacking|Scrolljacking]]** — stránka přebere kontrolu: kolečko najednou posouvá do strany, jedno otočení přeskočí celou sekci, scroll zpomalí na polovinu. Uživatel ztratí pocit, že stránku ovládá on. Pin a `snap` používej střídmě a nikdy nenuť člověka čekat, až animace doběhne.
- **Obsah schovaný bez JavaScriptu** — `opacity: 0` v CSS, které odstraní až skript. Když skript spadne nebo se nenačte, stránka je prázdná.
- **Dlouhý text** — článek, dokumentace, obchodní podmínky. Odhalování každého odstavce čtení jen zdržuje.
- **Omezený pohyb** — parallax, pin a velké posuny jsou pro lidi s poruchou rovnováhy nejhorší. Podrobně v lekci o výkonu a přístupnosti.
- **Lenis tam, kde se hodně čte** — plynulé scrollování je příjemné na prezentaci produktu, na zpravodajském webu ho lidé vnímají jako zpožďování.

:::check
Na e-shopu s oblečením chce klient, aby každá karta produktu v mřížce (60 produktů) při scrollu vyjela zespodu s pinovanou sekcí na začátku kategorie. Co mu doporučíš?

### --answer--
Všechno přesně podle zadání, efekty dělají web moderní.

#### --why--
U mřížky, kde člověk rychle prochází a porovnává zboží, efekty jen zdržují a zatěžují telefon.

### --correct--
Nanejvýš jemné jednorázové odhalení bez pinu, s variantou bez pohybu pro omezený pohyb.

#### --why--
V mřížce produktů se hledá a porovnává. Pin by zákazníka zastavil a 60 animací na scroll by zatížilo slabší telefony.

### --answer--
Lenis se `snap` na každou řadu produktů.

#### --why--
Přitahování scrollu k řadám je typický scrolljacking: zákazník nemůže plynule projíždět katalog.
:::

## Typické chyby a pasti

> [!PITFALL] Animace startují jinde, než mají
> *Příznak:* markery `start` a `end` jsou posunuté oproti prvku a animace se spouští moc brzo, typicky pod obrázky bez rozměrů.
>
> *Oprava:* obrázkům dej `width` a `height` (nebo `aspect-ratio`) a po změně obsahu zavolej `ScrollTrigger.refresh()`.

> [!PITFALL] `scrub` a `toggleActions` zároveň
> *Příznak:* `toggleActions: 'play none none reverse'` nic nedělá a animace se chová jinak, než čekáš.
>
> *Oprava:* se `scrub` se `toggleActions` nepoužijí, animaci řídí poloha scrollu. Vyber jedno.

> [!PITFALL] Chybí registrace pluginu
> *Příznak:* animace proběhne hned po načtení a konzole hlásí `Invalid property scrollTrigger set to { … } Missing plugin? gsap.registerPlugin()`.
>
> *Oprava:* `gsap.registerPlugin(ScrollTrigger)` po importu.

> [!PITFALL] Kolečko nad mapou posouvá celou stránku
> *Příznak:* s Lenisem nejde scrollovat v posuvném panelu, mapě ani v modálním okně.
>
> *Oprava:* posuvnému prvku přidej atribut `data-lenis-prevent`.

> [!PITFALL] Zapomenuté `markers: true`
> *Příznak:* na ostrém webu jsou u sekcí zelené a červené čáry s popisky `start` a `end`.
>
> *Oprava:* markery zapínej jen při ladění, třeba `markers: import.meta.env.DEV` ve Vite.

:::check
Pinovaná sekce má pod sebou tři obrázky bez `width` a `height`. Po načtení obrázků začne pin o 600 px dřív, než by měl. Napiš volání, které po načtení obrázků přepočítá všechny ScrollTriggery.

### --expected--
ScrollTrigger.refresh()

### --why--
`refresh()` znovu změří pozice všech triggerů. Lepší je ale obrázkům rozměry dát, pak se nic neposune.
:::

Ve workshopu z toho postavíš produktovou stránku sluchátek: Lenis s kotvami, pinovanou sekci s funkcemi, parallax fotek, počítadla parametrů a vodorovný pás barevných variant.

## Kde to najdeš v MDN

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — na čem stojí `inView` a jednorázová odhalení.
- [CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) — `scroll()`, `view()` a `animation-range`.
- [Window.requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — rytmus snímků, ve kterém ScrollTrigger i Lenis počítají.
- Mimo MDN: [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — všechny volby včetně `pin`, `snap` a `invalidateOnRefresh`.

# --questions--

## --question--

Napiš hodnotu `end`, se kterou animace skončí, až dolní okraj prvku odjede nad horní okraj okna.

### --expected--
bottom top

### --accept--
'bottom top'
"bottom top"
bottom 0%
bottom 0

### --why--
První slovo je místo na prvku (`bottom`), druhé místo v okně (`top`). Animace skončí, když se potkají.

### --see--
css-efekty-animace/scroll-efekty#scrolltrigger-trigger-start-a-end

## --question--

Proč se u animace se `scrub` píše `ease: 'none'`?

### --answer--
Protože se `scrub` křivky nefungují a GSAP by hlásil chybu.

#### --why--
Křivka fungovat bude, jen výsledek bude působit divně. Chybu GSAP nehlásí.

### --correct--
Protože rychlost už určuje člověk tím, jak scrolluje; křivka navíc by pohyb vůči posuvníku zkreslila.

#### --why--
Se `scrub` odpovídá průběh poloze posuvníku. S `ease: 'none'` se prvek pohne přesně úměrně scrollu.

### --answer--
Protože `ease: 'none'` zrychlí výpočet ScrollTriggeru.

#### --why--
Na výkon nemá křivka měřitelný vliv. Jde o to, jak pohyb působí.

### --see--
css-efekty-animace/scroll-efekty#scrub-animace-prilepena-k-posuvniku

## --question--

Napiš atribut, kterým u stránky s Lenisem označíš posuvný seznam v postranním panelu, aby se v něm dalo scrollovat kolečkem.

### --expected--
data-lenis-prevent

### --why--
Lenis zachytává kolečko pro celou stránku. Prvky s `data-lenis-prevent` nechá scrollovat nativně.

### --see--
css-efekty-animace/scroll-efekty#lenis-plynule-scrollovani
