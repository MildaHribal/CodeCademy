// Postup uživatele (kontrakt kap. 8). Reset maže i data nástrojů přes ctx.onReset.
export function register(router, ctx) {
  const { progress } = ctx;

  router.get('/api/progress', () => progress.get());

  router.put('/api/progress/code', async ({ readBody }) => {
    const { id, files } = await readBody();
    progress.saveCode(id, files);
    return { ok: true };
  });

  router.post('/api/progress/complete', async ({ readBody }) => {
    const { id, score } = await readBody();
    return { ok: true, progress: progress.complete(id, score) };
  });

  router.post('/api/progress/reset', async ({ readBody }) => {
    const { id } = await readBody();
    const reset = progress.reset(id); // ověří id dřív, než na data sáhnou ostatní nástroje
    await ctx.runResetters(id);
    return { ok: true, progress: reset };
  });
}
