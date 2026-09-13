// Panel s delším „cizím" kódem u sady otázek `# --code--` (kontrakt kap. 4.3):
// 1–3 soubory jen ke čtení, s čísly řádků, přepínání souborů záložkami.
// Používá ho kvíz a opakování (otázka ze sady má `codeSet`).

import { h } from '../dom.js';
import { renderMarkdown } from '../markdown.js';
import { nextQuestionUid } from './questions/uid.js';

/** Obarvený blok kódu s čísly řádků (čísla jsou mimo výběr textu, kopíruje se jen kód). */
function codeView(file) {
  const content = String(file.content ?? '').replace(/\n$/, '');
  const longestTicks = Math.max(2, ...[...content.matchAll(/`+/g)].map((m) => m[0].length));
  const fence = '`'.repeat(longestTicks + 1);
  const lang = file.lang ?? file.name.split('.').pop();
  const highlighted = renderMarkdown(`${fence}${lang}\n${content}\n${fence}`, { className: 'code-set__code' });
  const lineCount = content.split('\n').length;
  const gutter = h(
    'pre',
    { class: 'code-set__gutter', 'aria-hidden': 'true' },
    Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n'),
  );
  return h('div', { class: 'code-set__view', tabindex: '0', role: 'region', 'aria-label': `Soubor ${file.name}` }, gutter, highlighted);
}

/**
 * @param {{ title: string, files: { name, lang, content }[] }} codeSet
 * @returns {HTMLElement}
 */
export function createCodeSetPanel(codeSet) {
  const uid = nextQuestionUid();
  const files = codeSet.files ?? [];
  const views = files.map((file) => codeView(file));
  const tabs = files.map((file, index) =>
    h(
      'button',
      {
        type: 'button',
        role: 'tab',
        class: 'code-set__tab',
        id: `code-set-${uid}-tab-${index}`,
        'aria-selected': String(index === 0),
        onclick: () => select(index),
      },
      file.name,
    ),
  );

  function select(index) {
    tabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === index)));
    views.forEach((view, i) => (view.hidden = i !== index));
  }
  select(0);

  return h(
    'aside',
    { class: 'code-set', 'aria-label': `Kód k otázkám: ${codeSet.title}` },
    h(
      'div',
      { class: 'code-set__head' },
      h('p', { class: 'code-set__title' }, codeSet.title),
      h('p', { class: 'code-set__hint' }, 'Jen ke čtení. Otázky se odkazují na čísla řádků.'),
    ),
    files.length > 1 ? h('div', { class: 'code-set__tabs', role: 'tablist', 'aria-label': 'Soubory' }, tabs) : null,
    views,
  );
}
