// JSON úložiště v jednom souboru (data/*.json) — základ pro postup i další nástroje.
//
//   const store = createJsonStore(path.join(dataDir, 'opakovani.json'), {
//     defaults: () => ({ version: 1, items: {} }),
//     migrate: (data) => (isPlainObject(data?.items) ? data : null),
//   });
//   store.get();                                 // kopie dat
//   store.update((draft) => { draft.items.a = 1; });
//   await store.flush();                         // počká na zápis (testy)
//
// Vlastnosti:
// - Data se drží v paměti, soubor se čte jen poprvé (líně, při prvním get/update).
// - Zápis je atomický: nejdřív `<soubor>.tmp`, pak rename přes původní soubor. Při pádu
//   uprostřed zápisu na disku zůstane buď starý, nebo nový obsah, nikdy půlka.
// - Fronta zápisů: v jednu chvíli běží nejvýš jeden zápis souboru. Změny, které přijdou
//   mezitím, se sloučí do jednoho dalšího zápisu s nejnovějším stavem.
// - Poškozený soubor (neplatný JSON nebo `migrate` vrátí null) se nezahodí: přesune se
//   na `<soubor>.broken-<čas>` a začne se z `defaults`.
// - Dva `createJsonStore` nad stejnou cestou v jednom procesu sdílí stav i frontu
//   (restart serveru v testech tak nepřečte soubor, který se ještě zapisuje).
// - Při ukončení procesu se nezapsané změny dopíšou synchronně.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

/** Sdílené záznamy podle absolutní cesty souboru. */
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
      // I rozepsaný asynchronní zápis: proces končí dřív, než by doběhl rename.
      if (!record.dirty && !record.busy) continue;
      try {
        // Jiný .tmp než asynchronní zápis — ten mohl zůstat rozepsaný.
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

/**
 * @template T
 * @param {string} file — cesta k JSON souboru (adresář se vytvoří při prvním zápisu)
 * @param {{
 *   defaults?: T | (() => T),
 *   migrate?: (data: unknown) => T | null | undefined,
 *   now?: () => Date,
 * }} [options]
 *   defaults — výchozí data (když soubor chybí nebo je poškozený)
 *   migrate  — převede načtená data na aktuální tvar; null/undefined = poškozený soubor
 *   now      — čas pro jméno `.broken-<čas>` (v testech jde podstrčit)
 */
export function createJsonStore(file, { defaults = {}, migrate = (data) => data, now = () => new Date() } = {}) {
  const absolute = path.resolve(file);
  let record = records.get(absolute);
  if (!record) {
    // dirty = změny, které ještě nejsou na disku; busy = právě běží zápis; writing = jeho Promise
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
        // Data zůstávají v paměti; zkusí se to znovu při další změně nebo při ukončení.
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

    /** Hluboká kopie aktuálních dat (úpravy kopie se neprojeví). */
    get() {
      return structuredClone(current());
    },

    /**
     * Upraví data: `fn` dostane kopii, kterou smí měnit. Když `fn` vyhodí, nic se nezmění.
     * Vrací to, co vrátí `fn`. Zápis na disk se naplánuje hned.
     */
    update(fn) {
      const draft = structuredClone(current());
      const result = fn(draft);
      record.state = draft;
      scheduleWrite();
      return result;
    },

    /** Nahradí celá data. */
    set(data) {
      current();
      record.state = structuredClone(data);
      scheduleWrite();
    },

    /** Vrátí data na `defaults` (a zapíše je). */
    clear() {
      current();
      record.state = cloneDefaults(defaults);
      scheduleWrite();
    },

    /** Počká, až jsou všechny změny zapsané na disku. */
    async flush() {
      while (record.writing) await record.writing;
      if (record.dirty) {
        scheduleWrite();
        await record.writing;
      }
    },
  };
}
