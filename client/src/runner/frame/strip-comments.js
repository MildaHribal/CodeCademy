// Odstranění komentářů z CSS, JS a HTML (helpers.stripComments).
// Komentáře uvnitř řetězců, šablon a regulárních výrazů zůstanou.
//
// POZOR: funkce se do iframu vkládá jako text, nesmí používat nic mimo své tělo.

export function stripComments(source, lang = 'js') {
  const text = String(source ?? '');
  const kind = String(lang).toLowerCase();
  const isWordChar = (ch) => ch !== undefined && /[\w$]/.test(ch);

  /** Komentář nahradíme ničím, jen mezi dvěma slovy necháme mezeru (`a/**\/b` → `a b`). */
  function joiner(output, next) {
    return isWordChar(output[output.length - 1]) && isWordChar(next) ? ' ' : '';
  }

  function readQuoted(start) {
    const quoteChar = text[start];
    let i = start + 1;
    while (i < text.length && text[i] !== quoteChar && text[i] !== '\n') {
      i += text[i] === '\\' ? 2 : 1;
    }
    return Math.min(i + 1, text.length);
  }

  function stripCss() {
    let output = '';
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (ch === '"' || ch === "'") {
        const end = readQuoted(i);
        output += text.slice(i, end);
        i = end;
      } else if (ch === '/' && text[i + 1] === '*') {
        const close = text.indexOf('*/', i + 2);
        i = close === -1 ? text.length : close + 2;
        output += joiner(output, text[i]);
      } else {
        output += ch;
        i += 1;
      }
    }
    return output;
  }

  function stripJs() {
    const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
    let output = '';
    let i = 0;
    let lastSignificant = ''; // poslední znak kódu, který není bílý
    let lastWord = '';
    let braceDepth = 0;
    const templateStack = []; // hloubky závorek, kde začalo `${…}` uvnitř šablony

    function readTemplate(start) {
      // start ukazuje za úvodní ` nebo za } ukončující ${…}
      let j = start;
      while (j < text.length) {
        if (text[j] === '\\') j += 2;
        else if (text[j] === '`') return { end: j + 1, interpolation: false };
        else if (text[j] === '$' && text[j + 1] === '{') return { end: j + 2, interpolation: true };
        else j += 1;
      }
      return { end: text.length, interpolation: false };
    }

    function continueTemplate(start) {
      const { end, interpolation } = readTemplate(start);
      output += text.slice(i, end);
      i = end;
      if (interpolation) {
        templateStack.push(braceDepth);
        braceDepth += 1;
        lastSignificant = '{';
      } else {
        lastSignificant = '`';
      }
    }

    function regexAllowed() {
      if (lastSignificant === '') return true;
      if (/[(,=:[!&|?{};+\-*%<>~^}]/.test(lastSignificant)) return true;
      return isWordChar(lastSignificant) && REGEX_AFTER_WORD.has(lastWord);
    }

    while (i < text.length) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '/' && next === '/') {
        while (i < text.length && text[i] !== '\n') i += 1;
        continue;
      }
      if (ch === '/' && next === '*') {
        const close = text.indexOf('*/', i + 2);
        i = close === -1 ? text.length : close + 2;
        output += joiner(output, text[i]);
        continue;
      }
      if (ch === '"' || ch === "'") {
        const end = readQuoted(i);
        output += text.slice(i, end);
        i = end;
        lastSignificant = ch;
        continue;
      }
      if (ch === '`') {
        continueTemplate(i + 1);
        continue;
      }
      if (ch === '}' && templateStack.length && templateStack[templateStack.length - 1] === braceDepth - 1) {
        templateStack.pop();
        braceDepth -= 1;
        continueTemplate(i + 1);
        continue;
      }
      if (ch === '/' && regexAllowed()) {
        let j = i + 1;
        let inClass = false;
        while (j < text.length && text[j] !== '\n') {
          if (text[j] === '\\') j += 1;
          else if (text[j] === '[') inClass = true;
          else if (text[j] === ']') inClass = false;
          else if (text[j] === '/' && !inClass) break;
          j += 1;
        }
        j += 1;
        while (j < text.length && /[a-z]/i.test(text[j])) j += 1;
        output += text.slice(i, j);
        i = j;
        lastSignificant = '/';
        continue;
      }
      if (isWordChar(ch)) {
        let j = i;
        while (j < text.length && isWordChar(text[j])) j += 1;
        lastWord = text.slice(i, j);
        output += lastWord;
        i = j;
        lastSignificant = lastWord[lastWord.length - 1];
        continue;
      }
      if (ch === '{') braceDepth += 1;
      else if (ch === '}') braceDepth -= 1;
      if (!/\s/.test(ch)) {
        lastSignificant = ch;
        lastWord = '';
      }
      output += ch;
      i += 1;
    }
    return output;
  }

  if (kind === 'css') return stripCss();
  if (['js', 'javascript', 'mjs', 'cjs', 'jsx', 'ts'].includes(kind)) return stripJs();
  if (kind === 'html' || kind === 'htm') return text.replace(/<!-{2}[\s\S]*?(?:-{2}>|$)/g, '');
  throw new Error(`helpers.stripComments: neznámý jazyk "${lang}" (umím css, js a html)`);
}
