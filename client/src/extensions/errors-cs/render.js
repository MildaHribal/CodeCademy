// Prvky českého zobrazení výsledků testů: detail nesplněného požadavku a souhrn kontroly.
// Texty z uživatelova kódu (hodnoty, hlášky) jdou vždy přes textContent, nikdy jako HTML.
import { h } from '../../dom.js';
import { refHref } from '../../../../shared/refs.js';
import { explainError, groupUndefinedNames } from '../../../../shared/errors-cs.js';
import {
  comparesEquality, explainResult, firstFailedIndex, highlightDifference, inlineCodeSegments, locationInMessage, valueLabels,
} from './format.js';

/** Text s `inline kódem` jako prvky. */
function inlineText(text) {
  return inlineCodeSegments(text).map((part) => (part.code ? h('code', {}, part.text) : part.text));
}

/**
 * České vysvětlení chyby: věta, nejčastější příčiny a odkaz na výklad, pod tím anglický originál.
 * @param {{ id, title, causes, see }} explanation  výsledek explainError
 * @param {string | null} original  anglická hláška (null = nezobrazovat)
 */
export function renderExplanation(explanation, original = null) {
  const href = explanation.see ? refHref(explanation.see) : null;
  return h(
    'div',
    { class: 'error-explain', dataset: { errorId: explanation.id } },
    h('p', { class: 'error-explain__title' }, inlineText(explanation.title)),
    h('p', { class: 'error-explain__label' }, 'Nejčastěji to způsobí:'),
    h('ul', { class: 'error-explain__causes' }, explanation.causes.map((cause) => h('li', {}, inlineText(cause)))),
    href ? h('p', { class: 'error-explain__see' }, h('a', { href }, 'Kde se o tom píše ve výkladu')) : null,
    original ? h('pre', { class: 'error-explain__original', lang: 'en' }, original) : null,
  );
}

/** Hodnota se zvýrazněnou lišící se částí. */
function renderValue(segments) {
  return h(
    'code',
    { class: 'test-values__value' },
    segments.map((part) => (part.changed ? h('mark', { class: 'test-values__changed' }, part.text || ' ') : part.text)),
  );
}

/** Dva řádky „Očekávám / Tvůj kód vrátil"; u deepEqual jen klíče, které se liší. */
function renderValues(result) {
  const labels = valueLabels(result.operator);
  if (Array.isArray(result.diff) && result.diff.length) {
    return h(
      'table',
      { class: 'test-values test-values--diff' },
      h('caption', {}, 'Liší se:'),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Kde'), h('th', { scope: 'col' }, labels.expected), h('th', { scope: 'col' }, labels.actual))),
      h(
        'tbody',
        {},
        result.diff.map((entry) => {
          const parts = highlightDifference(entry.expected, entry.actual);
          return h('tr', {}, h('th', { scope: 'row' }, h('code', {}, entry.path)), h('td', {}, renderValue(parts.expected)), h('td', {}, renderValue(parts.actual)));
        }),
      ),
    );
  }
  const parts = comparesEquality(result.operator)
    ? highlightDifference(result.expected, result.actual)
    : { expected: [{ text: result.expected, changed: false }], actual: [{ text: result.actual, changed: false }] };
  const showExpected = !['==', 'ok'].includes(result.operator);
  return h(
    'dl',
    { class: 'test-values' },
    h('dt', {}, labels.expected),
    h('dd', {}, showExpected ? renderValue(parts.expected) : null),
    h('dt', {}, labels.actual),
    h('dd', {}, renderValue(parts.actual)),
  );
}

/**
 * Detail nesplněného požadavku (registerHintResultRenderer).
 * @param {{ result, run }} input
 */
export function renderHintFailure({ result, run }) {
  if (!result || result.pass || result.skipped || !result.error) return null;
  const hasValues = result.actual !== undefined && result.expected !== undefined;
  const explanation = explainResult(result);

  return h(
    'details',
    // První selhaný požadavek je rozbalený, ať student hned vidí, co nesedí.
    { class: 'hint__error test-failure', open: firstFailedIndex(run) === result.index },
    h('summary', {}, 'Proč to neprošlo'),
    // Vygenerovaná zpráva jen opakuje hodnoty, které jsou vidět pod ní; vysvětlení má vlastní větu.
    (hasValues && result.generatedMessage) || explanation ? null : h('p', { class: 'test-failure__message' }, result.error),
    hasValues ? renderValues(result) : null,
    explanation ? renderExplanation(explanation, result.error) : null,
  );
}

