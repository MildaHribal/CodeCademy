// UI testy výsledků česky a lintu v editoru: sestavená aplikace + server nad
// tools/fixtures/errors-cs-content, Playwright s --site-per-process, porty 4420–4439.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server/app.js';
import { buildClient } from './lib/build-runner.js';
import { closeServer, listenInRange } from './lib/listen.js';
import { BROWSER_ARGS } from './lib/runner-pool.js';

const CONTENT_DIR = path.join(import.meta.dirname, 'fixtures', 'errors-cs-content');
const PORTS = { from: 4420, to: 4439 };

describe('výsledky česky a lint v editoru', () => {
  let workDir;
  let server;
  let browser;
  let baseUrl;

  before(async () => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-ui-errors-cs-'));
    const distDir = path.join(workDir, 'dist');
    await buildClient(distDir);
    server = createApp({
      contentDir: CONTENT_DIR,
      dataDir: path.join(workDir, 'data'),
      projectsDir: path.join(workDir, 'moje-projekty'),
      distDir,
    });
    baseUrl = `http://127.0.0.1:${await listenInRange(server, PORTS)}`;
    browser = await chromium.launch({ args: BROWSER_ARGS });
  });

  after(async () => {
    await browser?.close();
    if (server) await closeServer(server);
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  async function openPage(hash) {
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
    // Chyby aplikace (ne uživatelova kódu v iframu náhledu, ten má vlastní adresu).
    const problems = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && message.location().url.startsWith(baseUrl)) problems.push(message.text());
    });
    await page.goto(`${baseUrl}/${hash}`);
    await page.locator('.pane--editor .cm-content').waitFor();
    return { page, problems };
  }

  /** Přepíše obsah souboru v editoru pracovní plochy. */
  async function typeFile(page, name, content) {
    await page.locator('.editor__tab', { hasText: name }).click();
    await page.locator('.pane--editor .cm-content').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(content);
  }

  test('kód, který nejde spustit: podtržení v editoru, souhrn česky a skok na řádek', async () => {
    const { page, problems } = await openPage('#/modul/chyby/workshop-js/001');
    try {
      await typeFile(page, 'script.js', 'function sum(items) {\n  return [1, 2;\n}\n\nconst x = 1;');
      const underline = page.locator('.pane--editor .cm-lintRange-error');
      await underline.waitFor({ timeout: 10000 });
      assert.equal(await underline.first().textContent(), ';');

      await page.keyboard.press('Control+Enter');
      const result = page.locator('.pane--brief .result[data-kind="fail"]');
      await result.waitFor({ timeout: 15000 });
      assert.match(await result.textContent(), /Kód nejde spustit\./);
      assert.match(await result.textContent(), /Na tomhle místě kódu je znak, který tam nedává smysl\./);
      assert.equal(await page.locator('.hint__note', { hasText: 'Neověřeno — kód nejde spustit.' }).count(), 3);

      // Kurzor jinam, pak skok na řádek s chybou.
      await page.locator('.pane--editor .cm-line', { hasText: 'const x = 1;' }).click();
      await result.getByRole('button', { name: /Skočit na řádek 2/ }).click();
      const activeLine = await page.locator('.pane--editor .cm-activeLine').textContent();
      assert.equal(activeLine.trim(), 'return [1, 2;');
      assert.deepEqual(problems, []);
    } finally {
      await page.close();
    }
  });

  test('nesplněný požadavek: Očekávám / Tvůj kód vrátil, rozdíl u deepEqual a vysvětlení chyby', async () => {
    const { page, problems } = await openPage('#/modul/chyby/workshop-js/001');
    try {
      await typeFile(page, 'script.js', 'function sum(items) {\n  return items.length;\n}\n\nfunction stats(items) {\n  return { sum: 4, average: 3 };\n}');
      await page.keyboard.press('Control+Enter');
      await page.locator('.pane--brief .result[data-kind="fail"]').waitFor({ timeout: 15000 });

      const hints = page.locator('.pane--brief .hint');
      const first = hints.nth(0).locator('details.test-failure');
      assert.equal(await first.getAttribute('open'), '', 'první selhaný požadavek je rozbalený');
      assert.deepEqual(await first.locator('.test-values dt').allTextContents(), ['Očekávám', 'Tvůj kód vrátil']);
      assert.deepEqual(await first.locator('.test-values dd').allTextContents(), ['3', '2']);
      assert.equal(await first.locator('mark').count(), 2);
      assert.match(await first.locator('.test-failure__message').textContent(), /sum\(\[1, 2\]\) má vrátit 3/);

      const second = hints.nth(1).locator('details.test-failure');
      assert.equal(await second.getAttribute('open'), null);
      await second.locator('summary').click();
      assert.match(await second.locator('.error-explain__title').textContent(), /Používáš jméno „average“, které v tomhle místě neexistuje\./);
      assert.match(await second.locator('.error-explain__original').textContent(), /ReferenceError: average is not defined/);

      const third = hints.nth(2).locator('details.test-failure');
      await third.locator('summary').click();
      assert.deepEqual(await third.locator('.test-values--diff tbody th').allTextContents(), ['average']);
      assert.deepEqual(await third.locator('.test-values--diff tbody td').allTextContents(), ['2', '3']);
      assert.deepEqual(problems, []);
    } finally {
      await page.close();
    }
  });

  test('CSS: neplatná deklarace s návrhem, neaktivní deklarace a chyba za běhu z náhledu', async () => {
    const { page, problems } = await openPage('#/modul/chyby/workshop-dom/001');
    try {
      await typeFile(page, 'styles.css', '.row {\n  gap: 24;\n  justify-content: center;\n}');
      const warning = page.locator('.pane--editor .cm-lintRange-warning');
      const info = page.locator('.pane--editor .cm-lintRange-info');
      await warning.waitFor({ timeout: 10000 });
      await info.waitFor({ timeout: 10000 });
      assert.equal(await warning.first().textContent(), 'gap: 24');
      assert.equal(await info.first().textContent(), 'justify-content: center');

      await warning.first().hover();
      const tooltip = page.locator('.cm-tooltip-lint');
      await tooltip.waitFor({ timeout: 5000 });
      assert.match(await tooltip.textContent(), /Chybí jednotka\? Třeba 24px nebo 24rem\./);

      // S display: flex je justify-content aktivní — podtržení zmizí.
      await typeFile(page, 'styles.css', '.row {\n  display: flex;\n  justify-content: center;\n}');
      await page.waitForFunction(() => document.querySelectorAll('.pane--editor .cm-lintRange').length === 0, null, { timeout: 10000 });

      await typeFile(page, 'script.js', "console.log('karty');\n  nope();");
      const runtimeError = page.locator('.pane--editor .cm-lintRange-error');
      await runtimeError.waitFor({ timeout: 10000 });
      assert.equal(await runtimeError.first().textContent(), 'nope();');
      assert.deepEqual(problems, []);
    } finally {
      await page.close();
    }
  });
});
