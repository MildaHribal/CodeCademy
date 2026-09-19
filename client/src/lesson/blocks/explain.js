// Vysvětli vlastními slovy: blok `:::explain` v lekci (kontrakt kap. 5.5) a stejný panel
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { apiRequest } from '../../api-request.js';
import { renderMarkdown } from '../../markdown.js';

let panelCounter = 0;

function pointsText(count) {
  if (count === 1) return 'Jeden bod';
  return `${count} ${count >= 2 && count <= 4 ? 'body' : 'bodů'}`;
}

function plainFirstLine(markdown) {
  const line = String(markdown ?? '').split('\n').find((l) => l.trim()) ?? '';
  return line.replace(/`([^`]*)`/g, '$1').replace(/\*\*?|__?/g, '').replace(/\[\[([^\]|]*)\|?([^\]]*)\]\]/g, (_, a, b) => b || a).trim();
}

export function createExplainPanel(explain, { sectionId, itemId, title }) {
  const uid = `explain-${++panelCounter}`;
  const textarea = h('textarea', {
    id: `${uid}-text`,
    class: 'explain__input',
    rows: '5',
    placeholder: 'Napiš to tak, jak bys to vysvětlil kamarádovi nebo na pohovoru.',
  });
  const status = h('p', { class: 'explain__status', role: 'status' });
  const compareButton = h('button', { type: 'button', class: 'btn btn--primary btn--small', 'aria-label': 'Compare with model / Porovnat se vzorem' }, 'Compare with model');
  const skipButton = h('button', { type: 'button', class: 'btn btn--quiet btn--small', hidden: true }, svg(icons.eye), 'Ukázat vzor bez psaní');
  const review = h('div', { class: 'explain__review', hidden: true });

  const element = h(
    'div',
    { class: 'explain' },
    renderMarkdown(explain.prompt, { className: 'prose explain__prompt' }),
    h('label', { class: 'explain__label', for: textarea.id }, 'Tvoje vysvětlení'),
    textarea,
    h('div', { class: 'actions explain__actions' }, compareButton, skipButton),
    status,
    review,
  );

  compareButton.addEventListener('click', () => {
    if (!textarea.value.trim()) {
      status.textContent = 'Nejdřív napiš pár vět vlastními slovy — i nepřesné vysvětlení ti ukáže, co ještě nesedí.';
      skipButton.hidden = false;
      textarea.focus();
      return;
    }
    showReview();
  });
  skipButton.addEventListener('click', showReview);

  function showReview() {
    status.textContent = '';
    compareButton.hidden = true;
    skipButton.hidden = true;
    if (!review.hidden) return;

    const checks = explain.checklist.map((point) => {
      const input = h('input', { type: 'checkbox', class: 'explain__check' });
      return { point, input, row: h('li', {}, h('label', { class: 'explain__point' }, input, renderMarkdown(point.text, { tag: 'span', className: 'prose', inline: true }))) };
    });
    const saveButton = h('button', { type: 'button', class: 'btn btn--primary btn--small', 'aria-label': 'Save / Uložit' }, 'Save');
    const saveStatus = h('p', { class: 'explain__status', role: 'status' });
    let noteSaved = false;

    review.append(
      h('h4', { class: 'explain__subtitle' }, 'Vzorové vysvětlení'),
      renderMarkdown(explain.model, { className: 'prose explain__model' }),
      h(
        'fieldset',
        { class: 'explain__checklist' },
        h('legend', { class: 'explain__subtitle' }, 'Co z toho tvůj text obsahuje?'),
        h('ul', {}, checks.map((c) => c.row)),
      ),
      h(
        'p',
        { class: 'explain__lead' },
        'Uložit: tvůj text se připíše do poznámek sekce a body, které nemáš zaškrtnuté, se ti vrátí v opakování.',
      ),
      h('div', { class: 'actions' }, saveButton),
      saveStatus,
    );
    review.hidden = false;

    saveButton.addEventListener('click', async () => {
      saveButton.disabled = true;
      saveStatus.textContent = 'Ukládám…';
      const text = textarea.value.trim();
      const missing = checks.filter((c) => !c.input.checked).map((c) => c.point);
      const problems = [];

      if (text && !noteSaved) {
        try {
          await apiRequest('POST', `/api/notes/${encodeURIComponent(sectionId)}/append`, {
            kind: 'explain',
            source: itemId,
            title: `${title}: ${plainFirstLine(explain.prompt)}`,
            text,
          });
          noteSaved = true;
        } catch (error) {
          problems.push(`Poznámku se nepodařilo uložit: ${error.message}`);
        }
      }
      for (const point of missing) {
        try {
          await apiRequest('POST', '/api/reviews/add', { id: `explain:${itemId}#${point.key}`, reason: 'explain' });
        } catch (error) {
          problems.push(`Bod „${plainFirstLine(point.text)}" se nepodařilo přidat do opakování: ${error.message}`);
          break;
        }
      }

      if (problems.length) {
        saveButton.disabled = false;
        saveStatus.replaceChildren(...problems.map((problem) => h('span', { class: 'explain__problem' }, problem)));
        return;
      }
      textarea.readOnly = true;
      for (const c of checks) c.input.disabled = true;
      saveButton.replaceChildren(svg(icons.check), 'Uloženo');
      const parts = [text ? 'Vysvětlení je v poznámkách sekce.' : 'Bez textu se do poznámek nic neukládá.'];
      parts.push(
        missing.length
          ? `${pointsText(missing.length)} se ti vrátí v opakování.`
          : 'Všechny body máš, do opakování nic nepřibylo.',
      );
      saveStatus.textContent = parts.join(' ');
    });
  }

  return { element };
}

export const explainBlock = {
  kind: 'explain',
  render(block, env) {
    const { lesson } = env;
    const panel = createExplainPanel(block, {
      sectionId: lesson.module.sectionId ?? lesson.id.split('/')[0],
      itemId: lesson.id,
      title: lesson.module.title,
    });
    return h(
      'section',
      { class: 'lesson-block lesson-explain', 'aria-label': 'Vysvětli vlastními slovy', dataset: { block: 'explain' } },
      h(
        'header',
        { class: 'block-bar' },
        h('span', { class: 'block-bar__title' }, 'Vysvětli vlastními slovy'),
        h('span', { class: 'block-bar__hint' }, 'Nehodnotí se. Kdo to umí říct, ten tomu rozumí.'),
      ),
      h('div', { class: 'lesson-block__body' }, panel.element),
    );
  },
};
