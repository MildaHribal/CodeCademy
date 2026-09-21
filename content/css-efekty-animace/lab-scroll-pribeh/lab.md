---
title: Scroll příběh
runtime: dom
libs: gsap, lenis, motion
see: css-efekty-animace/scroll-efekty#scrolltrigger-trigger-start-a-end, css-efekty-animace/scroll-efekty#pin-sekce-ktera-zustane-stat, css-efekty-animace/vykon-a-pristupnost-animaci#prefers-reduced-motion-pro-koho-to-je
---

# --description--

Scrollem vyprávěný příběh je formát, který dělají redakce, značky i portfolia: čtenář
jen scrolluje a text se odhaluje po kapitolách, jedna sekce mu zůstane stát před očima
a pozadí se hýbe jinou rychlostí než popředí.

Postav takovou stránku. **Téma je tvoje** — cesta na kole přes republiku, historie
jedné budovy, jak vznikala tvoje první appka, cokoli, co má čtyři kapitoly a dá se
vyprávět.

## Co má stránka umět

1. **Čtyři kapitoly** (`<section class="kapitola">`), každá s vlastním nadpisem `h2`
   a odstavcem textu.
2. **Odhalení při scrollu** — každá kapitola připluje, jakmile se dostane do zorného pole.
3. **Přišpendlená sekce** (`.pin`) — jedna sekce zůstane stát, zatímco se v ní něco děje.
4. **Parallax** — pozadí `.pozadi` se při scrollu hýbe jinou rychlostí než text.
5. **Plynulé scrollování** přes Lenis, napojené na ScrollTrigger.
6. **Tlumená varianta** pro `prefers-reduced-motion: reduce`: žádné velké posuny,
   žádný parallax, žádné plynulé scrollování — ale **obsah musí být vidět**.

Stylopis `styles.css` máš připravený. Píšeš jen `script.js`.

> [!PITFALL]
> Nejčastější chyba téhle úlohy: kapitoly startují z `opacity: 0` a v tlumené variantě
> se jen vypne animace. Uživatel s omezeným pohybem pak uvidí prázdnou stránku.
> Tlumená varianta musí obsah **zviditelnit**.

## Jak na to

1. Napiš HTML se čtyřmi kapitolami, sekcí `.pin` a pozadím `.pozadi`. Zkontroluj.
2. Zjisti na začátku skriptu `prefers-reduced-motion` a ulož si to do proměnné. Podle ní
   se pak rozhoduj — je to jednodušší než to dopisovat dodatečně.
3. Rozjeď Lenis a napoj ho na ScrollTrigger.
4. Přidej odhalování kapitol, pak pin, pak parallax. Po každém kroku zkontroluj.

# --hints--

Stránka má čtyři kapitoly, každou s nadpisem a textem.

```js
const kapitoly = [...document.querySelectorAll('.kapitola')];
assert.equal(kapitoly.length, 4, `Na stránce je ${kapitoly.length} kapitol, mají být čtyři`);
for (const [i, kapitola] of kapitoly.entries()) {
  const nadpis = kapitola.querySelector('h2');
  assert.ok(nadpis && nadpis.textContent.trim().length > 2, `Kapitola ${i + 1} nemá nadpis <h2>`);
  const text = [...kapitola.querySelectorAll('p')].map((p) => p.textContent.trim()).join(' ');
  assert.ok(text.length > 40, `Kapitola ${i + 1} má jen ${text.length} znaků textu — napiš aspoň pár vět`);
}
```

Na stránce je přišpendlená sekce a pozadí pro parallax.

```js
assert.ok(document.querySelector('.pin'), 'Chybí sekce s třídou pin');
assert.ok(document.querySelector('.pozadi'), 'Chybí prvek s třídou pozadi (pozadí pro parallax)');
const h1 = document.querySelectorAll('h1');
assert.equal(h1.length, 1, `Na stránce je ${h1.length} prvků <h1> — má být právě jeden`);
```

