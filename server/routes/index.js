// Automatické načtení rout: každý soubor server/routes/<nástroj>.js exportuje
// `register(router, ctx)` a app.js ho zavolá. Nový nástroj = nový soubor, nic dalšího
// se neupravuje. Přeskakují se: index.js, *.test.js a soubory začínající podtržítkem
// (pomocné moduly, např. _reviews-store.js). Pořadí je abecední podle jména souboru.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function routeFileNames(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.js') && name !== 'index.js' && !name.endsWith('.test.js') && !name.startsWith('_'))
    .sort();
}

/** @returns {Promise<{ name: string, register: Function }[]>} */
export async function loadRouteModules(dir = import.meta.dirname) {
  const modules = [];
  for (const name of routeFileNames(dir)) {
    let imported;
    try {
      imported = await import(pathToFileURL(path.join(dir, name)).href);
    } catch (error) {
      error.message = `Soubor rout server/routes/${name} nejde načíst: ${error.message}`;
      throw error;
    }
    if (typeof imported.register !== 'function') {
      throw new Error(`Soubor rout server/routes/${name} neexportuje funkci register(router, ctx)`);
    }
    modules.push({ name, register: imported.register });
  }
  return modules;
}

/** Zavolá register každého modulu; chyby (třeba duplicitní routa) uvedou jméno souboru. */
export function registerRouteModules(router, modules, ctx) {
  for (const { name, register } of modules) {
    register(router.forSource(name), ctx);
  }
}

export const routeModules = await loadRouteModules();
