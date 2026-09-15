---
title: Načítání a oznámení
see: css-animace/keyframes#vykon-a-omezeny-pohyb-u-animaci, css-animace/workshop-interakce/008
timeoutMs: 8000
---

# --description--

Zelená bedýnka rozváží zeleninu z farem a do aplikace potřebuje tři stavy, které uživatel vidí nejčastěji: načítací kolečko, skeleton karty, zatímco se nabídka načítá, a oznámení po uložení objednávky. Tahle stránka je jejich ukázka pro celý tým — jako knihovna komponent.

HTML, JavaScript i vzhled komponent jsou hotové. Chybí pohyb. Piš do `styles.css` pod komentář „Tvoje animace". Třídy a strukturu HTML neměň; barvy, texty i celkový vzhled jsou tvoje volba.

**Co mají komponenty umět:**

- Kolečko `.spinner` se točí pořád dokola a rovnoměrně, bez zpomalování na konci otáčky. Jedna otáčka trvá 0,5–1,5 s. Platí pro obě kolečka na stránce.
- Každý blok skeletonu `.skeleton` naznačuje, že se něco děje: pulzuje, nebo po něm přejíždí lesk (i v pseudoprvku). Animace skeletonu přitom nesmí měnit rozvržení stránky.
- Když uživatel klikne na **Uložit objednávku**, oznámení `.toast` se plynule objeví a přitom vyjede zdola nahoru, za 150–400 ms. Oznámení stojí v pravém dolním rohu okna, nejvýš 2rem (32 px) od pravého i dolního okraje, a vejde se i do okna širokého 375 px.
- Když se oznámení za 3 sekundy schová, zmizí taky plynule, ne skokem.
- Uživatel, který má zapnuté omezení pohybu, nevidí nic, co se točí nebo posouvá. Kolečko ale dál ukazuje, že se načítá (třeba pulzováním průhlednosti), skeleton smí pulzovat, nebo stát, a oznámení se objeví bez vyjetí.

Ověř si výsledek v DevTools s emulací `prefers-reduced-motion: reduce` (panel **Rendering**) a v náhledu v šířce 375. Testy s omezeným pohybem ho nasimulují samy.

# --hints--

Obě kolečka `.spinner` mají nekonečnou animaci, která je otáčí.

```js
// Test nasimuluje, že uživatel nemá v systému zapnuté omezení pohybu.
const allowMotion = (rules) => {
  for (const rule of rules) {
    if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
      rule.media.mediaText = rule.media.mediaText
        .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(max-width: 0px)')
        .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(min-width: 0px)');
    }
    if (rule.cssRules) allowMotion(rule.cssRules);
  }
};
for (const sheet of document.styleSheets) allowMotion(sheet.cssRules);
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
const spinners = [...document.querySelectorAll('.spinner')];
assert.equal(spinners.length, 2, 'Na stránce mají být dvě kolečka .spinner');
spinners.forEach((spinner, i) => {
  const spins = animationsOf(spinner).filter((animation) => !animation.transitionProperty);
  assert.ok(spins.length > 0, `Kolečko ${i + 1} nemá žádnou animaci`);
  const rotating = spins.find((animation) => animation.effect.getKeyframes().some((frame) => 'rotate' in frame || 'transform' in frame));
  assert.ok(rotating, `Animace kolečka ${i + 1} ve snímcích nemění rotate ani transform`);
  assert.equal(rotating.effect.getComputedTiming().iterations, Infinity, `Animace kolečka ${i + 1} se má opakovat pořád dokola (infinite)`);
});
```

Jedna otáčka kolečka trvá 0,5–1,5 s a kolečko se točí rovnoměrně (`linear` nebo `steps()`).

