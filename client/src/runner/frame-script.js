import { frameMain } from './frame/main.js';
import { formatValue } from './frame/format-value.js';
import { createAssert } from './frame/assert.js';
import { describeAssertion } from '../../../shared/runner-assertion.js';
import { stripComments } from './frame/strip-comments.js';
import { findCssRules } from './frame/css-rules.js';
import { createHelpers } from './frame/helpers.js';
import { createLoopGuard } from './frame/loop-guard-runtime.js';
import { findInactiveDeclarations } from './frame/inactive-css.js';

const FRAME_PARTS = { formatValue, createAssert, describeAssertion, stripComments, findCssRules, createHelpers, createLoopGuard, findInactiveDeclarations };

export function toInlineJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildFrameScript(config) {
  const parts = Object.entries(FRAME_PARTS).map(([name, fn]) => `${name}: (${fn.toString()})`);
  const dynamicImport = 'imp' + 'ort';
  parts.push(`importModule: function (specifier) { return ${dynamicImport}(specifier); }`);
  const script = `(function () {\n"use strict";\nvar parts = {\n${parts.join(',\n')}\n};\n(${frameMain.toString()})(${toInlineJson(config)}, parts);\n})();`;
  return script.replace(/<\/(script)/gi, '<\\/$1');
}
