// Postup uživatele v data/progress.json (kontrakt kap. 8).
//
// Soubor se načte při prvním použití a pak se drží v paměti. Každá změna se zapíše
// atomicky: nejdřív do progress.json.tmp, pak přejmenováním přes původní soubor —
// při pádu uprostřed zápisu tak na disku zůstane buď starý, nebo nový obsah, nikdy půlka.
import fs from 'node:fs';
import path from 'node:path';
import { InputError } from './errors.js';

const FILE_NAME = 'progress.json';
// Id modulu nebo kroku: slugy oddělené lomítkem, např. css-flexbox/workshop-navigace/003.
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;

export function emptyProgress() {
  return { version: 1, completed: {}, scores: {}, code: {}, lastVisited: null };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
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

function checkId(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    throw new InputError('Neplatné id — čekám třeba "css-flexbox/workshop-navigace/003"');
  }
}

function checkFiles(files) {
  const valid = Array.isArray(files)
    && files.every((f) => isPlainObject(f) && typeof f.name === 'string' && f.name && typeof f.content === 'string');
  if (!valid) throw new InputError('Pole "files" musí obsahovat objekty { name, content } s textem');
}

function belongsTo(key, id) {
  return key === id || key.startsWith(`${id}/`);
}

/**
 * @param {string} dataDir — adresář, kde leží progress.json (vytvoří se, když chybí)
 * @param {{ now?: () => Date }} [options] — `now` jde v testech podstrčit
 */
export function createProgressStore(dataDir, { now = () => new Date() } = {}) {
  const file = path.join(dataDir, FILE_NAME);
  let state = null;

  function load() {
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') return emptyProgress();
      throw err;
    }
    let progress = null;
    try {
      progress = normalizeProgress(JSON.parse(text));
    } catch {
      progress = null;
    }
    if (progress) return progress;

    // Poškozený soubor nezahazujeme — odložíme ho stranou, ať se dá případně zachránit.
    const stamp = now().toISOString().replace(/[:.]/g, '-');
    const brokenFile = `${file}.broken-${stamp}`;
    fs.renameSync(file, brokenFile);
    console.warn(`Postup v ${file} byl poškozený, přesunul jsem ho do ${brokenFile} a začínám znovu.`);
    return emptyProgress();
  }

  function current() {
    if (!state) state = load();
    return state;
  }

  function save() {
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`);
    fs.renameSync(tmp, file);
  }

  return {
    file,

    /** Kopie aktuálního postupu (úpravy kopie se neprojeví). */
    get() {
      return structuredClone(current());
    },

    /** Uloží rozpracovaný kód kroku nebo modulu. */
    saveCode(id, files) {
      checkId(id);
      checkFiles(files);
      const progress = current();
      progress.code[id] = {
        files: files.map(({ name, content }) => ({ name, content })),
        updated: now().toISOString(),
      };
      progress.lastVisited = id;
      save();
    },

    /** Označí id jako splněné; se `score` si pamatuje nejlepší dosažené skóre. */
    complete(id, score) {
      checkId(id);
      if (score !== undefined && score !== null && !(typeof score === 'number' && Number.isFinite(score))) {
        throw new InputError('"score" musí být číslo');
      }
      const progress = current();
      // Datum prvního splnění se nepřepisuje. (Object.hasOwn, ne `??=`: id jako „constructor"
      // by jinak našlo vlastnost zděděnou z Object.prototype a splnění by se neuložilo.)
      if (!Object.hasOwn(progress.completed, id)) progress.completed[id] = now().toISOString();
      if (typeof score === 'number') {
        const previous = Object.hasOwn(progress.scores, id) ? progress.scores[id] : undefined;
        progress.scores[id] = typeof previous === 'number' ? Math.max(previous, score) : score;
      }
      progress.lastVisited = id;
      save();
      return this.get();
    },

    /** Smaže splnění, skóre a kód pro id i všechna id pod ním (id + '/…'). */
    reset(id) {
      checkId(id);
      const progress = current();
      for (const bucket of [progress.completed, progress.scores, progress.code]) {
        for (const key of Object.keys(bucket)) {
          if (belongsTo(key, id)) delete bucket[key];
        }
      }
      save();
      return this.get();
    },
  };
}
