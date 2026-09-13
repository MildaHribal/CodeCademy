import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ERROR_PATTERNS, explainError, groupUndefinedNames } from './errors-cs.js';
import { parseRef } from './refs.js';

// Ke každému vzoru aspoň jedna skutečná hláška (Chrome, Firefox, Node, acorn, runner).
const SAMPLES = {
  'cannot-read-undefined': ["TypeError: Cannot read properties of undefined (reading 'name') (script.js:3)", `TypeError: can't access property "name", item is undefined`],
  'cannot-read-null': ["TypeError: Cannot read properties of null (reading 'addEventListener')"],
  'cannot-set-undefined': ["TypeError: Cannot set properties of undefined (setting 'total')"],
  'cannot-destructure': ["TypeError: Cannot destructure property 'name' of 'undefined' as it is undefined."],
  'convert-undefined-to-object': ['TypeError: Cannot convert undefined or null to object'],
  'array-method-not-a-function': ['TypeError: items.map is not a function', 'TypeError: data.items.forEach is not a function'],
  'not-a-function': ['TypeError: button.addEventListner is not a function', 'TypeError: callback(...) is not a function'],
  'require-not-defined': ['ReferenceError: require is not defined in ES module scope, you can use import instead'],
  'dirname-not-defined': ['ReferenceError: __dirname is not defined in ES module scope'],
  'not-defined': ['ReferenceError: categories is not defined (script.js:12)', 'ReferenceError: průměr is not defined'],
  'before-initialization': ["ReferenceError: Cannot access 'total' before initialization"],
  'assignment-to-constant': ['TypeError: Assignment to constant variable.'],
  'already-declared': ["SyntaxError: Identifier 'count' has already been declared"],
  'not-a-constructor': ['TypeError: Product is not a constructor'],
  'not-iterable': ['TypeError: items is not iterable'],
  'reduce-empty-array': ['TypeError: Reduce of empty array with no initial value'],
  'max-call-stack': ['RangeError: Maximum call stack size exceeded'],
  'invalid-array-length': ['RangeError: Invalid array length'],
  'read-only-property': ["TypeError: Cannot assign to read only property 'price' of object '#<Object>'"],
  'circular-json': ['TypeError: Converting circular structure to JSON'],
  'json-got-html': [`SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`, 'SyntaxError: Unexpected token < in JSON at position 0'],
  'json-empty': ['SyntaxError: Unexpected end of JSON input'],
  'json-invalid': [`SyntaxError: Expected property name or '}' in JSON at position 2 (line 1 column 3)`, `SyntaxError: "undefined" is not valid JSON`],
  'failed-to-fetch': ['TypeError: Failed to fetch', 'TypeError: fetch failed'],
  'invalid-selector': ["SyntaxError: Failed to execute 'querySelector' on 'Document': '.card >' is not a valid selector."],
  'not-a-node': ["TypeError: Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'."],
  'import-outside-module': ['SyntaxError: Cannot use import statement outside a module', "SyntaxError: Unexpected token 'export'"],
  'await-outside-async': ['SyntaxError: await is only valid in async functions and the top level bodies of modules', "SyntaxError: Cannot use keyword 'await' outside an async function"],
  'return-outside-function': ['SyntaxError: Illegal return statement', "SyntaxError: 'return' outside of function"],
  'unexpected-end-of-input': ['SyntaxError: Unexpected end of input'],
  'unterminated-string': ['SyntaxError: Invalid or unexpected token', 'SyntaxError: Unterminated string constant'],
  'unterminated-template': ['SyntaxError: Unterminated template'],
  'missing-paren': ['SyntaxError: missing ) after argument list'],
  'invalid-assignment-target': ['SyntaxError: Invalid left-hand side in assignment', 'SyntaxError: Assigning to rvalue'],
  'unexpected-identifier': ["SyntaxError: Unexpected identifier 'total'"],
  'unexpected-token': ["SyntaxError: Unexpected token ')' (script.js:3)", 'SyntaxError: Unexpected number'],
  eaddrinuse: ['Error: listen EADDRINUSE: address already in use :::3000'],
  'module-not-found': ["Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/tmp/x/utils' imported from /tmp/x/index.js", "Error: Cannot find package 'express' imported from /tmp/x/index.js"],
  'missing-export': ["SyntaxError: The requested module './utils.js' does not provide an export named 'formatPrice'"],
  enoent: ["Error: ENOENT: no such file or directory, open 'data.json'"],
  'headers-sent': ['Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client'],
  econnrefused: ['Error: connect ECONNREFUSED 127.0.0.1:3000'],
  eacces: ['Error: listen EACCES: permission denied 0.0.0.0:80'],
  'invalid-arg-type': ['TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string or an instance of Buffer'],
  'infinite-loop': ['Error: Smyčka běží příliš dlouho — nekonečná smyčka? (řádek 3)'],
  'test-timeout': ['Test nedoběhl včas — nekonečná smyčka?', 'Test nedoběhl včas (limit 300 ms).'],
};

