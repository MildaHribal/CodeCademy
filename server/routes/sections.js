import { loadSection, loadTerms } from '../../shared/content.js';
import { HttpError } from '../errors.js';

export function register(router, ctx) {
  router.get('/api/section/:section', ({ params }) => {
    ctx.checkSlugs(params.section);
    const section = loadSection(ctx.contentDir, params.section);
    if (!section) throw new HttpError(404, `Sekce ${params.section} neexistuje`);
    return section;
  });

  router.get('/api/terms', () => loadTerms(ctx.contentDir));
}
