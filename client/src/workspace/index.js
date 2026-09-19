
import { h } from '../dom.js';
import { href } from '../router.js';
import { progress } from '../progress.js';
import { runTests } from '../run.js';
import { appEvents } from '../core/events.js';
import { createSlots } from '../core/slots.js';
import { createCodeEditor } from '../components/code-editor.js';
import { createColumns } from '../components/columns.js';
import { createHintList } from '../components/hint-list.js';
import { transformRun } from '../components/test-result.js';
import { nextModuleLink, backLink } from '../screens/nav.js';
import { createBriefPane } from './brief.js';
import { createBrowserOutput } from './output-browser.js';
import { createNodeOutput } from './output-node.js';
import { clearResult, showResult } from './result.js';
import { createStepperBar, markStepperDone } from './stepper.js';
import { stepKind, workspaceExtensions } from './extensions.js';
import { initialFiles } from './files.js';

export { findMainFile } from './files.js';

const SLOT_NAMES = ['brief-head', 'brief-after-description', 'brief-after-hints', 'actions', 'output-tools', 'output-after', 'bar'];

export function renderWorkspace(ctx, { module, item, nav, steps = null, stepIndex = 0 }) {
  ctx.setLayout('workspace');

  const isWorkshop = Boolean(steps);
  const runtime = item.runtime;
  // Knihovny kroku (kontrakt kap. 6.10) — do náhledu i do testů; u node a js jsou prázdné.
  const libs = Array.isArray(item.libs) ? item.libs : [];
  const isNode = runtime === 'node';
  // Druh kroku (kontrakt kap. 3.1): step | debug | parsons | recall | choose. Vlastní plochu místo
  const kind = item.kind ?? item.meta?.kind ?? 'step';
  const nextStep = isWorkshop ? steps[stepIndex + 1] ?? null : null;

  let passed = false;
  let changedSincePass = false;
  let checking = false;
  let editCount = 0;
  let failedChecks = 0;

  const slots = createSlots(SLOT_NAMES, {
    'output-tools': !isNode && runtime !== 'js' ? { className: 'pane__tools' } : {},
  });

  const hintList = createHintList(item.hints, { item });
  const brief = createBriefPane({ item, module, isWorkshop, hintList, slots, onCheck: () => check(), onReset: resetCode });
  const result = brief.result;

  const editorPane = h('section', { class: 'pane pane--editor', 'aria-label': 'Editor kódu' });
  const editorOptions = {
    files: initialFiles(item),
    label: `Kód: ${item.title}`,
    onChange: handleChange,
    onSubmit: () => check(),
    runtime,
    context: 'workspace',
    item,
  };
  const customKind = stepKind(kind);
  const editor = customKind ? customKind.createEditor(editorPane, editorOptions) : createCodeEditor(editorPane, editorOptions);
  ctx.onCleanup(() => editor.destroy());

  const output = isNode
    ? createNodeOutput({ item, slots, signal: ctx.signal, getFiles: () => editor.getFiles() })
    : createBrowserOutput({ runtime, libs, slots });
  const consolePanel = output.consolePanel;
  let preview = null;

  const consoleBelowEditor = runtime === 'js';
  const columns = consoleBelowEditor
    ? createColumns(
        [
          { element: brief.element, min: 240, share: 0.34, label: 'zadání' },
          { element: h('div', { class: 'workspace__stack' }, editorPane, output.element), min: 360, share: 0.66, label: 'editoru a konzole' },
        ],
        'akademie.columns.workspace-js',
      )
    : createColumns(
        [
          { element: brief.element, min: 240, share: 0.3, label: 'zadání' },
          { element: editorPane, min: 280, share: 0.4, label: 'editoru' },
          { element: output.element, min: 220, share: 0.3, label: 'náhledu' },
        ],
        'akademie.columns.workspace',
      );

  const root = h(
    'div',
    { class: `workspace workspace--${runtime}` },
    isWorkshop ? createStepperBar({ steps, stepIndex, slot: slots.element('bar') }) : null,
    columns,
  );
  ctx.root.append(root);

  if (!isNode) {
    preview = output.mount(editor.getFiles());
    ctx.onCleanup(() => preview.destroy());
  }

  if (window.matchMedia('(min-width: 901px)').matches) editor.focus();
  ctx.root.querySelector('.stepper__item[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.defaultPrevented) {
      event.preventDefault();
      check();
    }
  };
  document.addEventListener('keydown', onKeyDown);
  ctx.onCleanup(() => document.removeEventListener('keydown', onKeyDown));

  const ws = {
    item,
    module,
    steps,
    stepIndex,
    nav,
    runtime,
    kind,
    isWorkshop,
    isNode,
    signal: ctx.signal,
    onCleanup: ctx.onCleanup,
    editor,
    get preview() {
      return preview;
    },
    consolePanel,
    hintList,
    elements: { root, brief: brief.element, editor: editorPane, output: output.element, result, previewHost: output.previewHost ?? null },
    getFiles: () => editor.getFiles(),
    setFiles(files, { save = true } = {}) {
      editor.setFiles(files);
      editCount++;
      const current = editor.getFiles();
      if (save) progress.saveCode(item.id, current);
      preview?.update({ runtime, libs, files: current });
      if (passed) {
        changedSincePass = true;
        brief.setPassed(false);
      }
    },
    check: () => check(),
    focusEditor: () => editor.focus(),
    state: () => ({ passed, checking, changedSincePass, completed: progress.isCompleted(item.id), failedChecks }),
    addToSlot: slots.addToSlot,
    on(event, fn) {
      const off = appEvents.on(`workspace:${event}`, (payload) => {
        if (payload.ws === ws) fn(payload);
      });
      ctx.onCleanup(off);
      return off;
    },
  };
  const emit = (event, payload = {}) => appEvents.emit(`workspace:${event}`, { ws, id: item.id, ...payload });

  ctx.onCleanup(workspaceExtensions.mount(ws));
  emit('mount');

  function handleChange(files) {
    editCount++;
    progress.saveCode(item.id, files);
    preview?.update({ runtime, libs, files });
    if (passed) {
      changedSincePass = true;
      brief.setPassed(false);
    }
    emit('files-change', { files });
  }

  async function check() {
    if (checking) return;
    if (passed && !changedSincePass) {
      goNext();
      return;
    }

    checking = true;
    brief.setChecking(true);
    hintList.running();
    showResult(result, 'running');
    const editsAtStart = editCount;
    const files = editor.getFiles().map(({ name, content }) => ({ name, content }));
    emit('check-start', { files });

    let run;
    try {
      run = await runTests({
        runtime,
        libs,
        files,
        hints: item.hints,
        signal: ctx.signal,
        ...(typeof item.meta?.timeoutMs === 'number' ? { timeoutMs: item.meta.timeoutMs } : {}),
      });
    } catch (error) {
      if (ctx.signal.aborted) return;
      hintList.reset();
      showResult(result, 'error', { message: error.message ?? String(error) });
      finishCheck();
      emit('check-error', { error });
      return;
    }
    if (ctx.signal.aborted) return;

    run = transformRun(run, { item, files, runtime });
    hintList.setResults(run.results ?? [], run);
    passed = Boolean(run.ok);
    if (!passed) failedChecks++;
    changedSincePass = editCount !== editsAtStart;

    if (passed) {
      let saveError = null;
      try {
        await progress.complete(item.id);
      } catch (error) {
        saveError = error;
      }
      if (ctx.signal.aborted) return;
      markStepperDone(ctx.root, { stepIndex, title: item.title });
      brief.setPassed(!changedSincePass);
      showResult(result, 'pass', {
        item,
        saveError,
        passText: isWorkshop ? (nextStep ? 'Krok je splněný.' : 'Workshop je hotový.') : 'Lab je splněný.',
        nextAction: nextActionButton(),
      });
      finishCheck();
      emit('check-result', { result: run, files, passed });
      if (!saveError) emit('step-complete');
      return;
    }
    showResult(result, 'fail', { item, run });
    finishCheck();
    emit('check-result', { result: run, files, passed });
  }

  function finishCheck() {
    checking = false;
    brief.setChecking(false);
  }

  function nextActionButton() {
    if (nextStep) {
      return h(
        'a',
        { class: 'btn btn--primary', 'aria-label': 'Next step / Další krok', href: href.step(nextStep.id) },
        h('span', { class: 'btn__label' }, 'Next step'),
        h('kbd', { class: 'btn__kbd' }, 'Ctrl+Enter'),
      );
    }
    return h('span', { class: 'result__links' }, nextModuleLink(nav), nav.nextModule ? backLink(nav) : null);
  }

  function goNext() {
    if (nextStep) location.hash = href.step(nextStep.id);
    else location.hash = nav.nextModule ? href.module(nav.nextModule.id) : nav.sectionHref;
  }

  function resetCode() {
    const question = isWorkshop
      ? 'Vrátit kód kroku do výchozího stavu? Tvoje úpravy v tomhle kroku se smažou.'
      : 'Vrátit kód labu do výchozího stavu? Tvoje úpravy se smažou.';
    if (!window.confirm(question)) return;
    editor.setFiles(item.seed);
    editCount++;
    const files = editor.getFiles();
    progress.saveCode(item.id, files);
    passed = false;
    brief.setPassed(false);
    hintList.reset();
    clearResult(result);
    consolePanel.clear();
    preview?.update({ runtime, libs, files });
    editor.focus();
    emit('reset', { files });
  }
}
