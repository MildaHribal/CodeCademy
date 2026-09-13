// Tenký klient HTTP API serveru (docs/kontrakt.md, kap. 7).
// Každá funkce vrací rozparsované JSON tělo, nebo vyhodí ApiError s českou zprávou.

export class ApiError extends Error {
  constructor(message, { status = 0, offline = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.offline = offline;
  }
}

async function request(method, path, body, { signal } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error; // zrušil to sám volající, server je v pořádku
    throw new ApiError('Server Akademie neodpovídá. Zkontroluj, že běží (./start.sh), a zkus to znovu.', { offline: true });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Tělo není JSON (např. proxy vrátila HTML stránku s chybou).
  }

  if (!response.ok) {
    const message = data?.error ?? `Server vrátil chybu ${response.status}.`;
    // Vite proxy vrací 502/504, když server za ní neběží.
    const offline = !data?.error && (response.status === 502 || response.status === 504);
    throw new ApiError(offline ? 'Server Akademie neodpovídá. Zkontroluj, že běží (./start.sh), a zkus to znovu.' : message, {
      status: response.status,
      offline,
    });
  }
  if (data === null) throw new ApiError('Server poslal odpověď, které nerozumím.', { status: response.status });
  return data;
}

const segment = encodeURIComponent;

export const api = {
  curriculum: () => request('GET', '/api/curriculum'),
  module: (sectionId, moduleId) => request('GET', `/api/module/${segment(sectionId)}/${segment(moduleId)}`),

  progress: () => request('GET', '/api/progress'),
  saveCode: (id, files) => request('PUT', '/api/progress/code', { id, files }),
  complete: (id, score) => request('POST', '/api/progress/complete', score === undefined ? { id } : { id, score }),
  reset: (id) => request('POST', '/api/progress/reset', { id }),

  runNodeFile: (files, main) => request('POST', '/api/run-node-file', { files, main }),

  startProject: (sectionId, moduleId) => request('POST', `/api/project/${segment(sectionId)}/${segment(moduleId)}/start`),
  projectFiles: (sectionId, moduleId) => request('GET', `/api/project/${segment(sectionId)}/${segment(moduleId)}/files`),
  checkProject: (sectionId, moduleId, { signal } = {}) =>
    request('POST', `/api/project/${segment(sectionId)}/${segment(moduleId)}/check`, undefined, { signal }),
};
