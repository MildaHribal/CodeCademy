// Předsestavení knihoven pro prohlížečové runtime (kontrakt kap. 6.10 a 6.11).
//
//   node tools/build-vendor.js           sestaví, když balíčky chybí nebo jsou zastaralé
//   node tools/build-vendor.js --force   sestaví vždycky
//
// Balíčky z BUNDLED_MODULES (React, React Router, Motion…) nejsou v node_modules jako
// ES moduly, které by šly v prohlížeči načíst přímo (CommonJS, holé importy závislostí).
// Proto se sestaví jedním buildem Vite (rolldown) do node_modules/.cache/akademie-vendor/bundle:
// každý specifikátor je vstup, sdílené části jsou v chunk-*.js — React je tak v celé
// stránce jediná instance. Knihovny, které už jsou čisté ES moduly (gsap, three, lenis,
// Tailwind), se vydávají přímo z node_modules a nesestavují se.
//
// Sestavení je bezpečné i při souběžném spuštění (start.sh, verify, testy): staví se
// do dočasného adresáře pod zámkem a hotový výsledek se přesune na místo najednou.
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUNDLED_MODULES, bundleFileName } from '../client/src/runner/vendor-libs.js';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NODE_MODULES = path.join(PROJECT_ROOT, 'node_modules');
export const VENDOR_DIR = path.join(NODE_MODULES, '.cache', 'akademie-vendor');
const STAMP_FILE = 'stamp.json';
const LOCK_FILE = path.join(NODE_MODULES, '.cache', 'akademie-vendor.lock');
// Zvyš, když se změní způsob sestavení (obalové moduly, nastavení buildu).
const BUILD_VERSION = 3;
const LOCK_STALE_MS = 3 * 60_000;
const require = createRequire(path.join(PROJECT_ROOT, 'package.json'));

/** Jméno balíčku ze specifikátoru: `react-dom/client` → `react-dom`, `@tanstack/react-query` → celé. */
function packageName(specifier) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** Podpis vstupů: verze balíčků + seznam modulů + verze sestavení. Změní se po `npm install`. */
export function vendorSignature() {
  const packages = [...new Set(Object.keys(BUNDLED_MODULES).map(packageName))].sort();
  const versions = {};
  for (const name of packages) {
    try {
      versions[name] = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, name, 'package.json'), 'utf8')).version;
    } catch {
      versions[name] = null;
    }
  }
  const text = JSON.stringify({ BUILD_VERSION, modules: BUNDLED_MODULES, versions });
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/** Jsou balíčky sestavené a aktuální? */
export function isVendorFresh(dir = VENDOR_DIR) {
  try {
    const stamp = JSON.parse(fs.readFileSync(path.join(dir, STAMP_FILE), 'utf8'));
    if (stamp.signature !== vendorSignature()) return false;
    return Object.keys(BUNDLED_MODULES).every((specifier) => fs.existsSync(path.join(dir, 'bundle', bundleFileName(specifier))));
  } catch {
    return false;
  }
}