```js
// Test nasimuluje, že uživatel nemá v systému zapnuté omezení pohybu.
const allowMotion = (rules) => {
  for (const rule of rules) {
    if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
      rule.media.mediaText = rule.media.mediaText
        .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(max-width: 0px)')
        .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(min-width: 0px)');
    }
    if (rule.cssRules) allowMotion(rule.cssRules);
  }
};
for (const sheet of document.styleSheets) allowMotion(sheet.cssRules);
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
const spinner = document.querySelector('.spinner');
const rotating = animationsOf(spinner).find((animation) => animation.effect.getKeyframes().some((frame) => 'rotate' in frame || 'transform' in frame));
assert.ok(rotating, 'Kolečko nemá animaci otáčení');
const duration = rotating.effect.getComputedTiming().duration;
assert.ok(duration >= 500 && duration <= 1500, `Jedna otáčka trvá ${duration} ms, čekám 500–1500 ms`);
const easings = rotating.effect.getKeyframes().map((frame) => frame.easing);
assert.ok(easings.every((easing) => easing === 'linear' || easing.startsWith('steps(')), `Časovací funkce otáčení je ${[...new Set(easings)].join(', ')} — kolečko má jet rovnoměrně`);
```

Každý blok skeletonu má nekonečnou animaci (na sobě nebo na pseudoprvku).

```js
// Test nasimuluje, že uživatel nemá v systému zapnuté omezení pohybu.
const allowMotion = (rules) => {
  for (const rule of rules) {
    if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
      rule.media.mediaText = rule.media.mediaText
        .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(max-width: 0px)')
        .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(min-width: 0px)');
    }
    if (rule.cssRules) allowMotion(rule.cssRules);
  }
};
for (const sheet of document.styleSheets) allowMotion(sheet.cssRules);
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
document.querySelectorAll('.skeleton').forEach((block, i) => {
  const infinite = animationsOf(block).filter((animation) => animation.effect.getComputedTiming().iterations === Infinity);
  assert.ok(infinite.length > 0, `Blok skeletonu ${i + 1} nemá nekonečnou animaci`);
});
```

Animace skeletonu nemění rozvržení stránky.

```js
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
const layout = /^(width|height|inline-size|block-size|min-|max-|margin|padding|top|right|bottom|left|inset|font-size|line-height|border-width)/;
document.querySelectorAll('.skeleton').forEach((block, i) => {
  for (const animation of animationsOf(block)) {
    const properties = animation.transitionProperty ? [animation.transitionProperty] : animation.effect.getKeyframes().flatMap((frame) => Object.keys(frame));
    const bad = properties.map((name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)).filter((name) => layout.test(name));
    assert.equal(bad.length, 0, `Animace bloku skeletonu ${i + 1} mění vlastnosti rozvržení: ${bad.join(', ')}`);
  }
});
```

Po kliknutí na „Uložit objednávku" se oznámení plynule objeví za 150–400 ms.

```js
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
const toast = document.querySelector('.toast');
await helpers.click(document.querySelector('#save-button'));
getComputedStyle(toast).opacity;
const fades = animationsOf(toast).filter((animation) => animation.transitionProperty === 'opacity' || (!animation.transitionProperty && animation.effect.getKeyframes().some((frame) => 'opacity' in frame)));
assert.ok(fades.length > 0, 'Po kliknutí na Uložit objednávku nemá oznámení žádný přechod ani animaci průhlednosti');
const duration = fades[0].effect.getComputedTiming().duration;
assert.ok(duration >= 150 && duration <= 400, `Objevení oznámení trvá ${duration} ms, čekám 150–400 ms`);
await helpers.wait(600);
assert.equal(getComputedStyle(toast).opacity, '1', 'Otevřené oznámení má být po doběhnutí plně viditelné');
```

Oznámení při objevení vyjede zdola nahoru.

