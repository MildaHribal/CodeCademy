// Příprava uživatelova JavaScriptu před spuštěním (ochrana smyček + importy).
import { parse } from 'acorn';
import { collectLoopGuardEdits } from './loop-guard.js';
import { collectImportEdits } from './module-imports.js';
import { applyEdits } from './source-edits.js';

/**
 * @param {string} code
 * @param {{ sourceType?: 'script'|'module', lineOffset?: number,
 *   resolveSpecifier?: (specifier: string) => string|null }} options
 * @returns {string}  upravený kód; když kód nejde naparsovat, vrátí ho beze změny
 *   (prohlížeč pak sám ohlásí syntaktickou chybu se správným řádkem)
 */
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

/** Je to ES modul? (jde naparsovat jen jako modul — obsahuje import/export) */
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
