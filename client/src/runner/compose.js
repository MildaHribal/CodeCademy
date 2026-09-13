// Skládání stránky pro iframe z uživatelových souborů (kontrakt kap. 6.3–6.5).
//
// - CSS soubory odkázané přes <link rel="stylesheet"> se vloží jako <style>.
// - JS soubory i inline skripty se spustí z data: URL — `defer`/`async` tak fungují jako
//   u skutečného souboru. Každý skript končí `//# sourceURL=akademie/<soubor>`, takže ho
//   DevTools i chybové hlášky ukazují pod jeho jménem.
// - Inline skript z index.html dostane na začátek tolik prázdných řádků (a mezer), kolik
//   je před ním v index.html — čísla řádků a sloupců pak sedí na index.html.
// - Všechny .js/.json soubory jsou navíc v import map pod `@akademie/files/…`, takže
//   fungují importy mezi soubory i helpers.importFile().
import { FILE_SPECIFIER_PREFIX, isModuleFile, normalizeFileName, resolveFileReference, resolveModuleSpecifier } from './file-names.js';
import { buildFrameScript, toInlineJson } from './frame-script.js';
import { scanHtml, getAttribute, serializeAttributes, lineAt } from './html-tags.js';
import { isModuleSource, transformJs } from './js-transform.js';
import { GUARD_GLOBAL } from './loop-guard.js';
import { CHANNEL } from './protocol.js';

const CLASSIC_SCRIPT_TYPE = /^(text|application)\/(x-)?(javascript|ecmascript)$/i;
const PAGE_SETTLE_MS = 150;
export const SOURCE_URL_PREFIX = 'akademie/';

/**
 * @param {{ runtime: 'dom'|'js'|'vue', files: Array<{ name: string, content: string }>,
 *   loopLimitMs: number, origin?: string,
 *   frame: { runId: string, mode: 'test'|'page'|'preview'|'inspect', test?: string|null, timeoutMs?: number,
 *     cssVariables?: Record<string, string>, inspect?: Array<{ id, property, selector }>,
 *     storage?: { localStorage?: object, sessionStorage?: object } } }} options
 * @returns {string} HTML pro `iframe.srcdoc`
 */
export function composePage({ runtime, files, loopLimitMs, origin = '', frame }) {
  const fileMap = new Map(files.map((file) => [normalizeFileName(file.name), String(file.content ?? '')]));
  const sources = []; // index = číslo zdroje v data: URL
  const moduleUrls = new Map();

  function registerSource(name) {
    sources.push({ name, lineOffset: 0 });
    return sources.length - 1;
  }

  function dataUrl(mime, code, sourceId) {
    const parameter = sourceId === undefined ? '' : `;akademie-source=${sourceId}`;
    return `data:${mime}${parameter};charset=utf-8,${encodeURIComponent(code)}`;
  }

  function scriptUrl(code, { name, sourceType, lineOffset = 0, columnOffset = 0 }) {
    const padded = '\n'.repeat(lineOffset) + ' '.repeat(columnOffset) + code;
    const transformed = transformJs(padded, {
      sourceType,
      resolveSpecifier: (specifier) => resolveModuleSpecifier(name, specifier, fileMap),
    });
    return dataUrl('text/javascript', withSourceUrl(transformed, name), registerSource(name));
  }

  /** Modul souboru kroku — pro stejný soubor vždy stejná URL, aby stránka i test sdílely jednu instanci. */
  function moduleUrl(name) {
    if (!moduleUrls.has(name)) {
      const content = fileMap.get(name);
      const url = /\.json$/i.test(name)
        ? dataUrl('application/json', content)
        : scriptUrl(content, { name, sourceType: 'module' });
      moduleUrls.set(name, url);
    }
    return moduleUrls.get(name);
  }

  const moduleFiles = [...fileMap.keys()].filter(isModuleFile);
  const imports = {};
  for (const name of moduleFiles) imports[FILE_SPECIFIER_PREFIX + name] = moduleUrl(name);
  if (runtime === 'vue') imports.vue = `${origin}/vendor/vue.esm-browser.js`;

  const helpersForHtml = { fileMap, scriptUrl, moduleUrl };
  const page = runtime === 'js' ? composeJsPage(helpersForHtml) : composeDomPage(helpersForHtml);

  const config = {
    channel: CHANNEL,
    runId: frame.runId,
    mode: frame.mode,
    runtime,
    files: Object.fromEntries(fileMap),
    test: frame.test ?? null,
    timeoutMs: frame.timeoutMs ?? 5000,
    loopLimitMs,
    sources,
    moduleFiles,
    filePrefix: FILE_SPECIFIER_PREFIX,
    guardGlobal: GUARD_GLOBAL,
    settleMs: PAGE_SETTLE_MS,
    cssVariables: frame.cssVariables ?? {},
    inspect: frame.inspect ?? null,
    storage: frame.storage ?? null,
  };
  const head =
    `<script>${buildFrameScript(config)}</script>` +
    (Object.keys(imports).length ? `<script type="importmap">${toInlineJson({ imports })}</script>` : '');

  return page.html.slice(0, page.headAt) + head + page.html.slice(page.headAt);
}