/**
 * Souhrn nesplněné kontroly (registerRunSummaryRenderer): kód nejde spustit, nebo chyby kódu.
 * @param {{ run, total, passedCount, skipped, context }} input
 * @param {{ revealLine?: (file: string, line: number) => boolean } | null} editor  jen na pracovní ploše
 */
export function renderRunSummary({ run, total, passedCount, skipped, context }, editor) {
  if (run.syntaxError) return renderSyntaxSummary(run.syntaxError, { total, context, editor });
  const errors = run.errors ?? [];
  if (!errors.length) return null;

  const grouped = groupUndefinedNames(errors);
  return [
    h('p', { class: 'result__title' }, `Splněno ${passedCount} z ${total}.`),
    h(
      'p',
      {},
      skipped
        ? 'Tvůj kód se zasekl hned při spuštění (nekonečná smyčka?), takže zbylé požadavky se už neověřovaly.'
        : 'Oprav požadavky označené křížkem a zkontroluj to znovu.',
    ),
    h('p', {}, grouped.length === 1 ? 'Tvůj kód při spuštění skončil chybou:' : 'Tvůj kód při spuštění skončil chybami:'),
    h('ul', { class: 'run-errors' }, grouped.slice(0, 5).map((entry) => renderRunError(entry, editor))),
    grouped.length > 5 ? h('p', { class: 'run-errors__more' }, `A ještě ${grouped.length - 5} dalších.`) : null,
  ];
}

function renderRunError(entry, editor) {
  const explanation = entry.names
    ? {
      id: 'not-defined-many',
      title: `Používáš jména, která ještě neexistují: ${entry.names.map((name) => `\`${name}\``).join(', ')}.`,
      causes: ['Funkce ze zadání ještě nejsou napsané — napiš je, nebo aspoň jejich prázdné kostry.', 'Překlep nebo jiná velikost písmen ve jméně.'],
      see: null,
    }
    : explainError(entry.text);
  const where = locationInMessage(entry.text);
  return h(
    'li',
    { class: 'run-errors__item' },
    explanation ? renderExplanation(explanation, entry.text) : h('pre', { class: 'result__pre' }, entry.text),
    where ? jumpButton(where, editor) : null,
  );
}

function renderSyntaxSummary(syntaxError, { total, context, editor }) {
  const original = `SyntaxError: ${syntaxError.message}`;
  const explanation = explainError(original);
  return [
    h('p', { class: 'result__title' }, 'Kód nejde spustit.'),
    h(
      'p',
      {},
      `V souboru ${syntaxError.file} na řádku ${syntaxError.line} je syntaktická chyba, takže se `,
      total === 1 ? 'požadavek neověřoval.' : `žádný z ${total} požadavků neověřoval.`,
      context === 'project' ? ' Oprav ji ve VS Code a zkontroluj znovu.' : '',
    ),
    explanation ? renderExplanation(explanation, `${original} (${syntaxError.file}:${syntaxError.line}:${syntaxError.column})`) : h('pre', { class: 'result__pre' }, original),
    jumpButton({ file: syntaxError.file, line: syntaxError.line }, editor),
  ];
}

/** „Skočit na řádek N" — jen když je po ruce editor se souborem. */
function jumpButton(where, editor) {
  if (typeof editor?.revealLine !== 'function') return null;
  return h(
    'button',
    {
      type: 'button',
      class: 'btn btn--small run-errors__jump',
      onclick: (event) => {
        if (!editor.revealLine(where.file, where.line)) event.currentTarget.disabled = true;
      },
    },
    `Skočit na řádek ${where.line}`,
    where.file ? h('span', { class: 'run-errors__file' }, ` (${where.file})`) : null,
  );
}
