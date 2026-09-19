// Volání /api/dev-process (kontrakt kap. 12.7). Bez DOM — jde použít i v testech v Node.
import { apiRequest } from '../../api-request.js';

export const devProcessApi = {
  get: ({ signal } = {}) => apiRequest('GET', '/api/dev-process', undefined, { signal }),

  start: (body) => apiRequest('POST', '/api/dev-process/start', body),

  stop: ({ keepalive = false } = {}) => apiRequest('POST', '/api/dev-process/stop', {}, { keepalive }),

  request: (body, { signal } = {}) => apiRequest('POST', '/api/dev-process/request', body, { signal }),

  output: (since, { signal } = {}) =>
    apiRequest('GET', `/api/dev-process/output?since=${encodeURIComponent(since)}`, undefined, { signal }),
};
