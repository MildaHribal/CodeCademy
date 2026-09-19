import { apiRequest } from '../../api-request.js';

const DEFAULTS = { theme: 'system', previewWidth: 'tests' };

let current = { ...DEFAULTS };
let loading = null;
let loaded = false;
let changedBeforeLoad = {};
let updateSeq = 0;
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    try {
      listener({ ...current });
    } catch (error) {
      console.error('Posluchač nastavení selhal', error);
    }
  }
}

export const settings = {
  get: () => ({ ...current }),

  load() {
    loading ??= apiRequest('GET', '/api/settings')
      .then((data) => {
        current = { ...DEFAULTS, ...data, ...changedBeforeLoad };
        loaded = true;
        changedBeforeLoad = {};
        notify();
      })
      .catch((error) => {
        console.warn(`Nastavení se nepodařilo načíst: ${error.message}`);
        loading = null;
      });
    return loading.then(() => ({ ...current }));
  },

  async update(patch) {
    current = { ...current, ...patch };
    if (!loaded) changedBeforeLoad = { ...changedBeforeLoad, ...patch };
    const seq = ++updateSeq;
    notify();
    try {
      const saved = await apiRequest('PUT', '/api/settings', patch);
      if (seq === updateSeq) current = { ...DEFAULTS, ...saved };
      return { ...current };
    } catch (error) {
      console.warn(`Nastavení se nepodařilo uložit: ${error.message}`);
      return { ...current };
    }
  },

  onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