```js
// Test nasimuluje, že uživatel nemá v systému zapnuté omezení pohybu.
const allowMotion = (rules) => {
  for (const rule of rules) {
    if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
      rule.media.mediaText = rule.media.mediaText
        .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(max-width: 0px)')
        .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(min-width: 0px)');
    }
    if (rule.cssRules) allowMotion(rule.cssRules);
  }
};
for (const sheet of document.styleSheets) allowMotion(sheet.cssRules);
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
const toast = document.querySelector('.toast');
await helpers.click(document.querySelector('#save-button'));
getComputedStyle(toast).opacity;
const moving = movingAnimations(toast);
assert.ok(moving.length > 0, 'Oznámení se při objevení neposouvá');
moving.forEach((animation) => animation.finish());
const end = toast.getBoundingClientRect().top;
moving.forEach((animation) => { animation.pause(); animation.currentTime = 0; });
const start = toast.getBoundingClientRect().top;
assert.ok(start > end + 2, `Oznámení začíná na ${Math.round(start)} px a končí na ${Math.round(end)} px — má vyjet zdola nahoru`);
```

Oznámení stojí v pravém dolním rohu okna, nejvýš 32 px od pravého a dolního okraje.

```js
const toast = document.querySelector('.toast');
await helpers.click(document.querySelector('#save-button'));
await helpers.wait(600);
const box = toast.getBoundingClientRect();
const right = window.innerWidth - box.right;
const bottom = window.innerHeight - box.bottom;
assert.ok(right >= 0 && right <= 32, `Oznámení je ${Math.round(right)} px od pravého okraje okna, čekám 0–32 px`);
assert.ok(bottom >= 0 && bottom <= 32, `Oznámení je ${Math.round(bottom)} px od dolního okraje okna, čekám 0–32 px`);
```

V okně širokém 375 px se oznámení vejde celé.

```js
await helpers.resize(375);
const toast = document.querySelector('.toast');
await helpers.click(document.querySelector('#save-button'));
await helpers.wait(600);
const box = toast.getBoundingClientRect();
assert.ok(box.left >= 0 && box.right <= window.innerWidth, `Při šířce 375 px sahá oznámení od ${Math.round(box.left)} do ${Math.round(box.right)} px — má se vejít do okna`);
```

Oznámení se schová plynule: chvíli po zavření je pořád vidět a mizí.

```js
const toast = document.querySelector('.toast');
await helpers.click(document.querySelector('#save-button'));
await helpers.wait(600);
toast.hidePopover();
getComputedStyle(toast).opacity;
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
const closing = animationsOf(toast).filter((animation) => animation.transitionProperty === 'opacity' || (!animation.transitionProperty && animation.effect.getKeyframes().some((frame) => 'opacity' in frame)));
assert.ok(closing.length > 0, 'Při zavírání oznámení neběží žádný přechod ani animace průhlednosti');
await helpers.wait(60);
assert.notEqual(getComputedStyle(toast).display, 'none', '60 ms po zavření má být oznámení pořád vykreslené');
const hidden = await helpers.waitFor(() => getComputedStyle(toast).display === 'none', 2000).catch(() => false);
assert.ok(hidden, `Oznámení 2 s po zavření pořád má display ${getComputedStyle(toast).display} — nepřebíjí nějaké pravidlo s display skrytí zavřeného popoveru?`);
```

Při omezeném pohybu se kolečka netočí, ale dál se animují.

```js
// Test nasimuluje zapnuté omezení pohybu: media dotazy na prefers-reduced-motion přepíše na podmínky, které platí (reduce) nebo neplatí (no-preference).
const emulateReducedMotion = () => {
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
        rule.media.mediaText = rule.media.mediaText
          .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(min-width: 0px)')
          .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(max-width: 0px)')
          .replace(/\(\s*prefers-reduced-motion\s*\)/g, '(min-width: 0px)');
      }
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) visit(sheet.cssRules);
};
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
emulateReducedMotion();
document.querySelectorAll('.spinner').forEach((spinner, i) => {
  assert.equal(movingAnimations(spinner).length, 0, `Při omezeném pohybu se kolečko ${i + 1} pořád točí nebo posouvá`);
  assert.ok(animationsOf(spinner).length > 0, `Při omezeném pohybu nemá kolečko ${i + 1} žádnou animaci — uživatel nepozná, že se načítá`);
});
```

Při omezeném pohybu po skeletonu nic nepřejíždí a nic se na něm nehýbe.

