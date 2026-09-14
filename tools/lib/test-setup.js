// Společná příprava pro testy: sestavený runner + statický server v rozsahu portů runneru.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildRunner } from './build-runner.js';
import { closeServer, listenInRange } from './listen.js';
import { createStaticApp } from './static-app.js';

/** Rozsah portů; jiný jde nastavit proměnnou AKADEMIE_TEST_PORTS=4400-4449 (souběžné běhy testů). */
export const TEST_PORTS = parsePortRange(process.env.AKADEMIE_TEST_PORTS) ?? { from: 4320, to: 4339 };

function parsePortRange(text) {
  const match = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(String(text ?? ''));
  if (!match) return null;
  const [from, to] = [Number(match[1]), Number(match[2])];
  return from > 0 && to >= from && to < 65536 ? { from, to } : null;
}

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
