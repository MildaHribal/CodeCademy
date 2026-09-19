// Živá ukázka v lekci (kontrakt kap. 5.2 a 5.3): malý editor, náhled (nebo konzole u `:::live js`)

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';
import { mountPreview } from '../run.js';
import { renderMarkdown } from '../markdown.js';
import { createCodeEditor } from './code-editor.js';
import { createConsolePanel } from './console-panel.js';
import { createQuestion } from './question.js';
import {
  controlCssValue,
  controlledDeclarations,
  defaultControlValues,
  withVariablesPrelude,
} from '../lesson/blocks/live-logic.js';

let exampleCounter = 0;

export function createLiveExample(host, block, { number, key = `live-${number}` }) {
  return block.predict ? createPredictExample(host, block, { number, key }) : createPlainExample(host, block, { number });
}

function createPlainExample(host, block, { number }) {
  const isJs = block.runtime === 'js';
  const controls = block.controls ?? [];
  const original = block.files.map((f) => ({ ...f, region: null }));
  let values = defaultControlValues(controls);

  const editorHost = h('div', { class: 'live__editor' });
  const previewHost = h('div', { class: 'live__preview', hidden: isJs });
  const consolePanel = createConsolePanel({
    emptyText: isJs ? 'Zatím nic nevypsáno.' : 'Konzole je prázdná.',
  });
  consolePanel.element.classList.add('live__console');
  if (!isJs) consolePanel.element.hidden = true;

  const resetButton = h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Reset / Obnovit', onclick: reset }, svg(icons.reset), 'Reset');
  const controlPanel = controls.length ? createControlPanel(controls, { onInput: setValue }) : null;

  const element = h(
    'figure',
    { class: `live${isJs ? ' live--js' : ''}${controlPanel ? ' live--controls' : ''}` },
    h(
      'figcaption',
      { class: 'live__bar' },
      h('span', { class: 'live__title' }, `Živá ukázka ${number}`),
      h('span', { class: 'live__hint' }, controlPanel ? 'Posouvej ovládáním nebo uprav kód.' : 'Uprav kód, výsledek se ukáže hned.'),
      resetButton,
    ),
    h('div', { class: 'live__body' }, editorHost, h('div', { class: 'live__output' }, previewHost, consolePanel.element)),
    controlPanel?.element,
  );
  host.append(element);

  const previewFiles = (files) => (controls.length ? withVariablesPrelude(files, values) : files);

  const editor = createCodeEditor(editorHost, {
    files: original,
    compact: true,
    label: `Kód živé ukázky ${number}`,
    context: 'live',
    runtime: block.runtime,
    onChange: (files) => {
      preview.update({ runtime: block.runtime, libs: block.libs ?? [], files: previewFiles(files) });
      controlPanel?.showDeclarations(stylesOf(files), values);
    },
  });

  const preview = mountPreview(previewHost, { runtime: block.runtime, libs: block.libs ?? [], files: previewFiles(original) });
  preview.onConsole?.((entry) => {
    if (!isJs) consolePanel.element.hidden = entry.level === 'clear';
    consolePanel.receive(entry);
  });
  controlPanel?.showDeclarations(stylesOf(original), values);

  function setValue(name, value) {
    values = { ...values, [name]: value };
    if (typeof preview.setCssVariables === 'function') preview.setCssVariables({ [name]: value });
    else preview.update({ runtime: block.runtime, files: previewFiles(editor.getFiles()) });
    controlPanel.showDeclarations(stylesOf(editor.getFiles()), values);
  }

  function reset() {
    editor.setFiles(original);
    consolePanel.clear();
    values = defaultControlValues(controls);
    controlPanel?.reset();
    controlPanel?.showDeclarations(stylesOf(original), values);
    preview.update({ runtime: block.runtime, files: previewFiles(original) });
  }

  return {
    element,
    getValues: () => ({ ...values }),
    destroy() {
      preview.destroy();
      editor.destroy();
    },
  };
}

function stylesOf(files) {
  return files.find((file) => file.name === 'styles.css')?.content ?? '';
}

