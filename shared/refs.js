// Reference na výklad, pojmy v textu a id položek opakování (kontrakt kap. 2.8–2.10).
// Běží v Node i v prohlížeči. Kotvy nadpisů mají jedinou implementaci v anchors.js,
// tady se jen re-exportují, aby je parser, verify i UI braly z jednoho místa.
//
//   parseRef('js-pole/co-je-pole#kopie-pole')
//     → { sectionId: 'js-pole', moduleId: 'js-pole/co-je-pole', stepId: null, anchor: 'kopie-pole' }
//   refHref('js-pole/co-je-pole#kopie-pole')      → '#/modul/js-pole/co-je-pole?kotva=kopie-pole'
//   findTermRefs('Viz [[hlavní osa|hlavní ose]].') → [{ term: 'hlavní osa', text: 'hlavní ose', … }]
//   parseItemId('q:js-pole/kviz#1b4f0e98')         → { type: 'q', target: 'js-pole/kviz', key: '1b4f0e98' }
export { headingAnchor, collectHeadings } from './anchors.js';

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const REF_PATTERN = new RegExp(`^(${SLUG})/(${SLUG})(?:/(\\d{3}))?(?:#(${SLUG}))?$`);

/**
 * Rozebere referenci `sekce/modul[/krok][#kotva]`.
 * @returns {{ sectionId: string, moduleId: string, stepId: string|null, anchor: string|null } | null}
 *   null = neplatný zápis
 */
export function parseRef(ref) {
  if (typeof ref !== 'string') return null;
  const match = ref.trim().match(REF_PATTERN);
  if (!match) return null;
  const [, section, module, step, anchor] = match;
  const moduleId = `${section}/${module}`;
  return {
    sectionId: section,
    moduleId,
    stepId: step ? `${moduleId}/${step}` : null,
    anchor: anchor ?? null,
  };
}

/**
 * Adresa v UI pro referenci: `#/modul/<sekce>/<modul>[/<krok>]`, s kotvou `?kotva=<kotva>`.
 * Přijme text reference nebo výsledek parseRef. Neplatná reference → null.
 */
export function refHref(ref) {
  const parsed = typeof ref === 'string' ? parseRef(ref) : ref;
  if (!parsed?.moduleId) return null;
  const path = `#/modul/${parsed.stepId ?? parsed.moduleId}`;
  return parsed.anchor ? `${path}?kotva=${parsed.anchor}` : path;
}

/** Klíč pro vyhledání pojmu: NFC, malá písmena, bílé znaky sloučené. */
export function termLookupKey(text) {
  return String(text ?? '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Projde řádky markdownu mimo bloky kódu a u každého řádku zavolá `visit(line, lineIndex, offset)`
 * s textem, ve kterém je inline kód nahrazený mezerami (délka i pozice znaků zůstanou).
 */
function forEachProseLine(markdown, visit) {
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  let fence = null;
  let offset = 0;
  lines.forEach((line, lineIndex) => {
    const lineOffset = offset;
    offset += line.length + 1;
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length && line.trim() === fenceMatch[1]) fence = null;
      return;
    }
    if (fenceMatch) {
      fence = fenceMatch[1];
      return;
    }
    const masked = line.replace(/(`+)([\s\S]*?)\1/g, (code) => ' '.repeat(code.length));
    visit(masked, lineIndex, lineOffset);
  });
}

/**
 * Pojmy v textu: `[[pojem]]` a `[[pojem|zobrazený text]]` mimo bloky kódu a inline kód.
 * @returns {{ term: string, text: string, raw: string, line: number, index: number }[]}
 *   line = 1-based řádek, index = pozice `[[` v původním textu
 */
export function findTermRefs(markdown) {
  const found = [];
  const source = String(markdown ?? '');
  forEachProseLine(source, (line, lineIndex, lineOffset) => {
    for (const match of line.matchAll(/\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g)) {
      const index = lineOffset + match.index;
      const term = match[1].trim();
      found.push({
        term,
        text: (match[2] ?? match[1]).trim(),
        raw: source.slice(index, index + match[0].length),
        line: lineIndex + 1,
        index,
      });
    }
  });
  return found;
}

/**
 * Odkazy na výklad v markdownu: `[text](see:<ref>)` mimo bloky kódu a inline kód.
 * @returns {{ ref: string, text: string, line: number, index: number }[]}
 */
export function findSeeLinks(markdown) {
  const found = [];
  forEachProseLine(markdown, (line, lineIndex, lineOffset) => {
    for (const match of line.matchAll(/\[([^\]]*)\]\(see:([^)\s]*)\)/g)) {
      found.push({ ref: match[2], text: match[1], line: lineIndex + 1, index: lineOffset + match.index });
    }
  });
  return found;
}

// ---------------------------------------------------------------------------
// Id položek opakování a pokusů (kap. 2.10)
// ---------------------------------------------------------------------------

const ITEM_TYPES = {
  // typ: [povolené hloubky cíle (počet částí oddělených /), je klíč povinný]
  q: { depths: [2], key: true },
  card: { depths: [1], key: true },
  step: { depths: [2, 3], key: false },
  explain: { depths: [2, 3], key: true },
  outcome: { depths: [1], key: true },
};
const ITEM_PATTERN = new RegExp(`^([a-z]+):(${SLUG}(?:/${SLUG})?(?:/\\d{3})?)(?:#([0-9a-f]{8}(?:-[0-9]+)?))?$`);

/**
 * @returns {{ type: 'q'|'card'|'step'|'explain'|'outcome', target: string, key: string|null } | null}
 */
export function parseItemId(id) {
  if (typeof id !== 'string') return null;
  const match = id.match(ITEM_PATTERN);
  if (!match) return null;
  const [, type, target, key] = match;
  const rule = ITEM_TYPES[type];
  if (!rule) return null;
  const parts = target.split('/');
  if (!rule.depths.includes(parts.length)) return null;
  // Třetí část je vždy číslo kroku, druhá (modul) nikdy.
  if (parts.length === 3 && !/^\d{3}$/.test(parts[2])) return null;
  if (parts.length >= 2 && /^\d{3}$/.test(parts[1])) return null;
  if (rule.key !== Boolean(key)) return null;
  return { type, target, key: key ?? null };
}

/** Cíl položky (sekce, modul nebo krok), ke kterému id patří; neplatné id → null. */
export function itemTarget(id) {
  return parseItemId(id)?.target ?? null;
}
