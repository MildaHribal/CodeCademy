// Podmnožina `node:assert/strict` pro testy v prohlížeči.
// Hlášky napodobují Node, aby testy vypadaly stejně ve všech runtimech.
//
// POZOR: funkce se do iframu vkládá jako text, nesmí používat nic mimo své tělo.

/** @param {(value: unknown) => string} formatValue */
export function createAssert(formatValue) {
  class AssertionError extends Error {
    constructor({ message, actual, expected, operator, generatedMessage }) {
      super(message);
      this.name = 'AssertionError';
      this.code = 'ERR_ASSERTION';
      this.actual = actual;
      this.expected = expected;
      this.operator = operator;
      this.generatedMessage = generatedMessage;
    }
  }

  function fail({ message, generated, actual, expected, operator }) {
    if (message instanceof Error) throw message;
    throw new AssertionError({
      message: message ?? generated,
      actual,
      expected,
      operator,
      generatedMessage: message === undefined,
    });
  }

  const show = (value) => formatValue(value);

  function isDeepStrictEqual(a, b, pairs = []) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    const tag = Object.prototype.toString.call(a);
    if (tag !== Object.prototype.toString.call(b)) return false;
    if (pairs.some(([x, y]) => x === a && y === b)) return true; // cyklické struktury
    pairs = [...pairs, [a, b]];

    if (a instanceof Date && !Object.is(a.getTime(), b.getTime())) return false;
    if (a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags || a.lastIndex !== b.lastIndex)) return false;
    if (a instanceof Error && (a.name !== b.name || a.message !== b.message)) return false;
    if ((a instanceof Number || a instanceof String || a instanceof Boolean) && !Object.is(a.valueOf(), b.valueOf())) return false;
    if (Array.isArray(a) && a.length !== b.length) return false;
    if (ArrayBuffer.isView(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
    }
    if (a instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (b.has(key)) {
          if (!isDeepStrictEqual(value, b.get(key), pairs)) return false;
        } else if (![...b].some(([otherKey, otherValue]) => isDeepStrictEqual(key, otherKey, pairs) && isDeepStrictEqual(value, otherValue, pairs))) {
          return false;
        }
      }
    }
    if (a instanceof Set) {
      if (a.size !== b.size) return false;
      for (const value of a) {
        if (!b.has(value) && ![...b].some((other) => isDeepStrictEqual(value, other, pairs))) return false;
      }
    }

    const ownKeys = (object) => [
      ...Object.keys(object),
      ...Object.getOwnPropertySymbols(object).filter((symbol) => Object.prototype.propertyIsEnumerable.call(object, symbol)),
    ];
    const keysA = ownKeys(a);
    const keysB = ownKeys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => Object.prototype.propertyIsEnumerable.call(b, key) && isDeepStrictEqual(a[key], b[key], pairs));
  }

  /** Ověří vyhozenou chybu proti `expected` (třída, RegExp, objekt nebo validační funkce). */
  function matchesExpected(error, expected, operatorName, message) {
    if (expected === undefined) return;
    if (typeof expected === 'function') {
      if (expected.prototype !== undefined && error instanceof expected) return;
      if (Error.isPrototypeOf(expected) || expected === Error) {
        fail({ message, generated: `The error is expected to be an instance of "${expected.name}". Received "${error?.constructor?.name ?? typeof error}"\n\nError message:\n\n${error?.message ?? String(error)}`, actual: error, expected, operator: operatorName });
      }
      if (expected.call({}, error) === true) return;
      fail({ message, generated: `The ${operatorName} validation function is expected to return "true". Received ${show(error)}`, actual: error, expected, operator: operatorName });
    }
    if (expected instanceof RegExp) {
      if (expected.test(String(error))) return;
      fail({ message, generated: `The input did not match the regular expression ${expected}. Input:\n\n${show(String(error))}\n`, actual: error, expected, operator: operatorName });
    }
    if (typeof expected === 'object' && expected !== null) {
      for (const key of Object.keys(expected)) {
        const want = expected[key];
        const got = error?.[key];
        const ok = want instanceof RegExp && typeof got === 'string' ? want.test(got) : isDeepStrictEqual(got, want);
        if (!ok) {
          fail({ message, generated: `Expected values to be strictly deep-equal:\n+ actual - expected\n\n  Comparison {\n+   ${key}: ${show(got)}\n-   ${key}: ${show(want)}\n  }`, actual: error, expected, operator: operatorName });
        }
      }
      return;
    }
    throw new TypeError(`The "expected" argument must be of type function or an instance of RegExp or Object. Received ${show(expected)}`);
  }

  function assert(value, message) {
    assert.ok(value, message);
  }

  Object.assign(assert, {
    AssertionError,

    ok(value, message) {
      if (!value) {
        fail({ message, generated: `The expression evaluated to a falsy value:\n\n  assert.ok(${show(value)})\n`, actual: value, expected: true, operator: '==' });
      }
    },

    equal(actual, expected, message) {
      if (!Object.is(actual, expected)) {
        fail({ message, generated: `Expected values to be strictly equal:\n\n${show(actual)} !== ${show(expected)}\n`, actual, expected, operator: 'strictEqual' });
      }
    },

    notEqual(actual, expected, message) {
      if (Object.is(actual, expected)) {
        fail({ message, generated: `Expected "actual" to be strictly unequal to: ${show(expected)}`, actual, expected, operator: 'notStrictEqual' });
      }
    },

    deepEqual(actual, expected, message) {
      if (!isDeepStrictEqual(actual, expected)) {
        fail({ message, generated: `Expected values to be strictly deep-equal:\n+ actual - expected\n\n+ ${show(actual)}\n- ${show(expected)}`, actual, expected, operator: 'deepStrictEqual' });
      }
    },

    notDeepEqual(actual, expected, message) {
      if (isDeepStrictEqual(actual, expected)) {
        fail({ message, generated: `Expected "actual" not to be strictly deep-equal to: ${show(expected)}`, actual, expected, operator: 'notDeepStrictEqual' });
      }
    },

    match(string, regexp, message) {
      if (!(regexp instanceof RegExp)) throw new TypeError('The "regexp" argument must be an instance of RegExp.');
      if (typeof string !== 'string') {
        fail({ message, generated: `The "string" argument must be of type string. Received type ${typeof string} (${show(string)})`, actual: string, expected: regexp, operator: 'match' });
      }
      if (!regexp.test(string)) {
        fail({ message, generated: `The input did not match the regular expression ${regexp}. Input:\n\n${show(string)}\n`, actual: string, expected: regexp, operator: 'match' });
      }
    },

    doesNotMatch(string, regexp, message) {
      if (!(regexp instanceof RegExp)) throw new TypeError('The "regexp" argument must be an instance of RegExp.');
      if (typeof string !== 'string') {
        fail({ message, generated: `The "string" argument must be of type string. Received type ${typeof string} (${show(string)})`, actual: string, expected: regexp, operator: 'doesNotMatch' });
      }
      if (regexp.test(string)) {
        fail({ message, generated: `The input was expected to not match the regular expression ${regexp}. Input:\n\n${show(string)}\n`, actual: string, expected: regexp, operator: 'doesNotMatch' });
      }
    },

    throws(fn, expected, message) {
      if (typeof expected === 'string') [expected, message] = [undefined, expected];
      if (typeof fn !== 'function') throw new TypeError('The "fn" argument must be of type function.');
      let thrown = false;
      let error;
      try {
        fn();
      } catch (caught) {
        thrown = true;
        error = caught;
      }
      if (!thrown) {
        fail({ message, generated: `Missing expected exception${expected?.name ? ` (${expected.name})` : ''}.`, actual: undefined, expected, operator: 'throws' });
      }
      matchesExpected(error, expected, 'throws', message);
    },

    doesNotThrow(fn, message) {
      try {
        fn();
      } catch (error) {
        fail({ message: typeof message === 'string' ? `Got unwanted exception: ${message}` : undefined, generated: `Got unwanted exception.\nActual message: "${error?.message ?? String(error)}"`, actual: error, operator: 'doesNotThrow' });
      }
    },

    async rejects(promiseOrFn, expected, message) {
      if (typeof expected === 'string') [expected, message] = [undefined, expected];
      let promise = promiseOrFn;
      if (typeof promiseOrFn === 'function') {
        promise = promiseOrFn();
        if (!promise || typeof promise.then !== 'function') {
          throw new TypeError('The "promiseFn" argument must return a Promise.');
        }
      }
      let rejected = false;
      let error;
      try {
        await promise;
      } catch (caught) {
        rejected = true;
        error = caught;
      }
      if (!rejected) {
        fail({ message, generated: `Missing expected rejection${expected?.name ? ` (${expected.name})` : ''}.`, actual: undefined, expected, operator: 'rejects' });
      }
      matchesExpected(error, expected, 'rejects', message);
    },

    fail(message = 'Failed') {
      fail({ message, generated: 'Failed', operator: 'fail' });
    },
  });

  // Jména z node:assert/strict, ať fungují oba zápisy.
  assert.strictEqual = assert.equal;
  assert.notStrictEqual = assert.notEqual;
  assert.deepStrictEqual = assert.deepEqual;
  assert.notDeepStrictEqual = assert.notDeepEqual;
  assert.strict = assert;
  return assert;
}
