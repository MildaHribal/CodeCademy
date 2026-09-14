// Runtime react: JSX a TypeScript → JavaScript přes Sucrase (kontrakt kap. 6.11).
//
// Sucrase jen odstraní typy a přepíše JSX na volání `jsx()` z `react/jsx-runtime`;
// ES moduly, moderní syntaxi a hlavně čísla řádků nechává beze změny. Ochrana smyček
// (acorn) pak běží až nad výsledkem a chyby hlásí na řádcích původního souboru.
import { transform } from 'sucrase';
import { checkJsSyntax, findSyntaxError } from '../../../shared/syntax-check.js';

/** Soubory, které runtime react překládá (a které jdou importovat jako moduly). */
export const REACT_SOURCE_FILE = /\.(jsx|tsx|ts|mts|js|mjs)$/i;

/** Přípony, které se zkoušejí u importu bez přípony (`import App from './App'`). */
export const REACT_IMPORT_EXTENSIONS = ['.jsx', '.tsx', '.js', '.ts', '.mjs', '.mts', '.json'];

function transformsFor(name) {
  if (/\.tsx$/i.test(name)) return ['typescript', 'jsx'];
  if (/\.m?ts$/i.test(name)) return ['typescript'];
  return ['jsx'];
}

/**
 * @param {string} code
 * @param {string} name  jméno souboru (podle přípony se volí transformace)
 * @returns {string}  JavaScript se stejnými řádky
 * @throws {SyntaxError}  s `loc: { line, column }` (sloupec od 0), když kód nejde přeložit
 */
export function transformReactSource(code, name) {
  return transform(String(code ?? ''), {
    transforms: transformsFor(name),
    jsxRuntime: 'automatic',
    production: true,
    // Moderní syntaxe (?. ?? class fields) zůstane, jak je — prohlížeč ji umí.
    disableESTransforms: true,
    // Import jen kvůli typům (`import { type FC }`) Sucrase u TypeScriptu sám odstraní.
    filePath: name,
  }).code;
}

/** `Error transforming App.jsx: Unexpected token, expected "," (2:2)` → `Unexpected token, expected ","` */
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
    // Sloupec po překladu JSX nemusí sedět, řádek ano.
    if (error) return { file: name, line: error.line, column: error.column, message: error.message };
  }
  return findSyntaxError((files ?? []).filter((file) => /\.html?$/i.test(String(file?.name ?? ''))));
}
