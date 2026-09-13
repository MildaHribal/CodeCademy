// Ověření obsahu Akademie — `npm run overit` (kontrakt kap. 10).
//
//   node tools/verify.js                          celý obsah
//   node tools/verify.js content/css-flexbox      jen sekce (nebo content/<sekce>/<modul>)
//   node tools/verify.js --json                   strojový výstup
//   node tools/verify.js --content-dir <adresář>  jiný adresář s obsahem (např. testovací)
//
// Soběstačné: sestaví runner (Vite) do dočasného adresáře, spustí server (createApp)
// na volném portu a testy pouští ve stejném runneru jako aplikace, přes Playwright.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildRunner, PROJECT_ROOT } from './lib/build-runner.js';
import { planModule } from './lib/content-checks.js';
import { scanContent, toIdPrefixes } from './lib/content-scan.js';
import { closeServer, listen } from './lib/listen.js';
import { formatEntry, formatSummary } from './lib/report.js';
import { openRunnerPool } from './lib/runner-pool.js';

// Úklidy běžících ověření — spustí se i při Ctrl+C.
const activeCleanups = new Set();

/**
 * @param {{ contentDir: string, prefixes?: string[], createApp: Function, distDir?: string|null,
 *   concurrency?: number, onEntry?: (entry) => void, onProgress?: (text: string) => void }} options
 *   distDir: už sestavený klient (jinak se sestaví do dočasného adresáře)
 * @returns {Promise<{ ok: boolean, summary: { modules: number, errors: number, warnings: number }, entries: object[] }>}
 */
export async function runVerify({ contentDir, prefixes = [], createApp, distDir = null, concurrency = 4, onEntry = () => {}, onProgress = () => {} }) {
  const cleanups = [];
  let cleanupPromise = null;
  // Úklid v opačném pořadí, než se věci spouštěly; i při souběžném volání proběhne jednou.
  const cleanup = () => {
    cleanupPromise ??= (async () => {
      while (cleanups.length) {
        try {
          await cleanups.pop()();
        } catch {
          // úklid pokračuje i po chybě
        }
      }
      activeCleanups.delete(cleanup);
    })();
    return cleanupPromise;
  };
  activeCleanups.add(cleanup);

  try {
    const { problems, modules } = scanContent(contentDir, prefixes);
    const entries = [];
    const emit = (entry) => {
      entries.push(entry);
      onEntry(entry);
    };
    for (const problem of problems) emit({ ...problem, notes: [] });

    const planned = modules.map((item) => (item.module ? { ...item, plan: planModule(item.module) } : item));
    const jobCount = planned.reduce((sum, item) => sum + (item.plan?.jobs.length ?? 0), 0);

    let pool = null;
    if (jobCount > 0) {
      const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-verify-'));
      cleanups.push(async () => fs.rmSync(workDir, { recursive: true, force: true }));

      let clientDir = distDir;
      if (!clientDir) {
        onProgress('Sestavuju runner…');
        clientDir = path.join(workDir, 'dist');
        await buildRunner(clientDir);
      }

      const dataDir = path.join(workDir, 'data');
      const projectsDir = path.join(workDir, 'moje-projekty');
      fs.mkdirSync(dataDir, { recursive: true });
      fs.mkdirSync(projectsDir, { recursive: true });
      const server = createApp({ contentDir, dataDir, projectsDir, distDir: clientDir });
      const port = await listen(server, 0);
      cleanups.push(() => closeServer(server));

      onProgress(`Spouštím prohlížeč (${jobCount} běhů testů)…`);
      pool = await openRunnerPool({ baseUrl: `http://127.0.0.1:${port}`, size: Math.max(1, Math.min(concurrency, jobCount)) });
      cleanups.push(() => pool.close());
    }

    // Všechny běhy zařadíme do fronty hned; výsledky vypisujeme v pořadí osnovy.
    const pending = planned.map((item) => ({
      item,
      results: item.plan ? Promise.all(item.plan.jobs.map((request) => pool.run(request))) : Promise.resolve([]),
    }));

    for (const { item, results } of pending) {
      if (item.error) {
        emit({ id: item.id, type: null, errors: [item.error], warnings: [], notes: [] });
        continue;
      }
      const outcome = item.plan.evaluate(await results);
      emit({ id: item.id, type: item.module.type, title: item.module.title, ...outcome });
    }

    const summary = {
      modules: modules.length,
      errors: entries.reduce((sum, entry) => sum + entry.errors.length, 0),
      warnings: entries.reduce((sum, entry) => sum + entry.warnings.length, 0),
    };
    return { ok: summary.errors === 0, summary, entries };
  } finally {
    await cleanup();
  }
}

