export function normalizeWhitespace(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

export function normalizeAnswer(text, { ignoreCase = false } = {}) {
  let s = String(text ?? '').replace(/\r\n?/g, '\n');
  s = s.split('\n')
    .map((line) => line.trim().replace(/;+$/, '').trimEnd())
    .filter((line) => line !== '')
    .join('\n');
  s = s.replace(/"/g, "'");
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/ ?([^\p{L}\p{N}_$' \n]) ?/gu, '$1');
  return ignoreCase ? s.toLowerCase() : s;
}

function lowerCaseOutsideQuotes(text) {
  return text
    .split(/('[^']*')/)
    .map((part, index) => (index % 2 === 1 ? part : part.toLowerCase()))
    .join('');
}

export function normalizeCss(text) {
  return String(text ?? '')
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration !== '')
    .map((declaration) => {
      const colon = declaration.indexOf(':');
      if (colon === -1) return lowerCaseOutsideQuotes(normalizeAnswer(declaration));
      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = lowerCaseOutsideQuotes(normalizeAnswer(declaration.slice(colon + 1)));
      return `${property}:${value}`;
    })
    .sort()
    .join(';');
}

export function checkTextAnswer(question, input) {
  const forms = [question?.expected, ...(question?.accept ?? [])].filter((form) => typeof form === 'string');
  const normalize = question?.type === 'css'
    ? (text) => normalizeCss(text)
    : (text) => normalizeAnswer(text, { ignoreCase: Boolean(question?.ignoreCase) });
  const answer = normalize(input);
  return forms.some((form) => normalize(form) === answer);
}

export function hashKey(text) {
  let h = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(normalizeWhitespace(text))) {
    h ^= byte;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function createKeyAllocator() {
  const seen = new Map();
  return (text) => {
    const base = hashKey(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}
