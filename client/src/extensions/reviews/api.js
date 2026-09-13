// Endpointy opakování a jistoty (kontrakt kap. 12.3, 12.4).
import { apiRequest } from '../../api-request.js';

const segment = encodeURIComponent;

export const reviewsApi = {
  summary: ({ signal } = {}) => apiRequest('GET', '/api/reviews/summary', undefined, { signal }),
  due: ({ signal } = {}) => apiRequest('GET', '/api/reviews/due', undefined, { signal }),
  /** @param {{ id: string, ok: boolean, confidence?: 'sure' | 'guess' | null }} body */
  answer: (body) => apiRequest('POST', '/api/reviews/answer', body),
  /** reason: 'assisted' | 'fails' | 'self' | 'explain' | 'outcome' */
  add: (id, reason) => apiRequest('POST', '/api/reviews/add', { id, reason }),
  remove: (id) => apiRequest('POST', '/api/reviews/remove', { id }),
};

export const confidenceApi = {
  section: (sectionId, { signal } = {}) => apiRequest('GET', `/api/confidence/${segment(sectionId)}`, undefined, { signal }),
};
