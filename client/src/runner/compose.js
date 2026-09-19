// Skládání stránky pro iframe z uživatelových souborů (kontrakt kap. 6.3–6.5, 6.10, 6.11).
import { FILE_SPECIFIER_PREFIX, isModuleFile, normalizeFileName, resolveFileReference, resolveModuleSpecifier } from './file-names.js';
import { buildFrameScript, toInlineJson } from './frame-script.js';
import { scanHtml, getAttribute, serializeAttributes, lineAt } from './html-tags.js';
import { isModuleSource, transformJs } from './js-transform.js';
import { REACT_IMPORT_EXTENSIONS, REACT_SOURCE_FILE, transformReactSource } from './jsx-transform.js';
import { GUARD_GLOBAL } from './loop-guard.js';
import { CHANNEL } from './protocol.js';
import { isTailwindCdnUrl, isTailwindCss, LENIS_CSS, resolvePageLibs, TAILWIND_SCRIPT, VENDOR_PATH, vendorImports } from './vendor-libs.js';

const CLASSIC_SCRIPT_TYPE = /^(text|application)\/(x-)?(javascript|ecmascript)$/i;
const PAGE_SETTLE_MS = 150;
export const SOURCE_URL_PREFIX = 'akademie/';

const REACT_ENTRIES = ['main.jsx', 'main.tsx', 'index.jsx', 'index.tsx', 'src/main.jsx', 'src/main.tsx', 'src/index.jsx', 'src/index.tsx', 'main.js', 'index.js', 'main.ts', 'index.ts'];
const REACT_APPS = ['App.jsx', 'App.tsx', 'src/App.jsx', 'src/App.tsx', 'App.js'];

