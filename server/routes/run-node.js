// Spouštění node testů a programů z pracovní plochy (kontrakt kap. 6.6, 7).
import { HttpError } from '../errors.js';
import { runNodeFile, runNodeTests } from '../node-runner.js';

export function register(router, ctx) {
  router.post('/api/run-node', async (request) => {
    const body = await request.readBody();
    if (body.runtime !== undefined && body.runtime !== 'node') {
      throw new HttpError(400, `Server spouští jen runtime node, ne "${body.runtime}"`);
    }
    const timeoutMs = ctx.clampTimeout(body.timeoutMs, 10000, 60000);
    // `cwd` z požadavku se schválně nepoužívá — z API se běží jen v dočasném adresáři.
    const { signal } = request;
    return ctx.limitRuns(() => runNodeTests({ files: body.files, hints: body.hints, timeoutMs, signal }));
  });

  router.post('/api/run-node-file', async ({ readBody }) => {
    const body = await readBody();
    const timeoutMs = ctx.clampTimeout(body.timeoutMs, 5000, 30000);
    return ctx.limitRuns(() => runNodeFile({ files: body.files, main: body.main, timeoutMs }));
  });
}
