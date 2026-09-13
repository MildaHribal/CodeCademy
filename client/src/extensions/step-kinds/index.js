// Druhy kroků a doplňky labu a projektu (kontrakt kap. 3.4–3.9):
//   - štítky `debug`, `parsons`, `recall`, `choose` (slot brief-head) a čtyři kroky ladění
//     pod popisem (slot brief-after-description),
//   - míra změny u `debug` po úspěšné kontrole,
//   - plocha „Seřaď řádky" místo editoru (registerStepKind),
//   - `# --explain--` po splnění kroku, `# --approaches--` a `# --review--` u labu,
//   - „Než začneš" nad zadáním labu a projektu, rubrika `# --review--` u projektu.
import './step-kinds.css';
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { api } from '../../api.js';
import { progress } from '../../progress.js';
import { appEvents } from '../../core/events.js';
import { registerStepKind, workspaceExtensions } from '../../workspace/extensions.js';
import { projectExtensions } from '../../screens/project.js';
import { createExplainPanel } from '../../lesson/blocks/explain.js';
import { setupApproaches } from './approaches.js';
import { changeWarning, debugChangeRatio } from './change-ratio.js';
import { diffLines } from '../../../../shared/diff.js';
import { debugSteps, kindLabel } from './labels.js';
import { createParsonsEditor } from './parsons.js';
import { createPlanPanel } from './plan.js';
import { createReviewPanel } from './review.js';

registerStepKind({ kind: 'parsons', createEditor: createParsonsEditor });

// ——— Štítek druhu kroku a čtyři kroky ladění ———
workspaceExtensions.register({
  id: 'step-kinds-label',
  order: 5,
  setup(ws) {
    const label = kindLabel(ws.kind);
    if (label) ws.addToSlot('brief-head', label, { order: 10 });
    if (ws.kind === 'debug') ws.addToSlot('brief-after-description', debugSteps({ open: !ws.state().completed }), { order: 10 });
  },
});

// ——— Míra změny u opravy chyby ———
workspaceExtensions.register({
  id: 'step-kinds-debug-change',
  order: 20,
  setup(ws) {
    if (ws.kind !== 'debug') return;
    const notice = h('p', { class: 'debug-change', role: 'status' });
    let remove = null;
    let solution; // undefined = ještě nenačteno, null = nejde načíst

    const clear = () => {
      remove?.();
      remove = null;
    };

    async function solutionFiles() {
      if (solution !== undefined) return solution;
      try {
        const module = await api.moduleWithSolutions(ws.module.sectionId, ws.module.moduleId);
        const full = ws.isWorkshop ? module.steps?.find((step) => step.id === ws.item.id) : module.lab;
        solution = full?.solution ?? null;
      } catch {
        solution = null;
      }
      return solution;
    }

    // Krok bez oblasti --edit-- by editor otevřel na prvním souboru (často index.html). Chyba je
    // ale v souboru, který oprava mění: když uživatel ještě nic neudělal, přepni na něj.
    if (!ws.item.seed.some((file) => file.region) && !ws.state().completed) {
      const startFile = ws.editor.activeFile?.();
      let touched = false;
      ws.on('files-change', () => (touched = true));
      solutionFiles().then((files) => {
        if (ws.signal.aborted || touched || !files || ws.editor.activeFile?.() !== startFile) return;
        const target = files.find((file) => file.content !== ws.item.seed.find((seed) => seed.name === file.name)?.content);
        if (!target) return;
        // Otevři soubor a postav kurzor k prvnímu řádku, který oprava mění (ne na začátek souboru).
        const seedContent = ws.item.seed.find((seed) => seed.name === target.name)?.content ?? '';
        const firstChange = diffLines(seedContent, target.content).find((line) => line.type !== 'same');
        const line = firstChange?.beforeLine ?? firstChange?.afterLine ?? 1;
        if (!ws.editor.revealLine?.(target.name, line) && target.name !== startFile) ws.editor.selectFile?.(target.name);
      });
    }

    ws.on('check-start', clear);
    ws.on('reset', clear);
    ws.on('check-result', async ({ passed, files }) => {
      clear();
      if (!passed) return;
      const needsSolution = !ws.item.seed.some((file) => file.region);
      const result = debugChangeRatio({ seed: ws.item.seed, userFiles: files, solution: needsSolution ? await solutionFiles() : null });
      if (ws.signal.aborted || !result) return;
      const warning = changeWarning(result.ratio, ws.item.meta?.maxChange ?? 0.5);
      if (!warning) return;
      notice.textContent = warning;
      remove = ws.addToSlot('brief-after-hints', notice, { order: 5 });
    });
  },
});

