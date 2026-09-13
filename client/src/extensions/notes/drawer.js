// Panel poznámek: vysune se zprava nad lekcí nebo pracovní plochou, výklad zůstane vidět.
//
//   setNotesContext({ section, sectionTitle, itemId, title })   // obrazovka řekne, kde uživatel je
//   openNotesDrawer({ kind: 'quote', quote: '…', anchor, heading })
//
// Poznámka se připíše do souboru poznámek sekce (POST /api/notes/:section/append).
// Panel není modální: jde dál číst a psát, Escape ho zavře a fokus vrátí tam, odkud přišel.
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { renderMarkdown } from '../../markdown.js';
import { appEvents } from '../../core/events.js';
import { notesApi } from './api.js';
import { cleanQuote, entrySource, entryTitle, withVisibleSources } from './format.js';

const GENERAL = { section: 'obecne', sectionTitle: 'Obecné poznámky', itemId: null, title: '' };

let context = GENERAL;
let drawer = null; // { element, … } — vytvoří se při prvním otevření

/** Kde uživatel právě je. Volá rozšíření lekce / plochy; při změně obrazovky se vrátí na obecné. */
export function setNotesContext(next) {
  context = { ...GENERAL, ...next };
}

appEvents.on('route:change', () => {
  context = GENERAL;
  drawer?.close({ restoreFocus: false });
});

export function isNotesDrawerOpen() {
  return Boolean(drawer && !drawer.element.hidden);
}

/**
 * @param {{ kind?: 'note' | 'quote', quote?: string, anchor?: string | null, heading?: string | null }} options
 */
export function openNotesDrawer(options = {}) {
  drawer ??= createDrawer();
  drawer.open({ kind: 'note', quote: '', anchor: null, heading: null, ...options });
}

