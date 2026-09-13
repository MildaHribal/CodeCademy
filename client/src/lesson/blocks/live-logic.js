// Výpočty pro živé ukázky bez DOM: ovládací prvky (```controls), porovnání :::compare
// a výstup předpovědi. Soubor nesahá na document, testuje se v Node
// (tools/lesson-blocks-unit.test.js).

const STYLES_FILE = 'styles.css';

/**
 * Hodnota ovládacího prvku tak, jak půjde do CSS (kontrakt kap. 5.2):
 * range → `${číslo}${jednotka}`, select a toggle → zvolená možnost.
 */
export function controlCssValue(control, raw = control.default) {
  if (control.type === 'range') return `${Number(raw)}${control.unit ?? ''}`;
  return String(raw);
}

/** Výchozí hodnoty všech prvků jako custom properties: { '--gap': '1rem', … }. */
export function defaultControlValues(controls = []) {
  return Object.fromEntries(controls.map((control) => [control.name, controlCssValue(control)]));
}

/** `:root { --a: x; --b: y; }` — blok, který nastaví hodnoty prvků pro běh bez ovládání. */
export function cssVariablesPrelude(values) {
  const declarations = Object.entries(values).map(([name, value]) => `${name}: ${value};`);
  return declarations.length ? `:root { ${declarations.join(' ')} }\n` : '';
}

/**
 * Soubory pro náhled: na začátek styles.css předřadí `:root { … }` s hodnotami prvků
 * (soubor vznikne, když chybí). Soubory v editoru zůstanou beze změny.
 */
export function withVariablesPrelude(files, values) {
  const prelude = cssVariablesPrelude(values);
  if (!prelude) return files;
  const hasStyles = files.some((file) => file.name === STYLES_FILE);
  if (!hasStyles) return [...files, { name: STYLES_FILE, lang: 'css', content: prelude }];
  return files.map((file) => (file.name === STYLES_FILE ? { ...file, content: prelude + file.content } : file));
}

const VAR_CALL = /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,((?:[^()]|\([^()]*\))*))?\)/g;

/** Dosadí hodnoty do všech `var(--jméno)`; neznámé proměnné nechá být. */
export function resolveVariables(value, values) {
  return value.replace(VAR_CALL, (whole, name) => (name in values ? values[name] : whole));
}

/**
 * Deklarace ze styles.css, jejichž hodnota používá některý z ovládacích prvků, s dosazenou
 * hodnotou — UI je ukazuje vedle ovládání (`justify-content: center;`).
 * @returns {{ selector: string, property: string, value: string, resolved: string, names: string[] }[]}
 */
export function controlledDeclarations(css, values) {
  const names = Object.keys(values);
  if (!names.length) return [];
  const source = String(css ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  // Pravidla bez vnoření: selektor { deklarace }. U @media se vezme vnitřní pravidlo.
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  for (const match of source.matchAll(rule)) {
    const selector = match[1].trim().split('\n').pop().trim();
    for (const declaration of match[2].split(';')) {
      const colon = declaration.indexOf(':');
      if (colon === -1) continue;
      const property = declaration.slice(0, colon).trim();
      const value = declaration.slice(colon + 1).trim();
      if (!property) continue;
      const used = names.filter((name) => new RegExp(`var\\(\\s*${escapeRegExp(name)}(?![a-zA-Z0-9_-])`).test(value));
      if (!used.length) continue;
      out.push({ selector, property, value, resolved: resolveVariables(value, values), names: used });
    }
  }
  return out;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ——— :::compare ———

/**
 * Parser vrací u :::compare už sloučené soubory každé varianty (`společný + '\n' + variantní`).
 * Pro úpravu společného kódu je potřeba je zase rozdělit: společná část = shodné řádky
 * od začátku souboru v obou variantách, zbytek patří variantě.
 * @returns {{ common: File[], extras: File[][] }}  extras[i] = části varianty i (jen neprázdné)
 */
export function splitCompareVariants(variants) {
  const [a = [], b = []] = variants.map((variant) => variant.files ?? []);
  const names = [...new Set([...a, ...b].map((file) => file.name))];
  const common = [];
  const extras = [[], []];

  for (const name of names) {
    const fileA = a.find((file) => file.name === name);
    const fileB = b.find((file) => file.name === name);
    const lang = (fileA ?? fileB).lang;
    if (!fileA || !fileB) {
      // Soubor jen v jedné variantě je celý její.
      const index = fileA ? 0 : 1;
      extras[index].push({ name, lang, content: (fileA ?? fileB).content });
      continue;
    }
    const linesA = fileA.content.split('\n');
    const linesB = fileB.content.split('\n');
    let shared = 0;
    while (shared < linesA.length && shared < linesB.length && linesA[shared] === linesB[shared]) shared++;
    const commonContent = linesA.slice(0, shared).join('\n');
    if (shared > 0) common.push({ name, lang, content: commonContent });
    [linesA, linesB].forEach((lines, index) => {
      const rest = lines.slice(shared).join('\n');
      if (shared < lines.length) extras[index].push({ name, lang, content: rest });
    });
  }
  return { common, extras };
}

/** Složí soubory varianty ze společné části a části varianty (opak splitCompareVariants). */
export function composeVariant(common, extra) {
  const names = [...new Set([...common, ...extra].map((file) => file.name))];
  return names.map((name) => {
    const shared = common.find((file) => file.name === name);
    const own = extra.find((file) => file.name === name);
    const lang = (shared ?? own).lang;
    if (!own) return { name, lang, content: shared.content };
    if (!shared) return { name, lang, content: own.content };
    return { name, lang, content: `${shared.content}\n${own.content}` };
  });
}

// ——— Předpověď ———

/** Skutečný výstup ukázky js tak, jak ho porovnává verify (kontrakt kap. 5.3). */
export function consoleOutputText(entries) {
  return entries
    .filter((entry) => entry.level !== 'clear')
    .map((entry) => entry.text)
    .join('\n');
}
