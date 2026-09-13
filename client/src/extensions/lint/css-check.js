// Neplatné CSS deklarace a návrh opravy („`gap: 24` — chybí jednotka?", „myslel jsi `center`?").
// Platnost ověřuje prohlížeč (`CSS.supports`), sem se předává jako funkce `supports`,
// takže logika jde testovat v Node s náhradní funkcí.
import { scanCss } from './css-scan.js';

// @pravidla, uvnitř kterých jsou jiné „vlastnosti" než v běžném pravidle (src, font-display…).
const SPECIAL_AT_RULES = /^@(font-face|page|property|counter-style|font-feature-values|font-palette-values|view-transition|position-try)\b/i;

// Časté vlastnosti, které CSS.supports neumí vyjmenovat (zkratky) — pro návrh při překlepu.
export const COMMON_PROPERTIES = [
  'align-content', 'align-items', 'align-self', 'animation', 'aspect-ratio', 'background', 'background-color',
  'background-image', 'background-position', 'background-repeat', 'background-size', 'border', 'border-bottom',
  'border-collapse', 'border-color', 'border-left', 'border-radius', 'border-right', 'border-style', 'border-top',
  'border-width', 'bottom', 'box-shadow', 'box-sizing', 'color', 'column-gap', 'content', 'cursor', 'display',
  'filter', 'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap', 'float',
  'font', 'font-family', 'font-size', 'font-style', 'font-weight', 'gap', 'grid', 'grid-area', 'grid-auto-flow',
  'grid-column', 'grid-row', 'grid-template-areas', 'grid-template-columns', 'grid-template-rows', 'height', 'inset',
  'justify-content', 'justify-items', 'justify-self', 'left', 'letter-spacing', 'line-height', 'list-style', 'margin',
  'margin-block', 'margin-bottom', 'margin-inline', 'margin-left', 'margin-right', 'margin-top', 'max-height',
  'max-width', 'min-height', 'min-width', 'object-fit', 'opacity', 'order', 'outline', 'overflow', 'overflow-x',
  'overflow-y', 'padding', 'padding-block', 'padding-bottom', 'padding-inline', 'padding-left', 'padding-right',
  'padding-top', 'place-content', 'place-items', 'pointer-events', 'position', 'right', 'row-gap', 'text-align',
  'text-decoration', 'text-overflow', 'text-transform', 'top', 'transform', 'transition', 'user-select',
  'vertical-align', 'visibility', 'white-space', 'width', 'word-break', 'z-index',
];

// Klíčová slova častých vlastností — kandidáti pro „myslel jsi…?".
export const KEYWORDS = {
  display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none', 'contents', 'flow-root', 'table'],
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  'justify-content': ['flex-start', 'flex-end', 'start', 'end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch', 'normal'],
  'align-items': ['flex-start', 'flex-end', 'start', 'end', 'center', 'baseline', 'stretch', 'normal'],
  'align-content': ['flex-start', 'flex-end', 'start', 'end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch', 'normal'],
  'align-self': ['auto', 'flex-start', 'flex-end', 'start', 'end', 'center', 'baseline', 'stretch'],
  'justify-items': ['start', 'end', 'center', 'stretch', 'normal'],
  'justify-self': ['auto', 'start', 'end', 'center', 'stretch'],
  'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
  'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
  'text-align': ['left', 'right', 'center', 'justify', 'start', 'end'],
  'font-weight': ['normal', 'bold', 'bolder', 'lighter'],
  'font-style': ['normal', 'italic', 'oblique'],
  'box-sizing': ['content-box', 'border-box'],
  overflow: ['visible', 'hidden', 'clip', 'scroll', 'auto'],
  visibility: ['visible', 'hidden', 'collapse'],
  'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'],
  'text-transform': ['none', 'capitalize', 'uppercase', 'lowercase'],
  'text-decoration': ['none', 'underline', 'overline', 'line-through'],
  cursor: ['auto', 'default', 'pointer', 'text', 'move', 'not-allowed', 'grab', 'help', 'wait'],
  float: ['left', 'right', 'none', 'inline-start', 'inline-end'],
  'object-fit': ['fill', 'contain', 'cover', 'none', 'scale-down'],
  'border-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
  'list-style': ['none', 'disc', 'circle', 'square', 'decimal', 'inside', 'outside'],
  'grid-auto-flow': ['row', 'column', 'dense', 'row dense', 'column dense'],
  'pointer-events': ['auto', 'none'],
};

