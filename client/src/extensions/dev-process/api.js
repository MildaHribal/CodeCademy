// Volání /api/dev-process (kontrakt kap. 12.7). Bez DOM — jde použít i v testech v Node.
import { apiRequest } from '../../api-request.js';

export const devProcessApi = {
  /** Poslední proces (i skončený) → { process } */
  get: ({ signal } = {}) => apiRequest('GET', '/api/dev-process', undefined, { signal }),

  /** { files, main?, env? } nebo { project: { section, module }, main? } → { ok, process } */
  start: (body) => apiRequest('POST', '/api/dev-process/start', body),

  /** keepalive: požadavek doběhne, i když uživatel stránku zrovna opouští. */
  stop: ({ keepalive = false } = {}) => apiRequest('POST', '/api/dev-process/stop', {}, { keepalive }),

  /** { method, path, headers, body, timeoutMs } → { ok, status, headers, body, … } nebo { ok: false, error } */
  request: (body, { signal } = {}) => apiRequest('POST', '/api/dev-process/request', body, { signal }),

  /** Výstup od pořadového čísla since → { process, next, truncated, chunks } */
  output: (since, { signal } = {}) =>
    apiRequest('GET', `/api/dev-process/output?since=${encodeURIComponent(since)}`, undefined, { signal }),
};