function parseArgs(argv) {
  const options = { json: false, contentDir: path.join(PROJECT_ROOT, 'content'), paths: [], concurrency: 4, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') options.json = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--content-dir') options.contentDir = path.resolve(argv[++i] ?? '');
    else if (arg.startsWith('--content-dir=')) options.contentDir = path.resolve(arg.slice('--content-dir='.length));
    else if (arg === '--concurrency') options.concurrency = Number(argv[++i]) || 4;
    else if (arg.startsWith('--')) throw new Error(`neznámý přepínač ${arg}`);
    else options.paths.push(arg);
  }
  return options;
}

const HELP = `Ověření obsahu Akademie

Použití: node tools/verify.js [cesty…] [--json] [--content-dir <adresář>] [--concurrency <n>]

  cesty            content/<sekce> nebo content/<sekce>/<modul> (bez cest = celý obsah)
  --json           výsledek jako JSON na standardní výstup
  --content-dir    adresář s obsahem (výchozí content/)
  --concurrency    počet souběžných stránek prohlížeče (výchozí 4)`;

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Chyba: ${error.message}\n\n${HELP}`);
    return 1;
  }
  if (options.help) {
    console.log(HELP);
    return 0;
  }

  let createApp;
  try {
    ({ createApp } = await import(pathToFileURL(path.join(PROJECT_ROOT, 'server', 'app.js')).href));
    if (typeof createApp !== 'function') throw new Error('server/app.js neexportuje createApp');
  } catch (error) {
    console.error(`Nejde načíst server (server/app.js): ${error.message}`);
    return 1;
  }

  const prefixes = toIdPrefixes(options.paths, options.contentDir);
  const progress = (text) => {
    if (!options.json) console.error(text);
  };
  if (!options.json) {
    const scope = prefixes.length ? prefixes.join(', ') : 'celý obsah';
    console.log(`Ověřuju obsah v ${path.relative(process.cwd(), options.contentDir) || '.'} (${scope})\n`);
  }

  try {
    const report = await runVerify({
      contentDir: options.contentDir,
      prefixes,
      createApp,
      concurrency: options.concurrency,
      onProgress: progress,
      onEntry: (entry) => {
        if (!options.json) console.log(formatEntry(entry));
      },
    });
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else console.log(formatSummary(report.summary));
    return report.ok ? 0 : 1;
  } catch (error) {
    console.error(`Ověření selhalo: ${error.stack ?? error.message}`);
    return 1;
  }
}

let exiting = false;

async function runCleanupsAndExit(code) {
  // Signál může přijít víckrát (Ctrl+C, zavírání prohlížeče) — úklid stačí jednou.
  if (exiting) return;
  exiting = true;
  await Promise.all([...activeCleanups].map((cleanup) => cleanup()));
  process.exit(code);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  // Obsluha zůstává zapojená i po prvním signálu, jinak by další signál proces ukončil před úklidem.
  process.on('SIGINT', () => runCleanupsAndExit(130));
  process.on('SIGTERM', () => runCleanupsAndExit(143));
  main().then((code) => {
    process.exitCode = code;
  });
}
