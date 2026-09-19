// Volání HTTP API poznámek (kontrakt kap. 12.5).
import { apiRequest } from '../../api-request.js';

const segment = encodeURIComponent;

export const notesApi = {
  list: ({ signal } = {}) => apiRequest('GET', '/api/notes', undefined, { signal }),
  get: (section, { signal } = {}) => apiRequest('GET', `/api/notes/${segment(section)}`, undefined, { signal }),
  save: (section, content, baseUpdated) => apiRequest('PUT', `/api/notes/${segment(section)}`, { content, baseUpdated }),
  append: (section, body) => apiRequest('POST', `/api/notes/${segment(section)}/append`, body),
};