```js
// Test nasimuluje zapnuté omezení pohybu: media dotazy na prefers-reduced-motion přepíše na podmínky, které platí (reduce) nebo neplatí (no-preference).
const emulateReducedMotion = () => {
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
        rule.media.mediaText = rule.media.mediaText
          .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(min-width: 0px)')
          .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(max-width: 0px)')
          .replace(/\(\s*prefers-reduced-motion\s*\)/g, '(min-width: 0px)');
      }
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) visit(sheet.cssRules);
};
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
emulateReducedMotion();
document.querySelectorAll('.skeleton').forEach((block, i) => {
  assert.equal(movingAnimations(block).length, 0, `Při omezeném pohybu se na bloku skeletonu ${i + 1} něco posouvá`);
});
```

Při omezeném pohybu se oznámení objeví bez vyjetí.

```js
// Test nasimuluje zapnuté omezení pohybu: media dotazy na prefers-reduced-motion přepíše na podmínky, které platí (reduce) nebo neplatí (no-preference).
const emulateReducedMotion = () => {
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) {
        rule.media.mediaText = rule.media.mediaText
          .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(min-width: 0px)')
          .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(max-width: 0px)')
          .replace(/\(\s*prefers-reduced-motion\s*\)/g, '(min-width: 0px)');
      }
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) visit(sheet.cssRules);
};
// Všechny přechody a animace prvku včetně jeho pseudoprvků.
const animationsOf = (element) => document.getAnimations().filter((animation) => animation.effect?.target === element);
// Z nich ty, které hýbou, zvětšují, otáčejí nebo posouvají pozadí.
const MOVES = ['translate', 'scale', 'rotate', 'transform', 'backgroundPosition', 'background-position'];
const movingAnimations = (element) => animationsOf(element).filter((animation) => {
  if (animation.transitionProperty) return MOVES.includes(animation.transitionProperty);
  return animation.effect.getKeyframes().some((frame) => MOVES.some((name) => name in frame));
});
emulateReducedMotion();
const toast = document.querySelector('.toast');
await helpers.click(document.querySelector('#save-button'));
getComputedStyle(toast).opacity;
assert.equal(movingAnimations(toast).length, 0, 'Při omezeném pohybu oznámení pořád vyjíždí');
```

# --help--

## --tip-- 7

Popover má z prohlížeče `position: fixed`, `inset: 0` a `margin: auto`, proto stojí uprostřed okna. Rozmysli si, které dvě strany mají mít odstup a které mají zůstat volné (`auto`), a co udělat s automatickým okrajem. Jak se popover otevírá a zavírá plynule, máš z [nabídky sdílení](see:css-animace/workshop-interakce/008).

## --tip-- 10

