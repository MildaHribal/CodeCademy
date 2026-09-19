export function normalize(src) {
  return String(src ?? '').replace(/\s+/g, ' ').trim();
}

export function stripComments(src, lang = 'js') {
  const text = String(src ?? '');
  switch (String(lang).toLowerCase()) {
    case 'html':
    case 'htm':
      return text.replace(/<!--[\s\S]*?-->/g, '');
    case 'css':
      return stripCssComments(text);
    default:
      return stripJsComments(text);
  }
}

function copyQuoted(src, i, out) {
  const quote = src[i];
  out.push(quote);
  i++;
  while (i < src.length) {
    const ch = src[i];
    out.push(ch);
    i++;
    if (ch === '\\' && i < src.length) {
      out.push(src[i]);
      i++;
    } else if (ch === quote || ch === '\n') {
      break;
    }
  }
  return i;
}

function stripCssComments(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      i = copyQuoted(src, i, out);
    } else if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      i = end === -1 ? src.length : end + 2;
    } else {
      out.push(ch);
      i++;
    }
  }
  return out.join('');
}

const REGEX_AFTER_CHARS = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
const REGEX_AFTER_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await']);

function regexAllowedAfter(out) {
  let j = out.length - 1;
  while (j >= 0 && /\s/.test(out[j])) j--;
  if (j < 0) return true;
  const last = out[j];
  if (REGEX_AFTER_CHARS.has(last)) return true;
  if (!/[A-Za-z_$]/.test(last)) return false;
  let word = '';
  while (j >= 0 && /[A-Za-z0-9_$]/.test(out[j])) word = out[j--] + word;
  return REGEX_AFTER_WORDS.has(word);
}

function stripJsComments(src) {
  const out = [];
  const templateBraces = [];
  let i = 0;

  const copyTemplate = () => {
    while (i < src.length) {
      const ch = src[i];
      if (ch === '\\') {
        out.push(ch, src[i + 1] ?? '');
        i += 2;
      } else if (ch === '`') {
        out.push(ch);
        i++;
        return;
      } else if (ch === '$' && src[i + 1] === '{') {
        out.push('${');
        i += 2;
        templateBraces.push(0);
        return;
      } else {
        out.push(ch);
        i++;
      }
    }
  };

  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '"' || ch === "'") {
      i = copyQuoted(src, i, out);
    } else if (ch === '`') {
      out.push(ch);
      i++;
      copyTemplate();
    } else if (ch === '{' && templateBraces.length) {
      templateBraces[templateBraces.length - 1]++;
      out.push(ch);
      i++;
    } else if (ch === '}' && templateBraces.length) {
      out.push(ch);
      i++;
      if (templateBraces[templateBraces.length - 1] === 0) {
        templateBraces.pop();
        copyTemplate();
      } else {
        templateBraces[templateBraces.length - 1]--;
      }
    } else if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
    } else if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      i = end === -1 ? src.length : end + 2;
    } else if (ch === '/' && regexAllowedAfter(out)) {
      let inClass = false;
      out.push(ch);
      i++;
      while (i < src.length && src[i] !== '\n') {
        const c = src[i];
        out.push(c);
        i++;
        if (c === '\\' && i < src.length) {
          out.push(src[i]);
          i++;
        } else if (c === '[') inClass = true;
        else if (c === ']') inClass = false;
        else if (c === '/' && !inClass) break;
      }
    } else {
      out.push(ch);
      i++;
    }
  }
  return out.join('');
}
