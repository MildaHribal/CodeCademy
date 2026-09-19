//    `result` nese pole z RunResult (kontrakt kap. 6.1): error, errorName, a u asercí operator,
import { h } from '../dom.js';
import { createRegistry } from '../core/registry.js';

const transforms = createRegistry('Transformace výsledku testů');
const hintRenderers = createRegistry('Renderer výsledku požadavku');
const summaryRenderers = createRegistry('Renderer souhrnu kontroly');

export const registerRunTransform = (entry) => transforms.add(entry);
export const registerHintResultRenderer = (entry) => hintRenderers.add(entry);
export const registerRunSummaryRenderer = (entry) => summaryRenderers.add(entry);

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

export function renderHintFailure(input) {
  const custom = firstRendered(hintRenderers, input);
  if (custom) return custom;
  if (!input.result?.error) return null;
  return h(
    'details',
    { class: 'hint__error' },
    h('summary', {}, 'Proč to neprošlo'),
    h('pre', {}, input.result.error),
  );
}

export function renderRunSummary(input, fallback) {
  const custom = firstRendered(summaryRenderers, input);
  const rendered = custom ?? fallback(input);
  return [rendered].flat().filter(Boolean);
}
