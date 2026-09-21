## GSAP: čtyři základní volání

```js
import gsap from 'gsap';

gsap.to('.karta',   { x: 160, duration: 0.6 });            // odsud DO zadaných hodnot
gsap.from('.karta', { autoAlpha: 0, y: 30 });              // ze zadaných hodnot DO současných
gsap.fromTo('.karta', { scale: 0.4 }, { scale: 1 });       // obojí, nezávisle na stavu
gsap.set('.karta',  { rotation: -8 });                     // okamžitě, bez animace
```

| zkratka | co to je |
|---|---|
| `x`, `y` | `transform: translate()` v pixelech |
| `xPercent`, `yPercent` | totéž v procentech vlastní velikosti |
| `scale`, `rotation` | zbytek `transform` |
| `autoAlpha` | `opacity` **plus** `visibility` — neviditelný prvek nejde kliknout |
| `duration`, `delay` | vteřiny, ne milisekundy |
| `ease` | `'power2.out'`, `'back.out(1.7)'`, `'none'`… |
| `stagger` | prodleva mezi prvky — z jedné animace udělá vlnu |
| `clearProps: 'all'` | po doběhnutí smaže inline styly |

## Timeline

```js
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } });

tl.from('.nadpis', { y: 40, autoAlpha: 0 })
  .from('.perex',  { y: 30, autoAlpha: 0 }, '-=0.3')   // o 0,3 s dřív → překryv
  .from('.karta',  { y: 20, autoAlpha: 0, stagger: 0.1 }, '+=0.1');
```

| pozice | kdy animace začne |
|---|---|
| (nic) | přesně na konci předchozí |
| `'-=0.3'` | o 0,3 s **dřív** (animace se překryjí) |
| `'+=0.3'` | o 0,3 s **později** (pauza) |
| `'<'` | současně se začátkem předchozí |
| `1.2` | absolutně, 1,2 s od začátku timeline |

Ovládání: `play()`, `pause()`, `reverse()`, `restart()`, `seek(1.2)`,
`progress(0.5)`, `timeScale(2)`.

## ScrollTrigger

```js
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

gsap.from('.sekce', {
  y: 60, autoAlpha: 0,
  scrollTrigger: {
    trigger: '.sekce',
    start: 'top 80%',          // horní hrana prvku na 80 % výšky okna
    end: '+=400',              // o 400 px dál
    toggleActions: 'play none none reverse',
    markers: true,             // jen při ladění!
  },
});
```

**`start` a `end`:** `'<místo na prvku> <místo v okně>'` — `'top center'`,
`'bottom bottom'`, `'center 60%'`. `end` smí být relativní: `'+=100%'` = o výšku okna dál.

**`toggleActions`** je čtveřice **onEnter onLeave onEnterBack onLeaveBack**, hodnoty
`play`, `pause`, `resume`, `reverse`, `restart`, `complete`, `reset`, `none`.
Platí **jen bez** `scrub`.

| volba | co udělá |
|---|---|
| `scrub: true` | animace je přilepená k posuvníku |
| `scrub: 0.5` | totéž se setrvačností půl vteřiny |
| `pin: true` | sekce zůstane stát (vznikne obal `.pin-spacer`) |
| `once: true` | spustí se jen jednou |
| `invalidateOnRefresh: true` | při `refresh()` přepočítá i hodnoty animace |

```js
ScrollTrigger.refresh();   // po načtení obrázků, rozbalení panelu, změně rozvržení
```

## Lenis a ScrollTrigger dohromady

```js
import Lenis from 'lenis';

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);          // ať ScrollTrigger ví o každém posunu
gsap.ticker.add((cas) => lenis.raf(cas * 1000));   // jeden společný rytmus
gsap.ticker.lagSmoothing(0);

lenis.scrollTo('#kapitola-3', { offset: -80 });    // plynule ke kotvě
```

## FLIP a plugin Flip

