// Výsledky testů a chyby česky (B3, kontrakt kap. 6.1 a 6.9).
//
// - Kód, který nejde spustit (`run.syntaxError`): požadavky „Neověřeno — kód nejde spustit"
//   a nahoře souhrn s českým vysvětlením a tlačítkem „Skočit na řádek N".
// - Nesplněný požadavek: pod zprávou autora „Očekávám / Tvůj kód vrátil" se zvýrazněným
//   rozdílem (u deepEqual jen lišící se klíče); u chyb kódu česká věta, příčiny a odkaz
//   na výklad, anglický originál pod tím. První selhaný požadavek je rozbalený.
// - Chyby při spuštění v souhrnu: nenapsané funkce sloučené do jednoho řádku.
import './errors-cs/errors-cs.css';
import { registerHintResultRenderer, registerRunSummaryRenderer, registerRunTransform } from '../components/test-result.js';
import { workspaceExtensions } from '../workspace/extensions.js';
import { renderHintFailure, renderRunSummary } from './errors-cs/render.js';

// Editor pracovní plochy podle položky (souhrn výsledku dostane jen `item`, ne plochu).
const editorsByItem = new WeakMap();

workspaceExtensions.register({
  id: 'errors-cs',
  order: 10,
  setup(ws) {
    editorsByItem.set(ws.item, {
      revealLine: (file, line) => (typeof ws.editor.revealLine === 'function' ? ws.editor.revealLine(file, line) !== false : false),
    });
    return () => editorsByItem.delete(ws.item);
  },
});

registerRunTransform({
  id: 'errors-cs',
  order: 10,
  transform(run) {
    if (!run?.syntaxError) return run;
    return {
      ...run,
      results: (run.results ?? []).map((result) => ({ ...result, skipped: true, pass: false, note: 'Neověřeno — kód nejde spustit.' })),
    };
  },
});

registerHintResultRenderer({
  id: 'errors-cs',
  order: 10,
  render: (input) => renderHintFailure(input),
});

registerRunSummaryRenderer({
  id: 'errors-cs',
  order: 10,
  render: (input) => renderRunSummary(input, input.context === 'workspace' ? editorsByItem.get(input.item) ?? null : null),
});
