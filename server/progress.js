// Postup uživatele v data/progress.json (kontrakt kap. 8).
//
// Ukládá se přes createJsonStore (server/store.js): data v paměti, atomický zápis
// přes .tmp + rename a fronta zápisů. Poškozený soubor se odloží na .broken-<čas>.
import path from 'node:path';
import { InputError } from './errors.js';
import { createJsonStore } from './store.js';
import { checkId, isPlainObject } from './validate.js';

const FILE_NAME = 'progress.json';

export function emptyProgress() {
  return { version: 1, completed: {}, scores: {}, code: {}, lastVisited: null };
}

/** Vrátí postup s doplněnými výchozími hodnotami, nebo null, když data nedávají smysl. */
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

/** Patří klíč k id (je to id samo, nebo něco pod ním: id + '/…')? */
export function belongsTo(key, id) {
  return key === id || key.startsWith(`${id}/`);
}

/**
 * @param {string} dataDir — adresář, kde leží progress.json (vytvoří se, když chybí)
 * @param {{ now?: () => Date }} [options] — `now` jde v testech podstrčit
 */
export function createProgressStore(dataDir, { now = () => new Date() } = {}) {
  const store = createJsonStore(path.join(dataDir, FILE_NAME), {
    defaults: emptyProgress,
    migrate: normalizeProgress,
    now,
  });

  return {
    file: store.file,

    /** Kopie aktuálního postupu (úpravy kopie se neprojeví). */
    get: () => store.get(),

    /** Počká, až je postup zapsaný na disku. */
    flush: () => store.flush(),

    /** Uloží rozpracovaný kód kroku nebo modulu. */
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

    /** Označí id jako splněné; se `score` si pamatuje nejlepší dosažené skóre. */
    complete(id, score) {
      checkId(id);
      if (score !== undefined && score !== null && !(typeof score === 'number' && Number.isFinite(score))) {
        throw new InputError('"score" musí být číslo');
      }
      store.update((progress) => {
        // Datum prvního splnění se nepřepisuje. (Object.hasOwn, ne `??=`: id jako „constructor"
        // by jinak našlo vlastnost zděděnou z Object.prototype a splnění by se neuložilo.)
        if (!Object.hasOwn(progress.completed, id)) progress.completed[id] = now().toISOString();
        if (typeof score === 'number') {
          const previous = Object.hasOwn(progress.scores, id) ? progress.scores[id] : undefined;
          progress.scores[id] = typeof previous === 'number' ? Math.max(previous, score) : score;
        }
        progress.lastVisited = id;
      });
      return store.get();
    },

    /** Smaže splnění, skóre a kód pro id i všechna id pod ním (id + '/…'). */
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
