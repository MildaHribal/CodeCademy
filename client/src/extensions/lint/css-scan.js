
/**
 * @typedef {{ property: string, value: string, from: number, to: number, valueFrom: number,
 *   selector: string | null, atRules: string[], nested: boolean }} CssDeclaration
 *   from/to = rozsah celé deklarace (bez `;`), valueFrom = začátek hodnoty;
 *   selector = selektor nejbližšího pravidla (null mimo pravidlo), atRules = hlavičky @pravidel
 *   od vnějšího (`@media (max-width: 600px)`), nested = pravidlo je vnořené v jiném pravidle
 *
 * @param {string} text
 * @returns {CssDeclaration[]}
 */
export function scanCss(text) {
  const source = String(text ?? '');
  const declarations = [];
  const stack = [];
  let bufferStart = -1;
  let parenDepth = 0;
  let i = 0;

  const startBuffer = (index) => {
    if (bufferStart === -1) bufferStart = index;
  };

  function flushDeclaration(end) {
    if (bufferStart === -1) return;
    const start = bufferStart;
    bufferStart = -1;
    const top = stack[stack.length - 1];
    if (!top) return;
    const raw = source.slice(start, end);
    const colon = findTopLevelColon(raw);
    if (colon === -1) return;
    const property = stripComments(raw.slice(0, colon)).trim();
    if (!/^-{0,2}[a-zA-Z][\w-]*$/.test(property)) return;
    const rawValue = raw.slice(colon + 1);
    const leading = rawValue.length - rawValue.trimStart().length;
    const value = stripComments(rawValue).trim();
    const trailing = rawValue.length - rawValue.trimEnd().length;
    const rules = stack.filter((entry) => entry.kind === 'rule');
    declarations.push({
      property,
      value,
      from: start,
      to: end - trailing,
      valueFrom: start + colon + 1 + leading,
      selector: rules.length ? rules[rules.length - 1].header : null,
      atRules: stack.filter((entry) => entry.kind === 'at').map((entry) => entry.header),
      nested: rules.length > 1,
    });
  }

  while (i < source.length) {
    const ch = source[i];
    if (ch === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      i = close === -1 ? source.length : close + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      startBuffer(i);
      i = skipString(source, i);
      continue;
    }
    if (ch === '(') parenDepth += 1;
    else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);

    if (parenDepth === 0 && ch === '{') {
      const header = bufferStart === -1 ? '' : stripComments(source.slice(bufferStart, i)).trim().replace(/\s+/g, ' ');
      bufferStart = -1;
      stack.push({ kind: header.startsWith('@') ? 'at' : 'rule', header });
    } else if (parenDepth === 0 && ch === ';') {
      flushDeclaration(i);
    } else if (parenDepth === 0 && ch === '}') {
      flushDeclaration(i);
      stack.pop();
    } else if (!/\s/.test(ch)) {
      startBuffer(i);
    }
    i += 1;
  }
  flushDeclaration(source.length);
  return declarations;
}

function skipString(source, start) {
  const quote = source[start];
  let i = start + 1;
  while (i < source.length && source[i] !== quote && source[i] !== '\n') i += source[i] === '\\' ? 2 : 1;
  return Math.min(i + 1, source.length);
}

function findTopLevelColon(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'") i = skipString(text, i) - 1;
    else if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ':' && depth === 0) return i;
  }
  return -1;
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?(\*\/|$)/g, ' ');
}

export function positionAt(text, index) {
  const before = String(text).slice(0, index);
  const line = before.split('\n').length;
  return { line, column: index - (before.lastIndexOf('\n') + 1) + 1 };
}
