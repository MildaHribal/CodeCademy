import { explainError } from '../../../../shared/errors-cs.js';
import { checkJsSyntax, findSyntaxError } from '../../../../shared/syntax-check.js';
import { findInvalidDeclarations } from './css-check.js';
import { scanCss } from './css-scan.js';

export function offsetAt(text, line, column = 1) {
  const lines = String(text).split('\n');
  const lineIndex = Math.min(Math.max(1, line), lines.length) - 1;
  let offset = 0;
  for (let i = 0; i < lineIndex; i++) offset += lines[i].length + 1;
  return offset + Math.min(Math.max(0, column - 1), lines[lineIndex].length);
}

function rangeAt(text, line, column) {
  const from = offsetAt(text, line, column);
  const rest = String(text).slice(from);
  const word = /^[\p{L}\p{N}_$]+|^\S/u.exec(rest);
  if (word) return { from, to: from + word[0].length };
  const lineStart = offsetAt(text, line, 1);
  return { from: lineStart, to: Math.max(from, lineStart) };
}

export function syntaxDiagnostics(name, text) {
  const error = /\.html?$/i.test(name)
    ? findSyntaxError([{ name, content: text }])
    : /\.(m?js|cjs)$/i.test(name) ? checkJsSyntax(text) : null;
  if (!error) return [];
  const original = `SyntaxError: ${error.message}`;
  const explanation = explainError(original);
  return [{
    ...rangeAt(text, error.line, error.column),
    severity: 'error',
    message: explanation?.title ?? 'Kód nejde naparsovat.',
    causes: explanation?.causes ?? [],
    original,
    source: 'Syntaxe',
  }];
}

export function jsonDiagnostics(name, text) {
  if (!/\.json$/i.test(name) || !String(text).trim()) return [];
  try {
    JSON.parse(text);
    return [];
  } catch (error) {
    const found = /position (\d+)/.exec(error.message);
    const from = found ? Math.min(Number(found[1]), text.length) : 0;
    return [{
      from,
      to: Math.min(from + 1, text.length),
      severity: 'error',
      message: 'Soubor není platný JSON.',
      causes: ['Klíče a řetězce musí být ve dvojitých uvozovkách.', 'Za poslední položkou nesmí být čárka.'],
      original: `SyntaxError: ${error.message}`,
      source: 'JSON',
    }];
  }
}

export function cssDiagnostics(name, text, { supports, knownProperties } = {}) {
  if (!/\.css$/i.test(name) || typeof supports !== 'function') return [];
  return findInvalidDeclarations(text, { supports, knownProperties }).map((problem) => ({
    from: problem.from,
    to: problem.to,
    severity: 'warning',
    message: problem.message,
    hint: problem.hint,
    source: 'CSS',
  }));
}

export function inspectableDeclarations(text) {
  return scanCss(text)
    .filter((declaration) => declaration.selector && !declaration.nested)
    .filter((declaration) => declaration.atRules.every((header) => /^@layer\b/i.test(header)))
    .map((declaration, id) => ({ id, property: declaration.property, selector: declaration.selector, from: declaration.from, to: declaration.to }));
}

const INACTIVE_REASONS = {
  container: (property) => `\`${property}\` tu nic nedělá: prvek nemá \`display: flex\` ani \`display: grid\`.`,
  'flex-container': (property) => `\`${property}\` tu nic nedělá: prvek nemá \`display: flex\`.`,
  'grid-container': (property) => `\`${property}\` tu nic nedělá: prvek nemá \`display: grid\`.`,
  'flex-parent': (property) => `\`${property}\` tu nic nedělá: rodič prvku není flex kontejner.`,
  'flex-or-grid-parent': (property) => `\`${property}\` tu nic nedělá: rodič prvku není flex ani grid kontejner.`,
  'grid-parent': (property) => `\`${property}\` tu nic nedělá: rodič prvku není grid kontejner.`,
  static: (property) => `\`${property}\` tu nic nedělá: prvek má \`position: static\`.`,
  inline: (property) => `\`${property}\` tu nic nedělá: prvek je řádkový (\`display: inline\`).`,
};

const INACTIVE_HINTS = {
  container: 'Přidej `display: flex` (nebo `grid`) do stejného pravidla, nebo vlastnost přesuň na rodiče položek.',
  'flex-container': 'Přidej do pravidla `display: flex`.',
  'grid-container': 'Přidej do pravidla `display: grid`.',
  'flex-parent': 'Vlastnost patří položce uvnitř flex kontejneru — rodič potřebuje `display: flex`.',
  'flex-or-grid-parent': 'Rodič potřebuje `display: flex` nebo `display: grid`.',
  'grid-parent': 'Rodič potřebuje `display: grid`.',
  static: 'Přidej `position: relative` (nebo `absolute`, `fixed`, `sticky`).',
  inline: 'Přidej `display: inline-block` nebo `block`.',
};

export function inactiveDiagnostics(declarations, items) {
  const byId = new Map(declarations.map((declaration) => [declaration.id, declaration]));
  return (items ?? [])
    .filter((item) => byId.has(item.id) && INACTIVE_REASONS[item.reason])
    .map((item) => {
      const declaration = byId.get(item.id);
      return {
        from: declaration.from,
        to: declaration.to,
        severity: 'info',
        message: INACTIVE_REASONS[item.reason](declaration.property),
        hint: INACTIVE_HINTS[item.reason],
        source: 'Neaktivní CSS',
      };
    });
}

export function runtimeDiagnostic(text, { line, column = 1, message }) {
  const explanation = explainError(message);
  const lineStart = offsetAt(text, line, 1);
  const lineText = String(text).slice(lineStart).split('\n')[0];
  const indent = lineText.length - lineText.trimStart().length;
  const from = column > 1 ? offsetAt(text, line, column) : lineStart + indent;
  return {
    from,
    to: Math.max(from, lineStart + lineText.length),
    severity: 'error',
    message: explanation?.title ?? 'Při spuštění nastala chyba.',
    causes: explanation?.causes ?? [],
    original: message,
    source: 'Chyba za běhu',
  };
}