Kolečko při omezeném pohybu nemusí stát. V části [Výkon a omezený pohyb u animací](see:css-animace/keyframes#vykon-a-omezeny-pohyb-u-animaci) je vzor, jak v media dotazu vyměnit animaci s pohybem za animaci bez pohybu.

# --review--

Testy kontrolují pohyb. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každá nekonečná animace ukazuje něco, co uživatel potřebuje vědět (načítání), žádná není jen ozdoba.
- Lesk nebo pulz skeletonu animuje `translate` nebo `opacity`, ne gradient nebo rozměry celé plochy.
- Oznámení se dá přečíst: kontrast textu proti pozadí a dost času, než zmizí.
- Prošel jsi stránku s emulací `prefers-reduced-motion: reduce` a nic se netočí ani neposouvá.
- Pohyb z tvého řešení bys obhájil před designérem: délky, křivky a proč zrovna tyhle.

## --extensions--

Rozšíření bez testů: kolečko se třemi tečkami, které se rozfázují záporným zpožděním; ukazatel průběhu nahrávání fotky přes `scale` s počátkem vlevo; oznámení s tlačítkem „Zpět", které při najetí myší pozastaví automatické zavření.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Zelená bedýnka — stavy rozhraní</title>
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
  </head>
  <body>
    <main class="showcase">
      <header class="showcase__header">
        <p class="showcase__eyebrow">Knihovna komponent</p>
        <h1>Načítání a oznámení</h1>
        <p class="showcase__lead">Stavy, které uvidí zákazník Zelené bedýnky, když čeká na nabídku zeleniny nebo ukládá objednávku.</p>
      </header>

      <section class="demo" aria-labelledby="demo-spinner">
        <h2 id="demo-spinner">Načítací kolečko</h2>
        <div class="demo__row">
          <div class="loading" role="status">
            <span class="spinner" aria-hidden="true"></span>
            <span>Načítám nabídku na tento týden…</span>
          </div>
          <button class="button" type="button" disabled>
            <span class="spinner spinner--small" aria-hidden="true"></span>
            Odesílám objednávku
          </button>
        </div>
      </section>

      <section class="demo" aria-labelledby="demo-skeleton">
        <h2 id="demo-skeleton">Skeleton karty</h2>
        <div class="demo__row">
          <article class="product-skeleton" aria-hidden="true">
            <div class="skeleton skeleton--image"></div>
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text skeleton--short"></div>
          </article>
          <article class="product">
            <div class="product__image"></div>
            <h3 class="product__title">Bedýnka Sezóna</h3>
            <p class="product__text">Brambory, mrkev, cuketa a hrst bylinek z farmy u Kolína.</p>
            <p class="product__price">389&nbsp;Kč</p>
          </article>
        </div>
      </section>

      <section class="demo" aria-labelledby="demo-toast">
        <h2 id="demo-toast">Oznámení</h2>
        <button class="button" type="button" id="save-button">Uložit objednávku</button>
        <div class="toast" id="toast" popover="manual" role="status">
          <span class="toast__icon" aria-hidden="true">✓</span>
          Objednávka je uložená. Doručíme ji ve čtvrtek.
        </div>
      </section>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --color-bg: oklch(97% 0.015 130);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(26% 0.04 150);
  --color-muted: oklch(50% 0.03 150);
  --color-line: oklch(90% 0.02 130);
  --color-accent: oklch(55% 0.13 145);
  --color-skeleton: oklch(92% 0.012 130);
  --color-shine: oklch(97% 0.01 130);
  --radius: 1rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

.showcase {
  max-width: 52rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 6rem;
}

.showcase__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  line-height: 1.1;
}

.showcase__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
}

.demo {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.demo h2 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
}

.demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.8;
  cursor: progress;
}

/* Načítací kolečko */

.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border: 3px solid var(--color-line);
  border-top-color: var(--color-accent);
  border-radius: 50%;
}

.spinner--small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
  border-color: oklch(100% 0 0 / 0.4);
  border-top-color: white;
}

/* Skeleton a hotová karta */

.product-skeleton,
.product {
  display: grid;
  gap: 0.625rem;
  width: 15rem;
  padding: 0.75rem 0.75rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
}

.skeleton {
  position: relative;
  overflow: clip;
  height: 0.875rem;
  border-radius: 999px;
  background: var(--color-skeleton);
}

.skeleton--image,
.product__image {
  height: 8rem;
  border-radius: 0.625rem;
}

.skeleton--title {
  width: 70%;
  height: 1.125rem;
}

.skeleton--short {
  width: 45%;
}

.product__image {
  background: linear-gradient(160deg, oklch(80% 0.12 130), oklch(60% 0.14 150));
}

.product__title,
.product__text,
.product__price {
  margin: 0;
}

.product__title {
  font-size: 1.125rem;
}

.product__text {
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.product__price {
  font-weight: 750;
}

/* Oznámení */

.toast {
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100vw - 2rem);
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: 0.875rem;
  background: var(--color-text);
  color: white;
  box-shadow: 0 1rem 2rem oklch(26% 0.04 150 / 0.3);
}

/* display: flex jen pro otevřené oznámení — zavřený popover musí mít display: none z prohlížeče. */
.toast:popover-open {
  display: flex;
}

.toast__icon {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-accent);
  font-size: 0.875rem;
}

/* ===== Tvoje animace ===== */
--edit--

