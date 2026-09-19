
const routes = [];

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
  module: (moduleId) => `#/modul/${moduleId}`,
  step: (stepId) => `#/modul/${stepId}`,
};

export const hrefForId = (id) => `#/modul/${id}`;

export function startRouter(handler) {
  const run = () => handler(parseHash());
  window.addEventListener('hashchange', run);
  run();
}

export function rerender() {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function redirect(hash) {
  history.replaceState(null, '', hash);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
