// Klient API pokusů a statistik (kontrakt kap. 12.2). Používají ho nápovědy, porovnání
import { apiRequest } from '../../api-request.js';
import { appEvents } from '../../core/events.js';

const queues = new Map();

export const attemptsApi = {
  record(body, { keepalive = false } = {}) {
    const previous = queues.get(body.id) ?? Promise.resolve();
    const request = previous
      .catch(() => {})
      .then(() => apiRequest('POST', '/api/attempts', body, { keepalive }))
      .then(({ attempt }) => {
        appEvents.emit('attempts:recorded', { id: body.id, attempt });
        return attempt;
      });
    queues.set(body.id, request);
    request.finally(() => {
      if (queues.get(body.id) === request) queues.delete(body.id);
    }).catch(() => {});
    return request;
  },

  list(prefix, { signal } = {}) {
    return apiRequest('GET', `/api/attempts?prefix=${encodeURIComponent(prefix)}`, undefined, { signal });
  },

  stats({ signal } = {}) {
    return apiRequest('GET', '/api/stats', undefined, { signal });
  },
};

export function recordQuietly(body, options) {
  return attemptsApi.record(body, options).catch((error) => {
    console.warn(`Pokus pro ${body.id} se nepodařilo uložit: ${error.message}`);
    return null;
  });
}