/** Runtime js: prázdná stránka a první .js soubor (přednostně script.js) jako klasický skript. */
function composeJsPage({ fileMap, scriptUrl }) {
  const names = [...fileMap.keys()];
  const main = names.includes('script.js') ? 'script.js' : names.find((name) => /\.m?js$/i.test(name));
  const script = main ? `<script src="${scriptUrl(fileMap.get(main), { name: main, sourceType: 'script' })}"></script>` : '';
  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"></head><body>${script}</body></html>`;
  return { html, headAt: html.indexOf('<meta') };
}

/**
 * Runtime dom/vue. Když index.html chybí nebo je to jen kus těla stránky (živé ukázky
 * v lekcích), obalí se do celé stránky a připojí se CSS a JS, na které nic neodkazuje.
 */
function composeDomPage({ fileMap, scriptUrl, moduleUrl }) {
  const source = fileMap.get('index.html') ?? '';
  const tokens = scanHtml(source);
  const referenced = new Set();
  let output = '';
  let cursor = 0;
  let doctypeEnd = null;
  let isFullDocument = false;

  for (const token of tokens) {
    if (token.kind === 'doctype') {
      doctypeEnd ??= token.end;
      isFullDocument = true;
      continue;
    }
    if (token.kind !== 'element') continue;
    if (['html', 'head', 'body'].includes(token.name)) {
      isFullDocument = true;
      continue;
    }
    const replacement =
      token.name === 'link' ? replaceStylesheet(token) :
      token.name === 'script' ? replaceScript(token) :
      null;
    if (replacement === null) continue;
    output += source.slice(cursor, token.start) + replacement;
    cursor = token.end;
  }
  output += source.slice(cursor);

  function replaceStylesheet(token) {
    const rel = (getAttribute(token.attributes, 'rel') ?? '').toLowerCase().split(/\s+/);
    const name = rel.includes('stylesheet') ? resolveFileReference('index.html', getAttribute(token.attributes, 'href'), fileMap) : null;
    if (!name) return null;
    referenced.add(name);
    const attributes = serializeAttributes(token.attributes, ['rel', 'href', 'type', 'integrity', 'crossorigin']);
    return `<style${attributes}>${escapeStyle(fileMap.get(name))}</style>`;
  }

  function replaceScript(token) {
    const type = (getAttribute(token.attributes, 'type') ?? '').trim();
    const isModule = type.toLowerCase() === 'module';
    if (type && !isModule && !CLASSIC_SCRIPT_TYPE.test(type)) return null; // importmap, šablony…
    const src = getAttribute(token.attributes, 'src');

    if (src !== null) {
      const name = resolveFileReference('index.html', src, fileMap);
      if (!name) return null; // skript odjinud (CDN) necháme být
      referenced.add(name);
      const url = isModule ? moduleUrl(name) : scriptUrl(fileMap.get(name), { name, sourceType: 'script' });
      return `<script${serializeAttributes(token.attributes, ['src', 'integrity', 'crossorigin'])} src="${url}"></script>`;
    }

    // Inline skript: řádky a sloupce se počítají od místa, kde v index.html začíná.
    const lineOffset = lineAt(source, token.contentStart) - 1;
    const columnOffset = token.contentStart - (source.lastIndexOf('\n', token.contentStart - 1) + 1);
    const url = scriptUrl(token.content, { name: 'index.html', sourceType: isModule ? 'module' : 'script', lineOffset, columnOffset });
    // U inline skriptu prohlížeč `defer`/`async` ignoruje — se src by začaly platit, proto pryč.
    const skip = isModule ? [] : ['defer', 'async'];
    return `<script${serializeAttributes(token.attributes, skip)} src="${url}"></script>`;
  }

  if (isFullDocument) {
    // Zaváděcí skript musí běžet před vším ostatním; hned za <!DOCTYPE>, ať zůstane standardní režim.
    return { html: output, headAt: doctypeEnd ?? 0 };
  }

  const styles = [...fileMap.keys()]
    .filter((name) => /\.css$/i.test(name) && !referenced.has(name))
    .map((name) => `<style>${escapeStyle(fileMap.get(name))}</style>`)
    .join('');
  // Soubor s import/export se připojí jako modul, ostatní jako klasický skript.
  const scripts = [...fileMap.keys()]
    .filter((name) => /\.m?js$/i.test(name) && !referenced.has(name))
    .map((name) => (/\.mjs$/i.test(name) || isModuleSource(fileMap.get(name))
      ? `<script type="module" src="${moduleUrl(name)}"></script>`
      : `<script src="${scriptUrl(fileMap.get(name), { name, sourceType: 'script' })}"></script>`))
    .join('');
  const start = '<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">';
  const html = `${start}${styles}</head><body>\n${output}\n${scripts}</body></html>`;
  return { html, headAt: start.length };
}

/** Jméno skriptu pro DevTools a chybové hlášky. Nový řádek před komentářem kvůli `// …` na konci kódu. */
export function withSourceUrl(code, name) {
  const safeName = String(name).replace(/[\s]+/g, '_');
  return `${code}\n//# sourceURL=${SOURCE_URL_PREFIX}${safeName}`;
}

function escapeStyle(css) {
  return String(css).replace(/<\/(style)/gi, '<\\/$1');
}
