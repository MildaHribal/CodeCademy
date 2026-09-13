// Porovnání psaných odpovědí a stabilní klíče položek (kontrakt kap. 2.8 a 4.2).
// Běží v Node i v prohlížeči — kvíz, :::check, karty i verify volají tytéž funkce,
// aby se „správně" v aplikaci a ve verify nikdy nerozcházelo.
//
//   normalizeAnswer('[ 1,2 ];')                   → '[1,2]'
//   normalizeCss('gap: 1REM; display:flex')        → 'display:flex;gap:1rem'
//   checkTextAnswer({ type: 'text', expected: '-1', accept: [] }, ' -1 ')   → true
//   hashKey('Co vypíše poslední řádek?')           → '8 hexa číslic'

/** Všechny bílé znaky (mezery, tabulátory, nové řádky) sloučí do jedné mezery a ořízne. */
export function normalizeWhitespace(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

/**
 * Tvar odpovědi, ve kterém se porovnává: bez okrajových mezer a koncových `;` na řádcích,
 * bez prázdných řádků, `"` = `'`, víc mezer = jedna, bez mezer kolem interpunkce.
 * Řádky zůstávají řádky a slova se nespojují (`hello world` ≠ `helloworld`).
 */
export function normalizeAnswer(text, { ignoreCase = false } = {}) {
  let s = String(text ?? '').replace(/\r\n?/g, '\n');
  s = s.split('\n')
    .map((line) => line.trim().replace(/;+$/, '').trimEnd()) // koncový ; na řádku
    .filter((line) => line !== '')
    .join('\n');
  s = s.replace(/"/g, "'"); // " a ' jsou totéž
  s = s.replace(/[ \t]+/g, ' '); // víc mezer = jedna
  s = s.replace(/ ?([^\p{L}\p{N}_$' \n]) ?/gu, '$1'); // mezery kolem interpunkce pryč
  return ignoreCase ? s.toLowerCase() : s;
}

/** Malá písmena všude kromě obsahu v uvozovkách (po normalizeAnswer jsou všechny uvozovky '). */
function lowerCaseOutsideQuotes(text) {
  return text
    .split(/('[^']*')/)
    .map((part, index) => (index % 2 === 1 ? part : part.toLowerCase()))
    .join('');
}

/**
 * Deklarace CSS v porovnatelném tvaru: `vlastnost:hodnota` malými písmeny (obsah uvozovek
 * zůstává), seřazené a spojené `;` — na pořadí deklarací nezáleží.
 */
export function normalizeCss(text) {
  return String(text ?? '')
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration !== '')
    .map((declaration) => {
      const colon = declaration.indexOf(':');
      if (colon === -1) return lowerCaseOutsideQuotes(normalizeAnswer(declaration));
      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = lowerCaseOutsideQuotes(normalizeAnswer(declaration.slice(colon + 1)));
      return `${property}:${value}`;
    })
    .sort()
    .join(';');
}

/**
 * Je psaná odpověď správná? `question` je psaná otázka (kap. 4.4) nebo karta `output`/`css`
 * (kap. 2.5): porovná se s `expected` a každým tvarem z `accept`.
 * @returns {boolean}
 */
export function checkTextAnswer(question, input) {
  const forms = [question?.expected, ...(question?.accept ?? [])].filter((form) => typeof form === 'string');
  const normalize = question?.type === 'css'
    ? (text) => normalizeCss(text)
    : (text) => normalizeAnswer(text, { ignoreCase: Boolean(question?.ignoreCase) });
  const answer = normalize(input);
  return forms.some((form) => normalize(form) === answer);
}

/**
 * Stabilní klíč položky (otázky, karty, bodu checklistu, výstupu sekce):
 * FNV-1a 32 bit nad UTF-8 bajty textu po normalizeWhitespace, jako 8 malých hexa číslic.
 */
export function hashKey(text) {
  let h = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(normalizeWhitespace(text))) {
    h ^= byte;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * Přidělovač klíčů pro jeden soubor: stejný text podruhé dostane `-2`, potřetí `-3`
 * (kontrakt kap. 2.8). Verify pozná duplicitu podle přípony.
 *
 *   const nextKey = createKeyAllocator();
 *   nextKey('Otázka'); nextKey('Otázka')   → 'abcd1234', 'abcd1234-2'
 */
export function createKeyAllocator() {
  const seen = new Map();
  return (text) => {
    const base = hashKey(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}
