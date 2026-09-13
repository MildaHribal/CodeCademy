// Několik stránek runner.html v Playwrightu, mezi které se rozdělují běhy testů.
import { chromium } from 'playwright';

// Každá stránka má vlastní kontext prohlížeče, aby zaseknutý iframe jedné stránky
// nesdílel proces s iframy ostatních.
// --site-per-process: headless Chromium jinak sandboxované iframy nedává do
// samostatného procesu a nekonečná smyčka v testu by zamrazila celou stránku.
export const BROWSER_ARGS = ['--site-per-process'];

/**
 * @param {{ baseUrl: string, size?: number }} options
 * @returns {Promise<{ run(request): Promise<object>, close(): Promise<void> }>}
 */
export async function openRunnerPool({ baseUrl, size = 4 }) {
  // Signály řeší volající (verify po sobě uklidí sám), Playwright by jinak proces ukončil hned.
  const browser = await chromium.launch({ args: BROWSER_ARGS, handleSIGINT: false, handleSIGTERM: false });
  const queue = [];
  let closed = false;

  async function openPage() {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/runner.html`);
    await page.waitForFunction(() => window.akademieRunnerReady === true, null, { timeout: 15000 });
    return { context, page };
  }

  /** Nejdelší rozumná doba běhu požadavku — pojistka pro případ, že se zasekne sama stránka. */
  function budgetFor(request) {
    const perTest = (request.timeoutMs ?? (request.runtime === 'node' ? 10000 : 5000)) + 4000;
    return Math.max(1, request.hints?.length ?? 0) * perTest + 15000;
  }

  async function runOn(worker, request) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('stránka runneru neodpověděla včas')), budgetFor(request));
    });
    try {
      return await Promise.race([worker.page.evaluate((req) => window.akademieRunner.runTests(req), request), timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  async function workerLoop(worker) {
    while (!closed) {
      const job = queue.shift();
      if (!job) {
        await new Promise((resolve) => {
          worker.wake = resolve;
        });
        continue;
      }
      try {
        job.resolve(await runOn(worker, job.request));
      } catch (error) {
        const message = `Runner selhal: ${error.message.split('\n')[0]}`;
        job.resolve({
          ok: false,
          results: (job.request.hints ?? []).map((_, index) => ({ index, pass: false, error: message })),
          logs: [],
          errors: [],
          runnerError: message,
        });
        // Stránku po selhání zahodíme a otevřeme novou.
        await worker.context.close().catch(() => {});
        if (!closed) Object.assign(worker, await openPage());
      }
    }
  }

  const workers = await Promise.all(Array.from({ length: size }, async () => ({ ...(await openPage()), wake: null })));
  for (const worker of workers) workerLoop(worker);

  return {
    run(request) {
      return new Promise((resolve) => {
        queue.push({ request, resolve });
        // Probudíme jednu čekající stránku (když všechny pracují, vezmou si práci samy).
        for (const worker of workers) {
          if (worker.wake) {
            const wake = worker.wake;
            worker.wake = null;
            wake();
            break;
          }
        }
      });
    },
    async close() {
      closed = true;
      for (const worker of workers) worker.wake?.();
      await browser.close().catch(() => {});
    },
  };
}
