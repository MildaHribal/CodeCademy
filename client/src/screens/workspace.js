// Pracovní plocha kroku workshopu a labu: zadání | editor | náhled a konzole.
//
// Tok práce: uživatel píše kód → náhled se živě obnovuje a kód se průběžně ukládá →
// Zkontrolovat (Ctrl+Enter) spustí testy → nápovědy ukážou, co prošlo →
// po úspěchu se krok označí jako splněný a Ctrl+Enter vede na další krok.

import { h, svg, append } from '../dom.js';
import { href } from '../router.js';
import { icons } from '../icons.js';
import { api } from '../api.js';
import { progress } from '../progress.js';
import { renderMarkdown } from '../markdown.js';
import { runTests, mountPreview } from '../run.js';
import { createCodeEditor } from '../components/code-editor.js';
import { createColumns } from '../components/columns.js';
import { createHintList } from '../components/hint-list.js';
import { createConsolePanel } from '../components/console-panel.js';
import { nextModuleLink, backLink } from './nav.js';

/**
 * @param ctx  kontext obrazovky (main.js)
 * @param {{ module, item, nav, steps?: object[], stepIndex?: number }} options
 *   item = krok workshopu nebo lab (výstup parseStep bez řešení)
 */
export function renderWorkspace(ctx, { module, item, nav, steps = null, stepIndex = 0 }) {
  ctx.setLayout('workspace');

  const isWorkshop = Boolean(steps);
  const runtime = item.runtime;
  const isNode = runtime === 'node';
  const nextStep = isWorkshop ? steps[stepIndex + 1] ?? null : null;

  let passed = false; // poslední kontrola prošla
  let changedSincePass = false; // uživatel od té doby upravil kód
  let checking = false;
  let editCount = 0; // počet úprav kódu — pozná, že uživatel psal i během běžící kontroly

  // ——— Levý panel: zadání a nápovědy ———

  const hintList = createHintList(item.hints);
  const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite' });

  const checkButton = h(
    'button',
    { type: 'button', class: 'btn btn--primary', onclick: () => check() },
    h('span', { class: 'btn__label' }, 'Zkontrolovat'),
    h('kbd', { class: 'btn__kbd' }, 'Ctrl+Enter'),
  );
  const resetButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet', onclick: resetCode },
    svg(icons.reset),
    isWorkshop ? 'Obnovit krok' : 'Obnovit zadání',
  );

  const alreadyDone = progress.isCompleted(item.id);
  const briefPane = h(
    'section',
    { class: 'pane pane--brief', 'aria-labelledby': 'brief-title' },
    h(
      'div',
      { class: 'pane__scroll brief' },
      h(
        'p',
        { class: 'brief__position' },
        isWorkshop ? module.title : 'Lab',
        alreadyDone ? h('span', { class: 'badge badge--done' }, svg(icons.check, { size: 14 }), 'Splněno dřív') : null,
      ),
      h('h1', { class: 'brief__title', id: 'brief-title' }, item.title),
      renderMarkdown(item.description, { className: 'prose brief__description' }),
      h('h2', { class: 'brief__subtitle' }, 'Požadavky'),
      hintList.element,
    ),
    h('div', { class: 'pane__footer' }, result, h('div', { class: 'actions' }, checkButton, resetButton)),
  );

  // ——— Prostřední panel: editor ———

  const editorPane = h('section', { class: 'pane pane--editor', 'aria-label': 'Editor kódu' });
  const editor = createCodeEditor(editorPane, {
    files: initialFiles(item),
    label: `Kód: ${item.title}`,
    onChange: handleChange,
    onSubmit: () => check(),
  });
  ctx.onCleanup(() => editor.destroy());

  // ——— Pravý panel: náhled a konzole (u node tlačítko Spustit a výstup) ———

  const consolePanel = createConsolePanel(
    isNode ? { emptyText: 'Tlačítkem Spustit pustíš program a jeho výstup se ukáže tady.' } : undefined,
  );
  const previewHost = h('div', { class: 'output__frame' });
  let preview = null;
  let runButton = null;

  const clearButton = h(
    'button',
    { type: 'button', class: 'btn btn--quiet btn--small', onclick: () => consolePanel.clear() },
    'Vyčistit',
  );

  let outputPane;
  if (isNode) {
    runButton = h('button', { type: 'button', class: 'btn btn--small', onclick: runNodeProgram }, svg(icons.play), 'Spustit');
    outputPane = h(
      'section',
      { class: 'pane pane--output output--node', 'aria-label': 'Výstup programu' },
      h('div', { class: 'pane__head' }, h('h2', {}, 'Výstup'), h('div', { class: 'pane__tools' }, clearButton, runButton)),
      consolePanel.element,
    );
  } else {
    const showPreview = runtime !== 'js';
    outputPane = h(
      'section',
      { class: `pane pane--output${showPreview ? '' : ' output--console-only'}`, 'aria-label': 'Náhled a konzole' },
      showPreview ? h('div', { class: 'pane__head' }, h('h2', {}, 'Náhled')) : null,
      h('div', { class: 'output__preview', hidden: !showPreview }, previewHost),
      h('div', { class: 'pane__head' }, h('h2', {}, 'Konzole'), h('div', { class: 'pane__tools' }, clearButton)),
      consolePanel.element,
    );
  }

  // ——— Poskládání obrazovky ———

  const columns = createColumns(
    [
      { element: briefPane, min: 240, share: 0.3, label: 'zadání' },
      { element: editorPane, min: 280, share: 0.4, label: 'editoru' },
      { element: outputPane, min: 220, share: 0.3, label: 'náhledu' },
    ],
    'akademie.columns.workspace',
  );

  ctx.root.append(
    h(
      'div',
      { class: 'workspace' },
      // Lišta s kroky jen u workshopu; lab je jediné zadání.
      isWorkshop
        ? h(
            'div',
            { class: 'workspace__bar' },
            h('p', { class: 'workspace__position' }, `Krok ${stepIndex + 1} z ${steps.length}`),
            stepper(steps, stepIndex),
          )
        : null,
      columns,
    ),
  );

  // Náhled připojíme až po vložení do stránky — iframe potřebuje být v dokumentu.
  if (!isNode) {
    preview = mountPreview(previewHost, { runtime, files: editor.getFiles() });
    preview.onConsole?.((entry) => consolePanel.receive(entry));
    ctx.onCleanup(() => preview.destroy());
  }

  // Na širokém okně rovnou do editoru; na úzkém by skok kurzoru odscrolloval zadání z obrazovky.
  if (window.matchMedia('(min-width: 901px)').matches) editor.focus();
  ctx.root.querySelector('.stepper__item[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });

  // Ctrl+Enter mimo editor (v editoru ji obslouží CodeMirror a událost dál nepustí).
  const onKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.defaultPrevented) {
      event.preventDefault();
      check();
    }
  };
  document.addEventListener('keydown', onKeyDown);
  ctx.onCleanup(() => document.removeEventListener('keydown', onKeyDown));

  // ——— Chování ———

  function handleChange(files) {
    editCount++;
    progress.saveCode(item.id, files);
    // Náhled se obnoví sám se zpožděním; konzoli před novým spuštěním vyčistí signál 'clear'.
    preview?.update({ runtime, files });
    if (passed) changedSincePass = true;
  }

  async function check() {
    if (checking) return;
    if (passed && !changedSincePass) {
      goNext();
      return;
    }

    checking = true;
    checkButton.disabled = true;
    checkButton.querySelector('.btn__label').textContent = 'Kontroluju…';
    hintList.running();
    showResult('running');
    const editsAtStart = editCount;

    let run;
    try {
      run = await runTests({
        runtime,
        files: editor.getFiles().map(({ name, content }) => ({ name, content })),
        hints: item.hints,
        // Při odchodu z obrazovky se kontrola zruší (zaseknutý test by brzdil i další obrazovku).
        signal: ctx.signal,
        // Limit na jeden test smí krok zvýšit ve frontmatteru (`timeoutMs: 20000`), jinak výchozí.
        ...(typeof item.meta?.timeoutMs === 'number' ? { timeoutMs: item.meta.timeoutMs } : {}),
      });
    } catch (error) {
      if (ctx.signal.aborted) return;
      hintList.reset();
      showResult('error', { message: error.message ?? String(error) });
      finishCheck();
      return;
    }
    if (ctx.signal.aborted) return;

    hintList.setResults(run.results ?? []);
    passed = Boolean(run.ok);
    // Když uživatel během kontroly kód upravil, výsledek platí pro starší verzi —
    // další Ctrl+Enter pak musí kontrolovat znovu, ne přeskočit na další krok.
    changedSincePass = editCount !== editsAtStart;

    if (passed) {
      let saveError = null;
      try {
        await progress.complete(item.id);
      } catch (error) {
        saveError = error;
      }
      if (ctx.signal.aborted) return;
      markStepDone();
      showResult('pass', { saveError, errors: run.errors });
    } else {
      showResult('fail', { run });
    }
    finishCheck();
  }

  function finishCheck() {
    checking = false;
    checkButton.disabled = false;
    checkButton.querySelector('.btn__label').textContent = 'Zkontrolovat';
  }

  function showResult(kind, details = {}) {
    result.dataset.kind = kind;
    result.replaceChildren();

    if (kind === 'running') {
      result.append(h('p', {}, 'Spouštím testy…'));
      return;
    }
    if (kind === 'error') {
      result.append(
        h('p', { class: 'result__title' }, 'Kontrolu se nepodařilo spustit.'),
        h('pre', { class: 'result__pre' }, details.message),
      );
      return;
    }
    if (kind === 'fail') {
      const { run } = details;
      const total = item.hints.length;
      const ok = (run.results ?? []).filter((r) => r.pass).length;
      const skipped = (run.results ?? []).some((r) => r.skipped);
      result.append(
        h('p', { class: 'result__title' }, `Splněno ${ok} z ${total}.`),
        h(
          'p',
          {},
          skipped
            ? 'Tvůj kód se zasekl hned při spuštění (nekonečná smyčka?), takže zbylé požadavky se už neověřovaly. Oprav to a zkontroluj znovu.'
            : 'Oprav požadavky označené křížkem a zkontroluj to znovu.',
        ),
      );
      if (run.errors?.length) {
        result.append(
          h('p', {}, 'Tvůj kód při spuštění skončil chybou:'),
          h('pre', { class: 'result__pre' }, run.errors.join('\n')),
        );
      }
      return;
    }

    // kind === 'pass'
    const nextAction = nextActionButton();
    append(result, [
      h(
        'p',
        { class: 'result__title' },
        svg(icons.check, { size: 18 }),
        isWorkshop ? (nextStep ? 'Krok je splněný.' : 'Workshop je hotový.') : 'Lab je splněný.',
      ),
      details.saveError
        ? h('p', { class: 'result__warning' }, `Splnění se nepodařilo uložit: ${details.saveError.message}`)
        : null,
      h('div', { class: 'result__actions' }, nextAction),
    ]);
  }

  function nextActionButton() {
    if (nextStep) {
      return h(
        'a',
        { class: 'btn btn--primary', href: href.step(nextStep.id) },
        h('span', { class: 'btn__label' }, 'Další krok'),
        h('kbd', { class: 'btn__kbd' }, 'Ctrl+Enter'),
      );
    }
    return h('span', { class: 'result__links' }, nextModuleLink(nav), backLink(nav));
  }

  function goNext() {
    if (nextStep) location.hash = href.step(nextStep.id);
    else location.hash = nav.nextModule ? href.module(nav.nextModule.id) : nav.sectionHref;
  }

  function markStepDone() {
    const current = ctx.root.querySelector('.stepper__item[aria-current="step"]');
    if (current) {
      current.dataset.done = 'true';
      current.setAttribute('aria-label', `Krok ${stepIndex + 1}: ${item.title} (splněno)`);
    }
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
    hintList.reset();
    result.replaceChildren();
    delete result.dataset.kind;
    consolePanel.clear();
    preview?.update({ runtime, files });
    editor.focus();
  }

  async function runNodeProgram() {
    const files = editor.getFiles();
    const main = findMainFile(files, item.meta);
    consolePanel.clear();
    if (!main) {
      consolePanel.error('Krok nemá žádný .js soubor, který by šel spustit.');
      return;
    }
    runButton.disabled = true;
    consolePanel.system(`$ node ${main.name}`);
    try {
      const output = await api.runNodeFile(
        files.map(({ name, content }) => ({ name, content })),
        main.name,
      );
      if (ctx.signal.aborted) return;
      if (output.stdout) consolePanel.log(output.stdout.replace(/\n$/, ''));
      if (output.stderr) consolePanel.error(output.stderr.replace(/\n$/, ''));
      consolePanel.system(
        output.timedOut ? 'Program běžel příliš dlouho, a tak byl ukončen.' : `Program skončil s kódem ${output.code}.`,
      );
    } catch (error) {
      if (!ctx.signal.aborted) consolePanel.error(error.message);
    } finally {
      runButton.disabled = false;
    }
  }
}

