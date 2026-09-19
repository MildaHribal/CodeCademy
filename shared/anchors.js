import { Lexer } from 'marked';

export const ANCHOR_LEVELS = [2, 3];
const FALLBACK_ANCHOR = 'oddil';

export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripHeadingMarkdown(text) {
  return String(text ?? '')
    .replace(/(`+)([\s\S]*?)\1/g, '$2')
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]/g, '');
}

export function headingAnchor(text) {
  return slugify(stripHeadingMarkdown(text)) || FALLBACK_ANCHOR;
}

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

export function extractHeadings(markdown) {
  return walkHeadings(Lexer.lex(String(markdown ?? ''), { gfm: true }), []);
}

export function anchoredHeadings(markdown, slugger) {
  return extractHeadings(markdown)
    .filter((heading) => ANCHOR_LEVELS.includes(heading.level))
    .map((heading) => ({ ...heading, anchor: slugger(heading.text) }));
}

export function collectHeadings(markdownTexts) {
  const slugger = createSlugger();
  return markdownTexts.flatMap((text) => anchoredHeadings(text, slugger));
}
