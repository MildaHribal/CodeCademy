// Hash router. Adresy:
//   #/                       přehled osnovy
//   #/sekce/:section         detail sekce
//   #/modul/:section/:module         modul (lekce, lab, kvíz, projekt, workshop)
//   #/modul/:section/:module/:step   krok workshopu (step = "001", "002", …)

export function parseHash(hash = location.hash) {
  let parts;
  try {
    parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    // Rozbité %-kódování v ručně psané adrese (decodeURIComponent vyhodí URIError).
    return { name: 'not-found' };
  }
  const [kind, ...rest] = parts;

  if (!kind) return { name: 'overview' };
  if (kind === 'sekce' && rest.length === 1) return { name: 'section', sectionId: rest[0] };
  if (kind === 'modul' && (rest.length === 2 || rest.length === 3)) {
    return { name: 'module', sectionId: rest[0], moduleId: rest[1], stepKey: rest[2] ?? null };
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