describe('explainError', () => {
  test('každý vzor má ukázkovou hlášku, která ho najde (a ne jiný vzor před ním)', () => {
    for (const entry of ERROR_PATTERNS) {
      const samples = SAMPLES[entry.id];
      assert.ok(samples?.length, `vzor ${entry.id} nemá ukázku v testu`);
      for (const sample of samples) assert.equal(explainError(sample)?.id, entry.id, `„${sample}"`);
    }
    assert.ok(ERROR_PATTERNS.length >= 40, `vzorů je jen ${ERROR_PATTERNS.length}`);
  });

  test('tvar výsledku: česká věta, 2–3 příčiny, see a zachycené části', () => {
    assert.deepEqual(explainError("TypeError: Cannot read properties of undefined (reading 'name')"), {
      id: 'cannot-read-undefined',
      title: 'Čteš vlastnost „name“ z hodnoty undefined.',
      causes: ERROR_PATTERNS[0].causes,
      see: 'js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot',
      match: { name: 'name' },
    });
    const firefox = explainError(`TypeError: can't access property "price", item is undefined`);
    assert.equal(firefox.title, 'Čteš vlastnost „price“ z hodnoty undefined.');
    assert.deepEqual(firefox.match, { name: 'price' });
  });

  test('zachycené jméno se dosadí i do příčin; chybějící jméno z věty zmizí i s uvozovkami', () => {
    const declared = explainError("SyntaxError: Identifier 'count' has already been declared");
    assert.match(declared.causes[0], /`count = …`/);
    assert.equal(explainError('SyntaxError: Unexpected identifier').title, 'Na tomhle místě kódu nečekané jméno.');
  });

  test('neznámá nebo prázdná hláška → null', () => {
    assert.equal(explainError('Něco úplně jiného'), null);
    assert.equal(explainError(''), null);
    assert.equal(explainError(undefined), null);
  });

  test('pravidla obsahu: věta končí tečkou, 2–3 příčiny, see je platná reference', () => {
    for (const entry of ERROR_PATTERNS) {
      assert.match(entry.title, /[.]$/, entry.id);
      assert.ok(entry.causes.length >= 2 && entry.causes.length <= 3, `${entry.id}: ${entry.causes.length} příčin`);
      if (entry.see !== null) assert.ok(parseRef(entry.see), `${entry.id}: neplatná reference ${entry.see}`);
    }
    assert.equal(new Set(ERROR_PATTERNS.map((entry) => entry.id)).size, ERROR_PATTERNS.length, 'id vzorů jsou jedinečná');
  });
});

describe('groupUndefinedNames', () => {
  test('víc nenapsaných funkcí sloučí do jednoho řádku na místě první', () => {
    assert.deepEqual(
      groupUndefinedNames([
        'TypeError: x.map is not a function (script.js:1)',
        'ReferenceError: average is not defined (script.js:10)',
        'ReferenceError: maximum is not defined (script.js:11)',
        'ReferenceError: average is not defined (script.js:12)',
      ]),
      [
        { text: 'TypeError: x.map is not a function (script.js:1)' },
        { text: 'ReferenceError: average, maximum is not defined', names: ['average', 'maximum'] },
      ],
    );
  });

  test('jediné jméno zůstane v původním tvaru', () => {
    assert.deepEqual(groupUndefinedNames(['ReferenceError: a is not defined (script.js:1)', 'ReferenceError: a is not defined (script.js:2)']), [
      { text: 'ReferenceError: a is not defined (script.js:1)' },
    ]);
  });
});
