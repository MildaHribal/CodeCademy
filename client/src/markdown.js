// Markdown → HTML (marked) a obarvení bloků kódu stejným parserem, jaký používá editor.
// Obsah kurzu je lokální a důvěryhodný, proto se HTML z markdownu vkládá přímo.
// Texty ze serveru nebo z uživatelova kódu (chyby testů, výstupy) se vkládají
// vždy přes textContent, nikdy přes markdown.
//
// Navíc proti běžnému markdownu (kontrakt kap. 2.6, 2.9 a 5.11):
//   > [!REMEMBER] / [!PITFALL] / [!TIP] / [!NOTE]   rámečky ve stylu GitHub alerts
//   ==zvýraznění==                                   podbarvení jako zvýrazňovač
//   [[pojem]] a [[pojem|text]]                        pojem s definicí v bublině (GET /api/terms)
//   [text](see:sekce/modul#kotva)                     odkaz na výklad přes refHref

import { Marked } from 'marked';
import { highlightCode, classHighlighter } from '@lezer/highlight';
import { htmlLanguage } from '@codemirror/lang-html';
import { cssLanguage } from '@codemirror/lang-css';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { ANCHOR_LEVELS, anchorElementId, anchoredHeadings } from '../../shared/anchors.js';
import { parseRef, refHref, termLookupKey } from '../../shared/refs.js';
import { apiRequest } from './api-request.js';

const PARSERS = {
  html: htmlLanguage.parser,
  vue: htmlLanguage.parser,
  css: cssLanguage.parser,
  js: javascriptLanguage.parser,
  javascript: javascriptLanguage.parser,
  json: javascriptLanguage.parser,
  mjs: javascriptLanguage.parser,
};

// ——— Rámečky ———

const stroke = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Typy rámečků: nadpis v UI a ikona (SVG, viewBox 0 0 16 16). Barvy jsou tokeny --callout-<typ>-*. */
export const CALLOUT_TYPES = {
  remember: { title: 'Zapamatuj si', icon: stroke('M4.5 2.5h7v11L8 10.9l-3.5 2.6z') },
  pitfall: {
    title: 'Pozor, past',
    icon: stroke('M8 2.3l6 10.9H2z') + stroke('M8 6.6v3') + '<circle cx="8" cy="11.4" r="0.9" fill="currentColor"/>',
  },
  tip: {
    title: 'Tip',
    icon: stroke('M6.2 12.4h3.6M6.7 14.2h2.6') + stroke('M8 1.9a4.1 4.1 0 0 0-2.3 7.5c.5.4.8.9.8 1.5h3c0-.6.3-1.1.8-1.5A4.1 4.1 0 0 0 8 1.9z'),
  },
  note: {
    title: 'Poznámka',
    icon: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.7"/>' + stroke('M8 7.3v3.9') + '<circle cx="8" cy="4.9" r="0.9" fill="currentColor"/>',
  },
};

const CALLOUT_START = /^ {0,3}>[ \t]?\[!([A-Za-z]+)\][ \t]*([^\n]*)(?:\n|$)/;
const QUOTE_LINE = /^ {0,3}>[ \t]?([^\n]*)(?:\n|$)/;

