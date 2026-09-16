# Kdy knihovna a základy GSAP

Úvodní obrazovka, kde nejdřív sjede menu, pak se po řádcích odhalí nadpis a nakonec naskočí tlačítko. Panel, který jde zavřít uprostřed otevírání a plynule se vrátí. Číslo, které při scrollu naběhne z nuly na 40 hodin výdrže. Tohle jsou efekty z webů, které vypadají draze, a na většinu z nich samotné CSS nestačí.

Než začneš, tipni si.

:::check pretest
Animuješ vyjíždějící menu jednou přes `left` (z `-300px` na `0`) a jednou přes `transform: translateX()`. Na slabém telefonu se jedna varianta trhá. Která a proč?

### --answer--
`transform`, protože se musí převádět na pixely.

#### --why--
Převod jednotek je zanedbatelný. Rozhoduje, kolik práce prohlížeč udělá v každém snímku.

### --correct--
`left`, protože v každém snímku přepočítá rozvržení stránky; `transform` jen posune hotovou vrstvu.

#### --why--
Přesně tak. K cestě k pixelům se ještě vrátíme, teď stačí vědět, že `transform` a `opacity` jsou levné.

### --answer--
Obě stejně, trhání způsobí jen délka animace.

#### --why--
Délka ovlivní, jak rychle se prvek pohne, ne kolik stojí jeden snímek.
:::

:::check pretest
Chceš, aby se tři prvky objevily po sobě. Napíšeš jim `delay: 0`, `delay: 0.4` a `delay: 0.8`. Pak první animaci prodloužíš o půl sekundy. Co se stane?

### --answer--
Ostatní animace se automaticky posunou.

#### --why--
Zpoždění jsou pevná čísla od startu. O délce ostatních animací nic nevědí.

### --correct--
Druhý prvek začne dřív, než první skončí, a musíš ručně přepočítat obě další zpoždění.

#### --why--
Proto se sekvence skládají do časové osy, která počítá začátky sama. Uvidíš za chvíli.
:::

## Problém: animace, které CSS nezvládne

