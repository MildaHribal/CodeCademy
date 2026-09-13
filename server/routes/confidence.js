// Jistota odpovědí (kontrakt kap. 12.4): /api/confidence, /api/confidence/:section.
//
// Přičítá se jen odpověď, u které uživatel zvolil „Jsem si jistý" nebo „Tipuju":
// - z první i každé další odpovědi na otázku (událost attempts:recorded, id q:…),
// - z odpovědi v opakování (událost reviews:answered).
// Reset postupu jistotu nemaže.
import { FILE_NAME, addAnswer, emptyConfidence, migrateConfidence, sectionConfidence, sectionOfItem } from './_confidence-store.js';

export function register(router, ctx) {
  const store = ctx.createJsonStore(FILE_NAME, { defaults: emptyConfidence, migrate: migrateConfidence });

  const record = ({ sectionId, ok, confidence }) => {
    if (!sectionId || !confidence) return;
    store.update((data) => {
      addAnswer(data, { sectionId, ok, confidence });
    });
  };

  ctx.on('attempts:recorded', ({ id, body } = {}) => {
    if (typeof id !== 'string' || !id.startsWith('q:')) return;
    record({ sectionId: sectionOfItem(id), ok: body?.ok, confidence: body?.confidence });
  });

  ctx.on('reviews:answered', ({ id, ok, confidence } = {}) => {
    record({ sectionId: sectionOfItem(id), ok, confidence });
  });

  router.get('/api/confidence', () => store.get());

  router.get('/api/confidence/:section', ({ params }) => {
    ctx.checkSlugs(params.section);
    return sectionConfidence(store.get(), params.section);
  });
}
