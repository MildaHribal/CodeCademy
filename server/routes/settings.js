export const SETTINGS_SCHEMA = {
  theme: ['system', 'light', 'dark'],
  previewWidth: ['tests', '768', '375', 'panel'],
};

export function defaultSettings() {
  return Object.fromEntries(Object.entries(SETTINGS_SCHEMA).map(([key, values]) => [key, values[0]]));
}

export function normalizeSettings(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
  const settings = { version: 1, ...defaultSettings() };
  for (const [key, values] of Object.entries(SETTINGS_SCHEMA)) {
    if (values.includes(data[key])) settings[key] = data[key];
  }
  return settings;
}

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