/** Obalový modul pro jeden specifikátor: znovu vyexportuje všechno, co balíček nabízí. */
async function wrapperSource(specifier, { cjs }) {
  const quoted = JSON.stringify(specifier);
  if (cjs) {
    // CommonJS: pojmenované exporty nejdou staticky zjistit, vypíšeme je podle skutečného modulu.
    const names = Object.keys(require(specifier)).filter((name) => name !== 'default' && /^[A-Za-z_$][\w$]*$/.test(name));
    return `import m from ${quoted};\nexport default m;\nexport const { ${names.join(', ')} } = m;\n`;
  }
  // Import podmínkou "import" (ESM varianta balíčku), jako ho uvidí build.
  const namespace = await import(specifier).catch(() => null);
  const hasDefault = namespace ? 'default' in namespace : false;
  return `export * from ${quoted};\n${hasDefault ? `export { default } from ${quoted};\n` : ''}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

/** Zámek přes soubor vytvořený s `wx`. Opuštěný zámek (proces neběží, nebo je moc starý) se převezme. */
async function withLock(fn, { waitMs = 5 * 60_000 } = {}) {
  fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true });
  const deadline = Date.now() + waitMs;
  for (;;) {
    try {
      fs.writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, at: Date.now() }), { flag: 'wx' });
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let holder = null;
      try {
        holder = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
      } catch {
        // Zámek se právě zapisuje nebo maže.
      }
      const stale = holder && (!processAlive(holder.pid) || Date.now() - holder.at > LOCK_STALE_MS);
      if (stale) fs.rmSync(LOCK_FILE, { force: true });
      else if (Date.now() > deadline) throw new Error('Sestavení knihoven čeká na zámek příliš dlouho');
      else await sleep(200);
    }
  }
  try {
    return await fn();
  } finally {
    fs.rmSync(LOCK_FILE, { force: true });
  }
}

async function build({ log }) {
  const staging = `${VENDOR_DIR}.tmp-${process.pid}-${Date.now().toString(36)}`;
  const entriesDir = path.join(staging, 'entries');
  const outDir = path.join(staging, 'out');
  fs.mkdirSync(entriesDir, { recursive: true });
  try {
    const entry = {};
    for (const [specifier, options] of Object.entries(BUNDLED_MODULES)) {
      const name = bundleFileName(specifier).replace(/\.js$/, '');
      const file = path.join(entriesDir, `${name}.js`);
      fs.writeFileSync(file, await wrapperSource(specifier, options));
      entry[name] = file;
    }

    const vite = await import('vite');
    await vite.build({
      configFile: false,
      root: PROJECT_ROOT,
      logLevel: 'warn',
      clearScreen: false,
      // Vývojové sestavení Reactu: srozumitelnější chyby a varování (chybějící key…).
      define: { 'process.env.NODE_ENV': JSON.stringify('development'), 'process.env': '{}' },
      publicDir: false,
      build: {
        outDir,
        emptyOutDir: true,
        minify: false,
        sourcemap: false,
        target: 'esnext',
        copyPublicDir: false,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 100_000,
        lib: { entry, formats: ['es'], fileName: (_format, name) => `${name}.js` },
        rollupOptions: {
          output: { chunkFileNames: 'chunk-[hash].js' },
        },
      },
    });

    const bundleDir = path.join(staging, 'bundle');
    fs.renameSync(outDir, bundleDir);
    fs.rmSync(entriesDir, { recursive: true, force: true });
    fs.writeFileSync(path.join(staging, STAMP_FILE), JSON.stringify({ signature: vendorSignature(), builtAt: new Date().toISOString() }, null, 2));

    // Výměna: starý adresář stranou, nový na místo, starý smazat.
    const old = `${VENDOR_DIR}.old-${process.pid}-${Date.now().toString(36)}`;
    if (fs.existsSync(VENDOR_DIR)) fs.renameSync(VENDOR_DIR, old);
    fs.renameSync(staging, VENDOR_DIR);
    fs.rmSync(old, { recursive: true, force: true });
    log(`Knihovny pro runner sestavené (${Object.keys(entry).length} modulů) → ${path.relative(PROJECT_ROOT, VENDOR_DIR)}`);
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

let pending = null;

/**
 * Zajistí aktuální sestavení knihoven. Souběžná volání v jednom procesu sdílejí jeden build,
 * mezi procesy je hlídá zámek.
 * @param {{ force?: boolean, log?: (text: string) => void }} options
 * @returns {Promise<string>} adresář se sestavením
 */
export function ensureVendor({ force = false, log = () => {} } = {}) {
  if (!force && isVendorFresh()) return Promise.resolve(VENDOR_DIR);
  pending ??= withLock(async () => {
    if (force || !isVendorFresh()) await build({ log });
    return VENDOR_DIR;
  }).finally(() => {
    pending = null;
  });
  return pending;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const force = process.argv.includes('--force');
  const started = Date.now();
  ensureVendor({ force, log: (text) => console.log(`${text} za ${((Date.now() - started) / 1000).toFixed(1)} s`) })
    .catch((error) => {
      console.error(`Sestavení knihoven selhalo: ${error.stack ?? error.message}`);
      process.exitCode = 1;
    });
}
