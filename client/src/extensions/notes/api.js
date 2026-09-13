// Volání HTTP API poznámek (kontrakt kap. 12.5).
import { apiRequest } from '../../api-request.js';

const segment = encodeURIComponent;

export const notesApi = {
  list: ({ signal } = {}) => apiRequest('GET', '/api/notes', undefined, { signal }),
  get: (section, { signal } = {}) => apiRequest('GET', `/api/notes/${segment(section)}`, undefined, { signal }),
  /** baseUpdated = `updated` z posledního načtení; když se soubor mezitím změnil, server vrátí 409. */
  save: (section, content, baseUpdated) => apiRequest('PUT', `/api/notes/${segment(section)}`, { content, baseUpdated }),
  /** body = { kind: 'note' | 'quote' | 'explain' | 'plan', source, title, text, quote? } */
  append: (section, body) => apiRequest('POST', `/api/notes/${segment(section)}/append`, body),
};
