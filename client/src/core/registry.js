// Stavebnice rozšiřovacích bodů: registr položek, události a extension point.
// Nic tu nesahá na DOM, takže to jde použít i v Node testech.

/**
 * Registr položek s unikátním `id` a volitelným `order` (menší = dřív).
 *
 *   const items = createRegistry('položka hlavičky');
 *   items.add({ id: 'opakovani', order: 20, label: 'Opakování' });
 *   items.list();   // seřazené podle order, pak podle pořadí registrace
 */
export function createRegistry(label) {
  const entries = new Map();
  let counter = 0;
  return {
    add(entry) {
      if (!entry || typeof entry.id !== 'string' || !entry.id) throw new Error(`${label}: chybí id`);
      if (entries.has(entry.id)) throw new Error(`${label} „${entry.id}" je registrovaná dvakrát`);
      entries.set(entry.id, { order: 100, ...entry, seq: counter++ });
      return () => entries.delete(entry.id);
    },
    get: (id) => entries.get(id) ?? null,
    has: (id) => entries.has(id),
    list: () => [...entries.values()].sort((a, b) => a.order - b.order || a.seq - b.seq),
  };
}

/**
 * Jednoduché události: on(name, fn) → odhlášení, emit(name, payload).
 * Chyba jednoho posluchače nezastaví ostatní ani toho, kdo událost vyvolal.
 */
export function createEmitter() {
  const listeners = new Map();
  return {
    on(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
      return () => listeners.get(name)?.delete(fn);
    },
    emit(name, payload) {
      for (const fn of [...(listeners.get(name) ?? [])]) {
        try {
          fn(payload);
        } catch (error) {
          console.error(`Posluchač události ${name} selhal`, error);
        }
      }
    },
  };
}

/**
 * Extension point obrazovky (pracovní plocha, lekce, projekt, kvíz).
 *
 *   export const workspaceExtensions = createExtensionPoint('pracovní plochy');
 *   workspaceExtensions.register({ id: 'hints', order: 10, setup(api) { …; return () => úklid } });
 *   workspaceExtensions.mount(api);   // volá jádro obrazovky; vrátí funkci, která vše uklidí
 *
 * Chyba v setup jednoho rozšíření obrazovku nerozbije (zapíše se do konzole).
 */
export function createExtensionPoint(label) {
  const registry = createRegistry(`Rozšíření ${label}`);
  return {
    register: (extension) => {
      if (typeof extension?.setup !== 'function') throw new Error(`Rozšíření ${label} „${extension?.id}" nemá setup()`);
      return registry.add(extension);
    },
    list: registry.list,
    mount(api) {
      const cleanups = [];
      for (const extension of registry.list()) {
        try {
          const cleanup = extension.setup(api);
          if (typeof cleanup === 'function') cleanups.push(cleanup);
        } catch (error) {
          console.error(`Rozšíření ${label} „${extension.id}" selhalo`, error);
        }
      }
      return () => {
        for (const cleanup of cleanups.reverse()) {
          try {
            cleanup();
          } catch (error) {
            console.error(`Úklid rozšíření ${label} selhal`, error);
          }
        }
      };
    },
  };
}
