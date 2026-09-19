import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { renderMarkdown } from '../../markdown.js';
import { loadCurriculum } from '../../content.js';
import { errorNotice, loadingNotice } from '../../components/status.js';
import { plural } from '../../text.js';
import { notesApi } from './api.js';
import { countEntries, formatTime, withVisibleSources } from './format.js';

const GENERAL = 'obecne';
const GENERAL_TITLE = 'Obecné poznámky';

export async function renderNotes(ctx, route) {
  const sectionId = route.sectionId ?? GENERAL;
  ctx.setTitle('Poznámky');
  ctx.setCrumbs([{ label: 'Poznámky', href: '#/poznamky' }, ...(sectionId !== GENERAL ? [{ label: sectionId }] : [])]);

  const sidebar = h('nav', { class: 'notes-page__nav', 'aria-label': 'Poznámky podle sekcí' }, loadingNotice('Načítám seznam…'));
  const main = h('section', { class: 'notes-page__main', 'aria-live': 'polite' }, loadingNotice('Načítám poznámky…'));
  ctx.root.append(
    h(
      'div',
      { class: 'page page--wide notes-page' },
      h(
        'header',
        { class: 'notes-page__head' },
        h('h1', { class: 'notes-page__title' }, 'Poznámky'),
        h(
          'p',
          { class: 'notes-page__lead' },
          'Tvoje poznámky, otázky „Nerozumím" a vysvětlení vlastními slovy po sekcích. Jsou to obyčejné soubory v data/poznamky/, takže je můžeš upravit i v editoru.',
        ),
      ),
      h('div', { class: 'notes-page__layout' }, sidebar, main),
    ),
  );

  let curriculum = null;
  let list = [];
  try {
    [curriculum, { notes: list }] = await Promise.all([loadCurriculum(), notesApi.list({ signal: ctx.signal })]);
  } catch (error) {
    if (ctx.signal.aborted) return;
    sidebar.replaceChildren();
    main.replaceChildren(errorNotice({ title: 'Poznámky se nepodařilo načíst', message: error.message }));
    return;
  }
  if (ctx.signal.aborted) return;

  const sections = curriculum.parts.flatMap((part) => part.sections).filter((section) => section.available);
  const titleOf = (id) => (id === GENERAL ? GENERAL_TITLE : sections.find((s) => s.id === id)?.title ?? id);
  if (sectionId !== GENERAL) ctx.setCrumbs([{ label: 'Poznámky', href: '#/poznamky' }, { label: titleOf(sectionId) }]);
  ctx.setTitle(`Poznámky: ${titleOf(sectionId)}`);

  renderSidebar(sidebar, { list, sections, sectionId });
  await renderFile(ctx, main, { sectionId, title: titleOf(sectionId) });
}

function renderSidebar(sidebar, { list, sections, sectionId }) {
  const known = new Map(list.map((entry) => [entry.section, entry]));
  const entries = [{ section: GENERAL, title: GENERAL_TITLE }, ...list.filter((entry) => entry.section !== GENERAL)];

  const links = entries.map((entry) => {
    const info = known.get(entry.section);
    return h(
      'li',
      {},
      h(
        'a',
        {
          class: 'notes-page__link',
          href: `#/poznamky/${entry.section}`,
          'aria-current': entry.section === sectionId ? 'page' : null,
        },
        h('span', { class: 'notes-page__link-title' }, entry.title),
        h('span', { class: 'notes-page__link-meta' }, info ? `upraveno ${formatTime(info.updated)}` : 'zatím prázdné'),
      ),
    );
  });

  const withoutNotes = sections.filter((section) => !known.has(section.id));
  const picker = withoutNotes.length
    ? h(
        'label',
        { class: 'notes-page__picker' },
        h('span', {}, 'Jiná sekce'),
        h(
          'select',
          {
            class: 'notes-field__input',
            onchange: (event) => {
              if (event.target.value) location.hash = `#/poznamky/${event.target.value}`;
            },
          },
          h('option', { value: '' }, 'Vyber sekci…'),
          withoutNotes.map((section) => h('option', { value: section.id, selected: section.id === sectionId }, section.title)),
        ),
      )
    : null;

  sidebar.replaceChildren(h('ul', { class: 'notes-page__list' }, links), picker);
}

