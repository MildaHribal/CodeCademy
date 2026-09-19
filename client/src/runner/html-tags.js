
const TOKEN_PATTERN = new RegExp(
  [
    '<!--[\\s\\S]*?(?:-->|$)',
    '<!doctype\\b[^>]*>',
    '<(script|style|textarea|title)\\b((?:"[^"]*"|\'[^\']*\'|[^\'">])*)>([\\s\\S]*?)(?:<\\/\\1\\s*>|$)',
    '<(link|html|head|body)\\b((?:"[^"]*"|\'[^\']*\'|[^\'">])*)>',
  ].join('|'),
  'gi',
);

export function scanHtml(html) {
  const tokens = [];
  for (const match of html.matchAll(TOKEN_PATTERN)) {
    const [text, rawName, rawAttributes, content, voidName, voidAttributes] = match;
    const start = match.index;
    const end = start + text.length;
    if (text.startsWith('<!--')) {
      tokens.push({ kind: 'comment', start, end });
    } else if (/^<!doctype/i.test(text)) {
      tokens.push({ kind: 'doctype', start, end });
    } else if (rawName) {
      const openTagLength = `<${rawName}${rawAttributes}>`.length;
      tokens.push({
        kind: 'element',
        name: rawName.toLowerCase(),
        attributes: parseAttributes(rawAttributes),
        content,
        start,
        end,
        contentStart: start + openTagLength,
      });
    } else {
      tokens.push({ kind: 'element', name: voidName.toLowerCase(), attributes: parseAttributes(voidAttributes), start, end });
    }
  }
  return tokens;
}

/** @typedef {{ name: string, value: string|null }} Attribute */

export function parseAttributes(text) {
  const attributes = [];
  const pattern = /([^\s"'>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
  for (const [, name, rawValue] of String(text ?? '').matchAll(pattern)) {
    const value = rawValue === undefined ? null : rawValue.replace(/^(["'])([\s\S]*)\1$/, '$2');
    attributes.push({ name: name.toLowerCase(), value: value === null ? null : decodeEntities(value) });
  }
  return attributes;
}

export function getAttribute(attributes, name) {
  const found = attributes.find((attribute) => attribute.name === name);
  return found ? (found.value ?? '') : null;
}

export function serializeAttributes(attributes, skip = []) {
  return attributes
    .filter((attribute) => !skip.includes(attribute.name))
    .map(({ name, value }) => (value === null ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`))
    .join('');
}

export function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function decodeEntities(value) {
  return value.replace(/&(amp|quot|apos|lt|gt|#39);/g, (_, entity) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', '#39': "'" })[entity]);
}

export function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}