const JS_FILE = /\.(m?js|cjs)$/;
const COMMON_MAIN_FILES = ['index.js', 'server.js', 'main.js', 'app.js'];

/**
 * Soubor, který spustí tlačítko Spustit (runtime node). Pořadí:
 * `main` ve frontmatteru kroku → `main` nebo `scripts.start` („node soubor.js“) v package.json
 * → obvyklá jména (index.js, server.js, main.js, app.js) → první .js soubor.
 */
export function findMainFile(files, meta = {}) {
  const byName = (name) => (name ? files.find((f) => f.name === String(name).replace(/^\.\//, '')) : undefined);
  const fromMeta = byName(meta?.main);
  if (fromMeta) return fromMeta;

  const packageFile = byName('package.json');
  if (packageFile) {
    try {
      const pkg = JSON.parse(packageFile.content);
      const startScript = typeof pkg.scripts?.start === 'string' ? pkg.scripts.start.match(/^node\s+(\S+)/) : null;
      const fromPackage = byName(startScript?.[1]) ?? byName(pkg.main);
      if (fromPackage) return fromPackage;
    } catch {
      // rozepsaný package.json — pokračujeme obvyklými jmény
    }
  }

  for (const name of COMMON_MAIN_FILES) {
    const found = byName(name);
    if (found) return found;
  }
  return files.find((f) => JS_FILE.test(f.name));
}

/**
 * Výchozí soubory: seed, přes který se položí rozpracovaný kód uživatele.
 * Zvýrazněná oblast zůstane, pokud se text před ní a za ní nezměnil.
 */
function initialFiles(item) {
  const saved = progress.savedFiles(item.id);
  if (!saved) return item.seed;
  return item.seed.map((file) => {
    const savedFile = saved.find((s) => s.name === file.name);
    if (!savedFile || savedFile.content === file.content) return file;
    return { ...file, content: savedFile.content, region: carryRegion(file, savedFile.content) };
  });
}

function carryRegion(seedFile, content) {
  const region = seedFile.region;
  if (!region) return null;
  const seedLines = seedFile.content.split('\n');
  const lines = content.split('\n');
  const before = seedLines.slice(0, region.start - 1);
  const after = seedLines.slice(region.end);
  if (lines.length < before.length + after.length) return null;
  const sameBefore = before.every((line, i) => lines[i] === line);
  const sameAfter = after.every((line, i) => lines[lines.length - after.length + i] === line);
  return sameBefore && sameAfter ? { start: region.start, end: lines.length - after.length } : null;
}

/** Navigace mezi kroky workshopu: čísla 1…N se stavem splnění. */
function stepper(steps, currentIndex) {
  const prev = steps[currentIndex - 1];
  const next = steps[currentIndex + 1];
  const arrow = (step, icon, label) =>
    step
      ? h('a', { class: 'stepper__arrow', href: href.step(step.id), 'aria-label': label }, svg(icon))
      : h('span', { class: 'stepper__arrow', 'aria-hidden': 'true' }, svg(icon));

  return h(
    'nav',
    { class: 'stepper', 'aria-label': 'Kroky workshopu' },
    arrow(prev, icons.arrowLeft, 'Předchozí krok'),
    h(
      'ol',
      { class: 'stepper__list' },
      steps.map((step, index) => {
        const done = progress.isCompleted(step.id);
        const current = index === currentIndex;
        return h(
          'li',
          {},
          h(
            'a',
            {
              class: 'stepper__item',
              href: href.step(step.id),
              'aria-current': current ? 'step' : null,
              'aria-label': `Krok ${index + 1}: ${step.title}${done ? ' (splněno)' : ''}`,
              title: step.title,
              dataset: { done: String(done) },
            },
            String(index + 1),
          ),
        );
      }),
    ),
    arrow(next, icons.arrowRight, 'Další krok'),
  );
}
