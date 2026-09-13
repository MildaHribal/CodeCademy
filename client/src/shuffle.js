// Deterministické míchání: stejný klíč dá vždy stejné pořadí.
// Odpovědi v kvízu se tak nepřeházejí při každém překreslení, a přesto
// správná odpověď není pořád na stejném místě jako v souboru.

/** Převede řetězec na 32bitové číslo (FNV-1a). */
function hashString(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Jednoduchý generátor pseudonáhodných čísel (mulberry32) — vrací čísla v [0, 1). */
function randomFrom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Vrátí novou zamíchanou kopii pole (Fisher–Yates) podle klíče. */
export function shuffleBy(key, items) {
  const random = randomFrom(hashString(key));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
