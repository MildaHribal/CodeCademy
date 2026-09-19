import { HttpError } from '../errors.js';

export function register(router, ctx) {
  router.get('/api/curriculum', () => ctx.loadCurriculum());

  router.get('/api/module/:section/:module', ({ params, query }) => {
    const { section, module } = params;
    ctx.checkSlugs(section, module);
    if (!ctx.moduleExists(section, module)) throw new HttpError(404, `Modul ${section}/${module} neexistuje`);
    return ctx.loadModule(section, module, { includeSolutions: query.get('solution') === '1' });
  });
}