const calloutExtension = {
  name: 'callout',
  level: 'block',
  start: (src) => src.match(/^ {0,3}>[ \t]?\[!/m)?.index,
  tokenizer(src) {
    const first = CALLOUT_START.exec(src);
    if (!first) return undefined;
    const type = first[1].toLowerCase();
    // Neznámý typ zůstane obyčejnou citací (verify hlásí [M1]).
    if (!CALLOUT_TYPES[type]) return undefined;
    let raw = first[0];
    const body = [];
    let rest = src.slice(raw.length);
    for (let line = QUOTE_LINE.exec(rest); line; line = QUOTE_LINE.exec(rest)) {
      raw += line[0];
      body.push(line[1]);
      rest = rest.slice(line[0].length);
    }
    const token = { type: 'callout', raw, calloutType: type, title: first[2].trim(), tokens: [], titleTokens: [] };
    this.lexer.blockTokens(body.join('\n'), token.tokens);
    if (token.title) this.lexer.inline(token.title, token.titleTokens);
    return token;
  },
  renderer(token) {
    const type = CALLOUT_TYPES[token.calloutType];
    const title = token.title ? this.parser.parseInline(token.titleTokens) : type.title;
    return (
      `<aside class="callout callout--${token.calloutType}" data-callout="${token.calloutType}">` +
      `<p class="callout__title"><svg class="icon callout__icon" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">${type.icon}</svg>` +
      `<span>${title}</span></p>` +
      `<div class="callout__body">${this.parser.parse(token.tokens)}</div></aside>\n`
    );
  },
};

// ——— ==zvýraznění== ———

const markExtension = {
  name: 'mark',
  level: 'inline',
  start: (src) => src.indexOf('=='),
  tokenizer(src) {
    // Obsah nezačíná ani nekončí mezerou nebo `=`, takže `a === b` v textu zvýraznění nevyrobí.
    const match = /^==([^\s=](?:[^=\n]*[^\s=])?)==(?!=)/.exec(src);
    if (!match) return undefined;
    return { type: 'mark', raw: match[0], tokens: this.lexer.inlineTokens(match[1]) };
  },
  renderer(token) {
    return `<mark class="mark">${this.parser.parseInline(token.tokens)}</mark>`;
  },
};

// ——— [[pojem|text]] ———

const termExtension = {
  name: 'term',
  level: 'inline',
  start: (src) => src.indexOf('[['),
  tokenizer(src) {
    const match = /^\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/.exec(src);
    if (!match) return undefined;
    const target = match[1].trim();
    const label = (match[2] ?? match[1]).trim();
    return { type: 'term', raw: match[0], target, tokens: this.lexer.inlineTokens(label) };
  },
  renderer(token) {
    return `<span class="term" data-term="${escapeAttribute(termLookupKey(token.target))}">${this.parser.parseInline(token.tokens)}</span>`;
  },
};

function escapeAttribute(text) {
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const markdown = new Marked({ gfm: true, breaks: false, extensions: [calloutExtension, markExtension, termExtension] });

/** Markdown → HTML řetězec (bez obarvení kódu a bez pojmů). Používají ho i testy v Node. */
export function markdownToHtml(text, { inline = false } = {}) {
  return inline ? markdown.parseInline(text ?? '') : markdown.parse(text ?? '');
}

/**
 * Vyrenderuje markdown do nového prvku (výchozí <div class="prose">).
 * `slugger` (createSlugger ze shared/anchors.js, jeden na dokument) dá nadpisům úrovně 2 a 3
 * kotvy: id = kotva, data-anchor = kotva — stejné kotvy jako parser a index obsahu (kontrakt kap. 2.8).
 */
export function renderMarkdown(text, { tag = 'div', className = 'prose', inline = false, slugger = null } = {}) {
  const el = document.createElement(tag);
  el.className = className;
  el.innerHTML = markdownToHtml(text, { inline });
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
  for (const link of root.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (/^https?:/.test(href)) {
      // Odkazy mimo aplikaci otevírat v nové kartě, ať uživatel neztratí rozdělanou práci.
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else if (href.startsWith('see:')) {
      linkToLesson(link, safeDecode(href.slice('see:'.length)));
    }
  }
  const terms = root.querySelectorAll('.term[data-term]');
  if (terms.length) connectTerms([...terms]);
}

function safeDecode(text) {
  try {
    return decodeURI(text);
  } catch {
    return text;
  }
}

/** Odkaz `see:` → adresa v aplikaci (kontrakt kap. 2.9). Neplatná reference zůstane jen textem. */
function linkToLesson(link, ref) {
  if (!parseRef(ref)) {
    link.removeAttribute('href');
    link.classList.add('see-link', 'see-link--broken');
    return;
  }
  link.setAttribute('href', refHref(ref));
  link.classList.add('see-link');
}

/**
 * Obarvený kód rozdělený na řádky (pro výpisy s čísly řádků, např. :::memory).
 * @returns {DocumentFragment[]}  jeden fragment na řádek
 */
export function highlightLines(source, lang) {
  const lines = [document.createDocumentFragment()];
  const parser = PARSERS[lang];
  const putText = (text, classes) => {
    const target = lines[lines.length - 1];
    if (!classes) return target.append(text);
    const span = document.createElement('span');
    span.className = classes;
    span.textContent = text;
    target.append(span);
  };
  const putBreak = () => lines.push(document.createDocumentFragment());
  try {
    if (!parser) throw new Error('bez obarvení');
    highlightCode(source, parser.parse(source), classHighlighter, putText, putBreak);
  } catch {
    return source.split('\n').map((line) => {
      const fragment = document.createDocumentFragment();
      fragment.append(line);
      return fragment;
    });
  }
  return lines;
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

// ——— Pojmy: načtení a bublina s definicí ———

let termsPromise = null;

/** Mapa termLookupKey(pojem nebo alias) → pojem. Načte se jednou za běh aplikace. */
export function loadTermIndex() {
  termsPromise ??= apiRequest('GET', '/api/terms')
    .then(({ terms = [] }) => {
      const index = new Map();
      for (const term of terms) {
        for (const name of [term.term, ...(term.aliases ?? [])]) {
          const key = termLookupKey(name);
          if (!index.has(key)) index.set(key, term);
        }
      }
      return index;
    })
    .catch((error) => {
      termsPromise = null; // příště to zkusíme znovu
      console.warn('Pojmy se nepodařilo načíst', error);
      return new Map();
    });
  return termsPromise;
}

async function connectTerms(elements) {
  const index = await loadTermIndex();
  for (const element of elements) {
    if (!element.isConnected && !element.parentNode) continue;
    const term = index.get(element.dataset.term);
    if (!term) {
      // Neexistující pojem: jen zobrazený text (verify hlásí [S5]).
      element.replaceWith(...element.childNodes);
      continue;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'term';
    button.dataset.term = element.dataset.term;
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.title = `Pojem: ${term.term}`;
    button.append(...element.childNodes);
    element.replaceWith(button);
    attachTermPopover(button, term);
  }
}

const HOVER_OPEN_MS = 350;
const HOVER_CLOSE_MS = 200;
let popover = null; // { element, owner, pinned }
let hoverTimer = null;

function attachTermPopover(button, term) {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (popover?.owner === button && popover.pinned) closeTermPopover({ restoreFocus: false });
    else openTermPopover(button, term, { pinned: true });
  });
  button.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimer);
    if (popover?.owner === button) return;
    hoverTimer = setTimeout(() => openTermPopover(button, term, { pinned: false }), HOVER_OPEN_MS);
  });
  button.addEventListener('mouseleave', scheduleHoverClose);
}

