// Porovnání s řešením (B2, kontrakt kap. 3.3):
// - po splnění kroku, labu nebo projektu tlačítko „Jak to napsal autor",
// - na začátku kroku N+1 proužek „Pokračuješ autorovým řešením kroku N" s rozdílem oproti
//   tvému kódu (seed kroku N+1 je autorovo řešení kroku N, kontrakt kap. 3.1).
// Před splněním se řešení otevírá z nápověd jako poslední stupeň (hints.js).
import './solution-diff/solution-diff.css';
import { h } from '../dom.js';
import { appEvents } from '../core/events.js';
import { progress } from '../progress.js';
import { workspaceExtensions } from '../workspace/extensions.js';
import { projectExtensions } from '../screens/project.js';
import { openSolutionDiff } from './solution-diff/dialog.js';
import { differsFromAuthor, plainFiles } from './solution-diff/hunks.js';
import { openProjectSolution, openWorkspaceSolution } from './solution-diff/open.js';

function authorButton(onclick) {
  return h('button', { type: 'button', class: 'btn btn--quiet solution-diff-button', hidden: true, onclick }, 'Jak to napsal autor');
}

workspaceExtensions.register({
  id: 'solution-diff',
  order: 20,
  setup(ws) {
    const button = authorButton(() => openWorkspaceSolution(ws));
    ws.addToSlot('actions', button, { order: 20 });
    const syncButton = () => {
      const { passed, completed } = ws.state();
      button.hidden = !(passed || completed);
    };
    syncButton();
    ws.on('check-result', syncButton);
    ws.on('step-complete', syncButton);

    if (ws.isWorkshop && ws.stepIndex > 0) addContinuationBanner(ws);
  },
});

/**
 * Proužek na začátku kroku: uživatel pokračuje autorovým řešením předchozího kroku,
 * a jeho vlastní kód z předchozího kroku se od něj liší. Rozdíl ukáže bez potvrzení —
 * seed tohoto kroku je vidět v editoru tak jako tak.
 */
function addContinuationBanner(ws) {
  const previous = ws.steps[ws.stepIndex - 1];
  const saved = progress.savedFiles(previous.id);
  if (!saved) return;
  const seed = plainFiles(ws.item.seed);
  const seedNames = new Set(seed.map((file) => file.name));
  const mine = plainFiles(saved).filter((file) => seedNames.has(file.name));
  if (mine.length === 0 || !differsFromAuthor(mine, seed)) return;

  const number = ws.stepIndex; // krok N (1-based) = index předchozího kroku + 1
  const showDiff = () => {
    const handle = openSolutionDiff({
      heading: `Tvůj krok ${number} × autorovo řešení`,
      intro: `Tenhle krok začíná autorovým řešením kroku ${number}. Tady vidíš, v čem se liší od kódu, který jsi v kroku ${number} napsal ty.`,
      load: async () => ({ mine, author: seed }),
      labels: { mine: `Tvůj kód z kroku ${number}`, author: 'Autor' },
    });
    ws.onCleanup(() => handle.close());
  };
  const banner = h(
    'p',
    { class: 'solution-diff-banner', role: 'note' },
    h('span', { class: 'solution-diff-banner__text' }, `Pokračuješ autorovým řešením kroku ${number}.`),
    h('button', { type: 'button', class: 'btn btn--small solution-diff-banner__button', onclick: showDiff }, 'Rozdíl oproti tvému'),
  );
  ws.addToSlot('brief-head', banner, { order: 50 });
}

projectExtensions.register({
  id: 'solution-diff',
  order: 20,
  setup(project) {
    let passed = false;
    const button = authorButton(() => openProjectSolution(project, { passed }));
    button.hidden = false;
    const box = h('div', { class: 'actions solution-diff-project', hidden: true }, button);
    project.addToSlot('after-stories', box, { order: 20 });
    const syncButton = () => {
      box.hidden = !(passed || progress.isCompleted(project.id));
    };
    syncButton();
    const off = appEvents.on('project:check-result', (event) => {
      if (event.id !== project.id) return;
      passed = event.passed;
      syncButton();
    });
    return off;
  },
});
