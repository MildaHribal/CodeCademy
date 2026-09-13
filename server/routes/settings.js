// Nastavení aplikace v data/nastaveni.json (kontrakt kap. 12.6): barevný motiv a šířka náhledu.
//
// Nastavení je na serveru (ne v localStorage prohlížeče), aby bylo stejné na portu 4300 (./start.sh)
// i 5300 (vývojový server Vite) — každý port má v prohlížeči vlastní localStorage.
//
//   GET /api/settings  → { theme, previewWidth }               (s doplněnými výchozími hodnotami)
//   PUT /api/settings  { previewWidth: '375' } → celé nastavení (sloučí jen poslané klíče)

/** Povolené hodnoty každého klíče; první je výchozí. */
export const SETTINGS_SCHEMA = {
  theme: ['system', 'light', 'dark'],
  previewWidth: ['tests', '768', '375', 'panel'],
};

export function defaultSettings() {
  return Object.fromEntries(Object.entries(SETTINGS_SCHEMA).map(([key, values]) => [key, values[0]]));
}

/**
 * Data ze souboru → platné nastavení. Neznámé klíče a neplatné hodnoty se tiše zahodí
 * (soubor si uživatel mohl upravit ručně); když to vůbec není objekt, soubor je poškozený.
 */
export function normalizeSettings(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
  const settings = { version: 1, ...defaultSettings() };
  for (const [key, values] of Object.entries(SETTINGS_SCHEMA)) {
    if (values.includes(data[key])) settings[key] = data[key];
  }
  return settings;
}

/** Ověří tělo PUT: jen známé klíče se známými hodnotami. Vyhodí InputError s českou zprávou. */
export function validateSettingsPatch(body, InputError) {
  for (const [key, value] of Object.entries(body)) {
    const allowed = SETTINGS_SCHEMA[key];
    if (!allowed) {
      throw new InputError(`Neznámé nastavení "${key}" (povolené: ${Object.keys(SETTINGS_SCHEMA).join(', ')})`);
    }
    if (!allowed.includes(value)) {
      throw new InputError(`Nastavení "${key}" může být jen ${allowed.map((v) => `"${v}"`).join(', ')}`);
    }
  }
  return body;
}

export function register(router, ctx) {
  const store = ctx.createJsonStore('nastaveni.json', {
    defaults: () => ({ version: 1, ...defaultSettings() }),
    migrate: normalizeSettings,
  });

  /** Nastavení bez interního pole version. */
  const publicSettings = () => {
    const { version, ...settings } = store.get();
    return settings;
  };

  router.get('/api/settings', () => publicSettings());

  router.put('/api/settings', async ({ readBody }) => {
    const patch = validateSettingsPatch(await readBody(), ctx.InputError);
    store.update((settings) => {
      Object.assign(settings, patch);
    });
    return publicSettings();
  });
}
