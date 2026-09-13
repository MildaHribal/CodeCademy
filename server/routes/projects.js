// Projekty ve VS Code: založení složky, soubory a kontrola (kontrakt kap. 9).
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { HttpError } from '../errors.js';
import { runNodeTests } from '../node-runner.js';

export function register(router, ctx) {
  const projectsRoot = path.resolve(ctx.projectsDir);

  /** Načte modul typu projekt, jinak vyhodí 404/400. */
  function loadProject(section, module) {
    ctx.checkSlugs(section, module);
    if (!ctx.moduleExists(section, module)) throw new HttpError(404, `Modul ${section}/${module} neexistuje`);
    const data = ctx.loadModule(section, module);
    if (data.type !== 'project') throw new HttpError(400, `Modul ${section}/${module} není projekt`);
    return data;
  }

  function projectDir(section, module) {
    const dir = path.resolve(projectsRoot, `${section}--${module}`);
    // Slugy cestu ven z adresáře nepustí, ale kontrola navíc nic nestojí.
    if (path.dirname(dir) !== projectsRoot) throw new HttpError(400, 'Neplatná cesta projektu');
    return dir;
  }

  router.post('/api/project/:section/:module/start', async ({ params: { section, module } }) => {
    loadProject(section, module);
    const dir = projectDir(section, module);
    const isEmpty = !fs.existsSync(dir) || fs.readdirSync(dir).length === 0;
    if (!isEmpty) return { dir, created: false };
    const starter = path.join(ctx.contentDir, section, module, 'starter');
    await fsp.mkdir(dir, { recursive: true });
    if (fs.existsSync(starter)) await fsp.cp(starter, dir, { recursive: true, force: false, errorOnExist: false });
    return { dir, created: true };
  });

  router.get('/api/project/:section/:module/files', ({ params: { section, module } }) => {
    loadProject(section, module);
    const dir = projectDir(section, module);
    const exists = fs.existsSync(dir);
    return { dir, exists, files: exists ? ctx.readTextTree(dir) : [] };
  });

  router.post('/api/project/:section/:module/check', async (request) => {
    const { section, module } = request.params;
    const { project } = loadProject(section, module);
    if (project.runtime !== 'node') {
      throw new HttpError(400, `Projekt s runtime ${project.runtime} se kontroluje v prohlížeči nad soubory z …/files`);
    }
    const dir = projectDir(section, module);
    if (!fs.existsSync(dir)) throw new HttpError(409, 'Projekt ještě nezačal — nejdřív klikni na „Začít projekt"');
    const timeoutMs = typeof project.meta?.timeoutMs === 'number' ? project.meta.timeoutMs : 10000;
    const { signal } = request;
    return ctx.limitRuns(() => runNodeTests({ hints: project.hints, timeoutMs, cwd: dir, signal }));
  });
}
