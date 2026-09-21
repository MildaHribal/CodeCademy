/**
 * Pohyb na jednom místě. Komponenty neimportují knihovnu přímo, volají tyhle pomocníky —
 * délky a křivky jsou pak stejné v celé aplikaci a knihovnu jde vyměnit v jednom souboru.
 *
 * Pravidlo (viz styles/motion.css): pohyb odpovídá na akci uživatele a ukazuje, CO se
 * změnilo. Nic se nehýbe samo od sebe a nic se nehýbe při neúspěchu posměšně.
 * Při `prefers-reduced-motion: reduce` se všechno provede okamžitě, bez animace.
 */
import { animate, stagger } from 'motion';

export const motionAllowed = () =>
  typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches;

// Křivky: „vyjetí" pro věci, které přicházejí, pružina pro potvrzení.
const EASE_OUT = [0.22, 0.61, 0.36, 1];
const SPRING_POP = { type: 'spring', stiffness: 380, damping: 13, mass: 0.8 };

const FAST = 0.22;
const BASE = 0.45;

function run(target, keyframes, options) {
  if (!motionAllowed() || !target || (Array.isArray(target) && !target.length)) return null;
  try {
    return animate(target, keyframes, options);
  } catch {
    return null; // pohyb nikdy nesmí shodit funkci aplikace
  }
}

/**
 * Prvek se zpožděným příchodem nesmí do té doby svítit v cílovém stavu. Schová se hned
 * a po doběhnutí (nebo když animace nevznikne) se inline styl zase uklidí — stav v DOM
 * je tak správně okamžitě, zpožděný je jen vzhled.
 */
function delayed(el, delay, start) {
  if (!el) return null;
  if (delay > 0 && motionAllowed()) el.style.opacity = '0';
  const animation = start();
  const tidy = () => {
    el.style.opacity = '';
  };
  if (animation) animation.finished.then(tidy).catch(tidy);
  else tidy();
  return animation;
}

/** Potvrzení: prvek „doskočí" na místo (fajfka u splněného požadavku, razítko). */
export function popIn(el, { delay = 0 } = {}) {
  return delayed(el, delay, () => run(el, { scale: [0, 1], opacity: [0, 1] }, { ...SPRING_POP, delay }));
}

/** Klidný příchod bez doskoku (křížek u nesplněného požadavku, neutrální stavy). */
export function settleIn(el, { delay = 0 } = {}) {
  return delayed(el, delay, () => run(el, { opacity: [0, 1] }, { duration: FAST, ease: EASE_OUT, delay }));
}

/** Nový obsah přijde zdola o pár pixelů (hláška, tip, řádek konzole). */
export function riseIn(el, { delay = 0, distance = 14 } = {}) {
  return run(el, { opacity: [0, 1], y: [distance, 0] }, { duration: BASE, ease: EASE_OUT, delay });
}

/** Totéž pro seznam prvků, postupně po jednom. */
export function riseInEach(els, { step = 0.05, distance = 16 } = {}) {
  const list = [...els];
  return run(list, { opacity: [0, 1], y: [distance, 0] }, { duration: BASE, ease: EASE_OUT, delay: stagger(step) });
}

/** Plovoucí prvek (popover, nabídka) vyroste z místa, odkud se otevřel. */
export function growIn(el, { origin = 'top left' } = {}) {
  if (el) el.style.transformOrigin = origin;
  return run(el, { opacity: [0, 1], scale: [0.85, 1], y: [-6, 0] }, { type: 'spring', stiffness: 420, damping: 24 });
}

/** Rozbalení na přirozenou výšku (nápověda, detail chyby, tahák). */
export function expand(el) {
  if (!motionAllowed() || !el) return null;
  const height = el.getBoundingClientRect().height;
  if (!height) return null;
  el.style.overflow = 'clip';
  const animation = run(el, { height: [0, height], opacity: [0, 1] }, { duration: BASE, ease: EASE_OUT });
  animation?.finished.then(() => {
    el.style.height = '';
    el.style.overflow = '';
  }).catch(() => {});
  return animation;
}

/** Krátké upozornění na prvek, který se změnil (dílek pruhu, počitadlo). */
export function nudge(el) {
  return run(el, { scale: [1, 1.35, 1] }, { duration: 0.5, ease: EASE_OUT });
}

/** Zpoždění i-té položky při postupném vyhodnocení seznamu. */
export const sequenceDelay = (index, step = 0.13) => (motionAllowed() ? index * step : 0);

/** Úspěch: blok s výsledkem pružně „dosedne" — nejdůležitější okamžik aplikace má být vidět. */
export function springIn(el) {
  return run(el, { opacity: [0, 1], scale: [0.88, 1], y: [12, 0] }, { type: 'spring', stiffness: 300, damping: 16 });
}

/**
 * Příchod stránky: viditelné bloky přijdou kaskádou shora dolů. Animují se jednotlivé
 * bloky, ne celý list — `transform` na předkovi by rozhodil `position: fixed`
 * připnutého obsahu lekce, proto se slot `aside` vynechává.
 */
export function arrive(page) {
  if (!motionAllowed() || !page) return null;
  const candidates = [
    ...page.querySelectorAll(
      ':scope > *, .overview__head > *, .lesson > *, .module-list > *, .toc > .toc-part, .stats__list > *, .section-outcomes__list > *',
    ),
  ].filter((el) => !el.matches('[data-slot="aside"], [hidden], .slot') && el.getClientRects().length);
  const leaves = candidates.filter((el) => !candidates.some((other) => other !== el && el.contains(other)));
  const visible = leaves.filter((el) => el.getBoundingClientRect().top < innerHeight * 1.1).slice(0, 18);
  return riseInEach(visible, { step: 0.055, distance: 22 });
}
