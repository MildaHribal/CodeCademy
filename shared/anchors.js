// Kotvy nadpisů lekcí (kontrakt kap. 2.8): stabilní id bez diakritiky, stejné na serveru
// (index obsahu, verify odkazů `see:`) i v klientovi (atribut id u nadpisu).
// Běží v Node i v prohlížeči. Jediná implementace — shared/refs.js ji jen re-exportuje.
//
//   headingAnchor('Kopie pole: `slice` vs. `[...a]`')   → 'kopie-pole-slice-vs-a'
//   const slug = createSlugger(); slug('Pasti'); slug('Pasti')   → 'pasti', 'pasti-2'
//   collectHeadings(['## Úvod\n\n### Pasti'])            → [{ level: 2, text: 'Úvod', anchor: 'uvod' }, { level: 3, … }]
import { Lexer } from 'marked';

/** Úrovně nadpisů, které dostávají kotvu (`#` titulek ne). */
export const ANCHOR_LEVELS = [2, 3];
const FALLBACK_ANCHOR = 'oddil';

/** Malá písmena bez diakritiky, jen a-z, 0-9 a pomlčky (bez pomlček na krajích). Prázdný text → ''. */
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Text nadpisu bez markdownu: `kód`, [odkaz](url), [[pojem|text]], [[pojem]], * a _. */
export function stripHeadingMarkdown(text) {
  return String(text ?? '')
    .replace(/(`+)([\s\S]*?)\1/g, '$2')
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]/g, '');
}

/** Kotva jednoho nadpisu (bez ohledu na ostatní nadpisy dokumentu). */
export function headingAnchor(text) {
  return slugify(stripHeadingMarkdown(text)) || FALLBACK_ANCHOR;
}

/**
 * Generátor kotev pro jeden dokument: kotva, která už v dokumentu je, dostane -2, -3…
 * (první volná přípona).
 */
export function createSlugger() {
  const used = new Set();
  return (text) => {
    const base = headingAnchor(text);
    let anchor = base;
    for (let n = 2; used.has(anchor); n++) anchor = `${base}-${n}`;
    used.add(anchor);
    return anchor;
  };
}

/** Id prvku nadpisu v DOM (kontrakt: id = kotva). */
export function anchorElementId(anchor) {
  return anchor;
}

function walkHeadings(tokens, out) {
  for (const token of tokens ?? []) {
    if (token.type === 'heading') out.push({ level: token.depth, text: token.text.trim() });
    else if (token.type === 'list') for (const item of token.items) walkHeadings(item.tokens, out);
    else if (token.tokens) walkHeadings(token.tokens, out);
  }
  return out;
}

/**
 * Všechny nadpisy markdownu v pořadí dokumentu (i v citaci a seznamu, ne v blocích kódu):
 * [{ level, text }] — text je surový inline markdown nadpisu.
 */
export function extractHeadings(markdown) {
  return walkHeadings(Lexer.lex(String(markdown ?? ''), { gfm: true }), []);
}

/** Nadpisy s kotvou (úroveň 2 a 3) jednoho markdown bloku; `slugger` sdílený pro celý dokument. */
export function anchoredHeadings(markdown, slugger) {
  return extractHeadings(markdown)
    .filter((heading) => ANCHOR_LEVELS.includes(heading.level))
    .map((heading) => ({ ...heading, anchor: slugger(heading.text) }));
}

/**
 * Kotvy nadpisů přes všechny `md` bloky lekce (kontrakt kap. 2.8).
 * @param {string[]} markdownTexts
 * @returns {{ level: number, text: string, anchor: string }[]}
 */
export function collectHeadings(markdownTexts) {
  const slugger = createSlugger();
  return markdownTexts.flatMap((text) => anchoredHeadings(text, slugger));
}
