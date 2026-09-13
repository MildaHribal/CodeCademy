// Zobrazení výsledků testů — rozšiřitelné bez úprav pracovní plochy, projektu a seznamu nápověd.
//
// 1) Transformace výsledku (před zobrazením, pro všechny obrazovky):
//      registerRunTransform({ id, order, transform(run, { item, files, runtime }) → run })
//    Smí přidat pole (např. `results[i].actual/expected`, `results[i].note`) nebo označit
//    požadavky jako neověřené: `{ ...result, skipped: true, note: 'Neověřeno — kód nejde spustit.' }`.
//
// 2) Detail nesplněného požadavku (pod textem nápovědy):
//      registerHintResultRenderer({ id, order, render({ result, hint, index, run, item }) → Element | null })
//    Použije se první renderer (podle order), který vrátí prvek. Výchozí: rozbalovací „Proč to neprošlo".
//    `result` nese pole z RunResult (kontrakt kap. 6.1): error, errorName, a u asercí operator,
//    actual, expected, generatedMessage, diff. České zobrazení je v extensions/errors-cs.js.
//
// 3) Souhrn neúspěšné kontroly (v patičce pracovní plochy a u projektu):
//      registerRunSummaryRenderer({ id, order, render({ run, item, total, passedCount, skipped, context }) → Element[] | Element | null })
//    Použije se první renderer, který vrátí něco jiného než null. context: 'workspace' | 'project'.
import { h } from '../dom.js';
import { createRegistry } from '../core/registry.js';

const transforms = createRegistry('Transformace výsledku testů');
const hintRenderers = createRegistry('Renderer výsledku požadavku');
const summaryRenderers = createRegistry('Renderer souhrnu kontroly');

export const registerRunTransform = (entry) => transforms.add(entry);
export const registerHintResultRenderer = (entry) => hintRenderers.add(entry);
export const registerRunSummaryRenderer = (entry) => summaryRenderers.add(entry);

/** Projde výsledek všemi registrovanými transformacemi. */
export function transformRun(run, context) {
  let current = run;
  for (const entry of transforms.list()) {
    try {
      current = entry.transform(current, context) ?? current;
    } catch (error) {
      console.error(`Transformace výsledku „${entry.id}" selhala`, error);
    }
  }
  return current;
}

function firstRendered(registry, input) {
  for (const entry of registry.list()) {
    try {
      const rendered = entry.render(input);
      if (rendered != null) return rendered;
    } catch (error) {
      console.error(`Renderer „${entry.id}" selhal`, error);
    }
  }
  return null;
}

/** Detail nesplněného požadavku: registrovaný renderer, jinak výchozí rozbalovací chyba. */
export function renderHintFailure(input) {
  const custom = firstRendered(hintRenderers, input);
  if (custom) return custom;
  if (!input.result?.error) return null;
  return h(
    'details',
    { class: 'hint__error' },
    h('summary', {}, 'Proč to neprošlo'),
    h('pre', {}, input.result.error), // text chyby vkládáme jako text, ne jako HTML
  );
}

/** Souhrn neúspěšné kontroly jako pole prvků. `fallback` = výchozí podoba dané obrazovky. */
export function renderRunSummary(input, fallback) {
  const custom = firstRendered(summaryRenderers, input);
  const rendered = custom ?? fallback(input);
  return [rendered].flat().filter(Boolean);
}
