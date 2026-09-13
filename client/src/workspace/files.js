// Soubory pracovní plochy: výchozí stav editoru a hlavní soubor pro Spustit.

import { progress } from '../progress.js';

const JS_FILE = /\.(m?js|cjs)$/;
const COMMON_MAIN_FILES = ['index.js', 'server.js', 'main.js', 'app.js'];

/**
 * Soubor, který spustí tlačítko Spustit (runtime node). Pořadí:
 * `main` ve frontmatteru kroku → `main` nebo `scripts.start` („node soubor.js“) v package.json
 * → obvyklá jména (index.js, server.js, main.js, app.js) → první .js soubor.
 */
export function findMainFile(files, meta = {}) {
  const byName = (name) => (name ? files.find((f) => f.name === String(name).replace(/^\.\//, '')) : undefined);
  const fromMeta = byName(meta?.main);
  if (fromMeta) return fromMeta;

  const packageFile = byName('package.json');
  if (packageFile) {
    try {
      const pkg = JSON.parse(packageFile.content);
      const startScript = typeof pkg.scripts?.start === 'string' ? pkg.scripts.start.match(/^node\s+(\S+)/) : null;
      const fromPackage = byName(startScript?.[1]) ?? byName(pkg.main);
      if (fromPackage) return fromPackage;
    } catch {
      // rozepsaný package.json — pokračujeme obvyklými jmény
    }
  }

  for (const name of COMMON_MAIN_FILES) {
    const found = byName(name);
    if (found) return found;
  }
  return files.find((f) => JS_FILE.test(f.name));
}

/**
 * Výchozí soubory: seed, přes který se položí rozpracovaný kód uživatele.
 * Zvýrazněná oblast zůstane, pokud se text před ní a za ní nezměnil.
 */
export function initialFiles(item) {
  const saved = progress.savedFiles(item.id);
  if (!saved) return item.seed;
  return item.seed.map((file) => {
    const savedFile = saved.find((s) => s.name === file.name);
    if (!savedFile || savedFile.content === file.content) return file;
    return { ...file, content: savedFile.content, region: carryRegion(file, savedFile.content) };
  });
}

function carryRegion(seedFile, content) {
  const region = seedFile.region;
  if (!region) return null;
  const seedLines = seedFile.content.split('\n');
  const lines = content.split('\n');
  const before = seedLines.slice(0, region.start - 1);
  const after = seedLines.slice(region.end);
  if (lines.length < before.length + after.length) return null;
  const sameBefore = before.every((line, i) => lines[i] === line);
  const sameAfter = after.every((line, i) => lines[lines.length - after.length + i] === line);
  return sameBefore && sameAfter ? { start: region.start, end: lines.length - after.length } : null;
}
