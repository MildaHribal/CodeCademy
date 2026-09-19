import { h, replace } from '../../dom.js';
import { collapseUnchanged, compareFiles, plainFiles } from './hunks.js';

let dialogCounter = 0;

export function openSolutionDiff({ heading, intro = '', confirm = null, load, onViewed = () => {}, labels = {} }) {
  const names = { mine: labels.mine ?? 'Tvůj kód', author: labels.author ?? 'Autor' };
  const titleId = `solution-diff-title-${++dialogCounter}`;
  const body = h('div', { class: 'solution-diff__body' });
  const closeButton = h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Close / Zavřít', onclick: () => close() }, 'Close');
  const dialog = h(
    'dialog',
    { class: 'solution-diff', 'aria-labelledby': titleId },
    h('header', { class: 'solution-diff__head' }, h('h2', { class: 'solution-diff__title', id: titleId }, heading), closeButton),
    body,
  );
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();

  function close() {
    if (dialog.open) dialog.close();
    else dialog.remove();
  }

  if (confirm) showConfirm();
  else showSolution();

  function showConfirm() {
    const reject = h('button', { type: 'button', class: 'btn btn--primary', 'aria-label': (confirm.reject ?? 'Keep trying') + ' / Ještě to zkusím', onclick: () => close() }, confirm.reject ?? 'Keep trying');
    const accept = h('button', { type: 'button', class: 'btn', 'aria-label': (confirm.accept ?? 'Show solution') + ' / Ukázat řešení', onclick: () => showSolution() }, confirm.accept ?? 'Show solution');
    replace(
      body,
      h(
        'div',
        { class: 'solution-diff__confirm' },
        h('p', { class: 'solution-diff__confirm-title' }, confirm.title),
        h('p', {}, confirm.text),
        h('div', { class: 'actions' }, reject, accept),
      ),
    );
    reject.focus();
  }

  async function showSolution() {
    replace(body, h('p', { class: 'loading', role: 'status' }, 'Načítám řešení…'));
    let files;
    try {
      const loaded = await load();
      files = { mine: plainFiles(loaded.mine), author: plainFiles(loaded.author) };
    } catch (error) {
      if (!dialog.isConnected) return;
      replace(
        body,
        h('div', { class: 'notice notice--error', role: 'alert' },
          h('p', { class: 'notice__title' }, 'Řešení se nepodařilo načíst'),
          h('p', { class: 'notice__message' }, error.message ?? String(error)),
          h('div', { class: 'notice__actions' }, h('button', { type: 'button', class: 'btn', 'aria-label': 'Try again / Zkusit znovu', onclick: () => showSolution() }, 'Try again'))),
      );
      return;
    }
    if (!dialog.isConnected) return;
    if (files.author.length === 0) {
      replace(body, h('p', { class: 'notice' }, 'Tenhle krok nemá autorovo řešení.'));
      return;
    }
    onViewed();

    const toggle = h('input', { type: 'checkbox', class: 'solution-diff__toggle-input' });
    const content = h('div', { class: 'solution-diff__files' });
    const render = () => replace(content, renderFiles(compareFiles(files.mine, files.author, { ignoreWhitespace: toggle.checked }), names));
    toggle.addEventListener('change', render);
    replace(
      body,
      intro ? h('p', { class: 'solution-diff__intro' }, intro) : null,
      h(
        'div',
        { class: 'solution-diff__toolbar' },
        h('label', { class: 'solution-diff__toggle' }, toggle, 'Ignorovat bílé znaky'),
        h(
          'p',
          { class: 'solution-diff__legend' },
          h('span', { class: 'solution-diff__legend-item solution-diff__legend-item--del' }, `− ${names.mine}`),
          h('span', { class: 'solution-diff__legend-item solution-diff__legend-item--add' }, `+ ${names.author}`),
        ),
      ),
      content,
    );
    render();
    closeButton.focus();
  }

  return { element: dialog, close };
}

function renderFiles(files, names) {
  const changed = files.filter((file) => file.status !== 'same');
  const same = files.filter((file) => file.status === 'same');
  const out = [];
  if (changed.length === 0) {
    out.push(h('p', { class: 'solution-diff__same-all' }, `Mezi „${names.mine}" a „${names.author}" není žádný rozdíl.`));
  }
  for (const file of changed) out.push(renderFile(file, names));
  if (same.length) {
    out.push(h('p', { class: 'solution-diff__unchanged' }, `Beze změny: ${same.map((file) => file.name).join(', ')}`));
  }
  return out;
}

function fileSummary(file, names) {
  if (file.status === 'added') return `soubor má jen: ${names.author}`;
  if (file.status === 'removed') return `soubor má jen: ${names.mine}`;
  return `+${file.added} −${file.removed}`;
}

function renderFile(file, names) {
  const code = h('div', { class: 'solution-diff__code', role: 'group', 'aria-label': `Rozdíly v souboru ${file.name}` });
  for (const part of collapseUnchanged(file.diff)) {
    if (part.type === 'lines') {
      for (const line of part.lines) code.append(renderLine(line));
      continue;
    }
    const skip = h(
      'button',
      { type: 'button', class: 'solution-diff__skip' },
      `… ${part.lines.length} stejných řádků (ukázat)`,
    );
    skip.addEventListener('click', () => skip.replaceWith(...part.lines.map(renderLine)));
    code.append(skip);
  }
  return h(
    'section',
    { class: 'solution-diff__file' },
    h('h3', { class: 'solution-diff__file-name' }, file.name, h('span', { class: 'solution-diff__file-summary' }, fileSummary(file, names))),
    h('div', { class: 'solution-diff__scroll' }, code),
  );
}

const LINE_SIGNS = { same: ' ', add: '+', del: '−' };
const LINE_WORDS = { same: '', add: 'přidáno: ', del: 'odebráno: ' };

function renderLine(line) {
  return h(
    'div',
    { class: `solution-diff__line solution-diff__line--${line.type}` },
    h('span', { class: 'solution-diff__num', 'aria-hidden': 'true' }, line.beforeLine ?? ''),
    h('span', { class: 'solution-diff__num', 'aria-hidden': 'true' }, line.afterLine ?? ''),
    h('span', { class: 'solution-diff__sign', 'aria-hidden': 'true' }, LINE_SIGNS[line.type]),
    h('span', { class: 'solution-diff__text' }, LINE_WORDS[line.type] ? h('span', { class: 'visually-hidden' }, LINE_WORDS[line.type]) : null, line.text || ' '),
  );
}