Přechody a `@keyframes` z [css-animace](see:css-animace/keyframes#keyframes-a-vlastnost-animation) pokryjí hover, fokus, načítací kolečko i objevení popoveru. Narazíš, když potřebuješ:

- **sekvenci závislou na sobě** — nadpis, pak podnadpis, pak tlačítko, a když změníš délku jednoho kroku, ostatní se posunou samy,
- **přerušení a návrat z libovolného místa** — panel se zavírá uprostřed otevírání,
- **animaci hodnoty mimo CSS** — číslo v textu, pozici scrollu, hodnotu v canvasu,
- **řízení scrollem se zastavením sekce** — sekce drží na místě, zatímco se v ní střídá obsah.

V ukázce se panel otevírá a zavírá stejným tlačítkem. Klikni dvakrát rychle za sebou a sleduj, co udělá panel uprostřed pohybu.

:::compare
```html
<button class="toggle" type="button">Nákupní košík</button>
<aside class="panel">
  <h2>Košík</h2>
  <p>Sluchátka Ozvěna · 5 990 Kč</p>
  <p>Pouzdro · 490 Kč</p>
</aside>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; min-height: 14rem; overflow: hidden; background: #f8fafc; }
.toggle { margin: 1rem; padding: 0.6rem 1.1rem; border: 0; border-radius: 999px; background: #0f172a; color: white; font: inherit; }
.panel {
  position: absolute;
  inset: 0 0 0 auto;
  width: 14rem;
  padding: 1rem 1.25rem;
  background: white;
  box-shadow: -12px 0 32px rgb(15 23 42 / 0.15);
  translate: 100% 0;
}
.panel h2 { margin: 0 0 0.5rem; }
```
--variant-- CSS @keyframes
```css
.panel.is-open { animation: slide-in 1.2s ease-out forwards; }
.panel.is-closing { animation: slide-out 1.2s ease-in forwards; }
@keyframes slide-in { from { translate: 100% 0; } to { translate: 0 0; } }
@keyframes slide-out { from { translate: 0 0; } to { translate: 100% 0; } }
```
```js
const panel = document.querySelector('.panel');
let open = false;
document.querySelector('.toggle').addEventListener('click', () => {
  open = !open;
  panel.classList.toggle('is-open', open);
  panel.classList.toggle('is-closing', !open);
});
```
--variant-- gsap.to
```js
import gsap from 'gsap';

const panel = document.querySelector('.panel');
let open = false;
document.querySelector('.toggle').addEventListener('click', () => {
  open = !open;
  gsap.to(panel, { xPercent: open ? -100 : 0, duration: 1.2, ease: 'power2.out' });
});
```
:::

Varianta s `@keyframes` při druhém kliknutí skočí na začátek zavírací animace, tedy na úplně otevřený panel, a teprve odtud jede zpátky. GSAP vezme **aktuální** polohu a pokračuje z ní. Zkus v GSAP variantě změnit `duration` na `0.3` a klikat rychle za sebou: panel se nikdy neteleportuje.

> [!REMEMBER]
> **Knihovna se vyplatí, když animace závisí na jiné animaci, na přerušení, na hodnotě mimo CSS nebo na scrollu.** Jednoduchý stav (hover, fokus, otevřeno a zavřeno) patří dál do CSS.

:::check
Která z těchto animací je důvod sáhnout po knihovně, a ne po CSS?

### --answer--
Tlačítko při najetí myší ztmavne a mírně se zvětší.

#### --why--
Hover je změna mezi dvěma stavy. Přechod v CSS ji zvládne a při odjetí se sám vrátí.

### --correct--
Počítadlo „40 h výdrže", které při doscrollování naběhne od nuly, a teprve po něm se objeví popisek.

#### --why--
Číslo v textu není vlastnost CSS a popisek čeká na konec počítadla. To je hodnota mimo CSS i sekvence zároveň.

### --answer--
Načítací kolečko, které se točí pořád dokola.

#### --why--
Nekonečná rotace je klasický `@keyframes` s `animation-iteration-count: infinite`.
:::

## Web Animations API: most mezi CSS a knihovnou

Než přidáš knihovnu, znej, co umí prohlížeč z JavaScriptu sám. [[Web Animations API]] (WAAPI) je stejný engine, na kterém běží CSS animace, jen ho ovládáš voláním `element.animate(snímky, nastavení)`:

:::live dom
```html
<div class="toast" role="status">Vstupenka přidána do košíku</div>
<button class="add" type="button">Přidat vstupenku · 1 290 Kč</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.add { padding: 0.6rem 1.1rem; border: 0; border-radius: 999px; background: #7c3aed; color: white; font: inherit; }
.toast { width: fit-content; margin-bottom: 1rem; padding: 0.75rem 1rem; border-radius: 0.75rem; background: #0f172a; color: white; opacity: 0; }
```
```js
const toast = document.querySelector('.toast');

document.querySelector('.add').addEventListener('click', async () => {
  const show = toast.animate(
    [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
    { duration: 250, easing: 'ease-out', fill: 'forwards' },
  );
  await show.finished;
  await toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, delay: 1500, fill: 'forwards' }).finished;
});
```
:::

`animate` vrátí objekt `Animation` s metodami `pause()`, `reverse()`, `cancel()` a s promisem `finished`. Díky `await animation.finished` napíšeš jednoduchou sekvenci bez počítání zpoždění. Zkus změnit `delay: 1500` na `300` a sleduj, jak krátce toast zůstane.

WAAPI je dobrá volba pro jednu až dvě animace v JavaScriptu bez závislostí. Chybí mu ale časová osa s pozicemi, `stagger` pro skupinu prvků, řízení scrollem se zastavením sekce a animace čehokoli, co není CSS vlastnost.

:::check
Proč se ve WAAPI čeká na `animation.finished`, a ne na `setTimeout` se stejnou délkou?

### --answer--
Protože `setTimeout` v prohlížeči nefunguje uvnitř `async` funkcí.

#### --why--
`setTimeout` funguje všude. Problém je, že neví nic o animaci.

### --correct--
Protože promise se splní, až animace opravdu skončí, i když ji někdo zpomalí, pozastaví nebo změní její délku.

#### --why--
Časovač odpočítá pevný čas. Promise `finished` sleduje skutečnou animaci.

### --answer--
Protože `finished` spustí animaci rychleji.

#### --why--
`finished` je jen promise, na rychlost animace nemá vliv.
:::

## CSS, WAAPI, GSAP, nebo Motion

| | CSS (přechody, `@keyframes`) | WAAPI | GSAP | Motion |
|---|---|---|---|---|
| velikost (gzip) | 0 kB | 0 kB, je v prohlížeči | jádro ~25 kB, pluginy navíc | od ~2,5 kB, podle použitých funkcí |
| zápis | styly a třídy | `element.animate()` | `gsap.to()`, timeline | `animate()`, `inView()`, `scroll()` |
| sekvence | ručně přes `delay` | `await finished` | timeline s pozicemi a štítky | pole animací, `stagger` |
| scroll | `animation-timeline` | `ScrollTimeline` | ScrollTrigger se `scrub` a `pin` | `scroll()`, `inView()` |
| React | třídy | ref a efekt | `useGSAP` | `motion/react` s gesty a layoutem |
| typicky na | hover, fokus, stavy | drobná animace z JS | intro, scroll příběh, text, přeskupení | jednoduché odhalení a pružiny |

Od roku 2025 je GSAP zdarma včetně pluginů SplitText, Flip a ScrollTrigger, takže licence výběr neomezuje. Rozhoduje, **co animace potřebuje**: stav → CSS, jedna animace z JS → WAAPI, lehké odhalení a pružina → Motion, složená sekvence nebo scroll příběh → GSAP.

> [!NOTE]
> Motion v Reactu (`motion/react`) přijde v sekci `react-ui-knihovny`. Tady ho uvidíš jen jako funkce pro obyčejný JavaScript.

:::check
Na stránce kavárny chceš, aby se karty s menu jemně objevily, když k nim uživatel doscrolluje. Nic dalšího se na stránce nehýbe. Co vybereš a proč?

### --answer--
GSAP se ScrollTriggerem, protože jde o scroll.

#### --why--
Zvládne to, ale táhneš kvůli jednomu odhalení desítky kilobajtů. ScrollTrigger se vyplatí, když potřebuješ `scrub` nebo `pin`.

### --correct--
CSS `animation-timeline: view()` jako vylepšení, nebo Motion `inView`, protože jde o jednoduché jednorázové odhalení.

#### --why--
Jednoduchý efekt, malá cena. Obě cesty podrobně rozebere lekce o scroll efektech.

### --answer--
WAAPI, protože umí `await finished`.

#### --why--
WAAPI samo nepozná, kdy je prvek v okně. Musel bys přidat `IntersectionObserver` a všechno spojit ručně.
:::

## `gsap.to`, `from`, `fromTo` a `set`

Základní stavební kámen GSAPu je [[tween]]: animace jedné sady prvků z jedněch hodnot do druhých.

```js
import gsap from 'gsap';

gsap.to('.badge', { x: 120, rotation: 10, duration: 0.6 });     // z aktuálního stavu DO hodnot
gsap.from('.title', { autoAlpha: 0, y: 40 });                    // Z hodnot do aktuálního stavu
gsap.fromTo('.bar', { scaleX: 0 }, { scaleX: 1, duration: 1 });  // z prvních do druhých
gsap.set('.dot', { scale: 0.5 });                                // okamžitě, bez animace
```

První argument je selektor, prvek nebo pole prvků. GSAP má pro `transform` vlastní zkratky, které se skládají nezávisle na sobě: `x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation`. [[autoAlpha]] je `opacity`, která na nule přidá i `visibility: hidden`, takže neviditelný prvek nejde omylem kliknout ani nafokusovat.

:::live dom libs=gsap
```html
<div class="stage">
  <span class="chip chip--to">to</span>
  <span class="chip chip--from">from</span>
  <span class="chip chip--fromto">fromTo</span>
  <span class="chip chip--set">set</span>
</div>
<button class="replay" type="button">Přehrát znovu</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.stage { display: grid; gap: 0.75rem; justify-items: start; margin-bottom: 1rem; }
.chip { display: inline-block; padding: 0.4rem 0.9rem; border-radius: 999px; background: #ede9fe; color: #4c1d95; font-weight: 600; }
.replay { padding: 0.5rem 1rem; border: 1px solid #c4b5fd; border-radius: 999px; background: white; font: inherit; }
```
```js
import gsap from 'gsap';

function play() {
  gsap.to('.chip--to', { x: 160, duration: 0.8 });
  gsap.from('.chip--from', { autoAlpha: 0, y: 30, duration: 0.8 });
  gsap.fromTo('.chip--fromto', { scale: 0.4 }, { scale: 1.3, duration: 0.8 });
  gsap.set('.chip--set', { rotation: -8 });
}

play();
document.querySelector('.replay').addEventListener('click', () => {
  gsap.set('.chip', { clearProps: 'all' });
  play();
});
```
:::

Zkus nahradit `x: 160` za `left: 160` a přidat čipu `position: relative`: vypadá to stejně, jenže každý snímek teď přepočítává rozvržení. `x` animuje `transform`, a to je levné.

Teď předpověď. Nadpis má v CSS `opacity: 0`, aby před animací neproblikl, a skript ho má odhalit.

:::live dom libs=gsap predict
```html
<h1 class="title">Vltavská vlna 2027</h1>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.title { opacity: 0; }
```
```js
import gsap from 'gsap';

gsap.from('.title', { opacity: 0, y: 30, duration: 0.8 });
```
--question-- Co uvidíš po skončení animace?
--option-- Nadpis vyjede zdola a plně se ukáže.
--option*-- Nadpis vyjede zdola, ale zůstane neviditelný.
--option-- Nadpis blikne a hned zmizí.
--why-- `from` animuje **z** hodnot v objektu **do aktuálního stavu**. Aktuální `opacity` je díky CSS `0`, takže animace jede z nuly do nuly. Oprav to buď `gsap.to('.title', { opacity: 1 })`, nebo `fromTo`, nebo skrytím přes `visibility: hidden` a animací `autoAlpha` (ta na konci nastaví `visibility` zpátky).
:::

:::check
Napiš volání GSAPu, které prvek `.price` okamžitě (bez animace) posune o 20 px nahoru. Použij zkratku pro `transform`.

### --expected--
gsap.set('.price', { y: -20 })

### --accept--
gsap.set(".price", { y: -20 })
gsap.set('.price', {y: -20})
gsap.to('.price', { y: -20, duration: 0 })

### --why--
`set` je tween s nulovou délkou. `y: -20` znamená posun o 20 px nahoru přes `transform`, bez přepočtu rozvržení.
:::

## Délka a easing

`duration` je délka v sekundách (výchozí `0.5`). `ease` určuje, jak se pohyb v čase zrychluje. GSAP má pojmenované křivky ve tvaru `jméno.směr`:

- `power1` až `power4` — od jemné po výraznou; `.out` zpomaluje na konci (výchozí je `power1.out`),
- `back.out(1.7)` — přejede cíl a vrátí se, hodí se na tlačítka a odznaky,
- `expo.out` — prudký start a dlouhé dojetí, typické pro odhalení nadpisů,
- `elastic.out(1, 0.4)` — pružinové kmitání, střídmě,
- `sine.inOut` — klidné vlnění pro nekonečné smyčky,
- `none` — konstantní rychlost, hlavně pro animace řízené scrollem.

Vlastní křivku z bodů umí plugin CustomEase; na běžný web vystačíš s vestavěnými.

:::live dom libs=gsap
```html
<div class="track"><span class="ball"></span></div>
<button class="run" type="button">Spustit</button>
```
```css
:root {
  --tween-ease: var(--ease);
  --tween-duration: var(--duration);
}
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.track { position: relative; height: 3rem; margin-bottom: 1rem; border-radius: 999px; background: #f1f5f9; }
.ball { position: absolute; top: 0.5rem; left: 0.5rem; width: 2rem; height: 2rem; border-radius: 50%; background: #f97316; }
.run { padding: 0.5rem 1rem; border: 0; border-radius: 999px; background: #0f172a; color: white; font: inherit; }
```
```js
import gsap from 'gsap';

const ball = document.querySelector('.ball');
const track = document.querySelector('.track');

document.querySelector('.run').addEventListener('click', () => {
  const styles = getComputedStyle(document.documentElement);
  const ease = styles.getPropertyValue('--tween-ease').trim();
  const duration = parseFloat(styles.getPropertyValue('--tween-duration'));
  const distance = track.clientWidth - ball.offsetWidth - 16;
  gsap.fromTo(ball, { x: 0 }, { x: distance, ease, duration });
});
```
```controls
--ease: select(none, power2.out, power4.out, "back.out(1.7)", expo.out, "elastic.out(1, 0.4)", sine.inOut) = power2.out | Easing
--duration: range(0.15, 2, 0.05) = 0.6 | Délka (s)
```
:::

Zkus stejný pohyb s `none` a s `expo.out` při délce 0,6 s: lineární působí mechanicky, `expo.out` rychle a přitom měkce. Pak nastav `elastic.out` na 2 s a představ si ho na každém tlačítku webu.

Délky, které fungují: **mikrointerakce 150–400 ms** (hover, stisk, přepínač), přesun panelu 300–500 ms. U úvodní animace stránky ať je nadpis čitelný do ~1 s a celé intro doběhne zhruba do 2,5 s; delší intro zdržuje člověka, který přišel něco udělat, a mělo by jít přeskočit.

:::check
Tlačítko „Do košíku" má po kliknutí krátce povyrůst a vrátit se. Která kombinace sedí nejlíp?

### --answer--
`duration: 1.5, ease: 'elastic.out(1, 0.3)'`

#### --why--
Půldruhé sekundy kmitání u tlačítka, na které se kliká často, zdržuje a po třetím kliknutí obtěžuje.

### --correct--
`duration: 0.25, ease: 'back.out(1.7)'`

#### --why--
Mikrointerakce patří do 150–400 ms a mírný přejezd dá kliknutí hmatatelnou odezvu.

### --answer--
`duration: 0.25, ease: 'none'`

#### --why--
Délka je dobrá, ale konstantní rychlost působí u tlačítka strojově. `none` se hodí hlavně k animacím řízeným scrollem.
:::

## `stagger`: vlna místo pochodu

Když tween dostane víc prvků, `stagger` je rozestaví v čase: `stagger: 0.08` znamená, že každý další začne o 80 ms později. Objekt dá víc kontroly:

```js
gsap.from('.logo', {
  autoAlpha: 0,
  y: 20,
  stagger: { each: 0.06, from: 'center' },   // od středu k okrajům
});
```

`from` může být `'start'`, `'end'`, `'center'`, `'edges'`, `'random'` nebo index prvku. Místo `each` (rozestup mezi dvěma) jde napsat `amount` (celkový čas pro všechny), což se hodí, když počet prvků předem neznáš.

:::live dom libs=gsap
```html
<ul class="partners">
  <li>Pivovar Lanžhot</li><li>Rádio Vlna</li><li>Limonáda Bublina</li><li>Kavárna Na Rohu</li><li>Cykloservis Kolo</li><li>Tiskárna Morava</li><li>Knihkupectví Zlatý list</li>
</ul>
<button class="replay" type="button">Přehrát znovu</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.partners { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0; list-style: none; }
.partners li { padding: 0.5rem 0.9rem; border-radius: 0.5rem; background: #ecfeff; color: #155e75; font-weight: 600; }
.replay { margin-top: 1rem; padding: 0.5rem 1rem; border: 1px solid #a5f3fc; border-radius: 999px; background: white; font: inherit; }
```
```js
import gsap from 'gsap';

function play() {
  gsap.from('.partners li', {
    autoAlpha: 0,
    y: 24,
    duration: 0.5,
    ease: 'power2.out',
    stagger: { each: 0.08, from: 'center' },
  });
}

play();
document.querySelector('.replay').addEventListener('click', play);
```
:::

Zkus `from: 'edges'`, `from: 'random'` a pak místo `each: 0.08` napiš `amount: 0.3`. S `amount` trvá rozestup všech sedmi položek dohromady 0,3 s.

:::check
Seznam má 10 položek a `stagger: { each: 0.1 }`, každý tween trvá 0,5 s. Za kolik sekund od začátku doběhne poslední položka?

### --expected--
1.4

### --accept--
1,4
1.4 s
1,4 s

### --why--
Desátá položka začne o 9 × 0,1 = 0,9 s později a trvá 0,5 s: 0,9 + 0,5 = 1,4 s.
:::

## Timeline: sekvence bez počítání `delay`

[[timeline|Timeline]] (časová osa) je kontejner na tweeny. Každý přidaný tween se bez dalšího nastavení zařadí **na konec** předchozího. Třetí argument je [[pozice v timeline]]:

```js
const intro = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out' } });

intro
  .from('.logo', { autoAlpha: 0, y: -20 })            // 0 s
  .from('.menu a', { autoAlpha: 0, stagger: 0.05 })   // po konci předchozího
  .from('.claim', { autoAlpha: 0, y: 30 }, '-=0.3')   // 0,3 s před koncem předchozího
  .from('.cta', { scale: 0.8 }, '<')                  // ve stejné chvíli jako začal předchozí
  .addLabel('photos', '+=0.2')                        // štítek 0,2 s po konci
  .from('.photo', { autoAlpha: 0 }, 'photos');        // na štítku
```

| pozice | znamená |
|---|---|
| (nic) | na konec timeline |
| `'+=0.5'` / `'-=0.3'` | 0,5 s po konci / 0,3 s před koncem timeline |
| `'<'` | se začátkem předchozího tweenu |
| `'>'` | s koncem předchozího tweenu |
| `'<0.2'` | 0,2 s po začátku předchozího |
| `1.5` | přesně v 1,5 s od začátku timeline |
| `'photos'` | na štítku |

`defaults` nastaví hodnoty všem tweenům v timeline, takže je neopakuješ. Tween si je může přepsat vlastní hodnotou.

:::live dom libs=gsap predict
```html
<div class="lane"><span class="dot dot--a">A</span></div>
<div class="lane"><span class="dot dot--b">B</span></div>
<div class="lane"><span class="dot dot--c">C</span></div>
<p class="starts"></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.lane { height: 2.5rem; margin-bottom: 0.5rem; border-radius: 999px; background: #f1f5f9; }
.dot { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #2563eb; color: white; font-weight: 700; }
.starts { font-variant-numeric: tabular-nums; }
```
```js
import gsap from 'gsap';

const tl = gsap.timeline({ defaults: { duration: 1, x: 220 } });
tl.to('.dot--a', {})
  .to('.dot--b', {}, '-=0.5')
  .to('.dot--c', {}, '<0.1');

document.querySelector('.starts').textContent = 'Začátky: ' + tl.getChildren()
  .map((tween) => `${tween.targets()[0].textContent} ${tween.startTime()} s`)
  .join(', ');
```
--question-- V kolik sekund od začátku timeline se rozjede kulička C?
--option*-- V 0,6 s.
--option-- V 1,6 s.
--option-- V 2,1 s.
--why-- A běží od 0 do 1 s. B má `'-=0.5'`, tedy 0,5 s před koncem timeline: začne v 0,5 s. `'<0.1'` se měří od **začátku předchozího tweenu** (B), ne od jeho konce: 0,5 + 0,1 = 0,6 s. Na 1,6 s bys dostal s `'>0.1'`.
:::

:::explain
Vysvětli, proč se sekvence animací skládá do timeline, a ne do řady tweenů s ručně spočítaným `delay`.

## --model--
Zpoždění jsou pevná čísla od startu, takže když změním délku jednoho kroku, musím přepočítat všechny další. Timeline řadí tweeny za sebe sama a pozice jako `'-=0.3'` nebo `'<'` se měří od sousedů, takže změna jedné délky posune zbytek automaticky. Celou sekvenci pak navíc ovládám jako jeden objekt: pozastavím ji, vrátím, přeskočím na konec nebo zrychlím.

## --checklist--
- `delay` je pevné číslo od startu, o ostatních animacích neví.
- Timeline počítá začátky podle sousedních tweenů.
- Změna délky jednoho kroku posune následující kroky sama.
- Celá sekvence jde ovládat jako jeden objekt (pauza, návrat, skok na konec).
:::

:::check
Timeline je prázdná. Přidáš tween `.to('.a', { x: 100, duration: 2 })` a za něj `.to('.b', { x: 100, duration: 1 }, '>-0.5')`. V kolik sekund začne tween prvku `.b`?

### --expected--
1.5

### --accept--
1,5
1.5 s
1,5 s

### --why--
`'>'` je konec předchozího tweenu (2 s) a `-0.5` od něj odečte půl sekundy.
:::

## Text po řádcích: SplitText

Odhalení nadpisu po řádcích nebo slovech potřebuje, aby každý kus textu byl vlastní prvek. Ručně obalovat slova do `<span>` nejde: kde se řádek zlomí, záleží na šířce okna. Plugin `SplitText` text rozdělí podle toho, jak ho prohlížeč právě vykreslil.

```js
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const split = SplitText.create('.headline', {
  type: 'lines, words',   // co rozdělit: 'chars', 'words', 'lines' nebo kombinace
  mask: 'lines',          // každý řádek obalí prvkem s overflow: clip
});
gsap.from(split.lines, { yPercent: 100, stagger: 0.1, ease: 'expo.out' });
```

`split.lines`, `split.words` a `split.chars` jsou pole prvků. S `mask` stačí řádek posunout o 100 % jeho výšky a obal ho schová; výsledek vypadá, jako by text vyjel ze štěrbiny. SplitText zároveň nadpisu nastaví `aria-label` s celým textem a kousky skryje přes `aria-hidden`, takže čtečka nepřečte text po písmenech.

Po změně šířky okna se text zalomí jinak a staré řádky nesedí. `autoSplit: true` text po změně rozdělí znovu. Animaci pak piš do `onSplit(self)` a vrať ji: SplitText ji po novém rozdělení vytvoří pro nové řádky a posune ji na místo, kde byla stará.

:::live dom libs=gsap
```html
<h2 class="headline">Léto na Císařské louce začíná v pátek v šest večer</h2>
<button class="replay" type="button">Přehrát znovu</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #0b1026; color: #f8f5f0; }
.headline { max-width: 20ch; margin: 0 0 1.5rem; font-size: 2.25rem; line-height: 1.1; }
.replay { padding: 0.5rem 1rem; border: 1px solid #ff6b4a; border-radius: 999px; background: transparent; color: inherit; font: inherit; }
```
```js
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

let reveal;
SplitText.create('.headline', {
  type: 'lines, words',
  mask: 'lines',
  autoSplit: true,
  onSplit(self) {
    reveal = gsap.from(self.lines, { yPercent: 100, duration: 0.9, ease: 'expo.out', stagger: 0.12 });
    return reveal;
  },
});

document.querySelector('.replay').addEventListener('click', () => reveal.restart());
```
:::

Zkus smazat `mask: 'lines'` a přehrát znovu: řádky vyjíždějí přes text pod sebou, protože je nic neořízne. Pak změň `type` na `'chars'`, v `onSplit` animuj `self.chars` se `stagger: 0.02` a sleduj, jak dlouho trvá nadpis po písmenech.

:::check
Nadpis rozdělený přes `SplitText.create('.headline', { type: 'lines' })` se na mobilu po otočení displeje zalomí jinak a řádky se ořezávají. Co přidáš do objektu nastavení?

### --answer--
`mask: 'lines'`

#### --why--
Maska řádky ořezává. Problém je, že rozdělení odpovídá staré šířce.

### --correct--
`autoSplit: true` a animaci přesunutou do `onSplit`, která ji vrátí.

#### --why--
`autoSplit` text po změně šířky rozdělí znovu a `onSplit` vytvoří animaci pro nové řádky.

### --answer--
`type: 'lines, words'`

#### --why--
Rozdělení na slova nic nezmění na tom, že řádky vznikly podle staré šířky.
:::

## Ovládání: `play`, `pause`, `reverse`, `progress` a `timeScale`

Tween i timeline vrací objekt, který jde řídit. To CSS animace neumí tak snadno:

:::live dom libs=gsap
```html
<div class="ticket">
  <p class="ticket__label">Třídenní vstupenka</p>
  <p class="ticket__price">2 490 Kč</p>
</div>
<div class="controls">
  <button type="button" data-action="play">play</button>
  <button type="button" data-action="pause">pause</button>
  <button type="button" data-action="reverse">reverse</button>
  <button type="button" data-action="end">progress(1)</button>
  <button type="button" data-action="slow">timeScale(0.25)</button>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
.ticket { width: 14rem; padding: 1rem 1.25rem; border-radius: 1rem; background: linear-gradient(135deg, #7c3aed, #db2777); color: white; }
.ticket p { margin: 0; }
.ticket__price { font-size: 1.75rem; font-weight: 800; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
.controls button { padding: 0.4rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: white; font: 0.875rem ui-monospace, monospace; }
```
```js
import gsap from 'gsap';

const tl = gsap.timeline({ paused: true, defaults: { duration: 0.8, ease: 'power3.out' } });
tl.from('.ticket', { autoAlpha: 0, rotation: -6, y: 40 })
  .from('.ticket__label', { autoAlpha: 0, x: -20 }, '-=0.4')
  .from('.ticket__price', { autoAlpha: 0, scale: 0.6, ease: 'back.out(2)' }, '<0.1');

const actions = {
  play: () => tl.timeScale(1).play(),
  pause: () => tl.pause(),
  reverse: () => tl.reverse(),
  end: () => tl.progress(1),
  slow: () => tl.timeScale(0.25),
};

document.querySelector('.controls').addEventListener('click', (event) => {
  const action = event.target.closest('button')?.dataset.action;
  actions[action]?.();
});
```
:::

Spusť `play`, uprostřed dej `reverse` a pak `timeScale(0.25)`. Timeline jede pozpátku čtvrtinovou rychlostí z místa, kde byla. `progress(1)` skočí na konec a vykreslí koncový stav, což se hodí i v testech a pro lidi, kteří animace nechtějí.

:::check
Timeline trvá 2 s a právě je v polovině. Co udělá `tl.reverse()`?

### --answer--
Skočí na začátek a přehraje se od konce do začátku celá, 2 s.

#### --why--
`reverse` nikam neskáče. Obrátí směr přehrávání z aktuálního místa.

### --correct--
Obrátí směr z aktuálního místa a za 1 s je zpátky na začátku.

#### --why--
Z poloviny do začátku zbývá 1 s. Tohle je přesně přerušení, které `@keyframes` neumí.

### --answer--
Nic, `reverse` funguje až po skončení timeline.

#### --why--
`reverse` jde zavolat kdykoli během přehrávání i po něm.
:::

## Úklid: `gsap.context()` a `revert()`

Animace mění inline styly prvků a ScrollTrigger přidává obaly a posluchače. Když stránku nebo komponentu přestavuješ (přepnutí záložky v aplikaci, znovu vykreslený seznam, přechod na jiný breakpoint), staré animace musí pryč, jinak se budou prát s novými. **`revert()` animaci zastaví a vrátí prvkům styly, jaké měly před ní.**

```js
const ctx = gsap.context(() => {
  gsap.from('.hero__title', { autoAlpha: 0, y: 40 });
  gsap.to('.hero__shape', { rotation: 360, repeat: -1, duration: 12, ease: 'none' });
});

// později, třeba před přestavěním sekce
ctx.revert();   // obě animace zastaví a vrátí inline styly
```

`gsap.context` zaznamená všechno, co vznikne uvnitř funkce, a jedním `revert()` to uklidí. Stejně funguje `gsap.matchMedia()`, které animace navíc samo spouští a uklízí podle media dotazů. Uvidíš ho ve workshopu. `tween.kill()` animaci jen zastaví a styly nechá, jak zrovna byly.

:::check
Sekce s plovoucími tvary se po přepnutí jazyka webu vykreslí znovu a animace se spustí podruhé. Tvary pak poskakují dvojnásobně. Co chybí?

### --answer--
`overwrite: true` u nové animace.

#### --why--
`overwrite` řeší konflikt dvou tweenů na stejné vlastnosti, ale staré tweeny, ScrollTriggery a inline styly by nechal na místě. Úklid celé sekce to není.

### --correct--
Před novým spuštěním zavolat `revert()` na kontextu, ve kterém staré animace vznikly.

#### --why--
Kontext zastaví staré animace a vrátí původní styly, takže nové začínají z čistého stavu.

### --answer--
Zpomalit animaci přes `timeScale(0.5)`.

#### --why--
Dvě animace by pořád běžely přes sebe, jen pomaleji.
:::

## Typické chyby a pasti

> [!PITFALL] `from` na prvek skrytý v CSS
> *Příznak:* animace proběhne, ale prvek zůstane neviditelný. V DevTools má inline `opacity: 0`.
>
> *Oprava:* `from` jede do **aktuálního** stavu. Skrývej přes `visibility: hidden` a animuj `autoAlpha`, nebo použij `fromTo` s oběma hodnotami.

> [!PITFALL] Překlep v selektoru
> *Příznak:* nic se nehýbe a v konzoli je `GSAP target .hero__titel not found. https://gsap.com`.
>
> *Oprava:* zkontroluj selektor v DevTools přes `document.querySelectorAll('…')`. GSAP chybějící prvek jen ohlásí a pokračuje dál.

> [!PITFALL] Plugin bez registrace
> *Příznak:* animace se rozjede hned po načtení místo při scrollu a konzole hlásí `Invalid property scrollTrigger set to { … } Missing plugin? gsap.registerPlugin()`.
>
> *Oprava:* po importu zavolej `gsap.registerPlugin(ScrollTrigger)` (stejně `SplitText`, `Flip`).

> [!PITFALL] Dva tweeny na stejnou vlastnost
> *Příznak:* hover animace `x: 300` trvá 1 s, návrat `x: 0` trvá 0,2 s. Po rychlém najetí a odjetí zůstane prvek na `x: 300`, protože delší tween doběhne až po kratším.
>
> *Oprava:* `overwrite: 'auto'` u tweenu, který má předchozí přebít, nebo jeden tween, který obracíš přes `reverse()`.

:::check
Po kliknutí na „Další fotka" se má fotka posunout (`gsap.to(photo, { x: -400, duration: 1 })`), po kliknutí na „Zpět" vrátit (`gsap.to(photo, { x: 0, duration: 0.3 })`). Když klikneš rychle na obě, fotka skončí posunutá. Napiš vlastnost a hodnotu, kterou přidáš do objektu druhého tweenu, aby první přerušil.

### --expected--
overwrite: 'auto'

### --accept--
overwrite: "auto"
overwrite: true
overwrite:'auto'

### --why--
S `overwrite: 'auto'` nový tween zastaví jiné běžící tweeny stejného prvku v těch vlastnostech, které sám animuje. `true` zastaví všechny tweeny prvku bez ohledu na vlastnost.
:::

Ve workshopu z těchhle kousků složíš úvodní obrazovku hudebního festivalu: timeline s pozicemi, `stagger` na menu, odhalení nadpisu po řádcích a magnetické tlačítko.

## Kde to najdeš v MDN

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) — `element.animate()`, objekt `Animation` a jeho ovládání.
- [Element.animate()](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) — tvar klíčových snímků a nastavení (`duration`, `easing`, `fill`).
- [Animation.finished](https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished) — promise, který se splní po skončení animace.
- Dokumentace GSAPu (mimo MDN): [gsap.timeline()](https://gsap.com/docs/v3/GSAP/Timeline/) — pozice, štítky a metody pro ovládání.

# --questions--

## --question--

Kolegyně napsala tři tweeny se `delay: 0`, `delay: 0.6` a `delay: 1.2`, každý o délce 0,6 s. Pak chce, aby se celá sekvence po kliknutí na „Přeskočit" hned dokončila. Proč je to s touhle podobou kódu pracné a jak to udělá timeline?

### --answer--
Tweeny se zpožděním nejdou dokončit vůbec; jde to jen s CSS.

#### --why--
Každý tween jde dokončit přes `progress(1)`. Jde o to, kolik objektů musíš hlídat.

### --correct--
Musí najít a dokončit tři samostatné tweeny; timeline je jeden objekt, stačí `tl.progress(1)`.

#### --why--
Timeline drží celou sekvenci pohromadě, takže ovládání (`progress`, `pause`, `reverse`) platí pro všechno najednou.

### --answer--
Stačí zavolat `gsap.set` se stejnými hodnotami jako tweeny; timeline k tomu potřeba není.

#### --why--
`set` nastaví hodnoty, ale rozběhnuté tweeny poběží dál a přepíšou je.

### --see--
css-efekty-animace/gsap-zaklady#ovladani-play-pause-reverse-progress-a-timescale

## --question--

Napiš zkratku GSAPu, která animuje průhlednost a na nule prvek zároveň skryje přes `visibility`.

### --expected--
autoAlpha

### --why--
`autoAlpha` nastavuje `opacity` a při hodnotě 0 přidá `visibility: hidden`, takže neviditelný prvek nejde kliknout ani nafokusovat.

### --see--
css-efekty-animace/gsap-zaklady#gsap-to-from-fromto-a-set

## --question--

V timeline je tween `.logo` s délkou 1 s a za ním `.menu` s délkou 0,5 s na pozici `'<0.25'`. Kdy (v sekundách od začátku) skončí tween `.menu`?

### --expected--
0.75

### --accept--
0,75
0.75 s
0,75 s

### --why--
`'<0.25'` znamená 0,25 s po začátku předchozího tweenu (`.logo` začíná v 0). `.menu` tedy běží od 0,25 s do 0,75 s.

### --see--
css-efekty-animace/gsap-zaklady#timeline-sekvence-bez-pocitani-delay
