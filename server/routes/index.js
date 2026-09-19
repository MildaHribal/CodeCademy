import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function routeFileNames(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.js') && name !== 'index.js' && !name.endsWith('.test.js') && !name.startsWith('_'))
    .sort();
}

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

export function registerRouteModules(router, modules, ctx) {
  for (const { name, register } of modules) {
    register(router.forSource(name), ctx);
  }
}

export const routeModules = await loadRouteModules();