Skript se ptá na omezení pohybu a podle toho se rozhoduje.

```js
const kod = helpers.stripComments(files['script.js']);
assert.match(kod, /prefers-reduced-motion/, 'Ve script.js se nikde neptáš na prefers-reduced-motion — media dotaz v CSS animace řízené z JavaScriptu nevypne');
assert.match(kod, /matchMedia/, 'Na zjištění použij window.matchMedia(...).matches');
```

Lenis běží a je napojený na ScrollTrigger.

```js
const kod = helpers.stripComments(files['script.js']);
assert.match(kod, /from\s+['"]lenis['"]/, 'Ve script.js chybí import Lenisu');
assert.match(kod, /new\s+Lenis\s*\(/, 'Lenis se nikde nevytváří (new Lenis(...))');
assert.match(kod, /ScrollTrigger\.update|scrollerProxy|lenis\.on\s*\(\s*['"]scroll['"]/, 'Lenis a ScrollTrigger o sobě nevědí — napoj je (lenis.on("scroll", ScrollTrigger.update))');
await helpers.waitFor(() => document.documentElement.classList.contains('lenis'), 3000).catch(() => {});
assert.ok(document.documentElement.classList.contains('lenis'), 'Lenis se nerozjel — na <html> chybí třída lenis, kterou si přidává sám');
```

ScrollTrigger je zaregistrovaný a má na stránce aspoň tři spouštěče.

```js
const kod = helpers.stripComments(files['script.js']);
assert.match(kod, /registerPlugin\s*\(\s*ScrollTrigger/, 'Plugin ScrollTrigger je potřeba zaregistrovat: gsap.registerPlugin(ScrollTrigger)');
await helpers.waitFor(() => document.querySelectorAll('.pin-spacer').length > 0, 3000).catch(() => {});
const spacery = document.querySelectorAll('.pin-spacer');
assert.ok(spacery.length >= 1, 'Žádná sekce není přišpendlená — ScrollTrigger si u pinu vyrábí obal .pin-spacer a ten na stránce není');
assert.ok(document.querySelector('.pin-spacer .pin, .pin-spacer.pin, .pin-spacer > .pin'), 'Přišpendlená má být sekce .pin');
```

Kapitoly se odhalují při scrollu, ale zůstanou viditelné, když se k nim doscrolluje.

```js
const kod = helpers.stripComments(files['script.js']);
assert.match(kod, /scrollTrigger/i, 'Odhalování kapitol má řídit ScrollTrigger');
const posledni = [...document.querySelectorAll('.kapitola')].at(-1);
posledni.scrollIntoView({ block: 'center' });
await helpers.waitFor(() => Number(getComputedStyle(posledni).opacity) > 0.9, 3000).catch(() => {});
assert.ok(Number(getComputedStyle(posledni).opacity) > 0.9, `Poslední kapitola má po doscrollování opacity ${getComputedStyle(posledni).opacity} — obsah musí být nakonec vidět`);
```

Parallax je řízený scrollem, ne časem.

```js
const kod = helpers.stripComments(files['script.js']);
assert.match(kod, /\.pozadi/, 'Ve script.js se nikde nepracuje s .pozadi');
assert.match(kod, /scrub\s*:/, 'Parallax má být přilepený k posuvníku — ScrollTrigger na to má volbu scrub');
```

Animují se jen levné vlastnosti.

```js
const kod = helpers.stripComments(files['script.js']);
const drahe = ['width:', 'height:', 'top:', 'left:', 'marginTop:', 'marginLeft:'];
const nalezene = drahe.filter((vlastnost) => kod.includes(vlastnost));
assert.deepEqual(nalezene, [], `V animacích se objevily vlastnosti, které nutí prohlížeč přepočítat rozvržení: ${nalezene.join(', ')}. Použij x, y, scale, rotation nebo opacity.`);
```

# --help--

## --tip--

