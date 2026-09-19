import { explainError } from '../../../../shared/errors-cs.js';

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

export function comparesEquality(operator) {
  return ['strictEqual', 'deepStrictEqual', 'equal', 'deepEqual'].includes(operator);
}

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

export function firstFailedIndex(run) {
  const failed = (run?.results ?? []).filter((result) => !result.pass && !result.skipped);
  return failed.length ? Math.min(...failed.map((result) => result.index)) : -1;
}

export function explainResult(result) {
  if (!result?.error || result.errorName === 'AssertionError') return null;
  const name = result.errorName && !String(result.error).startsWith(result.errorName) ? `${result.errorName}: ` : '';
  return explainError(`${name}${result.error}`);
}

export function locationInMessage(text) {
  const found = /\(([^()\s:]+):(\d+)\)\s*$/.exec(String(text ?? ''));
  return found ? { file: found[1], line: Number(found[2]) } : null;
}

export function inlineCodeSegments(text) {
  return String(text ?? '')
    .split('`')
    .map((part, index) => ({ text: part, code: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}
