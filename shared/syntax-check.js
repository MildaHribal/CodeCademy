import { parse } from 'acorn';

export const SYNTAX_SKIPPED_MESSAGE = 'Neověřeno — kód nejde spustit';

const JS_FILE = /\.(m?js|cjs)$/i;
const HTML_FILE = /\.html?$/i;
const CLASSIC_SCRIPT_TYPE = /^(text|application)\/(x-)?(javascript|ecmascript)$/i;

const PUNCTUATORS = [
  '>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
  '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=',
  '&=', '|=', '^=', '<<', '>>', '**',
];

export function findSyntaxError(files, { includeHtml = true } = {}) {
  for (const file of files ?? []) {
    const name = String(file?.name ?? '');
    const content = String(file?.content ?? '');
    if (JS_FILE.test(name)) {
      const error = checkJsSyntax(content);
      if (error) return { file: name, line: error.line, column: error.column, message: error.message };
    } else if (includeHtml && HTML_FILE.test(name)) {
      for (const script of extractInlineScripts(content)) {
        const error = checkJsSyntax(script.content);
        if (!error) continue;
        return {
          file: name,
          line: script.line + error.line - 1,
          column: error.line === 1 ? script.column + error.column - 1 : error.column,
          message: error.message,
        };
      }
    }
  }
  return null;
}

export function syntaxErrorResult(hints, syntaxError) {
  return {
    ok: false,
    results: (hints ?? []).map((_, index) => ({ index, pass: false, skipped: true, error: SYNTAX_SKIPPED_MESSAGE })),
    logs: [],
    errors: [`SyntaxError: ${syntaxError.message} (${syntaxError.file}:${syntaxError.line})`],
    syntaxError,
  };
}

export function checkJsSyntax(code) {
  const source = String(code ?? '');
  const asScript = tryParse(source, 'script');
  if (!asScript) return null;
  const asModule = tryParse(source, 'module');
  if (!asModule) return null;
  const error = asModule.pos > asScript.pos ? asModule : asScript;
  return {
    line: error.loc?.line ?? 1,
    column: (error.loc?.column ?? 0) + 1,
    message: chromeLikeMessage(error, source),
  };
}

function tryParse(source, sourceType) {
  try {
    parse(source, { ecmaVersion: 'latest', sourceType, allowHashBang: true, locations: true });
    return null;
  } catch (error) {
    if (typeof error?.pos !== 'number') throw error;
    return error;
  }
}

function chromeLikeMessage(error, source) {
  const message = String(error.message).replace(/\s*\(\d+:\d+\)$/, '');
  if (message !== 'Unexpected token') return message;

  const rest = source.slice(error.pos);
  if (rest.trim() === '') return 'Unexpected end of input';
  const word = /^[\p{L}_$][\p{L}\p{N}_$]*/u.exec(rest);
  if (word) return `Unexpected token '${word[0]}'`;
  if (/^\d/.test(rest)) return 'Unexpected number';
  if (/^["'`]/.test(rest)) return 'Unexpected string';
  const punctuator = PUNCTUATORS.find((candidate) => rest.startsWith(candidate)) ?? rest[0];
  return `Unexpected token '${punctuator}'`;
}

export function extractInlineScripts(html) {
  const text = String(html ?? '');
  const scripts = [];
  const pattern = /<!--[\s\S]*?(?:-->|$)|<script\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)(?:<\/script\s*>|$)/gi;
  for (const match of text.matchAll(pattern)) {
    if (match[0].startsWith('<!--')) continue;
    const attributes = match[1] ?? '';
    if (/(^|\s)src\s*=/i.test(attributes)) continue;
    const type = /(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes);
    const typeValue = (type?.[1] ?? type?.[2] ?? type?.[3] ?? '').trim();
    if (typeValue && typeValue.toLowerCase() !== 'module' && !CLASSIC_SCRIPT_TYPE.test(typeValue)) continue;

    const contentStart = match.index + '<script'.length + attributes.length + 1;
    const before = text.slice(0, contentStart);
    const line = before.split('\n').length;
    const column = contentStart - (before.lastIndexOf('\n') + 1) + 1;
    scripts.push({ content: match[2] ?? '', line, column });
  }
  return scripts;
}
