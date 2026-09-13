// Výpočty pro české zobrazení výsledků testů — bez DOM, aby šly testovat v Node
// (tools/errors-cs-unit.test.js).
import { explainError } from '../../../../shared/errors-cs.js';

/** Popisky dvou řádků hodnot podle druhu aserce. */
export function valueLabels(operator) {
  switch (operator) {
    case 'notStrictEqual':
    case 'notDeepStrictEqual':
    case 'notEqual':
    case 'notDeepEqual':
      return { expected: 'Nemá být', actual: 'Tvůj kód vrátil' };
    case 'match':
      return { expected: 'Má odpovídat výrazu', actual: 'Tvůj kód vrátil' };
    case 'doesNotMatch':
      return { expected: 'Nemá odpovídat výrazu', actual: 'Tvůj kód vrátil' };
    case '==':
    case 'ok':
      return { expected: 'Očekávám pravdivou hodnotu', actual: 'Tvůj kód vrátil' };
    default:
      return { expected: 'Očekávám', actual: 'Tvůj kód vrátil' };
  }
}

/** Má smysl zvýrazňovat rozdíl? (u „nemá být" a regulárních výrazů ne) */
export function comparesEquality(operator) {
  return ['strictEqual', 'deepStrictEqual', 'equal', 'deepEqual'].includes(operator);
}

/**
 * Rozdělí dva texty na společný začátek, lišící se prostředek a společný konec.
 * `'[1, 2, 3]'` × `'[1, 5, 3]'` → prostředek `2` × `5`.
 * @returns {{ expected: Array<{ text: string, changed: boolean }>, actual: Array<{ text: string, changed: boolean }> }}
 */
export function highlightDifference(expected, actual) {
  const a = String(expected ?? '');
  const b = String(actual ?? '');
  if (a === b) return { expected: [{ text: a, changed: false }], actual: [{ text: b, changed: false }] };

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let end = 0;
  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end++;

  const split = (text) => [
    { text: text.slice(0, start), changed: false },
    { text: text.slice(start, text.length - end), changed: true },
    { text: text.slice(text.length - end), changed: false },
  ].filter((part) => part.text !== '' || part.changed);
  return { expected: split(a), actual: split(b) };
}

/** Index prvního selhaného (ne přeskočeného) požadavku, nebo -1. */
export function firstFailedIndex(run) {
  const failed = (run?.results ?? []).filter((result) => !result.pass && !result.skipped);
  return failed.length ? Math.min(...failed.map((result) => result.index)) : -1;
}

/**
 * České vysvětlení chyby jednoho výsledku. Aserce (vlastní i vygenerované zprávy) už česky jsou,
 * vysvětlují se jen chyby kódu (TypeError…) a hlášky runneru (nekonečná smyčka, časový limit).
 */
export function explainResult(result) {
  if (!result?.error || result.errorName === 'AssertionError') return null;
  const name = result.errorName && !String(result.error).startsWith(result.errorName) ? `${result.errorName}: ` : '';
  return explainError(`${name}${result.error}`);
}

/** Místo v hlášce `… (script.js:3)` → { file, line }, nebo null. */
export function locationInMessage(text) {
  const found = /\(([^()\s:]+):(\d+)\)\s*$/.exec(String(text ?? ''));
  return found ? { file: found[1], line: Number(found[2]) } : null;
}

/** Text s `inline kódem` → úseky pro vykreslení (kód jako <code>, zbytek jako text). */
export function inlineCodeSegments(text) {
  return String(text ?? '')
    .split('`')
    .map((part, index) => ({ text: part, code: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}
