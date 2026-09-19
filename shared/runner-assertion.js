export function describeAssertion(error, format) {
  const MAX_TEXT = 2000;
  const MAX_DIFF = 10;
  const MAX_DEPTH = 20;
  const MISSING = '(chybí)';
  const COMPARING = new Set([
    'strictEqual', 'notStrictEqual', 'deepStrictEqual', 'notDeepStrictEqual',
    'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'match', 'doesNotMatch', '==', 'ok',
  ]);
  const DEEP = new Set(['deepStrictEqual', 'deepEqual']);

  const limit = (text) => (text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}… (zkráceno)` : text);
  const show = (value) => {
    try {
      return limit(String(format(value)));
    } catch {
      return '[nečitelná hodnota]';
    }
  };

  const isObject = (value) => value !== null && typeof value === 'object';
  const name = isObject(error) && typeof error.name === 'string' && error.name ? error.name : typeof error === 'object' ? 'Error' : typeof error;
  const details = { errorName: name };
  if (!isObject(error) || name !== 'AssertionError' || !COMPARING.has(error.operator)) return details;

  const isOk = error.operator === 'ok' || error.operator === '==';
  details.operator = error.operator;
  details.actual = show(error.actual);
  details.expected = isOk ? 'true' : show(error.expected);
  details.generatedMessage = Boolean(error.generatedMessage);

  if (DEEP.has(error.operator) && isObject(error.actual) && isObject(error.expected)) {
    details.diff = diffLeaves(error.actual, error.expected);
  }
  return details;

  function diffLeaves(actualRoot, expectedRoot) {
    const out = [];
    const seen = [];

    function pathOf(parent, key, isIndex) {
      if (isIndex) return `${parent}[${key}]`;
      if (/^[A-Za-z_$][\w$]*$/.test(key)) return parent ? `${parent}.${key}` : key;
      return `${parent}[${JSON.stringify(key)}]`;
    }

    const isPlainContainer = (value) => Array.isArray(value)
      || (isObject(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value)));

    function walk(actual, expected, path, depth) {
      if (out.length >= MAX_DIFF) return;
      if (Object.is(actual, expected)) return;
      const bothContainers = isPlainContainer(actual) && isPlainContainer(expected)
        && Array.isArray(actual) === Array.isArray(expected);
      if (!bothContainers || depth > MAX_DEPTH || seen.some(([a, b]) => a === actual && b === expected)) {
        const actualText = show(actual);
        const expectedText = show(expected);
        if (isObject(actual) && isObject(expected) && actualText === expectedText) return;
        out.push({ path: path || '(celá hodnota)', actual: actualText, expected: expectedText });
        return;
      }
      seen.push([actual, expected]);
      const isArray = Array.isArray(actual);
      const keys = isArray
        ? Array.from({ length: Math.max(actual.length, expected.length) }, (_, index) => index)
        : [...new Set([...Object.keys(actual), ...Object.keys(expected)])];
      for (const key of keys) {
        if (out.length >= MAX_DIFF) break;
        const inActual = isArray ? key < actual.length : Object.prototype.hasOwnProperty.call(actual, key);
        const inExpected = isArray ? key < expected.length : Object.prototype.hasOwnProperty.call(expected, key);
        const childPath = pathOf(path, key, isArray);
        if (!inActual || !inExpected) {
          out.push({ path: childPath, actual: inActual ? show(actual[key]) : MISSING, expected: inExpected ? show(expected[key]) : MISSING });
        } else {
          walk(actual[key], expected[key], childPath, depth + 1);
        }
      }
      seen.pop();
    }

    walk(actualRoot, expectedRoot, '', 0);
    return out;
  }
}