async function renderFile(ctx, main, { sectionId, title }) {
  let file;
  try {
    file = await notesApi.get(sectionId, { signal: ctx.signal });
  } catch (error) {
    if (ctx.signal.aborted) return;
    main.replaceChildren(errorNotice({ title: 'Poznámky se nepodařilo načíst', message: error.message }));
    return;
  }
  if (ctx.signal.aborted) return;
  showView();

  function header(actions) {
    return h(
      'header',
      { class: 'notes-file__head' },
      h(
        'div',
        {},
        h('h2', { class: 'notes-file__title' }, title),
        h(
          'p',
          { class: 'notes-file__meta' },
          file.updated ? `${plural(countEntries(file.content), ['záznam', 'záznamy', 'záznamů'])}, upraveno ${formatTime(file.updated)}` : 'Soubor zatím neexistuje.',
        ),
      ),
      h('div', { class: 'actions' }, actions),
    );
  }

  function showView() {
    const editButton = h('button', { type: 'button', class: 'btn', onclick: showEditor }, 'Upravit');
    const printButton = h('button', { type: 'button', class: 'btn btn--quiet', onclick: () => window.print() }, 'Vytisknout');
    const body = file.content.trim()
      ? renderMarkdown(withVisibleSources(file.content), { className: 'prose notes-prose' })
      : h(
          'div',
          { class: 'notes-file__empty' },
          h('p', {}, 'Zatím tu nic není.'),
          h(
            'p',
            {},
            sectionId === GENERAL
              ? 'Obecné poznámky si napiš tlačítkem Upravit — třeba otázky na pohovor nebo co chceš zkusit v projektu.'
              : 'V lekci nebo v kroku téhle sekce otevři panel Poznámka, nebo u odstavce, kterému nerozumíš, klikni na otazník vlevo.',
          ),
        );
    main.replaceChildren(h('article', { class: 'notes-file' }, header([editButton, file.content.trim() ? printButton : null]), body));
  }

  function showEditor() {
    const textarea = h('textarea', { class: 'notes-field__input notes-file__editor', 'aria-label': `Soubor poznámek: ${title}`, spellcheck: 'true' });
    textarea.value = file.content;
    const status = h('p', { class: 'notes-file__status', role: 'status' });
    const saveButton = h('button', { type: 'button', class: 'btn btn--primary' }, h('span', { class: 'btn__label' }, 'Uložit'), h('kbd', { class: 'btn__kbd' }, 'Ctrl+Enter'));
    const cancelButton = h('button', { type: 'button', class: 'btn btn--quiet', onclick: showView }, 'Zrušit');

    async function save() {
      saveButton.disabled = true;
      status.textContent = 'Ukládám…';
      try {
        const { updated } = await notesApi.save(sectionId, textarea.value, file.updated);
        if (ctx.signal.aborted) return;
        file = { ...file, content: textarea.value.endsWith('\n') || !textarea.value ? textarea.value : `${textarea.value}\n`, updated };
        showView();
      } catch (error) {
        if (ctx.signal.aborted) return;
        saveButton.disabled = false;
        if (error.status === 409) {
          status.replaceChildren(
            'Soubor se mezitím změnil jinde. Tvoje úprava zůstává v poli — zkopíruj si ji, načti aktuální verzi a doplň ji. ',
            h('button', { type: 'button', class: 'btn btn--small', onclick: reload }, svg(icons.reset), 'Načíst aktuální verzi'),
          );
        } else {
          status.textContent = `Uložení se nepovedlo: ${error.message}`;
        }
      }
    }

    async function reload() {
      try {
        file = await notesApi.get(sectionId, { signal: ctx.signal });
        if (ctx.signal.aborted) return;
        textarea.value = file.content;
        status.textContent = 'Načtena aktuální verze.';
      } catch (error) {
        status.textContent = `Načtení se nepovedlo: ${error.message}`;
      }
    }

    saveButton.addEventListener('click', save);
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        save();
      }
    });

    main.replaceChildren(
      h('article', { class: 'notes-file notes-file--editing' }, header([saveButton, cancelButton]), textarea, status),
    );
    textarea.focus();
  }
}
