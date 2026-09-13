// Společná příprava pro testy: sestavený runner + statický server v rozsahu portů runneru.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildRunner } from './build-runner.js';
import { closeServer, listenInRange } from './listen.js';
import { createStaticApp } from './static-app.js';

export const TEST_PORTS = { from: 4320, to: 4339 };

/**
 * @param {{ api?: Function }} options  obsluha /api/* pro statický server
 * @returns {Promise<{ distDir: string, baseUrl: string, close(): Promise<void> }>}
 */
export async function startRunnerServer({ api } = {}) {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-runner-test-'));
  const distDir = path.join(workDir, 'dist');
  let server = null;
  try {
    await buildRunner(distDir);
    server = createStaticApp({ distDir, api });
    const port = await listenInRange(server, TEST_PORTS);
    return {
      distDir,
      baseUrl: `http://127.0.0.1:${port}`,
      async close() {
        await closeServer(server);
        fs.rmSync(workDir, { recursive: true, force: true });
      },
    };
  } catch (error) {
    if (server) await closeServer(server);
    fs.rmSync(workDir, { recursive: true, force: true });
    throw error;
  }
}