--edit--
```

## --file-- script.js

```js
// Po kliknutí na „Uložit objednávku" se ukáže oznámení a za 3 sekundy se samo schová.
const saveButton = document.querySelector('#save-button');
const toast = document.querySelector('#toast');
let hideTimer;

saveButton.addEventListener('click', () => {
  toast.showPopover();
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.hidePopover(), 3000);
});
```

# --solution--

## --file-- styles.css

```css
:root {
  --color-bg: oklch(97% 0.015 130);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(26% 0.04 150);
  --color-muted: oklch(50% 0.03 150);
  --color-line: oklch(90% 0.02 130);
  --color-accent: oklch(55% 0.13 145);
  --color-skeleton: oklch(92% 0.012 130);
  --color-shine: oklch(97% 0.01 130);
  --radius: 1rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

.showcase {
  max-width: 52rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 6rem;
}

.showcase__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  line-height: 1.1;
}

.showcase__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
}

.demo {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.demo h2 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
}

.demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.8;
  cursor: progress;
}

/* Načítací kolečko */

.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border: 3px solid var(--color-line);
  border-top-color: var(--color-accent);
  border-radius: 50%;
}

.spinner--small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
  border-color: oklch(100% 0 0 / 0.4);
  border-top-color: white;
}

/* Skeleton a hotová karta */

.product-skeleton,
.product {
  display: grid;
  gap: 0.625rem;
  width: 15rem;
  padding: 0.75rem 0.75rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
}

.skeleton {
  position: relative;
  overflow: clip;
  height: 0.875rem;
  border-radius: 999px;
  background: var(--color-skeleton);
}

.skeleton--image,
.product__image {
  height: 8rem;
  border-radius: 0.625rem;
}

.skeleton--title {
  width: 70%;
  height: 1.125rem;
}

.skeleton--short {
  width: 45%;
}

.product__image {
  background: linear-gradient(160deg, oklch(80% 0.12 130), oklch(60% 0.14 150));
}

.product__title,
.product__text,
.product__price {
  margin: 0;
}

.product__title {
  font-size: 1.125rem;
}

.product__text {
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.product__price {
  font-weight: 750;
}

/* Oznámení */

.toast {
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100vw - 2rem);
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: 0.875rem;
  background: var(--color-text);
  color: white;
  box-shadow: 0 1rem 2rem oklch(26% 0.04 150 / 0.3);
}

/* display: flex jen pro otevřené oznámení — zavřený popover musí mít display: none z prohlížeče. */
.toast:popover-open {
  display: flex;
}

.toast__icon {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-accent);
  font-size: 0.875rem;
}

/* ===== Tvoje animace ===== */

/* Kolečko se točí rovnoměrně pořád dokola. */
.spinner {
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

/* Lesk skeletonu: pruh v pseudoprvku jezdí přes blok, animuje se jen translate. */
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--color-shine), transparent);
  translate: -100% 0;
  animation: shine 1.4s ease-in-out infinite;
}

@keyframes shine {
  to {
    translate: 100% 0;
  }
}

/* Oznámení v pravém dolním rohu, vyjede zdola a zase zajede. */
.toast {
  inset: auto 1.5rem 1.5rem auto;
  margin: 0;
  opacity: 0;
  translate: 0 1rem;
  transition:
    opacity 250ms ease-out,
    translate 250ms ease-out,
    display 250ms allow-discrete,
    overlay 250ms allow-discrete;
}

.toast:popover-open {
  opacity: 1;
  translate: 0 0;
}

@starting-style {
  .toast:popover-open {
    opacity: 0;
    translate: 0 1rem;
  }
}

/* Omezený pohyb: kolečko jen pulzuje, lesk zmizí, oznámení se jen prolne. */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: pulse 1s ease-in-out infinite alternate;
  }

  .skeleton::after {
    animation: none;
    display: none;
  }

  .toast,
  .toast:popover-open {
    translate: none;
  }
}