Pin a scrub jsou v části
[ScrollTrigger](see:css-efekty-animace/scroll-efekty#scrolltrigger-trigger-start-a-end)
a v částech, co následují po ní. Lenis má vlastní část na konci téže lekce.

## --tip--

Tlumenou variantu řeš jednou proměnnou hned na začátku skriptu a pak se jí ptej —
ne osmkrát rozesetým `if`. A nezapomeň, že „bez animace" znamená **rovnou viditelné**,
ne `opacity: 0` navždy.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Scroll příběh</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="pozadi" aria-hidden="true"></div>

    <header class="uvod">
      <h1>Název tvého příběhu</h1>
      <p class="perex">Jedna věta o tom, o čem to bude.</p>
      <p class="pobidka">Scrolluj ↓</p>
    </header>

    <main>
      <!-- Sem přijdou čtyři sekce .kapitola a jedna sekce .pin. -->
    </main>

    <script type="module" src="script.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
/* Vzhled je hotový. Kapitoly startují neviditelné — zviditelnit je je práce skriptu,
   a to i v tlumené variantě. */
:root {
  --ink: #16202b;
  --ink-soft: #5a6874;
  --akcent: #b4532a;
  --papir: #f6f3ee;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--ink);
  background: var(--papir);
}

.pozadi {
  position: fixed;
  inset: -20% 0 -20% 0;
  z-index: -1;
  background: radial-gradient(60% 40% at 30% 20%, #e5d3c3, transparent 70%),
              radial-gradient(50% 50% at 80% 70%, #cfdbe2, transparent 70%);
}

.uvod { display: grid; place-content: center; min-height: 90vh; padding: 2rem 1.25rem; text-align: center; }
h1 { margin: 0 0 .5rem; font-size: clamp(2.25rem, 8vw, 4rem); line-height: 1.05; }
.perex { margin: 0 auto; max-width: 32ch; color: var(--ink-soft); font-size: 1.25rem; }
.pobidka { margin-top: 3rem; color: var(--ink-soft); font-size: .875rem; letter-spacing: .08em; }

main { max-width: 38rem; margin-inline: auto; padding: 0 1.25rem 6rem; }

.kapitola {
  opacity: 0;              /* zviditelní ho skript */
  padding: 4rem 0;
  border-top: 1px solid #e0d8cd;
}
.kapitola h2 { margin: 0 0 .75rem; font-size: 1.75rem; }
.kapitola p { margin: 0 0 1rem; }

.pin {
  display: grid;
  place-content: center;
  min-height: 100vh;
  text-align: center;
}
.pin h2 { font-size: clamp(1.75rem, 5vw, 2.5rem); }
.pin .cislo {
  display: block;
  font-size: clamp(4rem, 18vw, 9rem);
  line-height: 1;
  color: var(--akcent);
  font-variant-numeric: tabular-nums;
}
```

## --file-- script.js

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// 1. Zjisti, jestli má uživatel zapnuté omezení pohybu.
// 2. Rozjeď Lenis (v tlumené variantě ne) a napoj ho na ScrollTrigger.
// 3. Odhal kapitoly, přišpendli .pin, rozhýbej .pozadi.
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Přes republiku na kole — scroll příběh</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="pozadi" aria-hidden="true"></div>

    <header class="uvod">
      <h1>Sedm dní přes republiku</h1>
      <p class="perex">Z Aše do Jablunkova na kole z bazaru, bez doprovodu a bez plánu B.</p>
      <p class="pobidka">Scrolluj ↓</p>
    </header>

    <main>
      <section class="kapitola">
        <h2>Den první: Aš a vítr do obličeje</h2>
        <p>Vyrazil jsem v šest ráno od cedule s nejzápadnějším bodem republiky. Prvních dvacet kilometrů se jelo samo, pak se otočil vítr a zbylých šedesát jsem se s ním hádal.</p>
        <p>Večer jsem stanoval za Mariánskými Lázněmi u rybníka, na kterém byli rybáři dřív než já.</p>
      </section>

      <section class="kapitola">
        <h2>Den třetí: přes Vysočinu pořád nahoru</h2>
        <p>Vysočina nemá jeden kopec. Má dvě stě kopců za sebou a mezi nimi vždycky přesně tolik roviny, abys uvěřil, že už to bylo naposledy.</p>
        <p>V Novém Městě jsem koupil druhou pláštěnku, protože ta první se rozpadla ve stoupání u Žďáru.</p>
      </section>

      <section class="pin">
        <h2><span class="cislo">742</span> kilometrů za sedm dní</h2>
      </section>

      <section class="kapitola">
        <h2>Den pátý: defekt kousek od Blanska</h2>
        <p>Zadní duše šla v místě, kde nebyl signál ani obchod. Lepení mi trvalo čtyřicet minut a do Blanska jsem dojel se zadkem sedícím na obruči.</p>
        <p>V servisu na náměstí mi dali plášť za tři stovky a kafe zadarmo.</p>
      </section>

      <section class="kapitola">
        <h2>Den sedmý: Jablunkov a hospoda</h2>
        <p>Poslední den měl sto deset kilometrů a spadl do něj déšť, který začal v deset a skončil, až když jsem stál pod cedulí v Jablunkově.</p>
        <p>Kolo stálo jedenáct tisíc. Za sedm dní se mi vrátilo v něčem, co se nedá spočítat.</p>
      </section>
    </main>

    <script type="module" src="script.js"></script>
  </body>
</html>
```

## --file-- script.js

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Jedno rozhodnutí na začátku, podle kterého se řídí zbytek skriptu.
const tlumit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (tlumit) {
  // Bez pohybu, ale se vším obsahem: kapitoly rovnou zviditelnit.
  gsap.set('.kapitola', { opacity: 1 });
} else {
  // Plynulé scrollování; ScrollTrigger se musí o každém posunu dozvědět.
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((cas) => lenis.raf(cas * 1000));
  gsap.ticker.lagSmoothing(0);

  // Kapitoly připlují zdola, jakmile se dostanou do zorného pole.
  for (const kapitola of document.querySelectorAll('.kapitola')) {
    gsap.fromTo(
      kapitola,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: kapitola, start: 'top 80%', toggleActions: 'play none none reverse' },
      },
    );
  }

  // Sekce s číslem zůstane stát a číslo se během toho vypíše.
  const cislo = { hodnota: 0 };
  gsap.to(cislo, {
    hodnota: 742,
    ease: 'none',
    scrollTrigger: { trigger: '.pin', start: 'top top', end: '+=100%', pin: true, scrub: 0.5 },
    onUpdate: () => {
      document.querySelector('.pin .cislo').textContent = Math.round(cislo.hodnota);
    },
  });

  // Parallax: pozadí se posouvá pomaleji než obsah, přilepené k posuvníku.
  gsap.to('.pozadi', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
  });
}
```

# --approaches--

## --approach-- Odhalení přes Motion `inView` místo ScrollTriggeru

Na jednorázové odhalení sekcí nemusíš tahat celý ScrollTrigger — `inView` z knihovny
Motion je menší a čitelnější. ScrollTrigger si pak necháš jen na pin a parallax, kde ho
opravdu potřebuješ. Za to platíš druhou knihovnou v projektu.

### --file-- script.js

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { inView, animate } from 'motion';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const tlumit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (tlumit) {
  gsap.set('.kapitola', { opacity: 1 });
} else {
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((cas) => lenis.raf(cas * 1000));
  gsap.ticker.lagSmoothing(0);

  // Odhalení: jednorázově, bez ScrollTriggeru.
  inView('.kapitola', (prvek) => {
    animate(prvek, { opacity: [0, 1], transform: ['translateY(48px)', 'none'] }, { duration: 0.7 });
  }, { margin: '0px 0px -20% 0px' });

  const cislo = { hodnota: 0 };
  gsap.to(cislo, {
    hodnota: 742,
    ease: 'none',
    scrollTrigger: { trigger: '.pin', start: 'top top', end: '+=100%', pin: true, scrub: 0.5 },
    onUpdate: () => {
      document.querySelector('.pin .cislo').textContent = Math.round(cislo.hodnota);
    },
  });

  gsap.to('.pozadi', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
  });
}
```

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Přes republiku na kole — scroll příběh</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="pozadi" aria-hidden="true"></div>

    <header class="uvod">
      <h1>Sedm dní přes republiku</h1>
      <p class="perex">Z Aše do Jablunkova na kole z bazaru, bez doprovodu a bez plánu B.</p>
      <p class="pobidka">Scrolluj ↓</p>
    </header>

    <main>
      <section class="kapitola">
        <h2>Den první: Aš a vítr do obličeje</h2>
        <p>Vyrazil jsem v šest ráno od cedule s nejzápadnějším bodem republiky. Prvních dvacet kilometrů se jelo samo, pak se otočil vítr a zbylých šedesát jsem se s ním hádal.</p>
        <p>Večer jsem stanoval za Mariánskými Lázněmi u rybníka, na kterém byli rybáři dřív než já.</p>
      </section>

      <section class="kapitola">
        <h2>Den třetí: přes Vysočinu pořád nahoru</h2>
        <p>Vysočina nemá jeden kopec. Má dvě stě kopců za sebou a mezi nimi vždycky přesně tolik roviny, abys uvěřil, že už to bylo naposledy.</p>
        <p>V Novém Městě jsem koupil druhou pláštěnku, protože ta první se rozpadla ve stoupání u Žďáru.</p>
      </section>

      <section class="pin">
        <h2><span class="cislo">742</span> kilometrů za sedm dní</h2>
      </section>

      <section class="kapitola">
        <h2>Den pátý: defekt kousek od Blanska</h2>
        <p>Zadní duše šla v místě, kde nebyl signál ani obchod. Lepení mi trvalo čtyřicet minut a do Blanska jsem dojel se zadkem sedícím na obruči.</p>
        <p>V servisu na náměstí mi dali plášť za tři stovky a kafe zadarmo.</p>
      </section>

      <section class="kapitola">
        <h2>Den sedmý: Jablunkov a hospoda</h2>
        <p>Poslední den měl sto deset kilometrů a spadl do něj déšť, který začal v deset a skončil, až když jsem stál pod cedulí v Jablunkově.</p>
        <p>Kolo stálo jedenáct tisíc. Za sedm dní se mi vrátilo v něčem, co se nedá spočítat.</p>
      </section>
    </main>

    <script type="module" src="script.js"></script>
  </body>