function createControlPanel(controls, { onInput }) {
  const uid = `controls-${++exampleCounter}`;
  const rows = controls.map((control, index) => {
    const id = `${uid}-${index}`;
    let input;
    let output = null;
    let setDefault;

    if (control.type === 'select') {
      input = h('select', { id, class: 'live-control__select' }, control.options.map((option) => h('option', { value: option }, option)));
      input.addEventListener('change', () => onInput(control.name, controlCssValue(control, input.value)));
      setDefault = () => (input.value = control.default);
    } else if (control.type === 'range') {
      input = h('input', { id, type: 'range', class: 'live-control__range', min: String(control.min), max: String(control.max), step: String(control.step) });
      output = h('output', { class: 'live-control__value', for: id });
      const update = () => {
        const value = controlCssValue(control, input.value);
        output.textContent = value;
        return value;
      };
      input.addEventListener('input', () => onInput(control.name, update()));
      setDefault = () => {
        input.value = String(control.default);
        update();
      };
    } else {
      input = h('input', { id, type: 'checkbox', class: 'live-control__toggle', role: 'switch' });
      output = h('output', { class: 'live-control__value', for: id });
      const update = () => {
        const value = control.options[input.checked ? 1 : 0];
        output.textContent = value;
        return value;
      };
      input.addEventListener('change', () => onInput(control.name, update()));
      setDefault = () => {
        input.checked = control.default === control.options[1];
        update();
      };
    }
    setDefault();
    const row = h(
      'div',
      { class: `live-control live-control--${control.type}` },
      h('label', { class: 'live-control__label', for: id }, control.label, h('code', { class: 'live-control__name' }, control.name)),
      h('div', { class: 'live-control__input' }, input, output),
    );
    return { row, setDefault };
  });

  const declarations = h('pre', { class: 'live-controls__css', 'aria-live': 'polite', 'aria-label': 'CSS s dosazenými hodnotami' });

  return {
    element: h(
      'div',
      { class: 'live-controls' },
      h('div', { class: 'live-controls__inputs' }, rows.map((r) => r.row)),
      h('div', { class: 'live-controls__result' }, h('p', { class: 'live-controls__caption' }, 'Co z toho vznikne v CSS'), declarations),
    ),
    reset: () => rows.forEach((r) => r.setDefault()),
    showDeclarations(css, values) {
      const list = controlledDeclarations(css, values);
      if (!list.length) {
        declarations.textContent = 'Žádná deklarace v styles.css ovládání nepoužívá.';
        return;
      }
      declarations.replaceChildren(
        ...list.flatMap((declaration, index) => [
          index ? '\n' : '',
          h('span', { class: 'live-controls__selector' }, declaration.selector ? `${declaration.selector} { ` : ''),
          h('span', { class: 'tok-propertyName' }, declaration.property),
          ': ',
          h('span', { class: 'live-controls__resolved' }, declaration.resolved),
          declaration.selector ? '; }' : ';',
        ]),
      );
    },
  };
}