```js
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

const stav = Flip.getState('.karta');   // First: změř, kde jsou
seznam.classList.toggle('mrizka');      // Last: proveď změnu (DOM, třídy, pořadí)
Flip.from(stav, {                       // Invert + Play: odanimuj rozdíl
  duration: 0.5,
  ease: 'power2.inOut',
  absolute: true,                       // vytáhne prvky z toku, ať se nepřekrývají
  stagger: 0.04,
});
```

Animuje se `transform`, ne rozvržení — proto je to plynulé i u změn, které by jinak byly
drahé.

## View Transitions

```js
// Přechod mezi dvěma stavy téže stránky
document.startViewTransition(() => {
  seznam.classList.toggle('mrizka');
});
```

```css
.karta[data-id="7"] { view-transition-name: karta-7; }   /* jméno musí být jedinečné */

::view-transition-old(karta-7),
::view-transition-new(karta-7) { animation-duration: 0.4s; }
```

Prohlížeč, který to neumí, prostě přechod přeskočí — obsah se změní skokem, ale funguje.
Vždycky proto kontroluj `if (!document.startViewTransition) { zmena(); return; }`.

## Co je levné a co drahé

| animuješ | co prohlížeč udělá | cena |
|---|---|---|
| `width`, `height`, `top`, `left`, `margin` | rozvržení → malování → složení | nejdražší |
| `background-color`, `box-shadow`, `color` | malování → složení | střední |
| `transform` (`x`, `y`, `scale`, `rotation`), `opacity` | jen složení | nejlevnější |

Rozpočet na snímek při 60 fps je **16,7 ms** — a vejít se do něj musí i tvůj ostatní kód.

## Omezený pohyb

```js
const tlumit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (tlumit) {
  gsap.set('.kapitola', { opacity: 1 });   // obsah VIDITELNÝ, jen bez pohybu
} else {
  // plná verze
}
```

Nebo přímo v GSAP, s úklidem zdarma:

```js
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => { /* plná verze */ });
mm.add('(prefers-reduced-motion: reduce)', () => { /* tlumená verze */ });
```

**Vypni:** velké posuny, parallax, zvětšování, automatické karusely, scrollem řízené
animace. **Nech:** krátké prolnutí, změnu barvy, posuny do pár pixelů, indikátor načítání.

## Úklid

```js
const ctx = gsap.context(() => {
  gsap.from('.karta', { y: 30, autoAlpha: 0, stagger: 0.1 });
  ScrollTrigger.create({ /* … */ });
}, korenovyPrvek);

ctx.revert();   // zruší animace i ScrollTriggery a vrátí prvky do výchozího stavu
```

V Reactu patří `revert()` do úklidové funkce efektu — jinak po odpojení komponenty
zůstanou animace viset na prvcích, které už v dokumentu nejsou.

## Pasti

- **`markers: true` v hotovém kódu.** Vypadá to profesionálně asi jako `console.log`
  v produkci.
- **Animace `width`/`left` místo `transform`.** Vypadá stejně, stojí násobně víc.
- **`opacity: 0` bez `visibility`.** Neviditelná past, na kterou se dá kliknout — použij
  `autoAlpha`.
- **Pin a `position: sticky` naráz.** Perou se; `pin` si pozicování řeší sám.
- **Zapomenutý `ScrollTrigger.refresh()`** po načtení obrázků — efekty se spouštějí jinde,
  než mají. Prevence: rozměry u obrázků.
- **`prefers-reduced-motion` jen v CSS**, zatímco animace běží z JavaScriptu.
- **Tlumená varianta, ve které prvky zůstanou neviditelné.** Nejčastější chyba celé sekce.
- **Scrolljacking.** Když kolečko nedělá to, co uživatel čeká, je stránka rozbitá, i když
  vypadá draze.
- **Chybějící úklid v Reactu.** Staré animace na odpojených prvcích = únik paměti.