</html>
```

## --approach-- Tlumená varianta přes `gsap.matchMedia()`

Místo jednoho `if` na celý skript se dá použít `gsap.matchMedia()`: zaregistruješ dvě
větve podle media dotazu a GSAP se sám postará o úklid, když uživatel nastavení změní
za běhu. Je to o kus víc kódu, zato je v něm obě varianty vidět vedle sebe a nic se
nemůže „zapomenout vypnout".

### --file-- script.js

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

// Běžný režim: plný příběh.
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (cas) => lenis.raf(cas * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  for (const kapitola of document.querySelectorAll('.kapitola')) {
    gsap.fromTo(
      kapitola,
      { opacity: 0, y: 48 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: kapitola, start: 'top 80%' } },
    );
  }

  const cislo = { hodnota: 0 };
  gsap.to(cislo, {
    hodnota: 742,
    ease: 'none',
    scrollTrigger: { trigger: '.pin', start: 'top top', end: '+=100%', pin: true, scrub: 0.5 },
    onUpdate: () => {
      document.querySelector('.pin .cislo').textContent = Math.round(cislo.hodnota);
    },
  });

  gsap.to('.pozadi', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
  });

  // Úklid, když se media dotaz přestane shodovat.
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
});

// Omezený pohyb: obsah viditelný, číslo rovnou na svém místě, pin beze scrubu.
mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.set('.kapitola', { opacity: 1 });
  document.querySelector('.pin .cislo').textContent = '742';
  ScrollTrigger.create({ trigger: '.pin', start: 'top top', end: '+=100%', pin: true });
});
```

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Přes republiku na kole — scroll příběh</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="pozadi" aria-hidden="true"></div>

    <header class="uvod">
      <h1>Sedm dní přes republiku</h1>
      <p class="perex">Z Aše do Jablunkova na kole z bazaru, bez doprovodu a bez plánu B.</p>
      <p class="pobidka">Scrolluj ↓</p>
    </header>

    <main>
      <section class="kapitola">
        <h2>Den první: Aš a vítr do obličeje</h2>
        <p>Vyrazil jsem v šest ráno od cedule s nejzápadnějším bodem republiky. Prvních dvacet kilometrů se jelo samo, pak se otočil vítr a zbylých šedesát jsem se s ním hádal.</p>
        <p>Večer jsem stanoval za Mariánskými Lázněmi u rybníka, na kterém byli rybáři dřív než já.</p>
      </section>

      <section class="kapitola">
        <h2>Den třetí: přes Vysočinu pořád nahoru</h2>
        <p>Vysočina nemá jeden kopec. Má dvě stě kopců za sebou a mezi nimi vždycky přesně tolik roviny, abys uvěřil, že už to bylo naposledy.</p>
        <p>V Novém Městě jsem koupil druhou pláštěnku, protože ta první se rozpadla ve stoupání u Žďáru.</p>
      </section>

      <section class="pin">
        <h2><span class="cislo">742</span> kilometrů za sedm dní</h2>
      </section>

      <section class="kapitola">
        <h2>Den pátý: defekt kousek od Blanska</h2>
        <p>Zadní duše šla v místě, kde nebyl signál ani obchod. Lepení mi trvalo čtyřicet minut a do Blanska jsem dojel se zadkem sedícím na obruči.</p>
        <p>V servisu na náměstí mi dali plášť za tři stovky a kafe zadarmo.</p>
      </section>

      <section class="kapitola">
        <h2>Den sedmý: Jablunkov a hospoda</h2>
        <p>Poslední den měl sto deset kilometrů a spadl do něj déšť, který začal v deset a skončil, až když jsem stál pod cedulí v Jablunkově.</p>
        <p>Kolo stálo jedenáct tisíc. Za sedm dní se mi vrátilo v něčem, co se nedá spočítat.</p>
      </section>
    </main>

    <script type="module" src="script.js"></script>
  </body>
