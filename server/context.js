// Kontext, který dostane každý soubor rout (server/routes/*.js) v register(router, ctx).
//
// Jediné místo, kde se skládají sdílené služby serveru: cesty, postup, úložiště,
// načítání obsahu, pomocníci na těla a chyby a registry pro reset a úklid.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildContentIndex, loadCurriculum, loadModule, loadSectionExtras, readTextTree, resolveContentItem,
} from '../shared/content.js';
import { HttpError, InputError } from './errors.js';
import { abortOnDisconnect, clampTimeout, createLimiter, readJsonBody, sendJson } from './http.js';
import { createProgressStore } from './progress.js';
import { createJsonStore } from './store.js';
import { checkId, checkSlugs, isPlainObject, SLUG } from './validate.js';

/**
 * @param {{ contentDir: string, dataDir: string, projectsDir: string, distDir: string }} dirs
 */
export function createContext({ contentDir, dataDir, projectsDir, distDir }) {
  const resetters = [];
  const closers = [];
  const listeners = new Map();
  const dataRoot = path.resolve(dataDir);

  /** Cesta uvnitř data/ (relativní jméno jako 'opakovani.json' nebo 'poznamky/css-flexbox.md'). */
  function dataPath(name) {
    const target = path.resolve(dataRoot, name);
    if (!target.startsWith(dataRoot + path.sep)) throw new Error(`Soubor ${name} musí ležet v adresáři data/`);
    return target;
  }

  const ctx = {
    contentDir,
    dataDir,
    projectsDir,
    distDir,

    // ——— Úložiště ———

    /** Postup uživatele (server/progress.js) — sdílený všemi routami. */
    progress: createProgressStore(dataDir),

    /**
     * JSON úložiště v data/ (server/store.js). Jméno je relativní k data/, např. 'opakovani.json'.
     * Pozor: úložiště vytvářej v register(), ne při každém požadavku.
     */
    createJsonStore: (name, options) => createJsonStore(dataPath(name), options),
    dataPath,

    // ——— Obsah kurzu ———

    loadCurriculum: () => loadCurriculum(contentDir),
    /** Detail modulu; bez `includeSolutions: true` bez řešení. */
    loadModule: (sectionId, moduleId, { includeSolutions = false } = {}) =>
      loadModule(contentDir, sectionId, moduleId, { includeSolutions }),
    moduleExists: (sectionId, moduleId) =>
      SLUG.test(sectionId) && SLUG.test(moduleId) && fs.existsSync(path.join(contentDir, sectionId, moduleId, 'module.json')),
    /** Index obsahu s mezipamětí podle mtime (shared/content.js). */
    contentIndex: () => buildContentIndex(contentDir),
    /** cards.md, pojmy.md, tahak.md sekce jako surový text (nebo null). */
    loadSectionExtras: (sectionId) => loadSectionExtras(contentDir, sectionId),
    /**
     * Obsah položky opakování nebo pokusů podle id (q:, card:, step:, explain:, kontrakt kap. 2.10):
     * { id, type, source, content } nebo null, když v obsahu není. Rozbitý obsah vyhodí ParseError —
     * volající pak položku nesmí smazat jako osiřelou.
     */
    resolveItem: (id) => resolveContentItem(contentDir, id),
    readTextTree,

    // ——— Požadavky, odpovědi, chyby ———

    readJsonBody,
    sendJson,
    abortOnDisconnect,
    clampTimeout,
    HttpError,
    InputError,
    checkId,
    checkSlugs,
    isPlainObject,
    /** Omezí počet současně běžících node procesů (sdílené všemi routami, které spouští kód). */
    limitRuns: createLimiter(Math.max(2, Math.floor(os.availableParallelism() / 2))),

    // ——— Registry ———

    /**
     * Přidá „resetter": zavolá se při POST /api/progress/reset s id (sekce, modul nebo krok),
     * aby nástroj smazal i svá data pro id a vše pod ním (viz belongsTo v server/progress.js).
     */
    onReset(fn) {
      resetters.push(fn);
    },
    async runResetters(id) {
      for (const fn of resetters) await fn(id);
    },

    /**
     * Události mezi nástroji na serveru (nástroj nesahá do cizího souboru ani ho neimportuje):
     *   ctx.on('attempts:recorded', async (payload) => { … })   → vrací funkci na odhlášení
     *   await ctx.emit('attempts:recorded', payload)             → zavolá posluchače postupně
     * Chyba posluchače se vypíše do konzole a nezastaví ostatní ani požadavek.
     * Jména událostí a payloady popisuje docs/platforma.md, kap. 1.5.
     */
    on(name, fn) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(fn);
      return () => {
        const list = listeners.get(name) ?? [];
        const index = list.indexOf(fn);
        if (index !== -1) list.splice(index, 1);
      };
    },
    async emit(name, payload) {
      for (const fn of [...(listeners.get(name) ?? [])]) {
        try {
          await fn(payload);
        } catch (error) {
          console.error(`Posluchač události ${name} selhal`, error);
        }
      }
    },

    /** Úklid při zavření serveru (běžící procesy, časovače). */
    onClose(fn) {
      closers.push(fn);
    },
    async runClosers() {
      for (const fn of closers.splice(0).reverse()) {
        try {
          await fn();
        } catch (error) {
          console.error('Úklid serveru selhal', error);
        }
      }
    },
  };
  return ctx;
}
