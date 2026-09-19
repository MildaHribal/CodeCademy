// Endpointy jádra (docs/kontrakt.md, kap. 7). Nástroje nepřidávají funkce sem, ale do
import { apiRequest as request } from './api-request.js';

export { ApiError, apiRequest } from './api-request.js';

const segment = encodeURIComponent;

export const api = {
  curriculum: () => request('GET', '/api/curriculum'),
  module: (sectionId, moduleId) => request('GET', `/api/module/${segment(sectionId)}/${segment(moduleId)}`),
  moduleWithSolutions: (sectionId, moduleId) => request('GET', `/api/module/${segment(sectionId)}/${segment(moduleId)}?solution=1`),

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
