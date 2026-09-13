// Kontrola „kód nejde spustit" (kontrakt kap. 6.1) — jedna implementace pro prohlížečový
// runner, server (node-runner) i lint v editoru.
//
// JavaScript se naparsuje přes acorn jako klasický skript i jako ES modul. Chyba je jen
// tehdy, když kód nejde naparsovat ani jedním způsobem. Hlášky se drží tvaru, který píše
// Chrome (`Unexpected token ')'`, `Unexpected end of input`), aby student v editoru, ve
// výsledku testů i v DevTools viděl totéž.
import { parse } from 'acorn';

/** Text neověřeného požadavku, když kód nejde spustit (kontrakt kap. 6.1). */
export const SYNTAX_SKIPPED_MESSAGE = 'Neověřeno — kód nejde spustit';

const JS_FILE = /\.(m?js|cjs)$/i;
const HTML_FILE = /\.html?$/i;
// Typy <script>, které prohlížeč spustí jako JavaScript.
const CLASSIC_SCRIPT_TYPE = /^(text|application)\/(x-)?(javascript|ecmascript)$/i;

// Víceznakové operátory, nejdelší první (pro text chybového tokenu).
const PUNCTUATORS = [
  '>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
  '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=',
  '&=', '|=', '^=', '<<', '>>', '**',
];

/**
 * Najde první syntaktickou chybu v souborech kroku.
 *
 * @param {Array<{ name: string, content: string }>} files
 * @param {{ includeHtml?: boolean }} options  includeHtml: kontrolovat i inline <script> v .html
 *   (runtime node HTML nespouští, proto ho vypíná)
 * @returns {null | { file: string, line: number, column: number, message: string }}
 *   řádek a sloupec jsou 1-based v celém souboru (u inline skriptu v HTML souboru)
 */
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
          // Na prvním řádku skriptu je před kódem ještě značka <script>.
          column: error.line === 1 ? script.column + error.column - 1 : error.column,
          message: error.message,
        };
      }
    }
  }
  return null;
}

/**
 * RunResult pro kód, který nejde naparsovat: žádný test se nespustil (kontrakt kap. 6.1).
 * @param {Array<object>} hints
 * @param {{ file: string, line: number, column: number, message: string }} syntaxError
 */
export function syntaxErrorResult(hints, syntaxError) {
  return {
    ok: false,
    results: (hints ?? []).map((_, index) => ({ index, pass: false, skipped: true, error: SYNTAX_SKIPPED_MESSAGE })),
    logs: [],
    errors: [`SyntaxError: ${syntaxError.message} (${syntaxError.file}:${syntaxError.line})`],
    syntaxError,
  };
}

/**
 * Zkusí kód naparsovat jako skript i jako modul.
 * @returns {null | { line: number, column: number, message: string }}
 */
export function checkJsSyntax(code) {
  const source = String(code ?? '');
  const asScript = tryParse(source, 'script');
  if (!asScript) return null;
  const asModule = tryParse(source, 'module');
  if (!asModule) return null;
  // Oba pokusy selhaly. Věrnější bývá ten, který se v kódu dostal dál: soubor s `import`
  // selže jako skript hned na prvním řádku, jako modul až na skutečné chybě.
  const error = asModule.pos > asScript.pos ? asModule : asScript;
  return {
    line: error.loc?.line ?? 1,
    column: (error.loc?.column ?? 0) + 1,
    message: chromeLikeMessage(error, source),
  };
}

/** Vrátí výjimku acornu, nebo null, když kód jde naparsovat. */
function tryParse(source, sourceType) {
  try {
    parse(source, { ecmaVersion: 'latest', sourceType, allowHashBang: true, locations: true });
    return null;
  } catch (error) {
    if (typeof error?.pos !== 'number') throw error; // chyba acornu samotného, ne kódu
    return error;
  }
}

/** Z hlášky acornu `Unexpected token (3:14)` udělá `Unexpected token ')'` jako v Chrome. */
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

/**
 * Inline skripty z HTML, které prohlížeč spustí (bez `src`, typ prázdný, JavaScript nebo `module`).
 * @returns {Array<{ content: string, line: number, column: number }>}  kde obsah začíná (1-based)
 */
export function extractInlineScripts(html) {
  const text = String(html ?? '');
  const scripts = [];
  // Komentáře přeskočíme celé, aby se v nich nehledaly značky.
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
