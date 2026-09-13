// Přesměrování importů mezi soubory kroku.
// Moduly běží z data: URL, vůči kterým nejde rozlišit relativní cesty (`./utils.js`),
// proto se relativní specifikátory přepíšou na `@akademie/files/utils.js` z import map.
import { simple } from 'acorn-walk';

/**
 * @param {import('acorn').Node} ast
 * @param {(specifier: string) => string|null} resolveSpecifier  nový specifikátor, nebo null = beze změny
 */
export function collectImportEdits(ast, resolveSpecifier) {
  const edits = [];

  function rewrite(source) {
    if (!source || source.type !== 'Literal' || typeof source.value !== 'string') return;
    const next = resolveSpecifier(source.value);
    if (next && next !== source.value) {
      edits.push({ start: source.start, end: source.end, text: JSON.stringify(next) });
    }
  }

  simple(ast, {
    ImportDeclaration: (node) => rewrite(node.source),
    ExportNamedDeclaration: (node) => rewrite(node.source),
    ExportAllDeclaration: (node) => rewrite(node.source),
    ImportExpression: (node) => rewrite(node.source),
  });
  return edits;
}
