
export const FILE_SPECIFIER_PREFIX = '@akademie/files/';

export function isModuleFile(name) {
  return /\.(m?js|json)$/i.test(name);
}

export function normalizeFileName(name) {
  return String(name)
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '');
}

export function resolveFileReference(fromName, reference, fileNames) {
  const raw = String(reference ?? '').trim();
  if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) return null;

  const withoutQuery = raw.replace(/[?#].*$/, '');
  let decoded = withoutQuery;
  try {
    decoded = decodeURI(withoutQuery);
  } catch {
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

export function resolveModuleSpecifier(fromName, specifier, fileNames) {
  if (!/^(\.{1,2})?\//.test(specifier)) return null;
  const name = resolveFileReference(fromName, specifier, fileNames);
  return name && isModuleFile(name) ? FILE_SPECIFIER_PREFIX + name : null;
}
