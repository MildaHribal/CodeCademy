// Stránka sekce a pojmy celého kurzu (kontrakt kap. 2.7 a 7):
//   GET /api/section/:section  → loadSection (výstupy, tahák, pojmy, karty); 404, když sekce není na disku
//   GET /api/terms             → loadTerms (pojmy všech dostupných sekcí v pořadí osnovy)
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