@keyframes pulse {
  to {
    opacity: 0.4;
  }
}
```

# --approaches--

## --approach-- Přechody a lesk v pseudoprvku

Oznámení vyjíždí přechodem se `@starting-style`, lesk skeletonu je pruh v `::after`, který jezdí přes `translate`. Omezený pohyb řeší jeden media dotaz na konci, který pohyb vymění nebo vypne. Hodí se, když už máš hotové animace a přístupnost přidáváš.

### --file-- styles.css

```css
:root {
  --color-bg: oklch(97% 0.015 130);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(26% 0.04 150);
  --color-muted: oklch(50% 0.03 150);
  --color-line: oklch(90% 0.02 130);
  --color-accent: oklch(55% 0.13 145);
  --color-skeleton: oklch(92% 0.012 130);
  --color-shine: oklch(97% 0.01 130);
  --radius: 1rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

.showcase {
  max-width: 52rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 6rem;
}

.showcase__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  line-height: 1.1;
}

.showcase__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
}

.demo {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.demo h2 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
}

.demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.8;
  cursor: progress;
}

/* Načítací kolečko */

.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border: 3px solid var(--color-line);
  border-top-color: var(--color-accent);
  border-radius: 50%;
}

.spinner--small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
  border-color: oklch(100% 0 0 / 0.4);
  border-top-color: white;
}

/* Skeleton a hotová karta */

.product-skeleton,
.product {
  display: grid;
  gap: 0.625rem;
  width: 15rem;
  padding: 0.75rem 0.75rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
}

.skeleton {
  position: relative;
  overflow: clip;
  height: 0.875rem;
  border-radius: 999px;
  background: var(--color-skeleton);
}

.skeleton--image,
.product__image {
  height: 8rem;
  border-radius: 0.625rem;
}

.skeleton--title {
  width: 70%;
  height: 1.125rem;
}

.skeleton--short {
  width: 45%;
}

.product__image {
  background: linear-gradient(160deg, oklch(80% 0.12 130), oklch(60% 0.14 150));
}

.product__title,
.product__text,
.product__price {
  margin: 0;
}

.product__title {
  font-size: 1.125rem;
}

.product__text {
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.product__price {
  font-weight: 750;
}

/* Oznámení */

.toast {
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100vw - 2rem);
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: 0.875rem;
  background: var(--color-text);
  color: white;
  box-shadow: 0 1rem 2rem oklch(26% 0.04 150 / 0.3);
}

/* display: flex jen pro otevřené oznámení — zavřený popover musí mít display: none z prohlížeče. */
.toast:popover-open {
  display: flex;
}

.toast__icon {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-accent);
  font-size: 0.875rem;
}

/* ===== Tvoje animace ===== */

/* Kolečko se točí rovnoměrně pořád dokola. */
.spinner {
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

/* Lesk skeletonu: pruh v pseudoprvku jezdí přes blok, animuje se jen translate. */
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--color-shine), transparent);
  translate: -100% 0;
  animation: shine 1.4s ease-in-out infinite;
}

@keyframes shine {
  to {
    translate: 100% 0;
  }
}

/* Oznámení v pravém dolním rohu, vyjede zdola a zase zajede. */
.toast {
  inset: auto 1.5rem 1.5rem auto;
  margin: 0;
  opacity: 0;
  translate: 0 1rem;
  transition:
    opacity 250ms ease-out,
    translate 250ms ease-out,
    display 250ms allow-discrete,
    overlay 250ms allow-discrete;
}

.toast:popover-open {
  opacity: 1;
  translate: 0 0;
}

@starting-style {
  .toast:popover-open {
    opacity: 0;
    translate: 0 1rem;
  }
}

/* Omezený pohyb: kolečko jen pulzuje, lesk zmizí, oznámení se jen prolne. */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: pulse 1s ease-in-out infinite alternate;
  }

  .skeleton::after {
    animation: none;
    display: none;
  }

  .toast,
  .toast:popover-open {
    translate: none;
  }
}

