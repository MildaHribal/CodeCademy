// Porovnání s řešením pro pracovní plochu (krok, lab) a pro projekt (kontrakt kap. 3.3, B2).
//
// - Před splněním jde řešení otevřít jen s potvrzením; krok se na serveru uloží jako
//   vyřešený s pomocí (`assisted`) a opakování ho nabídne znovu naslepo.
// - Po splnění se ukáže hned jako „Jak to napsal autor".
// Každé zobrazení se pošle do pokusů jako solutionViewed: true.
import { api } from '../../api.js';
import { progress } from '../../progress.js';
import { recordQuietly } from '../attempts/api.js';
import { openSolutionDiff } from './dialog.js';

const CONFIRM_BEFORE_PASS = {
  title: 'Chceš vidět autorovo řešení?',
  text:
    'Uvidíš hotový kód. Krok se pak uloží jako vyřešený s pomocí a zítra se ti nabídne v opakování, ' +
    'kde ho napíšeš znovu bez návodu. Zkusit to ještě jednou sám ti dá víc.',
  accept: 'Ukázat řešení',
  reject: 'Ještě to zkusím',
};

const INTRO_AFTER_PASS = 'Jak to napsal autor — tvoje řešení je taky správné. Podívej se, v čem se liší.';
const INTRO_BEFORE_PASS = 'Autorovo řešení. Řádky se znaménkem + v tvém kódu chybí, řádky s − autor nemá.';

/** Řešení položky z modulu načteného i s řešeními (?solution=1). */
function authorFiles(moduleWithSolutions, itemId) {
  switch (moduleWithSolutions.type) {
    case 'workshop':
      return moduleWithSolutions.steps.find((step) => step.id === itemId)?.solution ?? [];
    case 'lab':
      return moduleWithSolutions.lab.solution ?? [];
    case 'project':
      return moduleWithSolutions.project.solution ?? [];
    default:
      return [];
  }
}

async function loadAuthorFiles(module, itemId) {
  const full = await api.moduleWithSolutions(module.sectionId, module.moduleId);
  return authorFiles(full, itemId);
}

/**
 * Otevře porovnání na pracovní ploše.
 * @param ws  API pracovní plochy
 */
export function openWorkspaceSolution(ws) {
  const state = ws.state();
  const solved = state.passed || state.completed;
  return open({
    id: ws.item.id,
    solved,
    onCleanup: ws.onCleanup,
    load: async () => ({ mine: ws.getFiles(), author: await loadAuthorFiles(ws.module, ws.item.id) }),
  });
}

/**
 * Otevře porovnání u projektu: soubory ze složky projektu na disku × složka solution/.
 * @param project  API obrazovky projektu
 * @param {{ passed?: boolean }} [options]  passed = kontrola v tomhle zobrazení prošla
 */
export function openProjectSolution(project, { passed = false } = {}) {
  const { module } = project;
  return open({
    id: project.id,
    solved: passed || progress.isCompleted(project.id),
    onCleanup: project.onCleanup,
    load: async () => {
      const [state, author] = await Promise.all([api.projectFiles(module.sectionId, module.moduleId), loadAuthorFiles(module, project.id)]);
      return { mine: state.exists ? state.files : [], author };
    },
  });
}

function open({ id, solved, onCleanup, load }) {
  const handle = openSolutionDiff({
    heading: solved ? 'Jak to napsal autor' : 'Porovnání s řešením',
    intro: solved ? INTRO_AFTER_PASS : INTRO_BEFORE_PASS,
    confirm: solved ? null : CONFIRM_BEFORE_PASS,
    load,
    onViewed: () => recordQuietly({ id, solutionViewed: true }),
    labels: { mine: 'Tvůj kód', author: 'Autor' },
  });
  onCleanup?.(() => handle.close()); // odchod z obrazovky okno zavře
  return handle;
}
