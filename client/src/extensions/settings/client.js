// Nastavení v prohlížeči: jedno načtení z GET /api/settings, změny přes PUT /api/settings.
// Používají ho rozšíření theme.js (motiv) a preview-tools.js (šířka náhledu).
//
//   await settings.load();                 // { theme, previewWidth }
//   settings.get().theme                   // poslední známá hodnota (i před načtením: výchozí)
//   settings.update({ theme: 'dark' });    // hned změní hodnotu v aplikaci, pak ji uloží na server
//   settings.onChange((value) => …);       // po každé změně; vrací odhlášení
import { apiRequest } from '../../api-request.js';

const DEFAULTS = { theme: 'system', previewWidth: 'tests' };

let current = { ...DEFAULTS };
let loading = null;
let loaded = false;
// Změny přes update() před dokončením načtení: odpověď GET je nesmí přepsat (starší stav serveru).
let changedBeforeLoad = {};
// Pořadí uložení: odpověď staršího PUT nesmí přepsat novější volbu.
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

  /**
   * Načte nastavení ze serveru (jen jednou). Když server neodpoví, zůstanou výchozí hodnoty.
   * Vrací vždy aktuální hodnoty — i když se od načtení něco změnilo přes update().
   */
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
        loading = null; // příště to zkusíme znovu
      });
    return loading.then(() => ({ ...current }));
  },

  /** Změní hodnoty hned (UI nečeká na server) a uloží je. Vrací uložené nastavení. */
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
