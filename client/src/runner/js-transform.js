import { parse } from 'acorn';
import { collectLoopGuardEdits } from './loop-guard.js';
import { collectImportEdits } from './module-imports.js';
import { applyEdits } from './source-edits.js';

export function transformJs(code, { sourceType = 'script', lineOffset = 0, resolveSpecifier = null } = {}) {
  let ast;
  try {
    ast = parse(code, { ecmaVersion: 'latest', sourceType, locations: true, allowHashBang: true });
  } catch {
    return code;
  }
  const edits = collectLoopGuardEdits(ast, { lineOffset });
  if (resolveSpecifier) edits.push(...collectImportEdits(ast, resolveSpecifier));
  return applyEdits(code, edits);
}

export function isModuleSource(code) {
  const options = { ecmaVersion: 'latest', allowHashBang: true };
  try {
    parse(code, { ...options, sourceType: 'script' });
    return false;
  } catch {
    try {
      parse(code, { ...options, sourceType: 'module' });
      return true;
    } catch {
      return false;
    }
  }
}
