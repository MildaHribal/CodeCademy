// „Než začneš" nad zadáním labu a projektu (kontrakt kap. 3.8). Nepíše ho autor.
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { apiRequest } from '../../api-request.js';

export const PLAN_QUESTIONS = [
  { id: 'restate', label: 'Zadání vlastními slovy', hint: 'Jedna nebo dvě věty.', rows: 2 },
  { id: 'similar', label: 'Čemu se to podobá', hint: 'Workshop nebo úloha, kterou už znáš.', rows: 2 },
  { id: 'steps', label: 'Postup ve 3–7 krocích', hint: 'Každý krok na nový řádek.', rows: 5, placeholder: '1. \n2. \n3. ' },
  { id: 'verify', label: 'Jak ověříš první požadavek', hint: 'Co spustíš nebo kam se podíváš.', rows: 2 },
];

export function planNoteText(answers) {
  return PLAN_QUESTIONS.filter((q) => answers[q.id]?.trim())
    .map((q) => `**${q.label}:**\n\n${answers[q.id].trim()}`)
    .join('\n\n');
}

let planCounter = 0;

export function createPlanPanel({ sectionId, itemId, title, open = true }) {
  const uid = `plan-${++planCounter}`;
  const fields = PLAN_QUESTIONS.map((question) => {
    const id = `${uid}-${question.id}`;
    const input = h('textarea', { id, class: 'plan__input', rows: String(question.rows), placeholder: question.placeholder ?? '' });
    return {
      question,
      input,
      element: h(
        'div',
        { class: 'plan__field' },
        h('label', { class: 'plan__label', for: id }, question.label, h('span', { class: 'plan__hint' }, question.hint)),
        input,
      ),
    };
  });
  const status = h('p', { class: 'plan__status', role: 'status' });
  const saveButton = h('button', { type: 'button', class: 'btn btn--small', 'aria-label': 'Save plan to notes / Uložit plán do poznámek' }, 'Save plan to notes');

  const element = h(
    'details',
    { class: 'plan', open },
    h('summary', { class: 'plan__summary' }, h('span', { class: 'plan__title' }, 'Než začneš'), h('span', { class: 'plan__optional' }, 'nepovinné, pár minut')),
    h(
      'div',
      { class: 'plan__body' },
      h('p', { class: 'plan__lead' }, 'Kdo si nejdřív rozmyslí postup, zasekne se méně. Plán si uložíš do poznámek sekce.'),
      fields.map((field) => field.element),
      h('div', { class: 'actions' }, saveButton),
      status,
    ),
  );

  saveButton.addEventListener('click', async () => {
    const text = planNoteText(Object.fromEntries(fields.map((field) => [field.question.id, field.input.value])));
    if (!text) {
      status.textContent = 'Plán je prázdný — vyplň aspoň jednu otázku.';
      return;
    }
    saveButton.disabled = true;
    status.textContent = 'Ukládám…';
    try {
      await apiRequest('POST', `/api/notes/${encodeURIComponent(sectionId)}/append`, { kind: 'plan', source: itemId, title: `Plán: ${title}`, text });
      saveButton.replaceChildren(svg(icons.check), 'Uloženo');
      status.textContent = 'Plán je v poznámkách sekce. Když ho upravíš, ulož ho znovu.';
      const again = () => {
        saveButton.disabled = false;
        saveButton.replaceChildren('Uložit plán do poznámek');
      };
      for (const field of fields) field.input.addEventListener('input', again, { once: true });
    } catch (error) {
      saveButton.disabled = false;
      status.textContent = `Plán se nepodařilo uložit: ${error.message}`;
    }
  });

  return { element };
}
