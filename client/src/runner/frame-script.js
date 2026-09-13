// Sestaví text zaváděcího skriptu, který se vloží na začátek stránky v iframu.
import { frameMain } from './frame/main.js';
import { formatValue } from './frame/format-value.js';
import { createAssert } from './frame/assert.js';
import { describeAssertion } from '../../../shared/runner-assertion.js';
import { stripComments } from './frame/strip-comments.js';
import { findCssRules } from './frame/css-rules.js';
import { createHelpers } from './frame/helpers.js';
import { createLoopGuard } from './frame/loop-guard-runtime.js';
import { findInactiveDeclarations } from './frame/inactive-css.js';

// Funkce, které se do iframu přenesou jako text. Každá musí být soběstačná.
const FRAME_PARTS = { formatValue, createAssert, describeAssertion, stripComments, findCssRules, createHelpers, createLoopGuard, findInactiveDeclarations };

/** JSON bezpečný uvnitř <script> (žádné `</script>` ani `<!--`). */
export function toInlineJson(value) {
  // Znak < se zapíše jako \u003c, takže v textu nemůže vzniknout </script> ani <!--.
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildFrameScript(config) {
  const parts = Object.entries(FRAME_PARTS).map(([name, fn]) => `${name}: (${fn.toString()})`);
  // Dynamický import je jen v textu a rozdělený, aby ho Vite nenašel a nepřepsal
  // na vlastní pomocný kód (ten by v iframu neexistoval).
  const dynamicImport = 'imp' + 'ort';
  parts.push(`importModule: function (specifier) { return ${dynamicImport}(specifier); }`);
  const script = `(function () {\n"use strict";\nvar parts = {\n${parts.join(',\n')}\n};\n(${frameMain.toString()})(${toInlineJson(config)}, parts);\n})();`;
  return script.replace(/<\/(script)/gi, '<\\/$1');
}
