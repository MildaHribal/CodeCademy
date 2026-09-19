import fs from 'node:fs';
import path from 'node:path';
import { createDevProcessManager } from '../dev-process.js';

export function registerDevProcess(router, ctx, options = {}) {
  const projectsRoot = path.resolve(ctx.projectsDir);

  function projectDir(project) {
    if (!ctx.isPlainObject(project)) throw new ctx.InputError('"project" musí být objekt { section, module }');
    const { section, module } = project;
    ctx.checkSlugs(section, module);
    if (!ctx.moduleExists(section, module)) throw new ctx.HttpError(404, `Modul ${section}/${module} neexistuje`);
    if (ctx.loadModule(section, module).type !== 'project') {
      throw new ctx.InputError(`Modul ${section}/${module} není projekt`);
    }
    const dir = path.resolve(projectsRoot, `${section}--${module}`);
    if (path.dirname(dir) !== projectsRoot) throw new ctx.InputError('Neplatná cesta projektu');
    if (!fs.existsSync(dir)) {
      throw new ctx.HttpError(409, 'Projekt ještě nezačal — nejdřív klikni na „Začít projekt"');
    }
    return fs.realpathSync(dir);
  }

  const manager = createDevProcessManager({ ...options, projectDir });
  ctx.onClose(() => manager.close());

  router.get('/api/dev-process', () => ({ process: manager.process() }));

  router.post('/api/dev-process/start', async ({ readBody }) => {
    const body = await readBody();
    return { ok: true, process: await manager.start(body) };
  });

  router.post('/api/dev-process/stop', async ({ readBody }) => {
    await readBody();
    return { ok: true, stopped: await manager.stop() };
  });

  router.post('/api/dev-process/request', async ({ readBody }) => manager.request(await readBody()));

  router.get('/api/dev-process/output', ({ query }) => {
    const raw = query.get('since');
    const since = raw === null || raw === '' ? 0 : Number(raw);
    if (!Number.isInteger(since) || since < 0) throw new ctx.InputError('"since" musí být celé číslo ≥ 0');
    return manager.output(since);
  });

  return manager;
}

export function register(router, ctx) {
  registerDevProcess(router, ctx);
}
