// UI nástroje dev-process v prohlížeči: Spustit u kroku se serverem, HTTP klient,
// zastavení při odchodu z obrazovky a spuštění projektu. Obsah: tools/fixtures/dev-process-content.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server/app.js';
import { buildClient } from './lib/build-runner.js';
import { closeServer, listenInRange } from './lib/listen.js';
import { BROWSER_ARGS } from './lib/runner-pool.js';

const CONTENT_DIR = path.join(import.meta.dirname, 'fixtures', 'dev-process-content');
const WORK_PREFIX = 'akademie-ui-dev-process-';

function pgrep(pattern) {
  try {
    return execFileSync('pgrep', ['-f', pattern], { encoding: 'utf8' }).trim();
  } catch {
    return ''; // nic nenalezeno
  }
}

describe('rozhraní nástroje dev-process', () => {
  let workDir;
  let server;
  let browser;
  let baseUrl;

  before(async () => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), WORK_PREFIX));
    const distDir = path.join(workDir, 'dist');
    await buildClient(distDir);
    server = createApp({
      contentDir: CONTENT_DIR,
      dataDir: path.join(workDir, 'data'),
      projectsDir: path.join(workDir, 'moje-projekty'),
      distDir,
    });
    baseUrl = `http://127.0.0.1:${await listenInRange(server, { from: 4480, to: 4499 })}`;
    browser = await chromium.launch({ args: BROWSER_ARGS });
  });

  after(async () => {
    await browser?.close();
    if (server) await closeServer(server);
    fs.rmSync(workDir, { recursive: true, force: true });
    // Po testech nesmí zůstat žádný proces spuštěný přes dev-process.
    assert.equal(pgrep(WORK_PREFIX), '', 'proces projektu po testech běží dál');
  });

  async function openPage(hash) {
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.errors = errors;
    await page.goto(`${baseUrl}/${hash}`);
    return page;
  }

  async function currentProcess() {
    const res = await fetch(`${baseUrl}/api/dev-process`);
    return (await res.json()).process;
  }

  async function waitForProcess(predicate, timeoutMs = 5000) {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const proc = await currentProcess();
      if (predicate(proc)) return proc;
      if (Date.now() > deadline) throw new Error(`Proces nedošel do očekávaného stavu: ${JSON.stringify(proc)}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /** Přepíše obsah souboru v editoru pracovní plochy. */
  async function typeFile(page, name, content) {
    await page.locator('.editor__tab', { hasText: name }).click();
    await page.locator('.pane--editor .cm-content').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(content);
  }

  test('krok se serverem: Spustit, HTTP klient GET a POST, změna kódu, Zastavit', async () => {
    const page = await openPage('#/modul/dev/workshop-server/002');
    try {
      const output = page.locator('.output--node');
      const status = output.locator('.dev-status');
      const http = output.locator('.dev-http');
      await http.locator('.dev-http__idle').waitFor();
      assert.equal(await http.locator('.dev-http__send').isDisabled(), true, 'bez běžícího serveru nejde nic poslat');

      await output.getByRole('button', { name: /Run|Spustit/ }).click();
      await status.and(page.locator('[data-tone="running"]')).waitFor({ timeout: 10000 });
      assert.match(await status.textContent(), /Poslouchá na http:\/\/127\.0\.0\.1:\d+/);
      const url = await status.locator('a').getAttribute('href');
      assert.equal(url, (await currentProcess()).url);
      await output.locator('.console__entry', { hasText: 'Knihovna běží' }).waitFor();
      await output.getByRole('button', { name: /Run again|Spustit znovu/ }).waitFor();

      // GET
      await http.locator('.dev-http__path').fill('/books');
      await http.getByRole('button', { name: /Send|Odeslat/ }).click();
      const result = http.locator('.dev-http__status');
      await result.and(page.locator('[data-tone="ok"]')).waitFor();
      assert.match(await result.textContent(), /200 OK/);
      assert.match(await http.locator('.dev-http__response').textContent(), /"title": "Babička"/);
      await http.locator('.dev-http__headers summary').click();
      assert.match(await http.locator('.dev-http__headers').textContent(), /x-pocet\s*1/);

      // POST s tělem, odeslání Ctrl+Enter z pole těla (nesmí spustit kontrolu kroku)
      await http.locator('.dev-http__method').selectOption('POST');
      await http.locator('.dev-http__extra > summary').click();
      await http.locator('textarea').nth(1).fill('{"title":"Krakatit"}');
      await http.locator('textarea').nth(1).press('Control+Enter');
      await result.and(page.locator('[data-tone="ok"]')).filter({ hasText: '201' }).waitFor();
      assert.match(await http.locator('.dev-http__notes').textContent(), /Doplněná hlavička Content-Type: application\/json/);
      assert.match(await http.locator('.dev-http__response').textContent(), /"type": "application\/json"/);
      assert.equal(await page.locator('.pane--brief .result[data-kind]').count(), 0, 'Ctrl+Enter v HTTP klientovi nespustil kontrolu');

      // 404 z neplatné cesty ve formuláři se ani neodešle
      await http.locator('.dev-http__path').fill('books');
      await http.getByRole('button', { name: /Send|Odeslat/ }).click();
      await http.locator('.dev-http__problems', { hasText: 'lomítkem' }).waitFor();

      // Změna kódu připomene, že server běží se starou verzí.
      await typeFile(page, 'server.js', 'console.log("jiný kód")');
      await status.locator('.dev-status__note', { hasText: 'Kód se od spuštění změnil' }).waitFor();

      await output.getByRole('button', { name: /Stop|Zastavit/ }).click();
      await status.filter({ hasText: 'Proces neběží' }).waitFor();
      await output.locator('.console__entry', { hasText: 'Proces zastaven.' }).waitFor();
      assert.equal((await currentProcess()).status, 'exited');
      assert.equal(await http.locator('.dev-http__send').isDisabled(), true);
      assert.deepEqual(page.errors, []);
    } finally {
      await page.close();
    }
  });

  test('odchod na jiný krok zastaví server; skript doběhne s výstupem a kódem', async () => {
    const page = await openPage('#/modul/dev/workshop-server/002');
    try {
      const output = page.locator('.output--node');
      await output.getByRole('button', { name: /Run|Spustit/ }).click();
      await output.locator('.dev-status[data-tone="running"]').waitFor({ timeout: 10000 });
      const running = await currentProcess();
      assert.equal(running.status, 'running');

      await page.locator('.stepper__item').nth(0).click();
      await page.waitForURL(/workshop-server\/001$/);
      const stopped = await waitForProcess((proc) => proc?.id === running.id && proc.status === 'exited');
      assert.equal(stopped.id, running.id);

      await page.locator('.output--node').getByRole('button', { name: /Run|Spustit/ }).click();
      const console = page.locator('.output--node .console');
      await console.locator('.console__entry', { hasText: 'Proces skončil s kódem 0.' }).waitFor({ timeout: 10000 });
      await console.locator('.console__entry--log', { hasText: 'Ahoj z kroku' }).waitFor();
      await console.locator('.console__entry--error', { hasText: 'Tohle je stderr' }).waitFor();
      assert.doesNotMatch(await console.textContent(), /nekonečná smyčka/);
      assert.equal(await page.locator('.output--node .dev-status').textContent(), 'Proces skončil s kódem 0.');
    } finally {
      await page.close();
    }
  });

  test('opuštění stránky (pagehide) zastaví běžící server přes keepalive', async () => {
    const page = await openPage('#/modul/dev/workshop-server/002');
    try {
      await page.locator('.output--node').getByRole('button', { name: /Run|Spustit/ }).click();
      await page.locator('.output--node .dev-status[data-tone="running"]').waitFor({ timeout: 10000 });
      const running = await currentProcess();
      await page.goto('about:blank');
      await waitForProcess((proc) => proc.id === running.id && proc.status === 'exited');
    } finally {
      await page.close();
    }
  });

  test('projekt: 409 před založením, spuštění z moje-projekty, HTTP klient, stop při odchodu', async () => {
    const page = await openPage('#/modul/dev/projekt-server');
    try {
      const panel = page.locator('.dev-project');
      await panel.waitFor();
      await panel.getByRole('button', { name: /Run server|Spustit server/ }).click();
      await panel.locator('.result__warning', { hasText: 'Nejdřív projekt založ' }).waitFor();

      await page.getByRole('button', { name: /Start project|Začít projekt/ }).click();
      await page.locator('.project__created').waitFor();
      await panel.getByRole('button', { name: /Run server|Spustit server/ }).click();
      await panel.locator('.dev-status[data-tone="running"]').waitFor({ timeout: 10000 });
      await panel.locator('.console__entry', { hasText: 'Projekt běží' }).waitFor();
      assert.equal(await panel.locator('.result__warning').isHidden(), true);
      const running = await currentProcess();
      assert.equal(running.main, 'app.js', 'hlavní soubor podle scripts.start v package.json');

      const http = panel.locator('.dev-http');
      await http.getByRole('button', { name: /Send|Odeslat/ }).click();
      await http.locator('.dev-http__status[data-tone="ok"]').waitFor();
      assert.equal(await http.locator('.dev-http__response').textContent(), 'Ahoj z projektu');

      await page.evaluate(() => { location.hash = '#/'; });
      await waitForProcess((proc) => proc.id === running.id && proc.status === 'exited');
      assert.deepEqual(page.errors, []);
    } finally {
      await page.close();
    }
  });
});
