// Markdown → HTML (marked) a obarvení bloků kódu stejným parserem, jaký používá editor.
// Obsah kurzu je lokální a důvěryhodný, proto se HTML z markdownu vkládá přímo.
// Texty ze serveru nebo z uživatelova kódu (chyby testů, výstupy) se vkládají
// vždy přes textContent, nikdy přes markdown.

import { marked } from 'marked';
import { highlightCode, classHighlighter } from '@lezer/highlight';
import { htmlLanguage } from '@codemirror/lang-html';
import { cssLanguage } from '@codemirror/lang-css';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { ANCHOR_LEVELS, anchorElementId, anchoredHeadings } from '../../shared/anchors.js';

marked.use({ gfm: true, breaks: false });

const PARSERS = {
  html: htmlLanguage.parser,
  vue: htmlLanguage.parser,
  css: cssLanguage.parser,
  js: javascriptLanguage.parser,
  javascript: javascriptLanguage.parser,
  json: javascriptLanguage.parser,
  mjs: javascriptLanguage.parser,
};

/**
 * Vyrenderuje markdown do nového prvku (výchozí <div class="prose">).
 * `slugger` (createSlugger ze shared/anchors.js, jeden na dokument) dá nadpisům úrovně 2 a 3
 * kotvy: id = kotva, data-anchor = kotva — stejné kotvy jako parser a index obsahu (kontrakt kap. 2.8).
 */
export function renderMarkdown(text, { tag = 'div', className = 'prose', inline = false, slugger = null } = {}) {
  const el = document.createElement(tag);
  el.className = className;
  el.innerHTML = inline ? marked.parseInline(text ?? '') : marked.parse(text ?? '');
  enhance(el);
  if (slugger && !inline) addHeadingAnchors(el, text ?? '', slugger);
  return el;
}

function addHeadingAnchors(root, text, slugger) {
  const selector = ANCHOR_LEVELS.map((level) => `h${level}`).join(', ');
  const elements = [...root.querySelectorAll(selector)];
  const headings = anchoredHeadings(text, slugger);
  // Nadpis zapsaný přímo v HTML parser nevidí — pak počty nesedí a kotvy se nepřiřadí.
  if (headings.length !== elements.length) return;
  elements.forEach((element, index) => {
    element.id = anchorElementId(headings[index].anchor);
    element.dataset.anchor = headings[index].anchor;
  });
}

function enhance(root) {
  for (const code of root.querySelectorAll('pre > code')) {
    const lang = [...code.classList].find((c) => c.startsWith('language-'))?.slice('language-'.length);
    const parser = PARSERS[lang];
    if (parser) highlightInto(code, parser);
    code.parentElement.classList.add('code-block');
    if (lang) code.parentElement.dataset.lang = lang;
  }
  // Odkazy mimo aplikaci otevírat v nové kartě, ať uživatel neztratí rozdělanou práci.
  for (const link of root.querySelectorAll('a[href]')) {
    if (/^https?:/.test(link.getAttribute('href'))) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  }
}

/** Obarví blok kódu: rozdělí text na úseky se třídami tok-* (styly v styles/prose.css). */
function highlightInto(codeEl, parser) {
  const source = codeEl.textContent;
  const fragment = document.createDocumentFragment();
  const putText = (text, classes) => {
    if (!classes) {
      fragment.append(text);
      return;
    }
    const span = document.createElement('span');
    span.className = classes;
    span.textContent = text;
    fragment.append(span);
  };
  const putBreak = () => fragment.append('\n');
  try {
    highlightCode(source, parser.parse(source), classHighlighter, putText, putBreak);
    codeEl.replaceChildren(fragment);
  } catch {
    // Když se obarvení nepovede, zůstane čistý text — obsah je důležitější než barvy.
  }
}