function createPredictExample(host, block, { number, key }) {
  const runtime = block.runtime;
  // Knihovny ukázky (`:::live … libs=`, kontrakt kap. 6.10) — náhled je musí dostat.
  const libs = Array.isArray(block.libs) ? block.libs : [];
  const isNode = runtime === 'node';
  const isJs = runtime === 'js';
  const original = block.files.map((f) => ({ ...f, region: null }));
  let revealed = false;
  let editor = null;
  let preview = null;
  let tipText = null;

  const codeHost = h('div', { class: 'live__editor live__editor--static' }, staticCode(original));
  const outputHost = h(
    'div',
    { class: 'live__output live__output--hidden' },
    h('p', { class: 'live__placeholder' }, svg(icons.eye), isNode ? 'Výstup uvidíš, až tipneš.' : 'Výsledek uvidíš, až tipneš.'),
  );
  const tipBox = h('div', { class: 'live__tip', hidden: true });
  const dontKnow = h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': "I don't know, show / Nevím, ukaž", onclick: () => reveal({ gaveUp: true }) }, "I don't know, show");
  const resetButton = h('button', { type: 'button', class: 'btn btn--quiet btn--small', 'aria-label': 'Reset / Obnovit', hidden: true }, svg(icons.reset), 'Reset');

  let question;
  const questionHost = h('div', { class: 'live__question' });
  try {
    question = createQuestion(block.predict, {
      key: `${key}#predict`,
      number,
      itemId: null,
      checkButton: true,
      onEvaluated: ({ correct, showAnswer }) => {
        if (!correct && !showAnswer) question.showAnswer?.();
        reveal({ gaveUp: false });
      },
    });
    questionHost.append(question.element);
  } catch (error) {
    questionHost.append(h('p', { class: 'notice notice--warning' }, `Otázku předpovědi zatím aplikace neumí zobrazit (${error.message}).`));
  }

  const element = h(
    'figure',
    { class: `live live--predict${isJs ? ' live--js' : ''}`, dataset: { revealed: 'false' } },
    h(
      'figcaption',
      { class: 'live__bar' },
      h('span', { class: 'live__title' }, `Předpověď ${number}`),
      h('span', { class: 'live__hint' }, 'Nejdřív tipni, co se stane. Pak uvidíš skutečnost.'),
      resetButton,
    ),
    h('div', { class: 'live__body' }, codeHost, outputHost),
    h('div', { class: 'live__predict' }, questionHost, h('div', { class: 'actions live__predict-actions' }, dontKnow), tipBox),
  );
  host.append(element);

  if (question && typeof question.evaluate !== 'function') {
    dontKnow.before(
      h('button', { type: 'button', class: 'btn btn--primary btn--small', 'aria-label': 'Show result / Ukázat výsledek', onclick: () => question.isAnswered() && (question.reveal(), reveal({ gaveUp: false })) }, 'Show result'),
    );
  }

  function reveal({ gaveUp }) {
    if (gaveUp) question?.showAnswer?.();
    tipText = gaveUp ? null : question?.answer?.() ?? null;
    showTip();
    if (revealed) return;
    revealed = true;
    element.dataset.revealed = 'true';
    dontKnow.remove();
    element.querySelector('.live__predict-actions')?.remove();

    outputHost.classList.remove('live__output--hidden');
    outputHost.replaceChildren();
    if (isNode) {
      // Node se v lekci nespouští: skutečný výstup napsal autor (kontrakt kap. 5.3).
      outputHost.append(
        h('p', { class: 'live__output-title' }, 'Skutečný výstup'),
        h('pre', { class: 'live__node-output' }, block.output ?? ''),
      );
      return;
    }

    const previewHost = h('div', { class: 'live__preview', hidden: isJs });
    const consolePanel = createConsolePanel({ emptyText: isJs ? 'Kód nic nevypsal.' : 'Konzole je prázdná.' });
    consolePanel.element.classList.add('live__console');
    if (!isJs) consolePanel.element.hidden = true;
    outputHost.append(previewHost, consolePanel.element);

    codeHost.classList.remove('live__editor--static');
    codeHost.replaceChildren();
    editor = createCodeEditor(codeHost, {
      files: original,
      compact: true,
      label: `Kód předpovědi ${number}`,
      context: 'live',
      runtime,
      onChange: (files) => preview.update({ runtime, libs, files }),
    });
    preview = mountPreview(previewHost, { runtime, libs, files: original });
    preview.onConsole?.((entry) => {
      if (!isJs) consolePanel.element.hidden = entry.level === 'clear';
      consolePanel.receive(entry);
    });
    resetButton.hidden = false;
    resetButton.onclick = () => {
      editor.setFiles(original);
      consolePanel.clear();
      preview.update({ runtime, files: original });
    };
  }

  function showTip() {
    tipBox.hidden = false;
    const answer = Array.isArray(tipText) ? tipText : tipText ? [String(tipText)] : [];
    tipBox.replaceChildren(
      h('p', { class: 'live__tip-title' }, 'Tvůj tip'),
      answer.length
        ? h('div', { class: 'live__tip-text' }, answer.map((text) => renderMarkdown(text, { className: 'prose', tag: 'div' })))
        : h('p', { class: 'live__tip-text live__tip-text--none' }, 'Bez tipu — podívej se, co se stalo, a zkus si to vysvětlit.'),
      h('p', { class: 'live__tip-compare' }, isNode ? 'Porovnej ho se skutečným výstupem vedle kódu.' : isJs ? 'Porovnej ho s konzolí vedle kódu. Kód teď můžeš upravovat.' : 'Porovnej ho s náhledem vedle kódu. Kód teď můžeš upravovat.'),
    );
  }

  return {
    element,
    isRevealed: () => revealed,
    destroy() {
      preview?.destroy();
      editor?.destroy();
    },
  };
}

function staticCode(files) {
  return h(
    'div',
    { class: 'live__static' },
    files.map((file) =>
      h(
        'div',
        { class: 'live__static-file' },
        files.length > 1 ? h('p', { class: 'live__static-name' }, file.name) : null,
        renderMarkdown(`\`\`\`\`${file.lang}\n${file.content}\n\`\`\`\``, { className: 'prose live__static-code' }),
      ),
    ),
  );
}
