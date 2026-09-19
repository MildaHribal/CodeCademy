import { HttpError } from './errors.js';
import { abortOnDisconnect, readJsonBody } from './http.js';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function compilePath(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error(`Cesta routy musí začínat lomítkem: ${path}`);
  }
  const names = [];
  const source = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        const name = segment.slice(1);
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error(`Neplatný parametr "${segment}" v cestě ${path}`);
        names.push(name);
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { pattern: new RegExp(`^${source}$`), names };
}

export function createRouter() {
  const routes = [];

  function add(method, path, handler, { source = null } = {}) {
    const upper = String(method).toUpperCase();
    if (!METHODS.includes(upper)) throw new Error(`Nepodporovaná metoda ${method} (${path})`);
    if (typeof handler !== 'function') throw new Error(`Routa ${upper} ${path} nemá obsluhu`);
    const duplicate = routes.find((route) => route.method === upper && route.path === path);
    if (duplicate) {
      const where = [duplicate.source, source].filter(Boolean).join(' a ');
      throw new Error(`Routa ${upper} ${path} je registrovaná dvakrát${where ? ` (${where})` : ''}`);
    }
    routes.push({ method: upper, path, handler, source, ...compilePath(path) });
  }

  function api(source) {
    const scoped = {
      add: (method, path, handler) => add(method, path, handler, { source }),
      get: (path, handler) => add('GET', path, handler, { source }),
      post: (path, handler) => add('POST', path, handler, { source }),
      put: (path, handler) => add('PUT', path, handler, { source }),
      patch: (path, handler) => add('PATCH', path, handler, { source }),
      delete: (path, handler) => add('DELETE', path, handler, { source }),
    };
    return scoped;
  }

  return {
    ...api(null),

    forSource: (source) => api(source),

    list: () => routes.map(({ method, path, source }) => ({ method, path, source })),

    match(method, pathname) {
      const matching = routes
        .map((route) => ({ route, match: pathname.match(route.pattern) }))
        .filter((candidate) => candidate.match);
      if (matching.length === 0) throw new HttpError(404, `Neznámá adresa API: ${pathname}`);
      const found = matching.find((candidate) => candidate.route.method === method);
      if (!found) {
        const allowed = [...new Set(matching.map((candidate) => candidate.route.method))].join(', ');
        throw new HttpError(405, `Metoda ${method} tu není povolená (povolené: ${allowed})`);
      }
      const params = {};
      try {
        found.route.names.forEach((name, index) => {
          params[name] = decodeURIComponent(found.match[index + 1]);
        });
      } catch {
        throw new HttpError(400, 'Neplatná adresa');
      }
      return { handler: found.route.handler, params };
    },
  };
}

export function createRequestContext(req, res, url, params) {
  let signal = null;
  return {
    req,
    res,
    url,
    params,
    query: url.searchParams,
    readBody: () => readJsonBody(req),
    get signal() {
      signal ??= abortOnDisconnect(res);
      return signal;
    },
  };
}
