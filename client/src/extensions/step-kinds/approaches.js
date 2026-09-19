// Jiné přístupy k labu `# --approaches--` (kontrakt kap. 3.8). Ukážou se po splnění labu;
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { api, apiRequest } from '../../api.js';
import { renderMarkdown } from '../../markdown.js';

export function setupApproaches(ws) {
  if (ws.isWorkshop || ws.module.type !== 'lab') return;

  const section = h('section', { class: 'approaches', hidden: true, 'aria-label': 'Jiné přístupy' });
  ws.addToSlot('brief-after-hints', section, { order: 40 });

  const count = ws.item.approachesCount;
  let approaches = null;
  if (typeof count === 'number') {
    if (count > 0) {
      renderClosed();
      section.hidden = false;
    }
  } else {
    loadApproaches()
      .then((list) => {
        if (ws.signal.aborted || !list.length) return;
        renderClosed();
        section.hidden = false;
      })
      .catch(() => {});
  }

  async function loadApproaches() {
    if (approaches) return approaches;
    const module = await api.moduleWithSolutions(ws.module.sectionId, ws.module.moduleId);
    approaches = module.lab?.approaches ?? [];
    return approaches;
  }

  function renderClosed() {
    const countText = approaches?.length ?? count;
    const button = h('button', { type: 'button', class: 'btn btn--small', 'aria-label': `Show other approaches (${countText}) / Ukázat jiné přístupy (${countText})` }, svg(icons.eye), `Show other approaches (${countText})`);
    button.addEventListener('click', open);
    section.replaceChildren(
      h('h2', { class: 'brief__subtitle' }, 'Jiné přístupy'),
      h('p', { class: 'approaches__lead' }, doneNow() ? 'Lab máš hotový. Podívej se, jak jinak se dal napsat a kdy se který způsob hodí.' : 'Po splnění labu uvidíš, jak jinak se dal napsat.'),
      h('div', { class: 'actions' }, button),
    );
  }

  function doneNow() {
    const state = ws.state();
    return state.completed || state.passed;
  }

  async function open() {
    if (!doneNow()) {
      const ok = window.confirm('Lab ještě nemáš splněný. Opravdu chceš vidět hotová řešení? Zapíše se to jako nahlédnutí do řešení.');
      if (!ok) return;
      apiRequest('POST', '/api/attempts', { id: ws.item.id, solutionViewed: true }).catch((error) =>
        console.warn(`Nahlédnutí do řešení se nepodařilo zapsat: ${error.message}`),
      );
    }
    try {
      await loadApproaches();
    } catch (error) {
      section.append(h('p', { class: 'approaches__lead', role: 'alert' }, `Přístupy se nepodařilo načíst: ${error.message}`));
      return;
    }
    if (ws.signal.aborted) return;
    section.replaceChildren(
      h('h2', { class: 'brief__subtitle' }, 'Jiné přístupy'),
      ...approaches.map((approach) =>
        h(
          'article',
          { class: 'approach' },
          h('h3', { class: 'approach__title' }, approach.title),
          approach.description ? renderMarkdown(approach.description, { className: 'prose approach__description' }) : null,
          approach.files
            .filter((file) => changedFromSeed(file))
            .map((file) =>
              h(
                'div',
                { class: 'approach__file' },
                h('p', { class: 'approach__file-name' }, file.name),
                renderMarkdown(`\`\`\`\`${file.lang}\n${file.content}\n\`\`\`\``, { className: 'prose approach__code' }),
              ),
            ),
        ),
      ),
    );
  }

  function changedFromSeed(file) {
    const seedFile = ws.item.seed.find((s) => s.name === file.name);
    return !seedFile || seedFile.content !== file.content;
  }

  ws.on('check-result', ({ passed }) => {
    if (passed && (approaches?.length ?? count) > 0 && !section.querySelector('.approach')) renderClosed();
  });
}