</html>
```

# --review--

Testy kontrolují strukturu a to, že se věci opravdu dějí. Zbytek je na tobě.

## --rubric--

- Projel jsem stránku scrollem odshora dolů a zpátky — nic se nezaseklo ani nezmizelo.
- Zapnul jsem si v systému omezení pohybu, načetl stránku znovu a **přečetl si celý
  příběh**: žádná kapitola nezůstala neviditelná.
- Zkusil jsem to na šířce 375 px; přišpendlená sekce se vejde a nepřekrývá text.
- V panelu Performance při scrollu nevidím u každého snímku `Layout`.
- Texty jsou moje a příběh dává smysl i bez animací — ty ho jen doprovázejí.
- Nikde jsem uživateli nevzal kontrolu nad scrollováním (žádný scrolljacking).

## --extensions--

- Přidej ukazatel postupu čtení (tenký pruh nahoře) řízený `scrollTrigger` se `scrub`.
- Dej kapitolám kotvy a do úvodu obsah, ze kterého se dá skočit na kapitolu přes
  `lenis.scrollTo()`.
- Zkus totéž bez GSAP — jen s CSS `animation-timeline: view()` — a porovnej, co ti
  chybí a co naopak ubylo kódu.
- Nahraď pevnou hodnotu `742` skutečným číslem ze svého příběhu a nech ho napočítat
  podle toho, kolik stránky uživatel projel.
