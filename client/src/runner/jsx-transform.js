// Runtime react: JSX a TypeScript → JavaScript přes Sucrase (kontrakt kap. 6.11).
import { transform } from 'sucrase';
import { checkJsSyntax, findSyntaxError } from '../../../shared/syntax-check.js';

export const REACT_SOURCE_FILE = /\.(jsx|tsx|ts|mts|js|mjs)$/i;

export const REACT_IMPORT_EXTENSIONS = ['.jsx', '.tsx', '.js', '.ts', '.mjs', '.mts', '.json'];

function transformsFor(name) {
  if (/\.tsx$/i.test(name)) return ['typescript', 'jsx'];
  if (/\.m?ts$/i.test(name)) return ['typescript'];
  return ['jsx'];
}

export function transformReactSource(code, name) {
  return transform(String(code ?? ''), {
    transforms: transformsFor(name),
    jsxRuntime: 'automatic',
    production: true,
    disableESTransforms: true,
    filePath: name,
  }).code;
}

function cleanMessage(message) {
  return String(message ?? '')
    .replace(/^Error transforming [^:]*:\s*/, '')
    .replace(/\s*\(\d+:\d+\)\s*$/, '');
}

/**
 * První syntaktická chyba v souborech kroku runtime react (kontrakt kap. 6.1):
 * JSX/TS přes Sucrase, výsledek ještě přes acorn (Sucrase nehlídá třeba dvojí `const`),
 * inline skripty v HTML jako u runtime dom.
 * @returns {null | { file: string, line: number, column: number, message: string }}
 */
export function findReactSyntaxError(files) {
  for (const file of files ?? []) {
    const name = String(file?.name ?? '');
    if (!REACT_SOURCE_FILE.test(name)) continue;
    let output;
    try {
      output = transformReactSource(file.content, name);
    } catch (error) {
      return {
        file: name,
        line: error?.loc?.line ?? 1,
        column: (error?.loc?.column ?? 0) + 1,
        message: cleanMessage(error?.message) || 'Kód nejde přeložit',
      };
    }
    const error = checkJsSyntax(output);
    if (error) return { file: name, line: error.line, column: error.column, message: error.message };
  }
  return findSyntaxError((files ?? []).filter((file) => /\.html?$/i.test(String(file?.name ?? ''))));
}
