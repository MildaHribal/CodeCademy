import path from 'node:path';
import { InputError } from './errors.js';
import { createJsonStore } from './store.js';
import { checkId, isPlainObject } from './validate.js';

const FILE_NAME = 'progress.json';

export function emptyProgress() {
  return { version: 1, completed: {}, scores: {}, code: {}, lastVisited: null };
}

function normalizeProgress(data) {
  if (!isPlainObject(data)) return null;
  const progress = { ...emptyProgress(), ...data, version: 1 };
  const shapeOk = isPlainObject(progress.completed)
    && isPlainObject(progress.scores)
    && isPlainObject(progress.code)
    && (progress.lastVisited === null || typeof progress.lastVisited === 'string');
  return shapeOk ? progress : null;
}

function checkFiles(files) {
  const valid = Array.isArray(files)
    && files.every((f) => isPlainObject(f) && typeof f.name === 'string' && f.name && typeof f.content === 'string');
  if (!valid) throw new InputError('Pole "files" musí obsahovat objekty { name, content } s textem');
}

export function belongsTo(key, id) {
  return key === id || key.startsWith(`${id}/`);
}

export function createProgressStore(dataDir, { now = () => new Date() } = {}) {
  const store = createJsonStore(path.join(dataDir, FILE_NAME), {
    defaults: emptyProgress,
    migrate: normalizeProgress,
    now,
  });

  return {
    file: store.file,

    get: () => store.get(),

    flush: () => store.flush(),

    saveCode(id, files) {
      checkId(id);
      checkFiles(files);
      store.update((progress) => {
        progress.code[id] = {
          files: files.map(({ name, content }) => ({ name, content })),
          updated: now().toISOString(),
        };
        progress.lastVisited = id;
      });
    },

    complete(id, score) {
      checkId(id);
      if (score !== undefined && score !== null && !(typeof score === 'number' && Number.isFinite(score))) {
        throw new InputError('"score" musí být číslo');
      }
      store.update((progress) => {
        if (!Object.hasOwn(progress.completed, id)) progress.completed[id] = now().toISOString();
        if (typeof score === 'number') {
          const previous = Object.hasOwn(progress.scores, id) ? progress.scores[id] : undefined;
          progress.scores[id] = typeof previous === 'number' ? Math.max(previous, score) : score;
        }
        progress.lastVisited = id;
      });
      return store.get();
    },

    reset(id) {
      checkId(id);
      store.update((progress) => {
        for (const bucket of [progress.completed, progress.scores, progress.code]) {
          for (const key of Object.keys(bucket)) {
            if (belongsTo(key, id)) delete bucket[key];
          }
        }
      });
      return store.get();
    },
  };
}