const NUMBER = /^-?(\d+|\d*\.\d+)$/;
const NUMBER_WITH_UNIT = /^(-?(?:\d+|\d*\.\d+))\s*([a-z%]+)$/i;

/**
 * @param {string} text  obsah CSS souboru
 * @param {{ supports: (property: string, value: string) => boolean, knownProperties?: string[] }} options
 * @returns {Array<{ from: number, to: number, severity: 'warning', message: string, hint: string | null }>}
 *   message = česká věta s `inline kódem`, hint = návrh opravy (nebo null)
 */
export function findInvalidDeclarations(text, { supports, knownProperties = COMMON_PROPERTIES }) {
  const problems = [];
  for (const declaration of scanCss(text)) {
    if (declaration.atRules.some((header) => SPECIAL_AT_RULES.test(header))) continue;
    const problem = checkDeclaration(declaration, { supports, knownProperties });
    if (problem) problems.push({ from: declaration.from, to: declaration.to, severity: 'warning', ...problem });
  }
  return problems;
}

/** @returns {null | { message: string, hint: string | null }} */
export function checkDeclaration({ property, value }, { supports, knownProperties = COMMON_PROPERTIES }) {
  const name = property.toLowerCase();
  if (name.startsWith('--') || /^-(webkit|moz|ms|o)-/.test(name)) return null;

  if (!safeSupports(supports, name, 'inherit')) {
    const suggestion = closest(name, knownProperties.filter((candidate) => safeSupports(supports, candidate, 'inherit')));
    return {
      message: `Vlastnost \`${property}\` prohlížeč nezná — deklarace se ignoruje.`,
      hint: suggestion ? `Myslel jsi \`${suggestion}\`?` : null,
    };
  }

  const cleanValue = value.replace(/\s*!\s*important\s*$/i, '').trim();
  if (cleanValue === '' || /\b(var|env|attr)\(/i.test(cleanValue)) {
    return cleanValue === '' ? { message: `Vlastnost \`${property}\` nemá hodnotu.`, hint: null } : null;
  }
  if (safeSupports(supports, name, cleanValue)) return null;

  return { message: `Hodnotu \`${shorten(cleanValue)}\` prohlížeč u \`${property}\` nepřijme — deklarace se ignoruje.`, hint: suggestFix(name, cleanValue, supports) };
}

function suggestFix(name, value, supports) {
  // Chybějící středník: hodnota pokračuje na dalším řádku další deklarací.
  if (/[\n;]|:\s*\S/.test(value)) {
    const firstPart = value.split(/\n|;/)[0].trim();
    if (firstPart && safeSupports(supports, name, firstPart)) return 'Chybí středník `;` na konci řádku?';
  }
  if (NUMBER.test(value) && value !== '0' && safeSupports(supports, name, `${value}px`)) {
    return `Chybí jednotka? Třeba \`${value}px\` nebo \`${value}rem\`.`;
  }
  const withUnit = NUMBER_WITH_UNIT.exec(value);
  if (withUnit) {
    const [, number, unit] = withUnit;
    if (/\s/.test(value) && safeSupports(supports, name, `${number}${unit}`)) return `Mezi číslem a jednotkou nesmí být mezera: \`${number}${unit}\`.`;
    if (safeSupports(supports, name, number)) return `Tahle vlastnost se píše bez jednotky: \`${number}\`.`;
  }
  if (/^[a-z-]+$/i.test(value)) {
    const candidates = (KEYWORDS[name] ?? []).filter((keyword) => safeSupports(supports, name, keyword));
    const suggestion = closest(value.toLowerCase(), candidates);
    if (suggestion) return `Myslel jsi \`${suggestion}\`?`;
  }
  if (/^["'].*["']$/.test(value) && safeSupports(supports, name, value.slice(1, -1))) {
    return `Hodnota se píše bez uvozovek: \`${value.slice(1, -1)}\`.`;
  }
  return null;
}

function safeSupports(supports, property, value) {
  try {
    return Boolean(supports(property, value));
  } catch {
    return false;
  }
}

function shorten(text, max = 40) {
  const flat = text.replace(/\s+/g, ' ');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** Nejbližší kandidát podle počtu úprav (nejvýš 2, u dlouhých slov 3), jinak null. */
export function closest(word, candidates) {
  let best = null;
  let bestDistance = Infinity;
  const limit = word.length > 8 ? 3 : 2;
  for (const candidate of candidates) {
    const distance = editDistance(word, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return bestDistance > 0 && bestDistance <= limit ? best : null;
}

/** Levenshteinova vzdálenost (vložení, smazání, záměna). */
export function editDistance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[b.length];
}
