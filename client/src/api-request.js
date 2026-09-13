// Jediná funkce pro volání HTTP API serveru. Nové endpointy si nástroje obalí ve vlastním souboru:
//
//   import { apiRequest } from '../api-request.js';
//   export const reviewsApi = {
//     due: () => apiRequest('GET', '/api/reviews/due'),
//     answer: (body) => apiRequest('POST', '/api/reviews/answer', body),
//   };
//
// Vrací rozparsované JSON tělo, nebo vyhodí ApiError s českou zprávou
// (error.status = HTTP stav, error.offline = server neběží).

export class ApiError extends Error {
  constructor(message, { status = 0, offline = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.offline = offline;
  }
}

const OFFLINE_MESSAGE = 'Server Akademie neodpovídá. Zkontroluj, že běží (./start.sh), a zkus to znovu.';

/**
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
 * @param {string} path  např. '/api/reviews/due' (parametry v cestě ošetři přes encodeURIComponent)
 * @param {object} [body]  pošle se jako JSON
 * @param {{ signal?: AbortSignal, keepalive?: boolean }} [options]
 */
export async function apiRequest(method, path, body, { signal, keepalive } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      ...(keepalive ? { keepalive } : {}),
    });
  } catch (error) {
    if (signal?.aborted) throw error; // zrušil to sám volající, server je v pořádku
    throw new ApiError(OFFLINE_MESSAGE, { offline: true });
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
    throw new ApiError(offline ? OFFLINE_MESSAGE : message, { status: response.status, offline });
  }
  if (data === null) throw new ApiError('Server poslal odpověď, které nerozumím.', { status: response.status });
  return data;
}
