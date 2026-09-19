import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildContentIndex, loadCurriculum, loadModule, loadSectionExtras, readTextTree, resolveContentItem,
} from '../shared/content.js';
import { HttpError, InputError } from './errors.js';
import { abortOnDisconnect, clampTimeout, createLimiter, readJsonBody, sendJson } from './http.js';
import { createProgressStore } from './progress.js';
import { createJsonStore } from './store.js';
import { checkId, checkSlugs, isPlainObject, SLUG } from './validate.js';

export function createContext({ contentDir, dataDir, projectsDir, distDir }) {
  const resetters = [];
  const closers = [];
  const listeners = new Map();
  const dataRoot = path.resolve(dataDir);

  function dataPath(name) {
    const target = path.resolve(dataRoot, name);
    if (!target.startsWith(dataRoot + path.sep)) throw new Error(`Soubor ${name} musí ležet v adresáři data/`);
    return target;
  }

  const ctx = {
    contentDir,
    dataDir,
    projectsDir,
    distDir,

    progress: createProgressStore(dataDir),

    createJsonStore: (name, options) => createJsonStore(dataPath(name), options),
    dataPath,

    loadCurriculum: () => loadCurriculum(contentDir),
    loadModule: (sectionId, moduleId, { includeSolutions = false } = {}) =>
      loadModule(contentDir, sectionId, moduleId, { includeSolutions }),
    moduleExists: (sectionId, moduleId) =>
      SLUG.test(sectionId) && SLUG.test(moduleId) && fs.existsSync(path.join(contentDir, sectionId, moduleId, 'module.json')),
    contentIndex: () => buildContentIndex(contentDir),
    loadSectionExtras: (sectionId) => loadSectionExtras(contentDir, sectionId),
    resolveItem: (id) => resolveContentItem(contentDir, id),
    readTextTree,

    readJsonBody,
    sendJson,
    abortOnDisconnect,
    clampTimeout,
    HttpError,
    InputError,
    checkId,
    checkSlugs,
    isPlainObject,
    limitRuns: createLimiter(Math.max(2, Math.floor(os.availableParallelism() / 2))),

    onReset(fn) {
      resetters.push(fn);
    },
    async runResetters(id) {
      for (const fn of resetters) await fn(id);
    },

    on(name, fn) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(fn);
      return () => {
        const list = listeners.get(name) ?? [];
        const index = list.indexOf(fn);
        if (index !== -1) list.splice(index, 1);
      };
    },
    async emit(name, payload) {
      for (const fn of [...(listeners.get(name) ?? [])]) {
        try {
          await fn(payload);
        } catch (error) {
          console.error(`Posluchač události ${name} selhal`, error);
        }
      }
    },

    onClose(fn) {
      closers.push(fn);
    },
    async runClosers() {
      for (const fn of closers.splice(0).reverse()) {
        try {
          await fn();
        } catch (error) {
          console.error('Úklid serveru selhal', error);
        }
      }
    },
  };
  return ctx;
}