function createDrawer() {
  const titleId = 'notes-drawer-title';
  let returnFocus = null;
  let current = null; // { kind, quote, anchor, heading, context }
  let loadController = null;

  const sectionLabel = h('p', { class: 'notes-drawer__section' });
  const closeButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet btn--small notes-drawer__close', 'aria-label': 'Zavřít poznámky', onclick: () => close() },
    svg(icons.close),
  );

  const quoteBox = h('blockquote', { class: 'notes-drawer__quote' });
  const quoteWrap = h(
    'div',
    { class: 'notes-drawer__quote-wrap', hidden: true },
    h('p', { class: 'notes-drawer__quote-label' }, 'Nerozumím tomuhle:'),
    quoteBox,
  );
  const titleInput = h('input', { class: 'notes-field__input', id: 'notes-drawer-entry-title', type: 'text', maxlength: '200' });
  const textLabel = h('label', { class: 'notes-field__label', for: 'notes-drawer-text' });
  const textarea = h('textarea', { class: 'notes-field__input notes-field__textarea', id: 'notes-drawer-text', rows: '6' });
  const status = h('p', { class: 'notes-drawer__status', role: 'status' });
  const saveButton = h(
    'button',
    { type: 'submit', class: 'btn btn--primary' },
    h('span', { class: 'btn__label' }, 'Uložit do poznámek'),
    h('kbd', { class: 'btn__kbd' }, 'Ctrl+Enter'),
  );

  const form = h(
    'form',
    {
      class: 'notes-drawer__form',
      onsubmit: (event) => {
        event.preventDefault();
        save();
      },
    },
    quoteWrap,
    h('div', { class: 'notes-field' }, h('label', { class: 'notes-field__label', for: 'notes-drawer-entry-title' }, 'Nadpis'), titleInput),
    h('div', { class: 'notes-field' }, textLabel, textarea),
    h('div', { class: 'actions' }, saveButton),
    status,
  );

  // Mimo lekci a krok není místo ve výkladu, na které by záznam odkázal — obecné poznámky
  // se proto píšou rovnou do souboru na stránce Poznámky.
  const noPlace = h(
    'p',
    { class: 'notes-drawer__empty', hidden: true },
    'Poznámku k výkladu přidáš v lekci nebo v kroku. Obecné poznámky si napiš na stránce ',
    h('a', { href: '#/poznamky' }, 'Poznámky'),
    '.',
  );
  const allLink = h('a', { class: 'notes-drawer__all' }, 'Otevřít všechny poznámky sekce');
  const existing = h('div', { class: 'notes-drawer__existing' });

  const element = h(
    'aside',
    { class: 'notes-drawer', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': titleId, hidden: true },
    h(
      'header',
      { class: 'notes-drawer__head' },
      h('div', {}, h('h2', { class: 'notes-drawer__title', id: titleId }, 'Poznámky'), sectionLabel),
      closeButton,
    ),
    h(
      'div',
      { class: 'notes-drawer__body' },
      form,
      noPlace,
      h('section', { class: 'notes-drawer__recent', 'aria-label': 'Poznámky sekce' }, h('div', { class: 'notes-drawer__recent-head' }, h('h3', {}, 'V poznámkách sekce'), allLink), existing),
    ),
  );
  document.body.append(element);

  element.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && form.contains(event.target)) {
      event.preventDefault();
      save();
    }
  });

  function open(options) {
    current = { ...options, context };
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const quote = cleanQuote(options.quote);
    const kind = quote ? 'quote' : 'note';
    current.kind = kind;
    current.quote = quote;

    sectionLabel.textContent = context.sectionTitle;
    quoteWrap.hidden = !quote;
    quoteBox.textContent = quote;
    titleInput.value = entryTitle(kind, { heading: options.heading, title: context.title });
    textLabel.textContent = quote ? 'Co přesně ti není jasné? (nepovinné)' : 'Poznámka';
    textarea.value = '';
    textarea.placeholder = quote ? 'Třeba: nechápu, proč se změnilo i pole a.' : 'Co si chceš zapamatovat nebo vyjasnit…';
    status.textContent = '';
    allLink.href = `#/poznamky/${context.section}`;

    form.hidden = !context.itemId;
    noPlace.hidden = Boolean(context.itemId);
    element.hidden = false;
    document.body.classList.add('has-notes-drawer');
    (context.itemId ? textarea : closeButton).focus();
    loadExisting();
  }

  function close({ restoreFocus = true } = {}) {
    if (element.hidden) return;
    element.hidden = true;
    document.body.classList.remove('has-notes-drawer');
    loadController?.abort();
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
  }

  async function loadExisting() {
    loadController?.abort();
    loadController = new AbortController();
    const { signal } = loadController;
    existing.replaceChildren(h('p', { class: 'loading' }, 'Načítám poznámky…'));
    try {
      const { content } = await notesApi.get(current.context.section, { signal });
      if (signal.aborted) return;
      showExisting(content);
    } catch (error) {
      if (signal.aborted) return;
      existing.replaceChildren(h('p', { class: 'notes-drawer__empty' }, `Poznámky se nepodařilo načíst: ${error.message}`));
    }
  }

  function showExisting(content) {
    if (!content.trim()) {
      existing.replaceChildren(h('p', { class: 'notes-drawer__empty' }, 'Zatím tu nic není. První poznámka se uloží sem.'));
      return;
    }
    const rendered = renderMarkdown(withVisibleSources(content), { className: 'prose notes-prose notes-prose--compact' });
    existing.replaceChildren(rendered);
    // Nejnovější záznam je na konci souboru — ten je v panelu nejužitečnější.
    existing.scrollTop = existing.scrollHeight;
  }

  async function save() {
    const text = textarea.value.trim();
    const title = titleInput.value.trim();
    if (!text && !current.quote) {
      status.textContent = 'Napiš poznámku, prázdná se neuloží.';
      textarea.focus();
      return;
    }
    if (!title) {
      status.textContent = 'Poznámka potřebuje nadpis.';
      titleInput.focus();
      return;
    }
    const { section, itemId } = current.context;
    if (!itemId) return;
    saveButton.disabled = true;
    status.textContent = 'Ukládám…';
    try {
      await notesApi.append(section, {
        kind: current.kind,
        source: entrySource(itemId, current.anchor),
        title,
        text,
        ...(current.quote ? { quote: current.quote } : {}),
      });
      textarea.value = '';
      if (current.quote) {
        current = { ...current, kind: 'note', quote: '' };
        quoteWrap.hidden = true;
        textLabel.textContent = 'Poznámka';
        titleInput.value = entryTitle('note', { title: current.context.title });
      }
      status.textContent = 'Uloženo do poznámek.';
      loadExisting();
    } catch (error) {
      status.textContent = `Poznámku se nepodařilo uložit: ${error.message}`;
    } finally {
      saveButton.disabled = false;
    }
  }

  return { element, open, close };
}
