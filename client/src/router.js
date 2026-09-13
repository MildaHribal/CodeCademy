// Hash router s registrem cest. Jádro definuje:
//   #/                               přehled osnovy            → { name: 'overview' }
//   #/sekce/:sectionId               detail sekce              → { name: 'section', sectionId }
//   #/modul/:sectionId/:moduleId     modul (lekce, lab…)       → { name: 'module', sectionId, moduleId, stepKey: null }
//   #/modul/:sectionId/:moduleId/:stepKey   krok workshopu (stepKey = "001", "002", …)
//
// Nástroj přidá vlastní obrazovku přes registerScreen (core/screens.js), které volá defineRoute:
//   defineRoute('reviews', '/opakovani')          → #/opakovani            → { name: 'reviews' }
//   defineRoute('notes', '/poznamky/:sectionId?') → #/poznamky/css-flexbox → { name: 'notes', sectionId: 'css-flexbox' }
// Za cestou smí být dotaz: #/hledat?q=flex → { name: 'search', query: { q: 'flex' } } (klíč query jen když dotaz je).
//
// Tento soubor nesahá na DOM při importu, testuje se v Node (tools/client-unit.test.js).

const routes = [];

/**
 * Přidá cestu. Parametry `:jmeno`, nepovinný poslední `:jmeno?` (chybí → null).
 * Cesty se zkouší v pořadí přidání; stejné jméno dvakrát je chyba.
 */
export function defineRoute(name, path) {
  if (routes.some((route) => route.name === name)) throw new Error(`Cesta „${name}" je definovaná dvakrát`);
  const segments = path.split('/').filter(Boolean).map((segment) => {
    if (!segment.startsWith(':')) return { literal: segment };
    const optional = segment.endsWith('?');
    return { param: segment.slice(1, optional ? -1 : undefined), optional };
  });
  routes.push({ name, path, segments });
}

function matchRoute(route, parts) {
  const params = {};
  const required = route.segments.filter((s) => !s.optional).length;
  if (parts.length < required || parts.length > route.segments.length) return null;
  for (const [index, segment] of route.segments.entries()) {
    const part = parts[index];
    if (segment.literal !== undefined) {
      if (part !== segment.literal) return null;
    } else {
      params[segment.param] = part ?? null;
    }
  }
  return { name: route.name, ...params };
}

defineRoute('overview', '/');
defineRoute('section', '/sekce/:sectionId');
defineRoute('module', '/modul/:sectionId/:moduleId/:stepKey?');

export function parseHash(hash = location.hash) {
  const [pathPart, queryPart] = hash.replace(/^#\/?/, '').split(/\?(.*)/s);
  let parts;
  try {
    parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    // Rozbité %-kódování v ručně psané adrese (decodeURIComponent vyhodí URIError).
    return { name: 'not-found' };
  }
  for (const route of routes) {
    const match = matchRoute(route, parts);
    if (!match) continue;
    if (queryPart) match.query = Object.fromEntries(new URLSearchParams(queryPart));
    return match;
  }
  return { name: 'not-found' };
}

export const href = {
  overview: () => '#/',
  section: (sectionId) => `#/sekce/${sectionId}`,
  module: (moduleId) => `#/modul/${moduleId}`, // moduleId = "sekce/modul"
  step: (stepId) => `#/modul/${stepId}`, // stepId = "sekce/modul/003"
};

/** Adresa pro libovolné id z postupu (modul i krok mají tvar sekce/modul[/krok]). */
export const hrefForId = (id) => `#/modul/${id}`;

/** Zavolá handler při každé změně adresy (i hned na začátku). */
export function startRouter(handler) {
  const run = () => handler(parseHash());
  window.addEventListener('hashchange', run);
  run();
}

/** Znovu vykreslí aktuální obrazovku (např. tlačítko Zkusit znovu po chybě). */
export function rerender() {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

/** Přesměrování bez nového záznamu v historii (Zpět pak nevrací na mezikrok). */
export function redirect(hash) {
  history.replaceState(null, '', hash);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
