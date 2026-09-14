// Sestavení klienta přes Vite do zadaného (dočasného) adresáře: jen runner.html (verify)
// nebo celá aplikace (E2E).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureVendor } from '../build-vendor.js';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Použije konfiguraci z vite.config.js, jen výstup jde do `outDir` (ne do dist/, kde
 * může zrovna pracovat někdo jiný) a staví se jen vstup runner.html — verify tak
 * nezávisí na stavu zbytku aplikace.
 */
export async function buildRunner(outDir) {
  await buildClient(outDir, { input: { runner: path.join(PROJECT_ROOT, 'client', 'runner.html') } });
}

/**
 * Celá aplikace (index.html i runner.html) do `outDir` — pro E2E test.
 * @param {{ input?: object }} options  jiné vstupy než ve vite.config.js
 */
export async function buildClient(outDir, { input = null } = {}) {
  // Knihovny pro runtime (React, Motion…) — server je vydává z node_modules/.cache (kap. 6.10).
  await ensureVendor();
  const vite = await import('vite');
  const configFile = path.join(PROJECT_ROOT, 'vite.config.js');
  const loaded = await vite.loadConfigFromFile({ command: 'build', mode: 'production' }, configFile, PROJECT_ROOT, 'silent');
  const config = loaded?.config ?? {};
  const build = config.build ?? {};
  const rollupOptions = build.rollupOptions ?? {};

  await vite.build({
    ...config,
    configFile: false,
    root: path.join(PROJECT_ROOT, 'client'),
    logLevel: 'warn',
    clearScreen: false,
    build: {
      ...build,
      outDir,
      emptyOutDir: true,
      // Velikost bundlu tady nikoho nezajímá, varování by jen zašumělo výstup.
      chunkSizeWarningLimit: 2000,
      rollupOptions: input ? { ...rollupOptions, input } : rollupOptions,
    },
  });
}
