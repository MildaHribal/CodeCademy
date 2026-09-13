// Pomocné funkce pro práci s textem zdrojáků: helpers.normalize a helpers.stripComments
// v testech runtime node (kontrakt kap. 6.2 a 6.6).

/** Sloučí všechny bílé znaky do jedné mezery a ořízne okraje. */
export function normalize(src) {
  return String(src ?? '').replace(/\s+/g, ' ').trim();
}

/** Odstraní komentáře ze zdrojáku v jazyce `css`, `js` nebo `html`. */
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

/** Zkopíruje řetězec v uvozovkách začínající na pozici i. Vrací index za koncem řetězce. */
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

// Po těchto znacích nebo slovech začíná `/` regulární výraz, jinak je to dělení.
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

/**
 * Odstraní // a /* *\/ komentáře z JavaScriptu. Řetězce, šablonové řetězce (včetně
 * vnořených ${…}) a regulární výrazy nechá beze změny.
 */
function stripJsComments(src) {
  const out = [];
  // Zásobník rozpracovaných ${ … } v šablonových řetězcích: počet otevřených { v každém.
  const templateBraces = [];
  let i = 0;

  const copyTemplate = () => {
    // Jsme uvnitř `…`: kopírujeme až po konec řetězce nebo po začátek ${.
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
      // Regulární výraz: až po neescapované / mimo [třídu znaků].
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
