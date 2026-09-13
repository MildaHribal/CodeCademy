// Výsledek kontroly v patičce zadání: běží / chyba / nesplněno / splněno.
// Souhrn nesplněné kontroly jde nahradit rendererem (components/test-result.js).

import { h, svg, append } from '../dom.js';
import { icons } from '../icons.js';
import { renderRunSummary } from '../components/test-result.js';

/** Výchozí souhrn nesplněné kontroly. */
function defaultFailSummary({ run, total, passedCount, skipped }) {
  const out = [
    h('p', { class: 'result__title' }, `Splněno ${passedCount} z ${total}.`),
    h(
      'p',
      {},
      skipped
        ? 'Tvůj kód se zasekl hned při spuštění (nekonečná smyčka?), takže zbylé požadavky se už neověřovaly. Oprav to a zkontroluj znovu.'
        : 'Oprav požadavky označené křížkem a zkontroluj to znovu.',
    ),
  ];
  if (run.errors?.length) {
    out.push(h('p', {}, 'Tvůj kód při spuštění skončil chybou:'), h('pre', { class: 'result__pre' }, run.errors.join('\n')));
  }
  return out;
}

/**
 * @param {HTMLElement} result
 * @param {'running'|'error'|'fail'|'pass'} kind
 * @param {{ item, message?, run?, saveError?, nextAction?: Element, passText?: string }} details
 */
export function showResult(result, kind, details = {}) {
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
    const { run, item } = details;
    const results = run.results ?? [];
    const input = {
      run,
      item,
      total: item.hints.length,
      passedCount: results.filter((r) => r.pass).length,
      skipped: results.some((r) => r.skipped),
      context: 'workspace',
    };
    append(result, renderRunSummary(input, defaultFailSummary));
    return;
  }

  // kind === 'pass'
  append(result, [
    h('p', { class: 'result__title' }, svg(icons.check, { size: 18 }), details.passText),
    details.saveError ? h('p', { class: 'result__warning' }, `Splnění se nepodařilo uložit: ${details.saveError.message}`) : null,
    h('div', { class: 'result__actions' }, details.nextAction),
  ]);
}

export function clearResult(result) {
  result.replaceChildren();
  delete result.dataset.kind;
}
