
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
