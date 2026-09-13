// Malá pracovní plocha pro opakování: kód od seedu, požadavky a kontrola testů.
// Používá ji krok „znovu od začátku" (step) a karta `code js`. Nic se neukládá do postupu —
// opakování nemá přepsat uložený kód kroku ani jeho splnění.

import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { runTests, mountPreview } from '../../run.js';
import { createCodeEditor } from '../../components/code-editor.js';
import { createConsolePanel } from '../../components/console-panel.js';
import { createHintList } from '../../components/hint-list.js';
import { transformRun } from '../../components/test-result.js';

/**
 * @param {{ runtime, seed: File[], hints: { text, test }[], meta?: object, item?: object, title: string }} task
 * @param {{ onPass: () => void, onGiveUp: () => void, solution?: File[] | null }} handlers
 * @returns {{ element, mount(), destroy() }}
 */
export function createPractice(task, { onPass, onGiveUp, solution = null }) {
  const runtime = task.runtime ?? 'js';
  const isNode = runtime === 'node';
  const isJs = runtime === 'js';
  const controller = new AbortController();
  let editor = null;
  let preview = null;
  let checking = false;
  let finished = false;

  const hintList = createHintList(task.hints ?? [], { item: task.item ?? null });
  const status = h('p', { class: 'reviews-practice__status', role: 'status' });
  const checkButton = h('button', { type: 'button', class: 'btn btn--primary btn--small', onclick: () => check() }, 'Zkontrolovat');
  const giveUpButton = h('button', { type: 'button', class: 'btn btn--quiet btn--small', onclick: () => giveUp() }, 'Vzdávám');
  const solutionBox = h('div', { class: 'reviews-practice__solution', hidden: true });

  const editorHost = h('div', { class: 'reviews-practice__editor' });
  const previewHost = h('div', { class: 'reviews-practice__preview', hidden: isJs || isNode });
  const consolePanel = createConsolePanel({ emptyText: isJs ? 'Zatím nic nevypsáno.' : 'Konzole je prázdná.' });
  consolePanel.element.classList.add('reviews-practice__console');
  if (!isJs) consolePanel.element.hidden = true;

  const element = h(
    'div',
    { class: 'reviews-practice' },
    h('div', { class: 'reviews-practice__brief' }, h('p', { class: 'reviews-practice__label' }, 'Požadavky'), hintList.element),
    h('div', { class: 'reviews-practice__work' }, editorHost, isNode ? null : h('div', { class: 'reviews-practice__output' }, previewHost, consolePanel.element)),
    h(
      'div',
      { class: 'reviews-practice__bar' },
      checkButton,
      giveUpButton,
      h('span', { class: 'reviews-practice__kbd' }, 'Ctrl+Enter zkontroluje'),
    ),
    status,
    solutionBox,
  );

  const files = () => editor.getFiles().map(({ name, content }) => ({ name, content }));

  async function check() {
    if (checking || finished) return;
    checking = true;
    checkButton.disabled = true;
    hintList.running();
    status.textContent = 'Kontroluju…';
    try {
      const current = files();
      let run = await runTests({
        runtime,
        files: current,
        hints: task.hints ?? [],
        signal: controller.signal,
        ...(typeof task.meta?.timeoutMs === 'number' ? { timeoutMs: task.meta.timeoutMs } : {}),
      });
      if (controller.signal.aborted) return;
      run = transformRun(run, { item: task.item ?? null, files: current, runtime });
      hintList.setResults(run.results ?? [], run);
      const passedCount = (run.results ?? []).filter((r) => r.pass).length;
      if (run.ok) {
        finished = true;
        status.textContent = 'Všechny požadavky jsou splněné.';
        element.dataset.state = 'pass';
        checkButton.hidden = true;
        giveUpButton.hidden = true;
        onPass();
      } else if (run.syntaxError) {
        status.textContent = `Kód nejde spustit: ${run.syntaxError.message} (${run.syntaxError.file}:${run.syntaxError.line})`;
      } else {
        status.textContent = `Splněno ${passedCount} z ${(task.hints ?? []).length}. Oprav kód a zkus to znovu.`;
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      hintList.reset();
      status.textContent = `Kontrolu se nepodařilo spustit: ${error.message ?? error}`;
    } finally {
      checking = false;
      checkButton.disabled = false;
    }
  }

  function giveUp() {
    if (finished) return;
    finished = true;
    checkButton.hidden = true;
    giveUpButton.hidden = true;
    element.dataset.state = 'gave-up';
    status.textContent = 'Nevadí — zítra to přijde znovu.';
    if (solution?.length) {
      solutionBox.hidden = false;
      solutionBox.replaceChildren(
        h('p', { class: 'reviews-practice__label' }, 'Řešení'),
        ...solution.map((file) => h('div', {}, h('p', { class: 'reviews-practice__file' }, file.name), h('pre', { class: 'reviews-practice__code' }, file.content))),
      );
    }
    onGiveUp();
  }

  return {
    element,
    mount() {
      editor = createCodeEditor(editorHost, {
        files: task.seed.map((file) => ({ ...file })),
        label: `Kód: ${task.title}`,
        onChange: (changed) => preview?.update({ runtime, files: changed }),
        onSubmit: () => check(),
        runtime,
        context: 'editor',
        item: task.item ?? null,
      });
      if (!isNode) {
        preview = mountPreview(previewHost, { runtime, files: files() });
        preview.onConsole?.((entry) => {
          if (!isJs) consolePanel.element.hidden = entry.level === 'clear';
          consolePanel.receive(entry);
        });
      }
    },
    destroy() {
      controller.abort();
      preview?.destroy();
      editor?.destroy();
    },
  };
}