function scheduleHoverClose() {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (popover && !popover.pinned && !popover.element.matches(':hover')) closeTermPopover({ restoreFocus: false });
  }, HOVER_CLOSE_MS);
}

function openTermPopover(button, term, { pinned }) {
  closeTermPopover({ restoreFocus: false });
  const element = document.createElement('div');
  element.className = 'term-popover';
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', `Pojem ${term.term}`);
  element.tabIndex = -1;
  element.id = 'term-popover';

  const title = document.createElement('p');
  title.className = 'term-popover__title';
  title.textContent = term.term;
  element.append(title);
  if (term.en) {
    const en = document.createElement('p');
    en.className = 'term-popover__en';
    en.textContent = `anglicky ${term.en}`;
    element.append(en);
  }
  element.append(renderMarkdown(term.definition, { className: 'prose term-popover__definition' }));

  const links = document.createElement('p');
  links.className = 'term-popover__links';
  if (term.lesson && parseRef(term.lesson)) {
    const lesson = document.createElement('a');
    lesson.href = refHref(term.lesson);
    lesson.textContent = 'Vysvětlení v lekci';
    links.append(lesson);
  }
  if (term.mdn) {
    const mdn = document.createElement('a');
    mdn.href = term.mdn;
    mdn.target = '_blank';
    mdn.rel = 'noopener noreferrer';
    mdn.textContent = 'MDN (anglicky)';
    links.append(mdn);
  }
  if (links.childElementCount) element.append(links);

  element.addEventListener('mouseleave', () => popover && !popover.pinned && scheduleHoverClose());
  element.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
  document.body.append(element);
  positionPopover(element, button);

  button.setAttribute('aria-expanded', 'true');
  button.setAttribute('aria-controls', element.id);
  popover = { element, owner: button, pinned };
  // Otevření kliknutím (i klávesou) přesune fokus do bubliny, aby šlo Tabem na odkazy.
  if (pinned) element.focus({ preventScroll: true });
}

function positionPopover(element, anchor) {
  const gap = 8;
  const margin = 12;
  const rect = anchor.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  let top = rect.bottom + gap;
  if (top + box.height > window.innerHeight - margin && rect.top - gap - box.height > margin) top = rect.top - gap - box.height;
  const left = Math.min(Math.max(margin, rect.left), window.innerWidth - box.width - margin);
  element.style.top = `${top + window.scrollY}px`;
  element.style.left = `${Math.max(margin, left) + window.scrollX}px`;
}

export function closeTermPopover({ restoreFocus = true } = {}) {
  if (!popover) return;
  const { element, owner } = popover;
  popover = null;
  const hadFocus = element.contains(document.activeElement);
  element.remove();
  owner.setAttribute('aria-expanded', 'false');
  owner.removeAttribute('aria-controls');
  if (restoreFocus && hadFocus && owner.isConnected) owner.focus();
}

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popover) closeTermPopover();
  });
  document.addEventListener('pointerdown', (event) => {
    if (popover && !popover.element.contains(event.target) && !popover.owner.contains(event.target)) {
      closeTermPopover({ restoreFocus: false });
    }
  });
  // Posun vnitřního panelu (zadání kroku) by bublinu odtrhl od pojmu.
  document.addEventListener(
    'scroll',
    (event) => {
      if (popover && event.target !== document && !popover.element.contains(event.target)) closeTermPopover({ restoreFocus: false });
    },
    true,
  );
  window.addEventListener('hashchange', () => closeTermPopover({ restoreFocus: false }));
}
