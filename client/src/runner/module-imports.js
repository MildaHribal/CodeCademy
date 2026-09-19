import { simple } from 'acorn-walk';

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