export function composePage({ runtime, files, libs = [], loopLimitMs, origin = '', frame }) {
  const fileMap = new Map(files.map((file) => [normalizeFileName(file.name), String(file.content ?? '')]));
  const isReact = runtime === 'react';
  const pageLibs = runtime === 'js' ? [] : resolvePageLibs(libs, fileMap);
  const tailwind = pageLibs.includes('tailwind');
  const sources = [];
  const moduleUrls = new Map();
  const importedFromJs = new Set();

  function registerSource(name) {
    sources.push({ name, lineOffset: 0 });
    return sources.length - 1;
  }

  function dataUrl(mime, code, sourceId) {
    const parameter = sourceId === undefined ? '' : `;akademie-source=${sourceId}`;
    return `data:${mime}${parameter};charset=utf-8,${encodeURIComponent(code)}`;
  }

  function resolveSpecifier(fromName, specifier) {
    const resolved = isReact ? resolveReactSpecifier(fromName, specifier, fileMap) : resolveModuleSpecifier(fromName, specifier, fileMap);
    if (resolved) importedFromJs.add(resolved.slice(FILE_SPECIFIER_PREFIX.length));
    return resolved;
  }

  function scriptUrl(code, { name, sourceType, lineOffset = 0, columnOffset = 0 }) {
    let padded = '\n'.repeat(lineOffset) + ' '.repeat(columnOffset) + code;
    if (isReact && REACT_SOURCE_FILE.test(name)) {
      try {
        padded = transformReactSource(padded, name);
      } catch {
      }
    }
    const transformed = transformJs(padded, {
      sourceType,
      resolveSpecifier: (specifier) => resolveSpecifier(name, specifier),
    });
    return dataUrl('text/javascript', withSourceUrl(transformed, name), registerSource(name));
  }

  function moduleUrl(name) {
    if (!moduleUrls.has(name)) {
      const content = fileMap.get(name);
      const url = /\.json$/i.test(name) ? (isReact
        ? dataUrl('text/javascript', jsonModule(content))
        : dataUrl('application/json', content))
        : /\.css$/i.test(name) ? dataUrl('text/javascript', cssModule(name, content, tailwind))
        : scriptUrl(content, { name, sourceType: 'module' });
      moduleUrls.set(name, url);
    }
    return moduleUrls.get(name);
  }

  const moduleFiles = [...fileMap.keys()].filter((name) => (isReact ? isReactModuleFile(name) : isModuleFile(name)));
  const imports = {};
  for (const name of moduleFiles) imports[FILE_SPECIFIER_PREFIX + name] = moduleUrl(name);
  if (runtime !== 'js') Object.assign(imports, vendorImports(origin));
  if (runtime === 'vue') imports.vue = `${origin}/vendor/vue.esm-browser.js`;

  const helpersForHtml = { fileMap, scriptUrl, moduleUrl, tailwind, importedFromJs };
  const page = runtime === 'js' ? composeJsPage(helpersForHtml)
    : isReact && !fileMap.has('index.html') ? composeReactPage(helpersForHtml)
    : composeDomPage(helpersForHtml);

  const config = {
    channel: CHANNEL,
    runId: frame.runId,
    mode: frame.mode,
    runtime,
    libs: pageLibs,
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
  const libraryTags =
    (pageLibs.includes('lenis') ? `<style data-akademie-lib="lenis">${LENIS_CSS}</style>` : '') +
    (tailwind ? `<script src="${origin}${VENDOR_PATH}/${TAILWIND_SCRIPT}" crossorigin="anonymous" data-akademie-lib="tailwind"></script>` : '');
  const head =
    `<script>${buildFrameScript(config)}</script>` +
    (Object.keys(imports).length ? `<script type="importmap">${toInlineJson({ imports })}</script>` : '') +
    libraryTags;

  return page.html.slice(0, page.headAt) + head + page.html.slice(page.headAt);
}

function isReactModuleFile(name) {
  return REACT_SOURCE_FILE.test(name) || /\.(json|css)$/i.test(name);
}

export function resolveReactSpecifier(fromName, specifier, fileMap) {
  if (!/^(\.{1,2})?\//.test(specifier)) return null;
  const candidates = [specifier, ...REACT_IMPORT_EXTENSIONS.map((ext) => specifier + ext), ...REACT_IMPORT_EXTENSIONS.map((ext) => `${specifier.replace(/\/$/, '')}/index${ext}`)];
  for (const candidate of candidates) {
    const name = resolveFileReference(fromName, candidate, fileMap);
    if (name && isReactModuleFile(name)) return FILE_SPECIFIER_PREFIX + name;
  }
  return null;
}

function jsonModule(content) {
  return `export default ${String(content ?? '').trim() || 'null'};\n`;
}

function cssModule(name, css, tailwind) {
  const type = tailwind && isTailwindCss(css) ? 'text/tailwindcss' : '';
  return [
    'const style = document.createElement("style");',
    type ? `style.type = ${JSON.stringify(type)};` : '',
    `style.dataset.file = ${JSON.stringify(name)};`,
    `style.textContent = ${JSON.stringify(css)};`,
    'document.head.append(style);',
  ].join('\n');
}

function composeReactPage({ fileMap, moduleUrl, tailwind, importedFromJs }) {
  const names = [...fileMap.keys()];
  const entry = REACT_ENTRIES.find((name) => fileMap.has(name));
  let script = '';
  if (entry) {
    script = `<script type="module" src="${moduleUrl(entry)}"></script>`;
  } else {
    const app = REACT_APPS.find((name) => fileMap.has(name));
    if (app && /\bcreateRoot\s*\(/.test(fileMap.get(app))) {
      script = `<script type="module" src="${moduleUrl(app)}"></script>`;
    } else if (app) {
      const code = [
        `import App from ${JSON.stringify(FILE_SPECIFIER_PREFIX + app)};`,
        "import { createRoot } from 'react-dom/client';",
        "import { jsx } from 'react/jsx-runtime';",
        "createRoot(document.getElementById('root')).render(jsx(App, {}));",
      ].join('\n');
      script = `<script type="module" src="data:text/javascript;charset=utf-8,${encodeURIComponent(code)}"></script>`;
    }
  }
  const styles = names
    .filter((name) => /\.css$/i.test(name) && !importedFromJs.has(name))
    .map((name) => styleTag(fileMap.get(name), tailwind))
    .join('');
  const start = '<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">';
  const html = `${start}${styles}</head><body>\n<div id="root"></div>\n${script}</body></html>`;
  return { html, headAt: start.length };
}

function styleTag(css, tailwind, attributes = '') {
  const type = tailwind && isTailwindCss(css) ? ' type="text/tailwindcss"' : '';
  return `<style${attributes}${type}>${escapeStyle(css)}</style>`;
}

function composeJsPage({ fileMap, scriptUrl }) {
  const names = [...fileMap.keys()];
  const main = names.includes('script.js') ? 'script.js' : names.find((name) => /\.m?js$/i.test(name));
  const script = main ? `<script src="${scriptUrl(fileMap.get(main), { name: main, sourceType: 'script' })}"></script>` : '';
  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"></head><body>${script}</body></html>`;
  return { html, headAt: html.indexOf('<meta') };
}

function composeDomPage({ fileMap, scriptUrl, moduleUrl, tailwind, importedFromJs }) {
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
    return styleTag(fileMap.get(name), tailwind, attributes);
  }

  function replaceScript(token) {
    const type = (getAttribute(token.attributes, 'type') ?? '').trim();
    const isModule = type.toLowerCase() === 'module';
    if (type && !isModule && !CLASSIC_SCRIPT_TYPE.test(type)) return null;
    const src = getAttribute(token.attributes, 'src');

    if (src !== null) {
      if (tailwind && isTailwindCdnUrl(src)) return '';
      const name = resolveFileReference('index.html', src, fileMap);
      if (!name) return null;
      referenced.add(name);
      const url = isModule ? moduleUrl(name) : scriptUrl(fileMap.get(name), { name, sourceType: 'script' });
      return `<script${serializeAttributes(token.attributes, ['src', 'integrity', 'crossorigin'])} src="${url}"></script>`;
    }

    const lineOffset = lineAt(source, token.contentStart) - 1;
    const columnOffset = token.contentStart - (source.lastIndexOf('\n', token.contentStart - 1) + 1);
    const url = scriptUrl(token.content, { name: 'index.html', sourceType: isModule ? 'module' : 'script', lineOffset, columnOffset });
    const skip = isModule ? [] : ['defer', 'async'];
    return `<script${serializeAttributes(token.attributes, skip)} src="${url}"></script>`;
  }

  if (isFullDocument) {
    return { html: output, headAt: doctypeEnd ?? 0 };
  }

  const styles = [...fileMap.keys()]
    .filter((name) => /\.css$/i.test(name) && !referenced.has(name) && !importedFromJs.has(name))
    .map((name) => styleTag(fileMap.get(name), tailwind))
    .join('');
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

export function withSourceUrl(code, name) {
  const safeName = String(name).replace(/[\s]+/g, '_');
  return `${code}\n//# sourceURL=${SOURCE_URL_PREFIX}${safeName}`;
}

function escapeStyle(css) {
  return String(css).replace(/<\/(style)/gi, '<\\/$1');
}
