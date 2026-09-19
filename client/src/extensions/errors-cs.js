// Výsledky testů a chyby česky (B3, kontrakt kap. 6.1 a 6.9).
import './errors-cs/errors-cs.css';
import { registerHintResultRenderer, registerRunSummaryRenderer, registerRunTransform } from '../components/test-result.js';
import { workspaceExtensions } from '../workspace/extensions.js';
import { renderHintFailure, renderRunSummary } from './errors-cs/render.js';

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