@keyframes pulse {
  to {
    opacity: 0.4;
  }
}
```

## --approach-- Klidný základ, pohyb jen bez omezení

Základ je bez pohybu pro všechny: skeleton i kolečko pulzují průhledností a oznámení se jen prolne. Otáčení a vyjetí s překmitem jsou až v `@media (prefers-reduced-motion: no-preference)`. Prohlížeč, který omezení pohybu nezná, nebo uživatel, který ho zapnul, pohyb vůbec nedostane — bezpečnější výchozí stav.

### --file-- styles.css

```css
:root {
  --color-bg: oklch(97% 0.015 130);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(26% 0.04 150);
  --color-muted: oklch(50% 0.03 150);
  --color-line: oklch(90% 0.02 130);
  --color-accent: oklch(55% 0.13 145);
  --color-skeleton: oklch(92% 0.012 130);
  --color-shine: oklch(97% 0.01 130);
  --radius: 1rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

.showcase {
  max-width: 52rem;
  margin-inline: auto;
  padding: 3rem 1.5rem 6rem;
}

.showcase__eyebrow {
  margin: 0;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.75rem);
  line-height: 1.1;
}

.showcase__lead {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
}

.demo {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.demo h2 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
}

.demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.8;
  cursor: progress;
}

/* Načítací kolečko */

.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border: 3px solid var(--color-line);
  border-top-color: var(--color-accent);
  border-radius: 50%;
}

.spinner--small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
  border-color: oklch(100% 0 0 / 0.4);
  border-top-color: white;
}

/* Skeleton a hotová karta */

.product-skeleton,
.product {
  display: grid;
  gap: 0.625rem;
  width: 15rem;
  padding: 0.75rem 0.75rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
}

.skeleton {
  position: relative;
  overflow: clip;
  height: 0.875rem;
  border-radius: 999px;
  background: var(--color-skeleton);
}

.skeleton--image,
.product__image {
  height: 8rem;
  border-radius: 0.625rem;
}

.skeleton--title {
  width: 70%;
  height: 1.125rem;
}

.skeleton--short {
  width: 45%;
}

.product__image {
  background: linear-gradient(160deg, oklch(80% 0.12 130), oklch(60% 0.14 150));
}

.product__title,
.product__text,
.product__price {
  margin: 0;
}

.product__title {
  font-size: 1.125rem;
}

.product__text {
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.product__price {
  font-weight: 750;
}

/* Oznámení */

.toast {
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100vw - 2rem);
  padding: 0.875rem 1.25rem;
  border: 0;
  border-radius: 0.875rem;
  background: var(--color-text);
  color: white;
  box-shadow: 0 1rem 2rem oklch(26% 0.04 150 / 0.3);
}

/* display: flex jen pro otevřené oznámení — zavřený popover musí mít display: none z prohlížeče. */
.toast:popover-open {
  display: flex;
}

.toast__icon {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-accent);
  font-size: 0.875rem;
}

/* ===== Tvoje animace ===== */

/* Bez pohybu: klidné pulzování a prolínání platí pro všechny. */
.skeleton {
  animation: pulse 1.2s ease-in-out infinite alternate;
}

.spinner {
  animation: pulse 1s ease-in-out infinite alternate;
}

.toast {
  inset: auto 1rem 1rem auto;
  margin: 0;
  opacity: 0;
  transition:
    opacity 300ms ease-out,
    display 300ms allow-discrete,
    overlay 300ms allow-discrete;
}

.toast:popover-open {
  opacity: 1;
}

@starting-style {
  .toast:popover-open {
    opacity: 0;
  }
}

@keyframes pulse {
  to {
    opacity: 0.45;
  }
}

/* Pohyb jen pro ty, kdo omezení nezapnuli. */
@media (prefers-reduced-motion: no-preference) {
  .spinner {
    animation: spin 1s steps(12) infinite;
  }

  .toast {
    translate: 0 1.5rem;
    transition:
      opacity 300ms ease-out,
      translate 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
      display 300ms allow-discrete,
      overlay 300ms allow-discrete;
  }

  .toast:popover-open {
    translate: 0 0;
  }

  @starting-style {
    .toast:popover-open {
      translate: 0 1.5rem;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```
