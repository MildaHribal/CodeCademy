// Jména souborů kroku a jejich vzájemné odkazy (href, src, import).

/** Předpona, pod kterou jsou soubory kroku dostupné jako ES moduly (přes import map). */
export const FILE_SPECIFIER_PREFIX = '@akademie/files/';

/** Soubory, které jde naimportovat jako modul. */
export function isModuleFile(name) {
  return /\.(m?js|json)$/i.test(name);
}

/** Sjednotí zápis jména: bez `./`, bez úvodního `/`, dopředná lomítka. */
export function normalizeFileName(name) {
  return String(name)
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '');
}

/**
 * Převede odkaz z HTML nebo importu na jméno souboru kroku.
 * Vrátí `null`, když odkaz míří jinam (http://, data:, neexistující soubor…).
 *
 * @param {string} fromName  soubor, ve kterém odkaz je (kvůli relativním cestám)
 * @param {string} reference  hodnota href/src nebo specifikátor importu
 * @param {Set<string>|Map<string, unknown>} fileNames  jména souborů kroku
 */
export function resolveFileReference(fromName, reference, fileNames) {
  const raw = String(reference ?? '').trim();
  if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) return null;

  const withoutQuery = raw.replace(/[?#].*$/, '');
  let decoded = withoutQuery;
  try {
    decoded = decodeURI(withoutQuery);
  } catch {
    // Neplatné %-kódování — použijeme odkaz tak, jak je.
  }

  const baseParts = decoded.startsWith('/') ? [] : normalizeFileName(fromName).split('/').slice(0, -1);
  const parts = [...baseParts];
  for (const segment of decoded.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') parts.pop();
    else parts.push(segment);
  }
  const name = parts.join('/');
  return fileNames.has(name) ? name : null;
}

/** Specifikátor importu: relativní cestu na soubor kroku převede na `@akademie/files/…`. */
export function resolveModuleSpecifier(fromName, specifier, fileNames) {
  if (!/^(\.{1,2})?\//.test(specifier)) return null; // holé specifikátory (vue) nechává být
  const name = resolveFileReference(fromName, specifier, fileNames);
  return name && isModuleFile(name) ? FILE_SPECIFIER_PREFIX + name : null;
}