// ——— Vysvětli vlastními slovy (# --explain--) ———
workspaceExtensions.register({
  id: 'step-kinds-explain',
  order: 30,
  setup(ws) {
    const explain = ws.item.explain;
    if (!explain) return;
    const section = h('section', { class: 'step-explain', 'aria-label': 'Vysvětli vlastními slovy' });
    ws.addToSlot('brief-after-hints', section, { order: 30 });
    let shown = false;

    function show({ focus = false } = {}) {
      if (shown) return;
      shown = true;
      const panel = createExplainPanel(explain, { sectionId: ws.module.sectionId, itemId: ws.item.id, title: ws.item.title });
      section.replaceChildren(
        h('h2', { class: 'brief__subtitle' }, 'Vysvětli vlastními slovy'),
        h('p', { class: 'step-explain__lead' }, 'Krok funguje. Teď si ověř, že víš proč — nehodnotí se to.'),
        panel.element,
      );
      if (focus) section.querySelector('textarea')?.focus();
    }

    if (ws.state().completed) show();
    else {
      const early = h('button', { type: 'button', class: 'btn btn--quiet btn--small' }, 'Vysvětlit vlastními slovy už teď');
      early.addEventListener('click', () => show({ focus: true }));
      section.replaceChildren(
        h('h2', { class: 'brief__subtitle' }, 'Vysvětli vlastními slovy'),
        h('p', { class: 'step-explain__lead' }, 'Po splnění kroku tu napíšeš, proč řešení funguje.'),
        h('div', { class: 'actions' }, early),
      );
    }
    ws.on('check-result', ({ passed }) => passed && show());
  },
});

// ——— Lab: jiné přístupy, rubrika, Než začneš ———
workspaceExtensions.register({ id: 'step-kinds-approaches', order: 40, setup: setupApproaches });

workspaceExtensions.register({
  id: 'step-kinds-review',
  order: 50,
  setup(ws) {
    if (!ws.item.review) return;
    const panel = createReviewPanel(ws.item.review);
    panel.highlight(Boolean(ws.state().completed));
    ws.addToSlot('brief-after-hints', panel.element, { order: 50 });
    ws.on('check-result', ({ passed }) => panel.highlight(passed));
  },
});

workspaceExtensions.register({
  id: 'step-kinds-plan',
  order: 15,
  setup(ws) {
    if (ws.isWorkshop || ws.module.type !== 'lab') return;
    // Na ploše je zadání v úzkém sloupci — otevřený plán by ho odsunul pod okraj, proto je sbalený.
    const panel = createPlanPanel({ sectionId: ws.module.sectionId, itemId: ws.item.id, title: ws.item.title, open: false });
    ws.addToSlot('brief-head', panel.element, { order: 30 });
  },
});

// ——— Projekt: Než začneš a rubrika ———
projectExtensions.register({
  id: 'step-kinds-project',
  order: 20,
  setup(project) {
    const { module } = project;
    const plan = createPlanPanel({
      sectionId: module.sectionId,
      itemId: module.id,
      title: module.title,
      open: !progress.isCompleted(module.id),
    });
    project.addToSlot('head', plan.element, { order: 20 });

    const review = module.project?.review;
    if (!review) return;
    const panel = createReviewPanel(review, { isProject: true });
    project.addToSlot('after-stories', panel.element, { order: 50 });
    return appEvents.on('project:check-result', ({ id, passed }) => {
      if (id === module.id) panel.highlight(passed);
    });
  },
});
