import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const records = new Map();
let exitHookInstalled = false;

function cloneDefaults(defaults) {
  return structuredClone(typeof defaults === 'function' ? defaults() : defaults);
}

function stampOf(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function serialize(state) {
  return `${JSON.stringify(state, null, 2)}\n`;
}

function installExitHook() {
  if (exitHookInstalled) return;
  exitHookInstalled = true;
  process.on('exit', () => {
    for (const record of records.values()) {
      if (!record.dirty && !record.busy) continue;
      try {
        fs.mkdirSync(path.dirname(record.file), { recursive: true });
        const tmp = `${record.file}.tmp-exit`;
        fs.writeFileSync(tmp, serialize(record.state));
        fs.renameSync(tmp, record.file);
        record.dirty = false;
        record.busy = false;
      } catch (error) {
        console.error(`Nepodařilo se dopsat ${record.file}: ${error.message}`);
      }
    }
  });
}

export function createJsonStore(file, { defaults = {}, migrate = (data) => data, now = () => new Date() } = {}) {
  const absolute = path.resolve(file);
  let record = records.get(absolute);
  if (!record) {
    record = { file: absolute, state: undefined, loaded: false, dirty: false, busy: false, writing: null };
    records.set(absolute, record);
  }
  installExitHook();

  function load() {
    let text;
    try {
      text = fs.readFileSync(absolute, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return cloneDefaults(defaults);
      throw error;
    }
    let data = null;
    try {
      data = migrate(JSON.parse(text)) ?? null;
    } catch {
      data = null;
    }
    if (data !== null) return data;

    const brokenFile = `${absolute}.broken-${stampOf(now())}`;
    fs.renameSync(absolute, brokenFile);
    console.warn(`Soubor ${absolute} byl poškozený, přesunul jsem ho do ${brokenFile} a začínám znovu.`);
    return cloneDefaults(defaults);
  }

  function current() {
    if (!record.loaded) {
      record.state = load();
      record.loaded = true;
    }
    return record.state;
  }

  async function writeLoop() {
    while (record.dirty) {
      record.dirty = false;
      record.busy = true;
      const text = serialize(record.state);
      const tmp = `${absolute}.tmp`;
      try {
        await fsp.mkdir(path.dirname(absolute), { recursive: true });
        await fsp.writeFile(tmp, text);
        await fsp.rename(tmp, absolute);
      } catch (error) {
        record.dirty = true;
        console.error(`Zápis ${absolute} selhal: ${error.message}`);
        return;
      } finally {
        record.busy = false;
      }
    }
  }

  function scheduleWrite() {
    record.dirty = true;
    if (record.writing) return;
    record.writing = writeLoop().finally(() => {
      record.writing = null;
    });
  }

  return {
    file: absolute,

    get() {
      return structuredClone(current());
    },

    update(fn) {
      const draft = structuredClone(current());
      const result = fn(draft);
      record.state = draft;
      scheduleWrite();
      return result;
    },

    set(data) {
      current();
      record.state = structuredClone(data);
      scheduleWrite();
    },

    clear() {
      current();
      record.state = cloneDefaults(defaults);
      scheduleWrite();
    },

    async flush() {
      while (record.writing) await record.writing;
      if (record.dirty) {
        scheduleWrite();
        await record.writing;
      }
    },
  };
}
